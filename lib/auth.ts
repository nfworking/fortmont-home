import { randomUUID } from "crypto";

import NextAuth, { type NextAuthConfig, type Session } from "next-auth";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";

import { prisma } from "@/lib/prisma";
import { fetchFortmontUserMe } from "@/lib/oauth";

type FortmontProfile = {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string;
};

const issuer = (process.env.FORTMONT_ISSUER ?? "").replace(/\/$/, "");
const fortmontClientId = process.env.FORTMONT_CLIENT_ID ?? process.env.AUTH_FORTMONT_ID;
const fortmontClientSecret = process.env.FORTMONT_CLIENT_SECRET ?? process.env.AUTH_FORTMONT_SECRET;
const sessionMaxAgeSeconds = 30 * 24 * 60 * 60;

if (!issuer) {
  console.warn("[auth] FORTMONT_ISSUER is not set; OAuth login will be unavailable");
}

function ensureOfflineAccessScope(scopeValue: string) {
  const scopes = scopeValue
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter(Boolean);

  if (!scopes.includes("offline_access")) {
    scopes.push("offline_access");
  }

  return Array.from(new Set(scopes)).join(" ");
}

const fortmontScopes = ensureOfflineAccessScope(
  process.env.FORTMONT_SCOPES?.trim() || "openid profile email"
);

const fortmontProvider = {
  id: "fortmont",
  name: "Fortmont",
  type: "oauth",
  issuer,
  wellKnown: `${issuer}/.well-known/openid-configuration`,
  authorization: {
    url: `${issuer}/api/oauth/authorize`,
    params: {
      scope: fortmontScopes,
      prompt: "login",
    },
  },
  token: `${issuer}/api/oauth/token`,
  userinfo: `${issuer}/api/oauth/userinfo`,
  clientId: fortmontClientId,
  clientSecret: fortmontClientSecret,
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
  checks: ["pkce", "state"],
  profile(profile: Record<string, unknown>) {
    const fortmontProfile = profile as FortmontProfile;

    return {
      id: fortmontProfile.sub,
      email: fortmontProfile.email,
      name: fortmontProfile.name,
      image: fortmontProfile.picture,
      role: fortmontProfile.role,
    };
  },
} as Provider;

async function refreshFortmontAccessToken(token: {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpiresAt?: number;
  role?: string | null;
  sub?: string;
  jti?: string;
  sessionId?: string;
}) {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }

  try {
    const response = await fetch(`${issuer}/api/oauth/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
        client_id: fortmontClientId ?? "",
        client_secret: fortmontClientSecret ?? "",
      }),
    });

    const data = (await response.json()) as {
      access_token?: string;
      expires_in?: number;
      refresh_token?: string;
    };

    if (!response.ok || !data.access_token) {
      throw data;
    }

    const refreshedToken = {
      ...token,
      accessToken: data.access_token,
      accessTokenExpiresAt: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };

    if (token.sub) {
      await prisma.account.updateMany({
        where: {
          userId: token.sub,
          provider: "fortmont",
        },
        data: {
          access_token: refreshedToken.accessToken,
          refresh_token: refreshedToken.refreshToken,
          expires_at: refreshedToken.accessTokenExpiresAt,
        },
      });
    }

    return refreshedToken;
  } catch {
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

function sessionExpiresAt() {
  return new Date(Date.now() + sessionMaxAgeSeconds * 1000);
}

function getRequestMetadata(request?: Request) {
  return {
    userAgent: request?.headers.get("user-agent") ?? null,
    ipAddress:
      request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request?.headers.get("x-real-ip") ??
      null,
  };
}

const nextAuth = NextAuth((request) => {
  const requestMetadata = getRequestMetadata(request);

  const authOptions: NextAuthConfig = {
    adapter: PrismaAdapter(prisma),
    providers: [fortmontProvider],
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    trustHost: true,
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, account, profile }) {
        token.sessionId = token.sessionId ?? token.jti ?? token.sub ?? randomUUID();

        if (account?.access_token) {
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token ?? token.refreshToken;
          token.accessTokenExpiresAt = account.expires_at ?? undefined;

          if (token.sub) {
            await prisma.account.updateMany({
              where: {
                userId: token.sub,
                provider: "fortmont",
              },
              data: {
                access_token: account.access_token,
                refresh_token: account.refresh_token ?? token.refreshToken,
                expires_at: account.expires_at ?? undefined,
              },
            });
          }
        }

        if (token.sub && token.sessionId) {
          const existingSession = await prisma.session.findUnique({
            where: { sessionToken: token.sessionId },
            select: { sessionToken: true, revokedAt: true },
          });

          if (!existingSession && account) {
            await prisma.session.create({
              data: {
                sessionToken: token.sessionId,
                userId: token.sub,
                expires: sessionExpiresAt(),
                lastActive: new Date(),
                userAgent: requestMetadata.userAgent,
                ipAddress: requestMetadata.ipAddress,
              },
            });
          } else if (existingSession && !existingSession.revokedAt) {
            await prisma.session.update({
              where: { sessionToken: token.sessionId },
              data: {
                lastActive: new Date(),
              },
            });
          } else if (existingSession?.revokedAt) {
            return { ...token, error: "RefreshAccessTokenError" as const };
          }
        }

        if (profile && "role" in profile) {
          token.role = (profile as FortmontProfile).role ?? token.role ?? null;
        }

        if (!token.role && typeof token.accessToken === "string") {
          const liveUser = await fetchFortmontUserMe(token.accessToken);
          token.role = liveUser?.role ?? token.role ?? null;
        }

        if (
          typeof token.accessTokenExpiresAt === "number" &&
          token.accessTokenExpiresAt > 0 &&
          token.accessTokenExpiresAt * 1000 <= Date.now()
        ) {
          return refreshFortmontAccessToken(token);
        }

        return token;
      },
      async session({ session, token }) {
        if (!token?.sub || !token.sessionId || !session.user) {
          return null as never;
        }

        const currentSession = await prisma.session.findUnique({
          where: { sessionToken: token.sessionId },
          select: { sessionToken: true, revokedAt: true },
        });

        if (!currentSession || currentSession.revokedAt) {
          return null as never;
        }

        session.user.id = token.sub;
        session.user.role = token.role ?? null;
        session.user.sessionId = token.sessionId ?? token.jti ?? token.sub ?? null;

        const account = await prisma.account.findFirst({
          where: {
            userId: token.sub,
            provider: "fortmont",
          },
          select: {
            access_token: true,
            refresh_token: true,
          },
        });

        if (typeof token.accessToken === "string") {
          session.accessToken = token.accessToken;
        } else if (typeof account?.access_token === "string") {
          session.accessToken = account.access_token;
        }

        if (typeof token.refreshToken === "string") {
          session.refreshToken = token.refreshToken;
        } else if (typeof account?.refresh_token === "string") {
          session.refreshToken = account.refresh_token;
        }

        if (token.error) {
          session.error = token.error;
        }

        return session;
      },
    },
    events: {
      async signOut(message) {
        const payload = message as {
          token?: { sessionId?: string; jti?: string; sub?: string };
        };

        const sessionId =
          payload.token?.sessionId ?? payload.token?.jti ?? payload.token?.sub ?? null;

        if (!sessionId) {
          return;
        }

        await prisma.session.deleteMany({
          where: { sessionToken: sessionId },
        });
      },
    },
  };

  return authOptions;
});

export const { handlers, signIn, signOut } = nextAuth;

export async function auth(...args: unknown[]): Promise<Session | null> {
  const authHandler = nextAuth.auth as (...callArgs: unknown[]) => Promise<Session | null>;
  const session = await authHandler(...args);

  if (session?.user?.sessionId) {
    const activeSession = await prisma.session.findUnique({
      where: { sessionToken: session.user.sessionId },
      select: { sessionToken: true, revokedAt: true },
    });

    if (!activeSession || activeSession.revokedAt) {
      return null;
    }
  }

  return session;
}