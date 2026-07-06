import { Request, Response } from "express"
import Organization from "../models/Organization.model"
import User from "../models/User.model"
import { generateUniqueSlug } from "../utils/slugify"

export const createOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body

    if (!name || name.trim().length < 2) {
      res.status(400).json({ message: "Organization name must be at least 2 characters" })
      return
    }

    const slug = await generateUniqueSlug(name)

    const organization = await Organization.create({
      name: name.trim(),
      slug,
      ownerId: req.userId,
      members: [{ user: req.userId, role: "admin", joinedAt: new Date() }],
    })

    res.status(201).json({ organization })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong creating the organization" })
  }
}

export const getMyOrganizations = async (req: Request, res: Response): Promise<void> => {
  try {
    const organizations = await Organization.find({
  "members.user": req.userId,
})
.populate("members.user", "name email avatarUrl")
.sort({
  createdAt: -1,
})

    res.status(200).json({ organizations })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching organizations" })
  }
}

export const getOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const organization = await req.organization!.populate("members.user", "name email avatarUrl")
    res.status(200).json({ organization })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching the organization" })
  }
}

export const updateOrganization = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.body

    if (!name || name.trim().length < 2) {
      res.status(400).json({ message: "Organization name must be at least 2 characters" })
      return
    }

    req.organization!.name = name.trim()
    await req.organization!.save()

    res.status(200).json({ organization: req.organization })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong updating the organization" })
  }
}

export const inviteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, role } = req.body

    if (!email) {
      res.status(400).json({ message: "Email is required" })
      return
    }

    const validRoles = ["admin", "manager", "member"]
    const assignedRole = validRoles.includes(role) ? role : "member"

    const user = await User.findOne({ email: email.toLowerCase() })

    if (!user) {
      res.status(404).json({ message: "No account exists with this email yet" })
      return
    }

    const organization = req.organization!
    const alreadyMember = organization.members.some(
      (member) => member.user.toString() === user._id.toString()
    )

    if (alreadyMember) {
      res.status(409).json({ message: "This user is already a member of the organization" })
      return
    }

    organization.members.push({ user: user._id, role: assignedRole, joinedAt: new Date() })
    await organization.save()

    res.status(200).json({ organization })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong inviting the member" })
  }
}

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params
    const organization = req.organization!

    if (organization.ownerId.toString() === userId) {
      res.status(400).json({ message: "The organization owner cannot be removed" })
      return
    }

    organization.members = organization.members.filter(
      (member) => member.user.toString() !== userId
    )
    await organization.save()

    res.status(200).json({ organization })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong removing the member" })
  }
}