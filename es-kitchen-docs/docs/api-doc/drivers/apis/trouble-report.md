---
doc: trouble-report
module: driver
base_path: /driver
auth: Bearer (Driver)
screens: [DA_RPTD_001_01, DA_RPTD_001_02, DA_RPTD_002_01, DA_RPTD_002_01_1, DA_RPTD_002_02, DA_RPTD_002_03, DA_RPTD_002_03_1]
endpoints:
  - GET  /driver/trouble-reports/targets
  - POST /driver/trouble-reports
status: design
updated: 2026-06-17
pagination: cursor
---

# Trouble Report API — `DA_RPTD_001 / 002` (トラブル報告 / Báo cáo vấn đề)

Luồng **báo cáo vấn đề** của tài xế: chọn điểm bị ảnh hưởng → điền form (loại sự cố +
送り状 bị ảnh hưởng + ảnh + 備考) → xác nhận → gửi. Ghi vào `trouble_reports` +
`trouble_report_items`.

| Bước | Màn hình | Endpoint |
|------|----------|----------|
| 1. Chọn điểm có vấn đề | `DA_RPTD_001-01` (chưa chọn) · `DA_RPTD_001-02` (đã chọn) | `GET /driver/trouble-reports/targets` |
| 2. Mở form (lấy 荷物 + options) | `DA_RPTD_002-01` · `DA_RPTD_002-01-1` (variant) · `DA_RPTD_002-02` (đã điền) | — (tái dùng detail endpoint; reason = enum FE — [xem](#dựng-form-da_rptd_002--không-có-endpoint-riêng)) |
| 3. Xác nhận & gửi | `DA_RPTD_002-03` (送信確認) · `DA_RPTD_002-03-1` (電話確認) | `POST /driver/trouble-reports` |

> Quy ước chung (auth, headers, pagination, error envelope, date format) — xem
> [README.md](./README.md#-conventions-áp-dụng-cho-mọi-endpoint). Không lặp lại ở đây.
>
> Enum dùng chung (`ShipmentType`, `ReceiptStatus`, `DeliveryStatus`) — xem
> [README · Shared enums](./README.md#-shared-enums-dùng-chung-nhiều-endpoint).
> Enum riêng của feature này (`TroubleReason`, `TroubleType`, `TroubleReportStatus`,
> `TroubleTargetType`) định nghĩa ở [Enums](#enums) bên dưới.

---

## GET /driver/trouble-reports/targets

Danh sách **điểm có thể báo cáo** (radio chọn 1). Gộp 2 loại trong **một** danh sách cuộn:

- **Giao chưa xong** (`targetType = DELIVERY`) — thẻ công ty `未配送`/`トラブル`, icon ES配送(xanh)/COOL(tím). Item = `shipment_companies` row.
- **Nhận kho chưa xong** (`targetType = WAREHOUSE_RECEIPT`) — thẻ kho `未受取`, icon kho(cam). Item = điểm nhận tại kho.

> Khác với [`GET /driver/delivery-list`](./delivery-list.md) (tách tab theo loại: 倉庫受付 / ES配送便 / COOL便): màn này
> **trộn** điểm nhận + điểm giao vào 1 list để tài xế chọn nơi xảy ra sự cố. Item shape kế thừa
> `WarehouseReceiptItemDto` / `DeliveryItemDto` của delivery-list, gói trong `TroubleTargetItemDto`.

### Request

```http
GET /driver/trouble-reports/targets?keyword=オージー&limit=20
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Query Parameters

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `keyword` | string | ❌ | — | Tìm tự do: 倉庫名 / 拠点名 / 送り状番号 (tracking_no) / tên công ty / địa chỉ |
| `cursor` | string | ❌ | — | Cursor trang kế (lấy từ `nextCursor`) |
| `limit` | number | ❌ | `20` | Item mỗi trang. Tối đa 50 |

#### Filter cố định (server, không nhận param)

- `DELIVERY`: chỉ `deliveryStatus IN (UNDELIVERED, TROUBLE)` — đơn **chưa giao xong**.
- `WAREHOUSE_RECEIPT`: chỉ `receiptStatus IN (UNRECEIVED, TROUBLE)` — điểm **chưa nhận xong**.
- Chỉ shipment được phân cho tài xế đang đăng nhập (`shipments.driver_id = me`).

### Response (JSON)

```json
{
  "items": [
    {
      "targetType": "DELIVERY",
      "id": 2001,
      "shipmentType": "ES_DELIVERY",
      "name": "富士フィナンシャルアドバイザリー株式会社",
      "status": "UNDELIVERED",
      "deliveryDate": "2026-06-12",
      "sourceWarehouseName": "オージーフーズ倉庫",
      "address": "神奈川県横浜市西区みなとみらい二丁目３番３号　クイーンズタワーＢ１０階",
      "companyCount": null,
      "boxCount": 2,
      "frozenItemCount": 10,
      "chilledNormalItemCount": 20
    },
    {
      "targetType": "DELIVERY",
      "id": 2002,
      "shipmentType": "COOL",
      "name": "大和インターナショナルトレーディング株式会社",
      "status": "UNDELIVERED",
      "deliveryDate": "2026-06-12",
      "sourceWarehouseName": "オージーフーズ倉庫",
      "address": "東京都千代田区大手町一丁目２番３号　大手町グランドタワー１５階",
      "companyCount": null,
      "boxCount": 2,
      "frozenItemCount": 10,
      "chilledNormalItemCount": 20
    },
    {
      "targetType": "WAREHOUSE_RECEIPT",
      "id": 1001,
      "shipmentType": null,
      "name": "オージーフーズ倉庫",
      "status": "UNRECEIVED",
      "deliveryDate": "2026-06-12",
      "sourceWarehouseName": null,
      "address": "東京都渋谷区千駄ヶ谷5-32-7野村不動産南新宿ビル2階",
      "companyCount": 10,
      "boxCount": 50,
      "frozenItemCount": 500,
      "chilledNormalItemCount": 500
    }
  ],
  "nextCursor": "eyJpZCI6MTAwMX0=",
  "hasMore": true
}
```

### DTOs

```typescript
export class TroubleTargetListResponse {
  items: TroubleTargetItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class TroubleTargetItemDto {
  targetType: 'DELIVERY' | 'WAREHOUSE_RECEIPT';
  id: number;                       // DELIVERY → shipment_companies.id; WAREHOUSE_RECEIPT → receiptId
  shipmentType: 'ES_DELIVERY' | 'COOL' | null;  // null khi WAREHOUSE_RECEIPT
  name: string;                     // tên công ty (DELIVERY) hoặc tên kho (WAREHOUSE_RECEIPT)
  status: 'UNDELIVERED' | 'TROUBLE' | 'UNRECEIVED';
  deliveryDate: string;             // yyyy-MM-dd
  sourceWarehouseName: string | null; // chỉ DELIVERY
  address: string;
  companyCount: number | null;      // chỉ WAREHOUSE_RECEIPT (「X 社」)
  boxCount: number;                 // 「X 箱」
  frozenItemCount: number;          // 「X 品」 (đông lạnh / bông tuyết)
  chilledNormalItemCount: number;   // 「X 品」 (mát + thường)
}
```

### Field mapping → thẻ list (badge `L.x`)

| № | UI element (JP / VN) | API source | Transform / format | Trigger |
|---|----------------------|------------|--------------------|---------|
| L.1 | 検索 / Ô tìm | **FE input** → `keyword` | debounce → reload list | gõ → reload |
| L.2 | 注意書き / Ghi chú hướng dẫn | — | **Static UI — no API** | — |
| L.3 | 種別アイコン / Icon loại | `items[].targetType` + `items[].shipmentType` | `DELIVERY`+`ES_DELIVERY`→xanh · `DELIVERY`+`COOL`→tím · `WAREHOUSE_RECEIPT`→cam | render |
| L.4 | 拠点名 / Tên điểm | `items[].name` | — | render |
| L.5 | ステータス badge / Badge | `items[].status` | `UNDELIVERED`→未配送(vàng) · `UNRECEIVED`→未受取(xám) · `TROUBLE`→トラブル(đỏ) | render |
| L.6 | ラジオ選択 / Radio chọn | **FE input** (1 target) | giữ `targetType`+`id` đã chọn | tap → enable 次へ |
| L.7 | 倉庫名 / Kho nguồn | `items[].sourceWarehouseName` | ẩn khi `null` (WAREHOUSE_RECEIPT) | render |
| L.8 | 住所 / Địa chỉ | `items[].address` | — | render |
| L.9 | 数量 / Số lượng (社/箱/品) | `companyCount`·`boxCount`·`frozenItemCount`·`chilledNormalItemCount` | ẩn counter khi `0`/`null` | render |
| L.10 | 戻る / 次へ | **trigger** → mở form | 次へ chỉ enable khi đã chọn 1; truyền `targetType`,`id` sang màn form (FE tái dùng detail endpoint) | tap 次へ |

---

## Dựng form (`DA_RPTD_002`) — **không có endpoint riêng**

> ⚠️ **Đã bỏ `GET /driver/trouble-reports/form`.** Dữ liệu form lấy từ những nguồn đã có,
> không cần round-trip riêng:

**1. Thẻ điểm đến + danh sách 送り状 (box) để tick** → tái dùng **detail endpoint đã có**,
chọn theo `targetType` của target đã chọn ở bước 1:

| `targetType` | Endpoint tái dùng | Nguồn box / destination |
|--------------|-------------------|--------------------------|
| `DELIVERY` | `GET /driver/deliveries/{deliveryId}` ([es-delivery.md](./es-delivery.md) / [cool-delivery-completion.md](./cool-delivery-completion.md)) | `boxes[]` (`id`/`trackingNo`/`boxNumber`) + `destination` + `cargoSummary` |
| `WAREHOUSE_RECEIPT` | `GET /driver/receipts/{receiptId}` ([warehouse-receipt.md](./warehouse-receipt.md)) | `groups[].items[]` (`id`/`trackingNo`) + `warehouseName`/`address` + `summary` |

> `deliveryId` / `receiptId` = `id` của target đã chọn ở bước 1 (`L.6`). FE đã có sẵn dữ liệu
> này từ luồng giao/nhận, có thể cache lại để khỏi gọi thêm.

**2. Danh sách loại sự cố (`reasonOptions`)** → **enum `TroubleReason` cố định ở FE** (xem
[Enums › TroubleReason](#enums)), nhãn JP/VN do **FE i18n**, không trả từ server. Hai bộ option
(TROUBLE-set ở `DA_RPTD_002-01` và DELAY-set ở `DA_RPTD_002-01-1`) là **lọc theo `type`** trong
enum FE, không còn "server quyết định".

**3. `supportPhoneNumber` (050-5784-2777) và `photoMax` (5)** → **hằng số FE** (đồng nhất với
note "số ĐT cố định ở FE" trong [warehouse-receipt.md](./warehouse-receipt.md) /
[es-delivery.md](./es-delivery.md)).

### Field mapping → form (badge `F.x`)

| № | UI element (JP / VN) | API source | Transform / format | Trigger |
|---|----------------------|------------|--------------------|---------|
| F.1 | 配送先アイコン / Icon | detail endpoint → `shipmentType` | ES_DELIVERY→xanh · COOL→tím · null(kho)→cam | render |
| F.2 | 配送先名 / Tên điểm | detail endpoint → `companyName` / `warehouseName` | ellipsis 1 dòng | render |
| F.3 | 住所 / Địa chỉ | detail endpoint → `destination.address` / `address` | — | render |
| F.4 | 数量 / Số lượng (箱/品) | detail endpoint → `cargoSummary`/`summary` (`boxCount`·`frozenItemCount`·`chilledNormalItemCount`) | ẩn khi `0` | render |
| F.5 | 全選択チェック / Check cả điểm | **FE input** | tick = chọn hết `boxes[]` | tap |
| F.6 | 行番号 / STT kiện | index của `boxes[]` (1-based) | — | render |
| F.7 | 送り状番号 / Mã vận đơn | detail endpoint → `boxes[].trackingNo` / `items[].trackingNo` | — | render |
| F.8 | 荷物チェック / Tick kiện | **FE input** → `affectedBoxIds[]` | gom `boxes[].id` đã tick | tap |
| F.9 | ヒント / Gợi ý "影響を受けた…" | — | **Static UI — no API** | — |
| F.10 | トラブル内容 / Loại sự cố | **enum `TroubleReason` (FE)** → **FE input** `reason` | radio chọn 1 (lọc theo `type`); lấy `value` | tap |
| F.11 | 理由入力 / Ô nhập lý do | **FE input** → `description` | hiện khi reason `requiresDescription` (viền đỏ = bắt buộc) | gõ |
| F.12 | 画像 / Ảnh (thumbnails) | **FE input** → `photoUrls[]` | upload S3 trước (xem [Upload ảnh](#upload-ảnh)); tối đa `photoMax`=5 (hằng số FE) | chọn ảnh |
| F.13 | ファイル選択 / Nút chọn file | **trigger** upload module | mở picker → presigned upload | tap |
| F.14 | 備考 / Ghi chú | **FE input** → `description` | gộp với F.11 (hoặc tách, xem [Business rules](#business-rules)) | gõ |
| F.15 | 戻る / Quay lại | **trigger** nav | về list (`DA_RPTD_001`) | tap |
| F.16 | 送信 / Gửi | **trigger** mở modal `C.x` | enable khi đã chọn `reason`; chưa gọi API | tap |

---

## POST /driver/trouble-reports

Gửi báo cáo (nút **報告する** trong modal `DA_RPTD_002-03`). Tạo 1 `trouble_reports` +
N `trouble_report_items`, set `submitted_at = now()`, sinh `report_no`. Sau khi gửi, target
chuyển trạng thái `TROUBLE` và **bị khóa thao tác** ("対象の荷物は操作できなくなります").

### Request

```http
POST /driver/trouble-reports
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
Content-Type: application/json
```

```json
{
  "targetType": "DELIVERY",
  "targetId": 2002,
  "reason": "OTHER",
  "type": "DELAY",
  "description": "配送先住所の詳細が不明確で、配達に時間がかかりました。受取人と連絡が取れず遅延が発生しました。",
  "affectedBoxIds": [7001, 7003],
  "photoUrls": [
    "https://s3.ap-northeast-1.amazonaws.com/es-kitchen/trouble/9001-1.jpg",
    "https://s3.ap-northeast-1.amazonaws.com/es-kitchen/trouble/9001-2.jpg",
    "https://s3.ap-northeast-1.amazonaws.com/es-kitchen/trouble/9001-3.jpg"
  ],
  "esKitchenContacted": true
}
```

### Body Parameters

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `targetType` | enum | ✅ | `DELIVERY` \| `WAREHOUSE_RECEIPT` (từ bước chọn) |
| `targetId` | number | ✅ | `id` của target → resolve ra `trouble_reports.shipment_id` |
| `reason` | enum | ✅ | `TroubleReason` (value của option đã chọn) → `trouble_reports.reason` |
| `type` | enum | ✅ | `TroubleType` (`TROUBLE` \| `DELAY`) — FE gửi kèm vì `SHORTAGE`/`OTHER` thuộc cả 2 bộ; xem [Enums](#enums) → `trouble_reports.type` |
| `description` | string \| null | ⚠️ | 理由 + 備考. **Bắt buộc** khi reason có `requiresDescription=true` (vd `OTHER`) → `trouble_reports.description` |
| `affectedBoxIds` | number[] | ❌ | `boxes[].id` đã tick (`F.8`) → mỗi id tạo 1 `trouble_report_items` (snapshot `tracking_no`) |
| `photoUrls` | string[] | ❌ | 0–`photoMax` (=5) URL ảnh S3 đã upload → `trouble_reports.photo_urls` (jsonb) |
| `esKitchenContacted` | boolean | ❌ | Check "ESキッチンへ連絡済みです" (`C.6`). Default `false`. **TBD** — chưa có cột riêng, tạm map vào `admin_note`/bỏ qua |

### Response (JSON)

```json
{
  "id": 9001,
  "reportNo": "TR000000123",
  "status": "PENDING",
  "submittedAt": "2026-06-16T15:42:00+09:00",
  "targetType": "DELIVERY",
  "targetId": 2002,
  "newStatus": "TROUBLE",
  "message": "トラブル報告を送信しました。"
}
```

### DTOs

```typescript
export class CreateTroubleReportRequest {
  targetType: 'DELIVERY' | 'WAREHOUSE_RECEIPT';
  targetId: number;
  reason: 'SHORTAGE' | 'WRONG_DELIVERY' | 'DAMAGED' | 'NO_CONTACT' | 'TRAFFIC' | 'OTHER';
  type: 'TROUBLE' | 'DELAY';        // FE gửi kèm (SHORTAGE/OTHER thuộc cả 2 bộ)
  description?: string | null;
  affectedBoxIds?: number[];
  photoUrls?: string[];
  esKitchenContacted?: boolean;
}

export class TroubleReportResponse {
  id: number;
  reportNo: string;                 // TR000000123
  status: 'PENDING';
  submittedAt: string;              // ISO datetime +09:00
  targetType: 'DELIVERY' | 'WAREHOUSE_RECEIPT';
  targetId: number;
  newStatus: 'TROUBLE';             // trạng thái target sau khi gửi
  message: string;                  // honor Accept-Language
}
```

### Field mapping → modal xác nhận (badge `C.x`)

| № | UI element (JP / VN) | API source | Transform / format | Trigger |
|---|----------------------|------------|--------------------|---------|
| C.1 | マスコット + タイトル「この内容で報告を送信しますか？」 | — | **Static UI** | — |
| C.2 | サブ「送信後、対象の荷物は操作できなくなります」 | — | **Static UI** | — |
| C.3 | 報告する / Gửi báo cáo | **trigger** `POST /driver/trouble-reports` | body gom từ `F.8/F.10/F.11/F.12/F.14` | tap |
| C.4 | キャンセル / Huỷ | **trigger** đóng modal | về form | tap |
| C.5 | 電話確認タイトル「ESキッチンへ電話しますか？」 | — | **Static UI** | — |
| C.6 | 「ESキッチンへ連絡済みです」 checkbox | **FE input** → `esKitchenContacted` | boolean (**TBD** cột DB) | tap |
| C.7 | ESへ電話する（050-5784-2777） | **hằng số FE** (`supportPhoneNumber`) | dựng `tel:` link | tap → gọi |
| C.8 | トラブル報告へ / 戻る | **trigger** nav | quay về form / list | tap |

---

## Enums

### `TroubleTargetType`

| Value | 日本語 | Tiếng Việt | `id` trỏ tới |
|-------|--------|-----------|--------------|
| `DELIVERY` | 配送 | Điểm giao | `shipment_companies.id` |
| `WAREHOUSE_RECEIPT` | 倉庫受取 | Điểm nhận kho | receiptId |

### `TroubleReason` (`trouble_reports.reason`) — **enum FE**

FE định nghĩa enum này (nhãn JP/VN qua i18n, `requiresDescription` do FE), render radio theo
2 bộ lọc bởi `type`. `DA_RPTD_002-01` = bộ `TROUBLE`; `DA_RPTD_002-01-1` = bộ `DELAY`.

| Value | 日本語 | Tiếng Việt | `type` | `requiresDescription` | Badge |
|-------|--------|-----------|--------|------------------------|-------|
| `SHORTAGE` | 箱数不足 / 商品不足 | Thiếu kiện / thiếu hàng | `TROUBLE` & `DELAY` | false | Red |
| `WRONG_DELIVERY` | 誤配送 | Giao nhầm | `TROUBLE` | false | Red |
| `DAMAGED` | 荷物破損 | Hàng hư hỏng | `TROUBLE` | false | Red |
| `NO_CONTACT` | 不在・連絡不可 | Vắng / không liên lạc | `DELAY` | false | Orange |
| `TRAFFIC` | 交通遅延・事故 | Kẹt xe / tai nạn | `DELAY` | false | Orange |
| `OTHER` | その他 | Khác | `TROUBLE` & `DELAY` | true | Gray |

### `TroubleType` (`trouble_reports.type`)

FE gửi kèm `reason` (vì `SHORTAGE`/`OTHER` thuộc cả 2 bộ → không suy duy nhất từ `reason`):

| Value | 日本語 | Tiếng Việt | Reason điển hình |
|-------|--------|-----------|------------------|
| `TROUBLE` | トラブル | Sự cố hàng hoá | `SHORTAGE` / `WRONG_DELIVERY` / `DAMAGED` |
| `DELAY` | 遅延 | Chậm giao | `SHORTAGE` / `TRAFFIC` / `NO_CONTACT` |

### `TroubleReportStatus` (`trouble_reports.status`)

| Value | 日本語 | Tiếng Việt | Ý nghĩa |
|-------|--------|-----------|---------|
| `PENDING` | 未対応 | Chờ xử lý | Vừa gửi (giá trị khi tạo) |
| `IN_PROGRESS` | 対応中 | Đang xử lý | Admin đang xử lý |
| `RESOLVED` | 解決済 | Đã giải quyết | — |
| `REJECTED` | 却下 | Bị từ chối | — |

> App driver chỉ **tạo** report (`PENDING`). 3 trạng thái còn lại do admin cập nhật.

---

## Errors

Dùng error envelope chung — xem [README · Error format](./README.md#error-format).
`statusCode` là enum chuỗi (`error`/`not_found`/`conflict`…), mã nghiệp vụ (nếu có) ở `errorCode`.

| HTTP | `statusCode` | Điều kiện | Message (JP) | Message (VN) |
|------|--------------|-----------|--------------|--------------|
| 400 | `error` | thiếu `reason` | トラブル内容を選択してください | Vui lòng chọn loại sự cố |
| 400 | `error` | reason cần lý do nhưng `description` rỗng | 理由を入力してください | Vui lòng nhập lý do |
| 400 | `error` | `photoUrls.length > photoMax` | 画像は最大5枚までです | Tối đa 5 ảnh |
| 400 | `error` | `affectedBoxIds` không thuộc target | 対象外の荷物が含まれています | Có kiện không thuộc điểm này |
| 404 | `not_found` | `targetId`/`targetType` không tồn tại / không phải của tài xế | 対象が見つかりません | Không tìm thấy đối tượng |
| 409 | `conflict` | target đã có report đang mở (`PENDING`/`IN_PROGRESS`) | この拠点は既に報告済みです | Điểm này đã được báo cáo |

```json
{ "statusCode": "conflict", "message": "この拠点は既に報告済みです", "title": "Conflict", "errorCode": null, "data": null }
```

---

## Business rules

### Sau khi gửi (POST thành công)

1. Tạo `trouble_reports` (`status=PENDING`, `submitted_at=now()`, `report_no=TR{seq}`),
   `shipment_id` resolve từ target.
2. Mỗi `affectedBoxIds[i]` → 1 `trouble_report_items` (lưu `shipment_cargo_box_id` +
   snapshot `tracking_no_snapshot`).
3. Target chuyển `TROUBLE`:
   - `DELIVERY` → `deliveryStatus = TROUBLE` (badge đỏ ở [delivery-list](./delivery-list.md) tab ES配送便 / COOL便).
   - `WAREHOUSE_RECEIPT` → `receiptStatus = TROUBLE`.
4. Target **bị khóa**: các thao tác giao/nhận của target đó disabled cho tới khi admin xử lý
   ("送信後、対象の荷物は操作できなくなります").
5. 1 target chỉ có **1 report đang mở** — gửi lại khi đang `PENDING`/`IN_PROGRESS` → `409` (xem [Errors](#errors)).

### `description` (理由 + 備考)

- Mockup có **2 ô text**: ô 理由 viền đỏ (`F.11`, hiện khi reason cần lý do) và 備考 (`F.14`).
- Hợp nhất khi gửi: nếu cả hai có giá trị → `description = "{理由}\n\n{備考}"`; nếu chỉ một → ô đó.
- Khi option `requiresDescription=true` mà `description` rỗng → `400` (xem [Errors](#errors)).

### Upload ảnh

Giống pattern COOL便 (xem [es-delivery.md · Upload ảnh](./es-delivery.md#upload-ảnh)):
endpoint này **không** nhận file binary — FE đẩy ảnh lên S3 trước rồi gửi mảng URL.

```
1. POST /files/presigned-upload-urls   → { key, uploadUrl, fileUrl } cho mỗi ảnh
2. Client PUT binary ảnh → uploadUrl (S3)
3. POST /driver/trouble-reports  { ..., photoUrls: [fileUrl, ...] }
```

> **TBD** giống es-delivery: endpoint `/files/*` hiện gắn `AdminGuard` — cần mở cho Driver
> Cognito pool. Tối đa `photoMax` (=5) ảnh.

### Modal 電話確認 (`DA_RPTD_002-03-1`)

- Hiển thị khi sự cố cần liên hệ gấp (thường `type=DELAY`: `TRAFFIC`/`NO_CONTACT`) — driver
  nên gọi ES trước. Số điện thoại = `supportPhoneNumber` (**hằng số FE**, 050-5784-2777).
- Checkbox 連絡済み (`C.6`) là xác nhận đã gọi; map `esKitchenContacted` — **TBD** cột DB.

---

## Field mapping (tổng hợp badge → API)

| Badge | Endpoint | Field / Hành động |
|-------|----------|-------------------|
| `L.1`–`L.10` | `GET /driver/trouble-reports/targets` | chọn target (`targetType`,`id`) |
| `F.1`–`F.9` | detail endpoint (`GET /driver/deliveries/{id}` · `GET /driver/receipts/{id}`) | dựng thẻ + box list (read) |
| `F.10` | enum `TroubleReason` (FE) | render radio (lọc theo `type`) |
| `F.8`,`F.10`–`F.14`,`F.16` | (input) → `POST /driver/trouble-reports` | gom body |
| `C.3` | `POST /driver/trouble-reports` | gửi |
| `C.7` | hằng số FE `supportPhoneNumber` | `tel:` |

---

## Tham chiếu

- Screen specs: [`DA_RPTD_001_01`](../../../design/baocaovande/DA_RPTD_001_01_list.html) ·
  [`DA_RPTD_001_02`](../../../design/baocaovande/DA_RPTD_001_02_selected.html) ·
  [`DA_RPTD_002_01`](../../../design/baocaovande/DA_RPTD_002_01_form.html) ·
  [`DA_RPTD_002_01_1`](../../../design/baocaovande/DA_RPTD_002_01_1_form_variant.html) ·
  [`DA_RPTD_002_02`](../../../design/baocaovande/DA_RPTD_002_02_filled.html) ·
  [`DA_RPTD_002_03`](../../../design/baocaovande/DA_RPTD_002_03_confirm.html) ·
  [`DA_RPTD_002_03_1`](../../../design/baocaovande/DA_RPTD_002_03_1_call.html)
- Wiring guide (HTML đánh số): [`design/baocaovande/apis/index.html`](../../../design/baocaovande/apis/index.html)
- DB: `trouble_reports`, `trouble_report_items` ([database/db.dbml](../../../database/db.dbml))
- Liên quan: [delivery-list.md](./delivery-list.md) (item shape) · [es-delivery.md](./es-delivery.md) (upload ảnh)
