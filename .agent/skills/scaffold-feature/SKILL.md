---
name: scaffold-feature
description: Generates a complete frontend feature structure based on Category Management SSoT.
---

# Scaffold Feature Skill

This skill helps you generate a standardized frontend feature structure following the project's SSoT (Category Management).

## When to use this skill

- When the user asks to "create a new feature" or "scaffold a feature"
- When you need to implement a full CRUD module in the frontend
- To ensure consistency with `Category Management` patterns

## How to use it

### 1. Identify Feature Name
Determine the PascalCase (e.g., `ProductManagement`) and camelCase (e.g., `products`) names.

### 2. Generate Directory Structure
Create the following structure in `apps/web-core/src/pages/{Feature}/`:

```
{Feature}Page.tsx       # Main page component
components/
├── {Feature}Form.tsx   # Add/Edit form modal
├── {Feature}Table.tsx  # Data table
├── {Feature}Row.tsx    # Card/List item view
└── {Feature}Skeleton.tsx # Loading state
```

### 3. Generate Service & Hooks
- Create `apps/web-core/src/services/{camelCase}.service.ts`
- Create `apps/web-core/src/hooks/use{Feature}.ts`

### 4. Implementation Rules

#### Service Pattern
Follow `category.service.ts` pattern:
- Use `createAbortController`
- Implement: `getAll`, `getPage`, `getById`, `create`, `update`, `delete`, `restore`, `deleteMany`, `restoreMany`, `batchUpdateStatus`, `getAllForExport`

#### Hook Pattern
Follow `useCategories.ts` pattern:
- Manage state: `items`, `loading`, `submitting`, `deleting`
- Implement `reload{Feature}` for silent updates

#### Page Pattern
Follow `CategoriesPage.tsx` pattern:
- Use `PageHeader` with i18n
- Use `ResourceToolbar` for view mode & search
- Use `DataTable` with pagination
- Support Batch Actions (Delete, Restore)

### 5. Wiring
- Add route to `AppRoutes.tsx` inside `ProtectedRoute`
- Update `i18n` config if needed
