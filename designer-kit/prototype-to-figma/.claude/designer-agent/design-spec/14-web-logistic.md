# 14 — Công ty vận chuyển Web (E05 · 委託配送会社Web · trước đây: Logistic / Outsource Web) — GREEN

> Repo: **`es-kitchen-web-outsource-web-private` (E05)** — ✅ user confirm 2026-09-29: E05 đã đổi tên thành **Công ty vận chuyển Web**. Màu code cũ lime `#8ACA0D` → thiết kế mới dùng green `#1A7F37` (foundation C3).
> Ref: `refs/logistic_list_OW_SCHED_001.png` · Figma: `OW_SCHED_001` `31498:191879` (1440×990).
> Kế thừa toàn bộ `10-desktop-web-shell.md`.

## 1. Theme

| Vai trò | Hex | Variable |
|---|---|---|
| primary (nav active, 検索, radio) | `#1A7F37` | `success/500` → **override fill** |
| hover | `#116329` | |
| subtle | `#EDFDF0` | `success/50` |
| outline (クリア) | viền + chữ `#1A7F37` | |
| link 配送No | `#0969DA` | `info/500` |

Primary trùng hệ màu success → badge thành công **luôn có chữ** (出荷済, 配送完了), không dùng primary để báo trạng thái.

## 2. Sider menu (thực tế)

ホーム · スケジュール · **配送管理** (active) · 見積もり管理 · 集金・駐車 · 配送スタッフ · プロフィール. Header phải: tên công ty 「株式会社Logictics」.

## 3. Pattern trang đặc thù — 配送管理 (OW_SCHED_001)

- Search panel 1 dòng (cao 60): collapse btn · date 「2026-08-18」 ~ 「2026-08-31」 (icon lịch) · radio 「● 配送日（着）」 · phải クリア (outline green 97×44) + 検索 (solid green 97×44).
- Bảng (row 54): No · 配送日（着） · **荷物温度帯** (TempTag) · 配送No (link blue `D000000005`) · 荷受け住所 · 届け先拠点名 · 届け先住所 · 配送スタッフID (`DR00001`) · 配送スタッフ名 · 送り状No (nhiều số → 「、」 + ellipsis) · **配送状況** (status solid) · 配送区分 (ES配送 / COOL便).
- **TempTag**: 冷凍 (nền `#0969DA`, chữ trắng, icon ❄) · 冷蔵・常温 (nền `#97D3FF`, chữ `#0969DA`, icon tủ lạnh) · 資材 (nền `#FDDA8A`, chữ `#91320F`, icon hộp).
- **配送状況 solid badge** (70×20, radius 4, chữ trắng 12 bold): 出荷準備 `#EAB308` · 出荷済 `#1A7F37` · 荷受済 (nền `#E5F6FF` chữ `#0969DA`) · トラブル `#CF222E` · 配送完了 `#0969DA`.
- Pagination active: blue (mặc định library) — nếu muốn thống nhất theme thì override green; ghi Open Question.

## 4. Theo artifact — màn 配送管理 dùng chung component
SegmentedControl (月/週/日) · StageIndicator · TempTag · CalendarGrid/CalendarCell (out/pause/holiday/first/draft/over) · MonthTabs · SlotChip A1〜D7 · SelectionBar · Dialog+DialogSection · EmptyState/Skeleton · CheckList · Timeline · FileCard · NoticeList (trang chủ).
Màu số lịch: 出荷 `#B3410A` · 納品 `success-700` · vượt ngưỡng `negative-600` (+ badge 「上限超過」, ngưỡng ピッキング 300件/日) · dự kiến `text/middle`.

## 5. Definition of Done riêng Công ty vận chuyển (E05)
- [ ] Primary `#1A7F37`, link blue.
- [ ] TempTag đúng 3 loại; status solid đúng màu.
- [ ] Frame đặt prefix `OW_`, repo E05 ghi trong handover.
