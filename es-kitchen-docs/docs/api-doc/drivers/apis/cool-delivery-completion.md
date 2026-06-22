---
doc: COOL Delivery Completion API
app: driver
screen: DA_COOL_001_01_default, DA_COOL_001_02_check_all, DA_COOL_001_03_successly, DA_RECV_001_04_modal_unchecked, DA_RECV_001_05_modal_checked
endpoints:
  - GET /driver/deliveries/{deliveryId}
  - POST /driver/deliveries/{deliveryId}/complete
status: Draft
updated: 2026-06-17
---

# COOL Delivery Completion API

> `deliveryId` = `shipment_companies.id` (= `id` thẻ giao Tab B/C của [delivery-list.md](./delivery-list.md)).
> Resource `/driver/deliveries/{deliveryId}` dùng **chung** cho cả COOL và ES — FE phân nhánh
> theo `shipmentType`; mỗi `deliveryId` chỉ thuộc 1 loại nên `POST .../complete` không xung đột.
> Quy ước chung (auth, headers, error envelope) xem [README.md](./README.md#-conventions-áp-dụng-cho-mọi-endpoint).

## GET /driver/deliveries/{deliveryId}

Return COOL delivery detail for the current driver.

```http
GET /driver/deliveries/1201 HTTP/1.1
Authorization: Bearer <driver access token>
Accept-Language: ja
```

### Path params

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `deliveryId` | bigint | yes | `shipment_companies.id` |

### Response 200

```json
{
  "deliveryId": 1201,
  "shipmentId": 5601,
  "shipmentType": "COOL",
  "companyName": "大和インターナショナルトレーディング株式会社",
  "deliveryDate": "2026-06-12",
  "deliveryStatus": "UNDELIVERED",
  "destination": {
    "companyName": "大和インターナショナルトレーディング株式会社",
    "postalCode": "151-0051",
    "address": "東京都渋谷区千駄ヶ谷5-32-7野村不動産南新宿ビル2階",
    "contactName": "田村花子様",
    "phone": "019-1234-5678",
    "notes": "6階受取、冷蔵庫は4階にある。6階まで行って受取するか、直接4階に行って 電話(123-4567-8901)し、総務の方に 納品する旨を伝えること。"
  },
  "cargoSummary": {
    "boxCount": 3,
    "chilledNormalItemCount": 10,
    "frozenItemCount": 20
  },
  "boxes": [
    {
      "id": 901,
      "trackingNo": "2107-6228-5031",
      "boxNumber": "1",
      "checked": false
    },
    {
      "id": 902,
      "trackingNo": "2107-6228-5031",
      "boxNumber": "2",
      "checked": false
    },
    {
      "id": 903,
      "trackingNo": "2107-6228-5031",
      "boxNumber": "3",
      "checked": false
    }
  ]
}
```

## POST /driver/deliveries/{deliveryId}/complete

Complete COOL delivery for the provided delivery (shipment company).

```http
POST /driver/deliveries/1201/complete HTTP/1.1
Authorization: Bearer <driver access token>
Accept-Language: ja
Content-Type: application/json
```

### Path params

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `deliveryId` | bigint | yes | `shipment_companies.id` |

### Request

```json
{
  "boxes": [
    {
      "boxId": 901,
      "checked": true
    },
    {
      "boxId": 902,
      "checked": true
    },
    {
      "boxId": 903,
      "checked": true
    }
  ],
  "isPartiallyDelivered": false,
  "esKitchenContacted": false
}
```

> Danh tính tài xế lấy từ **Bearer token** — không nhận `driverId` trong body.

### Response 200

```json
{
  "deliveryId": 1201,
  "deliveryStatus": "DELIVERED",
  "completedAt": "2026-06-16T08:24:31+09:00",
  "esKitchenContacted": false
}
```

## DTOs

```typescript
export class CoolDeliveryAddressResponse {
  companyName: string;
  postalCode: string | null;
  address: string;
  contactName: string | null;
  phone: string | null;
  notes: string | null;
}

export class CargoSummaryResponse {
  boxCount: number;
  chilledNormalItemCount: number;
  frozenItemCount: number;
}

export class CargoBoxResponse {
  id: number;
  trackingNo: string;
  boxNumber: string | null;
  checked: boolean;
}

export class CoolDeliveryDetailResponse {
  deliveryId: number;
  shipmentId: number;
  shipmentType: 'COOL' | 'ES_DELIVERY';
  companyName: string;
  deliveryDate: string;
  deliveryStatus: 'UNDELIVERED' | 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'TROUBLE';
  destination: CoolDeliveryAddressResponse;
  cargoSummary: CargoSummaryResponse;
  boxes: CargoBoxResponse[];
}

export class CompleteCargoBoxRequest {
  boxId: number;
  checked: boolean;
}

export class CoolDeliveryCompleteRequest {
  boxes: CompleteCargoBoxRequest[];
  isPartiallyDelivered: boolean;
  esKitchenContacted: boolean;
}

export class CoolDeliveryCompleteResponse {
  deliveryId: number;
  deliveryStatus: 'DELIVERED' | 'PARTIALLY_DELIVERED';
  completedAt: string;
  esKitchenContacted: boolean;
}
```

## Enums

`deliveryStatus` dùng lại shared enum `DeliveryStatus` — xem [README › DeliveryStatus](./README.md#-shared-enums-dùng-chung-nhiều-endpoint).

| Value | JP | VN | Badge Color | Notes |
| --- | --- | --- | --- | --- |
| `UNDELIVERED` | 未配送 | Chưa giao | Orange | COOL delivery not yet completed |
| `DELIVERED` | 配送完了 | Đã giao | Green | Successful COOL delivery |
| `PARTIALLY_DELIVERED` | 一部未配送 | Một phần chưa giao | Yellow | Requires ES kitchen contact |

## Business Rules

- Nút 完了 do **FE tự tính** (server không trả field gating): bật khi mọi `boxes[].checked = true`; nếu còn box chưa check → mở modal partial (cần `esKitchenContacted = true`).
- `isPartiallyDelivered=true` is only valid when `esKitchenContacted=true`.
- Driver must call `GET /driver/deliveries/{deliveryId}` before submitting completion.
- Completed status is persisted only after the transaction validates all cargo boxes and required fields.

> **COOL便 = chỉ giao hàng** (配送のみ): màn one-shot **không** có chụp ảnh (陳列前/陳列後) lẫn 駐車報告 —
> đó là các bước của luồng **wizard ES** ([es-delivery.md](./es-delivery.md)). COOL chỉ: tích kiện → `完了`.

## Errors

Dùng error envelope chung — xem [README › Error format](./README.md#error-format). `statusCode` là enum chuỗi; mã nghiệp vụ nằm ở `errorCode`.

```json
{ "statusCode": "error", "message": "COOL完了には荷物の選択が必要です。", "title": "Bad Request", "errorCode": "DRIVER_4001", "data": null }
```

| HTTP | `statusCode` | `errorCode` | Description |
| --- | --- | --- | --- |
| 400 | `error` | `DRIVER_4001` | Cargo boxes are required for COOL completion. |
| 400 | `error` | `DRIVER_4002` | ES kitchen contact confirmation is required for partial completion. |
| 403 | `forbidden` | `DRIVER_4031` | Delivery is not assigned to current driver. |
| 404 | `not_found` | `DRIVER_4041` | Delivery detail not found. |

## Field Mapping

### DA_COOL_001_01_default / DA_COOL_001_02_check_all

| № | UI Element (JP / VN) | API Source | Transform / Format | Trigger |
| --- | --- | --- | --- | --- |
| (1) | COOL便 header | Static UI — no API | — | — |
| (2) | 会社カード / Company card | `GET /driver/deliveries/{deliveryId}` → `companyName`, `deliveryDate`, `deliveryStatus` | Format date as `yyyy-MM-dd（ww）`; map status to badge color. | Load screen |
| (3) | 納品先情報 / Delivery address | `GET /driver/deliveries/{deliveryId}` → `destination` | Map rows: 郵便番号, 住所, 担当者, 電話番号. | Load screen |
| (4) | 納品備考 / Delivery remark | `GET /driver/deliveries/{deliveryId}` → `destination.notes` | Render remark box with purple note styling. | Load screen |
| (5) | 荷物情報 summary / Cargo summary | `GET /driver/deliveries/{deliveryId}` → `cargoSummary` | Box count / chilled+normal / frozen count. | Load screen |
| (6) | Cargo row checkbox | `GET /driver/deliveries/{deliveryId}` → `boxes[].checked` | Checked state from API; toggle updates local UI state. | Load + user interaction |
| (7) | 完了 button | **FE** (`boxes[].checked`) | Enable khi tất cả checked; còn box chưa check → modal partial (cần `esKitchenContacted`). | User interaction |

### DA_RECV_001_04_modal_unchecked / DA_RECV_001_05_modal_checked

| № | UI Element (JP / VN) | API Source | Transform / Format | Trigger |
| --- | --- | --- | --- | --- |
| (1) | Modal title | Static UI — no API | — | — |
| (2) | Modal illustration | Static UI — no API | — | — |
| (3) | 未配送連絡済み checkbox / ES kitchen contact checkbox | FE input → `esKitchenContacted` | Checkbox state drives partial completion flag. | User interaction |
| (4) | ESへ電話する / Call ES Kitchen | Static UI — support phone (hằng số FE) | Opens dialer with support phone. | User tap |
| (5) | 一部未配送のまま完了 / Complete partially | FE input → `isPartiallyDelivered=true` | Requires `esKitchenContacted=true`. | User tap |
| (6) | キャンセル / Cancel | Close modal | No API call. | User tap |
