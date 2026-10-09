# Đặc tả giao hàng: Cài đặt giao hàng của hợp đồng (§5)

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (tách theo chương ngày 2026-10-03. Nội dung giữ nguyên như tại thời điểm tách) -->

## 5. Cài đặt giao hàng của hợp đồng (màn hình 02)

Nếu Cài đặt chu kỳ giao hàng (màn hình 01) tạo ra lịch chung toàn công ty, thì màn hình 02 quyết định **cho từng hợp đồng (= cơ sở) "vận chuyển vào khung nào, từ đâu, bởi ai, trong bao nhiêu ngày"** 〔Chu kỳ §1.3 ③〕. Batch đối chiếu giá trị đã quyết định ở đây với lịch ở màn hình 01 để tạo kế hoạch giao hàng (`plan lifecycle` = `draft`) 〔Chu kỳ §4A-2〕.

> Khi viết "trạng thái" trong chương này, phải nêu rõ là trục nào. **`plan lifecycle`** (`draft` / `published` / `locked`) và **`delivery status`** (chờ xuất hàng／đã xuất hàng／đã nhận／đã giao／giao một phần／chờ giao lại／đang xác nhận／dừng／hủy) là hai trục khác nhau, không gộp chung gọi là "status" 〔Quyết định v2.1 S5〕〔Yêu cầu REQ-DL-883〕.

### 5-1. Danh sách các hạng mục giao hàng mà hợp đồng nắm giữ

| Hạng mục | Tên vật lý | Kiểu | Bắt buộc | Giá trị mặc định | Người được thay đổi | Nguồn |
|---|---|---|---|---|---|---|
| Mẫu giao hàng (cách xác định ngày giao) | `route.plan_mode` | enum(`cycle`/`special`/`on_demand`) | ○ | `cycle` | Vận hành · Kinh doanh (doanh nghiệp gửi yêu cầu thay đổi) | 〔Chu kỳ §3.1〕〔Yêu cầu REQ-DL-845〕 |
| Số lượng gói (1 chu kỳ) | `plan_qty` | int(1–9999) | ○ | 120 (giá trị demo) | Vận hành · Kinh doanh | 〔Chu kỳ §3.1 · §3.2〕 |
| Số lần giao hàng (1 chu kỳ) | `route.delivery_count` | smallint(1–8) (thay đổi 2026/10/01 · P10-4. Cũ: 1–4) | ○ | 2 | Vận hành · Kinh doanh (doanh nghiệp gửi yêu cầu thay đổi) | 〔Chu kỳ §3.1〕〔Danh sách hạng mục Cài đặt tuyến giao hàng #7〕 |
| Lead time | `route.lead_days` | int(**0–7**) | ○ | **Không có (không tự động điền)** | Vận hành · Kinh doanh | 〔Yêu cầu REQ-DL-831/832〕 |
| **Thứ không giao được** | `ng_weekdays` | smallint[] | △ | Bật Thứ Bảy · Chủ Nhật · ngày lễ | Vận hành (doanh nghiệp gửi yêu cầu thay đổi) | 〔Yêu cầu REQ-DL-849〕〔Danh sách hạng mục Giao hàng · Lịch giao hàng #3〕 |
| **Dời sớm · dời muộn** | `holiday_shift` | enum(−1/+1) | ○ | −1 (**dời sớm**) | Vận hành · Kinh doanh | 〔Yêu cầu REQ-DL-849〕〔Danh sách hạng mục như trên #4〕 |
| Có giao vào ngày lễ hay không | `receive_off_holiday` | bool | ○ | BẬT (ngày lễ không giao được) | Vận hành | 〔Chu kỳ §4.3〕 |
| Ngày không nhận được (ngày · khoảng thời gian · thứ) | `site_receive_blocks` | array | — | — | **Doanh nghiệp đăng ký → Vận hành phê duyệt** | 〔Chu kỳ §3.1C〕 |
| **Khung giờ nhận hàng** | **`site_receive_windows` (bảng con)** | mảng các dòng | ○ | — | Vận hành | 〔Quyết định v2.1 #8〕〔Yêu cầu REQ-DL-877〕 |
| **Điều kiện giao hàng** | `delivery_condition` | text | ○ | — | Vận hành | 〔Quyết định v2.1 #8〕〔Yêu cầu REQ-DL-838〕 |
| Phân loại giao hàng (nhóm nhiệt độ · vật tư × kho × công ty vận chuyển) | `contract_delivery_channels` | array | ○ | 3 dòng (Lạnh · Đông lạnh · Vật tư) | Vận hành (Kinh doanh chỉ chọn từ master) | 〔Chu kỳ §3.1B〕 |
| **Loại chuyến** | `service_form` (**do phân loại giao hàng nắm giữ**) | enum(Chuyến ES giao／Chuyến COOL giao／Chuyến vật tư) | ○ | — | Vận hành · Kinh doanh | 〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-875〕 |
| **Thể chế giao hàng** | `delivery_regime` (**phân loại giao hàng + chặng**) | enum(`self`/`partner_driver`/`parcel_carrier`) | ○ | — | Vận hành | 〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-874〕 |
| Khung giao hàng (`cycle`)／Ngày giao chỉ định (`special`) | `route.slot_code` ／ `specified_day` | varchar(8) (A1〜D7)／int (ngày N hàng tháng · cuối tháng) | ○ | — | Kinh doanh (doanh nghiệp gửi yêu cầu thay đổi) | 〔Chu kỳ §3.2〕〔Yêu cầu REQ-DL-845〕 |
| Tỷ lệ phân bổ／Ghi chú giao hàng | `share_pct` ／ `delivery_note` | int(%) ／ text | ○／△ | — | Vận hành (doanh nghiệp cũng được sửa ghi chú) | 〔Chu kỳ §3.1B〕〔Danh sách hạng mục Giao hàng · Lịch giao hàng #5〕 |
| Chế độ AI (tự động chốt số lượng) | `ai_qty_mode` | bool | ○ | TẮT | Vận hành | 〔Chu kỳ §4A-2D〕 |

- **Lựa chọn công ty vận chuyển · điểm trung chuyển**: cả chặng 1 và chặng 2 đều chọn được từ **toàn bộ master công ty vận chuyển** (công ty vận tải · ủy thác · tự vận hành). Điểm trung chuyển chọn từ **toàn bộ trung chuyển (`HU`) trong master kho** (cơ sở của công ty giao hàng ủy thác cũng có thể đăng ký làm điểm trung chuyển) 〔Quyết định v2.3 #50〕.
- **Cách nhập khi tiếp nhận đăng ký (bổ sung 6 ngày 2026/09/29)**: kho picking và số lần giao hàng được quyết định ở bước **xác nhận nội dung đăng ký** (để tạo bộ khởi tạo đơn hàng và vật tư, trước khi đăng ký tạm). Công ty vận chuyển ①② · điểm trung chuyển 1 · lead time · mẫu giao hàng (giá trị ban đầu `cycle`) · chu kỳ giao hàng được nhập ở **cài đặt thông tin chi tiết (hợp đồng con｜hợp đồng)** của bước tiếp nhận. **Công ty vận chuyển ①② luôn bắt buộc cả hai.** Khi không trung chuyển thì nhập cùng một công ty vào cả hai (ví dụ: chuyến lạnh Yamato thì ①② đều là Yamato). Điểm trung chuyển 1 phải chọn "Không" một cách tường minh (mặc định "Không" · bắt buộc) 〔trả lời của hong 2026-10-03 · REQ-DL-710〕 (cũ: công ty vận chuyển ② chỉ bắt buộc khi có điểm trung chuyển 1 〈28-xx · bổ sung 09/29 lần 6〉. Đã sửa theo sổ cái 2026-10-03). Chu kỳ giao hàng chọn đúng bằng số lần giao hàng và không chọn được khung của thứ không giao được. Khách hàng không thể yêu cầu tuyến giao hàng khi đăng ký 〔28-77 · 28-83〜88 · 28-93〕.
- **Số lần giao hàng và tùy chọn**: **theo từng nhóm nhiệt độ (loại giao hàng)**, phần số lần giao hàng vượt quá số lần giao hàng tiêu chuẩn của master gói (lạnh · nhiệt độ thường／đông lạnh) sẽ tự động được tạo thành tùy chọn loại A "Thêm lần giao hàng" (OP000001 · mỗi lần vượt) ở ① của hợp đồng con. Không bù trừ bằng nhóm nhiệt độ còn thiếu. **Không lưu được số lần giao hàng bằng 0** (lạnh tối thiểu 1 lần trở lên, ES Standard thì đông lạnh cũng tối thiểu 1 lần. Nếu không nhận hàng đông lạnh thì dùng ES Lite) 〔28-154 · 28-156 · 2026/09/29. Cũ: so sánh theo tổng · 28-85〕. Số lượng mỗi lần giao = giới hạn số lượng cung cấp hàng tháng của nhóm nhiệt độ ÷ số lần giao hàng tiêu chuẩn của nhóm nhiệt độ (làm tròn lên), dùng để xác định dung lượng tủ lạnh · tủ đông (không giữ tỷ lệ đông lạnh) 〔28-153 · 28-155〕.
- **Màn hình chọn công ty vận chuyển ①② · điểm trung chuyển** phải hiển thị sao cho hiện trường phân biệt được sự khác nhau giữa giao hàng trung chuyển, giao thẳng (chuyến lạnh = không trung chuyển · ①② đều là Yamato) và giao hàng ủy thác. Trước mắt có thể chỉ bổ sung văn bản giải thích 〔trả lời của hong 2026-10-03〕〔Yêu cầu REQ-DL-711 (09/29)〕.
- **Các lần giao hàng của (tùy chọn) thêm lần giao hàng** cũng phải xác định được tuyến giao hàng (công ty vận chuyển ①② · điểm trung chuyển) và kho picking theo từng lần (không dùng nguyên cài đặt của các lần tiêu chuẩn) 〔trả lời của hong 2026-10-03〕〔Yêu cầu REQ-DL-713 (09/29)〕.
  - Cách làm (trả lời của hong 2026-10-03 · phương án B): dòng tuyến giao hàng vẫn là một dòng cho mỗi nhóm nhiệt độ, **ghi đè theo từng lần** (hợp đồng con của vận hành "Tuyến theo từng lần (chỉ đổi lần này)". Lần không có ghi đè dùng tuyến của dòng). Quy tắc giống như dòng (①② bắt buộc · điểm trung chuyển phải chọn "Không" tường minh · khi không trung chuyển thì ① = ②). Khi sửa ghi đè, kho · chặng của đơn giao hàng còn ở trạng thái `Dự kiến` của lần đó sẽ được sửa (từ chờ xuất hàng trở đi thì không đổi). Thay đổi hàng loạt không đổi các lần có ghi đè. Dữ liệu là `slot_routes` theo từng chuyến của hợp đồng con (lần → kho · công ty vận chuyển ①② · trung chuyển)
- Đơn vị lưu giữ đều là **đơn vị hợp đồng (cơ sở)**. Ngay cả khi đăng ký đồng thời, thời điểm chuyển đổi cũng khác nhau theo từng cơ sở nên không đặt cài đặt đồng nhất cho cả doanh nghiệp 〔Chu kỳ §3.1 Nguyên tắc đơn vị lưu giữ〕. Hợp đồng chỉ có thể ghi đè các mục trong whitelist ở trên; **khung không xuất được · ngày không xuất được · ngưỡng số lượng · tạm dừng chu kỳ · ngày được coi là ngày lễ giao hàng thì master／màn hình 01 là chuẩn** 〔Chu kỳ §12-2〕.
- Chỉ **vận hành (logistics) và kinh doanh** được chỉnh sửa. Doanh nghiệp · cơ sở · công ty giao hàng ủy thác không được chỉnh sửa, chỉ có đường gửi yêu cầu thay đổi. **Không tồn tại vai trò `Quản lý kho`** (mọi thao tác kho đều do vận hành (logistics) thực hiện, tab kho trên màn hình chỉ là lọc dữ liệu) 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-885〕.
- **Tên hạng mục thống nhất là "Thứ không giao được" và "Dời sớm · dời muộn"**, không dùng tên cũ "Thứ không nhận được" và "Hướng chuyển". **Không thay đổi tên vật lý `ng_weekdays` / `holiday_shift`** 〔Yêu cầu REQ-DL-849〕. Cách gọi thống nhất là **"Chu kỳ giao hàng"** 〔Yêu cầu REQ-DL-848〕.

### 5-2. Đơn vị lưu giữ — Hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó

Cài đặt tuyến giao hàng (kho · công ty vận chuyển · trung chuyển · lead time) **do cả hợp đồng cha và hợp đồng con nắm giữ**. Vai trò khác nhau 〔Đợt 1 #25/#45〕〔Yêu cầu REQ-DL-829〕.

| | Nắm giữ | Vai trò | Bảng |
|---|---|---|---|
| **Hợp đồng cha** (hợp đồng) | Kho · công ty vận chuyển chặng 1 · điểm trung chuyển · công ty vận chuyển chặng 2 · lead time · loại chuyến · thể chế giao hàng theo từng phân loại giao hàng | **Giá trị mặc định**. Là gốc của hợp đồng con · kế hoạch sẽ được tạo sau này | `contract_delivery_channels` |
| **Hợp đồng con** (`ID hợp đồng-yyyymm`) | Nắm giữ các hạng mục tương tự dưới dạng **giá trị thực tế của tháng đó** | **Giá trị thực tế đã dùng trong tháng đó**. Về sau dù đổi hợp đồng cha cũng không bị ghi đè | `contract_month_delivery_channels` |

**Khi tạo kế hoạch thì xem bên nào** 〔Quyết định v2.1 S2〕〔Yêu cầu REQ-DL-884〕

| Hợp đồng con của tháng đó | Tuyến mà kế hoạch sử dụng | `shipping_plans.route_snapshot_source` |
|---|---|---|
| **Đã có** (được tạo trước do trả trước một năm · thanh toán trước 2 tháng, v.v.) | **Snapshot tuyến của hợp đồng con** | `contract_month` |
| **Chưa có** | Giá trị mặc định của hợp đồng cha | `contract` |

- **Chỉ dùng hợp đồng cha khi hợp đồng con chưa có.** Khi hợp đồng con của 12 chu kỳ đã được tạo trước nhờ trả trước một năm, kế hoạch của các tháng sau cũng được tạo từ **hợp đồng con, không phải hợp đồng cha**. Nếu xem hợp đồng cha, khi đổi hợp đồng cha về sau sẽ làm hợp đồng con và kế hoạch bị lệch nhau. Tại thời điểm hợp đồng con được tạo, kế hoạch của chu kỳ đó **chuyển sang snapshot phía hợp đồng con** 〔Chu kỳ §4A-2B〕.
- Khi thay đổi tuyến của hợp đồng cha, thay đổi được phản ánh vào hợp đồng con · kế hoạch **từ tháng áp dụng (§5-8) trở đi**. Không ghi đè các tháng quá khứ đã snapshot. Thay đổi tuyến "chỉ chuyến giao này" **UPDATE trực tiếp `delivery_legs` của dữ liệu giao hàng đó** chứ không phải hợp đồng con (không có `route_override` 〔Quyết định v2.3 #2〕). Không đổi giá trị của hợp đồng con 〔Chu kỳ §4A-4D〕.
- Hợp đồng con là **1 bản ghi cho mỗi chu kỳ giao hàng**. Tháng của chu kỳ được xác định bằng **tháng mà khung thứ 14 `B7` thuộc về** (chu kỳ A1 = 2026-09-07 có `B7` = 2026-09-20 → **chu kỳ tháng 9/2026**). Quy tắc này luôn cho cùng kết quả với "tháng có nhiều ngày hơn trong 28 ngày", và **khi 14 đối 14 thì tự động là tháng trước**. **Không tạo nhánh ngoại lệ** 〔Quyết định v2.1 #11〕〔Yêu cầu REQ-DL-881/864〕.
- Ngày tạo hợp đồng con của hợp đồng thanh toán tháng hiện tại được đồng bộ với **ngày bắt đầu đặt hàng** (cùng ngày với việc tạo chốt dữ liệu giao hàng) 〔Yêu cầu REQ-DL-841〕.

### 5-3. 3 trục của chuyến — `delivery_regime` / `service_form` / relay

Chuyến được biểu diễn bằng **3 trục**. Không trộn lẫn các trục 〔Quyết định v2.1 #7〕〔Yêu cầu REQ-DL-874/875/876〕〔Chu kỳ §4C〕.

| Trục | Tên vật lý | Giá trị | **Nơi nắm giữ** | Quyết định điều gì |
|---|---|---|---|---|
| **Thể chế giao hàng** (mới) | **`delivery_regime`** | `self` (tự vận hành)／`partner_driver` (tài xế ủy thác)／`parcel_carrier` (công ty vận tải) | **Giá trị mặc định của phân loại giao hàng + từng chặng (leg)**. Giá trị của chặng được ưu tiên | Ai vận chuyển. **Giá trị của chặng cuối (final leg) ảnh hưởng đến phán định coi là hoàn tất · phát hiện thiếu giao** |
| **Loại chuyến** | `service_form` | Chuyến ES giao／Chuyến COOL giao／Chuyến vật tư | **Phân loại giao hàng (delivery channel)**. **Không đặt ở tuyến của hợp đồng (`contract_routes`)** | Nội dung công việc trên app (có trưng bày hay không) |
| **Lộ trình (trung chuyển)** | — | Không trung chuyển／Có trung chuyển | **Không nắm giữ (giá trị suy ra)**. **Suy ra từ route legs, không lưu như một trạng thái** | Có điểm trung chuyển nằm giữa kho và nơi giao hàng hay không |

- **Nơi nắm giữ `service_form` chỉ giới hạn ở phân loại giao hàng** (cũ: Đợt 1 #29 "Loại chuyến là mục nhập do hợp đồng 〈hợp đồng con〉 nắm giữ"). Điểm không suy ra từ việc có trung chuyển hay không thì không đổi 〔Quyết định v2.1 #7〕.
- **relay được suy ra là "có trung chuyển" nếu trong route legs (`contract_routes` / `contract_month_routes` / `delivery_legs`) có dù chỉ 1 chặng chứa điểm trung chuyển.** Không có trạng thái trung gian như chờ trung chuyển／đang trung chuyển／đã trung chuyển 〔Yêu cầu REQ-DL-876/814〕. **Không dùng loại chuyến để phán định hoàn tất · thiếu giao** — dù cùng là chuyến COOL giao, nếu tài xế của ES chạy chặng cuối thì không coi là hoàn tất 〔Quyết định v2.1 #4〕〔Yêu cầu REQ-DL-871〕.

**Các hạng mục dòng của phân loại giao hàng (nhóm nhiệt độ · vật tư × kho × công ty vận chuyển)** 〔Chu kỳ §3.1B〕

| Hạng mục | Kiểu | Giải thích |
|---|---|---|
| Phân loại (loại giao hàng) | enum | Loại đông lạnh／Loại lạnh／Nhiệt độ thường／**Vật tư**. Mỗi loại 1 dòng |
| Kho (kho picking) | FK (master kho · phân loại = picking) | Có thể khác nhau theo từng phân loại |
| Công ty vận chuyển chặng 1／chặng 2 | FK (master công ty vận chuyển) | Kho → điểm kế tiếp／điểm trung chuyển → nơi giao hàng. **①② luôn bắt buộc cả hai**. Khi điểm trung chuyển là "Không" thì nhập cùng một công ty vào ①② 〔trả lời của hong 2026-10-03 · REQ-DL-710〕 (cũ: khi điểm trung chuyển trống thì chặng 2 cũng nhất định trống 〈validation〉. Đã sửa theo sổ cái 2026-10-03). **Cả chặng 1 · chặng 2 đều chọn được từ toàn bộ master** (chặng 1 cũng có thể là ủy thác) 〔Quyết định v2.3 #50〕 |
| Điểm đi qua 1 (điểm trung chuyển) | FK (master kho · phân loại = trung chuyển) | **Phải chọn "Không" một cách tường minh (mặc định "Không" · bắt buộc)** 〔trả lời của hong 2026-10-03〕 (cũ: để trống là không trung chuyển). **Chọn từ toàn bộ trung chuyển (`HU`)** (cơ sở của công ty giao hàng ủy thác cũng được) 〔Quyết định v2.3 #50〕. **Không xen trung chuyển từ 2 tầng trở lên**. Phiếu vận chuyển không được phát hành lại tại điểm trung chuyển |
| Lead time／tỷ lệ phân bổ | int(0–7)／int(%) | §5-4／tỷ lệ phân bổ số lượng vào phân loại này |
| **Loại chuyến** `service_form` | enum | Chuyến ES giao／Chuyến COOL giao／Chuyến vật tư |
| **Thể chế giao hàng** `delivery_regime` | enum | `self` / `partner_driver` / `parcel_carrier`. Nếu mỗi chặng khác nhau thì `delivery_regime` phía route legs được ưu tiên |

- **Kế hoạch giao hàng · dữ liệu giao hàng được tạo từng bản ghi theo "chi tiết giao hàng × phân loại giao hàng".** Dù cùng ngày giao, đông lạnh · lạnh · vật tư là các bản ghi riêng, kho và ngày picking cũng có thể khác nhau. **Ngày giao chung cho hợp đồng (cơ sở), nhưng ngày picking được tính ngược theo từng phân loại**, và việc xuất hàng được hay không được phán định theo cài đặt của kho thuộc phân loại đó 〔Chu kỳ §3.1B〕.
- Kho · điểm trung chuyển · công ty vận chuyển **chọn từ master**. Đối chiếu với nhóm nhiệt độ hỗ trợ của master công ty vận chuyển (**3 giá trị: đông lạnh／lạnh · nhiệt độ thường／vật tư** 〔Đợt 1 #8〕) và khu vực hỗ trợ, nếu chỉ định không khớp thì **cảnh báo** (không cấm).
- Vật tư luôn được giữ như một phân loại giao hàng độc lập và **loại khỏi việc phán định · hiển thị ngưỡng số lượng của 1 ngày** 〔Yêu cầu REQ-DL-818〕.

### 5-4. Lead time

| Nội dung đã quyết định | Chi tiết | Nguồn |
|---|---|---|
| Người nắm giữ | **Master kho không nắm giữ. Nắm giữ theo từng phân loại giao hàng (lạnh／đông lạnh／vật tư) của hợp đồng** | 〔Yêu cầu REQ-DL-831〕 |
| Giá trị mặc định | **Không tự động điền.** Xóa "giá trị mặc định lấy từ master kho". Bãi bỏ `warehouse_lead_times` | 〔Yêu cầu REQ-DL-831/666〕 |
| Phạm vi | **0〜7 ngày** (cũ "0〜30 ngày" là sai). Giá trị ngoài phạm vi được làm tròn | 〔Yêu cầu REQ-DL-832〕 |
| Khi có trung chuyển | **Tổng là 1 giá trị chuẩn.** Lead time chặng 1 (kho → điểm trung chuyển) · chặng 2 (điểm trung chuyển → nơi giao hàng) **chỉ hiển thị làm giá trị tham khảo** và **không dùng để tính ngày** | 〔Yêu cầu REQ-DL-837〕〔Chu kỳ §3.1B〕 |
| Tính ngược | Ngày picking luôn là `ngày giao − tổng lead time` | 〔Chu kỳ §3.3〕 |
| **Giao hàng theo yêu cầu (vật tư)** | **Cùng ý nghĩa với các mẫu giao hàng khác** (ngày xuất hàng = ngày giao − lead time). Ngày giao vật tư là **ngày giao được đầu tiên kể từ ngày sau ngày đặt hàng mà đảm bảo được lead time** (việc phán định thứ không giao được · ngày không nhận được · ngày không xuất được giống như thông thường) (cũ: lẫn lộn với cách đọc "số ngày từ khi chốt đơn đến khi giao". Thống nhất 2026/09/29) | 〔Quyết định v2.3 #38〕 |

- Cũng không có hiển thị "thay đổi so với mặc định N ngày của kho". Khi đổi lead time, `draft` được tạo lại, `published` tính lại ngày picking và đưa ra **mục cần xác nhận những bản ghi chênh lệch trên 1 ngày**. `locked` không thuộc đối tượng 〔Chu kỳ §4A-6〕.

### 5-5. Ràng buộc nhận hàng của cơ sở

"Ngày không nhận được" của doanh nghiệp không được xử lý bằng yêu cầu thay đổi từng việc mà được lưu như **ràng buộc của cơ sở**. Vì ràng buộc tác động trực tiếp đến việc tạo ngày giao nên **dù tạo lại cài đặt chu kỳ giao hàng bao nhiêu lần cũng tự động tránh được** 〔Chu kỳ §3.1C · §3.4〕.

**① Ngày · thứ không nhận được** (`site_receive_blocks`)

| Hạng mục | Kiểu | Bắt buộc | Giải thích |
|---|---|---|---|
| Loại | enum | ○ | `date` (ngày)／`range` (khoảng thời gian)／`dow` (thứ = cùng bản thể với **thứ không giao được**) |
| Ngày／ngày bắt đầu · ngày kết thúc | date | ○ | Nắm giữ theo loại |
| Lặp lại／lý do | enum / text | ○ | `none` (chỉ năm đó)／`yearly` (cùng tháng ngày mỗi năm). Lý do do doanh nghiệp nhập |
| Nguồn đăng ký · trạng thái · bắt đầu áp dụng | enum / enum / date | ○ | `Doanh nghiệp`／`Vận hành`, `Đang yêu cầu`／`Có hiệu lực`／`Hủy`, mặc định là ngày phê duyệt (không hồi tố về ngày quá khứ) |

**② Khung giờ nhận hàng — nắm giữ nhiều khung bằng bảng con** 〔Quyết định v2.1 #8〕〔Yêu cầu REQ-DL-877/878〕

| Ở đâu | Bảng | Cột |
|---|---|---|
| Phía cơ sở | **`site_receive_windows`** | `site_id, from_time, to_time, sort_order` |
| Phía dữ liệu giao hàng | **`delivery_receive_windows`** | `delivery_id, from_time, to_time, sort_order, snapshot_at` |

- **Không dùng dạng chỉ nắm giữ 1 cặp `from`/`to`.** Vì cơ sở chia buổi sáng · buổi chiều (ví dụ `09:00`〜`12:00` và `13:00`〜`16:00`) không biểu diễn được bằng 1 cặp. Phương án cũ `receive_window_from` / `receive_window_to` bị hủy 〔Quyết định v2.1 #8〕.
- **Khi tạo dữ liệu giao hàng (tạo chốt), snapshot `site_receive_windows` nguyên danh sách vào `delivery_receive_windows`.** Không chọn một dòng mà sao chép **toàn bộ các dòng tại thời điểm đó cùng với `sort_order`** (xử lý giống địa chỉ). Ở giai đoạn kế hoạch (`draft`) không snapshot mà tham chiếu master cơ sở. Bản ghi con được tạo bằng nhân bản (giao lại · giao chia đợt · chuyến thay thế) **sao chép nguyên snapshot của bản ghi cha**.
- **Thẻ nơi giao hàng của app tài xế hiển thị tất cả các khung giờ theo thứ tự `sort_order`.** Tuy nhiên **khung giờ nhận hàng không dùng để tính ngày** — việc quyết định ngày giao được thực hiện bằng ngày không nhận được · thứ không giao được, còn khung giờ nhận hàng là thông tin để quyết định thứ tự đi vòng trong ngày.

**③ Điều kiện giao hàng** (`delivery_condition` → `deliveries.delivery_condition_snapshot`) — cách thức nhận hàng (ví dụ "Chuyển hàng vào từ cửa sau", "Nộp phiếu tiếp nhận tại phòng bảo vệ", "Không được để hàng tại chỗ khi người phụ trách vắng mặt"). Bản thân sơ đồ lối vận chuyển vào được lưu trong master cơ sở · điểm trung chuyển như "tài liệu của địa điểm", không sao chép vào dữ liệu giao hàng mà hiển thị bằng tham chiếu 〔Yêu cầu REQ-DL-826/827〕.

- **Thứ không giao được chỉ điều khiển ngày giao, không điều khiển ngày picking** (picking được phán định bằng ngày **không xuất được** của phía kho) 〔Chu kỳ §3.1C〕.
- **Màn hình**: doanh nghiệp đăng ký "ngày không nhận được" trên lịch của từng cơ sở và xem trước ngay tại chỗ kết quả kế hoạch giao hàng của ngày đó được chuyển đi. Vận hành duyệt danh sách ngày không nhận được đang yêu cầu, và trước khi phê duyệt hiển thị các ngày giao bị ảnh hưởng và ngày chuyển đến 〔Nguồn gốc: Cài đặt chu kỳ giao hàng §3.1C〕.
- Việc phê duyệt ngày không nhận được **bắt buộc có xác nhận của vận hành** (vì số lần giao trong 1 chu kỳ thay đổi, ảnh hưởng đến hợp đồng · thanh toán). Tại thời điểm đăng ký · thay đổi, kế hoạch của các tháng có thể chỉnh sửa được tạo lại. Không đăng ký được ngày quá khứ, và **cài đặt của tháng hiện tại · tháng sau không chỉnh sửa được**, nên nếu cần trong khoảng thời gian đó thì xử lý bằng **điều chỉnh từng lần (override đã phê duyệt)**.

### 5-6. Cách chọn khung (slot)

Đỉnh số lượng được quyết định bởi tổng tích lũy "hợp đồng nào chọn khung nào", nên **hiển thị ngay tại thời điểm ký hợp đồng là biện pháp phòng ngừa duy nhất** 〔Chu kỳ §3.2〕.

| Hiển thị | Nội dung |
|---|---|
| Lựa chọn | `A3 Thứ Tư · 210 đơn／giới hạn 300　còn 90` — số lượng tích lũy của **kho thuộc phân loại giao hàng đó** và ngưỡng số lượng của master kho (mặc định **300 đơn／ngày**) |
| Từ 90% ngưỡng trở lên | `⚠ Đông` |
| Vượt ngưỡng | `✕ Vượt giới hạn` |
| Khung đã chọn | Luôn hiển thị "〈tên kho〉　〈số lượng〉／giới hạn 〈ngưỡng〉" bên dưới ô |

- **Khung không chọn được tự động chuyển màu xám.** Căn cứ phán định có 2 yếu tố: **khung không xuất được của kho được gán cho phân loại giao hàng đó** và **lead time của phân loại giao hàng đó**. Nếu khung picking `khung giao − lead time` là **không xuất được** thì khung giao đó không chọn được. Khi đổi kho hoặc lead time thì **tính lại ngay tại chỗ và vẽ lại màu xám** 〔Yêu cầu REQ-DL-805〕.
- **Lý do xám có độ dài khác nhau giữa ô và tooltip** 〔Yêu cầu REQ-DL-847〕.

  | Nơi | Nội dung |
  |---|---|
  | Ô khung | **Ngắn**. `B1 Thứ Hai (không giao được)` |
  | Tooltip | **Chi tiết**. `Khung không xuất được A7 (kho Kanto)／lead time 1 ngày` — hiển thị khung không xuất được · tên kho · lead time |

- Nếu ghi hết lý do vào ô thì lưới 28 khung sẽ khó đọc, nên ô chỉ cho biết "không chọn được". Vượt số lượng thì **không chặn việc chọn** (ngưỡng số lượng chỉ cảnh báo). Khung không giao được thì không chọn được và không hiển thị số lượng. Trùng cùng slot (hoặc cùng ngày chỉ định) **lưu được chỉ với thẻ cảnh báo** (quyết định vận hành). **Việc cùng một hợp đồng có 2 chuyến giao rơi vào cùng một khung cũng không thành vấn đề** — vì khóa duy nhất của kế hoạch là `contract_id + line_no + channel_id + cycle_id + occurrence_key` nên chúng tồn tại như các bản ghi riêng 〔Quyết định v2.2 #5〕〔Yêu cầu REQ-DL-892〕. **(Cũ: từng có đề xuất "cùng Slot + cùng phân loại giao hàng là lỗi" nhưng không được chấp nhận ở quyết định đợt 3 ngày 2026/09/22)**

### 5-7. Cách xác định ngày giao

| Mẫu giao hàng | Cách xác định ngày giao | Ngày picking | Nhóm nhiệt độ áp dụng |
|---|---|---|---|
| **Theo chu kỳ giao hàng** (`cycle`) | Ngày của slot giao hàng được gán (`A1`〜`D7`) | Ngày giao − lead time của phân loại đó | Lạnh · đông lạnh · vật tư |
| **Chỉ định riêng ngày giao** (`special`) | **Chỉ 2 loại: ngày N hàng tháng (ngày 1〜28)／cuối tháng hàng tháng** (không nắm giữ thứ N) | Như trên | Lạnh · đông lạnh · vật tư |
| **Giao hàng theo yêu cầu** (`on_demand`) | Không tạo từ chu kỳ. Được xác định tại thời điểm **chốt giỏ hàng vật tư**, là **ngày giao được đầu tiên kể từ ngày sau ngày đặt hàng mà đảm bảo được lead time** 〔Quyết định v2.3 #36 · #38〕. Không có `draft`, khi tạo thì đặt là `published` | Như trên | **Chỉ vật tư** |

〔Chu kỳ §3.3 · §4A-2C〕〔Yêu cầu REQ-DL-845〕

- **Giao hàng theo yêu cầu chỉ dành cho vật tư. Lạnh · đông lạnh vẫn là 2 giá trị chu kỳ／special** 〔Yêu cầu REQ-DL-845〕. Các trường hợp bất thường chỉ một lần không đăng ký vào master mà xử lý bằng cách **sửa trực tiếp dữ liệu giao hàng sau khi tạo**. Cuối tháng được hiểu thành 28〜31 ngày theo từng tháng.
- **Khi ngày chỉ định rơi vào thứ không giao được · ngày không nhận được · ngày được coi là ngày lễ giao hàng thì cũng chuyển theo "Dời sớm · dời muộn" của hợp đồng.** Không nắm giữ hướng riêng chỉ cho chỉ định riêng 〔Chu kỳ §3.2〕.
- Phân bổ số lượng: `base = floor(số lượng gói ÷ số lần giao hàng)`, phần dư cộng vào lần giao đầu tiên (ví dụ `100 suất ÷ 3 lần = 34/33/33`). Khi lẫn nhiều nhóm nhiệt độ, **ngày giao giữ chung, kế hoạch xuất hàng được chia theo nhóm nhiệt độ** và việc phân bổ được thực hiện trên số lượng của từng nhóm nhiệt độ 〔Yêu cầu REQ-DL-301〕.
- Số lượng tiêu chuẩn đã phân bổ được kế hoạch nắm giữ nội bộ dưới dạng **`shipping_plans.estimated_qty`**. **Ở `draft` chỉ là không cho doanh nghiệp thấy số lượng**, chứ không phải kế hoạch không có số lượng 〔Quyết định v2.1 S1〕〔Yêu cầu REQ-DL-882〕.

### 5-8. Khi đổi kho · tuyến giữa chừng

| Lối vào thay đổi | Phạm vi áp dụng | Nhập lý do |
|---|---|---|
| **Thay đổi hợp đồng (vĩnh viễn)** | **Từ tháng áp dụng**. Nếu đăng ký trong thời gian đặt hàng thì từ chu kỳ **tháng sau**, nếu sau hạn chốt đặt hàng thì từ chu kỳ **tháng sau nữa** 〔Chu kỳ §4A-6〕 | Bắt buộc (thao tác nguy hiểm) |
| **Thay đổi chỉ một lần** | Chỉ 1 bản ghi dữ liệu giao hàng. **"Chỉ đổi chuyến giao này"／"Chỉ định riêng ngày" ở chi tiết dữ liệu giao hàng (màn hình 06)** | **Tùy giai đoạn (bảng dưới)** |

> **Sửa đổi 2026-10-02**: Điểm phân chia của việc đổi ngày không còn là "hạn chốt đặt hàng" mà là **"thời điểm đặt hàng chính thức"**, và được thao tác bằng cách chọn bằng checkbox từ màn hình lịch trình. Chuẩn là "Quy định hiện hành" ở §8-3 của `Giao_hàng_04_Lịch_dự_kiến_dữ_liệu_giao_hàng_và_thay_đổi.md` (sổ cái L). Bảng dưới là quy định cũ.

**Việc nhập lý do của "thay đổi chỉ một lần" thay đổi theo giai đoạn** 〔Quyết định v2.1 #1〕〔Yêu cầu REQ-DL-865/866/851〕

| Giai đoạn | Làm được gì | Lý do | Đối tượng |
|---|---|---|---|
| **Trước hạn chốt đặt hàng** | Vận hành thay đổi được **từng bản ghi hoặc hàng loạt** | **Tùy chọn** | Không giới hạn |
| **Sau hạn chốt đặt hàng〜trước ngày xuất hàng 1 ngày** | **Vận hành thay đổi được từng bản ghi** ("Chỉnh sửa" ở chi tiết dữ liệu giao hàng. Không thay đổi hàng loạt · kéo thả) 〔Quyết định v2.3 #63〕 | **Bắt buộc** | **Cùng nửa đầu／nửa sau của cùng chu kỳ** |
| Từ ngày xuất hàng trở đi | Không đổi ngày. Xử lý bằng hủy + nhân bản (cũ: sau hạn chốt đều là hủy + nhân bản · Quyết định v2.2 #1) | Bắt buộc nhập lý do hủy · nhân bản | — |

- **Điểm phân chia chỉ là "hạn chốt đặt hàng" duy nhất** 〔Quyết định v2.2 #1〕. `locked` (lần gửi lệnh xuất hàng đầu tiên thành công) **là cột mốc của lệnh xuất hàng, không phải cột mốc của việc đổi ngày**. **(Cũ: 3 giai đoạn trước hạn chốt／sau hạn chốt · trước `locked`／sau `locked`. Sau hạn chốt · trước `locked` chỉ vận hành từng bản ghi · bắt buộc lý do · giới hạn ở bản ghi cần xác nhận. Hủy theo quyết định đợt 3 ngày 2026/09/22)**
- "Thay đổi tuyến giao hàng · chỉ định riêng ngày đều không bắt buộc lý do" **chỉ áp dụng cho thay đổi trước hạn chốt** 〔Quyết định #26〕. **Thay đổi ngày từ sau hạn chốt đến trước ngày xuất hàng 1 ngày (từng bản ghi từ "Chỉnh sửa" ở chi tiết dữ liệu giao hàng) bắt buộc có lý do** 〔Quyết định v2.3 #63〕 (thay đổi 2026/09/29. Cũ: sau hạn chốt không đổi ngày nên bản thân vấn đề có cần lý do hay không không phát sinh).
- **Dù lý do để trống, lịch sử thay đổi vẫn nhất định lưu trước thay đổi → sau thay đổi và người thao tác.** Thay đổi hàng loạt · hủy · dừng · nhân bản · hủy override vẫn bắt buộc lý do như trước.
- **Điểm khởi đầu của `locked` chỉ có một: "thời điểm lệnh xuất hàng được gửi thành công lần đầu".** Chỉ xuất (tạo) thì không `locked`, và **dù đã gắn số phiếu vận chuyển cũng không `locked`** 〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867〕. Do quy tắc tháng áp dụng, **về mặt cấu trúc không xảy ra việc thay đổi hợp đồng rơi vào dữ liệu giao hàng `locked`** (lệnh xuất hàng được phát ra vào thứ Sáu trước 3 ngày so với ngày bắt đầu, gộp cho 2 tuần, nên nhất định sau hạn chốt đặt hàng) 〔Yêu cầu REQ-DL-812〕.
- Trường hợp cần xử lý riêng trước tháng phản ánh như chuyển nhà thì không xử lý ở phía hợp đồng mà xử lý bằng thay đổi **"chỉ chuyến giao này" ở phía dữ liệu giao hàng**. Việc bắt đầu dùng địa chỉ mới cho dữ liệu giao hàng đã tạo từ khi nào thì **vận hành chọn ngày chuẩn bằng "Cập nhật từ ngày này trở đi"** (không tự động ghi đè toàn bộ) 〔Chu kỳ §4A-6〕.
- Dù là thay đổi hợp đồng hay "thay đổi chỉ một lần", **công ty vận chuyển chọn từ toàn bộ master công ty vận chuyển, điểm trung chuyển chọn từ toàn bộ trung chuyển (`HU`)** (chặng 1 cũng chọn được công ty giao hàng ủy thác) 〔Quyết định v2.3 #50〕.

### 5-9. Yêu cầu thay đổi ngày giao của doanh nghiệp

| Vấn đề | Nội dung đã quyết định |
|---|---|
| Phạm vi có thể yêu cầu | **Đến hết khoảng thời gian mà chu kỳ giao hàng đã được tạo (tối đa 6 tháng sau)**. Các tháng sau chưa cài đặt thì không hiển thị trên lịch cũng như trong ứng viên |
| Ngoài đối tượng | **Không thể hy vọng thay đổi ngày quá khứ và tháng hiện tại.** Sau khi chốt đặt hàng · sau khi bắt đầu picking／xuất hàng cũng không chọn được |
| Ngày đích | Trong **cùng chu kỳ giao hàng** với kế hoạch hiện tại. Chu kỳ giao hàng vắt qua tháng dương lịch nên ngày của tháng 10 thuộc chu kỳ tháng 9 cũng có thể là ngày đích. Hạn chế thay đổi vắt qua nửa đầu → nửa sau, Phase1 (A · B) → Phase2 (C · D) 〔Yêu cầu REQ-DL-502〕 |
| Cách hiển thị ở giai đoạn kế hoạch | `draft` **chỉ hiển thị ngày** (nắm giữ số lượng nhưng không cho doanh nghiệp thấy). **Web doanh nghiệp giữ dấu "dự kiến"** (hiển thị tháng của Web vận hành vẫn bỏ tag) 〔Yêu cầu REQ-DL-859/828/882〕 |
| Lạnh và đông lạnh | **Lạnh và đông lạnh của cùng cơ sở · cùng ngày giao được di chuyển cùng nhau.** Không có chuyện chỉ di chuyển một bên. Màn hình phê duyệt liệt kê toàn bộ đối tượng sẽ di chuyển. **Vì kho · lead time khác nhau theo từng phân loại nên ngày picking được tính ngược riêng cho từng phân loại** (chỉ ngày giao là đồng nhất) |
| Hết hạn phê duyệt | **Không tự động từ chối.** Nếu đang ở trạng thái đề xuất mà không có phản hồi đến hạn thì vận hành quyết định, kèm lý do và chuyển thành đã điều chỉnh (**bắt buộc liên lạc với doanh nghiệp**) 〔Chu kỳ §4A-4E〕 |
| **Hạn xử lý "đang yêu cầu"** | **Hạn xử lý = hạn chốt đặt hàng của chuyến giao đó.** Nếu **3 ngày** trước hạn chốt (cài đặt vận hành `change_request_warn_days` · mặc định 3 ngày) mà vẫn đang yêu cầu · đang đề xuất thì đưa vào mục cần xác nhận **`change_request_due`**. Dù quá hạn chốt mà chưa xử lý thì **vẫn để trong mục cần xác nhận cho đến khi vận hành xử lý**. **Hệ thống không tự động từ chối** 〔Quyết định v2.3 #37〕 |
| Sau khi từ chối · màn hình | Không đặt luồng yêu cầu lại, vận hành bằng cách sửa nội dung thay đổi mong muốn trên hệ thống. Màn hình yêu cầu không tách riêng mà **tích hợp với chi tiết dữ liệu giao hàng (màn hình 06)**, và **hiển thị tên người yêu cầu** để liên lạc qua điện thoại 〔Yêu cầu REQ-DL-305〕 |

**Phân chia nơi lưu theo nội dung yêu cầu** 〔Chu kỳ §3.4〕

| Nội dung yêu cầu | Bản chất | Nơi lưu | Ảnh hưởng của thay đổi chu kỳ |
|---|---|---|---|
| Ngày này không nhận được (nghỉ · kiểm kê · thi công · cuối năm đầu năm) | Ràng buộc của cơ sở | Ngày không nhận được của cơ sở (§5-5) | **Không chịu ảnh hưởng.** Dù tạo lại vẫn nhất định tránh |
| Thứ này không nhận được | Ràng buộc của cơ sở | **Thứ không giao được** của cơ sở | Không chịu ảnh hưởng |
| Muốn dời sớm · dời muộn chỉ lần này | Điều chỉnh của lần đó | Override đã phê duyệt | Chịu ảnh hưởng (đối tượng re-anchor) |
| Lần này không cần (bỏ qua) | Điều chỉnh của lần đó | Override đã phê duyệt | Chịu ảnh hưởng |

- **Override chỉ được tiếp nhận đến tháng sau nữa.** Xa hơn thì đăng ký như ràng buộc hoặc yêu cầu khi tháng đó đã có thể chỉnh sửa (càng xa càng tạo ra nhiều hết hiệu lực · đề xuất lại). **Những điều cần xác nhận trước khi phê duyệt** (1〜6 phán định khi tạo ngày ứng viên, 7 không phán định được tại thời điểm phê duyệt): ① ngày đó có giao được không ② ngày picking tính ngược có phải ngày **không xuất được** không ③ lead time có thành lập không ④ số lượng picking của ngày đó còn dư không (cảnh báo "còn ◯ đơn", nếu vượt thì bắt buộc xác nhận khi phê duyệt) ⑤ có tuyến giao hàng đi vòng qua cơ sở đó vào thứ đó không ⑥ nếu là chuyến công ty vận tải thì có phải ngày công ty vận chuyển có thể đến lấy hàng không ⑦ có bố trí được tài xế không (**việc gán diễn ra từ 1 tuần trước ngày giao đến trước 1 ngày nên không phán định được tại thời điểm phê duyệt**. Chỉ phát hiện bằng giám sát sau đó).
- **Snapshot căn cứ tại thời điểm phê duyệt** (ngày giao／ngày picking ban đầu · kho được gán · phân loại giao hàng／tuyến giao hàng · loại chuyến／số lượng picking lúc đó／revision của cài đặt chu kỳ dùng để phán định). Khi không có một ngày nào có thể chọn thông thường, chuyển sang **chế độ yêu cầu ngày mong muốn** và bắt buộc tiếp nhận **2 khung: nguyện vọng 1 · nguyện vọng 2** ("Không có ngày mong muốn (giao cho vận hành)" cùng tồn tại như lựa chọn thứ ba).
- **Quy định chi tiết của màn hình yêu cầu**: không hiển thị ngày ngoài đối tượng yêu cầu trong danh sách ứng viên (không luôn hiển thị hướng dẫn liên lạc ngoài hệ thống). Ngay cả ở giai đoạn kế hoạch cũng phán định khả thi theo kho · công ty vận chuyển được gán, dùng ngày không xuất được · ngày không giao ủy thác được · ngày không nhận được để phán định ngày ứng viên. Ngày đích chỉ trong cùng phân loại giao hàng, và trên màn hình doanh nghiệp không hiển thị chính mã nội bộ A/B · C/D mà giải thích là "giữa các chuyến nửa đầu tháng／giữa các chuyến nửa sau tháng". Khi chọn "không có ngày mong muốn" thì vận hành xác nhận ứng viên · kho · ủy thác. Ô ngày ứng viên có 5 trạng thái "Có thể thay đổi／Đang chọn／Cần xác nhận (lượng lưu kho)／Không chọn được／Nguyện vọng 1 · 2", không chỉ dựa vào màu mà ghi kèm biểu tượng và văn bản trạng thái. Hàng đợi duyệt của vận hành sắp xếp tài liệu phán định (có hạn tiêu thụ ngắn／lượng lưu kho cần xác nhận／không xuất được／không vấn đề) bằng tag phán định tự động, với 3 lựa chọn là phê duyệt · đề xuất ngày thay thế · từ chối. Vận hành vẫn tiếp tục thao tác được ngay cả với đối tượng bị hạn chế, nhưng trước khi chốt phải hiển thị "cần xác nhận" và lý do, bắt buộc phê duyệt 〔Nguồn gốc: Cài đặt chu kỳ giao hàng §3.4〕.

---

### 5-10. Thay đổi hàng loạt tuyến giao hàng (quyết định tối 2026/10/01)

| Khía cạnh | Nội dung |
|---|---|
| Lối vào | Vận hành ＞ Quản lý doanh nghiệp · hợp đồng ＞ **Thay đổi hàng loạt tuyến giao hàng** |
| Cách chọn đối tượng | Chọn bằng **lọc** (kho · công ty vận chuyển 〈chặng 1 · 2〉 · điểm trung chuyển · tỉnh · course) rồi bỏ chọn các cơ sở muốn loại, hoặc **nhập CSV** (1 dòng = cơ sở × phân loại giao hàng: ID cơ sở · phân loại giao hàng · ID kho · công ty vận chuyển chặng 1 · ID điểm trung chuyển · công ty vận chuyển chặng 2 · chu kỳ bắt đầu áp dụng. Ô trống là không đổi. Xuất được file mẫu) |
| Áp dụng | **Từ chu kỳ bắt đầu áp dụng**. Chu kỳ sớm nhất chọn được giống như thay đổi 1 hợp đồng (trước hạn chốt đặt hàng là tháng sau, sau hạn chốt là tháng sau nữa). Ghi đè giá trị mặc định của hợp đồng cha và tuyến của hợp đồng con từ chu kỳ áp dụng trở đi. Dữ liệu giao hàng đã tạo thì như 8-7 (thay đổi kho · công ty vận chuyển · trung chuyển) → cần xác nhận → thay đổi hàng loạt |
| Xem trước ảnh hưởng | Trước khi thực thi, hiển thị: các cơ sở sẽ đổi · hợp đồng con sẽ ghi đè · kế hoạch (draft) sẽ tạo lại · dữ liệu giao hàng sẽ trở thành cần xác nhận · **các cơ sở cần xem lại lead time** (cơ sở có kho thay đổi. Lead time do từng hợp đồng nắm giữ nên không tự động đổi) · đơn vị ủy thác bị loại／đơn vị ủy thác mới. Không nhập các dòng lỗi của CSV |
| Thông báo cho đơn vị ủy thác | Khi có cơ sở mà công ty giao hàng ủy thác chặng 1 · 2 thay đổi, gửi **"Kết thúc phụ trách"** (cơ sở · ngày phụ trách cuối) cho **đơn vị ủy thác bị loại**, và **"Thêm phụ trách"** (cơ sở · ngày phụ trách đầu tiên · địa chỉ · khung giờ nhận hàng · tài liệu) cho **đơn vị ủy thác mới** bằng thông báo trên cổng đơn vị giao hàng ủy thác + email. Khi đơn vị ủy thác của tuyến thay đổi do thay đổi 1 hợp đồng cũng tương tự. Nội dung email được quyết định ở STEP7 (danh sách email) |
| Lịch sử | Mỗi lần thay đổi hàng loạt lưu số · ngày giờ thực thi · phương pháp (lọc／CSV) · bắt đầu áp dụng · số cơ sở · nội dung · đơn vị ủy thác đã thông báo. Cũng lưu vào lịch sử thay đổi của hợp đồng con của từng cơ sở |
| Quyền | Quản trị viên vận hành (logistics). Không thao tác từ Web doanh nghiệp · đơn vị giao hàng ủy thác |
