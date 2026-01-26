---
description: Kiểm tra việc sử dụng, tạo mới hoặc cập nhật các component dùng chung từ packages/ui-kit
---

# WORKFLOW: QUẢN LÝ COMPONENT DÙNG CHUNG (SHARED COMPONENTS)

Bạn là một AI Engineer chịu trách nhiệm đảm bảo tính nhất quán của hệ thống UI/UX và tối ưu hóa khả năng tái sử dụng code trong kiến trúc Monorepo. Mục tiêu tối thượng là **DRY (Don't Repeat Yourself)**.

---

## 1. NGUYÊN TẮC ƯU TIÊN (SHARED-FIRST)

1. **BẮT BUỘC** đưa vào `packages/ui-kit` nếu:
   - Component được sử dụng ở ≥ 2 apps (ví dụ: `web-core` và `story-weaver`).
   - Component là các UI Nguyên tử (Atoms) như Button, Input, Modal, v.v.
   - Component có khả năng tái sử dụng cao trong tương lai.
2. **HÀN CHẾ** để tại `apps/*/src/components` trừ khi:
   - Component cực kỳ đặc thù cho logic nghiệp vụ của chỉ duy nhất app đó.
   - Component chứa quá nhiều dependency không thể tách rời của app.

---

## 2. KIỂM TRA & DỌN DẸP (CLEAN-UP CHECK)

Trước khi thực hiện bất kỳ thay đổi nào:

1. **Phát hiện trùng lặp (Duplicate Detection)**:
   - Sử dụng `grep_search` để tìm các component có tên hoặc chức năng tương tự giữa các apps.
   - Nếu phát hiện code UI tương tự nhau tại 2 vị trí khác nhau -> **BẮT BUỘC** lập kế hoạch đưa lên `packages/ui-kit`.
2. **Quy trình dọn dẹp**:
   - Bước 1: Di chuyển logic và style lên `packages/ui-kit`.
   - Bước 2: Export từ `packages/ui-kit/src/index.ts`.
   - Bước 3: Thay thế import tại các apps thành `@superapp/ui-kit`.
   - Bước 4: **XÓA** file component cũ tại apps để tránh gây nhầm lẫn.

---

## 3. QUY TRÌNH TẠO MỚI TẠI packages/ui-kit

1. **Cấu trúc file**:
   - File Component: `packages/ui-kit/src/components/<ComponentName>.tsx`.
   - Nếu component phức tạp: `packages/ui-kit/src/components/<ComponentName>/...`.
   - Barrel Export: BẮT BUỘC thêm dòng export vào `packages/ui-kit/src/index.ts`.
2. **Tiêu chuẩn Code (Shadcn UI Standard)**:
   - **Styling**: BẮT BUỘC sử dụng `cn()` (clsx + twMerge).
   - **Variants**: Sử dụng `cva` cho các trạng thái.
   - **Shadcn UI**: Đảm bảo tuân thủ base height (h-10) và các quy chuẩn layout.
   - **Props**: Luôn export interface props của component.
   - **Forward Ref**: BẮT BUỘC sử dụng `React.forwardRef` cho tất cả UI components cơ bản.

---

## 4. CẬP NHẬT & PHÂN TÍCH ẢNH HƯỞNG

Khi thay đổi component tại `packages/ui-kit`:

1. **Impact Analysis**: Phải quét toàn bộ `apps/` để xem có bao nhiêu nơi bị ảnh hưởng.
2. **Backward Compatibility**: Tuyệt đối không xóa props cũ nếu không thực sự cần thiết, nên dùng `@deprecated` nếu muốn thay thế.
3. **Internal Sync**: Đảm bảo các app sử dụng cùng một version logic của component đó.

---

## 5. ĐẦU RA BẮT BUỘC CỦA WORKFLOW

AI phải báo cáo theo mẫu sau:

- **Tình trạng**: [TÀI SỬ DỤNG / TẠO MỚI / CHIẾT XUẤT (Move to Shared)]
- **Hành động dọn dẹp**: [Liệt kê các file local sẽ bị xóa sau khi chuyển lên shared]
- **Vị trí Shared**: `packages/ui-kit/src/components/...`
- **Phân tích ảnh hưởng**: [Danh sách apps/files sử dụng]
- **Xác nhận Tuân thủ**: [Zod, Types, Dark mode, cn(), Forward Ref]

---

## LƯU Ý QUAN TRỌNG
- Nếu thấy `apps/web-core` và `apps/story-weaver` đều có chung một component UI nhưng khác nhau một chút về style, hãy **unify** chúng và đưa vào `ui-kit` với các variants phù hợp.
- Tuyệt đối không copy-paste code từ app này sang app kia.
