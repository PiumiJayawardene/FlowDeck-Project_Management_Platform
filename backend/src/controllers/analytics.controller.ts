import { Request, Response } from "express"
import Task from "../models/Task.model"
import Project from "../models/Project.model"

export const getOrgAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const orgId = req.organization!._id

    const projects = await Project.find({ organizationId: orgId })
    const projectIds = projects.map((project) => project._id)

    const tasks = await Task.find({ projectId: { $in: projectIds } }).populate(
      "assigneeId",
      "name"
    )

    const statusCounts: Record<string, number> = {
      todo: 0,
      in_progress: 0,
      in_review: 0,
      done: 0,
    }
    tasks.forEach((task) => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1
    })

    const workloadMap = new Map<string, { name: string; count: number }>()
    tasks.forEach((task) => {
      if (!task.assigneeId) return
      const assignee = task.assigneeId as any
      const key = assignee._id.toString()
      if (!workloadMap.has(key)) {
        workloadMap.set(key, { name: assignee.name, count: 0 })
      }
      workloadMap.get(key)!.count += 1
    })

    const now = new Date()
    const last7Days: { date: string; completed: number }[] = []
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now)
      day.setDate(now.getDate() - i)
      const dayStart = new Date(day.setHours(0, 0, 0, 0))
      const dayEnd = new Date(day.setHours(23, 59, 59, 999))

      const completedCount = tasks.filter((task) => {
        if (task.status !== "done") return false
        const updatedAt = (task as any).updatedAt
        return updatedAt >= dayStart && updatedAt <= dayEnd
      }).length

      last7Days.push({
        date: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
        completed: completedCount,
      })
    }

    const projectStatusCounts: Record<string, number> = {
      planning: 0,
      active: 0,
      on_hold: 0,
      completed: 0,
      archived: 0,
    }
    projects.forEach((project) => {
      projectStatusCounts[project.status] = (projectStatusCounts[project.status] || 0) + 1
    })

    res.status(200).json({
      totalProjects: projects.length,
      totalTasks: tasks.length,
      taskStatusBreakdown: statusCounts,
      projectStatusBreakdown: projectStatusCounts,
      workload: Array.from(workloadMap.values()),
      completedLast7Days: last7Days,
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching analytics" })
  }
}