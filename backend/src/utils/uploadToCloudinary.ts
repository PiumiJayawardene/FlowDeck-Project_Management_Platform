import cloudinary from "../config/cloudinary"
import { Readable } from "stream"

interface UploadResult {
  url: string
  publicId: string
}

export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "auto" = "auto"
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Upload failed"))
          return
        }
        resolve({ url: result.secure_url, publicId: result.public_id })
      }
    )

    Readable.from(buffer).pipe(uploadStream)
  })
}