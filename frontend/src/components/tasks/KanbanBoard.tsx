import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import type { Task, TaskStatus } from "@/types/task.types"
import { kanbanColumns } from "@/config/KanbanColumns"
import { updateTask } from "@/services/taskService"
import KanbanColumn from "./KanbanColumn"
import KanbanCard from "./KanbanCard"

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

export default function KanbanBoard({
  tasks,
  onTasksChange,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((item) => item._id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)

    const { active, over } = event

    if (!over) return

    const newStatus = over.id as TaskStatus

    const draggedTask = tasks.find(
      (item) => item._id === active.id
    )

    if (!draggedTask || draggedTask.status === newStatus) return

    const updatedTasks = tasks.map((item) =>
      item._id === draggedTask._id
        ? { ...item, status: newStatus }
        : item
    )

    onTasksChange(updatedTasks)

    try {
      await updateTask(draggedTask._id, {
        status: newStatus,
      })
    } catch {
      onTasksChange(tasks)
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-2">
        {kanbanColumns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter(
              (task) => task.status === column.id
            )}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <KanbanCard
            task={activeTask}
            isOverlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}