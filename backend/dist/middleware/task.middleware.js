"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTaskAccess = void 0;
const Task_model_1 = __importDefault(require("../models/Task.model"));
const Organization_model_1 = __importDefault(require("../models/Organization.model"));
const requireTaskAccess = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        const task = await Task_model_1.default.findById(taskId);
        if (!task) {
            res.status(404).json({ message: "Task not found" });
            return;
        }
        const organization = await Organization_model_1.default.findById(task.organizationId);
        if (!organization) {
            res.status(404).json({ message: "Parent organization not found" });
            return;
        }
        const membership = organization.members.find((member) => member.user.toString() === req.userId);
        if (!membership) {
            res.status(403).json({ message: "You do not have access to this task" });
            return;
        }
        req.task = task;
        req.organization = organization;
        req.orgRole = membership.role;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong verifying task access" });
    }
};
exports.requireTaskAccess = requireTaskAccess;
