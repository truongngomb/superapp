/**
 * Image Generation Service
 * 
 * Orchestrates AI image generation for characters and scenes.
 * Handles character consistency logic and artifact creation.
 */
import { aiImageService } from './ai-image.service.js';
import { characterService } from './character.service.js';
import { videoSceneService } from './video-scene.service.js';
import { videoProjectService } from './video-project.service.js';
import { logger } from '../utils/logger.js';
import type { 
  PortraitOption
} from '../types/index.js';
import type { Character } from '../types/character.js';


class ImageGenService {
  /**
   * Generate portrait options for a character
   */
  async generateCharacterPortraits(characterId: string): Promise<PortraitOption[]> {
    const character = await characterService.getById(characterId);
    
    // Construct prompt for portrait
    const prompt = `Professional character portrait of ${character.name}. ${character.visualTraits}. 
Cinematic lighting, high detail, masterpiece, 4k. Studio background or appropriate setting. 
Focus on facial features and clear character appearance.`;

    try {
      const result = await aiImageService.generate(prompt, {
        count: 4,
        width: 1024,
        height: 1024,
      });

      const options: PortraitOption[] = result.images.map(img => ({
        url: img.url,
        prompt: img.prompt,
      }));

      // Update character with options
      await characterService.update(characterId, {
        portraitOptions: options
      });

      return options;
    } catch (error) {
      logger.error('ImageGenService', `Character portrait generation failed for ${characterId}`, error);
      throw error;
    }
  }

  /**
   * Generate keyframe options for a scene
   */
  async generateSceneKeyframes(sceneId: string): Promise<PortraitOption[]> {
    const scene = await videoSceneService.getById(sceneId);
    const project = await videoProjectService.getById(scene.projectId);
    
    // Fetch characters mentioned in the scene
    const characters: Character[] = [];
    if (scene.characterIds && scene.characterIds.length > 0) {
      for (const charId of scene.characterIds) {
        try {
          const char = await characterService.getById(charId);
          characters.push(char);
        } catch {
          logger.warn('ImageGenService', `Character ${charId} not found for scene ${sceneId}`);
        }
      }
    }

    // Logic for Character Consistency (BRIEF 4.2)
    // If characters have master portraits, we should ideally use them as reference
    const masterReference = characters.find(c => c.masterPortraitUrl)?.masterPortraitUrl;

    const basePrompt = scene.visualPrompt || `Cinematic shot for a story. ${project.aspectRatio} aspect ratio.`;
    
    // Enrich prompt with character visual traits if not already present
    let enrichedPrompt = basePrompt;
    if (characters.length > 0) {
      const traits = characters.map(c => `${c.name} (${c.visualTraits})`).join(', ');
      enrichedPrompt = `${basePrompt}. Featuring: ${traits}. Ensure consistent appearance.`;
    }

    try {
      let result;
      if (masterReference) {
        // Use reference image if available
        result = await aiImageService.generateWithReference(enrichedPrompt, masterReference, {
          count: 4,
          // Use project's aspect ratio
          ...this.getDimensionsFromAspectRatio(project.aspectRatio || '9:16')
        });
      } else {
        result = await aiImageService.generate(enrichedPrompt, {
          count: 4,
          ...this.getDimensionsFromAspectRatio(project.aspectRatio || '9:16')
        });
      }

      const options: PortraitOption[] = result.images.map(img => ({
        url: img.url,
        prompt: img.prompt,
      }));

      // Update scene with options
      await videoSceneService.update(sceneId, {
        keyframeOptions: options
      });

      return options;
    } catch (error) {
      logger.error('ImageGenService', `Scene keyframe generation failed for ${sceneId}`, error);
      throw error;
    }
  }

  private getDimensionsFromAspectRatio(ratio: string): { width: number, height: number } {
    switch (ratio) {
      case '16:9': return { width: 1344, height: 768 };
      case '9:16': return { width: 768, height: 1344 };
      case '1:1': return { width: 1024, height: 1024 };
      case '4:5': return { width: 896, height: 1120 };
      default: return { width: 1024, height: 1024 };
    }
  }
}

export const imageGenService = new ImageGenService();
