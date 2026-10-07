> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định bổ sung v2.3 số 9 — 2026/09/29 (Phản ánh bình luận cho thiết kế giao hàng: sự cố · chi tiết thông báo · màn hình)

> Là bổ sung tiếp theo bổ sung 8 (`Quyết_định_v2.3_Bổ_sung_Đổi_ngày_sau_hạn_chót_20260929.md` · #63). **Phiên bản vẫn là v2.3**. Số là #64~#67. Trích dẫn là [Quyết định v2.3 #NN].
> Nguyên nhân: bình luận và trả lời của hong cho thiết kế giao hàng · demo ngày 2026/09/29 (tab sự cố = phương án B, modal xử lý sự cố = phương án C, menu cần xác nhận = phương án B, chỉ thị hình ảnh của chi tiết thông báo · menu bên). Trong câu trả lời cho "Đã phản ánh hết vào đặc tả DEV chưa?" cùng ngày, cả 4 mục đều được đưa vào đặc tả.
> Quy tắc phản ánh như trước: **sửa đồng thời 3 nơi: ① giải thích nghiệp vụ ② bảng state / batch ③ mô hình dữ liệu** (bổ sung này không thay đổi state · mô hình dữ liệu).

---

## 64. Tab sự cố và "Đăng ký hộ sự cố" chỉ hiển thị sau khi đã xuất hàng

- Tab "Sự cố" của chi tiết dữ liệu xuất hàng · giao hàng và nút "Đăng ký hộ sự cố" ở tiêu đề **không hiển thị khi trạng thái là Dự kiến · Chờ xuất hàng** (hong trả lời: phương án B).
- Ở các trạng thái sau xuất hàng như Đã xuất hàng · Đã nhận · Đã giao · Giao một phần · Chờ giao lại · Dừng, dù không có sự cố vẫn hiển thị tab (bên trong là "Không có báo cáo sự cố").
- **Đang xác nhận (con tự động của sự cố) không nằm trong đối tượng ẩn** (đúng như chỉ định, chỉ "Dự kiến · Chờ xuất hàng").
- API không thay đổi: việc đăng ký sự cố như trước chỉ tiếp nhận giao hàng ở trạng thái Đã xuất hàng · Đã nhận · Đã giao (DEV §15.12.1). Màn hình đã được điều chỉnh cho khớp.

## 65. Giải quyết sự cố gồm 2 bước: ① chọn cách xử lý → ② chỉ nhập các ô cần thiết cho cách xử lý đã chọn

(Cũ: trong 1 modal xếp tất cả bảng báo cáo · 6 cách xử lý · số lượng theo từng sản phẩm · con gửi lại · cước vận chuyển · lý do. 2026/09/29 hong "ồn ào" → phương án C)

- ① Chọn cách xử lý: báo cáo chỉ là tóm tắt từng dòng (chi tiết ở tab "Sự cố"). **Nếu có báo cáo chưa xác định loại thì gắn loại ở đây (bắt buộc)**. Chọn 1 trong 6 cách xử lý (bên phải là trạng thái sau khi giải quyết).
- ② Chỉ hiển thị các ô cần thiết cho cách xử lý đã chọn. **Hạng mục bắt buộc của API cũng giống như vậy**:

| Cách xử lý (resolution) | Số lượng | Con gửi lại | Cước vận chuyển (`freight_billable`) | Lý do |
|---|---|---|---|---|
| Đã giao toàn bộ số lượng (`full`) | Số lượng đã giao (mặc định = số lượng chốt) · nguồn thay thế (tùy chọn) | — | — | Bắt buộc |
| Giao một phần, phần còn lại gửi sau (`partial`) | Số lượng đã giao (số gửi lại tự động từ chênh lệch) | Ngày giao tạm (bắt buộc). Tái sử dụng con tự động | — | Bắt buộc |
| Giao một phần, phần còn lại không gửi (`partial_no_resend`) | Số lượng đã giao | — (con tự động bị hủy) | — | Bắt buộc |
| Gửi lại với số lượng giao bằng 0 (`redelivery`) | — (toàn bộ số lượng 0) | Ngày giao tạm (bắt buộc). Tái sử dụng con tự động | Không thanh toán / Thanh toán | Bắt buộc |
| Quay lại trong ngày (`same_day_revisit`) | — | — (con tự động bị hủy) | — | Bắt buộc |
| Kết thúc mà không giao hàng (`stop`) | — (toàn bộ số lượng 0) | — (con tự động bị hủy) | Không thanh toán / Thanh toán | Bắt buộc |

- Các ô không dùng nếu được gửi đến thì bỏ qua (không lưu). Có thể quay lại ① bằng "Quay lại" "Chọn lại cách xử lý".
- Chuyển động trạng thái · mô hình dữ liệu không thay đổi (giữ nguyên DEV §12.2 · §13.2 · §15.12).

## 66. Chi tiết thông báo của Web doanh nghiệp

- Đặt màn hình **chi tiết thông báo** mở từ "Thông báo" ở Trang chủ (đúng như hình ảnh màn hình của hong). Hiển thị: danh mục (badge) · ngày giờ đăng (ghi dạng `2026/09/29 07:00`) · tiêu đề · nội dung (giữ xuống dòng) · tệp đính kèm (chỉ của thông báo gửi đến ESS · hiển thị / tải xuống) · "‹ Quay lại danh sách". Breadcrumb là "Trang chủ / Chi tiết thông báo".
- Chỉ hiển thị thông báo mà người dùng doanh nghiệp đó nằm trong đối tượng được gửi và **đang công khai** (không hiển thị cái đã dừng gửi · kết thúc · đã xóa).
- Màn hình danh sách thông báo (phía nhận) chưa làm (liên kết "Đến danh sách thông báo" ở Trang chủ là việc tiếp theo).
- Cơ chế gửi thông báo (đối tượng gửi · trạng thái · tệp đính kèm) giữ nguyên như `お知らせ配信_画面仕様_JA-VI_v1.md`. **API phía nhận (danh sách · chi tiết) giao cho tài liệu gửi thông báo** (vì đặc tả DEV loại thông báo ra khỏi phạm vi nên ở đây chỉ quyết định màn hình).

## 67. Thay đổi chỉ ở màn hình (không thay đổi dữ liệu · API)

- **Hiển thị cần xác nhận ở menu bên**: thêm "Cần xác nhận (số lượng)" vào trong "Quản lý giao hàng" của vận hành (Lịch trình / Quản lý xuất hàng · giao hàng / Cần xác nhận). Ở danh sách · chi tiết cần xác nhận thì menu này ở trạng thái được chọn. Breadcrumb là "Quản lý giao hàng / Cần xác nhận". Liên kết "Cần xác nhận (số lượng)" ở tiêu đề Lịch trình cũng giữ lại (hong trả lời: phương án B).
- **Bỏ chuyển đổi "Tiêu chuẩn (xuất hàng / giao · giao hàng)" ở hiển thị tháng**: vì ô của hiển thị tháng hiển thị cả xuất hàng và giao hàng (cả đã chốt và dự kiến). Hiển thị tuần · ngày thì danh sách được chuyển nên giữ lại.
- **Thu gọn menu bên**: cả vận hành và doanh nghiệp đều có thể thu gọn bằng "Đóng / Mở menu" bên dưới menu. Khi chiều rộng màn hình dưới 1280px thì tự động đóng. Khi đóng chỉ còn biểu tượng, menu con là flyout (SideNav · AppShell của ES Kitchen v19).
- Ở demo giao hàng đã bỏ các menu chưa có màn hình (vận hành: Dashboard · Quản lý menu · Quản lý tài khoản · Quản lý doanh thu · Quản lý doanh nghiệp · hợp đồng · Quản lý master · Quản lý tài xế; doanh nghiệp: Đặt hàng · Giỏ hàng · Hóa đơn · Quản lý cơ sở) và Web công ty giao hàng ủy thác. **Chỉ là thay đổi của demo**, không đổi cấu trúc menu thực tế.

---

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| Tài liệu đặc tả tổng hợp v2.3 (§0-2K · §19-12) | Phản ánh 2026/09/29 |
| Đặc tả DEV (§12.5 · §13.2 · §15.12 · §15.12.1 · §18 Mã lỗi) | Phản ánh 2026/09/29 |
| Thiết kế giao hàng · demo giao hàng | Đã phản ánh 2026/09/29 (khi xử lý bình luận) |
| `お知らせ配信_画面仕様_JA-VI_v1.md` (API danh sách · chi tiết phía nhận) | **Chưa phản ánh** (việc tiếp theo) |
