import * as React from "react"
import {
  GitFork,
  User,
  Sliders,
  Shield,
  Smartphone,
  Key,
  Code,
  CommandIcon,
  GlobeLock,
  CloudIcon,
  LayoutDashboardIcon,
  MailIcon,
  NetworkIcon,
  Database,
  EthernetPort,
  Ticket,
  Folder,
  Clock,
  Users,
  Trash2,
} from "lucide-react"

export interface NavItem {
  title: string
  url: string
  icon?: React.ReactNode
  badge?: string | number
  badgeVariant?: "orange" | "blue"
  section?: number
  requiresGithub?: boolean
  onClick?: (e: React.MouseEvent) => void
}

export interface NavigationConfig {
  main: NavItem[]
  nested?: Record<string, {
    parentTitle: string
    parentUrl: string
    items: NavItem[]
  }>
}

export const navigationConfig: NavigationConfig = {
  main: [
    { title: "Dashboard", url: "/dashboard", icon: <LayoutDashboardIcon />, section: 1 },
    { title: "DNS Records", url: "/dashboard/dns", icon: <GlobeLock />, section: 1 },
    { title: "Proxy", url: "/dashboard/proxy", icon: <NetworkIcon />, section: 1 },
    { title: "SSL Certificates", url: "/dashboard/certs", icon: <GlobeLock />, section: 1 },
    { title: "Azure", url: "/dashboard/entra", icon: <CloudIcon />, section: 1 },
    { title: "My Github", url: "/dashboard/mygithub", icon: <GitFork />, section: 1, requiresGithub: true },
    { title: "My Storage", url: "/my-storage", icon: <Database />, section: 1, badge: "19", badgeVariant: "orange" },
    { title: "Unifi", url: "/dashboard/unifi", icon: <EthernetPort />, section: 1 },
    { title: "Tickets", url: "/admin_ticketing/dashboard", icon: <CommandIcon />, section: 1 },
    { title: "Webmail", url: "/mail", icon: <MailIcon />, section: 1 },
    { title: "Apps", url: "/apps", icon: <CommandIcon />, section: 1, badge: "Beta", badgeVariant: "blue" },
  ],
  nested: {
    "/my-storage": {
      parentTitle: "Storage Vault",
      parentUrl: "/my-storage",
      items: [
        { title: "All Files", url: "/my-storage", icon: <Folder />, section: 1 },
        { title: "Recent Uploads", url: "/my-storage/recent", icon: <Clock />, section: 1 },
        { title: "Shared", url: "/my-storage/shared", icon: <Users />, section: 1 },
        { title: "Trash", url: "/my-storage/trash", icon: <Trash2 />, section: 2 },
      ],
    },
    "/admin_ticketing": {
      parentTitle: "Ticketing",
      parentUrl: "/admin_ticketing/dashboard",
      items: [
        { title: "Dashboard", url: "/admin_ticketing/dashboard", icon: <LayoutDashboardIcon />, section: 1 },
        { title: "Tickets", url: "/admin_ticketing/tickets", icon: <Ticket />, section: 1, badge: "12", badgeVariant: "orange" },
      ],
    },
    "/account": {
    parentTitle: "Account Home",
    parentUrl: "/account",
    items: [
      { title: "Account Home", url: "/account", icon: <User />, section: 1 },
      { title: "Account", url: "/account/account", icon: <Sliders />, section: 1 },
      { title: "Security", url: "/account/security", icon: <Shield />, section: 1 },
      { title: "Mailboxes", url: "/account/mailboxes", icon: <MailIcon />, section: 1 },
      { title: "Devices", url: "/account/devices", icon: <Smartphone />, section: 1 },
      { title: "GitHub Link", url: "/account/github", icon: <GitFork />, section: 1 },
      { title: "Storage", url: "/account/storage", icon: <Database />, section: 1 },
      { title: "Storage Account", url: "/account/storage-acc", icon: <Database />, section: 1 },
      { title: "Sessions", url: "/account/sessions", icon: <Key />, section: 1 },
      { title: "API Keys", url: "/account/platform-api", icon: <Code />, section: 1 },
    ],
  },
  },
}