---
description: Kiểm tra việc sử dụng, tạo mới hoặc cập nhật các component dùng chung từ packages/ui-kit
---

# WORKFLOW: QUẢN LÝ & TUÂN THỦ COMPONENT DÙNG CHUNG (SHARED COMPONENTS)

Workflow này giúp đảm bảo tính nhất quán của hệ thống UI/UX, tối ưu hóa khả năng tái sử dụng code và đảm bảo mã nguồn frontend sử dụng triệt để các component từ `@superapp/ui-kit`.

---

## 1. NGUYÊN TẮC CỐT LÕI (SHARED-FIRST)

1. **BẮT BUỘC** đưa vào `packages/ui-kit` nếu:
   - Component được sử dụng ở ≥ 2 apps (ví dụ: `web-core` và `story-weaver`).
   - Component là các UI Nguyên tử (Atoms) như Button, Input, Modal, v.v.
   - Component có khả năng tái sử dụng cao trong tương lai.
2. **HÀN CHẾ** để tại `apps/*/src/components` trừ khi:
   - Component cực kỳ đặc thù cho logic nghiệp vụ của chỉ duy nhất app đó.
   - Component chứa quá nhiều dependency không thể tách rời của app.
3. **ƯU TIÊN TUÂN THỦ**: Nếu UI Kit đã có component tương ứng, **BẮT BUỘC** phải sử dụng nó thay vì thẻ HTML native hoặc component tự tạo.

---

## 2. QUY TRÌNH KIỂM TRA (AUDIT LOGIC)

### Bước 1: Khám phá Single Source of Truth
- AI liệt kê các component hiện có trong thư mục: `packages/ui-kit/src/components`.
- Đây là danh sách "CHUẨN" để đối chiếu.

### Bước 2: Kiểm tra tuân thủ (Compliance Audit)
- Tìm kiếm các thẻ HTML native hoặc custom pattern ĐÃ ĐƯỢC hỗ trợ:
  - `<button>` ➔ `Button`
  - `<input>` / `<textarea>` ➔ `Input` / `Textarea`
  - `<table>` ➔ `DataTable` / `DataRow`
  - Custom Loader ➔ `LoadingSpinner` / `Skeleton`
  - Custom Dialog/Alert ➔ `Modal` / `ConfirmModal`
  - Pattern flex/grid phức tạp ĐÃ CÓ component layout tương ứng.

### Bước 3: Phát hiện trùng lặp & Trích xuất (Duplicate Detection)
- Sử dụng `grep_search` để tìm các component có tên hoặc chức năng tương tự giữa các apps.
- Nếu phát hiện code UI tương tự nhau tại 2 vị trí khác nhau ➔ Lập kế hoạch đưa lên `packages/ui-kit`.

---

## 3. QUY TRÌNH DỌN DẸP & TRÍCH XUẤT

1. **Bước 1**: Di chuyển logic và style lên `packages/ui-kit`.
2. **Bước 2**: Export từ `packages/ui-kit/src/index.ts`.
3. **Bước 3**: Thay thế import tại các apps thành `@superapp/ui-kit`.
4. **Bước 4**: **XÓA** file component cũ tại apps để tránh gây nhầm lẫn.

---

## 4. TIÊU CHUẨN TẠO MỚI (SHADCN UI STANDARDS)

- **Styling**: BẮT BUỘC sử dụng `cn()` (clsx + twMerge).
- **Variants**: Sử dụng `cva` cho các trạng thái.
- **Base Height**: Tuân thủ chuẩn h-10 cho các control.
- **Forward Ref**: BẮT BUỘC sử dụng `React.forwardRef` cho UI components cơ bản.
- **Accessibility**: Đảm bảo hỗ trợ ARIA và keyboard navigation.
- **Theme**: BẮT BUỘC hỗ trợ Light/Dark mode, tuyệt đối không hard-code màu.

---

## 5. ĐẦU RA BẮT BUỘC CỦA WORKFLOW

AI phải báo cáo theo mẫu sau:

- **Audit Tuân thủ**: [Danh sách các thẻ HTML/Custom UI cần thay bằng UI Kit]
- **Tình trạng Trích xuất**: [TÀI SỬ DỤNG / TẠO MỚI / CHIẾT XUẤT (Move to Shared)]
- **Hành động dọn dẹp**: [Liệt kê các file local sẽ bị xóa]
- **Vị trí Shared**: `packages/ui-kit/src/components/...`
- **Phân tích ảnh hưởng**: [Danh sách apps/files bị ảnh hưởng]
- **Xác nhận Tuân thủ**: [Zod, Types, Dark mode, cn(), Forward Ref]

---

## LƯU Ý QUAN TRỌNG
- Tuyệt đối không copy-paste code từ app này sang app kia.
- Nếu thấy sự khác biệt nhỏ về style giữa 2 app, hãy sử dụng **Variants** tại `ui-kit` để hợp nhất thay vì để 2 bản copy.
