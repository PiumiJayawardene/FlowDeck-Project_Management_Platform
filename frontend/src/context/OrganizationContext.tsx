import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import type { Organization } from "@/types/organization.types"
import { getMyOrganizations } from "@/services/organizationService"
import { useAuth } from "./AuthContext"

interface OrganizationContextType {
  organizations: Organization[]
  currentOrg: Organization | null
  loading: boolean
  refreshOrganizations: () => Promise<void>
  setCurrentOrg: (org: Organization) => void
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshOrganizations = async () => {
    try {
      const orgs = await getMyOrganizations()
      setOrganizations(orgs)
      if (orgs.length > 0) {
        setCurrentOrg((prev) => orgs.find((org) => org._id === prev?._id) || orgs[0])
      } else {
        setCurrentOrg(null)
      }
    } catch {
      setOrganizations([])
      setCurrentOrg(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      refreshOrganizations()
    } else {
      setLoading(false)
    }
  }, [user])

  return (
    <OrganizationContext.Provider
      value={{ organizations, currentOrg, loading, refreshOrganizations, setCurrentOrg }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization(): OrganizationContextType {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error("useOrganization must be used within an OrganizationProvider")
  }
  return context
}