---
name: create-api-resource
description: Generates a complete backend API resource (Controller, Service, Route, Schema).
---

# Create API Resource Skill

This skill helps you generate a standardized backend API resource following the project's SSoT patterns.

## When to use this skill

- When the user asks to "create an API" or "backend resource"
- When implementing the backend side of a new feature

## How to use it

### 1. Generate Files
Create the following files in `apps/api-server/src/`:

```
controllers/{name}.controller.ts
services/{name}.service.ts
routes/{name}.ts
schemas/{name}.schema.ts
database/collections/{name}.ts
```

### 2. Implementation Rules

#### Service (`services/{name}.service.ts`)
- Extend `BaseService<T>`
- Implement logic using `pb.collection(collectionName)`
- Ensure all write operations log to `ActivityLogs`

#### Controller (`controllers/{name}.controller.ts`)
- Use `catchAsync` wrapper
- Standardize response: `res.json({ data })` or `res.status(204).send()`

#### Route (`routes/{name}.ts`)
- Register CRUD endpoints:
  - `GET /` (list/page)
  - `POST /` (create)
  - `GET /:id` (detail)
  - `PATCH /:id` (update)
  - `DELETE /:id` (soft delete)
  - `POST /batch-*` (batch actions)
- Apply Middleware:
  - `requireAuth`
  - `validate(schema)`
  - `requirePermission(resource, action)`

#### Zod Schema (`schemas/{name}.schema.ts`)
- Define `create{Name}Schema`
- Define `update{Name}Schema`
- Define `query{Name}Schema`

### 3. Registration
- Register route in `apps/api-server/src/routes/index.ts`
