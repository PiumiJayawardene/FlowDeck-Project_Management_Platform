import mongoose, { Document, Schema, Types } from "mongoose"

export type TaskStatus = "todo" | "in_progress" | "in_review" | "done"
export type TaskPriority = "low" | "medium" | "high" | "critical"

export interface ISubtask {
  _id: Types.ObjectId
  title: string
  completed: boolean
}
export interface IComment {
  _id: Types.ObjectId
  authorId: Types.ObjectId
  text: string
  createdAt: Date
}

export interface IAttachment {
  _id: Types.ObjectId
  url: string
  publicId: string
  fileName: string
  fileType: string
  uploadedBy: Types.ObjectId
  uploadedAt: Date
}

export interface ITask extends Document {
  title: string
  description: string
  projectId: Types.ObjectId
  organizationId: Types.ObjectId
  assigneeId?: Types.ObjectId
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  subtasks: ISubtask[]
  comments: IComment[]
  attachments: IAttachment[]
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}


const subtaskSchema = new Schema<ISubtask>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  completed: { type: Boolean, default: false },
})
const commentSchema = new Schema<IComment>({
  authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
})

const attachmentSchema = new Schema<IAttachment>({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  uploadedAt: { type: Date, default: Date.now },
})

const taskSchema = new Schema<ITask>(
  {
    title: { type: String, required: true, trim: true, minlength: 2, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", required: true },
    assigneeId: { type: Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["todo", "in_progress", "in_review", "done"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    dueDate: { type: Date },
   subtasks: { type: [subtaskSchema], default: [] },
    comments: { type: [commentSchema], default: [] },
    attachments: { type: [attachmentSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

taskSchema.index({ projectId: 1 })
taskSchema.index({ assigneeId: 1 })
taskSchema.index({ createdBy: 1 })

const Task = mongoose.model<ITask>("Task", taskSchema)
export default Task