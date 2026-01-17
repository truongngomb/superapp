---
description: Kiểm tra việc sử dụng, tạo mới hoặc cập nhật các Type/Interface dùng chung từ packages/shared-types
---

# WORKFLOW: QUẢN LÝ TYPE DÙNG CHUNG (SHARED TYPES)

Bạn là một AI Engineer chịu trách nhiệm đảm bảo tính nhất quán về Type/Interface trong kiến trúc Monorepo, giảm thiểu việc duplicate types và đảm bảo type-safety giữa Frontend và Backend.

---

## 1. PHÂN CẤP VỊ TRÍ TYPES

### 1.1. SHARED TYPES (`packages/shared-types`)
Package chính chứa các types dùng chung cho **TOÀN BỘ monorepo**:

| File | Mục đích |
|------|----------|
| `common.ts` | Pagination, API Response, QueryParams, BaseEntity |
| `auth.ts` | Login, Register, User Session, Token |
| `user.ts` | User entity, User DTO |
| `role.ts` | Role entity, Permission |
| `category.ts` | Category entity, Category DTO |
| `activity_log.ts` | Activity Log entity, Log DTO |
| `system.ts` | System config, Settings |
| `index.ts` | Barrel export - BẮT BUỘC export tất cả types |

### 1.2. LOCAL TYPES (Backend - `apps/api-server/src/types`)
Chỉ dành cho types **RIÊNG** của Backend:
- Request/Response types đặc thù
- Internal processing types
- Database-specific types

### 1.3. LOCAL TYPES (Frontend - `apps/web-core/src/context/*.types.ts`)
Chỉ dành cho types **RIÊNG** của Frontend:
- Context state types
- Component-specific props (nếu không tái sử dụng)
- UI state types

---

## 2. KIỂM TRA TRƯỚC KHI TẠO MỚI (PRE-CREATION CHECK)

Khi nhận được yêu cầu tạo Type/Interface mới:

1. **Quét thư viện dùng chung**:
   - Kiểm tra `packages/shared-types/src/*.ts`
   - Sử dụng `grep_search` để tìm type tương tự đã tồn tại

2. **Xác định phạm vi sử dụng**:
   | Điều kiện | Vị trí đặt |
   |-----------|------------|
   | Dùng ở CẢ Frontend VÀ Backend | `packages/shared-types` |
   | Chỉ dùng ở Backend | `apps/api-server/src/types` |
   | Chỉ dùng ở 1 Context/Component | Local types file |
   | Dùng ở nhiều features trong Frontend | `packages/shared-types` |

3. **So sánh tính năng**:
   - Nếu đã tồn tại type tương tự: BẮT BUỘC sử dụng lại hoặc mở rộng (extend/intersection).
   - Nếu chưa có: Xác định scope và tạo tại vị trí phù hợp.

---

## 3. QUY TRÌNH TẠO MỚI TẠI packages/shared-types

### 3.1. Cấu trúc file
```
packages/shared-types/src/
├── common.ts          # Types chung: Pagination, Response, etc.
├── auth.ts            # Authentication types
├── user.ts            # User entity types
├── role.ts            # Role & Permission types
├── category.ts        # Category entity types
├── activity_log.ts    # Activity Log types
├── system.ts          # System/Config types
└── index.ts           # Barrel export (BẮT BUỘC)
```

### 3.2. Tiêu chuẩn Code

1. **Naming Convention**:
   - Interface: `I` prefix KHÔNG bắt buộc, nhưng phải nhất quán
   - Type: PascalCase (VD: `UserRole`, `PaginatedResponse`)
   - DTO: Suffix với `DTO` (VD: `CreateUserDTO`)
   - Request/Response: Suffix tương ứng (VD: `LoginRequest`, `LoginResponse`)

2. **Generic Types**:
   - Ưu tiên sử dụng Generic cho reusable types
   ```typescript
   export interface PaginatedResponse<T> {
     items: T[];
     page: number;
     totalPages: number;
   }
   ```

3. **Zod Integration** (nếu cần validation):
   - Đặt schema Zod cùng file với type
   - Export cả type và schema
   ```typescript
   export const UserSchema = z.object({ ... });
   export type User = z.infer<typeof UserSchema>;
   ```

4. **Barrel Export** - BẮT BUỘC:
   - Sau khi tạo type mới, PHẢI export trong `index.ts`
   ```typescript
   export * from './user';
   export * from './role';
   ```

---

## 4. CẬP NHẬT TYPE HIỆN CÓ

Khi thay đổi một type trong `packages/shared-types`:

### 4.1. Impact Analysis (Phân tích ảnh hưởng)
```bash
# Tìm tất cả vị trí sử dụng type
grep_search --query "TypeName" --path "apps/"
```

### 4.2. Checklist trước khi thay đổi
- [ ] Liệt kê TẤT CẢ files đang import type này
- [ ] Phân tích Breaking Changes
- [ ] Nếu có breaking change → Tạo type mới (VD: `UserV2`) hoặc optional fields

### 4.3. Các trường hợp thay đổi an toàn
| Thay đổi | An toàn? | Ghi chú |
|----------|----------|---------|
| Thêm optional field | ✅ | Không ảnh hưởng code cũ |
| Thêm required field | ❌ | Breaking change |
| Đổi tên field | ❌ | Breaking change |
| Xóa field | ❌ | Breaking change |
| Mở rộng union type | ✅ | `type Status = 'A' \| 'B' \| 'C'` |

---

## 5. KIỂM TRA SỬ DỤNG (TYPE AUDIT)

### 5.1. Import Check
Sử dụng `grep_search` để rà soát:

```bash
# Kiểm tra import từ shared-types
grep_search --query "@superapp/shared-types" --path "apps/"

# Phát hiện duplicate types
grep_search --query "interface User" --path "apps/"
grep_search --query "type User =" --path "apps/"
```

### 5.2. Các vi phạm cần phát hiện

| Vi phạm | Mô tả | Hành động |
|---------|-------|-----------|
| Duplicate Type | Định nghĩa type đã có trong shared-types | Xóa và import từ shared-types |
| Wrong Import | Import type từ sai vị trí | Sửa import path |
| Missing Export | Type mới chưa export trong index.ts | Thêm export |
| Inconsistent Naming | Đặt tên không theo convention | Refactor naming |

### 5.3. Commands hữu ích
```bash
# Tìm tất cả type definitions trong apps/
grep_search --query "^export (type|interface)" --path "apps/" --regex

# Tìm types có thể duplicate với shared-types
grep_search --query "interface.*{" --path "apps/web-core/src/types"
```

---

## 6. SYNC FRONTEND - BACKEND TYPES

### 6.1. Nguyên tắc
- Frontend và Backend PHẢI sử dụng CÙNG types cho API request/response
- Types được định nghĩa tại `packages/shared-types`
- KHÔNG duplicate type ở cả 2 phía

### 6.2. Workflow khi thêm API mới
```
1. Định nghĩa Request/Response types tại packages/shared-types
2. Export trong index.ts
3. Backend import từ @superapp/shared-types
4. Frontend import từ @superapp/shared-types
```

---

## 7. ĐẦU RA BẮT BUỘC CỦA WORKFLOW

AI phải báo cáo theo mẫu sau:

### 7.1. Khi tạo mới
```
- **Tình trạng**: TẠO MỚI
- **Vị trí**: packages/shared-types/src/<file>.ts
- **Types được tạo**: [Danh sách type names]
- **Đã export trong index.ts**: ✅/❌
- **Zod Schema**: Có/Không
```

### 7.2. Khi cập nhật
```
- **Tình trạng**: CẬP NHẬT
- **Vị trí**: packages/shared-types/src/<file>.ts
- **Types bị ảnh hưởng**: [Danh sách type names]
- **Breaking Changes**: Có/Không
- **Files bị ảnh hưởng**: 
  - apps/api-server/src/...
  - apps/web-core/src/...
```

### 7.3. Khi audit
```
- **Tình trạng**: AUDIT
- **Vi phạm phát hiện**: [Số lượng]
- **Chi tiết vi phạm**:
  | File | Loại vi phạm | Đề xuất |
  |------|--------------|---------|
  | ... | ... | ... |
- **Tuân thủ**: [% tuân thủ]
```

---

## 8. QUICK REFERENCE

### Import paths
```typescript
// ✅ Đúng - Import từ shared-types
import { User, Role, PaginatedResponse } from '@superapp/shared-types';

// ❌ Sai - Duplicate type local
interface User { ... }

// ❌ Sai - Import từ internal path
import { User } from '@superapp/shared-types/src/user';
```

### Type extension
```typescript
// ✅ Extend shared type khi cần thêm fields
import { User } from '@superapp/shared-types';

interface UserWithUI extends User {
  isSelected: boolean;
  isEditing: boolean;
}
```
