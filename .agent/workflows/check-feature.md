---
description: FEATURE CONSISTENCY CHECK - Kiểm tra đồng nhất feature với Category Management (SSoT)
---

=== FEATURE CONSISTENCY CHECK — ANTIGRAVITY (COMPREHENSIVE) ===

Vai trò: AI Agent CHỈ kiểm tra đồng nhất feature, KHÔNG viết code, KHÔNG đề xuất.

Luật:
- Chỉ dựa trên code TỒN TẠI + SYSTEM PROMPT
- Không suy đoán, không giả định
- Không thấy → ghi: "Không tồn tại trong codebase"
- Không đủ dữ liệu → DỪNG và trả đúng thông báo hệ thống

Tham chiếu bắt buộc: Category Management (Single Source of Truth)
Không tìm thấy Category Management → DỪNG NGAY

==================================================================
DANH SÁCH FILES THAM CHIẾU (Category Management)
==================================================================

### Frontend (client/src/)
- pages/Categories/CategoriesPage.tsx
- pages/Categories/components/CategoryForm.tsx
- pages/Categories/components/CategoryRow.tsx
- pages/Categories/components/CategoryTable.tsx
- hooks/useCategories.ts
- hooks/useSort.ts
- hooks/useExcelExport.ts
- services/category.service.ts
- types/category.ts
- types/common.ts (SortOrder, SortConfig, SortColumn)
- locales/{vi,en,ko}/categories.json

### Backend (server/src/)
- routes/categories.ts
- controllers/category.controller.ts
- services/category.service.ts
- types/category.ts
- schemas/category.schema.ts
- database/collections/categories.collection.ts

==================================================================
I. KIỂM TRA UI / UX (BẮT BUỘC)
==================================================================

So sánh từng phần UI với SSoT:

### 1. Header section
- [ ] Title với i18n key: `{feature}:title`
- [ ] Subtitle với i18n key: `{feature}:subtitle`
- [ ] Export Excel button (optional, trong PermissionGuard action="view")
- [ ] Create button trong PermissionGuard với action="create"

### 2. Search/Filter section
- [ ] Search input với `useDebounce` (400ms)
- [ ] Search icon (lucide-react)
- [ ] Placeholder với i18n key: `common:search`
- [ ] SortPopup component (popup với sort options)
- [ ] Refresh button với loading spin

### 3. List controls section
- [ ] PermissionGuard cho Checkbox "Select All" với action="delete"
- [ ] ViewSwitcher component (list/table toggle, optional)
- [ ] Toggle "Show Archived" trong PermissionGuard action="manage"

### 4. Batch action buttons + Total
- [ ] Restore selected (PermissionGuard action="update", showing only when archived)
- [ ] Delete selected (PermissionGuard action="delete")
- [ ] Activate/Deactivate (hide when hasDeletedSelected)
- [ ] Total items display: `common:total_items`

### 5. List/Table section
- [ ] LoadingSpinner khi loading
- [ ] Empty state với icon + message
- [ ] Empty state khác khi có searchQuery
- [ ] ViewMode === "table" → {Feature}Table component
- [ ] ViewMode === "list" → {Feature}Row component

### 6. Pagination section
- [ ] Hiển thị khi totalPages > 1
- [ ] Loading overlay với bg-background/50
- [ ] Pagination component props: currentPage, totalPages, onPageChange

### 7. Modals
- [ ] Form modal (AnimatePresence wrapper)
- [ ] Delete confirm modal (single + batch)
- [ ] Restore confirm modal (single + batch)
- [ ] Status update confirm modal (batch)

==================================================================
II. KIỂM TRA COMPONENT STRUCTURE
==================================================================

### Vị trí thư mục
- Admin feature → `src/pages/Admin/{Feature}/`
- Non-Admin feature → `src/pages/{Feature}/`

### Component files
- [ ] {Feature}Page.tsx (main page)
- [ ] components/{Feature}Form.tsx (form modal)
- [ ] components/{Feature}Row.tsx (list item)
- [ ] components/{Feature}Table.tsx (table view, optional)

### Common components usage
- [ ] Button, Input, Modal, Card, CardContent
- [ ] Checkbox (với triState cho select all)
- [ ] Toggle, SortPopup, Pagination
- [ ] ViewSwitcher (optional)
- [ ] LoadingSpinner, ConfirmModal
- [ ] PermissionGuard

==================================================================
III. KIỂM TRA HOOKS
==================================================================

### Hook structure (use{Feature}s.ts)
- [ ] State: items[], loading, isLoadingMore, submitting, deleting, batchDeleting
- [ ] Pagination state: { page, totalPages, total }
- [ ] lastParamsRef cho params persistence
- [ ] isReloading ref để tránh loop

### Hook methods
- [ ] fetch{Feature}s (params) - paginated fetch
- [ ] reload{Feature}s - silent reload
- [ ] create{Feature}
- [ ] update{Feature}
- [ ] delete{Feature}
- [ ] delete{Feature}s (batch)
- [ ] update{Feature}sStatus (batch)
- [ ] restore{Feature}
- [ ] restore{Feature}s (batch)

### Error handling pattern
- [ ] try-catch với ApiException check
- [ ] Toast messages: success/error
- [ ] Logger.warn cho errors

### useSort hook usage (for sort persistence)
- [ ] Import từ @/hooks
- [ ] Passing storageKey option (STORAGE_KEYS.{FEATURE}_SORT)
- [ ] SortConfig type import từ @/types
- [ ] SortColumn type cho columns config

### useExcelExport hook usage (optional)
- [ ] fileNamePrefix: "{feature}"
- [ ] sheetName: t("{feature}:title")
- [ ] columns config với key, header, width

==================================================================
IV. KIỂM TRA SERVICE (Frontend)
==================================================================

### Service structure ({feature}.service.ts)
- [ ] ServiceConfig interface với timeout, signal
- [ ] createAbortController usage
- [ ] API_ENDPOINTS usage

### Service methods
- [ ] getAll(params, config)
- [ ] getPage(params, config)
- [ ] getById(id, config)
- [ ] create(data)
- [ ] update(id, data)
- [ ] delete(id)
- [ ] deleteMany(ids) → POST /batch-delete
- [ ] batchUpdateStatus(ids, isActive) → POST /batch-status
- [ ] restore(id) → POST /{id}/restore
- [ ] restoreMany(ids) → POST /batch-restore

==================================================================
V. KIỂM TRA TYPES
==================================================================

### Entity type
- [ ] Extends BaseEntity (id, created, updated, isActive, isDeleted)
- [ ] Feature-specific fields

### Input types
- [ ] Create{Feature}Input
- [ ] Update{Feature}Input (partial)

### Query types
- [ ] {Feature}ListParams (page, limit, sort, order, search, isDeleted, ...)
- [ ] Paginated{Feature}s (items, page, totalPages, total)

### Common UI types (từ types/common.ts)
- [ ] SortOrder = 'asc' | 'desc' | null
- [ ] SortConfig = { field: string; order: SortOrder }
- [ ] SortColumn = { field: string; label: string }

### Backend types
- [ ] Entity extends BaseEntity
- [ ] CreateInput = CreateInput<Entity>
- [ ] UpdateInput = UpdateInput<Entity>

==================================================================
VI. KIỂM TRA ROUTES (Backend)
==================================================================

### Middleware order
1. (Optional) Rate limiter cho batch operations
2. requirePermission(Resources.{FEATURE}, Actions.{ACTION})
3. validateBody(Schema) nếu có body
4. asyncHandler(controller.method)

### Endpoints structure
- [ ] GET / → getAll (paginated)
- [ ] GET /:id → getById
- [ ] POST / → create
- [ ] PUT /:id → update
- [ ] DELETE /:id → remove (soft/hard)
- [ ] POST /:id/restore → restore
- [ ] POST /batch-delete → batchDelete
- [ ] POST /batch-status → batchUpdateStatus
- [ ] POST /batch-restore → batchRestore

### Rate limiting
- [ ] batchOperationLimit cho /batch-* endpoints

==================================================================
VII. KIỂM TRA CONTROLLER (Backend)
==================================================================

### Controller structure
- [ ] Import logger từ utils
- [ ] Import hasPermission, ForbiddenError từ middleware

### Handler patterns
- [ ] getAll: Query params parsing, filter building, security check cho isDeleted
- [ ] create/update: Body được validate bởi middleware
- [ ] remove: Check isDeleted để quyết định soft/hard delete
- [ ] batchDelete: Promise.all với try-catch per item

### Security checks
- [ ] isDeleted=true → require 'manage' permission

==================================================================
VIII. KIỂM TRA SERVICE (Backend)
==================================================================

### Service structure
- [ ] Class extends BaseService<Entity>
- [ ] protected readonly collectionName
- [ ] protected readonly cacheKey
- [ ] protected readonly defaultFilter (nếu có soft delete)
- [ ] protected mapRecord(record): Entity

### Methods từ BaseService
- getAll, getPage, getById, getFirstByField, exists, count
- create, update, updateMany
- delete (soft), hardDelete, deleteMany, hardDeleteMany
- restore, restoreMany

==================================================================
IX. KIỂM TRA SCHEMA / VALIDATION
==================================================================

### Zod schemas
- [ ] {Feature}CreateSchema
- [ ] {Feature}UpdateSchema
- [ ] BatchDeleteSchema
- [ ] BatchUpdateStatusSchema
- [ ] BatchRestoreSchema

### Inferred types
- [ ] Export type {Feature}CreateSchemaType = z.infer<...>

==================================================================
X. KIỂM TRA DATABASE (PocketBase)
==================================================================

### Collection file
- [ ] Tồn tại: database/collections/{feature}.collection.ts
- [ ] Export: {feature}Collection

### Collection schema
- [ ] name: '{feature}s'
- [ ] type: 'base'
- [ ] fields: standard fields + feature-specific
- [ ] indexes: unique constraints nếu cần
- [ ] API Rules: all null (admin only)

### Standard fields (từ SSoT)
- isActive (bool)
- isDeleted (bool)
- created (autodate, onCreate: true, onUpdate: false)
- updated (autodate, onCreate: true, onUpdate: true)

==================================================================
XI. KIỂM TRA I18N
==================================================================

### Files
- [ ] locales/vi/{feature}.json
- [ ] locales/en/{feature}.json
- [ ] locales/ko/{feature}.json

### Key structure
- title, subtitle, create_btn
- list.empty, list.empty_search, list.add_first
- form.add_title, form.edit_title, form.*_label, form.*_placeholder
- delete_confirm, hard_delete_confirm
- batch_delete_confirm, batch_hard_delete_confirm
- restore_confirm, batch_restore_confirm
- toast.load_error, toast.create_success, toast.update_success
- toast.delete_success, toast.hard_delete_success
- toast.batch_delete_success, toast.batch_hard_delete_success
- toast.batch_status_success, toast.batch_restore_success
- toast.error
- activate_selected, deactivate_selected
- batch_status_confirm, actions.activate, actions.deactivate

==================================================================
XII. KIỂM TRA INDEX EXPORTS
==================================================================

- [ ] hooks/index.ts exports use{Feature}s
- [ ] services/index.ts exports {feature}Service
- [ ] types/index.ts exports {Feature} types
- [ ] controllers/index.ts exports {feature}Controller
- [ ] routes/index.ts registers {feature}Router

==================================================================
OUTPUT BẮT BUỘC
==================================================================

Input bắt buộc:
{{FEATURE_NAME}}

Output bắt buộc:

1. Kết luận: MATCH / MISMATCH / NOT ENOUGH DATA

2. Bảng đối chiếu chi tiết:

| Tiêu chí | Trạng thái | Ghi chú |
|----------|------------|---------|
| UI - Header | MATCH/MISMATCH/NOT FOUND | ... |
| UI - Search | ... | ... |
| Hooks | ... | ... |
| Service (FE) | ... | ... |
| Types | ... | ... |
| Routes (BE) | ... | ... |
| Controller | ... | ... |
| Service (BE) | ... | ... |
| Schema | ... | ... |
| Database | ... | ... |
| i18n | ... | ... |
| Index Exports | ... | ... |

3. Danh sách điểm KHÔNG đồng nhất:
- File: path/to/file.ts
- Vấn đề: Mô tả cụ thể
- SSoT reference: path/to/ssot/file.ts

4. Câu hỏi bắt buộc (nếu không thể kết luận)
