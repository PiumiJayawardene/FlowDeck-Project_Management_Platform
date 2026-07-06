import { Request, Response, NextFunction } from "express"
import Team, { ITeam } from "../models/Team.model"
import Organization from "../models/Organization.model"

declare global {
  namespace Express {
    interface Request {
      team?: ITeam
    }
  }
}

export const requireTeamAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const teamId = req.params.teamId
    const team = await Team.findById(teamId)

    if (!team) {
      res.status(404).json({ message: "Team not found" })
      return
    }

    const organization = await Organization.findById(team.organizationId)

    if (!organization) {
      res.status(404).json({ message: "Parent organization not found" })
      return
    }

    const membership = organization.members.find(
      (member) => member.user.toString() === req.userId
    )

    if (!membership) {
      res.status(403).json({ message: "You do not have access to this team" })
      return
    }

    req.team = team
    req.organization = organization
    req.orgRole = membership.role
    next()
  } catch (error) {
    res.status(500).json({ message: "Something went wrong verifying team access" })
  }
}