import { TicketDashboard } from '@/components/ticketing/admin/ticket-dashboard';
import { headers } from "next/headers";
import { PageTransition } from '@/components/ui/page-transition';


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
  const users = await usersRes.json();
  

  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }));

  return (
    <PageTransition>
      <TicketDashboard tickets={tickets} users={serializedUsers} />
    </PageTransition>
  );
}
