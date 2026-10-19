# BA Outputs Log — delivery-partner · v3 (08/10/2026)

> Nguồn: Figma `ES-Kitchen-phase-2` — các Group `34325:xxxxx` (Login · Register · Reset PW · TOP · Schedule · Giao hàng · Thu tiền · Tài xế · Profile) trỏ tới đúng các frame `31498:xxxxx` mà v2 đã dùng.
> Phạm vi lần này theo yêu cầu user: danh sách màn hình + verify độ phủ + **Output 5 Basic Design**. Hướng đã chọn: **[A] cập nhật v3** — v2 là baseline AS-IS; chỉ cập nhật `## BA Deliverables` + snapshot.

## Discovery Brief (audit trail)

| # | Hạng mục | Giá trị |
|---|---|---|
| 0.4 | Scope | [C] Toàn hệ thống (Strict Mode) |
| 0 | Platform | Website 1440×1024 |
| 0.5 | Figma URL | page `Feature - Flow` (node 31403-200061) |
| 0.8 | Tech stack | [A] FACT theo AGENTS.md |
| 0.9 | Granularity | [B] Standard — 9 flow như v2 |
| 0.10 | Actors | Công ty vận chuyển (PRIMARY) · Tài xế · ES Kitchen/System Admin · System: Email, CSV |
| 0.11 | Ngôn ngữ / Audience | VN (tên màn giữ JP) · PM nội bộ (mặc định) |
| 0.12 | PII nguồn | [A] dữ liệu mẫu/mockup của Designer |

## Trạng thái outputs

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | SPEC.md | ✅ v2 giữ nguyên nội dung | `../../SPEC.md` | v3 chỉ thêm section Basic Design vào `## BA Deliverables` |
| 1 | Figma Flow Tổng Quan | ✅ v2 (không vẽ lại) | node `32079-49624` — page `Feature - Flow` (31403-200061) | Nội dung Figma mới = v2 (cùng frame ID) → không có delta |
| 2 | Figma Screen Flow | ✅ v2 (không vẽ lại) | node `32087-49623` — cùng page | Đã kiểm: 19/19 Screen Code có trong O1 và O2 |
| 3 | Figma Screens + Items | ❌ Skipped | — | v2: Figma khách đã có |
| 4 | HTML Prototype | ❌ Skipped | — | v2: user không cần |
| 5 | Basic Design | ✅ Gate PASS — WAITING FOR BRSE APPROVAL | `basic_design.xlsx` (cùng thư mục) · `basic-design-gate.md` | 19 sheet · 306 item · 138 error |
| — | Danh sách màn hình | ✅ | `REQ/REQ_Công ty vận chuyển/Danh sách màn hình công ty vận chuyển_vi.xlsx` | 37 dòng → 19 Screen Code |

## Diff so với v2

| # | Thay đổi | Lý do |
|---|---|---|
| 1 | `## BA Deliverables`: thêm section **Basic Design (Output 5)** | Yêu cầu user 08/10/2026 |
| — | Toàn bộ Screen Details / AC / Source Register / Open Questions **giữ nguyên** | Scoped update (POLICIES §4.6) |

## Điểm cần người xác nhận (không tự quyết)

1. **Output 1/2 "mới" tại node 31403-200061**: page này đã chứa sẵn O1/O2 v2 → không nhân bản. Cần user xác nhận v2 đủ dùng hoặc chỉ ra chỗ khác.
2. **Viết tắt màn trong Message Code** (`E_AUTH001_001`…): suy cơ học, chờ BrSE.
3. Nhiều message JP là bản dịch nháp của BA (OQ-15) · 22 mục UNKNOWN giữ ở Open Questions.
4. `OW_AUTH_005` chưa có frame Figma (OQ-07) → sheet NO IMAGE, nội dung suy luận.
5. `self-test` gate (`selftest-basic-design.py`) chưa chạy.

## Feedback

_(chưa có — user điền vào đây)_

## 09/10/2026 — Cập nhật scoped sau QC automation DEV (Basic Design + Testcase)
- Basic Design (9 file): điền trường URL của 12 màn từ `UNKNOWN` sang URL đã xác nhận qua chạy QC automation trên DEV (`/login`, `/forgot-password` → `/verify`, `/register`, `/dashboard`, `/announcements/{id}`, `/schedule`, `/schedule?view=week&date=…`, `/delivery-status`, `/collection-reports`, `/driver`, `/profile`, `/profile?tab=delivery`). Các màn chưa có bằng chứng (OW_AUTH_004/005, OW_DLVR_002/003, OW_STAF_003/004/005) giữ `UNKNOWN`. Gate O5: 0 FAIL. Trạng thái các file: WAITING APPROVAL.
- Testcase: sửa 2 dòng Not Covered (Login, Reset PW) liên quan URL. Không đổi Expected/Steps của TC.
- KHÔNG sửa theo app: message validation, nhãn nút 新規契約, validate client, tự điền カナ/địa chỉ, kiểu field 都道府県 — các điểm này lấy từ bảng Figma, chờ BrSE/Dev quyết bên nào đúng.
