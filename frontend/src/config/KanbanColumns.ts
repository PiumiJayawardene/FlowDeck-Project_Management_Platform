import type { TaskStatus } from "@/types/task.types"

export interface KanbanColumnConfig {
  id: TaskStatus
  label: string
  accentClass: string
}

export const kanbanColumns: KanbanColumnConfig[] = [
  { id: "todo", label: "To Do", accentClass: "bg-slate-500" },
  { id: "in_progress", label: "In Progress", accentClass: "bg-blue-500" },
  { id: "in_review", label: "In Review", accentClass: "bg-amber-500" },
  { id: "done", label: "Done", accentClass: "bg-emerald-500" },
]