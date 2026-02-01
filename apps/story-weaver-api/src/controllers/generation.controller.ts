/**
 * Generation Controller
 * 
 * Handles AI generation requests for characters, scripts, and images.
 */
import { Request, Response } from 'express';
import { 
  scriptService, 
  imageGenService, 
  videoProjectService,
  characterService,
  videoSceneService,
  motionGenService,
  renderingService,
  aiTextService,
  settingService
} from '../services/index.js';
import { SWSettingKey } from '../types/settings.js';

/**
 * Helper to verify project ownership
 */
async function verifyProjectOwnership(projectId: string, userId?: string) {
  const project = await videoProjectService.getById(projectId);
  if (project.userId !== userId) {
    throw { status: 404, message: 'Project not found' };
  }
  return project;
}

/**
 * POST /projects/:projectId/extract-characters
 */
export const extractCharacters = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const suggestions = await scriptService.extractCharacters(projectId);
  res.json({ success: true, data: suggestions });
};

/**
 * POST /projects/:projectId/generate-scenes
 */
export const generateScenes = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const scenes = await scriptService.generateScenes(projectId);
  res.json({ success: true, data: scenes });
};

/**
 * POST /characters/:characterId/generate-portraits
 */
export const generatePortraits = async (req: Request, res: Response) => {
  const characterId = req.params['characterId'] as string;
  const character = await characterService.getById(characterId);
  await verifyProjectOwnership(character.projectId, req.user?.id);

  const options = await imageGenService.generateCharacterPortraits(characterId);
  res.json({ success: true, data: options });
};

/**
 * POST /scenes/:sceneId/generate-keyframes
 */
export const generateKeyframes = async (req: Request, res: Response) => {
  const sceneId = req.params['sceneId'] as string;
  const scene = await videoSceneService.getById(sceneId);
  await verifyProjectOwnership(scene.projectId, req.user?.id);

  const options = await imageGenService.generateSceneKeyframes(sceneId);
  res.json({ success: true, data: options });
};

/**
 * POST /scenes/:sceneId/generate-motion
 */
export const generateMotion = async (req: Request, res: Response) => {
  const sceneId = req.params['sceneId'] as string;
  const scene = await videoSceneService.getById(sceneId);
  await verifyProjectOwnership(scene.projectId, req.user?.id);

  const result = await motionGenService.generateSceneMotion(sceneId);
  res.json({ success: true, data: result });
};

/**
 * POST /projects/:projectId/render
 */
export const renderVideo = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  await verifyProjectOwnership(projectId, req.user?.id);

  const result = await renderingService.renderProject(projectId);
  res.json({ success: true, data: result });
};

/**
 * POST /summarize-description/:projectId
 * Generate a short description from story content using AI
 */
export const summarizeDescription = async (req: Request, res: Response) => {
  const projectId = req.params['projectId'] as string;
  const project = await verifyProjectOwnership(projectId, req.user?.id);

  if (!project.storyContent || project.storyContent.trim().length === 0) {
    res.status(400).json({ 
      success: false, 
      error: 'No story content available to summarize' 
    });
    return;
  }

  // Determine output language based on project's scriptLanguage
  const lang = project.scriptLanguage || 'vi';
  const langMap: Record<string, string> = {
    'vi': 'Vietnamese',
    'en': 'English',
    'ko': 'Korean'
  };
  const outputLanguage = langMap[lang] || 'Vietnamese';

  // Load prompt from DB (follows architecture pattern)
  const systemPromptTemplate = await settingService.get<string>(SWSettingKey.PROMPT_SUMMARY_GEN);
  const systemPrompt = systemPromptTemplate.replace('${outputLanguage}', outputLanguage);

  const userPrompt = `Summarize the following story content:\n\n${project.storyContent}`;

  const result = await aiTextService.generate(userPrompt, {
    systemPrompt,
    maxTokens: 150,
    temperature: 0.7
  });

  res.json({ 
    success: true, 
    data: { description: result.content.trim() } 
  });
};


