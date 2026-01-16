---
description: CHECK UI KIT USAGE
---

# CHECK UI KIT USAGE

Workflow này giúp kiểm tra và đảm bảo mã nguồn frontend sử dụng triệt để các component từ `@superapp/ui-kit`, thay vì sử dụng thẻ HTML native hoặc component tự tạo trùng lặp.

## Nguyên tắc cốt lõi

Thay vì định nghĩa danh sách cứng, workflow này dựa trên nguyên tắc:
**"Nếu UI Kit đã có component tương ứng, BẮT BUỘC phải sử dụng nó."**

Điều này đảm bảo workflow luôn đúng kể cả khi UI Kit được cập nhật thêm component mới (ví dụ: thêm `Select`, `DatePicker`...) mà không cần sửa đổi file này.

## Quy trình thực hiện

1. **Khám phá UI Kit**:
   - AI sẽ tự động đọc danh sách file tại `packages/ui-kit/src/components` để xác định danh sách các component hiện có.
   - Danh sách này là "Single Source of Truth".

2. **Phân tích đối chiếu**:
   - AI quét các file mã nguồn mục tiêu.
   - Với mỗi thẻ HTML hoặc pattern UI (ví dụ: modal, card, loading), so sánh với danh sách component có trong UI Kit.
   - Nếu tìm thấy sự trùng khớp về chức năng, yêu cầu thay thế.

3. **Báo cáo**:
   - Chỉ báo cáo các trường hợp vi phạm rõ ràng (có sẵn trong UI Kit nhưng không dùng).

## Prompt thực thi

Dưới đây là prompt mẫu để thực hiện kiểm tra:

"""
Bạn là chuyên gia Audit Code và Design System.
Nhiệm vụ: Kiểm tra việc tuân thủ sử dụng component dùng chung trong code.

**Bước 1: Lấy danh sách Component chuẩn**
- Hãy liệt kê các component đang có trong thư mục: `packages/ui-kit/src/components`.
- Đây là danh sách các component "CHUẨN".

**Bước 2: Audit Code**
- Đọc các file code cần kiểm tra.
- Tìm kiếm các thẻ HTML native (button, input...) hoặc các custom component (div className="card"...) mà chức năng của chúng ĐÃ ĐƯỢC HỖ TRỢ bởi component chuẩn ở Bước 1.

**Logic so khớp:**
- HTML `<button>`  <-> UI Kit `Button`
- HTML `<input>`   <-> UI Kit `Input`
- HTML `<table>`   <-> UI Kit `DataRow` / `DataTable` (nếu có logic bảng)
- Custom `Loader`  <-> UI Kit `LoadingSpinner` / `Skeleton`
- Custom `Dialog`  <-> UI Kit `Modal` / `ConfirmModal`
- ... và bất kỳ component nào trùng tên/chức năng.

**Báo cáo vi phạm:**
Trả về danh sách các điểm cần refactor:
1. **File**: [Đường dẫn]
2. **Vị trí**: [Dòng code]
3. **Vi phạm**: [Mô tả code hiện tại]
4. **Thay thế**: Nên dùng `<[TênComponentUIKit]>` thay thế.
"""
