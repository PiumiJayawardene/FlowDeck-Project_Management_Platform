import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useOrganization } from "@/context/OrganizationContext"
import { getOrgAnalytics } from "@/services/analyticsService"
import { getProjectsForOrg } from "@/services/projectService"
import type { OrgAnalytics } from "@/types/analytics.types"
import type { Project } from "@/types/project.types"
import { statusLabels, statusColors, priorityColors, priorityLabels } from "@/config/projectMeta"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import EmptyState from "@/components/EmptyState"
import { FolderKanban, ListChecks, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { currentOrg } = useOrganization()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState<OrgAnalytics | null>(null)
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!currentOrg) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const [analyticsData, projectsData] = await Promise.all([
          getOrgAnalytics(currentOrg._id),
          getProjectsForOrg(currentOrg._id),
        ])
        setAnalytics(analyticsData)
        setRecentProjects(projectsData.slice(0, 4))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentOrg])

  const completionRate =
    analytics && analytics.totalTasks > 0
      ? Math.round(((analytics.taskStatusBreakdown.done || 0) / analytics.totalTasks) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Welcome back, {user?.name}</h1>
        <p className="text-muted-foreground">Here's what's happening across your projects.</p>
      </div>

      {!currentOrg ? (
        <EmptyState
          icon={FolderKanban}
          title="No organization yet"
          description="Create an organization to start seeing your dashboard come to life."
        />
      ) : loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <FolderKanban className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Projects</p>
                  <p className="text-xl font-semibold text-foreground">
                    {analytics?.totalProjects ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
                  <ListChecks className="h-5 w-5 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                  <p className="text-xl font-semibold text-foreground">
                    {analytics?.totalTasks ?? 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 py-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                  <p className="text-xl font-semibold text-foreground">{completionRate}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Projects</CardTitle>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No projects yet
                </p>
              ) : (
                <div className="space-y-2">
                  {recentProjects.map((project) => (
                    <div
                      key={project._id}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{project.name}</p>
                        <p className="text-xs text-muted-foreground">{project.teamId.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={priorityColors[project.priority]}>
                          {priorityLabels[project.priority]}
                        </Badge>
                        <Badge variant="secondary" className={statusColors[project.status]}>
                          {statusLabels[project.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}