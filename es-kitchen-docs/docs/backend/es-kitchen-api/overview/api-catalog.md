# es-kitchen-api — API Catalog

> Overview của REST endpoints. Chi tiết endpoint (path, method, request/response schema) → **đọc Swagger doc** đang deploy trên môi trường DEV/Staging (7 doc riêng, xem bên dưới).
> File này chỉ tổng hợp **module → controller list** để orient nhanh.

---

## Kiến trúc — 8 module theo role

| Module | Actor | Prefix (điển hình) | JWT secret | Guard |
|---|---|---|---|---|
| `admin/` | System Admin (E03) | `api/v*/admin/*` | `JWT_SECRET_ADMIN` | `JwtAuthGuard` + `PermissionGuard` |
| `admin-company/` | Company Admin (E02) | `api/v*/admin-company/*` | `JWT_SECRET_COMPANY` | `JwtAuthGuard` |
| `user/` | End User Mobile (E01) + Web (E07) | `api/v*/user/*` | `JWT_SECRET_USER` | `JwtAuthGuard` / `OptionalJwtAuthGuard` (guest) |
| `supplier/` | Supplier (E04) | `api/v*/supplier/*` | `JWT_SECRET_SUPPLIER` | `JwtAuthGuard` |
| `driver/` | Driver (E06) | `api/v*/driver/*` | `JWT_SECRET_DRIVER` | `JwtAuthGuard` |
| `deliverer/` | Delivery Partner (E05) | `api/v*/deliverer/*` | `JWT_SECRET_DELIVERER` | `JwtAuthGuard` |
| `ai-pro/` | Internal | — | Service token | Custom |
| `file-upload/` | Shared | `api/v*/file-upload/*` | Bất kỳ role JWT | `JwtAuthGuard` |

> **Versioning:** URI-based. Endpoint mặc định `VERSION_NEUTRAL`; opt-in `@Version('1')` để bind vào `v1/`.

---

## Swagger docs (7 documents)

Config: `config/swagger.config.ts`

| Doc | Path DEV | Include modules |
|---|---|---|
| Admin API | `/docs/admin` | `AdminModule` |
| Admin Company API | `/docs/admin-company` | `AdminCompanyModule` |
| User API | `/docs/user` | `UserModule` |
| Supplier API | `/docs/supplier` | `SupplierModule` |
| Driver API | `/docs/driver` | `DriverModule` |
| Deliverer API | `/docs/deliverer` | `DelivererModule` |
| AI Pro API | `/docs/ai-pro` | `AiProModule` |

> **Nguồn sự thật cho FE/Mobile:** Swagger doc. Khi implement API integration, luôn export schema từ Swagger, không đoán từ file này.

---

## Controllers per module

### `admin/` — System Admin (44 controllers)

`account`, `admin-deliverer`, `admin-deliverer-change-request`, `admin-deliverer-contact`, `admin-deliverer-history`, `admin-driver`, `admin-driver-history`, `admin-delivery-block`, `admin-es-fee`, `admin-quotation-request`, `admin-supplier`, `admin-supplier-master`, `admin-supplier-order`, `admin-supplier-order-detail`, `admin-supplier-change-request`, `admin-trouble-report`, `agency`, `app-version`, `auth`, `category`, `change-request`, `commission`, `company`, `company-order`, `contract`, `dashboard`, `discount`, `favorites-ranking`, `feedback`, `inventory-management`, `ip-whitelist`, `maintain-setting`, `material-order`, `menu`, `menu-order-report`, `notification`, `order-deadline-config`, `payment-method`, `permission`, `plan-master`, `product`, `product-tag`, `referral`, `referral-fee-plan`, `role`, `sales-analytics`, `service-option`, `survey`, `trial-request`.

#### Sub-module `admin/delivery/` (12 controllers)

`carrier-integration`, `delivery-address`, `delivery-block`, `delivery-calendar`, `delivery-company`, `delivery-cycle`, `delivery-cycle-assignment`, `delivery-date-change-request`, `picking-calendar`, `picking-unavailable-day`, `relay-destination`, `special-delivery-rule`, `thomas-integration`, `warehouse`.

#### Sub-module `admin/discard/` (1 controller)

`discard`.

#### Sub-module `admin/invoice/` (3 controllers)

`bill-one`, `bill-one-mock`, `company-invoice`.

---

### `admin-company/` — Company Admin (20 controllers)

`ai-suggestion`, `auth`, `category`, `change-request`, `company`, `company-registration`, `company-view`, `delivery-block`, `material-order`, `menu-order-report`, `menu-order`, `monthly-company-order`, `monthly-menu`, `order`, `payment-method`, `plan-master`, `product`, `product-tag`, `service-option`, `trial-request`, `user`, `wishlist-campaign`.

---

### `user/` — End User Mobile + Web (26 controllers)

`allergen`, `app-download`, `app-version`, `auth`, `cart`, `category`, `company-menu`, `company-qr`, `contact`, `elepay-webhook`, `favorite`, `feedback`, `health-check`, `legal`, `maintain`, `menu`, `notification`, `order`, `payment-method`, `product-review`, `refund`, `survey`, `user`, `user-preference`, `wishlist-campaign`.

---

### `supplier/` — Supplier (7 controllers)

`supplier-account`, `supplier-auth`, `supplier-delivery-schedule`, `supplier-notification`, `supplier-order`, `supplier-order-detail`, `supplier-self-service`.

---

### `driver/` — Driver (10 controllers)

`driver-account`, `driver-auth`, `driver-dashboard`, `driver-delivery`, `driver-delivery-list`, `driver-notification`, `driver-receipt`, `driver-trouble-report`, `driver-upload`.

---

### `deliverer/` — Delivery Partner (11 controllers)

`deliverer-account`, `deliverer-auth`, `deliverer-collection-report`, `deliverer-contact`, `deliverer-driver`, `deliverer-fee-change-request`, `deliverer-notification`, `deliverer-quotation-request`, `deliverer-self-service`, `deliverer-upload`, `delivery-block`.

---

### `ai-pro/` (1) và `file-upload/` (1)

`ai-pro`, `file-upload`.

---

## Đặc biệt — webhook + open endpoint

- **`elepay-webhook`** (`user/elepay-webhook`) — receive payment result từ elepay; guarded bởi `ElepayWebhookGuard` (signature verify) thay vì JWT.
- **`health-check`** (`user/health-check`) — public endpoint cho load balancer.
- **`app-download`**, **`app-version`**, **`legal`** — không cần auth, nhưng vẫn thuộc User module.

---

## Response envelope

Mọi endpoint trả về:

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": { ... }
}
```

Xem `patterns.md` #2 để biết cơ chế `TransformInterceptor`.

---

## Memory Update Gate

Khi thêm/đổi endpoint (path, method, response shape) → **cập nhật file này** phần module tương ứng, hoặc bổ sung ghi chú về endpoint đặc biệt (webhook, public, versioning bất thường).
