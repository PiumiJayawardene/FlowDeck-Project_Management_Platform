import { LayoutDashboard, FolderKanban, Users, Settings, Building2, BarChart3 } from "lucide-react"

export interface NavItem {
  label: string
  path: string
  icon: typeof LayoutDashboard
}

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", path: "/projects", icon: FolderKanban },
  { label: "Teams", path: "/teams", icon: Users },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Organization", path: "/organization", icon: Building2 },
  { label: "Settings", path: "/settings", icon: Settings },
]