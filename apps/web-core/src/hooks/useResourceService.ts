import { api, createAbortController, type RequestConfig, env } from '@/config';
import type { PaginatedResponse } from '@superapp/shared-types';

export interface ServiceConfig extends Omit<RequestConfig, 'signal'> {
  timeout?: number;
  signal?: AbortSignal;
}

export interface ResourceService<T, CreateInput = unknown, UpdateInput = unknown, ListParams = Record<string, unknown>> {
  getPage: (params?: ListParams, config?: ServiceConfig) => Promise<PaginatedResponse<T>>;
  getById: (id: string, config?: ServiceConfig) => Promise<T>;
  create: (data: CreateInput) => Promise<T>;
  update: (id: string, data: UpdateInput) => Promise<T>;
  delete: (id: string) => Promise<void>;
  restore: (id: string) => Promise<void>;
  deleteMany: (ids: string[]) => Promise<void>;
  restoreMany: (ids: string[]) => Promise<void>;
  batchUpdateStatus: (ids: string[], isActive: boolean) => Promise<void>;
  getAllForExport: (params?: ListParams, config?: ServiceConfig) => Promise<T[]>;
}

export function createResourceService<T, CreateInput, UpdateInput, ListParams extends Record<string, unknown>>(
  endpoint: string
): ResourceService<T, CreateInput, UpdateInput, ListParams> {
  return {
    async getPage(params?: ListParams, config?: ServiceConfig) {
      const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
      try {
        const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
              queryParams.append(key, String(value));
            }
          });
        }
        const queryString = queryParams.toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return await api.get(url, { signal: config?.signal ?? controller.signal });
      } finally {
        clear();
      }
    },

    async getById(id: string, config?: ServiceConfig) {
      return api.get(`${endpoint}/${id}`, config);
    },

    async create(data: CreateInput) {
      return api.post(endpoint, data);
    },

    async update(id: string, data: UpdateInput) {
      return api.put(`${endpoint}/${id}`, data);
    },

    async delete(id: string) {
      return api.delete(`${endpoint}/${id}`);
    },

    async restore(id: string) {
      return api.post(`${endpoint}/${id}/restore`);
    },

    async deleteMany(ids: string[]) {
      return api.post(`${endpoint}/batch-delete`, { ids });
    },

    async restoreMany(ids: string[]) {
      return api.post(`${endpoint}/batch-restore`, { ids });
    },

    async batchUpdateStatus(ids: string[], isActive: boolean) {
      return api.post(`${endpoint}/batch-status`, { ids, isActive });
    },

    async getAllForExport(params?: ListParams, config?: ServiceConfig) {
       const { controller, clear } = createAbortController(config?.timeout ?? env.API_REQUEST_TIMEOUT);
      try {
         const queryParams = new URLSearchParams();
        if (params) {
          Object.entries(params).forEach(([key, value]) => {
            if (key === 'page' || key === 'limit') return; // Skip pagination for export
            if (value !== undefined && value !== null && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')) {
              queryParams.append(key, String(value));
            }
          });
        }
        const queryString = queryParams.toString();
        const url = queryString ? `${endpoint}/export?${queryString}` : `${endpoint}/export`;
        return await api.get(url, { signal: config?.signal ?? controller.signal });
      } finally {
        clear();
      }
    }
  };
}
