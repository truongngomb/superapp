---
description: CHECK SKELETON CONSISTENCY
---

# CHECK SKELETON CONSISTENCY

Workflow này giúp kiểm tra tính đồng bộ giữa **Loading Skeleton** và **Giao diện thực tế (UI)**.
Mục tiêu là đảm bảo layout không bị "giật" (layout shift) khi chuyển từ trạng thái Loading sang hiển thị dữ liệu.

## Nguyên tắc cốt lõi

1. **One-to-One Mapping**: Mọi cột (Column) trong Bảng hoặc phần tử trong Form phải có một Skeleton tương ứng.
2. **Dimension Matching**: Width, Height, Padding, Margin của Skeleton phải KHỚP CHÍNH XÁC với phần tử thật.
3. **Visibility Matching**: Các thuộc tính ẩn hiện (responsive: `hidden md:block`...) phải giống hệt nhau.

## Quy trình thực hiện

1. **Xác định Context**:
   - Xác định `Page` đang cần kiểm tra (Ví dụ: `UsersPage.tsx`).
   - Tìm component `Table` hoặc `List` chính trong Page đó.
   - Tìm component `Skeleton` tương ứng (thường nằm cạnh hoặc trong folder `components/`).

2. **So sánh Cấu trúc (Column-by-Column)**:
   - Mở file `Page`/`DataTable` để xem định nghĩa `columns`.
   - Mở file `Skeleton` để xem cấu trúc `thead` và `tbody`.
   - So sánh từng cặp thẻ `<th>` và `<td>`:
     - **Class**: Có cùng width (`w-[px]`)? Cùng padding (`p-4`)?
     - **Responsive**: Có cùng class ẩn hiện (`hidden md:table-cell`)?
     - **Order**: Thứ tự cột có giống nhau không?

3. **Báo cáo**:
   - Chỉ ra các điểm lệch pha chi tiết.

## Prompt thực thi

Dưới đây là prompt mẫu để thực hiện kiểm tra:

"""
Bạn là chuyên gia UI/UX và Frontend Performance.
Nhiệm vụ: Kiểm tra độ khớp (Consistency Check) giữa Skeleton Loading và UI thật.

**Bước 1: Xác định File**
- File UI: `[Đường dẫn file Page/Component chính]`
- File Skeleton: `[Đường dẫn file Skeleton tương ứng]`

**Bước 2: Phân tích & So sánh**
- Đọc code của File UI: Tìm định nghĩa `columns` (đối với Table) hoặc cấu trúc Layout. Chú ý kỹ các class Tailwind quy định kích thước (`w-`, `h-`) và hiển thị (`hidden`, `flex`).
- Đọc code của File Skeleton: Xem xét cấu trúc HTML/JSX.
- Lập bảng so sánh "Cột vs Cột" hoặc "Block vs Block".

**Tiêu chí kiểm tra:**
1. **Số lượng**: Số lượng cột/block có bằng nhau không?
2. **Kích thước**: Class `w-[...]`, `flex-...` có khớp nhau không?
3. **Responsive**: Các class như `hidden md:flex` có đồng bộ không?
4. **Alignment**: Text align (`text-left`, `text-center`, `text-right`) có giống nhau không?

**Báo cáo sai lệch:**
Nếu phát hiện bất kỳ sự khác biệt nào, hãy báo cáo theo format:
- **Vị trí**: [Tên cột / Khu vực]
- **UI thật**: [Mô tả class/width thực tế]
- **Skeleton**: [Mô tả class/width hiện tại]
- **Đề xuất fix**: [Gợi ý code thay đổi để đồng bộ]

Nếu hoàn toàn khớp, hãy xác nhận: "✅ Skeleton đã đồng bộ hoàn toàn với UI."
"""
