# Master Menu tháng / Sản phẩm (Vận hành)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, được viết lại mới chỉ gồm "những điều đang có hiệu lực" từ các nguồn gốc và quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (**F**・**M-2**, liên quan H・E). Nếu có mâu thuẫn thì sổ cái là chuẩn.
> Nguồn gốc (chỉ để xem lịch sử): Tổng hợp định nghĩa yêu cầu "Chức năng nghiệp vụ 3: Menu / Sản phẩm" các nghị đề 3-1〜3-15 (RD-MN-001〜153 · chỉ lưu local), MM 2026/10/02 §1-7・§1-8・§1-12, `00_確認してほしい/作業記録_20261003/メニュー・商品マスタ_MM要件との突合_20261003.md` (đối chiếu từng yêu cầu · local).
> Đơn hàng xem `50_Đơn_hàng/Đơn_hàng.md`, đặt hàng xem `55_Đặt_hàng_Nhập_mua_Nhập_kho/`, mẫu kinh doanh xem `75_Mẫu_kinh_doanh/`, hàng thay thế xem `65_Hàng_thay_thế/`.

## 1. Menu tháng

### 1-1. Đơn vị · Course · PDF

| # | Quy định | Căn cứ |
|---|---|---|
| 1-1 | **Mỗi tháng (tháng chu kỳ) có 1 menu.** Không chia theo course hay nhóm nhiệt độ | RD-MN-001, Sổ cái F |
| 1-2 | Sản phẩm hiển thị cho khách được lọc theo **course của sản phẩm** (Light = Lạnh・Nhiệt độ thường / Standard = gồm cả Đông lạnh), **kho picking của hợp đồng**, và **dòng máy bán hàng tự động (cột)** | RD-MN-003, Sổ cái M-2 |
| 1-3 | **Có 2 file PDF menu**: ① Dành cho Light (chỉ Lạnh) ② Dành cho Standard (trang 1 Lạnh・trang 2 Đông lạnh). Không cho khách Light xem bản dành cho Standard. PDF tối đa 5MB | RD-MN-005・006・030, Sổ cái F |
| 1-4 | Số lượng món tham khảo (Light 30〜40, v.v.) và cảnh báo trùng lặp trong 3 tháng gần nhất **không đưa vào hệ thống** | Sổ cái F |

### 1-2. Tạo / Sửa

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | **Menu mới được tạo trống** (không tự kế thừa tháng trước, không có sao chép hay mẫu). Sản phẩm của tháng trước được chọn bằng cách lọc "Menu lần trước" trong "Thêm sản phẩm" | RD-MN-012・022 |
| 2-2 | Số sản phẩm đăng ký không có giới hạn | RD-MN-011 |
| 2-3 | Mã sản phẩm, tên, ảnh, danh mục, nhà cung cấp, **giá bán** lấy từ master sản phẩm. **Không sửa được giá bán ở menu** | RD-MN-016, Sổ cái M-2 |
| 2-4 | Các cột của danh sách: Danh mục・Course・Mẫu kinh doanh・Kho picking・Nhà cung cấp・Tag sản phẩm・Thời hạn tiêu dùng ngắn (chỉ hiển thị)・Giá bán・Giá nhập・Số đơn hàng chuẩn (3 loại)・Cột máy bán hàng tự động (ngoài cùng bên phải). **Khi cuộn ngang, cố định đến cột tên sản phẩm**. Có phân trang (chọn được số dòng · mặc định là tất cả) | RD-MN-015・017・020・100・130 |
| 2-5 | Cửa sổ "Thêm sản phẩm": sản phẩm đã có trong menu được đánh dấu chọn và làm xám. Tìm kiếm thực hiện bằng "Tìm kiếm" / Enter | RD-MN-018・019 |
| 2-6 | **Thứ tự sắp xếp** thay đổi bằng kéo thả. Thứ tự này = thứ tự khi doanh nghiệp đặt hàng | RD-MN-023, Sổ cái M-2 |
| 2-7 | **Dấu "Tiếp tục"** = sản phẩm có trong menu 2 tháng liên tiếp. "Menu lần trước" = tháng xuất hiện gần nhất | Sổ cái F |
| 2-8 | **Không sửa được tag NEW trên màn hình menu** | RD-MN-103 |
| 2-9 | Ngày chốt đặt hàng (Order) được giữ theo từng menu (mặc định là ngày 15 tháng trước). Ngày công khai tự động mặc định là ngày bắt đầu Order (ngày 1 tháng trước) | RD-MN-021, Sổ cái F |
| 2-10 | Màn hình chi tiết và màn hình chỉnh sửa là riêng biệt. Menu trước tháng trước không chỉnh sửa được. **Chỉ có màn hình chỉnh sửa mới đổi được trạng thái công khai** (màn hình chi tiết thì không) | RD-MN-035・050 |
| 2-11 | Khi đang công khai vẫn sửa được: thêm sản phẩm・thứ tự・tag・có thể công khai・số đơn hàng chuẩn・PDF. **Sản phẩm đã có đơn hàng thì không gỡ được** (chuyển sang hàng thay thế). Sau hạn chót thì bị khóa | Sổ cái M-2 |
| 2-12 | Có thể xóa. Sau khi xóa, có thể tạo lại menu cùng năm tháng | RD-MN-051 |

### 1-3. Công khai

| # | Quy định | Căn cứ |
|---|---|---|
| 3-1 | Trạng thái công khai: **Không công khai / Công khai / Tự động công khai** (+ Đã xóa). Công khai **dành cho doanh nghiệp** (không có công khai dành cho nhân viên). Mặc định khi lưu là không công khai | RD-MN-027・028・030 |
| 3-2 | Điều kiện công khai: **tất cả sản phẩm "có thể công khai" · có PDF menu · đặt hàng tạm của tháng đó đã được phê duyệt**. Không có cách công khai khi chưa đủ điều kiện | Sổ cái M-2 |
| 3-3 | "Có thể công khai" là ô đánh dấu vận hành gắn cho từng sản phẩm. Có "Đặt tất cả sản phẩm là có thể công khai" để gắn hàng loạt | RD-MN-038 |
| 3-4 | Tự động công khai: đặt trước ngày, đến ngày đó nếu đủ điều kiện thì công khai. **Từ 3 ngày trước, cảnh báo lên TOP vận hành về các menu chưa đủ điều kiện** (hằng ngày. Không tăng số thông báo) | RD-MN-031・033, Sổ cái F・M-2 |
| 3-5 | Khi công khai thủ công sớm hoặc đặt tự động công khai thì hiển thị xác nhận | RD-MN-034 |
| 3-6 | Khi công khai thì thông báo **cho doanh nghiệp**. Nếu sửa sau khi công khai thì chỉ thông báo khi có đánh dấu chọn. Thông báo cho người dùng ứng dụng là khi sản phẩm được giao đến (Sổ cái M-2) | Sổ cái M-2 |
| 3-7 | Ngày hôm sau D7, đặt trạng thái trong danh sách vận hành là "Kết thúc" (không dùng cho hiển thị với khách・ứng dụng) | Sổ cái E |

### 1-4. Số đơn hàng chuẩn (số chuẩn)

| # | Quy định | Căn cứ |
|---|---|---|
| 4-1 | Không có số đơn hàng tối đa. **Chỉ có số đơn hàng chuẩn**. Menu giữ theo từng tháng | RD-MN-040, Sổ cái M-2 |
| 4-2 | **3 loại**: Thông thường (Light・Standard) / Không có thời hạn tiêu dùng ngắn / Máy bán hàng tự động (Light (tự động)). Tất cả là **giá trị đại diện của gói 50**. Các gói khác điều chỉnh theo tỷ lệ số suất ăn | RD-MN-041, Sổ cái F |
| 4-3 | Sản phẩm có thời hạn tiêu dùng ngắn thì **tự động nhập 0** vào "Không có thời hạn tiêu dùng ngắn", sản phẩm không đặt được vào máy bán hàng tự động thì tự động nhập 0 vào "Máy bán hàng tự động" (sửa tay được) | RD-MN-042 |
| 4-4 | **Mỗi loại phải có tổng = 50 mới lưu được.** Khi sửa 1 ô, các ô chưa sửa tay sẽ tự động thay đổi (CSV cũng như vậy) | Sổ cái M-2 |
| 4-5 | Hệ thống đề xuất: ① Tỷ lệ đơn hàng của 2〜3 tháng gần nhất (sản phẩm mới lấy trung bình cùng danh mục) → ② **Điều chỉnh sao cho đơn giá nhập trung bình (gói 50) nằm trong khoảng mục tiêu** (tăng sản phẩm rẻ nhất, giảm từ sản phẩm đắt. Không động đến sản phẩm đã sửa tay · không để sản phẩm nào nhỏ hơn 1 · cảnh báo nếu không đạt · có dấu "↑n/↓n" và "Hoàn tác điều chỉnh") | Sổ cái F |
| 4-6 | **Mục tiêu đơn giá trung bình** được nhập ở màn hình tạo menu theo **"cận dưới〜cận trên"** (tủ lạnh và máy bán hàng tự động riêng). Giá trị ban đầu là giá trị của tháng trước. Menu đã công khai thì cố định theo giá trị lúc công khai. Bỏ màn hình riêng trong quản lý thiết lập | Sổ cái F |
| 4-7 | Có thể chỉ định sản phẩm・danh mục loại trừ. Máy bán hàng tự động theo từng ô・từng dòng máy (`50_Đơn_hàng/Đơn_hàng.md` §6) | Sổ cái H |

### 1-5. Ô mẫu kinh doanh

- Trên màn hình tạo menu có ô đánh dấu "Mẫu kinh doanh" cho từng sản phẩm và **số lượng mẫu kinh doanh của tháng đó** (mặc định 60 mẫu/tháng = 15 × 4. Có thể thêm. Sửa được đến khi công khai menu 〈chốt〉) (RD-MN-044・045). Chi tiết xem `75_Mẫu_kinh_doanh/Mẫu_kinh_doanh.md`.

### 1-6. Danh sách・Thống kê・Xuất

| # | Quy định | Căn cứ |
|---|---|---|
| 6-1 | Danh sách menu: Trạng thái công khai・Ngày bắt đầu công khai・Ngày cập nhật cuối・PDF menu・Đơn giá nhập trung bình・Số sản phẩm・Thao tác. Năm tháng chọn bằng lịch. Xuất được menu (sản phẩm) của các tháng đã đánh dấu | RD-MN-048・049・052 |
| 6-2 | Nút "Thống kê" (cố định phía trên màn hình tạo): Tổng đơn hàng (đã gồm thuế・gồm đơn hàng mặc định)・Tổng số lượng đơn hàng・Tổng số đơn hàng chuẩn・Đơn giá nhập trung bình・Theo course・Theo khung giá・Theo danh mục・Số thời hạn tiêu dùng ngắn・Số sản phẩm chưa thể công khai・Số sản phẩm mới / xuất hiện lại. Không đưa loại cột máy bán hàng tự động vào | RD-MN-056・057, Sổ cái E |
| 6-3 | Thống kê **chỉ có tab theo từng kho** (không đặt "Toàn bộ"). Kiểm tra tổng 50 và đơn giá trung bình cũng theo từng kho | Sổ cái F |
| 6-4 | Từng sản phẩm có cột "Số đơn hàng・tỷ lệ đơn hàng 3 tháng gần nhất" (sắp xếp được). Không làm màn hình riêng cho xếp hạng・phân tích | Sổ cái F |
| 6-5 | **Phiếu yêu cầu tạo menu**: xuất từ màn hình menu (một chiều). Các cột theo sổ cái F. Không làm màn hình riêng cho phiếu yêu cầu・chuyển đổi hai chiều | Sổ cái F |

### 1-7. Nhập CSV

| # | Quy định | Căn cứ |
|---|---|---|
| 7-1 | **Chỉ dùng template mới (chỉ định bằng mã sản phẩm).** 1 dòng = 1 sản phẩm của menu. Các cột: Năm tháng・Thứ tự hiển thị・Mã sản phẩm・Tên sản phẩm (tham khảo)・Có thể công khai・Tag sản phẩm・Số đơn hàng chuẩn・Số đơn hàng chuẩn không có thời hạn tiêu dùng ngắn・Số đơn hàng chuẩn máy bán hàng tự động・Mẫu kinh doanh・Ghi chú. Không đọc CSV của ES cũ (menu quá khứ chỉ chuyển đổi 1 lần bằng bảo trì dữ liệu) | Sổ cái F, Đề xuất template (2026/10/02) |
| 7-2 | Thứ tự nhập là Master sản phẩm → Menu (mã sản phẩm không có trong master sản phẩm thì lỗi) | RD-MN-087 |
| 7-3 | Lẫn lộn năm tháng・trùng mã sản phẩm・mã sản phẩm hoặc tag không có trong master → hiển thị các dòng lỗi và không nhập. Tháng đó đã có menu / đang công khai → xác nhận ghi đè (đang công khai thì "thông báo lại cho doanh nghiệp"). Sản phẩm không có kho・course・sản phẩm không có ảnh → cảnh báo | RD-MN-084・085, Đề xuất template |
| 7-4 | Các quy định chung (để trống = giữ nguyên giá trị hiện tại・muốn xóa thì dùng `-`・nếu header khác thì không nhập toàn bộ) xem `Định_nghĩa_nhập_xuất_CSV_20261003.md` | Sổ cái F |

## 2. Master sản phẩm

| # | Quy định | Căn cứ |
|---|---|---|
| 8-1 | Tên là "Master sản phẩm". Đăng ký cả sản phẩm không có trong menu. Các tab: **Quản lý / Hiển thị / Lịch sử thay đổi** | RD-MN-063・064 |
| 8-2 | Không sửa được mã sản phẩm. Mỗi lần lưu tự động thêm lịch sử thay đổi (phân biệt nhập CSV hay người phụ trách thay đổi) | RD-MN-065・066 |
| 8-3 | **Bắt buộc ngay từ khi lưu**: thông tin cơ bản + giới thiệu sản phẩm・kho picking・course・hạn sử dụng ES・thành phần dinh dưỡng・nguyên liệu đặc định (chất gây dị ứng). Nhập CSV cũng như vậy | Sổ cái F |
| 8-4 | **Có 4 tên sản phẩm**: tên quản lý (nội bộ)・tên công khai (tiếng Nhật)・tên công khai (tiếng Anh)・tên dành cho nhà cung cấp | Sổ cái L |
| 8-5 | **Giá bán đã gồm thuế.** Thuế suất chọn từ master thuế suất. "Giá niêm yết" = giá bán (màn hình vận hành là "Giá bán", màn hình đặt hàng của doanh nghiệp là "Giá niêm yết") | Sổ cái F・M-2 |
| 8-6 | Khi sửa giá bán của sản phẩm có trong menu đang công khai: chọn "Điều chỉnh giá (áp dụng từ menu tiếp theo)" / "Sửa lỗi sai (áp dụng ngay cho toàn bộ)" | Sổ cái M-2 |
| 8-7 | **Tăng đơn giá nhập thì chọn thời điểm áp dụng** rồi mới đổi. Nhà cung cấp khác thì là sản phẩm khác (mã sản phẩm khác) | RD-MN-076・142 |
| 8-8 | Nhà cung cấp tự động chọn loại hay dùng (đổi tay được) | RD-MN-070 |
| 8-9 | Ảnh **tối đa 5 ảnh**・mỗi ảnh tối đa 5MB. Chọn ảnh hiển thị (ảnh chính) | RD-MN-068 |
| 8-10 | Mã JAN **8〜13 chữ số** (không nhập được quá 13 chữ số) | RD-MN-069 |
| 8-11 | Sản phẩm có **course** (chọn nhiều được. **Không thêm được bản thân course từ màn hình**: cố định Light / Standard · khi cần thì thêm bằng phát triển 〈Sổ cái N〉) và **kho picking** (chọn nhiều được) | RD-MN-002・138 |
| 8-12 | Hạn sử dụng: giữ riêng hạn của nhà sản xuất (viết tự do) và **hạn sử dụng ES (số ngày)**. Ghi là "Hạn dùng tốt nhất hoặc hạn tiêu dùng". **Tự động chọn phân loại thời hạn tiêu dùng ngắn từ số ngày**: từ 7 ngày trở xuống = Short, từ 30 ngày trở xuống = Semi-short, dài hơn = không thuộc đối tượng | RD-MN-074・096・097, Sổ cái E |
| 8-13 | Thời hạn tiêu dùng ngắn **không phải là tag sản phẩm** (là mục phân loại). Với khách chỉ hiển thị "Hạn dùng tốt nhất ngắn". Hạn sử dụng ES・thời hạn tiêu dùng ngắn thì cho doanh nghiệp xem | RD-MN-099, Sổ cái M-2 |
| 8-14 | **Tag sản phẩm**: làm thành master. Thêm・xóa từ dropdown của màn hình đăng ký (giới hạn khoảng 20 tag). Gắn được nhiều tag. NEW・Xuất hiện lại・Lạnh cũng ngon, v.v. **Không dùng "Đề xuất"**. Không làm ô đánh dấu "Món cố định" và tự động thêm (nếu cần thì dùng tag) | RD-MN-101・102・105・106, Sổ cái F |
| 8-15 | **Danh mục**: 7 loại (hàng trên Thịt・Cá・Món ăn kèm / hàng dưới Món chính・Món canh・Salad・Đồ uống) + "Tất cả". Master danh mục (tên・ID・thứ tự hiển thị・ảnh・số sản phẩm đã đăng ký). Danh mục không giữ course. Khi nhập, danh mục không có trong master thì lỗi | RD-MN-110〜112・114, Sổ cái F |
| 8-16 | Thành phần dinh dưỡng: "trên 100g" × lượng nội dung 1 suất ăn để **tự động tính và hiển thị trên 1 suất ăn** | RD-MN-118 |
| 8-17 | Máy bán hàng tự động: dòng máy tương thích (Sanden / Fuji Electric. **Mặc định là cả hai**)・cột máy bán hàng tự động. **Không đăng ký được cả Single và Double cho 1 sản phẩm** | RD-MN-123・124・129 |
| 8-18 | Vật tư đi kèm・chỉ thị đặc biệt khi xuất hàng: giữ lại. Xuất ra CSV chỉ thị xuất hàng. Không trừ tồn kho vật tư | Sổ cái F |
| 8-19 | URL trang chủ của nhà sản xuất: quyết định hiển thị hay không theo từng sản phẩm. Cũng xuất ra CSV | RD-MN-071, Sổ cái F |
| 8-20 | Ô đánh dấu mẫu kinh doanh | RD-MN-044 |
| 8-21 | Khi ẩn sản phẩm chỉ bán một lần thì dùng **trạng thái "Vô hiệu"** (không làm chức năng lưu trữ). Sản phẩm vô hiệu mặc định không hiển thị trong danh sách・Thêm sản phẩm | Sổ cái F |
| 8-22 | Danh sách: Giá bán・Tỷ suất lợi nhuận gộp・Thông tin bảo quản (hiển thị)・Danh mục・Hạn sử dụng. Không hiển thị cột JAN・nhóm nhiệt độ. Bộ lọc: Danh mục・Cách bảo quản・Nhà cung cấp・**Course** | RD-MN-004・067・078 |
| 8-23 | CSV: xuất được template. **Xuất tất cả các mục có trong hệ thống**. Cùng mã sản phẩm mà tên sản phẩm khác → lỗi. **Tên sản phẩm giống mà mã sản phẩm khác → gộp vào mã sản phẩm mới**. Dòng có cột ảnh để trống thì không đổi ảnh hiện tại | RD-MN-090・091, Sổ cái F |

## 3. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U1 | Tên cuối cùng của danh mục ("Salad" hay "Salad・Trái cây", "Đồ uống" hay "Đồ uống・Đồ ngọt") | Xác nhận với khách (`_OPEN一覧` 1005-01) |
| U2 | Cách giữ sản phẩm có 2 loại nhóm nhiệt độ | Xác nhận với khách (1005-02) |
| U3 | Có hợp đồng chỉ Đông lạnh (chỉ menu đông lạnh) hay không | Xác nhận với khách (1005-03) |
| U4 | Tài liệu sản phẩm (đính kèm vào master sản phẩm・cảnh báo ngày cập nhật) | Không làm ở giai đoạn 2 |
| U5 | Cấu trúc cột thực tế theo từng dòng máy bán hàng tự động・mục tiêu đơn giá nhập trung bình của máy bán hàng tự động | Xác nhận với khách |
