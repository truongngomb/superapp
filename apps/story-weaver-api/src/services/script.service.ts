/**
 * Script Service
 * 
 * Orchestrates AI script generation and character extraction.
 */
import { aiTextService } from './ai-text.service.js';
import { characterService } from './character.service.js';
import { videoSceneService } from './video-scene.service.js';
import { artifactService } from './artifact.service.js';
import { videoProjectService } from './video-project.service.js';
import type { 
  CharacterSuggestion, 
  VideoScene, 
  CreateVideoSceneInput
} from '../types/index.js';
import { logger } from '../utils/logger.js';

import { settingService } from './setting.service.js';
import { SWSettingKey } from '../types/settings.js';
import { getArtStyleById } from '../config/art-styles.config.js';

class ScriptService {
  /**
   * Extract character suggestions from story content
   */
  async extractCharacters(projectId: string): Promise<CharacterSuggestion[]> {
    const project = await videoProjectService.getById(projectId);
    if (!project.storyContent) {
      throw new Error('Project has no story content to extract characters from');
    }

    const systemPrompt = await settingService.get<string>(SWSettingKey.PROMPT_CHARACTER_EXTRACT);
    
    // Include Art Style context if available
    const style = project.artStyleId ? getArtStyleById(project.artStyleId) : null;
    const styleNote = style 
      ? `\n\nART STYLE CONTEXT: The project style is "${style.name}" (${style.description}). 
Focus character visual descriptions on traits that complement this style.` 
      : '';
      
    const prompt = `Story: ${project.storyContent}${styleNote}`;

    try {
      const response = await aiTextService.generateJSON<{ characters?: CharacterSuggestion[] } | CharacterSuggestion[]>(prompt, {
        systemPrompt,
        temperature: 0.3, // Lower temperature for more consistent extraction
      });

      if (Array.isArray(response)) {
        return response;
      }
      return response.characters || [];
    } catch (error) {
      logger.error('ScriptService', `Character extraction failed for project ${projectId}`, error);
      throw error;
    }
  }

  /**
   * Generate video scenes (script, visual prompt, camera) from story and characters
   */
  async generateScenes(projectId: string): Promise<VideoScene[]> {
    const project = await videoProjectService.getById(projectId);
    const characters = await characterService.getAllFiltered({ filter: `projectId = "${projectId}"` });

    if (!project.storyContent) {
      throw new Error('Project has no story content');
    }

    const characterContext = characters.map(c => `- ${c.name}: ${c.description}. Visuals: ${c.visualTraits}`).join('\n');

    const systemPrompt = await settingService.get<string>(SWSettingKey.PROMPT_SCRIPT_GEN);
    
    // Inject Target Platform and Aspect Ratio if available
    const configuredPrompt = systemPrompt
      .replace('${project.targetPlatform}', project.targetPlatform || 'unknown')
      .replace('${project.aspectRatio}', project.aspectRatio || '9:16')
      .replace('${project.targetDuration}', String(project.targetDuration || 60));

    // Include Art Style context for scenes
    const style = project.artStyleId ? getArtStyleById(project.artStyleId) : null;
    const styleNote = style 
      ? `\n\nART STYLE: ${style.name}\nSTYLE DESCRIPTION: ${style.description}\nPlease ensure all "visualPrompt" fields are optimized for this artistic direction.` 
      : '';

    const prompt = `Story: ${project.storyContent}${styleNote}\n\nExisting Characters:\n${characterContext}`;

    try {
      const aiResponse = await aiTextService.generateJSON<{ scenes?: CreateVideoSceneInput[] } | CreateVideoSceneInput[]>(prompt, {
        systemPrompt: configuredPrompt,
        temperature: 0.7,
      });

      let scenes: CreateVideoSceneInput[] = [];
      
      if (Array.isArray(aiResponse)) {
        scenes = aiResponse;
      } else if (aiResponse && Array.isArray(aiResponse.scenes)) {
        scenes = aiResponse.scenes;
      } else {
        logger.error('ScriptService', 'Invalid AI response format', aiResponse);
        throw new Error('AI failed to generate a valid list of scenes');
      }

      // Clear existing scenes first? Usually yes for a re-generation
      const existingScenes = await videoSceneService.getByProject(projectId);
      for (const scene of existingScenes) {
        await videoSceneService.hardDelete(scene.id);
      }

      // Create new scenes
      const createdScenes: VideoScene[] = [];
      for (const sceneInput of scenes) {
        // Improved character mapping
        const relevantCharIds = characters
          .filter(c => {
            const nameLower = c.name.toLowerCase();
            const promptLower = (sceneInput.visualPrompt || '').toLowerCase();
            const scriptLower = (sceneInput.scriptText || '').toLowerCase();
            return promptLower.includes(nameLower) || scriptLower.includes(nameLower);
          })
          .map(c => c.id);

        const scene = await videoSceneService.create({
          ...sceneInput,
          projectId,
          characterIds: relevantCharIds,
          status: 'prompt_ready'
        });
        createdScenes.push(scene);
      }

      // Save script artifact for versioning
      await artifactService.create({
        projectId,
        userId: project.userId,
        type: 'script',
        entityType: 'project',
        entityId: projectId,
        version: await this.getNextArtifactVersion(projectId, 'script'),
        status: 'draft',
        data: { scenes }
      });

      return createdScenes;
    } catch (error) {
      logger.error('ScriptService', `Scene generation failed for project ${projectId}`, error);
      throw error;
    }
  }

  private async getNextArtifactVersion(projectId: string, type: string): Promise<number> {
    const latest = await artifactService.getLatestVersion(projectId, type);
    return latest ? latest.version + 1 : 1;
  }
}

export const scriptService = new ScriptService();
