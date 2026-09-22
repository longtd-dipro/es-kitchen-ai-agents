# TC Implementation Plan — Module `referral` (紹介履歴 / AW_REFE)

> Nguồn: `../analysis.md` + `SPEC.md` §AW_REFE_001–007 · Platform: Web 1440×1024

## Strategy Summary

Module có **logic liên động phức tạp nhất**: chọn nguồn giới thiệu điều khiển cặp dropdown loại trừ, chọn hợp đồng tự điền 2 trường read-only, và ràng buộc 1 hợp đồng = 1 lịch sử giới thiệu. Chiến lược:

1. **State Transition** cho `紹介元区分` — 2 trạng thái (代理店 / 法人), mỗi lần chuyển phải verify: dropdown bên kia bị **xóa giá trị** VÀ **disable**. Rule này dễ bị dev chỉ làm disable mà quên clear.
2. **Ràng buộc 1-1 hợp đồng ↔ lịch sử giới thiệu** (AC-09) là rủi ro dữ liệu cao nhất — phải test cả 2 tầng: dropdown **không liệt kê** hợp đồng đã dùng, VÀ submit hợp đồng đã dùng bị chặn (E-067).
3. **Ràng buộc năm tháng** (AC-10) dùng **BVA** trên cặp (契約開始年月, 支払い開始年月): bằng nhau = hợp lệ, sau = hợp lệ, trước = NG.
4. `AW_REFE_003` và `AW_REFE_004` khác nhau **chỉ ở cặp dropdown** → test đầy đủ ở 003, ở 004 chỉ test phần khác biệt, tránh nhân đôi.
5. **Guard xóa 2 điều kiện** (AC-11) — `契約中` HOẶC đã có `支払履歴`. Phải test riêng từng điều kiện và trường hợp thỏa cả hai.

| Screen | Archetype | Risk tổng | Ghi chú chiến lược |
|---|---|---|---|
| AW_REFE_001 | List | Medium | Lọc 7 điều kiện + search 5 trường OR + guard xóa |
| AW_REFE_002 | Form | **High** | State Transition + ràng buộc 1-1 + BVA năm tháng |
| AW_REFE_003 | Form | Medium | Full delta + 変更情報テーブル |
| AW_REFE_004 | Form | Low | Chỉ khác cặp dropdown |
| AW_REFE_005 | Detail | Low | Read-only + điều hướng đúng màn Edit |
| AW_REFE_006 | Modal | Medium | Guard 2 điều kiện |
| AW_REFE_007 | Modal | Low | Dùng chung component |

## State Transition — `紹介元区分` (AW_REFE_002)

| Từ | Đến | Dropdown 代理店 | Dropdown 法人 | Section 2 gói phí |
|---|---|---|---|---|
| (khởi tạo) | 代理店 (mặc định) | enable, trống | disable, trống | trống |
| 代理店 (đã chọn AG00001) | 法人 | **disable + XÓA giá trị** | enable, trống | AMB-12 — chưa rõ có xóa không |
| 法人 (đã chọn CU123468) | 代理店 | enable, trống | **disable + XÓA giá trị** | AMB-12 |
| 代理店 (đã chọn) | 代理店 (đổi sang AG00002) | giữ enable, đổi giá trị | disable | **tự điền lại** theo đại lý mới |

## Boundary Value Analysis — cặp năm tháng (AC-10)

| # | 契約開始年月 | 支払い開始年月 | Kết quả |
|---|---|---|---|
| B1 | 2026年09月 | 2026年09月 | Hợp lệ (bằng nhau — biên) |
| B2 | 2026年09月 | 2026年10月 | Hợp lệ (sau) |
| B3 | 2026年09月 | 2026年08月 | NG — E-068 |
| B4 | 2026年09月 | trống | NG — E-065 |
| B5 | trống | 2026年09月 | NG — E-064 |

## Component Map

| Screen | Component | Component Type | Risk | Technique | Ghi chú phụ thuộc |
|---|---|---|---|---|---|
| AW_REFE_001 | Nút ＋新規登録 / CSV出力 | Button | Medium | — | AC-01; CSV điều kiện hiển thị AMB-07 |
| AW_REFE_001 | 検索テキスト (5 trường OR) | Filter | **High** | EP | Phải test đủ 5 trường riêng lẻ |
| AW_REFE_001 | 6 dropdown + 2 month picker | Filter | Medium | EP | 支払区分 AMB-10 |
| AW_REFE_001 | Bảng danh sách 15 cột | Data display | Medium | EP | 終了予定月/終了月 trống mang ngữ nghĩa |
| AW_REFE_001 | Icon ✏ | Button | Medium | Decision Table | Điều hướng theo 紹介元区分 |
| AW_REFE_001 | Icon 🗑 | Button | **High** | Decision Table | Guard 2 điều kiện |
| AW_REFE_002 | 紹介元区分 | Radio | **High** | State Transition | Điều khiển 1.3 / 1.4 |
| AW_REFE_002 | Dropdown 代理店 | Dropdown | **High** | EP | Chỉ 有効 |
| AW_REFE_002 | Dropdown 紹介元法人 | Dropdown | **High** | EP | Chỉ 有効 |
| AW_REFE_002 | Dropdown 紹介先契約ID | Dropdown | **High** | Decision Table | Lọc 2 điều kiện; tự điền 1.6/1.7 |
| AW_REFE_002 | 紹介先法人 / 紹介先拠点 | Read-only | **High** | — | Tự ghi đè khi đổi hợp đồng |
| AW_REFE_002 | 契約開始年月 / 支払い開始年月 | Month picker | **High** | BVA | B1–B5 ở trên |
| AW_REFE_002 | Section 2 (5 ô read-only) | Data display | Medium | — | Tự điền từ đại lý |
| AW_REFE_003 | Delta + 変更情報テーブル | Form | Medium | — | — |
| AW_REFE_004 | Cặp dropdown khác biệt | Form | Low | — | Chỉ test phần khác |
| AW_REFE_005 | Read-only + nút 編集 | Detail | Low | Decision Table | Điều hướng 003 hay 004 |
| AW_REFE_006 | Popup 削除確認 | Modal | **High** | Decision Table | 2 điều kiện guard |
| AW_REFE_007 | Popup 編集破棄 | Modal | Low | — | Verify điểm vào |

## Ước lượng

| Screen | UI | Happy | Validation | Logic/Guard | Tổng |
|---|---|---|---|---|---|
| AW_REFE_001 | 1 | 7 | 0 | 14 | 22 |
| AW_REFE_002 | 1 | 5 | 9 | 18 | 33 |
| AW_REFE_003 | 1 | 4 | 2 | 7 | 14 |
| AW_REFE_004 | 1 | 3 | 1 | 4 | 9 |
| AW_REFE_005 | 1 | 3 | 0 | 4 | 8 |
| AW_REFE_006 | 1 | 2 | 0 | 6 | 9 |
| AW_REFE_007 | 1 | 2 | 0 | 2 | 5 |
| **Tổng** | 7 | 26 | 12 | 55 | **100** |

Mọi sheet ≤ 96 dòng → khớp giới hạn template.
