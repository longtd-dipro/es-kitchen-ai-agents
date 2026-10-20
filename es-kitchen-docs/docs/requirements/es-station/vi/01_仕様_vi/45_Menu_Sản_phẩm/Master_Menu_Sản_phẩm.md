> Bản dịch tiếng Việt của `ja/01_仕様/45_メニュー・商品/メニュー・商品マスタ.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Master Menu tháng / Sản phẩm (Vận hành)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, được viết lại mới chỉ gồm "những điều đang có hiệu lực" từ các nguồn gốc và quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (**F**・**M-2**, liên quan H・E). Nếu có mâu thuẫn thì sổ quyết định là chuẩn.
> Nguồn gốc (chỉ để xem lịch sử): Tổng hợp định nghĩa yêu cầu "Chức năng nghiệp vụ 3: Menu / Sản phẩm" các nghị đề 3-1〜3-15 (RD-MN-001〜153 · chỉ lưu local), MM 2026/10/02 §1-7・§1-8・§1-12, `00_確認してほしい/作業記録_20261003/メニュー・商品マスタ_MM要件との突合_20261003.md` (đối chiếu từng yêu cầu · local).
> Đơn hàng xem `50_Đơn_hàng/Đơn_hàng.md`, đặt hàng xem `55_Đặt_hàng_Nhập_mua_Nhập_kho/`, mẫu kinh doanh xem `75_Mẫu_kinh_doanh/`, hàng thay thế xem `65_Hàng_thay_thế/`.

## 1. Menu tháng

### 1-1. Đơn vị · Course · PDF

| # | Quy định | Căn cứ |
|---|---|---|
| 1-1 | **Mỗi tháng (tháng chu kỳ) có 1 menu.** Không chia theo course hay nhóm nhiệt độ | RD-MN-001, Sổ quyết định F |
| 1-2 | Sản phẩm hiển thị cho khách được lọc theo **course của sản phẩm** (Light = Lạnh・Nhiệt độ thường / Standard = gồm cả Đông lạnh), **kho picking của hợp đồng**, và **dòng máy bán hàng tự động (cột)** | RD-MN-003, Sổ quyết định M-2 |
| 1-3 | **Có 2 file PDF menu**: ① Dành cho Light (chỉ Lạnh) ② Dành cho Standard (trang 1 Lạnh・trang 2 Đông lạnh). Không cho khách Light xem bản dành cho Standard. PDF tối đa 5MB | RD-MN-005・006・030, Sổ quyết định F |
| 1-4 | Số lượng món tham khảo (Light 30〜40, v.v.) và cảnh báo trùng lặp trong 3 tháng gần nhất **không đưa vào hệ thống** | Sổ quyết định F |

### 1-2. Tạo / Sửa

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | **Menu mới được tạo trống** (không tự kế thừa tháng trước, không có sao chép hay mẫu). Sản phẩm của tháng trước được chọn bằng cách lọc "Menu lần trước" trong "Thêm sản phẩm" | RD-MN-012・022 |
| 2-2 | Số sản phẩm đăng ký không có giới hạn | RD-MN-011 |
| 2-3 | Mã sản phẩm, tên, ảnh, danh mục, nhà cung cấp, **giá bán** lấy từ master sản phẩm. **Không sửa được giá bán ở menu** | RD-MN-016, Sổ quyết định M-2 |
| 2-4 | Các cột của danh sách: Danh mục・Course・Kho picking・Nhà cung cấp・Thời hạn tiêu dùng ngắn (chỉ hiển thị)・Giá bán・Giá nhập・Số đơn hàng chuẩn (3 loại)・Cột máy bán hàng tự động (ngoài cùng bên phải). **Khi cuộn ngang, cố định đến cột tên sản phẩm**. Có phân trang (chọn được số dòng · mặc định là tất cả) | RD-MN-015・017・020・100・130 |
| 2-5 | Cửa sổ "Thêm sản phẩm": sản phẩm đã có trong menu được đánh dấu chọn và làm xám. Tìm kiếm thực hiện bằng "Tìm kiếm" / Enter | RD-MN-018・019 |
| 2-6 | **Thứ tự sắp xếp** thay đổi bằng kéo thả. Thứ tự này = thứ tự khi doanh nghiệp đặt hàng | RD-MN-023, Sổ quyết định M-2 |
| 2-7 | **"Số lần tiếp tục" (「継続回数」)** = hiển thị bằng số sản phẩm đó đã có mặt liên tiếp bao nhiêu tháng tính đến menu lần trước (không đếm tháng này. Lần đầu xuất hiện là 0). "Menu lần trước" = tháng xuất hiện gần nhất (thay đổi 2026/10/09・hong trả lời 2026/10/12. Trước đây: dấu "Tiếp tục" = sản phẩm có trong menu 2 tháng liên tiếp) | Sổ quyết định F |
| 2-8 | ~~Không sửa được tag NEW trên màn hình menu~~ → **NEW cũng không được đối xử đặc biệt**. Tag chỉ có 1 loại, được gắn theo từng tháng trên màn hình menu (2026-10-08) | RD-MN-103. Trước đây: NEW cố định bằng tag sản phẩm |
| 2-9 | Ngày chốt đặt hàng (Order) được giữ theo từng menu (mặc định là ngày 15 tháng trước). Ngày công khai tự động mặc định là ngày bắt đầu Order (ngày 1 tháng trước) | RD-MN-021, Sổ quyết định F |
| 2-10 | Màn hình chi tiết và màn hình chỉnh sửa là riêng biệt. Menu trước tháng trước không chỉnh sửa được. **Chỉ có màn hình chỉnh sửa mới đổi được trạng thái công khai** (màn hình chi tiết thì không) | RD-MN-035・050 |
| 2-11 | **Sau khi công khai vẫn chỉnh sửa được, sửa xong phản ánh ngay lên Web doanh nghiệp・ứng dụng** (**tuy nhiên, khi đã bắt đầu Order thì không đổi được hạn chót Order của menu đó**. Trước khi bắt đầu thì vận hành sửa được. Sổ quyết định AL・2026-10-16) (không làm chức năng đưa menu đã công khai về không công khai). **Đơn đã đặt không bị tự động viết lại** (nội dung đã sửa chỉ có hiệu lực với đơn mới và hiển thị). Thêm sản phẩm = đặt hàng được ngay / **Gỡ sản phẩm = đơn do doanh nghiệp・vận hành đăng ký (đã đăng ký・ES Kitchen đã nhập) thì giữ lại sản phẩm đã gỡ, đơn tự động・dùng thử (tự động) thì tạo lại sau khi loại sản phẩm đã gỡ** (chỉ trước khi chốt. Trước khi lưu có xác nhận "Có ○ đơn hàng chứa sản phẩm này": hiển thị riêng số đơn được giữ lại 〈đã đăng ký〉 và số đơn được tạo lại 〈đơn tự động・dùng thử (tự động)〉. Vận hành chỉ có thể giảm・đặt về 0 số lượng sản phẩm đã gỡ khi chỉnh sửa đơn, không tăng được / cũng sửa được bằng thiết lập hàng thay thế. Dòng của đơn hiển thị "Đã bị gỡ khỏi menu". Bộ lọc sản phẩm của đơn・sản phẩm lỗi của thiết lập hàng thay thế là sản phẩm của menu + sản phẩm còn lại trong đơn) / **Đổi số chuẩn = chỉ tạo lại đơn tự động theo số chuẩn mới** (dùng thử (tự động) không dùng số chuẩn 〈sổ quyết định H〉 nên được tạo lại khi sản phẩm tăng giảm. Đơn đã đăng ký・ES Kitchen đã nhập・đơn có số điều chỉnh・đã hủy thì không tạo lại. Tạo lại thì ghi vào lịch sử thay đổi). Dù lưu với tổng ≠ 50 thì đơn tự động vẫn được tạo lại bằng cách phân bổ theo tỷ lệ số chuẩn (tổng luôn là số của gói. Hộp thoại xác nhận có "Đơn tự động sẽ được tạo lại") / **Sau hạn chót đặt hàng (ngày 15 tháng trước)** thì không thêm・gỡ sản phẩm・đổi số chuẩn được (chỉ sửa được các mục hiển thị・PDF・mô tả). **Menu đang giao hàng・đã kết thúc thì không chỉnh sửa được**. **Sau khi công khai, ngày công khai・ngày bắt đầu cố định**. **Ngày chốt Order sửa được**, nhưng chỉ khi từ hôm nay trở đi và ngày chốt ban đầu chưa đến (khi kéo gần lại thì cảnh báo: vận hành quyết định có báo cho doanh nghiệp hay không) | Sổ quyết định F (#253・#255・#256・#266) |
| 2-12 | **Xóa logic** (trạng thái "Đã xóa". Không xóa dữ liệu). **Menu đang công khai thì không xóa được**. Menu đã xóa mặc định không hiển thị trong danh sách (lọc theo trạng thái thì thấy). Tạo lại được cùng năm tháng. **Menu của tháng quá khứ (tháng đã chốt Order) thì không xóa được**. **Đăng ký mới chọn được năm tháng** (chỉ tháng chưa có menu). "Xóa" sản phẩm của menu (tên nút là 「外す」 (Gỡ)) chỉ gỡ khỏi menu, vẫn còn trong master sản phẩm | RD-MN-051, Sổ quyết định F (#232・#237・#247) |

### 1-3. Công khai

| # | Quy định | Căn cứ |
|---|---|---|
| 3-1 | Trạng thái công khai: **Không công khai / Công khai / Tự động công khai** (+ Đã xóa). Công khai **dành cho doanh nghiệp** (không có công khai dành cho nhân viên). Mặc định khi lưu là không công khai. **Không có chức năng đưa menu đã công khai về không công khai** (sau khi công khai thì chỉnh sửa theo §2-11) | RD-MN-027・028・030, Sổ quyết định F (#253) |
| 3-2 | Điều kiện công khai: **có từ 1 PDF trở lên · tất cả sản phẩm "có thể công khai" · có ảnh chính · tổng số chuẩn theo từng loại là 50 · đặt hàng tạm của tháng đó đã được phê duyệt**. Không có cách công khai khi chưa đủ điều kiện. Kể cả khi lưu menu đã công khai thì **các điều kiện ngoài tổng 50** (PDF・có thể công khai・ảnh chính) vẫn được kiểm tra và chặn. Khi lưu, chỉ không chặn trường hợp tổng ≠ 50 (§4-4) | Sổ quyết định F・M-2 (#254・#265) |
| 3-3 | "Có thể công khai" là ô đánh dấu vận hành gắn cho từng sản phẩm. Có "Đặt tất cả sản phẩm là có thể công khai" để gắn hàng loạt | RD-MN-038 |
| 3-4 | Tự động công khai: đặt trước ngày, đến ngày đó nếu đủ điều kiện thì công khai. **Từ 3 ngày trước, cảnh báo lên TOP vận hành về các menu chưa đủ điều kiện** (hằng ngày. Không tăng số thông báo). **Vào ngày tự động công khai mà chưa đủ điều kiện thì không công khai**: gửi thông báo cho vận hành + cảnh báo trên dashboard, ngày hôm sau đánh giá lại | RD-MN-031・033, Sổ quyết định F・M-2 (#276) |
| 3-5 | Khi công khai thủ công sớm hoặc đặt tự động công khai thì hiển thị xác nhận | RD-MN-034 |
| 3-6 | Khi công khai thì thông báo **cho doanh nghiệp**. Nếu sửa sau khi công khai thì chỉ thông báo khi có đánh dấu chọn. Thông báo cho người dùng ứng dụng là khi sản phẩm được giao đến (Sổ quyết định M-2) | Sổ quyết định M-2 |
| 3-7 | Ngày hôm sau D7, đặt trạng thái trong danh sách vận hành là "Kết thúc" (không dùng cho hiển thị với khách・ứng dụng) | Sổ quyết định E |
| 3-8 | **Gộp xác nhận khi lưu menu đã công khai thành 1**: hiển thị cùng lúc tổng ≠ 50・sản phẩm bị gỡ・lưu ý cập nhật khi đang công khai, nút là 「更新して保存」 (Cập nhật và lưu) | Sổ quyết định F (#276) |

### 1-4. Số đơn hàng chuẩn (số chuẩn)

| # | Quy định | Căn cứ |
|---|---|---|
| 4-1 | Không có số đơn hàng tối đa. **Chỉ có số đơn hàng chuẩn**. Menu giữ theo từng tháng | RD-MN-040, Sổ quyết định M-2 |
| 4-2 | **3 loại**: Thông thường (**nhập riêng giá trị chuẩn Standard và giá trị chuẩn Light**. Thay đổi 2026/10/07. Trước đây: 1 giá trị chung cho Light・Standard. Light không hiển thị sản phẩm đông lạnh) / Không có thời hạn tiêu dùng ngắn (**loại này cũng tách Standard và Light**. 2026/10/12 sổ tiếp nhận #523) / Máy bán hàng tự động (Light (tự động)). Tất cả là **giá trị đại diện của gói 50**. Các gói khác điều chỉnh theo tỷ lệ số suất ăn | RD-MN-041, Sổ quyết định F |
| 4-3 | Sản phẩm có thời hạn tiêu dùng ngắn thì **tự động nhập 0** vào "Không có thời hạn tiêu dùng ngắn", sản phẩm không đặt được vào máy bán hàng tự động thì tự động nhập 0 vào "Máy bán hàng tự động" (sửa tay được) | RD-MN-042 |
| 4-4 | Tổng của mỗi loại theo quy định là 50. **Lưu được kể cả khi tổng không phải 50** (chỉ có hộp thoại xác nhận khi bấm lưu. Menu đã công khai cũng vậy). **Công khai thì bị chặn nếu tổng không phải 50**. Nhập CSV cũng không chặn (sau khi nhập hiển thị "Thành công ○ dòng・Thất bại ○ dòng"). Khi sửa 1 ô, các ô chưa sửa tay sẽ tự động thay đổi (CSV cũng như vậy) | Sổ quyết định F・M-2 (#248・#249・#254・#256) |
| 4-5 | Hệ thống đề xuất: ① Tỷ lệ đơn hàng của 2〜3 tháng gần nhất (sản phẩm mới lấy trung bình cùng danh mục) → ② **Điều chỉnh sao cho đơn giá nhập trung bình (gói 50) nằm trong khoảng mục tiêu** (tăng sản phẩm rẻ nhất, giảm từ sản phẩm đắt. Không động đến sản phẩm đã sửa tay · không để sản phẩm nào nhỏ hơn 1 · cảnh báo nếu không đạt · có dấu "↑n/↓n" và "Hoàn tác điều chỉnh") | Sổ quyết định F |
| 4-6 | **Mục tiêu đơn giá trung bình** được nhập ở màn hình tạo menu theo **"cận dưới〜cận trên"** (tủ lạnh và máy bán hàng tự động riêng). Giá trị ban đầu là giá trị của tháng trước. Menu đã công khai thì cố định theo giá trị lúc công khai. Bỏ màn hình riêng trong quản lý thiết lập | Sổ quyết định F |
| 4-7 | Có thể chỉ định sản phẩm・danh mục loại trừ. Máy bán hàng tự động theo từng ô・từng dòng máy (`50_Đơn_hàng/Đơn_hàng.md` §6) | Sổ quyết định H |

### 1-5. Ô mẫu kinh doanh

- Trên màn hình tạo menu có ô đánh dấu "Mẫu kinh doanh" cho từng sản phẩm và **số lượng mẫu kinh doanh của tháng đó** (mặc định 60 mẫu/tháng = 15 × 4. Có thể thêm. Sửa được đến khi công khai menu 〈chốt〉) (RD-MN-044・045). Chi tiết xem `75_Mẫu_kinh_doanh/Mẫu_kinh_doanh.md`.

### 1-6. Danh sách・Thống kê・Xuất

| # | Quy định | Căn cứ |
|---|---|---|
| 6-1 | Danh sách menu: Trạng thái công khai・Ngày bắt đầu công khai・Ngày cập nhật cuối・PDF menu・Đơn giá nhập trung bình・Số sản phẩm・Thao tác. Năm tháng chọn bằng lịch. Xuất được menu (sản phẩm) của các tháng đã đánh dấu | RD-MN-048・049・052 |
| 6-2 | Nút "Thống kê" (cố định phía trên màn hình tạo): Tổng đơn hàng (đã gồm thuế・gồm đơn hàng mặc định)・Tổng số lượng đơn hàng・Tổng số đơn hàng chuẩn・Đơn giá nhập trung bình・Theo course・Theo khung giá・Theo danh mục・Số thời hạn tiêu dùng ngắn・Số sản phẩm chưa thể công khai・Số sản phẩm mới / xuất hiện lại. Không đưa loại cột máy bán hàng tự động vào | RD-MN-056・057, Sổ quyết định E |
| 6-3 | Thống kê **chỉ có tab theo từng kho** (không đặt "Toàn bộ"). Kiểm tra tổng 50 và đơn giá trung bình cũng theo từng kho | Sổ quyết định F |
| 6-4 | Từng sản phẩm có cột "Số đơn hàng・tỷ lệ đơn hàng 3 tháng gần nhất" (sắp xếp được). Không làm màn hình riêng cho xếp hạng・phân tích | Sổ quyết định F |
| 6-5 | **Phiếu yêu cầu tạo menu**: xuất từ màn hình menu (một chiều). Các cột theo sổ quyết định F. Không làm màn hình riêng cho phiếu yêu cầu・chuyển đổi hai chiều | Sổ quyết định F |

### 1-7. Nhập CSV

| # | Quy định | Căn cứ |
|---|---|---|
| 7-1 | **Chỉ dùng template mới (chỉ định bằng mã sản phẩm).** 1 dòng = 1 sản phẩm của menu. Các cột: Năm tháng・Thứ tự hiển thị・Mã sản phẩm・Tên sản phẩm (tham khảo)・Có thể công khai・Tag sản phẩm・Số đơn hàng chuẩn Standard・Số đơn hàng chuẩn Light・Số đơn hàng chuẩn Standard không có thời hạn tiêu dùng ngắn・Số đơn hàng chuẩn Light không có thời hạn tiêu dùng ngắn・Số đơn hàng chuẩn máy bán hàng tự động・Mẫu kinh doanh (2026/10/12 thêm cột tách riêng Light. Trước đây: số đơn hàng chuẩn 1 cột). Không đọc CSV của ES cũ (menu quá khứ chỉ chuyển đổi 1 lần bằng bảo trì dữ liệu) | Sổ quyết định F, Đề xuất template (2026/10/02) |
| 7-2 | Thứ tự nhập là Master sản phẩm → Menu (mã sản phẩm không có trong master sản phẩm thì lỗi) | RD-MN-087 |
| 7-3 | Lẫn lộn năm tháng・trùng mã sản phẩm・mã sản phẩm hoặc tag không có trong master → dòng lỗi không được nhập, các dòng khác vẫn được đăng ký (theo từng dòng・sổ quyết định F #239). Tháng đó đã có menu / đang công khai → xác nhận ghi đè (đang công khai thì "thông báo lại cho doanh nghiệp"). Sản phẩm không có kho・course・sản phẩm không có ảnh → cảnh báo | RD-MN-084・085, Đề xuất template |
| 7-4 | Các quy định chung (để trống = giữ nguyên giá trị hiện tại・muốn xóa thì dùng `-`・nếu header khác thì không nhập toàn bộ) xem `Định_nghĩa_nhập_xuất_CSV_20261003.md` | Sổ quyết định F |

## 2. Master sản phẩm

| # | Quy định | Căn cứ |
|---|---|---|
| 8-1 | Tên là "Master sản phẩm". Đăng ký cả sản phẩm không có trong menu. Các tab: **Quản lý / Hiển thị / Lịch sử thay đổi** | RD-MN-063・064 |
| 8-2 | Không sửa được mã sản phẩm. Mỗi lần lưu tự động thêm lịch sử thay đổi (phân biệt nhập CSV hay người phụ trách thay đổi) | RD-MN-065・066 |
| 8-3 | **Bắt buộc ngay từ khi lưu**: thông tin cơ bản + giới thiệu sản phẩm・kho picking・course・hạn sử dụng ES・thành phần dinh dưỡng・nguyên liệu đặc định (chất gây dị ứng). **Nhà cung cấp・đơn giá nhập・lot cũng bắt buộc** (bảng nhà cung cấp bắt buộc 1 dòng. Bỏ giá trị ban đầu 0 của đơn giá nhập). Nhập CSV cũng như vậy | Sổ quyết định F (#273) |
| 8-4 | **Có 4 tên sản phẩm**: tên quản lý (nội bộ)・tên công khai (tiếng Nhật)・tên công khai (tiếng Anh)・tên dành cho nhà cung cấp | Sổ quyết định L |
| 8-5 | **Giá bán đã gồm thuế.** Thuế suất chọn từ các lựa chọn (của master ẩn chỉ dành cho quản trị hệ thống) (§8-25). "Giá niêm yết" = giá bán (màn hình vận hành là "Giá bán", màn hình đặt hàng của doanh nghiệp là "Giá niêm yết") | Sổ quyết định F・M-2 |
| 8-6 | Khi sửa giá bán của sản phẩm có trong menu đang công khai: chọn "Điều chỉnh giá (áp dụng từ menu tiếp theo)" / "Sửa lỗi sai (áp dụng ngay cho toàn bộ)" | Sổ quyết định M-2 |
| 8-7 | **Tăng đơn giá nhập thì chọn thời điểm áp dụng** rồi mới đổi. Đơn giá nhập được giữ theo từng nhà cung cấp (2026-10-08 #286: 1 sản phẩm có nhiều nhà cung cấp. Quy định cũ "Nhà cung cấp khác thì là sản phẩm khác" đã rút lại) | RD-MN-076・142 |
| 8-8 | **1 sản phẩm có thể có nhiều nhà cung cấp** (đơn giá nhập・lot theo từng nhà cung cấp. Dùng 1 công ty "Đang chọn" (『選択中』). Bắt buộc từ 1 nhà cung cấp trở lên). Không làm chức năng "tự động chọn nhà cung cấp hay dùng" | Sổ quyết định F (#286. Trước đây: 1 sản phẩm = 1 nhà cung cấp #231). Code・màn hình đã hỗ trợ (merge 2026-10-08) |
| 8-9 | Ảnh **tối đa 5 ảnh**・mỗi ảnh tối đa 5MB. Chọn ảnh hiển thị (ảnh chính) | RD-MN-068 |
| 8-10 | Mã JAN **mỗi mã 8〜13 chữ số** (không nhập được quá 13 chữ số). **1 sản phẩm có thể có nhiều mã JAN** (đầu tiên là JAN chính・**tối đa 10 mã**・cùng nhà cung cấp cũng được nhiều mã. Các JAN không được trùng nhau giữa các sản phẩm. Sổ tiếp nhận #224). **JAN của sản phẩm đã xóa cũng dùng được cho sản phẩm mới** (kiểm tra trùng không tính sản phẩm đã xóa) | RD-MN-069, Sổ quyết định F (#273・#224) |
| 8-11 | Sản phẩm có **course** (chọn nhiều được. **Không thêm được bản thân course từ màn hình**: cố định Light / Standard · khi cần thì thêm bằng phát triển 〈Sổ quyết định N〉) và **kho picking** (chọn nhiều được). **Mặc định khi đăng ký mới là "không chọn"** (không đặt "Tất cả" làm mặc định) | RD-MN-002・138, Sổ quyết định F (#273) |
| 8-12 | Hạn sử dụng: giữ riêng hạn của nhà sản xuất (viết tự do) và **hạn sử dụng ES (số ngày)**. Ghi là "Hạn dùng tốt nhất hoặc hạn tiêu dùng". **Tự động chọn phân loại thời hạn tiêu dùng ngắn từ số ngày**: từ 7 ngày trở xuống = Short, từ 30 ngày trở xuống = Semi-short, dài hơn = không thuộc đối tượng | RD-MN-074・096・097, Sổ quyết định E |
| 8-13 | Thời hạn tiêu dùng ngắn **không phải là tag sản phẩm** (là mục phân loại). Với khách chỉ hiển thị "Hạn dùng tốt nhất ngắn". Hạn sử dụng ES・thời hạn tiêu dùng ngắn thì cho doanh nghiệp xem | RD-MN-099, Sổ quyết định M-2 |
| 8-14 | **Tag sản phẩm không giữ ở master sản phẩm** (2026-10-08). Tag **chỉ có 1 loại, được gắn theo từng tháng trên màn hình menu** (NEW・Xuất hiện lại・Lạnh cũng ngon, v.v. Tag khác nhau theo tháng cũng được. Không dùng "Đề xuất"・không làm ô đánh dấu "Món cố định"). **Việc thêm・xóa tên tag cũng thực hiện trên màn hình menu** | hong trả lời 2026-10-08 (Sổ quyết định F). Trước đây: làm thành master・thêm・xóa từ dropdown của màn hình đăng ký (RD-MN-101・102・105・106, Sổ quyết định F 2026-10-05) |
| 8-15 | **Danh mục**: 7 loại (hàng trên Thịt・Cá・Món ăn kèm / hàng dưới Món chính・Món canh・"Salad・Trái cây"・"Đồ uống・Đồ ngọt") + "Tất cả" (tên cuối cùng đã được khách xác nhận・tên sửa được ở master). Sản phẩm giữ danh mục **bằng ID** (đổi tên thì sản phẩm cũng không bị tách ra). Master danh mục (tên・ID・thứ tự hiển thị・ảnh・số sản phẩm đã đăng ký). Danh mục không giữ course. Khi nhập, danh mục không có trong master thì lỗi. **Ảnh của danh mục là bắt buộc** (dòng mới của CSV cũng cần ảnh: dùng ảnh đã tải lên trước trên màn hình). **Chỉ xóa được danh mục khi số sản phẩm đã đăng ký là 0** (danh mục mà sản phẩm đã xóa đang giữ thì vẫn giữ nguyên) | RD-MN-110〜112・114, Sổ quyết định F (#233・#257・#274) |
| 8-16 | Thành phần dinh dưỡng: **nhập "trên 100g" theo khoảng (from〜to)** (giá trị ban đầu của to = from・sửa sau được・bắt buộc cả hai). Lượng nội dung là 1 con số. Nhập ở tab "Quản lý", trên tab "Hiển thị" **tự động tính trên 1 suất ăn (100g × lượng nội dung) cho từng from・to** và hiển thị (sổ tiếp nhận #223) | RD-MN-118 |
| 8-16b | Thành phần dinh dưỡng **nhập theo khoảng giá trị nhỏ nhất・lớn nhất**. Sản phẩm không có khoảng thì nhập cùng một giá trị cho cả hai. Màn hình doanh nghiệp・ứng dụng hiển thị theo khoảng, việc tính trên 100g・trên 1 suất ăn cũng theo khoảng (thêm 2026/10/07. Trước đây: 1 giá trị số). Việc vận hành nhập giá trị nhỏ nhất và lớn nhất cho tất cả sản phẩm là phía khách (青山) | MM_20261007_1301 ［00:49:36］, sổ tiếp nhận #212 |
| 8-17 | Máy bán hàng tự động: dòng máy tương thích (chọn **theo đơn vị dòng máy 〈VM…〉**. Sổ quyết định F 2026-10-07 Q11 = b A. Trước đây: Sanden / Fuji Electric・mặc định là cả hai)・cột máy bán hàng tự động (chọn từ kiểu chứa của master dòng máy. Q11 = a B). **Không đăng ký được cả Single và Double cho 1 sản phẩm** | RD-MN-123・124・129 |
| 8-18 | Vật tư đi kèm・chỉ thị đặc biệt khi xuất hàng: giữ lại. Xuất ra CSV chỉ thị xuất hàng. Không trừ tồn kho vật tư | Sổ quyết định F |
| 8-19 | URL trang chủ của nhà sản xuất: **không có** chuyển đổi hiển thị hay không (nếu đã nhập thì hiển thị). Cũng xuất ra CSV | RD-MN-071, Sổ quyết định F (#236 Q-H9) |
| 8-20 | ~~Ô đánh dấu mẫu kinh doanh~~ → **Không giữ ở master sản phẩm**. Sản phẩm dùng làm mẫu kinh doanh được **chỉ định trên màn hình menu (ô đánh dấu theo từng sản phẩm và số lượng của tháng)** (2026-10-08) | RD-MN-044. Trước đây: ô đánh dấu ở master sản phẩm |
| 8-21 | Khi ẩn sản phẩm chỉ bán một lần thì dùng **trạng thái "Vô hiệu"** (không làm chức năng lưu trữ). Sản phẩm vô hiệu mặc định không hiển thị trong danh sách・Thêm sản phẩm. Toast khi vô hiệu không có "Hoàn tác". **"Vô hiệu hóa / Kích hoạt lại" chỉ thực hiện ở ô trạng thái của màn hình chỉnh sửa, không đặt nút thao tác ở danh sách・chi tiết** | Sổ quyết định F (#275・#278), hong xác nhận lại 2026-10-09 |
| 8-22 | Danh sách: Giá bán・Tỷ suất lợi nhuận gộp・Thông tin bảo quản (hiển thị)・Danh mục・Hạn sử dụng. Không hiển thị cột JAN・nhóm nhiệt độ. Bộ lọc: Danh mục・Cách bảo quản・Nhà cung cấp・**Course** | RD-MN-004・067・078 |
| 8-23 | CSV: xuất được template. **Xuất tất cả các mục có trong hệ thống**. Dòng cùng mã sản phẩm thì ghi đè được, tên sản phẩm cũng sửa được bằng CSV. **Sản phẩm có tên giống mà mã sản phẩm khác thì không gộp, chỉ hiển thị cảnh báo và nhập thành sản phẩm riêng**. Dòng có cột ảnh để trống thì không đổi ảnh hiện tại | RD-MN-090・091, Sổ quyết định F (Q9 = A), hong xác nhận lại 2026-10-09 |
| 8-24 | **Xóa là xóa logic** (trạng thái "Đã xóa"). **Điều kiện không thể vô hiệu** là: sản phẩm có trong menu từ tháng này trở đi (đang công khai・đã chốt・đang giao hàng), có trong đơn hàng・đặt hàng chưa hoàn tất, hoặc **còn tồn kho ở cơ sở (phía doanh nghiệp)** (vì người dùng vẫn đặt hàng được・2026-10-13). Chỉ menu quá khứ và số tồn kho ở kho thì không chặn việc vô hiệu (**khi còn tồn kho ở kho thì không chặn mà hiển thị cảnh báo W323 「倉庫に在庫が残っている商品です…無効にしますか？」 (Sản phẩm còn tồn kho ở kho… Có vô hiệu không?) để chọn có tiếp tục hay không**: hong trả lời 2026-10-14・sổ quyết định AB). **Chỉ xóa được sản phẩm chưa từng được sử dụng**, sản phẩm đã được dùng ở bất kỳ menu (kể cả quá khứ)・đơn hàng・đặt hàng・bản ghi tồn kho nào thì không xóa được. Danh sách cũng hiển thị đã xóa・vô hiệu khi lọc theo trạng thái. Không hiển thị ở phần chọn sản phẩm khi tạo menu. Đã xóa thì không khôi phục được | Sổ quyết định F (Q2, 2026-10-08 「商品マスタ：無効・名前の直し・状態の変わり方」), hong xác nhận lại 2026-10-09 |
| 8-25 | **Thuế suất là master ẩn chỉ dành cho quản trị hệ thống** (thêm・sửa・xóa giá trị của dropdown). Không làm nhập・xuất CSV thuế suất | Sổ quyết định F (#234) |
| 8-26 | **Tên sản phẩm (tiếng Anh)**: bắt buộc・60 ký tự. Là tên sản phẩm dùng để hiển thị trên Web doanh nghiệp・ứng dụng cá nhân (không phải chuyện chuyển tên mục trên màn hình v.v. sang tiếng Anh). Cũng thêm cột vào CSV. Tìm kiếm theo tên sản phẩm trong lịch sử đặt hàng của Web doanh nghiệp cũng bao gồm tên tiếng Anh (Web vận hành không tìm theo tên tiếng Anh). Màn hình hiển thị sản phẩm của Web vận hành hiển thị tên quản lý và tên nhà cung cấp. Tên tiếng Anh của sản phẩm hiện có do vận hành nhập tay (không làm dữ liệu chuyển đổi). Vẫn giữ bắt buộc, sản phẩm hiện có thì nhập ở lần lưu tiếp theo | Sổ quyết định F (#235・#245・#250・#267) |
| 8-27 | Khi vai trò không có quyền mở trực tiếp URL đăng ký mới・chỉnh sửa・nhập CSV thì **quay về danh sách sản phẩm và hiển thị toast 「権限がありません」 (Không có quyền) (E32)**. Không hiển thị màn hình lỗi quyền riêng | Sổ quyết định F・P, hong xác nhận lại 2026-10-09 |

## 3. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U1 | ~~Tên cuối cùng của danh mục~~ → **Đã quyết định**: "Salad・Trái cây" "Đồ uống・Đồ ngọt" (khách đã xác nhận・2026-10-06) | Sổ quyết định F (#257) |
| U2 | ~~Cách giữ sản phẩm có 2 loại nhóm nhiệt độ~~ → **Đã quyết định**: 1 sản phẩm = 1 nhóm nhiệt độ (lạnh・thường là 1 nhóm "Lạnh・thường". Không có sản phẩm vừa đông lạnh vừa lạnh. Sổ quyết định F). Không làm cách giữ đặc biệt. Nhiệt độ trên màn hình menu・đặt hàng chỉ được quyết định bằng cách bảo quản (dùng để hiển thị) | Sổ quyết định F, sổ tiếp nhận #182 |
| U3 | Có hợp đồng chỉ Đông lạnh (chỉ menu đông lạnh) hay không | Xác nhận với khách (1005-03) |
| U4 | Tài liệu sản phẩm (đính kèm vào master sản phẩm・cảnh báo ngày cập nhật) | Không làm ở giai đoạn 2 |
| U5 | ~~Cấu trúc cột theo từng dòng máy bán hàng tự động・mục tiêu đơn giá nhập trung bình~~ → **Đã quyết định**: lựa chọn cấu trúc cột tham chiếu master dòng máy (không giữ cố định ở master sản phẩm). Khoảng mục tiêu ở màn hình tạo menu (sổ quyết định F). 【Cần xác nhận】Nguồn của lựa chọn cột (mục nào của master dòng máy) | Sổ tiếp nhận #259 |

## Lịch sử thay đổi

| Ngày họp | Đối tượng (mục・REQ) | Trước thay đổi | Sau thay đổi | Lý do thay đổi | Căn cứ (MM・thời điểm) | Trạng thái |
|---|---|---|---|---|---|---|
| 2026/10/07 | 4-2 Số đơn hàng chuẩn | Thông thường dùng chung Light・Standard | Nhập riêng giá trị chuẩn Standard và giá trị chuẩn Light | Yêu cầu của khách | 〔MM_20261007_1301 ［00:23:15〜00:25:23］〕 | Đã triển khai (3674286) |
| 2026/10/07 | 8-16b Thành phần dinh dưỡng (mới) | 1 giá trị số | Khoảng giá trị nhỏ nhất・lớn nhất | Nhà cung cấp gửi đến theo khoảng | 〔MM_20261007_1301 ［00:49:36］〕 | Chờ triển khai |
| 2026/10/09 | 2-7 Tiếp tục | Dấu "Tiếp tục" = sản phẩm có trong menu 2 tháng liên tiếp | Con số "Số lần tiếp tục" (liên tiếp bao nhiêu tháng tính đến menu lần trước). Bỏ dấu | Trong cuộc họp khách nói "nên biết là tháng thứ mấy". hong trả lời 2026/10/12 (thay dấu bằng số) | 〔MM_20261009_1200 ［03:28:38〜03:31:15］, sổ tiếp nhận #517〕 | Chờ triển khai |
