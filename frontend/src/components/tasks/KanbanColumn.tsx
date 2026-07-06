import { useDroppable } from "@dnd-kit/core"
import type { Task } from "@/types/task.types"
import type { KanbanColumnConfig } from "@/config/KanbanColumns"
import KanbanCard from "./KanbanCard"

interface KanbanColumnProps {
  column: KanbanColumnConfig
  tasks: Task[]
}

export default function KanbanColumn({
  column,
  tasks,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/40 p-3">
      <div className="mb-3 flex items-center gap-2 px-1">
        <span className={`h-2 w-2 rounded-full ${column.accentClass}`} />
        <span className="text-sm font-medium text-foreground">
          {column.label}
        </span>
        <span className="text-xs text-muted-foreground">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={
          isOver
            ? "flex min-h-40 flex-1 flex-col gap-2 rounded-lg border-2 border-dashed border-primary p-1"
            : "flex min-h-40 flex-1 flex-col gap-2 rounded-lg border-2 border-dashed border-transparent p-1"
        }
      >
        {tasks.map((task) => (
          <KanbanCard
            key={task._id}
            task={task}
          />
        ))}
      </div>
    </div>
  )
}