# Project Overview

**Project:** SuperApp Monorepo
**Type:** Monorepo (PNPM Workspaces)
**Architecture:** Hybrid (Client-Server + Micro-services)

## Executive Summary
SuperApp is a comprehensive platform combining a web/mobile application shell (`web-core`) with specialized micro-frontends like `story-weaver`. It is powered by a robust backend architecture splitting general platform services (`api-server`) from specialized AI orchestration (`story-weaver-api`). The project leverages a shared Design System (`ui-kit`) and Core Logic library to maintain consistency and reduce code duplication.

## Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Monorepo** | PNPM Workspaces, TurboRepo |
| **Backend** | Node.js, Express, TypeScript, PocketBase, Zod |
| **Frontend** | React, Vite, Tailwind CSS, Radix UI, TanStack Query |
| **Mobile** | Capacitor (Android/iOS) |
| **AI** | OpenAI, Google Gemini |
| **Infrastructure** | Docker, Nginx, Supervisor |

## Repository Structure

### Applications (`apps/`)
| App | Type | Description |
| :--- | :--- | :--- |
| **[api-server](./architecture-api-server.md)** | Backend | Main platform API (Auth, Users, Content). |
| **[story-weaver](./architecture-story-weaver.md)** | Web | AI Video Creation Studio. |
| **[story-weaver-api](./architecture-story-weaver-api.md)** | Backend | AI Orchestration Service. |
| **[web-core](./architecture-web-core.md)** | Web/Mobile | Main Platform Shell / Mobile App. |

### Shared Packages (`packages/`)
| Package | Type | Description |
| :--- | :--- | :--- |
| **[ui-kit](./architecture-ui-kit.md)** | Library | Shared Design System (Components). |
| **core-logic** | Library | Shared Auth, API Clients, Utils. |
| **shared-types** | Library | Shared Zod Schemas & Types. |

## Documentation Index

### Architecture & Design
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)
- [Component Inventory - UI Kit](./component-inventory-ui-kit.md)

### Development & Operations
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)

### API & Data
- [API Contracts - API Server](./api-contracts-api-server.md)
- [API Contracts - Story Weaver API](./api-contracts-story-weaver-api.md)
- [Data Models - API Server](./data-models-api-server.md)
- [Data Models - Story Weaver API](./data-models-story-weaver-api.md)
