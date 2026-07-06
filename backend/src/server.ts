import express, { Request, Response } from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
import { connectDB } from "./config/db"
import authRoutes from "./routes/auth.routes"
import organizationRoutes from "./routes/organization.routes"
import teamRoutes from "./routes/team.routes"
import projectRoutes from "./routes/project.routes"
import taskRoutes from "./routes/task.routes"
import analyticsRoutes from "./routes/analytics.routes"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
)
app.use(express.json())
app.use(cookieParser())

app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", message: "Server is running" })
})

app.use("/api/auth", authRoutes)
app.use("/api/organizations", organizationRoutes)
app.use("/api/teams", teamRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/analytics", analyticsRoutes)

const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}

startServer()