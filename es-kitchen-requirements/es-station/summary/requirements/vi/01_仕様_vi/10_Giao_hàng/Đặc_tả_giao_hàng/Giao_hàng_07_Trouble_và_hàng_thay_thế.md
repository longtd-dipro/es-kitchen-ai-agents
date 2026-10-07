# Đặc tả giao hàng: Sự cố・Giao lại・Giao một phần・Hàng thay thế (§13)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (chia theo từng chương ngày 2026-10-03. Nội dung giữ nguyên tại thời điểm chia) -->

## 13. Sự cố・Giao lại・Giao một phần・Hàng thay thế

### 13-1. Loại sự cố (master・6 phân loại)

Những phân loại vốn khác nhau theo từng màn hình của ứng dụng được **thống nhất thành master 6 phân loại**. **Loại sự cố được giữ trong master**, gắn xử lý mặc định của vận hành cho từng phân loại [Chu kỳ §4A-4B] [Yêu cầu REQ-DL-657] [Luồng sự cố §4].

| Loại | Xử lý mặc định | Bản ghi con tự động (cùng lúc với báo cáo) [Quyết định v2.3 #30] |
|---|---|---|
| **Sai lệch số lượng (thiếu・thừa)** | **Nhân bản** phần thiếu để giao bổ sung, hoặc **không gửi** (1〜2 cái, v.v.・vận hành quyết định [Quyết định v2.3 #31])／phần thừa thì điều chỉnh lần sau | **Không tạo** |
| **Giao nhầm** | **Thu hồi ＋ nhân bản** để giao lại (13-7) | **Tạo** |
| **Hư hỏng・chất lượng kém** | Xử lý bằng **hàng thay thế**, hoặc **đăng ký hủy bỏ** (13-6) | **Tạo** |
| **Vắng mặt・không thể nhận** | **Nhân bản** để giao lại (13-4) | **Tạo** |
| **Chậm trễ (kẹt xe・tai nạn・thời tiết)** | Quay lại trong ngày, hoặc **nhân bản** sang ngày hôm sau. **Khi lần giao hàng chỉ có chậm trễ nhận được báo cáo giao đủ toàn bộ thì tự động giải quyết** [Quyết định v2.3 #32] | **Không tạo** |
| **Khác** | Bắt buộc nhập lý do, vận hành quyết định riêng từng trường hợp | **Không tạo** |

**Việc tạo／không tạo bản ghi con tự động được giữ trong master (`trouble_types.auto_child`) và vận hành (logistics) có thể thay đổi** [Quyết định v2.3 #33]. Loại tại thời điểm báo cáo được quyết định theo bảng đối ứng với ứng dụng bên dưới, và **"Thiếu hàng・giao nhầm" là loại chưa xác định nên không tạo** (khi vận hành gán 1 trong 6 phân loại, nếu là loại phải tạo thì tạo).

**Đối ứng giữa lựa chọn của ứng dụng và 6 phân loại** — **Giữ nguyên màn hình ứng dụng tài xế (đã xác định), và phía vận hành đối ứng với 6 phân loại của master** [Quyết định #66] [Yêu cầu REQ-DL-853]. Không sửa đổi để đưa lựa chọn của ứng dụng về đúng 6 phân loại.

| Lựa chọn của ứng dụng (màn hình đã xác định) | Nguồn | Phân loại master 6 loại được đối ứng |
|---|---|---|
| Thiếu số thùng | Màn hình báo cáo thuộc nhóm nhận hàng | **Sai lệch số lượng (thiếu・thừa)** |
| Giao nhầm | Màn hình báo cáo thuộc nhóm nhận hàng | **Giao nhầm** |
| Hàng hư hỏng | Màn hình báo cáo thuộc nhóm nhận hàng | **Hư hỏng・chất lượng kém** |
| Thiếu hàng・giao nhầm | Màn hình báo cáo thuộc nhóm giao hàng | **Sai lệch số lượng (thiếu・thừa)** hoặc **Giao nhầm** — **vận hành phân loại** (không tự động phán đoán) |
| Kẹt xe・tai nạn | Màn hình báo cáo thuộc nhóm giao hàng | **Chậm trễ (kẹt xe・tai nạn・thời tiết)** |
| Vắng mặt・không liên lạc được | Màn hình báo cáo thuộc nhóm giao hàng | **Vắng mặt・không thể nhận** |
| Khác | Cả nhóm nhận hàng và nhóm giao hàng | **Khác** (bắt buộc có lý do) |

- Giá trị gửi lên từ ứng dụng được **giữ nguyên văn** (`trouble_reports.app_reason_raw`), vận hành gán `type_code` của 6 phân loại khi xử lý sự cố. **Cho đến khi gán phân loại và giải quyết, báo cáo sự cố vẫn ở trạng thái chưa giải quyết và nằm trong cần xác nhận** (không thay đổi trạng thái của dữ liệu giao hàng [Quyết định v2.3 #20]. Cũ: cho đến khi gán phân loại thì ở trạng thái Đang xác nhận. Bãi bỏ ngày 2026/09/24) [Chu kỳ §4A-4B]. Xử lý mặc định chỉ là **gợi ý ứng viên**, người chọn cuối cùng là vận hành (**bắt buộc nhập lý do**). Người báo cáo không chỉ là tài xế mà ở **chuyến giao trực tiếp mà final leg là công ty vận tải thì là liên hệ từ doanh nghiệp・cơ sở hoặc công ty vận chuyển**, nên chuẩn bị lối vào để **vận hành có thể đăng ký thay** [Yêu cầu REQ-DL-657].

### 13-1B. Chi tiết thực tích (`delivery_lines`)

Thực tích giao hàng được giữ **theo từng sản phẩm** chứ không chỉ tổng của dữ liệu giao hàng [Quyết định v2.3 #8] [Yêu cầu REQ-DL-902]. Nơi đặt là `delivery_lines` (`UNIQUE(delivery_id, product_id)`).

| Khi nào ghi | Ghi gì |
|---|---|
| **Tạo xác định (materialize)** | Đưa số lượng xác định theo từng sản phẩm của đơn hàng vào `planned_qty`. Nếu đơn hàng không có chi tiết theo từng sản phẩm thì tại thời điểm này không tạo |
| **Nhập thực tích xuất hàng** | Nếu có chi tiết theo từng sản phẩm thì ghi vào `planned_qty` (nếu không có thì giữ giá trị tạo từ đơn hàng khi tạo xác định) [Bản gốc: DEV §11] |
| **Báo cáo giao hàng (ứng dụng tài xế)** | `delivered_qty`／tồn kho thực tế trước và sau khi trưng bày `stock_before`・`stock_after`／hủy bỏ `disposed_qty` (~~`expiry_date` của phần đã giao~~ xóa 2026/10/01: không theo dõi hạn sử dụng) |
| **Sự cố chênh lệch số lượng (`qty_diff`)** | `delivered_qty` theo từng sản phẩm. **Tổng phải khớp với `deliveries.delivered_qty`** |

**Khi giao từng phần, dữ liệu giao hàng con có `delivery_lines` riêng** (`planned_qty`＝số lượng còn lại). **Không ghi đè chi tiết của bản ghi cha** [Quyết định v2.3 #8]. Vì **khác** với `contract_delivery_lines` (cài đặt chi tiết giao hàng) phía hợp đồng nên không được nhầm lẫn.

### 13-2. Luồng xử lý

> **Thao tác của tài xế sau khi báo cáo sự cố** (bổ sung 2026/10/01・P10-7): Sau khi báo cáo, tài xế vẫn có thể tiếp tục nhập bước・hoàn tất. Khi vận hành đăng ký cách giải quyết (`resolution`), tài xế không thể sửa thực tích của lần giao hàng đó (ưu tiên hơn thời hạn sửa 7 ngày sau khi hoàn tất).

**Lối vào báo cáo**

| Lối vào | Ai | Từ đâu |
|---|---|---|
| Báo cáo sự cố của ứng dụng tài xế | Tài xế | Chọn đối tượng từ danh sách giao hàng → biểu mẫu báo cáo tình hình → chọn cơ sở → gửi loại＋hình ảnh＋ghi chú [Yêu cầu REQ-DL-148] |
| "Hoàn tất khi còn một phần chưa nhận" của nhận hàng | Tài xế | Đưa vào cần xác nhận cùng số phiếu vận chuyển chưa nhận [Yêu cầu REQ-DL-644] |
| "Hoàn tất khi còn một phần chưa giao" của chuyến giao COOL | Tài xế | Phần chưa giao được tạo thành bản ghi con theo nhánh [Yêu cầu REQ-DL-649] |
| Đăng ký thay | Vận hành | Vận hành nhập liên hệ từ doanh nghiệp・cơ sở・công ty vận chuyển (**chuyến mà final leg là công ty vận tải thì đây là chính**) [Yêu cầu REQ-DL-657] |

**Phán đoán của vận hành** (`locked` có nghĩa là "**không ghi đè kế hoạch (ngày)**", vẫn có thể đăng ký thực tích・thay đổi `delivery status`・thêm bản ghi tiếp theo. **Không ghi đè ghi chép trong quá khứ, xử lý bằng hủy hoặc nhân bản**) [Chu kỳ §4A-4B] [Luồng sự cố §1]

| Tình huống | Quy trình |
|---|---|
| **① Biết không thể xuất hàng từ trước khi xuất** (hỏng thiết bị kho・không sắp xếp được xe・tuyết lớn, v.v.) | ①**Hủy** dữ liệu giao hàng (bắt buộc có lý do・lưu vào lịch sử) → ②**gửi lại chỉ thị xuất hàng với số lượng 0** để vô hiệu hóa (không có I/F hủy. Sau khi bắt đầu picking thì liên lạc qua điện thoại) → ③chuyến thay thế **tạo dữ liệu giao hàng mới bằng nhân bản** (bản gốc để lại là hủy) → ④Web doanh nghiệp hiển thị **"Đang điều chỉnh ngày giao hàng"**, truyền đạt tình hình bằng bình luận của vận hành (**không hiển thị chữ "Hủy" cho doanh nghiệp**. Tên hiển thị được giữ tách khỏi trạng thái・15-10) [Quyết định v2.3 #42] [Luồng sự cố §2] (cũ: hiển thị cho doanh nghiệp là "Đang xác nhận". Trùng với tên trạng thái "Đang xác nhận" chỉ của bản ghi con nên thay thế ngày 2026/09/29) |
| **② Sự cố sau khi xuất hàng・đang giao** | Dù nhận báo cáo cũng **không thay đổi `delivery status`** (giữ Đã xuất hàng／Đã nhận. Liên hệ sau khi giao thì giữ Đã giao). Ghi lại báo cáo sự cố và mở cần xác nhận, vận hành (logistics) chọn một trong **giao lại／hàng thay thế／hủy bỏ／dừng** và **trực tiếp đóng bản ghi cha** [Quyết định v2.3 #20・#21] [Yêu cầu REQ-DL-650] (cũ: đặt `delivery status` thành Đang xác nhận. Bãi bỏ ngày 2026/09/24) |
| **③ Yêu cầu thay đổi từ doanh nghiệp sau `locked`** | Không nhận đơn yêu cầu thay đổi từ hệ thống. Vận hành điều chỉnh ngoài hệ thống và xử lý bằng giao lại ở ② hoặc hủy＋nhân bản ở ①. **Không ghi đè kế hoạch hồi tố** |

**Giải quyết sự cố — vận hành (logistics) trực tiếp đóng bản ghi cha** [Quyết định v2.3 #21] (**trạng thái được quyết định theo lượng giao được**. Hàng thay thế và hủy bỏ không phải là trạng thái mà là xử lý kèm theo) [Chu kỳ §4A-3B・§4A-4B] [Luồng sự cố §3.1] [DEV §13.2.1・§15.12]. Batch không quyết định cách giải quyết của bản ghi cha.

| Tình huống | Bản ghi gốc (điểm xuất phát) | Bản ghi con nhân bản (khi chưa có bản ghi con tự động) | Khi có bản ghi con tự động (cùng transaction) |
|---|---|---|---|
| Giao được toàn bộ (bao gồm hàng thay thế). Phần thừa điều chỉnh lần sau | **Đã giao** (từ Đã xuất hàng／Đã nhận／Đã giao) | — | **Hủy** (lý do `auto child not needed`) |
| Giao được một phần, số còn lại gửi sau | **Đã giao một phần** (xác định theo số lượng thực giao. Từ Đã xuất hàng／Đã nhận) | Số còn lại ＋ **ngày giao tạm** ＋ **Đang xác nhận** | **Tái sử dụng**: `duplicate_type=remainder`, số lượng・chi tiết＝số còn lại |
| Không giao được gì và gửi lại | **Chờ giao lại** (giữ nguyên số lượng. Từ Đã xuất hàng／Đã nhận) | Toàn bộ ＋ **ngày giao lại tạm** ＋ **Đang xác nhận** | **Tái sử dụng**: `duplicate_type=redelivery`, số lượng・chi tiết＝toàn bộ |
| Kết thúc mà không giao | **Dừng** (thực tích 0・bắt buộc có lý do. Từ Đã xuất hàng／Đã nhận) | — | **Hủy** |
| Quay lại trong ngày (chậm trễ, v.v.) | **Đã nhận** (từ Đã xuất hàng／Đã nhận) | — | **Hủy** |
| **Giao được một phần, phần còn lại không gửi** [Quyết định v2.3 #31] | **Đã giao một phần** (xác định theo số lượng thực giao. Từ Đã xuất hàng／Đã nhận. Không có ngưỡng・vận hành quyết định・bắt buộc có lý do) | — | **Hủy** |
| **Xác nhận chưa đến sau khi coi như hoàn tất** [Quyết định v2.3 #27] | **Chờ giao lại**／**Dừng** (**từ Đã giao có `completion_source = presumed`**. Sau khi nhờ Yamato điều tra) | Nếu Chờ giao lại thì Toàn bộ ＋ **Đang xác nhận** | Nếu Chờ giao lại thì **tái sử dụng**／nếu Dừng thì **hủy** |

- **Việc giải quyết được thực hiện gộp theo đơn vị lần giao hàng** [Quyết định v2.3 #29]. Đóng tất cả báo cáo sự cố chưa giải quyết của lần giao hàng đó trong 1 lần, ghi cùng nội dung giải quyết・ngày giờ・người giải quyết vào từng báo cáo.
- Điều kiện giải quyết: báo cáo sự cố chưa giải quyết・bản ghi cha là Đã xuất hàng／Đã nhận／Đã giao・nếu có bản ghi con tự động thì là `Đang xác nhận`・bắt buộc có lý do. Khóa bản ghi cha・báo cáo sự cố chưa giải quyết・bản ghi con tự động, và thực hiện **giải quyết bản ghi cha＋cập nhật／hủy bản ghi con＋giải quyết cần xác nhận `trouble_open`・`trouble_auto_child_pending`＋kiểm toán trong 1 transaction** [Quyết định v2.3 #24・#26・#29] [DEV §15.12・§17.1].
- **Chưa đến sau khi coi như hoàn tất**: không thanh toán. Nếu thanh toán đã xác định thì không truy thu mà điều chỉnh vào tháng sau (14-3). **Trường hợp chỉ một phần thùng hàng không đến là chưa quyết** (§18 No.23). **Dù có bản ghi con tự động cũng không tạo bản ghi con thứ 2.**
- (Cũ: "Lối ra từ Đang xác nhận". Đặt bản ghi cha nhận sự cố thành Đang xác nhận rồi chuyển sang Đã giao／Đã giao một phần／Chờ giao lại／Dừng／Đã nhận. Bãi bỏ ngày 2026/09/24 [Quyết định v2.3 #20・#21])

**Bản ghi con tự động của sự cố được tạo cùng lúc với báo cáo** [Quyết định v2.3 #23・#24・#28〜#30] [DEV §13.2.1・§15.12.1] (cũ: "Sự cố chưa được giải quyết đến hạn — bản ghi con tự động". `auto_duplicate_due_at`＝batch `trouble_auto_duplicate` tạo khi quá báo cáo＋số phút của cài đặt vận hành. Bãi bỏ ngày 2026/09/29)

- **Khi nào**: khi **đăng ký** báo cáo sự cố (tài xế・công ty vận chuyển ủy thác・vận hành đăng ký thay), và khi vận hành **gán／gán lại loại**. Không có thời hạn・cài đặt số phút・batch.
- **Điều kiện tạo**: loại **được tạo bản ghi con tự động** trong master loại (giao nhầm・vắng mặt・hư hỏng)／lần giao hàng xảy ra sự cố là Đã xuất hàng・Đã nhận・Đã giao／lần giao hàng đó **chưa có bản ghi con tự động còn hiệu lực**. **Chỉ vì lần giao hàng chưa hoàn tất thì không tạo.** Loại chưa xác định ("Thiếu hàng・giao nhầm") không tạo. Nếu gán lại từ loại có tạo sang loại không tạo thì bản ghi con đã tạo không tự động bị xóa (hủy khi giải quyết).
- **Cái được tạo**: `Đang xác nhận`・`duplicate_type=trouble_pending`・`creation_source=trouble_auto`・`source_trouble_delivery_id` (lần giao hàng xảy ra sự cố)・`source_trouble_report_id` (báo cáo đầu tiên)・`schedule_confirmed=false`・`quantity_confirmed=false`. Giống nhân bản, sao chép snapshot nơi giao・điều kiện giao hàng・khung giờ nhận・toàn bộ `delivery_legs`, không sao chép phiếu vận chuyển・phân công・tệp đính kèm (cha con 1 cấp・số nhánh 1〜9・§8-4). **Không đặt bản ghi cha thành `Đang xác nhận`.** Nếu sự cố xảy ra ở bản ghi con thì tạo như **nhánh kế tiếp của bản ghi cha** [Quyết định v2.3 #28].
- **Giá trị tạm**: ngày ứng viên là **giá trị tạm để hiển thị**. Số lượng・chi tiết là **giá trị tạm của lượng tối đa có thể phải gửi lại**, không dùng cho xuất hàng・thanh toán.
- **Mỗi lần giao hàng có tối đa 1 bản ghi con tự động còn hiệu lực.** Từ báo cáo thứ 2 trở đi không tạo mà tái sử dụng bản ghi con hiện có. `UNIQUE(source_trouble_delivery_id) WHERE creation_source = 'trouble_auto' AND status <> 'Hủy'` là chốt chặn cuối [Quyết định v2.3 #29].
- **Dù là loại không tạo, báo cáo sự cố chưa giải quyết vẫn nằm trong cần xác nhận (`trouble_open`).** Ngăn bỏ sót xử lý ở đây [Quyết định v2.3 #30].
- **Cần xác nhận**: tạo・cập nhật `review_items.kind = trouble_auto_child_pending` (đối tượng là bản ghi con).
- **Trước khi xác định không tham gia vào bất cứ thứ gì**: nằm ngoài đối tượng của chỉ thị xuất hàng・phiếu vận chuyển・phân công tài xế・thanh toán・thông báo・coi như hoàn tất [Quyết định v2.3 #23].
- **Chuyển sang chờ xuất hàng**: chỉ khi vận hành (logistics) giải quyết sự cố của bản ghi cha, xác định số lượng・ngày giao và đặt `quantity_confirmed=true`・`schedule_confirmed=true` thì `Đang xác nhận → Chờ xuất hàng` (chưa xác định thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`). Với cách giải quyết không cần gửi lại, trong cùng transaction `Đang xác nhận → Hủy` (bắt buộc có lý do) [Quyết định v2.3 #24].

**Trạng thái ngoại lệ luôn phải có lý do và lịch sử** [Chu kỳ §4A-4C] [Luồng sự cố §1] — ①**Loại・lý do** chọn từ master 6 phân loại và có thể thêm văn bản bổ sung (đồng thời lưu nguyên văn của ứng dụng `app_reason_raw`, hiển thị **lý do・ngày giờ đăng ký・người đăng ký** bên cạnh trạng thái). ②**Lịch sử thay đổi** ghi 1 dòng mỗi khi trạng thái thay đổi (`Đã nhận → Dừng: người phụ trách nhận vắng mặt`). **Không tạo thay đổi trạng thái không có trong lịch sử.** ③**Liên kết cha con**: hiển thị nơi nhân bản ở bản ghi cha và nguồn nhân bản ở bản ghi con để có thể chuyển màn hình qua lại, kèm số lượng・trạng thái・ngày giao (ảnh của báo cáo sự cố được lưu **12 tháng** kể từ khi hoàn tất giao hàng・12-4).

- **Báo cáo sự cố chưa giải quyết và bản ghi con `Đang xác nhận` không phải trạng thái cuối cùng.** Giữ trong "cần xác nhận" của lịch trình vận hành cho đến khi quyết định cách xử lý. Nếu để lại trạng thái dừng không có lý do thì thanh toán và kiểm toán không thể giải thích "tại sao không đến" [Chu kỳ §4A-4C]. Lưu ý, `01_仕様/10_Giao_hàng/Thiết_kế_màn_hình_Báo_cáo_trouble_V1.0.md` là **tài liệu thiết kế của màn hình khác để khách hàng báo cáo sự cố thiết bị (cấp thoát nước・điều hòa) cho nhà thầu**, **không phải tài liệu về sự cố giao hàng** [Luồng sự cố §11]. Nguồn của mục này là [Chu kỳ §4A-4B・§4A-4C] và [Luồng sự cố §1〜§5].

### 13-3. Giao một phần

Dùng thuật ngữ **giao một phần** (không viết là "giao bộ phận"). Giá trị trạng thái là **Đã giao một phần** [Chu kỳ §4A-3B].

1. **Phần giao được thì tiến hành trước.** Bản ghi gốc **xác định theo số lượng thực giao**, hoàn tất ngay tại chỗ như Đã giao một phần (**trạng thái cuối của bản ghi đó**・7-7). Chi tiết theo từng sản phẩm được đưa vào **chi tiết thực tích `delivery_lines`** [Quyết định v2.3 #8]. Không dừng thực tích cho đến khi quyết định xử lý số còn lại [Chu kỳ §4A-4C] [Luồng sự cố §3.2].
2. **Số còn lại (bản ghi con) được tạo ở "Đang xác nhận".** **Nếu có bản ghi con tự động thì không tạo mới mà tái sử dụng** (`duplicate_type=remainder`, `delivery_lines` thành số còn lại) [Quyết định v2.3 #21]. Ngày nhập ở màn hình xử lý được giữ như **ngày giao tạm**, ngày picking được đặt tính ngược từ ngày giao tạm [Yêu cầu REQ-DL-649-2].
3. **Đưa vào cần xác nhận.** Hiển thị trong cần xác nhận của lịch trình vận hành như "chờ xử lý số còn lại".
4. **Vận hành xác nhận và xác định.** Để chuyển sang chờ xuất hàng, cả `schedule_confirmed` và `quantity_confirmed` phải là true (10-1) [Quyết định v2.3 #24]. Có 3 kết quả — **xác định theo ngày này** (→ Chờ xuất hàng)／**đổi ngày** (khi quyết định lại thì → Chờ xuất hàng)／**dừng** (→ Dừng). Tất cả đều ghi vào lịch sử thay đổi cùng lý do.

- Việc không chuyển sang chờ xuất hàng cho đến khi qua xác nhận là **để ngăn việc ngày tạm vẫn trôi vào chỉ thị xuất hàng (gom 2 tuần・thứ Sáu 3 ngày trước khi bắt đầu)**. **Bản nhân bản đang xác nhận nằm ngoài đối tượng của chỉ thị xuất hàng**, không tạo trạng thái dữ liệu giao hàng có lịch sử chỉ thị xuất hàng mà lại đang xác nhận [Yêu cầu REQ-DL-801]. **Một phần chưa nhận・giao một phần được xác định theo đơn vị phiếu vận chuyển.** Phiếu vận chuyển và dữ liệu giao hàng là **1 nhiều** (1 dữ liệu giao hàng có nhiều số phiếu vận chuyển＝theo từng thùng), **1 phiếu vận chuyển không chứa nhiều dữ liệu giao hàng** (＝không có gộp xuất hàng), nên từ phiếu vận chuyển luôn truy ra đúng 1 dữ liệu giao hàng [Quyết định #54] [Yêu cầu REQ-DL-833]. "Nhãn phần chưa giao" mà chuyến giao COOL từng tự động tạo không còn được tạo, thống nhất thành **bản ghi con theo nhánh (nhân bản)** [Yêu cầu REQ-DL-649].

### 13-4. Giao lại

| Mục | Nội dung | Nguồn |
|---|---|---|
| Cách tạo | **Nhân bản** bản gốc để tạo bản ghi con theo nhánh. Ngày giao mới・số phiếu vận chuyển do bản ghi con giữ, bản gốc để lại là "**Chờ giao lại**". **Nếu có bản ghi con tự động thì tái sử dụng**, ghi lại thành `duplicate_type=redelivery`・toàn bộ số lượng (không tạo bản thứ 2) | [Chu kỳ §4A-4B] [Quyết định v2.3 #21] |
| Trạng thái ban đầu của bản ghi con | **Đang xác nhận ＋ ngày giao lại tạm** (cách xử lý giống 13-3. Nằm ngoài đối tượng chỉ thị xuất hàng cho đến khi vận hành xác định) | [Yêu cầu REQ-DL-649-2・801] |
| Nội dung bản ghi con | Khi giao lại có thể đổi nội dung・ngày giao, và để lại xử lý lần sau trong ghi chú | [Bản gốc: Yêu cầu §7] [Yêu cầu REQ-DL-161] |
| Phân công tài xế | **Không kế thừa.** Phân công lại theo ngày giao lại (12-1) | [Chu kỳ §4B-1] |
| Thanh toán sản phẩm | **Không thay đổi** | [Chu kỳ §4D-1] |
| Thanh toán cước vận chuyển | **Không đồng loạt mà quyết định riêng.** Dữ liệu giao hàng giữ cờ "**thanh toán／không thanh toán**" **`freight_billable`** (**mặc định là "không", khi đặt "có" thì bắt buộc có lý do**). **Cờ này cũng dùng cho dừng** (13-6・14-2) [Quyết định v2.3 #40] (tên cũ `redelivery_billable`. Đổi tên ngày 2026/09/29). Hàng tháng có thể tổng hợp "**giao lại được thanh toán do lý do của khách**" | [Chu kỳ §4D-1] [Yêu cầu REQ-DL-660] [Quyết định v2.3 #40] |
| Chỉ thị xuất hàng | **Gắn số nhánh** vào số chỉ thị (Thomas xử lý như ID duy nhất) | [Yêu cầu REQ-DL-114] |

### 13-5. Nhân bản (bổ sung từ góc nhìn xử lý sự cố)

Quy trình nhân bản・mục sao chép／không sao chép・cách gắn số nhánh・phân chia số lượng được **hợp nhất vào §8-4**. Ở đây chỉ ghi bổ sung từ góc nhìn xử lý sự cố.

- **Chỉ có thể nhân bản từ dữ liệu giao hàng `published` hoặc `locked`. Không thể nhân bản từ `draft`** [Quyết định v2.1 #5] [Yêu cầu REQ-DL-872] (cũ: lần 1 "nhân bản có thể thực hiện từ bất kỳ `draft` / `published` / `locked` nào" đã **hủy**). **Ở `draft` (kế hoạch giao hàng) chỉ có thể "sao chép／thay đổi kế hoạch"**, **nhân bản đi kèm `parent_delivery_id`・số nhánh・trạng thái Đang xác nhận chỉ thực hiện từ `published` / `locked`**. Vì kế hoạch không có dữ liệu giao hàng, không có phiếu vận chuyển và thực tích, nên dù tạo quan hệ cha con cũng không có đích để chỉ tới, và khi tạo xác định sẽ tạo cha con 2 lần [Chu kỳ §4A-4C].
- **Mỗi lần giao hàng xảy ra sự cố có tối đa 1 bản ghi con còn hiệu lực.** Nhân bản thủ công cũng tái sử dụng nếu lần giao hàng đó đã có bản ghi con (bao gồm bản ghi con tự động), bản thứ 2 bị từ chối với `DOMAIN_TROUBLE_CHILD_EXISTS` [Quyết định v2.3 #21・#29] (8-4). Nhân bản thủ công do vận hành (logistics), tạo bản ghi con tự động do hệ thống (cùng transaction với đăng ký báo cáo・kiểm toán là `actor_type=system`) [Quyết định v2.3 #30].
- **Vì nhân bản là tạo mới và không ghi đè bản gốc nên có thể thực hiện cả khi `locked`.** Khi muốn đổi ngày sau `locked`, xử lý bằng **hủy＋nhân bản** chứ không ghi đè ngày [Quyết định v2.1 #1] (§8-4).
- Chỉ **vận hành (logistics)** thực hiện được, **bắt buộc chọn lý do (giao từng phần／giao lại／chuyến thay thế／gửi trả／khác) và nhập văn bản lý do**, và ghi vào lịch sử thay đổi [Quyết định v2.3 #41]. Bản ghi đã nhân bản được đưa vào **cần xác nhận** để ngày・phiếu vận chuyển・tài xế chưa đặt không trôi vào chỉ thị xuất hàng [Chu kỳ §4A-4C]. Cách dùng: **giao từng phần**＝xác định bản gốc theo phần giao được và đưa phần còn lại vào bản ghi con (bản gốc là Đã giao một phần)／**giao lại**＝đưa phần không đến vào bản ghi con (bản gốc là Chờ giao lại)／**chuyến thay thế**＝trước khi xuất hàng đặt bản gốc là Hủy và gửi toàn bộ bằng bản ghi con có tuyến khác／**gửi trả**＝gửi sản phẩm còn lại bằng bản ghi con đến nơi nhận trả như trụ sở (`duplicate_type = return`. **Chỉ trường hợp này mới đổi được nơi giao sang nơi nhận trả**. Không thanh toán) [Quyết định v2.3 #41].

### 13-6. Hàng thay thế

| Sự việc | Cách xử lý | Nguồn |
|---|---|---|
| **Xử lý bằng hàng thay thế** | **Thanh toán theo giá của sản phẩm gốc (hạng mục gốc)**. Chênh lệch giá vốn của hàng thay thế do ES chịu (14-2). Đăng ký hàng thay thế và phản ánh vào phiếu giao hàng mà khách hàng tải về. **Cách ghi nhận**: 1 dòng của `delivery_lines`＝**sản phẩm thực tế đã giao**, nhập **sản phẩm gốc được thay thế vào `substituted_from_product_id`**. **Thanh toán tính theo đơn giá của sản phẩm gốc**. Đăng ký khi chọn "giao đủ toàn bộ bằng hàng thay thế" trong giải quyết sự cố (chọn sản phẩm) và khi sửa thực tích (chỉ vận hành・bắt buộc có lý do) [Quyết định v2.3 #39] | [Chu kỳ §4D-1] [Luồng sự cố §7] [Yêu cầu REQ-DL-316] [Quyết định v2.3 #39] |
| **Cài đặt hàng thay thế (sản phẩm lỗi・vận hành › Quản lý menu)** | Quyết định 2026/10/01 (Đặc tả yêu cầu chi tiết xử lý hàng thay thế §7-1): **3 mẫu ① thay thế／② bồi thường／③ chỉ loại trừ**. Sửa đồng thời chi tiết của đơn hàng và dữ liệu giao hàng, nhập hàng gốc vào chi tiết (`substituted_from_product_id`) (cùng cách ghi nhận như hàng thay thế của sự cố). Sau khi đã gửi chỉ thị xuất hàng thì gửi lại có số phiên bản (rev+1) đến trước ngày xuất hàng 1 ngày, từ ngày xuất hàng trở đi thì bồi thường. Bồi thường thì cộng vào chuyến tiếp theo (nếu không có・xa thì giao bổ sung＝nhân bản・phí giao hàng ES chịu). Thanh toán: thay thế＝đơn giá gốc, bồi thường＝thêm dòng 0 yên vào quyết toán thực tích, chỉ loại trừ＝không thanh toán. Sản phẩm lỗi còn tại cơ sở được ghi nhận là hủy bỏ (không tính là hao hụt quản lý). Lô lỗi của kho thì dừng xuất hàng (trả hàng／hủy bỏ). Hiển thị "Hàng thay thế (gốc: 〇〇)" ở danh sách giao hàng (tài xế・ủy thác) và Web doanh nghiệp (chi tiết giao hàng・phiếu giao hàng・đơn hàng hằng tháng・thông báo・email X17) | [Quyết_định_Cài_đặt_hàng_thay_thế_3_mẫu_và_hạ_nguồn_20261001] |
| **Xuất từ kho khác** | **Coi là hàng thay thế** (bao gồm cả xuất từ kho khác để xử lý sản phẩm lỗi). Nếu kho đích không xử lý sản phẩm đó thì chọn lại sản phẩm, nếu có xử lý thì có thể nhân bản nguyên trạng | [Chu kỳ §4A-4C] [Yêu cầu REQ-DL-678] |
| **Hủy bỏ** | Đăng ký hủy bỏ và hiệu chỉnh tồn kho (khi đồ đông lạnh tan chảy, v.v.). **Không thanh toán vì chưa giao. Phần hủy bỏ không quay lại đâu cả.** Hàng thực còn lại **gửi đến trụ sở, v.v. bằng lý do nhân bản "gửi trả"** (`duplicate_type = return`・đổi nơi giao sang nơi nhận trả của master kho・số lượng là số còn lại・**không thanh toán**. 8-4) [Quyết định v2.3 #41] (cũ: tạo 1 dữ liệu giao hàng và gửi với nơi giao là "trụ sở". Chưa quyết cách tạo) | [Chu kỳ §4A-4B・§4D-1] [Quyết định v2.3 #41] |
| **Dừng** | Kết thúc mà không giao. Xác định với thực tích 0, **loại khỏi đối tượng thanh toán của tháng hiện tại. Không chuyển sang lần sau**. **Cước vận chuyển dùng chung `freight_billable` với giao lại** (mặc định "không", "có" thì bắt buộc có lý do). Hủy bỏ là `delivery_lines.disposed_qty`, sản phẩm còn lại là "gửi trả" [Quyết định v2.3 #40・#41] | [Chu kỳ §4D-1] [Quyết định v2.3 #40] |

- **Hàng thay thế và hủy bỏ không phải là `delivery status`.** Trạng thái được quyết định theo lượng giao được (13-2) [Chu kỳ §4A-4B].

### 13-7. Thu hồi giao nhầm

**Thu hồi chỉ ghi nhận trong báo cáo sự cố** [Quyết định #68] [Yêu cầu REQ-DL-854]. **Không tạo mục chuyên dụng** như ngày thu hồi・người thu hồi・số lượng thu hồi・nơi đến của hàng thu hồi.

- Xử lý mặc định là **thu hồi ＋ nhân bản để giao lại** (13-1) [Chu kỳ §4A-4B]. Cả thu hồi và giao lại đều do **vận hành (logistics) phán đoán・thực hiện** và **ghi vào lịch sử thay đổi kèm lý do**. Dù nhận báo cáo giao nhầm cũng không thay đổi trạng thái của dữ liệu giao hàng, và vẫn nằm trong cần xác nhận cho đến khi quyết định cách xử lý với tư cách báo cáo sự cố (13-2) [Quyết định v2.3 #20] (cũ: dữ liệu giao hàng trở thành Đang xác nhận. Bãi bỏ ngày 2026/09/24). Phần giao lại được tạo thành **bản ghi con theo nhánh**, bản ghi con được khởi tạo ở **Đang xác nhận ＋ ngày giao tạm** (13-3・13-4・§8-4) [Yêu cầu REQ-DL-649-2].

---
