import { PlatformApiKeysSection } from "@/components/account/PlatformApiKeysSection"

export default function PlatformApiKeysPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">Platform API Keys</h1>
      </div>

      <PlatformApiKeysSection />
    </div>
  )
}