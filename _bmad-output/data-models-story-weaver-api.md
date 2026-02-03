# Data Models - Story Weaver API

**Part:** apps/story-weaver-api
**Source:** Imported from `@superapp/shared-types` via `src/types/index.js`

## Core Schemas

### Video Project
Managed by `VideoProjectCreateSchema` and `VideoProjectUpdateSchema`.
- Represents a storytelling project containing scenes and characters.
- Includes `VideoProjectSettingsSchema` for AI generation parameters.

### Character
Managed by `CharacterCreateSchema` and `CharacterUpdateSchema`.
- Represents a character in the story.
- Fields: Name, Description, Visual Traits, Portrait URL.

### Video Scene
Managed by `VideoSceneCreateSchema` and `VideoSceneUpdateSchema`.
- Represents a segment of the video.
- Contains: Script, Visual Prompt, Audio URL, Video URL.

## Validation
- Uses Zod schemas re-exported in `src/schemas/index.ts`.
- Schemas are cast to `z.ZodSchema` to handle version mismatches with shared workspace packages.
