// hooks/use-signed-url.ts
"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

import { withBearerToken } from "@/lib/fetch-auth";

export function useSignedUrl(fileId: string, enabled = true) {
  const { data: session } = useSession();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    fetch(
      `${process.env.API_HOST}/api/storage/download?fileId=${encodeURIComponent(fileId)}`,
      withBearerToken(undefined, session?.accessToken),
    )
      .then((r) => r.json())
      .then((d) => setUrl(d.downloadUrl ?? d.url ?? null))
      .finally(() => setLoading(false));
  }, [fileId, enabled, session?.accessToken]);

  return { url, loading };
}