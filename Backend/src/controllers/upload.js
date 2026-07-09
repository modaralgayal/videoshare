import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { b2Client, B2_BUCKET_NAME, FILE_LIMITS, ALLOWED_TYPES, getPublicUrl } from "../config/b2Config.js";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";
import { validateString, validateNumber, validateFile as validateFileUtil } from "../validation/index.js";

// ClamAV virus scanning integration
let clamscanInitialized = false;
let clamscanInstance = null;
let initPromise = null;

// Initialize ClamAV using the NodeClam pattern from the clamscan package
initPromise = (async () => {
  try {
    // Dynamically import the clamscan module (CommonJS)
    const clamscanModule = await import('clamscan');
    const NodeClam = clamscanModule.default || clamscanModule;

    // Configure ClamAV to use the local clamscan binary (since we don't have clamd daemon)
    const clamConfig = {
      remove_infected: false, // We're scanning buffers, not saving files
      quarantine_infected: false,
      clamscan: {
        path: '/usr/bin/clamscan', // Path to clamscan binary
        scan_archives: true,     // Scan archives if needed
        active: true             // Enable clamscan method
      },
      clamdscan: {
        active: false            // Disable clamdscan method (we don't have daemon running)
      },
      preference: 'clamscan'     // Prefer clamscan over clamdscan
    };

    // Initialize the clamscan instance (returns a promise)
    const instance = await new NodeClam().init(clamConfig);
    clamscanInstance = instance;
    clamscanInitialized = true;
    console.log('ClamAV initialized successfully (using clamscan binary)');
  } catch (error) {
    // ClamAV not available - we'll handle this gracefully in the scan function
    console.warn('ClamAV not available:', error.message);
    console.warn('File uploads will proceed without virus scanning (consider enabling ClamAV for production)');
    // Leave clamscanInitialized as false and clamscanInstance as null
  }
})();

/**
 * Generate a presigned URL for uploading a file directly to B2
 */
export const generatePresignedUploadUrl = async (photographerId, filename, fileType, fileSize) => {
  // Validate input parameters using our validation utilities
  const photographerIdResult = validateString(photographerId, { minLength: 1 });
  if (!photographerIdResult.valid) {
    throw new Error(photographerIdResult.error);
  }

  const filenameResult = validateString(filename, { minLength: 1 });
  if (!filenameResult.valid) {
    throw new Error(filenameResult.error);
  }

  const fileTypeResult = validateString(fileType, { minLength: 1 });
  if (!fileTypeResult.valid) {
    throw new Error(fileTypeResult.error);
  }

  const fileSizeResult = validateNumber(fileSize, { min: 1, integer: true });
  if (!fileSizeResult.valid) {
    throw new Error(fileSizeResult.error);
  }

  // Validate file using our validation utility
  const fileValidation = validateFileUtil(
    { name: filenameResult.value, type: fileTypeResult.value, size: fileSizeResult.value },
    {
      allowedTypes: [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos],
      maxSize: Math.max(FILE_LIMITS.IMAGE_MAX_SIZE, FILE_LIMITS.VIDEO_MAX_SIZE)
    }
  );

  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  // Generate unique file key
  const fileExtension = filenameResult.value.split(".").pop();
  const uniqueId = uuidv4();
  const sanitizedFilename = filenameResult.value.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${photographerIdResult.value}/${uniqueId}/${sanitizedFilename}`;

  // Create presigned PUT URL (allows direct upload from client)
  const command = new PutObjectCommand({
    Bucket: B2_BUCKET_NAME,
    Key: key,
    ContentType: fileTypeResult.value,
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
  // Use our validation utility
  return validateFileUtil(file, {
    allowedTypes: [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos],
    maxSize: Math.max(FILE_LIMITS.IMAGE_MAX_SIZE, FILE_LIMITS.VIDEO_MAX_SIZE)
  });
};

/**
 * Scan file buffer for viruses using ClamAV
 * @param {Buffer} buffer - File buffer to scan
 * @returns {Promise<boolean>} - true if clean, throws if infected or scanner unavailable
 */
export const scanFileForViruses = async (buffer) => {
  // Wait for initialization to complete (either success or failure)
  await initPromise;

  // If ClamAV is not available, fail closed for security
  if (!clamscanInitialized) {
    throw new Error('Virus scanning service unavailable');
  }

  try {
    // Get the clamscan instance (await the promise from init)
    const clamscan = clamscanInstance;

    const fs = await import('fs');
    const { v4: uuidv4 } = await import('uuid');
    const os = await import('os');
    const path = await import('path');

    let tempFilePath = null;

    try {
        // Create a temporary file in the system temp directory
        const tempFileName = `clamav-scan-${uuidv4()}`;
        tempFilePath = path.join(os.tmpdir(), tempFileName);

        // Write the buffer to a temporary file
        fs.writeFileSync(tempFilePath, buffer);

        // Scan the temporary file using is_infected method (works with local binary)
        const result = await clamscan.is_infected(tempFilePath);

        // Check if file is infected
        if (result.is_infected === true) {
            throw new Error('Virus detected in uploaded file');
        }

        return true; // File is clean
    } catch (error) {
        // Handle ClamAV-specific errors
        if (error.message && (error.message.includes('Virus') || error.message.includes('infected') || error.message.includes('FOUND'))) {
            throw error; // Re-throw virus detection errors
        }
        // Handle other errors (timeout, etc.)
        console.error('ClamAV scanning error:', error);
        // Fail closed: if scanner unavailable, reject upload for security
        throw new Error('Unable to scan file for viruses: ' + (error.message || 'Unknown error'));
    } finally {
        // Clean up the temporary file
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (cleanupError) {
                console.warn('Failed to cleanup temporary file:', tempFilePath, cleanupError.message);
            }
        }
    }
  } catch (error) {
    // Handle initialization errors (shouldn't happen as we awaited initPromise)
    if (error.message && (error.message.includes('Virus') || error.message.includes('infected') || error.message.includes('FOUND'))) {
        throw error; // Re-throw virus detection errors
    }
    // Handle other errors (timeout, etc.)
    console.error('ClamAV scanning error:', error);
    // Fail closed: if scanner unavailable, reject upload for security
    throw new Error('Unable to scan file for viruses: ' + (error.message || 'Unknown error'));
  }
};

/**
 * Upload file directly to B2 from backend (bypasses CORS)
 */
export const uploadFileToB2 = async (photographerId, filename, fileType, buffer) => {
  // Validate input parameters
  const photographerIdResult = validateString(photographerId, { minLength: 1 });
  if (!photographerIdResult.valid) {
    throw new Error(photographerIdResult.error);
  }

  const filenameResult = validateString(filename, { minLength: 1 });
  if (!filenameResult.valid) {
    throw new Error(filenameResult.error);
  }

  const fileTypeResult = validateString(fileType, { minLength: 1 });
  if (!fileTypeResult.valid) {
    throw new Error(fileTypeResult.error);
  }

  // Validate buffer
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('File buffer is required');
  }

  const bufferSizeResult = validateNumber(buffer.length, { min: 1, integer: true });
  if (!bufferSizeResult.valid) {
    throw new Error(bufferSizeResult.error);
  }

  // Validate file using our validation utility
  const fileValidation = validateFileUtil(
    { name: filenameResult.value, type: fileTypeResult.value, size: bufferSizeResult.value },
    {
      allowedTypes: [...ALLOWED_TYPES.images, ...ALLOWED_TYPES.videos],
      maxSize: Math.max(FILE_LIMITS.IMAGE_MAX_SIZE, FILE_LIMITS.VIDEO_MAX_SIZE)
    }
  );

  if (!fileValidation.valid) {
    throw new Error(fileValidation.error);
  }

  // SCAN FILE FOR VIRUSES BEFORE UPLOAD
  await scanFileForViruses(buffer);

  // Generate unique file key
  const uniqueId = uuidv4();
  // Ensure filename is a string and sanitize it
  const safeFilename = (filenameResult.value || "unnamed-file").toString();
  const sanitizedFilename = safeFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${photographerIdResult.value}/${uniqueId}/${sanitizedFilename}`;

  // Upload file to B2
  await b2Client.send(
    new PutObjectCommand({
      Bucket: B2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: fileTypeResult.value,
    })
  );

  return {
    key,
    publicUrl: getPublicUrl(key),
  };
};