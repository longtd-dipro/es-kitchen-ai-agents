---
name: project-codebase-map
description: Bản đồ source code es-kitchen-repository (7 repo + API) tại 2026-10-16 — module/controller/entity, stack thực tế, điểm lệch và rủi ro; Tech Lead đọc trước khi thiết kế để khỏi đoán
metadata:
  type: project
---

Snapshot 2026-10-16, đồng bộ từ source (branch develop). Chi tiết ở MkDocs: `es-kitchen-docs/docs/{backend,frontend,mobile}/*/overview/`. Khi source đổi → cập nhật file docs trước, rồi sửa map này.

## Revision
| Repo | SHA | Ghi chú |
|---|---|---|
| es-kitchen-api (E-all) | 4ca4dcd9 | file untracked: supplier/user request-response mới |
| es-kitchen-payment-app (E01) | 71d89b8 | |
| es-kitchen-web-admin (E03) | 633b2b7 | |
| es-kitchen-web-company (E02) | fddcaef | commit cuối 2026-06-25; `vite.config.ts` port 3002 chưa commit |
| es-kitchen-web-supplier (E04) | 57c8179 | `pages/profile`, `profile.service.ts` chưa commit, chưa vào router |
| es-kitchen-web-outsource-web-private (E05) | 9b0e677 | |
| es-kitchen-webapp-driver (E06) | 62b870a | |
| es-kitchen-webapp-payment (E07) | 4bee823 | |

## Backend — es-kitchen-api (NestJS 11, TypeORM 0.3, PostgreSQL)
- 28 `*.module.ts`, 180 file controller (186 class), **1024 route** (không có `/api/v1`, versioning VERSION_NEUTRAL), **224 entity** (đều ở `src/entities/`), **303 migration** (`database/migrations/`). Không có Redis, không có queue lib; mail dùng outbox `menu_publish_mail`.
- Route theo module (RouterModule prefix · portal · controller class · route):
  | Module | Prefix | Portal | Controller | Route |
  |---|---|---|---|---|
  | admin | `/admin` | E03 | 91 | 642 |
  | admin-company | `/company-admin` | E02 | 34 | 134 |
  | user | (rỗng) | E01 + E07 | 25 | 81 |
  | deliverer | `/deliverer` | E05 | 11 | 64 |
  | supplier | `/supplier` | E04 | 10 | 51 |
  | driver | `/driver` | E06 | 10 | 37 |
  | ai-pro | `/ai-pro` (x-api-key) | — | 1 | 1 |
  | hubspot-agent | `/hubspot-agent` (api-key + throttler) | — | 1 | 1 |
  | file-upload / mail | `/files` (+`/admin/files`) · `/mail` | shared | 1 + 1 | 2 + 7 |
- `commons/utiliz`: ai-suggestion, bill-one, code-generator, company-order-publish, driver-notify, elepay, fcm-firebase, hubspot, mail, menu-publish-notify, private-attachment, stock.
- Pattern: `@Public`, `@BlockGuest`+`GuestRestrictionGuard`, `@Permissions`, `@PostgreLock` (cho cron), session ledger `sid`+`verifyAndTouch`, socket namespace `/admin` (AuthSessionGateway), `http/requests|responses`, `BaseSearchRequest` + `ALLOWED_ORDER_BY`, `@Cron`.
- DB theo domain (224 bảng): Delivery 51 · Company&Contract 32 · Menu&Product 24 · Inventory&Equipment 22 · Supplier&Purchasing 21 · User&Auth 18 · Order&Payment 17 · Notification/Survey 15 · RBAC&System 13 · Agency 11. Đổi tên: `product_history→product_histories`, `product_in_stock→products_in_stock`, `user_company_history→user_company_histories`.

## Rủi ro / lệch đã xác minh bằng code (cần Tech Lead/PM quyết)
1. **`MailController` (`/mail/*`, 7 route gồm send, providers/switch) không có guard**, `MailModule` được import ở driver/admin/deliverer/stock; không có `APP_GUARD` toàn cục → endpoint gửi mail không cần đăng nhập.
2. **`PermissionsGuard` không được áp dụng** (chỉ là provider trong AdminModule); `@Permissions()` là metadata suông, controller ghi "RBAC deferred" — chỉ `AdminGuard` có hiệu lực.
3. `src/auth/auth.controller.ts` (4 route `/auth/*`) thuộc `AuthModule` không được import ở đâu → không mount.
4. Schema: `synchronize:false`, 223/224 entity có migration; **chỉ `ProductInStock` là stub rỗng** (không PK, không bảng, không ai import). (Con số '22 entity thiếu migration' ghi trước đó là báo động giả — migration dùng hằng số tên bảng.) Bảng mồ côi: `company_wishlist_selected_products`, `service_option_prices`, `equipment_model_prices`. `orders`/`order_details`/`payments` thiếu index cột lọc/join (`company_id`, `status`, `created_at`, `order_id`).
5. Endpoint đã gỡ khỏi source: `/admin/order-deadline-configs*`, `GET /admin/companies/import`; `/health` → `/health-check`.

## Frontend (cùng stack React 19 / Vite / AntD 6 / RTK / TanStack Query v5 nếu không ghi khác)
| Repo | Quy mô | Điểm riêng |
|---|---|---|
| E03 admin | 115 page, 121 lazy route, 52 service | Quill (không TipTap), @dnd-kit, socket + SessionEndedModal; alias `@assets` trỏ `src/assets` không tồn tại (thật là `src/statics`) |
| E02 company | 23 route, 10 domain | Chỉ slice `auth`, không permission guard; service auth/account/sales/user/error-report gọi API thật, **contract/disposal/menu-order/prepared-shipping/delivery-schedule là mock FE-only**; prefix API `/admin-company/...` trong docs cũ không có trong `src/` |
| E04 supplier | 15 route, Vite 8 | order/menu dùng API thật; chỉ `shipping.service.ts` còn fake; SessionExpiredModal |
| E05 outsource | 19 route, Vite 8 | primary `#1a7f37`, 7 mục NAV, không có test, permission `useCan` |
| E06 driver | 14 route, mobile-first | shadcn/Base UI + zustand; tab マニュアル mở PDF ngoài; `/orders` là placeholder; 3 loại giao (ES 5 bước + scanner, COOL, Warehouse) |
| E07 webapp-payment | 15 route, PWA | cart **server-side** `/user/cart*`; zxing quét barcode JAN; elepay `/orders/status`; guest-first `/auth/user/guest`; `MenuPage.tsx` không được route (nghi dead code) |

## Mobile — E01 es-kitchen-payment-app (Flutter, Dart ^3.10.8)
hooks_riverpod 3.0.1, auto_route 11.1.0, retrofit 4.9.2 + dio 5.9.2, elepay_flutter 3.5.2, version 0.1.1+9. 35 `@RoutePage`, 26 thư mục feature, 19 thư mục model, `app_api` ~71 method. Model là `@JsonSerializable` (**không** freezed). `SocketService` còn trong code nhưng **không ai gọi**; kết quả thanh toán lấy qua `OrderStatusRetryMixin` (3 lần, 2s, khi resume). Push FCM điều hướng theo `data['route']`. `main.dart` vẫn load `.env` cố định dù có `AppFlavor.envFileName`.

## Chưa xác minh
Tên Firebase project, danh sách key env mobile, thuật toán hash refresh token (BE), phân domain của vài bảng (`holidays`, `batch_job_runs`, `thomas_*` đang xếp vào Delivery), guard toàn cục ngoài `APP_GUARD`.

Liên quan: [[project_es_station_requirements]]
