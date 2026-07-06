import { useEffect, useState } from "react"
import { useOrganization } from "@/context/OrganizationContext"
import { createTeam, getTeamsForOrg } from "@/services/teamService"
import type { Team } from "@/types/team.types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import EmptyState from "@/components/EmptyState"
import CardGridSkeleton from "@/components/CardGridSkeleton"
import { AnimatedGrid, AnimatedGridItem } from "@/components/AnimatedGrid"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Users } from "lucide-react"

export default function TeamsPage() {
  const { currentOrg } = useOrganization()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [teamName, setTeamName] = useState("")
  const [teamDescription, setTeamDescription] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadTeams = async () => {
    if (!currentOrg) return
    setLoading(true)
    try {
      const data = await getTeamsForOrg(currentOrg._id)
      setTeams(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeams()
  }, [currentOrg])

  const handleCreateTeam = async () => {
    if (!currentOrg) return
    if (teamName.trim().length < 2) {
      setCreateError("Team name must be at least 2 characters")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createTeam(currentOrg._id, teamName.trim(), teamDescription.trim())
      setTeamName("")
      setTeamDescription("")
      setDialogOpen(false)
      await loadTeams()
    } catch (error: any) {
      setCreateError(error?.response?.data?.message || "Failed to create team")
    } finally {
      setCreating(false)
    }
  }

  if (!currentOrg) {
    return (
      <p className="text-muted-foreground">
        Create an organization first to start building teams.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Teams</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger >
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="teamName">Team name</Label>
                <Input
                  id="teamName"
                  placeholder="Engineering"
                  value={teamName}
                  onChange={(event) => setTeamName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  placeholder="What does this team work on?"
                  value={teamDescription}
                  onChange={(event) => setTeamDescription(event.target.value)}
                />
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <Button className="w-full" onClick={handleCreateTeam} disabled={creating}>
                {creating ? "Creating..." : "Create team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

     {loading ? (
        <CardGridSkeleton />
      ) : teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams yet"
          description="Create your first team to start assigning projects."
        />
      ) : (
        <AnimatedGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <AnimatedGridItem key={team._id}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">{team.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {team.description || "No description yet"}
                  </p>
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((member) => {
                      const initials = member.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                      return (
                        <Avatar key={member._id} className="h-8 w-8 border-2 border-card">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </AnimatedGridItem>
          ))}
        </AnimatedGrid>
      )}
    </div>
  )
}