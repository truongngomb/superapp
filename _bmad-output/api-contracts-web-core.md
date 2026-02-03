# API Contracts - Web Core (Client)

**Part:** apps/web-core
**Type:** Web/Mobile Client (React + Capacitor)
**Role:** Main Platform App

## Service Layer

### Category Service (`category.service.ts`)
Interacts with `/categories` endpoint of `api-server`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `getAll` | `GET /categories` | List categories with filters |
| `getPage` | `GET /categories` | Paginated list |
| `getAllForExport` | `GET /categories/export` | Full list for export |
| `deleteMany` | `POST /categories/batch-delete` | Batch delete |
| `batchUpdateStatus` | `POST /categories/batch-status` | Batch status update |
| `restoreMany` | `POST /categories/batch-restore` | Batch restore |

### Core Services
Other services (Auth, User) are imported from `@superapp/core-logic`.
- **Auth:** `authService` (Login, Logout, Session)
- **User:** `userService` (Profile, User Management)
