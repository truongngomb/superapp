/**
 * Video Project Controller
 */
import { Request, Response } from 'express';
import { videoProjectService } from '../services/index.js';
import { CreateVideoProjectInput, UpdateVideoProjectInput } from '@superapp/shared-types';

export const getAll = async (req: Request, res: Response) => {
  const { page, limit, sort, order, search, status, isActive, isDeleted } = req.query;
  
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
      const s = search.replace(/["%\\]/g, '');
      filters.push(`(name ~ "${s}" || description ~ "${s}")`);
  }
  if (typeof status === 'string') filters.push(`status = "${status}"`);
  if (isActive !== undefined) filters.push(`isActive = ${String(isActive === 'true')}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${String(isDeleted === 'true')}`);

  const result = await videoProjectService.getPage({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sort: sort as string,
    order: order as 'asc' | 'desc',
    filter: filters.length ? filters.join(' && ') : undefined
  });

  res.json({ success: true, data: result });
};

export const getById = async (req: Request, res: Response) => {
  const item = await videoProjectService.getById(req.params['id'] as string);
  res.json({ success: true, data: item });
};

export const create = async (req: Request, res: Response) => {
  const item = await videoProjectService.create(req.body as CreateVideoProjectInput, req.user?.id);
  res.status(201).json({ success: true, data: item });
};

export const update = async (req: Request, res: Response) => {
  const item = await videoProjectService.update(req.params['id'] as string, req.body as UpdateVideoProjectInput, req.user?.id);
  res.json({ success: true, data: item });
};

export const remove = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const item = await videoProjectService.getById(id);
    if (item.isDeleted) {
        await videoProjectService.hardDelete(id, req.user?.id);
    } else {
        await videoProjectService.delete(id, req.user?.id);
    }
    res.status(204).send();
};

export const restore = async (req: Request, res: Response) => {
    await videoProjectService.restore(req.params['id'] as string, req.user?.id);
    res.status(200).json({ success: true });
};

export const generateScript = async (req: Request, res: Response) => {
    const topic = typeof req.body === 'object' && req.body !== null ? (req.body as { topic?: unknown }).topic : undefined;
    if (!topic || typeof topic !== 'string') {
        res.status(400).json({ success: false, message: 'Topic is required' });
        return;
    }

    // Dynamic import to avoid circular dependencies if any, but standard import is fine here
    const { aiGenerateService, videoSceneService } = await import('../services/index.js');
    
    // 1. Generate scenes from AI
    const generatedScenes = await aiGenerateService.generateScript(topic);
    
    // 2. Create a new Project (Draft)
    const project = await videoProjectService.create({
        name: topic,
        description: `AI generated video about ${topic}`,
        status: 'draft',
        settings: { aspectRatio: '9:16' }
    }, req.user?.id);

    // 3. Save scenes to DB
    await Promise.all(generatedScenes.map((scene, index) => 
        videoSceneService.create({
            project_id: project.id,
            order: index,
            script_text: scene.script_text,
            visual_prompt: scene.visual_prompt,
            duration: scene.duration || 5
        }, req.user?.id)
    ));

    res.status(201).json({ success: true, data: { projectId: project.id, scenesCount: generatedScenes.length } });
};

export const renderVideo = async (req: Request, res: Response) => {
    const { videoRenderService } = await import('../services/index.js');
    const projectId = req.params['id'] as string;
    
    // This process can be long, so we don't await the result but return accepted status
    // Ideally we use a queue like BullMQ, but for MVP we run async in background
    videoRenderService.renderProject(projectId, req.user?.id).catch((err: unknown) => {
        // Log background error
        console.error(`Background render failed for project ${projectId}`, err);
    });

    res.status(202).json({ success: true, message: 'Render started' });
};
