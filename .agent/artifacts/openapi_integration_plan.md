# 📖 API Documentation & Testing - Implementation Plan (v2)

## Goal
Tích hợp hệ thống tự động sinh tài liệu API (OpenAPI 3.1) từ Zod schemas và cung cấp giao diện tương tác cao cấp (Scalar UI) để test API trực tiếp trên trình duyệt.

**Truy cập thông qua Frontend**: `http://localhost:5173/docs` (không phải backend trực tiếp)

## User Review Required
- [x] **Giải pháp**: Sử dụng Scalar UI + Zod-to-OpenAPI ✅
- [x] **Security**: Truy cập qua Frontend với ProtectedRoute (Admin only) ✅
- [x] **Truy cập URL**: `http://localhost:5173/docs` (qua React Router) ✅

---

## 🔄 KIẾN TRÚC MỚI

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (5173)                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  /docs  →  <ProtectedRoute admin>  →  <ApiDocsPage />   │   │
│  │            │                             │              │   │
│  │            │ Check Permission            │ Render       │   │
│  │            ▼                             ▼              │   │
│  │       useAuth()                   @scalar/api-reference │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              │ Fetch OpenAPI Spec               │
│                              ▼                                  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (3001)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  GET /api/openapi.json  →  requireAdmin  →  JSON Spec   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Proposed Changes

### Backend (`apps/api-server`) - ĐÃ HOÀN THÀNH ✅

Các file đã được tạo/sửa:
- [x] `apps/api-server/src/config/openapi.ts` - OpenAPI metadata
- [x] `apps/api-server/src/docs/registry.ts` - Registry endpoints
- [x] `apps/api-server/src/docs/index.ts` - Module export
- [x] `apps/api-server/src/app.ts` - Route `/api/openapi.json` (bảo vệ bởi auth)

**LƯU Ý**: Xóa route `/docs` trên backend (không cần nữa, sẽ serve từ Frontend)

### Frontend (`apps/web-core`) - CẦN TRIỂN KHAI

#### 1. Cài đặt thư viện mới
```bash
pnpm add @scalar/api-reference-react
```

#### 2. Tạo Page mới
- [NEW] `apps/web-core/src/pages/Admin/ApiDocs/ApiDocsPage.tsx`

```tsx
import { ApiReference } from '@scalar/api-reference-react';
import { useAuth } from '@/hooks';
import { env } from '@/config';

export default function ApiDocsPage() {
  const { user } = useAuth();
  
  return (
    <div className="h-screen">
      <ApiReference
        configuration={{
          url: `${env.API_URL}/api/openapi.json`,
          authentication: {
            preferredSecurityScheme: 'cookieAuth',
          },
          theme: 'kepler',
        }}
      />
    </div>
  );
}
```

#### 3. Thêm Route
- [MODIFY] `apps/web-core/src/AppRoutes.tsx`

```tsx
const ApiDocsPage = lazy(() => import('@/pages/Admin/ApiDocs/ApiDocsPage'));

// Trong Admin routes
<Route
  path="api-docs"
  element={
    <ProtectedRoute
      resource={PermissionResource.All}
      action={PermissionAction.Manage}
    >
      <LazyPage>
        <ApiDocsPage />
      </LazyPage>
    </ProtectedRoute>
  }
/>
```

#### 4. Thêm Navigation (Optional)
- [MODIFY] `apps/web-core/src/pages/Admin/AdminLayout.tsx` hoặc Sidebar
- Thêm menu item "API Docs" cho Admin

---

## 📋 File Summary

### Backend Files (ĐÃ HOÀN THÀNH)

| File | Trạng thái | Mô tả |
|------|------------|-------|
| `src/config/openapi.ts` | ✅ Done | OpenAPI metadata |
| `src/docs/registry.ts` | ✅ Done | Registry endpoints |
| `src/docs/index.ts` | ✅ Done | Module export |
| `src/app.ts` | ✅ Done | Route `/api/openapi.json` |

### Frontend Files (CẦN TRIỂN KHAI)

| File | Trạng thái | Mô tả |
|------|------------|-------|
| `package.json` | ⏳ Pending | Thêm `@scalar/api-reference-react` |
| `src/pages/Admin/ApiDocs/ApiDocsPage.tsx` | ⏳ Pending | Trang API Documentation |
| `src/AppRoutes.tsx` | ⏳ Pending | Thêm route `/admin/api-docs` |
| `AdminLayout.tsx` hoặc Sidebar | ⏳ Optional | Thêm menu link |

### Backend File cần XÓA/SỬA

| File | Thay đổi |
|------|----------|
| `src/app.ts` | Xóa route `/docs` (chỉ giữ `/api/openapi.json`) |

---

## Verification Plan

1. **Truy cập Frontend**: `http://localhost:5173/admin/api-docs`
   - Chưa đăng nhập → Redirect đến Login
   - User thường → Hiển thị Access Denied
   - Admin → Hiển thị Scalar UI

2. **API Spec Auth**: Truy cập trực tiếp `http://localhost:3001/api/openapi.json`
   - Chưa đăng nhập → 401 Unauthorized

3. **Interactive Test**: Dùng Scalar UI test API endpoints

4. **Cookie Auth**: Sau khi login, Scalar UI tự động có cookie session

---

## ⏱️ Thời gian còn lại

| Phase | Công việc | Thời gian |
|-------|-----------|-----------|
| ~~1~~ | ~~Backend setup~~ | ✅ Done |
| 2 | Frontend: Cài đặt + Tạo page | 15 phút |
| 3 | Frontend: Route + Navigation | 10 phút |
| 4 | Backend: Cleanup route `/docs` | 5 phút |
| 5 | Testing | 15 phút |
| **Tổng còn lại** | | **~45 phút** |

---

## 🎯 Ưu điểm của approach này

1. **Tận dụng Auth Cookie**: User đã login trên Frontend sẽ tự động có session khi test API
2. **UI nhất quán**: Nằm trong Admin Layout của ứng dụng
3. **Permission granular**: Dùng ProtectedRoute với PermissionResource
4. **No CORS issues**: Scalar UI và API cùng origin (qua proxy) hoặc đã cấu hình CORS
5. **Better DX**: Developer không cần nhớ port backend, chỉ cần `/admin/api-docs`
