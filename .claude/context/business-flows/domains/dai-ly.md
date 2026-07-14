# BF_ĐẠI LÝ Quản lý Đại lý (Agency & Partner)

> Domain slug: `dai-ly` · 10 stories · Nguồn: `es-kitchen-requirements/markerting_daily_function_list.xlsx` (sheet `BF_ ĐẠI LÝ`)
> Cập nhật: 2026-07-03 (theo file xlsx mới)

## Phạm vi

Domain Đại lý bao gồm toàn bộ **operations** trên danh sách đại lý và đối tác tiếp thị:
- Danh sách + đăng ký đại lý mới
- Quản lý cơ hội giới thiệu (referral) từ đại lý → pháp nhân
- Quản lý doanh số theo đại lý
- Quản lý và thanh toán hoa hồng hàng tháng (tự sinh dự toán, cập nhật trạng thái, xuất CSV)
- Dashboard hiệu suất giới thiệu

> Phần **Referral Campaign / Free Sample Campaign / Referral Approval Plan A/B/C/D** thuộc domain `marketing` — không lặp lại tại đây.

## Stories

| ID | EPIC | STORY | STORY_2 | STORY_3 | DESCRIPTION | PRIORITY | BUSINESS FLOW |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Agency and Partner Management | List of Agents and Partners |  | Hiển thị danh sách thông tin các đại lý/đối tác. Quản lý tên đại lý, điều kiện hợp đồng, và tỷ lệ hoa hồng. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | New Agent/Partner Registration |  | Đăng ký thông tin đại lý hoặc đối tác mới. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Referral management | List of referral opportunities | Quản lý và liên kết thông tin giữa đại lý giới thiệu và pháp nhân (công ty) được giới thiệu. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Referral details, editing, deletion | Quản lý chi tiết nội dung và cập nhật tình trạng tiến độ của từng dự án giới thiệu khách hàng. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Sales management by agency |  | Quản lý doanh số và doanh thu được tạo ra từ mỗi đại lý khác nhau. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | List of fee payment options | Danh sách quản lý các khoản thanh toán hoa hồng (Fee) cho đại lý. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Auto-generated monthly fee payment list | Tự động tạo danh sách dự toán số tiền hoa hồng cần thanh toán hàng tháng cho các đại lý. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Payment status update | Cập nhật trạng thái thanh toán hoa hồng (Chưa thanh toán / Đã thanh toán). | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | CSV Download | Tải xuống dữ liệu danh sách thanh toán hoa hồng dưới dạng file CSV. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Referral Performance Dashboard |  | Dashboard tổng hợp số lượng pháp nhân được giới thiệu và doanh thu, hiển thị biểu đồ xu hướng. | 9 | [ĐẠI LÝ] Quản lý Đại lý (Agency & Partner) |

## Changelog vs bản trước

- **Không có thay đổi so với bản xlsx trước.** 10 stories giữ nguyên; chỉ cập nhật meta (nguồn file, ngày).

---

## Phase 2 Scope Changes (2026-07)

> Nguồn: `management/specification/Business_flow_scope_change.xlsx` · BF12

### Thêm mới (7 mục) — Mô hình QL giới thiệu mới (thay thế Agency & Campaign cũ)

| EPIC | Screen Code | L1 (Tính năng) | L2 | L3 | Chi tiết |
| --- | --- | --- | --- | --- | --- |
| E03 | (NEW) | QL giới thiệu | DS đại lý | | DS đại lý: thông tin cơ bản, PLAN phí GT đang apply, tình trạng HĐ, tổng số GT, số tiền thưởng chưa trả |
| E03 | (NEW) | QL giới thiệu | CRUD đại lý | | Xem/edit thông tin cơ bản, người phụ trách, setting HĐ/thưởng, memo, tóm tắt thực tế, DS đơn GT |
| E03 | AW_PLAN_001 | QL giới thiệu | CRUD đại lý | QL PLAN phí GT | Đăng ký/edit/xóa PLAN phí GT (một lần/liên tục/đặc biệt); số tiền cố định, tỷ lệ, thời gian apply |
| E03 | (NEW) | QL giới thiệu | DS giới thiệu | | DS chéo từ pháp nhân + đại lý: loại nguồn GT, nguồn GT, pháp nhân đích, trạng thái... |
| E03 | (NEW) | QL giới thiệu | Chi tiết giới thiệu | | Thông tin GT, thông tin chốt HĐ, PLAN + phí GT apply, tình trạng thanh toán + lịch sử |
| E03 | (NEW) | QL giới thiệu | DS thanh toán phí GT hàng tháng | | DS tình trạng phát sinh phí GT theo tháng: nguồn GT, số đơn, số tiền phát sinh, trạng thái |
| E03 | (NEW) | QL giới thiệu | Chi tiết thanh toán phí GT | | Breakdown đơn GT + phí GT theo tháng + nguồn; update thủ công trạng thái thanh toán |

### Xóa đi (5 mục)

| EPIC | Screen Code | L1 (Tính năng) | L2 | L3 | Lý do xóa |
| --- | --- | --- | --- | --- | --- |
| E02 | (?) | Chiến dịch giới thiệu | Form giới thiệu KH | | Admin vận hành phụ trách liên kết thủ công → xóa khỏi E02 |
| E02 | (?) | Chiến dịch giới thiệu | QL lịch sử giới thiệu | | Chuyển sang E03 |
| E02 | (?) | Chiến dịch giới thiệu | Hiển thị ưu đãi GT | | Chuyển sang E03 |
| E03 | AW_CONTRACT_001 | QL sample | Lịch sử chiến dịch | Hiển thị DS | Campaign quản lý qua Hubspot thủ công → không cần trong hệ thống |
| E03 | (?) | QL sample | Lịch sử chiến dịch | Tổng hợp tỷ lệ thành công | Không còn cần thiết |
