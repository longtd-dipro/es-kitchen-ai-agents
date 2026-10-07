# Đặc tả giao hàng: guard của API・Batch・Giao dịch・Mã lỗi・Liên kết bên ngoài — Chuẩn

〔Nguồn gốc: DEV仕様書 §15〜§19 (Nhật hóa 2026-10-03)〕

<!-- Nguồn: Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md §15〜§19 (tiếng Việt). Số mục giữ nguyên như DEV (DEV §15.x = tài liệu này 15.x). -->

**Tệp này là chuẩn cho guard của API・batch・giao dịch・kiểm toán・mã lỗi・liên kết bên ngoài (THOMAS・Yamato・CSV).** Về bảng・cột xem `Giao_hàng_11_Mô_hình_dữ_liệu.md` (DEV §14).

- Tên bảng・tên cột・enum・tên batch・mã lỗi **giữ nguyên tiếng Anh**.
- Tên trạng thái (Chờ xuất hàng／Đã xuất hàng／Đã nhận／Đã giao／Đã giao một phần／Chờ giao lại／Đang xác nhận／Hủy giữa chừng／Hủy bỏ) trong DEV cũng là giá trị tiếng Nhật nguyên bản.
- Chỗ sửa cho khớp với sổ quyết định (`docs/決定台帳.md`) ghi **【Sửa theo sổ quyết định】**, API bổ sung từ quyết định của sổ ghi **【Bổ sung・2026-10-03】**, chỗ chưa quyết được・chưa tự tin về cách dịch ghi **【Cần xác nhận】**.
- Chỗ mâu thuẫn với các chương khác trong `Đặc_tả_giao_hàng/` được để lại dưới dạng 【Cần xác nhận】 (có ghi bên nào mới hơn).

---

## 15. Guard của API

### 15.1 Guard chung

Tất cả API cập nhật (mutation) thực hiện theo thứ tự sau.

| # | Nội dung |
|---|---|
| 1 | Xác thực người thao tác (actor) |
| 2 | Phân quyền theo vai trò và phạm vi dữ liệu |
| 3 | Trong giao dịch, khóa và đọc bản ghi hiện tại |
| 4 | Kiểm tra `plan lifecycle` |
| 5 | Kiểm tra `delivery status` |
| 6 | Kiểm tra ngày làm việc・thời điểm (mốc) |
| 7 | Kiểm tra master liên quan còn hiệu lực |
| 8 | Thực hiện theo kiểu lũy đẳng |
| 9 | Ghi log kiểm toán |

### 15.2 Bảng quyền

| Thao tác | Vận hành (logistics) | Vận hành (CS) | Kinh doanh | Doanh nghiệp | Công ty giao hàng ủy thác | Tài xế |
|---|---|---|---|---|---|---|
| Lưu chu kỳ・master | ○ | × | × | × | × | × |
| Sửa thiết lập giao hàng của hợp đồng | ○ | × | ○ | × | × | × |
| Đổi ngày trước hạn chót | ○ | × | × | Đăng ký/yêu cầu | × | × |
| Phê duyệt・từ chối đơn đăng ký/yêu cầu | ○ | ○ | × | × | × | × |
| Hủy bỏ・hủy giữa chừng・nhân bản | ○ | × | × | × | × | × |
| Phân công・thay đổi phân công | ○ | × | × | × | Chặng của công ty mình | × |
| Tham chiếu dữ liệu giao hàng (phạm vi nhìn thấy) | Tất cả | Tất cả | Tất cả | `corp_admin`: tất cả cơ sở của công ty mình／`site_staff`: cơ sở được gán (#55) | Chỉ dữ liệu giao hàng có chặng của công ty mình (15.15) | Phần được phân công |
| Báo cáo giao hàng・sự cố | Đăng ký thay | Đăng ký thay | × | × | Trong công ty mình | Phần được phân công |
| Đăng ký báo cáo đỗ xe【Bổ sung・2026-10-03】 | Đăng ký thay・sửa (bắt buộc lý do) | × | × | × | × (là bên ứng trước rồi gom yêu cầu thanh toán cho vận hành)〔Phản hồi hong 2026-10-03〕 | Phần được phân công |

### 15.3 Lưu thiết lập chu kỳ giao hàng

| guard | Nội dung |
|---|---|
| Người thao tác | Vận hành (logistics) |
| A1 | Làm tròn về thứ Hai (normalize) |
| Tháng đã xác định | Không sửa (đến `fixed_through`) |
| Kỳ hạn | Phạm vi phải đúng |
| Tạm nghỉ | Phải đúng. **Tổng số ngày dừng của một lần tạm nghỉ (`normal` + các `adjust` gắn với nó) phải chia hết cho 7**. Nếu không chia hết thì từ chối lưu và trả về **số ngày `adjust` còn thiếu** |
| Kho | Kho được tham chiếu phải tồn tại |

Kết quả: lưu thiết lập, tạo lịch chu kỳ (cycle days), kích hoạt `plan_rollout`／`plan_recheck`, ghi vào kiểm toán.

### 15.4 Đổi ngày giao

Chỉ **trước hạn chót đơn hàng** mới cho phép như thông thường:

- Người thao tác có quyền.
- Chưa đến `order_close_date`.
- Ngày mới qua được kiểm tra ngày.

**Sau hạn chót đơn hàng** chỉ cho qua khi thỏa cả 4 điều kiện sau (#63・2026-09-29. Giống `配送_04` §8-3):

| # | Điều kiện | Lỗi khi không thỏa |
|---|---|---|
| 1 | Hôm nay < ngày xuất hàng hiện tại (`shipped_date`). Tức là **đến trước ngày xuất hàng 1 ngày**. Và ngày xuất hàng mới ≥ ngày mai | `DOMAIN_ORDER_CLOSED` |
| 2 | Ngày giao mới **cùng `cycle_id`** và **cùng một nửa** (tuần A・B hoặc tuần C・D) | `DOMAIN_DATE_OUT_OF_RANGE` (【Đề xuất】) |
| 3 | Yêu cầu từng bản ghi một | — |
| 4 | Có `reason` | `DOMAIN_REASON_REQUIRED` |

- Không đổi `warehouse_id` (nếu đổi kho thì hủy bỏ + nhân bản).
- Nếu đã gửi chỉ thị xuất hàng thì tạo `ship_order_diff` và gửi lại bằng phiên bản mới.
- Lưu dưới dạng override `fix`. 【Cần xác nhận】`override_type` ở DEV §14.11 là `absolute_date｜skip`, không có `fix` (`配送_11` 14.11).
- (Cũ: sau hạn chót luôn là `DOMAIN_ORDER_CLOSED`. Không có nhánh ngoại lệ cho vận hành)
- 【Cần xác nhận】Nếu dùng `deliveries.shipped_date` làm "ngày xuất hàng" ở điều kiện 1 thì trước khi nhập kết quả xuất hàng sẽ chưa có giá trị. Có đúng khi hiểu là ngày xuất hàng dự kiến (`shipping_plans.picking_date`) không?

### 15.5 Phê duyệt đơn đăng ký/yêu cầu・hủy override

**guard phê duyệt**

- Người thao tác là vận hành (logistics) hoặc vận hành (CS).
- Đơn ở trạng thái `pending`／`proposed`.
- Đối tượng chưa `locked`.
- Ngày đề xuất phải đúng.

**guard hủy override**

- Vận hành (logistics).
- Bắt buộc lý do.
- Đối tượng chưa `locked`.

Override được hủy bằng trạng thái. Không xóa vật lý.

### 15.6 Tạo xác định (materialize)・Chốt số lượng (finalize)

| Xử lý | guard |
|---|---|
| Tạo xác định | Kế hoạch là `draft`／đã qua `order_start_date`／kế hoạch không phải "không thể tạo"／chưa có dữ liệu giao hàng |
| Chốt số lượng | Đã qua `order_close_date`／mốc là `menu` (không phải tạm)／số lượng đúng |

### 15.7 Gửi chỉ thị xuất hàng

| guard | Nội dung |
|---|---|
| Đối tượng | Dữ liệu giao hàng thỏa điều kiện gửi (DEV §10.2) |
| Phiên bản | Phiên bản (`rev`) đúng |
| Thời hạn | **Chưa nhận kết quả xuất hàng của bản ghi giao hàng đó** |
| Hash | `payload_hash` được tạo từ nội dung đã chuẩn hóa (canonical payload・19.1) |

Thành công: ghi nhận thành công, nếu là lần đầu thì chuyển `locked`. Thất bại: ghi nhận thất bại, không chuyển `locked`.

### 15.8 Nhập số vận đơn・kết quả xuất hàng

- Dữ liệu giao hàng tồn tại.
- Số vận đơn không phải của dữ liệu giao hàng khác.
- Công ty giao hàng khớp với công ty giao hàng của một chặng nào đó trong `delivery_legs` của bản ghi giao hàng đó.
- Dữ liệu giao hàng không phải `Hủy giữa chừng`／`Hủy bỏ`.
- Nếu số vận đơn đến trước khi gửi chỉ thị xuất hàng thành công thì tạo anomaly (cần xác nhận). Không chuyển `locked`.

### 15.9 Phân công tài xế

- Người thao tác là vận hành, hoặc công ty giao hàng ủy thác đúng phạm vi.
- `delivery_regime` của chặng là `self`／`partner_driver` (không phân công chặng `parcel_carrier`・DEV §13.1).
- Tài xế còn hiệu lực và thuộc công ty giao hàng phù hợp.
- Chặng thuộc dữ liệu giao hàng đó (`delivery_legs.delivery_id`).
- Dữ liệu giao hàng chưa kết thúc.
- Cho phép cả sau `locked`.

### 15.10 Chuyển trạng thái

- Chuyển trạng thái có trong bảng DEV §12.2 (`配送_04` §7-7 ②).
- Người thao tác được phép thực hiện sự kiện đó.
- Có đủ các hạng mục thực tế・sự cố cần thiết.
- `Hủy bỏ`・`Hủy giữa chừng`, và giải quyết ngoại lệ thì bắt buộc nêu lý do.

### 15.11 Nhân bản

- Người thao tác của API nhân bản thủ công là vận hành (logistics). Bản ghi con tự động do hệ thống tạo khi đăng ký sự cố・gán lại loại (DEV §13.2.1) có `actor_type = system`.
- Bản gốc là dữ liệu giao hàng `published`／`locked`.
- Độ sâu là 0 (không nhân bản tiếp từ bản ghi con). **Ngoại lệ khi bản ghi con xảy ra sự cố** (DEV §9.4): nội dung lấy từ bản ghi con, nhưng `parent_delivery_id` của bản ghi mới là **bản ghi cha của bản ghi con đó**.
- Số nhánh tiếp theo không vượt quá 9.
- `duplicate_type` đúng.
- Nếu bản ghi giao hàng xảy ra sự cố đã có bản ghi con tự động còn hiệu lực (xác định bằng `source_trouble_delivery_id`) thì dùng lại bản ghi con đó, từ chối yêu cầu tạo bản thứ 2 (`DOMAIN_TROUBLE_CHILD_EXISTS`).

Việc tạo bản ghi con và kiểm toán thực hiện trong cùng một giao dịch.

### 15.12 Giải quyết sự cố

- Người thao tác là vận hành (logistics).
- Có từ 1 báo cáo sự cố chưa giải quyết trở lên. Dữ liệu giao hàng là `Đã xuất hàng`／`Đã nhận`／`Đã giao`. Nếu có bản ghi con tự động thì là `Đang xác nhận`.
- **Giải quyết gộp theo đơn vị bản ghi giao hàng**: đóng toàn bộ báo cáo chưa giải quyết của bản ghi giao hàng đó trong cùng một giao dịch (DEV §13.2).
- Từ `Đã giao` chỉ được giải quyết giao đủ toàn bộ. Tuy nhiên nếu `completion_source = presumed` thì cũng được "gửi lại toàn bộ" hoặc "không gửi nữa" (DEV §13.2.2).
- `partial_no_resend`: không tạo bản ghi con. Nếu có bản ghi con tự động thì `Hủy bỏ`.
- Giá trị giải quyết đúng. Số lượng thực tế đúng. Bắt buộc lý do.
- Khóa dữ liệu giao hàng・báo cáo sự cố chưa giải quyết・bản ghi con tự động (nếu có) trong cùng một giao dịch.
- Giải quyết giao một phần・giao lại thì dùng lại bản ghi con tự động, cập nhật số lượng・`delivery_lines`・ngày ứng viên・`duplicate_type`.
- Với cách giải quyết không cần gửi lại, chuyển bản ghi con tự động sang `Hủy bỏ` kèm lý do.
- Chỉ khi `schedule_confirmed = true` và `quantity_confirmed = true` mới chuyển được bản ghi con tự động sang `Chờ xuất hàng`.
- Đóng cần xác nhận `trouble_open`・`trouble_auto_child_pending` trong cùng giao dịch.
- **Hạng mục bắt buộc theo từng cách giải quyết** (2026-09-29・#65. Màn hình 2 bước: chọn cách giải quyết → chỉ hiển thị hạng mục cần). Với báo cáo của bản ghi giao hàng đó có `type_code = NULL`, phải gán loại cho tất cả trước khi giải quyết (nếu không thì `VALIDATION_REQUIRED`).

| `resolution` | Số lượng (`delivery_lines.delivered_qty`) | Bản ghi con (dùng lại bản ghi con tự động) | `freight_billable` | `resolution_reason` |
|---|---|---|---|---|
| `full` | Bắt buộc (mặc định = số lượng đã chốt). `substituted_from_product_id` là tùy chọn | — | — | Bắt buộc |
| `partial` | Bắt buộc. Phần còn lại = chênh lệch → số lượng của bản ghi con | Bắt buộc `candidate_date` | — | Bắt buộc |
| `partial_no_resend` | Bắt buộc | — (bản ghi con tự động → `Hủy bỏ`) | — | Bắt buộc |
| `redelivery` | — (tất cả 0) | Bắt buộc `candidate_date` | Bắt buộc (mặc định false) | Bắt buộc |
| `same_day_revisit` | — | — (bản ghi con tự động → `Hủy bỏ`) | — | Bắt buộc |
| `stop` | — (tất cả 0) | — (bản ghi con tự động → `Hủy bỏ`) | Bắt buộc (mặc định false) | Bắt buộc |

Hạng mục không liên quan đến cách giải quyết đã chọn thì bỏ qua (không lưu).

### 15.12.1 Đăng ký sự cố・gán lại loại (2026-09-29)

- Người thao tác: tài xế được phân công, công ty giao hàng ủy thác trong công ty mình, hoặc vận hành (đăng ký thay).
- Dữ liệu giao hàng là `Đã xuất hàng`／`Đã nhận`／`Đã giao`.
- Màn hình (#64・2026-09-29): tab "Sự cố" và nút "Đăng ký thay sự cố" trong chi tiết dữ liệu giao hàng **không hiển thị** khi là `Dự kiến`・`Chờ xuất hàng` (hiển thị với `Đang xác nhận` của bản ghi con). guard của API giữ nguyên như trên.
- `type_code`: với tài xế thì lấy từ `trouble_app_reasons`, với đăng ký thay thì vận hành chọn. Cũng có thể là NULL.
- Trong cùng một giao dịch: tạo báo cáo + UPSERT cần xác nhận `trouble_open` + (nếu `trouble_types.auto_child = true` và chưa có bản ghi con tự động còn hiệu lực) tạo bản ghi con tự động (DEV §13.2.1) + UPSERT cần xác nhận `trouble_auto_child_pending` + kiểm toán.
- Nếu vận hành gán lại loại (NULL・loại khác → loại có `auto_child = true`) mà chưa có bản ghi con tự động thì tạo vào thời điểm đó. Nếu gán lại sang loại có `auto_child = false` thì bản ghi con đã tạo **không tự động hủy** (vận hành xử lý khi giải quyết).

### 15.13 Đổi tuyến của dữ liệu giao hàng

Không có cột ghi đè. Sửa trực tiếp `delivery_legs` của bản ghi giao hàng đó.

| guard | Nội dung |
|---|---|
| Người thao tác | Vận hành (logistics) |
| Trạng thái | Không phải `Đã giao`／`Hủy giữa chừng`／`Hủy bỏ` |
| Lý do | Bắt buộc |
| Quy tắc chặng | Sau khi sửa, `delivery_legs` vẫn thỏa quy tắc ở `配送_11` 14.4 (số thứ tự liên tục・chặng cuối có đúng 1 chặng・`to_type = destination` của chặng cuối) |
| Kho | Sau khi gửi chỉ thị xuất hàng thành công thì không đổi `warehouse_id`. Nếu muốn đổi kho xuất hàng thì hủy bỏ + nhân bản |

Ngay cả sau `locked` vẫn đổi được công ty giao hàng・tài xế của chặng, nhưng để gửi lại thì tạo cần xác nhận `ship_order_diff` (16.12). Mỗi chặng đã đổi được ghi vào kiểm toán bằng `before_json`／`after_json`.

### 15.14 Đổi địa chỉ nơi giao của 1 bản ghi giao hàng

Chỉ riêng bản ghi giao hàng đó có thể đổi `address_snapshot`／`destination_name` (2026-09-22).

| guard | Nội dung |
|---|---|
| Người thao tác | Vận hành (logistics) |
| Trạng thái | Không phải `Đã giao`／`Hủy giữa chừng`／`Hủy bỏ` |
| Lý do | Bắt buộc |

Nếu là **sau khi gửi chỉ thị xuất hàng thành công**:

1. Tạo phiên bản mới của chỉ thị xuất hàng với địa chỉ mới (19.2).
2. Chuyển toàn bộ số vận đơn hiện có sang `voided` (phiếu cũ đã in với địa chỉ khác).
3. Khi gửi phiên bản mới thành công thì phát hành lại số vận đơn.
4. Không đổi `locked_at`.

Sau khi gửi chỉ thị xuất hàng thành công, việc đổi `warehouse_id` vẫn bị cấm. Khi đó hủy bỏ + nhân bản (15.13).

### 15.15 Phạm vi dữ liệu của Web công ty giao hàng ủy thác (2026-09-29)

- Công ty giao hàng ủy thác chỉ nhìn thấy dữ liệu giao hàng có **từ 1 chặng trở lên** với `carrier_id` là công ty mình. Thao tác được cũng chỉ trên chặng của công ty mình (chặng 1 = đến nhận hàng tại kho／chặng 2 = từ nhận hàng tại điểm trung chuyển đến giao hàng).
- Dữ liệu giao hàng đã tạo xác định và đã qua `order_close_date`: trả về toàn bộ hạng mục (tên cơ sở・địa chỉ・ngày giao・nhiệt độ hàng・số lượng・điều kiện giao hàng・vận đơn).
- Kế hoạch (`draft`) và dữ liệu giao hàng trước `order_close_date`: **đến chu kỳ tháng sau**, chỉ `delivery_date`・tên cơ sở・`temp_type`・số bản ghi. **Không trả về số lượng**.

### 15.16 Xác định cơ sở (đăng ký chính thức) → Bắt đầu tạo (2026-09-29・#52)

| guard | Nội dung |
|---|---|
| Người thao tác | Vận hành |
| Đã nhập | Tất cả tab bắt buộc của cơ sở đã được lưu. Tuyến theo từng loại giao hàng đã đầy đủ (kho・công ty giao hàng chặng 1・lead time・mẫu giao hàng・slot giao hàng. Công ty giao hàng chặng 2 〈luôn bắt buộc. Nếu không trung chuyển thì cùng công ty với chặng 1〉・điểm quá cảnh 〈cũng ghi rõ "không có"〉〔Phản hồi hong 2026-10-03・REQ-DL-710〕) |
| Xác nhận nội dung đăng ký (phụ lục 6) | Kho picking và số lần giao hàng đã được nhập ở "Xác nhận nội dung đăng ký" (trước đăng ký tạm). Bộ khởi tạo đơn hàng・vật tư đã tạo khi đăng ký tạm được gắn vào kế hoạch・dữ liệu giao hàng tại đây (DEV §4.8) |
| Phạm vi số lần giao hàng | `delivery_count` của mỗi loại giao hàng **từ 1〜8** (vật tư là NULL). Lạnh từ 1 trở lên, ES Standard cũng từ 1 trở lên cả đông lạnh【Sửa theo sổ quyết định】(sổ B "số lần giao hàng 1〜8 lần". DEV chỉ kiểm tra "đã nhập") |
| Trạng thái | Hợp đồng là `provisional` |

Kết quả (trong cùng giao dịch với việc `contracts.status → active` và nhập `confirmed_at`／`confirmed_by`):

1. Nếu đã qua `order_close_date` của tháng chu kỳ bắt đầu (`start_cycle_month`) thì dời `start_cycle_month` sang chu kỳ kế tiếp và ghi vào kiểm toán.
2. Chỉ cho hợp đồng này, đưa vào chạy ngay: `contract_monthly_generate` → `plan_rollout` → `delivery_materialize` (16.1〜16.3).
3. Nếu tạo thất bại thì cũng không hoàn tác việc xác định (đăng ký chính thức). Tạo cần xác nhận `plan_recheck` để vận hành làm lại.

### 15.17 Đăng nhập tài xế・Đặt lại mật khẩu【Bổ sung・2026-10-03】

Sổ quyết định B "Đăng nhập tài xế": **ID đăng nhập + mật khẩu. Đặt lại bằng mã xác thực 4 chữ số** (Figma là chuẩn. Ứng dụng tài xế_Điểm sửa đặc tả No.1). Cũ: địa chỉ email + liên kết email (tổng hợp §12-2・Thiết lập chu kỳ giao hàng §4B・REQ-DL-142) không dùng. Bảng ở `配送_11` 14.10.

| API | guard・xử lý |
|---|---|
| Đăng nhập | `login_id` + mật khẩu. `drivers.status` phải còn hiệu lực. Nếu không khớp thì `AUTH_INVALID_CREDENTIALS` (không trả về việc ID hay mật khẩu sai). Nếu sai liên tiếp thì khóa đến `locked_until` (số lần・thời gian là 【Cần xác nhận】) |
| Phát hành mã đặt lại | Nhận `login_id`, tạo mã 4 chữ số và gửi. Mã chỉ lưu hash vào `driver_password_reset_codes`. Mã chưa dùng đã phát hành trước đó bị vô hiệu. Nơi gửi là địa chỉ email đã đăng ký (`drivers.email`)〔Phản hồi hong 2026-10-03・Sổ quyết định〕 |
| Xác nhận mã đặt lại・mật khẩu mới | Mã khớp・còn hạn・trong giới hạn số lần thử・chưa dùng. Nếu khớp thì cập nhật `password_hash` và nhập `used_at`. Nếu sai thì `AUTH_RESET_CODE_INVALID`, hết hạn thì `AUTH_RESET_CODE_EXPIRED` |
| Vận hành đặt lại thay | Vận hành, và **công ty giao hàng ủy thác (chỉ tài xế của công ty mình)**〔Phản hồi hong 2026-10-03〕. Nhập người thao tác vào `issued_by` và ghi vào kiểm toán |

- Kiểm toán: ghi đăng nhập thành công・thất bại, phát hành・sử dụng mã, đặt lại thay (không ghi giá trị mật khẩu・mã).

### 15.18 Đăng ký báo cáo đỗ xe【Bổ sung・2026-10-03】

Sổ quyết định B "Báo cáo đỗ xe": **Cần. Tài xế nhập ảnh biên lai + phí đỗ xe. Không hiển thị phí đỗ xe ở mục thu tiền** (Ứng dụng tài xế_Điểm sửa đặc tả No.5). Bảng ở `配送_11` 14.7.

| guard | Nội dung |
|---|---|
| Người thao tác | Tài xế được phân công (chặng đó). Vận hành đăng ký thay・sửa (bắt buộc lý do) |
| Trạng thái・thời hạn | Nhập được đến lúc giao hàng. Sau giao hàng **7 ngày** vẫn sửa được (giống các báo cáo khác)〔Phản hồi hong 2026-10-03〕. 【Cần xác nhận】Có cho đăng ký cả khi `Đã xuất hàng` (trước khi nhận) không |
| Bắt buộc | **Cả hai**: `parking_fee` (số nguyên từ 0 trở lên・yên) và ảnh biên lai. Nếu không có ảnh thì `VALIDATION_REQUIRED` |
| Cách gửi ảnh | Ảnh gửi tách riêng khỏi phần chính (phương thức `配送_06` §12-4). 【Cần xác nhận】Có coi là "chưa hoàn tất" cho đến khi ảnh đến sau không |
| Tách khỏi thu tiền | Không đổi `cash_expected_amount`／`cash_collected_amount`. Không hiển thị trên màn hình thu tiền・chênh lệch thu tiền mặt |
| Thanh toán・cách hiển thị | Tài xế ứng trước → công ty giao hàng ủy thác gom lại và yêu cầu thanh toán cho vận hành (quản lý hệ thống). **Không thu của doanh nghiệp, cũng không hiển thị trên Web doanh nghiệp**〔Phản hồi hong 2026-10-03〕 |
| Lũy đẳng | Giống các API hoàn tất khác, bắt buộc có khóa lũy đẳng (ID giao hàng + bước + UUID của thiết bị) (`配送_06` §12-4) |

---

## 16. Batch

Batch chạy theo kiểu catch-up hằng ngày: nhặt toàn bộ những bản ghi đã qua mốc mà chưa được xử lý.

### 16.1 `contract_monthly_generate`

- Đối tượng chỉ là hợp đồng ở trạng thái DEV §4.7 (`provisional`・`suspended`・`ended` ngoài đối tượng). Từ `start_cycle_month`.
- Ngoài chạy hằng ngày, chạy ngay chỉ cho hợp đồng vừa xác định cơ sở (đăng ký chính thức) (15.16).
- Tạo hợp đồng con.
- Snapshot `contract_month_delivery_channels` và `contract_month_routes`.
- Snapshot thế hệ giá (price revision generation).
- Khóa lũy đẳng: `contract_id + cycle_month`.

### 16.2 `plan_rollout`

Kích hoạt: mỗi ngày, sau khi thay đổi chu kỳ・hợp đồng ảnh hưởng đến `draft`, **ngay sau khi xác định cơ sở (đăng ký chính thức)** (15.16).

Đối tượng: hợp đồng ở trạng thái DEV §4.7, từ `start_cycle_month`. Không tạo kế hoạch cho hợp đồng `provisional`.

| # | Xử lý |
|---|---|
| 1 | Chọn phạm vi chu kỳ |
| 2 | Tạo／tạo lại `draft` |
| 3 | Tính số lượng dự kiến (`estimated_qty`) |
| 4 | Nếu có snapshot của hợp đồng con thì dùng nó |
| 5 | Áp dụng override |
| 6 | UPSERT theo khóa duy nhất |

Không sửa `published`／`locked`.

### 16.3 `delivery_materialize`

```text
lifecycle = draft
AND order_start_date <= business_date
AND delivery_id IS NULL
AND ungeneratable_reason IS NULL
AND contracts.status thuộc đối tượng DEV §4.7
```

Xử lý từng kế hoạch trong giao dịch riêng. Dữ liệu giao hàng và `delivery_legs` được tạo trong cùng một giao dịch.

- 【Bổ sung・2026-10-03】Khi tạo dữ liệu giao hàng thì đánh số `delivery_no` (`DL-yymmdd-nnnn`・ngày = ngày xuất hàng dự kiến của kế hoạch tại thời điểm đó). **Số đã gán thì không đổi** (kể cả khi đổi ngày sau hạn chót 〈15.4〉 cũng không đánh lại). Ngày thực tế đã xuất thì nhập vào `shipped_date` (ngày xuất hàng 〈thực tế〉)〔Phản hồi hong 2026-10-03〕. Phạm vi số thứ tự xem 【Cần xác nhận】 ở `配送_11` 14.6

### 16.4 `order_finalize`

```text
order_close_date <= business_date
AND marker_source = menu
AND quantity_not_finalized
AND có order_quantities khớp với khóa duy nhất của kế hoạch
```

Cập nhật dữ liệu giao hàng hiện có. Với kế hoạch đã qua `order_close_date` mà không có `order_quantities` thì tạo cần xác nhận `qty_missing` và để nguyên dữ liệu giao hàng.

【Cần xác nhận】`配送_08` §14-5・`配送_09` §17-1 ghi "khi không có đơn hàng thì chốt bằng số lượng tiêu chuẩn (AI mode OFF)／số lượng do AI quyết định (ON)", còn `配送_04` §7-3 ghi "khi tạo xác định thì tạo khung đơn hàng bằng số lượng tiêu chuẩn". Nếu khung đơn hàng luôn có thì không mâu thuẫn với DEV, nhưng cần xác nhận xem có thể hiểu là `qty_missing` chỉ xảy ra khi "không có chính khung đơn hàng" hay không.

### 16.5 `plan_recheck`

Kiểm tra override・lead time・không thể xuất hàng・kho và công ty giao hàng còn hiệu lực・dữ liệu giao hàng `published` bị ảnh hưởng・kế hoạch không thể tạo. Chỉ tạo cần xác nhận, không sửa `published`／`locked`.

Bổ sung 2026-09-29: UPSERT `shelf_life_warning` (DEV §3.3), `change_request_due` (DEV §9.1.1), `assignment_missing`. `assignment_missing` khi chặng cần phân công không có tài xế và `delivery_date − 3 ≤ business_date` (DEV §13.1. Thay đổi 2026-09-30. Cũ: `delivery_date − 1 ≤ business_date`)〔Bảng yêu cầu dòng 142・Phản hồi phản ánh một phần bảng yêu cầu 20260930〕. Email cho công ty giao hàng ủy thác chỉ 2 lần: ngày `delivery_date − 3` và ngày `delivery_date − 1`.

### 16.6 `ship_order_send`

```text
Dữ liệu giao hàng thỏa điều kiện gửi (DEV §10.2)
AND (chưa có phiên bản OR business_date >= send_target_date)
AND không có phiên bản send_status = ok
```

| # | Xử lý |
|---|---|
| 1 | Tính `window_start`／`window_end`／`send_target_date` theo DEV §10.4 |
| 2 | Gom theo `warehouse_id` + `warehouses.thomas_csv_unit` |
| 3 | Tạo phiên bản `pending`, tạo nội dung đã chuẩn hóa và `payload_hash` (19.1) |
| 4 | Gửi theo kiểu lũy đẳng bằng `(delivery_id, rev)` |
| 5 | Thành công lần đầu → trong cùng giao dịch nhập `locked_at`・`locked_source = ship_order_sent`・`lifecycle = locked` của kế hoạch (DEV §10.3) |
| 6 | Thất bại → `send_status = failed`, **không `locked`**. Thử lại ở 16.14. Nếu vượt quá giới hạn thử lại thì cần xác nhận `ship_order_failed` |

Không chạy cho dữ liệu giao hàng của chu kỳ `marker_source = provisional` (DEV §8.3).

【Cần xác nhận】`配送_05` §10-9 (2026/10/01・xác nhận của khách hàng A2) ghi "vật tư không gửi cho THOMAS (kho văn phòng ES không có liên kết THOMAS). Làm việc bằng danh sách picking vật tư và CSV vận đơn của Yamato". DEV ghi "vật tư cũng gửi chỉ thị xuất hàng bằng catch-up hằng ngày" (DEV §4.1). Cần thêm điều kiện loại kho không có liên kết THOMAS khỏi đối tượng (cột 【Cần xác nhận】 của `配送_11` 14.5), hoặc xác nhận lại. Khi đó cũng cần quyết định cách xử lý `locked` (lần gửi chỉ thị xuất hàng thành công đầu tiên là cơ hội duy nhất) với vật tư.

### 16.7 `billing_issue`

- Chọn hợp đồng con đã qua mốc thanh toán.
- Gom theo loại thanh toán (`billing_type`) + hạn thanh toán (`payment_due_date`).
- Tạo hóa đơn theo kiểu lũy đẳng.
- Tạo dòng thanh toán (charge) và dòng điều chỉnh (adjustment).

【Sửa theo sổ quyết định】Mốc thanh toán là sổ quyết định B "Ngày phát hành hóa đơn": **chốt ngày 20 → xác định ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau** (2026-10-01・Quy tắc thanh toán §1-1). DEV không ghi ngày của mốc. "Xác định ngày 25 → phát hành cuối tháng" ở `配送_05` §10-7 #11・`配送_08` §14-4 là quyết định cũ (đã được sổ quyết định thay thế).

### 16.8 `billing_gap_detect`

Tìm hợp đồng còn hiệu lực mà không có hợp đồng con, hoặc tháng thanh toán không có hóa đơn・dòng thanh toán. Chỉ tạo cần xác nhận.

### 16.8.1 ~~`trouble_auto_duplicate`~~ (bãi bỏ ngày 2026-09-29)

Batch này **không còn**. Bản ghi con tự động được tạo ngay trong giao dịch đăng ký sự cố・gán lại loại (DEV §13.2.1・15.12.1). Không có thời hạn (SLA) và cũng không có `auto_duplicate_due_at`.

### 16.9 `delivery_presume_complete`

```text
delivery_date < business_date
AND delivery_legs(is_final_leg).delivery_regime = parcel_carrier
AND status = Đã xuất hàng
AND NOT EXISTS trouble_report chưa giải quyết
```

Đặt `status = Đã giao`, `completion_source = presumed`.

### 16.10 `delivery_detect_missing`

```text
delivery_date < business_date
AND delivery_legs(is_final_leg).delivery_regime IN (self, partner_driver)
AND status IN (Đã xuất hàng, Đã nhận)
AND NOT EXISTS trouble_report chưa giải quyết
```

Không đổi trạng thái. UPSERT cần xác nhận thiếu giao (`missing`). Chạy sau `delivery_presume_complete`.

### 16.11 `tracking_anomaly_detect`

Chọn dữ liệu giao hàng có số vận đơn nhưng chưa có lần gửi chỉ thị xuất hàng thành công. Tạo cần xác nhận anomaly (`tracking_anomaly`), không `locked`.

### 16.12 `ship_order_diff`

So sánh nội dung đã chuẩn hóa hiện tại với `payload_hash` của phiên bản gửi thành công gần nhất. Nếu khác thì tạo cần xác nhận "cần gửi lại" (`ship_order_diff`).

### 16.13 Chuỗi job

```text
contract_monthly_generate
→ plan_rollout
→ delivery_materialize
→ order_finalize
→ ship_order_send
→ plan_recheck
```

- Nếu job trước thất bại toàn bộ thì không chạy job sau.
- Thất bại của một hợp đồng được cô lập bằng giao dịch (các hợp đồng khác vẫn tiếp tục).
- Các job thanh toán và thực tế giao hàng chạy độc lập. (`trouble_auto_duplicate` bãi bỏ 2026-09-29)

【Cần xác nhận】Chuỗi ở `配送_04` §7-3・`配送_09` §17-1 là **5 job** "hợp đồng con → kế hoạch → tạo xác định → chốt số lượng → kiểm tra lại", không có `ship_order_send`. DEV là 6 job. Cần quyết định theo bên nào.

### 16.14 Thử lại・khóa・log

- Thất bại tạm thời thì thử lại tối đa 3 lần với khoảng cách tăng dần.
- Ngăn chạy trùng bằng khóa theo đơn vị job.
- Tất cả batch đều lũy đẳng.
- Nội dung ghi vào log: tên job・bắt đầu／kết thúc・ngày làm việc・số bản ghi đối tượng／thành công／thất bại／bỏ qua・thời gian thực hiện・tóm tắt lỗi.

---

## 17. Giao dịch・Cập nhật đồng thời・Kiểm toán

### 17.1 Phạm vi giao dịch

| Xử lý | Nội dung đưa vào một giao dịch |
|---|---|
| Tạo xác định | Kế hoạch + dữ liệu giao hàng (+ `delivery_legs`) |
| Gửi chỉ thị xuất hàng thành công | Chỉ thị xuất hàng + `locked` của dữ liệu giao hàng + `lifecycle` của kế hoạch |
| Chuyển trạng thái | Dữ liệu giao hàng + thực tế・sự cố + kiểm toán |
| Nhân bản | Liên kết với bản ghi cha + bản ghi con + kiểm toán |
| Đăng ký sự cố・gán lại loại | Báo cáo sự cố + khóa dữ liệu giao hàng + bản ghi con tự động (nếu là loại có `auto_child = true`) + cần xác nhận (`trouble_open`・`trouble_auto_child_pending`) + kiểm toán |
| Bản ghi giao hàng chỉ bị trễ mà tài xế báo cáo giao đủ toàn bộ | Chuyển `→ Đã giao` + giải quyết báo cáo `delay` + đóng cần xác nhận `trouble_open` + kiểm toán (DEV §13.2.3) |
| Giải quyết sự cố (theo đơn vị bản ghi giao hàng) | Giải quyết toàn bộ báo cáo chưa giải quyết + trạng thái dữ liệu giao hàng + cập nhật・hủy bản ghi con + giải quyết cần xác nhận + kiểm toán |
| Phát hành hóa đơn | Hóa đơn + dòng thanh toán |
| Đăng ký báo cáo đỗ xe【Bổ sung・2026-10-03】 | Báo cáo đỗ xe + liên kết tệp đính kèm biên lai + kiểm toán |
| Đặt lại mật khẩu【Bổ sung・2026-10-03】 | Cập nhật mật khẩu + đánh dấu mã xác thực đã dùng + kiểm toán |

### 17.2 Cập nhật đồng thời

- Với cập nhật quan trọng thì khóa bản ghi hoặc kiểm tra phiên bản (version).
- Nếu `lifecycle`／`status` thay đổi giữa lúc đọc và lúc ghi thì trả về conflict (`DOMAIN_CONCURRENT_MODIFICATION`).
- Ràng buộc duy nhất là lớp bảo vệ cuối cùng cho tính lũy đẳng.

### 17.3 Log kiểm toán

```text
id
target_type
target_id
action
before_json
after_json
reason NULL
actor_type
actor_id
created_at
correlation_id
```

Những thứ bắt buộc có kiểm toán: thay đổi chu kỳ・master・hợp đồng, đổi ngày, override, chỉ thị xuất hàng, `locked`, trạng thái, phân công, hủy bỏ・hủy giữa chừng・nhân bản, sửa thực tế, điều chỉnh thanh toán. 【Bổ sung・2026-10-03】Đăng ký・sửa báo cáo đỗ xe, đăng nhập・đặt lại mật khẩu của tài xế (không ghi giá trị chính nó).

---

## 18. Mã lỗi

| Mã | Ý nghĩa |
|---|---|
| `DOMAIN_INVALID_TRANSITION` | Chuyển `lifecycle`／`status` không đúng |
| `DOMAIN_DELIVERY_LOCKED` | Dữ liệu giao hàng đã `locked` |
| `DOMAIN_ORDER_CLOSED` | Thao tác bị cấm sau hạn chót đơn hàng |
| `DOMAIN_DATE_OUT_OF_RANGE` | 【Đề xuất】Ngày mới sau hạn chót nằm ngoài phạm vi cho phép (chu kỳ khác／nửa khác A・B–C・D) (#63) |
| `DOMAIN_REASON_REQUIRED` | Thiếu lý do bắt buộc |
| `DOMAIN_PLAN_UNGENERATABLE` | Không thể tạo kế hoạch |
| `DOMAIN_PROVISIONAL_MARKER` | Dừng vì mốc tạm |
| `DOMAIN_DUPLICATE_NOT_ALLOWED` | Bản gốc không thỏa điều kiện nhân bản |
| `DOMAIN_TROUBLE_CHILD_EXISTS` | Bản ghi giao hàng xảy ra sự cố đã có bản ghi con tự động còn hiệu lực. Không tạo mới mà phải dùng lại |
| `DOMAIN_TROUBLE_CHILD_UNCONFIRMED` | Ngày・số lượng của bản ghi con tự động chưa xác định nên không thể chuyển `Chờ xuất hàng` |
| `DOMAIN_BRANCH_LIMIT` | Vượt quá giới hạn số nhánh (9) |
| `DOMAIN_TRACKING_CONFLICT` | Số vận đơn là của dữ liệu giao hàng khác |
| `DOMAIN_DRIVER_SCOPE` | Người thao tác・tài xế ngoài phạm vi |
| `DOMAIN_ROUTE_INVALID` | Tuyến・chặng cuối không đúng |
| `DOMAIN_MASTER_INACTIVE` | Master liên quan không còn hiệu lực |
| `DOMAIN_CONCURRENT_MODIFICATION` | Xung đột cập nhật đồng thời |
| `VALIDATION_REQUIRED` | 【Cần xác nhận】Thiếu hạng mục bắt buộc. DEV §15.12 có dùng nhưng không có trong bảng §18 nên đã bổ sung |
| `AUTH_INVALID_CREDENTIALS` | 【Bổ sung・2026-10-03】ID đăng nhập・mật khẩu sai (không trả về cái nào sai) |
| `AUTH_RESET_CODE_INVALID` | 【Bổ sung・2026-10-03】Mã xác thực 4 chữ số sai／đã dùng／vượt quá giới hạn số lần thử |
| `AUTH_RESET_CODE_EXPIRED` | 【Bổ sung・2026-10-03】Mã xác thực 4 chữ số hết hạn |

---

## 19. Liên kết bên ngoài

### 19.1 Chỉ thị xuất hàng cho THOMAS

Nội dung đã chuẩn hóa (canonical payload) của 1 bản ghi giao hàng. **Thứ tự hạng mục cố định**, dùng để tính `payload_hash`.

| Hạng mục | Nguồn |
|---|---|
| `ship_order_no` | `ship_orders.id` + `rev` |
| `warehouse_code` | `warehouses.warehouse_code` |
| `branch_code` | `warehouses.branch_code` |
| `picking_date` | `shipping_plans.picking_date` |
| `delivery_date` | `deliveries.delivery_date` |
| `delivery_id` | `deliveries.id` — khóa đối chiếu khi nhận kết quả xuất hàng |
| `destination_name`／`address_snapshot`／`tel` | Snapshot của `deliveries` |
| `temp_type` | `deliveries.temp_type` |
| `service_form`／`delivery_regime` | `deliveries.service_form` và `delivery_legs` có `is_final_leg` |
| `carrier_code` | `delivery_legs.carrier_id` có `leg_no = 1` |
| `product_code`／`qty` | Dòng sản phẩm của dữ liệu giao hàng |
| `receive_windows` | `delivery_receive_windows` theo thứ tự `sort_order` |
| `delivery_condition` | `delivery_condition_snapshot` |
| `is_zeroed` | Dấu hủy (19.2) |

Chuẩn hóa trước khi hash: cắt khoảng trắng đầu cuối, ngày theo `YYYY-MM-DD`, số không có dấu phân cách, hạng mục rỗng là chuỗi rỗng.

- Mỗi `warehouse_id` + `warehouses.thomas_csv_unit` có 1 tệp. Đưa `business_date` và `rev` vào tên tệp.
- `warehouse_code` dùng nguyên ID kho (dạng `WH00001`). 【Cần xác nhận】`配送_01` §3-1 #8 (2026/10/01・xác nhận của vận hành D3-2) đã đổi thành "mã kho dùng cho THOMAS không cố định nên vận hành nhập (khác với ID kho)". `配送_01` mới hơn. `配送_01` cần xác nhận #6・`配送_05` §10-4 cũng đã thống nhất thành "vận hành nhập" vào 2026-10-03. Phần còn lại chỉ là xác nhận phía phát triển (coi `warehouse_code` là giá trị do vận hành nhập).
- 【Cần xác nhận】`ship_order_no`: DEV là `ship_orders.id` + `rev`, còn `配送_05` §10-4 là "số chỉ thị = số của dữ liệu giao hàng (bản nhân bản có số nhánh)" (ví dụ `DL-260820-0012 / rev2`). Nếu giữ Số giao hàng của sổ quyết định (`DL-yymmdd-nnnn`・ngày = ngày xuất hàng) ở `deliveries.delivery_no` (`配送_11` 14.6) thì thống nhất `ship_order_no` = `delivery_no` + `rev` là tự nhiên.
- **Bố cục vật lý (thứ tự cột・bảng mã・ký tự phân cách・header) theo định nghĩa của THOMAS. Phải xác nhận với nhà cung cấp trước khi triển khai.** Bảng trên là các hạng mục tối thiểu bắt buộc phải có.
- **Cách làm trong lúc chờ nhà cung cấp (2026-09-29)**: triển khai với các hạng mục tối thiểu ở trên, **tách riêng lớp xuất tệp (thứ tự cột・tên cột・header・bảng mã)**, khi bố cục của THOMAS đến thì chỉ thay lớp này. Nếu THOMAS không nhận được UTF-8 thì **đổi sang Shift_JIS ở lớp xuất**. Việc hủy được thực hiện bằng phiên bản `qty = 0` ngay cả khi THOMAS có I/F hủy.

### 19.1.1 Thông tin giao cho Yamato (tạm thời — chờ Yamato xác nhận・2026-09-29)

- Giữ tại văn phòng: người nhận = **công ty giao hàng ủy thác đến lấy**. Ghi tên cơ sở và Số giao hàng vào ô ghi chú.
- Ngày giao dự kiến = **ngày hàng đến văn phòng Yamato** (tính từ giá trị tham khảo của lead time chặng 1).
- CSV của THOMAS không có cột cần cho vận đơn Yamato → **xuất riêng CSV dùng cho vận đơn**.

### 19.2 Hủy・sửa sau khi gửi

- Không dùng I/F hủy. Cả hủy và sửa đều thực hiện bằng **phiên bản mới**.
- Hủy → phiên bản mới với `qty = 0`, `is_zeroed = true`.
- Sửa số lượng・nội dung → phiên bản mới với giá trị mới.
- **Đổi địa chỉ nơi giao → phiên bản mới. Số vận đơn cũ chuyển `voided` và phát hành lại** (15.14).
- Có thể gửi lại cho đến khi nhận kết quả xuất hàng của bản ghi giao hàng đó.
- Với phiên bản mới thì **không đổi** `locked_at` (DEV §10.3).
- `ship_order_diff` (16.12) so sánh nội dung đã chuẩn hóa hiện tại với nội dung của phiên bản `ok` gần nhất, nếu khác thì tạo cần xác nhận cần gửi lại.

### 19.3 Nhập số vận đơn

Nguồn: tệp từ công ty giao hàng. 1 thùng = 1 dòng.

| Hạng mục | Bắt buộc | Ghi chú |
|---|---|---|
| `delivery_id` | ○ | Khóa đối chiếu. Lấy từ nội dung đã gửi |
| `tracking_no` | ○ | |
| `carrier_code` | ○ | Phải khớp với công ty giao hàng của một chặng nào đó của bản ghi giao hàng đó |
| `box_no`／`box_total` | — | Dùng để hiển thị số thùng |
| `shipped_at` | — | |

Xử lý theo từng dòng:

| Điều kiện | Kết quả |
|---|---|
| Không có `delivery_id` | Từ chối dòng đó |
| `tracking_no` là của dữ liệu giao hàng khác | Từ chối dòng đó (`DOMAIN_TRACKING_CONFLICT`) |
| `tracking_no` là của cùng dữ liệu giao hàng | Bỏ qua, coi là thành công (lũy đẳng) |
| `carrier_code` không khớp chặng nào | Từ chối dòng đó |
| Dữ liệu giao hàng là `Hủy giữa chừng`／`Hủy bỏ` | Từ chối dòng đó |
| Chưa có lần gửi chỉ thị xuất hàng thành công | Nhận dòng, **không `locked`**. Tạo `tracking_anomaly` (16.11) |

Khi nhập số vận đơn thì không đổi `delivery status`.

### 19.4 Nhập kết quả xuất hàng

| Hạng mục | Bắt buộc |
|---|---|
| `delivery_id` | ○ |
| `shipped_date` | ○ |
| `result_code(ok｜ng)` | ○ |
| `shipped_qty` | — |
| `note` | — |

| Điều kiện | Kết quả |
|---|---|
| `ok` và dữ liệu giao hàng là `Chờ xuất hàng` | Chuyển `Đã xuất hàng`, nhập `shipped_date` |
| `ok` và dữ liệu giao hàng không phải `Chờ xuất hàng` | Bỏ qua và ghi vào log (lũy đẳng) |
| `ng` | Không đổi trạng thái, tạo cần xác nhận `shipment_result_ng` |
| `shipped_qty` khác `planned_qty` | Tạo cần xác nhận `qty_mismatch`. Không tự sửa số lượng |

### 19.5 Quy tắc chung của việc nhập

- Mỗi tệp có `import_id`. Chạy lại cùng tệp cũng không tạo dữ liệu trùng.
- Xử lý theo từng dòng. Lỗi một dòng không làm dừng cả tệp.
- Ghi vào kết quả nhập số dòng đã nhận／bỏ qua／lỗi và lý do của từng dòng. Với lỗi thì tạo cần xác nhận `import_error`.
- Mọi thay đổi phát sinh do nhập đều được ghi vào kiểm toán với `actor_type = system`, `correlation_id = import_id`.

### 19.6 Nút xuất・nhập CSV trên màn hình (2026-09-29・#53)

Màn hình "Chỉ thị xuất hàng・Nhập" (chỉ vận hành 〈logistics〉):

| Nút | Xử lý |
|---|---|
| Xuất CSV chỉ thị xuất hàng (THOMAS) | Chọn kho và phạm vi (cửa sổ 2 tuần／phần bổ sung). Xuất nội dung đã chuẩn hóa hiện tại (19.1) bằng lớp xuất tệp. **Không phải gửi**: không tạo phiên bản・không đổi `send_status`・**không `locked`** (DEV §9.3). Ghi vào `ship_order_exports` và kiểm toán |
| CSV của dòng lịch sử gửi | Tải lại nguyên tệp của phiên bản đó (`ship_orders.export_file_ref`) |
| Xuất CSV dùng cho vận đơn (Yamato) | Như 19.1.1 (tạm thời) |
| Nhập CSV kết quả xuất hàng (THOMAS) | Như 19.4 + 19.5 |
| Nhập CSV số vận đơn | Như 19.3 + 19.5 |
| Mẫu (kết quả xuất hàng／số vận đơn) | Tệp mẫu: dòng header + dòng ví dụ |
| Dòng lỗi (lịch sử nhập) | Hiển thị các dòng bị từ chối: số dòng・Số giao hàng・lý do |

- Bảng mã được đổi sang Shift_JIS ở lớp xuất (19.1). Thứ tự・tên cột là tạm cho đến khi bố cục của THOMAS đến.

---

## 【Cần xác nhận】 về cách dịch thuật ngữ

| DEV (tiếng Việt・tiếng Anh) | Cách dịch này | Điểm còn phân vân |
|---|---|---|
| canonical payload | Nội dung đã chuẩn hóa | Cũng có phương án "payload chuẩn hóa" |
| business date | Ngày làm việc | — |
| mutation API | API cập nhật | — |
| idempotent | Lũy đẳng | — |
| depth bằng 0 | Độ sâu là 0 (không nhân bản tiếp từ bản ghi con) | — |
| job chain | Chuỗi job | Theo `配送_09` |
| catch-up | catch-up (nhặt phần chưa xử lý đã qua ngày chuẩn hằng ngày) | Theo cách nói ở `配送_04` §7-3 |
| layout vật lý | Bố cục vật lý | — |
| 記事 (Yamato) | Ô ghi chú | Giữ nguyên tên ô trên phiếu của Yamato |
