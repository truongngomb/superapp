---
description: CHECK SKELETON CONSISTENCY
---

# CHECK SKELETON CONSISTENCY

Workflow này giúp kiểm tra tính đồng bộ giữa **Loading Skeleton** và **Giao diện thực tế (UI)** cho cả phiên bản Desktop (Table) và Mobile (List).
Mục tiêu là đảm bảo layout không bị "giật" (layout shift) khi chuyển từ trạng thái Loading sang hiển thị dữ liệu.

## Nguyên tắc cốt lõi

1. **One-to-One Mapping**: Mọi cột trong Table hoặc hàng thông tin trong Card Mobile phải có một Skeleton tương ứng.
2. **Dimension Matching**: `gridTemplateColumns`, `width`, `height`, `padding` của Skeleton phải KHỚP CHÍNH XÁC với phần tử thật.
3. **Visibility Matching**: Các thuộc tính ẩn hiện (responsive: `hidden`, `md:block`, `hideOnMobile`...) phải giống hệt nhau.
4. **Shared Components First**: Ưu tiên sử dụng `DataTableSkeleton` và `ResourceCardSkeletonList` từ `@superapp/ui-kit`.

## Các thành phần chuẩn (SSoT)

### 1. Desktop Table (`DataTableSkeleton`)
Sử dụng khi UI chính dùng `DataTable` hoặc `Table`.
- **Kiểm tra**:
  - `gridTemplateColumns`: Phải khớp với header của Table thật.
  - `columns` array: Kiểu dữ liệu (`checkbox`, `circle`, `text`, `badge`, `actions`, `avatar-text`) phải đúng thứ tự.
  - `align`: Căn lề (`left`, `center`, `right`) phải đồng bộ.

### 2. Mobile List (`ResourceCardSkeletonList`)
Sử dụng khi UI mobile dùng `ResourceMobileList`.
- **Kiểm tra**:
  - `infoRowsCount`: Số lượng dòng thông tin skeleton phải khớp với `infoRows` trong `ResourceMobileCard`.
  - `actionsCount`: Số lượng nút bấm skeleton phải khớp với `actions` trong `ResourceMobileCard`.

---

## Quy trình thực hiện

1. **Xác định Context**:
   - Page đang cần kiểm tra (ví dụ: `UsersPage.tsx`).
   - Xác định view đang hiển thị: Desktop Table hay Mobile List.
   - Tìm component Skeleton tương ứng (thường là `XxxTableSkeleton.tsx` hoặc khai báo trực tiếp trong `XxxMobileList.tsx`).

2. **So sánh Cấu trúc (Desktop)**:
   - Mở file UI/Table để xem định nghĩa `columns`.
   - Mở file `XxxTableSkeleton.tsx` so sánh prop `gridTemplateColumns` và mảng `columns`.
   - Kiểm tra class CSS/Tailwind quy định width/min-width.

3. **So sánh Cấu trúc (Mobile)**:
   - Mở file `XxxMobileList.tsx`.
   - Đếm số lượng `infoRows` và `actions` được render trong `ResourceMobileCard`.
   - So sánh với prop `infoRowsCount` và `actionsCount` của `ResourceCardSkeletonList`.

## Prompt thực thi

"""
Bạn là chuyên gia UI/UX. Nhiệm vụ: Kiểm tra độ khớp (Consistency Check) giữa Skeleton Loading và UI thật.

**Bước 1: Xác định File**
- File UI chính: `[Đường dẫn]`
- File UI Mobile (nếu có): `[Đường dẫn]`
- File Skeleton tương ứng: `[Đường dẫn]`

**Bước 2: Phân tích & So sánh**

### Kiểm tra Desktop (Table):
1. **Layout**: `gridTemplateColumns` trong `DataTableSkeleton` có khớp với Table thật không?
2. **Cột**: Thứ tự và kiểu (`type`) của các cột skeleton có đúng với cell dữ liệu?
3. **Alignment**: Căn lề (`align`) có đồng bộ?
4. **Responsive**: Các cột bị ẩn trên mobile (`hideOnMobile`) có được đánh dấu đúng trong skeleton?

### Kiểm tra Mobile (List):
1. **Thông tin**: `infoRowsCount` có khớp với số lượng dòng trong `ResourceMobileCard`?
2. **Hành động**: `actionsCount` có khớp với số lượng nút bấm trong `ResourceMobileCard`?

**Báo cáo sai lệch:**
Nếu phát hiện bất kỳ sự khác biệt nào, hãy báo cáo theo format:
- **Vị trí**: [Desktop Table / Mobile Card / Cột X]
- **UI thật**: [Mô tả thực tế]
- **Skeleton**: [Mô tả hiện tại của skeleton]
- **Đề xuất fix**: [Code gợi ý]

Nếu hoàn toàn khớp: "✅ Skeleton đã đồng bộ hoàn toàn với UI."
"""
