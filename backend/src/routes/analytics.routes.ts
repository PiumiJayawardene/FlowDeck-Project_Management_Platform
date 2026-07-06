import { Router } from "express"
import { protect } from "../middleware/auth.middleware"
import { requireOrgMembership } from "../middleware/organization.middleware"
import { getOrgAnalytics } from "../controllers/analytics.controller"

const router = Router()

router.use(protect)

router.get("/organizations/:orgId", requireOrgMembership, getOrgAnalytics)

export default router