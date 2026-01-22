---
description: CHECK PERMISSIONS CONSISTENCY (Page, API, Database)
---

=== WORKFLOW — CHECK PERMISSIONS ===

## MỤC TIÊU
Kiểm tra ĐỒNG NHẤT PERMISSIONS giữa 3 tầng: **Frontend (Page)**, **Backend (API)** và **Database (PocketBase Rules)**.
Đảm bảo mọi resource đều được bảo vệ đúng cách ở cả 3 tầng.

## TÀI LIỆU THAM CHIẾU (SSoT)
**Category Management** là chuẩn mẫu cho việc triển khai permissions.
- **Frontend**: `apps/web-core/src/pages/Categories/CategoriesPage.tsx`
- **Backend API**: `apps/api-server/src/routes/categories.ts`
- **Permission Types**: `packages/shared-types`

---

## PHẦN I: FRONTEND PERMISSION CHECK

### 1. Page-Level Permission
- [ ] **Route Protection**: Page có được bảo vệ bởi `PermissionGuard` không?
  - Import: `import { PermissionGuard } from '@/components/common/PermissionGuard';`
  - Wrap toàn bộ page: `<PermissionGuard resource="{feature}" action="view">...</PermissionGuard>`

### 2. Component-Level Permission
- [ ] **Create Button**: 
  ```tsx
  <PermissionGuard resource="{feature}" action="create">
    <Button>Create</Button>
  </PermissionGuard>
  ```
- [ ] **Edit Button/Link**: 
  ```tsx
  <PermissionGuard resource="{feature}" action="update">
    <Button>Edit</Button>
  </PermissionGuard>
  ```
- [ ] **Delete Button**: 
  ```tsx
  <PermissionGuard resource="{feature}" action="delete">
    <Button>Delete</Button>
  </PermissionGuard>
  ```
- [ ] **Manage Actions** (Archive, Restore, Bulk):
  ```tsx
  <PermissionGuard resource="{feature}" action="manage">
    <Button>Manage</Button>
  </PermissionGuard>
  ```

### 3. Menu/Navigation Permission
- [ ] **Sidebar Items**: Kiểm tra `Sidebar.tsx` và `ModernSidebar.tsx` có wrap menu items bằng `PermissionGuard`?
- [ ] **Header Links**: Kiểm tra `Header.tsx` có kiểm tra permission trước khi render link?

### 4. Hook Usage
- [ ] **useAuth Hook**: Sử dụng `checkPermission(resource, action)` từ `useAuth()` khi cần logic điều kiện phức tạp.

---

## PHẦN II: BACKEND API PERMISSION CHECK

### 1. Route-Level Middleware
Kiểm tra tất cả routes trong `apps/api-server/src/routes/{feature}.ts`:

| HTTP Method | Endpoint             | Required Permission              |
|-------------|----------------------|----------------------------------|
| GET         | `/`                  | `requirePermission(Resource, 'view')` |
| GET         | `/export`            | `requirePermission(Resource, 'view')` |
| GET         | `/:id`               | `requirePermission(Resource, 'view')` |
| POST        | `/`                  | `requirePermission(Resource, 'create')` |
| PUT         | `/:id`               | `requirePermission(Resource, 'update')` |
| DELETE      | `/:id`               | `requirePermission(Resource, 'delete')` |
| POST        | `/batch-delete`      | `requirePermission(Resource, 'delete')` |
| POST        | `/batch-status`      | `requirePermission(Resource, 'update')` |
| POST        | `/batch-restore`     | `requirePermission(Resource, 'update')` |
| POST        | `/:id/restore`       | `requirePermission(Resource, 'update')` |

### 2. Middleware Imports
- [ ] **Correct Import**: 
  ```typescript
  import { requirePermission } from '../middleware/index.js';
  import { PermissionResource, PermissionAction } from '@superapp/shared-types';
  ```

### 3. Permission Resource & Action Constants
- [ ] **Use Enum Constants**: Sử dụng `PermissionResource.{Resource}` và `PermissionAction.{Action}` thay vì hard-coded string.
  - ❌ KHÔNG: `requirePermission('categories', 'create')`
  - ✅ ĐÚNG: `requirePermission(PermissionResource.Categories, PermissionAction.Create)`

### 4. Missing Permission Check
- [ ] **No Unprotected Routes**: Không có route nào thiếu middleware `requirePermission`.
- [ ] **Public Routes Exception**: Chỉ các route public (login, register, health-check) được phép không có permission check.

---

## PHẦN III: DATABASE (POCKETBASE) PERMISSION CHECK

### 1. Collection Rules
Kiểm tra PocketBase collection có rules phù hợp:

| Rule Type   | Default Value | Description                           |
|-------------|---------------|---------------------------------------|
| `listRule`  | `null`        | Chỉ admin có thể list (thông qua API) |
| `viewRule`  | `null`        | Chỉ admin có thể view (thông qua API) |
| `createRule`| `null`        | Chỉ admin có thể create               |
| `updateRule`| `null`        | Chỉ admin có thể update               |
| `deleteRule`| `null`        | Chỉ admin có thể delete               |

> **NOTE**: PocketBase rules `null` = Admin only (an toàn nhất).
> API Server sử dụng admin token nên bypass rules, nhưng vẫn check permission qua RBAC middleware.

### 2. Kiểm Tra Migration/Schema
- [ ] **Schema File**: Kiểm tra `apps/api-server/src/database/schema/*.ts`
- [ ] **Rules Field**: Đảm bảo không có rule cho phép public access trừ khi cố ý.

### 3. Relation Rules
- [ ] **Cascade Rules**: Nếu collection A có relation đến B, cần đảm bảo user có quyền trên cả A và B khi cần thiết.

---

## PHẦN IV: PERMISSION TYPES CONSISTENCY

### 1. Shared Types Check
Kiểm tra `packages/shared-types`:

- [ ] **PermissionResource Enum**: Resource đã được thêm vào enum?
  ```typescript
  export type PermissionResource = 
    | 'categories'
    | 'users'
    | 'roles'
    | '{new_feature}'  // ← Cần thêm
    | 'all';
  ```

- [ ] **PermissionAction Enum**: Actions đầy đủ?
  ```typescript
  export type PermissionAction = 
    | 'view'
    | 'create'
    | 'update'
    | 'delete'
    | 'manage';
  ```

### 2. Naming Convention
- [ ] **Resource Name**: snake_case (vd: `markdown_pages`, `activity_logs`)
- [ ] **Action Name**: lowercase (vd: `view`, `create`, `update`, `delete`, `manage`)

---

## PHẦN V: AUTOMATED CHECKS

// turbo
```bash
# 1. Tìm tất cả sử dụng PermissionGuard trong web-core
cd apps/web-core && grep -rn "PermissionGuard" --include="*.tsx" | head -50
```

// turbo
```bash
# 2. Tìm tất cả sử dụng requirePermission trong api-server
cd apps/api-server && grep -rn "requirePermission" --include="*.ts" | head -50
```

// turbo
```bash
# 3. Kiểm tra PermissionResource và PermissionAction types
cd packages/shared-types && grep -rn "PermissionResource\|PermissionAction" --include="*.ts" | head -30
```

---

## PHẦN VI: PERMISSION MATRIX

Tạo ma trận kiểm tra cho feature đang review:

| Layer      | view | create | update | delete | manage |
|------------|------|--------|--------|--------|--------|
| Frontend   | [ ]  | [ ]    | [ ]    | [ ]    | [ ]    |
| API Routes | [ ]  | [ ]    | [ ]    | [ ]    | [ ]    |
| DB Rules   | [ ]  | [ ]    | [ ]    | [ ]    | [ ]    |

**Giải thích:**
- ✅ = Đã triển khai đúng
- ❌ = Thiếu hoặc sai
- N/A = Không áp dụng (vd: manage không cần ở mọi resource)

---

## OUTPUT FORMAT

Trả về báo cáo theo cấu trúc:

```markdown
## PERMISSION CHECK REPORT: {Feature Name}

### 1. Frontend (Page)
- **Status**: [PASS / FAIL]
- **Issues**: (nếu có)

### 2. Backend API
- **Status**: [PASS / FAIL]
- **Missing Routes**: (danh sách route chưa có permission)

### 3. Database Rules
- **Status**: [PASS / FAIL]  
- **Unsafe Rules**: (danh sách collection có rule không an toàn)

### 4. Shared Types
- **Status**: [PASS / FAIL]
- **Missing Types**: (resource/action chưa được định nghĩa)

### 5. Permission Matrix
| Layer      | view | create | update | delete | manage |
|------------|------|--------|--------|--------|--------|
| Frontend   | ✅   | ✅     | ✅     | ✅     | ✅     |
| API Routes | ✅   | ✅     | ✅     | ✅     | ✅     |
| DB Rules   | ✅   | ✅     | ✅     | ✅     | ✅     |

### 6. Kết luận
- **Overall Status**: [READY / NEEDS WORK]
- **Action Items**: (nếu cần sửa)
```

---

## COMMON ISSUES & FIXES

### Issue 1: Frontend không wrap PermissionGuard
**Fix**: Thêm `<PermissionGuard>` cho component cần bảo vệ.

### Issue 2: API route thiếu requirePermission
**Fix**: Thêm middleware `requirePermission(Resource, Action)` trước handler.

### Issue 3: Hard-coded permission string
**Fix**: Import và sử dụng `PermissionResource` / `PermissionAction` từ `@superapp/shared-types`.

### Issue 4: Database rule cho phép public access
**Fix**: Set rule = `null` (Admin only) hoặc điều kiện cụ thể.

### Issue 5: Missing resource trong PermissionResource
**Fix**: Thêm resource mới vào `packages/shared-types` và rebuild.
