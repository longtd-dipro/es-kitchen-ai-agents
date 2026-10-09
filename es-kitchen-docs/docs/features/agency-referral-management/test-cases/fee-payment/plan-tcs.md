# TC Implementation Plan — Module `fee-payment` (支払履歴 / AW_FEPA)

> Nguồn: `../analysis.md` + `SPEC.md` §AW_FEPA_001–005 · Platform: Web 1440×1024

## Strategy Summary

Module **liên quan trực tiếp đến tiền** — rủi ro cao nhất toàn feature. Đặc thù: bản ghi **do batch sinh**, không có tạo/xóa thủ công. Chiến lược:

1. **Chuẩn bị dữ liệu bằng batch** — không có UI tạo bản ghi. Precondition mọi TC phải nêu rõ bản ghi đến từ batch tháng nào và trạng thái khởi tạo.
2. **Tính toán real-time** (AC-14) là rủi ro số học cao nhất: nhập `調整額` ở 1 dòng phải cập nhật đồng thời `支払額` dòng đó + `調整合計額` + `支払合計額`. Phải test với **nhiều dòng** và **giá trị âm**, không chỉ 1 dòng dương.
3. **BVA trên `調整額`** — phạm vi ±9.999.999, số nguyên, half-width. Test đủ 8 giá trị biên gồm cả số toàn chiều rộng phải auto-convert.
4. **State Transition cho `支払状況`** — 3 trạng thái, mỗi chuyển đổi ảnh hưởng `支払日` (tự set / ẩn / trống) và `調整額` (enable / disable).
5. **Guard chặn sửa bản ghi `支払済み`** (AC-12) phải test ở **cả 2 điểm vào**: icon ✏ ở danh sách và nút 編集 ở màn chi tiết.
6. **Hành vi lưu khác biệt** (RQ-047) — lưu xong **giữ nguyên màn**, không quay về danh sách. Cần TC riêng nhấn mạnh, tránh QC báo nhầm là bug.
7. `AW_FEPA_003` khác `002` chỉ ở `支払先区分` = 法人 và `処理方法` mặc định = 請求相殺 → chỉ test phần khác biệt.

| Screen | Archetype | Risk tổng | Ghi chú chiến lược |
|---|---|---|---|
| AW_FEPA_001 | List | **High** | Guard chặn sửa + 3 cột tiền + sắp xếp mặc định |
| AW_FEPA_002 | Form | **High** | Real-time tính tổng + BVA 調整額 + State Transition |
| AW_FEPA_003 | Form | Medium | Chỉ khác 支払先区分 và 処理方法 mặc định |
| AW_FEPA_004 | Detail | Medium | Read-only toàn bộ kể cả 調整額 |
| AW_FEPA_005 | Modal | Low | Dùng chung component |

## State Transition — `支払状況` (AW_FEPA_002/003)

| Từ | Đến | `支払日` | `調整額` | Ghi chú |
|---|---|---|---|---|
| 未払い (khởi tạo) | 支払済み | **tự set = ngày hiện tại**, admin sửa được | disable | AC-13 |
| 未払い | 対象外 | **ẩn** ô | disable | AC-13 |
| 未払い | 未払い | trống | **enable** | Trạng thái duy nhất sửa được 調整額 |
| 支払済み | 未払い | Chưa rõ có xóa ngày không → `[UNCONFIRMED]` | enable | Figma không quy định |
| 対象外 | 未払い | hiện lại, trống | enable | — |

## Boundary Value Analysis — `調整額` (AC-14)

| # | Giá trị nhập | Kết quả |
|---|---|---|
| A1 | `0` | Hợp lệ (mặc định) |
| A2 | `9999999` | Hợp lệ (biên trên) |
| A3 | `-9999999` | Hợp lệ (biên dưới) |
| A4 | `10000000` | NG — E-072 |
| A5 | `-10000000` | NG — E-072 |
| A6 | `1.5` | NG — E-073 (không cho thập phân) |
| A7 | `abc` | NG — E-073 |
| A8 | `１０００` (toàn chiều rộng) | Auto-convert thành `1000`, hợp lệ |

## Công thức cần verify

| Công thức | Vị trí | Cách verify |
|---|---|---|
| `支払額` (dòng) = `算定額` + `調整額` | Section 3 mỗi dòng | Nhập 調整額, so số hiển thị |
| `調整合計額` = Σ `調整額` mọi dòng | Section 2 thẻ | Nhập ở ≥2 dòng, cộng tay so kết quả |
| `支払合計額` = `算定合計額` + `調整合計額` | Section 2 thẻ | So sau mỗi lần nhập |
| `算定対象額合計` = Σ `算定対象額` | Section 2 thẻ | Read-only, so tổng cột |
| `対象件数` = số dòng Section 3 | Section 1 | Đếm dòng |

## Component Map

| Screen | Component | Component Type | Risk | Technique | Ghi chú phụ thuộc |
|---|---|---|---|---|---|
| AW_FEPA_001 | Nút CSV出力 | Button | Medium | — | Điều kiện hiển thị AMB-07 |
| AW_FEPA_001 | 検索テキスト (2 trường OR) | Filter | Medium | EP | 支払先名 · 支払いID |
| AW_FEPA_001 | 5 dropdown + month picker | Filter | Medium | EP | — |
| AW_FEPA_001 | 並べ替え | Navigation | Medium | EP | Mặc định 支払対象月 giảm dần, về trang 1 |
| AW_FEPA_001 | 3 cột tiền | Data display | **High** | — | 支払合計額 = 算定 + 調整; 税込 (AMB-02) |
| AW_FEPA_001 | Icon ✏ | Button | **High** | Decision Table | Guard 支払済み (E-069) |
| AW_FEPA_002 | Section 1 (5 ô read-only) | Data display | Medium | — | Batch tự set |
| AW_FEPA_002 | 支払状況 | Radio | **High** | State Transition | Điều khiển 支払日 + 調整額 |
| AW_FEPA_002 | 支払日 | Date picker | **High** | State Transition | Tự set / ẩn |
| AW_FEPA_002 | 処理方法 | Dropdown | **High** | Decision Table | Mặc định theo 支払先区分 |
| AW_FEPA_002 | 4 thẻ tổng hợp | Data display | **High** | — | Real-time |
| AW_FEPA_002 | Bảng 紹介フィー内訳 | Table input | **High** | BVA | Chỉ 調整額 nhập được |
| AW_FEPA_002 | Nút 保存 | Button | **High** | — | Lưu xong **giữ màn** (RQ-047) |
| AW_FEPA_003 | Delta so với 002 | Form | Medium | — | 支払先区分 = 法人; 処理方法 = 請求相殺 |
| AW_FEPA_004 | Read-only toàn bộ | Detail | Medium | — | Kể cả 調整額 |
| AW_FEPA_005 | Popup 編集破棄 | Modal | Low | — | Verify điểm vào |

## Ước lượng

| Screen | UI | Happy | Validation | Logic/Guard | Tổng |
|---|---|---|---|---|---|
| AW_FEPA_001 | 1 | 7 | 0 | 12 | 20 |
| AW_FEPA_002 | 1 | 6 | 6 | 22 | 35 |
| AW_FEPA_003 | 1 | 3 | 1 | 5 | 10 |
| AW_FEPA_004 | 1 | 4 | 0 | 6 | 11 |
| AW_FEPA_005 | 1 | 2 | 0 | 2 | 5 |
| **Tổng** | 5 | 22 | 7 | 47 | **81** |

Mọi sheet ≤ 96 dòng → khớp giới hạn template.
