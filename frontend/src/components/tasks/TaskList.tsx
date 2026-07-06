import { useState } from "react"
import type { Task } from "@/types/task.types"
import type { Team } from "@/types/team.types"
import EmptyState from "@/components/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import {
  createTask,
  toggleSubtask,
  addSubtask,
} from "@/services/taskService"
import { taskStatusLabels, taskStatusColors, taskPriorityColors } from "@/config/taskMeta"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import CommentThread from "./CommentThread"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, ListChecks } from "lucide-react"

interface TaskListProps {
  projectId: string
  teamMembers: Team["members"]
  tasks: Task[]
  loading: boolean
  onRefresh: () => void
}

export default function TaskList({
  projectId,
  teamMembers,
  tasks,
  loading,
  onRefresh,
}: TaskListProps) {

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [priority, setPriority] = useState("medium")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  
  

  const handleCreateTask = async () => {
    if (title.trim().length < 2) {
      setCreateError("Task title must be at least 2 characters")
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createTask(projectId, {
        title: title.trim(),
        description: description.trim(),
        assigneeId: assigneeId || undefined,
        priority,
      })
      setTitle("")
      setDescription("")
      setAssigneeId("")
      setPriority("medium")
      setDialogOpen(false)
      onRefresh()
    } catch (error: any) {
      setCreateError(error?.response?.data?.message || "Failed to create task")
    } finally {
      setCreating(false)
    }
  }

  const handleToggleSubtask = async (taskId: string, subtaskId: string) => {
    await toggleSubtask(taskId, subtaskId)
onRefresh()
  }

  const handleAddSubtask = async (taskId: string) => {
    if (newSubtaskTitle.trim().length < 1) return
    await addSubtask(taskId, newSubtaskTitle.trim())
setNewSubtaskTitle("")
onRefresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Tasks</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
  <Button
    size="sm"
    onClick={() => setDialogOpen(true)}
  >
    <Plus className="mr-2 h-4 w-4" />
    New task
  </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="taskTitle">Title</Label>
                <Input
                  id="taskTitle"
                  placeholder="Design the login page"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taskDescription">Description</Label>
                <Textarea
                  id="taskDescription"
                  placeholder="What needs to be done?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
             <div className="space-y-2">
  <Label>Assignee</Label>

  <Select value={assigneeId} onValueChange={(value) => {
  if (value) setAssigneeId(value)
}}>
    <SelectTrigger>
      <SelectValue>
        {assigneeId
          ? teamMembers.find(
              (member: any) => member._id === assigneeId
            )?.name ?? "Unknown user"
          : "Unassigned"}
      </SelectValue>
    </SelectTrigger>

    <SelectContent>
      {teamMembers.map((member: any) => (
        <SelectItem
          key={member._id}
          value={member._id}
        >
          {member.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => {
  if (value) setPriority(value)
}}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createError && <p className="text-sm text-destructive">{createError}</p>}
              <Button className="w-full" onClick={handleCreateTask} disabled={creating}>
                {creating ? "Creating..." : "Create task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

    {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="flex items-center justify-between py-4">
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                  <Skeleton className="h-7 w-7 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Create your first task to start tracking work."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isExpanded = expandedTaskId === task._id
            const completedCount = task.subtasks.filter((item) => item.completed).length

            return (
              <Card key={task._id}>
                <CardContent className="space-y-3 py-4">
                  <div
                    className="flex cursor-pointer items-center justify-between gap-3"
                    onClick={() => setExpandedTaskId(isExpanded ? null : task._id)}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{task.title}</p>
                      {task.subtasks.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {completedCount}/{task.subtasks.length} subtasks
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={taskPriorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge variant="secondary" className={taskStatusColors[task.status]}>
                        {taskStatusLabels[task.status]}
                      </Badge>
                      {task.assigneeId && (
                        <Avatar className="h-7 w-7">
                         <AvatarFallback className="bg-primary text-primary-foreground text-xs">
  {typeof task.assigneeId === "object" &&
 task.assigneeId?.name
  ? task.assigneeId.name.substring(0, 2).toUpperCase()
  : "?"}
</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="space-y-4 border-t border-border pt-3">
                      <div className="space-y-2">
                        {task.subtasks.map((subtask) => (
                          <div key={subtask._id} className="flex items-center gap-2">
                            <Checkbox
                              checked={subtask.completed}
                              onCheckedChange={() =>
                                handleToggleSubtask(task._id, subtask._id)
                              }
                            />
                            <span
                              className={
                                subtask.completed
                                  ? "text-sm text-muted-foreground line-through"
                                  : "text-sm text-foreground"
                              }
                            >
                              {subtask.title}
                            </span>
                          </div>
                        ))}
                        <div className="flex gap-2 pt-1">
                          <Input
                            placeholder="Add a subtask"
                            value={newSubtaskTitle}
                            onChange={(event) => setNewSubtaskTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                handleAddSubtask(task._id)
                              }
                            }}
                          />
                          <Button size="sm" onClick={() => handleAddSubtask(task._id)}>
                            Add
                          </Button>
                        </div>
                      </div>

                      <CommentThread
                        taskId={task._id}
                        comments={task.comments}
                        onCommentsChange={onRefresh}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}