import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { fetchAccount } from "@/lib/storage";
import { FileBrowser } from "@/components/storage/file-browser";
import { UploadDialog } from "@/components/storage/upload-dialog";

type StorageSession = {
  user?: {
    id?: string | null;
    sessionId?: string | null;
  } | null;
  accessToken?: string;
} | null;

export const metadata: Metadata = {
  title: "Files — Vault",
  description: "Browse, search, upload, and download your stored files in one clean workspace.",
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
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between border-b border-[#1f1f1f] pb-4">
        <div>
          <h1 className="text-xl font-semibold text-white">Files — Vault</h1>
          <p className="text-xs text-[#888888]">
            Browse, search, and manage your cloud workspace files.
          </p>
        </div>
        <UploadDialog />
      </div>

      <FileBrowser
        files={account?.files ?? []}
        isLoading={false}
        error={null}
      />
    </div>
  );
}