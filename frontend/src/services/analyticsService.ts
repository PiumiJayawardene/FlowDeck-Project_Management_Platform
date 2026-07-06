import api from "./api"
import type { OrgAnalytics } from "@/types/analytics.types"

export const getOrgAnalytics = async (orgId: string): Promise<OrgAnalytics> => {
  const response = await api.get(`/analytics/organizations/${orgId}`)
  return response.data
}