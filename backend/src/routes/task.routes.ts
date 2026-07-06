import { Router } from "express"
import { protect } from "../middleware/auth.middleware"
import { requireProjectAccess } from "../middleware/project.middleware"
import { requireTaskAccess } from "../middleware/task.middleware"
import { upload } from "../middleware/upload.middleware"
import {
  createTask,
  getTasksForProject,
  getTask,
  updateTask,
  deleteTask,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addComment,
  deleteComment,
  uploadAttachment,
  deleteAttachment,
} from "../controllers/task.controller"

const router = Router()

router.use(protect)

router.post("/projects/:projectId/tasks", requireProjectAccess, createTask)
router.get("/projects/:projectId/tasks", requireProjectAccess, getTasksForProject)
router.get("/:taskId", requireTaskAccess, getTask)
router.patch("/:taskId", requireTaskAccess, updateTask)
router.delete("/:taskId", requireTaskAccess, deleteTask)
router.post("/:taskId/subtasks", requireTaskAccess, addSubtask)
router.patch("/:taskId/subtasks/:subtaskId", requireTaskAccess, toggleSubtask)
router.delete("/:taskId/subtasks/:subtaskId", requireTaskAccess, deleteSubtask)
router.post("/:taskId/comments", requireTaskAccess, addComment)
router.delete("/:taskId/comments/:commentId", requireTaskAccess, deleteComment)
router.post(
  "/:taskId/attachments",
  requireTaskAccess,
  upload.single("file"),
  uploadAttachment
)
router.delete("/:taskId/attachments/:attachmentId", requireTaskAccess, deleteAttachment)

export default router