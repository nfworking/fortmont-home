import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { withBearerToken } from "@/lib/fetch-auth";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiHost = process.env.NEXT_PUBLIC_API_HOST?.replace(/\/$/, "");

  if (!apiHost) {
    return NextResponse.json({ error: "API host is not configured" }, { status: 500 });
  }

  try {
    const upstreamResponse = await fetch(
      `${apiHost}/api/users`,
      withBearerToken(
        {
          method: "GET",
          headers: { all: "true" },
          cache: "no-store",
        },
        session.accessToken,
      ),
    );

    const text = await upstreamResponse.text();

    return new NextResponse(text, {
      status: upstreamResponse.status,
      headers: {
        "Content-Type": upstreamResponse.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to load users" }, { status: 502 });
  }
}