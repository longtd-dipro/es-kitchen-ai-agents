# Bảng phân quyền Web vận hành (2026-10-03 · chính thức)

**Chính thức (quyết định mới nhất)**: bảng phân quyền vận hành do người dùng quyết định ngày 2026-10-03 (7 vai trò × chức năng). Code ở `07_開発/lib/domain/seed/account.ts` (OPS_TABLE) và `lib/ops/permissions.ts`.
- Phiên bản trước (bản khớp với "Bảng màn hình × vai trò (đề xuất)" ở §4-3 Thiết kế cơ bản · commit f16cad1) được **thay thế bằng bảng này**.
- Vai trò do Quản trị hệ thống (người có thể sửa "Cấp quyền") tạo và chỉnh sửa ở màn hình "Quản lý tài khoản > Quyền". Bảng là giá trị ban đầu.
- Ký hiệu: CRUD = xem · tạo · sửa · xóa · nhập CSV · xuất CSV · thao tác theo từng chức năng (phê duyệt · công khai · chốt · phát hành · đặt hàng chính thức · nhập kho) / R/U = xem · sửa · xuất CSV · thao tác theo từng chức năng (không tạo · xóa · nhập CSV) / R = xem · xuất CSV / × = không có. Người có từ 2 vai trò trở lên thì lấy vai trò cao hơn.
- Vai trò không có trong bảng: giữ lại "Chỉ xem" (R cho mọi chức năng trừ Cấp quyền · liên kết Hubspot/API), "Nhân viên kho" (Dashboard R · Quản lý nhập kho R/U) (người dùng quyết định 2026-10-03).
- **2026-10-05 (hong trả lời · Sổ cái E)**: **Toàn quyền và Quản trị hệ thống (vai trò có thể sửa "Cấp quyền") là CRUD ở tất cả chức năng** (ở bảng dưới, dù ghi R vẫn có thể tạo · sửa · xóa · nhập CSV. Đã sửa Toàn quyền của Quản lý gói · Quản lý master vật tư · Khảo sát · Quản lý doanh thu thành CRUD). **R/U** = xem · sửa · xuất CSV · thao tác theo từng chức năng (phê duyệt · công khai · chốt, v.v.). **Không** tạo · xóa · nhập CSV. **R** = chỉ xem · xuất CSV.
- Chỉ Web vận hành. Các site khác (doanh nghiệp · đơn vị giao hàng ủy thác · tài xế · nhà cung cấp) chỉ bị giới hạn trong "phạm vi dữ liệu của chính mình".

| Nhóm | Chức năng | Màn hình | Toàn quyền | Kế toán | Kinh doanh | CS | Quản lý sản phẩm | Phát triển sản phẩm | Logistics |
|---|---|---|---|---|---|---|---|---|---|
| Nhóm thao tác cơ bản | Cấp quyền | Danh sách tài khoản · Quyền · Quản lý bảo trì · Phiên bản & cập nhật bắt buộc · Quản lý IP whitelist · Thuế suất chênh lệch thu tiền mặt · Thêm / xóa master thuế suất (2026-10-05 Sổ cái E) | CRUD | × | × | × | × | × | × |
| Nhóm thao tác cơ bản | Dashboard | Dashboard | R | R | R | R | R | R | R |
| Nhóm thao tác cơ bản | Hướng dẫn thao tác (nội bộ) | — | R | R | R | R | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý thông tin doanh nghiệp | Danh sách doanh nghiệp | CRUD | R | R | R/U | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý cơ sở | Danh sách cơ sở | CRUD | R | R | R | R | R | R/U |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý hợp đồng gói | Danh sách hợp đồng con · Quản lý đơn đăng ký hợp đồng | CRUD | R | R | R/U | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý hợp đồng cho thuê tủ lạnh · tủ đông | Sổ cái túi giữ lạnh | CRUD | R/U | R | R | R | R | R |
| Nhóm quản lý thu tiền · loại bỏ | Quản lý thu tiền | Quyết toán thực tế · Chốt thanh toán · Hóa đơn | CRUD | CRUD | R | R | R | R | CRUD |
| Nhóm quản lý thu tiền · loại bỏ | Quản lý loại bỏ · thu tiền | Quản lý tồn kho (thanh toán) | CRUD | R/U | R | R/U | R | R | R/U |
| Nhóm quản lý thu tiền · loại bỏ | Nhập loại bỏ | Nhập liệu của Quản lý tồn kho (thanh toán) | CRUD | R | R | R/U | R | R | R/U |
| Nhóm quản lý master sản phẩm · gói | Quản lý master sản phẩm | Master sản phẩm · Quản lý danh mục sản phẩm | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý master vật tư | Master vật tư ("Đăng ký mới" là quyền tạo (C): 2026-10-05) | CRUD | R | R | R | R | R | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý master tủ lạnh · tủ đông | Master dòng máy | CRUD | R | CRUD | R | CRUD | CRUD | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý gói | Master gói · Master Tùy chọn · Master giảm giá | CRUD | R | R | R | R | R | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý chiến dịch miễn phí · hàng mẫu | Hàng mẫu kinh doanh | CRUD | R | CRUD | R | R/U | R | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý tồn kho (món ăn) | Tồn kho kho | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý tồn kho (vật tư) | Tồn kho kho | CRUD | R | R | R | CRUD | R | R |
| Nhóm quản lý đối tác · giao hàng | Quản lý đại lý · đối tác | Master phí giới thiệu · Master đại lý · Lịch sử giới thiệu · Lịch sử thanh toán | CRUD | CRUD | CRUD | R | R | R | R |
| Nhóm quản lý đối tác · giao hàng | Quản lý nhà cung cấp | Master nhà cung cấp | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý đối tác · giao hàng | Quản lý giao hàng ủy thác | Đơn vị giao hàng ủy thác · Nhân viên giao hàng | CRUD | R | R | R | R | R | CRUD |
| Nhóm quản lý đối tác · giao hàng | Quản lý điểm trung chuyển | Master kho | CRUD | R | R | R | R | R | CRUD |
| Nhóm quản lý menu · đơn hàng | Đăng ký · chỉnh sửa menu hàng tháng (thủ công) | Menu hàng tháng · Mục tiêu đơn giá trung bình | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Sao chép / xem menu quá khứ | — | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý mẫu menu hàng tháng | — | CRUD | R | CRUD | CRUD | CRUD | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý đơn hàng | Quản lý đơn hàng sản phẩm · Quản lý đơn hàng vật tư | CRUD | R | CRUD | CRUD | R | R/U | R |
| Nhóm quản lý menu · đơn hàng | Quản lý đặt hàng | Đặt hàng · Đặt hàng vật tư · Lịch sử đặt hàng · nhập kho | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý nhập kho | Đăng ký nhập kho | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý xuất hàng · giao hàng | Lịch trình · Xuất hàng · Quản lý giao hàng · Cần xác nhận · Hỏi đáp giao hàng · Tổng hợp vật tư | CRUD | R | CRUD | CRUD | CRUD | CRUD | R/U |
| Nhóm chức năng khác | Quản lý thông báo | Danh sách thông báo | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| Nhóm chức năng khác | Thu thập · phân tích khảo sát | Quản lý khảo sát | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Quản lý doanh thu | Quản lý mua hàng · Yêu thích | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Tương tác người dùng | Đánh giá · Ý kiến | CRUD | R | R/U | R/U | R/U | R/U | R |
| Nhóm chức năng khác | Quản lý điểm / Quản lý tem | — | CRUD | CRUD | CRUD | CRUD | R | R | R |
| Nhóm chức năng khác | Quản lý ưu đãi | — | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Quản lý chiến dịch giới thiệu | — | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Liên kết Hubspot/API | Liên hệ (gửi HubSpot) · Email nhận thông báo liên hệ | CRUD | × | × | × | × | × | × |

## Cần xác nhận (từ nhật ký công việc của cloud)
- Các nút riêng lẻ trong từng màn hình (tạo · xóa · phê duyệt · công khai, v.v.) vẫn chưa được phân biệt hiển thị (khi bấm thì server trả 403 · toast).

- Sửa 2026-10-05 (hong trả lời · Thiết kế màn hình Q3 = A): đổi Toàn quyền của "Quản lý gói" từ R → **CRUD** (giống `plans: ALL_R` của code `lib/domain/seed/account.ts`. Nếu tất cả vai trò vẫn là R thì không ai sửa được Master gói · Tùy chọn · Giảm giá). Sổ cái F.
