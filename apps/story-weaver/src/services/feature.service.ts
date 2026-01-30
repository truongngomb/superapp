// import { BaseService } from '@superapp/core-logic';
import { api } from '@/config';

// Define local types for FE to avoid coupling with BE
export interface ArtStyleConfig {
  id: string;
  name: string;
  description?: string;
  previewImage?: string;
}

class FeatureService {
  async getArtStyles(): Promise<ArtStyleConfig[]> {
     const response = await api.get<{ data: ArtStyleConfig[] }>('/story-weaver/features/art-styles');
     return Array.isArray(response.data) ? response.data : 
            (Array.isArray(response) ? response : []);
  }
}

export const featureService = new FeatureService();
