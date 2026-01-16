---
description: CHECK I18N CONSISTENCY
---

# CHECK I18N CONSISTENCY

Workflow này giúp kiểm tra và chuẩn hóa việc sử dụng i18n trong dự án, đảm bảo tuân thủ nghiêm ngặt các nguyên tắc Clean Code và Localization.

## Nguyên Tắc Cốt Lõi (Non-negotiable)

1. **NO Default Value**: Tuyệt đối KHÔNG sử dụng `defaultValue` trong hàm `t()`.
   - ❌ `t('key', { defaultValue: 'Hello' })`
   - ✅ `t('key')` (Nội dung phải nằm trong file JSON)
2. **NO Hardcoded Text**: Không để text chết trong code JSX/TSX.
3. **Common First**: Các từ khóa thông dụng (Lưu, Hủy, Xóa, Trạng thái...) BẮT BUỘC phải dùng `common:{key}`.
4. **Namespace Separation**: Text của chức năng nào phải nằm trong namespace của chức năng đó.

## Quy trình thực hiện

### Bước 1: Scan Hardcoded Text
Quét file code để tìm các chuỗi văn bản tĩnh chưa được bọc `t()`.
- Tìm các text nằm giữa thẻ tag: `>Text<`
- Tìm các text trong attribute: `label="Text"`, `placeholder="Text"`
- Bỏ qua các chuỗi logic (className, ID, URL).

### Bước 2: Kiểm tra hàm `t()` sai quy chuẩn
Tìm các pattern vi phạm:
- Regex tìm: `t\(['"][^'"]+['"],\s*\{\s*defaultValue`
- Báo cáo vị trí các dòng code đang dùng `defaultValue`.

### Bước 3: Đề xuất Refactor
Đối với mỗi vấn đề tìm thấy:
1. Xác định **Key** mới (nếu chưa có).
2. Kiểm tra xem Key này có thuộc về `common` không? (VD: `Submit`, `Cancel`, `Name`, `Email` -> Chuyển vào `common`).
3. Nếu là đặc thù feature -> Đưa vào `{feature}.json`.

### Bước 4: Verification (File JSON)
Kiểm tra file ngôn ngữ (EN, VI, KO):
- Key đã tồn tại đủ 3 ngôn ngữ chưa?
- Nội dung có khớp với ngữ cảnh không?

## Prompt thực thi mẫu

"""
Bạn là chuyên gia Localization (i18n).
Nhiệm vụ: Audit và Fix i18n cho file: `[Đường dẫn file]`

**Bước 1: Phân tích Code**
- Tìm text cứng (Hardcoded).
- Tìm việc sử dụng `defaultValue` sai quy định.
- Tìm các key trùng lặp hoặc nên đưa vào `common`.

**Bước 2: Check File JSON**
- Đọc các file:
  - `apps/web-core/src/locales/en/[ns].json`
  - `apps/web-core/src/locales/vi/[ns].json`
  - `apps/web-core/src/locales/ko/[ns].json`
- Đảm bảo key đề xuất đã có hoặc cần thêm mới.

**Bước 3: Báo cáo & Plan**
- Liệt kê danh sách thay đổi theo format:
  | Vị trí (Line) | Vấn đề | Giải pháp (New Key) | File JSON cần sửa |
  | :--- | :--- | :--- | :--- |
  | 45 | Dùng defaultValue | `t('users:title')` | users.json (add key) |
  | 89 | Hardcoded "Save" | `t('common:actions.save')` | N/A (đã có) |

**Yêu cầu đặc biệt:**
- Nếu key thuộc nhóm Common (Action, Status, Validation), hãy check file `common.json` trước.
- Tuyệt đối xóa bỏ `defaultValue`.
"""
