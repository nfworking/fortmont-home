"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/common/nav-main"
import { useNavigationConfig } from "@/lib/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Command, AlertTriangle } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user?: {
    name?: string | null
    email?: string | null
    avatar?: string | null
    isGithubLinked?: boolean | null
  } | null
  isGithubLinked?: boolean
  storageUsage?: {
    usedFormatted: string
    quotaFormatted: string
    percentage: number
  }
}

export function AppSidebar({ user, isGithubLinked = false, storageUsage, ...props }: AppSidebarProps) {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const pathname = usePathname()
  const isStorageSection = pathname.startsWith("/my-storage")

  const hasGithub = isGithubLinked ?? user?.isGithubLinked ?? false

  const navigationConfig = useNavigationConfig()
  const processedMainItems = navigationConfig.main.map((item) => {
    if (item.requiresGithub && !hasGithub) {
      return {
        ...item,
        onClick: (e: React.MouseEvent) => {
          e.preventDefault()
          setIsDialogOpen(true)
        },
      }
    }
    return item
  })

  return (
    <>
      <Sidebar
        collapsible="offcanvas"
        {...props}
        className="h-full border-r border-sidebar-border bg-sidebar rounded-r-xl overflow-hidden"
      >
        <SidebarHeader className="border-b border-sidebar-border p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Command className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-semibold text-sidebar-foreground">Fortmont Home</span>
                    <span className="text-xs text-muted-foreground">{user?.name || "Dashboard"}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="bg-sidebar">
          <NavMain items={processedMainItems} isGithubLinked={hasGithub} />
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border bg-sidebar p-3">
          {isStorageSection && storageUsage && (
            <div className="flex flex-col gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 p-2.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Storage</span>
                <span className="font-mono text-foreground">{storageUsage.percentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-secondary">
                <div
                  className="h-1.5 rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {storageUsage.usedFormatted} of {storageUsage.quotaFormatted}
              </span>
            </div>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-border bg-background text-foreground sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl">GitHub Account Required</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              You cannot access the GitHub dashboard settings until you link your GitHub account to your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button asChild onClick={() => setIsDialogOpen(false)}>
              <Link href="/dashboard/settings/accounts">Link Account Now</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}