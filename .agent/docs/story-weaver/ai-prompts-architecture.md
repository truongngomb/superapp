# Story Weaver - AI Prompts Architecture

> **Last Updated**: 2026-02-01  
> **Author**: AI Agent  
> **Status**: Active

## Tổng Quan

Story Weaver sử dụng hệ thống AI để tự động hóa quá trình tạo video từ nội dung câu chuyện. Tài liệu này mô tả chi tiết kiến trúc và cơ chế hoạt động của các AI prompts trong ứng dụng.

---

## Kiến Trúc Hệ Thống

```
┌────────────────────────────────────────────────────────────────┐
│                      STORY WEAVER API                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │    ai.config.ts      │    │  default-settings.ts │          │
│  │  (Model + API Key)   │    │  (System Prompts)    │          │
│  └──────────┬───────────┘    └──────────┬───────────┘          │
│             │                           │                      │
│             ▼                           ▼                      │
│  ┌──────────────────────┐    ┌──────────────────────┐          │
│  │  ai-text.service.ts  │◄───│  setting.service.ts  │          │
│  │  (OpenAI SDK Client) │    │  (Load from DB)      │          │
│  └──────────┬───────────┘    └──────────────────────┘          │
│             │                                                  │
│             ▼                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │               ORCHESTRATION SERVICES             │          │
│  │  ┌─────────────────┐  ┌─────────────────┐        │          │
│  │  │ script.service  │  │ image-gen.svc   │        │          │
│  │  │ (Extract Chars) │  │ (Gen Portraits) │        │          │
│  │  │ (Gen Scenes)    │  │ (Gen Keyframes) │        │          │
│  │  └─────────────────┘  └─────────────────┘        │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Cấu Hình AI

### File: `src/config/ai.config.ts`

#### Environment Variables

| Variable | Default | Mô tả |
|----------|---------|-------|
| `AI_BASE_URL` | `https://ai.izp.one/v1` | Base URL của AI Proxy (OpenAI-compatible) |
| `AI_API_KEY` | `sk-dummy` | API Key cho AI service |
| `AI_DEFAULT_TEXT_MODEL` | `gemini-2.5-flash` | Model mặc định cho text generation |
| `AI_DEFAULT_IMAGE_MODEL` | `gemini-3-pro-image-preview` | Model mặc định cho image generation |
| `AI_MAX_RETRIES` | `3` | Số lần retry khi gọi API thất bại |
| `AI_RETRY_DELAY_MS` | `1000` | Thời gian chờ giữa các lần retry (ms) |
| `AI_REQUEST_TIMEOUT_MS` | `60000` | Timeout cho mỗi request (ms) |
| `AI_RATE_LIMIT_RPM` | `60` | Rate limit (requests per minute) |

#### Models Hỗ Trợ

**Text Generation Models:**

| Model ID | Loại | Mục đích |
|----------|------|----------|
| `gemini-2.5-flash` | Fast | Default, script generation |
| `gemini-2.5-flash-lite` | Fast | Lightweight tasks |
| `gemini-3-flash-preview` | Fast | Preview version |
| `gemini-3-pro-high` | High Quality | Character extraction, creative writing |
| `gemini-claude-sonnet-4-5` | High Quality | Complex reasoning |
| `gemini-claude-sonnet-4-5-thinking` | Reasoning | Chain-of-thought tasks |
| `gemini-claude-opus-4-5-thinking` | Reasoning | Most capable reasoning |
| `gpt-oss-120b-medium` | Open Source | Alternative option |

**Image Generation Models:**

| Model ID | Mục đích |
|----------|----------|
| `gemini-3-pro-image-preview` | Character portraits, scene keyframes |

---

## AI Services

### 1. AI Text Service (`ai-text.service.ts`)

Singleton service quản lý text generation thông qua OpenAI SDK.

#### Methods

```typescript
// Simple text generation
aiTextService.generate(prompt: string, options?: TextGenerationOptions): Promise<TextGenerationResult>

// Chat with message history
aiTextService.chat(messages: ChatMessage[], options?: TextGenerationOptions): Promise<TextGenerationResult>

// Generate and parse JSON response
aiTextService.generateJSON<T>(prompt: string, options?: TextGenerationOptions): Promise<T>

// Test connection
aiTextService.testConnection(): Promise<boolean>
```

#### Options

```typescript
interface TextGenerationOptions {
  model?: AITextModel;        // Model to use
  temperature?: number;       // Creativity (0-2, default 0.7)
  maxTokens?: number;         // Max tokens to generate
  stream?: boolean;           // Enable streaming
  systemPrompt?: string;      // System prompt
}
```

### 2. AI Image Service (`ai-image.service.ts`)

Singleton service cho image generation.

#### Methods

```typescript
// Generate images from prompt
aiImageService.generate(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>

// Generate with reference image
aiImageService.generateWithReference(prompt: string, referenceImageUrl: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult>
```

#### Prompt Construction

Image prompts được xây dựng theo cấu trúc:

```
[Base Quality Prompt] + [Art Style Prompt] + [Subject Prompt]
```

Ví dụ:
```
"high quality, detailed, 8k, masterpiece, 
 cinematic lighting, photorealistic, arri alexa, 
 Full body character design of Sarah. Young woman, 20s, athletic build..."
```

### 3. AI Video Service (`ai-video.service.ts`)

Service cho video generation (Image-to-Video). Hiện tại là placeholder.

```typescript
// Generate video from static image
aiVideoService.generateFromImage(imageUrl: string, prompt?: string, options?: VideoGenerationOptions): Promise<VideoGenerationResult>
```

---

## System Prompts

### Lưu trữ Prompts

Prompts được lưu trong database thông qua `settingService` và có thể được cập nhật qua Admin panel.

**File**: `src/config/default-settings.ts`  
**Keys**: Định nghĩa trong `src/types/settings.ts`

```typescript
enum SWSettingKey {
  PROMPT_SCRIPT_GEN = 'sw_prompt_script_gen',
  PROMPT_CHARACTER_EXTRACT = 'sw_prompt_character_extract',
  PROMPT_VISUAL_GEN_BASE = 'sw_prompt_visual_gen_base',
  PROMPT_SUMMARY_GEN = 'sw_prompt_summary_gen',
  FEATURE_USE_KOREAN_OPTIMIZATION = 'sw_feature_use_korean_opt',
}
```

### 1. Character Extraction Prompt

**Key**: `sw_prompt_character_extract`  
**Trigger**: `POST /generation/extract-characters/:projectId`  
**Service**: `scriptService.extractCharacters()`  
**Model**: `gemini-3-pro-high`

**System Prompt:**
```
You are an expert Story Analyst and Visual Director. Your task is to analyze 
the provided story content and extract a list of main characters.

For each character, you MUST use exactly these JSON keys:
1. name: The name of the character.
2. description: A brief summary of their role, personality, and significance.
3. visualTraits: A detailed visual description suitable for AI Image Generation 
   (Stable Diffusion/Midjourney style). Focus on physical appearance, clothing, 
   style, age, and distinctive features.

FORMAT INSTRUCTION:
You MUST respond with a valid JSON array of objects.
Do not include markdown formatting like ```json or ```. Just the raw JSON array.
```

**Output Format:**
```json
[
  {
    "name": "Sarah",
    "description": "A brave young archeologist seeking the lost city.",
    "visualTraits": "Young woman, 20s, athletic build, messy brown ponytail..."
  }
]
```

### 2. Script/Scene Generation Prompt

**Key**: `sw_prompt_script_gen`  
**Trigger**: `POST /generation/generate-scenes/:projectId`  
**Service**: `scriptService.generateScenes()`  
**Model**: `gemini-2.5-flash` (default)

**System Prompt (với dynamic variables):**
```
You are a professional film director and screenwriter.
Transform the following story into a series of detailed scenes for a short video 
optimized for ${project.targetPlatform} (${project.aspectRatio}).

CRITICAL CONSTRAINT: The TOTAL DURATION of the video MUST be exactly 
${project.targetDuration} seconds.

For each scene, you MUST use exactly these JSON keys:
- order: sequence number starting from 1.
- scriptText: The narration or dialogue for this scene.
- voiceover: The exact text to be spoken by a narrator (~3 words/second).
- textOverlay: Impactful text to be displayed on screen (max 5-7 words).
- visualPrompt: A detailed image generation prompt.
- cameraMovement: static, pan_left, pan_right, zoom_in, zoom_out, ken_burns, tilt_up, tilt_down.
- estimatedDuration: duration in seconds (aim for 3-6s per scene).

Respond with a raw JSON array of scene objects.
```

**Dynamic Injections:**
- `${project.targetPlatform}` - YouTube Shorts, TikTok, etc.
- `${project.aspectRatio}` - 9:16, 16:9, 1:1
- `${project.targetDuration}` - Total duration in seconds
- `${project.scriptLanguage}` - vi, en, ko → Language instruction

### 3. Visual Generation Base Prompt

**Key**: `sw_prompt_visual_gen_base`  
**Default**: `"high quality, detailed, 8k, masterpiece"`

Prompt này được append vào đầu mọi image generation request.

---

## Art Styles

### File: `src/config/art-styles.config.ts`

Mỗi Art Style bao gồm:
- `id`: Unique identifier
- `name`: Display name
- `description`: Mô tả ngắn
- `prompt`: Positive prompt keywords
- `negativePrompt`: Negative prompt keywords
- `previewImage`: Preview image URL

### Available Styles

| ID | Name | Prompt Keywords |
|----|------|-----------------|
| `cinematic_realistic` | Điện ảnh Thực tế | cinematic lighting, photorealistic, arri alexa, 35mm lens |
| `documentary` | Phim Tài liệu | natural lighting, journalism style, film grain, raw photo |
| `animation_3d` | Hoạt hình 3D | 3d render, pixar style, disney style, unreal engine 5, vivid colors |
| `anime_japanese` | Anime Nhật Bản | anime style, studio ghibli, makoto shinkai, cel shaded |
| `watercolor` | Tranh Màu nước | watercolor painting, soft edges, pastel colors, dreamy |
| `cyberpunk` | Cyberpunk | neon lights, futuristic city, dark atmosphere, blade runner |
| `vintage_film` | Phim Nhựa Cổ điển | vintage film, 1990s style, film grain, kodak portra 400 |

### Cách Style được áp dụng

```typescript
// ai-image.service.ts
const styleConfig = styleId ? getArtStyleById(styleId) : undefined;
const basePrompt = await settingService.get(SWSettingKey.PROMPT_VISUAL_GEN_BASE, '');

// Construct final prompt
const parts = [basePrompt];
if (styleConfig) parts.push(styleConfig.prompt);
parts.push(userPrompt);
const finalPrompt = parts.filter(Boolean).join(', ');

// Construct negative prompt
if (styleConfig?.negativePrompt) {
  finalNegativePrompt = styleConfig.negativePrompt;
}
```

---

## Orchestration Services

### 1. Script Service (`script.service.ts`)

Điều phối character extraction và scene generation.

```typescript
// Extract characters from story
scriptService.extractCharacters(projectId: string): Promise<CharacterSuggestion[]>

// Generate video scenes from story + characters
scriptService.generateScenes(projectId: string): Promise<VideoScene[]>
```

### 2. Image Generation Service (`image-gen.service.ts`)

Điều phối portrait và keyframe generation.

```typescript
// Generate 4 portrait options for a character
imageGenService.generateCharacterPortraits(characterId: string): Promise<PortraitOption[]>

// Generate 4 keyframe options for a scene
imageGenService.generateSceneKeyframes(sceneId: string): Promise<KeyframeOption[]>
```

**Character Consistency Logic:**
- Nếu character có `masterPortrait`, sử dụng làm reference image
- Inject `visualTraits` vào scene prompts: `"Featuring: ${char.name} (${char.visualTraits})"`

### 3. Motion Generation Service (`motion-gen.service.ts`)

Tạo video clips từ static images.

```typescript
// Generate 4s motion clip from scene keyframe
motionGenService.generateSceneMotion(sceneId: string): Promise<MotionResult>
```

---

## API Endpoints

### Generation Routes (`/api/story-weaver/generation/`)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/extract-characters/:projectId` | Extract characters từ story |
| POST | `/generate-scenes/:projectId` | Generate script và scenes |
| POST | `/generate-portraits/:characterId` | Generate 4 portrait options |
| POST | `/generate-keyframes/:sceneId` | Generate 4 keyframe options |
| POST | `/generate-motion/:sceneId` | Generate motion video clip |
| POST | `/render/:projectId` | Render final video |
| POST | `/summarize-description/:projectId` | AI summarize story → description (uses `PROMPT_SUMMARY_GEN` from DB) |

---

## Data Flow Examples

### Example 1: Character Extraction

```
User clicks "Extract Characters"
         ↓
Controller: extractCharacters()
         ↓
scriptService.extractCharacters(projectId)
         ↓
├── videoProjectService.getById() → Get story content
├── settingService.get(PROMPT_CHARACTER_EXTRACT) → Get system prompt
├── getArtStyleById() → Get style context (optional)
         ↓
aiTextService.generateJSON(prompt, {
  model: 'gemini-3-pro-high',
  systemPrompt: loadedPrompt,
  temperature: 0.3
})
         ↓
Parse JSON → Array<CharacterSuggestion>
         ↓
Return to client
```

### Example 2: Image Generation

```
User clicks "Generate Portraits"
         ↓
Controller: generatePortraits()
         ↓
imageGenService.generateCharacterPortraits(characterId)
         ↓
├── characterService.getById() → Get character info
├── videoProjectService.getById() → Get project for artStyleId
         ↓
Build prompt: "Full body character design of ${name}. ${visualTraits}..."
         ↓
aiImageService.generate(prompt, {
  count: 4,
  styleId: project.artStyleId
})
         ↓
├── settingService.get(PROMPT_VISUAL_GEN_BASE) → "high quality, 8k..."
├── getArtStyleById() → Style prompts
├── Construct: [Base] + [Style] + [User Prompt]
         ↓
OpenAI SDK → AI Proxy → Gemini Image Model
         ↓
Parse response → Extract image URLs/Base64
         ↓
Update character.portraitOptions
         ↓
Return to client
```

---

## Best Practices

### 1. Prompt Engineering

> ⚠️ **CRITICAL RULE: ENGLISH-ONLY PROMPTS**
>
> All AI prompts (system prompts, user prompts) **MUST be written in English**.
> This ensures optimal AI understanding and consistent behavior across all models.
>
> - ✅ Prompt: `"Summarize the following story into a concise description (max 150 chars)"`
> - ❌ Prompt: `"Tóm tắt câu chuyện sau thành mô tả ngắn gọn"`
>
> **Output language** can be controlled via instruction within the English prompt:
> ```
> "Summarize the following story. Write the output in Vietnamese."
> ```

- **Luôn yêu cầu JSON format rõ ràng** với example output
- **Sử dụng temperature thấp (0.3)** cho extraction tasks
- **Sử dụng temperature cao hơn (0.7)** cho creative tasks
- **Inject context** (Art Style, Language, Platform) vào prompt

### 2. Error Handling

- Retry logic với exponential backoff
- Fallback parsing cho JSON (extract từ markdown blocks)
- Log errors với context đầy đủ

### 3. Performance

- Cache settings với TTL 1 hour
- Parallel generation cho multiple images
- Timeout 60s cho text, 120s cho images

---

## Extending the System

### Thêm Prompt Mới

1. Thêm key vào `SWSettingKey` enum (`types/settings.ts`)
2. Thêm default value vào `DEFAULT_SW_SETTINGS` (`config/default-settings.ts`)
3. Load prompt trong service: `settingService.get(SWSettingKey.NEW_KEY)`

### Thêm Art Style Mới

1. Thêm ID vào `ArtStyleId` enum (`types/art-style.ts`)
2. Thêm config vào `ART_STYLES` array (`config/art-styles.config.ts`)
3. (Optional) Thêm preview image

### Thêm AI Model Mới

1. Thêm vào `AI_TEXT_MODELS` hoặc `AI_IMAGE_MODELS` (`config/ai.config.ts`)
2. Update type definitions
3. Test với `aiTextService.testConnection()`

---

## Troubleshooting

### Common Issues

| Issue | Nguyên nhân | Giải pháp |
|-------|-------------|-----------|
| "Empty response from AI" | Model không trả về content | Check model availability, increase timeout |
| "AI response is not valid JSON" | Response có markdown wrapper | Parser đã xử lý, check log để debug |
| "Connection test failed" | AI proxy không available | Verify AI_BASE_URL và AI_API_KEY |
| Image URL not found | Response format khác expected | Check message.images array hoặc base64 in content |

### Debug Tips

1. Check logs: `logger.info('ServiceName', 'Message', data)`
2. Test model: `aiTextService.testConnection()`
3. Verify settings: Direct query to `settings` collection in PocketBase

---

## References

- [OpenAI SDK Documentation](https://platform.openai.com/docs/api-reference)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Stable Diffusion Prompting Guide](https://stable-diffusion-art.com/prompt-guide/)
