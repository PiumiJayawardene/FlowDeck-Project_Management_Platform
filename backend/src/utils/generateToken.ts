import jwt from "jsonwebtoken"
import { Response } from "express"

export const generateTokenAndSetCookie = (
  res: Response,
  userId: string
): void => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env")
  }

  const token = jwt.sign({ userId }, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"],
  })

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}