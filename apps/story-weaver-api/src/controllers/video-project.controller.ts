/**
 * Video Project Controller
 */
import type { Request, Response } from 'express';
import { videoProjectService } from '../services/video-project.service.js';

export const getAll = async (req: Request, res: Response) => {
  const { page, perPage, search, status } = req.query;
  
  const filters: string[] = [];
  
  const searchStr = typeof search === 'string' ? search : undefined;
  const statusStr = typeof status === 'string' ? status : undefined;
  
  // Search filter
  if (searchStr && searchStr.trim()) {
    const s = searchStr.replace(/["%\\]/g, '');
    filters.push(`(name ~ "${s}" || description ~ "${s}")`);
  }
  
  // Status filter
  if (statusStr) {
    filters.push(`status = "${statusStr}"`);
  }
  
  // User filter - only show user's own projects
  if (req.user?.id) {
    filters.push(`userId = "${req.user.id}"`);
  }

  const result = await videoProjectService.getAll({
    page: page ? Number(page) : 1,
    perPage: perPage ? Number(perPage) : 50,
    filter: filters.length ? filters.join(' && ') : undefined,
  });

  res.json({ success: true, data: result });
};

export const getById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'ID is required' });
    return;
  }
  const item = await videoProjectService.getById(id);
  res.json({ success: true, data: item });
};

export const create = async (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const data = {
    ...(req.body as Record<string, unknown>),
    userId: req.user.id,
  };
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const item = await videoProjectService.create(data as any, req.user.id);
  res.status(201).json({ success: true, data: item });
};

export const update = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'ID is required' });
    return;
  }

  const item = await videoProjectService.update(
    id,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.body as any,
    req.user?.id
  );
  res.json({ success: true, data: item });
};

export const remove = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'ID is required' });
    return;
  }
  await videoProjectService.delete(id, req.user?.id);
  res.status(204).send();
};

export const restore = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'ID is required' });
    return;
  }
  const item = await videoProjectService.restore(id, req.user?.id);
  res.json({ success: true, data: item });
};
