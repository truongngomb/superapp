/**
 * Video Scene Controller
 */
import { Request, Response } from 'express';
import { videoSceneService } from '../services/index.js';
import { CreateVideoSceneInput, UpdateVideoSceneInput } from '@superapp/shared-types';

export const getAll = async (req: Request, res: Response) => {
  const { page, limit, sort, order, search, project_id, isActive, isDeleted } = req.query;
  
  const filters: string[] = [];
  if (typeof search === 'string' && search.trim()) {
      const s = search.replace(/["%\\]/g, '');
      filters.push(`(script_text ~ "${s}" || visual_prompt ~ "${s}")`);
  }
  if (typeof project_id === 'string') filters.push(`project_id = "${project_id}"`);
  if (isActive !== undefined) filters.push(`isActive = ${String(isActive === 'true')}`);
  if (isDeleted !== undefined) filters.push(`isDeleted = ${String(isDeleted === 'true')}`);

  const result = await videoSceneService.getPage({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    sort: (sort as string) || 'order',
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    order: (order as 'asc' | 'desc') || 'asc',
    filter: filters.length ? filters.join(' && ') : undefined
  });

  res.json({ success: true, data: result });
};

export const getById = async (req: Request, res: Response) => {
  const item = await videoSceneService.getById(req.params['id'] as string);
  res.json({ success: true, data: item });
};

export const create = async (req: Request, res: Response) => {
  const item = await videoSceneService.create(req.body as CreateVideoSceneInput, req.user?.id);
  res.status(201).json({ success: true, data: item });
};

export const update = async (req: Request, res: Response) => {
  const item = await videoSceneService.update(req.params['id'] as string, req.body as UpdateVideoSceneInput, req.user?.id);
  res.json({ success: true, data: item });
};

export const remove = async (req: Request, res: Response) => {
    const id = req.params['id'] as string;
    const item = await videoSceneService.getById(id);
    if (item.isDeleted) {
        await videoSceneService.hardDelete(id, req.user?.id);
    } else {
        await videoSceneService.delete(id, req.user?.id);
    }
    res.status(204).send();
};

export const restore = async (req: Request, res: Response) => {
    await videoSceneService.restore(req.params['id'] as string, req.user?.id);
    res.status(200).json({ success: true });
};
