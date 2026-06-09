# SPEC: Đặt hàng Nhà cung cấp (Supplier Ordering)

> **Domain:** BF_[ĐẶT HÀNG NCC] Đặt hàng Nhà cung cấp
> **Backlog ID:** ESKITCHEN-1240
> **SPEC Transfer:** False (chưa có spec trước, tạo mới từ domain)
> **Phase:** Phase 2
> **Tạo:** 2026-06-03

---

## Mô tả nghiệp vụ

Quy trình đặt hàng từ hệ thống ESKitchen gửi đến Nhà cung cấp (Supplier). System Admin chốt số lượng đặt hàng và tạo đơn gửi Nhà cung cấp. Nhà cung cấp đăng nhập vào Web riêng để xem đơn hàng, xác nhận ngày dự kiến xuất hàng, thực hiện báo cáo xuất hàng thực tế, và tải CSV danh sách đơn. Đầu tháng hệ thống gửi đơn tạm tính đến Nhà cung cấp.

**Mốc thời gian trên 1 đơn hàng (theo thứ tự nghiệp vụ):**

| Mốc | Mô tả | Ai tạo |
|---|---|---|
| 1. Ngày tạo đơn | Thời điểm đơn hàng được tạo | Company Admin tạo order → System Admin chốt |
| 2. Ngày dự kiến giao hàng (picking date) | Lấy từ hợp đồng, System Admin điền | System Admin |
| 3. Ngày thực tế giao hàng | Driver App chụp ảnh và submit | Driver (E06) |
| 4. Ngày dự kiến xuất hàng | Supplier nhập khi phản hồi đơn | Supplier (E04) |
| 5. Ngày xuất hàng thực tế | Supplier fill khi đã gửi cho kho | Supplier (E04) |

**Tham chiếu:** [Google Sheet tạm tính NCC](https://docs.google.com/spreadsheets/d/1tHmr2ZS5z8ZjJf0oLtBfsMFENk7GFxPJTpDDHsWm9DM/edit?gid=493112000#gid=493112000)

---

## Actors & Preconditions

### Actors liên quan

| Actor | Repo | Vai trò trong feature |
|---|---|---|
| **E03 — System Admin** | `es-kitchen-web-admin` | Quản lý tài khoản Supplier; tạo/chốt đơn hàng gửi NCC |
| **E04 — Supplier** | `es-kitchen-web-supplier` | Đăng nhập, xem đơn, xác nhận ngày xuất, báo cáo xuất hàng, tải CSV |
| **E06 — Driver** | `es-kitchen-webapp-driver` | Cập nhật ngày thực tế giao hàng (dependency từ feature Giao hàng) |
| **API** | `es-kitchen-api` | Business logic, lưu trữ, auth, notification |

> **Cross-repo:** feature ảnh hưởng E03 + E04 + API (tối thiểu 3 repo). Cần Contract Lock trước Phase 3.

### Preconditions

- System Admin đã đăng nhập vào `es-kitchen-web-admin`
- Tài khoản Supplier đã được System Admin tạo trong hệ thống
- Supplier đã đăng nhập vào `es-kitchen-web-supplier`
- Đơn hàng đã được tạo (từ luồng Menu & Order — ESKITCHEN-1239)
- Hợp đồng công ty đã có picking date (từ luồng Hợp đồng — ESKITCHEN-1235)

**TODO (BA):** Supplier account do System Admin tạo thủ công hay có flow tự đăng ký? Confirm với client.

---

## Cấu trúc đơn hàng Supplier (Order Template)

Mô tả đầy đủ các trường dữ liệu của 1 đơn hàng từ System Admin gửi đến Supplier, bao gồm các mốc thời gian và vòng đời trạng thái.

### 1. Header đơn hàng (System Admin tạo)

| Field | Tên hiển thị | Kiểu dữ liệu | Ví dụ | Ghi chú |
|---|---|---|---|---|
| `order_code` | Số đơn hàng | string | `SO-2026-0601-001` | Auto-generate |
| `created_at` | Ngày tạo đơn | date | `2026-06-01` | Mốc 1 |
| `company_name` | Tên công ty đặt hàng | string | `株式会社ABC` | Công ty đặt order từ luồng ESKITCHEN-1239 |
| `picking_date` | Ngày dự kiến giao hàng | date | `2026-06-10` | Mốc 2 — lấy từ contract (ESKITCHEN-1235) |
| `delivery_location` | Nơi giao hàng | string | `東京都渋谷区XX 1-2-3` | Địa chỉ kho nhận hàng |
| `status` | Trạng thái đơn | enum | `waiting_response` | Xem bảng trạng thái bên dưới |
| `admin_note` | Ghi chú System Admin | string (optional) | — | |

### 2. Danh sách sản phẩm (Line Items — 1 đơn có thể có nhiều dòng)

| Field | Tên hiển thị | Kiểu dữ liệu | Ví dụ | Ghi chú |
|---|---|---|---|---|
| `product_code` | Mã sản phẩm | string | `PRD-001` | |
| `product_name` | Tên sản phẩm | string | `豚バラ肉 スライス` | |
| `quantity` | Số lượng đặt | number | `50` | |
| `unit` | Đơn vị | string | `kg` | |
| `requested_expiry_date` | Hạn sử dụng yêu cầu | date | `2026-06-20` | Admin điền yêu cầu |

### 3. Phản hồi Supplier — Ngày dự kiến xuất (Supplier điền — Mốc 4)

| Field | Tên hiển thị | Kiểu dữ liệu | Ví dụ | Ghi chú |
|---|---|---|---|---|
| `planned_shipping_date` | Ngày dự kiến xuất hàng | date | `2026-06-08` | Mốc 4 — trigger chuyển trạng thái |
| `supplier_response_note` | Ghi chú phản hồi | string (optional) | `在庫確認済み` | |

### 4. Báo cáo xuất hàng thực tế (Supplier điền — Mốc 5)

| Field | Tên hiển thị | Kiểu dữ liệu | Ví dụ | Ghi chú |
|---|---|---|---|---|
| `actual_shipping_date` | Ngày xuất hàng thực tế | date | `2026-06-08` | Mốc 5 |
| `transport_company` | Tên công ty vận chuyển | string | `ヤマト運輸` | Nhập text tự do (Out of scope: tích hợp Yamato/Sagawa) |
| `payment_method` | Phương thức thanh toán | enum | `銀行振込` | **TODO (BA):** xác nhận danh sách phương thức với client |
| `actual_expiry_date` | Hạn sử dụng thực tế sản phẩm | date | `2026-06-25` | Supplier điền khi xuất hàng thực tế |
| `shipping_note` | Ghi chú xuất hàng | string (optional) | — | |

### 5. Xác nhận giao hàng (Driver App điền — dependency E06, Mốc 3)

| Field | Tên hiển thị | Kiểu dữ liệu | Ví dụ | Ghi chú |
|---|---|---|---|---|
| `actual_delivery_date` | Ngày giao hàng thực tế | date | `2026-06-09` | Mốc 3 — Driver chụp ảnh + submit trên E06 |

---

### Vòng đời trạng thái (Status Flow)

> **TODO (BA) — AF-04:** Cần xác nhận tên status chính xác (tiếng Nhật / tiếng Anh) với client. Bảng dưới dùng tên tạm.

| Status | Tên tạm (VI) | Trigger | Hiển thị trên E04 |
|---|---|---|---|
| `waiting_response` | Chờ phản hồi ngày xuất | System Admin tạo và gửi đơn | Tab "Chờ phản hồi ngày giao" |
| `response_confirmed` | Đã xác nhận ngày dự kiến xuất | Supplier nhập `planned_shipping_date` và lưu | Tab "Chờ xuất hàng" |
| `shipped` | Đã xuất hàng | Supplier submit báo cáo xuất hàng thực tế | Tab "Đã xuất hàng" |
| `delivered` | Đã giao hàng | Driver App submit `actual_delivery_date` (E06) | — (phụ thuộc E06, xác nhận UI sau) |

```
System Admin tạo & gửi đơn
        ↓
[waiting_response] Chờ phản hồi ngày xuất
        ↓  Supplier nhập planned_shipping_date (Mốc 4)
[response_confirmed] Đã xác nhận ngày dự kiến xuất
        ↓  Supplier submit báo cáo xuất hàng (Mốc 5)
[shipped] Đã xuất hàng
        ↓  Driver App confirm giao hàng (E06 — Mốc 3)
[delivered] Đã giao hàng
```

---

### Ví dụ đơn hàng cụ thể

**Đơn hàng: SO-2026-0601-001** (trạng thái: Chờ phản hồi ngày xuất)

| Trường | Giá trị |
|---|---|
| Số đơn | SO-2026-0601-001 |
| Ngày tạo | 2026-06-01 |
| Công ty đặt hàng | 株式会社ABC |
| Ngày dự kiến giao hàng (picking date) | 2026-06-10 |
| Nơi giao hàng | 東京都渋谷区XX 1-2-3 ABC倉庫 |
| Trạng thái | Chờ phản hồi ngày xuất |
| Ghi chú Admin | — |

**Danh sách sản phẩm:**

| Mã SP | Tên sản phẩm | Số lượng | Đơn vị | Hạn SX yêu cầu |
|---|---|---|---|---|
| PRD-001 | 豚バラ肉 スライス | 50 | kg | 2026-06-20 |
| PRD-002 | 鶏もも肉 | 30 | kg | 2026-06-20 |
| PRD-003 | 玉ねぎ | 20 | kg | 2026-06-25 |

**Phản hồi Supplier (chưa điền — trạng thái hiện tại):**

| Trường | Giá trị |
|---|---|
| Ngày dự kiến xuất | *(chờ Supplier điền)* |
| Ghi chú | *(chờ Supplier điền)* |

---

## Happy Path

### Luồng 1 — System Admin quản lý tài khoản Supplier (E03)

1. System Admin vào màn hình **Supplier Management** — xem danh sách tài khoản Supplier.
2. System Admin tìm kiếm Supplier theo tên / mã.
3. System Admin chỉnh sửa hoặc xóa thông tin tài khoản Supplier khi cần.

### Luồng 2 — Supplier đăng nhập và xem thông báo (E04)

1. Supplier truy cập `es-kitchen-web-supplier`, nhập ID / Mật khẩu → đăng nhập thành công.
2. Hệ thống hiển thị **TOP screen** với danh sách thông báo quan trọng.
3. Supplier click vào tiêu đề thông báo → Dropdown mở ra hiển thị nội dung chi tiết.
4. Supplier tải xuống file đính kèm (nếu có).
5. Supplier đăng xuất khi xong.

### Luồng 3 — Supplier xem và xử lý đơn hàng (E04)

1. Supplier vào màn hình **Order List** — hệ thống hiển thị danh sách đơn theo tab trạng thái.
2. Supplier lọc đơn theo: tháng/năm, ngày xuất hàng, trạng thái.
3. Supplier click vào đơn → xem **Order Details**: Số đơn, Ngày giao mong muốn, Hạn sử dụng, Tên sản phẩm, Số lượng, Nơi giao hàng.
4. Supplier nhập **ngày dự kiến xuất hàng** (shipping schedule response) + ghi chú/bình luận → lưu.
5. Hệ thống tự động cập nhật trạng thái đơn hàng.
6. Khi đã xuất hàng thực tế, Supplier thực hiện **Shipping processing**: chọn phương thức thanh toán, nhập ngày xuất hàng thực tế, tên công ty vận chuyển, hạn sử dụng sản phẩm, ghi chú → submit.
7. Hệ thống cập nhật trạng thái đơn sang trạng thái xuất hàng thực tế.

### Luồng 4 — Supplier tải CSV (E04)

1. Supplier vào màn hình Order List.
2. Supplier chọn điều kiện: khoảng thời gian chỉ định hoặc từng sản phẩm.
3. Supplier nhấn **CSV Download** → file CSV được tạo và tải về thiết bị.

### Luồng 5 — Supplier đổi mật khẩu (E04)

1. Supplier vào màn hình **Change Password**.
2. Supplier nhập mật khẩu hiện tại và mật khẩu mới.
3. Hệ thống xác nhận và cập nhật mật khẩu.

### Luồng 6 — Supplier quên mật khẩu (E04)

1. Tại màn hình Login, Supplier chọn **Forgot Password**.
2. Hệ thống gửi link cấp lại mật khẩu đến email đã đăng ký.
3. Supplier đặt lại mật khẩu qua link.

---

## Alternative Flows & Edge Cases

### AF-01: Đơn hàng bị chỉnh sửa sau khi Supplier đã phản hồi ngày xuất

**TODO (BA):** Khi System Admin thay đổi số lượng đơn sau khi Supplier đã nhập ngày dự kiến xuất hàng, hệ thống xử lý thế nào? Supplier có nhận thông báo không? Trạng thái đơn có reset về "Chờ phản hồi" không?

### AF-02: Supplier nhập ngày dự kiến xuất hàng quá hạn so với picking date

**TODO (BA):** Hệ thống có validate ngày dự kiến xuất hàng phải trước hoặc bằng picking date không? Nếu vi phạm, hiển thị lỗi hay chỉ cảnh báo?

### AF-03: Xóa tài khoản Supplier đang có đơn hàng đang xử lý

**TODO (BA):** System Admin xóa tài khoản Supplier khi đơn hàng chưa hoàn thành — hệ thống block hay cho phép? Đơn hàng pending xử lý thế nào?

### AF-04: Tab trạng thái đơn hàng trên Order List

**TODO (BA):** Cần xác nhận toàn bộ danh sách trạng thái (status) và tên tab hiển thị. Domain đề cập "Chờ phản hồi ngày giao", "Chờ xuất hàng" — cần danh sách đầy đủ để thiết kế đúng.

### AF-05: Đơn tạm tính đầu tháng

**TODO (BA):** Đơn tạm tính gửi Supplier đầu tháng là gửi tự động hay thủ công? Gửi qua kênh nào (email, hiển thị trong web)? Format đơn tạm tính lấy từ Google Sheet tham chiếu cần được confirm chi tiết.

### AF-06: Đăng nhập sai mật khẩu nhiều lần

Hệ thống cần xử lý giới hạn số lần đăng nhập sai (lockout). **TODO (BA):** Xác nhận số lần tối đa và thời gian lock với client.

### AF-07: CSV download khi không có dữ liệu

Khi điều kiện lọc không trả về đơn hàng nào, hệ thống hiển thị thông báo phù hợp thay vì tải file rỗng.

### AF-08: File đính kèm trong thông báo (Announcement)

**TODO (BA):** Loại file đính kèm được phép (PDF, Excel, image)? Giới hạn dung lượng file? Ai có quyền đăng thông báo — chỉ System Admin hay cả các vai trò khác?

---

## Acceptance Criteria

### AC-01: Quản lý tài khoản Supplier (System Admin)

- [ ] System Admin xem được danh sách tài khoản Supplier với thông tin cơ bản (tên, mã, trạng thái)
- [ ] System Admin tìm kiếm Supplier theo tên hoặc mã — kết quả hiển thị đúng
- [ ] System Admin chỉnh sửa thông tin Supplier — thay đổi được lưu thành công
- [ ] System Admin xóa tài khoản Supplier — tài khoản không còn đăng nhập được
- [ ] Tài khoản Supplier đã bị xóa không xuất hiện trong danh sách

### AC-02: Đăng nhập / Đăng xuất / Quên mật khẩu (Supplier)

- [ ] Supplier đăng nhập thành công với ID / Mật khẩu đúng
- [ ] Đăng nhập sai hiển thị thông báo lỗi, không vào được hệ thống
- [ ] Supplier đăng xuất — session bị hủy, không truy cập được trang yêu cầu auth
- [ ] Chức năng quên mật khẩu gửi link reset đến email đã đăng ký
- [ ] Link reset mật khẩu có thời hạn (expire)

### AC-03: TOP Screen — Thông báo (Supplier)

- [ ] Màn hình TOP hiển thị danh sách thông báo theo thứ tự thời gian (mới nhất trên cùng)
- [ ] Click vào tiêu đề thông báo mở Dropdown hiển thị nội dung chi tiết
- [ ] Click lại vào tiêu đề đóng Dropdown
- [ ] File đính kèm hiển thị link tải, click tải xuống thành công

### AC-04: Danh sách đơn hàng — Order List (Supplier)

- [ ] Đơn hàng được phân tab theo trạng thái, số lượng đơn trên mỗi tab hiển thị đúng
- [ ] Lọc theo tháng/năm trả về đúng đơn trong khoảng thời gian
- [ ] Lọc theo ngày xuất hàng trả về đúng đơn
- [ ] Lọc theo trạng thái trả về đúng đơn
- [ ] Trạng thái đơn tự động cập nhật khi Supplier thực hiện hành động

### AC-05: Chi tiết đơn hàng & Phản hồi ngày xuất (Supplier)

- [ ] Chi tiết đơn hiển thị đầy đủ: Số đơn, Ngày giao mong muốn, Hạn sử dụng, Tên sản phẩm, Số lượng, Nơi giao hàng
- [ ] Supplier nhập ngày dự kiến xuất hàng và ghi chú → lưu thành công
- [ ] Sau khi Supplier lưu, trạng thái đơn chuyển sang trạng thái tiếp theo
- [ ] Ô ghi chú/bình luận cho phép nhập text tự do

### AC-06: Báo cáo xuất hàng thực tế (Supplier)

- [ ] Supplier chọn phương thức thanh toán từ danh sách cho phép
- [ ] Supplier nhập đầy đủ: ngày xuất hàng thực tế, tên công ty vận chuyển, hạn sử dụng sản phẩm, ghi chú
- [ ] Submit thành công → trạng thái đơn chuyển sang "đã xuất hàng"
- [ ] Dữ liệu báo cáo xuất hàng được lưu và hiển thị lại đúng trong chi tiết đơn

### AC-07: CSV Download (Supplier)

- [ ] Supplier chọn điều kiện lọc (khoảng thời gian) → CSV tải về đúng dữ liệu trong khoảng
- [ ] Supplier chọn từng sản phẩm → CSV tải về đúng dữ liệu sản phẩm đó
- [ ] File CSV có encoding phù hợp (UTF-8 BOM hoặc Shift-JIS — **TODO (BA):** xác nhận encoding với client Nhật)
- [ ] Khi không có dữ liệu → hiển thị thông báo, không tải file rỗng

### AC-08: Đổi mật khẩu (Supplier)

- [ ] Supplier đổi mật khẩu thành công với mật khẩu hiện tại đúng
- [ ] Nhập mật khẩu hiện tại sai → hiển thị lỗi, không đổi được
- [ ] Mật khẩu mới phải đáp ứng độ phức tạp tối thiểu (độ dài, ký tự — **TODO (BA):** xác nhận policy mật khẩu)

---

## Dependencies

| Dependency | Feature / Backlog | Lý do |
|---|---|---|
| Đơn hàng tồn tại | ESKITCHEN-1239 (Menu & Order) | Supplier chỉ thấy đơn sau khi order được tạo từ luồng Menu & Order |
| Picking date | ESKITCHEN-1235 (Hợp đồng) | Mốc 2 (ngày dự kiến giao hàng) lấy từ contract |
| Ngày giao thực tế | ESKITCHEN-1238 (Driver App) | Mốc 3 (ngày thực tế giao hàng) do Driver App submit |
| Auth / JWT | Feature authentication | Supplier login dùng cùng auth system |

---

## Out of Scope

- Supplier tự đăng ký tài khoản (System Admin tạo tài khoản — xem **TODO AF-03**)
- Chức năng chat real-time giữa Supplier và System Admin
- Thanh toán giữa ESKitchen và Supplier (đây là đơn đặt mua nguyên liệu, không phải thanh toán end-user)
- Quản lý tồn kho phía Supplier
- App mobile cho Supplier (chỉ có Web)
- Push notification Firebase cho Supplier (Supplier dùng Web, không có mobile app)
- Tích hợp Yamato/Sagawa cho Supplier — tên công ty vận chuyển chỉ nhập text

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn | Figma Link |
|---|---|---|---|---|---|---|
| AW_SUPO_001 | Supplier Management | E03 | E03 (es-kitchen-web-admin) | List | Xem danh sách, tìm kiếm, chỉnh sửa, xóa tài khoản Supplier | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-75411&m=dev) |
| SW_SUPO_001 | Login | E04 | E04 (es-kitchen-web-supplier) | Form | Đăng nhập bằng ID / Mật khẩu | [Figma](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=16479-124158&m=dev) |
| SW_SUPO_002 | Forgot Password | E04 | E04 (es-kitchen-web-supplier) | Form | Nhập email để nhận link reset mật khẩu *inferred | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-75640&m=dev) |
| SW_SUPO_003 | Reset Password *inferred | E04 | E04 (es-kitchen-web-supplier) | Form | Đặt lại mật khẩu qua link email | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-75658&m=dev) |
| SW_SUPO_004 | TOP Screen (Announcement) | E04 | E04 (es-kitchen-web-supplier) | List | Màn hình chính: danh sách thông báo + dropdown chi tiết + tải file đính kèm | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-75676&m=dev) |
| SW_SUPO_005 | Order List | E04 | E04 (es-kitchen-web-supplier) | List | Danh sách đơn hàng phân tab theo trạng thái, lọc theo tháng/năm/ngày xuất/trạng thái | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19607-74826&m=dev) |
| SW_SUPO_006 | Order Detail | E04 | E04 (es-kitchen-web-supplier) | Detail | Chi tiết đơn: Số đơn, ngày giao, hạn sử dụng, sản phẩm, số lượng, nơi giao hàng | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-75905&m=dev) |
| SW_SUPO_007 | Shipping Schedule Response | E04 | E04 (es-kitchen-web-supplier) | Form | Nhập ngày dự kiến xuất hàng và ghi chú phản hồi đơn (Mốc 4) *inferred | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-75995&m=dev) |
| SW_SUPO_008 | Shipping Report Form | E04 | E04 (es-kitchen-web-supplier) | Modal | Báo cáo xuất hàng thực tế (Modal trong Order Detail): ngày xuất, công ty vận chuyển, thanh toán, hạn sử dụng (Mốc 5) | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-76085&m=dev) |
| SW_SUPO_009 | CSV Download | E04 | E04 (es-kitchen-web-supplier) | Form | Chọn điều kiện lọc (khoảng thời gian / sản phẩm) và tải CSV đơn hàng | [Figma (high-fi)](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=19619-76175&m=dev) |
| SW_SUPO_010 | Change Password | E04 | E04 (es-kitchen-web-supplier) | Form | Đổi mật khẩu: nhập mật khẩu hiện tại và mật khẩu mới | TBD — reuse existing design |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được sign-off:

1. "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/supplier-ordering/SPEC.md`"
   - Cần tạo DESIGN.md cho: `es-kitchen-api`, `es-kitchen-web-admin` (E03), `es-kitchen-web-supplier` (E04)

2. "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/supplier-ordering/SPEC.md`"
   - Slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT
   - Slash command: `/test/generate_testcases_from_requirements` cho QUICK

> **Contract Lock cần thiết** (cross-repo: API + E03 + E04) trước khi bắt đầu Phase 3 FE implementation. PM cần schedule Contract Lock session sau khi 3 DESIGN.md hoàn thành.

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/supplier-ordering/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/supplier-ordering/SPEC.md)
