# TC Implementation Plan: Group 3 — 配送サイクル設定 / Thiết lập chu kỳ giao hàng

**Ngày:** 2026-10-12 · **Input:** `analysis.md` (AC-01〜AC-21, AMB-01〜AMB-15) · **Output:** `test-cases.md` (207 TC)

## AW_CYCSET_001 — 配送サイクル設定（祝日・臨休タブ）

- **Archetype:** Settings + Calendar (kèm Form inline và List)
- **Chiến lược Test Case:**
  - BVA cho 設定対象期間 (1 / 6 / 7 / 12 / 13 tháng, kết thúc < bắt đầu) và cho thứ của A1 (Chủ nhật / thứ Hai / thứ Ba).
  - Mọi thao tác ở panel phải đều kiểm 3 điểm phản ánh tức thời: bảng, ô lịch, số ngày trên thanh tháng.
  - Tháng khoá kiểm theo State cho từng thao tác (đổi cờ, xoá, thêm) với biên 2026-10-31 / 2026-11-01.
- **UI chung:** header (breadcrumb, tiêu đề, キャンセル, 設定を保存) → khối kỳ + A1 + ghi chú → trái: thanh tháng, lịch, chú giải → phải: panel 「休止設定」 3 tab.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Header (パンくず, tiêu đề, キャンセル, 設定を保存) | Breadcrumb / Button | Critical | Decision Table (kết quả validate khi lưu) | 設定を保存 phụ thuộc A1, kỳ, đợt ngưng, quyền; mở AW_CYCSET_004 |
| 設定対象期間 (開始月, 終了月) | Datepicker (tháng) | High | BVA + EP | Đổi kỳ làm thanh tháng, lịch, 休日一覧 hiển thị lại |
| 配送サイクル初日（最初のA1） | Datepicker | Critical | BVA (thứ trong tuần) | Đổi A1 làm lịch tính lại 28 slot |
| 注記, 注釈, 説明文 | Label | Low | — | Tháng trong ghi chú phụ thuộc tháng khoá |
| 月タブ (出荷不可：N日, 配送祝日：N日, 参照のみ) | Tab | High | State Transition (khoá / chưa khoá) | Số ngày phụ thuộc panel phải và kho (AMB-05) |
| 月間カレンダー (slot, tên ngày nghỉ, サイクル休止, 休：出荷 / 配送) | Calendar | Critical | Decision Table (loại ngày → nhãn) | Phụ thuộc A1, đợt ngưng, ngày lễ, slot không xuất |
| Tab 祝日・臨休 / サイクル休止 / 出荷不可 | Tab | High | — | Giữ dữ liệu chưa lưu khi đổi tab |
| 祝日を再取得, 休日を手動で追加 | Button | Medium | — | Master ngày lễ |
| 休日一覧 (出荷不可, 配送祝日, 削除) | Table + Checkbox + Delete | High | State Transition (ON / OFF) | Phản ánh lịch và thanh tháng; tháng khoá |
| Form 休日を手動で追加 (休日名, 日付, 追加設定, 追加) | Textbox / Datepicker / Checkbox / Add Button | High | EP + BVA (tháng khoá) + Decision Table (2 checkbox) | Thêm vào 休日一覧 |

**Decision Table — nhãn trên ô lịch**

| Điều kiện | R1 | R2 | R3 | R4 | R5 |
|---|---|---|---|---|---|
| Thuộc đợt サイクル休止 | Y | N | N | N | N |
| Không xuất hàng (slot hoặc ngày) | — | Y | N | Y | N |
| 配送祝日 | — | N | Y | Y | N |
| **Mã slot** | Không | Có | Có | Có | Có |
| **Nhãn** | サイクル休止 + 休：出荷・配送 | 休：出荷 | 休：配送 | 休：出荷・配送 | Không có |
| TC | CYH-038, 042 | CYH-040 | CYH-045 | CYH-039 | CYH-040 |

**Decision Table — form 追加 (2 checkbox)**

| 出荷不可 | 配送祝日 | Kết quả | TC |
|---|---|---|---|
| ON | ON | Thêm, 休：出荷・配送 | CYH-058 |
| ON | OFF | Thêm, 休：出荷 | CYH-059 |
| OFF | ON | Thêm, 休：配送 | CYH-060 |
| OFF | OFF | E_CYCSET001_007 | CYH-071 |

**Boundary — 設定対象期間 (bắt đầu 2026-11)**

| Tháng kết thúc | Số tháng | Kỳ vọng | TC |
|---|---|---|---|
| 2026-10 (bắt đầu 2026-12, kết thúc 2026-11) | −1 | E_CYCSET001_002 | CYH-023 |
| 2026-11 | 1 | Hợp lệ | CYH-024 |
| 2027-04 | 6 | Hợp lệ | CYH-025 |
| 2027-05 | 7 | `[UNCONFIRMED]` làm tròn về 2027-04 | CYH-026 |
| 2027-10 | 12 | `[UNCONFIRMED]` | CYH-027 |
| 2027-11 | 13 | Không lưu được | CYH-028 |

## AW_CYCSET_002 — 配送サイクル設定（サイクル休止タブ）

- **Archetype:** Settings tab — Card list + Form inline
- **Chiến lược Test Case:**
  - BVA quanh bội số 7 cho số ngày của một đợt: 1 / 3 / 6 / 7 / 8 / 13 / 14 ngày, kiểm cả hiển thị trên thẻ và kết quả 「設定を保存」.
  - Kiểm hệ quả lên lịch: ngày ngưng không gán slot, slot lùi về sau, ưu tiên cao hơn ngày nghỉ.
  - Tháng khoá: thêm / sửa / xoá đều bị từ chối (E_CYCSET002_005).
- **UI chung:** phần trái dùng chung; panel phải: câu giải thích → nút thêm → thẻ đợt ngưng → form 「サイクル休止を追加」.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Phần chung + 説明文 | Label | Medium | — | Dùng chung AW_CYCSET_001 |
| サイクル休止を追加 (nút) | Button | Low | — | Quan hệ nút và form chưa rõ (Need Confirm) |
| 休止カード (期間名, tag, 期間, 日数・調整表示) | Card list | High | BVA (bội số 7) | Phản ánh lịch; E_CYCSET002_004 khi lưu |
| 編集 / 削除 icon | Update / Delete Button | High | State Transition (khoá / chưa khoá) | UI sửa UNKNOWN (AMB-10) |
| Form (期間名, 開始日, 終了日) | Textbox / Datepicker | High | EP + BVA (終了日 so với 開始日, tháng khoá) | Cho phép trùng khoảng |
| 出荷不可, 配送（常に停止） | Checkbox | Medium | — | Tag trên thẻ; CONFLICT AMB-11 |
| 追加 | Add Button | Critical | — | Tính lại lịch; không chặn bội số 7 tại đây (Need Confirm) |

**Boundary Tier — số ngày của một đợt (bắt đầu 2026-12-14)**

| 終了日 | Số ngày | Thiếu = 7 − (n mod 7) | 設定を保存 | TC |
|---|---|---|---|---|
| 2026-12-14 | 1 | 6 | Từ chối | CYP-017 |
| 2026-12-16 | 3 | 4 | Từ chối | CYP-019, CYH-074, CYNAV-009 |
| 2026-12-19 | 6 | 1 | Từ chối | CYP-011, CYP-012 |
| 2026-12-20 | 7 | 0 | Mở AW_CYCSET_004 | CYP-009, CYP-013 |
| 2026-12-21 | 8 | 6 | Từ chối | CYP-014 |
| 2026-12-26 | 13 | 1 | Từ chối | CYP-015 |
| 2026-12-27 | 14 | 0 | Mở AW_CYCSET_004 | CYP-016 |
| 3 ngày + 4 ngày 調整 | 7 | 0 | Mở AW_CYCSET_004 `[UNCONFIRMED]` | CYP-018 |

## AW_CYCSET_003 — 配送サイクル設定（出荷不可タブ）

- **Archetype:** Settings tab — Toggle grid + Read-only computed list + List + Form inline
- **Chiến lược Test Case:**
  - State Transition ON / OFF cho nút slot, kiểm đồng thời lịch, thanh tháng và chip 納品不可枠.
  - Kiểm thuật toán 納品不可枠 bằng 4 cấu hình: mặc định, tắt A6, chỉ D7 (xoay vòng), tắt hết.
  - Kiểm tính độc lập theo kho và việc tháng khoá không bị ảnh hưởng.
- **UI chung:** phần trái dùng chung; panel phải: câu giải thích → tab kho → 出荷不可枠 → 納品不可枠（自動計算） → 日別の出荷不可日 (bảng + form).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Phần chung + 説明文 | Label | Medium | — | Dùng chung AW_CYCSET_001 |
| 倉庫タブ | Tab (filter) | High | — | Đổi toàn bộ nội dung panel; E_CYCSET003_004 |
| 出荷不可枠 (tiêu đề đóng mở, lưới 28 nút) | Toggle | Critical | State Transition + Decision Table (slot → chip) | Lịch, thanh tháng, 納品不可枠; tháng khoá ngoài phạm vi |
| 納品不可枠（自動計算） (lead time, chip) | Badge (read-only) | Critical | Decision Table | Phụ thuộc 出荷不可枠 và lead time |
| 出荷不可日一覧 (理由, 日付, 出荷不可, 削除) | Table + Checkbox + Delete | High | State Transition (ON / OFF) | Theo từng kho; phản ánh lịch |
| Form 出荷不可日を追加 (理由, 日付, 追加) | Textbox / Datepicker / Add Button | High | EP + BVA (quá khứ, tháng khoá) | Thêm vào bảng của kho đang chọn |

**Decision Table — 納品不可枠 với lead time 1 ngày**

| Slot không xuất đang bật | Chip mong đợi | TC |
|---|---|---|
| A6, A7, B4〜B7, C6, C7, D4〜D7 (mặc định) | A1, A7, B1, B5, B6, B7, C1, C7, D1, D5, D6, D7 | CYN-020 |
| Mặc định trừ A6 | A1, B1, B5, B6, B7, C1, C7, D1, D5, D6, D7 | CYN-021 |
| Chỉ D7 | A1 | CYN-022 |
| Không có | Không có chip | CYN-023 |

## AW_CYCSET_004 — 保存前の確認モーダル（影響件数）

- **Archetype:** Modal (confirm trước khi lưu)
- **Chiến lược Test Case:**
  - Decision Table trên (số mất hiệu lực, số cần đề xuất lại) quyết định có checkbox và trạng thái nút lưu.
  - State Transition của nút 「確認して保存」 theo checkbox.
  - Mỗi mã lỗi phía server có 1 TC; kiểm idempotent khi bấm đúp và khi thử lại sau mất mạng.
- **UI chung:** scrim → icon 「！」 → tiêu đề → câu mô tả → 9 dòng số liệu → checkbox + ghi chú → キャンセル / 確認して保存.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Icon, tiêu đề, câu mô tả | Label | Medium | — | Mẫu câu UNKNOWN ngoài ví dụ Figma |
| Bảng số mục ảnh hưởng (#4〜#12) | Text (read-only) | Critical | — | #7 = #8 + #9 + #10; lấy từ API preview |
| Checkbox xác nhận + ghi chú | Checkbox | Critical | Decision Table | Hiển thị khi #9 + #10 ≥ 1 |
| キャンセル | Button (Cancel) | High | — | Quay lại tab đang sửa, giữ dữ liệu |
| 確認して保存 | Button (Confirm) | Critical | State Transition | Phụ thuộc checkbox; lỗi server E_CYCSET004_002〜005 |

**Decision Table — checkbox và nút lưu**

| 失効 (#9) | 提案中 (#10) | 振り替えられない (#12) | Checkbox | Nút lưu khi mở | TC |
|---|---|---|---|---|---|
| 0 | 0 | 0 | Không hiển thị | Enable | CYS-010 |
| 1 | 0 | 0 | 「1件」 | Disable | CYS-011 |
| 0 | 1 | 0 | 「1件」 | Disable | CYS-012 |
| 2 | 1 | 3 | 「3件」 | Disable | CYS-007, CYS-008, CYS-009 |
| 0 | 0 | 3 | Không hiển thị | Enable | CYS-013 |

## Ghi chú tổng quát

- Platform dimension áp dụng: Web desktop 1440 (layout, không cuộn ngang), phiên đăng nhập, mất mạng, bấm đúp, thao tác đồng thời hai phiên.
- Mỗi textbox (休日名, 期間名, 理由) có TC riêng cho bắt buộc, khoảng trắng, XSS, SQLi, chuỗi dài; maxlength chính thức đang UNKNOWN (AMB-13).
- TC phụ thuộc điểm chưa chốt mang `[UNCONFIRMED]`; điểm không viết được Expected đo được nằm ở `## Not Covered — UNKNOWN` của `test-cases.md`.
