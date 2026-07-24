export function withBearerToken(init: RequestInit | undefined, accessToken?: string): RequestInit {
  const headers = new Headers(init?.headers ?? undefined);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return {
    ...init,
    headers,
  };
}