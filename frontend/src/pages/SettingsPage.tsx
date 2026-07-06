import { useAuth } from "@/context/AuthContext"
import { useOrganization } from "@/context/OrganizationContext"
import { useTheme } from "@/context/ThemeContext"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Building2,
  Shield,
  Moon,
  Sun,
  Info,
  LogOut,
  Lock,
} from "lucide-react"

export default function SettingsPage() {
  const { user, logout } = useAuth()
  const { currentOrg } = useOrganization()
  const { theme, toggleTheme } = useTheme()

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Settings
        </h1>
        <p className="text-muted-foreground">
          Manage your profile, organization and application preferences.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold text-foreground">
                  {user?.name}
                </p>

                <p className="text-sm text-muted-foreground">
                  {user?.email}
                </p>

                <Badge className="mt-2" variant="secondary">
                  {user?.role}
                </Badge>
              </div>
            </div>

            <Button disabled>
              Edit Profile
              <span className="ml-2 text-xs">(Coming Soon)</span>
            </Button>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Appearance
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Switch between light and dark mode.
            </p>

            <Button onClick={toggleTheme}>
              {theme === "light"
                ? "Switch to Dark Mode"
                : "Switch to Light Mode"}
            </Button>
          </CardContent>
        </Card>

        {/* Organization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {currentOrg ? (
              <>
                <div>
                  <p className="font-medium">
                    {currentOrg.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {currentOrg.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Members
                    </p>

                    <p className="text-xl font-semibold">
                      {currentOrg.members?.length ?? 0}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-muted-foreground">
                      Role
                    </p>

                    <p className="text-xl font-semibold capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">
                No organization selected.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <Button
              disabled
              variant="outline"
              className="w-full justify-start"
            >
              <Lock className="mr-2 h-4 w-4" />
              Change Password
              <span className="ml-auto text-xs text-muted-foreground">
                Coming Soon
              </span>
            </Button>

            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-2">
          <p className="font-medium">
            Project Management Platform
          </p>

          <p className="text-sm text-muted-foreground">
            Version 1.0.0
          </p>

          <p className="text-sm text-muted-foreground">
            Built with React, TypeScript, Node.js, Express, MongoDB,
            Tailwind CSS, shadcn/ui, Recharts, Framer Motion,
            Cloudinary and dnd-kit.
          </p>

          <p className="pt-2 text-xs text-muted-foreground">
            © 2026 All Rights Reserved.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}