# TC Implementation Plan: delivery-ops (Delivery Partner Portal E05 P2)

> Nguồn: `analysis.md` v1.1 (36 AC gồm 3 AC mới · 11 AMB, 4 High đã chốt) + Figma canvas `Delivery (P2)`.
> Platform: **Web desktop 1440×1024** → áp `testing_dimensions` section Web.

---

## OW_DLVR_001 — 配送管理一覧

- **Archetype:** List/Search + Filter + Pagination
- **Chiến lược Test Case:**
  - Kỳ tìm kiếm mặc định (AC-23) là hành vi dễ bị làm sai nhất: **hôm nay → ngày cuối tháng đó** (khác `OW_CLCT_001` là ngày 1 → cuối tháng) → TC phải chạy ở nhiều mốc ngày trong tháng, đặc biệt ngày cuối tháng.
  - Bộ lọc 11 điều kiện chia 2 tầng accordion → test điều kiện ẩn vẫn được áp khi thu gọn; test `クリア` reset **toàn bộ** về mặc định chứ không phải xoá trắng (AC-24).
  - AC-25 là negative đảo ngược: đơn chưa gán tài xế → 2 cột **để trống**, KHÔNG hiển thị chữ `未割当` — dev rất dễ tự thêm chữ.
  - `送り状No` nhiều giá trị → rút gọn `N…` + tooltip; cần test data 1 mã / nhiều mã / rất nhiều mã.
  - Phân trang (AC-26): BVA ở 0 bản ghi, đúng 10, 11 bản ghi và trang cuối.
- **UI chung:** Sidebar + breadcrumb → thanh tìm kiếm 2 tầng → bảng 12 cột (cuộn ngang) → phân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Date range `期間検索` (S.1) | Date picker (range) | High | BVA (mặc định / đầu tháng / cuối tháng / start > end) | Mặc định = hôm nay → cuối tháng đó |
| Radio `配送日（着）` (S.2) | Radio | Low | — | Chỉ 1 lựa chọn cố định |
| Nút sắp xếp `配送日（着）` (S.3) | Button (sort) | Medium | State Transition (tăng ⇄ giảm) | — |
| `拠点ID・名` (S.4) | Textbox | Medium | EP (khớp gần đúng) + Security | Chỉ hiện khi mở rộng |
| Địa chỉ / 郵便番号 / SĐT (S.5) | Textbox | Medium | EP (khớp gần đúng) | Chỉ hiện khi mở rộng |
| `荷物温度帯` (S.6) | Dropdown | Medium | — | 3 giá trị |
| `ステータス` (S.7) | Dropdown | Medium | — | 5 giá trị |
| `自販機` (S.8) | Dropdown | Low | — | 2 giá trị |
| `配送方法` (S.9) | Dropdown | Low | — | `ES配送` / `COOL便` |
| `配送元` (S.10) | Textbox | Low | EP (khớp gần đúng) | — |
| 送り状/スタッフ (S.11) | Textbox | Medium | EP (khớp gần đúng) | — |
| Nút `クリア` (S.12) | Button | High | — | **Reset về MẶC ĐỊNH, không phải xoá trắng** |
| Nút `検索` (S.13) | Button | High | — | Phụ thuộc toàn bộ S.1–S.11 |
| Cột `配送No` (link) (L.4) | Link | High | — | → `OW_DLVR_002` |
| Cột `配送スタッフID` / `名` (L.8 / L.9) | Text | High | EP (đã gán / chưa gán) | **Chưa gán → ĐỂ TRỐNG (AC-25)** |
| Cột `送り状No` (L.10) | Text + Tooltip | Medium | BVA (1 / nhiều / rất nhiều mã) | Rút gọn `N…` + tooltip |
| Cột `配送状況` (L.11) | Badge | Medium | — | 5 giá trị master |
| Phân trang (P.1–P.3) | Pagination | High | BVA (0 / 10 / 11 / trang cuối) | `件数/ページ` options → `[UNCONFIRMED]` (AMB-19) |

---

## OW_DLVR_002 — 配送詳細 (4 tab)

- **Archetype:** Detail (tab-based) + Form nhúng (gán tài xế) + File upload
- **Chiến lược Test Case:**
  - **Màn rủi ro cao nhất toàn feature.** Chia test theo 4 tab, mỗi tab 1 nhóm TC, cộng thêm nhóm TC liên tab (giữ state khi chuyển tab, deep-link `?tab=`).
  - **Rule khoá 7 ngày (AC-30, đã chốt AMB-11)**: mốc `発送予定日`, **BE chặn**, khoá cả form → bắt buộc Boundary Tier ngày 6 / 7 / 8 **và** 1 TC bảo mật gọi thẳng API để xác nhận BE chặn thật, không chỉ FE disable.
  - Gán tài xế (AC-27/28/29): dropdown chỉ liệt kê tài xế `有効` + hiển thị số đơn **của đúng ngày giao đơn đang mở** → cần test data 2 tài xế có/không có đơn trong ngày đó, và 1 tài xế `無効` để xác nhận không xuất hiện.
  - Upload tài liệu 非公開: Boundary Tier ở **20 file** (19 / 20 / 21) và **5MB** (4.9MB / 5MB / 5.1MB), cộng test định dạng sai.
  - Tab 実績 là **integration point với Driver App** → áp đủ 4 loại TC integration (pass-through / transformation / invalid-boundary / consistency); công thức `差異` và `誤差` phải test cả giá trị âm.
  - Tab 添付資料 thiếu bảng 画面設計書 → toàn bộ TC tab này tag `[UNCONFIRMED]` (AMB-16).
- **UI chung:** Sidebar + header (tiêu đề `配送No` + badge `⚠未設定` + khối chọn tài xế) → thanh 4 tab: `配送概要` · `配送住所` · `実績` · `添付資料`.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Badge `⚠未設定` (H.1) | Badge | High | State Transition (hiện ⇄ ẩn) | **Phụ thuộc H.2/H.4 — ẩn ngay sau khi gán** |
| Dropdown `配送スタッフ` (H.2) | Dropdown (có search) | High | Decision Table (trạng thái tài xế × có đơn trong ngày) | Chỉ liệt kê `有効`; hiện số đơn theo `配送日` của đơn đang mở |
| Nút `キャンセル` (H.3) | Button | High | — | Quay về trạng thái tài xế TRƯỚC ĐÓ, không lưu |
| Nút `確定` (H.4) | Button | High | — | → toast `「配送スタッフ設定完了しました。」` |
| Nút `編集` + rule 7 ngày | Button | **High** | **Boundary Tier (6 / 7 / 8 ngày)** | **Mốc `発送予定日`; BE chặn; khoá CẢ FORM (AC-30)** |
| Tab 配送概要 — A.1–A.9 | Text (read-only) | Medium | — | Toàn bộ chỉ đọc |
| Tab 配送住所 — B.1 / B.2 địa chỉ | Text (read-only) | Low | — | Chỉ đọc (AC-38) |
| Tài liệu `公開` (B.2.1) | File list (read-only) | High | — | **KHÔNG có nút thêm/xoá; không có menu ︙ (AC-31/34)** |
| Tài liệu `非公開` (B.2.2) | File list (editable) | High | Boundary Tier (19 / 20 / 21 file) | Xoá KHÔNG có dialog xác nhận |
| Nút `ファイルを追加` (B.2.3) | File Upload | High | Boundary Tier (5MB) + EP (định dạng) | JPG/JPEG/PNG · ≤5MB · message đang tiếng Việt → `[UNCONFIRMED]` (AMB-21) |
| Tab 実績 — summary 廃棄/理論/実在 | Number (read-only) | High | — | Tự tổng hợp từ bảng bên dưới |
| Tab 実績 — `差異` | Number (computed) | High | **Transformation** (`理論在庫 − 実在庫`) | **Integration Driver App**; test cả giá trị âm |
| Tab 実績 — bảng 廃棄数確認 | Table (read-only) | High | — | Integration pass-through |
| Tab 実績 — ô `廃棄数` tô đỏ | Visual rule | Medium | BVA (0 / 1) | Tô đỏ khi > 0 (AC-37) |
| Tab 実績 — ô `賞味期限` tô đỏ | Visual rule | Medium | — | Ngưỡng "gần hết hạn" → `[UNCONFIRMED]` (AMB-15) |
| Tab 実績 — `誤差` | Number (computed) | High | **Transformation** (`予定数 − 実際数`) | Tô đỏ khi ≠ 0 |
| Tab 添付資料 — 駐車報告 / 集金報告 | Unknown | Medium | — | **Toàn bộ `[UNCONFIRMED]` (AMB-16)**; nguồn số tiền cho `OW_CLCT_001` |
| Thanh tab (4 tab) | Tab | Medium | State Transition | Deep-link `?tab=`; giữ state khi chuyển tab |

---

## OW_DLVR_003 — ファイルビューア (Modal)

- **Archetype:** Modal (viewer)
- **Chiến lược Test Case:**
  - Khác biệt cốt lõi: **menu ︙ (xoá) CHỈ có ở nhóm 非公開** (AC-34) → Decision Table theo nhóm file × hành động.
  - PDF **không preview** và nút zoom **disabled** (AC-35) → tách hẳn TC ảnh vs TC PDF, không gộp.
  - Điều hướng `＜ ＞` chỉ chạy **trong cùng nhóm** → test ở file đầu / file cuối của mỗi nhóm để xác nhận không tràn sang nhóm kia.
  - Xoá KHÔNG có dialog xác nhận → 1 TC ghi nhận rủi ro thao tác 2 click là mất file.
- **UI chung:** Modal full-width phủ lên `OW_DLVR_002`: thanh công cụ trên, vùng preview giữa, pager dưới, nút `＜ ＞` hai bên.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút `ダウンロード` | Button | Medium | — | Tooltip `ダウンロード` |
| Nút `拡大` / `縮小` | Button | Medium | EP (ảnh / PDF) | **PDF → disabled (AC-35)** |
| Menu `︙` → `削除` | Dropdown menu | High | Decision Table (公開 × 非公開) | **Chỉ hiện ở 非公開; KHÔNG có dialog xác nhận** |
| Nút `＜` / `＞` | Button | High | BVA (file đầu / cuối nhóm) | Chỉ chuyển trong cùng nhóm |
| Pager `1/6` | Text | Low | — | Cập nhật theo điều hướng |
| Nút `×` | Button | Medium | — | → về `OW_DLVR_002` tab 配送住所 |
| Vùng preview PDF | Viewer | Medium | — | Không preview, chỉ hiện dung lượng + nút tải |

---

## OW_CLCT_001 — 集金管理（集金・駐車）

- **Archetype:** Report (aggregate + export)
- **Chiến lược Test Case:**
  - Kỳ mặc định **ngày 1 → ngày cuối tháng hiện tại** (AC-39) — khác `OW_DLVR_001`, phải test riêng để bắt lỗi dev dùng nhầm default.
  - 2 summary tính trên **toàn bộ kết quả tìm kiếm** chứ không phải trang hiện tại (AC-40) → TC bắt buộc: tạo dữ liệu >10 dòng, so tổng summary với tổng thủ công toàn bộ, KHÔNG so với tổng trang 1.
  - **CSV (AC-41/42, đã chốt AMB-12 = lấy theo Figma)**: verify đủ 3 thứ — tên file đúng mẫu, đúng **7 cột mới**, và **1 dòng = 1 配送** (khác bảng màn hình 1 dòng = 1 tài xế). Thêm 1 TC regression xác nhận **bộ cột CŨ không còn xuất hiện**.
  - Test CSV mở bằng Excel tiếng Nhật để bắt lỗi encoding (UTF-8 BOM).
- **UI chung:** Sidebar + header (tiêu đề + nút `CSV出力` góc phải) → thanh tìm kiếm → 2 thẻ summary → bảng theo tài xế → phân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút `CSV出力` (H.1) | Button (export) | **High** | Decision Table (có/không lọc tài xế) | **7 cột theo Figma; 1 dòng = 1 配送 (AC-42)** |
| Date range `期間検索` (S.1) | Date picker (range) | High | BVA (mặc định / start > end / kỳ rất dài) | Mặc định = ngày 1 → cuối tháng hiện tại |
| `配送スタッフID・名` (S.2) | Textbox | Medium | EP (khớp gần đúng) | Ảnh hưởng phần `{配送スタッフ検索条件}` trong tên file CSV |
| Nút `クリア` (S.3) | Button | Medium | — | — |
| Nút `検索` (S.4) | Button | High | — | **Cập nhật lại T.1 / T.2** |
| Summary `集金合計金額` (T.1) | Number (aggregate) | **High** | — | **Tính trên TOÀN BỘ kết quả, không chỉ trang hiện tại** |
| Summary `駐車合計料金` (T.2) | Number (aggregate) | **High** | — | Cùng phạm vi tính với T.1 |
| Cột `配送スタッフ名` (link) (L.3) | Link | High | — | → `OW_STAF_003` tab 担当配送情報 |
| Cột `集金合計金額` (L.4) | Number | High | — | **Integration**: cộng dồn từ tab 添付資料 của `OW_DLVR_002` |
| Cột `駐車合計料金` (L.5) | Number | High | — | Cùng nguồn với L.4 |
| Phân trang (P.1–P.3) | Pagination | Medium | BVA (0 / 10 / 11) | — |

---

## OW_STAF_001 — 配送スタッフ一覧

- **Archetype:** List/Search + Bulk action
- **Chiến lược Test Case:**
  - Checkbox + nút `アカウント一括発行` là cặp phụ thuộc chặt (AC-44) → Decision Table theo số dòng chọn (0 / 1 / nhiều / chọn tất cả).
  - Badge trạng thái 5 giá trị đúng màu (AC-49) → 1 TC/giá trị, không gộp; riêng `削除済` màu chưa chốt → `[UNCONFIRMED]` (AMB-19).
  - Cột `アカウント状態` chỉ 2 giá trị (AC-50) → test cả 2 + verify chuyển `未発行` → `発行済み` sau khi phát hành thành công (liên màn với `OW_STAF_005`).
  - **AC-57 (đã chốt AMB-14)**: xoá tài xế đang được gán cho đơn → **bị chặn** → TC phân quyền/toàn vẹn dữ liệu, cả trên UI lẫn gọi thẳng API.
  - Quyền hiển thị nút (`＋新規登録`, icon 🖊 🗑) theo permission → Decision Table role × action.
- **UI chung:** Sidebar + header (tiêu đề + `アカウント一括発行` + `＋新規登録`) → thanh tìm kiếm accordion → bảng có checkbox → phân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút `アカウント一括発行` (H.1) | Button | High | Decision Table (0 / 1 / nhiều dòng) | **Phụ thuộc checkbox; → `OW_STAF_005`** |
| Nút `＋新規登録` (H.2) | Button | High | Decision Table (có/không quyền Create) | Ẩn khi không có quyền |
| Ô tìm kiếm văn bản (S.1) | Textbox | Medium | EP (AND, khớp một phần) + Security | Enter cũng thực hiện tìm |
| `スタッフ区分` (S.2) | Dropdown | Low | — | 3 giá trị |
| `ステータス` (S.3) | Dropdown | Medium | — | 6 giá trị (gồm `すべて`) |
| Nút `クリア` (S.4) | Button | Medium | — | Hành vi sau xoá → `[UNCONFIRMED]` (AMB-19) |
| Nút `検索` (S.5) | Button | High | — | — |
| Accordion `∧ / ∨` (S.6) | Button (accordion) | Medium | State Transition | — |
| Nút `並べ替え` (S.7) | Button (sort) | Medium | — | Cột + UI → `[UNCONFIRMED]` (AMB-19) |
| Checkbox dòng + chọn tất cả | Checkbox | High | BVA (0 / 1 / tất cả) | **Giữ nguyên khi đóng modal bằng `キャンセル` (AC-48)** |
| Cột `免許` (thumbnail) (T.2) | Image | Medium | EP (có / chưa đăng ký) | Click → `[UNCONFIRMED]` (AMB-19) |
| Cột `配送スタッフ名` (link) (T.4) | Link | High | — | → `OW_STAF_003` |
| Cột `ステータス` (T.8) | Badge | High | — | 5 giá trị × màu; `削除済` → `[UNCONFIRMED]` |
| Cột `アカウント状態` (T.9) | Badge | High | State Transition (`未発行` → `発行済み`) | **Liên màn với `OW_STAF_005`** |
| Icon `🖊` sửa (T.10.1) | Button | High | Decision Table (quyền) | → `OW_STAF_004` |
| Icon `🗑` xoá (T.10.2) | Button | **High** | Decision Table (tài xế có/không đang được gán) | **AC-57: đang được gán → CHẶN** |
| Phân trang (P.1) | Pagination | Medium | BVA (0 / 10 / 11) | — |

---

## OW_STAF_003 — 配送スタッフ詳細 (3 tab)

- **Archetype:** Detail (tab-based) + Form edit
- **Chiến lược Test Case:**
  - 3 tab khác hẳn nhau về bản chất → 3 nhóm TC riêng; thêm TC deep-link từng tab.
  - Tab `基本情報`: chế độ Xem (read-only) ⇄ chế độ 編集 → test từng field ở cả 2 chế độ; `配送スタッフID` và `ログインID` luôn read-only và **cùng giá trị** (AC-52).
  - **AC-58 (đã chốt AMB-14)**: `パスワード送信` chỉ chạy được với tài xế `有効` → Decision Table theo 5 trạng thái; email có **unique check** → TC trùng email với tài xế khác.
  - Tab `担当配送情報`: 2 summary tính trên toàn bộ kết quả tìm kiếm của tài xế đó (AC-54) — cùng bẫy như `OW_CLCT_001`.
  - Tab `変更履歴`: verify đúng **format log** (AC-53), không verify theo dữ liệu mẫu trong Figma vì mẫu đó sai domain (RQ-018) → TC phải tự tạo thay đổi rồi đối chiếu log sinh ra.
- **UI chung:** Sidebar + header (tên tài xế + 3 nút `削除` · `パスワード送信` · `編集`) → thanh 3 tab.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút `削除` (H.1) | Button | **High** | Decision Table (đang được gán / không) | **AC-57: chặn khi đang được gán** |
| Nút `パスワード送信` (H.2) | Button | **High** | Decision Table (5 trạng thái tài xế) | **AC-58: chỉ `有効`** |
| Nút `編集` (H.3) | Button | High | State Transition (Xem ⇄ Sửa) | Chuyển TOÀN MÀN sang chế độ nhập |
| `配送スタッフID` (A.1) | Text (read-only) | Medium | — | Hệ thống sinh; **= `ログインID` (AC-52)** |
| `配送スタッフ名` (A.2) | Textbox | High | BVA (1 / 50 / 51) + Security | **Blur → tự sinh `カナ`** |
| `配送スタッフ名カナ` (A.3) | Textbox | Medium | EP (全角カナ / 半角カナ) | Nhận giá trị tự sinh từ A.2 |
| `区分` (A.4) | Dropdown | Medium | — | `個人` / `会社所属` |
| `ステータス` (A.5) | Dropdown | High | — | 4 giá trị; **ảnh hưởng H.2 và `OW_STAF_005`** |
| `電話番号` (A.6) | Phone | Medium | BVA (9 / 10 / 11 / 12) | Tùy chọn — chỉ validate khi có nhập |
| `免許証（画像）` (A.7) | File Upload | High | Boundary Tier (5MB) + EP (định dạng) | Bắt buộc; message đang tiếng Việt → `[UNCONFIRMED]` (AMB-21) |
| `ログインID` (A.8) | Text (read-only) | Medium | — | **Phải trùng A.1** |
| `メールアドレス` (A.9) | Email | **High** | EP (format) + unique check | **AC-58: có unique check** |
| `最終ログイン日時` (A.10) | Text (read-only) | Low | — | Định dạng `yyyy年M月d日 HH:mm:ss` |
| Tab 担当配送情報 — date range (B.1.1) | Date picker (range) | Medium | BVA | Mặc định ngày 1 → cuối tháng |
| Tab 担当配送情報 — `配送状況` (B.1.2) | Dropdown | Medium | — | 5 giá trị |
| Tab 担当配送情報 — 2 summary (B.1.5/6) | Number (aggregate) | High | — | **Toàn bộ kết quả tìm kiếm (AC-54)** |
| Tab 担当配送情報 — bảng 10 cột | Table | Medium | — | `配送No` → `OW_DLVR_002` |
| Tab 変更履歴 — bảng 3 cột (C) | Table (read-only) | High | — | **Verify FORMAT log (AC-53), bỏ qua dữ liệu mẫu sai domain** |
| Tab 変更履歴 — `変更者` (C.3) | Text | Medium | EP (thao tác tay / `CSV取込`) | — |

---

## OW_STAF_004 — 配送スタッフ登録・編集

- **Archetype:** Form Create / Form Edit (dùng chung)
- **Chiến lược Test Case:**
  - Dùng **chung bộ field và chung bộ message** với `OW_STAF_003` tab 基本情報 → TC validation không viết lại, nhưng **phải có TC đối chiếu** xác nhận 2 màn ra đúng cùng message (chống dev đặt message khác nhau).
  - Khác biệt giữa 2 chế độ (đăng ký mới vs chỉnh sửa) là trọng tâm: `配送スタッフID` / `ログインID` / `最終ログイン日時` ẩn khi tạo mới, hiện read-only khi sửa → Decision Table theo chế độ × field.
  - `免許証` bắt buộc ở cả 2 chế độ (AC-51) → test tạo mới không ảnh có bị chặn không, và sửa mà xoá ảnh đi có bị chặn không.
  - Giá trị mặc định `ステータス` khi tạo mới chưa chốt → `[UNCONFIRMED]` (AMB-19).
- **UI chung:** Sidebar + 1 cột form theo đúng thứ tự tab `基本情報`, footer `キャンセル` · `保存`.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Chế độ Tạo mới vs Sửa | Behavior | High | Decision Table (chế độ × field hiện/ẩn) | ID / ログインID / 最終ログイン ẩn khi tạo mới |
| `配送スタッフ名` | Textbox | High | BVA (1 / 50 / 51) + Security | Blur → tự sinh カナ |
| `配送スタッフ名カナ` | Textbox | Medium | EP (全角カナ) | — |
| `区分` | Dropdown | Medium | — | — |
| `ステータス` | Dropdown | High | — | Mặc định khi tạo mới → `[UNCONFIRMED]` (AMB-19) |
| `電話番号` | Phone | Medium | BVA (10 / 11) | — |
| `免許証（画像）` | File Upload | High | Boundary Tier (5MB) + EP (định dạng) | **Bắt buộc cả 2 chế độ (AC-51)** |
| `メールアドレス` | Email | **High** | EP (format) + unique check | **AC-58** |
| Nút `保存` | Button | High | Decision Table (đủ / thiếu mục bắt buộc) | → ghi log 変更履歴 |
| Nút `キャンセル` | Button | Medium | — | Rời form khi chưa lưu → `[UNCONFIRMED]` (AMB-20) |

---

## OW_STAF_005 — アカウント一括発行 (Modal)

- **Archetype:** Modal (bulk confirm + result)
- **Chiến lược Test Case:**
  - Đây là luồng **gửi email hàng loạt** — rủi ro cao vì gửi nhầm không thu hồi được. Cần Decision Table theo tổ hợp trạng thái các dòng đã chọn: toàn bộ `有効` / trộn lẫn / toàn bộ không hợp lệ.
  - AC-45: dòng ≠ `有効` phải tô nền xám + **email để trống** + không nằm trong phạm vi gửi → verify cả 3 dấu hiệu, không chỉ 1.
  - AC-46: 0 dòng hợp lệ → nút `発行する` disabled (khác với trường hợp trộn lẫn vẫn gửi được).
  - AC-47: gửi một phần lỗi → popup có `再度実行` chỉ gửi lại **dòng lỗi** → TC verify không gửi trùng cho dòng đã thành công.
  - AC-48: `キャンセル` giữ nguyên checkbox ở màn danh sách → TC liên màn.
  - Cảnh báo "tài xế đã có tài khoản → mật khẩu bị reset" cần 1 TC xác nhận tài xế cũ **không đăng nhập được bằng mật khẩu cũ** nữa.
- **UI chung:** Modal phủ lên `OW_STAF_001`: văn bản hướng dẫn → dòng lỗi (nếu có) → bảng cuộn → footer `キャンセル` · `発行する`; sau khi gửi hiện popup kết quả.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Văn bản hướng dẫn (1) | Text | Low | — | Có cảnh báo reset mật khẩu |
| Dòng đếm lỗi (2) | Text (conditional) | High | BVA (0 / 1 / nhiều dòng lỗi) | Chỉ hiện khi có dòng ≠ `有効` |
| Bảng danh sách (3) | Table (scroll) | High | Decision Table (trạng thái × hiển thị) | **Dòng lỗi: nền xám + email trống (AC-45)** |
| Nút `キャンセル` (4) | Button | High | — | **Giữ nguyên checkbox ở `OW_STAF_001` (AC-48)** |
| Nút `発行する` (5) | Button | **High** | Decision Table (toàn hợp lệ / trộn / 0 hợp lệ) | **Disabled khi 0 hợp lệ (AC-46)** |
| Popup toàn bộ thành công (6) | Popup | High | — | Icon ✓ xanh |
| Popup một phần lỗi (7) | Popup | High | — | Hiện `Thành công: N` / `Thất bại: M` |
| Nút `完了` (8) | Button | Medium | — | Phần thất bại KHÔNG được gửi lại |
| Nút `再度実行` (9) | Button | **High** | — | **Chỉ gửi lại dòng lỗi, không gửi trùng dòng đã OK (AC-47)** |
| Nút `×` (10) | Button | Low | — | — |

---

## OW_PROF_001 — プロフィール（基本情報）

- **Archetype:** Detail / Form Edit (2 chế độ)
- **Chiến lược Test Case:**
  - Bộ field **trùng `OW_AUTH_003`** → không viết lại validation, nhưng **phải có TC đối chiếu message** giữa 2 màn.
  - Trọng tâm riêng của màn này là chuyển chế độ Xem ⇄ 編集 (AC-55): ở chế độ Xem mọi field read-only và **không có nút `住所検索`**; nhấn `編集` thì cả 2 thứ đổi.
  - **AC-56 (đã chốt AMB-13)**: fee-area đã bị BỎ → cần TC regression xác nhận `FeeAreaTab`, `FeeEditModal` và chức năng import/export CSV phí **không còn xuất hiện** ở bất kỳ đâu trên màn プロフィール.
  - Log thay đổi hồ sơ công ty chưa chốt → `[UNCONFIRMED]` (AMB-18).
- **UI chung:** Sidebar + thanh 2 tab → card thông tin → nút `編集` góc phải; chế độ sửa có footer `キャンセル` · `保存`.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Thanh 2 tab | Tab | Medium | State Transition | ⇄ `OW_PROF_002`; **chỉ còn 2 tab (AC-56)** |
| Nút `編集` | Button | High | State Transition (Xem ⇄ Sửa) | Hiện nút `住所検索` ở chế độ sửa |
| Bộ field 基本情報 (A.1.1–A.1.13) | Form fields | High | — | **Dùng chung validation + message với `OW_AUTH_003`** |
| Bảng `担当者` (A.2.1–A.2.7) | Table (động) | High | Decision Table (メイン không xoá được) | Như `OW_AUTH_003` |
| Nút `住所検索` | Button | Medium | — | **Chỉ hiện ở chế độ sửa (AC-55)** |
| Nút `保存` | Button | High | — | Log thay đổi → `[UNCONFIRMED]` (AMB-18) |
| Nút `キャンセル` | Button | Medium | — | Rời khi chưa lưu → `[UNCONFIRMED]` (AMB-20) |
| **Vắng mặt fee-area** | Regression check | **High** | — | **AC-56: verify đã gỡ SẠCH khỏi UI** |

---

## OW_PROF_002 — プロフィール（配送対応情報）

- **Archetype:** Detail / Form Edit (2 chế độ)
- **Chiến lược Test Case:**
  - Màn này **không có bảng 画面設計書** — nội dung suy 1-1 từ `OW_AUTH_004` → toàn bộ TC validation tag `[UNCONFIRMED]` (AMB-17), nhưng vẫn viết đầy đủ để khi BA chốt thì chạy được ngay.
  - Khác biệt so với `OW_AUTH_004`: **không có** checkbox `契約書に同意します。` → 1 TC xác nhận field này không xuất hiện.
  - Chip khu vực có nút `×` **chỉ ở chế độ sửa** → test cả 2 chế độ.
  - Logic cây 3 tầng + indeterminate giống `OW_AUTH_004` → tái sử dụng Decision Table, nhưng test trên dữ liệu đã lưu sẵn (khác với form đăng ký bắt đầu từ rỗng).
- **UI chung:** Giống `OW_PROF_001`, nội dung là 2 khối `対応エリア` + `車両・設備情報`.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `対応エリア` (chip + tree) | Dropdown đa cấp | High | Decision Table (4 tổ hợp tick) | Chip có `×` **chỉ ở chế độ sửa**; `[UNCONFIRMED]` (AMB-17) |
| `配送不可曜日` | Checkbox group | Low | — | — |
| `対応エリアに関する備考` | Textarea | Medium | BVA (500 / 501) + Security | — |
| `保有車両` | Multi-select | High | EP (0 / 1 / nhiều) | — |
| 3 radio thiết bị | Radio | Medium | — | 冷凍 / 冷蔵 box + 冷蔵保管スペース |
| `車両・設備情報に関する備考` | Textarea | Low | BVA (500 / 501) | — |
| **Vắng mặt `契約書に同意します。`** | Regression check | Medium | — | Chỉ có ở luồng đăng ký, KHÔNG có ở hồ sơ |
| Nút `編集` / `保存` / `キャンセル` | Button | High | State Transition | Như `OW_PROF_001` |

---

## Ghi chú tổng quát

- **Assumption môi trường test:**
  - **Driver App (E06) phải chạy thật hoặc có seed dữ liệu 実績 / 駐車報告 / 集金報告** — nếu mock, toàn bộ TC integration của `OW_DLVR_002` tab 実績 + tab 添付資料 và số tiền ở `OW_CLCT_001` / `OW_STAF_003` không phản ánh đúng production.
  - AWS S3 available để test upload ảnh 免許証 và tài liệu 非公開; cần chuẩn bị sẵn file 4.9MB · 5MB · 5.1MB và file sai định dạng (PDF, GIF, TXT).
  - Mail service hoạt động thật khi test `アカウント一括発行` — cần ≥3 hộp thư test nhận được email.
  - Cần seed: ≥21 file cho 1 đơn (test giới hạn 20) · đơn có `発送予定日` cách hôm nay 6 / 7 / 8 ngày · tài xế đủ 5 trạng thái · tài xế đang được gán đơn (test AC-57) · >10 dòng dữ liệu thu tiền (test AC-40).
  - Có quyền gọi API trực tiếp (Postman) để verify BE chặn rule 7 ngày và chặn xoá tài xế đang được gán — **không chỉ test qua UI**.
- **Bị chặn bởi ambiguity còn TBD (Medium → tag `[UNCONFIRMED]`, không dừng):** AMB-15 · AMB-16 · AMB-17 · AMB-18 · AMB-19 · AMB-20 · AMB-21.
- **Thứ tự thực thi đề nghị:** `OW_DLVR_001` → `OW_DLVR_002` → `OW_DLVR_003` → `OW_CLCT_001` → `OW_STAF_001` → `OW_STAF_004` → `OW_STAF_003` → `OW_STAF_005` → `OW_PROF_001` → `OW_PROF_002`.
