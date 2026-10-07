# Màn hình Vận hành・Doanh nghiệp (TOP・Dashboard・Quản lý mua hàng・Đánh giá・Màn hình doanh nghiệp・Thông báo・Hạn chế truy cập)

> **Nguồn chính xác của chủ đề này.** Ngày 2026-10-05, đã viết mới chỉ phần "đang có hiệu lực hiện nay" từ các bản gốc và quyết định bên dưới. Đặt các quy tắc màn hình không thuộc đặc tả của nghiệp vụ nào.
> Quyết định đang có hiệu lực hiện nay là `docs/決定台帳.md` (**K**・**M-1**・**M-3**・E・B). Nếu mâu thuẫn thì sổ cái là đúng.
> Bản gốc (đã đóng băng・chỉ để xem lịch sử): `docs/議事録_仕様/運営・法人画面_詳細要件仕様.md` (REQ-UI・2026/10/02).
> Quy tắc chung của toàn bộ màn hình (danh sách・nhập liệu・hiển thị) là sổ cái K・M-1. Quyền hạn theo `Bảng_phân_quyền_Web_vận_hành_20261003.md`.

## 1. TOP của Vận hành (Dashboard)

| # | Quy tắc | Căn cứ |
|---|---|---|
| 1-1 | Màn hình mở đầu tiên của Vận hành. **Hàng 1 = Cảnh báo (Alert) + Lịch, Hàng 2 = Diễn biến mua hàng, Hàng 3 = Yêu thích × Mua hàng (toàn chiều ngang)**. Không hiển thị biểu đồ theo phương thức thanh toán. Biểu đồ có bộ lọc | Sổ cái K・M-3, REQ-UI-001・003 |
| 1-2 | Lịch: theo từng ngày hiển thị **Chu kỳ ES (A1〜D7)**. **Chế độ hiển thị chỉ có "1 tháng"** (không có chuyển sang 4 tuần), chuyển sang tháng trước・sau. Các mục hiển thị là cố định (không có chức năng tùy chỉnh). Giữ cảnh báo Mẫu kinh doanh | REQ-UI-002, Sổ cái E・K (2026-10-05 hong) |
| 1-3 | Cảnh báo hiển thị ở TOP: Menu thiếu điều kiện công bố (từ 3 ngày trước ngày tự động công bố) / Chờ xác định thanh toán từ ngày 21 / Chênh lệch nhập kho・chờ xử lý・thiếu tồn kho vật tư (đều là dòng của "Thông báo (Danh sách cảnh báo)") / Thời kỳ đặt hàng chính thức / Số lượng yêu cầu liên hệ mới, v.v. | Sổ cái M-2・M-3・I・E |
| 1-4 | Cảnh báo cơ sở có tỷ lệ hủy bỏ vượt quá 3% (không hiển thị popup) | `60_Tồn_kho/Tồn_kho.md` §7-9 |

## 2. Quản lý mua hàng (trước đây là "Quản lý doanh thu")

| # | Quy tắc | Căn cứ |
|---|---|---|
| 2-1 | Tên màn hình là **"Quản lý mua hàng"** (cả Vận hành và Doanh nghiệp). "Doanh thu" trong màn hình doanh nghiệp cũng thành "Mua hàng". Cột là "Số lượng mua" "Số tiền mua" | REQ-UI-004, Sổ cái E |
| 2-2 | Vận hành: theo dạng Phase 1 (theo cơ sở・theo sản phẩm・theo người dùng + Yêu thích). Xếp hạng và số lượng đặt hàng theo từng sản phẩm đưa vào "Theo sản phẩm" | Sổ cái K |
| 2-3 | Quản lý mua hàng・người dùng của doanh nghiệp **có thể lọc theo giới tính・độ tuổi** | Sổ cái E |

## 3. Đánh giá

| # | Quy tắc | Căn cứ |
|---|---|---|
| 3-1 | Đánh giá theo từng lần mua (1 đánh giá có nhiều sản phẩm). Danh sách của Vận hành: số lượng đánh giá・tab đánh giá・bình luận (ý kiến)・ID người dùng・biệt danh・cơ sở đã mua hàng. Không hiển thị địa chỉ email. Có thể xác nhận từ 2 sao trở xuống. Lọc theo cơ sở・xuất CSV | REQ-UI-005〜007 |
| 3-2 | **Chỉ hiển thị cho doanh nghiệp: sao・sản phẩm・tag đánh giá・biệt danh.** Không hiển thị ý kiến (mô tả tự do)・ID người dùng・địa chỉ email. Tài khoản doanh nghiệp = tất cả cơ sở, tài khoản cơ sở = cơ sở của mình | REQ-UI-008 (2026/10/02), Sổ cái H |
| 3-3 | ID: đánh giá `RV` + 6 chữ số・người dùng `U` + 8 chữ số・mã đơn hàng `OD` + 7 chữ số. Danh sách 10 mục/trang. Từ chi tiết có link: Doanh nghiệp → Chi tiết doanh nghiệp・Cơ sở → Chi tiết cơ sở・ID sản phẩm → Chi tiết Master sản phẩm・ID người dùng → Danh sách tài khoản (người dùng) (mã đơn hàng chỉ là chữ) | Sổ cái "Quy tắc Đánh giá・Ý kiến (Web vận hành)" (hong 2026-10-05) |
| 3-4 | Xuất CSV **1 dòng = 1 sản phẩm** (lặp lại các mục của đánh giá). Cột: ID đánh giá・Ngày giờ đăng・ID người dùng・Biệt danh・Rút khỏi hệ thống・ID doanh nghiệp・Doanh nghiệp・ID cơ sở・Cơ sở・Mã đơn hàng・ID sản phẩm・Tên sản phẩm・Đánh giá・Tag đánh giá・Bình luận. Không hiển thị địa chỉ email | Như trên |
| 3-5 | **Tag đánh giá là cố định** (không hài lòng 6・hài lòng 6). Không sửa trên màn hình vận hành (khi thay đổi thì phát triển sửa dữ liệu) | Sổ cái "Thay đổi tag đánh giá" (hong 2026-10-05) |

## 4. Màn hình doanh nghiệp

| # | Quy tắc | Căn cứ |
|---|---|---|
| 4-1 | Trang chủ **lấy Lịch làm trung tâm**. Lịch chỉ có ngày giao hàng (không hiển thị giờ). Trang chủ của tài khoản doanh nghiệp = lịch trình của tất cả cơ sở + Thông báo | REQ-UI-010・011, Sổ cái K |
| 4-2 | Màn hình theo phân cấp "**Cơ sở nằm dưới thông tin doanh nghiệp**" (giống Vận hành) | REQ-UI-012 |
| 4-3 | Việc xuất mã QR của ESQR đặt ở màn hình **Thông tin doanh nghiệp (Hồ sơ)** (không đặt ở Trang chủ) | REQ-UI-009 |
| 4-4 | Chi tiết thanh toán chỉ nhìn thấy **phần bên vận hành đã xác định**. PDF hóa đơn là template của Bill One | REQ-UI-013 |
| 4-5 | Những việc làm được khi tạm dừng・sau khi hủy hợp đồng, phạm vi nhìn thấy của tài khoản theo Sổ cái K | Sổ cái K |
| 4-6 | Chỉ báo cáo kiểm kê hỗ trợ độ rộng điện thoại (các phần khác giả định PC) | Sổ cái H |
| 4-6b | Thiết lập theo từng doanh nghiệp "Cho phép tài khoản cơ sở đăng ký thay đổi" **không đưa vào Phase 2** | Sổ cái N (hong 2026-10-05) |
| 4-7 | Link "Trợ giúp" ở header của mỗi app (URL giữ trong thiết lập) | Sổ cái E (phạm vi chức năng B) |

## 5. Gửi thông báo

Không có đặc tả chuyên dụng (tài liệu cũ `お知らせ配信_画面仕様_JA-VI_v1.md` không có trong git). Ghi những gì đã quyết định ở đây. Các mục theo từng màn hình nằm trong Thiết kế màn hình (`docs/05_画面設計書/`・mã màn hình **AW_NOTI**).

| # | Quy tắc | Căn cứ |
|---|---|---|
| 5-1 | **Chức năng chung cho tất cả site. Do Quản lý hệ thống của Vận hành quản lý** | Sổ cái B |
| 5-2 | Màn hình: danh sách・đăng ký mới・chi tiết・chỉnh sửa・chọn riêng đối tượng gửi (Notification Management của Figma) | STEP7 S7-17・18 |
| 5-3 | ID = **`NT-` + 5 chữ số** (tự động gán). Danh mục cố định 4 loại: **Thông báo / Menu / Bảo trì / Cập nhật hệ thống** | Sổ cái "ID・Danh mục của Thông báo" (hong 2026-10-05) |
| 5-4 | Trạng thái: những mục chưa bắt đầu là **"Đã lên kế hoạch"** (không dùng "Đã đặt trước". Khảo sát cũng tương tự) | Sổ cái (hong 2026-10-05・C2) |
| 5-5 | **Dừng gửi**: ở chi tiết và danh sách (cột thao tác) có "Dừng gửi" (mục đang công khai・đã lên kế hoạch. Sau khi xác nhận thì dừng. **Không thể hoàn tác**). Mục đã dừng gửi không thể chỉnh sửa・có thể xóa | Sổ cái "Dừng gửi thông báo" |
| 5-6 | Đối tượng gửi: tên cột là **"Hiển thị trên ES STATION"** (trước đây "Thông báo đến ESS"). Đối tượng gửi có "Nhà cung cấp". Người dùng chế độ khách・ESQR nằm ngoài đối tượng | Sổ cái "Tên cột đối tượng gửi・đính kèm・sắp xếp của Thông báo", STEP6 Q1, RD-AP-035 |
| 5-7 | Ngày giờ bắt đầu・kết thúc hiển thị: thành phần chọn ngày + giờ. Kết thúc để trống = không kết thúc | Như trên |
| 5-8 | Đính kèm: JPG・PNG・PDF・HEIC・5MB/mục・tối đa 10 mục. **Không đính kèm vào email** | Như trên, Sổ cái M-1 |
| 5-9 | Cũng có thể làm **thông báo chỉ qua email** (hiển thị trên màn hình vận hành và lưu lịch sử). Khi gửi email thì **nội dung email là bắt buộc** | Sổ cái M-3, như trên |
| 5-10 | **Người gửi・chữ ký của email là giá trị thiết lập** (Quản lý hệ thống có thể đổi trong quản lý thiết lập. Giá trị ban đầu là giá trị trong code hiện tại) | Sổ cái "Người gửi・chữ ký email của Thông báo" |
| 5-11 | Với email thông báo quan trọng, khi lưu sẽ **đề xuất thời điểm gửi** (nếu ngày bắt đầu là ngày nghỉ của khách hàng thì ngày làm việc trước đó). Bên vận hành chọn | Sổ cái M-3 |
| 5-12 | Thứ tự ban đầu của danh sách là **theo ngày cập nhật cuối mới nhất trước** | Sổ cái "Tên cột đối tượng gửi・đính kèm・sắp xếp của Thông báo" |
| 5-13 | Web doanh nghiệp: từ "Thông báo" ở Trang chủ vào **Chi tiết thông báo** (danh mục・ngày giờ đăng・tiêu đề・nội dung・đính kèm・"Quay lại danh sách"). Chỉ hiển thị những mục mà người dùng doanh nghiệp đó là đối tượng gửi và hiện đang công khai | Quyết định v2.3 #66 |
| 5-14 | Việc phân phối thông báo (Thông báo Web doanh nghiệp / Email / App) được ghi trong đặc tả của từng nghiệp vụ | — |

## 5b. Liên hệ (từ Web doanh nghiệp)

| # | Quy tắc | Căn cứ |
|---|---|---|
| 5b-1 | Liên hệ của Web doanh nghiệp được gửi đến HubSpot (Phase 2 chỉ kết nối HubSpot cho việc này và AI chatbot). Không gửi email cho bên vận hành, TOP hiển thị số lượng mới + "Email nhận thông báo" trong quản lý thiết lập | Sổ cái M-3 |
| 5b-2 | Màn hình Vận hành "Liên hệ (từ Web doanh nghiệp)" (mã màn hình **AW_INQU**): tìm kiếm (từ khóa・doanh nghiệp・loại・chỉ mục mới・ngày gửi. **Không đặt lọc theo trạng thái**: vì trạng thái chỉ còn "Đã gửi (HubSpot)")・phân trang (10 mục・theo ngày giờ gửi mới nhất trước). Danh sách có **2 cột tên doanh nghiệp・tên cơ sở** (ID là phụ) | Sổ cái "Màn hình Liên hệ (Web vận hành)" (hong 2026-10-05) |
| 5b-3 | Bấm vào dòng sẽ mở **Chi tiết liên hệ** (nội dung・thông tin liên lạc・mã tiếp nhận của HubSpot). Ngay khi mở thì bỏ trạng thái mới | Như trên |
| 5b-4 | Chỉ Toàn quyền・Quản lý hệ thống mới xem được (theo bảng phân quyền) | Như trên |
| 5b-5 | **Khi không gửi được đến HubSpot**: Web doanh nghiệp hiển thị "Không gửi được. Vui lòng thử lại sau." và giữ lại nội dung đã nhập trong biểu mẫu (khách hàng gửi lại). Liên hệ không gửi được không lưu lại ở ES. **Không tạo trạng thái "Lỗi gửi"・nút gửi lại・cảnh báo ở TOP** (bên vận hành không có việc phải làm). Danh sách của Vận hành chỉ hiển thị những mục đã gửi được đến HubSpot | Sổ cái "Xử lý lỗi gửi Liên hệ (HubSpot)" (hong 2026-10-05・B) |
| 5b-6 | Trả lời・xử lý thực hiện trên HubSpot. ES không giữ tình trạng trả lời・xử lý (đồng bộ CRM là Phase 3) | Sổ cái M-3 |

## 5c. Nhóm menu của Vận hành

- Tên của nhóm Đánh giá・Ý kiến / Quản lý khảo sát / Danh sách thông báo / Liên hệ là **"Thông báo・Ý kiến"** (trước đây "Đối ứng khách hàng"). Breadcrumb cũng dùng tên này (ví dụ: Thông báo・Ý kiến ＞ Danh sách thông báo). Mã màn hình: Đánh giá・Ý kiến = AW_REVI, Thông báo = AW_NOTI, Liên hệ = AW_INQU, Khảo sát = AW_SURV (Sổ cái・hong 2026-10-05).

## 6. Khảo sát

- Trạng thái chưa bắt đầu là "Đã lên kế hoạch". Đối tượng gửi là **người dùng của app** (doanh nghiệp・cơ sở chỉ là bộ lọc). "Tất cả" = người dùng app đang sử dụng (trừ cơ sở đang tạm dừng). Sau khi bắt đầu thì khóa câu hỏi. CSV câu trả lời mỗi người 1 dòng. Có thể tạo từ template (Sổ cái M-3・E).

## 7. Hạn chế truy cập

| # | Quy tắc | Căn cứ |
|---|---|---|
| 7-1 | **IP whitelist áp dụng cho tất cả người dùng của Web vận hành**. Từ ngoài IP đã đăng ký cần mã xác thực qua email (OTP). Các site khác nằm ngoài đối tượng | Sổ cái B, REQ-UI-014 |
| 7-2 | Thời hạn đăng nhập là 1 ngày cho tất cả site. Đặt lại mật khẩu bằng mã xác thực (5 phút) | Sổ cái M-1・K |

## 8. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U1 | URL của site trợ giúp của khách hàng | Xác nhận với khách hàng |
