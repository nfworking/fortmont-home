import { ApplicationShell1 } from "@/components/dashboard/application-shell1";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fetchAccount } from "@/lib/storage"; // Import fetchAccount
import { SessionProvider } from "next-auth/react";
import { TicketModalProvider } from "@/components/dashboard_res/ticket-modal-context";
import { redirect } from "next/navigation";

// Helper function to format bytes nicely (e.g. 1.2 GB)
function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session?.user?.id) {
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

  // Fetch Prisma user
  const userPromise = (userId || email || username)
    ? prisma.user.findFirst({
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
    : Promise.resolve(null);

  // Fetch Storage account info safely
  const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
  const storagePromise = fetchAccount(accessToken).catch(() => null);

  // Run queries in parallel
  const [user, account] = await Promise.all([userPromise, storagePromise]);

  // Calculate storage usage if account data exists
  let storageUsage = undefined;
  if (account) {
    const usedBytes = account.files.reduce((total, file) => total + Number(file.size || 0), 0);
    const quotaBytes = Number(account.storageLimit || 0);
    const percentage = quotaBytes > 0 ? Math.round((usedBytes / quotaBytes) * 100) : 0;

    storageUsage = {
      usedFormatted: formatBytes(usedBytes),
      quotaFormatted: formatBytes(quotaBytes),
      percentage,
    };
  }

  return (
    <div className="relative min-h-screen w-full">
      <SessionProvider session={session}>
        <TicketModalProvider>
          <ApplicationShell1
            storageUsage={storageUsage} // Pass storage usage prop here
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