import { ApplicationShell1 } from "@/components/dashboard/application-shell1";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {SessionProvider} from "next-auth/react"
import { TicketModalProvider } from "@/components/dashboard_res/ticket-modal-context";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  const sessionUser = session?.user as
    | {
        id?: string | null;
        name?: string | null;
        email?: string | null;
        image?: string | null;
      }
    | undefined;

  const userId = sessionUser?.id?.trim() ?? undefined;
  const email = session?.user?.email?.trim().toLowerCase();
  const username = session?.user?.name?.trim().toLowerCase();

  const user =
    userId || email || username
      ? await prisma.user.findFirst({
          where: {
            OR: [
              ...(userId ? [{ id: userId }] : []),
              ...(email ? [{ email }] : []),
              ...(username ? [{ email: username }] : []),
            ],
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        })
      : null;

  return (

      <div className="relative min-h-screen w-full">
            <SessionProvider session={session}>
      <TicketModalProvider>
        

      <ApplicationShell1 
        user={
          user
            ? {
                name: user.name ?? session?.user?.name ?? null,
                email: user.email ?? session?.user?.email ?? null,
                avatar: user.image ?? sessionUser?.image ?? null,
                isGithubLinked: false,
              }
            : session?.user ?? null
        }
      >
        {children}
      </ApplicationShell1>
      </TicketModalProvider>
      </SessionProvider>
    </div>
    
  );
}