# API Contracts - Story Weaver API

**Part:** apps/story-weaver-api
**Type:** REST API (Express)
**Focus:** AI Generation and Content Management

## Authentication
All routes require authentication via `requireAuth` middleware.

## Characters
**Base Path:** `/characters`

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| GET | `/by-project/:projectId` | List characters for project | Auth |
| GET | `/:id` | Get character details | Auth |
| POST | `/` | Create character | Auth |
| PUT | `/:id` | Update character | Auth |
| DELETE | `/:id` | Delete character | Auth |
| POST | `/:id/generate-portraits` | Trigger AI portrait generation | Auth |

## Video Projects
**Base Path:** `/video-projects`

| Method | Endpoint | Description | Permission |
| :--- | :--- | :--- | :--- |
| GET | `/` | List all projects | Auth |
| GET | `/:id` | Get project details | Auth |
| POST | `/` | Create project | Auth |
| PUT | `/:id` | Update project | Auth |
| DELETE | `/:id` | Soft delete project | Auth |
| POST | `/:id/restore` | Restore project | Auth |

## AI Generation
**Base Path:** `/generation`
*Orchestration endpoints for complex AI workflows.*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/extract-characters/:projectId` | Analyze story & suggest characters |
| POST | `/generate-scenes/:projectId` | Generate script & scenes |
| POST | `/generate-images/:sceneId` | Generate keyframes |
| POST | `/generate-motion/:sceneId` | Generate motion clip |
| POST | `/render/:projectId` | Render final video |
| POST | `/generate-portraits/:charId` | Generate portrait options |
| POST | `/summarize-description/:projectId` | Summarize story |
