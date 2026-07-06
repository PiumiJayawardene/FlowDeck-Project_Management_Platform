"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAttachment = exports.uploadAttachment = exports.deleteComment = exports.addComment = exports.deleteSubtask = exports.toggleSubtask = exports.addSubtask = exports.deleteTask = exports.updateTask = exports.getTask = exports.getTasksForProject = exports.createTask = void 0;
const Task_model_1 = __importDefault(require("../models/Task.model"));
const Project_model_1 = __importDefault(require("../models/Project.model"));
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const uploadToCloudinary_1 = require("../utils/uploadToCloudinary");
const createTask = async (req, res) => {
    try {
        const { title, description, assigneeId, priority, dueDate } = req.body;
        const { projectId } = req.params;
        if (!title || title.trim().length < 2) {
            res.status(400).json({ message: "Task title must be at least 2 characters" });
            return;
        }
        const project = await Project_model_1.default.findOne({
            _id: projectId,
            organizationId: req.organization._id,
        });
        if (!project) {
            res.status(404).json({ message: "Project not found in this organization" });
            return;
        }
        const taskData = {
            title: title.trim(),
            description: description?.trim() || "",
            projectId,
            organizationId: req.organization._id,
            priority: priority || "medium",
            createdBy: req.userId,
        };
        if (assigneeId) {
            taskData.assigneeId = assigneeId;
        }
        if (dueDate) {
            taskData.dueDate = dueDate;
        }
        const task = await Task_model_1.default.create(taskData);
        res.status(201).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong creating the task" });
    }
};
exports.createTask = createTask;
const getTasksForProject = async (req, res) => {
    try {
        const { projectId } = req.params;
        const tasks = await Task_model_1.default.find({ projectId })
            .populate("assigneeId", "name avatarUrl")
            .populate("createdBy", "name avatarUrl")
            .populate("comments.authorId", "name avatarUrl")
            .sort({ createdAt: -1 });
        res.status(200).json({ tasks });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong fetching tasks" });
    }
};
exports.getTasksForProject = getTasksForProject;
const getTask = async (req, res) => {
    try {
        const task = await req.task.populate([
            { path: "assigneeId", select: "name avatarUrl" },
            { path: "createdBy", select: "name avatarUrl" },
            { path: "comments.authorId", select: "name avatarUrl" },
        ]);
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong fetching the task" });
    }
};
exports.getTask = getTask;
const updateTask = async (req, res) => {
    try {
        const { title, description, status, priority, assigneeId, dueDate } = req.body;
        const task = req.task;
        if (title && title.trim().length >= 2) {
            task.title = title.trim();
        }
        if (description !== undefined) {
            task.description = description.trim();
        }
        if (status) {
            task.status = status;
        }
        if (priority) {
            task.priority = priority;
        }
        if (assigneeId !== undefined) {
            task.assigneeId = assigneeId || undefined;
        }
        if (dueDate !== undefined) {
            task.dueDate = dueDate || undefined;
        }
        await task.save();
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong updating the task" });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        await Task_model_1.default.findByIdAndDelete(req.task._id);
        res.status(200).json({ message: "Task deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong deleting the task" });
    }
};
exports.deleteTask = deleteTask;
const addSubtask = async (req, res) => {
    try {
        const { title } = req.body;
        const task = req.task;
        if (!title || title.trim().length < 1) {
            res.status(400).json({ message: "Subtask title is required" });
            return;
        }
        task.subtasks.push({ title: title.trim(), completed: false });
        await task.save();
        await task.populate([
            { path: "assigneeId", select: "name avatarUrl" },
            { path: "createdBy", select: "name avatarUrl" },
        ]);
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong adding the subtask" });
    }
};
exports.addSubtask = addSubtask;
const toggleSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const task = req.task;
        const subtask = task.subtasks.find((item) => item._id.toString() === subtaskId);
        if (!subtask) {
            res.status(404).json({ message: "Subtask not found" });
            return;
        }
        subtask.completed = !subtask.completed;
        await task.save();
        await task.populate([
            { path: "assigneeId", select: "name avatarUrl" },
            { path: "createdBy", select: "name avatarUrl" },
        ]);
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong updating the subtask" });
    }
};
exports.toggleSubtask = toggleSubtask;
const deleteSubtask = async (req, res) => {
    try {
        const { subtaskId } = req.params;
        const task = req.task;
        task.subtasks = task.subtasks.filter((item) => item._id.toString() !== subtaskId);
        await task.save();
        await task.populate([
            { path: "assigneeId", select: "name avatarUrl" },
            { path: "createdBy", select: "name avatarUrl" },
        ]);
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong deleting the subtask" });
    }
};
exports.deleteSubtask = deleteSubtask;
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const task = req.task;
        if (!text || text.trim().length < 1) {
            res.status(400).json({ message: "Comment cannot be empty" });
            return;
        }
        task.comments.push({ authorId: req.userId, text: text.trim() });
        await task.save();
        const updatedTask = await task.populate("comments.authorId", "name avatarUrl");
        res.status(200).json({ task: updatedTask });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong adding the comment" });
    }
};
exports.addComment = addComment;
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const task = req.task;
        const comment = task.comments.find((item) => item._id.toString() === commentId);
        if (!comment) {
            res.status(404).json({ message: "Comment not found" });
            return;
        }
        if (comment.authorId.toString() !== req.userId) {
            res.status(403).json({ message: "You can only delete your own comments" });
            return;
        }
        task.comments = task.comments.filter((item) => item._id.toString() !== commentId);
        await task.save();
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong deleting the comment" });
    }
};
exports.deleteComment = deleteComment;
const uploadAttachment = async (req, res) => {
    try {
        const task = req.task;
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: "No file provided" });
            return;
        }
        const result = await (0, uploadToCloudinary_1.uploadBufferToCloudinary)(file.buffer, "task-attachments");
        task.attachments.push({
            url: result.url,
            publicId: result.publicId,
            fileName: file.originalname,
            fileType: file.mimetype,
            uploadedBy: req.userId,
        });
        await task.save();
        const updatedTask = await task.populate("attachments.uploadedBy", "name avatarUrl");
        res.status(200).json({ task: updatedTask });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong uploading the file" });
    }
};
exports.uploadAttachment = uploadAttachment;
const deleteAttachment = async (req, res) => {
    try {
        const { attachmentId } = req.params;
        const task = req.task;
        const attachment = task.attachments.find((item) => item._id.toString() === attachmentId);
        if (!attachment) {
            res.status(404).json({ message: "Attachment not found" });
            return;
        }
        if (attachment.uploadedBy.toString() !== req.userId) {
            res.status(403).json({ message: "You can only delete your own uploads" });
            return;
        }
        await cloudinary_1.default.uploader.destroy(attachment.publicId);
        task.attachments = task.attachments.filter((item) => item._id.toString() !== attachmentId);
        await task.save();
        res.status(200).json({ task });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong deleting the attachment" });
    }
};
exports.deleteAttachment = deleteAttachment;
