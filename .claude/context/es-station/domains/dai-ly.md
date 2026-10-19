# Đại lý & Giới thiệu — digest ES-STATION
> Nguồn: `70_Đại_lý/Đại_lý_và_giới_thiệu.md` (+ tham chiếu chéo: `40_Master_Phí_Thanh_toán/Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md`, `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md` — chưa đọc, chỉ được dẫn) · Trạng thái: chuẩn (nguồn chính thức của chủ đề, tổng hợp 2026-10-05; sổ quyết định `docs/決定台帳.md` là chuẩn nếu mâu thuẫn) · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- Phí giới thiệu / giảm giá cho khách ký hợp đồng thông qua giới thiệu; cài đặt do **Vận hành** thực hiện, không phải doanh nghiệp yêu cầu [§1 1-1].
- Màn hình thuộc phía Vận hành (Web vận hành AW_ — suy luận từ "Màn hình của Vận hành" §6): Master đại lý, Danh sách giới thiệu, Quản lý thanh toán [§6].
- Phía doanh nghiệp: chỉ có ô mã đại lý (tùy chọn) trong form đăng ký [§5 5-1]; khi thêm cơ sở thấy đại lý mặc định của doanh nghiệp [§1 1-4].
- Người nhận phí: người giới thiệu (doanh nghiệp / đại lý / đối tác / đại lý đặc biệt) [§1 1-2]. Không có trong tài liệu: app tài xế, web NCC, web công ty vận chuyển.

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc Nhật / tên vật lý | Nghĩa ngắn |
|---|---|---|
| Phí giới thiệu | Không có trong tài liệu (REQ-AG) | Tiền trả cho người giới thiệu hoặc áp dụng giảm giá |
| Mẫu phí A/B/C/D | Không có trong tài liệu | A = giới thiệu doanh nghiệp · B = đại lý · C = đối tác · D = đại lý đặc biệt [§7 U2] |
| Số tiền cơ sở | Không có trong tài liệu | Cơ sở tính phí: chỉ phần cố định chưa thuế sau giảm giá (trả trước) [§2 2-1] |
| Master giảm giá / mã giảm giá | Không có trong tài liệu | Nơi giữ giảm giá, không ghi cứng trong code [§2 2-4] |
| Mã đại lý | Không có trong tài liệu | Ô tùy chọn ở form đăng ký; ví dụ mã giảm giá `DC000001` [§5, §7 U7] |
| Shot／liên tục | Không có trong tài liệu | Hình thức thanh toán một lần / liên tục, đặt theo đại lý・hợp đồng [§2 2-3] |
- Mã yêu cầu gốc: `REQ-AG-xxx`; mã điểm mở khách hàng: `_OPEN一覧` 1005-05; sổ quyết định mục B (số tiền cơ sở), L (số tiền mẫu B).

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. Chỉ có 4 mẫu phí A/B/C/D, chọn ở màn chi tiết đại lý [§1 1-2].
2. 1 doanh nghiệp = 1 đại lý; không gắn đại lý khác nhau theo cơ sở [§1 1-3].
3. Thêm cơ sở: mặc định hiển thị đại lý của doanh nghiệp; được đổi sang "Không áp dụng", ô lý do tùy chọn [§1 1-4].
4. Mẫu A: 33,000 yên (đã gồm thuế), 1 lần khi ký kết thành công; cùng doanh nghiệp nhiều cơ sở vẫn chỉ 1 lần [§2 bảng, REQ-AG-006].
5. Mẫu C: 10% số tiền cơ sở, tối đa 36 tháng [§2]. Mẫu D: 7% số tiền cơ sở, trong suốt thời gian còn tiếp tục [§2].
6. Mẫu B: 1 lần khi ký kết, theo số lượng cung cấp hàng tháng [tạm]: đến 50 ¥22,000／đến 100 ¥33,000／trên đó ¥55,000 — số tiền chưa chốt (xem U2) [§2].
7. Số tiền cơ sở = chỉ phần cố định chưa thuế sau giảm giá (trả trước); KHÔNG tính phần quyết toán theo thực tế (trả sau); khoản thanh toán trong thời gian dùng thử KHÔNG thuộc đối tượng [§2 2-1].
8. Số tiền tự động tính nhưng được chỉnh tay (điều chỉnh giá, ngoại lệ); số tiền giảm giá của giới thiệu doanh nghiệp cũng nhập được [§2 2-2].
9. Shot／liên tục cài theo từng đại lý・từng hợp đồng [§2 2-3].
10. Giảm giá giữ bằng master giảm giá (mã giảm giá); điều kiện cơ sở áp dụng có "mã đại lý đối tượng" [§2 2-4].
11. Đếm 36 tháng từ lúc bắt đầu hợp đồng của cơ sở đầu tiên; cơ sở đầu hủy mà cơ sở khác còn thì thời hạn giữ nguyên; reset khi tất cả cơ sở của doanh nghiệp đã mất [§3 3-1..3-3].
12. Đổi gói giữa chừng: dùng gói tại thời điểm giới thiệu, không tính lại, không quyết toán chênh lệch [§4, REQ-AG-023].
13. Không ghi đè dữ liệu hợp đồng; tạo dữ liệu mới theo từng tháng, xem ngược được [§4, REQ-AG-044].
14. Form đăng ký: mã đại lý tùy chọn, để trống = không có giới thiệu; form giới thiệu và form thường là một [§5 5-1].
15. Không dùng tự khai "Bạn biết đến ở đâu"; xác định người giới thiệu bằng mã đại lý + Vận hành xác nhận (tiếp nhận) [§5 5-2].

## 4. Trạng thái & dữ liệu chính
- Máy trạng thái: Không có trong tài liệu. Chỉ có trạng thái thanh toán "Chưa xác nhận／Đã xác nhận"; Vận hành sửa được trạng thái thanh toán và ngày thanh toán từ danh sách [§6 REQ-AG-043・045].
- Master đại lý: thông tin đại lý・mẫu phí・gói giới thiệu・tỷ lệ／số tiền・người phụ trách chính・danh sách cơ sở đang hiệu lực・danh sách lịch thanh toán [§6 REQ-AG-041].
- Danh sách giới thiệu: người giới thiệu・được giới thiệu・gói・course・số tiền thanh toán・số tiền chi trả・ngày dự kiến kết thúc・số tiền chi trả theo tháng; xuất CSV [§6 REQ-AG-042].
- Quản lý thanh toán: dữ liệu theo đại lý × tháng [§6]. Tên bảng/cột vật lý: Không có trong tài liệu.

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `40_Master_Phí_Thanh_toán/Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md`: master giảm giá (giảm giá đại lý) [đầu file].
- `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md`: ô mã đại lý trong form đăng ký [đầu file, §5].
- Gắn với doanh nghiệp / cơ sở / hợp đồng / gói (nhóm 20, suy luận từ §1, §3, §4).
- HubSpot: nhận biết kênh giới thiệu tự động từ ký kết thành công — tạm, giai đoạn 2 chưa định [§7 U6]. THOMAS/Yamato/Bill One/Cognito: không có trong tài liệu.
- Email yêu cầu lập hóa đơn cho đại lý: chưa quyết [§7 U5].

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- U1: Hình thức tính cuối cùng — 2026/01/16 nói "tỷ lệ (%)", 2026/06/16 nói "giảm giá theo gói + mã giảm giá"; số tiền・tỷ lệ và số tiền cơ sở đã chốt nhưng chưa rõ dùng "giảm giá theo gói" đến mức nào. Hỏi giám đốc・anh Aoyama [§7].
- U2: Số tiền mẫu B đang [tạm] (`_OPEN一覧` 1005-05) [§7].
- U3: Thời điểm thanh toán chưa định (phần trả sau đã loại khỏi số tiền cơ sở) [§7].
- U4: Điều kiện phát sinh thanh toán khi thêm cơ sở [§7].
- U5: CSV thông báo số tiền chi trả cho đại lý; thông báo đại lý khi đổi gói／hủy (REQ-AG-046・047); email yêu cầu lập hóa đơn — quyết khi báo giá [§7].
- U6: Tự nhận biết kênh giới thiệu từ HubSpot (REQ-AG-033) — tạm, giai đoạn 2 [§7].
- U7: Giảm giá đại lý `DC000001` (5%・tối đa ¥5,000) là [tạm] [§7].

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Mẫu phí nào (A/B/C/D) bị ảnh hưởng? Có đúng chỉ 4 mẫu, không thêm mẫu mới [§1 1-2]?
2. Phép tính có lấy đúng "số tiền cơ sở" (cố định, chưa thuế, sau giảm giá; loại trả sau và thời gian dùng thử) [§2 2-1]?
3. Có xử lý cho phép chỉnh tay số tiền và trường hợp shot／liên tục [§2 2-2, 2-3]?
4. Với mẫu C: đã mô tả đúng quy tắc đếm/reset 36 tháng khi cơ sở đầu hủy hoặc mất hết cơ sở [§3]?
5. Đổi gói / thêm cơ sở / hủy: có bị tính lại hay quyết toán chênh lệch (cấm) không; dữ liệu hàng tháng tạo mới thay vì ghi đè [§4]? Điều kiện phát sinh thanh toán khi thêm cơ sở chưa chốt — hỏi PM (U4).
6. Gắn đại lý đang theo doanh nghiệp, không theo cơ sở; ngoại lệ "Không áp dụng" [§1 1-3, 1-4].
7. Nếu tính năng chạm số tiền mẫu B, thời điểm thanh toán, thông báo/CSV/hóa đơn, HubSpot, `DC000001`: các điểm này còn mở — không tự điền, hỏi khách (U1–U7).
8. Giảm giá có dùng master giảm giá (mã giảm giá) thay vì ghi cứng không [§2 2-4]?
