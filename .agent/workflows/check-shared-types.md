---
description: Kiểm tra việc sử dụng, tạo mới hoặc cập nhật các Type/Interface dùng chung từ packages/shared-types
---

# WORKFLOW: QUẢN LÝ TYPE DÙNG CHUNG (SHARED TYPES)

Bạn là một AI Engineer chịu trách nhiệm đảm bảo tính nhất quán về Type/Interface trong kiến trúc Monorepo. Mục tiêu là biến `packages/shared-types` thành **Single Source of Truth (SSoT)** và loại bỏ hoàn toàn việc duplicate types giữa Frontend và Backend.

---

## 1. NGUYÊN TẮC PHÂN CẤP & ƯU TIÊN

### 1.1. SHARED TYPES (`packages/shared-types`)
**BẮT BUỘC** đặt tại đây nếu:
- Type được dùng ở cả Frontend (apps/web-core, apps/story-weaver) và Backend (apps/api-server, apps/story-weaver-api).
- Type mô tả các thực thể (Entities) trong Database.
- Type mô tả Request/Response của API.
- Type là các tiện ích chung (Common utilities như Pagination, Error Response).

### 1.2. LOCAL TYPES
**HẠN CHẾ** và chỉ dùng nếu:
- **Backend**: Types chỉ phục vụ logic xử lý nội bộ, không bao giờ gửi ra ngoài qua API.
- **Frontend**: Types chỉ dùng cho 1 component cụ thể hoặc local state (UI-only state).

---

## 2. CHIẾN DỊCH DỌN DẸP (CLEAN-UP STRATEGY)

Trước khi tạo một type mới, AI **PHẢI** thực hiện:

1. **Rà soát trùng lặp**:
   - Quét toàn bộ `apps/` để tìm các định nghĩa `interface` hoặc `type` có cấu trúc tương đương.
   - Nếu thấy type `User` được định nghĩa ở 3 nơi khác nhau -> **BẮT BUỘC** gộp lại và đưa vào `shared-types`.
2. **Quy trình di chuyển (Extraction)**:
   - Bước 1: Định nghĩa type chuẩn tại `packages/shared-types/src/<module>.ts`.
   - Bước 2: Export tại `index.ts`.
   - Bước 3: Thay thế tất cả các định nghĩa local trong `apps/` bằng import từ `@superapp/shared-types`.
   - Bước 4: **XÓA** các định nghĩa local thừa.

---

## 3. QUY TRÌNH TẠO MỚI TẠI packages/shared-types

1. **Vị trí file**: Phân loại đúng module (auth, user, project, common, etc.).
2. **Naming Convention**:
   - PascalCase cho tất cả các types.
   - Suffix `DTO` cho các Data Transfer Objects.
   - Suffix `Request` / `Response` cho API.
3. **Zod Integration**:
   - Khuyến khích tạo Schema Zod đi kèm để validation ở cả FE và BE.
   - Schema đặt cùng file với Type, dùng `z.infer` để trích xuất type.
4. **Barrel Export**: BẮT BUỘC `export * from './module'` tại `packages/shared-types/src/index.ts`.

---

## 4. CẬP NHẬT & ĐẢM BẢO TÍNH TƯƠNG THÍCH

Khi thay đổi một type trong `shared-types`:
1. **Quét ảnh hưởng**: Liệt kê tất cả các apps đang sử dụng type này.
2. **API Alignment**: Đảm bảo Backend và Frontend đồng bộ ngay lập tức sau khi thay đổi structure của type API.
3. **Ghost Types**: Sau khi cập nhật, kiểm tra xem có "type ma" nào đang copy structure cũ mà chưa được cập nhật không.

---

## 5. ĐẦU RA BẮT BUỘC CỦA WORKFLOW

AI phải báo cáo theo mẫu sau:

### 5.1. Khi tạo mới / Di chuyển (Extraction)
- **Tình trạng**: [TẠO MỚI / CHIẾT XUẤT từ Apps]
- **Types đã gộp**: [Liệt kê các local types đã bị xóa]
- **Vị trí Shared**: `packages/shared-types/src/<file>.ts`
- **Zod Schema**: [Có/Không]
- **Kiểm tra export**: [Xác nhận đã export trong index.ts]

### 5.2. Khi audit
- **Phát hiện Duplicate**: [Danh sách file + line chứa type trùng lặp]
- **Kế hoạch hành động**: [Di chuyển type X sang shared-types/src/Y]

---

## LƯU Ý TỐI THƯỢNG
- "Thấy duplicate là phải gộp".
- Không bao giờ để Frontend tự định nghĩa lại structure của một Object mà Backend trả về.
- Sử dụng `@superapp/shared-types` làm import path duy nhất cho các types dùng chung.
