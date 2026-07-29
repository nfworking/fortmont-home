import { auth } from "@/lib/auth"
import { SessionsSection } from "@/components/account/Sessionsection"

export default async function SessionsSettingsPage() {
  const session = await auth()
  const sessionUser = session?.user as { sessionId?: string | null } | undefined

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">Active Browser & App Sessions</h1>
      </div>

      <SessionsSection currentSessionId={sessionUser?.sessionId} />
    </div>
  )
}