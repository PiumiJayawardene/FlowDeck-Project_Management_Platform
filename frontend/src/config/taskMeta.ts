import type { TaskStatus, TaskPriority } from "@/types/task.types"

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
}

export const taskStatusColors: Record<TaskStatus, string> = {
  todo: "bg-slate-500/10 text-slate-500",
  in_progress: "bg-blue-500/10 text-blue-500",
  in_review: "bg-amber-500/10 text-amber-500",
  done: "bg-emerald-500/10 text-emerald-500",
}

export const taskPriorityColors: Record<TaskPriority, string> = {
  low: "bg-slate-500/10 text-slate-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}