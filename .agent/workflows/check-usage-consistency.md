---
description: So sánh việc sử dụng một thành phần (file/logic/feature) giữa hai thư mục/ứng dụng
---
# USAGE CONSISTENCY CHECK WORKFLOW

Workflow này giúp phân tích sự khác biệt về việc sử dụng một tài nguyên cụ thể (file, component, service) giữa hai thư mục hoặc hai ứng dụng khác nhau (ví dụ: `web-core` vs `story-weaver`).

## Quy trình thực hiện

### Bước 1: Xác định tài nguyên cần kiểm tra (File X)
- Nhận thông tin về File X (tên file, component, hoặc service).
- Xác định hai thư mục đích: **Thư mục A** (đang dùng X) và **Thư mục B** (nghi vấn không dùng hoặc dùng khác).

### Bước 2: Scan việc sử dụng tại Thư mục A
- Sử dụng `grep_search` để tìm tất cả các vị trí import và tham chiếu đến X trong Thư mục A.
- Ghi lại các ngữ cảnh sử dụng chính (X đóng vai trò gì? Trong page nào? Xử lý logic gì?).

### Bước 3: Scan việc sử dụng tại Thư mục B
- Thực hiện search tương tự tại Thư mục B.
- Kết quả có thể là:
    - **Không có**: B hoàn toàn không dùng X.
    - **Dùng khác**: B dùng X nhưng theo cách khác, hoặc dùng một bản local thay thế.
    - **Thay thế**: B dùng một file Y khác có chức năng tương tự X.

### Bước 4: Phân tích "Tại sao?" (Root Cause Analysis)
Dựa trên kết quả scan, AI thực hiện phân tích:
1. **Tính năng tương ứng**: B có tính năng tương tự A không? Nếu có tính năng A' tương ứng A mà không dùng X -> Tìm xem B dùng gì thay thế.
2. **Kiến trúc**: B có kiến trúc khác (vd: Mobile vs Web) dẫn đến không cần X không?
3. **Kế thừa/Shared**: X đã được chuyển lên `packages/` chưa? Nếu A dùng `packages/X` mà B vẫn dùng `local/X` (hoặc ngược lại) -> Ghi nhận sự thiếu đồng nhất.
4. **Dead Features**: Có phải A đang thừa X (nợ kỹ thuật) mà B đã dọn dẹp không?

### Bước 5: Báo cáo & Đề xuất
Xuất bảng so sánh:

| Tiêu chí | Thư mục A (`[Path A]`) | Thư mục B (`[Path B]`) | Kết luận |
| :--- | :--- | :--- | :--- |
| **Trạng thái dùng** | Đang dùng (Vị trí...) | Không dùng / Dùng Y | [Lệch/Đồng nhất] |
| **Ngữ cảnh** | [Mô tả context] | [Mô tả context] | [Lý do khác biệt] |

**Khuyến nghị**:
- Có nên đưa X vào Shared không?
- Có nên cập nhật B cho giống A không?
- Có nên dọn dẹp A theo B không?

## Prompt thực thi mẫu

"""
Nhiệm vụ: Kiểm tra sự đồng nhất về việc sử dụng `[Tên tài nguyên]` giữa `[Thư mục A]` và `[Thư mục B]`.

**Yêu cầu:**
1. Tìm tất cả các tham chiếu của `[Tên tài nguyên]` trong cả 2 thư mục.
2. Giải thích tại sao có sự khác biệt (nếu có). Ví dụ: Folder B dùng cái gì thay thế? Hay Folder B chưa có tính năng này?
3. Đề xuất phương án tối ưu (Shared-first hoặc Clean-up).
"""
