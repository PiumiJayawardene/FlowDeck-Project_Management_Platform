export type OrgRole = "admin" | "manager" | "member"

export interface OrgMemberUser {
  _id: string
  name: string
  email: string
  avatarUrl?: string
}

export interface OrganizationMember {
  user: OrgMemberUser
  role: OrgRole
  joinedAt: string
}

export interface Organization {
  _id: string
  name: string
  slug: string
  ownerId: string
  members: OrganizationMember[]
  createdAt: string
}