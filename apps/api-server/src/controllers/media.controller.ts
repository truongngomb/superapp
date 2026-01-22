import type { Request, Response } from 'express';
import { mediaService } from '../services/media.service.js';
import { asyncHandler, BadRequestError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { createLogger } from '../utils/logger.js';
import { upload, validateFileTypes } from '../middleware/upload.js';

const log = createLogger('MediaController');

export const mediaController = {
  /**
   * Upload file
   * POST /api/media/upload
   */
  upload: [
    requireAuth,
    upload.single('file'),
    validateFileTypes,
    asyncHandler(async (req: Request, res: Response) => {
      // Extended request for Multer
      const file = (req as Request & { file?: Express.Multer.File }).file;
      
      if (!file) {
        throw new BadRequestError('No file uploaded');
      }

      // Convert to FormData for PocketBase
      const formData = new FormData();
      
      // Node.18+ FormData requires Blob/File. 
      // We can use a Blob from the buffer.
      const blob = new Blob([file.buffer as unknown as BlobPart], { type: file.mimetype });
      formData.append('file', blob, file.originalname);

      // Add other fields if present
      const body = req.body as { alt?: string; caption?: string; refId?: string; refType?: string };

      if (body.alt) formData.append('alt', body.alt);
      if (body.caption) formData.append('caption', body.caption);
      if (body.refId) formData.append('refId', body.refId);
      if (body.refType) formData.append('refType', body.refType);

      // Call service
      const result = await mediaService.upload(formData, req.user?.id);

      log.info('Media uploaded successfully', { id: result.id });

      res.status(201).json({
        success: true,
        data: result,
      });
    }),
  ],

  /**
   * List files
   * GET /api/media
   */
  list: [
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 20;
      const refId = req.query.refId as string | undefined;
      const refType = req.query.refType as string | undefined;
      
      // Build filter string for PocketBase
      const filters: string[] = [];
      if (refId) filters.push(`refId = "${refId}"`);
      if (refType) filters.push(`refType = "${refType}"`);
      
      try {
        const result = await mediaService.getPage({
          page,
          limit,
          sort: '-created', // Newest first
          filter: filters.length > 0 ? filters.join(' && ') : undefined,
        });

        res.status(200).json({
          success: true,
          data: result,
        });
      } catch (error) {
        log.error('Failed to list media', { error, filter: filters });
        throw error;
      }
    }),
  ],
  /**
   * Delete file
   * DELETE /api/media/:id
   */
  delete: [
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const { id } = req.params;
      
      if (!id || typeof id !== 'string') {
         throw new BadRequestError('ID required');
      }

      await mediaService.delete(id, req.user?.id);

      log.info('Media deleted successfully', { id });

      res.status(200).json({
        success: true,
        message: 'Media deleted successfully'
      });
    }),
  ],
};
