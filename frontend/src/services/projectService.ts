import api from "./api"
import type { Project } from "@/types/project.types"

interface CreateProjectPayload {
  name: string
  description: string
  teamId: string
  priority: string
  startDate?: string
  dueDate?: string
}

export const createProject = async (
  orgId: string,
  payload: CreateProjectPayload
): Promise<Project> => {
  const response = await api.post(
    `/projects/organizations/${orgId}/projects`,
    payload
  )

  return response.data.project
}

export const getProjectsForOrg = async (
  orgId: string
): Promise<Project[]> => {
  const response = await api.get(
    `/projects/organizations/${orgId}/projects`
  )

  return response.data.projects
}

export const getProject = async (projectId: string): Promise<Project> => {
  const response = await api.get(`/projects/${projectId}`)

  console.log("TEAM:", response.data.project.teamId)
  console.log("MEMBERS:", response.data.project.teamId.members)

  return response.data.project
}

export const updateProject = async (
  projectId: string,
  payload: Partial<CreateProjectPayload & { status: string }>
): Promise<Project> => {
  const response = await api.patch(
    `/projects/${projectId}`,
    payload
  )

  return response.data.project
}

export const deleteProject = async (
  projectId: string
): Promise<void> => {
  await api.delete(`/projects/${projectId}`)
}