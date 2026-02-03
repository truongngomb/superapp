# Component Inventory - Web Core

**Part:** apps/web-core
**Type:** Web/Mobile Application (React)

## Design System
- **Library:** `@superapp/ui-kit`.
- **Styling:** Tailwind CSS.

## State Management
- **Auth/User:** `AuthProvider` (from core-logic).
- **Server State:** React Query.

## Page Structure

### Public Pages
- **Login:** `LoginPage.tsx`
- **Home:** `HomePage.tsx`

### Feature Modules
Located in `src/pages/`.

#### Admin (`src/pages/Admin`)
- Administrative dashboard.
- User management interface.

#### Categories (`src/pages/Categories`)
- Category management CRUD.
- Filtering and list views.

#### MarkdownViewer (`src/pages/MarkdownViewer`)
- Renders markdown content from `api-server`.
- Likely uses `react-markdown` or similar from `ui-kit`.

## Mobile Integration
- Uses `@capacitor/core` and plugins.
- **Android:** `android/` project.
- **iOS:** `ios/` project (implied by scripts).
