> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định · Đề xuất: Phần còn lại của Phase2 bảng yêu cầu (2026/10/02)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Đối tượng: các dòng Close = False của sheet Phase2 trong `00_確認してほしい/お客様資料/新ESS_要件シート.xlsx`.
> Sao lưu trước khi phản ánh: `01_仕様/履歴_20261002_要件シート残り回答前/`. Bản thân bảng yêu cầu chưa được ghi đè.

## 1. Quyết định (2026/10/02 anh Long)

| Dòng | Vấn đề | Quyết định | Phản ánh |
|---|---|---|---|
| 157 | Thay đổi chế độ khách có cần vận hành phê duyệt không (RS-06 · D5 · E-2 · S7-27) | **Không cần phê duyệt. Phản ánh ngay từ Web doanh nghiệp (tài khoản doanh nghiệp · cơ sở), thông báo cho vận hành** | Đặc tả màn hình Web doanh nghiệp_Quản lý cơ sở §1 · §9 · OPEN6 / Danh sách hạng mục (dòng chế độ khách · bảng OPEN). Demo chưa phản ánh (hiện có dấu "cần phê duyệt") |
| 77 | Đăng ký máy bán hàng tự động (sheet ghi "Từ chối · ngoài hệ thống") | **Giữ nguyên đặc tả hiện tại** (tiếp nhận ở form đăng ký, báo giá riêng) | Không thay đổi đặc tả. Sửa câu trả lời của sheet |
| 13 | Thay đổi đặt hàng (muốn sửa cả sau khi phê duyệt) | **Giải thích với anh Aoyama theo hướng đặc tả hiện tại** (sửa được đến khi nhà cung cấp phê duyệt đặt hàng chính thức. Sau phê duyệt thì đặt hàng bổ sung / hủy rồi đặt lại, cả hai đều lưu lịch sử) | Đã sửa mô tả cũ ở Đặc tả đặt hàng §Tổng quan (sửa được cả sau phê duyệt) cho khớp REQ-PO-304 |
| 127 · 134 | Email về hoàn tất xuất hàng · đổi ngày sau hạn chốt | **Gửi** (đã quyết định ở P11 2026/10/01 · sheet cũng đã cập nhật) | Xong |

### Lý do đưa dòng 13 theo đặc tả hiện tại (dành cho anh Aoyama)
1. Câu trả lời của anh Aoyama là "Nếu lưu được lịch sử thay đổi đặt hàng thì hình thức nào cũng được". Với đặc tả hiện tại, sửa · đặt bổ sung · hủy đều lưu lịch sử thay đổi kèm số lượng. Vấn đề khó khăn (hủy thì không biết giảm bao nhiêu cái) được giải quyết.
2. Đặt hàng tạm chưa phê duyệt nên sửa bao nhiêu lần cũng được. Chỉ không sửa được "đặt hàng chính thức sau khi nhà cung cấp đã cam kết số lượng và ngày giao".
3. Nếu sau phê duyệt vận hành ghi đè con số thì sẽ xảy ra sự cố nhà cung cấp làm · xuất hàng theo con số cũ (cùng loại sự cố muốn ngăn bằng cảnh báo bỏ sót đơn). Thay đổi nhất định lọt vào mắt nhà cung cấp dưới dạng "đơn đặt hàng mới (bổ sung)" hoặc "hủy".
4. Tiêu chuẩn của xác nhận nhập kho của kho (đối chiếu số thùng) và đối chiếu thanh toán (số tiền đặt hàng) không bị thay đổi giữa chừng.
5. Không cần phê duyệt lại · thiết lập "sửa được đến khi nào" nên lượng cần làm · kiểm thử ít.
- Nhược điểm: khi giảm thì tốn 2 bước "hủy → đặt lại".

## 2. Trả lời (tài liệu để phán đoán)

- **Dòng 44 Túi giữ lạnh** (đã quyết định ở sổ cái với STEP4 D3-5 = B): yêu cầu của bảng yêu cầu chỉ là "Master đơn vị giao hàng ủy thác giữ số túi giữ lạnh · số gói giữ lạnh". Việc làm sổ cái (bản ghi cho mượn + danh sách xuyên suốt + CSV) ở STEP4 ngày 10/01 là phần làm thêm. Nếu không muốn quản lý thì quay lại **chỉ có ô số ở Master đơn vị giao hàng ủy thác (nhiều số thì ghi gộp) + nhập CSV** vẫn đáp ứng yêu cầu. → Chờ trả lời chọn cái nào.
- **Dòng 75 Quyền**: cơ chế lắp ráp quyền chi tiết theo từng doanh nghiệp (thiết kế vai trò) là nặng đối với giai đoạn 2. Thay vào đó, chỉ cần thêm **một thiết lập theo từng doanh nghiệp "Cho phép tài khoản cơ sở gửi đơn đăng ký thay đổi (ON/OFF · mặc định ON)"** là có thể tạo dạng chỉ trụ sở chính mới đưa ra được thay đổi gói · hủy hợp đồng, v.v. (cơ sở chỉ đặt hàng · vật tư · kiểm tra tồn kho · xác nhận giao hàng). Thiết lập thanh toán thì cả hai đã là chỉ tham chiếu. → Chờ trả lời có đưa 1 hạng mục này vào giai đoạn 2 không.
- **Dòng 136 "Ngày 5" của hủy hợp đồng** (đã trả lời ở STEP4 A6 "máy bán hàng tự động cũng là ngày 15 tháng trước"): trong biên bản họp · bảng yêu cầu không có ghi chép lý do (chỉ được giải thích là "vận hành hiện tại" vào 08/26). Đặc tả hiện tại (D4 = A · K-05) xác định theo hạn chốt đặt hàng (mặc định ngày 15 tháng trước) nên có lợi cho khách hàng hơn ngày 5. **Nếu điều khoản sử dụng · hợp đồng ghi "ngày 5 tháng trước" "máy bán hàng tự động là ngày 5 của 3 tháng trước" thì phải chỉnh điều khoản hoặc đặc tả cho khớp.** → Hỏi anh Aoyama về nguồn gốc (điều khoản hay là dư địa trong vận hành).

## 3. Các dòng chưa có kết luận (đính chính 2026/10/02)

> §3 của bản đầu đã bỏ sót các quyết định của STEP4 (trả lời xác nhận khách hàng A1~D5) · STEP5 · STEP6 · STEP7. Các dòng 27 · 30 · 38 · 40 · 42 · 51 · 63 · 120 · 122 · 130 · 136 · 172 · 179 · 183 · 184 · 185, v.v. đã được quyết định vào 10/01. Trạng thái của toàn bộ 186 mục lấy `03_Excel/新ESS_要件シート_Phase2_全項目の状態_20261002.xlsx` (đã phản ánh đến STEP1~7 · demo v1.70) làm chuẩn.

Những mục chưa quyết còn lại (10 mục) và đề xuất:

| Dòng | Nội dung | Đề xuất |
|---|---|---|
| 25 | Cảnh báo cập nhật tiêu chuẩn kỹ thuật | P2 giữ tiêu chuẩn kỹ thuật · ngày cập nhật kế tiếp ở Master sản phẩm và chỉ thông báo cho vận hành. Email · tải lên cho nhà cung cấp là P3 |
| 47 | Sổ tay thao tác (STEP4 B4 = tổng hợp ở cuối) | Sổ tay chung là "Sổ tay" của tài xế · đơn vị ủy thác, lộ trình mang vào theo từng cơ sở do vận hành tải lên · đơn vị ủy thác và tài xế chỉ xem |
| 65 | Tên doanh nghiệp và tên cơ sở | Lịch giao hàng · danh sách là tên cơ sở, chi tiết thì cả hai (phương án trả lời 9/30) |
| 73 | Liên kết đến trang trợ giúp | Liên kết "Trợ giúp" ở header của từng app (URL là thiết lập) |
| 75 | Quyền của tài khoản cơ sở | Thiết lập theo từng doanh nghiệp "Cho phép tài khoản cơ sở gửi đơn đăng ký thay đổi (ON/OFF)" |
| 98 | Ngày đến sớm nhất của hàng mẫu | Tỉnh/thành → lead time để làm ước tính. Ngày chính xác tùy thuộc Yamato |
| 117 | Email yêu cầu tạo hóa đơn cho đại lý | Phán đoán bằng báo giá (X14) |
| 137 | CSV người phụ trách | Thêm CSV người phụ trách doanh nghiệp · người phụ trách cơ sở |
| 147 | Tháng sử dụng trên hóa đơn | Ghi tháng chu kỳ đối tượng vào chi tiết (quyết định mối quan hệ với cách ghi bỏ "~ phần" của STEP2 Q7) |
| 149 | Ghi chú in trên hóa đơn | DIPRO xác nhận Bill One API có hạng mục ghi chú không |

## 4. Việc cần làm tiếp theo
- Xác nhận với anh Aoyama: dòng 13 (lý do ở §1), dòng 44 · 75 · 136 (§2), cột còn thiếu của dòng 42, phạm vi "P2" của §3.
- Sau khi quyết định, cập nhật cột trả lời DIPRO · Close của bảng yêu cầu (sau khi anh Long đồng ý).
- Demo: dòng 157 (đổi chế độ khách thành phản ánh ngay).
