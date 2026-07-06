import api from "./api"
import type{ User } from "@/types/auth.types"

export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<User> => {
  const response = await api.post("/auth/register", { name, email, password })
  return response.data.user
}

export const loginUser = async (email: string, password: string): Promise<User> => {
  const response = await api.post("/auth/login", { email, password })
  return response.data.user
}

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout")
}

export const fetchCurrentUser = async (): Promise<User> => {
  const response = await api.get("/auth/me")
  return response.data.user
}

export const uploadAvatar = async (file: File): Promise<User> => {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post("/auth/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
  return response.data.user
}