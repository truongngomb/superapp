# Component Inventory - Story Weaver

**Part:** apps/story-weaver
**Type:** Web Application (React)

## Design System
- **Library:** `@superapp/ui-kit` (Radix UI + Tailwind).
- **Styling:** Tailwind CSS + Framer Motion.

## State Management
Defined in `src/AppProviders.tsx`.

1.  **Server State:** `@tanstack/react-query` (`QueryClientProvider`).
2.  **Auth State:** `AuthProvider` (from core-logic).
3.  **UI State:** `ThemeProvider`, `ToastProvider`, `LayoutProvider`.
4.  **App State:** `SettingsProvider`.

## Component Structure

### Pages
Feature-based architecture with collocated components.

#### Dashboard (`src/pages/Dashboard`)
- Entry point: `DashboardPage.tsx`
- Internal Components: `components/` (Project lists, stats cards)

#### Editor (`src/pages/Editor`)
- Entry point: `EditorPage.tsx`
- Internal Components: `components/` (Script editor, timeline, media picker)
- Local Context: `context/` (Editor-specific state)

### Shared Components (`src/components`)
- `layout/`: App shell, navigation, sidebar.

### Hooks (`src/hooks`)
- Custom business logic hooks.
