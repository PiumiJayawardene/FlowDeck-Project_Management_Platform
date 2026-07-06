import { useEffect, useState } from "react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"
import { useOrganization } from "@/context/OrganizationContext"
import { getOrgAnalytics } from "@/services/analyticsService"
import type { OrgAnalytics } from "@/types/analytics.types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, ListChecks, TrendingUp, Users } from "lucide-react"

const statusColorMap: Record<string, string> = {
  todo: "#64748b",
  in_progress: "#3b82f6",
  in_review: "#f59e0b",
  done: "#10b981",
}

const statusLabelMap: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
}

export default function ReportsPage() {
  const { currentOrg } = useOrganization()
  const [analytics, setAnalytics] = useState<OrgAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      if (!currentOrg) return
      setLoading(true)
      try {
        const data = await getOrgAnalytics(currentOrg._id)
        setAnalytics(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentOrg])

  if (!currentOrg) {
    return <p className="text-muted-foreground">Create an organization to see reports.</p>
  }

  if (loading || !analytics) {
    return <p className="text-muted-foreground">Loading analytics...</p>
  }

  const pieData = Object.entries(analytics.taskStatusBreakdown)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: statusLabelMap[status] || status,
      value: count,
      color: statusColorMap[status] || "#64748b",
    }))

  const completionRate =
    analytics.totalTasks > 0
      ? Math.round(((analytics.taskStatusBreakdown.done || 0) / analytics.totalTasks) * 100)
      : 0

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Reports</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <FolderKanban className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Projects</p>
              <p className="text-xl font-semibold text-foreground">
                {analytics.totalProjects}
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
              <p className="text-xl font-semibold text-foreground">{analytics.totalTasks}</p>
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
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Users className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contributors</p>
              <p className="text-xl font-semibold text-foreground">
                {analytics.workload.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">
                No tasks yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: 12,
                      color: "var(--foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks Completed (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={analytics.completedLast7Days}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="oklch(0.65 0.22 293)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workload by Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.workload.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No assigned tasks yet
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={analytics.workload}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: 12,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="count" fill="oklch(0.65 0.22 293)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}