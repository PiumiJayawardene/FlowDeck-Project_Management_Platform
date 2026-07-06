import { Request, Response } from "express"
import Task from "../models/Task.model"
import Project from "../models/Project.model"
import cloudinary from "../config/cloudinary"
import { uploadBufferToCloudinary } from "../utils/uploadToCloudinary"
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, assigneeId, priority, dueDate } = req.body
    const { projectId } = req.params

    if (!title || title.trim().length < 2) {
      res.status(400).json({ message: "Task title must be at least 2 characters" })
      return
    }

    const project = await Project.findOne({
      _id: projectId,
      organizationId: req.organization!._id,
    })

    if (!project) {
      res.status(404).json({ message: "Project not found in this organization" })
      return
    }

    const taskData: Record<string, unknown> = {
      title: title.trim(),
      description: description?.trim() || "",
      projectId,
      organizationId: req.organization!._id,
      priority: priority || "medium",
      createdBy: req.userId,
    }

    if (assigneeId) {
      taskData.assigneeId = assigneeId
    }
    if (dueDate) {
      taskData.dueDate = dueDate
    }

    const task = await Task.create(taskData)

    res.status(201).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong creating the task" })
  }
}

export const getTasksForProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params

    const tasks = await Task.find({ projectId })
      .populate("assigneeId", "name avatarUrl")
      .populate("createdBy", "name avatarUrl")
      .populate("comments.authorId", "name avatarUrl")
      .sort({ createdAt: -1 })

    res.status(200).json({ tasks })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching tasks" })
  }
}

export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = await req.task!.populate([
      { path: "assigneeId", select: "name avatarUrl" },
      { path: "createdBy", select: "name avatarUrl" },
      { path: "comments.authorId", select: "name avatarUrl" },
    ])

    res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong fetching the task" })
  }
}

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status, priority, assigneeId, dueDate } = req.body
    const task = req.task!

    if (title && title.trim().length >= 2) {
      task.title = title.trim()
    }
    if (description !== undefined) {
      task.description = description.trim()
    }
    if (status) {
      task.status = status
    }
    if (priority) {
      task.priority = priority
    }
    if (assigneeId !== undefined) {
      task.assigneeId = assigneeId || undefined
    }
    if (dueDate !== undefined) {
      task.dueDate = dueDate || undefined
    }

    await task.save()
    res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong updating the task" })
  }
}

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    await Task.findByIdAndDelete(req.task!._id)
    res.status(200).json({ message: "Task deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong deleting the task" })
  }
}

export const addSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body
    const task = req.task!

    if (!title || title.trim().length < 1) {
      res.status(400).json({ message: "Subtask title is required" })
      return
    }

   task.subtasks.push({ title: title.trim(), completed: false } as any)
await task.save()

await task.populate([
  { path: "assigneeId", select: "name avatarUrl" },
  { path: "createdBy", select: "name avatarUrl" },
])

res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong adding the subtask" })
  }
}

export const toggleSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subtaskId } = req.params
    const task = req.task!

    const subtask = task.subtasks.find((item) => item._id.toString() === subtaskId)

    if (!subtask) {
      res.status(404).json({ message: "Subtask not found" })
      return
    }

    subtask.completed = !subtask.completed
await task.save()

await task.populate([
  { path: "assigneeId", select: "name avatarUrl" },
  { path: "createdBy", select: "name avatarUrl" },
])

res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong updating the subtask" })
  }
}

export const deleteSubtask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { subtaskId } = req.params
    const task = req.task!

    task.subtasks = task.subtasks.filter(
  (item) => item._id.toString() !== subtaskId
) as any

await task.save()

await task.populate([
  { path: "assigneeId", select: "name avatarUrl" },
  { path: "createdBy", select: "name avatarUrl" },
])

res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong deleting the subtask" })
  }
}

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body
    const task = req.task!

    if (!text || text.trim().length < 1) {
      res.status(400).json({ message: "Comment cannot be empty" })
      return
    }

    task.comments.push({ authorId: req.userId, text: text.trim() } as any)
    await task.save()

    const updatedTask = await task.populate("comments.authorId", "name avatarUrl")

    res.status(200).json({ task: updatedTask })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong adding the comment" })
  }
}

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { commentId } = req.params
    const task = req.task!

    const comment = task.comments.find((item) => item._id.toString() === commentId)

    if (!comment) {
      res.status(404).json({ message: "Comment not found" })
      return
    }

    if (comment.authorId.toString() !== req.userId) {
      res.status(403).json({ message: "You can only delete your own comments" })
      return
    }

    task.comments = task.comments.filter((item) => item._id.toString() !== commentId) as any

    await task.save()
    res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong deleting the comment" })
  }
}



export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const task = req.task!
    const file = req.file

    if (!file) {
      res.status(400).json({ message: "No file provided" })
      return
    }

    const result = await uploadBufferToCloudinary(file.buffer, "task-attachments")

    task.attachments.push({
      url: result.url,
      publicId: result.publicId,
      fileName: file.originalname,
      fileType: file.mimetype,
      uploadedBy: req.userId,
    } as any)

    await task.save()

    const updatedTask = await task.populate("attachments.uploadedBy", "name avatarUrl")

    res.status(200).json({ task: updatedTask })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong uploading the file" })
  }
}

export const deleteAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { attachmentId } = req.params
    const task = req.task!

    const attachment = task.attachments.find((item) => item._id.toString() === attachmentId)

    if (!attachment) {
      res.status(404).json({ message: "Attachment not found" })
      return
    }

    if (attachment.uploadedBy.toString() !== req.userId) {
      res.status(403).json({ message: "You can only delete your own uploads" })
      return
    }

    await cloudinary.uploader.destroy(attachment.publicId)

    task.attachments = task.attachments.filter(
      (item) => item._id.toString() !== attachmentId
    ) as any

    await task.save()
    res.status(200).json({ task })
  } catch (error) {
    res.status(500).json({ message: "Something went wrong deleting the attachment" })
  }
}