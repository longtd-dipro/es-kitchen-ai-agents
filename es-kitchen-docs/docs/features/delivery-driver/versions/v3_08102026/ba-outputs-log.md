# BA Outputs Log — v3 (08102026)

> Snapshot output BA cho feature `delivery-driver` lần chạy v3 (scoped update từ v2 canonical đã có `Decisions` BrSE 22/09/2026). Feedback của user cho version này ghi vào section "Feedback" cuối file.

## Discovery Brief (audit trail)

| # | Hạng mục | Giá trị | Nguồn |
|---|---|---|---|
| 1.5 | Hướng làm | [A] Scoped update v2 → v3 | user |
| 0.4 | Scope | [B] cụm chức năng → Strict Mode | user (chọn "[B] Strict, chỉ SPEC") |
| 0 | Platform | Mobile Web 390×844 (E06) | Figma + specification.md |
| 0.5 | Figma | `ES-Kitchen-phase-2` (VKAAOyoSPvgoB3H2qdeeV3), 9 node `34199:*`; **không vẽ lại Output 1–3** | user |
| 0.8 / 0.9 / 0.10 / 0.11 | Tech stack · Granularity · Actors · Ngôn ngữ | Lấy từ SPEC v2 + mặc định (Standard, VN, PM nội bộ) | user ("Lấy từ v2 + mặc định") |
| — | Nhóm 1 (11 điểm) | Cập nhật hết | user |
| — | Nhóm 2 (A–I) | "Theo Figma hết" — áp dụng A, B, C, G, I; **không** áp dụng D, E, F, H (Figma tự mâu thuẫn / không xác minh được) → OQ-36..40 | user + BA |

## 5 Outputs

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | SPEC.md | ⚠️ WAITING_APPROVAL | `versions/v3_08102026/SPEC.md` | Scoped update, xem `## Thay đổi v3` |
| 1 | Figma Flow Tổng Quan | ⚠️ WAITING_APPROVAL (v3 hiện hành) | [node `34221:50059`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=34221-50059) | Scoped update: F6 (3 tab, edit Step 1/2/3/5) + thêm E-19/E-20 (48 màn). Bản v2 `32099:49634` đã bị xoá khỏi Figma |
| 2 | Figma Screen Flow | ⚠️ WAITING_APPROVAL (v3 hiện hành) | [node `34226:50059`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=34226-50059) | Scoped update: Edge/⑤/⑤b + thêm E-19/E-20 (48 màn; 4 Toast · 8 Modal · 5 Banner · 3 Empty). Bản v2 `32105:49624` đã bị xoá khỏi Figma |
| 3 | Figma Screens + Items | ❌ Skipped (từ v2) | — | Figma gốc đã đóng vai trò |
| 4 | HTML Prototype | ❌ Skipped (từ v2) | — | — |

## Diff so với version trước (v2)

- ~197 dòng thay đổi (48 dòng bị thay). Chi tiết: `## Thay đổi v3` mục A–F trong SPEC.
- Thay đổi so với quyết định BrSE 22/09: OQ-13, OQ-06, OQ-26, OQ-25, nút 「編集」 ở 基本情報 — chờ xác nhận (OQ-35).
- Đóng RQ-B17 (CONFLICT) và RQ-D23/RQ-C25 (UNKNOWN). Thêm AC-99..AC-106, RQ-C26, OQ-35..OQ-40.
- Lưu ý: `versions/v2_22092026/SPEC.md` là snapshot **trước** khi có bảng `Decisions`; v3 lấy bản canonical (đã có Decisions) làm gốc.

## Feedback từ user (điền sau khi user review)

-

## Output 5 — Basic Design (08/10/2026)

| Mục | Giá trị |
|---|---|
| Master workbook | `REQ/REQ_Tài xế/basic-design/delivery-driver_basic-design.xlsx` (khởi tạo từ `sample_basic_design.xlsx` của ba-kit; **đã di chuyển** từ `es-kitchen-docs/.../delivery-driver/basic-design/` sang REQ/REQ_Tài xế ngày 08/10/2026 theo yêu cầu user — cả thư mục `images/`) |
| Backup trước khi ghi | `versions/v3_08102026/basic_design_before.xlsx` |
| Source Flow Version | `v3_08102026` (Output 1 [`34221:50059`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=34221-50059) · Output 2 [`34226:50059`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=34226-50059)) |
| Phạm vi | 28 screen / 28 sheet (toàn bộ màn chính SPEC `## Screens`) |
| Quality Gate O5 | `basic-design-gate.md` — script `verify-basic-design.py` + self-test 8/8 |
| Trạng thái | WAITING FOR BRSE APPROVAL |

### Cập nhật Output 5 — MyPage (08/10/2026, scoped update)

- Nhận Figma MyPage `34199:211570` (frame `16892:78274`). Backup trước khi ghi: `basic_design_before_mypage.xlsx`.
- SPEC `DA_HOME_005`: thêm dòng icon chuông header (UNKNOWN — OQ-41); chữ 「すべて見る」 nằm trong container ẩn → không đưa vào.
- Basic Design: sheet `DA_HOME_005_MyPage` chèn ảnh Figma, thêm item chuông, Version 1 → 2; `Screen Index` UI Source `NO IMAGE` → Figma Hi-fi; `Change History` +CHG-0007 (UPDATE_SCREEN).
- Gate scoped (`basic-design-gate-mypage.md`, so với backup trước cập nhật): 15 PASS · 0 FAIL · 0 WARN — không sheet ngoài scope bị đổi. Gate so với file mẫu gốc: 15 PASS · 0 FAIL · 0 WARN; self-test 8/8.

### Cập nhật Output 5 — thêm sheet popup/modal theo danh sách màn hình mới (08/10/2026)

- Nguồn: `REQ/REQ_Tài xế/Danh sách màn hình tài xế_vi.xlsx` (37 dòng). User chọn: thêm sheet riêng cho 8 popup/modal.
- Backup trước khi ghi: `basic_design_before_popups.xlsx`.
- Thêm 8 sheet: `E-02`, `E-03`, `E-08`, `E-10`, `E-11`, `E-13`, `E-16`, `E-17` (kèm ảnh Figma). Không thêm Message Code mới — tham chiếu catalog của màn cha. Workbook: 28 → 36 sheet; Screen Index sắp lại theo thứ tự danh sách mới; `Change History` +CHG-0008.
- Gate scoped (`basic-design-gate-popups.md`, so với backup trước popup): 15 PASS · 0 FAIL · 0 WARN. Gate so với file mẫu gốc: 15 PASS · 0 FAIL · 0 WARN; self-test 8/8.

### Cập nhật — kiểm tra phần Tài xế xếp đồ (ES配送便) so với UI `34199:211578` + mô tả `34199:211577` (08/10/2026)

- Đối chiếu: 26 state frame UI, 15 bảng mô tả, 19 ảnh mô tả → SPEC, Output 1, Output 2, Basic Design. Kết quả: đủ mã màn và nội dung bảng; **thiếu 1 màn phụ**: banner kết quả Step 3 → thêm `E-19` (SPEC `## Screens`, Output 1, Output 2 ④ Screen Index). Tổng **47 màn = 28 + 19**.
- Thêm OQ-42 (bảng 24891 ghi banner Step 2 vs frame/ảnh), OQ-43 (thiếu frame `DA_ESDL_006-07`), OQ-44 (bảng Step 3 thiếu mục 1–3) vào SPEC và hộp ⑤b Output 2 (nay 10 mục OQ-35…44, gồm cả OQ-41).
- Sửa lỗi có sẵn trong Output 2: dòng tổng ghi "5 Toast" → đúng là 4 Toast (E-01, E-04, E-14, E-18).
- Quality Gate: Output 1 overlap 0/87 · Output 2 overlap 0/186 · ngoài biên 0 · va chạm text của Output 2 = 63 (bằng mức cũ, không có va chạm mới).
- Lưu ý: bản v2 của Output 1/2 (`32099:49634`, `32105:49624`) đã bị xoá khỏi Figma; hai frame v3 là bản hiện hành (link ở bảng 5 Outputs phía trên).

### Cập nhật — bổ sung màn phụ, đủ 48 màn (08/10/2026)

- User chọn: "Tất cả màn phụ còn lại" + "Thêm E-20". Màn hình hiện hành: **48 = 28 màn chính + 20 màn phụ** (4 Toast · 8 Modal · 5 Banner · 3 Empty state).
- SPEC: thêm `E-20` (banner `DA_RECV_003`) cạnh `E-19`; cập nhật tổng/thống kê; OQ-45 (Figma chưa có frame `E-04`, `E-07`); cập nhật link Figma Output 1/2 trong `## BA Deliverables` (node `34221:50059`, `34226:50059`).
- Output 1 / Output 2 (Figma): thêm `E-20`, tổng 48 (Output 2: dòng thứ 48 bảng Screen Index, dòng tổng, thống kê Group A5). Quality Gate: overlap 0, ngoài biên 0, va chạm text của Output 2 = 63 (bằng mức cũ).
- `REQ/REQ_Tài xế/Danh sách màn hình tài xế_vi.xlsx`: 37 → 49 dòng (+12 màn phụ: E-01, E-04, E-05, E-06, E-07, E-09, E-12, E-14, E-15, E-18, E-19, E-20); giữ cấu trúc A–G user đã chỉnh. Backup: `req_screen_list_before_E19-E20.xlsx`.
- Basic Design: 36 → **48 sheet** (+12 màn phụ, 10 sheet có ảnh Figma; `E-04`, `E-07` NO IMAGE); `Change History` +CHG-0009; backup `basic_design_before_toast-banner.xlsx`. Gate scoped (`basic-design-gate-toast-banner.md`): 14 PASS · 0 FAIL · 1 WARN (2 sheet NO IMAGE đã khai báo); gate so với file mẫu gốc: cùng kết quả; self-test 8/8.


### Di chuyển thư mục basic-design (08/10/2026)

- `es-kitchen-docs/docs/features/delivery-driver/basic-design/` → `REQ/REQ_Tài xế/basic-design/` (workbook + `images/` 46 ảnh, 11MB). Thư mục chưa được git theo dõi nên không có lịch sử bị mất; REQ nằm ngoài repo `AI_AGENTS_ES_KITCHEN`.
- Đã cập nhật đường dẫn trong 4 báo cáo gate và script dựng. Các bản backup (`basic_design_before*.xlsx`) và báo cáo gate vẫn ở `versions/v3_08102026/`.
### Basic Design tách theo nhóm Figma (08/10/2026)
- Yêu cầu user: mỗi nhóm Figma 1 file Basic Design; đánh số màn lấy từ Figma và ghi trong file; verify đủ nhóm/màn. User chọn: thay master cũ, dựng lại từ Figma + SPEC, toàn bộ 10 nhóm (ngoại lệ so với rule 1 master của kit).
- Output: `REQ/REQ_Tài xế/basic-design/BD_01_Login … BD_10_Tài xế xếp đồ.xlsx` (10 file, tổng 48 sheet màn). Mỗi file: `Screen Index` N4:U… = danh sách "FIGMA SCREEN LIST" (Figma # `<NN>-<seq>`, tên frame, node, loại, màn/sheet, link); mỗi sheet màn có khối `■Figma Screen No.` ở B4; ảnh theo frame.
- Master 48 sheet cũ chuyển vào `versions/v3_08102026/delivery-driver_basic-design_48sheets_replaced.xlsx` (trùng `basic_design_before_per-group.xlsx`). Manifest từng nhóm: `basic-design-per-group/G*.json`; gate: `basic-design-per-group/gate_G*.md` (10 file: 0 FAIL; self-test 8/8 trên BD_10).
- ⚠ Figma MCP hết hạn mức giữa phiên: nhiều nhóm chưa xem screenshot/đọc bảng mô tả → Login, Home gần như giữ nội dung bản trước; cần chạy lại khi hạn mức hồi (xem báo cáo cuối).

### Đổi tên 93 frame Figma theo Screen Code (08/10/2026)
- Theo `figma-rename-plan.md`: 93 frame đổi tên `<ScreenCode> — <tên màn> [state]`; 20 màn phụ E-xx dùng mã đề xuất (DA_HOME_006–008, DA_NOTI_003, DA_RECV_004–007, DA_COOL_002–004, DA_RPTD_003–005, DA_ESDL_007–012). Đọc lại 93/93 OK. Mã mới chưa được PM/BrSE chốt; tài liệu khác (SPEC, BD, TC, REQ list, O1/O2) chưa đồng bộ → STALE về mã.

### Đồng bộ Screen Code mới cho 20 màn phụ (08/10/2026)
- Mapping E-xx → mã mới: `code-sync-backup/code_map.json` và SPEC `## Thay đổi v3` mục G. Mã vẫn là ĐỀ XUẤT chờ PM/BrSE chốt.
- SPEC (và snapshot v3): thay 73 chỗ; backup `code-sync-backup/SPEC_before_codesync.md`. Trạng thái giữ `WAITING_APPROVAL`.
- Basic Design: dựng lại 10 file từ JSON đã đổi mã (sheet/Screen Index/Figma list); gate 15 check · 0 FAIL mỗi file; backup `code-sync-backup/basic-design/`.
- Test case: thay mã trong 10 file md + xuất lại xlsx (heading ≤31 ký tự, rút gọn một số tên sheet); ID test case (TC-xxx-E04-…) giữ nguyên; backup `code-sync-backup/testcase/`.
- Figma: sửa nốt 3 tên frame còn chứa mã cũ trong ghi chú banner (DA_ESDL_008/011/012).
- CHƯA đồng bộ: `Danh sách màn hình tài xế_vi.xlsx`, Output 1/2 trên Figma, `OPEN-QUESTIONS.md`, các file ngoài (memory).

### Ảnh đánh số theo frame Figma trong Basic Design (09/10/2026)
- Mỗi frame Screen/State/Popup/Toast/Banner/Empty (và Component nếu màn không có frame chính) có 1 ảnh đánh số `#<NN>-<seq>` lấy từ đúng node Figma; số được in lên dải đầu ảnh (`images/N<NN>/<no>_<code>.png`), ghi ở dòng nhãn trên ảnh trong sheet, và ở cột "Ảnh trong file" của danh sách Figma (Screen Index, cột N–V). Đã bỏ ảnh cũ chưa xác minh/ảnh ghép.
- 17+3 frame được export mới ngày 09/10; 10 file build lại, gate 0 FAIL. Màn không có frame Figma (DA_HOME_006, DA_NOTI_003) vẫn NO IMAGE.

### Badge số item trên ảnh Basic Design (09/10/2026)
- Theo file tham chiếu `REQ_Công ty vận chuyển/Basic Design/Basic Design - Quản lý Profile.xlsx`: ảnh Figma trong 10 file BD có vòng tròn đỏ đánh số = cột `#` của bảng item (68 ảnh, 519 badge). Dải nhãn xanh cũ đã bỏ; số thứ tự Figma `#NN-NN` còn ở dòng nhãn trên ảnh và danh sách Figma (Screen Index N–V).
- Toạ độ badge: ước lượng bằng mắt từ ảnh raw (không lấy bbox từ Figma). Toạ độ lưu ở `basic-design-per-group/badges/G*.json`, script vẽ `draw_badges.py`. Item không hiện trên ảnh (logic/ẩn/state khác) không đánh.

### Đồng bộ mã mới vào Danh sách màn hình tài xế (09/10/2026)
- `REQ/REQ_Tài xế/Danh sách màn hình tài xế_vi.xlsx`: thay mã E-xx → mã mới ở 2 sheet (23 + 8 ô); không còn E-xx. Backup: `code-sync-backup/req_screen_list_before_codesync.xlsx`.
