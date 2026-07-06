import api from "./api"
import type { Team } from "@/types/team.types"

export const createTeam = async (
  orgId: string,
  name: string,
  description: string
): Promise<Team> => {
  const response = await api.post(`/organizations/${orgId}/teams`, { name, description })
  return response.data.team
}

export const getTeamsForOrg = async (orgId: string): Promise<Team[]> => {
  const response = await api.get(`/organizations/${orgId}/teams`)
  return response.data.teams
}

export const addTeamMember = async (teamId: string, userId: string): Promise<Team> => {
  const response = await api.post(`/teams/${teamId}/members`, { userId })
  return response.data.team
}

export const removeTeamMember = async (teamId: string, userId: string): Promise<Team> => {
  const response = await api.delete(`/teams/${teamId}/members/${userId}`)
  return response.data.team
}