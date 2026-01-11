# SuperApp

**SuperApp** is a boilerplate for cross-platform team applications (Web, Android, iOS). It follows a monorepo structure with a React frontend and an Express/PocketBase backend.

## 📂 Repository Structure

- **[client/](client/README.md)**: Frontend application (React, TS, Vite, Capacitor).
- **[server/](server/README.md)**: Backend application (Node.js, Express, PocketBase).

## ✨ Features

- **Authentication**: Google OAuth, session management
- **Role-Based Access Control (RBAC)**: Permission-based authorization
- **User Management**: CRUD with role assignment
- **Role Management**: Permissions configuration
- **Category Management**: Single Source of Truth (SSoT) pattern
- **Activity Logs**: Audit trail for all actions
- **Internationalization**: 3 languages (EN, VI, KO)
- **Responsive UI**: Mobile-first with responsive components
- **Dark/Light Theme**: System and manual toggle
- **Excel Export**: Data export functionality
- **Soft Delete**: Trash/Archive with restore capability

## 🚀 Quick Start

### 1. Setup

Clone the repo and install dependencies for the entire workspace:

```bash
git clone <repository-url>
cd my-project
npm install
```

### 2. Environment

See detailed instructions in sub-folders:
- [Client Configuration](client/README.md#environment-variables)
- [Server Configuration](server/README.md#environment-variables)

### 3. Run Development

Start both the client and server concurrently:

```bash
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **PocketBase Admin**: http://localhost:8090/_/

## 🛠️ Main Commands

These commands run scripts across the workspace (client & server).

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development servers concurrently |
| `npm run build` | Build both client and server |
| `npm run lint` | Run ESLint in both workspaces |
| `npm run client:dev` | Start frontend only |
| `npm run server:dev` | Start backend only |
| `npm run db` | Run Database CLI (Server workspace) |

## 📱 Mobile Development

Mobile commands are managed via the client workspace but can be run from root:

```bash
npm run android:open  # Open Android Studio
npm run ios:open      # Open Xcode
npm run cap:sync      # Sync Capacitor
```

## 🔒 Security

- Helmet for HTTP security headers
- CORS configuration
- Rate limiting for batch operations
- Permission-based access control
- Soft delete for data safety

## 📄 License

Internal Team Development.
