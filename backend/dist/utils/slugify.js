"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueSlug = void 0;
const Organization_model_1 = __importDefault(require("../models/Organization.model"));
const generateUniqueSlug = async (name) => {
    const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Organization_model_1.default.findOne({ slug })) {
        slug = `${baseSlug}-${counter}`;
        counter += 1;
    }
    return slug;
};
exports.generateUniqueSlug = generateUniqueSlug;
