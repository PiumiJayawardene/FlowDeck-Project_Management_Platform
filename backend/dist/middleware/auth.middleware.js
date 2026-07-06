"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401).json({ message: "Not authorized, no token provided" });
            return;
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined in .env");
        }
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        const user = await User_model_1.default.findById(decoded.userId);
        if (!user) {
            res.status(401).json({ message: "Not authorized, user not found" });
            return;
        }
        req.userId = user._id.toString();
        req.userRole = user.role;
        next();
    }
    catch (error) {
        res.status(401).json({ message: "Not authorized, invalid token" });
    }
};
exports.protect = protect;
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            res.status(403).json({ message: "You do not have permission to perform this action" });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
