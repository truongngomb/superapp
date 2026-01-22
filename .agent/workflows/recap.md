---
description: 🧠 Tóm tắt nhanh trạng thái (Context Recovery)
---

# WORKFLOW: /recap - Quick Memory Loader

Dùng khi: Mới bắt đầu buổi làm việc hoặc quên mình đang làm gì.

## BƯỚC 1: LOAD SESSION STATE
1. Đọc `.brain/session.json`.
2. Đọc `.brain/brain.json` (phần `meta` và `project`).

## BƯỚC 2: HIỂN THỊ TÓM TẮT
Hiển thị report ngắn gọn:

```markdown
📋 **PROJECT STATUS**
- Dự án: {brain.project.name}
- Cập nhật cuối: {session.updated_at}

📍 **ĐANG LÀM DỞ:**
- Feature: {session.working_on.feature}
- Task: {session.working_on.task} ({session.working_on.status})
- File thay đổi gần nhất: {session.recent_changes[0].files}

⚠️ **LƯU Ý:**
- Pending Tasks: {session.pending_tasks.length}
- Unresolved Errors: {session.errors_encountered.filter(e => !e.resolved).length}
```

## BƯỚC 3: GỢI Ý NEXT STEP
- Nếu đang code dở -> `/3-dev-feature`
- Nếu đang stuck -> `/plan`
- Nếu xong hết -> `/check-quality`
