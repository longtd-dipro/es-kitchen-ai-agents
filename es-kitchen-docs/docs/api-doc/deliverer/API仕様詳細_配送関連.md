# 配送関連 — API 仕様詳細 (DTO / validation / response)

> Bổ sung cho `API設計_配送関連.md`. Đặc tả mức DTO theo convention codebase:
> - Phân trang kế thừa `BaseSearchRequest` (`page`,`limit`,`q`,`order`,`orderBy`).
> - List response: `{ items[], total, page, limit, totalPages }` (wrap qua `ApiUnifiedResponse`).
> - DTO camelCase + class-validator; enum đặt tại `src/commons/enums`.
> - Guard: Admin → `AdminGuard` (prefix `/admin`); Portal → `DelivererGuard` (prefix `/deliverer`, ép `delivererId = req.deliverer.id`).
> - Lỗi chuẩn: 400 (validation), 401, 403 (sai scope), 404 (không thuộc về mình), 409 (xung đột trạng thái).

## Enum mới (commons/enums)
```ts
// driver-type.enum.ts
export enum DriverType { INDIVIDUAL = 'INDIVIDUAL', CORPORATE = 'CORPORATE' }
// driver-approval-status.enum.ts  (badge: APPROVED=本登録, PENDING=仮登録, REJECTED=却下)
export enum DriverApprovalStatus { PENDING = 'PENDING', APPROVED = 'APPROVED', REJECTED = 'REJECTED' }
// notification-category.enum.ts  (tab 重要/お知らせ)
export enum NotificationCategory { IMPORTANT = 'IMPORTANT', INFO = 'INFO' }
// notification-recipient-type.enum.ts
export enum NotificationRecipientType { USER='USER', DELIVERER='DELIVERER', DRIVER='DRIVER', COMPANY_ADMIN='COMPANY_ADMIN', SUPPLIER='SUPPLIER' }
// shipment-status / delivery-mode / shipment-cargo-type / shipment-delivery-type — theo db.dbml §ENUMS
// shipment-time-slot.enum.ts  (時間帯 — value-list chốt với BA)
export enum ShipmentTimeSlot { MORNING='MORNING'/*午前*/, AFTERNOON='AFTERNOON'/*午後*/, EVENING='EVENING'/*夜間*/, ANYTIME='ANYTIME'/*指定なし*/ }
```

> **Đăng nhập Deliverer/Driver = CODE** (driverCode/delivererCode), hệ thống đã có. Trong mọi form: `ユーザID` = code login (hệ thống sinh seq, read-only khi xem); `メールアドレス` = email liên hệ (≠ login). `password` đi kèm code khi tạo.

---

# A. PORTAL DELIVERER (`/deliverer`)

## A1. お知らせ — OW_ANNO_001 / 002

### GET `/deliverer/notifications` — list (tab すべて/重要/お知らせ)
**Query** (`NotificationSearchRequest extends BaseSearchRequest`):
| field | type | req | note |
|---|---|---|---|
| `category` | enum `NotificationCategory` | optional | bỏ trống = すべて; IMPORTANT=重要; INFO=お知らせ |
| `page,limit,order,orderBy` | — | — | mặc định order=DESC, orderBy=createdAt |

**Response** `NotificationListResponse`:
```json
{
  "items": [{
    "id": "101",
    "title": "【2024/02/29】配送方法について",
    "category": "IMPORTANT",
    "content": "配送方法に関するいくつかの注意点があります。…（full text）",
    "links": [{ "label": "実行されようとしている（リンク）", "url": "https://...", "previewUrl": null }],
    "isRead": false,
    "createdAt": "2024-02-29T00:00:00Z"
  }],
  "total": 2, "page": 1, "limit": 10, "totalPages": 1
}
```
> Scope: `recipient_type=DELIVERER & recipient_id=me`. BE trả `content` đầy đủ (FE cắt preview ở list); `title` thuần (FE ghép 【yyyy/MM/dd】 từ `createdAt`); `links` từ `body.links[]`.

### GET `/deliverer/notifications/:id` — detail (OW_ANNO_002)
**Response** `NotificationDetailResponse`: như item trên + `content` (full text). **Side-effect:** set `isRead=true, readAt=now()` cho recipient.

### GET `/deliverer/notifications/unread-count`
**Response:** `{ "count": 3 }`

---

## A2. 配送状況 — OW_DLVR_001 / 002

### GET `/deliverer/shipments` — list (OW_DLVR_001)
**Query** (`ShipmentSearchRequest extends BaseSearchRequest`):
| field | type | req | note |
|---|---|---|---|
| `shipmentNo` | string | optional | 配送NO (like) |
| `scheduledSendDateFrom/To` | date(YYYY-MM-DD) | optional | 出荷予定日 range |
| `deliveryDateFrom/To` | date(YYYY-MM-DD) | optional | 配送日 range → map `scheduled_delivery_date` |
| `transitPointId` | string(bigint) | optional | 中継先 |
| `companyId` | string(bigint) | optional | 配送先(納品先) |
| `status` | enum ShipmentStatus | optional | |

**Response item** `ShipmentListItemResponse`:
```json
{
  "id": "5001", "shipmentNo": "D000033215",
  "deliveryDate": "2026-06-07",            // 配送日
  "scheduledSendDate": "2026-06-07",       // 出荷予定日
  "scheduledDeliveryDate": "2026-06-08",   // 納品予定日
  "transitPoint": { "id": "12", "name": "ヤマト 中継" },
  "carrierName": "COOL便",                 // 配送業者
  "company": { "id": "880", "name": "福市美前頗市頭園町", "address": "広島県大竹町..." },
  "status": "COMPLETED"
}
```

### GET `/deliverer/shipments/:id` — detail (OW_DLVR_002, read-only)
**Response** `DelivererShipmentDetailResponse`:
```json
{
  "id": "5001", "shipmentNo": "D000033215",
  "consignee": { "name":"田中 太郎","address":"東京都渋谷区神南1-2-3","tel":"03-5678-9012","contactName":"佐藤 花子","scheduledDeliveryDate":"2026-11-20" },
  "relayPoint": { "name":"鈴木 一郎","address":"神奈川県横浜市西区...","tel":"045-321-6789","contactName":"山田 美咲" },
  "cargo": { "trackingNos":["YM-20261115-00847"],"carrierName":"ヤマト運輸株式会社","cargoName":"冷凍食品セット","scheduledSendDate":"2026-11-15","scheduledDeliveryDate":"2026-11-20","notes":"冷凍保管必要" },
  "report": { "parkingFee":550,"receiptImageUrl":"...","reportImageUrls":["..."],"driverContact":"080-1234-5678（担当：伊藤 健司）" },
  "assignedDriver": { "id":"301","name":"伊藤 健司" }
}
```
> `trackingNos[]` = array (1 shipment N cargo box). Shipment chưa có report → `report: null` (giữ field). `reportImageUrls`/completion photos = array 0–N.

### GET `/deliverer/shipments/:id/assignable-drivers` — dropdown 配送スタッフ
**Response:** `[{ "id":"301","name":"伊藤 健司" }]` — drivers của me, `status=ACTIVE`, `approvalStatus=APPROVED`.

### PATCH `/deliverer/shipments/:id/assign-driver` — OW_DLVR_002 保存
**Body** `AssignDriverRequest`:
| field | type | req | validation |
|---|---|---|---|
| `driverId` | string(bigint) | **required** | `@IsNotEmpty`; driver phải thuộc me & APPROVED |

**Response:** shipment detail sau cập nhật. Lỗi 404 nếu shipment/driver không thuộc me; 409 nếu shipment đã COMPLETED.

---

## A3. 集金額 — OW_CLCT_001 / 002

### GET `/deliverer/collection-reports` — list (OW_CLCT_001)
**Query** (`CollectionSearchRequest extends BaseSearchRequest`):
| field | type | req | note |
|---|---|---|---|
| `driverId` | string(bigint) | optional | 配送スタッフ名 |
| `dateFrom/dateTo` | date | optional | 発送日 (shipments.scheduled_send_date) |

**Response item:**
```json
{ "id":"7001","no":1,"sendDate":"2025-11-15","driverName":"テスト一号","totalAmount":4100 }
```

### GET `/deliverer/collection-reports/summary` — OW_CLCT_002 (cards + list)
**Query:** `month=YYYY-MM` (**required**, `@Matches(/^\d{4}-\d{2}$/)`).
**Response** `CollectionSummaryResponse`:
```json
{
  "deliveryMonth": "2024/11",
  "totalCollected": 8700,
  "totalParkingFee": 300,
  "items": [
    { "id":"7001","no":1,"company":"請器美前頗市頭園町","driverName":"テスト一号","deliveryDate":"2024-11-15","collectedAmount":4100,"parkingFee":0 }
  ],
  "total": 100, "page": 1, "limit": 10, "totalPages": 10
}
```

### GET `/deliverer/collection-reports/:id` — detail (CLCT_002 操作)
**Response:** 1 report đầy đủ (collected/expected/difference/parkingFee/receiptImageUrl/deliveryPhotoUrls/delivererNote/submittedAt + shipment+driver liên quan).

### GET `/deliverer/collection-reports/export` — CSVダウンロード
**Query:** giống list (+`month?`). **Response:** `text/csv; charset=UTF-8` **kèm BOM** (để Excel JP đúng font; có thể đổi Shift_JIS theo yêu cầu KH). Cột: 発送日,配送スタッフ名,納品先,集金合計,駐車場料金,差額,提出日時.

### GET `/deliverer/collection-reports/report` — レポート
**Query:** `month=YYYY-MM`. **Response:** **Excel `.xlsx`** (lib `exceljs`), Content-Type `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. Nội dung: tiêu đề tháng + cards (集金合計/駐車場料金合計) + bảng chi tiết.
> Chuyển 一覧(001)→集計(002): FE truyền `month` = tháng của `dateFrom` (trống → tháng hiện tại). API trả ngày **ISO**, FE format hiển thị.

---

## A4. 配送スタッフ — OW_STAF_001 / 003 / 004

### GET `/deliverer/drivers` — list (OW_STAF_001)
**Query** (`DelivererDriverSearchRequest extends BaseSearchRequest`):
| field | type | req | note |
|---|---|---|---|
| `q` | string | optional | 配送スタッフ名 |
| `type` | enum DriverType | optional | 区分 |
| `approvalStatus` | enum DriverApprovalStatus | optional | ステータス |

**Response item:**
```json
{ "id":"301","driverCode":"DR00001","driverName":"山岡 美幸","type":"INDIVIDUAL","phone":"050-1245-1245","approvalStatus":"APPROVED" }
```

### GET `/deliverer/drivers/:id` — detail (OW_STAF_003)
```json
{
  "id":"301","driverCode":"DR00001","driverName":"山岡 美幸","nameKana":"ヤマオカ ミユキ",
  "deliverer":{ "id":"5","name":"株式会社 三輝" }, "approvalStatus":"APPROVED",
  "phone":"050-1245-1245","licenseImageUrl":"...",
  "account":{ "email":"sample@email.com","status":"ACTIVE","lastLoginAt":"2026-06-01T11:00:00Z" }
}
```

### POST `/deliverer/drivers` — create (OW_STAF_004 アカウント作成)
**Body** `CreateDelivererDriverRequest` (deliverer_id **ép = me**, KHÔNG nhận từ client):
| field | type | req | validation |
|---|---|---|---|
| `email` | string | **required** | `@IsEmail @MaxLength(255) @Trim` — email **liên hệ** (KHÔNG phải login) |
| `password` | string | **required** | `@MinLength(8)` — mật khẩu đăng nhập (đi kèm driverCode) |
| `driverName` | string | **required** | `@MaxLength(255)` |
| `nameKana` | string | **required** | `@MaxLength(255)` (mock có `*`) |
| `type` | enum DriverType | optional | default INDIVIDUAL |
| `phone` | string | **required** | `@MaxLength(50)` (携帯番号) |
| `deliveryArea` | string | optional | 配送スタッフ地 |
| `deliveryLocation` | string | optional | 配送スタッフ場所 |
| `approvalStatus` | enum DriverApprovalStatus | optional | 承認済 default PENDING |
| `licenseImageUrl` | string | optional | `@MaxLength(500)` |

**Response:** driver detail. Side-effect: tạo account, **`driverCode` sinh seq `DR\d+` = mã đăng nhập** (login bằng code, không phải email).

### PATCH `/deliverer/drivers/:id` — edit (OW_STAF_003)
Body = các field trên (partial). 404 nếu không thuộc me. Upload 免許証: file-upload → URL → set `licenseImageUrl`.

### DELETE `/deliverer/drivers/:id` — soft delete (404 nếu không thuộc me).

### POST `/deliverer/drivers/:id/send-password` — パスワード送信
**Response:** `{ "message": "deliverer.driver.passwordSent" }`.

---

# B. ADMIN (`/admin`)

## B1. 配送スタッフ master — MD01 / MD02
Mở rộng controller `admin-driver` sẵn có (giữ path), bổ sung field doc3.

### GET `/admin/drivers` — list (MD01)
**Query** `DriverSearchRequest extends BaseSearchRequest`: `q`(委託配送先名/配送スタッフ名), `delivererId?`, `type?`, `approvalStatus?`, `status?`(account).
**Response item:** như portal + `deliverer:{id,name}` (委託配送先名).

### GET `/admin/drivers/:id` — detail (MD02, tab 基本情報)
Như portal detail + `createdBy/updatedAt`.

### GET `/admin/drivers/:id/history` — tab 変更履歴 (G9, bảng `driver_history_logs`)
**Query:** `page,limit`. **Response item:**
```json
{ "id":"9001","field":"approvalStatus","oldValue":"PENDING","newValue":"APPROVED","changedBy":"admin:1","changedAt":"2026-06-01T10:00:00Z" }
```

### POST `/admin/drivers` — create (MD02/STAF_004)
Như portal create + **`delivererId` required (chọn được)**.

### PATCH `/admin/drivers/:id` · DELETE `/admin/drivers/:id` · POST `/admin/drivers/:id/send-password`
Tương tự portal (không giới hạn scope).

---

## B2. 【惣菜】出荷配送 — MP01 / MP02

### GET `/admin/shipments` — list (MP01)
**Query** `AdminShipmentSearchRequest extends BaseSearchRequest`: `shipmentNo`, `scheduledSendDateFrom/To`, `pickingDate`, `transitPointId`(中継先), `companyId`(配送先), `status`.
**Response item:** như portal list + `delivererId/delivererName`.

### POST `/admin/shipments` — create (MP01 新規登録)
**Body** `CreateShipmentRequest`:
| field | type | req | note |
|---|---|---|---|
| `companyId` | bigint | **required** | 納品先 |
| `delivererId` | bigint | **required** | 配送業者 (deliverers merged) |
| `companyOrderId` | bigint | optional | オーダー liên kết |
| `transitPointId` | bigint | optional | 中継先 |
| `supplierId` | bigint | optional | 配送元(trực giao) |
| `deliveryMode` | enum DeliveryMode | optional | default INTERNAL_DRIVER |
| `carrierId` | bigint | cond | required khi THIRD_PARTY_CARRIER |
| `deliveryType` | enum | optional | 配送区分 |
| `cargoType` | enum | optional | クール便… |
| `cargoName` | string | optional | 荷物名 |
| `scheduledSendDate` | date | optional | 発送予定日 |
| `scheduledDeliveryDate` | date | optional | 納品予定日 |
| `pickingDate` | date | optional | 集荷日 |
| `deliveryTimeSlot` | enum `ShipmentTimeSlot` | optional | 時間帯 |
| `expectedCollectionAmount` | numeric | optional | |
| `notes` | string | optional | 備考 |

> `shipmentNo` **server sinh seq** `shipment_no_seq` (`D\d+`), source=`MANUAL`. KHÔNG nhận từ client.

### GET `/admin/shipments/:id` — detail (MP02, 7 khối)
**Response** `AdminShipmentDetailResponse`:
```json
{
  "id":"5001","shipmentNo":"D000033215",
  "corporate": { "companyNo":"CU000043","name":"株式会社サンプル","nameKana":"カブシキガイシャ サンプル" },
  "order": { "orderNo":"D000043","menuId":"202020-5566" },                       // orderNo = company_orders.order_no (≠ companyNo CU…)
  "delivery": { "deliveryType":"COD","carrierName":"ヤマト運輸","cargoType":"REFRIGERATED",
                "pickingDate":"2026-03-01","deliveryTimeSlot":"予約中","outsourcedCarrier":"なし",
                "scheduledSendDate":"2026-03-02","scheduledDeliveryDate":"2026-03-03","notes":"" },
  "origin": { "type":"RELAY","name":"インターステクラ...","postalCode":"986-2113","prefecture":"北海道","city":"広島県大竹町","street":"東広4-7-7","contactName":"ESキッチンご担当者","officeCode":"..." }, // từ relay/supplier master
  "consignee": { "name":"...","postalCode":"986-2113","prefecture":"北海道","city":"広島県大竹町","street":"東広4-7-7","contactName":"ESキッチンご担当者" }, // 納品先 (contactName: nguồn chờ BA)
  "shipper": { "memberName":"ESキッチン株式会社","tel":"0359-3794-2777","address":"群馬県前橋市..." },
  "status": { "trackingNo":"N87302394444","status":"COMPLETED","deliveryDate":"2026-03-02","completionImageUrls":["File 1340.jpg"] }
}
```

### PATCH `/admin/shipments/:id` — edit (MP02 編集)
Body = các field create (partial); KHÔNG cho đổi `shipmentNo`.

### DELETE `/admin/shipments/:id` — soft delete (MP02 削除).

### PATCH `/admin/shipments/:id/assign-driver`
**Body:** `{ driverId?: bigint, deliveryMode: DeliveryMode, carrierId?: bigint }` (carrierId required khi THIRD_PARTY_CARRIER; driverId required khi INTERNAL_DRIVER).

---

# C. RBAC (permission keys cần thêm)
Endpoint admin mới cần đăng ký vào `permissions`/`role_permissions`:
`shipment.view`, `shipment.create`, `shipment.update`, `shipment.delete`, `shipment.assign_driver`,
`driver.view`, `driver.create`, `driver.update`, `driver.delete` (nếu chưa có), `driver.view_history`.
Portal deliverer dùng `DelivererGuard` (không qua RBAC admin).
