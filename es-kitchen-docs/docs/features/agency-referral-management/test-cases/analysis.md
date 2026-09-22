# Requirement Analysis — Quản lý Đại lý & Giới thiệu

> Feature: `agency-referral-management` · Ngày: 2026-09-22 · QC: ngaht@dipro.vn
> Nguồn: `SPEC.md` (100% trích Figma node `29419:267328`) + Figma Flow Tổng Quan `32110:403829` + Figma Screen Flow `32119:174894`
> Platform: **Web (desktop 1440×1024)** · Actor: **E03 System Admin** + **System (Batch)**

---

## Summary

| Hạng mục | Giá trị |
|---|---|
| Platform | Web — `es-kitchen-web-admin` (E03) |
| Viewport chuẩn | 1440×1024 (Figma không cung cấp breakpoint mobile/tablet) |
| Số module | 4 — `AW_FEPL` · `AW_AGCY` · `AW_REFE` · `AW_FEPA` |
| Số screen | 24 (17 màn chính + 7 modal) |
| Số AC | 17 (AC-01 … AC-17) |
| Số error display | 74 (`E-001` … `E-074`) |
| Ngôn ngữ TC | Tiếng Việt, giữ nguyên thuật ngữ JP gốc |

**Đặc thù cần lưu ý khi test:**

1. `AW_FEPA_*` là bản ghi **do batch sinh** — không có luồng tạo mới / xóa thủ công. Test phải chuẩn bị dữ liệu bằng cách chạy batch hoặc seed DB.
2. `AW_FEPA_002/003` sau khi lưu **giữ nguyên màn chỉnh sửa**, khác 3 module còn lại (quay về danh sách). Đây là hành vi **có chủ đích** theo SPEC RQ-047 — không phải bug.
3. Error message **trộn 2 ngôn ngữ** (phần lớn JP, một số VN). QC ghi nhận đúng nguyên văn trong Expected Result, không tự dịch.
4. Nhiều ô trống mang **ngữ nghĩa**: `終了予定月` trống = vĩnh viễn · `終了月` trống = đang tiếp diễn · `支払日` trống = chưa thanh toán.

---

## Q&A — Ambiguities

### Đã resolve (user chốt 2026-09-22) — dùng trực tiếp làm cơ sở sinh TC, KHÔNG tag `[UNCONFIRMED]`

| ID | Ambiguity | Severity | Quyết định |
|---|---|---|---|
| AMB-01 | `CSV出力` ở `AW_AGCY_001`: nhãn = xuất, mô tả Figma = nhập | **High** (nghiệp vụ dữ liệu) | **XUẤT CSV** — tải xuống theo điều kiện lọc hiện tại, đồng nhất `AW_REFE_001` / `AW_FEPA_001`. Không sinh TC import. |
| AMB-02 | `算定合計額` đã gồm thuế hay chưa | **High** (tiền) | **Đã gồm thuế (税込)** — không có field thuế suất / số tiền chưa thuế. Không sinh TC tính thuế riêng. |
| AMB-03 | Trạng thái sau khi kỳ hạn thanh toán mãn hạn | **High** (tiền) | `ステータス` **tự chuyển** `契約中` → `満了`; batch **ngừng sinh** `支払履歴` từ tháng kế tiếp. |
| AMB-04 | Nút bị chặn quyền: ẩn hay disable | **High** (phân quyền) | **Ẩn hoàn toàn** — nút không render; truy cập thẳng URL màn đăng ký/sửa cũng phải bị chặn. |

### Còn mở — TC liên quan được tag `[UNCONFIRMED]`

| ID | Ambiguity | Severity | Xử lý trong bộ TC |
|---|---|---|---|
| AMB-05 | `No` có đánh liên tục xuyên trang không (OQ-01) | Medium | Sinh TC theo giả định **có** đánh liên tục, tag `[UNCONFIRMED]` |
| AMB-06 | Danh sách lựa chọn dropdown số dòng/trang (OQ-02) | Low | Chỉ test giá trị mặc định `10件/ページ`, tag `[UNCONFIRMED]` cho TC đổi số dòng |
| AMB-07 | Điều kiện hiển thị nút `CSV出力` ở `AW_REFE_001` / `AW_FEPA_001` (OQ-04) | Medium | Test nút hiển thị với System Admin đầy đủ quyền, tag `[UNCONFIRMED]` |
| AMB-08 | Bản ghi đại lý đã xóa có hiển thị trong danh sách không (OQ-05) | Medium | Sinh TC kiểm tra icon 🗑 bị ẩn ở dòng đã xóa (theo Figma), tag `[UNCONFIRMED]` phần hiển thị |
| AMB-09 | Khóa sắp xếp của `AW_AGCY_001` (OQ-06) | Medium | Test 5 khóa Figma đề xuất, tag `[UNCONFIRMED]` |
| AMB-10 | Filter `支払区分` 2 giá trị có đồng bộ Master phí 3 giá trị không (OQ-07) | Medium | Test với 2 giá trị `単発` / `連続`, tag `[UNCONFIRMED]` |
| AMB-11 | Định nghĩa mã gói phí dạng `{mã}：{tên}` (OQ-08) | Medium | Chỉ verify format hiển thị, không verify quy tắc sinh mã, tag `[UNCONFIRMED]` |
| AMB-12 | Đổi `紹介元区分` có xóa gói phí Section 2 không (OQ-11) | Medium | Sinh 1 TC quan sát hành vi, tag `[UNCONFIRMED]` |
| AMB-13 | Nhãn panel 2.6 hiển thị sai `月次提供回の金額` (OQ-12) | Medium | **Sinh TC fail có chủ đích** — Expected Result ghi nhãn ĐÚNG là `請求額割合`; Figma tự ghi «実装バグとして修正が必要» |
| AMB-14 | Message `必須項目が全て入力済みであるこ` bị cắt cụt (OQ-15) | Medium | Sinh TC verify message, ghi chú chuỗi hiện tại sai chính tả |
| AMB-15 | Ngưỡng MIN/MAX đánh dấu `（提案／要確認）` (OQ-13) | Medium | Test theo ngưỡng Figma đề xuất, tag `[UNCONFIRMED]` |
| AMB-16 | Figma KHÔNG định nghĩa ③ Network · ④ Server error · ⑤ Empty state cho 4 màn danh sách chính (OQ-14) | **High** (coverage) | **KHÔNG sinh TC** cho 3 nhóm này — không có expected result để đối chiếu. Ghi vào mục "Gap coverage" cuối file. |

---

## Acceptance Criteria — Mapping

| AC | Nội dung tóm tắt | Status | Module liên quan | Screen |
|---|---|---|---|---|
| AC-01 | Phân quyền hiển thị Create/Update/Delete (ẩn hoàn toàn) | **Confirmed** (AMB-04) | Tất cả | 17 màn chính |
| AC-02 | Hành vi lưu & hủy chung cho mọi màn Form | Confirmed | Tất cả | 8 Form + 7 Modal |
| AC-03 | Fee Plan `無効` bị loại khỏi dropdown mới, không ảnh hưởng dữ liệu cũ | Confirmed | FEPL | AW_FEPL_002/003 |
| AC-04 | Không xóa Fee Plan đang được tham chiếu | Confirmed | FEPL | AW_FEPL_001/004/005 |
| AC-05 | 3 phương pháp tính + panel loại trừ + validation số tiền/bậc/tỷ lệ | Confirmed | FEPL | AW_FEPL_002/003 |
| AC-06 | Dropdown gói phí chỉ `有効` + `代理店紹介`; 4 ô read-only tự điền | Confirmed | AGCY | AW_AGCY_002/003 |
| AC-07 | Chỉ 1 Main admin; email không trùng; xóa Sub không dialog | Confirmed | AGCY | AW_AGCY_002/003 |
| AC-08 | Màn chi tiết 3 tab read-only; empty state; guard xóa đại lý | Confirmed | AGCY | AW_AGCY_004 |
| AC-09 | Ràng buộc nguồn giới thiệu & hợp đồng 1-1 | Confirmed | REFE | AW_REFE_001/002 |
| AC-10 | `支払い開始年月` ≥ `契約開始年月` | Confirmed | REFE | AW_REFE_002/003/004 |
| AC-11 | Guard xóa lịch sử giới thiệu (契約中 / đã có 支払履歴) | Confirmed | REFE | AW_REFE_001/006 |
| AC-12 | `処理方法` mặc định theo `支払先区分`; chặn sửa bản ghi `支払済み`; lưu xong giữ màn | Confirmed | FEPA | AW_FEPA_001/002/003 |
| AC-13 | 3 trạng thái thanh toán; tự set `支払日` | Confirmed | FEPA | AW_FEPA_002/003 |
| AC-14 | Chỉ `調整額` nhập được; phạm vi ±9.999.999; real-time tính tổng | Confirmed | FEPA | AW_FEPA_002/003 |
| AC-15 | Quy tắc sinh ID (RFP / AG / REF / FP) | Confirmed | Tất cả | 4 màn List + 4 màn Form |
| AC-16 | Phân trang: format, điều hướng, mặc định 10 dòng | **Assumed** (AMB-05, AMB-06) | Tất cả | 4 màn List |
| AC-17 | Tự điền địa chỉ từ 郵便番号; tự sinh カナ/フリガナ | Confirmed | AGCY | AW_AGCY_002/003 |

**Thống kê:** 15 Confirmed · 1 Assumed · 0 TBD · 4 ambiguity High đã resolve.

---

## Screen Inventory

| # | Screen Code | Tên | Archetype | Module | Số error display | Sheet xlsx |
|---|---|---|---|---|---|---|
| 1 | AW_FEPL_001 | 紹介フィーマスタ（一覧） | List | fee-plan | 1 | `AW_FEPL_001` |
| 2 | AW_FEPL_002 | 紹介フィーマスタ登録 | Form | fee-plan | 19 | `AW_FEPL_002` |
| 3 | AW_FEPL_003 | 紹介フィーマスタ編集 | Form | fee-plan | 19 (reuse) | `AW_FEPL_003` |
| 4 | AW_FEPL_004 | 紹介フィーマスタ詳細 | Detail | fee-plan | 2 | `AW_FEPL_004` |
| 5 | AW_FEPL_005 | 削除確認 | Modal | fee-plan | 3 | `AW_FEPL_005` |
| 6 | AW_FEPL_006 | 編集破棄 | Modal | fee-plan | 0 | `AW_FEPL_006` |
| 7 | AW_AGCY_001 | 代理店マスタ（一覧） | List | agency | 2 | `AW_AGCY_001` |
| 8 | AW_AGCY_002 | 代理店登録 | Form | agency | 30 | `AW_AGCY_002` |
| 9 | AW_AGCY_003 | 代理店情報編集 | Form | agency | 31 (reuse) | `AW_AGCY_003` |
| 10 | AW_AGCY_004 | 代理店情報詳細 (3 tab) | Detail | agency | 2 | `AW_AGCY_004` |
| 11 | AW_AGCY_005 | 削除確認 | Modal | agency | 2 | `AW_AGCY_005` |
| 12 | AW_AGCY_006 | 編集破棄 | Modal | agency | 0 | `AW_AGCY_006` |
| 13 | AW_REFE_001 | 紹介履歴一覧 | List | referral | 2 | `AW_REFE_001` |
| 14 | AW_REFE_002 | 紹介履歴登録 | Form | referral | 9 | `AW_REFE_002` |
| 15 | AW_REFE_003 | 紹介履歴編集（代理店） | Form | referral | 11 (reuse) | `AW_REFE_003` |
| 16 | AW_REFE_004 | 紹介履歴編集（法人） | Form | referral | 11 (reuse) | `AW_REFE_004` |
| 17 | AW_REFE_005 | 紹介履歴詳細 | Detail | referral | 1 | `AW_REFE_005` |
| 18 | AW_REFE_006 | 削除確認 | Modal | referral | 1 | `AW_REFE_006` |
| 19 | AW_REFE_007 | 編集破棄 | Modal | referral | 0 | `AW_REFE_007` |
| 20 | AW_FEPA_001 | 支払履歴一覧 | List | fee-payment | 2 | `AW_FEPA_001` |
| 21 | AW_FEPA_002 | フィー支払履歴編集（代理店） | Form | fee-payment | 6 | `AW_FEPA_002` |
| 22 | AW_FEPA_003 | フィー支払履歴編集（法人） | Form | fee-payment | 6 (reuse) | `AW_FEPA_003` |
| 23 | AW_FEPA_004 | フィー支払履歴詳細 | Detail | fee-payment | 2 | `AW_FEPA_004` |
| 24 | AW_FEPA_005 | 編集破棄 | Modal | fee-payment | 0 | `AW_FEPA_005` |

---

## Test Data Reference (dùng chung 4 module)

> Dữ liệu cụ thể, không placeholder. Môi trường: **DEV**. Không dùng dữ liệu production.

### Tài khoản test

| Role | Email | Quyền | Mục đích |
|---|---|---|---|
| Full admin | `qc_admin_full@estest.local` | Create + Update + Delete | Happy path toàn bộ |
| Read-only | `qc_admin_read@estest.local` | Không có C/U/D | Verify AC-01 — nút bị **ẩn hoàn toàn** |
| Create-only | `qc_admin_create@estest.local` | Chỉ Create | Verify ẩn icon ✏ và 🗑 |
| Update-only | `qc_admin_update@estest.local` | Chỉ Update | Verify ẩn nút ＋新規登録 và icon 🗑 |

### Master phí giới thiệu (`AW_FEPL`)

| ID | Tên gói | 紹介元区分 | 支払区分 | 算定方法 | Giá trị | 状態 | Dùng cho |
|---|---|---|---|---|---|---|---|
| `RFP000001` | 代理店紹介A（固定額） | 代理店 | 単発 | 固定額 | 33,000円 | 有効 | Happy path gán đại lý |
| `RFP000002` | 代理店紹介B（月次） | 代理店 | 継続（ヶ月） | 月次提供回の金額 | 3 bậc | 有効 | Test bảng bậc số lượng |
| `RFP000003` | 代理店紹介C（割合） | 代理店 | 継続（永続） | 請求額割合 | 10% · 切り捨て | 有効 | Test tỷ lệ + xử lý số lẻ |
| `RFP000004` | 法人紹介D | 法人 | 単発 | 固定額 | 20,000円 | 有効 | Verify KHÔNG hiện ở dropdown AW_AGCY_002 |
| `RFP000005` | 旧プラン（無効） | 代理店 | 単発 | 固定額 | 15,000円 | **無効** | Verify AC-03 — bị loại khỏi dropdown |
| `RFP000006` | 未使用プラン | 代理店 | 単発 | 固定額 | 10,000円 | 有効 | Gói **chưa** được tham chiếu → xóa được |

**Bậc số lượng của `RFP000002`:** 1–100 → 5,000円 · 101–500 → 12,000円 · 501–(trống) → 25,000円

### Master đại lý (`AW_AGCY`)

| ID | 代理店名 | カナ | 紹介フィープラン | ステータス | Dùng cho |
|---|---|---|---|---|---|
| `AG00001` | 株式会社ネクストパートナーズ | カブシキガイシャネクストパートナーズ | `RFP000001` | 有効 | Happy path · có 紹介履歴 → **không xóa được** |
| `AG00002` | 株式会社スマートコネクト | カブシキガイシャスマートコネクト | `RFP000002` | 有効 | Test tab 紹介履歴 / 支払履歴 |
| `AG00003` | 株式会社オフィスサポート | カブシキガイシャオフィスサポート | `RFP000003` | **無効** | Verify badge đỏ + không hiện ở dropdown AW_REFE_002 |
| `AG00099` | テスト削除用代理店 | テストサクジョヨウダイリテン | `RFP000006` | 有効 | **Chưa** có 紹介履歴 / 支払履歴 → xóa được |

**Địa chỉ chuẩn dùng test tự điền:** `郵便番号 = 1000005` → 東京都 / 千代田区 / 丸の内
**Mã bưu điện không tồn tại:** `9999999`
**Người phụ trách `AG00001`:** Main `山田 太郎` / `ヤマダ タロウ` / `taro.yamada@example.jp` / `090-1234-5678`; Sub `佐藤 花子` / `サトウ ハナコ` / `hanako.sato@example.jp` / `080-2345-6789`

### Lịch sử giới thiệu (`AW_REFE`)

| ID | 紹介元区分 | 紹介元 | 契約ID | 紹介先法人 | ステータス | Dùng cho |
|---|---|---|---|---|---|---|
| `REF000008` | 代理店 | `AG00001` | `CP000001` | `CU123466` ABCフーズ株式会社 | 契約中 | **Không xóa được** (契約中) |
| `REF000009` | 代理店 | `AG00001` | `CP000002` | `CU123467` 東京ベント株式会社 | 満了 | Đã có 支払履歴 → **không xóa được** |
| `REF000010` | 法人 | `CU123468` 大阪デリ有限会社 | `CP000003` | `CU123469` 福岡支店 | 途中解約 | Test AW_REFE_004 (nguồn = 法人) |
| `REF000099` | 代理店 | `AG00099` | `CP000099` | `CU123499` テスト法人 | 途中解約 | Chưa có 支払履歴 → **xóa được** |

**Hợp đồng chưa liên kết (dùng đăng ký mới):** `CP000010` · `CP000011`
**Hợp đồng đã liên kết (test trùng):** `CP000001`
**Năm tháng:** 契約開始 `2026年09月` · 支払い開始 hợp lệ `2026年09月` · không hợp lệ `2026年08月`

### Lịch sử thanh toán (`AW_FEPA`)

| ID | 支払対象月 | 支払先区分 | 支払先 | 支払状況 | Dùng cho |
|---|---|---|---|---|---|
| `FP202608-0001` | 2026年08月 | 代理店 | `AG00001` | 未払い | Happy path AW_FEPA_002 — sửa được |
| `FP202608-0002` | 2026年08月 | 法人 | `CU123468` | 未払い | Happy path AW_FEPA_003 |
| `FP202607-0001` | 2026年07月 | 代理店 | `AG00002` | **支払済み** | Verify chặn sửa (E-069) |
| `FP202607-0002` | 2026年07月 | 代理店 | `AG00003` | 対象外 | Verify ẩn `支払日` + disable `調整額` |

**Giá trị `調整額` dùng test biên:** `0` · `-2800` · `9999999` · `-9999999` · `10000000` (ngoài phạm vi) · `-10000000` (ngoài phạm vi) · `1.5` (thập phân) · `１０００` (toàn chiều rộng → phải tự chuyển `1000`)

### Chuỗi test độ dài (dùng chung)

| Mục đích | Giá trị |
|---|---|
| 50 ký tự (biên trên hợp lệ) | `あ` × 50 |
| 51 ký tự (vượt biên) | `あ` × 51 |
| 255 ký tự (biên trên hợp lệ) | `A` × 255 |
| 256 ký tự (vượt biên) | `A` × 256 |
| 256 ký tự email hợp lệ | `a` × 244 + `@estest.local` |
| 257 ký tự email (vượt biên) | `a` × 245 + `@estest.local` |
| Katakana nửa chiều rộng (không hợp lệ) | `ﾔﾏﾀﾞ ﾀﾛｳ` |
| Số toàn chiều rộng (phải auto-convert) | `０９０－１２３４－５６７８` |

---

## Gap coverage — KHÔNG sinh TC (thiếu nguồn)

> Ghi nhận minh bạch để PM/BrSE biết bộ TC này **chưa** phủ phần nào, và vì sao.

| Nhóm | Phạm vi | Lý do |
|---|---|---|
| ③ Network (mất mạng, timeout) | Toàn bộ 24 màn | Figma không định nghĩa hành vi/message nào → không có Expected Result để đối chiếu (OQ-14 / AMB-16) |
| ④ Server error (500, maintenance) | Toàn bộ 24 màn | Như trên |
| ⑤ Empty state màn danh sách chính | `AW_FEPL_001` · `AW_AGCY_001` · `AW_REFE_001` · `AW_FEPA_001` | Figma chỉ định nghĩa empty message cho **tab** trong `AW_AGCY_004` (`表示するデータがありません。`), không cho 4 màn danh sách |
| Responsive mobile / tablet | Toàn bộ | Figma chỉ có viewport 1440×1024 |
| Batch job (lịch chạy, retry, cảnh báo lỗi) | `AW_FEPA` | SPEC `## Out of Scope` — Figma chỉ mô tả kết quả batch |
| Màn đích của text link | Chi tiết hợp đồng · chi nhánh · pháp nhân | Thuộc domain khác, ngoài scope SPEC này |

**Khuyến nghị:** thống nhất pattern chung cho ③④⑤ ở tầng hệ thống admin (1 lần cho toàn bộ E03), sau đó bổ sung ~30 TC vào bộ này.

---

## Bước tiếp theo

`/test/plan-tcs` cho từng module: `fee-plan` → `agency` → `referral` → `fee-payment`
