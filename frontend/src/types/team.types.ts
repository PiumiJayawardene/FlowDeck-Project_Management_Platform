import type { OrgMemberUser } from "./organization.types"

export interface Team {
  _id: string
  name: string
  description: string
  organizationId: string
  members: OrgMemberUser[]
  createdAt: string
}