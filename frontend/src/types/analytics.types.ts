export interface WorkloadEntry {
  name: string
  count: number
}

export interface CompletedByDay {
  date: string
  completed: number
}

export interface OrgAnalytics {
  totalProjects: number
  totalTasks: number
  taskStatusBreakdown: Record<string, number>
  projectStatusBreakdown: Record<string, number>
  workload: WorkloadEntry[]
  completedLast7Days: CompletedByDay[]
}