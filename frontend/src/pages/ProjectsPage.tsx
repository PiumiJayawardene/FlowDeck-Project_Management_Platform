import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useOrganization } from "@/context/OrganizationContext"
import { createProject, getProjectsForOrg } from "@/services/projectService"
import { getTeamsForOrg } from "@/services/teamService"
import type { Project } from "@/types/project.types"
import type{ Team } from "@/types/team.types"
import { statusLabels, statusColors, priorityLabels, priorityColors } from "@/config/projectMeta"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import EmptyState from "@/components/EmptyState"
import CardGridSkeleton from "@/components/CardGridSkeleton"
import { AnimatedGrid, AnimatedGridItem } from "@/components/AnimatedGrid"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, FolderKanban } from "lucide-react"

export default function ProjectsPage() {
  const { currentOrg } = useOrganization()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [teamId, setTeamId] = useState("")
  const [priority, setPriority] = useState("medium")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const loadData = async () => {
    if (!currentOrg) return
    setLoading(true)
    try {
      const [projectData, teamData] = await Promise.all([
        getProjectsForOrg(currentOrg._id),
        getTeamsForOrg(currentOrg._id),
      ])
      setProjects(projectData)
      setTeams(teamData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentOrg])

  const handleCreateProject = async () => {
    if (!currentOrg) return
    if (name.trim().length < 2) {
      setCreateError("Project name must be at least 2 characters")
      return
    }
    if (!teamId) {
      setCreateError("Please assign a team")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createProject(currentOrg._id, {
        name: name.trim(),
        description: description.trim(),
        teamId,
        priority,
      })
      setName("")
      setDescription("")
      setTeamId("")
      setPriority("medium")
      setDialogOpen(false)
      await loadData()
    } catch (error: any) {
      setCreateError(error?.response?.data?.message || "Failed to create project")
    } finally {
      setCreating(false)
    }
  }

  if (!currentOrg) {
    return (
      <p className="text-muted-foreground">
        Create an organization first to start building projects.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Projects</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <Button onClick={() => setDialogOpen(true)}>
    <Plus className="mr-2 h-4 w-4" />
    New project
  </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project name</Label>
                <Input
                  id="projectName"
                  placeholder="Website Redesign"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea
                  id="projectDescription"
                  placeholder="What is this project about?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
              <div className="space-y-2">
  <Label>Team</Label>

  <Select value={teamId} onValueChange={(value) => {
  if (value) setTeamId(value)
}}>
    <SelectTrigger>
      <SelectValue>
        {teamId
          ? teams.find((team) => team._id === teamId)?.name ?? "Assign a team"
          : "Assign a team"}
      </SelectValue>
    </SelectTrigger>

    <SelectContent>
      {teams.map((team) => (
        <SelectItem key={team._id} value={team._id}>
          {team.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => {
  if (value) setPriority(value)
}}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <Button className="w-full" onClick={handleCreateProject} disabled={creating}>
                {creating ? "Creating..." : "Create project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <CardGridSkeleton />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Create your first project to get started."
        />
      ) : (
        <AnimatedGrid className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <AnimatedGridItem key={project._id}>
              <Card
                className="h-full cursor-pointer transition-colors hover:border-primary"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    <Badge variant="secondary" className={priorityColors[project.priority]}>
                      {priorityLabels[project.priority]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description || "No description yet"}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className={statusColors[project.status]}>
                      {statusLabels[project.status]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {project.teamId.name}
                    </span>
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