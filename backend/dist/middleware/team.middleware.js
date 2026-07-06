"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTeamAccess = void 0;
const Team_model_1 = __importDefault(require("../models/Team.model"));
const Organization_model_1 = __importDefault(require("../models/Organization.model"));
const requireTeamAccess = async (req, res, next) => {
    try {
        const teamId = req.params.teamId;
        const team = await Team_model_1.default.findById(teamId);
        if (!team) {
            res.status(404).json({ message: "Team not found" });
            return;
        }
        const organization = await Organization_model_1.default.findById(team.organizationId);
        if (!organization) {
            res.status(404).json({ message: "Parent organization not found" });
            return;
        }
        const membership = organization.members.find((member) => member.user.toString() === req.userId);
        if (!membership) {
            res.status(403).json({ message: "You do not have access to this team" });
            return;
        }
        req.team = team;
        req.organization = organization;
        req.orgRole = membership.role;
        next();
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong verifying team access" });
    }
};
exports.requireTeamAccess = requireTeamAccess;
