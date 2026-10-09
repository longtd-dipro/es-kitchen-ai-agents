> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định bổ sung v2.3: Tùy chọn của form đăng ký, số lần giao hàng và Master gói (2026/09/29)

> Đối tượng: form đăng ký của doanh nghiệp (`02_デモ/21_法人_申込フォーム.html` / sinh ra từ `項目一覧_生成スクリプト/apply_form/`) và demo quản lý cơ sở nhúng form đó (`部品/22_法人_拠点管理.html`).
> Bản cũ: `99_過去/申込オプションと配送回数_前_20260929/`

## Những điều đã quyết định (hong trả lời)

| # | Vấn đề | Quyết định |
|---|---|---|
| 1 | "Tùy chọn khác" của form đăng ký | **Chỉ hiển thị những mục trong Master Tùy chọn có "Hiển thị ở đăng ký Web doanh nghiệp" và "Đang sử dụng".** Tên · số tiền · loại phí (hàng tháng / một lần) theo master. Không viết trực tiếp danh sách vào form |
| 2 | Số lần giao hàng của đăng ký mới | **Khách hàng có thể chọn.** Tiêu chuẩn gói / +1 lần / +2 lần. Phần vượt tiêu chuẩn được đưa vào báo giá dưới dạng thêm số lần giao hàng (OP000001 · hàng tháng ¥3,000 mỗi lần). Số lần đã chọn là giá trị ban đầu của số lần giao hàng khi tiếp nhận (như 28-85) |
| 3 | Hạng mục thêm vào Master gói | **Thêm "Số người sử dụng dự kiến (để hiển thị)" và "Số lần giao hàng tiêu chuẩn (tháng)".** Số người sử dụng dự kiến là giá trị hiển thị dùng trong báo giá đăng ký và buổi gặp mặt (không dùng để tính thanh toán). Số lần giao hàng tiêu chuẩn dùng để xác định thêm số lần giao hàng |
| 4 | Hạng mục thêm vào đăng ký | **Hỏi "Chu kỳ thanh toán" của doanh nghiệp (trả hàng tháng / trả hàng năm · mặc định trả hàng tháng) và "Thời điểm phát hành hóa đơn" (thời gian chờ phát hành hóa đơn: 1 tháng trước tháng sử dụng [tiêu chuẩn] / 2 tháng trước / 3 tháng trước / tháng hiện tại / tháng sau [trả sau]) ở đăng ký mới.** Mặc định là trả trước. Cả hai sau khi đăng ký thì doanh nghiệp chỉ được tham chiếu. Với cơ sở "nơi nhận hóa đơn = cơ sở này" thì hỏi cả chu kỳ thanh toán của cơ sở đó (thời điểm phát hành giống doanh nghiệp). Các ứng viên khác (chế độ khách, hạn mức, người phụ trách thanh toán) có thể sửa sau ở quản lý cơ sở nên không thêm. Số tiền doanh nghiệp chịu do vận hành hỏi khi tiếp nhận (2026/09/29 hong) |
| 5 | Giá trị số lần giao hàng tiêu chuẩn | **Khác nhau theo gói** (2026/09/29 hong). Giữ trong Master gói theo từng gói. Giá trị cần xác nhận |

## Nội dung

### 1. Danh sách tùy chọn được tạo từ master

- `apply_form/opt_master.py` đọc `master_rows.py` (các dòng demo của Master Tùy chọn), `build.py` (demo độc lập) và `corp_branch/form_patch.py` (demo quản lý cơ sở) đưa vào màn hình. Sửa master rồi build lại thì form đăng ký cũng thay đổi.
- Đối tượng hiện tại (thứ tự hiển thị): Phí sử dụng ES-QR (OP000002 · hàng tháng ¥1,000) / Bổ sung vật tư định kỳ (OP000013 · hàng tháng ¥1,500) / Dịch vụ chỉ định khung giờ giao hàng (OP000014 · hàng tháng ¥2,000) / Thay đổi lớp phủ máy bán hàng tự động (OP000017 · một lần · báo giá riêng. Chỉ khi là máy bán hàng tự động).
- Khác biệt với form trước: "Dịch vụ cung cấp báo cáo vận hành hàng tháng ¥1,000" trong master là OP000011 (¥5,000) và đã "Kết thúc" nên không hiển thị. Thay đổi lớp phủ máy bán hàng tự động hiển thị như phí một lần, không tính vào tổng hàng tháng. ES-QR là mục hiển thị mới.
- Phí sử dụng ES-QR là loại A (hạng mục hợp đồng liên động = ES-QR). Khi chọn ở đăng ký thì có nghĩa đặt "ES-QR" của cơ sở thành "Sử dụng", phí phát sinh theo liên động (không đưa vào bảng biến động).
- Vì master không có hạng mục cho việc có phải chuyên dụng cho máy bán hàng tự động hay không, hiện đang xác định theo "tên chứa từ máy bán hàng tự động" (xem Cần xác nhận bên dưới).

### 2. Số lần giao hàng

- Mới (triển khai chính thức): chọn "Số lần giao hàng (tháng)" bằng pulldown. Giá trị ban đầu là tiêu chuẩn gói. Trong báo giá hiển thị "Thêm số lần giao hàng × n lần (tiêu chuẩn 2 lần → 3 lần)" và phí hàng tháng, số lần giao hàng cũng hiển thị trong tổng quan gói. Dùng thử không thể thay đổi (cố định theo tiêu chuẩn gói).
- Đăng ký thay đổi (thay đổi giao hàng) · tiếp tục: đã điều chỉnh các lựa chọn theo tiêu chuẩn gói 2 lần ("Giảm xuống 1 lần / 2 lần (tiêu chuẩn gói) / Tăng lên 3 lần (+¥3,000 / tháng) / Tăng lên 4 lần (+¥6,000 / tháng)"). Trước đây là "1 lần (tiêu chuẩn gói)" mâu thuẫn với "2 lần (tiêu chuẩn gói)" của cơ sở hiện có.
- Thứ trong tuần / tuần giao hàng (mẫu giao hàng · chu kỳ giao hàng) vẫn như cũ, khách hàng không chọn (28-77 · 28-78).

### 3. Hạng mục thêm vào Master gói

| Hạng mục | Kiểu đề xuất | Bắt buộc | Nội dung |
|---|---|---|---|
| Số người sử dụng dự kiến (để hiển thị) | varchar(20) | △ | Ví dụ: 7 người / 14 người / 21 người. Dùng cho tổng quan gói của form đăng ký doanh nghiệp và buổi gặp mặt. Không dùng cho thanh toán · phán định |
| Số lần giao hàng tiêu chuẩn (tháng) | smallint | ○ | Số lần giao hàng trong tháng nằm trong gói này. Phần tổng số lần giao hàng trong thiết lập tuyến giao hàng vượt quá số này sẽ tự động phát sinh thêm số lần giao hàng (OP000001) ở ① của hợp đồng con (28-85) **【Bổ sung 2026/09/29】Giữ theo từng nhiệt độ (lạnh · nhiệt độ thường / đông lạnh) → `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` 28-154** |

Giá trị demo là tạm: số người sử dụng dự kiến gói 50 = 7 người · 100 = 14 người · 150 = 21 người, số lần giao hàng tiêu chuẩn là 2 lần/tháng cho mọi gói (giống giá trị tạm của 28-85).

## Cần xác nhận

1. **Giá trị số lần giao hàng tiêu chuẩn (theo từng gói).** Đã quyết định là khác nhau theo gói (#5). Demo vẫn để tất cả gói 2 lần/tháng (tạm). Nếu được cung cấp giá trị theo từng gói thì sẽ đưa vào.
2. **Giá trị thực của số người sử dụng dự kiến.** 7 người / 14 người / 21 người vẫn là giá trị của demo form đăng ký.
3. **Cách nhận biết tùy chọn chỉ dành cho máy bán hàng tự động.** Muốn chỉ hiển thị Thay đổi lớp phủ máy bán hàng tự động cho cơ sở đã chọn máy bán hàng tự động. Master Tùy chọn không có hạng mục thể hiện "hiển thị cho cơ sở loại thiết bị nào" nên hiện đang xác định theo việc tên có chứa "máy bán hàng tự động" hay không. Nếu đổi tên thì sẽ hiển thị cả cho cơ sở tủ lạnh. Đề xuất: thêm vào Master Tùy chọn "Loại thiết bị hiển thị ở đăng ký (cả hai / chỉ tủ lạnh · tủ đông / chỉ máy bán hàng tự động)".
4. ~~Hạng mục thêm vào đăng ký~~ → Quyết định #4. Để tham khảo, giữ lại bảng cho thấy các ứng viên có hiển thị với doanh nghiệp hay không.

| Hạng mục | Doanh nghiệp có thấy không (danh sách hạng mục) | Sau này doanh nghiệp có sửa được không |
|---|---|---|
| Chu kỳ thanh toán (trả hàng tháng / hàng năm) | Thấy (chỉ tham chiếu) | Không sửa được. Nếu không hỏi ở đăng ký thì khách hàng không có cơ hội chọn |
| ES-QR | Thấy | Sửa được (vận hành phê duyệt). **Lần này đã có thể chọn từ danh sách tùy chọn** |
| Chế độ khách | Thấy | Sửa được (vận hành phê duyệt) |
| Hạn mức số lần 1 ngày · Hạn mức số tiền 1 tháng (mỗi người) | Thấy | Sửa được (phản ánh ngay) |
| Người phụ trách thanh toán của cơ sở | Thấy | Sửa được (phản ánh ngay · thông báo) |
| Số tiền doanh nghiệp chịu (mỗi bữa) | Không thấy | Không sửa được (chỉ vận hành) |
| Thứ mong muốn giao hàng | Không có hạng mục (chu kỳ giao hàng chỉ tham chiếu) | — Đã bỏ khỏi đăng ký ở 28-78 nên không thêm. Nguyện vọng được tiếp nhận ở ghi chú giao hàng |
