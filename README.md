# SuperApp

Ứng dụng mẫu dùng phát triển các ứng dụng cho nhóm - Cross-platform (Web, Android, iOS)

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, PocketBase
- **Mobile**: Capacitor (Android/iOS)
- **PWA**: Vite PWA Plugin

## Quick Start

```bash
# Install dependencies
npm install

# Run development servers (both frontend & backend)
npm run dev

# Frontend only: http://localhost:5173
npm run client:dev

# Backend only: http://localhost:3001
npm run server:dev
```

## Build

```bash
# Build both client and server
npm run build

# Build client only
npm run client:build

# Build server only
npm run server:build
```

## Mobile Development

```bash
# Sync web build with Capacitor
npm run cap:sync

# Open Android project
npm run android:open

# Open iOS project (macOS only)
npm run ios:open
```

## Theme Customization

Colors can be customized via CSS variables in `client/src/assets/styles/variables.scss`:

```scss
:root {
  --color-primary: 220 90% 56%;
  --color-secondary: 262 83% 58%;
  --color-accent: 43 96% 56%;
}
```

## Project Structure

```
my-project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── features/       # Feature modules
│   │   ├── pages/          # Page components
│   │   └── config/         # App configuration
│   └── ...
├── server/                 # Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Express middleware
│   └── ...
└── package.json            # Workspace root
```

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
| `npm run ios:open` | Open Xcode |
