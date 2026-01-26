---
description: CLEAN & CLEAR CODEBASE OPTIMIZATION
---

# CLEAN & CLEAR CODEBASE OPTIMIZATION

Workflow này giúp tinh gọn mã nguồn, loại bỏ các thành phần rác, dư thừa và đảm bảo tính nhất quán (Clean & Clear) cho một ứng dụng hoặc thư mục cụ thể.

## Nguyên Tắc Cốt Lõi

1. **Focus First**: Chỉ giữ lại những gì ứng dụng thực sự cần.
2. **No Dead Code**: Xóa bỏ các export, import và file không sử dụng.
3. **I18n Minimalist**: Chỉ đăng ký các namespace ngôn ngữ đang dùng.
4. **Professional Placeholders**: Thay thế text cứng (Coming soon) bằng UI chuẩn.

## Quy trình thực hiện

### Bước 1: Rà soát I18n & Locales
- **Scan**: Kiểm tra thư mục `src/locales`. Nếu có các file JSON copy từ app khác (ví dụ: Admin locales) mà app hiện tại không dùng -> **XÓA**.
- **Config**: Cập nhật `src/config/i18n.ts`. Loại bỏ việc import và đăng ký các namespace vừa xóa.

### Bước 2: Tối ưu hóa Barrel Files (index.ts)
- **Hooks & Services**: Kiểm tra `src/hooks/index.ts` và `src/services/index.ts`.
- **Audit**: Sử dụng `grep_search` để xem các thành phần đang re-export có thực sự được sử dụng trong codebase không.
- **Action**: Loại bỏ các export "chết" (Dead exports).

### Bước 3: Loại bỏ Junk Files
- Kiểm tra các file mặc định của template nhưng không dùng (VD: `App.css`, các logo mặc định).
- Kiểm tra các style unused hoặc file rác phát sinh trong quá trình development.

### Bước 4: Refactor Routing & UI Placeholders
- Kiểm tra `AppRoutes.tsx`.
- Loại bỏ các chuỗi văn bản cứng (Hardcoded strings) trong placeholder.
- Sử dụng các UI component chuẩn (như `EmptyState`, `LoadingSpinner`) cho các tính năng đang phát triển (Coming soon).

### Bước 5: Verify & Build
- Đảm bảo dự án vẫn build thành công sau khi dọn dẹp.
- Kiểm tra lỗi import do xóa file hoặc export.

## Prompt thực thi mẫu

"""
Bạn là chuyên gia Code Refactoring.
Nhiệm vụ: Thực hiện chiến dịch "Clean & Clear" cho: `[Đường dẫn folder/app]`

**Yêu cầu:**
1. Tìm và đề xuất xóa các file locale JSON không sử dụng.
2. Làm sạch file cấu hình i18n (chỉ giữ namespace thực dùng).
3. Rà soát `hooks/index.ts` và `services/index.ts`, xóa các export không được import ở nơi nào khác.
4. Tìm các Junk files (App.css, unused assets) để xóa.
5. Fix các đoạn text cứng "Coming soon" trong routing bằng UI Kit.

**Báo cáo:**
- Danh sách file sẽ xóa.
- Danh sách các thay đổi trong barrel files.
- Xác nhận sau khi dọn dẹp app vẫn hoạt động đúng.
"""
