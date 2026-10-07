# Chênh lệch hạng mục màn hình tiếp nhận・phê duyệt (29/09/2026)

Đây là kết quả đối chiếu các hạng mục của quản lý đăng ký (màn hình tiếp nhận đăng ký mới・dùng thử・chuyển từ dùng thử sang triển khai chính thức; màn hình phê duyệt thay đổi・tạm dừng・hủy・mở lại; nhập hộ) với các hạng mục của doanh nghiệp・cơ sở・hợp đồng (`items.py`), master (`master_items.py`・`master_rows.py`) và các quyết định 28-1〜28-60.
**Đã xử lý xong vào ngày 29/09/2026** (quyết định 28-61〜28-69・phụ lục quyết định §13・§14). Danh sách này được giữ lại để lưu vết quá trình.

## Điểm chính (theo thứ tự quan trọng)

1. **Việc ghi đè người nhận hóa đơn và lead time phát hành hóa đơn đang nằm ở tab "Cơ sở｜Thông tin cơ bản" của màn hình tiếp nhận.** Quyết định 28-29 là chuyển sang tab thanh toán. Màn hình tiếp nhận không có tab thanh toán của cơ sở, nên không có chỗ nhập phương thức thanh toán・chu kỳ thanh toán・ID nơi phát hành Bill One・trạng thái thủ tục chuyển khoản tự động, vốn bắt buộc khi người nhận hóa đơn = cơ sở này.
2. **Màn hình tiếp nhận chưa thu thập các hạng mục bắt buộc của doanh nghiệp.** Không có tab doanh nghiệp, chỉ có phần hiển thị tham chiếu ở bên cạnh. Các hạng mục còn thiếu như sau.
   - Furigana tên doanh nghiệp・tên doanh nghiệp nhận hóa đơn
   - Các ô địa chỉ tách riêng (mã bưu điện〜tòa nhà, v.v.)
   - Phân loại và furigana của người phụ trách
   - ID nơi phát hành Bill One của doanh nghiệp
3. **Hợp đồng vẫn còn thời gian sử dụng tối thiểu (mâu thuẫn với 28-34).**
   - Hợp đồng cha của dùng thử có ô "Thời gian sử dụng tối thiểu".
   - Việc xác định phí phạt của triển khai chính thức được tính bằng ngày bắt đầu hợp đồng + 12 tháng.
   - Câu chữ và ghi chú của phần phê duyệt vẫn còn "ngày hết hạn của hợp đồng cha".
4. **Ngày bắt đầu tính của thiết bị đặt trong thời gian dùng thử ngược với 28-17.** Màn hình dùng thử ghi "dùng thử cũng tính theo từng thiết bị", nhưng 28-17 tính từ ngày bắt đầu triển khai chính thức.
5. **Vẫn còn loại liên động B・C của tùy chọn (mâu thuẫn với 28-44).** Phần biến động tùy chọn của màn hình chuyển đổi có cột "Loại liên động", ghi chú là "A／B = tiếp tục／C = một lần". Dòng giảm giá cũng hiển thị "C (một lần)".
6. **Tùy chọn loại A đang được đăng ký trong bảng biến động.**
   - Khi đăng ký mới, ES-QR được đăng ký bằng "Thêm", và khi chuyển đổi cũng đăng ký dòng loại A.
   - Ghi chú của loại A có "giới hạn số lượng cung cấp hằng tháng・tỉnh/thành phố", nhưng phí giao hàng theo khu vực không liên động (28-47).
7. **Mã và tên trong master không khớp nhau.**
   - "ES-QR phí hằng tháng (OP000004) ¥3,000" → đúng là OP000002・¥1,000 (OP000004 là phí giao hàng theo khu vực)
   - "OP000002 lắp thêm tủ đông" → không có trong master
   - "DC000004 giảm giá khi triển khai lần đầu" → DC000004 là miễn phí thêm số lần giao hàng
   - "BX000001 size M" → BX000001 là size L
8. **Đang tính phí hằng tháng ¥2,000 cho hộp vật tư (màn hình chuyển đổi).** Theo 28-9 và master thì là ¥0.
9. **Tên cột của bảng giá vẫn là "Số tiền đã gồm thuế" (cả 3 màn hình).** Màn hình doanh nghiệp là "Số tiền chưa gồm thuế (yên)".
10. **Cách ghi hạn thanh toán có 3 kiểu, không kiểu nào khớp với quy tắc cố định.** Gồm "ngày 27 của tháng hiện tại", "ngày 27 của tháng trước tháng chu kỳ + 1 tháng" và "ngày 27 của tháng trước", trong khi quy tắc cố định là "cuối tháng trước tháng chu kỳ".
11. **Giá trị người nhận hóa đơn trên màn hình phê duyệt khác với màn hình doanh nghiệp.** Màn hình phê duyệt là "Thanh toán cho nơi giao hàng／Thanh toán cho doanh nghiệp" và tab cũng là "Thông tin cơ bản". Màn hình doanh nghiệp là Doanh nghiệp／Cơ sở này, và vị trí đặt là tab thanh toán.
12. **Đang hiển thị giá bằng tên hạng mục không có trên màn hình doanh nghiệp.** "Chi phí tạm thời (giao hàng thay thế)" trên màn hình phê duyệt phải được gắn vào "Biến động tùy chọn・giảm giá" dưới dạng phí một lần của OP000019・OP000020 (phí giao thiết bị) (28-53). "Phí phạt (hóa đơn cuối cùng)" cũng không có hạng mục trên màn hình doanh nghiệp.
13. **Khi mở lại, ngày hết hạn của thiết bị đặt lại được ghi là "kế thừa phần còn lại trước khi tạm dừng".** Theo 28-11, thiết bị đặt lại được tính từ ngày lắp đặt.
14. **Đang dùng các giá trị không có trong trạng thái hợp đồng.**
    - "Hủy" ở phần sau thay đổi của hủy hợp đồng, "Dự kiến kết thúc" của chuyển đổi
    - "Hiệu lực" và "Ngoài đối tượng" của hợp đồng con. Trạng thái hợp đồng của hợp đồng con đã bị bãi bỏ, trạng thái thanh toán là Chưa xác định／Đã xác định／Đã xuất hóa đơn
    - Trạng thái cuối cùng sau khi phê duyệt hủy hợp đồng chưa được quy định trên màn hình doanh nghiệp
15. **Cách nhập người phụ trách ES khác nhau.** Nhập hộ thì chọn từ danh sách lựa chọn, tên cột là "Tên người phụ trách ES". Màn hình doanh nghiệp là "Nhân viên kinh doanh ES" và là văn bản tự do.

## Các điểm chỉ ra chính theo từng màn hình

### Đăng ký mới
| Phân loại | Phía tiếp nhận | Phía doanh nghiệp・hợp đồng／master | Đề xuất |
|---|---|---|---|
| Thừa | Ghi đè người nhận hóa đơn・lead time (Cơ sở｜Thông tin cơ bản) | Tab thanh toán của cơ sở (28-29) | Tạo mới tab "Cơ sở｜Thanh toán" và chuyển sang đó |
| Thừa (trùng lặp) | Người nhận hóa đơn xuất hiện ở 2 chỗ ở Fukuoka. Giá trị "Doanh nghiệp (phát hành gộp)" bị lẫn với đơn vị phát hành | Người nhận hóa đơn (Doanh nghiệp／Cơ sở này) và đơn vị phát hành là các hạng mục khác nhau | Chỉ đặt 1 chỗ ở mục thanh toán, giá trị chỉ là "Doanh nghiệp" |
| Thừa | Biến động tùy chọn "Thêm ES-QR phí hằng tháng" | Loại A không xử lý bằng biến động | Xóa dòng, chỉ để tham chiếu |
| Thừa (trùng lặp) | "Ngày dự kiến lắp đặt" và "Ngày mong muốn nhập thiết bị" đều bắt buộc | 1 hạng mục (△). Dòng biến động cũng có ngày dự kiến | Gộp thành 1 ô |
| Tên gọi | Loại thiết bị "Tủ trưng bày lạnh", tủ lạnh mong muốn "RF000002 cỡ vừa" | Phân loại thiết bị・ID dòng máy + tên dòng máy | Thống nhất theo tên trong master |
| Tên gọi | Điều kiện giao hàng／Gói／Course | Ghi chú giao hàng／ID gói／Loại menu (course) | Thống nhất |
| Tên gọi | Địa chỉ doanh nghiệp (1 ô)・số điện thoại đại diện | Các ô địa chỉ tách riêng・số điện thoại (địa chỉ ghi trên hóa đơn) | Tách ra và thống nhất |
| Tên gọi | Vai trò người phụ trách "Người đăng ký" "Người phụ trách thanh toán" | Người phụ trách chính／Người phụ trách thanh toán／Người phụ trách phụ | Đặt theo tên phân loại |
| Thiếu | — | Doanh nghiệp: Furigana tên doanh nghiệp・tên doanh nghiệp nhận hóa đơn・các ô địa chỉ tách riêng・ID nơi phát hành Bill One | Bổ sung các tab "Doanh nghiệp｜Thông tin cơ bản" "Doanh nghiệp｜Thanh toán" (nếu là doanh nghiệp hiện có thì tham chiếu) |
| Thiếu | — | Cơ sở: Người dùng dùng tiền mặt・tòa nhà, v.v.・số FAX・số điện thoại người phụ trách | Bổ sung |
| Thiếu | — | Công ty giao hàng ②・URL xác nhận hỏi đáp・số giao hàng | Bổ sung vào tuyến giao hàng |
| Thiếu | — | Số tiền thu hồi khi hủy hợp đồng (ghi đè) (bắt buộc với dòng máy báo giá riêng・28-8) | Bổ sung vào hợp đồng con |
| Thiếu | Lắp đặt máy bán hàng tự động | Dòng một lần của phí giao thiết bị・lắp đặt tiêu chuẩn (28-53) | Hiển thị dưới dạng dòng giá trị ban đầu |

### Dùng thử
| Phân loại | Phía tiếp nhận | Phía doanh nghiệp・hợp đồng／master | Đề xuất |
|---|---|---|---|
| Thừa | Thời gian sử dụng tối thiểu của hợp đồng cha "Không có"／huy hiệu "Không có thời gian sử dụng tối thiểu" | Hợp đồng cha không có (28-34) | Xóa. Đổi thành "Không ràng buộc・không phí phạt" |
| Thừa (mâu thuẫn) | "Dùng thử cũng tính theo từng thiết bị" | Từ ngày bắt đầu triển khai chính thức (28-17) | Sửa lại |
| Tên gọi | Trạng thái thanh toán "Ngoài đối tượng"／hợp đồng con "Hiệu lực (ngoài đối tượng thanh toán)" | Chưa xác định／Đã xác định／Đã xuất hóa đơn | Không tăng thêm trạng thái, biểu thị bằng số tiền 0 |
| Thiếu | — | Tab doanh nghiệp, giới hạn số lượng 1 ngày・giới hạn số tiền 1 tháng・người dùng dùng tiền mặt của cơ sở, mã đại lý | Bổ sung |

### Chuyển từ dùng thử sang triển khai chính thức
| Phân loại | Phía tiếp nhận | Phía doanh nghiệp・hợp đồng／master | Đề xuất |
|---|---|---|---|
| Thừa | Phân loại gia hạn "Tự động gia hạn"／trạng thái hợp đồng con／lý do kết thúc dùng thử | Không có trên màn hình doanh nghiệp | Xóa |
| Thừa | Cột "Loại liên động" của biến động tùy chọn, "OP000002 lắp thêm tủ đông (A)" | Loại liên động là A／không liên động. A không biến động | Xóa cột và dòng |
| Thừa | Hộp vật tư phí hằng tháng ¥2,000 | ¥0 (28-9) | Xóa |
| Tên gọi | "Dự kiến kết thúc"／ngày kết thúc hợp đồng dùng thử | Trạng thái hợp đồng／ngày kết thúc hợp đồng | Biểu thị bằng ngày kết thúc |
| Tên gọi | Tiêu đề "Biến động tùy chọn・giảm giá", phân loại biến động "Mới" | "Biến động tùy chọn・giảm giá", Thêm／Thay đổi／Kết thúc | Thống nhất |
| Thiếu | — | Khoảng cách từ ngày hết hạn đến ngày bắt đầu triển khai chính thức, và xác định vượt quá 1 năm (28-35〜37) | Hiển thị |

### Màn hình phê duyệt (thay đổi・tạm dừng・hủy・mở lại) và nhập hộ
| Phân loại | Phía phê duyệt | Phía doanh nghiệp・hợp đồng／master | Đề xuất |
|---|---|---|---|
| Tên gọi | Cơ sở > Thông tin cơ bản > Người nhận hóa đơn "Thanh toán cho nơi giao hàng → Thanh toán cho doanh nghiệp" | Cơ sở > Thanh toán > Người nhận hóa đơn (Doanh nghiệp／Cơ sở này) | Sửa lại |
| Thừa | Hợp đồng con > Giá・thanh toán > Chi phí tạm thời "Giao hàng thay thế ¥7,800" | OP000020 Phí giao thiết bị (từ 2 máy) (28-53) | Chuyển thành dòng biến động |
| Thừa | Phí phạt (hóa đơn cuối cùng) | Dòng của ① (quyết định loại phí) | Ghi dưới dạng dòng của ① |
| Tên gọi | Trạng thái hợp đồng "→ Hủy" | Không có "Hủy" | Quyết định trạng thái sau khi hủy hợp đồng |
| Thiếu | Thay đổi tạm dừng・hủy hợp đồng không có dòng trạng thái cơ sở | Đang tạm dừng／Dự kiến đóng／Đã đóng | Quyết định xem có chuyển động không rồi bổ sung |
| Thừa (mâu thuẫn) | Mở lại: ngày hết hạn của thiết bị đặt lại "Kế thừa phần còn lại trước khi tạm dừng" | Từ ngày lắp đặt (28-11) | Sửa lại |
| Thừa (mâu thuẫn) | Tạm dừng: ngày hết hạn của thiết bị thu hồi được "dời ra sau" | Chỉ dừng bộ đếm với thiết bị để nguyên tại chỗ (28-1b) | Xóa |
| Thừa | Các câu như "Không thay đổi ngày hết hạn của hợp đồng cha" | Hợp đồng cha không có ngày hết hạn (28-34) | Xóa |
| Tên gọi | Phân loại hợp đồng "Trial", loại thiết bị・phương thức giao hàng・số lần giao hàng | Chiến dịch dùng thử, phân loại thiết bị・phân loại giao hàng・số lần giao | Thống nhất |
| Tên gọi | Tên người phụ trách ES (lựa chọn) | Nhân viên kinh doanh ES (văn bản tự do) | Thống nhất |
| Thiếu | Nhập hộ | Tên doanh nghiệp (hợp đồng)・tên doanh nghiệp nhận hóa đơn・furigana tên cơ sở・số điện thoại cơ sở・furigana người phụ trách・người phụ trách thanh toán | Bổ sung |

## Chỉnh lý trạng thái

| Vị trí | Giá trị đang hiển thị | Nhận xét |
|---|---|---|
| Bước (tiếp nhận) | **Đã chuyển thành 4 bước vào 29/09/2026**: Xác nhận nội dung đăng ký → Đăng ký tạm → Thiết lập thông tin chi tiết → Xác định (đăng ký chính thức) (chuyển đổi là Xác nhận nội dung chuyển đổi → Đăng ký tạm hợp đồng cha mới → Thiết lập thông tin chi tiết → Xác định chuyển đổi) | Đã bỏ bước "Hoàn tất tiếp nhận đăng ký" |
| Danh sách (hợp đồng mới) | Đang tiếp nhận／Đang thiết lập hợp đồng／Hoàn tất | Không có trạng thái **từ chối・rút lại** của đăng ký mới (chưa khớp với 28-25・28-26) |
| Danh sách (thay đổi) | Chờ phê duyệt／Đã xử lý một phần／Đã phê duyệt／Phê duyệt một phần／Từ chối／Đã rút lại | Khó phân biệt "Đã xử lý một phần" và "Phê duyệt một phần" |
| Trạng thái tài khoản | Chưa phát hành／Đã phát hành／Đã đăng nhập／Đang dừng | Màn hình doanh nghiệp không có hạng mục trạng thái (chỉ có ID đăng nhập・ngày giờ đăng nhập gần nhất). Không có căn cứ cho "Đang dừng" |
| Thông tin doanh nghiệp ở bên cạnh | **Đã đổi thành "Doanh nghiệp mới／Doanh nghiệp hiện có" vào 29/09/2026** (trước đây là Chưa đăng ký／Đã đăng ký) | Chỉ hiển thị dòng trạng thái doanh nghiệp sau khi đăng ký tạm |
| Hợp đồng con | Hiệu lực／Ngoài đối tượng thanh toán | Biểu thị bằng trạng thái thanh toán (Chưa xác định／Đã xác định／Đã xuất hóa đơn) |
| Danh sách màn hình doanh nghiệp | Trạng thái hợp đồng trong danh sách cơ sở・hợp đồng không có "Kết thúc" | Không nhất quán trong `items.py`. Bổ sung "Kết thúc" vào cả danh sách |
