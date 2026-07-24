import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { fetchAccount } from "@/lib/storage";
import { AppShell } from "@/components/storage/app-shell";
import { FileBrowser } from "@/components/storage/file-browser";

type StorageSession = {
  user?: {
    id?: string | null;
    sessionId?: string | null;
  } | null;
  accessToken?: string;
} | null;

export const metadata: Metadata = {
  title: "Files — Vault",
  description: "Browse, search, upload, and download your stored files in one clean black & white workspace.",
  openGraph: {
    title: "Files — Vault",
    description: "Your modern cloud storage workspace.",
  },
};

export default async function FilesPage() {
  const session = (await auth()) as StorageSession;
  const account = session?.user?.id
    ? await fetchAccount(session.accessToken).catch((error) => {
        console.error("Error fetching storage account:", error);
        return null;
      })
    : null;

  return (
    <AppShell title="Files" account={account}>
      <FileBrowser
        files={account?.files ?? []}
        isLoading={false}
        error={null}
      />
    </AppShell>
  );
}