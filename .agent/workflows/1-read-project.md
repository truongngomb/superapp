---
description: PROJECT UNDERSTANDING & CODEBASE ANALYSIS
---

=== WORKFLOW — READ PROJECT ===

## MỤC TIÊU
Đọc, phân tích và HIỂU CHÍNH XÁC mã nguồn để nắm rõ dự án.
Dùng khi: Bắt đầu task mới, hoặc cần hiểu rõ một module.

## BƯỚC 1: KHÁM PHÁ CẤU TRÚC
1. Liệt kê thư mục gốc: `list_dir`
2. Đọc các `package.json` để hiểu Tech Stack:
   - Root: `package.json`
   - Frontend: `apps/web-core/package.json`
   - Backend: `apps/api-server/package.json`
3. Đọc `README.md` (nếu có)
4. Đọc `.agent/docs/architecture.md` (nếu có)

## BƯỚC 2: PHÂN TÍCH MODULE CHÍNH
1. Xác định Entry Point:
   - Frontend: `apps/web-core/src/main.tsx`, `App.tsx`
   - Backend: `apps/api-server/src/index.ts`
2. Xác định các Route chính (`AppRoutes.tsx`)
3. Xác định mô hình Service/API (`services/*.ts`)
4. **Phân tích Feature tham chiếu (SSoT)**:
   - `apps/web-core/src/pages/Categories` (Structure, Logic)
   - `apps/api-server/src/services/category.service.ts`

## BƯỚC 3: TỔNG HỢP (OUTPUT)
Trả về báo cáo gồm:
1. **Tổng quan hệ thống**: Monorepo, Apps, Packages
2. **Kiến trúc**: Folder structure, Patterns
3. **Quy ước ngầm**: Naming, I18n, State Management
4. **So sánh với chuẩn**: Có lệch với Category Management không?

## TÀI LIỆU THAM KHẢO
- `.agent/docs/architecture.md` - Kiến trúc hệ thống
- `.agent/docs/api-reference.md` - API endpoints
- `.agent/docs/component-patterns.md` - Component patterns
