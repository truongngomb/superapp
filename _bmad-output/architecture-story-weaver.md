# Architecture - Story Weaver

**Part:** apps/story-weaver
**Type:** Web Client (Micro-frontend)
**Stack:** React, Vite, Tailwind, TanStack Query

## Executive Summary
Story Weaver is a specialized web application for creating and managing video projects. It leverages AI to generate scripts, scenes, and visual assets. It is designed to run either standalone or embedded within the Web Core platform.

## Architecture Pattern
**Component-Based SPA:**
- **Pages:** Feature-centric views (Dashboard, Editor).
- **Components:** Reusable UI elements.
- **Services:** API abstraction layer.
- **Context/Providers:** Global state management.

## Key Features
- **Project Dashboard:** List and manage video projects.
- **Story Editor:** Interactive script editing and scene management.
- **AI Integration:** Interface for generating characters, scripts, and media.
- **Media Management:** Asset selection and preview.

## State Management
- **Server State:** `TanStack Query` handles data fetching, caching, and synchronization.
- **Global State:** React Context (`AppProviders`) for Auth, Theme, Settings.
- **Local State:** React `useState`/`useReducer` for complex UI interactions (e.g., Editor).

## Directory Structure
- `src/pages/`: Main views (Dashboard, Editor).
- `src/components/`: Shared UI components.
- `src/services/`: API client services.
- `src/hooks/`: Custom React hooks.
- `src/AppProviders.tsx`: Context composition.
