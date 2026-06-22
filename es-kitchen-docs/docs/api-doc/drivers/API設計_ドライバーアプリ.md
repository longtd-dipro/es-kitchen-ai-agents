# ドライバーアプリ — API 設計 (Driver App / E06)

> **Chỉ chứa thiết kế API** (danh sách endpoint theo màn). Đặc tả DTO / request / response / business rule chi tiết: xem 6 contract file trong [`apis/`](./apis/README.md). DB / adequacy / migration: xem [`DB変更提案_ドライバーアプリ.md`](./DB変更提案_ドライバーアプリ.md). Catalog + lifecycle + NFR: xem [`README.md`](./README.md).

## Quy ước
- **Prefix `/driver`**, `DriverGuard` (Bearer Driver Cognito) — **mọi query ép `shipments.driver_id = me`**, mọi `:id` kiểm tra thuộc tài xế (404/403 nếu không). Danh tính lấy từ token, **không** nhận `driverId` body.
- `Accept-Language: ja | vi` (default `ja`) → server trả chuỗi đã dịch.
- List dùng **cursor pagination**: `?cursor=&limit=` (default 20, max 50) → `{ items[], nextCursor, hasMore }`. Detail/completion **không** paginate.
- Ngày: ISO 8601 (+tz); date-only `yyyy-MM-dd`.
- Lỗi chuẩn: 400 (`error`/`validaton_error`) · 401 (`unauthorized`) · 403 (`forbidden`) · 404 (`not_found`) · 409 (`conflict`). Mã nghiệp vụ ở `errorCode` (vd `DRIVER_4001`). Xem [README › Error catalog](./README.md#5-error-catalog).
- Resource `/driver/deliveries/:deliveryId` **dùng chung** COOL + ES (FE phân nhánh theo `shipmentType`; mỗi `deliveryId` = `shipment_companies.id` chỉ thuộc 1 loại).

---

# A. ダッシュボード — DA_HOME_001

| Method | Path | Query/Body | Response → UI |
|---|---|---|---|
| GET | `/driver/home` | — | KPI hôm nay (`todayTotal/completed/remaining/progressPercent`) + `blocks[]` gom theo kho (mỗi block = 1 thẻ kho, có `companies[]`) |
| GET | `/driver/schedules` | `days` (default 3) | Lịch giao **gom theo ngày**: `schedules[]: { date, label(本日/明日/明後日), items[], emptyMessage }` — `emptyMessage != null` khi ngày rỗng (`DA_HOME_001_Empty`) |

> `deliveryStatus` cấp công ty là **giá trị suy ra** (DELIVERED ⇐ `delivery_completion_reports.submitted_at`, TROUBLE ⇐ trouble report) — không có cột status ở `shipment_companies`, không có `DELIVERING`.

---

# B. 配送一覧 — DA_LIST_00 (A/B/C)

**Một endpoint** phục vụ cả 3 tab; `tab` quyết định shape response + cách lọc. Đơn `DELIVERED` (配送完了) **không** xuất hiện (list chỉ chứa việc chưa xong).

| Method | Path | Query | Ghi chú |
|---|---|---|---|
| GET | `/driver/delivery-list` | `tab`(WAREHOUSE_RECEIPT/ES_DELIVERY/COOL), `startDate/endDate`(≤31 ngày), `keyword`, `cursor`, `limit` | Wrapper `{ tab, tabCounts, dateRange, items[], nextCursor, hasMore }` |
| | | `receiptStatus[]`, `locationType` | **Chỉ Tab A** (倉庫受付) — bỏ qua nếu tab khác |
| | | `deliveryStatus[]` (UNDELIVERED/TROUBLE) | **Chỉ Tab B/C** — `DELIVERED` không hợp lệ |

| Tab | `tab` | 日本語 | Item shape | Điều kiện dữ liệu |
|---|---|---|---|---|
| A | `WAREHOUSE_RECEIPT` | 倉庫受付 | `WarehouseReceiptItemDto` | mọi `receiptStatus` (filter qua param) |
| B | `ES_DELIVERY` | ES配送便 | `DeliveryItemDto` | `shipmentType=ES_DELIVERY` & `deliveryStatus IN (UNDELIVERED, TROUBLE)` |
| C | `COOL` | COOL便 | `DeliveryItemDto` | `shipmentType=COOL` & `deliveryStatus IN (UNDELIVERED, TROUBLE)` |

---

# C. 荷物受取 — DA_RECV_001 / 003

| Method | Path | Body | Ghi chú |
|---|---|---|---|
| GET | `/driver/receipts/:receiptId` | — | Header kho + `summary` + `groups[]` (theo 納品先), mỗi group có `items[]` (送り状 + `received`). Cùng endpoint cho cả DA_RECV_001 (`completedAt=null`) và DA_RECV_003 (`completedAt!=null`, read-only) |
| POST | `/driver/receipts/:receiptId/complete` | `{ receivedItemIds[], esKitchenContacted }` | `FULL` (mọi kiện nhận được đều tick) / `PARTIAL` (còn kiện chưa nhận → **bắt buộc** `esKitchenContacted=true`, ngược lại 400). Cả hai set `receiptStatus=RECEIVED`. Idempotent: `completedAt!=null` → 409 |

> `receiptId` = `id` thẻ kho ở Home / Tab A delivery-list. Lọc 未確認のみ表示 + ô 納品先拠点名 là **client-side** (không có query param).

---

# D. ES配送便 (wizard 5 bước) — DA_ESDL_000 〜 006

Luồng: 陳列前(ảnh) → 在庫/廃棄 → 検品・陳列 → 陳列後(ảnh) → 集金 → 完了. `deliveryId` = `shipment_companies.id`.

| Method | Path | Bước / Màn | Body | Ghi chú |
|---|---|---|---|---|
| GET | `/driver/deliveries/:deliveryId` | DA_ESDL_000 | — | Header + 3 tab + `destination` + `packages.boxes[]` + `editMode` + `currentStep`/`lastCompletedStep` + `steps{}`. `completedAt!=null` → **embed** dữ liệu các bước cho tab tổng kết DA_ESDL_006 |
| PUT | `/driver/deliveries/:deliveryId/pre-display-photos` | Step 1 (DA_ESDL_001) | `{ photoUrls[] }` (1–5) | Thay thế toàn bộ mảng. **Side-effect lần đầu:** `shipments ASSIGNED→IN_TRANSIT` + history `STARTED_DELIVERY` |
| GET | `/driver/deliveries/:deliveryId/inventory-check` | Step 2 load (DA_ESDL_002) | — | `items[]: { logicalStock(理論), wasteQuantity(∑disposal), actualStock(実在庫) }` + `menuYearMonth`/`nextDeliveryDate` |
| POST | `/driver/deliveries/:deliveryId/inventory-check` | Step 2 submit | `{ menuYearMonth?, remarks?, items[], disposalItems[] }` | Upsert. `difference = actual − logical` (server tính). `disposalItems[].quantity` → `disposal_report_items` |
| GET | `/driver/deliveries/:deliveryId/display-inspection` | Step 3 load (DA_ESDL_003) | — | `items[]: { shipmentDetailId, quantity(予定), actualQuantity(実際), inspectionStatus }` |
| POST | `/driver/deliveries/:deliveryId/display-inspection` | Step 3 submit | `{ items[]: { shipmentDetailId, actualQuantity } }` | Server suy `inspectionStatus` (MATCHED/SHORTAGE/EXCESS) + set kiện ES → `inspection_status=CHECKED` |
| PUT | `/driver/deliveries/:deliveryId/post-display-photos` | Step 4 (DA_ESDL_004) | `{ photoUrls[] }` (1–5) | Như Step 1 nhưng `post_display_photo_urls` |
| POST | `/driver/deliveries/:deliveryId/complete` | Step 5 (DA_ESDL_005) | `{ collectedAmount, companyRepName?, remarks? }` | 集金登録 + **chốt** delivery → `deliveryStatus=DELIVERED`, `submitted_at=now`. `expectedAmount` read-only (server snapshot). Trả `shipmentCompleted` (chuyến xong toàn bộ?) |
| GET·PUT | `/driver/deliveries/:deliveryId/parking-report` | DA_ESDL_006-02/03 | `{ parkingFee?, receiptPhotoUrls[]? }` | Tab 駐車報告 — phí gửi xe + ảnh biên lai |

> Resume: server tính `currentStep` = bước đầu tiên `submitted=false`. `POST .../complete` chặn nếu thiếu bước trước → `400 前のステップが完了していません`.

---

# E. COOL便 (one-shot) — DA_COOL_001

| Method | Path | Body | Ghi chú |
|---|---|---|---|
| GET | `/driver/deliveries/:deliveryId` | — | `shipmentType=COOL` → `boxes[]` (tick) + `destination` + `cargoSummary`. **Không** có ảnh / 駐車報告 (đó là bước của wizard ES) |
| POST | `/driver/deliveries/:deliveryId/complete` | `{ boxes[]: { boxId, checked }, isPartiallyDelivered, esKitchenContacted }` | Tick đủ kiện → `DELIVERED`; còn kiện chưa tick → modal partial → `isPartiallyDelivered=true` chỉ hợp lệ khi `esKitchenContacted=true` → `PARTIALLY_DELIVERED` |

> Nút 完了 do **FE tự tính** (server không trả field gating): bật khi mọi `boxes[].checked=true`. Errors: `DRIVER_4001` (thiếu kiện) · `DRIVER_4002` (partial thiếu liên hệ ES) · `DRIVER_4031` (không phải tài xế) · `DRIVER_4041` (not found).

---

# F. トラブル報告 — DA_RPTD_001 / 002

| Method | Path | Body | Ghi chú |
|---|---|---|---|
| GET | `/driver/trouble-reports/targets` | `keyword`, `cursor`, `limit` | List **trộn** điểm giao (`DELIVERY`, status UNDELIVERED/TROUBLE) + điểm nhận (`WAREHOUSE_RECEIPT`, status UNRECEIVED/TROUBLE) để radio chọn 1. Item kế thừa shape delivery-list, gói trong `TroubleTargetItemDto` |
| — | (form `DA_RPTD_002`) | — | **Không có endpoint riêng**: tái dùng `GET /driver/deliveries/:id` (DELIVERY) hoặc `GET /driver/receipts/:id` (WAREHOUSE_RECEIPT) để dựng box list; `reasonOptions` = **enum FE** `TroubleReason` |
| POST | `/driver/trouble-reports` | `{ targetType, targetId, reason, type, description?, affectedBoxIds[]?, photoUrls[]?, esKitchenContacted? }` | Tạo 1 `trouble_reports` (`PENDING`, `report_no=TR{seq}`) + N `trouble_report_items`. Sau gửi: target → `TROUBLE` & **bị khóa thao tác**. 1 target chỉ 1 report mở → 409 nếu trùng |

> `type` (`TROUBLE`/`DELAY`) FE gửi kèm `reason` vì `SHORTAGE`/`OTHER` thuộc cả 2 bộ. `description` **bắt buộc** khi reason `requiresDescription=true` (vd `OTHER`). `esKitchenContacted` — **TBD** cột DB (xem `DB変更提案 G7`).

---

# G. Hạ tầng dùng chung — Upload ảnh

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/files/presigned-upload-url(s)` | Trả `{ key, uploadUrl, fileUrl, expiresIn }`. FE upload S3 trước → submit mảng `fileUrl` vào endpoint bước (Step 1/4, 駐車報告, トラブル報告), tối đa 5 ảnh |

> ⚠️ **TBD (G8):** endpoint `/files/*` hiện gắn `AdminGuard` — cần mở cho Driver Cognito pool (hoặc thêm `/driver/uploads/*` cùng pattern). Chốt trước khi triển khai.

---

# H. Enum dùng chung

Định nghĩa đầy đủ (value + 日本語 + ý nghĩa) → [`apis/README.md › Shared enums`](./apis/README.md#-shared-enums-dùng-chung-nhiều-endpoint):
`ShipmentType` (COOL/ES_DELIVERY) · `DeliveryStatus` (UNDELIVERED/DELIVERED/PARTIALLY_DELIVERED/TROUBLE) · `ReceiptStatus` (UNRECEIVED/RECEIVED/TROUBLE/CANCELLED) · `CargoType` (REFRIGERATED/FROZEN/NORMAL) · `BoxInspectionStatus` (PENDING/CHECKED) · `ItemInspectionStatus` (NOT_INSPECTED/MATCHED/SHORTAGE/EXCESS).

Enum riêng feature: `DeliveryListTab` · `LocationType` · `ReceiptCompletionType` · `WizardStep` · `DeliveryEditMode` · `ShipmentHistoryStatus` · `TroubleReason` · `TroubleType` · `TroubleReportStatus` · `TroubleTargetType` — định nghĩa trong contract file tương ứng.
