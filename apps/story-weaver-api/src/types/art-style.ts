export enum ArtStyleId {
  CINEMATIC_REALISTIC = 'cinematic_realistic',
  DOCUMENTARY = 'documentary',
  ANIMATION_3D = 'animation_3d',
  ANIME_JAPANESE = 'anime_japanese',
  WATERCOLOR = 'watercolor',
  CYBERPUNK = 'cyberpunk',
  PIXEL_ART = 'pixel_art',
  VINTAGE_FILM = 'vintage_film'
}

export interface ArtStyleConfig {
  id: ArtStyleId | string;
  name: string;
  description?: string;
  prompt: string; // Positive prompt suffix
  negativePrompt?: string; // Additive negative prompt
  previewImage?: string; // URL to a preview for UI
}
