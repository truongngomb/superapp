---
description: 💾 Lưu nhanh trạng thái (Emergency Save)
---

# WORKFLOW: /save-brain - Quick Memory Dump

Dùng khi: Cần lưu gấp trạng thái hiện tại (đi họp, hết giờ) mà chưa xong task.

## BƯỚC 1: SCAN CHANGE
1. Chạy `git status` lấy list file đang thay đổi.
2. Hỏi User: "Anh đang làm dở việc gì? (Tóm tắt 1 câu)"

## BƯỚC 2: UPDATE SESSION
Cập nhật `.brain/session.json`:
- `updated_at`: Now ISO String
- `working_on`:
    - `status`: "paused"
    - `files`: [List file từ git status]
    - `notes`: [Câu trả lời của user]

## BƯỚC 3: CONFIRM
Báo cáo: "Đã lưu trạng thái. Tắt máy yên tâm! Mai chạy `/recap` là có lại."
