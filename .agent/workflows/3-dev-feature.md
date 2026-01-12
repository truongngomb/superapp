---
description: FEATURE DEVELOPMENT PROPOSAL AGENT
---

=== WORKFLOW — DEV FEATURE ===

## MỤC TIÊU
Thực thi code dựa trên `implementation_plan.md` đã được duyệt.

## NGUYÊN TẮC
1. **Plan là luật**: Không code ngoài plan.
2. **Category là chuẩn**: Luôn mở code `Categories` để "copy" pattern.
3. **Atomic**: Code từng phần (Type -> Service -> UI -> Integration).

## BƯỚC 1: PREPARATION
1. Đọc lại `implementation_plan.md`.
2. Mở sẵn các file tham chiếu của `Categories` (`Category.ts`, `category.service.ts`, `CategoriesPage.tsx`...).

## BƯỚC 2: IMPLEMENTATION (TUẦN TỰ)
Thực hiện code theo thứ tự dependency:

1. **Types & Models**: Định nghĩa interface.
2. **Service Layer**: Viết API call.
3. **Mock Data / I18n**: Định nghĩa key json.
4. **UI Components**:
   - Component con trước (Form, Table).
   - Page chính sau.
5. **Wiring**: Gắn vào `AppRoutes`, `Sidebar`.

## BƯỚC 3: SELF-CORRECTION
Sau khi code xong mỗi file, tự review:
- Có hardcode text không? -> Chuyển sang i18n.
- Có hardcode màu không? -> Dùng Tailwind class.
- Có giống `Category` chưa?

## BƯỚC 4: VERIFICATION
Chạy thử (hoặc yêu cầu user chạy):
- Lint check.
- Build check.
- UI check (so sánh ảnh chụp nếu có).
