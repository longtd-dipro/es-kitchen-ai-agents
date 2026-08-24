---
doc: dashboard
module: driver
base_path: /driver
auth: Bearer (Driver)
screens: [DA_HOME_001, DA_HOME_001_Schedule, DA_HOME_001_Empty]
endpoints:
  - GET /driver/home
  - GET /driver/schedules
status: design
updated: 2026-06-16
---

# Driver Dashboard API

API cho 3 màn hình dashboard của driver: `DA_HOME_001`, `DA_HOME_001_Schedule`, `DA_HOME_001_Empty`.

> Quy ước chung (auth, headers, error format) xem [README.md](./README.md#-conventions-áp-dụng-cho-mọi-endpoint).
> Auth API **không** nằm trong file này.

---

## GET /driver/home

Phục vụ màn hình `DA_HOME_001`. Trả về **KPI hôm nay** + các **block giao hàng hôm nay** (gom theo kho).

### Request

```http
GET /driver/home
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

Không có query params.

### Response 200

```json
{
  "driverName": "Mochiduki",
  "kpi": {
    "todayTotal": 10,
    "completed": 2,
    "remaining": 8,
    "progressPercent": 20
  },
  "blocks": [
    {
      "warehouseName": "オージーフーズ倉庫",
      "warehouseStatus": "UNRECEIVED",
      "warehouseAddress": "東京都渋谷区千駄ヶ谷5-32-7...",
      "companyCount": 2,
      "totalBoxCount": 4,
      "totalItemCount": 500,
      "totalDeliveredCount": 500,
      "companies": [
        {
          "companyId": 101,
          "companyName": "東和精密機械工業株式会社",
          "deliveryStatus": "UNDELIVERED",
          "deliveryAddress": "大阪府大阪市北区太融寺町2-18...",
          "boxCount": 2,
          "orderItemCount": 10,
          "deliveredCount": 20
        },
        {
          "companyId": 102,
          "companyName": "株式会社三葉重工業製作所",
          "deliveryStatus": "UNDELIVERED",
          "deliveryAddress": "大阪府大阪市北区太融寺町2-18...",
          "boxCount": 2,
          "orderItemCount": 10,
          "deliveredCount": 20
        }
      ]
    },
    {
      "warehouseName": "オージーフーズ倉庫",
      "warehouseStatus": "UNRECEIVED",
      "warehouseAddress": "東京都渋谷区千駄ヶ谷5-32-7...",
      "companyCount": 10,
      "totalBoxCount": 50,
      "totalItemCount": 500,
      "totalDeliveredCount": 500,
      "companies": []
    }
  ]
}
```

### Field mapping → màn hình

| Field | Vị trí trên `DA_HOME_001` |
|-------|---------------------------|
| `driverName` | Lời chào / header |
| `kpi.todayTotal` | Tổng đơn hôm nay |
| `kpi.completed` / `kpi.remaining` | Đã xong / còn lại |
| `kpi.progressPercent` | Thanh tiến độ (%) |
| `blocks[]` | Mỗi block = 1 thẻ kho |
| `block.warehouseStatus` | Badge trạng thái kho (`UNRECEIVED`/`RECEIVED`) |
| `block.companyCount/totalBoxCount/totalItemCount` | Dòng tóm tắt 「X 社 / X 箱 / X 品」 |
| `block.companies[]` | Danh sách công ty trong block (có thể rỗng → chỉ hiện tóm tắt) |

---

## GET /driver/schedules

Phục vụ `DA_HOME_001_Schedule` và `DA_HOME_001_Empty`. Trả về lịch giao **gom theo ngày**.

### Request

```http
GET /driver/schedules?days=3
Authorization: Bearer {accessToken}
Accept-Language: ja | vi
```

### Query Parameters

| Param | Type | Required | Default | Mô tả |
|-------|------|----------|---------|-------|
| `days` | number | ❌ | `3` | Số ngày cần trả về kể từ hôm nay |

### Response 200

```json
{
  "schedules": [
    {
      "date": "2026-06-01",
      "label": "本日",
      "items": [],
      "emptyMessage": "配送予定データはありません。"
    },
    {
      "date": "2026-06-02",
      "label": "明日",
      "items": [
        {
          "warehouseName": "オージーフーズ倉庫",
          "warehouseStatus": "UNRECEIVED",
          "warehouseAddress": "東京都渋谷区千駄ヶ谷5-32-7...",
          "companyCount": 10,
          "totalBoxCount": 50,
          "totalItemCount": 500,
          "totalDeliveredCount": 500,
          "companies": []
        }
      ],
      "emptyMessage": null
    },
    {
      "date": "2026-06-03",
      "label": "明後日",
      "items": [],
      "emptyMessage": "配送予定データはありません。"
    }
  ]
}
```

### Empty state (`DA_HOME_001_Empty`)

- Khi `items` của một ngày = `[]` → FE hiển thị `emptyMessage`.
- `emptyMessage` chỉ khác `null` khi ngày đó rỗng.
- Message mặc định:
  - **JP:** 「配送予定データはありません。」
  - **VN:** 「Không có dữ liệu giao hàng dự kiến.」

---

## Response DTOs

```typescript
// ── GET /driver/home ──────────────────────────────
export class DriverHomeResponse {
  driverName: string;
  kpi: DriverHomeKpiResponse;
  blocks: DriverScheduleResponse[];
}

export class DriverHomeKpiResponse {
  todayTotal: number;
  completed: number;
  remaining: number;
  progressPercent: number;
}

// ── GET /driver/schedules ─────────────────────────
export class DriverScheduleListResponse {
  schedules: DriverScheduleDateResponse[];
}

export class DriverScheduleDateResponse {
  date: string;          // yyyy-MM-dd
  label: string;         // 本日 / 明日 / 明後日 ...
  items: DriverScheduleResponse[];
  emptyMessage: string | null;
}

// ── Dùng chung (block trong home & schedules) ─────
export class DriverScheduleResponse {
  warehouseName: string;
  warehouseStatus: 'UNRECEIVED' | 'RECEIVED';
  warehouseAddress: string;
  companyCount: number;
  totalBoxCount: number;
  totalItemCount: number;
  totalDeliveredCount: number;
  companies: DriverScheduleCompanyResponse[];
}

export class DriverScheduleCompanyResponse {
  companyId: number;
  companyName: string;
  deliveryStatus: 'UNDELIVERED' | 'DELIVERED' | 'TROUBLE';
  deliveryAddress: string;
  boxCount: number;
  orderItemCount: number;
  deliveredCount: number;
}
```

---

## Enums

### `warehouseStatus`

| Value | 日本語 | Ý nghĩa |
|-------|--------|---------|
| `UNRECEIVED` | 未受取 | Chưa nhận hàng từ kho |
| `RECEIVED` | 受取済 | Đã nhận |

### `deliveryStatus` (company)

Dùng lại shared enum `DeliveryStatus` — xem [README](./README.md#trạng-thái-nhận--giao).

| Value | 日本語 | Ý nghĩa |
|-------|--------|---------|
| `UNDELIVERED` | 未配送 | Chưa giao |
| `DELIVERED` | 配送完了 | Đã giao xong |
| `TROUBLE` | トラブル | Có sự cố |

> Không có `DELIVERING` (配送中): cấp công ty không có cột status trong DB (`shipment_companies`);
> `deliveryStatus` là giá trị suy ra (DELIVERED ⇐ `delivery_completion_reports.submitted_at`, TROUBLE ⇐ trouble report).
> Trạng thái "đang giao" chỉ tồn tại cấp chuyến (`shipments.status = IN_TRANSIT`) và chưa quy được về 1 công ty.
