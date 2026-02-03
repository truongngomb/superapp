# Architecture - Web Core

**Part:** apps/web-core
**Type:** Platform Client (Web & Mobile)
**Stack:** React, Vite, Capacitor, Ionic/Tailwind

## Executive Summary
Web Core is the primary container application for the SuperApp platform. It serves as the main entry point for users, handling authentication, navigation, and access to sub-applications (like Story Weaver). It is built to be deployed as a PWA and a native mobile app via Capacitor.

## Architecture Pattern
**Hybrid Mobile App / Platform Shell:**
- **Shell:** Handles login, sidebar navigation, and global layout.
- **Modules:** Features loaded as routes (Admin, Categories).
- **Capacitor:** Bridges web code to native device features (Camera, Push Notifications).

## Key Components

### App Shell
- `AppRoutes.tsx`: Defines the main navigation structure.
- `LoginPage.tsx`: Entry point for unauthenticated users.
- `HomePage.tsx`: Dashboard for authenticated users.

### Mobile Integration
- **Capacitor Configuration:** `capacitor.config.ts`.
- **Native Projects:** `android/` and `ios/` folders.
- **Plugins:** Uses Capacitor plugins for native functionality.

### Feature Modules
- **Admin:** User and system management.
- **Categories:** Taxonomy management.
- **MarkdownViewer:** Documentation and content display.

## Directory Structure
- `src/pages/`: Feature modules.
- `src/components/`: Shell components (Layout, Sidebar).
- `src/services/`: Core API services.
- `android/`: Native Android project.
