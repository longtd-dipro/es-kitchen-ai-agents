> **Đã đóng băng (bản gốc, 2026-10-05). Không cập nhật thêm.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung file này được chuyển đi đâu và những quyết định đã bị thay thế, xem mục "G" của sổ cái quyết định.

# Phản hồi các mục Cần xác nhận — Danh sách quyết định 21/09/2026

> Kết quả xác nhận ngày 21/09/2026 đối với 84 mục "mâu thuẫn giữa các bản gốc" nêu ở §19 của Đặc tả tổng hợp.
> **Tài liệu này là bản chính xác mới nhất**. Bản gốc (Đặc tả thiết lập Chu kỳ giao hàng / Đặc tả yêu cầu chi tiết Picking・Xuất hàng・Giao hàng・Tài xế) và Đặc tả tổng hợp sẽ được chỉnh theo nội dung này.
> Các mục ghi "Tạm thời" là giá trị đặt tạm đang chờ bên vận hành xác nhận. Khi quyết định xong sẽ thay thế.

## A. Các quyết định liên quan đến cấu trúc

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 25 / 45 | Đơn vị lưu giữ thiết lập tuyến giao hàng (kho・công ty giao hàng・trung chuyển・lead time) | **Hợp đồng cha = giá trị mặc định, Hợp đồng con = giá trị thực tế của tháng đó**. Khi tạo hợp đồng con thì snapshot từ hợp đồng cha. Dự kiến 6 tháng sau được tạo từ giá trị mặc định của hợp đồng cha | §5・§7・§16 |
| 29 | Loại chuyến (chuyến COOL / chuyến giao hàng ES) | **Là mục nhập do hợp đồng (hợp đồng con) giữ**. Không suy ra từ việc có trung chuyển hay không (REQ-DL-785 bị hủy) | §5・§11・§16 |
| 10 / 16 / 52 | Chủ sở hữu và giá trị mặc định của lead time | **Master kho không giữ. Mỗi loại giao hàng của hợp đồng (Lạnh / Đông lạnh / Vật tư) giữ lead time riêng**. Không tự động điền giá trị mặc định. Xóa "giá trị mặc định lấy từ Master kho" ở §3.1B・§12-1 | §3・§5・§6 |
| 4 | Giới hạn trên của lead time hợp đồng | **0〜7 ngày** ("0〜30 ngày" ở §1.3 là sai) | §5・§16 |
| 54 / 78 / 81 / 38 | Quan hệ giữa phiếu vận chuyển và dữ liệu giao hàng | **Chốt quan hệ 1-nhiều. 1 dữ liệu giao hàng (xuất hàng) có nhiều số phiếu vận chuyển (theo từng thùng). Không có trường hợp 1 phiếu vận chuyển chứa nhiều dữ liệu giao hàng** (= không có xuất hàng gộp). "Nhiều-nhiều・bảng trung gian" ngày 19/09/2026 bị **hủy**. Sơ đồ ER quay về `delivery_tracking_numbers` (1-nhiều) | §8・§10・§16 |
| 71 | Hạn thanh toán (hạn nộp tiền) | **Có giữ như một mục** (phần thanh toán trước / phần quyết toán theo thực tích). Tuy nhiên **nghiệp vụ như đối soát thanh toán do phía Bill One thực hiện**. Hủy "không giữ mục" ở §4D-1 | §14・§16 |
| 70 | "③ Điều chỉnh" của thanh toán (hoàn tiền・bù trừ) | **Không làm thành bảng thứ 3 độc lập. Cho phép giữ điều chỉnh (hoàn tiền・bù trừ) bên trong từng loại ① Thanh toán trước và ② Quyết toán theo thực tích** | §14 |
| 60 | Phân công tài xế chặng 1・chặng 2 của trung chuyển | **Cấu trúc cho phép phân công theo đơn vị chặng (leg)**. Vận hành trước mắt chỉ phân công **chặng 2 (điểm trung chuyển → nơi giao hàng)** (chặng 1 do công ty vận chuyển chở) | §11・§12・§16 |
| 21 | Lead time khi có trung chuyển | **Tổng 1 giá trị là đúng**. Phần trung chuyển chỉ hiển thị làm giá trị tham khảo (không dùng để tính toán) | §5・§6 |
| 22 | Điều kiện nhận hàng của cơ sở | **Giữ khung giờ nhận hàng và điều kiện giao hàng như các mục**. Sao chép vào dữ liệu giao hàng để hiển thị cho tài xế | §5・§12・§16 |

## B. Các quyết định liên quan đến Chu kỳ・ngày tháng

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 41 | Định nghĩa tháng Chu kỳ | **Tháng có nhiều ngày hơn trong 28 ngày của các khung A1〜D7**. Nếu A1 = 2026-08-31 thì trong 8/31〜9/27, tháng 9 có 27 ngày nên là **Chu kỳ tháng 9/2026**. yyyymm của ID hợp đồng con (ID hợp đồng-yyyymm) cũng giống vậy. **Chỉ đếm ngày của khung**, ngày tạm dừng Chu kỳ không tiêu hao khung nên không tính vào (dù độ dài theo lịch kéo dài do tạm dừng thì cách xác định tháng Chu kỳ không đổi・xác nhận 21/09/2026). **Chưa quyết khi xảy ra trường hợp bằng nhau 14 – 14 thì lấy tháng trước hay sau** (tạm thời: tháng chứa khung thứ 14 là B7 = tháng trước) | §2・§7 |
| 33 | Chủ sở hữu các mốc (công bố menu・bắt đầu đặt hàng・hạn chốt đặt hàng) | **Phía menu là đúng. Sao chép và giữ ngày thực khi tạo Chu kỳ**, hiển thị trên màn hình. Khi chưa đăng ký menu thì lấy ngày 15 tháng trước làm hạn chốt tạm thời | §4・§7 |
| 40 | Ngày tạo hợp đồng con của tháng thanh toán hiện tại | **Ngày bắt đầu đặt hàng** (thống nhất cùng ngày với việc tạo xác định dữ liệu giao hàng). "Ngày trước ngày bắt đầu đặt hàng" bị hủy | §7 |
| 15 | Khi trúng ngày không xuất hàng được của kho | **Chuyển lịch cả ngày picking và ngày giao hàng** (ngày không xuất hàng được cũng là đối tượng chuyển lịch ngày giao hàng). Cách hiểu "chỉ dừng picking" bị hủy | §4・§6・§15 |
| 19 | Khi không tìm được ngày nào giao hàng được trong vòng 20 ngày | **Đưa vào Cần xác nhận với nội dung "Không thể tạo dự kiến"**. Không tự động quyết định ngày | §6 |
| 14 | Cảnh báo trước khi hết kỳ thiết lập | **Chỉ hiển thị trong màn hình** (tháng cuối đã thiết lập và số tháng còn lại). Không tạo thông báo dashboard | §4 |
| 24 | Mẫu giao hàng (plan_mode) | **Giao hàng từng lần (on_demand) chỉ dành cho vật tư**. Lạnh・Đông lạnh vẫn là 2 giá trị Chu kỳ / Đặc biệt | §5 |
| 27 | Nội dung hiển thị khi xảy ra chuyển lịch | **Danh sách ngắn gọn** ("Sớm 2 ngày"), **màn hình chi tiết・tooltip hiển thị đầy đủ** ("Đang dịch chuyển 2 ngày so với B3 (2026-09-17) vốn có") | §6・§15 |
| 23 | Hiển thị lý do khi khung bị xám | **Ô ngắn gọn** ("B1 Thứ Hai (không giao được)"), **chi tiết trong tooltip** hiển thị khung không xuất hàng được・tên kho・lead time | §5・§15 |
| 20 | Tên gọi Chu kỳ | **Thống nhất là "Chu kỳ giao hàng"**. Sửa "Chu kỳ giao hàng (納品サイクル)" trong đặc tả・đặc tả tổng hợp・demo (tên file `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` giữ nguyên) | Toàn bộ các chương |
| 31 | Tên mục điều kiện nhận hàng của cơ sở | **"Thứ không giao được" / "Dời sớm hơn・Dời muộn hơn"** (thống nhất theo cách gọi trong danh sách mục). Không dùng "Thứ không nhận được", "Hướng chuyển lịch" | §5・§16 |

## C. Các quyết định liên quan đến Picking・Xuất hàng

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 50 | Danh sách Picking | **Chỉ xác nhận trên màn hình quản trị. Không làm xuất PDF** (hủy "tự động tạo bằng PDF" của REQ-DL-103) | §9 |
| 55 | Số phiếu vận chuyển của chuyến đơn vị ủy thác đến kho lấy hàng | **ES đánh số phiếu vận chuyển dựa trên ID dữ liệu giao hàng**. "ES không đánh số" không áp dụng cho chuyến lấy hàng | §10・§16 |
| 8 | Nhóm nhiệt độ tương ứng của Master công ty giao hàng | **3 giá trị: Đông lạnh / Lạnh・Nhiệt độ thường / Vật tư** (nhiệt độ thường cho vào cùng khung với lạnh). Cả 4 giá trị và 2 giá trị đều bị hủy | §3 |
| 26 | Nhập lý do của "thay đổi 1 lần" | **Cả thay đổi tuyến giao hàng và chỉ định ngày riêng lẻ đều không bắt buộc lý do**. Lịch sử thay đổi luôn lưu trước→sau thay đổi và người thao tác | §8 |

## D. Các quyết định liên quan đến Giao hàng・Tài xế・Thanh toán

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 63 | Hình thức cung cấp App tài xế V1.0 | **Triển khai trước trên Web (trình duyệt). Cân nhắc chuyển native trong tương lai** | §12 |
| 66 | Báo cáo sự cố của app và 6 phân loại Master | **Giữ nguyên màn hình app (đã chốt). Bên vận hành đối ứng với 6 phân loại Master**. Đưa bảng đối ứng vào đặc tả | §13 |
| 68 | Ghi nhận "thu hồi" khi giao nhầm | **Chỉ ghi trong báo cáo sự cố**. Không tạo mục chuyên dụng như ngày thu hồi・người thu hồi・số lượng thu hồi | §13 |
| 65 | Đổi tài xế hàng loạt | **Không cần (đổi từng mục một)**. Ghi rõ không làm ở Phase 2 | §12 |
| 61 | Thời hạn có thể đưa "Đã giao" về "Đang xác nhận" | **Không đặt thời hạn (do bên vận hành phán đoán)**. Sau khi thanh toán đã xác định thì phản ánh vào tháng sau bằng "③ Điều chỉnh" | §11・§14 |
| 69 | Khi hủy vì lý do khách hàng sau hạn chốt | **Không tính tiền (như hiện hành)**. Không tạo mục "Phí hủy" | §14 |
| 69b | Điều chỉnh đơn giá | **Giữ bằng điều chỉnh giá của Master gói (các thế hệ ①〜④) và đưa vào thanh toán** | §14 |
| 77 | Hiển thị "Dự kiến / Xác định" trên Web doanh nghiệp | **Giữ dấu "Dự kiến" trên Web doanh nghiệp** (hiển thị tháng của Web vận hành vẫn bỏ thẻ tag) | §15 |

## E. Giá trị tạm thời (chờ bên vận hành xác nhận)

| # | Vấn đề | Tạm thời | Cần xác nhận |
|---|---|---|---|
| 5 | Ý nghĩa tiền tố `HU` của ID kho | **HU = Hub (điểm trung chuyển)**. Chỉ dùng cho ID nội bộ, không dùng trên phiếu vận chuyển・liên kết CSV・chứng từ | Ý nghĩa chính xác trong hệ thống hiện có, và có được dùng trong liên kết bên ngoài không |
| 6 | Mã kho của kho picking (dùng cho liên kết Thomas) | **Dùng nguyên ID kho (dạng WH00001) làm mã liên kết** | Hệ thống mã của phía Thomas. Khi biết sẽ thay thế |
| 9 | Nguồn dữ liệu ngày lễ | **Nhập thủ công 1 lần mỗi năm dữ liệu công khai của Văn phòng Nội các và đăng ký vào Master ngày lễ**. Không làm API bên ngoài・nhập CSV tự động. Bên vận hành có thể thêm・sửa | DB đã tham chiếu trong hệ thống hiện có thực chất là gì |
| 58 | Tên gọi công ty giao hàng・hệ thống kho | Thống nhất ghi **"Yamato Transport (viết tắt: Yamato)" và "Thomas"** | Tên chính thức (quan hệ với Kuruvin Yamato, cách viết THOMAS) |
| 64 | Túi giữ lạnh・chất giữ lạnh của phần gửi qua Yamato | **Dùng một lần (không thu hồi)**. Chỉ ghi lại số | Thực tế có thu hồi không, có nhờ doanh nghiệp trả lại không |
| 67 | Số điện thoại liên hệ | Dành cho tài xế là **050-5784-2777**. Nơi báo cáo sự cố thiết bị **050-3784-2771** ghi kèm như đầu mối khác | Cái nào là đúng hiện hành |

## F. Cách sửa tài liệu (quyết định 21/09/2026)

- **Sửa tất cả kể cả bản gốc.** Không chỉ Đặc tả tổng hợp, mà các mô tả cũ trong `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` và `ピッキング出荷配送ドライバー_詳細要件仕様.md` cũng được viết lại theo giá trị mới.
- Phạm vi phản ánh là **Đặc tả tổng hợp + 2 bản gốc**. 2 demo (`picking_schedule_setting_demo_ja.html` / `delivery_schedule_plan_demo_ja.html` + artifact) để lần sau.
- Ví dụ điển hình của mô tả cũ: ngưỡng số lượng 150→**300 mục/ngày**, kỳ thiết lập 12 tháng→**cơ bản 6 tháng**, điểm khởi đầu của `locked` = ngày trước ngày picking→**xuất gộp 2 tuần (3 ngày trước khi bắt đầu・thứ Sáu)**, tên cũ của trạng thái (Đang chuẩn bị gửi / Đã gửi xong…)→**hệ thống mới** (Chờ xuất hàng / Đã xuất hàng / Đã nhận / Đã giao / Đã giao một phần / Chờ giao lại / Đang xác nhận / Dừng / Hủy), tạo cuốn chiếu→**không làm**, phương thức `pinned`→**phương thức ghi đè đã phê duyệt**, API Yamato→**Phase 3**, A1 Chủ nhật→**Thứ Hai**.
- REQ-DL-804〜828 chưa được đăng ký trong đặc tả yêu cầu. **Đăng ký vào đặc tả yêu cầu như đã phê duyệt.**

## G. Những điều chưa quyết định (giữ trong các mục chưa quyết của §18)

- Hiển thị dự kiến đến đâu trên site chuyên dụng của công ty giao hàng (bao nhiêu tháng sau・mục nào)
- Việc thay đổi ngày từng mục một sau hạn chốt đặt hàng có xử lý kịp không khi số lượng lớn
- Xác nhận đặc tả hiện tại liên quan đến thanh toán・hợp đồng / màn hình chi tiết đơn đăng ký (ngày 19/09/2026 mới đến phần liên quan đến giao hàng)
- Vận hành khi muốn xuất hàng vào ngày bị dừng do điều chỉnh (thực tế không nghỉ)
- Chỉ thị xuất hàng của Thomas có I/F hủy hay không (tiến hành theo phương thức gửi lại, nhưng cần xác nhận với vendor)
- Điều kiện phán định tự động đối với thay đổi có chứa sản phẩm hạn tiêu dùng ngắn
- **Khi tháng Chu kỳ bằng nhau 14 – 14 thì lấy tháng trước hay tháng sau** (tạm thời: tháng chứa khung thứ 14 là B7 = tháng trước. Liên quan trực tiếp đến ID hợp đồng con)
