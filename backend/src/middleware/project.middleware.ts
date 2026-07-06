import { Request, Response, NextFunction } from "express"
import Project, { IProject } from "../models/Project.model"
import Organization from "../models/Organization.model"

declare global {
  namespace Express {
    interface Request {
      project?: IProject
    }
  }
}

export const requireProjectAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projectId = req.params.projectId
    const project = await Project.findById(projectId)

    if (!project) {
      res.status(404).json({ message: "Project not found" })
      return
    }

    const organization = await Organization.findById(project.organizationId)

    if (!organization) {
      res.status(404).json({ message: "Parent organization not found" })
      return
    }

    const membership = organization.members.find(
      (member) => member.user.toString() === req.userId
    )

    if (!membership) {
      res.status(403).json({ message: "You do not have access to this project" })
      return
    }

    req.project = project
    req.organization = organization
    req.orgRole = membership.role
    next()
  } catch (error) {
    res.status(500).json({ message: "Something went wrong verifying project access" })
  }
}