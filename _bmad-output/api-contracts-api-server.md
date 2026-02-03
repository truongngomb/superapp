# API Contracts - API Server

**Part:** apps/api-server
**Type:** REST API (Express)
**Base URL:** `/api` (Assumed based on conventions)

## Authentication

### Google OAuth
- **GET** `/auth/google`
  - Initiates Google OAuth flow.
  - Rate Limit: Standard.
- **GET** `/auth/google/callback`
  - Handles Google OAuth callback.
  - Rate Limit: Standard.

### Session Management
- **GET** `/auth/me`
  - Get current authenticated user.
- **POST** `/auth/logout`
  - Logout user.
  - Rate Limit: Standard.

## Users

### Current User
- **GET** `/users/me`
  - Get current user's profile.
  - Auth: Required.
- **PUT** `/users/me`
  - Update current user's profile.
  - Body: `UserUpdateSchema` (name, avatar, emailVisibility, etc.)
  - Auth: Required.

### User Management (Admin)
*Requires `Users` resource permissions.*

- **GET** `/users`
  - List all users.
  - Permission: View.
- **POST** `/users`
  - Create new user.
  - Body: `UserCreateSchema` (email, name, password, roles).
  - Permission: Create.
- **GET** `/users/export`
  - Export users.
  - Permission: View.

### Individual User Operations
- **GET** `/users/:id`
  - Get user by ID.
  - Permission: View.
- **PUT** `/users/:id`
  - Update user.
  - Body: `UserUpdateSchema`.
  - Permission: Update.
- **DELETE** `/users/:id`
  - Delete user.
  - Permission: Delete.
- **POST** `/users/:id/restore`
  - Restore soft-deleted user.
  - Permission: Update.

### Batch Operations
*Rate Limit: Batch Operation Limit.*

- **POST** `/users/batch-delete`
  - Delete multiple users.
  - Body: `UserBatchDeleteSchema` (ids).
- **POST** `/users/batch-status`
  - Update status (isActive).
  - Body: `UserBatchUpdateStatusSchema` (ids, isActive).
- **POST** `/users/batch-restore`
  - Restore multiple users.
  - Body: `UserBatchRestoreSchema` (ids).

### Role Assignment
- **PUT** `/users/:id/roles`
  - Assign roles (replace all).
  - Body: `UserRoleAssignmentSchema`.
- **POST** `/users/:id/roles/:roleId`
  - Add single role.
- **DELETE** `/users/:id/roles/:roleId`
  - Remove single role.
- **DELETE** `/users/:id/roles`
  - Remove all roles.

## Markdown Pages

### Public Access
- **GET** `/markdown-pages/slug/:slug`
  - Get published page by slug.
- **GET** `/markdown-pages/menu`
  - Get menu tree.

### Page Management (Admin)
*Requires `MarkdownPages` resource permissions.*

- **GET** `/markdown-pages`
  - List all pages.
- **GET** `/markdown-pages/:id`
  - Get page by ID.
- **POST** `/markdown-pages`
  - Create page.
  - Body: `MarkdownPageCreateSchema` (Multipart/Form-data supported).
- **PUT** `/markdown-pages/:id`
  - Update page.
  - Body: `MarkdownPageUpdateSchema` (Multipart/Form-data supported).
- **DELETE** `/markdown-pages/:id`
  - Delete page.
- **POST** `/markdown-pages/:id/restore`
  - Restore page.
- **POST** `/markdown-pages/translate`
  - Auto-translate content.

### Batch Operations
- **POST** `/markdown-pages/batch-delete`
- **POST** `/markdown-pages/batch-status`
- **POST** `/markdown-pages/batch-restore`
