# Data Models - API Server

**Part:** apps/api-server
**Source:** Zod Schemas (`src/schemas`)

## User Models

### User Profile
Defined in `UserCreateSchema` and `UserUpdateSchema`.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Yes | Unique ID (PocketBase format) |
| `email` | string | Yes | Email address (Unique) |
| `name` | string | Yes | Display name (Max 100 chars) |
| `avatar` | string | No | URL to avatar image |
| `isActive` | boolean | Yes | Account status (Default: true) |
| `emailVisibility` | boolean | No | Public visibility of email |
| `roles` | string[] | No | List of Role IDs |
| `preferences` | object | No | User preferences (JSON) |
| `password` | string | No | Required for creation (Min 8 chars) |

### Batch Operations
Schemas for bulk actions.
- **Batch Delete/Restore:** Array of `ids` (Max 100).
- **Batch Status:** Array of `ids` + `isActive` boolean.

## Markdown Pages
*Note: Base schemas imported from `@superapp/shared-types`.*

| Field | Type | Description |
| :--- | :--- | :--- |
| `slug` | string | URL-friendly identifier |
| `title` | string | Page title |
| `content` | string | Markdown content |
| `status` | string | draft, published, archived |
| `parentId` | string | ID of parent page (for hierarchy) |
| `order` | number | Sort order |

## Common Types
Reusable validation types found in `common.schema.ts`.

- **Pagination:** `page` (default 1), `limit` (default 20, max 100).
- **Sorting:** `sort` (field), `order` ('asc' | 'desc').
- **ID:** Non-empty string.
- **HexColor:** Valid hex color code.
