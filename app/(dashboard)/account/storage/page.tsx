import { auth } from "@/lib/auth"
import { fetchAccountUser } from "@/lib/accountApi"
import { StorageSection } from "@/components/account/Storagesection"

export default async function StorageSettingsPage() {
  const session = await auth()
  const user = await fetchAccountUser(session)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">Storage Allocation</h1>
      </div>

      <StorageSection storage={user?.storage} />
    </div>
  )
}