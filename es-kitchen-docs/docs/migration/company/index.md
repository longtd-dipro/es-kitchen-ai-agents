# Khách Hàng & User

## Files

| File | Records | Download |
|---|---|---|
| `csv_customer_info` | 701 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/csv_customer_info.json) |
| `scraped_customers` | 725 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_customers.json) |
| `scraped_users` | 841 | [↓ GitHub](https://github.com/longtd-dipro/es-kitchen-ai-agents/blob/main/data/transformed/scraped_users.json) |

---

## csv_customer_info — 701 records

Master hợp đồng: thông tin công ty + điều khoản giao hàng.

| Field | Type | Mô tả |
|---|---|---|
| `customer_id` | `string` | ID khách hàng, ví dụ `CU00001` |
| `contract_plan_id` | `string` | ID hợp đồng/plan, ví dụ `CP00001574` |
| `name` | `string` | Tên công ty (tiếng Nhật) |
| `name_kana` | `string` | Tên công ty (katakana) |
| `plan_name` | `string` | Tên plan, ví dụ `200プラン` |
| `plan_fee` | `float` | Phí hợp đồng hàng tháng (JPY) |
| `contract_start` | `YYYY-MM` | Tháng bắt đầu hợp đồng |
| `contract_end` | `YYYY-MM` | Tháng kết thúc hợp đồng |
| `delivery_company` | `string` | Công ty vận chuyển: `ヤマト運輸` / `自社便` |
| `delivery_type` | `string` | Loại vận chuyển: `COOL便` / `ES配送` |
| `delivery_count` | `float` | Số đợt giao/tháng (thường 2 hoặc 4) |
| `delivery_week` | `string` | Tuần giao trong tháng, ví dụ `1,3` (tuần 1 và 3) |
| `delivery_day` | `string` | Ngày trong tuần giao, ví dụ `火` (thứ Ba) |
| `warehouse` | `string` | Kho xuất hàng cho công ty này |
| `delivery_note` | `string\|null` | Ghi chú giao hàng |
| `monthly_item_count` | `float` | Số suất ăn/tháng theo plan |
| `delivery_name` | `string` | Tên người/đơn vị nhận hàng |
| `section` | `string` | Phòng ban nhận hàng |
| `person_name` | `string` | Tên người liên hệ |
| `postal_code` | `string` | Mã bưu chính địa chỉ nhận |
| `prefecture` | `string` | Tỉnh/thành |
| `city` | `string` | Quận/huyện/phường |
| `address` | `string` | Địa chỉ chi tiết |
| `tel` | `string` | *(anonymized: `000-0000-0000`)* |
| `main_contact_name` | `string` | Tên người liên hệ chính |
| `main_contact_email` | `string` | *(anonymized: @yopmail.com)* |
| `main_contact_tel` | `string` | *(anonymized)* |
| `payment_method` | `string` | `クレジット決済` / `お振込み` / `口座振替` |
| `employee_count` | `float\|null` | Số nhân viên công ty |
| `status` | `string` | `本登録` |
| `note` | `string\|null` | Ghi chú nội bộ |

---

## scraped_customers — 725 records

Thông tin mở rộng công ty từ web scraping — bổ sung cho `csv_customer_info`.

| Field | Type | Mô tả |
|---|---|---|
| `customer_id` | `string` | ID khách hàng `CU#####` — khóa liên kết |
| `name` | `string` | Tên công ty |
| `name_kana` | `string` | Tên công ty (katakana) |
| `user_id` | `string\|null` | UserId đăng nhập liên kết (→ `scraped_users`) |
| `postal_code` | `string` | Mã bưu chính |
| `prefecture` | `string` | Tỉnh |
| `city` | `string` | Thành phố/quận |
| `address` | `string` | Địa chỉ |
| `full_address` | `string` | Địa chỉ đầy đủ nối chuỗi |
| `section` | `string\|null` | Phòng ban |
| `tel` | `string` | *(anonymized)* |
| `fax` | `string\|null` | *(anonymized)* |
| `person1` | `string\|null` | Người liên hệ 1 |
| `person_tel1` | `string\|null` | *(anonymized)* |
| `email1` | `string` | *(anonymized: @yopmail.com)* |
| `invoice_email` | `string` | Email nhận hóa đơn *(anonymized)* |
| `payment` | `string` | `クレジット決済` / `お振込み` |
| `status` | `string` | `仮登録` / `本登録` |
| `memo` | `string\|null` | Ghi chú tự do |

---

## scraped_users — 841 records

Tất cả tài khoản đăng nhập: ES Kitchen staff, công ty khách hàng, supplier, driver.

| Field | Type | Mô tả |
|---|---|---|
| `UserId` | `string` | ID đăng nhập, ví dụ `ES000001` |
| `Password` | `string\|null` | Mật khẩu (null sau migration) |
| `Name` | `string` | Tên hiển thị |
| `CorpKbn` | `string` | Loại tổ chức (xem enum bên dưới) |
| `CorpKbnName` | `string` | Tên loại tổ chức |
| `CorpId` | `string` | ID tổ chức: `OW00001` (ES Kitchen) / `CU#####` / `SU#####` |
| `CorpName` | `string` | Tên tổ chức |
| `CorpNameKana` | `string` | Tên tổ chức (katakana) |
| `Status` | `string\|null` | Trạng thái tài khoản |
| `StatusName` | `string\|null` | Tên trạng thái |
| `Authority` | `int` | Cấp quyền (0 = thấp nhất) |
| `IsDefaultFlg` | `bool\|null` | Flag mặc định |
| `IsDefault` | `bool` | Là tài khoản mặc định không |
| `Mail` | `string\|null` | *(anonymized: @yopmail.com)* |
| `IsOverride` | `bool` | Có quyền override không |
| `IsAdmin` | `bool` | Là admin không |
| `IsDriver` | `bool` | Là tài xế không |

**Enum `CorpKbn`:**

| Giá trị | Tên | Ý nghĩa |
|---|---|---|
| `0` | ESキッチン | Nhân viên nội bộ ES Kitchen |
| `1` | お客様 | Tài khoản công ty khách hàng |
| `2` | 仕入先 | Tài khoản nhà cung cấp (supplier) |
| `3` | 委託配送 | Tài khoản công ty vận chuyển / tài xế |
| `4` | ESキッチン倉庫 | Tài khoản quản lý kho ES Kitchen |
