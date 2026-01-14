---
description: FEATURE DEVELOPMENT EXECUTION
---

=== WORKFLOW — DEV FEATURE ===

## MỤC TIÊU
Thực thi code dựa trên `implementation_plan.md` đã được duyệt.

## NGUYÊN TẮC
1. **Plan là luật**: Không code ngoài plan
2. **Category là chuẩn**: Luôn mở code `Categories` để "copy" pattern
3. **Atomic**: Code từng phần (Type -> Service -> UI -> Integration)

## BƯỚC 1: PREPARATION
1. Đọc lại `implementation_plan.md`
2. Đọc `.agent/docs/component-patterns.md` để hiểu patterns
3. Mở sẵn các file tham chiếu của `Categories`:
   - `apps/web-core/src/pages/Categories/CategoriesPage.tsx`
   - `apps/web-core/src/hooks/useCategories.ts`
   - `apps/web-core/src/services/category.service.ts`

## BƯỚC 2: IMPLEMENTATION (TUẦN TỰ)
Thực hiện code theo thứ tự dependency:

### 2.1 Database & Types
- Schema collection (nếu có)
- Shared types (`packages/shared-types/`)

### 2.2 Backend
- Service (extend BaseService)
- Controller
- Routes

### 2.3 Frontend Service & Hook
- Service layer (`apps/web-core/src/services/`)
- Custom hook (`apps/web-core/src/hooks/`)

### 2.4 I18n
- Tạo files `{en,vi,ko}/{feature}.json`
- Đăng ký trong `config/i18n.ts`

### 2.5 UI Components
- Component con trước (Form, Table, Skeleton)
- Page chính sau

### 2.6 Wiring
- Thêm route trong `AppRoutes.tsx`
- Thêm navigation (nếu cần)

## BƯỚC 3: SELF-CORRECTION
Sau khi code xong mỗi file, tự review:
- Có hardcode text không? -> Chuyển sang i18n
- Có hardcode màu không? -> Dùng Tailwind tokens
- Có giống `Category` chưa? -> So sánh patterns

## BƯỚC 4: VERIFICATION
// turbo
```bash
pnpm lint
```

// turbo
```bash
pnpm build
```

Kiểm tra:
- Lint check passed
- Build check passed
- UI giống Category Management
