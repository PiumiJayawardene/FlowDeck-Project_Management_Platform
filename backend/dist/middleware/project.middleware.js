"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireProjectAccess = void 0;
const Project_model_1 = __importDefault(require("../models/Project.model"));
const Organization_model_1 = __importDefault(require("../models/Organization.model"));
const requireProjectAccess = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project_model_1.default.findById(projectId);
        if (!project) {
            res.status(404).json({ message: "Project not found" });
            return;
        }
        const organization = await Organization_model_1.default.findById(project.organizationId);
        if (!organization) {
            res.status(404).json({ message: "Parent organization not found" });
            return;
        }
        const membership = organization.members.find((member) => member.user.toString() === req.userId);
        if (!membership) {
            res.status(403).json({ message: "You do not have access to this project" });
            return;
        }
        req.project = project;
        req.organization = organization;
        req.orgRole = membership.role;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong verifying project access" });
    }
};
exports.requireProjectAccess = requireProjectAccess;
