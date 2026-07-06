import { Request, Response, NextFunction } from "express"
import Organization, { IOrganization, OrgRole } from "../models/Organization.model"

declare global {
  namespace Express {
    interface Request {
      organization?: IOrganization
      orgRole?: OrgRole
    }
  }
}

export const requireOrgMembership = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgId = req.params.orgId
    const organization = await Organization.findById(orgId)

    if (!organization) {
      res.status(404).json({ message: "Organization not found" })
      return
    }

    const membership = organization.members.find(
      (member) => member.user.toString() === req.userId
    )

    if (!membership) {
      res.status(403).json({ message: "You are not a member of this organization" })
      return
    }

    req.organization = organization
    req.orgRole = membership.role
    next()
  } catch (error) {
    res.status(500).json({ message: "Something went wrong verifying organization access" })
  }
}

export const requireOrgAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.orgRole !== "admin") {
    res.status(403).json({ message: "Only organization admins can perform this action" })
    return
  }
  next()
}