import api from "./api"
import type { Organization } from "@/types/organization.types"

export const createOrganization = async (name: string): Promise<Organization> => {
  const response = await api.post("/organizations", { name })
  return response.data.organization
}

export const getMyOrganizations = async (): Promise<Organization[]> => {
  const response = await api.get("/organizations")
  return response.data.organizations
}

export const getOrganization = async (orgId: string): Promise<Organization> => {
  const response = await api.get(`/organizations/${orgId}`)
  return response.data.organization
}

export const inviteMember = async (
  orgId: string,
  email: string,
  role: string
): Promise<Organization> => {
  const response = await api.post(`/organizations/${orgId}/invite`, { email, role })
  return response.data.organization
}

export const removeMember = async (orgId: string, userId: string): Promise<Organization> => {
  const response = await api.delete(`/organizations/${orgId}/members/${userId}`)
  return response.data.organization
}