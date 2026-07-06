import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getProject, updateProject, deleteProject } from "@/services/projectService"
import type { Project, ProjectStatus } from "@/types/project.types"
import TasksSection from "@/components/tasks/TasksSection"
import {
  statusLabels,
  statusColors,
  priorityLabels,
  priorityColors,
} from "@/config/projectMeta"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ArrowLeft, Trash2 } from "lucide-react"

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProject = async () => {
    if (!projectId) return

    setLoading(true)

    try {
      const data = await getProject(projectId)
      setProject(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProject()
  }, [projectId])

  const handleStatusChange = async (status: string) => {
    if (!projectId) return

    const updated = await updateProject(projectId, {
      status: status as ProjectStatus,
    })

    setProject(updated)
  }

  const handleDelete = async () => {
    if (!projectId) return

    await deleteProject(projectId)
    navigate("/projects")
  }

  if (loading) {
    return (
      <p className="text-muted-foreground">
        Loading project...
      </p>
    )
  }

  if (!project) {
    return (
      <p className="text-muted-foreground">
        Project not found.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/projects")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to projects
      </Button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {project.name}
          </h1>

          <p className="mt-1 text-muted-foreground">
            {project.description || "No description yet"}
          </p>
        </div>

        <Button
          variant="outline"
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Status
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Select
              items={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
              value={project.status}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Priority
            </CardTitle>
          </CardHeader>

          <CardContent>
            <Badge
              variant="secondary"
              className={priorityColors[project.priority]}
            >
              {priorityLabels[project.priority]}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Team
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-foreground">
              {project.teamId?.name ?? "No team"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-sm text-muted-foreground">
              Created by
            </span>

            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {typeof project.createdBy === "object" &&
                  project.createdBy?.name
                    ? project.createdBy.name
                        .substring(0, 2)
                        .toUpperCase()
                    : "?"}
                </AvatarFallback>
              </Avatar>

              <span className="text-sm text-foreground">
                {typeof project.createdBy === "object"
                  ? project.createdBy.name
                  : "Unknown user"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Created on
            </span>

            <span className="text-sm text-foreground">
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      <TasksSection
  projectId={project._id}
  teamMembers={project.teamId.members || []}
/>
    </div>
  )
}