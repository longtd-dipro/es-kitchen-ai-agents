---
name: project-designer-design-system
description: Designer Agent memory — ES Kitchen Phase 2 design spec location, platform colors đã đo, bẫy đặt tên theme Figma, mâu thuẫn chưa confirm
metadata:
  type: project
---

Bộ đặc tả giao diện ES Kitchen Phase 2 nằm ở `.claude/designer-agent/design-spec/` (README + 00-foundation + 10..14 web + 20..22 mobile + tokens.json + refs/*.png). Phân tích ngày 2026-09-29 từ Figma `VKAAOyoSPvgoB3H2qdeeV3` (7 node thực tế) + Design System artifact `claude.ai/artifact/ModdSpJmnWd9yA4onTCtpp`.

**Why:** Designer Agent trước đây vẽ theo kit default / artifact Phase 1 → lệch màu primary và viewport so với Figma Phase 2 thật.

**How to apply:**
- Mỗi lần kích hoạt Designer Agent: LEARNING `design-spec/README.md` + `00-foundation.md` → hỏi platform bằng `AskUserQuestion` (Bước 0.2 trong `agents/designer-agent.md`) → đọc file spec platform + ảnh refs.
- Primary đã đo (nguồn sự thật = Figma Phase 2, KHÔNG phải artifact): Admin `#0969DA` · Company `#F4860C` · Supplier `#6639BA` · Công ty vận chuyển E05 (tên cũ Logistic) `#1A7F37` · Mobile/ES_QR gradient vàng `#FAC215→#FFC562` chữ tối · Driver `#0969DA` + COOL `#5A3AE9`.
- **Bẫy đặt tên:** library Figma `company/*` = BLUE (dùng cho Admin/Driver), `admin/*` = ORANGE (dùng cho Company), `app/*` = YELLOW. Button `theme=Company` → Admin portal; `theme=Admin` → Company portal.
- Viewport: desktop 1440 (sider 210 + container 1230, header 54, page header 94, table header 55/row 54); mobile & webapp **390×844** (đã sửa từ 375×812).
- Link trong bảng mọi portal = blue `#0969DA`. Font duy nhất Noto Sans JP; icon Phosphor Regular.
- User confirm 2026-09-29: Logistic Web = **E05** `es-kitchen-web-outsource-web-private`, đổi tên **Công ty vận chuyển Web**; ES_QR = **WebApp mới** (chưa có repo); badge solid + soft **dùng chung** mọi platform (solid = tiến trình, soft = bản ghi).
- Còn mở: C7 Driver Phosphor vs Lucide → ghi `[Design]` vào SPEC Open Questions khi gặp.

Liên quan: [[feedback-ba-agent-04092026]]
