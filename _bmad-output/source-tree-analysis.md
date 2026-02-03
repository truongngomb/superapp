# Source Tree Analysis

**Root:** `E:\Workspaces\NNT\my-project`
**Type:** Monorepo (PNPM Workspaces)

## Directory Structure

```
my-project/
├── apps/                          # Application packages
│   ├── api-server/                # Backend API Service (Express)
│   │   ├── src/
│   │   │   ├── controllers/       # Request handlers (Auth, Users, Markdown)
│   │   │   ├── routes/            # API Route definitions
│   │   │   ├── schemas/           # Zod validation schemas
│   │   │   └── services/          # Business logic
│   │   └── package.json
│   │
│   ├── story-weaver/              # Story Weaver Web App (React)
│   │   ├── src/
│   │   │   ├── pages/             # Feature pages (Dashboard, Editor)
│   │   │   ├── components/        # Shared components
│   │   │   ├── services/          # Client API services
│   │   │   └── AppProviders.tsx   # State/Context providers
│   │   └── package.json
│   │
│   ├── story-weaver-api/          # Story Weaver AI Backend (Express)
│   │   ├── src/
│   │   │   ├── routes/            # AI/Project routes
│   │   │   ├── services/          # AI integration logic
│   │   │   └── schemas/           # Data models
│   │   └── package.json
│   │
│   └── web-core/                  # Web Core / Mobile App (React + Capacitor)
│       ├── src/
│       │   ├── pages/             # Admin, Categories, Home
│       │   └── services/          # Core services
│       └── package.json
│
├── packages/                      # Shared libraries
│   ├── core-logic/                # Shared business logic (Auth, BaseService)
│   ├── core-sdk/                  # Internal SDK/Client
│   ├── shared-types/              # Shared TypesScript definitions & Zod schemas
│   └── ui-kit/                    # UI Component Library (Radix UI + Tailwind)
│       ├── src/
│       │   ├── components/        # Atoms, Molecules
│       │   └── layouts/           # App layouts
│       └── package.json
│
├── mobile/                        # (Empty/Placeholder)
├── docs/                          # Existing documentation
├── package.json                   # Root workspace config
├── pnpm-workspace.yaml            # Workspace definition
└── turbo.json                     # Turborepo pipeline config
```

## Critical Folders Analysis

### Apps
- **api-server**: Central hub for user management, authentication, and markdown content. Entry point: `src/index.ts`.
- **story-weaver**: Focused on video creation and AI storytelling. Entry point: `src/main.tsx`.
- **story-weaver-api**: Specialized backend for AI generation tasks. Entry point: `src/index.ts`.
- **web-core**: The "platform" app that likely integrates features or serves as the mobile container. Entry point: `src/main.tsx`.

### Packages
- **ui-kit**: The design system. Critical for UI consistency.
- **shared-types**: Single source of truth for Data Models (Zod schemas) used by both Frontends and Backends.
- **core-logic**: Reusable logic (Auth, API clients) to prevent duplication across apps.

## Integration Points
- **Frontend -> Backend**: Frontends (`story-weaver`, `web-core`) call Backends (`api-server`, `story-weaver-api`) via services in `src/services` or `core-logic`.
- **Shared Code**: All apps consume `shared-types` and `core-logic`.
- **Mobile**: `web-core` wraps the web app in Capacitor for Android/iOS deployment.
