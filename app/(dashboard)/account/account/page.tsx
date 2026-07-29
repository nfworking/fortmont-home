import { AccountSection } from "@/components/account/Accountsection"

export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">Account Preferences</h1>
      </div>

      <AccountSection />
    </div>
  )
}