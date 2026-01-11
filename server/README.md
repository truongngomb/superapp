# SuperApp Server

Backend API and Database Management using Express and PocketBase.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PocketBase (SQLite/Go)
- **Validation**: Zod
- **Caching**: NodeCache (In-memory, 5min TTL)
- **Language**: TypeScript

## Project Structure

```
server/
├── src/
│   ├── config/             # Server config (env, cache, database)
│   ├── controllers/        # Route handlers
│   │   ├── auth.controller.ts
│   │   ├── category.controller.ts
│   │   ├── role.controller.ts
│   │   ├── user.controller.ts
│   │   └── activity_log.controller.ts
│   ├── database/           # PocketBase Schema & Migrations
│   │   ├── collections/    # Schema definitions (Code-First)
│   │   └── seeds/          # Data seeding scripts
│   ├── middleware/         # Express middleware
│   │   ├── auth.ts         # Authentication
│   │   ├── rbac.ts         # Role-Based Access Control
│   │   ├── validate.ts     # Zod validation
│   │   ├── rateLimit.ts    # Rate limiting
│   │   └── errorHandler.ts # Global error handling
│   ├── routes/             # API route definitions
│   ├── schemas/            # Zod validation schemas
│   ├── services/           # Business logic layer
│   │   ├── base.service.ts # Abstract CRUD service
│   │   ├── category.service.ts
│   │   ├── role.service.ts
│   │   ├── user.service.ts
│   │   └── activity_log.service.ts
│   ├── types/              # TypeScript type definitions
│   └── scripts/            # CLI scripts (migrate.ts)
└── dist/                   # Compiled output
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- PocketBase instance running (default: http://127.0.0.1:8090)

### Environment Variables

Create a `.env` file in the `server` directory **(Required)**:

```env
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
POCKETBASE_URL=http://localhost:8090

# Required for Database Migrations (Admin access)
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=your_secure_password
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with watch mode |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run start` | Run compiled code |
| `npm run db` | Run Database CLI tools |

## Architecture

### BaseService Pattern

All entity services extend `BaseService<T>` which provides:

- `getAll()` - Cached list of all records
- `getPage(options)` - Paginated results with filter/sort
- `getAllFiltered(options)` - For export (no cache)
- `getById(id)` - Single record by ID
- `create(input, actorId)` - Create with activity log
- `update(id, input, actorId)` - Update with activity log
- `delete(id, actorId)` - Soft delete
- `hardDelete(id, actorId)` - Permanent delete
- `restore(id, actorId)` - Restore soft-deleted
- `updateMany(ids, input)` - Batch update
- `deleteMany(ids)` - Batch soft delete

### RBAC (Role-Based Access Control)

Resources: `categories`, `users`, `roles`, `activity_logs`, `all`
Actions: `view`, `create`, `update`, `delete`, `manage`

```typescript
// Usage in routes
router.post('/categories', requirePermission('categories', 'create'), create);
```

## Database Management

This project uses a custom **Code-First Migration** system working with PocketBase.

### Interactive CLI

Run `npm run db` to access the interactive menu:
1. **Show Status**: Compare code schema vs database.
2. **Migrate**: Push changes from code to database.
3. **Pull Schema**: Update code from database (introspection).
4. **Generate Script**: Generate migration summary.
5. **Backup/Restore**: Manage schema backups.
6. **Seed**: Run data seeding.

### Command Flags

```bash
npm run db -- --status    # Check status
npm run db -- --migrate   # Safe migration
npm run db -- --migrate --force  # Force destructive changes
npm run db -- --seed      # Seed data
```

## API Reference

Base URL: `http://localhost:3001/api`

### Endpoints

| Resource | Endpoints |
|----------|-----------|
| **Auth** | `POST /auth/google`, `GET /auth/me`, `POST /auth/logout` |
| **Users** | `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `POST /users/:id/roles` |
| **Roles** | `GET/POST /roles`, `GET/PATCH/DELETE /roles/:id`, `POST /roles/batch-*` |
| **Categories** | `GET/POST /categories`, `GET/PATCH/DELETE /categories/:id`, `POST /categories/batch-*` |
| **Activity Logs** | `GET /activity-logs` |
| **Realtime** | `GET /realtime/events` (SSE) |
| **Health** | `GET /health` |

### Batch Operations

All entity endpoints support:
- `POST /batch-delete` - Soft delete multiple
- `POST /batch-restore` - Restore multiple
- `POST /batch-status` - Update status (isActive)
- `GET /export` - Export all filtered data
