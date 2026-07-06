import type{ ProjectStatus, ProjectPriority } from "@/types/project.types"

export const statusLabels: Record<ProjectStatus, string> = {
  planning: "Planning",
  active: "Active",
  on_hold: "On Hold",
  completed: "Completed",
  archived: "Archived",
}

export const statusColors: Record<ProjectStatus, string> = {
  planning: "bg-blue-500/10 text-blue-500",
  active: "bg-emerald-500/10 text-emerald-500",
  on_hold: "bg-amber-500/10 text-amber-500",
  completed: "bg-violet-500/10 text-violet-500",
  archived: "bg-muted text-muted-foreground",
}

export const priorityLabels: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

export const priorityColors: Record<ProjectPriority, string> = {
  low: "bg-slate-500/10 text-slate-500",
  medium: "bg-blue-500/10 text-blue-500",
  high: "bg-orange-500/10 text-orange-500",
  critical: "bg-red-500/10 text-red-500",
}