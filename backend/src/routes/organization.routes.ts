import { Router } from "express"
import { protect } from "../middleware/auth.middleware"
import { requireOrgMembership, requireOrgAdmin } from "../middleware/organization.middleware"
import {
  createOrganization,
  getMyOrganizations,
  getOrganization,
  updateOrganization,
  inviteMember,
  removeMember,
} from "../controllers/organization.controller"
import { createTeam, getTeamsForOrg } from "../controllers/team.controller"

const router = Router()

router.use(protect)

router.post("/", createOrganization)
router.get("/", getMyOrganizations)
router.get("/:orgId", requireOrgMembership, getOrganization)
router.patch("/:orgId", requireOrgMembership, requireOrgAdmin, updateOrganization)
router.post("/:orgId/invite", requireOrgMembership, requireOrgAdmin, inviteMember)
router.delete(
  "/:orgId/members/:userId",
  requireOrgMembership,
  requireOrgAdmin,
  removeMember
)
router.post("/:orgId/teams", requireOrgMembership, createTeam)
router.get("/:orgId/teams", requireOrgMembership, getTeamsForOrg)

export default router