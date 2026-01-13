# SuperApp Client

Frontend application using React 18, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Internationalization**: i18next, react-i18next (EN, VI, KO)
- **Mobile**: Capacitor (Android/iOS)
- **PWA**: Vite PWA Plugin
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Excel Export**: ExcelJS

## Project Structure

```
client/
├── src/
│   ├── assets/             # Static assets (images, styles)
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, Card, Checkbox, Toggle, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar, MainLayout)
│   │   └── notifications/  # Toast notifications
│   ├── config/             # App configuration (api, i18n, constants, env)
│   ├── context/            # React Context providers (Auth, Theme, Toast, Realtime)
│   ├── hooks/              # Custom React hooks (useCategories, useRoles, useUsers, etc.)
│   ├── locales/            # i18n translation files (en, vi, ko)
│   ├── pages/              # Page components
│   │   ├── Admin/          # Admin pages (Dashboard, Users, Roles, ActivityLogs)
│   │   └── Categories/     # Category management (SSoT)
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions (cn, storage, etc.)
└── index.html
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Environment Variables

Create a `.env` file in the `client` directory (optional in development, Vite proxies `/api`):

```env
# API URL - defaults to /api (proxied to localhost:3001 in dev)
VITE_API_BASE_URL=

# Debug mode
VITE_ENABLE_DEBUG=false
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:5173) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Features

### UI Components

- **Responsive Design**: Mobile-first with `hideLabelOnMobile` prop for compact mobile views
- **Dark/Light Theme**: System preference detection with manual toggle
- **View Modes**: List/Table switching with localStorage persistence
- **Sort & Filter**: Sortable columns with popup menu
- **Pagination**: Server-side pagination
- **Excel Export**: Client-side Excel generation

### Pages

- **Home**: Landing page
- **Login**: Google OAuth authentication
- **Categories**: CRUD with soft delete, batch operations (SSoT reference)
- **Admin Dashboard**: Statistics overview
- **Users Management**: CRUD, role assignment
- **Roles Management**: CRUD, permission configuration
- **Activity Logs**: Audit trail viewer

## Mobile Development (Capacitor)

Commands are run from the `client` directory (or root with `--workspace=client`).

```bash
# Sync web build with Capacitor platforms
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios
```

## Styling & Theme

Global CSS variables are defined in `tailwind.config.js`. 
We use **TailwindCSS** for utility classes with custom color tokens.

```css
/* Example: Dark/Light mode support */
.bg-surface { /* adapts to theme */ }
.text-foreground { /* adapts to theme */ }
.text-muted { /* adapts to theme */ }
```

## Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with prefix `use` (`useAuth.ts`)
- **Services**: dot notation (`auth.service.ts`)
- **Types**: PascalCase (`Category`, `Role`, `User`)
- **i18n keys**: snake_case (`select_all`, `show_archived`)
