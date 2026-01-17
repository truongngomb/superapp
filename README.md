# SuperApp

**SuperApp** is a boilerplate for cross-platform team applications (Web, Android, iOS). It follows a monorepo structure with a React frontend and an Express/PocketBase backend.

## 📂 Repository Structure

```
my-project/
├── apps/
│   ├── api-server/          # Backend API (Express, PocketBase)
│   └── web-core/            # Frontend SPA (React, Vite, Capacitor)
├── deploy/                  # Docker & Deployment configuration
├── packages/
│   ├── shared-types/        # Shared TypeScript types & Zod schemas
│   ├── core-logic/          # Shared hooks & utilities
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
- **Infrastructure**: Docker, Nginx

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

### 3. Run Development

Start all apps concurrently:

```bash
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **PocketBase Admin**: http://localhost:8090/_/

## ⚡ Main Commands

These commands run scripts across the workspace.

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all development servers |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Run ESLint in all workspaces |
| `pnpm db` | Run Database CLI (api-server) |
| `pnpm test` | Run tests in all workspaces |

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
| `@superapp/ui-kit` | Reusable UI components with TailwindCSS |

## 📄 License

Internal Team Development.
