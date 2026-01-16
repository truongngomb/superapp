---
description: QUALITY ASSURANCE & CONSISTENCY CHECK
---

=== WORKFLOW — CHECK QUALITY ===

## MỤC TIÊU
Kiểm tra CHẤT LƯỢNG CODE và ĐỘ ĐỒNG NHẤT (Consistency) tuyệt đối với feature mẫu (`Category Management`) và Kiến trúc hệ thống (`architecture.md`).
Đây là bước **BẮT BUỘC** trước khi hoàn tất task.

## TÀI LIỆU THAM CHIẾU (SSoT)
**Category Management** (Category) là chuẩn duy nhất (Single Source of Truth).
- Frontend: `apps/web-core/src/pages/Categories`
- Backend: `apps/api-server/src/services/category.service.ts`, `apps/api-server/src/routes/categories.ts`
- Kiến trúc: `.agent/docs/architecture.md`

---

## PHẦN I: UI/UX & PERFORMANCE AUDIT

### 1. Automated Skill Check (CRITICAL)
- [ ] **Performance**: Chạy skill `vercel-react-best-practices` để tìm Async Waterfall & Barrel Imports.
- [ ] **Guidelines**: Chạy skill `web-design-guidelines` để check Accessibility (Focus, ARIA, Input types).

### 2. Header & Layout
- [ ] **Page Title & Subtitle**: Sử dụng i18n key `{feature}:title`.
- [ ] **Layout Responsiveness**: Tích hợp `useLayoutMode` ('standard' vs 'modern')?
    - `standard`: Có khoảng trống cho header & sub-nav?
    - `modern`: Tối ưu không gian (thường dùng `h-[calc(100vh-5rem)]`)?
- [ ] **Theme Sync**: Giao diện (bao gồm iframe/external UI) đã đồng bộ Dark/Light mode qua `useTheme`?

### 3. Search & Filter Section
- [ ] Input Search: Có placeholder `common:search`.
- [ ] Debounce: Sử dụng `useDebounce` (400ms) để tối ưu gọi API.
- [ ] Icons: Sử dụng `lucide-react` đúng style dự án.
- [ ] Component `SortPopup`: Nằm cạnh thanh Search (nếu có sort).

### 4. List Controls & Toolbar
- [ ] `ViewSwitcher`: Nếu có nhiều chế độ xem (List/Table/Grid).
- [ ] Status Toggle: Nút **Show Archived** nằm trong `PermissionGuard (action="manage")`.
- [ ] **Total items**: Hiển thị đúng key `common:total_items`.
- [ ] **Permission Guard**: Nút Create/Export phải được bọc bởi `PermissionGuard`.

### 5. Table / List Display
- [ ] **Loading State**: Có `Skeleton` riêng (ví dụ: `FeatureSkeleton.tsx`) khớp chính xác với UI thực tế.
- [ ] **Empty State**:
    - Khi không có dữ liệu: Hiện message `list.empty`.
    - Khi search không thấy: Hiện message `list.empty_search`.
    - Có nút "Add First" nếu user có quyền create.

---

## PHẦN II: KIỂM TRA CODE STRUCTURE

### 1. Component & Folder
- [ ] Vị trí: 
    - Admin: `apps/web-core/src/pages/Admin/{Feature}/`
    - Client: `apps/web-core/src/pages/{Feature}/`
- [ ] Naming: PascalCase cho file/folder component.

### 2. Hooks & State
- [ ] Sử dụng `useResource` hoặc `useResourceService` để tối ưu quản lý state?
- [ ] Lưu trạng thái (Sort, ViewMode) vào LocalStorage thông qua `STORAGE_KEYS` (@/config) và `getStorageItem/setStorageItem` (@/utils).

### 3. Service & API
- [ ] **Frontend**: Extends `BaseService` (nếu phù hợp) hoặc tuân thủ pattern của `categoryService`.
- [ ] **AbortController**: Có xử lý cancel request cũ khi component unmount hoặc param thay đổi?

### 4. I18N (Đa ngôn ngữ)
- [ ] **Không hardcode text**: Tuyệt đối không còn text cứng trong JSX.
- [ ] **Cấu trúc JSON**: Key nằm trong `locales/{en|vi|ko}/*.json`. 
- [ ] **Prefix**: Sử dụng `{feature}.{screen}.{element}` hoặc `common:*`.

---

## PHẦN III: KIỂM TRA BACKEND (POCKETBASE)

- [ ] **PocketBase Schema**: Tên collection snake_case, có đủ các system fields (id, created, updated).
- [ ] **Middleware**: Sử dụng `authenticate`, `requireAuth`, `requireAdmin` hoặc `requirePermission`.
- [ ] **Zod Validation**: Schema được định nghĩa trong `apps/api-server/src/schemas/`.
- [ ] **Soft Delete**: Mặc định sử dụng `isActive: false` thay vì xóa vật lý.

---

## PHẦN IV: AUTOMATED CHECKS

// turbo
```bash
# Kiểm tra lỗi Type cho riêng web-core
pnpm --filter web-core exec tsc --noEmit
```

// turbo
```bash
# Kiểm tra Lint cho web-core
pnpm lint --filter web-core
```

---

## OUTPUT FORMAT
Trả về báo cáo theo cấu trúc:

1. **Kết quả Check Tự động**: [PASS / FAIL] (Kèm log nếu fail)
2. **Đồng nhất UI (Standard/Modern)**: [PASS / MISMATCH]
3. **I18n status**: [DONE / MISSING KEYS]
4. **Backend/Database Integrity**: [READY / ACTION REQUIRED]
5. **Kết luận**: [READY] hoặc [NEEDS WORK] (Ghi rõ lý do)

