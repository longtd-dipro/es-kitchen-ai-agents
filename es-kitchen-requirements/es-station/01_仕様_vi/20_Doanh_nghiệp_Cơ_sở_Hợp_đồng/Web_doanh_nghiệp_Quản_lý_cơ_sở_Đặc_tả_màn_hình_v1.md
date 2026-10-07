# Đặc tả màn hình Web Doanh nghiệp: Quản lý cơ sở (cơ sở・hợp đồng・biểu mẫu đăng ký) v1.9

> Tạo ngày 2026/09/29 (v1.1: chỉnh lại theo định nghĩa xem được・sửa được của ENTITY／v1.2: đưa vào biểu mẫu đăng ký mới・thay đổi／v1.3: phản ánh các mục cần xác nhận 1〜7・bổ sung thông tin doanh nghiệp／v1.4: tài khoản dùng chung và cách chọn người yêu cầu／v1.5: chi tiết hóa đơn／v1.6: kiểm tra tồn kho・yêu cầu thay đổi thông tin doanh nghiệp・chi tiết hóa đơn theo thuế suất (so sánh demo vận hành và doanh nghiệp ngày 2026/09/30)／v1.7: ES-QR chỉ hiển thị・lắp đặt hộ qua yêu cầu thay đổi・hiển thị số năm hợp đồng cần xác nhận (trả lời bảng yêu cầu ngày 2026/09/30 dòng 107・156・157)／v1.8: trả lời STEP2 (2026/10/01) = thiết lập sử dụng app thuộc hợp đồng con・tên doanh nghiệp v.v. phản ánh ngay + thông báo・hóa đơn phát hành cuối tháng・trạng thái thanh toán 3 mức・tháng thanh toán (trả trước)・thời gian sử dụng tối thiểu tủ lạnh 3 / máy bán hàng tự động 12 tháng・hiển thị tháng bắt đầu hợp đồng ban đầu và tháng tiếp tục・thêm/xóa người phụ trách của doanh nghiệp／v1.9: tài khoản doanh nghiệp／tài khoản cơ sở H1〜H5 (2026/10/01) = trang chủ của doanh nghiệp là toàn bộ cơ sở・yêu cầu do tài khoản doanh nghiệp gửi thì tài khoản cơ sở không rút lại được・cơ sở do tài khoản cơ sở thêm thì tài khoản đã thêm không nhìn thấy・hiển thị mã dòng máy)　Demo: `02_デモ/部品/22_法人_拠点管理.html` (bản tổng hợp Web Doanh nghiệp là `02_デモ/20_法人_まとめ.html`) (sinh bởi: `項目一覧_生成スクリプト/corp_branch/`)
> Dữ liệu gốc: Công ty cổ phần Sample (株式会社サンプル) trong demo vận hành `10_運営_まとめ.html`. Chỉ hiển thị các mục có "hiển thị cho doanh nghiệp" là ○ trong danh sách mục (`items.py`).
> Giao diện: ES Kitchen (theme company-admin). Các thành phần chỉ gồm AppShell／Breadcrumb／Button／Badge／Card＋SectionTitle／Tabs／SearchPanel／Table／Pagination／InlineMessage／Dialog／Modal／FileCard／EmptyState／Toast.

## 1. Cách tiếp cận (thay đổi ở v1.1)

- **Các mục hiển thị・mục sửa được theo đúng ENTITY (cột "Web Doanh nghiệp hiển thị" của `12_運営_法人拠点契約.html`／"hiển thị cho doanh nghiệp", "yêu cầu thay đổi", "vận hành phê duyệt", "thông báo" của `items.py`).** Bản v1 để toàn bộ ở dạng chỉ xem + biểu mẫu đăng ký nhưng khác với ENTITY nên đã sửa lại (2026/09/29 hong trả lời "theo ENTITY" "thêm tất cả").
- **Thông tin cơ sở được chỉnh sửa tại chỗ.** "Chỉnh sửa" ở chi tiết cơ sở → chỉnh sửa cơ sở (Hủy・Lưu). Theo mẫu CRUD của DS, chỉ vận hành mới xóa được nên không hiển thị nút xóa. Biểu tượng bút chì ở danh sách cũng mở màn hình chỉnh sửa.
  - Các ô có phê duyệt vận hành "bắt buộc" (tên cơ sở・furigana・địa chỉ・số điện thoại・nơi thanh toán・ngày không giao hàng của hợp đồng con・ngày mong muốn của thiết bị) có dấu "cần phê duyệt". Khi lưu sẽ thành **chờ phê duyệt** (CH-…), được phản ánh sau khi phê duyệt. (Thay đổi 2026/09/30. Trước đây: tên cơ sở・furigana・chế độ khách・ES-QR・địa chỉ・số điện thoại・nơi thanh toán・ngày không giao hàng của hợp đồng con・ngày mong muốn của thiết bị [bảng yêu cầu dòng 157・trả lời quyết định_phản ánh một phần bảng yêu cầu_20260930])
  - **ES-QR trên Web Doanh nghiệp chỉ hiển thị (không thể thay đổi・không thể yêu cầu thay đổi).** Thiết lập sử dụng ES-QR là tùy chọn nên chỉ vận hành mới thay đổi được (bổ sung 2026/09/30 [bảng yêu cầu dòng 157]).
  - **Chế độ khách・giới hạn số lượng mỗi ngày・giới hạn số tiền mỗi tháng có thể thay đổi từ Web Doanh nghiệp.** Chế độ khách **được phản ánh ngay không cần vận hành phê duyệt, và thông báo cho vận hành** (quyết định 2026/10/02: không cần phê duyệt・phản ánh ngay + thông báo cho vận hành [bảng yêu cầu dòng 157]).
  - Các ô phê duyệt "không cần" (số nhân viên・ghi chú・giới hạn số lượng mỗi ngày・giới hạn số tiền mỗi tháng・số FAX・người phụ trách・tài liệu・ghi chú giao hàng) **được phản ánh ngay khi lưu**. Thay đổi người phụ trách sẽ thông báo cho vận hành.
  - **Thiết lập sử dụng app (giới hạn số lượng mỗi ngày・giới hạn số tiền mỗi tháng・chế độ khách) thuộc về hợp đồng con.** Khi sửa bằng "Chỉnh sửa" của cơ sở, có hiệu lực với tất cả hợp đồng con từ chu kỳ hiện tại (chu kỳ chứa ngày hôm nay) trở đi (2026/10/01 STEP2 Q2).
  - Hộp thoại xác nhận khi lưu, hiển thị phân biệt "phản ánh ngay／phản ánh sau khi phê duyệt". Với hợp đồng con, khi lưu chọn "chỉ chu kỳ này／tất cả từ đây trở đi".
  - Nếu rời đi khi còn thay đổi chưa lưu (Hủy・breadcrumb・menu bên) sẽ có xác nhận hủy bỏ (ConfirmDiscard).
  - Trong lúc chờ phê duyệt, các ô cần phê duyệt và đăng ký mới sẽ bị khóa (theo quy tắc không yêu cầu trùng cho cùng một cơ sở). Có thể rút lại.
  - **Chỉ tài khoản đã gửi yêu cầu và tài khoản doanh nghiệp mới rút lại được (v1.9・H2).** Khi tài khoản cơ sở mở yêu cầu do tài khoản doanh nghiệp gửi, không hiển thị liên kết "Rút lại" ở dải thông báo chi tiết cơ sở và nút "Rút lại" ở chi tiết yêu cầu, mà hiển thị "Đây là yêu cầu do tài khoản doanh nghiệp gửi nên việc rút lại được thực hiện từ tài khoản doanh nghiệp".
- **Các thủ tục hợp đồng (gói・loại giao hàng và số lần・thiết bị・tạm ngưng・mở lại・hủy) qua "Yêu cầu thay đổi" → biểu mẫu đăng ký.** Chỉ hiển thị các thủ tục chọn được tại cơ sở đó.
  - Trong thủ tục thiết bị, doanh nghiệp có thể chọn **lắp đặt hộ tủ lạnh (`OP000007`・phí một lần)**. Khi được phê duyệt, sẽ xuất hiện ở mục ① của hợp đồng con dưới dạng dòng phí một lần và được ghi trong chi tiết thanh toán (bổ sung 2026/09/30 [bảng yêu cầu dòng 156・trả lời quyết định_phản ánh một phần bảng yêu cầu_20260930]).
- Phạm vi nhìn thấy theo quyết định v2.3 #55: tài khoản doanh nghiệp = tất cả cơ sở của công ty mình／tài khoản cơ sở = chỉ cơ sở đó.
- **Đăng nhập không theo từng người phụ trách mà dùng tài khoản dùng chung (v1.4).** Doanh nghiệp dùng tài khoản doanh nghiệp theo ID doanh nghiệp (ví dụ: cu00001), cơ sở dùng một tài khoản cơ sở cho mỗi cơ sở (ví dụ: cu00643), được các người phụ trách cùng sử dụng.

## 1-2. Cách lưu lại người yêu cầu (ai đã gửi) (v1.4)

Vì là tài khoản dùng chung nên chỉ từ tài khoản thì không biết là ai. **Khi gửi・lưu, yêu cầu chọn bằng radio button "Người đăng ký" (khi lưu chỉnh sửa là "Người thay đổi") trong bảng người phụ trách.** (2026/09/29 hong "radio button người đăng ký trong thông tin người phụ trách của doanh nghiệp". Các cột của bảng: Người đăng ký [radio]・Đơn vị・Phân loại・Tên người phụ trách・Địa chỉ email. Bấm vào bất kỳ chỗ nào của dòng đều chọn được)

| Tình huống | Ô | Người có thể chọn |
|---|---|---|
| Đăng ký thay đổi (màn hình xác nhận) | Bảng "Người phụ trách (chọn người đăng ký)" (bắt buộc) | Tài khoản doanh nghiệp = người phụ trách của doanh nghiệp + người phụ trách của cơ sở đã chọn làm đối tượng／tài khoản cơ sở = người phụ trách của cơ sở đó |
| Thêm cơ sở (màn hình xác nhận) | Cột "Người đăng ký" trong bảng người phụ trách của "Thông tin doanh nghiệp・người phụ trách" (bắt buộc) | Tài khoản doanh nghiệp = người phụ trách của doanh nghiệp／tài khoản cơ sở = người phụ trách của cơ sở đó |
| Hộp thoại lưu của chỉnh sửa cơ sở・chỉnh sửa hợp đồng con | Bảng "Người phụ trách (chọn người thay đổi)" (bắt buộc) | Tài khoản doanh nghiệp = người phụ trách của doanh nghiệp + người phụ trách của cơ sở đó／tài khoản cơ sở = người phụ trách của cơ sở đó |
| Hộp thoại lưu của chỉnh sửa thông tin doanh nghiệp | Bảng "Người phụ trách (chọn người thay đổi)" (bắt buộc) | Người phụ trách của doanh nghiệp |

- Nội dung lưu lại: tài khoản nào đã gửi・người phụ trách đã chọn・họ tên tại thời điểm đó (`application.account_id / applicant_contact_id / applicant_name`).
- Hiển thị: ở danh sách yêu cầu・lịch sử yêu cầu・thông báo chờ phê duyệt hiển thị "Họ tên (tài khoản doanh nghiệp／tài khoản cơ sở)".
- Thông báo tiếp nhận・phê duyệt・từ chối được gửi đến địa chỉ email của người đã chọn.
- Người không có trong danh sách thì trước tiên thêm vào người phụ trách ở "Chỉnh sửa" chi tiết cơ sở (hoặc thông tin doanh nghiệp) rồi mới chọn (thêm người phụ trách được phản ánh ngay không cần phê duyệt).
- Đăng ký mới trước khi đăng nhập vẫn như cũ: nhập họ tên・email・số điện thoại của người đăng ký.
- Màn hình đăng nhập của biểu mẫu đăng ký đơn lẻ cũng đã đổi thành "ID đăng nhập" (ID doanh nghiệp).

## 2. Màn hình và các mục (cùng thứ tự với ENTITY)

| Màn hình | Các mục |
|---|---|
| Danh sách cơ sở | ID cơ sở・tên cơ sở・doanh nghiệp trực thuộc・trạng thái cơ sở (＋đang yêu cầu／dự kiến tạm ngưng)・loại hợp đồng・gói hiện tại・**tháng bắt đầu hợp đồng ban đầu・tháng tiếp tục** (2026/10/01 STEP2 Q9)・nơi thanh toán・địa chỉ・ngày giờ đăng ký・thao tác (bút chì). Tìm kiếm: ID cơ sở・tên cơ sở／trạng thái cơ sở／loại hợp đồng／nơi thanh toán／tỉnh thành |
| Cơ sở: Thông tin cơ bản | Thông tin cơ bản (tên cơ sở・furigana・doanh nghiệp trực thuộc・số nhân viên・trạng thái cơ sở・ID cơ sở・ghi chú)／Thiết lập sử dụng app (giới hạn số lượng mỗi ngày・giới hạn số tiền mỗi tháng・chế độ khách [chỉnh sửa・không cần phê duyệt = phản ánh ngay + thông báo cho vận hành (quyết định 2026/10/02)]・ES-QR [chỉ hiển thị]. Bổ sung 2026/09/30 [bảng yêu cầu dòng 157]) (trước đây: chế độ khách [chỉnh sửa・cần xác nhận có cần phê duyệt hay không]. Sửa 2026-10-03)／Địa chỉ (＋tìm kiếm địa chỉ)／Người phụ trách (phân loại・tên người phụ trách・furigana・địa chỉ email・số điện thoại, thêm・xóa dòng)／Tài khoản (ID đăng nhập・ngày giờ đăng nhập gần nhất・đặt lại mật khẩu)／Mã QR: trên màn hình cơ sở, hiển thị song song hai mục xuất mã QR dùng cho app và mã ES-QR (thiết kế tối giản trang trí). [Nguồn: Yêu cầu chi tiết hợp đồng REQ-CT-284] |
| Cơ sở: Hợp đồng | Hợp đồng (hợp đồng cha): số hợp đồng cha・loại hợp đồng・trạng thái hợp đồng・**tháng bắt đầu hợp đồng** (tháng chu kỳ bắt đầu. Không hiển thị ngày = O4)・**tháng bắt đầu hợp đồng ban đầu・tháng tiếp tục** (Q9)・ngày kết thúc hợp đồng・thời gian dùng thử (số tháng)・chuyển đổi dùng thử・chính thức・gói đang áp dụng・thời gian sử dụng tối thiểu・xác định tiền phạt vi phạm hợp đồng・tình trạng hợp đồng con・lần tự động tạo kế tiếp／Danh sách (hợp đồng con): hợp đồng・tháng chu kỳ・tháng dự kiến kết thúc hợp đồng・ID hợp đồng con・tên gói・trạng thái hợp đồng (theo hợp đồng cha)・loại giao hàng・số lần giao hàng・tháng đối tượng thanh toán (phần trả trước)・số tiền thanh toán tháng này・trạng thái thanh toán (trả trước／trả sau. 3 mức chưa xác định／đã xác định／đã thanh toán = Q6) ＋ dòng dải thời gian tạm ngưng. "Tháng đối tượng thanh toán (phần trả trước)" đổi thành "**Tháng thanh toán (trả trước)**" (giá trị theo dạng "Tháng 10 năm 2026"・Q7) |
| Cơ sở: Thiết bị・Tùy chọn | Danh sách cho thuê (16 cột＋hiển thị cả đã thu hồi・tổng đang cho thuê)／danh sách áp dụng (13 cột＋hiển thị cả phần đã kết thúc・tổng tùy chọn／giảm giá (hàng tháng)) |
| Cơ sở: Thanh toán | Nơi thanh toán (chỉnh sửa được・phê duyệt)・ghi đè thời gian chờ phát hành hóa đơn・phương thức thanh toán・trạng thái thủ tục chuyển khoản tự động・chu kỳ thanh toán・tháng bắt đầu (khi thanh toán theo năm)・hạn thanh toán・đơn vị phát hành hóa đơn／Hóa đơn của cơ sở này (số hóa đơn・ngày phát hành・tháng thanh toán・số tiền cố định・trả trước đối tượng・quyết toán thực tế・đối tượng quyết toán thực tế・thuế tiêu dùng・số tiền thanh toán của cơ sở này (đã gồm thuế)・hạn thanh toán・trạng thái hóa đơn. Từ số hóa đơn mở chi tiết hóa đơn) |
| Cơ sở: Tài liệu・Lịch sử | Tài liệu đính kèm (tài liệu lộ trình vận chuyển vào (dành cho khách hàng)・ảnh nơi lắp đặt có thể thêm, tài liệu đính kèm lúc đăng ký chỉ tham khảo)／Lịch sử yêu cầu (số tiếp nhận・loại yêu cầu・ngày yêu cầu・người yêu cầu・tháng chu kỳ bắt đầu・nội dung yêu cầu・trạng thái phê duyệt・lý do từ chối・ngày giờ rút lại) |
| Hợp đồng con: Hợp đồng | Hợp đồng con (ID hợp đồng con・hợp đồng・tháng chu kỳ・số hợp đồng cha・ghi chép tạo・phạm vi áp dụng thay đổi)／Hợp đồng (gói・course・tháng bắt đầu áp dụng・tháng kết thúc áp dụng・điều kiện kế thừa từ gói)／Lịch giao hàng・nhập giao (loại giao hàng・số giao hàng・số lần giao hàng・ngày không giao hàng [chỉnh sửa・phê duyệt]・khi đến ngày dự kiến giao・ghi chú giao hàng [chỉnh sửa・ngay]・bảng lộ trình giao hàng)／Ghi chú (ghi chú ngoài gói) |
| Hợp đồng con: Thiết bị・Tùy chọn | Cấu hình thiết bị (tham khảo)・phí thiết bị (tham khảo)／Biến động thiết bị (10 cột)／Lịch lắp đặt・thu hồi [chỉnh sửa・phê duyệt]／Nguyện vọng lúc đăng ký (tham khảo) |

Chỉnh sửa hợp đồng con chỉ áp dụng cho các chu kỳ có thể thay đổi (chu kỳ tháng 11 năm 2026 = hạn chót 2026/10/15 trở đi). Quá khứ・sau hạn chót chỉ tham khảo.


## 2-2. Đưa biểu mẫu đăng ký vào (v1.2)

| Màn hình | Lối vào | Nội dung |
|---|---|---|
| Yêu cầu (mới・menu bên) | Menu bên "Yêu cầu" | Tab: Thay đổi ngày giao (phía demo giao hàng)／Yêu cầu hợp đồng. Danh sách yêu cầu hợp đồng (số tiếp nhận・loại yêu cầu・cơ sở đối tượng・ngày yêu cầu・người yêu cầu・tháng chu kỳ bắt đầu・nội dung yêu cầu・trạng thái phê duyệt), hộp thoại chi tiết theo số tiếp nhận, nếu vận hành đang xác nhận thì có thể rút lại. Góc trên bên phải có "Thêm cơ sở" "Đăng ký thay đổi" |
| Đăng ký thay đổi | "Đăng ký thay đổi" ở Yêu cầu／danh sách cơ sở, "Yêu cầu thay đổi" ở chi tiết cơ sở | 5 bước của biểu mẫu đăng ký (thủ tục → cơ sở → nội dung mong muốn → xác nhận → hoàn tất). Khi đến từ chi tiết cơ sở, bắt đầu từ "Nội dung mong muốn" với cơ sở và thủ tục đã được chọn. Sau khi gửi, cơ sở chuyển sang "đang yêu cầu", hiển thị ở danh sách yêu cầu・lịch sử yêu cầu của cơ sở. Ở "Nội dung mong muốn" của thủ tục thiết bị có thể chọn **lắp đặt hộ (`OP000007`)** (bổ sung 2026/09/30 [bảng yêu cầu dòng 156]) |
| Thêm cơ sở | "Thêm cơ sở" ở danh sách cơ sở・Yêu cầu (cả tài khoản doanh nghiệp và tài khoản cơ sở. v1.3) | "Thêm cơ sở" của biểu mẫu đăng ký (thông tin doanh nghiệp đã đăng ký・2 bước). **Cơ sở do tài khoản cơ sở thêm và yêu cầu của nó không hiển thị trong danh sách cơ sở・danh sách yêu cầu của tài khoản đã thêm (v1.9・H3＝A)**. Ở màn hình hoàn tất tiếp nhận hướng dẫn: "Cơ sở đã thêm sẽ không hiển thị với tài khoản này. Kết quả được thông báo qua email. Sau khi phê duyệt, dùng tài khoản cơ sở của cơ sở mới và tài khoản doanh nghiệp" |
| Đăng ký mới (trước khi đăng nhập) | Màn hình trước khi đăng nhập (không có menu bên. Logo・đăng ký phỏng vấn・liên hệ・đăng nhập) | Đăng ký hợp đồng mới của biểu mẫu đăng ký (giới thiệu thông thường／chiến dịch dùng thử・3 bước・báo giá) |

- Màn hình・thao tác giống biểu mẫu đăng ký đơn lẻ (`21_法人_申込フォーム.html`). `corp_branch/form_patch.py` tạo bản sao đã thay dữ liệu (Công ty cổ phần Sample・hôm nay 2026/09/29・chu kỳ tháng 11 năm 2026 phản ánh sớm nhất = hạn chót 2026/10/15) và đích chuyển, rồi nhúng bằng iframe. Giao diện là ES Kitchen company-admin (skin_apply.css＋skin_form.css).
- Thủ tục "Thay đổi cơ sở・người phụ trách" đã bị bỏ (sửa bằng "Chỉnh sửa" ở chi tiết cơ sở). Ở v1.3 cũng đã bỏ khỏi biểu mẫu đăng ký đơn lẻ (hướng dẫn nơi thanh toán ở My Page cũng đổi thành "Chỉnh sửa chi tiết cơ sở"). Cơ sở đã có dự kiến tạm ngưng được phê duyệt thì không chọn được Thay đổi gói・Tạm ngưng.
- Nếu rời đi giữa chừng (menu bên v.v.) sẽ có xác nhận hủy bỏ.

## 2-4. Chi tiết hóa đơn (v1.5)

2026/09/29 hong: Vì việc phát hành hóa đơn・PDF được thực hiện bằng Bill One nên hệ thống có thể không hiển thị・tải được hóa đơn (PDF). Thay vào đó, đặt **"Chi tiết hóa đơn" cho phép xác nhận nội dung hóa đơn trên màn hình**, và bỏ cột "Hiển thị・Tải xuống" ở danh sách.

| | Nội dung |
|---|---|
| Lối vào | **Số hóa đơn** (liên kết) trong danh sách "Thanh toán" của thông tin doanh nghiệp, danh sách "Thanh toán" của chi tiết cơ sở |
| Tiêu đề | Chi tiết hóa đơn INV-… ／ Người nhận (tên doanh nghiệp nơi thanh toán 御中)・tháng thanh toán・trạng thái (đã xác định／đã phát hành)／"Quay lại" |
| Hướng dẫn | "Hóa đơn (PDF) sẽ được gửi từ Bill One. Màn hình này dùng để xác nhận nội dung" |
| Thông tin hóa đơn | Số hóa đơn・ngày phát hành (**ngày 1 của tháng thanh toán**. Xác định ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau = 2026/10/01 S6-2. Phát hành cuối tháng của STEP2 Q4 được đính chính)・tháng thanh toán・người nhận・nơi gửi hóa đơn・phương thức thanh toán・hạn thanh toán・đối tượng trả trước・đối tượng quyết toán thực tế |
| Số tiền thanh toán | Số tiền cố định (trả trước)・quyết toán thực tế (trả sau)・thuế tiêu dùng・số tiền thanh toán (đã gồm thuế) |
| Chi tiết | Phân loại (số tiền cố định／quyết toán thực tế)・cơ sở (khi là hóa đơn gửi cho doanh nghiệp)・khoản mục (tên hiển thị trên hóa đơn)・đối tượng・số lượng・số tiền chưa thuế・thuế suất → tạm tính (chưa thuế)・thuế tiêu dùng・số tiền thanh toán (đã gồm thuế)<br>Cụm từ "trả trước" "trả sau" không hiển thị trên màn hình lẫn hóa đơn [hong trả lời 2026-10-03 (K11)] |
| Khi mở từ cơ sở | Đối với cơ sở được phát hành gộp gửi cho doanh nghiệp, chỉ hiển thị **phần của cơ sở này** trong hóa đơn đó (cũng ghi vào hướng dẫn) |
| Nội dung chi tiết (v1.6) | Phí gói: hợp đồng có phúc lợi ON gồm 2 dòng "Phí cơ bản" (10%) và "Phúc lợi (phần doanh nghiệp chịu)" (8%), OFF thì 1 dòng, tính chia thành hai thuế suất (28-150). Quyết toán thực tế gồm hao hụt quản lý (vượt mức miễn trách)・chênh lệch thu tiền mặt・chênh lệch điều chỉnh giá (không ghi số tiền thực tế bán hàng).<br>Quyết toán thực tế được ghi trên hóa đơn thành các dòng chi tiết (3 dòng) [hong trả lời 2026-10-03 (K12)].<br>Thuế tiêu dùng **làm tròn** vào tổng theo từng hóa đơn・từng thuế suất (quy tắc thanh toán 2-4. Trước đây: bỏ phần dưới 1 yên. Sửa 2026-10-03 theo quy tắc thanh toán). Khoản chưa thanh toán của tháng trước trở về trước được cộng nguyên số tiền đã gồm thuế dưới dạng "Yêu cầu thanh toán lại của các hóa đơn tháng trước trở về trước (số hóa đơn)" (28-141) |
| Các dòng tổng hợp (v1.6) | Tạm tính (chưa thuế)・đối tượng 8%・thuế tiêu dùng (8%)・đối tượng 10%・thuế tiêu dùng (10%)・yêu cầu lại (đã gồm thuế)・số tiền thanh toán (đã gồm thuế) |

## 3. Những gì không hiển thị trên Web Doanh nghiệp

Lịch sử thay đổi (vì hiển thị tên người phụ trách của vận hành)／các mục liên quan đến phí của hợp đồng con (thông tin thanh toán・①②・giảm giá・biến động số tiền chịu)／kho・công ty giao hàng・thời gian chờ của lộ trình giao hàng／mã đại lý・ghi chú nội bộ・nhân viên kinh doanh ES・Bill One ID／sử dụng tiền mặt của người dùng

## 2-3. Thông tin doanh nghiệp (v1.3・chỉ tài khoản doanh nghiệp)

Menu bên "Thông tin doanh nghiệp". Không hiển thị với tài khoản cơ sở.

| Tab | Các mục |
|---|---|
| Thông tin cơ bản | Tên doanh nghiệp・tên doanh nghiệp (hợp đồng)・furigana tên doanh nghiệp・tên doanh nghiệp nơi thanh toán (không cần phê duyệt = lưu là phản ánh ngay và **thông báo cho vận hành** = Q3)／mã bưu điện・địa chỉ・số điện thoại・số FAX (ghi trên hóa đơn・cần vận hành phê duyệt = lưu thì chờ phê duyệt, phản ánh sau khi phê duyệt. Có thể rút lại)／người phụ trách của doanh nghiệp (người phụ trách chính・người phụ trách thanh toán・người phụ trách phụ. **Có thể thêm・xóa dòng** = phản ánh ngay・thông báo cho vận hành. Bắt buộc 1 người chính・1 người thanh toán = Q10) |
| Thanh toán | Điều kiện thanh toán (thời gian chờ phát hành hóa đơn・đơn vị phát hành hóa đơn・phương thức thanh toán・thủ tục chuyển khoản tự động・chu kỳ thanh toán・tháng bắt đầu・hạn thanh toán = ngày 27 của tháng thanh toán・nơi gửi)／hóa đơn của doanh nghiệp (số hóa đơn・ngày phát hành・tháng thanh toán・số tiền cố định・đối tượng trả trước・quyết toán thực tế・thuế tiêu dùng・số tiền thanh toán (đã gồm thuế)・hạn thanh toán・trạng thái. Từ số hóa đơn mở chi tiết hóa đơn) |
| Danh sách cơ sở・hợp đồng | Tất cả cơ sở của công ty mình và tình trạng hợp đồng (từ tên cơ sở mở chi tiết cơ sở) |

- Thao tác chỉnh sửa・lưu・xác nhận hủy bỏ giống chi tiết cơ sở.
- Thay đổi địa chỉ・số điện thoại・số FAX ghi trên hóa đơn được quản lý bằng loại yêu cầu "**Thay đổi thông tin doanh nghiệp**" và phê duyệt tại quản lý yêu cầu hợp đồng của vận hành (quyết định 2026/09/30). Trong lúc chờ phê duyệt, hiển thị hướng dẫn ở thông tin doanh nghiệp, và cũng hiển thị ở danh sách "Yêu cầu" với đối tượng = "Công ty cổ phần Sample (doanh nghiệp)" (có thể rút lại).

## 2-5. Báo cáo kiểm kê (trước đây: kiểm tra tồn kho. v1.6・2026/09/30, sửa tên màn hình・cột・hạn ở sổ cái E ngày 2026-10-05)

Menu bên "**Báo cáo kiểm kê**" (cả tài khoản doanh nghiệp và tài khoản cơ sở. 2026-10-05 hong: tên menu・tên màn hình đều là "Báo cáo kiểm kê"). Là khai báo kiểm kê, tương ứng với **phương thức khai báo = người phụ trách doanh nghiệp (kiểm tra tồn kho trên Web Doanh nghiệp)** trong "Báo cáo kiểm kê (khai báo kiểm tra tồn kho)" ở chi tiết tồn kho của vận hành.

| | Nội dung |
|---|---|
| Tình trạng theo từng cơ sở | Với tháng đối tượng lần này (ví dụ: kỳ tháng 10 năm 2026): ID cơ sở・tên cơ sở・phương thức giao hàng・người kiểm tra・trạng thái (chưa khai báo／đã khai báo／chưa khai báo (quá hạn)／không kiểm tra)・ngày khai báo・người khai báo. Tài khoản doanh nghiệp xem tất cả cơ sở, tài khoản cơ sở chỉ cơ sở của mình |
| Chọn cơ sở・tháng đối tượng | Tháng đối tượng gồm lần này (nhập được) và 3 tháng trước (chỉ xem). "Tình trạng theo từng cơ sở" cũng theo tháng đã chọn (2026-10-05) |
| Các mục hiển thị | Kỳ đối tượng (ngày 21〜20)・chốt tồn kho (ngày 20 = ngày cuối của kỳ đối tượng)・**hạn báo cáo (ngày 20. Ngày 21〜25 vận hành thêm・sửa thay)**・trạng thái・ngày báo cáo・người báo cáo・phương thức báo cáo (sổ cái E 2026-10-05. Trước đây: hạn khai báo ngày 25) |
| Số lượng theo từng sản phẩm | **Sản phẩm・lần kiểm tra trước・đang trên đường giao・sẽ hủy・số hiện có・số đã bỏ・số đã đến**. Chỉ hiển thị các sản phẩm liên quan đến cơ sở đó (có trong lần kiểm tra trước・đã giao・đang trên đường giao・sẽ hủy). Doanh nghiệp không thể thêm sản phẩm không có trong danh sách. Số hiện có là số nguyên 0〜9999・bắt buộc ở mọi dòng (sổ cái E 2026-10-05. Trước đây: 2 cột lần trước・lần này, tất cả sản phẩm) |
| Khai báo | "Khai báo" → xem lại số lượng ở hộp thoại xác nhận, **chọn người đã kiểm tra từ người phụ trách** (vì là tài khoản dùng chung・giống 1-2) → đã khai báo. Dùng cho quản lý tồn kho của vận hành và quyết toán thực tế (hao hụt quản lý) |
| Người kiểm tra | Giao hàng COOL v.v.: người phụ trách doanh nghiệp báo cáo trên Web Doanh nghiệp. Giao hàng ES: tài xế báo cáo trên app, **doanh nghiệp・cơ sở cũng có thể đếm lại và báo cáo lại trên Web Doanh nghiệp (báo cáo cuối cùng có hiệu lực・đến ngày 20. hong 2026-10-05)**. Đang tạm ngưng: không kiểm tra (trước đây: doanh nghiệp chỉ xem) |
| Khi quá hạn | Không giữ lại thanh toán. **Cơ sở không có báo cáo tại thời điểm ngày 25** bị tính phí thủ tục (¥3,000・OP000016) (sổ cái E 2026-10-05). Trên màn hình hiển thị "Chưa được báo cáo" (trước đây: thanh toán bị giữ lại và phát sinh phí thủ tục. Sửa 2026-10-03 theo quyết định_trả lời STEP5_Web Doanh nghiệp・Yêu cầu chi tiết hợp đồng REQ-CT-301) |


## 4. Những điều đã quyết định (v1.3・hong trả lời 2026/09/29)

1. Tài khoản cơ sở cũng có thể yêu cầu "hủy" "tạm ngưng" cơ sở của mình.
2. Tài khoản cơ sở cũng có thể "Thêm cơ sở" (có trường hợp thêm cơ sở sau này).
3. Trong lúc có thay đổi đang chờ phê duyệt, các yêu cầu khác của cơ sở đó bị khóa (có thể rút lại).
4. "Thay đổi cơ sở・người phụ trách" được sửa bằng "Chỉnh sửa" ở chi tiết cơ sở. Cũng đã bỏ khỏi biểu mẫu đăng ký đơn lẻ.
5. Dữ liệu mẫu thống nhất: Công ty cổ phần Sample (trụ sở chính CU00643・chi nhánh Osaka CU00871・văn phòng kinh doanh Nagoya CU00902)・hôm nay 2026/09/29 (biểu mẫu đăng ký đơn lẻ cũng vậy). Chỉ demo đăng ký mới vẫn giữ Sample Foods (để khớp với danh sách yêu cầu của vận hành AP-20260910-0031).
6. Đã đưa vào thông tin doanh nghiệp (2-3).
7. Đã sửa ENTITY: "số tiền thu hồi khi hủy (ghi đè)" của hợp đồng con không hiển thị trên Web Doanh nghiệp (cũng coi "không thể" ở cột hiển thị cho doanh nghiệp của danh sách mục là "không hiển thị cho doanh nghiệp"). Trong chỉnh sửa hiển thị trên Web Doanh nghiệp, các ô chỉ tham khảo (doanh nghiệp trực thuộc・trạng thái cơ sở v.v.) không thao tác được.
8. Đăng nhập dùng chung (ID doanh nghiệp／một tài khoản cho mỗi cơ sở). Người yêu cầu được chọn từ danh sách người phụ trách khi gửi・lưu (1-2. 2026/09/29 hong "từ danh sách người phụ trách").
9. Thiết lập sử dụng ES-QR chỉ vận hành thay đổi (Web Doanh nghiệp chỉ hiển thị・không thể yêu cầu thay đổi). Chế độ khách・giới hạn số lượng mỗi ngày・giới hạn số tiền mỗi tháng có thể thay đổi từ Web Doanh nghiệp (2026/09/30 [bảng yêu cầu dòng 157・quyết định_phản ánh một phần bảng yêu cầu_20260930]).
10. Lắp đặt hộ tủ lạnh (`OP000007`) doanh nghiệp có thể chọn ở cả đăng ký mới và yêu cầu thay đổi. Ghi vào chi tiết thanh toán dưới dạng phí một lần (2026/09/30 [bảng yêu cầu dòng 156]).

11. Thiết lập sử dụng app thuộc hợp đồng con. Khi sửa bằng "Chỉnh sửa" của cơ sở, có hiệu lực với tất cả hợp đồng con từ chu kỳ hiện tại trở đi (2026/10/01 STEP2 Q2).
12. Tên doanh nghiệp・tên doanh nghiệp (hợp đồng)・furigana・tên doanh nghiệp nơi thanh toán được phản ánh ngay và thông báo cho vận hành (Q3).
13. Hóa đơn xác định ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau (ngày 1 của tháng thanh toán). Tháng thanh toán・hạn thanh toán (ngày 27 của tháng thanh toán) không đổi (Q4 được đính chính ở 2026/10/01 S6-2).
14. Trạng thái thanh toán trên Web Doanh nghiệp là 3 mức: chưa xác định／đã xác định／đã thanh toán (vận hành là 5 mức. Đối ứng xem danh sách mục §0.8・Q6). Thống nhất thành "Tháng thanh toán (trả trước)" (Q7).
15. Thời gian sử dụng tối thiểu: tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (Q8). Trụ sở chính: tủ lạnh đã hết hạn, máy bán hàng tự động ¥12,000; Osaka ¥0; Nagoya đang tạm ngưng nên bộ đếm dừng, ¥10,000 (phần lẻ số tháng còn lại làm tròn lên・tạm đặt).
16. Hiển thị "Tháng bắt đầu hợp đồng ban đầu" và "Tháng tiếp tục" ở danh sách cơ sở・chi tiết cơ sở (Q9). Người phụ trách của doanh nghiệp có thể thêm・xóa trên Web Doanh nghiệp (Q10).

17. Trang chủ của tài khoản doanh nghiệp là lịch giao hàng của tất cả cơ sở (đầu ô ghi tên cơ sở) + danh sách thông báo. Có thể lọc theo cơ sở. Tài khoản cơ sở chỉ thấy cơ sở của mình (2026/10/01 H1. Trang chủ của demo `20_法人_まとめ.html`).
18. Rút lại yêu cầu chỉ tài khoản đã gửi yêu cầu và tài khoản doanh nghiệp mới làm được. Tài khoản cơ sở không rút lại được yêu cầu do tài khoản doanh nghiệp gửi (H2).
19. Cơ sở mới do tài khoản cơ sở "Thêm cơ sở" thì tài khoản đã thêm không nhìn thấy (H3＝A). Danh sách yêu cầu chỉ gồm yêu cầu của cơ sở của mình (H4).
20. Hiển thị mã dòng máy cùng với tên dòng máy (H5): danh sách cho thuê・thiết bị của hợp đồng con・biến động thiết bị・đăng ký thay đổi thiết bị (lựa chọn thiết bị đối tượng・thiết bị sau thay đổi và màn hình xác nhận)・ước tính quyết toán khi hủy. Thời gian sử dụng tối thiểu của dòng máy trong biểu mẫu đăng ký cũng thống nhất thành tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (Q8).

## 5. Những điều cần xác nhận

1. ~~Mã dòng máy hiển thị trong bảng tiền phạt vi phạm hợp đồng~~ → **Quyết định (2026/10/01 H5)**: hiển thị (cùng tên dòng máy)
2. ~~Tiền phạt vi phạm hợp đồng là số tiền cố định hay chia theo số tháng còn lại~~ → **Quyết định**: chia theo tỷ lệ (số tiền thu hồi × số tháng còn lại ÷ thời gian sử dụng tối thiểu <tủ lạnh 3・máy bán hàng tự động 12>. Sổ cái B "Tiền phạt vi phạm hợp đồng")
3. ~~Thêm・xóa dòng "Người phụ trách" của doanh nghiệp~~ → **Quyết định (2026/10/01 STEP2 Q10)**: có thể thêm・xóa trên Web Doanh nghiệp
4. ~~Kiểm tra tồn kho: sau khi khai báo có sửa được không・có nhập được trước ngày chốt không~~ → **Quyết định**: khách hàng có thể báo cáo lại nhiều lần đến ngày 20 (nhập được cả trước ngày chốt). Ngày 21〜25 vận hành nhập thay (sổ cái H)
5. Nội dung thông báo cho doanh nghiệp khi vận hành thay đổi ngày giao sau hạn chót (#63) (trang chủ của demo chỉ có dấu "thay đổi ngày" và một dòng "Lần giao cần xác nhận")
6. ~~Thay đổi chế độ khách có cần vận hành phê duyệt không~~ → Đã chốt (quyết định 2026/10/02: không cần phê duyệt・phản ánh ngay + thông báo cho vận hành [bảng yêu cầu dòng 157])
7. ~~Có hiển thị tháng bắt đầu hợp đồng・tháng tiếp tục trên Web Doanh nghiệp không~~ → **Quyết định (2026/10/01 STEP2 Q9)**: hiển thị (tên cột là "Tháng bắt đầu hợp đồng ban đầu" = Q5). Câu hỏi gốc: có hiển thị tháng bắt đầu hợp đồng・tháng tiếp tục (ví dụ: 5 năm 3 tháng) ở danh sách cơ sở・chi tiết cơ sở của Web Doanh nghiệp không (bổ sung 2026/09/30 [bảng yêu cầu dòng 107]. Đã quyết định hiển thị ở danh sách cơ sở của vận hành. Tháng tiếp tục tính từ "ngày bắt đầu hợp đồng ban đầu" của cơ sở, không đặt lại khi đổi・chuyển gói)

<!-- patch_step2_spec_20261001 -->

<!-- patch_h1h5_spec_20261001 -->
