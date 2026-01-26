---
description: Thực hiện kiểm tra toàn diện i18n, shared components và shared types
---

# WORKFLOW: CHECK ALL (I18N + COMPONENTS + TYPES)

Workflow này là sự kết hợp của 3 quy trình kiểm tra quan trọng nhất để đảm bảo chất lượng và tính nhất quán của hệ thống Monorepo.

---

## CÁC BƯỚC THỰC HIỆN

### 1. Kiểm tra i18n (Localization)
- Thực hiện theo quy trình tại: `[.agent/workflows/check-i18n.md]`
- Mục tiêu: Loại bỏ text cứng, đảm bảo đầy đủ các bản dịch cho EN, VI, KO.

### 2. Kiểm tra Component dùng chung (Shared Components)
- Thực hiện theo quy trình tại: `[.agent/workflows/check-shared-component.md]`
- Mục tiêu:
  - Đảm bảo tuân thủ sử dụng `@superapp/ui-kit` thay vì thẻ HTML thô.
  - Phát hiện và trích xuất các component lặp lại giữa các app lên shared package.

### 3. Kiểm tra Type dùng chung (Shared Types)
- Thực hiện theo quy trình tại: `[.agent/workflows/check-shared-types.md]`
- Mục tiêu: Biến `packages/shared-types` thành Single Source of Truth, chuẩn hóa đặt tên và cấu trúc dữ liệu.

---

## CÁCH SỬ DỤNG

Khi được yêu cầu "Check All", AI sẽ tự động quét qua cả 3 danh mục trên cho các file/thư mục được chỉ định và trả về một báo cáo tổng hợp.

## BÁO CÁO TỔNG HỢP (SUMMARY REPORT)

AI sẽ tổng kết theo mẫu:

1. **i18n Status**: [Số lỗi vi phạm / Trạng thái sạch]
2. **Component Status**: [Các điểm cần thay thế bằng UI Kit / Các component cần trích xuất]
3. **Types Status**: [Các type cần đồng nhất / Trạng thái SSoT]
4. **Hành động đề xuất**: [Danh sách các thay đổi cần thực hiện ngay]
