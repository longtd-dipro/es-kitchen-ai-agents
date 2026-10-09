# Đặc tả giao hàng: Thiết lập chu kỳ giao hàng・Tính toán ngày (§4, §6)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (tách theo chương ngày 2026-10-03. Nội dung giữ nguyên như thời điểm tách) -->

## 4. Thiết lập chu kỳ giao hàng (màn hình 01・quản trị viên hệ thống)

Màn hình 01 là màn hình duy nhất tạo ra **chu kỳ giao hàng**, nền tảng của ngày giao hàng và ngày picking. Là màn hình đơn chia trái phải, bên trái đặt lịch, bên phải đặt bảng thiết lập, vừa xác nhận kết quả ở bên trái vừa thao tác ở bên phải 〔Chu kỳ §2.0A・§2.1〕. Các ngày tạo ra ở đây trở thành lịch giao hàng dự kiến (`plan lifecycle` = `draft`), và được tạo thành dữ liệu giao hàng chính thức vào ngày bắt đầu đặt đơn. **Tháng chưa có thiết lập này thì không tạo lịch giao hàng dự kiến lẫn dữ liệu giao hàng. Cũng không hiển thị cho doanh nghiệp và không thể gửi yêu cầu thay đổi** 〔Chu kỳ §2.0B〕.

Cách gọi được **thống nhất là "chu kỳ giao hàng"** (tên file `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` giữ nguyên) 〔Quyết định #20〕〔Yêu cầu REQ-DL-848〕. Các từ "giao hàng" không phải chu kỳ như "ngày giao hàng", "lịch giao hàng dự kiến", "slot giao hàng", "ngày được coi là ngày lễ giao hàng" không đổi. **Trạng thái được đề cập trong chương này chỉ là `plan lifecycle` (`shipping_plans.lifecycle` = `draft` / `published` / `locked`)**, là một máy trạng thái khác với `delivery status` (chờ xuất / đã xuất / … / đã giao) bên dữ liệu giao hàng. **Không gọi gộp cả hai là "trạng thái"** 〔Quyết định v2.1 S5〕〔Yêu cầu REQ-DL-883〕.

**Vai trò `quản lý kho` không tồn tại** 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885・680〕. Việc đăng ký khung không xuất được・ngày không xuất được và việc lưu màn hình 01 **đều do vận hành (logistics) thực hiện**. "**Tab kho**" trên màn hình **chỉ là bộ lọc dữ liệu, không phải đơn vị phân quyền** (chuyển tab cũng không thay đổi người xem được hay việc làm được) 〔Chu kỳ §11-3〕.

### 4-1 Cách giữ chu kỳ

| Mục | Quy tắc | Nguồn |
|---|---|---|
| Số khung | **28 khung**. 4 tuần (A/B/C/D) × 7 ngày (1〜7) thành `A1`〜`D7` | 〔Chu kỳ §0・§2.3〕〔Yêu cầu REQ-DL-101・501・632〕 |
| Cách đọc khung | **Tuần × thứ**. `A6` = thứ Bảy tuần A, `B5` = thứ Sáu tuần B. **Cùng một thứ nhưng mỗi tuần có thể đổi làm việc・nghỉ** (chỉ chỉ định theo thứ thì không biểu diễn được ngày nghỉ cách tuần của tuần B・tuần D) | 〔Chu kỳ §0・§2.3〕〔Yêu cầu REQ-DL-632〕 |
| 1 chu kỳ | **4 tuần = 28 ngày** (nếu không có tạm dừng) | 〔Chu kỳ §4.2〕 |
| Thứ của `A1` | **Bắt buộc là thứ Hai.** Nếu nhập ngày không phải thứ Hai thì làm tròn về thứ Hai ngay trước đó để tạo, và hiển thị kết quả làm tròn trên màn hình (cũ: bắt đầu từ Chủ nhật 〔Yêu cầu REQ-DL-203〕. Sửa đổi 2026/09/12) | 〔Yêu cầu REQ-DL-614〕 |
| Slot quyết định gì | **Chỉ ngày giao hàng.** Ngày picking luôn tính ngược bằng `ngày giao hàng − lead time`. Chiều này không đổi ở mọi chế độ | 〔Chu kỳ §0〕 |
| Giá trị mặc định `A1` lần đầu | **Tiếp nối chu kỳ lần trước** (ngày sau `D7` của chu kỳ ngay trước). Ghi kèm căn cứ và có thể đổi bằng tay. Khi đổi thì chuyển huy hiệu từ "Tiếp nối chu kỳ trước" sang "Nhập tay", bắt xác nhận **số ngày chênh lệch so với phần tiếp nối** và việc có phát sinh khoảng thời gian không tạo được lịch dự kiến hay không. Quay lại bằng "Quay về phần tiếp nối". Ví dụ hiển thị căn cứ: 『Chu kỳ lần trước: chu kỳ tháng 10 (2026-09-28 A1 〜 2026-10-25 D7). Tiếp tục từ ngày hôm sau 2026-10-26.』 Khi đổi tháng bắt đầu, nếu chưa nhập tay thì `A1` lần đầu cũng đi theo 〔Nguồn gốc: Thiết lập chu kỳ giao hàng §2.1〕 | 〔Chu kỳ §2.1〕 |
| Số chu kỳ | **1 chu kỳ. Không có riêng cho xuất hàng và giao hàng.** Việc không xuất được cũng dùng cùng lưới `A1`〜`D7`, và được xác định bằng **khung của chính ngày picking** (phương án "lịch + thứ không xuất được" không được chọn vì cách đọc bị kép, phương án "thêm 1 chu kỳ dành riêng cho xuất hàng" không được chọn vì phải quản lý ngày đầu・tạm dừng・độ lệch ở cả 2 chu kỳ) | 〔Chu kỳ §2.3〕〔Yêu cầu REQ-DL-804〕 |

#### Tháng chu kỳ = tháng mà khung thứ 14 `B7` thuộc về

**`cycle_month` = tháng mà khung thứ 14 `B7` thuộc về** 〔Quyết định v2.1 #11〕〔Yêu cầu REQ-DL-881・839・864〕〔Chu kỳ §4.2・§7〕. **Không tạo nhánh ngoại lệ.**

| Vấn đề | Quy tắc |
|---|---|
| Định nghĩa | **Năm tháng mà ngày của `B7` thuộc về** (`yyyy-mm`). Suy ra từ `delivery_cycles.b7_date` |
| Quan hệ với "tháng có nhiều ngày hơn" | **Luôn cho cùng kết quả.** Vì ranh giới giữa 14 ngày đầu và 14 ngày sau của 28 ngày nằm giữa `B7` và `C1`, nên tháng có nhiều ngày hơn chắc chắn chứa `B7` |
| 14 và 14 bằng nhau | **Tự động là tháng trước** (vì `B7` rơi vào ngày cuối của tháng trước). **Không có phân nhánh cho trường hợp bằng nhau** |
| Đối tượng đếm | **Chỉ ngày của khung.** Ngày tạm dừng chu kỳ không tiêu thụ khung nên không tính vào. Dù tạm dừng làm độ dài trên lịch kéo dài, vị trí của `B7` được quyết định bởi thứ tự khung nên tháng chu kỳ không đổi |
| ID hợp đồng con | `yyyymm` trong `ID hợp đồng-yyyymm` cũng theo cùng quy tắc. **1 chu kỳ = 1 hợp đồng con**, dù vắt qua tháng cũng gắn vào hợp đồng con của tháng chu kỳ |
| Ví dụ | `A1` = 2026-09-07 → 9/07〜10/11 (28 ngày trừ tạm dừng 9/21〜27. Ngày 17 tháng 9・ngày 11 tháng 10) ／ `B7` = 2026-09-20 → **tháng 9 năm 2026** (2026/10/01 thống nhất lịch). Ví dụ **bằng nhau**: `A1` = 2027-01-18 → 1/18〜2/14 (14 ngày・14 ngày) ／ `B7` = 2027-01-31 → **tháng 1 năm 2027** (tháng trước) |
| Quan hệ với bản cũ | Đợt 1 #41 "tháng có nhiều ngày hơn. 14 và 14 chưa quyết・tạm thời là tháng của `B7`" được thống nhất ở đợt 2 thành "tháng mà `B7` thuộc về" và giải quyết mục chưa quyết. **Xóa ⚠️ cần xác nhận #10 của v2.0** |

### 4-2 Khoảng thời gian tạo

| Mục | Quy tắc | Nguồn |
|---|---|---|
| Độ dài | **6 tháng tính cả tháng bắt đầu (cơ bản 6 tháng)**. Thống nhất phạm vi thiết lập・hiển thị cho doanh nghiệp・yêu cầu thay đổi đều là cùng 6 tháng đó (cũ: tối đa 12 tháng 〔Yêu cầu REQ-DL-306〕. Sửa đổi 2026/09/12・xác nhận 2026/09/21) | 〔Yêu cầu REQ-DL-615〕 |
| Khi vượt | Làm tròn về tháng bắt đầu + 5 tháng và hiển thị thông báo | 〔Chu kỳ §2.3〕 |
| Gia hạn | **Chỉ lùi tháng kết thúc.** Không tạo thiết lập mới (thiết lập chu kỳ giao hàng luôn chỉ có một) | 〔Chu kỳ §2.0A〕〔Yêu cầu REQ-DL-717〕 |
| Tạo cuốn chiếu | **Không làm.** Lịch dự kiến chỉ được tạo **khi lưu**, và chỉ cho phần của khoảng thời gian đã thiết lập. **Batch không tự động thêm vào cuối khoảng thời gian**, batch không tính ngày mà chỉ chốt các lịch dự kiến đã có (cũ: batch hằng tháng thêm 1 tháng vào cuối 〔Yêu cầu REQ-DL-608〕. Bãi bỏ 2026/09/19) | 〔Yêu cầu REQ-DL-809〕 |
| Phán định "đã thiết lập" | Có đủ ①`A1` lần đầu ②chu kỳ giao hàng ③thiết lập tạm dừng・không xuất được bắt buộc ④kết quả tính ngày giao hàng của tháng đối tượng — và **tính được ngày giao hàng bình thường**. Dù có giá trị nhập, **nếu có lỗi tính toán thì coi như chưa thiết lập**, không công khai được cả thủ công lẫn tự động. Tháng có lỗ hổng・tháng sau khoảng thời gian tạo cũng là "chưa thiết lập" | 〔Chu kỳ §2.0C-5〕 |

**Giá trị mặc định của tháng bắt đầu = tháng đầu tiên chưa thiết lập** 〔Yêu cầu REQ-DL-821〕〔Chu kỳ §2.0C-1〕

| Tình huống | Tháng bắt đầu ban đầu | Ví dụ (khi đã chốt đến 2026-10) |
|---|---|---|
| **Có lỗ hổng** (giữa phần đã chốt và phần đã thiết lập bị trống) | **Tháng đầu tiên của lỗ hổng** | Đã thiết lập 2026-12〜2027-05 → tháng 11 năm 2026〜tháng 4 năm 2027 |
| **Không có lỗ hổng** | **Tháng sau tháng cuối cùng đã thiết lập** | Đã thiết lập 2026-11〜2027-04 → tháng 5〜tháng 10 năm 2027 |
| **Chưa thiết lập gì** (triển khai ban đầu) | **Tháng giới hạn dưới (= tháng sau nữa)** | Thời điểm tháng 8 năm 2026 → tháng 10 năm 2026〜tháng 3 năm 2027 |

**Tháng sau nữa không phải giá trị mặc định mà là giới hạn dưới.** Tháng đã công khai menu thì không sửa được, và vì công khai menu = bắt đầu đặt đơn là ngày 1 tháng trước, nên **tháng hiện tại (đang vận hành giao hàng) và tháng sau (đã công khai) không sửa được**, giới hạn dưới là tháng sau nữa. Tháng hiện tại・tháng sau không hiển thị ở dropdown lẫn tab tháng 〔Yêu cầu REQ-DL-709・803〕. Khi đổi tháng bắt đầu mà tháng đang chọn nằm ngoài khoảng thời gian thì quay về tháng bắt đầu. Hiển thị gợi ý khoảng thời gian có thể thiết lập gần ô chọn (ví dụ: `Không thể thay đổi tháng đã công khai menu. Hãy chọn từ tháng 10 năm 2026 trở đi.`) 〔Nguồn gốc: Thiết lập chu kỳ giao hàng §2.0C-2〕. **Nhấp vào tháng trong dải trạng thái thiết lập thì tháng bắt đầu chuyển sang tháng đó** 〔Yêu cầu REQ-DL-822〕. Là lối vào khi sửa nội dung của tháng đã thiết lập, và nếu việc quay lại làm phát sinh lỗ hổng với phần đã chốt thì hiển thị cảnh báo lỗ hổng. **Nếu khoảng thời gian đối tượng có tháng đã thiết lập thì nêu rõ trong bản xem trước trước khi lưu** 〔Yêu cầu REQ-DL-823〕 (`Khoảng thời gian này bao gồm 3 tháng đã thiết lập (2027-02〜2027-04). Lịch giao hàng dự kiến của các tháng này sẽ được tạo lại.`).

- **"Tháng đã bắt đầu nhận đơn hoặc xử lý giao hàng" = tháng mà kỳ đặt đơn đã bắt đầu** (bắt đầu đặt đơn = công khai menu = ngày 1 tháng trước). Không xác định bằng việc có đơn đầu tiên hay việc đã phát lệnh xuất hàng hay chưa 〔hong trả lời 2026-10-03〕〔Yêu cầu REQ-DL-708 (09/14)〕.

#### Dải trạng thái thiết lập 〔Chu kỳ §2.0B〕〔Yêu cầu REQ-DL-718〕

Hiển thị **toàn chiều rộng** ở phần trên cùng của màn hình 01. Không tách sang màn hình khác. Hàng trên = trạng thái thiết lập chu kỳ giao hàng (tô màu theo từng ô tháng từ tháng bắt đầu vận hành đến tháng kết thúc của khoảng thời gian tạo + 6 tháng), hàng dưới = tình trạng công khai menu của cùng dãy tháng (đang vận hành／đã công khai = không sửa được／đang chuẩn bị công khai／chưa công khai). **Tháng chưa thiết lập chu kỳ giao hàng được gắn `!`**.

| Trạng thái của tháng | Ý nghĩa |
|---|---|
| Đã chốt (không sửa được) | Tháng hiện tại đang vận hành giao hàng・tháng đã công khai menu・tháng đã bắt đầu nhận đơn／xử lý giao hàng. **Bất kể quyền hạn** đều không sửa được ("đã bắt đầu nhận đơn／xử lý giao hàng" = tháng mà kỳ đặt đơn đã bắt đầu 〈`orderFrom` của menu tháng. Nếu chưa có menu thì ngày 1 tháng trước〉〔hong trả lời 2026-10-03〕. Tháng đã tạo dữ liệu giao hàng cũng không sửa được) |
| Đã thiết lập (sửa được) | Tháng nằm trong khoảng thời gian tạo, chưa vào vận hành |
| Chưa thiết lập (lỗ hổng) | Tháng giữa phần đã chốt và khoảng thời gian tạo bị trống. **Không tạo lịch dự kiến lẫn dữ liệu giao hàng** |
| Chưa thiết lập (sắp tới) | Tháng sau khoảng thời gian tạo. Chỉ là chưa thiết lập |
| Nội dung hiển thị dưới dải | Khoảng thời gian đối tượng thiết lập／`A1` lần đầu／phạm vi đã chốt và lý do／nội dung thiết lập này (tạm dừng chu kỳ ◯ mục・ngày được coi là ngày lễ giao hàng ◯ ngày・khung không xuất được theo kho và ngày không xuất được theo ngày). Thiết lập của tháng đã chốt không thay đổi được, nhưng nội dung được lưu ở **lịch sử thay đổi** (khi nào・ai・ở đâu・gì・số lượng ảnh hưởng), và căn cứ của lịch dự kiến quá khứ được truy theo lịch sử này 〔Chu kỳ §2.0A〕 |
| Cảnh báo lỗ hổng | `Có tháng chưa có thiết lập: 2026-11　Tháng này không tạo lịch giao hàng dự kiến lẫn dữ liệu giao hàng. Cũng không hiển thị cho doanh nghiệp và không thể gửi yêu cầu thay đổi.` (tháng bắt đầu mặc định sẽ là tháng này nên cứ lưu là lấp được) |

**Cảnh báo trước khi hết hạn chỉ hiển thị trong màn hình. Không tạo thông báo dashboard** 〔Quyết định #14〕〔Yêu cầu REQ-DL-844〕〔Chu kỳ §2.0B〕

| Nội dung hiển thị | Nội dung không hiển thị |
|---|---|
| **①Tháng cuối cùng đã thiết lập ②Số tháng còn lại** (luôn hiển thị dưới dải). **Còn dưới 2 tháng thì màu cảnh báo**. Câu: `Tháng cuối cùng đã thiết lập là tháng 1 năm 2027 (còn 5 tháng). Đã chốt (không sửa được) đến tháng 10 năm 2026, có thể thay đổi từ tháng 11 năm 2026.` | Thông báo dashboard／email・push／**cơ chế đếm ngày để nhắc**. Vì việc bỏ sót thiết lập **chắc chắn bị chặn ở cổng công khai menu** (4-3) nên không cần nhắc. Việc luôn hiển thị dải được giữ lại như "hiển thị trạng thái" chứ không phải "nhắc nhở" |

### 4-3 Kết nối với công khai menu và hạn chót tạm

**Các mốc lấy bên menu làm chuẩn. Khi tạo chu kỳ thì sao chép ngày thực và giữ lại** 〔Quyết định #33〕〔Yêu cầu REQ-DL-840〕〔Chu kỳ §4A-2〕

| Mốc | Nguồn | Giá trị mặc định của demo | Ví dụ chu kỳ tháng 9 năm 2026 (`A1` = 2026-09-07) |
|---|---|---|---|
| **Công khai menu = bắt đầu đặt đơn** | Bên menu (bắt đầu kỳ đặt đơn) | Ngày 1 tháng trước | 2026-08-01 |
| (Đăng ký menu) | Bên menu | Đến ngày công khai | 〜2026-08-01 |
| **Hạn chót đặt đơn** (chốt số lượng + kết thúc tiếp nhận đổi ngày) | Bên menu (kết thúc kỳ đặt đơn) | Ngày 15 tháng trước | 2026-08-15 |

**Không phải mỗi lần đều đi lấy menu.** **Giữ trong chu kỳ** các ngày thiết lập của menu tại thời điểm tạo chu kỳ (`delivery_cycles.menu_open_date` ／ `order_start_date` ／ `order_close_date`), và dùng giá trị đã giữ trên màn hình・phán định batch・lịch của doanh nghiệp. Để biết nguồn sao chép thì giữ kèm `marker_source` (`menu` ／ `provisional`) và `marker_copied_at` 〔Chu kỳ §7〕. Vì chu kỳ (4 tuần) và menu (tháng dương lịch) có chu kỳ khác nhau, nên dùng **menu của tháng chu kỳ** làm các mốc của chu kỳ đó (cách xác định tháng chu kỳ ở 4-1). **Khi triển khai không dùng ngày hằng số mà phán định bằng ngày thực đã giữ.** Ngoài ra **không có hạn chót thay đổi** (cũ: 6 ngày trước `A1`. Bãi bỏ 2026/09/15 và gộp vào hạn chót đặt đơn). Công khai menu và bắt đầu đặt đơn là **cùng một ngày**, cũng không có giai đoạn "công khai〜trước khi bắt đầu đặt đơn".

#### Việc làm được・không làm được với hạn chót tạm (`marker_source = provisional`)

Với tháng chưa đăng ký menu thì không lấy được ngày hạn chót đặt đơn, nên giữ **ngày 15 tháng trước làm hạn chót tạm** để tiếp tục phán định 〔Quyết định #33〕〔Yêu cầu REQ-DL-811〕. **Tuy nhiên các xử lý được chạy với hạn chót tạm bị giới hạn** 〔Quyết định v2.1 #9〕〔Yêu cầu REQ-DL-879〕〔Chu kỳ §4A-2E〕.

| Xử lý | Hạn chót tạm (`provisional`) | Hạn chót thật (`menu`) |
|---|---|---|
| **Đóng tiếp nhận thay đổi** (tắt chế độ đổi ngày) | **Chạy** | Chạy |
| **Khởi chạy kiểm tra** (đối chiếu như `plan_recheck`・tạo mục cần xác nhận) | **Chạy** | Chạy |
| **Chốt số lượng** (`order_finalize`・chốt theo số lượng chuẩn／chế độ AI) | **Không chạy** | Chạy |
| **Gửi email xác nhận** (thông báo xác nhận cho doanh nghiệp・công ty giao hàng ủy thác) | **Không chạy** | Chạy |
| **Lệnh xuất hàng** (gửi cho Thomas. Do đó cũng không đặt `plan lifecycle` = `locked`) | **Không chạy** | Chạy |

- **Cho đến khi menu gửi hạn chót thật, không chạy chốt số lượng・gửi email xác nhận・lệnh xuất hàng.** Hạn chót tạm là **giá trị mặc định để phán định nội bộ**, không phải ngày đã hứa với doanh nghiệp hay kho. Nếu chốt số lượng bằng ngày tạm rồi đẩy đến lệnh xuất hàng, thì khi menu được đăng ký sau đó và hạn chót thay đổi sẽ không thể lấy lại được 〔Yêu cầu REQ-DL-810・812〕. Trên màn hình hiển thị kèm **"Tạm (ngày 15 tháng trước)"** ở ngày hạn chót, và khi menu được đăng ký thì thay bằng ngày thực. Sau khi thay và `marker_source = menu`, `order_finalize` trở đi mới được lấy làm đối tượng. **(Cũ: đợt 1 #33 không có giới hạn "phạm vi được làm với hạn chót tạm". Đợt 2 đã giới hạn như bảng trên)**

#### Kiểm tra thiết lập trước khi công khai 〔Chu kỳ §2.0C-3・§2.0C-4〕〔Yêu cầu REQ-DL-711・712〕

| Tình huống | Hành vi |
|---|---|
| Công khai thủ công | Hộp thoại lỗi "Không thể công khai menu／Chưa thiết lập chu kỳ giao hàng của tháng 9 năm 2026. Hãy thiết lập chu kỳ giao hàng rồi công khai lại." + "Thiết lập chu kỳ giao hàng" "Hủy". Nút trước **chuyển sang màn hình 01 với tháng đối tượng đã được chỉ định** |
| Công khai tự động | Hủy công khai và để menu đối tượng **ở trạng thái chưa công khai**. Hiển thị lý do trên màn hình quản trị (`Menu tháng 9 năm 2026 không được công khai tự động vì chưa thiết lập chu kỳ giao hàng.`). **Không dừng việc công khai của các tháng khác**. Nếu có chức năng thông báo cho quản trị viên thì thông báo cùng nội dung 〔Nguồn gốc: Thiết lập chu kỳ giao hàng §2.0C-3〕〔Yêu cầu REQ-DL-713 (09/14)〕 |
| Cảnh báo trước | Hiển thị chưa thiết lập cả ở màn hình chuẩn bị công khai・danh sách menu (`Lỗi chuẩn bị công khai: Chưa thiết lập chu kỳ giao hàng của tháng 9 năm 2026`), và **vô hiệu hóa nút công khai**. Hiển thị lý do vô hiệu hóa và lối dẫn đến màn hình 01 |

### 4-4 Ngày làm việc・thứ không giao hàng được

`Ngày được coi là ngày lễ giao hàng = Ngày lễ đã đăng ký trong hệ thống (mặc định BẬT) + Ngày nghỉ thủ công đã BẬT − Ngày đã TẮT bằng Override theo ngày`

| Quy tắc | Nội dung | Nguồn |
|---|---|---|
| Tự động phán định thứ | **Không làm** (vì kho gần như không nghỉ). Việc có giao được vào thứ Bảy・Chủ nhật hay không được điều khiển bằng **thứ không giao hàng được** bên hợp đồng | 〔Chu kỳ §2.3〕 |
| Cách có hiệu lực | Không phải không giao hàng được áp dụng cho toàn công ty. **Chỉ công ty có "không giao hàng ngày lễ" BẬT trong hợp đồng** mới được dời ngày giao hàng. Công ty TẮT thì giao như bình thường | 〔Chu kỳ §2.3〕 |
| Ngày nghỉ thủ công | Ngoài tên ngày nghỉ + ngày, chọn riêng "lễ giao hàng" và "không xuất được" để thêm. **Bắt buộc ít nhất một trong hai** | 〔Chu kỳ §2.3〕 |
| Phạm vi chung toàn công ty | **Khoảng thời gian tạm dừng chu kỳ và ngày được coi là ngày lễ giao hàng là chung toàn công ty**. Vì bản thân chu kỳ giao hàng (28 khung) là chung toàn công ty, nên việc nghỉ theo từng kho được biểu diễn bằng khung không xuất được・ngày không xuất được | 〔Chu kỳ §2.3〕 |
| Dữ liệu ngày lễ | **Lấy từ API ngày lễ được công bố rồi đăng ký vào master ngày lễ** (tự động lấy mỗi năm 1 lần + "Lấy lại ngày lễ" trên màn hình). Vận hành có thể thêm・sửa・xóa (2026/10/01 thay đổi・xác nhận của vận hành D3-3. Cũ: 【Tạm thời】đăng ký thủ công mỗi năm 1 lần từ dữ liệu công khai của Văn phòng Nội các, không làm nhập từ API ngoài). Màn hình hiển thị số lượng và danh sách ngày lễ của khoảng thời gian đối tượng, thời điểm lấy gần nhất và nút "Lấy lại ngày lễ" | 〔Quyết định #9〕〔hong trả lời 2026-10-03〕〔Chu kỳ §6〕〔Yêu cầu REQ-DL-307〕 |

Bên nhận được giữ theo **đơn vị hợp đồng (cơ sở)** 〔Chu kỳ §3.1・§3.1C〕. Tên mục được thống nhất là **"Thứ không giao hàng được" "Dời sớm・Dời muộn"** (không dùng "thứ không nhận được" "hướng dời") (không đổi tên vật lý `ng_weekdays` ／ `holiday_shift`) 〔Quyết định #31〕〔Yêu cầu REQ-DL-849〕.

| Mục | Nội dung |
|---|---|
| **Thứ không giao hàng được** | Mặc định: Bảy = BẬT・CN = BẬT・Lễ = BẬT. **Chỉ điều khiển ngày giao hàng**, không điều khiển ngày picking. Không áp dụng đồng loạt cho doanh nghiệp |
| **Ngày không nhận được của cơ sở** | Ngày không nhận hàng được (nghỉ・kiểm kê・thi công・cuối năm đầu năm). Có 3 loại `date` ／ `range` ／ `dow` và lặp lại `none` ／ `yearly`. **Có tác dụng như điều kiện tạo ngày giao hàng nên dù tạo lại thiết lập chu kỳ vẫn tự động tránh được** |
| **Dời sớm・Dời muộn** | Mặc định là "dời sớm" (−1). Dùng cùng một giá trị bất kể chế độ, không có hướng đặc biệt cho tạm dừng・ngày lễ |
| Khung giờ nhận・điều kiện giao hàng | **Không dùng** để tính ngày. Khung giờ nhận được **giữ nhiều** bằng bảng con `site_receive_windows(site_id, from_time, to_time, sort_order)`, và khi tạo dữ liệu giao hàng thì **chụp snapshot nguyên danh sách** vào `delivery_receive_windows` để hiển thị trên ứng dụng tài xế. **Không dùng dạng chỉ giữ 1 cặp from/to** 〔Quyết định v2.1 #8〕〔Yêu cầu REQ-DL-877・878〕 |
| (Chung) Cấm cố định thứ | **Không thể hiện Chủ nhật・thứ Bảy là không xuất được・không giao được cố định.** Việc khung không xuất được mặc định có `A7`〜`D7` (Chủ nhật) là **giá trị mặc định chứ không phải giá trị cố định**. Ở lịch・lịch trình・ngày ứng viên đều không cố định theo thứ, mà xem khung không xuất được của kho đó và thứ không giao hàng được của hợp đồng đó 〔Yêu cầu REQ-DL-818〕 |

### 4-5 Tạm dừng chu kỳ

**Hình 2: Cách đếm tạm dừng chu kỳ** (hiển thị dạng hình trong bản HTML) — Ngày tạm dừng không tiêu thụ khung, khung được tiếp tục từ ngày sau khi hết tạm dừng. Nếu số ngày tạm dừng không phải bội số của 7 thì thêm "điều chỉnh" để làm tròn thành đơn vị 7 ngày, nên A1・C1 kế tiếp chắc chắn vẫn là thứ Hai (**vị trí đặt ngày điều chỉnh do quản trị viên quyết định**).

<!-- FIG: fig-cycle-slots -->

| Mục | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| Tên kỳ | string | ○ | Nghỉ hè／Nghỉ cuối năm đầu năm／Nghỉ Tuần lễ Vàng／Nghỉ đột xuất (có gợi ý). Loại dùng để điều chỉnh là **"Điều chỉnh"** (`delivery_cycle_pauses.kind = adjust`) |
| Ngày bắt đầu・ngày kết thúc | date | ○ | Ngày kết thúc từ ngày bắt đầu trở đi. **Cho phép chồng lấn khoảng thời gian** (ngày chồng lấn coi là 1 ngày). Chưa nhập・ngày kết thúc < ngày bắt đầu là lỗi và không lưu được |
| Số ngày | int | Tự động | `ngày kết thúc − ngày bắt đầu + 1` |
| Ảnh hưởng đến chu kỳ | Hiển thị cố định | — | "Không tiêu thụ khung／tiếp tục khung từ ngày sau khi hết tạm dừng" |
| (Thao tác・KPI) | — | — | Thêm・sửa bằng modal, xóa ngay từ danh sách. KPI là số mục khoảng thời gian tạm dừng／tổng số ngày tạm dừng／số ngày được coi là ngày lễ giao hàng／số ngày không xuất được／ảnh hưởng đến chu kỳ 〔Chu kỳ §2.2〕 |

| Quy tắc | Nội dung | Nguồn |
|---|---|---|
| **1. Trong thời gian tạm dừng không giao hàng cũng không picking (ưu tiên cao nhất)** | **Không gán slot giao hàng** cho ngày trong khoảng thời gian tạm dừng. Vì **ưu tiên hơn mọi thiết lập khác**, nên dù trùng với ngày được coi là ngày lễ giao hàng・không xuất được thì tạm dừng vẫn thắng, và ngày tạm dừng **không thực hiện cả việc phán định ngày lễ・không xuất được** | 〔Chu kỳ §2.2・§4.2〕〔Yêu cầu REQ-DL-307〕 |
| **2. Ngày tạm dừng không tiêu thụ khung** | Khung bị dừng **được tiếp tục lần lượt từ ngày sau khi hết tạm dừng** (không phải tiến sang khung kế tiếp). **Toàn bộ chu kỳ bị lùi ra sau đúng số ngày tạm dừng, số lần giao hàng không giảm**. Số lần giao hàng・số lượng gói・thanh toán của chu kỳ đó không đổi | 〔Chu kỳ §2.2・§4.2〕〔Yêu cầu REQ-DL-807〕 |
| **3. Chỉ dừng ngày đã đăng ký** | Không làm tròn theo tuần. Khung bị dừng quay lại lần lượt từ ngày kế tiếp. Tuy nhiên nếu để nguyên thì tương ứng khung và thứ bị lệch, nên bắt buộc phải làm cùng việc điều chỉnh ở quy tắc 4 (**nếu chưa đủ bội số của 7 thì không lưu được**) | 〔Chu kỳ §2.2〕〔Quyết định v2.2 #2〕 |
| **7. Khi đăng ký thì xác nhận gộp số lượng ảnh hưởng** | Ở bản xem trước trước khi lưu, hiển thị **khoảng thời gian tạm dừng sau khi làm tròn (số ngày điều chỉnh)** và số lịch dự kiến bị lùi ra sau, và **chỉ đưa các trường hợp ngoại lệ thành "cần xác nhận" riêng lẻ**. Không bắt xác nhận từng mục một | 〔Yêu cầu REQ-DL-808〕 |

**Quy tắc 4: 1 lần tạm dừng là bội số của 7 ngày. Hệ thống chỉ tính và hiển thị số ngày tạm dừng "(điều chỉnh)" còn thiếu, vị trí đặt do quản trị viên quyết định** 〔Quyết định v2.2 #2〕〔Chu kỳ §2.2 "Điều chỉnh độ lệch"〕〔Yêu cầu REQ-DL-819・820・887〕

> **Số ngày thiếu = `7 −（số ngày tạm dừng mod 7）`**　Ví dụ: tạm dừng 3 ngày → thiếu **4 ngày**
> **Hệ thống chỉ tính và hiển thị, không tự động chèn.** **Vị trí đặt do quản trị viên quyết định** — ngay sau tạm dừng／rải trong tuần đó／gom vào cuối tháng, tùy trường hợp đều được, và **có thể sửa sau**.
> **Nếu chưa đủ bội số của 7 thì không lưu được.** Khi lưu thì trả về số ngày thiếu.
> Tạm dừng dùng để điều chỉnh giữ **`adjust_for_pause_id` cho biết bù cho lần tạm dừng nào**.
> **(Cũ: tự động chèn điều chỉnh `7 −（số ngày tạm dừng mod 7）` ngày ngay sau tạm dừng. Hủy bỏ theo quyết định đợt 3 ngày 2026/09/22)**

| Ví dụ (`A1` lần đầu = 2026-08-03 thứ Hai／đã thực hiện đến `B1` = 8/10・`B2` = 8/11) | Ngày của `B3` | `A1` kế tiếp |
|---|---|---|
| Không tạm dừng | 8/12 (thứ Tư) | 8/31 (thứ Hai) = 8/3 + 28 ngày |
| Chỉ tạm dừng 8/12〜8/14 (3 ngày) | 8/15 (thứ Bảy) … **lệch thứ** | 9/3 (thứ Năm) … **không còn là thứ Hai** |
| Ngay sau đó **tạm dừng để điều chỉnh** 8/15〜8/18 (4 ngày) | **8/19 (thứ Tư)** ← đúng thứ | **9/7 (thứ Hai)** ← vẫn là thứ Hai |

Nếu tạm dừng nguyên cả tuần thì tuần sau khi hết tạm dừng tiếp tục với cùng mã tuần (ví dụ: tuần A 8/3〜8/9 → tạm dừng 8/10〜8/16 → tuần B 8/17〜, B1 là thứ Hai) 〔Nguồn gốc: Thiết lập chu kỳ giao hàng §2.2〕.

**Cách tiến sau khi làm tròn**: tạm dừng 8/12〜8/14 → điều chỉnh 8/15〜8/18 → `B3` = 8/19 (thứ Tư) → `B4` = 8/20 (thứ Năm) → `B5`〜`B7` = 8/21・8/22・8/23 → `C1` kế tiếp = 8/24 (thứ Hai). **Không làm tròn theo tuần dương lịch (bắt đầu từ thứ Hai) mà tính 7 ngày kể từ ngày đầu tiên của tạm dừng** (để không kéo theo `B1` = 8/10, `B2` = 8/11 đã thực hiện). **Số ngày thiếu chỉ do hệ thống tính và hiển thị** (`8/12〜8/14 (3 ngày) không phải đơn vị 7 ngày. Hãy đặt thêm "điều chỉnh" 4 ngày nữa`), **đặt ở đâu do quản trị viên quyết định** 〔Quyết định v2.2 #2〕. Tạm dừng dùng để điều chỉnh được giữ với loại "Điều chỉnh", giữ `adjust_for_pause_id` cho biết bù cho lần tạm dừng nào, và hiển thị phân biệt ở lịch・lịch sử thay đổi. Ví dụ trên là cách tiến khi **đặt ngay sau tạm dừng**, không phải cách đặt duy nhất.

**Khác biệt theo vị trí đặt (tư liệu để quản trị viên phán đoán)**: Nếu đặt ngay sau tạm dừng thì các khung từ 8/15 trở đi quay về thứ ban đầu nhanh nhất. Nếu gom vào cuối tháng thì số ngày dừng (tổng 7 ngày) và `A1` kế tiếp (9/7 thứ Hai) đều giống nhau, nhưng 8/15〜8/27 **vẫn bị lệch 3 ngày** (`B4` rơi vào Chủ nhật, `A6`・`A7` rơi vào thứ Tư・thứ Năm), và trong thời gian đó phán định khung không xuất được・phán định thứ không giao hàng được・hiển thị lịch doanh nghiệp・ngày ứng viên của yêu cầu thay đổi・ngưỡng số lượng đều không đúng theo thứ. **Đề xuất mặc định là "ngay sau tạm dừng"**, và quản trị viên di chuyển khi không muốn dừng bằng điều chỉnh những ngày kho thực tế đang hoạt động, v.v.

**Quy tắc 5: Việc dùng tạm dừng hay coi là ngày lễ được phân biệt bằng "phải dời bao nhiêu ngày thì giao được"** (không quyết định bằng việc nghỉ nguyên tuần hay một phần) 〔Chu kỳ §2.2〕

| Tình huống | Cách đăng ký | Cách chu kỳ tiến | Ngày giao hàng |
|---|---|---|---|
| Kỳ nghỉ ngắn **dời 1〜2 ngày** là giao được (ngày lễ đơn lẻ, v.v.) | **Ngày được coi là ngày lễ giao hàng** (+ nếu cần thì **ngày không xuất được** của kho) | Tiến (tiêu thụ khung) | Dời sang "dời sớm・dời muộn" của hợp đồng |
| Kỳ nghỉ dài phải **dời từ 3 ngày trở lên** mới giao được (GW・Silver Week・cuối năm đầu năm・nghỉ hè) | **Tạm dừng chu kỳ** | **Dừng** (không tiêu thụ khung) | Tiếp tục khung đã dừng từ ngày sau khi hết tạm dừng |
| (Chú) | "1〜2 ngày／từ 3 ngày" này là **mức tham khảo vận hành về việc đăng ký bằng cách nào**, **không phải ngưỡng để cắt việc dời**. Không đặt giới hạn trên của hệ thống cho số ngày dời 〔Yêu cầu REQ-DL-806〕 | — | — |

**Quy tắc 6: Khung tiếp tục sau khi hết tạm dừng chỉ dời muộn** 〔Chu kỳ §4.4〕〔Yêu cầu REQ-DL-825〕

Với lần có khung bị lệch do tạm dừng, việc dời do ngày lễ・thứ không giao hàng được・ngày không nhận được của cơ sở sau đó **chỉ tìm theo hướng dời muộn**. **Dù hợp đồng đặt "dời sớm", riêng lần này không dời sớm.** Vì khung đó là khung đã **bị dừng** do tạm dừng, nên giao vào ngày trước tạm dừng sẽ là "giao khung đã dừng trước khi dừng" (ví dụ: nếu `C6` (thứ Bảy) được tiếp tục sau tạm dừng 9/19〜9/25 là thứ không giao hàng được, thì dời sớm sẽ quay ngược vắt qua tạm dừng đến 9/18 (thứ Sáu)). Với lần thông thường không dính tạm dừng thì theo **"dời sớm・dời muộn" của hợp đồng**, và cả khi chỉ định riêng (ngày N hằng tháng／ngày cuối tháng) trùng đúng ngày tạm dừng thì cũng di chuyển theo **thiết lập của hợp đồng** (ngày chỉ định không phải khung nên được phép quay về trước tạm dừng). Vốn dĩ **ngày tạm dừng không có `seed` (ngày của slot)** nên "dời do tạm dừng" không xảy ra, và việc dời chỉ xảy ra khi ngày của slot trùng với ngày được coi là ngày lễ giao hàng・thứ không giao hàng được・ngày không nhận được của cơ sở.

### 4-6 Cách giữ việc không xuất được

`Ngày không xuất được = Ngày thuộc khung chu kỳ không xuất được + Ngày BẬT không xuất được theo ngày − Ngày Override hoạt động riêng`

| Mục | Quy tắc | Nguồn |
|---|---|---|
| Cách giữ | Chọn nhiều theo từng kho từ **cùng lưới khung `A1`〜`D7`** (28 khung) (`warehouse_non_picking_slots`). Không có chu kỳ dành riêng cho xuất hàng | 〔Chu kỳ §2.3・§7〕〔Yêu cầu REQ-DL-804〕 |
| Phán định | Phán định bằng **khung của chính ngày picking**. Không quyết ngược từ khung của ngày giao hàng, mà xem khung chứa ngày ra từ `ngày giao hàng − lead time` (`isPickClosed`) | 〔Chu kỳ §2.3・§4.3〕 |
| Đơn vị giữ | **Mỗi kho 1 bộ.** Không có khoảng thời gian áp dụng, khung đã đánh dấu áp dụng cho **toàn bộ khoảng thời gian đối tượng thiết lập** (cũ: "bộ" có kèm khoảng thời gian 〔Yêu cầu REQ-DL-687〕. Bãi bỏ 2026/09/14). Nếu ngày hoạt động thay đổi giữa kỳ thì đổi ở khoảng thời gian đối tượng thiết lập kế tiếp, hoặc chỉ định riêng bằng ngày không xuất được theo ngày. Cần xác nhận khi vận hành rằng nếu giữ nguyên khung không xuất được mặc định mà vẫn còn giao vào thứ Hai thì ngày picking tương ứng sẽ bị dời sớm đến tuần trước 〔Nguồn gốc: Thiết lập chu kỳ giao hàng §2.3〕 | 〔Yêu cầu REQ-DL-722・723〕 |
| Khung không xuất được mặc định | **`A6`・`A7` ／ `B4`〜`B7` ／ `C6`・`C7` ／ `D4`〜`D7`** (ngoài thứ Bảy Chủ nhật hằng tuần, **tuần B・tuần D cũng không xuất hàng vào thứ Năm・thứ Sáu**. Vì số đơn giao hàng của tuần đó ít và kho nghỉ cách tuần) (cũ: chỉ thứ Bảy Chủ nhật hằng tuần. Sửa đổi 2026/09/18) | 〔Chu kỳ §2.3〕 |
| Hiển thị・chỉnh sửa | Nút khung không xuất được ghi kèm thứ (`A6 Bảy`). Chọn từng kho ở **tab kho** để chỉnh sửa, và có thể ghi đè hàng loạt cho tất cả kho bằng "Áp dụng thiết lập này cho 3 kho". **Tab kho là bộ lọc, không phải đơn vị phân quyền** | 〔Chu kỳ §2.1・§2.3・§11-3〕〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885・623〕 |
| **Ngày không xuất được theo ngày** | **Đăng ký theo từng kho** (`warehouse_non_picking_days`. Ngày kiểm kê của một kho không làm dừng picking của kho khác). **Có thể đăng ký theo khoảng thời gian từ ngày bắt đầu đến ngày kết thúc** (3 ngày kiểm kê bằng 1 bản ghi). **Người đăng ký là vận hành (logistics)** (kho không có màn hình trong hệ thống, và vai trò `quản lý kho` cũng không tồn tại) | 〔Chu kỳ §2.3・§7〕〔Yêu cầu REQ-DL-686・687・680・885〕 |
| Xuất hàng đột xuất | Từ bảng thiết lập của ngày được chọn, đặt **Override hoạt động riêng** (`type = business_override`) để chỉ ngày đó quay lại hoạt động | 〔Chu kỳ §2.3・§4.3〕 |

#### Khi trúng ngày không xuất được thì dời cả ngày picking lẫn ngày giao hàng 〔Quyết định #15〕〔Yêu cầu REQ-DL-842・689〕〔Chu kỳ §4A-5B〕

| Bước | Việc làm | Ví dụ |
|---|---|---|
| ① | **Trước tiên chỉ dời sớm ngày picking** và xem có nằm trong chênh lệch lead time hợp đồng bằng 0 hay không (4-8 ①). Nếu nằm trong thì kết thúc ở đây | Trước khi đổi: picking 8/19 → giao hàng 8/21／**Sau khi đổi: picking 8/18 → giao hàng 8/21** |
| ② | Khi chênh lệch 0 không đủ thì **dời ngày giao hàng theo "dời sớm・dời muộn" của hợp đồng và dời cả hai** (4-8 ②③) | **Sau khi đổi: picking 8/18 → giao hàng 8/20** (ngày giao hàng cũng di chuyển) |
| Cũ | "Chỉ picking dừng. Không dời ngày giao hàng" 〔Yêu cầu REQ-DL-689・2026/09/14〕 đã **bị hủy ngày 2026/09/21** | Vì nếu ngay sau các khung không xuất được liên tiếp có giao hàng thì chỉ dời sớm ngày picking sẽ làm lead time thực tế kéo dài 4〜6 ngày, và sản phẩm có hạn tiêu thụ ngắn không thành lập được |

| `plan lifecycle` | Cách xử lý khi sau đó đổi khung không xuất được・ngày không xuất được |
|---|---|
| `draft` (không có override) | **Tự động dời.** Hiển thị lịch doanh nghiệp cũng tự động cập nhật |
| `draft` (có override・đã điều chỉnh) | Trước tiên chỉ dời sớm ngày picking. Nếu chênh lệch 0 không đủ và cần dời cả ngày giao hàng thì không tự động dời mà chuyển sang **đang đề xuất** (vì là ngày đã thống nhất với doanh nghiệp) |
| `published` | **Không dời.** Hiển thị ở "cần xác nhận" và vận hành xử lý bằng thay đổi hàng loạt |
| `locked` | **Ngoài đối tượng.** Xử lý bằng liên lạc điện thoại + hủy, hoặc nhân bản |

Trường hợp không dời được (hôm trước cũng không được・lead time kéo dài quá mức) thì không tự động dời mà hiển thị ở "cần xác nhận" với tư cách **"không thể tạo lịch dự kiến"** 〔Quyết định #19〕〔Yêu cầu REQ-DL-843〕. **Dù hủy ngày không được, lịch dự kiến đã dời một lần cũng không tự động đưa về** (`draft` kết quả là quay lại do tạo lại, nhưng `published` thì không đưa về). **Không cho đăng ký ngày quá khứ** (tháng hiện tại có khả năng cao trúng `locked` nên khi đăng ký cảnh báo "Có bao gồm phần của tuần này"). Thay đổi khung không xuất được có tác dụng với toàn bộ khoảng thời gian đối tượng thiết lập, nhưng **tháng đã chốt nằm ngoài đối tượng** 〔Yêu cầu REQ-DL-724〕.

#### Phân chia giữa màn hình 01 và master kho — "Cái liên quan đến lịch・ngày thì ở thiết lập chu kỳ giao hàng, thuộc tính của bản thân kho thì ở master kho" 〔Chu kỳ §2.3〕〔Yêu cầu REQ-DL-686〕

| Nơi đặt | Mục |
|---|---|
| **Màn hình 01 (thiết lập chu kỳ giao hàng)** | Khung không xuất được (`A1`〜`D7`)・ngày không xuất được theo ngày・tạm dừng chu kỳ・ngày được coi là ngày lễ giao hàng・`A1` lần đầu・khoảng thời gian tạo |
| **Master kho** | Ngưỡng số lượng (mặc định **300 đơn／ngày**)・lead time lệnh xuất hàng (mặc định **3 ngày**)・liên kết Thomas (các giá trị năng lực của kho không liên quan đến ngày) |
| **Hợp đồng (phân loại giao hàng)** | Lead time (**0〜7 ngày**). **Master kho không giữ lead time** 〔Quyết định #4・#10／#16／#52〕〔Yêu cầu REQ-DL-831・832〕 |
| **Kho thay thế** | **Không giữ.** Dù kho được phân công không xuất được cũng không tự động chuyển sang kho khác, mà **vận hành phán đoán riêng lẻ ở "cần xác nhận"** 〔Yêu cầu REQ-DL-629〕. **Việc đổi kho của hợp đồng được phản ánh từ tháng áp dụng**, và **đơn vị tháng áp dụng là tháng chu kỳ** (chuyển từ `A1` của chu kỳ đó. Không phải ngày 1 dương lịch) |

**Tự động phán định khung không giao hàng được** 〔Chu kỳ §2.3・§4.3〕〔Yêu cầu REQ-DL-805〕 — Tự động phán định **khung ngay sau các khung không xuất được liên tiếp** là khung không giao hàng được (ranh giới chu kỳ là vòng tròn. Sau `D7` là `A1`). Từ thiết lập mặc định, các khung được tự động phán định là **`A1`・`B1`・`C1`・`D1` (thứ Hai hằng tuần)**, không phải giá trị cố định mà tính lại theo thay đổi của khung không xuất được. Ngoài khung cơ bản, tính "ứng viên không giao hàng được" là **khung giao hàng mà khung picking lùi về theo lead time của hợp đồng không dùng được**, và hiển thị ở tab "Không xuất được" như "Ảnh hưởng đến giao hàng (tự động phán định)" tách riêng khung không giao hàng được cơ bản và **ứng viên bổ sung theo lead time 1 ngày・2 ngày・3 ngày**. Ở chọn slot giao hàng của hợp đồng, khung không giao hàng được cơ bản + ứng viên tương ứng với lead time thực tế của hợp đồng đó được **làm không chọn được (xám)**, lý do **ở ô = ngắn gọn** (`B1 Hai (không giao được)`), **ở tooltip = chi tiết** (`Khung không xuất được A7 (kho Kanto)／Lead time 1 ngày`) 〔Quyết định #23〕〔Yêu cầu REQ-DL-847〕.

### 4-7 Thứ tự ưu tiên phán định ngày không dùng được

| Thứ tự | Phán định | Đối tượng | Điều xảy ra khi trúng | Nguồn |
|---|---|---|---|---|
| **1** | **Tạm dừng chu kỳ** | Chung toàn công ty | **Vốn dĩ không có khung.** Không giao hàng cũng không picking. **Không thực hiện phán định ngày lễ・không xuất được** (tạm dừng ưu tiên cao nhất). Khung tiếp tục từ ngày sau khi hết tạm dừng, toàn bộ chu kỳ bị lùi ra sau | 〔Chu kỳ §2.2・§4.2〕〔Yêu cầu REQ-DL-307・807〕 |
| 2 | **Ngày được coi là ngày lễ giao hàng** | Chỉ hợp đồng có "không giao hàng ngày lễ" BẬT | Dời **ngày giao hàng** sang "dời sớm・dời muộn" của hợp đồng (ngày picking cũng đi theo). Hợp đồng TẮT thì giao như bình thường | 〔Chu kỳ §2.3・§4.3〕 |
| 2 | **Thứ không giao hàng được** (mặc định Bảy・CN・Lễ) | Đơn vị hợp đồng (cơ sở) | Dời **ngày giao hàng** sang "dời sớm・dời muộn" của hợp đồng | 〔Chu kỳ §3.1・§4.3〕〔Quyết định #31〕 |
| 2 | **Ngày không nhận được của cơ sở** (ngày・khoảng thời gian・lặp lại hằng năm) | Đơn vị hợp đồng (cơ sở) | Dời **ngày giao hàng** sang "dời sớm・dời muộn" của hợp đồng. Dù tạo lại chu kỳ cũng tự động tránh | 〔Chu kỳ §3.1C・§4.3〕 |
| 3 | **Khung không xuất được** (`A1`〜`D7`) | Theo kho | **Trước tiên dời sớm ngày picking. Nếu chênh lệch 0 không đủ thì dời cả ngày giao hàng** (4-6・4-8) | 〔Quyết định #15〕〔Yêu cầu REQ-DL-842〕 |
| 3 | **Ngày không xuất được theo ngày** | Theo kho | Như trên. **Cả ngày picking lẫn ngày giao hàng đều là đối tượng dời** | 〔Quyết định #15〕〔Chu kỳ §4A-5B〕 |
| — | **Override hoạt động riêng** | Theo kho | Hủy khung không xuất được・ngày không xuất được và cho ngày đó hoạt động (`false` ở đầu `isPickClosed`) | 〔Chu kỳ §4.3〕 |
| — | **Override coi là ngày lễ** | Chung toàn công ty | Không coi ngày lễ công khai là ngày lễ giao hàng (`override` ưu tiên hơn phán định mặc định) | 〔Chu kỳ §2.3・§4.3〕 |

**Quan hệ giữa thứ tự 1 và thứ tự 2・3 là "loại trừ" chứ không phải "ưu tiên".** Vì ngày tạm dừng không có slot nên vốn dĩ không vào phán định ngày lễ・không xuất được. **Giữa các mục thứ tự 2 không có hơn kém** (chỉ cần trúng một mục thì `isCompanyClosed` là đúng và vào cùng xử lý dời). **Thứ tự 2 chỉ dời ngày giao hàng, thứ tự 3 dời cả hai lấy ngày picking làm điểm xuất phát.** Khi cả hai cùng thành lập thì ở vòng lặp 4-8 vừa chuyển ứng viên ngày giao hàng từng ngày một vừa tìm cặp thỏa cả hai điều kiện. **Dời・không dùng được・cần xác nhận nhất định phải kèm lý do.** Định dạng là "Coi là ngày lễ giao hàng: <tên ngày lễ>", "Thứ không giao hàng được: <thứ>", "Khung không xuất được <slot> (<kho>)", "Ngày không xuất được: <lý do>", "Tạm dừng chu kỳ: <tên kỳ>", "Lượng bảo quản cần xác nhận". Độ dài hiển thị là **danh sách = ngắn** (`Dời sớm 2 ngày`), **chi tiết・tooltip = đầy đủ** (`Đang dời 2 ngày so với B3 (2026-09-17) ban đầu`) 〔Quyết định #27〕〔Yêu cầu REQ-DL-846〕.

### 4-8 Hàm hỗ trợ ngày và thuật toán tạo chu kỳ

Mọi phép tính ngày đều thực hiện bằng **UTC cố định** (`Date.UTC`) để loại bỏ lệch do múi giờ. `mk(y,m,d)` = tạo ngày／`fmt(dt)` = `"YYYY-MM-DD"`／`addDays(dt,n)`／`diffDays(a,b)` (đều theo đơn vị 86400000ms) 〔Chu kỳ §4.1〕.

```
buildSchedule():                                    # Chu kỳ §4.2
  d = A1 lần đầu (bắt buộc thứ Hai); end = ngày cuối của khoảng thời gian đối tượng tạo; i = 0; cycleNo = 0
  while d <= end:
      if đang_tạm_dừng(d):                           # ← không tiến khung (i) = không tiêu thụ
          SCHED[fmt(d)] = { pause:tên_kỳ, wouldBe:slotCode(i), adjust:là_điều_chỉnh }
          d = addDays(d,1);  continue
      si = i % 28;  wi = floor(si / 7)               # 0=A, 1=B, 2=C, 3=D
      if si == 0:   cycleNo++;  a1[cycleNo] = d
      if si == 13:  b7[cycleNo] = d;  cycleMonth[cycleNo] = ym(d)   # ★ khung thứ 14 = B7
      SCHED[fmt(d)] = { code:"ABCD"[wi]+(si%7+1), week:"ABCD"[wi],
                        cycleNo:cycleNo, first:(si==0) }
      i++;  d = addDays(d,1)
  # cycle_month được suy ra từ b7_date và giữ trong delivery_cycles (§7).
  # Không có cài đặt đếm "tháng có nhiều ngày hơn", cũng không có phân nhánh khi 14 bằng 14.
```

- **Tháng chu kỳ được suy ra từ `B7`** 〔Quyết định v2.1 #11〕〔Yêu cầu REQ-DL-881〕. Ngày có `si == 13` là `B7`, và năm tháng đó là `cycle_month`. Để lại ngày ở `delivery_cycles.b7_date`, màn hình・đánh số hợp đồng con (`ID hợp đồng-yyyymm`) dùng giá trị này. **Không triển khai kiểu đếm 28 ngày rồi lấy bên nhiều hơn** (vì cho cùng kết quả và không cần nhánh khi bằng nhau).
- Vì tạm dừng không lưu được nếu không phải bội số của 7 ngày (4-5 Quy tắc 4), nên **độ lệch cũng theo đơn vị 7 ngày, và tương ứng tuần × thứ như `A1` = thứ Hai・`A6` = thứ Bảy được giữ**. **Ngày được coi là ngày lễ giao hàng・ngày không xuất được vẫn gán slot** (vì việc dời thực hiện ở phía quy tắc hợp đồng・kho). **Chỉ ngày tạm dừng chu kỳ là không gán slot**, và ở ô đó hiển thị `wouldBe` (**khung tiếp tục sau khi hết tạm dừng**). Vì trong tạm dừng khung không tiến nên mọi ngày trong khoảng thời gian tạm dừng đều chỉ cùng một khung, và câu chữ là **"Tiếp tục từ `B3`"** (**không viết "ban đầu `B3`"**. Vì có thể hiểu là dự định thực hiện `B3` vào ngày đó) 〔Chu kỳ §4.2〕.

```
isDeliveryHoliday(dt) = nếu override có fmt(dt) thì lấy giá trị đó, nếu không thì kiểm tra có trong master ngày lễ
isPickClosed(dt):                                   # Chỉ không xuất được (theo kho)
    if Override hoạt động riêng có fmt(dt):  return false
    if Ngày không xuất được theo ngày có fmt(dt):  return true
    return KhungKhôngXuấtĐược[ NgàyChuKỳ[fmt(dt)].slot_code ]
isCompanyClosed(dt, contract):                      # Phán định giao hàng theo hợp đồng
    if contract.không_giao_ngày_lễ and isDeliveryHoliday(dt):  return true
    if isSiteBlocked(dt, contract):                      return true   # Ngày không nhận được của cơ sở
    return contract.thứ_không_giao_được[ dt.getUTCDay() ]                      # 0=CN, 6=Bảy
# Tự động phán định khung không giao hàng được (4-6) = "khung mà slot ngay trước không xuất được còn bản thân thì được (trước A1 là D7)"
#   + "khung giao hàng mà khung picking lùi theo lead time không dùng được". Tính lại khi khung không xuất được・lead time hợp đồng
#   thay đổi, phản ánh ngay vào hiển thị ảnh hưởng của màn hình 01 và điều khiển chọn slot của hợp đồng 〔Chu kỳ §4.3〕.
isSiteBlocked(dt, contract):                        # Ngày không nhận được của cơ sở〔Nguồn gốc: Thiết lập chu kỳ giao hàng §4.3〕
    chỉ xét ràng buộc nhận hàng có trạng thái hiệu lực và từ ngày bắt đầu áp dụng (effective_from) trở đi
    yearly so khớp theo tháng ngày (MM-DD), range theo ngày bắt đầu〜ngày kết thúc, còn lại theo ngày

badDeli(dt) = isCompanyClosed(dt,contract) or isPause(dt)             # Chu kỳ §4.4
badPick(dt) = isPickClosed(dt)             or isPause(dt)
LT_SLACK = 0 (nguyên tắc: thực − hợp đồng = 0) ／ LT_SLACK_MAX = 1 (giới hạn trên khi bất đắc dĩ)
seed  = (mode=="cycle") ? ngày_của_slot : ngày_chỉ_định
shift = "dời sớm (−1)／dời muộn (+1)" của hợp đồng * lần có khung lệch do tạm dừng cố định +1 (4-5 Quy tắc 6)
for i in 0..20:                                   # 20 ngày, bằng giới hạn trên của nudge
    d = addDays(seed, i * shift)
    if not canDeliver(d):  continue               # tạm dừng・coi là ngày lễ・thứ không giao được・ngày không nhận được
    pk = nudge(addDays(d, -leadTime), -1, badPick)        # Ngày picking luôn tìm theo hướng dời sớm
    g  = diffDays(d, pk) - leadTime
    if not best or g < best.gap:  best = { deli:d, pick:pk, gap:g }
    if g <= LT_SLACK:                  return { ...best, ng:false }                  # ①
    if g <= LT_SLACK_MAX and not ok1:  ok1 = { deli:d, pick:pk, gap:g, slack:true }  # ②
return ok1 ? ok1 : { ...best, ng:true }   # ②+1 ngày／③cần xác nhận. Không để lại ngày picking không dùng được
```

| Giai đoạn | Điều kiện | Cách chọn | Hiển thị |
|---|---|---|---|
| ① Nguyên tắc | Lead time thực tế − lead time hợp đồng = **0** | Tìm lần lượt theo "dời sớm・dời muộn" của hợp đồng, chọn **ngày đầu tiên tìm thấy** | Không có dấu |
| ② Bất đắc dĩ | Không có ngày nào của ① | Chọn ngày đầu tiên nằm trong chênh lệch **+1 ngày** (**được phép tự động chốt**) | Vàng "Bất đắc dĩ +1 ngày (trong phạm vi cho phép)" |
| ③ Cần xác nhận | Cũng không có ② | Chọn cặp có chênh lệch **nhỏ nhất** | Đỏ "Thực tế N ngày (hợp đồng M ngày・+K ngày)" + **cần xác nhận** |

- **Khi trong vòng 20 ngày không tìm được ngày nào giao được thì hiển thị ở cần xác nhận với tư cách "không thể tạo lịch dự kiến". Không tự động quyết định ngày.** Kèm hợp đồng・cơ sở・chu kỳ・lý do đối tượng và đưa vào "cần xác nhận" của lịch trình vận hành, vận hành điều chỉnh số lần giao hàng hoặc slot 〔Quyết định #19〕〔Yêu cầu REQ-DL-843・824〕〔Chu kỳ §4.4〕.
- `nudge(dt, dir, bad)` di chuyển từng ngày theo hướng `dir` cho đến khi `bad(dt)` sai và trả về cùng số ngày đã di chuyển (**giới hạn trên 20 ngày**). **Nếu di chuyển quá 3 ngày so với ngày của khung ban đầu thì là cần xác nhận.** Không đặt giới hạn trên cho bản thân số ngày di chuyển 〔Yêu cầu REQ-DL-806〕. **Dự phòng khi không dời sớm được**: nếu hợp đồng đặt dời sớm nhưng việc dời sớm không thành lập vì lý do tồn kho・lượng bảo quản thì **tự động chuyển sang dời muộn** và cảnh báo・thông báo là "đảo hướng" 〔Yêu cầu REQ-DL-202〕. **Nhóm nhiệt độ**: vì đông lạnh và lạnh được tạo thành bản ghi riêng nên dù cùng ngày giao hàng, ngày picking・kho vẫn có thể khác nhau 〔Yêu cầu REQ-DL-301〕.

### 4-9 Cấu trúc và thao tác của màn hình 01

**Header và bố cục**: Tên màn hình "Thiết lập chu kỳ giao hàng"／vai trò (quản trị viên hệ thống)・trạng thái xác thực・thời điểm lưu gần nhất／thứ bậc menu là Quản lý giao hàng ＞ Thiết lập chu kỳ giao hàng／phía trên bên phải có "Hủy" "Lưu thiết lập". UI là Light UI theo màn hình lịch trình vận hành hiện tại. Trên cùng có **dải trạng thái thiết lập** (hàng trên = thiết lập chu kỳ giao hàng, hàng dưới = công khai menu) + cảnh báo (4-2), bên dưới là khoảng thời gian đối tượng thiết lập (tháng bắt đầu〜tháng kết thúc) và **ngày đầu tiên của chu kỳ giao hàng (`A1` đầu tiên)**. Cột trái đặt tab tháng・lịch tháng・chú thích, cột phải đặt bảng thiết lập, có **3 tab "Ngày lễ・nghỉ đột xuất" "Tạm dừng chu kỳ" "Không xuất được"** (ở tab không xuất được chọn một **tab kho** là đối tượng chỉnh sửa. Là bộ lọc chứ không phải đơn vị phân quyền). Cột phải bám theo phía trên khi cuộn, và ở màn hình hẹp thì chuyển xuống dưới lịch 〔Chu kỳ §2.1〕〔Quyết định v2.1 #2〕.

**Lịch**: Lịch tháng **đều bắt đầu từ thứ Hai** (Hai〜CN). Nhập・hiển thị `A1` lần đầu thống nhất là `YYYY-MM-DD`. Ngày của tháng trước・sau cũng hiển thị màu xám nhạt, nền ngày thường cơ bản là trắng, tạm dừng・coi là ngày lễ giao hàng・không xuất được thể hiện kín đáo bằng màu nền nhạt và viền. Tab tháng **chỉ hiển thị tháng của khoảng thời gian đối tượng thiết lập (tháng bắt đầu〜tháng kết thúc)** (cũ: xếp các tháng không sửa được thành `🔒 …không sửa được`. Sửa đổi 2026/09/18. Vì nếu xếp các tháng không chọn được thì không đọc ra được phạm vi có thể thiết lập). Lý do không sửa được được đặt thành 1 dòng dưới ô chọn khoảng thời gian. Ở tab hiển thị **số ngày coi là ngày lễ giao hàng và số ngày không xuất được** của tháng hiện tại, ở header hiển thị tóm tắt tháng hiện tại (ngày lễ giao hàng／không xuất được／tạm dừng／tổng số ngày) 〔Chu kỳ §2.3・§2.0C-2〕〔Yêu cầu REQ-DL-803・709・710〕.

| Trạng thái của ô | Hiển thị | Ý nghĩa |
|---|---|---|
| Ngày giao hàng／ngày đầu chu kỳ | Màu của tuần (A xanh dương／B xanh lá／C vàng／D tím) + tên chu kỳ + mã slot. Ngày đầu có viền nhấn ở mép trái | Ngày có thể giao hàng thông thường／`A1` của chu kỳ đó |
| Tạm dừng chu kỳ | Nền vàng + tên kỳ + "Tạm dừng chu kỳ" + **"Tiếp tục từ <khung>"** (loại dùng để điều chỉnh ghi kèm "Tạm dừng chu kỳ (điều chỉnh)") | Không gán slot. Không giao hàng cũng không picking |
| Ngày được coi là ngày lễ giao hàng | Nền đỏ + tên ngày lễ + "Coi là ngày lễ giao hàng" | Chỉ hợp đồng không giao hàng ngày lễ mới dời. Còn lại giao như bình thường |
| Ngày không xuất được | Nền tím + khung nét đứt + "Không xuất được" | Trước tiên dời sớm picking tương ứng. Nếu chênh lệch 0 không đủ thì **dời cả ngày giao hàng** |
| Cả hai BẬT／Override coi là ngày lễ | Nền chia đỏ／tím + "Ngày lễ giao hàng・không xuất được"／nền xanh lá + viền xanh dương + "Override coi là ngày lễ" | Áp dụng độc lập phán định giao hàng và phán định xuất hàng／Ngày không coi ngày lễ công khai là ngày lễ giao hàng |
| Ngoài đối tượng tạo | Gạch chéo + "Ngoài đối tượng tạo" | Trước `A1` lần đầu, hoặc ngoài khoảng thời gian đối tượng |

**Thao tác.** Nhấp vào ô ngày thì ở trạng thái được chọn, và hiển thị trạng thái của ngày đó ở bảng "Thiết lập ngày đã chọn" bên phải. **Chỉ nhấp thì không thay đổi thiết lập.** Trong bảng đặt "Giao hàng được／không được" và "Xuất hàng được／không được" thành **2 thao tác độc lập**, mỗi nút thay đổi chỉ chuyển trạng thái của đối tượng tương ứng và tính lại ngay toàn màn hình. Ngày được chọn có viền xanh dương, coi là ngày lễ giao hàng màu đỏ, không xuất được màu tím, cả hai BẬT là nền chia đỏ／tím. Khi mở tháng không sửa được thì **hiển thị lý do bằng banner** và không nhận thay đổi có/không bằng nhấp vào ngày.

**Tab không xuất được** chuyển bằng tab kho, hiển thị bằng bảng tuần (A〜D) × thứ. Có thể chuyển hàng loạt từ tên thứ・tên tuần, tóm tắt nội dung đã chọn bằng tiếng Nhật, và có thể đưa về giá trị ban đầu. Khung không giao hàng được đã tự động phán định được thể hiện ở cả trên lưới (khung tương ứng ghi 『Giao hàng ×』) và danh sách. Ngày không xuất được chỉ định theo ngày có thể thêm・xóa, và có thể di chuyển từ ngày sang lịch của tháng đó 〔Nguồn gốc: Thiết lập chu kỳ giao hàng §12 Yêu cầu〕〔Yêu cầu REQ-DL-758・762〜764〕.

**Lưu.** Bằng "Lưu thiết lập" chốt thiết lập chung toàn công ty và hiển thị modal thành công (số mục khoảng thời gian tạm dừng・số tháng đối tượng・số chu kỳ được tạo・`A1` lần đầu). **Trước khi lưu nhất định hiển thị bản xem trước số lượng ảnh hưởng** 〔Chu kỳ §2.0A・§4A-5B〕〔Yêu cầu REQ-DL-688〕. Chi tiết là `Đã phản ánh như ràng buộc (không ảnh hưởng) ngày không nhận được của cơ sở 18 mục／Lịch dự kiến tự động tạo lại 412 mục／Tự động dời (ngày picking・ngày giao hàng) 18 mục／Đã thống nhất với doanh nghiệp (override đã phê duyệt) 7 mục (áp dụng nguyên trạng 4 mục・hết hiệu lực do không còn giao hàng đối tượng 2 mục 〈thông báo cho doanh nghiệp qua lịch sử〉・cần đề xuất ngày thay thế 〈chuyển sang đang đề xuất〉 1 mục)／Đã có lệnh xuất hàng (`locked`)・không thể thay đổi 36 mục／Không dời được (không thể tạo lịch dự kiến) 3 mục`.

**Khi có từ 1 mục hết hiệu lực・đang đề xuất trở lên, đổi nút lưu thành "Xác nhận và lưu" và bắt buộc đánh dấu "Đã xác nhận ◯ mục đã thống nhất với doanh nghiệp sẽ hết hiệu lực・đề xuất lại"** (bản thân việc lưu không bị chặn. Vì kiểm tra thiết bị hay nghỉ kho không thể dời). **Việc đổi ngày đầu chu kỳ và tạo lại khoảng thời gian đối tượng thiết lập ảnh hưởng đến toàn bộ khoảng thời gian**, nên với 2 thao tác này tính **toàn bộ** override đã phê duyệt của khoảng thời gian đó là đối tượng neo lại, và cảnh báo riêng với tạm dừng・thêm ngày lễ thông thường. Cùng với đó, như **hiển thị phòng ngừa**, ở màn hình đăng ký tạm dừng・coi là ngày lễ, khi chọn ngày mà ngày đó có override đã phê duyệt thì hiển thị biểu tượng khóa và "Đã điều chỉnh ◯ mục" ở ô lịch.

**Phạm vi phản ánh khi lưu** (theo từng `plan lifecycle`) 〔Chu kỳ §2.0A〕

| Đối tượng | Khi thay đổi thiết lập |
|---|---|
| Tháng đã chốt | **Ngoài đối tượng** (vốn dĩ không sửa được) 〔Yêu cầu REQ-DL-724〕 |
| `draft` | **Xóa hết và tạo lại.** Không tạo ngoại lệ |
| `published` | **Không thay đổi.** Hiển thị ở "cần xác nhận" để vận hành phán đoán |
| `locked` | **Ngoài đối tượng** |
| Ràng buộc nhận hàng của cơ sở | **Có tác dụng như điều kiện tạo** khi tạo lại. Dù chu kỳ thay đổi thế nào cũng tự động tránh |
| Override đã phê duyệt | **Áp dụng sau** vào lịch dự kiến đã tạo lại. Nếu không áp dụng được thì hết hiệu lực hoặc chuyển sang đang đề xuất |

Việc tạo lại không phải là thêm mà là **thay thế (upsert)**, và khóa duy nhất của `shipping_plans` là **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** 〔Quyết định v2.1 #6〕〔Yêu cầu REQ-DL-873・721〕. `occurrence_key` là giá trị chỉ duy nhất lần này trong chu kỳ đó (slot `A1`〜`D7`, hoặc ngày chỉ định riêng "ngày N hằng tháng" "ngày cuối tháng"). **(Cũ: ràng buộc duy nhất `(contract_id, delivery_date)`. Hủy ở đợt 2. Vì 1 hợp đồng có thể có nhiều nhóm nhiệt độ・phân loại giao hàng vào cùng một ngày giao hàng, nên nếu duy nhất theo ngày giao hàng thì các dòng đúng sẽ xung đột với nhau)** Việc đối chiếu khi thay thế cũng bằng khóa này chứ không phải ngày. Quy trình (xóa `draft` → tạo lại → giữ nguyên `published`／`locked` → áp dụng override theo thứ tự thời điểm phê duyệt cũ trước → nếu **dòng cùng khóa** xung đột thì ưu tiên `published` và đưa phần khác biệt vào cần xác nhận) được đặt ở §7・§8.

> ⚠️ **Cần xác nhận #13** — 【Hai bản demo vẫn ở mức "chỉ picking dừng"】Trong tooltip của pill ngày không xuất được ở delivery_schedule_plan_demo_ja.html vẫn còn mô tả cũ "khác với tạm dừng chu kỳ, chỉ picking dừng". Mâu thuẫn với quyết định #15／〔Yêu cầu REQ-DL-842〕 (ngày không xuất được dời cả ngày picking lẫn ngày giao hàng). Đã biết vì §F của danh sách quyết định đã quyết dời việc phản ánh vào hai bản demo sang lần sau, nhưng ghi lại để tránh sót thay thế. Cũng hãy xác nhận các cách diễn đạt cùng loại ở phía picking_schedule_setting_demo_ja.html

> ✅ **Cần xác nhận #14 (đã giải quyết)** — ~~Nguồn dữ liệu ngày lễ vẫn tạm thời~~ → Đã chốt bằng tự động lấy mỗi năm 1 lần từ API ngày lễ công khai + "Lấy lại ngày lễ" (4-4・3-5) 〔hong trả lời 2026-10-03〕 (cũ: 【Tạm thời】nhập thủ công mỗi năm 1 lần từ dữ liệu công khai của Văn phòng Nội các, không làm nhập tự động từ API ngoài・CSV)

> ✅ **Cần xác nhận #15 (đã giải quyết)** — ~~Vận hành khi muốn xuất hàng vào ngày bị dừng do điều chỉnh vẫn chưa chốt~~ → **Giải quyết bằng quyết định đợt 3 ngày 2026/09/22**. Vì ngày điều chỉnh không tự động chèn vào và **quản trị viên quyết định vị trí đặt**, nên nếu có ngày muốn xuất hàng thì dời ngày điều chỉnh đó 〔Quyết định v2.2 #2〕 (4-5 Quy tắc 4)


## 6. Logic tính ngày

**Hình 3: Cách xác định ngày** (hiển thị dạng hình trong bản HTML) — Từ ứng viên ngày giao hàng, phán định ngày lễ・thứ không giao hàng được・không xuất được, và tìm theo hướng dời của hợp đồng cho đến khi tìm được ngày giữ được lead time. Theo thứ tự chênh lệch 0 → +1 ngày → cần xác nhận → không thể tạo lịch dự kiến.

<!-- FIG: fig-date-calc -->

**Hình 3: Cách xác định ngày** — Từ ứng viên ngày giao hàng, phán định ngày lễ・thứ không giao hàng được・**không xuất được**, và tìm theo hướng **dời sớm・dời muộn** của hợp đồng cho đến khi tìm được ngày giữ được lead time. Theo thứ tự chênh lệch 0 → +1 ngày → cần xác nhận → không thể tạo lịch dự kiến.

<!-- FIG: fig-date-calc -->

### 6-0. Dùng lead time nào

Thứ tự ưu tiên của lead time dùng để tính 〔Quyết định v2.3 #12〕:

1. **`deliveries.lead_time`** — Lead time của **chỉ 1 bản ghi** dữ liệu giao hàng đó. Chỉ được nhập khi vận hành nhập bằng "chỉ định ngày riêng" (15-6). **Không tồn tại ở lịch dự kiến (`shipping_plans`)**
2. **`contract_month_delivery_channels.lead_time`** — Nếu có hợp đồng con thì là giá trị của tháng đó
3. **`contract_delivery_channels.lead_time`** — Giá trị mặc định của hợp đồng mẹ

Master kho **không giữ lead time và cũng không tự động bổ sung** 〔Quyết định #10〕. Khi `deliveries.lead_time` khác giá trị của hợp đồng thì màn hình hiển thị **đã điều chỉnh**, và sau đó dù dời ngày ở màn hình lịch trình vẫn **giữ lead time riêng này** 〔Yêu cầu REQ-DL-750〕.

### 6-1. Quy trình tạo lịch xuất hàng dự kiến (mã giả)

Mọi phép tính ngày đều thực hiện bằng **UTC cố định** (`Date.UTC`) 〔Chu kỳ §4.1〕. Đơn vị tạo là **chi tiết giao hàng × phân loại giao hàng** cho 1 bản ghi 〔Chu kỳ §3.1B〕.

```js
function badDeli(dt){ return isCompanyClosed(dt, contract) || isPause(dt); }  // Ngày không giao hàng được
function badPick(dt){ return isPickClosed(dt)    || isPause(dt); }            // Ngày không xuất hàng (picking) được

// ① Xác định ngày giao hàng (cơ sở)
var seed = (mode === "cycle") ? ngày_của_Slot : ngày_chỉ_định;       // on_demand được chốt khi đặt đơn vật tư
var shift = contract.holiday_shift;                      // -1 = dời sớm ／ +1 = dời muộn
                                                         // Tuy nhiên khung tiếp tục sau tạm dừng cố định +1 (§6-3)

// ② Tìm ứng viên lần lượt (giới hạn trên 20 ngày)
var best = null, ok1 = null;
for (var i = 0; i <= 20; i++) {
  var d = addDays(seed, i * shift);
  if (badDeli(d)) continue;                              // Bỏ qua tạm dừng・coi là ngày lễ・thứ không giao được・ngày không nhận được

  var pk = nudge(addDays(d, -leadTime), -1, badPick);    // ③ Tính ngược ngày picking. Nếu không được thì luôn dời sớm
  var g  = diffDays(d, pk) - leadTime;                   // ④ Lead time thực tế − lead time hợp đồng

  if (!best || g < best.gap) best = { deli:d, pick:pk, gap:g };
  if (g <= LT_SLACK)                  return { ...best, ng:false };            // Giai đoạn ① chênh lệch 0
  if (g <= LT_SLACK_MAX && !ok1) ok1 = { deli:d, pick:pk, gap:g, slack:true }; // Giai đoạn ② +1 ngày
}
return ok1 ? ok1 : (best ? { ...best, ng:true } : không_thể_tạo_lịch_dự_kiến);               // Giai đoạn ③／§6-4
```

- `LT_SLACK = 0` (nguyên tắc)／`LT_SLACK_MAX = 1` (giới hạn trên khi bất đắc dĩ) 〔Yêu cầu REQ-DL-824〕. `nudge(dt, dir, bad)` di chuyển từng ngày theo hướng `dir` cho đến khi `bad(dt)` sai, và **trả về cùng số ngày đã di chuyển** (giới hạn trên 20 ngày).
- **Tuyệt đối không để lại ngày không xuất được (picking)** 〔Chu kỳ §4.4〕. Phán định **không xuất được** thực hiện bằng **khung của chính ngày picking (A1〜D7)**, không giữ riêng chu kỳ dành cho xuất hàng 〔Yêu cầu REQ-DL-804〕.
- Vì ngày tạm dừng chu kỳ **vốn dĩ không được gán slot** (cũng không tiêu thụ khung), nên `seed` không thể là ngày tạm dừng 〔Yêu cầu REQ-DL-807〕.
- **Khóa tạo・tạo lại là `contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** (`occurrence_key` là slot `A1`〜`D7` hoặc "ngày N hằng tháng／ngày cuối tháng"). **Không dùng `(contract_id, delivery_date)`** (vì 1 hợp đồng có thể có nhiều nhóm nhiệt độ・phân loại giao hàng trong cùng một ngày). Việc tạo lại không phải là thêm mà là **thay thế** 〔Quyết định v2.1 #6〕〔Yêu cầu REQ-DL-873〕. Nguồn snapshot của tuyến như §5-2 là **ưu tiên hợp đồng con・hợp đồng mẹ là dự phòng** (`route_snapshot_source`) 〔Quyết định v2.1 S2〕.

### 6-2. Hai giai đoạn dời và lead time

> **① Trước tiên tìm với chênh lệch 0. ② Chỉ khi thực sự không được thì cho phép đến +1 ngày. ③ Nếu vẫn không được thì cần xác nhận.** 〔Yêu cầu REQ-DL-824〕

| Giai đoạn | Điều kiện | Cách chọn | Hiển thị | Tự động chốt |
|---|---|---|---|---|
| **① Nguyên tắc** | `Lead time thực tế − lead time hợp đồng = 0` | Tìm lần lượt theo hướng **dời sớm・dời muộn** của hợp đồng, chọn **ngày đầu tiên tìm thấy** | Không có dấu | ○ |
| **② Bất đắc dĩ** | Không có ngày nào của ① | Chọn ngày đầu tiên nằm trong chênh lệch **+1 ngày** | Vàng "Bất đắc dĩ +1 ngày (trong phạm vi cho phép)" | ○ (giữ dấu) |
| **③ Cần xác nhận** | Cũng không có ② | Chọn cặp có chênh lệch **nhỏ nhất** | Đỏ "Thực tế N ngày (hợp đồng M ngày・+K ngày)" + **cần xác nhận** | × (vận hành xác nhận) |

- Nếu tránh ngày **không xuất được** mà chỉ dời sớm ngày picking thì **lead time thực tế kéo dài**. Nếu ngay sau các khung không xuất được liên tiếp của kho (ví dụ: thứ Năm〜Chủ nhật tuần B) có giao hàng thì sẽ giao hàng làm trước 4〜6 ngày, và **không thành lập với sản phẩm có hạn tiêu thụ ngắn**. Vì vậy **ưu tiên chênh lệch lead time**, và khi không nằm trong thì dời ngày giao hàng 〔Chu kỳ §4.4〕.
- ② là phạm vi được phép tự động chốt, nhưng **để lại dấu để sau này biết "vì sao kéo dài thêm 1 ngày"**. +1 ngày là biên độ để xử lý ngoại lệ khi chỉ có 1 ngày lễ・ngày nghỉ định kỳ xen vào, **không phải biên độ trông cậy ngay từ đầu**. ③ không tự động chốt, **nhất định hiển thị số ngày chênh lệch** (ví dụ `Thực tế 5 ngày (hợp đồng 2 ngày・+3 ngày)`), và nếu vận hành xem thấy không vấn đề thì có thể chốt nguyên ngày đó.

### 6-3. Ràng buộc khi dời

| Ràng buộc | Nội dung | Nguồn |
|---|---|---|
| **Giới hạn trên số ngày di chuyển** | **Không đặt giới hạn trên về nghiệp vụ.** Chỉ giới hạn trên của việc tìm kiếm là 20 ngày (`nudge`) | 〔Yêu cầu REQ-DL-806〕 |
| **Tuân thủ nghiêm lead time** | Dù dời tự động cũng không thỏa hiệp rút ngắn lead time. **Tiếp tục dời cho đến khi tìm được ngày thành lập**. Chỉ khi tìm đến 20 ngày sau mà không có chênh lệch 0 mới cho phép +1 ngày | 〔Yêu cầu REQ-DL-824〕 |
| **Ngày không xuất được dời cả ngày picking lẫn ngày giao hàng** | ① Trước tiên chỉ dời sớm ngày picking và xem có nằm trong chênh lệch 0 hay không → ② nếu không nằm trong thì **dời ngày giao hàng theo hướng của hợp đồng và dời cả hai**. Cách sắp xếp "chỉ picking dừng" đã bị hủy | 〔Đợt 1 #15〕〔Yêu cầu REQ-DL-842〕 |
| **Khung sau khi hết tạm dừng chỉ dời muộn** | Với lần có khung bị lệch do tạm dừng, việc dời do ngày lễ・không nhận được sau đó **chỉ tìm theo hướng dời muộn**. Dù hợp đồng là "dời sớm" thì riêng lần này không dời sớm (vì sẽ **giao khung đã dừng trước khi dừng**). Khi ngày chỉ định riêng trùng tạm dừng thì vẫn theo thiết lập của hợp đồng như trước | 〔Yêu cầu REQ-DL-825〕 |
| **Chỉ định riêng theo thiết lập của hợp đồng** | Khi ngày N hằng tháng／ngày cuối tháng trùng thứ không giao hàng được・ngày không nhận được・ngày được coi là ngày lễ giao hàng thì cũng dời bằng **"dời sớm・dời muộn" của hợp đồng**. Không giữ hướng riêng dành cho chỉ định riêng | 〔Chu kỳ §3.2〕 |
| **Dự phòng đảo hướng** | Dù đặt dời sớm, nếu việc dời sớm không thành lập vì lý do tồn kho・lượng bảo quản thì **tự động chuyển sang dời muộn** và thông báo cho vận hành là "đảo hướng" | 〔Yêu cầu REQ-DL-202〕 |
| **Hướng ở ranh giới chu kỳ** (thêm 2026/10/01・P10-5) | **Nếu ở A1・C1 sẽ dời sớm thì dời muộn, nếu ở D7 sẽ dời muộn thì dời sớm**, tự động đảo (không vắt qua ranh giới nửa đầu nửa sau・chu kỳ). Thông báo cho vận hành là đảo hướng | 〔Tổng hợp định nghĩa yêu cầu RD-DL-024〕 |
| **Di chuyển quá 3 ngày** | Nếu di chuyển **quá 3 ngày so với ngày của khung ban đầu thì cần xác nhận** (vì dịp nghỉ liên tiếp・cuối năm đầu năm có thể phải quay lại vài ngày) | 〔Yêu cầu REQ-DL-806〕 |

**Cách xử lý khi sau đó thêm・thay đổi ngày không xuất được** 〔Chu kỳ §4A-5B〕

| `plan lifecycle` | Xử lý |
|---|---|
| `draft` (không có override) | **Tự động dời**. Hiển thị lịch doanh nghiệp cũng tự động cập nhật |
| `draft` (có override・đã điều chỉnh) | Trước tiên chỉ dời sớm ngày picking. Nếu chênh lệch 0 không đủ và cần dời cả ngày giao hàng thì không tự động dời mà chuyển sang **đang đề xuất** |
| `published` | **Không dời.** Hiển thị ở "cần xác nhận" và vận hành xử lý bằng thay đổi hàng loạt |
| `locked` | **Ngoài đối tượng.** Xử lý bằng liên lạc điện thoại + hủy, hoặc nhân bản |

- Trước khi lưu **xem trước số lượng ảnh hưởng** (lịch dự kiến tạo lại／tự động dời sớm／đã thống nhất với doanh nghiệp 〈chi tiết áp dụng・hết hiệu lực・đang đề xuất〉／đã có lệnh xuất hàng・không thể thay đổi／không dời sớm được). **Khi có từ 1 mục hết hiệu lực・đang đề xuất trở lên thì "Xác nhận và lưu" + bắt buộc đánh dấu** (bản thân việc lưu không bị chặn) 〔Yêu cầu REQ-DL-775〕. **Dù hủy ngày không được, lịch dự kiến đã dời sớm một lần cũng không tự động đưa về** (`draft` kết quả là quay lại do tạo lại, nhưng `published` thì không đưa về).

### 6-4. Không có ứng viên trong 20 ngày = không thể tạo lịch dự kiến

> **Khi trong vòng 20 ngày không tìm được ngày nào giao được thì hiển thị ở cần xác nhận với tư cách "không thể tạo lịch dự kiến". Không tự động quyết định ngày.** 〔Đợt 1 #19〕〔Yêu cầu REQ-DL-843〕

| Mục | Nội dung |
|---|---|
| Nơi hiển thị | **"Cần xác nhận"** của lịch trình vận hành |
| Thông tin kèm theo | Hợp đồng・cơ sở・chu kỳ giao hàng・phân loại giao hàng đối tượng・**lý do** (coi là ngày lễ giao hàng／**thứ không giao hàng được**／ngày không nhận được／khung không xuất được 〈slot・kho〉／ngày không xuất được／tạm dừng chu kỳ) |
| Xử lý của vận hành | Điều chỉnh số lần giao hàng・slot giao hàng, hoặc xem lại ngày không nhận được |
| Xử lý tương tự | Trường hợp không dời sớm được do thêm ngày không xuất được (hôm trước cũng không được, lead time kéo dài quá mức, v.v.) 〔Chu kỳ §4A-5B〕 |

- Kỳ nghỉ ngắn dời 1〜2 ngày là giao được thì đăng ký là **ngày được coi là ngày lễ giao hàng**, kỳ nghỉ liên tiếp dài phải dời từ 3 ngày trở lên mới giao được thì đăng ký là **tạm dừng chu kỳ**. Không phải hệ thống cắt việc dời, mà **phân biệt bằng cách đăng ký** 〔Chu kỳ §2.2・§4.4〕.

### 6-5. Phân loại phán định và câu chữ hiển thị

| Điều kiện | Câu chữ pill | Màu dòng | Cần xác nhận |
|---|---|---|---|
| `Lead time thực tế = hợp đồng + 1 ngày` | "Bất đắc dĩ +1 ngày (trong phạm vi cho phép)" | Vàng | — |
| `Lead time thực tế > hợp đồng + 1 ngày` | "Lead time thực tế N ngày (hợp đồng M ngày・+K ngày)" | Đỏ | ○ |
| **Ngày giao hàng di chuyển quá 3 ngày so với khung ban đầu** | "Dời sớm ngày giao hàng N ngày" | Đỏ | ○ |
| Ngày giao hàng bị dời (trong 3 ngày) | "Dời sớm／dời muộn ngày giao hàng N ngày" | Vàng | — |
| Chỉ điều chỉnh ngày picking | "Điều chỉnh ngày picking" | Vàng | — |
| Lead time thực tế ≠ hợp đồng và có đảo hướng | "Tự động chuyển sang dời muộn" | Đỏ | ○ |
| Vận hành dời ngày thủ công | Dời thủ công (hiển thị nhấn mạnh) | Đỏ | — |
| Không có ứng viên trong 20 ngày | "Không thể tạo lịch dự kiến" | Đỏ | ○ |
| Không thuộc mục nào ở trên | "Đúng dự kiến" | Thường | — |

**Câu chữ hiển thị thay đổi độ dài giữa danh sách và chi tiết** 〔Yêu cầu REQ-DL-846〕

| Nơi | Câu chữ |
|---|---|
| Danh sách (hiển thị tháng・tuần・ngày, quản lý xuất hàng・giao hàng) | **Ngắn.** `Dời sớm 2 ngày` |
| Màn hình chi tiết・tooltip | **Đầy đủ.** `Đang dời 2 ngày so với B3 (2026-09-17) ban đầu` |

- Danh sách là màn hình đọc số lượng và thứ tự, nên nếu ghi cả hoàn cảnh từng mục thì dòng sẽ không đọc được. Ở chi tiết・tooltip hiển thị **đầy đủ khung ban đầu・ngày gốc・số ngày di chuyển**. **Ô của hiển thị tháng không hiển thị thẻ trạng thái "Chốt" "Dự kiến"** (lịch dự kiến phân biệt bằng khung nét đứt và dòng số lượng "Dự kiến N mục"). Chỉ Web doanh nghiệp giữ dấu "Dự kiến" 〔Yêu cầu REQ-DL-828/859〕.
- **Dời・không dùng được・cần xác nhận nhất định phải kèm lý do.** Định dạng là "Coi là ngày lễ giao hàng: <tên ngày lễ>", "Thứ không giao hàng được: <thứ>", "Khung không xuất được <slot> (<kho>)", "Ngày không xuất được: <lý do>", "Tạm dừng chu kỳ: <tên kỳ>", "Lượng bảo quản cần xác nhận", và hiển thị ở pill phán định・ô lịch・ngày ứng viên・danh sách theo ngày 〔Chu kỳ §4.5〕.

**Ví dụ tính (lead time 2 ngày・thiết lập dời sớm)** 〔Chu kỳ §4.4 ví dụ tính〕

| Trường hợp | Ngày giao hàng (cơ sở) | Ngày picking | Phán định |
|---|---|---|---|
| Thông thường | 2026-08-12 (thứ Tư) B3 | 2026-08-10 (thứ Hai) | Đúng dự kiến |
| Ngày tính ngược là ngày không xuất được, Chủ nhật cũng không được | 2026-08-12 (thứ Tư) B3 | 2026-08-10 → **2026-08-08 (thứ Bảy)** | Điều chỉnh ngày picking 2 ngày |
| Ngày giao hàng là Chủ nhật (thứ không giao hàng được) | 2026-09-13 (Chủ nhật) → **2026-09-11 (thứ Sáu)** | 2026-09-09 (thứ Tư) | Dời sớm ngày giao hàng 2 ngày (vàng) |
| Ngày giao hàng là ngày lễ, trước sau cũng nghỉ liên tiếp | 2026-09-23 → **2026-09-18 (thứ Sáu)** | 2026-09-16 (thứ Tư) | **Đỏ: dời sớm ngày giao hàng 5 ngày + cần xác nhận** (quá 3 ngày) |
| Khi đổi sang thiết lập dời muộn | 2026-09-23 → **2026-09-24 (thứ Năm)** | 2026-09-22 (thứ Ba) | Vàng: dời muộn ngày giao hàng 1 ngày |

---

> ⚠️ **Cần xác nhận #16** — Thuật ngữ và giá trị. ① Từ "phân loại giao hàng" được dùng với 2 nghĩa — 〔Chu kỳ §3.1B〕 là bộ "nhóm nhiệt độ・vật tư × kho × công ty giao hàng", 〔Danh sách mục Giao hàng・lịch giao hàng #1 `ship_type`〕 là chuyến COOL／chuyến giao hàng ES (= `service_form`), "loại giao hàng" của 〔Danh sách mục Thiết lập tuyến giao hàng #1 `route.kind`〕 tương ứng với phân loại giao hàng của đặc tả chu kỳ. Quyết định v2.1 #7 đã chốt nơi giữ `service_form` là phân loại giao hàng, nhưng tên cột của danh sách mục nghiêng về bên nào vẫn chưa quyết. ② Số giá trị của loại chuyến — 〔Quyết định v2.1 #7〕 viết 2 giá trị "chuyến COOL／chuyến giao hàng ES", nhưng 〔Chu kỳ §3.1B・§4C-3〕 và sơ đồ ER là 3 giá trị "chuyến giao hàng ES／chuyến giao hàng COOL／chuyến vật tư". Chưa xác nhận việc cho chọn chuyến vật tư như một mục nhập, hay tự động quyết định từ phân loại giao hàng = vật tư.

> ⚠️ **Cần xác nhận #17** — Giữ lead time theo từng chặng (giá trị tham khảo) khi có trung chuyển ở đâu. 〔Yêu cầu REQ-DL-837〕 đã quyết "tổng 1 giá trị là chuẩn・phần trung chuyển là giá trị tham khảo", nhưng chưa quyết giữ theo từng leg của route legs hay chỉ hiển thị (bảng đã chốt là 3 bảng `contract_routes` / `contract_month_routes` / `delivery_legs` 〔Quyết định v2.3 #1〕).

> ✅ **Cần xác nhận #18 (đã giải quyết)** — **Giải quyết bằng bổ sung 4 ngày 2026/09/29**: giống các loại khác, **ngày xuất hàng = ngày giao hàng − lead time**, ngày giao hàng của vật tư là **ngày giao hàng đầu tiên giữ được lead time từ ngày sau ngày đặt đơn trở đi**. Dữ liệu giao hàng của vật tư được tạo **mỗi lần chốt giỏ hàng** 〔Quyết định v2.3 #36・#38〕 (5-4・7-5). Dưới đây là mô tả cũ. ~~Ý nghĩa của lead time giao hàng từng lần (on_demand). 〔Danh sách mục Thiết lập tuyến giao hàng #6〕 coi là "số ngày từ khi chốt đơn đến khi giao hàng", nhưng 〔Chu kỳ §3.3〕 coi là tính ngược "ngày giao hàng − lead time" giống các chế độ khác. Chưa quyết ngày chốt đơn vật tư giữ ở đâu (cũng chưa xác nhận "khi vào" của đơn vật tư là mỗi lần chốt giỏ hàng hay gộp theo hạn chót hằng tuần・〔Chu kỳ §4A-2C〕).~~

> ✅ **Cần xác nhận #19 (đã giải quyết)** — ~~Hạn・quy tắc nhắc nhở khi vận hành bỏ mặc "đang yêu cầu" từ doanh nghiệp. 〔Chu kỳ §4A-4E〕 quy định quyết định của vận hành khi "đang đề xuất" hết hạn, nhưng không có định nghĩa phía "đang yêu cầu" (chỉ có phương châm không tự động từ chối).~~ → **Giải quyết bằng bổ sung 4 ngày 2026/09/29**. Hạn xử lý = hạn chót đặt đơn, 3 ngày trước hạn chót thì cần xác nhận `change_request_due`, không tự động từ chối 〔Quyết định v2.3 #37〕 (5-9)

> ✅ **Cần xác nhận #20 (đã giải quyết)** — **2 mục còn lại cũng được giải quyết bằng bổ sung 4 ngày 2026/09/29** (①= phạm vi hiển thị trên Web công ty giao hàng ủy thác 〔Quyết định v2.3 #34〕／③= điều kiện thông báo của hạn tiêu thụ ngắn 〔Quyết định v2.3 #35〕). Dưới đây là mô tả cũ. **2 mục** liên quan đến chương này trong các mục chưa quyết của 〔Quyết định G〕 (mục ① cũ "việc đổi ngày từng mục sau hạn chót đặt đơn・trước `locked` có vận hành bằng tay của vận hành hay không" đã **giải quyết bằng quyết định đợt 3 ngày 2026/09/22** 〔Quyết định v2.2 #1〕). ① Hiển thị lịch dự kiến ở mức nào trên trang chuyên dụng của công ty giao hàng (bao nhiêu tháng sau・mục nào. 〔Chu kỳ §4C-4〕. Vì phân loại giao hàng và khung của hợp đồng hiển thị nguyên, nên ảnh hưởng đến việc hiển thị mục nào trong các mục của chương này). ③ Điều kiện phán định tự động của thay đổi có chứa sản phẩm hạn tiêu thụ ngắn (đã quyết việc chia tách do vận hành phán đoán, nhưng ngưỡng để phán định là "có chứa hạn tiêu thụ ngắn" và báo cho vận hành = số ngày còn lại của hạn sử dụng, v.v. chưa quyết. Liên quan trực tiếp đến phán đoán vận hành về việc cho phép +1 ngày ở §6-2).

> ⚠️ **Cần xác nhận #21** — Danh sách mục (`Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md`) chưa phản ánh v2.1. Ít nhất 3 điểm chưa cập nhật: ① lead time "giá trị mặc định là lead time theo kho" (#6) → không tự động bổ sung ② định nghĩa tháng chu kỳ → tháng mà khung thứ 14 B7 thuộc về ③ đăng ký khung giờ nhận・điều kiện giao hàng (đặt bao nhiêu mục ở tab nào. Khung giờ nhận là bảng con `site_receive_windows`). Vì phạm vi phản ánh của 〔Quyết định F〕 là "bản đặc tả tổng hợp + 2 bản gốc", hãy xác nhận có cần sửa đổi danh sách mục hay không.
