// app/(dashboard)/dashboard/settings/github/page.tsx
import { auth } from "@/lib/auth"
import { fetchAccountUser } from "@/lib/accountApi"
import { GitHubSection } from "@/components/account/Githubsection"

interface GitHubSettingsPageProps {
  searchParams: Promise<{
    code?: string
    state?: string
    error?: string
    error_description?: string
  }>
}

export default async function GitHubSettingsPage({ searchParams }: GitHubSettingsPageProps) {
  const session = await auth()
  const user = await fetchAccountUser(session)
  
  // Await searchParams in Next.js 15+
  const params = await searchParams

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="border-b border-border/40 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</p>
        <h1 className="text-xl font-semibold text-foreground">GitHub Integration</h1>
      </div>

      {/* Pass searchParams so GitHubSection can handle code exchange or show error toasts */}
      <GitHubSection 
        githubLink={user?.githubLink ?? []} 
        callbackParams={params}
      />
    </div>
  )
}