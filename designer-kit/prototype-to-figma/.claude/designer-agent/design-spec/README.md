# Design Spec — ES Kitchen (LEARNING cho Designer Agent)

> **Mục đích:** Bộ đặc tả giao diện thực tế (style · font · size · layout · component · pattern từng trang) của ES Kitchen Phase 2.
> Designer Agent **BẮT BUỘC đọc (LEARNING) trước khi vẽ** — xem workflow ở `.claude/agents/designer-agent.md` → Bước 0.
> **Phân tích ngày:** 2026-09-29 · **Người phân tích:** Designer Agent (Claude) · **Trạng thái:** v1

---

## 1. Nguồn đã phân tích

| # | Nguồn | Link / node | Vai trò |
|---|---|---|---|
| 1 | Design System artifact (Phase 1 + Sparkle Design) | https://claude.ai/artifact/ModdSpJmnWd9yA4onTCtpp | Quy tắc component, CRUD pattern, giọng văn, token nền |
| 2 | Admin Web (E03) | [20526-111624](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=20526-111624) | MAINTAIN MANAGEMENT section |
| 3 | Company Web (E02) | [27216-392900](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27216-392900) | 月次注文 / 商品注文 section |
| 4 | Supplier Web (E04) | [19558-178039](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=19558-178039) | SW_HOME_006 出荷処理 |
| 5 | Công ty vận chuyển Web (E05, tên cũ Logistic) | [31498-191879](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31498-191879) | OW_SCHED_001 配送管理 |
| 6 | User Mobile App (E01) | [29112-212045](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=29112-212045) | Cart / Scan / Payment confirm |
| 7 | WebApp ES_QR | [31896-133017](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=31896-133017) | Home / Product / Cart / Scan (update 11/09) |
| 8 | WebApp Driver (E06) | [33034-353615](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=33034-353615) | DA_HOME / DA_COOL / DA_RECV (COOL便 V1.0) |

Figma file key: `VKAAOyoSPvgoB3H2qdeeV3` (ES-Kitchen-phase-2) · Library: **ES Kitchen** (Sparkle Design base) — component keys ở `.claude/context/designer-context.md` §11.

## 2. Thứ tự ưu tiên nguồn (khi mâu thuẫn)

1. **Figma Phase 2 thực tế** (nguồn 2–8) — giá trị màu/size đã đo trực tiếp → **nguồn sự thật**.
2. **Design System artifact** (nguồn 1) — dùng cho *quy tắc* (CRUD pattern, component nào dùng khi nào, giọng văn), KHÔNG dùng giá trị màu primary của nó (artifact lấy từ Phase 1, đã lệch — xem `00-foundation.md` §9).
3. `.claude/context/designer-context.md` — component keys, clone pattern, code stack.

## 3. Cấu trúc bộ spec

```
design-spec/
├── README.md                    ← file này (index + cách LEARNING)
├── 00-foundation.md             ← BẮT BUỘC mọi platform: token, font, size, spacing, radius, shadow, icon, giọng văn, bẫy đặt tên
├── 10-desktop-web-shell.md      ← BẮT BUỘC cho mọi Website desktop: shell 1440, sider, header, table, search panel, modal, CRUD
├── 11-web-admin.md              ← E03 System Admin (blue)
├── 12-web-company.md            ← E02 Company Admin (orange)
├── 13-web-supplier.md           ← E04 Supplier (purple)
├── 14-web-logistic.md           ← Công ty vận chuyển E05 / 委託配送会社 (green)
├── 20-mobile-app-user.md        ← E01 User Mobile App (Flutter, yellow)
├── 21-webapp-esqr.md            ← ES_QR WebApp — MỚI Phase 2 (yellow, mobile web)
├── 22-webapp-driver.md          ← E06 Driver WebApp (blue + COOL purple)
├── tokens.json                  ← token máy đọc được, theo platform
└── refs/*.png                   ← screenshot tham chiếu (Read để xem trực quan)
```

## 4. Platform → file cần LEARNING (sau khi hỏi user bằng AskUserQuestion)

| Platform user chọn | Đọc bắt buộc | Screenshot ref | Viewport |
|---|---|---|---|
| Admin Web (E03) | 00 + 10 + 11 | `refs/admin_list_AW_MAINTAIN_001.png`, `refs/admin_modal_AW_MAINTAIN_003.png` | 1440 × 1024 |
| Company Web (E02) | 00 + 10 + 12 | `refs/company_list_CW_ORDER_003.png` | 1440 × 1024 |
| Supplier Web (E04) | 00 + 10 + 13 | `refs/supplier_detail_SW_HOME_006.png` | 1440 × 1024 |
| Công ty vận chuyển Web (E05) | 00 + 10 + 14 | `refs/logistic_list_OW_SCHED_001.png` | 1440 × 1024 |
| User Mobile App (E01) | 00 + 20 | `refs/mobile_cart.png`, `refs/mobile_flow_overview.png` | 390 × 844 |
| WebApp ES_QR | 00 + 21 | `refs/esqr_home.png` | 390 × 844 |
| WebApp Driver (E06) | 00 + 22 | `refs/driver_home_DA_HOME_001.png`, `refs/driver_cool_DA_COOL_001.png` | 390 × 844 |

Nhiều platform → đọc hợp các file. `tokens.json` → lấy block theme tương ứng.

## 5. Cách LEARNING (checklist ngắn)

1. Read `00-foundation.md` toàn bộ (≈ 5 phút) — đặc biệt §8 "Bẫy đặt tên" và §9 "Mâu thuẫn".
2. Hỏi platform bằng **AskUserQuestion** (template ở `.claude/agents/designer-agent.md` Bước 0.2).
3. Read các file platform tương ứng + Read ảnh `refs/` của platform đó.
4. Tóm tắt lại cho chính mình 5 dòng: primary color, viewport, shell, component chính, pattern đặc thù → rồi mới vẽ.
5. Sau khi vẽ: đối chiếu checklist "Definition of Done" cuối mỗi file platform.

## 6. Cập nhật spec

- Khi Figma Phase 2 thay đổi (màu, component mới) → Designer Agent cập nhật file tương ứng + ghi dòng vào §7 changelog, và update memory `.claude/memory/project_designer_design_system.md`.
- Không xoá mục "Mâu thuẫn" cho đến khi user/Design Lead confirm.

## 7. Changelog

| Ngày | Thay đổi |
|---|---|
| 2026-09-29 | v1 — phân tích 8 nguồn, tạo foundation + 7 platform spec + tokens.json + refs |
| 2026-09-29 | v1.2 — thêm ngoại lệ bẫy đặt tên: `Tabs` Color=Company = cam (Admin dùng Color=Default), local `Search Buttons` = cam (foundation §8). Phát hiện khi vẽ AI_Generate_Hoá Đơn |
| 2026-09-29 | v1.1 — user confirm: Logistic = E05 (đổi tên Công ty vận chuyển Web) · ES_QR = WebApp mới · badge solid/soft **dùng chung** mọi platform (C3, C6, C8 resolved) |
| 2026-09-30 | v1.3 — thêm Bước 0.0 kiểm tra đầu vào design system (AskUserQuestion khi thiếu) · Bước 0.2b hỏi ngôn ngữ group/section/screen name · foundation §12 naming đa ngôn ngữ xuống dòng (đề xuất vi-ja-en) |
| 2026-09-30 | v1.4 — thêm Bước 0.I: AskUserQuestion hỏi input (prototype HTML · tài liệu khác · Figma output · tên output tự đặt / agent đề xuất) |
