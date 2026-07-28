"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ArrowLeft } from "lucide-react"
import { navigationConfig, type NavItem } from "@/lib/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export type { NavItem }

export function NavMain({
  items,
}: {
  items: NavItem[]

  isGithubLinked?: boolean
}) {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Quick focus search shortcut ('F' or '/')
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "f" || e.key === "F" || e.key === "/") &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Check for active nested section (e.g. /admin_ticketing)
  const activeNestedKey = Object.keys(navigationConfig.nested || {}).find((prefix) =>
    pathname.startsWith(prefix)
  )
  const nestedConfig = activeNestedKey ? navigationConfig.nested?.[activeNestedKey] : null
  const currentItems = nestedConfig ? nestedConfig.items : items

  const filteredItems = currentItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const renderMenuList = (itemList: NavItem[]) => (
    <SidebarMenu className="gap-1">
      {itemList.map((item) => {
        const isActive =
          pathname === item.url ||
          (item.url !== "/dashboard" && pathname.startsWith(item.url + "/"))

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              tooltip={item.title}
              isActive={isActive}
              onClick={item.onClick}
              className={`
                group relative flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-[#1f1f1f] text-white font-semibold"
                    : "text-[#a1a1a1] hover:bg-[#141414] hover:text-white"
                }
              `}
            >
              <Link href={item.url} className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`size-4 shrink-0 transition-colors ${
                      isActive ? "text-white" : "text-[#888888] group-hover:text-white"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.title}</span>
                </div>

                {item.badge && (
                  <span
                    className={`ml-auto flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                      item.badgeVariant === "orange"
                        ? "bg-[#38200d] text-[#f59e0b]"
                        : "bg-[#0e2a47] text-[#3b82f6]"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )

  return (
    <SidebarGroup className="px-3 py-2">
      <SidebarGroupContent className="flex flex-col gap-3">
        {/* Nested Header / Back Button if inside a section like Ticketing */}
        {nestedConfig && (
          <div className="mb-1 flex flex-col gap-1 border-b border-[#1f1f1f] pb-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-[#888888] hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-sm font-semibold text-white px-0.5 pt-1">
              {nestedConfig.parentTitle}
            </span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 size-4 text-[#666666]" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Find"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-md border border-[#222222] bg-[#0a0a0a] pl-8 pr-7 text-xs text-white placeholder-[#666666] outline-none transition-colors focus:border-[#444444]"
          />
          <kbd className="pointer-events-none absolute right-2 flex h-4 select-none items-center rounded border border-[#222222] bg-[#141414] px-1.5 font-mono text-[10px] text-[#666666]">
            F
          </kbd>
        </div>

        {/* Render Navigation List */}
        {filteredItems.length > 0 ? (
          renderMenuList(filteredItems)
        ) : (
          <p className="px-2 py-4 text-center text-xs text-[#666666]">
            No results found.
          </p>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}