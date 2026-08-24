# es-kitchen-api — API Catalog

> Tổng hợp toàn bộ REST endpoints từ source code thực tế.  
> Cập nhật khi thêm/đổi endpoint — đây là nguồn sự thật duy nhất cho FE/Mobile.

---

## Kiến trúc module

| Module | Prefix | Guard | Client |
|---|---|---|---|
| `admin` | `/admin/...` | `AdminGuard` (JWT admin) | `es-kitchen-web-admin` (E03) |
| `admin-company` | `/company-admin/...` | `AdminCompanyGuard` (JWT company admin) | `es-kitchen-web-company` (E02) |
| `user` | `/...` hoặc `/auth/user/...` | `JwtAuthGuard` (JWT user) | `es-kitchen-payment-app` (E01) |
| `supplier` | `/supplier/...` | `SupplierGuard` (JWT supplier) | `es-kitchen-web-supplier` (E04) |
| `driver` | `/driver/...` | `DriverGuard` (JWT driver) | `es-kitchen-webapp-driver` (E06) |
| `deliverer` | `/deliverer/...` | `DelivererGuard` (JWT deliverer) | `es-kitchen-web-outsource-web-private` (E05) |
| `ai-pro` | `/ai-pro/...` | `AiProApiKeyGuard` (`x-api-key` header) | Internal AI integration |

> ⚠️ Prefix của `admin-company` là `/company-admin/...` (không phải `/admin-company/...`). Xác nhận trong `app.module.ts` `RouterModule.register`.

---

## Module: Admin (E03 — System Admin)

### Auth `/admin/auth`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/auth` | Login — trả về access/refresh token |
| POST | `/admin/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/admin/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/admin/auth/forgot-password/reset-password` | Đặt lại mật khẩu |
| POST | `/admin/auth/logout` | Logout — xóa refresh token |

### Companies `/admin/companies`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/companies` | Danh sách companies (phân trang, filter) |
| POST | `/admin/companies` | Tạo company mới |
| POST | `/admin/companies/bulk-issue-accounts` | Phát hành tài khoản hàng loạt |
| POST | `/admin/companies/export-qr` | Export QR code cho company |
| GET | `/admin/companies/import` | (CSV import flow) |
| POST | `/admin/companies/import` | Import company từ CSV |
| GET | `/admin/companies/:id/basic-info` | Thông tin cơ bản company |
| PATCH | `/admin/companies/:id/basic-info` | Cập nhật thông tin cơ bản |
| GET | `/admin/companies/:id/contracts` | Danh sách contract của company |
| GET | `/admin/companies/:id/contacts` | Thông tin liên hệ company |
| PATCH | `/admin/companies/:id/contacts` | Cập nhật thông tin liên hệ |
| GET | `/admin/companies/:id/history` | Lịch sử thay đổi company |
| DELETE | `/admin/companies/:id` | Xóa company (soft delete) |

### Contracts `/admin/contracts`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/contracts` | Danh sách contracts (phân trang, filter) |
| GET | `/admin/contracts/:id` | Chi tiết contract |
| PATCH | `/admin/contracts/:id` | Cập nhật contract |
| GET | `/admin/contracts/:id/payment` | Thông tin thanh toán contract |
| PATCH | `/admin/contracts/:id/payment` | Cập nhật thanh toán contract |
| GET | `/admin/contracts/:id/equipments` | Thiết bị trong contract |
| PATCH | `/admin/contracts/:id/equipments` | Cập nhật thiết bị |
| GET | `/admin/contracts/:id/history` | Lịch sử thay đổi contract |

### Accounts `/admin/accounts`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/accounts/me` | Profile admin đang đăng nhập |
| GET | `/admin/accounts/me/permissions` | Danh sách permissions của admin hiện tại (flatPermissions + groups) |
| GET | `/admin/accounts` | Danh sách accounts (phân trang, filter theo tab ADMIN/COMPANY/USER) |
| POST | `/admin/accounts` | Tạo admin account mới (Cognito + email gửi credentials) |
| GET | `/admin/accounts/:id` | Chi tiết account (cần query param `?tab=`) |
| PATCH | `/admin/accounts/:id` | Cập nhật admin account (sync Cognito) |
| PATCH | `/admin/accounts/user/:id` | Cập nhật user account (sync Cognito) |
| DELETE | `/admin/accounts/:id` | Xóa account soft delete (cần `?tab=`) |
| GET | `/admin/accounts/user/:userId/purchase-history` | Lịch sử mua hàng của user |

### Products `/admin/products`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/products` | Danh sách sản phẩm (phân trang, filter) |
| GET | `/admin/products/suppliers` | Danh sách suppliers |
| GET | `/admin/products/:id` | Chi tiết sản phẩm |
| PATCH | `/admin/products/:id` | Cập nhật sản phẩm |
| DELETE | `/admin/products/:id` | Xóa sản phẩm (soft delete) |
| GET | `/admin/products/:id/history` | Lịch sử thay đổi sản phẩm |
| POST | `/admin/products/import` | Import sản phẩm từ CSV |

### Orders `/admin/orders`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/orders` | Danh sách đơn hàng (phân trang, filter) |
| GET | `/admin/orders/:orderNumber` | Chi tiết đơn hàng |
| POST | `/admin/orders/:id/refund` | Hoàn tiền đơn hàng |

### Company Monthly Orders `/admin/company-orders`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/company-orders/generate` | Trigger thủ công sinh đơn tháng cho mọi company ACTIVE (idempotent) |
| GET | `/admin/company-orders` | Danh sách đơn tháng của các company (phân trang, filter) |
| GET | `/admin/company-orders/export-csv` | Export danh sách đơn tháng theo filter (CSV) |
| GET | `/admin/company-orders/:id` | Chi tiết đơn tháng + danh sách món |
| PUT | `/admin/company-orders/:id/items` | Admin chỉnh số lượng từng món theo từng lần giao |
| PATCH | `/admin/company-orders/:id/status` | Admin cập nhật trạng thái đơn tháng |
| POST | `/admin/company-orders/:id/memo` | Admin cập nhật memo/notes nội bộ cho đơn tháng |

### Materials & Material Orders

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/materials` | Danh sách nguyên liệu (master) |
| GET | `/admin/material-orders` | Danh sách material orders (phân trang, filter) |
| GET | `/admin/material-orders/:id` | Chi tiết material order |
| PUT | `/admin/material-orders/:id` | Admin cập nhật items của material order |
| PATCH | `/admin/material-orders/:id/status` | Admin cập nhật trạng thái material order |

### Sales Analytics `/admin/sales-analytics`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/sales-analytics/company` | Phân tích doanh thu theo company |
| GET | `/admin/sales-analytics/company/export-csv` | Export CSV phân tích theo company |
| GET | `/admin/sales-analytics/product` | Phân tích doanh thu theo sản phẩm |
| GET | `/admin/sales-analytics/product/export-csv` | Export CSV phân tích theo sản phẩm |

### Dashboard `/admin/dashboard`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/dashboard/monthly-sales` | Doanh thu theo tháng |
| GET | `/admin/dashboard/favorites-vs-sales` | So sánh yêu thích vs doanh thu |
| GET | `/admin/dashboard/sales-by-payment-method` | Doanh thu theo phương thức thanh toán |

### Reports `/admin/reports`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/reports/usage` | Báo cáo sử dụng menu theo tháng |
| GET | `/admin/reports/product-ranking` | Xếp hạng sản phẩm theo đơn đặt |

### Notifications `/admin/notifications`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/notifications/test-push` | Gửi push notification test |
| POST | `/admin/notifications/publish-menu` | Publish menu và gửi notification |

### Categories `/admin/categories`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/categories` | Danh sách categories (sorted theo sortBy) |
| POST | `/admin/categories` | Tạo category |
| PATCH | `/admin/categories/:id` | Cập nhật category |
| DELETE | `/admin/categories/:id` | Xóa category (không xóa được "全て") |

### Payment Methods `/admin/payment-methods`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/payment-methods` | Danh sách phương thức thanh toán |

### Menus `/admin/menus`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/menus` | Danh sách menus (filter theo year_month, type, status) |
| GET | `/admin/menus/:id` | Chi tiết menu |
| PATCH | `/admin/menus/:id` | Cập nhật menu |
| DELETE | `/admin/menus/:id` | Xóa menu (soft delete) |
| POST | `/admin/menus/import/preview` | Preview CSV import (multipart/form-data, max 10MB) |
| POST | `/admin/menus/import/confirm` | Xác nhận import menu |

### Favorites Ranking `/admin/favorites-ranking`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/favorites-ranking/latest-months` | Lấy danh sách tháng gần nhất có dữ liệu favorite |
| GET | `/admin/favorites-ranking` | Ranking sản phẩm theo lượt yêu thích (phân trang) |
| GET | `/admin/favorites-ranking/export` | Export CSV ranking (toàn bộ, không phân trang) |

### App Versions `/admin/app-versions`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/app-versions` | Danh sách app versions (phân trang, filter) |
| POST | `/admin/app-versions` | Tạo app version mới |
| PATCH | `/admin/app-versions/:id` | Cập nhật app version |
| DELETE | `/admin/app-versions/:id` | Xóa app version (soft delete) |

### Roles `/admin/roles`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/roles` | Danh sách roles (phân trang) |
| GET | `/admin/roles/:id` | Chi tiết role kèm permissions |
| POST | `/admin/roles` | Tạo role mới (có thể gắn permissions inline) |
| PATCH | `/admin/roles/:id` | Cập nhật role (có thể thay permissions inline) |
| DELETE | `/admin/roles/:id` | Xóa role |
| PUT | `/admin/roles/:id/permissions` | Gán permissions vào role (thay toàn bộ) |

### Permissions `/admin/permissions`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/permissions/matrix` | Permission matrix nhóm theo business domain (dùng để render UI) |

### IP Whitelist `/admin/ip-whitelists`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/ip-whitelists` | Danh sách IPs trong whitelist |
| POST | `/admin/ip-whitelists` | Thêm IP mới vào whitelist |
| DELETE | `/admin/ip-whitelists/:id` | Xóa IP khỏi whitelist |

### Maintain Settings `/admin/maintain-settings`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/maintain-settings` | Lấy cấu hình maintain cho tất cả platforms |
| GET | `/admin/maintain-settings/history` | Lịch sử thay đổi cấu hình maintain (phân trang) |
| PATCH | `/admin/maintain-settings/toggle` | Bật/tắt maintain mode cho platform |
| PATCH | `/admin/maintain-settings/edit` | Sửa title/content popup maintain |

### Order Deadline Configs `/admin/order-deadline-configs`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/order-deadline-configs` | Danh sách toàn bộ cấu hình deadline đặt hàng |
| POST | `/admin/order-deadline-configs` | Tạo cấu hình deadline mới |
| GET | `/admin/order-deadline-configs/effective` | Lấy deadline hiệu lực cho tháng/năm cụ thể |

### Supplier Master `/admin/supplier-masters`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/supplier-masters` | Danh sách supplier masters (phân trang, filter) |
| GET | `/admin/supplier-masters/export` | Export CSV danh sách suppliers (16 cột, UTF-8 BOM) |
| POST | `/admin/supplier-masters` | Tạo supplier master mới (status UNREGISTERED) |
| GET | `/admin/supplier-masters/:id` | Chi tiết supplier master |
| PUT | `/admin/supplier-masters/:id` | Cập nhật supplier master (thay toàn bộ addresses/contacts/products) |
| GET | `/admin/supplier-masters/:id/history` | Lịch sử thay đổi supplier master |
| DELETE | `/admin/supplier-masters/:id` | Xóa supplier master (soft delete, chặn 409 nếu có supplier_orders) |
| POST | `/admin/supplier-masters/accounts/issue` | Phát hành (hoặc reset) tài khoản Cognito cho nhiều suppliers |

### Supplier Accounts — Deprecated `/admin/accounts/suppliers`

> ⚠️ DEPRECATED — sẽ bỏ sau 1 sprint. Dùng `/admin/supplier-masters` thay thế.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/accounts/suppliers` | [DEPRECATED] Danh sách supplier accounts |
| GET | `/admin/accounts/suppliers/:id` | [DEPRECATED] Chi tiết supplier account |
| POST | `/admin/accounts/suppliers` | [DEPRECATED] Tạo supplier account |
| PATCH | `/admin/accounts/suppliers/:id` | [DEPRECATED] Cập nhật supplier account |
| DELETE | `/admin/accounts/suppliers/:id` | [DEPRECATED] Xóa supplier account |

### Drivers `/admin/drivers`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/drivers` | Danh sách driver accounts (phân trang, filter) |
| GET | `/admin/drivers/:id` | Chi tiết driver account |
| POST | `/admin/drivers` | Tạo driver account (Cognito + email credentials) |
| PATCH | `/admin/drivers/:id` | Cập nhật driver account (sync Cognito) |
| DELETE | `/admin/drivers/:id` | Xóa driver account (soft delete, Cognito revoked) |

### Deliverers `/admin/deliverers`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/deliverers` | Danh sách deliverer accounts (phân trang, filter) |
| GET | `/admin/deliverers/:id` | Chi tiết deliverer account |
| POST | `/admin/deliverers` | Tạo deliverer account mới |
| PATCH | `/admin/deliverers/:id` | Cập nhật deliverer account |
| DELETE | `/admin/deliverers/:id` | Xóa deliverer account (soft delete) |

### File Upload `/admin/files`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/files/presigned-upload-url` | Tạo presigned PUT URL cho client upload trực tiếp lên S3 |
| POST | `/admin/files/presigned-upload-urls` | Tạo nhiều presigned PUT URLs cùng lúc (tối đa 10 files) |

---

## Module: Admin-Company (E02 — Company Admin)

> Prefix thực tế: `/company-admin/...` (xác nhận trong `app.module.ts`).

### Auth `/company-admin/auth`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/company-admin/auth/login` | Login company admin |
| POST | `/company-admin/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/company-admin/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/company-admin/auth/forgot-password/confirm` | Đặt lại mật khẩu |

### Users `/company-admin/users`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/users/linked` | Danh sách users đã link với company |
| GET | `/company-admin/users/linked/:userCode` | Chi tiết user theo userCode |
| DELETE | `/company-admin/users/linked/:userCode` | Unlink user khỏi company |
| POST | `/company-admin/users/linked/:userCode/restrict` | Hạn chế user |
| POST | `/company-admin/users/linked/:userCode/unrestrict` | Gỡ hạn chế user |
| GET | `/company-admin/users/linked/:userCode/purchase-history` | Lịch sử mua hàng của user |

### Orders `/company-admin/orders`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/orders` | Danh sách đơn hàng lẻ (E01) của company |
| GET | `/company-admin/orders/export` | Export CSV đơn hàng lẻ |
| GET | `/company-admin/orders/summary` | Tổng hợp doanh thu |
| GET | `/company-admin/orders/:orderNumber` | Chi tiết đơn hàng lẻ |

### Company Monthly Orders `/company-admin/company-orders`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company-orders` | Danh sách đơn tháng của company (phân trang, filter) |
| POST | `/company-admin/company-orders` | Tạo đơn tháng mới |
| GET | `/company-admin/company-orders/:id` | Chi tiết đơn tháng + items |
| PUT | `/company-admin/company-orders/:id/items` | Cập nhật số lượng items |
| POST | `/company-admin/company-orders/:id/submit` | Submit đơn tháng |
| POST | `/company-admin/company-orders/:id/import-csv` | Import items từ CSV (multipart/form-data, max 10MB) |

### Materials `/company-admin/materials` & `/company-admin/material-orders`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/materials` | Danh sách nguyên liệu (master) |
| GET | `/company-admin/material-orders` | Danh sách material orders của company |
| POST | `/company-admin/material-orders` | Tạo hoặc thay thế material order cho tháng |
| GET | `/company-admin/material-orders/:id` | Chi tiết material order |
| PUT | `/company-admin/material-orders/:id` | Cập nhật items của material order |
| POST | `/company-admin/material-orders/:id/submit` | Submit material order |

### Monthly Menus `/company-admin/monthly-menus`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/monthly-menus/current` | Menu hiện tại và tháng kế tiếp (theo query tháng/năm) |

### Reports `/company-admin/reports`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/reports/usage` | Báo cáo sử dụng menu theo tháng (scoped by company) |
| GET | `/company-admin/reports/product-ranking` | Xếp hạng sản phẩm theo đơn đặt (scoped by company) |

### Company `/company-admin/company`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company/me` | Thông tin company đang quản lý |

### Payment Methods `/company-admin/payment-methods`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/payment-methods` | Danh sách phương thức thanh toán |

---

## Module: User (E01 — Mobile App)

### Auth `/auth/user`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/auth/user/login` | Login |
| POST | `/auth/user/logout` | Logout |
| POST | `/auth/user/register` | Đăng ký tài khoản |
| POST | `/auth/user/verify-otp` | Xác thực OTP đăng ký |
| POST | `/auth/user/resend-otp` | Gửi lại OTP |
| POST | `/auth/user/forgot-password` | Yêu cầu reset password |
| POST | `/auth/user/forgot-password/verify-otp` | Xác thực OTP reset password |
| POST | `/auth/user/reset-password` | Đặt lại mật khẩu |

### User Profile `/user`

| Method | Path | Guard | Mô tả |
|---|---|---|---|
| GET | `/user/me` | JwtAuthGuard | Profile user hiện tại |
| PUT | `/user/me` | JwtAuthGuard | Cập nhật profile |
| DELETE | `/user/me` | JwtAuthGuard | Xóa tài khoản (soft delete) |

### Orders `/user/orders`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/orders/checkout` | Đặt hàng — tạo order + payment |
| PUT | `/user/orders/:orderId/cancel` | Hủy đơn hàng |
| POST | `/user/orders/:orderId/retry-payment` | Thử thanh toán lại |
| GET | `/user/orders/validate-company` | Kiểm tra company hợp lệ |
| GET | `/user/orders/check-limit` | Kiểm tra giới hạn đặt hàng tháng |
| GET | `/user/orders/history` | Lịch sử đơn hàng |
| GET | `/user/orders` | Danh sách đơn hàng đang chờ |
| GET | `/user/orders/:id` | Chi tiết đơn hàng |

### Cart `/user/cart`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/cart` | Lấy giỏ hàng |
| DELETE | `/user/cart` | Xóa toàn bộ giỏ hàng |
| POST | `/user/cart/items` | Thêm sản phẩm vào giỏ |
| PUT | `/user/cart/items/:id` | Cập nhật số lượng sản phẩm |
| DELETE | `/user/cart/items/:id` | Xóa sản phẩm khỏi giỏ |
| GET | `/user/cart/reset-status` | Kiểm tra trạng thái reset giỏ hàng |
| POST | `/user/cart/reset-ack` | Xác nhận đã thấy thông báo reset |

### Menu `/user/menu`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/menu/products` | Danh sách sản phẩm trong menu hiện tại |
| GET | `/user/menu/products/:id` | Chi tiết sản phẩm theo id |
| GET | `/user/menu/products/jan/:janCode` | Tìm sản phẩm theo JAN code |

### Favorites `/user/favorites`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/favorites` | Danh sách sản phẩm yêu thích |
| POST | `/user/favorites/:productId` | Toggle yêu thích (thêm nếu chưa có, xóa nếu đã có) |

### Notifications `/user/notifications`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/notifications/device-token` | Đăng ký FCM device token |
| GET | `/user/notifications` | Danh sách notifications (phân trang) |
| GET | `/user/notifications/unread-count` | Số lượng notification chưa đọc |
| GET | `/user/notifications/:id` | Chi tiết notification |
| PUT | `/user/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/user/notifications/read-all` | Đánh dấu tất cả đã đọc |

### Refunds `/user/refunds`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/refunds` | Yêu cầu hoàn tiền |

### Payment Methods `/user/payment-methods`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/payment-methods` | Danh sách phương thức thanh toán (filter CASH theo company) |
| GET | `/user/payment-methods/my-default` | Phương thức thanh toán mặc định của user |
| PATCH | `/user/payment-methods/my-default` | Đặt phương thức thanh toán mặc định |
| GET | `/user/payment-methods/credit-cards` | Danh sách thẻ tín dụng đã lưu (Elepay) |
| POST | `/user/payment-methods/credit-card` | Thêm thẻ tín dụng (tạo Elepay source) |
| PUT | `/user/payment-methods/credit-cards/:sourceId` | Đặt thẻ tín dụng mặc định |
| DELETE | `/user/payment-methods/credit-cards/:sourceId` | Xóa thẻ tín dụng |

### Allergens `/user/allergens`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/allergens` | Danh sách allergens (sắp xếp theo sort ASC) |

### Categories `/user/categories`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/categories` | Danh sách categories |

### User Preferences `/user/preferences`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/preferences/cart-popup` | Kiểm tra có hiện popup xác nhận checkout không |
| POST | `/user/preferences/cart-popup/hide` | Ẩn popup trong 1 tháng |

### Legal `/user/legal` — Public (không cần auth)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/legal/terms` | Điều khoản dịch vụ hiện hành |
| GET | `/user/legal/privacy` | Chính sách bảo mật hiện hành |

### App Version `/app/version` — Public

| Method | Path | Mô tả |
|---|---|---|
| GET | `/app/version` | Kiểm tra phiên bản app (force/recommended update) |

### Public Endpoints — không cần auth

| Method | Path | Mô tả |
|---|---|---|
| GET | `/public/download` | 302 redirect đến App Store / Play Store theo `User-Agent` header |
| GET | `/public/maintain/status` | Kiểm tra trạng thái maintain cho mobile splash screen (`?platform=`) |

### Contact `/contact` — Optional auth

| Method | Path | Guard | Mô tả |
|---|---|---|---|
| POST | `/contact` | OptionalJwtAuthGuard | Gửi yêu cầu liên hệ (auth tùy chọn) |

### Elepay Webhooks `/user/elepay` — Internal

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/elepay/webhook` | Xử lý charge.* và refund.* events từ Elepay |
| POST | `/user/elepay/verification-credit-card` | Xử lý source.activated / source.inactivated |
| GET | `/user/elepay/verify-easy-code-payment` | Redirect handler sau khi thanh toán QR |
| GET | `/user/elepay/public-key` | Lấy Elepay public key |

### Health Check

| Method | Path | Mô tả |
|---|---|---|
| GET | `/health` | Health check endpoint |

---

## Module: Supplier (E04 — Supplier Web)

### Auth `/supplier/auth`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/supplier/auth/login` | Login supplier |
| POST | `/supplier/auth/refresh` | Refresh access token bằng refresh token |
| POST | `/supplier/auth/logout` | Logout (cần Bearer token) |
| POST | `/supplier/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/supplier/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/supplier/auth/forgot-password/reset-password` | Đặt lại mật khẩu (trả về JWT mới) |

### Account `/supplier/account`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/account/me` | Profile supplier đang đăng nhập |
| POST | `/supplier/account/change-password` | Đổi mật khẩu supplier |

### Orders `/supplier/orders`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/orders` | Danh sách supplier orders (phân trang, filter theo tháng/loại menu/status) |
| GET | `/supplier/orders/:id/export` | Export 1 supplier order ra CSV (UTF-8 BOM, 14 cột) |
| POST | `/supplier/orders/:id/provisional-order` | Đánh dấu các dòng detail là 仮発注 |
| POST | `/supplier/orders/:id/official-order` | Đánh dấu các dòng detail là 本発注 |
| GET | `/supplier/orders/:id` | Chi tiết supplier order + danh sách lines (phân trang, filter) |

### Order Details `/supplier/order-details`

| Method | Path | Mô tả |
|---|---|---|
| PUT | `/supplier/order-details/:detailId` | Cập nhật 1 dòng detail (provisional/official qty, stock, expiry) |
| DELETE | `/supplier/order-details/:detailId` | Soft delete 1 dòng detail |

### Notifications `/supplier/notifications`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/notifications` | Danh sách notifications (cursor pagination, filter theo tab ALL/IMPORTANT/NEWS) |
| PATCH | `/supplier/notifications/:id/read` | Đánh dấu 1 notification đã đọc |

---

## Module: Driver (E06 — Driver Web App)

### Auth `/driver/auth`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/driver/auth/login` | Login driver |
| POST | `/driver/auth/refresh` | Refresh access token |
| POST | `/driver/auth/logout` | Logout (cần Bearer token) |
| POST | `/driver/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/driver/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/driver/auth/forgot-password/reset-password` | Đặt lại mật khẩu (trả về JWT mới) |

### Account `/driver/account`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/account/me` | Profile driver đang đăng nhập |
| POST | `/driver/account/change-password` | Đổi mật khẩu driver |

---

## Module: Deliverer (E05 — Outsource/Internal Web)

### Auth `/deliverer/auth`

| Method | Path | Mô tả |
|---|---|---|
| POST | `/deliverer/auth/login` | Login deliverer |
| POST | `/deliverer/auth/refresh` | Refresh access token |
| POST | `/deliverer/auth/logout` | Logout (cần Bearer token) |
| POST | `/deliverer/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/deliverer/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/deliverer/auth/forgot-password/reset-password` | Đặt lại mật khẩu (trả về JWT mới) |

### Account `/deliverer/account`

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/account/me` | Profile deliverer đang đăng nhập |
| POST | `/deliverer/account/change-password` | Đổi mật khẩu deliverer |

---

## Module: AI-Pro (Internal Integration)

| Method | Path | Guard | Mô tả |
|---|---|---|---|
| GET | `/ai-pro/dataset` | `AiProApiKeyGuard` (`x-api-key` header) | Lấy dataset menu recommendation. `?format=csv` → zip file; mặc định → JSON |

---

## Quy tắc đặt endpoint

- Admin endpoints: `GET /admin/<resource>s` → list, `GET /admin/<resource>s/:id` → detail
- Company Admin prefix: `/company-admin/...` (không phải `/admin-company/...`)
- Supplier/Driver/Deliverer: prefix riêng, guard riêng, không dùng chung với admin
- User endpoints: prefix không có module (mount trực tiếp ở root `""`) — ví dụ `/user/me`, `/auth/user/login`
- Webhook routes không expose trong Swagger (`@ApiExcludeEndpoint()`)
- Public routes (không auth): dùng `@Public()` decorator

---

> Cập nhật file này mỗi khi thêm/đổi/xóa controller method.
