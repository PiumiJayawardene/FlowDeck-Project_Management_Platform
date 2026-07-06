export type TaskStatus = "todo" | "in_progress" | "in_review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "critical"

export interface Subtask {
  _id: string
  title: string
  completed: boolean
}

export interface TaskAssigneeRef {
  _id: string
  name: string
  avatarUrl?: string
}

export interface Comment {
  _id: string
  authorId: TaskAssigneeRef
  text: string
  createdAt: string
}

export interface Attachment {
  _id: string
  url: string
  publicId: string
  fileName: string
  fileType: string
  uploadedBy: TaskAssigneeRef
  uploadedAt: string
}

export interface Task {
  _id: string
  title: string
  description: string
  projectId: string
  organizationId: string
  assigneeId?: TaskAssigneeRef
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  subtasks: Subtask[]
  comments: Comment[]
  attachments: Attachment[]
  createdBy: TaskAssigneeRef
  createdAt: string
}