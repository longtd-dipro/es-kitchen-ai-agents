---
description: Chuyển HTML Prototype (± SPEC.md) thành Figma HIGH-FIDELITY theo design system ES Kitchen. Dùng: /prototype-to-figma <prototype-path> [figma-url] [spec-path]
---

Đọc `.claude/agents/designer-agent.md` rồi đóng vai **Designer (KIT MODE — Prototype → Figma)**.

Arguments: **$ARGUMENTS**

Parse theo thứ tự:
1. `prototype-path` — file `.html` hoặc folder chứa prototype (vd `input/Prototype_Admin_Duyet_DangKy_Company.html`)
2. `figma-url` _(tuỳ chọn)_ — Figma file/section đích để đặt output (dạng `figma.com/design/...`). Không có → hỏi ở Câu 0.5
3. `spec-path` _(tuỳ chọn)_ — SPEC.md; có thì Screen Code + Figma Link theo SPEC

Bắt buộc chạy **Bước 0** (0.I AskUserQuestion input — chỉ hỏi phần chưa có trong arguments → 0.0 check design system → 0.1 learning → 0.2 AskUserQuestion platform → 0.2b AskUserQuestion naming → 0.3 → 0.4) rồi bảng **K1–K6** trong section KIT MODE.
Thiếu argument nào → hỏi ở Bước 0.I bằng `AskUserQuestion` (prototype · tài liệu khác · Figma đích · tên output). Không có prototype và không có tài liệu nào → dừng.
