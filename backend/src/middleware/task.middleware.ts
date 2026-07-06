import { Request, Response, NextFunction } from "express"
import Task, { ITask } from "../models/Task.model"
import Organization from "../models/Organization.model"

declare global {
  namespace Express {
    interface Request {
      task?: ITask
    }
  }
}

export const requireTaskAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const taskId = req.params.taskId
    const task = await Task.findById(taskId)

    if (!task) {
      res.status(404).json({ message: "Task not found" })
      return
    }

    const organization = await Organization.findById(task.organizationId)

    if (!organization) {
      res.status(404).json({ message: "Parent organization not found" })
      return
    }

    const membership = organization.members.find(
      (member) => member.user.toString() === req.userId
    )

    if (!membership) {
      res.status(403).json({ message: "You do not have access to this task" })
      return
    }

    req.task = task
    req.organization = organization
    req.orgRole = membership.role
    next()
  } catch (error) {
    res.status(500).json({ message: "Something went wrong verifying task access" })
  }
}