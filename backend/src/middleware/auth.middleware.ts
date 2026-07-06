import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import User from "../models/User.model"

interface DecodedToken {
  userId: string
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies.token

    if (!token) {
      res.status(401).json({ message: "Not authorized, no token provided" })
      return
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in .env")
    }

    const decoded = jwt.verify(token, secret) as DecodedToken
    const user = await User.findById(decoded.userId)

    if (!user) {
      res.status(401).json({ message: "Not authorized, user not found" })
      return
    }

    req.userId = user._id.toString()
    req.userRole = user.role
    next()
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" })
  }
}

export const authorize = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.userRole || !allowedRoles.includes(req.userRole)) {
      res.status(403).json({ message: "You do not have permission to perform this action" })
      return
    }
    next()
  }
}