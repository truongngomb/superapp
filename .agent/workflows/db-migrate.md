---
description: DATABASE MIGRATION WORKFLOW
---

=== WORKFLOW — DATABASE MIGRATION ===

## MỤC TIÊU
Thực hiện thay đổi database schema an toàn và có kiểm soát.

## BƯỚC 1: PHÂN TÍCH YÊU CẦU
1. Xác định thay đổi cần thiết (thêm/sửa/xóa field, collection)
2. Kiểm tra ảnh hưởng đến:
   - Các collection liên quan
   - Backend services
   - Frontend types/components
3. Liệt kê file cần thay đổi

## BƯỚC 2: CẬP NHẬT SCHEMA (CODE-FIRST)
1. Sửa file trong `apps/api-server/src/database/collections/`
2. Format theo pattern:
```typescript
export const newCollection = {
  name: 'collection_name',
  type: 'base',
  schema: [
    { name: 'field', type: 'text', required: true },
  ],
};
```

## BƯỚC 3: KIỂM TRA STATUS
// turbo
```bash
pnpm db --status
```
- Xác nhận diff đúng như mong đợi
- Kiểm tra không có breaking changes ngoài ý muốn

## BƯỚC 4: CHẠY MIGRATION
```bash
pnpm db --migrate
```
- Nếu có destructive changes → cần `--force`
- **CHỈ** dùng `--force` khi đã xác nhận rõ ràng

## BƯỚC 5: CẬP NHẬT TYPES
1. Cập nhật `packages/shared-types/` nếu cần
2. Cập nhật Backend types (`apps/api-server/src/types/`)
3. Cập nhật Frontend types (`apps/web-core/src/types/`)

## BƯỚC 6: CẬP NHẬT CODE
1. Backend: Service, Controller, Routes
2. Frontend: Hook, Service, Components

## BƯỚC 7: XÁC NHẬN
- Test API endpoint
- Test UI flow
- Kiểm tra Activity Log ghi đúng

## OUTPUT
- Schema diff
- Files đã thay đổi
- Xác nhận migration thành công
