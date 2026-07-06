import { Router } from "express"
import { protect } from "../middleware/auth.middleware"
import { requireTeamAccess } from "../middleware/team.middleware"
import {
  getTeam,
  updateTeam,
  deleteTeam,
  addTeamMember,
  removeTeamMember,
} from "../controllers/team.controller"

const router = Router()

router.use(protect)

router.get("/:teamId", requireTeamAccess, getTeam)
router.patch("/:teamId", requireTeamAccess, updateTeam)
router.delete("/:teamId", requireTeamAccess, deleteTeam)
router.post("/:teamId/members", requireTeamAccess, addTeamMember)
router.delete("/:teamId/members/:userId", requireTeamAccess, removeTeamMember)

export default router