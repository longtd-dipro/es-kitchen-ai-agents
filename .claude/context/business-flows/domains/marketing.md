# BF_MARKETING Giới thiệu Công ty (Referral)

> Domain slug: `marketing` · 19 stories · Nguồn: `es-kitchen-requirements/markerting_daily_function_list.xlsx` (sheet `BF_ MARKETING`)
> Cập nhật: 2026-07-03 (theo file xlsx mới)

## Phạm vi

Domain Marketing chia thành 3 nhóm nghiệp vụ:
1. **Referral Campaign (E02 Company Admin)** — form giới thiệu, lịch sử giới thiệu, hiển thị bonus.
2. **Free Campaign / Sample Management (E03 System Admin)** — chiến dịch dùng thử/hàng mẫu, HubSpot sync, tỷ lệ chuyển đổi.
3. **Referral Campaign Management (E03 System Admin)** — quản lý referral submitted, phê duyệt, 4 Plan hoa hồng (A/B/C/D).

> Phần **quản lý danh sách Đại lý / hoa hồng / thanh toán** thuộc domain riêng `dai-ly` (BF_ĐẠI LÝ) — không lặp lại tại đây.

## Stories

| ID | EPIC | STORY | STORY_2 | STORY_3 | DESCRIPTION | PRIORITY | BUSINESS FLOW |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | Referral Campaign | Business Partner/Group Company Introduction Form |  | Form điền thông tin để giới thiệu đối tác/công ty khác sử dụng dịch vụ ES KITCHEN. | 7 | [MARKETING] Giới thiệu Công ty (Referral) |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Referral history management and progress status display |  | Quản lý lịch sử giới thiệu khách hàng và theo dõi tiến độ (đang đàm phán, đã ký...). | 7 | [MARKETING] Giới thiệu Công ty (Referral) |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Referral bonus displayed |  | Hiển thị thông tin nhận thưởng giới thiệu (Ví dụ: Miễn phí 1 tháng thanh toán). | 7 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Free campaign/sample management | New registration |  | Đăng ký chiến dịch Dùng thử/Hàng mẫu. **Cập nhật thông tin khách hàng mới vào Master Pháp nhân.** | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  |  | Xem chi tiết thông tin và tiến hành chỉnh sửa nội dung Chiến dịch Dùng thử. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | delete |  | Xóa thông tin chiến dịch đã thiết lập. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | View campaign history | List View | Xem danh sách lịch sử các đợt phát hàng mẫu/dùng thử. Hệ thống có khả năng tự động lấy thông tin từ Hubspot. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Success rate after sample/free | Tổng hợp và hiển thị tỷ lệ chuyển đổi thành công (từ Dùng thử sang Ký hợp đồng chính thức). | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Referral Campaign Management | Referral Management | Referral process | Áp dụng quy tắc trả phí hoa hồng Giới thiệu khách hàng theo 4 Plan: A (Thưởng 1 lần), B (Thưởng đại lý), C (10% duy trì 36 tháng), D (7% vô thời hạn). | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | List of introductions | Danh sách quản lý các khách hàng được giới thiệu, hiển thị Plan áp dụng, trạng thái hợp đồng, ngày ký để tiện đối soát. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Referral registration (for administrators) | Admin đánh giá phê duyệt thông tin (tín dụng, điều kiện hợp đồng) và tiến hành đăng ký thông tin giới thiệu thủ công. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Detailed Introduction | Xem chi tiết thông tin Giới thiệu. Khóa chỉnh sửa thông tin Plan sau khi duyệt, và Khóa toàn bộ chỉnh sửa nếu đã Thanh toán hoa hồng. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | agency management | List of Agents | Quản lý danh sách các Đại lý/Đối tác tiếp thị. (→ chi tiết ở domain `dai-ly`) | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Agency registration | Đăng ký đại lý / đối tác hợp tác mới. (→ chi tiết ở domain `dai-ly`) | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Agency details _Basic Information | Quản lý thông tin Cơ bản của Đại lý (ID Hệ thống, Tên Công ty, Trạng thái: Đang chạy/Đã hủy, Thông tin người liên hệ). | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Agency details _ Contract and Compensation Settings | Chọn Gói trả hoa hồng cho Đại lý (A/B/C/D), thông tin tài khoản ngân hàng chuyển khoản, khai báo thuế và Ghi chú nội bộ. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Agency details _ Performance summary | Báo cáo tóm tắt Đại lý: Lũy kế số KH giới thiệu, số KH đang active, tổng số tiền hoa hồng đã trả và số tiền chưa trả. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Agency details _ Referral History | Liệt kê chi tiết khách hàng mà Đại lý giới thiệu: Tình trạng (Đang đàm phán/Ký/Hủy), Số tháng đã trôi qua, Tiền hoa hồng tháng này. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Agency details _ Payment History | Lịch sử thanh toán hoa hồng cho Đại lý: Tháng thanh toán, Số tiền, Trạng thái (Đã chuyển/Chưa chuyển), Ngày chuyển. | 9 | [MARKETING] Giới thiệu Công ty (Referral) |

## Changelog vs bản trước

- **Row 4 (Free Campaign — New registration):** đổi từ *"Cho phép nhập thông tin giao hàng khách mới **mà không cần tạo** Master Pháp nhân"* → *"**Cập nhật thông tin khách hàng mới vào** Master Pháp nhân"*. Ý nghĩa: bây giờ chiến dịch dùng thử BẮT BUỘC gắn với Master Pháp nhân — không còn "khách vãng lai".
