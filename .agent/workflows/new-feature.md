---
description: END-TO-END FEATURE DEVELOPMENT
---

=== WORKFLOW — NEW FEATURE (E2E) ===

## MỤC TIÊU
Phát triển feature mới từ đầu đến cuối, đảm bảo đồng nhất với Category Management (SSoT).

## PREREQUISITE
- Đã chạy `/1-read-project` để hiểu codebase
- Đã có yêu cầu rõ ràng từ User

---

## PHASE 1: PLANNING

### Bước 1.1: Phân tích yêu cầu
1. Xác định entities và relationships
2. Mapping với patterns từ Category Management
3. Liệt kê capabilities cần thiết:
   - [ ] CRUD operations
   - [ ] Pagination
   - [ ] Search & Filter
   - [ ] Batch actions
   - [ ] Soft delete
   - [ ] Excel export

### Bước 1.2: Lập Implementation Plan
Tạo `implementation_plan.md` với:
- Database schema
- API endpoints
- Frontend components
- Files cần tạo/sửa

### Bước 1.3: Xin duyệt
- Gọi `notify_user` với `PathsToReview`
- Chờ User approve

---

## PHASE 2: DATABASE

### Bước 2.1: Tạo Collection Schema
```
apps/api-server/src/database/collections/{feature}.ts
```

### Bước 2.2: Chạy Migration
// turbo
```bash
pnpm db --migrate
```

### Bước 2.3: Seed Data (optional)
```
apps/api-server/src/database/seeds/{feature}.seed.ts
```

---

## PHASE 3: BACKEND

### Bước 3.1: Tạo Zod Schema
```
apps/api-server/src/schemas/{feature}.schema.ts
```

### Bước 3.2: Tạo Service
```
apps/api-server/src/services/{feature}.service.ts
```
- Extend `BaseService<T>`

### Bước 3.3: Tạo Controller
```
apps/api-server/src/controllers/{feature}.controller.ts
```

### Bước 3.4: Tạo Routes
```
apps/api-server/src/routes/{feature}.ts
```
- Đăng ký trong `routes/index.ts`

---

## PHASE 4: SHARED TYPES

### Bước 4.1: Cập nhật Types
```
packages/shared-types/src/{feature}.ts
```
- Export từ `index.ts`

---

## PHASE 5: FRONTEND

### Bước 5.1: Tạo Service
```
apps/web-core/src/services/{feature}.service.ts
```

### Bước 5.2: Tạo Hook
```
apps/web-core/src/hooks/use{Feature}.ts
```

### Bước 5.3: Tạo Components
```
apps/web-core/src/pages/{Feature}/
├── {Feature}Page.tsx
└── components/
    ├── {Feature}Form.tsx
    ├── {Feature}Table.tsx
    ├── {Feature}Row.tsx
    └── {Feature}Skeleton.tsx
```

### Bước 5.4: Thêm Route
```
apps/web-core/src/AppRoutes.tsx
```

### Bước 5.5: Tạo i18n Files
```
apps/web-core/src/locales/{en,vi,ko}/{feature}.json
```
- Đăng ký trong `config/i18n.ts`

---

## PHASE 6: VERIFICATION

### Bước 6.1: Test API
// turbo
```bash
curl http://localhost:3001/api/{feature}
```

### Bước 6.2: Test UI
- Kiểm tra CRUD flow
- Kiểm tra batch actions
- Kiểm tra i18n (switch languages)
- Kiểm tra dark/light theme

### Bước 6.3: Tạo Walkthrough
- Ghi lại những gì đã làm
- Screenshots nếu cần

---

## OUTPUT
- Database schema
- API endpoints (tested)
- UI components (working)
- i18n translations
- Walkthrough documentation
