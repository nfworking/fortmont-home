import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();

  if (!session?.user?.sessionId || !session.user.id) {
    return NextResponse.json({ active: false }, { status: 401 });
  }

  const activeSession = await prisma.session.findFirst({
    where: {
      sessionToken: session.user.sessionId,
      userId: session.user.id,
      revokedAt: null,
    },
    select: { sessionToken: true },
  });

  return NextResponse.json({ active: Boolean(activeSession) });
}