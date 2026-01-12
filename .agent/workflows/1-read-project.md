---
description: PROJECT UNDERSTANDING & CODEBASE ANALYSIS
---

=== WORKFLOW — READ PROJECT ===

## MỤC TIÊU
Đọc, phân tích và HIỂU CHÍNH XÁC mã nguồn để nắm rõ dự án.
Dùng khi: Bắt đầu task mới, hoặc cần hiểu rõ một module.

## BƯỚC 1: KHÁM PHÁ CẤU TRÚC
1. Liệt kê thư mục gốc: `list_dir`
2. Đọc `package.json` (Client & Server) để hiểu Tech Stack.
3. Đọc `readme.md` (nếu có).

## BƯỚC 2: PHÂN TÍCH MODULE CHÍNH
1. Xác định Entry Point (`main.tsx`, `App.tsx`, `index.ts`).
2. Xác định các Route chính (`AppRoutes.tsx`).
3. Xác định mô hình Service/API (`services/*.ts`).
4. **Phân tích Feature tham chiếu**: Đọc `src/pages/Categories` (Structure, Logic).

## BƯỚC 3: TỔNG HỢP (OUTPUT)
Trả về báo cáo gồm:
1. **Tổng quan hệ thống**: Client/Server, Framework.
2. **Kiến trúc**: Folder structure, Patterns.
3. **Quy ước ngầm**: Naming, I18n, State Management.
4. **So sánh với chuẩn**: Có lệch với Category Management không?
