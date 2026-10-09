> **Đã đóng băng (nguyên bản · 2026-10-05). Từ nay không cập nhật.** Các quyết định đang có hiệu lực xem tại `docs/決定台帳.md`. Nơi nội dung của file này được chuyển đến và các quyết định đã bị thay thế xem mục "G" trong sổ cái.

# Quyết định bổ sung v2.3 (2026/09/28) ― Xung quanh đơn đăng ký, phê duyệt

Đây là các câu trả lời cho những vấn đề phát sinh khi đối chiếu ba thứ: site doanh nghiệp (đăng ký, đơn thay đổi) / màn hình phê duyệt của Vận hành / màn hình doanh nghiệp (Entity, `items.py`).
**Đây là nơi sở hữu quyết định**, demo và đặc tả sẽ được căn chỉnh theo đây. Phiên bản vẫn giữ là v2.3 và được xử lý như "bổ sung 2026/09/28".

- Tài liệu đã đối chiếu: `02_デモ/21_法人_申込フォーム.html` (site doanh nghiệp) / `02_デモ/11_運営_申請受付.html` (màn hình phê duyệt) / `02_デモ/12_運営_法人拠点契約.html`, `項目一覧_生成スクリプト/items.py` (màn hình doanh nghiệp)
- Khi tài liệu mâu thuẫn nhau: "lấy ngày mới hơn, để bản cũ trong ngoặc". Những điểm chưa quyết định thì không điền theo phỏng đoán mà ghi "cần xác nhận"

---

## 1. Những điều đã quyết định theo câu trả lời của hong

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-1 | Thiết bị đang tạm ngưng | **Có thể để nguyên tại chỗ.** Trong đơn tạm ngưng có thể chọn "muốn để nguyên thiết bị" và Vận hành phê duyệt. Mặc định là thu hồi |
| 28-1a | Phí lưu giữ khi để nguyên | **Không thu** (khi tạm ngưng không tạo hợp đồng con nên không có "chỗ chứa" cho khoản thanh toán) (2026/09/30 hong xác nhận lại: không thu [bảng yêu cầu dòng 165]) |
| 28-1b | Thời gian sử dụng tối thiểu khi để nguyên | **Trong thời gian tạm ngưng, dừng đếm** (vì không thu phí hàng tháng) |
| 28-1c | Khi tạm ngưng sắp vượt quá tổng cộng 1 năm | **Hướng dẫn hủy hợp đồng và thu hồi thiết bị tại thời điểm đó** |
| 28-2 | Cách tính tiền phạt | **Chia theo tỷ lệ.** Tiền phạt = số tiền thu hồi khi hủy × (số tháng còn lại của thời gian sử dụng tối thiểu ÷ thời gian sử dụng tối thiểu). Tính cho từng thiết bị rồi cộng lại. Ví dụ: ¥150,000, 24 tháng, còn 20 tháng → ¥125,000 |
| 28-3 | Đăng nhập trong thời gian tạm ngưng | **Có thể đăng nhập. Khi tất cả cơ sở đều đang tạm ngưng thì chỉ để tham khảo** (chỉ xem hợp đồng, thanh toán). Các thao tác thực hiện được chỉ gồm **đăng ký tiếp tục, đăng ký hủy hợp đồng, liên hệ**. Nếu có dù chỉ 1 cơ sở đang sử dụng thì hoạt động bình thường |
| 28-4 | Khi đơn đăng ký trùng nhau ở cùng một cơ sở | **Không được đăng ký trùng.** Cơ sở có đơn đang chờ phê duyệt thì không thể chọn trong đơn mới (hiển thị "Đang đăng ký" và làm xám). **Hủy hợp đồng cũng không là ngoại lệ.** Khi gấp thì rút đơn lại rồi đăng ký lại, hoặc tiếp nhận qua liên hệ |

## 2. Những điều đã quyết định theo phương án đề xuất (áp dụng nguyên vẹn đề xuất 2026/09/28)

### Thanh toán, tiền

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-5 | Thay đổi đối với chu kỳ đã phát hành hóa đơn | **Không áp dụng thay đổi vào chu kỳ đã phát hành.** Bắt đầu từ "chu kỳ đầu tiên chưa phát hành". Chỉ khi muốn áp dụng sớm hơn thì thanh toán, hoàn lại phần chênh lệch ở dòng **③Điều chỉnh** của hóa đơn kế tiếp. **Không hủy, phát hành lại** (cùng cách xử lý như hoàn tiền thanh toán một lần theo năm ngày 9/19) |
| 28-6 | Đổi nơi nhận hóa đơn và hóa đơn đã phát hành | **Hóa đơn đã phát hành giữ nguyên.** Từ hóa đơn chưa phát hành sẽ chuyển sang nơi nhận hóa đơn mới |
| 28-7 | Số tiền cố định chung cho toàn hợp đồng (tiền phạt) | **Không có.** Thống nhất về "số tiền thu hồi khi hủy" của master dòng máy (có thể ghi đè bằng hợp đồng, quyết định 2B) (khoản "số tiền cố định chung" của 9/11 đã bị bãi bỏ khi chuyển sang master dòng máy vào 9/17) |
| 28-8 | Số tiền thu hồi của dòng máy báo giá riêng | Số tiền tiêu chuẩn trong master dòng máy **được để trống**. Bắt buộc nhập khi tạo hợp đồng (¥150,000 trong demo là ví dụ minh họa) |
| 28-9 | Hộp vật tư bổ sung | **Không đặt quy tắc đặc biệt, theo phí hàng tháng của master dòng máy** (hiện tại ¥0 = miễn phí) |

### Tạm ngưng, tiếp tục

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-10 | Giới hạn tạm ngưng | **Tổng cộng 1 năm** (quyết định ngày 9/11. Phương án "6 tháng/năm + không được tạm ngưng lại trong 3 tháng sau khi tiếp tục" không được chấp nhận). Đóng mục "cần xác nhận ④" của danh sách hạng mục |
| 28-11 | Thời gian sử dụng tối thiểu sau khi tiếp tục | **Kế thừa phần còn lại trước khi tạm ngưng (không đếm lại).** Chỉ thiết bị được thu hồi rồi đặt lại thì tính từ ngày lắp đặt. **Thay đổi "thời hạn hợp đồng sau khi tiếp tục được tính mới từ ngày tiếp tục (đếm lại)" của 2026/09/11** (đã xác nhận với hong 2026/09/28) |
| 28-12 | Hợp đồng con bị hủy do tạm ngưng | **Dữ liệu được giữ lại dưới dạng "Đã hủy". Không hiển thị trong danh sách** (chỉ hiển thị "dòng dạng dải của thời gian tạm ngưng" theo quyết định ngày 9/25) |
| 28-13 | Khi trả lời "có thay đổi" lúc tiếp tục | **Có thể sửa ngay trong đơn tiếp tục** (nơi giao hàng, người phụ trách, gói). Ghi rõ là ngoại lệ của "1 đơn 1 thủ tục" |

### Thiết bị, gói

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-14 | Tỷ lệ đông lạnh, số lượng chứa tối đa của tủ đông | Tiến hành theo bản nháp (~~30%~~／60L = 40, 100L = 70, 150L = 110). Khi biết thông số máy thật thì Vận hành sửa trong master dòng máy. **(Sửa đổi 2026/09/30: đông lạnh không quản lý theo tỷ lệ (30%) mà quyết định theo số lượng trong gói (số suất cung cấp hàng tháng của đông lạnh trong master gói) [bảng yêu cầu dòng 170, 2026/09/30 hong]. Bản nháp về số lượng chứa tối đa của tủ đông giữ nguyên)** |
| 28-15 | Con số dùng cho phán định miễn phí | Bỏ "số suất ES × số lần giao 4", phán định bằng **tổng "giới hạn số suất cung cấp hàng tháng" của master gói** |
| 28-16 | Bảng tham khảo giao hàng khi thay thế | Áp dụng bản nháp, hiển thị làm **giá trị ban đầu** của báo giá theo từng lần trên màn hình phê duyệt (1 máy ¥4,800／từ 2 máy trở lên ¥7,800／không có thang máy từ tầng 3 trở lên + ¥3,000) |
| 28-17 | Tính mốc đếm của thiết bị đặt trong thời gian dùng thử | **Đếm từ ngày bắt đầu triển khai chính thức** (vì dùng thử không có ràng buộc, không có tiền phạt) |
| 28-18 | Có cho chọn dòng máy khi thay đổi thiết bị không | **Cho chọn** (chỉ các dòng máy có phân loại công khai = hiển thị trong đăng ký). Kèm dòng "Tùy tồn kho, chúng tôi có thể đề xuất kích cỡ gần nhất" |

### Giao hàng

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-19 | Phương thức giao hàng của máy bán hàng tự động | **Cố định trên site doanh nghiệp.** Chỉ Vận hành mới thay đổi được (tiếp nhận qua liên hệ) |
| 28-20 | Khi thay đổi phương thức giao hàng mà không kịp sắp xếp lại tuyến | Tiếp nhận cùng lúc với phê duyệt, sắp xếp lại bằng batch đêm. **Phần đã thành dữ liệu giao hàng, đã ra lệnh xuất hàng thì không tự động thay đổi, hiển thị "cần xác nhận" trên lịch Vận hành** (quy tắc hiện có) |

### Site doanh nghiệp

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-21 | Hủy hợp đồng khi đang tạm ngưng | **Cơ sở đang tạm ngưng cũng có thể gửi đơn hủy hợp đồng** (tiền phạt tính theo việc dừng đếm của 28-1b) |
| 28-22 | Một đơn có thể trộn nhiều thủ tục không | **Vẫn là 1 đơn 1 loại** (ngoại lệ là 28-13) |
| 28-23 | Kiểu màn hình xác nhận | **Cố định dạng bảng** (không tự động chuyển theo số lượng) |
| 28-24 | Phỏng vấn | Vẫn tùy chọn (URL trang phỏng vấn cần xác nhận với kinh doanh) |

## 3. Cơ chế còn thiếu (được áp dụng)

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-25 | Từ chối | **Bắt buộc nhập lý do từ chối** (lựa chọn mẫu + văn bản tự do). **Thông báo cho doanh nghiệp theo từng cơ sở** và kèm câu mẫu của lý do. Không có trả lại để sửa (9/11). Muốn sửa thì đăng ký lại |
| 28-26 | Rút đơn | **Chỉ với cơ sở mà Vận hành chưa xử lý**, có thể rút theo từng cơ sở từ "Nội dung đang đăng ký" trên site doanh nghiệp. Cơ sở đã xử lý thì không thể |
| 28-27 | Khi phê duyệt quá hạn chốt đặt hàng | Tháng chu kỳ bắt đầu lấy giá trị phán định theo ngày đăng ký làm giá trị ban đầu. **Khi phê duyệt sau hạn chốt thì tự động sửa tháng bắt đầu sang chu kỳ kế tiếp**, và ghi cả trong thông báo cho doanh nghiệp. Hiển thị "còn ○ ngày đến hạn chốt" trên màn hình phê duyệt |
| 28-28 | Dữ liệu đơn đăng ký | Định nghĩa trong bản đúng của mô hình dữ liệu (Đặc tả DEV) **bảng đơn đăng ký** (số đơn, loại, ngày đăng ký, người đăng ký, lý do, yêu cầu, trạng thái) và **chi tiết đơn đăng ký (cơ sở)** (cơ sở, tháng chu kỳ bắt đầu, nội dung đăng ký, phản hồi, trạng thái phê duyệt, người phê duyệt, ngày giờ phê duyệt, lý do từ chối, ngày giờ rút đơn). Danh sách hạng mục chỉ bổ sung các hạng mục hiển thị dưới dạng "Lịch sử đơn đăng ký" của màn hình cơ sở |

## 4. Các quyết định hiện có bị hủy bỏ, thay đổi

| Hiện có | Thay đổi |
|---|---|
| Quyết định v2.3 **6C** (chuyển khoản tự động được chuyển đổi cùng lúc với phê duyệt) | 2026/09/28, vì trên màn hình doanh nghiệp (`items.py`) phương thức thanh toán là "doanh nghiệp chỉ tham khảo, không thể đăng ký", nên **không xử lý trong đơn thay đổi từ doanh nghiệp.** 6C được giữ lại như quy tắc "khi Vận hành đổi phương thức thanh toán sang chuyển khoản tự động" (cho đến khi hoàn tất thủ tục thì thanh toán bằng chuyển khoản ngân hàng) |
| Tiền phạt hủy hợp đồng 9/11 = số tiền cố định chung | Bãi bỏ theo 28-7 (đã chuyển sang master dòng máy vào 9/17) |
| Phương án "luôn thu hồi" của "tạm ngưng" trên màn hình phê duyệt | Theo 28-1, mặc định là thu hồi, cũng có thể chọn để nguyên |
| Quyết định 2026/09/11 "thời hạn hợp đồng sau khi tiếp tục được tính mới từ ngày tiếp tục (ID hợp đồng không đổi)" / phương án "đếm lại thời gian sử dụng tối thiểu từ ngày tiếp tục" của "tiếp tục" trên màn hình phê duyệt | Theo 28-11, kế thừa phần còn lại trước khi tạm ngưng (ID hợp đồng giữ nguyên) |
| Phương án "không đăng nhập được nếu tất cả cơ sở đang tạm ngưng" của site doanh nghiệp | Theo 28-3, đăng nhập được nhưng chỉ để tham khảo |

## 5. Những điều vẫn chưa quyết định

| Hạng mục | Điều cần quyết định |
|---|---|
| Đơn thay đổi thông tin doanh nghiệp | Có lập mới không (tên doanh nghiệp, địa chỉ ghi trên hóa đơn, người phụ trách doanh nghiệp. Trong `items.py` là có thể đăng ký nhưng chưa có lối vào) |
| Phân loại phê duyệt | Có chia thành 3 loại "bắt buộc phê duyệt／chỉ thông báo／chỉ Vận hành" không. Có chỉ bắt buộc phê duyệt cho người phụ trách thanh toán không |
| Đơn vị phát hành hóa đơn | Có bãi bỏ và thống nhất về "nơi nhận hóa đơn" của cơ sở không (2026/09/28 chiều: trước mắt chỉ quyết định doanh nghiệp chỉ tham khảo, Vận hành sửa. 28-31) |
| Màn hình tiếp nhận | Có đưa vào đối tượng triển khai của giai đoạn 2 không (2026/09/28: khi Vận hành tạo cũng nhập hộ rồi đi qua tiếp nhận = 28-33. Nhu cầu về màn hình tiếp nhận tăng lên) |
| Thêm cột vào `items.py` | Có thêm 3 cột "loại đơn đăng ký", "phân loại phê duyệt", "vị trí hiển thị trên site doanh nghiệp" không |
| Xác nhận với kinh doanh | Số tiền tiêu chuẩn thu hồi khi hủy của máy bán hàng tự động／nội dung 6 lựa chọn lý do tạm ngưng／URL trang phỏng vấn |
| Cách xử lý thay đổi thiết bị | Đã quyết định giữ lại ở màn hình phê duyệt, site doanh nghiệp (2026/09/28 buổi sáng). Cách sửa "thay đổi thiết bị = không thể đăng ký" trong `items.py` (phương án: doanh nghiệp chỉ tham khảo, có thể đăng ký) |

## 6. Tình trạng phản ánh vào demo (2026/09/28 chiều tối)

| Tài liệu | Tình trạng |
|---|---|
| `02_デモ/11_運営_申請受付.html` (màn hình phê duyệt) | Đã phản ánh. Bảng phê duyệt có "còn ○ ngày đến hạn chốt đặt hàng", từ chối bắt buộc có lý do, quy tắc tiếp tục trong danh sách phân loại cập nhật theo 28-11 |
| `02_デモ/21_法人_申込フォーム.html` (site doanh nghiệp) | Đã phản ánh. Mức tham khảo quyết toán khi hủy hợp đồng chuyển sang cách tính theo tỷ lệ (Fukuoka = ¥150,000 × 20 ÷ 24 = ¥125,000, khớp với màn hình phê duyệt), giải thích tiếp tục thành "kế thừa phần còn lại", phán định miễn phí theo tổng giới hạn số suất hàng tháng, hiển thị đơn đăng ký bị từ chối trên trang cá nhân. Kiểm thử tuần tra cũng được cập nhật theo màn hình mới |
| `項目一覧_生成スクリプト/items.py`, Excel, Markdown, `02_デモ/12_運営_法人拠点契約.html` | Phản ánh ngày 2026/09/28 (ghi chú 6C, ngày dự kiến trả lại, giới hạn tạm ngưng, lịch sử đơn đăng ký, lý do từ chối, ngày giờ rút đơn) |
| Đặc tả DEV (bản đúng của mô hình dữ liệu) | Định nghĩa cột của bảng đơn đăng ký, chi tiết đơn đăng ký chưa phản ánh |

## 7. Chỉnh sửa được, không chỉnh sửa được của tab Thanh toán (hong trả lời chiều 2026/09/28)

Kết quả rà soát tab "Thanh toán" của chỉnh sửa thông tin doanh nghiệp, chỉnh sửa thông tin cơ sở trên Web Vận hành, Web doanh nghiệp.

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-29 | Vị trí đặt "nơi nhận hóa đơn" và "ghi đè thời gian chờ phát hành hóa đơn" của cơ sở | **Chuyển lên đầu tab Thanh toán** (di chuyển từ tab Thông tin cơ bản). Khi chọn nơi nhận hóa đơn thì các mục bên dưới là phương thức thanh toán, chu kỳ thanh toán, ID đích phát hành Bill One, ghi đè thời gian chờ sẽ được bật／tắt ngay tại chỗ |
| 28-30 | Thay đổi hàng loạt nơi nhận hóa đơn của cơ sở | Đặt **"Thay đổi hàng loạt nơi nhận hóa đơn của cơ sở" (chỉ Vận hành, không hiển thị trên Web doanh nghiệp)** bên dưới "Chi tiết nơi nhận hóa đơn (tham khảo)" của doanh nghiệp. Trong hộp thoại chọn lại Doanh nghiệp／Cơ sở này cho từng cơ sở trực thuộc và lưu một lần. Chủ sở hữu vẫn là "nơi nhận hóa đơn" của cơ sở. Hóa đơn đã phát hành giữ nguyên (28-6) |
| 28-31 | Đơn vị phát hành hóa đơn (Web doanh nghiệp) | **Doanh nghiệp chỉ tham khảo.** Cho đến khi có lối vào đơn thay đổi thông tin doanh nghiệp thì tiếp nhận qua liên hệ và Vận hành sửa (trước đây là "doanh nghiệp có thể đăng ký thay đổi, bắt buộc Vận hành phê duyệt"). Việc có bãi bỏ hay không vẫn chưa quyết |
| 28-32 | Lựa chọn phương thức thanh toán | **Giữ lại cả 3: chuyển khoản tự động／chuyển khoản ngân hàng／thẻ tín dụng** (thay đổi so với "chuyển khoản tự động／chuyển khoản ngân hàng" của 9/15) |

Các lỗi đã sửa kèm theo (không phải quyết định mà là hoạt động của demo):
- Doanh nghiệp: dù đặt phương thức thanh toán là chuyển khoản tự động nhưng không nhập được "trạng thái thủ tục chuyển khoản tự động" → chỉ nhập được khi là chuyển khoản tự động
- Cơ sở: dù đặt nơi nhận hóa đơn là "Cơ sở này" nhưng điều kiện thanh toán vẫn bị xám → chỉ nhập được khi nơi nhận hóa đơn = Cơ sở này. Trạng thái thủ tục thì còn thêm điều kiện phương thức thanh toán = chuyển khoản tự động

Tham khảo (chưa quyết, chỉ là phương án): khi thay đổi thời gian chờ phát hành hóa đơn, chỉ sửa tháng thanh toán của các hợp đồng con chưa có trong hóa đơn, phần đã có trong hóa đơn thì không đổi (cùng cách nghĩ với 28-5).

## 8. Khi Vận hành tạo hợp đồng, dùng thử và triển khai chính thức, chỉnh lý tab hợp đồng (hong trả lời chiều tối 2026/09/28)

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-33 | Khi Vận hành tạo cơ sở, hợp đồng | **Không tạo trực tiếp từ màn hình mà nhập hộ đơn đăng ký rồi đi qua tiếp nhận** (chỉ có một đường tạo). Lối vào **chỉ là "Đăng ký mới (nhập hộ)" ở tab "Hợp đồng mới" của quản lý đơn đăng ký hợp đồng**. Không đặt đăng ký mới trong danh sách cơ sở (ngoại lệ của mẫu chung của ES Kitchen "đăng ký mới trong danh sách"). Khi nhập hộ, lưu lại kênh tiếp nhận (điện thoại, kinh doanh, giấy, v.v.) và người nhập, hiển thị dấu "Nhập hộ" trong danh sách |
| 28-34 | Thời gian sử dụng tối thiểu của hợp đồng | **Không đặt ở hợp đồng.** Thời gian sử dụng tối thiểu do master dòng máy quản lý theo từng thiết bị, đếm từ ngày cho thuê của từng thiết bị (thiết bị đặt trong thời gian dùng thử thì từ ngày bắt đầu triển khai chính thức, 28-17). Đã sửa phần giải thích "ngày bắt đầu hợp đồng" của hợp đồng cha và các ô chọn "Thời gian sử dụng tối thiểu (mong muốn)" "Thời gian sử dụng tối thiểu" của tiếp nhận (bỏ ô chọn ở tiếp nhận, chỉ giữ phần tham chiếu cho phán định) |
| 28-35 | Khi có khoảng trống từ khi dùng thử hết hạn đến khi bắt đầu triển khai chính thức | **Xử lý giống tạm ngưng.** Không tạo giao hàng và hợp đồng con, đăng nhập chỉ để tham khảo, thiết bị để nguyên tại chỗ và không thu phí. Hợp đồng cha phía dùng thử là "Kết thúc" (đã thêm "Kết thúc" vào trạng thái hợp đồng) |
| 28-36 | Khi hết hạn dùng thử mà chưa có đăng ký triển khai chính thức | **Đặt ngày dự kiến trả lại (ngày hết hạn + 1 tháng)** cho thiết bị |
| 28-37 | Khi khoảng trống dài | Nếu khoảng trống **vượt quá tổng cộng 1 năm thì tiếp nhận dưới dạng đăng ký mới chứ không phải chuyển đổi** |
| 28-38 | Ô "Cách xử lý cho thuê" | **Xóa ô.** Quy tắc (cho thuê là một hạng mục trong hợp đồng gói, không phải hợp đồng độc lập, tự động hủy khi hợp đồng cha bị hủy) được chuyển vào phần giải thích của danh sách cho thuê của cơ sở |
| 28-39 | Rút gọn các hạng mục tham khảo | Gộp "tình trạng hợp đồng con" và "tự động tạo kế tiếp" thành 1 ô (phía trên danh sách, cạnh "Tạo hợp đồng con đến sau")／"Phán định thời gian sử dụng tối thiểu, tiền phạt" chỉ 1 dòng + liên kết đến danh sách cho thuê／"Chuyển đổi dùng thử, triển khai chính thức" chỉ hiển thị với hợp đồng đã trải qua dùng thử／"Hạn thanh toán (phần trả trước, phần quyết toán thực tế)" của doanh nghiệp, cơ sở gộp thành chú thích trong 1 ô |
| 28-40 | Demo màn hình quản lý Vận hành | Đưa cả **master dòng máy, master tùy chọn, master giảm giá** vào `02_デモ/10_運営_まとめ.html` (theme ES Kitchen, System admin) |

### Phương án (chưa quyết): khi Vận hành thiết lập tạm ngưng hoặc đăng ký

| Tình huống | Phương án |
|---|---|
| Đăng ký mới (điện thoại, kinh doanh, giấy) | Như 28-33: "Đăng ký mới (nhập hộ)" → tiếp nhận. Việc phát hành tài khoản cho doanh nghiệp được chọn khi đăng ký tạm |
| Tạm ngưng, tiếp tục, hủy hợp đồng, đổi gói, v.v. (nhận qua điện thoại) | **Không đổi trực tiếp trạng thái trên màn hình cơ sở, hợp đồng con.** Đặt **"Nhập hộ"** ở các tab "Thay đổi hợp đồng" và "Tạm ngưng, hủy hợp đồng" của quản lý đơn đăng ký hợp đồng, Vận hành lập đơn giống đơn trên Web doanh nghiệp và phê duyệt trên cùng màn hình phê duyệt (4 khối). Vì các thứ chạy khi phê duyệt (hủy hợp đồng con tiền nhiệm, xóa lịch giao hàng dự kiến, ngày dự kiến trả lại, phán định tiền phạt) luôn chạy theo cùng một thứ tự |
| Người phê duyệt | Cần xác nhận có tách người lập đơn và người phê duyệt không (có cho phép cùng một người tự phê duyệt không). Nếu cho phép thì lưu dấu "Nhập hộ" và kênh tiếp nhận vào lịch sử |
| Đơn trùng | Nhập hộ cũng thuộc đối tượng của 28-4 (cơ sở đang có đơn chờ phê duyệt thì không thể chọn) |
| Thông báo cho doanh nghiệp | Giống đơn trên Web doanh nghiệp, thông báo phê duyệt, từ chối theo từng cơ sở. Thêm một câu "Vận hành đã tiếp nhận thay quý khách" |
| Gấp (sát hạn chốt, v.v.) | Không tạo ngoại lệ thay đổi trực tiếp. Nếu quá hạn chốt thì tự động chuyển tháng bắt đầu sang chu kỳ kế tiếp như 28-27 |

## 9. Màn hình danh sách master (hong trả lời tối 2026/09/28)

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-41 | Danh sách master dòng máy, master tùy chọn, master giảm giá | **Thêm màn hình danh sách** (mẫu chung của ES Kitchen: danh sách + chi tiết, chỉnh sửa, đăng ký mới). Hình thức giống danh sách master kho (khu vực tìm kiếm + danh sách + cột thao tác + các nút phía trên Nhập CSV, Xuất CSV, Đăng ký mới + phân trang). Menu bên mở danh sách, chi tiết, chỉnh sửa, đăng ký mới mở từ danh sách. Xóa là xóa logic (giữ lại trong danh sách với trạng thái "Đã xóa" và không hiển thị biểu tượng chỉnh sửa, xóa). Điều kiện tìm kiếm và cột xem mục "Màn hình danh sách" của `Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá` |

Lỗi đã sửa kèm theo: các hạng mục "khi là tủ lạnh／tủ đông" của master dòng máy (nhà sản xuất, số kệ, số lượng chứa tối đa) không hiển thị ở tab nào của demo → hiển thị ở cả tab tủ lạnh và tab tủ đông.

## 10. Bổ sung danh sách và rà soát master tùy chọn (hong trả lời tối 2026/09/28)

| # | Hạng mục | Quyết định |
|---|---|---|
| 28-42 | Danh sách doanh nghiệp, cơ sở, hợp đồng | **Thêm danh sách doanh nghiệp, danh sách cơ sở, danh sách hợp đồng** (danh sách + chi tiết, chỉnh sửa của ES Kitchen). Chi tiết, chỉnh sửa dùng các màn hình hiện có (chỉnh sửa thông tin doanh nghiệp／chỉnh sửa thông tin cơ sở／danh sách hợp đồng là tab "Hợp đồng" của chỉnh sửa thông tin cơ sở). Như 28-33, **không đặt đăng ký mới**. Cũng không đặt xóa (trạng thái được thay đổi bằng trạng thái và đơn tạm ngưng, hủy hợp đồng). CSV chỉ xuất ra |
| 28-43 | Tùy chọn loại A (liên động với hạng mục hợp đồng) | **Vận hành không tự do tạo mà hệ thống định nghĩa trước cho từng hạng mục hợp đồng liên động.** Vận hành sửa được tên hiển thị, số tiền, trạng thái, v.v. Loại A không chọn được khi đăng ký mới và cũng không xóa được. Hạng mục hợp đồng liên động, điều kiện liên động là định nghĩa hệ thống (tham khảo) |
| 28-44 | Tùy chọn không liên động (B／C trước đây) | **Kiểu liên động chỉ có 2: "A liên động với hạng mục hợp đồng (định nghĩa hệ thống)／không liên động".** Việc tiếp tục hay một lần được biểu thị bằng loại phí (phí hàng tháng = tiếp tục, phí ban đầu, phí đơn lẻ = một lần) |
| 28-45 | Phiên bản phí của tùy chọn | **Không có.** Ghi đè số tiền tiêu chuẩn và quản lý trước thay đổi → sau thay đổi bằng lịch sử thay đổi (hợp đồng con đã xác nhận, đã thanh toán không thay đổi) |
| 28-46 | Danh sách áp dụng của master tùy chọn | **Không có.** Cơ sở đang áp dụng được xem ở tab "Thiết bị, tùy chọn" của cơ sở. Tên tab là "Xác nhận liên động, lịch sử" |

Lỗi đã sửa kèm theo: khi công bố dưới dạng artifact, màn hình bên trong (iframe) trở thành sandbox và không thao tác được từ khung ngoài, nên danh sách quản lý đơn đăng ký hợp đồng không hiển thị, không bấm được → đổi việc trao đổi giữa khung ngoài và màn hình bên trong sang postMessage. Mục quản lý đơn đăng ký của menu bên được đưa trở lại "Quản lý đơn đăng ký hợp đồng", và bỏ 3 màn hình tiếp nhận (lối tắt cho demo) (tiếp nhận được mở từ dòng của danh sách).


## 11. Dữ liệu demo của tùy chọn, giảm giá và hạng mục master (hong trả lời 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-47 | Phí giao hàng theo khu vực | **Không liên động.** Vì phí giao hàng khác nhau tùy công ty giao hàng ủy thác, ngay cả cùng địa chỉ cũng không cố định. Tùy chọn chỉ có 1 là "Phí giao hàng theo khu vực", số tiền tiêu chuẩn để trống, số tiền nhập theo từng cơ sở ở "Thay đổi tùy chọn, chiết khấu" của hợp đồng con (bỏ loại A liên động với tỉnh/thành) |
| 28-48 | Phí sử dụng chế độ khách | **Đăng ký là loại A (liên động với hạng mục hợp đồng "Chế độ khách").** Số tiền chưa định (cho đến khi quyết thì 0 yên) |
| 28-49 | Thanh toán vượt quá hao hụt quản lý | **Không đưa vào master tùy chọn.** Quản lý bằng flow khác |
| 28-50 | Miễn phí có điều kiện của tùy chọn | **Bỏ khỏi master tùy chọn** (đề xuất 2026/09/29. Nếu có ý kiến phản đối thì đưa trở lại). Khi muốn đưa về 0 yên theo điều kiện thì biểu thị bằng master giảm giá (đối tượng áp dụng = phí tùy chọn, thu hẹp đối tượng) và hiển thị dòng giảm giá trên hóa đơn |
| 28-51 | Giảm giá theo khối lượng | Điều kiện phán định chưa định. **Demo dùng giá trị tạm** (từ 5 cơ sở trở lên trong cùng một doanh nghiệp, 3% toàn bộ thanh toán) |
| 28-52 | Tên của giảm giá | "Phân loại chiết khấu" → "**Phân loại giảm giá**". Thêm "**Tên giảm giá (dùng quản lý)**" vào master giảm giá (cùng cách xử lý với "Tên tùy chọn (dùng quản lý)" của tùy chọn) |

Dữ liệu demo: 17 tùy chọn (loại A 3, hàng tháng, ban đầu, đơn lẻ, 0 yên, báo giá riêng, giới hạn gói áp dụng, hiển thị trên Web doanh nghiệp, phạt, kết thúc, đã xóa), 13 giảm giá (6 phân loại giảm giá, 5 đối tượng áp dụng, số tiền cố định／tỷ lệ (có giới hạn, không giới hạn)／chênh lệch tự động, không cộng dồn, ví dụ thứ tự áp dụng, thu hẹp theo đại lý／phương thức giao hàng／loại hợp đồng, hiển thị trên Web doanh nghiệp, vẫn tiếp tục áp dụng dù kết thúc, đã xóa). Chi tiết mở từ danh sách được thay thế các hạng mục chính và lịch sử, danh sách áp dụng cho khớp với dòng.

## 12. Rà soát hạng mục của tùy chọn, giảm giá (hong trả lời 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-53 | Nơi đặt phí vận chuyển, công việc | **Quản lý bằng master tùy chọn (phí đơn lẻ).** Vì được quyết định theo số máy, tòa nhà, công việc chứ không phải dòng máy. Phí giao hàng thiết bị (1 máy ¥4,800／từ 2 máy ¥7,800), phụ phí công việc cầu thang (+¥3,000) được đăng ký từ bảng tham khảo của 28-16, số tiền thực tế được sửa bằng thay đổi của hợp đồng con |
| 28-54 | Phí thu hồi của master dòng máy | **Chuyển sang "Phí thu hồi thiết bị" của master tùy chọn (phí đơn lẻ, hiện tại 0 yên).** Tiền hủy hợp đồng trong thời gian sử dụng tối thiểu vẫn là "số tiền thu hồi khi hủy" của master dòng máy |
| 28-55 | Ô chỉ dành cho loại A | Hạng mục hợp đồng liên động, điều kiện liên động, cách lấy số lượng, không khớp liên động **chỉ hiển thị với loại A** (ẩn đối với tùy chọn không liên động) |
| 28-56 | Tự động ghi nhận, có cho trùng không | **Không có.** Tự động ghi nhận được quyết định bằng kiểu liên động (A = có／không liên động = không). Có cho trùng hay không được quyết định bằng loại phí (hàng tháng = 1 cái cho 1 cơ sở, điều chỉnh bằng số lượng／đơn lẻ = bao nhiêu lần cũng được) |
| 28-57 | Loại phí | **Hai loại "phí hàng tháng (tiếp tục)" và "phí đơn lẻ (1 lần)".** Phí ban đầu được gộp vào phí đơn lẻ (cách thanh toán giống nhau). "Phí ban đầu" làm đối tượng áp dụng của giảm giá chỉ phí ban đầu của gói, thiết bị, còn phí đơn lẻ của tùy chọn được chỉ định bằng "phí tùy chọn" + tùy chọn đối tượng |
| 28-58 | Đơn vị tính phí | **Thu gọn thành "đơn vị" (cơ sở／máy／lần).** Với tùy chọn không liên động chỉ biểu thị đơn vị của số lượng. "Vượt quá 1 đơn vị" chỉ dành cho thêm số lần giao hàng loại A |
| 28-59 | Gói áp dụng của tùy chọn | **Không có.** Nếu có quy định giới hạn gói được chọn thì ghi trong ô giải thích và giữ bằng vận hành (khi cần có thể thêm sau) |
| 28-60 | "Điều kiện có hiệu lực" của giảm giá | Giảm giá không liên động (Vận hành gắn ở hợp đồng con／CSV hàng loạt). Tiêu đề là "**Thời gian áp dụng và cơ sở có thể gắn**", thu hẹp bằng "**điều kiện cơ sở có thể gắn**" (kiểm tra khi gắn) và **chỉ giữ 2 mục: mã đại lý đối tượng, hạn chế loại hợp đồng**. Bỏ course đối tượng, phương thức giao hàng đối tượng, gói đối tượng |

Phân loại tùy chọn được giữ lại làm phân loại dùng cho tìm kiếm, thứ tự sắp xếp trong danh sách và thứ tự trên hóa đơn (không dùng cho tính toán). Demo có 21 tùy chọn, 12 giảm giá (bỏ dòng giảm giá giới hạn cho chuyến COOL).

## 13. Hạng mục của màn hình tiếp nhận, trạng thái sau khi hủy hợp đồng, từ chối đăng ký mới (hong trả lời 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-61 | Nhập hạng mục thanh toán của doanh nghiệp, cơ sở ở tiếp nhận | **Nhập.** Với doanh nghiệp mới thì có 1 tab "Doanh nghiệp｜Thông tin cơ bản, Thanh toán" (ở đầu tab cơ sở 1): tên doanh nghiệp, furigana, tên doanh nghiệp (hợp đồng), tên doanh nghiệp nhận hóa đơn, địa chỉ ghi trên hóa đơn (mã bưu điện〜tòa nhà, v.v.), số điện thoại, người phụ trách doanh nghiệp, đơn vị phát hành, thời gian chờ, phương thức thanh toán, trạng thái thủ tục chuyển khoản tự động, chu kỳ thanh toán, ID đích phát hành Bill One. Cơ sở có tab "Cơ sở｜Thanh toán" (nơi nhận hóa đơn, ghi đè thời gian chờ, phương thức thanh toán, trạng thái thủ tục chuyển khoản tự động, chu kỳ thanh toán, ID đích phát hành Bill One. Bắt buộc khi nơi nhận hóa đơn = Cơ sở này, tùy chọn khi là doanh nghiệp). Nơi nhận hóa đơn được bỏ khỏi "Cơ sở｜Thông tin cơ bản" (cùng vị trí với 28-29). Doanh nghiệp hiện có (chuyển đổi) chỉ để tham khảo |
| 28-62 | Trạng thái hợp đồng sau khi phê duyệt hủy hợp đồng | Khi phê duyệt là "**Đang làm thủ tục hủy hợp đồng**", đến ngày hủy là "**Kết thúc**" |
| 28-63 | Trạng thái trong danh sách đăng ký mới | Thêm "**Từ chối**" và "**Đã rút đơn**" vào Đang tiếp nhận／Đang thiết lập hợp đồng／Hoàn tất. Màn hình tiếp nhận (xác nhận nội dung đăng ký) có nút "Từ chối" (bắt buộc có lý do, 28-25). Các dòng bị từ chối, đã rút đơn không mở màn hình tiếp nhận mà hiển thị lý do và ngày giờ |

Chỉnh lý màn hình tiếp nhận (cùng ngày): các bước thành 4 (xác nhận nội dung đăng ký→đăng ký tạm→thiết lập thông tin chi tiết→xác định (đăng ký chính thức)), không hiển thị văn bản giải thích, trạng thái của cơ sở chỉ có 2 là Đang thiết lập／Đã xác định.

## 14. Giải quyết mâu thuẫn giữa quản lý đăng ký và màn hình doanh nghiệp, cơ sở, hợp đồng (hong trả lời 2026/09/29: quyết định theo đề xuất)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-64 | "Thông tin thanh toán" ở bên phải màn hình tiếp nhận | **Không hiển thị với doanh nghiệp mới** (thống nhất vào tab "Doanh nghiệp｜Thông tin cơ bản, Thanh toán"). Doanh nghiệp hiện có (chuyển đổi) hiển thị để tham khảo |
| 28-65 | Tạm ngưng, hủy hợp đồng có đổi trạng thái cơ sở không | **Có đổi.** Tạm ngưng = "Đang tạm ngưng" từ chu kỳ bắt đầu tạm ngưng, tiếp tục = "Đăng ký chính thức" từ chu kỳ tiếp tục, hủy hợp đồng = "Dự kiến đóng" cùng lúc với phê duyệt, đến ngày hủy là "Đóng" |
| 28-66 | Cách thanh toán tiền phạt | **Lập thành dòng "phí đơn lẻ" ở ① của hợp đồng con cuối cùng của hợp đồng bị hủy** (phân loại nguồn model, theo từng thiết bị) |
| 28-67 | Cách nhập người phụ trách kinh doanh ES | **Chọn từ người dùng của Vận hành** (bỏ văn bản tự do. Giống nhau ở màn hình doanh nghiệp, nhập hộ, danh sách) |
| 28-68 | "Phân loại gia hạn" và "lý do kết thúc dùng thử" của màn hình chuyển đổi | **Bỏ** (triển khai chính thức luôn tự động gia hạn. Nếu là chuyển đổi thì lý do kết thúc cũng đã xác định) |
| 28-69 | Cách hiển thị hợp đồng con dùng thử (miễn phí) | Trạng thái thanh toán giống các hợp đồng khác (chưa xác nhận／đã xác nhận／đã thanh toán), **số tiền 0 và không hiển thị trên hóa đơn**. Không dùng các trạng thái "ngoài đối tượng thanh toán" "có hiệu lực" |

Các mâu thuẫn đã sửa kèm theo (màn hình tiếp nhận, phê duyệt): hiển thị thời gian sử dụng tối thiểu, ngày hết hạn của hợp đồng (theo từng thiết bị, trong master dòng máy), mốc đếm của thiết bị dùng thử (từ ngày bắt đầu triển khai chính thức), thiết bị đặt lại khi tiếp tục (từ ngày lắp đặt), xóa dòng ngày hết hạn của thiết bị thu hồi khi tạm ngưng, xóa kiểu liên động tùy chọn B, C và dòng thay đổi của loại A, mã master (ES-QR = OP000002, giảm giá chiến dịch lần đầu = DC000002, BX000001 = cỡ L, RF000004), phí hàng tháng của hộp vật tư thành ¥0, giao hàng thay thế = đơn lẻ của phí giao hàng thiết bị (OP000019／20), cột của bảng giá thành "Số tiền chưa thuế (yên)", hạn thanh toán là cuối tháng trước tháng chu kỳ, nơi nhận hóa đơn (doanh nghiệp／cơ sở này, tab thanh toán), loại hợp đồng "Dùng thử", tên cột (phân loại thiết bị, phân loại giao hàng, số lần giao), ghi chú giao hàng, tên phân loại người phụ trách, gộp "ngày mong muốn lắp đặt, ngày dự kiến lắp đặt" thành 1 ô. Phân loại thiết bị giống master dòng máy (tủ lạnh／tủ đông…).

## 15. Tháng chu kỳ bắt đầu của tiếp nhận, thời điểm thanh toán, hạn thanh toán (hong trả lời 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-70 | Bắt đầu hợp đồng | **Chọn tháng chu kỳ bắt đầu** (ví dụ: tháng 10 năm 2026 (A1 2026/09/28)). Ngày bắt đầu hợp đồng là phần tham chiếu tự động nhập ngày đầu tiên (A1) của tháng đó. Tiếp nhận và hợp đồng cha giống nhau |
| 28-71 | Thời gian chờ phát hành hóa đơn | **Dạng chọn: 3 tháng trước (−3)／2 tháng trước (−2)／1 tháng trước (−1)／tháng này (0)／tháng sau (+1, trả sau)**. Tháng thanh toán = tháng chu kỳ + giá trị này. Ghi đè của cơ sở dùng cùng lựa chọn + "Theo doanh nghiệp" |
| 28-72 | Hạn thanh toán | **Chọn ngày 27 của tháng thanh toán (tháng phát hành hóa đơn)／ngày 27 của tháng sau tháng thanh toán, theo nơi nhận hóa đơn (doanh nghiệp, cơ sở)**. Mỗi hóa đơn có 1 hạn. **Quy tắc cố định ngày 2026/09/25 (cuối tháng trước tháng chu kỳ, cuối tháng gửi) bị bãi bỏ** (thay thế mục 3 của `決定_請求書発行_20260925`) |
| 28-73 | Đơn vị trả trước | **Bỏ khỏi hợp đồng con.** Thanh toán một lần theo năm biểu thị bằng chu kỳ thanh toán = trả theo năm (tháng bắt đầu tính là điều kiện thanh toán của doanh nghiệp, cơ sở), trả sau biểu thị bằng thời gian chờ = tháng sau |
| 28-74 | Tùy chọn, thiết bị của đăng ký | Hiển thị "Tùy chọn (mong muốn khi đăng ký)" trong nội dung đăng ký. Thiết bị, tùy chọn của đăng ký được đưa vào bảng thay đổi ngay từ đầu dưới dạng dòng, và ở tiếp nhận có thể "Thêm dòng" "Xóa" |
| 28-75 | Hạng mục được thêm (tiếp nhận) | Doanh nghiệp: người phụ trách kinh doanh ES, hạn thanh toán, tháng bắt đầu tính (khi trả theo năm)／Cơ sở: tòa nhà, v.v., số điện thoại người phụ trách, hạn thanh toán, tháng bắt đầu tính (khi trả theo năm) |
| 28-76 | Đơn vị phát hành hóa đơn | Thiết lập **chỉ ở doanh nghiệp** (gộp các cơ sở gửi cho doanh nghiệp thành 1 bản hay theo từng cơ sở). Việc chia như cùng một doanh nghiệp có 2 cơ sở gửi cho doanh nghiệp, 1 cơ sở gửi cho cơ sở được biểu thị bằng **"nơi nhận hóa đơn" của cơ sở** |

Đã thêm "Cơ sở｜Hợp đồng (hợp đồng cha)" vào các tab bắt đầu ở trạng thái "Đã xác nhận" của tiếp nhận (vì tháng chu kỳ bắt đầu được xác nhận ở xác nhận nội dung đăng ký). Chỉ "Hợp đồng con｜Thiết bị, tùy chọn" (ngày mong muốn lắp đặt, ngày dự kiến lắp đặt) là cần lưu.
Việc hiển thị hạn thanh toán, thời gian chờ của demo Vận hành Thanh toán (15_運営_請求.html) chưa được phản ánh.

## 16. Tuyến giao hàng và tab tài liệu của cơ sở (hong chỉ thị 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-77 | Thiết lập tuyến giao hàng | **Khách hàng không thể mong muốn khi đăng ký.** Ở tab **"Hợp đồng con｜Hợp đồng" của thiết lập thông tin chi tiết** trong tiếp nhận, Vận hành thiết lập theo từng loại giao hàng: kho picking, công ty giao hàng ①, trung chuyển 1, thời gian chờ, mẫu giao hàng, chu kỳ giao hàng (trừ trung chuyển 1 đều bắt buộc. Nếu chưa thiết lập thì không lưu được tab). Số lần giao hàng là phần tham chiếu được quyết định từ số lần giao của đăng ký. Bấm "Nhập giá trị mặc định của khu vực" để nhập giá trị mặc định theo kho rồi sửa. Vì vậy "Hợp đồng con｜Hợp đồng" không bắt đầu ở trạng thái "Đã xác nhận" mà là tab cần lưu (2026/09/29 chiều: thay đổi so với phương án thiết lập ở xác nhận nội dung đăng ký) |
| 28-78 | "Giao hàng" của nội dung đăng ký | **Bỏ mẫu giao hàng, chu kỳ giao hàng khỏi nội dung đăng ký** (mong muốn của khách chỉ gồm phân loại giao hàng, số lần giao, thứ không thể giao, ghi chú giao hàng) |
| 28-79 | Tuyến giao hàng sau khi xác định | Sau khi xác định cơ sở, tuyến giao hàng ở "Hợp đồng con｜Hợp đồng" chỉ để tham khảo. Khi sửa thì sửa ở màn hình cơ sở |
| 28-80 | Chuyển từ dùng thử→triển khai chính thức | **Kế thừa** tuyến giao hàng đã thiết lập ở dùng thử và hiển thị ở "Hợp đồng con｜Hợp đồng", Vận hành xem lại |
| 28-81 | Cách nhập chu kỳ giao hàng | Dropdown (không nhập tự do). Chu kỳ ES = tuần A〜D × thứ cho số lần giao, đặc biệt = ngày N hàng tháng／ngày cuối tháng hàng tháng. Giao hàng vật tư là giao theo từng lần nên để trống |
| 28-82 | Tab Cơ sở｜Tài liệu, lịch sử | **Tự động lưu** (lưu khi thêm file. Không đặt nút lưu) |
| 28-83 | Lựa chọn công ty giao hàng ①, ② | **Toàn bộ master công ty giao hàng** (công ty vận tải, công ty giao hàng ủy thác, xe của công ty. Quyết định v2.3 #50) hiển thị chia theo phân loại. Trung chuyển 1 là toàn bộ trạm trung chuyển (HU) của master kho (bao gồm cả cơ sở của công ty giao hàng ủy thác) |
| 28-84 | Công ty giao hàng ② | Thêm cột vào thiết lập tuyến giao hàng. **Chỉ nhập, bắt buộc khi chọn trung chuyển 1**, khi không có trung chuyển thì để trống, vô hiệu hóa |
| 28-85 | Số lần giao hàng và thêm số lần giao hàng | Số lần giao hàng theo từng loại **lấy số lần của đăng ký làm giá trị ban đầu, Vận hành có thể sửa**. Phần tổng vượt quá số lần giao tiêu chuẩn của master gói thì **tùy chọn loại A "Thêm số lần giao hàng" (OP000001, ¥3,000／lần) tự động được lập ở ① của hợp đồng con** (không đưa vào bảng thay đổi). Phía dưới bảng hiển thị "Tổng／Tiêu chuẩn của gói／Số lần thêm và phí hàng tháng". Tiêu chuẩn của gói trong demo là 2 lần/tháng (tạm) cho cả ES Lite 50, ES Standard 100 |
| 28-86 | Chu kỳ giao hàng | **Chọn đúng số lần giao hàng** (2 lần thì chọn 2). Không phải dropdown mà **bấm vào bảng tuần A〜D × thứ Hai〜Chủ nhật** dưới dòng của loại giao hàng để chọn (hiển thị số đã chọn／số lần giao, không chọn vượt quá số lần, **không chọn được cột thứ không thể giao**). Đặc biệt là bảng ngày 1〜28／cuối tháng. Khi đổi mẫu giao hàng thì chọn lại |
| 28-87 | "Thêm dòng" của bảng thay đổi | Với thay đổi thiết bị, thay đổi tùy chọn, chiết khấu đều hiển thị **dòng nhập chọn từ master** (phân loại thay đổi, phân loại thiết bị→dòng máy／phân loại→mã, số tiền tự động từ master, những khoản chưa định số tiền như phí giao hàng theo khu vực thì nhập), bấm "Thêm" để thành dòng. **Dòng được thêm, xóa được phản ánh vào bảng ①, tổng, chi tiết của "Hợp đồng con｜Phí, thanh toán" và "Tùy chọn, giảm giá có hiệu lực trong tháng này"** (nếu tháng bắt đầu áp dụng sau tháng chu kỳ của hợp đồng con này thì không lập ở ①). Thêm số lần giao hàng (OP000001) khi đổi số lần giao hàng cũng được phản ánh vào ① |
| 28-88 | Giá trị ban đầu của mẫu giao hàng | Lạnh, đông lạnh bắt đầu bằng **chu kỳ ES** (vật tư vẫn là giao theo từng lần) |
| 28-89 | Cách hiển thị phí dòng máy (tiếp nhận) | Kèm **phí hàng tháng, phí ban đầu (chưa thuế)** của master dòng máy vào "Thiết bị" của xác nhận nội dung đăng ký. Thêm cột **phí hàng tháng (chưa thuế), phí ban đầu (chưa thuế)** vào bảng "Thay đổi thiết bị" (số tiền đã nhân số lượng. Thu hồi là —, đổi dòng máy không có phí ban đầu) |
| 28-90 | Thứ tự các tab của tiếp nhận | Đặt **"Hợp đồng con｜Thiết bị, tùy chọn" trước "Hợp đồng con｜Phí, thanh toán"** (quyết định thiết bị, tùy chọn rồi mới xác nhận phí). **Không hiển thị ② quyết toán thực tế** trong phí, thanh toán của tiếp nhận (vì hợp đồng con đầu tiên được lập sau kiểm kê). Bỏ cả "Tổng (① + ②, tham khảo)", chi tiết gồm ban đầu／hàng tháng／đơn lẻ／giảm giá |
| 28-91 | Số tiền của thay đổi tùy chọn, chiết khấu | **Hiển thị kèm dấu**: tùy chọn = + (thanh toán), giảm giá = − (màu đỏ). Tên cột "Số tiền, tỷ lệ (+thanh toán／−giảm giá)" |
| 28-92 | Những thứ được cho phép chỉnh sửa ở thiết lập thông tin chi tiết của tiếp nhận | Chỉnh sửa tại chỗ **bảng người phụ trách của doanh nghiệp, cơ sở** (phân loại, tên người phụ trách, furigana, email, điện thoại. Thêm, xóa. Tên người phụ trách và email là bắt buộc, có ít nhất 1 người phụ trách chính). **Trạng thái thủ tục chuyển khoản tự động** chỉ nhập khi phương thức thanh toán = chuyển khoản tự động, **tháng bắt đầu tính** chỉ nhập (bắt buộc) khi chu kỳ thanh toán = trả theo năm. **Thứ không thể giao** dùng ô checkbox (Hai〜Chủ nhật, ngày lễ), thứ đã chọn sẽ không chọn được trong bảng chu kỳ giao hàng. Giá trị đã nhập được giữ lại khi chuyển tab. Những phần giữ nguyên là tham khảo: danh sách hợp đồng con (tự động tạo), bảng phí ① (quyết định từ thay đổi và số tiền doanh nghiệp chịu), bảng cho thuê hiện có và thời gian sử dụng tối thiểu của chuyển đổi |

## 17. Những thứ chạy sau xác nhận nội dung đăng ký (đơn hàng, bộ vật tư ban đầu) và timeline dùng thử (hong chỉ thị 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-93 | Nơi quyết định kho và số lần giao hàng | **Quyết định ở xác nhận nội dung đăng ký** (kho picking, số lần giao hàng theo từng cơ sở, loại giao hàng). Vì cần để tạo đơn hàng và bộ vật tư ban đầu nên quyết định trước đăng ký tạm. Kho là bắt buộc, nếu chưa thiết lập thì không sang được "Hoàn tất xác nhận nội dung đăng ký". Số lần giao hàng lấy số lần của đăng ký làm giá trị ban đầu. **Thay đổi một phần 28-77**: ở "Hợp đồng con｜Hợp đồng" của thiết lập thông tin chi tiết chủ yếu nhập công ty giao hàng ①②, trung chuyển 1, thời gian chờ, mẫu giao hàng, chu kỳ giao hàng (kho, số lần giao hàng cũng sửa được nhưng hiển thị cảnh báo, 28-100) |
| 28-94 | Triển khai chính thức: sau xác nhận nội dung đăng ký | Khi xác nhận nội dung đăng ký xong và **phát hành tài khoản thì doanh nghiệp có thể đặt hàng (đăng ký số lượng)**. **Đơn hàng vật tư (bộ ban đầu) được tự động tạo** |
| 28-95 | Dùng thử: sau xác nhận nội dung đăng ký | **Tự động tạo đơn hàng. Số lượng được tự động tính theo tỷ lệ** để có thể nhận tất cả sản phẩm. **Đơn hàng vật tư (bộ ban đầu) cũng được tự động tạo**. Đơn hàng này **doanh nghiệp không chỉnh sửa được**. **Vận hành có thể điều chỉnh nhỏ** |
| 28-96 | Timeline dùng thử | Chỉ đăng ký dùng thử là đặc biệt, **lấy ngày chốt đặt hàng làm chuẩn thay vì hạn chốt đơn hàng** |

### Chỗ xung đột với các quyết định hiện có

| Hiện có | Điểm xung đột |
|---|---|
| Đặc tả tích hợp Quyết định v2.3 #52 (2026/09/29 bổ sung 5) | "Hợp đồng đăng ký tạm (đang thiết lập ở tiếp nhận) không thuộc đối tượng của bất kỳ job nào. Ngay sau khi xác định (đăng ký chính thức) cơ sở thì hợp đồng con→dự kiến→tạo xác nhận". Theo 28-94, 95, đơn hàng và bộ ban đầu chạy **vào thời điểm hoàn tất xác nhận nội dung đăng ký (đăng ký tạm)**. Căn theo thời điểm nào |
| Quyết định đơn đăng ký 28-77 | Đã nói toàn bộ tuyến giao hàng được thiết lập ở "Hợp đồng con｜Hợp đồng" → theo 28-93 chỉ kho, số lần giao hàng chuyển sang xác nhận nội dung đăng ký |
| Yêu cầu REQ-PO-217 | Bộ ban đầu được tự động tạo "khi hợp đồng dùng thử／mới được thành lập". Phải hiểu "thành lập" = hoàn tất xác nhận nội dung đăng ký |

### Trả lời các mục cần xác nhận (hong 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-97 | Chu kỳ đối tượng của đơn hàng triển khai chính thức | **Nhập được nếu đang trong thời gian đặt hàng của tháng chu kỳ bắt đầu.** Nếu việc hoàn tất xác nhận nội dung đăng ký đã quá hạn chốt đơn hàng của chu kỳ đó thì sửa tháng bắt đầu sang chu kỳ kế tiếp (giống 28-27) |
| 28-98 | Khi không có tài khoản | **Dùng thử**: kể cả không có tài khoản vẫn tạo đơn hàng (tự động tạo) và bộ ban đầu. **Triển khai chính thức**: kể cả cơ sở không có tài khoản, **nếu doanh nghiệp đã có tài khoản thì doanh nghiệp có thể đặt hàng**. Khi cả hai tài khoản đều không có thì theo quy tắc hiện có, đến hạn chốt sẽ thành số lượng tiêu chuẩn (giống doanh nghiệp chưa đặt hàng) |
| 28-99 | Từ chối, rút đơn khi vẫn đang đăng ký tạm | Hầu như không xảy ra nhưng có thể xảy ra. **Khi từ chối, rút đơn thì hủy đơn hàng, bộ vật tư ban đầu đã tạo** (khi thay đổi nội dung thì Vận hành sửa) |
| 28-100 | Khi đổi kho, số lần giao hàng sau đăng ký tạm | Vì liên quan đến đơn hàng nên không dùng nhiều, nhưng **cũng có thể sửa ở "Hợp đồng con｜Hợp đồng" của thiết lập thông tin chi tiết**. Khi sửa thì hiển thị nội dung "ảnh hưởng đến đơn hàng, bộ ban đầu đã tạo", Vận hành xem lại đơn hàng |
| 28-101 | Tỷ lệ số lượng của dùng thử | **Phân bổ giới hạn số suất cung cấp hàng tháng của gói cho tất cả sản phẩm.** Việc chia vào số lần giao hàng giống đặc tả của đơn hàng, **chênh lệch giữa các lần tối đa là 1** (phần lẻ cộng vào lần giao đầu tiên) |
| 28-102 | Điều chỉnh nhỏ của Vận hành | **Sửa được cả số lượng lẫn sản phẩm** (đến khi nào chưa định. Phương án: đến ngày chốt đặt hàng) |
| 28-103 | Ngày chốt đặt hàng | Dự kiến là **thứ Sáu của tuần B, D 5** (2 lần trong chu kỳ) |

### Các câu trả lời còn lại (hong 2026/09/29)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-104 | Bắt đầu dùng thử | **Nếu kịp ngày chốt đặt hàng B5 thì giao từ tuần D, nếu kịp D5 thì giao từ tuần A của chu kỳ kế tiếp.** Nếu quá ngày chốt thì xử lý theo ngày chốt đặt hàng kế tiếp |
| 28-105 | Hạn điều chỉnh nhỏ của Vận hành | **Đến ngày chốt đặt hàng** |
| 28-106 | Nội dung bộ vật tư ban đầu | **Sản phẩm của master vật tư.** Nơi định nghĩa được quyết định ở 28-129 (số lượng ở master vật tư theo số suất ăn của gói) |
| 28-107 | Giao hàng bộ vật tư ban đầu | **Thiết lập dữ liệu giao hàng ban đầu ở màn hình xác nhận nội dung đăng ký** (ngày giao hàng là bắt buộc. Kho là kho giao hàng vật tư) |
| 28-108 | Phí bộ vật tư ban đầu | **Miễn phí** (đơn hàng vật tư từ lần thứ 2 trở đi vẫn tính phí) |
| 28-109 | Sắp xếp với Đặc tả tích hợp Quyết định v2.3 #52 | **Đơn hàng và bộ vật tư ban đầu chạy ở đăng ký tạm (hoàn tất xác nhận nội dung đăng ký). Hợp đồng con, dự kiến, dữ liệu giao hàng được tạo ở đăng ký chính thức** (giữ nguyên #52). Cần chú thích vào §7 của Đặc tả tích hợp |

### Nơi định nghĩa bộ ban đầu (phương án, chưa quyết)

| Phương án | Nội dung | Phù hợp khi |
|---|---|---|
| **A (khuyến nghị)** | Thêm cột **"Số lượng bộ ban đầu" vào master vật tư** (0 = không bao gồm). Cùng 1 bộ cho tất cả cơ sở | Nội dung bộ ban đầu giống nhau ở mọi hợp đồng |
| B | Tạo master "Bộ ban đầu" riêng, giữ nội dung theo gói, phân loại giao hàng, loại hợp đồng | Nội dung thay đổi theo gói hoặc phân loại giao hàng |

Dù phương án nào, đơn hàng bộ ban đầu được tạo ở xác nhận nội dung đăng ký thì Vận hành đều sửa được số lượng (giống đơn hàng dùng thử, dự kiến đến ngày chốt đặt hàng).

Demo (2026/09/29): thêm "Thiết lập giao hàng (kho, số lần giao hàng)" vào xác nhận nội dung đăng ký (kho là bắt buộc, "Nhập kho mặc định của khu vực", hiển thị thêm số lần giao hàng). Ở tuyến giao hàng của "Hợp đồng con｜Hợp đồng", kho, số lần giao hàng chỉ để tham khảo. Màn hình hoàn tất đăng ký tạm hiển thị các dòng "Đơn hàng" theo từng cơ sở (triển khai chính thức = phát hành tài khoản thì doanh nghiệp có thể đặt hàng／dùng thử = tự động tạo, doanh nghiệp không chỉnh sửa được) và "Đơn hàng vật tư (bộ ban đầu) = tự động tạo".
Bổ sung (cùng ngày): cho phép sửa lại kho, số lần giao hàng ở tuyến giao hàng của "Hợp đồng con｜Hợp đồng", khi thay đổi thì hiển thị dưới bảng nội dung "ảnh hưởng đến đơn hàng, bộ vật tư ban đầu đã tạo" (28-100). Dòng đơn hàng của màn hình hoàn tất đăng ký tạm: nếu doanh nghiệp đã có tài khoản thì "doanh nghiệp có thể đặt hàng", nếu cả hai đều không có thì "sau khi phát hành tài khoản (nếu chưa nhập thì đến hạn chốt sẽ là số lượng tiêu chuẩn)".
Bổ sung (cùng ngày): thêm **ngày giao hàng của bộ vật tư ban đầu (miễn phí)** (bắt buộc) vào "Thiết lập giao hàng" của xác nhận nội dung đăng ký. Với dùng thử, hiển thị **timeline** (ngày chốt đặt hàng B5 → từ tuần D, D5 → từ tuần A của chu kỳ kế tiếp, điều chỉnh nhỏ đến ngày chốt đặt hàng) trên cùng thẻ. Hiển thị ngày giao hàng ở dòng bộ ban đầu của màn hình hoàn tất đăng ký tạm.

## 18. Căn chỉnh màn hình đơn đăng ký hợp đồng theo hệ thống thiết kế, quyền tham khảo (hong chỉ thị 2026/09/29 "sửa tất cả")

Đã căn chỉnh theo quy tắc của CrudPattern, PageHeader, Tabs, Modal／Dialog, SearchPanel, Badge của hệ thống thiết kế ES Kitchen (đã lấy lại bundle phiên bản 2026/09/28).

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-110 | Người dùng chỉ có quyền tham khảo | Chuẩn bị cách hiển thị **chi tiết (tham khảo)** cho màn hình đơn đăng ký hợp đồng (danh sách, tiếp nhận, phê duyệt, nhập hộ). Các ô chỉ đọc (hộp màu xám), **ẩn các nút thao tác không có quyền** (đăng ký mới, từ chối, hoàn tất xác nhận, lưu, xác định cơ sở, thêm／xóa dòng, nút giá trị mặc định, phê duyệt／từ chối). Khi mở đơn đăng ký "Đang thiết lập hợp đồng" bằng quyền chỉ tham khảo thì mở thiết lập thông tin chi tiết (tham khảo) |
| 28-111 | Vị trí đặt nút | **Bên phải page header** (bỏ thanh cố định ở cuối màn hình). Tiếp nhận: Từ chối (outline negative) + Hoàn tất xác nhận nội dung đăng ký (solid). Thiết lập thông tin chi tiết: Phát hành tài khoản (outline) + Lưu (solid). Xác định cơ sở nằm ở cột thao tác của dòng trong danh sách cơ sở. Phê duyệt: đến phê duyệt theo từng cơ sở (outline), phê duyệt, từ chối ở cột thao tác của bảng cơ sở |
| 28-112 | Tiêu đề, trạng thái | Tiêu đề là "Chi tiết đơn đăng ký" + số đơn (monospace). **Bỏ stepper**, trạng thái là Badge ở tiêu đề (Đang tiếp nhận／Đang thiết lập hợp đồng／Hoàn tất, Chờ phê duyệt…). Breadcrumb là Quản lý đơn đăng ký／Quản lý đơn đăng ký hợp đồng／Chi tiết đơn đăng ký (liên kết) |
| 28-113 | Tab của thiết lập thông tin chi tiết | **Tab gạch chân ngang, tối đa 6**: Doanh nghiệp／Cơ sở／Hợp đồng cha／Hợp đồng con／Thiết bị, tùy chọn／Phí, thanh toán (thông tin cơ bản, thanh toán, tài liệu của cơ sở được gộp vào "Cơ sở"). Tab chưa lưu hiển thị "Chưa lưu" trong khung số lượng |
| 28-114 | Cách thống nhất các thành phần | Modal dùng Modal (xác nhận nhỏ: từ chối, hủy bỏ) và Dialog (bảng, biểu mẫu: đăng ký tạm, xác định, phê duyệt). Danh sách gồm PageHeader (xuất CSV, đăng ký mới) + Tabs + SearchPanel + Table + Pagination, mở bằng liên kết ID đơn đăng ký (bỏ cột "Mở" và ô tổng hợp). Thông tin đơn đăng ký, thông tin chung là thẻ gồm các ô chỉ đọc (bỏ ô bên phải). Bắt buộc là dấu * đỏ. Màu Badge theo quy tắc DS (đăng ký tạm, dự kiến = info, đăng ký chính thức, có hiệu lực = success, đang tạm ngưng, cần xác nhận = warning, hủy hợp đồng, từ chối = negative, đã hủy hợp đồng, rút đơn = neutral) |
| 28-115 | Tab của chi tiết đơn đăng ký | Chi tiết đơn đăng ký cũng đặt tab gạch chân ngang ngay dưới page header, hiển thị từng tab một. **Tiếp nhận (xác nhận nội dung đăng ký)**: Nội dung đăng ký／Thiết lập giao hàng／Lịch bắt đầu／Thông tin chung. Nếu thiết lập giao hàng có kho, ngày giao hàng chưa nhập thì tab hiển thị "Cần nhập", khi bấm hoàn tất xác nhận thì chuyển sang tab đó. **Phê duyệt**: Nội dung đăng ký／Hạng mục được thay đổi／Những thứ chạy khi phê duyệt／Phê duyệt theo từng cơ sở (số cơ sở chờ phê duyệt). "Đến phê duyệt theo từng cơ sở" ở header sẽ chuyển sang tab đó. Khi mở lại đơn đăng ký thì quay về tab đầu tiên |
| 28-116 | Xác nhận tham khảo→chỉnh sửa và hủy bỏ | Dù có quyền chỉnh sửa, chi tiết đơn đăng ký trước tiên hiển thị ở dạng **tham khảo** (CrudPattern của DS). Các tab của thiết lập thông tin chi tiết chuyển sang ô nhập bằng "Chỉnh sửa" ở page header, và quay lại tham khảo bằng "Lưu" "Hủy". Tab "Thiết lập giao hàng" của tiếp nhận bắt đầu từ "Chỉnh sửa" ở tiêu đề thẻ. **Tab bắt buộc nhưng chưa lưu, và thiết lập giao hàng mà kho, ngày giao hàng bộ ban đầu chưa nhập thì bắt đầu ở trạng thái chỉnh sửa ngay từ khi mở**. Không đặt "Chỉnh sửa" ở tab tự động lưu (Cơ sở｜Tài liệu, lịch sử) và cơ sở đã xác định. **Khi đang chỉnh sửa mà còn thay đổi** nếu cố chuyển sang tab khác, cơ sở khác, "Xác định cơ sở này", breadcrumb (danh sách) thì hiển thị xác nhận hủy bỏ (Modal: Tiếp tục chỉnh sửa／Hủy bỏ và chuyển). Nếu không có thay đổi thì chuyển ngay. Khi Hủy mà có thay đổi cũng hiển thị xác nhận giống vậy (Hủy bỏ). Khi bấm hoàn tất xác nhận mà thiết lập giao hàng đang chỉnh sửa và đã nhập đủ thì lưu rồi tiếp tục |
| 28-117 | Người đăng ký chưa đăng nhập | Với đăng ký mới (triển khai chính thức, dùng thử) khi chưa đăng nhập, **bắt buộc nhập Họ tên, Địa chỉ email, Số điện thoại của người đang nhập (người đăng ký)** (thẻ "Người đăng ký" ở đầu "Nhập thông tin doanh nghiệp" của site doanh nghiệp. Email cũng được kiểm tra định dạng). Liên lạc xác nhận nội dung đăng ký gửi đến email này. Có thể sao chép sang người phụ trách chính của thông tin người phụ trách bằng "Đặt người này làm người phụ trách chính" (furigana nhập lại). "Thêm cơ sở" sau khi đăng nhập thì tài khoản đang đăng nhập là người đăng ký nên không hỏi. Chi tiết đơn đăng ký của Vận hành (thông tin đơn đăng ký) hiển thị Người đăng ký, Email người đăng ký, Số điện thoại người đăng ký và "Đăng ký không đăng nhập／Tài khoản đang đăng nhập" |
| 28-118 | Màn hình thanh toán của Vận hành | "Thanh toán" của Web Vận hành gồm 4 màn hình: **Điều chỉnh tồn kho／Quyết toán thực tế／Xác định thanh toán (ngày 25 hàng tháng, theo hợp đồng con. Kiểm tra trước khi chốt ở phía trên màn hình này)／Danh sách hóa đơn (+ chi tiết)**. Dashboard, danh sách thời điểm thanh toán, nhật ký thao tác của demo thanh toán là dành cho demo (không tạo ở bản chính thức). **Không nhập trạng thái nhận tiền của Bill One** nên bỏ các cột nhận tiền, còn lại, trạng thái nhận tiền của danh sách hóa đơn và việc đăng ký nhận tiền. Khi muốn chuyển hóa đơn tháng trước trở về trước sang hóa đơn tháng này để thanh toán lại, **Vận hành xác nhận trên Bill One là chưa có tiền, rồi "Ghi nhận là chưa nhận tiền" ở chi tiết hóa đơn** (đối tượng = hóa đơn đã phát hành của tháng trước trở về trước đã quá hạn thanh toán. Chuyển nguyên toàn bộ số tiền hóa đơn, đã gồm thuế). Đối tượng chuyển được Vận hành ghi nhận thủ công (xác định ở 28-122). Hạn thanh toán của demo thanh toán được căn theo 28-72 (ngày 27 của tháng thanh toán／tháng sau) |
| 28-119 | Cách chia màn hình thanh toán | Điều chỉnh tồn kho, quyết toán thực tế, xác định thanh toán, hóa đơn mỗi loại được chia thành **danh sách／chi tiết (tham khảo)／chỉnh sửa** (CrudPattern của DS). Danh sách mở chi tiết bằng liên kết ID, chỉnh sửa bằng bút chì. Chi tiết có các thao tác nghiệp vụ ở header (xác định quyết toán thực tế, xác định hợp đồng con này, phát hành bằng Bill One, hủy, ghi nhận là chưa nhận tiền) và "Chỉnh sửa", chỉnh sửa có "Hủy" "Lưu". Rời đi khi còn thay đổi thì hiển thị xác nhận hủy bỏ. Có thể chỉnh sửa: điều chỉnh tồn kho = số lượng và lý do theo từng sản phẩm (hủy phần đã đăng ký)／quyết toán thực tế = điều chỉnh giá, khai báo kiểm tra tồn kho／thanh toán = ③ Điều chỉnh (đơn lẻ, chuyển sang)／hóa đơn = chỉ tên hàng và ghi chú khi là REGISTERED. Đã xác định, đã phát hành thì không hiển thị "Chỉnh sửa". **Điều chỉnh tồn kho đổi cách hiển thị trước và sau kiểm kê của tháng này**: trước kiểm kê = chỉ tồn kho tính toán (khai báo kiểm tra lần trước + giao hàng − bán − hủy ± điều chỉnh tồn kho), sau kiểm kê = hiển thị cả khai báo kiểm tra và chênh lệch (hao hụt quản lý), cho biết khi điều chỉnh thì hao hụt quản lý (vượt miễn trách của quyết toán thực tế) thay đổi |
| 28-120 | Chuyển tháng, tìm kiếm, quản lý tồn kho | Danh sách tồn kho, quyết toán thực tế, xác định thanh toán **chọn được tháng đối tượng** (giá trị ban đầu = tháng này. Tháng quá khứ hiển thị bản ghi đã xác định chỉ để tham khảo, không hiển thị bút chì, chỉnh sửa). Danh sách hóa đơn lọc theo **tháng thanh toán (tháng phát hành)** (giá trị ban đầu = tất cả). Dự kiến trên 600 công ty nên tăng ô tìm kiếm của danh sách: tồn kho = tháng đối tượng／tên doanh nghiệp, ID doanh nghiệp／tên cơ sở, ID cơ sở／kiểm kê (trước, sau)／quyết toán thực tế (đã xác định, chưa xác định), quyết toán thực tế = tháng đối tượng／doanh nghiệp／tên cơ sở, số hợp đồng con／báo cáo kiểm kê (đã khai báo, chưa khai báo)／xác định, xác định thanh toán = tháng đối tượng／doanh nghiệp／tên cơ sở, số hợp đồng con／xác định hợp đồng con／hóa đơn (đã tạo, chưa tạo), hóa đơn = tháng thanh toán／số hóa đơn／doanh nghiệp／cơ sở／trạng thái Bill One／ghi nhận chưa nhận tiền. Menu "Điều chỉnh tồn kho" đổi thành **"Quản lý tồn kho"**, danh sách = danh sách tồn kho, chi tiết = chi tiết tồn kho (**kết quả báo cáo kiểm kê (khai báo kiểm tra tồn kho)** = trạng thái, ngày khai báo, người khai báo, phương thức khai báo, chốt, số lượng thực tế của từng sản phẩm là "khai báo kiểm tra" trong bảng), chỉnh sửa = điều chỉnh tồn kho |
| 28-121 | Thời điểm áp dụng điều chỉnh tồn kho | **Lưu xong là phản ánh ngay** (giữ nguyên như demo hiện tại). Không có đăng ký, phê duyệt. Tồn kho tính toán thay đổi ngay, nếu sau kiểm kê thì hao hụt quản lý (vượt miễn trách của quyết toán thực tế) cũng thay đổi ngay. Tháng đã xác định quyết toán thực tế thì không chỉnh sửa được. Lỗi phát hiện sau khi xác định sẽ được bù trừ bằng điều chỉnh trong quyết toán thực tế của tháng sau (hiển thị hướng dẫn đó trên màn hình) |
| 28-122 | Đối tượng chuyển sang (thanh toán lại) | **Vận hành thiết lập thủ công** ("Ghi nhận là chưa nhận tiền" ở chi tiết hóa đơn). Bỏ [tạm thời] của 28-118. Không nhập trạng thái nhận tiền của Bill One |
| 28-123 | Xác định doanh nghiệp | **Bỏ.** Xác định chỉ theo hợp đồng con. Bỏ "Xác định doanh nghiệp" khỏi màn hình xác định thanh toán và "doanh nghiệp chưa được xác định" khỏi kiểm tra trước khi chốt. Hóa đơn được tạo từ hợp đồng con đã xác định bằng "Tạo hóa đơn" ở dòng của doanh nghiệp (kiểm tra trước khi chốt là "hợp đồng con đã xác định nhưng chưa tạo hóa đơn") |
| 28-124 | Thời gian chờ phát hành hóa đơn (demo thanh toán) | Căn demo thanh toán theo lựa chọn của 28-71 (3 tháng trước (−3)／2 tháng trước (−2)／1 tháng trước (−1)／tháng này (0)／tháng sau (+1, trả sau)) |
| 28-125 | Bản ghi của tháng quá khứ | **Tồn kho, báo cáo kiểm kê, quyết toán thực tế được lưu thành snapshot theo từng tháng khi xác định quyết toán thực tế**, màn hình tháng quá khứ chỉ hiển thị để tham khảo từ snapshot đó. Mô hình dữ liệu được thêm vào Đặc tả DEV §14.13 |
| 28-126 | Điều chỉnh tồn kho hàng loạt | Vì có thể có cách vận hành nhập hàng loạt xuyên qua các cơ sở, nên đặt **"Điều chỉnh tồn kho hàng loạt" bằng cách chọn nhiều cơ sở ở danh sách tồn kho** (bảng cơ sở × sản phẩm, lý do chung, lưu xong là phản ánh ngay) |
| 28-127 | Xác định từ danh sách | **Chọn nhiều ở danh sách rồi xác định hàng loạt** (xác định quyết toán thực tế, thanh toán. Khi chọn thì hiển thị "N mục đang chọn／Xác định hàng loạt" ở cuối màn hình = SelectionBar của DS, hiển thị modal xác nhận). Bỏ "Xác định hàng loạt các mục chưa xác định" ở header |
| 28-128 | Master gói | ~~Hiện chưa thêm vào quản lý master của demo tổng hợp~~ → **Hủy bỏ theo quyết định 28-176 ngày 2026/09/30. Đã đưa vào demo** (`Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` §8) |
| 28-129 | Định nghĩa bộ vật tư ban đầu | **Phương án A: master vật tư giữ số lượng bộ ban đầu. Số lượng khác nhau theo gói (số suất ăn hàng tháng)** (bảng số lượng vật tư × gói). Vật tư có số lượng 0 không nằm trong bộ ban đầu |
| 28-130 | Dữ liệu giao hàng của bộ vật tư ban đầu | **Tạo ở đăng ký chính thức (xác định cơ sở).** Đơn hàng vật tư (bộ ban đầu) tự động tạo ở đăng ký tạm, ngày giao hàng nhập ở xác nhận nội dung đăng ký (28-107). Gắn với dữ liệu giao hàng ở đăng ký chính thức |
| 28-131 | Địa chỉ nhận email hoàn tất tiếp nhận (số tiếp nhận) | Gửi cho **cả người đăng ký và người phụ trách chính** ("Thêm cơ sở" sau khi đăng nhập là tài khoản đang đăng nhập) |
| 28-132 | Menu quản lý đơn đăng ký | Bỏ 2 cấp "Quản lý đơn đăng ký ＞ Quản lý đơn đăng ký hợp đồng", thành **1 mục "Quản lý đơn đăng ký hợp đồng"**. **Badge số lượng cần xử lý** (đăng ký mới đang tiếp nhận, đang thiết lập hợp đồng + thay đổi, tạm ngưng, hủy hợp đồng đang chờ phê duyệt, phê duyệt một phần). Breadcrumb là Quản lý đơn đăng ký hợp đồng／Chi tiết đơn đăng ký |
| 28-133 | Khi rời màn hình đơn đăng ký | Giống màn hình thanh toán, **khi đang chỉnh sửa mà còn thay đổi và rời đi bằng menu bên thì hiển thị xác nhận hủy bỏ** (thiết lập thông tin chi tiết, thiết lập giao hàng của tiếp nhận, nhập hộ) |
| 28-134 | Số tiền doanh nghiệp chịu (hỗ trợ bữa ăn) | **Số tiền doanh nghiệp chịu đã nằm trong phí của master gói.** Ở quyết toán thực tế **không thanh toán thêm** "hỗ trợ bữa ăn (số lượng bán × số tiền doanh nghiệp chịu)" (chuyển vào thanh toán tháng này = chỉ phần vượt miễn trách). Bỏ hiển thị số tiền doanh nghiệp chịu và hỗ trợ bữa ăn khỏi chi tiết quyết toán thực tế, danh sách quyết toán thực tế, ② của chi tiết thanh toán. Cũng không lập dòng riêng ở dòng phí mục ① (đã sửa cả giải thích của "Số tiền doanh nghiệp chịu (số tiền nhân viên chịu)" trong danh sách hạng mục). Giữ ô số tiền doanh nghiệp chịu của master gói. **【Thay đổi một phần theo bổ sung 2026/09/29】** Số tiền doanh nghiệp chịu (mặc định 100 yên đã gồm thuế, 1 suất) do master gói giữ, phí gói được chia thành **2 dòng** "phí cơ bản (10%)" và "phần doanh nghiệp chịu (8%)" (không phải cộng thêm mà là chia phí gói). Hợp đồng con bỏ việc chọn số tiền doanh nghiệp chịu và thành bật／tắt "áp dụng phúc lợi" (nếu bật thì hóa đơn hiển thị 2 dòng) → `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` (28-147〜153) |
| 28-135 | Số tiền nhân viên trả, thanh toán tiền mặt trên ứng dụng | **Số tiền nhân viên đã thanh toán trên ứng dụng không hiển thị trong quyết toán thực tế** (cũng bỏ cột số tiền kết quả bán hàng, ô tổng hợp). **Phần chọn thanh toán tiền mặt trên ứng dụng** thì tài xế thu. **Chỉ khi số tiền dự kiến thu và số tiền tài xế thực thu không khớp mới ghi chênh lệch (dự kiến thu − thực thu) vào quyết toán thực tế** (thiếu = thanh toán, thu nhiều = giảm. Chuyển vào thanh toán tháng này = phần vượt miễn trách + chênh lệch thu tiền mặt). Nếu khớp thì không ghi gì. Thay thế "không đưa thu tiền vào thanh toán (2026/09/23)" của Đặc tả tích hợp, DEV §13.6 |
| 28-136 | Nơi đặt điều chỉnh giá | Ở màn hình cơ sở, hợp đồng không có "Áp dụng điều chỉnh giá" (chỉ có ở hạng mục hợp đồng con), nên **thêm vào hợp đồng cha (tab "Hợp đồng" của chi tiết cơ sở)**. Nội dung gồm phân loại (không／tăng giá／giảm giá／cung cấp miễn phí (doanh nghiệp chịu)) + số tiền (đơn vị 10 yên) + **tháng bắt đầu áp dụng**. Vì là điều kiện tiếp tục theo từng cơ sở nên hợp đồng cha giữ, **sao chép khi tạo hợp đồng con**. Giá trị chọn khi đăng ký được đưa vào hợp đồng cha ở đăng ký chính thức. Khi thay đổi thì chọn tháng bắt đầu áp dụng và phản ánh vào các **hợp đồng con chưa thanh toán** từ tháng đó trở đi (hợp đồng con đã thanh toán không đổi. Chênh lệch được điều chỉnh ở quyết toán thực tế tháng sau). **Khi chỉ muốn đổi trong tháng đó thì sửa ở phía hợp đồng con**. Không đưa vào master giảm giá (như trước đây). Có thể đăng ký thay đổi, bắt buộc Vận hành phê duyệt, thông báo cho doanh nghiệp |
| 28-137 | Danh sách hợp đồng → Danh sách hợp đồng con | "Danh sách hợp đồng" từ trước đến nay là danh sách hợp đồng cha, vì hợp đồng cha có hiệu lực chỉ có 1 cho mỗi cơ sở nên các dòng gần như giống danh sách cơ sở, và nơi mở cũng là chi tiết cơ sở (tab "Hợp đồng"). **Đổi "Danh sách hợp đồng" của menu thành "Danh sách hợp đồng con"**. Liệt kê hợp đồng con của tất cả cơ sở, từ dòng (ID hợp đồng con) mở **chi tiết hợp đồng con**. Cột: ID hợp đồng con／Hợp đồng, tháng chu kỳ／Cơ sở／Doanh nghiệp trực thuộc／Loại hợp đồng／Gói／Phân loại giao hàng, số lần giao／Tháng thanh toán (trả trước)／Số tiền thanh toán tháng này／Trạng thái thanh toán (trả trước／trả sau)／Cách tạo (không hiển thị trên Web doanh nghiệp). Tìm kiếm: ID hợp đồng con, tên cơ sở, tên doanh nghiệp／tháng chu kỳ／loại hợp đồng／gói／phân loại giao hàng／trạng thái thanh toán (trả trước)／cách tạo. Vì **hợp đồng cha được tìm ở danh sách cơ sở** nên thêm cột Số hợp đồng cha, Trạng thái hợp đồng vào danh sách cơ sở, và thêm tìm kiếm theo trạng thái hợp đồng, thêm số hợp đồng cha vào tìm kiếm văn bản. Nội dung hợp đồng cha (điều chỉnh giá, v.v.) vẫn ở tab "Hợp đồng" của chi tiết cơ sở |
| 28-138 | Gộp xác định thanh toán và danh sách hóa đơn thành 1 màn hình | Gộp "Xác định thanh toán" và "Danh sách hóa đơn" của Web Vận hành thành **1 màn hình "Xác định thanh toán, hóa đơn"** (menu có 3 mục: Quản lý tồn kho／Quyết toán thực tế／Xác định thanh toán, hóa đơn. Quyết toán thực tế vẫn tách riêng). **1 khung của danh sách = 1 hóa đơn** (phát hành gộp = 1 hóa đơn cho doanh nghiệp, phát hành theo từng cơ sở, nơi nhận hóa đơn = cơ sở này = 1 hóa đơn cho cơ sở). Dòng của khung hiển thị số hóa đơn, trạng thái Bill One, số tiền thanh toán (đã gồm thuế. Chưa tạo là dự kiến, chưa thuế), hạn thanh toán, ghi nhận chưa nhận tiền, thao tác (tạo hóa đơn／phát hành bằng Bill One／tạo hóa đơn bằng các hợp đồng con còn lại), bên dưới xếp các hợp đồng con được ghi trong đó (tháng đối tượng trả trước, trả trước, trả sau, điều chỉnh, tổng, ① số tiền cố định, ② quyết toán thực tế, xác định hợp đồng con). Dù tạo hóa đơn vẫn ở lại màn hình này. Khi chuyển tháng chốt, tháng quá khứ hiển thị chỉ để tham khảo theo từng hóa đơn đã được ghi lúc xác định. Tìm kiếm: tháng chốt／số hóa đơn／doanh nghiệp／tên cơ sở, số hợp đồng con／xác định hợp đồng con／trạng thái hóa đơn (chưa tạo, REGISTERED, DISPATCHED, CARRIED, WITHDRAWN)／ghi nhận chưa nhận tiền. **Kiểm tra trước khi chốt** thống nhất từ ngữ theo hợp đồng con (hợp đồng con chưa xác định, hợp đồng con chưa xác định quyết toán thực tế, đã xác định nhưng chưa tạo hóa đơn, chưa phát hành bằng Bill One, ghi nhận chưa nhận tiền), "Hiển thị" ở mỗi dòng lọc danh sách (quyết toán thực tế thì đến màn hình quyết toán thực tế). **Hóa đơn đã ghi nhận chưa nhận tiền (chuyển sang)** hiển thị ở phía trên màn hình tháng này. Chi tiết hóa đơn vẫn là chi tiết ở phía dưới cùng màn hình, và thêm bảng **hợp đồng con được ghi**. Chi tiết thanh toán (hợp đồng con) sửa cách ghi tháng thanh toán thành phát hành 2026/08/01 = tháng thanh toán 2026-08, hiển thị hóa đơn được ghi, xóa tàn dư "xác định cơ sở" "xác định doanh nghiệp", và với hợp đồng con đã thanh toán thì không hiển thị "Hủy xác định". Sửa "tháng thanh toán kế tiếp" của tình trạng bao phủ trả trước thành tháng sau nữa. Tháng đối tượng của chi phí tức thời được giữ ở kỳ đối tượng của dòng phí mục (bỏ phần hướng dẫn trong ngoặc) |
| 28-139 | Địa chỉ nhận (email hướng dẫn đăng nhập) khi phát hành tài khoản | Khi phát hành tài khoản (khi Vận hành chọn "Phát hành tài khoản người phụ trách cơ sở" ở tiếp nhận, đăng ký tạm), gửi email hướng dẫn đăng nhập cho **tất cả người phụ trách chính, phụ, thanh toán**. **Nếu người đăng ký (người nhập biểu mẫu) không nằm trong người phụ trách thì cũng gửi cho người đăng ký**. Cùng một cơ sở mà 1 người có nhiều phân loại thì gộp thành 1 email. Gửi lại (gửi lại tài khoản) cũng cùng địa chỉ. Demo: thêm bảng "Địa chỉ nhận email hướng dẫn đăng nhập" (cơ sở, phân loại địa chỉ nhận, họ tên, email) vào modal xác nhận đăng ký tạm, dòng tài khoản của màn hình hoàn tất thành "Người phụ trách chính, phụ, thanh toán của mỗi cơ sở (5 email)". Giải thích hướng dẫn đăng nhập của site doanh nghiệp cũng cùng nội dung. Danh sách hạng mục: thêm "Địa chỉ nhận email hướng dẫn đăng nhập (tham khảo)" vào tài khoản của tab "Người phụ trách" của cơ sở |
| 28-140 | Đưa xác định thanh toán, hóa đơn vào quy trình công việc của kế toán (v1.1) | Làm lại theo góp ý (không biết thứ tự công việc, 2 cấp hóa đơn và hợp đồng con khó nhìn, quá dài theo chiều dọc, cột và thuật ngữ khó hiểu, không biết kế toán phải làm gì). **Danh sách 1 dòng = 1 hóa đơn** (cột: nơi nhận hóa đơn／xác định hợp đồng con n/m／số tiền thanh toán (trước khi tạo là dự kiến, chưa thuế, sau khi tạo là đã gồm thuế)／trạng thái／số hóa đơn／hạn thanh toán／việc cần làm tiếp theo = 1 nút). Trạng thái là "Chờ xác định hợp đồng con → Có thể tạo hóa đơn → Đã tạo, chưa phát hành → Đã phát hành (đã chuyển sang)／Đã hủy". Phía trên danh sách hiển thị **3 bước công việc tháng này** (① Xác định hợp đồng con hạn 25 → ② Tạo hóa đơn hạn 25 → ③ Phát hành bằng Bill One hạn 1 tháng sau) kèm số lượng, bấm vào thì lọc ra các hóa đơn cần xử lý ở bước đó. Bỏ bảng kiểm tra trước khi chốt, chỉ hiển thị lý do bị dừng (hợp đồng con chưa xác định quyết toán thực tế, ghi nhận chưa nhận tiền) ở phía trên. Chưa nhận tiền, chuyển sang chia thành tab. **Chi tiết hóa đơn** có 3 bước của hóa đơn đó, ① Xác định hợp đồng con (xác định theo từng hợp đồng con／xác định hàng loạt／hủy xác định), ② Chi tiết hóa đơn (trước khi tạo là dự kiến từ các hợp đồng con đã xác định), thao tác (tạo hóa đơn, phát hành bằng Bill One, chỉnh sửa chi tiết, ghi nhận chưa nhận tiền, hủy) ở page header. Cũng có thể tạo hàng loạt, phát hành hàng loạt từ danh sách. **Xác định hợp đồng con chỉ cho trả trước (số tiền cố định), điều chỉnh**, trả sau (quyết toán thực tế) thì xác định trước ở màn hình quyết toán thực tế (hợp đồng con chưa xác định quyết toán thực tế thì không xác định được). Quản lý phiên bản demo: demo đã xuất cho Dev là v1.0 (02_デモ/履歴/v1.0_20260929_DevĐầu_ra/), sau đó tăng phiên bản và ghi vào 02_デモ/デモ_更新履歴.md và "Lịch sử cập nhật" ở góc dưới bên trái của demo tích hợp |
| 28-141 | Xử lý chưa nhận tiền (v1.2) | Hệ thống không xác nhận được việc nhận tiền (không nhập trạng thái nhận tiền của Bill One, 28-118) nên **bỏ "ghi nhận chưa nhận tiền" và đổi thành "thanh toán lại ở hóa đơn tháng này" (chỉ định thanh toán lại)** (thay thế "ghi nhận là chưa nhận tiền" của 28-118, 28-122). Đặt ở chi tiết hóa đơn của hóa đơn đã phát hành tháng trước trở về trước đã quá hạn thanh toán, Vận hành **chỉ bấm khi đã xác nhận trên Bill One là chưa có tiền**. Nếu hóa đơn tháng này (cùng nơi nhận hóa đơn) đã tạo, chưa phát hành thì thêm ngay tại chỗ, nếu chưa có thì **tự động thêm khi tạo**. Nếu phần tháng này đã phát hành thì thêm vào hóa đơn tháng sau. Số tiền thêm là 1 dòng giữ nguyên toàn bộ số tiền của hóa đơn gốc, đã gồm thuế (không tính thuế lại) (tên hàng "Thanh toán lại các khoản thanh toán tháng trước trở về trước (số hóa đơn)"). Hóa đơn gốc thành "Thanh toán lại ở ◯◯" (CARRIED), nếu hủy thì quay lại như cũ. Bỏ chú ý chưa nhận tiền, tab, lọc, nhãn khỏi danh sách, nơi nhận hóa đơn có chỉ định thì hiển thị "＋Thanh toán lại ¥…" dưới số tiền thanh toán |
| 28-142 | Chênh lệch với tháng trước, xác định trả trước, nơi đặt điều chỉnh (v1.3) | Ở xác định thanh toán, **làm nổi bật các hợp đồng con có trả trước, điều chỉnh khác với tháng trước (nội dung đã xác định ở tháng chốt trước)** (nơi nhận hóa đơn của danh sách có "Thay đổi từ tháng trước n mục", lọc, tô màu dòng hợp đồng con và dòng chi tiết của chi tiết hóa đơn). Đặt **chi tiết trả trước, điều chỉnh (so sánh với tháng trước)** ở chi tiết hóa đơn, hiển thị theo từng khoản phí: phân loại (hàng tháng／trả một lần theo năm (12 tháng)／chỉ tháng này／hàng tháng (chuyển sang)／giảm giá), tháng trước, tháng này, chênh lệch, thay đổi (thêm, đổi, kết thúc) để biết tùy chọn và điều chỉnh chỉ có tháng này hay tiếp tục hàng tháng. Thủ tục có 4: **① Xác định trả sau** (màn hình quyết toán thực tế) → **② Xác định trả trước** (xác nhận chênh lệch với tháng trước, theo từng hợp đồng con) → ③ Tạo hóa đơn → ④ Phát hành bằng Bill One (thay thế 3 bước của 28-140). **Điều chỉnh (chi phí chỉ tháng này, chi phí tiếp tục hàng tháng) được đăng ký ở "③ Điều chỉnh" của chi tiết thanh toán của hợp đồng con**, từ "Thêm điều chỉnh" ở dòng hợp đồng con của chi tiết hóa đơn thì chuyển đến đó. Việc thay đổi bản thân gói, tùy chọn, thiết bị là ở hợp đồng con của doanh nghiệp, hợp đồng |
| 28-143 | Chồng lấn giữa doanh nghiệp, hợp đồng và thanh toán (v1.4) | Chia **hợp đồng = nội dung, thanh toán = số tiền**. Bỏ bảng ① số tiền cố định (trả trước), ② quyết toán thực tế (trả sau) và tóm tắt số tiền khỏi tab "Phí, thanh toán" của hợp đồng con (doanh nghiệp, hợp đồng), chỉ còn **"Số tiền thanh toán (tham khảo)" (trả trước, trả sau, điều chỉnh, tổng và xác định, trạng thái hóa đơn trong 1 dòng) và "Mở chi tiết thanh toán"**. Các hạng mục đã bỏ (dòng phí fee_line, dòng ②, tháng thanh toán, trạng thái ghi nhận, trạng thái thanh toán, người xác định, hạn thanh toán, v.v.) và thanh toán (tham khảo) ① ② của tab "Hợp đồng" được giữ làm hạng mục của **chi tiết thanh toán (xác định thanh toán, hóa đơn)** ở màn hình thanh toán (không đổi định nghĩa hạng mục). Hợp đồng con giữ lại những gì sẽ thanh toán (thay đổi gói, tùy chọn／giảm giá, thay đổi thiết bị, điều chỉnh giá, số tiền doanh nghiệp chịu, snapshot phương thức thanh toán). Số tiền, điều chỉnh, xác định, hóa đơn chỉ xử lý ở màn hình thanh toán |
| 28-144 | Ảnh hưởng của đơn thay đổi, thiết lập theo từng tháng chu kỳ, v.v. (v1.5) | **① Ảnh hưởng của đơn thay đổi**: đặt tab "Ảnh hưởng và thiết lập" ở chi tiết đơn đăng ký, hiển thị theo từng cơ sở những thứ chạy khi phê duyệt và **thiết lập cần làm trước khi phê duyệt** (thay đổi địa chỉ → kho picking, công ty vận tải, công ty giao hàng, thời gian chờ, ngày giao hàng đầu tiên đến địa chỉ mới, xác nhận lối vào/ra khi vận chuyển／thay đổi gói → số lần giao hàng, khung chu kỳ giao hàng, thay thế thiết bị và ngày vận chuyển vào／thay đổi thiết bị → ngày gửi (vận chuyển vào), công ty vận tải, ngày thu hồi, đại diện lắp đặt／thay đổi giao hàng → xác nhận tuyến giao hàng, ngày giao hàng đầu tiên／tạm ngưng → thiết bị đang tạm ngưng, ngày thu hồi, xác nhận hủy dữ liệu giao hàng đã tạo／tiếp tục → tuyến giao hàng, ngày giao hàng đầu tiên, ngày lắp đặt lại thiết bị／hủy hợp đồng → ngày giao hàng cuối cùng, ngày thu hồi thiết bị, xác nhận tiền phạt). **Cho đến khi hoàn tất thiết lập bắt buộc thì cơ sở đó không thể phê duyệt**. Chi tiết đơn đăng ký được căn cùng toàn chiều rộng như tiếp nhận (mới). **② Thiết lập sử dụng ứng dụng (người dùng dùng tiền mặt, hạn mức, chế độ khách, ES-QR), tùy chọn, giảm giá, điều chỉnh giá được giữ theo từng tháng chu kỳ = hợp đồng con** (số lần giao hàng vốn đã thuộc hợp đồng con). Bỏ "Thiết lập sử dụng ứng dụng" và "Danh sách áp dụng" của cơ sở và "Áp dụng điều chỉnh giá" (28-136) của hợp đồng cha. Khi thay đổi thì lúc lưu hợp đồng con chọn "Chỉ hợp đồng con này／Tất cả từ đây trở đi". **③** Nút chỉnh sửa, lưu của chi tiết ở bên phải tiêu đề trang. **④** Bỏ "Hóa đơn tháng này là phần của tháng nào", "Chi tiết nơi nhận hóa đơn (tham khảo)", "Nơi gửi hóa đơn (tham khảo)" của doanh nghiệp. **⑤ Quyết toán thực tế được xác định theo từng khoản (hao hụt quản lý (kiểm kê), chênh lệch thu tiền mặt, chênh lệch điều chỉnh giá)**, khi đủ 3 thì quyết toán thực tế (trả sau) được xác định (khoản không có đối tượng thì không cần xác định). **⑦** Danh sách thanh toán gồm Nơi nhận hóa đơn／Trạng thái／Số tiền thanh toán／Việc cần làm tiếp theo, chi tiết hóa đơn hiển thị "Việc cần làm tiếp theo" ở đầu, xác định hợp đồng con, so sánh với tháng trước, chi tiết hóa đơn chia thành tab. **⑧** Ở chi tiết (tham khảo) ô nhập của bảng cũng không dùng được và không hiển thị thêm, xóa dòng. **⑨ Khi Vận hành đăng ký thủ công tạm ngưng, v.v. thì từ "Nhập hộ đơn thay đổi" ở tab thay đổi hợp đồng, tạm ngưng, hủy hợp đồng của quản lý đơn đăng ký hợp đồng** (khi đăng ký thì thành đơn chờ phê duyệt và tiến hành trên cùng màn hình phê duyệt). Dải thời gian tạm ngưng chỉ cho cơ sở đang tạm ngưng, dự kiến tạm ngưng. **⑩** Bỏ các hạng mục (tham khảo) chỉ sao chép giá trị từ màn hình khác (theo dõi được bằng lịch sử thay đổi). Giữ lại các phán định được tính toán (phán định tiền phạt, v.v.). **ⅺ "Công ty giao hàng ①" của tuyến giao hàng → "Công ty vận tải" (công ty nhận ở kho), "Công ty giao hàng ②" → "Công ty giao hàng" (công ty giao đến cơ sở, mặc định là công ty vận tải)**. Nếu cùng một công ty thì không có trung chuyển (nhận ở kho rồi giao luôn), chỉ khi khác công ty mới bắt buộc trung chuyển 1 (nơi bàn giao) |
| 28-145 | Tiếp nhận đăng ký, hạng mục (tham khảo), bắt buộc của quyết toán thực tế (v1.6) | **① Thiết lập giao hàng**: "Thiết lập giao hàng" của xác nhận nội dung đăng ký bỏ bảng theo từng cơ sở và thành **1 bảng** (gộp cột cơ sở). Nội dung chỉ có kho, số lần giao hàng. **Ngày giao hàng của bộ vật tư ban đầu nhập ở tab "Hợp đồng con" của thiết lập thông tin chi tiết (dưới tuyến giao hàng) (bắt buộc)**. Đơn hàng vật tư (bộ ban đầu) vẫn tự động tạo ở đăng ký tạm (**thay đổi "quyết định ngày giao hàng ở xác nhận nội dung đăng ký" của 28-130**). **② Tài khoản**: khi chọn phát hành ở tiếp nhận, đăng ký tạm thì phát hành **tài khoản doanh nghiệp (1 cho mỗi doanh nghiệp) và tài khoản cơ sở (theo từng cơ sở)**, hướng dẫn đến tất cả người phụ trách chính, phụ, thanh toán của doanh nghiệp, cơ sở tương ứng (nếu người đăng ký không phải người phụ trách thì cũng gửi cho người đăng ký. Cùng một tài khoản mà 1 người có nhiều phân loại thì 1 email. ID đăng nhập khác thì gửi riêng). Mở rộng 28-139 đến tài khoản doanh nghiệp. **③ Hoàn tất đăng ký tạm**: doanh nghiệp và tài khoản doanh nghiệp ở trên, phía dưới là **1 dòng = 1 cơ sở** xếp cơ sở, hợp đồng cha, hợp đồng con (chu kỳ đầu tiên), đơn hàng, bộ vật tư ban đầu, tài khoản cơ sở kèm ID. **④ Thiết lập thông tin chi tiết của đăng ký cũng phản ánh 28-144**: thiết lập sử dụng ứng dụng ở tab "Hợp đồng con" (tháng chu kỳ này), tùy chọn, giảm giá ở "Tùy chọn, giảm giá (tháng chu kỳ này)", điều chỉnh giá ở "Phí, thanh toán" của hợp đồng con (tháng chu kỳ này). **⑤ Không hiển thị các hạng mục (tham khảo) trên màn hình** (cũng bỏ các (tham khảo) tính toán, phán định đã giữ ở 28-144 ⑩: phán định thời gian sử dụng tối thiểu, tiền phạt, chuyển đổi dùng thử, triển khai chính thức, tình trạng hợp đồng con, tự động tạo kế tiếp, bản ghi tạo, điều kiện kế thừa từ gói, số lần giao hàng (tổng), trạng thái thanh toán, tự động gán từ gói, mong muốn khi đăng ký, địa chỉ nhận email hướng dẫn đăng nhập). Quy tắc về địa chỉ nhận được chuyển sang giải thích "ID đăng nhập" của tài khoản. **⑥ Tab "Thiết bị, tùy chọn" của cơ sở** hiển thị bằng bảng tùy chọn, giảm giá của hợp đồng con của tháng chu kỳ hiện tại (thay đổi bằng "Thay đổi ở hợp đồng con" → tab thiết bị, tùy chọn của hợp đồng con). **⑦ Quyết toán thực tế**: các khoản (hao hụt quản lý, chênh lệch thu tiền mặt, chênh lệch điều chỉnh giá) **cả 3 đều bắt buộc**. Khoản không có đối tượng cũng xác nhận rồi xác định. **Điều chỉnh tồn kho là tùy chọn** |
| 28-146 | Chỉnh sửa doanh nghiệp, cơ sở, hợp đồng đăng ký tạm (v1.7) | **Doanh nghiệp, cơ sở, hợp đồng cha, hợp đồng con đăng ký tạm (đang giữa tiếp nhận) về cơ bản được chỉnh sửa ở chi tiết đơn đăng ký (thiết lập thông tin chi tiết) của quản lý đơn đăng ký hợp đồng.** Ở màn hình doanh nghiệp, hợp đồng (danh sách doanh nghiệp, danh sách cơ sở, danh sách hợp đồng con và các chi tiết) **chỉ tham khảo**: cột thao tác của danh sách là "Chỉnh sửa bằng đơn đăng ký" thay cho bút chì, chi tiết chỉ có "Chỉnh sửa ở chi tiết đơn đăng ký" bên phải tiêu đề (không hiển thị chỉnh sửa, xóa) và băng "Đang đăng ký tạm (đang thiết lập thông tin chi tiết của đơn đăng ký AP-…)". "Chỉnh sửa bằng đơn đăng ký" mở đơn đăng ký đó, nếu đang thiết lập hợp đồng thì bắt đầu từ thiết lập thông tin chi tiết. **Sau khi xác định cơ sở (đăng ký chính thức) thì chỉnh sửa ở màn hình doanh nghiệp, hợp đồng** |

Demo: đặt công tắc "Quyền của demo (có thể chỉnh sửa／chỉ tham khảo)" ở góc dưới bên trái của demo màn hình quản lý Vận hành. Phiên bản cũ ở 99_過去/申請画面_DS適用前_20260929/.

## 19. Các quy định chi tiết của bộ vật tư ban đầu (hong trả lời 2026/09/29)

Tiếp theo của 28-129 (master vật tư có số lượng bộ ban đầu, theo số suất ăn của gói). Hộp vật tư không đưa vào bộ ban đầu (28-160).

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-166 | Số lượng có thay đổi theo ngoài gói (course, chuyến giao hàng, dùng thử／triển khai chính thức) không | **Chưa định. Cái nào cũng có thể.** → Để dạng có thể thêm điều kiện sau (phương án bên dưới, tạm thời) |
| 28-167 | Điều chỉnh phí của gói (tròn 1〜tròn 4) có thay đổi số lượng không | **Không đổi.** Số lượng chỉ gắn với ID gói, không giữ thế hệ điều chỉnh |
| 28-168 | Khi sửa số lượng của master, đơn hàng bộ ban đầu đã tạo | **Không đổi.** Tại thời điểm đăng ký tạm, sao chép số lượng của master vào đơn hàng. Khi muốn thay đổi thì Vận hành sửa đơn hàng (đến ngày chốt đặt hàng, giống 28-105) |
| 28-169 | Vật tư có phải 1 phân loại của master sản phẩm không | **Master vật tư tồn tại riêng với master sản phẩm.** Đơn giá, thuế suất, kho xử lý, mã liên kết kho, v.v. được giữ ở các hạng mục phía master vật tư (không dùng được các ô của master sản phẩm). Chưa xác nhận hạng mục của master vật tư hiện hành |

### Phương án của 28-166 (tạm thời, chưa phản ánh)

Trong 1 dòng của bảng số lượng bộ ban đầu, ngoài gói còn có **cột điều kiện**. **Tất cả đều mặc định là "Tất cả"** nên hiện tại có thể đăng ký chỉ bằng gói, sau này nếu muốn đổi nội dung theo điều kiện thì chỉ cần thêm dòng (không phải làm lại bảng).

| Cột | Giá trị | Mặc định |
|---|---|---|
| Gói | Gói của master gói (bắt buộc) | — |
| Course | Tất cả／ES Lite／ES Standard | Tất cả |
| Chuyến giao hàng | Tất cả／Chuyến COOL／Chuyến giao hàng ES | Tất cả |
| Loại hợp đồng | Tất cả／Dùng thử／Triển khai chính thức | Tất cả |
| Số lượng | Từ 0 trở lên. 0 = không bao gồm | — |

- Cách quyết định dòng được dùng: trong các dòng cùng vật tư, cùng gói mà điều kiện khớp, dùng **dòng khớp nhiều điều kiện khác "Tất cả" nhất**. Không đăng ký được 2 dòng có cùng tổ hợp điều kiện.
- Ảnh hưởng (chưa phản ánh): thêm course, chuyến giao hàng, loại hợp đồng vào ràng buộc duy nhất `UNIQUE(material_product_id, plan_code)` của `material_initial_sets` trong DEV §4.8.

### Cần xác nhận

1. Phương án của 28-166 (có cột điều kiện) có được không.
2. Màn hình, hạng mục của master vật tư hiện hành (chụp màn hình vào `00_確認してほしい/` với tên "現行_資材マスタ_タブ名.png"). Đối chiếu xem đơn giá, thuế suất, kho xử lý, mã liên kết kho, có thể đặt hàng trên Web doanh nghiệp hay không đã có chưa.

## 20. Sửa ý nghĩa của giảm giá "Chênh lệch điều chỉnh phí" (hong góp ý 2026/09/30)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-170 | Giảm giá DC000003 "Chênh lệch điều chỉnh phí (Standard→chung)" | **Không phải chênh lệch của việc điều chỉnh sang phí chung.** Dự kiến khi khách hàng hiện có **nâng cấp từ Lite→Standard** thì **giảm giá phần chênh lệch giữa Standard và Lite để thành miễn phí** (thanh toán là số tiền giống Lite). Đổi tên thành "Chênh lệch nâng cấp lên Standard (Lite→Standard, khách hàng hiện có)", phân loại giảm giá thành "Chênh lệch nâng cấp". Cách tính vẫn là chênh lệch tự động: phí Standard − phí Lite của cùng gói (số suất ăn), cùng thế hệ điều chỉnh phí, cùng chuyến giao hàng. Thanh toán sau giảm giá là số tiền giống Lite (chênh lệch nâng cấp là miễn phí). Áp dụng hàng loạt bằng CSV cho khoảng 800 cơ sở (REQ-PM-033) cũng là giảm giá này. **Không gắn cho hợp đồng Standard mới** |

Mô tả cũ ("không tăng phân loại phí, hấp thụ chênh lệch từ phí chung bằng giảm giá", "phí chung hiện tại − phí hàng tháng trước khi chuyển", "điều chỉnh phí 2026-04") là sai. Đó là hiểu nhầm "chênh lệch giữa phí của Lite và Standard (chênh lệch giữa phí chung hiện tại và phí hàng tháng trước khi chuyển)" ở biên bản họp (Tóm tắt đặc tả master gói §7A).

### Trả lời (hong 2026/09/30)

| # | Vấn đề | Quyết định |
|---|---|---|
| 28-171 | Phạm vi "khách hàng hiện có" | **Khách hàng đã có hợp đồng trước khi phát hành chức năng này (chênh lệch nâng cấp lên Standard).** Khách hàng ký hợp đồng sau khi phát hành thì dù nâng cấp cũng không gắn |
| 28-172 | Thời gian của giảm giá | **Giảm giá cũng có loại "hàng tháng (tiếp tục)／đơn lẻ (1 lần)" giống tùy chọn.** Hàng tháng thì được lập ở ① của hợp đồng con hàng tháng trong thời gian áp dụng (không giới hạn／chỉ định số tháng), đơn lẻ thì chỉ lập 1 lần ở ① của hợp đồng con được gắn. Thêm "Loại giảm giá" vào master giảm giá. Chênh lệch nâng cấp lên Standard là **hàng tháng, không giới hạn** |
| 28-173 | Cách gắn | **Vận hành gắn thủ công** (tùy chọn, chiết khấu của hợp đồng con, hoặc CSV hàng loạt). Dù phê duyệt đơn thay đổi Lite→Standard cũng không tự động gắn. **Khách hàng (Web doanh nghiệp) không gắn, gỡ (cập nhật)** |

| 28-174 | Khi chênh lệch giữa Standard và Lite thay đổi do điều chỉnh phí | **Tự động giảm giá bằng phí "Standard − Lite".** Tính bằng phí của thế hệ điều chỉnh phí áp dụng cho hợp đồng con đó, và chốt số tiền khi tạo hợp đồng con (hợp đồng con đã xác định, đã thanh toán không đổi) |
| 28-175 | Cách xác nhận "đã có hợp đồng trước khi phát hành" | **Khách hàng hiện có được đăng ký bằng chuyển đổi dữ liệu** (khi chuyển đổi cũng gắn giảm giá này). **Ngày bắt đầu hợp đồng của hợp đồng đã chuyển đổi là ngày tại thời điểm chuyển đổi và có thể khác ngày bắt đầu thực tế**, nên không phán định đối tượng bằng ngày bắt đầu hợp đồng. Khi gắn sau chuyển đổi thì do Vận hành phán đoán (28-173) |

(2026/09/30: tất cả mục cần xác nhận của §20 đã được trả lời)

Phản ánh: danh sách hạng mục master (phân loại giảm giá, phân loại tính toán, tiêu chuẩn của chênh lệch tự động, nhập CSV hàng loạt, ứng viên đăng ký #6, §0.5, §0.7), danh sách hạng mục §0.7, demo (danh sách, chỉnh sửa master giảm giá, danh sách áp dụng của cơ sở, tùy chọn, giảm giá của hợp đồng con, quản lý cơ sở Web doanh nghiệp). Demo v1.12. 28-171〜173 được phản ánh vào danh sách hạng mục master (ô loại giảm giá, §0.5, ứng viên đăng ký) và demo master giảm giá (thời gian áp dụng của danh sách, loại giảm giá của chỉnh sửa, giải thích), demo v1.13.
