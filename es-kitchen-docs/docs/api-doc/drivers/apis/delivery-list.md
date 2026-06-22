---
doc: delivery-list
module: driver
base_path: /driver
auth: Bearer (Driver)
screens: [DA_LIST_00, DA_LIST_00_A, DA_LIST_00_B, DA_LIST_00_C]
endpoints:
  - GET /driver/delivery-list
status: design
updated: 2026-06-17
pagination: cursor
---

# Delivery List API — `DA_LIST_00`

**Một endpoint** phục vụ cả 3 tab của màn hình 配達一覧 (Delivery List).
Tab chia theo **loại giao hàng** (không còn theo trạng thái chưa/đã giao). Tham số `tab`
quyết định **shape response** và cách lọc dữ liệu.

| Tab | `tab` value | 日本語 | Item shape |
|-----|-------------|--------|------------|
| A | `WAREHOUSE_RECEIPT` | 倉庫受付 | `WarehouseReceiptItemDto` |
| B | `ES_DELIVERY` | ES配送便 | `DeliveryItemDto` |
| C | `COOL` | COOL便 | `DeliveryItemDto` |

> **Đổi so với bản cũ:** trước đây Tab B/C tách theo trạng thái (未配送 / 配送完了). Nay Tab B/C
> tách theo **loại giao** (ES / COOL); trạng thái chuyển thành **filter「ステータス」**. Đơn **đã giao
> (`DELIVERED`) không xuất hiện** trong list này — list chỉ còn việc chưa xong.

> Quy ước chung (auth, headers, pagination, error format) xem [README.md](./README.md#-conventions-áp-dụng-cho-mọi-endpoint).

---

## GET /driver/delivery-list

Trả về danh sách giao hàng lọc theo tab, khoảng ngày, và các filter tùy chọn.

### Request

```http
GET /driver/delivery-list?tab=COOL&startDate=2026-06-12&endDate=2026-06-19
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Query Parameters

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `tab` | enum | ❌ | `WAREHOUSE_RECEIPT` | Tab cần lấy: `WAREHOUSE_RECEIPT` (A) / `ES_DELIVERY` (B) / `COOL` (C) |
| `startDate` | string (ISO) | ❌ | today | Đầu khoảng ngày, `yyyy-MM-dd` |
| `endDate` | string (ISO) | ❌ | today + 7 | Cuối khoảng ngày, `yyyy-MM-dd`. Span tối đa 31 ngày |
| `keyword` | string | ❌ | — | Tìm tự do (ô「倉庫・中継名」). Tab A: tên kho/trung chuyển/địa chỉ. Tab B/C: tên công ty/địa chỉ giao/**tên kho nguồn** |
| `receiptStatus` | enum[] | ❌ | — (all) | **Chỉ Tab A** (filter「ステータス」, đa chọn): `UNRECEIVED` \| `RECEIVED` \| `TROUBLE` \| `CANCELLED` |
| `locationType` | enum | ❌ | — (all) | **Chỉ Tab A.** `WAREHOUSE` (倉庫) \| `TRANSIT` (中継) |
| `deliveryStatus` | enum[] | ❌ | — (all) | **Chỉ Tab B/C** (filter「ステータス」, đa chọn): `UNDELIVERED` \| `TROUBLE`. Không có `DELIVERED` |
| `cursor` | string | ❌ | — | Cursor trang kế (lấy từ `nextCursor` của response trước) |
| `limit` | number | ❌ | `20` | Số item mỗi trang. Tối đa 50 |

#### Validation rules

- `startDate` ≤ `endDate`.
- `endDate − startDate` ≤ **31 ngày**.
- `receiptStatus`, `locationType` bị **bỏ qua** khi `tab` ≠ `WAREHOUSE_RECEIPT`.
- `deliveryStatus` bị **bỏ qua** khi `tab` = `WAREHOUSE_RECEIPT`; giá trị `DELIVERED` không hợp lệ.

---

## Response — Tab A: 倉庫受付 (Warehouse Receipt)

`GET /driver/delivery-list?tab=WAREHOUSE_RECEIPT` — trả về thẻ điểm nhận (kho / trung chuyển), gom theo location.

```json
{
  "tab": "WAREHOUSE_RECEIPT",
  "tabCounts": { "warehouseReceipt": 2, "esDelivery": 2, "cool": 2 },
  "dateRange": { "startDate": "2026-06-12", "endDate": "2026-06-19" },
  "items": [
    {
      "id": 1001,
      "locationType": "WAREHOUSE",
      "locationName": "オージーフーズ倉庫",
      "receiptStatus": "UNRECEIVED",
      "deliveryDate": "2026-06-12",
      "address": "東京都渋谷区1-2-3",
      "companyCount": 3,
      "boxCount": 50,
      "frozenItemCount": 500,
      "chilledNormalItemCount": 500
    },
    {
      "id": 1002,
      "locationType": "TRANSIT",
      "locationName": "ヤマト運輸営業所",
      "receiptStatus": "UNRECEIVED",
      "deliveryDate": "2026-06-12",
      "address": "東京都新宿区1-5-10",
      "companyCount": 10,
      "boxCount": 80,
      "frozenItemCount": 500,
      "chilledNormalItemCount": 500
    }
  ],
  "nextCursor": "eyJpZCI6MTAwMn0=",
  "hasMore": true
}
```

### Field mapping → thẻ (Tab A)

| Field | Vị trí trên card |
|-------|------------------|
| `locationName` | Tên kho / trung chuyển |
| `receiptStatus` | Badge (UNRECEIVED=未受付 cam, RECEIVED=受付済 xanh, TROUBLE=đỏ, CANCELLED=xám) |
| `deliveryDate` | Ngày `yyyy-MM-dd` + thứ |
| `address` | Dòng địa chỉ |
| `companyCount` | 「X 社」 |
| `boxCount` | 「X 箱」 |
| `frozenItemCount` | 「X 品」 (đỏ, icon bông tuyết = đông lạnh) |
| `chilledNormalItemCount` | 「X 品」 (xanh, icon tủ lạnh = mát + thường) |

---

## Response — Tab B: ES配送便 (ES Delivery)

`GET /driver/delivery-list?tab=ES_DELIVERY` — thẻ từng công ty loại **ES配送便** (`shipmentType = ES_DELIVERY`),
chỉ việc **chưa xong** (`deliveryStatus IN (UNDELIVERED, TROUBLE)`).

```json
{
  "tab": "ES_DELIVERY",
  "tabCounts": { "warehouseReceipt": 2, "esDelivery": 2, "cool": 2 },
  "dateRange": { "startDate": "2026-06-12", "endDate": "2026-06-19" },
  "items": [
    {
      "id": 2001,
      "shipmentType": "ES_DELIVERY",
      "cargoType": "NORMAL",
      "companyName": "富士フィナンシャルアドバイザリー株式会社",
      "deliveryStatus": "UNDELIVERED",
      "deliveryDate": "2026-06-12",
      "sourceWarehouseName": "オージーフーズ倉庫",
      "destinationAddress": "東京都渋谷区千駄ヶ谷5-32-7...",
      "phone": "03-5555-0101",
      "boxCount": 2,
      "frozenItemCount": 10,
      "chilledNormalItemCount": 30
    },
    {
      "id": 2003,
      "shipmentType": "ES_DELIVERY",
      "cargoType": "NORMAL",
      "companyName": "会社3",
      "deliveryStatus": "TROUBLE",
      "deliveryDate": "2026-06-12",
      "sourceWarehouseName": "オージーフーズ倉庫",
      "destinationAddress": "東京都新宿区...",
      "phone": "03-5555-0103",
      "boxCount": 3,
      "frozenItemCount": 5,
      "chilledNormalItemCount": 15
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

### Field mapping → thẻ (Tab B / C)

| Field | Vị trí trên card |
|-------|------------------|
| `companyName` | Tiêu đề thẻ (tên công ty/điểm giao) |
| `cargoType` | Chip ❄冷蔵 (REFRIGERATED) / 冷凍 (FROZEN) / — (NORMAL) |
| `deliveryStatus` | Badge (UNDELIVERED=未配送 vàng, TROUBLE=トラブル đỏ) |
| `shipmentType` | Icon loại chuyến (ngầm định theo tab) |
| `deliveryDate` | Ngày |
| `sourceWarehouseName` | Kho nguồn (icon xe) |
| `destinationAddress` | Địa chỉ giao (icon 📍) |
| `boxCount` | 「X 箱」 (số kiện, vd "1") |
| `phone` | SĐT liên hệ (icon 📞 → `tel:`) |
| `frozenItemCount` | 「X 品」 (đông lạnh) |
| `chilledNormalItemCount` | 「X 品」 (mát + thường) |

---

## Response — Tab C: COOL便 (COOL Delivery)

`GET /driver/delivery-list?tab=COOL` — **cùng shape Tab B**, lọc `shipmentType = COOL` &
`deliveryStatus IN (UNDELIVERED, TROUBLE)`. FE hiện **banner tĩnh** 「冷蔵便です。温度管理に注意して配送してください。」.

```json
{
  "tab": "COOL",
  "tabCounts": { "warehouseReceipt": 2, "esDelivery": 2, "cool": 2 },
  "dateRange": { "startDate": "2026-06-12", "endDate": "2026-06-19" },
  "items": [
    {
      "id": 3001,
      "shipmentType": "COOL",
      "cargoType": "REFRIGERATED",
      "companyName": "フレッシュフード有限会社",
      "deliveryStatus": "TROUBLE",
      "deliveryDate": "2026-06-17",
      "sourceWarehouseName": "オージーフーズ倉庫",
      "destinationAddress": "東京都世田谷区代沢4-5-6",
      "phone": "03-5555-0002",
      "boxCount": 1,
      "frozenItemCount": 0,
      "chilledNormalItemCount": 10
    },
    {
      "id": 3002,
      "shipmentType": "COOL",
      "cargoType": "REFRIGERATED",
      "companyName": "冷蔵デリバリー株式会社",
      "deliveryStatus": "UNDELIVERED",
      "deliveryDate": "2026-06-17",
      "sourceWarehouseName": "オージーフーズ倉庫",
      "destinationAddress": "東京都目黒区自由が丘3-4-5",
      "phone": "03-5555-0001",
      "boxCount": 1,
      "frozenItemCount": 0,
      "chilledNormalItemCount": 10
    }
  ],
  "nextCursor": null,
  "hasMore": false
}
```

---

## Response DTOs

```typescript
// ── Wrapper chung cho cả 3 tab ─────────────────────
export class DeliveryListResponse {
  tab: 'WAREHOUSE_RECEIPT' | 'ES_DELIVERY' | 'COOL';
  tabCounts: TabCountsDto;
  dateRange: DateRangeDto;
  items: WarehouseReceiptItemDto[] | DeliveryItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class TabCountsDto {
  warehouseReceipt: number;
  esDelivery: number;
  cool: number;
}

export class DateRangeDto {
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd
}

// ── Tab A items ────────────────────────────────────
export class WarehouseReceiptItemDto {
  id: number;
  locationType: 'WAREHOUSE' | 'TRANSIT';
  locationName: string;
  receiptStatus: 'UNRECEIVED' | 'RECEIVED' | 'TROUBLE' | 'CANCELLED';
  deliveryDate: string;            // yyyy-MM-dd
  address: string;
  companyCount: number;            // X 社
  boxCount: number;                // X 箱
  frozenItemCount: number;         // X 品 (đỏ / bông tuyết)
  chilledNormalItemCount: number;  // X 品 (xanh / tủ lạnh)
}

// ── Tab B (ES配送便) & C (COOL便) items ────────────
export class DeliveryItemDto {
  id: number;
  shipmentType: 'ES_DELIVERY' | 'COOL';     // ngầm định theo tab
  cargoType: 'REFRIGERATED' | 'FROZEN' | 'NORMAL'; // chip 冷蔵 / 冷凍 / —
  companyName: string;
  deliveryStatus: 'UNDELIVERED' | 'TROUBLE'; // không có DELIVERED trong list
  deliveryDate: string;            // yyyy-MM-dd
  sourceWarehouseName: string;
  destinationAddress: string;
  phone: string | null;            // SĐT liên hệ điểm giao → tel:
  boxCount: number;                // X 箱
  frozenItemCount: number;         // X 品 (đông lạnh)
  chilledNormalItemCount: number;  // X 品 (mát + thường)
}
```

---

## Enums

### `DeliveryListTab`

| Value | 日本語 | Tiếng Việt | Mô tả |
|-------|--------|-----------|-------|
| `WAREHOUSE_RECEIPT` | 倉庫受付 | Nhận tại kho | Tab A — thẻ điểm nhận |
| `ES_DELIVERY` | ES配送便 | Giao ES | Tab B — thẻ giao loại ES |
| `COOL` | COOL便 | Giao COOL | Tab C — thẻ giao loại COOL (冷蔵/冷凍) |

### `ReceiptStatus` (Tab A — filter「ステータス」)

| Value | 日本語 | Badge | Mô tả |
|-------|--------|-------|-------|
| `UNRECEIVED` | 未受付 | Orange | Chưa nhận từ kho |
| `RECEIVED` | 受付済 | Green | Đã nhận |
| `TROUBLE` | トラブル | Red | Có sự cố khi nhận |
| `CANCELLED` | 中止 | Gray | Hủy nhận |

### `DeliveryStatus` (Tab B/C — filter「ステータス」)

| Value | 日本語 | Badge | Mô tả |
|-------|--------|-------|-------|
| `UNDELIVERED` | 未配送 | Yellow | Chưa giao |
| `TROUBLE` | トラブル | Red | Sự cố khi giao |

> `DELIVERED` (配送完了) **không** dùng trong list này (đơn đã giao bị loại khỏi danh sách).

### `CargoType` (chip thẻ Tab B/C)

| Value | 日本語 | Chip |
|-------|--------|------|
| `REFRIGERATED` | 冷蔵 | ❄冷蔵 (mát) |
| `FROZEN` | 冷凍 | 冷凍 (đông lạnh) |
| `NORMAL` | 常温 | — (không chip) |

### `LocationType` (Tab A)

| Value | 日本語 | Mô tả |
|-------|--------|-------|
| `WAREHOUSE` | 倉庫 | Nhận trực tiếp tại kho |
| `TRANSIT` | 中継 | Nhận tại điểm trung chuyển |

### `ShipmentType`

Xem [shared enums](./README.md#shipmenttype) trong README.

---

## Error Responses

Envelope theo backend thật (`statusCode` là enum chuỗi) — xem [README › Error format](./README.md#error-format).

```json
{ "statusCode": "error", "message": "終了日は開始日以降を選択してください", "title": "Bad Request", "errorCode": null, "data": null }
```

| Điều kiện | Message (JP) | Message (VN) |
|-----------|--------------|--------------|
| `startDate > endDate` | 終了日は開始日以降を選択してください | Vui lòng chọn ngày kết thúc sau hoặc bằng ngày bắt đầu |
| `endDate − startDate > 31 ngày` | 1ヶ月以内の期間を選択してください | Vui lòng chọn khoảng thời gian trong vòng 1 tháng |
| `tab` không hợp lệ | 無効なタブパラメータ | Tham số tab không hợp lệ |
| Sai định dạng ngày | 日付形式が不正です (yyyy-MM-dd) | Định dạng ngày không đúng (yyyy-MM-dd) |

```json
{ "statusCode": "unauthorized", "message": "Invalid or expired token", "title": "Unauthorized", "errorCode": null, "data": null }
```

---

## Business Rules / ビジネスルール

### Điều kiện dữ liệu mỗi tab

| Tab | Data condition |
|-----|----------------|
| **A** 倉庫受付 | Tất cả receipt status: `UNRECEIVED` / `RECEIVED` / `TROUBLE` / `CANCELLED` (filter qua `receiptStatus`) |
| **B** ES配送便 | `shipmentType = ES_DELIVERY` & `deliveryStatus IN (UNDELIVERED, TROUBLE)` |
| **C** COOL便 | `shipmentType = COOL` & `deliveryStatus IN (UNDELIVERED, TROUBLE)` |

> Đơn `DELIVERED` (配送完了) không xuất hiện ở bất kỳ tab nào của list này.

### Banner theo tab

- Tab **COOL便**: hiện banner tĩnh 「冷蔵便です。温度管理に注意して配送してください。」 (Static UI — no API).
- Tab A / ES配送便: không banner.

### Sort order

| Ưu tiên | Field | Hướng |
|---------|-------|-------|
| 1 | `deliveryDate` | ASC (gần nhất trước) |
| 2 | status priority | `TROUBLE` > `UNRECEIVED`/`UNDELIVERED` > `RECEIVED` |
| 3 | `locationName` / `companyName` | ASC |

### Quyền sửa thẻ (card actions)

| Điều kiện | Quyền | Hành vi FE |
|-----------|-------|-----------|
| Item ngày tương lai (mọi tab) | Read-only | Ẩn nút action |
| Tab A: `UNRECEIVED`/`RECEIVED` (hôm nay) | Editable | Hiện nút check / X |
| Tab B (ES配送便) trong 7 ngày | Editable | Hiện nút 「履歴を開始する」 |
| Tab B (ES配送便) quá 7 ngày | Read-only | Không nút action |
| Tab C (COOL便) | Read-only | Hiện nút check/X nhưng disabled |

### Quy tắc hiển thị số lượng

| Điều kiện | Hiển thị |
|-----------|----------|
| Count = 0 | Ẩn counter |
| Picking đã xong | Hiện số thực tế đã pick |
| Hôm nay/quá khứ, chưa picking | Hiện 「未確定」 (Chưa xác định) |

### Empty state

Khi `items = []`, FE hiển thị:
- **JP:** 「配送予定データはありません。」
- **VN:** 「Không có dữ liệu giao hàng dự kiến.」

### Pagination (infinite scroll)

Theo quy ước cursor chung — xem [README.md](./README.md#pagination-cursor-based--infinite-scroll).

---

## Tham chiếu

- Mockup HTML (bản render): [delivery-list/apis/index.html](../delivery-list/apis/index.html)
- Mockup màn hình: [DA_LIST_00_A](../delivery-list/DA_LIST_00_A.html) (倉庫受付) · [DA_LIST_00_B](../delivery-list/DA_LIST_00_B.html) (ES配送便) · [DA_LIST_00_C](../delivery-list/DA_LIST_00_C.html) (COOL便)
- Bảng field gốc (máy dịch, **đã thay thế** bởi file này): [DA_LIST_00_tables.md](../delivery-list/DA_LIST_00_tables.md)
