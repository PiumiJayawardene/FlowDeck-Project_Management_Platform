"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireOrgAdmin = exports.requireOrgMembership = void 0;
const Organization_model_1 = __importDefault(require("../models/Organization.model"));
const requireOrgMembership = async (req, res, next) => {
    try {
        const orgId = req.params.orgId;
        const organization = await Organization_model_1.default.findById(orgId);
        if (!organization) {
            res.status(404).json({ message: "Organization not found" });
            return;
        }
        const membership = organization.members.find((member) => member.user.toString() === req.userId);
        if (!membership) {
            res.status(403).json({ message: "You are not a member of this organization" });
            return;
        }
        req.organization = organization;
        req.orgRole = membership.role;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong verifying organization access" });
    }
};
exports.requireOrgMembership = requireOrgMembership;
const requireOrgAdmin = (req, res, next) => {
    if (req.orgRole !== "admin") {
        res.status(403).json({ message: "Only organization admins can perform this action" });
        return;
    }
    next();
};
exports.requireOrgAdmin = requireOrgAdmin;
