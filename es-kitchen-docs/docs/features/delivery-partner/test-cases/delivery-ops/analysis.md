# Requirements Analysis: delivery-ops (Delivery Partner Portal E05 P2)

## Summary

**Tính năng:** Cụm Vận hành giao hàng của portal **Website Công ty vận chuyển** (委託配送先WEB · E05 Phase 2) — điều phối tài xế, đối soát tiền, quản lý nhân sự giao hàng và hồ sơ công ty.

**Mục đích nghiệp vụ:** Cho phép công ty vận chuyển tự vận hành toàn bộ phần việc được ES Kitchen ủy thác: tra cứu đơn giao hàng, gán tài xế của chính mình vào từng đơn, xem kết quả thực tế tài xế báo về từ Driver App, đối soát tiền thu hộ + phí đỗ xe và xuất CSV, quản lý hồ sơ tài xế + phát hành tài khoản Driver App hàng loạt, cập nhật hồ sơ pháp nhân.

**Actors:**
- **Outsource Admin** (委託配送先管理者) — actor chính, thao tác toàn bộ 10 màn
- **配送スタッフ / Driver** (E06) — **đối tượng dữ liệu**, không đăng nhập E05; nhập 実績 / 駐車報告 / 集金報告 từ Driver App
- **System** — tính 差異 / 誤差, ghi log 変更履歴, gửi email thông tin đăng nhập hàng loạt

**Luồng chính:** 4/9 business flow của SPEC — Flow 6 (配送管理) · Flow 7 (金額の確認) · Flow 8 (配送スタッフ) · Flow 9 (プロフィール).

**Platform:** **Web desktop** — viewport chuẩn duy nhất **1440×1024**. Bảng dữ liệu KHÔNG responsive, cuộn ngang khi vượt khung (`OW_DLVR_001` có 12 cột).

**Scope module này:** 10 màn — `OW_DLVR_001` · `OW_DLVR_002` · `OW_DLVR_003` · `OW_CLCT_001` · `OW_STAF_001` · `OW_STAF_003` · `OW_STAF_004` · `OW_STAF_005` · `OW_PROF_001` · `OW_PROF_002`.

**Dependencies:**
- `es-kitchen-api` — `GET /delivery-blocks`, PATCH gán tài xế, aggregate query 集金/駐車, CSV export (UTF-8 BOM), `PATCH /deliverer/profile`
- **AWS S3** — ảnh 免許証 (≤5MB) + tài liệu 非公開 (≤20 file/đơn, JPG/JPEG/PNG)
- **Mail service** — gửi email thông tin đăng nhập hàng loạt cho tài xế
- **Driver App (E06)** — nguồn dữ liệu 実績 (廃棄数 / 陳列結果), 駐車報告, 集金報告. **Integration point quan trọng nhất của module.**
- **Ngoài scope module:** màn nhập liệu phía Driver App; cụm 見積もり

---

## Q&A — Ambiguities

| ID | Reference | Screen | Question (VN) + Assumption/Đề xuất | Impact | Severity | Status |
|---|---|---|---|---|---|---|
| AMB-11 | OQ-02 / RQ-006 | OW_DLVR_002 | Rule khoá sửa `ngày hiện tại − ngày ship ≥ 7`: (a) mốc là `配送日（着）` hay `発送予定日`? (b) BE có chặn hay chỉ FE disable? (c) khoá field nào — chỉ `配送スタッフ` hay cả form? | Không xác định được boundary value để test | **High** | **Answered (22/09)** — mốc = `発送予定日` · **BE chặn** (không chỉ FE disable) · khoá **CẢ FORM**. Test boundary ngày 6 / 7 / 8 + test bypass qua API |
| AMB-12 | OQ-03 / RQ-009 | OW_CLCT_001 | CSV 集金 xuất 7 cột theo Figma (`配送日/配送ID/配送スタッフID/配送スタッフ名/配送先名/集金金額/駐車料金`) hay giữ 7 cột code đang chạy (`発送日/配送スタッフ名/納品先/集金合計/駐車場料金/差額/提出日時`)? **CONFLICT.** | Expected Result của TC xuất CSV sai hoàn toàn nếu chọn nhầm bộ cột | **High** | **Answered (22/09)** — **LẤY THEO FIGMA**: 7 cột `配送日/配送ID/配送スタッフID/配送スタッフ名/配送先名/集金金額/駐車料金`, 1 dòng = 1 配送. Bộ cột cũ → TC regression xác nhận đã đổi |
| AMB-13 | OQ-04 / RQ-013 | OW_PROF_001, OW_PROF_002 | Fee-area (phí theo khu vực) giữ hay bỏ ở P2? `FeeAreaTab` + `FeeEditModal` + import/export CSV phí **đang chạy production** nhưng プロフィール P2 chỉ còn 2 tab. **CONFLICT.** | Nếu bỏ → cần TC xác nhận tính năng đã gỡ | **High** | **Answered (22/09)** — **BỎ fee-area, lấy theo Figma**: プロフィール chỉ còn 2 tab. Cần TC regression xác nhận `FeeAreaTab` / `FeeEditModal` / import-export CSV phí đã gỡ SẠCH khỏi UI |
| AMB-14 | OQ-13 | OW_STAF_001, OW_STAF_003, OW_STAF_004 | (a) Xoá tài xế đang được gán cho đơn giao hàng — chặn hay cho xoá? (b) `パスワード送信` đơn lẻ có áp rule chỉ-`有効` như luồng hàng loạt không? (c) email tài xế có unique check không (bảng Figma 195513 A.9 KHÔNG khai báo)? | Thiếu TC phân quyền + toàn vẹn dữ liệu ở chỗ rủi ro nhất | **High** | **Answered (22/09)** — (a) **CHẶN** xoá tài xế đang được gán · (b) `パスワード送信` đơn lẻ **CÓ** áp rule chỉ-`有効` · (c) email tài xế **CÓ** unique check |
| AMB-15 | OQ-08 / RQ-023 | OW_DLVR_002 | Tab 実績: (a) số ngày định nghĩa "gần hết hạn" để tô đỏ `賞味期限`? (b) Driver App có bắt buộc nhập `実在庫` / `実際数` không? (c) hiển thị gì khi tài xế chưa báo 実績? | Không có ngưỡng để viết TC boundary cho tô đỏ HSD | Medium | TBD |
| AMB-16 | OQ-16 / RQ-017 | OW_DLVR_002 | Tab `添付資料` KHÔNG có bảng 画面設計書. Field nào của `駐車報告` / `集金報告`, có sửa được không, ảnh receipt mở viewer nào? | Không sinh được TC chi tiết cho tab 4 của màn chi tiết giao hàng | Medium | TBD |
| AMB-17 | OQ-14 / RQ-012 | OW_PROF_002 | Tab `配送対応情報` KHÔNG có bảng 画面設計書 riêng — SPEC suy 1-1 từ form đăng ký bước 2 (`OW_AUTH_004`). Cần verify dùng chung data model? | Nếu sai → toàn bộ TC validation của màn này sai | Medium | TBD |
| AMB-18 | OQ-18 | OW_PROF_001, OW_PROF_002 | Thay đổi hồ sơ công ty có được ghi log lịch sử không? Figma chỉ có tab `変更履歴` ở `配送スタッフ詳細`, không có ở プロフィール. | Không biết có cần TC verify log sau khi sửa hồ sơ | Medium | TBD |
| AMB-19 | OQ-17 / RQ-025 | OW_DLVR_001, OW_CLCT_001, OW_STAF_001, OW_STAF_004 | Danh sách lựa chọn dropdown `件数/ページ` (chỉ biết default = 10) · hành vi nút `クリア` ở `OW_STAF_001` sau khi xoá điều kiện · cột + UI nút `並べ替え` · click thumbnail `免許` làm gì · giá trị mặc định `ステータス` khi tạo tài xế mới. | Thiếu test data cụ thể cho 5 điểm UI | Medium | TBD |
| AMB-20 | OQ-12 | Toàn bộ 10 màn | Empty state + banner/toast lỗi mạng/500 + **màn hết phiên** chưa thiết kế trong Figma. 14 dòng `Full screen` (phiên hết hạn) chưa có Screen Code riêng. | Expected Result của TC nhóm 3/4/5 không có message chuẩn | Medium | TBD |
| AMB-21 | OQ-15 | OW_DLVR_002, OW_STAF_003, OW_STAF_004 | Nhiều error message trong Figma viết bằng **tiếng Việt** (`「Vui lòng tải lên ảnh giấy phép lái xe.」`, `「Chỉ có thể đăng ký tối đa 20 file.」`, toàn bộ message của OW_STAF_003/004) trong khi portal tiếng Nhật 100%. Cần bản JP chính thức. | Expected Result sai ngôn ngữ so với sản phẩm thật | Medium | TBD |

> **TBD** = chưa được PM/BA/BrSE confirm · **Answered** = đã có câu trả lời

---

## Acceptance Criteria

| REQ ID | AC ID | AC Content | Status |
|---|---|---|---|
| RQ-003 | AC-23 | Vào `OW_DLVR_001` lần đầu → kỳ tìm kiếm mặc định = **hôm nay → ngày cuối tháng đó** | Confirmed |
| RQ-003 | AC-24 | Nút `クリア` reset toàn bộ điều kiện tìm kiếm về mặc định | Confirmed |
| RQ-003 | AC-25 | Đơn chưa gán tài xế → cột `配送スタッフID` và `配送スタッフ名` **để trống** (không hiển thị chữ `未割当`) | Confirmed |
| RQ-003 | AC-26 | Phân trang hiển thị `{Tổng}件中 {Từ}−{Đến}件`, mặc định 10 dòng/trang | Confirmed |
| RQ-021 | AC-27 | Dropdown chọn tài xế chỉ liệt kê tài xế trạng thái `有効`, có ô tìm theo tên/ID, mỗi ứng viên hiển thị số đơn **của đúng ngày giao đơn đang mở** | Confirmed |
| RQ-003 | AC-28 | Nhấn `確定` sau khi chọn tài xế → toast `「配送スタッフ設定完了しました。」` và badge `⚠ 未設定` biến mất | Confirmed |
| RQ-003 | AC-29 | Nhấn `キャンセル` → quay lại trạng thái tài xế trước đó (chưa gán hoặc tài xế cũ), không lưu | Confirmed |
| RQ-006 | AC-30 | Khi `ngày hiện tại − 発送予定日 ≥ 7` → **BE chặn** + toàn bộ form 配送詳細 khoá (nút `編集` disabled) | Confirmed (AMB-11 đã chốt 22/09) |
| RQ-007 | AC-31 | Khối tài liệu `公開` không có nút thêm/xoá; khối `非公開` có nút `ファイルを追加` và nút xoá từng file | Confirmed |
| RQ-007 | AC-32 | Upload file thứ 21 vào nhóm 非公開 → bị từ chối kèm message giới hạn 20 file | Confirmed |
| RQ-007 | AC-33 | Upload file ≠ JPG/JPEG/PNG hoặc >5MB → bị từ chối kèm message tương ứng | Confirmed |
| RQ-003 | AC-34 | Trong viewer, file nhóm `公開` không hiển thị menu ︙; file nhóm `非公開` hiển thị menu ︙ có mục 削除 và **không** có dialog xác nhận | Confirmed |
| — | AC-35 | Viewer PDF **không** preview nội dung — chỉ hiển thị dung lượng + nút tải; nút zoom bị disabled | Confirmed |
| RQ-003 | AC-36 | Tab 実績: `差異 = 理論在庫 − 実在庫` và `誤差 = 予定数 − 実際数`, tự tính, tô đỏ khi ≠ 0 | Confirmed |
| RQ-003 | AC-37 | Tab 実績: ô 廃棄数 tô đỏ khi giá trị > 0 | Confirmed |
| RQ-003 | AC-38 | Toàn bộ trường của tab 配送住所 và tab 実績 là **chỉ đọc** trên portal E05 | Confirmed |
| RQ-003 | AC-39 | Vào `OW_CLCT_001` lần đầu → kỳ mặc định = **ngày 1 → ngày cuối tháng hiện tại** | Confirmed |
| RQ-003 | AC-40 | 2 summary `集金合計金額` / `駐車合計料金` tính trên **toàn bộ kết quả tìm kiếm**, không chỉ trang hiện tại | Confirmed |
| RQ-010 | AC-41 | Tên file CSV theo mẫu `集金管理_{開始日}-{終了日}_{配送スタッフ検索条件}_{出力日時}.csv`; không lọc tài xế → phần điều kiện là `全配送スタッフ` | Confirmed |
| RQ-009 | AC-42 | CSV xuất **7 cột theo Figma**: `配送日` · `配送ID` · `配送スタッフID` · `配送スタッフ名` · `配送先名` · `集金金額` · `駐車料金` — 1 dòng = 1 配送 (khác bảng trên màn hình 1 dòng = 1 tài xế) | Confirmed (AMB-12 đã chốt 22/09) |
| RQ-003 | AC-43 | Click tên tài xế trong bảng → sang `OW_STAF_003` tab 担当配送情報 của tài xế đó | Confirmed |
| RQ-022 | AC-44 | Nút `アカウント一括発行` disabled khi chọn 0 dòng, bật khi chọn ≥1 dòng | Confirmed |
| RQ-022 | AC-45 | Trong modal, dòng trạng thái ≠ `有効` bị tô nền xám, cột email để trống, và **không** nằm trong phạm vi gửi | Confirmed |
| RQ-022 | AC-46 | Nếu toàn bộ dòng đã chọn đều không hợp lệ → nút `発行する` disabled | Confirmed |
| RQ-022 | AC-47 | Gửi thành công một phần → popup hiển thị `Thành công: N` / `Thất bại: M` và có nút `再度実行` chỉ gửi lại các dòng lỗi | Confirmed |
| RQ-003 | AC-48 | Nhấn `キャンセル` trong modal → đóng modal, **giữ nguyên** các checkbox đã chọn ở màn danh sách | Confirmed |
| RQ-020 | AC-49 | Badge trạng thái tài xế đúng màu: `有効` xanh · `免許未登録` vàng · `停止` đỏ · `無効` xám | Confirmed |
| RQ-003 | AC-50 | Cột `アカウント状態` chỉ có 2 giá trị: `未発行` / `発行済み` | Confirmed |
| RQ-003 | AC-51 | Ảnh 免許証 bắt buộc khi tạo tài xế; sai định dạng / >5MB → message tương ứng | Confirmed (ngôn ngữ message — AMB-21) |
| RQ-003 | AC-52 | `ログインID` của tài xế hiển thị **cùng giá trị** với `配送スタッフID` và không sửa được | Confirmed |
| RQ-018 | AC-53 | Tab 変更履歴 ghi log `{Tên mục}を『{Trước} → {Sau}』に変更`; tạo mới ghi `データ登録`; qua CSV ghi 変更者 = `CSV取込` | Confirmed |
| RQ-003 | AC-54 | Tab 担当配送情報 hiển thị 2 summary 集金/駐車 tính trên toàn bộ kết quả tìm kiếm của tài xế đó | Confirmed |
| RQ-011 | AC-55 | Màn プロフィール ở chế độ xem: mọi field read-only; nhấn `編集` → toàn bộ field nhập được và xuất hiện nút `住所検索` | Confirmed |

**Tổng:** 33 AC — **33 Confirmed** · 0 TBD, **+3 AC mới** phát sinh từ quyết định ngày 22/09:

| REQ ID | AC ID | AC Content | Status |
|---|---|---|---|
| AMB-13 | **AC-56** | プロフィール **KHÔNG còn** tab fee-area: `FeeAreaTab`, `FeeEditModal` và chức năng import/export CSV phí theo khu vực đã được gỡ khỏi UI | Confirmed (quyết định 22/09) |
| AMB-14 | **AC-57** | Xoá tài xế đang được gán cho ≥1 đơn giao hàng → **bị chặn**, hiển thị thông báo lý do, tài xế KHÔNG bị xoá | Confirmed (quyết định 22/09) |
| AMB-14 | **AC-58** | `パスワード送信` đơn lẻ ở `OW_STAF_003` chỉ thực hiện được với tài xế trạng thái `有効`; email tài xế có **unique check** trên toàn hệ thống | Confirmed (quyết định 22/09) |

> 7 AMB còn lại (Medium) auto-tag `[UNCONFIRMED]` ở TC liên quan theo rule severity-gated.

---

## Screen Inventory

> Đã cross-check với Figma. Nguồn: canvas `Delivery (P2)` node `26173:304942` (file `VKAAOyoSPvgoB3H2qdeeV3`).

| Screen Code | Screen | Nguồn (Figma frame node) | Bảng 画面設計書 | Ghi chú |
|---|---|---|---|---|
| `OW_DLVR_001` | 配送管理一覧 | `31498:191879` + search `31498:193284` | `31498:194754` + `194755` (30 dòng) | 12 cột · bộ lọc 11 điều kiện |
| `OW_DLVR_002` | 配送詳細 (4 tab) | `31498:190718` / `190790` / `190870` / `193358` / `193469` / `193742` | `194753` (概要) · `195508` (住所) · `195511` (実績) · ❌ 添付資料 | Tab 添付資料 thiếu bảng — AMB-16 |
| `OW_DLVR_003` | ファイルビューア | `31498:193797` (ảnh) / `193947` (PDF) | `31498:195509` (6 dòng) | PDF không preview, zoom disabled |
| `OW_CLCT_001` | 集金管理（集金・駐車） | `31498:192123` | `31498:194752` (17 dòng) + `194117` (CSV 7 cột) | Quy tắc tên file CSV ở note `194115` |
| `OW_STAF_001` | 配送スタッフ一覧 | `31498:192233` | `31498:195512` (23 dòng) | Checkbox + thumbnail 免許 |
| `OW_STAF_003` | 配送スタッフ詳細 (3 tab) | `31498:192537` / `192634` / `192891` | `195513` (基本情報) · `194743` (担当配送) · `194742` (変更履歴) | Dữ liệu mẫu tab 変更履歴 trong Figma **sai domain** (RQ-018) |
| `OW_STAF_004` | 配送スタッフ登録・編集 | `31498:192588` | dùng chung `195513` | 免許証 bắt buộc |
| `OW_STAF_005` | アカウント一括発行 (Modal) | `31498:194129` (Section 6) | `31498:194744` (12 dòng) | 4 state: xác nhận / lỗi từng dòng / loading / kết quả |
| `OW_PROF_001` | プロフィール（基本情報） | `31498:192935` (xem) / `193018` (sửa) | ❌ không có | Suy từ `OW_AUTH_003` |
| `OW_PROF_002` | プロフィール（配送対応情報） | `31498:193104` (xem) / `193191` (sửa) | ❌ không có | `[INFERENCE]` suy từ `OW_AUTH_004` — AMB-17 |

**Integration point cần test riêng (Driver App E06 → Portal E05):**

| Integration Point | Risk | Loại TC bắt buộc |
|---|---|---|
| Driver App → `OW_DLVR_002` tab 実績 (廃棄数 / 陳列結果) | **High** | pass-through · transformation (差異/誤差) · invalid-boundary · consistency |
| Driver App → `OW_DLVR_002` tab 添付資料 (駐車報告 / 集金報告) | **High** | pass-through · invalid-boundary *(bị chặn bởi AMB-16)* |
| `OW_DLVR_002` tab 添付資料 → `OW_CLCT_001` + `OW_STAF_003` tab 担当配送情報 (số tiền thu / phí đỗ xe) | **High** | pass-through · transformation (aggregate) · consistency |

**Tham chiếu bổ sung (BA output):**
- Figma Flow Tổng Quan: node `32079-49624`, page `Feature - Flow`
- Figma Screen Flow: node `32087-49623`, page `Feature - Flow` — Group 4 (配送管理), Group 5 (集金), Group 6 (配送スタッフ), Group 7 (プロフィール) + bảng ⑦ ERROR/POPUP INDEX (E-071…E-147 thuộc module này)

---

## History
- v1 (22/09/2026): `/analyze-req` — khởi tạo từ SPEC.md v2 + Figma canvas `Delivery (P2)`
- v1.1 (22/09/2026): user chốt AMB-11/12/13/14 → AC-30, AC-42 Confirmed; thêm AC-56, AC-57, AC-58
