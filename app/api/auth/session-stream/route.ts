import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const encoder = new TextEncoder();

function eventChunk(payload: unknown) {
  return encoder.encode(`data: ${JSON.stringify(payload)}\n\n`);
}

export async function GET(request: Request) {
  const session = await auth();

  const sessionId = session?.user?.sessionId?.trim();
  const userId = session?.user?.id?.trim();

  if (!userId || !sessionId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;

      const send = (payload: unknown) => {
        if (closed) return;
        controller.enqueue(eventChunk(payload));
      };

      send({ status: "connected" });

      const interval = setInterval(async () => {
        try {
          const activeSession = await prisma.session.findFirst({
            where: {
              sessionToken: sessionId,
              userId,
              revokedAt: null,
            },
            select: { sessionToken: true },
          });

          if (!activeSession) {
            send({ type: "revoked" });
            closed = true;
            clearInterval(interval);
            controller.close();
          }
        } catch {
          
        }
      }, 15000);

      const abortHandler = () => {
        closed = true;
        clearInterval(interval);
        controller.close();
      };

      request.signal.addEventListener("abort", abortHandler);
    },
    cancel() {
   
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}