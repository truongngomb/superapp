---
description: UPDATE RULES & DOCUMENTATION
---

=== WORKFLOW — UPDATE DOCS ===

## MỤC TIÊU
Cập nhật tài liệu, rules và workflows để phản ánh các thay đổi mới trong dự án.
Đảm bảo **Single Source of Truth** luôn chính xác và đồng bộ.

## KHI NÀO CẦN CHẠY
- Sau khi thêm patterns/conventions mới
- Sau khi thay đổi kiến trúc hoặc cấu trúc thư mục
- Sau khi thêm hooks, components, hoặc utilities mới có thể tái sử dụng
- Sau khi thay đổi quy trình làm việc (workflow)
- Khi có feedback từ review hoặc lessons learned

---

## BƯỚC 1: XÁC ĐỊNH PHẠM VI THAY ĐỔI

### 1.1. Phân loại thay đổi
Xác định loại thay đổi đã thực hiện:

| Loại | Ví dụ | Tài liệu cần cập nhật |
|------|-------|----------------------|
| **Architecture** | Thêm layer mới, thay đổi data flow | `architecture.md` |
| **Component Pattern** | Thêm loại component mới, naming conventions | `component-patterns.md` |
| **Hook/Utility** | Thêm hook tái sử dụng mới | `architecture.md`, `component-patterns.md` |
| **Workflow** | Thay đổi quy trình development | Workflows trong `.agent/workflows/` |
| **i18n** | Thêm keys mới cần thiết | `4-check-quality.md` |
| **Config** | Thêm config keys mới | `architecture.md` |

### 1.2. Liệt kê các thay đổi cụ thể
Trước khi cập nhật, liệt kê rõ:
- [ ] Tên pattern/component/hook mới
- [ ] Mục đích và use case
- [ ] Files liên quan
- [ ] Dependencies (nếu có)

---

## BƯỚC 2: CẬP NHẬT TÀI LIỆU KIẾN TRÚC

### 2.1. `.agent/docs/architecture.md`

**Khi nào cập nhật:**
- Thêm layer hoặc module mới vào hệ thống
- Thêm package mới vào shared packages
- Thay đổi feature pattern structure
- Thêm hooks hoặc utilities quan trọng

**Các sections cần xem xét:**
1. **Tech Stack** - Thêm technologies mới
2. **Frontend/Backend Architecture** - Cập nhật layer structure
3. **Feature Pattern (SSoT)** - Thêm file types mới
4. **Required Capabilities** - Thêm capabilities mới
5. **Shared Packages** - Cập nhật exports

**Format chuẩn cho hooks:**
```markdown
### {Category} Hooks

| Hook | Purpose |
|------|---------|
| `useNewHook` | Description of what it does |
```

---

## BƯỚC 3: CẬP NHẬT COMPONENT PATTERNS

### 3.1. `.agent/docs/component-patterns.md`

**Khi nào cập nhật:**
- Thêm loại component mới (e.g., MobileCard, Skeleton)
- Thay đổi naming conventions
- Thêm patterns mới cho forms, lists, etc.

**Các sections cần xem xét:**
1. **Naming Conventions** - Thêm pattern types mới
2. **{X} Component Pattern** - Thêm code examples mới

**Format chuẩn cho naming:**
```markdown
| Type | Pattern | Example |
|------|---------|---------|
| **New Component** | `{Feature}NewComponent.tsx` | `CategoryNewComponent.tsx` |
```

**Format chuẩn cho pattern:**
```markdown
## {Component Type} Pattern

```tsx
interface FeatureComponentProps {
  // Props definition
}

export function FeatureComponent({ ... }: FeatureComponentProps) {
  // Implementation example
}
```
```

---

## BƯỚC 4: CẬP NHẬT WORKFLOWS

### 4.1. Check Quality Workflow (`4-check-quality.md`)

**Khi nào cập nhật:**
- Thêm checklist items mới cần verify
- Thêm automated checks mới
- Thay đổi output format

**Các sections cần xem xét:**
1. **UI/UX & Performance Audit** - Thêm UI checks
2. **Code Structure** - Thêm structure checks
3. **Automated Checks** - Thêm commands mới
4. **Output Format** - Thêm status categories mới

### 4.2. Các workflows khác

Xem xét cập nhật các workflows liên quan:
- `dev-feature.md` - Nếu thay đổi quy trình phát triển
- `plan-feature.md` - Nếu thay đổi planning process
- Tạo workflow mới nếu cần

---

## BƯỚC 5: VALIDATION

### 5.1. Kiểm tra tính nhất quán

- [ ] Terminology nhất quán giữa các tài liệu
- [ ] Không có thông tin mâu thuẫn
- [ ] Examples phản ánh đúng codebase hiện tại
- [ ] Links và references vẫn valid

### 5.2. Kiểm tra completeness

- [ ] Tất cả patterns mới đã được document
- [ ] Tất cả hooks/utilities mới đã được liệt kê
- [ ] Tất cả checklist items đã được thêm vào quality check

---

## OUTPUT FORMAT

Trả về báo cáo theo cấu trúc:

### 📝 TÀI LIỆU ĐÃ CẬP NHẬT

| File | Thay đổi | Mô tả |
|------|----------|-------|
| `architecture.md` | ✅ / ❌ | Chi tiết thay đổi |
| `component-patterns.md` | ✅ / ❌ | Chi tiết thay đổi |
| `4-check-quality.md` | ✅ / ❌ | Chi tiết thay đổi |
| Workflows khác | ✅ / ❌ | Chi tiết thay đổi |

### 📋 PATTERNS MỚI

```
- Pattern 1: Mô tả ngắn
- Pattern 2: Mô tả ngắn
```

### ✅ VALIDATION

- Consistency: [PASS / ISSUES]
- Completeness: [PASS / ISSUES]

---

## BEST PRACTICES

1. **Keep it DRY** - Không lặp lại thông tin giữa các tài liệu
2. **Use examples** - Luôn kèm code examples khi document patterns
3. **Be specific** - Ghi rõ file paths, hook names, component names
4. **Update incrementally** - Cập nhật ngay sau mỗi thay đổi, không để tích lũy
5. **Cross-reference** - Liên kết giữa các tài liệu khi cần thiết
