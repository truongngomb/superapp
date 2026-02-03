# Architecture - Story Weaver API

**Part:** apps/story-weaver-api
**Type:** Backend Service
**Stack:** Node.js, Express, OpenAI, PocketBase

## Executive Summary
The Story Weaver API provides the specialized backend logic for the Story Weaver application. It focuses on AI orchestration, managing the complex workflow of generating scripts, scenes, and media assets using LLMs and Generative AI services.

## Architecture Pattern
**Orchestration Service:**
- **Routes:** Orchestrate complex workflows (e.g., "Generate Scene").
- **Services:** Interface with external AI providers (OpenAI, Gemini).
- **Controllers:** Manage the flow of generation tasks.

## Key Capabilities

### AI Generation
- **Character Extraction:** Analyzes text to identify characters.
- **Script Generation:** Converts topics/outlines into structured scripts.
- **Asset Generation:** Generates prompts for image/video generation.

### Project Management
- Manages the lifecycle of `VideoProject` entities.
- Handles CRUD for `Characters` and `Scenes`.
- Synchronizes state with PocketBase.

## Integration
- **OpenAI/Gemini:** For text and code generation.
- **PocketBase:** For persistence of projects and assets.
- **API Server:** Likely shares authentication context.

## Directory Structure
- `src/routes/`: Generation and Project endpoints.
- `src/controllers/`: Orchestration logic.
- `src/prompts/`: System prompts for AI models.
- `src/schemas/`: Validation models.
