# API Reference

> Tài liệu API endpoints của SuperApp

Base URL: `http://localhost:3001/api`

## Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/google` | Google OAuth login | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout | Yes |

## Users

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/users` | List users (paginated) | `users:view` |
| POST | `/users` | Create user | `users:create` |
| GET | `/users/:id` | Get user by ID | `users:view` |
| PATCH | `/users/:id` | Update user | `users:update` |
| DELETE | `/users/:id` | Delete user | `users:delete` |
| POST | `/users/:id/roles` | Assign roles | `users:update` |
| POST | `/users/batch-delete` | Batch delete | `users:delete` |
| POST | `/users/batch-restore` | Batch restore | `users:update` |
| POST | `/users/batch-status` | Batch update status | `users:update` |
| GET | `/users/export` | Export to Excel | `users:view` |

## Roles

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/roles` | List roles | `roles:view` |
| POST | `/roles` | Create role | `roles:create` |
| GET | `/roles/:id` | Get role by ID | `roles:view` |
| PATCH | `/roles/:id` | Update role | `roles:update` |
| DELETE | `/roles/:id` | Delete role | `roles:delete` |
| POST | `/roles/batch-delete` | Batch delete | `roles:delete` |
| POST | `/roles/batch-restore` | Batch restore | `roles:update` |
| POST | `/roles/batch-status` | Batch update status | `roles:update` |

## Categories

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/categories` | List categories | `categories:view` |
| POST | `/categories` | Create category | `categories:create` |
| GET | `/categories/:id` | Get category by ID | `categories:view` |
| PATCH | `/categories/:id` | Update category | `categories:update` |
| DELETE | `/categories/:id` | Delete category | `categories:delete` |
| POST | `/categories/:id/restore` | Restore category | `categories:update` |
| POST | `/categories/batch-delete` | Batch delete | `categories:delete` |
| POST | `/categories/batch-restore` | Batch restore | `categories:update` |
| POST | `/categories/batch-status` | Batch update status | `categories:update` |
| GET | `/categories/export` | Export to Excel | `categories:view` |

## Activity Logs

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/activity-logs` | List activity logs | `roles:view` |

## Settings

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/settings` | Get all settings | Admin only |
| GET | `/settings/public` | Get public settings | No |
| PUT | `/settings` | Update settings | `*:manage` |

## System

| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/system/info` | System information | `dashboard:view` |
| GET | `/system/health` | Health check | No |

## Realtime

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/realtime/events` | SSE stream | Yes |

---

## Query Parameters

### Pagination
```
?page=1&limit=10
```

### Sorting
```
?sort=name&order=asc
```

### Filtering
```
?search=keyword
?isActive=true
?isDeleted=false
```

## Response Format

### Success
```json
{
  "items": [...],
  "page": 1,
  "limit": 10,
  "total": 100,
  "totalPages": 10
}
```

### Error
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```
