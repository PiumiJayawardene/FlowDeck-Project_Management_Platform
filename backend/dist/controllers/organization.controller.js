"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeMember = exports.inviteMember = exports.updateOrganization = exports.getOrganization = exports.getMyOrganizations = exports.createOrganization = void 0;
const Organization_model_1 = __importDefault(require("../models/Organization.model"));
const User_model_1 = __importDefault(require("../models/User.model"));
const slugify_1 = require("../utils/slugify");
const createOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            res.status(400).json({ message: "Organization name must be at least 2 characters" });
            return;
        }
        const slug = await (0, slugify_1.generateUniqueSlug)(name);
        const organization = await Organization_model_1.default.create({
            name: name.trim(),
            slug,
            ownerId: req.userId,
            members: [{ user: req.userId, role: "admin", joinedAt: new Date() }],
        });
        res.status(201).json({ organization });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong creating the organization" });
    }
};
exports.createOrganization = createOrganization;
const getMyOrganizations = async (req, res) => {
    try {
        const organizations = await Organization_model_1.default.find({
            "members.user": req.userId,
        })
            .populate("members.user", "name email avatarUrl")
            .sort({
            createdAt: -1,
        });
        res.status(200).json({ organizations });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong fetching organizations" });
    }
};
exports.getMyOrganizations = getMyOrganizations;
const getOrganization = async (req, res) => {
    try {
        const organization = await req.organization.populate("members.user", "name email avatarUrl");
        res.status(200).json({ organization });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong fetching the organization" });
    }
};
exports.getOrganization = getOrganization;
const updateOrganization = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim().length < 2) {
            res.status(400).json({ message: "Organization name must be at least 2 characters" });
            return;
        }
        req.organization.name = name.trim();
        await req.organization.save();
        res.status(200).json({ organization: req.organization });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong updating the organization" });
    }
};
exports.updateOrganization = updateOrganization;
const inviteMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        if (!email) {
            res.status(400).json({ message: "Email is required" });
            return;
        }
        const validRoles = ["admin", "manager", "member"];
        const assignedRole = validRoles.includes(role) ? role : "member";
        const user = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404).json({ message: "No account exists with this email yet" });
            return;
        }
        const organization = req.organization;
        const alreadyMember = organization.members.some((member) => member.user.toString() === user._id.toString());
        if (alreadyMember) {
            res.status(409).json({ message: "This user is already a member of the organization" });
            return;
        }
        organization.members.push({ user: user._id, role: assignedRole, joinedAt: new Date() });
        await organization.save();
        res.status(200).json({ organization });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong inviting the member" });
    }
};
exports.inviteMember = inviteMember;
const removeMember = async (req, res) => {
    try {
        const { userId } = req.params;
        const organization = req.organization;
        if (organization.ownerId.toString() === userId) {
            res.status(400).json({ message: "The organization owner cannot be removed" });
            return;
        }
        organization.members = organization.members.filter((member) => member.user.toString() !== userId);
        await organization.save();
        res.status(200).json({ organization });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong removing the member" });
    }
};
exports.removeMember = removeMember;
