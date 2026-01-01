import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

// Backblaze B2 S3-compatible configuration
export const b2Client = new S3Client({
  region: process.env.B2_REGION || "eu-central-003",
  endpoint: process.env.B2_ENDPOINT || "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
  forcePathStyle: true, // Required for B2
});

export const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || "kuvauspalvelut-portfolios";

// File size limits (in bytes)
export const FILE_LIMITS = {
  IMAGE_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  VIDEO_MAX_SIZE: 500 * 1024 * 1024, // 500MB
};

// Allowed file types
export const ALLOWED_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  videos: ["video/mp4", "video/mov", "video/webm", "video/quicktime"],
};

// Get public URL for a file (B2 public bucket)
export const getPublicUrl = (key) => {
  // B2 public URL format for S3-compatible API
  // Format: https://{bucketName}.{endpoint}/{key}
  if (!key) {
    throw new Error("Key is required for public URL");
  }
  const endpoint = process.env.B2_ENDPOINT 
    ? process.env.B2_ENDPOINT.replace("https://", "").replace("http://", "")
    : "s3.eu-central-003.backblazeb2.com";
  return `https://${B2_BUCKET_NAME}.${endpoint}/${key}`;
};

