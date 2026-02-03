# Project Knowledge Base

**Project:** SuperApp Monorepo
**Generated:** {{date}}
**Status:** Initial Scan Complete

## Project Overview

- **Type:** Monorepo (PNPM Workspaces)
- **Primary Language:** TypeScript
- **Architecture:** Hybrid (Client-Server + Micro-services)

### Quick Reference

#### Applications
- **[API Server](./architecture-api-server.md)** (Backend) - Core Platform API
- **[Story Weaver](./architecture-story-weaver.md)** (Web) - AI Video Studio
- **[Story Weaver API](./architecture-story-weaver-api.md)** (Backend) - AI Orchestration
- **[Web Core](./architecture-web-core.md)** (Web/Mobile) - Platform Shell

#### Shared Packages
- **[UI Kit](./architecture-ui-kit.md)** - Design System
- **Core Logic** - Shared Business Logic
- **Shared Types** - Data Models

## Generated Documentation

### High-Level Analysis
- [Project Overview](./project-overview.md)
- [Source Tree Analysis](./source-tree-analysis.md)
- [Integration Architecture](./integration-architecture.md)

### Technical Guides
- [Development Guide](./development-guide.md)
- [Deployment Guide](./deployment-guide.md)

### API & Data
- [API Contracts - API Server](./api-contracts-api-server.md)
- [API Contracts - Story Weaver API](./api-contracts-story-weaver-api.md)
- [Data Models - API Server](./data-models-api-server.md)
- [Data Models - Story Weaver API](./data-models-story-weaver-api.md)

### Frontend & UI
- [Component Inventory - UI Kit](./component-inventory-ui-kit.md)
- [Component Inventory - Story Weaver](./component-inventory-story-weaver.md)
- [Component Inventory - Web Core](./component-inventory-web-core.md)
- [Client API - Story Weaver](./api-contracts-story-weaver.md)
- [Client API - Web Core](./api-contracts-web-core.md)

## Existing Documentation
*Files found in `docs/` and project roots:*

- [README.md](../README.md)
- [docs/index.md](../docs/index.md)
- [docs/project-overview.md](../docs/project-overview.md)

## Getting Started

1.  **Setup:** Follow the [Development Guide](./development-guide.md) to install dependencies.
2.  **Run:** Use `pnpm dev` to start the stack.
3.  **Explore:** Check [Source Tree Analysis](./source-tree-analysis.md) to understand the folder structure.
