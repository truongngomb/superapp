# SuperApp Architecture

> Tài liệu kiến trúc hệ thống SuperApp

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         MONOREPO                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                        apps/                             │   │
│  │  ┌─────────────────┐    ┌─────────────────┐             │   │
│  │  │   web-core      │    │   api-server    │             │   │
│  │  │   (React SPA)   │◀──▶│   (Express)     │◀───┐        │   │
│  │  └─────────────────┘    └─────────────────┘    │        │   │
│  └─────────────────────────────────────────────────│────────┘   │
│  ┌─────────────────────────────────────────────────│────────┐   │
│  │                     packages/                   │        │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────┐│        │   │
│  │  │ shared-types │ │  core-logic  │ │  ui-kit  ││        │   │
│  │  │   (Zod)      │ │  (Hooks)     │ │  (UI)    ││        │   │
│  │  └──────────────┘ └──────────────┘ └──────────┘│        │   │
│  └─────────────────────────────────────────────────│────────┘   │
└────────────────────────────────────────────────────│────────────┘
                                                     │
                                            ┌────────┴────────┐
                                            │   PocketBase    │
                                            │   (SQLite)      │
                                            └─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 7, TypeScript 5.9, TailwindCSS |
| Backend | Express 5, Node.js (ESM) |
| Database | PocketBase (SQLite) |
| Validation | Zod |
| Caching | NodeCache |
| i18n | i18next (EN, VI, KO) |
| Mobile | Capacitor (Android/iOS) |

## Frontend Architecture

### Layer Structure
```
src/
├── pages/           # Page components (route-level)
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── services/        # API service layer
├── context/         # React Context providers
├── types/           # TypeScript types
├── utils/           # Utility functions
├── config/          # Configuration (api, env, i18n)
└── locales/         # i18n translations
```

### Data Flow
```
Page → Hook → Service → API → Backend
 ↓        ↓
Context  Toast
```

### Context Providers (Order)
1. `AuthProvider` - Authentication state
2. `ThemeProvider` - Dark/Light theme
3. `ToastProvider` - Notifications
4. `SettingsProvider` - App settings
5. `RealtimeProvider` - SSE events
6. `ActivityLogProvider` - Activity tracking

## Backend Architecture

### Layer Structure
```
src/
├── routes/          # Express route definitions
├── controllers/     # Request handlers
├── services/        # Business logic (extend BaseService)
├── middleware/      # Auth, RBAC, validation
├── database/        # PocketBase schema & migrations
├── schemas/         # Zod validation
└── types/           # TypeScript types
```

### Request Flow
```
Route → Middleware → Controller → Service → PocketBase
         ↓
    - Auth check
    - RBAC check
    - Validation
```

## Feature Pattern (SSoT: Categories)

Mỗi feature mới PHẢI đồng nhất với Category Management:

```
Feature/
├── FeaturePage.tsx          # Main page component
└── components/
    ├── FeatureForm.tsx      # Add/Edit form
    ├── FeatureTable.tsx     # Table view
    ├── FeatureRow.tsx       # Card/Row view
    └── FeatureSkeleton.tsx  # Loading skeleton
```

### Required Capabilities
- [ ] CRUD operations
- [ ] Pagination (server-side)
- [ ] Search & Filter
- [ ] Batch actions (Delete, Restore, Status)
- [ ] Soft delete with Trash view
- [ ] Excel export
- [ ] i18n with entity interpolation
- [ ] Loading skeletons
- [ ] Permission guards

## Shared Packages

| Package | Purpose | Exports |
|---------|---------|---------|
| `@superapp/shared-types` | Types & Validation | Zod schemas, TS types |
| `@superapp/core-logic` | Business Logic | Hooks, utils, excel |
| `@superapp/ui-kit` | UI Components | Button, Input, Card... |
