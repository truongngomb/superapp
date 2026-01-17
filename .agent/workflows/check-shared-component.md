---
description: Kiểm tra việc sử dụng, tạo mới hoặc cập nhật các component dùng chung từ packages/ui-kit
---

# WORKFLOW: QUẢN LÝ COMPONENT DÙNG CHUNG (SHARED COMPONENTS)

Bạn là một AI Engineer chịu trách nhiệm đảm bảo tính nhất quán của hệ thống UI/UX và tối ưu hóa khả năng tái sử dụng code trong kiến trúc Monorepo.

---

## 1. KIỂM TRA TRƯỚC KHI TẠO MỚI (PRE-CREATION CHECK)

Khi nhận được yêu cầu tạo một Component mới tại `apps/`:

1. **Quét thư viện dùng chung**:
   - Kiểm tra thư mục `packages/ui-kit/src/components`.
   - Kiểm tra `apps/web-core/src/components/common` (nếu đây là nơi chứa common cục bộ).
2. **So sánh tính năng**:
   - Nếu đã tồn tại component tương tự: BẮT BUỘC sử dụng lại hoặc mở rộng (extend props).
   - Nếu chưa có: Kiểm tra xem component này có tiềm năng dùng ở module khác không? Nếu có -> Tạo tại `packages/ui-kit`.

---

## 2. QUY TRÌNH TẠO MỚI TẠI packages/ui-kit

1. **Cấu trúc file**:
   - File Component: Đặt trực tiếp trong `packages/ui-kit/src/components/` (Ví dụ: `MyNewComponent.tsx`).
   - Barrel Export: BẮT BUỘC thêm dòng export vào `packages/ui-kit/src/components/index.ts`.
2. **Tiêu chuẩn Code (Shadcn UI Standard)**:
   - **Styling**: BẮT BUỘC sử dụng `cn()` (clsx + twMerge) để merge class.
   - **Variants**: Khuyến khích sử dụng `cva` (class-variance-authority) để quản lý variants.
   - **Props**: Kế thừa props chuẩn của HTMLElement (VD: `React.ButtonHTMLAttributes<HTMLButtonElement>`).
   - **Forward Ref**: Luôn sử dụng `React.forwardRef`.
   - **Dark Mode**: Kiểm tra hiển thị trên cả Light/Dark theme.

---

## 3. CẬP NHẬT COMPONENT HIỆN CÓ

Khi thay đổi một component trong `packages/ui-kit`:

1. **Impact Analysis (Phân tích ảnh hưởng)**:
   - Sử dụng `grep` hoặc `global search` để tìm tất cả các vị trí trong `apps/` đang import component này.
   - Đảm bảo các thay đổi không gây lỗi (Break changes) cho các consumer hiện tại.
2. **Versioning (nếu cần)**:
   - Nếu thay đổi lớn về API, ưu tiên tạo variant mới thay vì sửa trực tiếp props cũ.

---

## 4. KIỂM TRA SỬ DỤNG TẠI apps/

Sử dụng tool `grep_search` để rà soát:
1. **Import Check**: Đảm bảo các component cơ bản (Button, Input, Badge, v.v.) được import từ `@superapp/ui-kit` hoặc `@/components/common`.
2. **Duplicate Check**: Phát hiện các đoạn code UI bị copy-paste thay vì dùng component dùng chung.

---

## ĐẦU RA BẮT BUỘC CỦA WORKFLOW

AI phải báo cáo theo mẫu sau:
- **Tình trạng**: [TÀI SỬ DỤNG / TẠO MỚI / CẬP NHẬT]
- **Vị trí**: [Path đến file trong packages hoặc apps]
- **Phân tích ảnh hưởng**: [Danh sách các file bị ảnh hưởng nếu là cập nhật]
- **Tuân thủ**: [Xác nhận về Types, Dark mode, Naming]
