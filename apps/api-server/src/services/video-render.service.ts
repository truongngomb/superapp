/**
 * Video Rendering Service using FFmpeg
 * 
 * Logic to compose video scenes into a final MP4 file.
 */
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ServiceUnavailableError, InternalServerError } from '../middleware/index.js';
import { videoSceneService } from './video-scene.service.js';
import { videoProjectService } from './video-project.service.js';

// Configure FFmpeg path if set in environment
if (config.ai.ffmpegPath) {
  ffmpeg.setFfmpegPath(config.ai.ffmpegPath);
}

export class VideoRenderService {
  
  /**
   * Check if FFmpeg is available
   */
  async checkFfmpeg(): Promise<boolean> {
    return new Promise((resolve) => {
        ffmpeg.getAvailableFormats((err) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (err) {
                logger.warn('Render', 'FFmpeg not available:', err.message);
                resolve(false);
            } else {
                resolve(true);
            }
        });
    });
  }

  /**
   * Render a project into a video file
   */
  async renderProject(projectId: string, userId?: string): Promise<string> {
    const isFfmpegReady = await this.checkFfmpeg();
    if (!isFfmpegReady) {
        throw new ServiceUnavailableError('Renderer Service (FFmpeg) is missing or misconfigured');
    }

    // 1. Update status to Rendering
    await videoProjectService.update(projectId, { status: 'rendering' }, userId);

    try {
        const scenes = await videoSceneService.getByProjectId(projectId);
        if (!scenes.length) {
            throw new Error('Project has no scenes to render');
        }

        // 2. Prepare Output
        const outputFilename = `project-${projectId}-${String(Date.now())}.mp4`;
        const outputPath = path.join(process.cwd(), 'uploads', 'renders', outputFilename);
        
        // Ensure directory exists
        const renderDir = path.dirname(outputPath);
        if (!fs.existsSync(renderDir)) {
            fs.mkdirSync(renderDir, { recursive: true });
        }

        // 3. Construct FFmpeg command (Mocking basic concat for now)
        // Real implementation would involve complex filter_complex for images + text + audio
        // For phase 1, we will simulate a render delay or generate a dummy Color bars video
        
        // eslint-disable-next-line @typescript-eslint/return-await
        return new Promise((resolve, reject) => {
            logger.info('Render', `Starting render for project ${projectId}`);
            
            // Simulating a dummy video generation for MVP/Test if no real assets
            const command = ffmpeg();

            // Create a simple slideshow or text video
            // Since we might lack actual image files, let's create a blank video for 5 seconds per scene
            const totalDuration = scenes.reduce((acc: number, s) => acc + (s.duration ?? 5), 0);
            
            command
                .input('color=c=blue:s=1080x1920')
                .inputOptions(['-f', 'lavfi'])
                .outputOptions(['-t', totalDuration.toString()])
                .output(outputPath)
                .on('end', () => {
                    logger.info('Render', `Render complete: ${outputPath}`);
                    void videoProjectService.update(projectId, { status: 'completed' }, userId);
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    logger.error('Render', 'FFmpeg error', err);
                    void videoProjectService.update(projectId, { status: 'draft' }, userId);
                    reject(new InternalServerError('Render failed'));
                })
                .run();
        });

    } catch (error) {
        logger.error('Render', 'Render process failed', error);
        await videoProjectService.update(projectId, { status: 'draft' }, userId);
        throw error;
    }
  }
}

export const videoRenderService = new VideoRenderService();
