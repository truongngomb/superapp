# SuperApp Client

Frontend application using React 18, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn/ui
- **Internationalization**: i18next, react-i18next (Type-safe)
- **Mobile**: Capacitor (Android/iOS)
- **PWA**: Vite PWA Plugin

## Project Structure

```
client/
├── src/
│   ├── assets/             # Static assets (images, styles)
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, Card)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   ├── config/             # App configuration
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── locales/            # i18n translation files
│   ├── pages/              # Page components
│   ├── services/           # API service layer
│   └── utils/              # Utility functions
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

Global variables are defined in `src/assets/styles/variables.scss`. 
We use **TailwindCSS** for utility classes and **Shadcn/ui** for component primitives.

```scss
// Example customization
:root {
  --color-primary: 220 90% 56%;
  --color-secondary: 262 83% 58%;
}
```

## Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with prefix `use` (`useAuth.ts`)
- **Services**: camelCase (`auth.service.ts`)
