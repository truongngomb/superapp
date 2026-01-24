# SuperApp

**SuperApp** is a boilerplate for cross-platform team applications (Web, Android, iOS). It follows a monorepo structure with a React frontend and an Express/PocketBase backend.

## 📂 Repository Structure

```
my-project/
├── apps/
│   ├── api-server/          # Backend API (Express, PocketBase)
│   ├── story-weaver-api/    # Microservice API (Video Generation)
│   ├── web-core/            # Frontend Shell (Host App)
│   └── story-weaver/        # Micro-frontend (Sub App)
├── deploy/                  # Docker & Deployment configuration
├── packages/
│   ├── shared-types/        # Shared TypeScript types & Zod schemas
│   ├── core-logic/          # Shared React hooks & utilities
│   ├── core-sdk/            # Shared Backend Logic & Auth
│   └── ui-kit/              # Shared UI components
├── package.json             # Root workspace config
└── pnpm-workspace.yaml      # pnpm workspace definition
```

- **[apps/web-core/](apps/web-core/README.md)**: Frontend application (React 19, TS, Vite, Capacitor)
- **[apps/api-server/](apps/api-server/README.md)**: Backend application (Node.js, Express, PocketBase)

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, TanStack Query, Shadcn UI (TailwindCSS)
- **Backend**: Node.js, Express, PocketBase (Auth/DB), Scalar (API Docs)
- **Mobile**: Capacitor (Android/iOS)
- **Infrastructure**: Docker, Nginx, Microservices

## ✨ Features

- **Authentication**: Google OAuth, session management
- **Role-Based Access Control (RBAC)**: Permission-based authorization
- **User Management**: CRUD with role assignment
- **Role Management**: Permissions configuration
- **Category Management**: Single Source of Truth (SSoT) pattern
- **Activity Logs**: Audit trail for all actions
- **System Settings**: Configurable system parameters
- **API Documentation**: Interactive documentation via Scalar
- **Internationalization**: 3 languages (EN, VI, KO)
- **Responsive UI**: Mobile-first with responsive components
- **Dark/Light Theme**: System and manual toggle
- **Excel Export**: Data export functionality
- **Soft Delete**: Trash/Archive with restore capability
- **Markdown CMS**: Multi-language content management with live preview and auto-translation
- **Story Weaver**: AI-powered video script generation and microservice architecture
- **Monorepo Management**: Powered by **Turborepo** for optimized build and development pipelines

## 🚀 Quick Start

### 1. Setup

Clone the repo and install dependencies using pnpm:

```bash
git clone <repository-url>
cd my-project
pnpm install
```

### 2. Environment

See detailed instructions in sub-folders:
- [Frontend Configuration](apps/web-core/README.md#environment-variables)
- [Backend Configuration](apps/api-server/README.md#environment-variables)
- [Story Weaver API Configuration](apps/story-weaver-api/README.md#environment-variables)

### 3. Run Development

Start all apps concurrently using Turborepo:

```bash
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Story Weaver (Direct)**: http://localhost:3102
- **Backend API**: http://localhost:3001
- **Story Weaver API**: http://localhost:3002
- **PocketBase Admin**: http://localhost:8090/_/

## ⚡ Main Commands

These commands use **Turborepo** to run scripts across the workspace efficiently.

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers (parallel) |
| `pnpm build` | Build all apps and packages (with caching) |
| `pnpm lint` | Run ESLint across all projects |
| `pnpm db` | Run Database CLI (api-server) |
| `pnpm test` | Run tests across all projects |

## 📱 Mobile Development

Mobile commands are managed via the web-core workspace:

```bash
cd apps/web-core

# Sync web build with Capacitor platforms
pnpm cap:sync

# Open Android Studio
pnpm android:open

# Open Xcode (macOS only)
pnpm ios:open
```

## 🐳 Docker Deployment

The project includes a production-ready Docker setup serving both frontend and backend.

See **[deploy/DEPLOYMENT.md](deploy/DEPLOYMENT.md)** for detailed instructions on:
- Building the Docker image
- Running locally with Docker
- Deploying to EasyPanel
- Environment configurations

## 🔒 Security

- Helmet for HTTP security headers
- CORS configuration
- Rate limiting for batch operations
- Permission-based access control
- Soft delete for data safety

## 📦 Shared Packages

| Package | Description |
|---------|-------------|
| `@superapp/shared-types` | TypeScript types & Zod validation schemas |
| `@superapp/core-logic` | Shared React hooks & utility functions |
| `@superapp/core-sdk` | Shared Backend methods (Auth, Service Base) |
| `@superapp/ui-kit` | Reusable UI components with TailwindCSS |

## 📄 License

Internal Team Development.
