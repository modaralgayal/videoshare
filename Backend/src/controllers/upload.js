import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { b2Client, B2_BUCKET_NAME, FILE_LIMITS, ALLOWED_TYPES, getPublicUrl } from "../config/b2Config.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a presigned URL for uploading a file directly to B2
 */
export const generatePresignedUploadUrl = async (photographerId, filename, fileType, fileSize) => {
  // Validate file type
  const isImage = ALLOWED_TYPES.images.includes(fileType);
  const isVideo = ALLOWED_TYPES.videos.includes(fileType);

  if (!isImage && !isVideo) {
    throw new Error(`Invalid file type. Allowed types: ${[...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos].join(", ")}`);
  }

  // Validate file size
  const maxSize = isImage ? FILE_LIMITS.IMAGE_MAX_SIZE : FILE_LIMITS.VIDEO_MAX_SIZE;
  if (fileSize > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File size exceeds limit. Maximum size: ${maxSizeMB}MB`);
  }

  // Generate unique file key
  const fileExtension = filename.split(".").pop();
  const uniqueId = uuidv4();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${photographerId}/${uniqueId}/${sanitizedFilename}`;

  // Create presigned POST URL (allows direct upload from client)
  const command = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });

  // Generate presigned URL (expires in 5 minutes)
  const presignedUrl = await getSignedUrl(b2Client, command, { expiresIn: 300 });

  return {
    presignedUrl,
    key,
    publicUrl: getPublicUrl(key),
    expiresIn: 300, // 5 minutes
  };
};

/**
 * Validate file before upload
 */
export const validateFile = (file) => {
  const { type, size, name } = file;

  // Check file type
  const isImage = ALLOWED_TYPES.images.includes(type);
  const isVideo = ALLOWED_TYPES.videos.includes(type);

  if (!isImage && !isVideo) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: images (${ALLOWED_TYPES.images.join(", ")}) or videos (${ALLOWED_TYPES.videos.join(", ")})`,
    };
  }

  // Check file size
  const maxSize = isImage ? FILE_LIMITS.IMAGE_MAX_SIZE : FILE_LIMITS.VIDEO_MAX_SIZE;
  if (size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${Math.round(size / (1024 * 1024))}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { valid: true };
};

/**
 * Upload file directly to B2 from backend (bypasses CORS)
 */
export const uploadFileToB2 = async (photographerId, filename, fileType, buffer) => {
  // Validate file type
  const isImage = ALLOWED_TYPES.images.includes(fileType);
  const isVideo = ALLOWED_TYPES.videos.includes(fileType);

  if (!isImage && !isVideo) {
    throw new Error(`Invalid file type. Allowed types: ${[...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos].join(", ")}`);
  }

  // Validate file size
  const maxSize = isImage ? FILE_LIMITS.IMAGE_MAX_SIZE : FILE_LIMITS.VIDEO_MAX_SIZE;
  if (buffer.length > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File size exceeds limit. Maximum size: ${maxSizeMB}MB`);
  }

  // Generate unique file key
  const uniqueId = uuidv4();
  // Ensure filename is a string and sanitize it
  const safeFilename = (filename || "unnamed-file").toString();
  const sanitizedFilename = safeFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${photographerId}/${uniqueId}/${sanitizedFilename}`;

  // Upload file to B2
  await b2Client.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: fileType,
    })
  );

  return {
    key,
    publicUrl: getPublicUrl(key),
  };
};

