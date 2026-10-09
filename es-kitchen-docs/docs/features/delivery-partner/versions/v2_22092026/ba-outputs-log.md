# BA Outputs Log — delivery-partner · v2 (22/09/2026)

> Nguồn: Figma `ES-Kitchen-phase-2` canvas `Delivery (P2)` node `26173:304942`.
> Phạm vi lần này theo yêu cầu user: **chỉ SPEC.md + Output 1 + Output 2**, bám 100% Figma sẵn có, không tự thêm.

## Trạng thái 5 outputs

| # | Output | Status | Path / URL |
|---|---|---|---|
| 0 | SPEC.md | ✅ Done | `../../SPEC.md` — 15 sections · 19 màn chính · 85 màn tổng · 55 AC · 28 RQ · 18 OQ |
| 1 | Figma — Flow Tổng Quan | ✅ Done | node `32079-49624`, page `Feature - Flow` |
| 2 | Figma — Screen Flow | ✅ Done | node `32087-49623`, page `Feature - Flow` |
| 3 | Figma — Screens + Items | ❌ Skipped | User quyết định không cần |
| 4 | HTML Prototype | ❌ Skipped | User quyết định không cần |

## Diff so với v1 (21/09/2026)

| # | Thay đổi | Lý do |
|---|---|---|
| 1 | `## Flow Tổng Quan`: tách Flow 8 cũ → **Flow 8 (配送スタッフ)** + **Flow 9 (プロフィール)** | Bám đúng 9 `Flow note` divider trong canvas Figma; đồng bộ N = 9 giữa SPEC và Output 1 |
| 2 | `## BA Deliverables`: Output 1 + 2 chuyển ✅ Done kèm node URL; Output 3 + 4 ghi ❌ Skipped kèm lý do | Hoàn thành 2 output Figma theo yêu cầu |
| 3 | OQ-12 bổ sung phát hiện mới: 14 dòng `Full screen` (phiên hết hạn) **chưa có Screen Code riêng** | Phát hiện khi chạy cross-check Output 2; BA KHÔNG tự thêm mã vì Figma nguồn không có frame |
| — | Toàn bộ `## Screen Details`, AC, Source Register, Open Questions **giữ nguyên** | Scoped update theo POLICIES §4.6 |

## Output 1 — Flow Tổng Quan (node 32079-49624)

- **Phần A** — 9 business flow, mỗi flow 5 cột ACTOR → TRIGGER → FUNCTION → TECHNOLOGY → OUTCOME, kèm box NG (đỏ nét đứt, message thật từ Figma) và box EDGE/CONFLICT (tím nét đứt, trỏ về OQ).
- **Phần B** — Technology Stack 12 dòng. **Ghi rõ trong frame:** bảng này KHÔNG có trong Figma, lấy từ `AGENTS.md` + `stack-constraints.md`.
- **Phần C** — Sitemap WBS: Root + 4 actor (Khách vãng lai · Outsource Admin · System Admin E03 · Hệ thống) + **22 hành động** ≥ 9 flow candidate (thoả rule «gộp = đổi tầng»).
- Quality Gate: overlap 0 · text overflow 0 · gap giữa các flow band min **106px** (≥100px).

## Output 2 — Screen Flow (node 32087-49623)

- **7 Group** = 7 cụm màn hình độc lập (G1 là Shared Cluster phục vụ 3 flow Auth). Badge số liên tục **1–18**.
- **13 NG node** inline (chỉ lỗi FACT có message thật trong Figma) + **25 box EDGE/EXCEPTIONAL** (UNKNOWN/INFERENCE/CONFLICT, KHÔNG vẽ inline).
- **Combined Overview** đủ 4 tầng: ① Spine 7 Group → ② Decision → ③ NG → ④ Thống kê.
- **4 bảng cột phải:** ④ Screen Index (19 dòng) · ⑥ Terminal Nodes (19 dòng) · ⑤ Exception Matrix (25 dòng) · ⑦ Error/Popup Index (**147 dòng = 100%**, không rút gọn).
- Quality Gate: overlap 0 · text overflow 0 · gap giữa Group min **154px** (≥150px).

## Cross-verification

| Phép kiểm | Kết quả |
|---|---|
| N flow SPEC = N flow Output 1 | 9 = 9 ✅ |
| Group Output 2 = số cụm màn hình độc lập | 7 ✅ (9 flow, G1 gộp 3 flow Auth) |
| Badge screen node Output 2 = số màn có frame Figma | 18 = 18 ✅ (OW_AUTH_005 không có frame → không vẽ node) |
| Dòng bảng ⑦ = error display trong SPEC | 147 = 147 ✅ (125 định nghĩa + 22 UNKNOWN) |
| Thống kê Figma = thống kê SPEC `## Screens` | 19 + 66 = 85 ✅ |
| Mục Hành động Sitemap ≥ flow candidate | 22 ≥ 9 ✅ |

## Điểm KHÔNG đạt rule (báo cáo trung thực, không che giấu)

1. **`số NG node ≥ số Non-Happy Case trong SPEC`** — không thoả theo nghĩa đen: 13 NG node inline vs 125 error display định nghĩa. Vẽ 125 NG node sẽ phá vỡ sơ đồ. Đã dùng đúng cơ chế mà chính kit quy định cho việc này: **bảng ⑦ liệt kê 100% (147/147)**, NG inline chỉ giữ lỗi đại diện có message thật + ghi «+N lỗi → bảng ⑦».
2. **`số Screen Code màn lỗi = số dòng cần Screen Code riêng`** — không thoả: 14 dòng `Full screen` (phiên hết hạn) chưa có Screen Code. Nguyên nhân: **Figma nguồn không có frame màn hết phiên**. Theo yêu cầu «bám 100% Figma, không tự thêm», BA không tự tạo mã → đã ghi vào **OQ-12**.

## Feedback

_(chưa có — user điền vào đây)_
