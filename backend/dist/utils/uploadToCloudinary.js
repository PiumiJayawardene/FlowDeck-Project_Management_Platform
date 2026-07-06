"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const stream_1 = require("stream");
const uploadBufferToCloudinary = (buffer, folder, resourceType = "auto") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => {
            if (error || !result) {
                reject(error || new Error("Upload failed"));
                return;
            }
            resolve({ url: result.secure_url, publicId: result.public_id });
        });
        stream_1.Readable.from(buffer).pipe(uploadStream);
    });
};
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
