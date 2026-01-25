/**
 * Media Service (Frontend)
 */
import { api } from '../config';
import type { MediaUploadResponse, PaginatedResponse, Media } from '@superapp/shared-types';

export const mediaService = {
  /**
   * Get list of media
   */
  async getList(
    page = 1, 
    limit = 20, 
    refId?: string, 
    refType?: string
  ): Promise<PaginatedResponse<Media>> {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    
    if (refId) params.append('refId', refId);
    if (refType) params.append('refType', refType);
    
    return api.get<PaginatedResponse<Media>>(`/media?${params.toString()}`);
  },

  /**
   * Upload image/file
   */
  async upload(file: File, refId?: string, refType?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (refId) formData.append('refId', refId);
    if (refType) formData.append('refType', refType);

    return api.post<MediaUploadResponse>('/media/upload', formData);
  },

  /**
   * Delete media
   * @param id Media ID
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/media/${id}`);
  },
};
