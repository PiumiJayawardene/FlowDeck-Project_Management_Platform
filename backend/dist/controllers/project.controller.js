"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.getProject = exports.getProjectsForOrg = exports.createProject = void 0;
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Team_model_1 = __importDefault(require("../models/Team.model"));
const createProject = async (req, res) => {
    try {
        const { name, description, teamId, priority, startDate, dueDate } = req.body;
        if (!name || name.trim().length < 2) {
            res.status(400).json({ message: "Project name must be at least 2 characters" });
            return;
        }
        if (!teamId) {
            res.status(400).json({ message: "A team must be assigned to the project" });
            return;
        }
        const team = await Team_model_1.default.findOne({
            _id: teamId,
            organizationId: req.organization._id,
        });
        if (!team) {
            res.status(404).json({ message: "Team not found in this organization" });
            return;
        }
        const project = await Project_model_1.default.create({
            name: name.trim(),
            description: description?.trim() || "",
            organizationId: req.organization._id,
            teamId,
            priority: priority || "medium",
            startDate: startDate || undefined,
            dueDate: dueDate || undefined,
            createdBy: req.userId,
        });
        res.status(201).json({ project });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong creating the project" });
    }
};
exports.createProject = createProject;
const getProjectsForOrg = async (req, res) => {
    try {
        const projects = await Project_model_1.default.find({ organizationId: req.organization._id })
            .populate("teamId", "name")
            .populate("createdBy", "name avatarUrl")
            .sort({ createdAt: -1 });
        res.status(200).json({ projects });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong fetching projects" });
    }
};
exports.getProjectsForOrg = getProjectsForOrg;
const getProject = async (req, res) => {
    try {
        const project = await Project_model_1.default.findById(req.project._id)
            .populate({
            path: "teamId",
            populate: {
                path: "members",
                select: "name email avatarUrl",
            },
        })
            .populate("createdBy", "name avatarUrl");
        res.status(200).json({ project });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong fetching the project" });
    }
};
exports.getProject = getProject;
const updateProject = async (req, res) => {
    try {
        const { name, description, status, priority, startDate, dueDate, teamId } = req.body;
        const project = req.project;
        if (name && name.trim().length >= 2) {
            project.name = name.trim();
        }
        if (description !== undefined) {
            project.description = description.trim();
        }
        if (status) {
            project.status = status;
        }
        if (priority) {
            project.priority = priority;
        }
        if (startDate !== undefined) {
            project.startDate = startDate || undefined;
        }
        if (dueDate !== undefined) {
            project.dueDate = dueDate || undefined;
        }
        if (teamId) {
            const team = await Team_model_1.default.findOne({ _id: teamId, organizationId: project.organizationId });
            if (!team) {
                res.status(404).json({ message: "Team not found in this organization" });
                return;
            }
            project.teamId = teamId;
        }
        await project.save();
        res.status(200).json({ project });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong updating the project" });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        await Project_model_1.default.findByIdAndDelete(req.project._id);
        res.status(200).json({ message: "Project deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong deleting the project" });
    }
};
exports.deleteProject = deleteProject;
