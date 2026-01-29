/**
 * Motion Generation Service
 * 
 * Orchestrates AI motion clip generation for scenes.
 * Converts selected keyframes into short video clips.
 */
import { aiVideoService } from './ai-video.service.js';
import { videoSceneService } from './video-scene.service.js';
import { logger } from '../utils/logger.js';

class MotionGenService {
  /**
   * Generate a motion clip for a specific scene
   * 
   * @param sceneId ID of the scene to generate motion for
   */
  async generateSceneMotion(sceneId: string) {
    const scene = await videoSceneService.getById(sceneId);
    
    // Check if the scene has a selected keyframe
    const imageUrl = scene.selectedKeyframe || scene.imageUrl;
    
    if (!imageUrl) {
      throw new Error(`Scene ${sceneId} has no image. Generate an image first.`);
    }

    try {
      logger.info('MotionGenService', `Generating motion for scene ${sceneId} using image ${imageUrl}`);
      
      const result = await aiVideoService.generateFromImage(
        imageUrl,
        scene.visualPrompt || '',
        {
          // We can add motion scale or duration based on scene description if needed
          duration: scene.duration || 4
        }
      );

      // Update scene with the generated video clip URL
      await videoSceneService.update(sceneId, {
        videoClipUrl: result.video.url,
        status: 'video_ready' // Update status to reflect video is ready
      });

      return {
        sceneId,
        videoClipUrl: result.video.url,
        duration: result.video.duration,
        generatedAt: result.video.generatedAt
      };
    } catch (error) {
      logger.error('MotionGenService', `Motion generation failed for scene ${sceneId}`, error);
      throw error;
    }
  }
}

export const motionGenService = new MotionGenService();
