/**
 * File Upload Middleware
 * Handles multipart/form-data using multer
 */
import multer from 'multer';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { fileTypeFromBuffer } from 'file-type';

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
});

/**
 * Middleware to validate file magic bytes (Prevent Upload Bypass)
 * Checks if the actual file content matches allowed types.
 */
export const validateFileTypes = async (req: Request, _res: Response, next: NextFunction) => {
  if (!req.file && (!req.files || (Array.isArray(req.files) && req.files.length === 0))) {
    next();
    return;
  }

  try {
    const files: Express.Multer.File[] = [];
    
    // Normalize files input
    if (req.file) {
      files.push(req.file);
    }
    
    if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        // Handle object format (upload.fields)
        Object.values(req.files).forEach((fileArray) => {
          files.push(...fileArray);
        });
      }
    }

    for (const file of files) {
      // Skip validation if no buffer (should not happen with memoryStorage)
      // if (!file.buffer) continue;

      const detected = await fileTypeFromBuffer(file.buffer);

      // Rule 1: Must be detectable
      // Rule 2: Must be an image (matching our fileFilter)
      if (!detected || !detected.mime.startsWith('image/')) {
        next(new Error(`Security: File content validation failed for '${file.originalname}'. Detected type: ${detected?.mime || 'unknown'}`));
        return;
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    next(new Error('Internal server error during file validation'));
  }
};

/**
 * Middleware to handle optional file uploads
 * Use for routes that may or may not include files
 * Includes both Multer handling and Magic Byte validation
 */
export const uploadOptional: RequestHandler[] = [
  upload.any(),
  validateFileTypes as unknown as RequestHandler 
];
