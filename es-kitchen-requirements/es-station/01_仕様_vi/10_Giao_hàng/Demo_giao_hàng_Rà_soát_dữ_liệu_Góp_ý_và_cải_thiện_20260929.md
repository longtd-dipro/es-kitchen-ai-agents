# Rà soát dữ liệu demo giao hàng (lịch trình) — Điểm chỉ ra và cải thiện (2026/09/29)

> Đối tượng: artifact "Thiết kế màn hình Quản lý giao hàng Web vận hành" Version 28 / `02_デモ/16_運営_配送.html`
> Tiền đề (vì không có trả lời nên tiến hành theo mặc định):
> - Điểm khởi đầu của chu kỳ giữ nguyên theo thiết kế (tháng 9 A1 = 9/14 → tháng 10 A1 = 10/12 → tháng 11 A1 = 11/9)
> - "Hôm nay" của demo = 2026/09/29 (Thứ ba)
> - Ngày của Số giao hàng = **ngày xuất hàng**
> - Thẻ ở hiển thị tuần của dự kiến → chuyển đến hiển thị ngày (dự kiến). Vì dự kiến không có chi tiết dữ liệu giao hàng

## 4 yêu cầu

| # | Yêu cầu | Xử lý |
|---|---|---|
| R1 | Cho phép thay đổi cả ở màn hình dự kiến của hiển thị ngày | Thêm màn hình mới "Hiển thị ngày (dự kiến · chọn rồi di chuyển)" (ScheduleDayPlan · 11/17). Chọn dòng rồi "Di chuyển dữ liệu xuất hàng" → modal di chuyển. Từ "Ngày" của hiển thị tháng · tuần của dự kiến chuyển đến màn hình này |
| R2 | Làm nổi bật phần đã di chuyển · thay đổi | Đường kẻ xanh + nền xanh nhạt bên trái dòng · thẻ. Ở dòng hiển thị ngày cũ và lý do trước khi di chuyển như "Di chuyển: xuất hàng 11/16 → 11/17 (vận hành · cân bằng số lượng)". Ô của hiển thị tháng có "Di chuyển · thay đổi N mục", phần đã chốt có badge "Hủy / chuyến thay thế N mục". Có chú giải |
| R3 | Chu kỳ tháng 10 đã chốt, từ tháng 11 trở đi là dự kiến | Hiển thị giai đoạn của hiển thị tháng của tháng 10 là "Đã đến hạn chốt → 5. Dữ liệu giao hàng (đã chốt)". "Tháng sau" là **tháng 11 (dự kiến)**. Làm lại hiển thị tháng · tuần của dự kiến và modal di chuyển theo tháng 11 |
| R4 | Từ thẻ của tuần đến chi tiết giao hàng | Bấm thẻ ở hiển thị tuần đã chốt thì mở chi tiết dữ liệu giao hàng (giao hàng đang có sự cố thì chi tiết sự cố). Rê chuột vào thì hiện nội dung thay đổi. Tuần dự kiến thì bấm tên cơ sở để đến hiển thị ngày (dự kiến) |

## Điểm chỉ ra và cải thiện

| # | Điểm chỉ ra | Cải thiện |
|---|---|---|
| 1 | Khung không xuất hàng thiếu B4 · D4 | Đồng bộ với mặc định của đặc tả **A6 · A7 / B4~B7 / C6 · C7 / D4~D7** (hiển thị tháng · tuần · ngày · modal di chuyển · thiết lập chu kỳ giao hàng · bảng điều khiển tạm dừng · thiết lập giao hàng theo hợp đồng). Cũng tính lại số ngày không xuất hàng của từng tháng trong thiết lập chu kỳ giao hàng |
| 2 | Dừng giao hàng chủ nhật một cách đồng loạt, dùng sai "Nghỉ: giao hàng" | Chủ nhật cũng hiển thị số lượng giao hàng. "Nghỉ: giao hàng" chỉ dành cho ngày lễ giao hàng (10/12 · 11/3 · 11/23). Số lượng giao hàng tính từ số lượng xuất hàng bằng lead time (lạnh 1 ngày · đông lạnh 2 ngày) |
| 3 | Hiển thị giai đoạn của tháng 10 vẫn là "Hạn chốt (đang tiến hành)" | Như R3 |
| 4 | "Tháng sau" nhảy sang tháng 12, không có tháng 11 | Như R3. Từ tháng 12 trở đi nằm ngoài đối tượng của demo (toast) |
| 5 | Giao hàng giao ngày 9/28 có ngày xuất hàng 9/27 (Chủ nhật · không xuất hàng) | Sửa DL-260928-0003 · 0014 thành **xuất 9/28 → giao 9/29**. Cũng chỉnh ngày giờ của chi tiết · thực tế · lịch sử · ảnh |
| 6 | Ở đơn đăng ký thay đổi, ngày xuất hàng của đông lạnh (LT 2 ngày) vướng vào khung không xuất hàng, lead time thực tế thành 4 ngày | Sửa 3 mục phê duyệt hàng loạt thành lạnh, đổi thành tổ hợp mà trước sau ngày xuất hàng hợp lý. Ở nguyện vọng thứ hai và ngày ứng viên của chi tiết đơn đăng ký thay đổi hiển thị "Lead time +2 ngày" "Không xuất hàng (B7)" |
| 7 | Ở cần xác nhận hạn sử dụng, khung là "C1", ngày xuất hàng là khung không xuất hàng | Làm lại ví dụ thành "Đổi kho lạnh sang kho Kansai (LT 1 ngày → 2 ngày) → vượt quá Sandwich thủ công (hạn 3 ngày − an toàn 2 ngày = 1 ngày)" |
| 8 | Có ngày giờ sau "hôm nay" (sự cố 9/29 · phát hiện 9/30 · 10/12) | Đồng bộ hôm nay thành 9/29. Tài xế chưa thiết lập chuyển sang **DL-260929-0004 (đến 9/30 · phát hiện 9/29 00:00)** |
| 9 | Đến hạn của đơn đăng ký thay đổi lại là phần tháng 11 còn chưa đến hạn | Chuyển sang **phần tháng 10 chưa xử lý dù đã quá hạn chốt (9/15) (CR0000012)**. Hiển thị là vì không tự động từ chối nên còn lại |
| 10 | Ngày tạm của con tự động khác nhau theo từng màn hình | Thống nhất DL-260928-0021-1 là **xuất 9/30 · giao 10/01 (tạm)** |
| 11 | Ý nghĩa ngày của Số giao hàng không thống nhất, cùng một số chỉ đến các cơ sở khác nhau | Thống nhất **ngày của Số giao hàng = ngày xuất hàng**. Hiển thị ngày (xuất 9/29) là DL-260929-0001~0010, chỉ cùng giao hàng với danh sách · tuần · chi tiết. Chưa đến được coi là hoàn tất là **DL-260923-0031** (xuất 9/23 · giao 9/25) |
| 12 | Tên doanh nghiệp (công ty cổ phần ○○) lẫn vào tên cơ sở | Đổi thành tên cơ sở như "Aozora Foods Trụ sở Shinjuku" (ngày · tuần · đơn đăng ký thay đổi · cần xác nhận · modal di chuyển · đăng ký hộ sự cố) |
| 13 | ID của điểm trung chuyển là cái không có trong Master kho (HU00088 · Chi nhánh Umeda) | Đổi thành cái có trong Master kho như Yamato Chi nhánh Shinagawa **HU00124** |
| 14 | Lạnh có lead time 0 ngày (xuất hàng = giao hàng) | Giải quyết bằng cách làm lại dữ liệu của hiển thị ngày |
| 15 | Bảng điều khiển tạm dừng vẫn là "Tự động thêm ngày điều chỉnh ngay sau tạm dừng", tạm dừng Silver Week tháng 9 không khớp với các màn hình khác | Sửa theo lời của Quyết định v2.2 #2 (không tự động thêm ngày điều chỉnh · nơi đặt do quản trị viên). Ví dụ là **GW 2027 (3 ngày + điều chỉnh 4 ngày · quản trị viên chỉ định)** |
| 16 | Kiểm kê (11/19~20) chồng với khung không xuất hàng nên vô nghĩa làm ví dụ | Dời kiểm kê sang **11/26~27** |
| 17 | Lịch sử gửi chỉ thị xuất hàng là "gửi theo ngày" (đặc tả là gộp 2 tuần và gửi trước ngày bắt đầu 3 ngày) | Thành "Ngày 9/25 (Thứ sáu) gửi phần 9/28~10/11" + thu gom theo ngày (vật tư · phần bổ sung). Ví dụ phiếu giao hàng do ES đánh số là **DL-260928-0021** đã gửi chỉ thị xuất hàng |
| 18 | Số giao hàng · phiếu giao hàng của Web công ty giao hàng ủy thác không khớp với các màn hình khác | Sửa thành DL-260930-0012. Phần xuất ngày 10/20 hiển thị "Đánh số bằng chỉ thị xuất hàng ngày 10/09" |

## Những điều còn lại

- Modal di chuyển là mẫu cố định nên số mục đã chọn (ví dụ: 3 mục ở hiển thị ngày) và "Đang chọn 10 mục" không khớp
- Dự kiến từ tháng 12, chuyển trang tuần · ngày trước và sau được lược bỏ ở demo (hướng dẫn bằng toast)
- Chưa xác nhận lấy điểm khởi đầu chu kỳ là thiết kế (9/14) hay ví dụ của đặc tả (8/31). Nếu khớp với ví dụ của đặc tả thì phải đánh lại ngày của toàn bộ màn hình
