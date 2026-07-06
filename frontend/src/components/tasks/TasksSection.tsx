import { useEffect, useState } from "react"
import type { Task } from "@/types/task.types"
import type { OrgMemberUser } from "@/types/organization.types"
import { getTasksForProject } from "@/services/taskService"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import TaskList from "./TaskList"
import KanbanBoard from "./KanbanBoard"

interface TasksSectionProps {
  projectId: string
  teamMembers: OrgMemberUser[]
}

export default function TasksSection({
  projectId,
  teamMembers,
}: TasksSectionProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const loadTasks = async () => {
    setLoading(true)

    try {
      const data = await getTasksForProject(projectId)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [projectId])

  return (
    <Tabs
      defaultValue="board"
      className="space-y-4"
    >
      <TabsList>
        <TabsTrigger value="board">
          Board
        </TabsTrigger>

        <TabsTrigger value="list">
          List
        </TabsTrigger>
      </TabsList>

      <TabsContent value="board">
        {loading ? (
          <p className="text-muted-foreground">
            Loading tasks...
          </p>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTasksChange={setTasks}
          />
        )}
      </TabsContent>

      <TabsContent value="list">
        <TaskList
          projectId={projectId}
          teamMembers={teamMembers}
          tasks={tasks}
          loading={loading}
          onRefresh={loadTasks}
        />
      </TabsContent>
    </Tabs>
  )
}