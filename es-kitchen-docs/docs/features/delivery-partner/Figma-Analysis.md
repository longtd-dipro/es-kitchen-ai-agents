# Delivery Partner P2 — Phân tích Figma (đầu vào thay SPEC)

> **Trạng thái:** Đây **KHÔNG phải SPEC.md** do BA sinh ra. Đây là bản phân tích Figma do Tech Lead thực hiện, dùng làm đầu vào tạm thời cho `Design-Technical.md`. Khi BA chạy `/create-spec`, SPEC.md chính thức sẽ thay thế file này làm nguồn nghiệp vụ.
>
> **Nguồn:** Figma `ES-Kitchen-phase-2` — canvas **`Delivery (P2)`**
> `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=26173-304942`
> fileKey `VKAAOyoSPvgoB3H2qdeeV3` · canvas node `26173:304942` · kích thước 29814×31470px
>
> **Repo ảnh hưởng:** `es-kitchen-api` (module `deliverer`) + `es-kitchen-web-outsource-web-private` (E05)
> **Coverage đọc:** 57/60 frame (bỏ 3 component state thuần: `table-header/default`, `row expand`, `Tab Item`)
> **Ngày phân tích:** 2026-09-18

---

## 1. Bản đồ flow (9 Flow note dividers)

Mỗi dải phân cách trong canvas gắn nhãn 1 flow. Thứ tự theo trục Y:

| Y | Nhãn | Marker | Diễn giải |
|---|---|---|---|
| 1209 | Login | ✅ | Đăng nhập portal ESSTATION |
| 2644 | 新規登録フォーム | ✅ | Form đăng ký đối tác (2 bước) |
| 6699 | Reset PW | ✅ | Quên/đặt lại mật khẩu (OTP) |
| 8139 | ホーム | ✅ | Dashboard + お知らせ |
| 9558 | スケジュール | ✅ | Lịch tháng / tuần |
| 11674 | 配送管理 | ✅ | Danh sách + chi tiết giao hàng (4 tab) |
| 17099 | 金額の確認 | ✅ | 集金・駐車 (thu tiền + phí đỗ xe) |
| 18991 | 配送スタッフ-Driver | ✅ | Quản lý nhân viên giao hàng |
| 28933 | プロフィール profile | 🚀 | Hồ sơ đối tác (marker khác 8 flow trên) |

**Vùng KHÔNG thuộc flow nào** (hàng y=881, không có Flow note phủ):
`quote-request-list` · `quote-request-response` · `quote-request-details` · `weekly-schedule` · `empty-form`
→ Xử lý như **bản nháp/đề xuất**, không đưa vào scope implement cho tới khi PM chốt (xem §4 Q7).

---

## 2. Screen Inventory

> Cột **Code đề xuất** là đề xuất của Tech Lead — chưa được PM duyệt (xem §4 Q2).
> Cột **Hiện trạng** đối chiếu với source code `es-kitchen-web-outsource-web-private` tại thời điểm phân tích.

### 2.1 Auth (Flow Login / 新規登録 / Reset PW)

| Node ID | Tên frame (Figma) | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:191137` | OW_AUTH_001 | ログイン (có nút 新規登録) | `OW_AUTH_001` | Có `pages/auth/LoginPage.tsx` — thiếu nút 新規登録 |
| `31498:191305` | R01_Register Form | 申し込むフォーム step 1/2 — 基本情報 + 担当者 | `OW_AUTH_003` | Có `pages/register` — **lệch field** ở step 2 |
| `31498:191407` | R02_Register Form_p2 | 申し込むフォーム step 2/2 — 対応エリア + 車両・設備情報 | `OW_AUTH_004` | **Chưa có** đúng field |
| `31498:191499` | Section 5 | 2 frame trên ở trạng thái đã nhập + cây chọn 都道府県 theo vùng | — | — |
| `31498:191164` | OW_AUTH_002-1 | パスワード再設定 — nhập ログインID + メール | `OW_AUTH_002` | Có `ForgotPasswordPage.tsx` |
| `31498:191181` | OW_AUTH_002-2 | Nhập OTP (rỗng) — đếm ngược 再送信 `00:59` | `OW_AUTH_002` | Có `VerifyPage.tsx` — thiếu countdown |
| `31498:191218` | OW_AUTH_002-3 | Nhập OTP (đã nhập) — TTL 5 phút | `OW_AUTH_002` | Có |
| `31498:191258` | OW_AUTH_002-4 | Mật khẩu mới + xác nhận — **8–20 ký tự 半角英数字** | `OW_AUTH_002` | Có `ResetPasswordPage.tsx` — verify rule |
| `31498:191278` | OW_AUTH_002-5 | Hoàn tất — tự đăng nhập, nút ホーム画面へ | `OW_AUTH_002` | Có `ResetSuccessPage.tsx` |

### 2.2 ホーム (Dashboard)

| Node ID | Tên frame | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:189875` | OW_ANNO_001 - 4 | ホーム — mini-calendar tháng + お知らせ + 未回答の見積もり依頼 | `OW_HOME_001` | `pages/dashboard` chỉ có `AnnouncementCard` |
| `31498:190280` | OW_ANNO_001 - 2 | お知らせ詳細 — badge loại + nội dung + 一覧に戻る | `OW_ANNO_002` | **Chưa có** |

### 2.3 スケジュール

| Node ID | Tên frame | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:190314` | OW_SCHED_001 | Lịch **tháng** — ô ngày: サイクル, badge 件 theo 温度帯, 臨時休業, サイクル休止, ⚠未N件, 凡例 | `OW_SCHED_001` | `MonthlySummaryTab` hiện là bảng % theo status → **làm mới** |
| `31498:191010` | OW_SCHED_001 | Lịch **tuần** — mỗi ngày là danh sách điểm giao + icon 温度帯 | `OW_SCHED_002` | `WeeklyTimelineTab` khác hoàn toàn → **làm mới** |
| `31498:191825` / `31498:193284` | search | Thanh tìm kiếm (component) — xem §2.4 | — | — |

### 2.4 配送管理

| Node ID | Tên frame | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:191879` | OW_SCHED_001 | 配送管理一覧 — 11 cột, badge 温度帯 + 配送状況 | `OW_DLVR_001` | Có `DeliveryStatusPage.tsx` — ít cột/filter hơn |
| `31498:193284` | search | Bộ lọc nâng cao: date-range + radio 配送日（着）, 拠点ID・名, 配送先住所/郵便番号/電話/担当者電話, 荷物温度帯, 配送状況, 自販機, 配送方法, 配送元, 送り状番号/配送スタッフID・名 + sort + thu gọn | — | Thiếu phần lớn |
| `31498:190718` | OW_SCHED_002 | 配送詳細 tab **配送概要** — trạng thái chưa gán tài xế (未設定 + 確定/キャンセル) | `OW_DLVR_002` | Có 1 trang 5 section, **chưa tab hoá** |
| `31498:190790` | OW_SCHED_002 | 配送詳細 — đã gán tài xế, nút 編集 **bật** (発送予定日 2026/08/20) | `OW_DLVR_002` | — |
| `31498:190870` | OW_SCHED_002 | 配送詳細 — nút 編集 **disabled** (発送予定日 2026/08/10) → rule khoá 7 ngày | `OW_DLVR_002` | **Chưa có** |
| `31498:190950` | driver-selection-card | Dropdown chọn tài xế — search theo tên/ID + hiển thị **số 配送件数 của ngày đó** | — | Dropdown hiện chưa có search + count |
| `31498:193358` | OW_SCHED_002 | Tab **配送住所** — 荷受け住所 + 届け先住所 + 搬入経路・添付資料 (chỉ xem) + **非公開の搬入経路・添付資料** (xem/DL/xoá/thêm) | `OW_DLVR_002` | **Chưa có** |
| `31498:193469` | OW_SCHED_002 | Tab **実績** — 配送完了日時 + 廃棄数確認 (廃棄数/理論在庫/実在庫/賞味期限) + 陳列結果確認 (予定数/実際数/誤差) | `OW_DLVR_002` | **Chưa có** |
| `31498:193742` | OW_SCHED_002 | Tab **添付資料** — 駐車報告 (駐車料金 + レシート) + 集金報告 (集金予定額/集金額) | `OW_DLVR_002` | Một phần trong section 報告情報 |
| `31498:193797` | Admin_PicckingShipDetail_ImageView | Viewer ảnh — DL / zoom ± / 削除 / đóng / prev-next / pager `1/6` | — | **Chưa có** |
| `31498:193947` | ..._PDF | Viewer PDF — **không preview**, hiện dung lượng + DL, zoom disabled | — | **Chưa có** |
| `31498:194093` | tooltip-examples | Tooltip: ダウンロード / 縮小 / 拡大 / 削除 / 閉じる | — | — |
| `31498:193795` | Message | Toast `配送スタッフ設定完了しました。` | — | — |
| `31498:194114` | Message | Toast `非公開資料をアップロードしました。` | — | — |
| `31498:194738` | (note) | Ghi chú: `ngày hiện tại - ngày ship >= 7 : ko thể edit nữa` | — | Xem §4 Q4 |

### 2.5 集金・駐車 (金額の確認)

| Node ID | Tên frame | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:192123` | OW_SCHED_001 | 集金管理 — date-range + search staff, summary 集金合計金額 + **駐車合計料金**, cột 集金/駐車 theo staff, nút CSV出力 | `OW_CLCT_001` | `BillPage.tsx` chỉ có 合計金額 |
| `31498:194115` | (note) | Quy tắc tên file CSV: `集金管理_{検索開始日}-{検索終了日}_{配送スタッフ検索条件}_{出力日時}.csv` — ví dụ `集金管理_20260818-20260831_全配送スタッフ_20260907163511.csv` | — | Verify với export hiện tại |
| `31498:194116` | (note) | Cột CSV: `配送日,配送ID,配送スタッフID,配送スタッフ名,配送先名,集金金額,駐車料金` (**1 dòng / 1 配送**) | — | ⚠️ Khác 7 cột đang xuất trong code — xem C8 |

### 2.6 配送スタッフ

| Node ID | Tên frame | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:192233` | OW_SCHED_001 | 配送スタッフ一覧 — cột **免許** (thumbnail), 区分, ステータス (有効/無効/削除済/免許未登録), **アカウント状態** (発行済み/未発行), checkbox, 並べ替え, nút **アカウント一括発行** + 新規登録 | `OW_STAF_001` | `EmployeePage.tsx` thiếu 免許/アカウント状態/bulk/checkbox |
| `31498:192537` | OW_SCHED_001 | 配送スタッフ詳細 tab **基本情報** — 免許証 (ảnh) + ログイン情報 (ログインID, メール, 最終ログイン日時); nút 削除 / パスワード送信 / 編集 | `OW_STAF_003` | Có `EmployeeDetailPage.tsx` |
| `31498:192634` | OW_SCHED_001 | 配送スタッフ詳細 tab **担当配送情報** — filter kỳ + 配送状況, summary 集金/駐車, bảng 10 cột | `OW_STAF_003` | **Chưa có** |
| `31498:192891` | OW_SCHED_001 | 配送スタッフ詳細 tab **変更履歴** — 変更日時 / 変更内容 / 変更者 (có giá trị `CSV取込`) | `OW_STAF_003` | **Chưa có** (DB đã có `driver_history_logs`) |
| `31498:192588` | OW_SCHED_001 | 配送スタッフ登録 — 免許証 bắt buộc (写真を追加), 区分, ステータス, メールアドレス | `OW_STAF_004` | Có `CreateDriverPage.tsx` |
| `31498:194129` | Section 6 | Modal **アカウント一括発行** — 4 state: xác nhận / lỗi từng dòng / loading / kết quả (thành công · **partial error + 再度実行**) | `OW_STAF_005` | **Chưa có** |

### 2.7 プロフィール

| Node ID | Tên frame | Màn hình thực tế | Code đề xuất | Hiện trạng |
|---|---|---|---|---|
| `31498:192935` | OW_ANNO_001 - 6 | プロフィール tab 基本情報 (xem) | `OW_PROF_001` | `pages/profile` có `CompanyInfoTab` + `FeeAreaTab` |
| `31498:193018` | OW_ANNO_001 - 9 | プロフィール tab 基本情報 (sửa) — 住所検索, 保存/キャンセル | `OW_PROF_001` | — |
| `31498:193104` | OW_ANNO_001 - 8 | プロフィール tab **配送対応情報** (xem) | `OW_PROF_002` | **Chưa có** |
| `31498:193191` | OW_ANNO_001 - 10 | プロフィール tab 配送対応情報 (sửa) — chip có nút xoá | `OW_PROF_002` | — |

> Tab `配送対応情報` **trùng khớp 100%** với step 2 của form đăng ký (`R02`) → dùng chung 1 data model.

### 2.8 Component dùng chung

| Node ID | Component | Ghi chú |
|---|---|---|
| `31498:194809` | `sider` | **IA chính thức**: ホーム · スケジュール · 配送管理 · 見積もり管理 · 集金・駐車 · 配送スタッフ · プロフィール + trạng thái thu gọn icon-only |
| `31498:194758` | `Tab Item` | (chưa đọc — component state thuần) |
| `31498:194118` / `31498:194126` | `table-header/default`, `row expand` | (chưa đọc — component state thuần) |

### 2.9 Vùng nháp — chưa vào scope

| Node ID | Frame | Lý do loại |
|---|---|---|
| `31498:195130` | quote-request-list (見積依頼一覧) | Không thuộc Flow note nào; header `LOGI CORE ポータル`, sidebar khác `sider` chính thức |
| `31498:195233` | quote-request-response (見積依頼回答) | như trên — có thêm khối 契約前の金額再確認 |
| `31498:195297` | quote-request-details (見積依頼詳細) | như trên — có 回答履歴 timeline |
| `31498:194865` | weekly-schedule | Bản tuần thay thế (午前/午後/夕方便) — khác bản chính `31498:191010` |
| `31498:195410` | empty-form | Bản cũ của `R01` (branding `ES KITCHEN`, label lỗi `ラベル`) — trùng lặp |

---

## 3. Xung đột với tài liệu / code hiện có

| # | Xung đột | Bằng chứng | Ảnh hưởng |
|---|---|---|---|
| C1 | **Self-registration** | `features/delivery-partner/SPEC.md` ghi `[Confirmed]: Tài khoản E05 do E03 (System Admin) cấp thủ công — không có flow tự đăng ký`. Figma P2 có nút 新規登録 + form 2 bước | Chặn toàn bộ nhóm Auth/Register |
| C2 | **3 hệ Screen Code** | SPEC dùng `OW_DLVP_001–012`; `api-doc/deliverer` dùng `OW_ANNO/OW_DLVR/OW_CLCT/OW_STAF`; Figma dùng `OW_AUTH/OW_SCHED/OW_ANNO` và **đặt sai tên frame** (配送管理, 配送スタッフ, プロフィール đều mang tên `OW_SCHED_001`/`OW_ANNO_001`) | QC không trace được TC ↔ màn |
| C3 | **Fee-area biến mất** | `FeeAreaTab`, `FeeEditModal`, import/export CSV phí đã implement và có trong `scope-changes-phase2.md` §E05, nhưng プロフィール P2 chỉ còn 2 tab | Có nguy cơ xoá nhầm tính năng đang chạy |
| C4 | **Dữ liệu mẫu sai** | Tab 変更履歴 hiển thị `栄養成分を更新`, `商品価格を「150 → 180」に変更` — copy từ màn sản phẩm | QC hiểu nhầm nội dung log |
| C5 | **Frame trùng lặp** | `empty-form` vs `R01_Register Form` | Dev có thể code nhầm bản cũ |
| C6 | ~~api-catalog lỗi thời~~ → **ĐÃ XỬ LÝ 2026-09-18** | `backend/es-kitchen-api/overview/api-catalog.md` §Deliverer trước đây chỉ có `auth` + `account`; đã bổ sung đủ 11 nhóm endpoint từ code thật | — |
| C7 | **`API設計_配送関連.md` lệch path** | Tài liệu Phase 1 dùng `/deliverer/shipments`, code thật là `/deliverer/delivery-blocks`. Tài liệu §D (委託配送先 admin) cũng đã lạc hậu so với `/admin/deliverers` đang có | Dev đọc nhầm tài liệu Phase 1 sẽ gọi sai path. Đã ghi chú trong api-catalog + [BE Design §4.0](es-kitchen-api/Design-Technical.md) |
| C8 | **Cột CSV 集金 khác nhau** | Code hiện xuất `発送日/配送スタッフ名/納品先/集金合計/駐車場料金/差額/提出日時`; Figma yêu cầu `配送日/配送ID/配送スタッフID/配送スタッフ名/配送先名/集金金額/駐車料金` | Đổi cột = breaking change với vận hành đang dùng file cũ |
| C9 | **Thiếu loại thông báo メンテナンス** | `NotificationType` hiện có 7 giá trị, không có giá trị cho badge `メンテナンス` trên ホーム | Xem Q9 |

---

## 4. Câu hỏi chặn (cần PM/BA chốt)

| # | Câu hỏi | Chặn hạng mục |
|---|---|---|
| Q1 | Self-registration có thật không? Nếu có, sau khi submit thì trạng thái là gì (仮登録 chờ E03 duyệt?) và ai duyệt ở màn nào? | BE-09, FE-12, FE-13 |
| Q2 | Chốt 1 hệ Screen Code duy nhất + yêu cầu Designer đặt lại tên frame Figma | Toàn bộ QC |
| Q3 | Fee-area (phí theo khu vực) giữ hay bỏ trong P2? | FE-13 |
| Q4 | Rule khoá 7 ngày: mốc là `配送日（着）` hay `発送予定日`? BE có chặn không hay chỉ FE disable? Khoá những field nào (chỉ 配送スタッフ hay cả form)? | BE-04, FE-04 |
| Q5 | 非公開資料: phạm vi gắn theo 配送 (delivery_block) hay theo 住所/契約? Ai xem được (E03 admin có thấy không)? Giới hạn dung lượng/định dạng? | BE-12, FE-16 |
| ~~Q6~~ | ~~CSV encoding~~ → **ĐÃ GIẢI**: code hiện tại đã xuất UTF-8 + BOM (`deliverer-collection-report.service.ts`), khớp `API設計` A3. Chỉ còn cần PM xác nhận **đổi 7 cột** theo Figma (C8) vì ảnh hưởng vận hành đang dùng file cũ | — |
| Q9 | Badge `メンテナンス` trên màn ホーム map sang `NotificationType` nào? Thêm giá trị enum mới hay dùng lại `SYSTEM_ANNOUNCEMENT`? | BE-10, FE-14 |
| Q7 | Cụm 見積 `LOGI CORE` (vùng nháp): bỏ hay merge vào 見積もり管理 của ESSTATION? | BE-08, FE-11 |
| Q8 | 廃棄数/陳列結果: driver app P2 có bắt buộc nhập `実在庫`/`実際数` không? Hiển thị gì khi report thiếu? | BE-04, FE-05 |

---

## 5. Bước tiếp theo

1. PM/BA trả lời Q1–Q8 → cập nhật file này (mục 4) trước khi dev bắt đầu hạng mục bị chặn.
2. BA chạy `/create-spec delivery-partner` để sinh SPEC.md chính thức (kèm `## BA Deliverables` + `## Screens` có Figma Link).
3. Designer đặt lại tên frame theo Screen Code đã chốt.
4. Tech Lead Tasks phân rã từ 2 file `Design-Technical.md` trong thư mục này.
