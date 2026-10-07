# Đặc tả giao hàng: Thực hiện giao hàng・Tài xế và phân công (§11, §12)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (chia theo chương ngày 2026-10-03. Nội dung giữ nguyên như thời điểm chia) -->

## 11. Thực hiện giao hàng

### 11-1. 3 trục của chuyến (`delivery_regime` / `service_form` / relay)

Không dùng cách chia 2 loại "chuyến tự vận hành / chuyến ủy thác". Lý do: **tài xế của công ty giao hàng ủy thác cũng dùng ứng dụng tài xế của ES nên vẫn theo dõi được tiến độ**, nhưng cách chia này lại dễ bị hiểu là "ủy thác = không theo dõi được" 〔Chu kỳ §4C〕. Chuyến được quản lý theo **3 trục**, mỗi trục có nơi nắm giữ riêng 〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-874・875・876〕.

| Trục | Tên vật lý | Giá trị | Nơi nắm giữ | Quyết định điều gì |
|---|---|---|---|---|
| **Thể chế giao hàng** | **`delivery_regime`** | **`self` (tự vận hành) / `partner_driver` (tài xế ủy thác) / `parcel_carrier` (công ty vận chuyển)** | Giá trị mặc định của loại giao hàng + **giá trị thực tế theo từng chặng (leg)** (`delivery_legs.delivery_regime` được ưu tiên) | Ai vận chuyển. **Giá trị của final leg ảnh hưởng đến phán định hoàn tất ngầm định và phát hiện thiếu giao** (11-2・11-5) |
| **Loại chuyến** | `service_form` | Chuyến giao ES / Chuyến giao COOL / Chuyến vật tư | **Loại giao hàng (delivery channel). Không đặt ở tuyến của hợp đồng (`contract_routes`)** | Nội dung công việc trên ứng dụng tài xế (có trưng bày đến tận kệ hay không) |
| **Lộ trình** | — | Không trung chuyển / Có trung chuyển | **Không lưu (giá trị suy ra). Suy ra từ route legs** | Giữa kho và nơi giao có điểm trung chuyển hay không (11-3) |

- **Nơi nắm giữ `service_form` được giới hạn ở loại giao hàng** 〔Quyết định v2.1 #7〕 (cũ: lượt 1 #29 "loại chuyến là hạng mục nhập của hợp đồng 〈hợp đồng con〉". Ngày 2026/09/21 lượt 2 giới hạn nơi nắm giữ vào loại giao hàng). Việc không suy ra từ có/không trung chuyển vẫn giữ nguyên (REQ-DL-785 đã hủy). **`relay` không lưu như một trạng thái**; chỉ cần có 1 leg trở lên chứa điểm trung chuyển thì suy ra là "có trung chuyển" 〔Yêu cầu REQ-DL-876〕.
- **`delivery_regime` thay thế `service_type` cũ (2 giá trị `self` / `outsourced`)** 〔Chu kỳ §0 thuật ngữ・§7〕. Với 2 giá trị thì không phân biệt được "tài xế ủy thác (đi qua ứng dụng)" và "công ty vận chuyển (không đi qua ứng dụng)", dẫn đến phán định hoàn tất ngầm định sai.

**Thứ quyết định sự khác biệt về thông tin lấy được không phải là thể chế giao hàng, mà là có đi qua ứng dụng tài xế của ES hay không** 〔Chu kỳ §4C〕.

| | Chuyến đi qua ứng dụng tài xế (`self` / `partner_driver`) | Chặng không đi qua ứng dụng (`parcel_carrier` giao trực tiếp) |
|---|---|---|
| Thông tin giữa chừng | Lấy được qua ứng dụng từ **nhận hàng tại kho đến STEP1〜5** | **Chỉ đến việc đã ra chỉ thị xuất hàng.** Sau đó chỉ có liên kết ngoài đến trang tra cứu của từng công ty 〔Yêu cầu REQ-DL-414〕 |
| Xác nhận hoàn tất giao hàng | Tài xế báo cáo giao hàng | **Không ai báo cáo** → **hoàn tất ngầm định** (11-2) |
| Người báo cáo sự cố | Tài xế | Doanh nghiệp・cơ sở, hoặc bộ phận vận hành đăng ký thay khi nhận liên lạc từ công ty giao hàng (13-2) |
| Số vận đơn | **Có nếu có chặng qua Yamato** (tự giao hàng ≠ không có vận đơn) 〔Chu kỳ §4D-2〕 | Luôn có |
| Túi giữ lạnh・gói giữ lạnh | Thu hồi được | Không thu hồi được (12-5) |

**Cách xử lý theo loại chuyến** (loại chuyến được quyết định bởi "có công việc trưng bày hay không", không phải theo nhiệt độ) 〔Chu kỳ §4C-3〕〔Yêu cầu REQ-DL-656〕

| Loại chuyến | Nội dung | Ứng dụng tài xế |
|---|---|---|
| **Chuyến giao ES** | Chuyến trưng bày đến tận kệ của nơi giao | STEP1 Ảnh trước trưng bày → STEP2 Xác nhận tồn kho・hủy → STEP3 Kiểm hàng (số lượng) → STEP4 Ảnh sau trưng bày → STEP5 Thu tiền (tùy chọn) |
| **Chuyến giao COOL** | Chuyến chỉ giao đưa. **Đông lạnh・lạnh・nhiệt độ thường đều thuộc loại này** (nhiệt độ thường xử lý giống lạnh) | Chỉ cần kiểm tra vận đơn là hoàn tất. **Nếu tài xế ES chạy chặng cuối thì báo cáo trên ứng dụng** (= không áp dụng hoàn tất ngầm định・11-2) |
| **Chuyến vật tư** | **Gửi trực tiếp từ kho cho Yamato**. Không đi qua tài xế | **Ngoài đối tượng.** Không có phân công tài xế và 5 bước. Chỉ quản lý chỉ thị xuất hàng và số vận đơn, trên lịch được xử lý như dòng "chỉ xuất hàng" |

- **Phân nhánh theo loại chuyến chỉ được áp dụng cho "làm gì trên ứng dụng"** 〔Quyết định v2.1 #7〕〔Chu kỳ §4C-3〕. **Việc coi hoàn tất giao hàng là ngầm định hay bắt làm thiếu giao không phân nhánh theo loại chuyến** (11-2). Lý do không tách nhiệt độ thường thành một chuyến riêng: nhiệt độ hàng được hỗ trợ trong master công ty giao hàng có **3 giá trị (Đông lạnh / Lạnh・Nhiệt độ thường / Vật tư)**, và đã quyết định **đưa nhiệt độ thường vào cùng nhóm với lạnh** 〔Quyết định #8〕〔Yêu cầu REQ-DL-402〕. Giao vật tư **được loại khỏi việc phán định・hiển thị ngưỡng số lượng mỗi ngày** 〔Yêu cầu REQ-DL-818〕.

### 11-2. Trường hợp công ty vận chuyển giao trực tiếp chặng cuối

**Việc có áp dụng hoàn tất ngầm định hay không không dựa vào loại chuyến hay giá trị mặc định của thể chế giao hàng, mà dựa vào bên vận chuyển của final leg (chặng cuối)** 〔Quyết định v2.1 #4〕〔Chu kỳ §4C-1〕〔Yêu cầu REQ-DL-869・870・871〕. (Cũ: phán định dựa trên loại chuyến "chuyến ủy thác thì xác nhận hoàn tất giao hàng theo kiểu ngầm định". Thay đổi ngày 2026/09/21 lượt 2. Đồng thời bỏ cách gọi "chuyến ủy thác" ở tiêu đề 〔Quyết định v2.1 S4〕)

| Bên vận chuyển final leg (chặng cuối) | `delivery_regime` | Cách xử lý hoàn tất | Cách xử lý thiếu giao |
|---|---|---|---|
| **Ứng dụng tài xế của ES** (tài xế tự vận hành・công ty giao hàng ủy thác) | `self` / `partner_driver` | **Không áp dụng hoàn tất ngầm định.** Chuyển sang Đã giao khi tài xế báo cáo giao hàng | Nếu sang sáng hôm sau mà chưa hoàn tất thì đưa vào **missing queue (cần xác nhận)** (11-5) |
| **Công ty vận chuyển giao trực tiếp** (Yamato v.v. Không đi qua ứng dụng ES) | `parcel_carrier` | **Áp dụng hoàn tất ngầm định.** Batch `delivery_presume_complete` lúc 06:00 ngày hôm sau ngày giao chuyển sang **Đã giao (ngầm định)** (chỉ với bản ghi `status = Đã xuất hàng` và **không có báo cáo sự cố chưa giải quyết** 〔Quyết định v2.3 #25〕) | **Chỉ khi có liên lạc về bất thường từ khách hàng・công ty giao hàng thì ghi nhận báo cáo sự cố và mở "cần xác nhận"** (không đổi trạng thái 〔Quyết định v2.3 #20〕. Cũ: chuyển xuống Đang xác nhận). Với "chưa nhận được hàng" thì yêu cầu Yamato điều tra; nếu mất hàng・chưa giao thì **chuyển Đã giao ngầm định sang Chờ giao lại / Hủy giữa chừng** 〔Quyết định v2.3 #27〕 |

- Thứ dùng để phán định chỉ là **`delivery_regime` của chặng cuối (`is_final_leg = true`)** 〔Chu kỳ §4C-1・§7〕. Không phán định bằng `delivery_regime` hay `service_form` ở phía dữ liệu giao hàng. **Dù có trung chuyển, nếu chặng trung chuyển là công ty vận chuyển nhưng chặng cuối là tài xế ES thì không áp dụng hoàn tất ngầm định.** Ngược lại, nếu chặng cuối là công ty vận chuyển thì dù chặng trước là chuyến tự vận hành vẫn là hoàn tất ngầm định. Cùng là chuyến giao COOL, nếu chặng cuối do tài xế ES chạy thì lấy được báo cáo nên không được áp dụng ngầm định.
- **Điều kiện ghi đè**: nếu có ① xác nhận đã nhận từ lịch của doanh nghiệp, ② liên lạc từ doanh nghiệp・cơ sở hoặc công ty giao hàng thì ghi đè bằng nội dung đó, và **chỉ với phần có liên lạc thì ghi nhận báo cáo sự cố và mở "cần xác nhận"** (không đổi trạng thái 〔Quyết định v2.3 #20〕. Cũ: chuyển xuống Đang xác nhận. Bãi bỏ 2026/09/24) 〔Chu kỳ §4C-1〕. **Việc là ngầm định được lưu lại trong dữ liệu** (`deliveries.completion_source = presumed / reported / customer`). Mục đích là để khi thanh toán hay kiểm toán có thể phân biệt "hoàn tất mà không ai nhìn thấy" 〔Yêu cầu REQ-DL-654〕.
- **Hợp đồng quyết toán theo thực tế (trả sau) cũng có thể áp dụng hoàn tất ngầm định nếu final leg là công ty vận chuyển.** Không tách cách xử lý kiểu "vì trả sau nên phải lấy thực tế chặt chẽ". Nếu phát hiện chênh lệch thì **điều chỉnh sau** (14-3). Không giả vờ nhìn thấy điều không nhìn thấy, mà **chỉ khi có bất thường mới để con người can thiệp** 〔Chu kỳ §4C-1〕.

### 11-3. Trung chuyển

| Nội dung đã quyết | Chi tiết | Nguồn |
|---|---|---|
| Giá trị nắm giữ | **Chỉ 2 giá trị "có / không trung chuyển".** Không lưu, mà **suy ra từ việc route legs có leg chứa điểm trung chuyển hay không** (các giá trị cũ Chờ trung chuyển / Đang trung chuyển / Đã trung chuyển bị bãi bỏ) | 〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-755・814・876〕 |
| Trạng thái giữa chừng | **Không nắm giữ.** Do trung chuyển là gửi qua Yamato nên tiền đề là không lấy được "đã giao cho điểm trung chuyển / đã nhận tại điểm trung chuyển". Tình trạng giữa chừng được kiểm tra bằng cách mở trang theo dõi của từng công ty từ số vận đơn. Dù ở Giai đoạn 3 lấy được tình trạng giao hàng của Yamato thì **chỉ hiển thị làm thông tin tham khảo**, không dùng để phán định trạng thái | 〔Chu kỳ §4C-2〕〔Yêu cầu REQ-DL-414・814〕 |
| Số chặng・vận đơn | **Không giả định trung chuyển từ 2 tầng trở lên** (thực tế chỉ có tối đa 1 tầng. Chỉ làm cấu trúc dữ liệu linh hoạt, màn hình giới hạn 1 tầng). **Không phát hành lại** vận đơn tại điểm trung chuyển | 〔Chu kỳ §12-7・§3.1B・§4D-2〕 |
| Lead time | **Tổng 1 giá trị là chuẩn**; phần chi tiết chặng 1・chặng 2 chỉ hiển thị tham khảo (không dùng để tính ngày) | 〔Quyết định #21〕〔Yêu cầu REQ-DL-837〕 |
| Phán định hoàn tất | **Không phán định theo có/không trung chuyển.** Quyết định theo bên vận chuyển của final leg (11-2) | 〔Quyết định v2.1 #4〕 |
| **Phân công tài xế** | **Cấu trúc cho phép phân công theo từng chặng (leg)** (**`delivery_legs.driver_id`**. `contract_routes` / `contract_month_routes` phía hợp đồng không có `driver_id` = phân công chỉ tồn tại theo đơn vị dữ liệu giao hàng 〔Quyết định v2.3 #1〕). **Chặng do công ty vận chuyển (`parcel_carrier`) chạy thì không phân công. Chặng do tự vận hành (`self`)・ủy thác (`partner_driver`) chạy thì phân công** (không phân biệt chặng 1・chặng 2 mà quyết định theo bên vận chuyển của chặng). Với chặng ủy thác, công ty giao hàng ủy thác đó cũng có thể phân công tài xế của mình. Không dùng cách giữ 2 người phụ trách chặng 1・chặng 2 trong 1 bản ghi (mỗi chặng có 1 `delivery_legs` riêng) (cũ: vận hành tạm thời chỉ phân công chặng 2 〈điểm trung chuyển → nơi giao〉, chặng 1 〈kho → điểm trung chuyển〉 do công ty vận chuyển chạy nên không phân công. Thay thế ngày 2026/09/29 〔Quyết định v2.3 #48〕) | 〔Quyết định #60〕〔Quyết định v2.3 #48〕〔Yêu cầu REQ-DL-836〕〔Chu kỳ §4B-1〕 |
| **Bàn giao tại điểm trung chuyển** | **Không tăng trạng thái** (không nắm giữ trạng thái giữa chừng của trung chuyển). Thay vào đó nắm giữ **thời điểm nhận・người nhận theo từng chặng** (`delivery_legs.picked_up_at`・`picked_up_by`). **Trạng thái Đã nhận chỉ được đặt khi lần đầu nhận trên ứng dụng ES** (nếu chặng 1 là ủy thác thì là nhận tại kho). Khi tài xế chặng 2 thực hiện "nhận hàng" tại điểm trung chuyển thì chỉ nhập thời điểm nhận của chặng đó (trạng thái vẫn là Đã nhận). Bản ghi chưa có nhận ở chặng cuối mà sang sáng hôm sau ngày giao thì được bắt bằng phát hiện thiếu giao hiện có (`delivery_detect_missing`) | 〔Quyết định v2.3 #49〕 |

- Màn hình **hiển thị người phụ trách và nút phân công cho từng chặng cần phân công (chặng tự vận hành・ủy thác), còn chặng của công ty vận chuyển thì hiển thị "Công ty vận chuyển"**. **Nếu chặng 1 là ủy thác thì dòng chặng 1 cũng hiển thị phân công**. Cột tài xế trong danh sách quản lý xuất hàng・giao hàng hiển thị 2 dòng chặng 1／chặng 2 〔Quyết định v2.3 #48〕 (cũ: màn hình cũng chỉ hiển thị phân công chặng 2, chặng 1 hiển thị "Công ty vận chuyển". Khi xuất hiện vận hành tự chạy chặng 1 thì sẽ bổ sung màn hình 〔Chu kỳ §4B-1〕. Thay thế 2026/09/29).
- **Trường hợp chặng 1 là công ty giao hàng ủy thác** có tồn tại thực tế (phản hồi của bộ phận vận hành 2026/09/29): A = không trung chuyển・ủy thác đến lấy tại kho / B = chặng 1 là ủy thác・có trung chuyển (kho →〈ủy thác A〉→ điểm trung chuyển →〈ủy thác B〉→ cơ sở) / C = chặng 1 là ủy thác・cuối cùng là Yamato. Ở cả ba trường hợp, phân công・nhận hàng・đánh số (10-5) đều được quyết định theo bên vận chuyển của chặng nên không tăng phân nhánh màn hình 〔Quyết định v2.3 #47〜#51〕.

### 11-4. Hệ thống `delivery status` — ai・khi nào・ở đâu cập nhật

**`delivery status` (`deliveries.status`) là một máy trạng thái khác với `plan lifecycle` (`shipping_plans.lifecycle` = `draft` / `published` / `locked`). Không gộp cả hai và gọi chung là "trạng thái"** 〔Quyết định v2.1 S5〕〔Yêu cầu REQ-DL-883〕. Định nghĩa giá trị và bảng chuyển trạng thái nằm ở §7-7. Ở đây quyết định **chủ thể・thời điểm・nơi cập nhật**. Cách đặt tên giới hạn **đuôi chỉ có 3 loại "Chờ / Đang / Đã"**, không dùng "hoàn tất", "〜khả thi" và viết tắt trong tên trạng thái 〔Chu kỳ §4A-3B〕〔Yêu cầu REQ-DL-751〕.

| Nhóm | Trạng thái | Người cập nhật | Khi nào | Ở đâu |
|---|---|---|---|---|
| Tiến hành | **Chờ xuất hàng** | Batch | Khi tạo xác định (khi `plan lifecycle` thành `published`) | `delivery_materialize` (mỗi ngày 02:30) |
| Tiến hành | **Đã xuất hàng** | Hệ thống | Khi nhập CSV kết quả xuất hàng・CSV vận đơn | Liên kết Thomas |
| Tiến hành | **Đã nhận** | **Tài xế** | Khi thao tác hoàn tất nhận hàng tại kho・điểm trung chuyển. **Lần nhận đầu tiên trên ứng dụng ES** thì thành Đã nhận (nếu chặng 1 là ủy thác thì nhận tại kho). Việc nhận tại điểm trung chuyển của chặng tiếp theo **chỉ nhập `picked_up_at`・`picked_up_by` của chặng đó**, trạng thái vẫn là Đã nhận 〔Quyết định v2.3 #49〕 | **Ứng dụng tài xế** (nhận hàng) |
| Tiến hành | **Đã giao** | Tài xế | Khi báo cáo giao hàng | Ứng dụng tài xế |
| Tiến hành | **Đã giao (ngầm định)** | Batch | 06:00 ngày hôm sau ngày giao. **Chỉ với bản ghi có final leg là `parcel_carrier`** (`status = Đã xuất hàng` và không có báo cáo sự cố chưa giải quyết 〔Quyết định v2.3 #25〕) | `delivery_presume_complete` (11-2) |
| Tiến hành | **Đã giao một phần** | Vận hành (logistics) | Khi quyết định cách xử lý sự cố (trực tiếp từ Đã xuất hàng／Đã nhận 〔Quyết định v2.3 #21〕) | 06 Chi tiết dữ liệu giao hàng (13-3) |
| Tiến hành | **Chờ giao lại** | Vận hành (logistics) | Khi quyết định cách xử lý sự cố (trực tiếp từ Đã xuất hàng／Đã nhận 〔Quyết định v2.3 #21〕) | 06 Chi tiết dữ liệu giao hàng (13-4) |
| Bất thường | **Đang xác nhận** (chỉ bản ghi con) | Vận hành (logistics) / Hệ thống | Khi tạo bản ghi con bằng nhân bản / khi đăng ký báo cáo sự cố thuộc loại tự động tạo bản ghi con 〔Quyết định v2.3 #30〕 (cũ: batch tạo khi quá hạn. Bãi bỏ 2026/09/29). **Với báo cáo sự cố・liên lạc sau giao hàng thì không chuyển bản ghi cha sang trạng thái này** 〔Quyết định v2.3 #20・#22〕 (cũ: khi nhận báo cáo sự cố・khi tiếp nhận liên lạc sau giao hàng thì chuyển bản ghi cha sang Đang xác nhận. Bãi bỏ 2026/09/24) | 06・Cần xác nhận |
| Kết thúc | **Hủy giữa chừng** | Vận hành (logistics) | Khi quyết định cách xử lý (thực tế 0・bắt buộc nêu lý do) | 06 Chi tiết dữ liệu giao hàng |
| Kết thúc | **Hủy bỏ** | Vận hành (logistics) | Trước khi xuất hàng (bắt buộc nêu lý do) | 06 Chi tiết dữ liệu giao hàng |

- **"Đã nhận" chỉ được nhập từ ứng dụng tài xế của ES.** Không liên quan đến thông tin của công ty vận chuyển như Yamato, và **không gắn vào bản ghi giao hàng có final leg là `parcel_carrier`** (phán định "chưa nhận／đã nhận" cũng tương tự) 〔Chu kỳ §4A-3B〕. Nhóm kết thúc (Hủy giữa chừng・Hủy bỏ) là nhóm riêng và **hiển thị màu xám**.
- **Chỉ vận hành (logistics) mới có thể Hủy bỏ・Hủy giữa chừng・Chờ giao lại**; tài xế và công ty giao hàng ủy thác **chỉ dừng ở mức báo cáo** 〔Chu kỳ §4A-3B・§11-3〕. **Tên thao tác** của tài xế là **"Báo cáo sự cố"**, và **dù báo cáo thì trạng thái dữ liệu giao hàng không đổi** (báo cáo sự cố và "cần xác nhận" được mở) 〔Quyết định v2.3 #20〕 (cũ: trạng thái dữ liệu là "Đang xác nhận". Bãi bỏ 2026/09/24). Về thuật ngữ, dùng phân biệt **giao một phần** (khái niệm) / **Đã giao một phần** (giá trị trạng thái), không viết là "giao bộ phận".
- **Không tạo lối đi chỉ để đổi trạng thái từ màn hình.** Bắt buộc đi qua thao tác "quyết định cách xử lý" (13-2), và mỗi lần trạng thái thay đổi thì ghi 1 dòng lịch sử thay đổi 〔Chu kỳ §4A-4C〕.
- **Tương ứng giữa huy hiệu trên ứng dụng tài xế và trạng thái phía vận hành** (văn bản trên ứng dụng đã chốt màn hình nên không đổi) = Chưa nhận → **Đã xuất hàng** / Chưa giao → **Đã nhận** / Giao xong → **Đã giao** / Sự cố → **trạng thái vẫn là Đã xuất hàng／Đã nhận, có báo cáo sự cố chưa giải quyết** 〔Quyết định v2.3 #20〕 (cũ: Sự cố → Đang xác nhận. Bãi bỏ 2026/09/24) 〔Chu kỳ §4A-3B・§4B-5〕.

### 11-5. Phát hiện thiếu giao

**Đối tượng được bắt là thiếu giao cũng được quyết định theo final leg** 〔Quyết định v2.1 #4〕〔Yêu cầu REQ-DL-869・663〕. Chia theo cùng trục với bảng phán định ở 11-2, và **làm cho đối tượng của 2 batch không chồng nhau**.

| Bên vận chuyển final leg | Batch hằng ngày | Phán định | Nơi xuất ra |
|---|---|---|---|
| **Ứng dụng tài xế của ES** (`self` / `partner_driver`) | `delivery_detect_missing` (mỗi ngày 06:00) | Đã quá ngày giao, và **sang sáng hôm sau vẫn không phải Đã giao・Hủy giữa chừng・Hủy bỏ** (`status IN (Đã xuất hàng, Đã nhận)` và **không có báo cáo sự cố chưa giải quyết** 〔Quyết định v2.3 #25〕) | **missing queue (cần xác nhận)**. **Không đổi trạng thái** (không áp dụng hoàn tất ngầm định) |
| **Công ty vận chuyển giao trực tiếp** (`parcel_carrier`) | `delivery_presume_complete` (mỗi ngày 06:00) | Đã quá ngày giao (`status = Đã xuất hàng` và **không có báo cáo sự cố chưa giải quyết** 〔Quyết định v2.3 #25〕) | Chuyển thành **Đã giao (ngầm định)**. Không đưa vào phát hiện thiếu giao |

- **Hai job chia đối tượng theo final leg** 〔Chu kỳ §11-1〕 (cũ: hai job "nhìn cùng đối tượng từ hai phía ngược nhau", job trước là chuyến công ty vận chuyển, job sau là toàn bộ gồm cả tự giao hàng. Lượt 2 ngày 2026/09/21 đã chia lại đối tượng). **Vì đối tượng không chồng nhau nên không bỏ sót cũng không tính trùng.** Thứ tự thực hiện là **hoàn tất ngầm định → phát hiện thiếu giao**.
- **Phần mà final leg là công ty vận chuyển giao trực tiếp** là đối tượng của hoàn tất ngầm định nên không xuất hiện trong batch phát hiện thiếu giao. Cách duy nhất để biết hàng có thật sự đến nơi hay không là **liên lạc từ khách hàng・công ty giao hàng** 〔Chu kỳ §4C-2〕. Chính vì vậy bắt buộc phải có điều kiện ghi đè ở 11-2 và cửa đăng ký thay (13-2). Việc thanh toán theo thực tế nên **chưa giao thì không thanh toán** (14-2) 〔Chu kỳ §4D-1〕. Thiếu giao, giống như hoàn tất mà chưa nhận・giao thiếu một phần・chênh lệch số lượng・báo cáo sự cố・chưa phân công, được **gom về một mục "cần xác nhận" trong lịch vận hành** (12-3) 〔Chu kỳ §4B-6〕.
- **Bản ghi giao hàng có báo cáo sự cố chưa giải quyết không được đưa vào hoàn tất ngầm định lẫn phát hiện thiếu giao** 〔Quyết định v2.3 #25〕. Sự cố do vận hành (logistics) giải quyết. Bản ghi con tự động được tạo cùng lúc với đăng ký báo cáo (13-2) 〔Quyết định v2.3 #30〕 (cũ: batch `trouble_auto_duplicate` tạo khi quá hạn và chạy trước hai job này. Bãi bỏ 2026/09/29). Bản ghi con tự động chưa xác định (`trouble_pending`) cũng nằm ngoài đối tượng hoàn tất ngầm định 〔Quyết định v2.3 #23〕.

### 11-6. Cách hiển thị lịch cho công ty giao hàng ủy thác

| Hạng mục | Nội dung | Nguồn |
|---|---|---|
| Hiện trạng・tính chất của lịch | **Công ty giao hàng ủy thác nắm lịch trước thông qua trang chuyên dụng của công ty giao hàng (Web công ty giao hàng ủy thác)** (ES không liên lạc mỗi lần). Lịch hiển thị ở đó chỉ là **dự kiến**, đến hạn chót thì cả ngày và số lượng đều có thể thay đổi | 〔Chu kỳ §4C-4〕 |
| Thời điểm xác nhận | **Cùng thời điểm với xác nhận đơn hàng (hạn chót đơn hàng)** (14-5). Khi xác nhận giao hàng, hệ thống **tự động gửi email xác nhận** cho công ty giao hàng ủy thác | 〔Chu kỳ §4C-4〕〔Yêu cầu REQ-DL-409〕 |
| **Khi hạn chót là tạm thời** | **Trong khi `marker_source = provisional` thì không gửi email xác nhận** (14-5). Hạn chót tạm thời là giá trị mặc định để phán định nội bộ, không phải ngày đã hứa với công ty giao hàng | 〔Quyết định v2.1 #9〕〔Chu kỳ §4A-2E〕 |
| **Dữ liệu giao hàng đã xác nhận (sau hạn chót đơn hàng)** | **Toàn bộ hạng mục**: tên cơ sở・địa chỉ・ngày giao・nhiệt độ hàng・số lượng・điều kiện giao hàng・vận đơn | 〔Quyết định v2.3 #34〕 |
| **Dự kiến (trước hạn chót)** | **Đến chu kỳ tháng sau.** Chỉ hiển thị **ngày giao・tên cơ sở・nhiệt độ hàng・số lượng bản ghi** (**không hiển thị số lượng hàng**). Gắn dấu **"Dự kiến"** | 〔Quyết định v2.3 #34〕 |
| **Phạm vi nhìn thấy** | **Chỉ các bản ghi giao hàng có chặng (leg) do công ty mình phụ trách.** Thao tác được cũng chỉ trên chặng của công ty mình (phụ trách chặng 1 đến nhận hàng tại kho, phụ trách chặng 2 từ nhận hàng tại điểm trung chuyển đến giao hàng) | 〔Quyết định v2.3 #34・#51〕 |
| Màn hình | **Tái sử dụng "Lịch tháng・tuần・ngày"** của vận hành cho **Web công ty giao hàng ủy thác (theme carrier)** (cố định bộ lọc công ty giao hàng ủy thác là công ty mình, ẩn số lượng của dự kiến) | 〔Quyết định v2.3 #34〕 |

(Cũ: "Hiển thị ra đến đâu 〈trước mấy tháng・đến hạng mục nào〉 là chưa quyết" 〔Quyết định G〕. Đã giải quyết ở phụ lục 4 ngày 2026/09/29 〔Quyết định v2.3 #34〕)

### 11-7. Liên lạc sau giao hàng — Đã giao không quay lại "Đang xác nhận"

**Dù sau khi giao hàng có liên lạc (khiếu nại) từ doanh nghiệp・cơ sở・công ty giao hàng thì `Đã giao` vẫn giữ là `Đã giao`** 〔Quyết định v2.3 #20〕. Vận hành đăng ký thay báo cáo sự cố và mở "cần xác nhận". **Không đặt thời hạn tiếp nhận (do vận hành quyết định)** 〔Quyết định #61〕〔Yêu cầu REQ-DL-856〕.

- Người giải quyết là **vận hành (logistics)** (13-2). Cách giải quyết có thể bắt đầu từ `Đã giao` là **giao đủ toàn bộ** (kể cả hàng thay thế), đóng ở trạng thái `Đã giao` (**ngoại lệ: Đã giao ngầm định có thể chuyển Chờ giao lại／Hủy giữa chừng** 〔Quyết định v2.3 #27〕). Giao một phần・giao lại・hủy giữa chừng・quay lại thăm trong ngày có điểm bắt đầu là Đã xuất hàng／Đã nhận 〔Quyết định v2.3 #21〕.
- Nếu loại liên lạc là loại tự động tạo bản ghi con (giao nhầm・hư hỏng v.v.) thì tạo 1 bản ghi con tự động (`Đang xác nhận`・`trouble_pending`) cùng lúc đăng ký thay 〔Quyết định v2.3 #30〕. Bản ghi cha vẫn là `Đã giao`. **Với "chưa nhận được hàng" mà là hoàn tất ngầm định (`presumed`) thì có thể chuyển sang Chờ giao lại／Hủy giữa chừng theo kết quả điều tra của Yamato** 〔Quyết định v2.3 #27〕. Nếu cách giải quyết không cần gửi lại thì bản ghi con tự động được chuyển thành `Hủy bỏ` trong cùng giao dịch với việc giải quyết 〔Quyết định v2.3 #22・#24〕.
- **Dù sửa thực tế sau khi chốt thanh toán cũng không viết lại thanh toán hồi tố**, mà **phản ánh vào tháng sau** bằng **điều chỉnh trong ① trả trước・② quyết toán theo thực tế** (14-3) 〔Quyết định #61・#70〕. Thứ bị khóa chỉ là **chỉ định ngày・tuyến・số lượng**, còn **thực tế và tài liệu đính kèm không bị khóa**. Thời điểm hoàn tất・số lượng giao・ghi chú **có thể sửa kèm lý do**, và tài liệu của bản ghi giao hàng này (ảnh báo cáo) **có thể thêm・thay thế** (§8-4) 〔Chu kỳ §4A-4C〕〔Luồng sự cố §6〕.

(Cũ: tiêu đề "Khi đưa Đã giao quay lại 'Đang xác nhận'". Nếu có liên lạc sau giao hàng thì vận hành đăng ký thay và đưa quay lại Đang xác nhận, giữ trong "cần xác nhận" cho đến khi chọn một trong Đã giao／Đã giao một phần／Chờ giao lại／Hủy giữa chừng. Bãi bỏ 2026/09/24 〔Quyết định v2.3 #20〕)

---

## 12. Tài xế và phân công

### 12-1. Đơn vị・quyền hạn・cách xử lý chưa phân công

Đây là giai đoạn quyết định **ai sẽ vận chuyển** sau khi ngày của dữ liệu giao hàng đã được xác định. Vì không đụng đến ngày nên **có thể làm việc ngay cả sau khi `plan lifecycle` là `locked`**, và bản ghi con được nhân bản cũng cần phân công 〔Chu kỳ §4B〕.

- **Đối tượng phân công là 1 dữ liệu giao hàng** (1 chi tiết giao hàng × 1 loại giao hàng). Dù cùng cơ sở, nếu đông lạnh・lạnh・vật tư có công ty giao hàng khác nhau thì là bản ghi khác nên **phân công riêng**. **Khi có trung chuyển thì nắm giữ theo từng chặng (leg)**, và **chặng của công ty vận chuyển (`parcel_carrier`) không phân công, chặng tự vận hành・ủy thác thì phân công** (11-3) 〔Chu kỳ §4B-1〕〔Quyết định #60〕〔Quyết định v2.3 #48〕〔Yêu cầu REQ-DL-836〕 (cũ: vận hành chỉ phân công chặng 2. Thay thế 2026/09/29).
- **Bản ghi con được nhân bản (`DL-…-1`) không kế thừa phân công.** Phân công lại theo ngày giao lại・ngày giao từng phần (§8-4) 〔Chu kỳ §4B-1〕. **Không làm chức năng đổi tài xế hàng loạt** 〔Quyết định #65〕〔Yêu cầu REQ-DL-855〕. **Đổi từng bản ghi một.** Vì số lượng có hạn, và nếu đổi hàng loạt thì không còn theo dõi được "ai đang giữ gì". **Không làm ở Giai đoạn 2** 〔Chu kỳ §12-7〕.
- **Bản ghi con tự động chưa xác định (`duplicate_type=trouble_pending`) nằm ngoài đối tượng phân công.** Cho đến khi vận hành (logistics) xác định ngày・số lượng (`schedule_confirmed`・`quantity_confirmed` là true) thì không phân công 〔Quyết định v2.3 #23〕〔DEV §13.2.1〕.

**Ai có thể thiết lập・thay đổi** 〔Chu kỳ §4B-2〕〔Yêu cầu REQ-DL-149〕

| Thao tác | Vận hành (quản lý ES) | Công ty giao hàng ủy thác | Tài xế |
|---|---|---|---|
| Đăng ký tài xế・cấp tài khoản | ○ | △ (phần của công ty mình) | × |
| Phân công người phụ trách cho dữ liệu giao hàng・**thay đổi phân công** | ○ | ○ (phần của công ty mình) | × |
| **Thay đổi ngày giờ giao hàng** | ○ | × | × |
| Báo cáo nhận hàng・giao hàng / báo cáo sự cố | ○ (đăng ký thay) | ○ | ○ |
| Hủy bỏ・hủy giữa chừng・sắp xếp giao lại・nhân bản | ○ | × | × |

**Thời điểm phân công và cách xử lý chưa phân công** 〔Chu kỳ §4B-4〕

| Thời điểm | `plan lifecycle` | Cách xử lý |
|---|---|---|
| Ngay sau khi tạo xác định | `published` | Có thể phân công. Hiển thị người phụ trách giống tháng trước làm **ứng viên kế thừa** (không tự động xác định) |
| Thời điểm gửi chỉ thị xuất hàng thành công | → `locked` | Có thể tiếp tục phân công. **Thời điểm này không đưa vào "cần xác nhận"** (xem bằng huy hiệu "Chưa phân công N bản ghi" ở hiển thị tháng・tuần) (cũ: thời điểm này nếu chưa phân công thì đưa vào "cần xác nhận". Thay thế 2026/09/29 〔Quyết định v2.3 #43〕) |
| **3 ngày trước ngày giao・ngày hôm trước** | `locked` | **Nếu chặng cần phân công (chặng tự vận hành・ủy thác) chưa có người phụ trách thì đưa vào cần xác nhận `assignment_missing`** (bắt bằng `plan_recheck` hằng ngày), và **cũng hiển thị trên Web công ty giao hàng ủy thác**. **Với chặng ủy thác thì gửi email cho công ty giao hàng ủy thác phụ trách** (2 lần: 3 ngày trước và ngày hôm trước. Chặng tự vận hành chỉ hiển thị trong cần xác nhận). Bản thân việc xuất hàng không bị dừng (thay đổi 2026/09/30. Cũ: 1 lần vào ngày hôm trước ngày giao・chỉ cần xác nhận・không có email cho công ty giao hàng ủy thác) 〔Quyết định v2.3 #43・#48〕〔Yêu cầu REQ-DL-643〕〔Bảng yêu cầu dòng 142・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕 |
| Ngày picking・ngày giao | `locked` | Bản ghi mà đến ngày vẫn chưa phân công thì hiển thị ở vị trí cao nhất trong cần xác nhận |
| Ngay sau khi nhân bản | Mới, bất kể giai đoạn của bản ghi cha | Ngày・vận đơn・**phân công tài xế** chưa thiết lập nên chắc chắn đưa vào cần xác nhận. **Bản ghi con tự động chưa xác định** được đưa vào cần xác nhận `trouble_auto_child_pending`, và không là đối tượng phân công cho đến khi xác định 〔Quyết định v2.3 #22・#23〕 |

- Vì thay đổi phân công không đổi ngày nên **không hạn chế ngay cả sau `locked`**. Thay đổi được lưu vào lịch sử 〔Chu kỳ §4B-4〕. Cảnh báo ngưỡng (số lượng) là đối với **số lượng picking của kho**, còn số bản ghi mỗi tài xế phụ trách được hiển thị dưới dạng **hiển thị số lượng trên Web công ty giao hàng ủy thác** (12-6) 〔Yêu cầu REQ-DL-506〕.

### 12-2. Ứng dụng tài xế V1.0

**V1.0 làm trước trên Web (trình duyệt). Việc chuyển sang native trong tương lai chỉ dừng ở mức xem xét** 〔Quyết định #63〕〔Yêu cầu REQ-DL-852〕〔Chu kỳ §4B-5〕 (cũ: yêu cầu §6-1 "phát triển bằng ứng dụng, không phải Web responsive" đã hủy). Lý do: Web không cần phân phối・cập nhật và có thể giao ngay trong ngày cho tài xế của công ty giao hàng ủy thác. **Giai đoạn 2 chỉ làm Web, việc native hóa không nằm trong công việc Giai đoạn 2** (khi muốn đảm bảo chắc chắn hơn về thông báo đẩy・camera・lưu offline thì sẽ xem xét ở Giai đoạn 3). Do tiền đề là Web, việc giữ báo cáo chưa gửi khi offline và gửi ảnh riêng được đảm bảo bằng phương thức ở 12-4.

**Màn hình đã chốt, không đổi văn bản.** Phía vận hành nhận dữ liệu gửi lên từ màn hình này để quản lý (12-3). **Tài xế chỉ làm được đến báo cáo**, còn hủy bỏ・hủy giữa chừng・sắp xếp giao lại・nhân bản do vận hành (logistics) thực hiện 〔Chu kỳ §4B-5・§4A-4B〕.

| Màn hình | Nội dung |
|---|---|
| **Đăng nhập／Đặt lại mật khẩu** | **ID đăng nhập + mật khẩu. Đặt lại bằng nhập mã xác thực 4 chữ số** (Figma là chuẩn) 〔Ứng dụng tài xế_Điểm sửa đặc tả No.1・2026/09/30〕〔Sổ quyết định〕. ※Cũ: phương thức địa chỉ email + liên kết email (REQ-DL-142・503・504) đã bị thay thế |
| **Trang chủ** | KPI trong ngày (**số lượng giao hàng hôm nay・số hoàn tất・số còn lại・tiến độ %**) và "Danh sách lịch giao hàng". Thẻ nơi giao hiển thị địa chỉ・số thùng・số mặt hàng・**khung giờ nhận (nếu có nhiều thì hiển thị tất cả theo thứ tự)**・**điều kiện giao hàng**・huy hiệu trạng thái (Chưa nhận／Chưa giao／Giao xong／Sự cố). Thanh điều hướng dưới gồm Trang chủ／Hướng dẫn／Danh sách giao hàng／Sự cố／Tài khoản 〔Yêu cầu REQ-DL-143〕 |
| **Danh sách giao hàng** (`DA_LIST_00`) | Tìm kiếm theo kỳ・tên kho・nơi giao・số vận đơn, và lọc theo trạng thái 〔Yêu cầu REQ-DL-143〕 |
| **Nhận hàng tại kho** (nhận hàng) | **Tick số vận đơn** ở danh sách nhận hàng. Khi tick đủ toàn bộ thì nút "Hoàn tất" được kích hoạt. Nếu không tick hết được thì bấm "**Gọi điện cho ES**" hoặc đánh dấu chưa nhận; chỉ khi tick vào "**Phần chưa nhận đã được liên lạc cho ES Kitchen.**" (bắt buộc) thì mới bấm được "**Hoàn tất khi còn một phần chưa nhận**" 〔Phản hồi hong 2026-10-03〕. **Hỗ trợ nhận lại trong cùng ngày từ cùng kho** 〔Yêu cầu REQ-DL-144・145〕. Khi chưa hoàn tất thì chỉ tick những vận đơn đã đến, sau khi nhận được thì check-in lại. Nơi nhận cảnh báo khi thiếu hàng là **chỉ ES Kitchen và quản lý giao hàng**, **không thông báo cho doanh nghiệp** 〔Nguồn gốc: yêu cầu §6-2〕〔Yêu cầu REQ-DL-145〕〔Sổ: thông báo nhận hàng tại kho〕. **Hiển thị địa điểm nhận**: nếu là kho thì tên kho・địa chỉ, **nếu là điểm trung chuyển thì tên văn phòng・địa chỉ・mã văn phòng・điện thoại** (bổ sung 2026/09/30) 〔Bảng yêu cầu dòng 37・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕 |
| **Chuyến giao ES** (5 bước) | **STEP1 Trước trưng bày** (ảnh) → **STEP2 Xác nhận tồn kho・hủy** (quét mã vạch. Không nhập hạn sử dụng 〈thay đổi 2026/10/01. Cũ: quét mã vạch・hạn sử dụng〉) → **STEP3 Trưng bày (kiểm hàng)** = số lượng đã bày (hiển thị mặc định số dự kiến, nếu có chênh lệch thì tick hoặc dùng +／− để sửa số lượng. Số lượng giao liên động với tồn kho 〔Nguồn gốc: yêu cầu §6-3〕) → **STEP4 Sau trưng bày** (ảnh) → **STEP5 Đăng ký thu tiền** (tùy chọn). Sau khi hoàn tất vẫn có thể sửa nội dung từng bước. **Ảnh tối thiểu 1 ảnh・tối đa 20 ảnh. Ảnh báo cáo sự cố cũng như vậy** (bổ sung 2026/10/01・K-30) 〔Yêu cầu REQ-DL-146〕 |
| **Báo cáo đỗ xe** | Sau khi đỗ xe thì nhập ảnh biên lai và phí đỗ xe (yên). **Cả hai đều bắt buộc**. Tách riêng với thu tiền (STEP5), không hiển thị phí đỗ xe ở mục thu tiền 〔Sổ〕〔Ứng dụng tài xế_Điểm sửa đặc tả No.5〕. Có thể nhập đến lúc giao hàng, và sửa được trong 7 ngày sau giao hàng. Phí đỗ xe do tài xế ứng trước, công ty giao hàng ủy thác gom lại và yêu cầu thanh toán cho vận hành (quản lý hệ thống). **Không thu của doanh nghiệp, cũng không hiển thị trên Web doanh nghiệp** 〔Phản hồi hong 2026-10-03〕. Dữ liệu là `delivery_parking_reports` (`配送_11` 14.7), API là `配送_12` 15.18 |
| **Chuyến giao COOL** | Kiểm tra thông tin nơi giao và thông tin hàng (số vận đơn) rồi hoàn tất. Nếu còn hàng chưa giao thì "**Hoàn tất khi còn một phần chưa giao**". **Phần chưa giao được tạo thành bản ghi con có số nhánh (nhân bản)** (không tạo thẻ tự động sinh) 〔Yêu cầu REQ-DL-649〕 |
| **Báo cáo sự cố** | Chọn đối tượng từ danh sách giao hàng, đi theo thứ tự biểu mẫu báo cáo tình trạng → chọn cơ sở, rồi gửi loại + hình ảnh + ghi chú. Sau khi gửi, huy hiệu "Sự cố" được gắn vào danh sách ở Trang chủ 〔Yêu cầu REQ-DL-148〕 |
| **Hủy／Kiểm kê** | **Đăng ký hủy** bằng tìm kiếm sản phẩm hoặc quét. Nhập **kiểm kê (tồn kho thực tế)** bằng quét mã vạch, khi phát sinh chênh lệch thì thông báo cho quản trị viên vận hành. **Tồn kho lý thuyết chỉ xem được ở xác nhận tồn kho・hủy (STEP2) lúc giao hàng, không hiển thị trong kiểm kê・phiếu kiểm tra hằng tháng** (thay đổi 2026/10/01・K-15. Cũ: nhập kiểm kê và xác nhận được tồn kho lý thuyết) 〔Yêu cầu REQ-DL-151〕 |
| **Lịch (chia sẻ)／Thông báo／Hướng dẫn／Tài khoản** | Nhập khung giờ dự kiến đến và chia sẻ giữa ba bên 〔Yêu cầu REQ-DL-152〕. **Không có chat (chức năng nhắn tin). Khi khẩn cấp liên lạc bằng nút gọi điện** 〔Yêu cầu REQ-DL-153〕〔Bảng yêu cầu dòng 49・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕. Nhận thông báo từ vận hành 〔Yêu cầu REQ-DL-417〕, xem tài liệu hướng dẫn, xác nhận thông tin cá nhân |

**Khung giờ nhận có thể có nhiều. Hiển thị dưới dạng danh sách `delivery_receive_windows`** 〔Quyết định v2.1 #8〕〔Yêu cầu REQ-DL-877・878〕〔Chu kỳ §3.1C・§4B-5〕

- Phía cơ sở có bảng con **`site_receive_windows(site_id, from_time, to_time, sort_order)`** với nhiều dòng, và **khi tạo dữ liệu giao hàng (lúc tạo xác định) thì chụp nguyên danh sách vào `delivery_receive_windows(delivery_id, from_time, to_time, sort_order, snapshot_at)`**. **Không dùng dạng chỉ giữ 1 cặp from/to** (`receive_window_snapshot` cũ đã hủy).
- Thẻ nơi giao trên ứng dụng tài xế hiển thị **tất cả các dòng theo thứ tự `sort_order`** (ví dụ: `09:00〜12:00 / 13:00〜16:00`). **Không chỉ hiển thị 1 cặp rồi bỏ phần còn lại.** Vì có cơ sở chia buổi sáng・buổi chiều.
- **Điều kiện giao hàng** (`deliveries.delivery_condition_snapshot`. Ví dụ "Chuyển vào bằng cửa sau", "Nộp phiếu tiếp nhận ở phòng bảo vệ", "Khi người phụ trách vắng không được để hàng tại cửa") được giữ 1 bản ghi, và hiển thị trên cùng thẻ. Bản đồ lối vận chuyển vào được giữ riêng dưới dạng "tài liệu của địa điểm" (§8-4).
- Cả hai đều là **snapshot lúc tạo** nên về sau dù sửa phía cơ sở thì dữ liệu giao hàng đã tạo cũng không đổi. **Bản ghi con tạo bằng nhân bản sao chép nguyên snapshot của bản ghi cha**, không lấy lại master cơ sở tại thời điểm nhân bản 〔Chu kỳ §7〕. **Khung giờ nhận không dùng để tính ngày** (là thông tin để quyết định thứ tự đi trong ngày) 〔Chu kỳ §3.1C〕.
- **Chuyến báo cáo giao hàng bằng ứng dụng tài xế của ES thì không áp dụng hoàn tất ngầm định** (11-2) 〔Quyết định v2.1 #4〕. Công việc báo cáo **thiết lập hạng mục bắt buộc theo từng bước** để tránh sót báo cáo hoàn tất 〔Yêu cầu REQ-DL-211〕, và hiển thị liên hệ của phụ trách logistics (**050-5784-2777**【tạm thời】) trong popup lỗi 〔Yêu cầu REQ-DL-150〕〔Quyết định E#67〕. **Không chỉ thị giao bổ sung khi thiếu số lượng trên ứng dụng** (phía trụ sở quản lý thủ công, nếu cần thì tạo bản ghi riêng bằng nhân bản) 〔Yêu cầu REQ-DL-147〕. Liên kết ngoại trạng thái giao hàng là **liên kết ngoài** đến trang liên hệ của từng công ty 〔Yêu cầu REQ-DL-414〕.

### 12-3. Quản lý tài xế phía vận hành

Có 3 phương châm 〔Chu kỳ §4B-6〕. ① **Gom mọi bất thường vào "cần xác nhận"** (hoàn tất mà chưa nhận・giao thiếu một phần・chênh lệch số lượng kiểm hàng・báo cáo sự cố・chưa phân công・thiếu giao). ② **Thống nhất bản ghi tiếp theo cho phần chưa giao là nhân bản** (không tạo thẻ tự động sinh). ③ **Có thể lần theo bằng chứng từ chi tiết dữ liệu giao hàng (06)**.

| Khối Màn hình 08 Quản lý tài xế | Nội dung | Nguồn |
|---|---|---|
| Tiến độ trong ngày | Số bản ghi giao hàng・hoàn tất・còn lại・tiến độ %. Chuyển đổi **theo tài xế／theo công ty giao hàng ủy thác／theo kho** | 〔Yêu cầu REQ-DL-641〕 |
| Phân công | Danh sách dữ liệu giao hàng lọc theo ngày và tài xế. Đổi người phụ trách (**từng bản ghi một**), cảnh báo chưa phân công | 〔Yêu cầu REQ-DL-642・643・855〕 |
| Tình trạng tiến hành | **Đã tiến hành đến đâu** từ nhận hàng → Chuyến giao ES STEP1〜5 (hoặc hoàn tất Chuyến giao COOL) | 〔Yêu cầu REQ-DL-645〕 |
| Cần xác nhận | Gom hoàn tất mà chưa nhận・giao thiếu một phần・chênh lệch số lượng・báo cáo sự cố・chưa phân công・thiếu giao vào một danh sách | 〔Yêu cầu REQ-DL-644・647・650・663〕 |
| Phân phối | Quản lý thông báo (tất cả／công ty giao hàng ủy thác／cá nhân・tình trạng đã đọc) và hướng dẫn | 〔Yêu cầu REQ-DL-651・417〕 |
| Tài khoản | Cấp・tạm dừng tài khoản, **đặt lại mật khẩu thay**, trạng thái đăng ký số điện thoại. Đăng nhập bằng **ID đăng nhập + mật khẩu**. ID đăng nhập do hệ thống tự động đánh số (ví dụ `DR00001`・không nhập tay). Việc đặt lại mật khẩu thay ngoài vận hành thì công ty giao hàng ủy thác cũng làm được cho tài xế của mình 〔Phản hồi hong 2026-10-03〕. **Địa chỉ email dùng làm liên hệ khi cấp tài khoản và nơi nhận mã 4 chữ số đặt lại mật khẩu, không dùng để đăng nhập** 〔Sổ〕〔Phản hồi hong 2026-10-03〕 (`配送_11` 14.10・`配送_12` 15.17) | 〔Yêu cầu REQ-DL-503〜505〕 |

- Màn hình thiết lập tài xế được **thống nhất・tập trung vào màn hình quản lý vận hành**. Xóa "đơn vị trực thuộc" trong chi tiết nhân viên giao hàng và loại giao hàng "cá nhân" 〔Yêu cầu REQ-DL-413〕, và **không có phân loại tên công ty・đánh giá・ô ghi chú** 〔Yêu cầu REQ-DL-505〕. **Cấp tài khoản bắt buộc nhập địa chỉ email**, nếu người đó không có email thì nhập email của quản trị viên. Việc cấp・thông báo có thể **chọn giữa xuất CSV (phân phát thủ công) và thông báo email qua hệ thống** 〔Yêu cầu REQ-DL-503・504〕. Tài khoản **vô hiệu hóa ngay khi nghỉ việc・kết thúc hợp đồng**, và quản trị viên công ty giao hàng ủy thác có thể vô hiệu hóa tài xế của mình 〔Chu kỳ §4B-7〕. Thực hiện **đăng ký hủy và hiệu chỉnh tồn kho** từ báo cáo tồn kho・hủy của STEP2 〔Yêu cầu REQ-DL-646〕. Nếu số lượng kiểm hàng ở STEP3 khác số lượng dự kiến thì **hiển thị chênh lệch trong cần xác nhận, và vận hành xác định thực tế** 〔Yêu cầu REQ-DL-647〕. Số tiền thu ở STEP5 vận hành có thể xác nhận・sửa, và **xuất CSV kèm chi tiết theo từng cơ sở** 〔Yêu cầu REQ-DL-507・648〕. **Ghi lại sự kiện việc bấm "Gọi điện cho ES" trên ứng dụng**, và có thể tham chiếu từ lịch sử thay đổi 〔Yêu cầu REQ-DL-652〕. **Không hiển thị ảnh trước・sau trưng bày trên màn hình quản lý cá nhân** 〔Yêu cầu REQ-DL-416〕.

### 12-4. Truyền thông・phạm vi tham chiếu・thông tin cá nhân

**Truyền thông (offline・gửi trùng)** 〔Chu kỳ §4B-7〕〔Yêu cầu REQ-DL-658〕 — API hệ hoàn tất **bắt buộc có khóa lũy đẳng (ID giao hàng + bước + UUID do thiết bị sinh)**, từ lần thứ 2 trở đi với cùng khóa thì không xử lý và trả về cùng kết quả (bấm nút 2 lần cũng không đăng ký trùng). Báo cáo không gửi được thì **giữ trên thiết bị và gửi lại**, đồng thời hiển thị thường trực "**Chưa gửi N bản ghi**" ở phần trên màn hình. **Ảnh được gửi riêng tách khỏi phần chính** nên dù tải ảnh lên thất bại thì bản thân việc hoàn tất vẫn đi qua và có thể bổ sung sau.

**Phạm vi tham chiếu・thời hạn lưu** 〔Chu kỳ §4B-7〕〔Yêu cầu REQ-DL-659〕

| Phân loại | Nội dung đã quyết |
|---|---|
| Phạm vi tham chiếu | Công ty giao hàng ủy thác・tài xế **chỉ xem dữ liệu giao hàng có chặng (leg) do công ty mình phụ trách** (phần của công ty khác không hiển thị trong danh sách) 〔Quyết định v2.3 #51〕. Tài xế không xem được dữ liệu giao hàng quá **90 ngày** kể từ khi hoàn tất (phía vận hành vẫn còn). Vận hành xem được tất cả |
| Thời hạn lưu | Ảnh trước・sau trưng bày và hình ảnh báo cáo sự cố **12 tháng** kể từ khi hoàn tất giao hàng (thời hạn xử lý khiếu nại). Snapshot nơi giao và thực tế giao hàng **24 tháng** (theo thanh toán・kiểm toán). Lịch giao hàng trong **24 tháng** quá khứ |
| Thông tin vị trí | **Không lấy** (ứng dụng không có chức năng). **Ghi rõ trong đặc tả việc không có** để sau này không bị hiểu nhầm là "chắc lấy được" 〔Chu kỳ §12-7〕 |

### 12-5. Túi giữ lạnh・gói giữ lạnh

> **Thay đổi 2026/10/01 (xác nhận của vận hành D3-5・Phản hồi quyết định STEP4 §7): Có sổ cho mượn theo từng đơn vị ủy thác.** Không thu hồi (vẫn giữ phương châm không làm quy trình cho mượn・thu hồi).
> - **Cách nắm giữ sổ**: Bảng con `carrier_coolers` của master nơi giao hàng ủy thác (`carriers`): số hiệu・loại (túi giữ lạnh／gói giữ lạnh)・số lượng・ngày giao・trạng thái (đang cho mượn／mất／hủy)・ghi chú・nhân viên giao hàng đã giao (tùy chọn). Không có "trả lại".
> - Vì **đơn vị ủy thác nhiều trên toàn quốc và có nhiều nhà vận chuyển cá nhân**, ngoài trong chi tiết đơn vị ủy thác còn có **màn hình danh sách xuyên suốt "Sổ túi giữ lạnh" (Quản lý master ＞ Liên quan giao hàng)**: tìm theo tỉnh・đơn vị ủy thác・trạng thái・số hiệu, **nhập・xuất hàng loạt bằng CSV** (chuyển từ bảng quản lý hiện tại). Nhà vận chuyển cá nhân được đăng ký là "công ty giao hàng ủy thác (1 nhân viên)" và đưa vào cùng sổ.
> - **Không sao chép số hiệu vào dữ liệu giao hàng** (không theo dõi theo từng lần giao). "Chỉ giữ số hiệu" bên dưới được thay bằng sổ.

**Giai đoạn 2 chỉ ghi số hiệu, không làm quản lý cho mượn／thu hồi** 〔Chu kỳ §12-7〕〔Yêu cầu REQ-DL-664〕. Vì ứng dụng tài xế (V1.0・đã chốt) không có màn hình nhập thu hồi nên dù làm cũng không vận hành được. Nếu cần thì ở Giai đoạn 3 sẽ thêm kiểm tra thu hồi vào ứng dụng.

- (Cũ. Thay bằng sổ `carrier_coolers` ngày 2026/10/01・điều chỉnh theo sổ ngày 2026-10-03) Chỉ giữ **số hiệu** (hạng mục tùy chọn `deliveries.coolbag_no` / `coolant_no`. **Master nơi giao hàng ủy thác (`carriers`) giữ Số túi giữ lạnh・Số gói giữ lạnh** (thay đổi 2026/09/30. Cũ: master nơi giao hàng cũng có hạng mục đăng ký)) 〔Yêu cầu REQ-DL-210〕〔Bảng yêu cầu dòng 44・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕. Việc có tự động chép số hiệu từ master sang dữ liệu giao hàng hay không là **cần xác nhận**. Số lượng được xem qua **kiểm kê hằng tháng** (số mua − số còn lại) như vật tư tiêu hao của kho.
- **Không sao chép số hiệu vào bản ghi con được nhân bản** (vì bản ghi con là hàng khác) 〔Chu kỳ §4A-4C〕.
- **【Tạm thời】Phần gửi qua Yamato là dùng một lần (không thu hồi). Chỉ ghi số hiệu** 〔Quyết định E#64〕.

### 12-6. Web công ty giao hàng ủy thác

| Làm được gì | Nguồn |
|---|---|
| Đăng nhập bằng liên kết chuyên dụng + ID giao hàng ủy thác (biểu mẫu đăng ký mới gồm 2 trang = thông tin cơ bản／khảo sát). Đăng ký khu vực giao hàng (theo tỉnh + chọn hàng loạt theo nhóm khu vực)・phương tiện (xe lạnh／xe đông lạnh)・thuê hộp・nhiệt độ hàng (**3 giá trị: Đông lạnh／Lạnh・Nhiệt độ thường／Vật tư**. Thay đổi 2026/10/01. Cũ: chọn nhiều Đông lạnh／Lạnh・nhiệt độ thường ngoài đối tượng) | 〔Yêu cầu REQ-DL-401・402〕 |
| Biểu mẫu trả lời yêu cầu báo giá: **Có thể báo giá／Không thể đáp ứng・phí hằng tháng・đính kèm・bình luận・điểm trung chuyển** (RD-DL-167/169). **Trao đổi chỉ qua câu trả lời này, không có chat** (thay đổi 2026/09/30. Cũ: khả năng đáp ứng・**thứ giao hàng được**・số tiền. Câu trả lời đặt **thời hạn hiệu lực**, khi đổi số tiền thì luồng "Trả lời lần đầu" → "Trả lời lại". Có ô trả lời **thông tin điểm trung chuyển**). Việc có giữ thời hạn hiệu lực・trả lời lại hay không là **cần xác nhận**. **Không giữ lead time vì phía nhà vận chuyển không phát sinh**. Không chỉ định buổi sáng／buổi chiều vì không thể cam kết. Dữ liệu là `delivery_inquiries`・`carrier_quote_responses` (`配送_11` 14.5) | 〔Yêu cầu REQ-DL-133・407〕〔Bảng yêu cầu dòng 41・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕 |
| **Không có chat (chức năng nhắn tin). Khi khẩn cấp liên lạc bằng nút gọi điện**. Trên màn hình quản lý hiển thị **khu vực giao hàng・lịch・thông báo・danh sách yêu cầu báo giá**, và có thể **hiển thị số bản ghi phụ trách của nhân viên giao hàng** | 〔Yêu cầu REQ-DL-133・153・506〕〔Bảng yêu cầu dòng 49・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕 |
| **Hiển thị chưa thiết lập tài xế** (bổ sung 2026/09/30): **3 ngày trước ngày giao và ngày hôm trước**, hiển thị bản ghi giao hàng mà chặng của công ty mình chưa thiết lập tài xế. Cùng thời điểm đó **cũng thông báo bằng email** (12-1) | 〔Bảng yêu cầu dòng 142・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕 |
| **Thông báo hủy hợp đồng** (bổ sung 2026/09/30): Khi vận hành **phê duyệt việc hủy cơ sở của chuyến giao ES mà công ty phụ trách thì thông báo bằng hiển thị + email** (8-7) | 〔Bảng yêu cầu dòng 26・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕 |
| **Tham chiếu dữ liệu giao hàng có chặng do công ty mình phụ trách**, và **phân công・đổi tài xế của công ty mình cho chặng của công ty mình** (**không được đổi ngày giờ giao hàng**). Thao tác được **chỉ trên chặng của công ty mình**: phụ trách chặng 1 đến nhận hàng tại kho, phụ trách chặng 2 từ nhận hàng tại điểm trung chuyển đến giao hàng 〔Quyết định v2.3 #51〕. Xuất CSV dữ liệu quản lý thu tiền **kèm chi tiết theo từng cơ sở**. Có thể xóa tệp đã tải lên 〔Nguồn gốc: yêu cầu §8E-3〕. Hỗ trợ responsive là **tạm thời** (cần xác nhận chi phí) | 〔Chu kỳ §4B-2〕〔Yêu cầu REQ-DL-149・507・137〕 |

- Thông báo yêu cầu đầu tiên cho nhà vận chuyển ủy thác bao gồm **tên khách hàng・địa chỉ・gói・số lần giao hàng mỗi tháng・tháng bắt đầu** 〔Yêu cầu REQ-DL-131〕. ~~Gợi ý nhà vận chuyển (điểm tổng hợp quãng đường chạy・thực tế・giao đồng thời・chi phí) là **tạm thời**, cũng có thể chọn nhà vận chuyển ngoài gợi ý 〔Yêu cầu REQ-DL-132〕.~~ (Hủy 2026/10/01・P10-6: không làm gợi ý) **Không làm tìm kiếm theo tổ hợp thứ giao hàng (thứ ○ của tuần 1 tuần 3 v.v.)**, thay vào đó kiểm tra bằng tìm kiếm theo địa chỉ của lịch giao hàng (15-2) và thứ đáp ứng・phí của master nơi giao hàng ủy thác (3-3) (bổ sung 2026/09/30) 〔Bảng yêu cầu dòng 28・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕. Lịch trước được nắm qua trang chuyên dụng của công ty giao hàng (11-6).
- **Depot giao hàng (nhà vận chuyển không có hệ thống logistics riêng・ứng dụng tài xế)**: tạo dữ liệu giao hàng dựa trên ID, cập nhật trạng thái khi nhận tại kho picking・khi hoàn tất giao hàng để theo dõi tiến độ. Hỗ trợ chính thức sẽ xem xét lại từ Giai đoạn 3 trở đi 〔Nguồn gốc: yêu cầu §8G REQ-DL-715 (09/29)〕.
- **Cách hiển thị dự kiến và xác nhận** 〔Quyết định v2.3 #34〕: Xác nhận (sau hạn chót đơn hàng) là toàn bộ hạng mục (tên cơ sở・địa chỉ・ngày giao・nhiệt độ hàng・số lượng・điều kiện giao hàng・vận đơn). Dự kiến (trước hạn chót) **đến chu kỳ tháng sau・chỉ ngày giao・tên cơ sở・nhiệt độ hàng・số bản ghi** (không hiển thị số lượng・dấu "Dự kiến"). Màn hình tái sử dụng "Lịch tháng・tuần・ngày" của vận hành **bằng theme carrier**, không làm màn hình mới.

---
