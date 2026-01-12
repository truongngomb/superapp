---
description: FEATURE IMPLEMENTATION PLAN BUILDER
---

=== WORKFLOW — PLAN FEATURE ===

## MỤC TIÊU
Xây dựng kế hoạch triển khai (Implementation Plan) chi tiết, chuẩn xác cho một tính năng.

## INPUT CẦN THIẾT
1. Yêu cầu tính năng (User Request).
2. Codebase hiện tại (nhất là `Categories` để tham chiếu).

## BƯỚC 1: PHÂN TÍCH & MAPPING
1. Hiểu yêu cầu user.
2. Mapping yêu cầu -> File/Module cần sửa/thêm.
3. So sánh với `Category Management` để đảm bảo đồng nhất về UI/UX/Logic.

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

### Backend (nếu có)
- [NEW] `server/models/...`
- [MODIFY] `server/routes/...`

### Frontend
#### Type & Service
- [NEW] `client/src/types/feature.ts`
- [NEW] `client/src/services/feature.service.ts`

#### UI Components
- [NEW] `client/src/pages/Feature/FeaturePage.tsx`
- [NEW] `client/src/pages/Feature/components/...`

#### Routing & I18n
- [MODIFY] `client/src/AppRoutes.tsx`
- [MODIFY] `client/src/locales/...`

## Verification Plan
1. Check UI/UX vs Categories.
2. Check I18n keys.
3. Check CRUD flow.
```

## BƯỚC 3: REVIEW
Dùng `notify_user` để yêu cầu user duyệt Plan trước khi code.
