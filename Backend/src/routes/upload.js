import express from "express";
import multer from "multer";
import { authenticateToken } from "../middleware/auth.js";
import { generatePresignedUploadUrl, validateFile, uploadFileToB2 } from "../controllers/upload.js";

const router = express.Router();
// Configure multer for file uploads (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /api/upload/presigned-url
 * Generate a presigned URL for uploading a file to B2
 * Body: { filename, fileType, fileSize }
 */
router.post("/api/upload/presigned-url", authenticateToken, async (req, res) => {
  try {
    // Authorization: Only photographers can upload portfolio media
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can upload media" });
    }

    const { filename, fileType, fileSize } = req.body;

    // Validate input
    if (!filename || typeof filename !== "string") {
      return res.status(400).json({ error: "Filename is required" });
    }

    if (!fileType || typeof fileType !== "string") {
      return res.status(400).json({ error: "File type is required" });
    }

    if (!fileSize || typeof fileSize !== "number" || fileSize <= 0) {
      return res.status(400).json({ error: "Valid file size is required" });
    }

    // Validate file
    const validation = validateFile({ name: filename, type: fileType, size: fileSize });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const photographerId = req.user.uid;

    // Generate presigned URL
    const uploadData = await generatePresignedUploadUrl(photographerId, filename, fileType, fileSize);

    res.status(200).json({
      success: true,
      presignedUrl: uploadData.presignedUrl,
      key: uploadData.key,
      publicUrl: uploadData.publicUrl,
      expiresIn: uploadData.expiresIn,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    res.status(500).json({ error: error.message || "Failed to generate upload URL" });
  }
});

/**
 * POST /api/upload/file
 * Upload file directly through backend (bypasses CORS)
 * Body: multipart/form-data with file
 */
router.post("/api/upload/file", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    // Authorization: Only photographers can upload media
    if (req.user.userType !== "photographer") {
      return res.status(403).json({ error: "Only photographers can upload media" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Debug: log file info
    console.log("Upload request file:", {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const filename = req.file.originalname || req.file.filename || "unnamed-file";
    const fileType = req.file.mimetype || "application/octet-stream";
    const fileSize = req.file.size || 0;
    const buffer = req.file.buffer;
    const photographerId = req.user.uid;

    // Validate file
    const validation = validateFile({ name: filename, type: fileType, size: fileSize });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Upload file to B2
    const { key, publicUrl } = await uploadFileToB2(photographerId, filename, fileType, buffer);

    // Return media metadata
    res.status(200).json({
      success: true,
      media: {
        type: fileType.startsWith("image/") ? "image" : "video",
        url: publicUrl,
        key: key,
        filename: filename,
        size: fileSize,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: error.message || "Failed to upload file" });
  }
});

export default router;

