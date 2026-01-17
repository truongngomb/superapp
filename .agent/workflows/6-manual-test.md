---
description: Hướng dẫn tạo kịch bản kiểm thử thủ công (Manual Test Case) cho tính năng hoặc công nghệ mới.
---

## MỤC TIÊU
Đảm bảo mọi tính năng/công nghệ mới được tích hợp đều có tài liệu hướng dẫn kiểm tra thực tế (End-to-End) để QA/Dev có thể verify nhanh chóng.

## QUY ĐỊNH VỊ TRÍ & ĐẶT TÊN
- **Thư mục**: `.agent/docs/manual-test/`
- **Định dạng tên file**: `{feature-name}.md` hoặc `{technology-name}.md` (Dùng kebab-case).
- **Ngôn ngữ**: Tiếng Việt (Trao đổi hướng dẫn) và Tiếng Anh (Technical terms).

## CẤU TRÚC FILE CHUẨN (TEMPLATE)
Mọi file manual test bắt buộc phải có các phần sau:

```markdown
# Manual Test: [Tên Tính Năng/Công Nghệ]

## 1. Chuẩn bị (Prerequisites)
- [ ] Môi trường (Local/Dev/Staging)
- [ ] Tài khoản (Admin/User/Guest)
- [ ] Dữ liệu mẫu cần thiết

## 2. Các kịch bản kiểm thử (Test Scenarios)

### Kịch bản 1: [Tên kịch bản - e.g: Happy Path]
- **Mục tiêu**: [Mô tả ngắn]
- **Các bước thực hiện**: 
    1. Bước 1...
    2. Bước 2...
- **Kết quả mong muốn**: [Mô tả chi tiết kết quả đúng]

### Kịch bản 2: [Tên kịch bản - e.g: Edge Case/Error Handling]
- **Mục tiêu**: ...
- **Các bước**: ...
- **Kết quả**: ...

## 3. Dấu hiệu nhận biết lỗi (Troubleshooting)
- [ ] Các lỗi thường gặp
- [ ] Cách xem log (Browser Console, Network, Backend Log)

## 4. Công cụ hỗ trợ (Tools)
- [ ] DevTools (Network tab, React Query DevTools...)
- [ ] Postman / Swagger
```

## QUY TRÌNH THỰC HIỆN
1. Sau khi hoàn thành code một tính năng lớn (sau bước `/3-dev-feature`).
2. AI tự động đề xuất tạo file Manual Test trong folder `.agent/docs/manual-test/`.
3. AI viết nội dung dựa trên logic thực tế đã code.
4. Thông báo cho người dùng vị trí file để người dùng tiến hành test.
