import { Request, Response } from "express"
import User from "../models/User.model"
import { generateTokenAndSetCookie } from "../utils/generateToken"
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary"
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      res.status(400).json({ message: "Please provide name, email, and password" })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" })
      return
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      res.status(409).json({ message: "An account with this email already exists" })
      return
    }

    const user = await User.create({ name, email, password })

    generateTokenAndSetCookie(res, user._id.toString())

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong during registration" })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      res.status(400).json({ message: "Please provide email and password" })
      return
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" })
      return
    }

    generateTokenAndSetCookie(res, user._id.toString())

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong during login" })
  }
}

export const logout = (req: Request, res: Response): void => {
  res.cookie("token", "", { maxAge: 0 })
  res.status(200).json({ message: "Logged out successfully" })
}

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId)

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" })
  }
}

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file

    if (!file) {
      res.status(400).json({ message: "No file provided" })
      return
    }

    const result = await uploadBufferToCloudinary(file.buffer, "avatars", "image")

    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatarUrl: result.url },
      { new: true }
    )

    if (!user) {
      res.status(404).json({ message: "User not found" })
      return
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong uploading the avatar" })
  }
}