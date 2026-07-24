import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
    user?: DefaultSession["user"] & {
      id: string;
      role?: string | null;
      sessionId?: string | null;
    };
  }

  interface User {
    role?: string | null;
    sessionId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    role?: string | null;
    sessionId?: string;
    error?: "RefreshAccessTokenError";
  }
}