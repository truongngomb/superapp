# TanStack Query (React Query) v5 Migration - Implementation Plan

> **Priority**: 🔴 Cao (Ưu tiên số 1 - Server State & Caching)  
> **Created**: 2026-01-16  
> **Status**: ✅ APPROVED - 2026-01-16 23:30

### Confirmed Decisions
- ✅ Giữ nguyên interface `useResource` (Cách A - an toàn)
- ✅ Stale time: 30 giây cho list data
- ✅ DevTools: Chỉ bật trong development
- ✅ Optimistic Updates: Để Phase 2
- ✅ Timeline: ~1 ngày cho Phase 1

---

## Goal

Tích hợp **TanStack Query v5** để thay thế logic fetch trong `useResource` hook, giữ nguyên interface hiện tại để không ảnh hưởng các trang đang sử dụng. Migration này sẽ mang lại:

- ✅ **Auto Caching & Background Updates**: Dữ liệu luôn tươi mới mà không cần reload
- ✅ **Deduping Requests**: 5 components cùng cần User → chỉ gọi 1 API
- ✅ **Optimistic Updates**: UI thay đổi ngay lập tức (like Facebook), rollback nếu lỗi
- ✅ **Race Condition Handling**: Tự động hủy request cũ khi có request mới
- ✅ **DevTools**: Debug API state cực mạnh trong development

---

## User Review Required

Trước khi triển khai, vui lòng xác nhận:

- [ ] **Phạm vi Phase 1**: Chỉ migration `useResource` hook, giữ nguyên API interface?
- [ ] **Stale Time Strategy**: Sử dụng 30s cho list data, 5 phút cho detail data?
- [ ] **DevTools**: Bật DevTools chỉ trong development mode?
- [ ] **Breaking Changes**: Có chấp nhận minor behavior changes (background refetch)?

---

## Current State Analysis

### Codebase hiện tại

| Component | File | Description |
|-----------|------|-------------|
| `useResource` | `apps/web-core/src/hooks/useResource.ts` (316 lines) | Generic hook quản lý CRUD + pagination |
| `useResourceService` | `apps/web-core/src/hooks/useResourceService.ts` (98 lines) | Factory tạo service CRUD |
| `categoryService` | `apps/web-core/src/services/category.service.ts` | Mẫu service thực tế |

### Các trang đang sử dụng `useResource`:

1. `CategoriesPage.tsx` - Categories Management (SSoT)
2. `UsersPage.tsx` - User Management
3. `RolesPage.tsx` - Role Management

### Vấn đề hiện tại với `useResource`:

```
❌ Duplicate Requests: Mỗi mount gọi API mới, không cache
❌ Stale Data: Không tự động background refresh
❌ Race Conditions: Không hủy request cũ khi params thay đổi nhanh
❌ No Optimistic Updates: Phải đợi API response mới update UI
❌ Manual State: Tự quản lý loading, error, data states
```

---

## Proposed Changes

### Phase 1: Foundation & Core Migration

#### 1.1 Dependencies

**[NEW]** Update `apps/web-core/package.json`

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.67.6",
    "@tanstack/react-query-devtools": "^5.67.6"
  }
}
```

#### 1.2 Query Client Setup

**[NEW]** `apps/web-core/src/config/queryClient.ts`

```typescript
// TanStack Query client configuration
// - Default stale time: 30 seconds
// - Retry: 1 time on error
// - GC time: 5 minutes
// - Refetch on window focus: true
```

#### 1.3 Provider Integration

**[MODIFY]** `apps/web-core/src/main.tsx`

- Wrap app with `QueryClientProvider`
- Add `ReactQueryDevtools` (development only)

---

### Phase 2: Core Hooks Migration

#### 2.1 Query Keys Factory

**[NEW]** `apps/web-core/src/hooks/queryKeys.ts`

```typescript
// Centralized query key factory
// - resources.list(params)
// - resources.detail(id)
// - resources.export(params)
```

#### 2.2 New useResourceQuery Hook

**[NEW]** `apps/web-core/src/hooks/useResourceQuery.ts`

```typescript
// TanStack Query wrapper that maintains useResource interface
// - Uses useQuery for list data
// - Uses useMutation for CRUD operations
// - Maintains backward-compatible return type
// - Adds optimistic update support
```

#### 2.3 Update useResource (Bridge Pattern)

**[MODIFY]** `apps/web-core/src/hooks/useResource.ts`

- Option A: Refactor internal to use TanStack Query (keep exports)
- Option B: Create useResourceQuery, alias useResource to it

**Recommendation**: Option A để không ảnh hưởng consumers

---

### Phase 3: Feature-Specific Optimizations

#### 3.1 Categories Hook (SSoT)

**[MODIFY]** `apps/web-core/src/hooks/useCategories.ts`

- Add `useCategoryQuery(id)` for single category fetch
- Add `useCategoriesQuery(params)` for list with caching
- Implement optimistic updates for create/update/delete

#### 3.2 Users Hook

**[MODIFY]** `apps/web-core/src/hooks/useUsers.ts`

- Same pattern as Categories
- Add user-specific mutations

#### 3.3 Roles Hook

**[MODIFY]** (nếu tồn tại) hoặc create `apps/web-core/src/hooks/useRoles.ts`

---

### Phase 4: Advanced Features

#### 4.1 Prefetching

**[NEW]** `apps/web-core/src/hooks/usePrefetch.ts`

```typescript
// Prefetch utilities
// - prefetchOnHover for table rows
// - prefetchNextPage for pagination
```

#### 4.2 Infinite Query Support

**[NEW]** `apps/web-core/src/hooks/useInfiniteResource.ts`

```typescript
// For infinite scroll lists (Activity Logs)
// - useInfiniteQuery integration
```

---

## File Changes Summary

### New Files (8)

| Path | Purpose |
|------|---------|
| `apps/web-core/src/config/queryClient.ts` | Query client configuration |
| `apps/web-core/src/hooks/queryKeys.ts` | Query key factory |
| `apps/web-core/src/hooks/useResourceQuery.ts` | TanStack Query wrapper |
| `apps/web-core/src/hooks/usePrefetch.ts` | Prefetching utilities |
| `apps/web-core/src/hooks/useInfiniteResource.ts` | Infinite query support |
| `apps/web-core/src/hooks/__tests__/useResourceQuery.test.ts` | Unit tests |
| `apps/web-core/src/types/query.types.ts` | Query-related types |

### Modified Files (6)

| Path | Changes |
|------|---------|
| `apps/web-core/package.json` | Add TanStack Query dependencies |
| `apps/web-core/src/main.tsx` | Add QueryClientProvider |
| `apps/web-core/src/hooks/useResource.ts` | Refactor to use TanStack Query |
| `apps/web-core/src/hooks/useCategories.ts` | Add optimistic updates |
| `apps/web-core/src/hooks/useUsers.ts` | Add optimistic updates |
| `apps/web-core/src/hooks/index.ts` | Export new hooks |

---

## Migration Strategy

### Approach: Incremental Migration (Recommended)

```
Week 1: Foundation
├── Install dependencies
├── Setup QueryClient
├── Create query key factory
└── Create useResourceQuery (parallel to useResource)

Week 2: Core Migration
├── Migrate CategoriesPage (SSoT first)
├── Test thoroughly
└── Document patterns

Week 3: Rollout
├── Migrate UsersPage
├── Migrate RolesPage
└── Deprecate old useResource

Week 4: Optimization
├── Add prefetching
├── Add optimistic updates
└── Add DevTools configuration
```

### Rollback Plan

Nếu issues phát sinh:
1. `useResource` vẫn được giữ nguyên ban đầu
2. Các page có thể switch lại bất cứ lúc nào
3. Feature flag có thể control migration

---

## Configuration Decisions

### Query Client Defaults

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      gcTime: 5 * 60 * 1000, // 5 minutes (garbage collection)
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

### Query Key Structure

```typescript
// Hierarchical key structure for effective invalidation
export const queryKeys = {
  categories: {
    all: ['categories'] as const,
    lists: () => [...queryKeys.categories.all, 'list'] as const,
    list: (params: CategoryListParams) => [...queryKeys.categories.lists(), params] as const,
    details: () => [...queryKeys.categories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.categories.details(), id] as const,
  },
  // ... other resources
};
```

---

## Verification Plan

### 1. UI/UX Consistency

- [ ] CategoriesPage hoạt động giống hệt như trước
- [ ] Loading states hiển thị đúng
- [ ] Error handling hoạt động
- [ ] Pagination không bị đứt

### 2. Performance Testing

- [ ] Kiểm tra request deduplication (network tab)
- [ ] Kiểm tra cache hit ratio
- [ ] So sánh response time trước/sau

### 3. Regression Testing

- [ ] CRUD operations hoạt động
- [ ] Batch operations hoạt động
- [ ] Export hoạt động
- [ ] Permission guards hoạt động

### 4. DevTools Verification

- [ ] React Query DevTools hiển thị đúng
- [ ] Query states có thể debug
- [ ] Cache có thể inspect

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking existing pages | High | Keep useResource interface identical |
| Learning curve | Medium | Comprehensive documentation |
| Bundle size increase | Low | ~13KB gzipped, acceptable trade-off |
| Background refetch spam | Low | Configure staleTime appropriately |

---

## Questions for User

1. **Scope Confirmation**: Phase 1 chỉ focus vào `useResource` migration, có đúng không?

2. **Stale Time**: 30 giây cho list data có phù hợp với use case không?

3. **DevTools**: Có muốn DevTools mặc định bật trong development?

4. **Optimistic Updates**: Có muốn implement ngay trong Phase 1 hay để Phase 2?

5. **Timeline**: Ước tính cần bao lâu để hoàn thành Phase 1?

---

## Next Steps

Sau khi Plan được approve:

1. ~~Chạy `/3-dev-feature` để bắt đầu implement Phase 1~~
2. ~~Install dependencies~~
3. ~~Setup QueryClient~~
4. ~~Create useResourceQuery hook~~
5. ~~Test với CategoriesPage~~
6. Migrate các page còn lại (Users, Roles)

---

## ✅ Phase 1 Completed - 2026-01-16 23:35

### Files Changed:
| File | Action |
|------|--------|
| `apps/web-core/package.json` | Added `@tanstack/react-query@^5`, `@tanstack/react-query-devtools@^5` |
| `apps/web-core/src/config/queryClient.ts` | NEW - Query client + query keys factory |
| `apps/web-core/src/config/index.ts` | Export queryClient, queryKeys |
| `apps/web-core/src/AppProviders.tsx` | Added QueryClientProvider + DevTools |
| `apps/web-core/src/hooks/useResource.ts` | Refactored to use TanStack Query |

### Verification Results:
- ✅ CategoriesPage loads correctly with 5 items
- ✅ React Query DevTools visible and working
- ✅ Query key in cache: `["categories", "list", {...}]`
- ✅ No TypeScript errors
- ✅ No console errors
- ✅ Interface unchanged - backward compatible

### Ready for Phase 2:
- [ ] Test Users page
- [ ] Test Roles page
- [ ] Test CRUD operations
- [ ] Add optimistic updates (optional)
