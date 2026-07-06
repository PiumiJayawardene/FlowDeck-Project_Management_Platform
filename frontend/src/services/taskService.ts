import api from "./api"
import type { Task } from "@/types/task.types"

interface CreateTaskPayload {
  title: string
  description: string
  assigneeId?: string
  priority: string
  dueDate?: string
}

export const createTask = async (
  projectId: string,
  payload: CreateTaskPayload
): Promise<Task> => {
  const response = await api.post(`/tasks/projects/${projectId}/tasks`, payload)
  return response.data.task
}

export const getTasksForProject = async (projectId: string): Promise<Task[]> => {
  const response = await api.get(`/tasks/projects/${projectId}/tasks`)
  return response.data.tasks
}

export const updateTask = async (
  taskId: string,
  payload: Partial<CreateTaskPayload & { status: string }>
): Promise<Task> => {
  const response = await api.patch(`/tasks/${taskId}`, payload)
  return response.data.task
}

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`)
}

export const addSubtask = async (taskId: string, title: string): Promise<Task> => {
  const response = await api.post(`/tasks/${taskId}/subtasks`, { title })
  return response.data.task
}

export const toggleSubtask = async (taskId: string, subtaskId: string): Promise<Task> => {
  const response = await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`)
  return response.data.task
}

export const deleteSubtask = async (taskId: string, subtaskId: string): Promise<Task> => {
  const response = await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
  return response.data.task
}

export const addComment = async (taskId: string, text: string): Promise<Task> => {
  const response = await api.post(`/tasks/${taskId}/comments`, { text })
  return response.data.task
}

export const deleteComment = async (taskId: string, commentId: string): Promise<Task> => {
  const response = await api.delete(`/tasks/${taskId}/comments/${commentId}`)
  return response.data.task
}

export const uploadAttachment = async (taskId: string, file: File): Promise<Task> => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.task
}

export const deleteAttachment = async (
  taskId: string,
  attachmentId: string
): Promise<Task> => {
  const response = await api.delete(
    `/tasks/${taskId}/attachments/${attachmentId}`
  )

  return response.data.task
}