---
description: So sánh và đảm bảo tính đồng nhất giữa hai đường dẫn mã nguồn (tệp tin hoặc thư mục)
---

# Quy Trình Kiểm Tra Đồng Nhất (Consistency Check)

Thực hiện theo các bước sau để so sánh và đảm bảo mã nguồn đồng bộ giữa hai vị trí (Nguồn và Đích).
Mục tiêu: Đảm bảo đồng nhất về **Phong cách Viết Code (Coding Style)**, **Quy tắc Đặt tên (Naming Convention)**, **Logic Nghiệp Vụ**, **Cấu trúc Thư mục**, và **Nội dung Comment**.

## 1. Xác Định Đối Tượng
- Yêu cầu người dùng cung cấp:
  - **Đường dẫn Nguồn (A)**: Code chuẩn đùng làm mẫu tham chiếu (Source of Truth).
  - **Đường dẫn Đích (B)**: Code cần kiểm tra hoặc cập nhật.
- Xác định đó là Tệp tin (File) hay Thư mục (Directory) bằng `list_dir` hoặc kiểm tra đuôi mở rộng.

## 2. Phân Tích Cấu Trúc (Đối với Thư mục)
- Liệt kê file trong Nguồn: `dir /s /b "SourcePath"`
- Liệt kê file trong Đích: `dir /s /b "TargetPath"`
- So sánh danh sách và phân loại:
  - **Thiếu (Missing)**: Có ở Nguồn nhưng chưa có ở Đích.
  - **Thừa (Extra)**: Có ở Đích nhưng không có ở Nguồn (cần đánh giá xem có nên xóa không).
  - **Chung (Common)**: Có ở cả hai (cần so sánh nội dung chi tiết).

## 3. So Sánh Chi Tiết (Nội Dung Tệp tin)
Với mỗi file quan trọng (hoặc file user chỉ định), sử dụng `view_file` để đọc cả 2 bên và so sánh các tiêu chí:

### A. Phong cách Code & Cú pháp (Style & Syntax)
- **Định dạng (Formatting)**: Thụt đầu dòng (Indentation), vị trí dấu ngoặc, ngắt dòng.
- **Imports**: Thứ tự import, cách nhóm import (thư viện vs nội bộ), sử dụng alias (`@/` hay path tương đối).
- **ESLint/TS Rules**: Các rule linter có giống nhau không? (ví dụ: `eslint-disable`).

### B. Nội Dung Comment & Tài Liệu (Documentation)
- **JSDoc/TSDoc**: So sánh phần mô tả hàm, tham số (@param), giá trị trả về (@returns), và ví dụ (@example). Code Nguồn có ví dụ thì Đích cũng nên có.
- **Inline Comments**: Các comment giải thích logic bên trong hàm có tương đồng không?
- **Ngôn ngữ**: Đảm bảo dùng cùng một ngôn ngữ (Tiếng Anh/Việt) cho comment.
- **Mức độ chi tiết**: Nếu Nguồn giải thích kỹ, Đích cũng phải giải thích, tránh trường hợp Nguồn `/** Chi tiết... */` mà Đích chỉ là `// Todo`.

### C. Quy tắc Đặt tên (Naming Convention)
- **Biến/Hàm**: `camelCase` hay `snake_case`.
- **Types/Interfaces**: `PascalCase`, có dùng tiền tố `I`, `T` hay không.
- **Hằng số (Constants)**: `SCREAMING_SNAKE_CASE`.
- **Tên File**: `kebab-case` hay `PascalCase`.

### D. Logic & Triển khai
- **Luồng logic**: Các bước xử lý, validate dữ liệu, xử lý lỗi.
- **Chữ ký hàm**: Tên hàm, tham số, kiểu trả về.

## 4. Báo Cáo Kết Quả
Xuất ra báo cáo Markdown dạng bảng tóm tắt:

| File/Module | Trạng Thái | Khác Biệt Chính | Khuyến Nghị |
|-------------|------------|-----------------|-------------|
| `auth.ts`   | ⚠️ Lệch    | Thiếu JSDoc @example | Bổ sung ví dụ vào comment |
| `util.ts`   | ✅ Khớp    | - | - |
| `cache.ts`  | ⚠️ Lệch    | Thiếu eslint-disable | Thêm comment disable |

## 5. Kế Hoạch Đồng Bộ (Khắc phục)
Nếu người dùng yêu cầu Đồng bộ (Sync) hoặc Sửa lỗi (Fix), hãy lập **Kế Hoạch Thực Thi (Execution Plan)** chi tiết:

### Bước 1: Chuẩn bị
- [ ] Xác nhận backup hoặc trạng thái Git sạch sẽ.
- [ ] List ra danh sách các file cần xử lý.

### Bước 2: Thao Tác (Chi tiết từng File)
Với mỗi file cần đồng bộ, chỉ rõ hành động:
- **CREATE**: Tạo mới file thiếu.
- **UPDATE**: Sửa nội dung file lệch.
  - *Lưu ý*: Copy cả phần Comment/JSDoc từ Nguồn sang Đích nếu thiếu.

### Bước 3: Kiểm Tra Sau Đồng Bộ
- [ ] Chạy lại lệnh build/kiểm tra lỗi cú pháp.
- [ ] Verify lại import paths.

### QUY TẮC AN TOÀN:
1. **Context-Aware**: Không copy-paste mù quáng.
2. **Preserve Custom Logic**: Giữ lại logic đặc thù riêng của Đích.
3. **Comment Sync**: Comment là một phần của code chất lượng, phải đồng bộ để dễ bảo trì.
