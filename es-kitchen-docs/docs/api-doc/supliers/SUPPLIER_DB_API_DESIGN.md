# 仕入先 (Supplier) — DB Change Report & API Design

> Tài liệu thiết kế cho 2 phân hệ **Supplier (仕入先 self-service)** và **Admin quản lý Supplier (仕入先マスタ)**.
> Nguồn: mockup trong `design/supliers/**` + schema `database/db.dbml`.
> Convention envelope & history log đối chiếu trực tiếp từ codebase (`src/commons/...`).

---

## 0. Trạng thái quyết định (Decision Log)

| Mã | Vấn đề | Quyết định (đã chốt) |
|----|--------|----------------------|
| **A1** | Địa chỉ nhiều dòng (住所) | ✅ Tạo bảng con `supplier_master_addresses`. 区分 (`address_type`) **multi-value** (1 địa chỉ gắn nhiều loại). |
| **A2** | Người phụ trách nhiều dòng (担当者) | ✅ Tạo bảng con `supplier_master_contacts`; **bỏ** `contact_name`, `email1..email5` khỏi `supplier_masters` (migrate sang bảng con). |
| **A3** | 作れる商品 (sản phẩm cung cấp) | ✅ Quan hệ n-n supplier↔product. Sửa `product_suppliers`: thêm FK `supplier_master_id` thay cho `supplier_name` string. |
| **A4** | 仕入れ先区分 (phân loại NCC) | ✅ Thêm **cột enum** trên `supplier_masters`. Chỉ tạo đúng 1 enum theo giá trị có trong HTML mock (⚠️ mock hiện chỉ có placeholder — xem **Open Q. A4-1**). |
| **A5** | Status 本登録/未登録 | ✅ Thêm **cột enum mới** `registration_status` (tách biệt với `status` = ACTIVE/INACTIVE). |
| **B1** | 変更履歴 (Change history) | ✅ Thiết kế theo đúng pattern hiện có (`company_history_logs`): bảng `supplier_master_history_logs(content, changed_by, created_at)`. |
| **B2** | アカウント発行 (Phát hành tài khoản) | ✅ Tạo/sửa **không** cấp phát (mặc định `UNREGISTERED`); admin **chọn 1+ supplier ở list → popup xác nhận → phát hành** (tạo login + gửi mail). Hỗ trợ hàng loạt. **Không qua CSV** (xem [2.3](#23-admin--アカウント発行-account-issuance--b2)). |
| **C1, C2, D1** | 注文管理 / 注文詳細編集 / お知らせ (3 màn Supplier) | ✅ **Đã thiết kế API** (PART 3) — `/supplier/*`. C2 line-status (DB design, chưa migration). menuType = `menus.menu_type` (đã rõ). Còn TBD: 合計金額 + entity backing 注文管理, 論理必要数/在庫数 (xem PART 3 › Còn mở). |
| **C3** | 出荷処理 (Shipment) | ❌ **Ngoài scope** — BA chốt không làm (mock sai/khó hiểu). |
| **D2** | CSV master 取込/出力 | ⏳ Cột CSV chờ BA — xem **PART 3 › D2**. |

---

# PART 1 — BƯỚC 2: DB CHANGE REPORT

## 1.1 Enums mới

```dbml
// 仕入れ先区分 (A4) — ⚠️ giá trị placeholder theo mock, chờ BA confirm nhãn thực
Enum supplier_classification_enum {
  "CLASS_1"   // 区分1
  "CLASS_2"   // 区分2
}

// 本登録 / 未登録 (A5) — tách khỏi status(ACTIVE/INACTIVE)
Enum supplier_registration_status_enum {
  "REGISTERED"     // 本登録 — đã phát hành tài khoản & hoàn tất đăng ký
  "UNREGISTERED"   // 未登録 — chưa phát hành/hoàn tất
}

// 住所区分 (A1) — multi-value (lưu mảng)
Enum supplier_address_type_enum {
  "HEAD_OFFICE"   // 本社
  "FACTORY"       // 製造場所
  "OTHER"         // その他
}

// 担当者区分 (A2) — single per dòng
Enum supplier_contact_type_enum {
  "REPRESENTATIVE" // 代表
  "SALES"          // 営業
  "OTHER"          // その他
}
```

## 1.2 `supplier_masters` — ALTER

| Hành động | Cột | Kiểu / Ràng buộc | Lý do (UI) |
|-----------|-----|------------------|------------|
| **DROP** | `postal_code, prefecture, city, street, building, tel, fax` | — | Chuyển sang `supplier_master_addresses` (A1) — form 住所 nhiều dòng. |
| **DROP** | `contact_name, email1, email2, email3, email4, email5` | — | Chuyển sang `supplier_master_contacts` (A2) — form 担当者 nhiều dòng. |
| **ADD** | `classification` | `supplier_classification_enum` [not null] | Field bắt buộc 仕入れ先区分 + bộ lọc (màn master & register). |
| **ADD** | `registration_status` | `supplier_registration_status_enum` [not null, default `'UNREGISTERED'`] | Badge 本登録/未登録 + bộ lọc ステータス (A5). |
| **GIỮ** | `supplier_name, supplier_name_kana, remarks, login_user_id, status` | — | カナ, 備考, link login, account lifecycle. |

> `supplier_name_kana` ↔ field **カナ**; `remarks` ↔ **備考**; `supplier_code` ↔ **仕入先ID** (SU…).
> **Migration**: copy 1 dòng địa chỉ phẳng cũ → 1 row `supplier_master_addresses` (type=`['HEAD_OFFICE']`); copy `contact_name`+`email1` → 1 row `supplier_master_contacts` (type=`REPRESENTATIVE`).

```dbml
Table supplier_masters {
  id bigint [pk, increment]
  supplier_code varchar(20) [not null, note: '仕入先ID "SU\\d+"']
  supplier_name varchar(255) [note: '仕入先名']
  supplier_name_kana varchar(255) [note: 'カナ']
  classification supplier_classification_enum [not null, note: '仕入れ先区分 (A4)']
  registration_status supplier_registration_status_enum [not null, default: 'UNREGISTERED', note: '本登録/未登録 (A5)']
  remarks text [note: '備考']
  login_user_id varchar(255) [note: 'link 1-1 tới suppliers(login)']
  status varchar(20) [not null, default: 'ACTIVE', note: 'lifecycle ACTIVE/INACTIVE']
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]
  deleted_at timestamptz
  Indexes {
    supplier_code [unique, name: 'idx_supplier_masters_code_active', note: 'WHERE deleted_at IS NULL']
    supplier_name [name: 'idx_supplier_masters_name']
    registration_status [name: 'idx_supplier_masters_reg_status']
    classification [name: 'idx_supplier_masters_classification']
  }
}
```

## 1.3 `supplier_master_addresses` — NEW (A1)

| Cột | Kiểu / Ràng buộc | UI |
|-----|------------------|-----|
| `id` | bigint pk increment | — |
| `supplier_master_id` | bigint [not null, FK→supplier_masters, ON DELETE CASCADE] | — |
| `address_types` | `supplier_address_type_enum[]` [not null] | 区分 (multi-tag 本社/製造場所/その他) |
| `postal_code` | varchar(20) [not null] | 郵便番号 * |
| `prefecture` | varchar(100) [not null] | 都道府県 * |
| `city` | varchar(255) [not null] | 市区町村 * |
| `street` | varchar(255) [not null] | 町域・番地 * |
| `building` | varchar(255) | 建物・部屋番号 |
| `tel` | varchar(50) | 電話番号 |
| `fax` | varchar(50) | Fax番号 |
| `sort_order` | integer [not null, default 0] | thứ tự dòng |
| `created_at / updated_at` | timestamptz | — |

> `address_types` lưu dạng mảng enum (Postgres `enum[]`). Cột **本社住所** ở màn list = địa chỉ có `'HEAD_OFFICE'` trong `address_types`.

## 1.4 `supplier_master_contacts` — NEW (A2)

| Cột | Kiểu / Ràng buộc | UI |
|-----|------------------|-----|
| `id` | bigint pk increment | — |
| `supplier_master_id` | bigint [not null, FK→supplier_masters, ON DELETE CASCADE] | — |
| `contact_type` | `supplier_contact_type_enum` [not null] | 区分 (代表/営業/その他) |
| `name` | varchar(255) [not null] | 担当者名 * |
| `name_kana` | varchar(255) | フリガナ |
| `email` | varchar(255) [not null] | メールアドレス * |
| `tel` | varchar(50) | TEL |
| `sort_order` | integer [not null, default 0] | — |
| `created_at / updated_at` | timestamptz | — |

> Cột **担当者名 / 担当者の電話番号** ở màn list = contact có `contact_type='REPRESENTATIVE'` (hoặc dòng đầu).
> `email` của contact đại diện = email dùng để **phát hành tài khoản** (B2).

## 1.5 `supplier_master_history_logs` — NEW (B1)

> Sao y pattern `company_history_logs` (`src/entities/company-history-log.entity.ts`) + `HistoryLoggerHelper`.

| Cột | Kiểu / Ràng buộc | UI (変更履歴) |
|-----|------------------|---------------|
| `id` | bigint pk increment | — |
| `supplier_master_id` | bigint [not null, FK→supplier_masters, ON DELETE CASCADE] | — |
| `content` | text [not null] | 変更内容 (vd `仕入先名を「A → B」に変更`) |
| `changed_by` | varchar(255) [not null] | 変更者 (tên admin) |
| `created_at` | timestamptz [not null, default now()] | 変更日時 |

```dbml
Table supplier_master_history_logs {
  id bigint [pk, increment]
  supplier_master_id bigint [not null]
  content text [not null]
  changed_by varchar(255) [not null]
  created_at timestamptz [not null, default: `now()`]
  Indexes { supplier_master_id [name: 'idx_sup_master_history_master_id'] }
}
Ref: supplier_master_history_logs.supplier_master_id > supplier_masters.id [delete: cascade]
```

## 1.6 `product_suppliers` — ALTER (A3)

| Hành động | Cột | Kiểu / Ràng buộc | Lý do |
|-----------|-----|------------------|-------|
| **ADD** | `supplier_master_id` | bigint [FK→supplier_masters.id, ON DELETE CASCADE] | 作れる商品 = quan hệ n-n product↔supplier (FK thay cho string). |
| **DEPRECATE** | `supplier_name` | varchar [nullable] | Giữ tạm làm snapshot/khớp import; sẽ bỏ sau khi migrate xong. |
| **ADD index** | `(product_id, supplier_master_id)` | unique (WHERE not deleted) | Tránh trùng. |

```dbml
Ref: product_suppliers.supplier_master_id > supplier_masters.id [delete: cascade]
```

> **Migration**: với mỗi `product_suppliers`, match `supplier_name` → `supplier_masters.supplier_name` để set `supplier_master_id`.
> Dòng không match → log lại cho BA xử lý thủ công.

## 1.7 Tổng hợp Ref mới

```dbml
Ref: supplier_master_addresses.supplier_master_id > supplier_masters.id [delete: cascade]
Ref: supplier_master_contacts.supplier_master_id  > supplier_masters.id [delete: cascade]
Ref: supplier_master_history_logs.supplier_master_id > supplier_masters.id [delete: cascade]
Ref: product_suppliers.supplier_master_id > supplier_masters.id [delete: cascade]
```

## 1.8 MIGRATION SQL (DDL — PostgreSQL)

> SQL tham chiếu cho **PART 1 (đã chốt A1–A5, B1, A3)**, dùng để soạn TypeORM migration (`es-kitchen-api`). **Dev không tự chạy** — đề xuất Tech Lead trước (POLICIES.md). Bọc trong 1 transaction; chạy DB DEV trước.
> ⚠️ **PART 3 (注文管理/注文詳細編集 — `line_status`, `provisional_quantity`…) KHÔNG đưa vào migration** đợt này (design-only, chờ #B'/#C'). ⚠️ Enum `supplier_classification_enum` đang **placeholder** (A4-1) — value thực chờ BA, có thể phải `ALTER TYPE ... ADD VALUE` sau.

```sql
BEGIN;

-- 1.1 Enums mới
CREATE TYPE supplier_classification_enum       AS ENUM ('CLASS_1', 'CLASS_2');           -- ⚠️ placeholder (A4-1)
CREATE TYPE supplier_registration_status_enum  AS ENUM ('REGISTERED', 'UNREGISTERED');
CREATE TYPE supplier_address_type_enum         AS ENUM ('HEAD_OFFICE', 'FACTORY', 'OTHER');
CREATE TYPE supplier_contact_type_enum         AS ENUM ('REPRESENTATIVE', 'SALES', 'OTHER');

-- 1.2 supplier_masters — ALTER
ALTER TABLE supplier_masters
  ADD COLUMN classification        supplier_classification_enum,
  ADD COLUMN registration_status   supplier_registration_status_enum NOT NULL DEFAULT 'UNREGISTERED';
-- (classification để nullable cho backfill, rồi SET NOT NULL sau khi đã gán giá trị cho dữ liệu cũ)

-- 1.3 supplier_master_addresses — NEW (A1)
CREATE TABLE supplier_master_addresses (
  id                 bigserial PRIMARY KEY,
  supplier_master_id bigint NOT NULL REFERENCES supplier_masters(id) ON DELETE CASCADE,
  address_types      supplier_address_type_enum[] NOT NULL,
  postal_code        varchar(20)  NOT NULL,
  prefecture         varchar(100) NOT NULL,
  city               varchar(255) NOT NULL,
  street             varchar(255) NOT NULL,
  building           varchar(255),
  tel                varchar(50),
  fax                varchar(50),
  sort_order         integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sup_addr_master_id ON supplier_master_addresses (supplier_master_id);

-- 1.4 supplier_master_contacts — NEW (A2)
CREATE TABLE supplier_master_contacts (
  id                 bigserial PRIMARY KEY,
  supplier_master_id bigint NOT NULL REFERENCES supplier_masters(id) ON DELETE CASCADE,
  contact_type       supplier_contact_type_enum NOT NULL,
  name               varchar(255) NOT NULL,
  name_kana          varchar(255),
  email              varchar(255) NOT NULL,
  tel                varchar(50),
  sort_order         integer NOT NULL DEFAULT 0,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sup_contact_master_id ON supplier_master_contacts (supplier_master_id);

-- Migration data (A1/A2): copy địa chỉ phẳng + contact cũ sang bảng con
INSERT INTO supplier_master_addresses (supplier_master_id, address_types, postal_code, prefecture, city, street, building, tel, fax)
  SELECT id, ARRAY['HEAD_OFFICE']::supplier_address_type_enum[], postal_code, prefecture, city, street, building, tel, fax
  FROM supplier_masters WHERE postal_code IS NOT NULL;
INSERT INTO supplier_master_contacts (supplier_master_id, contact_type, name, email)
  SELECT id, 'REPRESENTATIVE', contact_name, email1
  FROM supplier_masters WHERE contact_name IS NOT NULL;

-- Bỏ cột phẳng cũ khỏi supplier_masters (sau khi đã migrate)
ALTER TABLE supplier_masters
  DROP COLUMN postal_code, DROP COLUMN prefecture, DROP COLUMN city, DROP COLUMN street,
  DROP COLUMN building, DROP COLUMN tel, DROP COLUMN fax,
  DROP COLUMN contact_name, DROP COLUMN email1, DROP COLUMN email2,
  DROP COLUMN email3, DROP COLUMN email4, DROP COLUMN email5;

-- Index supplier_masters (theo 1.2 dbml)
CREATE UNIQUE INDEX idx_supplier_masters_code_active ON supplier_masters (supplier_code) WHERE deleted_at IS NULL;
CREATE INDEX idx_supplier_masters_name           ON supplier_masters (supplier_name);
CREATE INDEX idx_supplier_masters_reg_status     ON supplier_masters (registration_status);
CREATE INDEX idx_supplier_masters_classification ON supplier_masters (classification);

-- 1.5 supplier_master_history_logs — NEW (B1, pattern company_history_logs)
CREATE TABLE supplier_master_history_logs (
  id                 bigserial PRIMARY KEY,
  supplier_master_id bigint NOT NULL REFERENCES supplier_masters(id) ON DELETE CASCADE,
  content            text NOT NULL,
  changed_by         varchar(255) NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_sup_master_history_master_id ON supplier_master_history_logs (supplier_master_id);

-- 1.6 product_suppliers — ALTER (A3)
ALTER TABLE product_suppliers
  ADD COLUMN supplier_master_id bigint REFERENCES supplier_masters(id) ON DELETE CASCADE;
ALTER TABLE product_suppliers ALTER COLUMN supplier_name DROP NOT NULL;  -- DEPRECATE: giữ tạm làm snapshot
-- Migration: match supplier_name → supplier_masters.supplier_name để set supplier_master_id; dòng không match → log cho BA.
UPDATE product_suppliers ps
  SET supplier_master_id = sm.id
  FROM supplier_masters sm
  WHERE ps.supplier_name = sm.supplier_name AND sm.deleted_at IS NULL;
CREATE UNIQUE INDEX idx_product_suppliers_uniq
  ON product_suppliers (product_id, supplier_master_id) WHERE deleted_at IS NULL;

COMMIT;
```

> **Rollback (`down()`):** đảo thứ tự — drop index → drop FK/column `product_suppliers` → drop bảng `*_history_logs`/`*_contacts`/`*_addresses` → restore cột phẳng `supplier_masters` (cần backup data trước `up()`) → drop 4 enum. **Backup `supplier_masters` trước khi DROP COLUMN.**

---

# PART 2 — BƯỚC 3: API DESIGN

## 2.1 Conventions chung

**Base path**: theo `RouterModule` (`src/app.module.ts`) — module Admin prefix `admin`, module Supplier prefix `supplier`. Không có global `/api` prefix.
- Admin quản lý 仕入先マスタ → **`/admin/supplier-masters`** (tách khỏi `/admin/accounts/suppliers` đang quản lý *login account*).
- Supplier self-service → **`/supplier/...`**.

**Auth**: JWT Bearer theo từng actor pool (Cognito). Admin endpoints yêu cầu admin JWT + RBAC permission guard; Supplier endpoints yêu cầu supplier JWT.

**Success envelope** (`TransformInterceptor`):
```json
{ "statusCode": "success", "message": "Request successful", "data": { } }
```

**Error envelope** (`AllExceptionsFilter`):
```json
{ "statusCode": "error", "message": "...", "title": "Bad Request", "errorCode": null, "data": null }
```

**Catalog mã lỗi dùng chung** (mỗi endpoint chỉ ghi case đặc thù; cấu trúc giống nhau):

| HTTP | statusCode | Ví dụ |
|------|-----------|-------|
| 400 | `validaton_error` | `{ "statusCode":"validaton_error","message":"仕入先名を入力してください。","title":"Bad Request","errorCode":"SUPPLIER_NAME_REQUIRED","data":null }` |
| 401 | `unauthorized` | `{ "statusCode":"unauthorized","message":"Unauthorized","title":"Unauthorized","errorCode":null,"data":null }` |
| 403 | `forbidden` | `{ "statusCode":"forbidden","message":"権限がありません。","title":"Forbidden","errorCode":null,"data":null }` |
| 404 | `not_found` | `{ "statusCode":"not_found","message":"仕入先が見つかりません。","title":"Not Found","errorCode":"SUPPLIER_NOT_FOUND","data":null }` |
| 409 | `conflict` | `{ "statusCode":"conflict","message":"仕入先IDが既に存在します。","title":"Conflict","errorCode":"SUPPLIER_CODE_DUPLICATED","data":null }` |
| 500 | `internal_error` | `{ "statusCode":"internal_error","message":"Internal server error","title":null,"errorCode":null,"data":null }` |

**Pagination chung** (theo mock: 表示件数 10/20/50/100, `100件中 1-10件`):
- Query: `page` (default 1), `limit` (default 10), `sort`, `order` (`ASC|DESC`).
- `data`: `{ "items": [...], "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 } }`.

---

## 2.2 ADMIN — 仕入先マスタ (Supplier Master)

### 2.2.1 `GET /admin/supplier-masters` — Danh sách + filter (màn 仕入先マスタ)

- **Description**: Danh sách NCC, hỗ trợ tìm kiếm/lọc/sắp xếp/phân trang.
- **Auth**: Admin JWT, permission `supplier_master.read`.
- **Query params**:

| Param | Kiểu | Bắt buộc | Mô tả (UI) |
|-------|------|----------|------------|
| `keyword` | string | ✗ | 仕入先ID hoặc 仕入先名 (LIKE) |
| `registrationStatus` | enum(`REGISTERED`/`UNREGISTERED`) | ✗ | bộ lọc ステータス (本登録/未登録) |
| `classification` | enum | ✗ | 仕入れ先区分 |
| `producibleProductId` | bigint | ✗ | 作れる商品 (lọc theo SP cung cấp) |
| `page,limit,sort,order` | — | ✗ | 並べ替え / 表示件数 |

- **Response 200** (`data`):
```json
{
  "items": [
    {
      "id": 1,
      "supplierCode": "SU00001",
      "supplierName": "佐川急便 川崎新羽営業所",
      "headOfficeAddress": "京都府 京都市下京区四条",
      "contactName": "加藤真由美",
      "contactTel": "000-0000-0000",
      "email": "sample@example.com",
      "registrationStatus": "REGISTERED",
      "classification": "CLASS_1"
    }
  ],
  "meta": { "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
}
```
> `headOfficeAddress` = ghép địa chỉ có type `HEAD_OFFICE`; `contactName/contactTel/email` = contact `REPRESENTATIVE`.
- **Errors**: 401, 403, 500.

### 2.2.2 `GET /admin/supplier-masters/:id` — Chi tiết (màn 基本情報)

- **Auth**: Admin JWT, `supplier_master.read`.
- **Response 200** (`data`):
```json
{
  "id": 1,
  "supplierCode": "SU00001",
  "supplierName": "サンプル物流株式会社",
  "supplierNameKana": "サンプルブツリュウ",
  "classification": "CLASS_1",
  "registrationStatus": "REGISTERED",
  "remarks": "00 0000 0000",
  "status": "ACTIVE",
  "loginUserId": "SP00001",
  "producibleProducts": [ { "id": 10, "name": "商品A" } ],
  "addresses": [
    {
      "id": 100, "addressTypes": ["HEAD_OFFICE","FACTORY"],
      "postalCode": "123-4567", "prefecture": "東京都", "city": "千代田区",
      "street": "千代田1丁目1番1号", "building": "○○マンション101号室",
      "tel": "000-0000-0000", "fax": "000-0000-0000", "sortOrder": 0
    }
  ],
  "contacts": [
    {
      "id": 200, "contactType": "REPRESENTATIVE", "name": "担当 太郎",
      "nameKana": "タントウ タロウ", "email": "sample3@gmail.com",
      "tel": "000-0000-0000", "sortOrder": 0
    }
  ]
}
```
- **Errors**: 401, 403, 404, 500.

### 2.2.3 `POST /admin/supplier-masters` — Đăng ký mới (màn 仕入先情報登録)

- **Auth**: Admin JWT, `supplier_master.create`.
- ⚠️ **Không cấp phát account, không gửi mail khi tạo**: record mới luôn `registration_status = 'UNREGISTERED'` (未登録). Việc tạo login + gửi mail chỉ xảy ra khi admin chủ động cấp phát ở [2.3](#23-admin--アカウント発行-account-issuance--b2).
- **Request body** + validate:

| Field | Kiểu | Validate |
|-------|------|----------|
| `supplierName` | string | **required**, max 255 |
| `supplierNameKana` | string | optional, max 255 |
| `classification` | enum | **required**, ∈ enum |
| `registrationStatus` | enum | **required**, ∈ enum |
| `remarks` | string | optional |
| `producibleProductIds` | bigint[] | **required**, min 1, mỗi id tồn tại |
| `addresses[]` | object[] | **required**, min 1 |
| `addresses[].addressTypes` | enum[] | **required**, min 1 phần tử |
| `addresses[].postalCode/prefecture/city/street` | string | **required** |
| `addresses[].building/tel/fax` | string | optional |
| `contacts[]` | object[] | **required**, min 1 |
| `contacts[].contactType` | enum | **required** |
| `contacts[].name` | string | **required** |
| `contacts[].email` | string | **required**, email format |
| `contacts[].nameKana/tel` | string | optional |

```json
{
  "supplierName": "サンプル物流株式会社",
  "supplierNameKana": "サンプルブツリュウ",
  "classification": "CLASS_1",
  "registrationStatus": "UNREGISTERED",
  "remarks": "備考テキスト",
  "producibleProductIds": [10, 11],
  "addresses": [
    { "addressTypes": ["HEAD_OFFICE"], "postalCode": "123-4567", "prefecture": "東京都",
      "city": "千代田区", "street": "千代田1丁目1番1号", "building": "101号室",
      "tel": "000-0000-0000", "fax": "000-0000-0000" }
  ],
  "contacts": [
    { "contactType": "REPRESENTATIVE", "name": "担当 太郎", "nameKana": "タントウ タロウ",
      "email": "sample3@gmail.com", "tel": "000-0000-0000" }
  ]
}
```
- **Response 200**: `data` = object chi tiết như 2.2.2 (kèm `supplierCode` auto-gen `SU\d+`).
- **Errors**: 400 (`SUPPLIER_NAME_REQUIRED`, `ADDRESS_REQUIRED`, `CONTACT_EMAIL_INVALID`…), 401, 403, 409 (`SUPPLIER_CODE_DUPLICATED`), 500.

### 2.2.4 `PUT /admin/supplier-masters/:id` — Cập nhật (màn 仕入先情報編集)

- **Auth**: Admin JWT, `supplier_master.update`.
- **Request**: y như POST (replace toàn bộ `addresses`/`contacts`/`producibleProductIds` theo danh sách gửi lên).
- **Side-effect**: ghi `supplier_master_history_logs` qua `HistoryLoggerHelper.getChanges` (diff field → `content`), `changed_by` = tên admin từ JWT.
- **Response 200**: object chi tiết.
- **Errors**: 400, 401, 403, 404, 409, 500.

### 2.2.5 `DELETE /admin/supplier-masters/:id` — Xóa mềm

- **Auth**: Admin JWT, `supplier_master.delete`.
- **Hành vi**: set `deleted_at` (soft delete). Cascade child theo FK.
- **Response 200**: `{ "id": 1, "deleted": true }`.
- **Errors**: 401, 403, 404, 500.

### 2.2.6 `GET /admin/supplier-masters/:id/history` — 変更履歴 (B1)

- **Auth**: Admin JWT, `supplier_master.read`.
- **Query**: `page,limit` (default 10), sort `created_at DESC`.
- **Response 200**:
```json
{
  "items": [
    { "id": 5, "changedAt": "2026-02-01T11:00:00+09:00", "content": "食品 表示許可を更新", "changedBy": "田中" }
  ],
  "meta": { "total": 3, "page": 1, "limit": 10, "totalPages": 1 }
}
```
- **Errors**: 401, 403, 404, 500.

### 2.2.7 `GET /admin/supplier-masters/export` — CSV出力

- **Auth**: Admin JWT, `supplier_master.export`.
- **Query**: nhận cùng filter như 2.2.1 (xuất theo kết quả lọc).
- **Response 200**: `Content-Type: text/csv` — **encoding chờ BA** (Shift_JIS / UTF-8, xem **Open Q. D2-1**), file attachment. (Không bọc envelope.)
- **Errors**: 401, 403, 500.

### 2.2.8 `POST /admin/supplier-masters/import` — CSV取込

- **Auth**: Admin JWT, `supplier_master.import`.
- **Request**: `multipart/form-data`, field `file` (CSV). Match record theo `supplier_name` (note DB) → tạo mới hoặc cập nhật (upsert).
- **Convention**: dùng **import chung** của hệ thống `src/commons/utiliz/import-csv/` (`BaseCsvProcessor` + interface `ImportResult` / `RowError`) — giống `POST /companies/import`, `POST /products/import`. Báo **thành công bao nhiêu / thất bại bao nhiêu / lỗi ở dòng nào / cột nào / nội dung lỗi**.
- **Đánh số dòng**: dòng 1 = header; dữ liệu bắt đầu từ **dòng 2** (`line` trong lỗi là số dòng thật trong file).
- **Response 200** — theo `ImportResult` (lỗi từng dòng vẫn trả HTTP 200, nằm trong `errorDetails`):
```json
{
  "total": 100,            // tổng số dòng dữ liệu
  "succeeded": 98,         // thành công
  "created": 80,           // trong succeeded: tạo mới
  "updated": 18,           // trong succeeded: cập nhật
  "failed": 2,             // thất bại
  "errorLines": [12, 45],  // các dòng có lỗi
  "errorDetails": [
    { "line": 12, "field": "仕入れ先区分", "message": "仕入れ先区分が不正です。" },
    { "line": 45, "field": "メールアドレス", "message": "メールアドレスの形式が正しくありません。" }
  ],
  "title": "一部の行でエラーが発生しました",
  "message": "・12行目\n・45行目"
}
```
- `RowError` = `{ line, field, message }`: `line`=số dòng (≥2), `field`=tên cột lỗi, `message`=nội dung lỗi (JP).
- **Errors**: 400 (`INVALID_CSV_FORMAT` — file hỏng/sai định dạng, không parse được), 401, 403, 500.
> ⏳ Bộ cột CSV cụ thể + encoding: **Open Q. D2-1** (chờ BA cấp template).

---

## 2.3 ADMIN — アカウント発行 (Account Issuance) — B2

> **Đổi business (không còn qua CSV):**
> - **Tạo / sửa** 仕入先マスタ (2.2) **KHÔNG** tự cấp phát account, **KHÔNG** gửi mail. Sau khi tạo,
>   `registration_status = 'UNREGISTERED'` (未登録 — default ở DB).
> - Khi **admin quyết định cấp phát**: ở màn list 仕入先マスタ **chọn 1 hoặc nhiều** supplier (checkbox)
>   → bấm 「アカウント発行」 → **popup xác nhận** (`アカウント発行のメール送信の確認`, hiện danh sách email)
>   → bấm 発行する → server tạo/cập nhật login account + set `REGISTERED` + **gửi mail** login info.
> - **Hỗ trợ 1 hoặc hàng loạt** bằng cùng 1 endpoint (mảng id). Nếu master đã có account → reset password + gửi lại.

### 2.3.1 `POST /admin/supplier-masters/accounts/issue` — Cấp phát (1 hoặc nhiều)

- **Auth**: Admin JWT, `supplier_account.issue`.
- **Request body** — danh sách id chọn từ list (≥ 1; 1 phần tử = cấp phát đơn lẻ):
```json
{ "supplierMasterIds": [1, 2, 3] }
```
- **Hành vi**: với mỗi `supplierMasterId`:
  1. Validate có email đại diện (contact `REPRESENTATIVE`/dòng đầu) — thiếu → đưa vào `failures` (`EMAIL_MISSING`), không chặn cả batch.
  2. Tạo/cập nhật `suppliers` (login, `SP\d+`), set `supplier_masters.login_user_id`.
  3. Set `supplier_masters.registration_status = 'REGISTERED'`.
  4. Gửi email login info (nếu đã có account → reset password + gửi lại).
- **Response 200** (data cho popup 完了 / エラー — [popup-success](./admin-management/popup-success-account-issue.html) / [popup-error](./admin-management/popup-error-account-issue.html)):
```json
{ "issued": 2, "failed": 1,
  "failures": [ { "supplierMasterId": 3, "email": "x@y.com", "reason": "MAIL_SEND_FAILED" } ] }
```
- **Errors**: 400 (`SUPPLIER_IDS_REQUIRED` — mảng rỗng), 401, 403, 500. Lỗi từng item (`EMAIL_MISSING`, `MAIL_SEND_FAILED`) trả trong `failures`, không phải HTTP error.

> **Popup xác nhận** dựng từ chính dữ liệu list đã chọn (FE đã có `supplierName`/`email`/`registrationStatus` mỗi dòng) → **không cần** endpoint preview/upload riêng. Cảnh báo "既存アカウントがある場合、パスワードがリセットされます" hiển thị khi dòng chọn có `registration_status = REGISTERED`.
>
> Lưu ý: endpoint **login account CRUD** sẵn có ở `/admin/accounts/suppliers` (`AdminSupplierController`). Endpoint cấp phát ở trên thao tác trên 仕入先マスタ (set `login_user_id` + `registration_status`).

---

## 2.4 SUPPLIER (self-service) — phần đã rõ

### 2.4.1 `GET /supplier/account/me` *(đã tồn tại)*
- Lấy thông tin tài khoản supplier đang đăng nhập.

### 2.4.2 `POST /supplier/account/change-password` *(đã tồn tại)*
- Đổi mật khẩu (màn パスワード変更 ở sidebar).

> Các màn còn lại của supplier (お知らせ / 注文管理 / 注文詳細編集) đã thiết kế ở **PART 3**. (出荷処理 ngoài scope — BA chốt không làm.)

---

# PART 3 — API DESIGN: 3 màn Supplier (注文管理 / 注文詳細編集 / お知らせ)

> 出荷処理 (DA_出荷処理) **ngoài scope** — BA chốt không làm (xem ghi chú cuối PART 3).

> **Base path**: tất cả `/supplier/*` (Supplier JWT). Màn admin (仕入先マスタ…) thuộc PART 2 + folder `admin-management/`.
> **Giai đoạn THIẾT KẾ DB**: các "DB design" dưới đây là **đề xuất DBML** — **chưa** tạo migration / sửa entity.
> Conventions chung (envelope, lỗi, cursor) theo §2.1.

## 3.1 お知らせ (Notifications) — `DA_HOME_001` — D1

> **Tái dùng `user_notifications`** (entity thật đã có `recipient_type`/`recipient_id`/`email`/`email_sent`/`email_error`/`read_at` — `db.dbml` đang cũ, cần đồng bộ). Supplier nhận thông báo qua `recipient_type = 'SUPPLIER'` + `recipient_id = <supplier login id>`.

**DB design (đề xuất, chưa migration):**
- Đồng bộ `user_notifications` trong dbml ↔ entity (thêm `recipient_type, recipient_id, email, email_sent, email_error, read_at`).
- Enum `NotificationRecipientType` cần có value **`SUPPLIER`** (thêm nếu chưa có).
- Phân loại 重要 vs お知らせ: dùng `notifications.type` (vd `IMPORTANT` / `NEWS`) hoặc cờ `is_important`. *(chốt nhãn — xem Còn mở.)*

### 3.1.1 `GET /supplier/notifications` — list (tab Tất cả / 重要 / お知らせ)
- **Auth**: Supplier JWT.
- **Query**: `tab=ALL|IMPORTANT|NEWS` (mặc định ALL), `cursor`, `limit` (≤50).
- **Response 200**:
```json
{
  "items": [
    { "id": 9001, "title": "【2024/02/29】配送方法について", "content": "配送方法が変更になりました。…",
      "type": "IMPORTANT", "isImportant": true, "isRead": false, "createdAt": "2024-02-29T09:00:00+09:00",
      "links": [ { "label": "配送方法詳細を見る", "url": "https://…" } ] }
  ],
  "unreadCount": 3, "nextCursor": null, "hasMore": false
}
```
- Lọc server: `recipient_type='SUPPLIER'` & `recipient_id = me`. `links` lấy từ `notifications.body` (jsonb).

### 3.1.2 `PATCH /supplier/notifications/{id}/read` — đánh dấu đã đọc
- Set `is_read=true`, `read_at=now()`. **Response 200**: `{ "id": 9001, "isRead": true }`.

---

## 3.2 注文管理 (Order list) — `DA_注文管理` — C1

> **Cập nhật theo mock mới nhất** (file `DA_注文管理.html` cũ đã lỗi thời). Cột thật: **注文年月 / メニュー種別(通常·プレミアム) / 出荷予定日 / 出荷実績日 / 商品数 / 合計金額 / ステータス** — **KHÔNG có** 顧客名/注文番号/注文日時. メニュー種別 = `menus.menu_type` (standard→通常, premium→プレミアム).
>
> ⚠️ **Nguồn DB chưa thống nhất:** màn trộn khái niệm — 出荷予定日/出荷実績日 thuộc `supplier_orders`; メニュー種別 thuộc `menus`; status 未処理/仮注文/正式注文/確認済み + 合計金額 nghiêng `company_orders`. **Cần BA chốt entity backing** cho 注文管理 (xem Còn mở #B').

### 3.2.1 `GET /supplier/orders` — danh sách + filter
- **Auth**: Supplier JWT.
- **Query**: `yearMonth` (yyyy-MM — bộ lọc 注文年月), `menuType` (`STANDARD`通常 / `PREMIUM`プレミアム), `status` (enum), `page`/`limit` (10/20/50).
- **Response 200**:
```json
{
  "items": [
    { "id": 2001, "orderYearMonth": "2024/04",
      "menuType": "STANDARD",
      "expectedShipDate": "2024-05-23", "actualShipDate": "2024-05-23",
      "itemCount": 100, "amount": 200, "status": "UNPROCESSED" }
  ],
  "page": 1, "limit": 10, "total": 100
}
```
- **Field**: `orderYearMonth` (注文年月) · `menuType` (メニュー種別) · `expectedShipDate` (出荷予定日) · `actualShipDate` (出荷実績日) · `itemCount` (商品数) · `amount` (合計金額) · `status` (ステータス).
- **Map status → JP badge**: `UNPROCESSED`→未処理(xám) · `PROVISIONAL`→仮注文(cam) · `OFFICIAL`→正式注文(xanh dương) · `CONFIRMED`→確認済み(xanh lá). *(Enum cụ thể + nguồn `合計金額` chờ BA — xem Còn mở.)*
- **Actions**: 編集 → [3.3](#33-注文詳細編集-order-detailedit--c2); ダウンロード → tải xuống 1 đơn (`GET /supplier/orders/{id}/export`).

---

## 3.3 注文詳細編集 (Order detail/edit) — `DA_注文詳細編集` — C2

> Danh sách dòng SP của 1 đơn, mỗi dòng có trạng thái phát đơn riêng (仮発注済/本発注済).

**DB design (C2 — đề xuất, chưa migration):** thêm cột `line_status` vào bảng dòng đơn:
```dbml
// supplier_order_details — ADD (design)
line_status          supplier_order_line_status_enum [not null, default: 'UNPROCESSED'] // ステータス
provisional_quantity int   // 仮発注 (số lượng đặt tạm)
official_quantity    int   // 本発注 (số lượng đặt chính thức)
// (オーダー数 = quantity sẵn có; 論理必要数/在庫数 = TBD nguồn — xem ghi chú dưới)

Enum supplier_order_line_status_enum {
  "UNPROCESSED"         // 未処理
  "PROVISIONAL_ORDERED" // 仮発注済
  "OFFICIAL_ORDERED"    // 本発注済
}
```

> **Cột bảng (theo mock mới):** No / 商品名 / カテゴリ / 仕入先 / 論理必要数 / 在庫数 / オーダー数 / 仮発注 / 本発注 / ステータス / 操作.
> ⚠️ **論理必要数 (logical required) + 在庫数 (stock)** chưa có nguồn DB (giống forecast/stock đã gỡ ở 出荷処理) → **TBD chờ BA**. **オーダー数** = `quantity` (số đặt). **仮発注/本発注** = cột số mới (DB design ở trên).

### 3.3.1 `GET /supplier/orders/{id}` — chi tiết + dòng
- **Query (filter dòng)**: `productName`, `status` (line_status), `month`.
- **Response 200**:
```json
{
  "orderNo": "CO000000123", "customerName": "サンプル株式会社", "status": "SUBMITTED",
  "lines": [
    { "detailId": 5001, "no": 1,
      "productName": "さつまいも", "category": "野菜", "supplierName": "ヤマダ株式会社",
      "logicalRequiredQty": 100,   // 論理必要数 ⚠️ TBD nguồn
      "stockQty": 100,             // 在庫数 ⚠️ TBD nguồn
      "orderQty": 100,             // オーダー数 = quantity
      "provisionalQty": 100,       // 仮発注 (provisional_quantity)
      "officialQty": 100,          // 本発注 (official_quantity)
      "lineStatus": "PROVISIONAL_ORDERED" }
  ],
  "page": 1, "limit": 10, "total": 100
}
```
- **Field cột**: `logicalRequiredQty` (論理必要数 ⚠️TBD) · `stockQty` (在庫数 ⚠️TBD) · `orderQty` (オーダー数 = quantity) · `provisionalQty` (仮発注) · `officialQty` (本発注) · `lineStatus` (ステータス).

### 3.3.2 `POST /supplier/orders/{id}/provisional-order` — 仮発注 (theo dòng đã chọn)
- **Body**: `{ "detailIds": [5001, 5002] }` → set `line_status='PROVISIONAL_ORDERED'`.
- **Response 200**: `{ "updated": 2 }`.

### 3.3.3 `POST /supplier/orders/{id}/official-order` — 本発注
- **Body**: `{ "detailIds": [5001] }` → set `line_status='OFFICIAL_ORDERED'`. **Response**: `{ "updated": 1 }`.

### 3.3.4 `POST /supplier/orders/{id}/import` — CSV取込 (import)

> ⚠️ Nút "CSV" trên màn là **IMPORT** (không phải export). **Format file chưa chốt** — hiện chỉ biết là import; bộ cột + encoding chờ BA. Dùng **convention import chung** của hệ thống: `src/commons/utiliz/import-csv/` (`BaseCsvProcessor` + interface `ImportResult`/`RowError`) — giống `POST /companies/import`, `POST /products/import`.

- **Auth**: Supplier JWT. **Request**: `multipart/form-data`, field `file` (CSV).
- **Response 200** — theo `ImportResult` (báo số thành công/thất bại + lỗi từng dòng/cột):
```json
{
  "total": 10, "succeeded": 8, "failed": 2,
  "errorLines": [3, 7],
  "errorDetails": [
    { "line": 3, "field": "数量",  "message": "数量は数値で入力してください" },
    { "line": 7, "field": "商品名", "message": "商品が見つかりません" }
  ],
  "title": "一部の行でエラーが発生しました",
  "message": "・3行目\n・7行目"
}
```

| Field | Ý nghĩa |
|-------|---------|
| `total` / `succeeded` / `failed` | Tổng dòng / thành công / thất bại |
| `errorLines[]` | Danh sách số dòng lỗi (1 = header, dữ liệu từ dòng 2) |
| `errorDetails[].line` | Dòng CSV bị lỗi |
| `errorDetails[].field` | **Cột** bị lỗi (tên cột gốc) |
| `errorDetails[].message` | Mô tả lỗi (i18n) |
| `title` / `message` | Tiêu đề + tóm tắt đã dịch (cho popup kết quả) |

- **Errors**: 400 (`INVALID_CSV_FORMAT` — file hỏng), 401, 403, 500. Lỗi **theo dòng** nằm trong `errorDetails`, không phải HTTP error.
- ⚠️ **TBD**: bộ cột CSV + encoding (Shift_JIS / UTF-8) chờ BA cung cấp template.

### 3.3.5 Khác
- `PUT /supplier/order-details/{detailId}` (sửa dòng) · `DELETE /supplier/order-details/{detailId}` (xóa mềm).
- 契約登録 → điều hướng flow contract (ngoài scope chi tiết đợt này).

---

> **出荷処理 (DA_出荷処理): BỎ khỏi scope** — BA phản hồi **không làm màn này** (mock sai/khó hiểu). Đã gỡ thiết kế API + các cột DB-design riêng cho nó (provisional/official qty, lot, desired_expiry, delivery_warehouse_snapshot, forecast/stock/warehouse). Nếu sau này làm lại → thiết kế từ mock mới.

## Còn mở (cần BA/PO) — không chặn phần đã thiết kế

- **#B' Entity backing cho 注文管理 (3.2)** — mock trộn 出荷予定日/出荷実績日 (supplier_orders) + メニュー種別 (menus) + 合計金額/status (company_orders). Cần BA chốt: 1 bảng hay view join? Nguồn **合計金額** + enum **status** (未処理/仮注文/正式注文/確認済み) lấy từ đâu. *(menuType đã rõ = `menus.menu_type` 通常/プレミアム.)*
- **#C' 論理必要数 / 在庫数 (3.3)** — 2 cột ở 注文詳細編集 chưa có nguồn DB (không có bảng forecast/stock). API đã ký field `logicalRequiredQty`/`stockQty` nhưng nguồn cần BA. *(オーダー数=quantity, 仮発注/本発注 đã có cột DB design.)*
- **Nhãn 重要/お知らせ** (3.1) — chốt cách phân loại (`notifications.type` value vs cờ `is_important`).

## D2 — CSV 取込/出力
- **D2-1**: Bộ cột CSV cho **取込/出力 仕入先マスタ** (2.2.7/2.2.8) chưa có file mẫu. Cần BA cung cấp template + **encoding** (Shift_JIS hay UTF-8) + quy tắc match (đang giả định theo `supplier_name`). *(Phát hành tài khoản 2.3 **không** còn dùng CSV — cấp phát theo id chọn ở list.)*

## A4-1 — Giá trị enum 仕入れ先区分
Mock chỉ có placeholder `区分1 / 区分2` (chưa phải nhãn thực). Enum `supplier_classification_enum` đang để placeholder `CLASS_1/CLASS_2`.
- **Hỏi**: Danh sách giá trị 仕入れ先区分 thực tế là gì (nhãn JP + mã)?

## A1-1 — Xác nhận multi-value 区分 địa chỉ
Đã chốt multi-value. Xác nhận thêm: 1 supplier có **bắt buộc tối thiểu 1 địa chỉ loại 本社** không? (để suy ra cột 本社住所 ở list).

---

## Phụ lục — Mapping nhanh field UI → DB

| UI (JP) | Bảng.cột |
|---------|----------|
| 仕入先ID | `supplier_masters.supplier_code` |
| 仕入先名 / カナ | `supplier_masters.supplier_name` / `.supplier_name_kana` |
| ステータス (本登録/未登録) | `supplier_masters.registration_status` |
| 仕入れ先区分 | `supplier_masters.classification` |
| 備考 | `supplier_masters.remarks` |
| 作れる商品 | `product_suppliers(supplier_master_id, product_id)` |
| 住所 (区分/郵便番号/都道府県/市区町村/町域・番地/建物/電話/Fax) | `supplier_master_addresses.*` |
| 担当者 (区分/担当者名/フリガナ/メール/TEL) | `supplier_master_contacts.*` |
| 変更日時 / 変更内容 / 変更者 | `supplier_master_history_logs.created_at / content / changed_by` |
| アカウント発行 → login | `suppliers` (login) ↔ `supplier_masters.login_user_id` |
