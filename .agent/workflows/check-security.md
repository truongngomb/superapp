---
description: Thực hiện Rà soát Bảo mật Hộp trắng (White-box Security Audit) và lập kế hoạch refactor.
---

Đóng vai trò là một **Kỹ sư Bảo mật Cấp cao (Senior Security Engineer)** và **Kiến trúc sư Phần mềm**. Tôi cần bạn thực hiện **Rà soát Bảo mật Hộp trắng (White-box Security Audit)** toàn diện cho mã nguồn này, sau đó lập kế hoạch tái cấu trúc (refactor).

**QUY TRÌNH THỰC HIỆN (Không cần hỏi lại, hãy thực hiện tuần tự các bước sau):**

1. **TỰ ĐỘNG KHÁM PHÁ (Exploration):**
   * Quét toàn bộ cấu trúc thư mục, file cấu hình và các điểm nhập (entry points) để hiểu Tech Stack và luồng dữ liệu.

2. **DỰNG LẠI ĐẶC TẢ (Reverse Specification):**
   * Tổng hợp "Mô hình tư duy": App làm gì? User là ai? Dữ liệu quan trọng nhất nằm ở đâu?

3. **QUÉT LỖ HỔNG (Vulnerability Scanning):**
   * Rà soát code tìm lỗi theo chuẩn **OWASP Top 10**.
   * Tập trung vào: Authentication, Authorization (IDOR), Injection (SQLi/XSS), và Hardcoded Secrets.

4. **CHIẾN LƯỢC TÁI CẤU TRÚC (Refactoring Strategy):**
   * Dựa trên các lỗi tìm thấy, xây dựng một lộ trình sửa đổi code an toàn, đảm bảo không phá vỡ các tính năng hiện có.

**ĐỊNH DẠNG BÁO CÁO (Tuân thủ nghiêm ngặt cấu trúc này):**

## 1. Tổng quan Kiến trúc
* **Mục đích App:** (Tóm tắt ngắn gọn).
* **Tech Stack:** (Ngôn ngữ/Framework chính).
* **Luồng dữ liệu quan trọng:** (3 luồng nhạy cảm nhất).

## 2. Báo cáo Rà soát Bảo mật 🛑
Liệt kê vấn đề theo Độ nghiêm trọng (Critical > High > Medium):
* **🔴 Vấn đề:** [Tên lỗ hổng]
* **📍 Vị trí:** `[Đường dẫn file] : [Số dòng]`
* **💀 Tác động:** (Tại sao nguy hiểm?).
* **🛡️ Fix nhanh:** (Đoạn code sửa lỗi cục bộ).

## 3. Điểm mù & Rủi ro
* Các vấn đề về kiến trúc hoặc thiếu sót logic (không phải bug code cụ thể).

## 4. Kế hoạch Refactor Chi tiết 🛠️
Hãy đề xuất lộ trình thực hiện cụ thể:
* **Giai đoạn 1: Vá lỗi khẩn cấp (Hotfixes):** Danh sách các việc cần làm ngay để bịt lỗ hổng Critical/High.
* **Giai đoạn 2: Củng cố Kiến trúc (Hardening):** Các thay đổi lớn hơn (thêm middleware, đổi thư viện auth, tách service...).
* **Giai đoạn 3: Dọn dẹp (Cleanup):** Chuẩn hóa code style, xóa code thừa, tối ưu import.
