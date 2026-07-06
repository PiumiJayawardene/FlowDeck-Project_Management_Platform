import { useState } from "react"
import { useOrganization } from "@/context/OrganizationContext"
import { createOrganization, inviteMember, removeMember } from "@/services/organizationService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, UserPlus } from "lucide-react"

export default function OrganizationPage() {
  const { currentOrg, loading, refreshOrganizations } = useOrganization()
  const [orgName, setOrgName] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("member")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleCreateOrg = async () => {
    if (orgName.trim().length < 2) {
      setCreateError("Organization name must be at least 2 characters")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createOrganization(orgName.trim())
      await refreshOrganizations()
    } catch (error: any) {
      setCreateError(error?.response?.data?.message || "Failed to create organization")
    } finally {
      setCreating(false)
    }
  }

  const handleInvite = async () => {
    if (!currentOrg) return
    setInviting(true)
    setInviteError(null)
    try {
      await inviteMember(currentOrg._id, inviteEmail.trim(), inviteRole)
      await refreshOrganizations()
      setInviteEmail("")
      setDialogOpen(false)
    } catch (error: any) {
      setInviteError(error?.response?.data?.message || "Failed to invite member")
    } finally {
      setInviting(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!currentOrg) return
    await removeMember(currentOrg._id, userId)
    await refreshOrganizations()
  }

  if (loading) {
    return <p className="text-muted-foreground">Loading...</p>
  }

  if (!currentOrg) {
    return (
      <div className="flex justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create your organization</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                placeholder="Acme Inc."
                value={orgName}
                onChange={(event) => setOrgName(event.target.value)}
              />
              {createError && <p className="text-sm text-destructive">{createError}</p>}
            </div>
            <Button className="w-full" onClick={handleCreateOrg} disabled={creating}>
              {creating ? "Creating..." : "Create organization"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{currentOrg.name}</h1>
          <p className="text-muted-foreground">
            {currentOrg.members.length}{" "}
            {currentOrg.members.length === 1 ? "member" : "members"}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
  <Button>
    <UserPlus className="mr-2 h-4 w-4" />
    Invite member
  </Button>
</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Email address</Label>
                <Input
                  id="inviteEmail"
                  type="email"
                  placeholder="teammate@example.com"
                  value={inviteEmail}
                  onChange={(event) => setInviteEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
               <Select
  value={inviteRole}
  onValueChange={(value) => {
    if (value) setInviteRole(value)
  }}
>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {inviteError && <p className="text-sm text-destructive">{inviteError}</p>}
              <Button className="w-full" onClick={handleInvite} disabled={inviting}>
                {inviting ? "Sending invite..." : "Send invite"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentOrg.members.map((member) => {
            const initials = member.user.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()

            return (
              <div
                key={member.user._id}
                className="flex items-center justify-between rounded-xl border border-border px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.user.name}</p>
                    <p className="text-xs text-muted-foreground">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {member.role}
                  </Badge>
                  {member.user._id !== currentOrg.ownerId && (
                    <button
                      onClick={() => handleRemoveMember(member.user._id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}