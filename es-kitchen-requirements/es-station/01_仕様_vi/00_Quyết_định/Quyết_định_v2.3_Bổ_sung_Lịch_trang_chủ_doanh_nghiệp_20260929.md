> **Đã đóng băng (bản gốc・2026-10-05). Từ nay không cập nhật.** Quyết định hiện đang có hiệu lực nằm ở `docs/決定台帳.md`. Nơi chuyển đến của nội dung file này và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định v2.3 bổ sung 7 — 2026/09/29 (Trang chủ Web doanh nghiệp: lịch giao hàng tháng hiện tại và chi tiết giao hàng)

> Bổ sung tiếp theo bổ sung 5 (`Quyết_định_v2.3_Bổ_sung_Bắt_đầu_tạo_và_CSV_20260929.md`・#52〜#53) và bổ sung 6 (tiếp nhận đăng ký・`Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` §16・§17). **Phiên bản vẫn là v2.3**. Đánh số tiếp từ #54. Trích dẫn dạng 〔quyết định v2.3 #NN〕.
> Nguyên nhân: yêu cầu của hong ngày 2026/09/29 "Hiển thị lịch tháng hiện tại ở trang chủ màn hình doanh nghiệp. Chỉ dữ liệu giao hàng của cơ sở của mình. Phía doanh nghiệp cũng có thể đăng ký giao hàng. Không cho xem đến picking・công ty giao hàng, có thể xác nhận ngày dự kiến đến・tình trạng giao hàng・danh sách sản phẩm giao・tình trạng giao hàng".
> Cùng ngày hong trả lời: ① phạm vi xem được phân chia theo quyền ② phạm vi yêu cầu thay đổi theo đúng đặc tả ③ hiển thị số vận đơn và liên kết theo dõi ④ bỏ danh sách "tình trạng giao hàng" và gom vào trang chủ.
> Quy tắc phản ánh như trước: **sửa đồng thời 3 chỗ: ① mô tả nghiệp vụ ② bảng state／batch ③ mô hình dữ liệu**.

---

## 54. Trang chủ Web doanh nghiệp = lịch giao hàng tháng hiện tại (màn hình 07)

- Khi đăng nhập Web doanh nghiệp, trang chủ hiển thị **lịch tháng hiện tại (tháng dương lịch)**. Có thể chuyển tháng trước／sau. Tối đa đến **tháng đã tạo kế hoạch** (tối đa 6 tháng sau).
- Ô của lịch: vào ngày có giao hàng, hiển thị dải nhiệt độ và số lượng (sau khi xác định) hoặc "Dự kiến giao hàng" (kế hoạch), badge tình trạng (tên hiển thị của #42). Ô kế hoạch có khung nét đứt và dấu "Kế hoạch" (quyết định #77). Khi đang yêu cầu thay đổi thì có badge "Đang yêu cầu thay đổi". Hiển thị ngày lễ giao hàng.
- Bấm vào ô thì mở **chi tiết** (#56) của chuyến giao hàng đó.
- Bố cục giống trang chủ Web công ty giao hàng ủy thác: **trái = giao hàng tháng này (lịch)**, **phải = thông báo (thông báo gửi dành cho doanh nghiệp・badge danh mục + tiêu đề) và "Giao hàng cần xác nhận"** (đã giao một phần・đang yêu cầu thay đổi・kế hoạch có thể đăng ký). Tháng hiển thị là tháng này, chuyển tháng trước／sau bằng ‹ › ở tiêu đề thẻ (cũ: đặt "Giao hàng sắp tới" "Yêu cầu thay đổi ngày giao hàng" "Cách xem tình trạng" bên dưới lịch. Thay thế theo chỉ thị của hong ngày 2026/09/29 "giống giao hàng ủy thác, hiển thị lịch và thông báo").
- **Bỏ menu "Tình trạng giao hàng" (danh sách tìm theo kỳ) của Web doanh nghiệp** (cũ: tình trạng giao hàng = danh sách lọc theo cơ sở・kỳ. Bãi bỏ 2026/09/29). Khi muốn tìm bằng danh sách thì xem bằng cách chuyển tháng trên lịch ở trang chủ.

## 55. Phạm vi xem được phân chia theo quyền của người dùng doanh nghiệp

| Quyền | Phạm vi xem được |
|---|---|
| **Quản trị viên doanh nghiệp** | **Tất cả cơ sở** của công ty mình (cùng doanh nghiệp). Có thể lọc lịch・giao hàng sắp tới theo cơ sở |
| **Phụ trách cơ sở** | **Chỉ cơ sở được gán** (1 người có thể được gán nhiều cơ sở). Không hiển thị bộ lọc cơ sở |

- Phạm vi có thể gửi yêu cầu thay đổi cũng như vậy (phụ trách cơ sở chỉ gửi cho giao hàng của cơ sở mình).
- Mô hình dữ liệu【đề xuất・xác định sau khi DEV xác nhận】: người dùng doanh nghiệp có `role` (`corp_admin`｜`site_staff`), việc gán của phụ trách cơ sở là `corporate_user_sites(corporate_user_id, site_id)`. API bắt buộc phải lọc theo phạm vi này (không chỉ ẩn trên màn hình).

## 56. Chi tiết giao hàng dành cho doanh nghiệp (hiển thị gì・không hiển thị gì)

| Phân loại | Hiển thị | Không hiển thị |
|---|---|---|
| Kế hoạch | Ngày giao hàng (ngày dự kiến đến)・khung giờ nhận hàng・dải nhiệt độ và phương thức giao hàng (loại chuyến)・dấu "Kế hoạch"・yêu cầu thay đổi | Số lượng・sản phẩm (hiển thị sau khi chốt đặt hàng. Thông báo ngày công bố menu và ngày chốt) |
| Xác định (Chờ xuất〜) | Ngoài phần trên, **danh sách sản phẩm (số lượng đặt)**, tình trạng | — |
| Sau khi giao hàng | Ngoài phần trên, **sản phẩm đã giao** (số lượng đặt・số lượng giao・chênh lệch・hàng thay thế là "thay cho ○○" và cách xử lý thanh toán), **tình trạng giao hàng** (ngày giờ hoàn tất giao hàng・người nhận・thu tiền), chuyến giao hàng liên quan (con giao lại) (cũ: kết quả 5 bước・tồn kho và trưng bày theo từng sản phẩm・ảnh dành cho khách hàng cũng hiển thị. Hủy bỏ ở #60 ngày 2026/09/29) | **Ảnh・kiểm tra tồn kho và hủy bỏ・5 bước** (#60) |
| Vận đơn | **Số vận đơn và liên kết "Tra cứu tình trạng giao hàng" (trang theo dõi)**. **Không tạo cột tên công ty giao hàng**. Chuyến nhận hàng・chuyến tự có do ES đánh số thì không hiển thị số | — |
| Toàn thể | Tình trạng dùng tên hiển thị của #42 (tên trạng thái thông thường giống vận hành) | **Ngày picking・kho・công ty giao hàng・trung chuyển・nhân viên giao hàng・cước vận chuyển・lịch sử thay đổi・tài liệu dành cho nhà thầu ủy thác** |

- Dữ liệu lấy từ `delivery_lines` (13-1B) và tệp đính kèm (chỉ `audience = customer`). Không có mục lưu mới.

## 57. Yêu cầu thay đổi của doanh nghiệp được gửi từ chi tiết giao hàng (phạm vi theo đúng đặc tả)

- Lối vào là **"Yêu cầu thay đổi ngày giao hàng" trong chi tiết giao hàng**. Chỉ gửi được cho **chuyến giao hàng "kế hoạch" từ tháng sau trở đi, đến trước chốt đặt hàng**. **Tháng hiện tại・quá khứ・chuyến giao hàng đã xác định không hiển thị nút, luôn hiển thị lý do** ("Vì là chuyến giao hàng đã xác định nên không thể yêu cầu thay đổi ngày. Nếu gấp, vui lòng gọi điện cho vận hành"). Phạm vi giữ nguyên như quy định ở §8 (đến chu kỳ đã tạo・thay đổi ngày đến tháng sau nữa).
- Màn hình yêu cầu: chọn ngày muốn thay đổi từ **cùng nửa đầu／nửa sau của cùng chu kỳ** (cái thứ nhất = nguyện vọng 1, cái thứ hai = nguyện vọng 2). Ngày không thể chọn (thứ không thể giao hàng・ngày giao hàng hiện tại, v.v.) thì không bấm được. Cũng có thể chọn **"Không có ngày mong muốn (nhờ vận hành quyết định)"**. Lý do là bắt buộc. Với ngày vắt giữa nửa đầu ⇔ nửa sau thì hướng dẫn "Vui lòng trao đổi với vận hành".
- Hiển thị trên màn hình yêu cầu: "Đến khi được phê duyệt thì vẫn là ngày giao hàng hiện tại", "Hạn xử lý = chốt đặt hàng", "Đông lạnh・lạnh cùng ngày sẽ dịch chuyển cùng nhau".
- Khi đang yêu cầu, hiển thị trong chi tiết số yêu cầu・ngày muốn thay đổi・hạn xử lý・tình trạng, và có thể "Sửa nội dung yêu cầu" (không tạo luồng yêu cầu lại・§8).
- Phía vận hành xử lý ở tab "Yêu cầu thay đổi" của chi tiết xuất hàng・dữ liệu giao hàng như trước.


## 58. Nội dung hiển thị ở "Giao hàng cần xác nhận" (hong trả lời 2026/09/29)

Hiển thị ở phía dưới bên phải trang chủ (#54) theo thứ tự sau. Thành phần là **NoticeList** của ES Kitchen (ngày giờ・badge loại・liên kết tiêu đề・hạn ở bên phải).

| Thứ tự | Loại | Điều kiện hiển thị | Khi bấm |
|---|---|---|---|
| 1 | **Đề xuất ngày khác** (cần phản hồi) | Yêu cầu thay đổi ở trạng thái **Đề xuất** (vận hành đã đề xuất ngày thay thế) | Chi tiết giao hàng: "Nhận vào ngày ○/○", "Từ chối". Nhận = phê duyệt vào ngày đó (đã điều chỉnh), từ chối・không phản hồi đến hạn = vận hành quyết định và liên hệ (như §8) |
| 2 | **Giao hàng không đến・bị chậm** | Tên hiển thị của #42 là Đã giao một phần／Dự kiến giao lại／Đang chuẩn bị giao lại／Đang điều chỉnh ngày giao／Dừng giao hàng, hoặc "Đang xác nhận tình trạng giao hàng" | Chi tiết giao hàng |
| 3 | **Kết quả yêu cầu** | Trong **14 ngày** kể từ khi yêu cầu thay đổi được phê duyệt・từ chối | Chi tiết giao hàng |
| 4 | **Kế hoạch có thể đăng ký** | Kế hoạch có thể yêu cầu thay đổi (từ tháng sau trở đi・đến tháng sau nữa), đã đến **3 tuần trước chốt đặt hàng** | Chi tiết giao hàng ("Yêu cầu thay đổi ngày giao hàng") |

- Ở ô của lịch cũng hiển thị "Có đề xuất" (1).
- Phản hồi của doanh nghiệp được lưu vào lịch sử yêu cầu thay đổi, và hiển thị "Phản hồi của doanh nghiệp: Nhận／Từ chối" ở tab yêu cầu thay đổi phía vận hành (màn hình phía vận hành chưa phản ánh).

## 59. Đặt danh sách yêu cầu thay đổi của doanh nghiệp vào menu "Yêu cầu"

- Trong menu trái "Yêu cầu" có tab **"Thay đổi ngày giao hàng"** (ngoài ra có "Yêu cầu hợp đồng"). Từ "Giao hàng cần xác nhận" ở trang chủ có "Đến danh sách yêu cầu thay đổi".
- Cột: Số yêu cầu (→ Chi tiết giao hàng)・ngày yêu cầu・ngày giao hàng (hiện tại)・ngày muốn thay đổi・tình trạng・phản hồi từ vận hành・hạn／ngày xử lý. Lọc: số yêu cầu・số giao hàng・tình trạng・kỳ ngày giao hàng. Phạm vi xem được theo #55.
- Tình trạng: **Đang yêu cầu／Đề xuất ngày khác／Phê duyệt／Từ chối／Rút lại**. "Rút lại" (doanh nghiệp rút lại khi đang yêu cầu) là【đề xuất】(khác với §8 "không tạo luồng yêu cầu lại". Đang chờ xác nhận).
- Không tạo yêu cầu mới từ danh sách, mà gửi từ "Yêu cầu thay đổi ngày giao hàng" trong chi tiết giao hàng.

## 60. Không hiển thị ảnh・kiểm tra tồn kho và hủy bỏ・5 bước ở chi tiết giao hàng của doanh nghiệp (chỉ thị của hong 2026/09/29)

- Hiển thị ở tình trạng giao hàng chỉ gồm **ngày giờ hoàn tất giao hàng・người nhận・thu tiền** và sản phẩm đã giao (số lượng đặt・số lượng giao・chênh lệch・hàng thay thế).
- **Không hiển thị ảnh trước・sau khi trưng bày, kiểm tra tồn kho và hủy bỏ (tồn kho・hủy bỏ・hạn dùng trước・sau khi trưng bày theo từng sản phẩm), ghi nhận 5 bước của chuyến ES giao hàng** (#56 cũ: đã hiển thị. Hủy bỏ 2026/09/29). Vẫn hiển thị như trước ở chi tiết xuất hàng・dữ liệu giao hàng của vận hành (thực tích・tài liệu đính kèm).

## 61. Theo đúng Design System (hong trả lời 2026/09/29)

- Badge "Kế hoạch" là **info (xanh dương)** (cũ: viền xám).
- Badge ở ô lịch **không xuống dòng**. Tên hiển thị dài thì ở ô dùng dấu ngắn ("Giao một phần" "Có đề xuất"), tên chính thức hiển thị ở tooltip và chi tiết.
- Tiêu đề màn hình theo mẫu "Chi tiết 〇〇 ID" là **"Chi tiết giao hàng"** (cũ: Chi tiết của giao hàng).
- Các dòng "Thông báo" "Giao hàng cần xác nhận" ở trang chủ dùng **bổ sung NoticeList vào ES Kitchen** (dùng chung với trang chủ Web công ty giao hàng ủy thác. DS Version 19). Tiêu đề thẻ là SectionTitle (liên kết ở bên phải・chuyển tháng).


## 62. Yêu cầu thay đổi hiển thị bằng "khung yêu cầu" ở trên chi tiết xuất hàng・dữ liệu giao hàng (doanh nghiệp là chi tiết giao hàng), xử lý・đăng ký bằng modal (chỉ thị của hong 2026/09/29・kèm hình ảnh màn hình)

- **Vận hành**: Với dữ liệu giao hàng có yêu cầu thay đổi đang yêu cầu, hiển thị **khung yêu cầu thay đổi** ở trên "Tổng quan giao hàng" của chi tiết (tiêu đề "Yêu cầu thay đổi ngày giao hàng dự kiến" + số yêu cầu・trạng thái・đánh giá của hệ thống・hạn xử lý, ngày giao hàng hiện tại → nguyện vọng 1 → nguyện vọng 2 (mỗi cái là ngày picking), lý do yêu cầu・người yêu cầu・ngày giờ yêu cầu, chuyến giao hàng dịch chuyển cùng nhau). Từ các nút **Từ chối／Đề xuất ngày thay thế／Phê duyệt** mở **modal xử lý yêu cầu thay đổi "Xác nhận yêu cầu thay đổi"** (cũ: modal xếp so sánh ngày・kiểm tra trước phê duyệt ①〜⑦・ứng viên ngày thay thế・lý do・lịch sử yêu cầu. Buổi chiều 2026/09/29 đổi sang cùng dạng với xử lý yêu cầu thay đổi của lịch). Yêu cầu đã xử lý hiển thị ở bảng bên dưới tổng quan và lịch sử thay đổi (cũ: tab "Yêu cầu thay đổi" buổi sáng 2026/09/29. Trước đó nữa là màn hình chi tiết yêu cầu thay đổi riêng. Cả hai đều bị hủy).
- **Dạng của modal xử lý "Xác nhận yêu cầu thay đổi"** (chỉ thị của hong buổi chiều 2026/09/29・kèm hình ảnh màn hình. Giống xử lý yêu cầu thay đổi của lịch):
  1. **Thông tin cơ bản**: Số giao hàng (liên kết)・dải nhiệt độ・loại giao hàng, bảng tuyến (No・nơi gửi・công ty giao hàng・nơi giao hàng).
  2. **Chọn ngày giao hàng sau thay đổi**: ngày dự kiến giao hàng hiện tại・ngày dự kiến xuất hàng・lead time, ngày yêu cầu (người yêu cầu・điện thoại)・lý do yêu cầu. Chọn 1 mục bằng radio từ **bảng ngày giao hàng mong muốn** (No・ngày giao hàng mong muốn・chu kỳ ngày giao hàng・ngày xuất hàng・chu kỳ ngày xuất hàng・lead time・**số lượng ngày xuất hàng**).
  3. **Chọn ngày khác**: chọn bằng radio ngày khác của cùng nửa đầu／nửa sau của cùng chu kỳ ở bảng cùng cột.
  - **Giá trị có vấn đề hiển thị chữ đỏ**: lead time không đủ・số lượng ngày xuất hàng vượt giới hạn・ngày không thể xuất hàng (ngày không thể xuất hàng thì không chọn được). Mục chữ đỏ nhưng vẫn chọn được (vượt số lượng, v.v.) thì vận hành có thể phê duyệt theo phán đoán.
  - Nút bên dưới: **Phê duyệt theo ngày đã chọn**／**Từ chối** (bắt buộc lý do・hiển thị cho doanh nghiệp). **Chọn ngày mong muốn rồi phê duyệt = đổi sang ngày đó**. **Chọn ngày khác rồi phê duyệt = "Đề xuất ngày khác" cho doanh nghiệp** (trạng thái là Đề xuất, hạn phản hồi = chốt đặt hàng. Không phải phê duyệt). Đông lạnh・lạnh cùng ngày dịch chuyển cùng nhau.
  - Cột "số lượng ngày xuất hàng" không có trong hình ảnh màn hình đính kèm, được thêm vào để xem giới hạn số lượng【cần xác nhận】.
- **Doanh nghiệp**: Khung cùng dạng ở trên chi tiết giao hàng (ngày giao hàng hiện tại → ngày mong muốn → đề xuất của vận hành, bình luận của vận hành, **Từ chối／Nhận vào ngày ○/○**). Yêu cầu mới mở **modal đăng ký** từ "Yêu cầu thay đổi ngày giao hàng" ở tiêu đề của chi tiết giao hàng (giữ nguyên như #57).
- Với người không thao tác được (quyền chỉ xem), theo quy định của design system **không hiển thị nút** (hình ảnh màn hình đính kèm là nút vô hiệu + ghi chú, nhưng ES Kitchen là "ẩn nút không có quyền").

## Bổ sung (trả lời câu hỏi ngày 2026/09/29・không thay đổi quyết định)

- **Vận hành không thể xóa dữ liệu xuất hàng・giao hàng.** Dừng trước khi xuất hàng = hủy, dừng sau khi xuất hàng = ngừng (cả hai đều bắt buộc lý do). Kế hoạch chỉ biến mất khi tạo lại do phê duyệt tạm dừng・hủy hợp đồng.
- **Thay đổi của vận hành sau chốt**: không thể đổi ngày・kho picking (hủy + nhân bản・quyết định v2.2 #1). Công ty giao hàng・nhân viên giao hàng・địa chỉ nơi giao hàng nếu trước khi xuất hàng thì đổi được bằng "Thay đổi chỉ chuyến này" (gửi lại chỉ thị xuất hàng). Sau khi xuất hàng chỉ có thể thay nhân viên giao hàng.

---

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| Đặc tả tích hợp v2.3 (§0-2I・§1-1・§15-10・§16-4・§17-3・§19-10) | Đã phản ánh 2026/09/29 |
| Đặc tả DEV (§12.5・§14.10・§15.2) | Đã phản ánh 2026/09/29 |
| Thiết kế giao hàng (Version 33)・demo giao hàng (DKqa Version 4) | Đã phản ánh 2026/09/29 (Web doanh nghiệp: trang chủ・chi tiết giao hàng・yêu cầu thay đổi) |
