---
name: db-migration
description: Safe workflow for PocketBase database migrations using the code-first approach.
---

# Database Migration Skill

This skill guides the agent through the safe process of modifying the database schema using the project's custom migration tool.

## When to use this skill

- When adding new collections or fields
- When changing field types or constraints
- When the user asks to "update database" or "migrate schema"

## How to use it

### 1. Preparation (Code-First)
Modify the schema typescript files in `apps/api-server/src/database/collections/`.
Do NOT modify the database directly via Admin UI.

### 2. Check Status
Always check the status before applying changes:

// turbo
```bash
pnpm db --status
```

### 3. Apply Migration
If the status shows intended changes:

```bash
pnpm db --migrate
```

**WARNING**: If the migration involves destructive changes (dropping tables/columns), you must ask for user confirmation before running with `--force`.

### 4. Post-Migration
- Update `packages/shared-types` to reflect the new schema.
- Update `Frontend Types` in `apps/web-core`.
- Run `pnpm db --generate` if you need a migration snapshot (optional).

## Troubleshooting
- If migration fails, use `pnpm db --status` to see the diff.
- If schema is out of sync, use `pnpm db --pull` to sync from DB to Code (only if DB is the source of truth).
