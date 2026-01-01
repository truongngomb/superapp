# SuperApp Server

Backend API and Database Management using Express and PocketBase.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: PocketBase (Sqlite/Go)
- **Validation**: Zod
- **Caching**: NodeCache (In-memory)

## Project Structure

```
server/
├── src/
│   ├── config/             # Server config & cache
│   ├── controllers/        # Route handlers
│   ├── database/           # PocketBase Schema & Migrations
│   │   ├── collections/    # Schema definitions (Code-First)
│   │   └── seeds/          # Data seeding scripts
│   ├── middleware/         # Express middleware
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic layer
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
| `npm run db` | specific Database CLI tools |

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
# Check status
npm run db -- --status

# Migrate (Safe)
npm run db -- --migrate

# Migrate (Force destructive changes)
npm run db -- --migrate --force

# Seed data
npm run db -- --seed
```

## API Reference

Base URL: `http://localhost:3001/api`

### Endpoints

- **Auth**: `/auth/google`, `/auth/me`, `/auth/logout`
- **Users**: `/users` (CRUD), `/users/:id/roles`
- **Roles**: `/roles` (CRUD)
- **Categories**: `/categories` (CRUD)
