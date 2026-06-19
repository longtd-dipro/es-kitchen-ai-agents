# DESIGN: Supplier My Page — es-kitchen-api

## 1. Tổng quan thay đổi

| Layer | File | Loại thay đổi |
|---|---|---|
| Controller | `src/modules/supplier/http/controllers/supplier-account.controller.ts` | Sửa — thêm PATCH handler |
| Request DTO | `src/modules/supplier/http/requests/supplier-update-profile.request.ts` | Thêm mới |
| Service | `src/modules/supplier/services/supplier-auth.service.ts` | Sửa — thêm method `updateProfile` |

> Không thay đổi DB schema. Không thêm migration. Không thêm Redis cache.

---

## 2. Database Changes

### Entity / Migration

Không thay đổi. Bảng `suppliers` đã có đủ cột cần thiết:

- `supplier_name` — `varchar(255)`, nullable
- `email` — `varchar(255)`, not null, unique index `idx_suppliers_email_active` (partial, where `deleted_at IS NULL`)

### Redis Cache

Không dùng cache cho feature này — dữ liệu profile đọc thẳng từ DB, không có yêu cầu performance đặc biệt.

---

## 3. API Definition

> **Nguồn gốc cho CONTRACT LOCK và task FE.** FE copy trực tiếp phần này vào task mà không cần đoán.

### Endpoint mới / thay đổi

| Method | Endpoint | Auth | Request | Response | Error codes |
|---|---|---|---|---|---|
| GET | `/supplier/account/me` | JWT (SupplierGuard) | — | `SupplierMeResponse` | 401 |
| PATCH | `/supplier/account/profile` | JWT (SupplierGuard) | `{ supplierName, email }` | `{ success: true }` | 400, 401, 409 |

> Endpoint GET `/supplier/account/me` đã tồn tại — không thay đổi contract. Liệt kê ở đây để FE biết cả 2 cùng thuộc controller này.

**Request DTO chi tiết — PATCH /supplier/account/profile:**

```
supplierName: string  — required, IsNotEmpty, MaxLength(255)
email:        string  — required, IsNotEmpty, IsEmail, MaxLength(255)
```

**Response DTO chi tiết — GET /supplier/account/me (hiện tại, không thay đổi):**

```
id:           string  — supplier ID (bigint as string)
supplierCode: string  — mã nhà cung cấp, read-only
supplierName: string | null  — tên nhà cung cấp
email:        string  — địa chỉ email
status:       string  — trạng thái tài khoản (ACTIVE / INACTIVE)
lastLoginAt:  Date | null  — thời điểm đăng nhập lần cuối
createdAt:    Date   — thời điểm tạo tài khoản
```

**Response DTO chi tiết — PATCH /supplier/account/profile:**

```
success: boolean  — true khi update thành công
```

**Error codes:**

| Code | Trường hợp |
|---|---|
| 400 | supplierName rỗng hoặc email không đúng định dạng (class-validator) |
| 401 | Token không hợp lệ hoặc supplier không tồn tại |
| 409 | Email đã được sử dụng bởi supplier khác (unique constraint violation) |

> **Lưu ý OQ-1 (Open Question):** SPEC đang open OQ-1 — email có cần unique không. Hiện tại bảng `suppliers` đã có index unique partial `idx_suppliers_email_active` trên `email`. Nếu FE submit email trùng với supplier khác, PostgreSQL sẽ throw unique constraint violation — BE trả về 409. Hành vi này đã đúng với constraint DB hiện có — không cần thêm logic validate riêng. **Cần xác nhận với BA/PM về error message trả về khi 409.**

**Base URL:** `VITE_API_BASE_URL` env var — không hard-code trong FE.

---

## 4. Service Layer

### Method mới trong `SupplierAuthService`

```typescript
async updateProfile(
  supplierId: string,
  dto: SupplierUpdateProfileRequest,
): Promise<{ success: boolean }>
```

**Business logic flow:**

1. Query `supplierRepository.findOne({ where: { id: supplierId, deletedAt: IsNull() } })`
2. Nếu không tìm thấy → throw `UnauthorizedException` (dùng i18n key `supplier.auth.account_not_found`)
3. Gọi `supplierRepository.update({ id: supplierId }, { supplierName: dto.supplierName, email: dto.email })`
4. Nếu TypeORM throw lỗi unique constraint (PostgreSQL error code `23505`) → throw `ConflictException` với message phù hợp
5. Return `{ success: true }`

**Dependency:** Không có dependency mới — dùng lại `supplierRepository` đã inject.

---

## 5. Interface với repo khác (cross-repo)

FE `es-kitchen-web-supplier` gọi 2 REST endpoints:

- `GET /supplier/account/me` — load thông tin profile khi vào trang
- `PATCH /supplier/account/profile` — submit cập nhật profile

Không có WebSocket event. Không có Push notification.

---

## 6. Luồng xử lý chi tiết

```
FE (ProfilePage)
  │
  ├─ [mount] GET /supplier/account/me
  │     → SupplierAccountController.getMe()
  │     → SupplierAuthService.getSupplierForResponse(supplierId)
  │     → SELECT * FROM suppliers WHERE id = ? AND deleted_at IS NULL
  │     ← SupplierMeResponse { id, supplierCode, supplierName, email, status, lastLoginAt, createdAt }
  │
  ├─ [user click 編集] — FE chuyển sang edit mode, không gọi API
  │
  ├─ [user click 保存] PATCH /supplier/account/profile
  │     → [FE validate trước] supplierName not empty + email format valid
  │     → SupplierAccountController.updateProfile()
  │     → SupplierUpdateProfileRequest (class-validator)
  │     → SupplierAuthService.updateProfile(supplierId, dto)
  │     → UPDATE suppliers SET supplier_name = ?, email = ?, updated_at = NOW()
  │         WHERE id = ? AND deleted_at IS NULL
  │     ← { success: true }
  │
  └─ [sau khi PATCH thành công] FE tự invalidate query → re-fetch GET /supplier/account/me
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File liên quan | Rủi ro |
|---|---|---|
| Login — `buildMeResponse` trả về `SupplierMeResponse` trong login response | `supplier-auth.service.ts`, `supplier-auth.response.ts` | Không bị ảnh hưởng — method mới `updateProfile` độc lập, không chạm `buildMeResponse` |
| Change Password — dùng `SupplierAuthService` | `supplier-account.controller.ts` | Không bị ảnh hưởng — thêm PATCH endpoint riêng, không sửa method `changePassword` |
| Unique email index `idx_suppliers_email_active` | `supplier.entity.ts` | PATCH email mới phải bypass index nếu supplier tự submit lại email cũ của mình — trường hợp này an toàn vì update cùng row không vi phạm unique constraint partial |
| Refresh token — `updateRefreshToken` dùng `email` làm key tìm | `supplier-auth.service.ts` | **Cần chú ý:** nếu supplier đổi email, `updateRefreshToken` sau đó sẽ không tìm thấy row cũ. Tuy nhiên flow refresh token tìm bằng email từ JWT payload (email cũ trước khi đổi) — có thể gây lỗi sau khi đổi email. **Khuyến nghị:** sau khi `updateProfile` đổi email thành công, FE nên logout Supplier và yêu cầu đăng nhập lại. Cần xác nhận với BA/PM về OQ-3. |
