import { type ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { AppSidebar } from "@/components/storage/app-sidebar";
import { UploadDialog } from "@/components/storage/upload-dialog";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function AppShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const session = await auth();

  const account = session?.user?.id
    ? {
        id: session.user.id,
        username: "mockuser",
        displayName: "Mock User",
        email: session.user.email ?? "mock@example.com",
        avatarUrl: null,
        storage: { usedBytes: 500000n, quotaBytes: 1000000000n },
      }
    : null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar account={account} usedBytes={Number(account?.storage?.usedBytes || 0)} quotaBytes={Number(account?.storage?.quotaBytes || 0)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-5" />
            <h1 className="font-display text-sm font-semibold tracking-tight">
              {title}
            </h1>
            <div className="ml-auto">
              <UploadDialog />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  );
}