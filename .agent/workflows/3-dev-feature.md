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
4. **Shared First**: Logic/UI dùng chung PHẢI đặt tại `packages/` (core-logic, ui-kit)

## BƯỚC 1: PREPARATION & RESUME
1. **Auto-Resume**: Đọc `.brain/session.json`.
   - Nếu đang làm dở (`working_on.status == "coding"`), xác định file/task tiếp theo.
2. Đọc lại `implementation_plan.md`
3. Đọc `.agent/docs/component-patterns.md` để hiểu patterns
4. Mở sẵn các file tham chiếu của `Categories`:
   - `apps/web-core/src/pages/Categories/CategoriesPage.tsx`
   - `apps/web-core/src/hooks/useCategories.ts`
   - `apps/web-core/src/services/category.service.ts`

## BƯỚC 2: IMPLEMENTATION (TUẦN TỰ)
Thực hiện code theo thứ tự dependency:

### 2.1 Database & Types
- Schema collection (nếu có)
- Shared types (`packages/shared-types/`)

### 2.2 Shared Packages
- Logic & Utils: `packages/core-logic/src/utils/`
- Shared Hooks: `packages/core-logic/src/hooks/`
- Shared UI: `packages/ui-kit/`
- [Other]: `packages/[other]/`

### 2.3 Backend
> Use skill `create-api-resource`
- Service (extend BaseService)
- Controller
- Routes

### 2.4 Frontend Service & Hook
- Service layer (`apps/web-core/src/services/`)
- Custom hook (`apps/web-core/src/hooks/`)

### 2.5 I18n
- Tạo files `{en,vi,ko}/{feature}.json`
- Đăng ký trong `config/i18n.ts`

### 2.6 UI Components
> Use skill `scaffold-feature`
- Component con trước (Form, Table, Skeleton)
- Page chính sau

### 2.7 Wiring
- Thêm route trong `AppRoutes.tsx`
- Thêm navigation (nếu cần)

## BƯỚC 2.5: AUTO-TEST LOOP (AWF POWER)
Sau khi code xong Logic/Backend (2.1 - 2.4), thực hiện Loop:
1. **Detect Test**: Tìm file test liên quan (nếu chưa có -> skip bước này, chỉ lint).
2. **Run Test**: Chạy `npm test` cho file đó.
3. **Fix**:
   - Nếu Fail -> Đọc lỗi -> Fix code -> Run lại.
   - Tối đa 3 lần retry. Nếu vẫn fail -> Dừng và hỏi User.

## BƯỚC 3: SELF-CORRECTION
Sau khi code xong mỗi file, tự review:
- Có hardcode text không? -> Chuyển sang i18n
- Có hardcode màu không? -> Dùng Tailwind tokens
- Có giống `Category` chưa? -> So sánh patterns
- **Performance**: Check `vercel-react-best-practices` (Async waterfall, Barrel imports)
- **UI/UX**: Check `web-design-guidelines` (Focus states, Accessibility)

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

## BƯỚC 5: MEMORY UPDATE (CRITICAL)
1. Cập nhật `.brain/session.json`:
   - `recent_changes`: List các file vừa tạo/sửa.
   - `working_on`: Mark task là DONE hoặc update progress.
   - `pending_tasks`: Remove task đã xong.
2. **Gợi ý User**:
   - "Chức năng đã xong. Gõ `/save-brain` để lưu kiến thức dự án."