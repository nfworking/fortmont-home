import { TicketDashboard } from '@/components/ticketing/admin/ticket-dashboard';
import { headers } from "next/headers";
import { PageTransition } from '@/components/ui/page-transition';

import type { User } from '@/components/ticketing/admin/ticket';

interface ApiUser {
  id?: string;
  username?: string;
  displayName?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  isEntraUser?: boolean | null;
  passwordHash?: string;
  isActive?: boolean;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  onboarded?: boolean | null;
  [key: string]: unknown;
}

export default async function DashboardPage() {
  const cookie = (await headers()).get("cookie");

  const res = await fetch(
    `${process.env.API_HOST}/api/ticketing/get/ticket`,
    {
      headers: {
        cookie: cookie ?? "",
      },
      cache: "no-store",
    }
  );

  const tickets = await res.json();
  const usersRes = await fetch(
    `${process.env.API_HOST}/api/ticketing/get/users`,
    {
      headers: {
        cookie: cookie ?? "",
      },
      cache: "no-store",
    }
  );
  const users = (await usersRes.json()) as ApiUser[];

  const serializedUsers: User[] = users.map((user) => ({
    id: user.id ?? "",
    username: user.username ?? "",
    displayName: user.displayName ?? null,
    email: user.email ?? null,
    role: user.role ?? null,
    avatarUrl: user.avatarUrl ?? null,
    phone: user.phone ?? null,
    isEntraUser: user.isEntraUser ?? false,
    passwordHash: user.passwordHash,
    isActive: user.isActive ?? true,
    createdAt: user.createdAt instanceof Date
      ? user.createdAt.toISOString()
      : user.createdAt ?? new Date().toISOString(),
    updatedAt: user.updatedAt instanceof Date
      ? user.updatedAt.toISOString()
      : user.updatedAt ?? new Date().toISOString(),
    onboarded: user.onboarded ?? null,
  }));

  return (
    <PageTransition>
      <TicketDashboard tickets={tickets} users={serializedUsers} />
    </PageTransition>
  );
}
