# TC Implementation Plan — Module `fee-plan` (紹介フィーマスタ / AW_FEPL)

> Nguồn: `../analysis.md` + `SPEC.md` §AW_FEPL_001–006 · Platform: Web 1440×1024

## Strategy Summary

Module này là **CRUD master data** với điểm rủi ro tập trung ở **AW_FEPL_002 (Đăng ký)** — nơi có 3 panel tính phí loại trừ lẫn nhau và 19 error display. Chiến lược:

1. **Panel loại trừ** là rủi ro cao nhất — dùng **Decision Table** cho cặp (`支払区分`, `算定方法`) để không bỏ sót tổ hợp, đặc biệt rule "đổi panel thì XÓA giá trị panel cũ".
2. **Bảng bậc số lượng** (panel 2.5) có logic tự điền cận dưới + rule "chỉ dòng cuối được để trống cận trên" → dùng **Boundary Value Analysis** trên cặp cận dưới/cận trên.
3. **Guard xóa** (AC-04) là rủi ro nghiệp vụ — phải test cả 3 nguồn tham chiếu (đại lý / giới thiệu / thanh toán), không chỉ 1.
4. `AW_FEPL_003` (Edit) **tái sử dụng** toàn bộ validation của `002` → chỉ sinh TC cho phần **khác biệt** (ID đã cấp, 変更情報テーブル, popup 編集破棄, các cột chỉ sửa được ở màn này), tránh nhân đôi 19 TC.
5. `AW_FEPL_006` (編集破棄) dùng chung component với 3 module còn lại → test kỹ **1 lần ở đây**, 3 module sau chỉ verify điểm vào.

| Screen | Archetype | Risk tổng | Ghi chú chiến lược |
|---|---|---|---|
| AW_FEPL_001 | List | Medium | Trọng tâm: hiển thị có điều kiện của `フィー金額・率` và `支払期間` theo 算定方式/支払区分 |
| AW_FEPL_002 | Form | **High** | Decision Table + BVA; 19 error display |
| AW_FEPL_003 | Form | Medium | Chỉ delta so với 002 |
| AW_FEPL_004 | Detail | Low | Read-only + guard xóa |
| AW_FEPL_005 | Modal | Medium | Guard tham chiếu + 2 message kết quả |
| AW_FEPL_006 | Modal | Medium | 3 điểm vào (nút Hủy / menu bên / breadcrumb) |

## Decision Table — `支払区分` × `算定方法` (AW_FEPL_002)

| # | 支払区分 | 支払い期間 | 算定方法 | Panel hiển thị | Panel bị ẩn (phải XÓA giá trị) |
|---|---|---|---|---|---|
| D1 | 単発 | disable + trống | 固定額 | 2.4 | 2.5, 2.6 |
| D2 | 単発 | disable + trống | 月次提供回の金額 | 2.5 | 2.4, 2.6 |
| D3 | 単発 | disable + trống | 請求額割合 | 2.6 | 2.4, 2.5 |
| D4 | 継続（ヶ月） | **enable + bắt buộc** | 固定額 | 2.4 | 2.5, 2.6 |
| D5 | 継続（ヶ月） | enable + bắt buộc | 月次提供回の金額 | 2.5 | 2.4, 2.6 |
| D6 | 継続（ヶ月） | enable + bắt buộc | 請求額割合 | 2.6 | 2.4, 2.5 |
| D7 | 継続（永続） | disable + trống | 固定額 | 2.4 | 2.5, 2.6 |
| D8 | 継続（永続） | disable + trống | 月次提供回の金額 | 2.5 | 2.4, 2.6 |
| D9 | 継続（永続） | disable + trống | 請求額割合 | 2.6 | 2.4, 2.5 |

## Boundary Value Analysis — bảng bậc số lượng (panel 2.5)

| Biến | Tier | Giá trị test |
|---|---|---|
| 下限 (cận dưới) | Hợp lệ | `1` · `9999999` (7 chữ số) |
| 下限 | Không hợp lệ | trống · `10000000` (8 chữ số) · `abc` |
| 上限 (cận trên) | Hợp lệ | `= 下限` · `> 下限` · trống **chỉ ở dòng cuối** |
| 上限 | Không hợp lệ | `< 下限` · trống ở dòng giữa · `10000000` |
| Số dòng | Biên | `1` (không xóa được) · `2` (xóa được 1) · `0` (chặn lưu) |

## Component Map

| Screen | Component | Component Type | Risk | Technique | Ghi chú phụ thuộc |
|---|---|---|---|---|---|
| AW_FEPL_001 | Nút ＋新規登録 | Button | Medium | — | AC-01 — ẩn khi không có quyền Create |
| AW_FEPL_001 | Bảng danh sách (12 cột) | Data display | Medium | EP | `フィー金額・率` phụ thuộc `算定方式`; `支払期間` phụ thuộc `支払区分` |
| AW_FEPL_001 | Icon ✏ / 🗑 | Button | Medium | — | AC-01; 🗑 → AW_FEPL_005 |
| AW_FEPL_001 | Phân trang | Navigation | Low | BVA | AMB-05, AMB-06 |
| AW_FEPL_002 | フィープラン名 | Input text | Medium | BVA | — |
| AW_FEPL_002 | 紹介元区分 | Radio | Medium | EP | Ảnh hưởng dropdown ở AW_AGCY_002 và AW_REFE_002 |
| AW_FEPL_002 | ステータス | Radio | Medium | EP | AC-03 — 無効 loại khỏi dropdown mới |
| AW_FEPL_002 | 備考 | Textarea | Low | — | Giữ ký tự xuống dòng |
| AW_FEPL_002 | 支払区分 | Radio | **High** | Decision Table | Điều khiển enable/disable `支払い期間` |
| AW_FEPL_002 | 支払い期間（ヶ月） | Input text | **High** | Decision Table | Phụ thuộc `支払区分` |
| AW_FEPL_002 | 算定方法 | Radio | **High** | Decision Table | Điều khiển 3 panel |
| AW_FEPL_002 | Panel 2.4 固定額 | Input number | **High** | BVA | Hiện/ẩn theo `算定方法` |
| AW_FEPL_002 | Panel 2.5 bảng bậc | Table input | **High** | BVA + Decision Table | Tự điền cận dưới; min 1 dòng |
| AW_FEPL_002 | Panel 2.6 割合 | Input + Radio | **High** | BVA | AMB-13 — nhãn panel sai |
| AW_FEPL_002 | Nút 登録 / キャンセル | Button | **High** | — | → AW_FEPL_006 khi đã nhập |
| AW_FEPL_003 | Delta so với 002 | Form | Medium | — | ID đã cấp · 変更情報テーブル · cột chỉ sửa ở màn này |
| AW_FEPL_004 | Toàn bộ item read-only | Data display | Low | — | — |
| AW_FEPL_004 | Nút 編集 / 削除 | Button | Medium | — | AC-01 |
| AW_FEPL_005 | Popup 削除確認 | Modal | Medium | Decision Table | Guard 3 nguồn tham chiếu |
| AW_FEPL_006 | Popup 編集破棄 | Modal | Medium | State Transition | 3 điểm vào |

## Ước lượng

| Screen | UI | Happy | Validation | Logic/Guard | Tổng |
|---|---|---|---|---|---|
| AW_FEPL_001 | 1 | 6 | 0 | 6 | 13 |
| AW_FEPL_002 | 1 | 5 | 19 | 14 | 39 |
| AW_FEPL_003 | 1 | 4 | 2 | 6 | 13 |
| AW_FEPL_004 | 1 | 3 | 0 | 3 | 7 |
| AW_FEPL_005 | 1 | 2 | 0 | 5 | 8 |
| AW_FEPL_006 | 1 | 2 | 0 | 4 | 7 |
| **Tổng** | 6 | 22 | 21 | 38 | **87** |

Mọi sheet ≤ 96 dòng → khớp giới hạn template.
