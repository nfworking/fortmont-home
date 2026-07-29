import { auth } from "@/lib/auth"
import { fetchAccountUser, formatDate, getInitials } from "@/lib/accountApi"
import { ProfileSection } from "@/components/account/Profilesection"

export default async function ProfileSettingsPage() {
  const session = await auth()
  const user = await fetchAccountUser(session)

  const sessionUser = session?.user as { name?: string | null; email?: string | null } | undefined
  const initials = getInitials(user?.displayName ?? user?.username ?? user?.email ?? sessionUser?.name)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">Account Home</h1>
      </div>

      <ProfileSection
        user={user}
        initials={initials}
        sessionName={sessionUser?.name}
        sessionEmail={sessionUser?.email}
        formatDate={formatDate}
      />
    </div>
  )
}