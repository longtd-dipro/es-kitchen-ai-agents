# Driver API Repository

## Purpose

This folder is the single source of truth for the Driver app API contract. Every driver-facing endpoint, shared convention, and screen mapping is owned here before wiring guides reference it.

## Navigation

- Dashboard API: [dashboard.md](dashboard.md)
- Delivery list API: [delivery-list.md](delivery-list.md)
- Warehouse receipt API: [warehouse-receipt.md](warehouse-receipt.md)
- ES / COOL delivery wizard API: [es-delivery.md](es-delivery.md)
- COOL delivery completion API: [cool-delivery-completion.md](cool-delivery-completion.md)
- Trouble report API: [trouble-report.md](trouble-report.md)

## Endpoint Index

| Method | Path | Screen | Doc Link | Status |
| --- | --- | --- | --- | --- |
| GET | `/driver/home` | DA_HOME_001 | [dashboard.md](dashboard.md) | design |
| GET | `/driver/schedules` | DA_HOME_001_Schedule, DA_HOME_001_Empty | [dashboard.md](dashboard.md) | design |
| GET | `/driver/delivery-list` | DA_LIST_00 (A/B/C) | [delivery-list.md](delivery-list.md) | design |
| GET | `/driver/receipts/{receiptId}` | DA_RECV_001, DA_RECV_003 | [warehouse-receipt.md](warehouse-receipt.md) | design |
| POST | `/driver/receipts/{receiptId}/complete` | DA_RECV_001-02/03 | [warehouse-receipt.md](warehouse-receipt.md) | design |
| GET | `/driver/deliveries/{deliveryId}` | DA_ESDL_000, DA_COOL_001 | [es-delivery.md](es-delivery.md) · [cool-delivery-completion.md](cool-delivery-completion.md) | design |
| PUT | `/driver/deliveries/{deliveryId}/pre-display-photos` | DA_ESDL_001 | [es-delivery.md](es-delivery.md) | design |
| GET·POST | `/driver/deliveries/{deliveryId}/inventory-check` | DA_ESDL_002 | [es-delivery.md](es-delivery.md) | design |
| GET·POST | `/driver/deliveries/{deliveryId}/display-inspection` | DA_ESDL_003 | [es-delivery.md](es-delivery.md) | design |
| PUT | `/driver/deliveries/{deliveryId}/post-display-photos` | DA_ESDL_004 | [es-delivery.md](es-delivery.md) | design |
| POST | `/driver/deliveries/{deliveryId}/complete` | DA_ESDL_005, DA_COOL_001-02 | [es-delivery.md](es-delivery.md) · [cool-delivery-completion.md](cool-delivery-completion.md) | design |
| GET·PUT | `/driver/deliveries/{deliveryId}/parking-report` | DA_ESDL_006 | [es-delivery.md](es-delivery.md) | design |
| GET | `/driver/trouble-reports/targets` | DA_RPTD_001 | [trouble-report.md](trouble-report.md) | design |
| POST | `/driver/trouble-reports` | DA_RPTD_002 | [trouble-report.md](trouble-report.md) | design |

> `/driver/deliveries/{deliveryId}` là resource **dùng chung** cho cả COOL và ES — FE phân nhánh
> theo `shipmentType`. Mỗi `deliveryId` (= `shipment_companies.id`) chỉ thuộc 1 loại nên
> `POST .../complete` không xung đột (body khác nhau theo loại giao).
>
> Màn trouble-report (`DA_RPTD_002`) **không có endpoint form riêng**: box list + thẻ điểm tái dùng
> `GET /driver/deliveries/{id}` hoặc `GET /driver/receipts/{id}`; danh sách loại sự cố là enum FE.

## Screen-to-API Map

| Screen | Purpose | Key Endpoints | Notes |
| --- | --- | --- | --- |
| DA_COOL_001_01_default | Default COOL delivery detail before boxes are checked | GET `/driver/deliveries/{deliveryId}` | Completion is disabled until all cargo boxes are checked |
| DA_COOL_001_02_check_all | All cargo boxes checked and ready to complete | GET `/driver/deliveries/{deliveryId}` + POST `/driver/deliveries/{deliveryId}/complete` | Drives completion flow |
| DA_COOL_001_03_successly | Successful completion state | POST `/driver/deliveries/{deliveryId}/complete` | Uses response to render success banner |
| DA_RECV_001_04_modal_unchecked | Partial completion confirmation when some boxes remain unchecked | POST `/driver/deliveries/{deliveryId}/complete` with `isPartiallyDelivered=true` | Requires ES kitchen contact confirmation |
| DA_RECV_001_05_modal_checked | Partial completion confirmation when driver has contacted ES kitchen | POST `/driver/deliveries/{deliveryId}/complete` with `isPartiallyDelivered=true` | Requires `esKitchenContacted=true` |

## 📌 Conventions áp dụng cho mọi endpoint

- All driver requests require `Authorization: Bearer <driver access token>` issued from the Driver Cognito pool.
- `Accept-Language: ja | vi` controls localization. `ja` is the default; server trả **chuỗi đã dịch** (nestjs-i18n).
- Dates returned by APIs are ISO 8601 with timezone; date-only fields use `yyyy-MM-dd`.
- List endpoints use cursor-based pagination — xem [Pagination](#pagination-cursor-based--infinite-scroll). Detail/completion flows không paginate.

### Error format

Envelope **theo backend thật** (global exception filter). `statusCode` là **enum chuỗi**, không phải HTTP number; mã nghiệp vụ (nếu có) nằm ở `errorCode`:

```json
{ "statusCode": "error", "message": "…", "title": "Bad Request", "errorCode": null, "data": null }
```

- Success envelope: `{ "statusCode": "success", "message": "…", "data": <T> }`.
- Validation fail (class-validator): `{ "statusCode": "validaton_error", "message": "Input validation failed", "data": ["…field msg…"] }` (giữ nguyên typo `validaton_error` của code).
- `statusCode` values: `success` · `error` · `unauthorized` · `forbidden` · `not_found` · `conflict` · `validaton_error` · `internal_error`.
- Map HTTP → `statusCode`: 400→`error` (hoặc `validaton_error`), 401→`unauthorized`, 403→`forbidden`, 404→`not_found`, 409→`conflict`.

### Pagination (cursor-based) — infinite scroll

- Query: `cursor` (lấy từ `nextCursor` của response trước) + `limit` (mặc định 20, tối đa 50).
- Response kèm `nextCursor` (`null` khi hết) và `hasMore`.

## 🧩 Shared enums dùng chung nhiều endpoint

### ShipmentType

| Value | 日本語 | Ý nghĩa |
| --- | --- | --- |
| `COOL` | COOL便 | **Chỉ** giao hàng (配送のみ) — luồng one-shot |
| `ES_DELIVERY` | ES配送便 | Giao hàng **và** sắp lên kệ (配送 + 棚入れ) — wizard 5 bước |

### Trạng thái nhận / giao

`DeliveryStatus` (cấp điểm giao):

| Value | 日本語 | Ý nghĩa |
| --- | --- | --- |
| `UNDELIVERED` | 未配送 | Chưa giao |
| `DELIVERED` | 配送完了 | Đã giao xong |
| `PARTIALLY_DELIVERED` | 一部未配送 | Giao một phần (yêu cầu liên hệ ES) |
| `TROUBLE` | トラブル | Có sự cố khi giao |

`ReceiptStatus` (cấp điểm nhận / kho):

| Value | 日本語 | Ý nghĩa |
| --- | --- | --- |
| `UNRECEIVED` | 未受取 | Chưa nhận từ kho |
| `RECEIVED` | 受取済 | Đã nhận |
| `TROUBLE` | トラブル | Có sự cố khi nhận |
| `CANCELLED` | 中止 | Hủy nhận |

### CargoType

| Value | 日本語 | Chip / Ý nghĩa |
| --- | --- | --- |
| `REFRIGERATED` | 冷蔵 | ❄冷蔵 (mát) |
| `FROZEN` | 冷凍 | 冷凍 (đông lạnh) |
| `NORMAL` | 常温 | — (thường) |

### BoxInspectionStatus

| Value | 日本語 | Ý nghĩa |
| --- | --- | --- |
| `PENDING` | 未検品 | Chưa kiểm |
| `CHECKED` | 検品済 | Đã kiểm |

### ItemInspectionStatus

| Value | 日本語 | Điều kiện (server) |
| --- | --- | --- |
| `NOT_INSPECTED` | 未検品 | Chưa submit |
| `MATCHED` | 一致 | `actual == quantity` |
| `SHORTAGE` | 不足 | `actual < quantity` |
| `EXCESS` | 過剰 | `actual > quantity` |

> Các enum riêng của từng feature (`DeliveryListTab`, `LocationType`, `ReceiptCompletionType`,
> `DeliveryEditMode`, `TroubleReason`, `TroubleType`, `TroubleReportStatus`, `TroubleTargetType`…)
> định nghĩa trong file feature tương ứng.

## Updating This Repository

1. Read `README.md` and existing feature docs before introducing a new endpoint.
2. Reuse existing endpoints when the screen can be served by an existing contract (vd: form trouble-report tái dùng detail endpoint).
3. Add new feature files under `docs/drivers/apis/` with self-contained sections: Endpoint → Request → Query/Path params → Response → DTOs → Enums → Errors → Business rules → Field mapping.
4. Update `README.md` Endpoint Index, Screen↔API map, and shared enums when the change affects multiple files.
5. Keep the HTML wiring guide in sync with both the screen spec and the Markdown contract.
6. Field-name & path conventions: `shipmentType`, `trackingNo`, `boxNumber`, `chilledNormalItemCount`/`frozenItemCount`, `preDisplayPhotos`/`postDisplayPhotos`, `esKitchenContacted`, `destination{…}`. Path resource: `/driver/deliveries/{deliveryId}`, `/driver/receipts/{receiptId}`.
