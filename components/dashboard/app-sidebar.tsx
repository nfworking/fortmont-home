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

 const hasGithub =
  isGithubLinked ??
  user?.isGithubLinked ??
 
  false

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
      <Sidebar collapsible="offcanvas" {...props} className="h-full border-r border-[#1f1f1f] bg-[#0a0a0a]">
        <SidebarHeader className="border-b border-[#1f1f1f] p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild size="lg" className="hover:bg-[#141414]">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <div className="flex aspect-square size-7 items-center justify-center rounded-md bg-white text-black">
                    <Command className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="text-sm font-semibold text-white">Fortmont Home</span>
                    <span className="text-xs text-[#888888]">{user?.name || "Dashboard"}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="bg-[#0a0a0a]">
          <NavMain items={processedMainItems} isGithubLinked={hasGithub} />
        </SidebarContent>

        <SidebarFooter className="border-t border-[#1f1f1f] bg-[#0a0a0a] p-3">
          {isStorageSection && storageUsage && (
            <div className="flex flex-col gap-2 rounded-md border border-[#1f1f1f] bg-[#141414] p-2.5 text-xs">
              <div className="flex justify-between text-[#888888]">
                <span>Storage</span>
                <span className="font-mono text-white">{storageUsage.percentage}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-[#222222]">
                <div
                  className="h-1.5 rounded-full bg-white transition-all"
                  style={{ width: `${Math.min(storageUsage.percentage, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-[#666666]">
                {storageUsage.usedFormatted} of {storageUsage.quotaFormatted}
              </span>
              <p>Used {storageUsage.usedFormatted} out of {storageUsage.quotaFormatted}</p>
            </div>
          )}
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="border-[#222222] bg-[#0a0a0a] text-white sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-950/50">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
            </div>
            <DialogTitle className="text-xl">GitHub Account Required</DialogTitle>
            <DialogDescription className="text-[#888888]">
              You cannot access the GitHub dashboard settings until you link your GitHub account to your profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-[#222222] bg-transparent text-white hover:bg-[#1f1f1f]"
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