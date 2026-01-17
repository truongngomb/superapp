# Manual Test: TanStack Query (State Management & Caching)

Tài liệu này hướng dẫn cách kiểm tra bằng tay để đảm bảo TanStack Query hoạt động đúng thiết kế trong hệ thống.

## 1. Kiểm tra Caching (Trải nghiệm người dùng)
- **Mục tiêu**: Đảm bảo dữ liệu không bị load lại (hiện skeleton) khi quay lại trang cũ.
- **Các bước**: 
    1. Truy cập **Categories** -> Đợi dữ liệu hiện.
    2. Click sang **Users** hoặc **Roles**.
    3. Click quay lại **Categories**.
- **Kết quả**: Dữ liệu hiện ngay lập tức. Quan sát DevTools thấy Query chuyển từ trạng thái `stale` sang `fetching` (background) nhưng UI không bị giật/lag.

## 2. Kiểm tra Window Focus Refetch
- **Mục tiêu**: Tự động đồng bộ dữ liệu khi người dùng quay lại ứng dụng.
- **Các bước**: 
    1. Để app ở trang bất kỳ.
    2. Chuyển sang một phần mềm khác (Browser tab khác, VS Code, Slack...) trong > 30 giây.
    3. Quay lại trình duyệt App.
- **Kết quả**: Quan sát tab **Network**, một request mới được gửi đi ngay khi tab được focus lại.

## 3. Kiểm tra CRUD & Cache Invalidation
- **Mục tiêu**: Dữ liệu phải "tươi" ngay sau khi thao tác.
- **Các bước**: 
    1. Tạo một bản ghi mới (Ví dụ: Thêm 1 Category).
    2. Quan sát danh sách sau khi lưu thành công.
- **Kết quả**: 
    - Danh sách tự động cập nhật bản ghi mới mà không cần F5.
    - TanStack DevTools: Query `list` tương ứng tự động chạy lại.

## 4. Kiểm tra xử lý Race Condition
- **Mục tiêu**: Ngăn chặn lỗi hiển thị sai dữ liệu khi mạng chậm hoặc thao tác nhanh.
- **Các bước**: 
    1. Vào ô Search, gõ thật nhanh từ khóa (ví dụ: gõ `abcde` thật nhanh).
    2. Hoặc click liên tục vào các số ở thanh Phân trang (1 -> 2 -> 3).
- **Kết quả**: Tab **Network** sẽ hiện các request trước đó bị `Canceled` (màu đỏ gạch ngang). UI chỉ hiển thị kết quả của request cuối cùng.

## 5. Sử dụng DevTools để Debug chuyên sâu
- **Key States**:
    - **Fresh (Xanh)**: Dữ liệu đang mới, không cần gọi API lại.
    - **Stale (Vàng)**: Dữ liệu đã cũ (sau 30s), sẽ gọi API lại khi có tác động (focus/mount).
    - **Fetching (Xanh dương)**: Đang trong quá trình gọi API.
    - **Inactive (Xám)**: Dữ liệu đang được cache nhưng trang hiện tại không dùng đến.

---
*Cấu trúc folder: `.agent/docs/manual-test/`*
