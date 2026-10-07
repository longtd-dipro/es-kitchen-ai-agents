# Đặc tả giao hàng: Cấu trúc hai tầng của việc sinh dữ liệu・Thay đổi・Khóa・Tạm ngừng・Hủy hợp đồng (§7, §8)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (tách theo chương ngày 2026-10-03. Nội dung giữ nguyên như thời điểm tách) -->

## 7. Cấu trúc hai tầng của việc sinh dữ liệu (Kế hoạch giao hàng và Dữ liệu giao hàng)

### 7-1. Vai trò của hai tầng

**Hình 4: Hai máy trạng thái** (hiển thị dưới dạng hình trong bản HTML) — phía trên là `plan lifecycle` (draft／published／locked), phía dưới là `delivery status` (chờ xuất hàng ~ đã giao). Không gọi gộp chung là "trạng thái".

<!-- FIG: fig-two-layer -->

Hợp đồng được tự động cập nhật mỗi chu kỳ, trong khi chu kỳ giao hàng được thiết lập trước tối đa 6 tháng. Nếu giữ trong cùng một bản ghi thì không giải quyết được câu hỏi "có được tính lại kế hoạch đã tạo trước hay không", vì vậy **tách kế hoạch (kế hoạch giao hàng) và vận hành (dữ liệu giao hàng) thành hai tầng riêng** [Chu kỳ §4A-1] [Yêu cầu REQ-DL-607].

| Tầng | Bản ghi | Nguồn sinh | Thông tin nắm giữ | Tính lại | Công khai cho doanh nghiệp |
|---|---|---|---|---|---|
| Kế hoạch giao hàng (plan) | `shipping_plans` | Thiết lập chu kỳ giao hàng × thiết lập giao hàng của hợp đồng | Ngày giao・ngày picking・slot・kho được phân bổ・công ty vận chuyển・lead time thực tế・**số lượng dự kiến (`estimated_qty`)** | **Có** (tạo lại rồi áp dụng lại các override đã phê duyệt) | **Có (chỉ ngày. Không hiển thị số lượng)** |
| Dữ liệu giao hàng (delivery) | `deliveries` | Sinh chính thức (materialize) từ kế hoạch giao hàng | Như trên + số vận đơn・tuyến đường・tài xế・số lượng đơn hàng đã chốt・thực tích・thu tiền・tệp đính kèm | **Không** | Có (bao gồm số lượng・thực tích) |

**Việc tính ngày chỉ thực hiện ở kế hoạch giao hàng.** Dữ liệu giao hàng chỉ kế thừa từ kế hoạch chứ không tự tính lại (không giữ logic tính toán hai lần) [Chu kỳ §4A-1]. Kho・công ty vận chuyển được **gán theo hợp đồng ngay từ giai đoạn kế hoạch**, để ngay cả đơn đăng ký trước 6 tháng cũng có thể xác định ngày không thể xuất hàng・ngày không thể giao hàng ủy thác・thứ không thể giao hàng [Yêu cầu REQ-DL-611]. Việc yêu cầu・báo giá・gửi mail xác nhận thực tế cho công ty giao hàng ủy thác được thực hiện từ giai đoạn đã thành dữ liệu giao hàng trở đi (không phải là giữ chỗ trước 6 tháng).

**Kế hoạch giao hàng giữ nội bộ số lượng dự kiến** [Quyết định v2.1 S1] [Chu kỳ §4A-1] [Yêu cầu REQ-DL-882]

- `shipping_plans.estimated_qty` **luôn tồn tại**. Giá trị là số lượng tiêu chuẩn do chia số lượng gói của hợp đồng theo số lần giao hàng; khi sinh chính thức thì được chuyển sang `deliveries.planned_qty`, và được thay bằng số lượng đã chốt khi đến hạn chốt đơn hàng.
- **Trong lúc ở trạng thái `draft` chỉ là không hiển thị số lượng cho doanh nghiệp**, chứ **không phải "kế hoạch không có số lượng"**. Vì cần cho việc ước tính số lượng đơn・tải trọng, và cho số lượng tiêu chuẩn／tự động chốt ở chế độ AI (7-3) khi đến hạn chốt mà không có đơn hàng nào, nên nội bộ luôn giữ [Yêu cầu REQ-DL-810]. Khi schema đang giữ số lượng kế hoạch thì không được viết trong nội dung "kế hoạch không có số lượng". Không trộn lẫn chuyện hiển thị (8-9) với chuyện dữ liệu.

### 7-2. Khóa duy nhất của kế hoạch và việc sinh lại (thay thế)

**Khóa duy nhất của kế hoạch giao hàng là `contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** [Quyết định v2.1 #6] [Chu kỳ §4A-2・§7] [Yêu cầu REQ-DL-873].

`line_no` = số dòng chi tiết giao hàng, `channel_id` = phân loại giao hàng (nhiệt độ hoặc vật tư × kho × công ty vận chuyển), `cycle_id` = chu kỳ, **`occurrence_key` = giá trị chỉ định duy nhất lần giao này trong chu kỳ đó** (slot `A1`~`D7`, hoặc ngày chỉ định riêng "ngày N hàng tháng" "ngày cuối tháng hàng tháng").

- **Không dùng `(contract_id, delivery_date)`.** Một hợp đồng có thể có nhiều nhiệt độ・phân loại giao hàng trong cùng một ngày (lạnh và đông lạnh cùng ngày giao), nên không thể nhận diện bản ghi bằng ngày giao [Quyết định v2.1 #6]. **"Kế hoạch giao hàng là duy nhất theo (ID hợp đồng, ngày giao)" của REQ-DL-721 cũ bị hủy bỏ** [Yêu cầu REQ-DL-721・873].
- Ràng buộc của bảng là `UNIQUE (contract_id, line_no, channel_id, cycle_id, occurrence_key)` [Chu kỳ §7]. Cả sinh lần đầu và sinh lại đều đối chiếu theo khóa này, UPSERT như khóa idempotent.
- **Sinh lại là thay thế chứ không phải thêm** [Quyết định v2.1 #6] [Yêu cầu REQ-DL-873].

**Quy trình sinh lại** [Chu kỳ §4A-4]

① Xóa toàn bộ `draft` trong khoảng thời gian đối tượng (giữ lại `published` / `locked`. Không tạo ngoại lệ) ／ ② Tạo lại `draft` từ thiết lập (UPSERT theo khóa trên. Tuyến đường dùng snapshot của hợp đồng con nếu có, nếu không có thì dùng giá trị mặc định của hợp đồng cha 〈7-4〉. `estimated_qty` cũng được nhập ở đây) ／ ③ Ràng buộc nhận hàng của cơ sở đã có hiệu lực tại thời điểm sinh ở ② ／ ④ Áp dụng các override đã phê duyệt theo thứ tự thời điểm phê duyệt từ cũ đến mới (8-1) ／ ⑤ Nếu xung đột với `published` cùng khóa thì ưu tiên `published` (**các dòng khác nhiệt độ・phân loại giao hàng thì dù cùng ngày giao cũng không phải là xung đột**). Dữ liệu giao hàng sau khi sinh chính thức được liên kết 1-1 với kế hoạch qua `deliveries.shipping_plan_id` [Chu kỳ §7].

### 7-3. Thời điểm sinh

**Các mốc do phía menu quyết định (là chuẩn)** [Quyết định #33] [Chu kỳ §4A-2] [Yêu cầu REQ-DL-840・740]. Không tính toán ở phía chu kỳ giao hàng, mà khi sinh chu kỳ thì sao chép ngày thực tế của menu và lưu giữ (`delivery_cycles.menu_open_date` / `order_start_date` / `order_close_date`). Màn hình・phán định của batch・lịch của doanh nghiệp dùng giá trị lưu giữ đó, **không dùng hằng số ngày dương lịch khi triển khai**.

**Công khai menu = bắt đầu đặt hàng** là ngày bắt đầu của kỳ đặt hàng của menu (giá trị mặc định của demo = ngày 1 tháng trước. Với chu kỳ tháng 9/2026 〈A1 = 2026-09-07〉 thì là 2026-08-01), **hạn chốt đặt hàng** là ngày kết thúc kỳ đặt hàng (tương tự ngày 15 tháng trước = 2026-08-15). Hạn chốt thay đổi không được giữ như một mốc độc lập; việc kết thúc tiếp nhận thay đổi ngày được xem là cùng thời điểm với hạn chốt đặt hàng [Yêu cầu REQ-DL-745・624].

**Batch không khởi chạy vào ngày cố định mà thống nhất theo dạng catch-up hằng ngày "mỗi ngày nhặt những mục đã qua ngày chuẩn và chưa xử lý"** [Yêu cầu REQ-DL-744]. Vì ngày đầu chu kỳ (A1) luôn là thứ Hai và không trùng với ngày 1 dương lịch, nếu cố định theo ngày dương lịch thì sau vài tháng sẽ bị lệch.

| Điều kiện nhặt | Xử lý | Job (giờ) |
|---|---|---|
| Chu kỳ chưa sinh đã qua ngày chuẩn sinh hợp đồng con | Sinh hợp đồng con và chốt snapshot giá | `contract_monthly_generate` (01:30) |
| Ngay sau khi lưu thiết lập chu kỳ giao hàng／`draft` trong khoảng thời gian thiết lập | Tạo lại kế hoạch và áp dụng lại các override đã phê duyệt | `plan_rollout` (02:00) |
| Chu kỳ đã qua **ngày bắt đầu đặt hàng** | ① **Sinh chính thức** kế hoạch thành dữ liệu giao hàng → ② Sinh slot đặt hàng (số lượng tiêu chuẩn là giá trị ban đầu) → ③ Nếu hợp đồng con chưa được sinh thì sinh tại đây | `delivery_materialize` (02:30) |
| Chu kỳ đã qua **ngày chốt đặt hàng** | **Chốt số lượng** của đơn hàng và ghi vào dữ liệu giao hàng (không tạo bản ghi). Đồng thời cố định chế độ đổi ngày ở trạng thái OFF | `order_finalize` (02:45) |
| Override đang áp dụng・`published` | Chạy lại kiểm tra trước phê duyệt, chuyển những mục không còn thành lập sang "cần xác nhận" | `plan_recheck` (03:00) |
| Tháng thanh toán đã qua ngày chốt thanh toán | Phát hiện sự thiếu sót hợp đồng con lẽ ra phải có trong tháng thanh toán đó (**phát hiện sót thanh toán**) | `billing_gap_detect` (05:00) |

5 job ở trên (hợp đồng con → kế hoạch → sinh chính thức → chốt số lượng → kiểm tra lại) là **chuỗi job theo đúng thứ tự này**, nếu bước trước thất bại thì không chạy bước sau [Chu kỳ §11-1]. Phân loại giao hàng "vật tư" nằm ngoài bảng này (7-5).

**Hợp đồng đối tượng (bổ sung 5 ngày 2026/09/29)** [Quyết định v2.3 #52]: Không job nào ở trên lấy **hợp đồng đăng ký tạm (tiếp nhận "đang thiết lập") làm đối tượng**. Hợp đồng đang tạm ngừng・khoảng trống từ khi hết hạn dùng thử đến khi triển khai chính thức・đã kết thúc cũng nằm ngoài đối tượng. **Ngay sau khi xác định cơ sở (đăng ký chính thức)**, chỉ chạy 3 job hợp đồng con → kế hoạch → sinh chính thức **chỉ cho hợp đồng của cơ sở đó**, không chờ batch hằng ngày (xử lý idempotent nên sẽ không bị trùng lặp bởi batch hằng ngày hôm sau). Nếu việc xác định đã qua hạn chốt đặt hàng của chu kỳ bắt đầu thì sửa tháng chu kỳ bắt đầu sang chu kỳ kế tiếp rồi mới tạo (quyết định 28-27 của đơn đăng ký).

| `contracts.status` | Kế hoạch・Dữ liệu giao hàng・Hợp đồng con |
|---|---|
| `provisional` (đăng ký tạm・tiếp nhận "đang thiết lập") | Không tạo |
| `active`・`change_scheduled`・`suspend_scheduled` (đến trước ngày bắt đầu tạm ngừng)・`resume_scheduled` (sau khi tiếp tục)・`cancel_scheduled` (đến ngày hủy hợp đồng) | Tạo |
| `suspended` (đang tạm ngừng)・`ended`, khoảng trống từ khi hết hạn dùng thử đến khi triển khai chính thức | Không tạo |

`confirmed_at` = ngày giờ đăng ký chính thức (xác định cơ sở). Cột xem `配送_11` 14.2 [Nguồn gốc: DEV §4.7]

**Thiết lập ban đầu (khi lần đầu lưu thiết lập chu kỳ giao hàng)**: ① Sinh kế hoạch giao hàng cho khoảng thời gian thiết lập (mặc định 6 tháng) từ hợp đồng của tháng hiện tại (không phải từ tháng sau) ② Trong đó, các chu kỳ đã qua ngày bắt đầu đặt hàng thì sinh chính thức ngay tại chỗ đến dữ liệu giao hàng ③ Các chu kỳ sau đó giữ nguyên ở dạng kế hoạch giao hàng [Nguồn gốc: Thiết lập chu kỳ giao hàng §4A-2] [Yêu cầu REQ-DL-608]

**Ngoại lệ: Bộ thiết lập ban đầu của đơn hàng và vật tư (bổ sung 6 ngày 2026/09/29)** [28-94・95・109]: Các job ở trên (hợp đồng con・kế hoạch・dữ liệu giao hàng) theo #52 được tạo từ đăng ký chính thức, nhưng **bộ thiết lập ban đầu của đơn hàng và vật tư hoạt động tại thời điểm đăng ký tạm (hoàn tất xác nhận nội dung đăng ký).** Với triển khai chính thức, nếu có tài khoản thì doanh nghiệp có thể đặt hàng từ trong kỳ đặt hàng của tháng chu kỳ bắt đầu, còn với dùng thử thì đơn hàng được sinh tự động (7-9). Vì vậy, tại bước xác nhận nội dung đăng ký, quyết định trước kho picking (xử lý sản phẩm × kho) và số lần giao hàng (số lần chia). Khi kế hoạch・dữ liệu giao hàng được tạo ở đăng ký chính thức thì liên kết đơn hàng đã vào ở đăng ký tạm với kế hoạch đó (cách giữ dữ liệu xem `配送_11` 14.12 【đề xuất】). Nếu bị từ chối・rút lại khi vẫn ở đăng ký tạm thì hủy đơn hàng・bộ thiết lập ban đầu [28-99].

**1 chu kỳ = 1 hợp đồng con. Tháng chu kỳ = tháng mà slot thứ 14 `B7` thuộc về** [Quyết định v2.1 #11] [Yêu cầu REQ-DL-881・741]. Định nghĩa này cho **kết quả giống với** "tháng có nhiều ngày hơn trong 28 ngày của các slot A1~D7 (ngày nghỉ chu kỳ không tiêu tốn slot nên không tính vào số đếm)", và khi 14 đối 14 thì **tự động là tháng trước**. **Không tạo nhánh ngoại lệ** (mục "khi bằng nhau thì chưa quyết・tạm thời" của #41 lần 1 đã được giải quyết). 8/31~9/27 có `B7` = 2026-09-13 nên là **chu kỳ tháng 9/2026**. `yyyymm` của mã hợp đồng con `ID hợp đồng-yyyymm` cũng là tháng chu kỳ, tháng thanh toán được giữ riêng ở `billing_month`.

**Không chạy chốt số lượng・mail xác nhận・chỉ thị xuất hàng với hạn chốt tạm** [Quyết định v2.1 #9] [Chu kỳ §4A-2E] [Yêu cầu REQ-DL-879・811]

Tháng chưa đăng ký menu thì không lấy được ngày chốt đặt hàng, nên **giữ ngày 15 tháng trước làm hạn chốt tạm** (`delivery_cycles.marker_source = provisional`). Tuy nhiên, các xử lý được phép chạy với hạn chốt tạm là có giới hạn.

| Xử lý | Hạn chốt tạm (`provisional`) | Hạn chốt thật (`menu`) |
|---|---|---|
| Kết thúc tiếp nhận thay đổi (chuyển chế độ đổi ngày sang OFF) | **Chạy** | Chạy |
| Khởi chạy kiểm tra (đối chiếu của `plan_recheck` v.v.・sinh mục cần xác nhận) | **Chạy** | Chạy |
| Chốt số lượng (`order_finalize`) | **Không chạy** | Chạy |
| Gửi mail xác nhận (thông báo xác nhận cho doanh nghiệp・công ty giao hàng ủy thác) | **Không chạy** | Chạy |
| Chỉ thị xuất hàng (gửi cho Thomas. Do đó cũng không chuyển sang `locked`) | **Không chạy** | Chạy |

Hạn chốt tạm là **giá trị mặc định để phán định nội bộ**, không phải ngày đã hứa với doanh nghiệp hay kho. Nếu chốt số lượng bằng ngày tạm và đưa đến chỉ thị xuất hàng thì khi menu được đăng ký sau đó và hạn chốt bị dịch chuyển sẽ không thể lấy lại. Trên màn hình ghi kèm "Tạm (ngày 15 tháng trước)", khi đăng ký menu thì thay bằng ngày thực. Sau khi thay, từ `order_finalize` trở đi mới được nhặt làm đối tượng.

### 7-4. Sinh hợp đồng con và nguồn snapshot của tuyến đường

Dữ liệu giao hàng・đơn hàng chỉ cần tạo vào "ngày bắt đầu đặt hàng", nhưng **hợp đồng con đôi khi cần sớm hơn thế**. Nếu không có hợp đồng con thì không theo dõi được trạng thái thanh toán của tháng thanh toán đó, và không nhận ra được việc sót thanh toán [Chu kỳ §4A-2B] [Yêu cầu REQ-DL-742].

**Ngày chuẩn sinh = ngày sớm hơn trong ① 1 tháng trước ngày chốt thanh toán (ngày 25) của tháng thanh toán mà chu kỳ đó thuộc về và ② ngày bắt đầu đặt hàng (cận dưới).**

| Mẫu thanh toán | Sinh hợp đồng con | Ví dụ chu kỳ tháng 9/2026 (A1 = 2026-09-07) |
|---|---|---|
| Thanh toán tháng hiện tại (tiêu chuẩn) | **Ngày bắt đầu đặt hàng** (cận dưới có hiệu lực) | Sinh vào 2026-08-01 → thanh toán tháng 9/2026 |
| Thanh toán trước 2 tháng | Sinh trước **2 tháng** so với tháng chu kỳ | Sinh trước 2026-06-25 → thanh toán tháng 7/2026 |
| Trả trước trọn gói 1 năm | **Sinh gộp 12 chu kỳ** vào tháng bắt đầu hợp đồng・tháng gia hạn | Vào 2026-04 sinh 12 mục từ tháng 4/2026 đến tháng 3/2027 |

**Xử lý hợp đồng con sinh trước**: Tháng thanh toán giữ ở `billing_month`, tháng đối tượng trả trước giữ ở `advance_target_month`. Trả trước trọn gói 1 năm thì sinh gộp 12 mục theo ngày chuẩn của chu kỳ đầu, nếu trong kỳ có điều chỉnh giá thì lấy các điều chỉnh áp dụng cho từng tháng chu kỳ để snapshot. Đổi gói: hợp đồng con sinh trước chưa thanh toán (`generated`) thì sinh lại・chỉnh sửa snapshot, đã thanh toán thì không chỉnh sửa mà phản ánh bằng điều chỉnh từ tháng sau trở đi. Phê duyệt hủy hợp đồng・tạm ngừng: hủy các hợp đồng con sinh trước chưa thanh toán từ tháng áp dụng trở đi, và hiển thị số lượng bị hủy trên màn hình phê duyệt [Nguồn gốc: Thiết lập chu kỳ giao hàng §4A-2B].

**Hợp đồng con thanh toán tháng hiện tại được sinh vào ngày bắt đầu đặt hàng** [Quyết định #40] [Chu kỳ §4A-2B]. Để khớp cùng ngày với việc sinh chính thức dữ liệu giao hàng, việc lùi sang hôm trước không có ý nghĩa (mục cũ "ngày trước ngày bắt đầu đặt hàng" đã bị hủy). Nếu xử lý trong batch cùng ngày theo thứ tự **hợp đồng con (01:30) → dữ liệu giao hàng (02:30)** thì "hợp đồng con trước, dữ liệu giao hàng sau" được giữ nguyên.

**Nếu hợp đồng con có trước thì kế hoạch dùng snapshot tuyến đường của hợp đồng con** [Quyết định v2.1 S2] [Chu kỳ §3.1B] [Yêu cầu REQ-DL-884・829]

Nếu **có hợp đồng con của tháng đó thì dùng snapshot tuyến đường của hợp đồng con** (`shipping_plans.route_snapshot_source = contract_month`), **chỉ khi chưa có thì mới dùng giá trị mặc định của hợp đồng cha** (`= contract`).

- Cách giữ hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó không thay đổi [Quyết định #25/#45]. **Chỉ dùng hợp đồng cha khi hợp đồng con chưa có.** Trường hợp hợp đồng con của 12 chu kỳ có trước như trả trước trọn gói 1 năm, kế hoạch của các tháng sau cũng được tạo từ hợp đồng con. Nếu có hợp đồng con mà vẫn đi xem hợp đồng cha thì khi sau này đổi hợp đồng cha, hợp đồng con và kế hoạch sẽ mâu thuẫn nhau.
- Tại thời điểm hợp đồng con được tạo, kế hoạch của chu kỳ đó chuyển sang snapshot phía hợp đồng con.
- **(Cũ: "Kế hoạch của 6 tháng sau được tạo đồng loạt từ giá trị mặc định của hợp đồng cha". Lần 2 ngày 2026/09/21, làm rõ trường hợp hợp đồng con có trước)**
- **Phát hiện sót thanh toán**: Vào ngày chốt thanh toán, phát hiện những trường hợp "hợp đồng con cho hợp đồng có hiệu lực không tồn tại trong tháng thanh toán đó" và đưa ra mục cần xác nhận. Khi đã áp dụng sinh trước thì phát hiện này là lưới an toàn duy nhất [Yêu cầu REQ-DL-743].

### 7-5. Vật tư là giao hàng theo nhu cầu

**Giao hàng theo nhu cầu (`on_demand`)** của mẫu giao hàng (`plan_mode`) **chỉ dành cho vật tư**, đồ lạnh・đông lạnh vẫn giữ hai giá trị chu kỳ／đặc biệt [Quyết định #24]. Vật tư không phải giao hàng theo chu kỳ tháng, nên **mỗi lần xác nhận giỏ hàng vật tư thì tạo dữ liệu giao hàng**. **Nếu đã có dữ liệu giao hàng vật tư cùng cơ sở・cùng ngày giao・chưa gửi chỉ thị xuất hàng thì thêm chi tiết vào đó để gộp thành 1 mục** (không tạo mới) [Quyết định v2.3 #36] [Chu kỳ §4A-2C] [Yêu cầu REQ-DL-748] (Cũ: "Tạo 1 mục tại thời điểm có đơn hàng vật tư". Chưa quyết là mỗi lần xác nhận giỏ hàng hay chốt hàng tuần. Xác định ngày 2026/09/29).

| | Món ăn・đông lạnh・nhiệt độ thường | **Vật tư** |
|---|---|---|
| Trigger sinh | Ngày bắt đầu đặt hàng (batch hằng ngày) | **Mỗi lần xác nhận giỏ hàng vật tư** (ngay lập tức). Nếu có chuyến vật tư cùng cơ sở・cùng ngày giao・trước chỉ thị xuất hàng thì **gộp thành 1 mục** [Quyết định v2.3 #36] |
| Ngày giao | Slot hoặc ngày chỉ định riêng | **Ngày giao được đầu tiên từ ngày sau ngày đặt hàng trở đi mà giữ được lead time** (ngày xuất hàng = ngày giao − lead time) [Quyết định v2.3 #38] |
| Kế hoạch giao hàng (`shipping_plans`) | Sinh từ chu kỳ | **Không có** (không có giai đoạn kế hoạch) |
| Chốt số lượng | Ngày chốt đặt hàng | Đồng thời với việc xác nhận đơn hàng vật tư |
| Chỉ thị xuất hàng | Bắt đầu gộp 2 tuần trước 3 ngày | **Không gửi cho THOMAS**. Làm việc bằng danh sách picking vật tư (màn hình) và CSV vận đơn Yamato (10-9) (Cũ: gửi bằng catch-up hằng ngày hiện có [Quyết định v2.3 #36]. Sửa theo sổ quyết định 2026-10-03・xác nhận khách hàng 2026/10/01 A2) |
| Giao hàng | Theo phân loại giao hàng của hợp đồng | Gửi trực tiếp bằng Yamato. Không đi theo luồng giao hàng hiện tại |

Đơn hàng vật tư có **① bộ thiết lập ban đầu** (sinh tự động khi thành lập dùng thử／hợp đồng mới・REQ-PO-217) và **② đơn hàng vật tư thông thường** (doanh nghiệp đặt bất cứ lúc nào. Từ lần thứ 2 trở đi có tính phí), cả hai đều tạo dữ liệu giao hàng tại thời điểm xác nhận giỏ hàng (cả "gộp thành 1 mục" ở trên cũng vậy). Vật tư nằm ngoài đối tượng của chu kỳ giao hàng nên **không phán định nghỉ chu kỳ・xử lý ngày lễ giao hàng**. Tuy nhiên, khi quyết định ngày giao thì **việc phán định thứ không thể giao・ngày không thể nhận・ngày không thể xuất hàng vẫn thực hiện như thông thường** [Quyết định v2.3 #38] (Cũ: cũng không phán định slot không thể xuất hàng. Thay thế 2026/09/29). Vì **không tồn tại giai đoạn kế hoạch (`draft`)** nên ngay khi được sinh ra đã xuất hiện ở dạng `published`. Giao hàng vật tư được loại khỏi việc phán định・hiển thị ngưỡng số lượng mỗi ngày [Yêu cầu REQ-DL-818].

**Bộ thiết lập ban đầu của vật tư (bổ sung 6 ngày 2026/09/29)** [28-106~108]: **Sinh tự động tại thời điểm đăng ký tạm (hoàn tất xác nhận nội dung đăng ký)**. **Ngày giao do bộ phận vận hành nhập ở tab "Hợp đồng con" (dưới tuyến đường giao hàng) của thiết lập thông tin chi tiết tiếp nhận (bắt buộc)** [28-145・2026/09/29. Cũ: nhập ở xác nhận nội dung đăng ký]. Kho là kho giao hàng vật tư của cơ sở đó. **Phí miễn phí** (đơn hàng vật tư từ lần thứ 2 vẫn tính phí). Nội dung là **số lượng của bộ thiết lập ban đầu giữ trong master vật tư**, **số lượng khác nhau theo gói (số suất ăn tháng)** (bảng số lượng vật tư × gói. Chọn phương án A [28-129]. Vật tư số lượng 0 thì không đưa vào). **Dữ liệu giao hàng của bộ thiết lập ban đầu được tạo ở đăng ký chính thức (xác định cơ sở)** [28-130]: Đơn hàng vật tư (bộ thiết lập ban đầu) được sinh tự động ở đăng ký tạm và giữ ngày giao, đến đăng ký chính thức thì tạo dữ liệu giao hàng với ngày giao đó và liên kết (cách tạo giống các vật tư khác).

### 7-6. Kế hoạch chỉ được tạo cho khoảng thời gian đã thiết lập — không rolling

**Kế hoạch chỉ được tạo khi lưu thiết lập chu kỳ giao hàng**, đối tượng giới hạn trong khoảng thời gian do bộ phận vận hành thiết lập (mặc định 6 tháng). **Không thực hiện sinh rolling để batch tự động thêm vào cuối kỳ** [Chu kỳ §4A-2] [Yêu cầu REQ-DL-809・608]. Batch không tính ngày mới mà chỉ **chốt các kế hoạch đã có**.

**Khi gần hết kỳ cũng không đưa ra cảnh báo trước.** Tháng chưa thiết lập kỳ tiếp theo thì **không thể công khai menu**, nên sẽ bị dừng ngay khi cố công khai. Việc sót thiết lập chắc chắn sẽ bị nhận ra ở cửa vào công khai, nên không có cơ chế đếm ngày để nhắc. Cảnh báo trước **chỉ là hiển thị trong màn hình** (tháng cuối đã thiết lập và số tháng còn lại), không tạo thông báo trên dashboard [Quyết định #14]. Doanh nghiệp có thể gửi yêu cầu thay đổi đến khoảng thời gian đã sinh (tối đa 6 tháng sau), các tháng chưa sinh nằm ngoài đối tượng cả hiển thị lẫn yêu cầu [Yêu cầu REQ-DL-609].

### 7-7. Có hai máy trạng thái

**`plan lifecycle` và `delivery status` là hai máy trạng thái khác nhau. Không gọi gộp cả hai là "trạng thái". Bảng chuyển đổi cũng tách riêng** [Quyết định v2.1 S5] [Chu kỳ §4A-3・§4A-3B] [Yêu cầu REQ-DL-883]. Một dữ liệu giao hàng giữ đồng thời giá trị của cả hai (ví dụ: `lifecycle = locked` và `status = Đã nhận`).

| Máy trạng thái | Tên vật lý | Biểu thị | Giá trị |
|---|---|---|---|
| **① Vòng đời kế hoạch** (plan lifecycle) | `shipping_plans.lifecycle` | **Từ khi nào không thể chạm vào** | `draft` / `published` / `locked` |
| **② Trạng thái giao hàng** (delivery status) | `deliveries.status` | **Hàng đã đi đến đâu** | Chờ xuất hàng／Đã xuất hàng／Đã nhận／Đã giao／Giao một phần／Chờ giao lại／Đang xác nhận／Dừng／Hủy |

#### ① Các giai đoạn và chuyển đổi của `plan lifecycle`

| `lifecycle` | Thực thể | Khi nào | Từ phía doanh nghiệp | Ảnh hưởng của thay đổi thiết lập |
|---|---|---|---|---|
| `draft` (kế hoạch) | Chỉ kế hoạch giao hàng | Từ thiết lập đến trước khi bắt đầu đặt hàng | Nhìn thấy (**chỉ ngày**)・có thể gửi yêu cầu thay đổi | Tạo lại, áp dụng lại override |
| `published` (đã chốt) | Có dữ liệu giao hàng | Từ lần sinh chính thức vào **ngày bắt đầu đặt hàng** đến trước khi gửi chỉ thị xuất hàng thành công | Nhìn thấy (bao gồm số lượng)・có thể gửi yêu cầu thay đổi | Không tính lại. Chênh lệch được thông báo bằng "cần xác nhận" |
| `locked` | Dữ liệu giao hàng | Từ **thời điểm lần gửi đầu tiên chỉ thị xuất hàng thành công** | Nhìn thấy nhưng không thể gửi yêu cầu | Không chạm vào |

| Hiện tại | Nguyên nhân | Tiếp theo | Người thực hiện |
|---|---|---|---|
| `draft` | Sinh chính thức (đã qua ngày bắt đầu đặt hàng) | `published` | Batch |
| `draft` | Phê duyệt tạm ngừng・hủy hợp đồng | Xóa (override còn lại dưới dạng `Hủy` kèm lý do) | Vận hành |
| `published` | **Lần gửi đầu tiên chỉ thị xuất hàng thành công** | `locked` | Hệ thống |
| `locked` | — | Không chuyển | — |

**Cấm**: `published → draft`, `locked → published`, quay ngược `locked`. **Không chuyển sang `locked` khi cấp số vận đơn** [Quyết định v2.1 #3]. **Cũng cấm sao chép từ `draft`** (8-4) [Quyết định v2.1 #5].

#### ② Định nghĩa và chuyển đổi của `delivery status`

**Chờ xuất hàng** = từ khi có dữ liệu giao hàng đến khi xuất hàng／**Đã xuất hàng** = kho đã xuất (nhập CSV thực tích xuất hàng・CSV vận đơn)／**Đã nhận** = tài xế đã nhận tại kho・điểm trung chuyển (đang giao cũng ở trạng thái này. **Chỉ vào được từ ứng dụng tài xế của ES**. **Lần nhận đầu tiên ở ứng dụng ES thì thành Đã nhận, việc nhận chặng tiếp theo tại điểm trung chuyển chỉ lưu thời điểm vào `delivery_legs.picked_up_at`** [Quyết định v2.3 #49])／**Đã giao** = đã giao toàn bộ số lượng (hoàn thành theo diễn giải ghi kèm "Đã giao (xem như hoàn thành)")／**Giao một phần** = chỉ giao một phần (số còn lại giữ bằng bản sao, bản sao đó bắt đầu từ Đang xác nhận)／**Chờ giao lại** = không giao được và gửi lại／**Đang xác nhận** = trạng thái con (bản sao・con tự động)・ứng viên phục hồi đang chờ bộ phận vận hành quyết định ngày・số lượng・cách xử lý (**trong luồng sự cố chỉ có con chưa xuất hàng 〈`shipped_date IS NULL`〉 mới có trạng thái này, không chuyển bản cha sang trạng thái này khi báo cáo sự cố** [Quyết định v2.3 #20]. Cũ: trạng thái bản cha nhận được báo cáo chờ bộ phận vận hành xử lý. Hủy bỏ 2026/09/24)／**Dừng** = kết thúc mà không giao (thực tích 0・**không thanh toán**・bắt buộc có lý do. **Không phân biệt trước hay sau khi xuất hàng**)／**Hủy** = hủy **trước khi xuất khỏi kho** (thực tích 0・không thanh toán・bắt buộc có lý do) [Chu kỳ §4A-3B] [Yêu cầu REQ-DL-753・904].

**Phân biệt `Dừng` và `Hủy`** [Quyết định v2.3 #11]: Phân biệt theo **đã xuất hàng hay chưa**. **Chưa xuất khỏi kho = `Hủy`** (chỉ thị xuất hàng được gửi lại với số lượng 0 để vô hiệu hóa・10-3), **sau khi đã xuất mới dừng giao hàng = `Dừng`** (hàng thực đã xuất nên có thể phát sinh việc xử lý cước vận chuyển・hủy bỏ riêng. **Cước vận chuyển là `freight_billable` (mặc định "không", "có" bắt buộc có lý do), hủy bỏ là `delivery_lines.disposed_qty`, sản phẩm còn lại gửi về trụ sở v.v. bằng bản sao "trả hàng"** [Quyết định v2.3 #40・#41]). Cả hai đều giống nhau ở điểm **thực tích 0 và không thanh toán**.

**Quy tắc tên hiển thị**: Badge trong 4 ký tự, không dùng từ viết tắt. Trạng thái kết thúc (Dừng・Hủy) hiển thị riêng thành nhóm khác bằng màu xám. Cũ→mới: Kế hoạch→—／Kế hoạch-đăng ký→—＋yêu cầu thay đổi = đang yêu cầu／Có thể thay đổi→Chờ xuất hàng＋có thể thay đổi／Đang yêu cầu thay đổi→Chờ xuất hàng＋đang yêu cầu／Chuẩn bị xuất hàng→Chờ xuất hàng／Đã nhận hàng→Đã nhận／Sự cố→giữ nguyên trạng thái＋báo cáo sự cố／Hoàn tất giao hàng→Đã giao／Không thuộc đối tượng trung chuyển・Chờ giao trung chuyển・Đang giao trung chuyển・Đã giao trung chuyển→Không trung chuyển／Có trung chuyển [Nguồn gốc: Thiết lập chu kỳ giao hàng §4A-3B].

**Trạng thái cuối cùng là 5 trạng thái: `Đã giao`／`Giao một phần`／`Chờ giao lại`／`Dừng`／`Hủy`.** `Đang xác nhận` không phải là trạng thái cuối (để lại ở cần xác nhận cho đến khi quyết định cách xử lý). **Báo cáo sự cố・liên hệ sau khi giao không thay đổi trạng thái của bản cha** (giữ nguyên Đã xuất hàng／Đã nhận／Đã giao), ghi báo cáo sự cố và mở cần xác nhận. **Dù có liên hệ sau khi giao cũng không đưa `Đã giao` quay lại `Đang xác nhận`** [Quyết định v2.3 #20].

**Kế hoạch giao hàng (`draft`) không có `delivery status`.** Cột trạng thái là "—", khi sinh chính thức thì thành "Chờ xuất hàng" [Yêu cầu REQ-DL-752]. Kế hoạch chỉ giữ `plan lifecycle` và trạng thái yêu cầu thay đổi, hiển thị chưa xác định ngày (chưa đăng ký menu)・nghỉ chu kỳ.

| Hiện tại | Nguyên nhân | Tiếp theo | Người thực hiện |
|---|---|---|---|
| Kế hoạch (—) | Sinh chính thức | Chờ xuất hàng | Batch |
| Chờ xuất hàng | Nhập CSV thực tích xuất hàng・CSV vận đơn | Đã xuất hàng | Hệ thống |
| Chờ xuất hàng | Phát hiện không thể xuất hàng (bắt buộc có lý do) | Hủy (chuyến thay thế được tạo bằng bản sao) | Vận hành |
| Đã xuất hàng | Đã nhận toàn bộ vận đơn (**lần nhận đầu tiên ở ứng dụng ES**. `picked_up_at`・`picked_up_by` của chặng đó cũng được nhập [Quyết định v2.3 #49]) | Đã nhận | Tài xế |
| Đã nhận | **Tài xế chặng tiếp theo nhận hàng tại điểm trung chuyển** (khi lần 1 là ủy thác và có trung chuyển) | **Giữ nguyên Đã nhận** (chỉ nhập `picked_up_at`・`picked_up_by` của chặng đó. Không giữ trạng thái giữa chừng của trung chuyển) [Quyết định v2.3 #49] | Tài xế |
| Đã xuất hàng | Hoàn tất mà một phần chưa nhận | Đã nhận (đưa vận đơn chưa nhận vào "cần xác nhận") | Tài xế |
| Đã xuất hàng | Báo cáo sự cố trước khi nhận | **Đã xuất hàng (không đổi trạng thái. Ghi báo cáo sự cố và mở cần xác nhận)** | Tài xế／bộ phận vận hành đăng ký thay |
| Đã xuất hàng (**final leg là công ty vận tải giao trực tiếp**) | Batch 06:00 ngày sau ngày giao | Đã giao (xem như hoàn thành) | Batch |
| Đã xuất hàng・Đã nhận (**final leg là ứng dụng tài xế ES**) | Sang sáng hôm sau mà vẫn không phải Đã giao・Dừng・Hủy | **Không đổi trạng thái, đưa vào missing queue (cần xác nhận)** (không xem như hoàn thành) | Batch |
| Đã nhận | Giao toàn bộ số lượng và không chênh lệch | Đã giao | Tài xế |
| Đã nhận | Chênh lệch số lượng・hoàn tất mà một phần chưa giao・báo cáo sự cố | **Đã nhận (không đổi trạng thái. Ghi báo cáo sự cố và mở cần xác nhận)** | Tài xế |
| Đã giao | Doanh nghiệp・cơ sở・công ty giao hàng liên hệ sau khi giao (**không đặt hạn tiếp nhận・do bộ phận vận hành quyết định**) | **Đã giao (không đổi trạng thái. Ghi báo cáo sự cố và mở cần xác nhận)** | Bộ phận vận hành đăng ký thay |
| **Đã xuất hàng** | **Không thể giao hàng sau khi xuất hàng** (hỏng xe・tuyết lớn・sự cố sản phẩm v.v. Bắt buộc có lý do) | **Dừng** | **Vận hành** |
| **Đã nhận** | **Không thể giao hàng sau khi đã nhận** (bắt buộc có lý do) | **Dừng** | **Vận hành** |
| Đã xuất hàng・Đã nhận・Đã giao | Bộ phận vận hành giải quyết sự cố: đã giao được toàn bộ số lượng (bao gồm hàng thay thế). Phần thừa điều chỉnh lần sau | Đã giao. Nếu có con tự động thì trong cùng transaction **Hủy** (lý do `auto child not needed`) | Vận hành (logistics) |
| Đã xuất hàng・Đã nhận | Bộ phận vận hành giải quyết sự cố: giao một phần, số còn lại gửi sau | Giao một phần ＋ con (số còn lại). **Nếu có con tự động thì dùng lại** (`duplicate_type=remainder`, số lượng・chi tiết = số còn lại). Nếu không có thì tạo bằng bản sao | Vận hành (logistics) |
| Đã xuất hàng・Đã nhận | Bộ phận vận hành giải quyết sự cố: **giao một phần, phần còn lại không gửi** (`partial_no_resend`・bắt buộc có lý do・không có ngưỡng) [Quyết định v2.3 #31] | Giao một phần. **Không tạo con**. Nếu có con tự động thì **Hủy** | Vận hành (logistics) |
| Đã xuất hàng・Đã nhận | Bộ phận vận hành giải quyết sự cố: giao 0 và gửi lại | Chờ giao lại ＋ con (toàn bộ số lượng). **Nếu có con tự động thì dùng lại** (`duplicate_type=redelivery`, số lượng・chi tiết = toàn bộ). Nếu không có thì tạo bằng bản sao | Vận hành (logistics) |
| Đã xuất hàng・Đã nhận | Bộ phận vận hành giải quyết sự cố: kết thúc mà không giao (bắt buộc có lý do) | Dừng. Nếu có con tự động thì **Hủy** | Vận hành (logistics) |
| Đã xuất hàng・Đã nhận | Bộ phận vận hành giải quyết sự cố: ghé lại trong ngày (chậm trễ v.v.) | Đã nhận. Nếu có con tự động thì **Hủy** | Vận hành (logistics) |
| **Đã giao (chỉ xem như hoàn thành `presumed`)** | Liên hệ "chưa nhận được" → Yamato điều tra xác nhận thất lạc・chưa giao [Quyết định v2.3 #27] | **Chờ giao lại** ＋ con (toàn bộ số lượng)／**Dừng** (bắt buộc có lý do). Nếu có con tự động thì dùng lại／Hủy | Vận hành (logistics) |
| Đã nhận (sự cố chưa giải quyết **chỉ là chậm trễ**) | Tài xế báo cáo giao **toàn bộ số lượng** [Quyết định v2.3 #32] | Đã giao. **Hệ thống tự động giải quyết** báo cáo chậm trễ bằng "giao toàn bộ" | Tài xế／hệ thống |
| (không có) → con | **Đã đăng ký báo cáo sự cố loại tạo con tự động (giao nhầm・vắng mặt・hư hỏng)**／bộ phận vận hành gán loại đó (bản cha vẫn giữ Đã xuất hàng・Đã nhận・Đã giao) [Quyết định v2.3 #30] | **Tạo 1 con: Đang xác nhận** (`duplicate_type=trouble_pending`・`creation_source=trouble_auto`・`schedule_confirmed=false`・`quantity_confirmed=false`). Nếu đã có con tự động còn sống thì không tạo | Hệ thống (cùng transaction với việc đăng ký báo cáo) |
| **Đang xác nhận (con)** | **Đã quyết định cách xử lý, đã chốt ngày giao・số lượng** (tuyến thông thường của bản ghi con được sao chép. Từ đây mới thành đối tượng của chỉ thị xuất hàng). **Điều kiện là `schedule_confirmed=true` và `quantity_confirmed=true`**, con tự động còn cần sự cố của bản cha được giải quyết (chưa chốt thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`) | **Chờ xuất hàng** | **Vận hành (logistics)** |
| **Đang xác nhận (con)** | **Hủy bỏ／cách giải quyết không cần gửi lại** (con tự động trong cùng transaction với việc giải quyết bản cha・bắt buộc có lý do). **Tuy nhiên giới hạn ở những mục `shipped_date IS NULL` (chưa xuất khỏi kho)** | **Hủy** | **Vận hành (logistics)** |

(Cũ: "Đã xuất hàng／Đã nhận → Đang xác nhận (báo cáo sự cố)" "Đã giao → Đang xác nhận (liên hệ sau khi giao)" "Đang xác nhận → Đã giao／Giao một phần／Chờ giao lại／Dừng／Đã nhận". Hủy bỏ 2026/09/24 [Quyết định v2.3 #20・#21]. Cũ: "Báo cáo sự cố chưa giải quyết qua `auto_duplicate_due_at` thì batch `trouble_auto_duplicate` tạo con". Hủy bỏ 2026/09/29 [Quyết định v2.3 #30])

**Việc phán định hoàn thành・thiếu giao không dựa vào loại chuyến (`service_form`) hay thể chế giao hàng (`delivery_regime`) mà dựa vào người vận chuyển của final leg (chặng cuối)** [Quyết định v2.1 #4] [Yêu cầu REQ-DL-869・870・871]. Dùng `delivery_legs.is_final_leg` để phán định, nếu là `parcel_carrier` thì xem như hoàn thành, nếu là `self` / `partner_driver` thì không xem như hoàn thành. **Hàng thay thế và hủy bỏ không phải là trạng thái** (là xử lý thực hiện kèm theo, trạng thái được quyết định bằng lượng đã giao được). Chỉ bộ phận vận hành (logistics) mới có thể chuyển sang Hủy・Dừng・Chờ giao lại, tài xế và công ty giao hàng ủy thác chỉ đến mức báo cáo. Đang xác nhận không là trạng thái cuối, để lại ở cần xác nhận cho đến khi quyết định cách xử lý. Hệ thống loại bỏ các chuyển đổi không có trong bảng [Yêu cầu REQ-DL-756]. **Xem như hoàn thành (`status = Đã xuất hàng`)・phát hiện thiếu giao (`status IN (Đã xuất hàng, Đã nhận)`) không lấy đối tượng là những đơn giao hàng có báo cáo sự cố chưa giải quyết** [Quyết định v2.3 #25] (11-5).

**`Giao một phần` và `Chờ giao lại` là trạng thái cuối của bản ghi đó** [Quyết định v2.3 #11] [Yêu cầu REQ-DL-905]. Xử lý giống các sự cố khác, **trở thành 2 bản ghi: "bản ghi đã giao xong" và "bản ghi con sao chép từ bản ghi gốc"**:

| | Cha (bản ghi gốc) | Con (bản sao) |
|---|---|---|
| **Giao một phần** | Giữ lượng thực tế đã giao được làm thực tích, **đóng bằng `Giao một phần`** | Giữ **số còn lại**, bắt đầu từ `Đang xác nhận`. Khi quyết định cách xử lý thì tiến lên `Chờ xuất hàng`, chạy đến `Đã giao` như thông thường |
| **Chờ giao lại** | Giữ thực tích 0, **đóng bằng `Chờ giao lại`** | Giữ **toàn bộ số lượng**, bắt đầu từ `Đang xác nhận`. Từ đó giống như trên |
| **Con tự động của sự cố** | Giữ nguyên trạng thái tại thời điểm xảy ra sự cố (Đã xuất hàng／Đã nhận／Đã giao). Bộ phận vận hành (logistics) đóng trực tiếp theo bảng trên | Được tạo với `Đang xác nhận`・`duplicate_type=trouble_pending`, tùy theo cách giải quyết mà **dùng lại thành `remainder`／`redelivery`** hoặc **Hủy**. Trước khi chốt thì nằm ngoài đối tượng của chỉ thị xuất hàng・vận đơn・phân bổ・thanh toán・thông báo・xem như hoàn thành [Quyết định v2.3 #21~#24] |

**Dù con thế nào thì cha cũng không chuyển động.** Thanh toán được lập theo **lượng và ngày thực tế đã giao của từng bản ghi** (14-1), nên không cần ghi đè bản cha sang `Đã giao` về sau. Khi con thành `Dừng`／`Hủy` thì cha vẫn giữ `Giao một phần`／`Chờ giao lại`. **Cha con chỉ 1 cấp**, khi chia con tiếp thì **cha vẫn là 1 bản ghi gốc** (số nhánh 1~9) [Quyết định v2.1 #5]. **Con tự động tạo từ 1 đơn giao hàng xảy ra sự cố có tối đa 1 con còn sống** (`deliveries.source_trouble_delivery_id`) [Quyết định v2.3 #29] (Cũ: 1 con cho 1 báo cáo sự cố. Thay đổi 2026/09/29). **Khi con xảy ra sự cố thì không sao chép từ con mà tạo số nhánh tiếp theo của cha** [Quyết định v2.3 #28].

#### Trục khác (không phải máy trạng thái)

| Trục | Tên vật lý | Đối tượng | Giá trị |
|---|---|---|---|
| Yêu cầu thay đổi | `change_request_status` | Cả kế hoạch giao hàng và dữ liệu giao hàng | Có thể thay đổi／Đang yêu cầu／Đang đề xuất／Đã điều chỉnh／Không thể thay đổi |
| Trung chuyển (relay) | **Không lưu (giá trị dẫn xuất)** | Dữ liệu giao hàng của tuyến có điểm trung chuyển | Không trung chuyển／Có trung chuyển |

**Trung chuyển được dẫn xuất từ route legs, không lưu như trạng thái** [Quyết định v2.1 #7] [Yêu cầu REQ-DL-876・814]. Nếu có dù chỉ 1 leg có điểm trung chuyển thì là "Có trung chuyển". Không giữ trạng thái giữa chừng (chờ trung chuyển／đang trung chuyển／đã trung chuyển).

**Chuyển đổi của yêu cầu thay đổi** (chung cho kế hoạch giao hàng・dữ liệu giao hàng) [Yêu cầu REQ-DL-754]

| Hiện tại | Nguyên nhân | Tiếp theo | Người thực hiện |
|---|---|---|---|
| Có thể thay đổi | Doanh nghiệp gửi yêu cầu thay đổi | Đang yêu cầu | Doanh nghiệp |
| Có thể thay đổi | Bộ phận vận hành trực tiếp đổi ngày | Đã điều chỉnh | Vận hành |
| Đang yêu cầu | Phê duyệt | Đã điều chỉnh | Vận hành |
| Đang yêu cầu | Đề xuất ngày thay thế | Đang đề xuất | Vận hành |
| Đang yêu cầu | Từ chối・doanh nghiệp rút lại | Có thể thay đổi (lưu vào lịch sử, thông báo cho doanh nghiệp) | Vận hành／Doanh nghiệp |
| Đang đề xuất | Doanh nghiệp chấp nhận／từ chối | Đã điều chỉnh／Có thể thay đổi | Doanh nghiệp |
| Đã điều chỉnh | Gửi yêu cầu thay đổi lần nữa | Đang yêu cầu | Doanh nghiệp |
| Đã điều chỉnh | Bộ phận vận hành phán đoán "không thể đáp ứng" (bắt buộc có lý do) | Đang đề xuất | Vận hành |
| Đã điều chỉnh | Do sinh lại mà ngày giao đối tượng không còn | Có thể thay đổi (override mất hiệu lực・lưu vào lịch sử) | Batch |
| Đang yêu cầu・Đang đề xuất | Đến **3 ngày trước hạn chốt đặt hàng** mà vẫn chưa xử lý (`change_request_warn_days`・mặc định 3 ngày) | **Không thay đổi** (mở cần xác nhận `change_request_due`. **Không tự động từ chối**) [Quyết định v2.3 #37] | Batch |
| Tất cả | Hạn chốt đặt hàng | Không thể thay đổi (yêu cầu chưa xử lý còn lại ở cần xác nhận `change_request_due`, **không đóng cho đến khi bộ phận vận hành xử lý** [Quyết định v2.3 #37]) | Batch |

**Đã điều chỉnh là giá trị dẫn xuất**, không phải cờ mà kế hoạch giữ, mà là hiển thị việc **override đã phê duyệt đang được áp dụng** (8-1).

### 7-8. Nhóm mục của dữ liệu giao hàng

Dữ liệu giao hàng = dữ liệu vận hành của 1 lần giao hàng đã chốt. Màn hình chi tiết không chia nhỏ mà gộp thành 1 màn hình [Yêu cầu REQ-DL-309・§8F-4].

| Nhóm | Mục giữ | Nguồn・Ghi chú |
|---|---|---|
| Nhận diện | ID giao hàng, ID hợp đồng・ID hợp đồng con, ID đơn hàng, ID・tên doanh nghiệp, ID・tên cơ sở, chu kỳ đối tượng・slot giao hàng, **khóa duy nhất của kế hoạch (`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`)** | Kế thừa từ hợp đồng／kế hoạch giao hàng. **Không dùng `(ID hợp đồng, ngày giao)` làm khóa duy nhất** [Quyết định v2.1 #6] [Yêu cầu REQ-DL-873] |
| Ngày | Ngày giao (ngày đến), ngày xuất hàng (ngày picking), lead time thiết lập, lead time thực tế, cờ di chuyển thủ công, cờ đảo hướng | Kết quả tính ở §6 |
| Nhiệt độ・Số lượng | Nhiệt độ (đông lạnh／lạnh／thường／vật tư), **số lượng dự kiến (kế thừa từ `shipping_plans.estimated_qty`)**, số lượng đã chốt, số lượng đã giao, nguồn gốc số lượng (`ordered`／`standard`／`ai`) | Đông lạnh・lạnh là bản ghi riêng [Yêu cầu REQ-DL-301]. **Số lượng dự kiến được giữ nội bộ từ giai đoạn kế hoạch** nhưng draft không hiển thị cho doanh nghiệp [Quyết định v2.1 S1] [Yêu cầu REQ-DL-882] |
| Nơi giao | Tên nơi giao, mã bưu điện・địa chỉ, số điện thoại, tên người phụ trách, ghi chú (số túi giữ lạnh・gói giữ lạnh không sao chép vào dữ liệu giao hàng mà giữ ở sổ cái theo từng đơn vị ủy thác `carrier_coolers`・12-5. Cũ: số túi giữ lạnh・số gói giữ lạnh. Sửa theo sổ quyết định 2026-10-03) | Địa chỉ là **snapshot tại ngày giao** [Yêu cầu REQ-DL-124・314] |
| Điều kiện nhận | **Khung giờ nhận = `delivery_receive_windows`** (**snapshot theo cả danh sách** `site_receive_windows(site_id, from_time, to_time, sort_order)` của cơ sở), điều kiện giao hàng | **Có thể giữ nhiều khung giờ. Không để dạng chỉ giữ 1 cặp from/to** [Quyết định v2.1 #8] [Yêu cầu REQ-DL-877・878]. Hiển thị tất cả khung giờ cho tài xế |
| Tuyến đường | Kho xuất phát, điểm trung chuyển, nơi giao cuối cùng, công ty vận chuyển lần 1・lần 2 trở đi, **chặng (route legs) và cờ final leg (chặng cuối)** | Số bậc thay đổi được [Yêu cầu REQ-DL-411]. **Việc phán định xem như hoàn thành・thiếu giao dựa vào người vận chuyển của final leg** [Yêu cầu REQ-DL-871] |
| 3 trục của chuyến | **`delivery_regime`** (`self` tự công ty／`partner_driver` tài xế ủy thác／`parcel_carrier` công ty vận tải), **`service_form`** (chuyến COOL／chuyến giao hàng ES = **do phân loại giao hàng giữ**), **relay** (có／không trung chuyển = **dẫn xuất từ route legs**) | [Quyết định v2.1 #7] [Yêu cầu REQ-DL-874・875・876]. `service_form` không đặt ở tuyến đường của hợp đồng. relay không lưu như trạng thái |
| Vận đơn | Số vận đơn (**nhiều số cho 1 dữ liệu giao hàng = 1-nhiều**), bên phát hành | **Không có nhiều dữ liệu giao hàng trong 1 vận đơn** (= không có xuất hàng gộp) [Quyết định #54]. Chuyến lấy hàng thì **ES đánh số** (**số giao hàng + số thùng 2 chữ số**・`issued_by = es_generated`) [Quyết định #55] [Quyết định v2.3 #47] |
| **`plan lifecycle`** | **`draft` ／ `published` ／ `locked`**, `locked_at`, `locked_source` (giá trị chỉ có 1 là `ship_order_sent`) | [Quyết định v2.1 #3・S5] [Yêu cầu REQ-DL-867・883]. **Máy trạng thái khác** với `delivery status` |
| **`delivery status`** | **Chờ xuất hàng／Đã xuất hàng／Đã nhận／Đã giao／Giao một phần／Chờ giao lại／Đang xác nhận／Dừng／Hủy** | [Yêu cầu REQ-DL-751~756]. Xuất phiếu giao hàng có điều kiện là **Chờ xuất hàng・Đã xuất hàng** [Yêu cầu REQ-DL-316]. `draft` không giữ và là "—" |
| Yêu cầu thay đổi | Có thể thay đổi／Đang yêu cầu／Đang đề xuất／Đã điều chỉnh／Không thể thay đổi | Gắn cho cả kế hoạch giao hàng và dữ liệu giao hàng. Là trục khác với `delivery status` [Yêu cầu REQ-DL-754] |
| Thực tích | Ngày giờ hoàn tất giao hàng, số lượng dự kiến／đã giao theo sản phẩm, **sản phẩm bị thay thế** (`substituted_from_product_id` [Quyết định v2.3 #39]), ~~hạn sử dụng・hạn tiêu thụ~~ (xóa 2026/10/01: không theo dõi hạn [Ứng dụng tài xế_điểm sửa đặc tả_20260930 No.4]), tồn kho thực, báo cáo trước・sau trưng bày, hủy bỏ, `completion_source` (`reported`／`presumed`／`customer`) | Chênh lệch giữa kế hoạch và giao hàng hiển thị bằng chữ đỏ. Phân biệt và lưu lại trường hợp xem như hoàn thành |
| Thu tiền | Số tiền dự kiến thu, số tiền thực thu (0 yên thì kiểm soát ẩn, không hiển thị phí đỗ xe). **Khi số tiền dự kiến thu và số tiền thực thu của phần đã chọn thanh toán tiền mặt trên ứng dụng khác nhau thì đưa chênh lệch theo cơ sở・tháng (dự kiến thu − thực thu) vào quyết toán thực tích** (thiếu = thanh toán・thu nhiều = giảm trừ. 2026/09/29 [xung quanh đơn đăng ký 28-135]) | [Yêu cầu REQ-DL-415・315] |
| Tài xế | **Phân công theo đơn vị chặng (leg)**, và thời điểm nhận・người nhận của từng chặng (`picked_up_at`・`picked_up_by`) [Quyết định v2.3 #49] | **Chặng của công ty vận tải (`parcel_carrier`) không phân công, chặng của tự công ty・ủy thác thì phân công** [Quyết định v2.3 #48] (Cũ: tạm thời trong vận hành chỉ phân công chặng 2 〈điểm trung chuyển→nơi giao〉 [Quyết định #60]. Thay thế 2026/09/29) |
| Đính kèm ①: Tài liệu của địa điểm | Sơ đồ đường vận chuyển vào, sổ tay cơ sở, quy trình giữ tại văn phòng, hướng dẫn bãi đỗ xe | **Gắn với master cơ sở・master điểm trung chuyển**. Không sao chép vào dữ liệu giao hàng mà hiển thị bằng tham chiếu [Yêu cầu REQ-DL-826・827] |
| Đính kèm ②: Tài liệu của lần giao hàng này | Ảnh báo cáo trước・sau trưng bày・báo cáo đỗ xe・báo cáo thu tiền・báo cáo giao hàng | **Gắn với 1 dữ liệu giao hàng này**. Số nhánh là hàng khác nên không kế thừa |
| Yêu cầu | Yêu cầu thay đổi ngày giao (tên người yêu cầu, ngày giao hiện tại, ngày mong muốn, lý do, căn cứ phán định, trạng thái phê duyệt) | [Yêu cầu REQ-DL-305]. Giữ kế hoạch gốc cho đến khi phê duyệt |

---

### 7-9. Đơn hàng và timeline của chiến dịch dùng thử (bổ sung 6 ngày 2026/09/29)

[28-95・96・98・101~105]

| Mục | Triển khai chính thức | **Chiến dịch dùng thử** |
|---|---|---|
| Thời điểm tạo đơn hàng | Đăng ký tạm (hoàn tất xác nhận nội dung đăng ký). Doanh nghiệp nhập | Đăng ký tạm (hoàn tất xác nhận nội dung đăng ký) thì **tự động sinh** |
| Tài khoản | Có thể nhập nếu có cơ sở hoặc tài khoản doanh nghiệp đã có. Nếu không có cả hai thì đến hạn chốt dùng số lượng tiêu chuẩn | **Không có vẫn tạo** |
| Số lượng | Doanh nghiệp nhập (giá trị ban đầu là số lượng tiêu chuẩn) | **Chia giới hạn số lượng cung cấp hàng tháng của gói cho toàn bộ sản phẩm**. Việc phân bổ cho số lần giao hàng giống §4.4, chênh lệch giữa các lần tối đa 1 (phần lẻ dồn vào lần giao đầu tiên) |
| Doanh nghiệp chỉnh sửa | Đến hạn chốt đặt hàng | **Không được** |
| Vận hành tinh chỉnh | — | Sửa được **cả số lượng lẫn sản phẩm**. **Đến ngày chốt đặt hàng (nhập hàng)** |
| Ngày chốt chuẩn | Hạn chốt đặt hàng (ngày 15 tháng trước・giá trị phía menu) | **Ngày chốt đặt hàng (nhập hàng) = ngày thứ 7 của tuần B・tuần D (B7・D7)**. 2 lần trong chu kỳ (STEP5 T1: đổi từ B5・D5. Hạn tinh chỉnh của bộ phận vận hành cũng là B7・D7) |
| Bắt đầu giao hàng | Từ A1 của tháng chu kỳ bắt đầu | **Nếu kịp B7 thì từ tuần A của chu kỳ tiếp theo (cả nửa đầu・nửa sau)／nếu kịp D7 thì từ nửa sau (tuần C) của chu kỳ tiếp theo**. Chu kỳ bắt đầu từ nửa sau cũng được tính là tháng thứ nhất của thời gian dùng thử. Với dùng thử có số lần giao hàng từ 2 trở lên mà kịp D7 thì từ tuần A của chu kỳ cách 2 chu kỳ. Nếu quá thì xử lý theo ngày chốt đặt hàng tiếp theo |
| Bộ thiết lập ban đầu của vật tư | Sinh tự động・miễn phí (7-5) | Sinh tự động・miễn phí (7-5) |

- Ngày chốt đặt hàng (nhập hàng) được tính từ ngày của slot chu kỳ giao hàng (B7・D7). Không giữ bảng lịch mới (`配送_11` 14.12 【đề xuất】).
- Ví dụ: Chu kỳ tháng 10/2026 (A1 = 2026/10/12). Nếu hoàn tất xác nhận nội dung đăng ký trước B7 = 2026/10/25 thì giao từ chu kỳ tháng 11/2026 (A1 = 2026/11/09), nếu trước D7 = 2026/11/08 thì giao từ nửa sau (tuần C 2026/11/23~) của chu kỳ tháng 11/2026 (STEP5 T1・2026/10/01).
- Khi bắt đầu từ nửa sau, nếu chuyến của hợp đồng là slot nửa đầu (ví dụ A2) thì chỉ chu kỳ đầu tiên, bộ phận vận hành chọn slot nửa sau (ví dụ C2) ở xác nhận nội dung đăng ký. Từ chu kỳ tiếp theo trở lại slot của hợp đồng (STEP5 T1'''').
- Cách tạo hợp đồng・hợp đồng con của dùng thử (chỉ đúng số tháng của thời gian dùng thử・không tự động gia hạn) giữ như trước.

## 8. Thay đổi・Khóa・Tạm ngừng・Hủy hợp đồng

### 8-1. Nơi phản ánh yêu cầu thay đổi (phương thức override đã phê duyệt)

"Điều chỉnh chỉ lần này" đã được phê duyệt được giữ như **dữ liệu độc lập**, không phải cờ của kế hoạch [Chu kỳ §4A-4] [Yêu cầu REQ-DL-612・769]. Vì kế hoạch là dữ liệu tạo lại từ thiết lập mỗi lần (7-2), nếu đặt thông tin muốn lưu lâu dài vào đó thì sẽ hỏng (phương thức cờ `pinned` cũ đã bị hủy). **Những lý do mang tính thường xuyên như thứ không thể giao hàng・ngày không thể nhận không làm override mà đặt thành ràng buộc của cơ sở** [Quyết định #31].

Override giữ: **đối tượng** (hợp đồng 〈cơ sở〉＋dòng chi tiết giao hàng＋phân loại giao hàng＋**ngày giao tại thời điểm phê duyệt**), **loại** (`move` = dịch chuyển ngày／`skip` = lần này không giao／`fix` = bộ phận vận hành chỉ định riêng 〈8-3〉), **ngày sau thay đổi** (**giữ bằng ngày tuyệt đối.** Không giữ theo kiểu tương đối như "sớm 1 ngày"), **bên yêu cầu・kiểm toán** (`Doanh nghiệp`／`Vận hành`, lý do・tên người yêu cầu・người phê duyệt・ngày giờ phê duyệt [Yêu cầu REQ-DL-305]), **snapshot căn cứ** (ngày picking・kho・tuyến đường・loại chuyến・số lượng・phiên bản thiết lập tại thời điểm phê duyệt), **trạng thái và ngày giờ kiểm tra cuối** (`Đang áp dụng`／`Chưa áp dụng (cần xác nhận)`／`Mất hiệu lực`／`Hủy`・8-5).

**Xử lý khi phê duyệt thay đổi tùy theo nơi yêu cầu.** Kế hoạch `draft` thì tạo override và áp dụng mỗi lần sinh lại (không đặt cờ cho chính kế hoạch). Dữ liệu giao hàng `published` thì ghi đè trực tiếp ngày xuất hàng・ngày giao, **đồng thời tạo override cùng nội dung** (để không mâu thuẫn với kế hoạch được sinh lại). `locked` **không thể yêu cầu**, bộ phận vận hành điều chỉnh ngoài hệ thống (8-2・8-4).

**Phán định tái neo (khi chu kỳ thay đổi)**

| Tình huống | Xử lý |
|---|---|
| Ngày giao đối tượng vẫn tồn tại sau khi sinh lại | **Áp dụng.** Hiển thị "Đã điều chỉnh" ở kế hoạch |
| Ngày giao đối tượng không còn (đổi ngày đầu・nghỉ trọn tuần・đổi số lần) | **Mất hiệu lực.** Đưa vào cần xác nhận, đồng thời lưu vào lịch sử yêu cầu của doanh nghiệp |
| Ngày sau thay đổi không còn giao hàng được | Không áp dụng mà chuyển **đang đề xuất** (bộ phận vận hành đưa ra ngày thay thế) |
| Ngày sau thay đổi hợp lệ nhưng picking・giao hàng không đáp ứng được | **Đang đề xuất** (8-5) |

**Câu chữ của "Đã điều chỉnh"** (không giải thích bằng thể phủ định): Giải thích badge trạng thái = "Đây là ngày do bộ phận vận hành quyết định. Hệ thống không di chuyển bằng tính toán tự động"／Thông báo phê duyệt cho doanh nghiệp = "Đã chốt vào 〈ngày〉. Nếu cần thay đổi chúng tôi sẽ liên hệ"／Khi bộ phận vận hành dịch chuyển = "Do 〈lý do〉 nên quyết định lại ngày. Vui lòng liên hệ doanh nghiệp" [Nguồn gốc: Thiết lập chu kỳ giao hàng §3.4] [Yêu cầu REQ-DL-791].

**Danh sách override chưa áp dụng chính là thực thể của "cần xác nhận" của bộ phận vận hành.** Dù xóa `draft` do tạm ngừng・hủy hợp đồng, override vẫn còn lại ở dạng `Hủy` kèm lý do (8-7), nên phê duyệt sẽ không bị biến mất âm thầm.

### 8-2. Điểm khởi đầu của `locked`

**Trigger để thành `locked` chỉ có 1. Là thời điểm chỉ thị xuất hàng được gửi thành công lần đầu** [Quyết định v2.1 #3] [Chu kỳ §4A-3] [Yêu cầu REQ-DL-867].

| Nguyên nhân | Có chuyển sang `locked` không |
|---|---|
| **Lần gửi đầu tiên chỉ thị xuất hàng thành công** (gửi cho Thomas, phía bên kia đã nhận) | **Có (trigger duy nhất)** |
| Chỉ mới xuất (tạo) chỉ thị xuất hàng | **Không** |
| Gửi chỉ thị xuất hàng thất bại／nâng phiên bản bằng gửi lại | **Không** (gửi lại chỉ nâng số phiên bản, không dịch chuyển điểm khởi đầu của `locked`) |
| **Số vận đơn đã được liên kết** | **Không** [Quyết định v2.1 #3] [Yêu cầu REQ-DL-867] |

- Dữ liệu được giữ bằng `deliveries.locked_at` (sao chép `ship_orders.sent_ok_at`) và `locked_source` (giá trị chỉ có 1 là `ship_order_sent`) [Chu kỳ §7]. Vào thời điểm tạo tệp xuất thì kho chưa hoạt động, nên nếu gửi thất bại thì không có căn cứ để chuyển sang `locked`.
- **(Cũ: lần 1 "sớm hơn giữa đã xuất chỉ thị xuất hàng／số vận đơn đã được liên kết", "điểm khởi đầu của `locked` = thời điểm xuất tệp gộp 2 tuần". Lần 2 ngày 2026/09/21 đổi thành "gửi thành công")**

**Nếu vận đơn xuất hiện trước thì phát hiện và thông báo như anomaly** [Quyết định v2.1 #3] [Yêu cầu REQ-DL-868]

Nếu dữ liệu giao hàng đó **không có bản ghi gửi thành công chỉ thị xuất hàng** mà đã gắn số vận đơn (`delivery_tracking_numbers`) thì **phát hiện là anomaly**, đưa ra cần xác nhận "Số vận đơn đã được gắn trước chỉ thị xuất hàng: N mục". **Không chuyển sang `locked`.** Nhặt bằng batch hằng ngày `tracking_anomaly_detect` (07:00).

**Việc xuất gộp 2 tuần vẫn giữ như quy định về "khi nào gửi".** Chỉ thị xuất hàng được xuất **gộp 2 tuần A＋B tuần／C＋D tuần, vào 3 ngày trước ngày bắt đầu 2 tuần đó (thứ Sáu)** (N = `ship_order_lead_days` của master kho, mặc định 3 ngày) [Yêu cầu REQ-DL-812]. Hiển thị trên màn hình việc đã xuất hay chưa・ngày giờ xuất lần cuối・số phiên bản. **Đây là chuyện thời điểm xuất, không phải điểm khởi đầu của `locked`.**

Do đó **không phải "phần của tháng này locked cùng lúc"**. Dù cùng tháng thì lần lượt từ phần đã gửi thành công sẽ thành `locked`, kế hoạch nửa sau tháng vẫn ở `published` một lúc. Dữ liệu giao hàng đã thành `locked` thì không đưa trở lại.

`locked` có nghĩa là "**không ghi đè kế hoạch (ngày)**", vẫn có thể đăng ký thực tích・đổi trạng thái・thêm bản ghi tiếp theo (8-4) [Chu kỳ §4A-4B].

### 8-3. Chính sách thay đổi ngày

> **Sửa đổi 2026-10-02 (sổ quyết định L "Dịch chuyển ngày giao hàng". hong trả lời: danh sách vấn đề 2-4・tối 2026/10/02, 4b・2026/10/03). "Quy định hiện tại" bên dưới là chuẩn.** Bảng và giải thích phía dưới đó (điểm phân chia chỉ có duy nhất "hạn chốt đặt hàng"・không dịch chuyển được từ màn hình lịch) là quy định cũ, được giữ lại như quá trình.

**Quy định hiện tại: Điểm phân chia là "thời kỳ đặt hàng chính thức" (2 lần/tháng)**

Thời kỳ đặt hàng chính thức: nửa đầu (chuyến tuần A・B) = B5~C1 của chu kỳ trước, nửa sau (chuyến tuần C・D) = D5~A1 của chu kỳ tiếp theo (`55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §1). Phán định là đã qua điểm kết thúc của thời kỳ đặt hàng chính thức của nửa chuyến đó hay chưa.

| Giai đoạn | Làm được gì | Cửa vào | Lý do | Nơi di chuyển |
|---|---|---|---|---|
| **Trước khi kết thúc thời kỳ đặt hàng chính thức** | Dịch chuyển được **bao nhiêu chuyến cũng được** | Lịch của bộ phận vận hành: **chọn bằng ô chọn** (1 mục・nhiều mục・toàn bộ trong ngày) → chọn ngày di chuyển đến. **Không kéo thả** | Tùy ý | Trong cùng chu kỳ (nửa của nơi di chuyển đến cũng phải trước đặt hàng chính thức) |
| **Sau đặt hàng chính thức ~ trước ngày xuất hàng 1 ngày** | **Chỉ 1 chuyến** (đông lạnh・lạnh cùng cơ sở・cùng ngày di chuyển cùng nhau = 1 chuyến). Nếu chọn nhiều thì không dịch chuyển được (hiển thị lý do) | Giống trên | **Bắt buộc** | **Chỉ trong cùng nửa (A↔B／C↔D)** |
| Sang chu kỳ (tháng) khác・nửa khác sau đặt hàng chính thức | **Chỉ khi xử lý sự cố**. Chọn 1 sự cố đã ghi nhận・bắt buộc có lý do・hiển thị xác nhận | Giống trên | Bắt buộc | — |
| Từ ngày xuất hàng trở đi | Không dịch chuyển. Hủy + sao chép (8-4) | — | Bắt buộc | — |

- **Đến trước ngày xuất hàng 1 ngày** (ngày xuất hàng hiện tại・ngày xuất hàng mới là từ ngày mai trở đi) thì không thay đổi. Ngày xuất hàng **dịch chuyển cùng nhau giữ lead time của hợp đồng**. Không đổi chuyến (slot).
- Dù nơi di chuyển đến là **ngày không giao hàng** (cơ sở nghỉ・ngày lễ・Chủ nhật v.v.) cũng **không chặn**. Xác nhận "Bạn có thực sự di chuyển không? Đã xác nhận với khách hàng chưa?" rồi mới dịch chuyển.
- **Ngày kho không thể xuất hàng** (slot không thể xuất hàng・ngày cấm xuất hàng・ngày cấm xuất hàng của kho đó) không chọn được. Chỉ chặn theo lịch của kho (không chặn đồng loạt theo thứ).
- Khi số lượng・số tài xế nhiều thì cảnh báo (không chặn).
- Nếu đã gửi chỉ thị xuất hàng thì **nâng phiên bản và gửi lại**. Thông báo cho nơi giao hàng ủy thác・tài xế. Thông báo cho doanh nghiệp (P11 bên dưới) không thay đổi.
- Ghi nhận: lịch sử dịch chuyển (trước thay đổi → sau thay đổi・lý do・người thao tác).
- Dù dịch chuyển A1, ngày chốt đặt hàng (do menu giữ) không thay đổi (danh sách vấn đề 4b-10).

**(Cũ) Quy định đến 2026/09/29**

**Thay đổi ngày được quyết định theo 2 giai đoạn: trước hay sau hạn chốt đặt hàng** [Quyết định v2.2 #1] [Chu kỳ §4A-5・§4A-4D] [Yêu cầu REQ-DL-865・866・817・735・886].

| Giai đoạn | Làm được gì | Cửa vào | Nhập lý do | Đối tượng |
|---|---|---|---|---|
| **Trước hạn chốt đặt hàng** | Bộ phận vận hành có thể thay đổi **dù 1 mục hay hàng loạt** | Màn hình lịch／chi tiết dữ liệu giao hàng (màn hình 06) | **Tùy ý** [Quyết định #26] | Không giới hạn |
| **Sau hạn chốt đặt hàng ~ trước ngày xuất hàng 1 ngày** | **Bộ phận vận hành thay đổi từng mục một** (không hàng loạt) [Quyết định v2.3 #63] | "Chỉnh sửa" ở chi tiết dữ liệu giao hàng | **Bắt buộc** | **Cùng nửa đầu／nửa sau của cùng chu kỳ**・ngày xuất hàng dịch chuyển cùng nhau giữ lead time của hợp đồng |
| Từ ngày xuất hàng trở đi | Không thay đổi ngày. Xử lý bằng hủy + sao chép (8-4) (Cũ: sau hạn chốt tất cả là hủy + sao chép・Quyết định v2.2 #1) | — | Lý do hủy・sao chép bắt buộc | — |

- **Điểm phân chia chỉ có duy nhất "hạn chốt đặt hàng"** [Quyết định v2.2 #1]. Làm thành một đường duy nhất: khi số lượng được chốt thì ngày giao cũng được cố định.
- **`locked` không phải là mốc của thay đổi ngày.** `locked` (lần gửi đầu tiên chỉ thị xuất hàng thành công) chỉ còn lại **như mốc của chỉ thị xuất hàng**, việc có thể thay đổi ngày hay không được phán định bằng đã qua `order_close_date` hay chưa [Yêu cầu REQ-DL-886].
- **(Cũ: 3 giai đoạn trước hạn chốt／sau hạn chốt・trước `locked`／sau `locked`. Sau hạn chốt・trước `locked` thừa nhận ngoại lệ "chỉ bộ phận vận hành từng mục một・bắt buộc có lý do・giới hạn ở bản ghi cần xác nhận". Hủy bỏ bởi quyết định lần 3 ngày 2026/09/22)**. Phần ngày lễ・ngày không thể xuất hàng tăng thêm về sau thì **nếu trước ngày xuất hàng 1 ngày thì sửa từng mục từ "Chỉnh sửa" ở chi tiết dữ liệu giao hàng** [Quyết định v2.3 #63] (thay đổi 2026/09/29. Cũ: tạo lại bằng hủy + sao chép 〈Quyết định v2.2 #1〉). Từ ngày xuất hàng trở đi là hủy + sao chép.
- ~~Nhờ đó, mối lo vận hành "khi kỳ nghỉ dài v.v. phát sinh nhiều thay đổi sau hạn chốt thì bộ phận vận hành có xoay xở kịp không" (§18 No.2 cũ) đã được giải quyết [Quyết định v2.2 #1].~~ (Hủy bỏ 2026/09/29: vì sau hạn chốt cũng cho phép thay đổi từng mục 〈Quyết định v2.3 #63〉, nên mối lo vận hành khi số lượng nhiều vẫn còn. Đích thay đổi giới hạn trong cùng nửa đầu／nửa sau)
- **UPDATE ngày sau hạn chốt chỉ cho qua khi ① đến trước ngày xuất hàng 1 ngày ② cùng chu kỳ・cùng nửa đầu／nửa sau ③ 1 mục ④ có lý do** [Quyết định v2.3 #63]. Nếu không thỏa thì `DOMAIN_ORDER_CLOSED` (hết hạn)／`DOMAIN_DATE_OUT_OF_RANGE` (ngoài phạm vi・【đề xuất】). Không đổi kho picking (hủy + sao chép). Chỉ thị xuất hàng đã gửi thì gửi lại bằng phiên bản mới. Đông lạnh・lạnh cùng cơ sở・cùng ngày giao dịch chuyển cùng nhau. **(Cũ: sau hạn chốt từ chối UPDATE ngày, cũng không có nhánh ngoại lệ dành cho bộ phận vận hành [Quyết định v2.2 #1]. Sửa lại ở bổ sung 8 ngày 2026/09/29)**
- **Thông báo cho doanh nghiệp khi đổi ngày giao・ngày gửi hàng (ngày xuất hàng)** là **hiển thị ngày giao mới nhất ở thông báo trên trang chủ Web doanh nghiệp**. **Khi bộ phận vận hành đổi sau hạn chốt thì cũng gửi mail** (bằng ngày mới nhất. Người phụ trách chính・phụ). Thay đổi trước hạn chốt thì ngày mới nhất đã có trong mail xác nhận nên không gửi mail bổ sung (thay đổi 2026/10/01・P11. Cũ: không gửi mail 〈2026/09/30〉) [Bảng yêu cầu dòng 134・Quyết định_phản ánh một phần bảng yêu cầu_trả lời_20260930].
- **Dù lý do trống, lịch sử thay đổi vẫn nhất định lưu trước thay đổi → sau thay đổi và người thao tác.** Bảo đảm luôn truy được "ai, khi nào, đổi cái gì thành cái gì" không có ngoại lệ [Quyết định #26].
- Các thao tác **di chuyển hàng loạt** như thay đổi hàng loạt・hủy・dừng・sao chép・hủy override **vẫn bắt buộc có lý do như trước**.

**Cách dùng "chỉ định ngày riêng"** [Chu kỳ §4A-4D] [Yêu cầu REQ-DL-750]

Thay đổi ngày ở màn hình lịch dịch chuyển ngày picking và ngày giao **cùng nhau giữ lead time**. **Chỉ khi muốn đổi lead time để quyết định riêng từng ngày** thì dùng "Chỉ định ngày riêng" ở chi tiết dữ liệu giao hàng (cửa vào chỉ 1 nơi là để tránh việc thay đổi hàng loạt làm sai lệch lead time ngoài ý muốn).

Điều kiện không thể lưu: **ngày xuất hàng (ngày picking)** = ngày quá khứ／ngày không thể xuất hàng (ngày nghỉ định kỳ của kho・slot không thể)／nghỉ chu kỳ／sau ngày giao／lead time quá 7 ngày, **ngày giao** = ngày quá khứ／thứ không thể giao／ngày xử lý như ngày lễ giao hàng／nghỉ chu kỳ／chu kỳ khác, **lý do** = trước hạn chốt không có điều kiện chặn lưu. **Sau hạn chốt không dùng "chỉ định ngày riêng"** (thay đổi ngày sau hạn chốt thì từ "Chỉnh sửa", dịch chuyển giữ lead time・bắt buộc có lý do) [Quyết định v2.3 #63] (thay đổi 2026/09/29. Cũ: sau hạn chốt vốn không thể thay đổi ngày nên cũng không có kiểm soát bằng ô lý do 〈Quyết định v2.2 #1〉). Hiển thị lý do bên dưới ô.

Lý do nhập bằng lựa chọn (yêu cầu của doanh nghiệp／yêu cầu thay đổi của doanh nghiệp／lý do của kho／lý do của công ty giao hàng／khác) + bổ sung. Lead time tính tự động, nếu khác hợp đồng thì hiển thị "Khác với lead time của hợp đồng (N ngày)". Ở tab tuyến đường giao hàng hiển thị "* Chỉ lần giao này có thay đổi (lead time)", có thể hủy bằng "Quay về thiết lập của hợp đồng". Lịch sử thay đổi lưu theo dạng "Ngày giao A → B／Ngày picking C → D (lead time N ngày → M ngày)・lý do". Việc tự động đẩy sớm do ngày không thể xuất hàng (8-6) không phải chỉ định riêng, lead time được xử lý như giá trị của hợp đồng [Nguồn gốc: Thiết lập chu kỳ giao hàng §4A-4D].

Khi lưu thì chỉ phản ánh vào dữ liệu giao hàng này, và giữ như override đã phê duyệt với `override_type = fix` (8-1). Hiển thị là **Đã điều chỉnh**, không đổi lead time của hợp đồng, từ sau đó khi dịch chuyển ở màn hình lịch thì giữ lead time đã chỉ định riêng. Người thao tác được chỉ có **quản trị viên vận hành** (**vai trò `Quản trị viên kho` không tồn tại** [Quyết định v2.1 #2] [Yêu cầu REQ-DL-885]).

### 8-4. Sao chép (giao lại・giao từng phần・chuyến thay thế)

Giao lại・giao từng phần・chuyến thay thế đều là xử lý "**không ghi đè bản ghi gốc mà tạo thêm 1 dữ liệu giao hàng cùng nội dung**". Không liệt kê từng chức năng riêng lẻ mà chuẩn bị **sao chép như một thao tác cơ bản**, phân biệt cách dùng theo lý do [Chu kỳ §4A-4C] [Yêu cầu REQ-DL-638・639].

**Không thể sao chép từ `draft`** [Quyết định v2.1 #5] [Yêu cầu REQ-DL-872]

| `plan lifecycle` gốc | Làm được gì |
|---|---|
| **`draft` (kế hoạch giao hàng)** | **Chỉ "sao chép／thay đổi kế hoạch".** **Không thể** sao chép kèm `parent_delivery_id`・số nhánh・trạng thái `Đang xác nhận` |
| **`published`** | **Sao chép được** (kèm `parent_delivery_id`・số nhánh・`Đang xác nhận`) |
| **`locked`** | **Sao chép được.** Sao chép là tạo mới và không ghi đè bản gốc nên thực hiện được cả khi `locked` |

Kế hoạch không có dữ liệu giao hàng, không có vận đơn, không có thực tích. Dù tạo quan hệ cha con cũng không có nơi trỏ tới, và khi kế hoạch thành dữ liệu giao hàng bằng sinh chính thức thì cha con sẽ bị tạo hai lần. **(Cũ: lần 1 "sao chép thực hiện được từ bất kỳ `draft` / `published` / `locked` nào" đã bị hủy)**

**Cái được sao chép** = ID hợp đồng・doanh nghiệp・cơ sở・phân loại giao hàng (nhiệt độ) ／ kho picking・điểm trung chuyển・công ty giao hàng (tuyến đường giao hàng) ／ snapshot nơi giao (địa chỉ・điện thoại・người phụ trách・ghi chú・điều kiện nhận. **Chỉ "trả hàng" thì đổi nơi giao thành nơi trả hàng** [Quyết định v2.3 #41]) ／ tham chiếu đính kèm ① (tài liệu của địa điểm). **Cái không sao chép mà quyết định mới** = ngày giao・ngày picking ／ số vận đơn (cấp lại. Không cấp ở điểm trung chuyển) ／ số lượng (phân bổ bên dưới) ／ thực tích giao hàng・thu tiền・phân công tài xế・số túi giữ lạnh／gói giữ lạnh・đính kèm ② (tài liệu của lần giao hàng này).

**Số nhánh và quan hệ cha con**: Bản ghi tạo bằng sao chép gắn **số nhánh** vào ID giao hàng gốc (`DL-260820-0012` → `-1`, nếu chia tiếp thì `-2`). Tham chiếu cha bằng `parent_delivery_id`, **cha con chỉ 1 cấp**, số nhánh tối đa 9. Số chỉ thị của CSV chỉ thị xuất hàng cũng dùng cùng số nhánh [Yêu cầu REQ-DL-114]. **Phân bổ số lượng** quyết định theo mục đích, có thể chỉ định số còn lại theo từng sản phẩm.

| Mục đích | Bản ghi gốc | Bản ghi sao chép |
|---|---|---|
| **Giao từng phần** (hôm nay chỉ giao một phần, phần còn lại sau) | Chốt bằng số lượng đã giao thực tế, trạng thái thành **Giao một phần** | Số lượng còn lại. Đặt **ngày giao tạm**, trạng thái là **Đang xác nhận** |
| **Giao lại** (giao lại phần chưa đến) | Số lượng giữ nguyên. Trạng thái thành **Chờ giao lại** | Số lượng chưa đến. Đặt **ngày giao lại tạm**, trạng thái là **Đang xác nhận** |
| **Chuyến thay thế** (hủy trước khi xuất hàng và xuất bằng chuyến khác) | Trạng thái thành **Hủy** (giữ nguyên số lượng) | Toàn bộ số lượng. Thiết lập đổi kho・công ty giao hàng |
| **Trả hàng** (gửi trả sản phẩm còn lại về trụ sở v.v.・`duplicate_type = return`) | Giữ nguyên (Dừng・Giao một phần v.v.) | **Số còn lại.** **Chỉ mục đích này mới đổi được nơi giao thành nơi trả hàng** (chọn từ `warehouse_type = return` của master kho và giữ ở `deliveries.return_to_warehouse_id`. Snapshot địa chỉ là địa chỉ của nơi trả hàng). **Ngoài đối tượng thanh toán**. Quy tắc cha con 1 cấp・số nhánh giống các sao chép khác [Quyết định v2.3 #41] |

**Con được sao chép tạo ở "Đang xác nhận", bộ phận vận hành xác nhận rồi mới bắt đầu hoạt động** [Yêu cầu REQ-DL-649-2・799~801]. Phần đã giao được thì chốt trước làm thực tích ở bản ghi gốc, con của số còn lại・phần giao lại được tạo ở Đang xác nhận có ngày giao tạm và đưa vào cần xác nhận. **Không đưa vào đối tượng chỉ thị xuất hàng** cho đến khi bộ phận vận hành chọn một trong "Chốt ngày này" (→ Chờ xuất hàng)／"Đổi ngày" (→ Chờ xuất hàng)／"Dừng" (→ Dừng). Chỉ thị xuất hàng được xuất tự động gộp 2 tuần (8-2), nên nếu cứ để ngày tạm chạy qua thì kho sẽ hoạt động theo ngày mà không ai xem.

**Con tạo từ 1 đơn giao hàng xảy ra sự cố tối đa 1 mục** [Quyết định v2.3 #21・#29] [DEV §9.4・§15.11]. Nếu có **con tự động** (`duplicate_type=trouble_pending`・`creation_source=trouble_auto` [Quyết định v2.3 #30]) do hệ thống tạo cùng lúc với đăng ký báo cáo thì sao chép thủ công sẽ **dùng lại** con đó (giao từng phần = `remainder`・số còn lại, giao lại = `redelivery`・toàn bộ số lượng, ghi đè), không tạo mục thứ 2 (`DOMAIN_TROUBLE_CHILD_EXISTS`). Con tự động cũng tuân theo **quy tắc của mục này** (cha con 1 cấp・số nhánh 1~9・các mục sao chép／không sao chép). **Khi con xảy ra sự cố thì không sao chép từ con mà tạo số nhánh tiếp theo của cha (ví dụ sự cố của `-1` → `-2`), nội dung sao chép từ con đã xảy ra sự cố**. Nếu số nhánh vượt 9 thì đưa vào cần xác nhận bằng `DOMAIN_BRANCH_LIMIT` [Quyết định v2.3 #28]. Con do bộ phận vận hành tạo là `creation_source=ops_duplicate`. Khi đưa con sang chờ xuất hàng thì đặt **cả `schedule_confirmed` và `quantity_confirmed` là true** (điều kiện của chỉ thị xuất hàng・10-1) [Quyết định v2.3 #23・#24].

**Vận đơn là 1-nhiều**. **1 dữ liệu giao hàng gắn nhiều số vận đơn (theo từng thùng), và không có nhiều dữ liệu giao hàng trong 1 vận đơn** (= không có xuất hàng gộp) [Quyết định #54] [Yêu cầu REQ-DL-833]. Khi sao chép thì con nhận số mới, số của cha vẫn ở cha. Vì việc tài xế nhận hàng・chuyến giao COOL kiểm tra theo đơn vị vận đơn nên cần biểu thị được việc một phần chưa nhận・một phần đã giao theo đơn vị vận đơn.

**Những gì sửa được dù đã giao** — Cái bị khóa là **việc chỉ định ngày・tuyến đường・số lượng**, **thực tích và tài liệu đính kèm không bị khóa**.

Ngày giao・ngày picking／kho・công ty giao hàng・trung chuyển・lead time／số lượng **không thể thay đổi** (xử lý bằng hủy・sao chép). **Thực tích giao hàng** (ngày giờ hoàn tất・số đã giao・ghi chú) **sửa được** (bắt buộc có lý do・lưu vào lịch sử thay đổi), **đính kèm ② (tài liệu của lần giao hàng này)** **thêm・thay thế được** (lưu vào lịch sử thay đổi).

**Dù nhận liên hệ sau khi giao cũng không đưa `Đã giao` quay lại `Đang xác nhận`** [Quyết định v2.3 #20]. Ghi báo cáo sự cố và mở cần xác nhận, bộ phận vận hành (logistics) giải quyết (11-7・13-2). Không đặt hạn tiếp nhận liên hệ (bộ phận vận hành quyết định) [Quyết định #61]. Khi sửa thực tích sau khi thanh toán đã chốt cũng không truy hồi thanh toán, mà phản ánh vào tháng sau bằng **điều chỉnh trong ①trả trước・②quyết toán thực tích** [Quyết định #70]. (Cũ: không đặt hạn đưa đã giao quay lại "Đang xác nhận". Hủy bỏ 2026/09/24)

### 8-5. Tính khả thi thực hiện sau khi phê duyệt

"Đã điều chỉnh" là cam kết **không di chuyển bằng tính toán tự động của hệ thống**, chứ không có nghĩa là tiền đề đã thành lập tại thời điểm phê duyệt sẽ không sụp đổ về sau [Chu kỳ §4A-4E]. Batch hằng ngày `plan_recheck` (03:00) chạy lại các kiểm tra trước phê duyệt 1~6 của override đang áp dụng mỗi ngày, ghi kết quả vào `Ngày giờ kiểm tra cuối`. Những mục sụp đổ được đưa vào cần xác nhận ("Ngày đã phê duyệt không còn thành lập vì ◯◯"／số lượng picking của ngày đó vượt giới hạn／**vào 3 ngày trước và ngày trước ngày giao, chặng được phân công không có tài xế** (cũng hiển thị trên Web công ty giao hàng ủy thác, gửi mail cho công ty giao hàng ủy thác・12-1) (thay đổi 2026/09/30. Cũ: đến ngày trước ngày giao mà chặng được phân công vẫn không có tài xế [Quyết định v2.3 #43・#48]) [Bảng yêu cầu dòng 142・Quyết định_phản ánh một phần bảng yêu cầu_trả lời_20260930] (Cũ: còn dưới 1 tuần trước ngày giao mà chưa phân công tài xế. Thay thế 2026/09/29). Trước đó thì xem ở badge "Chưa phân công N mục" trên hiển thị tháng・tuần).

**Thứ tự di chuyển khi số lượng vượt**: ① `draft` (không có override. Tự động đẩy sớm・điều chỉnh) → ② `published` (không có override. Đưa vào cần xác nhận và bộ phận vận hành thay đổi hàng loạt) → ③ **Đã điều chỉnh (cuối cùng. Nếu di chuyển thì nhất định phải thỏa thuận lại với doanh nghiệp)**.

**Thủ tục khi quyết định không thể đáp ứng** được đưa vào chuyển đổi yêu cầu thay đổi ở 7-7. Bộ phận vận hành phán đoán "ngày này không thể đáp ứng" (bắt buộc có lý do) và hạ **Đã điều chỉnh → Đang đề xuất**, nếu doanh nghiệp chấp nhận thì thay override bằng ngày mới và thành **Đã điều chỉnh**, nếu từ chối thì **giữ Đang đề xuất** và điều chỉnh với bộ phận vận hành. **Nếu đến hạn mà không có phản hồi thì bộ phận vận hành quyết định và thành Đã điều chỉnh, bắt buộc liên hệ kèm lý do**.

**Biện pháp có thể dùng theo thời điểm sụp đổ**: Trước sinh chính thức (kế hoạch) thì hạ xuống đang đề xuất và thỏa thuận lại (ảnh hưởng chỉ ngày)／Sau sinh chính thức・trước chỉ thị xuất hàng (Chờ xuất hàng) cũng giống nhưng số lượng đã chốt nên giao từng phần・chuyến riêng cũng thành lựa chọn／Sau chỉ thị xuất hàng (`locked`) thì hủy + sao chép ở 8-2・8-4, hoặc chờ giao lại／Trong ngày thì xử lý bằng chuyển đổi `delivery status` (7-7).

**Ngoại lệ thông báo**: Nguyên tắc "cần xác nhận chỉ hiển thị trên màn hình vận hành, không thông báo cho doanh nghiệp", nhưng **chỉ khi bộ phận vận hành thực sự dịch chuyển ngày đã điều chỉnh, và khi override mất hiệu lực** thì lưu kèm lý do vào lịch sử yêu cầu của doanh nghiệp và lịch của doanh nghiệp (không gửi push・mail). Vì nếu ngày đã phê duyệt bị thay đổi âm thầm thì chính cơ chế yêu cầu thay đổi sẽ không còn được tin cậy.

### 8-6. Quy tắc tính lại, và khi thay đổi ngày không thể xuất hàng giữa chừng

**Khi thay đổi thiết lập (ngày lễ・tạm ngừng・slot không thể xuất hàng・lead time v.v.) có hiệu lực** [Chu kỳ §4A-5] [Yêu cầu REQ-DL-612・721]

| Đối tượng | Xử lý |
|---|---|
| `draft` (không có override) | Sinh lại. Hiển thị trên màn hình doanh nghiệp cũng tự động cập nhật |
| `draft` (có override) | Sinh lại rồi áp dụng lại override. Nếu không áp dụng được thì mất hiệu lực hoặc đang đề xuất (8-1) |
| `published` | **Không tính lại.** Hiển thị ở "cần xác nhận" của màn hình lịch vận hành, xử lý bằng thay đổi hàng loạt |
| `locked` | Ngoài đối tượng |

Cần xác nhận hiển thị doanh nghiệp・cơ sở・ngày giao・lý do thay đổi đối tượng, và có thể chuyển sang thay đổi hàng loạt từ đó. **Cần xác nhận chỉ hiển thị ở cảnh báo của màn hình lịch vận hành**, không gửi push・mail cho doanh nghiệp.

**Khi thay đổi ngày không thể xuất hàng giữa chừng — hoán đổi cả ngày picking và ngày giao** [Quyết định #15] [Chu kỳ §4A-5B]. Quy trình: ① Trước tiên chỉ đẩy sớm ngày picking, xem có nằm gọn với chênh lệch 0 so với lead time hợp đồng không (picking 8/19→8/18, giao vẫn 8/21) ／ ② Nếu không gọn với chênh lệch 0 thì dịch ngày giao theo "đẩy sớm・lùi muộn" của hợp đồng và **hoán đổi cả hai** (picking 8/18, giao 8/20) ／ ③ Nếu vẫn không gọn thì chọn cặp có chênh lệch nhỏ nhất và đưa vào cần xác nhận.

| Trạng thái | Xử lý |
|---|---|
| `draft` (không có override) | **Tự động đẩy sớm**. Hiển thị lịch của doanh nghiệp cũng tự động cập nhật |
| `draft` (có override・đã điều chỉnh) | Trước tiên chỉ đẩy sớm ngày picking. Nếu cần dịch cả ngày giao thì **không tự động dịch mà chuyển đang đề xuất** (vì là ngày đã thỏa thuận với doanh nghiệp) |
| `published` | **Không dịch chuyển.** Đưa vào cần xác nhận, bộ phận vận hành xử lý bằng thay đổi hàng loạt |
| `locked` | **Ngoài đối tượng.** Xử lý bằng liên hệ điện thoại + hủy, hoặc sao chép (8-2・8-4) |

Khi không thể đẩy sớm (ngày trước đó cũng không thể, lead time dài quá v.v.) thì không tự động dịch mà đưa vào cần xác nhận với nội dung **"không thể sinh kế hoạch"**. Trường hợp trong vòng 20 ngày không tìm được ngày giao nào cũng giống vậy, **không tự động quyết định ngày** [Quyết định #19]. **Xem trước số lượng ảnh hưởng trước khi lưu.** Phân loại là "đã phản ánh thành ràng buộc／tự động tạo lại／tự động đẩy sớm ngày picking／đã thỏa thuận với doanh nghiệp (áp dụng được・mất hiệu lực・chuyển đang đề xuất)／**đã có chỉ thị xuất hàng・không thể thay đổi**／không đẩy sớm được". Đặc biệt hiển thị **số lượng `locked`** trước khi lưu. Khi có từ 1 mục mất hiệu lực・đang đề xuất thì đổi nút lưu thành "Xác nhận và lưu" và bắt buộc đánh dấu (không chặn việc lưu). **Dù hủy ngày không thể thì kế hoạch đã đẩy sớm một lần cũng không tự động trả về** (`draft` do sinh lại nên kết quả là trở về, nhưng `published` thì không trả về).

### 8-7. Thay đổi・tạm ngừng・hủy hợp đồng

**Tháng áp dụng được quyết định bằng kỳ đặt hàng** [Chu kỳ §4A-6]. Đăng ký trong kỳ đặt hàng (công khai menu ~ hạn chốt đặt hàng) thì phản ánh từ chu kỳ của **tháng sau**, đăng ký sau hạn chốt đặt hàng thì phản ánh từ chu kỳ của **tháng sau nữa**. **Tháng bắt đầu của đăng ký mới cũng liên động với hạn chốt đặt hàng như vậy**: đăng ký trước hạn chốt thì **bắt đầu tháng sau**, đăng ký sau hạn chốt thì **bắt đầu tháng sau nữa** (bổ sung 2026/09/30. Cũ: chỉ liên động thay đổi・tạm ngừng・hủy hợp đồng) [Bảng yêu cầu dòng 159・Quyết định_phản ánh một phần bảng yêu cầu_trả lời_20260930]. Việc xử lý đổi tháng bắt đầu sang chu kỳ tiếp theo khi đăng ký chính thức đã qua hạn chốt đặt hàng của tháng bắt đầu (28-27・DEV §4.7) vẫn như cũ. **Không thay đổi nội dung của chu kỳ đã chốt số lượng về sau.** Vì chỉ thị xuất hàng được xuất gộp 2 tuần vào 3 ngày trước ngày bắt đầu (thứ Sáu) nên **chắc chắn sau hạn chốt đặt hàng**, việc thay đổi hợp đồng ảnh hưởng đến dữ liệu giao hàng `locked` về cấu trúc không xảy ra. **Không hủy chỉ thị xuất hàng đã có vì thay đổi hợp đồng.**

| Loại thay đổi | Kế hoạch `draft` | `published` của chu kỳ phản ánh | `locked` | Hợp đồng con |
|---|---|---|---|---|
| Thêm／xóa phân loại giao hàng | Tạo lại (bản ghi tăng giảm) | Sinh thêm／hủy (bắt buộc có lý do) + phân bổ lại số lượng | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| Thay đổi kho・công ty giao hàng・trung chuyển | Tạo lại | Thay tuyến đường và ngày picking (cần xác nhận → thay đổi hàng loạt) | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| Thay đổi lead time | Tạo lại (quy tắc chênh 1 ngày) | Tính lại ngày picking. Mục chênh lệch quá 1 ngày thì cần xác nhận | Ngoài đối tượng | Không ảnh hưởng |
| Thay đổi số lượng gói・số lần giao hàng | Tạo lại | Phân bổ lại số lượng. Khi số lần giao hàng đổi thì bản ghi tăng giảm | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| Thay đổi slot giao hàng | Tạo lại | Thay ngày giao・ngày picking (cần xác nhận → thay đổi hàng loạt) | Ngoài đối tượng | Không ảnh hưởng |
| Thêm thứ không thể giao・ngày không thể nhận | Tạo lại (tự động tránh) | Đưa lần giao trùng vào cần xác nhận, bộ phận vận hành thay đổi hàng loạt | Ngoài đối tượng | Không ảnh hưởng |
| **Tạm ngừng** | Xóa từ tháng áp dụng trở đi | Hủy từ chu kỳ áp dụng trở đi (bộ phận vận hành xác nhận) | Ngoài đối tượng | Hủy phần chưa thanh toán. **Không sinh trong lúc tạm ngừng** |
| **Hủy hợp đồng** | Xóa từ tháng áp dụng trở đi | Hủy từ chu kỳ áp dụng trở đi (bộ phận vận hành xác nhận) | Ngoài đối tượng | Hủy phần chưa thanh toán |
| Tiếp tục sau tạm ngừng | Sinh từ tháng tiếp tục trở đi | Nếu tháng tiếp tục đang tiếp nhận đặt hàng thì đuổi theo và sinh chính thức (catch-up) | — | Tiếp tục sinh từ tháng tiếp tục |

**Xử lý ngày hủy hợp đồng・trong lúc tạm ngừng** [Yêu cầu REQ-DL-815]

| Điều đã quyết | Nội dung |
|---|---|
| **Không thể hủy hợp đồng chu kỳ đã qua hạn chốt đặt hàng** | Vì số lượng đã chốt và tiến sang chỉ thị xuất hàng. Dù nhận đăng ký hủy hợp đồng cũng **thực hiện chu kỳ đó đến cùng** |
| **Ngày hủy hợp đồng nhất định là cuối chu kỳ** | Không kết thúc giữa chừng của tháng dương lịch・tuần. **Ngày cuối của chu kỳ ngay trước chu kỳ phản ánh** là ngày hủy hợp đồng |
| **Trong lúc tạm ngừng không tạo kế hoạch phía trước** | Xóa kế hoạch・dữ liệu giao hàng từ chu kỳ áp dụng trở đi, **sau đó cũng không sinh**. Dù tạm ngừng dài cũng không có chuyện chỉ kế hoạch chất đống |
| **Tiếp tục thì tạo lại tại thời điểm phê duyệt** | Khi phê duyệt đăng ký tiếp tục, **sinh ngay lúc đó** kế hoạch từ tháng tiếp tục trở đi. Không khôi phục kế hoạch trước khi tạm ngừng (vì thiết lập có thể đã thay đổi) |
| **Hủy hợp đồng của cơ sở chuyến giao hàng ES thì thông báo cho công ty giao hàng ủy thác** (bổ sung 2026/09/30) | Đăng ký hủy hợp đồng được **xác định bằng sự phê duyệt của bộ phận vận hành** sau khi chọn lý do và đề xuất thay thế. Với cơ sở chuyến giao hàng ES, **vào thời điểm bộ phận vận hành phê duyệt, thông báo hủy hợp đồng cho công ty giao hàng ủy thác phụ trách cơ sở đó bằng hiển thị trên Web công ty giao hàng ủy thác + mail** (kèm ngày hủy hợp đồng) [Bảng yêu cầu dòng 26・Quyết định_phản ánh một phần bảng yêu cầu_trả lời_20260930]. Kịch bản giữ chân sẽ phản ánh sau khi nhận bản nền do anh Aoyama soạn (Hợp đồng REQ-CT-192) |

**Xử lý override đã phê duyệt・ngày không thể nhận của cơ sở**: Khi thay đổi nội dung thì vẫn có hiệu lực (thay đổi làm đổi ngày giao thì đưa vào phán định tái neo)／Khi tạm ngừng thì **dừng** và khôi phục khi tiếp tục／Khi hủy hợp đồng thì **hủy** (lưu vào lịch sử kèm lý do). Tạm ngừng thì hợp đồng vẫn tiếp tục nên không xóa nội dung đã thỏa thuận, hủy hợp đồng thì hợp đồng kết thúc nên hủy. **Khi tạm ngừng・hủy hợp đồng với trả trước trọn gói 1 năm thì không hủy hợp đồng con đã thanh toán.** Ghi nhận như điều chỉnh (hoàn tiền・bù trừ) trong từng mục ①trả trước・②quyết toán thực tích, **không tạo bảng thứ 3 độc lập (③điều chỉnh)** [Quyết định #70]. Khoảng thời gian đã xóa cũng biến mất khỏi lịch của doanh nghiệp, không thể gửi yêu cầu thay đổi cho khoảng thời gian đó. **Không thông báo cho doanh nghiệp.** (Thông báo hủy hợp đồng cho công ty giao hàng ủy thác thực hiện như bảng trên. 2026/09/30 [Bảng yêu cầu dòng 26・Quyết định_phản ánh một phần bảng yêu cầu_trả lời_20260930])

### 8-8. Thay đổi địa chỉ cơ sở

Thay đổi địa chỉ (trường hợp khu vực thay đổi) thì tạo lại `draft` bằng kho・tuyến đường mới (quy tắc chênh 1 ngày), `published` thì thay kho・tuyến đường・ngày picking・**snapshot địa chỉ** (cần xác nhận → thay đổi hàng loạt) [Chu kỳ §4A-6]. **Dữ liệu giao hàng đã tạo thì bộ phận vận hành chọn ngày chuẩn bằng "cập nhật từ ngày này trở đi" để quyết định từ đâu dùng địa chỉ mới. Không tự động ghi đè toàn bộ.** Vì trước và sau ngày chuyển nhà có lẫn phần gửi đến địa chỉ cũ và phần gửi đến địa chỉ mới nên con người quyết định ranh giới. Hợp đồng con thì tạo lại snapshot chưa thanh toán. Trường hợp cần xử lý riêng trước tháng phản ánh thì không xử lý ở phía hợp đồng, mà bộ phận vận hành xử lý bằng thay đổi **"chỉ lần giao này"** ở chi tiết dữ liệu giao hàng (thay đổi riêng tuyến đường giao hàng・chỉ định ngày riêng・8-3), không dịch chuyển tháng áp dụng của hợp đồng. Trường hợp ngày nghỉ của cơ sở rơi vào chu kỳ đã qua hạn chốt cũng giống vậy, xử lý riêng ở phía dữ liệu giao hàng chứ không phải hợp đồng (bao gồm dừng・sao chép).

### 8-9. Cách hiển thị cho doanh nghiệp

- Kế hoạch (`draft`) chỉ hiển thị **ngày**. Vì đặt hàng được thực hiện vào tháng trước tháng giao nên số lượng ở giai đoạn kế hoạch chắc chắn là dự kiến và dễ bị đọc nhầm là giá trị đã chốt nên không hiển thị [Yêu cầu REQ-DL-610].
- **Đây là quy định về hiển thị, không có nghĩa là kế hoạch không có số lượng** [Quyết định v2.1 S1] [Yêu cầu REQ-DL-882]. `shipping_plans.estimated_qty` luôn tồn tại nội bộ và dùng cho màn hình vận hành・ước tính số lượng・tự động chốt bằng số lượng tiêu chuẩn (7-1).
- Từ giai đoạn đã chốt (`published`) trở đi hiển thị số lượng・thực tích giao hàng・vận đơn・thu tiền. **Giữ dấu "Kế hoạch" trên lịch Web doanh nghiệp** [Quyết định #77]. Giải thích ý nghĩa ở chú thích. **Hiển thị tháng của Web vận hành vẫn bỏ thẻ** [Yêu cầu REQ-DL-828], chỉ Web doanh nghiệp là ngoại lệ. Vì doanh nghiệp không có cách nào khác để đọc được "ngày này chưa chốt".
- **Kế hoạch (`draft`) cũng mở được màn hình chi tiết** ("chế độ kế hoạch" của cùng màn hình chi tiết) [Yêu cầu REQ-DL-621]. Số vận đơn・thực tích giao hàng・thu tiền・đính kèm ghi rõ "nhập sau khi sinh chính thức" và vô hiệu hóa. **Ô `delivery status` là "—"** và thay vào đó hiển thị **trạng thái yêu cầu thay đổi** (**trung chuyển cũng là "—"**). Ngày thì nếu menu chưa đăng ký ghi "Chưa xác định", nếu tuần nghỉ thì ghi kèm "Nghỉ chu kỳ".
- Khi sinh chính thức thì cùng màn hình đó trở thành chi tiết dữ liệu giao hàng và **kế thừa ID kế hoạch (PL-…) → ID giao hàng (DL-…)** (lúc này ô `delivery status` từ "—" thành "Chờ xuất hàng"). Cửa vào mở chế độ kế hoạch là **phía lịch**, quản lý xuất hàng・giao hàng (danh sách) chỉ hiển thị dữ liệu giao hàng nên kế hoạch không xuất hiện.
- **Cách hiển thị hủy・đang có sự cố・giao một phần v.v. dùng tên hiển thị dành cho Web doanh nghiệp tách biệt với trạng thái** (Đang điều chỉnh ngày giao／Đang chuẩn bị giao lại v.v.・15-10). Không đổi tên trạng thái của Web vận hành [Quyết định v2.3 #42].
- Hiển thị khi xảy ra hoán đổi thì **ngắn ở danh sách** ("Đẩy sớm 2 ngày"), **đầy đủ ở màn hình chi tiết・tooltip** ("Đang dịch chuyển 2 ngày so với B3 (2026-09-17) vốn có") [Quyết định #27].

> ✅ **Cần xác nhận #22 (đã giải quyết)** — ~~Chưa quyết "khi vào" của đơn hàng vật tư là thời điểm nào (mỗi lần xác nhận giỏ hàng hay gộp theo hạn chốt hàng tuần phía vật tư)~~ → **Giải quyết ở bổ sung 4 ngày 2026/09/29**. **Tạo mỗi lần xác nhận giỏ hàng, chuyến vật tư cùng cơ sở・cùng ngày giao・trước chỉ thị xuất hàng thì gộp thành 1 mục**. Chỉ thị xuất hàng gửi bằng catch-up hằng ngày hiện có [Quyết định v2.3 #36] (7-5).

> ✅ **Cần xác nhận #23 (đã giải quyết)** — ~~Việc vận hành "bộ phận vận hành thay đổi từng mục một" sau hạn chốt đặt hàng・trước `locked` có xoay xở kịp khi số lượng nhiều không~~ → **Giải quyết bằng quyết định lần 3 ngày 2026/09/22**. Sau hạn chốt không thay đổi ngày mà hủy + sao chép [Quyết định v2.2 #1] (8-3). Kỳ nghỉ dài vẫn tiếp tục dồn về hoán đổi hàng loạt bằng nghỉ chu kỳ (8-6).

> ✅ **Cần xác nhận #24 (đã giải quyết)** — ~~Điều kiện để hệ thống phán định "có hạn tiêu thụ ngắn" và báo cho bộ phận vận hành (ngưỡng số ngày còn lại của hạn sử dụng v.v.) chưa quyết~~ → **Giải quyết ở bổ sung 4 ngày 2026/09/29**. **Số ngày từ ngày xuất hàng đến ngày giao > số ngày hạn tiêu thụ − số ngày an toàn (mặc định 2 ngày)** thì cần xác nhận `shelf_life_warning`. Cũng phán định khi lead time kéo dài do hoán đổi ở 8-6・thay đổi kho・sao chép [Quyết định v2.3 #35] (9-4).

> ⚠️ **Cần xác nhận #25** — Chỉ thị xuất hàng của Thomas có I/F hủy hay không (tiến hành theo phương thức gửi lại nhưng cần xác nhận với vendor) [Quyết định G]. Ảnh hưởng đến "gửi lại với số lượng 0" ở 8-2 và quy trình hủy + sao chép ở 8-4. **Bổ sung 4 ngày 2026/09/29: Hủy được chốt theo phương thức gửi lại, dù có I/F hủy cũng không dùng** [Quyết định v2.3 #45]. Ảnh hưởng đến quy trình không còn (xác nhận với vendor vẫn còn).

> ✅ **Cần xác nhận #26 (đã giải quyết)** — ~~Cách vận hành khi muốn xuất hàng vào ngày bị chặn bởi điều chỉnh~~ → **Giải quyết bằng quyết định lần 3 ngày 2026/09/22**. Chỉ cần dịch ngày điều chỉnh sang ngày khác, không tạo ngoại lệ cho xử lý ngày không thể xuất hàng [Quyết định v2.2 #2] (8-6).

> ⚠️ **Cần xác nhận #27** — Chưa hoàn tất xác nhận đặc tả hiện tại về thanh toán・hợp đồng [Quyết định G]. Khi chốt được ngày chốt thanh toán hiện tại và phân biệt trả trước・trả sau thì có thể khớp ngày chuẩn sinh ở 7-4 và thời điểm lập điều chỉnh ở 8-7 với thực tế.
