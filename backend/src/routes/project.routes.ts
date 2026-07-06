import { Router } from "express"
import { protect } from "../middleware/auth.middleware"
import { requireOrgMembership } from "../middleware/organization.middleware"
import { requireProjectAccess } from "../middleware/project.middleware"
import {
  createProject,
  getProjectsForOrg,
  getProject,
  updateProject,
  deleteProject,
} from "../controllers/project.controller"

const router = Router()

router.use(protect)

router.post("/organizations/:orgId/projects", requireOrgMembership, createProject)
router.get("/organizations/:orgId/projects", requireOrgMembership, getProjectsForOrg)
router.get("/:projectId", requireProjectAccess, getProject)
router.patch("/:projectId", requireProjectAccess, updateProject)
router.delete("/:projectId", requireProjectAccess, deleteProject)

export default router