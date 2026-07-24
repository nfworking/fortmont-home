import type { Prisma } from "@/app/generated/prisma/client";

/**
 * The exact shape returned by the account page Prisma query.
 * All section components import `AccountUser` from here instead of
 * declaring their own interfaces — this eliminates mismatches between
 * manually-written types and what Prisma actually returns.
 */
export type AccountUser = {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  role: string | null;
  avatarUrl: string | null;
  phone: string | null;
  isEntraUser: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoggedIn: Date | null;
  mailboxes: {
    id: string;
    email: string;
    isPrimary: boolean;
    provider: string | null;
  }[];
  deviceTokens: {
    id: string;
    platform: string | null;
    deviceName: string | null;
    deviceModelName: string | null;
    deviceBrand: string | null;
  }[];
  teams: {
    name: string;
    description: string | null;
  }[];
  githubLink: {
    username: string;
    profileUrl: string | null;
    avatarUrl: string | null;
    scope: string | null;
    linkedAt: Date;
  }[];
  storage: {
    quotaBytes: bigint;
    usedBytes: bigint;
  } | null;
};

// Convenience slice types so section components only declare what they use
export type AccountMailbox = AccountUser["mailboxes"][number];
export type AccountDeviceToken = AccountUser["deviceTokens"][number];
export type AccountGitHubLink = AccountUser["githubLink"][number];
export type AccountTeam = AccountUser["teams"][number];
export type AccountStorage = NonNullable<AccountUser["storage"]>;