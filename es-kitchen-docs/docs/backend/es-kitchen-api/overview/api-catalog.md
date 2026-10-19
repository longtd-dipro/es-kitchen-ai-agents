# es-kitchen-api — API Catalog

> **Nguồn:** `es-kitchen-api@4ca4dcd9` (branch `develop`) — đồng bộ ngày 2026-10-16.
> **Tổng:** 1024 endpoint mount (1022 decorator `@Get/@Post/@Patch/@Put/@Delete` + 2 do `FileUploadController` mount 2 nơi) · 185 controller class trong 180 file (179 `*.controller.ts` + `order.controler.ts` viết sai chính tả) · 1 file spec bị bỏ qua.
> Cập nhật khi thêm/đổi endpoint — đây là nguồn sự thật duy nhất cho FE/Mobile.
> Cách sinh: quét decorator trong `src/**`, ghép prefix `RouterModule` (xem `app.module.ts`) + `@Controller(...)` + path method. Không có global prefix (`app.setGlobalPrefix` không dùng); versioning URI `api/v` với `VERSION_NEUTRAL` nên path **không** có `/api/v1`.
> Cột **Mô tả**: ưu tiên mô tả cũ của catalog, sau đó `@ApiOperation.summary` (giữ nguyên ngôn ngữ trong source: Anh/Nhật/Việt), sau đó JSDoc, cuối cùng là tên method dạng `` `tenMethod()` `` khi source không có mô tả (539 dòng). Hậu tố `[Public]` / `[Guard: X]` = route khác guard của controller.

---

## Kiến trúc module

| Module | Prefix (RouterModule) | Guard chính | Client | Endpoint |
|---|---|---|---|---|
| `admin` | `/admin/...` | `AdminGuard` (JWT admin) | `es-kitchen-web-admin` (E03) | 642 |
| `admin-company` | `/company-admin/...` | `AdminCompanyGuard` (JWT company admin) | `es-kitchen-web-company` (E02) | 134 |
| `user` | `` (root) — `/user/...`, `/auth/user/...` | `JwtAuthGuard` (JWT user) | `es-kitchen-payment-app` (E01) | 81 |
| `supplier` | `/supplier/...` | `SupplierGuard` (JWT supplier) | `es-kitchen-web-supplier` (E04) | 51 |
| `driver` | `/driver/...` | `DriverGuard` (JWT driver) | `es-kitchen-webapp-driver` (E06) | 37 |
| `deliverer` | `/deliverer/...` | `DelivererGuard` (JWT deliverer) | `es-kitchen-web-outsource-web-private` (E05) | 64 |
| `ai-pro` | `/ai-pro/...` | `AiProApiKeyGuard` (`x-api-key`) | Internal AI integration | 1 |
| `hubspot-agent` | `/hubspot-agent/...` | `HubspotAgentApiKeyGuard` + throttler | HubSpot AI agent (server-to-server) | 1 |
| `file-upload`, `mail` (ngoài RouterModule) | `/files`, `/mail` | xem mục cuối | dùng chung | 9 |
| `auth` (`src/auth`) | `/auth` | — | **không mount** | 4 |

> Prefix của `admin-company` là `/company-admin/...` (không phải `/admin-company/...`).
> Các sub-module của admin (`collection`, `discard`, `invoice`, `stock`) **không** nằm trong `RouterModule`; controller của chúng tự khai báo prefix `admin/...` trong `@Controller`, nên path cuối vẫn là `/admin/...`.
> Một số controller nằm trong thư mục `modules/admin/...` nhưng được đăng ký ở `AdminCompanyModule` (vd. `CompanyDeliveryCalendarController`) → path `/company-admin/...`. Mục "Module" ở trên theo module **đăng ký**, không theo thư mục.
> `{N} endpoint · {M} controller` ở đầu mỗi mục = số route / số controller class mount trong module đó.

---

## Module: Admin (E03 — System Admin)

> 642 endpoint · 91 controller.

### AW_CONS_009 - ES Fee & Region Management `/admin`

> `AdminEsFeeController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/deliverers/:id/es-fees` | AW_CONS_009 - Get ES fee list for a deliverer |
| PUT | `/admin/deliverers/:id/es-fees` | AW_CONS_009 - Save ES fees (replace-all) |
| GET | `/admin/regions/prefectures` | Get prefecture list (47 都道府県) |
| GET | `/admin/regions/cities` | Get city list by prefecture |
| GET | `/admin/regions/towns` | Get town list by prefecture + city |

### Equipment Loans `/admin`

> `EquipmentLoanController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/companies/:id/equipment-loans` | `branchLoans()` |
| GET | `/admin/contracts/:id/equipment-moves` | `getMoves()` |
| POST | `/admin/contracts/:id/equipment-moves` | `addMove()` |
| PATCH | `/admin/contracts/:id/equipment-moves/:moveId` | `updateMove()` |
| DELETE | `/admin/contracts/:id/equipment-moves/:moveId` | `deleteMove()` |
| GET | `/admin/contracts/:id/equipment-schedule` | 設置・引揚の予定 of a monthly contract |
| PATCH | `/admin/contracts/:id/equipment-schedule` | `updateSchedule()` |

### Admin - Inventory, Materials and Equipment `/admin`

> `InventoryManagementController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/material-master` | `materials()` |
| POST | `/admin/material-master` | `createMaterial()` |
| PATCH | `/admin/material-master/:id` | `updateMaterial()` |
| DELETE | `/admin/material-master/:id` | `deleteMaterial()` |
| GET | `/admin/material-standard-sets` | `materialSets()` |
| POST | `/admin/material-standard-sets` | `createMaterialSet()` |
| GET | `/admin/material-standard-sets/:id` | `getMaterialSet()` |
| PATCH | `/admin/material-standard-sets/:id` | `updateMaterialSet()` |
| DELETE | `/admin/material-standard-sets/:id` | `deleteMaterialSet()` |
| GET | `/admin/material-allocations` | `materialAllocations()` |
| POST | `/admin/material-allocations` | `upsertMaterialAllocation()` |
| DELETE | `/admin/material-allocations/:id` | `deleteMaterialAllocation()` |
| GET | `/admin/equipment-types` | `equipmentTypes()` |
| POST | `/admin/equipment-types` | `createEquipmentType()` |
| PATCH | `/admin/equipment-types/:id` | `updateEquipmentType()` |
| DELETE | `/admin/equipment-types/:id` | `deleteEquipmentType()` |
| GET | `/admin/equipments` | `equipments()` |
| POST | `/admin/equipments` | `createEquipment()` |
| GET | `/admin/equipments/:id` | `getEquipment()` |
| GET | `/admin/equipments/:id/qr` | `getEquipmentQr()` |
| PATCH | `/admin/equipments/:id` | `updateEquipment()` |
| DELETE | `/admin/equipments/:id` | `deleteEquipment()` |
| GET | `/admin/inventory/items` | `inventoryItems()` |
| POST | `/admin/inventory/items` | `createInventoryItem()` |
| GET | `/admin/inventory/items/:id` | `getInventoryItem()` |
| PATCH | `/admin/inventory/items/:id` | `updateInventoryItem()` |
| DELETE | `/admin/inventory/items/:id` | `deleteInventoryItem()` |
| POST | `/admin/inventory/items/:id/transactions` | `createInventoryTransaction()` |
| GET | `/admin/inventory/history` | `inventoryHistory()` |
| GET | `/admin/inventory/export` | `exportInventory()` |
| POST | `/admin/inventory/import` | `importInventory()` |
| GET | `/admin/arrival-plans` | `arrivalPlans()` |
| POST | `/admin/arrival-plans` | `createArrivalPlan()` |
| GET | `/admin/arrival-plans/:id` | `getArrivalPlan()` |
| POST | `/admin/arrival-plans/:id/confirm` | `confirmArrivalPlan()` |
| GET | `/admin/inventory/thomas/product-master` | `exportProductMasterForThomas()` |
| GET | `/admin/inventory/thomas/arrival-instruction` | `exportArrivalInstructionForThomas()` |
| GET | `/admin/inventory/thomas/logs` | `thomasInventoryLogs()` |

### Admin - Material Orders `/admin`

> `AdminMaterialOrderController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/materials` | Danh sách nguyên liệu (master) |
| GET | `/admin/material-orders` | Danh sách material orders (phân trang, filter) |
| GET | `/admin/material-orders/:id` | Chi tiết material order |
| PUT | `/admin/material-orders/:id` | Admin cập nhật items của material order |
| PATCH | `/admin/material-orders/:id/status` | Admin cập nhật trạng thái material order |

### Account Management `/admin/accounts`

> `AccountController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/accounts/me` | Profile admin đang đăng nhập |
| GET | `/admin/accounts/me/permissions` | Danh sách permissions của admin hiện tại (flatPermissions + groups) |
| GET | `/admin/accounts` | Danh sách accounts (phân trang, filter theo tab ADMIN/COMPANY/USER) |
| DELETE | `/admin/accounts/:id` | Xóa account soft delete (cần `?tab=`) |
| GET | `/admin/accounts/:id` | Chi tiết account (cần query param `?tab=`) |
| GET | `/admin/accounts/user/:userId/purchase-history` | Lịch sử mua hàng của user |
| POST | `/admin/accounts` | Tạo admin account mới (Cognito + email gửi credentials) |
| PATCH | `/admin/accounts/:id` | Cập nhật admin account (sync Cognito) |
| PATCH | `/admin/accounts/user/:id` | Cập nhật user account (sync Cognito) |

### Supplier Account Management (Deprecated) `/admin/accounts/suppliers`

> `AdminSupplierController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/accounts/suppliers` | [DEPRECATED] Danh sách supplier accounts |
| GET | `/admin/accounts/suppliers/:id` | [DEPRECATED] Chi tiết supplier account |
| POST | `/admin/accounts/suppliers` | [DEPRECATED] Tạo supplier account |
| PATCH | `/admin/accounts/suppliers/:id` | [DEPRECATED] Cập nhật supplier account |
| DELETE | `/admin/accounts/suppliers/:id` | [DEPRECATED] Xóa supplier account |

### Agency Management `/admin/agencies`

> `AgencyController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/agencies` | `list()` |
| GET | `/admin/agencies/export-csv` | `exportCsv()` |
| POST | `/admin/agencies` | `create()` |
| GET | `/admin/agencies/:id` | `detail()` |
| PATCH | `/admin/agencies/:id` | `update()` |
| DELETE | `/admin/agencies/:id` | `remove()` |
| POST | `/admin/agencies/:id/plan-change` | `changePlan()` |
| GET | `/admin/agencies/:id/plan-history` | `planHistory()` |
| GET | `/admin/agencies/:id/payments` | `payments()` |
| GET | `/admin/agencies/:id/history` | `history()` |
| GET | `/admin/agencies/:id/referrals` | `referrals()` |

### Allergen (Admin) `/admin/allergens`

> `AdminAllergenController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/allergens` | `getAll()` |

### AW_AUTHEN_002_アプリバージョン管理_App_Version_Admin `/admin/app-versions`

> `AdminAppVersionController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/app-versions` | Danh sách app versions (phân trang, filter) |
| POST | `/admin/app-versions` | Tạo app version mới |
| PATCH | `/admin/app-versions/:id` | Cập nhật app version |
| DELETE | `/admin/app-versions/:id` | Xóa app version (soft delete) |

### Admin - Supplier Arrival Check (入荷検品) `/admin/arrival-checks`

> `SupplierArrivalCheckController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/arrival-checks` | List arrival checks with their short/over counts |
| POST | `/admin/arrival-checks/generate` | `generate()` |
| GET | `/admin/arrival-checks/export` | `exportCsv()` |
| POST | `/admin/arrival-checks/import` | `importCsv()` |
| GET | `/admin/arrival-checks/:id` | Arrival check detail with per-line differences |
| GET | `/admin/arrival-checks/:id/imports` | Upload history of one arrival check |
| PUT | `/admin/arrival-checks/:id/note` | `updateNote()` |

### Admin Authentication `/admin/auth`

> `AuthController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/auth` | Login — trả về access/refresh token |
| POST | `/admin/auth/verify-login-otp` | `verifyLoginOtp()` |
| POST | `/admin/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/admin/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/admin/auth/forgot-password/reset-password` | Đặt lại mật khẩu |
| POST | `/admin/auth/logout` | Logout — xóa refresh token [Guard: AdminGuard] |

### [DELIVERY] 要確認 (Review items) `/admin/batch-job-runs`

> `BatchJobRunController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/batch-job-runs` | `list()` |

### [ADMIN] Bill One `/admin/bill-one`

> `BillOneController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/bill-one/api-logs` | `listApiLogs()` |
| GET | `/admin/bill-one/deposits` | `listDeposits()` |
| GET | `/admin/bill-one/mail-templates` | `mailTemplates()` |
| GET | `/admin/bill-one/extension-fields` | Extension fields defined for issuing invoices |
| GET | `/admin/bill-one/destinations` | The 発行先 currently registered on Bill One |
| POST | `/admin/bill-one/destinations/sync` | `syncDestinations()` |
| POST | `/admin/bill-one/destinations` | Create one 発行先 on Bill One |
| GET | `/admin/bill-one/destinations/:uuid` | One 発行先 in full |
| PUT | `/admin/bill-one/destinations/:uuid` | `updateDestination()` |
| DELETE | `/admin/bill-one/destinations/:uuid` | `deleteDestination()` |
| GET | `/admin/bill-one/destinations/:uuid/virtual-bank-account` | `virtualBankAccount()` |

### [ADMIN] Bill One Mock (temporary) `/admin/bill-one/mock`

> `BillOneMockController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/bill-one/mock/status` | `status()` |
| GET | `/admin/bill-one/mock/cases` | `cases()` |
| GET | `/admin/bill-one/mock/calls` | `calls()` |
| GET | `/admin/bill-one/mock/invoices` | The invoices the mock is holding |
| GET | `/admin/bill-one/mock/destinations` | The 発行先 the mock is holding |
| POST | `/admin/bill-one/mock/scenarios` | `queueScenario()` |
| DELETE | `/admin/bill-one/mock/scenarios` | Drop every queued outcome |
| POST | `/admin/bill-one/mock/invoices/:uuid/withdraw` | `withdraw()` |
| POST | `/admin/bill-one/mock/payments` | `pay()` |
| DELETE | `/admin/bill-one/mock/payments` | `clearPayments()` |
| PATCH | `/admin/bill-one/mock/settings` | `configure()` |
| POST | `/admin/bill-one/mock/reset` | `reset()` |

### [DELIVERY] Cargo Boxes (個口) `/admin/cargo-boxes`

> `CargoBoxController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/cargo-boxes` | List and search cargo boxes (個口) |
| GET | `/admin/cargo-boxes/packing/:deliveryBlockId` | `packing()` |
| GET | `/admin/cargo-boxes/:id` | Get one cargo box with its contents |
| POST | `/admin/cargo-boxes` | `create()` |
| PUT | `/admin/cargo-boxes/:id` | Update a cargo box (送り状番号, 重量, サイズ…) |
| PUT | `/admin/cargo-boxes/:id/items` | `setItems()` |
| DELETE | `/admin/cargo-boxes/:id` | `remove()` |

### [DELIVERY] Carrier Integrations `/admin/carrier-integrations`

> `CarrierIntegrationController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/carrier-integrations` | List and search carrier integration configs |
| GET | `/admin/carrier-integrations/:id` | Get carrier integration detail |
| POST | `/admin/carrier-integrations` | Create carrier integration config |
| PUT | `/admin/carrier-integrations/:id` | Update carrier integration config |
| DELETE | `/admin/carrier-integrations/:id` | Deactivate carrier integration config |

### Category Management `/admin/categories`

> `CategoryController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/categories` | Danh sách categories (sorted theo sortBy) |
| GET | `/admin/categories/:id` | カテゴリ詳細 |
| POST | `/admin/categories` | Tạo category |
| PATCH | `/admin/categories/:id` | Cập nhật category |
| PATCH | `/admin/categories/:id/status` | `updateStatus()` |
| DELETE | `/admin/categories/:id` | Xóa category (không xóa được "全て") |

### Admin - Change Requests `/admin/change-requests`

> `ChangeRequestController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/change-requests` | `list()` |
| GET | `/admin/change-requests/:id` | `detail()` |
| POST | `/admin/change-requests/:id/decide` | `decide()` |
| POST | `/admin/change-requests/:id/approve` | `approve()` |
| POST | `/admin/change-requests/:id/reject` | Reject a request (both tabs). |

### [ADMIN] Collection `/admin/collections`

> `CollectionController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/collections` | Danh sách quản lý thu tiền. |
| GET | `/admin/collections/detail` | Tổng hợp theo tháng. |

### Agency Commission (明細) `/admin/commissions`

> `CommissionController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/commissions/generate` | `generate()` |

### Company Management `/admin/companies`

> `CompanyController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/companies/:id/branch-payments` | `branchPayments()` |
| GET | `/admin/companies` | Danh sách companies (phân trang, filter) |
| POST | `/admin/companies` | Tạo company mới |
| POST | `/admin/companies/bulk-issue-accounts` | Phát hành tài khoản hàng loạt |
| POST | `/admin/companies/export-qr` | Export QR code cho company |
| POST | `/admin/companies/export-csv` | `exportCsv()` |
| GET | `/admin/companies/:id/basic-info` | Thông tin cơ bản company |
| PATCH | `/admin/companies/:id/basic-info` | Cập nhật thông tin cơ bản |
| GET | `/admin/companies/:id/billing-terms` | `getBillingTerms()` |
| PATCH | `/admin/companies/:id/billing-terms` | `updateBillingTerms()` |
| GET | `/admin/companies/:id/parent-contract` | `getParentContract()` |
| GET | `/admin/companies/:id/contracts` | Danh sách contract của company |
| GET | `/admin/companies/:id/contacts` | Thông tin liên hệ company |
| PATCH | `/admin/companies/:id/contacts` | Cập nhật thông tin liên hệ |
| GET | `/admin/companies/:id/history-timeline` | `getHistoryTimeline()` |
| GET | `/admin/companies/:id/history` | Lịch sử thay đổi company |
| POST | `/admin/companies/import` | Import company từ CSV |
| DELETE | `/admin/companies/:id` | Xóa company (soft delete) |
| GET | `/admin/companies/:id/locations` | `listLocations()` |
| PATCH | `/admin/companies/:id/parent` | `assignParent()` |
| PATCH | `/admin/companies/:id/promote` | `promote()` |

### [DELIVERY] 拠点の受取不可日 (Site receive blocks) `/admin/companies/:siteId/receive-blocks`

> `SiteReceiveBlockController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/companies/:siteId/receive-blocks` | `list()` |
| POST | `/admin/companies/:siteId/receive-blocks` | `create()` |
| PATCH | `/admin/companies/:siteId/receive-blocks/:id` | Change a 受取不可日 (whole row) |
| POST | `/admin/companies/:siteId/receive-blocks/:id/cancel` | Cancel a 受取不可日 (kept as cancelled) |

### [ADMIN] Company Invoice `/admin/company-invoices`

> `CompanyInvoiceController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/company-invoices/generate` | `generate()` |
| GET | `/admin/company-invoices/generate-candidates` | `candidates()` |
| POST | `/admin/company-invoices/inspect` | `inspect()` |
| POST | `/admin/company-invoices/bulk-submit` | `bulkSubmit()` |
| POST | `/admin/company-invoices/reconcile` | `reconcile()` |
| GET | `/admin/company-invoices` | IN_INVOICE_001 — danh sách hoá đơn |
| GET | `/admin/company-invoices/:id` | IN_INVOICE_002 — chi tiết hoá đơn |
| DELETE | `/admin/company-invoices/:id` | `remove()` |
| POST | `/admin/company-invoices/:id/sync` | `sync()` |
| POST | `/admin/company-invoices/:id/dispatch` | `dispatch()` |
| POST | `/admin/company-invoices/:id/submit` | `submit()` |
| POST | `/admin/company-invoices/:id/reconcile` | `reconcileOne()` |

### [AW_ORDR] 法人月次注文管理_Company Monthly Order `/admin/company-orders`

> `CompanyOrderController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/company-orders/generate` | Trigger thủ công sinh đơn tháng cho mọi company ACTIVE (idempotent) |
| POST | `/admin/company-orders/lock-month` | `lockMonth()` |
| GET | `/admin/company-orders` | Danh sách đơn tháng của các company (phân trang, filter) |
| GET | `/admin/company-orders/export-csv` | Export danh sách đơn tháng theo filter (CSV) |
| GET | `/admin/company-orders/:id` | Chi tiết đơn tháng + danh sách món |
| PUT | `/admin/company-orders/:id/items` | Admin chỉnh số lượng từng món theo từng lần giao |
| PATCH | `/admin/company-orders/:id/status` | Admin cập nhật trạng thái đơn tháng |
| POST | `/admin/company-orders/:id/memo` | Admin cập nhật memo/notes nội bộ cho đơn tháng |

### Contract Billing `/admin/contracts`

> `ContractBillingController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/contracts/:id/billing` | `getBilling()` |
| POST | `/admin/contracts/:id/billing/rebuild` | `rebuild()` |
| POST | `/admin/contracts/:id/billing/fee-lines` | 行を追加 — a line typed by hand, to ① (e.g. a spot fee) or ② |
| PATCH | `/admin/contracts/:id/billing/fee-lines/:lineId` | `updateFeeLine()` |
| DELETE | `/admin/contracts/:id/billing/fee-lines/:lineId` | 行を削除 — a typed line, under the same conditions as a change |
| PUT | `/admin/contracts/:id/billing/advance-billing-month` | `setAdvanceBillingMonth()` |
| POST | `/admin/contracts/:id/billing/sections/:section/confirm` | `confirmSection()` |
| POST | `/admin/contracts/:id/billing/sections/:section/unconfirm` | `unconfirmSection()` |
| POST | `/admin/contracts/:id/billing/adjustments` | `addAdjustment()` |
| DELETE | `/admin/contracts/:id/billing/adjustments/:adjustmentId` | Delete an adjustment that is not on an invoice yet |
| GET | `/admin/contracts/:id/billing/difference` | `difference()` |
| POST | `/admin/contracts/:id/billing/difference/register` | `registerDifference()` |

### Contract Management `/admin/contracts`

> `ContractController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/contracts` | Danh sách contracts (phân trang, filter) |
| GET | `/admin/contracts/route-options` | `getRouteOptions()` |
| GET | `/admin/contracts/billing-schedule-preview` | `getBillingSchedulePreview()` |
| GET | `/admin/contracts/:id` | Chi tiết contract |
| PATCH | `/admin/contracts/:id` | Cập nhật contract |
| GET | `/admin/contracts/:id/billing-schedule` | `getBillingSchedule()` |
| GET | `/admin/contracts/:id/routes` | `getRoutes()` |
| PUT | `/admin/contracts/:id/routes` | `saveRoutes()` |
| GET | `/admin/contracts/:id/payment` | Thông tin thanh toán contract |
| PATCH | `/admin/contracts/:id/payment` | Cập nhật thanh toán contract |
| GET | `/admin/contracts/:id/equipments` | Thiết bị trong contract |
| PATCH | `/admin/contracts/:id/equipments` | Cập nhật thiết bị |
| GET | `/admin/contracts/:id/applicable-discounts` | `getApplicableDiscounts()` |
| GET | `/admin/contracts/:id/history` | Lịch sử thay đổi contract |
| POST | `/admin/contracts/:id/resume` | 復帰 — reactivate a SUSPENDED contract (admin direct) |
| POST | `/admin/contracts/:id/restore` | 復元 — restore a CANCELLED contract to ACTIVE (admin direct) |

### Dashboard `/admin/dashboard`

> `DashboardController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/dashboard/monthly-sales` | Doanh thu theo tháng |
| GET | `/admin/dashboard/favorites-vs-sales` | So sánh yêu thích vs doanh thu |
| GET | `/admin/dashboard/sales-by-payment-method` | Doanh thu theo phương thức thanh toán |

### Admin Deliverer Change Requests `/admin/deliverer-change-requests`

> `AdminDelivererChangeRequestController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/deliverer-change-requests` | `list()` |
| GET | `/admin/deliverer-change-requests/:id` | `detail()` |
| POST | `/admin/deliverer-change-requests/:id/approve` | `approve()` |
| POST | `/admin/deliverer-change-requests/:id/reject` | `reject()` |

### AW_CONSIGNMENT_004 - Deliverer Contacts & Account `/admin/deliverers`

> `AdminDelivererContactController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/deliverers/bulk-send-password` | Bulk send password emails to deliverers |
| GET | `/admin/deliverers/:id/contacts` | List deliverer contacts |
| POST | `/admin/deliverers/:id/contacts` | Create deliverer contact |
| PATCH | `/admin/deliverers/:id/contacts/:contactId` | Update deliverer contact |
| DELETE | `/admin/deliverers/:id/contacts/:contactId` | Delete deliverer contact |
| POST | `/admin/deliverers/:id/send-password` | Send password email to deliverer |

### AW_CONSIGNMENT_010 - Deliverer Change History `/admin/deliverers`

> `AdminDelivererHistoryController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/deliverers/:id/history` | `getHistory()` |

### Admin - Deliverer Management `/admin/deliverers`

> `AdminDelivererController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/deliverers` | Danh sách deliverer accounts (phân trang, filter) |
| GET | `/admin/deliverers/export` | `exportCsv()` |
| POST | `/admin/deliverers/import` | `importCsv()` |
| GET | `/admin/deliverers/:id` | Chi tiết deliverer account |
| POST | `/admin/deliverers` | Tạo deliverer account mới |
| PATCH | `/admin/deliverers/:id` | Cập nhật deliverer account |
| POST | `/admin/deliverers/:id/approve` | `approve()` |
| POST | `/admin/deliverers/:id/reject` | `reject()` |
| DELETE | `/admin/deliverers/:id` | Xóa deliverer account (soft delete) |

### [DELIVERY] Delivery Addresses `/admin/delivery-addresses`

> `DeliveryAddressController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-addresses` | List delivery addresses |
| POST | `/admin/delivery-addresses` | Create delivery address |
| PUT | `/admin/delivery-addresses/:id` | Update delivery address |
| DELETE | `/admin/delivery-addresses/:id` | Deactivate delivery address |

### OW_STAFF_DLV_001 - Admin Delivery Block Management `/admin/delivery-block-management`

> `AdminDeliveryBlockController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-block-management/:id/history` | `history()` |
| PATCH | `/admin/delivery-block-management/:id/result` | `editResult()` |
| GET | `/admin/delivery-block-management/:id/date-candidates` | `dateCandidates()` |
| PATCH | `/admin/delivery-block-management/:id/dates` | `changeDates()` |
| POST | `/admin/delivery-block-management/:id/trouble-actions` | `troubleAction()` |
| PATCH | `/admin/delivery-block-management/:id/confirm-date` | `confirmDate()` |
| POST | `/admin/delivery-block-management/:id/private-attachments` | `addPrivateAttachment()` |
| DELETE | `/admin/delivery-block-management/:id/private-attachments/:attachmentId` | `removePrivateAttachment()` |
| GET | `/admin/delivery-block-management` | `list()` |
| POST | `/admin/delivery-block-management` | `create()` |
| PATCH | `/admin/delivery-block-management/:id/assign-driver` | `assignDriver()` |
| PATCH | `/admin/delivery-block-management/:id/status` | `updateStatus()` |
| PATCH | `/admin/delivery-block-management/:id/recalculate-picking` | `recalculatePicking()` |
| POST | `/admin/delivery-block-management/:id/tracking` | `createTracking()` |
| GET | `/admin/delivery-block-management/:id/report` | `getReport()` |
| PUT | `/admin/delivery-block-management/:id/report` | `saveReport()` |
| GET | `/admin/delivery-block-management/:id/inventory-check` | `getInventoryCheck()` |
| PUT | `/admin/delivery-block-management/:id/inventory-check` | `saveInventoryCheck()` |
| GET | `/admin/delivery-block-management/:id` | `findById()` |
| PATCH | `/admin/delivery-block-management/:id` | `update()` |
| DELETE | `/admin/delivery-block-management/:id` | `softDelete()` |

### [DELIVERY] Delivery Blocks `/admin/delivery-blocks`

> `DeliveryBlockController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-blocks` | `list()` |
| GET | `/admin/delivery-blocks/export/mymaps-csv` | `exportMyMapsCsv()` |
| PATCH | `/admin/delivery-blocks/bulk-move` | `bulkMove()` |
| GET | `/admin/delivery-blocks/:id` | `detail()` |
| POST | `/admin/delivery-blocks` | `create()` |
| PUT | `/admin/delivery-blocks/:id` | `update()` |
| PATCH | `/admin/delivery-blocks/:id/status` | `updateStatus()` |
| PATCH | `/admin/delivery-blocks/:id/recalculate-picking` | `recalculatePicking()` |
| POST | `/admin/delivery-blocks/:id/assign` | `assign()` |
| POST | `/admin/delivery-blocks/:id/yamato/tracking` | Create a tracking row for Yamato/API integration |
| POST | `/admin/delivery-blocks/:id/tracking/sync` | `syncTracking()` |
| GET | `/admin/delivery-blocks/:id/reports` | `reports()` |
| POST | `/admin/delivery-blocks/:id/reports` | `createReport()` |

### [DELIVERY] Delivery Companies `/admin/delivery-companies`

> `DeliveryCompanyController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-companies` | List and search consignment delivery companies |
| GET | `/admin/delivery-companies/recommended` | List recommended delivery companies |
| GET | `/admin/delivery-companies/:id` | Get delivery company detail |
| POST | `/admin/delivery-companies` | Create consignment delivery company |
| PUT | `/admin/delivery-companies/:id` | Update consignment delivery company |
| DELETE | `/admin/delivery-companies/:id` | Deactivate consignment delivery company |
| POST | `/admin/delivery-companies/:id/share-status` | `shareStatus()` |

### [DELIVERY] Delivery Cycle Assignments `/admin/delivery-cycle-assignments`

> `DeliveryCycleAssignmentController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-cycle-assignments` | List delivery cycle assignments |
| POST | `/admin/delivery-cycle-assignments` | Assign a contract/company to a delivery cycle |
| PATCH | `/admin/delivery-cycle-assignments/:id/move` | Move a delivery cycle assignment |

### [DELIVERY] Delivery Cycle Setting `/admin/delivery-cycle-setting`

> `DeliveryCycleSettingController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-cycle-setting` | `get()` |
| GET | `/admin/delivery-cycle-setting/calendar` | `calendar()` |
| GET | `/admin/delivery-cycle-setting/undeliverable-slots` | `undeliverableSlots()` |
| GET | `/admin/delivery-cycle-setting/holidays` | `holidays()` |
| POST | `/admin/delivery-cycle-setting/preview` | `preview()` |
| PUT | `/admin/delivery-cycle-setting` | `save()` |

### [DELIVERY] Delivery Cycles `/admin/delivery-cycles`

> `DeliveryCycleController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-cycles` | List delivery cycles |
| POST | `/admin/delivery-cycles/auto-divide` | `autoDivide()` |

### [DELIVERY] Delivery Date Change Requests `/admin/delivery-date-change-requests`

> `DeliveryDateChangeRequestController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-date-change-requests` | `list()` |
| GET | `/admin/delivery-date-change-requests/pending-count` | `pendingCount()` |
| POST | `/admin/delivery-date-change-requests/bulk-approve` | `bulkApprove()` |
| GET | `/admin/delivery-date-change-requests/:id/alternatives` | `alternatives()` |
| GET | `/admin/delivery-date-change-requests/:id` | `detail()` |
| PATCH | `/admin/delivery-date-change-requests/:id` | `review()` |

### [DELIVERY] 承認済みの変更 (Delivery overrides) `/admin/delivery-overrides`

> `DeliveryOverrideController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-overrides` | `list()` |
| POST | `/admin/delivery-overrides/:id/cancel` | `cancel()` |

### [DELIVERY] Delivery Calendar `/admin/delivery-schedule`

> `DeliveryCalendarController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-schedule/calendar` | `calendar()` |

### [DELIVERY] Delivery Schedule `/admin/delivery-schedule`

> `DeliveryScheduleController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/delivery-schedule/calendar/month` | `month()` |
| GET | `/admin/delivery-schedule/calendar/week` | `week()` |
| GET | `/admin/delivery-schedule/calendar/day` | `day()` |
| GET | `/admin/delivery-schedule/export` | `exportCsv()` |
| GET | `/admin/delivery-schedule/move-candidates` | `moveCandidates()` |
| POST | `/admin/delivery-schedule/move` | `move()` |

### [ADMIN] Discard `/admin/discards`

> `DiscardController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/discards` | Danh sách nhập hàng hủy. |
| GET | `/admin/discards/:id` | Xem chi tiết + dùng cho form sửa. |
| PUT | `/admin/discards/:id` | Sửa (PUT toàn bộ items, backend diff theo id). |
| DELETE | `/admin/discards/:id` | Xoá cả báo cáo hủy (soft-delete + cascade items). |

### Discount Management `/admin/discounts`

> `DiscountController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/discounts` | List discounts (割引一覧) — search/filter/paginate |
| GET | `/admin/discounts/:id` | Discount detail (割引詳細) — header + value history |
| POST | `/admin/discounts` | Create a discount (割引登録) |
| PATCH | `/admin/discounts/:id` | Update a discount (割引編集) — values are append-only |
| PATCH | `/admin/discounts/:id/deactivate` | Deactivate a discount (割引無効化) — for in-use/with-history |
| PATCH | `/admin/discounts/:id/activate` | Re-activate a discount (有効化) |
| DELETE | `/admin/discounts/values/:valueId` | Soft-delete a value row (行削除) — blocked if it is 現行 |
| DELETE | `/admin/discounts/:id` | Delete a discount (削除) — blocked once applied; deactivate instead |

### MD02 - Driver Change History `/admin/drivers`

> `AdminDriverHistoryController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/drivers/:id/history` | MD02 - Get driver change history (paged) |

### MD01/MD02 - Driver Account Management `/admin/drivers`

> `AdminDriverController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/drivers` | Danh sách driver accounts (phân trang, filter) |
| GET | `/admin/drivers/:id` | Chi tiết driver account |
| POST | `/admin/drivers` | Tạo driver account (Cognito + email credentials) |
| GET | `/admin/drivers/:id/open-deliveries` | `getDriverOpenDeliveries()` |
| PATCH | `/admin/drivers/:id` | Cập nhật driver account (sync Cognito) |
| DELETE | `/admin/drivers/:id` | Xóa driver account (soft delete, Cognito revoked) |
| POST | `/admin/drivers/:id/send-password` | `sendPassword()` |

### Equipment Model Master `/admin/equipment-manufacturers`

> `EquipmentManufacturerController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/equipment-manufacturers` | `findAll()` |
| POST | `/admin/equipment-manufacturers` | Add a maker inline from the dropdown |
| PATCH | `/admin/equipment-manufacturers/:id` | `update()` |
| DELETE | `/admin/equipment-manufacturers/:id` | `remove()` |

### Equipment Model Master `/admin/equipment-models`

> `EquipmentModelController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/equipment-models` | `findAll()` |
| GET | `/admin/equipment-models/export` | `exportCsv()` |
| POST | `/admin/equipment-models/import` | `FileInterceptor()` |
| GET | `/admin/equipment-models/vending-presets` | `vendingPresets()` |
| POST | `/admin/equipment-models/images/presigned-upload-url` | `createImageUploadUrl()` |
| GET | `/admin/equipment-models/:id/history` | `findHistory()` |
| GET | `/admin/equipment-models/:id` | Model detail (機種マスタ詳細) |
| POST | `/admin/equipment-models` | `create()` |
| PATCH | `/admin/equipment-models/:id` | `update()` |
| DELETE | `/admin/equipment-models/:id` | Delete a model (削除) — soft delete |

### Favorites Ranking `/admin/favorites-ranking`

> `FavoritesRankingController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/favorites-ranking/latest-months` | Lấy danh sách tháng gần nhất có dữ liệu favorite |
| GET | `/admin/favorites-ranking` | Ranking sản phẩm theo lượt yêu thích (phân trang) |
| GET | `/admin/favorites-ranking/export` | Export CSV ranking (toàn bộ, không phân trang) |

### Agency Fee Payment `/admin/fee-payments`

> `FeePaymentController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/fee-payments` | `list()` |
| GET | `/admin/fee-payments/export-csv` | `exportCsv()` |
| GET | `/admin/fee-payments/:id` | `detail()` |
| PATCH | `/admin/fee-payments/:id` | `update()` |
| GET | `/admin/fee-payments/:id/history` | `history()` |

### Admin - Feedbacks `/admin/feedbacks`

> `FeedbackController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/feedbacks` | `list()` |

### File Upload `/admin/files`

> `FileUploadController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/files/presigned-upload-url` | Tạo presigned PUT URL cho client upload trực tiếp lên S3 |
| POST | `/admin/files/presigned-upload-urls` | Tạo nhiều presigned PUT URLs cùng lúc (tối đa 10 files) |

### [DELIVERY] Holiday Master `/admin/holidays`

> `HolidayController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/holidays` | 祝日マスタ: list by year or date range |
| POST | `/admin/holidays` | 祝日マスタ: register a national holiday |
| PATCH | `/admin/holidays/:date` | 祝日マスタ: rename a holiday |
| DELETE | `/admin/holidays/:date` | `remove()` |

### [DELIVERY] Thomas Integration `/admin/integrations/thomas`

> `ThomasIntegrationController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/integrations/thomas/export-shipping-instruction` | 出荷指示CSV — chỉ thị xuất hàng gửi kho Thomas |
| POST | `/admin/integrations/thomas/import-shipping-result` | `importShippingResult()` |
| POST | `/admin/integrations/thomas/export-shipping` | `exportShipping()` |
| POST | `/admin/integrations/thomas/import-record` | `importRecord()` |
| GET | `/admin/integrations/thomas/logs` | `logs()` |

### [AW_AUTHEN_002]_IP_Whitelist_Management `/admin/ip-whitelists`

> `IpWhitelistController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/ip-whitelists` | Danh sách IPs trong whitelist |
| POST | `/admin/ip-whitelists` | Thêm IP mới vào whitelist |
| DELETE | `/admin/ip-whitelists/:id` | Xóa IP khỏi whitelist |

### [AW_MAINTAIN_001]_Maintain_Admin `/admin/maintain-settings`

> `MaintainSettingController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/maintain-settings` | Lấy cấu hình maintain cho tất cả platforms |
| GET | `/admin/maintain-settings/history` | Lịch sử thay đổi cấu hình maintain (phân trang) |
| PATCH | `/admin/maintain-settings/toggle` | Bật/tắt maintain mode cho platform |
| PATCH | `/admin/maintain-settings/edit` | Sửa title/content popup maintain |

### Menu Management `/admin/menus`

> `MenuController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/menus` | Danh sách menus (filter theo year_month, type, status) |
| GET | `/admin/menus/export` | `exportMenus()` |
| POST | `/admin/menus/statistics/preview` | `previewMenuStatistics()` |
| GET | `/admin/menus/:id` | Chi tiết menu |
| GET | `/admin/menus/:id/statistics` | `getMenuStatistics()` |
| GET | `/admin/menus/:id/export` | `exportMenu()` |
| PATCH | `/admin/menus/:id` | Cập nhật menu |
| DELETE | `/admin/menus/:id` | Xóa menu (soft delete) |
| POST | `/admin/menus/import/preview` | Preview CSV import (multipart/form-data, max 10MB) |
| POST | `/admin/menus/import/confirm` | Xác nhận import menu |

### Admin - Bulk Notices `/admin/notices`

> `NoticeController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/notices` | `list()` |
| GET | `/admin/notices/plan-companies` | `planCompanies()` |
| GET | `/admin/notices/ordered-products` | `orderedProducts()` |
| GET | `/admin/notices/ordered-companies` | `orderedCompanies()` |
| GET | `/admin/notices/mail-sender` | `mailSender()` |
| GET | `/admin/notices/categories` | `listCategories()` |
| POST | `/admin/notices/categories` | `createCategory()` |
| DELETE | `/admin/notices/categories/:categoryId` | `removeCategory()` |
| GET | `/admin/notices/targets/companies` | `targetCompanies()` |
| GET | `/admin/notices/targets/app-users` | アプリユーザー の個別選択 |
| GET | `/admin/notices/targets/deliverers` | 委託配送先 の個別選択 |
| GET | `/admin/notices/targets/suppliers` | サプライヤー（仕入先） の個別選択 |
| GET | `/admin/notices/targets/drivers` | 配送スタッフ の個別選択 |
| GET | `/admin/notices/:id/email-deliveries` | `emailDeliveries()` |
| GET | `/admin/notices/:id` | 一斉お知らせ detail |
| POST | `/admin/notices/recipient-preview` | `recipientPreview()` |
| POST | `/admin/notices/preview` | `preview()` |
| POST | `/admin/notices` | `create()` |
| PATCH | `/admin/notices/:id` | `update()` |
| DELETE | `/admin/notices/:id` | `remove()` |
| POST | `/admin/notices/:id/stop` | `stop()` |
| POST | `/admin/notices/:id/cancel` | `cancel()` |
| POST | `/admin/notices/:id/publish` | `publish()` |

### Admin - Notifications `/admin/notifications`

> `NotificationController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/notifications/test-push` | Gửi push notification test |
| POST | `/admin/notifications/publish-menu` | Publish menu và gửi notification |

### [AW_SALES_001] 売上管理 the user `/admin/orders`

> `OrderController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/orders` | Danh sách đơn hàng (phân trang, filter) |
| GET | `/admin/orders/export` | Export orders to CSV |
| GET | `/admin/orders/summary` | Get order summary statistics |
| GET | `/admin/orders/:orderNumber` | Chi tiết đơn hàng |
| GET | `/admin/orders/:orderNumber/history` | `()` |
| PATCH | `/admin/orders/:orderNumber` | `()` |
| POST | `/admin/orders/:id/refund` | Hoàn tiền đơn hàng |

### Parent Contract Management `/admin/parent-contracts`

> `ParentContractController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/parent-contracts/billing-gaps` | `billingGaps()` |
| GET | `/admin/parent-contracts/:id` | `findById()` |
| PATCH | `/admin/parent-contracts/:id` | `update()` |
| GET | `/admin/parent-contracts/:id/generation` | `generation()` |
| GET | `/admin/parent-contracts/:id/children` | `listChildren()` |
| GET | `/admin/parent-contracts/:id/suspensions` | `listSuspensions()` |

### Payment Methods (Admin) `/admin/payment-methods`

> `AdminPaymentMethodController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/payment-methods` | Danh sách phương thức thanh toán |

### Permission Management `/admin/permissions`

> `PermissionController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/permissions/matrix` | Permission matrix nhóm theo business domain (dùng để render UI) |

### [DELIVERY] Picking Calendar `/admin/picking-calendar`

> `PickingCalendarController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/picking-calendar` | `getCalendar()` |

### [DELIVERY] Picking Unavailable Days `/admin/picking-unavailable-days`

> `PickingUnavailableDayController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/picking-unavailable-days` | `list()` |
| GET | `/admin/picking-unavailable-days/all` | `listAll()` |
| POST | `/admin/picking-unavailable-days` | `create()` |
| POST | `/admin/picking-unavailable-days/bulk` | `bulkCreate()` |
| DELETE | `/admin/picking-unavailable-days/:id` | `delete()` |

### Plan Master Management `/admin/plan-masters`

> `PlanMasterController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/plan-masters` | List plan masters (プランマスタ一覧) — search/filter/paginate |
| GET | `/admin/plan-masters/export` | `exportCsv()` |
| POST | `/admin/plan-masters/import` | `FileInterceptor()` |
| GET | `/admin/plan-masters/:id` | Plan master detail (プランマスタ詳細) |
| POST | `/admin/plan-masters` | Create a plan master (登録) — auto ES code + 基本比×倍 |
| PATCH | `/admin/plan-masters/:id` | Update a plan master (編集) — prices are append-only |
| DELETE | `/admin/plan-masters/prices/:priceId` | Soft-delete a price row (行削除) — blocked if 公開用/in use |
| DELETE | `/admin/plan-masters/:id` | Soft-delete a plan master (削除) — blocked if used by a contract |

### Product Tag Management `/admin/product-tags`

> `ProductTagController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/product-tags` | `getAll()` |
| POST | `/admin/product-tags` | 商品タグ登録 |
| PATCH | `/admin/product-tags/:id` | `update()` |
| DELETE | `/admin/product-tags/:id` | `delete()` |

### Product Management `/admin/products`

> `ProductController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/products` | Danh sách sản phẩm (phân trang, filter) |
| GET | `/admin/products/suppliers` | Danh sách suppliers |
| GET | `/admin/products/export` | `exportProducts()` |
| GET | `/admin/products/:id` | Chi tiết sản phẩm |
| GET | `/admin/products/:id/history` | Lịch sử thay đổi sản phẩm |
| PATCH | `/admin/products/:id` | Cập nhật sản phẩm |
| DELETE | `/admin/products/:id` | Xóa sản phẩm (soft delete) |
| POST | `/admin/products/import` | Import sản phẩm từ CSV |

### SV_SERV_001 - Quotation Request (見積依頼) `/admin/quotation-requests`

> `AdminQuotationRequestController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/quotation-requests` | SV_SERV_001 — danh sách yêu cầu báo giá |
| GET | `/admin/quotation-requests/masters` | Dữ liệu cho toàn bộ select của màn tạo/sửa |
| GET | `/admin/quotation-requests/company-defaults` | `companyDefaults()` |
| POST | `/admin/quotation-requests` | `create()` |
| GET | `/admin/quotation-requests/:id` | Chi tiết yêu cầu + bảng phản hồi |
| PUT | `/admin/quotation-requests/:id` | Lưu thay đổi phần thông tin yêu cầu |
| DELETE | `/admin/quotation-requests/:id` | Xoá mềm yêu cầu báo giá |
| POST | `/admin/quotation-requests/:id/deliverers` | `addDeliverers()` |
| DELETE | `/admin/quotation-requests/:id/deliverers/:delivererId` | `removeDeliverer()` |
| POST | `/admin/quotation-requests/:id/select` | `selectDeliverer()` |

### Referral Fee Plan Management `/admin/referral-fee-plans`

> `ReferralFeePlanController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/referral-fee-plans` | `list()` |
| GET | `/admin/referral-fee-plans/:id` | `detail()` |
| GET | `/admin/referral-fee-plans/:id/history` | `history()` |
| POST | `/admin/referral-fee-plans` | `create()` |
| PATCH | `/admin/referral-fee-plans/:id` | `update()` |
| DELETE | `/admin/referral-fee-plans/:id` | `remove()` |

### Referral Management `/admin/referrals`

> `ReferralController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/referrals` | `list()` |
| GET | `/admin/referrals/export-csv` | `exportCsv()` |
| GET | `/admin/referrals/selectable-contracts` | `selectableContracts()` |
| POST | `/admin/referrals` | `create()` |
| GET | `/admin/referrals/:id` | `detail()` |
| PATCH | `/admin/referrals/:id` | `update()` |
| PATCH | `/admin/referrals/:id/deactivate` | `deactivate()` |
| PATCH | `/admin/referrals/:id/reactivate` | `reactivate()` |
| DELETE | `/admin/referrals/:id` | `remove()` |
| GET | `/admin/referrals/:id/history` | `history()` |

### Admin - Trial Requests `/admin/registrations`

> `TrialRequestController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/registrations` | `list()` |
| GET | `/admin/registrations/summary` | `summary()` |
| POST | `/admin/registrations` | `createRegistration()` |
| POST | `/admin/registrations/branches` | `addBranch()` |
| POST | `/admin/registrations/convert-official` | `convertToOfficial()` |
| POST | `/admin/registrations/import` | `FileInterceptor()` |
| GET | `/admin/registrations/badge` | `badge()` |
| GET | `/admin/registrations/:id` | `detail()` |
| GET | `/admin/registrations/:id/company-info` | 受付 Tab 法人情報・拠点情報 — view |
| GET | `/admin/registrations/:id/contract-info` | 受付 Tab 契約情報 — view |
| PUT | `/admin/registrations/:id/company-info` | `updateCompanyInfo()` |
| PUT | `/admin/registrations/:id/contract-info` | `updateContractInfo()` |
| GET | `/admin/registrations/:id/schedule` | `getSchedule()` |
| GET | `/admin/registrations/:id/setup/parent-contract` | `getSetupParentContract()` |
| GET | `/admin/registrations/:id/setup/child-contracts` | `getSetupChildContracts()` |
| GET | `/admin/registrations/:id/setup/sales-memo` | 本登録設定 Tab 担当者・内部メモ — view |
| PUT | `/admin/registrations/:id/setup/sales-memo` | `updateSetupSalesMemo()` |
| GET | `/admin/registrations/:id/setup/company-info` | 本登録設定 Tab 法人・拠点情報 — view |
| PUT | `/admin/registrations/:id/setup/company-info` | `updateSetupCompanyInfo()` |
| GET | `/admin/registrations/:id/setup/contract` | `getSetupContract()` |
| PUT | `/admin/registrations/:id/setup/contract` | `updateSetupContract()` |
| GET | `/admin/registrations/:id/setup/equipment` | `getSetupEquipment()` |
| PUT | `/admin/registrations/:id/setup/equipment` | `updateSetupEquipment()` |
| GET | `/admin/registrations/:id/setup/pricing` | `getSetupPricing()` |
| PUT | `/admin/registrations/:id/setup/pricing` | `updateSetupPricing()` |
| GET | `/admin/registrations/:contractId/delivery-attachments` | 搬入経路-添付資料 の一覧 (per 拠点) |
| POST | `/admin/registrations/:contractId/delivery-attachments` | `()` |
| DELETE | `/admin/registrations/:contractId/delivery-attachments/:attachmentId` | `deleteDeliveryAttachment()` |
| GET | `/admin/registrations/:id/items/:itemId/delivery-attachments` | `listItemAttachments()` |
| POST | `/admin/registrations/:id/items/:itemId/delivery-attachments` | `addItemAttachments()` |
| DELETE | `/admin/registrations/:id/items/:itemId/delivery-attachments/:attachmentId` | `deleteItemAttachment()` |
| PUT | `/admin/registrations/:id/delivery-settings` | `updateDeliverySettings()` |
| PUT | `/admin/registrations/:id/schedule` | `updateSchedule()` |
| PUT | `/admin/registrations/:id/common-info` | `updateCommonInfo()` |
| POST | `/admin/registrations/:id/withdraw` | `withdraw()` |
| GET | `/admin/registrations/:id/provisional-register/preview` | `provisionalPreview()` |
| POST | `/admin/registrations/:id/provisional-register` | `provisionalRegister()` |
| POST | `/admin/registrations/:id/accept` | `accept()` |
| POST | `/admin/registrations/:id/reject` | `reject()` |

### [DELIVERY] Relay Destinations `/admin/relay-destinations`

> `RelayDestinationController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/relay-destinations` | List and search relay destinations |
| GET | `/admin/relay-destinations/export` | Export relay destinations as CSV |
| POST | `/admin/relay-destinations/import` | Bulk import relay destinations from CSV |
| GET | `/admin/relay-destinations/:id` | Get relay destination detail |
| GET | `/admin/relay-destinations/:id/history` | Get relay destination change history (変更履歴) |
| POST | `/admin/relay-destinations/:id/attachments` | `addAttachment()` |
| DELETE | `/admin/relay-destinations/:id/attachments/:attachmentId` | `removeAttachment()` |
| POST | `/admin/relay-destinations` | Create relay destination |
| PUT | `/admin/relay-destinations/:id` | Update relay destination |
| DELETE | `/admin/relay-destinations/:id` | Delete relay destination (soft — status → 削除済み) |

### Admin - Menu Order Reports `/admin/reports`

> `AdminMenuOrderReportController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/reports/usage` | Báo cáo sử dụng menu theo tháng |
| GET | `/admin/reports/product-ranking` | Xếp hạng sản phẩm theo đơn đặt |

### [DELIVERY] 要確認 (Review items) `/admin/review-items`

> `ReviewItemController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/review-items` | `list()` |
| GET | `/admin/review-items/count` | `count()` |
| GET | `/admin/review-items/export` | `exportCsv()` |
| PATCH | `/admin/review-items/:id` | `update()` |

### Admin - Reviews `/admin/reviews`

> `ReviewController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/reviews` | `list()` |
| GET | `/admin/reviews/export` | `exportCsv()` |
| GET | `/admin/reviews/:id` | Review detail (レビュー詳細) |

### Role Management `/admin/roles`

> `RoleController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/roles` | Danh sách roles (phân trang) |
| GET | `/admin/roles/:id` | Chi tiết role kèm permissions |
| POST | `/admin/roles` | Tạo role mới (có thể gắn permissions inline) |
| PATCH | `/admin/roles/:id` | Cập nhật role (có thể thay permissions inline) |
| DELETE | `/admin/roles/:id` | Xóa role |
| PUT | `/admin/roles/:id/permissions` | Gán permissions vào role (thay toàn bộ) |

### [AW_SALES_001] 売上管理_Sales Management `/admin/sales-analytics`

> `SalesAnalyticsController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/sales-analytics/company` | Phân tích doanh thu theo company |
| GET | `/admin/sales-analytics/company/export-csv` | Export CSV phân tích theo company |
| GET | `/admin/sales-analytics/product` | Phân tích doanh thu theo sản phẩm |
| GET | `/admin/sales-analytics/product/export-csv` | Export CSV phân tích theo sản phẩm |

### Service Option Master `/admin/service-options`

> `ServiceOptionController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/service-options` | `findAll()` |
| GET | `/admin/service-options/:id` | Option detail (オプション詳細) — header + price + プラン別ハンドル |
| POST | `/admin/service-options` | Create an option (オプション登録) |
| PATCH | `/admin/service-options/:id` | Update an option (オプション編集) — the price is fixed: an edit overwrites it |
| PATCH | `/admin/service-options/:id/deactivate` | Deactivate an option (無効化) |
| PATCH | `/admin/service-options/:id/activate` | Re-activate an option (有効化) |
| DELETE | `/admin/service-options/:id` | Delete an option (削除) — blocked if used; deactivate instead |

### [SW_MANU] 操作マニュアル設定_Manual Settings `/admin/settings/manuals`

> `AdminManualSettingController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/settings/manuals` | SW_MANU — supplier and driver manual links |
| PUT | `/admin/settings/manuals/:target` | `updateSetting()` |

### [DELIVERY] Shipping Plans `/admin/shipping-plans`

> `ShippingPlanController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/admin/shipping-plans/daily-chain` | `dailyChain()` |
| POST | `/admin/shipping-plans/materialize` | `materialize()` |
| POST | `/admin/shipping-plans/finalize` | `finalize()` |
| POST | `/admin/shipping-plans/rollout` | `rollout()` |
| POST | `/admin/shipping-plans/recheck` | `recheck()` |

### [DELIVERY] Special Delivery Rules `/admin/special-delivery-rules`

> `SpecialDeliveryRuleController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/special-delivery-rules` | List special delivery rules |
| POST | `/admin/special-delivery-rules` | Create special delivery rule |
| PUT | `/admin/special-delivery-rules/:id` | Update special delivery rule |
| DELETE | `/admin/special-delivery-rules/:id` | Deactivate special delivery rule |

### [ADMIN] Stock `/admin/stock`

> `AdminStockController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/stock/months` | `months()` |
| GET | `/admin/stock/branch-months` | `listBranchMonths()` |
| GET | `/admin/stock/branches/adjustments/bulk-sheet` | `adjustmentBulkSheet()` |
| POST | `/admin/stock/branches/adjustments/bulk` | `adjustBulk()` |
| GET | `/admin/stock/branches/:branchId/detail` | `branchMonthDetail()` |
| POST | `/admin/stock/branches/:branchId/remind` | `remindBranch()` |
| POST | `/admin/stock/branches/:branchId/adjustments` | `adjustBranch()` |
| GET | `/admin/stock/products` | `listWarehouseStock()` |
| GET | `/admin/stock/products/summary` | `warehouseStockSummary()` |
| GET | `/admin/stock/products/export` | `exportWarehouseStock()` |
| POST | `/admin/stock/products/import` | `()` |
| GET | `/admin/stock/products/:id` | `warehouseStockDetail()` |
| POST | `/admin/stock/products/:id/counts` | `createCount()` |
| PATCH | `/admin/stock/counts/:countId` | Edit one recorded count. |
| DELETE | `/admin/stock/counts/:countId` | `deleteCount()` |
| GET | `/admin/stock/periods` | `listPeriods()` |
| GET | `/admin/stock/periods/waste-warnings` | `wasteWarnings()` |
| GET | `/admin/stock/periods/:periodId` | `periodDetail()` |
| POST | `/admin/stock/periods/:periodId/close` | `closePeriod()` |
| GET | `/admin/stock/companies` | `listCompanyStock()` |
| GET | `/admin/stock/companies/summary` | `companyStockSummary()` |
| GET | `/admin/stock/companies/export` | `exportCompanyStock()` |
| GET | `/admin/stock/companies/:companyId` | `companyStockDetail()` |
| GET | `/admin/stock/branches` | `listBranchStock()` |
| GET | `/admin/stock/branches/export` | Export the branch stock grid as CSV (UTF-8 BOM). |
| PUT | `/admin/stock/branches` | `saveBranchStock()` |
| POST | `/admin/stock/branches/import` | `importBranchStock()` |
| POST | `/admin/stock/branches/adjustments` | `adjustBranchStock()` |

### Admin Supplier Change Requests (BF4-B) `/admin/supplier-change-requests`

> `AdminSupplierChangeRequestController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/supplier-change-requests` | `list()` |
| GET | `/admin/supplier-change-requests/:id` | B2 — chi tiết yêu cầu, đối chiếu before/after |
| POST | `/admin/supplier-change-requests/:id/approve` | `approve()` |
| POST | `/admin/supplier-change-requests/:id/reject` | B4 — từ chối yêu cầu (không đụng master) |

### Supplier Master `/admin/supplier-masters`

> `AdminSupplierMasterController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/supplier-masters` | Danh sách supplier masters (phân trang, filter) |
| GET | `/admin/supplier-masters/export` | Export CSV danh sách suppliers (16 cột, UTF-8 BOM) |
| POST | `/admin/supplier-masters` | Tạo supplier master mới (status UNREGISTERED) |
| GET | `/admin/supplier-masters/import/template` | `downloadImportTemplate()` |
| POST | `/admin/supplier-masters/import` | `FileInterceptor()` |
| GET | `/admin/supplier-masters/:id` | Chi tiết supplier master |
| PUT | `/admin/supplier-masters/:id` | Cập nhật supplier master (thay toàn bộ addresses/contacts/products) |
| POST | `/admin/supplier-masters/:id/approve` | `approve()` |
| POST | `/admin/supplier-masters/:id/reject` | `reject()` |
| GET | `/admin/supplier-masters/:id/history` | Lịch sử thay đổi supplier master |
| DELETE | `/admin/supplier-masters/:id` | Xóa supplier master (soft delete, chặn 409 nếu có supplier_orders) |
| POST | `/admin/supplier-masters/accounts/issue` | Phát hành (hoặc reset) tài khoản Cognito cho nhiều suppliers |

### Admin Supplier Order Details (BF4-C) `/admin/supplier-order-details`

> `AdminSupplierOrderDetailController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| PUT | `/admin/supplier-order-details/:detailId` | `update()` |
| DELETE | `/admin/supplier-order-details/:detailId` | C4 — xoá mềm 1 dòng đơn NCC |

### Admin Supplier Orders (BF4-C) `/admin/supplier-orders`

> `AdminSupplierOrderController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/supplier-orders` | C1 — danh sách đơn NCC (xuyên NCC) |
| POST | `/admin/supplier-orders` | C5 — tạo đơn NCC thủ công |
| POST | `/admin/supplier-orders/generate` | `generate()` |
| POST | `/admin/supplier-orders/:id/details` | C4 — thêm dòng vào đơn NCC |
| GET | `/admin/supplier-orders/:id` | C2 — chi tiết đơn NCC + dòng hàng (phân trang) |

### Admin - Surveys `/admin/surveys`

> `SurveyController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/surveys/target-options/users` | `searchTargetUsers()` |
| POST | `/admin/surveys/export-csv` | `exportCsv()` |
| POST | `/admin/surveys` | `create()` |
| GET | `/admin/surveys` | `list()` |
| GET | `/admin/surveys/:id` | `getById()` |
| PATCH | `/admin/surveys/:id` | `update()` |
| POST | `/admin/surveys/:id/suspend` | `suspend()` |
| DELETE | `/admin/surveys/:id` | `remove()` |
| GET | `/admin/surveys/:id/questions` | `getQuestions()` |
| PUT | `/admin/surveys/:id/questions` | `replaceQuestions()` |
| POST | `/admin/surveys/:id/questions/import-csv` | `FileInterceptor()` |
| GET | `/admin/surveys/:id/results` | `getResults()` |
| GET | `/admin/surveys/:id/questions/:questionId/answers` | `getFreeTextAnswers()` |
| GET | `/admin/surveys/:id/history` | `getHistory()` |

### Tax Rate Master `/admin/tax-rates`

> `TaxRateController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/tax-rates` | `list()` |
| POST | `/admin/tax-rates` | Add a tax rate (a new row; an existing rate and its first day never change) |
| PATCH | `/admin/tax-rates/:id` | Rename, end, reorder or deactivate a tax rate |

### Admin Trouble Reports `/admin/trouble-reports`

> `AdminTroubleReportController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/trouble-reports` | `list()` |
| GET | `/admin/trouble-reports/:id` | `detail()` |
| POST | `/admin/trouble-reports/:id/start` | Take up the report (PENDING → IN_PROGRESS) |
| POST | `/admin/trouble-reports/:id/resolve` | Resolve the report (→ RESOLVED) |
| POST | `/admin/trouble-reports/:id/reject` | Reject the report (→ REJECTED) |

### [DELIVERY] Warehouses `/admin/warehouses`

> `WarehouseController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/admin/warehouses` | List and search warehouses (倉庫マスタ) |
| GET | `/admin/warehouses/:id` | Get warehouse detail |
| POST | `/admin/warehouses` | Create warehouse — 倉庫コード is auto-generated |
| PUT | `/admin/warehouses/:id` | Update warehouse (倉庫コード is not editable) |
| DELETE | `/admin/warehouses/:id` | Delete warehouse (soft — status → 削除済み) |

---

## Module: Admin-Company (E02 — Company Admin)

> 134 endpoint · 34 controller.

### Company Admin - Material Orders `/company-admin`

> `MaterialOrderController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/materials` | Danh sách nguyên liệu (master) |
| GET | `/company-admin/material-orders` | Danh sách material orders của company |
| POST | `/company-admin/material-orders` | Tạo hoặc thay thế material order cho tháng |
| GET | `/company-admin/material-orders/current` | `current()` |
| GET | `/company-admin/material-orders/:id` | Chi tiết material order |
| PUT | `/company-admin/material-orders/:id` | Cập nhật items của material order |
| POST | `/company-admin/material-orders/:id/submit` | Submit material order |

### Company Admin - AI Suggestion `/company-admin/ai-suggestions`

> `AiSuggestionController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/ai-suggestions/preferences` | `getPreferences()` |
| PATCH | `/company-admin/ai-suggestions/preferences` | `updatePreferences()` |
| POST | `/company-admin/ai-suggestions/mode1` | `()` |
| POST | `/company-admin/ai-suggestions/mode2` | `createUnified()` |
| POST | `/company-admin/ai-suggestions/mode6/chat` | `()` |
| POST | `/company-admin/ai-suggestions/mode6/chat/:chatId` | `chatFollowUp()` |
| POST | `/company-admin/ai-suggestions/mode6` | `confirm()` |
| GET | `/company-admin/ai-suggestions/jobs/:jobId` | `getJob()` |

### Company - Registration Flow `/company-admin/applications`

> `CompanyApplicationController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/applications` | `list()` |
| GET | `/company-admin/applications/:id` | `detail()` |
| POST | `/company-admin/applications/:id/withdraw` | `withdraw()` |

### Auth `/company-admin/auth`

> `AuthController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/company-admin/auth/login` | Login company admin |
| POST | `/company-admin/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/company-admin/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/company-admin/auth/forgot-password/confirm` | Đặt lại mật khẩu |

### Company Admin - Categories `/company-admin/categories`

> `CompanyCategoryController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/categories` | `()` |

### Company - Change Requests `/company-admin/change-requests`

> `CompanyChangeRequestController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/company-admin/change-requests` | `submit()` |
| GET | `/company-admin/change-requests` | List the company's own change requests (self + branches) |

### Company - Self View `/company-admin/company`

> `CompanySelfEditController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company/field-policies` | `fieldPolicies()` |
| PATCH | `/company-admin/company/me/basic-info` | 自社の拠点情報を更新 |
| PATCH | `/company-admin/company/locations/:id/basic-info` | `updateLocationBasicInfo()` |
| PATCH | `/company-admin/company/me/contacts` | `updateMyContacts()` |
| PATCH | `/company-admin/company/locations/:id/contacts` | `updateLocationContacts()` |
| PATCH | `/company-admin/company/contracts/:contractId` | 契約情報を更新 |
| PATCH | `/company-admin/company/contracts/:contractId/equipment` | `updateContractEquipment()` |

### Company - Self View `/company-admin/company`

> `CompanyViewController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company/me/basic-info` | `myBasicInfo()` |
| GET | `/company-admin/company/me/contacts` | Own company contacts |
| GET | `/company-admin/company/me/contracts` | Own company contract list |
| GET | `/company-admin/company/me/history` | Own company change history |
| GET | `/company-admin/company/locations` | Own locations (branch companies) |
| GET | `/company-admin/company/branch-payments` | `branchPayments()` |
| GET | `/company-admin/company/equipment-loans` | `equipmentLoans()` |
| GET | `/company-admin/company/locations/:id/basic-info` | A location's basic info (+ 承認待ちの変更; must be own child) |
| GET | `/company-admin/company/locations/:id/contracts` | A location's contract list (must be own child) |
| GET | `/company-admin/company/locations/:id/contacts` | A location's contacts / 担当者 (must be own child) |
| GET | `/company-admin/company/locations/:id/history` | A location's info change history (must be own child) |
| GET | `/company-admin/company/contracts/:contractId` | Contract detail (+ 承認待ちの変更; own / own location) |
| GET | `/company-admin/company/contracts/:contractId/payment` | Contract payment detail |
| GET | `/company-admin/company/contracts/:contractId/equipment` | Contract equipment detail (+ 承認待ちの変更) |
| GET | `/company-admin/company/contracts/:contractId/equipment-moves` | `contractEquipmentMoves()` |
| GET | `/company-admin/company/contracts/:contractId/history` | Contract change history |

### Company `/company-admin/company`

> `CompanyController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company/me` | Thông tin company đang quản lý |
| GET | `/company-admin/company/export-qr` | `exportQr()` |

### Company Admin - Monthly Food Orders `/company-admin/company-orders`

> `MonthlyCompanyOrderController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company-orders` | Danh sách đơn tháng của company (phân trang, filter) |
| POST | `/company-admin/company-orders` | Tạo đơn tháng mới |
| GET | `/company-admin/company-orders/current` | `current()` |
| GET | `/company-admin/company-orders/monthly` | `monthly()` |
| GET | `/company-admin/company-orders/:id` | Chi tiết đơn tháng + items |
| PUT | `/company-admin/company-orders/:id/items` | Cập nhật số lượng items |
| POST | `/company-admin/company-orders/:id/submit` | Submit đơn tháng |
| POST | `/company-admin/company-orders/:id/import-csv` | Import items từ CSV (multipart/form-data, max 10MB) |

### Company - Stock `/company-admin/company/stock`

> `CompanyStockController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/company/stock` | `list()` |
| GET | `/company-admin/company/stock/export` | CSV出力 — export the visible rows (UTF-8 BOM). |
| POST | `/company-admin/company/stock/import` | `importCsv()` |
| GET | `/company-admin/company/stock/branches` | `listBranches()` |
| GET | `/company-admin/company/stock/branches/summary` | `branchSummary()` |
| GET | `/company-admin/company/stock/branches/export` | `exportBranches()` |
| GET | `/company-admin/company/stock/branches/:branchId` | `branchDetail()` |
| GET | `/company-admin/company/stock/:branchId/:productId` | `detail()` |
| PUT | `/company-admin/company/stock` | `save()` |
| DELETE | `/company-admin/company/stock/:branchId/:productId` | `clearCount()` |

### [DELIVERY] Company Deliveries (CW_DLV) `/company-admin/deliveries`

> `CompanyDeliveryController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/deliveries/:deliveryId` | `detail()` |
| GET | `/company-admin/deliveries/:deliveryId/date-change-options` | `dateChangeOptions()` |
| GET | `/company-admin/deliveries/:deliveryId/delivery-note` | `deliveryNote()` |

### [DELIVERY] Company Delivery Blocks `/company-admin/delivery-blocks`

> `CompanyDeliveryBlockController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/delivery-blocks` | List the company's own delivery blocks |
| GET | `/company-admin/delivery-blocks/:id` | `detail()` |
| GET | `/company-admin/delivery-blocks/:id/report` | `report()` |
| PUT | `/company-admin/delivery-blocks/:id/report` | `saveReport()` |
| GET | `/company-admin/delivery-blocks/:id/inventory-check` | `inventoryCheck()` |
| PUT | `/company-admin/delivery-blocks/:id/inventory-check` | `saveInventoryCheck()` |

### [DELIVERY] Company Delivery Date Change Requests `/company-admin/delivery-date-change-requests`

> `CompanyDeliveryDateChangeRequestController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/delivery-date-change-requests` | `list()` |
| GET | `/company-admin/delivery-date-change-requests/hope-candidates` | `hopeCandidates()` |
| GET | `/company-admin/delivery-date-change-requests/:id` | `detail()` |
| POST | `/company-admin/delivery-date-change-requests` | `create()` |
| PATCH | `/company-admin/delivery-date-change-requests/:id` | `act()` |
| PATCH | `/company-admin/delivery-date-change-requests/:id/cancel` | 取り下げる (= PATCH :id WITHDRAW) |
| POST | `/company-admin/delivery-date-change-requests/:id/accept-proposal` | `acceptProposal()` |
| POST | `/company-admin/delivery-date-change-requests/:id/decline-proposal` | `declineProposal()` |

### [DELIVERY] Company Delivery Calendar `/company-admin/delivery-schedule`

> `CompanyDeliveryCalendarController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/delivery-schedule/calendar` | `calendar()` |

### Company - Registration Flow `/company-admin/equipment-models`

> `EquipmentModelController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/equipment-models` | `list()` |

### [DELIVERY] Company Home (CW_HOME) `/company-admin/home`

> `CompanyHomeController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/home/context` | `context()` |
| GET | `/company-admin/home/calendar` | `calendar()` |
| GET | `/company-admin/home/checks` | `checks()` |

### Company Admin - HubSpot Chat `/company-admin/hubspot`

> `HubspotChatController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/company-admin/hubspot/chat-token` | `issueChatToken()` |
| POST | `/company-admin/hubspot/chat-threads` | `bindThread()` |
| DELETE | `/company-admin/hubspot/chat-session` | `endChatSession()` |

### Company Admin - Monthly Menus `/company-admin/monthly-menus`

> `MonthlyMenuController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/monthly-menus` | `list()` |
| GET | `/company-admin/monthly-menus/current` | Menu hiện tại và tháng kế tiếp (theo query tháng/năm) |

### Company Admin Notifications `/company-admin/notifications`

> `CompanyNotificationController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/notifications/unread-count` | `unreadCount()` |
| GET | `/company-admin/notifications` | `list()` |
| GET | `/company-admin/notifications/:id` | `detail()` |
| PATCH | `/company-admin/notifications/:id/read` | `markRead()` |

### [ORDER] Company Order History (CW_HIST) `/company-admin/order-history`

> `CompanyOrderHistoryController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/order-history/filter-options` | `filterOptions()` |
| GET | `/company-admin/order-history/product-orders` | `productOrders()` |
| GET | `/company-admin/order-history/product-orders/export` | `exportProductOrders()` |
| GET | `/company-admin/order-history/material-orders` | `materialOrders()` |
| GET | `/company-admin/order-history/material-orders/export` | `exportMaterialOrders()` |
| GET | `/company-admin/order-history/locations/:locationId/months/:yearMonth` | `detail()` |
| GET | `/company-admin/order-history/locations/:locationId/months/:yearMonth/history` | `history()` |

### [CW_SALES_001] 売上集計_Sales Summary `/company-admin/orders`

> `OrderController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/orders` | Danh sách đơn hàng lẻ (E01) của company |
| GET | `/company-admin/orders/export` | Export CSV đơn hàng lẻ |
| GET | `/company-admin/orders/summary` | Tổng hợp doanh thu |
| GET | `/company-admin/orders/:orderNumber` | Chi tiết đơn hàng lẻ |

### PaymentMethodController `/company-admin/payment-methods`

> `PaymentMethodController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/payment-methods` | Danh sách phương thức thanh toán |

### [DELIVERY] Company Picking Unavailable Days `/company-admin/picking-unavailable-days`

> `CompanyPickingUnavailableDayController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/picking-unavailable-days` | `list()` |
| GET | `/company-admin/picking-unavailable-days/all` | `listAll()` |

### Company - Registration Flow `/company-admin/plan-masters`

> `PlanMasterController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/plan-masters` | `findPublished()` |

### Company Admin - Product Tags `/company-admin/product-tags`

> `CompanyProductTagController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/product-tags` | `()` |

### Company Admin - Products `/company-admin/products`

> `CompanyProductController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/products/:id` | `()` |

### Company - Registration Flow `/company-admin/registration`

> `CompanyRegistrationController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/registration/prefill` | `prefill()` |
| POST | `/company-admin/registration/convert-official` | `convertToOfficial()` |
| POST | `/company-admin/registration/branches` | `addBranch()` |

### Company - Registration Flow `/company-admin/registrations`

> `TrialRequestController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/company-admin/registrations` | `()` |

### Company Admin - Menu Order Reports `/company-admin/reports`

> `MenuOrderReportController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/reports/usage` | Báo cáo sử dụng menu theo tháng (scoped by company) |
| GET | `/company-admin/reports/product-ranking` | Xếp hạng sản phẩm theo đơn đặt (scoped by company) |

### Company - Registration Flow `/company-admin/service-options`

> `ServiceOptionController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/service-options` | `findPublished()` |

### [DELIVERY] Company Special Delivery Rules `/company-admin/special-delivery-rules`

> `CompanySpecialDeliveryRuleController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/special-delivery-rules` | `list()` |
| POST | `/company-admin/special-delivery-rules` | `create()` |
| PUT | `/company-admin/special-delivery-rules/:id` | `update()` |
| DELETE | `/company-admin/special-delivery-rules/:id` | `delete()` |

### User Management `/company-admin/users`

> `UserController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/company-admin/users/linked` | Danh sách users đã link với company |
| GET | `/company-admin/users/linked/:userCode` | Chi tiết user theo userCode |
| DELETE | `/company-admin/users/linked/:userCode` | Unlink user khỏi company |
| POST | `/company-admin/users/linked/:userCode/restrict` | Hạn chế user |
| POST | `/company-admin/users/linked/:userCode/unrestrict` | Gỡ hạn chế user |
| GET | `/company-admin/users/linked/:userCode/purchase-history` | Lịch sử mua hàng của user |

### Company - Wishlist Campaigns `/company-admin/wishlist-campaigns`

> `WishlistCampaignController` · Guard: AdminCompanyGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/company-admin/wishlist-campaigns` | `publish()` |

---

## Module: User (E01 — Mobile App)

> 81 endpoint · 25 controller.

### AW_AUTHEN_002_アプリバージョン管理_App_Version_User `/app/version`

> `AppVersionController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/app/version` | Kiểm tra phiên bản app (force/recommended update) |

### User Authentication `/auth/user`

> `AuthController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/auth/user/login` | Login |
| POST | `/auth/user/guest` | `loginAsGuest()` |
| POST | `/auth/user/logout` | Logout [Guard: JwtAuthGuard, GuestRestrictionGuard] |
| POST | `/auth/user/register` | Đăng ký tài khoản |
| POST | `/auth/user/verify-otp` | Xác thực OTP đăng ký [Guard: OptionalJwtAuthGuard] |
| POST | `/auth/user/resend-otp` | Gửi lại OTP |
| POST | `/auth/user/forgot-password` | Yêu cầu reset password |
| POST | `/auth/user/forgot-password/verify-otp` | Xác thực OTP reset password |
| POST | `/auth/user/reset-password` | Đặt lại mật khẩu |

### Contact `/contact`

> `ContactController` · Guard: OptionalJwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/contact` | Gửi yêu cầu liên hệ (auth tùy chọn) |

### HealthCheckController `/health-check`

> `HealthCheckController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/health-check` | `healthCheck()` |

### Public – App Install `/public`

> `AppDownloadController` · Guard: không khai báo ở cấp controller (`@Public()` cấp controller)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/public/download` | 302 redirect đến App Store / Play Store theo `User-Agent` header [Public] |

### [AW_MAINTAIN_001]_Maintain_User `/public/maintain`

> `MaintainController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/public/maintain/status` | Kiểm tra trạng thái maintain cho mobile splash screen (`?platform=`) |

### Public – Company QR `/public/qr`

> `CompanyQrController` · Guard: không khai báo ở cấp controller (`@Public()` cấp controller)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/public/qr/companies/:code` | `resolve()` [Public] |

### User – Product Reviews `/user`

> `ProductReviewController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/menu/products/:id/reviews` | Get product reviews (all companies) |
| GET | `/user/reviews` | Get the current user's whole review history (paginated) |
| GET | `/user/orders/:orderId/reviews` | Get the current user's review history for a past order |
| POST | `/user/orders/:orderId/reviews` | Submit reviews for an order (+ optional order-wide feedback) |

### User `/user`

> `UserController` · Guard: JwtAuthGuard, GuestRestrictionGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/me` | Profile user hiện tại |
| PUT | `/user/me` | Cập nhật profile |
| DELETE | `/user/me` | Xóa tài khoản (soft delete) |

### User – Allergen `/user/allergens`

> `AllergenController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/allergens` | Danh sách allergens (sắp xếp theo sort ASC) |
| GET | `/user/allergens/me` | Get current user allergen profile |
| PUT | `/user/allergens/me` | Update current user allergen profile |

### User – Cart `/user/cart`

> `CartController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/cart` | Lấy giỏ hàng |
| GET | `/user/cart/stock-check` | `checkCartStock()` |
| POST | `/user/cart/items` | Thêm sản phẩm vào giỏ |
| PUT | `/user/cart/items/:id` | Cập nhật số lượng sản phẩm |
| DELETE | `/user/cart/items/:id` | Xóa sản phẩm khỏi giỏ |
| DELETE | `/user/cart` | Xóa toàn bộ giỏ hàng |
| GET | `/user/cart/reset-status` | Kiểm tra trạng thái reset giỏ hàng |
| POST | `/user/cart/reset-ack` | Xác nhận đã thấy thông báo reset |
| POST | `/user/cart/sync-stock` | `syncCartWithStock()` |

### User – Category `/user/categories`

> `CategoryController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/categories` | Danh sách categories |

### User – Elepay `/user/elepay`

> `ElepayWebhookController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/elepay/webhook` | Xử lý charge.* và refund.* events từ Elepay [Guard: ElepayWebhookGuard] |
| POST | `/user/elepay/verification-credit-card` | Xử lý source.activated / source.inactivated [Guard: ElepayWebhookGuard] |
| GET | `/user/elepay/verify-easy-code-payment` | Redirect handler sau khi thanh toán QR |
| GET | `/user/elepay/public-key` | Lấy Elepay public key |

### User – Favorites `/user/favorites`

> `FavoriteController` · Guard: JwtAuthGuard, GuestRestrictionGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/favorites/rankings` | `getRankings()` |
| POST | `/user/favorites/:productId` | Toggle yêu thích (thêm nếu chưa có, xóa nếu đã có) |
| GET | `/user/favorites` | Danh sách sản phẩm yêu thích |

### User – Feedback `/user/feedbacks`

> `FeedbackController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/feedbacks` | Submit a feedback (opinion / request / complaint / improvement) to admins |

### User – Legal `/user/legal`

> `LegalController` · Guard: không khai báo ở cấp controller (`@Public()` cấp controller)

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/legal/terms` | Điều khoản dịch vụ hiện hành [Public] |
| GET | `/user/legal/privacy` | Chính sách bảo mật hiện hành [Public] |

### User – Menu `/user/menu`

> `CompanyMenuController` · Guard: OptionalJwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/menu/companies/:companyId/products` | `getMenuProductsByCompany()` |

### User – Menu `/user/menu`

> `MenuController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/menu/products/jan/:janCode` | Tìm sản phẩm theo JAN code |
| GET | `/user/menu/products/:id` | Chi tiết sản phẩm theo id |
| GET | `/user/menu/products` | Danh sách sản phẩm trong menu hiện tại |

### User – Notifications `/user/notifications`

> `NotificationController` · Guard: JwtAuthGuard, GuestRestrictionGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/notifications/device-token` | Đăng ký FCM device token |
| GET | `/user/notifications` | Danh sách notifications (phân trang) |
| GET | `/user/notifications/unread-count` | Số lượng notification chưa đọc |
| GET | `/user/notifications/:id` | Chi tiết notification |
| PUT | `/user/notifications/:id/read` | Đánh dấu đã đọc |
| PUT | `/user/notifications/read-all` | Đánh dấu tất cả đã đọc |

### User – Orders `/user/orders`

> `OrderController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/orders/checkout` | Đặt hàng — tạo order + payment |
| PUT | `/user/orders/:orderId/cancel` | Hủy đơn hàng |
| POST | `/user/orders/:orderId/retry-payment` | Thử thanh toán lại |
| GET | `/user/orders/validate-company` | Kiểm tra company hợp lệ |
| GET | `/user/orders/check-limit` | Kiểm tra giới hạn đặt hàng tháng |
| GET | `/user/orders/history` | Lịch sử đơn hàng |
| GET | `/user/orders` | Danh sách đơn hàng đang chờ |
| GET | `/user/orders/pending` | `getPendingOrder()` |
| GET | `/user/orders/:orderId/payment-status` | `getPaymentStatus()` |
| GET | `/user/orders/:id` | Chi tiết đơn hàng |

### User – Payment Methods `/user/payment-methods`

> `PaymentMethodController` · Guard: JwtAuthGuard, GuestRestrictionGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/payment-methods` | Danh sách phương thức thanh toán (filter CASH theo company) |
| GET | `/user/payment-methods/my-default` | Phương thức thanh toán mặc định của user |
| PATCH | `/user/payment-methods/my-default` | Đặt phương thức thanh toán mặc định |
| GET | `/user/payment-methods/credit-cards` | Danh sách thẻ tín dụng đã lưu (Elepay) |
| PUT | `/user/payment-methods/credit-cards/:sourceId` | Đặt thẻ tín dụng mặc định |
| DELETE | `/user/payment-methods/credit-cards/:sourceId` | Xóa thẻ tín dụng |
| POST | `/user/payment-methods/credit-card` | Thêm thẻ tín dụng (tạo Elepay source) |

### User – Preferences `/user/preferences`

> `UserPreferenceController` · Guard: JwtAuthGuard, GuestRestrictionGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/preferences/cart-popup` | Kiểm tra có hiện popup xác nhận checkout không |
| POST | `/user/preferences/cart-popup/hide` | Ẩn popup trong 1 tháng |
| GET | `/user/preferences/notifications` | `getNotificationSetting()` |
| PUT | `/user/preferences/notifications` | `updateNotificationSetting()` |

### User – Refunds `/user/refunds`

> `RefundController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/user/refunds` | Yêu cầu hoàn tiền |

### User – Survey `/user/surveys`

> `SurveyController` · Guard: JwtAuthGuard, GuestRestrictionGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/surveys/:id` | Get survey questions and details |
| POST | `/user/surveys/:id/responses` | Submit survey answers |

### User – Wishlist Campaign `/user/wishlist-campaigns`

> `WishlistCampaignController` · Guard: JwtAuthGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/user/wishlist-campaigns/active` | `getActiveCampaign()` |
| POST | `/user/wishlist-campaigns/:id/votes` | Submit wishlist campaign votes |

---

## Module: Supplier (E04 — Supplier Web)

> 51 endpoint · 10 controller.

### Supplier Self-Service `/supplier`

> `SupplierSelfServiceController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/register/options` | `getRegisterOptions()` |
| GET | `/supplier/register/products` | `listRegisterProducts()` |
| POST | `/supplier/register` | `register()` [Guard: SupplierRegisterThrottlerGuard] |
| GET | `/supplier/profile` | `getProfile()` [Guard: SupplierGuard] |
| GET | `/supplier/profile/history` | `getProfileHistory()` [Guard: SupplierGuard] |
| PATCH | `/supplier/profile` | `updateProfile()` [Guard: SupplierGuard] |
| POST | `/supplier/change-requests` | `submitChangeRequest()` [Guard: SupplierGuard] |

### Supplier Account `/supplier/account`

> `SupplierAccountController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/account/me` | Profile supplier đang đăng nhập |
| POST | `/supplier/account/change-password` | Đổi mật khẩu supplier |

### Supplier Auth `/supplier/auth`

> `SupplierAuthController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/supplier/auth/login` | Login supplier |
| POST | `/supplier/auth/refresh` | Refresh access token bằng refresh token |
| POST | `/supplier/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/supplier/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/supplier/auth/forgot-password/reset-password` | Đặt lại mật khẩu (trả về JWT mới) |
| POST | `/supplier/auth/logout` | Logout (cần Bearer token) [Guard: SupplierGuard] |

### Supplier Delivery Schedule `/supplier/delivery-schedule`

> `SupplierDeliveryScheduleController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/delivery-schedule/calendar` | `calendar()` |

### Supplier Home `/supplier/home`

> `SupplierHomeController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/home/dashboard` | `getDashboard()` |

### Supplier Manual `/supplier/manual`

> `SupplierManualController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/manual` | `getManual()` |

### Supplier Notifications `/supplier/notifications`

> `SupplierNotificationController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/notifications` | Danh sách notifications (cursor pagination, filter theo tab ALL/IMPORTANT/NEWS) |
| GET | `/supplier/notifications/:id` | `detail()` |
| GET | `/supplier/notifications/:id/attachments/:fileId/url` | `attachmentUrl()` |
| PATCH | `/supplier/notifications/:id/read` | Đánh dấu 1 notification đã đọc |

### Supplier Order Detail `/supplier/order-details`

> `SupplierOrderDetailController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| PUT | `/supplier/order-details/:detailId` | Cập nhật 1 dòng detail (provisional/official qty, stock, expiry) |
| DELETE | `/supplier/order-details/:detailId` | Soft delete 1 dòng detail |

### Supplier Order `/supplier/orders`

> `SupplierOrderController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/orders` | Danh sách supplier orders (phân trang, filter theo tháng/loại menu/status) |
| GET | `/supplier/orders/thomas-arrival-csv` | `exportThomasArrival()` |
| GET | `/supplier/orders/thomas-product-master-csv` | `exportThomasProductMaster()` |
| GET | `/supplier/orders/export` | `exportList()` |
| GET | `/supplier/orders/:id/export` | Export 1 supplier order ra CSV (UTF-8 BOM, 14 cột) |
| POST | `/supplier/orders/:id/provisional-order` | Đánh dấu các dòng detail là 仮発注 |
| POST | `/supplier/orders/:id/official-order` | Đánh dấu các dòng detail là 本発注 |
| PUT | `/supplier/orders/:id/shipping` | `()` |
| GET | `/supplier/orders/:id` | Chi tiết supplier order + danh sách lines (phân trang, filter) |

### Supplier Purchase Order (SW_ORDR) `/supplier/purchase-orders`

> `SupplierPurchaseOrderController` · Guard: SupplierGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/supplier/purchase-orders` | `list()` |
| GET | `/supplier/purchase-orders/filter-options` | `filterOptions()` |
| GET | `/supplier/purchase-orders/carriers` | 運送会社 choices — 3 fixed + 委託配送先 |
| GET | `/supplier/purchase-orders/export` | `export()` |
| GET | `/supplier/purchase-orders/period-csv` | SW_ORDR_001 発注明細（期間）CSV |
| GET | `/supplier/purchase-orders/shipments` | `shipments()` |
| PUT | `/supplier/purchase-orders/shipments/draft` | `saveShipmentDrafts()` |
| POST | `/supplier/purchase-orders/shipments/report` | `reportShipments()` |
| POST | `/supplier/purchase-orders/bulk-reply` | `bulkReply()` |
| POST | `/supplier/purchase-orders/bulk-approve` | `bulkApprove()` |
| POST | `/supplier/purchase-orders/import/validate` | `validateImport()` |
| POST | `/supplier/purchase-orders/import/commit` | `commitImport()` |
| GET | `/supplier/purchase-orders/:id` | SW_ORDR_002 発注詳細 — marks the order as seen |
| POST | `/supplier/purchase-orders/:id/reply` | `reply()` |
| PUT | `/supplier/purchase-orders/:id/reply` | `editReply()` |
| POST | `/supplier/purchase-orders/:id/decline` | `decline()` |
| POST | `/supplier/purchase-orders/:id/approve` | SW_ORDR_002 本発注の承認 — S326 / S327 |
| POST | `/supplier/purchase-orders/:id/rounds/:roundId/ship` | `ship()` |

---

## Module: Driver (E06 — Driver Web App)

> 37 endpoint · 10 controller.

### Driver Dashboard `/driver`

> `DriverDashboardController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/home` | DA_HOME_001 — KPI hôm nay + block giao theo kho |
| GET | `/driver/schedules` | DA_HOME_001_Schedule — lịch giao gom theo ngày |

### Driver Delivery List `/driver`

> `DriverDeliveryListController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/delivery-list` | `getList()` |

### Driver Account `/driver/account`

> `DriverAccountController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/account/me` | Profile driver đang đăng nhập [Guard: DriverGuard] |
| POST | `/driver/account/change-password` | Đổi mật khẩu driver [Guard: DriverGuard] |

### DA_AUTHEN_001-Driver Auth `/driver/auth`

> `DriverAuthController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/driver/auth/login` | Login driver |
| POST | `/driver/auth/refresh` | Refresh access token |
| POST | `/driver/auth/logout` | Logout (cần Bearer token) [Guard: DriverGuard] |
| POST | `/driver/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/driver/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/driver/auth/forgot-password/reset-password` | Đặt lại mật khẩu (trả về JWT mới) |

### Driver Delivery `/driver/deliveries`

> `DriverDeliveryController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/deliveries/:deliveryId` | `getDetail()` |
| POST | `/driver/deliveries/:deliveryId/complete` | Complete delivery (COOL one-shot / ES Step 5) |
| PUT | `/driver/deliveries/:deliveryId/pre-display-photos` | ES Step 1 — 陳列前 photos |
| GET | `/driver/deliveries/:deliveryId/inventory-check` | `getInventoryCheck()` |
| POST | `/driver/deliveries/:deliveryId/inventory-check` | `saveInventoryCheck()` |
| GET | `/driver/deliveries/:deliveryId/display-inspection` | ES Step 3 (load) — 検品・陳列 |
| POST | `/driver/deliveries/:deliveryId/display-inspection` | ES Step 3 (submit) — 検品・陳列 |
| PUT | `/driver/deliveries/:deliveryId/post-display-photos` | ES Step 4 — 陳列後 photos |
| GET | `/driver/deliveries/:deliveryId/parking-report` | ES tab 駐車報告 (read) |
| PUT | `/driver/deliveries/:deliveryId/parking-report` | ES tab 駐車報告 (write) |

### Driver - Stocktake `/driver/deliveries/:deliveryId/stocktake`

> `DriverStocktakeController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/deliveries/:deliveryId/stocktake` | `get()` |
| POST | `/driver/deliveries/:deliveryId/stocktake/register` | `register()` |
| POST | `/driver/deliveries/:deliveryId/stocktake/scan` | `scan()` |
| GET | `/driver/deliveries/:deliveryId/stocktake/summary` | `summary()` |
| POST | `/driver/deliveries/:deliveryId/stocktake/confirm` | `confirm()` |

### Driver Notifications `/driver/notifications`

> `DriverNotificationController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/notifications/unread-count` | `unreadCount()` |
| GET | `/driver/notifications` | `list()` |
| GET | `/driver/notifications/:id` | `detail()` |
| PATCH | `/driver/notifications/read-all` | `markAllRead()` |
| PATCH | `/driver/notifications/:id/read` | `markRead()` |

### Driver Warehouse Receipt `/driver/receipts`

> `DriverReceiptController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/receipts/:receiptId` | DA_RECV_001/003 — chi tiết điểm nhận + kiện hàng |
| POST | `/driver/receipts/:receiptId/complete` | Hoàn thành nhận hàng (FULL / PARTIAL) |

### Driver Trouble Report `/driver/trouble-reports`

> `DriverTroubleReportController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/driver/trouble-reports/targets` | `getTargets()` |
| POST | `/driver/trouble-reports` | DA_RPTD_002 — gửi báo cáo sự cố |

### Driver Upload `/driver/uploads`

> `DriverUploadController` · Guard: DriverGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/driver/uploads/presigned-upload-url` | `generateUploadUrl()` |
| POST | `/driver/uploads/presigned-upload-urls` | `generateUploadUrls()` |

---

## Module: Deliverer (E05 — Công ty vận chuyển Web)

> 64 endpoint · 11 controller.

### Deliverer Self-Service `/deliverer`

> `DelivererSelfServiceController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/register/regions/prefectures` | Danh mục 都道府県 |
| GET | `/deliverer/register/regions/cities` | Danh mục 市区町村 |
| GET | `/deliverer/register/regions/towns` | Danh mục 町域 |
| POST | `/deliverer/register` | Đăng ký đối tác (public) |
| GET | `/deliverer/profile` | Hồ sơ đối tác [Guard: DelivererGuard] |
| GET | `/deliverer/profile/history` | `getProfileHistory()` [Guard: DelivererGuard] |
| PATCH | `/deliverer/profile` | Cập nhật hồ sơ [Guard: DelivererGuard] |

### Deliverer Delivery Blocks `/deliverer`

> `DeliveryBlockController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/delivery-blocks` | Danh sách 配送 (query: `shipmentNo`, `scheduledSendDateFrom/To`, `deliveryDateFrom/To`, `transitPointId`, `status`, `page`, `limit`, `sortBy`, `order`) |
| GET | `/deliverer/relay-destinations` | Danh sách trạm trung chuyển (dropdown filter) |
| GET | `/deliverer/delivery-blocks/timeline` | Timeline theo tuần (`weekStart`) |
| GET | `/deliverer/delivery-blocks/summary` | Tổng hợp theo tháng (`month`) |
| GET | `/deliverer/delivery-blocks/monthly-calendar` | `monthlyCalendar()` |
| GET | `/deliverer/delivery-blocks/:id/assignable-drivers` | Danh sách tài xế gán được |
| GET | `/deliverer/delivery-blocks/:id` | Chi tiết 配送 |
| POST | `/deliverer/delivery-blocks/:id/private-attachments` | `addPrivateAttachment()` |
| DELETE | `/deliverer/delivery-blocks/:id/private-attachments/:attachmentId` | `removePrivateAttachment()` |
| PATCH | `/deliverer/delivery-blocks/:id/assign-driver` | Gán tài xế |
| PATCH | `/deliverer/delivery-blocks/:id/status` | Cập nhật trạng thái |
| DELETE | `/deliverer/delivery-blocks/:id` | Xoá |

### Deliverer Account `/deliverer/account`

> `DelivererAccountController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/account/me` | Profile deliverer đang đăng nhập [Guard: DelivererGuard] |
| POST | `/deliverer/account/change-password` | Đổi mật khẩu deliverer [Guard: DelivererGuard] |

### Deliverer Auth `/deliverer/auth`

> `DelivererAuthController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/deliverer/auth/login` | Login deliverer |
| POST | `/deliverer/auth/refresh` | Refresh access token |
| POST | `/deliverer/auth/logout` | Logout (cần Bearer token) [Guard: DelivererGuard] |
| POST | `/deliverer/auth/forgot-password/request` | Gửi OTP reset password |
| POST | `/deliverer/auth/forgot-password/verify-otp` | Xác thực OTP |
| POST | `/deliverer/auth/forgot-password/reset-password` | Đặt lại mật khẩu (trả về JWT mới) |

### Deliverer Collection Reports `/deliverer/collection-reports`

> `DelivererCollectionReportController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/collection-reports` | Danh sách báo cáo thu tiền (`driverId`, `dateFrom`, `dateTo`, `page`, `limit`) |
| GET | `/deliverer/collection-reports/summary` | Tổng hợp tháng (`month`) — có `totalCollectedAmount` + `totalParkingFee` |
| GET | `/deliverer/collection-reports/export` | **CSV UTF-8 BOM**, 7 cột: 発送日 / 配送スタッフ名 / 納品先 / 集金合計 / 駐車場料金 / 差額 / 提出日時 |
| GET | `/deliverer/collection-reports/report` | CSV UTF-8 BOM theo tháng (cùng 7 cột) |
| GET | `/deliverer/collection-reports/by-driver` | `listByDriver()` |
| GET | `/deliverer/collection-reports/by-driver/export` | `exportByDriverCsv()` |
| GET | `/deliverer/collection-reports/:id` | Chi tiết báo cáo |

### Deliverer Drivers `/deliverer/drivers`

> `DelivererDriverController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/drivers` | Danh sách tài xế (query: `q`, `type`, `status`, `page`, `limit`) |
| GET | `/deliverer/drivers/:id` | Chi tiết tài xế |
| GET | `/deliverer/drivers/:id/deliveries` | `listDeliveries()` |
| GET | `/deliverer/drivers/:id/history` | `getHistory()` |
| POST | `/deliverer/drivers` | Tạo tài xế |
| POST | `/deliverer/drivers/bulk-issue-accounts/preview` | `previewBulkIssue()` |
| POST | `/deliverer/drivers/bulk-issue-accounts` | `bulkIssueAccounts()` |
| PATCH | `/deliverer/drivers/:id` | Sửa tài xế |
| DELETE | `/deliverer/drivers/:id` | Xoá mềm |
| POST | `/deliverer/drivers/:id/send-password` | Gửi mật khẩu qua email |

### Deliverer ES Fee Change Requests `/deliverer/fee-change-requests`

> `DelivererFeeChangeRequestController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/fee-change-requests` | Danh sách yêu cầu đổi phí |
| POST | `/deliverer/fee-change-requests` | Tạo yêu cầu |
| POST | `/deliverer/fee-change-requests/import` | Import CSV phí |
| GET | `/deliverer/fee-change-requests/export` | `exportCsv()` |
| GET | `/deliverer/fee-change-requests/:id` | Chi tiết |

### Deliverer Contacts `/deliverer/me/contacts`

> `DelivererContactController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/me/contacts` | Danh sách người phụ trách |
| GET | `/deliverer/me/contacts/:id` | Chi tiết |
| POST | `/deliverer/me/contacts` | Thêm |
| PATCH | `/deliverer/me/contacts/:id` | Sửa |
| DELETE | `/deliverer/me/contacts/:id` | Xoá |

### Deliverer Notifications `/deliverer/notifications`

> `DelivererNotificationController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/notifications/unread-count` | Số thông báo chưa đọc (badge) |
| GET | `/deliverer/notifications` | Danh sách thông báo |
| GET | `/deliverer/notifications/:id` | Chi tiết thông báo |
| PATCH | `/deliverer/notifications/:id/read` | Đánh dấu đã đọc |

### OW_REQ - Quotation Request (見積依頼) `/deliverer/quotation-requests`

> `DelivererQuotationRequestController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/deliverer/quotation-requests` | Danh sách yêu cầu báo giá |
| GET | `/deliverer/quotation-requests/:id` | Chi tiết |
| POST | `/deliverer/quotation-requests/:id/reply` | Gửi trả lời (OK/NG + phí + file) |
| GET | `/deliverer/quotation-requests/:id/reply-history` | Lịch sử trả lời |

### Deliverer Upload `/deliverer/uploads`

> `DelivererUploadController` · Guard: DelivererGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/deliverer/uploads/presigned-upload-url` | Lấy presigned URL (1 file) |
| POST | `/deliverer/uploads/presigned-upload-urls` | Lấy presigned URL (nhiều file) |

---

## Module: AI-Pro (Internal Integration)

> 1 endpoint · 1 controller.

### [AI_PRO] AI PRO Integration `/ai-pro/dataset`

> `AiProController` · Guard: AiProApiKeyGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/ai-pro/dataset` | Lấy dataset menu recommendation. `?format=csv` → zip file; mặc định → JSON |

---

## Module: HubSpot Agent (Internal Integration)

> 1 endpoint · 1 controller.

### [HUBSPOT_AGENT] HubSpot AI agent actions `/hubspot-agent`

> `HubspotAgentController` · Guard: HubspotAgentApiKeyGuard, HubspotAgentThrottlerGuard

| Method | Path | Mô tả |
|---|---|---|
| GET | `/hubspot-agent/contract-summary` | `()` |

---

## Module dùng chung (ngoài RouterModule)

> 9 endpoint · 2 controller.

### File Upload `/files`

> `FileUploadController` · Guard: AdminGuard

| Method | Path | Mô tả |
|---|---|---|
| POST | `/files/presigned-upload-url` | `generateUploadUrl()` |
| POST | `/files/presigned-upload-urls` | `generateUploadUrls()` |

### MailController `/mail`

> `MailController` · Guard: không khai báo ở cấp controller

| Method | Path | Mô tả |
|---|---|---|
| POST | `/mail/send` | Send a simple email POST /mail/send |
| POST | `/mail/send-template` | Send a templated email POST /mail/send-template |
| GET | `/mail/providers` | Get all available mail providers GET /mail/providers |
| GET | `/mail/providers/active` | Get the currently active provider GET /mail/providers/active |
| PUT | `/mail/providers/switch` | Switch the active mail provider PUT /mail/providers/switch |
| GET | `/mail/providers/verify` | Verify the active provider configuration GET /mail/providers/verify |
| GET | `/mail/templates` | Get all available email templates GET /mail/templates |

---

## Controller KHÔNG được mount

> 4 endpoint · 1 controller.

### AuthController `/auth`

> `AuthController` · Guard: không khai báo ở cấp controller (`@Public()` cấp controller)

| Method | Path | Mô tả |
|---|---|---|
| POST | `/auth/signup` | `signup()` [Public] |
| POST | `/auth/signin` | `signin()` [Public] |
| POST | `/auth/logout` | `logout()` [Guard: JwtAuthGuard] |
| POST | `/auth/refresh` | `refreshTokens()` [Public] |

---

## Đã gỡ khỏi source (so với catalog ngày trước)

| Method | Path cũ | Ghi chú |
|---|---|---|
| GET | `/admin/companies/import` | Không còn handler; `POST /admin/companies/import` vẫn còn. Lý do chưa rõ |
| GET | `/admin/order-deadline-configs` | Không còn `order-deadline` nào trong `src/` — lý do chưa rõ |
| POST | `/admin/order-deadline-configs` | như trên |
| GET | `/admin/order-deadline-configs/effective` | như trên |
| GET | `/health` | Đã đổi thành `GET /health-check` (`HealthCheckController`) — path cũ không còn |

---

## Quy tắc đặt endpoint

- Admin endpoints: `GET /admin/<resource>s` → list, `GET /admin/<resource>s/:id` → detail
- Company Admin prefix: `/company-admin/...` (không phải `/admin-company/...`)
- Supplier/Driver/Deliverer: prefix riêng, guard riêng, không dùng chung với admin
- User endpoints: prefix không có module (mount trực tiếp ở root `""`) — ví dụ `/user/me`, `/auth/user/login`
- Route literal phải khai báo trước route `:id` cùng cấp (Nest match theo thứ tự khai báo)
- Webhook routes không expose trong Swagger (`@ApiExcludeEndpoint()`)
- Public routes (không auth): dùng `@Public()` decorator

---

> Cập nhật file này mỗi khi thêm/đổi/xóa controller method.
