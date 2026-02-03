# Development Guide

**Project Type:** Monorepo (PNPM Workspaces + TurboRepo)
**Package Manager:** pnpm

## Prerequisites
- Node.js v20+
- PNPM (`corepack enable && corepack prepare pnpm@latest --activate`)
- Docker (optional, for container testing)
- PocketBase instance (for backend)

## Getting Started

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Environment Setup**
   Copy `.env.example` to `.env` in `apps/api-server`, `apps/story-weaver-api`, `apps/web-core`.
   
   *Key Variables:*
   - `POCKETBASE_URL`: URL to your PocketBase instance
   - `OPENAI_API_KEY`: For Story Weaver API
   - `GEMINI_API_KEY`: For API Server

3. **Start Development Server**
   ```bash
   # Start all apps (Turbo)
   pnpm dev
   
   # Start specific app
   pnpm dev:api      # API Server
   pnpm dev:sw-api   # Story Weaver API
   pnpm dev:web      # Web Core
   pnpm dev:sw       # Story Weaver
   ```

## Database Management
Managed via custom scripts in `apps/api-server`.

```bash
# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

## Testing & Linting
```bash
# Run all tests
pnpm test

# Lint all packages
pnpm lint
```

## Docker Build
To build the production image locally:

```bash
pnpm docker:build
```
This runs `docker build -f deploy/Dockerfile ...`
