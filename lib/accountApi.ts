// lib/account-api.ts
import { auth } from "@/lib/auth"
import { withBearerToken } from "@/lib/fetch-auth"
import type { AccountUser } from "@/components/account/types"

type ApiUsersResponse = {
  id: string
  username: string | null
  displayName: string | null
  email: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  isEntraUser: boolean
  phone: string | null
  mailboxes?: {
    id: string
    email: string
    isPrimary: boolean
    provider?: string | null
  }[]
  deviceTokens?: {
    id: string
    platform: string | null
    createdAt?: string
    deviceVersion?: string | null
    deviceName: string | null
    deviceModelName: string | null
    deviceBrand: string | null
  }[]
  teams?: {
    name: string
    description: string | null
  }[]
  githubLink?: {
    username: string
    profileUrl: string | null
    avatarUrl: string | null
    scope: string | null
    linkedAt: string
  }[]
  sessions?: {
    lastActive: string
  }[]
  storage?: {
    quotaBytes: number
    usedBytes: number
  } | null
}

export function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-AU", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value)
}

export function getInitials(value: string | null | undefined) {
  return (value ?? "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export function toAccountUser(apiUser: ApiUsersResponse): AccountUser {
  const lastActive = apiUser.sessions
    ?.map((session) => new Date(session.lastActive))
    .sort((a, b) => b.getTime() - a.getTime())[0]

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
  }
}

export async function fetchAccountUser(session: { user?: { name?: string | null; email?: string | null }; accessToken?: string } | null): Promise<AccountUser | null> {
  if (!session?.user) return null

  const apiBase = process.env.NEXT_PUBLIC_API_HOST?.replace(/\/$/, "") ?? ""
  const usersUrl = `${apiBase}/api/users`
  const accessToken = session.accessToken

  try {
    const res = await fetch(usersUrl, {
      method: "GET",
      cache: "no-store",
      ...withBearerToken(
        { headers: { "Content-Type": "application/json" } },
        accessToken ?? undefined
      ),
    })

    if (res.ok) {
      const payload = (await res.json()) as ApiUsersResponse
      return toAccountUser(payload)
    }
  } catch (err) {
    console.error("Error fetching /api/users:", err)
  }

  return null
}