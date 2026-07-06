import mongoose, { Document, Schema, Types } from "mongoose"

export type ProjectStatus = "planning" | "active" | "on_hold" | "completed" | "archived"
export type ProjectPriority = "low" | "medium" | "high" | "critical"

export interface IProject extends Document {
  name: string
  description: string
  organizationId: Types.ObjectId
  teamId: Types.ObjectId
  status: ProjectStatus
  priority: ProjectPriority
  startDate?: Date
  dueDate?: Date
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const projectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 1000, default: "" },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "archived"],
      default: "planning",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    startDate: { type: Date },
    dueDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

projectSchema.index({ organizationId: 1 })
projectSchema.index({ teamId: 1 })

const Project = mongoose.model<IProject>("Project", projectSchema)
export default Project