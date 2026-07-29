import { auth } from "@/lib/auth"
import { fetchAccountUser } from "@/lib/accountApi"
import SecuritySection from "@/components/account/Securitysection"
import { NoAvailableToEntraUsers } from "@/components/account/NoAvaiabletoEntraUsers"

export default async function SecuritySettingsPage() {
  const session = await auth()
  const user = await fetchAccountUser(session)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">Security Settings</h1>
      </div>

      {user?.isEntraUser ? <NoAvailableToEntraUsers /> : <SecuritySection />}
    </div>
  )
}