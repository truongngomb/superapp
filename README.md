# SuperApp

Ứng dụng mẫu dùng phát triển các ứng dụng cho nhóm - Cross-platform (Web, Android, iOS)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, PocketBase, NodeCache (In-memory)
- **Mobile**: Capacitor (Android/iOS)
- **PWA**: Vite PWA Plugin

---

## Quick Start

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Environment Setup

1. Clone repository:
```bash
git clone <repository-url>
cd my-project
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

**Client** (`client/.env`) - *Optional in development*:
```env
# API URL - defaults to /api (proxied to localhost:3001 by Vite)
VITE_API_BASE_URL=

# Debug mode - enabled by default in development
VITE_ENABLE_DEBUG=false
```

> **Note**: Client works without `.env` in development because:
> - API calls use `/api` prefix, which Vite proxies to `localhost:3001`
> - Google OAuth is handled by PocketBase (no separate client ID needed)

**Server** (`server/.env`) - *Required*:
```env
PORT=3001
POCKETBASE_URL=http://localhost:8090
```

4. Run development servers:
```bash
# Both frontend & backend
npm run dev

# Frontend only: http://localhost:5173
npm run client:dev

# Backend only: http://localhost:3001
npm run server:dev
```

---

## Build

```bash
# Build both client and server
npm run build

# Build client only
npm run client:build

# Build server only
npm run server:build
```

---

## Mobile Development

```bash
# Sync web build with Capacitor
npm run cap:sync

# Open Android project
npm run android:open

# Build Android APK
npm run android:build

# Open iOS project (macOS only)
npm run ios:open
```

---

## Project Structure

```
my-project/
├── client/                     # React frontend
│   ├── src/
│   │   ├── assets/             # Static assets (images, styles)
│   │   ├── components/         # Reusable UI components
│   │   │   ├── common/         # Generic components (Button, Input, Card)
│   │   │   └── layout/         # Layout components (Header, Sidebar)
│   │   ├── config/             # App configuration & constants
│   │   ├── context/            # React Context providers
│   │   ├── pages/              # Page components
│   │   ├── services/           # API service layer
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Utility functions
│   ├── public/                 # Public static files
│   └── index.html
│
├── server/                     # Express backend
│   ├── src/
│   │   ├── config/             # Server config & cache
│   │   ├── controllers/        # Route handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API route definitions
│   │   ├── schemas/            # Zod validation schemas
│   │   ├── services/           # Business logic layer
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Server utilities
│   └── dist/                   # Compiled output
│
└── package.json                # Workspace root
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React Components | PascalCase | `Button.tsx`, `CategoriesPage.tsx` |
| Context Providers | PascalCase | `AuthContext.tsx`, `ThemeContext.tsx` |
| Controllers | kebab-case | `auth.controller.ts`, `user.controller.ts` |
| Services | kebab-case | `auth.service.ts`, `category.service.ts` |
| Utilities | camelCase | `storage.ts`, `validation.ts` |
| Config files | camelCase | `api.ts`, `constants.ts` |
| Barrel exports | lowercase | `index.ts` |
| Type definitions | camelCase | `auth.ts`, `category.ts` |

---

## API Reference

### Base URL
- Development: `http://localhost:3001/api`
- Production: Configured via `VITE_API_URL`

### Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/google` | Initiate Google OAuth |
| GET | `/auth/google/callback` | Google OAuth callback |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout user |

#### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

#### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/roles` | Get all roles |
| GET | `/roles/:id` | Get role by ID |
| POST | `/roles` | Create role |
| PUT | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Delete role |

---

## Theme Customization

Colors can be customized via CSS variables in `client/src/assets/styles/variables.scss`:

```scss
:root {
  --color-primary: 220 90% 56%;
  --color-secondary: 262 83% 58%;
  --color-accent: 43 96% 56%;
}
```

---

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run client:dev` | Start frontend only |
| `npm run server:dev` | Start backend only |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run cap:sync` | Sync Capacitor |
| `npm run android:open` | Open Android Studio |
| `npm run android:build` | Build Android APK |
| `npm run ios:open` | Open Xcode |

---

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Follow naming conventions above
3. Write clean, documented code
4. Test your changes locally
5. Submit a pull request

---

## License

This project is for internal team development.
