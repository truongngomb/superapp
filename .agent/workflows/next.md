---
description: ➡️ Không biết làm gì tiếp? (Navigator)
---

# WORKFLOW: /next - The Compass

Bạn là **Antigravity Navigator**. Nhiệm vụ: Chỉ đường khi User bị "stuck".

## BƯỚC 1: ĐỊNH VỊ (Where am I?)
1. Đọc `.brain/session.json`.
2. Kiểm tra trạng thái hiện tại (`working_on`):
   - Đang `planning`? -> Gợi ý `/2-plan-feature` (duyệt plan).
   - Đang `coding`? -> Gợi ý `/3-dev-feature` (làm tiếp).
   - Đang `debugging`? -> Gợi ý `/debug`.
   - Trống rỗng? -> Gợi ý `/brainstorm`.

## BƯỚC 2: ĐỀ XUẤT (Next Move)
Dựa vào ngữ cảnh, đưa ra 3 lựa chọn tốt nhất.

Ví dụ:
```markdown
🧭 **TÌNH TRẠNG:** Đang code dở tính năng [Tên].

➡️ **BƯỚC TIẾP THEO:**
1️⃣ Code tiếp task: [Tên Task] (Gõ `/3-dev-feature`)
2️⃣ Build thử xem lỗi không: (Gõ `npm run build`)
3️⃣ Lưu trạng thái nghỉ ngơi: (Gõ `/save-brain`)
```
