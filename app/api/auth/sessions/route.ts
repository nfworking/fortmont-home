import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await prisma.session.findMany({
    where: {
      userId: session.user.id,
      revokedAt: null,
    },
    orderBy: [{ lastActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      sessionToken: true,
      userAgent: true,
      ipAddress: true,
      createdAt: true,
      lastActive: true,
    },
  });

  return NextResponse.json(sessions);
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("sessionId");
  const revokeOthers = url.searchParams.get("revokeOthers") === "true";

  if (revokeOthers) {
    await prisma.session.deleteMany({
      where: {
        userId: session.user.id,
        NOT: {
          sessionToken: session.user.sessionId ?? "",
        },
      },
    });

    return NextResponse.json({ ok: true });
  }

  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const ownedSession = await prisma.session.findFirst({
    where: {
      sessionToken: sessionId,
      userId: session.user.id,
    },
    select: { sessionToken: true },
  });

  if (!ownedSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  await prisma.session.delete({
    where: { sessionToken: sessionId },
  });

  return NextResponse.json({ ok: true });
}