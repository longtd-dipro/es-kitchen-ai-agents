# Supplier (仕入先) — API Contract for FE

> Bản contract bàn giao cho FE implement.  
> Kế thừa từ: `SUPPLIER_DB_API_DESIGN.md`  
> Ngày tạo: 2026-06-18

---

## 1. Tổng quan

### 1.1 Mục đích tài liệu
Tài liệu này cung cấp đủ thông tin để FE implement các màn **仕入先マスタ** và **アカウント発行** mà không cần hỏi lại backend. Các màn khác (注文管理, 注文詳細編集, お知らせ) được đánh dấu là **TBD** — có thể implement UI mock nhưng không connect API thật.

### 1.2 Base URL & Auth

| Phân hệ | Base Path | Auth |
|---------|-----------|------|
| Admin quản lý Supplier Master | `/admin/supplier-masters` | Admin JWT (Bearer) |
| Admin phát hành tài khoản | `/admin/supplier-masters/accounts/issue` | Admin JWT (Bearer) |
| Supplier self-service | `/supplier/...` | Supplier JWT (Bearer) |

### 1.3 Response Envelope (chung)

```typescript
// Success
interface ApiSuccess<T> {
  statusCode: "success";
  message: string;
  data: T;
}

// Error
interface ApiError {
  statusCode: "error" | "validation_error" | "unauthorized" | "forbidden" | "not_found" | "conflict" | "internal_error";
  message: string;        // i18n message (EN hoặc JA)
  title: string;          // HTTP reason phrase
  errorCode: string | null; // mã lỗi nghiệp vụ (VD: SUPPLIER_NAME_REQUIRED)
  data: null;
}
```

### 1.4 Pagination (chung)

```typescript
interface PaginatedResponse<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

Query params: `page` (default 1), `limit` (default 10), `sort`, `order` (ASC|DESC).

---

## 2. Part A — CÓ THỂ IMPLEMENT NGAY (Batch 1)

### 2.1 GET /admin/supplier-masters — Danh sách + filter

**Auth**: Admin JWT  
**Permission**: `supplier_master.read`

#### Query Params

| Param | Type | Required | Mô tả |
|-------|------|----------|-------|
| `keyword` | string | No | Tìm kiếm theo 仕入先ID hoặc 仕入先名 (LIKE) |
| `registrationStatus` | `REGISTERED` \| `UNREGISTERED` | No | Lọc theo ステータス (本登録/未登録) |
| `classification` | string enum | No | Lọc theo 仕入れ先区分 |
| `producibleProductId` | number | No | Lọc theo 作れる商品 ID |
| `page` | number | No | Trang (default 1) |
| `limit` | number | No | Số lượng/trang (default 10) |
| `sort` | string | No | Trường sort (VD: `createdAt`) |
| `order` | `ASC` \| `DESC` | No | Thứ tự sort (default DESC) |

#### Response 200

```typescript
interface SupplierListItemResponse {
  id: number;
  supplierCode: string;      // "SU00001"
  supplierName: string;      // 仕入先名
  headOfficeAddress: string; // 本社住所 (ghép từ địa chỉ HEAD_OFFICE)
  contactName: string;       // 担当者名 (contact REPRESENTATIVE)
  contactTel: string;        // 担当者電話番号
  email: string;             // 担当者メール (contact REPRESENTATIVE)
  registrationStatus: "REGISTERED" | "UNREGISTERED";
  classification: string;    // 仕入れ先区分
}

interface SupplierListResponse {
  items: SupplierListItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

> **NOTE FE**: `headOfficeAddress` là computed field — backend ghép từ địa chỉ có `addressTypes` chứa `HEAD_OFFICE`. Nếu không có 本社 → trả empty string.

#### Errors

| HTTP | statusCode | errorCode | message (i18n) |
|------|-----------|-----------|----------------|
| 401 | unauthorized | null | "Unauthorized" |
| 403 | forbidden | null | "権限がありません。" |
| 500 | internal_error | null | "Internal server error" |

---

### 2.2 GET /admin/supplier-masters/:id — Chi tiết

**Auth**: Admin JWT  
**Permission**: `supplier_master.read`

#### Response 200

```typescript
interface SupplierAddressResponse {
  id: number;
  addressTypes: Array<"HEAD_OFFICE" | "FACTORY" | "OTHER">;
  postalCode: string;
  prefecture: string;
  city: string;
  street: string;
  building?: string;
  tel?: string;
  fax?: string;
  sortOrder: number;
}

interface SupplierContactResponse {
  id: number;
  contactType: "REPRESENTATIVE" | "SALES" | "OTHER";
  name: string;
  nameKana?: string;
  email: string;
  tel?: string;
  sortOrder: number;
}

interface SupplierDetailResponse {
  id: number;
  supplierCode: string;          // "SU00001" — auto-gen
  supplierName: string;
  supplierNameKana?: string;
  classification: string;        // 仕入れ先区分
  registrationStatus: "REGISTERED" | "UNREGISTERED";
  remarks?: string;
  status: "ACTIVE" | "INACTIVE"; // lifecycle status
  loginUserId?: string;          // SPxxxxx nếu đã cấp phát account
  producibleProducts: Array<{
    id: number;
    name: string;
  }>;
  addresses: SupplierAddressResponse[];
  contacts: SupplierContactResponse[];
}
```

#### Errors

| HTTP | statusCode | errorCode | message |
|------|-----------|-----------|---------|
| 401 | unauthorized | null | "Unauthorized" |
| 403 | forbidden | null | "権限がありません。" |
| 404 | not_found | `SUPPLIER_MASTER_NOT_FOUND` | "仕入先マスタが見つかりません。" |
| 500 | internal_error | null | "Internal server error" |

---

### 2.3 POST /admin/supplier-masters — Đăng ký mới

**Auth**: Admin JWT  
**Permission**: `supplier_master.create`

> ⚠️ **IMPORTANT**: Tạo mới **KHÔNG** tự cấp phát account, **KHÔNG** gửi mail. Record mới luôn `registrationStatus: "UNREGISTERED"`.

#### Request Body

```typescript
interface CreateSupplierMasterRequest {
  supplierName: string;              // required, max 255
  supplierNameKana?: string;         // optional, max 255, hiragana/katakana
  classification: string;            // required, enum value
  registrationStatus: "REGISTERED" | "UNREGISTERED"; // required
  remarks?: string;
  producibleProductIds: number[];    // required, min 1
  addresses: Array<{
    addressTypes: Array<"HEAD_OFFICE" | "FACTORY" | "OTHER">; // required, min 1
    postalCode: string;              // required, format XXX-XXXX
    prefecture: string;              // required, 都道府県
    city: string;                    // required, 市区町村
    street: string;                  // required, 町域・番地
    building?: string;               // optional, 建物・部屋番号
    tel?: string;                    // optional, phone format
    fax?: string;                    // optional
  }>;                               // required, min 1
  contacts: Array<{
    contactType: "REPRESENTATIVE" | "SALES" | "OTHER"; // required
    name: string;                    // required, 担当者名
    nameKana?: string;               // optional, フリガナ
    email: string;                   // required, email format
    tel?: string;                    // optional
  }>;                               // required, min 1
}
```

#### Validation Rules

| Field | Rule |
|-------|------|
| `supplierName` | required, string, max 255 |
| `supplierNameKana` | optional, string, max 255 |
| `classification` | required, string, ∈ enum values |
| `registrationStatus` | required, ∈ ["REGISTERED", "UNREGISTERED"] |
| `producibleProductIds` | required, array, min 1 item, mỗi id phải tồn tại trong DB |
| `addresses` | required, array, min 1 |
| `addresses[].addressTypes` | required, array, min 1, ∈ ["HEAD_OFFICE","FACTORY","OTHER"] |
| `addresses[].postalCode` | required, regex `^\d{3}-?\d{4}$` |
| `addresses[].prefecture/city/street` | required, string, max 255 |
| `contacts` | required, array, min 1 |
| `contacts[].contactType` | required, ∈ ["REPRESENTATIVE","SALES","OTHER"] |
| `contacts[].name` | required, string, max 255 |
| `contacts[].email` | required, email format |
| `contacts[].nameKana` | optional, string, max 255 |

> **[ASSUMPTION A1]**: Validation regex cho `postalCode` và `email` sẽ được backend confirm chi tiết. FE nên dùng regex phổ thông (`/^\d{3}-?\d{4}$/` cho postal, `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` cho email) và để backend validate final.

#### Response 201 (thực tế backend trả 200)

```typescript
// Same as SupplierDetailResponse (2.2), thêm supplierCode được auto-gen
interface CreateSupplierMasterResponse extends SupplierDetailResponse {}
```

#### Errors

| HTTP | statusCode | errorCode | message (i18n) |
|------|-----------|-----------|----------------|
| 400 | validation_error | `SUPPLIER_NAME_REQUIRED` | 仕入先名を入力してください。 |
| 400 | validation_error | `CLASSIFICATION_REQUIRED` | 仕入れ先区分を選択してください。 |
| 400 | validation_error | `ADDRESS_REQUIRED` | 住所を1件以上入力してください。 |
| 400 | validation_error | `CONTACT_REQUIRED` | 担当者を1件以上入力してください。 |
| 400 | validation_error | `CONTACT_EMAIL_INVALID` | メールアドレスの形式が正しくありません。 |
| 400 | validation_error | `PRODUCT_IDS_REQUIRED` | 作れる商品を1件以上選択してください。 |
| 409 | conflict | `SUPPLIER_CODE_DUPLICATED` | 仕入先IDが既に存在します。 |
| 401 | unauthorized | null | Unauthorized |
| 403 | forbidden | null | 権限がありません。 |
| 500 | internal_error | null | Internal server error |

> **[ASSUMPTION A2]**: Danh sách `errorCode` trên là dựa trên design doc. Backend có thể thay đổi chi tiết message key. FE nên hiển thị `message` trực tiếp từ response thay vì hard-code.

---

### 2.4 PUT /admin/supplier-masters/:id — Cập nhật

**Auth**: Admin JWT  
**Permission**: `supplier_master.update`

#### Request Body
Y hệt POST (2.3). **Replace toàn bộ** `addresses`, `contacts`, `producibleProductIds` theo danh sách gửi lên.

> **[ASSUMPTION A3]**: Backend sẽ so sánh diff giữa old và new để ghi `supplier_master_history_logs`. FE không cần gửi diff — chỉ cần gửi trạng thái mới nhất.

#### Response 200
`SupplierDetailResponse` (giống 2.2)

#### Errors

| HTTP | statusCode | errorCode |
|------|-----------|-----------|
| 400 | validation_error | *(same as POST)* |
| 401 | unauthorized | null |
| 403 | forbidden | null |
| 404 | not_found | `SUPPLIER_MASTER_NOT_FOUND` |
| 409 | conflict | `SUPPLIER_CODE_DUPLICATED` |
| 500 | internal_error | null |

---

### 2.5 DELETE /admin/supplier-masters/:id — Xóa mềm

**Auth**: Admin JWT  
**Permission**: `supplier_master.delete`

#### Behavior
- Soft delete (`deleted_at = now()`)
- Cascade xóa các bảng con (addresses, contacts, history logs)
- **Chặn nếu supplier đang ACTIVE** → trả 400

#### Response 200

```typescript
interface DeleteSupplierMasterResponse {
  id: number;
  deleted: boolean;
}
```

#### Errors

| HTTP | statusCode | errorCode | message |
|------|-----------|-----------|---------|
| 400 | validation_error | `SUPPLIER_MASTER_ACTIVE_CANNOT_DELETE` | 有効な仕入先マスタは削除できません。先にINACTIVEに変更してください。 |
| 401 | unauthorized | null | Unauthorized |
| 403 | forbidden | null | 権限がありません。 |
| 404 | not_found | `SUPPLIER_MASTER_NOT_FOUND` | 仕入先マスタが見つかりません。 |
| 500 | internal_error | null | Internal server error |

---

### 2.6 GET /admin/supplier-masters/:id/history — 変更履歴

**Auth**: Admin JWT  
**Permission**: `supplier_master.read`

#### Query Params

| Param | Type | Required | Default |
|-------|------|----------|---------|
| `page` | number | No | 1 |
| `limit` | number | No | 10 |

#### Response 200

```typescript
interface HistoryLogResponse {
  id: number;
  changedAt: string;   // ISO 8601, VD: "2026-02-01T11:00:00+09:00"
  content: string;     // VD: "仕入先名を「A → B」に変更"
  changedBy: string;   // Tên admin thực hiện
}

interface HistoryLogListResponse {
  items: HistoryLogResponse[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

#### Errors
| HTTP | errorCode |
|------|-----------|
| 401 | null |
| 403 | null |
| 404 | `SUPPLIER_MASTER_NOT_FOUND` |
| 500 | null |

---

### 2.7 POST /admin/supplier-masters/accounts/issue — アカウント発行

**Auth**: Admin JWT  
**Permission**: `supplier_account.issue`

> **Business flow**:
> 1. Admin chọn 1 hoặc nhiều supplier ở list → bấm 「アカウント発行」
> 2. Popup xác nhận hiện danh sách email
> 3. Bấm 「発行する」 → gọi endpoint này
> 4. Backend tạo/cập nhật login account + set REGISTERED + gửi mail

#### Request Body

```typescript
interface IssueAccountRequest {
  supplierMasterIds: number[]; // required, min 1
}
```

#### Response 200

```typescript
interface IssueAccountResponse {
  issued: number;           // Số lượng phát hành thành công
  failed: number;           // Số lượng thất bại
  failures: Array<{
    supplierMasterId: number;
    email: string;
    reason: "EMAIL_MISSING" | "MAIL_SEND_FAILED";
  }>;
}
```

#### Behavior

| Bước | Hành vi |
|------|---------|
| 1 | Validate mỗi `supplierMasterId` có contact `REPRESENTATIVE` (hoặc dòng đầu) |
| 2 | Thiếu email → đưa vào `failures` với reason `EMAIL_MISSING` |
| 3 | Có email → tạo/cập nhật `suppliers` (login table) với code `SP\d+` |
| 4 | Set `supplier_masters.login_user_id` + `registration_status = 'REGISTERED'` |
| 5 | Gửi mail login info |
| 6 | Nếu đã có account → reset password + gửi lại |

#### Errors

| HTTP | statusCode | errorCode | message |
|------|-----------|-----------|---------|
| 400 | validation_error | `SUPPLIER_IDS_REQUIRED` | 仕入先IDを選択してください。 |
| 401 | unauthorized | null | Unauthorized |
| 403 | forbidden | null | 権限がありません。 |
| 500 | internal_error | null | Internal server error |

> **[ASSUMPTION A4]**: Endpoint này là **batch** — FE gửi mảng id, backend xử lý từng cái và trả về kết quả partial. Lỗi từng item nằm trong `failures`, không phải HTTP error.

---

## 3. Part B — TBD / WAIT FOR BA

### 3.1 注文管理 (Order List)

**Status**: ⚠️ **KHÔNG implement API thật** — thiếu entity backing

| Thiếu | Chi tiết |
|-------|---------|
| **#B' Entity backing** | Chưa biết 合計金額 lấy từ `company_orders` hay bảng khác; status enum (未処理/仮注文/正式注文/確認済み) chưa có nguồn DB chính thức |
| **Endpoint** | `GET /supplier/orders` (đã design) |
| **Impact** | Nếu FE implement bây giờ → backend không trả đúng field → phải sửa cả 2 bên |

**[ASSUMPTION B1]**: Nếu FE cần implement UI trước, có thể mock data theo format đã design:
```json
{
  "id": 2001,
  "orderYearMonth": "2024/04",
  "menuType": "STANDARD",
  "expectedShipDate": "2024-05-23",
  "actualShipDate": "2024-05-23",
  "itemCount": 100,
  "amount": 200,
  "status": "UNPROCESSED"
}
```

---

### 3.2 注文詳細編集 (Order Detail/Edit)

**Status**: ⚠️ **KHÔNG implement API thật** — thiếu 2 cột

| Thiếu | Chi tiết |
|-------|---------|
| **#C' 論理必要数** | Chưa có nguồn DB |
| **#C' 在庫数** | Chưa có nguồn DB |

**[ASSUMPTION C1]**: Có thể mock `logicalRequiredQty: 0` và `stockQty: 0` cho UI. オーダー数 = `quantity`, 仮発注/本発注 = cột số mới đã có DB design.

---

### 3.3 お知らせ (Notifications)

**Status**: ⚠️ Entity `user_notifications` đã có nhưng thiếu xác nhận từ BA

| Thiếu | Chi tiết |
|-------|---------|
| **Phân loại 重要/お知らせ** | Chưa chốt dùng `type` enum hay cờ `is_important` |
| **recipient_type** | Cần thêm value `SUPPLIER` vào enum |

**[ASSUMPTION D1]**: Dùng `type = "IMPORTANT" | "NEWS"` để phân loại.

---

### 3.4 CSV 取込/出力

**Status**: ⏳ **Chờ BA cung cấp template + encoding**

| Thiếu | Chi tiết |
|-------|---------|
| **D2-1 Bộ cột CSV** | Chưa có file mẫu |
| **Encoding** | Chưa chốt Shift_JIS hay UTF-8 |
| **Match rule** | Đang giả định theo `supplier_name` |

---

## 4. Part C — ĐÃ TỒN TẠI (không cần implement lại)

### 4.1 Supplier Auth (đã có trong code)

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/auth/supplier/login` | POST | Đăng nhập |
| `/auth/supplier/forgot-password/request` | POST | Gửi OTP |
| `/auth/supplier/forgot-password/verify-otp` | POST | Xác minh OTP |
| `/auth/supplier/forgot-password/reset-password` | POST | Đặt mật khẩu mới |
| `/auth/supplier/logout` | POST | Đăng xuất |
| `/supplier/account/me` | GET | Thông tin tài khoản |
| `/supplier/account/change-password` | POST | Đổi mật khẩu |

---

## 5. Enum Values

### 5.1 Confirmed Enums

```typescript
// 本登録/未登録
enum SupplierRegistrationStatus {
  REGISTERED = "REGISTERED",
  UNREGISTERED = "UNREGISTERED",
}

// 住所区分
enum SupplierAddressType {
  HEAD_OFFICE = "HEAD_OFFICE",
  FACTORY = "FACTORY",
  OTHER = "OTHER",
}

// 担当者区分
enum SupplierContactType {
  REPRESENTATIVE = "REPRESENTATIVE",
  SALES = "SALES",
  OTHER = "OTHER",
}

// Lifecycle status
enum SupplierStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
```

### 5.2 Pending Enum (cần BA confirm)

**[OPEN QUESTION A4-1]**: Giá trị thực tế của `classification` (仕入れ先区分)

| Current (placeholder) | Notes |
|----------------------|-------|
| `CLASS_1` | Chờ BA confirm nhãn JP thực tế |
| `CLASS_2` | Chờ BA confirm nhãn JP thực tế |

> FE nên implement dropdown với placeholder label "区分1 / 区分2" và chuẩn bị replace khi BA confirm.

---

## 6. Assumptions Log

FE implement dựa trên các assumptions dưới đây. Khi nào có thông tin chốt từ BA, cập nhật lại.

| # | Assumption | Impact nếu sai | Owner xác nhận |
|---|-----------|----------------|----------------|
| A1 | Validation regex cho postalCode/email | FE hiển thị lỗi khác backend | Backend |
| A2 | Error codes có thể thay đổi | FE hiển thị message sai | Backend + FE |
| A3 | PUT replace toàn bộ addresses/contacts | FE mất data nếu gửi thiếu | Backend |
| A4 | Batch issue trả HTTP 200 kể cả có failures | FE hiển thị popup success thay vì error | Backend |
| B1 | 注文管理 mock format đúng | FE rebuild table khi API thật ra | Backend + BA |
| C1 | 論理必要数/在庫数 = 0 nếu không có data | FE hiển thị 0 cho 2 cột này | Backend + BA |
| D1 | Notification type = IMPORTANT/NEWS | FE rebuild filter tabs | BA |

---

## 7. Implementation Order đề xuất

### Phase 1 — Implement ngay (tuần 1-2)
1. **仕入先マスタ List** (2.1) — filter, pagination, table
2. **仕入先マスタ Detail** (2.2) — tabs: 基本情報 / 住所 / 担当者 / 作れる商品 / 変更履歴
3. **仕入先マスタ Register** (2.3) — form với validation
4. **仕入先マスタ Edit** (2.4) — form giống register
5. **アカウント発行** (2.7) — checkbox list → confirm popup → issue → result popup

### Phase 2 — Chờ BA confirm (tuần 3+)
6. 注文管理 — chờ #B' entity backing
7. 注文詳細編集 — chờ #C' 論理必要数/在庫数
8. お知らせ — chốt phân loại 重要/お知らせ
9. CSV 取込/出力 — chờ template + encoding

---

## 8. Open Questions cần BA trả lời

| # | Question | Impact | Priority |
|---|----------|--------|----------|
| **A4-1** | Giá trị thực tế của 仕入れ先区分 (classification) là gì? | Dropdown options | HIGH |
| **#B'** | 合計金額 (amount) trong 注文管理 lấy từ đâu? | API field mapping | HIGH |
| **#C'** | 論理必要数 và 在庫数 có nguồn DB nào? | 2 cột trong 注文詳細編集 | HIGH |
| **D2-1** | Bộ cột CSV + encoding cho 仕入先マスタ import/export? | CSV template | MEDIUM |
| **A1-1** | Bắt buộc 1 supplier có ít nhất 1 địa chỉ loại 本社? | Column 本社住所 ở list | LOW |

---

## 9. i18n Keys cần có

FE sẽ dùng các keys sau (đã có trong `src/i18n/en/supplier.json` và `src/i18n/ja/supplier.json`):

```typescript
// Common
supplier.auth.invalid_credentials
supplier.auth.account_inactive
supplier.auth.account_not_found

// Admin
admin.supplier.not_found
admin.supplier.cannot_delete_active
admin.supplier.email_exists
admin.supplier.created
admin.supplier.updated
admin.supplier.deleted
admin.supplier.credentials_email_subject
```

> FE không hard-code text — luôn lấy từ API response `message` field hoặc từ translation file.

---

## 10. Checklist trước khi FE implement

- [ ] Đọc phần **Assumptions Log** (section 6) — biết mình đang assume gì
- [ ] Đọc phần **Open Questions** (section 8) — hỏi BA những câu chưa rõ
- [ ] Implement **Phase 1** endpoints (section 7) trước
- [ ] Dùng dynamic enum cho `classification` — không hard-code label
- [ ] Validate client-side theo section 2.3, nhưng tin tưởng backend validation cuối cùng
- [ ] Không implement 注文管理 / 注文詳細編集 API thật cho đến khi #B' và #C' được chốt
