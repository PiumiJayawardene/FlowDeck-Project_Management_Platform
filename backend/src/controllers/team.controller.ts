import { Request, Response } from "express"
import Team from "../models/Team.model"

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body

    if (!name || name.trim().length < 2) {
      res.status(400).json({ message: "Team name must be at least 2 characters" })
      return
    }

    const team = await Team.create({
      name: name.trim(),
      description: description?.trim() || "",
      organizationId: req.organization!._id,
      members: [req.userId],
    })

    res.status(201).json({ team })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong creating the team" })
  }
}

export const getTeamsForOrg = async (req: Request, res: Response): Promise<void> => {
  try {
    const teams = await Team.find({ organizationId: req.organization!._id })
      .populate("members", "name email avatarUrl")
      .sort({ createdAt: -1 })

    res.status(200).json({ teams })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching teams" })
  }
}

export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await req.team!.populate("members", "name email avatarUrl")
    res.status(200).json({ team })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching the team" })
  }
}

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body

    if (name && name.trim().length >= 2) {
      req.team!.name = name.trim()
    }
    if (description !== undefined) {
      req.team!.description = description.trim()
    }

    await req.team!.save()
    res.status(200).json({ team: req.team })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong updating the team" })
  }
}

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    await Team.findByIdAndDelete(req.team!._id)
    res.status(200).json({ message: "Team deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong deleting the team" })
  }
}

export const addTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.body
    const team = req.team!

    const isOrgMember = req.organization!.members.some(
      (member) => member.user.toString() === userId
    )

    if (!isOrgMember) {
      res.status(400).json({ message: "User must be a member of the organization first" })
      return
    }

    const alreadyOnTeam = team.members.some((memberId) => memberId.toString() === userId)

    if (alreadyOnTeam) {
      res.status(409).json({ message: "This user is already on the team" })
      return
    }

    team.members.push(userId)
    await team.save()

    res.status(200).json({ team })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong adding the team member" })
  }
}

export const removeTeamMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const team = req.team!

    team.members = team.members.filter((memberId) => memberId.toString() !== userId)
    await team.save()

    res.status(200).json({ team })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong removing the team member" })
  }
}