# 配送関連 — DB適合性レビュー & 変更提案 (Deliverer / Shipment)

> Tài liệu **DB / quyết định nghiệp vụ** (KHÔNG chứa đặc tả API — xem `API設計_配送関連.md` + `API仕様詳細_配送関連.md`).
> Giai đoạn THIẾT KẾ. Mục tiêu: schema `database/db.dbml` đã đủ dựng UI chưa? chỗ nào cần đổi/chốt?
> Phạm vi UI: `design/deliverer/OW_*` (Portal Deliverer) + `design/deliverer/admin/MD*,MP*` (Admin).

## Quyết định kiến trúc đã chốt
1. Phạm vi: **Admin + Portal Deliverer**.
2. **`deliverers` (login) và `deliverer_masters` (nghiệp vụ) là MỘT bảng** → bỏ `deliverer_masters`, gộp field master vào `deliverers`; mọi `deliverer_id` trỏ `deliverers.id`.
3. Notification targeting: **polymorphic** (`recipient_type` + `recipient_id`).
4. Quản lý 配送スタッフ: **cả Admin lẫn Deliverer portal**.

---

# 1. KẾT LUẬN DB ADEQUACY (theo domain)

| Domain (màn) | Bảng chính | Đủ? | Ghi chú |
|---|---|---|---|
| 配送スタッフ (OW_STAF, MD01/02) | `drivers` (+`deliverers`) | ✅ Đủ | Sau khi gộp deliverers + có nhóm field doc3. Trừ tab 変更履歴 (xem G9) |
| 委託配送先 (chủ portal) | `deliverers` (merged) | ✅ Đủ | Sau quyết định #2 |
| 中継先 (DLVR_002, MP02 配送元) | `relay_masters` | ✅ Đủ cấu trúc | Có name/kana/địa chỉ/tel/担当者/営業所コード |
| 集金額 (OW_CLCT) | `collection_reports` | ✅ Đủ | collected/parking/expected/diff/receipt/photos; join shipment_company→shipment để scope + lấy 発送日/納品日/納品先 |
| 配送状況 list/detail (OW_DLVR, MP01) | `shipments` (+companies, cargo_boxes, status_histories) | ⚠️ Gần đủ | Thiếu **納品予定日** (G1) và **時間帯** (G2) |
| お知らせ (OW_ANNO) | `notifications`, `user_notifications` | ⚠️ Chưa đủ | Targeting (G4) + phân loại 重要/お知らせ (G3) + đa link (G5) |
| 出荷配送 detail (MP02) | `shipments` + `companies` + `company_orders` | ⚠️ Cần chốt nguồn | 配送元 cấu trúc (G6), 納品先 担当者/営業所コード (G7), オーダーNo (G8) |

---

# 2. ĐIỂM DB CHƯA PHÙ HỢP — CẦN ĐỔI / CHỐT

## Thay đổi đã chốt (từ quyết định)
- **D1. Gộp `deliverers`**: thêm vào `deliverers` các cột master: `deliverer_name_kana`, `postal_code`, `prefecture`, `city`, `street`, `building`, `tel`, `fax`, `contact_name`, `notify_emails jsonb`, `remarks`. Bỏ bảng `deliverer_masters`. Sửa FK `shipments.deliverer_id`, `drivers.deliverer_id` → `deliverers.id`.
- **D2. Notification polymorphic**: `user_notifications` → `recipient_type` enum (USER/DELIVERER/DRIVER/COMPANY_ADMIN/SUPPLIER) + `recipient_id`. Index `(recipient_type, recipient_id, is_read, created_at)`.

## Gap

| # | Gap | Màn liên quan | Đề xuất / Trạng thái |
|---|---|---|---|
| **G1** ✔CHỐT | `shipments` thiếu **納品予定日** | MP01, DLVR_001, DLVR_002 | **Thêm `scheduled_delivery_date date`**. Filter 配送日 map vào cột này |
| **G2** ✔CHỐT (type) | `shipments` thiếu **時間帯** | MP02 配送情報 | Thêm `delivery_time_slot` **enum `ShipmentTimeSlot`** (value-list chờ BA) |
| **G3** ✔CHỐT | `notifications` không phân biệt **重要 vs お知らせ** | OW_ANNO tabs | **Thêm `category` enum (IMPORTANT/INFO)** |
| **G4** ✔CHỐT | Không target được deliverer/driver | OW_ANNO | Xử lý ở **D2** |
| **G5** ✔CHỐT | `body jsonb` chỉ 1 link; UI 2 link | OW_ANNO_002 | `body.links: [{label,url,previewUrl}]` (jsonb, không đổi cột) |
| **G6** ✔CHỐT | **配送元** cần địa chỉ có cấu trúc | MP02 配送元 | Dùng master có cấu trúc: FK `relay_masters`(中継)/`supplier_masters`(NCC). Không dùng `warehouse_address_snapshot` text để render field rời |
| **G7** ❓ MỞ | **納品先 担当者名 / 営業所コード**: `companies` chỉ có `department` | MP02/DLVR_002 納品先 | 担当者 ← `company_admins.name` (MAIN) hay thêm `companies.contact_name`; 営業所コード chỉ relay có → xác nhận có cần cho company |
| **G8** ✔CHỐT | **オーダーNo** hiển thị nhưng `company_orders` không có số | MP02 オーダー情報 | **Thêm `company_orders.order_no varchar(20)`** unique (sinh seq) |
| **G9** ✔CHỐT | Không có **lịch sử thay đổi driver** | MD02 tab 変更履歴 | **Thêm bảng `driver_history_logs`** (pattern `*_history_logs`) |
| **G10** 🔴 MỞ | Không có **lịch sử thay đổi 委託配送先** | AW_CONS_010 tab 変更履歴 | Cần thêm bảng `deliverer_history_logs` (pattern `*_history_logs`) — **chưa thiết kế** |
| **G11** 🔴 MỞ | Không có nơi lưu **ES配送費** (phí theo vùng × plan) | AW_CONS_009 tab ES配送費 | **Thiếu hoàn toàn** bảng fee theo vùng/plan + công thức — xem `API設計_配送関連.md › D.1`. Cần BA chốt cấu trúc plan trước khi thiết kế |

> Các domain còn lại (集金額, 中継先, cargo box/送り状No, completion photos, status) — **schema đủ, không cần đổi.**
> ⚠️ Cụm **委託配送先 master** (CRUD + ES配送費 + 変更履歴) có mockup nhưng **chưa được thiết kế DB/API** — gom ở G10/G11 + `API設計_配送関連.md › D`.

---

# 3. QUYẾT ĐỊNH NGHIỆP VỤ ĐÃ CHỐT (log)
- **shipment_no** (D000033215): sinh seq nội bộ khi tạo (`shipment_no_seq`, dạng `D\d+`).
- **Đăng nhập Deliverer/Driver = CODE** (driverCode/delivererCode — hệ thống đã có). Trong form: `ユーザID`=code (login, hệ thống sinh, read-only), `メールアドレス`=email liên hệ (≠ login).
- **配送日 filter** → `deliveryDateFrom/To` map `shipments.scheduled_delivery_date` (= 納品予定日, riêng với 出荷予定日).
- **時間帯** = ENUM `ShipmentTimeSlot` (`shipments.delivery_time_slot`).
- **レポート 集金 (CLCT_002)** = Excel `.xlsx` (lib exceljs). **CSV export** = UTF-8 + BOM (Excel JP). Tổng hợp tháng theo **JST**. API trả ngày **ISO**.
- **お知らせ**: `title` lưu thuần (FE ghép 【yyyy/MM/dd】 từ `createdAt`); BE trả `content` đầy đủ (FE cắt preview); FCM deeplink qua `data.id` + `route:'notification'` (đã có sẵn trong `notification.service.ts`).
- **trackingNos[]** = array (1 shipment N cargo box); shipment chưa có report → BE trả `report: null`; `completionImageUrls` = array 0–N.
- **Xoá driver/deliverer**: phải `status=INACTIVE` trước (code `admin-driver.service.ts:268` chặn xoá khi ACTIVE) → FE disable nút 削除 khi đang 有効. Map nhãn 有効=ACTIVE / 無効=INACTIVE.
- **nameKana** = required (khớp mock `*`).
- **配送元** = FK relay/supplier master có cấu trúc (G6). **companyNo** (`CU…` = companies.company_code) KHÁC **orderNo** (`company_orders.order_no`).

# 4. CÒN MỞ — CẦN BA CHỐT (không chặn schema)
1. **G7** — 納品先 担当者名/営業所コード lấy từ đâu (company_admins MAIN vs thêm cột; office_code chỉ relay có).
2. **ShipmentTimeSlot** — danh sách value enum chính xác (午前/午後/夜間/指定なし… và "予約中" có là 1 value?).
3. Sau khi gộp `deliverers` — giữ prefix mã `DV` hay đổi `DE`.
4. **G11 — ES配送費** (AW_CONS_009): cấu trúc plan (50 / 100〜600), công thức `料金`/`地域加算`/`お客様向け請求料金`, quy tắc `類似住所有無`, nguồn master danh mục vùng (都道府県/市郡/区町村). Chưa đủ thông tin để thiết kế DB/API.
5. **G10 — 委託配送先 変更履歴** (AW_CONS_010): xác nhận pattern log giống `driver_history_logs` (content/changed_by/created_at) trước khi thêm bảng `deliverer_history_logs`.
6. **委託配送先 CRUD API** (`/admin/deliverers`): chưa thiết kế endpoint list/detail/create/edit/account-issue — xem `API設計_配送関連.md › D`.

---

# 5. DANH SÁCH THAY ĐỔI DB CHỐT (tổng hợp — checklist migration)
1. **Gộp `deliverers`** + bỏ `deliverer_masters` (D1); FK `shipments.deliverer_id`, `drivers.deliverer_id` → `deliverers.id`.
2. **`user_notifications` → polymorphic** (`recipient_type`+`recipient_id`) (D2).
3. **`notifications`** + `category` enum (IMPORTANT/INFO) (G3); `body.links[]` jsonb (G5).
4. **`shipments`** + `scheduled_delivery_date` (G1); + `delivery_time_slot` **enum `ShipmentTimeSlot`** (G2).
5. **`company_orders`** + `order_no varchar(20)` unique (G8).
6. **`shipments` 配送元** dùng FK `relay_masters`/`supplier_masters` có cấu trúc (G6).
7. **+ Bảng mới `driver_history_logs`** (G9).
8. **+ Seq `shipment_no_seq`** (`D\d+`) cho shipment_no.
9. `drivers` mang đủ nhóm field doc3 (deliverer_id, name_kana, phone, type, approval_status, delivery_area, delivery_location, license_image_url).

---

# 6. MIGRATION SQL (DDL — PostgreSQL)

> SQL tham chiếu cho **9 thay đổi đã chốt** ở §5, dùng để soạn TypeORM migration (`es-kitchen-api`). **Dev không tự chạy** — đề xuất với Tech Lead trước (theo POLICIES.md). Chỉ viết phần **đã chốt**; phần "Còn mở" (§4) **không** đưa vào migration cho tới khi BA chốt.
> Bọc toàn bộ trong 1 transaction; chạy trên DB DEV trước (xem `.claude/workflows/db-connect-dev.md`).

## 6.1 Enum mới

```sql
-- G2: 時間帯 (value-list MORNING/AFTERNOON/EVENING/ANYTIME — ⚠️ chờ BA chốt cuối, xem §4.2)
CREATE TYPE shipment_time_slot AS ENUM ('MORNING', 'AFTERNOON', 'EVENING', 'ANYTIME');

-- G3: phân loại お知らせ
CREATE TYPE notification_category AS ENUM ('IMPORTANT', 'INFO');

-- D2: recipient polymorphic
CREATE TYPE notification_recipient_type AS ENUM ('USER', 'DELIVERER', 'DRIVER', 'COMPANY_ADMIN', 'SUPPLIER');
-- (driver_type / driver_approval_status / shipment_status / delivery_mode … theo db.dbml §ENUMS — tạo nếu chưa có)
```

## 6.2 D1 — Gộp `deliverers` (bỏ `deliverer_masters`)

```sql
ALTER TABLE deliverers
  ADD COLUMN deliverer_name_kana varchar(255),
  ADD COLUMN postal_code         varchar(20),
  ADD COLUMN prefecture          varchar(100),
  ADD COLUMN city                varchar(255),
  ADD COLUMN street              varchar(255),
  ADD COLUMN building            varchar(255),
  ADD COLUMN tel                 varchar(50),
  ADD COLUMN fax                 varchar(50),
  ADD COLUMN contact_name        varchar(255),
  ADD COLUMN notify_emails       jsonb,
  ADD COLUMN remarks             text;

-- Data migration: copy field master từ deliverer_masters → deliverers (theo FK đang dùng), sau đó:
--   UPDATE shipments s SET deliverer_id = dm.deliverer_id FROM deliverer_masters dm WHERE s.deliverer_id = dm.id; (nếu trỏ master)
--   UPDATE drivers   d SET deliverer_id = dm.deliverer_id FROM deliverer_masters dm WHERE d.deliverer_id = dm.id;
-- FK trỏ về deliverers.id:
ALTER TABLE shipments DROP CONSTRAINT IF EXISTS fk_shipments_deliverer;
ALTER TABLE shipments ADD  CONSTRAINT fk_shipments_deliverer FOREIGN KEY (deliverer_id) REFERENCES deliverers(id);
ALTER TABLE drivers   DROP CONSTRAINT IF EXISTS fk_drivers_deliverer;
ALTER TABLE drivers   ADD  CONSTRAINT fk_drivers_deliverer   FOREIGN KEY (deliverer_id) REFERENCES deliverers(id);

DROP TABLE deliverer_masters;  -- chỉ sau khi đã migrate xong data + FK
```

## 6.3 D2 + G4 — `user_notifications` polymorphic

```sql
ALTER TABLE user_notifications
  ADD COLUMN recipient_type notification_recipient_type,
  ADD COLUMN recipient_id   bigint;

-- backfill: recipient_type='USER', recipient_id=user_id cho dữ liệu cũ
UPDATE user_notifications SET recipient_type = 'USER', recipient_id = user_id WHERE recipient_type IS NULL;

ALTER TABLE user_notifications
  ALTER COLUMN recipient_type SET NOT NULL,
  ALTER COLUMN recipient_id   SET NOT NULL;

CREATE INDEX idx_user_notif_recipient
  ON user_notifications (recipient_type, recipient_id, is_read, created_at);
```

## 6.4 G3 + G5 — `notifications`

```sql
ALTER TABLE notifications
  ADD COLUMN category notification_category NOT NULL DEFAULT 'INFO';
-- G5: đa link lưu trong body jsonb dạng body.links: [{label,url,previewUrl}] → KHÔNG đổi cột.
```

## 6.5 G1 + G2 — `shipments`

```sql
ALTER TABLE shipments
  ADD COLUMN scheduled_delivery_date date,                       -- G1: 納品予定日 (filter 配送日 map cột này)
  ADD COLUMN delivery_time_slot      shipment_time_slot;         -- G2: 時間帯

CREATE INDEX idx_shipments_deliverer_send  ON shipments (deliverer_id, scheduled_send_date);
CREATE INDEX idx_shipments_company         ON shipments (company_id);
CREATE INDEX idx_shipments_status          ON shipments (status);
CREATE INDEX idx_shipments_delivery_date   ON shipments (scheduled_delivery_date);
```

## 6.6 G8 — `company_orders.order_no`

```sql
ALTER TABLE company_orders ADD COLUMN order_no varchar(20);
-- backfill seq cho dữ liệu cũ nếu cần, rồi:
CREATE UNIQUE INDEX idx_company_orders_order_no ON company_orders (order_no) WHERE deleted_at IS NULL;
```

## 6.7 G9 — bảng mới `driver_history_logs`

```sql
CREATE TABLE driver_history_logs (
  id          bigserial PRIMARY KEY,
  driver_id   bigint      NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
  field       varchar(100) NOT NULL,
  old_value   text,
  new_value   text,
  changed_by  varchar(255) NOT NULL,
  changed_at  timestamptz  NOT NULL DEFAULT now()
);
CREATE INDEX idx_driver_history_driver_id ON driver_history_logs (driver_id, changed_at);
```

## 6.8 Seq `shipment_no_seq` (D\d+)

```sql
CREATE SEQUENCE shipment_no_seq START 1;
-- shipmentNo = 'D' || lpad(nextval('shipment_no_seq')::text, 9, '0'); sinh ở service khi tạo (source=MANUAL).
```

## 6.9 G6 — 配送元 FK có cấu trúc
`shipments` trỏ `relay_masters` (中継) / `supplier_masters` (NCC) qua FK sẵn có để render địa chỉ có cấu trúc — **không** thêm cột `warehouse_address_snapshot` text. Xác nhận FK đã tồn tại trước khi bỏ snapshot.

> **Rollback:** mỗi `CREATE` có `DROP` tương ứng; `down()` migration đảo thứ tự (drop index → drop column → drop type → drop table). **Không** drop `deliverer_masters` ở `down()` nếu data đã mất gốc — backup trước khi chạy `up()`.
