# TC Implementation Plan — Module `agency` (代理店マスタ / AW_AGCY)

> Nguồn: `../analysis.md` + `SPEC.md` §AW_AGCY_001–006 · Platform: Web 1440×1024

## Strategy Summary

Module nặng nhất về **validation** (30 error display ở màn đăng ký) và là nơi duy nhất có **màn chi tiết 3 tab**. Chiến lược:

1. **Field-level validation tách riêng từng trường** — 17 trường ở `AW_AGCY_002`, mỗi trường có TC bắt buộc/độ dài/định dạng riêng. Không gộp.
2. **Bảng người phụ trách** là rủi ro nghiệp vụ cao nhất: rule "chỉ 1 Main admin" + "email không trùng trong cùng đại lý" + "Main không xóa được" → dùng **Decision Table** cho tổ hợp (số dòng, 区分, email).
3. **Tự điền địa chỉ** (AC-17) cần test cả nhánh mã bưu điện **không tồn tại** — Figma quy định rõ: không điền, **không báo lỗi**, giữ nguyên giá trị đã nhập. Đây là hành vi dễ bị dev làm sai thành báo lỗi.
4. **3 tab ở AW_AGCY_004** đều read-only → trọng tâm là verify **không có cột thao tác**, chỉ hiển thị dữ liệu thuộc đúng `代理店ID`, và empty state.
5. **3 chỉ số tự tổng hợp** (`紹介合計数` / `支払対象数` / `現在契約中`) có định nghĩa rất gần nhau → phải có TC riêng cho từng chỉ số với dữ liệu phân biệt được 3 con số.

| Screen | Archetype | Risk tổng | Ghi chú chiến lược |
|---|---|---|---|
| AW_AGCY_001 | List | **High** | 3 chỉ số tổng hợp + guard xóa + CSV xuất (AMB-01 đã chốt) |
| AW_AGCY_002 | Form | **High** | 30 error display · 17 trường · bảng người phụ trách |
| AW_AGCY_003 | Form | Medium | Delta so với 002 + 3 tab + 備考 sửa được |
| AW_AGCY_004 | Detail | **High** | 3 tab read-only + empty state |
| AW_AGCY_005 | Modal | Medium | Guard tham chiếu |
| AW_AGCY_006 | Modal | Low | Dùng chung component với AW_FEPL_006 |

## Decision Table — bảng 担当者 (AW_AGCY_002 Section 3)

| # | Số dòng | 区分 các dòng | Email | Kết quả mong đợi |
|---|---|---|---|---|
| T1 | 1 | Main | duy nhất | Lưu OK |
| T2 | 2 | Main + Sub | khác nhau | Lưu OK |
| T3 | 2 | Main + Main | khác nhau | NG — E-056 「メイン担当者は1名のみ登録できます。」 |
| T4 | 2 | Main + Sub | **trùng nhau** | NG — E-055 「このメールアドレスは既に登録されています。」 |
| T5 | 1 | Sub (không có Main) | duy nhất | **Chưa rõ** — Figma không quy định → tag `[UNCONFIRMED]` |
| T6 | 2 | Main + Sub | — | Icon 🗑 dòng Main **disable**, dòng Sub **xóa ngay không dialog** |

## Boundary Value Analysis — trường có MIN/MAX

| Trường | MIN | MAX | Test biên |
|---|---|---|---|
| 代理店名 | 1 | 50 | trống · 1 · 50 · 51 |
| 代理店名カナ | 1 | 50 (全角) | trống · 50 · 51 · `ﾊﾝｶｸ` |
| 電話番号 | 10 | 11 | trống · 9 · 10 · 11 · 12 · chữ |
| FAX番号 | 0 | 11 | trống (OK) · 9 · 11 · 12 |
| 郵便番号 | 7 | 7 | trống · 6 · 7 · 8 · `9999999` (không tồn tại) |
| 市区町村 / 町域・番地 | 1 | 255 | trống · 255 · 256 |
| 建物・部屋番号 / 備考 | 0 | 255 | trống (OK) · 255 · 256 |
| 担当者名 | 1 | 50 | trống · 50 · 51 |
| フリガナ | 0 | 50 | trống (OK) · 50 · 51 · `ﾊﾝｶｸ` |
| メールアドレス | 1 | 256 | trống · sai format · 256 · 257 · trùng |

## Component Map

| Screen | Component | Component Type | Risk | Technique | Ghi chú phụ thuộc |
|---|---|---|---|---|---|
| AW_AGCY_001 | Nút ＋新規登録 / CSV出力 | Button | Medium | — | AC-01; CSV = **xuất** (AMB-01) |
| AW_AGCY_001 | Khu vực tìm kiếm (3 điều kiện) | Filter | Medium | EP | Kết hợp text + 2 dropdown |
| AW_AGCY_001 | 紹介合計数 | Data display | **High** | EP | Đếm TẤT CẢ, bất kể trạng thái |
| AW_AGCY_001 | 支払対象数 | Data display | **High** | EP | Active AND kỳ hạn chưa hết → liên quan AMB-03 |
| AW_AGCY_001 | 現在契約中 | Data display | **High** | EP | Chỉ hợp đồng active |
| AW_AGCY_001 | ステータス badge | Data display | Low | EP | 有効 xanh lá / 無効 đỏ |
| AW_AGCY_001 | Icon ✏ / 🗑 | Button | Medium | — | 🗑 ẩn ở dòng đã xóa (AMB-08) |
| AW_AGCY_002 | 17 trường Section 1 | Input | **High** | BVA | 郵便番号 → tự điền 3 trường |
| AW_AGCY_002 | Section 2 gói phí | Dropdown + 4 read-only | **High** | Decision Table | Chỉ 有効 + 代理店紹介 (AC-06) |
| AW_AGCY_002 | Section 3 担当者 | Table input | **High** | Decision Table | T1–T6 ở trên |
| AW_AGCY_002 | Nút 登録 / キャンセル | Button | **High** | — | → AW_AGCY_006 khi đã nhập |
| AW_AGCY_003 | Delta so với 002 | Form | Medium | — | 備考 sửa được · 3 tab · ID đã cấp |
| AW_AGCY_004 | 3 section read-only | Data display | Medium | — | — |
| AW_AGCY_004 | Tab 紹介履歴 (11 cột) | Data display | **High** | EP | Read-only, không cột thao tác |
| AW_AGCY_004 | Tab 支払履歴 (11 cột) | Data display | **High** | EP | Không có dòng tổng cộng |
| AW_AGCY_004 | Tab 変更履歴 (3 cột) | Data display | Medium | EP | Format log theo loại thao tác |
| AW_AGCY_005 | Popup 削除確認 | Modal | Medium | Decision Table | Guard 2 nguồn tham chiếu |
| AW_AGCY_006 | Popup 編集破棄 | Modal | Low | — | Verify điểm vào, logic đã test ở AW_FEPL_006 |

## Ước lượng

| Screen | UI | Happy | Validation | Logic/Guard | Tổng |
|---|---|---|---|---|---|
| AW_AGCY_001 | 1 | 8 | 0 | 12 | 21 |
| AW_AGCY_002 | 1 | 5 | 30 | 12 | 48 |
| AW_AGCY_003 | 1 | 5 | 2 | 8 | 16 |
| AW_AGCY_004 | 1 | 6 | 0 | 14 | 21 |
| AW_AGCY_005 | 1 | 2 | 0 | 4 | 7 |
| AW_AGCY_006 | 1 | 2 | 0 | 2 | 5 |
| **Tổng** | 6 | 28 | 32 | 52 | **118** |

Mọi sheet ≤ 96 dòng → khớp giới hạn template.
