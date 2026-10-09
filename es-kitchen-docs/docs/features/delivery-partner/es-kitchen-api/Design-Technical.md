# Design-Technical: Delivery Partner P2 — es-kitchen-api

> **Repo:** `es-kitchen-api` · Module: `src/modules/deliverer/` · Guard: `DelivererGuard` · Prefix: `/deliverer`
> **Đầu vào:** [Figma-Analysis.md](../Figma-Analysis.md) (canvas `Delivery (P2)`, node `26173:304942`)
> **Chưa có SPEC.md chính thức** — mọi quyết định phụ thuộc Q1–Q8 đều được đánh dấu `[PENDING Qx]`, dev **không được implement** hạng mục `[PENDING]` trước khi PM/BA trả lời.
> **Stack lock:** NestJS 11 · TypeORM 0.3.28 · PostgreSQL · REST · **không Redis** (repo dùng PostgreSQL LISTEN/NOTIFY cho socket — xem `backend/es-kitchen-api/overview/structure.md`)

---

## 1. Tổng quan thay đổi

| # | Layer | File / Vị trí | Loại | Ghi chú |
|---|---|---|---|---|
| BE-01 | Controller + Service | `deliverer/http/controllers/deliverer-schedule.controller.ts` (mới) + `services/deliverer-schedule.service.ts` (mới) | Thêm | Lịch tháng |
| BE-02 | Service | `deliverer-schedule.service.ts` | Thêm | Lịch tuần |
| BE-03 | Request DTO | `http/requests/deliverer-schedule-query.request.ts` (mới) | Thêm | Search lịch |
| BE-04 | Response + Service | `responses/delivery-block-detail.response.ts` · `services/delivery-block.service.ts` | **Sửa** | Thêm khối 実績 / 添付資料 |
| BE-05 | Response + Service | `responses/deliverer-driver-list.response.ts` · `services/deliverer-driver.service.ts` | **Sửa** | Thêm 免許 / アカウント状態 / filter / sort |
| BE-06 | Controller + Service | `deliverer-driver.controller.ts` · `deliverer-driver.service.ts` | Thêm | Bulk phát hành tài khoản |
| BE-07 | Service | `deliverer-collection-report.service.ts` | **Sửa** | 駐車合計料金 + chuẩn hoá CSV |
| BE-08 | Service | `deliverer-quotation-request.service.ts` | **Sửa** | `[PENDING Q7]` 金額再確認 + KPI |
| BE-09 | Entity + Migration + Service | `entities/deliverer.entity.ts` · migration mới · `deliverer-self-service.service.ts` | **Sửa** | `[PENDING Q1/Q3]` 配送対応情報 |
| BE-10 | Controller + Service | `deliverer-dashboard.controller.ts` (mới) | Thêm | Tổng hợp ホーム |
| BE-11 | Request DTO + Service | `requests/list-delivery-block.request.ts` · `delivery-block.service.ts` | **Sửa** | Bộ lọc nâng cao 配送管理 |
| BE-12 | Entity + Migration + Controller | `entities/delivery-block-private-attachment.entity.ts` (mới) | Thêm | `[PENDING Q5]` Tài liệu không công khai |
| BE-13 | Service | `delivery-block.service.ts` | **Sửa** | `assignable-drivers` trả thêm 配送件数 |
| BE-14 | Controller + Service | `deliverer-driver.controller.ts` | Thêm | Lịch sử thay đổi driver |

**Không cần migration cho khối 実績** — dữ liệu đã tồn tại đầy đủ (xem §3.1). Đây là thay đổi lớn nhất so với ước lượng ban đầu.

---

## 2. Flow System Structure

### 2.1 Sơ đồ liên kết chức năng

```
┌─ E05 Portal (web-outsource-web-private) ─┐   ┌─ es-kitchen-api / module deliverer ──────────────┐   ┌─ Nguồn dữ liệu ─────┐
│                                           │   │                                                  │   │                     │
│ OW_HOME_001  ホーム                        │──▶│ DelivererDashboardController.overview()          │   │                     │
│                                           │   │   ├─▶ ScheduleService.monthly(compact)           │──▶│ delivery_blocks     │
│                                           │   │   ├─▶ NotificationService.list(limit=4)          │──▶│ notifications       │
│                                           │   │   └─▶ QuotationService.countUnanswered()         │──▶│ quotation_request_* │
│                                           │   │                                                  │   │                     │
│ OW_SCHED_001 スケジュール(月)               │──▶│ DelivererScheduleController.monthly()            │   │                     │
│ OW_SCHED_002 スケジュール(週)               │──▶│   └─▶ ScheduleService                            │   │                     │
│                                           │   │        ├─▶ delivery_blocks (group by ngày)       │──▶│ delivery_blocks     │
│                                           │   │        ├─▶ delivery_cycles + assignments         │──▶│ delivery_cycles     │
│                                           │   │        └─▶ picking_unavailable_days  [PENDING]   │──▶│ picking_unavail_days│
│                                           │   │                                                  │   │                     │
│ OW_DLVR_001 配送管理一覧                    │──▶│ DeliveryBlockController.list() (+11 filter)      │──▶│ delivery_blocks     │
│ OW_DLVR_002 配送詳細 (4 tab)                │──▶│ DeliveryBlockController.detail()                 │   │                     │
│   ├ 配送概要 / 配送住所                     │   │   ├─▶ delivery_addresses + contract attachments  │──▶│ contract_delivery_* │
│   ├ 実績                                   │   │   ├─▶ DeliveryReport + DisposalReport(+items)    │──▶│ delivery_reports    │
│   │                                        │   │   ├─▶ InventoryCheck(+items) 理論/実在庫          │──▶│ inventory_checks    │
│   │                                        │   │   └─▶ ShipmentDetail 予定数/実際数                │──▶│ shipment_details    │
│   └ 添付資料                                │   │   └─▶ 駐車報告 / 集金報告 (delivery_reports)      │   │                     │
│        + 非公開資料 [PENDING Q5]            │◀─▶│ PrivateAttachmentController (CRUD)               │──▶│ S3 + bảng mới       │
│                                           │   │                                                  │   │                     │
│ OW_STAF_001/003/004/005 配送スタッフ        │──▶│ DelivererDriverController                        │   │                     │
│                                           │   │   ├─▶ list() + 免許 + アカウント状態              │──▶│ drivers             │
│                                           │   │   ├─▶ bulkIssueAccount()  ─────────────┐         │   │                     │
│                                           │   │   └─▶ history()                        │         │──▶│ driver_history_logs │
│                                           │   │                                        └────────▶│──▶│ AWS Cognito + SES   │
│ OW_CLCT_001 集金・駐車                      │──▶│ DelivererCollectionReportController              │──▶│ delivery_reports    │
│ OW_PROF_001/002 プロフィール                │──▶│ DelivererSelfServiceController.profile()         │──▶│ deliverers          │
└───────────────────────────────────────────┘   └──────────────────────────────────────────────────┘   └─────────────────────┘
```

### 2.2 Danh sách chức năng chính + liên kết

| Chức năng | Depends on | Shares data với | Trigger |
|---|---|---|---|
| Lịch tháng/tuần | `delivery_blocks`, `delivery_cycles`, `delivery_cycle_assignments` | Dùng chung bảng với 配送管理一覧 và admin `delivery-calendar` | HTTP GET |
| Chi tiết 配送 (4 tab) | `delivery_blocks`, `delivery_reports`, `disposal_reports(+items)`, `inventory_checks(+items)`, `shipment_details` | **Ghi bởi Driver App (E06)** — portal chỉ đọc | HTTP GET |
| Gán tài xế | `drivers`, `delivery_blocks.driver_id` | Admin (E03) cũng gán được qua `/admin/shipments/:id/assign-driver` | HTTP PATCH |
| Bulk phát hành tài khoản | `drivers`, Cognito, SES | Dùng chung path với `POST /drivers/:id/send-password` hiện có | HTTP POST |
| 集金・駐車 | `delivery_reports.collected_amount / parking_fee` | Cùng nguồn với tab 添付資料 của 配送詳細 | HTTP GET |
| Hồ sơ / Đăng ký | `deliverers`, `deliverer_contacts` | `admin/deliverers` đọc-ghi cùng bảng | HTTP GET/PATCH/POST |
| Dashboard | Schedule + Notification + Quotation services | Không sở hữu bảng riêng — thuần aggregate | HTTP GET |

**Cảnh báo coupling:** `delivery_blocks` là bảng nóng, được ghi bởi admin (`admin/delivery/*`), driver app (`driver/*`) và portal (assign-driver). Mọi thay đổi shape response phải giữ nguyên field cũ (xem §8).

### 2.3 Đánh giá thiết kế (Design Rationale)

- **Khối 実績 là read-only aggregation, không tạo bảng mới** — `inventory_check_items.logical_stock / actual_stock / difference` và `shipment_details.quantity / actual_quantity` đã đúng nghĩa 理論在庫/実在庫 và 予定数/実際数. Tạo bảng mới sẽ duplicate dữ liệu driver app đang ghi và sinh vấn đề đồng bộ.
- **Tách `DelivererScheduleService` khỏi `DeliveryBlockService`** — lịch là truy vấn aggregate theo ngày/cycle (GROUP BY), danh sách là truy vấn phân trang theo bản ghi. Gộp chung sẽ khiến 1 service ôm 2 loại query pattern khác hẳn nhau và khó đánh index riêng.
- **Không cache (không Redis)** — repo không có Redis (`structure.md`). Lịch tháng giới hạn 1 tháng/1 deliverer → dựa vào index `(deliverer_id, scheduled_delivery_date)`; nếu đo thấy chậm thì bàn tiếp, không tự thêm hạ tầng cache mới.
- **Endpoint dashboard gộp 1 lần gọi** thay vì FE gọi 3 API — màn ホーム luôn cần đủ 3 khối; gộp giảm 3 round-trip và cho phép BE giới hạn payload (mini-calendar chỉ cần `件数` chứ không cần danh sách điểm giao).
- **Bulk issue chạy đồng bộ, trả kết quả từng dòng** — Figma yêu cầu hiển thị lỗi theo từng nhân viên + nút 再度実行; nếu đẩy sang queue thì FE phải polling và không có state để hiển thị ngay. Giới hạn số dòng/lần (xem §4 BE-06).
- **`assignable-drivers` trả kèm `deliveryCountOnDate`** thay vì FE gọi N+1 lần đếm — dropdown hiển thị số việc trong ngày cho mỗi tài xế; tính 1 lần bằng 1 GROUP BY rẻ hơn nhiều.
- **Giữ nguyên toàn bộ endpoint `fee-change-requests`** dù Figma P2 không vẽ — không xoá tính năng đang chạy khi chưa có quyết định (xem C3/Q3).

---

## 3. Database Changes

### 3.1 Bảng đã có — TÁI DÙNG, không migration

> Đây là kết quả rà entity thực tế trong `src/entities/`. Dev **không được tạo bảng mới** cho các mục này.

| Nhu cầu từ Figma | Bảng / cột có sẵn |
|---|---|
| 廃棄数確認 — 廃棄数, 賞味期限 | `disposal_reports` + `disposal_report_items(product_name, quantity, unit, expiry_date)` |
| 廃棄数確認 — 理論在庫 / 実在庫 / 差異 | `inventory_checks(delivery_block_id, driver_id, submitted_at)` + `inventory_check_items(product_name, logical_stock, actual_stock, difference, unit)` |
| 陳列結果確認 — 予定数 / 実際数 / 誤差 | `shipment_details(delivery_block_id, product_name, quantity, actual_quantity, inspection_status)` — 誤差 = `quantity - actual_quantity` |
| 配送完了日時 | `delivery_reports.submitted_at` |
| 駐車報告 (駐車料金 + レシート) | `delivery_reports.parking_fee`, `parking_fee_receipt_photo_urls (jsonb)` |
| 集金報告 (集金予定額 / 集金額 / 差異) | `delivery_reports.expected_amount`, `collected_amount`, `difference` |
| 搬入経路・添付資料 (công khai) | `contract_delivery_attachments(contract_id, file_name, mime_type, file_size, sort_order)` |
| 免許証 | `drivers.license_image_urls (text[])` |
| 変更履歴 | `driver_history_logs(driver_id, content, changed_by, created_at)` |
| サイクル (A1–D7) | `delivery_cycles(week_label 'A'–'D', group_no, default_weekday, is_active)` + `delivery_cycle_assignments(cycle_id, contract_id, company_id, effective_from, effective_to)` |
| 見積 — 回答 / 履歴 / 添付 | `quotation_requests`, `quotation_request_deliverers`, `quotation_request_reply_logs`, `quotation_request_attachments` |

### 3.2 Migration cần thêm

#### M1 — `drivers`: trạng thái phát hành tài khoản (BE-05, BE-06)

| Column | Type | Null | Ghi chú |
|---|---|---|---|
| `account_issued_at` | `timestamptz` | YES | NULL = 未発行, có giá trị = 発行済み |
| `account_issued_by` | `bigint` | YES | FK `deliverers.id` hoặc `admins.id` — người bấm phát hành |

- Index: `idx_drivers_deliverer_issued (deliverer_id, account_issued_at)`
- **Không thêm cột `status` mới** — trước khi viết migration, dev phải `tilth_read` `drivers.entity.ts` xác nhận cột enum trạng thái hiện có (response DTO đang trả `DriverStatus`) và **tái dùng**; chỉ bổ sung giá trị enum `免許未登録` nếu enum hiện tại chưa cover (xem §8 R4).

#### M2 — `deliverers`: 配送対応情報 `[PENDING Q1/Q3]`

| Column | Type | Null | Nguồn từ Figma |
|---|---|---|---|
| `unavailable_weekdays` | `smallint[]` default `'{}'` | NO | 配送不可曜日 (0=CN…6=T7, 7=祝日) |
| `service_area_note` | `text` | YES | 対応エリアに関する備考 |
| `frozen_box_rental` | `boolean` | YES | 冷凍ボックスのレンタル希望 (要/不要) |
| `chilled_box_rental` | `boolean` | YES | 冷蔵ボックスのレンタル希望 |
| `has_cold_storage_space` | `boolean` | YES | 冷蔵保管スペース (あり/なし) |
| `equipment_note` | `text` | YES | 車両・設備情報に関する備考 |
| `agreed_terms_at` | `timestamptz` | YES | 契約書に同意します (thời điểm tick) |

- **Tái dùng** `service_areas (text[])` cho 対応エリア và `owned_vehicles` cho 保有車両 — không tạo cột mới.
- **Không xoá** `single_delivery_fee`, `payment_terms`, `negative_factors`, `achievement_areas` dù Figma P2 không vẽ (xem C3/Q3).

#### M3 — `delivery_block_private_attachments` (mới) `[PENDING Q5]`

| Column | Type | Null | Ghi chú |
|---|---|---|---|
| `id` | `bigserial` PK | NO | |
| `delivery_block_id` | `bigint` | NO | FK `delivery_blocks.id`, ON DELETE CASCADE |
| `deliverer_id` | `bigint` | NO | FK `deliverers.id` — chủ sở hữu, dùng cho ACL |
| `file_url` | `text` | NO | S3 key/URL |
| `file_name` | `varchar(255)` | YES | |
| `mime_type` | `varchar(100)` | YES | |
| `file_size` | `bigint` | YES | |
| `sort_order` | `int` default 0 | NO | |
| `created_by` | `bigint` | YES | |
| `created_at` / `updated_at` / `deleted_at` | timestamps | | soft delete |

- Index: `idx_dbpa_block (delivery_block_id) WHERE deleted_at IS NULL`
- Trước khi viết migration phải chốt Q5 (phạm vi gắn theo 配送 hay theo 住所/契約) — xem trade-off §3.4.

### 3.3 Cache

**Không dùng Redis** (repo không có). Thay bằng index:

| Index | Bảng | Phục vụ |
|---|---|---|
| `idx_db_deliverer_delivery_date (deliverer_id, scheduled_delivery_date)` | `delivery_blocks` | Lịch tháng/tuần, danh sách |
| `idx_db_deliverer_send_date (deliverer_id, scheduled_send_date)` | `delivery_blocks` | Lọc theo 発送日 |
| `idx_dr_block (delivery_block_id)` | `delivery_reports` | Tab 実績 / 添付資料 |

> Dev phải kiểm tra index đã tồn tại chưa (`database/migrations/`) trước khi thêm — tránh tạo trùng.

### 3.4 Trade-off — lưu 非公開資料 ở đâu `[PENDING Q5]`

| # | Approach | Impact | Blast radius | Effort | Rủi ro |
|---|---|---|---|---|---|
| 1 | **Bảng mới `delivery_block_private_attachments`** (khuyến nghị) | 1 entity + 1 migration + 1 controller mới | 0 consumer hiện có bị đụng | ~12h | Tài liệu gắn theo từng 配送 → đối tác phải upload lại mỗi chuyến |
| 2 | Thêm cột `visibility` + `deliverer_id` vào `contract_delivery_attachments` | Sửa bảng admin đang dùng | `contract_delivery_attachments` đang được `admin` + `contract` module đọc — phải rà mọi query để không lộ file 非公開 | ~14h | **Rủi ro lộ dữ liệu** nếu sót 1 query không filter visibility |
| 3 | Cột `jsonb` trên `delivery_blocks` | Không bảng mới | Đụng bảng nóng nhất | ~8h | Không soft-delete/sort/ACL từng file được; khó truy vết |

**Khuyến nghị: Approach 1** — blast radius = 0, ACL rõ ràng theo `deliverer_id`. Nếu nghiệp vụ trả lời Q5 rằng tài liệu dùng lại cho mọi chuyến tới cùng địa chỉ → chuyển sang gắn theo `delivery_address_id` (vẫn bảng riêng, chỉ đổi FK).

---

## 4. API Definition

> **Nguồn CONTRACT LOCK** cho task FE. FE copy nguyên bảng này vào `## API Definition` của task tương ứng.
> Base URL FE: `import.meta.env.VITE_API_URL` — không hard-code. Auth: Bearer JWT + `DelivererGuard` (ép `deliverer_id = me`) cho toàn bộ endpoint dưới đây.

### 4.0 Đối chiếu với `api-doc/deliverer/API設計_配送関連.md` (dọn gap C6)

> Tài liệu `API設計_配送関連.md` viết ở Phase 1 và **đã lệch so với code hiện tại**. Bảng dưới đối chiếu 3 chiều: tài liệu ↔ code thật ↔ nhu cầu Figma P2. Lấy **cột "Code thật"** làm chuẩn.

| Cụm | `API設計` Phase 1 | Code thật hiện tại | Kết luận cho P2 |
|---|---|---|---|
| 配送 | `/deliverer/shipments`, `/:id`, `/:id/assignable-drivers`, `PATCH /:id/assign-driver` | **`/deliverer/delivery-blocks`** + `/timeline` + `/summary` + `/:id` + `/:id/assignable-drivers` + `PATCH /:id/assign-driver` + `PATCH /:id/status` + `DELETE /:id` | **Path đã đổi** `shipments` → `delivery-blocks`. Tài liệu Phase 1 lỗi thời; P2 bám path thật |
| お知らせ | `/notifications`, `/:id`, `/unread-count` | Có đủ + thêm `PATCH /:id/read` | ĐÃ CÓ — P2 dùng lại nguyên trạng |
| 集金 | `/collection-reports`, `/summary`, `/:id`, `/export` (CSV UTF-8+BOM), `/report` | Có đủ 5 endpoint; **export đã là UTF-8 BOM, 7 cột** | ĐÃ CÓ phần lớn — P2 chỉ đổi cột + tên file (BE-07) |
| 配送スタッフ | `/drivers` (`q, type, approvalStatus`), `/:id`, POST, PATCH, DELETE, `/:id/send-password` | Có đủ; query thực tế là **`q`, `type`, `status`** (không phải `approvalStatus`) | ĐÃ CÓ — P2 mở rộng field + thêm bulk |
| 変更履歴 | Chỉ thiết kế cho **admin**: `GET /admin/drivers/:id/history` | Chưa có endpoint tương ứng ở portal deliverer | BE-14 **MỚI cho portal**, mirror thiết kế admin |
| 委託配送先 master (admin) | §D — **CHƯA THIẾT KẾ** | `/admin/deliverers` CRUD đã có trong api-catalog | Ngoài scope portal P2; §D của tài liệu Phase 1 đã lạc hậu |
| ES配送費 (phí theo vùng) | §D.1 — **gap nghiêm trọng**, thiếu cả DB lẫn API | Portal đã có `/deliverer/fee-change-requests` (+`/import`), FE có `FeeAreaTab` | Liên quan trực tiếp **C3/Q3**: trước khi quyết "bỏ fee-area", phải xác nhận nó chính là hiện thực của ES配送費 |

**Phân loại lại endpoint P2:**

| Loại | Endpoint |
|---|---|
| **MỚI hoàn toàn** | `/schedule/monthly`, `/schedule/weekly`, `/drivers/bulk-issue-account`, `/drivers/:id/history`, `/dashboard/overview`, `/delivery-blocks/:id/private-attachments*` |
| **SỬA endpoint đã có** | `/delivery-blocks` (filter), `/delivery-blocks/:id` (3 khối mới), `/delivery-blocks/:id/assignable-drivers` (count + keyword), `/drivers` (3 field + sort), `/collection-reports*` (parking + CSV) |
| **DÙNG LẠI nguyên trạng** | `/notifications*`, `/uploads/presigned-upload-url(s)`, `/auth/*`, `/account/*`, `/me/contacts/*`, `/register/regions/*` |
| **Thành dead code sau P2** | `/delivery-blocks/timeline`, `/delivery-blocks/summary` — bị `/schedule/weekly` và `/schedule/monthly` thay thế. **Chỉ xoá sau khi FE-01/FE-02 lên DEV và QA pass** → task dọn riêng |

---

### BE-01/02/03 — Lịch `[MỚI]`

| Method | Endpoint | Request | Response | Error |
|---|---|---|---|---|
| GET | `/deliverer/schedule/monthly` | `?month=2026-08&keyword=&addressKeyword=` | `{ month, days: MonthlyDay[], legend }` | 400, 401 |
| GET | `/deliverer/schedule/weekly` | `?week=2026-W32` hoặc `?from=&to=` + cùng bộ filter | `{ from, to, days: WeeklyDay[] }` | 400, 401 |

**Request DTO** (`DelivererScheduleQueryRequest`):
```
month:          string  — required cho monthly, format YYYY-MM
week:           string  — required cho weekly nếu không truyền from/to, format YYYY-Www
keyword:        string  — optional, max 255; match 法人ID / 法人名 / 拠点ID / 拠点名 / 契約ID
addressKeyword: string  — optional, max 255; match 住所 / 郵便番号 / 電話番号 / 担当者電話番号
```

**Response DTO — `MonthlyDay`:**
```
date:            string      — YYYY-MM-DD
cycleLabel:      string|null — vd "8月サイクル A1"  (delivery_cycles.week_label + group_no)
isCurrentMonthCycle: boolean — phân biệt 当月サイクル / 他月サイクル (màu legend)
cycleSuspended:  boolean     — サイクル休止 (không có cycle assignment hiệu lực trong ngày)
temporaryClosed: boolean     — 臨時休業  [PENDING Q8-note: nguồn picking_unavailable_days cần PM xác nhận]
counts: { frozen: number, chilled: number, material: number }  — 冷凍 / 冷蔵・常温 / 資材, map từ delivery_blocks.cargo_type
unassignedCount: number      — số block có driver_id IS NULL → badge ⚠未N件
isToday:         boolean
```

**Response DTO — `WeeklyDay`:** `date`, `cycleLabel`, `isCurrentMonthCycle`, `totalCount`, và
```
items: Array<{ deliveryBlockId, shipmentNo, destinationName, cargoType }>   — danh sách điểm giao trong ngày
```
> ⚠️ Bản tuần là **danh sách điểm giao** (node `31498:191010`), KHÔNG phải breakdown 午前/午後/夕方便 (frame `weekly-schedule` thuộc vùng nháp).

### BE-04 — Chi tiết 配送 `[SỬA — mở rộng response]`

| Method | Endpoint | Ghi chú |
|---|---|---|
| GET | `/deliverer/delivery-blocks/:id` | Giữ **nguyên toàn bộ field hiện có**, chỉ THÊM 3 khối dưới |

```
completedAt: string|null                  — delivery_reports.submitted_at (配送完了日時)
performanceNote: string|null              — delivery_reports.remarks

disposal: {                               — 廃棄数確認
  totalDisposed: number                   — disposal_reports.disposal_total_quantity
  totalLogicalStock: number               — SUM(inventory_check_items.logical_stock)
  totalActualStock: number                — SUM(inventory_check_items.actual_stock)
  totalDifference: number
  items: Array<{
    no, productCode, productName, category, photoUrl,
    disposedQty, expiryDate, logicalStock, actualStock
  }>
} | null                                  — null khi driver chưa nộp report  [PENDING Q8]

display: {                                — 陳列結果確認
  plannedTotal, actualTotal, diffTotal: number
  items: Array<{ no, productCode, productName, category, photoUrl, plannedQty, actualQty, diffQty }>
} | null

attachments: {                            — tab 添付資料
  parking: { fee: string|null, receiptUrls: string[] }
  collection: { expectedAmount: string|null, collectedAmount: string|null, difference: string|null }
}

editLock: {                               — [PENDING Q4]
  canEditDriver: boolean
  reason: 'LOCKED_AFTER_7_DAYS' | null
}
```

### BE-05 — Danh sách driver `[SỬA]`

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/drivers` | `?q&type&status&accountState&page&limit&sortBy&order` | `{ items: DriverListItem[], total, page, limit, totalPages }` |

Field **thêm** vào `DriverListItem` (giữ nguyên field cũ):
```
licenseImageUrls: string[]        — hiển thị thumbnail cột 免許 (ảnh đầu tiên)
accountState: 'ISSUED'|'NOT_ISSUED'  — từ account_issued_at
driverName: string|null           — xác nhận field này có trong list response (hiện chỉ thấy ở detail)
```
Query param **giữ nguyên tên đang có** trong `deliverer-driver-search.request.ts`: `q`, `type`, `status`, `page`, `limit`. Thêm mới: `accountState`, `sortBy` (whitelist: `driverCode` | `driverName` | `status` | `createdAt`), `order` (`ASC`|`DESC` — đặt tên `order` cho khớp `delivery-block-search.request.ts`, **không đặt `sortOrder`**).

> ⚠️ `sortBy` **bắt buộc dùng map whitelist** (`ORDER_BY_MAP`) — dự án đã từng có bug production do truyền thẳng chuỗi orderBy (xem `.claude/rules/coding-style.md`).

### BE-06 — Phát hành tài khoản hàng loạt `[MỚI]`

| Method | Endpoint | Request | Response | Error |
|---|---|---|---|---|
| POST | `/deliverer/drivers/bulk-issue-account` | `{ driverIds: number[] }` (1–100) | `{ total, succeeded, failed, results: BulkResult[] }` | 400, 401, 403 |

```
BulkResult: {
  driverId: number
  driverCode: string
  driverName: string|null
  email: string|null
  status: 'SUCCESS' | 'FAILED'
  errorCode: 'EMAIL_MISSING'|'ALREADY_ISSUED'|'COGNITO_ERROR'|'MAIL_SEND_FAILED'|'DRIVER_INACTIVE'|null
  errorMessage: string|null    — i18n ja, hiển thị trực tiếp trong modal
}
```
- HTTP **200 kể cả khi có dòng lỗi** (partial success) — FE dựa vào `failed > 0` để hiện màn `一部エラーあり` + nút 再度実行.
- Nút 再度実行 = gọi lại cùng endpoint với `driverIds` = các dòng `FAILED`.
- Idempotent: driver đã có `account_issued_at` → trả `ALREADY_ISSUED`, không gửi lại mail.

### BE-07 — 集金・駐車 `[SỬA]`

| Method | Endpoint | Thay đổi |
|---|---|---|
| GET | `/deliverer/collection-reports` | Thêm `parkingTotal` mỗi dòng |
| GET | `/deliverer/collection-reports/summary` | Thêm `parkingGrandTotal` |
| GET | `/deliverer/collection-reports/export` | Đổi cột + tên file (encoding giữ UTF-8 BOM) |

**Hiện trạng code** (`deliverer-collection-report.service.ts`): export **đã là CSV UTF-8 BOM (EF BB BF)**, 7 cột, tên file `collection-report-<yyyymm>.csv`. → **Q6 đã có lời giải, không còn chặn.**

| | Hiện tại (code) | Figma P2 yêu cầu |
|---|---|---|
| Encoding | UTF-8 + BOM | UTF-8 + BOM ✅ giữ nguyên |
| Cột | `発送日 · 配送スタッフ名 · 納品先 · 集金合計 · 駐車場料金 · 差額 · 提出日時` | `配送日 · 配送ID · 配送スタッフID · 配送スタッフ名 · 配送先名 · 集金金額 · 駐車料金` |
| Tên file | `collection-report-202608.csv` | `集金管理_{from:YYYYMMDD}-{to:YYYYMMDD}_{staffCond}_{YYYYMMDDHHmmss}.csv` — `staffCond` = `全配送スタッフ` khi không lọc, hoặc tên/ID tài xế đã lọc |

BE-07 thu hẹp còn: (1) đổi 7 cột theo bảng trên; (2) đổi hàm sinh tên file; (3) thêm `parkingTotal` vào **list response** (`summary` đã có `totalParkingFee` và item-level `parkingFee`).
⚠️ Đổi cột CSV là **breaking change với vận hành** đang dùng file cũ — xem §8 R6.

### BE-10 — Dashboard `[MỚI]`

| Method | Endpoint | Response |
|---|---|---|
| GET | `/deliverer/dashboard/overview` | `{ calendar: MonthlyDay[] (rút gọn), announcements: AnnouncementItem[], unansweredQuotations: QuotationItem[] }` |

```
calendar:  dùng lại MonthlyDay nhưng chỉ giữ date, cycleLabel, totalCount, unassignedCount, temporaryClosed
announcements: { id, type: NotificationType, isImportant: boolean, title, createdAt, isRead }[]  (tối đa 4)
   // NotificationType (commons/enums/notification.enum.ts) hiện có:
   //   MENU_PUBLISHED | SYSTEM_ANNOUNCEMENT | PAYMENT_REMINDER | IMPORTANT | NEWS | SURVEY | WISHLIST_CAMPAIGN
   // Figma hiển thị 3 badge: システム更新 / お知らせ / メンテナンス
   // → 「メンテナンス」KHÔNG có giá trị enum tương ứng  [PENDING Q9]
unansweredQuotations: { id, requestNo, title, receivedAt, deadline, status }[]  (tối đa 3)
```

### BE-11 — Bộ lọc nâng cao 配送管理 `[SỬA]`

> Radio `配送日（着）` trên Figma **không cần param `dateType` mới** — DTO hiện tại đã có 2 cặp range riêng (`scheduledSendDateFrom/To` cho 発送日, `deliveryDateFrom/To` cho 配送日（着）). FE map radio sang cặp tương ứng → giữ nguyên DTO cũ, không phá FE đang chạy.

| Method | Endpoint | Query params thêm |
|---|---|---|
| GET | `/deliverer/delivery-blocks` | **Đã có:** `shipmentNo`, `scheduledSendDateFrom/To`, `deliveryDateFrom/To`, `transitPointId`, `status`, `page`, `limit`, `sortBy`, `order`. **Thêm:** `branchKeyword`, `addressKeyword`, `cargoType`, `vendingMachine`, `deliveryMethod`, `origin`, `trackingOrStaffKeyword` |

### BE-12 — 非公開資料 `[MỚI, PENDING Q5]`

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/delivery-blocks/:id/private-attachments` | — | `{ items: Attachment[] }` |
| POST | `/deliverer/delivery-blocks/:id/private-attachments` | `{ files: [{ fileUrl, fileName, mimeType, fileSize }] }` | `{ items: Attachment[] }` |
| DELETE | `/deliverer/delivery-blocks/:id/private-attachments/:attachmentId` | — | `{ success: true }` |

- Upload dùng lại `POST /deliverer/uploads/presigned-upload-url` đã có — FE upload thẳng S3 rồi gọi POST đăng ký metadata.
- Guard: chỉ `deliverer_id = me` và `delivery_block.deliverer_id = me` mới đọc/ghi/xoá.
- Giới hạn định dạng/dung lượng: `[PENDING Q5]`.

### BE-13 — `assignable-drivers` `[SỬA]`

| Method | Endpoint | Thay đổi |
|---|---|---|
| GET | `/deliverer/delivery-blocks/:id/assignable-drivers` | Thêm `?keyword=` (tên/ID) và field `deliveryCountOnDate: number` mỗi item |

### BE-14 — Lịch sử driver `[MỚI]`

| Method | Endpoint | Response |
|---|---|---|
| GET | `/deliverer/drivers/:id/history` | `{ items: [{ changedAt, content, changedBy }], total, page, limit }` |

Nguồn: `driver_history_logs`. Chỉ trả log của driver thuộc `deliverer_id = me`.

### BE-08 / BE-09 `[PENDING]`

- **BE-08** 見積 金額再確認 + KPI — chờ Q7. Nếu làm: `quotation_requests.archived_by_request_id` gợi ý cơ chế "phát hành lại" đã có; cần PM xác nhận 金額再確認 là **request mới** (archive request cũ) hay **vòng trả lời thứ 2** trên cùng request.
- **BE-09** Đăng ký công khai + 配送対応情報 — chờ Q1/Q3.

---

## 5. Service Layer

### `DelivererScheduleService` (mới)
```
monthly(delivererId: bigint, q: DelivererScheduleQueryRequest): Promise<MonthlyScheduleResponse>
weekly(delivererId: bigint, q: DelivererScheduleQueryRequest): Promise<WeeklyScheduleResponse>
```
Luồng `monthly`:
1. Tính `[firstDay, lastDay]` của tháng (padding tới đủ tuần hiển thị — Figma hiện 28/7 → 7/9).
2. 1 query GROUP BY `scheduled_delivery_date`, `cargo_type` trên `delivery_blocks` WHERE `deliverer_id = me` (+ filter keyword qua JOIN `companies` / `contracts` / `delivery_addresses`).
3. 1 query đếm `driver_id IS NULL` theo ngày → `unassignedCount`.
4. 1 query `delivery_cycle_assignments` JOIN `delivery_cycles` hiệu lực trong khoảng → `cycleLabel` theo ngày; ngày không khớp assignment nào → `cycleSuspended = true`.
5. `[PENDING]` 1 query `picking_unavailable_days` → `temporaryClosed`.
6. Merge 4 nguồn vào mảng ngày. **Tuyệt đối không query trong vòng lặp ngày** (N+1).

### `DeliveryBlockService` (sửa)
```
findDetail(delivererId, blockId): Promise<DeliveryBlockDetailResponse>   // + 3 khối mới
getAssignableDrivers(delivererId, blockId, keyword?)                      // + deliveryCountOnDate
list(delivererId, query: ListDeliveryBlockRequest)                        // + 11 filter, ORDER_BY_MAP
private canEditDriver(block): { canEditDriver: boolean; reason: string|null }  // [PENDING Q4]
```
- `findDetail` dùng `leftJoinAndSelect` cho `delivery_reports`, `disposal_reports.items`, `inventory_checks.items`, `shipment_details` — **1 query**, không lazy load từng khối.
- `canEditDriver`: `diffDays(now, block.scheduledSendDate) >= 7 → false`. Đặt ở service để **BE chặn thật**, không chỉ FE disable (xem Q4).

### `DelivererDriverService` (sửa/thêm)
```
list(...)                                             // + licenseImageUrls, accountState, sort
bulkIssueAccount(delivererId, driverIds): Promise<BulkIssueAccountResponse>
getHistory(delivererId, driverId, paging)
```
Luồng `bulkIssueAccount`:
1. Validate `driverIds.length` ∈ [1,100]; load driver WHERE `id IN (...)` AND `deliverer_id = me` — id lạ → `results` ghi `FAILED / DRIVER_INACTIVE`.
2. Với từng driver: kiểm tra email → tạo/kích hoạt tài khoản Cognito → gửi mail SES → set `account_issued_at`.
3. **Mỗi driver 1 transaction riêng** — 1 dòng lỗi không rollback các dòng đã thành công (Figma yêu cầu partial success).
4. Tổng hợp `results` trả về; ghi `driver_history_logs` cho mỗi dòng SUCCESS.

### `DelivererCollectionReportService` (sửa)
```
list(...)      // + parkingTotal
summary(...)   // + parkingGrandTotal
export(...)    // đổi cột + filename theo §4 BE-07
```

### `DelivererDashboardService` (mới)
```
overview(delivererId): Promise<DashboardOverviewResponse>
```
Gọi song song (`Promise.all`) 3 service con, không tự query bảng.

---

## 6. Interface với repo khác

| Hướng | Nội dung |
|---|---|
| `es-kitchen-web-outsource-web-private` → API | Toàn bộ endpoint §4. FE **không được đoán endpoint** — copy bảng §4 vào task |
| Driver App (E06) → API | Ghi `delivery_reports`, `disposal_reports(+items)`, `inventory_checks(+items)`, cập nhật `shipment_details.actual_quantity`. Portal chỉ đọc. **Nếu driver app đổi shape các bảng này, tab 実績 vỡ** |
| Admin Web (E03) → API | `admin/deliverers`, `admin/drivers`, `admin/shipments/:id/assign-driver` ghi cùng bảng `deliverers` / `drivers` / `delivery_blocks` |
| AWS | Cognito (tạo tài khoản driver), SES (mail mật khẩu), S3 (ảnh giấy phép, receipt, 非公開資料) |
| WebSocket / Push | **Không dùng** trong phạm vi này |

---

## 7. Luồng xử lý chi tiết

### 7.1 Xem lịch tháng rồi mở 1 ngày
1. FE `GET /deliverer/schedule/monthly?month=2026-08`.
2. Service chạy 4–5 query aggregate (§5), merge theo ngày, trả `days[]`.
3. FE render ô ngày: `cycleLabel`, badge `counts`, tag `臨時休業` / `サイクル休止`, badge cảnh báo `⚠未{unassignedCount}件`.
4. User bấm 1 ngày → FE điều hướng sang 配送管理一覧 với `dateFrom=dateTo=<ngày>` (không có endpoint riêng cho "chi tiết ngày").

### 7.2 Gán tài xế cho 1 配送
1. FE mở `GET /deliverer/delivery-blocks/:id` → đọc `editLock.canEditDriver`.
2. `canEditDriver = false` → FE disable nút 編集 (khớp node `31498:190870`).
3. `true` → FE `GET .../assignable-drivers?keyword=` → dropdown hiện tên + ID + `deliveryCountOnDate`.
4. Bấm 確定 → `PATCH /deliverer/delivery-blocks/:id/assign-driver`.
5. BE **kiểm tra lại** `canEditDriver` trước khi ghi; vi phạm → `409 SHIPMENT_EDIT_LOCKED`.
6. Thành công → FE hiện toast `配送スタッフ設定完了しました。`

### 7.3 Phát hành tài khoản hàng loạt
1. FE tick nhiều dòng ở 配送スタッフ一覧 → bấm `アカウント一括発行` → modal xác nhận liệt kê các dòng đã chọn kèm `accountState`.
2. Bấm 発行する → `POST /deliverer/drivers/bulk-issue-account`.
3. BE xử lý tuần tự từng driver, mỗi driver 1 transaction (§5).
4. Trả `results[]`:
   - `failed = 0` → FE hiện modal ✅ `アカウント発行が完了しました`.
   - `failed > 0` → FE hiện modal ⚠️ `一部エラーあり` + danh sách dòng lỗi + nút `再度実行` (gọi lại với id lỗi).

### 7.4 Xem tab 実績
1. `GET /deliverer/delivery-blocks/:id` trả kèm `disposal` / `display`.
2. `disposal = null` hoặc `display = null` (driver chưa nộp) → FE hiển thị empty state. `[PENDING Q8]` — nội dung empty state chờ nghiệp vụ.
3. FE tô đỏ `expiryDate` quá hạn và `diffQty ≠ 0`.

---

## 8. Non-Regression Risks

| # | Tính năng hiện có | File liên quan | Rủi ro | Cách verify |
|---|---|---|---|---|
| R1 | 配送詳細 hiện tại của portal | `deliverer/http/responses/delivery-block-detail.response.ts` (0 dependent theo `tilth_deps`, nhưng FE đang bind) | Thêm field là an toàn; **đổi/xoá field cũ sẽ vỡ** `DeliveryStatusDetailForm.tsx` | Mở màn 配送詳細 cũ, xác nhận 5 section cũ vẫn hiển thị đủ |
| R2 | Admin gán tài xế | `admin/delivery/...shipments/:id/assign-driver` | Thêm rule khoá 7 ngày ở **service dùng chung** có thể chặn cả admin | Đặt rule trong service của deliverer, KHÔNG đặt trong service admin; test admin vẫn gán được đơn cũ |
| R3 | Driver App nộp report | `modules/driver/services/driver-es-delivery.service.ts` | Nếu thêm NOT NULL/constraint vào `delivery_reports`, `inventory_checks` → driver app submit lỗi | Migration chỉ ADD COLUMN nullable; chạy e2e driver submit |
| R4 | Driver status enum | `entities/driver.entity.ts`, `deliverer-driver-list.response.ts` | Thêm giá trị enum mới (`免許未登録`) có thể vỡ switch-case ở admin/driver app | `tilth_deps` trên enum file + grep mọi `switch` theo DriverStatus trước khi thêm |
| R5 | `POST /drivers/:id/send-password` | `deliverer-driver.controller.ts` | Bulk và single cùng ghi `account_issued_at` — lệch logic sẽ sinh trạng thái mâu thuẫn | Tách 1 private method `issueAccountForDriver()` dùng chung cho cả 2 |
| R6 | Export CSV hiện tại | `deliverer-collection-report.service.ts` | Đổi cột/tên file làm hỏng quy trình vận hành đang dùng file cũ | Hỏi PM trước khi đổi; giữ endpoint cũ nếu vận hành còn phụ thuộc |
| R7 | `contract_delivery_attachments` | `entities/contract-delivery-attachment.entity.ts` | Nếu chọn Approach 2 (§3.4) mà sót query filter visibility → **lộ tài liệu nội bộ** | Không chọn Approach 2 trừ khi rà đủ 100% query |
| R8 | Fee-area / fee-change-request | `deliverer-fee-change-request.controller.ts`, FE `FeeAreaTab.tsx` | Figma P2 không vẽ → dev có thể hiểu nhầm là bỏ | **Không xoá code** cho tới khi Q3 được trả lời |

---

## 9. Ước lượng

| ID | Hạng mục | Est | Phụ thuộc |
|---|---|---|---|
| BE-01 | Lịch tháng | 12h | M-index |
| BE-02 | Lịch tuần | 8h | BE-01 |
| BE-03 | Search lịch | 6h | BE-01 |
| BE-04 | Chi tiết 配送 + 実績 + 添付資料 + editLock | 14h | — |
| BE-05 | Danh sách driver mở rộng | 8h | M1 |
| BE-06 | Bulk phát hành tài khoản | 12h | M1 |
| BE-07 | 集金・駐車 + CSV | 6h | — (Q6 đã giải) |
| BE-08 | 見積 金額再確認 + KPI | 10h | **Q7** |
| BE-09 | 配送対応情報 + đăng ký công khai | 8h | **Q1/Q3**, M2 |
| BE-10 | Dashboard overview | 8h | BE-01 |
| BE-11 | Bộ lọc nâng cao 配送管理 | 10h | — |
| BE-12 | 非公開資料 | 12h | **Q5**, M3 |
| BE-13 | assignable-drivers + count | 4h | — |
| BE-14 | Lịch sử driver | 6h | — |
| M1/M2/M3 | Migration | 10h | — |

**Tổng BE: ~134h** — trong đó **~30h đang bị chặn** bởi Q1/Q3/Q5/Q7 (Q6 đã được giải bằng code hiện tại).

> Chưa tính task dọn dead code `/delivery-blocks/timeline` + `/summary` (~2h, chạy sau khi FE-01/02 pass QA).
