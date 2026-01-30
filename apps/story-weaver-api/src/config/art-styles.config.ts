import { ArtStyleId, type ArtStyleConfig } from '../types/art-style.js';

export const ART_STYLES: ArtStyleConfig[] = [
  {
    id: ArtStyleId.CINEMATIC_REALISTIC,
    name: 'Điện ảnh Thực tế',
    description: 'Sắc nét, ánh sáng chuyên nghiệp, giống phim chiếu rạp.',
    prompt: 'cinematic lighting, photorealistic, 8k resolution, dof, arri alexa, shot on 35mm lens, highly detailed, dramatic atmosphere',
    negativePrompt: 'cartoon, painting, illustration, drawing, sketch, anime, blurring, noise, low quality, distortion, bad anatomy',
    previewImage: '/story-weaver/presets/cinematic.jpg',
  },
  {
    id: ArtStyleId.DOCUMENTARY,
    name: 'Phim Tài liệu',
    description: 'Chân thực, đời thường, ánh sáng tự nhiên.',
    prompt: 'natural lighting, journalism style, slight film grain, raw photo, candid shot, street photography, 4k',
    negativePrompt: 'studio lighting, overly staged, makeup, photoshop, 3d render, illustration, unreal engine',
    previewImage: '/story-weaver/presets/documentary.jpg',
  },
  {
    id: ArtStyleId.ANIMATION_3D,
    name: 'Hoạt hình 3D (Pixar/Disney)',
    description: 'Nhân vật dễ thương, màu sắc tươi sáng, bề mặt mượt mà.',
    prompt: '3d render, pixar style, disney style, unreal engine 5, vivid colors, cute, expressive, soft lighting, volumetric fog',
    negativePrompt: '2d, sketch, rough, photorealistic, scary, grim, noise, grainy, low poly, bad modeling',
    previewImage: '/story-weaver/presets/3d_animation.jpg',
  },
  {
    id: ArtStyleId.ANIME_JAPANESE,
    name: 'Anime Nhật Bản',
    description: 'Nét vẽ 2D sắc sảo, phong cách Ghibli hoặc Makoto Shinkai.',
    prompt: 'anime style, studio ghibli, makoto shinkai, detailed background, vibrant, cel shaded, 2d animation, high quality illustration',
    negativePrompt: '3d, photorealistic, western cartoon, sketch, messy, ugly, low res',
    previewImage: '/story-weaver/presets/anime.jpg',
  },
  {
    id: ArtStyleId.WATERCOLOR,
    name: 'Tranh Màu nước',
    description: 'Loang màu nhẹ nhàng, mộng mơ, nghệ thuật.',
    prompt: 'watercolor painting, soft edges, pastel colors, artistic, paper texture, traditional media, dreamy',
    negativePrompt: 'photorealistic, sharp lines, digital art, 3d, vector, bold lines',
    previewImage: '/story-weaver/presets/watercolor.jpg',
  },
  {
    id: ArtStyleId.CYBERPUNK,
    name: 'Cyberpunk (Tương lai)',
    description: 'Đèn neon, công nghệ cao, tối tăm nhưng rực rỡ.',
    prompt: 'cyberpunk, neon lights, futuristic city, high tech, dark atmosphere, purple and scyan, cinematic, blade runner style',
    negativePrompt: 'natural, daylight, sunshine, old, vintage, rustic, forest, nature, plain',
    previewImage: '/story-weaver/presets/cyberpunk.jpg',
  },
  {
    id: ArtStyleId.VINTAGE_FILM,
    name: 'Phim Nhựa Cổ điển',
    description: 'Màu film cũ, nostalgic, có hạt noise nhẹ.',
    prompt: 'vintage film, 1990s style, film grain, retro color grading, nostalgic, polaroid, kodak portra 400',
    negativePrompt: 'digital, sharp, modern, clean, hd, 4k, 8k, shiny, 3d',
    previewImage: '/story-weaver/presets/vintage.jpg',
  },
];

export const getArtStyleById = (id: string): ArtStyleConfig | undefined => {
  return ART_STYLES.find(style => style.id === id);
};
