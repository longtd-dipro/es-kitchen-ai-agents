# BF_THANH TOÁN Thanh toán & Hoàn tiền

> Domain slug: `thanh-toan` · 7 stories (Phase 1) + **2 thêm mới / 4 xóa** (Phase 2)

## Stories

| ID | EPIC | STORY | STORY_2 | STORY_3 | DESCRIPTION | PRIORITY | BUSINESS FLOW |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | ユーザーモバイルアプリ-UserMobileApp_画面一覧 |  |  | Thanh toán bằng Rakuten Pay | Nhập thông tin thẻ. Giả định sử dụng SDK của dịch vụ elepay thuộc công ty ELESTYLE. | 1 | [THANH TOÁN] Thanh toán & Hoàn tiền |
| 01 | ユーザーモバイルアプリ-UserMobileApp_画面一覧 |  |  | Thanh toán bằng Alipay | Nhập thông tin thẻ. Dự kiến sử dụng SDK của dịch vụ elepay từ công ty ELESTYLE. | 1 | [THANH TOÁN] Thanh toán & Hoàn tiền |
| 01 | ユーザーモバイルアプリ-UserMobileApp_画面一覧 |  |  | Thanh toán bằng WeChat Pay | Nhập thông tin thẻ. Dự kiến sử dụng SDK của dịch vụ elepay từ công ty ELESTYLE. | 1 | [THANH TOÁN] Thanh toán & Hoàn tiền |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | invoice | List of invoices |  | Xem danh sách hóa đơn thanh toán hàng tháng và tải PDF hóa đơn. | 4 | [THANH TOÁN] Thanh toán & Hoàn tiền |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Invoice-related notifications |  | Nhận thông báo qua chuông hệ thống/email ngay khi Tổng bộ phát hành hóa đơn mới. | 4 | [THANH TOÁN] Thanh toán & Hoàn tiền |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | invoice | Invoices by contract |  | Phát hành hóa đơn hàng tháng theo hợp đồng. Tự động assign Task cho bộ phận Kế toán. Tự điền nội dung hóa đơn và gửi thông báo Download cho Pháp nhân. | 4 | [THANH TOÁN] Thanh toán & Hoàn tiền |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Invoice preview |  |  | 4 | [THANH TOÁN] Thanh toán & Hoàn tiền |
---

## Phase 2 Scope Changes (2026-07)

> Nguồn: `management/specification/Business_flow_scope_change.xlsx` · BF07

### Thêm mới (2 mục)

| EPIC | Screen Code | L1 (Tính năng) | L2 | L3 | Chi tiết |
| --- | --- | --- | --- | --- | --- |
| E02 | (NEW) | Hóa đơn | Tích hợp API hóa đơn | | Tích hợp API với hệ thống phát hành hóa đơn Bill One |
| E03 | AW_INVOICE_001 | QL hợp đồng | DS phí thu | Tích hợp API Bill One | Tự động tích hợp số tiền hóa đơn đã chốt với Bill One qua API; không nhập tay |

### Xóa đi (4 mục)

| EPIC | Screen Code | L1 (Tính năng) | L2 | L3 | Lý do xóa |
| --- | --- | --- | --- | --- | --- |
| E01 | (?) | Thanh toán | Chọn phương thức | Thanh toán Rakuten Pay | Phase 1 - Elepay không hỗ trợ Rakuten Pay |
| E01 | (?) | Thanh toán | Chọn phương thức | Thanh toán Alipay | Elepay không hỗ trợ Alipay |
| E02 | (?) | Hóa đơn | Danh sách hóa đơn | | Thay bằng tích hợp Bill One |
| E02 | (?) | Hóa đơn | Thông báo liên quan hóa đơn | | Thay bằng tích hợp Bill One |
