# Màn hình Vận hành・Doanh nghiệp — digest ES-STATION
> Nguồn: `80_Màn_hình_vận_hành_và_doanh_nghiệp/Màn_hình_vận_hành_và_doanh_nghiệp.md` · Trạng thái: chuẩn (nguồn chính xác của chủ đề, viết lại 2026-10-05; sổ cái `決定台帳` thắng nếu mâu thuẫn; bản gốc REQ-UI 2026/10/02 đã đóng băng) · Digest tạo: 2026-10-08
## 1. Phạm vi & actors
- Web vận hành (mã `AW_`): TOP/Dashboard, Quản lý mua hàng, Đánh giá (`AW_REVI`), Thông báo (`AW_NOTI`), Liên hệ (`AW_INQU`), Khảo sát (`AW_SURV`), hạn chế truy cập IP. Actor: Toàn quyền, Quản lý hệ thống (gửi thông báo, xem Liên hệ); quyền theo `Bảng_phân_quyền_Web_vận_hành_20261003.md`. [§1-5c, §7]
- Web doanh nghiệp (`CW_`): Trang chủ lịch, Quản lý mua hàng, Đánh giá, Thông báo, Liên hệ, thanh toán. Actor: tài khoản doanh nghiệp (tất cả cơ sở), tài khoản cơ sở (cơ sở mình). [§3-2, §4]
- App người dùng: là đối tượng nhận Khảo sát/Thông báo. [§5-6, §6]
## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Quản lý mua hàng | trước là "Quản lý doanh thu" | Cột "Số lượng mua", "Số tiền mua" [§2-1] |
| Chu kỳ ES | A1〜D7 | Hiển thị trên lịch Dashboard [§1-2] |
| Nhóm menu "Thông báo・Ý kiến" | trước là "Đối ứng khách hàng" | Gồm Đánh giá・Ý kiến / Khảo sát / Danh sách thông báo / Liên hệ [§5c] |
| Hiển thị trên ES STATION | trước "Thông báo đến ESS" | Cột đối tượng gửi thông báo [§5-6] |
| Đã lên kế hoạch | không dùng "Đã đặt trước" | Trạng thái chưa bắt đầu (Thông báo, Khảo sát) [§5-4, §6] |
- ID: Đánh giá `RV`+6 số · Người dùng `U`+8 số · Đơn hàng `OD`+7 số · Thông báo `NT-`+5 số (tự gán) [§3-3, §5-3]
- Mã màn hình: AW_REVI, AW_NOTI, AW_INQU, AW_SURV [§5c]
## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. Dashboard: Hàng 1 = Cảnh báo + Lịch; Hàng 2 = Diễn biến mua hàng; Hàng 3 = Yêu thích × Mua hàng (toàn ngang). Không có biểu đồ theo phương thức thanh toán; biểu đồ có bộ lọc. [§1-1]
2. Lịch Dashboard chỉ chế độ "1 tháng" (không 4 tuần), chuyển tháng trước/sau, mục hiển thị cố định, giữ cảnh báo Mẫu kinh doanh. [§1-2]
3. Cảnh báo TOP: Menu thiếu điều kiện công bố (từ 3 ngày trước ngày tự động công bố); chờ xác định thanh toán từ ngày 21; chênh lệch nhập kho/chờ xử lý/thiếu tồn kho vật tư; thời kỳ đặt hàng chính thức; số liên hệ mới... [§1-3]
4. Cảnh báo cơ sở có tỷ lệ hủy > 3%, không popup. [§1-4]
5. Quản lý mua hàng Vận hành theo Phase 1 (cơ sở・sản phẩm・người dùng + Yêu thích); xếp hạng và số lượng đặt theo sản phẩm vào "Theo sản phẩm". Doanh nghiệp: lọc được theo giới tính・độ tuổi. [§2-2, §2-3]
6. Đánh giá theo từng lần mua (1 đánh giá nhiều sản phẩm); Vận hành xem được số lượng, tab, ý kiến, ID người dùng, biệt danh, cơ sở; KHÔNG hiển thị email; xác nhận được từ 2 sao trở xuống; lọc theo cơ sở; xuất CSV. [§3-1]
7. Doanh nghiệp chỉ thấy: sao・sản phẩm・tag đánh giá・biệt danh. Không thấy ý kiến, ID người dùng, email. [§3-2]
8. Danh sách đánh giá 10 mục/trang; link: Doanh nghiệp→Chi tiết doanh nghiệp, Cơ sở→Chi tiết cơ sở, ID sản phẩm→Master sản phẩm, ID người dùng→DS tài khoản (người dùng); mã đơn chỉ là chữ. [§3-3]
9. CSV đánh giá: 1 dòng = 1 sản phẩm; cột gồm ID đánh giá, ngày giờ đăng, ID/biệt danh người dùng, rút khỏi hệ thống, doanh nghiệp, cơ sở, mã đơn, sản phẩm, đánh giá, tag, bình luận; không email. [§3-4]
10. Tag đánh giá cố định (không hài lòng 6・hài lòng 6), không sửa trên màn hình vận hành (dev sửa dữ liệu). [§3-5]
11. Web doanh nghiệp: Trang chủ lấy Lịch làm trung tâm, chỉ ngày giao (không giờ); tài khoản doanh nghiệp = lịch mọi cơ sở + Thông báo. Phân cấp "Cơ sở nằm dưới thông tin doanh nghiệp". [§4-1, §4-2]
12. Xuất QR của ESQR đặt ở Thông tin doanh nghiệp (Hồ sơ), không ở Trang chủ. [§4-3]
13. Chi tiết thanh toán chỉ hiện phần bên vận hành đã xác định; PDF hóa đơn là template Bill One. [§4-4]
14. Chỉ báo cáo kiểm kê hỗ trợ độ rộng điện thoại, còn lại giả định PC. [§4-6]
15. Thiết lập "cho phép tài khoản cơ sở đăng ký thay đổi" KHÔNG đưa vào Phase 2. [§4-6b]
16. Link "Trợ giúp" ở header mỗi app (URL giữ trong thiết lập). [§4-7]
17. Thông báo: chức năng chung mọi site, do Quản lý hệ thống Vận hành quản lý; danh mục cố định 4: Thông báo / Menu / Bảo trì / Cập nhật hệ thống. [§5-1, §5-3]
18. Dừng gửi (mục đang công khai/đã lên kế hoạch): xác nhận rồi dừng, KHÔNG hoàn tác; đã dừng thì không sửa, được xóa. [§5-5]
19. Đối tượng gửi có "Nhà cung cấp"; người dùng chế độ khách・ESQR ngoài đối tượng. [§5-6]
20. Bắt đầu/kết thúc: chọn ngày+giờ; kết thúc trống = không kết thúc. [§5-7]
21. Đính kèm JPG・PNG・PDF・HEIC, 5MB/mục, tối đa 10; không đính vào email. [§5-8]
22. Có thông báo chỉ qua email (vẫn hiển thị và lưu lịch sử); gửi email thì nội dung email bắt buộc. [§5-9]
23. Người gửi・chữ ký email là giá trị thiết lập (Quản lý hệ thống đổi được; ban đầu theo code hiện tại). [§5-10]
24. Email quan trọng: khi lưu đề xuất thời điểm gửi (ngày bắt đầu là ngày nghỉ khách → ngày làm việc trước đó); bên vận hành chọn. [§5-11]
25. Danh sách thông báo sắp theo ngày cập nhật cuối mới nhất trước. [§5-12]
26. Web doanh nghiệp: chi tiết thông báo (danh mục, ngày giờ đăng, tiêu đề, nội dung, đính kèm, quay lại); chỉ hiện mục user thuộc đối tượng và đang công khai. [§5-13]
27. Liên hệ Web doanh nghiệp gửi HubSpot (Phase 2 chỉ dùng HubSpot cho việc này và AI chatbot); không email cho vận hành; TOP hiện số mới + "Email nhận thông báo" trong thiết lập. [§5b-1]
28. AW_INQU: tìm kiếm (từ khóa・doanh nghiệp・loại・chỉ mục mới・ngày gửi), KHÔNG lọc theo trạng thái; 10 mục/trang, mới nhất trước; 2 cột tên doanh nghiệp・cơ sở. Mở chi tiết thì bỏ trạng thái mới. Chỉ Toàn quyền・Quản lý hệ thống xem. [§5b-2, 5b-3, 5b-4]
29. Gửi HubSpot lỗi: Web DN báo "Không gửi được. Vui lòng thử lại sau.", giữ nội dung form; không lưu ở ES; KHÔNG có trạng thái "Lỗi gửi", nút gửi lại, cảnh báo TOP. Trả lời/xử lý trên HubSpot, ES không giữ (đồng bộ CRM là Phase 3). [§5b-5, 5b-6]
30. Khảo sát: đối tượng là người dùng app (DN・cơ sở chỉ là bộ lọc); "Tất cả" = người dùng app đang dùng trừ cơ sở tạm dừng; khóa câu hỏi sau khi bắt đầu; CSV mỗi người 1 dòng; tạo từ template. [§6]
31. IP whitelist áp dụng mọi user Web vận hành; ngoài IP cần OTP email; site khác ngoài đối tượng. [§7-1]
32. Hạn đăng nhập 1 ngày mọi site; đặt lại mật khẩu bằng mã xác thực (5 phút). [§7-2]
## 4. Trạng thái & dữ liệu chính
- Máy trạng thái đầy đủ: Không có trong tài liệu. Chỉ nêu: Thông báo/Khảo sát có "Đã lên kế hoạch", đang công khai, đã dừng gửi (không hoàn tác) [§5-4, 5-5]; Liên hệ chỉ còn "Đã gửi (HubSpot)" + cờ "mới" [§5b-2].
- Entity nêu: Đánh giá (RV), Thông báo (NT), Liên hệ (mã tiếp nhận HubSpot), Khảo sát; tên bảng/cột vật lý: Không có trong tài liệu.
## 5. Liên kết với nhóm khác & hệ thống ngoài
- `60_Tồn_kho/Tồn_kho.md` §7-9 (cảnh báo tỷ lệ hủy > 3%) [§1-4]; sổ cái `決定台帳` (K・M-1・M-3・E・B・H・N), `Bảng_phân_quyền_Web_vận_hành_20261003.md`; thiết kế màn hình `docs/05_画面設計書/` [§5].
- Hệ thống ngoài: HubSpot (Liên hệ), Bill One (PDF hóa đơn), email. Cognito/THOMAS/Yamato: Không có trong tài liệu.
- Phân phối thông báo từng nghiệp vụ nằm trong đặc tả nghiệp vụ tương ứng [§5-14].
## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- U1: URL site trợ giúp của khách hàng — xác nhận với khách. [§8]
- Không nêu mâu thuẫn khác. Tài liệu cũ `お知らせ配信_画面仕様_JA-VI_v1.md` không có trong git nên thông báo không có đặc tả chuyên dụng. [§5]
## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Màn hình có đúng tên mới ("Quản lý mua hàng", "Thông báo・Ý kiến", "Hiển thị trên ES STATION", "Đã lên kế hoạch") và mã AW_/CW_ đúng?
2. Dữ liệu đánh giá hiển thị cho doanh nghiệp có lộ ý kiến, ID người dùng, email không? (chỉ sao・sản phẩm・tag・biệt danh)
3. Thông báo: đã đủ dừng gửi (không hoàn tác), email-only, nội dung email bắt buộc, đính kèm không vào email, đối tượng gồm Nhà cung cấp, loại trừ khách・ESQR?
4. Liên hệ lỗi HubSpot: có lỡ thêm trạng thái "Lỗi gửi"/gửi lại/cảnh báo TOP không? (bị cấm)
5. Có đề xuất tính năng ngoài Phase 2 không (thiết lập cho phép cơ sở đăng ký thay đổi, đồng bộ CRM)?
6. Cảnh báo TOP có đủ nguồn (menu, thanh toán từ ngày 21, tồn kho, hủy > 3%, liên hệ mới) và Lịch chỉ 1 tháng?
7. Hỏi khách về URL trợ giúp (U1); với tính năng chạm IP/OTP/đăng nhập, xác nhận chỉ Web vận hành áp dụng whitelist.
8. Kiểm tra quyền từng vai trò với bảng phân quyền 20261003 (nguồn này không liệt kê chi tiết).
