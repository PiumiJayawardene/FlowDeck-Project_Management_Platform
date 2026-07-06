import { Router } from "express"
import { register, login, logout, getMe, uploadAvatar } from "../controllers/auth.controller"
import { protect } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()

router.post("/register", register)
router.post("/login", login)
router.post("/logout", logout)
router.get("/me", protect, getMe)
router.post("/avatar", protect, upload.single("file"), uploadAvatar)

export default router