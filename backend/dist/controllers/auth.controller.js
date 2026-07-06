"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatar = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const generateToken_1 = require("../utils/generateToken");
const uploadToCloudinary_1 = require("../utils/uploadToCloudinary");
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({ message: "Please provide name, email, and password" });
            return;
        }
        if (password.length < 8) {
            res.status(400).json({ message: "Password must be at least 8 characters" });
            return;
        }
        const existingUser = await User_model_1.default.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ message: "An account with this email already exists" });
            return;
        }
        const user = await User_model_1.default.create({ name, email, password });
        (0, generateToken_1.generateTokenAndSetCookie)(res, user._id.toString());
        res.status(201).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong during registration" });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: "Please provide email and password" });
            return;
        }
        const user = await User_model_1.default.findOne({ email: email.toLowerCase() }).select("+password");
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        (0, generateToken_1.generateTokenAndSetCookie)(res, user._id.toString());
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong during login" });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.cookie("token", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
};
exports.logout = logout;
const getMe = async (req, res) => {
    try {
        const user = await User_model_1.default.findById(req.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong" });
    }
};
exports.getMe = getMe;
const uploadAvatar = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).json({ message: "No file provided" });
            return;
        }
        const result = await (0, uploadToCloudinary_1.uploadBufferToCloudinary)(file.buffer, "avatars", "image");
        const user = await User_model_1.default.findByIdAndUpdate(req.userId, { avatarUrl: result.url }, { new: true });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Something went wrong uploading the avatar" });
    }
};
exports.uploadAvatar = uploadAvatar;
