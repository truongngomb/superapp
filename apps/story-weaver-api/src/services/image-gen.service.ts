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
import crypto from 'crypto';


class ImageGenService {
  /**
   * Generate portrait options for a character
   */
  async generateCharacterPortraits(characterId: string): Promise<PortraitOption[]> {
    const character = await characterService.getById(characterId);
    const project = await videoProjectService.getById(character.projectId);
    
    // Construct prompt for full body character design
    const prompt = `Full body character design of ${character.name}. ${character.visualTraits}. 
View from head to toe, standing pose, neutral background.
High resolution, detailed clothing and footwear.`;

    try {
      // Use 9:16 aspect ratio for full body shots
      const dimensions = this.getDimensionsFromAspectRatio('9:16');
      const result = await aiImageService.generate(prompt, {
        count: 4,
        ...dimensions,
        styleId: project.artStyleId,
      });

      const options: PortraitOption[] = result.images.map(img => ({
        id: img.id,
        url: img.url,
        prompt: img.prompt,
        generatedAt: img.generatedAt,
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
  async generateSceneKeyframes(sceneId: string) {
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
          styleId: project.artStyleId,
          // Use project's aspect ratio
          ...this.getDimensionsFromAspectRatio(project.aspectRatio || '9:16')
        });
      } else {
        result = await aiImageService.generate(enrichedPrompt, {
          count: 4,
          styleId: project.artStyleId,
          ...this.getDimensionsFromAspectRatio(project.aspectRatio || '9:16')
        });
      }

      const options = result.images.map(img => ({
        id: crypto.randomUUID(),
        url: img.url,
        prompt: img.prompt,
        seed: undefined, // Seed might be available in result, but for now undefined
        generatedAt: new Date().toISOString(),
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
