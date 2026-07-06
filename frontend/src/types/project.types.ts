export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived"
export type ProjectPriority = "low" | "medium" | "high" | "critical"

import type { OrgMemberUser } from "./organization.types"

export interface ProjectTeamRef {
  _id: string
  name: string
  members?: OrgMemberUser[]
}

export interface ProjectCreatorRef {
  _id: string
  name: string
  avatarUrl?: string
}

export interface Project {
  _id: string
  name: string
  description: string
  organizationId: string
  teamId: ProjectTeamRef
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: string
  dueDate?: string
  createdBy: ProjectCreatorRef
  createdAt: string
}