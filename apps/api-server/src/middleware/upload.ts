/**
 * File Upload Middleware
 * Handles multipart/form-data using multer
 */
import multer from 'multer';
import type { RequestHandler } from 'express';

// Configure storage
const storage = multer.memoryStorage(); // Store in memory for processing

// File filter
const fileFilter = (
  _req: Express.Request,
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
 * Middleware to handle optional file uploads
 * Use for routes that may or may not include files
 */
export const uploadOptional: RequestHandler = upload.any();
