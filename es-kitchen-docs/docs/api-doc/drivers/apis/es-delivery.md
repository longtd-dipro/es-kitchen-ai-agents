---
doc: es-delivery
module: driver
base_path: /driver
auth: Bearer (Driver)
screens: [DA_ESDL_000_0, DA_ESDL_000_1, DA_ESDL_000_2, DA_ESDL_001, DA_ESDL_002, DA_ESDL_003, DA_ESDL_004, DA_ESDL_005, DA_ESDL_006]
endpoints:
  - GET /driver/deliveries/{deliveryId}
  - PUT /driver/deliveries/{deliveryId}/pre-display-photos
  - GET /driver/deliveries/{deliveryId}/inventory-check
  - POST /driver/deliveries/{deliveryId}/inventory-check
  - GET /driver/deliveries/{deliveryId}/display-inspection
  - POST /driver/deliveries/{deliveryId}/display-inspection
  - PUT /driver/deliveries/{deliveryId}/post-display-photos
  - POST /driver/deliveries/{deliveryId}/complete
  - GET /driver/deliveries/{deliveryId}/parking-report
  - PUT /driver/deliveries/{deliveryId}/parking-report
status: design
updated: 2026-06-16
related:
  - ./README.md
  - ./delivery-list.md
  - ./warehouse-receipt.md
---

# ES Delivery Handover API — `DA_ESDL_000` 〜 `DA_ESDL_006`

API cho luồng **giao hàng ES** (ES配送便 = 配送 + 棚入れ — giao **và** sắp lên kệ) của
tài xế: mở chi tiết một điểm giao (1 công ty), rồi đi qua **wizard 5 bước**:

```
陳列前 (ảnh trước) → 在庫/廃棄 (kiểm kho + hủy) → 検品・陳列 (kiểm phẩm + lên kệ)
                  → 陳列後 (ảnh sau) → 集金 (thu tiền) → 完了
```

| Màn hình | Trạng thái / bước | Endpoint phục vụ |
|----------|-------------------|------------------|
| `DA_ESDL_000_0` | Chi tiết — hôm nay, **được sửa** (nút 陳列を開始する) | `GET /driver/deliveries/{deliveryId}` |
| `DA_ESDL_000_1` | Chi tiết — ngày tương lai, **read-only** (ẩn nút) | `GET` (`editMode = READ_ONLY_FUTURE`) |
| `DA_ESDL_000_2` | Chi tiết — đã hoàn thành (banner xanh) | `GET` (`completedAt != null`) |
| `DA_ESDL_001` | Step 1 — 陳列前 (upload ảnh trước) | `PUT .../pre-display-photos` |
| `DA_ESDL_002` | Step 2 — 在庫/廃棄 (kiểm kho + đăng ký hủy) | `GET` + `POST .../inventory-check` |
| `DA_ESDL_003` | Step 3 — 検品・陳列 (kiểm phẩm + lên kệ) | `GET` + `POST .../display-inspection` |
| `DA_ESDL_004` | Step 4 — 陳列後 (upload ảnh sau) | `PUT .../post-display-photos` |
| `DA_ESDL_005` | Step 5 — 集金登録 (đăng ký thu tiền) | `POST .../complete` |
| `DA_ESDL_006-0x` | Tổng kết (read-only) + tab 駐車報告 | `GET` (embed) + `GET`/`PUT .../parking-report` |

> Quy ước chung (auth, headers, error envelope, ngày `yyyy-MM-dd`) xem
> [README.md](./README.md#-conventions-áp-dụng-cho-mọi-endpoint). Enum dùng chung
> (`ShipmentType`, `DeliveryStatus`, `CargoType`, `BoxInspectionStatus`,
> `ItemInspectionStatus`) xem [README › Shared enums](./README.md#-shared-enums-dùng-chung-nhiều-endpoint).
> Điều hướng vào màn: từ thẻ giao tab ES配送便 của [delivery-list.md](./delivery-list.md) —
> **`deliveryId` = `id` của `DeliveryItemDto`** (= `shipment_companies.id`).

> **`deliveryId` là gì?** Một "delivery" = **1 lần giao cho 1 công ty** =
> `shipment_companies.id`. Một `shipments` (chuyến xe) có thể gồm nhiều công ty;
> mỗi công ty là một `deliveryId` riêng với wizard riêng. Xem [Status transitions](#status-transitions).

---

## GET /driver/deliveries/{deliveryId}

Trả về **header + 3 tab** (基本情報 / 駐車報告 / 陳列情報) của màn chi tiết, thông tin
điểm giao (納品先情報) và thông tin kiện (荷物情報), kèm `editMode` (quyết định nút
陳列を開始する), `steps` (chi tiết từng bước) và **`currentStep`** (bước cần mở khi vào lại —
resume) + `lastCompletedStep` (đã hoàn thành tới đâu). Khi đã hoàn thành
(`completedAt != null`) response **embed thêm** dữ liệu các bước để phục vụ tab tổng kết
`DA_ESDL_006`.

### Request

```http
GET /driver/deliveries/2001
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Path Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `deliveryId` | number | ✅ | `shipment_companies.id` (= `id` thẻ giao tab ES配送便 delivery-list) |

### Response 200 — hôm nay, được sửa (`DA_ESDL_000_0`)

`editMode = EDITABLE_TODAY` → FE hiện nút 陳列を開始する dẫn vào Step 1.

```json
{
  "deliveryId": 2001,
  "shipmentNo": "D000033215",
  "shipmentType": "ES_DELIVERY",
  "companyName": "大和インターナショナルトレーディング株式会社",
  "deliveryDate": "2026-06-12",
  "deliveryStatus": "UNDELIVERED",
  "editMode": "EDITABLE_TODAY",
  "completedAt": null,
  "destination": {
    "companyName": "大和インターナショナルトレーディング株式会社",
    "postalCode": "151-0051",
    "address": "東京都渋谷区千駄ヶ谷5-32-7野村不動産南新宿ビル2階",
    "contactName": "田村花子様",
    "phone": "019-1234-5678",
    "notes": "6階受取、冷蔵庫は4階にある。6階まで行って受取するか、直接4階に行って電話(123-4567-8901)し、総務の方に納品する旨を伝えること。"
  },
  "packages": {
    "expectedBoxCount": 3,
    "actualBoxCount": null,
    "chilledNormalItemCount": 10,
    "frozenItemCount": 20,
    "boxes": [
      { "id": 80011, "lineNo": 1, "trackingNo": "2107-6228-5031", "barcode": "2107622850311", "boxNumber": "1", "inspectionStatus": "PENDING" },
      { "id": 80012, "lineNo": 2, "trackingNo": "2107-6228-5032", "barcode": "2107622850328", "boxNumber": "2", "inspectionStatus": "PENDING" },
      { "id": 80013, "lineNo": 3, "trackingNo": "2107-6228-5033", "barcode": "2107622850335", "boxNumber": "3", "inspectionStatus": "PENDING" }
    ]
  },
  "nextDeliveryDate": "2026-10-16",
  "currentStep": "PRE_DISPLAY_PHOTOS",
  "lastCompletedStep": null,
  "steps": {
    "preDisplayPhotos":  { "submitted": false, "photoCount": 0 },
    "inventoryCheck":    { "submitted": false },
    "displayInspection": { "submitted": false },
    "postDisplayPhotos": { "submitted": false, "photoCount": 0 },
    "collection":        { "submitted": false }
  }
}
```

> **Resume:** ví dụ nếu đã submit Step 1 + Step 2 rồi thoát, lần vào lại response trả
> `currentStep: "DISPLAY_INSPECTION"` (Step 3) + `lastCompletedStep: "INVENTORY_CHECK"` →
> FE nhảy thẳng vào Step 3. Xem [Resume rules](#resume-rules).

### Response 200 — ngày tương lai, read-only (`DA_ESDL_000_1`)

`deliveryDate > today` → `editMode = READ_ONLY_FUTURE`. FE **ẩn** nút 陳列を開始する.
Mọi field còn lại giống trên.

```json
{ "deliveryId": 2050, "editMode": "READ_ONLY_FUTURE", "deliveryStatus": "UNDELIVERED", "completedAt": null, "currentStep": "PRE_DISPLAY_PHOTOS", "lastCompletedStep": null, "...": "..." }
```

### Response 200 — đã hoàn thành (`DA_ESDL_000_2` + tab tổng kết `DA_ESDL_006`)

`completedAt != null` → FE hiện banner xanh 「荷物の配送は完了しました。」 + thời điểm,
mở khóa tab 陳列情報, và **embed** dữ liệu các bước cho `DA_ESDL_006-04..08`.

```json
{
  "deliveryId": 2001,
  "shipmentType": "ES_DELIVERY",
  "companyName": "大和インターナショナルトレーディング株式会社",
  "deliveryDate": "2026-06-12",
  "deliveryStatus": "DELIVERED",
  "editMode": "COMPLETED_EDITABLE",
  "completedAt": "2026-06-12T15:42:00+09:00",
  "currentStep": "COMPLETED",
  "lastCompletedStep": "COLLECTION",
  "destination": { "...": "..." },
  "packages": { "expectedBoxCount": 3, "actualBoxCount": 3, "...": "..." },
  "preDisplayPhotos":  { "photoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/pre/2001-1.jpg"] },
  "inventoryCheck":    { "submittedAt": "2026-06-12T15:10:00+09:00", "menuYearMonth": "2026-06", "items": ["...xem GET /inventory-check..."], "disposalTotalQuantity": 5 },
  "displayInspection": { "submittedAt": "2026-06-12T15:25:00+09:00", "items": ["...xem GET /display-inspection..."] },
  "postDisplayPhotos": { "photoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/post/2001-1.jpg"] },
  "collection":        { "expectedAmount": 10000, "collectedAmount": 10000, "difference": 0 },
  "parkingReport":     { "parkingFee": 500, "receiptPhotoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/parking/2001-1.jpg"] }
}
```

### Field mapping → màn chi tiết (badge `D.x`)

| No | Field (response) | UI element (JP / VN) |
|----|------------------|----------------------|
| D.1 | `companyName` | 納品先 tên công ty (header card xanh) |
| D.2 | `deliveryDate` | 配送日 `yyyy-MM-dd（曜日）` |
| D.3 | `deliveryStatus` | Badge trạng thái (未配送 / 配送完了 …) — xem [DeliveryStatus](./README.md#trạng-thái-nhận--giao) |
| D.4 | — (tabs) | 基本情報 / 駐車報告 / 陳列情報 — **Static UI**; 陳列情報 mở khóa khi `completedAt != null` |
| D.5 | `destination.companyName` | 納品先 (dòng trong 納品先情報) |
| D.6 | `destination.postalCode` | 郵便番号 |
| D.7 | `destination.address` | 住所 |
| D.8 | `destination.contactName` | 担当者 |
| D.9 | `destination.phone` | 電話番号 |
| D.10 | `destination.notes` | 納品備考 (hộp xanh ⚠) |
| D.11 | `packages.expectedBoxCount` / `chilledNormalItemCount` / `frozenItemCount` | 荷物情報 header 「3 箱 / 10 品 / 20 品(❄)」 |
| D.12 | `packages.boxes[].trackingNo` | Danh sách 送り状番号 mỗi dòng |
| D.13 | `editMode` | Nút 陳列を開始する — hiện khi `EDITABLE_TODAY`, ẩn khi `READ_ONLY_FUTURE`, đổi nhãn khi `COMPLETED_*` |
| banner | `completedAt` | Banner 「荷物の配送は完了しました。」 + thời điểm (`DA_ESDL_000_2`) |

> `chilledNormalItemCount` (10 品, icon box-open) và `frozenItemCount` (20 品, icon ❄):
> số **đếm dẫn xuất** từ `shipment_details` theo `cargo_type` (nhiệt độ) của kiện (giống `summary`
> trong [warehouse-receipt.md](./warehouse-receipt.md)). `shipmentType` ở wizard này luôn là
> **`ES_DELIVERY`** (loại giao có 棚入れ — 5 bước). Lưu ý `shipmentType` (loại giao: ES/COOL) khác
> với `cargo_type` (nhiệt độ: REFRIGERATED/FROZEN/AMBIENT).

---

## PUT /driver/deliveries/{deliveryId}/pre-display-photos

**Step 1 — 陳列前.** Lưu danh sách URL ảnh chụp tủ/box **trước** khi lên kệ. Ảnh đã được
upload sẵn lên S3 qua module upload (xem [Upload ảnh](#upload-ảnh)); endpoint này chỉ nhận
**mảng URL**. `PUT` = thay thế toàn bộ mảng (idempotent — vào lại Step 1 ghi đè).

> **Side-effect**: lần `PUT` đầu tiên (delivery bắt đầu) → ghi `shipment_status_histories`
> = `STARTED_DELIVERY` và chuyển `shipments.status: ASSIGNED → IN_TRANSIT`. Xem
> [Status transitions](#status-transitions).

### Request

```http
PUT /driver/deliveries/2001/pre-display-photos
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
Content-Type: application/json
```

```json
{
  "photoUrls": [
    "https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/pre/2001-1.jpg",
    "https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/pre/2001-2.jpg"
  ]
}
```

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `photoUrls` | string[] | ✅ | 1–5 URL ảnh S3 đã upload. Lưu vào `delivery_completion_reports.pre_display_photo_urls` (jsonb) |

### Response 200

```json
{ "deliveryId": 2001, "photoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/pre/2001-1.jpg"], "photoCount": 1 }
```

### Field mapping → Step 1 (badge `S1.x`)

| No | Field | UI element (JP / VN) | Loại |
|----|-------|----------------------|------|
| S1.1 | `GET /` → `companyName` / `destination.address` / `packages.expectedBoxCount` | Thẻ công ty (tên / địa chỉ / 箱) | read |
| S1.2 | — | Thanh tiến trình 5 bước | Static UI |
| S1.3 | — | Hướng dẫn 「冷蔵庫・ボックス内の陳列前写真を…」 | Static UI |
| S1.4 | `photoUrls` | Lưới ảnh đã chọn (3 cột, có nút ✕ xóa) | write |
| S1.5 | **FE input** → upload module | Nút ファイル選択 (chọn ảnh → S3 URL) | input |
| S1.6 | **trigger** `PUT .../pre-display-photos` | Nút 続ける (enabled khi ≥1 ảnh) | input |

---

## GET /driver/deliveries/{deliveryId}/inventory-check

**Step 2 (load) — 在庫/廃棄.** Trả về danh sách sản phẩm để kiểm kho: lý thuyết (理論在庫),
số hủy (廃棄数), thực tế sau hủy (実在庫). Nếu đã từng submit thì trả lại giá trị đã nhập.

### Request

```http
GET /driver/deliveries/2001/inventory-check
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Response 200

```json
{
  "deliveryId": 2001,
  "menuYearMonth": "2026-06",
  "nextDeliveryDate": "2026-10-16",
  "submittedAt": null,
  "items": [
    { "productId": 501, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "logicalStock": 10, "wasteQuantity": 5, "actualStock": 5 },
    { "productId": 502, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "logicalStock": 10, "wasteQuantity": 0, "actualStock": 10 },
    { "productId": 503, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "logicalStock": 10, "wasteQuantity": 0, "actualStock": 10 }
  ]
}
```

> `wasteQuantity` (廃棄数) **không** là cột của `inventory_check_items`; nó được **tổng hợp
> từ `disposal_report_items`** (theo `product_id`). `logicalStock`/`actualStock` là 2 cột độc
> lập của `inventory_check_items`. Xem [Quan hệ 理論在庫/廃棄/実在庫](#quan-hệ-理論在庫--廃棄--実在庫).

---

## POST /driver/deliveries/{deliveryId}/inventory-check

**Step 2 (submit).** Lưu kết quả kiểm kho + đăng ký hủy. **Upsert** (`inventory_checks`
UNIQUE per delivery → submit lại ghi đè).

### Request

```http
POST /driver/deliveries/2001/inventory-check
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
Content-Type: application/json
```

```json
{
  "menuYearMonth": "2026-06",
  "remarks": null,
  "items": [
    { "productId": 501, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "logicalStock": 10, "actualStock": 5 },
    { "productId": 502, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "logicalStock": 10, "actualStock": 10 }
  ],
  "disposalItems": [
    { "productId": 501, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "quantity": 5 }
  ]
}
```

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `menuYearMonth` | string | ❌ | `YYYY-MM` — `inventory_checks.menu_year_month` |
| `remarks` | string \| null | ❌ | `inventory_checks.remarks` |
| `items[]` | object[] | ✅ | Mỗi sản phẩm → `inventory_check_items`. `difference = actualStock − logicalStock` (server tính, **không** nhận từ client) |
| `items[].logicalStock` | number | ✅ | 理論在庫 |
| `items[].actualStock` | number | ✅ | 実在庫(廃棄後) |
| `disposalItems[]` | object[] | ❌ | Mỗi dòng hủy → `disposal_report_items` (con của `delivery_completion_reports`). Server cộng `disposal_total_quantity`, set `disposal_menu_year_month` |
| `disposalItems[].quantity` | number | ✅ | 廃棄数 (> 0) |

### Response 200

```json
{
  "deliveryId": 2001,
  "submittedAt": "2026-06-12T15:10:00+09:00",
  "itemCount": 2,
  "disposalTotalQuantity": 5,
  "message": "在庫・廃棄を登録しました。"
}
```

### Field mapping → Step 2 (badge `S2.x`)

| No | Field | UI element (JP / VN) | Loại |
|----|-------|----------------------|------|
| S2.1 | `GET /` → company info | Thẻ công ty | read |
| S2.2 | — | Tiêu đề 「廃棄登録と実在庫の確認」 | Static UI |
| S2.3 | — | Hướng dẫn 3 dòng | Static UI |
| S2.4 | **FE input** (client-side filter) | Ô tìm 「名前またはコードで商品を検索」 | input |
| S2.5 | **FE input** → quét `boxes[].barcode` | Nút scan barcode | input |
| S2.6 | `GET /` → `nextDeliveryDate` | 「※次回納品日 …」 — **TBD nguồn** | read |
| S2.7 | **FE input** (client-side filter) | Checkbox 「未確認のみ表示」 | input |
| S2.8 | — | Checkbox 確認 mỗi dòng — **TBD** (client-side, không có cột DB) | input |
| S2.9 | `items[].logicalStock` | 理論在庫 (read-only) | read |
| S2.10 | `disposalItems[].quantity` | 廃棄数(△) (input ±) | write |
| S2.11 | `items[].actualStock` | 実在庫(廃棄後) (input ±) | write |
| S2.12 | `items[].productName` | Tên sản phẩm | read |
| S2.13 | **trigger** `POST .../inventory-check` | Nút 確認 (bottom) | input |

---

## GET /driver/deliveries/{deliveryId}/display-inspection

**Step 3 (load) — 検品・陳列.** Trả về danh sách sản phẩm cần kiểm phẩm + lên kệ: số dự
kiến (予定数) vs số thực tế (実際数).

### Request

```http
GET /driver/deliveries/2001/display-inspection
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Response 200

```json
{
  "deliveryId": 2001,
  "submittedAt": null,
  "items": [
    { "shipmentDetailId": 90011, "productId": 501, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "quantity": 10, "actualQuantity": 10, "inspectionStatus": "NOT_INSPECTED" },
    { "shipmentDetailId": 90012, "productId": 502, "productName": "鶏もも肉の生姜焼き風", "unit": "個", "quantity": 10, "actualQuantity": 8,  "inspectionStatus": "NOT_INSPECTED" }
  ]
}
```

---

## POST /driver/deliveries/{deliveryId}/display-inspection

**Step 3 (submit).** Lưu số thực tế đã lên kệ. Server suy ra `inspection_status` mỗi dòng và
set `shipment_cargo_boxes.inspection_status = CHECKED` cho các kiện (ES — có 棚入れ).

### Request

```http
POST /driver/deliveries/2001/display-inspection
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
Content-Type: application/json
```

```json
{
  "items": [
    { "shipmentDetailId": 90011, "actualQuantity": 10 },
    { "shipmentDetailId": 90012, "actualQuantity": 8 }
  ]
}
```

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `items[].shipmentDetailId` | number | ✅ | `shipment_details.id` |
| `items[].actualQuantity` | number | ✅ | 実際数 → `shipment_details.actual_quantity` |

> `inspection_status` **server tự suy**: `actual == quantity` → `MATCHED`;
> `actual < quantity` → `SHORTAGE`; `actual > quantity` → `EXCESS`. Popup xác nhận chênh
> lệch (`DA_ESDL_003-04/05`) là **client-side**.

### Response 200

```json
{
  "deliveryId": 2001,
  "submittedAt": "2026-06-12T15:25:00+09:00",
  "itemCount": 2,
  "summary": { "matched": 1, "shortage": 1, "excess": 0 },
  "message": "検品・陳列を登録しました。"
}
```

### Field mapping → Step 3 (badge `S3.x`)

| No | Field | UI element (JP / VN) | Loại |
|----|-------|----------------------|------|
| S3.1 | `GET /` → company info | Thẻ công ty | read |
| S3.2 | — | Tiêu đề 「検品・陳列」 | Static UI |
| S3.3 | **FE input** (client-side filter) | Ô tìm sản phẩm | input |
| S3.4 | **FE input** → quét `boxes[].barcode` | Nút scan barcode | input |
| S3.5 | **FE input** (client-side filter) | Checkbox 「未確認のみ表示」 | input |
| S3.6 | suy từ `items[].inspectionStatus` | Checkbox 確認 mỗi dòng — **TBD** (client-side) | input |
| S3.7 | `items[].productName` | Tên sản phẩm | read |
| S3.8 | `items[].quantity` | 商品数 「予定数：N個」 | read |
| S3.9 | `items[].actualQuantity` | 実際数 (input ±) | write |
| S3.10 | **trigger** `POST .../display-inspection` | Nút 確定 | input |

---

## PUT /driver/deliveries/{deliveryId}/post-display-photos

**Step 4 — 陳列後.** Giống Step 1 nhưng lưu vào `delivery_completion_reports.post_display_photo_urls`.

### Request

```http
PUT /driver/deliveries/2001/post-display-photos
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{ "photoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/post/2001-1.jpg"] }
```

### Response 200

```json
{ "deliveryId": 2001, "photoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/post/2001-1.jpg"], "photoCount": 1 }
```

### Field mapping → Step 4 (badge `S4.x`)

| No | Field | UI element (JP / VN) | Loại |
|----|-------|----------------------|------|
| S4.1 | `GET /` → company info | Thẻ công ty | read |
| S4.2 | — | Tiêu đề 「アップロード（陳列後）」 | Static UI |
| S4.3 | `photoUrls` | Lưới ảnh đã chọn | write |
| S4.4 | **FE input** → upload module | Nút ファイル選択 | input |
| S4.5 | **trigger** `PUT .../post-display-photos` | Nút 続ける | input |

---

## POST /driver/deliveries/{deliveryId}/complete

**Step 5 — 集金登録 + hoàn tất.** Lưu tiền thu (COD) và **chốt** delivery. Server snapshot
`expected_amount` từ `shipments.expected_collection_amount`, tính `difference`, set
`submitted_at = now()`. Đây là mốc đánh dấu **delivery này đã giao xong** (`deliveryStatus → DELIVERED`).

### Request

```http
POST /driver/deliveries/2001/complete
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
Content-Type: application/json
```

```json
{
  "collectedAmount": 10000,
  "companyRepName": "田村花子",
  "remarks": null
}
```

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `collectedAmount` | number | ✅ | 実集金額 → `delivery_completion_reports.collected_amount` (0 nếu không thu) |
| `companyRepName` | string \| null | ❌ | Người nhận → `company_rep_name` |
| `remarks` | string \| null | ❌ | `remarks` |

> `expectedAmount` (集金予定額) là **read-only**, FE lấy từ `GET /` (`collection.expectedAmount`
> / `shipments.expected_collection_amount`) — **không** gửi trong request.

### Response 200

```json
{
  "deliveryId": 2001,
  "deliveryStatus": "DELIVERED",
  "completedAt": "2026-06-12T15:42:00+09:00",
  "collection": { "expectedAmount": 10000, "collectedAmount": 10000, "difference": 0 },
  "shipmentCompleted": false,
  "message": "荷物の配送は完了しました。"
}
```

> `shipmentCompleted = false` nghĩa là **chuyến (`shipments`) chưa xong** vì còn công ty
> khác chưa giao. Chỉ khi tất cả `shipment_companies` anh em hoàn tất, server mới chuyển
> `shipments.status = COMPLETED` (`shipmentCompleted = true`). Xem [Status transitions](#status-transitions).

### Field mapping → Step 5 (badge `S5.x`)

| No | Field | UI element (JP / VN) | Loại |
|----|-------|----------------------|------|
| S5.1 | `GET /` → company info | Thẻ công ty | read |
| S5.2 | `GET /` → `collection.expectedAmount` | 集金予定額 (read-only, 「10,000 円」) | read |
| S5.3 | `collectedAmount` | 実集金額 (input, 「円」) | write |
| S5.4 | **trigger** `POST .../complete` | Nút 完了 | input |

---

## GET / PUT /driver/deliveries/{deliveryId}/parking-report

**Tab 駐車報告** (`DA_ESDL_006-02` view / `DA_ESDL_006-03` edit). Phí gửi xe + ảnh biên lai.
Sửa được tới khi delivery bị khóa (xem [edit mode](#điều-hướng--quyền-sửa)).

### Request — đọc

```http
GET /driver/deliveries/2001/parking-report
Authorization: Bearer {accessToken}
```

### Request — ghi

```http
PUT /driver/deliveries/2001/parking-report
Authorization: Bearer {accessToken}
Content-Type: application/json
```

```json
{
  "parkingFee": 500,
  "receiptPhotoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/parking/2001-1.jpg"]
}
```

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `parkingFee` | number \| null | ❌ | Phí đỗ xe → `delivery_completion_reports.parking_fee` |
| `receiptPhotoUrls` | string[] | ❌ | 1–5 URL ảnh biên lai → `parking_fee_receipt_photo_urls` (jsonb) |

### Response 200

```json
{ "deliveryId": 2001, "parkingFee": 500, "receiptPhotoUrls": ["https://s3.ap-northeast-1.amazonaws.com/es-kitchen/cool/parking/2001-1.jpg"] }
```

---

## Upload ảnh

Các bước ảnh (Step 1/4) và biên lai gửi xe **không** upload file trực tiếp vào các endpoint
trên — FE **đẩy file lên S3 trước** qua **module upload có sẵn**
([`src/modules/file-upload`](../../../src/modules/file-upload), endpoint `POST /files/presigned-upload-url(s)`
trả `{ key, uploadUrl, fileUrl, expiresIn }`), rồi **submit mảng `fileUrl`** vào endpoint bước.

```
1. POST /files/presigned-upload-urls  → nhận uploadUrl + fileUrl cho mỗi ảnh
2. Client PUT binary ảnh → uploadUrl (S3)
3. PUT /driver/deliveries/{id}/pre-display-photos  { photoUrls: [fileUrl, ...] }
```

> **TBD**: endpoint `/files/*` hiện gắn `AdminGuard` — cần mở cho Driver Cognito pool (hoặc
> thêm biến thể `/driver/uploads/*` cùng pattern presigned) trước khi triển khai.

---

## Response DTOs

```typescript
// ── GET /driver/deliveries/{deliveryId} ───────────────
export class DeliveryDetailResponse {
  deliveryId: number;                       // shipment_companies.id
  shipmentNo: string;                       // shipments.shipment_no
  shipmentType: 'ES_DELIVERY' | 'COOL';     // wizard này = ES_DELIVERY (có 棚入れ)
  companyName: string;                      // D.1
  deliveryDate: string;                     // D.2 (yyyy-MM-dd) = scheduled_send_date
  deliveryStatus: 'UNDELIVERED' | 'DELIVERED' | 'TROUBLE'; // D.3
  editMode: 'EDITABLE_TODAY' | 'READ_ONLY_FUTURE' | 'COMPLETED_EDITABLE' | 'LOCKED'; // D.13 (computed)
  completedAt: string | null;               // banner; = delivery_completion_reports.submitted_at
  nextDeliveryDate: string | null;          // S2.6 — TBD nguồn
  currentStep: WizardStep;                  // bước cần mở khi vào lại (resume) — computed
  lastCompletedStep: WizardStep | null;     // đã hoàn thành tới đâu (null = chưa làm gì) — computed
  destination: DeliveryDestinationDto;
  packages: DeliveryPackagesDto;
  steps?: DeliveryStepsDto;                  // chi tiết per-step (submitted/photoCount)
  // —— embed khi completedAt != null (cho DA_ESDL_006) ——
  preDisplayPhotos?: { photoUrls: string[] };
  inventoryCheck?: InventoryCheckResponse;
  displayInspection?: DisplayInspectionResponse;
  postDisplayPhotos?: { photoUrls: string[] };
  collection?: CollectionDto;
  parkingReport?: ParkingReportDto;
}

export class DeliveryDestinationDto {
  companyName: string;                       // D.5
  postalCode: string | null;                 // D.6
  address: string;                           // D.7
  contactName: string | null;                // D.8
  phone: string | null;                      // D.9
  notes: string | null;                      // D.10 = shipment_companies.notes
}

export class DeliveryPackagesDto {
  expectedBoxCount: number;                  // D.11 = shipment_companies.expected_box_count
  actualBoxCount: number | null;             //        = shipment_companies.actual_box_count
  chilledNormalItemCount: number;            // D.11 (đếm dẫn xuất)
  frozenItemCount: number;                   // D.11 (đếm dẫn xuất)
  boxes: DeliveryBoxDto[];
}

export class DeliveryBoxDto {
  id: number;                                // shipment_cargo_boxes.id
  lineNo: number;
  trackingNo: string;                        // D.12 送り状NO
  barcode: string | null;                    // dùng cho scan Step 2/3
  boxNumber: string | null;
  inspectionStatus: 'PENDING' | 'CHECKED';   // BoxInspectionStatus
}

export class DeliveryStepsDto {
  preDisplayPhotos:  { submitted: boolean; photoCount: number };
  inventoryCheck:    { submitted: boolean };
  displayInspection: { submitted: boolean };
  postDisplayPhotos: { submitted: boolean; photoCount: number };
  collection:        { submitted: boolean };
}

// ── Step 1 / 4 : photos ───────────────────────────────
export class SavePhotosRequest { photoUrls: string[]; }           // 1–5
export class SavePhotosResponse { deliveryId: number; photoUrls: string[]; photoCount: number; }

// ── Step 2 : inventory-check ──────────────────────────
export class InventoryCheckResponse {                              // GET
  deliveryId: number;
  menuYearMonth: string | null;
  nextDeliveryDate: string | null;
  submittedAt: string | null;
  items: InventoryCheckItemDto[];
}
export class InventoryCheckItemDto {
  productId: number | null;
  productName: string;
  unit: string | null;
  logicalStock: number;                      // S2.9 理論在庫 (inventory_check_items.logical_stock)
  wasteQuantity: number;                     // S2.10 廃棄数 (∑ disposal_report_items.quantity) — GET only
  actualStock: number;                       // S2.11 実在庫 (inventory_check_items.actual_stock)
}
export class SaveInventoryCheckRequest {                           // POST
  menuYearMonth?: string;
  remarks?: string | null;
  items: { productId: number | null; productName: string; unit?: string | null; logicalStock: number; actualStock: number }[];
  disposalItems?: { productId: number | null; productName: string; unit?: string | null; quantity: number }[];
}
export class SaveInventoryCheckResponse {
  deliveryId: number; submittedAt: string; itemCount: number; disposalTotalQuantity: number; message: string;
}

// ── Step 3 : display-inspection ───────────────────────
export class DisplayInspectionResponse {                           // GET
  deliveryId: number;
  submittedAt: string | null;
  items: DisplayInspectionItemDto[];
}
export class DisplayInspectionItemDto {
  shipmentDetailId: number;                  // shipment_details.id
  productId: number | null;
  productName: string;
  unit: string | null;
  quantity: number;                          // S3.8 予定数
  actualQuantity: number | null;             // S3.9 実際数
  inspectionStatus: 'NOT_INSPECTED' | 'MATCHED' | 'SHORTAGE' | 'EXCESS';
}
export class SaveDisplayInspectionRequest {                        // POST
  items: { shipmentDetailId: number; actualQuantity: number }[];
}
export class SaveDisplayInspectionResponse {
  deliveryId: number; submittedAt: string; itemCount: number;
  summary: { matched: number; shortage: number; excess: number }; message: string;
}

// ── Step 5 : complete ─────────────────────────────────
export class CompleteDeliveryRequest {
  collectedAmount: number;                   // S5.3 実集金額
  companyRepName?: string | null;
  remarks?: string | null;
}
export class CompleteDeliveryResponse {
  deliveryId: number;
  deliveryStatus: 'DELIVERED';
  completedAt: string;
  collection: CollectionDto;
  shipmentCompleted: boolean;                // chuyến (shipments) đã xong toàn bộ?
  message: string;
}
export class CollectionDto {
  expectedAmount: number;                    // S5.2 集金予定額 (read-only)
  collectedAmount: number;                   // S5.3
  difference: number;                        // server tính = collected − expected
}

// ── tab 駐車報告 : parking-report ─────────────────────
export class ParkingReportDto {
  parkingFee: number | null;
  receiptPhotoUrls: string[];
}
```

---

## Enums

### `WizardStep` (`currentStep` / `lastCompletedStep` — computed, resume)

Khớp 1-1 với key của `steps{}`, theo thứ tự wizard cố định.

| Value | Step | Màn | Endpoint submit |
|-------|------|-----|------------------|
| `PRE_DISPLAY_PHOTOS` | 1 — 陳列前 | `DA_ESDL_001` | `PUT .../pre-display-photos` |
| `INVENTORY_CHECK` | 2 — 在庫/廃棄 | `DA_ESDL_002` | `POST .../inventory-check` |
| `DISPLAY_INSPECTION` | 3 — 検品・陳列 | `DA_ESDL_003` | `POST .../display-inspection` |
| `POST_DISPLAY_PHOTOS` | 4 — 陳列後 | `DA_ESDL_004` | `PUT .../post-display-photos` |
| `COLLECTION` | 5 — 集金 | `DA_ESDL_005` | `POST .../complete` |
| `COMPLETED` | — | `DA_ESDL_006` | (đã xong hết / `completedAt != null`) |

### `DeliveryEditMode` (D.13 — computed, không lưu DB)

| Value | 日本語 | Tiếng Việt | Hành vi FE |
|-------|--------|-----------|------------|
| `EDITABLE_TODAY` | 当日・編集可 | Hôm nay, sửa được | Hiện nút 陳列を開始する → wizard |
| `READ_ONLY_FUTURE` | 未来・閲覧のみ | Tương lai, chỉ xem | Ẩn nút (`DA_ESDL_000_1`) |
| `COMPLETED_EDITABLE` | 完了・編集可 | Hoàn thành, còn sửa | Banner xanh + cho sửa tới hạn khóa |
| `LOCKED` | 締切・編集不可 | Đã khóa | Chỉ xem |

### `BoxInspectionStatus` (`boxes[].inspectionStatus`)

Dùng lại shared enum — xem [README › BoxInspectionStatus](./README.md#boxinspectionstatus).

| Value | 日本語 | Tiếng Việt | Badge |
|-------|--------|-----------|-------|
| `PENDING` | 未検品 | Chưa kiểm | Gray |
| `CHECKED` | 検品済 | Đã kiểm | Green |

### `ItemInspectionStatus` (Step 3 — `items[].inspectionStatus`)

Dùng lại shared enum — xem [README › ItemInspectionStatus](./README.md#iteminspectionstatus).

| Value | 日本語 | Tiếng Việt | Badge | Điều kiện (server) |
|-------|--------|-----------|-------|--------------------|
| `NOT_INSPECTED` | 未検品 | Chưa kiểm | Gray | Chưa submit |
| `MATCHED` | 一致 | Khớp | Green | `actual == quantity` |
| `SHORTAGE` | 不足 | Thiếu | Orange | `actual < quantity` |
| `EXCESS` | 過剰 | Thừa | Red | `actual > quantity` |

### `ShipmentHistoryStatus` (`shipment_status_histories.status`)

| Value | 日本語 | Tiếng Việt | Ghi khi |
|-------|--------|-----------|---------|
| `STARTED_DELIVERY` | 配送開始 | Bắt đầu giao | `PUT .../pre-display-photos` lần đầu (Step 1) |
| `ARRIVED` | 到着 | Đã đến nơi | **TBD** — chưa có trigger rõ trong wizard |
| `COMPLETED` | 配送完了 | Giao xong | `POST .../complete` (Step 5) |
| `REDELIVERY` | 再配達 | Giao lại | (ngoài luồng wizard) |
| `NOT_DELIVERED` | 未配達 | Không giao được | (ngoài luồng wizard) |

> `shipmentType` / `deliveryStatus` / `CargoType` dùng lại shared enum ở
> [README › Shared enums](./README.md#-shared-enums-dùng-chung-nhiều-endpoint).

---

## Error Responses

Envelope theo backend thật — `statusCode` là enum chuỗi (map HTTP: 400→`error`, 401→`unauthorized`,
403→`forbidden`, 404→`not_found`, 409→`conflict`). Xem [README › Error format](./README.md#error-format).

```json
{ "statusCode": "error", "message": "陳列前の写真を1枚以上アップロードしてください", "title": "Bad Request", "errorCode": null, "data": null }
```

| HTTP | Điều kiện | Message (JP) | Message (VN) |
|------|-----------|--------------|--------------|
| 400 | `photoUrls` rỗng (Step 1/4) | 写真を1枚以上アップロードしてください | Vui lòng tải lên ít nhất 1 ảnh |
| 400 | `photoUrls` > 5 | 写真は最大5枚までです | Tối đa 5 ảnh |
| 400 | Step 2/3 `items` rỗng | 商品が選択されていません | Chưa có sản phẩm nào |
| 400 | `complete` khi thiếu bước trước (chưa có inventory-check / display-inspection / ảnh) | 前のステップが完了していません | Chưa hoàn thành các bước trước |
| 400 | `collectedAmount` < 0 | 集金額が不正です | Số tiền thu không hợp lệ |
| 401 | Token sai/hết hạn | 認証エラー | Lỗi xác thực |
| 403 | Không phải tài xế được phân công delivery này | この配送を操作する権限がありません | Bạn không có quyền thao tác điểm giao này |
| 404 | `deliveryId` không tồn tại | 指定された配送が見つかりません | Không tìm thấy điểm giao |
| 409 | Delivery đã hoàn thành & quá hạn sửa (`LOCKED`) | この配送はすでに締め切られています | Điểm giao này đã bị khóa |

```json
{ "statusCode": "conflict", "message": "この配送はすでに締め切られています", "title": "Conflict", "errorCode": null, "data": null }
```

---

## Business Rules / ビジネスルール

### Status transitions

| Bước / endpoint | `shipments.status` | `shipment_status_histories` | `shipment_cargo_boxes` |
|-----------------|--------------------|-----------------------------|------------------------|
| Step 1 — `PUT .../pre-display-photos` (lần đầu) | `ASSIGNED → IN_TRANSIT` | + `STARTED_DELIVERY` (source `DRIVER_APP`, kèm lat/lng) | — |
| Step 3 — `POST .../display-inspection` | — | — | các kiện (ES) → `inspection_status = CHECKED` |
| Step 5 — `POST .../complete` | → `COMPLETED` **chỉ khi** mọi `shipment_companies` anh em đã xong | + `COMPLETED` (source `DRIVER_APP`) | còn lại → `status = DELIVERED`, `delivered_at` |

> **Quan trọng cho FE**: `shipments.status` là **cấp chuyến** (nhiều công ty). Cờ "delivery
> này đã giao" = `delivery_completion_reports.submitted_at != null` (`deliveryStatus = DELIVERED`;
> khi đó đơn **biến mất khỏi** delivery-list). **Đừng** poll `shipments.status` cho 1 công ty.
> `shipment_status_histories` **không có** `shipment_company_id` → quy event về công ty dựa
> `note` / thời điểm (**TBD** nếu cần lịch sử cấp công ty).

### Điều hướng & quyền sửa

| `editMode` | Điều kiện | Hành vi |
|-----------|-----------|---------|
| `EDITABLE_TODAY` | `deliveryDate == today` & chưa hoàn thành | `DA_ESDL_000_0` — hiện nút, vào wizard |
| `READ_ONLY_FUTURE` | `deliveryDate > today` | `DA_ESDL_000_1` — ẩn nút |
| `COMPLETED_EDITABLE` | `completedAt != null` & còn trong hạn sửa | `DA_ESDL_000_2` — banner + cho sửa |
| `LOCKED` | `completedAt != null` & quá hạn | Chỉ xem; ghi → `409` |

> **TBD** — mốc khóa "編集可能：7日前まで": neo vào ngày nào (`scheduled_send_date` của kỳ kế /
> `actual_delivery_date`?) cần xác nhận; phụ thuộc nguồn `nextDeliveryDate`.

### Resume rules

Server tính `currentStep` + `lastCompletedStep` từ `steps{}.submitted` (FE chỉ đọc, **không** tự suy):

1. **Thứ tự cố định**: `PRE_DISPLAY_PHOTOS` → `INVENTORY_CHECK` → `DISPLAY_INSPECTION` → `POST_DISPLAY_PHOTOS` → `COLLECTION`.
2. `currentStep` = **bước đầu tiên** có `submitted = false` theo thứ tự trên.
3. `lastCompletedStep` = bước **cuối cùng** đã `submitted` (hoặc `null` nếu chưa step nào xong).
4. Khi **cả 5** bước đã `submitted` (⇔ `completedAt != null`): `currentStep = COMPLETED`, `lastCompletedStep = COLLECTION`.
5. **FE behavior**: bấm 陳列を開始する / 続ける → mở wizard **tại `currentStep`** (vào lại nhảy thẳng bước tiếp theo, không quay về Step 1). Nếu `COMPLETED` → mở tab tổng kết `DA_ESDL_006`.

> Ví dụ: đã submit Step 1+2 → `steps.preDisplayPhotos.submitted=true`, `inventoryCheck.submitted=true`, còn lại `false`
> ⇒ `currentStep = "DISPLAY_INSPECTION"`, `lastCompletedStep = "INVENTORY_CHECK"`.
>
> Khớp guard sẵn có: `POST .../complete` chặn nếu thiếu bước trước (`400 前のステップが完了していません`) → đảm bảo tuần tự.

### Quan hệ 理論在庫 / 廃棄 / 実在庫

- `inventory_check_items` có **2 cột độc lập**: `logical_stock` (理論在庫) và `actual_stock`
  (実在庫). **Không có** cột `waste`. `difference = actual_stock − logical_stock` (server tính).
- `廃棄数` (廃棄) lưu **riêng** ở `disposal_report_items.quantity` (con của
  `delivery_completion_reports`), tổng vào `disposal_total_quantity`.
- DB **không ràng buộc** `actual = logical − waste`. FE **nên** đề xuất mặc định
  `実在庫(廃棄後) ≈ 理論在庫 − 廃棄数` như **soft-validation**, nhưng cả 3 giá trị được lưu độc lập.

### Lọc & tìm kiếm phía client

- Ô tìm 「名前またはコードで商品を検索」 (S2.4 / S3.3) và 「未確認のみ表示」 (S2.7 / S3.5):
  lọc real-time trên dữ liệu đã trả — **không** sinh request mới.
- Scan barcode (S2.5 / S3.4): so khớp `boxes[].barcode` để định vị / tick dòng (client-side).

### Sort order

| Cấp | Field | Hướng |
|-----|-------|-------|
| Kiện (`boxes`) | `lineNo` | ASC |
| Sản phẩm (Step 2/3) | `sequence` / `productName` | ASC |

### Các thành phần chỉ-FE (không cần API)

- Thanh tiến trình 5 bước (S1.2…); popup xác nhận chênh lệch Step 3 (`DA_ESDL_003-04/05`).
- Checkbox 確認 từng dòng (S2.8 / S3.6) — **client-side**, không lưu DB (xem [TBD](#tbd--schema-gaps)).
- Số điện thoại khẩn 「050-5784-2777」 cố định ở FE.

---

## TBD / Schema gaps

> Các điểm UI **chưa có nguồn DB** trong 10 bảng (`shipments` … `inventory_check_items`).
> Không bịa field — liệt kê để chốt sau.

1. **`確認` checkbox (S2.8 / S3.6)** — không có cột trên `inventory_check_items` /
   `shipment_details`. Hiện là **client-side** (chỉ phục vụ filter 未確認のみ表示). Nếu cần
   lưu → thêm cột `confirmed boolean`.
2. **`次回納品日` / `nextDeliveryDate` (S2.6)** — không có trong 10 bảng; cần lookup chu kỳ
   giao (`delivery_cycles`?) bên ngoài.
3. **`logical_stock` (理論在庫, S2.9)** — cột có sẵn trên `inventory_check_items` nhưng **nguồn
   seed** (stock master tính tồn lý thuyết) nằm ngoài phạm vi 10 bảng này.
4. **`shipment_status_histories` không có `shipment_company_id`** — không quy được event về
   đúng công ty ở cấp DB; tạm dựa `note` / thời điểm.
5. **`ARRIVED`** — enum có nhưng không có bước nào trong wizard kích hoạt (điểm phát TBD).
6. **Mốc khóa 7 ngày** — neo vào ngày nào cần xác nhận (xem [edit mode](#điều-hướng--quyền-sửa)).

---

## Tham chiếu

- Bản render API có **mockup đánh số + bảng ráp**: [es-delivery/apis/index.html](../es-delivery/apis/index.html)
- Spec đánh số (annotated) còn ở docs: [DA_ESDL_000_0](../es-delivery/DA_ESDL_000_0.html) · [Step 1](../es-delivery/step1/DA_ESDL_001.html)
- Mockup màn hình gốc (đã chuyển sang `design/`): [DA_ESDL_000_0](../../../design/giaohang/DA_ESDL_000_0%20Normal%20(Today,%20not%20yet%20shipped).html) ·
  [Step 1](../../../design/giaohang/step1/DA_ESDL_001-02(upload%20image%20done).html) ·
  [Step 2](../../../design/giaohang/step2/) · [Step 3](../../../design/giaohang/step3/) · [Step 4](../../../design/giaohang/step4/) ·
  [Step 5](../../../design/giaohang/step5/) · [Tổng kết](../../../design/giaohang/complete/)
- Schema nguồn (source of truth field): [database/db.dbml](../../../database/db.dbml) (dòng 1674–1844)
- Endpoint liên quan: [delivery-list.md](./delivery-list.md) (tab ES配送便 → `deliveryId`) ·
  [warehouse-receipt.md](./warehouse-receipt.md) (chiều nhận kho, đối xứng)
