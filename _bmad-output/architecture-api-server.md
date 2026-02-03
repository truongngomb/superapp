# Architecture - API Server

**Part:** apps/api-server
**Type:** Backend Service
**Stack:** Node.js, Express, TypeScript, PocketBase

## Executive Summary
The API Server is the central backend service for the SuperApp platform. It handles user authentication, management, content (markdown), and system settings. It acts as a middleware between the frontend clients and the PocketBase database.

## Architecture Pattern
**Service-Controller-Route Pattern:**
- **Routes:** Define endpoints and middleware (Auth, Validation).
- **Controllers:** Handle HTTP request/response logic.
- **Services:** Implement business logic and DB interactions.
- **Schemas:** Zod validation for inputs.

## Key Components

### Authentication
- Implements Google OAuth flow (`/auth/google`).
- Manages user sessions via tokens.
- Integrates with PocketBase auth store.

### User Management
- CRUD operations for Users.
- Role-based Access Control (RBAC) via `requirePermission` middleware.
- Batch operations for bulk management.

### Content Management
- Markdown page management (`/markdown-pages`).
- Supports categorization and hierarchy.

## Data Architecture
- **Database:** PocketBase (SQLite/Go).
- **ORM/SDK:** PocketBase JS SDK.
- **Validation:** Zod schemas (`src/schemas`).

## Directory Structure
- `src/routes/`: API endpoint definitions.
- `src/controllers/`: Request handling logic.
- `src/services/`: Business logic (if separated from controllers).
- `src/middleware/`: Auth, Validation, Error Handling.
- `src/schemas/`: Zod data models.
- `src/scripts/`: DB migration and utility scripts.
