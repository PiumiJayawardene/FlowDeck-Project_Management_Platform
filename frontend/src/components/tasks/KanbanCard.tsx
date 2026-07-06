import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/types/task.types"
import { taskPriorityColors } from "@/config/taskMeta"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface KanbanCardProps {
  task: Task
  isOverlay?: boolean
}

export default function KanbanCard({
  task,
  isOverlay,
}: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task._id,
    data: { status: task.status },
  })

  const style = transform
    ? { transform: CSS.Translate.toString(transform) }
    : undefined

  const completedCount = task.subtasks.filter(
    (item) => item.completed
  ).length

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={
        isOverlay
          ? "cursor-grabbing rounded-xl border border-primary bg-card p-3 shadow-lg"
          : isDragging
          ? "cursor-grab rounded-xl border border-border bg-card p-3 opacity-30"
          : "cursor-grab rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
      }
    >
      <p className="text-sm font-medium text-foreground">
        {task.title}
      </p>

      {task.subtasks.length > 0 && (
        <p className="mt-1 text-xs text-muted-foreground">
          {completedCount}/{task.subtasks.length} subtasks
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <Badge
          variant="secondary"
          className={taskPriorityColors[task.priority]}
        >
          {task.priority}
        </Badge>

        {task.assigneeId && (
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {typeof task.assigneeId === "object" &&
              task.assigneeId?.name
                ? task.assigneeId.name
                    .substring(0, 2)
                    .toUpperCase()
                : "?"}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}