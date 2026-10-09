# Danh sách bất nhất giữa demo vận hành × app tài xế (2026/10/01)

Đối tượng:
- Demo màn hình quản trị (vận hành) "Demo màn hình quản trị ESSTATION": màn hình quản lý giao hàng (chi tiết giao hàng · đăng ký hộ sự cố · quyết định cách xử lý · chi tiết giao hàng dành cho doanh nghiệp), master nhân viên giao hàng, danh sách tài khoản
- "ES STATION Driver Prototype" (app tài xế)
- Tiền đề: các quyết định của `App_tài_xế_Điểm_sửa_đặc_tả_20260930.md`

Về nguyên tắc không xét các khác biệt nhỏ của dữ liệu. Đối tượng là các mâu thuẫn về đặc tả · hạng mục · luồng.
※ Kết quả xử lý tham khảo `Demo_vận_hành_App_tài_xế_Đề_xuất_cải_thiện_20261001.md`.

## A. Đặc tả mâu thuẫn (cần sửa)

| No | Vấn đề | Demo vận hành | App tài xế | Cách sửa (đề xuất) |
|---|---|---|---|---|
| A1 | Hạn sử dụng | Chi tiết giao hàng "Kết quả xác nhận tồn kho · trưng bày" có cột "Hạn sử dụng · hạn tiêu thụ (phần đã giao)". Trong chú thích có "STEP2 (đọc mã vạch · hạn sử dụng)" "delivery_lines.expiry_date" | Theo quyết định No.4 không theo dõi hạn. Cũng không có ô nhập | **Phía vận hành**: xóa hạn sử dụng · expiry_date khỏi cột và chú thích |
| A2 | Ai vận chuyển chuyến COOL | Chuyến giao hàng COOL = công ty vận chuyển (Yamato). Không phân công cho đoạn của công ty vận chuyển | Có màn hình chuyến COOL (DA_COOL_001), tài xế giao hàng và "Hoàn tất khi còn một phần chưa giao" | **Cần quyết định**: có trường hợp tài xế ủy thác · công ty vận chuyển chuyến COOL không |
| A3 | Tương ứng giữa lựa chọn sự cố và 6 phân loại | Cách xử lý đã quyết chỉ có "Thiếu sản phẩm · giao nhầm" → loại chưa xác định, "Vắng mặt · không liên lạc được" → vắng mặt · không nhận được (có con tự động) | Khi nhận: thiếu số thùng / giao nhầm / hàng hỏng / khác. Khi giao: tắc đường · tai nạn, v.v. Ghi tự động: một phần chưa nhận → thiếu số thùng, chênh lệch trưng bày → thiếu sản phẩm · giao nhầm, COOL một phần chưa giao → (chưa xác định) | **Cần quyết định**: bảng tương ứng toàn bộ lựa chọn của app · ghi tự động → 6 phân loại (app_reason_raw) |
| A4 | Tên bước · nội dung của chuyến giao hàng ES | 1. Ảnh trước khi trưng bày 2. Xác nhận tồn kho · loại bỏ 3. Kiểm hàng 4. Ảnh sau khi trưng bày 5. Thu tiền. Tiêu đề bảng của cùng màn hình là "Tồn kho sau trưng bày STEP4 Trưng bày", nên cũng mâu thuẫn trong nội bộ vận hành | ① Trước trưng bày ② Tồn kho / loại bỏ ③ Trưng bày (kiểm hàng = số đã xếp) ④ Ảnh sau trưng bày ⑤ Đăng ký thu tiền | Thống nhất tên. Quyết định "Tồn kho sau trưng bày" lấy từ giá trị của bước nào |
| A5 | Hiển thị trạng thái | Chờ xuất hàng → Đã xuất hàng → Đã nhận → Đã giao / Giao một phần… Sự cố là báo cáo. Khi chưa giải quyết thì vẫn là Đã nhận | Chưa giao / Hoàn tất giao hàng. Nếu có sự cố thì badge "Sự cố". Dù một phần chưa giao vẫn là "Hoàn tất giao hàng" | Quyết định "Hoàn tất giao hàng" = cái gì (đã báo cáo) của vận hành |
| A6 | Nhận ở điểm trung chuyển | "Việc nhận ở lần 2 chỉ ghi nhận thời gian" "Không lấy tình hình ở điểm trung chuyển" | Kiểm tra từng phiếu giao hàng ở điểm trung chuyển, nếu thiếu thì tự động báo cáo là thiếu số thùng | Khớp về một bên |
| A7 | Số phiếu giao hàng | Chuyến lấy hàng do ES đánh số = Số giao hàng + số thùng (DL-260928-0021-01) | Hàng nhận ở kho cũng ở dạng "2107-6228-5031". Số giao hàng không hiện trên màn hình | Đưa phần nhận ở kho của app về dạng DL-…-01 |

## B. Phía vận hành không có nơi tiếp nhận (chỉ có ở app)

| No | Hạng mục | App tài xế | Demo vận hành | Cách sửa (đề xuất) |
|---|---|---|---|---|
| B1 | Báo cáo đỗ xe | Bắt buộc (ảnh biên lai + phí đỗ xe) | Chi tiết giao hàng không có ô. Cổng của đơn vị ủy thác có số tiền đỗ xe | "Phí đỗ xe" vào thực tế giao hàng của vận hành, biên lai vào tài liệu đính kèm |
| B2 | Chia sẻ dự kiến đến | "Chia sẻ với nơi giao hàng · vận hành" | Chi tiết giao hàng của vận hành và chi tiết giao hàng dành cho doanh nghiệp đều không hiển thị | Thêm hiển thị vào cả hai |
| B3 | Tài liệu dành cho công ty ủy thác | Thẻ nơi giao hàng chỉ có văn bản ghi chú | Master cơ sở có tài liệu lộ trình mang vào · sổ tay cơ sở · quy trình bàn giao của trung chuyển | Cho phép mở tài liệu từ app |

## C. Ký hiệu · ID · dữ liệu

| No | Nội dung |
|---|---|
| C1 | ID nhân viên giao hàng: app DR00001 (Yamaoka Miyuki), vận hành DR0001 (Kobayashi Sho). DR0011 Saito Kenta trong danh sách tài khoản của vận hành không có ở master nhân viên giao hàng |
| C2 | Ký hiệu COOL: Quản lý giao hàng · Master gói của vận hành là "Chuyến giao hàng COOL", hợp đồng · app · cổng của đơn vị ủy thác là "Chuyến COOL" |
| C3 | Kho: "Kho Aussie Foods (Shibuya)" của app không có trong master kho |
| C4 | "Hôm nay" của demo: vận hành 2026/10/05, app 2026/06/12, cổng của đơn vị ủy thác 2026/08/21 |

## Những điểm khớp nhau (đã xác nhận)

- Luồng Vắng mặt · không liên lạc được → vắng mặt · không nhận được (con tự động)
- Báo cáo sự cố khi có chênh lệch ở kiểm hàng
- Thu tiền là số tiền dự kiến và số tiền thực thu (nếu 0 yên thì không hiển thị)
- Báo cáo kiểm kê vào từ "Tài xế chuyến giao hàng ES (app tài xế)"
- Điểm trung chuyển HU00124 và cách hiểu đoạn mà 1 lần = nhận ở kho thì thành đã nhận
- Báo cáo sự cố gửi cho vận hành. Việc phán đoán hủy · giao lại do vận hành thực hiện
