import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Metadata } from "next";
import React from "react";

import { auth } from "@/lib/auth";
import { withBearerToken } from "@/lib/fetch-auth";
import Link from "next/link";

import { AccountSettingsSidebar } from "@/components/account/Accountsettingssidebar";
import { ProfileSection } from "@/components/account/Profilesection";
import SecuritySection from "@/components/account/Securitysection";
import { PlatformApiKeysSection } from "@/components/account/PlatformApiKeysSection";
import { AccountSection } from "@/components/account/Accountsection";
import { MailboxesSection } from "@/components/account/Mailboxessection";
import { DevicesSection } from "@/components/account/Devicessection";
import { GitHubSection } from "@/components/account/Githubsection";
import { StorageSection } from "@/components/account/Storagesection";
import { SessionsSection } from "@/components/account/Sessionsection";
import DashboardPage from "@/components/account/StoragePage";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Layout, ArrowUpRightFromSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoAvailableToEntraUsers } from "@/components/account/NoAvaiabletoEntraUsers";
import type { AccountUser } from "@/components/account/types";

export const metadata: Metadata = {
  title: "Fortmont · Account",
  description: "Manage your Fortmont account settings.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function getInitials(value: string | null | undefined) {
  return (value ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type SectionKey =
  | "profile"
  | "account"
  | "security"
  | "mailboxes"
  | "devices"
  | "github"
  | "storage"
  | "storage-acc"
  | "sessions"
  | "platform-api";

const VALID_SECTIONS = new Set<SectionKey>([
  "profile",
  "account",
  "security",
  "mailboxes",
  "devices",
  "github",
  "storage",
  "storage-acc",
  "sessions",
  "platform-api",
]);

function resolveSection(raw: string | string[] | undefined): SectionKey {
  const s = Array.isArray(raw) ? raw[0] : raw;
  return VALID_SECTIONS.has(s as SectionKey) ? (s as SectionKey) : "profile";
}

interface PageProps {
  searchParams: Promise<{ section?: string | string[] }>;
}

type ApiUsersResponse = {
  id: string;
  username: string | null;
  displayName: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isEntraUser: boolean;
  phone: string | null;
  mailboxes?: {
    id: string;
    email: string;
    isPrimary: boolean;
    provider?: string | null;
  }[];
  deviceTokens?: {
    id: string;
    platform: string | null;
    createdAt?: string;
    deviceVersion?: string | null;
    deviceName: string | null;
    deviceModelName: string | null;
    deviceBrand: string | null;
  }[];
  teams?: {
    name: string;
    description: string | null;
  }[];
  githubLink?: {
    username: string;
    profileUrl: string | null;
    avatarUrl: string | null;
    scope: string | null;
    linkedAt: string;
  }[];
  sessions?: {
    lastActive: string;
  }[];
  storage?: {
    quotaBytes: number;
    usedBytes: number;
  } | null;
};

function toAccountUser(apiUser: ApiUsersResponse): AccountUser {
  const lastActive = apiUser.sessions
    ?.map((session) => new Date(session.lastActive))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return {
    id: apiUser.id,
    username: apiUser.username,
    displayName: apiUser.displayName,
    email: apiUser.email,
    role: null,
    avatarUrl: apiUser.githubLink?.[0]?.avatarUrl ?? null,
    phone: apiUser.phone,
    isEntraUser: apiUser.isEntraUser,
    isActive: apiUser.isActive,
    createdAt: new Date(apiUser.createdAt),
    updatedAt: new Date(apiUser.updatedAt),
    lastLoggedIn: lastActive ?? null,
    mailboxes: (apiUser.mailboxes ?? []).map((mailbox) => ({
      id: mailbox.id,
      email: mailbox.email,
      isPrimary: mailbox.isPrimary,
      provider: mailbox.provider ?? "Exchange",
    })),
    deviceTokens: (apiUser.deviceTokens ?? []).map((device) => ({
      id: device.id,
      platform: device.platform,
      deviceName: device.deviceName,
      deviceModelName: device.deviceModelName,
      deviceBrand: device.deviceBrand,
    })),
    teams: apiUser.teams ?? [],
    githubLink: (apiUser.githubLink ?? []).map((link) => ({
      username: link.username,
      profileUrl: link.profileUrl,
      avatarUrl: link.avatarUrl,
      scope: link.scope,
      linkedAt: new Date(link.linkedAt),
    })),
    storage: apiUser.storage
      ? {
          quotaBytes: BigInt(apiUser.storage.quotaBytes),
          usedBytes: BigInt(apiUser.storage.usedBytes),
        }
      : null,
  };
}

export default async function AccountPage({
  searchParams,
}: PageProps): Promise<React.ReactElement> {
  const resolvedSearchParams = await searchParams;

  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const sessionUser = session.user as {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    username?: string | null;
    sub?: string | null;
    sessionId?: string | null;
  };

  const apiBase = process.env.NEXT_PUBLIC_API_HOST?.replace(/\/$/, "") ?? "";
  const usersUrl = `${apiBase}/api/users`;
  const accessToken = (session as { accessToken?: string | null }).accessToken;

  let user: AccountUser | null = null;

  try {
    const res = await fetch(usersUrl, {
      method: "GET",
      cache: "no-store",
      ...withBearerToken(
        {
          headers: { "Content-Type": "application/json" },
        },
        accessToken ?? undefined,
      ),
    });

    if (res.ok) {
      const payload = (await res.json()) as ApiUsersResponse;
      user = toAccountUser(payload);
    } else {
      console.error("Failed to fetch /api/users:", res.status, res.statusText);
    }
  } catch (err) {
    console.error("Error fetching /api/users:", err);
  }


  const activeSection = resolveSection(resolvedSearchParams.section);
  const initials = getInitials(
    user?.displayName ?? user?.username ?? user?.email ?? sessionUser.name,
  );

  function renderSection() {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSection
            user={user}
            initials={initials}
            sessionName={sessionUser.name}
            sessionEmail={sessionUser.email}
            formatDate={formatDate}
          />
        );
      case "account":
        return <AccountSection />;
      case "security":
        if (user?.isEntraUser) {
          return <NoAvailableToEntraUsers />;
        }

        return <SecuritySection />;
      case "mailboxes":
        return <MailboxesSection mailboxes={user?.mailboxes ?? []} />;
      case "devices":
        return <DevicesSection deviceTokens={user?.deviceTokens ?? []} />;
      case "github":
        return <GitHubSection githubLink={user?.githubLink ?? []} />;
      case "storage":
        return <StorageSection storage={user?.storage} />;
      case "storage-acc":
        return <DashboardPage />;
      case "sessions":
        return <SessionsSection currentSessionId={sessionUser.sessionId} />;
      case "platform-api":
        return <PlatformApiKeysSection />;
    }
  }


  return (
    <main className="flex flex-1 flex-col gap-0 p-4 md:p-6">

      <div className="mb-10 space-y-1">
        <div className="flex justify-end">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="gap-1.5 ml-2" asChild>
            <Link href="/dashboard">
              <Layout className="h-3.5 w-3.5" />
              Return to dashboard
              <ArrowUpRightFromSquare className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
      </div>


      <div className="flex gap-8 items-start">

        <Suspense fallback={null}>
          <AccountSettingsSidebar
            displayName={user?.displayName ?? sessionUser.name}
            username={user?.username}
            email={user?.email ?? sessionUser.email}
            avatarUrl={user?.avatarUrl}
            initials={initials}
          />
        </Suspense>

        <div className="min-w-0 flex-1">{renderSection()}</div>
      </div>
    </main>
  );
}