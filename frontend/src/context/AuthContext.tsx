import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type{ User, AuthContextType } from "@/types/auth.types"
import { loginUser, registerUser, logoutUser, fetchCurrentUser } from "@/services/authService"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await fetchCurrentUser()
        setUser(currentUser)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const loggedInUser = await loginUser(email, password)
    setUser(loggedInUser)
  }

  const register = async (name: string, email: string, password: string) => {
    const newUser = await registerUser(name, email, password)
    setUser(newUser)
  }

  const logout = async () => {
    await logoutUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}