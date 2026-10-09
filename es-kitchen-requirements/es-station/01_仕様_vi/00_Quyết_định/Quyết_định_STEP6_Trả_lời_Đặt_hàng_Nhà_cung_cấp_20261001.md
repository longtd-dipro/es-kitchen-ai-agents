> **Đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật.** Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nơi chuyển nội dung của file này và các quyết định đã bị thay thế: xem mục "G" của sổ cái.

# Quyết định: Trả lời STEP6 (Đặt hàng / Trang nhà cung cấp) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Tài liệu xác nhận: `01_仕様/90_デモ確認/デモ全体確認_STEP6_発注・仕入先_20261001.md` (§3 Bất nhất F1〜F13 · §4 Thiếu yêu cầu · §5 Câu hỏi).

| # | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| Q1 | Các thay đổi dành cho nhà cung cấp đã biến mất khỏi bản demo vận hành (v1.32〜v1.36) | **A Khôi phục lại (cả ①〜④)** | ① Master nhà cung cấp (3 loại phân loại · đang đăng ký / từ chối · SP00010/11 · coi thứ Bảy, Chủ nhật, ngày lễ là ngày làm việc · phương thức đặt hàng) ② Đối tượng gửi thông báo "nhà cung cấp" ③ Lịch sử đặt hàng / nhập kho (phê duyệt đặt hàng chính thức · ngày giao · số thùng nhập kho · không thể nhận đơn) ④ Chi tiết đặt hàng / chi tiết dữ liệu đặt hàng (phê duyệt đặt hàng chính thức · đã phê duyệt đặt hàng chính thức · nút demo). **Đã phản ánh ở v1.58** |
| Q2 | Phê duyệt đặt hàng chính thức (nhà cung cấp nhập ngày giao và số thùng nhập kho rồi phê duyệt) | **A Giữ lại** | Bổ sung vào đặc tả (Đặt hàng / Nhập mua / Nhập kho REQ-PO) và xác nhận với anh Aoyama. Cảnh báo sót đơn (REQ-PO-302) sẽ dừng khi được phê duyệt |
| Q3 | Nhà cung cấp từ chối (không thể nhận đơn) | **A Giữ lại** | Thêm trạng thái và thông báo "không thể nhận đơn" vào demo vận hành. Dùng cho dòng 184 của bảng yêu cầu (OK / NG · lý do · phương án thay thế) |
| Q4 | Định dạng số đặt hàng | **A Theo định dạng vận hành** | Thông thường = `PO-YYYYMM-品番-U01` (số thứ tự theo đơn vị đặt hàng), thời hạn tiêu dùng ngắn = `PO-YYYYMM-品番-ký hiệu kho + Slot`. Sửa số và email ví dụ trong demo nhà cung cấp |
| Q5 | Đặt hàng cho các đơn tăng thêm sau hạn chót | **A Đặt hàng bổ sung** | Đặt hàng chính thức mỗi tháng 1 lần (sau hạn chót đặt hàng). Phần tăng thêm do dùng thử, mẫu sau khi chốt, và đăng ký được phê duyệt sau hạn chót sẽ tạo thành dữ liệu đặt hàng mới là "đặt hàng bổ sung". Ghi vào đặc tả mối quan hệ với ngày chốt đặt hàng B5・D5 (28-103) |
| Q6 | Phân loại nhà cung cấp | **A Theo từng sản phẩm (dữ liệu đặt hàng)** | 1 công ty có thể xử lý cả sản phẩm thông thường lẫn sản phẩm có thời hạn tiêu dùng ngắn. Sửa việc "đăng ký riêng theo từng phân loại" trong form đăng ký và hồ sơ của demo nhà cung cấp |
| Q7 | Thời hạn tiêu dùng mong muốn | **A Quy tắc của vận hành** | Ngày giao cho khách + số ngày bảo đảm. Demo nhà cung cấp chỉ hiển thị giá trị nhận từ vận hành. Tên cột: thời hạn tiêu dùng ngắn = "Thời hạn tiêu dùng mong muốn", thông thường = "Hạn sử dụng mong muốn" |
| Q8 | Cách đồng bộ dữ liệu demo | **A Theo vận hành** | Đưa đơn đặt hàng của demo nhà cung cấp về khớp với dữ liệu đặt hàng của vận hành (bao gồm A1 của tháng 9 = 9/07). Thông báo dành cho nhà cung cấp được thêm vào danh sách của vận hành với ID mới (loại bỏ việc trùng 12446・12447). Mẫu chờ phê duyệt đặt hàng chính thức được làm bằng cách chuyển một phần của tháng 11 thành đã đặt hàng chính thức |
| Q9 | Nơi hiển thị thông báo từ nhà cung cấp | **A Dải phía trên danh sách đặt hàng** | Hiển thị đặt hàng chính thức chưa xử lý, giao từng phần, thay đổi thời hạn giao, không thể nhận đơn, v.v. phía trên danh sách "Đặt hàng" (sẽ chuyển đi khi làm dashboard) |
| Q10 | Nơi giao của đơn đặt hàng vật tư | **A Văn phòng ES** | Vật tư giao đến văn phòng ES (WH00004 · không liên kết THOMAS) (khớp với STEP4 A2). Nhập kho do vận hành nhập tay |

## Tình trạng phản ánh

- v1.58: Q1 (`patch_step6a_ops_20261001.py`, trước khi phản ánh là `02_デモ/履歴/v1.58_20261001_STEP6仕入先の戻し前/`)
- Chưa phản ánh: Q2 (bổ sung vào đặc tả) · Q3〜Q10

## Các vấn đề chưa quyết còn lại (chờ trả lời)

Có cho nhà cung cấp xem đơn giá / số tiền hay không / Lựa chọn phương thức giao hàng và cách nhập công ty vận chuyển / Phê duyệt chỉnh sửa hồ sơ / Quy trình phê duyệt đăng ký nhà cung cấp / Nhiều người dùng trong 1 nhà cung cấp / Thời hạn có thể sửa đơn đặt hàng (REQ-PO-304) / Phê duyệt giao từng phần của vận hành (REQ-PO-303) / Phạm vi đặt hàng bên ngoài và đơn đặt hàng gửi qua email (REQ-PO-412) / Đặt hàng vật tư (chỉ đặt hàng chính thức hay đột xuất) / Màn hình riêng cho lịch sử đặt hàng (REQ-PO-114) / HU về định nghĩa gốc của ID nhà cung cấp (N-2)
