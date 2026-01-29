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

class ScriptService {
  /**
   * Extract character suggestions from story content
   */
  async extractCharacters(projectId: string): Promise<CharacterSuggestion[]> {
    const project = await videoProjectService.getById(projectId);
    if (!project.storyContent) {
      throw new Error('Project has no story content to extract characters from');
    }

    const systemPrompt = `You are a professional screenwriter. 
Analyze the following story and extract the main characters.
For each character, provide:
- name: Clear, concise name.
- description: Personality, role in story, and key traits.
- visualTraits: Detailed physical appearance for an AI image generator (Stable Diffusion/Flux). 
  Focus on: gender, approximate age, hair style/color, eye color, clothing style, and unique features.

Respond with a JSON array of objects.`;

    const prompt = `Story: ${project.storyContent}`;

    try {
      const response = await aiTextService.generateJSON<{ characters: CharacterSuggestion[] }>(prompt, {
        systemPrompt,
        temperature: 0.3, // Lower temperature for more consistent extraction
      });

      return response.characters;
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
    const characters = await characterService.getAllFiltered({ filter: `project_id = "${projectId}"` });

    if (!project.storyContent) {
      throw new Error('Project has no story content');
    }

    const characterContext = characters.map(c => `- ${c.name}: ${c.description}. Visuals: ${c.visualTraits}`).join('\n');

    const systemPrompt = `You are a professional film director and screenwriter.
Transform the following story into a series of detailed scenes for a short video.
Target Platform: ${project.targetPlatform || 'unknown'}
Aspect Ratio: ${project.aspectRatio || '9:16'}

For each scene, provide:
- order: sequence number starting from 1.
- scriptText: The narration or dialogue for this scene.
- voiceover: The exact text to be spoken by a narrator or character.
- textOverlay: Impactful text to be displayed on screen (max 5-7 words).
- visualPrompt: A detailed image generation prompt. IMPORTANT: Use character names to refer to them. Focus on action, setting, lighting, and cinematic style.
- cameraMovement: Choose from: static, pan_left, pan_right, zoom_in, zoom_out, ken_burns, tilt_up, tilt_down.
- estimatedDuration: estimated seconds (3-8s per scene).

The total duration should aim for approximately ${project.targetDuration || 60} seconds.
Respond with a JSON array of scene objects.`;

    const prompt = `Story: ${project.storyContent}\n\nExisting Characters:\n${characterContext}`;

    try {
      const { scenes } = await aiTextService.generateJSON<{ scenes: CreateVideoSceneInput[] }>(prompt, {
        systemPrompt,
        temperature: 0.7,
      });

      // Clear existing scenes first? Usually yes for a re-generation
      const existingScenes = await videoSceneService.getByProject(projectId);
      for (const scene of existingScenes) {
        await videoSceneService.hardDelete(scene.id);
      }

      // Create new scenes
      const createdScenes: VideoScene[] = [];
      for (const sceneInput of scenes) {
        // Simple character mapping (check if names mentioned in visual prompt)
        const relevantCharIds = characters
          .filter(c => sceneInput.visualPrompt?.toLowerCase().includes(c.name.toLowerCase()))
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
