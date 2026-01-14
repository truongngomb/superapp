---
description: FEATURE IMPLEMENTATION PLAN BUILDER
---

=== WORKFLOW — PLAN FEATURE ===

## MỤC TIÊU
Xây dựng kế hoạch triển khai (Implementation Plan) chi tiết, chuẩn xác cho một tính năng.

## INPUT CẦN THIẾT
1. Yêu cầu tính năng (User Request)
2. Codebase hiện tại (nhất là `Categories` để tham chiếu)
3. Đọc `.agent/docs/architecture.md` để hiểu kiến trúc

## BƯỚC 1: PHÂN TÍCH & MAPPING
1. Hiểu yêu cầu user
2. Mapping yêu cầu -> File/Module cần sửa/thêm
3. So sánh với `Category Management` để đảm bảo đồng nhất về UI/UX/Logic
4. Tham khảo `.agent/docs/component-patterns.md` cho patterns

## BƯỚC 2: SOẠN THẢO PLAN
Tạo/Cập nhật file `implementation_plan.md` với cấu trúc:

```markdown
# [Tên Feature] - Implementation Plan

## Goal
Mô tả ngắn gọn mục tiêu.

## User Review Required
- [ ] Breaking changes?
- [ ] Logic phức tạp cần confirm?

## Proposed Changes

### Database (nếu có)
- [NEW] `apps/api-server/src/database/collections/{feature}.ts`

### Backend
- [NEW] `apps/api-server/src/services/{feature}.service.ts`
- [NEW] `apps/api-server/src/controllers/{feature}.controller.ts`
- [NEW] `apps/api-server/src/routes/{feature}.ts`
- [MODIFY] `apps/api-server/src/routes/index.ts`

### Shared Types
- [NEW] `packages/shared-types/src/{feature}.ts`

### Frontend
#### Type & Service
- [NEW] `apps/web-core/src/services/{feature}.service.ts`
- [NEW] `apps/web-core/src/hooks/use{Feature}.ts`

#### UI Components
- [NEW] `apps/web-core/src/pages/{Feature}/{Feature}Page.tsx`
- [NEW] `apps/web-core/src/pages/{Feature}/components/...`

#### Routing & I18n
- [MODIFY] `apps/web-core/src/AppRoutes.tsx`
- [NEW] `apps/web-core/src/locales/{en,vi,ko}/{feature}.json`
- [MODIFY] `apps/web-core/src/config/i18n.ts`

## Verification Plan
1. Check UI/UX vs Categories
2. Check I18n keys (3 languages)
3. Check CRUD flow
4. Check batch operations
```

## BƯỚC 3: REVIEW
Dùng `notify_user` để yêu cầu user duyệt Plan trước khi code.
