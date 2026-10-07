# Đại lý & Giới thiệu (phí giới thiệu · master đại lý · thanh toán)

> **Nguồn chính thức của chủ đề này.** Ngày 2026-10-05, chỉ tổng hợp lại và viết mới những nội dung "đang có hiệu lực" từ tài liệu gốc và các quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (B "Số tiền cơ sở của phí đại lý" v.v.). Nếu có mâu thuẫn thì sổ quyết định là chuẩn.
> Tài liệu gốc (đã đóng băng, chỉ để xem lại quá trình): `docs/議事録_仕様/代理店紹介_詳細要件仕様.md` (REQ-AG).
> Master giảm giá (giảm giá đại lý, v.v.) xem `40_Master_Phí_Thanh_toán/Tùy_chọn_và_Giảm_giá_Định_nghĩa_20261003.md`, mã đại lý trong form đăng ký xem `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Form_đăng_ký.md`.

## 1. Cơ bản

| # | Quy định | Căn cứ |
|---|---|---|
| 1-1 | Với khách hàng ký hợp đồng thông qua giới thiệu, trả **phí giới thiệu** cho người giới thiệu (hoặc áp dụng giảm giá). Việc cài đặt do **Vận hành** thực hiện (không phải do doanh nghiệp yêu cầu) | REQ-AG §1 |
| 1-2 | Có 4 loại giới thiệu: **giới thiệu doanh nghiệp · giới thiệu đại lý · giới thiệu đối tác · giới thiệu đại lý đặc biệt**. Mẫu phí của đại lý **chỉ có 4 loại A／B／C／D**, được chọn ở màn hình chi tiết đại lý | REQ-AG-001 |
| 1-3 | Việc gắn đại lý theo **đơn vị doanh nghiệp (1 doanh nghiệp = 1 đại lý)**. Không thể gắn đại lý khác nhau cho từng cơ sở | REQ-AG-021 |
| 1-4 | Khi thêm cơ sở, hiển thị đại lý của doanh nghiệp đó làm giá trị mặc định. Có thể đổi sang "Không áp dụng" (ô lý do là tùy chọn) | REQ-AG-022 |

## 2. Số tiền · tỷ lệ phí

| Loại | Phí | Cách tính · thời hạn | Căn cứ |
|---|---|---|---|
| Giới thiệu doanh nghiệp (mẫu A) | **33,000 yên (đã gồm thuế)**・1 lần | Khi ký kết thành công. Cùng một doanh nghiệp thì dù có bao nhiêu cơ sở cũng chỉ 1 lần | REQ-AG-006 (hong trả lời 2026/09/30・K-01) |
| Giới thiệu đại lý (mẫu B) | 1 lần. Số tiền theo số lượng cung cấp hàng tháng [tạm]: đến 50 ¥22,000／đến 100 ¥33,000／trên đó ¥55,000 | Khi ký kết thành công. Tùy theo số cơ sở | Sổ quyết định L (số tiền cần xác nhận với khách hàng・`_OPEN一覧` 1005-05) |
| Giới thiệu đối tác (mẫu C) | **10%** số tiền cơ sở | **Tối đa 36 tháng** | REQ-AG-006 |
| Giới thiệu đại lý đặc biệt (mẫu D) | **7%** số tiền cơ sở | Trong suốt thời gian còn tiếp tục | REQ-AG-006 |

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | **Số tiền cơ sở = chỉ là số tiền cố định chưa thuế, sau giảm giá (trả trước).** Không tính phần quyết toán theo thực tế (trả sau). **Khoản thanh toán trong thời gian dùng thử không thuộc đối tượng** | Sổ quyết định B "Số tiền cơ sở của phí đại lý" |
| 2-2 | Số tiền được tính tự động, sau đó **có thể chỉnh sửa thủ công** (do điều chỉnh giá, trường hợp ngoại lệ). Số tiền giảm giá của giới thiệu doanh nghiệp cũng là ô có thể nhập | REQ-AG-002・004 |
| 2-3 | Hình thức thanh toán "**một lần (shot)／liên tục**" được cài đặt cho từng đại lý・từng hợp đồng | REQ-AG-005 |
| 2-4 | Giảm giá không ghi cứng trong code mà được giữ bằng **master giảm giá (mã giảm giá)**. Trong điều kiện cơ sở được áp dụng có "mã đại lý đối tượng" | REQ-AG-003, 28-60 |

## 3. Cách đếm 36 tháng (loại phí liên tục)

| # | Quy định | Căn cứ |
|---|---|---|
| 3-1 | Đếm **từ lúc bắt đầu hợp đồng của cơ sở đầu tiên** | REQ-AG-011 |
| 3-2 | Dù cơ sở đầu tiên bị hủy giữa chừng, nếu các cơ sở khác vẫn còn tiếp tục thì thời hạn giữ nguyên | REQ-AG-012 |
| 3-3 | **Reset khi tất cả cơ sở** của doanh nghiệp đó đã mất | REQ-AG-013 |

## 4. Khi gói thay đổi

- Dùng nguyên gói tại thời điểm giới thiệu. **Dù gói thay đổi giữa chừng cũng không tính lại, không quyết toán chênh lệch** (REQ-AG-023).
- Không ghi đè dữ liệu hợp đồng mà tạo dữ liệu mới theo từng tháng (có thể xem ngược lại về trước) (REQ-AG-044).

## 5. Mã đại lý (đăng ký)

| # | Quy định | Căn cứ |
|---|---|---|
| 5-1 | Form đăng ký có **ô mã đại lý (tùy chọn)**. Nếu để trống là "không có giới thiệu". Form dùng cho giới thiệu và form thông thường là một | REQ-AG-031 |
| 5-2 | Không dùng tự khai "Bạn biết đến ở đâu". Xác định người giới thiệu bằng **mã đại lý + Vận hành xác nhận (tiếp nhận)** | REQ-AG-032 |

## 6. Màn hình của Vận hành

| Màn hình | Nội dung | Căn cứ |
|---|---|---|
| Master đại lý | Thông tin đại lý・mẫu phí・gói giới thiệu・tỷ lệ／số tiền・người phụ trách chính・danh sách cơ sở đang có hiệu lực・danh sách lịch thanh toán | REQ-AG-041 |
| Danh sách giới thiệu | Người giới thiệu・người được giới thiệu・gói・course・số tiền thanh toán・số tiền chi trả・ngày dự kiến kết thúc・số tiền chi trả theo từng tháng. Xuất CSV | REQ-AG-042 |
| Quản lý thanh toán | Dữ liệu theo từng đại lý・từng tháng. "Chưa xác nhận／Đã xác nhận". Có thể sửa trạng thái thanh toán và ngày thanh toán từ danh sách | REQ-AG-043・045 |

## 7. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U1 | **Hình thức cuối cùng của phương thức tính**: ngày 2026/01/16 được giải thích là "tỷ lệ (%)", ngày 2026/06/16 là "giảm giá theo gói + mã giảm giá". Số tiền・tỷ lệ (33,000 yên・10%・7%) và số tiền cơ sở đã được quyết định, nhưng chưa rõ sẽ dùng "giảm giá theo gói" đến mức nào | Xác nhận với khách hàng (giám đốc・anh Aoyama) |
| U2 | Số tiền của mẫu B (giới thiệu đại lý) (hiện là [tạm]). Đối ứng của các mẫu: A = doanh nghiệp・B = đại lý・C = đối tác・D = đại lý đặc biệt (hong 2026-10-05) | Xác nhận với khách hàng (`_OPEN一覧` 1005-05) |
| U3 | Thời điểm thanh toán (đã quyết định không đưa phần trả sau vào số tiền cơ sở. Chưa định khi nào trả) | Xác nhận với khách hàng |
| U4 | Điều kiện phát sinh thanh toán khi thêm cơ sở | Xác nhận với khách hàng |
| U5 | Thông báo số tiền chi trả cho đại lý bằng CSV・thông báo cho đại lý khi đổi gói／hủy (REQ-AG-046・047)・email yêu cầu lập hóa đơn cho đại lý (dòng 117 của bảng yêu cầu) | Chưa quyết (quyết định khi báo giá) |
| U6 | Tự động nhận biết kênh giới thiệu từ việc ký kết thành công trên HubSpot và thông báo (REQ-AG-033) | Tạm thời. Phạm vi giai đoạn 2 chưa định |
| U7 | Giảm giá đại lý DC000001 (5%・tối đa ¥5,000) là [tạm] | Xác nhận với khách hàng |
