---
description: QUALITY ASSURANCE & CONSISTENCY CHECK
---

=== WORKFLOW — CHECK QUALITY ===

## MỤC TIÊU
Kiểm tra CHẤT LƯỢNG CODE và ĐỘ ĐỒNG NHẤT (Consistency) tuyệt đối với feature mẫu (`Category Management`).
Đây là bước **BẮT BUỘC** trước khi Merge/Commit.

## TÀI LIỆU THAM CHIẾU (SSoT)
**Category Management** (Category) là chuẩn duy nhất (Single Source of Truth).
- Frontend: `client/src/pages/Categories`
- Backend: `server/src/routes/categories.ts`, `server/src/services/category.service.ts`

---

## PHẦN I: KIỂM TRA GIAO DIỆN (UI/UX AUDIT)

### 1. Header Section
- [ ] Title dùng i18n key `{feature}:title`?
- [ ] Subtitle dùng i18n key `{feature}:subtitle`?
- [ ] Nút **Export Excel** (nếu có) phải nằm trong `PermissionGuard` (action="view")?
- [ ] Nút **Create** (Create New) nằm trong `PermissionGuard` (action="create")?

### 2. Search & Filter Section
- [ ] Input Search có placeholder `common:search`?
- [ ] Input Search có sử dụng `useDebounce` (400ms) không?
- [ ] Có Icon Search (`lucide-react`)?
- [ ] Component `SortPopup` nằm ngay cạnh thanh Search?
- [ ] Nút **Refresh** (Icon `RefreshCw`) có hiệu ứng xoay (spin) khi loading?

### 3. List Controls (Toolbar)
- [ ] Checkbox **Select All** (chọn tất cả) có hoạt động đúng (checked/unchecked/indeterminate)?
- [ ] `ViewSwitcher` (nếu có hỗ trợ Table/Grid view)?
- [ ] Toggle **Show Archived** nằm trong `PermissionGuard` (action="manage")?
- [ ] Hiển thị dòng **Total items**: `common:total_items`?

### 4. Batch Actions (Thao tác hàng loạt)
Chỉ hiện khi có item được chọn (`selectedIds.length > 0`):
- [ ] Nút **Restore** (chỉ hiện khi đang ở chế độ xem Archived)?
- [ ] Nút **Delete** (Màu đỏ, icon Trash2)?
- [ ] Nút **Activate / Deactivate** (Ẩn nếu danh sách chọn có item đã xóa)?
- [ ] Các nút này có Check Quyền (`PermissionGuard`) đúng không?

### 5. Table / List Display
- [ ] **Loading State**: Có hiển thị `Skeleton` hoặc `LoadingSpinner` khi fetch data?
- [ ] **Empty State**:
    - Khi không có dữ liệu: Hiện icon Folder + message `list.empty`?
    - Khi search không thấy: Hiện message `list.empty_search`?
    - Có nút "Add First" nếu chưa có dữ liệu nào không?
- [ ] **Table View**: Header cột có đúng key i18n? Có support Sort không?
- [ ] **List View** (nếu có): Item row hiển thị đủ thông tin?

### 6. Pagination
- [ ] Component `Pagination` chỉ hiện khi `totalPages > 1`?
- [ ] Khi chuyển trang có loading overlay (`bg-background/50`) che nội dung cũ không?

### 7. Modals & Dialogs
- [ ] **Form Modal**: Có wrap bằng `AnimatePresence` để có animation đóng mở?
- [ ] **Delete Confirm**: Dùng `ConfirmModal`, message phân biệt "soft delete" và "hard delete"?
- [ ] **Restore Confirm**: Dùng `ConfirmModal`, message rõ ràng?

---

## PHẦN II: KIỂM TRA CODE STRUCTURE

### 1. Component Structure
- [ ] File chính nằm đúng chỗ?
    - Admin feature → `src/pages/Admin/{Feature}/`
    - Non-admin → `src/pages/{Feature}/`
- [ ] Tên file PascalCase (`FeaturePage.tsx`, `FeatureForm.tsx`)?

### 2. Hooks (`use{Features}.ts`)
- [ ] Có quản lý đầy đủ state: `items`, `loading`, `submitting`, `deleting`?
- [ ] Có hàm `fetchData` xử lý Params (search, sort, page)?
- [ ] Có xử lý Error (try-catch, toast error, logger)?
- [ ] Dùng `useSort` để lưu trạng thái sort vào LocalStorage?

### 3. Service (Frontend)
- [ ] Có dùng `createAbortController` để cancel request cũ?
- [ ] Có đủ method CRUD: `getAll`, `getById`, `create`, `update`, `delete`, `restore`?
- [ ] Method `deleteMany`, `restoreMany` có gọi đúng endpoint batch?

### 4. Types
- [ ] Có extends `BaseEntity` (id, created, updated, isActive...)?
- [ ] Type `CreateInput`, `UpdateInput` có định nghĩa đúng field chưa?

### 5. I18N (Đa ngôn ngữ)
**Quan trọng:** Scan lại toàn bộ code.
- [ ] Không còn text cứng tiếng Việt/Anh trong code JSX?
- [ ] Các key trong file `locales/*.json` có prefix đúng Feature name?
- [ ] Đã khai báo đủ trong 3 file `vi`, `en`, `ko`?

---

## PHẦN III: KIỂM TRA BACKEND (Nếu có sửa Backend)

- [ ] **Middleware**: Có check quyền `requirePermission` cho từng route?
- [ ] **Validation**: Có validate body (Zod schema) trước khi xử lý?
- [ ] **Soft Delete**: Route `delete` mặc định là soft delete (trừ khi force)?
- [ ] **Filters**: Mặc định `isDeleted=false` (trừ khi có quyền manage và param showArchived)?

---

## OUTPUT
Trả về báo cáo theo format:

1. **Kết quả I18n**: [PASS / FAIL] (Liệt kê text chưa dịch nếu có).
2. **Kết quả UI Match**: [PASS / MISMATCH] (Chỉ ra điểm lệch so với Category).
3. **Danh sách lỗi cần fix**: (Nếu có).
4. **Kết luận**: [READY] hoặc [NEEDS WORK].
