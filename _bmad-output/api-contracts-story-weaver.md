# API Contracts - Story Weaver (Client)

**Part:** apps/story-weaver
**Type:** Web Client (React)
**Role:** Consumer of `story-weaver-api` and `api-server`

## Service Layer
Located in `src/services/`, extends `BaseService` from `@superapp/core-logic`.

### Character Service (`character.service.ts`)
Interacts with `API_ENDPOINTS.CHARACTERS` and `GENERATION`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `getByProject` | `GET /characters/by-project/:projectId` | Fetch characters for project |
| `extractCharacters` | `POST /generation/extract-characters/:projectId` | AI extraction from story |
| `generatePortraits` | `POST /generation/generate-portraits/:charId` | AI portrait generation |
| `setMasterPortrait` | `PUT /characters/:charId` | Update master portrait |
| `approveCharacter` | `PUT /characters/:charId` | Mark character as approved |

### Video Project Service (`project.service.ts`)
Interacts with `API_ENDPOINTS.VIDEO_PROJECTS`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `generateScript` | `POST /video-projects/generate-script` | Generate script from topic |
| `renderVideo` | `POST /video-projects/:id/render` | Trigger video rendering |
| `summarizeDescription` | `POST /generation/summarize-description/:id` | AI summary |

## Authentication & Base
- Uses `api` client from `@/config` (Axios instance).
- Authentication managed by `AuthProvider` (Token-based).
