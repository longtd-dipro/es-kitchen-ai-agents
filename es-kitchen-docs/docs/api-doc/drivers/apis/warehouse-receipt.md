---
doc: warehouse-receipt
module: driver
base_path: /driver
auth: Bearer (Driver)
screens: [DA_RECV_001, DA_RECV_001_Checked, DA_RECV_001_Modal, DA_RECV_003]
endpoints:
  - GET /driver/receipts/{receiptId}
  - POST /driver/receipts/{receiptId}/complete
status: design
updated: 2026-06-16
---

# Warehouse Receipt API — `DA_RECV_001` / `DA_RECV_003`

API cho luồng **荷物受取 (nhận hàng tại kho)** của tài xế: mở chi tiết một điểm nhận
(kho), tích nhận từng kiện hàng, rồi xác nhận hoàn thành (toàn bộ hoặc một phần).

| Màn hình | Trạng thái | Endpoint phục vụ |
|----------|-----------|------------------|
| `DA_RECV_001` | Danh sách nhận hàng (chưa check) | `GET /driver/receipts/{receiptId}` |
| `DA_RECV_001` (Checked) | Đã tích chọn các kiện | `GET` (state phía client) |
| `DA_RECV_001-02/03` | Modal xác nhận nhận một phần (Section B) | `POST /driver/receipts/{receiptId}/complete` |
| `DA_RECV_003` | Đã hoàn thành (read-only + banner) | `GET` (khi `completedAt != null`) |

> Quy ước chung (auth, headers, error envelope, ngày `yyyy-MM-dd`) xem
> [README.md](./README.md#-conventions-áp-dụng-cho-mọi-endpoint).
> Điều hướng vào màn này: từ thẻ kho `UNRECEIVED` ở `DA_HOME_001`
> ([dashboard.md](./dashboard.md)) hoặc item Tab A của
> [delivery-list.md](./delivery-list.md) — `receiptId` = `id` của item kho đó.

---

## GET /driver/receipts/{receiptId}

Trả về chi tiết một điểm nhận hàng: thông tin kho (header), tóm tắt số lượng, và
danh sách **nhóm nhận hàng theo điểm giao (納品先)**, mỗi nhóm chứa các kiện hàng
(送り状番号) kèm trạng thái nhận từng kiện. Cùng endpoint phục vụ cả màn `DA_RECV_001`
(đang nhận) và `DA_RECV_003` (đã hoàn thành — phân biệt qua `completedAt`).

### Request

```http
GET /driver/receipts/9001
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Path Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `receiptId` | number | ✅ | ID điểm nhận hàng (= `id` thẻ kho ở Home / Tab A delivery-list) |

> Bộ lọc 未確認のみ表示 (A.7) và ô tìm kiếm 納品先拠点名 (A.8) là **lọc phía client** trên
> dữ liệu đã trả về — **không** có query param tương ứng.

### Response 200

`completedAt = null` → màn đang nhận (`DA_RECV_001`).

```json
{
  "receiptId": 9001,
  "warehouseName": "オージーフーズ倉庫",
  "deliveryDate": "2026-06-12",
  "slipNumber": "DN-20260612-0001",
  "receiptStatus": "UNRECEIVED",
  "postalCode": "151-0051",
  "address": "東京都渋谷区千駄ヶ谷5-32-7野村不動産南新宿ビル2階",
  "completedAt": null,
  "summary": {
    "companyCount": 10,
    "boxCount": 50,
    "chilledNormalItemCount": 500,
    "frozenItemCount": 500
  },
  "groups": [
    {
      "id": 5001,
      "shipmentType": "COOL",
      "companyName": "大和インターナショナルトレーディング株式会社",
      "destinationAddress": "東京都渋谷区1-2-3",
      "boxCount": 2,
      "chilledNormalItemCount": 10,
      "frozenItemCount": 20,
      "items": [
        { "id": 70011, "lineNo": 1, "trackingNo": "2107-6228-5031", "receiptStatus": "UNRECEIVED", "received": false },
        { "id": 70012, "lineNo": 2, "trackingNo": "2107-6228-5032", "receiptStatus": "UNRECEIVED", "received": false },
        { "id": 70013, "lineNo": 3, "trackingNo": "2107-6228-5033", "receiptStatus": "TROUBLE", "received": false }
      ]
    },
    {
      "id": 5002,
      "shipmentType": "ES_DELIVERY",
      "companyName": "富士フィナンシャルアドバイザリー株式会社",
      "destinationAddress": "東京都新宿区西新宿2-8-1",
      "boxCount": 2,
      "chilledNormalItemCount": 10,
      "frozenItemCount": 20,
      "items": [
        { "id": 70021, "lineNo": 1, "trackingNo": "3108-1234-1122", "receiptStatus": "RECEIVED", "received": true },
        { "id": 70022, "lineNo": 2, "trackingNo": "3108-5678-1122", "receiptStatus": "UNRECEIVED", "received": false }
      ]
    }
  ]
}
```

#### Trạng thái đã hoàn thành (`DA_RECV_003`)

`completedAt != null` → FE chuyển sang read-only, hiện banner xanh
「荷物の受取は完了しました。」 + thời điểm từ `completedAt`.

```json
{
  "receiptId": 9001,
  "warehouseName": "オージーフーズ倉庫",
  "deliveryDate": "2026-06-12",
  "slipNumber": "DN-20260612-0001",
  "receiptStatus": "RECEIVED",
  "postalCode": "151-0051",
  "address": "東京都渋谷区千駄ヶ谷5-32-7野村不動産南新宿ビル2階",
  "completedAt": "2026-04-15T12:03:00+09:00",
  "summary": { "companyCount": 10, "boxCount": 50, "chilledNormalItemCount": 500, "frozenItemCount": 500 },
  "groups": [ "...(mọi item received=true, hiển thị dấu check read-only)..." ]
}
```

### Field mapping → màn hình `DA_RECV_001`

| No | Field (response) | Vị trí trên UI |
|----|------------------|----------------|
| A.3 | `warehouseName` | Tên kho (header card vàng) |
| A.4 | `deliveryDate` | Ngày giao `yyyy-MM-dd（曜日）` |
| A.5 | `slipNumber` | 伝票番号 (số phiếu import; **chưa render ở mockup hiện tại** — placement TBD) |
| A.6 | `address` + `postalCode` | 〒 + dòng địa chỉ kho |
| — | `summary.companyCount` | 「X 社」 |
| — | `summary.boxCount` | 「X 箱」 |
| — | `summary.chilledNormalItemCount` | 「X 品」 (icon boxes-stacked — mát + thường) |
| — | `summary.frozenItemCount` | 「X 品」 (icon bông tuyết — đông lạnh) |
| A.10 | `receiptStatus` | Badge kho (未受取/受取済/トラブル/中止) |
| A.11 | `groups[].companyName` | Tiêu đề thẻ nhóm (納品先名) |
| 20 | `groups[].shipmentType` | Icon loại giao ở **header thẻ nhóm** — `ES_DELIVERY`=配送+棚入れ (giao + sếp lên kệ) / `COOL`=配送のみ (chỉ giao) |
| — | `groups[].destinationAddress` | Địa chỉ điểm giao của nhóm |
| — | `groups[].boxCount/chilled/frozen` | Dòng tóm tắt của nhóm |
| — | `items[].lineNo` | Số thứ tự (1,2,3…) |
| A.12 | `items[].trackingNo` | 送り状番号 mỗi dòng |
| A.9 | `items[].received` | Trạng thái checkbox nhận |
| A.10 | `items[].receiptStatus` | Badge từng kiện (未着荷/受領済/トラブル) |
| C/banner | `completedAt` | Banner 「…完了しました。」 + thời điểm (DA_RECV_003) |

---

## POST /driver/receipts/{receiptId}/complete

Xác nhận hoàn thành nhận hàng cho điểm nhận. Một endpoint xử lý **cả hai luồng**:

- **Toàn bộ** (`FULL`): tất cả kiện nhận được đều được tích → hoàn thành ngay, FE hiện
  toast 「荷物の受取は完了しました。」 (Section C) rồi về Home. `esKitchenContacted` bị bỏ qua.
- **Một phần** (`PARTIAL`): còn kiện chưa nhận → bắt buộc `esKitchenContacted = true`
  (tương ứng B.4 đã check **hoặc** B.5「ESへ電話する」đã bấm trong modal Section B),
  ngược lại trả `400`.

### Request

```http
POST /driver/receipts/9001/complete
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
Content-Type: application/json
```

```json
{
  "receivedItemIds": [70011, 70012, 70021, 70022],
  "esKitchenContacted": false
}
```

### Path Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `receiptId` | number | ✅ | ID điểm nhận hàng |

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `receivedItemIds` | number[] | ✅ | Danh sách `items[].id` đã tích nhận (A.9). Phải ≥ 1 phần tử |
| `esKitchenContacted` | boolean | ✅ | `true` khi đã báo ES về phần chưa nhận (B.4 check / B.5 gọi). Bắt buộc `true` nếu hoàn thành một phần |

### Response 200 — hoàn thành toàn bộ (`FULL`)

```json
{
  "receiptId": 9001,
  "completionType": "FULL",
  "receiptStatus": "RECEIVED",
  "completedAt": "2026-06-12T12:03:00+09:00",
  "receivedCount": 5,
  "unreceivedCount": 0,
  "message": "荷物の受取は完了しました。"
}
```

### Response 200 — hoàn thành một phần (`PARTIAL`)

```json
{
  "receiptId": 9001,
  "completionType": "PARTIAL",
  "receiptStatus": "RECEIVED",
  "completedAt": "2026-06-12T12:03:00+09:00",
  "receivedCount": 3,
  "unreceivedCount": 2,
  "message": "一部未受取のまま受取を完了しました。"
}
```

> Kiện trong `receivedItemIds` → `RECEIVED`. Kiện không có trong danh sách giữ nguyên
> trạng thái hiện tại (`UNRECEIVED` / `TROUBLE`). `receiptStatus` của điểm nhận chuyển
> `RECEIVED` ở cả hai loại (công việc nhận đã đóng). `message` đa ngôn ngữ theo `Accept-Language`.

---

## Response DTOs

```typescript
// ── GET /driver/receipts/{receiptId} ──────────────
export class WarehouseReceiptDetailResponse {
  receiptId: number;
  warehouseName: string;            // A.3 倉庫名
  deliveryDate: string;             // A.4 配送日 (yyyy-MM-dd)
  slipNumber: string | null;        // A.5 伝票番号 (import, free format)
  receiptStatus: 'UNRECEIVED' | 'RECEIVED' | 'TROUBLE' | 'CANCELLED'; // A.10 kho
  postalCode: string | null;        // 〒151-0051
  address: string;                  // A.6 住所 (địa chỉ kho)
  completedAt: string | null;       // ISO8601; null khi chưa hoàn thành (DA_RECV_003)
  summary: ReceiptSummaryDto;
  groups: ReceiptGroupDto[];
}

export class ReceiptSummaryDto {
  companyCount: number;             // X 社
  boxCount: number;                 // X 箱
  chilledNormalItemCount: number;   // X 品 (mát + thường)
  frozenItemCount: number;          // X 品 (đông lạnh)
}

export class ReceiptGroupDto {
  id: number;                       // ID nhóm nhận / điểm giao (納品先)
  shipmentType: 'ES_DELIVERY' | 'COOL'; // 20 loại giao: ES_DELIVERY=配送+棚入れ / COOL=配送のみ → icon
  companyName: string;              // A.11 納品先名
  destinationAddress: string;       // địa chỉ điểm giao
  boxCount: number;                 // X 箱
  chilledNormalItemCount: number;   // X 品
  frozenItemCount: number;          // X 品 (đông lạnh)
  items: ReceiptBoxItemDto[];
}

export class ReceiptBoxItemDto {
  id: number;                       // ID kiện (dùng trong /complete)
  lineNo: number;                   // số thứ tự hiển thị (1,2,3…)
  trackingNo: string;            // A.12 送り状番号
  receiptStatus: 'UNRECEIVED' | 'RECEIVED' | 'TROUBLE'; // A.10 badge kiện
  received: boolean;                // A.9 trạng thái checkbox
}

// ── POST /driver/receipts/{receiptId}/complete ────
export class CompleteReceiptRequest {
  receivedItemIds: number[];        // A.9 — id các kiện đã nhận (≥ 1)
  esKitchenContacted: boolean;             // B.4 / B.5 — đã liên lạc ES về phần chưa nhận
}

export class CompleteReceiptResponse {
  receiptId: number;
  completionType: 'FULL' | 'PARTIAL';
  receiptStatus: 'RECEIVED';
  completedAt: string;              // ISO8601
  receivedCount: number;
  unreceivedCount: number;
  message: string;                  // đa ngôn ngữ theo Accept-Language
}
```

---

## Enums

### `ItemReceiptStatus` (A.10 — badge từng kiện)

Trạng thái nhận **cấp kiện hàng** trên `DA_RECV_001`. Nhãn JP khác với cấp điểm nhận
(README dùng 未受取/受取済); cấp kiện dùng 未着荷/受領済.

| Value | 日本語 | Tiếng Việt | Badge | Mô tả |
|-------|--------|-----------|-------|-------|
| `UNRECEIVED` | 未着荷 | Chưa nhận | Orange | Trạng thái đầu (chưa check) |
| `RECEIVED` | 受領済 | Đã nhận | Green | Đã tích nhận (A.9) |
| `TROUBLE` | トラブル | Trục trặc | Red | Admin đăng ký sự cố cung ứng (độc lập checkbox, không tự tích được) |

### `ReceiptCompletionType`

| Value | 日本語 | Tiếng Việt | Mô tả |
|-------|--------|-----------|-------|
| `FULL` | 全量受取 | Nhận toàn bộ | Mọi kiện nhận được đều đã tích |
| `PARTIAL` | 一部未受取 | Nhận một phần | Còn kiện chưa nhận → yêu cầu `esKitchenContacted = true` |

### `ShipmentType` (20 — icon loại giao, cấp nhóm 納品先)

Dùng lại shared enum `ShipmentType` — xem [README › ShipmentType](./README.md#shipmenttype).
Trên màn `DA_RECV_001`, mỗi nhóm 納品先 hiển thị **một icon** theo loại giao:

| Value | 日本語 | Tiếng Việt | Icon (gợi ý) | Ý nghĩa thao tác tài xế |
|-------|--------|-----------|--------------|-------------------------|
| `ES_DELIVERY` | ES配送便 | Loại ES | 棚 (kệ/shelf) | Giao hàng đến **và** sếp lên kệ (棚入れあり) |
| `COOL` | COOL便 | Loại COOL | トラック (xe/truck) | **Chỉ** giao hàng, không sếp lên kệ (棚入れなし) |

### `receiptStatus` (cấp điểm nhận — header)

Dùng lại shared enum `ReceiptStatus` (UNRECEIVED 未受取 / RECEIVED 受取済 / TROUBLE トラブル /
CANCELLED 中止) — xem [README › Trạng thái nhận / giao](./README.md#trạng-thái-nhận--giao).

---

## Error Responses

Envelope theo backend thật — `statusCode` là enum chuỗi (map HTTP: 400→`error`, 401→`unauthorized`,
403→`forbidden`, 404→`not_found`, 409→`conflict`). Xem [README › Error format](./README.md#error-format).

```json
{ "statusCode": "error", "message": "受け取った荷物を1件以上選択してください", "title": "Bad Request", "errorCode": null, "data": null }
```

| HTTP | Điều kiện | Message (JP) | Message (VN) |
|------|-----------|--------------|--------------|
| 400 | `receivedItemIds` rỗng | 受け取った荷物を1件以上選択してください | Vui lòng chọn ít nhất 1 kiện hàng đã nhận |
| 400 | Hoàn thành một phần nhưng `esKitchenContacted = false` | 未受取の荷物があります。ESキッチンへの連絡を確認してください | Còn kiện chưa nhận. Vui lòng xác nhận đã liên lạc ES Kitchen |
| 400 | `receivedItemIds` chứa id không thuộc receipt / đang `TROUBLE` / `CANCELLED` | 無効な荷物が含まれています | Có kiện hàng không hợp lệ trong danh sách |
| 401 | Token sai/hết hạn | 認証エラー | Lỗi xác thực |
| 403 | Không phải tài xế được phân công receipt này | この受取を操作する権限がありません | Bạn không có quyền thao tác điểm nhận này |
| 404 | `receiptId` không tồn tại | 指定された荷物受取が見つかりません | Không tìm thấy điểm nhận hàng |
| 409 | Điểm nhận đã hoàn thành (`completedAt != null`) | この荷物受取はすでに完了しています | Điểm nhận này đã hoàn thành rồi |

```json
{ "statusCode": "conflict", "message": "この荷物受取はすでに完了しています", "title": "Conflict", "errorCode": null, "data": null }
```

---

## Business Rules / ビジネスルール

### Điều hướng & quyền sửa

| Điều kiện | Hành vi |
|-----------|---------|
| `completedAt == null` & `receiptStatus != CANCELLED` | Editable — màn `DA_RECV_001`, cho tích checkbox |
| `completedAt != null` | Read-only — màn `DA_RECV_003`, hiện banner + dấu check, ẩn nút 完了 |
| `receiptStatus == CANCELLED` (中止) | Read-only |

### Checkbox & nút 完了 (A.9 / A.13)

1. `items[].received` toggle cục bộ `UNRECEIVED ↔ RECEIVED`; kiện `TROUBLE` **không** tích được (độc lập với checkbox).
2. Nút 完了 **disabled** khi 0 kiện được tích (không gọi API).
3. **Tất cả** kiện nhận được đã tích → gọi `/complete` → `FULL` → toast Section C → Home.
4. **Còn** kiện chưa tích → hiện modal Section B → cần B.4 check / B.5 gọi (`esKitchenContacted = true`) → `/complete` → `PARTIAL` → Home.

### Phân loại FULL vs PARTIAL (server)

- `FULL` ⇔ mọi kiện của receipt đều thuộc `receivedItemIds` (không còn `UNRECEIVED`/`TROUBLE`).
- Ngược lại `PARTIAL` ⇒ bắt buộc `esKitchenContacted = true`.
- Idempotent guard: receipt đã `completedAt != null` → `409`.

### Lọc & tìm kiếm phía client

- A.7 未確認のみ表示: lọc real-time chỉ kiện `received = false` (client-side).
- A.8 納品先拠点名: lọc real-time `groups[].companyName` theo keyword, tối đa 100 ký tự (client-side).
- Cả hai **không** sinh request mới.

### Sort order

| Cấp | Field | Hướng |
|-----|-------|-------|
| Nhóm (group) | `companyName` | ASC |
| Kiện (item) | `lineNo` | ASC |

### Loại giao hàng & 棚入れ (20 — `groups[].shipmentType`)

- Mỗi nhóm 納品先 mang một `shipmentType`; FE render icon tương ứng ở header thẻ nhóm.
- `ES_DELIVERY` → giao hàng **và** sếp lên kệ (棚入れあり) → icon kệ/shelf.
- `COOL` → **chỉ** giao hàng, không sếp kệ (棚入れなし) → icon xe/truck.
- Đây là field **hiển thị**; không thay đổi luồng tích nhận / `/complete`. Một receipt có thể chứa cả hai loại (mỗi nhóm khác nhau).

### Các thành phần chỉ-FE (không cần API)

- Section C — toast 「荷物の受取は完了しました。」 (5s rồi về Home).
- Section D — popup 「編集内容を破棄しますか？」 khi nhấn back sau khi đã thao tác ≥1 checkbox.
- Section B — modal xác nhận nhận một phần (text/điện thoại 050-5784-2777 cố định ở FE).

---

## Tham chiếu

- **Screen spec annotated** (mockup đánh số + bảng ráp Response/Request DTO): [warehouse/DA_RECV_001.html](../warehouse/DA_RECV_001.html)
- Mockup HTML (bản render API): [warehouse/apis/index.html](../warehouse/apis/index.html)
- Bảng field gốc: [danh_sach_man_hinh.md](../warehouse/danh_sach_man_hinh.md) ·
  [Modal B](../warehouse/UI_Specification_Modal_Xac_Nhan.md) ·
  [Toast C / Popup D](../warehouse/UI_Specification_Table3.md) ·
  [Luồng điều hướng](../warehouse/dieu-huog.md)
</content>
</invoke>
