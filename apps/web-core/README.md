# SuperApp Web Core

Frontend application using React 19, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19
- **Build Tool**: Vite 7
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS 3.4, SCSS
- **Internationalization**: i18next, react-i18next (EN, VI, KO)
- **Mobile**: Capacitor 8 (Android/iOS)
- **PWA**: Vite PWA Plugin
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Excel Export**: ExcelJS

## Project Structure

```
apps/web-core/
├── src/
│   ├── assets/             # Static assets (images, styles)
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Generic components (DataTable, PageHeader, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar, MainLayout)
│   │   └── notifications/  # Toast notifications
│   ├── config/             # App configuration (api, i18n, env)
│   ├── context/            # React Context providers (Auth, Theme, Toast, Settings, Realtime)
│   ├── hooks/              # Custom React hooks (useCategories, useUsers, useResource, etc.)
│   ├── locales/            # i18n translation files
│   │   ├── en/             # English (9 namespaces)
│   │   ├── vi/             # Vietnamese
│   │   └── ko/             # Korean
│   ├── pages/              # Page components
│   │   ├── Admin/          # Admin pages (Dashboard, Users, Roles, ActivityLogs, Settings)
│   │   ├── Categories/     # Category management (SSoT reference)
│   │   ├── HomePage.tsx
│   │   └── LoginPage.tsx
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
└── index.html
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- pnpm >= 8.x

### Environment Variables

Create a `.env` file in `apps/web-core` (optional in development, Vite proxies `/api`):

```env
# API URL - defaults to /api (proxied to localhost:3001 in dev)
VITE_API_BASE_URL=

# Debug mode
VITE_ENABLE_DEBUG=false
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (http://localhost:5173) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

## Features

### UI Components

- **Responsive Design**: Mobile-first with responsive components
- **Dark/Light Theme**: System preference detection with manual toggle
- **View Modes**: List/Table switching with localStorage persistence
- **Sort & Filter**: Sortable columns with popup menu
- **Pagination**: Server-side pagination
- **Excel Export**: Client-side Excel generation
- **Batch Actions**: Multi-select operations

### Pages

| Page | Description |
|------|-------------|
| **Home** | Landing page |
| **Login** | Google OAuth authentication |
| **Categories** | CRUD with soft delete, batch operations (SSoT reference) |
| **Admin Dashboard** | Statistics and system status |
| **Users** | CRUD, role assignment |
| **Roles** | CRUD, permission configuration |
| **Activity Logs** | Audit trail viewer |
| **System Settings** | Layout and app configuration |

## Mobile Development (Capacitor)

```bash
# Sync web build with Capacitor platforms
pnpm cap:sync

# Open Android Studio
pnpm android:open

# Open Xcode (macOS only)
pnpm ios:open

# Build Android APK
pnpm android:build
```

## Styling & Theme

We use **TailwindCSS** for utility classes with custom color tokens defined in `tailwind.config.js`.

```css
/* Example: Dark/Light mode support */
.bg-surface { /* adapts to theme */ }
.text-foreground { /* adapts to theme */ }
.text-muted { /* adapts to theme */ }
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Hooks | `use` + camelCase | `useAuth.ts` |
| Services | dot notation | `auth.service.ts` |
| Types | PascalCase | `Category`, `Role`, `User` |
| i18n keys | snake_case | `select_all`, `show_archived` |

## Shared Packages

This app uses shared packages from the monorepo:

- `@superapp/shared-types` - TypeScript types & Zod schemas
- `@superapp/core-logic` - Custom hooks & utilities
- `@superapp/ui-kit` - UI components (optional)
