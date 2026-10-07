# Đặc tả giao hàng: Picking, chỉ thị xuất hàng, phiếu vận chuyển, liên kết bên ngoài (§9, §10)

<!-- Nguyên bản: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (tách theo chương ngày 2026-10-03. Nội dung giữ nguyên như thời điểm tách) -->

## 9. Picking

### 9-1. Vị trí của picking

Ngày picking không có lịch riêng. **Nằm trong khung của chu kỳ giao hàng và được tính ngược từ ngày giao hàng.**

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Số lượng chu kỳ | **Chu kỳ chỉ có 1.** Không có chu kỳ riêng chỉ cho xuất hàng; ngày không thể xuất hàng cũng được giữ trên cùng lưới `A1`〜`D7` như giao hàng | 〔Chu kỳ §2.3〕〔Yêu cầu REQ-DL-804〕 |
| Đơn vị của khung | **28 slot = 4 tuần (A〜D) × 7 ngày** (`A1`〜`D7`). Slot được đọc theo "tuần × thứ" (`A6` = thứ Bảy của tuần A) | 〔Chu kỳ §2.3・§4.2〕〔Yêu cầu REQ-DL-501・REQ-DL-632〕 |
| Cách xác định ngày picking | **Tính ngược từ ngày giao hàng theo lead time của loại hình giao hàng trong hợp đồng.** `Ngày picking = Ngày giao hàng − Lead time` | 〔Chu kỳ §4.4〕〔Yêu cầu REQ-DL-101〕 |
| Trục phán định | Phán định không thể xuất hàng dựa trên **khung mà chính ngày picking thuộc về** (không xác định ngược từ khung của ngày giao hàng) | 〔Chu kỳ §2.3 `isPickClosed`〕〔Yêu cầu REQ-DL-804〕 |
| Ngày đầu chu kỳ | `A1` **cố định là thứ Hai**. Nếu nhập ngày không phải thứ Hai thì làm tròn về thứ Hai ngay trước đó | 〔Chu kỳ §2.3〕〔Yêu cầu REQ-DL-614〕 |
| Tháng của chu kỳ | **Tháng mà khung thứ 14 `B7` thuộc về.** Cho cùng kết quả với "tháng có nhiều ngày hơn trong 28 ngày", và khi 14 đối 14 thì tự động là tháng trước. **Không tạo nhánh ngoại lệ** | 〔Quyết định v2.1 #11〕〔Yêu cầu REQ-DL-881・REQ-DL-864〕 |
| Chủ sở hữu lead time | **Theo từng loại hình giao hàng của hợp đồng (Lạnh／Đông lạnh／Vật tư)**. **Master kho không giữ.** Cũng không tự động điền giá trị mặc định. Phạm vi **0〜7 ngày** | 〔Quyết định #10／#16／#52・#4〕〔Yêu cầu REQ-DL-831・REQ-DL-832・REQ-DL-627〕 |
| Khi có trung chuyển | Lead time **lấy tổng làm một giá trị chuẩn**. Phần trung chuyển chỉ hiển thị tham khảo, không dùng để tính ngược | 〔Quyết định #21〕〔Yêu cầu REQ-DL-837〕 |

- **Cách thiết lập theo tuần ("thứ Tư của tuần 1", tuần A／tuần B + đơn vị ngày) đã bị bãi bỏ.** Chuyển sang cách chọn khung chu kỳ〔Yêu cầu §8E-1・REQ-DL-501〕.
- Các khung không thể xuất hàng mặc định là **`A6`・`A7` ／ `B4`〜`B7` ／ `C6`・`C7` ／ `D4`〜`D7`**. **Thứ Bảy・Chủ nhật chỉ là giá trị mặc định chứ không phải giá trị cố định**, nên ở bất kỳ màn hình hay phán định nào cũng không được ấn định cứng theo thứ〔Chu kỳ §2.3・§5.3〕〔Yêu cầu REQ-DL-818〕.
- **Lý do tuần B・tuần D không xuất hàng đến cả thứ Năm・thứ Sáu là vì số đơn giao của tuần đó ít nên kho nghỉ cách tuần.** Việc giữ theo tuần × thứ thay vì theo thứ là để biểu thị kỳ nghỉ cách tuần này〔Chu kỳ §2.3〕.

### 9-2. Kho picking — không tồn tại vai trò kho

**Vai trò `Quản lý kho` không tồn tại. Mọi thao tác liên quan đến kho đều do vận hành (hậu cần) thực hiện.**〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885・REQ-DL-680〕

| Vấn đề | Quyết định | Nguồn |
|---|---|---|
| Vai trò kho | **Xóa hoàn toàn.** Bao gồm đăng ký hoàn tất picking, đăng ký ngày không thể xuất hàng, xem lịch picking (màn hình 04), **tất cả đều do vận hành (hậu cần)** thực hiện | 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885〕 |
| Tab kho | **Chỉ là bộ lọc dữ liệu, không phải đơn vị phân quyền.** Chuyển tab cũng không làm thay đổi phạm vi thao tác được | 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-623・REQ-DL-885〕〔Chu kỳ §5.2〕 |
| Lý do | **Kho không có màn hình trong hệ thống.** Chỉ thị cho kho được chuyển qua CSV chỉ thị xuất hàng, nên phía kho không có màn hình để đăng nhập | 〔Yêu cầu §8H-7B〕〔Chu kỳ §2.3〕 |
| Người phụ trách kho | Người phụ trách trong master kho (chính／phụ) do **vận hành thiết lập thủ công**. **Không bắt buộc**. Đó là đầu mối liên hệ, không phải chủ thể đăng nhập | 〔Yêu cầu §8G-6・§8H-7B〕〔Chu kỳ §2.3A〕 |
| Bảng phân quyền・bảng chế độ thay đổi ngày | **Xóa cột quản lý kho** | 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885〕 |

Việc sắp xếp bản thân kho như sau.

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Số cơ sở | **Cơ bản 2 cơ sở (Kanto・Kansai)**. Có thể tăng trong tương lai | 〔Yêu cầu §8H-1〕 |
| Cách xác định kho | **Kho xuất hàng được xác định theo từng sản phẩm** (sản phẩm × kho là nhiều-nhiều. Có sản phẩm chuyên Kanto, chuyên Kansai) | 〔Yêu cầu §8H-5・REQ-DL-675／676〕 |
| Cách giữ trong hợp đồng | Hợp đồng giữ danh sách **loại hình giao hàng (nhóm nhiệt độ hoặc vật tư × kho × công ty giao hàng 〈cấp 1・trung chuyển・cấp 2〉)** | 〔Yêu cầu REQ-DL-626〕〔Chu kỳ §3.1B〕 |
| Kho thay thế | **Không có.** Dù kho được chỉ định không thể xuất hàng cũng không tự động chuyển sang kho khác mà đưa vào "Cần xác nhận" để vận hành phán đoán | 〔Yêu cầu REQ-DL-629〕〔Chu kỳ §2.3〕 |
| Khi xuất từ kho khác | Đổi kho ở loại hình giao hàng của hợp đồng, hoặc nhân bản dữ liệu giao hàng rồi đổi kho. **Chỉ nhân bản được từ dữ liệu giao hàng `published` hoặc `locked`, không nhân bản được từ `draft`** | 〔Quyết định v2.1 #5〕〔Yêu cầu REQ-DL-872〕 |
| Áp dụng thay đổi kho | **Từ tháng áp dụng.** Đơn vị của tháng áp dụng là **tháng chu kỳ**, và việc chuyển đổi diễn ra **từ `A1` của chu kỳ đó** (không phải ngày 1 của tháng dương lịch) | 〔Chu kỳ §2.3・§4A-6〕〔Yêu cầu REQ-DL-630〕 |
| Master kho giữ gì | Phần chuyên dụng cho kho picking chỉ là **mã kho・ngưỡng số đơn・lead time chỉ thị xuất hàng・liên kết**. **Không giữ lead time (kể cả theo khu vực)** | 〔Yêu cầu REQ-DL-628・REQ-DL-666・REQ-DL-831〕〔Chu kỳ §2.3A〕 |
| Khung không thể xuất hàng・ngày không thể xuất hàng theo ngày | Quản lý ở **tab kho của thiết lập chu kỳ giao hàng (màn hình 01)**. Không cho chỉnh sửa ở master kho | 〔Yêu cầu REQ-DL-686〕〔Chu kỳ §2.3〕 |
| Nhóm nhiệt độ hỗ trợ | Master kho **không giữ**. Suy ra từ kho xử lý của sản phẩm; ở loại hình giao hàng thì phán định bằng "kho đó có xử lý ít nhất 1 sản phẩm của nhóm nhiệt độ đó hay không", nếu 0 thì cảnh báo | 〔Yêu cầu REQ-DL-668〕〔Chu kỳ §2.3A・§2.3C〕 |

- Việc cùng một hợp đồng xuất hàng đông lạnh và lạnh từ các kho khác nhau **không phải là không có**, nên giữ cấu trúc loại hình giao hàng × kho〔Yêu cầu §8H-1〕.
- **Mỗi kho có ngày nghỉ cố định・ngày hoạt động khác nhau**, nên khung không thể xuất hàng được giữ theo từng kho. Ngày không thể xuất hàng theo ngày (kiểm kê, bảo trì thiết bị) cũng theo từng kho, ngày kiểm kê của một kho không làm dừng picking của kho khác〔Yêu cầu §8H-1〕〔Chu kỳ §2.3〕.

### 9-3. Ngưỡng số đơn và cảnh báo

**Phán định theo "số đơn" chứ không phải số suất ăn. Không bao gồm vật tư.**〔Yêu cầu REQ-DL-616・REQ-DL-818〕〔Chu kỳ §5.2〕

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Đơn vị phán định | **Số đơn** (không phải số suất ăn・số gói) | 〔Yêu cầu REQ-DL-616〕〔Chu kỳ §5.2〕 |
| Chủ sở hữu ngưỡng | **Master kho** (vì là giá trị năng lực của kho, không liên quan đến ngày). Thiết lập **theo từng kho** | 〔Yêu cầu REQ-DL-623・REQ-DL-628〕〔Chu kỳ §2.3A〕 |
| Giá trị ban đầu | **300 đơn／ngày** (vì số đơn xử lý một ngày khoảng 300) 〈cũ: 150 đơn／ngày〉 | 〔Yêu cầu REQ-DL-616・REQ-DL-671・§8H-3〕〔Chu kỳ §5.2〕 |
| Đơn vị hiển thị | Hiển thị số đơn trong tháng và số ngày vượt **theo từng tab kho**. Tab là bộ lọc chứ không phải quyền (→ 9-2) | 〔Yêu cầu REQ-DL-623〕〔Quyết định v2.1 #2〕 |
| Khi vượt | **Chỉ hiển thị cảnh báo. Hệ thống không làm gì.** Vận hành tự điều chỉnh ngày thủ công (không dừng xử lý) | 〔Yêu cầu REQ-DL-616・§8H-3〕〔Chu kỳ §5.2〕 |
| Giao hàng vật tư | **Không tính vào số đơn** (vì giao thẳng từ kho cho Yamato, công sức picking không giống nguyên liệu thực phẩm). Loại trừ khỏi cả hiển thị số đơn lẫn phán định vượt; **dòng vật tư có hiện trong danh sách nhưng không đếm vào số đơn** | 〔Yêu cầu REQ-DL-818〕〔Chu kỳ §5.2〕 |
| Nhân sự・phương tiện | **Hệ thống không xử lý** | 〔Yêu cầu §8H-3〕 |

- Ngưỡng là **đường cảnh báo chứ không phải giới hạn trên**. Dù vượt, chỉ thị xuất hàng・tạo xác định cũng không dừng〔Yêu cầu REQ-DL-616〕.
- Khi do di chuyển thủ công ngày picking mà ngày giao hàng tính từ ngày picking mới + lead time trở nên muộn hơn ngày khách hàng mong muốn, **chỉ hiển thị cảnh báo trên màn hình, không dừng xử lý**〔Yêu cầu REQ-DL-105〕.

### 9-4. Danh sách picking

**Chỉ xác nhận trên màn hình quản trị. Không làm xuất PDF.**〔Quyết định #50〕〔Yêu cầu REQ-DL-850・REQ-DL-318〕〔Chu kỳ §5.2〕

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Hình thức xuất | **Xác nhận trên màn hình 04 và modal danh sách theo ngày. Không làm xuất PDF** (mục "tạo tự động bằng PDF" của REQ-DL-103 đã **hủy**) | 〔Quyết định #50〕〔Yêu cầu REQ-DL-850・REQ-DL-103〕 |
| Có thể lấy từ màn hình | **Chỉ đến xuất CSV** (xuất CSV của modal danh sách theo ngày) | 〔Chu kỳ §5.2・Phụ lục A-2〕 |
| Lý do không in giấy | Chỉ thị cho kho được chuyển bằng **CSV chỉ thị xuất hàng gửi Thomas**, nên không cần xuất danh sách giấy từ hệ thống | 〔Chu kỳ §5.2・§4D-3〕〔Yêu cầu §8C-8〕 |
| Nguyên liệu và vật tư | **Quản lý riêng・picking riêng.** Vật tư làm danh sách riêng với nguyên liệu | 〔Yêu cầu §2-2〕 |
| Đông lạnh và lạnh | **Picking và chỉ thị xuất hàng thực hiện riêng biệt** (→ 10-6) | 〔Yêu cầu REQ-DL-301・§8C-1〕 |
| Lọc | **Loại hàng (Lạnh／Vật tư)**・**Ngày dự kiến gửi (chỉ định khoảng)** | 〔Yêu cầu REQ-DL-103・§2-2〕 |
| Đơn vị hiển thị | Số lượng là **số item chứ không phải số gói**. Lịch picking hiển thị thành 1 thẻ | 〔Yêu cầu REQ-DL-104・§2-2〕 |
| Tiến độ picking | Hiển thị **phân biệt màu hoàn tất／chưa hoàn tất** | 〔Yêu cầu REQ-DL-104〕 |

**Tách đơn do hạn tiêu thụ ngắn**

- **Hệ thống không tự động phán định có tách hay không. Vận hành quyết định.** Sau khi tách được xử lý như **bản ghi riêng**〔Yêu cầu REQ-DL-618・REQ-DL-624〕.
- **Tuy nhiên hệ thống có thông báo việc "có chứa hạn tiêu thụ ngắn"**〔Quyết định v2.3 #35〕: đưa dữ liệu giao hàng (hoặc dự kiến) có chứa sản phẩm thỏa **Số ngày từ ngày xuất hàng đến ngày giao hàng ＞ Số ngày hạn tiêu thụ của sản phẩm (`products.shelf_life_days`) − số ngày an toàn** vào mục Cần xác nhận **`shelf_life_warning`**. Số ngày an toàn là **một thiết lập vận hành chung toàn công ty** (`shelf_life_safety_days`・**mặc định 2 ngày**). Phán định được thực hiện khi **tạo・tính lại dự kiến** (khi lead time kéo dài do chuyển dời), **đổi kho**, **nhân bản**. Không tự động tách (cũ: điều kiện chưa quyết 〈§18 No.6〉. Đã giải quyết 2026/09/29).
- **Hạn chót tiếp nhận khớp với "hạn chót của kỳ đặt hàng"**〔Yêu cầu REQ-DL-624〕.
- Vì vậy **ưu tiên chênh lệch lead time**. Không đặt giới hạn trên cho mức dịch chuyển ngày giao hàng, và khi dịch chuyển quá 3 ngày so với khung gốc thì đưa vào Cần xác nhận〔Yêu cầu REQ-DL-806〕.
- Với trường hợp không thể・chuyển dời・cần xác nhận, **bắt buộc ghi kèm lý do** (coi là ngày lễ giao hàng／thứ không thể giao／khung không thể xuất hàng・ngày không thể xuất hàng／chu kỳ tạm dừng／lượng lưu kho)〔Yêu cầu REQ-DL-617〕.

### 9-5. Màn hình 04 Lịch picking (màn hình vận hành xem)

**Người xem và người di chuyển ngày đều là vận hành (hậu cần).**〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885〕〔Chu kỳ §5.2〕

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Phụ trách chính | **Quản trị viên vận hành (hậu cần).** Vì vai trò kho không tồn tại nên người dùng phía kho không xuất hiện trên màn hình này | 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885・§8H-7B〕 |
| Trục tổng hợp | Lịch tháng (7 cột) tổng hợp theo **ngày picking** | 〔Chu kỳ §5.2〕 |
| Lọc | Chuyển bằng **tab kho** (vì kho được chỉ định khác nhau theo cơ sở, và nếu vượt qua nhiều kho thì không đọc được lý do của ngày không thể). **Tab là bộ lọc chứ không phải đơn vị phân quyền** | 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-623〕〔Chu kỳ §5.2〕 |
| Hiển thị không thể | Ngày không thể xuất hàng là **khung nét đứt màu tím** (`Không thể xuất hàng`), thời gian tạm dừng là **màu vàng** (`Tạm dừng`). **Ô không thể hiển thị lý do** | 〔Chu kỳ §5.2〕〔Yêu cầu REQ-DL-617〕 |
| Độ dài lý do | **Ô ngắn gọn** (`B1 Thứ Hai (không thể giao hàng)`), **chi tiết trong tooltip** hiển thị khung không thể xuất hàng・tên kho・lead time | 〔Quyết định #23〕〔Yêu cầu REQ-DL-847〕 |
| Diễn đạt chuyển dời | **Danh sách ngắn gọn** (`Dời sớm 2 ngày`), **màn hình chi tiết・tooltip đầy đủ** (`Đã dịch 2 ngày so với B3 (2026-09-17) ban đầu`) | 〔Quyết định #27〕〔Yêu cầu REQ-DL-846〕 |
| Ngày được coi là lễ giao hàng | **Có thể picking** | 〔Chu kỳ §5.2〕 |
| Cảnh báo số đơn | Hiển thị ngày vượt ngưỡng bằng viền khung và số đơn (→ 9-3) | 〔Yêu cầu REQ-DL-616・REQ-DL-623〕 |
| Phạm vi có thể di chuyển ngày | **Từ màn hình lịch chỉ trước hạn chót đặt hàng.** Từ sau hạn chót đến trước ngày xuất hàng một ngày, vận hành có thể thay đổi từng đơn một từ "Chỉnh sửa" ở chi tiết dữ liệu giao hàng, bắt buộc có lý do, trong cùng nửa đầu／nửa sau của cùng chu kỳ (8-3)〔Quyết định v2.3 #63〕 (cũ: sau hạn chót không thể thay đổi ngày từ cả màn hình lịch lẫn chi tiết dữ liệu giao hàng. Sửa theo sổ cái 2026-10-03) | 〔Quyết định v2.2 #1〕〔Yêu cầu REQ-DL-865・REQ-DL-886〕 |
| Sau hạn chót đặt hàng | **Đến trước ngày xuất hàng một ngày có thể thay đổi từng đơn (dòng trên). Từ ngày xuất hàng trở đi là hủy + nhân bản** (không phân biệt trước sau `locked`)〔Quyết định v2.3 #63〕 (cũ: không thay đổi ngày. Xử lý bằng hủy + nhân bản. Sửa theo sổ cái 2026-10-03) | 〔Quyết định v2.2 #1〕〔Yêu cầu REQ-DL-866〕 |

- Màn hình 05 (lịch giao hàng) là **chế độ xem khác tổng hợp cùng dữ liệu theo ngày giao hàng**. Tách lịch giữa xuất hàng (picking) và giao hàng〔Yêu cầu REQ-DL-308〕〔Chu kỳ §5.3〕.
- **Không vẽ Chủ nhật・thứ Bảy là "không thể xuất hàng"・"không thể nhận hàng" cố định.** Ở mọi hiển thị đều phán định dựa trên khung không thể xuất hàng của kho đó và thứ không thể giao của hợp đồng đó〔Yêu cầu REQ-DL-818〕〔Chu kỳ §5.3〕.

### 9-6. Quan hệ với không thể xuất hàng

**Khi gặp ngày không thể xuất hàng thì chuyển dời cả ngày picking lẫn ngày giao hàng.**〔Quyết định #15〕〔Yêu cầu REQ-DL-842・REQ-DL-689〕〔Chu kỳ §4A-5B・§4.4〕

Cách hiểu cũ "chỉ picking dừng còn ngày giao hàng không dịch" đã bị hủy. **Ngày không thể xuất hàng cũng thuộc đối tượng chuyển dời ngày giao hàng**.

| Thứ tự | Quy trình | Kết quả | Nguồn |
|---|---|---|---|
| ① | Trước hết **chỉ dời sớm ngày picking** và xem có nằm trong **chênh lệch 0** so với lead time hợp đồng không | Nếu nằm trong thì kết thúc ở đây (ví dụ: picking 8/19→8/18／giao hàng giữ nguyên 8/21) | 〔Yêu cầu REQ-DL-824〕〔Chu kỳ §4.4〕 |
| ② | Nếu không nằm trong chênh lệch 0, **dịch ngày giao hàng theo "dời sớm・dời muộn" của hợp đồng**, và **chuyển dời cả** ngày picking lẫn ngày giao hàng | Ví dụ: picking 8/18／giao hàng 8/20 | 〔Quyết định #15〕〔Yêu cầu REQ-DL-842〕〔Chu kỳ §4A-5B〕 |
| ③ | Nếu ② cũng không có ngày chênh lệch 0 thì **cho phép đến +1 ngày** (được tự động xác định và để lại dấu "bất đắc dĩ +1 ngày (trong phạm vi cho phép)") | Pill vàng | 〔Yêu cầu REQ-DL-824〕〔Chu kỳ §4.4〕 |
| ④ | Nếu ③ cũng không có thì chọn cặp có chênh lệch **nhỏ nhất** và đưa vào **Cần xác nhận** | Pill đỏ `Thực tế N ngày (hợp đồng M ngày・+K ngày)` | 〔Yêu cầu REQ-DL-824〕〔Chu kỳ §4.5〕 |
| ⑤ | Khi **không tìm được ngày nào có thể giao trong vòng 20 ngày** thì đưa vào Cần xác nhận với nội dung **"Không thể tạo dự kiến". Không tự động quyết định ngày** | Kèm hợp đồng・cơ sở・chu kỳ・lý do liên quan | 〔Quyết định #19〕〔Yêu cầu REQ-DL-843〕 |

**Xử lý theo từng `plan lifecycle`** (trục khác với `delivery status`. → 10-2)

| `plan lifecycle` | Xử lý khi thêm・thay đổi ngày không thể xuất hàng giữa chừng | Nguồn |
|---|---|---|
| `draft` (không có override) | **Tự động dời sớm.** Hiển thị lịch của doanh nghiệp cũng tự động cập nhật | 〔Yêu cầu REQ-DL-689〕〔Chu kỳ §4A-5B〕 |
| `draft` (có override đã phê duyệt) | Trước hết chỉ dời sớm ngày picking. Nếu cần dịch cả ngày giao hàng thì không tự động dịch mà để **"Đang đề xuất"** | 〔Yêu cầu REQ-DL-612〕〔Chu kỳ §4A-5B〕 |
| `published` | **Không dịch.** Đưa vào "Cần xác nhận" và vận hành xử lý. Dù hủy ngày không thể cũng không tự động hoàn lại | 〔Yêu cầu REQ-DL-689〕〔Chu kỳ §4A-5B〕 |
| `locked` | **Ngoài đối tượng.** Do đã gửi chỉ thị xuất hàng, xử lý bằng liên lạc điện thoại + hủy, hoặc nhân bản | 〔Yêu cầu REQ-DL-689・REQ-DL-866〕〔Chu kỳ §4A-5B〕 |

- **Ngày picking luôn tìm theo hướng dời sớm.** Vì dời muộn sẽ không kịp giao hàng. Khi vượt quá 1 ngày thì **dịch ngày giao hàng** thay vì ngày picking〔Chu kỳ §4.4〕.
- **Khác biệt với chu kỳ tạm dừng**: ngày tạm dừng không gán slot và **không tiêu thụ khung** (không giao hàng cũng không picking). Ngày không thể xuất hàng vẫn tiêu thụ khung và chỉ việc xuất hàng bị dừng〔Yêu cầu REQ-DL-807〕〔Chu kỳ §2.2・§4.2〕.
- **Khung được tiếp tục sau tạm dừng không được quay lại trước thời điểm tạm dừng.** Chỉ với lần mà khung bị lệch do tạm dừng, việc chuyển dời do ngày lễ・thứ không thể giao chỉ tìm theo **hướng dời muộn**〔Yêu cầu REQ-DL-825〕.
- Trước khi lưu, **xem trước số đơn bị ảnh hưởng** (`draft` tạo lại tự động／tự động dời sớm ngày picking／áp dụng・mất hiệu lực・đang đề xuất của override đã phê duyệt／**đã chỉ thị xuất hàng 〈`locked`・không thể thay đổi〉**／không thể dời sớm)〔Yêu cầu REQ-DL-688・REQ-DL-724〕〔Chu kỳ §4A-5B〕.

### 9-7. Hủy bỏ・số lượng còn lại

| Sự việc | Xử lý | Nguồn |
|---|---|---|
| **Hủy bỏ (廃棄)** | **Không quay lại đâu cả.** Đăng ký hủy bỏ và hiệu chỉnh tồn kho. Vì chưa giao hàng nên **không thanh toán** | 〔Yêu cầu §8H-4・REQ-DL-679〕〔Chu kỳ §4D-1〕 |
| **Số lượng còn lại (hàng thực còn)** | **Tạo 1 dữ liệu giao hàng và gửi với nơi nhận là "Trụ sở chính".** Cách tạo là **nhân bản với lý do "Trả hàng"** (`duplicate_type = return`), thay nơi giao hàng bằng nơi trả hàng của master kho (`warehouse_type = return`). **Ngoài đối tượng thanh toán** (8-4) | 〔Yêu cầu REQ-DL-679・§8H-4〕〔Quyết định v2.3 #41〕 |
| **Di chuyển giữa các kho (chuyển ngang)** | Coi như **mức điều chỉnh tồn kho** và **không tạo phiếu di chuyển** (ngoài đối tượng Phase 2) | 〔Yêu cầu REQ-DL-681・§8H-4〕 |
| **Thiếu tồn kho** | Dù phân bổ bị thiếu cũng không dừng mà chuyển vào **"Cần xác nhận"** | 〔Yêu cầu §8H-4〕 |
| **Cách giữ tồn kho** | Giữ **theo từng kho** | 〔Yêu cầu §8H-4〕 |

- Hủy bỏ **không phải là trạng thái**. Đó là **xử lý đi kèm** `delivery status` (đã giao／giao một phần／chờ giao lại／dừng), và trạng thái được quyết định theo lượng đã giao được〔Chu kỳ §4A-3B・§4A-4B〕.
- Bản ghi con của số lượng còn lại tạo từ giao từng phần・giao lại được **tạo ở trạng thái "Đang xác nhận"**, mang ngày giao hàng tạm và đưa vào Cần xác nhận. Chỉ khi vận hành chọn một trong "Xác định ngày này", "Đổi ngày", "Dừng" thì mới thành **chờ xuất hàng** (để ngăn việc chảy sang chỉ thị xuất hàng với ngày tạm)〔Yêu cầu REQ-DL-649-2〕〔Chu kỳ §4A-4C〕.
- **Việc nhân bản này chỉ thực hiện được từ dữ liệu giao hàng `published` hoặc `locked`, không nhân bản được từ `draft`.** Với `draft` chỉ có thể sao chép／thay đổi dự kiến〔Quyết định v2.1 #5〕〔Yêu cầu REQ-DL-872〕.

---

## 10. Chỉ thị xuất hàng・phiếu vận chuyển・liên kết bên ngoài

### 10-1. Chỉ thị xuất hàng (liên kết Thomas)

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Đối tác liên kết | **Thomas** (hệ thống kho). Xuất CSV chỉ thị xuất hàng và nhập CSV kết quả xuất hàng | 〔Yêu cầu REQ-DL-111〕〔Chu kỳ §4D-3〕 |
| Đơn vị xuất | **Theo kho** | 〔Yêu cầu REQ-DL-631〕〔Chu kỳ §2.3A〕 |
| Định dạng | Tự động xuất theo **định dạng chuẩn Thomas** | 〔Yêu cầu REQ-DL-317〕 |
| Đơn vị gộp | **Phần của 2 tuần = 2 lần: tuần A+tuần B／tuần C+tuần D** (1 chu kỳ = 4 tuần chia đôi) | 〔Yêu cầu REQ-DL-812〕〔Chu kỳ §4D-3〕 |
| Thời điểm xuất | **3 ngày trước (thứ Sáu)** ngày bắt đầu của 2 tuần đó | 〔Yêu cầu REQ-DL-812〕〔Chu kỳ §4D-3〕 |
| **Cửa sổ đối tượng** | `window_start` = ngày đầu của cửa sổ 14 ngày kế tiếp, `window_end` = `window_start` + 13 ngày. Gộp 1 lần các dữ liệu giao hàng có `picking_date` nằm trong cửa sổ. Ba ngày (`window_start`・`window_end`・`send_target_date`) được ghi vào phiên bản (`ship_orders`) | 〔Nguyên bản: DEV §10.4〕 |
| **Ngày gửi** | `send_target_date` = `window_start` − `ship_order_lead_days`. Dữ liệu giao hàng mà quá ngày vẫn chưa có phiên bản `ok` thì nhất định gửi trong lần chạy hằng ngày kế tiếp (catch-up) | 〔Nguyên bản: DEV §10.4〕 |
| **Phần phát sinh sau** | Dữ liệu giao hàng được tạo・đổi ngày sau khi đã gửi sẽ được gửi riêng bằng phiên bản mới. Tệp theo từng `warehouse_id` + `thomas_csv_unit` | 〔Nguyên bản: DEV §10.4〕 |
| Lead time chỉ thị xuất hàng | **Master kho** giữ. "Xuất trước ngày bắt đầu của kỳ đối tượng bao nhiêu ngày" = **mặc định 3** 〈cũ: 1 ngày trước ngày picking〉 | 〔Chu kỳ §2.3A・§4D-3〕〔Yêu cầu REQ-DL-628〕 |
| Thay đổi khẩn cấp | Nếu có thay đổi sau khi xuất thì **xuất bổ sung** (ghi đè bằng gửi lại・→ 10-3) | 〔Chu kỳ §4D-3〕 |
| Hiển thị màn hình | Ở màn hình dữ liệu giao hàng・lịch・chỉ thị xuất hàng, hiển thị **đã xuất hay chưa** cùng **ngày giờ xuất gần nhất・số phiên bản** | 〔Yêu cầu REQ-DL-812〕〔Chu kỳ §4D-3〕 |
| Khi hạn chót tạm | **Với `marker_source = provisional` (hạn chót tạm) thì không chạy chỉ thị xuất hàng.** Thực hiện sau khi hạn chót thật đến từ menu | 〔Quyết định v2.1 #9〕〔Yêu cầu REQ-DL-879・REQ-DL-811〕 |
| Dữ liệu giao hàng có thể gửi | `published`・trạng thái `Chờ xuất hàng`・đủ số lượng・**`schedule_confirmed=true` và `quantity_confirmed=true`**・không phải `Đang xác nhận`／`Hủy`／`Dừng`・**không phải `duplicate_type=trouble_pending` chưa giải quyết (bản ghi con tự động trước khi xác định)**・hạn chót không phải tạm・kho và loại hình giao hàng còn hiệu lực | 〔Quyết định v2.3 #23〕〔DEV §10.2〕 |
| Xử lý chưa phân công | **3 ngày trước ngày giao hàng và ngày hôm trước**, với dữ liệu giao hàng mà đoạn cần phân công (đoạn tự công ty・ủy thác) chưa có tài xế, **hiển thị ở Cần xác nhận `assignment_missing` của vận hành và Web công ty giao hàng ủy thác**, và **nếu là đoạn ủy thác thì gửi email cho công ty giao hàng ủy thác phụ trách** (đổi 2026/09/30. Cũ: nếu đến ngày hôm trước ngày giao hàng mà đoạn cần phân công vẫn chưa có tài xế thì đưa vào Cần xác nhận). **Không dừng bản thân việc xuất hàng** (cũ: nếu tại thời điểm chỉ thị xuất hàng chưa phân công thì Cần xác nhận. Thay thế 2026/09/29) | 〔Yêu cầu REQ-DL-643〕〔Quyết định v2.3 #43・#48〕〔Bảng yêu cầu dòng 142・Quyết_định_phản_ánh_một_phần_bảng_yêu_cầu_trả_lời_20260930〕 |

- **Lý do hiển thị đã xuất hay chưa trên màn hình là vì có xuất bổ sung.** Nếu không biết trên màn hình đã xuất hay chưa thì sẽ xuất hai lần hoặc quên xuất〔Chu kỳ §4D-3〕.
- **Quy định gộp xuất 2 tuần là quy định "khi nào gửi", không phải điểm khởi đầu của `locked`** (→ 10-2)〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-812・REQ-DL-867〕.

### 10-2. Điểm khởi đầu của `locked` — chỉ là lần gửi thành công đầu tiên của chỉ thị xuất hàng

**Trigger khiến thành `locked` chỉ có một. Đó là thời điểm chỉ thị xuất hàng được gửi thành công lần đầu.**〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕〔Chu kỳ §4A-3・§4D-3〕

`locked` ở đây là giá trị của **`plan lifecycle`** (`draft` / `published` / `locked`), là trục khác với **`delivery status`** (chờ xuất hàng／đã xuất hàng／đã nhận／đã giao／giao một phần／chờ giao lại／đang xác nhận／dừng／hủy). Một dữ liệu giao hàng có đồng thời cả hai giá trị (ví dụ: `lifecycle = locked` và `delivery status = đã nhận`). **Không gọi chung hai thứ là "trạng thái"**〔Quyết định v2.1 S5〕〔Yêu cầu REQ-DL-883〕〔Chu kỳ §4A-3・§4A-3B〕.

| # | Sự kiện | Ghi chép của `ship_orders` | `plan lifecycle` | Nguồn |
|---|---|---|---|---|
| 1 | **Đã xuất** CSV chỉ thị xuất hàng (chỉ mới tạo tệp) | `send_status = pending` | **Giữ nguyên `published`. Không `locked`** | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕 |
| 2 | **Gửi lần đầu thành công** (Thomas đã nhận) | `send_status = ok`／ghi `sent_ok_at` | **`published` → `locked` (trigger duy nhất)** | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕〔Chu kỳ §4A-3〕 |
| 3 | **Gửi thất bại** | `send_status = failed` | **Giữ nguyên `published`.** Không `locked` cho đến khi gửi lại thành công | 〔Quyết định v2.1 #3〕〔Chu kỳ §4A-3・§7〕 |
| 4 | **Đã gửi lại** (tăng `rev`) | Ghi bằng `rev` mới | **Giữ nguyên `locked`. Không dịch điểm khởi đầu (`locked_at`)** | 〔Yêu cầu REQ-DL-867・REQ-DL-662〕〔Chu kỳ §4D-3〕 |
| 5 | **Gửi lại dừng với số lượng 0** | `is_zeroed = true` | **Giữ nguyên `locked`** (→ 10-3) | 〔Yêu cầu REQ-DL-662〕〔Chu kỳ §4D-3〕 |
| 6 | **Đã gắn số phiếu vận chuyển** (có ghi chép gửi thành công của chỉ thị xuất hàng) | — | **Không thay đổi. Không `locked` bằng số phiếu vận chuyển** | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕 |
| 7 | **Đã gắn số phiếu vận chuyển** (không có ghi chép gửi thành công) | — | **Không `locked`. Phát hiện・thông báo là anomaly (bất thường) và đưa vào Cần xác nhận** | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-868〕 |

**Cách giữ dữ liệu**

| Cột | Nội dung | Nguồn |
|---|---|---|
| `deliveries.locked_at` | Thời điểm thành `locked`. **Ghi `ship_orders.sent_ok_at` (`send_status = ok` lần đầu)** | 〔Yêu cầu REQ-DL-867〕〔Chu kỳ §7〕 |
| `deliveries.locked_source` | **Giá trị chỉ có một = `ship_order_sent`** | 〔Quyết định v2.1 #3〕〔Chu kỳ §7〕 |
| `ship_orders.send_status` / `sent_ok_at` | Kết quả gửi và thời điểm thành công. Phần chỉ mới xuất・phần thất bại không `locked` | 〔Chu kỳ §7・§4D-3〕 |

**Phát hiện anomaly (phiếu vận chuyển có trước)**

| Điều kiện | Xử lý | Nguồn |
|---|---|---|
| Dữ liệu giao hàng đó **không có ghi chép gửi thành công của chỉ thị xuất hàng** mà đã được gắn số phiếu vận chuyển (`delivery_tracking_numbers`) | **Phát hiện là anomaly** và hiển thị ở Cần xác nhận "Số phiếu vận chuyển đã được gắn trước chỉ thị xuất hàng: N đơn". **Không `locked`**. Bắt bằng batch hằng ngày `tracking_anomaly_detect` (mỗi ngày 07:00) | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-868〕〔Chu kỳ §4A-3・§11-1〕 |

- **Các chuyển đổi bị cấm**: `published → draft`, `locked → published`, quay ngược `locked`. **Nhân bản từ `draft` cũng bị cấm**〔Quyết định v2.1 #5〕〔Yêu cầu REQ-DL-872〕〔Chu kỳ §4A-3〕.
- Trạng thái **không thay đổi theo đơn vị tháng**. Do từng dữ liệu giao hàng thành `locked` riêng, nên ngay trong cùng tháng dự kiến nửa cuối tháng vẫn còn ở `published` một thời gian, còn hợp đồng giao cuối tháng với lead time dài thì thành `locked` ngay trong tháng trước〔Chu kỳ §4A-3〕.
- **`locked` không phải cột mốc thay đổi ngày.** Đến trước ngày xuất hàng một ngày, vận hành có thể thay đổi từng đơn (8-3) và chỉ thị xuất hàng đã gửi được gửi lại bằng phiên bản mới. Từ ngày xuất hàng trở đi là hủy + nhân bản〔Quyết định v2.3 #63〕 (cũ: sau `locked` không thay đổi ngày. Khi cần thì hủy + nhân bản〔Quyết định v2.1 #1〕. Sửa theo sổ cái 2026-10-03).

### 10-3. Không có hủy, gửi lại kèm số phiên bản để ghi đè

**Chưa rõ phía Thomas có I/F hủy hay không**, nên xây dựng **không phụ thuộc vào hủy**〔Chu kỳ §4D-3〕〔Yêu cầu REQ-DL-662〕. **Ở phụ lục 4 ngày 2026/09/29, hủy đã được xác định theo phương thức gửi lại (phiên bản mới với số lượng 0). Dù biết có I/F hủy cũng không dùng**〔Quyết định v2.3 #45〕.

| Cơ chế | Nội dung | Nguồn |
|---|---|---|
| Số phiên bản (`rev`) | Cho chỉ thị xuất hàng mang số phiên bản và **tăng lên mỗi lần gửi lại** (`DL-260820-0012 / rev2`) | 〔Chu kỳ §4D-3〕 |
| Cách gửi | **Luôn gửi trạng thái mới nhất theo từng số chỉ thị**. Làm cho thành lập dù phía đối tác nhận theo cách nào | 〔Chu kỳ §4D-3〕 |
| Dừng | **Gửi lại với số lượng 0**. Vì không xóa bản thân chỉ thị nên truyền đạt được dù không có I/F hủy | 〔Yêu cầu REQ-DL-662〕〔Chu kỳ §4D-3〕 |
| Phát hiện chênh lệch | ES **giữ "nội dung đã gửi lần cuối"**, và khi có chênh lệch với dữ liệu giao hàng thì **tự động đưa "Cần gửi lại: N đơn" vào Cần xác nhận** (batch `ship_order_diff`・mỗi ngày 07:00) | 〔Yêu cầu REQ-DL-662〕〔Chu kỳ §4D-3・§11-1〕 |
| Có thể thay đổi sau khi gửi | **Công ty giao hàng ②・nhân viên giao hàng** = thay đổi nguyên trạng và gửi lại bằng `ship_order_diff`／**Địa chỉ nơi giao hàng** = xuất `rev` mới, chuyển phiếu vận chuyển hiện có thành `voided` và phát hành lại／**Kho picking・ngày** = không thay đổi mà **hủy + nhân bản** (15-13) | 〔Quyết định v2.2 #3〕〔Yêu cầu REQ-DL-888〜890〕 |
| Thời hạn gửi lại | **Cho đến khi nhận được kết quả xuất hàng của đơn giao đó.** Khi nhận được thì đóng. **Hệ thống không giữ giờ bắt đầu picking của kho** (không xét đến mức đó)〔Quyết định v2.2 #4〕 **(cũ: đến trước khi bắt đầu picking. Giờ bắt đầu đang xác nhận với kho・nhà cung cấp. Hủy bởi quyết định đợt 3 ngày 2026/09/22)** | 〔Quyết định v2.2 #4〕〔Yêu cầu REQ-DL-891〕 |
| Khi quá thời hạn | Thay đổi sau khi nhận kết quả xuất hàng chuyển sang **vận hành bằng điện thoại**, và phía dữ liệu giao hàng để lại dưới dạng **hủy** hoặc **nhân bản** | 〔Chu kỳ §4D-3〕 |
| Ảnh hưởng đến `locked` | **Gửi lại không làm dịch điểm khởi đầu của `locked`** (→ 10-2) | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕 |
| Lịch sử | Cả gửi lại lẫn vận hành bằng điện thoại đều **ghi vào lịch sử thay đổi kèm lý do** | 〔Chu kỳ §4D-3・§11-2〕 |
| I/F hủy | **Không làm ở Phase 2** (thay bằng gửi lại số lượng 0). **Dù có I/F cũng không dùng** (xác định 2026/09/29) | 〔Chu kỳ §12-7〕〔Quyết định v2.3 #45〕 |

### 10-4. Các cột của CSV chỉ thị xuất hàng

**Nguyên bản không có định nghĩa cột của CSV (tên cột・thứ tự・độ dài). Dưới đây chỉ là phạm vi có thể xác nhận từ nguyên bản.**

**Cách làm (phụ lục 4 ngày 2026/09/29)**〔Quyết định v2.3 #45〕: CSV được triển khai với **các cột tối thiểu** của 19.1 trong `配送_12`, và **được làm sao cho chỉ phần xuất (thứ tự cột・tên・header・mã ký tự) có thể thay thế**. Khi Thomas gửi định nghĩa cột thì **chỉ sửa phần xuất**. **Nếu không hỗ trợ được UTF-8 thì chuyển sang Shift_JIS khi xuất**.

| Mục đã xác nhận được | Nội dung | Nguồn |
|---|---|---|
| Đơn vị xuất | **Theo kho** | 〔Yêu cầu REQ-DL-631〕〔Chu kỳ §2.3A〕 |
| Định dạng | Định dạng chuẩn Thomas (tự động xuất) | 〔Yêu cầu REQ-DL-317〕 |
| Số chỉ thị | Dùng số của dữ liệu giao hàng. **Khi giao lại・nhân bản thì gán số nhánh (`DL-…-1`)** và Thomas xử lý như ID duy nhất | 〔Yêu cầu REQ-DL-114〕〔Chu kỳ §4A-4C〕 |
| Số phiên bản | `rev`. Tăng mỗi lần gửi lại (ví dụ `DL-260820-0012 / rev2`) | 〔Chu kỳ §4D-3〕 |
| Số lượng | Dừng thì gửi `0` | 〔Yêu cầu REQ-DL-662〕〔Chu kỳ §4D-3〕 |
| Nhận dạng kho | **Mã kho**. Dùng "Mã kho (cho liên kết THOMAS)" của master kho do vận hành nhập (3-1 #8. 2026/10/01 D3-2) (cũ: 【tạm】dùng nguyên ID kho 〈định dạng `WH00001`〉 làm mã liên kết. Sửa theo sổ cái 2026-10-03) | 〔Quyết định #6〕〔Yêu cầu §8L-5 #6〕〔Chu kỳ §2.3A〕 |
| Nhóm nhiệt độ | Đông lạnh・lạnh xuất ở **bản ghi riêng** (→ 10-6) | 〔Yêu cầu REQ-DL-301・REQ-DL-602〕 |
| Cột cần cho phiếu vận chuyển | Phase 2 theo phương châm "**truyền các cột cần cho phiếu vận chuyển bằng CSV chỉ thị xuất hàng (qua Thomas)**" | 〔Yêu cầu §8F-5〕〔Chu kỳ §4D-2〕 |
| Cột ES lưu giữ | `ship_orders`: `id, delivery_id, warehouse_id, rev, qty, payload_hash, sent_at, sent_by, is_zeroed, send_status, sent_ok_at` (※**là định nghĩa bảng nội bộ của ES** chứ không phải cột của CSV) | 〔Chu kỳ §7〕 |
| Mã ký tự | **Khả năng hỗ trợ UTF-8 đang xác nhận với nhà cung cấp.** Nếu không hỗ trợ được thì **chuyển sang Shift_JIS ở tầng xuất** (xác định phương châm 2026/09/29) | 〔Yêu cầu §8F-5〕〔Chu kỳ §7〕〔Quyết định v2.3 #45〕 |

**Xuất・nhập từ màn hình (phụ lục 5 ngày 2026/09/29)**〔Quyết định v2.3 #53〕: Đặt các nút sau ở màn hình "Chỉ thị xuất hàng・Nhập" (chỉ vận hành 〈hậu cần〉).

| Nút | Làm gì |
|---|---|
| Xuất CSV chỉ thị xuất hàng (THOMAS) | Chọn kho và đối tượng (cửa sổ 2 tuần・phần bổ sung) và xuất chỉ thị xuất hàng tại thời điểm đó bằng CSV. **Dùng để xác nhận・liên kết thủ công, không phải gửi. Không tạo phiên bản và cũng không `locked`** (10-2) |
| CSV của dòng lịch sử gửi | Tải lại đúng nội dung đã gửi ở phiên bản đó |
| Xuất CSV cho phiếu vận chuyển (Yamato) | Xuất bằng các cột tạm của 10-8 |
| Nhập CSV kết quả xuất hàng／CSV số phiếu vận chuyển | Xử lý 19.4／19.3 của `配送_12`. Dòng không nhập được thành Cần xác nhận "Lỗi nhập" |
| Mẫu／dòng lỗi | Xuất bằng CSV tệp mẫu để nhập và danh sách các dòng không nhập được |

### 10-5. Phiếu vận chuyển là một-nhiều

**Một dữ liệu giao hàng có nhiều số phiếu vận chuyển (theo từng thùng). Một phiếu vận chuyển không chứa nhiều dữ liệu giao hàng (= không có gộp xuất hàng).**〔Quyết định #54／#78／#81／#38〕〔Yêu cầu REQ-DL-833・REQ-DL-813・REQ-DL-303〕〔Chu kỳ §4D-2〕

"Nhiều-nhiều・bảng trung gian (gộp xuất hàng)" ngày 2026/09/19 đã bị hủy và đã trở lại hình thức gắn `delivery_tracking_numbers` vào dữ liệu giao hàng theo quan hệ một-nhiều.

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Bội số quan hệ | **Một-nhiều.** Một dữ liệu giao hàng (xuất hàng) được gắn **nhiều (theo từng thùng)** số phiếu vận chuyển | 〔Quyết định #54〕〔Yêu cầu REQ-DL-833〕 |
| Gộp xuất hàng | **Không có.** Từ phiếu vận chuyển truy ra **luôn là 1 dữ liệu giao hàng** | 〔Quyết định #54〕〔Yêu cầu REQ-DL-813・§8C-2〕 |
| Cách giữ | **Gắn** `delivery_tracking_numbers` vào dữ liệu giao hàng **theo quan hệ một-nhiều** (không làm bảng trung gian) | 〔Chu kỳ §4D-2・§7〕 |
| Đánh số (nguyên tắc) | **ES không đánh số.** Nhận và giữ số do phía công ty giao hàng đánh (**nhập CSV hoặc nhập tay**), dùng làm khóa tìm kiếm | 〔Yêu cầu §8G-5〕〔Chu kỳ §4D-2〕 |
| Đánh số (ngoại lệ) | **Với chuyến mà bên ủy thác đến kho lấy hàng thì ES đánh số** (vì không có đánh số phía công ty giao hàng). **Số = Số giao hàng + số thùng 2 chữ số** (ví dụ `DL-261020-0021-01`), `issued_by = es_generated`, giữ `box_no`・`box_total`. **Tạo theo số thùng dự kiến tại thời điểm gửi thành công chỉ thị xuất hàng**, nếu số thùng của kết quả xuất hàng khác thì **bổ sung phần thiếu, phần thừa chuyển thành `voided`**. **Không hiển thị liên kết trang theo dõi**〔Quyết định v2.3 #47〕 | 〔Quyết định #55〕〔Quyết định v2.3 #47〕〔Yêu cầu REQ-DL-833・REQ-DL-661〕〔Chu kỳ §4D-2〕 |
| Cách quyết định có cần hay không | **Quyết định không theo loại chuyến mà theo việc thực tế có đoạn đi qua công ty giao hàng hay không.** Dù là giao hàng tự công ty, nếu có đoạn qua Yamato thì được gắn số (không phải "giao hàng tự công ty = không có phiếu vận chuyển"). Việc có cần nhập hay không chuyển theo phương thức giao hàng (giao hàng tự công ty thì không cần, chuyến công ty vận tải như Yamato thì bắt buộc). ※"Chuyến Rise" xuất hiện trong cuộc họp (2026/07/29) là chuyến chạy xe tải vòng quanh các nhà cung cấp trong tỉnh Gunma để gom về kho = **chuyện của phía mua (nhập kho)**, không dùng để phán định giao hàng. Tên gọi đang xác nhận với khách hàng (`議事録/_OPEN一覧.md` 1003-01)〔Nguyên bản: Yêu cầu §3〕 | 〔Yêu cầu REQ-DL-116〕〔Chu kỳ §4D-2〕 |
| Sự cần thiết của đơn vị | Nhận hàng・chuyến giao COOL của ứng dụng tài xế **kiểm tra theo đơn vị phiếu vận chuyển**, nên **cần biểu diễn được chưa nhận một phần・giao một phần theo đơn vị phiếu vận chuyển**. Nếu làm 1-1 thì không biểu diễn được | 〔Yêu cầu §8G-5〕〔Chu kỳ §4D-2〕 |
| Giao lại・nhân bản | **Khi nhân bản thì bản con nhận số mới.** Số của bản cha giữ ở bản cha | 〔Chu kỳ §4D-2・§4A-4C〕 |
| Nơi trung chuyển | **Không phát hành lại** | 〔Yêu cầu §8C-2〕〔Chu kỳ §4D-2〕 |
| Vô hiệu hóa (`voided`) | **Khi đổi địa chỉ nơi giao hàng sau chỉ thị xuất hàng thì chuyển tất cả số hiện có thành `voided` và phát hành lại** (15-13). Dòng không xóa mà giữ lại | 〔Quyết định v2.2 #3〕〔Yêu cầu REQ-DL-889〕 |
| Quan hệ với `locked` | **Dù được gắn số phiếu vận chuyển cũng không `locked`** (→ 10-2) | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕 |
| Tên bên gửi | Bên gửi trên phiếu vận chuyển hiển thị **"Tên kho (dùng cho phiếu)"** của master kho và **mã văn phòng** của nơi trung chuyển | 〔Yêu cầu §8G-6〕〔Chu kỳ §2.3A〕 |
| Thông báo chưa thiết lập tài xế (cũ: thông báo chưa liên kết) | Với hàng **chưa thiết lập tài xế**, **3 ngày trước ngày giao hàng và ngày hôm trước**, **hiển thị ở Cần xác nhận `assignment_missing` của vận hành và Web công ty giao hàng ủy thác**, và **nếu là đoạn ủy thác thì gửi email cho công ty giao hàng ủy thác phụ trách** (12-1・15-9) (đổi 2026/09/30. Cũ: với hàng chưa phát hành phiếu vận chuyển, gửi email thông báo cho vận hành・nhà thầu giao hàng ủy thác **3 ngày trước・1 ngày trước ngày giao dự kiến**) | 〔Yêu cầu REQ-DL-304・§8C-2〕〔Bảng yêu cầu dòng 142・Quyết_định_phản_ánh_một_phần_bảng_yêu_cầu_trả_lời_20260930〕 |

### 10-6. Tách xuất hàng đông lạnh・lạnh

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Phạm vi tách | **Picking và chỉ thị xuất hàng thực hiện riêng biệt** | 〔Yêu cầu REQ-DL-301・§8C-1〕 |
| Bản ghi | Tạo・giữ dự kiến xuất hàng・dữ liệu giao hàng như **bản ghi theo đơn vị nhóm nhiệt độ (Đông lạnh／Lạnh／Nhiệt độ thường／Vật tư)** | 〔Yêu cầu REQ-DL-602〕〔Chu kỳ §7〕 |
| Tên loại | Đổi ký hiệu "chuyến COOL" của loại hình giao hàng thành **"Loại lạnh" "Loại đông lạnh"**. Không dùng tên cũ | 〔Yêu cầu §8C-1〕〔Chu kỳ §0〕 |
| Nhiệt độ thường | **Xử lý giống lạnh** | 〔Yêu cầu REQ-DL-656〕〔Chu kỳ §4C-3〕 |
| Nhóm nhiệt độ hỗ trợ của master công ty giao hàng | **3 giá trị: Đông lạnh／Lạnh・Nhiệt độ thường／Vật tư** (4 giá trị・2 giá trị đều đã hủy) | 〔Quyết định #8〕〔Yêu cầu REQ-DL-402〕 |
| Kho・công ty giao hàng | Có thể thiết lập riêng cho đông lạnh・lạnh・vật tư **kho picking・nơi trung chuyển・công ty giao hàng・lead time・URL liên hệ** | 〔Yêu cầu REQ-DL-601・§8F-1〕〔Chu kỳ §3.1B〕 |
| Ngày picking | Vì tính ngược theo từng loại hình giao hàng nên **ngày picking thay đổi theo từng loại** (dù cùng ngày giao hàng, kho có thể khác nhau) | 〔Yêu cầu REQ-DL-301〕〔Chu kỳ §3.1B・§4.4〕 |
| Khóa duy nhất của dự kiến | **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`**. **Không dùng `(ID hợp đồng, ngày giao hàng)`** (vì một hợp đồng có thể có nhiều nhóm nhiệt độ・loại hình giao hàng trong cùng một ngày) | 〔Quyết định v2.1 #6〕〔Yêu cầu REQ-DL-873〕 |
| Hiển thị | Ở danh sách lịch giao hàng, **icon chuyên dụng nhận biết đông lạnh** (icon băng v.v.／lạnh là icon tủ lạnh). Trước hết ưu tiên đông lạnh | 〔Yêu cầu REQ-DL-302・§8C-1〕 |

### 10-7. Danh sách liên kết bên ngoài

**Liên kết làm ở Phase 2 chỉ có 2: CSV chỉ thị xuất hàng và CSV số phiếu. Lấy tình trạng giao hàng của Yamato là Phase 3.**〔Yêu cầu §8F-5〕〔Chu kỳ §7〕

| # | Đối tác | Dữ liệu | Hướng | Phương thức | Thời điểm | Phase | Nguồn |
|---|---|---|---|---|---|---|---|
| 1 | **Thomas** (kho) | CSV chỉ thị xuất hàng | ES → Thomas | CSV (chuẩn Thomas・theo kho・tự động xuất) | **Gộp phần của 2 tuần, 3 ngày trước ngày bắt đầu (thứ Sáu)** + xuất bổ sung khi khẩn cấp. **`locked` khi gửi thành công lần đầu** | **Phase 2** | 〔Yêu cầu REQ-DL-111・631・812・867〕〔Chu kỳ §4D-3〕 |
| 2 | **Thomas** (kho) | CSV kết quả xuất hàng (gồm số phiếu vận chuyển) | Thomas → ES | Nhập CSV | Khi nhập, chuyển `delivery status` từ **Chờ xuất hàng → Đã xuất hàng** | **Phase 2** | 〔Yêu cầu REQ-DL-111〕〔Chu kỳ §4A-3B・§7〕 |
| 2B | **Thomas** (kho) | Liên kết API chỉ thị xuất hàng・kết quả xuất hàng | Hai chiều | API | — | **Phase 3 trở đi** (sau khi công ty kho thẩm định・cho phép) | 〔Tổng hợp định nghĩa yêu cầu chủ đề 8-10〕 (thêm 2026/10/01・K-37) |
| 3 | **Yamato Transport và các bên ủy thác khác** | Số phiếu vận chuyển (CSV số phiếu) | Công ty giao hàng → ES | **Nhập CSV** (hoặc nhập tay) | Sau khi xuất hàng. Liên kết khi được gắn số. **Dù đã nhận cũng không `locked`** | **Phase 2** | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-116・867・§8F-5〕 |
| 3B | **(Nội bộ ES)** | **Phát hiện anomaly phiếu vận chuyển có trước** | Trong ES | Batch hằng ngày `tracking_anomaly_detect` (mỗi ngày 07:00) | Phát hiện dữ liệu giao hàng không có ghi chép gửi thành công của chỉ thị xuất hàng mà đã được gắn số phiếu vận chuyển và đưa vào Cần xác nhận | **Phase 2** | 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-868〕〔Chu kỳ §11-1〕 |
| 4 | **Yamato (vật tư)** | CSV xuất hàng vật tư (dùng để nhập vào Yamato・có bản đồ định dạng) | ES → Yamato | CSV | Khi tạo dữ liệu giao hàng bằng đơn hàng vật tư (→ 10-8) | Phase 2 | 〔Yêu cầu §3〕 |
| 5 | **Các công ty giao hàng** (Yamato／Fukuyama Transporting／Sagawa v.v.) | Tình trạng giao hàng | Chỉ tham chiếu | **Liên kết ngoài đến trang liên hệ của từng công ty** | Vận hành tham chiếu khi cần | Phase 2 | 〔Yêu cầu REQ-DL-414・§8F-5〕 |
| 6 | **Yamato** | **Batch lấy** tình trạng giao hàng | Yamato → ES | Batch | — | **Phase 3** | 〔Yêu cầu §8F-5〕〔Chu kỳ §7〕 |
| 7 | **Yamato** | Liên kết API hoàn chỉnh (gửi yêu cầu giao hàng・liên kết số phiếu vận chuyển・lấy trạng thái giao hàng) | Hai chiều | API | — | **Phase 3** | 〔Yêu cầu REQ-DL-112・§8F-5〕 |
| 8 | **Yamato** | Phát hiện đóng cửa mã văn phòng | Yamato → ES | **Scraping + thông báo cờ** (vì không có API) | Bất kỳ lúc nào | Tạm | 〔Yêu cầu §8B-4・§8F-5〕 |
| 9 | **Công ty giao hàng ủy thác** | Yêu cầu báo giá・trả lời, email xác định, CSV chi tiết thu tiền | Hai chiều | Màn hình + email + CSV (chi tiết theo từng văn phòng) | Bất kỳ lúc nào | Phase 2 | 〔Yêu cầu REQ-DL-507・§8F-5〕 |
| 10 | **Công ty giao hàng ủy thác** | Dự kiến sắp tới | Chỉ tham chiếu | **Trang chuyên dụng của công ty giao hàng (Web công ty giao hàng ủy thác)** (ES không liên lạc mỗi lần) | Đến hạn chót là dự tính (**đến chu kỳ tháng sau・đến số đơn**). **Xác định cùng thời điểm với hạn chót đặt hàng** (sau khi xác định thì toàn bộ mục). Chỉ dữ liệu giao hàng có đoạn do công ty mình phụ trách (11-6) | Phase 2 | 〔Chu kỳ §4C-4〕〔Quyết định v2.3 #34・#51〕 |
| 11 | **Bill One** | Dữ liệu thanh toán・đối chiếu thanh toán | ES → Bill One | Đến khi xác định thanh toán・phát hành hóa đơn (**đối chiếu thanh toán ở phía Bill One**) | **Chốt ngày 20 → xác định ngày 25 → phát hành trên Bill One vào ngày 1 tháng sau** (sổ cái) (cũ: ngày xác định thanh toán = 25 → phát hành cuối tháng. Sửa theo sổ cái 2026-10-03) | Phase 2 | 〔Quyết định #71〕〔Yêu cầu REQ-DL-834〕〔Chu kỳ §4D-1〕 |
| 12 | **Master ngày lễ** | Dữ liệu ngày lễ | Chỉ tham chiếu | **Tự động lấy mỗi năm 1 lần từ API ngày lễ công khai + "Lấy lại ngày lễ"** (đổi 2026/10/01・〔trả lời của hong 2026-10-03〕. Cũ: nhập thủ công mỗi năm 1 lần dữ liệu công khai của Văn phòng Nội các・không nhập qua API) | Mỗi năm 1 lần + vận hành thêm・sửa bất kỳ lúc nào | Phase 2 | 〔Quyết định #9〕〔Yêu cầu §8L-5 #9〕〔Chu kỳ §6〕 |

- **Đầu ra cho Thomas được làm sao cho có thể thay thế ở tầng xuất**, và nếu UTF-8 không được thì chuyển sang Shift_JIS khi xuất (10-4). **Nếu CSV của Thomas không có cột cần cho phiếu vận chuyển của Yamato thì xuất riêng CSV dùng cho phiếu vận chuyển** (10-8)〔Quyết định v2.3 #45・#46〕.
- Dù thêm công ty giao hàng cũng không đổi thiết kế cơ bản; phần chung được xử lý bằng nhập CSV số phiếu vận chuyển và cập nhật trạng thái dựa trên báo cáo hoàn tất〔Nguyên bản: Yêu cầu §3〕〔Yêu cầu REQ-DL-113〕.
- **Chỉ làm 2 mục #1 và #3 ở Phase 2.** Danh sách phiếu vận chuyển không có cột tình trạng của công ty giao hàng, mà xác nhận bằng **liên kết trang theo dõi**〔Yêu cầu §8F-5〕〔Chu kỳ §7〕.
- Tình trạng giao hàng lấy được ở Phase 3 **chỉ dừng ở hiển thị như thông tin tham khảo**〔Yêu cầu REQ-DL-814〕〔Chu kỳ §4C-2〕.
- **Không giữ trạng thái giữa chừng** của trung chuyển. Trung chuyển chỉ hiển thị 2 giá trị "**Có／Không trung chuyển**", **suy ra từ route legs và không lưu như trạng thái**〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-876・REQ-DL-814〕.
- "Đã nhận" **chỉ được nhập từ ứng dụng tài xế của ES** (không liên quan đến Yamato)〔Chu kỳ §4A-3B〕.

### 10-8. Các cột trao cho Yamato・các cột nhận về

Lấy từ 〔Ghi chú phương án tuyến §3B〕 (2026/09/23. Ghi chú vấn đề gốc đã chuyển vào `99_過去/`). **Bản thân các cột đang chờ xác nhận từ Yamato**, và **ở phụ lục 4 ngày 2026/09/29 đã quyết định phương án tạm để tiến hành triển khai** (§18 No.19 là "tạm")〔Quyết định v2.3 #46〕: ① tên người nhận của gửi giữ tại văn phòng = **công ty giao hàng ủy thác đến nhận**, ghi tên cơ sở và số giao hàng vào cột ghi chú ② ngày giao dự kiến = **ngày đến văn phòng** (tính từ giá trị tham khảo lead time của cấp 1) ③ nếu CSV của Thomas không có cột thì **xuất riêng CSV dùng cho phiếu vận chuyển**.

**Tiền đề**: Phase 2 không dùng API cũng không dùng batch (bỏ API 2026/09/04, **batch lấy tình trạng cũng chuyển sang Phase 3** 2026/09/17). Trao đổi với Yamato chỉ có 2 mục sau.

1. **Trao**: CSV chỉ thị xuất hàng ES → Thomas → kho tạo phiếu Yamato
2. **Nhận**: kho đăng ký số phiếu Yamato vào Thomas → nhập CSV khoảng 19 giờ vào ES (2026/06/05)

### Các cột trao để tạo phiếu vận chuyển

| Cột (phía Yamato) | Cách xử lý ở Yamato | Lấy từ đâu của ES | Vị trí trên màn hình |
|---|---|---|---|
| Loại phiếu vận chuyển | Bắt buộc | Cố định trả cước người gửi (発払い) | Mục phiếu vận chuyển "Nội dung ghi trên phiếu vận chuyển" |
| Phân loại COOL | Lạnh／Đông lạnh | Tự động từ loại giao hàng | Không hiển thị (xem loại giao hàng) |
| Ngày xuất hàng dự kiến | Bắt buộc | Ngày xuất hàng | Tổng quan giao hàng |
| Ngày giao dự kiến | Tùy chọn | Ngày giao hàng. Khi có đi qua giữa chừng thì là **ngày đến văn phòng** (tính từ giá trị tham khảo lead time của cấp 1)【tạm】〔Quyết định v2.3 #46〕 | Tổng quan giao hàng |
| Khung giờ giao | Buổi sáng／14-16／16-18／18-20／19-21 | Khung giờ giao trong tổng quan giao hàng. **Mặc định là "Buổi sáng"** (bổ sung 2026/10/01・K-26. Cần xác nhận đây là giá trị khách hàng chọn được hay giá trị cố định dùng cho phiếu vận chuyển). Khi gửi giữ tại văn phòng thì không ghi lên phiếu vận chuyển | Tổng quan giao hàng |
| Giữ tại văn phòng・mã văn phòng | Khi giữ thì bắt buộc mã văn phòng | Nếu có đi qua giữa chừng 1 thì tự động là giữ tại văn phòng, mã văn phòng của master nơi trung chuyển | Bảng địa điểm (dòng "Giữ tại văn phòng" ở đi qua giữa chừng 1) |
| Nơi nhận (tên người nhận・điện thoại・địa chỉ) | Bắt buộc | Không đi qua giữa chừng = cơ sở. Giữ tại văn phòng = **công ty giao hàng ủy thác đến nhận**【tạm】〔Quyết định v2.3 #46〕 | Mục phiếu vận chuyển "Tên người nhận" |
| Người gửi | Tên・điện thoại・địa chỉ | Master kho (Tên kho (dùng cho phiếu)) | Bảng địa điểm (dòng kho) |
| Tên hàng・cách xử lý hàng | Ví dụ: thực phẩm lạnh／hàng tươi sống | Giá trị mặc định theo từng loại giao hàng (master) | Mục phiếu vận chuyển |
| Số kiện (số thùng) | Nhiều kiện là phiếu mẹ・phiếu con | Số thùng. **Cần xác nhận mỗi thùng là phiếu vận chuyển riêng hay nhiều kiện** | Mục phiếu vận chuyển |
| Ghi chú | In trên phiếu vận chuyển | Ghi chú giao hàng ngắn. Khi giữ tại văn phòng thì là **tên cơ sở và số giao hàng**【tạm】〔Quyết định v2.3 #46〕 | Mục phiếu vận chuyển |
| Mã quản lý của khách hàng | Tự do | **ID giao hàng** (đối chiếu CSV trả về bằng cột này) | Không hiển thị (ID giao hàng) |
| Mã khách hàng yêu cầu thanh toán・mã quản lý cước | Bắt buộc | Giữ ở **master kho × công ty giao hàng** (không giữ trong dữ liệu giao hàng) | Không hiển thị |
| Email hoàn tất gửi hàng | Tùy chọn | **Gửi 1 email khi nhập kết quả xuất hàng (hoàn tất gửi hàng)** (người phụ trách chính・phụ. Số phiếu vận chuyển và trang liên hệ của công ty giao hàng. URL kèm số được tạo từ "Mẫu URL theo dõi" của master công ty giao hàng・2026/10/01 O-4). "Đang chuẩn bị gửi" chỉ là hiển thị của Web doanh nghiệp (đổi 2026/10/01・P11. Cũ: Phase 2 không dùng 〈yêu cầu 2026/05/22〉) | 〔Bảng yêu cầu dòng 127〕 |

### Các cột nhận về

| Cột | Nội dung |
|---|---|
| Số phiếu | Nhập bằng CSV và liên kết với dữ liệu giao hàng bằng mã quản lý của khách hàng (ID giao hàng) hoặc số chỉ thị xuất hàng |
| Ngày giờ nhập | Tại thời điểm nhập coi là "đã gửi hàng xong" và hiển thị ngày giờ ở danh sách phiếu vận chuyển |

### Chuyển sang Phase 3

| Cột | Nội dung |
|---|---|
| Tự động lấy tình trạng hàng | Batch (phương án cũ: 3 giờ 1 lần) hoặc API. Tên tình trạng・thời điểm lấy・văn phòng phụ trách |
| Thời điểm giao xong・mang về・đang lưu giữ | Mục đích ghi đè bằng thực tế việc coi là hoàn tất của chuyến ủy thác |
| API hóa phát hành phiếu vận chuyển | "B2 Cloud API" của Yamato (gửi dữ liệu phiếu vận chuyển và nhận số phiếu) |
| Thời hạn có thể tra cứu | Ngày dừng lấy tình trạng (bài tập về nhà ngày 2026/09/04 "xác nhận thời hạn hiệu lực") |

### 10-9. Giao hàng vật tư

**Vật tư là giao thẳng Yamato・giao hàng theo từng lần. Mỗi khi xác định giỏ hàng thì tạo dữ liệu giao hàng (nếu có chuyến vật tư cùng cơ sở・cùng ngày giao hàng・trước chỉ thị xuất hàng thì gộp thành 1 đơn).**〔Yêu cầu REQ-DL-845・REQ-DL-656〕〔Chu kỳ §4A-2C〕〔Quyết định v2.3 #36〕

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Mẫu giao hàng | **Giao hàng theo từng lần (`on_demand`) chỉ dành cho vật tư.** Lạnh・đông lạnh vẫn là 2 giá trị `cycle`／`special` | 〔Quyết định #24〕〔Yêu cầu REQ-DL-845〕 |
| Tuyến giao hàng | **Picking tại văn phòng ES (kho picking dành cho vật tư của master kho) và gửi trực tiếp cho Yamato** (tương lai dự kiến ủy thác toàn bộ cho Toyo Care 〔Nguyên bản: Yêu cầu §1〕). Hiện không đi theo luồng giao hàng (đổi 2026/10/01・khách hàng xác nhận A2. Cũ: gửi trực tiếp từ kho cho Yamato). **Công ty giao hàng được giữ ở loại hình giao hàng "Vật tư" của hợp đồng, nên sau này dù đổi sang bên khác ngoài Yamato (công ty giao hàng ủy thác v.v.) cũng tiếp nhận được với cùng cách làm** | 〔Yêu cầu REQ-DL-656〕〔Chu kỳ §4A-2C・§4C-3〕 |
| Trigger tạo | **Mỗi khi xác định giỏ hàng vật tư thì tạo dữ liệu giao hàng** (ngay lập tức). **Nếu có dữ liệu giao hàng vật tư cùng cơ sở・cùng ngày giao hàng・chưa gửi chỉ thị xuất hàng thì thêm chi tiết vào đó và gộp thành 1 đơn**. Ngoài đối tượng tạo xác định của chu kỳ tháng (cũ: tạo 1 đơn tại thời điểm có đơn hàng vật tư. Xác định 2026/09/29) | 〔Chu kỳ §4A-2C〕〔Quyết định v2.3 #36〕 |
| Chỉ thị xuất hàng | **Không gửi cho THOMAS** (kho văn phòng ES là "liên kết THOMAS = không"). Làm việc bằng danh sách picking vật tư (màn hình・checkbox) và xuất CSV phiếu vận chuyển Yamato (đổi 2026/10/01・A2. Cũ: gửi bằng việc nhặt hằng ngày hiện có 〈catch-up〉) | 〔Quyết định v2.3 #36〕 |
| Dự kiến giao hàng (`draft`) | **Không giữ.** Vì không có giai đoạn dự kiến nên ngay khi được tạo sẽ xuất hiện như `published` | 〔Chu kỳ §4A-2C〕 |
| Xác định số lượng | Đồng thời với xác định đơn hàng vật tư | 〔Chu kỳ §4A-2C〕 |
| Phán định chu kỳ | **Không phán định chu kỳ tạm dừng** (vật tư nằm ngoài chu kỳ). Ngày giao hàng là **ngày giao hàng có thể đầu tiên từ ngày sau ngày đặt hàng trở đi mà giữ được lead time**, và **phán định ngày lễ giao hàng・thứ không thể giao・ngày không thể nhận・ngày không thể xuất hàng được thực hiện như bình thường**〔Quyết định v2.3 #38〕 (cũ: cũng không phán định ngày coi là lễ giao hàng・khung không thể xuất hàng, hạn chót・picking・gửi hàng theo chu kỳ tuần của phía vật tư. Thay thế 2026/09/29) | 〔Chu kỳ §4A-2C〕〔Quyết định v2.3 #38〕 |
| Picking | **Quản lý riêng・danh sách riêng・picking riêng với nguyên liệu** | 〔Yêu cầu §2-2〕 |
| Ngưỡng số đơn | **Không bao gồm** (→ 9-3) | 〔Yêu cầu REQ-DL-818〕〔Chu kỳ §5.2〕 |
| **Tổng hợp số đơn** (thêm 2026/09/30) | Ở danh sách dữ liệu giao hàng vật tư, **hiển thị số đơn theo từng ngày dự kiến gửi (ngày xuất hàng), tổng hợp theo loại chuyến giao hàng nguyên liệu (chuyến COOL／chuyến ES) của cơ sở**. Bản thân vật tư là giao thẳng Yamato và loại chuyến vẫn là "chuyến vật tư", nên phân loại **suy ra từ loại chuyến của loại hình giao hàng nguyên liệu (lạnh・đông lạnh) của cùng cơ sở và không lưu vào dữ liệu giao hàng vật tư**. Cách đếm khi loại chuyến chia theo nhóm nhiệt độ ở một cơ sở là **cần xác nhận** | 〔Bảng yêu cầu dòng 124・Quyết_định_phản_ánh_một_phần_bảng_yêu_cầu_trả_lời_20260930〕 |
| Tài xế | **Không đi qua tài xế.** Không có phân công tài xế cũng không có bước thao tác của ứng dụng. **Chỉ quản lý chỉ thị xuất hàng và số phiếu vận chuyển** | 〔Yêu cầu REQ-DL-656〕〔Chu kỳ §4C-3〕 |
| Loại chuyến | **Chuyến vật tư** (`service_form` = 3 giá trị đứng cùng chuyến ES／chuyến COOL). **Chủ sở hữu là loại hình giao hàng (delivery channel), không đặt ở route của hợp đồng** | 〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-875・REQ-DL-830〕 |
| Cách giữ trong hợp đồng | Việc hợp đồng giữ loại hình giao hàng "Vật tư" và giữ phân công kho・công ty giao hàng vẫn như cũ (**chỉ là không tự động tạo từ chu kỳ**) | 〔Chu kỳ §4A-2C・§3.1B〕 |
| Lead time | Vật tư cũng do **loại hình giao hàng của hợp đồng** giữ (master kho không giữ). Phạm vi 0〜7 ngày. **Ý nghĩa giống các loại khác (ngày xuất hàng = ngày giao hàng − lead time)**〔Quyết định v2.3 #38〕 | 〔Quyết định #10／#16／#52・#4〕〔Yêu cầu REQ-DL-831・REQ-DL-832〕 |
| CSV liên kết | CSV xuất hàng vật tư (**dùng để nhập vào Yamato**・có bản đồ định dạng). Khi công ty khác sử dụng cần xác nhận・sửa đặc tả | 〔Yêu cầu §3〕 |

> ⚠️ **Cần xác nhận #28** — Bản thân định nghĩa cột của CSV chỉ thị xuất hàng (tên cột・thứ tự・bắt buộc／tùy chọn・độ dài). Xác định sau khi nhận được đặc tả định dạng của Thomas. Nguyên bản (Chu kỳ §4D-3・Yêu cầu §3) không có danh sách cột. **Phụ lục 4 ngày 2026/09/29: triển khai với các cột tối thiểu của 19.1 trong `配送_12` và làm sao cho chỉ phần xuất có thể thay thế**〔Quyết định v2.3 #45〕 (10-4). Khi nhận được định nghĩa thì chỉ sửa phần xuất

> ⚠️ **Cần xác nhận #29** — Mã ký tự của CSV chỉ thị xuất hàng. Đang xác nhận với nhà cung cấp Thomas về khả năng hỗ trợ UTF-8〔Yêu cầu §8F-5・điểm OPEN〕. **Phụ lục 4 ngày 2026/09/29: nếu không hỗ trợ được thì chuyển sang Shift_JIS khi xuất**〔Quyết định v2.3 #45〕 (10-4)

> ⚠️ **Cần xác nhận #30** — Chỉ thị xuất hàng của Thomas có tồn tại I/F hủy hay không. Vì tiến hành theo phương thức gửi lại (kèm số phiên bản・dừng là số lượng 0) nên triển khai không dừng, nhưng vẫn cần xác nhận với nhà cung cấp〔Danh sách quyết định G〕〔Chu kỳ §4D-3〕. **Phụ lục 4 ngày 2026/09/29: hủy xác định theo phương thức gửi lại. Dù có I/F cũng không dùng**〔Quyết định v2.3 #45〕 (10-3)

> ✅ **Cần xác nhận #31 (đã giải quyết)** — ~~Giờ kho bắt đầu picking trong ngày (thời hạn thực chất của việc gửi lại)~~ → **Giải quyết bằng quyết định đợt 3 ngày 2026/09/22**. Gửi lại **cho đến khi nhận được kết quả xuất hàng** và không giữ giờ bắt đầu〔Quyết định v2.2 #4〕 (10-3)

> ✅ **Cần xác nhận #32 (đã giải quyết)** — ~~Hệ thống mã kho (cho liên kết Thomas) của kho picking. 【Tạm】đang dùng lại ID kho (định dạng WH00001)~~ → Giải quyết ở 2026/10/01 D3-2. Mã kho được vận hành nhập, tách biệt với ID kho (3-1 #8・10-4)〔Quyết định #6〕

> ⚠️ **Cần xác nhận #33** — Ý nghĩa chính xác của tiền tố HU trong ID kho, và ID nơi trung chuyển có được dùng ở phiếu vận chuyển・liên kết CSV・biểu mẫu hay không. 【Tạm】HU = Hub (nơi trung chuyển)〔Quyết định #5〕〔Yêu cầu §8L-5 #5〕

> ✅ **Cần xác nhận #34 (đã giải quyết)** — ~~Điều kiện phán định tự động thay đổi có chứa sản phẩm hạn tiêu thụ ngắn (ngưỡng số ngày còn lại của hạn dùng v.v.)~~ → **Giải quyết ở phụ lục 4 ngày 2026/09/29**. Nếu số ngày từ ngày xuất hàng đến ngày giao hàng ＞ số ngày hạn tiêu thụ − số ngày an toàn (mặc định 2 ngày) thì Cần xác nhận `shelf_life_warning`〔Quyết định v2.3 #35〕 (9-4)

> ✅ **Cần xác nhận #35 (đã giải quyết)** — ~~"Khi có" đơn hàng vật tư là thời điểm nào (mỗi lần xác định giỏ hàng, hay gộp theo hạn chót chu kỳ tuần của phía vật tư)~~ → **Giải quyết ở phụ lục 4 ngày 2026/09/29**. Tạo mỗi khi xác định giỏ hàng, và chuyến vật tư cùng cơ sở・cùng ngày giao hàng・trước chỉ thị xuất hàng thì gộp thành 1 đơn. Chỉ thị xuất hàng là catch-up hằng ngày hiện có〔Quyết định v2.3 #36〕 (10-9)

> ✅ **Cần xác nhận #36 (đã giải quyết)** — ~~Hiển thị dự kiến đến đâu trên trang chuyên dụng của công ty giao hàng (bao nhiêu tháng sau・đến mục nào)~~ → **Giải quyết ở phụ lục 4 ngày 2026/09/29**〔Quyết định v2.3 #34・#51〕 (11-6)

> ✅ **Cần xác nhận #37 (đã giải quyết)** — ~~Vận hành khi muốn xuất hàng vào ngày bị dừng do điều chỉnh~~ → **Giải quyết bằng quyết định đợt 3 ngày 2026/09/22**〔Quyết định v2.2 #2〕 (4-5 Quy tắc 4)

> ⚠️ **Cần xác nhận #38** — Tên chính thức của công ty giao hàng・hệ thống kho. 【Tạm】"Yamato Transport (viết tắt: Yamato)" "Thomas". Xác nhận quan hệ với Kurubin Yamato và cách viết của THOMAS〔Quyết định #58〕〔Yêu cầu §8L-5 #58〕

> ✅ **Cần xác nhận #39 (đã giải quyết)** — ~~Nguồn dữ liệu ngày lễ~~ → Xác định bằng tự động lấy mỗi năm 1 lần từ API ngày lễ công khai + "Lấy lại ngày lễ" (3-5・10-7 #12)〔trả lời của hong 2026-10-03〕〔Quyết định #9〕
