# Đặc tả giao hàng: Kết nối với thanh toán・Màn hình và cách hiển thị (§14, §15)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (2026-10-03 tách theo từng chương. Nội dung giữ nguyên như lúc tách) -->

## 14. Kết nối với thanh toán

### 14-1. Chốt sổ theo tháng dương lịch của ngày giao hàng

**Chốt sổ** được xác định theo **tháng dương lịch của ngày giao hàng**. **Tên chu kỳ** (`2026年10月 配送サイクル`) là **nhãn hiển thị** theo tiện lợi vận chuyển, không dùng cho thanh toán. **Giao từng phần dựa trên thực tế giao hàng**, tính số lượng đó vào **tháng dương lịch của ngày thực sự giao hàng**. **Cha-con (số nhánh) chỉ là cách gộp phiếu, không quyết định số tiền thuộc về tháng nào** [Chu kỳ §4D-1] [Yêu cầu REQ-DL-660].

| Trường hợp | Kết quả |
|---|---|
| Ngày 20/8 giao 18 suất, ngày 22/8 giao 2 suất còn lại | Cả hai đều tính vào thanh toán tháng 8. Tổng 20 suất. Hóa đơn dù 1 dòng vẫn có thể hiển thị chi tiết 20/8 18 suất・22/8 2 suất |
| **Ngày 31/8 giao 18 suất, ngày 2/9 giao 2 suất còn lại** | **Thanh toán tháng 8 là 18 suất, thanh toán tháng 9 là 2 suất.** Khớp với thực tế, và cũng dễ giải trình khi kiểm toán |
| 2 suất còn lại cuối cùng không giao được | 2 suất đó **không thanh toán** (vì chưa giao) |

| Khoản mục | Tháng được tính vào |
|---|---|
| **Số tiền cố định của gói・tùy chọn・thiết bị・giảm giá (① trả trước)** | 1 tháng của **hợp đồng・tháng chu kỳ**. Tháng thanh toán = tháng chu kỳ − lead time phát hành hóa đơn, xác nhận vào ngày 25 của tháng thanh toán |
| **Giao từng phần・giao lại・chi phí spot** | **Tháng dương lịch của ngày giao hàng** (dựa trên thực tế). Chi phí spot có thể chỉ định kỳ đối tượng cho từng dòng |
| **Tất toán thực tế (② trả sau)** | Đối tượng là từ ngày 21 tháng trước đến ngày 20 tháng này, thanh toán vào tháng sau khi kiểm kê đã chốt |

- **Thông thường một hóa đơn chứa cả ① và ②** (đến từ các hợp đồng con khác nhau). Tuy nhiên **nếu hạn thanh toán khác nhau thì tách hóa đơn** (14-4). **Thực tế đã giao hàng không bị chốt** (ngày giờ hoàn thành・số lượng giao・ghi chú có thể sửa kèm lý do, tài liệu đính kèm có thể thêm・thay thế). Tuy nhiên **việc sửa thực tế liên quan đến tháng thanh toán đã xác nhận không ghi đè ngược thanh toán, mà phản ánh bằng điều chỉnh từ tháng sau trở đi** (14-3) [Chu kỳ §4A-4C] [Luồng sự cố §6].

### 14-2. Xử lý hủy・hàng thay thế・giao lại・sửa đổi đơn giá

| Sự kiện | Xử lý thanh toán | Nguồn |
|---|---|---|
| **Hủy** | Thực tế bằng 0. Sản phẩm **bị loại khỏi đối tượng thanh toán của tháng này. Không chuyển sang kỳ sau** (vì chuyển sang sẽ không truy vết được). **Cước vận chuyển là `freight_billable`** (cờ dùng chung với giao lại・mặc định "không"・chọn "có" phải có lý do) | [Chu kỳ §4D-1] [Quyết định v2.3 #40] |
| **Hủy do khách hàng sau hạn chót** | **Không thanh toán (như hiện hành). Không tạo hạng mục "phí hủy"** | [Quyết định #69] [Yêu cầu REQ-DL-857] |
| **Hàng thay thế** | Thanh toán **theo giá của sản phẩm gốc (hạng mục gốc)** (chênh lệch giá vốn của hàng thay thế do ES chịu). Tính theo đơn giá của `delivery_lines.substituted_from_product_id` (nguồn thay thế) | [Chu kỳ §4D-1] [Luồng sự cố §7] [Quyết định v2.3 #39] |
| **Trả về** (hàng còn lại trả về trụ sở) | **Không thanh toán** (dữ liệu giao hàng có `duplicate_type = return` nằm ngoài đối tượng thanh toán) | [Quyết định v2.3 #41] |
| **Hủy bỏ (phế bỏ)** | Do chưa giao nên **không thanh toán**. Điều chỉnh ở phía tồn kho | [Chu kỳ §4D-1] |
| **Thiếu giao** | Thanh toán theo thực tế nên **nếu chưa giao thì không thanh toán** (11-5) | [Chu kỳ §4D-1] |
| **Con tự động trước khi xác nhận** | Con có `duplicate_type=trouble_pending` **nằm ngoài đối tượng thanh toán**. Số lượng tạm không dùng cho thanh toán. Sau khi vận hành (logistics) xác nhận và chuyển sang chờ xuất hàng thì thanh toán theo thực tế giống các con khác | [Quyết định v2.3 #22・#23] |
| **Giao lại** | Không thay đổi thanh toán sản phẩm. Cước vận chuyển **xét riêng từng trường hợp** (cờ thanh toán／không **`freight_billable`**・mặc định "không"・chọn "có" phải có lý do. Tên cũ `redelivery_billable`) | [Chu kỳ §4D-1] [Yêu cầu REQ-DL-660] [Quyết định v2.3 #40] |
| **Sửa đổi đơn giá** | **Giữ ở sửa đổi giá của master gói (thế hệ ①~④), và đưa vào thanh toán.** Không ghi đơn giá trực tiếp vào phía hợp đồng | [Quyết định #69b] [Yêu cầu REQ-DL-858] |
| **Phụ thu khu vực** (thêm ngày 2026/09/30) | Lấy phụ thu khu vực trong master điểm giao ủy thác (vận hành nhập thủ công・3-3) làm tham khảo, **đưa vào thanh toán dưới dạng tùy chọn của hợp đồng con (phí giao hàng khu vực của master tùy chọn)** | [Bảng yêu cầu dòng 53・78・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930] |
| **Số tiền doanh nghiệp chịu và thuế suất** (28-147~150) | Master gói có số tiền doanh nghiệp chịu (mặc định 100 yên・đã gồm thuế・1 suất) và thuế suất (master thuế suất). Chia giá gói (chưa thuế) thành **phí cơ bản (10%) + phần doanh nghiệp chịu (8%)**. Chụp snapshot khi tạo hợp đồng con (`contract_month_plan_snapshot`). "Áp dụng phúc lợi" ON = hóa đơn 2 dòng, OFF = 1 dòng (thuế tính theo 2 thuế suất). Chi tiết ở đặc tả thanh toán | [Nguồn gốc: DEV §4.9] |
| **Chênh lệch thu tiền mặt** (thanh toán tiền mặt trên ứng dụng) | **Chỉ khi số tiền dự kiến thu khác với số tiền tài xế thực thu mới đưa chênh lệch vào ② tất toán thực tế** (thiếu = thanh toán thêm, thu dư = giảm). Nếu khớp thì không đưa vào. Khoản đã thanh toán bằng ứng dụng không đưa vào tất toán thực tế | [Liên quan đơn đăng ký 28-135] |

- Vì không có phí hủy khi hủy sau hạn chót nên xử lý theo **một nguyên tắc duy nhất "hủy = không thanh toán"**, và trên thanh toán không phát sinh dòng [Quyết định #69]. Lý do không giữ sửa đổi đơn giá như hạng mục riêng bên thanh toán là vì **chuẩn của giá là thế hệ trong master gói**. Khi tạo hợp đồng con thì **chụp snapshot giá của thế hệ áp dụng cho tháng chu kỳ đó**, kể cả khi tạo trước như thanh toán trả trước một năm thì cũng **lấy riêng thế hệ áp dụng cho từng tháng chu kỳ**. **Đơn giá sau sửa đổi hiển thị trong chi tiết thanh toán ở dạng biết được thế hệ đã áp dụng.** Hợp đồng con đã thanh toán không sửa, mà phản ánh từ tháng sau trở đi bằng điều chỉnh ở 14-3 [Chu kỳ §4D-1].

### 14-3. Hoàn tiền・bù trừ (điều chỉnh)

**Không tạo bảng thứ 3 độc lập (③ điều chỉnh). Trong từng ① trả trước・② tất toán thực tế, cho phép giữ điều chỉnh (hoàn tiền・bù trừ)** [Quyết định #70] [Yêu cầu REQ-DL-835].

| Hạng mục | Nội dung |
|---|---|
| Cấu trúc bảng | Phân loại thanh toán của hợp đồng con có 2 loại **① trả trước／② tất toán thực tế**. Giữ dòng `adjustment(refund \| offset)` **như chi tiết bên trong** |
| Lý do | Điều chỉnh luôn được xác định là điều chỉnh cho "khoản trả trước nào" "tất toán thực tế nào", nếu tách ra sẽ phải giữ riêng quan hệ tương ứng. Về mặt hóa đơn cũng dễ đọc hơn khi hiển thị trong từng chi tiết |
| Nguyên tắc | **Không hủy hợp đồng con đã thanh toán.** Vì nếu xóa thanh toán gốc sau khi đã xuất hóa đơn thì **đối chiếu phía Bill One sẽ không khớp** |
| Thời điểm・đơn vị lập | **Khi phê duyệt tạm dừng・hủy hợp đồng**, **tự động lập** điều chỉnh cho phần chu kỳ đối tượng. Đơn vị là **chu kỳ (hợp đồng con)**, mỗi chu kỳ bị bỏ qua do tạm dừng・chu kỳ không thực hiện do hủy hợp đồng lập thành 1 dòng |
| Hoàn tiền hay bù trừ | Vì là **quyết định theo từng doanh nghiệp** nên vận hành chọn khi lập. **Mặc định là bù trừ** |

- Cái được hấp thụ bằng điều chỉnh: **phần tạm dừng・hủy hợp đồng của thanh toán trả trước một năm** là **điều chỉnh trong ① trả trước**／**sửa thực tế liên quan đến tháng thanh toán đã xác nhận** (kể cả khi nhận liên lạc sau giao hàng rồi sửa thực tế. Không đổi trạng thái `納品済` (đã giao)・11-7 [Quyết định v2.3 #20]. Cũ: trường hợp đưa từ đã giao → đang xác nhận) và **chênh lệch được phát hiện sau do hoàn thành mặc định của chuyến do công ty vận tải đảm nhận ở final leg** (11-2) là **điều chỉnh trong ② tất toán thực tế**. Những chỗ trong đặc tả này ghi "③ điều chỉnh" đều chỉ **điều chỉnh trong ① hoặc ②** [Chu kỳ §4D-1].

### 14-4. Hạn thanh toán (hạn nhận tiền)

**Tách hóa đơn theo `billing_type` hoặc `payment_due_date`. Một hóa đơn chỉ có một hạn thanh toán** [Quyết định v2.1 #10] [Yêu cầu REQ-DL-880] (Cũ: lần 1 #71 "giữ hạn nhận tiền trong thanh toán của hợp đồng con bằng 2 hạng mục `advance_payment_due_date` / `settlement_payment_due_date`". Ngày 2026/09/21 lần 2 cụ thể hóa thành dạng "tách hóa đơn").

| | Chỉ cái gì | Quản lý ở đâu |
|---|---|---|
| **Hạn xuất hóa đơn** | Hạn đến khi xác nhận số tiền của hợp đồng con, tạo dữ liệu thanh toán và chuyển cho Bill One | **Hệ thống này** (**chốt ngày 20 → xác nhận ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau** [Sổ cái]. Cũ: ngày xác nhận thanh toán = ngày 25 → phát hành cuối tháng. Sửa ngày 2026-10-03 cho khớp sổ cái) |
| **Hạn nhận tiền (hạn thanh toán)** | Hạn doanh nghiệp thực sự thanh toán số tiền đó | **Hệ thống này giữ trong hóa đơn (`invoices.payment_due_date`). 1 hóa đơn = 1 hạn thanh toán** |
| **Bù trừ nhận tiền・chậm trả・nhắc nợ** | Đối chiếu nhận tiền và nghiệp vụ thu hồi | **Phía Bill One**. Không tạo trong hệ thống này |

- **Nếu hạn khác nhau giữa trả trước và tất toán thực tế thì chia thành 2 hóa đơn** [Quyết định v2.1 #10]. **Không áp dụng phương án chọn một hạn chung.** Vì nếu một hóa đơn có 2 hạn thì **khi bù trừ nhận tiền sẽ không phán định được khoản nhận tiền thuộc hạn nào**.
- Về dữ liệu, dùng `invoices(contract_month_id, billing_type, payment_due_date)` làm khóa chia, và bộ này là duy nhất (`UNIQUE`) [Chu kỳ §7]. Batch thanh toán `billing_issue` (mỗi ngày 04:30) lập **mỗi hóa đơn cho mỗi cặp `billing_type` và `payment_due_date`**, **không ghi 2 hạn thanh toán trong 1 hóa đơn** [Chu kỳ §11-1]. **Phần hệ thống giữ chỉ đến giá trị của hạn, còn sau đó (đã nhận tiền chưa) thì Bill One là chuẩn**. Ngày trừ tiền của chuyển khoản・thẻ tín dụng cũng dùng ngày này [Quyết định #71]. Câu "hệ thống này không có hạng mục hạn thanh toán・ngày nhận tiền・kỳ hạn thanh toán" của bản cũ (2026/09/15) đã được **rút lại vào 2026/09/21** vì cần cho việc ghi trên hóa đơn và hiển thị cho doanh nghiệp [Chu kỳ §4D-1].

### 14-5. Chuyển giao số lượng order đã xác nhận

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Khi nào | Batch hằng ngày `order_finalize` (mỗi ngày 02:45) lấy **chu kỳ đã qua ngày hạn chót order** | [Chu kỳ §11-1・§4A-2] |
| Làm gì | **Xác nhận số lượng** của order và **ghi số lượng xác nhận vào dữ liệu giao hàng** (không tạo bản ghi). Đồng thời **cố định tắt chế độ đổi ngày**, và giữ **nguồn của số lượng xác nhận** (`ordered` ／ `standard` ／ `ai`) trong dữ liệu | [Chu kỳ §4A-2] [Yêu cầu REQ-DL-810] |
| Khi không có đơn hàng | **Chế độ AI OFF (mặc định) = số lượng tiêu chuẩn** (giá trị chia số lượng gói theo số lần giao hàng)／**Chế độ AI ON = AI tự động đặt số lượng**. Chế độ AI **ON／OFF theo từng cơ sở (hợp đồng)**. Màn hình doanh nghiệp hiển thị số lượng sau khi xác nhận và không để lộ việc đã nhập tự động (để doanh nghiệp nhận ra mình quên đặt hàng) [Nguồn gốc: Thiết lập chu kỳ giao hàng §4A-2D]. (Khi bản thân khung order không có thì xuất `qty_missing` hay điền bằng số lượng tiêu chuẩn đang xác nhận ở `配送_10` §18-1 [DEV §8.2]) | [Chu kỳ §4A-2D] [Yêu cầu REQ-DL-810] |
| **Số lượng xác nhận 0** | Là giá trị đúng. Xử lý giống hủy trước khi xuất hàng (gửi lại với số lượng 0・10-3). Không coi là thiếu dữ liệu. Khi xác nhận, đưa order vào `deliveries.order_id` | [Nguồn gốc: DEV §8.2] |
| Chuyển giao hạ nguồn | Số lượng xác nhận được chuyển sang **chỉ thị xuất hàng (Thomas)**. Chỉ thị xuất hàng **gộp 2 tuần A＋B tuần／C＋D tuần, xuất ra 3 ngày trước ngày bắt đầu (thứ Sáu)**. Thay đổi sau khi xuất ra được **ghi đè bằng gửi lại có số phiên bản**, **hủy thì gửi lại với số lượng 0** | [Chu kỳ §4D-3] [Yêu cầu REQ-DL-812・662] |
| Chuyển giao cho công ty giao hàng ủy thác・thanh toán | Việc kế hoạch trên trang chuyên dụng được xác nhận cũng xảy ra **vào thời điểm này** (11-6. Sau khi xác nhận hiển thị toàn bộ hạng mục [Quyết định v2.3 #34]). Số lượng xác nhận không phải căn cứ trực tiếp của thanh toán (**thanh toán dựa trên thực tế giao hàng**. 14-1) | [Chu kỳ §4C-4・§4D-1] |

**Với hạn chót tạm (`marker_source = provisional`) thì không chạy xác nhận số lượng cũng như email xác nhận** [Quyết định v2.1 #9] [Yêu cầu REQ-DL-879・811・840]. Khi chưa đăng ký menu nên không lấy được ngày hạn chót order thì phán định **ngày 15 tháng trước là hạn chót tạm**, màn hình hiển thị "**Tạm**", nhưng việc có thể làm được giới hạn như sau.

| Xử lý | `marker_source = provisional` (tạm) | `marker_source = menu` (hạn chót thật) |
|---|---|---|
| `order_finalize` (xác nhận số lượng) | **Không chạy (ngoài đối tượng)** | Chạy |
| **Gửi email xác nhận** (doanh nghiệp・công ty giao hàng ủy thác) | **Không gửi** | Gửi |
| **Gửi chỉ thị xuất hàng** (liên kết Thomas). Do đó cũng không đặt `locked` | **Không gửi** | Gửi |
| Đóng tiếp nhận thay đổi (tắt chế độ đổi ngày) | **Chạy** | Chạy |
| Kiểm tra `plan_recheck` và các kiểm tra khác・tạo mục cần xác nhận | **Chạy** | Chạy |

- **Hạn chót order không phải là "kích hoạt tạo" mà là "điểm xác nhận số lượng"**. Vì doanh nghiệp đặt hàng cho dữ liệu giao hàng đã được tạo nên dữ liệu giao hàng phải tồn tại ngay từ lúc bắt đầu order [Chu kỳ §4A-2].
- **Hạn chót tạm là giá trị mặc định để phán định nội bộ, không phải ngày đã hứa với doanh nghiệp hay kho.** Nếu chốt số lượng bằng ngày tạm rồi chuyển đến chỉ thị xuất hàng thì khi menu được đăng ký sau và hạn chót dịch chuyển sẽ không thể lấy lại. Khi menu được đăng ký thì thay bằng ngày thực, và sau khi thành `marker_source = menu` mới được `order_finalize` lấy [Chu kỳ §4A-2E・§11-1].

> ✅ **Cần xác nhận #40 (đã giải quyết)** — ~~Chưa quyết việc hiển thị kế hoạch đến đâu trên trang chuyên dụng của công ty giao hàng (trước mấy tháng・đến hạng mục nào)~~ → **Giải quyết bằng bổ sung 4 ngày 2026/09/29**. Kế hoạch hiển thị đến chu kỳ tháng sau・chỉ đến số lượng, sau khi xác nhận hiển thị toàn bộ hạng mục [Quyết định v2.3 #34・#51] (11-6).

> ⚠️ **Cần xác nhận #41** — 【Tạm】Giữa số điện thoại liên hệ cho tài xế 050-5784-2777 và nơi báo lỗi thiết bị 050-3784-2771, số nào là hiện hành (với giả định ghi song song như hai đầu mối riêng) [Quyết định E#67] [Yêu cầu REQ-DL-150]. Ảnh hưởng đến popup lỗi ở 12-2 và hiển thị đầu mối ở 12-3.

> ⚠️ **Cần xác nhận #42** — 【Tạm】Túi giữ lạnh・gói giữ lạnh của phần gửi qua Yamato được coi là "dùng một lần (không thu hồi)", nhưng chưa xác nhận thực tế có thu hồi không・có nhờ doanh nghiệp trả lại không [Quyết định E#64] [Yêu cầu REQ-DL-664]. Nếu thu hồi thì phải xem lại "không tạo quản lý thu hồi" ở 12-5.

> ⚠️ **Cần xác nhận #43** — Chưa xác nhận có cần hạng mục "tên công ty" trong quản lý tài xế không (đã quyết không giữ phân loại tên công ty・đánh giá・ô ghi chú, nhưng bản thân tên công ty đang chờ xác nhận của công ty D) [Yêu cầu REQ-DL-505]. Ảnh hưởng đến hạng mục master ở 12-3.

> ⚠️ **Cần xác nhận #44** — ~~Đang điều tra khả năng có nhóm chat 3 bên giữa tài xế・trụ sở・người đặt hàng [Yêu cầu REQ-DL-153]. Nếu được thì có thể gom chat ở 12-2 và chat trên Web công ty giao hàng ủy thác ở 12-6 vào cùng một luồng.~~ (Hủy ngày 2026/09/30: không có chat, khẩn cấp thì liên lạc bằng nút điện thoại [Bảng yêu cầu dòng 49・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930]) Việc hỗ trợ đa ngôn ngữ của ứng dụng (thiết lập ngôn ngữ OS hoặc đổi ngôn ngữ trong ứng dụng) cũng vẫn là 【Tạm】 [Yêu cầu REQ-DL-154].

> ⚠️ **Cần xác nhận #45 (giải quyết một phần)** — Ngày chốt thanh toán đã xác định là **chốt ngày 20 → xác nhận ngày 25 → phát hành Bill One vào ngày 1 tháng sau** [Sổ cái] (14-4). Phần còn lại là phân biệt trả trước・trả sau. (Dưới đây là mô tả gốc) Chưa xong việc xác nhận đặc tả hiện hành về thanh toán・hợp đồng [Quyết định G]. Khi xác định ngày chốt thanh toán hiện tại (chốt cuối tháng／chốt ngày 20, v.v.) và phân biệt trả trước・trả sau thì có thể điều chỉnh tháng thuộc về theo từng khoản mục ở 14-1 và giá trị mặc định của hạn nhận tiền ở 14-4 cho khớp thực tế [Chu kỳ §4D-1 Cần xác nhận].

> ✅ **Cần xác nhận #46 (đã giải quyết)** — ~~Tên vật lý của bảng giữ cờ chặng cuối không thống nhất giữa các nguồn gốc~~ → **Giải quyết bằng quyết định lần 4 ngày 2026/09/23**. Thống nhất thành **`delivery_legs.is_final_leg`**, phía hợp đồng do `contract_routes` / `contract_month_routes` giữ [Quyết định v2.3 #1] (16-3).

> ✅ **Cần xác nhận #47 (đã giải quyết)** — ~~Giờ kho bắt đầu picking trong ngày (hạn chót thực chất của gửi lại)~~ → **Giải quyết bằng quyết định lần 3 ngày 2026/09/22**. Điểm chuyển là **thời điểm nhận kết quả xuất hàng** (13-2 ① "gửi lại với số lượng 0 → từ đó liên lạc bằng điện thoại") [Quyết định v2.2 #4].


## 15. Màn hình và cách hiển thị

### 15-1. Màn hình 03 Danh sách kế hoạch xuất hàng

Màn hình xem kết quả được tạo từ màn hình 01 (thiết lập chu kỳ giao hàng) × màn hình 02 (thiết lập giao hàng của hợp đồng) theo đúng nguyên trạng. Dùng để kiểm tra sản phẩm của batch, không phải cửa ngõ vận hành. Các dòng **theo thứ tự tăng dần của ngày giao hàng** [Chu kỳ §1.2・§5.1].

| Cột | Nội dung | Nguồn |
|---|---|---|
| Chu kỳ đối tượng／Giao hàng／Slot giao hàng | `2026年9月 配送サイクル`／`配送1`／`B3`. **Tháng chu kỳ = tháng mà ô thứ 14 `B7` thuộc về**. `special` hiển thị tham khảo "chỉ định riêng" + slot của ngày đó | [Quyết định v2.1 #11] [Yêu cầu REQ-DL-881] |
| Ngày giao hàng [chuẩn]／Ngày picking [tính ngược] | Khi chuyển ngày thì `ngày gốc (gạch ngang) → ngày xác nhận`. Cột có huy hiệu chuẩn và màu nền. **Lần rơi vào ngày không xuất hàng được thì cả ngày picking và ngày giao hàng đều dịch chuyển** | [Quyết định #15] [Chu kỳ §4.5] [Yêu cầu REQ-DL-842] |
| Lead time | Giá trị thiết lập của **phân loại giao hàng của hợp đồng** (**0~7 ngày**). Không lấy từ master kho, cũng không tự điền giá trị mặc định | [Quyết định #4・#10] [Chu kỳ §12-2・§12-6] |
| Số lượng | **Số lượng dự kiến (`estimated_qty`).** Kế hoạch giữ số lượng bên trong. Chỉ là `draft` nên không cho doanh nghiệp xem | [Quyết định v2.1 S1] [Yêu cầu REQ-DL-882] |
| **Vòng đời của kế hoạch** | `Kế hoạch (draft)`／`Xác nhận (published)`／`locked`. Từ `published` trở đi nằm ngoài đối tượng tính lại | [Quyết định v2.1 S5] [Chu kỳ §4A-3] |
| **Trạng thái giao hàng** | Dòng kế hoạch là **"—"**. Sau khi có dữ liệu giao hàng mới có từ `chờ xuất hàng` trở đi. Không trộn vào cùng cột với `plan lifecycle` | [Quyết định v2.1 S5] [Yêu cầu REQ-DL-883] |
| Phán định | Xanh "Đúng kế hoạch"／Vàng "Bất đắc dĩ ＋1 ngày (trong phạm vi cho phép)"／Đỏ "Lead time thực N ngày (hợp đồng M ngày・＋K ngày)"／Xám "**Không tạo được kế hoạch**" | [Quyết định #19] [Chu kỳ §4.5] |
| Kho → Giao hàng | `Kho → Điểm trung chuyển → Công ty giao hàng`. Trung chuyển **chỉ 2 giá trị có／không**, suy ra từ route legs | [Quyết định v2.1 #7] [Yêu cầu REQ-DL-876] |
| Ghi kèm lý do | Với không được・chuyển ngày・cần xác nhận **luôn ghi kèm lý do** (`Coi như ngày lễ giao hàng: <tên ngày lễ>`／`Ngày trong tuần không giao được: <thứ> `／`Slot không xuất hàng được <slot> (<kho>)`／`Ngày không xuất hàng được: <lý do>`／`Tạm dừng chu kỳ: <tên kỳ>`). **Danh sách = ngắn** (`Dời sớm 2 ngày`), **chi tiết・tooltip = đầy đủ** (`Đã dịch chuyển 2 ngày so với B3 gốc (2026-09-17)`) | [Quyết định #27] [Chu kỳ §4.5] |

**Huy hiệu số lượng "Yêu cầu thay đổi (chưa xử lý)"** [Quyết định v2.2 #6] [Yêu cầu REQ-DL-893]

- Huy hiệu **chỉ đếm "số lượng đã đến hạn xử lý mà chưa xử lý"**. Để chỉ ra số lượng cần ra tay ngay bây giờ.
- **Tổng số xem ở màn hình danh sách.** Nếu huy hiệu hiển thị toàn bộ thì lẫn cả các yêu cầu hạn còn xa, không thành "số lượng cần xử lý ngay".
- Vì là quy định về màn hình nên **không đưa vào đặc tả DEV** (nếu có ý kiến khác thì thay thế).
- **(Cũ: §18 No.21 "Chưa quyết cách đếm huy hiệu (hiện tại là toàn bộ)". Giải quyết bằng quyết định lần 3 ngày 2026/09/22)**

### 15-2. Lịch vận hành (màn hình 04・05) — 3 chế độ tháng・tuần・ngày

Màn hình 04 (lịch picking = **tổng hợp theo ngày picking**) và màn hình 05 (lịch giao hàng = **tổng hợp theo ngày giao hàng**) là các góc nhìn khác nhau của cùng một dữ liệu. Tách lịch giữa xuất hàng và giao hàng, **có thể lọc theo kho** [Chu kỳ §5.2・§5.3] [Yêu cầu REQ-DL-308].

| Chế độ hiển thị | Màn hình để xem gì | Hiển thị／không hiển thị |
|---|---|---|
| **Chế độ tháng** | **Xem số lượng** | Ô là `Ngày ／ Tên chu kỳ・khung ／ Xuất hàng: N đơn ／ Giao hàng: N đơn` (04・05 trong một lịch). **Huy hiệu có điều kiện**: vượt 300 đơn・sự cố = đỏ, chưa phân công (từ chờ xuất hàng)・yêu cầu thay đổi = vàng (ngày đã qua thì không hiển thị), di chuyển・thay đổi・hủy = xám. Mỗi ô tối đa 2 huy hiệu (đỏ→vàng→xám), còn lại là "+N". Ngày đã qua chỉ có đỏ. Bấm ô sẽ sang chế độ tuần [Sổ cái B "Chế độ tháng của lịch vận hành"・hong trả lời 2026-10-03. Cũ: không hiển thị dấu trạng thái・dấu đã điều chỉnh] |
| **Chế độ tuần** | **Xem cấu trúc của chu kỳ** | Kỳ của chu kỳ・mã tuần・kỳ tạm dừng・**pill ngày không xuất hàng được** (15-4) chỉ hiển thị ở chế độ tuần |
| **Chế độ ngày** | **Xử lý từng đơn** | **Chế độ này xử lý kế hoạch (`draft`).** Thứ tự là `Chu kỳ` → `Cần xử lý` → `Tên doanh nghiệp・tên cơ sở`, trong cần xử lý là `Yêu cầu thay đổi` → `Chưa đặt tài xế`. Dòng cần xử lý đổi màu nền, **không đặt văn bản giải thích mà chỉ hiển thị số lượng** |

- **Điều kiện cần xử lý**: có yêu cầu thay đổi chưa xử lý (trước hạn chót)／tài xế vẫn chưa được đặt vào ngày hôm trước・trong ngày・đã qua ngày giao hàng・đã xuất hàng mà chưa đặt／lead time thực − lead time hợp đồng > 1 ngày／đã dịch chuyển quá 3 ngày so với khung gốc／bản sao giao từng phần・giao lại vẫn đang xác nhận／con tự động của sự cố hết hạn (`trouble_auto_child_pending`) [Quyết định v2.3 #22]／**không tạo được kế hoạch** [Chu kỳ §5.3C] [Quyết định #19]. Vì tài xế được **công ty giao hàng ủy thác phân công từ 1 tuần trước đến ngày hôm trước ngày giao hàng**, nên chưa đặt tài xế khi còn 2~7 ngày đến giao hàng là "chờ phân công" và không đếm vào cần xử lý (cách đếm cần xử lý ở chế độ ngày. Trong cần xác nhận `assignment_missing` thì hiển thị từ 3 ngày trước ngày giao hàng <2026/09/30> [Bảng yêu cầu dòng 142・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930]). Phân công theo **đơn vị chặng (leg)**, **chặng của công ty vận tải thì không phân công, chặng của công ty mình・ủy thác thì phân công** [Quyết định v2.3 #48] (Cũ: vận hành tạm thời chỉ chặng thứ 2 <điểm trung chuyển→nơi giao hàng> [Quyết định #60]. Thay thế ngày 2026/09/29). **Việc hiển thị tài xế chưa đặt trong cần xác nhận (`assignment_missing`) là từ 3 ngày trước ngày giao hàng** (3 ngày trước và ngày hôm trước cũng hiển thị trên Web công ty giao hàng ủy thác, và gửi email cho công ty giao hàng ủy thác), trước đó thì xem bằng huy hiệu "Chưa phân công N đơn" ở chế độ tháng・tuần (thay đổi ngày 2026/09/30. Cũ: từ ngày hôm trước ngày giao hàng [Quyết định v2.3 #43]) [Bảng yêu cầu dòng 142・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930]. **Ngưỡng số lượng theo từng kho** (mặc định **300 đơn／ngày**). Ngày vượt chỉ biểu thị bằng viền và số lượng, không dừng xử lý. **Giao hàng vật tư không tính vào số lượng** [Chu kỳ §5.2]. **Tab kho chỉ là lọc dữ liệu, không phải đơn vị quyền hạn** — dù chuyển tab thì người xem được và việc làm được không đổi [Quyết định v2.1 #2] [Yêu cầu REQ-DL-885]. **Không chồng cùng thông tin lên header** (chế độ ngày theo thứ tự ① thanh công cụ ② tab <số lượng xuất hàng／giao hàng> ③ dải chu kỳ ④ tiêu đề ngày, không hiển thị ngày・số lượng・tên chu kỳ ở 2 chỗ) [Chu kỳ §5.3C].
- **Tìm kiếm theo địa chỉ** (thêm ngày 2026/09/30): lịch giao hàng có thể lọc theo **tỉnh・thành phố/quận・mã bưu điện** của cơ sở. **Không tạo tìm kiếm theo tổ hợp thứ giao hàng (thứ ○ tuần 1 tuần 3, v.v.)**. Thứ đáp ứng・phí của bên ủy thác xem ở master điểm giao ủy thác (3-3) [Bảng yêu cầu dòng 28・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930].

### 15-3. Dấu trạng thái chỉ khi ngoại lệ

Thống nhất phương châm **chỉ hiển thị dấu khi ngoại lệ** ở mọi chế độ hiển thị [Chu kỳ §12-9 #3].

| Chế độ hiển thị | Cũ | Mới |
|---|---|---|
| Ô của chế độ tháng | `◆ Xác nhận` `◇ Kế hoạch` | **Bỏ cả hai.** Ô chỉ còn `5 ／ Chu kỳ tháng 10 A1 ／ Xuất hàng: 32 đơn`. Kế hoạch được phân biệt bằng **viền nét đứt** và dòng "Kế hoạch N đơn" ở dòng số lượng (cũng hiển thị trong chú giải) |
| Tiêu đề nhóm của chế độ tuần | `◆ Dữ liệu giao hàng` `◇ Kế hoạch` | Bỏ `◆ Dữ liệu giao hàng`. Giữ **`◇ Kế hoạch` là ngoại lệ** và **tên chu kỳ chỉ ra phần của chu kỳ khác** (nếu cả hai thì `Chu kỳ tháng 11・◇ Kế hoạch`) |
| Chế độ ngày・danh sách・chi tiết | — | Hiển thị **`delivery status` (chờ xuất hàng~hủy) và yêu cầu thay đổi (có thể đổi~không thể đổi) bằng huy hiệu chữ**. Dấu trạng thái của dải chỉ khi ngoại lệ (kế hoạch = chưa xác nhận・tạm dừng chu kỳ・ngoài kỳ tạo) |
| **Web doanh nghiệp (màn hình 07)** | Huy hiệu "Kế hoạch" "Xác nhận" | **Giữ dấu "Kế hoạch".** Chế độ tháng của Web vận hành vẫn bỏ thẻ [Quyết định #77] [Chu kỳ §12-9 #3-4]. Chỉ doanh nghiệp là ngoại lệ vì doanh nghiệp không có cách nào khác để đọc ra "ngày này chưa xác nhận" (vận hành đọc được giai đoạn từ tiêu đề dòng ở chế độ ngày) |

### 15-4. Pill ngày không xuất hàng được

Hiển thị **ngày không xuất hàng được** của tuần đó bằng pill ở dải chế độ tuần (chế độ ngày thì khung biểu thị tuần và thứ nên không chồng) [Chu kỳ §5.3C].

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Cách gộp | **Gộp ngày liên tiếp và kho thành 1 dòng** (ví dụ: `Ngày không xuất hàng được 2026-10-16~2026-10-17 Kiểm tra thiết bị`). Ngày chỉ một số kho không được thì ghi kèm **tên kho** ở "Nghỉ: xuất hàng" của lịch | [Chu kỳ §5.3C] [Yêu cầu REQ-DL-765] |
| **Nội dung tooltip** | **"Lần rơi vào ngày này sẽ chuyển cả ngày picking và ngày giao hàng".** ① Trước tiên xem chỉ dời sớm ngày picking thì có vừa với chênh lệch 0 không ② Nếu không vừa thì cũng dịch ngày giao hàng theo "dời sớm・dời muộn" của hợp đồng. Câu cũ "chỉ picking dừng" đã **bị hủy** | [Quyết định #15] [Chu kỳ §5.3] [Yêu cầu REQ-DL-842] |
| Khác với tạm dừng chu kỳ | Tạm dừng chu kỳ **không tiêu thụ khung**, dừng cả giao hàng và picking, và tiếp tục khung từ ngày sau khi hết tạm dừng. Ngày không xuất hàng được **tiêu thụ khung** và chỉ chuyển ngày của lần đó | [Chu kỳ §2.2・§4.2] |
| Nghỉ 1~2 ngày／khi không chuyển được | Nghỉ 1~2 ngày như kiểm tra thiết bị・kiểm kê được đưa vào **ngày không xuất hàng được chứ không phải tạm dừng chu kỳ** (hoặc ngày coi như ngày lễ giao hàng) (vì tạm dừng được làm tròn theo 7 ngày)／khi ngày hôm trước cũng không được・lead time kéo dài quá mức thì không tự động dịch, mà hiển thị là **"không tạo được kế hoạch" trong cần xác nhận** | [Chu kỳ §2.2] [Quyết định #19] |

### 15-5. Màn hình 05B Quản lý xuất hàng・giao hàng (danh sách)

Vì lịch chỉ tìm được "khi nào" nên tách riêng **danh sách để tìm theo điều kiện**. Chuyển đổi giữa Lịch ⇄ Quản lý xuất hàng・giao hàng ở menu trái [Chu kỳ §5.3B].

| Hạng mục | Nội dung |
|---|---|
| Hiển thị | **Chỉ dữ liệu giao hàng.** Không hiển thị kế hoạch (`draft`) (vì các cột số lượng・phiếu vận chuyển・tài xế・trạng thái không có giá trị). Khi kỳ chứa kế hoạch thì hiển thị số lượng "Kỳ này có N kế hoạch (từ <ngày đầu tiên> trở đi)" phía trên danh sách, kèm **liên kết sang chế độ ngày** |
| Cột mặc định／cột tuyến | No／Số giao hàng／Tên cơ sở (＋nhóm nhiệt độ)／Trạng thái／Yêu cầu thay đổi／Ngày xuất hàng／Ngày giao hàng／Tài xế／Thao tác. Cột tuyến (phân loại giao hàng・trung chuyển・kho picking・công ty giao hàng・công ty ủy thác・loại chuyến) ẩn theo mặc định, chuyển bằng "Hiện／ẩn cột tuyến" |
| Kỳ・thứ tự／chuyển màn hình | Chọn **theo ngày xuất hàng／theo ngày giao hàng** bằng radio (mặc định = theo ngày xuất hàng・2 tuần từ tuần này). Sắp xếp theo ngày của tiêu chuẩn đã chọn, tiêu đề cột đó có `aria-sort`. Mỗi trang 10／20／50／100. Chuyển từ Số giao hàng sang màn hình 06, breadcrumb là "Quản lý giao hàng ／ Quản lý xuất hàng・giao hàng ／ Chi tiết dữ liệu xuất hàng・giao hàng" |

**Điều kiện tìm kiếm dùng chung với lịch (tháng・tuần・ngày)** [Chu kỳ §5.3]. Hàng trên là 2 từ khóa, hàng dưới là điều kiện chi tiết có thể thu gọn.

| # | Hạng mục | Giá trị |
|---|---|---|
| 1~2 | Số giao hàng・ID kế hoạch／doanh nghiệp・cơ sở・ID hợp đồng・ID hợp đồng con・tên／địa chỉ nơi giao・mã bưu điện・số điện thoại | Khớp một phần. Cả số nhánh của bản sao (`DL-…-1`) cũng là đối tượng |
| 3~8 | Course／Máy bán hàng tự động／Mẫu giao hàng (chu kỳ／special／**giao theo lần = chỉ vật tư**)／**Loại chuyến** (chuyến ES giao hàng／chuyến COOL giao hàng／chuyến vật tư)／Số lần giao hàng | [Quyết định #24] [Quyết định v2.1 #7] |
| 4 | **Trạng thái** (`delivery status`) | Chờ xuất hàng／Đã xuất hàng／Đã nhận／Đã giao／Giao một phần／Chờ giao lại／Đang xác nhận／Hủy bỏ／Hủy. Là điều kiện khác với `plan lifecycle` [Quyết định v2.1 S5] |
| 9~14 | Kho picking／Công ty giao hàng ủy thác／Điểm trung chuyển／Số phiếu vận chuyển／Tình trạng phân công (đã phân công・chưa phân công)／ID・tên nhân viên giao hàng | Phiếu vận chuyển khớp một phần. **Một dữ liệu giao hàng có nhiều phiếu vận chuyển**, khớp một cái bất kỳ là hit (**một phiếu vận chuyển không bao giờ trải dài nhiều dữ liệu giao hàng**) [Quyết định #54]. Phân công theo **đơn vị leg**, chưa phân công không tìm được bằng tên nên là điều kiện độc lập, khi tình trạng phân công = chưa phân công thì vô hiệu hóa tên nhân viên |
| Chung | **Trạng thái・tình trạng phân công chỉ dữ liệu giao hàng mới có**, nên khi chọn các mục này thì không hiển thị kế hoạch trong kết quả và ghi rõ điều đó. Nếu tìm theo Số giao hàng ra 0 kết quả thì hiển thị lối để bỏ điều kiện kỳ rồi tìm lại | [Chu kỳ §5.3] |

### 15-6. Chi tiết dữ liệu giao hàng (màn hình 06) — Cấu trúc tab và tab tuyến giao hàng (phương án A)

Gom thông tin 1 lần giao・thực tế giao hàng・yêu cầu thay đổi・thu tiền・đính kèm vào một màn hình [Chu kỳ §5.3B] [Ghi chú phương án tuyến §2].

| Tab | Nội dung・điểm thay đổi |
|---|---|
| Tổng quan giao hàng | Số giao hàng・tên hàng hóa・ngày giao hàng・ngày xuất hàng・phân loại giao hàng・**loại chuyến**・**trạng thái (`delivery status`)**・chỉ thị xuất hàng・ID hợp đồng・**ID hợp đồng con**・ID order・khung giờ giao・ghi chú・**ghi chú vận hành** (`internal_memo`. Thêm ngày 2026/09/30・15-7) [Bảng yêu cầu dòng 164・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930]. Gom ngày・trạng thái・các ID vào đây |
| **Tuyến giao hàng** | Gộp "nơi xuất phát・kho trung chuyển" và "nơi giao hàng" cũ, tổ chức theo **phương án A** (bên dưới) |
| Thực tế／Tài liệu đính kèm／Lịch sử thay đổi | Thêm 1 ô kết quả theo từng phiếu vận chuyển. Bảng chênh lệch kiểm hàng có **cột "Nguồn thay thế"** (`substituted_from_product_id` [Quyết định v2.3 #39])／**sửa thành cấu trúc 2 tầng** (15-7)／không giữ lịch sử thay đổi của toàn màn hình mà **xem theo từng đối tượng ở tab này**. **Không có dòng "chia sẻ・hủy" của phiếu vận chuyển** (vì không có gộp xuất hàng) [Quyết định #54] |

**Tab tuyến giao hàng = phương án A (xếp từng địa điểm thành từng dòng trong bảng theo thứ tự tuyến)** [Ghi chú phương án tuyến §1・§3]. Sơ đồ tuyến không được chọn vì màn hình hiện hành không có linh kiện, và **chỉ tổ chức bằng linh kiện hiện có**. **Cùng một thông tin chỉ hiển thị ở một chỗ** (ngày・trạng thái・ID hợp đồng・ID order đã gom về tab tổng quan giao hàng). Thứ tự là ① section "Tuyến giao hàng" > lưới hạng mục (phân loại giao hàng／loại chuyến／lead time／số lần giao hàng／mẫu giao hàng／chu kỳ giao hàng／URL xác nhận liên hệ. Bên dưới "**Kế thừa từ thiết lập tuyến giao hàng của hợp đồng con <ID hợp đồng-yyyymm>**") → ② sub-section "Địa điểm và công ty giao hàng (theo thứ tự tuyến)" > bảng bên dưới → ③ ghi chú → ④ section "Số phiếu vận chuyển".

| Cột | Dòng kho picking | Dòng qua trung gian 1 (điểm trung chuyển) | Dòng nơi giao hàng (cơ sở) |
|---|---|---|---|
| No／Tên・ID | 1／Tên kho・ID kho | 2／Tên điểm trung chuyển・ID điểm trung chuyển・mã văn phòng | 3 (nếu không qua trung gian thì 2)／Tên cơ sở・ID cơ sở・tên doanh nghiệp |
| Địa chỉ／Điện thoại・người phụ trách | Master kho／Người phụ trách (tùy chọn) | Master kho (điểm trung chuyển)／Người phụ trách chính・điện thoại | **Snapshot tại ngày giao hàng**／Tên bộ phận・người phụ trách chính・điện thoại |
| **Khung giờ nhận・điều kiện giao hàng** | — | — | **Khung giờ nhận xếp nguyên nhiều dòng** (hiển thị tất cả theo thứ tự `sort_order`). Không hiển thị chỉ một bộ [Quyết định v2.1 #8] [Yêu cầu REQ-DL-877・878] |
| Công ty giao hàng chuyển tới địa điểm kế tiếp | Công ty giao hàng ① (ID)・phiếu vận chuyển N phiếu. **Nếu chặng 1 là ủy thác・công ty mình thì nhân viên giao hàng của chặng này**・điện thoại và nút phân công (nếu là công ty vận tải thì "Công ty vận tải") [Quyết định v2.3 #48] | Công ty giao hàng ② (ID)・**nhân viên giao hàng của chặng này**・điện thoại (nếu là công ty vận tải thì "Công ty vận tải") | — (đã đến) |
| **Nhận** (giờ・người nhận) | Nhận của chặng 1 (`delivery_legs.picked_up_at`・`picked_up_by`) | Nhận của chặng 2 (tại điểm trung chuyển. Khi chặng 1 là ủy thác và có trung chuyển) | — |
| Tuyến mang vào | — | `Tài liệu 2 tệp ›` | `Tài liệu 2 tệp ›` (chỉ số lượng và lối vào・15-7) |

- **Khi không dùng qua trung gian thì không hiển thị dòng điểm trung chuyển.** Hiển thị trung chuyển **chỉ 2 giá trị có／không**, **suy ra từ route legs, không lưu như trạng thái** [Quyết định v2.1 #7] [Yêu cầu REQ-DL-876]. **Phân công tài xế theo đơn vị chặng (leg)**, **chặng của công ty vận tải (`parcel_carrier`) thì không phân công, chặng của công ty mình・ủy thác thì phân công** (nếu chặng 1 là ủy thác thì dòng chặng 1 cũng hiển thị phân công) [Quyết định v2.3 #48] (Cũ: vận hành tạm thời chỉ phân công chặng thứ 2 <điểm trung chuyển→nơi giao hàng>, chặng 1 do công ty vận tải chở [Quyết định #60]. Thay thế ngày 2026/09/29). **Thêm dòng "Nhận" vào bảng địa điểm, hiển thị giờ nhận・người nhận theo từng chặng** [Quyết định v2.3 #49]. **Không tạo thay đổi hàng loạt** (từng đơn một) [Quyết định #65]. **Số phiếu vận chuyển là 1-nhiều.** Một dữ liệu giao hàng có nhiều số phiếu vận chuyển (theo từng thùng), **không có một phiếu vận chuyển nào chứa nhiều dữ liệu giao hàng** (không có gộp xuất hàng). Không có cột tình trạng hàng hóa (trạng thái phía công ty giao hàng), kiểm tra bằng liên kết trang theo dõi. **Chuyến do công ty ủy thác đến kho nhận hàng thì ES đánh số** (Số giao hàng + số thùng 2 chữ số). Thêm **cột "Nơi phát hành"** vào bảng số phiếu vận chuyển và hiển thị "ES đánh số". **Không hiển thị liên kết trang theo dõi cho số do ES đánh số** [Quyết định #54・#55] [Quyết định v2.3 #47]. **Chỉ đổi một lần**: không sửa hợp đồng, mà **sửa trực tiếp `delivery_legs` của dữ liệu giao hàng đó** (không giữ `route_override` [Quyết định v2.3 #2]). Khi đang sửa hiển thị một câu "Thay đổi này chỉ phản ánh cho dữ liệu giao hàng này. Nếu muốn đổi từ tháng này thì hãy đổi ở hợp đồng →". **Cả thay đổi tuyến giao hàng và chỉ định riêng ngày, trước hạn chót order thì lý do là tùy chọn**, và **luôn lưu trong lịch sử "trước thay đổi → sau thay đổi" và người thao tác** [Quyết định #26]. **Sau hạn chót order, cả ngày và tuyến giao hàng đều không được dịch chuyển bằng "đổi một lần"** (ngày thì hủy＋nhân bản. Công ty giao hàng ②・nhân viên giao hàng・địa chỉ được xử lý như thay đổi sau chỉ thị xuất hàng ở 15-14) [Quyết định v2.2 #1・#3] (Cũ: chỉ ngoại lệ sau hạn chót・trước `locked` thì bắt buộc có lý do. Đổi ở lần 3 ngày 2026/09/22). **Màn hình này là cửa duy nhất chỉ định riêng ngày picking và ngày giao hàng** [Chu kỳ §4A-4D・§5.0].

### 15-7. Cấu trúc 2 tầng của tài liệu đính kèm

Tên bị trùng nhau giữa cột "Tuyến mang vào・tài liệu đính kèm" trong bảng tuyến giao hàng và tab "Tài liệu đính kèm". Vì thực thể khác nhau nên **thống nhất nơi đặt tệp vào tab "Tài liệu đính kèm"** [Chu kỳ §4A-4C・§7].

| | ① Tài liệu của địa điểm (`site_attachments`) | ② Tài liệu của lần giao hàng này (`delivery_attachments`) |
|---|---|---|
| Nội dung | Sơ đồ tuyến mang vào・hướng dẫn cơ sở・quy trình giữ tại văn phòng・hướng dẫn bãi đỗ xe | Ảnh báo cáo trước sau trưng bày・báo cáo đỗ xe・báo cáo thu tiền・báo cáo giao hàng |
| Gắn với | **Master cơ sở／master điểm trung chuyển (kho).** Không sao chép vào dữ liệu giao hàng mà **kế thừa bằng tham chiếu để hiển thị** | **Một dữ liệu giao hàng.** Số nhánh (giao từng phần・giao lại) là hàng hóa khác nên giữ riêng |
| Ai sửa／khi đã giao | **Thay thế ở phía master. Không thay thế riêng cho lần giao này**／Không liên quan đến việc chốt giao hàng | Vận hành・tài xế thêm theo từng lần giao (**vận hành cũng có thể thêm ảnh từ chi tiết dữ liệu giao hàng**. Ghi rõ ngày 2026/09/30 [Bảng yêu cầu dòng 164・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930])／**đã giao vẫn có thể thêm・thay thế** (lưu vào lịch sử thay đổi) |
| Phạm vi công khai | Huy hiệu **dành cho bên ủy thác／dành cho khách hàng** theo `audience` | Như bên trái |
| Cách hiển thị ở tab tuyến giao hàng | **Cột chỉ còn "Tuyến mang vào"**, không đặt thực thể tài liệu. Chỉ hiển thị **số lượng và lối vào tab "Tài liệu đính kèm"** (`Tài liệu 2 tệp ›`／nếu không có thì `—`). Vì địa điểm có nhiều tệp nên khó đọc trong ô của bảng hẹp, và người chịu trách nhiệm thay thế cũng khác nhau giữa phía master và phía giao hàng | — |

**Ảnh báo cáo nghiệp vụ và ghi chú vận hành** (thêm ngày 2026/09/30) [Bảng yêu cầu dòng 164・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930]

- **Xem ảnh bằng modal.** Bấm ảnh ở tab tài liệu đính kèm (trước sau trưng bày・đỗ xe・thu tiền・báo cáo giao hàng) sẽ mở bằng modal, **chuyển trái phải** để xem lần lượt ảnh của cùng một lần giao.
- **Vận hành cũng có thể thêm ảnh** (② tài liệu của lần giao này. Lưu vào lịch sử thay đổi).
- Nút trước sau của chế độ tháng là "Tháng trước" "Tháng sau", chế độ tuần là "Tuần trước" "Tuần sau". "Hôm nay" chuyển đến tháng／tuần chứa ngày hôm nay. Đích thay đổi hàng loạt theo ngày tăng dần, ứng viên cùng ngày ưu tiên kho hiện tại [Nguồn gốc: Thiết lập chu kỳ giao hàng §5.2・§5.4]. (Phương án hiển thị đổi ô theo dòng hợp đồng・số lượng <Thiết lập chu kỳ giao hàng §5.2・Phụ lục A-2> không áp dụng [Sổ cái B "Chế độ tháng của lịch vận hành"])
- Mỗi dữ liệu giao hàng có **ghi chú vận hành (`deliveries.internal_memo`)**. Là ghi chú nội bộ do vận hành viết, hiển thị ở tab tổng quan giao hàng (15-6). Không hiển thị trên Web doanh nghiệp.

### 15-8. Vòng đời chu kỳ và chính sách đổi ngày

Chu kỳ tiến triển theo thứ tự `Thiết lập lịch (đang đăng ký menu) → Công khai menu・bắt đầu order → Hạn chót order`. Công khai menu và bắt đầu order là **cùng một ngày** nên không giữ giai đoạn "từ công khai menu đến trước bắt đầu order" của bản cũ [Chu kỳ §5.0] [Yêu cầu REQ-DL-757]. Ngày các mốc **do phía menu là chuẩn**, được sao chép và giữ ngày thực khi tạo chu kỳ (**không dùng ngày hằng số trong triển khai**) [Quyết định #33].

> **Sửa đổi 2026-10-02**: Ranh giới đổi ngày không phải "hạn chót order" mà là **"thời điểm đặt hàng chính thức"**, và trở thành hình thức chọn bằng check rồi di chuyển từ màn hình lịch. Chuẩn là "quy định hiện tại" ở `Giao_hàng_04_Lịch_dự_kiến_dữ_liệu_giao_hàng_và_thay_đổi.md` §8-3 (Sổ cái L). Bảng dưới là quy định cũ.

**Chính sách đổi ngày (giai đoạn × cửa vào)** [Quyết định v2.1 #1・#3] [Chu kỳ §5.0] [Yêu cầu REQ-DL-865・866]

| Giai đoạn | Chế độ đổi ngày của màn hình lịch (04・05) | Thay đổi 1 đơn từ chi tiết dữ liệu giao hàng (06) | Nhập lý do | Đối tượng |
|---|---|---|---|---|
| Thiết lập lịch | **Cố định ON・không thể OFF** | Được | Tùy chọn | Không giới hạn |
| Bắt đầu order~trước hạn chót | Ban đầu OFF・có thể ON/OFF. **Vận hành có thể đổi từng đơn hay hàng loạt** | Được | Tùy chọn | **Đích di chuyển là từ hôm nay trở đi. Ngày picking và ngày giao hàng cùng dịch chuyển theo lead time. Không giới hạn số lượng. Di chuyển sang chu kỳ khác là cảnh báo (lưu được・giao hàng vẫn thuộc chu kỳ <hợp đồng con> gốc), vắt qua nửa đầu・nửa sau・tháng khác・ngày quá khứ là lỗi** (đổi ngày 2026/10/01・P10-2 [Tổng hợp định nghĩa yêu cầu RD-DL-040 2026/09/30]. Cũ: không giới hạn) |
| **Sau hạn chót order** | **Cố định OFF・không thể ON** (không thao tác hàng loạt・kéo thả) | **Đến ngày trước ngày xuất hàng・từng đơn một・cùng nửa đầu／nửa sau** ("Sửa" ở chi tiết dữ liệu giao hàng) [Quyết định v2.3 #63] (Cũ: không được. Hủy＋nhân bản) | **Bắt buộc** | Cùng nửa đầu／nửa sau |

- **Sau hạn chót không thể dịch ngày từ màn hình lịch** (chế độ đổi ngày cố định OFF). **Đến ngày trước ngày xuất hàng có thể đổi từng đơn bằng "Sửa" ở chi tiết dữ liệu giao hàng** (cùng nửa đầu／nửa sau của cùng chu kỳ・bắt buộc lý do). Phần ngày lễ・ngày không xuất hàng được tăng thêm sau cũng sửa bằng cách này [Quyết định v2.3 #63] (Đổi ngày 2026/09/29. Cũ: sau hạn chót không thể dịch ngày từ màn hình・hủy＋nhân bản <Quyết định v2.2 #1>). **(Cũ: chỉ trước `locked`, "chỉ thay đổi 1 đơn từ chi tiết dữ liệu giao hàng được giữ lại cho vận hành". Hủy bằng quyết định lần 3 ngày 2026/09/22)** Câu chữ màn hình: `Đã qua hạn chót order (…). Không thể dịch từ màn hình lịch. Đến ngày trước ngày xuất hàng có thể đổi từng đơn bằng "Sửa" ở chi tiết dữ liệu giao hàng (cùng nửa đầu／nửa sau của cùng chu kỳ・bắt buộc lý do).` Giai đoạn được phán định **theo từng tháng đối tượng**. Ở trạng thái cố định thì không cho thao tác công tắc, bấm thì trả lý do bằng toast. Bên cạnh công tắc hiển thị trạng thái hiện tại (`Cố định ON`／`Có thể chuyển`／`Có thể chuyển (chỉ vận hành)`／`Cố định OFF`) và tên giai đoạn, luôn hiển thị timeline. **Thao tác khi ON**: khi dịch ngày giao hàng thì ngày picking = ngày giao hàng mới − lead time, nếu là ngày không xuất hàng được thì dời sớm đến ngày xuất hàng được trước đó. Khi dịch ngày picking thì ngày giao hàng = ngày picking mới + lead time, không chọn được ứng viên rơi vào ngày trong tuần không giao được・coi như ngày lễ giao hàng・tạm dừng chu kỳ・chu kỳ khác (ngày giao hàng không tự dịch). Lead time dùng giá trị đang có hiệu lực với dữ liệu giao hàng đó (nếu có chỉ định riêng thì dùng giá trị đó), nhiều đơn thì tính từng đơn. Dòng chi tiết đã đổi gắn huy hiệu "Đã đổi", hiển thị ngày gốc bằng tooltip, và có thao tác khôi phục. Thay đổi lưu vào lịch sử thay đổi (khi nào・ai・chỗ nào・cái gì・số lượng ảnh hưởng). Câu chữ màn hình: Thiết lập lịch = `Chưa có dữ liệu giao hàng (dự kiến công khai menu YYYY-MM-DD). Vì là giai đoạn kế hoạch nên có thể di chuyển ngày tự do. Không thể OFF.`／Bắt đầu order~trước hạn chót = `Đang nhận order (YYYY-MM-DD~YYYY-MM-DD). Để tránh thao tác nhầm, ban đầu là OFF. Chỉ bật ON khi thay đổi.` [Nguồn gốc: Thiết lập chu kỳ giao hàng §5.0] [Yêu cầu REQ-DL-730~732・749]. Khi ON thì **phán định không chỉ bên di chuyển mà cả ngày còn lại cùng di chuyển**, ứng viên vi phạm bị vô hiệu hóa + hiển thị lý do (`Ngày giao hàng 10/25 (Chủ nhật): Ngày trong tuần không giao được: Chủ nhật`). **Ngày picking và ngày giao hàng giữ nguyên lead time và cùng di chuyển** [Chu kỳ §5.0].

**Điểm khởi đầu của `locked` chỉ có một** [Quyết định v2.1 #3] [Yêu cầu REQ-DL-867・868]

| Sự kiện | Có thành `locked` không | Xử lý |
|---|---|---|
| Đã tạo **xuất gộp 2 tuần** của chỉ thị xuất hàng (3 ngày trước ngày bắt đầu kỳ đối tượng・thứ Sáu) | **Không** | Còn lại như quy định "gửi khi nào". Chỉ xuất ra thì không thành `locked` |
| **Chỉ thị xuất hàng gửi thành công lần đầu** (`ship_orders.send_status = ok`) | **Có** | `deliveries.locked_at ← sent_ok_at`, `locked_source = ship_order_sent` |
| Gửi lại chỉ thị xuất hàng (tăng `rev`・hủy là số lượng 0) | Không | **Không dịch điểm khởi đầu** |
| Đã gắn số phiếu vận chuyển | **Không** | Không dùng làm kích hoạt của `locked` |
| **Số phiếu vận chuyển xuất hiện trước chỉ thị xuất hàng** | **Không** | **Phát hiện là anomaly (bất thường) và đưa vào cần xác nhận** (15-9・17-1 `tracking_anomaly_detect`) |

### 15-9. Cảnh báo "Cần xác nhận"

Nơi tập trung để không để sót mục chưa xử lý. Thường trú trong lịch vận hành, không biến mất cho đến khi giải quyết [Chu kỳ §1.5・§11-1].

**Thực thể là bảng `review_items`** [Quyết định v2.3 #6]. Trước đây chỉ coi "cần xác nhận" là một cái tên và mỗi lần tính bằng biểu thức điều kiện nên **không có nơi để "đóng" các mục vận hành đã xử lý xong**. Giữ `status(open｜resolved｜ignored)` và `resolved_by` / `resolved_at` / `resolution_note`, đặt **`UNIQUE(kind, target_type, target_id) WHERE status = 'open'`**. Batch **chỉ thực hiện UPSERT**, khi phát hiện lại cùng một vấn đề thì chỉ cập nhật `last_detected_at` (cùng một mục không chồng chất). Vì **huy hiệu số lượng và danh sách cùng đếm bảng này** nên hai bên không lệch nhau (15-1).

| Phân loại | Cái được đưa vào | Nguồn |
|---|---|---|
| Ngày・lead time | Chênh lệch lead time (hơn ＋1 ngày)／di chuyển quá 3 ngày so với khung gốc／**không tạo được kế hoạch** (không có ứng viên trong 20 ngày・không chuyển được ngày không xuất hàng được) | [Quyết định #19] [Chu kỳ §4.5・§10-2] |
| Override | Hết hiệu lực・đang đề xuất・không thể re-anchor／override đang áp dụng không còn thành lập | [Chu kỳ §4A-4E] |
| Tạo・liên kết | Thất bại khi tạo xác nhận (`batch_errors`)／**cần gửi lại** chỉ thị xuất hàng: N đơn／sót thanh toán (thiếu hợp đồng con) | [Chu kỳ §11-1] |
| Thực tế giao hàng | **missing queue** = dữ liệu giao hàng mà final leg là `self` / `partner_driver` và đến sáng hôm sau vẫn không phải đã giao・hủy bỏ・hủy (trừ cái có báo cáo sự cố chưa giải quyết)／bản sao giao từng phần・giao lại (đang xác nhận)／thiếu tồn kho | [Quyết định v2.1 #4] [Yêu cầu REQ-DL-869] [Quyết định v2.3 #25] |
| **Sự cố** | **Báo cáo sự cố chưa giải quyết** = `kind = trouble_open` (đối tượng là giao hàng. Mở cùng lúc đăng ký báo cáo・không đổi trạng thái dữ liệu giao hàng)／**con tự động của sự cố** = `kind = trouble_auto_child_pending` (đối tượng là con). Khi vận hành (logistics) giải quyết gộp sự cố của giao hàng thì cả hai cùng đóng trong cùng một transaction | [Quyết định v2.3 #20・#24・#29・#30] |
| **Hạn sử dụng** | **Chú ý hạn sử dụng ngắn** = `kind = shelf_life_warning` (đối tượng là giao hàng hoặc kế hoạch). Gồm sản phẩm có số ngày từ ngày xuất hàng đến ngày giao hàng ＞ số ngày hạn sử dụng − số ngày an toàn (`shelf_life_safety_days`・mặc định 2 ngày). Phán định khi tạo・tính lại kế hoạch・đổi kho・nhân bản. **Vận hành quyết định việc tách** (không tự động tách) | [Quyết định v2.3 #35] |
| **Yêu cầu thay đổi** | **Đến hạn yêu cầu thay đổi** = `kind = change_request_due` (đối tượng là giao hàng hoặc kế hoạch). Hạn xử lý = hạn chót order. Gồm cái vẫn đang yêu cầu・đang đề xuất khi còn 3 ngày đến hạn chót (`change_request_warn_days`・mặc định 3 ngày). Dù qua hạn chót vẫn **để lại cho đến khi vận hành xử lý** (không tự động từ chối) | [Quyết định v2.3 #37] |
| **Chưa đặt tài xế** | `kind = assignment_missing`. **Đến 3 ngày trước ngày giao hàng** mà **chặng cần phân công (chặng của công ty mình・ủy thác)** vẫn chưa có người phụ trách. **3 ngày trước và ngày hôm trước cũng hiển thị trên Web công ty giao hàng ủy thác, và nếu là chặng ủy thác thì gửi email cho công ty giao hàng ủy thác phụ trách**. Không dừng xuất hàng (đổi ngày 2026/09/30. Cũ: ngày hôm trước ngày giao hàng・chỉ cần xác nhận [Quyết định v2.3 #43]) (Cũ: lẫn giữa thời điểm gửi chỉ thị xuất hàng・1 tuần trước ngày giao hàng. Thống nhất thành ngày hôm trước ngày 2026/09/29) | [Quyết định v2.3 #43・#48] [Bảng yêu cầu dòng 142・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930] |
| **Anomaly của phiếu vận chuyển** | **Dữ liệu giao hàng gắn số phiếu vận chuyển dù không có bản ghi gửi chỉ thị xuất hàng thành công** ("Số phiếu vận chuyển đã được gắn trước chỉ thị xuất hàng: N đơn") | [Quyết định v2.1 #3] [Yêu cầu REQ-DL-868] |
| Xử lý sau hạn chót | Bản ghi được đưa vào cần xác nhận sau hạn chót, **nếu đến ngày trước ngày xuất hàng thì sửa từng đơn bằng "Sửa" ở chi tiết dữ liệu giao hàng** (bắt buộc lý do・cùng nửa đầu／nửa sau). Từ ngày xuất hàng trở đi thì **hủy＋nhân bản** (15-8) (đổi ngày 2026/09/29 [Quyết định v2.3 #63]. Cũ: không đổi ngày) **(Cũ: chỉ bản ghi có trong bảng này mới được vận hành đổi từng đơn. Hủy bằng quyết định lần 3 ngày 2026/09/22)** | [Quyết định v2.2 #1] |

Cửa vào ghi đè ngày được thống nhất ở đổi ngày trong màn hình chi tiết, **đổi hàng loạt là phiên bản nhiều đơn của nó** (xử lý bên trong qua cùng một hàm, luôn qua cùng kiểm tra) [Chu kỳ §12-3]. Đổi hàng loạt chỉ chọn được **ngày từ hôm nay trở đi**, ngày không chọn được không hiển thị ban đầu (chỉ khi bật "Hiển thị cả ngày không chọn được" mới hiển thị kèm lý do không được). **Hàng hóa chưa đặt tài xế được hiển thị trong cần xác nhận của vận hành và Web công ty giao hàng ủy thác vào 3 ngày trước và ngày hôm trước ngày giao hàng, và gửi email cho công ty giao hàng ủy thác** (bảng trên) (đổi ngày 2026/09/30. Cũ: hàng hóa chưa phát hành phiếu vận chuyển thì thông báo bằng email cho vận hành và bên giao hàng ủy thác vào **3 ngày trước・1 ngày trước** ngày dự kiến giao hàng) [Chu kỳ §5.4] [Bảng yêu cầu dòng 142・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930].

### 15-10. Cách hiển thị phía Web doanh nghiệp (màn hình 07)

View công khai cùng dữ liệu với màn hình 05 cho phía doanh nghiệp [Chu kỳ §1.2・§4A-7].

| Giai đoạn | Hiển thị | Không hiển thị |
|---|---|---|
| Kế hoạch (`draft`) | **Chỉ ngày** + **dấu "Kế hoạch"** (giải thích ý nghĩa ở chú giải) [Quyết định #77] | **Không hiển thị số lượng.** Tuy nhiên **về mặt dữ liệu vẫn giữ `estimated_qty`** (chỉ không cho xem) [Quyết định v2.1 S1] [Yêu cầu REQ-DL-882] |
| Từ xác nhận (`published`) trở đi | Số lượng・thực tế giao hàng・phiếu vận chuyển・thu tiền | — |
| Khi vận hành đổi ngày giao hàng・ngày gửi hàng (thêm ngày 2026/09/30) | **Hiển thị ngày giao hàng mới nhất ở thông báo trang chủ Web doanh nghiệp** (kể cả thay đổi sau hạn chót [Quyết định v2.3 #63]) [Bảng yêu cầu dòng 134・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930] | **Thay đổi sau hạn chót cũng gửi email** (bằng ngày mới nhất. Trước hạn chót thì có trong email xác nhận) (đổi ngày 2026/10/01・P11. Cũ: không gửi email) |
| Toàn màn hình | Lọc theo kho. Đông lạnh・lạnh **gộp thành 1 đơn theo đơn vị giao hàng (nhận hàng)**, chi tiết hiển thị phân tách theo phân loại [Chu kỳ §10-1 #6] | Thiết lập tuyến giao hàng・lịch sử thay đổi・phần phí của hợp đồng con・màn hình master [Yêu cầu REQ-DL-862] |
| Tính lại・phạm vi yêu cầu | **Không thông báo** việc kế hoạch thay đổi âm thầm. Thay vào đó hiển thị "Ngày cập nhật cuối" và **dấu thay đổi** ở kế hoạch đã dịch chuyển do tính lại gần nhất [Chu kỳ §10-1 #5]. Phạm vi có thể yêu cầu là **trong kỳ chu kỳ đã tạo (tối đa 6 tháng sau, trừ ngày quá khứ・tháng hiện tại)** | — |

**Tên hiển thị trên Web doanh nghiệp được giữ riêng với trạng thái** [Quyết định v2.3 #42] [Nguồn gốc: DEV §12.4]. Không đổi tên trạng thái của Web vận hành. Tên hiển thị **suy ra từ trạng thái・tình hình, không lưu**. Chỉ đổi câu chữ huy hiệu của lịch trên Web doanh nghiệp (theme company-admin).

| Trạng thái・tình hình phía vận hành | Hiển thị trên Web doanh nghiệp |
|---|---|
| Hủy (có chuyến thay thế) | **Đang điều chỉnh ngày giao hàng** |
| Có báo cáo sự cố chưa giải quyết (trạng thái là đã xuất hàng, v.v.) | Giữ nguyên trạng thái + ghi chú "**Đang xác nhận tình trạng giao hàng**" |
| Con (đang xác nhận) | **Đang chuẩn bị giao lại** |
| Giao một phần | **Đã giao một phần** |
| Chờ giao lại | **Dự kiến giao lại** |
| Hủy (không có chuyến thay thế)・hủy bỏ | **Đã hủy giao hàng** |

- **Tên trạng thái "Đang xác nhận" không hiển thị trên Web doanh nghiệp.** Vì trùng với tên trạng thái chỉ con mới có (Cũ: ở 13-2 ① "hiển thị cho doanh nghiệp là 'Đang xác nhận'". Thay bằng "Đang điều chỉnh ngày giao hàng" ngày 2026/09/29 [Quyết định v2.3 #42]).
- Cách hiển thị của **Web công ty giao hàng ủy thác** xem 11-6・12-6 (kế hoạch đến chu kỳ tháng sau・chỉ đến số lượng, sau khi xác nhận hiển thị toàn bộ hạng mục, chỉ giao hàng có chặng do công ty mình phụ trách) [Quyết định v2.3 #34・#51].

**Bổ sung 7 ngày 2026/09/29: Trang chủ và chi tiết giao hàng** [Quyết định v2.3 #54~#57]

| Màn hình | Nội dung |
|---|---|
| **Trang chủ (lịch giao hàng tháng hiện tại)** | Khi đăng nhập hiển thị tháng hiện tại (tháng dương lịch). Chuyển tháng đến tháng đã tạo kế hoạch. Ô có nhóm nhiệt độ・số lượng (sau xác nhận) hoặc "Dự kiến giao" (kế hoạch)・huy hiệu tình trạng・"Đang yêu cầu thay đổi". Kế hoạch có nét đứt + dấu "Kế hoạch". Thứ tự giống trang chủ Web công ty giao hàng ủy thác: **trái = giao hàng tháng này (lịch)**, **phải = thông báo (dành cho doanh nghiệp của phát thông báo・huy hiệu danh mục + tiêu đề) và "Giao hàng cần xác nhận"** (đã giao một phần・đang yêu cầu thay đổi・kế hoạch có thể yêu cầu) (Cũ: phía dưới có "Giao hàng sắp tới" "Yêu cầu đổi ngày giao hàng" "Cách xem tình trạng"). **Bỏ danh sách "Tình trạng giao hàng"** (Cũ: danh sách tìm theo kỳ) |
| **Phạm vi xem được** | **Quản trị viên doanh nghiệp = tất cả cơ sở của công ty (lọc theo cơ sở)／Người phụ trách cơ sở = chỉ cơ sở được phân công**. Lọc bằng API (không chỉ ẩn trên màn hình) |
| **Chi tiết giao hàng** | Ngày dự kiến đến・khung giờ nhận・nhóm nhiệt độ và loại chuyến・tình trạng (tên hiển thị của #42)・danh sách sản phẩm (kế hoạch hiển thị sau hạn chót)・tình hình giao hàng (ngày giờ hoàn thành・người nhận・thu tiền. Cũ: 5 bước・tồn kho và trưng bày theo từng sản phẩm・cũng hiển thị ảnh dành cho khách hàng. Hủy ở #60)・số phiếu vận chuyển và liên kết theo dõi (**không tạo ô tên công ty**)・giao hàng liên quan. **Không hiển thị ảnh・xác nhận tồn kho và hủy bỏ・5 bước** [Quyết định v2.3 #60]. **Không hiển thị: ngày picking・kho・công ty giao hàng・trung chuyển・nhân viên giao hàng・cước vận chuyển・lịch sử thay đổi・tài liệu dành cho bên ủy thác** |
| **Yêu cầu thay đổi** | Từ "Yêu cầu đổi ngày giao hàng" trong chi tiết. Kế hoạch từ tháng sau trở đi・đến hạn chót order. **Tháng hiện tại・quá khứ・sau xác nhận thì không hiển thị nút và luôn hiển thị lý do**. Chọn nguyện vọng thứ nhất・thứ hai từ cùng nửa đầu／nửa sau của cùng chu kỳ, hoặc "không có ngày mong muốn". Bắt buộc lý do. Cho đến khi phê duyệt vẫn là ngày giao hàng hiện tại |
| **Giao hàng cần xác nhận** (#58) | Thứ tự: ① Đề xuất ngày khác (cần trả lời. Nhận／từ chối ở chi tiết) ② Giao hàng không đến・bị chậm ③ Kết quả yêu cầu (**14 ngày**) ④ Kế hoạch có thể yêu cầu (**từ 3 tuần trước hạn chót**) [Quyết định v2.3 #58] |
| **Danh sách yêu cầu thay đổi của doanh nghiệp** (#59) | Tab "Thay đổi ngày giao hàng" của menu trái "Yêu cầu". Tình trạng: đang yêu cầu／đề xuất ngày khác／phê duyệt／từ chối／rút lại (rút lại là 【phương án】) [Quyết định v2.3 #59] |
| **Khung yêu cầu và modal** (#62) | Vận hành: khung phía trên tổng quan giao hàng (hiện tại→nguyện vọng thứ nhất・thứ hai・lý do・người yêu cầu) + từ chối／đề xuất ngày thay thế／phê duyệt → modal xử lý "Xác nhận yêu cầu thay đổi" (thông tin cơ bản・tuyến／bảng ngày giao hàng mong muốn／chọn bảng ngày khác bằng radio. Thiếu lead time・vượt số lượng・không xuất hàng được là chữ đỏ. "Phê duyệt bằng ngày đã chọn" = nếu là ngày mong muốn thì đổi, nếu ngày khác thì đề xuất cho doanh nghiệp／"Từ chối" = bắt buộc lý do). Doanh nghiệp: khung phía trên chi tiết giao hàng (trả lời đề xuất), yêu cầu mới từ nút ở tiêu đề mở modal yêu cầu. Không hiển thị nút với người không có quyền [Quyết định v2.3 #62] |
| **Chi tiết thông báo** (#66) | Phát thông báo xử lý theo đặc tả chức năng chung (quản trị hệ thống). Ngoài phạm vi giao hàng [hong trả lời 2026-10-03] [Quyết định v2.3 #66] |
| **Chỉ màn hình** (#67) | Thêm cần xác nhận vào menu bên "Quản lý giao hàng" của vận hành／bỏ chuyển đổi "tiêu chuẩn (xuất hàng／giao hàng・giao hàng)" ở chế độ tháng／có thể thu gọn menu bên (dưới 1280px tự động đóng) [Quyết định v2.3 #67] |

### 15-11. Quy tắc chung của màn hình

| # | Quy tắc |
|---|---|
| 1~4 | Ngày là `yyyy-mm-dd`, tháng là `yyyy-mm` (**không phụ thuộc thiết lập vùng của trình duyệt**)／nội dung・nhãn thao tác **từ 12px trở lên**／**không truyền đạt trạng thái chỉ bằng màu hay nét đứt** (kế hoạch ở chế độ tháng thỏa bằng viền nét đứt + chữ "Kế hoạch N đơn" ở dòng số lượng)／**không tạo thao tác chỉ bằng nhấp đúp** |
| 5~17 | Modal hoàn tất bằng bàn phím (`role="dialog"`／`aria-modal`／`aria-labelledby`, Esc quay về nút ban đầu)／thông báo `aria-live`, lỗi không tự biến mất mà đóng bằng ×／**nút không thao tác được thì luôn hiển thị lý do gần nút**／thao tác chính của màn hình chỉ một, còn lại vào menu "Khác"／**lịch sử thay đổi hiển thị theo từng đối tượng**／**có thể mở giải thích thuật ngữ** từ màn hình (kế hoạch・dữ liệu giao hàng・tạo xác nhận・**chu kỳ giao hàng**・slot・ngày xuất hàng・đã điều chỉnh・trung chuyển・hoàn thành mặc định・cần xác nhận, v.v.)／độ tương phản từ 4.5:1 trở lên／mọi phần tử thao tác có `:focus-visible`／không tạo phần tử thao tác không có tên／landmark và cấp tiêu đề／đặt thứ tự sắp xếp của bảng vào tiêu đề (`aria-sort`) |

- Giải thích riêng cho demo được tách khỏi UI chính thức (nếu để lại thì gắn huy hiệu "Demo"). Hoãn: `role="tablist"` của tab (làm gộp khi triển khai di chuyển bằng phím mũi tên)／`aria-label` tóm tắt ô chế độ tháng (sau khi quyết câu chữ)／vùng nhấp 40×40px (cùng lúc với hỗ trợ 1024px)／màu của logotype (ngoài đối tượng WCAG) [Nguồn gốc: Thiết lập chu kỳ giao hàng §12-9].
- **Không vẽ Chủ nhật cố định là "không xuất hàng được" "không giao được".** Chủ nhật nghỉ vì **được thiết lập như vậy theo mặc định** chứ không phải cố định theo đặc tả. Ở mọi chế độ hiển thị không chốt theo thứ, mà phán định bằng **khung không xuất hàng được của kho đó** và **thứ không giao được của hợp đồng đó**. Thứ Bảy cũng vậy [Chu kỳ §5.3]. **Thống nhất thuật ngữ.** "**Chu kỳ giao hàng**" (không dùng "chu kỳ nhập giao")／"**Không xuất hàng được**"／"**Thứ không giao được**" "dời sớm・dời muộn" (không dùng "thứ không nhận được" "hướng chuyển") [Quyết định #20・#31]. **Không gọi gộp `plan lifecycle` và `delivery status` là "trạng thái"** [Quyết định v2.1 S5]. **Giá trị chuẩn của độ tương phản** (đo ngày 2026/09/18): chữ bổ sung `#616a78`／xuất hàng `#b64708`／giao hàng `#21702f`／bình thường `#17713d`／cảnh báo・lỗi `#b92a23`／liên kết・đang chọn `#1459b3`／nền huy hiệu (chữ trắng) `#a85d00` [Chu kỳ §12-9].

### 15-12. Bảng đối ứng 2 demo

> **2026-10-03: 2 bản này là demo cũ, đã chuyển vào `02_デモ/OLD/`.** Demo giao hàng hiện nay là `02_デモ/10_運営_まとめ.html` (vận hành)・`02_デモ/40_ドライバーブラウザ.html` (tài xế) và ứng dụng chính `07_開発`. Bảng dưới được giữ lại để làm lịch sử.

Đã quyết định **không hợp nhất** (2026/09/21). Vì vai trò của 2 tệp khác nhau [Quyết định §F].

| Tệp | Vai trò・cách làm |
|---|---|
| `02_デモ/OLD/picking_schedule_setting_demo_ja.html` | **Tài liệu giải thích đặc tả.** Xếp dọc toàn bộ quy trình, mỗi section ghi căn cứ quyết định／chỉ tiếng Nhật／có **engine tạo tính ngày từ A1 lần đầu và tạm dừng** |
| `02_デモ/OLD/delivery_schedule_plan_demo_ja.html` | **Hình ảnh màn hình thực của Web vận hành.** Shell có menu trái／song ngữ Nhật-Việt／dữ liệu mẫu cố định. **Cũng được công khai như artifact của claude.ai**. Bổ trợ là `delivery_route_detail_demo_ja.html` (màn hình 06 phương án A)／`delivery_calendar_demo_ja.html` (màn hình 07)／`ess_schedule_delivery_cycle_flowmap.html` |

**Quy tắc vận hành**: ① Bốn mục thiết lập chu kỳ giao hàng・lịch・yêu cầu thay đổi・tài xế có ở cả hai và **triển khai riêng**, nên khi sửa phần giao hàng thì **kiểm tra cả 2 tệp**. ② `delivery_schedule_plan_demo_ja.html` **trước khi làm việc phải đọc bản thật của artifact và lấy đó làm nền**. Sau khi sửa thì cập nhật **cả artifact và `02_デモ`**. ③ Sau khi thay đổi, tải bằng Chromium và xác nhận **0 lỗi console**.

> **Quyết định lần 2 ngày 2026/09/21 (`Quyết_định_v2.1_20260921.md`) chưa phản ánh vào 2 demo cũng như artifact.** Phạm vi phản ánh là **đến đặc tả tổng hợp + 2 nguồn gốc**, demo để lần sau [Quyết định §F]. Phần của quyết định lần 1 cũng chưa phản ánh (chương 18 No.13).

| Hiện trạng demo | Quyết định v2.1 | Nguồn |
|---|---|---|
| Giữ phiếu vận chuyển **nhiều-nhiều** (bảng liên kết・chuyển tiếp／gộp xuất hàng) | **Quay về 1-nhiều.** Không có gộp xuất hàng | [Quyết định #54] |
| Tooltip pill ngày không xuất hàng được là "**chỉ picking dừng**" | **Chuyển cả ngày picking và ngày giao hàng** | [Quyết định #15] |
| Điểm khởi đầu `locked` là "thời điểm xuất gộp 2 tuần"／hiển thị trạng thái bằng 1 trục | **Chỉ lần gửi chỉ thị xuất hàng thành công đầu tiên**／**tách thành 2 trục `plan lifecycle` và `delivery status`** | [Quyết định v2.1 #3・S5] |
| Hiển thị với giả định kế hoạch không có số lượng／còn vai trò `quản lý kho`／giới hạn nhập lead time là 30 ngày／còn cách ghi "chu kỳ nhập giao" "thứ không nhận được" "hướng chuyển" | **Giữ `estimated_qty` bên trong và chỉ không hiển thị ở draft**／**không tồn tại `quản lý kho`** (tab kho là lọc)／**0~7 ngày**／**"chu kỳ giao hàng" "thứ không giao được" "dời sớm・dời muộn"** | [Quyết định v2.1 S1・#2] [Quyết định #4・#20・#31] |

---

### 15-13. Thay đổi sau chỉ thị xuất hàng (Quyết định lần 3 ngày 2026/09/22)

**Ngay cả sau khi đã gửi chỉ thị xuất hàng, vẫn có thể đổi công ty giao hàng ②・nhân viên giao hàng・địa chỉ nơi giao hàng** [Quyết định v2.2 #3] [Yêu cầu REQ-DL-888~890]. Vì thay đổi gấp thực tế vẫn xảy ra nên không có chuyện "vì `locked` nên không động vào được gì". Tuy nhiên điều kiện là **không để lệch với hàng thật (phiếu vận chuyển)**.

| Cái thay đổi | Xử lý | Phiếu vận chuyển | Chỉ thị xuất hàng |
|---|---|---|---|
| **Công ty giao hàng ②・nhân viên giao hàng** (`carrier_id` / `driver_id` của leg) | **Có thể đổi nguyên trạng** | Không động vào | Tạo `ship_order_diff` và **gửi lại** (10-3) |
| **Địa chỉ nơi giao hàng** | **Có thể đổi** (chỉ lần giao này) | **Chuyển toàn bộ phiếu vận chuyển hiện có sang `voided`, và phát hành lại sau khi chỉ thị xuất hàng phiên bản mới được gửi thành công** | **Xuất chỉ thị xuất hàng `rev` mới** (19-2) |
| **Kho picking** (`warehouse_id`) | **Không đổi** | — | Làm lại bằng **hủy＋nhân bản** |
| **Ngày giao hàng・ngày picking** | **Không đổi** (sau hạn chót order theo 8-3) | — | **Hủy＋nhân bản** |

- Chỉ đối xử đặc biệt với địa chỉ vì **đã in trên phiếu vận chuyển**. Nếu chỉ sửa dữ liệu thì nhãn thật rời kho sẽ lệch với nơi giao hàng.
- **Không dịch `locked_at`.** Dù gửi `rev` mới do đổi địa chỉ thì điểm khởi đầu của `locked` (lần gửi thành công đầu tiên) vẫn giữ như ban đầu [Quyết định v2.1 #3].
- Người thao tác được chỉ có **vận hành (logistics)**. **Bắt buộc lý do**, lưu vào lịch sử thay đổi "trước thay đổi → sau thay đổi" và người thao tác. **Dữ liệu giao hàng đã giao・hủy bỏ・hủy nằm ngoài đối tượng**.
- Phiếu vận chuyển đã vô hiệu hóa không xóa mà giữ với `status = voided`, và giữ lý do ở `voided_reason` (16-5). Liên kết trang theo dõi hiển thị ở dạng biết được là số vô hiệu.
- **(Cũ: §18 No.20 "Sau chỉ thị xuất hàng có được đổi công ty giao hàng ②・nhân viên giao hàng・địa chỉ nơi giao hàng chỉ cho lần giao này không" là chưa quyết. Giải quyết bằng quyết định lần 3 ngày 2026/09/22)**
