---
description: Kiểm tra việc sử dụng (import/reference) của một file trong toàn bộ codebase
---
# CHECK USAGE WORKFLOW

Workflow này giúp xác định một file cụ thể đang được sử dụng, import hoặc tham chiếu ở đâu trong toàn bộ dự án.

## Quy trình thực hiện

### Bước 1: Xác định thông tin file
- Lấy tên file và đường dẫn tuyệt đối/tương đối của file cần kiểm tra.
- Xác định các "biến thể" của tên file để tìm kiếm (ví dụ: `MyComponent`, `./MyComponent`, `@/components/common/MyComponent`).

### Bước 2: Tìm kiếm tham chiếu (Grep Search)
- Sử dụng `grep_search` để tìm kiếm tên file (không bao gồm phần mở rộng nếu là file code) trong toàn bộ thư mục `apps` và `packages`.
- Tìm kiếm các đường dẫn import liên quan.

### Bước 3: Phân tích kết quả
- Liệt kê danh sách các file đang import/sử dụng file đích.
- Phân loại:
    - **Import trực tiếp**: Sử dụng trong câu lệnh `import`.
    - **Tham chiếu động**: Sử dụng trong `lazy()` hoặc `require`.
    - **Tham chiếu logic**: Tên file xuất hiện trong các cấu hình, routes, hoặc comment quan trọng.

### Bước 4: Báo cáo
- Xuất bảng kết quả bao gồm: File nguồn -> Dòng chứa tham chiếu -> Nội dung đoạn code.
- Kết luận: File có đang là "dead code" (không được dùng) hay không.

## Prompt thực thi mẫu

"""
Bạn là chuyên gia Code Analysis.
Nhiệm vụ: Kiểm tra xem file `[Đường dẫn file]` đang được sử dụng ở đâu trong project.

**Yêu cầu:**
1. Tìm tất cả các vị trí import file này trong `apps/` và `packages/`.
2. Kiểm tra các tham chiếu động (nếu có).
3. Tổng hợp kết quả dưới dạng bảng: `File path` | `Line` | `Usage Context`.
4. Đưa ra kết luận file có an toàn để xóa hoặc di chuyển hay không.
"""
