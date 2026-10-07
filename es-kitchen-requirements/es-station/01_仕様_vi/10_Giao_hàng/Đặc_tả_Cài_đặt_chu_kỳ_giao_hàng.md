> **Đã đóng băng (bản gốc) 2026-10-03: từ nay không cập nhật nữa.** Bản chuẩn của đặc tả giao hàng là `docs/01_仕様/10_Giao_hàng/Đặc_tả_giao_hàng/`, các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung cần thiết đã được chuyển sang từng chương của Đặc_tả_giao_hàng/ (đã đối chiếu 2026-10-03).

# Cấu hình chu kỳ giao hàng — Đặc tả chức năng

**Sản phẩm**: ES Kitchen (quản lý giao cơm hộp cho doanh nghiệp)
**Chức năng đối tượng**: Cấu hình chu kỳ giao hàng / Cấu hình giao hàng theo hợp đồng / Tạo lịch xuất hàng / Lịch picking・giao hàng
**Phiên bản**: v2.3 (2026-09-23. Đã phản ánh bổ sung ngày 2026/09/24 (con tự động của sự cố) 〔quyết định v2.3 #20〜#26〕・**bổ sung ngày 2026/09/29 (rà soát lại xử lý sự cố) 〔quyết định v2.3 #27〜#33〕**・**bổ sung 4 ngày 2026/09/29 (giải quyết vấn đề tồn đọng, và trường hợp chặng 1 là giao hàng ủy thác) 〔quyết định v2.3 #34〜#51〕**)
**Tóm tắt cập nhật (v2.3・2026/10/01)**: Phản ánh đối chiếu K. ① Ngày lễ tham chiếu master ngày lễ 〈K-27・§6〉 ② Từ sau hạn chốt đến trước ngày xuất hàng 1 ngày thì sửa từng bản ghi từ nút "Chỉnh sửa" ở chi tiết dữ liệu giao hàng 〔quyết định v2.3 #63〕 — đã phản ánh vào §4A-4D・REQ-DL-817・886 và ghi chú chế độ đổi ngày 〈K-29〉.
**Tóm tắt cập nhật (v2.3・2026/09/29 bổ sung 4)**: **Bổ sung 4 ngày 2026/09/29 (giải quyết vấn đề tồn đọng, và trường hợp chặng 1 là giao hàng ủy thác) 〔quyết định v2.3 #34〜#51〕. Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Vấn_đề_chưa_giải_quyết_và_ủy_thác_đợt_1_20260929.md`. Bản chuẩn là `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §3.1・§3.2・§3.3・§3.6・§4.1・§9.1.1・§9.4・§11・§12.4・§13.1・§13.4・§13.5・§14.4〜14.7・§14.11・§15.2・§15.9・§15.15・§16.5・§19.1・§19.1.1** (nếu có khác biệt thì DEV là bản chuẩn). **Phiên bản vẫn là v2.3.** ① **Web công ty giao hàng ủy thác**: khi đã chốt (sau hạn chốt) thì hiển thị toàn bộ mục; khi còn là dự kiến thì **chỉ hiển thị đến chu kỳ tháng sau・ngày giao・tên cơ sở・nhiệt độ bảo quản・số lượng bản ghi** (không có số lượng hàng・có dấu "Dự kiến"). **Chỉ thấy và thao tác được các lượt giao có chặng do công ty mình phụ trách**. Màn hình dùng lại lịch của bộ phận vận hành〔#34・#51〕 (§4C-4・§4B-3・§8 #1 đã giải quyết). ② **Thông báo tự động về hạn sử dụng ngắn**: khi số ngày từ ngày xuất đến ngày giao ＞ `shelf_life_days` − `shelf_life_safety_days` (mặc định 2 ngày) thì tạo mục cần xác nhận `shelf_life_warning`. Việc tách lô vẫn do bộ phận vận hành quyết định〔#35〕 (§4A-5・§5.3C・REQ-DL-624・§8 #6 đã giải quyết). ③ **Vật tư**: mỗi lần chốt giỏ hàng thì tạo dữ liệu giao hàng; phần cùng cơ sở・cùng ngày giao・chưa gửi chỉ thị xuất hàng thì gộp thành 1 bản ghi. Lead time cũng là "ngày xuất = ngày giao − lead time" như các loại khác; ngày giao là ngày giao được đầu tiên từ ngày sau ngày đặt hàng trở đi mà vẫn giữ được lead time〔#36・#38〕 (§3.3・§4A-2C). ④ **Hạn của yêu cầu thay đổi** = hạn chốt đơn. 3 ngày trước hạn chốt (`change_request_warn_days`) thì tạo mục cần xác nhận `change_request_due`, không tự động từ chối〔#37〕 (§4A-3B・§5.3C). ⑤ **Hàng thay thế** `delivery_lines.substituted_from_product_id`, thanh toán theo đơn giá của hàng gốc〔#39〕 (§4A-4B・§4D-1). ⑥ `redelivery_billable` → **`freight_billable`** (cước vận chuyển khi giao lại・hủy giao)〔#40〕. ⑦ **Trả hàng**: lý do của bản sao là "trả hàng" (`duplicate_type = return`), nơi nhận trả hàng là loại kho `return`, `return_to_warehouse_id`, không tính tiền〔#41〕 (§2.3A・§4A-4B・§4A-4C・§4D-1). ⑧ **Tên hiển thị trên Web doanh nghiệp** được giữ riêng với trạng thái (Hủy〈có chuyến thay thế〉＝đang điều chỉnh ngày giao, v.v.)〔#42〕 (§4A-7・§4A-4B ①). ⑨ **Mục cần xác nhận về chưa gán tài xế chỉ còn 1 mốc là "ngày trước ngày giao"**〔#43〕 (§4A-4E・§4B-4・§5.3C). ⑩ **6 mục tạm thời được triển khai với giá trị tạm**〔#44〕 (§8). ⑪ **Thomas**: việc hủy chốt theo phương thức gửi lại, thiết kế để chỉ thay thế được lớp đầu ra, nếu không dùng được UTF-8 thì chuyển sang Shift_JIS. **Các mục chuyển cho Yamato là tạm thời**〔#45・#46〕 (§4D-3・§8 #5 đã giải quyết). ⑫ **Khi chặng 1 là giao hàng ủy thác**: phiếu vận chuyển của chuyến lấy hàng do ES đánh số (`issued_by = es_generated`・số lượt giao + số thùng 2 chữ số)〔#47〕 (§4D-2) / **việc gán dựa trên người vận chuyển của chặng** (chặng của công ty vận tải thì không gán; chặng tự giao・ủy thác thì dù là chặng 1 vẫn gán)〔#48〕 (§4B-1・§5.3B) / **thời điểm nhận hàng theo từng chặng** `delivery_legs.picked_up_at`・`picked_up_by`, "đã nhận" tính theo lần nhận đầu tiên〔#49〕 (§4A-3B・§4B-5・§4C-2) / lựa chọn công ty giao hàng・điểm trung chuyển của hợp đồng là toàn bộ〔#50〕 (§3.1B・§2.3A). ⑬ Mô hình dữ liệu: `delivery_lines.substituted_from_product_id` / `deliveries.freight_billable` (cũ `redelivery_billable`)・`return_to_warehouse_id`・`duplicate_type` thêm `return` / `warehouses.warehouse_type` thêm `return` / `delivery_tracking_numbers.issued_by` thêm `es_generated`・`box_no`・`box_total` / `delivery_legs.picked_up_at`・`picked_up_by` / `review_items.kind` thêm `shelf_life_warning`・`change_request_due` / cấu hình vận hành `shelf_life_safety_days` (2)・`change_request_warn_days` (3) (§7). Batch `plan_recheck` UPSERT 3 loại cần xác nhận (§11-1).
**Tóm tắt cập nhật (v2.3・2026/09/29 bổ sung)**: **Bổ sung ngày 2026/09/29 (rà soát lại xử lý sự cố) 〔quyết định v2.3 #27〜#33〕. Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Rà_soát_trouble_20260929.md`. Bản chuẩn là `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §9.4・§12.1・§12.2・§13.2 (13.2.1〜13.2.3)・§13.3・§14.6・§14.7・§14.11・§15.11・§15.12・§15.12.1・§16.8.1 (bãi bỏ)・§16.13・§17.1・§18** (nếu có khác biệt thì DEV là bản chuẩn). **Phiên bản vẫn là v2.3. Thay thế #22 (quá hạn thì tự động tạo con) và #25 (batch `trouble_auto_duplicate`) của bổ sung 9/24.** ① **Con tự động được quyết định tạo hay không theo từng loại ngay khi đăng ký báo cáo sự cố**: chỉ những loại mà master loại `trouble_types.auto_child` là true (giao nhầm・vắng mặt・hư hỏng) mới tạo. Chênh lệch số lượng・chậm trễ・khác thì không tạo. "Thiếu hàng・giao nhầm" từ ứng dụng được coi là chưa xác định loại (`type_code` NULL) nên không tạo, và chỉ tạo khi bộ phận vận hành gắn loại "có tạo". **Hạn (`auto_duplicate_due_at`)・cấu hình vận hành `trouble_auto_duplicate_after_minutes`・batch `trouble_auto_duplicate` bị bãi bỏ** (số batch còn 11)〔quyết định v2.3 #30〕 (§0・§4A-4C・§11-1). ② **Báo cáo sự cố chưa giải quyết vẫn nằm trong mục cần xác nhận `trouble_open` (đối tượng là lượt giao)**〔quyết định v2.3 #30・#33〕. ③ **Việc giải quyết được thực hiện gộp theo từng lượt giao**. Con tự động là **tối đa 1 bản ghi còn hiệu lực (khác `取消`/Hủy) cho mỗi lượt giao xảy ra sự cố** (`source_trouble_delivery_id`)〔quyết định v2.3 #29〕 (§4A-4B・§4A-4C). ④ **Khi con xảy ra sự cố thì không tạo bản sao từ con mà tạo số nhánh tiếp theo của cha** (nội dung sao chép từ con xảy ra sự cố. Số nhánh vượt quá 9 thì `DOMAIN_BRANCH_LIMIT` + cần xác nhận)〔quyết định v2.3 #28〕. ⑤ **Chỉ với "Đã giao" do hoàn tất ngầm định (`presumed`)**, nếu điều tra của Yamato cho thấy chưa đến nơi thì có thể chuyển sang `再配達待` (Chờ giao lại)/`中止` (Dừng) (không tính tiền. Khoản thanh toán đã chốt sẽ điều chỉnh vào tháng sau)〔quyết định v2.3 #27〕. ⑥ Thêm vào cách giải quyết **"Giao một phần (phần còn lại không gửi)" `partial_no_resend`** (không có con・không có ngưỡng・bắt buộc nhập lý do)〔quyết định v2.3 #31〕. ⑦ **Khi lượt giao chỉ bị chậm trễ nhận được báo cáo giao toàn bộ số lượng, hệ thống tự động giải quyết bằng "giao toàn bộ"**〔quyết định v2.3 #32〕 (§4B-6). ⑧ Mô hình dữ liệu: `trouble_types` (mới・`auto_child`) / `trouble_app_reasons` (mới) / `trouble_reports.type_code` cho phép NULL・`resolution` thêm `partial_no_resend`・xóa `auto_duplicate_due_at` / `deliveries.creation_source` đổi `trouble_timeout` → `trouble_auto`・thêm `source_trouble_delivery_id` và đổi ràng buộc duy nhất (bãi bỏ `UNIQUE(source_trouble_report_id)`) / `review_items.kind` thêm `trouble_open`〔quyết định v2.3 #33〕 (§7).
**Tóm tắt cập nhật (v2.3・2026/09/24 bổ sung)**: **Bổ sung ngày 2026/09/24 (con tự động của sự cố) 〔quyết định v2.3 #20〜#26〕. Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Trouble_con_tự_động_20260924.md`. Bản chuẩn là `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §9.4・§10.2・§12.1・§12.2・§13.2.1・§13.3・§13.4・§14.6・§14.7・§14.11・§15.11・§15.12・§16.8.1・§16.9・§16.10・§16.13・§17.1・§18** (nếu có khác biệt thì DEV là bản chuẩn). **Phiên bản vẫn là v2.3.** ① **Báo cáo sự cố không làm thay đổi trạng thái của cha**. Cha giữ nguyên `出荷済` (Đã xuất)/`受取済` (Đã nhận); liên hệ sau khi giao (khiếu nại) giữ nguyên `納品済` (Đã giao), ghi lại báo cáo sự cố và mở mục cần xác nhận. `確認中` (Đang xác nhận) trong luồng sự cố **chỉ do con chưa xuất hàng (`shipped_date IS NULL`)・ứng viên phục hồi sử dụng** (§0・§1・§4A-3B). ② **Bộ phận vận hành (logistics) giải quyết trực tiếp cho cha**: `納品済` / `一部納品済` (Đã giao một phần) + con (số lượng còn lại) / `再配達待` + con (toàn bộ) / `受取済` (quay lại trong ngày) / `中止`. Con tự động nếu có thì tái sử dụng; với cách giải quyết không cần gửi lại thì con tự động được chuyển sang `取消` trong cùng transaction (§4A-4B). ③ ~~**Sự cố chưa được giải quyết đến hạn thì tạo 1 con tự động**~~ (**được thay thế bởi bổ sung 2026/09/29**: tạo cùng lúc đăng ký báo cáo, theo từng loại〔quyết định v2.3 #30〕): nếu quá `auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes` (cấu hình vận hành・bắt buộc) mà vẫn chưa giải quyết thì batch `trouble_auto_duplicate` tạo con có `確認中`・`duplicate_type = trouble_pending`・`creation_source = trouble_timeout`・`schedule_confirmed = false`・`quantity_confirmed = false` (§4A-4C). ④ **Con tự động trước khi chốt nằm ngoài đối tượng của chỉ thị xuất hàng・phiếu vận chuyển・gán tài xế・thanh toán・thông báo・hoàn tất ngầm định**. `確認中 → 出荷待` (Chờ xuất) chỉ khi cả hai cờ đều true (§4A-4C・§4B・§4D). ⑤ `delivery_presume_complete` có `status = 出荷済`, `delivery_detect_missing` có `status IN (出荷済, 受取済)`, và cả hai **chỉ lấy những bản ghi không có báo cáo sự cố chưa giải quyết**. (Cũ: `trouble_auto_duplicate` chạy trước hai batch đó. Bãi bỏ ngày 2026/09/29〔quyết định v2.3 #30〕) (§11-1). ⑥ Mô hình dữ liệu: `deliveries.duplicate_type`・`creation_source`・`source_trouble_report_id` (UNIQUE. Ngày 2026/09/29 đổi sang duy nhất theo `source_trouble_delivery_id`〔quyết định v2.3 #29〕)・`schedule_confirmed`・`quantity_confirmed`, `trouble_reports.auto_duplicate_due_at` (xóa ngày 2026/09/29〔quyết định v2.3 #33〕), `review_items.kind = trouble_auto_child_pending`, lỗi `DOMAIN_TROUBLE_CHILD_EXISTS`／`DOMAIN_TROUBLE_CHILD_UNCONFIRMED` (§7). **(Cũ: 出荷済／受取済 → 確認中〈báo cáo sự cố〉, 納品済 → 確認中〈liên hệ sau khi giao〉, bộ phận vận hành giải quyết từ 確認中. Bãi bỏ ngày 2026/09/24)**
**Tóm tắt cập nhật (v2.3)**: **Phản ánh quyết định lần 4 ngày 2026/09/23. Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_v2.3_20260923.md`**. Nếu khác với lần 3 (`Quyết_định_v2.2_20260922.md`) thì lần 4 được ưu tiên. **Chỉ là chỉnh sửa mô hình dữ liệu, không thay đổi quy tắc nghiệp vụ.** ① **Bản chuẩn duy nhất của bảng・cột・ràng buộc là `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §14, §7 của tài liệu này chỉ ghi tên bảng và vai trò** (`menus` / `order_quantities` / `plan_rates` / `corporations` / `sites` chỉ có ở phía DEV). ② **Chia tuyến giao hàng thành 3 bảng**: `contract_routes` (hợp đồng cha) / `contract_month_routes` (snapshot của hợp đồng con) / `delivery_legs` (mỗi lượt giao). `delivery_routes` cũ (1 bảng dùng chung) bị bãi bỏ, **`driver_id` / `assigned_by` / `assigned_at` chỉ do `delivery_legs` giữ** (§3.1B・§4B-1・§7). ③ **Bãi bỏ `route_override`**, việc đổi tuyến "chỉ cho lượt giao này" là UPDATE trực tiếp `delivery_legs` + nhật ký kiểm toán. Lead time riêng được chuyển sang `deliveries.lead_time` (§4A-4D・§7). ④ **Gỡ `carrier1_id` / `relay_warehouse_id` / `carrier2_id` khỏi `contract_delivery_channels` / `contract_month_delivery_channels`** (§3.1B・§7). ⑤ **Bãi bỏ `shipping_plans.route_id`** (§7). ⑥ Đổi tên bảng yêu cầu thay đổi thành **`change_requests`** (§7). ⑦ **Biến "cần xác nhận" thành bảng thực `review_items`** (§4A-5・§7・§11-1). ⑧ **Đổi tên `deliveries.branch_id` → `deliveries.site_id`** (§7). ⑨ **Thêm mới chi tiết thực tế `delivery_lines`** và có thêm `deliveries.order_id` (§7). ⑩ Giá trị mặc định (ngưỡng số lượng 300 bản ghi/ngày・lead time chỉ thị xuất hàng 3 ngày) được ghi rõ ở DEV §3. REQ-DL-894〜903.
**Tóm tắt cập nhật (v2.2)**: **Phản ánh quyết định lần 3 ngày 2026/09/22. Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_v2.2_20260922.md`**. Nếu khác với lần 2 (`Quyết_định_v2.1_20260921.md`) thì lần 3 được ưu tiên. ① **Thống nhất không cho đổi ngày sau hạn chốt đơn** (trước hạn chốt＝1 bản ghi hay hàng loạt đều được / sau hạn chốt＝hủy + sao chép. `locked` không còn là mốc của việc đổi ngày, khả năng đổi chỉ được xác định bởi `delivery_cycles.order_close_date`・§4A-5・§5.0・REQ-DL-886). ② **Không tự động chèn ngày điều chỉnh** (chỉ tính và hiển thị số ngày còn thiếu. Vị trí đặt do quản trị viên quyết định và có thể sửa sau. Không đủ bội số của 7 thì không lưu được. Thêm `adjust_for_pause_id`・§2.2・REQ-DL-819/820/887). ③ **Sau chỉ thị xuất hàng vẫn đổi được công ty giao hàng ②・nhân viên giao hàng・địa chỉ nơi giao** (địa chỉ phát hành `rev` mới, chuyển phiếu vận chuyển hiện có thành `voided` và phát hành lại. Kho và ngày thì hủy + sao chép・§4D-4・REQ-DL-888〜890). ④ **Hạn gửi lại chỉ thị xuất hàng là "cho đến khi nhận kết quả xuất hàng của lượt giao đó"** (không giữ giờ bắt đầu picking của kho・§4D-3・§2.3A #28・REQ-DL-891). ⑤ **Trùng cùng Slot thì lưu được kèm thẻ cảnh báo** (phương án "lỗi" ở §12 #10 không được chấp nhận・§3.2・REQ-DL-892). ⑥ **Huy hiệu yêu cầu thay đổi chỉ đếm những mục chưa xử lý đã đến hạn** (REQ-DL-893).
**Tóm tắt cập nhật (v2.1)**: **Phản ánh quyết định lần 2 ngày 2026/09/21. Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_v2.1_20260921.md`**. Nếu khác với quyết định lần 1 (`Cần_xác_nhận_Trả_lời_20260921.md`) thì lần 2 được ưu tiên. Các thay đổi chính: ① điểm khởi đầu của `locked` = gửi thành công chỉ thị xuất hàng lần đầu, ② hoàn tất ngầm định được phán đoán ở final leg, ③ chia máy trạng thái thành 2: plan lifecycle và delivery status, ④ khóa duy nhất của kế hoạch chuyển sang phương thức `occurrence_key`, ⑤ thêm `delivery_regime` và tách khung giờ nhận hàng thành bảng con, ⑥ giới hạn các xử lý không chạy với hạn chốt tạm, ⑦ khóa tách hóa đơn, ⑧ tháng chu kỳ = tháng chứa `B7` (không có nhánh ngoại lệ), ⑨ xóa hoàn toàn vai trò `Quản lý kho`.
**Tóm tắt cập nhật (v1.70)**: **Phản ánh quyết định ngày 2026/09/21 (trả lời 84 mục cần xác nhận). Chi tiết xem `01_仕様/00_Quyết_định/Cần_xác_nhận_Trả_lời_20260921.md`**.

**Tóm tắt cập nhật (v1.63)**: **Bỏ dấu "◆Đã chốt" "◇Dự kiến" khỏi hiển thị tháng・tuần** (2026/09/21). Ngày 2026/09/18 đã quyết định "dấu trạng thái **chỉ hiển thị với trường hợp ngoại lệ** (không gắn dấu cho dữ liệu giao hàng thông thường)", nhưng chỉ ô của hiển thị tháng và tiêu đề nhóm của hiển thị tuần là lệch khỏi phương châm đó. **Ô của hiển thị tháng bỏ cả hai** (dự kiến phân biệt được bằng khung nét đứt và dòng số lượng "Dự kiến N bản ghi"). **Tiêu đề nhóm của hiển thị tuần bỏ "◆ Dữ liệu giao hàng"**, chỉ giữ "◇ Dự kiến" ngoại lệ và tên chu kỳ chỉ phần của chu kỳ khác. Tiêu đề hàng khi hiển thị ngày có lẫn nhiều chu kỳ cũng ghi kèm giai đoạn・số lượng・chế độ đổi ngày nên là thứ khác, giữ nguyên. REQ-DL-828.

**Tóm tắt cập nhật (v1.62)**: **Chia tài liệu đính kèm thành "tài liệu của địa điểm" và "tài liệu của lượt giao này"** (2026/09/21). Trong bảng tuyến giao hàng của chi tiết xuất hàng・dữ liệu giao hàng có cột "Lộ trình vào・tài liệu đính kèm", và cùng màn hình cũng có tab "Tài liệu đính kèm" nên **tên bị trùng lặp**. Thực chất là hai thứ khác nhau (cái trước là sơ đồ lộ trình vào・hướng dẫn gắn với địa điểm, cái sau là ảnh báo cáo gắn với một lượt giao), nên **nơi lưu tệp được gom về tab "Tài liệu đính kèm"**, cột trong bảng tuyến giao hàng đổi thành **"Lộ trình vào"** và **chỉ hiển thị số lượng và lối dẫn đến**. Vì địa điểm có thể gắn nhiều tệp nên liệt kê ở tab thay vì ô bảng hẹp. Đồng thời tách `delivery_attachments` trong sơ đồ ER thành 2 bảng `site_attachments` (master cơ sở・điểm trung chuyển) và `delivery_attachments` (dữ liệu giao hàng). REQ-DL-826〜827.

**Tóm tắt cập nhật (v1.61)**: **Chia việc tự động chuyển ngày và chênh lệch lead time thành 2 giai đoạn** (2026/09/21). ① Trước hết tìm ngày phù hợp với **lead time thực tế = lead time hợp đồng (chênh 0)** theo hướng "dời sớm・dời muộn". ② Chỉ khi thực sự không tìm được mới **cho phép đến +1 ngày** (hiển thị "bất đắc dĩ +1 ngày (trong phạm vi cho phép)"). ③ Nếu vẫn không phù hợp thì chọn cặp có chênh lệch nhỏ nhất và đặt **cần xác nhận**. Bản cũ ghi song song "tự hấp thụ đến +1 ngày" và "tự chuyển ngày vẫn giữ chênh 0" khiến người đọc phân vân nên đã viết lại thành thứ tự ưu tiên. Đồng thời thêm vào §4.4 **"Slot được tiếp tục lại sau thời gian tạm dừng thì không đưa về trước thời gian tạm dừng"** (chỉ với lượt mà slot bị lệch do tạm dừng, việc chuyển ngày do ngày lễ・không nhận được được tìm theo hướng dời muộn). REQ-DL-824〜825.

**Tóm tắt cập nhật (v1.60)**: **Sửa giá trị khởi tạo của tháng bắt đầu kỳ đối tượng cấu hình thành "tháng đầu tiên chưa được cấu hình"** (2026/09/21). "Tháng sau nữa" trong bản cũ chỉ là tháng đầu tiên *có thể chỉnh sửa* chứ không phải tháng đầu tiên *cần cấu hình*, nên tháng đã cấu hình vẫn nằm trong kỳ đối tượng khi lưu, theo quy tắc §2.0A thì toàn bộ `draft` bị xóa và tạo lại, thậm chí chạy cả việc neo lại các override đã phê duyệt (hết hiệu lực・đang đề xuất). Đặt giá trị khởi tạo là **tháng đầu tiên của chỗ trống nếu có chỗ trống, nếu không thì tháng ngay sau tháng cuối cùng đã cấu hình**, và giữ **tháng sau nữa không phải là giá trị khởi tạo mà là giới hạn dưới**. Đồng thời bổ sung đường dẫn khi bấm vào tháng ở dải §2.0B thì tháng bắt đầu chuyển sang tháng đó, và **hiển thị rõ ở bản xem trước trước khi lưu khi kỳ đối tượng có chứa tháng đã cấu hình**. Bỏ hướng dẫn thủ công "hãy lùi tháng bắt đầu" khỏi cảnh báo chỗ trống. REQ-DL-821〜823.
**Tóm tắt cập nhật (v1.55)**: **Tổng hợp phản ánh các xác nhận・quyết định ngày 2026/09/19**. ① **Chu kỳ chỉ có 1** (chu kỳ xuất hàng＝chu kỳ giao hàng). Không xuất được giữ trong cùng lưới `A1`〜`D7`, và đánh giá bằng **ô của chính ngày picking**. Phương án giữ "lịch + ngày trong tuần không xuất được của phần giao ở tuần B・D" không được chấp nhận (§2.3). ② **Khi chọn slot giao hàng trong hợp đồng, các ô không chọn được theo ngày không xuất được và lead time của kho trong hợp đồng đó tự động bị làm xám** (§3.2). ③ **Tạm dừng chu kỳ là "không bỏ qua ô, tiếp tục lại từ ngày sau khi kết thúc tạm dừng"**: không gán slot cho ngày tạm dừng và **không tiêu thụ ô**. Từ ngày sau khi hết tạm dừng, các ô bị dừng được tiếp tục theo thứ tự, nên **toàn bộ chu kỳ bị dời muộn đi số ngày tạm dừng** (không phải tiếp tục từ chỗ đang dở). **Số lần giao không giảm**. Đồng thời, **nếu số ngày tạm dừng không phải bội số của 7 thì thêm ngày tạm dừng điều chỉnh `7 −（số ngày tạm dừng mod 7）` ngày ngay sau tạm dừng để làm tròn theo đơn vị 7 ngày**, nên **sự tương ứng giữa ô và thứ không lệch, `A1` vẫn là thứ Hai** (§2.2 "Điều chỉnh độ lệch"・REQ-DL-819/820). Về cách dùng phân biệt với ngày lễ: nghỉ ngắn chỉ cần dời 1〜2 ngày là giao được thì coi là **ngày xử lý như ngày lễ giao hàng**, nghỉ dài liên tiếp phải dời từ 3 ngày trở lên mới giao được thì là **tạm dừng chu kỳ** (cách dùng phân biệt trong vận hành. **Không đặt giới hạn trên trong hệ thống** cho số ngày chuyển). **"Dời sớm・dời muộn" theo cấu hình của hợp đồng**. Việc xác nhận chuyển ngày được thực hiện **gộp số lượng ảnh hưởng khi đăng ký tạm dừng** (§2.2・§4.2). ④ **Bãi bỏ rolling generation**. Kế hoạch chỉ tạo cho phần kỳ do bộ phận vận hành cấu hình (tối đa 6 tháng), **nếu không cấu hình kỳ tiếp theo thì không công bố được menu** (§4A-2・§2.0C-3). ⑤ **Nếu đến hạn chốt chưa có đơn thì chốt bằng số lượng tiêu chuẩn**, và **cơ sở bật chế độ AI thì AI đặt số lượng** (§4A-2D). **Khi menu chưa đăng ký và hạn chốt chưa định thì lấy ngày 15 tháng trước làm hạn chốt tạm**. ⑥ **Chỉ thị xuất hàng được xuất gộp 2 tuần (tuần A+B / C+D), 3 ngày trước ngày bắt đầu (thứ Sáu)**. Vì có xuất bổ sung khi thay đổi khẩn cấp nên **hiển thị trên màn hình đã xuất hay chưa** (§4D-3). ⑦ ~~Phiếu vận chuyển và dữ liệu giao hàng là nhiều-nhiều~~ (**hủy ngày 2026/09/21. Đã trả về 1-nhiều**・§4D-2). ⑧ **Trung chuyển chỉ giữ "có trung chuyển / không"**. Không giữ trạng thái giữa chừng, truy vết dùng trang truy vết của từng công ty, hoàn tất là hoàn tất ngầm định, dữ liệu lấy được ở giai đoạn 3 chỉ là thông tin tham khảo (§4C-2・§4A-3B). ⑨ **Không cố định Chủ nhật là ngày không xuất được・không nhận được ở lịch vận hành** (là giá trị mặc định chứ không cố định・§5.3). ⑩ **Chu kỳ đã chốt đơn thì không hủy hợp đồng được** (ngày hủy phải là cuối chu kỳ). **Khi đang tạm dừng không tạo kế hoạch tương lai, tạo lại khi phê duyệt tiếp tục** (§4A-6). ⑪ Khi tạm dừng・hủy hợp đồng thanh toán trước cả năm, hợp đồng con đã xuất hóa đơn được hoàn tiền・bù trừ bằng **③ điều chỉnh** (§4D-1). ⑫ **Không tính hàng vật tư vào ngưỡng số lượng mỗi ngày** (vì giao thẳng bằng Yamato・§5.2). REQ-DL-804〜820.
**Tóm tắt cập nhật (v1.8)**: Đồng bộ với "Yêu cầu chi tiết・đặc tả picking・xuất hàng・giao hàng・tài xế" và "Hướng dẫn thiết kế UI màn hình quản lý giao hàng cho doanh nghiệp・cơ sở", phản ánh việc tách xuất hàng theo nhiệt độ bảo quản (lạnh/đông lạnh), tính biến đổi của master kho・tuyến giao hàng, các mục của dữ liệu giao hàng・dữ liệu liên kết bên ngoài, và điều kiện thao tác thay đổi hàng loạt. Các điểm chưa thống nhất được gom vào §9, đồng thời thêm "tùy chọn đặc tả" có thể chuyển đổi và so sánh trên UI mô phỏng (Phụ lục A-2).
**Tóm tắt cập nhật (v1.9)**: Với tiền đề hợp đồng tự động gia hạn hằng tháng, bổ sung §4A về **cấu trúc 2 tầng gồm kế hoạch giao hàng (plan) và dữ liệu giao hàng (delivery)** và thời điểm tạo. Sửa phạm vi yêu cầu thay đổi của doanh nghiệp thành "trong kỳ chu kỳ giao hàng đã tạo (tối đa 6 tháng sau)", phản ánh phương châm: giai đoạn kế hoạch chỉ hiển thị ngày, kho・công ty giao hàng xét theo phân công của hợp đồng hiện tại, ảnh hưởng đến phần đã chốt thì cảnh báo "cần xác nhận", khi tạm dừng・hủy thì xóa kế hoạch phía trước vào lúc phê duyệt.
**Tóm tắt cập nhật (v1.10)**: Quyết định 6 trong 8 điểm chưa thống nhất. Ngày đầu chu kỳ **cố định thứ Hai**, kỳ đối tượng tạo **6 tháng**, picking mỗi ngày **cảnh báo theo số lượng bản ghi**, yêu cầu của doanh nghiệp là **kỳ đã tạo trừ ngày quá khứ・tháng hiện tại**, đơn vị lưu cấu hình là **theo hợp đồng (cơ sở)**, sửa kế hoạch là **draft／published／locked**. Đồng thời bắt buộc **hiển thị lý do** của ngày không xuất được・chuyển ngày (§4.5, §5.2). Cách chỉ định riêng (§3.2) và việc tách lô theo hạn sử dụng ngắn・hạn chốt (§9-2 #5) tiếp tục xác nhận.
**Tóm tắt cập nhật (v1.11)**: Quyết định nốt 2 điểm còn lại. Chỉ định riêng **chỉ có 2 loại "ngày N hằng tháng" và "cuối tháng hằng tháng"** (không có tuần thứ N). Việc tách lô theo hạn sử dụng ngắn do **bộ phận vận hành quyết định**, hạn tiếp nhận khớp với **hạn chốt của kỳ đặt hàng**. Đồng thời bổ sung: thời điểm tạo bản chốt là **ngày chốt đơn của menu đối tượng**, cảnh báo số lượng picking theo **tab kho・ngưỡng của từng kho**, và kế hoạch (draft) cũng **mở được màn hình chi tiết** (chế độ kế hoạch).
**Tóm tắt cập nhật (v1.12)**: Chốt cách xử lý nhiều kho. Hợp đồng giữ theo đơn vị **loại giao hàng (nhiệt độ bảo quản hoặc vật tư × kho × công ty giao hàng 〈1・trung chuyển・2〉)**, **lead time theo kho**, **master kho là bản chuẩn cho điều kiện hoạt động (ô không xuất được・ngày không xuất được・ngưỡng số lượng)**, **việc đổi kho của hợp đồng áp dụng từ tháng áp dụng**, **CSV chỉ thị xuất hàng cho Thomas xuất theo kho**.
**Tóm tắt cập nhật (v1.13)**: Quyết định giá trị ban đầu của ngưỡng cảnh báo số lượng picking là **300 bản ghi/ngày** (đổi được theo từng kho) (cũ: 150 bản ghi/ngày. Ngày 2026/09/14 đổi thành 300 bản ghi/ngày, ngày 2026/09/21 đã xác nhận). Thêm đề xuất vào §10 cho tất cả các mục chưa quyết còn lại.
**Tóm tắt cập nhật (v1.14)**: Bổ sung vào §11 thiết kế batch còn thiếu của đặc tả (chạy thứ Hai・tính lũy đẳng・bất thường), lịch sử thay đổi, độ chi tiết của quyền hạn, phi chức năng, và đề xuất di chuyển dữ liệu hiện có.
**Tóm tắt cập nhật (v1.15)**: Là biện pháp đối với việc mức độ tự do cấu hình cao dễ gây lỗi, bổ sung vào §12 danh sách trắng các mục có thể ghi đè, thống nhất lối vào đổi ngày, bảng chuyển trạng thái, và những thứ không làm ở giai đoạn 2.
**Tóm tắt cập nhật (v1.16)**: Vì hợp đồng tính theo đơn vị cơ sở (nơi giao), nên làm rõ rằng **nếu nơi giao thay đổi thì kho・công ty giao hàng dùng được cũng thay đổi**. Lead time có thể đổi bằng số ở phía hợp đồng.
**Tóm tắt cập nhật (v1.17)**: **Không chấp nhận** "master mẫu giao hàng" cố định tổ hợp (vì tổ hợp thực tế không cố định được). Loại giao hàng là phương thức **chọn từ master kho・master công ty giao hàng・master trung chuyển**, và áp dụng **kiểm tra tính nhất quán (cảnh báo)** bằng nhiệt độ bảo quản tương ứng・khu vực tương ứng giữ trong master.
**Tóm tắt cập nhật (v1.18)**: Làm rõ rằng **ngày không xuất được được quản lý ở master kho**. **Màn hình chỉnh sửa** ô chu kỳ không xuất được・ngày không xuất được theo ngày・ngưỡng số lượng **đặt ở master kho**, cấu hình chu kỳ giao hàng (01) chỉ để tham chiếu. Ngày không xuất được theo ngày được giữ theo từng kho.
**Tóm tắt cập nhật (v1.42)**: **Chốt vòng đời theo tháng giao thành 5 giai đoạn** (2026/09/14). `Cấu hình lịch → Công bố menu → Bắt đầu đặt hàng → Chốt đơn → Hạn thay đổi`. Các mốc ngày được **cố định theo tháng, lấy tháng giao làm chuẩn** (công bố menu＝ngày 1 tháng trước nữa, bắt đầu đặt hàng＝ngày 1 tháng trước, chốt đơn＝ngày 20 tháng trước, hạn thay đổi＝ngày 25 tháng trước). Theo đó **sửa chế độ đổi ngày của v1.41 thành kiểm soát 5 giai đoạn + theo quyền hạn**: sau chốt đơn thì quản lý kho cố định OFF, nhưng đến hạn thay đổi thì chỉ quản trị viên vận hành có thể bật ON. Sau hạn thay đổi thì ngay cả bộ phận vận hành cũng không thao tác được từ màn hình. Chi tiết ở §5.0. **(Cũ: `Quản lý kho` trong đoạn này đã bị xóa hoàn toàn theo quyết định lần 2 ngày 2026/09/21. Vai trò chỉ còn quản trị viên vận hành, tab kho chỉ là bộ lọc dữ liệu・§11-3. Xem §5.0 để biết định nghĩa hiện hành của chế độ đổi ngày)**
**Tóm tắt cập nhật (v1.43)**: **Sửa mốc ngày từ cố định theo lịch sang theo chu kỳ** (2026/09/15・phương án A). Vì ngày đầu chu kỳ A1 luôn là thứ Hai và không trùng với ngày 1 theo lịch, nên tính mặc định công bố menu・bắt đầu đặt hàng・chốt đơn・hạn thay đổi theo **số ngày tương đối từ A1 (−8 tuần／−4 tuần／−11 ngày／−6 ngày)**, lưu ngày thực tế theo từng chu kỳ và để bộ phận vận hành ghi đè được. Đồng thời **chuyển batch từ hằng tuần sang catch-up hằng ngày** (mỗi ngày nhặt phần chưa xử lý đã qua ngày chuẩn), **1 chu kỳ＝1 hợp đồng con** (dù vắt qua tháng vẫn gắn vào hợp đồng con của tháng chu kỳ), **hợp đồng con được tạo trước theo lead time thanh toán** (thanh toán trước 2 tháng thì tạo 2 tháng trước, thanh toán trước cả 1 năm thì 12 chu kỳ), và thêm **phát hiện thiếu thanh toán**. Chi tiết ở §4A-2・§4A-2B・§11-1.
**Tóm tắt cập nhật (v1.44)**: **Bãi bỏ hạn thay đổi và gộp vào chốt đơn** (2026/09/15). Thống nhất thời điểm kết thúc tiếp nhận đổi ngày với thời điểm chốt số lượng, vòng đời thành **4 giai đoạn** (Cấu hình lịch → Công bố menu → Bắt đầu đặt hàng → Chốt đơn). Sau chốt đơn thì **dù quyền hạn nào cũng không đổi ngày được từ màn hình** (bản cũ cho phép chỉ quản trị viên vận hành đến hạn thay đổi). Đồng thời ghi rõ **hệ thống chỉ quản lý đến hạn xuất hóa đơn, hạn thanh toán số tiền được quản lý phía Bill One**. Chi tiết ở §5.0・§4D-1.
**Tóm tắt cập nhật (v1.45)**: Ghi rõ **kỳ đặt hàng tham chiếu cấu hình ở phía menu** (2026/09/15). Không tính các mốc (công bố menu・bắt đầu đặt hàng・chốt đơn) ở phía cấu hình chu kỳ giao hàng mà dùng ngày đã đặt của **menu tháng chu kỳ**. **Giá trị mặc định của bản demo là kỳ đặt hàng＝ngày 1〜ngày 15 tháng trước**. Vì chu kỳ (4 tuần) và menu (tháng theo lịch) chạy độc lập nên batch giữ phương thức "mỗi ngày nhặt phần chưa xử lý đã qua ngày chuẩn" thay vì cố định theo ngày lịch hay số ngày tương đối. Đồng thời thêm việc **dữ liệu giao hàng vật tư không tạo bằng chu kỳ tháng mà tạo vào lúc có đơn vật tư** (§4A-2C).
**Tóm tắt cập nhật (v1.46)**: Sửa thành **khi di chuyển ngày trên màn hình lịch, ngày picking và ngày giao di chuyển cùng nhau giữ nguyên lead time** (2026/09/17). Bãi bỏ đặc tả cũ "dù di chuyển ngày picking ở màn hình 04 thì không di chuyển ngày giao", di chuyển ngày giao thì ngày picking cũng di chuyển, di chuyển ngày picking thì ngày giao cũng di chuyển. Ứng viên ngày đích **cũng đánh giá ngày còn lại di chuyển cùng** và ghi kèm. **Thao tác đổi lead time để chỉ định riêng ngày picking và ngày giao chỉ có ở "Chỉ định ngày riêng" trong chi tiết dữ liệu giao hàng (màn hình 06)** (§4A-4D mới). Ghi rõ rằng việc dời sớm tự động do ngày không xuất được ở §4A-5B không phải "chỉ định riêng" mà lead time được xử lý theo giá trị của hợp đồng. Thêm yêu cầu REQ-DL-749・750.
**Tóm tắt cập nhật (v1.47)**: **Thống nhất hệ thống trạng thái thành 3 trục (trạng thái／yêu cầu thay đổi／trung chuyển)** (quyết định 2026/09/18・§4A-3B). Thống nhất đuôi từ thành "chờ/đang/đã", đổi cũ "chuẩn bị xuất→Chờ xuất", "nhận hàng→Đã nhận", "hoàn tất giao→Đã giao", "sự cố→Đang xác nhận", và thêm **đã giao một phần・chờ giao lại・dừng・hủy** vào trạng thái. **Tách yêu cầu thay đổi (có thể thay đổi／đang yêu cầu／đang đề xuất／đã điều chỉnh／không thể thay đổi) khỏi trạng thái** và gắn cho cả kế hoạch giao hàng và dữ liệu giao hàng. **Trung chuyển không lưu mà suy ra từ trạng thái**. **Kế hoạch giao hàng (draft) không có trạng thái**, và ở màn hình chi tiết chế độ kế hoạch thì ô trạng thái là "—", chỉ hiển thị yêu cầu thay đổi・chưa định ngày・tạm dừng chu kỳ (§4A-7).
**Tóm tắt cập nhật (v1.48)**: **Thống nhất công bố menu và bắt đầu đặt hàng vào cùng một ngày (ngày 1 tháng trước)** (xác nhận 2026/09/18). Vòng đời thành **3 giai đoạn** (cấu hình lịch＝đang đăng ký menu → công bố menu・bắt đầu đặt hàng → chốt đơn), giai đoạn "công bố menu đến trước khi bắt đầu đặt hàng" không còn. Đồng thời ghi rõ **tháng bắt đầu kỳ đối tượng cấu hình＝tháng sau nữa** (không đưa tháng hiện tại・tháng sau vào lựa chọn), **giá trị khởi tạo của ngày đầu chu kỳ giao hàng (A1 đầu tiên)＝tiếp nối chu kỳ trước** (ngày sau D7 của chu kỳ ngay trước・có thể đổi tay / độ lệch cảnh báo bằng số ngày chênh), **ô ngày tạm dừng hiển thị "ô vốn có"** (vì ô là tuần × thứ nên số không lệch do tạm dừng). Thêm quy tắc chung của màn hình (ký hiệu ngày・cỡ chữ・thao tác bàn phím・thông báo) vào §12-9.
**Tóm tắt cập nhật (v1.49)**: **Sửa cách giữ các yêu cầu thay đổi đã phê duyệt** (2026/09/18). Chia yêu cầu từ doanh nghiệp thành **"ràng buộc nhận hàng của cơ sở" và "điều chỉnh chỉ cho lượt này"**, ngày không nhận được được giữ là **ngày không nhận được** ở §3.1C nên dù tạo lại cấu hình chu kỳ vẫn tự động tránh. Phần điều chỉnh còn lại bỏ cờ `pinned` của kế hoạch và đổi sang **override đã phê duyệt** giữ ngoài kế hoạch (ngày tuyệt đối・áp dụng lại mỗi lần tạo lại) (§4A-4). Đồng thời định nghĩa **đã điều chỉnh là dấu "không di chuyển bằng tính lại tự động" chứ không phải bảo đảm thực hiện**, thêm 7 mục kiểm tra trước phê duyệt và snapshot căn cứ (§3.4), **kiểm tra lại hằng ngày** override đang áp dụng và thỏa thuận lại bằng **đã điều chỉnh → đang đề xuất** (§4A-4E), và diễn giải việc neo lại vào bản xem trước trước khi lưu (§4A-5B). REQ-DL-767〜776.
**Tóm tắt cập nhật (v1.50)**: **Phản ánh nội dung demo vào đặc tả** (2026/09/18). Thêm **05B Quản lý xuất hàng・giao hàng (danh sách)** vào danh sách màn hình, định nghĩa ở §5.3B đối tượng hiển thị (chỉ dữ liệu giao hàng・kế hoạch thể hiện bằng số lượng và liên kết), chuyển đổi cột mặc định và cột tuyến, cơ sở của kỳ (ngày xuất／ngày giao), phân trang. **Thống nhất điều kiện tìm kiếm giữa lịch và danh sách** (§5.3), và thêm **tình trạng gán (đã gán／chưa gán)** làm điều kiện độc lập. Sắp xếp giá trị master thành **khóa học＝Light/Standard, mẫu giao hàng＝Chu kỳ/Special, phương thức giao hàng＝Xe giao ES/Xe COOL (giá trị suy ra từ việc có trung chuyển hay không)**. **Bãi bỏ lịch sử thay đổi toàn màn hình khỏi màn hình lịch**, lịch sử thay đổi chỉ xem ở tab của chi tiết dữ liệu giao hàng (§12-9 quy tắc 10-2). Sửa giá trị mặc định ô không xuất được thành **A6・A7／B4〜B7／C6・C7／D4〜D7** (§2.3). REQ-DL-782〜786.
**Tóm tắt cập nhật (v1.54)**: **Không hiển thị tháng ngoài kỳ đối tượng cấu hình trên lịch cấu hình chu kỳ giao hàng** (2026/09/18・§2.0C-2). Bỏ việc xếp các tháng không thể chỉnh sửa (tháng hiện tại đang vận hành giao hàng・tháng đã công bố menu) kèm ổ khóa, chỉ hiển thị tháng bắt đầu〜tháng kết thúc. Vì khi các tháng không chọn được xếp ra thì không đọc được phạm vi có thể cấu hình. REQ-DL-803.

**Tóm tắt cập nhật (v1.53)**: **Đổi tên giá trị "Đã cố định" của trục yêu cầu thay đổi thành "Đã điều chỉnh"** (2026/09/18). Vì cách nói "cố định" bị lẫn với "cố định ON／cố định OFF" của chế độ đổi ngày hay ấn tượng "không thể động vào nữa". Thứ tự giá trị là có thể thay đổi → đang yêu cầu → đang đề xuất → **đã điều chỉnh** → không thể thay đổi. Đồng thời quyết định **không hiển thị dấu đã điều chỉnh ở hiển thị tháng** (§5.3C). Hiển thị tháng là màn hình xem số lượng nên không đọc được hoàn cảnh từng bản ghi. **Hiển thị tuần・ngày・danh sách・chi tiết dữ liệu giao hàng thì hiển thị**. REQ-DL-802.

**Tóm tắt cập nhật (v1.52)**: **Bản sao tạo khi giao từng phần・giao lại được tạo ở trạng thái "Đang xác nhận"** (quyết định 2026/09/18・§4A-4C). Phần đã giao được thì chốt trước làm kết quả thực tế ở bản ghi gốc (đã giao một phần／chờ giao lại), **bản ghi con của số lượng còn lại・phần giao lại được tạo ở trạng thái Đang xác nhận kèm ngày giao tạm rồi đưa vào cần xác nhận**. Chỉ khi bộ phận vận hành chọn một trong "chốt theo ngày này", "đổi ngày", "dừng" thì mới thành chờ xuất. Để ngăn việc ngày tạm đi thẳng sang chỉ thị xuất hàng (tự động vào ngày trước ngày picking). REQ-DL-799〜801.

**Tóm tắt cập nhật (v1.51)**: **Sửa 6 điểm + 1 điểm tìm thấy khi rà soát sơ đồ luồng nghiệp vụ** (2026/09/18). ① Lấy **lead time thực tế − lead time hợp đồng ≦ 1 ngày** làm giới hạn trên, nếu vượt thì bỏ "chỉ dời sớm ngày picking" và **di chuyển ngày giao**. Nếu thực sự không phù hợp thì chọn cặp có chênh lệch nhỏ nhất, **hiển thị số ngày chênh** và đưa vào **cần xác nhận** (§4.4・§4.5). ② **Không để lại ngày không picking được**. ③ Đổi cách diễn đạt giải thích về ngày không nhận được thành "không làm yêu cầu từng lần／đăng ký như ngày nghỉ của cơ sở" (§3.4). ④ **Thêm "ngày trước ngày bắt đầu đặt hàng" làm giới hạn dưới vào ngày chuẩn tạo hợp đồng con**. Giải quyết mâu thuẫn khi thanh toán tháng hiện tại thì dữ liệu giao hàng tạo trước (§4A-2B). ⑤ **Câu chữ của đã điều chỉnh** từ dạng phủ định thành "ngày do bộ phận vận hành quyết định. Khi cần di chuyển thì liên hệ để quyết định lại" (§3.4). ⑥ **Bãi bỏ cách nói "chuyến ủy thác"**, chia thành 3 trục loại chuyến／thể chế giao hàng／tuyến (chuyến tự giao→tự giao hàng, chuyến ủy thác→chuyến công ty vận tải) (§4C). Đồng thời ghi rõ sự khác biệt giữa "viết lại ngày" và "tạo bản ghi khác bằng sao chép" (§4A-3B). Ngoài ra **khi chọn slot ở hợp đồng thì hiển thị số lượng và ngưỡng của ô** (§3.2). Vì đỉnh số lượng được quyết định bằng tích lũy hợp đồng và phía lịch không san phẳng được. Hơn nữa **sửa toàn diện §4A-6 thành ma trận ảnh hưởng**: đơn đăng ký liên quan hợp đồng được xử lý theo cùng chu kỳ với kỳ đặt hàng (trong kỳ đặt hàng thì phản ánh từ tháng sau, sau chốt thì từ tháng sau nữa), tổng hợp vào một bảng tác động của đổi địa chỉ・tăng giảm loại giao hàng・tạm dừng・hủy・tiếp tục lên kế hoạch／dữ liệu giao hàng／hợp đồng con. Nhờ quy tắc tháng áp dụng này, **việc chỉ thị xuất hàng đã xuất nằm trong đối tượng thay đổi hợp đồng không xảy ra về mặt cấu trúc**. REQ-DL-787〜797.

**Tóm tắt cập nhật (v1.41)**: **Thêm "chế độ đổi ngày" vào màn hình lịch giao hàng・màn hình lịch picking** (quyết định 2026/09/14). Chuyển đổi việc có thể di chuyển ngày trên màn hình hay không theo **trạng thái chu kỳ (trước khi tạo dữ liệu giao hàng／sau khi tạo〜trước chốt đơn／sau chốt đơn)**. Trước khi tạo là **cố định ON** (vì là giai đoạn kế hoạch nên di chuyển tự do. Không có ý nghĩa khi OFF), sau khi tạo〜trước chốt là **ban đầu OFF・bật/tắt được** (ngăn thao tác nhầm), sau chốt là **cố định OFF** (vì số lượng đã chốt và tiến sang chỉ thị xuất hàng nên thay đổi xử lý bằng yêu cầu thay đổi). Chi tiết ở §5.0. Đồng thời nêu rõ **việc tạo dữ liệu giao hàng diễn ra trước chốt đơn** (khoảng ngày 1 tháng trước tháng giao).

**Tóm tắt cập nhật (v1.40)**: **Quyết định bãi bỏ "bộ" ô không xuất được** và chỉ giữ **một ô không xuất được cho mỗi kho** (2026/09/14). Bộ là bó có kỳ hạn để tránh vấn đề "vì ô là slot chu kỳ (A1〜D7) nên không ghi được 'từ khi nào' và thay đổi kéo cả kế hoạch quá khứ theo", nhưng do ① kỳ đối tượng cấu hình tối đa 6 tháng và cấu hình lại theo từng kỳ, ② **tháng đã vào vận hành là đã chốt (không chỉnh sửa được)**, nên về cơ bản không còn xảy ra việc kéo theo quá khứ. Trường hợp còn lại "ngày trong tuần hoạt động thay đổi giữa kỳ" thì xử lý bằng **thay đổi ở kỳ đối tượng cấu hình tiếp theo** hoặc **ngày không xuất được theo ngày** (cùng mục với kiểm kê). Dải bộ・nút chuyển・nút thêm biến mất khỏi màn hình, chỉ còn **ô chọn A1〜D7**. `non_picking_slot_sets` trong mô hình dữ liệu bị bãi bỏ.

**Tóm tắt cập nhật (v1.39)**: **Quyết định bãi bỏ "phiên bản cấu hình" và danh sách phiên bản cấu hình**, trả về **cấu hình chu kỳ giao hàng chỉ có một** (2026/09/14). Lý do là vì theo §2.0C đã chuyển sang cấu trúc **cấu hình theo từng tháng, chốt dần từ tháng đã vào vận hành**, nên kết quả là chỉ có một cấu hình tồn tại đồng thời. Cấu hình quá khứ còn lại theo tháng dưới dạng "đã chốt (không chỉnh sửa được)", và nội dung lúc đó truy được bằng lịch sử thay đổi. Màn hình 01 **không đặt danh sách phiên bản cấu hình mà chỉ đặt một dải xếp tình trạng cấu hình từng tháng (đã chốt／đã cấu hình／chưa cấu hình) và tình trạng công bố menu**. Đồng thời **tháng không chỉnh sửa được không hiển thị trong dropdown kỳ đối tượng cấu hình** (không để vô hiệu mà loại khỏi lựa chọn). §2.0A・§2.0B được gộp vào mục này. Trong các yêu cầu REQ-DL-690〜706, những yêu cầu tiền đề là phiên bản cấu hình được sắp xếp theo cách xử lý ở §8.

**Tóm tắt cập nhật (v1.38)**: **Quyết định kết nối cấu hình chu kỳ giao hàng với vòng đời công bố menu** (2026/09/14). ① Giá trị khởi tạo của tháng bắt đầu kỳ đối tượng cấu hình là "tháng đầu tiên có thể thay đổi cấu hình" = **tháng sau tháng đã công bố menu**. ② **Tháng hiện tại đang vận hành giao hàng・tháng đã công bố menu・tháng đã bắt đầu xử lý nhận đơn／giao hàng không chỉnh sửa được dù quyền hạn nào** và cũng không hiển thị trong lựa chọn kỳ. ③ **Trước khi công bố menu, kiểm tra xem cấu hình chu kỳ giao hàng của tháng đối tượng đã được đặt chưa**, nếu chưa đặt hoặc có lỗi tính ngày giao thì không công bố (công bố thủ công thì hộp thoại lỗi, công bố tự động thì dừng và ghi lại lý do). ④ Không chỉ khi thao tác công bố mà **cả màn hình chuẩn bị công bố và danh sách menu cũng cảnh báo trước**, và vô hiệu nút công bố. ⑤ Làm rõ **điều kiện đánh giá đã cấu hình**. Chi tiết ở §2.0C.

**Tóm tắt cập nhật (v1.37)**: **Quyết định đặt "danh sách cấu hình chu kỳ giao hàng" ở phía trên màn hình 01** (2026/09/14). Trước đây màn hình 01 chỉ có màn hình cấu hình, **không biết tháng nào đã được cấu hình nên không nhận ra sót cấu hình (khoảng trống) và trùng lặp**. Danh sách hiển thị dải bao phủ theo từng tháng (đang áp dụng／bản nháp／đã kết thúc／chưa cấu hình／trùng) và danh sách phiên bản cấu hình, nếu có chưa cấu hình・trùng thì hiện cảnh báo đỏ. **Tháng bắt đầu** của phiên bản cấu hình **chọn được bằng tay**, **khi lưu (tạo) thì kiểm tra trùng và khoảng trống rồi báo lỗi** (không tự động cố định). Đồng thời làm rõ quy tắc cấu hình lại (đang áp dụng thì phản ánh phần chênh lệch・không đổi được kỳ áp dụng・phiên bản đã kết thúc chỉ đọc), phát hiện kỳ chưa cấu hình, và chống trùng dữ liệu kế hoạch (khóa duy nhất và tạo thay thế). Chi tiết ở §2.0A・§2.0B.

**Tóm tắt cập nhật (v1.36)**: **Quyết định giữ cấu hình lịch theo đơn vị kỳ gọi là "phiên bản cấu hình"** (2026/09/14). Trước đây A1 đầu tiên・kỳ đối tượng tạo・tạm dừng chu kỳ・ngày xử lý như ngày lễ giao hàng・ô không xuất được và ngày không xuất được theo kho đều giữ kỳ riêng (hoặc không giữ kỳ), nên "từ khi nào" của từng cấu hình rời rạc. Sửa lại, tạo **"phiên bản cấu hình" gói toàn bộ cấu hình lịch trong một kỳ áp dụng** và đưa tất cả các mục trên vào trong phiên bản đó. Phiên bản có 3 trạng thái **bản nháp → đang áp dụng → đã kết thúc**, đồng thời chỉ có một phiên bản "đang áp dụng". Phiên bản quá khứ giữ ở chế độ chỉ đọc, làm căn cứ của kế hoạch đã tạo. Thao tác cơ bản cho kỳ tiếp theo là **sao chép phiên bản trước để tạo bản nháp**. Chi tiết ở §2.0A.

**Tóm tắt cập nhật (v1.35)**: **Đưa ô không xuất được và ngày không xuất được theo ngày từ master kho trở lại cấu hình chu kỳ giao hàng (màn hình 01)** (quyết định 2026/09/14. Sửa việc "quản lý ở master kho" ngày 9/13). Lý do là ô không phải ngày mà là **slot chu kỳ (A1〜D7)**, nếu không có lịch thì không kiểm tra được kết quả cấu hình. Tiền đề khác là kho không có màn hình trong hệ thống nên bộ phận vận hành đăng ký, và kho picking chỉ có 2 cơ sở nên tab kho là đủ. Cách phân chia là **"những gì liên quan đến lịch・ngày thì ở cấu hình chu kỳ, thuộc tính của chính kho thì ở master kho"**. Ngưỡng số lượng・lead time chỉ thị xuất hàng・liên kết vẫn để ở master kho (vì là giá trị năng lực của kho). Đồng thời **ô không xuất được có kỳ áp dụng (bắt đầu・kết thúc) theo đơn vị bộ**, và ngày không xuất được theo ngày có thể đăng ký theo **kỳ từ ngày bắt đầu đến ngày kết thúc**. Khi lưu màn hình 01 thì hiển thị **bản xem trước số lượng ảnh hưởng** (tự động dời sớm／cần xác nhận／đã chỉ thị xuất hàng nên không đổi được).
**Tóm tắt cập nhật (v1.34)**: Quyết định master kho **không giữ "nhiệt độ bảo quản tương ứng"** (2026/09/14). Vì **suy ra được từ kho xử lý của sản phẩm (§2.3C)**, giữ hai chỗ sẽ mâu thuẫn. Kiểm tra tính nhất quán của loại giao hàng trong hợp đồng được đánh giá bằng "**kho đó có xử lý từ 1 sản phẩm trở lên thuộc nhiệt độ bảo quản đó hay không**", nếu bằng 0 thì cảnh báo "hãy cấu hình kho xử lý của sản phẩm trước". Nhờ đó số mục từ 31→30, và **mục bắt buộc chỉ riêng kho picking chỉ còn "mã kho"**.
**Tóm tắt cập nhật (v1.33)**: Chốt trạng thái master kho là 3 giá trị **hiệu lực／vô hiệu／đã xóa** (không có đăng ký tạm, văn phòng chưa dùng thì đăng ký là "vô hiệu") (**không xóa vật lý**. Chỉ xóa được khi số kế hoạch・dữ liệu giao hàng tham chiếu là 0). Đăng ký mới chỉ bằng **một nút "＋ Thêm kho"**, sau khi nhấn thì **chọn loại kho trước** rồi mới hiện biểu mẫu (**mặc định là "điểm trung chuyển"**. Vì đăng ký văn phòng nhiều hơn). **Loại kho không đổi được sau khi đăng ký** (vì tiền tố ID do loại quyết định).
**Tóm tắt cập nhật (v1.32)**: Quyết định cách đánh số ID kho. **Chia tiền tố theo loại kho** (kho picking＝`WH00001`, điểm trung chuyển＝`HU00001`). Để dùng nguyên ID điểm trung chuyển hiện có, nhìn ID là biết loại. `HU` là tiền tố của hệ thống hiện có. **【Tạm thời】`HU` ＝ Hub (điểm trung chuyển)** (2026/09/21). **Chỉ dùng cho ID nội bộ, không dùng cho phiếu vận chuyển・liên kết CSV・biểu mẫu.** Ý nghĩa chính xác ở hệ thống hiện có và việc có dùng trong liên kết bên ngoài hay không đang chờ bộ phận vận hành xác nhận.
**Tóm tắt cập nhật (v1.31)**: Phản ánh kết quả xác nhận về nhiều kho. **Kho picking có 2 cơ sở Kanto・Kansai** (sau này có thể tăng), **điểm trung chuyển khoảng 300 nơi** (văn phòng của Yamato. Sau này cả Sagawa). ① **Master kho không giữ lead time** (quản lý ở loại giao hàng của hợp đồng). Cũng xóa khu vực・ngày dự kiến đóng cửa, **trạng thái đổi thành hiệu lực／vô hiệu**. ② Thêm **nhiệt độ bảo quản tương ứng** (mỗi kho xử lý nhiệt độ bảo quản khác nhau). ③ Đổi mặc định **ngưỡng số lượng thành 300 bản ghi／ngày**. ④ **Người phụ trách đều tùy chọn**. ⑤ Vì điểm trung chuyển nhiều nên đặt thành yêu cầu **tìm kiếm・lọc・phân trang・nhập hàng loạt CSV** cho danh sách. ⑥ Thêm mới **§2.3C Quan hệ giữa sản phẩm và kho** (sản phẩm × kho là nhiều-nhiều. Vì đơn giá・mô tả khác nhau thì đăng ký là sản phẩm khác nên không giữ thuộc tính thay đổi theo kho). ⑦ **Bỏ màn hình・quyền hạn dành cho kho** (vì kho không có màn hình trong hệ thống nên việc đăng ký ngày không xuất được cũng do bộ phận vận hành). ⑧ **Di chuyển giữa các kho (chuyển ngang) không làm ở giai đoạn 2** (hấp thụ bằng điều chỉnh tồn kho). ⑨ **Số lượng còn lại tạo dữ liệu giao hàng và gửi với nơi giao＝trụ sở**. ⑩ Khi xuất từ kho khác do xử lý hàng lỗi thì **coi là hàng thay thế**.
**Tóm tắt cập nhật (v1.30)**: Viết lại §2.3A thành **danh sách mục (tổng 34 mục)**, nêu rõ trong bảng hình thức nhập và bắt buộc・tùy chọn・không giữ của từng mục đối với picking／trung chuyển. Thêm **§2.3B "Khác biệt giữa kho và trung chuyển"** đối chiếu bản chất・mục chung・mục riêng・lead time・điều kiện hoạt động・phiếu vận chuyển・trạng thái giữa chừng・chỉ thị xuất hàng・cách được hợp đồng chọn. Cũng ghi chú về **chuyển đổi mục bắt buộc** khi đổi loại kho sau này.
**Tóm tắt cập nhật (v1.29)**: Xác nhận **màn hình・mục của master điểm trung chuyển hiện có**, chốt mục của master kho phù hợp thực tế (§2.3A). **Tên vẫn là "master kho"** (vì "cơ sở" đang dùng cho nơi giao của hợp đồng nên dễ nhầm). Gom kho picking và điểm trung chuyển vào một master bằng **loại kho**, thông tin cơ bản・người phụ trách là chung, **điều kiện hoạt động／lead time theo khu vực／liên kết chỉ hiển thị khi là kho picking**. **Tách ô mã văn phòng** (điểm trung chuyển＝mã văn phòng của công ty giao hàng 〈hiện trên phiếu vận chuyển〉, kho picking＝mã kho của công ty dùng cho liên kết Thomas). Điểm trung chuyển **giữ loại vận chuyển (công ty giao hàng vận hành), không giữ lead time, không phát hành lại phiếu vận chuyển**.
**Tóm tắt cập nhật (v1.28)**: Quyết định 10 điểm trong số các lỗ hổng đã liệt kê. Thêm mới **§4C "Loại chuyến và thông tin lấy được"** (tách tự giao hàng／chuyến công ty vận tải, **hoàn tất ngầm định** của chuyến công ty vận tải, không giữ trạng thái giữa chừng của trung chuyển, nhiệt độ thường＝giống lạnh, vật tư giao thẳng bằng Yamato và ngoài đối tượng ứng dụng) và **§4D "Kết nối với thanh toán・phiếu vận chuyển・chỉ thị xuất hàng"** (thanh toán theo **tháng theo lịch của ngày giao**・**dựa trên kết quả giao hàng**, giao lại phán đoán riêng từng trường hợp, phiếu vận chuyển không đánh số ở ES và 1 lượt giao＝N phiếu vận chuyển, chỉ thị xuất hàng cho Thomas **không có hủy mà ghi đè bằng gửi lại số lượng 0**). Đồng thời thống nhất loại sự cố thành master 6 phân loại, thống nhất thuật ngữ thành **"giao một phần"**, bổ sung vào §4B-7 giao tiếp của ứng dụng (khóa lũy đẳng・gửi lại khi chưa gửi được・gửi ảnh riêng) và phạm vi tham chiếu・thời hạn lưu giữ, và ghi rõ ở §12-7 rằng **không làm quản lý thu hồi túi giữ lạnh・chất giữ lạnh ở giai đoạn 2**. Yêu cầu là REQ-DL-653〜662 (đề xuất).
**Tóm tắt cập nhật (v1.27)**: Vì màn hình của ứng dụng tài xế (trình duyệt Web・V1.0) đã được chốt nên **tiếp nhận cấu trúc màn hình của ứng dụng vào §4B-5**, thêm mới **§4B-6 "Bộ phận vận hành quản lý phía tài xế"**. Lập bảng tương ứng bộ phận vận hành xem gì và sửa gì đối với từng màn hình của ứng dụng, đặt ra 3 phương châm: ① **gom tất cả vào "cần xác nhận"** các trường hợp chưa nhận・chưa giao một phần・chênh lệch số lượng・sự cố, ② **thống nhất vào bản sao của ⑦ (số nhánh `DL-…-1`)** việc "tự động tạo thẻ phần chưa giao" của chuyến COOL, ③ cho phép lần theo bằng chứng thu tiền・ảnh・báo cáo hủy tồn kho từ chi tiết dữ liệu giao hàng (06). Yêu cầu là REQ-DL-641〜652 (đề xuất).
**Tóm tắt cập nhật (v1.26)**: **Sắp xếp lại §1 thành luồng 7 giai đoạn "master → cấu hình → hợp đồng → thay đổi・yêu cầu thay đổi・khóa → cấu hình tài xế → xác nhận sự cố → sao chép"**. Liệt kê theo từng giai đoạn người phụ trách・màn hình・điều được quyết định・thứ truyền sang bước tiếp・rào chắn (điều không được làm), và ghi rõ sự tương ứng giữa giai đoạn và trạng thái (`draft`／`published`／`locked`) và quy tắc để không chảy ngược. Đồng thời thêm mới **§4B "Cấu hình・gán tài xế và ứng dụng tài xế"** (đơn vị gán・quyền thay đổi・hạn chốt・cần xác nhận khi chưa gán・nhận／giao／báo cáo sự cố ở ứng dụng).
**Tóm tắt cập nhật (v1.25)**: **Không giữ kho thay thế** (quyết định 2026/09/13・sửa REQ-DL-629). Khi kho được gán không xuất được thì không chuyển sang kho khác mà đưa vào "cần xác nhận" để bộ phận vận hành phán đoán riêng. Đồng thời sửa lỗi ngày trong ví dụ dòng thời gian ở §4A-3 (ngày giao 8/20・lead time 2 ngày thì ngày picking là 8/18, chỉ thị xuất hàng là 8/17).
**Tóm tắt cập nhật (v1.24)**: Định nghĩa **sao chép** dữ liệu giao hàng là thao tác cơ bản. Giao lại・giao từng phần・chuyến thay thế đều xử lý bằng một thao tác "không viết lại bản gốc mà sao chép và gắn số nhánh" (§4A-4C).
**Tóm tắt cập nhật (v1.23)**: Thêm §4A-4B về cách xử lý khi không giao được sau `locked` và khi xảy ra sự cố. **Không viết lại kế hoạch, xử lý bằng hủy hoặc giao lại (số nhánh)**.
**Tóm tắt cập nhật (v1.22)**: Làm rõ điều kiện trở thành `locked`. **Không theo đơn vị tháng mà theo từng bản ghi dữ liệu giao hàng**, trở thành `locked` vào lúc xuất chỉ thị xuất hàng (**cũ: quyết định lần 2 ngày 2026/09/21 đổi thành "lúc chỉ thị xuất hàng được gửi thành công lần đầu". Dù có số phiếu vận chuyển cũng không `locked`**・§4A-3). Chỉ thị xuất hàng được xuất **gộp 2 tuần (tuần A＋B／C＋D), 3 ngày trước ngày bắt đầu của 2 tuần đó (thứ Sáu)** (lead time chỉ thị xuất hàng của master kho, **mặc định 3 ngày**). Sửa 2026/09/19・xác nhận 2026/09/21 (cũ: N ngày trước ngày picking・mặc định 1 ngày).
**Tóm tắt cập nhật (v1.21)**: Thống nhất "Cycle" dùng để hiển thị thành "chu kỳ" (chu kỳ giao hàng／tạm dừng chu kỳ／chu kỳ đối tượng／mỗi chu kỳ). Định danh như tên bảng・tên cột giữ nguyên chữ Latin như trước.
**Tóm tắt cập nhật (v1.20)**: Thống nhất thuật ngữ. "Không picking được" "Xuất NG" "P không được" đều được thống nhất thành **"không xuất được"** (ô là "ô không xuất được", ngày là "ngày không xuất được"). "Ngày picking" "kho picking" "lịch picking" chỉ chính công việc nên giữ như trước.
**Tóm tắt cập nhật (v1.19)**: **Đổi định nghĩa slot thành "tuần (A〜D) × thứ (1=Thứ Hai〜7=Chủ Nhật)"**. Trước đây là "28 ngày liên tiếp trừ ngày tạm dừng" nên nếu tạm dừng không phải bội số của 7 thì sự tương ứng giữa slot và thứ bị lệch, gây lỗi ô không xuất được của kho (cấu hình với ý định là cuối tuần) rơi vào ngày thường. Đồng thời **tạm dừng chu kỳ cơ bản theo đơn vị tuần (bắt đầu thứ Hai・đơn vị 7 ngày)** và chỉ tuần tạm dừng trọn vẹn mới không tiêu thụ chu kỳ.
**Sản phẩm liên quan**: `picking_schedule_setting_demo_ja.html` (UI mô phỏng hoạt động được. Mọi hành vi của tài liệu này đều xác nhận được trên mô phỏng này)
**Tài liệu liên quan**: `ピッキング出荷配送ドライバー_詳細要件仕様.md` (thông tin gốc của ID yêu cầu REQ-DL-xxx)／`配送管理_UIデザイン_prompt.md`・`delivery_calendar_demo_ja.html` (UI lịch giao hàng dành cho doanh nghiệp・cơ sở)

---

## 0. Định nghĩa thuật ngữ

Đây là điểm dễ gây hiểu nhầm nhất trong đặc tả này nên chốt ngay từ đầu.

| Thuật ngữ | Định nghĩa |
|---|---|
| **Chu kỳ giao hàng** | Lịch trình dùng chung toàn công ty với 28 ngày là một vòng. 4 tuần (A/B/C/D) × 7 ngày = 28 slot (`A1`〜`D7`). Cấu thành bởi **tuần × thứ**, A1 luôn là thứ Hai, A6 luôn là thứ Bảy. |
| **Slot giao hàng** | Mã định danh chỉ một ngày trong chu kỳ. 28 ô (`A1`〜`D7`) tiến theo thứ tự từ A1 đầu tiên. **Luôn khớp với "tuần (A〜D) × thứ (1=Thứ Hai … 7=Chủ Nhật)"** (`A1`＝thứ Hai, `A6`＝thứ Bảy). Khi có tạm dừng chu kỳ thì ô bị lùi muộn đi số ngày tạm dừng, nhưng **tạm dừng luôn được làm tròn thành bội số của 7** nên sự tương ứng giữa ô và thứ không lệch (§2.2). **Slot quyết định "ngày giao" chứ không phải ngày picking**. |
| **Ô không xuất được** | Ô mà kho không làm việc, được chỉ định trên cùng trục "tuần × thứ". **Cùng là thứ Năm nhưng tuần A hoạt động・tuần B nghỉ** — có thể thay đổi theo từng tuần (chỉ định theo thứ thì không biểu diễn được). Giữ theo từng kho. |
| **Ngày giao (ngày đến)** | Ngày hàng đến tay khách (doanh nghiệp). **Chuẩn (neo)** của mọi phép tính ngày. |
| **Ngày picking** | Ngày kho thực hiện công việc xuất kho. **Luôn được tính ngược theo "ngày giao － lead time"**. |
| **Lead time** | Số ngày từ picking đến giao hàng, đặt theo đơn vị hợp đồng. |
| **Thời gian tạm dừng chu kỳ giao hàng** | Thời gian dừng chính quá trình tiến triển của chu kỳ như nghỉ hè・nghỉ cuối năm đầu năm・kỳ nghỉ liền dài. **Vì không tiêu thụ slot nên các ô bị dừng được tiếp tục lần lượt từ ngày sau khi hết tạm dừng** (số lần giao không giảm). |
| **Ngày xử lý như ngày lễ giao hàng** | Ngày áp dụng quy tắc "không giao ngày lễ" của hợp đồng. Chỉ hợp đồng tương ứng được chuyển ngày giao, công ty có thể giao ngày lễ thì giao như thường. |
| **Ngày không xuất được** | Ngày kho không thể picking do ngày nghỉ định kỳ・kiểm kê kho・kiểm tra thiết bị, v.v. Lấy ô chu kỳ không xuất được làm quy tắc cơ bản, và có thể đặt ngoại lệ theo đơn vị ngày. |
| **Không giao ngày lễ** | Cấu hình hợp đồng theo đơn vị doanh nghiệp (khách hàng). Chỉ công ty bật ON mới chuyển ngày giao của ngày xử lý như ngày lễ giao hàng. |
| **Override theo ngày** | Cấu hình bật/tắt giá trị cơ bản của ngày xử lý như ngày lễ giao hàng hoặc không xuất được chỉ cho một ngày cụ thể. |
| **Ngày không nhận được** | Thứ・ngày lễ mà phía doanh nghiệp (khách hàng) không nhận được hàng. Là cấu hình **theo đơn vị hợp đồng**, chỉ kiểm soát ngày giao. |
| **Nhiệt độ bảo quản (loại hàng)** | Loại đông lạnh／loại lạnh／nhiệt độ thường／vật tư. Không dùng tên cũ "chuyến cool". **Đông lạnh và lạnh picking・chỉ thị xuất hàng riêng** (REQ-DL-301). |
| **Lịch xuất hàng** | Dữ liệu kế hoạch do logic tính toán của tài liệu này tạo bằng batch (ngày giao・ngày picking・số lượng). Là dữ liệu gốc của màn hình 03〜05. |
| **Loại giao hàng (kênh)** | Đơn vị giao hàng mà hợp đồng có. Là bộ **nhiệt độ bảo quản (đông lạnh／lạnh／nhiệt độ thường) hoặc vật tư × kho × công ty giao hàng (1・trung chuyển・2)**. Kế hoạch giao hàng・dữ liệu giao hàng được tạo theo đơn vị này. |
| **Kế hoạch giao hàng (plan)** | Bản ghi kế hoạch tạo từ cấu hình chu kỳ giao hàng × cấu hình giao hàng theo hợp đồng. Giữ gộp phần của kỳ đã cấu hình và được tính lại khi thay đổi cấu hình. Cũng công khai cho doanh nghiệp. |
| **Tạo bản chốt (materialize)** | Xử lý trong đó batch tự động gia hạn hợp đồng hằng tháng chốt kế hoạch giao hàng của tháng đó thành dữ liệu giao hàng. Không tính ngày ở đây mà kế thừa kế hoạch. |
| **Override đã phê duyệt** | Kết quả do con người quyết định như phê duyệt yêu cầu thay đổi. Không phải thuộc tính của kế hoạch mà được giữ độc lập, và áp dụng lại cho kế hoạch mỗi lần tạo lại (§4A-4). Kế hoạch đang được áp dụng hiển thị "Đã điều chỉnh" |
| **Ràng buộc nhận hàng của cơ sở** | Ngày・thứ mà doanh nghiệp không nhận được. Vì có tác dụng như điều kiện tạo ngày giao nên dù tạo lại cấu hình chu kỳ vẫn tự động tránh (§3.1C) |
| **Dữ liệu giao hàng** | Dữ liệu vận hành cho một lượt giao đã chốt từ lịch xuất hàng. Giữ số phiếu vận chuyển・tuyến giao hàng・kết quả giao hàng・thu tiền・tài liệu đính kèm, chi tiết gộp vào một màn hình (REQ-DL-309). Việc sửa trực tiếp ngày được thực hiện ở phía dữ liệu giao hàng. |
| **Tự giao hàng／Chuyến công ty vận tải** | Phân loại của dữ liệu giao hàng (đổi tên 2026/09/18). **Tự giao hàng** là do ES hoặc tài xế của công ty giao hàng ủy thác vận chuyển, có thể ghi lại từ nhận hàng ở kho đến báo cáo giao hàng bằng **ứng dụng tài xế của ES**. **Chuyến công ty vận tải** là gửi cho Yamato, v.v. để họ giao trực tiếp nên hệ thống chỉ giữ được **sự thật đã ra chỉ thị xuất hàng và việc hoàn tất giao hàng cuối cùng**. Không dùng tên cũ "chuyến ủy thác" vì dễ nhầm với công ty giao hàng ủy thác (dùng ứng dụng) (§4C). |
| **Thể chế giao hàng (`delivery_regime`)** | Phân loại ai vận chuyển. 3 giá trị **`self` (tự công ty)／`partner_driver` (tài xế ủy thác)／`parcel_carrier` (công ty vận tải)** (thêm ở lần 2 ngày 2026/09/21). Giữ giá trị mặc định của loại giao hàng và **giá trị thực tế theo từng chặng (leg)**. **(Cũ: `service_type` ＝ 2 giá trị `self` / `outsourced`. Đổi thành 3 giá trị ở lần 2 ngày 2026/09/21)** |
| **final leg (chặng cuối)** | Trong tuyến giao hàng (route legs), là chặng cuối cùng đến nơi giao (`delivery_legs.is_final_leg`). **Việc coi là hoàn tất ngầm định hay lấy làm hàng không giao chỉ do `delivery_regime` của chặng này quyết định** (quyết định lần 2 ngày 2026/09/21・§4C-1). |
| **Hoàn tất ngầm định** | Cách xử lý trong đó với chuyến **công ty vận tải giao trực tiếp final leg**, nếu quá ngày giao mà không ai báo cáo thì batch tự động coi là "**Đã giao (ngầm định)**" (§4C-1). Nếu có báo cáo thì ghi đè bằng nội dung đó. **Chuyến mà final leg dùng ứng dụng tài xế của ES thì không hoàn tất ngầm định** (sáng hôm sau chưa hoàn tất thì đưa vào missing queue). **(Cũ: phán đoán dựa trên loại chuyến "chuyến công ty vận tải". Đổi sang chuẩn final leg ở lần 2 ngày 2026/09/21)** |
| **missing queue (cần xác nhận hàng không giao)** | Hàng đợi cần xác nhận gom những chuyến mà **final leg dùng ứng dụng tài xế của ES** và đến sáng hôm sau vẫn không phải Đã giao・Dừng・Hủy (§4C-1・§11-1 `delivery_detect_missing`). |
| **Đã giao một phần** | Trạng thái chỉ giao một phần số lượng dự kiến (cũ "giao một phần"). Số lượng còn lại luôn giữ bằng bản sao (số nhánh) và **bản sao đó tạo ở trạng thái Đang xác nhận** (§4A-4C). **Ngoại lệ: cách giải quyết sự cố "giao một phần (phần còn lại không gửi)" (`partial_no_resend`) đóng mà không tạo con** (bổ sung 2026/09/29〔quyết định v2.3 #31〕). "Hoàn tất khi còn chưa giao một phần" của ứng dụng cũng thành trạng thái này trong dữ liệu. **Nếu có con tự động của sự cố thì tái sử dụng làm con của số lượng còn lại** (bổ sung 2026/09/24〔quyết định v2.3 #21〕). |
| **Đang xác nhận** | Trạng thái của dữ liệu giao hàng chờ chốt ngày・số lượng・cách xử lý. **Trong luồng sự cố, chỉ con・ứng viên phục hồi chưa ra khỏi kho (`shipped_date IS NULL`) mới dùng.** Dù có báo cáo sự cố, cha (Đã xuất／Đã nhận／Đã giao) cũng không chuyển thành Đang xác nhận (bổ sung 2026/09/24〔quyết định v2.3 #20〕). **(Cũ: chuyển dữ liệu giao hàng nhận báo cáo sự cố thành Đang xác nhận. Bãi bỏ 2026/09/24)** |
| **Báo cáo sự cố** | Báo cáo của tài xế・công ty giao hàng ủy thác, hoặc liên hệ từ doanh nghiệp・cơ sở・công ty giao hàng do bộ phận vận hành đăng ký thay (`trouble_reports`). **Không thay đổi trạng thái của dữ liệu giao hàng** mà mở cần xác nhận. Người giải quyết là bộ phận vận hành (logistics), đưa trực tiếp cha về Đã giao／Đã giao một phần (có con số lượng còn lại／không gửi phần còn lại)／Chờ giao lại／Đã nhận／Dừng (§4A-4B・〔quyết định v2.3 #20・#21・#31〕). **Việc giải quyết theo từng lượt giao**, đóng gộp các báo cáo chưa giải quyết của lượt giao đó〔quyết định v2.3 #29〕. Trong lúc chưa giải quyết thì còn trong cần xác nhận `trouble_open` (đối tượng là lượt giao)〔quyết định v2.3 #30〕. Loại là master 6 phân loại (`trouble_types`), "thiếu hàng・giao nhầm" của ứng dụng được đăng ký với loại chưa xác định (`type_code` NULL) (bổ sung 2026/09/29〔quyết định v2.3 #33〕) |
| **Con tự động của sự cố** | Dữ liệu giao hàng con mà hệ thống tạo trong cùng transaction **khi đăng ký báo cáo sự cố của loại mà master loại có "tạo" (`trouble_types.auto_child = true`) (giao nhầm・vắng mặt・hư hỏng)**. Khi bộ phận vận hành sau đó gắn cho loại thuộc loại "tạo" thì cũng tạo vào thời điểm đó. `確認中`・`duplicate_type = trouble_pending`・`creation_source = trouble_auto`. **Mỗi lượt giao xảy ra sự cố có tối đa 1 bản ghi còn hiệu lực (khác `取消`/Hủy)** (`source_trouble_delivery_id`). Đến khi bộ phận vận hành chốt ngày và số lượng thì nằm ngoài đối tượng của chỉ thị xuất hàng・phiếu vận chuyển・gán tài xế・thanh toán・thông báo・hoàn tất ngầm định (§4A-4C・〔quyết định v2.3 #23・#24・#29・#30〕). **(Cũ: với báo cáo sự cố quá hạn `auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes` vẫn chưa giải quyết thì batch `trouble_auto_duplicate` chỉ tạo 1 bản ghi. `creation_source = trouble_timeout`. Bãi bỏ 2026/09/29〔quyết định v2.3 #30〕)** |
| **Vòng đời kế hoạch (plan lifecycle)** | **3 giá trị mà kế hoạch giao hàng (`shipping_plans.lifecycle`) nhận** `draft` / `published` / `locked`. **Biểu thị "từ khi nào không động vào được"** (§4A-3). Được tách rõ với `delivery status` ở lần 2 ngày 2026/09/21. |
| **Trạng thái giao hàng (delivery status)** | **Giá trị mà dữ liệu giao hàng (`deliveries.status`) nhận**: Chờ xuất／Đã xuất／Đã nhận／Đã giao／Đã giao một phần／Chờ giao lại／Đang xác nhận／Dừng／Hủy. **Biểu thị "hàng đã tiến đến đâu"** (§4A-3B). |
| **3 trục của trạng thái** | Hệ thống hiển thị trạng thái trên màn hình. Chia thành 3: **trạng thái giao hàng** (tiến độ của dữ liệu giao hàng)・**yêu cầu thay đổi** (chung cho kế hoạch・dữ liệu giao hàng)・**trung chuyển** (giá trị suy ra) (§4A-3B). |

> **Không gọi chung `plan lifecycle` và `delivery status` là "trạng thái"** (quyết định lần 2 ngày 2026/09/21). Là hai máy trạng thái khác nhau, bảng chuyển đổi cũng giữ riêng. Một bản ghi dữ liệu giao hàng **cùng lúc có cả hai giá trị**, như "`lifecycle` ＝ `locked`" và "`status` ＝ Đã nhận". Trên màn hình, cái trước gọi là **giai đoạn**, cái sau gọi là **trạng thái**.
| **Master kho** | Master quản lý gộp kho picking và kho trung chuyển theo loại kho (REQ-DL-410). Việc chỉ định kho xuất không phải kiểu chọn mà kiểu tìm kiếm. |
| **Tuyến giao hàng** | Cấu trúc biến đổi chỉ định nơi giao đi và nơi giao đến mỗi lần (REQ-DL-411). Bãi bỏ "kho picking→điểm trung chuyển" cố định 2 giai đoạn. |

> **Nguyên tắc**: Ngày giao được quyết định trước, ngày picking được tính ngược sau. Hướng này chung cho mọi chế độ và không bao giờ đảo ngược.

### 0-0. Thống nhất cách gọi (quyết định 2026/09/21・#20／#31)

| Cách nói dùng | Cách nói không dùng | Ghi chú |
|---|---|---|
| **Chu kỳ giao hàng** (cấu hình chu kỳ giao hàng／tạm dừng chu kỳ giao hàng／ngày đầu chu kỳ giao hàng) | Chu kỳ nhập giao | Khớp với câu chữ màn hình phía công bố menu. **Tên tệp `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` giữ nguyên** |
| **Thứ không giao được** | Thứ không nhận được | Tên vật lý `ng_weekdays` không đổi |
| **Dời sớm・dời muộn** | Hướng chuyển ngày | Tên vật lý `holiday_shift` không đổi |

- **"Ngày giao", "kế hoạch giao hàng", "nơi giao", "slot giao hàng", "ngày xử lý như ngày lễ giao hàng" và các chữ "giao hàng (納品)" khác ngoài chu kỳ không đổi.** Chỉ thay từ "chu kỳ nhập giao (納品サイクル)".
- Tên màn hình cũng là **"Cấu hình chu kỳ giao hàng"** (màn hình 01).

### 0-1. Tên gọi hệ thống bên ngoài・công ty giao hàng (【Tạm thời】2026/09/21・chờ bộ phận vận hành xác nhận)

Thống nhất cách ghi dùng trong tài liệu này・đặc tả tổng hợp・bản demo.

| Đối tượng | Cách ghi | Ghi chú |
|---|---|---|
| Công ty giao hàng | **【Tạm thời】Yamato Transport (viết tắt: Yamato)** | Đang xác nhận tên chính thức (quan hệ với Kurubin Yamato) |
| Hệ thống kho | **【Tạm thời】Thomas** | Đang xác nhận tên chính thức (cách viết `THOMAS`) |

- Lần đầu xuất hiện ghi "Yamato Transport", từ sau đó dùng "Yamato" là được. Không dùng "大和" "Kuroneko".
- Hệ thống kho thống nhất là "Thomas". Không dùng cách ghi chữ Latin cho đến khi biết tên chính thức.

---

## 1. Cấu trúc tổng thể

Chức năng này hoạt động theo **7 giai đoạn một chiều**. Chuẩn bị master rồi thiết lập lịch toàn công ty, quyết định quy tắc ở hợp đồng, chốt ngày, quyết định người vận chuyển, và xử lý những gì xảy ra bằng các bản ghi tiếp theo. Việc **không bỏ qua giai đoạn・không viết lại giai đoạn trước từ giai đoạn sau** là tiền đề để ngăn lỗi.

### 1.1 Luồng xuyên suốt (7 giai đoạn)

```
① Chuẩn bị master → ② Cấu hình toàn công ty → ③ Hợp đồng →〔Batch〕→ ④ Thay đổi・yêu cầu・khóa → ⑤ Cấu hình tài xế → ⑥ Xác nhận sự cố → ⑦ Sao chép
  Master kho            Chu kỳ giao hàng        Loại giao hàng  Kế hoạch giao    Thay đổi hàng loạt      Gán tài xế phụ trách  Ghi báo cáo          Giao từng phần
  Công ty giao ủy thác  A1 đầu tiên・28 ô        Chi tiết giao   draft được tạo   Yêu cầu thay đổi/phê    Nhận・báo cáo bằng     Hủy／Dừng／Loại bỏ    Giao lại
  Master trung chuyển   Tạm dừng chu kỳ         Slot/ngày chỉ   ↓               duyệt của doanh nghiệp  ứng dụng              Đưa vào cần xác nhận  Chuyến thay thế
  Tài xế                Ngày xử lý như lễ       định            Bắt đầu đặt hàng→published                                                         Số nhánh DL-…-1
 (06B・08)              (01)                    Số lượng・lead time  Chỉ thị xuất hàng→locked                                                         
                                                (02)            (03/04/05)    (05・06・Lịch vận hành)   (08・ứng dụng)        (06・cần xác nhận)    (06)
```

| Giai đoạn | Người phụ trách | Màn hình chính | Điều được quyết định ở giai đoạn này | Thứ truyền sang bước tiếp |
|---|---|---|---|---|
| **① Chuẩn bị master** | Quản trị viên vận hành (logistics) | 06B Master kho／Master công ty giao hàng／08 Cấu hình tài xế | Thông tin nhận diện kho・mã kho・ngưỡng số lượng・lead time chỉ thị xuất hàng, nhiệt độ bảo quản tương ứng・khu vực tương ứng・ngày không giao ủy thác của công ty giao hàng, điểm trung chuyển, tài xế, kho xử lý của sản phẩm | Các lựa chọn chọn được ở hợp đồng |
| **② Cấu hình toàn công ty** | Quản trị viên hệ thống | 01 Cấu hình chu kỳ giao hàng | A1 đầu tiên (thứ Hai), 28 slot (tuần A〜D × thứ 1〜7), tạm dừng chu kỳ, ngày xử lý như ngày lễ giao hàng, kỳ đối tượng tạo (cơ bản 6 tháng) | Lịch dùng chung toàn công ty (ngày nào là ngày giao được) |
| **③ Hợp đồng** | Kinh doanh (hợp đồng＝theo từng cơ sở) | 02 Cấu hình giao hàng theo hợp đồng | Loại giao hàng (nhiệt độ bảo quản・vật tư × kho × công ty giao hàng 〈1・trung chuyển・2〉), chi tiết giao hàng, cách quyết định ngày giao (slot／ngày chỉ định), số lượng, lead time | Quy tắc giao hàng của từng hợp đồng. Batch tạo **kế hoạch giao hàng (`draft`)** |
| **④ Thay đổi・yêu cầu・khóa** | Quản trị viên vận hành + doanh nghiệp・cơ sở | 05 Lịch giao hàng／06 Chi tiết dữ liệu giao hàng／Lịch vận hành | Ngày giao・ngày picking thực tế. Thay đổi hàng loạt của bộ phận vận hành, yêu cầu thay đổi và phê duyệt của doanh nghiệp, **tạo bản chốt (`published`)** vào **ngày bắt đầu đặt hàng** (xác nhận 2026/09/21. Cũ: chốt đơn), **chốt số lượng** khi chốt đơn, **`locked`** khi chỉ thị xuất hàng | Dữ liệu giao hàng đã chốt (ngày・số lượng・tuyến) |
| **⑤ Cấu hình tài xế** | Quản trị viên vận hành + công ty giao hàng ủy thác | 08 Cấu hình tài xế／Ứng dụng tài xế | Tài xế phụ trách cho từng bản ghi dữ liệu giao hàng, có thu tiền hay không, nhận hàng・báo cáo giao hàng | Ai vận chuyển khi nào. Kết quả thực tế (đã nhận・hoàn tất giao hàng) |
| **⑥ Xác nhận sự cố** | Tài xế・công ty giao hàng ủy thác → Quản trị viên vận hành | 06 Chi tiết dữ liệu giao hàng／"Cần xác nhận" của lịch vận hành | Ghi báo cáo và đưa vào cần xác nhận. **Không thay đổi trạng thái của cha** (giữ nguyên Đã xuất／Đã nhận. Liên hệ sau khi giao giữ nguyên Đã giao). Bộ phận vận hành (logistics) giải quyết trực tiếp cho cha (Đã giao／Đã giao một phần＋con／Chờ giao lại＋con／Đã nhận 〈quay lại trong ngày〉／Dừng. Hàng thay thế・loại bỏ là xử lý kèm theo. Nếu biết là không giao được trước khi xuất thì Hủy). **Nếu là loại tạo con tự động (giao nhầm・vắng mặt・hư hỏng) thì tạo 1 con tự động cùng lúc đăng ký báo cáo** (bổ sung 2026/09/29〔quyết định v2.3 #30〕. Cũ: nếu đến hạn chưa giải quyết thì batch tạo 1 con tự động. Bãi bỏ 2026/09/29). Giải quyết gộp theo từng lượt giao〔quyết định v2.3 #29〕 (bổ sung 2026/09/24〔quyết định v2.3 #20・#21〕. **Cũ: chuyển báo cáo thành Đang xác nhận và bộ phận vận hành chọn cách xử lý. Bãi bỏ 2026/09/24**) | Phương châm xử lý. Không viết lại ngày |
| **⑦ Sao chép** | Quản trị viên vận hành (logistics) | 06 Chi tiết dữ liệu giao hàng | Không viết lại bản gốc, tạo bản ghi con có số nhánh (`DL-…-1`). Một thao tác chung cho giao từng phần・giao lại・chuyến thay thế | Dữ liệu giao hàng của giao bù sau・giao lại・chuyến thay thế (quay về ⑤ để gán) |

> ⑤〜⑦ có thể quay vòng ⑥→⑦→⑤ (gán lại tài xế cho bản ghi con đã sao chép). **Chỉ từ ⑤ trở đi mới quay vòng**, không quay lại ② ③.
### 1.2 Danh sách màn hình

| No | Màn hình | Phụ trách chính | Giai đoạn | Vai trò |
|---|---|---|---|---|
| 01 | Cài đặt chu kỳ giao hàng (lịch + bảng cài đặt) | Quản trị viên hệ thống・Quản trị viên vận hành | ② | Điều kiện chung toàn công ty (A1 lần đầu・28 slot・tạm dừng chu kỳ・ngày được coi là ngày lễ giao hàng・khoảng thời gian tạo dữ liệu), cùng **khung không thể xuất hàng theo từng tab kho và các ngày không thể xuất hàng theo ngày** (chuyển từ Master kho vào ngày 2026/09/14) |
| 02 | Cài đặt giao hàng theo hợp đồng | Kinh doanh (theo từng hợp đồng) | ③ | Phân loại giao hàng, chi tiết giao hàng, cách quyết định ngày giao, slot／ngày chỉ định, lead time, số lượng |
| 03 | Danh sách lịch xuất hàng | Batch (tự động) | ③→④ | Kết quả ngày giao hàng・ngày picking được tạo từ 01×02 |
| 04 | Lịch picking | **Quản trị viên vận hành** | ④ | Danh sách theo ngày sắp xếp theo ngày picking. Cảnh báo theo tab kho・ngưỡng số bản ghi. **Do kho không có màn hình trong hệ thống nên đây là màn hình để bộ phận vận hành xem** (2026/09/14) |
| 05 | Lịch giao hàng | Quản lý giao hàng・Kinh doanh | ④ | Danh sách theo ngày sắp xếp theo ngày giao hàng (khung nhìn khác của cùng dữ liệu với 04) |
| 05B | Quản lý xuất hàng・giao hàng (danh sách) | Quản trị viên vận hành | ④⑤ | Danh sách tìm kiếm **chỉ dữ liệu giao hàng** theo thời gian・điều kiện. Lịch (04・05) là dạng calendar, còn màn hình này là tìm kiếm. Là màn hình cha của chi tiết (06) (§5.3B) |
| 06 | Chi tiết dữ liệu giao hàng (tích hợp) | Quản trị viên vận hành | ④⑥⑦ | Tập hợp trong 1 màn hình thông tin của 1 giao hàng・kết quả giao hàng・yêu cầu thay đổi・thu tiền・tệp đính kèm (REQ-DL-309). Thay đổi lead time bất thường, xử lý sự cố và **sao chép** cũng thực hiện tại đây |
| 06B | Master kho | Quản trị viên vận hành (logistics) | ① | **Quản lý đồng loạt kho picking và điểm trung chuyển theo phân loại kho** (§2.3A). Thông tin cơ bản・người phụ trách là chung, **ngưỡng số bản ghi／lead time chỉ thị xuất hàng／liên kết chỉ có ở kho picking**. **Khung không thể xuất hàng và các ngày không thể theo ngày được cài đặt ở màn hình 01** |
| 06C | Master công ty vận chuyển・Master trung chuyển | Quản trị viên vận hành (logistics) | ① | Nhóm nhiệt độ hỗ trợ (**3 giá trị: Đông lạnh／Lạnh・Nhiệt độ thường／Vật tư**・2026/09/21)・khu vực hỗ trợ・ngày không thể giao ủy thác・điểm trung chuyển (mã văn phòng) |
| 07 | Lịch giao hàng dành cho doanh nghiệp・cơ sở | Người dùng doanh nghiệp／cơ sở | ③④ | Khung nhìn công khai cùng dữ liệu với 05 cho phía doanh nghiệp. Hiển thị chu kỳ・ngày lễ, tìm kiếm, modal kết quả giao hàng, lối vào yêu cầu thay đổi (REQ-DL-312) |
| 08 | Cài đặt tài xế・Quản lý tài xế (thống nhất vào màn hình quản lý vận hành) | Quản trị viên vận hành + công ty vận chuyển ủy thác | ①⑤ | Đăng ký tài xế・cấp tài khoản・trạng thái đăng ký số điện thoại (REQ-DL-413・503〜505). Tiến độ trong ngày, phân công và đổi người phụ trách, tình hình tiến hành, gửi thông báo・hướng dẫn (§4B-6) |
| — | Ứng dụng tài xế (trình duyệt Web・chốt V1.0) | Tài xế | ⑤⑥ | KPI trang chủ, danh sách giao hàng, nhận hàng, 5 bước của ES配送便 (ảnh・hủy tồn kho・kiểm hàng・thu tiền), COOL配送便, báo cáo sự cố, thông báo, hướng dẫn (§4B-5) |

> Màn hình 04 và 05 **tách lịch giữa xuất hàng (picking) và giao hàng** (REQ-DL-308). Việc chúng là khung nhìn khác của cùng một dữ liệu thì không thay đổi.

### 1.3 Đầu vào・đầu ra・chốt chặn của từng giai đoạn

"Chốt chặn" của mỗi giai đoạn là **những điều không được làm／những điều hệ thống sẽ chặn ở giai đoạn đó**. Toàn cảnh phương châm thiết kế thu hẹp mức tự do xem ở §12.

**① Chuẩn bị Master (kho・giao hàng ủy thác・trung chuyển・tài xế)**

| | Nội dung |
|---|---|
| Đầu vào | Phân loại kho (picking／trung chuyển), mã kho／mã văn phòng, ngưỡng số bản ghi (**mặc định 300 bản ghi／ngày**), lead time chỉ thị xuất hàng, nhóm nhiệt độ hỗ trợ・khu vực hỗ trợ・ngày không thể giao ủy thác của công ty vận chuyển, tài xế, **kho xử lý sản phẩm** (§2.3C). **Khung không thể xuất hàng và các ngày không thể theo ngày được cài đặt ở màn hình 01 của ②** |
| Đầu ra | Các lựa chọn có thể chọn ở phân loại giao hàng của hợp đồng. Điều kiện hoạt động dùng cho phán định ngày |
| Chốt chặn | **Không có kho thay thế** (§2.3). Kho trung chuyển không có lead time và không phát hành lại phiếu gửi hàng. Tổ hợp trái với nhóm nhiệt độ hỗ trợ・khu vực hỗ trợ của công ty vận chuyển sẽ bị **cảnh báo** ở phía hợp đồng (§12-1). **Không cho chỉnh sửa khung không thể xuất hàng ở Master kho** (dẫn sang màn hình 01) |

**② Cài đặt toàn công ty (Cài đặt chu kỳ giao hàng・màn hình 01)**

| | Nội dung |
|---|---|
| Đầu vào | A1 lần đầu (**cố định thứ Hai**. Nếu không phải thứ Hai thì làm tròn về thứ Hai ngay trước), tạm dừng chu kỳ (**cơ bản theo đơn vị tuần**), ngày được coi là ngày lễ giao hàng, khoảng thời gian tạo dữ liệu (cơ bản 6 tháng) |
| Đầu ra | Lịch 28 slot (tuần A〜D × thứ 1=Thứ Hai〜7=Chủ Nhật). Chung toàn công ty |
| Chốt chặn | Vì slot được cố định theo thứ nên **không để tạm dừng làm lệch slot và thứ** (§4.2). Ngày nghỉ của từng kho không biểu thị ở đây mà biểu thị bằng khung không thể xuất hàng・ngày không thể của ①. Ở đây không thể chỉnh sửa việc không thể xuất hàng (chỉ tham chiếu・§2.3) |

**③ Hợp đồng (Cài đặt giao hàng theo hợp đồng・màn hình 02)**

| | Nội dung |
|---|---|
| Đầu vào | Phân loại giao hàng (nhóm nhiệt độ hoặc vật tư × kho × công ty vận chuyển cấp 1 × điểm trung chuyển × công ty vận chuyển cấp 2 × lead time × tỷ lệ cấu thành), chi tiết giao hàng, cách quyết định ngày giao (slot chu kỳ／ngày N hàng tháng／cuối tháng), số lượng |
| Đầu ra | **Lịch giao hàng (`draft`)**. Batch tính ngày giao hàng・ngày picking từ 01×02 và tạo ra (§4A-2) |
| Chốt chặn | Hợp đồng chỉ có thể ghi đè các mục trong danh sách trắng (§12-2). Lead time có thể thay đổi bằng số nhưng **0〜7 ngày** (quyết định 2026/09/21. Cũ: 0〜30 ngày). **Lead time được giữ theo phân loại giao hàng của hợp đồng (lạnh／đông lạnh／vật tư), Master kho không giữ**. Khi đổi kho thì phản ánh **từ tháng áp dụng**, không đụng đến quá khứ. 1 hợp đồng = 1 cơ sở, và **kho・công ty vận chuyển có thể khác nhau theo từng phân loại giao hàng** |

**④ Thay đổi・yêu cầu thay đổi・khóa**

| | Nội dung |
|---|---|
| Đầu vào | Sửa ngày・thay đổi hàng loạt của vận hành, yêu cầu thay đổi từ doanh nghiệp・cơ sở (chế độ phê duyệt), phản ánh thay đổi cài đặt (①②), phản ánh yêu cầu đã phê duyệt (override đã phê duyệt) |
| Đầu ra | `draft` → **`published`** (tạo xác định vào **ngày bắt đầu đặt hàng** của menu đối tượng・xác nhận 2026/09/21. Cũ: ngày chốt đặt hàng) → **`locked`** (**thời điểm lần gửi đầu tiên của chỉ thị xuất hàng thành công**・quyết định lần 2 ngày 2026/09/21. Xuất ra **gộp dữ liệu 2 tuần, vào thứ Sáu, 3 ngày trước ngày bắt đầu của 2 tuần đó** = "khi nào gửi". Lead time chỉ thị xuất hàng của Master kho **mặc định 3 ngày**. **Dù đã có số phiếu gửi hàng cũng không chuyển sang `locked`**. Cũ: thời điểm ra chỉ thị xuất hàng／N ngày trước ngày picking・mặc định 1 ngày) |
| Chốt chặn | Cửa để ghi đè ngày được **thống nhất thành 1** (§12-3). Doanh nghiệp chỉ có thể yêu cầu **trong khoảng chu kỳ đã tạo (tối đa 6 tháng sau, trừ ngày quá khứ・tháng hiện tại)**. Sau `locked` thì **không ghi đè lịch (ngày)** (§4A-4B). Override đã phê duyệt được áp dụng lại mỗi lần tạo lại, nếu không áp dụng được thì hết hiệu lực hoặc chuyển sang đang đề xuất (§4A-4). Chuyển trạng thái được khép kín bằng bảng (§12-4) |

**⑤ Cài đặt tài xế (phân công và ứng dụng tài xế)** → chi tiết ở §4B

| | Nội dung |
|---|---|
| Đầu vào | Đăng ký tài xế・cấp tài khoản, phân công người phụ trách cho từng dữ liệu giao hàng, có/không thu tiền. Báo cáo hoàn thành từ ứng dụng: nhận hàng・5 bước ES配送便・COOL配送便 |
| Đầu ra | Dữ liệu giao hàng đã xác định người phụ trách. Nhận hàng, báo cáo giao hàng, ảnh, báo cáo hủy tồn kho, số lượng kiểm hàng, kết quả thu tiền (bộ phận vận hành quản lý ở 08 và 06・§4B-6) |
| Chốt chặn | **Chỉ vận hành (quản lý ES) mới đổi được ngày giờ giao hàng**. **Đổi phân công tài xế thì cả quản lý ES + công ty vận chuyển ủy thác đều làm được** (REQ-DL-149). Đổi phân công không thay đổi ngày nên **làm được cả sau `locked`**. Giao bổ sung khi thiếu số lượng thì **không chỉ thị trên ứng dụng mà quản lý thủ công ở phía trụ sở** (REQ-DL-147) |

**⑥ Xác nhận sự cố**

| | Nội dung |
|---|---|
| Đầu vào | Báo cáo từ tài xế・công ty vận chuyển ủy thác (tai nạn・chậm trễ・hư hỏng・không nhận được), những việc không thể được biết trước khi xuất hàng (hỏng thiết bị・không sắp xếp được xe・tuyết lớn). **Với chuyến của công ty vận tải, bộ phận vận hành đăng ký thay liên lạc từ doanh nghiệp・cơ sở** (§4C). Loại là Master 6 phân loại (§4A-4B) |
| Đầu ra | Báo cáo sự cố (`trouble_reports`) và cần xác nhận. **Không thay đổi trạng thái của dữ liệu giao hàng**: bản cha giữ nguyên `Đã xuất hàng`／`Đã nhận hàng`, liên lạc sau khi giao hàng (khiếu nại) giữ nguyên `Đã giao hàng` (bổ sung 2026/09/24 [quyết định v2.3 #20]). Vận hành (logistics) giải quyết trực tiếp bản cha: `Đã giao hàng`／`Đã giao một phần` + con (số lượng còn lại)／`Đã giao một phần` (phần còn lại không gửi・không có con [quyết định v2.3 #31])／`Chờ giao lại` + con (toàn bộ số lượng)／`Đã nhận hàng` (ghé lại trong ngày)／`Hủy bỏ` ([quyết định v2.3 #21]). `Đã giao hàng` của hoàn thành giả định (`presumed`) nếu qua điều tra của Yamato biết là chưa đến thì cũng có thể chọn `Chờ giao lại`／`Hủy bỏ` [quyết định v2.3 #27]. Việc giải quyết theo **đơn vị giao hàng**, đóng gộp các báo cáo chưa giải quyết [quyết định v2.3 #29]. Những việc không thể được biết trước khi xuất hàng thì `Hủy`. Báo cáo chưa giải quyết được đưa vào cần xác nhận `trouble_open` (đối tượng là giao hàng). **Nếu loại trong Master loại là "tạo" (giao nhầm・vắng mặt・hư hỏng) thì đồng thời với đăng ký báo cáo sẽ tự động tạo 1 bản con (`Đang xác nhận`・`trouble_pending`)** ([quyết định v2.3 #30]). **(Cũ: nếu quá `auto_duplicate_due_at` mà vẫn chưa giải quyết thì batch `trouble_auto_duplicate` tự động tạo 1 bản con [quyết định v2.3 #22]. Đã bãi bỏ 2026/09/29)** **(Cũ: chuyển sang trạng thái Đang xác nhận <trước đây là "Sự cố"・REQ-DL-313> và vận hành chọn cách xử lý. Đã bãi bỏ 2026/09/24)** |
| Chốt chặn | Chỉ **vận hành (logistics)** mới có thể hủy・dừng・sắp xếp giao lại. Tài xế và công ty vận chuyển ủy thác **chỉ báo cáo**. Tất cả đều **bắt buộc nhập lý do** và lưu vào lịch sử thay đổi. Các trường hợp phát sinh nhất định **đưa vào "cần xác nhận"** để không để lại việc chưa xử lý. **Không ghi đè bản ghi quá khứ** (§4A-4B). **Báo cáo sự cố không chuyển bản cha sang đang xác nhận.** Nếu trong 1 giao hàng xảy ra sự cố đã có bản con tự động còn hiệu lực thì không tạo bản con thứ 2 (`DOMAIN_TROUBLE_CHILD_EXISTS`・[quyết định v2.3 #21・#29]) |

**⑦ Sao chép (giao từng phần・giao lại・chuyến thay thế)**

| | Nội dung |
|---|---|
| Đầu vào | Dữ liệu giao hàng gốc, lý do (giao từng phần／giao lại／chuyến thay thế／khác), phân bổ số lượng, ngày giao mới |
| Đầu ra | Bản ghi con có số nhánh (`DL-…-1`). Hợp đồng・nơi nhận・tuyến đường được sao chép, ngày・phiếu gửi hàng・số lượng・phân công là mới |
| Chốt chặn | **Quan hệ cha con chỉ 1 cấp** (số nhánh tối đa 9). Sao chép là tạo mới nên **thực hiện được cả khi `locked`**. Chỉ vận hành (logistics) mới làm được và **bắt buộc có lý do**. Bản con đã sao chép được đưa vào "cần xác nhận", không để ngày・phiếu gửi hàng・**phân công tài xế** bị bỏ ngỏ chưa thiết lập (§4A-4C). → Quay lại ⑤ để phân công. **Ngoại lệ: bản con tự động của sự cố do hệ thống tạo đồng thời với việc đăng ký báo cáo sự cố (hoặc khi gán lại loại), và không chuyển sang `Chờ xuất hàng` cho đến khi vận hành (logistics) chốt ngày và số lượng (cả `schedule_confirmed` và `quantity_confirmed` đều true)** (`DOMAIN_TROUBLE_CHILD_UNCONFIRMED`・bổ sung 2026/09/24 [quyết định v2.3 #23・#24]・bổ sung 2026/09/29 [quyết định v2.3 #30]. Cũ: batch `trouble_auto_duplicate` tạo. Đã bãi bỏ 2026/09/29). **Khi xảy ra sự cố ở bản con thì không sao chép từ bản con mà tạo số nhánh tiếp theo của bản cha** (nội dung sao chép từ bản con xảy ra sự cố. Quá 9 nhánh thì `DOMAIN_BRANCH_LIMIT` + cần xác nhận・[quyết định v2.3 #28]) |

### 1.4 Đối chiếu giữa giai đoạn và trạng thái

**Những gì liệt kê ở đây là `plan lifecycle`** (`draft` / `published` / `locked`). `delivery status` biểu thị tiến độ của hàng hóa (Chờ xuất hàng〜Đã giao hàng) là một trục khác, được đặt ở §4A-3B. **Không gọi gộp cả hai là "trạng thái"** (quyết định lần 2 ngày 2026/09/21).

| `plan lifecycle` | Khi nào | Có thể thay đổi | Không thể thay đổi |
|---|---|---|---|
| (Chưa tạo) | Đang cài đặt ①②③ | Toàn bộ Master・cài đặt toàn công ty・hợp đồng | — |
| `draft` (lịch giao hàng) | Từ sau khi tạo hợp đồng〜đến **ngày bắt đầu đặt hàng** (tạo xác định) | Ngày・số lượng・tuyến đường. Khi thay đổi cài đặt thì **tạo lại không ngoại lệ**, áp dụng lại override đã phê duyệt | Kết quả・thu tiền・phiếu gửi hàng (chưa tồn tại). **Cũng không thể sao chép** (với lịch chỉ có thể "sao chép／thay đổi lịch"・quyết định lần 2 ngày 2026/09/21) |
| `published` (dữ liệu giao hàng) | **Ngày bắt đầu đặt hàng**〜trước khi gửi chỉ thị xuất hàng thành công | Sửa ngày của vận hành (**chỉ trước hạn chốt đặt hàng**), thay đổi hàng loạt (chỉ trước hạn chốt), phân công tài xế, số lượng, **sao chép** | Không tự động tạo lại (thay đổi cài đặt chuyển sang "cần xác nhận") |
| `locked` | **Thời điểm lần gửi đầu tiên của chỉ thị xuất hàng thành công**〜 (quyết định lần 2 ngày 2026/09/21. **Cũ: thời điểm ra chỉ thị xuất hàng**) | Kết quả・`delivery status`・thu tiền・**phân công tài xế**・**sao chép** | **Ghi đè ngày giao・ngày picking・số lượng** (xử lý bằng hủy hoặc sao chép) |

> **`delivery status` hiển thị trên màn hình là §4A-3B.** Dòng `draft` để ô trạng thái là "—" và chỉ hiển thị trạng thái của yêu cầu thay đổi. Từ `published` trở đi mới có `delivery status` (Chờ xuất hàng〜Đã giao hàng).

### 1.5 Quy tắc để không chảy ngược

1. **Không ghi đè dữ liệu của giai đoạn trước từ giai đoạn sau.** Khi muốn sửa từng dữ liệu giao hàng thì không đụng đến Master kho hay chu kỳ giao hàng. Ngược lại, nếu thay đổi cài đặt ①② ảnh hưởng đến `published` trở đi thì không tự động ghi đè mà đưa ra "cần xác nhận" (§4A-5).
2. **Chỉ batch ở ③ mới tạo ngày.** Từ ④ trở đi chỉ "dịch chuyển", không có công thức tính (§12-3・§12-5).
3. **Không xóa bản ghi mà thêm vào.** ⑥⑦ dù là hủy・dừng・sao chép đều giữ lại bản ghi gốc. Vì thanh toán và kiểm toán (§4A-4B).
4. **Không để lại việc chưa xử lý.** Cần xác nhận của ④, báo cáo sự cố chưa giải quyết của ⑥ (`trouble_open`・bổ sung 2026/09/29 [quyết định v2.3 #30]), ngay sau sao chép của ⑦ (bản con đang xác nhận・bản con tự động của sự cố) đều được đưa vào "cần xác nhận" của lịch vận hành. **(Cũ: "Đang xác nhận của ⑥". Do báo cáo sự cố không còn chuyển bản cha sang đang xác nhận nên sửa đổi 2026/09/24 [quyết định v2.3 #20])**
5. **Bắt buộc có lý do.** Thay đổi ngày thủ công・thay đổi hàng loạt・hủy override đã phê duyệt・đổi kho・xóa lịch・hủy・dừng・sao chép đều bắt buộc nhập lý do và có lịch sử thay đổi (§11-2).

---

## 2. Màn hình 01 — Cài đặt chu kỳ giao hàng (quản trị viên hệ thống)

Cấu trúc một màn hình chia trái phải. Thao tác với bảng cài đặt bên phải trong khi xác nhận kết quả cài đặt trên lịch bên trái.

### 2.0A Cách giữ cài đặt chu kỳ giao hàng (chốt 2026/09/14)

#### Xác định một cài đặt duy nhất theo từng tháng

**Cài đặt chu kỳ giao hàng chỉ có một**. Không giữ nhiều "phiên bản" song song. Cài đặt theo từng tháng và **xác định lần lượt từ tháng đã vào vận hành**.

```
2026-02 ───────── 2026-10 │ 2026-11 ──────── 2027-01 │ 2027-02 ─────
   Đã xác định (không sửa được) │   Đã cài đặt (sửa được)   │   Chưa cài đặt (sắp tới)
   Menu đã công khai・đã nhận đơn │   Khoảng thời gian tạo dữ liệu │
```

| Trạng thái | Ý nghĩa |
|---|---|
| Đã xác định (không sửa được) | Tháng hiện tại đang vận hành giao hàng・tháng đã công khai menu・tháng đã bắt đầu xử lý nhận đơn／giao hàng (§2.0C-2). Không thể thay đổi cài đặt |
| Đã cài đặt (sửa được) | Nằm trong khoảng thời gian tạo dữ liệu và chưa vào vận hành |
| Chưa cài đặt (lỗ hổng) | Tháng bị trống giữa khoảng đã xác định và khoảng thời gian tạo dữ liệu. **Tháng này không tạo lịch hay dữ liệu giao hàng** |
| Chưa cài đặt (sắp tới) | Tháng sau khoảng thời gian tạo dữ liệu. Chỉ là chưa cài đặt |

- **Cài đặt của tháng đã xác định không thể thay đổi về sau**, nhưng nội dung lúc đó được lưu trong **lịch sử thay đổi** (khi nào・ai・ở đâu・cái gì・số bản ghi ảnh hưởng). Căn cứ của lịch trong quá khứ được truy theo lịch sử này.
- Khi kéo dài khoảng thời gian về phía sau, chỉ cần **dịch tháng kết thúc của khoảng thời gian tạo dữ liệu**. Không phải tạo cài đặt mới.
- Giá trị khởi tạo của tháng bắt đầu là **tháng đầu tiên chưa cài đặt** (nếu có lỗ hổng thì là tháng đó, nếu không thì là tháng sau tháng cuối cùng đã cài đặt). **Tháng sau nữa (tháng+2) không phải là giá trị khởi tạo mà có tác dụng như giới hạn dưới** (§2.0C-1).

#### Phản ánh khi thay đổi cài đặt

| Đối tượng | Khi thay đổi cài đặt |
|---|---|
| Tháng đã xác định | **Ngoài đối tượng**. Vốn dĩ không sửa được |
| `draft` (lịch giao hàng・chưa xác định) | **Xóa toàn bộ và tạo lại**. Không tạo ngoại lệ |
| `published` (đã thành dữ liệu giao hàng) | **Không thay đổi**. Đưa ra "cần xác nhận" để vận hành phán đoán |
| `locked` (đã chỉ thị xuất hàng) | **Ngoài đối tượng** |
| Ràng buộc nhận hàng của cơ sở (§3.1C) | Có tác dụng như **điều kiện tạo** khi tạo lại. Dù chu kỳ thay đổi thế nào cũng tự động tránh |
| Override đã phê duyệt (§4A-4) | **Áp dụng sau** vào lịch đã tạo lại. Nếu không áp dụng được thì hết hiệu lực hoặc chuyển sang đang đề xuất |

Trước khi lưu, luôn hiển thị **xem trước số bản ghi ảnh hưởng** (§4A-5B). Kết quả re-anchor của override đã phê duyệt (áp dụng／hết hiệu lực／đang đề xuất) cũng được đưa vào chi tiết.

#### Ngăn trùng lặp dữ liệu lịch

Để mỗi lần tạo lại không làm tăng số dòng, **việc tạo là thay thế (upsert) chứ không phải thêm vào**.

```
Quy trình tạo lại
1. Xóa draft của khoảng thời gian đó (kể cả đã phê duyệt, xóa không ngoại lệ)
2. Tạo lại draft bằng cài đặt mới (ràng buộc nhận hàng của cơ sở có tác dụng ở đây)
3. Giữ nguyên published / locked
4. Áp dụng override đã phê duyệt theo thứ tự ngày giờ phê duyệt cũ nhất trước (§4A-4)
5. Nếu draft tạo lại xung đột với published trong cùng ngày giao thì ưu tiên published,
   và đưa phần khác biệt ra "cần xác nhận"
```

Ràng buộc unique của `shipping_plans` là **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** (quyết định lần 2 ngày 2026/09/21). `occurrence_key` là giá trị chỉ duy nhất lần này trong chu kỳ đó (slot `A1`〜`D7`, hoặc ngày chỉ định riêng "ngày N hàng tháng" "cuối tháng").

**(Cũ: ràng buộc unique `(contract_id, delivery_date)`. Đã hủy ở lần 2 ngày 2026/09/21)** Vì **1 hợp đồng có thể có nhiều nhóm nhiệt độ・phân loại giao hàng trong cùng một ngày giao** (lạnh và đông lạnh xếp cùng ngày), nếu đặt duy nhất theo ngày giao thì các dòng đúng sẽ xung đột nhau. Việc đối chiếu khi thay thế (upsert) cũng thực hiện bằng **khóa này** chứ không phải ngày.

> Bước 5 ở trên "nếu xung đột trong cùng ngày giao thì ưu tiên published" là chuyện giữa **các dòng có cùng khóa**. Các dòng khác nhóm nhiệt độ・phân loại giao hàng thì dù cùng ngày giao cũng không phải xung đột.

### 2.0B Hiển thị tình trạng cài đặt (chốt 2026/09/14)

#### Vì sao cần

Cho đến nay màn hình 01 chỉ là màn hình cài đặt, nên **không thể biết từ màn hình rằng tháng nào đã được cài đặt**. Vì vậy không phát hiện được thiếu sót cài đặt (lỗ hổng). Tháng không có cài đặt thì không tạo lịch giao hàng lẫn dữ liệu giao hàng, nên **việc không nhận ra chính là sự cố**.

**Không tạo danh sách phiên bản cài đặt** (vì cài đặt chỉ có một). Thay vào đó **cho xem tình trạng cài đặt theo từng tháng bằng một dải (band)**.

#### Vị trí hiển thị

Hiển thị toàn chiều rộng ở **trên cùng** của màn hình 01 (Cài đặt chu kỳ giao hàng). Không tách sang màn hình khác.

#### Hàng trên: Tình trạng cài đặt chu kỳ giao hàng

Xếp các ô theo tháng từ tháng bắt đầu vận hành cài đặt đến tháng kết thúc của khoảng thời gian tạo dữ liệu + 6 tháng, và biểu thị trạng thái bằng màu (đã xác định／đã cài đặt／chưa cài đặt (lỗ hổng)／chưa cài đặt (sắp tới)).

#### Hàng dưới: Tình trạng công khai menu

Cùng cách xếp theo tháng, xếp tình trạng công khai menu (đang vận hành／đã công khai = không sửa được／đang chuẩn bị công khai／chưa công khai). **Gắn `!` vào tháng chưa cài đặt chu kỳ giao hàng**. Để có thể đối chiếu cài đặt và công khai menu trên cùng một trục (§2.0C).

#### Cảnh báo

- Có lỗ hổng → `Có tháng chưa có cài đặt: 2026-11　Tháng này không tạo lịch giao hàng và dữ liệu giao hàng. Cũng không hiển thị với doanh nghiệp và không thể yêu cầu thay đổi.` **Giá trị khởi tạo của tháng bắt đầu sẽ là tháng này** nên chỉ cần lưu nguyên trạng là lấp đầy (§2.0C-1).
- **Nhấp vào tháng trên dải thì tháng bắt đầu của khoảng thời gian cài đặt chuyển sang tháng đó.** Là lối vào khi muốn sửa nội dung của tháng đã cài đặt (bổ sung 2026/09/21). Nếu việc quay lại tạo ra lỗ hổng với khoảng đã xác định thì hiển thị cảnh báo ở trên.
- Hiển thị thường trực → `Tháng cuối cùng đã cài đặt là tháng 1 năm 2027 (còn 5 tháng). Đã xác định (không sửa được) đến tháng 10 năm 2026, có thể thay đổi từ tháng 11 năm 2026 trở đi.` — **Khi còn dưới 2 tháng thì chuyển màu cảnh báo**.
- **Cảnh báo trước chỉ hiển thị trong màn hình** (quyết định 2026/09/21. Cũ: "hiển thị cả ở Dashboard" đã hủy). Hiển thị 2 thứ: **tháng cuối cùng đã cài đặt và số tháng còn lại**, **không tạo thông báo Dashboard**. Vì thiếu sót cài đặt chắc chắn bị chặn tại lối vào công khai menu (§2.0C-3) nên không giữ cơ chế đếm ngày để nhắc nhở.

#### Nội dung hiển thị dưới dải

| Mục | Nội dung |
|---|---|
| Khoảng thời gian cài đặt | `Tháng 8 năm 2026〜tháng 1 năm 2027` (6 tháng gồm cả tháng bắt đầu) |
| A1 lần đầu | `2026-08-03` |
| Đã xác định (không sửa được) | `Tháng 2 năm 2026〜tháng 10 năm 2026` + lý do |
| Nội dung của cài đặt này | Tạm dừng chu kỳ ◯ bản ghi／ngày được coi là ngày lễ giao hàng ◯ ngày／khung không thể xuất hàng theo kho・ngày không thể theo ngày |

### 2.0C Kết nối với công khai menu (chốt 2026/09/14)

> **Về thuật ngữ**: **đã thống nhất thành "chu kỳ giao hàng"** (quyết định 2026/09/21・#20. Cũ: chỉ riêng tài liệu này ghi "chu kỳ nhập giao"). Khớp với cách diễn đạt trên màn hình phía công khai menu. **Tên file `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` giữ nguyên**. Các thông báo lỗi dưới đây được dùng nguyên văn làm cách diễn đạt trên màn hình công khai menu.

#### 1. Giá trị khởi tạo của khoảng thời gian cài đặt (sửa đổi 2026/09/21)

> **Giá trị khởi tạo của tháng bắt đầu là "tháng đầu tiên chưa cài đặt". Tháng+2 không phải là giá trị khởi tạo mà là giới hạn dưới.**

| Tình huống | Tháng bắt đầu khởi tạo |
|---|---|
| **Có lỗ hổng** (khoảng giữa đã xác định và đã cài đặt bị trống) | **Tháng đầu tiên của lỗ hổng** |
| **Không có lỗ hổng** | **Tháng sau tháng cuối cùng đã cài đặt** |
| **Chưa cài đặt gì** (triển khai ban đầu) | **Tháng giới hạn dưới** (= tháng+2) |

- **Giới hạn dưới như trước đây.** **Tháng đã công khai menu không sửa được**, và vì **công khai menu = bắt đầu đặt hàng là ngày 1 của tháng trước** (§5) nên thực tế **tháng hiện tại (đang vận hành giao hàng) và tháng sau (đã công khai) không sửa được**, **giới hạn dưới là tháng+2** (xác nhận 2026/09/18). Tháng hiện tại・tháng sau **không hiển thị trong dropdown tháng bắt đầu・tháng kết thúc**.
- **Tháng kết thúc của khoảng thời gian cài đặt là khoảng 6 tháng gồm cả tháng bắt đầu** (như trước).
- **Khi muốn sửa nội dung của tháng đã cài đặt, nhấp vào tháng đó ở dải §2.0B** thì tháng bắt đầu chuyển sang tháng đó. Nếu việc đưa tháng bắt đầu về trước tạo lỗ hổng với khoảng đã xác định thì hiển thị cảnh báo của §2.0B.
- **Khi khoảng thời gian đối tượng có chứa tháng đã cài đặt thì nêu rõ trong xem trước trước khi lưu.**
  `Khoảng thời gian này có 3 tháng đã cài đặt (2027-02〜2027-04). Lịch giao hàng của các tháng này sẽ được tạo lại.`

> **Vì sao bỏ "tháng+2" (2026/09/21)**: tháng+2 là **tháng đầu tiên có thể sửa** chứ không phải **tháng đầu tiên cần cài đặt**. Nếu lưu khi tháng đã cài đặt nằm trong khoảng đối tượng thì theo quy tắc §2.0A sẽ xóa toàn bộ `draft` và tạo lại, **thậm chí chạy cả re-anchor override đã phê duyệt (hết hiệu lực・đang đề xuất)**. Điều này xảy ra dù không thay đổi gì nên là giá trị khởi tạo nghiêng về phía nguy hiểm. Đồng thời, cảnh báo lỗ hổng ở §2.0B từng yêu cầu thao tác thủ công "hãy đưa tháng bắt đầu về 2026-11", nhưng vì giá trị khởi tạo đã khớp với đó nên không cần hướng dẫn nữa.

**Ví dụ**

| Tình huống | Tháng bắt đầu khởi tạo | Tháng kết thúc khởi tạo |
|---|---|---|
| Đã xác định đến 2026-10, đã cài đặt 2026-12〜2027-05 (**lỗ hổng: 2026-11**) | Tháng 11 năm 2026 | Tháng 4 năm 2027 |
| Đã xác định đến 2026-10, đã cài đặt 2026-11〜2027-04 (không lỗ hổng) | Tháng 5 năm 2027 | Tháng 10 năm 2027 |
| Thời điểm tháng 8 năm 2026・menu tháng 9 năm 2026 đang công khai và **chưa cài đặt** | Tháng 10 năm 2026 (giới hạn dưới) | Tháng 3 năm 2027 |

#### 2. Kiểm soát chỉnh sửa khoảng thời gian cài đặt

Các tháng thuộc những điều kiện sau **không thể chỉnh sửa bất kể quyền của người dùng**.

| Điều kiện không thể chỉnh sửa | Lý do |
|---|---|
| Tháng hiện tại đang vận hành giao hàng | Vì xuất hàng・giao hàng đã vận hành |
| Tháng đã công khai menu | Vì ngày giao mà doanh nghiệp đang xem sẽ bị thay đổi |
| Tháng đã bắt đầu xử lý nhận đơn hoặc giao hàng | Vì tiền đề của đơn hàng đã xác định bị phá vỡ |

- Tháng không thể chỉnh sửa **không hiển thị trong dropdown khoảng thời gian cài đặt** (chốt 2026/09/14. Không để ở trạng thái vô hiệu hóa mà loại khỏi lựa chọn).
- **Cũng không hiển thị ở tab tháng của lịch** (sửa đổi 2026/09/18). Chỉ hiển thị **các tháng của khoảng thời gian cài đặt (tháng bắt đầu〜tháng kết thúc)**. Trước đây xếp tháng không sửa được thành `🔒 Tháng 10 năm 2026 Menu đã công khai・không sửa được`, nhưng **nếu xếp các tháng không chọn được thì không đọc ra được phạm vi có thể cài đặt** nên không hiển thị. Lý do không sửa được được đặt thành 1 dòng bên dưới ô chọn khoảng thời gian ("Tháng hiện tại đang vận hành giao hàng và tháng đã công khai menu không thể thay đổi nên không hiển thị ở lựa chọn cũng như lịch").
- Khi thay đổi tháng bắt đầu mà tháng đang chọn nằm ngoài khoảng thời gian thì **quay về tháng bắt đầu**.
- Hiển thị câu gợi ý giải thích khoảng thời gian có thể cài đặt ở gần ô chọn.
  - Ví dụ hiển thị: `Không thể thay đổi tháng đã công khai menu. Hãy chọn từ tháng 10 năm 2026 trở đi.`
- Ở phía lịch cũng áp dụng cùng kiểm soát. **Hiển thị biểu tượng khóa và lý do ở tab tháng** (ví dụ: `🔒 Tháng 9 năm 2026　Tháng hiện tại đang vận hành giao hàng・không sửa được`), khi mở tháng đó thì hiển thị lý do không sửa được bằng banner, và không chấp nhận thay đổi khả năng giao hàng・khả năng xuất hàng bằng việc nhấp ngày.

#### 3. Kiểm tra cài đặt khi công khai menu

**Trước khi thực hiện công khai thủ công・công khai tự động, kiểm tra xem chu kỳ giao hàng của tháng đối tượng công khai đã được cài đặt chưa.** Nếu chu kỳ giao hàng chưa cài đặt hoặc có lỗi tính ngày giao hàng thì **không công khai menu**.

**Trường hợp công khai thủ công**

| Mục | Nội dung |
|---|---|
| Tiêu đề lỗi | Không thể công khai menu |
| Thông báo lỗi | Chu kỳ giao hàng của tháng 9 năm 2026 chưa được cài đặt. Hãy cài đặt chu kỳ giao hàng rồi công khai lại. |
| Nút thao tác | "Cài đặt chu kỳ giao hàng"／"Hủy" |

Khi chọn "Cài đặt chu kỳ giao hàng" thì **chuyển sang màn hình cài đặt chu kỳ giao hàng ở trạng thái đã chỉ định tháng đối tượng**.

**Trường hợp công khai tự động**

- Dừng xử lý công khai và **giữ nguyên menu đối tượng ở trạng thái chưa công khai**.
- Hiển thị trên màn hình quản trị tháng đối tượng và lý do không công khai được.
  - Ví dụ hiển thị: `Menu tháng 9 năm 2026 không được công khai tự động do chu kỳ giao hàng chưa được cài đặt.`
- Nếu có chức năng thông báo cho quản trị viên thì thông báo cùng nội dung.
- **Không dừng việc công khai của các tháng khác** (chỉ bỏ qua tháng đó).

#### 4. Cảnh báo trước

- Không chỉ khi thao tác công khai, mà **cũng hiển thị trạng thái chưa cài đặt ở màn hình chuẩn bị công khai và danh sách menu**.
  - Ví dụ hiển thị: `Lỗi chuẩn bị công khai: Chu kỳ giao hàng của tháng 9 năm 2026 chưa được cài đặt`
- Khi chu kỳ giao hàng chưa cài đặt thì **vô hiệu hóa nút công khai**. Hiển thị lý do vô hiệu hóa và lối dẫn đến màn hình cài đặt chu kỳ giao hàng.

#### 5. Điều kiện phán định đã cài đặt

Phán định là "đã cài đặt" khi các mục bắt buộc sau được lưu và **có thể tính ngày giao hàng của tháng đối tượng một cách bình thường**.

1. Ngày đầu của chu kỳ giao hàng (A1 lần đầu)
2. Chu kỳ giao hàng
3. Cài đặt tạm dừng・không thể xuất hàng bắt buộc
4. Kết quả tính ngày giao hàng của tháng đối tượng

- **Dù có giá trị nhập vào mà có lỗi tính ngày giao hàng thì xử lý như chưa cài đặt**, không cho công khai thủ công và công khai tự động.
- **Tháng bị trống giữa khoảng đã xác định và khoảng thời gian tạo dữ liệu**, và **tháng sau khoảng thời gian tạo dữ liệu** được xử lý là "chưa cài đặt".

### 2.1 Header

| Mục | Nội dung |
|---|---|
| Tên màn hình | Cài đặt chu kỳ giao hàng |
| Thông tin hiển thị | Vai trò (quản trị viên hệ thống), trạng thái xác thực, ngày giờ lưu cuối |
| Chuẩn UI | UI sáng theo màn hình lịch vận hành hiện hành |
| Layout chung | Điều hướng bên trái, breadcrumb・hiển thị quản trị viên ở trên, vùng thao tác nền trắng, nút chính màu xanh |
| Menu được chọn | Quản lý giao hàng ＞ Cài đặt chu kỳ giao hàng |
| Thao tác header | Góc trên bên phải: "Hủy", "Lưu cài đặt" |

#### Layout màn hình

- Hàng trên: khoảng thời gian cài đặt (tháng bắt đầu〜tháng kết thúc) và ngày đầu của chu kỳ giao hàng (A1 đầu tiên).
- Cột trái: tab tháng, lịch tháng, chú giải. Nền ngày thường là màu trắng, chồng hiển thị chu kỳ, ngày được coi là ngày lễ giao hàng, tạm dừng chu kỳ, ngày không thể xuất hàng.
- Cột phải: bảng cài đặt. 3 tab "Ngày lễ・Nghỉ đột xuất", "Tạm dừng chu kỳ", "Không thể xuất hàng". Ở tab "Không thể xuất hàng" chọn 1 kho cần chỉnh sửa và xác nhận khung không thể và ảnh hưởng đến giao hàng theo từng kho. Khi dùng cùng một cài đặt có thể ghi đè đồng loạt bằng "Áp dụng cài đặt này cho 3 kho".
- Cột phải bám theo phía trên để dễ xác nhận khi cuộn màn hình. Với màn hình hẹp thì đặt bên dưới lịch.

#### Giá trị khởi tạo của ngày đầu chu kỳ giao hàng (A1 đầu tiên) (quyết định 2026/09/18)

- Giá trị khởi tạo là **phần tiếp theo của chu kỳ trước**. = **ngày sau D7** của chu kỳ ngay trước kết thúc trước tháng bắt đầu của khoảng thời gian cài đặt.
- Màn hình ghi kèm căn cứ. Ví dụ: `Chu kỳ trước: chu kỳ tháng 10 (2026-09-28 A1 〜 2026-10-25 D7). Tiếp tục từ ngày hôm sau 2026-10-26.`
- **Có thể thay đổi bằng tay.** Khi thay đổi thì chuyển huy hiệu "Phần tiếp theo của chu kỳ trước" thành "Nhập tay", nhắc xác nhận **số ngày chênh lệch so với phần tiếp theo** và xem có phát sinh ngày không tạo lịch trong khoảng giữa hay không (cùng ý với cảnh báo lỗ hổng ở §2.0B).
- Có thể quay về giá trị khởi tạo bằng thao tác "Quay lại phần tiếp theo". Khi đổi tháng bắt đầu, nếu chưa nhập tay thì ngày đầu cũng đi theo.

### 2.2 Tab bên phải — Tạm dừng chu kỳ

#### Định nghĩa mục

| Mục | Kiểu | Bắt buộc | Giải thích |
|---|---|---|---|
| Tên khoảng thời gian | string | ○ | Ví dụ: nghỉ hè, nghỉ Tết, nghỉ Tuần lễ Vàng, nghỉ đột xuất (có gợi ý hỗ trợ nhập) |
| Ngày bắt đầu | date | ○ | |
| Ngày kết thúc | date | ○ | Phải từ ngày bắt đầu trở đi |
| Số ngày | int | Tự động | `Ngày kết thúc － Ngày bắt đầu + 1` |
| Ảnh hưởng đến chu kỳ | Hiển thị cố định | — | "Dừng tiến trình slot" |

#### Đặc tả hoạt động

- **Không gán slot giao hàng** cho các ngày trong khoảng nghỉ (không giao hàng cũng không picking).
- **Cũng không tiêu thụ slot. Slot bị dừng do tạm dừng sẽ được tiếp tục lần lượt từ ngày hôm sau khi hết tạm dừng** (quyết định 2026/09/19). Không tiến sang slot tiếp theo mà tiếp tục từ chỗ đã dừng. Do đó **toàn bộ chu kỳ bị lùi ra sau đúng bằng số ngày tạm dừng và số lần giao hàng không giảm**.

  | Ví dụ: B1＝8/10 (Thứ Hai), B2＝8/11 (Thứ Ba) đã thực hiện. **Tạm dừng 8/12 (Thứ Tư)〜8/14 (Thứ Sáu)** (→ làm tròn thành 7 ngày 8/12〜8/18) | |
  |---|---|
  | 8/12 (Thứ Tư)〜8/14 (Thứ Sáu) | Tạm dừng (không slot・không giao hàng・không picking) |
  | 8/15 (Thứ Bảy)〜8/18 (Thứ Ba) | **Tạm dừng điều chỉnh** (phần 4 ngày chưa đủ 7 ngày. **Trong ví dụ này là trường hợp quản trị viên đặt ngay sau tạm dừng**・"Điều chỉnh độ lệch" bên dưới) |
  | 8/19 (Thứ Tư) | **B3** (slot vốn là 8/12 được tiếp tục ở đây. **Thứ vẫn là Thứ Tư**) |
  | 8/20 (Thứ Năm) | **B4** |
  | 8/21 (Thứ Sáu)・8/22 (Thứ Bảy)・8/23 (Chủ Nhật) | **B5・B6・B7** |
  | 8/24 (Thứ Hai) | **C1** của chu kỳ tiếp theo |

- **Vì không thể lưu nếu tạm dừng không phải là bội số của 7 ngày nên độ lệch cũng là đơn vị 7 ngày, tương ứng giữa slot và thứ không bị lệch** ("Điều chỉnh độ lệch" §2.2・quyết định lần 3 ngày 2026/09/22). Tuần được tạm dừng nguyên vẹn thì tuần sau khi hết tạm dừng tiếp tục với cùng mã tuần.
  Ví dụ: tuần A (8/3〜8/9) → tạm dừng nguyên tuần (8/10〜8/16) → tuần B (8/17〜8/23, B1 là Thứ Hai)
- Khi đăng ký hiển thị việc "không phải đơn vị 7 ngày" và **số ngày điều chỉnh còn thiếu**. **Hệ thống chỉ tính và hiển thị, không tự động chèn** (quyết định lần 3 ngày 2026/09/22・"Điều chỉnh độ lệch" §2.2).
- Khoảng tạm dừng **không phát sinh giao hàng và picking** (xem §4.2・§4.4).
- **Khi tạm dừng chu kỳ trùng với ngày nghỉ (ngày được coi là ngày lễ giao hàng／không thể xuất hàng) trong cùng một ngày thì ưu tiên tạm dừng chu kỳ** (REQ-DL-307). Vì ngày tạm dừng không có slot nên không phán định ngày lễ・không thể xuất hàng.
- Thêm/sửa bằng modal. Xóa ngay từ danh sách.
- Hiển thị KPI: số khoảng tạm dừng / tổng số ngày tạm dừng / số ngày được coi là ngày lễ giao hàng / số ngày không thể xuất hàng / ảnh hưởng đến chu kỳ.

#### Validation

| Điều kiện | Hành vi |
|---|---|
| Chưa nhập một trong tên khoảng thời gian・ngày bắt đầu・ngày kết thúc | Hiển thị lỗi, không thể lưu |
| Ngày kết thúc < ngày bắt đầu | Hiển thị lỗi, không thể lưu |
| Trùng khoảng thời gian | Cho phép (ngày trùng được tính là 1 ngày) |

#### Phân biệt tạm dừng và ngày lễ (quyết định 2026/09/19)

**Điều khách hàng quan tâm nhất là thứ trong tuần**. Trong tạm dừng chu kỳ không giao hàng cũng không picking nên cài đặt này được ưu tiên hơn mọi cài đặt khác.

**Đăng ký bằng cái nào được quyết định theo "cần dời bao nhiêu ngày để giao được".** Không quyết định theo việc nghỉ là nguyên tuần hay một phần.

| Tình huống | Cách đăng ký | Cách tiến của chu kỳ | Ngày giao hàng |
|---|---|---|---|
| Kỳ nghỉ ngắn **dời 1〜2 ngày là giao được** (ngày lễ đơn lẻ, v.v.) | **Ngày được coi là ngày lễ giao hàng** (đăng ký như ngày lễ) | Tiến (tiêu thụ slot) | Chuyển đổi theo "dời sớm hơn・dời muộn hơn" của hợp đồng |
| Kỳ nghỉ dài **phải dời từ 3 ngày trở lên mới giao được** (nghỉ liên tiếp dài・Tết・nghỉ hè) | **Tạm dừng chu kỳ** | **Dừng** (không tiêu thụ slot) | Ngày tạm dừng không giao hàng・không picking, tiếp tục slot đã dừng từ ngày hôm sau khi hết tạm dừng |

**Quy tắc chuyển đổi**

- **"Dời sớm hơn・dời muộn hơn" theo cài đặt của hợp đồng.** Không có hướng đặc biệt dành cho tạm dừng・ngày lễ.
- **Không đặt giới hạn trên về số ngày chuyển đổi trên hệ thống** (như trước). Tìm đến ngày có thể giao, và **nếu dịch chuyển quá 3 ngày so với slot gốc thì đưa ra cần xác nhận** (§4.5).
- "1〜2 ngày／từ 3 ngày" trong bảng trên là **mức hướng dẫn vận hành về việc đăng ký bằng cái nào**, không phải ngưỡng để cắt việc chuyển đổi. Nếu đăng ký kỳ nghỉ dài bằng ngày được coi là ngày lễ giao hàng thì ngày giao dịch chuyển nhiều nên **hãy đăng ký là tạm dừng chu kỳ**.
- Với hợp đồng có không giao ngày lễ là **OFF** thì giao hàng bình thường cả vào ngày được coi là ngày lễ giao hàng (như trước).

**Cách tạm dừng của tạm dừng chu kỳ**

- **Chỉ dừng những ngày đã đăng ký.** Những ngày không tạm dừng được gán slot như bình thường (tuy nhiên slot bị lùi ra sau đúng bằng số ngày tạm dừng・ví dụ ở trên).
- **Số lần giao hàng không giảm.** Vì slot bị dừng chắc chắn được thực hiện sau khi hết tạm dừng nên số lần giao hàng・số lượng plan・thanh toán của chu kỳ đó không đổi.
- **Xác nhận chuyển đổi được thực hiện gộp tại thời điểm đăng ký tạm dừng.** Trong xem trước trước khi lưu hiển thị **khoảng tạm dừng sau khi làm tròn (số ngày điều chỉnh)** và số lịch bị lệch, **chỉ ngoại lệ mới đưa vào "cần xác nhận" riêng lẻ** (§4A-5B). Không bắt xác nhận từng bản ghi một.

#### Điều chỉnh độ lệch — 1 lần tạm dừng phải là bội số của 7 ngày (quyết định 2026/09/19・sửa đổi theo quyết định lần 3 ngày 2026/09/22)

Nếu số ngày tạm dừng không phải bội số của 7 thì tương ứng giữa slot và thứ trong tuần từ đó về sau bị lệch. Điều này được khôi phục bằng **ngày tạm dừng chu kỳ điều chỉnh**.

> **Số ngày thiếu ＝ 7 −（phần dư của số ngày tạm dừng ÷ 7）**　Ví dụ: tạm dừng 3 ngày → thiếu **4 ngày**
> **Hệ thống chỉ tính và hiển thị số ngày thiếu, không tự động chèn** (quyết định lần 3 ngày 2026/09/22).
> **Quản trị viên quyết định vị trí đặt** — ngay sau tạm dừng／rải trong tuần đó／gộp vào cuối tháng, tùy từng trường hợp đều được, và **có thể chỉnh sửa sau**.
> **Không thể lưu ở trạng thái chưa đủ bội số của 7** (khi lưu trả về số ngày thiếu).
> Tạm dừng điều chỉnh giữ bằng `adjust_for_pause_id` **đang bù cho lần tạm dừng nào** (§7).
> **(Cũ: tự động thêm tạm dừng điều chỉnh `7 −（số ngày tạm dừng mod 7）` ngày ngay sau tạm dừng 〈2026/09/19〉. Đã hủy theo quyết định lần 3 ngày 2026/09/22)**

- Vì tạm dừng trở thành 7 ngày liên tiếp (hoặc 14 ngày・21 ngày…) nên **tương ứng giữa slot và thứ không bị lệch**. Trong ví dụ trên `B3` là 8/19 (Thứ Tư), vẫn là Thứ Tư vốn có.
- **Không phải làm tròn theo tuần lịch (bắt đầu từ Thứ Hai).** Tính 7 ngày từ ngày đầu của tạm dừng. Để không lôi vào các ngày đã thực hiện (trong ví dụ là B1＝8/10, B2＝8/11).
- Vì tổng số ngày tạm dừng là bội số của 7 nên **`A1` của chu kỳ tiếp theo cũng vẫn là Thứ Hai**.

| Ví dụ (A1 lần đầu＝2026-08-03 Thứ Hai) | Ngày của `B3` | `A1` tiếp theo |
|---|---|---|
| Không tạm dừng | 8/12 (Thứ Tư) | 8/31 (Thứ Hai)＝ 8/3 + 28 ngày |
| Chỉ tạm dừng 8/12 (Thứ Tư)〜8/14 (Thứ Sáu) (3 ngày) | 8/15 (Thứ Bảy)… **thứ bị lệch** | 9/3 (Thứ Năm)… **không còn là Thứ Hai** |
| Ngay sau đó **tạm dừng điều chỉnh** 8/15 (Thứ Bảy)〜8/18 (Thứ Ba) (4 ngày) | **8/19 (Thứ Tư)** ← đúng thứ | **9/7 (Thứ Hai)** ← vẫn là Thứ Hai |

**Khác biệt theo vị trí đặt (căn cứ phán đoán của quản trị viên. Đề xuất mặc định là "ngay sau")**

Với cả hai phương án, **tổng số ngày giao hàng bị dừng là 7 ngày** và **`A1` tiếp theo cũng giống nhau là 9/7 (Thứ Hai)**. Chỉ khác ở giữa chừng.

| | Ngày giao hàng bị dừng | Slot của 8/15〜8/27 |
|---|---|---|
| Thêm vào cuối tháng | 8/12〜8/14 ＋ 8/28〜8/31 | **Vẫn lệch 3 ngày** (`B4` rơi vào Chủ Nhật, `A6`・`A7` rơi vào Thứ Tư・Thứ Năm) |
| **Thêm ngay sau (đề xuất mặc định)** | 8/12〜8/18 (7 ngày liên tiếp) | **Không lệch** (`B3`＝8/19 Thứ Tư, về sau luôn đúng thứ) |

- Nếu số ngày dừng giống nhau thì **không nên tạo khoảng thời gian bị lệch**. Nếu giữ trạng thái lệch thì phán định khung không thể xuất hàng・phán định ngày không thể giao theo thứ của hợp đồng・hiển thị lịch doanh nghiệp・ngày ứng viên của yêu cầu thay đổi・ngưỡng số bản ghi đều cần xử lý ngoại lệ. Vì vậy **mặc định đề xuất "ngay sau"**, tuy nhiên trong trường hợp không muốn dừng bằng điều chỉnh vào ngày kho thực tế đang hoạt động, v.v. thì **quản trị viên có thể dịch sang ngày khác** (quyết định lần 3 ngày 2026/09/22).
- **Giữ được thứ trong tuần mà khách hàng quan tâm nhất.** Cơ sở giao Thứ Năm chỉ chuyển sang Thứ Năm tuần sau, không có chuyện hàng đến vào Chủ Nhật.

**Vận hành và màn hình**

- **Hệ thống chỉ tính và hiển thị số ngày thiếu** ("8/12〜8/14 (3 ngày) không phải đơn vị 7 ngày. Hãy đặt thêm 'điều chỉnh' cho 4 ngày nữa"). **Không tự động chèn, vị trí đặt do vận hành quyết định** (quyết định lần 3 ngày 2026/09/22).
- **Không thể lưu ở trạng thái chưa đủ bội số của 7.** Khi lưu trả về số ngày thiếu. Ngày của điều chỉnh có thể chỉnh sửa về sau nếu chu kỳ chưa được xác định.
- Ngày tạm dừng điều chỉnh để phân biệt với tạm dừng thông thường, đặt phân loại của tên khoảng thời gian là **"Điều chỉnh"**, giữ bằng `adjust_for_pause_id` việc bù cho lần tạm dừng nào, và cũng hiển thị điều đó trên lịch.
- Những ngày thực tế không nghỉ (trong ví dụ là 8/15〜8/18) cũng sẽ không xuất hàng. **Nếu muốn xuất hàng vào ngày đó thì dịch ngày điều chỉnh sang ngày khác** (quyết định lần 3 ngày 2026/09/22. Nhờ vậy vấn đề chưa quyết của §8 cũ "vận hành khi muốn xuất hàng vào ngày bị dừng do điều chỉnh" đã được giải quyết). **(Cũ: từng xem xét phương án dựng bằng "ngày được coi là ngày lễ giao hàng ＋ ngày không thể xuất hàng của kho" thay vì tạm dừng chu kỳ)**

### 2.3 Lịch・cài đặt ngày hoạt động

#### Điều kiện tạo

- Tất cả lịch tháng trên màn hình hiển thị bắt đầu từ Thứ Hai (Thứ Hai〜Chủ Nhật).
- Nhập・định dạng hiển thị ngày của A1 lần đầu thống nhất `YYYY-MM-DD`.
- Cũng hiển thị các ngày của tháng khác nằm trước và sau lịch tháng, phân biệt với tháng hiện tại bằng màu xám nhạt.
- Nền ngày thường cơ bản là màu trắng, tạm dừng・ngày được coi là ngày lễ giao hàng・không thể xuất hàng được biểu thị kín đáo bằng màu nền nhạt và viền.

| Mục | Kiểu | Giá trị mặc định | Giải thích |
|---|---|---|---|
| A1 lần đầu (ngày đầu chu kỳ) | date | 2026-08-03 | Ngày này trở thành `A1` của chu kỳ đầu tiên. **Cố định thứ trong tuần là Thứ Hai** (quyết định 2026/09/12. Sửa đổi "bắt đầu Chủ Nhật" của REQ-DL-203). Nếu nhập ngày không phải Thứ Hai thì **làm tròn về Thứ Hai ngay trước** để tạo và hiển thị kết quả làm tròn trên màn hình |
| Khoảng thời gian tạo dữ liệu Tháng bắt đầu | YYYY-MM | 2026-08 | |
| Khoảng thời gian tạo dữ liệu Tháng kết thúc | YYYY-MM | 2027-01 | Xác định **tối đa 6 tháng từ tháng bắt đầu** (quyết định 2026/09/12. Sửa đổi "tối đa 12 tháng" của REQ-DL-306). Ngày bắt đầu từ tháng này trở đi. Khi vượt quá thì làm tròn về tháng bắt đầu+5 tháng và hiển thị thông báo. Phạm vi cho doanh nghiệp xem・phạm vi có thể yêu cầu cũng thống nhất theo 6 tháng này |
| Dữ liệu ngày lễ | Chỉ hiển thị | — | Hiển thị ngày lễ đã đăng ký trong hệ thống và số bản ghi trong khoảng thời gian đối tượng. Không có thao tác nhập CSV・API bên ngoài |

#### Định nghĩa ngày được coi là ngày lễ giao hàng

```
Ngày được coi là ngày lễ giao hàng = Ngày lễ đã đăng ký trong hệ thống (mặc định ON) ＋ Ngày bật ON ở ngày nghỉ thủ công
                   － Ngày tắt OFF bằng Override theo ngày
```

- **Không phán định tự động theo thứ trong tuần** (vì kho hầu như không nghỉ). Việc có thể hay không vào thứ Bảy・Chủ Nhật được kiểm soát bằng "ngày không thể nhận hàng" ở phía hợp đồng.
- Tự động hiển thị ngày lễ đã đăng ký trong hệ thống và mặc định "ngày lễ giao hàng" là ON. Có thể đổi từng ngày sang OFF.
- Ngày được coi là ngày lễ giao hàng không phải là không thể giao hàng đồng loạt toàn công ty. Chỉ các công ty có "không giao ngày lễ" của hợp đồng ở trạng thái ON mới chuyển đổi ngày giao hàng.
- Với công ty có "không giao ngày lễ" là OFF thì vẫn giao hàng bình thường vào ngày đó.
- Ngày nghỉ thủ công ngoài tên ngày nghỉ + ngày còn chọn riêng "ngày lễ giao hàng" và "không thể xuất hàng" để thêm. Bắt buộc ít nhất một trong hai.

#### Định nghĩa ngày không thể xuất hàng

```
Ngày không thể xuất hàng = Ngày thuộc khung chu kỳ không thể xuất hàng ＋ Ngày bật ON không thể xuất hàng theo ngày
           － Ngày Override hoạt động riêng lẻ
```

- Từ 28 slot (A1〜D7), có thể chọn nhiều khung không thể xuất hàng lặp lại ở mọi chu kỳ giao hàng theo từng kho. Vì slot là **tuần × thứ** nên có thể đọc như `A6`＝Thứ Bảy của tuần A, `B5`＝Thứ Sáu của tuần B. **Có thể thay đổi hoạt động・nghỉ theo từng tuần dù cùng một thứ** là ưu điểm của cách này, điều mà chỉ chỉ định thứ không biểu thị được.
- Trên màn hình, nút khung không thể ghi kèm thứ (như `A6 Thứ Bảy`).
- Kho cần chỉnh sửa chọn từng kho một. Khi cần, có thể ghi đè đồng loạt khung không thể của kho đang chỉnh sửa cho tất cả kho bằng "Áp dụng cài đặt này cho 3 kho".
- Khung không thể mặc định là **A6・A7, B4〜B7, C6・C7, D4〜D7** (sửa đổi 2026/09/18. Ngoài thứ Bảy・Chủ Nhật hằng tuần, **tuần B・D cũng không xuất hàng Thứ Năm・Thứ Sáu**). Demo cũng lấy giá trị này làm giá trị khởi tạo. Các kho khác giữ điều kiện hoạt động theo từng kho.
- Với giá trị mặc định này, **khung không thể giao hàng** được phán định tự động là **A1・B1・C1・D1 (Thứ Hai hằng tuần)**. Vì là khung ngay sau các khung không thể xuất hàng liên tiếp; cần xác nhận trong vận hành rằng nếu giữ giao hàng Thứ Hai thì ngày picking sẽ được dời sớm về tuần trước tương ứng.
- **Khung ngay sau các khung không thể xuất hàng liên tiếp được phán định tự động là khung không thể giao hàng.** Ranh giới chu kỳ được phán định tuần hoàn (sau D7 là A1).
- Khung không thể giao hàng được phán định tự động từ cài đặt mặc định là **A1・B1・C1・D1**. Đây không phải giá trị cố định mà được tính lại theo thay đổi của khung không thể xuất hàng.
- Ngoài khung cơ bản, tính "ứng viên không thể giao hàng" cho khung giao hàng mà khung picking lùi về theo lead time của hợp đồng thành không thể.
- Hiển thị "Ảnh hưởng đến giao hàng (phán định tự động)" ở tab "Không thể xuất hàng", cho phép xác nhận tách biệt "khung không thể giao hàng cơ bản" và "ứng viên bổ sung theo lead time 1 ngày・2 ngày・3 ngày".
- Ở phần chọn Slot giao hàng của hợp đồng doanh nghiệp, ngoài khung không thể giao hàng cơ bản còn không cho chọn các ứng viên ứng với lead time thực tế của hợp đồng đó, và hiển thị lý do "Không thể giao hàng do quy tắc không thể xuất hàng".
- Ngày không thể xuất hàng riêng lẻ, khoảng tạm dừng chu kỳ, ngày không thể giao theo thứ của công ty, cài đặt không giao ngày lễ được đánh giá sau khi xác định ngày và dùng cho phán định cuối cùng khi tạo lịch.
- **Khung không thể xuất hàng và ngày không thể xuất hàng theo ngày được cài đặt ở màn hình này (01)** (quyết định 2026/09/14. Sửa lại "quản lý ở Master kho" của 9/13). Vì khung là **slot chu kỳ** chứ không phải ngày nên nếu không cài đặt trên lịch thì không thể xác nhận "ngày nào bị dừng". Chuyển kho bằng **tab kho** để cài đặt.
- Phân tách là **"những gì liên quan đến lịch・ngày thì ở cài đặt chu kỳ, thuộc tính của chính kho thì ở Master kho"**. **Ngưỡng số bản ghi・lead time chỉ thị xuất hàng・liên kết Thomas giữ ở Master kho** (vì là giá trị năng lực của kho không liên quan đến ngày). Lead time được quản lý ở phân loại giao hàng của hợp đồng (§2.3A).
- **Người đăng ký là bộ phận vận hành** (kho không có màn hình trong hệ thống).
- **Khung không thể xuất hàng chỉ có 1 cho mỗi kho.** (chốt 2026/09/14. "Bộ (set)" đã bãi bỏ) Các khung đã chọn áp dụng cho **toàn bộ khoảng thời gian cài đặt**.
  - Nếu ngày hoạt động trong tuần thay đổi giữa kỳ thì **thay đổi ở khoảng thời gian cài đặt tiếp theo** hoặc chỉ định riêng bằng **ngày không thể xuất hàng theo ngày**.
  - Không lo lôi vào lịch quá khứ. Vì tháng đã vào vận hành trở thành **đã xác định (không sửa được)** (§2.0C-2).
- **Ngày không thể xuất hàng theo ngày có thể đăng ký theo khoảng ngày bắt đầu〜ngày kết thúc** (đăng ký kiểm kê 3 ngày trong 1 bản ghi).
- **Khi lưu hiển thị xem trước số bản ghi ảnh hưởng.** Nêu "Số bản ghi tự động tạo lại (draft) N／Số bản ghi tự động dời sớm N／Số bản ghi đã thỏa thuận với doanh nghiệp (override đã phê duyệt) N (kèm chi tiết áp dụng・hết hiệu lực・đang đề xuất)／Số bản ghi không thể dời sớm N／**Số bản ghi đã chỉ thị xuất hàng (locked・không thể thay đổi) N**", xác nhận rồi mới lưu (§4A-5B).
- Ngày không thể theo ngày (kiểm kê・kiểm tra thiết bị, v.v.) **được giữ theo từng kho**. Ngày kiểm kê của một kho không làm dừng picking của kho khác.
- Việc kho nào nghỉ vào ngày lễ cũng được cài đặt ở màn hình này. Có thao tác đăng ký gộp ngày lễ của khoảng thời gian đối tượng thành ngày không thể.
- Khoảng tạm dừng chu kỳ và ngày được coi là ngày lễ giao hàng **vẫn là chung toàn công ty**. Vì bản thân chu kỳ giao hàng (28 slot) là chung toàn công ty nên ngày nghỉ của từng kho được biểu thị bằng khung không thể xuất hàng・ngày không thể.
- Ngày kiểm kê・kiểm tra thiết bị ngoài khung không thể được thêm/xóa bằng ngày + lý do từ ô chuyên dụng.
- Khi xuất hàng tạm thời vào khung không thể, có thể cài đặt Override hoạt động riêng lẻ từ bảng cài đặt của ngày được chọn.
- **Ngày không thể xuất hàng cũng được dùng làm đối tượng chuyển đổi ngày giao hàng** (sửa đổi 2026/09/21. Cũ: "không dùng trực tiếp cho việc chuyển đổi ngày giao hàng đã xác định"). Khi ngày picking tính ngược rơi vào ngày không thể xuất hàng thì trước hết dời sớm ngày picking, nếu không gói gọn trong chênh lệch 0 với lead time hợp đồng thì **cũng chuyển đổi cả ngày giao hàng** (§4.4・§4A-5B). Khung không thể giao hàng được phán định tự động từ khung chu kỳ không thể cố định thì vẫn dùng như trước cho kiểm soát lựa chọn khi tạo mới・thay đổi hợp đồng doanh nghiệp.
- Trường hợp ngoại lệ theo đơn vị ngày không phán định được lúc cài đặt hợp đồng mà ngày picking tính ngược thành không thể thì dời sớm đến ngày có thể xuất hàng trước đó. Nếu không tìm thấy trong phạm vi cho phép thì cảnh báo "không thể tạo lịch".
- "Ngày lễ giao hàng" là chung toàn công ty, "không thể xuất hàng (picking)" theo từng kho (cài đặt ở tab kho), độc lập với nhau. Trong cùng một ngày có thể chỉ một bên hoặc cả hai cùng bật.
- Khung không thể xuất hàng và ngày không thể xuất hàng theo ngày được giữ theo từng kho. Phán định bằng cài đặt của kho được gán cho hợp đồng・lịch.
- **Không có kho thay thế** (quyết định 2026/09/13). Khi kho được gán không thể xuất hàng cũng không tự động chuyển sang kho khác mà **đưa ra "cần xác nhận" để vận hành phán đoán riêng lẻ**. Nếu cần xuất từ kho khác thì đổi kho ở phân loại giao hàng của hợp đồng, hoặc sao chép dữ liệu giao hàng và đổi kho để xử lý.
- **Khi đổi kho của hợp đồng thì phản ánh từ tháng áp dụng** (quyết định 2026/09/12). Không thay đổi lịch・dữ liệu giao hàng trước tháng áp dụng. **Đơn vị tháng áp dụng là tháng chu kỳ**, và chuyển đổi **từ A1 của chu kỳ đó** (xác nhận 2026/09/19). Không phải ngày 1 của tháng dương lịch.

#### Cách giữ việc không thể xuất hàng — chu kỳ chỉ có 1 (quyết định 2026/09/19)

**Không giữ riêng chu kỳ xuất hàng và chu kỳ giao hàng.** Không tạo chu kỳ chuyên dụng cho picking, việc không thể xuất hàng cũng được giữ trên **cùng lưới `A1`〜`D7`** với giao hàng.

| | Áp dụng | Lý do |
|---|---|---|
| **Giữ việc không thể xuất hàng bằng cùng khung chu kỳ (A1〜D7) và phán định bằng chính khung của ngày picking** | ○ | Cài đặt và phán định nằm trên cùng một trục. Xác nhận được ngay trên lịch |
| Giữ bằng lịch (thứ trong tuần) ＋ "thứ không thể xuất hàng cho phần giao ở tuần B・tuần D" | ✕ | Thành dạng quyết định thứ xuất hàng từ tuần giao hàng, cách đọc bị kép. Có cảm giác khó chịu nên không áp dụng |
| Giữ thêm 1 chu kỳ chuyên dụng cho xuất hàng | ✕ | Nếu có 2 chu kỳ thì phải quản lý cả ngày đầu・tạm dừng・độ lệch slot ở cả hai |

- **Phán định theo khung của ngày picking.** Không quyết định ngược từ khung của ngày giao hàng mà xem ngày ra từ `ngày giao hàng − lead time` thuộc khung nào có không thể xuất hàng hay không (§4.3 `isPickClosed`).
- **Việc tuần B・D không xuất hàng đến cả Thứ Năm・Thứ Sáu là vì số lượng giao hàng của tuần đó ít và kho nghỉ cách tuần** (lý do nhân sự・công việc). Giữ theo tuần × thứ chứ không theo thứ là để biểu thị được ngày nghỉ cách tuần này.
- **Không cố định Chủ Nhật là không thể xuất hàng.** Việc `A7`〜`D7` (Chủ Nhật) nằm trong khung không thể mặc định là **giá trị mặc định chứ không phải giá trị cố định**. Ở mọi nơi trong màn hình・phán định không quyết định cứng từ thứ trong tuần mà luôn xem khung đã cài đặt (§5.3).

#### Cách xử lý dữ liệu ngày lễ (chi tiết ở §6)

| Mục | Nội dung |
|---|---|
| Dữ liệu | Dữ liệu ngày lễ đã đăng ký trong hệ thống |
| Nhập từ bên ngoài | **Tự động lấy 1 lần/năm từ API ngày lễ công khai ＋ "Lấy lại ngày lễ"** (thay đổi 2026/10/01. Cũ: không có chức năng nhập CSV của Văn phòng Nội các・API bên ngoài) |
| Hiển thị màn hình | Số ngày lễ và danh sách ngày lễ của khoảng thời gian đối tượng |

#### Lịch theo tháng

Chuyển từng tháng của khoảng thời gian tạo dữ liệu bằng tab. Tab hiển thị số ngày được coi là ngày lễ giao hàng và số ngày không thể xuất hàng của tháng hiện tại.

Trạng thái của ô có 7 loại sau.

| Trạng thái | Hiển thị | Ý nghĩa |
|---|---|---|
| Ngày giao hàng | Màu của tuần (A xanh dương/B xanh lá/C vàng/D tím) ＋ tên chu kỳ + mã slot | Ngày có thể giao hàng thông thường |
| Ngày đầu chu kỳ | Như trên + đường kẻ nhấn ở mép trái | `A1` của chu kỳ đó |
| Tạm dừng chu kỳ giao hàng | Nền vàng + tên khoảng thời gian + "Tạm dừng chu kỳ" + **"Vốn là 〈khung〉"** | Không gán slot. Không giao hàng. Cho biết khung được quyết định bằng **tuần × thứ** nên số không lệch do tạm dừng, kèm ngày đó vốn là khung nào (ví dụ: `Vốn là C5`) (bổ sung 2026/09/18) |
| Ngày được coi là ngày lễ giao hàng | Nền đỏ + tên ngày lễ + "Được coi là ngày lễ giao hàng" | Chỉ hợp đồng không giao ngày lễ mới chuyển đổi ngày giao hàng. Các hợp đồng khác giao bình thường |
| Ngày không thể xuất hàng | Nền tím + khung nét đứt + "Không thể xuất hàng" | Trước hết dời sớm picking tương ứng. Nếu không gói gọn trong chênh lệch 0 thì **cũng chuyển đổi cả ngày giao hàng** (sửa đổi 2026/09/21) |
| Cả hai ON | Nền chia đỏ／tím + "Ngày lễ giao hàng・Không thể xuất hàng" | Áp dụng độc lập phán định giao hàng theo hợp đồng và phán định xuất hàng toàn công ty |
| Override coi là ngày lễ | Nền xanh lá + viền xanh dương + "Override coi là ngày lễ" | Ngày không coi ngày lễ công khai là ngày lễ giao hàng |
| Ngoài đối tượng tạo | Gạch chéo + "Ngoài đối tượng tạo" | Trước A1 lần đầu hoặc ngoài khoảng thời gian đối tượng |

- Khi nhấp vào ô ngày của lịch sẽ ở trạng thái được chọn và hiển thị trạng thái của ngày đó ở bảng "Cài đặt của ngày được chọn" bên phải. Chỉ nhấp ngày thì không thay đổi cài đặt.
- Bảng bên phải hiển thị "Có thể／Không thể giao hàng" và "Có thể／Không thể xuất hàng" thành 2 thao tác độc lập. Mỗi nút thay đổi chỉ chuyển trạng thái của đối tượng và tính lại ngay toàn màn hình.
- Ngày được chọn được nhấn mạnh bằng đường viền xanh dương. Ngày được coi là ngày lễ giao hàng hiển thị màu đỏ, không thể xuất hàng màu tím, cả hai ON nền chia đỏ／tím.
- Tóm tắt tháng hiện tại ở header (ngày lễ giao hàng / không thể xuất hàng / tạm dừng / tổng số ngày).

#### Lưu

`Lưu cài đặt` xác định cài đặt chung toàn công ty và hiển thị modal thành công (số khoảng tạm dừng・số tháng đối tượng・số chu kỳ được tạo・A1 lần đầu).

---

### 2.3A Danh sách mục của Master kho (chốt 2026/09/14)

Dùng nguyên màn hình **Master điểm trung chuyển** hiện có làm khung, và phân chia hiển thị theo **phân loại kho**.

> **Tên giữ nguyên là "Master kho".** Không dùng "Master cơ sở" vì dễ nhầm với "cơ sở" chỉ nơi giao hàng của hợp đồng. Điểm trung chuyển là **văn phòng của công ty vận chuyển** như Yamato・Sagawa nhưng được quản lý chung trong master này như điểm trung gian của tuyến giao hàng.

Chú giải: **◎** Bắt buộc／**○** Tùy chọn／**—** Không có

#### Thông tin cơ bản

| # | Mục | Hình thức nhập | Picking | Trung chuyển | Giải thích |
|---|---|---|---|---|---|
| 1 | ID kho | Đánh số tự động・chỉ đọc | ◎ | ◎ | **Tiền tố khác nhau theo phân loại kho**. Kho picking＝`WH00001`, điểm trung chuyển＝`HU00001` (kế thừa nguyên ID điểm trung chuyển hiện có・quyết định 2026/09/14). **[Tạm thời] `HU` ＝ Hub (điểm trung chuyển)**. **Chỉ dùng ID nội bộ, không dùng ở phiếu gửi hàng・liên kết CSV・biểu mẫu** (2026/09/21・chờ vận hành xác nhận) |
| 2 | Tên kho | Văn bản | ◎ | ◎ | |
| 3 | **Tên kho (cho phiếu)** | Văn bản | ◎ | ◎ | Tên hiển thị ở **nơi xuất hàng của phiếu gửi hàng** |
| 4 | Kana | Văn bản | ○ | ○ | Dùng để tìm kiếm. Điểm trung chuyển có nhiều bản ghi nên gần như bắt buộc |
| 5 | **Phân loại kho** | Chọn (Picking／Trung chuyển／**Nơi trả hàng**) | ◎ | ◎ | **Giá trị này phân chia hiển thị các phần dưới đây. Không thể thay đổi sau khi đăng ký** (chỉ đọc・"Luồng đăng ký mới" bên dưới). **Nơi trả hàng (`return`) là nơi gửi trả hàng còn lại (trụ sở, v.v.), chỉ dùng làm nơi giao hàng của sao chép "trả hàng"** (bổ sung 2026/09/29 [quyết định v2.3 #41]. Chỉ có thông tin cơ bản 〈địa chỉ・điện thoại, v.v.〉). **Điểm trung chuyển cũng có thể đăng ký cơ sở của công ty vận chuyển ủy thác** ([quyết định v2.3 #50]) |
| 6 | **Phân loại vận chuyển** | Chọn (Master công ty vận chuyển) | — | ◎ | Công ty vận chuyển **đang vận hành** điểm trung chuyển đó (Yamato Transport・Sagawa Express, v.v.) |
| 7 | **Trạng thái** | Chọn (**Hiệu lực／Vô hiệu／Đã xóa**) | ◎ | ◎ | **Thay đổi 2026/09/14** (từ đăng ký tạm／đăng ký chính thức). Chi tiết ở "Cách xử lý trạng thái" bên dưới |
| 8 | **Mã kho** | Văn bản | ◎ | — | **Mã của công ty dùng cho chỉ thị xuất hàng đến Thomas**. **[Tạm thời] dùng nguyên ID kho (dạng `WH00001`) làm mã liên kết** (2026/09/21). Khi biết hệ mã của phía Thomas sẽ thay thế (chờ vận hành・vendor xác nhận) |
| 9 | **Mã văn phòng** | Văn bản | — | ◎ | **Mã văn phòng của công ty vận chuyển. Hiển thị ở phiếu gửi hàng** (ví dụ `1234567`). Là giá trị được cấp, có thể thay đổi |
| 10 | Mã bưu điện | Văn bản | ◎ | ◎ | |
| 11 | Tỉnh/thành phố | Chọn | ◎ | ◎ | Trở thành khóa tìm kiếm của điểm trung chuyển |
| 12 | Quận/huyện | Văn bản | ◎ | ◎ | |
| 13 | Khu vực・số nhà | Văn bản | ◎ | ◎ | |
| 14 | Tòa nhà・số phòng | Văn bản | ○ | ○ | |
| 15 | Số điện thoại | Văn bản | ◎ | ◎ | |
| 16 | Số FAX | Văn bản | ○ | ○ | |
| 17 | Ghi chú | Văn bản | ○ | ○ | |

#### Người phụ trách (nhiều dòng・**tất cả đều tùy chọn**)

Vận hành cài đặt thủ công. Có thể lưu dù không có đăng ký (quyết định 2026/09/14).

| # | Mục | Hình thức nhập | Picking | Trung chuyển |
|---|---|---|---|---|
| 18 | Phân loại (Chính／Phụ) | Chọn | ○ | ○ |
| 19 | Tên người phụ trách | Văn bản | ○ | ○ |
| 20 | Furigana | Văn bản | ○ | ○ |
| 21 | Địa chỉ email | Văn bản | ○ | ○ |
| 22 | TEL | Văn bản | ○ | ○ |

#### Điều kiện xử lý (chỉ kho picking)

| # | Mục | Hình thức nhập | Giải thích |
|---|---|---|---|
| 23 | Ngưỡng số bản ghi | Số (**mặc định 300**) | Chỉ cảnh báo ngày vượt quá, không dừng xử lý. Vận hành điều chỉnh thủ công. **Giao hàng vật tư không tính vào số bản ghi** (vì gửi thẳng từ kho cho Yamato・quyết định 2026/09/19) |
| 24 | Lead time chỉ thị xuất hàng | Số (**mặc định 3**) | **Chỉ thị xuất hàng gộp dữ liệu 2 tuần sẽ được ra trước ngày bắt đầu của khoảng thời gian đối tượng bao nhiêu ngày** (sửa đổi 2026/09/19. Mặc định 3 ngày trước＝Thứ Sáu. Cũ: 1 ngày trước ngày picking). **Là điểm khởi đầu của `locked`** |
| 25 | Cách xử lý ngày không thể xuất hàng | Hiển thị cố định | **Không có kho thay thế.** Không tự động chuyển đổi mà "cần xác nhận" (§4C) |

> **Khung không thể xuất hàng và ngày không thể xuất hàng theo ngày không có ở đây (thay đổi 2026/09/14).** Khung là **slot chu kỳ** chứ không phải ngày nên nếu không cài đặt trên lịch thì không thể xác nhận kết quả. Cài đặt ở **tab kho của Cài đặt chu kỳ giao hàng (màn hình 01)**. Những gì giữ lại ở Master kho chỉ là **giá trị năng lực của kho** không liên quan đến ngày (ngưỡng số bản ghi・lead time chỉ thị xuất hàng) và liên kết.
>
> Vì khi thêm mới kho thì khung không thể xuất hàng ở trạng thái chưa cài đặt nên **hiển thị "Khung không thể xuất hàng: chưa cài đặt" trong danh sách kho và dẫn sang màn hình 01**.

#### Liên kết (chỉ kho picking)

| # | Mục | Giải thích |
|---|---|---|
| 26 | Đơn vị xuất CSV chỉ thị xuất hàng | **Theo kho**・định dạng theo chuẩn Thomas |
| 27 | Hủy chỉ thị xuất hàng | **Không có hủy. Ghi đè bằng gửi lại có số phiên bản, dừng thì gửi lại với số lượng 0** (§4D-3) |
| 28 | Hạn chót gửi lại | **Đến khi nhận kết quả xuất hàng của giao hàng đó** (quyết định lần 3 ngày 2026/09/22). **Hệ thống không giữ giờ bắt đầu picking của kho**. **(Cũ: đến trước khi bắt đầu picking. Giờ bắt đầu cần xác nhận với kho・vendor)** |

> **Master kho không giữ lead time (quyết định 2026/09/14).** Lead time được quản lý ở **phân loại giao hàng của hợp đồng** (khác biệt theo nhóm nhiệt độ cũng ở phía hợp đồng). Kèm theo đó, "lead time theo khu vực", "khu vực", "ngày dự kiến đóng cửa" của phiên bản cũ đã bị xóa. Việc đóng cửa được biểu thị bằng trạng thái của #7 (Hiệu lực／Vô hiệu).

#### Cách xử lý trạng thái (chốt 2026/09/14)

| Trạng thái | Nơi gán của hợp đồng | Lịch・dữ liệu giao hàng hiện có | Danh sách | Có khôi phục được không |
|---|---|---|---|---|
| **Hiệu lực** | Hiển thị | Như bình thường | Hiển thị theo mặc định | — |
| **Vô hiệu** (đã dừng sử dụng) | Không hiển thị | **Không di chuyển.** Hoàn tất đến xuất hàng・giao hàng như cũ | Mặc định ẩn. Hiển thị bằng bộ lọc | Khôi phục được |
| **Đã xóa** (đăng ký nhầm・trùng lặp) | Không hiển thị | **Không di chuyển** | Chỉ hiển thị khi "Bao gồm đã xóa" | Chỉ quản trị viên vận hành・bắt buộc có lý do |

- **Không xóa vật lý.** Giữ lại bản ghi để có thể tra tên kho từ dữ liệu giao hàng quá khứ.
- **Chỉ xóa được khi số lịch・dữ liệu giao hàng tham chiếu kho đó là 0.** Nếu có dù chỉ 1 bản ghi thì hiển thị số lượng và nhắc "Có vô hiệu hóa không".
- **Không tái sử dụng ID đã xóa** (không gán lại `HU00042` cho văn phòng khác).
- Vô hiệu hóa・xóa đều **bắt buộc nhập lý do** và lưu vào lịch sử thay đổi (§11-2).
- Hiển thị trong danh sách các hợp đồng vẫn còn lịch ở kho đã vô hiệu hóa, và **vận hành thay đổi thủ công**.
- **Không có đăng ký tạm.** Văn phòng chưa dùng (trước khi bắt đầu sử dụng, v.v.) đăng ký ở trạng thái "Vô hiệu", khi dùng thì chuyển sang Hiệu lực.

#### Luồng đăng ký mới (chốt 2026/09/14)

Nút thêm là **một nút "＋ Thêm kho"**. Sau khi nhấn, chen **bước chọn phân loại kho** rồi mới hiển thị form.

```
［＋ Thêm kho］ → Chọn phân loại kho (Kho picking／Điểm trung chuyển) → Form theo phân loại
```

- **Mặc định chọn sẵn "Điểm trung chuyển"** (quyết định 2026/09/14). Vì việc đăng ký văn phòng có nhiều bản ghi hơn nên cứ tiếp tục là đăng ký điểm trung chuyển.
- Ở màn hình chọn phân loại, **ghi kèm mục bắt buộc và tiền tố ID của từng loại** (để tránh chọn nhầm).
- **Không hiển thị form cho đến khi chọn phân loại** (không cho xem form trống).
- **Phân loại kho được xác định khi đăng ký và chỉ đọc ở màn hình chỉnh sửa.** Vì tiền tố ID được quyết định theo phân loại nên không thể đổi sau. Nếu chọn nhầm thì nếu tham chiếu là 0 thì xóa rồi đăng ký lại, nếu có dù chỉ 1 bản ghi thì vô hiệu hóa và đăng ký mới.
- Khi đăng ký gộp điểm trung chuyển thì dùng **nhập CSV** của danh sách chứ không dùng lối này.

#### Tab

Thông tin cơ bản／Lịch sử thay đổi (cả hai phân loại).

#### Yêu cầu của màn hình danh sách (vì điểm trung chuyển có nhiều)

Điểm trung chuyển **hiện có khoảng 300 bản ghi** (văn phòng Yamato) và sau này sẽ thêm **văn phòng Sagawa**. Nhập tay từng bản ghi・chọn bằng pulldown là không khả thi.

- Danh sách có **tìm kiếm (tên kho・kana・mã văn phòng・tỉnh/thành phố)／lọc theo phân loại kho・phân loại vận chuyển／phân trang**
- Có **nhập・cập nhật hàng loạt bằng CSV**. Vì mã văn phòng được công ty vận chuyển cấp và có thể thay đổi nên cho phép cập nhật bằng nhập
- Khi chọn điểm trung chuyển ở phân loại giao hàng của hợp đồng cũng dùng **dạng tìm kiếm** (không dùng pulldown)

### 2.3B Điểm khác nhau giữa kho và trung chuyển (tổng hợp)

| | Kho picking | Điểm trung chuyển |
|---|---|---|
| ID | `WH00001` | `HU00001` (dùng nguyên ID hiện có) |
| Bản chất | **Kho ES giữ tồn kho** (2 cơ sở Kanto・Kansai. Sau này có thể tăng) | **Văn phòng của công ty vận chuyển**. Điểm trung gian (khoảng 300 bản ghi) |
| Mục chung | #1〜5・7・10〜17, người phụ trách #18〜22, tab | Giống nhau |
| Mục chỉ có | Mã kho／điều kiện xử lý #23〜25／liên kết #26〜28 | Phân loại vận chuyển／mã văn phòng |
| Lead time | **Không có** (quản lý ở phân loại giao hàng của hợp đồng) | **Không có** |
| Ngưỡng số bản ghi・lead time chỉ thị xuất hàng | Có | **Không có** |
| **Khung không thể xuất hàng・ngày không thể theo ngày** | **Không giữ ở Master kho.** Cài đặt ở tab kho của Cài đặt chu kỳ giao hàng (màn hình 01) | Không có |
| Phiếu gửi hàng | In làm nơi xuất hàng | **Không phát hành lại** |
| Trạng thái trung gian | Lấy bằng ứng dụng (giao hàng của công ty) | **Không lấy** (§4C-2) |
| Chỉ thị xuất hàng (Thomas) | Xuất theo kho・ghi đè bằng gửi lại | Ngoài đối tượng |
| Cách được hợp đồng chọn | "Kho" của phân loại giao hàng | "Điểm trung chuyển" của phân loại giao hàng. **Thường do công ty vận chuyển ủy thác chỉ định**. **Chọn được từ toàn bộ trung chuyển (`HU`)** (2026/09/29 [quyết định v2.3 #50]) |
| Số bản ghi | 2 bản ghi (+tương lai) | Khoảng 300 bản ghi → tiền đề là tìm kiếm・nhập CSV |

> **Tách riêng ô mã văn phòng.** "Mã văn phòng" của điểm trung chuyển là mã của công ty vận chuyển và **hiển thị ở phiếu gửi hàng**, còn "mã kho" của kho picking là mã **của công ty dùng cho liên kết Thomas**.

> **Mục bắt buộc chuyển đổi theo phân loại.** #6 Phân loại vận chuyển và #9 Mã văn phòng chỉ bắt buộc với trung chuyển, **#8 Mã kho chỉ bắt buộc với picking** (vì không giữ nhóm nhiệt độ hỗ trợ nên mục bắt buộc riêng của picking chỉ có duy nhất mục này). Vì **phân loại kho không thể thay đổi sau khi đăng ký** nên chỉ cần phân chia hiển thị form, về sau không xảy ra thiếu mục bắt buộc.

**Chuyển đổi**: Dữ liệu Master điểm trung chuyển hiện có được nhập nguyên trạng với **phân loại kho＝trung chuyển**. Khoảng 300 bản ghi nhập bằng CSV. Công việc bổ sung chỉ gồm **đăng ký 2 kho picking** (#8・#23〜28), **cài đặt khung không thể xuất hàng ở màn hình 01**, và **cài đặt kho xử lý sản phẩm** (§2.3C).

### 2.3C Quan hệ giữa sản phẩm và kho (chốt 2026/09/14)

**Sản phẩm và kho giữ quan hệ nhiều-nhiều.** Có sản phẩm được xử lý ở nhiều kho, cũng có sản phẩm chuyên dùng cho Kanto・Kansai.

```
Master sản phẩm ──< Kho xử lý sản phẩm >── Master kho
```

| Bảng | Nội dung giữ |
|---|---|
| **Master sản phẩm** | Mã sản phẩm・tên sản phẩm・nhóm nhiệt độ・số lượng trong 1 thùng・hạn sử dụng・**đơn giá**・mô tả |
| **Kho xử lý sản phẩm** (mới) | Chỉ cặp sản phẩm × kho và **trạng thái xử lý (Hiệu lực／Vô hiệu)** |

> **Không giữ thuộc tính thay đổi theo kho (quyết định 2026/09/14).** Khi cài đặt cùng một sản phẩm cho cùng một kho thì **coi như tất cả cùng tiền đề**. **Nếu đơn giá hay mô tả khác nhau thì đăng ký như sản phẩm khác** (cả khi đơn giá thay đổi cũng là sản phẩm khác). Do đó số lượng trong 1 thùng・đơn giá do Master sản phẩm giữ, còn kho xử lý sản phẩm chỉ giữ sự thật "sản phẩm này được xử lý ở kho này".

| Trường hợp | Cách giữ |
|---|---|
| Sản phẩm xử lý ở cả hai kho | 1 sản phẩm＋2 dòng xử lý |
| Sản phẩm chuyên dùng cho Kanto | 1 sản phẩm＋1 dòng xử lý (chỉ Kanto) |
| Cùng tên sản phẩm nhưng đơn giá・mô tả khác | **Tách sản phẩm thành 2 bản ghi**. Mỗi sản phẩm 1 dòng xử lý |

**Phán định nhóm nhiệt độ (quyết định 2026/09/14)**: Master kho **không giữ nhóm nhiệt độ hỗ trợ**. Khi phân loại giao hàng của hợp đồng chỉ định như "Đông lạnh × Trung tâm Kokubu" thì phán định bằng **kho đó có xử lý từ 1 sản phẩm của nhóm nhiệt độ đó trở lên hay không**, nếu là 0 thì cảnh báo ("Chưa đăng ký sản phẩm đông lạnh ở Trung tâm Kokubu. Hãy cài đặt kho xử lý sản phẩm trước"). Tránh giữ kép ở Master kho và xử lý sản phẩm, tự động cập nhật mới nhất ngay khi đăng ký・dừng sản phẩm.

**Thứ tự**: Hợp đồng (cơ sở) → chọn **kho** ở phân loại giao hàng → sản phẩm **có xử lý** ở kho đó được quyết định → sản phẩm hiển thị cho doanh nghiệp được quyết định. Vì nếu không quyết định kho trước thì không thể hiển thị sản phẩm nên **giữ cài đặt chọn kho ở hợp đồng**.

**Khi đổi kho của hợp đồng**: Chỉ **sản phẩm không có dòng xử lý** ở kho chuyển đến mới là đối tượng thay thế. Ở màn hình đổi kho hiển thị tách "sản phẩm dùng nguyên được" và "sản phẩm cần thay thế", vận hành xác nhận rồi mới áp dụng (áp dụng từ tháng áp dụng・§4A-6).

**Khi xuất từ kho khác bằng sao chép**: Nếu nơi chuyển đến có dòng xử lý thì sao chép nguyên được. Nếu không có thì **coi là hàng thay thế** và chọn lại sản phẩm (§4A-4C).

---
## 3. Màn hình 02 — Cài đặt giao hàng theo hợp đồng (kinh doanh / từng hợp đồng)

Giải thích bằng ví dụ hợp đồng `#C-10428 Công ty Cổ phần Midori Denshi`.

### 3.1 Định nghĩa các mục

| Mục | Kiểu | Giá trị mặc định | Giải thích |
|---|---|---|---|
| Cách quyết định ngày giao hàng (mẫu giao hàng・`plan_mode`) | enum | `cycle` | `cycle` = theo chu kỳ giao hàng / `special` = chỉ định riêng ngày giao hàng / **`on_demand` = giao hàng theo từng lần (chỉ vật tư)**. **Hàng lạnh・hàng đông lạnh giữ nguyên 2 giá trị `cycle`／`special`** (quyết định 2026/09/21・#24) |
| Số lượng gói (mỗi chu kỳ) | int | 120 | Tổng số lượng giao trong 1 chu kỳ (suất) |
| Số lần giao hàng (mỗi chu kỳ) | int(1–4) | 2 | Số lần giao đến cùng một địa điểm giao trong 1 chu kỳ |
| Lead time | int(0–7) | 2 | Số ngày từ lúc picking đến lúc giao hàng. **Được giữ theo từng phân loại giao hàng của hợp đồng (lạnh／đông lạnh／vật tư). Master kho không giữ lead time và cũng không tự động điền giá trị mặc định** (quyết định 2026/09/21. Cũ: giá trị mặc định là lead time theo từng kho của master kho). **Giới hạn trên là 7 ngày** |
| **Dời ngày giao hàng lên trước・lùi về sau** | enum(-1/+1) | -1 (dời lên trước) | Khi ngày giao rơi vào thứ không thể giao, hoặc ngày được coi là ngày lễ giao hàng của hợp đồng không nhận giao ngày lễ, thì dời theo hướng nào. **Khi ngày chỉ định riêng (ngày N hàng tháng／ngày cuối tháng) rơi vào thứ không thể giao thì cũng theo cài đặt này** (quyết định 2026/09/19). Là giá trị **do hợp đồng nắm giữ**, dùng chung bất kể chế độ. **Tên mục được đổi từ "dời lên trước・lùi về sau" vào 2026/09/21** (#31) |
| Chi tiết giao hàng | array | — | Có số dòng bằng số lần giao hàng (bên dưới) |
| Phân loại giao hàng | array | 3 dòng | Bộ **nhiệt độ hoặc vật tư × kho × công ty giao hàng**. Mỗi dòng có kho・công ty giao hàng chặng 1・điểm trung chuyển・công ty giao hàng chặng 2・lead time・tỷ lệ cơ cấu (§3.1B) |
| Kho picking | FK (master kho) | Trung tâm Kokubu | Chỉ định theo từng phân loại giao hàng. Chỉ định bằng **ô tìm kiếm** từ master kho (loại kho = picking) (REQ-DL-410). 3 kho trong mock là dữ liệu ban đầu |
| Kho trung chuyển | FK (master kho) | Không sử dụng | Chỉ định từ master kho (loại kho = điểm trung chuyển). **Không cố định 2 chặng mà chỉ định điểm xuất phát・điểm đến theo từng lần như một tuyến giao hàng** (REQ-DL-411). Khi hiển thị, tách thành 2 dòng: điểm trung chuyển và điểm giao cuối cùng |
| Công ty giao hàng | FK (master công ty giao hàng) | Giao hàng nội bộ | Giao hàng nội bộ／công ty giao hàng ủy thác. Giữ nhiệt độ hỗ trợ・khu vực・quản lý túi giữ lạnh・có máy bán hàng tự động hay không trong master công ty giao hàng (REQ-DL-412) |
| Nhiệt độ (phân loại hàng hóa) | enum | Loại lạnh | Loại đông lạnh／Loại lạnh／Nhiệt độ thường／Vật tư. Là định danh của phân loại giao hàng. **Hàng đông lạnh và hàng lạnh được tạo kế hoạch xuất hàng・chỉ thị xuất hàng riêng** (REQ-DL-301) |
| Qua Yamato | bool | true | Bật thì phát hành mã số tracking |
| Thứ không thể giao hàng | bool×3 | Thứ 7=ON, CN=ON, Lễ=ON | Các thứ・ngày lễ phía công ty không thể nhận hàng. Chỉ kiểm soát **ngày giao hàng**. Đơn vị giữ là **theo hợp đồng (cơ sở)** (không phải đồng nhất cho toàn doanh nghiệp). Ngày không thể nhận chỉ định theo ngày xem §3.1C |
| Ngày không thể nhận | array | — | **Ngày** phía công ty không thể nhận hàng (nghỉ kinh doanh・kiểm kê・thi công・cuối năm đầu năm). Có chỉ định theo khoảng thời gian・lặp lại hằng năm. §3.1C |

> **Về tên mục (quyết định 2026/09/21・#31)**: Tên mục trên màn hình được thống nhất là **"Thứ không thể giao hàng"** và **"Dời lên trước・lùi về sau"** (thống nhất với cách gọi trong danh sách mục của doanh nghiệp・cơ sở・hợp đồng・hợp đồng con). **Không dùng các tên cũ là "Thứ không thể nhận hàng" và "Hướng chuyển đổi".** **Tên vật lý (`ng_weekdays` ／ `holiday_shift`) được giữ nguyên, không thay đổi.**

> **Nguyên tắc về đơn vị giữ**: "Dời lên trước・lùi về sau", lead time, thứ không thể giao hàng, ngày không thể nhận, ngày chuyển đổi／ngày bắt đầu áp dụng／ngày bắt đầu tạm ngưng／ngày hủy hợp đồng đều được giữ **theo hợp đồng (cơ sở)**. Ngay cả khi đăng ký đồng thời, thời điểm chuyển sang hợp đồng chính thức cũng khác nhau theo từng cơ sở, nên không đặt cài đặt đồng nhất theo đơn vị master khách hàng (cụm "định nghĩa tại master khách hàng" của REQ-DL-202 được triển khai thành cài đặt theo đơn vị hợp đồng = cơ sở).

### 3.1B Phân loại giao hàng (nhiệt độ・vật tư × kho × công ty giao hàng)

Hợp đồng không bị cố định vào một kho. **Kho xuất hàng và công ty giao hàng khác nhau theo từng nhiệt độ・từng loại vật tư**, nên hợp đồng có danh sách các phân loại giao hàng.

| Mục | Kiểu | Giải thích |
|---|---|---|
| Phân loại | enum | Loại đông lạnh／Loại lạnh／Nhiệt độ thường／**Vật tư** |
| Kho | FK (master kho) | Kho picking xuất phân loại này. Có thể khác nhau theo từng phân loại |
| Công ty giao hàng chặng 1 | FK (master công ty giao hàng) | Công ty vận chuyển từ kho đến địa điểm tiếp theo. **Có thể chọn từ toàn bộ master công ty giao hàng (công ty vận tải・ủy thác・nội bộ)** (2026/09/29〔quyết định v2.3 #50〕. Thực tế cũng có trường hợp chặng 1 là công ty giao hàng ủy thác) |
| Điểm trung chuyển | FK (master kho・loại = trung chuyển) | Để trống nếu không sử dụng. Tại điểm trung chuyển không phát hành lại phiếu gửi hàng. **Chọn từ toàn bộ điểm trung chuyển (`HU`) của master kho. Cơ sở của công ty giao hàng ủy thác cũng có thể đăng ký làm điểm trung chuyển** (2026/09/29〔quyết định v2.3 #50〕. Cũ: lựa chọn trên màn hình chỉ có văn phòng của Yamato・Sagawa) |
| Công ty giao hàng chặng 2 | FK (master công ty giao hàng) | Từ điểm trung chuyển đến điểm giao cuối cùng. Để trống nếu không dùng trung chuyển. Giống chặng 1, có thể chọn từ **toàn bộ master công ty giao hàng** (2026/09/29〔quyết định v2.3 #50〕) |
| Lead time | int(0–7) | **Lead time của phân loại giao hàng này (lạnh／đông lạnh／vật tư). Không tự động điền từ master kho** (quyết định 2026/09/21. Cũ: giá trị mặc định là lead time theo từng kho của master kho) |
| **Loại chuyến** (`service_form`) | enum | **Chuyến giao ES／Chuyến giao COOL／Chuyến vật tư. Chủ sở hữu là phân loại giao hàng này (delivery channel)** (quyết định lần 2 ngày 2026/09/21). **Không đặt ở tuyến của hợp đồng (`contract_routes`).** Không suy ra từ việc có trung chuyển hay không. Quyết định nội dung công việc trên ứng dụng (có trưng bày hay không) (§4C-3). **(Cũ: lần 1 #29 "Loại chuyến là mục nhập do hợp đồng (hợp đồng con) nắm giữ". Lần 2 ngày 2026/09/21 giới hạn nơi nắm giữ vào "phân loại giao hàng")** |
| **Thể chế giao hàng** (`delivery_regime`) | enum | **`self` (nội bộ)／`partner_driver` (tài xế ủy thác)／`parcel_carrier` (công ty vận tải)** (thêm vào lần 2 ngày 2026/09/21). Thể hiện ai là người vận chuyển. Đây là giá trị mặc định của phân loại giao hàng, **nếu khác nhau theo từng chặng thì `delivery_regime` ở phía route legs được ưu tiên**. **Giá trị của chặng cuối (final leg) ảnh hưởng đến việc xác định coi như hoàn thành・phát hiện thiếu giao** (§4C-1・§11-1) |
| Tỷ lệ cơ cấu | int(%) | Tỷ lệ phân bổ số lượng cho phân loại này. Quyết định theo cơ cấu sản phẩm |

- **Kế hoạch giao hàng・dữ liệu giao hàng được tạo từng bản ghi theo "chi tiết giao hàng × phân loại giao hàng".** Dù cùng ngày giao hàng, hàng đông lạnh, hàng lạnh và vật tư là các bản ghi riêng, kho và ngày picking cũng có thể khác nhau.
- Ngày giao hàng dùng chung cho hợp đồng (cơ sở), nhưng **ngày picking được tính ngược theo từng phân loại bằng "ngày giao hàng － lead time của phân loại đó"**. Khả năng xuất hàng được xác định bằng cài đặt của kho thuộc phân loại đó.
- Vật tư được quản lý riêng và picking riêng với thực phẩm nên nhất định phải có như một phân loại giao hàng độc lập.
- **Trung chuyển (relay) không được lưu ở phân loại giao hàng cũng như ở hợp đồng.** Nó được **suy ra** từ việc trong tuyến giao hàng (route legs) có chặng bao gồm điểm trung chuyển hay không (quyết định lần 2 ngày 2026/09/21・§4A-3B).
- **Dù có trung chuyển, lead time đúng là 1 giá trị tổng do hợp đồng nắm giữ** (quyết định 2026/09/21・#21). Lead time của chặng 1 (kho → điểm trung chuyển) và chặng 2 (điểm trung chuyển → nơi giao) **chỉ hiển thị làm giá trị tham khảo** và **không dùng để tính ngày**. Ngày picking luôn được tính ngược bằng `ngày giao hàng − tổng lead time`.
- **Kho và công ty giao hàng được sử dụng cũng thay đổi theo nơi giao hàng.** Hợp đồng là theo đơn vị cơ sở (nơi giao hàng) nên cơ sở ở Kanto và cơ sở ở Kansai có kho xuất hàng và công ty giao hàng khác nhau. Phân loại giao hàng cũng là đơn vị để biểu diễn điều này.
- Kho・điểm trung chuyển・công ty giao hàng **được chọn từ master** (§12-1). Không giữ các mẫu cố định tổ hợp. Đối chiếu nhiệt độ hỗ trợ・khu vực hỗ trợ của master công ty giao hàng với khu vực nơi giao hàng và nhiệt độ của phân loại, nếu không khớp thì đưa ra **cảnh báo** (không cấm).

#### Cách giữ cài đặt tuyến giao hàng — hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó (quyết định 2026/09/21)

Cài đặt tuyến giao hàng (kho・công ty giao hàng・trung chuyển・lead time) được **cả hợp đồng cha và hợp đồng con cùng nắm giữ**. Vai trò khác nhau.

| | Thứ nắm giữ | Vai trò |
|---|---|---|
| **Hợp đồng cha** (hợp đồng) | Kho・công ty giao hàng chặng 1・điểm trung chuyển・công ty giao hàng chặng 2・lead time・loại chuyến theo từng phân loại giao hàng | **Giá trị mặc định**. Là gốc của hợp đồng con・kế hoạch sẽ được tạo từ nay về sau |
| **Hợp đồng con** (`ID hợp đồng-yyyymm`) | Cùng các mục đó, dưới dạng **giá trị thực tế của tháng đó** | **Giá trị thực sự đã sử dụng trong tháng đó**. Dù sau này thay đổi hợp đồng cha cũng không bị ghi đè |

- **Khi tạo hợp đồng con, chụp snapshot giá trị mặc định của hợp đồng cha.** Từ đó dữ liệu giao hàng của tháng đó vận hành theo giá trị của hợp đồng con.
- **Kế hoạch dùng snapshot tuyến của hợp đồng con nếu hợp đồng con đã có, chỉ dùng hợp đồng cha khi hợp đồng con chưa có** (quyết định lần 2 ngày 2026/09/21). Kết quả xác định được lưu lại ở `shipping_plans.route_snapshot_source` (`contract_month` / `contract`).
  - **Trường hợp hợp đồng con đã được tạo trước cho 12 chu kỳ như trả trước một năm một lần** (§4A-2B), kế hoạch của tháng đó được tạo **từ tuyến của hợp đồng con, không phải hợp đồng cha**. Nếu tham chiếu hợp đồng cha, khi sau này thay đổi hợp đồng cha thì hợp đồng con và kế hoạch sẽ bị lệch nhau.
  - **Chỉ kế hoạch (`draft`) của các kỳ phía sau mà hợp đồng con chưa có** mới được tạo từ giá trị mặc định của hợp đồng cha. Vào thời điểm hợp đồng con được tạo, kế hoạch của chu kỳ đó chuyển sang snapshot phía hợp đồng con.
  - **(Cũ: ghi đồng loạt rằng "kế hoạch (`draft`) của 6 tháng sau được tạo từ giá trị mặc định của hợp đồng cha vì chưa có hợp đồng con". Lần 2 ngày 2026/09/21 nêu rõ trường hợp hợp đồng con có trước)**
- Khi thay đổi tuyến của hợp đồng cha, **phản ánh vào hợp đồng con・kế hoạch từ tháng áp dụng (§4A-6) trở đi**. Không ghi đè hợp đồng con của các tháng quá khứ đã chụp snapshot.
- **Thay đổi tuyến "chỉ lần giao hàng này"** (§4A-4D) không phải snapshot của hợp đồng con mà **UPDATE trực tiếp `delivery_legs` của dữ liệu giao hàng đó** (không giữ `route_override`・quyết định lần 4 ngày 2026/09/23). Không thay đổi giá trị của hợp đồng con.

> **Tại sao giữ cả hai.** Nếu chỉ có hợp đồng cha, thì ngay khi đổi tuyến của hợp đồng thì tuyến giao hàng của các tháng quá khứ cũng trông như thay đổi theo, không giải thích được "lúc đó đã dùng gì" khi thanh toán・kiểm toán. Nếu chỉ có hợp đồng con thì không thể tạo kế hoạch của các kỳ phía sau chưa có hợp đồng con.

### 3.1C Ràng buộc nhận hàng của cơ sở (quyết định 2026/09/18)

"Ngày này không thể nhận hàng" của doanh nghiệp không được xử lý bằng từng yêu cầu thay đổi riêng lẻ mà được giữ như **ràng buộc của cơ sở**. Vì ràng buộc tác động trực tiếp lên việc sinh ngày giao hàng nên **dù tạo lại cài đặt chu kỳ bao nhiêu lần vẫn tự động tránh được** (phương châm chia tách §3.4).

#### Định nghĩa mục

| Mục | Kiểu | Bắt buộc | Giải thích |
|---|---|---|---|
| Loại | enum | ○ | `date` = chỉ định ngày／`range` = chỉ định khoảng thời gian／`dow` = chỉ định thứ |
| Ngày / Ngày bắt đầu・ngày kết thúc | date | ○ | Giữ theo loại |
| Thứ | bool×7 | — | Khi loại là `dow`. Cùng thực thể với thứ không thể giao hàng ở §3.1 |
| Lặp lại | enum | ○ | `none` = chỉ năm đó／`yearly` = cùng ngày tháng hằng năm (cuối năm đầu năm・ngày thành lập công ty, v.v.) |
| Lý do | text | ○ | Doanh nghiệp nhập. Dùng để giải thích ngày ứng viên và để bộ phận vận hành phán đoán |
| Nguồn đăng ký | enum | ○ | `Doanh nghiệp`／`Vận hành`. Doanh nghiệp có thể tự đăng ký, bộ phận vận hành phê duyệt |
| Trạng thái | enum | ○ | `Đang đăng ký`／`Có hiệu lực`／`Đã hủy` |
| Bắt đầu áp dụng | date | ○ | Mặc định là ngày phê duyệt. Không áp dụng ngược về ngày quá khứ |

#### Điều kiện nhận hàng của cơ sở (thêm vào 2026/09/21・#22)

Tách biệt với ngày không thể nhận hàng (bảng trên), **khung giờ có thể nhận hàng và cách giao hàng** được giữ như mục của cơ sở. **Được sao chép vào dữ liệu giao hàng để hiển thị cho tài xế.**

| Mục | Kiểu | Bắt buộc | Giải thích |
|---|---|---|---|
| **Khung giờ nhận hàng** | **Bảng con `site_receive_windows`** (`site_id, from_time, to_time, sort_order`) | ○ | Khung giờ cơ sở đó có thể nhận hàng (ví dụ `09:00`〜`12:00` và `13:00`〜`16:00`). **1 cơ sở có thể có nhiều dòng**. Quyết định lần 2 ngày 2026/09/21 |
| **Điều kiện giao hàng** | text | ○ | Cách nhận hàng (ví dụ: "Vận chuyển vào từ cửa sau", "Nộp phiếu tiếp nhận tại phòng bảo vệ", "Không được để hàng tại chỗ khi người phụ trách vắng mặt"). Bản thân sơ đồ lộ trình vận chuyển vào được giữ riêng dưới dạng "tài liệu của địa điểm" (§4A-4C) |

- Đơn vị giữ là **theo hợp đồng (cơ sở)** (giống nguyên tắc về đơn vị giữ ở §3.1).
- **Khung giờ nhận hàng được giữ bằng bảng con** (quyết định lần 2 ngày 2026/09/21). **Không dùng dạng chỉ giữ một cặp `from`/`to`.** Vì có cơ sở chia buổi sáng・buổi chiều nên một cặp không thể biểu diễn được.
  - Phía cơ sở: **`site_receive_windows(site_id, from_time, to_time, sort_order)`**
  - Phía dữ liệu giao hàng: **`delivery_receive_windows(delivery_id, from_time, to_time, sort_order, snapshot_at)`**
  - **(Cũ: lần 1 #22 "giữ khung giờ nhận hàng như một mục" = chỉ một cặp ở `contracts.receive_window_from` / `receive_window_to` và `deliveries.receive_window_snapshot`. Lần 2 ngày 2026/09/21 cụ thể hóa thành phương thức bảng con, hủy dạng một cặp)**
- **Thời điểm snapshot: khi tạo dữ liệu giao hàng (sinh xác định), sao chép nguyên danh sách `site_receive_windows` sang `delivery_receive_windows`** (xử lý giống địa chỉ・§7). Không chọn chỉ 1 dòng mà sao chép **toàn bộ dòng tại thời điểm đó theo từng `sort_order`**. Sau này dù sửa phía cơ sở thì dữ liệu giao hàng đã tạo cũng không thay đổi.
  - Ở giai đoạn kế hoạch (`draft`) không chụp snapshot. Kế hoạch tham chiếu master cơ sở để hiển thị.
  - Dữ liệu giao hàng con được tạo bằng nhân bản (giao lại・giao từng phần・chuyến thay thế) **sao chép nguyên snapshot của cha** (không tra lại master cơ sở tại thời điểm nhân bản).
- **Hiển thị toàn bộ các khung giờ theo thứ tự `sort_order` trên thẻ nơi giao hàng của ứng dụng tài xế.** Tạo trạng thái để tài xế không cần đi xem master cơ sở mà vẫn đọc được khung giờ nhận hàng và điều kiện giao hàng ngay trên màn hình của lần giao hàng đó.
- Khung giờ nhận hàng **không dùng để tính ngày** (ngày giao hàng được quyết định bằng ngày không thể nhận hàng・thứ không thể giao hàng). Được giữ làm thông tin để tài xế・công ty giao hàng ủy thác quyết định thứ tự đi vòng trong ngày.

#### Đặc tả hoạt động

- Đơn vị giữ là **theo hợp đồng (cơ sở)** (giống nguyên tắc về đơn vị giữ ở §3.1). Không đồng nhất theo doanh nghiệp.
- Được tham chiếu trong việc xác định ngày giao hàng (§4.3 `isCompanyClosed`). **Chỉ kiểm soát ngày giao hàng, không kiểm soát ngày picking** (picking được xác định bằng ngày không thể xuất hàng của kho).
- Lần giao hàng rơi vào ngày không thể nhận sẽ tự động được chuyển đổi theo **"Dời lên trước・lùi về sau"** của hợp đồng (mặc định là dời lên trước). Nếu ngày được chuyển đến cũng không thể thì tìm lần lượt đến ngày có thể.
- Trường hợp không thể chuyển đổi (không có ngày nào giao được trong chu kỳ) thì hiển thị là **không thể sinh kế hoạch** trong mục cần xác nhận. Điều chỉnh số lần giao hàng phía hợp đồng.
- **Bắt buộc có sự xác nhận của bộ phận vận hành khi phê duyệt.** Vì khi ngày không thể nhận tăng lên thì số lần giao hàng trong 1 chu kỳ thay đổi, ảnh hưởng đến hợp đồng・thanh toán.
- Vào thời điểm đăng ký・thay đổi, **sinh lại kế hoạch của các tháng có thể chỉnh sửa (từ tháng sau nữa trở đi)**. Dữ liệu đã xác định・`published`・`locked` tuân theo quy tắc §4A-5.
- Không thể đăng ký ngày quá khứ. Vì tháng này và tháng sau không thể chỉnh sửa cài đặt, **trường hợp cần ngày không thể nhận trong khoảng thời gian đó thì xử lý bằng điều chỉnh từng lần (§4A-4) thay vì cơ chế này**.

#### Màn hình

- Màn hình doanh nghiệp: Đăng ký "ngày không thể nhận hàng" trên lịch theo từng cơ sở. Khi đăng ký, xem trước ngay tại chỗ kết quả kế hoạch giao hàng của ngày đó được chuyển đổi.
- Màn hình vận hành: Phê duyệt danh sách các ngày không thể nhận đang đăng ký. Trước khi phê duyệt, hiển thị **các ngày giao hàng bị ảnh hưởng và ngày được chuyển đến**.

### 3.2 Chi tiết giao hàng (giao hàng nhiều lần)

Số dòng được sinh ra bằng số lần giao hàng. Các mục theo từng dòng:

| Mục | Chế độ cycle | Chế độ special |
|---|---|---|
| Phân bổ | Slot giao hàng (chọn từ `A1`〜`D7`) | Ngày giao hàng chỉ định (chọn từ ngày 1〜28 hàng tháng) |
| Số lượng | Phân bổ tự động (bên dưới) | Phân bổ tự động (bên dưới) |
| Ví dụ lần đầu | Hiển thị xem trước ngày giao hàng [chuẩn] và ngày picking tính ngược từ đó | Như bên trái |

#### Khi chọn slot giao hàng, hiển thị mức độ đông đúc của khung (quyết định 2026/09/18)

**Đỉnh số lượng được quyết định bởi sự chồng chất "hợp đồng nào đã chọn khung nào".** Vì ngày giao hàng được quyết định từ slot mà hợp đồng chọn, nên không thể bình quân hóa từ phía lịch trình về sau. Việc bộ phận vận hành dịch chuyển ngày là thay đổi ngày giao hàng đã hứa với doanh nghiệp, không thể tự ý dịch chuyển để điều chỉnh số lượng. **Hiển thị vào thời điểm ký hợp đồng là biện pháp phòng ngừa duy nhất**.

| Hiển thị | Nội dung |
|---|---|
| Lựa chọn | Như `A3 Thứ 4・210 đơn／giới hạn 300　còn 90`, **đặt cạnh nhau số đơn đã chất lên khung đó tại kho của phân loại giao hàng đó** và ngưỡng số đơn của master kho |
| Từ 90% ngưỡng trở lên | `⚠ Đông` |
| Vượt ngưỡng | `✕ Vượt giới hạn` |
| Khung đã chọn | Luôn hiển thị "〈tên kho〉　〈số đơn〉／giới hạn 〈ngưỡng〉" dưới ô |

- **Không chặn việc chọn.** Vì ngưỡng số đơn của master kho là cái "chỉ cảnh báo ngày vượt, không dừng xử lý" (§2.3A mục 23), nên phía hợp đồng cũng chỉ dừng ở cảnh báo. Tạo trạng thái để nhân viên kinh doanh chọn sau khi đã biết tình hình.
- Số đơn được đếm **theo từng kho**. Cùng một khung nhưng Kanto và Kansai có mức đông đúc khác nhau. Khi đổi kho theo phân loại giao hàng thì hiển thị cũng đổi theo.
- Khung không thể giao hàng (tự động xác định từ khung không thể xuất hàng・§4.3) vẫn không thể chọn như trước và không hiển thị số đơn.
- **Khung không thể chọn được tự động chuyển xám** (quyết định 2026/09/19). Hai dữ liệu để xác định là **khung không thể xuất hàng của kho được gán cho phân loại giao hàng của hợp đồng đó** và **lead time của phân loại giao hàng đó**; nếu khung picking `khung giao hàng − lead time` không thể xuất hàng thì khung giao hàng đó không thể chọn. Khi đổi kho hoặc lead time thì **tính lại ngay tại chỗ và tô lại màu xám**.
- **Lý do của khung xám thay đổi độ dài giữa ô và tooltip** (quyết định 2026/09/21・#23).

  | Vị trí | Câu chữ |
  |---|---|
  | Ô của khung | **Ngắn**. `B1 Thứ 2 (không thể giao hàng)` |
  | Tooltip | **Chi tiết**. `Khung không thể xuất hàng A7 (kho Kanto)／lead time 1 ngày` — hiển thị khung không thể xuất hàng・tên kho・lead time |

- Nếu viết hết lý do vào ô thì lưới 28 khung không đọc được, nên ô chỉ cho biết "không thể chọn", lý do được hiển thị bằng tooltip. Đây là hiển thị nhằm giúp nhân viên kinh doanh không phải mỗi lần đều xác nhận "tại sao không chọn được".
- **Đỉnh đã chất lên rồi thì không giải quyết được bằng hiển thị này.** Để giải quyết, cần nhờ hợp đồng đối tượng đổi khung, và đó là một công việc khác cần có thỏa thuận với doanh nghiệp (**tiếp tục là vấn đề vận hành**. Không nằm trong danh sách quyết định ngày 2026/09/21 nên không ghi vào §8).

#### Quy tắc phân bổ số lượng

```
base = floor(số lượng gói ÷ số lần giao hàng)
rem  = số lượng gói － base × số lần giao hàng
số lượng[i] = base + (i < rem ? 1 : 0)      // phần dư cộng vào các lần giao đầu tiên
```

**Cách chỉ định giao hàng chỉ định riêng (chế độ special) (quyết định 2026/09/12)**: Giao hàng chỉ định riêng là cơ chế cho các ngoại lệ không biểu diễn được bằng khung chu kỳ (A1〜D7), nên không cho chọn từ khung. Master hợp đồng chỉ giữ **2 loại: "ngày N hàng tháng" và "cuối tháng hàng tháng"** (không giữ thứ N của tháng). **Các trường hợp bất thường chỉ một lần không đăng ký vào master mà xử lý bằng cách trực tiếp sửa dữ liệu giao hàng sau khi sinh**. Với cả hai cách chỉ định, nhất định phải đi qua kiểm tra ngày không thể và tính ngược lead time, nên ngày không thể vận hành sẽ tự động được chuyển đổi. Cuối tháng được đọc thành 28〜31 theo từng tháng. **Khi ngày chỉ định rơi vào thứ không thể giao hàng・ngày không thể nhận・ngày được coi là ngày lễ giao hàng thì chuyển đổi theo "Dời lên trước・lùi về sau" của hợp đồng** (quyết định 2026/09/19). Dùng cùng cài đặt hướng với chế độ `cycle`, không giữ hướng riêng chỉ cho giao hàng chỉ định riêng.

**Tách nhiệt độ**: Khi một chi tiết giao hàng có lẫn hàng đông lạnh và hàng lạnh, giữ nguyên ngày giao hàng chung và **chia picking・chỉ thị xuất hàng (= bản ghi kế hoạch xuất hàng) theo từng nhiệt độ** (REQ-DL-301). Phân bổ số lượng được thực hiện trên số lượng theo từng nhiệt độ. Trong danh sách lịch trình giao hàng, hiển thị biểu tượng nhận diện hàng đông lạnh (băng) (REQ-DL-302).

Ví dụ: `100 suất ÷ 2 lần = 50 / 50`, `100 suất ÷ 3 lần = 34 / 33 / 33`, `120 suất ÷ 2 lần = 60 / 60`

#### Validation

| Điều kiện | Hành vi |
|---|---|
| Chọn Slot không thể giao hàng cơ bản, hoặc ứng viên không thể giao hàng thuộc lead time của hợp đồng | Vô hiệu hóa lựa chọn, hiển thị lý do "Không thể giao hàng do quy tắc không thể xuất hàng" |
| Trùng cùng Slot (hoặc cùng ngày chỉ định) | **Hiển thị thẻ cảnh báo (vẫn có thể lưu. Do vận hành phán đoán)**. Được xác định bằng quyết định lần 3 ngày 2026/09/22 (phương án "cùng Slot + cùng phân loại giao hàng là lỗi" của §12 #10 không được chấp nhận・REQ-DL-892) |
| Số lượng gói < 1 hoặc > 9999 | Làm tròn giá trị nhập vào trong phạm vi |
| Lead time < 0 hoặc > 7 | Làm tròn giá trị nhập vào trong phạm vi |

### 3.3 Cách xác định ngày giao hàng theo từng chế độ

| Chế độ | Cách xác định ngày giao hàng | Chuẩn | Ngày picking |
|---|---|---|---|
| Theo chu kỳ giao hàng (`cycle`) | Ngày của Slot giao hàng được gán (`A1`〜`D7`) | Ngày giao hàng | Ngày giao hàng － lead time (tính ngược) |
| Chỉ định riêng ngày giao hàng (`special`) | Ngày chỉ định hàng tháng (ngày khách hàng nhận) | Ngày giao hàng | Ngày giao hàng － lead time (tính ngược) |
| **Giao hàng theo từng lần (`on_demand`・chỉ vật tư)** | **Không tạo từ chu kỳ. Được quyết định vào thời điểm xác nhận giỏ hàng vật tư** (§4A-2C). **Ngày giao hàng = ngày sau ngày đặt hàng trở đi, là ngày giao được đầu tiên mà giữ được lead time** (2026/09/29〔quyết định v2.3 #38〕) | Ngày giao hàng | Ngày giao hàng － lead time (tính ngược). **Cùng ý nghĩa với các chế độ khác** (2026/09/29〔quyết định v2.3 #38〕. Cũ: cũng có thể đọc là "số ngày từ lúc chốt đơn đến lúc giao hàng") |

> **Giao hàng theo từng lần (`on_demand`) chỉ dành cho vật tư** (quyết định 2026/09/21・#24). **Hàng lạnh・hàng đông lạnh giữ nguyên 2 giá trị chu kỳ／special** và không thể chọn giao hàng theo từng lần.

**Ở cả hai chế độ, chuẩn đều là ngày giao hàng** và hướng tính toán giống nhau. Chỉ khác nhau ở cách xác định ngày giao hàng.

### 3.4 Yêu cầu thay đổi ngày giao hàng của doanh nghiệp

- Doanh nghiệp **có thể yêu cầu thay đổi từ hệ thống đến hết khoảng thời gian đã sinh chu kỳ giao hàng (tối đa 6 tháng sau)** (quyết định 2026/09/12. Sửa đổi quy định cũ "chỉ chu kỳ bắt đầu vào tháng sau tháng đăng ký").
- **Không thể yêu cầu thay đổi ngày quá khứ và tháng này.** Đối tượng là những chu kỳ giao hàng đã sinh trong số các chu kỳ giao hàng bắt đầu từ tháng sau trở đi.
- Có thể yêu cầu **đến hết tháng đã hoàn tất cài đặt**. Các tháng sau chưa sinh bằng cài đặt chu kỳ giao hàng thì không hiển thị trên lịch cũng như trong ứng viên. Khi kéo dài khoảng thời gian đối tượng sinh thì có thể yêu cầu từ tháng đó.
- Ngày thay đổi đến được giới hạn trong cùng chu kỳ giao hàng với kế hoạch hiện tại. Vì chu kỳ giao hàng vắt qua tháng dương lịch nên ngày của tháng 10 thuộc "Chu kỳ giao hàng tháng 9/2026" cũng có thể là ngày thay đổi đến.
- Các ngày ngoài đối tượng yêu cầu không hiển thị trong danh sách ứng viên. Hướng dẫn liên hệ ngoài hệ thống trong trường hợp cần thay đổi không luôn hiển thị trên màn hình chọn này.
- Yêu cầu được thực hiện trước khi xác nhận đặt hàng của chu kỳ đối tượng. Sau khi xác nhận đặt hàng, hoặc sau khi bắt đầu công việc picking・xuất hàng thì không thể chọn.
- Nơi phản ánh thay đổi tùy theo đích yêu cầu là **kế hoạch giao hàng (chưa xác định) hay dữ liệu giao hàng (đã xác định)** (§4A-4). Thao tác của doanh nghiệp giống nhau, trên màn hình phân biệt bằng huy hiệu "Kế hoạch" "Xác định".
- Ngay cả ở giai đoạn kế hoạch, cũng **xác định khả năng bằng kho và công ty giao hàng** được gán cho hợp đồng. Ngày không thể xuất hàng・ngày không thể giao hàng ủy thác・ngày không thể nhận đều được dùng để xác định ngày ứng viên và hiển thị lý do không thể chọn.
- Ngày thay đổi đến được giới hạn trong cùng phân loại giao hàng. Trên màn hình doanh nghiệp không hiển thị chính các mã nội bộ như `A/B`・`C/D` mà giải thích là "giữa các chuyến nửa đầu tháng" "giữa các chuyến nửa cuối tháng".
- **Việc phản ánh phê duyệt dời đồng thời hàng lạnh và hàng đông lạnh của cùng cơ sở・cùng ngày giao hàng** (quyết định 2026/09/19). Dù là các bản ghi riêng theo phân loại giao hàng, nhưng với doanh nghiệp "lần giao hàng của ngày đó" là một, nên không có chuyện chỉ dời một bên. Trên màn hình phê duyệt, liệt kê hiển thị tất cả các bản ghi đối tượng sẽ dời. **Vì kho・lead time khác nhau theo từng phân loại nên ngày picking được tính ngược riêng cho từng phân loại** (chỉ ngày giao hàng được đồng nhất).
- Ngay cả trong cùng chu kỳ, các ngày tạm ngưng chu kỳ, ngày không thể giao hàng ủy thác, ngày không thể đảm bảo ngày picking tính ngược từ ngày mong muốn sẽ không thể chọn và hiển thị lý do mà doanh nghiệp có thể hiểu.
- Doanh nghiệp ngoài ngày mong muốn cụ thể còn có thể chọn **"Không có ngày mong muốn (giao cho bộ phận vận hành)"**. Trường hợp này bộ phận vận hành xác nhận ngày ứng viên, kho được gán và khả năng giao hàng ủy thác.
- Bộ phận vận hành có thể tiếp tục thao tác thay đổi ngay cả với đối tượng bị hạn chế, nhưng trước khi xác định hiển thị "cần xác nhận" và lý do, bắt buộc thao tác phê duyệt.
- Cho đến khi yêu cầu được phê duyệt thì giữ nguyên kế hoạch giao hàng ban đầu.
- Màn hình yêu cầu không tách riêng mà **hiển thị tích hợp với màn hình chi tiết dữ liệu giao hàng (màn hình 06)**. **Hiển thị tên người yêu cầu** để việc liên hệ qua điện thoại được thuận lợi (REQ-DL-305).
- **Sau khi từ chối không có luồng yêu cầu lại**, vận hành theo cách sửa nội dung thay đổi mong muốn trên hệ thống (REQ-DL-305).
- Các quy tắc coi là lỗi khi thay đổi (không cho phép vắt qua kỳ・vắt qua tháng, v.v.) được nêu rõ trên hệ thống. **Hạn chế thay đổi di chuyển từ nửa đầu → nửa sau của chu kỳ giao hàng, và thay đổi vắt qua Phase1 (A・B) → Phase2 (C・D)** (REQ-DL-502).
- Khi không có một ngày nào có thể chọn thông thường thì chuyển sang **chế độ yêu cầu ngày mong muốn**, bắt buộc tiếp nhận **2 khung: nguyện vọng 1・nguyện vọng 2** (`配送管理_UIデザイン_prompt.md` §6-4). "Không có ngày mong muốn (giao cho bộ phận vận hành)" trong tài liệu này tồn tại song song như lựa chọn thứ ba khi không thể đưa ra ngày mong muốn.
- Ô ngày ứng viên phía doanh nghiệp hiển thị theo 5 trạng thái "Có thể thay đổi／Đang chọn／Cần xác nhận (lượng lưu kho)／Không thể chọn／Nguyện vọng 1・2", không chỉ dựa vào màu mà ghi kèm biểu tượng và văn bản trạng thái (cùng §6-3).
- Hàng đợi xét duyệt của bộ phận vận hành sắp xếp các tài liệu phán đoán (có hạn sử dụng ngắn／lượng lưu kho cần xác nhận／không thể xuất hàng／không vấn đề) bằng thẻ tự động xác định, với 3 lựa chọn: phê duyệt・đề xuất ngày thay thế・từ chối (cùng §6-5).
- Tham khảo: Phương án doanh nghiệp kéo thả để thay đổi ngày giao hàng trong tương lai trên lịch của màn hình quản lý (tối đa 3 tháng sau) có tiền lệ sự cố do cập nhật kế hoạch bằng tính lại lead time nên cần xem xét (2026/09/11, §9-2 #6).

#### Ngày nghỉ được đăng ký như "thông tin cần tránh mỗi lần" (không xử lý bằng yêu cầu từng lần・quyết định 2026/09/18)

Yêu cầu "xin đổi ngày này" của doanh nghiệp có lẫn 2 tính chất khác nhau. **Ngày cơ sở không thể nhận hàng lần nào cũng vậy** và **điều chỉnh chỉ lần đó**. Nếu xử lý cái trước bằng yêu cầu từng lần thì sẽ hỏng khi tạo lại chu kỳ, nên phân tách ngay tại thời điểm tiếp nhận.

| Cách đăng ký | Nếu sau đó tạo lại chu kỳ khi 11-13 là ngày nghỉ |
|---|---|
| Phê duyệt như yêu cầu từng lần | Đang phê duyệt "đổi giao hàng 11-13 sang 11-16". Nếu giao hàng chuyển từ 11-13 → 11-12 thì phê duyệt đang nhìn vào 11-13 nên **không còn khớp, giao hàng được tạo vào ngày nghỉ** |
| **Đăng ký như ngày nghỉ của cơ sở** | Giữ "cơ sở này không thể nhận hàng vào 11-13". **Dù tạo lại cũng nhất định tránh** |


| Nội dung yêu cầu | Bản chất | Nơi lưu | Ảnh hưởng của thay đổi chu kỳ |
|---|---|---|---|
| Không thể nhận hàng ngày này (nghỉ kinh doanh・kiểm kê・thi công・cuối năm đầu năm) | **Ràng buộc của cơ sở** | Ngày không thể nhận hàng của cơ sở (§3.1C) | **Không chịu ảnh hưởng.** Mỗi lần sinh lại đều tự động tránh |
| Không thể nhận hàng thứ này | Ràng buộc của cơ sở | Thứ không thể giao hàng của cơ sở (§3.1C) | Không chịu ảnh hưởng |
| Muốn dời lên trước・lùi về sau chỉ lần này | Điều chỉnh của lần đó | Override đã phê duyệt (§4A-4) | Chịu ảnh hưởng. Là đối tượng của re-anchor |
| Lần này không cần (skip) | Điều chỉnh của lần đó | Override đã phê duyệt (§4A-4) | Chịu ảnh hưởng |

> **Tại sao phải tách.** Sau khi phê duyệt "11-13 là ngày nghỉ nên hãy đổi sang 11-16" như một *thay đổi ngày*, nếu do thay đổi ngày đầu chu kỳ mà giao hàng dời từ 11-13 → 11-12 thì phê duyệt nhắm vào 11-13 nên không còn khớp, và **giao hàng được lập vào 11-12 là ngày doanh nghiệp không thể nhận**. Vì phê duyệt vẫn còn hiệu lực nên cũng không xuất hiện trong mục cần xác nhận. Nếu giữ như ràng buộc thì dù giao hàng dời đến đâu cũng tránh được.

- Ngày không thể nhận hàng **doanh nghiệp tự đăng ký** được và bộ phận vận hành phê duyệt (§3.1C). Giảm việc trao đổi yêu cầu・phê duyệt từng lần.
- Với các yêu cầu ở xa (xa hơn tháng sau nữa), trên màn hình tiếp nhận **hướng dẫn sang đăng ký như ràng buộc**. Vì override không chịu được thay đổi chu kỳ (§4A-4) nên càng xa càng sinh hàng loạt hết hiệu lực・đề xuất lại.
- **Override chỉ tiếp nhận đến tháng sau nữa.** Xa hơn thì đăng ký như ràng buộc, hoặc yêu cầu khi tháng đó đã có thể chỉnh sửa.

#### Những điều cần xác nhận trước khi phê duyệt (quyết định 2026/09/18)

Phê duyệt là thao tác chọn ngày ứng viên nên **loại bỏ ngay tại thời điểm cho chọn những ngày không thể**. 1〜6 xác định khi sinh ngày ứng viên. 7 không thể xác định tại thời điểm phê duyệt.

| # | Điều cần xác nhận | Cách xử lý khi không thể |
|---|---|---|
| 1 | Ngày đó có phải ngày giao hàng được không (tạm ngưng chu kỳ・khung không thể giao hàng・ngày được coi là ngày lễ giao hàng・ràng buộc nhận hàng của cơ sở) | Không đưa vào ngày ứng viên |
| 2 | Ngày picking tính ngược có phải ngày xuất hàng được không (ngày nghỉ định kỳ của kho・ngày không thể xuất hàng・khung không thể xuất hàng) | Thử dời lên trước, nếu vẫn không thể thì không đưa vào ngày ứng viên |
| 3 | Lead time có thành lập không | Như trên |
| 4 | **Ngày đó số lượng picking còn dư địa không** | Đưa vào ứng viên nhưng cảnh báo "còn ◯ đơn". Nếu vượt thì bắt buộc xác nhận khi phê duyệt |
| 5 | **Có tuyến giao hàng đi vòng cơ sở đó vào thứ đó không** | Nếu không có tuyến thì không đưa vào ngày ứng viên (vì cần phán đoán lập chuyến khác) |
| 6 | Trường hợp chuyến của công ty vận tải, có phải ngày công ty giao hàng có thể đến lấy hàng không | Không đưa vào ngày ứng viên |
| 7 | Có đảm bảo được tài xế không | **Không thể xác định tại thời điểm phê duyệt.** Vì việc phân công do công ty giao hàng thực hiện từ 1 tuần trước đến ngày trước ngày giao hàng (§4B-4). Chỉ phát hiện bằng giám sát sau đó (§4A-4E) |

#### Căn cứ lưu lại khi phê duyệt (quyết định 2026/09/18)

Ghi lại tiền đề tại thời điểm phê duyệt dưới dạng **snapshot**. Dùng để xác định trong 7 mục trên mục nào bị sụp đổ khi sau này không còn thành lập.

| Mục lưu lại | Mục đích |
|---|---|
| Ngày giao hàng ban đầu tại thời điểm phê duyệt | Xác định tiền đề đã thay đổi sau khi sinh lại hay chưa (§4A-4) |
| Ngày picking・kho được gán・phân loại giao hàng | Xác định nguyên nhân sụp đổ |
| Tuyến giao hàng・loại chuyến | Như trên |
| Số lượng picking tại thời điểm đó | Phân tích nguyên nhân vượt số lượng |
| Phiên bản (revision) cài đặt chu kỳ dùng để xác định | Truy vết tiền đề đã thay đổi ở lần lưu nào |

#### Ý nghĩa và câu chữ của "Đã điều chỉnh" (quyết định 2026/09/18)

Trên màn hình và thông báo thống nhất cách nói sau. Không giải thích bằng dạng phủ định ("không phải 〜").

> **Đã điều chỉnh** — Là ngày do bộ phận vận hành quyết định. Không di chuyển bằng tính toán tự động của hệ thống. Khi cần di chuyển vì lý do kho hoặc giao hàng, **bộ phận vận hành sẽ liên hệ để quyết định lại**.

| Tình huống | Câu chữ |
|---|---|
| Giải thích huy hiệu trạng thái | Là ngày do bộ phận vận hành quyết định. Không di chuyển bằng tính toán tự động của hệ thống |
| Thông báo phê duyệt cho doanh nghiệp | **Đã xác định vào 〈ngày〉.** Nếu cần thay đổi chúng tôi sẽ liên hệ |
| Khi bộ phận vận hành di chuyển | Quyết định lại ngày vì 〈lý do〉. Hãy liên hệ doanh nghiệp |

Việc có thể thực sự đáp ứng được hay không được xác định thường xuyên theo một trục khác (§4A-4E), và nếu phán đoán không thể đáp ứng thì **hạ từ Đã điều chỉnh → Đang đề xuất** và thỏa thuận lại với doanh nghiệp (§4A-3B). Truyền đạt trước điểm **không tự ý di chuyển**, và truyền đạt khả năng di chuyển dưới dạng quy trình "liên hệ để quyết định lại".

---

## 4. Logic tính toán (cốt lõi của triển khai)

### 4.1 Hàm hỗ trợ ngày

Mọi phép tính ngày đều thực hiện **cố định UTC** (`Date.UTC`) để loại bỏ sai lệch do múi giờ.

```js
function mk(y,m,d){ return new Date(Date.UTC(y,m,d)); }
function fmt(dt){ /* "YYYY-MM-DD" */ }
function addDays(dt,n){ return new Date(dt.getTime()+n*86400000); }
function diffDays(a,b){ return Math.round((a-b)/86400000); }
```

### 4.2 Sinh chu kỳ giao hàng

```js
/* Slot gồm 28 khung (A1〜D7), tiến từng ngày một từ A1 lần đầu.
   Không gán slot vào ngày tạm ngưng, cũng không tiêu thụ khung (quyết định 2026/09/19).
   Từ ngày sau khi tạm ngưng kết thúc, tiếp tục lần lượt các khung đã dừng (không bỏ qua khung).
   → Toàn bộ chu kỳ bị lùi về sau bằng số ngày tạm ngưng.
   Tạm ngưng nhất định được làm tròn thành bội số của 7 ngày
   (§2.2 "Điều chỉnh độ lệch"), nên độ lệch cũng theo đơn vị 7 ngày,
   quan hệ tuần × thứ "A1 = Thứ 2・A6 = Thứ 7" được giữ nguyên. */
function buildSchedule(){
  SCHED = {};
  var d = A1 lần đầu (nhất định là Thứ 2), end = ngày cuối của khoảng thời gian đối tượng sinh;
  var i = 0, cycleLabel = "", cycleNo = 0;
  while (d <= end) {
    if (đangTạmNgưng(d)) {
      SCHED[fmt(d)] = { pause: tên khoảng thời gian, wouldBe: slotCode(i), adjust: có phải tạm ngưng để điều chỉnh };  // không tiêu thụ khung
      d = addDays(d, 1);
      continue;
    }
    var si = i % 28, wi = Math.floor(si / 7);                  // 0=A, 1=B, 2=C, 3=D
    if (si === 0) { cycleNo++; cycleLabel = ymLabel(ym(d)); }
    SCHED[fmt(d)] = {
      code : "ABCD"[wi] + (si % 7 + 1),
      week : "ABCD"[wi], cycle: cycleLabel, cycleNo: cycleNo,
      first: (si === 0)
    };
    i++;
    d = addDays(d, 1);
  }
}
```

- **Tháng chu kỳ (tên chu kỳ) = tháng mà khung thứ 14 `B7` thuộc về** (quyết định lần 2 ngày 2026/09/21). **Không tạo nhánh ngoại lệ.**
  - Quy tắc này **luôn cho cùng kết quả với "tháng có nhiều ngày hơn trong 28 ngày của các khung A1〜D7"**. Vì ranh giới giữa 14 ngày đầu và 14 ngày sau của 28 ngày nằm giữa `B7` và `C1`, nên tháng có nhiều ngày hơn nhất định chứa `B7`.
  - **Khi 14 đối 14 bằng nhau cũng vậy, đó là tháng của `B7` = tháng trước** (ví dụ: nếu `A1` = 2027-01-18 thì 1/18〜31 là 14 ngày, 2/1〜14 là 14 ngày, `B7` = 1/31 nên là **chu kỳ tháng 1/2027**). **Không giữ phân chia trường hợp cho trường hợp bằng nhau.**
  - **(Cũ: lần 1 #41 "tháng có nhiều ngày hơn trong 28 ngày. Khi 14 đối 14 bằng nhau, chọn trước hay sau chưa quyết định・tạm thời là tháng của `B7`". Lần 2 ngày 2026/09/21 thống nhất thành "tháng mà `B7` thuộc về", giải quyết điểm chưa quyết. Cũng loại khỏi các mục chưa quyết của §8)**
  - **Chỉ đếm ngày của khung.** Ngày tạm ngưng chu kỳ không tiêu thụ khung nên không tính vào số đếm. Dù do tạm ngưng mà độ dài theo lịch của chu kỳ kéo dài ra, vị trí của `B7` được quyết định bởi thứ tự khung nên tháng chu kỳ không thay đổi (xác nhận 2026/09/21).
  - Ví dụ: Chu kỳ `A1 = 2026-08-31` là 8/31〜9/27. `B7` là 2026-09-13 nên là **`Chu kỳ tháng 9/2026`** (về số ngày cũng vậy, 1 tháng 8 và 27 tháng 9 thì tháng 9 nhiều hơn, cho cùng kết quả).
  - `yyyymm` của ID hợp đồng con (`ID hợp đồng-yyyymm`) cũng được quyết định theo cùng quy tắc.
- Ngày được coi là ngày lễ giao hàng・ngày không thể xuất hàng vẫn được gán slot (vì việc chuyển đổi được thực hiện bằng quy tắc phía hợp đồng・kho). **Chỉ ngày tạm ngưng chu kỳ là không gán slot.**
- Ô của ngày tạm ngưng hiển thị `wouldBe` (**khung sẽ tiếp tục sau khi tạm ngưng kết thúc**). Vì khung không tiến lên trong lúc tạm ngưng nên bất kỳ ngày nào trong khoảng tạm ngưng cũng chỉ cùng một khung. Câu chữ trên màn hình là **"Tiếp tục từ B3"**, không viết "vốn là B3" (vì có thể bị đọc thành dự định thực hiện B3 vào ngày đó).

### 4.3 Xác định ngày không thể

```js
function isHoliday(s){ return tồn tại trong master ngày lễ; }
function defaultDeliveryHoliday(dt){ return isHoliday(fmt(dt)); }
function isDeliveryHoliday(dt){                                       // ngày được coi là ngày lễ giao hàng
  var s = fmt(dt);
  if (override.hasOwnProperty(s)) return override[s];                  // BẬT/TẮT coi là ngày lễ
  return defaultDeliveryHoliday(dt);
}
function isPickClosed(dt){                                             // chỉ không thể Picking
  if (tồn tại fmt(dt) trong Override hoạt động riêng lẻ) return false;
  if (tồn tại fmt(dt) trong ngày không thể riêng lẻ) return true;
  return khungChuKỳKhôngThể[cycleDay[fmt(dt)].slot_code];
}
function deriveDeliveryOffSlots(){                                    // tự động xác định khung không thể giao hàng
  return allSlots.filter(function(slot){
    var prev = slotLiềnTrướcTrongChuKỳ(slot);                        // slot liền trước A1 là D7
    return !khungChuKỳKhôngThể[slot] && khungChuKỳKhôngThể[prev];
  });
}
function leadTimeImpactSlots(leadTime){                               // ứng viên theo lead time
  return allSlots.filter(function(deliverySlot){
    var pickingSlot = lùiLạiTrongChuKỳ(deliverySlot, leadTime);
    return khungChuKỳKhôngThể[pickingSlot];
  });
}
function contractDeliveryOffSlots(contract){                          // khung không thể chọn theo hợp đồng
  return union(
    deriveDeliveryOffSlots(),
    leadTimeImpactSlots(contract.leadTime)
  );
}
function isSiteBlocked(dt, contract){                                  // ngày không thể nhận hàng của cơ sở (§3.1C)
  var s = fmt(dt), md = s.slice(5);                                    // md = "MM-DD"
  return contract.受取制約.some(function(b){
    if (b.状態 !== "有効" || s < b.適用開始) return false;
    if (b.繰り返し === "yearly") return b.日付.slice(5) === md;         // cùng ngày tháng hằng năm
    if (b.種別 === "range")      return s >= b.開始日 && s <= b.終了日;
    return b.日付 === s;
  });
}
function isCompanyClosed(dt, contract){                                // xác định giao hàng theo từng hợp đồng
  if (contract.祝日納品不可 && isDeliveryHoliday(dt)) return true;
  if (isSiteBlocked(dt, contract)) return true;                        // ngày không thể nhận hàng của cơ sở
  return !!contract.納品不可曜日[dt.getUTCDay()];                        // 0=CN, 6=T7
}
```

`deriveDeliveryOffSlots()` trả về 1 khung ngay sau khi khoảng không thể xuất hàng liên tiếp kết thúc. `leadTimeImpactSlots()` trả về các khung mà khung picking lùi lại từ mỗi khung giao hàng bằng lead time của hợp đồng thì không thể. Tại thời điểm thay đổi khung không thể xuất hàng hoặc lead time hợp đồng sẽ tính lại và phản ánh ngay vào hiển thị ảnh hưởng của màn hình cài đặt chu kỳ giao hàng và điều khiển chọn Slot của hợp đồng doanh nghiệp.

### 4.4 Sinh kế hoạch xuất hàng (theo từng chi tiết giao hàng)

```js
function badDeli(dt){ return isCompanyClosed(dt, contract) || isPause(dt); }         // ngày hợp đồng này không thể giao hàng
function badPick(dt){ return isPickClosed(dt) || isPause(dt); }                      // ngày không thể picking

// ① Xác định ngày giao hàng (chuẩn)
var seed  = (mode === "cycle") ? ngày của Slot : ngày chỉ định;
var deli  = nudge(seed, shift, badDeli);        // nếu không thể thì di chuyển theo hướng của hợp đồng (-1 dời lên trước / +1 lùi về sau) đến ngày làm việc

// ② Tính ngược ngày picking
var rawPick = addDays(deli, -leadTime);
var pick    = nudge(rawPick, -1, badPick);      // nếu không thể thì luôn dời lên trước (để kịp giao hàng)

// ③ Lead time thực tế, và chênh lệch với lead time hợp đồng
var actualLead = diffDays(deli, pick);
var gap        = actualLead - leadTime;

// ④ Thu về trong 2 giai đoạn (quyết định 2026/09/21)
//    LT_SLACK = 0 (nguyên tắc)／LT_SLACK_MAX = 1 (giới hạn trên khi bất khả kháng)
//    ① Tìm ngày thu về với chênh lệch 0 lần lượt theo hướng "dời lên trước・lùi về sau" của hợp đồng (giới hạn trên 20 ngày)
//    ② Nếu không có ngày nào, chọn ngày đầu tiên thu về với chênh lệch +1 ngày ("bất khả kháng +1 ngày")
//    ③ Nếu cũng không có, chọn cặp có chênh lệch nhỏ nhất và đưa vào "cần xác nhận"
for (var i = 0; i <= 20; i++) {
  var d  = addDays(seed, i * shift);
  if (!canDeliver(d)) continue;                 // bỏ qua tạm ngưng・ngày được coi là ngày lễ・ngày không thể nhận
  var pk = nudge(addDays(d, -leadTime), -1, badPick);
  var g  = diffDays(d, pk) - leadTime;
  if (!best || g < best.gap) best = { deli:d, pick:pk, gap:g };
  if (g <= LT_SLACK)                  return { ...best, ng:false };        // ①
  if (g <= LT_SLACK_MAX && !ok1) ok1 = { deli:d, pick:pk, gap:g, slack:true };
}
return ok1 ? ok1 : { ...best, ng:true };        // ②／③
// Tuyệt đối không để lại ngày không thể picking.
```

`nudge(dt, dir, bad)` di chuyển từng ngày theo hướng `dir` cho đến khi `bad(dt)` là sai, và trả về cùng với số ngày đã di chuyển (giới hạn trên 20 ngày).

> **Khi không tìm được ngày giao hàng nào trong vòng 20 ngày thì đưa vào cần xác nhận với tên "không thể sinh kế hoạch"** (quyết định 2026/09/21). **Không tự động quyết định ngày.** Kèm theo hợp đồng・cơ sở・chu kỳ・lý do đối tượng, đưa vào "cần xác nhận" của lịch trình vận hành, bộ phận vận hành điều chỉnh số lần giao hàng hoặc slot (§4A-5B・§10-2 #8).

#### Cách xử lý chênh lệch lead time (2026/09/18 → sửa đổi 2026/09/21・2 giai đoạn)

> **① Trước hết tìm với chênh lệch 0. ② Chỉ khi thực sự không thể mới chấp nhận đến +1 ngày. ③ Nếu cũng không thể thì cần xác nhận.**

| Giai đoạn | Điều kiện | Cách chọn | Hiển thị |
|---|---|---|---|
| ① Nguyên tắc | `lead time thực tế − lead time hợp đồng = 0` | Tìm lần lượt theo hướng "dời lên trước・lùi về sau" của hợp đồng, chọn **ngày tìm thấy đầu tiên** | Không có dấu |
| ② Bất khả kháng | Không có một ngày nào của ① | Chọn ngày đầu tiên thu về với chênh lệch **+1 ngày** | Vàng "Bất khả kháng +1 ngày (trong phạm vi cho phép)" |
| ③ Cần xác nhận | Cũng không có ② | Chọn cặp có chênh lệch **nhỏ nhất** | Đỏ "Thực tế N ngày (hợp đồng M ngày・+K ngày)" + **cần xác nhận** |

- ② là phạm vi có thể tự động xác định, nhưng **để lại dấu để sau này xem có thể hiểu "tại sao kéo dài 1 ngày"**. Nếu có số lượng đáng quan tâm trong vận hành thì dùng làm cơ hội xem lại cài đặt khung không thể xuất hàng.
- ③ không tự động xác định mà để bộ phận vận hành xem và có thể phán đoán "ngày này được".

- Nếu chỉ dời lên trước ngày picking để tránh ngày không thể xuất hàng thì **lead time thực tế kéo dài ra**. Nếu ngay sau khung không thể xuất hàng liên tiếp của kho (ví dụ: tuần B Thứ 5〜CN) có giao hàng thì sẽ giao hàng được làm từ 4〜6 ngày trước, **không thành lập với sản phẩm có hạn sử dụng ngắn**.
- Do đó việc dời lên trước lấy **đúng lead time hợp đồng (chênh lệch 0) làm nguyên tắc**, nếu không thu về được thì **dịch ngày giao hàng theo hướng "dời lên trước・lùi về sau" của hợp đồng** để tìm ngày thu về với chênh lệch 0. Không ưu tiên "không di chuyển ngày giao hàng". Chỉ khi thực sự không có ngày chênh lệch 0 mới chấp nhận **đến +1 ngày** (quyết định 2026/09/21).
- **Không để lại ngày không thể picking.** Nếu ở ứng viên nào chênh lệch cũng không thu về trong vòng 1 ngày thì sau khi chọn tổ hợp có chênh lệch nhỏ nhất sẽ đưa ra **cần xác nhận**. Trong cần xác nhận **nhất định hiển thị số ngày chênh lệch** (ví dụ: `Thực tế 5 ngày (hợp đồng 2 ngày・+3 ngày)`), nếu bộ phận vận hành xác nhận không vấn đề thì có thể xác định giữ nguyên ngày đó.
- Biên độ +1 ngày là để cho qua các ngoại lệ có đúng 1 ngày lễ・ngày nghỉ định kỳ chen vào mà không dừng, **không phải biên độ trông cậy ngay từ đầu**. Lệch từ 2 ngày trở lên là khi điều kiện hoạt động của kho thay đổi, và được xử lý như sự việc con người cần xem.
- **Ưu tiên chênh lệch lead time** (quyết định 2026/09/18). Không đặt giới hạn trên cho lượng di chuyển của ngày giao hàng. Việc làm cho hạn sử dụng ngắn thành lập được ưu tiên hơn việc không di chuyển ngày giao hàng.
- **Ngay cả khi tự động chuyển đổi vẫn giữ lead time** (xác nhận 2026/09/19／đổi sang 2 giai đoạn vào 2026/09/21). Nếu nơi chuyển đến là ngày không thể xuất hàng và lead time không thành lập thì **tiếp tục chuyển đổi đến khi tìm thấy ngày thành lập**. Không thỏa hiệp rút ngắn lead time. Chỉ khi tìm đến 20 ngày sau mà không có chênh lệch 0 mới chấp nhận +1 ngày. Việc cần xác nhận "đã di chuyển quá 3 ngày so với khung gốc" tăng lên do đó **đã được tính đến**. Vì thời điểm số lượng có thể dự đoán chỉ giới hạn ở trước sau kỳ nghỉ liên tiếp・cuối năm đầu năm nên sẽ hấp thụ bằng vận hành.
- Tuy nhiên **nếu đã di chuyển quá 3 ngày so với ngày của khung gốc thì là "cần xác nhận"**. Khi ngày không thể kéo dài như kỳ nghỉ liên tiếp hay cuối năm đầu năm, ngày thu về trong chênh lệch 1 ngày có thể lùi lại mấy ngày (ví dụ: 3 ngày nghỉ liên tiếp + T7 CN thì dời lên trước 8 ngày). Với doanh nghiệp thì ngày giao hàng thay đổi lớn nên không tự động xác định mà kèm số ngày di chuyển để hiển thị cho bộ phận vận hành (§4.5).
- **Hiển thị thay đổi độ dài giữa danh sách và chi tiết** (quyết định 2026/09/21・#27).

  | Vị trí | Câu chữ |
  |---|---|
  | Danh sách (hiển thị tháng・tuần・ngày, xuất hàng・quản lý giao hàng) | **Ngắn**. `Dời lên trước 2 ngày` |
  | Màn hình chi tiết・tooltip | **Đầy đủ**. `Đã di chuyển 2 ngày so với B3 gốc (2026-09-17)` |

- Danh sách là màn hình đọc số lượng và thứ tự nên nếu viết cả tình huống từng lần thì dòng không đọc được. Ở chi tiết・tooltip hiển thị toàn bộ khung gốc・ngày gốc・số ngày di chuyển.
- Nếu bộ phận vận hành xác nhận không vấn đề thì có thể xác định giữ nguyên ngày đó.

#### Ngày tạm ngưng không phải đối tượng chuyển đổi (chỉnh lý 2026/09/19)

- `badDeli` / `badPick` bao gồm `isPause(dt)` như trước, **không đặt giao hàng cũng như picking vào ngày tạm ngưng chu kỳ**.
- Tuy nhiên **ngay từ đầu không gán slot vào ngày tạm ngưng chu kỳ** (§4.2). Vì khung đã dừng được tiếp tục sau khi tạm ngưng kết thúc nên `seed` (= ngày của slot) không bao giờ là ngày tạm ngưng. **Không xảy ra chuyển đổi do tạm ngưng**.
- Chuyển đổi xảy ra khi ngày của slot rơi vào **ngày được coi là ngày lễ giao hàng・thứ không thể giao hàng・ngày không thể nhận hàng của cơ sở**. Hướng theo cài đặt của hợp đồng, **không đặt giới hạn trên cho số ngày di chuyển** (giới hạn trên của `nudge` vẫn là 20 ngày như trước). Nếu đã di chuyển quá 3 ngày so với khung gốc thì đưa vào cần xác nhận (§4.5).
- Kỳ nghỉ dài đến mức dù dời 1〜2 ngày cũng không giao hàng được thì **đăng ký như tạm ngưng chu kỳ** thay vì ngày được coi là ngày lễ (cách dùng phân biệt ở §2.2). Không phải hệ thống cắt chuyển đổi mà phân biệt bằng cách đăng ký.

#### Khung được tiếp tục sau tạm ngưng không được lùi về trước kỳ tạm ngưng (2026/09/21)

- Với lần bị lệch khung do tạm ngưng (= lần ngày của slot dịch lùi về sau bằng thời gian tạm ngưng), việc chuyển đổi ngày lễ・ngày không thể nhận sau đó **chỉ tìm theo hướng lùi về sau**. Dù cài đặt của hợp đồng là "dời lên trước" thì riêng lần này không dời lên trước.
- Lý do: Khung đó là khung đã **dừng** do tạm ngưng, giao hàng vào ngày trước tạm ngưng nghĩa là "giao khung đã dừng trước khi dừng" nên không thành lập. Nếu cho phép dời lên trước thì ví dụ khi C6 (Thứ 7) tiếp tục sau tạm ngưng 9/19〜9/25 là thứ không thể giao hàng, nó sẽ vắt qua kỳ tạm ngưng và quay lại 9/18 (Thứ 6).
- Các lần thông thường không dính tạm ngưng thì theo **"Dời lên trước・lùi về sau" của hợp đồng** như trước. Khi giao hàng chỉ định riêng (ngày N hàng tháng／cuối tháng) rơi đúng vào ngày tạm ngưng thì cũng di chuyển theo **"Dời lên trước・lùi về sau" của hợp đồng** như trước (vì ngày chỉ định không phải khung nên quay về trước tạm ngưng cũng được).

#### Quy tắc hướng

| Đối tượng | Hướng | Lý do |
|---|---|---|
| Ngày giao hàng | Cài đặt hợp đồng (dời lên trước／lùi về sau) | Theo sự thuận tiện của khách hàng. Giao sớm hay lùi lại tùy hợp đồng |
| Ngày picking | **Dời lên trước (đến chênh lệch 1 ngày)** | Vì nếu lùi về sau sẽ không kịp giao hàng. Khi vượt quá 1 ngày thì **dịch ngày giao hàng** thay vì ngày picking. **Khi rơi vào ngày không thể xuất hàng cũng xử lý như vậy, cả ngày picking và ngày giao hàng đều là đối tượng chuyển đổi** (2026/09/21・§4A-5B) |

**Phương án dự phòng khi không thể dời lên trước**: Dù hợp đồng đặt dời lên trước, nếu việc dời lên trước không thành lập vì lý do tồn kho・lượng lưu kho, v.v. thì **tự động chuyển sang lùi về sau** và hiển thị lỗi／cảnh báo (REQ-DL-202). Kế hoạch xảy ra chuyển đổi sẽ được thông báo cho bộ phận vận hành với tên "đảo hướng" ngoài việc xác định ở §4.5.

**Nhiệt độ**: Vì hàng đông lạnh và hàng lạnh được sinh thành bản ghi riêng nên cùng ngày giao hàng nhưng ngày picking・kho có thể khác nhau (REQ-DL-301).

### 4.5 Hiển thị kết quả xác định

| Điều kiện | Hiển thị | Màu dòng |
|---|---|---|
| `Lead time thực tế = cài đặt + 1 ngày` | Pill vàng "Bất khả kháng +1 ngày (trong phạm vi cho phép)" (không có ngày chênh lệch 0, phạm vi đã chọn ở ②) | Vàng |
| `Lead time thực tế > cài đặt + 1 ngày` | Pill đỏ "Lead time thực tế N ngày (hợp đồng M ngày・+K ngày)" + **cần xác nhận** | Đỏ |
| **Ngày giao hàng đã di chuyển quá 3 ngày so với khung gốc** | Pill đỏ "Dời lên trước ngày giao hàng N ngày" + **cần xác nhận** | Đỏ |
| Ngày giao hàng đã được chuyển đổi | Pill vàng "Dời lên trước／lùi về sau ngày giao hàng N ngày" | Vàng |
| Chỉ ngày picking được điều chỉnh | Pill vàng "Điều chỉnh ngày picking" | Vàng |
| Lead time thực tế ≠ giá trị cài đặt và có đảo hướng | Pill đỏ "Tự động chuyển sang lùi về sau" + cảnh báo | Đỏ |
| Bộ phận vận hành di chuyển ngày thủ công | Hiển thị nhấn mạnh màu đỏ (di chuyển thủ công) | Đỏ |
| Không có điều nào ở trên | Pill xanh lá "Đúng kế hoạch" | Bình thường |

- **Kế hoạch di chuyển thủ công được nhấn mạnh bằng màu đỏ, v.v. để phân biệt được với dữ liệu thông thường và dữ liệu phân bổ tự động của hệ thống** (REQ-DL-204).
- Khi di chuyển thủ công ngày picking khiến ngày giao hàng muộn hơn ngày khách hàng mong muốn thì hiển thị cảnh báo trên màn hình (không dừng xử lý, REQ-DL-105).
- **Chuyển đổi・không thể・cần xác nhận nhất định kèm lý do** (quyết định 2026/09/12). Lý do có dạng "Coi là ngày lễ giao hàng: 〈tên ngày lễ〉", "Thứ không thể giao hàng: thứ 〈thứ〉", "Khung không thể xuất hàng 〈slot〉 (〈kho〉)", "Ngày không thể xuất hàng: 〈lý do〉", "Tạm ngưng chu kỳ: 〈tên khoảng thời gian〉", "Lượng lưu kho cần xác nhận", và hiển thị ở pill xác định・ô lịch・ngày ứng viên・danh sách theo ngày.

#### Ví dụ tính toán (lead time 2 ngày, cài đặt dời lên trước)

| Trường hợp | Ngày giao hàng (chuẩn) | Ngày picking | Xác định |
|---|---|---|---|
| Thông thường | 2026-08-12 (Thứ 4) Slot B3 | 2026-08-10 (Thứ 2) | Đúng kế hoạch |
| Ngày tính ngược là ngày không thể xuất hàng riêng lẻ, CN cũng không thể | 2026-08-12 (Thứ 4) Slot B3 | 2026-08-10 (Thứ 2) → **2026-08-08 (Thứ 7)** | Điều chỉnh ngày picking 2 ngày |
| Ngày giao hàng là Chủ nhật (không thể nhận) | 2026-09-13 (CN) → **2026-09-11 (Thứ 6)** | 2026-09-09 (Thứ 4) | Dời lên trước ngày giao hàng 2 ngày |
| Ngày giao hàng là ngày lễ, trước sau cũng nghỉ liên tiếp | 2026-09-23 (Ngày Thu phân) → **2026-09-18 (Thứ 6)** | 2026-09-16 (Thứ 4) | **Đỏ: dời lên trước ngày giao hàng 5 ngày + cần xác nhận** (vì đã di chuyển **quá 3 ngày** so với khung gốc. Sửa 2026/09/21. Bản cũ ghi là vàng "Dời lên trước ngày giao hàng 5 ngày" nhưng không khớp với bảng xác định ở §4.5) |
| Khi đổi sang cài đặt lùi về sau | 2026-09-23 → **2026-09-24 (Thứ 5)** | 2026-09-22 (Thứ 3) | Vàng: lùi về sau ngày giao hàng 1 ngày |

> **Việc xác định được quyết định bởi bảng §4.5.** Khi di chuyển ngày giao hàng **trong vòng 3 ngày là vàng**, **quá 3 ngày là đỏ + cần xác nhận**. Chênh lệch lead time thực tế **0 là không có dấu／+1 ngày là vàng／+2 ngày trở lên là đỏ + cần xác nhận** (§4.4). Dòng "điều chỉnh ngày picking" trong bảng trên cũng vậy, nếu lead time thực tế dài hơn hợp đồng từ 2 ngày trở lên thì là đỏ + cần xác nhận, và theo §4.4 ②③ cũng tìm ứng viên dịch ngày giao hàng.

---

## 4A. Kế hoạch giao hàng và dữ liệu giao hàng (cấu trúc hai tầng)

Hợp đồng được tự động gia hạn hằng tháng và dữ liệu hợp đồng được sinh theo tháng. Mặt khác, chu kỳ giao hàng được cài đặt trước tối đa 6 tháng.
Nếu xử lý hai thứ này bằng cùng một bản ghi thì không giải được câu hỏi "có được tính lại kế hoạch đã tạo trước hay không", nên **chia tách kế hoạch (kế hoạch giao hàng) và vận hành (dữ liệu giao hàng) thành các tầng khác nhau**.

### 4A-1. Vai trò của hai tầng

| Tầng | Bản ghi | Nguồn sinh | Thông tin giữ | Tính lại | Công khai cho doanh nghiệp |
|---|---|---|---|---|---|
| Kế hoạch giao hàng (plan) | `shipping_plans` | Cài đặt chu kỳ giao hàng × cài đặt giao hàng của hợp đồng | Ngày giao hàng・ngày picking・slot・**kho được gán・công ty giao hàng**・lead time thực tế・**số lượng dự kiến (`estimated_qty`)** | Có (sau khi tạo lại thì áp dụng lại override) | **Có** (**chỉ ngày. Không cho xem số lượng**) |
| Dữ liệu giao hàng (delivery) | `deliveries` | Batch tự động gia hạn hợp đồng hằng tháng sinh xác định từ kế hoạch | Như trên + số phiếu gửi hàng・tuyến・tài xế・số lượng xác định đơn hàng・kết quả・thu tiền・đính kèm | Không | Có (bao gồm số lượng・kết quả) |

- **Tính toán ngày chỉ thực hiện ở kế hoạch giao hàng.** Dữ liệu giao hàng chỉ kế thừa kế hoạch, không tính lại riêng. Là nguyên tắc để không giữ logic tính toán trùng lặp.
- **Kế hoạch giao hàng giữ nội bộ số lượng dự kiến (`estimated_qty`)** (quyết định lần 2 ngày 2026/09/21). Giá trị là số lượng tiêu chuẩn phân bổ số lượng gói của hợp đồng theo số lần giao hàng (§3.2), và được chuyển sang `deliveries.planned_qty` khi sinh xác định. **Trong lúc là `draft` chỉ là không cho doanh nghiệp xem số lượng**, **không phải "kế hoạch không có số lượng"** (§4A-7・S1). Vì cần cho việc ước tính số đơn・tải trọng và tự động xác định bằng số lượng tiêu chuẩn (§4A-2D) nên nội bộ luôn giữ.
- Kho・công ty giao hàng được tham chiếu từ **gán hiện tại của hợp đồng** ngay từ giai đoạn kế hoạch. Nhờ vậy, ngay cả yêu cầu của 6 tháng sau cũng có thể xác định ngày không thể xuất hàng・ngày không thể giao hàng ủy thác.
- Việc yêu cầu・báo giá・gửi mail xác định thực tế cho công ty giao hàng ủy thác được thực hiện từ sau khi trở thành dữ liệu giao hàng (không phải giữ chỗ khung của 6 tháng sau).

### 4A-2. Thời điểm sinh (sửa đổi 2026/09/15・phương án A)

> **Lý do sửa đổi**: Bản cũ giả định **ngày dương lịch** như "ngày 1 hằng tháng" "ngày chốt đơn (khoảng ngày 20 tháng này)". Tuy nhiên chu kỳ giao hàng quay theo 4 tuần và **ngày đầu chu kỳ (A1) nhất định là Thứ 2 nên không trùng với ngày 1 dương lịch** (§4.2. A1 cũng có thể là ngày cuối tháng trước). Nếu cố định vào ngày dương lịch thì sau vài tháng sẽ lệch, nên **các mốc đều được quyết định bằng ngày tương đối so với A1**, và **batch không khởi động theo ngày mà theo cách "nhặt mỗi ngày phần chưa xử lý đã qua ngày chuẩn"**.

#### Các mốc tham chiếu cài đặt phía menu (sửa đổi 2026/09/15)

**Phía menu là nguồn đúng**. Ngày của các mốc không tính ở phía chu kỳ giao hàng mà **sao chép ngày thực được cài đặt ở phía menu**. **Thời gian đặt hàng là mục cài đặt của menu** và có thể thay đổi theo từng tháng・từng menu, nên phía chu kỳ giao hàng không tự tính riêng.

> **Khi sinh chu kỳ thì sao chép ngày thực để giữ và hiển thị trên màn hình** (quyết định 2026/09/21). Không phải mỗi lần đi lấy menu mà giữ ngày cài đặt của menu tại thời điểm sinh chu kỳ vào chu kỳ (`delivery_cycles.menu_open_date` / `order_start_date` / `order_close_date`). Dùng giá trị đã giữ cho màn hình・xác định batch・lịch doanh nghiệp. **Khi menu chưa đăng ký thì giữ ngày 15 tháng trước làm hạn chót tạm thời** (`marker_source = provisional`), và thay bằng ngày thực tại thời điểm menu được đăng ký (§4A-2E). **Trong lúc là hạn chót tạm thời thì không chạy xác định số lượng・mail xác định・chỉ thị xuất hàng** (quyết định lần 2 ngày 2026/09/21・§4A-2E).

> **Không giữ hạn chót thay đổi** (sửa đổi 2026/09/15). Kết thúc tiếp nhận thay đổi ngày **cùng thời điểm với hạn chót đặt hàng**. Nếu tách thời điểm số lượng được xác định và thời điểm ngày được cố định thì sẽ phát sinh khoảng thời gian chỉ bộ phận vận hành mới có thể dịch ngày sau hạn chót, còn nguy cơ số lượng đã xác định và ngày giao hàng lệch nhau. Điều này cũng khớp với "hạn chót tiếp nhận thay đổi khớp với hạn chót của thời gian đặt hàng" (REQ-DL-624).

| Mốc | Nguồn | Giá trị mặc định của demo | Ví dụ chu kỳ tháng 9/2026 (A1＝2026-08-31) |
|---|---|---|---|
| **Công bố menu = bắt đầu đặt hàng** | **Phía menu (bắt đầu thời gian đặt hàng)** | **Ngày 1 tháng trước** | 2026-08-01 |
| (Đăng ký menu) | Phía menu | Đến ngày công bố | 〜2026-08-01 |
| **Hạn chót đặt hàng** | **Phía menu (kết thúc thời gian đặt hàng)** | **Ngày 15 tháng trước** | 2026-08-15 |

**Tương ứng giữa chu kỳ và menu**: Chu kỳ là 4 tuần, menu là tháng dương lịch nên chu kỳ khác nhau. Dùng **menu của tháng chu kỳ (= tháng mà khung thứ 14 `B7` thuộc về・quyết định lần 2 ngày 2026/09/21)** làm mốc của chu kỳ đó. Trong ví dụ trên, "menu tháng 9/2026" có thời gian đặt hàng 2026-08-01〜2026-08-15 có hiệu lực với chu kỳ tháng 9/2026 (A1＝8/31).

- **Ở demo cố định hiển thị thời gian đặt hàng = ngày 1 tháng trước〜ngày 15 tháng trước**. Giá trị vận hành thực tế theo cài đặt phía menu.
- **Khi triển khai không dùng ngày hằng số.** Nhất định tham chiếu ngày thực của phía menu để xác định (cùng nguyên tắc với xác định ngày chốt ở màn hình chi tiết yêu cầu §3.3).
- Phía chu kỳ giao hàng (A1・ngày giao hàng・ngày picking) có chu kỳ 4 tuần, thời gian đặt hàng là tháng dương lịch. **Cả hai hoạt động độc lập** nên batch không khởi động bằng "hôm nay là ngày mấy" mà theo cách **"nhặt mỗi ngày phần đã qua ngày chuẩn và chưa xử lý"** (mục sau). Chỉ cách này mới không hỏng dù phía chu kỳ hay phía menu thay đổi.
- Với tiền đề công bố menu, xác minh chu kỳ giao hàng của tháng đó đã được cài đặt (§2.0C-3).

#### Cài đặt ban đầu (khi lưu cài đặt chu kỳ giao hàng)

1. Sinh kế hoạch giao hàng cho khoảng thời gian cài đặt (mặc định 6 tháng) từ **hợp đồng của tháng này**. Không phải từ tháng sau.
2. Trong đó, **chu kỳ đã qua ngày bắt đầu đặt hàng sẽ được sinh xác định đến tận dữ liệu giao hàng ngay tại chỗ**.
3. Các chu kỳ sau đó giữ nguyên là kế hoạch giao hàng.

#### Batch hằng ngày — 3 loại sinh có trigger khác nhau

Không khởi động vào ngày cố định mà **nhặt "phần đã qua ngày chuẩn và chưa xử lý" lúc 02:00 mỗi ngày**. Vì UPSERT bằng idempotency key nên dù chạy hai lần cũng không hỏng.

> **Khóa duy nhất của kế hoạch giao hàng là `contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** (quyết định lần 2 ngày 2026/09/21). `occurrence_key` là giá trị chỉ duy nhất lần này trong chu kỳ đó (slot `A1`〜`D7`, hoặc ngày chỉ định riêng "ngày N hàng tháng" "cuối tháng hàng tháng"). **Không dùng `(contract_id, delivery_date)`** (**cũ: REQ-DL-721 "kế hoạch giao hàng là duy nhất theo (ID hợp đồng, ngày giao hàng)" bị hủy. Thay đổi ở lần 2 ngày 2026/09/21**). Vì 1 hợp đồng có thể có nhiều nhiệt độ・phân loại giao hàng trong cùng một ngày, việc sinh và sinh lại (thay thế) đều đối chiếu bằng khóa này (§2.0A・§11-1). **Chỉ hợp đồng con có trigger khác**, có thể được tạo trước dữ liệu giao hàng theo lead time thanh toán (§4A-2B).

| Điều kiện nhặt | Xử lý |
|---|---|
| **Chu kỳ chưa sinh đã qua ngày chuẩn sinh hợp đồng con** (§4A-2B) | Sinh hợp đồng con, chốt snapshot giá |
| **Chu kỳ đã qua ngày bắt đầu đặt hàng** | ① **Sinh xác định (materialize)** kế hoạch giao hàng thành dữ liệu giao hàng → ② Sinh khung đặt hàng (số lượng tiêu chuẩn làm giá trị ban đầu) → ③ Nếu chưa sinh hợp đồng con thì sinh tại đây |
| ~~Đồng thời~~ | **Không thực hiện sinh cuốn chiếu (rolling)** (sửa đổi 2026/09/19). Kế hoạch chỉ được tạo khi bộ phận vận hành lưu cài đặt chu kỳ giao hàng, batch không tự động thêm vào cuối khoảng thời gian |
| **Chu kỳ đã qua ngày hạn chót đặt hàng** | **Xác định số lượng** của đơn hàng, ghi số lượng xác định vào dữ liệu giao hàng (không phải tạo bản ghi). **Cơ sở đến hạn chót mà không có đơn hàng sẽ xác định bằng số lượng tiêu chuẩn／chế độ AI** (§4A-2D). Đồng thời **cố định chế độ thay đổi ngày ở OFF** (§5.0) |
| **Tháng thanh toán đã qua ngày chốt thanh toán** | Kiểm tra hợp đồng con cần có trong tháng thanh toán đó đã đủ chưa, nếu thiếu thì đưa vào "cần xác nhận" (**phát hiện sót thanh toán**・§4A-2B) |

> **Phân loại giao hàng "vật tư" nằm ngoài đối tượng của bảng này.** Dữ liệu giao hàng vật tư được tạo vào thời điểm có đơn hàng vật tư (§4A-2C).
> **Hạn chót đặt hàng không phải "trigger sinh" mà là "điểm xác định số lượng".** Vì doanh nghiệp đặt hàng đối với dữ liệu giao hàng đã sinh nên dữ liệu giao hàng cần tồn tại từ thời điểm bắt đầu đặt hàng (khớp với sửa đổi 2026/09/14).
> **Kế hoạch không tự động đẩy về sau** (quyết định 2026/09/19). Kế hoạch chỉ được tạo **khi lưu cài đặt chu kỳ giao hàng**, đối tượng giới hạn ở khoảng thời gian bộ phận vận hành đã cài đặt (tối đa 6 tháng). Batch không tính ngày mới mà chỉ **xác định những kế hoạch đã có**.
> **Không đưa ra cảnh báo trước khi gần hết khoảng thời gian.** Tháng chưa cài đặt khoảng thời gian tiếp theo **không thể công bố menu** nên sẽ dừng tại thời điểm định công bố (§2.0C-3). Vì sót cài đặt nhất định được nhận ra ở cửa công bố nên không có cơ chế đếm ngày để nhắc.

#### 4A-2D. Số lượng khi đến hạn chót mà không có đơn hàng (xác nhận 2026/09/19)

Dù đến hạn chót mà doanh nghiệp không đặt hàng, **dữ liệu giao hàng nhất định được xác định với số lượng**. Không tạo tình huống để trống và tiến hành rồi đến ngày mới nhận ra.

| Cài đặt của cơ sở (hợp đồng) | Số lượng khi đến hạn chót |
|---|---|
| **Chế độ AI OFF** (mặc định) | Xác định bằng **số lượng tiêu chuẩn**. Số lượng tiêu chuẩn là giá trị phân bổ số lượng gói của hợp đồng theo số lần giao hàng (§3.2) |
| **Chế độ AI ON** | **AI tự động cài đặt số lượng**. Nhập giá trị ước tính theo từng cơ sở từ kết quả quá khứ |

- **Chế độ AI là ON／OFF theo từng cơ sở (hợp đồng)**. Không đồng nhất theo doanh nghiệp. Giữ mục trong cài đặt giao hàng của hợp đồng (màn hình 02).
- Trong cả hai trường hợp, **lưu lại trong dữ liệu số lượng đã xác định là số lượng tiêu chuẩn hay giá trị AI nhập** (`order_quantity_source = ordered | standard | ai`). Để có thể giải thích "ai đã quyết định số lượng" khi tra cứu thanh toán và kết quả.
- Màn hình doanh nghiệp hiển thị số lượng sau khi xác định. **Không giấu việc đã tự động nhập** (để doanh nghiệp nhận ra mình đã quên đặt hàng).

#### 4A-2E. Khi menu chưa đăng ký và không xác định được hạn chót (quyết định 2026/09/19)

Vì ngày của các mốc được lấy từ phía menu nên **tháng chưa đăng ký menu không lấy được ngày hạn chót đặt hàng**. Trường hợp đó không dừng xác định mà coi **ngày 15 tháng trước là hạn chót tạm thời**.

**Các xử lý được phép chạy với hạn chót tạm thời (`marker_source = provisional`) bị giới hạn** (quyết định lần 2 ngày 2026/09/21).

| Xử lý | Hạn chót tạm thời (`provisional`) | Hạn chót thực (`menu`) |
|---|---|---|
| **Kết thúc tiếp nhận thay đổi** (đặt chế độ thay đổi ngày thành OFF) | **Chạy** | Chạy |
| **Khởi động kiểm tra** (đối chiếu như `plan_recheck`・sinh cần xác nhận) | **Chạy** | Chạy |
| **Xác định số lượng** (`order_finalize`・xác định bằng số lượng tiêu chuẩn／chế độ AI) | **Không chạy** | Chạy |
| **Gửi mail xác định** (thông báo xác định cho doanh nghiệp・công ty giao hàng ủy thác) | **Không chạy** | Chạy |
| **Chỉ thị xuất hàng** (gửi cho Thomas. Do đó cũng không chuyển thành `locked`) | **Không chạy** | Chạy |

- **Cho đến khi hạn chót thực đến từ menu thì không chạy xác định số lượng・mail xác định・chỉ thị xuất hàng.** Hạn chót tạm thời là **giá trị mặc định xác định nội bộ**, không phải ngày đã hứa với doanh nghiệp hay kho. Nếu chốt số lượng bằng ngày tạm thời và đẩy đến chỉ thị xuất hàng thì khi menu đăng ký sau đó làm hạn chót thay đổi sẽ không thể lấy lại.
- **(Cũ: Lần 1 #33 "Nếu menu chưa đăng ký thì ngày 15 tháng trước là hạn chót tạm thời" không có giới hạn phạm vi được làm với hạn chót tạm thời. Lần 2 ngày 2026/09/21 giới hạn như bảng trên)**
- Trên màn hình, hiển thị kèm **"Tạm thời (ngày 15 tháng trước)"** ở ngày hạn chót, và thay bằng ngày thực tại thời điểm menu được đăng ký. Sau khi thay, `order_finalize` trở đi lần đầu tiên được nhặt làm đối tượng.
- Ở màn hình chi tiết chế độ kế hoạch vẫn hiển thị ngày là "chưa định" như trước (§4A-7). Hạn chót tạm thời là giá trị mặc định xác định nội bộ, không phải ngày hứa với doanh nghiệp.

#### 4A-2B. Việc sinh hợp đồng con được quyết định bởi lead time thanh toán (thêm 2026/09/15)

Dữ liệu giao hàng・đơn hàng chỉ cần tạo vào "ngày bắt đầu đặt hàng", nhưng **hợp đồng con có khi cần sớm hơn**. Thời điểm thanh toán trả trước khác nhau tùy doanh nghiệp, có **doanh nghiệp xuất hóa đơn trước 2 tháng** và **doanh nghiệp trả trước một năm một lần**. Nếu không có hợp đồng con thì không thể theo dõi trạng thái thanh toán của tháng thanh toán đó và **không nhận ra sót thanh toán**.

**Ngày chuẩn sinh = ngày sớm hơn trong hai ngày sau** (sửa đổi 2026/09/21)

1. **1 tháng trước** ngày chốt thanh toán (ngày 25) của tháng thanh toán có chu kỳ đó
2. **Ngày bắt đầu đặt hàng** (quyết định 2026/09/21. Cũ: "ngày trước ngày bắt đầu đặt hàng" bị hủy)

> **Tại sao cần giới hạn dưới.** Nếu chỉ dùng 1 của thanh toán tháng này thì ngày chuẩn sinh của chu kỳ tháng 9/2026 là 2026-08-25. Tuy nhiên dữ liệu giao hàng được tạo vào ngày bắt đầu đặt hàng (2026-08-01) nên **dữ liệu giao hàng được tạo trước hợp đồng con**. Đặt ngày bắt đầu đặt hàng làm giới hạn dưới để giữ thứ tự bất kể mẫu thanh toán.
>
> **Ngày sinh hợp đồng con của thanh toán tháng này là "ngày bắt đầu đặt hàng"** (quyết định 2026/09/21). Để **khớp cùng ngày** với sinh xác định dữ liệu giao hàng, dời sang ngày trước không có ý nghĩa. Nếu trong batch hằng ngày của cùng ngày xử lý theo thứ tự **hợp đồng con → dữ liệu giao hàng** thì "hợp đồng con trước, dữ liệu giao hàng sau" được giữ (chuỗi job §11-1. `contract_monthly_generate` 01:30 → `delivery_materialize` 02:30).

| Mẫu thanh toán | Sinh hợp đồng con | Ví dụ chu kỳ tháng 9/2026 (A1＝2026-08-31) |
|---|---|---|
| Thanh toán tháng này (tiêu chuẩn) | **Ngày bắt đầu đặt hàng** (giới hạn dưới có hiệu lực・sửa đổi 2026/09/21) | Sinh vào 2026-08-01 → thanh toán tháng 9/2026 |
| **Thanh toán trước 2 tháng** | Sinh trước **2 tháng** so với tháng chu kỳ | Sinh trước 2026-06-25 → thanh toán tháng 7/2026 |
| **Trả trước một năm một lần** | **Sinh gộp 12 chu kỳ** vào tháng bắt đầu hợp đồng・tháng gia hạn | 12 bản ghi từ tháng 4/2026 đến tháng 3/2027 vào 2026-04 |

- Dù thời điểm sinh khác nhau, **hình dạng hợp đồng con được tạo là giống nhau** (`ID hợp đồng-yyyymm`, `yyyymm` là tháng chu kỳ). Tháng thanh toán giữ ở `billing_month`, tháng đối tượng trả trước giữ ở `advance_target_month`.
- Hợp đồng con tạo trước giữ nguyên ở trạng thái **`generated` (chưa xác định)**. Dữ liệu giao hàng・đơn hàng được sinh sau vào ngày bắt đầu đặt hàng và gắn với cùng hợp đồng con. **Hợp đồng con trước, dữ liệu giao hàng sau** là trạng thái bình thường.
- **Nếu hợp đồng con đã được tạo trước thì kế hoạch của chu kỳ đó dùng snapshot tuyến của hợp đồng con** (quyết định lần 2 ngày 2026/09/21). **Chỉ dùng giá trị mặc định của hợp đồng cha khi hợp đồng con của tháng đó chưa có.** Khi hợp đồng con của 12 chu kỳ đã có trước như trả trước một năm một lần thì kế hoạch của các tháng sau cũng được tạo từ hợp đồng con chứ không phải hợp đồng cha. Lưu lại việc đã dùng cái nào ở `shipping_plans.route_snapshot_source` (`contract_month` / `contract`) (§3.1B・§7).
- **Trả trước một năm một lần có đơn vị thanh toán là 12 chu kỳ** nên sinh gộp 12 bản ghi bằng ngày chuẩn của chu kỳ đầu tiên. Nếu có điều chỉnh giá trong kỳ thì lấy từng điều chỉnh áp dụng cho từng tháng chu kỳ để chụp snapshot.
- **Khi có thay đổi gói**: Hợp đồng con trước chưa thanh toán (`generated`) thì sinh lại・đính chính snapshot. Phần đã thanh toán không đính chính mà phản ánh vào tháng sau trở đi bằng `contract_monthly_adjust` (③ điều chỉnh).
- **Khi hủy hợp đồng・tạm ngưng được phê duyệt**: **Hủy hợp đồng con trước chưa thanh toán** từ tháng áp dụng trở đi (cùng thời điểm với xóa kế hoạch giao hàng đã tạo trước. §4A-6). Với hợp đồng tạo trước 1 năm thì đối tượng hủy lớn nên hiển thị số lượng hủy trên màn hình phê duyệt.
- **Phát hiện sót thanh toán**: Vào ngày chốt thanh toán, phát hiện trường hợp "hợp đồng con cho hợp đồng có hiệu lực không tồn tại trong tháng thanh toán đó" và đưa vào "cần xác nhận" của lịch trình vận hành. Vì chọn sinh trước nên việc phát hiện này là **mạng lưới an toàn duy nhất**.
#### 4A-2C. Dữ liệu giao hàng của vật tư được tạo từ đơn hàng vật tư (bổ sung 2026/09/15)

Loại giao hàng "Vật tư" không phải là giao hàng theo chu kỳ hàng tháng như món ăn kèm hay đông lạnh. **Dữ liệu giao hàng được tạo ngay tại thời điểm có đơn hàng vật tư**.

| | Món ăn kèm·đông lạnh·nhiệt độ thường | **Vật tư** |
|---|---|---|
| Trigger tạo | **Ngày bắt đầu đặt hàng** (batch hằng ngày) | **Mỗi lần xác nhận giỏ hàng vật tư** (ngay lập tức). Nếu đã có dữ liệu giao hàng vật tư cùng cơ sở·cùng ngày giao·chưa gửi chỉ thị xuất hàng thì thêm dòng chi tiết vào đó (2026/09/29 [quyết định v2.3 #36]. Cũ: khi có đơn hàng vật tư) |
| Kế hoạch giao hàng (`shipping_plans`) | Tạo từ chu kỳ | **Không có** (không có giai đoạn kế hoạch) |
| Chốt số lượng | Ngày chốt đặt hàng | Cùng lúc xác nhận giỏ hàng vật tư |
| Ngày giao | Từ chu kỳ·chỉ định riêng | **Ngày giao khả dụng đầu tiên từ ngày hôm sau của ngày đặt hàng trở đi và đảm bảo lead time** (ngày xuất = ngày giao − lead time·2026/09/29 [quyết định v2.3 #38]) |
| Chỉ thị xuất hàng | Gom hằng ngày (catch-up) | **Cũng gửi bằng gom hằng ngày** (2026/09/29 [quyết định v2.3 #36]) |
| Giao hàng | Theo loại giao hàng của hợp đồng (kho·công ty vận chuyển·trung chuyển) | Gửi trực tiếp bằng Yamato. Không đi theo luồng giao hàng hiện tại (§4C-3) |

- Đơn hàng vật tư gồm **① bộ khởi tạo** (tự động tạo khi trial / hợp đồng mới được thành lập·REQ-PO-217) và **② đơn hàng vật tư thông thường** (doanh nghiệp đặt bất cứ lúc nào. Từ lần thứ 2 trở đi có tính phí). **Cả hai đều tạo dữ liệu giao hàng mỗi lần xác nhận giỏ hàng. Tuy nhiên, nếu đã có dữ liệu giao hàng vật tư cùng cơ sở·cùng ngày giao mà chưa gửi chỉ thị xuất hàng (không có chỉ thị xuất hàng `ok`) thì không tạo mới mà thêm dòng chi tiết vào đó để gộp thành 1 bản ghi** (2026/09/29 [quyết định v2.3 #36]. Để không mâu thuẫn với quy tắc không xuất gộp, việc gộp thành 1 bản ghi được thực hiện ở giai đoạn dữ liệu giao hàng. Cũ: tạo 1 dữ liệu giao hàng tại thời điểm có đơn hàng).
- Vật tư không thuộc đối tượng của chu kỳ giao hàng nên **không thực hiện phán định tạm dừng chu kỳ**. **Ngày giao là "ngày giao khả dụng đầu tiên từ ngày hôm sau của ngày đặt hàng trở đi và đảm bảo lead time", việc phán định ngày lễ giao hàng·thứ không giao được·ngày không nhận được·ngày không xuất được giống như thông thường** (2026/09/29 [quyết định v2.3 #38]. (Cũ: không thực hiện phán định tạm dừng chu kỳ·khung không xuất được·coi ngày lễ giao hàng. Chốt·picking·gửi theo chu kỳ hằng tuần phía vật tư. Thay thế 2026/09/29 [quyết định v2.3 #38])).
- Vì **không tồn tại giai đoạn kế hoạch (`draft`)**, ngay khi được tạo sẽ xuất hiện ở trạng thái `published`. Cũng xuất hiện trên lịch của doanh nghiệp sau khi được tạo.
- Việc hợp đồng có loại giao hàng "Vật tư" và có phân bổ kho·công ty vận chuyển vẫn không đổi. **Chỉ là không tự động tạo từ chu kỳ**.

> **Đã giải quyết (2026/09/29 [quyết định v2.3 #36])**: "Khi có" đơn hàng vật tư là **mỗi lần xác nhận giỏ hàng**. Phần cùng cơ sở·cùng ngày giao·chưa gửi chỉ thị xuất hàng được gộp thành 1 bản ghi, chỉ thị xuất hàng được gửi bằng catch-up hằng ngày hiện có. (Cũ: cần xác nhận "mỗi lần xác nhận giỏ hàng hay gộp theo hạn chốt hằng tuần của phía vật tư")

#### Khi chu kỳ vắt qua tháng (phương án A·quyết định 2026/09/15)

Nếu A1 là cuối tháng (ví dụ 2026-08-31) thì việc giao hàng của 1 chu kỳ trải qua 2 tháng dương lịch. Khi đó **1 chu kỳ = 1 hợp đồng con**, và **gắn vào hợp đồng con của tháng chu kỳ (= tháng mà khung thứ 14 `B7` thuộc về·quyết định lần 2 ngày 2026/09/21)**. Ví dụ 8/31〜9/27 có `B7` = 2026-09-13 nên là **chu kỳ tháng 9/2026**. **Dù 14 đối 14 bằng nhau cũng không tạo nhánh ngoại lệ** (§4.2).

| Đối tượng | Gắn vào |
|---|---|
| Phí cố định của gói·đơn hàng (phán định giới hạn số lượng cung cấp hàng tháng) | **Tháng chu kỳ** |
| Giao từng phần·giao lại·spot·thanh toán bổ sung | **Tháng dương lịch của ngày giao** (giữ nguyên quyết định 2026/09/13) |

- Vì đơn hàng tính theo đơn vị chu kỳ nên **phán định giới hạn của gói và hợp đồng con là 1 đối 1**. Phán định giới hạn không bị chia ở ranh giới tháng.
- `yyyymm` trong mã hợp đồng con `ID hợp đồng-yyyymm` chỉ **tháng chu kỳ**. Vì có thể không trùng với tháng thanh toán nên tháng thanh toán được giữ riêng ở `billing_month`.

### 4A-3. Chuyển trạng thái của kế hoạch (plan lifecycle)

> **Có 2 máy trạng thái** (quyết định lần 2 ngày 2026/09/21). **`plan lifecycle`** (`draft` / `published` / `locked`) ở mục này biểu thị "**từ khi nào không được chạm vào nữa**", còn **`delivery status`** (chờ xuất … đã giao) ở §4A-3B biểu thị "**hàng đã đi đến đâu**". **Không gọi chung cả hai là "trạng thái". Bảng chuyển trạng thái cũng tách riêng.** 1 dữ liệu giao hàng có đồng thời cả hai giá trị (ví dụ: `lifecycle = locked` và `status = Đã nhận`).

| `lifecycle` | Thực thể | Khi nào | Từ phía doanh nghiệp | Ảnh hưởng khi đổi thiết lập |
|---|---|---|---|---|
| `draft` (kế hoạch) | Chỉ có kế hoạch giao hàng | Từ lúc thiết lập lịch đến trước khi chốt đặt hàng | Xem được (**chỉ ngày**)·có thể gửi yêu cầu thay đổi | Tạo lại, áp dụng lại override |
| `published` (đã xác định) | Có dữ liệu giao hàng | Từ lúc tạo xác định hằng tháng đến trước khi gửi chỉ thị xuất hàng thành công | Xem được (gồm số lượng)·có thể gửi yêu cầu thay đổi | Không tính lại. Chênh lệch được thông báo bằng "Cần xác nhận" |
| `locked` | Dữ liệu giao hàng | Từ **thời điểm lần gửi đầu tiên chỉ thị xuất hàng thành công** (quyết định lần 2 ngày 2026/09/21) | Xem được nhưng không gửi yêu cầu được | Không chạm vào |

**Bảng chuyển trạng thái của `plan lifecycle`**

| Hiện tại | Trigger | Tiếp theo | Người thực hiện |
|---|---|---|---|
| `draft` | Tạo xác định (đã qua ngày bắt đầu đặt hàng) | `published` | Batch |
| `draft` | Phê duyệt tạm dừng·hủy hợp đồng | Xóa (override còn lại với trạng thái `Hủy` kèm lý do) | Vận hành |
| `published` | **Lần gửi đầu tiên chỉ thị xuất hàng thành công** | `locked` | Hệ thống |
| `locked` | — | Không chuyển | — |

**Cấm**: `published → draft`, `locked → published`, quay ngược `locked`. **Việc gán số vận đơn không chuyển sang `locked`** (quyết định lần 2 ngày 2026/09/21). **Cũng cấm nhân bản từ `draft`** (nhân bản kèm `parent_delivery_id`·số nhánh·đang xác nhận chỉ thực hiện từ `published` / `locked`·§4A-4C).

**Thời điểm trở thành `locked` (làm rõ 2026/09/13·chốt điểm khởi đầu ở lần 2 ngày 2026/09/21)**

Trạng thái không thay đổi theo đơn vị tháng. **Từng dữ liệu giao hàng một sẽ trở thành `locked` theo sự kiện sau**.

**Trigger chỉ có 1. Khi chỉ thị xuất hàng được gửi thành công lần đầu thì trở thành `locked`** (quyết định lần 2 ngày 2026/09/21).

| Trigger | Có chuyển `locked` không | Thời điểm |
|---|---|---|
| **Lần gửi đầu tiên chỉ thị xuất hàng thành công** (gửi chỉ thị xuất hàng cho Thomas và phía kia đã nhận) | **Có (trigger duy nhất)** | Chỉ thị xuất hàng được ra **gộp cho 2 tuần (tuần A+B / tuần C+D), vào 3 ngày trước (thứ Sáu) ngày bắt đầu của 2 tuần đó**. Tính theo N = "lead time chỉ thị xuất hàng" của master kho (mặc định 3 ngày) (§4D-3). Tuy nhiên, việc chuyển `locked` dựa trên **sự thật là gửi thành công**, không phải thời điểm dự định xuất |
| Đã tạo chỉ thị xuất hàng nhưng gửi thất bại·gửi lại làm tăng phiên bản | **Không** (chỉ khi gửi thành công lần đầu) | Gửi lại chỉ tăng số phiên bản, không dịch chuyển điểm khởi đầu của `locked` |
| Đã gắn số vận đơn | **Không** (quyết định lần 2 ngày 2026/09/21) | Số vận đơn không phải điều kiện của `locked`. **Nếu số vận đơn xuất hiện trước chỉ thị xuất hàng thì phát hiện và thông báo là anomaly (bất thường)** (xem bên dưới) |

> **(Cũ: "Chỉ thị xuất hàng đã ra" hoặc "số vận đơn đã gắn", cái nào sớm hơn thì `locked`. Điểm khởi đầu của `locked` = thời điểm xuất ra bản xuất gộp 2 tuần. Thay đổi ở lần 2 ngày 2026/09/21)** Bản xuất gộp 2 tuần vẫn còn như là chuyện "khi nào gửi", còn **điểm khởi đầu của `locked` được sửa thành "gửi thành công"**. Vì tại thời điểm tạo file xuất thì kho chưa hoạt động, nếu gửi thất bại thì không có căn cứ để chuyển `locked`.

**Phát hiện anomaly khi vận đơn xuất hiện trước**

| Điều kiện | Xử lý |
|---|---|
| Dữ liệu giao hàng đó **không có ghi nhận gửi chỉ thị xuất hàng thành công** nhưng số vận đơn (`delivery_tracking_numbers`) đã được gắn | **Phát hiện là anomaly**, hiển thị "Số vận đơn đã được gắn trước chỉ thị xuất hàng: N bản ghi" ở "Cần xác nhận" của lịch vận hành. **Không chuyển `locked`**. Được bắt bằng batch hằng ngày `tracking_anomaly_detect` (§11-1) |

Dữ liệu giao hàng đã trở thành `locked` thì không quay lại. Các thay đổi sau đó được xử lý bằng giao lại (gán số nhánh vào số chỉ thị) hoặc vận hành hủy rồi tạo lại.

**Ví dụ theo trục thời gian** (ngày giao 8/20, lead time 2 ngày, thời gian đặt hàng 7/1〜7/15, chỉ thị xuất hàng cho 2 tuần 8/17〜8/30 được xuất vào thứ Sáu 8/14)

| Ngày | Trạng thái | Chuyện xảy ra |
|---|---|---|
| 〜6/30 | `draft` | Chỉ có kế hoạch. Doanh nghiệp chỉ thấy ngày |
| **7/1 (công khai menu = bắt đầu đặt hàng)** | `published` | **Ngày này tạo xác định dữ liệu giao hàng** (xác nhận 2026/09/21. Cũ: tạo xác định vào ngày chốt đặt hàng). Hợp đồng con cũng được tạo cùng ngày (§4A-2B·#40) |
| 7/1〜7/15 | `published` | Đang nhận đặt hàng. Vận hành có thể sửa ngày·thay đổi hàng loạt |
| **7/15 (chốt đặt hàng)** | `published` | **Số lượng được chốt**, việc nhận thay đổi ngày cũng kết thúc (không tạo bản ghi) |
| 7/16〜8/13 | `published` | Chờ xuất chỉ thị xuất hàng |
| **8/14 (Thứ Sáu)** | **`locked`** | CSV chỉ thị xuất hàng cho 2 tuần 8/17〜8/30 được xuất gộp, **tại thời điểm gửi thành công** thì dữ liệu giao hàng đối tượng trở thành `locked` (quyết định lần 2 ngày 2026/09/21. Phần chỉ xuất ra·gửi thất bại thì không `locked`). Các thay đổi sau đó được ghi đè bằng gửi lại (§4D-3) |
| 8/18 | `locked` | Kho picking (**Đã xuất**) |
| 8/19 | `locked` | Đang giao (tài xế nhận ở kho → **Đã nhận**) |
| 8/20 | `locked` | **Đã giao** |

Do đó **không phải "dữ liệu của cả tháng đồng loạt thành locked"**. Dù cùng tháng, phần đã ra chỉ thị xuất hàng sẽ lần lượt thành `locked`, kế hoạch nửa cuối tháng vẫn ở `published` một thời gian. Ngược lại, chu kỳ vắt qua tháng (giao cuối tháng, lead time dài) sẽ `locked` ngay trong tháng trước.

### 4A-3B. Hệ thống trạng thái giao hàng (delivery status) (quyết định 2026/09/18·tách khỏi plan lifecycle ở lần 2 ngày 2026/09/21)

> **Mục này chỉ nói về `delivery status`**. `draft` / `published` / `locked` là **`plan lifecycle`** (§4A-3), là trục khác với các giá trị của mục này. **Không gọi chung cả hai là "trạng thái"** (quyết định lần 2 ngày 2026/09/21).

Trạng thái trên màn hình đã bị lẫn lộn giữa đuôi từ (〜được / 〜đang / 〜xong / 〜hoàn tất) và trục (tiến độ·yêu cầu thay đổi·bất thường). Thống nhất theo quy tắc sau.

**Quy tắc đặt tên**

1. Đuôi từ chỉ dùng 3 loại: **chờ / đang / đã**. Không dùng "hoàn tất" trong tên trạng thái (viết như một sự kiện trong câu thì được).
2. Tiền tố là tên công đoạn (xuất·nhận·giao·trung chuyển·thay đổi).
3. Không dùng viết tắt (như "Kế hoạch-đơn"). Badge tối đa 4 ký tự.
4. Kết thúc (dừng·hủy) là nhóm riêng, hiển thị màu xám.
5. Tên thao tác của tài xế là "Báo cáo sự cố". **Báo cáo sự cố không phải là trạng thái của dữ liệu giao hàng** (bản ghi cha vẫn là Đã xuất / Đã nhận / Đã giao. Báo cáo được giữ ở `trouble_reports` và Cần xác nhận). Đang xác nhận, trong luồng sự cố, là trạng thái của bản ghi con chưa xuất·ứng viên recovery (2026/09/24 bổ sung [quyết định v2.3 #20]). **(Cũ: trạng thái của dữ liệu là "Đang xác nhận". Phân biệt từ ngữ giữa hành động và trạng thái. Bỏ 2026/09/24)**

**3 trục**

| Trục | Tên vật lý | Đối tượng | Giá trị |
|---|---|---|---|
| **Trạng thái giao hàng** (delivery status) | `deliveries.status` | Chỉ dữ liệu giao hàng | Chờ xuất / Đã xuất / Đã nhận / Đã giao / Đã giao một phần / Chờ giao lại / Đang xác nhận / Dừng / Hủy |
| **Yêu cầu thay đổi** | `change_request_status` | Cả kế hoạch giao hàng và dữ liệu giao hàng | Có thể thay đổi / Đang yêu cầu / Đang đề xuất / Đã điều chỉnh / Không thể thay đổi |
| **Trung chuyển** | **Không lưu (giá trị suy ra)** | Dữ liệu giao hàng có tuyến đi qua điểm trung chuyển | **Không trung chuyển / Có trung chuyển** (suy ra từ route legs·làm rõ ở lần 2 ngày 2026/09/21) |

> **`plan lifecycle` (`draft` / `published` / `locked`) không thuộc 3 trục này.** Đặt ở §4A-3 như một máy trạng thái riêng (quyết định lần 2 ngày 2026/09/21).

**Định nghĩa trạng thái**

| Nhóm | Giá trị | Ý nghĩa |
|---|---|---|
| Tiến hành | **Chờ xuất** | Từ khi có dữ liệu giao hàng đến khi xuất hàng (cũ "Có thể thay đổi", "Đang yêu cầu thay đổi", "Chuẩn bị xuất") |
| Tiến hành | **Đã xuất** | Kho đã xuất (nhập CSV kết quả xuất hàng·CSV vận đơn) |
| Tiến hành | **Đã nhận** | Tài xế đã nhận ở kho·điểm trung chuyển (cũ "Đã nhận hàng"). **Trở thành Đã nhận khi lần đầu nhận bằng app của ES** (nếu chặng 1 là ủy thác thì là nhận tại kho). Khi tài xế chặng 2 nhận ở điểm trung chuyển thì chỉ nhập thời điểm nhận của chặng (`delivery_legs.picked_up_at`·`picked_up_by`), trạng thái vẫn là Đã nhận (2026/09/29 [quyết định v2.3 #49]). Đang giao cũng ở trạng thái này. **Trạng thái này chỉ được nhập từ app tài xế của ES** (xác nhận 2026/09/19. Không liên quan đến thông tin của công ty vận chuyển như Yamato, không gắn cho chuyến của công ty vận chuyển) |
| Tiến hành | **Đã giao** | Đã giao toàn bộ số lượng (cũ "Hoàn tất giao hàng"). Với chuyến của công ty vận chuyển hoàn tất theo suy đoán thì ghi thêm "Đã giao (suy đoán)" |
| **Kết thúc** | **Đã giao một phần** | Chỉ giao một phần rồi **đóng**. Số còn lại được giữ bằng nhân bản (số nhánh), bản nhân bản đó bắt đầu từ Đang xác nhận. **Bản ghi này từ đó không còn thay đổi** (làm rõ 2026/09/23) |
| **Kết thúc** | **Chờ giao lại** | Không giao được nên **đóng**. Phần gửi lại do nhân bản (số nhánh) giữ toàn bộ số lượng, bắt đầu từ Đang xác nhận. **Bản ghi này từ đó không còn thay đổi** (làm rõ 2026/09/23) |
| Bất thường | **Đang xác nhận** | Trạng thái mà bản ghi con·ứng viên recovery chờ vận hành (logistics) chốt ngày·số lượng·cách xử lý. **Trong luồng sự cố, chỉ bản ghi con·ứng viên recovery chưa rời kho (`shipped_date IS NULL`) mới dùng. Bản ghi cha Đã xuất·Đã nhận·Đã giao dù có báo cáo sự cố cũng không chuyển sang Đang xác nhận** (2026/09/24 bổ sung [quyết định v2.3 #20]). **Không dùng làm trạng thái cuối**. **(Cũ: sau khi nhận báo cáo, đến khi vận hành quyết định cách xử lý 〈cũ "Sự cố"·REQ-DL-313〉. Bỏ 2026/09/24)** |
| Kết thúc | **Dừng** | Kết thúc không giao. Thực tích 0·**không thanh toán**·bắt buộc có lý do. **Không phân biệt trước hay sau khi xuất hàng** (làm rõ 2026/09/23) |
| Kết thúc | **Hủy** | Hủy **trước khi rời kho**. Thực tích 0·không thanh toán·bắt buộc có lý do (làm rõ 2026/09/23) |

> **Cách dùng phân biệt `Dừng` và `Hủy` là "đã xuất hàng hay chưa"** (quyết định 2026/09/23). **Chưa rời kho = `Hủy`** (chỉ thị xuất hàng được gửi lại với số lượng 0 để vô hiệu hóa·§4D-3), **sau khi đã xuất, ngừng giao = `Dừng`** (vì hàng thật đã xuất nên có thể phát sinh xử lý cước vận chuyển·hủy bỏ riêng. **Cước vận chuyển theo `freight_billable` (mặc định không thanh toán·nếu thanh toán thì bắt buộc có lý do), hủy bỏ theo `delivery_lines.disposed_qty`, việc trả lại hàng còn lại theo "Trả về" của nhân bản (§4A-4C)**·2026/09/29 [quyết định v2.3 #40·#41]). Cả hai đều có điểm chung là thực tích 0 và không thanh toán.
>
> **Trạng thái cuối có 5: `Đã giao` / `Đã giao một phần` / `Chờ giao lại` / `Dừng` / `Hủy`.** Liên hệ sau khi giao (khiếu nại) sẽ mở báo cáo sự cố và Cần xác nhận, nhưng **không đưa `Đã giao` về `Đang xác nhận`** (2026/09/24 bổ sung [quyết định v2.3 #20]).

**Kế hoạch giao hàng (`draft`) không có trạng thái.** Vì kế hoạch chưa xảy ra xuất hay nhận nên cột trạng thái là "—". Kế hoạch chỉ có trạng thái yêu cầu thay đổi, và hiển thị chưa định ngày (chưa đăng ký menu)·tạm dừng chu kỳ (§4A-7). Khi tạo xác định, cột trạng thái chuyển từ "—" sang "Chờ xuất".

**Chuyển trạng thái**

| Hiện tại | Trigger | Tiếp theo | Người thực hiện |
|---|---|---|---|
| Kế hoạch (—) | Tạo xác định | Chờ xuất | Batch |
| Chờ xuất | Nhập CSV kết quả xuất hàng·CSV vận đơn | Đã xuất | Hệ thống |
| Chờ xuất | Xác định không xuất được (bắt buộc có lý do) | Hủy (chuyến thay thế được tạo bằng nhân bản) | Vận hành |
| Đã xuất | Đã nhận toàn bộ vận đơn (**lần đầu nhận bằng app của ES**. Chặng đó cũng nhập `picked_up_at`·`picked_up_by`·2026/09/29 [quyết định v2.3 #49]) | Đã nhận | Tài xế |
| Đã nhận | **Tài xế chặng tiếp theo "Nhận hàng" ở điểm trung chuyển** (khi chặng 1 là ủy thác và có trung chuyển) | **Vẫn là Đã nhận** (chỉ nhập `picked_up_at`·`picked_up_by` của chặng đó. Không giữ trạng thái giữa chừng của trung chuyển·2026/09/29 [quyết định v2.3 #49]) | Tài xế |
| Đã xuất | Hoàn tất khi còn một phần chưa nhận | Đã nhận (vận đơn chưa nhận chuyển sang "Cần xác nhận") | Tài xế |
| Đã xuất | Báo cáo sự cố trước khi nhận | **Vẫn là Đã xuất** (ghi nhận báo cáo sự cố và mở Cần xác nhận·2026/09/24 bổ sung [quyết định v2.3 #20]. Cũ: Đang xác nhận. Bỏ 2026/09/24) | Tài xế / vận hành đăng ký thay |
| Đã xuất (**final leg là công ty vận chuyển giao trực tiếp**) và **không có báo cáo sự cố chưa giải quyết** | Batch 06:00 ngày hôm sau của ngày giao | Đã giao (suy đoán) | Batch |
| Đã xuất·Đã nhận (**final leg là app tài xế của ES**) và **không có báo cáo sự cố chưa giải quyết** | Sáng hôm sau vẫn không phải Đã giao·Dừng·Hủy | **Không đổi trạng thái, đưa vào missing queue (Cần xác nhận)** (không coi là hoàn tất suy đoán·§4C-1) | Batch |
| Đã nhận | Giao toàn bộ số lượng, không chênh lệch | Đã giao. **Nếu báo cáo sự cố chưa giải quyết chỉ là chậm trễ thì hệ thống tự động giải quyết báo cáo đó bằng "Giao toàn bộ"** (cùng transaction·`actor_type = system`·đóng cả Cần xác nhận `trouble_open`. Khi còn báo cáo chưa giải quyết ngoài chậm trễ / số lượng giao khác kế hoạch thì không tự động giải quyết) (2026/09/29 bổ sung [quyết định v2.3 #32]) | Tài xế (tự động giải quyết là hệ thống) |
| Đã nhận | Chênh lệch số lượng·hoàn tất khi còn một phần chưa giao·báo cáo sự cố | **Vẫn là Đã nhận** (ghi nhận báo cáo sự cố và mở Cần xác nhận·[quyết định v2.3 #20]. Cũ: Đang xác nhận. Bỏ 2026/09/24) | Tài xế |
| Đã giao | Doanh nghiệp·cơ sở·công ty vận chuyển liên hệ sau khi giao. **Không đặt thời hạn tiếp nhận (do vận hành quyết định)** (quyết định 2026/09/21·#61). **Phần sau khi chốt thanh toán được phản ánh vào tháng sau bằng điều chỉnh trong ①thanh toán trước·②quyết toán thực tích** (§4D-1) | **Vẫn là Đã giao** (ghi nhận báo cáo sự cố và mở Cần xác nhận·[quyết định v2.3 #20]. Cũ: Đang xác nhận. Bỏ 2026/09/24) | Vận hành đăng ký thay |
| Đã xuất·Đã nhận·Đã giao | **Đã đăng ký báo cáo sự cố thuộc loại tạo bản ghi con tự động (`trouble_types.auto_child = true`: giao nhầm·vắng mặt·hư hỏng)** / vận hành gán loại đó. **Khi chưa có bản ghi con tự động còn hiệu lực của chuyến giao đó** | **Không đổi bản ghi cha.** Tạo 1 bản ghi con tự động ở trạng thái `Đang xác nhận` (`trouble_pending`·`creation_source = trouble_auto`·§4A-4C). Chênh lệch số lượng·chậm trễ·khác·loại chưa định thì không tạo, chỉ mở Cần xác nhận `trouble_open` | Hệ thống (cùng transaction với đăng ký báo cáo·gán lại loại) (2026/09/29 bổ sung [quyết định v2.3 #30]) |
| ~~Đã xuất·Đã nhận·Đã giao (có báo cáo sự cố chưa giải quyết)~~ | ~~Vẫn chưa giải quyết dù đã quá `auto_duplicate_due_at`~~ | ~~Không đổi bản ghi cha. Tạo 1 bản ghi con tự động ở trạng thái `Đang xác nhận`~~ | ~~Batch (`trouble_auto_duplicate`)~~ (**Cũ. Bỏ 2026/09/29 [quyết định v2.3 #30]**) |
| Đã xuất·Đã nhận·Đã giao (có báo cáo sự cố chưa giải quyết) | Giải quyết sự cố: đã giao toàn bộ số lượng (kể cả hàng thay thế). Phần thừa điều chỉnh vào lần sau | Đã giao (nếu có bản ghi con tự động thì `Hủy` trong cùng transaction·lý do `auto child not needed`) | Vận hành (logistics) |
| Đã xuất·Đã nhận (có báo cáo sự cố chưa giải quyết) | Giải quyết sự cố: giao một phần, phần còn lại gửi sau | Đã giao một phần + bản ghi con (số còn lại). **Nếu có bản ghi con tự động thì dùng lại** (`duplicate_type = remainder`, số lượng·chi tiết = số còn lại) | Vận hành (logistics) |
| Đã xuất·Đã nhận (có báo cáo sự cố chưa giải quyết) | Giải quyết sự cố: **giao một phần, phần còn lại không gửi** (`partial_no_resend`. Không có ngưỡng·vận hành quyết định·bắt buộc có lý do) | Đã giao một phần. **Không tạo bản ghi con.** Nếu có bản ghi con tự động thì `Hủy` trong cùng transaction (2026/09/29 bổ sung [quyết định v2.3 #31]) | Vận hành (logistics) |
| Đã xuất·Đã nhận (có báo cáo sự cố chưa giải quyết) | Giải quyết sự cố: gửi lại với số lượng giao bằng 0 | Chờ giao lại + bản ghi con (toàn bộ số lượng). **Nếu có bản ghi con tự động thì dùng lại** (`duplicate_type = redelivery`, số lượng·chi tiết = toàn bộ số lượng) | Vận hành (logistics) |
| Đã xuất·Đã nhận (có báo cáo sự cố chưa giải quyết) | Giải quyết sự cố: kết thúc không giao | Dừng (nếu có bản ghi con tự động thì `Hủy`) | Vận hành (logistics) |
| Đã xuất·Đã nhận (có báo cáo sự cố chưa giải quyết) | Giải quyết sự cố: ghé lại trong ngày (chậm trễ, v.v.) | Đã nhận (nếu có bản ghi con tự động thì `Hủy`) | Vận hành (logistics) |
| **Đã giao (chỉ hoàn tất suy đoán `completion_source = presumed`)** (có báo cáo sự cố chưa giải quyết) | Liên hệ "chưa nhận được" → vận hành đăng ký thay và yêu cầu Yamato điều tra → xác nhận thất lạc·chưa giao | **Chờ giao lại** + bản ghi con (toàn bộ số lượng. Nếu có bản ghi con tự động thì dùng lại) / **Dừng** (nếu có bản ghi con tự động thì `Hủy`). Bắt buộc có lý do. Không thanh toán (phần thanh toán đã chốt thì điều chỉnh vào tháng sau). **`reported`·`customer` Đã giao nằm ngoài đối tượng** (2026/09/29 bổ sung [quyết định v2.3 #27]) | Vận hành (logistics) |
| **Đang xác nhận** (bản ghi con·ứng viên recovery) | **Đã quyết định cách xử lý và chốt ngày giao** (lộ trình thông thường của bản ghi con được nhân bản. **Từ đây mới trở thành đối tượng của chỉ thị xuất hàng**). **Bản ghi con tự động chỉ khi `schedule_confirmed = true` và `quantity_confirmed = true`, và việc giải quyết sự cố của bản ghi cha đã xong** (nếu chưa chốt thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`·[quyết định v2.3 #24]) | **Chờ xuất** | **Vận hành (logistics)** |
| **Đang xác nhận** (bản ghi con·ứng viên recovery) | **Hủy bỏ. Tuy nhiên chỉ giới hạn với bản ghi `shipped_date IS NULL` (chưa rời kho)**. Với cách giải quyết không cần gửi lại (giao toàn bộ·ghé lại trong ngày·dừng), hủy bản ghi con tự động trong cùng transaction với việc giải quyết của bản ghi cha (bắt buộc có lý do·[quyết định v2.3 #24]) | **Hủy** | **Vận hành (logistics)** |
| **Đã xuất** | **Không giao được sau khi xuất** (xe hỏng·tuyết lớn·sự cố hàng hóa, v.v. Bắt buộc có lý do) | **Dừng** | **Vận hành** |
| **Đã nhận** | **Không giao được sau khi đã nhận** (bắt buộc có lý do) | **Dừng** | **Vận hành** |

> **Không đổi trạng thái bản ghi cha bằng báo cáo sự cố** (2026/09/24 bổ sung [quyết định v2.3 #20·#21]). Việc giải quyết sự cố đưa bản ghi cha **trực tiếp từ trạng thái lúc sự cố xảy ra (Đã xuất / Đã nhận. Liên hệ sau khi giao là Đã giao)**. Điểm khởi đầu: giao một phần (có bản ghi con số còn lại / phần còn lại không gửi)·giao lại·dừng·ghé lại trong ngày là `Đã xuất` / `Đã nhận`, giao toàn bộ là `Đã xuất` / `Đã nhận` / `Đã giao`. **Ngoại lệ: `Đã giao` hoàn tất suy đoán (`presumed`) cũng có thể chuyển sang Chờ giao lại·Dừng** [quyết định v2.3 #27]. **Giải quyết theo đơn vị chuyến giao**, đóng gộp các báo cáo chưa giải quyết của chuyến giao đó [quyết định v2.3 #29]. Batch không quyết định cách giải quyết của bản ghi cha (trừ tự động giải quyết bằng báo cáo giao toàn bộ của chuyến giao chỉ chậm trễ [quyết định v2.3 #32]). **(Cũ: Đã xuất / Đã nhận / Đã giao → Đang xác nhận, rồi từ Đang xác nhận giải quyết thành Đã giao / Đã giao một phần + bản ghi con / Chờ giao lại + bản ghi con / Dừng / Đã nhận. Bỏ 2026/09/24)**

**`Đã giao một phần` và `Chờ giao lại` là trạng thái cuối của bản ghi đó** (quyết định 2026/09/23). Giống các sự cố khác, thành **2 bản ghi là "bản ghi đã kết thúc giao hàng" và "bản ghi con nhân bản từ bản ghi gốc"**.

| | Bản ghi cha (bản ghi gốc) | Bản ghi con (nhân bản) |
|---|---|---|
| **Đã giao một phần** | Giữ lượng đã giao thực tế làm thực tích, **đóng bằng `Đã giao một phần`** | Giữ **số còn lại** và bắt đầu từ `Đang xác nhận` (**nếu có bản ghi con tự động của sự cố thì dùng lại, không tạo bản ghi thứ 2**·[quyết định v2.3 #21]). Khi đã quyết định cách xử lý thì chuyển sang `Chờ xuất` và chạy bình thường đến `Đã giao`. **Với giải quyết "giao một phần (phần còn lại không gửi)" thì không tạo bản ghi con** (nếu có bản ghi con tự động thì `Hủy`·[quyết định v2.3 #31]) |
| **Chờ giao lại** | Giữ thực tích 0 và **đóng bằng `Chờ giao lại`** | Giữ **toàn bộ số lượng** và bắt đầu từ `Đang xác nhận`. Sau đó như trên |

**Dù bản ghi con ra sao thì bản ghi cha không động đến.** Thanh toán được lập theo từng bản ghi dựa trên số lượng và ngày đã thực giao (§4D-1) nên không cần sửa lại bản ghi cha thành `Đã giao` sau này. Khi bản ghi con thành `Dừng` / `Hủy` thì bản ghi cha vẫn là `Đã giao một phần` / `Chờ giao lại`. Cha con chỉ tối đa 1 cấp, khi chia tiếp bản ghi con thì bản ghi cha vẫn là 1 bản ghi gốc (số nhánh 1〜9).

- **Hàng thay thế và hủy bỏ không phải là trạng thái.** Đó là xử lý đi kèm (đăng ký hàng thay thế·đăng ký hủy bỏ và điều chỉnh tồn kho), trạng thái được quyết định bởi lượng giao được (§4A-4B ②).
- Việc chuyển sang hủy·dừng·chờ giao lại chỉ do **vận hành (logistics)** thực hiện. Tài xế và công ty vận chuyển ủy thác chỉ dừng ở báo cáo.
- Đang xác nhận không phải trạng thái cuối. Giữ lại ở "Cần xác nhận" của lịch vận hành cho đến khi quyết định cách xử lý.
- **Báo cáo sự cố chưa giải quyết cũng được giữ ở "Cần xác nhận" cho đến khi giải quyết** (không đổi trạng thái bản ghi cha). Là `review_items.kind = trouble_open` (đối tượng là chuyến giao), mở cùng lúc với đăng ký báo cáo. Ngay cả loại không tạo bản ghi con tự động cũng tránh bỏ sót xử lý ở đây (2026/09/29 bổ sung [quyết định v2.3 #30]). Bản ghi con tự động hiển thị bằng `review_items.kind = trouble_auto_child_pending` (đối tượng là bản ghi con), đóng trong cùng transaction với việc giải quyết sự cố (2026/09/24 bổ sung [quyết định v2.3 #22·#24]. `trouble_open` cũng như vậy).

**Chuyển trạng thái yêu cầu thay đổi** (chung cho kế hoạch giao hàng·dữ liệu giao hàng)

| Hiện tại | Trigger | Tiếp theo | Người thực hiện |
|---|---|---|---|
| Có thể thay đổi | Doanh nghiệp gửi yêu cầu thay đổi | Đang yêu cầu | Doanh nghiệp |
| Có thể thay đổi | Vận hành trực tiếp đổi ngày | Đã điều chỉnh | Vận hành |
| Đang yêu cầu | Phê duyệt | Đã điều chỉnh | Vận hành |
| Đang yêu cầu | Đề xuất ngày thay thế | Đang đề xuất | Vận hành |
| Đang yêu cầu | Từ chối·doanh nghiệp rút lại | Có thể thay đổi (để lại lịch sử, thông báo cho doanh nghiệp) | Vận hành / Doanh nghiệp |
| Đang đề xuất | Doanh nghiệp chấp nhận / từ chối | Đã điều chỉnh / Có thể thay đổi | Doanh nghiệp |
| Đã điều chỉnh | Gửi yêu cầu thay đổi lần nữa | Đang yêu cầu | Doanh nghiệp |
| **Đã điều chỉnh** | **Vận hành phán đoán "không thể đáp ứng" (bắt buộc có lý do)** | **Đang đề xuất** | **Vận hành** |
| **Đã điều chỉnh** | **Ngày giao đối tượng không còn do tạo lại** | **Có thể thay đổi (override mất hiệu lực·để lại lịch sử)** | **Batch** |
| Đang yêu cầu·Đang đề xuất | **3 ngày trước hạn chốt đặt hàng** (`change_request_warn_days`·mặc định 3 ngày) mà vẫn chưa xử lý | **Không đổi trạng thái.** Đưa vào Cần xác nhận `change_request_due` (2026/09/29 [quyết định v2.3 #37]) | Batch |
| Tất cả | Chốt đặt hàng | Không thể thay đổi (yêu cầu chưa xử lý còn lại ở "Cần xác nhận" `change_request_due`, **giữ cho đến khi vận hành xử lý. Không tự động từ chối**·2026/09/29 [quyết định v2.3 #37]) | Batch |

- Từ chối·rút lại không để lại như một trạng thái. Đưa về như cũ, thông báo bằng lịch sử thay đổi và thông báo.
- **"Ghi đè ngày" và "tạo bản ghi khác" là hai chuyện khác nhau** (bổ sung 2026/09/18). Sau chốt đặt hàng·sau chỉ thị xuất hàng thì **không thể ghi đè ngày của dữ liệu giao hàng đó**, nhưng có thể hủy·dừng và **nhân bản (bản ghi khác với ngày mới)** (§4A-4B·§4A-4C). Ngay cả khi sau chốt, Đã điều chỉnh rơi xuống Đang đề xuất thì cái được dời là ngày của bản ghi nhân bản khác, không phải ngày của dữ liệu giao hàng đã chốt.
- **Đã điều chỉnh là giá trị suy ra** (sửa 2026/09/18). Không phải cờ `pinned` mà kế hoạch giữ, mà là hiển thị việc **override đã phê duyệt đang được áp dụng** (§4A-4). Cùng cách xử lý như trung chuyển được suy ra từ trạng thái.
- **Đã điều chỉnh là "ngày do vận hành quyết định", không dịch chuyển bằng tính toán tự động của hệ thống.** Việc có đáp ứng được thực tế hay không được kiểm tra lại hằng ngày, nếu không đáp ứng được thì hạ từ Đã điều chỉnh → Đang đề xuất và thống nhất lại với doanh nghiệp (§4A-4E). Từ ngữ thống nhất theo bảng ở §3.4.

**Trung chuyển không lưu mà suy ra từ trạng thái** (để song hành với "không giữ trạng thái giữa chừng của trung chuyển" ở §4C-2)

| Trung chuyển | Điều kiện |
|---|---|
| **Không trung chuyển** | Tuyến giao hàng không có điểm trung chuyển |
| **Có trung chuyển** | Tuyến giao hàng có điểm trung chuyển |

**Trung chuyển chỉ có 2 giá trị "có / không"** (sửa 2026/09/19. Các giá trị cũ Chờ trung chuyển / Đang trung chuyển / Đã trung chuyển bị bỏ). Ban đầu tiến độ trung chuyển được cho là lấy được từ Yamato, nhưng dự kiến dù batch được làm ở giai đoạn 3 thì **dữ liệu lấy về cũng không đủ tin cậy để dùng nguyên làm trạng thái trên màn hình**, nên không giữ ngay từ đầu.

- Khi muốn xem tình hình giữa chừng thì mở **trang tra cứu của từng công ty từ số vận đơn** (§4C-2).
- Việc hoàn tất chuyến có trung chuyển được chốt bằng **hoàn tất suy đoán** (§4C-1).
- Dù ở giai đoạn 3 có thể lấy tình trạng giao hàng từ Yamato, cũng **chỉ hiển thị làm thông tin tham khảo** và không dùng để phán định trạng thái.

**Đối chiếu cũ → mới**

| Màn hình hiện tại | Từ nay |
|---|---|
| Kế hoạch | Trạng thái là "—" (thể hiện là kế hoạch hay dữ liệu giao hàng bằng dải·màn hình) |
| Kế hoạch-đơn | Trạng thái là "—" + yêu cầu thay đổi = Đang yêu cầu |
| Có thể thay đổi | Chờ xuất + yêu cầu thay đổi = Có thể thay đổi |
| Đang yêu cầu thay đổi | Chờ xuất + yêu cầu thay đổi = Đang yêu cầu |
| Chuẩn bị xuất | Chờ xuất |
| Đã xuất | Đã xuất |
| Đã nhận hàng | Đã nhận |
| Sự cố | **Giữ nguyên trạng thái** (Đã xuất / Đã nhận) + báo cáo sự cố (Cần xác nhận). **(Cũ: Đang xác nhận. Bỏ 2026/09/24 [quyết định v2.3 #20])** |
| Hoàn tất giao hàng | Đã giao |
| Ngoài đối tượng trung chuyển / Chờ giao qua trung chuyển / Đang giao qua trung chuyển / Đã giao qua trung chuyển | **Không trung chuyển / Có trung chuyển** (không giữ trạng thái giữa chừng·sửa 2026/09/19) |

**Badge của app tài xế V1.0 không đổi từ ngữ** (màn hình đã chốt·§4B-5). Đối ứng với trạng thái phía vận hành như sau.

| Hiển thị trong app | Trạng thái phía vận hành |
|---|---|
| Chưa nhận | Đã xuất |
| Chưa giao | Đã nhận |
| Hoàn tất giao hàng | Đã giao |
| Sự cố | **Vẫn là Đã xuất / Đã nhận** (có báo cáo sự cố chưa giải quyết·Cần xác nhận). **(Cũ: Đang xác nhận. Bỏ 2026/09/24 [quyết định v2.3 #20])** |

### Yêu cầu (hệ thống trạng thái·quyết định 2026/09/18)

| ID yêu cầu | Phân loại yêu cầu | Nội dung yêu cầu | Trạng thái |
|---|---|---|---|
| REQ-DL-751 | Yêu cầu hiển thị | Giữ trạng thái theo 3 trục là trạng thái·yêu cầu thay đổi·trung chuyển, thống nhất đuôi từ là "chờ / đang / đã". Không dùng "hoàn tất", "〜được" và viết tắt trong tên trạng thái | Đã quyết định (2026/09/18) |
| REQ-DL-752 | Yêu cầu dữ liệu | Trạng thái chỉ do dữ liệu giao hàng giữ, kế hoạch giao hàng (draft) không có trạng thái (hiển thị "—"). Khi tạo xác định thì thành "Chờ xuất" | Đã quyết định (2026/09/18) |
| REQ-DL-753 | Yêu cầu dữ liệu | Các giá trị trạng thái là Chờ xuất / Đã xuất / Đã nhận / Đã giao / Đã giao một phần / Chờ giao lại / Đang xác nhận / Dừng / Hủy | Đã quyết định (2026/09/18) |
| REQ-DL-754 | Yêu cầu dữ liệu | Giữ trạng thái yêu cầu thay đổi (Có thể thay đổi / Đang yêu cầu / Đang đề xuất / Đã điều chỉnh / Không thể thay đổi) tách khỏi trạng thái, gắn cho cả kế hoạch giao hàng và dữ liệu giao hàng. Phê duyệt và vận hành trực tiếp thay đổi được coi là Đã điều chỉnh | Đã quyết định (2026/09/18) |
| REQ-DL-755 | Yêu cầu hiển thị | Trung chuyển không lưu mà suy ra từ tuyến giao hàng, hiển thị 2 giá trị **Không trung chuyển / Có trung chuyển** (sửa 2026/09/19. Cũ: Không trung chuyển / Chờ trung chuyển / Đang trung chuyển / Đã trung chuyển) | Đã quyết định (sửa 2026/09/19) |
| REQ-DL-756 | Yêu cầu kiểm soát | Giới hạn chuyển trạng thái·yêu cầu thay đổi trong các bảng của mục này, từ chối các chuyển đổi không có trong bảng | Đã quyết định (2026/09/18) |

### 4A-4. Đích phản ánh của yêu cầu thay đổi (sửa 2026/09/18·phương thức override)

> **Quy cách cũ (〜2026/09/17)**: Khi phê duyệt thì gắn cờ `pinned` vào kế hoạch để bảo vệ khỏi tính lại. Kế hoạch là dữ liệu **luôn được tạo lại** từ thiết lập (tạo thay thế ở §2.0A), nên nếu đặt thông tin muốn giữ lâu dài vào đó thì sẽ hỏng. Với 5 lý do trong bảng dưới, sửa thành phương thức giữ các thay đổi đã phê duyệt **ở ngoài kế hoạch**.

| # | Vấn đề của phương thức cũ (cờ `pinned`) | Điều xảy ra |
|---|---|---|
| 1 | Trở thành ngoại lệ của "xóa toàn bộ → tạo lại" | Dòng giữ lại và dòng mới tạo xung đột cùng ngày giao / quên giữ lại nên phê duyệt biến mất |
| 2 | Mất tương ứng với khung | Khi ngày đầu chu kỳ hoặc tạm dừng thay đổi, khung tương ứng với ngày đó (`A1`〜`D7`) không còn, trở thành dòng không nằm ở lịch picking·hợp đồng con·thanh toán nào |
| 3 | Phê duyệt biến mất lặng lẽ | Khi xóa `draft` do tạm dừng·hủy hợp đồng (§4A-6) thì kế hoạch đã phê duyệt cũng bị xóa theo |
| 4 | Từ phê duyệt đến thực thi xa | Phê duyệt từ 2 tháng sau trở đi cách tạo xác định 1〜5 tháng. Trong thời gian đó thiết lập chu kỳ được lưu nhiều lần, phán định xung đột chạy nhiều lần cho 1 phê duyệt |
| 5 | Ngoại lệ chồng chất | Ngoại lệ cho 6 tháng của kỳ tạo bị tích lại, mỗi lần lưu phải đối chiếu với toàn bộ |

#### Override đã phê duyệt

"Điều chỉnh chỉ lần này" đã được phê duyệt không phải là cờ của kế hoạch mà được giữ như dữ liệu độc lập. **Lý do thường trực như ngày không nhận được không làm thành override mà biến thành ràng buộc của cơ sở** (§3.1C·§3.4).

| Mục | Giải thích |
|---|---|
| Đối tượng | Hợp đồng (cơ sở) + chi tiết giao hàng + loại giao hàng + **ngày giao tại thời điểm phê duyệt** |
| Loại | `move` = dời ngày / `skip` = lần này không giao / `fix` = vận hành chỉ định riêng (§4A-4D) |
| Ngày sau thay đổi | **Giữ bằng ngày tuyệt đối.** Không giữ bằng tương đối như "sớm hơn 1 ngày" (vì khi chu kỳ dịch chuyển thì không dự đoán được kết quả) |
| Bên yêu cầu | `Doanh nghiệp` / `Vận hành` |
| Lý do·tên người yêu cầu·người phê duyệt·thời điểm phê duyệt | Để kiểm toán và liên hệ điện thoại (REQ-DL-305) |
| Snapshot căn cứ tại thời điểm phê duyệt | Ngày picking·kho·tuyến·loại chuyến·số lượng·phiên bản thiết lập (§3.4) |
| Trạng thái | `Đang áp dụng` / `Chưa áp dụng (cần xác nhận)` / `Mất hiệu lực` / `Hủy` |
| Thời điểm kiểm tra cuối | Thời điểm kiểm tra hằng ngày ở §4A-4E xác nhận thành lập lần cuối |

| Đích yêu cầu | Xử lý khi phê duyệt |
|---|---|
| Kế hoạch `draft` | Tạo override, áp dụng mỗi lần tạo lại. Không gắn cờ vào chính kế hoạch |
| Dữ liệu giao hàng `published` | Trực tiếp ghi đè ngày gửi·ngày hàng đến của dữ liệu giao hàng, **đồng thời tạo override cùng nội dung** (để không mâu thuẫn với kế hoạch được tạo lại) |
| `locked` | Không thể yêu cầu. Vận hành điều chỉnh ngoài hệ thống (§4A-4B) |

#### Quy trình tạo lại (sửa việc tạo thay thế ở §2.0A)

```
1. Xóa toàn bộ draft của kỳ đối tượng (giữ lại published / locked)   ← không tạo ngoại lệ
2. Tạo lại draft từ thiết lập
   Khóa là contract_id + line_no + channel_id + cycle_id + occurrence_key để UPSERT
   (quyết định lần 2 ngày 2026/09/21. Không đối chiếu bằng (contract_id, delivery_date))
   Tuyến lấy từ "snapshot của hợp đồng con nếu có, nếu không thì giá trị mặc định của hợp đồng cha"
   (quyết định lần 2 ngày 2026/09/21·lưu ở route_snapshot_source)
   estimated_qty (số lượng dự kiến) cũng nhập ở đây (không cho doanh nghiệp thấy nhưng giữ nội bộ)
3. Ràng buộc nhận hàng của cơ sở (§3.1C) đã có hiệu lực tại thời điểm tạo ở bước 2
4. Áp dụng override đã phê duyệt theo thứ tự thời điểm phê duyệt từ cũ đến mới
5. Nếu xung đột với published cùng khóa thì ưu tiên published (như trước)
   Dòng khác nhiệt độ·khác loại giao hàng thì dù cùng ngày giao cũng không phải xung đột
```

#### Phán định re-anchor (khi chu kỳ thay đổi)

| Tình huống | Xử lý |
|---|---|
| Ngày giao đối tượng vẫn tồn tại sau khi tạo lại | **Áp dụng.** Hiển thị "Đã điều chỉnh" ở kế hoạch |
| **Ngày giao đối tượng không còn** (đổi ngày đầu·tạm dừng cả tuần·đổi số lần) | **Mất hiệu lực.** Hiển thị "Mất hiệu lực vì lần giao đối tượng không còn" ở Cần xác nhận, đồng thời để lại ở lịch sử yêu cầu của doanh nghiệp |
| Ngày sau thay đổi không giao được | Không áp dụng mà thành **Đang đề xuất** (vận hành đưa ra ngày thay thế·§4A-3B) |
| Ngày sau thay đổi hợp lệ nhưng picking·giao hàng không đáp ứng được | **Đang đề xuất** (§4A-4E) |

- "Đã điều chỉnh" không phải cờ mà kế hoạch giữ, mà là **hiển thị (giá trị suy ra) gắn vào kế hoạch đang được override áp dụng**. Cùng cách xử lý như trung chuyển được suy ra từ trạng thái (§4A-3B).
- **Danh sách override chưa áp dụng chính là thực thể của "Cần xác nhận" của vận hành.** Không cần mỗi lần đối chiếu chênh lệch giữa phía kế hoạch và phía thiết lập.
- Dù xóa `draft` do tạm dừng·hủy hợp đồng thì override vẫn còn với trạng thái `Hủy` kèm lý do (§4A-6). Phê duyệt không biến mất lặng lẽ.
- Việc vận hành chỉ định riêng ngày (§4A-4D) cũng chạy trên cùng cơ chế. Khác biệt duy nhất là bên yêu cầu là `Vận hành`, logic phán định·re-anchor dùng chung.

### 4A-4B. Trường hợp không giao được sau `locked`·xử lý sự cố

`locked` có nghĩa là "**không ghi đè kế hoạch (ngày)**", không có nghĩa là không làm được gì. Có thể đăng ký thực tích, đổi trạng thái, thêm bản ghi tiếp theo. Nguyên tắc là **không ghi đè bản ghi quá khứ mà xử lý bằng hủy hoặc giao lại**, điều này cũng vì thanh toán và kiểm toán.

**① Giai đoạn đã ra chỉ thị xuất hàng nhưng chưa xuất, phát hiện không thể** (hỏng thiết bị kho, không sắp xếp được xe, tuyết lớn, v.v.)

| Bước | Nội dung |
|---|---|
| 1 | Vận hành (logistics) **hủy** dữ liệu giao hàng. Bắt buộc nhập lý do, để lại lịch sử |
| 2 | **Gửi lại chỉ thị xuất hàng với số lượng 0** để vô hiệu hóa (**không có I/F hủy**·§4D-3). **Sau khi nhận kết quả xuất hàng** thì chuyển sang liên hệ điện thoại (quyết định lần 3 ngày 2026/09/22. Cũ: sau khi bắt đầu picking) |
| 3 | Nếu xuất chuyến thay thế thì **tạo dữ liệu giao hàng mới** (bản ghi gốc để lại là Hủy) |
| 4 | Ở Web doanh nghiệp hiển thị **"Đang điều chỉnh ngày giao"** (khi có chuyến thay thế. Nếu không có thì "Dừng giao hàng"), truyền đạt tình hình bằng bình luận của vận hành (2026/09/29 [quyết định v2.3 #42]. (Cũ: hiển thị cho doanh nghiệp là "Đang xác nhận". Vì trùng với tên trạng thái "Đang xác nhận" 〈trạng thái chỉ của bản ghi con〉 nên thay thế 2026/09/29 [quyết định v2.3 #42]). Tên hiển thị xem §4A-7) |

**② Sự cố sau khi xuất·đang giao** (tai nạn, chậm trễ, hư hỏng, nơi giao không nhận được)

Tài xế hoặc công ty vận chuyển ủy thác báo cáo sự cố → **không đổi trạng thái dữ liệu giao hàng** (vẫn `Đã xuất` / `Đã nhận`), ghi nhận báo cáo sự cố và mở Cần xác nhận. Vận hành (logistics) chọn một trong các cách sau và **giải quyết trực tiếp bản ghi cha** (2026/09/24 bổ sung [quyết định v2.3 #20·#21]. **Cũ: chuyển trạng thái thành Đang xác nhận 〈cũ "Sự cố", REQ-DL-313〉 rồi mới chọn. Bỏ 2026/09/24**).

| Cách xử lý | Xử lý |
|---|---|
| **Giao lại** | **Nhân bản** bản ghi gốc để tạo bản ghi con có số nhánh (§4A-4C). Ngày giao mới·số vận đơn do bản ghi con giữ, bản gốc để lại là "**Chờ giao lại**" |
| **Xử lý bằng hàng thay thế** | Đăng ký hàng thay thế và phản ánh vào phiếu giao hàng mà khách tải về (REQ-DL-316, theo đặc tả xử lý hàng thay thế). **1 dòng thực tích chi tiết = sản phẩm thực tế đã giao, để lại sản phẩm gốc được thay thế ở `delivery_lines.substituted_from_product_id`. Thanh toán theo đơn giá của sản phẩm gốc** (2026/09/29 [quyết định v2.3 #39]) |
| **Hủy bỏ** | Đăng ký hủy bỏ và điều chỉnh tồn kho (như khi hàng đông lạnh bị tan). **Phần đã hủy bỏ không quay về đâu cả**. **Hàng thật còn lại tạo 1 dữ liệu giao hàng bằng lý do nhân bản "Trả về" (`duplicate_type = return`), đổi nơi giao sang nơi trả về (`warehouse_type = return` của master kho. Trụ sở chính, v.v.) và gửi đi. Không thanh toán** (2026/09/29 [quyết định v2.3 #41]·§4A-4C. (Cũ: tạo 1 dữ liệu giao hàng và gửi với nơi giao là "trụ sở chính" 〈quyết định 2026/09/14〉. Vì không có cách tạo nên thay thế 2026/09/29 [quyết định v2.3 #41])) |
| **Dừng** | Kết thúc không giao. Chốt với thực tích 0, **loại khỏi đối tượng thanh toán của tháng này. Không chuyển sang lần sau** (§4D-1). **Cước vận chuyển chọn "thanh toán / không thanh toán" bằng cùng cờ `freight_billable` như giao lại (mặc định là "không". Nếu "có" thì bắt buộc có lý do)**. Hủy bỏ theo `delivery_lines.disposed_qty`, hàng còn lại gửi bằng "Trả về" (2026/09/29 [quyết định v2.3 #40·#41]) |
| **Giao một phần (phần còn lại không gửi)** | Đóng mà không gửi phần thiếu. Bản ghi cha là `Đã giao một phần` theo số lượng giao thực tế, **không tạo bản ghi con**. Không có ngưỡng "đến bao nhiêu cái thì không gửi", vận hành chọn khi giải quyết (bắt buộc có lý do). Phần không giao không thanh toán (2026/09/29 bổ sung [quyết định v2.3 #31]) |

**Trạng thái được quyết định bởi lượng giao được** (§4A-3B). Toàn bộ số lượng thì Đã giao, một phần thì Đã giao một phần (có bản ghi con số còn lại / phần còn lại không gửi), gửi lại với số lượng giao bằng 0 thì Chờ giao lại, kết thúc với bằng 0 thì Dừng. Hàng thay thế và hủy bỏ là xử lý đi kèm với những cái này, không phải trạng thái.

**Giải quyết bản ghi cha và xử lý bản ghi con tự động (2026/09/24 bổ sung [quyết định v2.3 #21]·2026/09/29 bổ sung [quyết định v2.3 #27·#29·#31·#32])**

Batch không quyết định cách giải quyết của bản ghi cha. **Người giải quyết là vận hành (logistics)**, khi có bản ghi con tự động (§4A-4C) thì xử lý trong cùng transaction. **Giải quyết được thực hiện gộp theo đơn vị chuyến giao**: đóng toàn bộ báo cáo sự cố chưa giải quyết của chuyến giao đó trong 1 lần giải quyết, ghi cùng nội dung giải quyết·thời điểm giải quyết·người giải quyết·lý do vào từng báo cáo (2026/09/29 bổ sung [quyết định v2.3 #29]).

| Giải quyết | Bản ghi cha | Xử lý bản ghi con tự động |
|---|---|---|
| Giao toàn bộ / toàn bộ bằng hàng thay thế (hàng thay thế chọn sản phẩm, để lại sản phẩm gốc ở `substituted_from_product_id`·[quyết định v2.3 #39]) | `Đã giao` | `Hủy` (lý do `auto child not needed`) |
| Giao một phần | `Đã giao một phần` | **Dùng lại**: `duplicate_type = remainder`, số lượng·chi tiết (`delivery_lines`) = số còn lại |
| **Giao một phần (phần còn lại không gửi)** (`partial_no_resend`) | `Đã giao một phần` (chốt theo số lượng giao thực tế) | `Hủy`. **Không tạo bản ghi con**. Không có ngưỡng·vận hành quyết định·bắt buộc có lý do (2026/09/29 bổ sung [quyết định v2.3 #31]) |
| Giao lại toàn bộ | `Chờ giao lại` | **Dùng lại**: `duplicate_type = redelivery`, số lượng·chi tiết = toàn bộ số lượng |
| Ghé lại trong ngày | `Đã nhận` | `Hủy` |
| Không giao | `Dừng` (cước vận chuyển chọn bằng `freight_billable`·[quyết định v2.3 #40]) | `Hủy` |
| **Xác nhận chưa giao sau hoàn tất suy đoán** (`Đã giao`·chỉ `completion_source = presumed`) | `Chờ giao lại` / `Dừng` | Nếu chờ giao lại thì **dùng lại** (nếu không có thì tạo bản ghi con toàn bộ số lượng) / nếu dừng thì `Hủy` (2026/09/29 bổ sung [quyết định v2.3 #27]) |

- Điểm khởi đầu: giao một phần (có bản ghi con số còn lại / phần còn lại không gửi)·giao lại·dừng·ghé lại trong ngày từ `Đã xuất` / `Đã nhận`. Giao toàn bộ từ `Đã xuất` / `Đã nhận` / `Đã giao`.
- **Ngoại lệ: chỉ `Đã giao` hoàn tất suy đoán (`completion_source = presumed`) có thể chuyển sang `Chờ giao lại` / `Dừng`** (2026/09/29 bổ sung [quyết định v2.3 #27]. Ngoại lệ của #21 ngày 9/24 "giải quyết chọn được từ `Đã giao` chỉ là giao toàn bộ"). Khi doanh nghiệp·cơ sở liên hệ "chưa nhận được", vận hành đăng ký báo cáo sự cố thay và **yêu cầu Yamato điều tra**. Khi biết là thất lạc·chưa giao thì giải quyết (bắt buộc có lý do). **Cái trở thành Đã giao bằng báo cáo của tài xế (`reported`)·xác nhận nhận hàng của doanh nghiệp (`customer`) nằm ngoài đối tượng.** Phần đã đặt Chờ giao lại·Dừng không thanh toán. **Nếu thanh toán đã chốt thì không sửa ngược mà sửa bằng điều chỉnh (hoàn tiền·bù trừ) của tháng sau** (§4D-1). **Chưa quyết định**: trường hợp chỉ một phần của thùng không đến (có thể chuyển sang `Đã giao một phần` không) chưa được quyết (§8).
- **Tự động giải quyết chậm trễ**: Khi chuyến giao mà báo cáo sự cố chưa giải quyết **chỉ là chậm trễ** nhận được **báo cáo giao toàn bộ số lượng** (số lượng giao = số lượng dự kiến) từ tài xế, hệ thống sẽ **tự động giải quyết báo cáo đó bằng "Giao toàn bộ"** trong cùng transaction với `→ Đã giao` (người giải quyết là hệ thống·kiểm toán là `actor_type = system`·cũng đóng Cần xác nhận `trouble_open`). Nếu còn báo cáo chưa giải quyết ngoài chậm trễ, hoặc số lượng giao khác kế hoạch thì không tự động giải quyết. Chậm trễ không đến được trong ngày được giữ ở Cần xác nhận, vận hành giải quyết bằng giao lại, v.v. (2026/09/29 bổ sung [quyết định v2.3 #32]).
- **Với 1 chuyến giao xảy ra sự cố, dù có bản ghi con tự động còn hiệu lực cũng không tạo bản ghi con thứ 2.** Nhân bản thủ công cũng dùng lại nếu chuyến giao đó đã có bản ghi con, từ chối bản ghi thứ 2 (`DOMAIN_TROUBLE_CHILD_EXISTS`·[quyết định v2.3 #21·#29]. Cũ: nếu báo cáo của sự cố đó có bản ghi con. Đổi sang đơn vị chuyến giao 2026/09/29). Nếu không có bản ghi con tự động thì với giao một phần·giao lại vẫn tạo bản ghi con bằng nhân bản như trước (§4A-4C).
- Điều kiện giải quyết: chuyến giao có từ 1 báo cáo sự cố chưa giải quyết trở lên, bản ghi cha vẫn là `Đã xuất` / `Đã nhận` / `Đã giao`. Nếu có bản ghi con tự động thì phải ở `Đang xác nhận`. Bắt buộc có lý do. Khóa chuyến giao·toàn bộ báo cáo sự cố chưa giải quyết·bản ghi con tự động, và thực hiện **giải quyết toàn bộ báo cáo chưa giải quyết + giải quyết bản ghi cha + cập nhật / hủy bản ghi con + giải quyết Cần xác nhận (`trouble_open`·`trouble_auto_child_pending`) + kiểm toán trong 1 transaction** (DEV §15.12·§17.1·[quyết định v2.3 #29]).

**Loại sự cố (master·thống nhất 1 hệ / quyết định 2026/09/13)**

Phân loại vốn khác nhau theo từng màn hình của app được thống nhất thành 6 loại sau. **Loại được giữ ở master (`trouble_types`)**, gắn cho từng loại cách xử lý mặc định của vận hành và **có tạo bản ghi con tự động hay không (`auto_child`)** (cột bản ghi con tự động bổ sung 2026/09/29 [quyết định v2.3 #30·#33]).

| Loại | Cách xử lý mặc định | Bản ghi con tự động (cùng lúc với báo cáo) |
|---|---|---|
| Chênh lệch số lượng (thiếu·thừa) | **Nhân bản** phần thiếu để giao bổ sung, hoặc **không gửi** (1〜2 cái, v.v.·vận hành quyết định [quyết định v2.3 #31]) / phần thừa điều chỉnh vào lần sau | **Không tạo** (khi giải quyết chọn "gửi / không gửi", chỉ tạo bản ghi con khi gửi) |
| Giao nhầm | **Nhân bản** và giao lại. **Thu hồi chỉ ghi trong báo cáo sự cố** (quyết định 2026/09/21·#68. Không tạo các mục chuyên dụng như ngày thu hồi·người thu hồi·số lượng thu hồi) | **Tạo** (hầu như chắc chắn cần thu hồi + giao lại) |
| Hư hỏng·chất lượng kém | Xử lý bằng hàng thay thế, hoặc đăng ký hủy bỏ | **Tạo** (cần chuẩn bị hàng thay thế·giao lại) |
| Vắng mặt·không nhận được | **Nhân bản** và giao lại | **Tạo** (hầu như chắc chắn cần giao lại) |
| Chậm trễ (kẹt xe·tai nạn·thời tiết) | Ghé lại trong ngày, hoặc **nhân bản** sang ngày hôm sau. **Nếu chuyến giao chỉ chậm trễ nhận được báo cáo giao toàn bộ thì tự động giải quyết** [quyết định v2.3 #32] | **Không tạo** (không cần nếu đến được trong ngày) |
| Khác | Bắt buộc nhập lý do, vận hành phán đoán riêng | **Không tạo** (vận hành phán đoán riêng) |

**Việc tạo / không tạo bản ghi con tự động được giữ ở master (`trouble_types.auto_child`)**. Bảng trên là giá trị ban đầu [quyết định v2.3 #30·#33].

**Đối ứng giữa nội dung báo cáo của app và 6 loại master (quyết định 2026/09/21·#66)**

**Màn hình app tài xế giữ nguyên (đã chốt·§4B-5). Phía vận hành đối ứng với 6 loại.** Không sửa để đưa lựa chọn của app về 6 loại.

| Lựa chọn của app (màn hình đã chốt) | 6 loại master |
|---|---|
| Thiếu số thùng | **Chênh lệch số lượng (thiếu·thừa)** |
| Thiếu sản phẩm·giao nhầm | **Loại chưa định** (`type_code` NULL). **Chênh lệch số lượng (thiếu·thừa)** hoặc **Giao nhầm** (vận hành xem nội dung rồi phân loại). **Không tạo bản ghi con tự động** (tạo khi vận hành gán loại "tạo"·[quyết định v2.3 #30]) |
| Giao nhầm | **Giao nhầm** |
| Hàng hư hỏng | **Hư hỏng·chất lượng kém** |
| Vắng mặt·không liên lạc được | **Vắng mặt·không nhận được** |
| Kẹt xe·tai nạn | **Chậm trễ (kẹt xe·tai nạn·thời tiết)** |
| Khác | **Khác** |

- Việc đối ứng do **hệ thống thực hiện bằng master (`trouble_app_reasons`: `app_reason_raw` → `type_code`)**. Giá trị từ app được giữ nguyên bản gốc (`trouble_reports.app_reason_raw`), và **loại tại thời điểm báo cáo được quyết định bằng bảng đối ứng này**. Chỉ "Thiếu sản phẩm·giao nhầm" vắt qua 2 loại thì đăng ký với `type_code` là NULL (loại chưa định), vận hành gán `type_code` trong 6 loại (2026/09/29 bổ sung [quyết định v2.3 #30·#33]. Cũ: toàn bộ do vận hành gán `type_code` trong 6 loại). Với đăng ký thay của vận hành, phán định theo loại vận hành đã chọn.
- Những cái như "Thiếu sản phẩm·giao nhầm" mà 1 lựa chọn vắt qua 2 loại thì **vận hành phân loại trong quá trình giải quyết sự cố**. Không tự động phán định. **(Cũ: phân loại trong xử lý Đang xác nhận. Sửa 2026/09/24)**
- Cho đến khi gán loại, báo cáo sự cố vẫn chưa giải quyết và ở "Cần xác nhận" (`trouble_open`) (**không đổi trạng thái bản ghi cha**·[quyết định v2.3 #20·#30]). Nếu loại do vận hành gán là loại "tạo" thì **tạo bản ghi con tự động ngay thời điểm đó** (cập nhật loại + bản ghi con tự động + Cần xác nhận + kiểm toán trong 1 transaction·[quyết định v2.3 #30·#33]). Dù gán lại sang loại "không tạo", bản ghi con tự động đã tạo cũng không tự động hủy mà xử lý khi giải quyết (DEV §15.12.1). **(Cũ: vẫn ở Đang xác nhận. Bỏ 2026/09/24)**

- Người báo cáo không chỉ là tài xế. **Với chuyến của công ty vận chuyển, đó là liên hệ từ doanh nghiệp·cơ sở hoặc công ty giao hàng** nên chuẩn bị cổng để **vận hành có thể đăng ký thay**.
- Cách xử lý mặc định chỉ là **đề xuất ứng viên**, người chọn cuối cùng là vận hành (bắt buộc nhập lý do).

**③ Khi doanh nghiệp yêu cầu thay đổi sau `locked`**

Không nhận yêu cầu thay đổi từ hệ thống (§3.4). Vận hành điều chỉnh ngoài hệ thống, xử lý bằng giao lại ở ② hoặc hủy + tạo lại ở ①. Không ghi đè kế hoạch ngược về quá khứ.

**Tổng quan trạng thái**

```
（Kế hoạch: không có trạng thái）→ Chờ xuất → Đã xuất → Đã nhận → Đã giao
                       │          │
                       │          └→ Đã giao (suy đoán·chuyến công ty vận chuyển. Trừ cái có báo cáo sự cố chưa giải quyết)
                       └→ Hủy (chỉ trước khi xuất·bắt buộc có lý do)→〔Nhân bản: chuyến thay thế〕

Báo cáo sự cố (Đã xuất·Đã nhận. Liên hệ sau khi giao là Đã giao) → không đổi trạng thái bản ghi cha, báo cáo sự cố + Cần xác nhận
  Vận hành (logistics) giải quyết trực tiếp bản ghi cha ┬→ Đã giao (kể cả hàng thay thế)             … nếu có bản ghi con tự động thì Hủy
                              ├→ Đã giao một phần ＋〔Con: số còn lại DL-…-1〕  … dùng lại bản ghi con tự động (remainder)
                              ├→ Chờ giao lại  ＋〔Con: toàn bộ DL-…-1〕  … dùng lại bản ghi con tự động (redelivery)
                              ├→ Đã nhận (ghé lại trong ngày)             … nếu có bản ghi con tự động thì Hủy
                              ├→ Đã giao một phần (phần còn lại không gửi)       … không có bản ghi con·nếu có bản ghi con tự động thì Hủy (#31)
                              └→ Dừng (thực tích 0·bắt buộc có lý do)            … nếu có bản ghi con tự động thì Hủy
  Đã giao hoàn tất suy đoán (presumed) ─(Yamato điều tra, chưa giao)→ Chờ giao lại＋con / Dừng (#27)
  Cùng lúc đăng ký báo cáo (loại là auto_child＝giao nhầm·vắng mặt·hư hỏng) → 1 bản ghi con tự động: Đang xác nhận (trouble_pending) (#30)
    ※Với 1 chuyến giao xảy ra sự cố, bản ghi con tự động còn hiệu lực tối đa 1 bản ghi (#29). Sự cố ở bản ghi con → số nhánh tiếp theo của bản ghi cha (#28)
  Chỉ chậm trễ＋báo cáo giao toàn bộ → hệ thống tự động giải quyết bằng "Giao toàn bộ" (#32)
  (Cũ: quá auto_duplicate_due_at mà vẫn chưa giải quyết → batch tạo 1 bản ghi con tự động. Bỏ 2026/09/29)

Bản ghi con·bản ghi con tự động: Đang xác nhận ─(chốt ngày·số lượng)→ Chờ xuất → …　／　Đang xác nhận ─(không cần gửi lại)→ Hủy
```

**(Cũ: Đã nhận → Đang xác nhận → Đã giao / Đã giao một phần / Chờ giao lại / Dừng / Đã nhận, Đã xuất → Đang xác nhận 〈báo cáo trước khi nhận〉. Bỏ 2026/09/24 [quyết định v2.3 #20])**

- **Chỉ vận hành (logistics) mới có thể chuyển sang hủy·dừng·chờ giao lại**. Tài xế và công ty giao hàng ủy thác chỉ dừng ở báo cáo (§11-3).
- Mọi thao tác đều **bắt buộc nhập lý do** và để lại lịch sử thay đổi (§11-2).
- Các trường hợp phát sinh được **đưa vào "Cần xác nhận"** của lịch vận hành, để không còn lại chưa xử lý.

### 4A-4C. Nhân bản dữ liệu giao hàng (giao lại·giao từng phần·chuyến thay thế)

Giao lại·giao từng phần·chuyến thay thế đều là xử lý "**không ghi đè bản ghi gốc mà tạo thêm 1 dữ liệu giao hàng cùng nội dung**". Không liệt kê từng chức năng riêng mà chuẩn bị **nhân bản như 1 thao tác cơ bản**, dùng phân biệt theo lý do.

**Cái được sao chép / không được sao chép**

| Sao chép | Không sao chép (quyết định mới) |
|---|---|
| ID hợp đồng·doanh nghiệp·cơ sở·loại giao hàng (nhiệt độ) | Ngày giao·ngày picking |
| Kho picking·điểm trung chuyển·công ty giao hàng (tuyến giao hàng) | Số vận đơn (cấp lại. Không cấp ở điểm trung chuyển) |
| Snapshot nơi giao (địa chỉ·điện thoại·người phụ trách·ghi chú). **Chỉ khi trả về thì đổi sang địa chỉ nơi trả về** (2026/09/29 [quyết định v2.3 #41]) | Số lượng (phân bổ như dưới đây) |
| Tham chiếu tài liệu đính kèm | Thực tích giao hàng·thu tiền·phân công tài xế·**số túi giữ lạnh·số gói giữ lạnh** (vì bản ghi con là hàng khác) |

**Số nhánh và quan hệ cha con**

- Bản ghi tạo bằng nhân bản được gắn **số nhánh** vào ID giao hàng gốc (`DL-260820-0012` → `DL-260820-0012-1`, nếu chia tiếp thì `-2`).
- Tham chiếu bản ghi cha bằng `parent_delivery_id`. **Cha con tối đa 1 cấp**, không tạo cháu từ bản ghi con (số nhánh tối đa 9).
- **Nếu bản ghi con (giao lại·giao từng phần, v.v.) lại xảy ra sự cố thì không nhân bản từ bản ghi con mà tạo số nhánh tiếp theo của bản ghi cha** (2026/09/29 bổ sung [quyết định v2.3 #28]). Ví dụ: sự cố ở `DL-…-0014-1` → bản ghi con mới là `DL-…-0014-2` (cha `-0014`). Nội dung (nơi giao·điều kiện giao·khung giờ nhận·`delivery_legs`) sao chép từ **bản ghi con đã xảy ra sự cố**. Chính bản ghi con đã xảy ra sự cố được đóng bằng giải quyết như các chuyến giao khác (`Chờ giao lại`·`Dừng`, v.v.). Bản ghi con tự động cũng theo cùng quy tắc. **Nếu số nhánh vượt quá 9 thì là `DOMAIN_BRANCH_LIMIT`, đưa vào Cần xác nhận và vận hành phán đoán.**
- Số chỉ thị của CSV chỉ thị xuất hàng cũng dùng cùng số nhánh, phía Thomas xử lý làm ID duy nhất (REQ-DL-114).

**Phân bổ số lượng**

Khi nhân bản, phân bổ số lượng cho bản gốc và bản nhân bản. Có thể chỉ định số còn lại theo từng sản phẩm.

| Mục đích | Bản ghi gốc | Bản ghi nhân bản |
|---|---|---|
| **Giao từng phần** (hôm nay chỉ giao một phần, phần còn lại giao sau) | Chốt theo số lượng thực tế đã giao, đặt trạng thái **Đã giao một phần** | Số lượng còn lại. Đặt **ngày giao tạm**, trạng thái **Đang xác nhận**. Nếu có bản ghi con tự động của sự cố thì dùng lại (`duplicate_type = remainder`·[quyết định v2.3 #21]) |
| **Giao lại** (giao lại phần chưa đến) | Số lượng giữ nguyên. Đặt trạng thái **Chờ giao lại** | Số lượng chưa đến. Đặt **ngày giao lại tạm**, trạng thái **Đang xác nhận**. Nếu có bản ghi con tự động của sự cố thì dùng lại (`duplicate_type = redelivery`·[quyết định v2.3 #21]) |
| **Chuyến thay thế** (hủy trước khi xuất rồi xuất bằng chuyến khác) | Đặt trạng thái **Hủy** (giữ số lượng) | Toàn bộ số lượng. Đổi kho·công ty giao hàng để thiết lập |
| **Trả về** (`duplicate_type = return`. Gửi hàng còn lại về trụ sở chính, v.v.·2026/09/29 [quyết định v2.3 #41]) | Giữ nguyên theo kết quả giải quyết như dừng·đã giao một phần | **Số còn lại**. **Nhân bản duy nhất có thể đổi nơi giao sang nơi trả về**: chọn nơi trả về từ `warehouse_type = return` của master kho (trụ sở chính, v.v.), giữ ở `deliveries.return_to_warehouse_id`. Snapshot địa chỉ là địa chỉ nơi trả về. **Ngoài đối tượng thanh toán**. Quy tắc cha con 1 cấp·số nhánh giống nhân bản |

**Trường hợp sử dụng được**

- **Chỉ có thể nhân bản từ `published` và `locked`. Không thể nhân bản từ `draft`** (quyết định lần 2 ngày 2026/09/21). **Vì nhân bản là tạo mới và không ghi đè bản gốc nên cũng thực hiện được ở `locked`**.
  - **Điều có thể làm ở `draft` (kế hoạch) chỉ là "sao chép / thay đổi kế hoạch"**. Nhân bản kèm `parent_delivery_id`·số nhánh·trạng thái **Đang xác nhận** chỉ thực hiện từ `published` / `locked` nơi dữ liệu giao hàng tồn tại.
  - Kế hoạch không có dữ liệu giao hàng, cũng không có vận đơn hay thực tích. Nếu tạo quan hệ cha con thì không có đích để trỏ, và khi kế hoạch trở thành dữ liệu giao hàng bằng tạo xác định thì cha con bị tạo trùng.
  - **(Cũ: lần 1 "nhân bản có thể thực hiện từ bất kỳ `draft` / `published` / `locked`" bị hủy. Thay đổi ở lần 2 ngày 2026/09/21)**
- **Khi xuất từ kho khác thì coi là "xử lý như hàng thay thế"** (quyết định 2026/09/14). Nếu kho đích không xử lý sản phẩm đó thì chọn lại sản phẩm (§2.3C). Nếu có xử lý thì nhân bản nguyên trạng.
- Chỉ vận hành (logistics) thực hiện được. **Bắt buộc chọn lý do (giao từng phần / giao lại / chuyến thay thế / **trả về** / khác) và nhập nội dung lý do** ("Trả về" bổ sung 2026/09/29 [quyết định v2.3 #41]), để lại lịch sử thay đổi (§11-2). **Ngoại lệ chỉ là bản ghi con tự động của sự cố**, hệ thống tạo với `actor_type = system` trong cùng transaction với đăng ký báo cáo sự cố (hoặc gán lại loại) (xem dưới·[quyết định v2.3 #30]. Cũ: batch `trouble_auto_duplicate` tạo [quyết định v2.3 #22]. Bỏ 2026/09/29).
- **Nếu chuyến giao xảy ra sự cố đã có bản ghi con còn hiệu lực (khác `Hủy`) thì nhân bản thủ công cũng dùng lại, không tạo bản ghi thứ 2** (`DOMAIN_TROUBLE_CHILD_EXISTS`·[quyết định v2.3 #21·#29]. Cũ: nếu báo cáo sự cố đó có bản ghi con. Đổi sang đơn vị chuyến giao 2026/09/29).
- Bản ghi nhân bản được đưa vào cùng "Cần xác nhận" như bản gốc, để ngày·vận đơn·tài xế không bị bỏ mặc ở trạng thái chưa thiết lập.

**Bản ghi con được nhân bản tạo ở "Đang xác nhận", vận hành xác nhận thì mới bắt đầu chạy (quyết định 2026/09/18)**

Bản ghi con tạo khi giao từng phần·giao lại thì tại thời điểm tạo **ngày vẫn chưa chốt**. Cái vận hành đã quyết định cách xử lý nhập ngay tại chỗ là **ngày tạm**, có khi quyết định lại sau khi xem hoạt động của kho·lead time·việc doanh nghiệp có nhận được hay không. Do đó làm như sau.

1. **Phần đã giao được thì cho tiến tiếp.** Bản ghi gốc chốt theo số lượng đã giao thực tế, **hoàn tất ngay tại chỗ** là Đã giao một phần (nếu giao lại thì Chờ giao lại). Không dừng thực tích cho đến khi quyết định cách xử lý số còn lại.
2. **Số còn lại (bản ghi con) tạo ở "Đang xác nhận".** Ngày nhập ở màn hình xử lý được giữ làm **ngày giao tạm**, trạng thái là Đang xác nhận. Ngày picking được đặt tính ngược từ ngày giao tạm.
3. **Đưa vào Cần xác nhận.** Hiển thị ở Cần xác nhận của lịch vận hành là "Chờ xử lý số còn lại" "Chờ xác nhận ngày giao lại", để không trôi đi mà chưa xử lý.
4. **Vận hành xác nhận và chốt.** Kết quả xác nhận có 3 loại. **Chốt ngày này** (→ Chờ xuất) / **Đổi ngày** (tại thời điểm quyết định lại thì coi như đã xác nhận → Chờ xuất) / **Dừng** (→ Dừng). Tất cả đều để lại lịch sử thay đổi cùng lý do.

**Bản ghi con tự động của sự cố (2026/09/24 bổ sung [quyết định v2.3 #22〜#24]·2026/09/29 bổ sung [quyết định v2.3 #28〜#30] đổi cách tạo)**

**Tại thời điểm đăng ký báo cáo sự cố, nếu loại là "tạo" thì tạo 1 bản ghi con để chuẩn bị gửi lại** (không chờ thời gian 〈SLA〉). **Dù có báo cáo sự cố cũng không đổi trạng thái bản ghi cha** (§4A-3B). (Cũ: khi báo cáo sự cố không được giải quyết đến hạn thì batch tạo 1 bản ghi con. Bỏ 2026/09/29 [quyết định v2.3 #30])

| Mục | Nội dung |
|---|---|
| Khi nào | **Cùng transaction với đăng ký báo cáo sự cố** (cả báo cáo của tài xế lẫn đăng ký thay của vận hành). Báo cáo mà tại thời điểm báo cáo loại chưa định (`type_code` NULL) thì tạo **tại thời điểm vận hành gán loại "tạo"**, trong cùng transaction với cập nhật loại (2026/09/29 bổ sung [quyết định v2.3 #30]). **(Cũ: khi quá hạn `trouble_reports.auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes` 〈số phút bắt buộc trong thiết lập vận hành〉, batch `trouble_auto_duplicate` tạo. Bỏ 2026/09/29 [quyết định v2.3 #30])** |
| Điều kiện tạo | Có báo cáo sự cố chính thức / **master loại `trouble_types.auto_child = true`** (giá trị ban đầu: giao nhầm·vắng mặt·hư hỏng = tạo / chênh lệch số lượng·chậm trễ·khác = không tạo) / chuyến giao xảy ra sự cố là `Đã xuất`·`Đã nhận`·`Đã giao` / **chuyến giao đó chưa có bản ghi con tự động còn hiệu lực (khác `Hủy`)**. Phán định loại: với báo cáo của tài xế thì theo bảng đối ứng lựa chọn của app (`trouble_app_reasons`), với đăng ký thay thì theo loại vận hành đã chọn. "Thiếu sản phẩm·giao nhầm" là loại chưa định nên không tạo. **Chỉ vì chuyến giao chưa hoàn tất thì không tạo**. (Cũ: báo cáo chưa giải quyết / đã quá `auto_duplicate_due_at` / báo cáo đó chưa có bản ghi con. Bỏ 2026/09/29) |
| Loại không tạo | Chênh lệch số lượng·chậm trễ·khác·loại chưa định không tạo. **Báo cáo sự cố chưa giải quyết được giữ ở Cần xác nhận `trouble_open` (đối tượng là chuyến giao)**, tránh bỏ sót xử lý ở đây. Với chênh lệch số lượng, khi giải quyết chọn "gửi (giao một phần + bản ghi con) / không gửi (`partial_no_resend`)" ([quyết định v2.3 #31]). Chậm trễ tự động giải quyết bằng báo cáo giao toàn bộ ([quyết định v2.3 #32]) |
| Giá trị của bản ghi con tự động | `Đang xác nhận`, `duplicate_type = trouble_pending`, `creation_source = trouble_auto`, `source_trouble_delivery_id` (chuyến giao xảy ra sự cố), `source_trouble_report_id` (báo cáo đầu tiên·để tham chiếu), `schedule_confirmed = false`, `quantity_confirmed = false`. (Cũ: `creation_source = trouble_timeout`. Đổi tên thành `trouble_auto` 2026/09/29 [quyết định v2.3 #33]) |
| Sao chép | Giống nhân bản, sao chép toàn bộ snapshot nơi giao·điều kiện giao·khung giờ nhận·`delivery_legs` **của chuyến giao xảy ra sự cố**. Không sao chép vận đơn·phân công·tài liệu đính kèm. Giữ cha con 1 cấp·số nhánh 1〜9. **Nếu sự cố xảy ra ở bản ghi con thì tạo như số nhánh tiếp theo của bản ghi cha** (nội dung sao chép từ bản ghi con đó. Số nhánh vượt 9 là `DOMAIN_BRANCH_LIMIT` + Cần xác nhận·[quyết định v2.3 #28]) |
| Ngày·số lượng | Ngày ứng viên là **tạm để hiển thị**. Số lượng là **tạm của lượng tối đa có thể gửi lại**, không dùng cho xuất hàng·thanh toán |
| Số lượng bản ghi | **Với 1 chuyến giao xảy ra sự cố, bản ghi con tự động còn hiệu lực (khác `Hủy`) tối đa 1 bản ghi**. Từ báo cáo thứ 2 trở đi không tạo, dùng lại bản ghi con hiện có. Ràng buộc duy nhất `UNIQUE(source_trouble_delivery_id) WHERE creation_source = 'trouble_auto' AND status <> 'Hủy'` là chốt chặn cuối (2026/09/29 bổ sung [quyết định v2.3 #29]). **(Cũ: 1 báo cáo sự cố có tối đa 1 bản ghi con. Batch thử lại bằng UPSERT theo `source_trouble_report_id`／idempotent 〈`UNIQUE(source_trouble_report_id)`〉. Bỏ 2026/09/29 [quyết định v2.3 #29])** |
| Cần xác nhận | Tạo·cập nhật `review_items.kind = trouble_auto_child_pending` (đối tượng là bản ghi con). Bản thân báo cáo được mở riêng bằng `trouble_open` (đối tượng là chuyến giao) ([quyết định v2.3 #30]) |
| Ngoài đối tượng | Cho đến khi vận hành chốt, nằm ngoài đối tượng của **chỉ thị xuất hàng·vận đơn·phân công tài xế·thanh toán·thông báo·hoàn tất suy đoán** ([quyết định v2.3 #23]) |
| Sang `Chờ xuất` | Chỉ khi vận hành (logistics) đã chốt việc giải quyết sự cố của bản ghi cha và số lượng·ngày giao, đặt `quantity_confirmed = true`·`schedule_confirmed = true` thì `Đang xác nhận → Chờ xuất`. Nếu chưa chốt thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`. Với cách giải quyết không cần gửi lại (giao toàn bộ·giao một phần 〈phần còn lại không gửi〉·ghé lại trong ngày·dừng) thì `Đang xác nhận → Hủy` trong cùng transaction (bắt buộc có lý do). Cũng đóng Cần xác nhận `trouble_auto_child_pending`·`trouble_open` trong cùng transaction ([quyết định v2.3 #24·#29·#31]) |

- Dữ liệu giao hàng tạo bằng tạo xác định thông thường là `creation_source = materialize`·`schedule_confirmed = true`, `quantity_confirmed` là true khi chốt số lượng. Nhân bản thủ công của vận hành là `creation_source = ops_duplicate` (§7).
- **Đăng ký báo cáo sự cố = báo cáo + khóa chuyến giao + (nếu loại là `auto_child`) bản ghi con tự động + 2 Cần xác nhận (`trouble_open`·`trouble_auto_child_pending`) + kiểm toán** trong 1 transaction. **Khi gán lại loại và thành "tạo" = cập nhật loại + bản ghi con tự động + Cần xác nhận + kiểm toán**. Không đặt bản ghi cha là `Đang xác nhận` (DEV §13.2.1·§15.12.1·§17.1·[quyết định v2.3 #30·#33]). Dù gán lại sang loại "không tạo", bản ghi con tự động đã tạo cũng không tự động hủy mà xử lý khi giải quyết. **(Cũ: batch `trouble_auto_duplicate` thực hiện báo cáo sự cố + khóa bản ghi cha + bản ghi con + Cần xác nhận + kiểm toán trong 1 transaction 〈DEV §16.8.1〉. Bỏ 2026/09/29)**

Lý do không đặt Chờ xuất cho đến khi qua xác nhận là **để ngăn việc ngày tạm chảy sang chỉ thị xuất hàng**. Chỉ thị xuất hàng tự động ra **gộp cho 2 tuần, vào 3 ngày trước (thứ Sáu) ngày bắt đầu của 2 tuần đó** (xác nhận 2026/09/21. Cũ: ngày trước ngày picking), nếu để chờ xác nhận bị bỏ mặc thì kho sẽ hoạt động theo ngày mà không ai xem.

**Trạng thái ngoại lệ bắt buộc có lý do và lịch sử (quyết định 2026/09/18)**

Dừng·hủy·đã giao một phần·chờ giao lại·đang xác nhận là **kết quả do ai đó phán đoán**, không phải trạng thái được quyết định tự động. Do đó bắt buộc những điều sau.

| Bắt buộc | Nội dung |
|---|---|
| Lý do | Chọn từ master 6 loại, có thể kèm nội dung bổ sung. Hiển thị **lý do·thời điểm đăng ký·người đăng ký** bên cạnh trạng thái |
| Lịch sử thay đổi | Mỗi lần trạng thái thay đổi để lại 1 dòng (`Đã nhận → Dừng: người phụ trách nhận vắng mặt`. Ví dụ cũ `Đang xác nhận → Dừng` được sửa 2026/09/24 vì không còn đặt bản ghi cha là Đang xác nhận bằng báo cáo sự cố [quyết định v2.3 #20]). Không tạo thay đổi trạng thái không có trong lịch sử |
| Liên kết cha con | Khi tạo bằng nhân bản, bản ghi cha hiển thị **bản nhân bản**, bản ghi con hiển thị **bản gốc**, chuyển màn hình qua lại được. Kèm số lượng·trạng thái·ngày giao |

Nếu để lại việc dừng không có lý do thì không giải thích được "tại sao không giao được" ở thanh toán và kiểm toán. Không tạo lối đi chỉ đổi trạng thái từ màn hình, nhất định phải qua thao tác quyết định cách xử lý (§4A-4B).

**Bản nhân bản Đang xác nhận nằm ngoài đối tượng của chỉ thị xuất hàng** (REQ-DL-801). Không tạo trạng thái "dữ liệu giao hàng đã có lịch sử chỉ thị xuất hàng mà đang Đang xác nhận". **Việc không đặt bản ghi cha Đã xuất·Đã nhận·Đã giao thành Đang xác nhận bằng báo cáo sự cố** cũng cùng lý do (2026/09/24 bổ sung [quyết định v2.3 #20]).

**Cái vẫn sửa được dù đã giao (quyết định 2026/09/18)**

Cái bị khóa là **chỉ định ngày·tuyến·số lượng**, **thực tích và tài liệu đính kèm không bị khóa**. Sau khi giao phát sinh việc tài xế quên báo cáo, ảnh đến sau, đính chính số tiền thu.

| Đối tượng | Khi đã giao (`done`) |
|---|---|
| Ngày giao·ngày picking | Không thay đổi được (xử lý bằng hủy·nhân bản) |
| Kho·công ty giao hàng·trung chuyển·lead time | Không thay đổi được |
| Số lượng (số dự kiến) | Không thay đổi được |
| **Thực tích giao hàng** (thời điểm hoàn tất·số lượng giao·ghi chú) | **Sửa được. Bắt buộc nhập lý do, để lại lịch sử thay đổi** |
| **Tài liệu đính kèm** (báo cáo trước sau khi trưng bày·đỗ xe·thu tiền) | **Thêm·thay thế được. Để lại lịch sử thay đổi** |

Vì thanh toán dựa trên thực tích giao hàng (§4D-1), **việc sửa thực tích liên quan đến tháng thanh toán đã chốt không sửa ngược thanh toán mà phản ánh bằng điều chỉnh từ tháng sau trở đi**.

**Dù có liên hệ (khiếu nại) sau khi giao cũng không đưa `Đã giao` về `Đang xác nhận`** (2026/09/24 bổ sung [quyết định v2.3 #20]). Liên hệ được ghi nhận bằng báo cáo sự cố và mở Cần xác nhận. Không đặt thời hạn tiếp nhận (#61). Vận hành (logistics) giải quyết, đóng lại ở `Đã giao` như giao toàn bộ (§4A-4B). **Ngoại lệ: với `Đã giao` hoàn tất suy đoán (`completion_source = presumed`) khi có liên hệ "chưa nhận được", vận hành đăng ký thay và yêu cầu Yamato điều tra, nếu biết là thất lạc·chưa giao thì có thể chuyển sang `Chờ giao lại` (bản ghi con) / `Dừng`** (2026/09/29 bổ sung [quyết định v2.3 #27]. `reported`·`customer` nằm ngoài đối tượng). Nếu loại liên hệ là loại tạo bản ghi con tự động (giao nhầm·hư hỏng, v.v.) thì tạo 1 bản ghi con tự động cùng lúc với đăng ký thay ([quyết định v2.3 #30]). Như bảng trên, thực tích sửa được kèm lý do, và việc sửa sau khi thanh toán đã chốt không sửa ngược thanh toán mà **phản ánh vào tháng sau** bằng điều chỉnh (hoàn tiền·bù trừ) trong ①thanh toán trước·②quyết toán thực tích (§4D-1). **(Cũ: không đặt thời hạn đưa Đã giao về "Đang xác nhận", vận hành phán đoán rồi đưa về 〈quyết định 2026/09/21·#61〉. Bỏ 2026/09/24)**

**Tài liệu đính kèm có 2 loại (sắp xếp 2026/09/21)**

"Tài liệu đính kèm" chỉ 2 loại gắn vào đối tượng khác nhau, nếu lẫn lộn thì không rõ ai chịu trách nhiệm thay thế. **Cả hai đều đặt ở tab "Tài liệu đính kèm" của màn hình chi tiết** và chia thành 2 trong tab.

| | Tài liệu của địa điểm | Tài liệu của chuyến giao này |
|---|---|---|
| Nội dung | Sơ đồ đường vào·sổ tay cơ sở·quy trình giữ hàng tại văn phòng·hướng dẫn bãi đỗ xe | Ảnh báo cáo trưng bày trước sau·báo cáo đỗ xe·báo cáo thu tiền·báo cáo giao hàng |
| Gắn vào | **Master cơ sở / master điểm trung chuyển (kho)**. Không sao chép vào dữ liệu giao hàng | **1 dữ liệu giao hàng** (số nhánh là hàng khác nên giữ riêng) |
| Ai sửa | Thay thế ở phía master. **Không thay thế chỉ cho chuyến giao này** | Vận hành·tài xế thêm theo từng chuyến giao |
| Khi đã giao | Là phía master nên không liên quan đến việc khóa chuyến giao | **Thêm·thay thế được** (bảng trên) |
| Phạm vi công khai | Chia bằng `audience` giữa dành cho đơn vị ủy thác / dành cho khách (REQ-DL-315) | Như bên trái |

**Không đặt thực thể tài liệu vào bảng tuyến giao hàng.** Cột là **"Đường vào"**, chỉ hiển thị **số lượng tài liệu của địa điểm đó và lối dẫn đến tab "Tài liệu đính kèm"** (ví dụ: `Tài liệu 2 ›`, nếu không có thì `—`). Vì mỗi địa điểm gắn nhiều file nên nếu xếp trong ô của bảng thì không đọc được. Không dùng tên cột "Đường vào·Tài liệu đính kèm" của bản cũ vì trông như cùng thứ với tab "Tài liệu đính kèm" trên cùng màn hình.

**Ảnh hưởng đến thanh toán·thực tích (quyết định 2026/09/13)**

Thanh toán **dựa trên thực tích giao hàng**, tính số lượng đó vào **tháng dương lịch của ngày thực tế giao**. Cha con (số nhánh) là cách gộp phiếu, không quyết định việc số tiền thuộc về tháng nào. Dù giao từng phần vắt qua tháng thì mỗi phần vào tháng của ngày giao tương ứng, số còn lại không giao được thì không thanh toán. Chi tiết xem §4D-1.

### 4A-4D. Chỉ định riêng ngày (chi tiết dữ liệu giao hàng·bổ sung 2026/09/17)
### 4A-4D. Chỉ định ngày riêng lẻ (Chi tiết dữ liệu giao hàng, bổ sung 17/09/2026)

Việc đổi ngày trên màn hình lịch trình sẽ di chuyển ngày picking và ngày giao hàng **cùng nhau, giữ nguyên lead time** (§5.0). **Trường hợp muốn thay đổi lead time và quyết định ngày picking và ngày giao hàng riêng biệt** (ví dụ: dồn riêng ngày picking lên trước 1 ngày vì kiểm kê kho, hoặc lùi riêng ngày giao hàng 1 ngày theo lịch của cơ sở) thì thực hiện bằng **"Chỉ định ngày riêng lẻ" trong Chi tiết dữ liệu giao hàng (màn hình 06)**. Đặt lối vào duy nhất ở đây để tránh việc đổi hàng loạt trên lịch trình vô tình làm hỏng lead time.

**Lối vào và điều kiện sử dụng**

| Mục | Nội dung |
|---|---|
| Lối vào | Nút "Chỉ định ngày riêng lẻ" ở phần header của Chi tiết dữ liệu giao hàng (cạnh "Đổi ngày"). **Dùng được cả ở chế độ dự kiến (draft)** |
| Điều kiện không dùng được | Đã chỉ thị xuất hàng (`locked`) / đã giao hàng. Nút bị vô hiệu hóa, lý do hiển thị qua tooltip |
| **Sau hạn chốt đơn** | **Không dùng được.** Nút bị vô hiệu hóa, lý do hiển thị qua tooltip. Khi đổi ngày thì dùng **hủy + nhân bản** (quyết định đợt 3 ngày 22/09/2026, §4A-5). **(Cũ: chỉ Vận hành mới dùng được từng bản ghi một trước `locked`, bắt buộc có lý do, chỉ với bản ghi cần xác nhận 〈đợt 2 ngày 21/09/2026〉 / cũ hơn nữa: ở chu kỳ sau hạn chốt đơn thì không dùng được)** |
| Đối tượng | Chỉ 1 dữ liệu giao hàng đó. Không di chuyển các bản ghi lạnh / đông lạnh khác trong cùng ngày |

**Nhập liệu và kiểm tra**

| Ô | Nhập | Điều kiện không lưu được (hiển thị lý do bên dưới ô) |
|---|---|---|
| Ngày xuất hàng (ngày picking) | Ngày | Ngày quá khứ (dữ liệu giao hàng cũng không được đặt vào ngày hôm nay trở về trước) / ngày không xuất hàng được (ngày nghỉ của kho・khung không khả dụng) / tạm dừng chu kỳ / sau ngày giao hàng / lead time vượt quá 7 ngày |
| Ngày giao hàng | Ngày | Ngày quá khứ / không nhận hàng được (thứ) / ngày được coi là ngày lễ giao hàng / tạm dừng chu kỳ / chu kỳ khác |
| Lead time | Tự động tính (ngày giao hàng − ngày picking). Khi khác giá trị của hợp đồng thì hiển thị "Khác với lead time của hợp đồng (N ngày)" | — |
| Lý do | Chọn (yêu cầu của doanh nghiệp / đơn đề nghị thay đổi của doanh nghiệp / lý do của kho / lý do của công ty vận chuyển / khác) + ghi chú bổ sung. **Trước hạn chốt là tùy chọn** (#26) | Không có điều kiện chặn việc lưu. **Sau hạn chốt không dùng "Chỉ định ngày riêng lẻ"** (đổi ngày sau hạn chốt thực hiện từng bản ghi từ "Chỉnh sửa" trong Chi tiết dữ liệu giao hàng, bắt buộc có lý do, quyết định v2.3 #63) (thay đổi ngày 29/09/2026. Cũ: sau hạn chốt không dùng được màn hình này nên cũng không kiểm soát bằng lý do 〈quyết định đợt 3 ngày 22/09/2026〉) |

**Khi lưu**

- Chỉ phản ánh vào **dữ liệu giao hàng này**, giữ dưới dạng override đã phê duyệt với `override_type = fix` (§4A-4). Hiển thị là **Đã điều chỉnh**. Không thay đổi lead time của hợp đồng. Lead time riêng được giữ trong **`deliveries.lead_time`**, khi tính toán ưu tiên theo thứ tự **`deliveries.lead_time` > hợp đồng con > hợp đồng cha** (23/09/2026, §7).
- Lead time khác với hợp đồng **do `deliveries` giữ** (quyết định đợt 4 ngày 23/09/2026. Cũ: để chung trong `route_override` dưới dạng `lead`, nhưng do đã bỏ `route_override` nên chuyển sang). Tab tuyến giao hàng hiển thị "※ Chỉ riêng lần giao này có thay đổi (lead time)", có thể hủy bằng "Quay về cài đặt của hợp đồng".
- Lưu vào lịch sử thay đổi theo dạng `Ngày giao hàng A → B／Ngày picking C → D (lead time N ngày → M ngày)・lý do`.
- **Việc nhập lý do của "thay đổi chỉ một lần" là tùy chọn trước hạn chốt** (#26). **Cả đổi tuyến giao hàng lẫn chỉ định ngày riêng lẻ đều không bắt buộc lý do trước hạn chốt.** Để thao tác sửa từng bản ghi tại hiện trường không bị chặn bởi việc nhập lý do.
- **Sau hạn chốt đơn không dùng thao tác này (chỉ định ngày riêng lẻ)**. Từ sau hạn chốt đến trước ngày xuất hàng 1 ngày thì sửa từng bản ghi từ "Chỉnh sửa" trong Chi tiết dữ liệu giao hàng (cùng nửa đầu / nửa sau, bắt buộc có lý do), từ đúng ngày xuất hàng trở đi thì **hủy + nhân bản** (thay đổi ngày 29/09/2026 〔quyết định v2.3 #63〕. Cũ: sau hạn chốt không thực hiện được chính thao tác này, hủy + nhân bản 〈quyết định đợt 3 ngày 22/09/2026〉). **(Cũ: chỉ Vận hành mới được thực hiện từng bản ghi trước `locked`, bắt buộc có lý do, chỉ với bản ghi cần xác nhận 〈đợt 2 ngày 21/09/2026〉 / cũ hơn nữa: đợt 1 #26 "chỉ định ngày riêng lẻ cũng có lý do là tùy chọn")**
- **Tuy nhiên, lịch sử thay đổi luôn phải lưu trước thay đổi → sau thay đổi và người thao tác** (kể cả khi lý do trống vẫn lưu). Đảm bảo luôn truy vết được "ai đã đổi gì thành gì, khi nào" mà không có ngoại lệ.
- Các thao tác **di chuyển hàng loạt** như đổi hàng loạt・hủy・dừng・nhân bản・hủy override **vẫn bắt buộc lý do như trước** (§11-2・§1.5). Chỉ việc thay đổi riêng 1 bản ghi "chỉ riêng lần giao này" mới là tùy chọn.
- **Từ sau đó, khi di chuyển dữ liệu giao hàng này trên màn hình lịch trình, giữ nguyên lead time đã chỉ định riêng** (§5.0).
- Kể cả khi chỉ định ở chế độ dự kiến, khi tạo xác định vẫn chuyển nguyên sang dữ liệu giao hàng (đưa vào cùng cơ chế override như đơn đề nghị của doanh nghiệp, chỉ khác là bên yêu cầu là `Vận hành`).

**Quan hệ với §4A-5B (khi thay đổi ngày không xuất hàng được giữa chừng)**

- Việc tự động dời lên trước của §4A-5B là **hệ thống chỉ di chuyển ngày picking để tránh ngày không xuất hàng được**, không phải "Chỉ định ngày riêng lẻ". **Lead time được coi như giữ nguyên giá trị của hợp đồng**.
- Do đó, khi di chuyển dữ liệu giao hàng đã được tự động dời lên trước trên lịch trình, sẽ tính lại bằng lead time của hợp đồng, nếu trúng ngày không xuất hàng được thì lại dời lên trước.
- Chỉ dùng "Chỉ định ngày riêng lẻ" khi Vận hành chủ ý muốn đổi lead time.

**Người được thao tác**

- **Chỉ quản trị viên vận hành.** **Vai trò `Quản trị viên kho` không tồn tại** (đã xóa hoàn toàn theo quyết định đợt 2 ngày 21/09/2026, §11-3) nên "Chỉ định ngày riêng lẻ" cũng là thao tác của quản trị viên vận hành. Mọi thao tác của kho đều do Vận hành (logistics) thực hiện.

### 4A-4E. Khả năng thực hiện sau khi phê duyệt (quyết định 18/09/2026)

Việc "Đã điều chỉnh" là cam kết rằng **hệ thống không di chuyển bằng tính toán tự động**, chứ không có nghĩa là tiền đề đã thành lập tại thời điểm phê duyệt sẽ không bị sụp đổ về sau (§3.4). Nguyên nhân sụp đổ không chỉ là thay đổi cài đặt chu kỳ.

#### Kiểm tra lại hằng ngày

Thêm vào batch hằng ngày (§4A-2) việc kiểm tra lại override đang áp dụng. Mỗi ngày chạy lại các kiểm tra trước phê duyệt 1〜6 ở §3.4, ghi kết quả vào `Thời điểm kiểm tra gần nhất`.

| Nội dung kiểm tra | Nơi hiển thị khi bị sụp đổ |
|---|---|
| Các kiểm tra trước phê duyệt 1〜6 có tiếp tục thành lập không | Cần xác nhận "Ngày đã phê duyệt không còn thành lập vì ◯◯" |
| Số lượng picking trong ngày có vượt giới hạn không | Cần xác nhận (theo ngày vượt) |
| **Đến ngày trước ngày giao hàng** mà không có tài xế ở chặng sẽ được phân công (§4B-1) | Cần xác nhận `assignment_missing` (dùng chung với cảnh báo tài xế chưa được phân công, §4B-4). (Cũ: còn dưới 1 tuần trước ngày giao hàng mà tài xế chưa được phân công. Thay thế 29/09/2026 〔quyết định v2.3 #43〕) |

#### Khi số lượng vượt quá, di chuyển ai

Việc bảo vệ bản ghi đã điều chỉnh khiến các bản ghi khác bị tràn, hay việc di chuyển chính bản ghi đã điều chỉnh, đều là phán đoán của Vận hành, nên quy định trước thứ tự.

| Thứ tự ưu tiên | Đối tượng di chuyển |
|---|---|
| 1 | `draft` (không có override) — là đối tượng tự động dời lên trước・điều chỉnh |
| 2 | `published` (không có override) — hiển thị ở cần xác nhận để Vận hành đổi hàng loạt |
| 3 | **Đã điều chỉnh — sau cùng. Nếu di chuyển thì nhất định phải thỏa thuận lại với doanh nghiệp** |

#### Thủ tục khi xác định không thể đáp ứng

```
Đã điều chỉnh (đã phê duyệt)
   │  Vận hành phán đoán "ngày này không thể đáp ứng" (bắt buộc lý do)
   ▼
Đang đề xuất (Vận hành đưa ra ngày thay thế)
   ├─ Doanh nghiệp chấp nhận → Đã điều chỉnh (thay override bằng ngày mới)
   ├─ Doanh nghiệp từ chối   → Vẫn ở trạng thái Đang đề xuất, điều chỉnh với Vận hành
   └─ Không trả lời đến hạn  → Vận hành quyết định, kèm lý do để thành Đã điều chỉnh (bắt buộc liên lạc)
```

| Thời điểm sụp đổ | Biện pháp có thể thực hiện |
|---|---|
| Trước khi tạo xác định (dự kiến) | Chuyển sang Đang đề xuất và thỏa thuận lại. Số lượng và thanh toán chưa chuyển động nên ảnh hưởng chỉ là ngày |
| Sau khi tạo xác định・trước chỉ thị xuất hàng (chờ xuất hàng) | Như trên. Vì số lượng đã xác định nên cũng đưa giao từng phần・chuyến riêng vào lựa chọn |
| Sau chỉ thị xuất hàng (đã xuất hàng・đã nhận hàng) | Xử lý sự cố ở §4A-4B. Liên lạc điện thoại rồi hủy + nhân bản (chuyến thay thế), hoặc chờ giao lại |
| Trong ngày | Vận hành (logistics) trực tiếp xử lý bản ghi cha (đã xuất hàng・đã nhận hàng → chờ giao lại／đã giao một phần／dừng／đã nhận hàng, §4A-3B・〔quyết định v2.3 #21〕). **(Cũ: đang xác nhận → chờ giao lại／đã giao một phần／dừng. Bỏ ngày 24/09/2026)** |

#### Ngoại lệ về thông báo

Nguyên tắc của §4A-5 là "cần xác nhận chỉ hiển thị trên màn hình Vận hành, không thông báo cho doanh nghiệp", nhưng **chỉ khi Vận hành thực sự di chuyển ngày đã điều chỉnh, và khi override hết hiệu lực**, thì để lại kèm lý do trong lịch sử đơn đề nghị của doanh nghiệp và lịch của doanh nghiệp (push・email vẫn không gửi như trước). Vì nếu ngày đã phê duyệt bị đổi một cách âm thầm thì chính cơ chế đơn đề nghị thay đổi sẽ không còn được tin cậy.

### 4A-5. Quy tắc tính lại

| Đối tượng | Khi có thay đổi cài đặt (ngày lễ・tạm dừng・khung không khả dụng・lead time, v.v.) tác động |
|---|---|
| `draft` (không có override) | Tạo lại. Hiển thị trên màn hình doanh nghiệp cũng tự động cập nhật |
| `draft` (có override) | Tạo lại rồi áp dụng lại override. Nếu không áp dụng được thì hết hiệu lực hoặc chuyển sang Đang đề xuất (§4A-4) |
| `published` | Không tạo lại. **Hiển thị ở cảnh báo "Cần xác nhận" của màn hình lịch trình Vận hành** và xử lý bằng đổi hàng loạt |
| `locked` | Ngoài đối tượng |

**Thông báo tự động về hạn sử dụng ngắn (29/09/2026〔quyết định v2.3 #35〕)**: mỗi lần tạo・tính lại lịch dự kiến (khi lead time kéo dài do chuyển ngày), đổi kho, nhân bản, thì lịch dự kiến・dữ liệu giao hàng có chứa sản phẩm thuộc trường hợp **số ngày từ ngày xuất hàng đến ngày giao hàng > số ngày hạn sử dụng của sản phẩm (`products.shelf_life_days`) − số ngày an toàn** sẽ được hiển thị ở Cần xác nhận **`shelf_life_warning`**. Số ngày an toàn là cài đặt vận hành chung toàn công ty `shelf_life_safety_days` (mặc định **2 ngày**). **Việc có chia tách hay không vẫn do Vận hành quyết định như trước, không tự động chia tách** (REQ-DL-624).

Cảnh báo "Cần xác nhận" hiển thị doanh nghiệp・cơ sở・ngày giao hàng・lý do thay đổi (ví dụ: đã thêm ngày được coi là ngày lễ giao hàng) liên quan, và cho phép chuyển từ đó sang đổi hàng loạt.

**Nơi thông báo (quyết định 12/09/2026)**: Cần xác nhận **chỉ hiển thị trong cảnh báo của màn hình lịch trình Vận hành**. Không gửi push hay email cho doanh nghiệp.

**Thực thể là bảng `review_items`** (quyết định đợt 4 ngày 23/09/2026, §7). Trước đây "Cần xác nhận" chỉ được gọi bằng tên và mỗi lần hiển thị đều tính bằng biểu thức điều kiện, nên **không có chỗ để Vận hành "đóng" các mục đã xử lý xong**. Bảng này có `status(open｜resolved｜ignored)` và `resolved_by` / `resolved_at` / `resolution_note`, đặt **`UNIQUE(kind, target_type, target_id) WHERE status = 'open'`**. **Batch phát hiện (§11-1) chỉ thực hiện UPSERT**, khi phát hiện lại cùng vấn đề thì chỉ cập nhật `last_detected_at` (không dồn các mục giống nhau). **Badge số lượng và danh sách cùng đếm từ bảng này** nên hai bên không lệch nhau.

**Khi ngày lễ・ngày không xuất hàng được tăng thêm sau hạn chốt đơn (quyết định 19/09/2026・chốt điều kiện ở đợt 2 ngày 21/09/2026)**

Chính sách đổi ngày được quyết định theo hai giai đoạn: **trước hay sau hạn chốt đơn** (quyết định đợt 3 ngày 22/09/2026).

| Giai đoạn | Có thể làm | Nhập lý do | Đối tượng |
|---|---|---|---|
| **Trước hạn chốt đơn** | Vận hành đổi được **cả từng bản ghi lẫn hàng loạt** | **Tùy chọn** (§4A-4D・#26) | Không giới hạn |
| **Sau hạn chốt đơn** | **Không đổi ngày.** Xử lý bằng hủy + nhân bản (§4A-4B・§4A-4C) | Lý do hủy・nhân bản là bắt buộc | — |

- **Ranh giới chỉ có một: "hạn chốt đơn"** (quyết định đợt 3 ngày 22/09/2026). Một đường duy nhất: thời điểm số lượng được xác định thì ngày giao hàng cũng được cố định.
- **`locked` không phải là mốc đổi ngày.** `locked` (gửi chỉ thị xuất hàng lần đầu thành công) chỉ còn là mốc của chỉ thị xuất hàng, việc có đổi ngày được hay không được xác định bằng **đã qua hạn chốt đơn hay chưa** (§7・REQ-DL-886).
- Phần tăng thêm do ngày lễ hay ngày nghỉ của kho sau hạn chốt thì **nếu trước ngày xuất hàng 1 ngày thì sửa từng bản ghi từ "Chỉnh sửa" trong Chi tiết dữ liệu giao hàng**. Không di chuyển được từ màn hình lịch trình (§5.0・§4A-4D) (thay đổi 29/09/2026 〔quyết định v2.3 #63〕. Cũ: tạo lại bằng hủy + nhân bản. Cũng không di chuyển được từ Chi tiết dữ liệu giao hàng).
- **(Cũ: 3 giai đoạn: trước hạn chốt／sau hạn chốt・trước `locked`／sau `locked`. Sau hạn chốt・trước `locked` cho phép ngoại lệ "chỉ Vận hành, từng bản ghi, bắt buộc có lý do, chỉ với bản ghi cần xác nhận". Đã hủy ở quyết định đợt 3 ngày 22/09/2026)**
- Với việc sửa đổi này, vấn đề **"khi có quá nhiều thay đổi sau hạn chốt do kỳ nghỉ dài thì Vận hành không xử lý xuể"** (mục chưa quyết ở §8 cũ) đã được **giải quyết**. Kỳ nghỉ dài vẫn tiếp tục đăng ký là tạm dừng chu kỳ, trước tiên xem xét vận hành dồn chuyển sang sau kỳ nghỉ (§2.2).

### 4A-5B. Khi thay đổi ngày không xuất hàng được giữa chừng (chốt 14/09/2026)

Cách xử lý khi **thêm・đổi sau** khung không xuất hàng được hoặc ngày không khả dụng theo từng ngày. Cài đặt thực hiện ở tab kho của cài đặt chu kỳ giao hàng (màn hình 01).

**Chuyển cả ngày picking và ngày giao hàng** (quyết định 21/09/2026. Cũ: "chỉ có hiệu lực với ngày picking. Không di chuyển ngày giao hàng" đã hủy). Ngày không xuất hàng được cũng **được đưa vào đối tượng chuyển của ngày giao hàng**.

```
① Trước hết chỉ dời ngày picking lên trước, xem có vừa với chênh lệch lead time hợp đồng = 0 không (§4.4 ①)
     Trước thay đổi: Picking 8/19 → Giao hàng 8/21
     Sau thay đổi:   Picking 8/18 → Giao hàng 8/21   ← nếu vừa với chênh lệch 0 thì kết thúc ở đây

② Nếu không vừa với chênh lệch 0 thì di chuyển ngày giao hàng theo "dời lên trước・lùi về sau" của hợp đồng,
   chuyển cả ngày picking và ngày giao hàng (§4.4 ②③)
     Sau thay đổi:   Picking 8/18 → Giao hàng 8/20   ← ngày giao hàng cũng di chuyển
```

> **Lý do thay đổi (21/09/2026)**: khi có giao hàng ngay sau khung không xuất hàng được liên tiếp của kho, nếu chỉ dời ngày picking lên trước thì lead time thực tế kéo dài thành 4〜6 ngày và sản phẩm có hạn sử dụng ngắn không thành lập được. Thống nhất cách xử lý với 2 giai đoạn của §4.4 (chênh lệch 0 → bất đắc dĩ +1 ngày → cần xác nhận), bỏ cách hiểu "chỉ picking dừng".

| Trạng thái | Cách xử lý |
|---|---|
| `draft` (không có override) | **Tự động dời lên trước**. Hiển thị lịch của doanh nghiệp cũng tự động cập nhật |
| `draft` (có override・đã điều chỉnh) | Trước tiên chỉ dời ngày picking lên trước. Nếu không vừa với chênh lệch 0 và cần di chuyển cả ngày giao hàng thì không tự động di chuyển mà chuyển sang **Đang đề xuất** (§4A-4E). Vì đây là ngày đã thỏa thuận với doanh nghiệp (sửa đổi 21/09/2026) |
| `published` | **Không di chuyển.** Hiển thị ở "Cần xác nhận", Vận hành xử lý bằng đổi hàng loạt |
| `locked` | **Ngoài đối tượng.** Vì đã ra chỉ thị xuất hàng nên xử lý bằng liên lạc điện thoại + hủy, hoặc nhân bản (§4A-4B) |

- Trường hợp không dời lên trước được (ngày trước đó cũng không khả dụng, lead time kéo dài quá mức, v.v.) thì không tự động di chuyển mà hiển thị ở **Cần xác nhận với nội dung "Không thể tạo lịch dự kiến"**.
- **Xem trước số bản ghi bị ảnh hưởng trước khi lưu.** Chi tiết như sau. Đặc biệt việc cho xem trước **số lượng locked** trước khi lưu sẽ ngăn tình huống "tưởng là kiểm kê tuần sau nhưng lại trúng phần của tuần này".

```
Nếu tạo lại bằng cài đặt này:
  Đã phản ánh làm ràng buộc (không ảnh hưởng)        Ngày cơ sở không nhận hàng được  18 bản ghi
  Lịch dự kiến sẽ tự động tạo lại                    412 bản ghi
  Tự động dời ngày picking lên trước                  18 bản ghi
  ── Đã thỏa thuận với doanh nghiệp (override đã phê duyệt)  7 bản ghi
       Có thể áp dụng nguyên trạng                           4 bản ghi
       Hết hiệu lực vì không còn giao hàng tương ứng         2 bản ghi   ← thông báo cho doanh nghiệp qua lịch sử
       Cần đề xuất ngày thay thế (chuyển sang Đang đề xuất)  1 bản ghi
  Đã chỉ thị xuất hàng・không thể thay đổi            36 bản ghi
  Không thể dời lên trước (không thể tạo lịch dự kiến)  3 bản ghi
```

- **Khi có từ 1 bản ghi hết hiệu lực・chuyển sang Đang đề xuất trở lên, đổi nút lưu thành "Xác nhận và lưu", bắt buộc tích vào ô "Đã xác nhận ◯ bản ghi đã thỏa thuận với doanh nghiệp sẽ hết hiệu lực・phải đề xuất lại".** Bản thân việc lưu không bị chặn (vì không thể di chuyển được việc kiểm tra thiết bị hay kho nghỉ).
- **Thay đổi ngày đầu chu kỳ và tạo lại kỳ đối tượng cài đặt có ảnh hưởng toàn bộ kỳ.** Với hai thao tác này, **toàn bộ** override đã phê duyệt của kỳ đó được đếm là đối tượng re-anchor, cảnh báo ở khung riêng khác với tạm dừng・thêm ngày lễ thông thường.
- **Hiển thị phòng ngừa.** Tại thời điểm chọn ngày trên màn hình đăng ký tạm dừng・ngày được coi là ngày lễ, nếu ngày đó có override đã phê duyệt thì hiển thị biểu tượng khóa và "Đã điều chỉnh ◯ bản ghi" trên ô lịch. Chỉ xem trước ngay trước khi lưu thì quá muộn để quyết định cấu hình lại cài đặt.
- **Dù hủy ngày không khả dụng cũng không tự động đưa lịch dự kiến đã dời lên trước trở lại.** `draft` là đối tượng tạo lại nên kết quả là trở về như cũ, còn `published` thì không đưa về (vì tự ý đưa trở lại ngày mà kho và doanh nghiệp đều đã biết sẽ gây rối hơn). Nếu muốn đưa về thì Vận hành di chuyển bằng đổi hàng loạt.
- **Không cho đăng ký ngày quá khứ.** Trong tháng hiện tại, khả năng cao sẽ trúng `locked` nên khi đăng ký sẽ cảnh báo "Có chứa phần của tuần này".
- Thay đổi khung không xuất hàng được có hiệu lực với **toàn bộ kỳ đối tượng cài đặt**, nhưng **tháng đã xác định thì ngoài đối tượng** (không chỉnh sửa được). Xem trước số bản ghi bị ảnh hưởng cũng đếm trong phạm vi đã loại trừ tháng đã xác định.

### 4A-6. Thay đổi・tạm dừng・hủy hợp đồng (sửa đổi toàn diện 18/09/2026)

#### Tháng áp dụng được quyết định theo kỳ đặt hàng

Các đơn đăng ký liên quan đến hợp đồng (thay đổi nội dung・tạm dừng・hủy・tiếp tục lại) được xử lý **theo cùng chu kỳ với kỳ đặt hàng**.

| Thời điểm đăng ký | Giao hàng được phản ánh |
|---|---|
| Trong kỳ đặt hàng (từ công bố menu＝bắt đầu đặt hàng đến hạn chốt đơn) | Từ chu kỳ **tháng sau** |
| Sau hạn chốt đơn | Từ chu kỳ **tháng sau nữa** |

- **Không thay đổi nội dung của chu kỳ đã xác định số lượng về sau.**
- Chỉ thị xuất hàng được ra **gộp 2 tuần, trước ngày bắt đầu của 2 tuần đó 3 ngày (thứ Sáu)** (xác nhận 21/09/2026. Cũ: ngày trước ngày picking) nên **chắc chắn sau hạn chốt đơn**. Do đó thay đổi hợp đồng về mặt cấu trúc không xảy ra với dữ liệu giao hàng `locked`. **Không hủy chỉ thị xuất hàng đã ra vì thay đổi hợp đồng.**
- Trường hợp cần xử lý riêng trước tháng được phản ánh như chuyển nhà thì không xử lý ở phía hợp đồng. Vận hành xử lý bằng **thay đổi "chỉ riêng lần giao này" trong Chi tiết dữ liệu giao hàng** (thay đổi tuyến giao hàng riêng・chỉ định ngày riêng lẻ), không di chuyển tháng áp dụng của hợp đồng.
- Ngày cơ sở không nhận hàng được (§3.1C) cũng xử lý tương tự. Khi ngày nghỉ của cơ sở trúng chu kỳ đã qua hạn chốt thì xử lý riêng ở phía dữ liệu giao hàng chứ không phải hợp đồng (bao gồm dừng・nhân bản).

#### Ma trận ảnh hưởng

Với dữ liệu giao hàng của chu kỳ được phản ánh, nếu đăng ký trong kỳ đặt hàng thì **đã được tạo (chưa xác định số lượng)**, nếu sau hạn chốt thì **chưa có** (sẽ được tạo sau từ lịch dự kiến sau cập nhật).

| Loại thay đổi | Lịch dự kiến `draft` | Dữ liệu giao hàng của chu kỳ được phản ánh `published` | Đã chỉ thị xuất hàng `locked` | Hợp đồng con |
|---|---|---|---|---|
| **Đổi địa chỉ nơi giao hàng** (khu vực thay đổi) | Tạo lại. Tính ngược theo kho・tuyến mới (quy tắc chênh lệch 1 ngày) | Thay thế kho・tuyến・ngày picking・**snapshot địa chỉ** (cần xác nhận → đổi hàng loạt). **Việc áp dụng địa chỉ mới cho dữ liệu giao hàng đã tạo từ đâu thì Vận hành chọn ngày chuẩn bằng "Cập nhật từ ngày này trở đi"** (quyết định 19/09/2026. Không tự động ghi đè toàn bộ) | Ngoài đối tượng (không xảy ra) | Tạo lại snapshot chưa thanh toán |
| **Thêm loại hình giao hàng** (thêm đông lạnh, v.v.) | Tạo lại (tăng bản ghi) | **Tạo thêm** dữ liệu giao hàng của loại hình đó và phân bổ lại số lượng | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| **Xóa loại hình giao hàng** (chỉ còn lạnh, v.v.) | Tạo lại (giảm bản ghi) | **Hủy** dữ liệu giao hàng của loại hình đó (bắt buộc lý do) + phân bổ lại số lượng | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| **Đổi kho・công ty vận chuyển・trung chuyển** | Tạo lại | Thay thế tuyến và ngày picking (cần xác nhận → đổi hàng loạt) | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| **Đổi lead time** | Tạo lại (quy tắc chênh lệch 1 ngày) | Tính lại ngày picking. Cái nào chênh lệch vượt quá 1 ngày thì cần xác nhận | Ngoài đối tượng | Không ảnh hưởng |
| **Đổi số lượng gói・số lần giao hàng** | Tạo lại (phân bổ và số slot thay đổi) | Phân bổ lại số lượng. Khi số lần giao hàng thay đổi thì bản ghi tăng giảm | Ngoài đối tượng | Tạo lại phần chưa thanh toán |
| **Đổi slot giao hàng** | Tạo lại | Thay thế ngày giao hàng・ngày picking (cần xác nhận → đổi hàng loạt) | Ngoài đối tượng | Không ảnh hưởng |
| **Thêm thứ không giao hàng được・ngày không nhận hàng được** | Tạo lại (tự động tránh) | Đưa các lần giao trúng vào cần xác nhận, Vận hành đổi hàng loạt | Ngoài đối tượng | Không ảnh hưởng |
| **Tạm dừng** | Xóa từ tháng áp dụng trở đi | Hủy từ chu kỳ áp dụng trở đi (Vận hành xác nhận) | Ngoài đối tượng | Hủy phần chưa thanh toán. **Không tạo trong thời gian tạm dừng** (cũng không tạo lịch dự kiến, xác nhận 19/09/2026) |
| **Hủy hợp đồng** | Xóa từ tháng áp dụng trở đi | Hủy từ chu kỳ áp dụng trở đi (Vận hành xác nhận) | Ngoài đối tượng | Hủy phần chưa thanh toán |
| **Tiếp tục lại sau tạm dừng** | Tạo từ tháng tiếp tục trở đi | Nếu tháng tiếp tục đang trong thời gian nhận đặt hàng thì **đuổi theo và tạo xác định** (catch-up) | — | Tiếp tục tạo từ tháng tiếp tục |

#### Cách xử lý ngày hủy hợp đồng・trong thời gian tạm dừng (quyết định 19/09/2026)

| Điều đã quyết | Nội dung |
|---|---|
| **Không thể hủy hợp đồng của chu kỳ đã chốt đơn** | Vì số lượng đã xác định và chuyển sang chỉ thị xuất hàng. Dù nhận đơn hủy, **chu kỳ đó vẫn thực hiện đến cùng** |
| **Ngày hủy hợp đồng chắc chắn là cuối chu kỳ** | Không kết thúc giữa tháng dương lịch hay giữa tuần. **Ngày cuối cùng của chu kỳ ngay trước chu kỳ được phản ánh** do thời điểm đăng ký quyết định (trong kỳ đặt hàng là tháng sau, sau hạn chốt là tháng sau nữa) trở thành ngày hủy hợp đồng |
| **Trong thời gian tạm dừng không tạo lịch dự kiến phía sau** | Tại thời điểm vào tạm dừng, xóa lịch dự kiến・dữ liệu giao hàng từ chu kỳ áp dụng trở đi, **và cũng không tạo phần phía sau đó**. Dù tạm dừng dài thì lịch dự kiến cũng không chất đống |
| **Tiếp tục lại thì tạo lại tại thời điểm phê duyệt** | Khi phê duyệt đơn tiếp tục lại, **tạo ngay lúc đó** lịch dự kiến từ tháng tiếp tục trở đi. Không khôi phục lịch dự kiến đã tạo trước khi tạm dừng (vì cài đặt chu kỳ có thể đã thay đổi) |

- Nếu tháng tiếp tục đang trong thời gian nhận đặt hàng thì sau khi tạo lịch dự kiến sẽ **đuổi theo và tạo xác định (catch-up)** (mục "Tiếp tục lại sau tạm dừng" ở bảng trên).
- Override đã phê duyệt vẫn được giữ trong lúc tạm dừng và re-anchor khi tiếp tục lại (bảng dưới).

#### Cách xử lý override đã phê duyệt・ngày không nhận hàng được của cơ sở

| Diễn biến của hợp đồng | Override (§4A-4) | Ngày không nhận hàng được (§3.1C) |
|---|---|---|
| Thay đổi nội dung | Giữ nguyên hiệu lực. Tuy nhiên với thay đổi làm đổi ngày giao hàng (slot・địa chỉ・kho) thì đưa vào **đánh giá re-anchor** | Giữ nguyên hiệu lực |
| Tạm dừng | **Dừng**, khôi phục khi tiếp tục lại | Như bên trái |
| Hủy hợp đồng | **Hủy** (để lại trong lịch sử kèm lý do) | Hủy |

Tạm dừng thì hợp đồng vẫn tiếp tục nên không xóa nội dung đã thỏa thuận. Hủy hợp đồng thì hợp đồng kết thúc nên hủy.

#### Các điểm khác

- Khoảng thời gian đã xóa cũng biến mất khỏi lịch của doanh nghiệp, và không thể gửi đơn đề nghị thay đổi trong khoảng thời gian đó. **Không thông báo cho doanh nghiệp** (quyết định 12/09/2026).
- Cách xử lý tháng cuối (như cộng vào hóa đơn cuối của hợp đồng trả sau) theo đặc tả phía hợp đồng.
- **Đổi gói** giữ nguyên ID hợp đồng và chồng thêm phiên bản sửa đổi. Hợp đồng con đã thanh toán không điều chỉnh, phản ánh bằng điều chỉnh từ tháng sau trở đi (§4A-2B).

### 4A-7. Cách hiển thị cho doanh nghiệp

- Lịch dự kiến (`draft`) **chỉ hiển thị ngày cho doanh nghiệp**. Vì đặt hàng được thực hiện vào tháng trước tháng giao hàng nên số lượng ở giai đoạn dự kiến chắc chắn chỉ là số ước tính, sẽ bị hiểu nhầm là giá trị xác định nên không hiển thị.
- **Đây chỉ là quy định về hiển thị "không cho xem", không có nghĩa là lịch dự kiến không có số lượng** (quyết định đợt 2 ngày 21/09/2026). `shipping_plans.estimated_qty` luôn tồn tại bên trong, dùng cho màn hình Vận hành, ước tính số lượng bản ghi, và xác định tự động bằng số lượng tiêu chuẩn (§4A-2D) (§4A-1・S1).
- Từ xác định (`published`) trở đi hiển thị số lượng・kết quả giao hàng・phiếu giao hàng・thu tiền.
- **Tên hiển thị trên Web doanh nghiệp được giữ riêng với trạng thái** (29/09/2026〔quyết định v2.3 #42〕). Không đổi tên trạng thái của Web Vận hành. Tên hiển thị được suy ra từ trạng thái・tình hình, không lưu.

| Trạng thái・tình hình phía Vận hành | Hiển thị trên Web doanh nghiệp |
|---|---|
| Hủy (có chuyến thay thế) | Đang điều chỉnh ngày giao hàng |
| Có báo cáo sự cố chưa giải quyết (trạng thái vẫn là đã xuất hàng, v.v.) | Giữ nguyên trạng thái + ghi chú "Đang xác nhận tình hình giao hàng" |
| Con (đang xác nhận) | Đang chuẩn bị giao lại |
| Đã giao một phần | Đã giao một phần |
| Chờ giao lại | Dự kiến giao lại |
| Hủy (không có chuyến thay thế)・dừng | Dừng giao hàng |

  (Cũ: hàng bị hủy trước khi xuất được hiển thị cho doanh nghiệp là "Đang xác nhận" 〈§4A-4B ①〉. Do trùng với tên trạng thái "Đang xác nhận" nên thay thế ngày 29/09/2026 〔quyết định v2.3 #42〕)
- **Lịch trên Web doanh nghiệp giữ dấu "Dự kiến"** (quyết định 21/09/2026・#77). Giải thích ý nghĩa ở chú giải. **Hiển thị theo tháng của Web Vận hành vẫn bỏ tag** (REQ-DL-828), chỉ Web doanh nghiệp là ngoại lệ. Vì doanh nghiệp không có cách nào khác để biết "ngày này chưa xác định".
- **Cho phép mở màn hình chi tiết cả ở dự kiến (draft)** (quyết định 12/09/2026). Vấn đề "không chuyển sang chi tiết được vì chưa có dữ liệu giao hàng" được giải quyết không phải bằng cách tách màn hình mà bằng **"chế độ dự kiến" của cùng màn hình chi tiết**.
  - Ở chế độ dự kiến, hiển thị các thông tin mà lịch dự kiến có (doanh nghiệp・cơ sở・nhiệt độ・ngày giao hàng・ngày picking・slot・kho・tuyến giao hàng・lý do chuyển ngày), còn **số vận đơn・kết quả giao hàng・thu tiền・tệp đính kèm thì ghi rõ "Nhập sau khi tạo xác định" và vô hiệu hóa**.
  - **Ô trạng thái là "—"** (lịch dự kiến không có trạng thái, §4A-3B). Thay vào đó hiển thị **trạng thái đơn đề nghị thay đổi** (có thể thay đổi／đang đề nghị／đang đề xuất／đã điều chỉnh／không thể thay đổi). **Trung chuyển cũng là "—"** (hiển thị tuyến nhưng chưa có tiến độ). Ngày ghi kèm "Chưa định" nếu chưa đăng ký menu, "Tạm dừng chu kỳ" nếu là tuần tạm dừng.
  - Ở chế độ dự kiến, vẫn thực hiện được từ màn hình này việc doanh nghiệp gửi đơn đề nghị thay đổi và Vận hành sửa ngày.
  - Khi tạo xác định, cùng màn hình đó trở thành chi tiết dữ liệu giao hàng nguyên trạng. Mã nhận diện trên màn hình được **chuyển từ ID dự kiến (PL-…) sang ID giao hàng (DL-…)**. Chuyển bằng ID dự kiến cũng phải giải quyết được sang dữ liệu giao hàng sau khi xác định. Lúc này **ô trạng thái từ "—" thành "Chờ xuất hàng"**.
  - Lối vào để mở chế độ dự kiến là **phía lịch trình** ("Chi tiết" ở hiển thị theo ngày, nhấp đúp vào dòng ở hiển thị theo tuần, màn hình xác nhận đơn đề nghị thay đổi). Xuất hàng・Quản lý giao hàng (danh sách) chỉ hiển thị dữ liệu giao hàng nên lịch dự kiến không xuất hiện.
  - Lịch dự kiến hay dữ liệu giao hàng được thể hiện bằng **dải (Dự kiến／Dữ liệu giao hàng) và tiêu đề màn hình**. Không đặt cột để phân biệt.
- Lịch trình **có thể hiển thị・lọc theo kho** (vì kho được phân bổ khác nhau theo từng cơ sở nên với danh sách xuyên các kho thì không đọc được lý do của ngày không khả dụng).

### Yêu cầu (cấu trúc hai tầng・quyết định 12/09/2026)

| ID yêu cầu | Phân loại yêu cầu | Nội dung yêu cầu | Trạng thái |
|---|---|---|---|
| REQ-DL-607 | Yêu cầu nghiệp vụ | Giữ lịch giao dự kiến (kế hoạch) và dữ liệu giao hàng (vận hành) ở hai tầng riêng, chỉ tính ngày ở lịch giao dự kiến | Đã quyết định |
| REQ-DL-608 | Yêu cầu chức năng | Khi cài đặt lần đầu, tạo lịch giao dự kiến cho kỳ cài đặt từ hợp đồng của tháng hiện tại, và batch hằng ngày tạo xác định lịch dự kiến của **chu kỳ đã qua ngày bắt đầu đặt hàng** sang dữ liệu giao hàng. **Không thực hiện tạo cuốn chiếu (tự động tạo thêm 1 chu kỳ ở cuối kỳ cài đặt)** (sửa đổi 19/09/2026・xác nhận 21/09/2026. REQ-DL-809) | Đã quyết định (sửa đổi 21/09/2026) |
| REQ-DL-609 | Yêu cầu chức năng | Doanh nghiệp có thể gửi đơn đề nghị thay đổi đến hết kỳ chu kỳ giao hàng đã tạo (tối đa 6 tháng tới), tháng chưa tạo thì ngoài đối tượng của cả hiển thị lẫn đơn đề nghị | Đã quyết định |
| REQ-DL-610 | Yêu cầu hiển thị | Giai đoạn dự kiến (draft) chỉ hiển thị ngày cho doanh nghiệp, số lượng・kết quả hiển thị sau khi tạo xác định | Đã quyết định |
| REQ-DL-611 | Yêu cầu tính toán・phán định | Kể cả ở giai đoạn dự kiến cũng gán kho・công ty vận chuyển được phân bổ của hợp đồng, dùng ngày không xuất hàng được・ngày không giao hàng ủy thác được・ngày không nhận hàng được để phán định ngày ứng viên. Lịch trình có thể hiển thị theo kho | Đã quyết định |
| REQ-DL-612 | Yêu cầu kiểm soát | Không làm mất nội dung thay đổi đã phê duyệt khi tính lại. Khi thay đổi cài đặt ảnh hưởng đến bản ghi đã xác định (published) thì không tự động thay đổi mà hiển thị cảnh báo "Cần xác nhận" | **Sửa đổi 18/09/2026** (cách lưu giữ từ cờ pinned sang override đã phê duyệt・REQ-DL-769) |
| REQ-DL-613 | Yêu cầu kiểm soát | Tại thời điểm đơn tạm dừng・hủy hợp đồng được phê duyệt, xóa lịch giao dự kiến chưa xác định từ tháng áp dụng trở đi (không thông báo cho doanh nghiệp) | Đã quyết định |
| REQ-DL-621 | Yêu cầu màn hình | Cả lịch dự kiến (draft) cũng mở được cùng màn hình với Chi tiết dữ liệu giao hàng ở "chế độ dự kiến". Các mục chưa xác định (số vận đơn・kết quả・thu tiền・tệp đính kèm) ghi rõ "Nhập sau khi tạo xác định" và vô hiệu hóa, khi tạo xác định thì chuyển ID dự kiến → ID giao hàng | Đã quyết định |
| REQ-DL-622 | Yêu cầu kiểm soát | Thực hiện tạo xác định lấy **ngày bắt đầu đặt hàng của chu kỳ** làm chuẩn. Không cố định theo ngày dương lịch mà tham chiếu ngày thực tế đã giữ theo từng chu kỳ. **Ngày hạn chốt đơn là điểm xác định số lượng**, không dùng làm trigger tạo bản ghi | Đã quyết định (sửa đổi 15/09/2026) |
| REQ-DL-740 | Yêu cầu dữ liệu | Các mốc (công bố menu・bắt đầu đặt hàng・hạn chốt đơn) **lấy phía menu làm chuẩn**, **khi tạo chu kỳ thì sao chép ngày thực tế, giữ ở chu kỳ và hiển thị trên màn hình** (sửa đổi 21/09/2026. Cũ: "không giữ ở phía chu kỳ giao hàng"). Kỳ đặt hàng là mục cài đặt của menu, phía chu kỳ giao hàng không tự tính riêng. Gắn menu của tháng chu kỳ (**tháng chứa khung thứ 14 `B7`**・sửa đổi đợt 2 ngày 21/09/2026. Không tạo nhánh ngoại lệ) làm mốc của chu kỳ tương ứng. Khi cài đặt không dùng hằng số ngày dương lịch | Đã quyết định (sửa đổi 21/09/2026) |
| REQ-DL-747 | Yêu cầu màn hình | Hiển thị kỳ đặt hàng là từ ngày 1 đến ngày 15 của tháng trước làm giá trị mặc định của demo・đặc tả (giá trị vận hành thực tế theo cài đặt phía menu) | Đã quyết định (15/09/2026) |
| REQ-DL-748 | Yêu cầu chức năng | Dữ liệu giao hàng của loại hình giao hàng "vật tư" ngoài đối tượng tạo xác định theo chu kỳ hằng tháng, tạo tại thời điểm có đơn đặt vật tư. Không có lịch giao dự kiến (draft), khi tạo thì là published | Đã quyết định (15/09/2026) |
| REQ-DL-745 | Yêu cầu nghiệp vụ | Không giữ hạn chốt thay đổi như một mốc độc lập, thời điểm kết thúc nhận đổi ngày trùng với hạn chốt đơn. Sau hạn chốt đơn thì không đổi ngày từ màn hình bất kể quyền hạn | Đã quyết định (15/09/2026) |
| REQ-DL-741 | Yêu cầu nghiệp vụ | 1 chu kỳ＝1 hợp đồng con, kể cả khi chu kỳ vắt qua tháng dương lịch cũng chứa vào hợp đồng con của tháng chu kỳ (**tháng chứa khung thứ 14 `B7`**・sửa đổi đợt 2 ngày 21/09/2026. Không tạo nhánh ngoại lệ). Phán định giá cố định của gói và giới hạn số lượng cung cấp hằng tháng của đơn đặt hàng theo tháng chu kỳ, còn giao từng phần・giao lại・giao đột xuất thì phán định theo tháng dương lịch của ngày giao hàng | Đã quyết định (15/09/2026) |
| REQ-DL-742 | Yêu cầu chức năng | Việc tạo hợp đồng con là trigger riêng với dữ liệu giao hàng, tạo trước theo lead time thanh toán (thanh toán tháng hiện tại／thanh toán trước 2 tháng／trả trước một lần 1 năm). Với 1 năm một lần thì tạo gộp 12 chu kỳ | Đã quyết định (15/09/2026) |
| REQ-DL-743 | Yêu cầu kiểm soát | Vào ngày xác định thanh toán, phát hiện hợp đồng có hiệu lực mà hợp đồng con không tồn tại trong tháng thanh toán đó và hiển thị ở "Cần xác nhận" (phát hiện sót thanh toán) | Đã quyết định (15/09/2026) |
| REQ-DL-744 | Yêu cầu chức năng | Xử lý tạo・xác định không khởi động theo ngày dương lịch mà theo cách hằng ngày nhặt phần chưa xử lý đã qua ngày chuẩn (catch-up), dùng khóa idempotent để chống tạo trùng | Đã quyết định (15/09/2026) |
| REQ-DL-623 | Yêu cầu hiển thị | Ngưỡng cảnh báo số lượng picking được đặt theo từng kho, màn hình 04・05 chuyển bằng tab kho và hiển thị số lượng・số ngày vượt theo từng kho. **Tab kho chỉ là lọc dữ liệu chứ không phải đơn vị phân quyền, không đặt vai trò `Quản trị viên kho`** (bổ sung đợt 2 ngày 21/09/2026) | Đã quyết định (bổ sung đợt 2 ngày 21/09/2026) |
| REQ-DL-624 | Yêu cầu nghiệp vụ | Việc chia tách phần có hạn sử dụng ngắn do Vận hành phán đoán, không do hệ thống tự động phán định. Hạn chốt nhận thay đổi theo hạn chốt của kỳ đặt hàng. **Lịch dự kiến・dữ liệu giao hàng có chứa sản phẩm thuộc trường hợp số ngày từ ngày xuất hàng đến ngày giao hàng > số ngày hạn sử dụng của sản phẩm (`products.shelf_life_days`) − số ngày an toàn (`shelf_life_safety_days`・mặc định 2 ngày) sẽ được phán định mỗi lần tạo・tính lại lịch dự kiến, đổi kho, nhân bản và hiển thị ở Cần xác nhận `shelf_life_warning` (không tự động chia tách)** (29/09/2026〔quyết định v2.3 #35〕) | Đã quyết định (bổ sung 29/09/2026) |
| REQ-DL-634 | Yêu cầu chức năng | Khi không thể giao hàng sau chỉ thị xuất hàng・trước khi xuất, hủy dữ liệu giao hàng kèm lý do và liên kết việc hủy chỉ thị xuất hàng sang Thomas. Chuyến thay thế được tạo thành dữ liệu giao hàng mới | Đề xuất yêu cầu |
| REQ-DL-635 | Yêu cầu chức năng | Sự cố trong lúc giao hàng được **ghi nhận là báo cáo sự cố mà không đổi trạng thái dữ liệu giao hàng**, Vận hành (logistics) chọn "giao lại／hàng thay thế／hủy bỏ／dừng" để trực tiếp giải quyết bản ghi cha (sửa đổi theo bổ sung 24/09/2026 〔quyết định v2.3 #20・#21〕. Cũ: coi là "đang xác nhận"). Giao lại được tạo thành bản ghi con gắn số nhánh vào số chỉ thị, không ghi đè bản ghi gốc | Đề xuất yêu cầu |
| REQ-DL-636 | Yêu cầu kiểm soát | Hủy・dừng・sắp xếp giao lại chỉ Vận hành (logistics) mới thực hiện được, bắt buộc nhập lý do và lưu vào lịch sử thay đổi. Tài xế・công ty vận chuyển ủy thác chỉ dừng ở báo cáo | Đề xuất yêu cầu |
| REQ-DL-637 | Yêu cầu hiển thị | Hiển thị dữ liệu giao hàng bị hủy・dừng・đang xác nhận, và báo cáo sự cố chưa giải quyết (bổ sung 24/09/2026) ở "Cần xác nhận" của lịch trình Vận hành để không có mục nào bị bỏ sót chưa xử lý | Đề xuất yêu cầu |
| REQ-DL-638 | Yêu cầu chức năng | Có thể **nhân bản** dữ liệu giao hàng. Nhân bản không ghi đè bản gốc mà tạo bản ghi con gắn số nhánh, xử lý giao lại・giao từng phần・chuyến thay thế bằng cùng một thao tác. Sao chép hợp đồng・cơ sở・loại hình giao hàng・tuyến・snapshot nơi giao hàng, còn ngày・số vận đơn・số lượng・kết quả thì quyết định mới. Cha con chỉ 1 tầng, số nhánh tối đa 9 | Đề xuất yêu cầu |
| REQ-DL-639 | Yêu cầu chức năng | Trường hợp giao từng phần, xác định bản ghi gốc là "đã giao một phần" theo số lượng giao thực tế, và có thể đặt số lượng còn lại và ngày giao sau cho bản ghi đã nhân bản. Có thể chỉ định số lượng còn lại theo từng sản phẩm | Đề xuất yêu cầu |
| REQ-DL-626 | Yêu cầu dữ liệu | Hợp đồng có danh sách loại hình giao hàng (nhiệt độ hoặc vật tư × kho × công ty vận chuyển 〈chặng 1・trung chuyển・chặng 2〉), tạo lịch giao dự kiến・dữ liệu giao hàng theo chi tiết giao hàng × loại hình giao hàng | Đã quyết định |
| REQ-DL-627 | Yêu cầu dữ liệu | **Không giữ lead time ở master kho**, giữ **theo từng loại hình giao hàng của hợp đồng (lạnh／đông lạnh／vật tư), 0〜7 ngày**. Không tự động điền giá trị mặc định | **Đã quyết định (sửa đổi 21/09/2026)**. Cũ: lấy lead time theo kho làm giá trị mặc định |
| REQ-DL-628 | Yêu cầu dữ liệu | Quản lý khung không xuất hàng được・ngày không khả dụng theo từng ngày・ngưỡng số lượng ở master kho, màn hình cài đặt chu kỳ giao hàng là view tham chiếu・chỉnh sửa chúng | Đã quyết định |
| REQ-DL-629 | Yêu cầu kiểm soát | **Không có kho thay thế**. Dù kho được phân bổ không xuất hàng được cũng không tự động chuyển sang kho khác mà để "Cần xác nhận" cho Vận hành phán đoán | Đã quyết định (sửa đổi 13/09/2026) |
| REQ-DL-630 | Yêu cầu kiểm soát | Việc đổi kho của hợp đồng phản ánh từ tháng áp dụng, không thay đổi lịch dự kiến・dữ liệu giao hàng trước tháng áp dụng | Đã quyết định |
| REQ-DL-631 | Yêu cầu liên kết dữ liệu | Xuất CSV chỉ thị xuất hàng sang Thomas theo từng kho | Đã quyết định |
| REQ-DL-749 | Yêu cầu kiểm soát | Khi đổi ngày trên màn hình lịch trình (dù là giao hàng hay picking), giữ lead time và di chuyển cả ngày còn lại. Khi di chuyển ngày giao hàng thì ngày picking nếu là ngày không xuất hàng được thì dời lên trước, khi di chuyển ngày picking mà ngày giao hàng trúng ngày không nhận hàng được・ngày được coi là ngày lễ giao hàng・tạm dừng chu kỳ・chu kỳ khác thì không cho chọn ứng viên đó. Ở ứng viên đích hiển thị ngày còn lại và lý do không khả dụng | Đã quyết định (17/09/2026) |
| REQ-DL-750 | Yêu cầu chức năng | Thao tác đổi lead time và chỉ định riêng ngày picking・ngày giao hàng chỉ được cung cấp bằng "Chỉ định ngày riêng lẻ" trong màn hình Chi tiết dữ liệu giao hàng (bao gồm chế độ dự kiến). Chỉ phản ánh và cố định cho dữ liệu giao hàng này, bắt buộc lý do và lưu vào lịch sử thay đổi. Từ sau đó, các lần đổi ngày trên lịch trình giữ nguyên lead time đã chỉ định riêng | Đã quyết định (17/09/2026) |

---

## 4B. Cài đặt・phân công tài xế và ứng dụng tài xế (⑤)

Là giai đoạn quyết định **ai sẽ vận chuyển** sau khi ngày của dữ liệu giao hàng đã xác định. Vì không đụng đến ngày nên có thể làm việc cả sau `locked`, và bản ghi con đã nhân bản cũng cần được phân công.

### 4B-1. Đơn vị phân công

- Đối tượng phân công là **1 dữ liệu giao hàng** (1 chi tiết giao hàng × 1 loại hình giao hàng). Cùng một cơ sở nhưng nếu công ty vận chuyển khác nhau giữa đông lạnh・lạnh・vật tư thì là bản ghi khác nhau nên **phân công riêng**.
- Khi dùng trung chuyển, **người phụ trách được chia giữa chặng 1 (kho → điểm trung chuyển) và chặng 2 (điểm trung chuyển → nơi giao hàng)**. Số vận đơn không phát hành lại ở điểm trung chuyển (§3.1B).
- **Cấu trúc để có thể giữ phân công theo đơn vị chặng (leg)** (quyết định 21/09/2026・#60). Có thể phân công tài xế cho mỗi chặng ứng với 1 dòng của **`delivery_legs`** (`contract_routes` / `contract_month_routes` phía hợp đồng không có `driver_id`・quyết định đợt 4 ngày 23/09/2026).
- **Việc có phân công hay không không dựa vào phân biệt chặng 1・chặng 2 mà do người vận chuyển của chặng (`delivery_legs.delivery_regime`) quyết định** (29/09/2026〔quyết định v2.3 #48〕). **Chặng do công ty vận chuyển (`parcel_carrier`: Yamato・Sagawa) vận chuyển thì không phân công** (màn hình hiển thị "Công ty vận chuyển"). **Chặng do tự vận chuyển (`self`)・ủy thác (`partner_driver`) vận chuyển thì phân công cả chặng 1 lẫn chặng 2**. Cũng có thực tế trường hợp chặng 1 là công ty vận chuyển ủy thác và có trung chuyển (kho →ủy thác A→ điểm trung chuyển →ủy thác B→ cơ sở). Với chặng ủy thác, công ty vận chuyển ủy thác đó cũng phân công được tài xế của mình (như trước). Cột tài xế trong danh sách Xuất hàng・Quản lý giao hàng hiển thị 2 dòng chặng 1／chặng 2. (Cũ: về vận hành hiện tại chỉ phân công chặng 2 〈điểm trung chuyển → nơi giao hàng〉. Chặng 1 do công ty vận chuyển chở nên không phân công, màn hình cũng chỉ có phân công chặng 2 〈quyết định #60〉. Thay thế 29/09/2026 〔quyết định v2.3 #48〕)
- **Bản ghi con đã nhân bản (`DL-…-1`) không kế thừa phân công**. Phân công lại theo ngày giao lại・ngày giao từng phần (§4A-4C).
- **Không phân công cho bản ghi con tự động của sự cố trước khi xác định (`duplicate_type = trouble_pending`).** Vận hành (logistics) xác định ngày và số lượng, thành `Chờ xuất hàng` rồi mới phân công (bổ sung 24/09/2026〔quyết định v2.3 #23〕).

### 4B-2. Ai có thể cài đặt・thay đổi

| Thao tác | Vận hành (quản lý ES) | Công ty vận chuyển ủy thác | Tài xế |
|---|---|---|---|
| Đăng ký tài xế・cấp tài khoản | ○ | △ (phần của công ty mình) | × |
| Phân công người phụ trách cho dữ liệu giao hàng・**thay đổi phân công** | ○ | ○ (phần của công ty mình. **Chỉ chặng do công ty mình vận chuyển**・29/09/2026〔quyết định v2.3 #48・#51〕) | × |
| **Đổi ngày giờ giao hàng** | ○ | × | × |
| Báo cáo nhận hàng・giao hàng | ○ (đăng ký thay) | ○ | ○ |
| Báo cáo sự cố (**không đổi trạng thái**. Ghi nhận báo cáo và mở cần xác nhận・bổ sung 24/09/2026〔quyết định v2.3 #20〕. Nếu loại là "tạo" thì hệ thống tự động tạo bản ghi con trong cùng transaction・bổ sung 29/09/2026〔quyết định v2.3 #30〕) | ○ | ○ | ○ |
| **Giải quyết sự cố** (gộp theo từng lần giao hàng〔quyết định v2.3 #29〕. Giải quyết bản ghi cha・dùng lại／hủy・xác định bản ghi con tự động) | ○ (Vận hành 〈logistics〉). Việc tự động giải quyết do hệ thống khi có báo cáo giao đủ toàn bộ cho lần giao chỉ bị chậm trễ〔quyết định v2.3 #32〕 | × | × |
| Hủy・dừng・sắp xếp giao lại・nhân bản | ○ | × | × |

> Đổi ngày giờ giao hàng chỉ Vận hành, còn **thay đổi phân công tài xế là cả Vận hành lẫn công ty vận chuyển ủy thác** (REQ-DL-149). Ranh giới này cũng là lý do ④ và ⑤ được tách ra.

### 4B-3. Cài đặt phía master (chuẩn bị ở ①)

- Màn hình cài đặt tài xế được **thống nhất・tập trung vào màn hình quản lý của Vận hành**. Xóa "Đơn vị trực thuộc" trong chi tiết nhân viên giao hàng (cơ bản là công ty pháp nhân). Số điện thoại **quản lý trạng thái đăng ký**. Xóa loại hình giao hàng "cá nhân" (REQ-DL-413).
- Cấp tài khoản **bắt buộc nhập địa chỉ email**, nếu không có email của bản thân thì nhập email của quản trị viên (REQ-DL-503).
- Việc phát hành・thông báo có thể **chọn giữa xuất CSV (phát thủ công) và thông báo email qua hệ thống**, có thể tự động gửi thông tin đăng nhập (REQ-DL-504).
- Quản lý tài xế **không có phân loại tên công ty・đánh giá・ô ghi chú** (REQ-DL-505. Cần xác nhận có cần mục tên công ty hay không).
- Màn hình dành cho công ty vận chuyển ủy thác có khu vực giao hàng・lịch trình・thông báo・danh sách yêu cầu báo giá・hiển thị số lượng phụ trách (REQ-DL-506). **Lịch trình dùng lại "tháng・tuần・ngày" của Vận hành, chỉ nhìn thấy các lần giao hàng có chặng do công ty mình phụ trách, lịch dự kiến đến chu kỳ tháng sau, không có số lượng** (29/09/2026〔quyết định v2.3 #34・#51〕・§4C-4).

### 4B-4. Thời điểm phân công và cách xử lý chưa phân công

| Thời điểm | Trạng thái | Cách xử lý |
|---|---|---|
| Ngay sau khi tạo xác định | `published` | Phân công được. **Hiển thị người phụ trách giống tháng trước làm ứng viên kế thừa** (không tự động xác định) |
| Thời điểm ra chỉ thị xuất hàng | → `locked` | Phân công được. **Dù chưa phân công thì thời điểm này cũng không hiển thị ở cần xác nhận**. Xem bằng badge "Chưa phân công N bản ghi" ở hiển thị tháng・tuần (29/09/2026〔quyết định v2.3 #43〕. (Cũ: nếu thời điểm này chưa phân công thì đưa vào "Cần xác nhận". Thay thế 29/09/2026 〔quyết định v2.3 #43〕)) |
| **Ngày trước ngày giao hàng** | `locked` | **Nếu chặng sẽ được phân công (§4B-1) chưa có người phụ trách thì hiển thị ở cần xác nhận `assignment_missing`** (29/09/2026〔quyết định v2.3 #43〕). Không chặn chính việc xuất hàng |
| Ngày picking・ngày giao hàng | `locked` | Bản ghi đến đúng ngày mà vẫn chưa phân công thì hiển thị ở vị trí cao nhất của cần xác nhận |
| Ngay sau khi nhân bản | Mới bất kể trạng thái của bản ghi cha | Vì ngày・vận đơn・**phân công tài xế** chưa được đặt nên chắc chắn đưa vào cần xác nhận |
| Ngay sau khi tạo bản ghi con tự động của sự cố (đồng thời với đăng ký báo cáo sự cố・bổ sung 29/09/2026〔quyết định v2.3 #30〕) | `Đang xác nhận` (`trouble_pending`) | **Ngoài đối tượng phân công**. Đưa vào cần xác nhận `trouble_auto_child_pending`, Vận hành xác định và thành `Chờ xuất hàng` rồi mới phân công (〔quyết định v2.3 #23〕) |

- Việc đổi phân công không đổi ngày nên **cũng không hạn chế sau `locked`**. Lưu thay đổi vào lịch sử (§11-2).
- **Không làm chức năng đổi tài xế hàng loạt** (quyết định 21/09/2026・#65). **Đổi từng bản ghi một.** Vì ngày tài xế nghỉ thì số bản ghi cần đổi có hạn, nếu đổi gộp thì sẽ không truy vết được "ai đang giữ gì". **Không làm ở giai đoạn 2** (§12-7).
- Cảnh báo ngưỡng (số lượng) là đối với số lượng picking của kho, còn số lượng phụ trách của tài xế thì **hiển thị dưới dạng số lượng ở màn hình phía công ty vận chuyển ủy thác** (REQ-DL-506).

### 4B-5. Cấu trúc màn hình ứng dụng tài xế (V1.0・chốt)

**V1.0 ưu tiên làm bằng Web (trình duyệt). Việc chuyển sang native trong tương lai vẫn tiếp tục xem xét** (quyết định 21/09/2026・#63). Phía tài xế **đã chốt màn hình** dưới dạng ứng dụng chạy trên trình duyệt Web. Phía Vận hành tiếp nhận dữ liệu gửi lên từ các màn hình này để quản lý.

| | Giai đoạn 2 (V1.0) | Tương lai |
|---|---|---|
| Hình thức cung cấp | **Web (trình duyệt)** | Xem xét ứng dụng native (iOS／Android) |
| Lý do | Không cần phân phối・cập nhật, có thể giao ngay trong ngày cho cả tài xế của công ty vận chuyển ủy thác | Khi muốn thông báo push・camera・lưu offline chắc chắn hơn |

- Giai đoạn 2 chỉ làm Web. **Không đưa việc chuyển sang native vào công việc của giai đoạn 2.**
- Vì tiền đề là Web nên việc giữ báo cáo chưa gửi khi offline・gửi riêng ảnh được đảm bảo bằng cách thức của §4B-7.

| Màn hình | Nội dung |
|---|---|
| Đăng nhập／đặt lại mật khẩu | Địa chỉ email và mật khẩu. Đặt lại theo kiểu liên kết qua email (REQ-DL-503・504) |
| Trang chủ | KPI trong ngày (**số lần giao hàng hôm nay・số hoàn thành・số còn lại・% tiến độ hôm nay**) và "Danh sách lịch giao hàng". Thẻ nơi giao hàng hiển thị địa chỉ・số thùng・số mặt hàng・**khung giờ nhận hàng (nếu có nhiều thì hiển thị tất cả theo thứ tự・`delivery_receive_windows`)**・**điều kiện giao hàng**・badge trạng thái (chưa nhận／chưa giao／hoàn thành giao hàng／sự cố). Thanh điều hướng phía dưới gồm Trang chủ／Hướng dẫn／Danh sách giao hàng／Sự cố／Tài khoản |
| Thông báo | Nhận thông báo được gửi từ Vận hành |
| Danh sách giao hàng (`DA_LIST_00`) | Tìm kiếm theo kỳ・tên kho・nơi giao hàng・số vận đơn, và lọc theo trạng thái |
| Nhận hàng tại kho (nhận hàng) | **Tích chọn số vận đơn** ở danh sách nhận hàng. Khi tích chọn hết thì "Hoàn thành" được kích hoạt. Nếu không tích chọn hết được, nhấn "**Gọi điện cho ES**" hoặc đánh dấu chưa nhận thì có thể nhấn "**Hoàn thành khi còn một phần chưa nhận**". **Việc nhận hàng được ghi vào `delivery_legs.picked_up_at`・`picked_up_by` của chặng đó. Chỉ lần nhận đầu tiên (nếu chặng 1 là ủy thác thì nhận tại kho) mới thành đã nhận hàng, khi tài xế chặng 2 nhận tại điểm trung chuyển thì chỉ có thời điểm nhận của chặng được nhập** (29/09/2026〔quyết định v2.3 #49〕) |
| Chuyến giao ES (5 bước) | **BƯỚC 1 Ảnh trước khi trưng bày** → **BƯỚC 2 Xác nhận tồn kho・hủy bỏ** (quét mã vạch・hạn sử dụng) → **BƯỚC 3 Trưng bày (kiểm hàng)＝kiểm tra số lượng** → **BƯỚC 4 Ảnh sau khi trưng bày** → **BƯỚC 5 Đăng ký thu tiền (tùy chọn)**. Sau khi hoàn thành vẫn chỉnh sửa được nội dung từng bước |
| Chuyến giao COOL | Tích chọn thông tin nơi giao hàng và thông tin hàng hóa (số vận đơn) rồi hoàn thành. Nếu còn hàng chưa giao thì "**Hoàn thành khi còn một phần chưa giao**". **Phần chưa giao được tự động tạo thành một chuyến giao COOL khác và quản lý là "Chưa giao"** |
| Báo cáo sự cố | Chọn đối tượng từ danh sách giao hàng, gửi nội dung (**thiếu thùng／giao nhầm／hàng hư hỏng／khác**, hoặc **thiếu sản phẩm・giao nhầm／kẹt xe・tai nạn／vắng mặt・không liên lạc được／khác**) + ảnh + ghi chú. Sau khi gửi, trong danh sách ở trang chủ có gắn badge "Sự cố". **Trạng thái giao hàng phía Vận hành không đổi** (vẫn là đã xuất hàng／đã nhận hàng・xử lý bằng báo cáo sự cố và cần xác nhận・bổ sung 24/09/2026〔quyết định v2.3 #20〕) |
| Hướng dẫn／tài khoản | Xem sổ tay thao tác, xác nhận thông tin cá nhân |

- Thuật ngữ trạng thái thống nhất là **đã nhận hàng** (ngày 05/06/2026 quyết định dùng "受け取り済み", ngày 18/09/2026 sửa thành cách viết lược okurigana, §4A-3B).
- Tài xế chỉ có thể **báo cáo**. Hủy・dừng・sắp xếp giao lại・nhân bản do Vận hành (logistics) thực hiện (§4A-4B).
- **Không chỉ thị giao bổ sung khi thiếu số lượng bằng ứng dụng**. Quản lý thủ công ở trụ sở, nếu cần thì tạo bản ghi riêng bằng nhân bản ở ⑦ (REQ-DL-147).
- Liên kết tình trạng giao hàng với bên ngoài là **liên kết ngoài** đến trang liên hệ của từng công ty (REQ-DL-414).
- **Khung giờ nhận hàng không nhất thiết chỉ có một** (quyết định đợt 2 ngày 21/09/2026). Có cơ sở chia sáng・chiều nên hiển thị **tất cả các dòng theo thứ tự `sort_order`** của `delivery_receive_windows` đã snapshot vào dữ liệu giao hàng (ví dụ: `09:00〜12:00 / 13:00〜16:00`). Không chỉ hiển thị một cặp rồi bỏ phần còn lại (§3.1C・§7).
- **Với chuyến báo cáo giao hàng bằng ứng dụng tài xế của ES, không coi là hoàn thành mặc định** (quyết định đợt 2 ngày 21/09/2026). Nếu sáng hôm sau vẫn chưa hoàn thành thì hiển thị ở **missing queue (cần xác nhận)** (§4C-1・§11-1 `delivery_detect_missing`).

### 4B-6. Quản lý phía tài xế từ phía Vận hành

Vì phía tài xế đã được quyết định nên chuẩn bị **hình thức để Vận hành quản lý được**. Có ba phương châm.

1. **Gom mọi bất thường vào "Cần xác nhận".** Hoàn thành khi còn chưa nhận・giao chưa hết một phần・chênh lệch số lượng khi kiểm hàng・báo cáo sự cố đều gộp thành một ở "Cần xác nhận" của lịch trình Vận hành, để nhận ra mà không cần vào xem màn hình phía tài xế.
2. **Thống nhất bản ghi nối tiếp cho phần chưa giao bằng nhân bản của ⑦.** "Tag phần chưa giao" mà chuyến COOL đang tự động tạo sẽ được tạo thành **bản ghi con có số nhánh `DL-…-1`** (§4A-4C). Cách tạo dữ liệu thống nhất với giao từng phần・giao lại・chuyến thay thế, xử lý thanh toán và kiểm toán bằng một quy tắc.
3. **Truy được chứng cứ từ Chi tiết dữ liệu giao hàng (06).** Ảnh・báo cáo tồn kho hủy bỏ・số lượng kiểm hàng・số tiền thu được tải lên từ ứng dụng, nơi Vận hành xác nhận・sửa được tập trung ở 06.

**Màn hình ứng dụng ↔ Quản lý của Vận hành**

| Ứng dụng tài xế | Thứ được gửi lên | Việc Vận hành quản lý | Nơi |
|---|---|---|---|
| Đăng nhập・đặt lại mật khẩu | Tình trạng đăng nhập | Cấp・khóa tài khoản, **thực hiện thay việc đặt lại mật khẩu**, trạng thái đăng ký số điện thoại | 08 Cài đặt tài xế |
| KPI trang chủ (số lượng・hoàn thành・còn lại・tiến độ) | Tiến độ trong ngày | **Hiển thị xuyên suốt theo tài xế・kho・công ty vận chuyển ủy thác**. Tìm ra tài xế bị chậm ngay trong ngày | 08 Quản lý tài xế |
| Danh sách lịch giao hàng | Dữ liệu giao hàng phụ trách | **Phân công và đổi phân công** (Vận hành + công ty vận chuyển ủy thác). Chưa phân công thì là cần xác nhận | 08 Quản lý tài xế |
| Nhận hàng | Kết quả tích chọn theo từng vận đơn, **hoàn thành khi còn một phần chưa nhận** | Xác định vận đơn chưa nhận, đối chiếu với kết quả xuất hàng phía kho. Bản ghi kết thúc ngày mà vẫn còn chưa nhận thì là cần xác nhận | 06 Chi tiết dữ liệu giao hàng／Cần xác nhận |
| Chuyến giao ES BƯỚC 1・4 (ảnh) | Ảnh trước・sau khi trưng bày | Xem ảnh. Đính kèm vào kết quả giao hàng để lưu làm chứng cứ khi khiếu nại | 06 Chi tiết dữ liệu giao hàng |
| Chuyến giao ES BƯỚC 2 (xác nhận tồn kho・hủy bỏ) | Báo cáo hết hạn sử dụng・hủy bỏ | **Đăng ký hủy bỏ và điều chỉnh tồn kho**. Đối chiếu với đặc tả phía đặt hàng・nhập mua・nhập kho | 06／Tồn kho |
| Chuyến giao ES BƯỚC 3 (kiểm hàng・số lượng) | Số lượng thực tế đã bày | **Xác nhận chênh lệch với số lượng dự kiến và xác định kết quả**. Phần thiếu tạo giao bổ sung bằng nhân bản ở ⑦ (không chỉ thị từ ứng dụng) | 06 Chi tiết dữ liệu giao hàng |
| Chuyến giao ES BƯỚC 5 (thu tiền) | Số tiền mặt thu được | Vận hành xác nhận・sửa số tiền thu, **xuất CSV kèm chi tiết theo từng cơ sở** (REQ-DL-507) | 06／Quản lý thu tiền |
| "Hoàn thành khi còn một phần chưa giao" của chuyến COOL | Vận đơn・số lượng chưa giao | **Tạo bản ghi con có số nhánh và quyết định ngày giao lại** (⑦). Tag được tạo tự động sẽ được thay bằng nhân bản này | 06 Chi tiết dữ liệu giao hàng |
| Báo cáo sự cố | Loại・ảnh・ghi chú | **Không đổi trạng thái** mà đưa báo cáo sự cố vào cần xác nhận, Vận hành (logistics) trực tiếp giải quyết bản ghi cha (đã giao／đã giao một phần + con／chờ giao lại + con／đã nhận hàng 〈quay lại trong ngày〉／dừng. Hàng thay thế・hủy bỏ là xử lý kèm theo・⑥). Bắt buộc nhập lý do. **Lựa chọn của ứng dụng được ánh xạ sang 6 phân loại bằng `trouble_app_reasons`, nếu loại là "tạo" (giao nhầm・vắng mặt・hư hỏng) thì đồng thời với báo cáo tạo ngay 1 bản ghi con tự động** ("Thiếu sản phẩm・giao nhầm" chưa xác định loại nên không tạo) (bổ sung 29/09/2026〔quyết định v2.3 #30〕. Cũ: nếu đến hạn chưa giải quyết thì tạo 1 bản ghi con tự động 〔quyết định v2.3 #22〕. Bỏ 29/09/2026). **Khi lần giao hàng chỉ có chậm trễ (kẹt xe・tai nạn) chưa được giải quyết và tài xế gửi báo cáo giao đủ toàn bộ, hệ thống tự động giải quyết báo cáo chậm trễ đó thành "giao đủ toàn bộ"** (〔quyết định v2.3 #32〕). **(Cũ: chuyển trạng thái sang đang xác nhận để chọn. Bỏ 24/09/2026)** | 06／Cần xác nhận |
| Thông báo | — | **Tạo thông báo gửi・lọc đối tượng (tất cả／công ty vận chuyển ủy thác／cá nhân)・tình trạng đã đọc** | 08 Quản lý tài xế |
| Hướng dẫn | — | Thay thế và công bố sổ tay thao tác | 08 Quản lý tài xế |
| Nút "Gọi điện cho ES" | Việc đã gọi điện | **Ghi nhận việc đã nhấn thành sự kiện** để sau này truy được "tại sao thành chưa nhận" (đề xuất) | 06 Lịch sử thay đổi |

**Số điện thoại liên hệ (【Tạm thời】21/09/2026・#67. Chờ Vận hành xác nhận)**

| Đầu mối | Số | Cách dùng |
|---|---|---|
| **Dành cho tài xế** | **【Tạm thời】050-5784-2777** | Nơi gọi đến của nút "Gọi điện cho ES" trong ứng dụng. Liên lạc về hàng thiếu・không nhận được・chậm trễ, v.v. |
| Nơi báo cáo sự cố thiết bị | **【Tạm thời】050-3784-2771** | Sự cố thiết bị như máy bán hàng tự động・tủ lạnh. **Ghi kèm như đầu mối riêng** |

> **【Tạm thời】** Đang xác nhận với Vận hành xem số nào là chính thức hiện hành. Khi chốt sẽ thay bảng này.

**Màn hình mà Vận hành cần có (08 Quản lý tài xế)**

| Khối | Nội dung |
|---|---|
| Tiến độ trong ngày | Số lần giao hàng・hoàn thành・còn lại・% tiến độ. Chuyển đổi theo tài xế／công ty vận chuyển ủy thác／kho |
| Phân công | Danh sách dữ liệu giao hàng lọc theo ngày và tài xế. Đổi người phụ trách (**từng bản ghi một**), cảnh báo chưa phân công |
| Tình trạng tiến hành | Hiển thị theo từng dữ liệu giao hàng **đã đi đến đâu**, từ nhận hàng → BƯỚC 1〜5 của chuyến giao ES (hoặc hoàn thành chuyến COOL) |
| Cần xác nhận | Gom vào một danh sách các mục: hoàn thành khi còn chưa nhận・giao chưa hết một phần・chênh lệch số lượng・báo cáo sự cố・chưa phân công. Từ đây vào các thao tác ⑥⑦ |
| Phân phát | Quản lý thông báo và sổ tay thao tác |

### Yêu cầu (quản lý tài xế・đề xuất. Sau khi phê duyệt sẽ đăng ký vào REQ-DL)

| ID | Phân loại | Nội dung | Trạng thái |
|---|---|---|---|
| REQ-DL-641 | Yêu cầu màn hình | Đặt "Quản lý tài xế" trong màn hình quản lý Vận hành, hiển thị được số lần giao hàng・số hoàn thành・số còn lại・tiến độ trong ngày theo tài xế／công ty vận chuyển ủy thác／kho | Đề xuất |
| REQ-DL-642 | Yêu cầu chức năng | Phân công・thay đổi tài xế phụ trách cho từng dữ liệu giao hàng từ màn hình Vận hành (công ty vận chuyển ủy thác chỉ phần của công ty mình) | Đề xuất |
| REQ-DL-643 | Yêu cầu kiểm soát | Hiển thị dữ liệu giao hàng chưa phân công tại thời điểm ra chỉ thị xuất hàng ở "Cần xác nhận". Không chặn chính việc xuất hàng | Đề xuất |
| REQ-DL-644 | Yêu cầu chức năng | Hiển thị các bản ghi "hoàn thành khi còn một phần chưa nhận" ở khâu nhận hàng vào cần xác nhận cùng với số vận đơn chưa nhận | Đề xuất |
| REQ-DL-645 | Yêu cầu chức năng | Xác nhận được tiến độ BƯỚC 1〜5 của chuyến giao ES và ảnh trước・sau khi trưng bày từ chi tiết dữ liệu giao hàng | Đề xuất |
| REQ-DL-646 | Yêu cầu chức năng | Từ báo cáo tồn kho・hủy bỏ của BƯỚC 2, thực hiện được đăng ký hủy bỏ và điều chỉnh tồn kho | Đề xuất |
| REQ-DL-647 | Yêu cầu kiểm soát | Khi số lượng kiểm hàng của BƯỚC 3 khác số lượng dự kiến, hiển thị chênh lệch ở cần xác nhận, việc xác định kết quả do Vận hành thực hiện | Đề xuất |
| REQ-DL-648 | Yêu cầu chức năng | Vận hành xác nhận・sửa được số tiền thu của BƯỚC 5, và xuất CSV kèm chi tiết theo từng cơ sở (giống REQ-DL-507) | Đề xuất |
| REQ-DL-649 | Yêu cầu kiểm soát | Phần chưa giao còn lại ở "hoàn thành khi còn một phần chưa giao" của chuyến COOL được tạo không phải bằng tag tự động mà bằng **bản ghi con có số nhánh (nhân bản)** | Đề xuất |
| REQ-DL-650 | Yêu cầu chức năng | Khi nhận báo cáo sự cố thì **không đổi trạng thái dữ liệu giao hàng** mà ghi nhận báo cáo sự cố và đưa vào cần xác nhận, Vận hành (logistics) trực tiếp giải quyết bản ghi cha (đã giao／đã giao một phần + con／chờ giao lại + con／đã nhận hàng／dừng). Bắt buộc lý do (sửa đổi theo bổ sung 24/09/2026 〔quyết định v2.3 #20・#21〕. Cũ: chuyển dữ liệu giao hàng liên quan sang "đang xác nhận" và chọn được giao lại／hàng thay thế／hủy bỏ／dừng／hủy) | Đề xuất |
| REQ-DL-651 | Yêu cầu chức năng | Có thể gửi thông báo dành cho tài xế từ Vận hành, và quản lý được đối tượng (tất cả／công ty vận chuyển ủy thác／cá nhân) và tình trạng đã đọc | Đề xuất |
| REQ-DL-652 | Yêu cầu dữ liệu | Ghi nhận việc đã nhấn "Gọi điện cho ES" trong ứng dụng thành sự kiện, tham chiếu được từ lịch sử thay đổi | Đề xuất |

---

### 4B-7. Truyền thông・phạm vi tham chiếu・thông tin cá nhân của ứng dụng (quyết định 13/09/2026)

**Truyền thông (offline・gửi trùng)**

- API loại hoàn thành **bắt buộc khóa idempotent (ID giao hàng ＋ bước ＋ UUID do thiết bị tạo)**, từ lần thứ 2 trở đi với cùng khóa thì không xử lý mà trả cùng kết quả. Dù nhấn nút hai lần cũng không đăng ký trùng.
- Báo cáo không gửi được thì **giữ trên thiết bị và gửi lại**. Luôn hiển thị "Chưa gửi N bản ghi" ở phía trên màn hình.
- **Ảnh được tách khỏi phần chính và gửi riêng**. Dù tải ảnh lên thất bại thì chính việc hoàn thành vẫn được thông qua, có thể bổ sung sau.

**Phạm vi tham chiếu**

| Ai | Phạm vi nhìn thấy |
|---|---|
| Công ty vận chuyển ủy thác・tài xế | **Chỉ dữ liệu giao hàng được phân công cho công ty mình**. Phần của công ty khác không hiển thị cả trong danh sách |
| Tài xế | Dữ liệu giao hàng đã qua **90 ngày** kể từ khi hoàn thành thì không nhìn thấy (phía Vận hành vẫn còn) |
| Vận hành | Tất cả |

**Thời hạn lưu trữ**

| Đối tượng | Thời hạn |
|---|---|
| Ảnh trước・sau khi trưng bày, ảnh báo cáo sự cố | **12 tháng** kể từ khi hoàn thành giao hàng (thời hạn xử lý khiếu nại) |
| Snapshot nơi giao hàng・kết quả giao hàng | **24 tháng** (theo thanh toán・kiểm toán) |
| Lịch giao dự kiến | **24 tháng** trong quá khứ (§10-2 #13) |

- Tài khoản **vô hiệu hóa ngay khi nghỉ việc・kết thúc hợp đồng**. Quản trị viên của công ty vận chuyển ủy thác có thể vô hiệu hóa tài xế của công ty mình.
- **Không thu thập thông tin vị trí** (ứng dụng không có chức năng này). Ghi vào đặc tả việc không có, để sau này không bị hiểu nhầm là "chắc lấy được".

---

## 4C. Loại chuyến giao và thông tin lấy được (quyết định 13/09/2026)

#### Trước hết, tách ba trục dễ lẫn lộn (sắp xếp 18/09/2026)

Không dùng cách nói "chuyến ủy thác". Vì **tài xế của công ty vận chuyển ủy thác dùng ứng dụng của ES nên lấy được tiến độ**, nhưng "ủy thác＝không lấy được" lại dễ bị hiểu như vậy.

| Trục | Tên vật lý | Giá trị | Nơi giữ | Quyết định điều gì |
|---|---|---|---|---|
| **Loại chuyến** | `service_form` | Chuyến giao ES／Chuyến giao COOL／Chuyến vật tư | **Loại hình giao hàng (delivery channel)** (quyết định đợt 2 ngày 21/09/2026) | Nội dung công việc trong ứng dụng (có trưng bày hay không). §4C-3 |
| **Thể chế giao hàng** | **`delivery_regime`** (thêm ở đợt 2 ngày 21/09/2026) | `self` (tự vận chuyển)／`partner_driver` (tài xế ủy thác)／`parcel_carrier` (công ty vận chuyển) | Loại hình giao hàng + **theo từng chặng (leg)** | Ai vận chuyển. **Giá trị của final leg ảnh hưởng đến phán định hoàn thành mặc định** (§4C-1) |
| **Tuyến** | — | Không trung chuyển／Có trung chuyển | **Không lưu (giá trị suy ra)** | Giữa kho và nơi giao hàng có điểm trung chuyển hay không. **Suy ra từ route legs** (§4A-3B・nêu rõ ở đợt 2 ngày 21/09/2026) |

- **`service_form` (loại chuyến) đặt ở loại hình giao hàng (delivery channel). Không đặt ở tuyến của hợp đồng (`contract_routes`)** (quyết định đợt 2 ngày 21/09/2026). **(Cũ: đợt 1 #29 "loại chuyến là mục nhập mà hợp đồng 〈hợp đồng con〉 giữ". Đợt 2 ngày 21/09/2026 giới hạn nơi giữ ở "loại hình giao hàng")** Việc không suy ra từ có/không trung chuyển vẫn không đổi.
- **`relay` (trung chuyển) được suy ra từ route legs. Không lưu như một trạng thái** (quyết định đợt 2 ngày 21/09/2026).


Thông tin lấy được khác nhau không phải do thể chế giao hàng mà do **có đi qua ứng dụng tài xế của ES hay không**. Chuyến do công ty vận chuyển ủy thác giao thì đi qua ứng dụng nên lấy được tiến độ. Thứ không lấy được chỉ là **chặng do công ty vận chuyển trực tiếp giao** (giao thẳng vật tư bằng Yamato, chặng trung chuyển của chuyến giao COOL).

| | Chuyến đi qua ứng dụng tài xế<br><span>(tự vận chuyển・công ty vận chuyển ủy thác)</span> | Chặng không đi qua ứng dụng<br><span>(công ty vận chuyển trực tiếp giao)</span> |
|---|---|---|
| Thông tin giữa chừng | Lấy được **từ nhận hàng tại kho đến BƯỚC 1〜5** bằng ứng dụng | **Chỉ đến việc đã ra chỉ thị xuất hàng**. Từ đó trở đi chỉ có liên kết ngoài đến trang liên hệ của từng công ty |
| Xác định hoàn thành giao hàng | Báo cáo giao hàng của tài xế | **Không ai báo cáo** → "hoàn thành mặc định" ở §4C-1 |
| Người báo cáo sự cố | Tài xế | Liên lạc từ doanh nghiệp・cơ sở hoặc công ty vận chuyển (Vận hành đăng ký thay) |
| Túi giữ lạnh・gói giữ lạnh | Thu hồi được | Không thu hồi được (§12-7 không có quản lý thu hồi) |
| Số vận đơn | **Được gắn nếu có chặng qua Yamato** (tự giao hàng ≠ không có vận đơn) | Chắc chắn được gắn |

### 4C-1. Khi công ty vận chuyển trực tiếp giao chặng cuối thì hoàn thành giao hàng là "hoàn thành mặc định"

**Việc có coi là hoàn thành mặc định hay không được phán đoán theo người vận chuyển của final leg (chặng cuối), không phải loại chuyến** (quyết định đợt 2 ngày 21/09/2026). **(Cũ: phán đoán theo loại chuyến "chuyến ủy thác xác định hoàn thành giao hàng theo mặc định". Thay đổi ở đợt 2 ngày 21/09/2026)** Cùng là chuyến giao COOL, nhưng nếu chặng cuối do tài xế ES chạy thì lấy được báo cáo nên không được coi là mặc định.

| Người vận chuyển final leg (chặng cuối) | Cách xử lý hoàn thành | Cách xử lý thất lạc |
|---|---|---|
| **Ứng dụng tài xế của ES** (tài xế tự vận chuyển・công ty vận chuyển ủy thác) | **Không coi là hoàn thành mặc định.** Chuyển thành Đã giao bằng báo cáo giao hàng của tài xế | Nếu sáng hôm sau vẫn chưa hoàn thành thì đưa ra **missing queue (cần xác nhận)** |
| **Công ty vận chuyển giao trực tiếp** (Yamato, v.v. Không đi qua ứng dụng của ES) | **Coi là hoàn thành mặc định.** Batch 06:00 ngày hôm sau ngày giao hàng chuyển thành **"Đã giao (mặc định)"** | Chỉ khi có liên lạc về bất thường từ khách hàng・công ty vận chuyển mới ghi nhận là **báo cáo sự cố** và mở cần xác nhận (không đổi trạng thái. Trong khi chưa giải quyết thì không coi là hoàn thành mặc định・〔quyết định v2.3 #20・#25〕). **(Cũ: chuyển xuống đang xác nhận. Bỏ 24/09/2026)** |

- Thứ dùng để phán định là **`delivery_regime` của chặng cuối (`is_final_leg = true`) trong `delivery_legs` (các chặng của 1 dữ liệu giao hàng)** (§7). Nếu `parcel_carrier` thì hoàn thành mặc định, nếu `self` / `partner_driver` thì không coi là mặc định.
- Dù có trung chuyển, **nếu chặng trung chuyển là công ty vận chuyển nhưng chặng cuối là tài xế ES thì không coi là hoàn thành mặc định**. Ngược lại nếu chặng cuối là công ty vận chuyển thì dù chặng trước là tự giao hàng cũng thành hoàn thành mặc định.
- Tuy nhiên, nếu có ① xác nhận nhận hàng từ lịch của doanh nghiệp, ② liên lạc từ doanh nghiệp・cơ sở hoặc công ty vận chuyển thì **ghi đè bằng nội dung đó**. Phần có liên lạc được ghi nhận là báo cáo sự cố để mở cần xác nhận, và **không đổi trạng thái** (bổ sung 24/09/2026〔quyết định v2.3 #20〕. **Cũ: chuyển xuống đang xác nhận. Bỏ 24/09/2026**).
- **Đối tượng của hoàn thành mặc định chỉ là các bản ghi có `status = đã xuất hàng` và không có báo cáo sự cố chưa giải quyết** (〔quyết định v2.3 #25〕). Bản ghi con tự động của sự cố trước khi xác định (`đang xác nhận`) cũng ngoài đối tượng (〔quyết định v2.3 #23〕). Sự cố chưa giải quyết được đóng bằng việc giải quyết của Vận hành (logistics) (§4A-4B).
- **Khi sau hoàn thành mặc định mới biết là "chưa đến nơi"**: Vận hành đăng ký thay báo cáo sự cố và yêu cầu Yamato điều tra. Nếu xác định là thất lạc・không giao được thì **chỉ với `Đã giao` của hoàn thành mặc định (`presumed`)** mới có thể chuyển sang `Chờ giao lại` (con)／`Dừng`. Không thanh toán (nếu đã xác định thì điều chỉnh vào tháng sau). Trường hợp chỉ một phần thùng không đến thì chưa quyết (bổ sung 29/09/2026〔quyết định v2.3 #27〕・§4A-4B).
- Hoàn thành mặc định được coi là kết quả thực tế, nhưng **để lại trong dữ liệu việc đó là mặc định** (`deliveries.completion_source = presumed | reported | customer`). Để phân biệt được "hoàn thành mà không ai nhìn thấy" khi thanh toán hay kiểm toán.
- **Hợp đồng thanh toán theo kết quả thực tế (trả sau) cũng vậy, nếu chặng cuối là công ty vận chuyển thì hoàn thành mặc định là được** (quyết định 19/09/2026). Không phân biệt kiểu "vì trả sau nên lấy kết quả thực tế nghiêm ngặt". Khi phát hiện chênh lệch thì **điều chỉnh sau** (điều chỉnh trong ① hoặc ② của §4D-1).
- Không giả vờ thấy thứ không thấy. Thiết kế để **chỉ khi có bất thường thì con người mới can thiệp**.

### 4C-2. Không giữ trạng thái giữa chừng của trung chuyển

- Vì trung chuyển là gửi qua Yamato nên giả định **không lấy được "đã giao cho điểm trung chuyển／đã nhận tại điểm trung chuyển"** (**trường hợp chặng do công ty vận chuyển chở**. Chặng chở bằng ứng dụng ES thì là ngoại lệ ở dưới・29/09/2026〔quyết định v2.3 #49〕).
- Dù chặng 1 (kho→điểm trung chuyển) và chặng 2 (điểm trung chuyển→nơi giao hàng) có người phụ trách khác nhau, thứ hệ thống giữ **làm trạng thái** chỉ là **việc đã ra chỉ thị xuất hàng và hoàn thành giao hàng cuối cùng**.
- **Ngoại lệ: khi chặng được chở bằng ứng dụng ES (chặng 1 là công ty vận chuyển ủy thác và có trung chuyển, v.v.) thì ghi lại thời điểm nhận・người nhận theo từng chặng (`delivery_legs.picked_up_at`・`picked_up_by`)** (29/09/2026〔quyết định v2.3 #49〕). **Không tăng trạng thái**: chỉ khi nhận lần đầu bằng ứng dụng ES (nếu chặng 1 là ủy thác thì nhận tại kho) mới thành đã nhận hàng, dù tài xế chặng 2 thực hiện "nhận hàng" tại điểm trung chuyển thì chỉ có thời điểm nhận của chặng được nhập, trạng thái vẫn là đã nhận hàng. Những bản ghi mà sáng hôm sau ngày giao hàng vẫn chưa có nhận hàng ở chặng cuối thì được nhặt bằng phát hiện thất lạc có sẵn (`delivery_detect_missing`).
- Nếu cần theo dõi giữa chừng thì **mở trang theo dõi của từng công ty từ số vận đơn** để xem (REQ-DL-414). Không đưa vào hệ thống như một trạng thái.
- Do đó thứ hiển thị trên màn hình chỉ là **"Có trung chuyển／Không"** (quyết định 19/09/2026・§4A-3B). Không giữ chờ trung chuyển／đang trung chuyển／đã trung chuyển.
- **Dù ở giai đoạn 3 có batch lấy tình trạng giao hàng của Yamato thì dữ liệu lấy được cũng chỉ hiển thị như thông tin tham khảo**. Vì không đoán được độ chi tiết・thời điểm cập nhật・cách xử lý thiếu dữ liệu, nếu để thẳng thành trạng thái thì trạng thái trên màn hình sẽ lệch với thực tế. Việc xác định trạng thái vẫn tiếp tục bằng **hoàn thành mặc định** và báo cáo của ứng dụng tài xế.
- Vì vậy, với chuyến mà **final leg là công ty vận chuyển giao trực tiếp**, cách duy nhất để nhận ra có thực sự đến nơi hay không chỉ là **liên lạc từ khách hàng・công ty vận chuyển** (vì thuộc đối tượng hoàn thành mặc định nên không nằm trong batch phát hiện thất lạc・§4C-1). **Batch phát hiện thất lạc (missing queue) nhặt các chuyến có final leg là ứng dụng tài xế ES** (§11-1・sắp xếp ở đợt 2 ngày 21/09/2026).
### 4C-3. Cách xử lý theo nhiệt độ・loại chuyến

Loại chuyến của ứng dụng (`service_form`) được quyết định bởi **"có công việc trưng bày hay không"**, không phải nhiệt độ. **Chủ sở hữu là loại giao hàng (delivery channel)**, không đặt ở route của hợp đồng (quyết định lần 2 ngày 2026/09/21・§3.1B).

> **Chỉ được rẽ nhánh theo loại chuyến ở "việc làm trên ứng dụng"** (quyết định lần 2 ngày 2026/09/21). **Việc có coi hoàn tất giao hàng là "coi như" hay không, có phát hiện là thiếu giao hay không, không rẽ nhánh theo loại chuyến mà dựa vào `delivery_regime` của final leg** (§4C-1). Ngay cả cùng là chuyến COOL, nếu tài xế ES chạy chặng cuối thì không coi như hoàn tất.

| Chuyến | Nội dung | Ứng dụng |
|---|---|---|
| **Chuyến giao ES** | Chuyến trưng bày đến tận kệ của nơi giao | STEP1 Ảnh trước trưng bày → STEP2 Xác nhận tồn kho・hủy bỏ → STEP3 Kiểm hàng (số lượng) → STEP4 Ảnh sau trưng bày → STEP5 Thu tiền (tùy chọn) |
| **Chuyến giao COOL** | Chuyến chỉ bàn giao. **Đông lạnh・Lạnh・Nhiệt độ thường đều thuộc đây** (nhiệt độ thường xử lý giống lạnh) | Chỉ cần kiểm tra phiếu vận chuyển là hoàn tất. **Nếu tài xế ES chạy chặng cuối thì báo cáo trên ứng dụng = không coi như hoàn tất** (§4C-1) |
| **Chuyến vật tư** | **Gửi trực tiếp từ kho đến Yamato**. Không qua tài xế | **Ngoài đối tượng.** Không có phân công tài xế lẫn 5 bước. Chỉ quản lý chỉ thị xuất hàng và số phiếu vận chuyển, trên lịch được xử lý như dòng "chỉ xuất hàng" |

---

### 4C-4. Cách hiển thị lịch cho công ty giao hàng ủy thác (xác nhận 2026/09/19)

- **Công ty giao hàng ủy thác nắm lịch sắp tới trên trang web riêng của công ty giao hàng.** ES không liên lạc mỗi lần.
- Lịch hiển thị trên trang riêng là **dự kiến**, và **thời điểm xác định trùng với lúc chốt đơn (hạn chốt đơn)**. Cho đến hạn chốt, cả ngày lẫn số lượng đều có thể thay đổi.
- **Phạm vi hiển thị trên trang riêng (quyết định ngày 2026/09/29 [Quyết định v2.3 #34・#51]. (Cũ: chưa quyết xem trước bao nhiêu tháng・những mục nào. Tiếp tục xác nhận ở §8 Mục chưa quyết. Đã giải quyết 2026/09/29))**

| Đối tượng | Phạm vi hiển thị | Mục hiển thị |
|---|---|---|
| **Dữ liệu giao hàng đã xác định (sau hạn chốt đơn)** | Toàn bộ (những đơn có chặng của công ty mình) | **Tất cả mục**: tên cơ sở・địa chỉ・ngày giao・nhiệt độ・số lượng・điều kiện giao hàng・phiếu vận chuyển |
| **Dự kiến (trước hạn chốt. `draft` và dữ liệu giao hàng trước hạn chốt)** | **Đến chu kỳ tháng sau** | **Chỉ ngày giao・tên cơ sở・nhiệt độ・số đơn** (không hiển thị số lượng). Gắn dấu "Dự kiến" |

- **Chỉ thấy những đơn giao hàng có chặng (leg. `delivery_legs.carrier_id` là công ty mình) do công ty mình phụ trách**. **Chỉ thao tác được trên chặng của công ty mình** (phụ trách cấp 1 đến khi nhận tại kho, phụ trách cấp 2 từ nhận tại điểm trung chuyển đến giao hàng) (2026/09/29 [Quyết định v2.3 #51]).
- Màn hình tái sử dụng "Lịch tháng・tuần・ngày" của vận hành cho Web công ty giao hàng ủy thác (theme carrier). Cố định bộ lọc "Công ty giao hàng ủy thác" là công ty mình và ẩn cột số lượng của dự kiến (không tạo màn hình mới・[Quyết định v2.3 #34]).

---

## 4D. Kết nối với thanh toán・phiếu vận chuyển・chỉ thị xuất hàng (quyết định 2026/09/13)

### 4D-1. Thanh toán

- **Chốt theo tháng dương lịch của ngày giao**. Tên chu kỳ (`Chu kỳ giao hàng tháng 10 năm 2026`) là nhãn hiển thị theo thuận tiện logistics, không dùng cho thanh toán.
- Thanh toán **dựa trên thực tế giao hàng**. Ghi nhận số lượng vào **tháng dương lịch của ngày thực sự giao hàng**. **Cha-con (nhánh) chỉ là cách gộp chứng từ, không quyết định việc số tiền thuộc về tháng nào.**

| Trường hợp | Kết quả |
|---|---|
| Ngày 20/8 giao 18 suất, ngày 22/8 giao 2 suất còn lại | Cả hai đều thanh toán tháng 8. Tổng 20 suất. Hóa đơn dù 1 dòng vẫn có thể hiển thị chi tiết 20/8 18 suất・22/8 2 suất |
| **Ngày 31/8 giao 18 suất, ngày 2/9 giao 2 suất còn lại** | **Thanh toán tháng 8 18 suất, tháng 9 2 suất**. Khớp thực tế, dễ giải thích khi kiểm toán |
| 2 suất còn lại cuối cùng không giao được | 2 suất đó **không thanh toán** (vì chưa giao) |

| Sự kiện | Cách xử lý thanh toán |
|---|---|
| **Giao lại** | Không đổi thanh toán sản phẩm. Cước vận chuyển **không áp dụng chung mà xét riêng từng trường hợp**, dữ liệu giao hàng có cờ "**thanh toán／không thanh toán**" **`freight_billable`** (mặc định "không"・**bắt buộc nhập lý do**). **Cờ này cũng dùng cho hủy giao** (2026/09/29 [Quyết định v2.3 #40]. (Cũ: tên cột `redelivery_billable` 〈chỉ giao lại〉. Thay thế 2026/09/29 [Quyết định v2.3 #40])). Có thể tổng hợp hàng tháng "giao lại thanh toán do lý do khách hàng" |
| **Hủy giao** | Thực tế 0. **Loại khỏi đối tượng thanh toán tháng đó. Không chuyển sang kỳ sau** (vì chuyển sẽ không theo dõi được). **Ngay cả khi khách hủy sau hạn chốt đơn cũng không thanh toán (như hiện tại)**. **Không tạo mục "phí hủy"** (quyết định 2026/09/21・#69). **Cước vận chuyển của hủy sau khi xuất hàng chọn "thanh toán／không thanh toán" bằng `freight_billable` giống giao lại** (mặc định "không"・chọn "có" thì bắt buộc lý do・2026/09/29 [Quyết định v2.3 #40]) |
| **Hàng thay thế** | **Thanh toán theo mặt hàng ban đầu** (chênh lệch giá vốn của hàng thay thế do ES chịu). Chi tiết thực tế là dòng của sản phẩm thực sự giao, **tính thanh toán theo đơn giá của `delivery_lines.substituted_from_product_id` (sản phẩm bị thay thế)** (2026/09/29 [Quyết định v2.3 #39]). Đăng ký khi chọn "giao đủ toàn bộ bằng hàng thay thế" khi giải quyết sự cố, hoặc sửa thực tế (chỉ vận hành・bắt buộc lý do) |
| **Trả hàng** (`duplicate_type = return`) | **Không thanh toán**. Vì là chuyến gửi sản phẩm còn lại về nơi nhận lại (trụ sở, v.v.) (2026/09/29 [Quyết định v2.3 #41]) |
| **Hủy bỏ (phế bỏ)** | Không thanh toán vì chưa giao. Điều chỉnh bên tồn kho |
| **Con tự động của sự cố (trước khi xác nhận)** | **Không thanh toán.** Số lượng tạm không dùng cho xuất hàng・thanh toán. Sau khi vận hành xác nhận và chuyển sang `出荷待`, thanh toán theo thực tế giống con thông thường (bổ sung 2026/09/24 [Quyết định v2.3 #22・#23]) |
| **Giao một phần (phần còn lại không gửi)** | Chỉ thanh toán phần đã giao. **Phần không gửi không thanh toán** (thanh toán theo thực tế・bổ sung 2026/09/29 [Quyết định v2.3 #31]) |
| **Chưa đến sau khi coi như hoàn tất** (`presumed` từ Đã giao → Chờ giao lại／Hủy giao) | Phần chuyển sang Chờ giao lại・Hủy giao **không thanh toán**. **Nếu thanh toán đã chốt thì không sửa ngược mà điều chỉnh (hoàn tiền・bù trừ) tháng sau** (bổ sung 2026/09/29 [Quyết định v2.3 #27]) |
| **Thiếu giao** | **Chuyến mà final leg là ứng dụng tài xế của ES, đến sáng hôm sau vẫn chưa ở trạng thái Đã giao・Hủy giao・Hủy bỏ nào thì coi là thiếu giao** và đưa vào **missing queue (cần xác nhận)** (quyết định lần 2 ngày 2026/09/21. **Cũ: phán định dựa trên loại chuyến "giao hàng tự công ty". Đổi sang dựa trên final leg ở lần 2 ngày 2026/09/21**). **Phần mà final leg là công ty vận tải giao trực tiếp, chỉ khi khách hàng・công ty giao hàng liên lạc có bất thường mới ghi nhận là báo cáo sự cố và mở mục cần xác nhận (không đổi trạng thái)** (đối tượng coi như hoàn tất・§4C-1. Bổ sung 2026/09/24 [Quyết định v2.3 #20]. Cũ: chuyển sang Đang xác nhận). **Đối tượng phát hiện thiếu giao chỉ là các đơn có `status IN (出荷済, 受取済)` mà không có báo cáo sự cố chưa giải quyết**, phần đang có sự cố do vận hành giải quyết xử lý ([Quyết định v2.3 #25]). Thanh toán theo thực tế nên nếu chưa giao thì không thanh toán |

#### Khi tạm ngừng・hủy hợp đồng con đã trả trước (quyết định 2026/09/19)

Quyết định cách hoàn lại **phần đã thanh toán trước, như trả trước một năm**.

- **Không hủy hợp đồng con đã thanh toán.** Vì nếu xóa thanh toán gốc sau khi phát hành hóa đơn thì đối chiếu bên Bill One sẽ lệch.
- Thay vào đó, ghi nhận bằng **③ Điều chỉnh** (loại thanh toán của hợp đồng con "Điều chỉnh") dưới dạng **hoàn tiền hoặc bù trừ với các kỳ sau**. Khi phê duyệt tạm ngừng・hủy hợp đồng, tự động lập điều chỉnh cho phần chu kỳ tương ứng.
- Đơn vị điều chỉnh là **chu kỳ (hợp đồng con)**. Tạo mỗi 1 bản ghi cho phần chu kỳ bị bỏ qua do tạm ngừng và phần chu kỳ không thực hiện do hủy.
- Chọn hoàn tiền hay bù trừ là **quyết định theo từng doanh nghiệp** nên vận hành chọn khi lập. Mặc định là bù trừ.

#### "③ Điều chỉnh" không làm bảng độc lập (quyết định 2026/09/21・#70)

- **Không giữ điều chỉnh (hoàn tiền・bù trừ) như bảng thứ 3 độc lập.** **Cho phép giữ dòng điều chỉnh (hoàn tiền・bù trừ) bên trong mỗi loại ① Trả trước・② Quyết toán thực tế.**
- Lý do: điều chỉnh luôn xác định rõ là điều chỉnh cho "khoản trả trước nào" "quyết toán thực tế nào", nếu tách ra thì phải giữ lại quan hệ tương ứng riêng. Về mặt hóa đơn, hiển thị trong chi tiết của từng trả trước・quyết toán thực tế cũng dễ đọc hơn.
- Loại thanh toán của hợp đồng con có 2 loại **① Trả trước／② Quyết toán thực tế**, và bên trong có các dòng `adjustment(refund | offset)`.
- Chỗ nào trong tài liệu này viết "③ Điều chỉnh" là chỉ **điều chỉnh trong ① hoặc ②** (hoàn lại khi tạm ngừng・hủy đã trả trước〈như trên〉, sửa thực tế sau khi chốt thanh toán〈§4A-4C〉, phản ánh khi sửa thực tế bằng liên hệ sau giao hàng〈báo cáo sự cố〉〈§4A-4C〉). **(Cũ: "phản ánh khi đưa Đã giao trở lại Đang xác nhận". Sửa đổi do bổ sung 2026/09/24 không còn đưa Đã giao về Đang xác nhận [Quyết định v2.3 #20])**

#### Phân chia hạn phát hành hóa đơn và hạn thanh toán (quyết định 2026/09/15)

**Hai việc này khác nhau và nơi quản lý cũng khác**.

| | Chỉ cái gì | Quản lý ở đâu |
|---|---|---|
| **Hạn phát hành hóa đơn** | Hạn chốt số tiền hợp đồng con, tạo dữ liệu thanh toán và chuyển cho Bill One | **Hệ thống này** (ngày chốt thanh toán = 25 → phát hành cuối tháng) |
| **Hạn thanh toán (hạn nộp tiền)** | Hạn doanh nghiệp thực sự thanh toán số tiền đó (ngày nộp tiền) | **Hệ thống này giữ trong hóa đơn (`invoices.payment_due_date`). 1 hóa đơn = 1 hạn thanh toán** (quyết định lần 2 ngày 2026/09/21). **Nghiệp vụ như đối chiếu nhập tiền do phía Bill One thực hiện** |

**Hạn thanh toán được giữ bằng cách chia hóa đơn (quyết định lần 2 ngày 2026/09/21・cụ thể hóa #71)**

- **Hóa đơn được chia theo `billing_type` (① Trả trước／② Quyết toán thực tế) hoặc `payment_due_date` (hạn thanh toán).**
- **Một hóa đơn chỉ có đúng một hạn thanh toán.** Nếu trả trước và quyết toán thực tế có hạn khác nhau thì làm **2 hóa đơn**.
- **Không chọn phương án chọn một hạn chung.** Vì nếu một hóa đơn ghi 2 hạn thì khi đối chiếu (đối soát) nhập tiền không xác định được khớp với hạn nào.
- Về dữ liệu, dùng `invoices(contract_month_id, billing_type, payment_due_date)` làm khóa chia, và cặp này là duy nhất (§7).
- **(Cũ: lần 1 #71 "Hợp đồng con giữ hạn thanh toán như một mục. Phần trả trước = `advance_payment_due_date`, phần quyết toán thực tế = `settlement_payment_due_date` 2 mục". Cụ thể hóa thành dạng "chia hóa đơn" ở lần 2 ngày 2026/09/21)** Không giữ 2 hạn trong 1 bản ghi mà **chia hóa đơn**.
- **Chỉ giữ giá trị hạn, không quản lý đối chiếu nhập tiền・tình trạng nhập tiền.** Đối chiếu do phía Bill One thực hiện.
- Chức năng về chậm trễ・nhắc nợ cũng không làm trong hệ thống này (như trước).

> Phiên bản cũ (2026/09/15) nói "hệ thống này không có mục hạn thanh toán・ngày nộp tiền・kỳ hạn thanh toán", nhưng vì cần cho việc ghi trên hóa đơn và hiển thị cho doanh nghiệp nên **đã rút lại ngày 2026/09/21**. Chỉ giữ **giá trị hạn**, phần sau đó (đã nhập tiền hay chưa) Bill One là chuẩn.

#### Điều chỉnh đơn giá (quyết định 2026/09/21・#69b)

- **Điều chỉnh đơn giá được giữ bằng điều chỉnh giá của master gói (các thế hệ ①〜④).** Không ghi trực tiếp đơn giá vào phía hợp đồng.
- Khi tạo hợp đồng con, **chụp snapshot giá của thế hệ áp dụng cho tháng chu kỳ đó** (§4A-2B). Ngay cả khi tạo trước như trả trước một năm, cũng lấy thế hệ áp dụng cho từng tháng chu kỳ.
- **Đơn giá sau điều chỉnh cũng ghi vào thanh toán.** Chi tiết thanh toán hiển thị theo dạng biết được thế hệ đã áp dụng.
- Hợp đồng con đã thanh toán không sửa, mà phản ánh vào tháng sau trở đi bằng điều chỉnh trong ① Trả trước・② Quyết toán thực tế (§4A-2B・§4D-1).

> **Cần xác nhận**: **Ngày chốt** thanh toán hiện tại (chốt cuối tháng／chốt ngày 20, v.v.) và phân biệt **trả trước・trả sau**. Khi biết sẽ điều chỉnh phán định trên cho đúng thực tế.

### 4D-2. Số phiếu vận chuyển

- **Về nguyên tắc, ES không đánh số.** Nhận số do công ty giao hàng đánh và giữ (nhập CSV hoặc nhập tay), dùng làm khóa tìm kiếm.
- **Ngoại lệ: với chuyến mà công ty ủy thác đến kho lấy hàng, ES đánh số phiếu vận chuyển dựa trên ID dữ liệu giao hàng** (quyết định 2026/09/21・#55). Chuyến lấy hàng không có đánh số của công ty giao hàng, nên "ES không đánh số" không áp dụng.
  - **Cách tạo (2026/09/29 [Quyết định v2.3 #47])**: `delivery_tracking_numbers.issued_by = es_generated`. Số là **Số giao hàng + số thùng 2 chữ số** (ví dụ: `DL-261020-0021-01`), có `box_no`・`box_total`. **Tại thời điểm gửi chỉ thị xuất hàng thành công, tạo theo số thùng dự kiến**. Nếu số thùng thực tế xuất khác thì thêm phần thiếu, phần thừa chuyển thành `voided`. **Không hiển thị link trang tra cứu**. Bảng phiếu vận chuyển trong chi tiết dữ liệu giao hàng hiển thị "ES đánh số" ở cột "Nơi phát hành".
- **Có hay không không do loại chuyến quyết định mà do có thực sự đi qua công ty giao hàng hay không.** Ngay cả giao hàng tự công ty, nếu có chặng qua Yamato thì có số.
- **Phiếu vận chuyển và dữ liệu giao hàng là 1-nhiều** (quyết định 2026/09/21. Cũ: "nhiều-nhiều" ngày 2026/09/19 đã hủy).
  - **1 dữ liệu giao hàng (xuất hàng) có nhiều số phiếu vận chuyển** (theo từng thùng).
  - **Không có trường hợp 1 phiếu vận chuyển chứa nhiều dữ liệu giao hàng** (= **không có gộp xuất hàng**).
  - `delivery_tracking_numbers` gắn **1-nhiều** vào dữ liệu giao hàng (không làm bảng trung gian).
- Vì **nhận hàng・chuyến giao COOL của ứng dụng tài xế kiểm tra theo đơn vị phiếu vận chuyển**, nên **phải biểu thị được chưa nhận một phần・giao một phần theo đơn vị phiếu vận chuyển**. Nếu làm 1-1 thì không biểu thị được.
- Vì không có gộp xuất hàng nên **đích truy từ phiếu vận chuyển luôn là 1 dữ liệu giao hàng** (quyết định 2026/09/21).
- **Khi nhân bản, con có số mới**. Số của cha giữ ở cha.
- **Con tự động của sự cố trước khi xác nhận không gắn phiếu vận chuyển** (phiếu vận chuyển của cha cũng không sao chép). Sau khi vận hành xác nhận và chuyển sang `出荷待` thì gắn như thông thường (bổ sung 2026/09/24 [Quyết định v2.3 #22・#23]).
- **Không phát hành lại ở điểm trung chuyển** (đã quyết・§3.1B).
- **Khi đổi địa chỉ nơi giao sau chỉ thị xuất hàng, chuyển tất cả phiếu vận chuyển hiện có sang `voided` (vô hiệu), và phát hành lại sau khi chỉ thị xuất hàng phiên bản mới gửi thành công** (quyết định lần 3 ngày 2026/09/22・§4D-4). Vì địa chỉ đã in trên phiếu vận chuyển, nếu chỉ sửa dữ liệu thì sẽ lệch với hàng thật. Dòng đã vô hiệu không xóa mà giữ lại bằng `status = voided` và `voided_reason` (§7).

### 4D-3. Chỉ thị xuất hàng cho Thomas — không có hủy, ghi đè bằng gửi lại

#### Đơn vị và thời điểm xuất (xác nhận 2026/09/19)

Chỉ thị xuất hàng không xuất từng ngày mà **gộp xuất cho 2 tuần**.

| Mục | Nội dung |
|---|---|
| **Đơn vị gộp** | 2 lần: **tuần A + tuần B** và **tuần C + tuần D** (1 chu kỳ = 4 tuần chia nửa) |
| **Thời điểm xuất** | **3 ngày trước** ngày **bắt đầu** của 2 tuần đó (thứ Sáu) |
| **Thay đổi khẩn cấp** | Nếu có thay đổi sau khi xuất thì **xuất bổ sung** (ghi đè bằng gửi lại §4D-3) |
| **Hiển thị trên màn hình** | Trên màn hình dữ liệu giao hàng・lịch・chỉ thị xuất hàng, hiển thị **đã xuất hay chưa** và **ngày giờ・số phiên bản xuất lần cuối** |

- **Lý do hiển thị trên màn hình đã xuất hay chưa là vì có xuất bổ sung.** Nếu không biết trên màn hình đã xuất hay chưa thì sẽ xuất 2 lần hoặc quên xuất.
- `locked` (đã có chỉ thị xuất hàng) là **thời điểm lần gửi xuất gộp này thành công lần đầu** (quyết định lần 2 ngày 2026/09/21). Không phải "ngày trước ngày picking" của từng đơn. **(Cũ: thời điểm xuất gộp. Đổi ở lần 2 ngày 2026/09/21)** Đơn vị và thời điểm xuất gộp quyết định "gửi khi nào", không phải điểm khởi đầu của `locked`.
- **Dù đã gắn số phiếu vận chuyển cũng không thành `locked`** (quyết định lần 2 ngày 2026/09/21). Nếu số phiếu vận chuyển xuất hiện mà không có bản ghi gửi chỉ thị xuất hàng thành công thì **phát hiện là anomaly** và đưa vào cần xác nhận (§4A-3・§11-1 `tracking_anomaly_detect`).
- **Thời gian chờ chỉ thị xuất hàng** của master kho dùng làm giá trị để tính ngày xuất này (mặc định = 3 ngày trước).
- **Điều kiện gửi** (bổ sung 2026/09/24 [Quyết định v2.3 #23]・DEV §10.2): `published`・`出荷待`・số lượng đã xác nhận・**`schedule_confirmed = true` và `quantity_confirmed = true`**・không phải `確認中`／`取消`／`中止`・**không phải `duplicate_type = trouble_pending` chưa giải quyết**・hạn chốt không phải tạm (provisional)・kho và loại giao hàng còn hiệu lực. Con tự động của sự cố trước khi xác nhận không vào chỉ thị xuất hàng.

**Hủy được xác định bằng cách gửi lại (phiên bản mới với số lượng 0)** (2026/09/29 [Quyết định v2.3 #45]). Dù phía Thomas có I/F hủy cũng không dùng. (Cũ: vì không rõ có I/F hủy hay không nên làm cách không phụ thuộc vào hủy)

- **CSV triển khai với các mục tối thiểu theo DEV §19.1, và chỉ phần xuất (thứ tự cột・tên・header・mã hóa ký tự) làm được thay thế**. Khi nhà cung cấp gửi thứ tự・tên cột thì chỉ sửa phần xuất. **Nếu không hỗ trợ UTF-8 thì chuyển sang Shift_JIS khi xuất** (2026/09/29 [Quyết định v2.3 #45]).
- **Các mục chuyển cho Yamato ([Tạm thời] chờ xác nhận với Yamato・2026/09/29 [Quyết định v2.3 #46])**: tên người nhận của giữ tại bưu cục là **công ty giao hàng ủy thác đến nhận**, phần ghi chú là tên cơ sở và Số giao hàng. Ngày giao dự kiến là **ngày hàng đến bưu cục** (tính từ giá trị tham khảo lead time cấp 1). Nếu CSV của Thomas không có cột thì **xuất riêng CSV cho phiếu vận chuyển**.

- Chỉ thị xuất hàng có **số phiên bản (rev)**, tăng mỗi lần gửi lại (`DL-260820-0012 / rev2`). Theo cách **luôn gửi trạng thái mới nhất cho từng số chỉ thị**, để phía bên kia dù nhận theo cách nào cũng thành lập.
- **Khi muốn hủy giao thì gửi lại với "số lượng 0"**. Vì không xóa chính chỉ thị nên dù không có I/F hủy vẫn truyền được.
- ES **giữ "nội dung gửi lần cuối"**, khi có khác biệt với dữ liệu giao hàng thì **tự động đưa "cần gửi lại: N đơn" vào cần xác nhận** (§11-1 `ship_order_diff`). Loại bỏ việc người phải nhớ.
- **Gửi lại được đến khi nhận kết quả xuất hàng của đơn giao đó** (quyết định lần 3 ngày 2026/09/22). Ngay cả sau khi xuất gộp (2 tuần・3 ngày trước ngày bắt đầu), cho đến khi kết quả xuất hàng được trả về vẫn ghi đè được bằng gửi lại. **Khi nhận kết quả xuất hàng thì đóng.** Thay đổi sau đó chuyển sang vận hành bằng điện thoại, bên dữ liệu giao hàng giữ lại bằng hủy bỏ hoặc nhân bản.
- **Hệ thống không giữ thời điểm bắt đầu picking của kho** (quyết định lần 3 ngày 2026/09/22). **(Cũ: gửi lại được đến trước khi bắt đầu picking. Thời điểm bắt đầu đang xác nhận với kho・nhà cung cấp)**
- Lưu ý chốt thanh toán theo mặc định là **tháng dương lịch của ngày giao thực tế** (§4D-1), khác với việc hạn gửi lại.
- Dù gửi lại hay vận hành bằng điện thoại, đều **lưu vào lịch sử thay đổi kèm lý do** (§11-2).

### 4D-4. Thay đổi sau khi gửi chỉ thị xuất hàng (quyết định lần 3 ngày 2026/09/22)

Ngay cả sau khi gửi chỉ thị xuất hàng, **công ty giao hàng ②・nhân viên giao hàng・địa chỉ nơi giao vẫn thay đổi được** (REQ-DL-888〜890). Vì thay đổi gấp thực sự xảy ra nên không áp dụng "vì là `locked` nên không được chạm vào". Tuy nhiên điều kiện là **không để lệch với hàng thật (phiếu vận chuyển)**.

| Cái thay đổi | Cách xử lý | Phiếu vận chuyển | Chỉ thị xuất hàng |
|---|---|---|---|
| **Công ty giao hàng ②・nhân viên giao hàng** (công ty giao hàng・tài xế của chặng) | **Thay đổi được nguyên trạng** | Không chạm | Bật `ship_order_diff` và **gửi lại** |
| **Địa chỉ nơi giao** | **Thay đổi được** (chỉ đơn giao hàng này) | **Chuyển tất cả phiếu vận chuyển hiện có sang `voided`, và phát hành lại sau khi chỉ thị xuất hàng phiên bản mới gửi thành công** | **Xuất chỉ thị xuất hàng `rev` mới** |
| **Kho picking** | **Không thay đổi** | — | Làm lại bằng **hủy bỏ + nhân bản** |
| **Ngày giao・ngày picking** | **Không thay đổi** (sau hạn chốt đơn như §4A-5) | — | **Hủy bỏ + nhân bản** |

- Chỉ đối xử đặc biệt với địa chỉ vì **đã in trên phiếu vận chuyển**.
- **Không thay đổi `locked_at`.** Dù gửi `rev` mới do đổi địa chỉ, điểm khởi đầu của `locked` (lần gửi thành công đầu tiên) vẫn giữ ban đầu.
- Người thao tác được **chỉ vận hành (logistics)**. **Bắt buộc có lý do**, lưu vào lịch sử thay đổi trước → sau và người thao tác. **Dữ liệu giao hàng Đã giao・Hủy giao・Hủy bỏ nằm ngoài đối tượng**.

> **Cần xác nhận**: Thời điểm kho bắt đầu picking trong ngày. Đây là hạn chót thực tế của việc gửi lại (**xác nhận với kho・nhà cung cấp**. Vì không nằm trong danh sách quyết định ngày 2026/09/21 nên không đưa vào §8).

### Yêu cầu (phần quyết định 2026/09/13・đề xuất. Sau khi phê duyệt sẽ đăng ký vào REQ-DL)

| ID | Phân loại | Nội dung | Trạng thái |
|---|---|---|---|
| REQ-DL-653 | Yêu cầu dữ liệu | Dữ liệu giao hàng có phân loại chuyến (giao tự công ty／chuyến công ty vận tải), phản ánh sự khác biệt thông tin lấy được vào màn hình và phán định | Đề xuất |
| REQ-DL-654 | Yêu cầu chức năng | Chuyến công ty vận tải được coi là "**Đã giao (coi như)**" vào ngày sau ngày giao, nếu có báo cáo thì ghi đè bằng nội dung đó. Ghi lại trong dữ liệu việc là coi như | Đề xuất |
| REQ-DL-655 | Yêu cầu dữ liệu | Không giữ trạng thái trung gian của trung chuyển, chỉ giữ sự thật của chỉ thị xuất hàng và hoàn tất giao hàng cuối cùng | Đề xuất |
| REQ-DL-656 | Yêu cầu dữ liệu | Chuyến vật tư gửi trực tiếp từ kho đến Yamato, không có phân công tài xế và các bước làm việc trên ứng dụng. Nhiệt độ thường xử lý giống lạnh | Đề xuất |
| REQ-DL-657 | Yêu cầu dữ liệu | Giữ loại sự cố bằng master 6 phân loại, gắn với mỗi phân loại cách xử lý mặc định của vận hành và **có tạo con tự động đồng thời với báo cáo hay không (`auto_child`)** (bổ sung 2026/09/29 [Quyết định v2.3 #30・#33]). Lựa chọn của ứng dụng được ánh xạ về 6 phân loại bằng bảng đối ứng (`trouble_app_reasons`), cái nào thuộc 2 phân loại thì để loại chưa xác định. Vận hành có thể đăng ký thay | Đề xuất |
| REQ-DL-658 | Yêu cầu kiểm soát | API hoàn tất bắt buộc có khóa idempotent, bỏ qua gửi trùng. Báo cáo chưa gửi được giữ trên thiết bị và gửi lại được | Đề xuất |
| REQ-DL-659 | Yêu cầu phân quyền | Công ty giao hàng ủy thác・tài xế chỉ tham chiếu được dữ liệu giao hàng được phân cho mình, phần quá 90 ngày kể từ khi hoàn tất thì không tham chiếu được | Đề xuất |
| REQ-DL-660 | Yêu cầu chức năng | Thanh toán chốt theo tháng dương lịch của ngày giao, ghi nhận số lượng vào tháng của ngày thực sự giao. Cước giao lại có thể chọn riêng thanh toán／không thanh toán. **Cờ này (`freight_billable`) cũng dùng cho hủy sau khi xuất hàng** (2026/09/29 [Quyết định v2.3 #40]) | Đề xuất |
| REQ-DL-661 | Yêu cầu dữ liệu | Số phiếu vận chuyển về nguyên tắc ES không đánh số mà nhận từ công ty giao hàng và giữ, có thể giữ nhiều số cho 1 dữ liệu giao hàng (**1-nhiều**). **Chỉ chuyến mà công ty ủy thác đến kho lấy hàng thì ES đánh số dựa trên ID dữ liệu giao hàng** (bổ sung 2026/09/21) | Đề xuất |
| REQ-DL-662 | Yêu cầu chức năng | Chỉ thị xuất hàng không có hủy mà ghi đè bằng gửi lại kèm số phiên bản, hủy giao thì gửi lại với số lượng 0. Phát hiện khác biệt giữa nội dung gửi lần cuối và dữ liệu giao hàng rồi đưa vào cần xác nhận | Đề xuất |

### Yêu cầu (phần quyết định 2026/09/19・đề xuất. Sau khi phê duyệt sẽ đăng ký vào REQ-DL)

| ID | Phân loại | Nội dung | Trạng thái |
|---|---|---|---|
| REQ-DL-804 | Yêu cầu dữ liệu | Giữ không xuất được theo khung chu kỳ (A1〜D7), phán định theo khung mà ngày picking thuộc về. Không có chu kỳ riêng chuyên cho xuất hàng | Đề xuất |
| REQ-DL-805 | Yêu cầu màn hình | Khi chọn slot giao hàng ở hợp đồng, tự động vô hiệu hóa các khung không chọn được dựa trên khung không xuất được của kho được phân và lead time của loại giao hàng đó, và hiển thị lý do | Đề xuất |
| REQ-DL-806 | Yêu cầu chức năng | Giao hàng rơi vào ngày không giao được thì dời theo "dời sớm・dời muộn" của hợp đồng. **Không đặt giới hạn số ngày di chuyển**, nếu di chuyển quá 3 ngày so với khung gốc thì đưa vào cần xác nhận | Đề xuất |
| REQ-DL-807 | Yêu cầu chức năng | Ngày tạm ngừng chu kỳ không phân bổ slot và **không tiêu thụ khung**. Khung bị dừng **bắt đầu lại lần lượt từ ngày sau khi hết tạm ngừng**, dời toàn bộ chu kỳ ra sau bằng số ngày tạm ngừng (không giảm số lần giao hàng) | Đề xuất |
| REQ-DL-808 | Yêu cầu màn hình | Khi đăng ký tạm ngừng chu kỳ, xem trước cùng lúc **thời gian tạm ngừng sau khi làm tròn (số ngày điều chỉnh)** và số lịch bị dời ra sau. Cần xác nhận riêng lẻ chỉ là ngoại lệ | Đề xuất |
| REQ-DL-809 | Yêu cầu chức năng | Không tạo cuốn chiếu lịch giao hàng, chỉ tạo phần của khoảng thời gian chỉ định ở cài đặt chu kỳ giao hàng. Tháng chưa thiết lập thì không công khai menu được | Đề xuất |
| REQ-DL-810 | Yêu cầu chức năng | Khi chốt đơn, cơ sở không có đơn hàng chốt theo số lượng chuẩn, cơ sở bật chế độ AI thì AI đặt số lượng. Giữ trong dữ liệu nguồn gốc của số lượng đã chốt | Đề xuất |
| REQ-DL-811 | Yêu cầu kiểm soát | Khi chưa đăng ký menu và không lấy được ngày chốt đơn thì phán định lấy ngày 15 tháng trước làm hạn chốt tạm, hiển thị "Tạm" trên màn hình | Đề xuất |
| REQ-DL-812 | Yêu cầu chức năng | Chỉ thị xuất hàng gộp 2 tuần tuần A+B／tuần C+D, xuất vào 3 ngày trước ngày bắt đầu (thứ Sáu). Hiển thị trên màn hình có đã xuất hay chưa và ngày giờ・số phiên bản xuất lần cuối | Đề xuất |
| REQ-DL-813 | Yêu cầu dữ liệu | Giữ phiếu vận chuyển và dữ liệu giao hàng **1-nhiều** (1 dữ liệu giao hàng có nhiều số phiếu vận chuyển). Không có gộp xuất hàng (1 phiếu vận chuyển chứa nhiều dữ liệu giao hàng). Chỉ chuyến lấy hàng của công ty ủy thác thì ES đánh số dựa trên ID dữ liệu giao hàng | **Hủy・thay thế (2026/09/21)**. Cũ: nhiều-nhiều |
| REQ-DL-814 | Yêu cầu dữ liệu | Trung chuyển chỉ giữ・hiển thị 2 giá trị "có trung chuyển／không", không có trạng thái trung gian. Tình trạng giao hàng lấy ở giai đoạn 3 chỉ hiển thị làm thông tin tham khảo | Đề xuất |
| REQ-DL-815 | Yêu cầu kiểm soát | Chu kỳ đã chốt đơn không là đối tượng hủy hợp đồng, ngày hủy là ngày cuối của chu kỳ. Đang tạm ngừng thì không tạo lịch, tạo khi phê duyệt tiếp tục | Đề xuất |
| REQ-DL-816 | Yêu cầu chức năng | Khi tạm ngừng・hủy hợp đồng con đã trả trước, không hủy thanh toán mà lập hoàn tiền hoặc bù trừ bằng "điều chỉnh" | Đề xuất |
| REQ-DL-817 | Yêu cầu chức năng | Khi ngày lễ・ngày không xuất được được thêm sau hạn chốt đơn, **nếu còn đến trước ngày xuất hàng thì vận hành đổi ngày từng đơn từ "Chỉnh sửa" trong chi tiết dữ liệu giao hàng** (cùng nửa đầu／nửa sau của cùng chu kỳ・bắt buộc lý do). Từ ngày xuất hàng trở đi thì hủy bỏ + nhân bản (sửa đổi 2026/09/29 [Quyết định v2.3 #63]. Cũ: không đổi ngày của dữ liệu giao hàng đó mà làm lại bằng hủy bỏ + nhân bản 〈quyết định lần 3 ngày 2026/09/22〉. Cũ hơn: chỉ trước `locked`, chỉ vận hành, từng đơn, bắt buộc lý do) | Đã sửa đổi (2026/09/29) |
| REQ-DL-818 | Yêu cầu hiển thị | Loại giao vật tư khỏi phán định・hiển thị ngưỡng số đơn trong 1 ngày. Không hiển thị Chủ nhật・Thứ bảy là cố định không xuất được・không nhận được | Đề xuất |
| REQ-DL-886 | Yêu cầu kiểm soát | Việc có được đổi ngày của dữ liệu giao hàng hay không phán định theo **hạn chốt đơn (`order_close_date`)・ngày xuất hàng dự kiến・chu kỳ・tuần của khung (A〜D)**, không phán định bằng `locked_at`. Sau hạn chốt chỉ cho UPDATE khi thỏa ① đến trước ngày xuất hàng ② cùng chu kỳ・cùng nửa đầu／nửa sau ③ 1 đơn ④ có lý do (sửa đổi 2026/09/29 [Quyết định v2.3 #63]. Cũ: sau hạn chốt không có nhánh ngoại lệ cho vận hành, từ chối UPDATE ngày 〈quyết định lần 3 ngày 2026/09/22〉) | Đã sửa đổi (2026/09/29) |
| REQ-DL-819 | Yêu cầu chức năng | **Không lưu được nếu tổng số ngày của 1 lần tạm ngừng (`normal` + `adjust` gắn với nó) không phải bội số của 7**. Số ngày thiếu `7 −（số ngày tạm ngừng mod 7）` do hệ thống tính và **chỉ hiển thị**, **không tự động chèn**. **Quản trị viên quyết định chỗ đặt ngày điều chỉnh và sửa lại được sau**. Làm tròn tính từ ngày đầu của tạm ngừng chứ không phải tuần dương lịch (sửa đổi theo quyết định lần 3 ngày 2026/09/22. Cũ: tự động thêm ngày tạm ngừng chu kỳ điều chỉnh ngay sau tạm ngừng) | Đã quyết (2026/09/22) |
| REQ-DL-820 | Yêu cầu dữ liệu | Giữ tạm ngừng chu kỳ điều chỉnh với phân loại ("Điều chỉnh") phân biệt được với tạm ngừng thông thường, **giữ `adjust_for_pause_id` cho biết bù cho tạm ngừng nào**. Hiển thị phân biệt trong lịch・lịch sử thay đổi (thêm `adjust_for_pause_id` theo quyết định lần 3 ngày 2026/09/22) | Đã quyết (2026/09/22) |
| REQ-DL-821 | Yêu cầu màn hình | Giá trị khởi tạo của tháng bắt đầu khoảng thời gian đối tượng thiết lập là "tháng đầu tiên chưa thiết lập" (nếu có khoảng trống thì tháng đầu của khoảng trống, nếu không thì tháng sau tháng cuối cùng đã thiết lập). Tháng sau nữa không phải giá trị khởi tạo mà là cận dưới của lựa chọn | Đề xuất |
| REQ-DL-822 | Yêu cầu màn hình | Khi bấm một tháng trong dải tình trạng thiết lập ở §2.0B thì tháng bắt đầu khoảng thời gian đối tượng thiết lập chuyển sang tháng đó | Đề xuất |
| REQ-DL-823 | Yêu cầu màn hình | Khi khoảng thời gian đối tượng thiết lập có chứa tháng đã thiết lập, xem trước trước khi lưu nêu rõ tháng tương ứng và nội dung "tạo lại lịch giao hàng" | Đề xuất |
| REQ-DL-824 | Yêu cầu kiểm soát | Tự động dời ngày ưu tiên ① ngày nằm trong lead time thực = lead time hợp đồng (chênh 0), ② chỉ khi không có ngày phù hợp thì cho phép chênh +1 ngày, ③ nếu cũng không có thì chọn cặp chênh nhỏ nhất và đưa vào cần xác nhận. ② để lại dấu "bất đắc dĩ +1 ngày (trong phạm vi cho phép)" | Đã quyết (2026/09/21) |
| REQ-DL-825 | Yêu cầu kiểm soát | Dời ngày lễ・không nhận được của lần bị lệch khung do tạm ngừng chu kỳ chỉ tìm về phía sau, không quay lại ngày trước thời gian tạm ngừng (nếu ngày chỉ định riêng rơi vào tạm ngừng thì theo "dời sớm・dời muộn" của hợp đồng) | Đã quyết (2026/09/21) |
| REQ-DL-826 | Yêu cầu dữ liệu | Chia tài liệu đính kèm thành "tài liệu của địa điểm" (sơ đồ đường vào・hướng dẫn gắn với master cơ sở・điểm trung chuyển) và "tài liệu của đơn giao này" (ảnh báo cáo gắn với dữ liệu giao hàng). Tài liệu của địa điểm không sao chép vào dữ liệu giao hàng mà hiển thị bằng tham chiếu, chỉ thay thế được ở phía master | Đã quyết (2026/09/21) |
| REQ-DL-827 | Yêu cầu màn hình | Trong bảng tuyến giao hàng của chi tiết dữ liệu xuất・giao hàng không đặt nội dung tài liệu, đặt tên cột là "Đường vào", chỉ hiển thị số tài liệu của địa điểm đó và lối dẫn đến tab "Tài liệu đính kèm" | Đã quyết (2026/09/21) |
| REQ-DL-828 | Yêu cầu màn hình | Ô của hiển thị tháng trên **Web vận hành** không hiển thị thẻ trạng thái "Đã xác định" "Dự kiến" (dự kiến thể hiện bằng khung viền và số đơn). Tiêu đề nhóm của hiển thị tuần chỉ hiển thị khi là dự kiến (ngoại lệ) và phần của chu kỳ khác. **Lịch của Web doanh nghiệp giữ dấu "Dự kiến"** (bổ sung 2026/09/21・#77) | Đã quyết (2026/09/21) |

---

## 5. Màn hình 03/04/05 — Hiển thị kết quả tạo

### 5.0 Vòng đời chu kỳ và chế độ đổi ngày (chốt 2026/09/14)

#### 3 giai đoạn theo từng chu kỳ (sửa đổi 2026/09/18)

Mỗi chu kỳ tiến theo thứ tự sau. **Công bố menu và bắt đầu đặt hàng là cùng một ngày (mặc định là ngày 1 tháng trước)** nên không giữ giai đoạn "từ công bố menu đến trước khi bắt đầu đặt hàng" của phiên bản cũ.

```
Thiết lập lịch (đang đăng ký menu) → Công bố menu・bắt đầu đặt hàng → Chốt đơn
```

| Giai đoạn | Ý nghĩa |
|---|---|
| Thiết lập lịch (đang đăng ký menu) | Tạo ngày giao của chu kỳ này ở cài đặt chu kỳ giao hàng và đăng ký menu. Chưa công khai ra ngoài |
| Công bố menu・bắt đầu đặt hàng | Cùng lúc công bố bắt đầu nhận đơn. **Ngày này tạo xác định dữ liệu giao hàng**. **Từ đó cài đặt chu kỳ giao hàng của chu kỳ này không thay đổi được** (§2.0C-2) |
| Chốt đơn | **Số lượng được chốt, đồng thời việc nhận đổi ngày cũng kết thúc**. Sau đó chuyển sang chỉ thị xuất hàng |

**Ký hiệu timeline trên màn hình** (dải của màn hình lịch・2026/09/18)

| # | Ký hiệu | Ví dụ (chu kỳ tháng 9/2026) |
|---|---|---|
| 1 | Thiết lập lịch | — |
| 2 | Đăng ký menu〜〈ngày công bố〉 | Đăng ký menu〜2026-08-01 |
| 3 | Công bố menu・bắt đầu đặt hàng 〈ngày công bố〉〜 | Công bố menu・bắt đầu đặt hàng 2026-08-01〜 |
| 4 | Chốt đơn 〈ngày chốt〉 | Chốt đơn 2026-08-15 |

#### Ngày cột mốc

Ngày cột mốc **phía menu là chuẩn** (sửa đổi 2026/09/15. Chi tiết §4A-2). **Khi tạo chu kỳ, sao chép ngày thực của phía menu, giữ và hiển thị trên màn hình** (quyết định 2026/09/21. Cũ: "phía chu kỳ giao hàng không giữ").

| Cột mốc | Nguồn | Giá trị mặc định của demo |
|---|---|---|
| **Công bố menu = bắt đầu đặt hàng** | **Phía menu (bắt đầu thời gian đặt hàng)** | **Ngày 1 tháng trước** |
| (Đăng ký menu) | Phía menu | Đến ngày công bố (〜ngày 1 tháng trước) |
| **Chốt đơn** | **Phía menu (kết thúc thời gian đặt hàng)** | **Ngày 15 tháng trước** |

> **Đã bãi bỏ hạn chót thay đổi** (2026/09/15). Thời điểm kết thúc nhận đổi ngày giống chốt đơn.

> **Giá trị mặc định của demo là ngày 1 tháng trước〜ngày 15 tháng trước**. Giá trị vận hành thực tế theo cài đặt phía menu (§8 Cần xác nhận). **Khi triển khai không dùng ngày cố định mà nhất định phải tham chiếu ngày thực của phía menu.**
> Vì chu kỳ (4 tuần) và menu (tháng dương lịch) có chu kỳ khác nhau, nên dùng **menu của tháng chu kỳ** làm cột mốc của chu kỳ đó.

**Ví dụ: chu kỳ tháng 9/2026 (A1 = 2026-08-31)**

| Cột mốc | Ngày |
|---|---|
| Công bố menu | 2026-07-01 |
| Bắt đầu đặt hàng | 2026-08-01 |
| Chốt đơn | 2026-08-15 (chốt số lượng + kết thúc đổi ngày) |

#### Chế độ đổi ngày

Ở màn hình lịch giao hàng (05) và màn hình lịch picking (04), có thể di chuyển từng ngày riêng lẻ trên màn hình. Tuy nhiên **không phải lúc nào cũng được di chuyển**. Lịch đã qua hạn chốt đơn thì số lượng đã chốt và chuyển sang chỉ thị xuất hàng, nên nếu bị di chuyển tùy tiện từ màn hình thì vận hành sẽ hỏng. Mặt khác, ở giai đoạn trước khi tạo dữ liệu giao hàng thì chưa có gì chốt nên di chuyển tự do được.

Vì vậy **gộp việc có di chuyển được ngày hay không thành một công tắc "chế độ đổi ngày"**, **tự động chuyển đổi theo giai đoạn của chu kỳ và quyền của người thao tác**.

| Giai đoạn | Quản trị viên vận hành (chế độ đổi ngày của màn hình lịch) | Đổi 1 đơn từ chi tiết dữ liệu giao hàng (màn hình 06) |
|---|---|---|
| Thiết lập lịch | **BẬT cố định・không TẮT được** | Được (lý do tùy chọn) |
| Từ bắt đầu đặt hàng đến trước chốt đơn | Ban đầu TẮT・BẬT/TẮT được | Được (lý do tùy chọn) |
| **Sau chốt đơn** | **TẮT cố định・không BẬT được** (không di chuyển được từ màn hình lịch) | **Không được.** Không đổi ngày mà xử lý bằng hủy bỏ + nhân bản (quyết định lần 3 ngày 2026/09/22・§4A-5・§4A-4B) |

> **Sau chốt đơn không thể thao tác hàng loạt・kéo thả ở màn hình lịch (04・05). Đến trước ngày xuất hàng có thể đổi từng đơn từ "Chỉnh sửa" trong chi tiết dữ liệu giao hàng** (cùng nửa đầu／nửa sau của cùng chu kỳ・bắt buộc lý do). Phần tăng thêm ngày lễ・ngày không xuất được về sau cũng sửa bằng cách này (thay đổi 2026/09/29 [Quyết định v2.3 #63]. Cũ: sau chốt đơn không di chuyển ngày được từ màn hình・hủy bỏ + nhân bản 〈quyết định lần 3 ngày 2026/09/22〉). **(Cũ: trước `locked`, "chỉ riêng đổi 1 đơn từ chi tiết dữ liệu giao hàng giữ lại cho vận hành" 〈chỉ vận hành・từng đơn・bắt buộc lý do・chỉ bản ghi cần xác nhận〉. Quyết định lần 2 ngày 2026/09/21 bị hủy bởi quyết định lần 3 ngày 2026/09/22)**

> **Vai trò chỉ có quản trị viên vận hành** (quyết định lần 2 ngày 2026/09/21). **Không tồn tại vai trò `Quản trị viên kho`** (REQ-DL-680). Vì kho không có màn hình trong hệ thống nên xem màn hình 04・05 và di chuyển ngày đều là quản trị viên vận hành. **Tab kho trên màn hình chỉ là lọc dữ liệu, không phải đơn vị quyền** (§11-3).

> **Đã xóa dòng "từ công bố menu đến trước khi bắt đầu đặt hàng"** (2026/09/21). Công bố menu và bắt đầu đặt hàng là cùng ngày (mặc định: ngày 1 tháng trước) nên giai đoạn này không tồn tại (§5.0 phần đầu・REQ-DL-757).

#### Lý do và nội dung hiển thị trên màn hình theo từng giai đoạn

| Giai đoạn | Lý do | Nội dung hiển thị trên màn hình |
|---|---|---|
| Thiết lập lịch | Chưa có dữ liệu giao hàng, đang ở giai đoạn dự kiến (draft). Chưa chốt gì nên di chuyển tự do được. Không có ý nghĩa gì khi TẮT | `Chưa có dữ liệu giao hàng (dự kiến công bố menu YYYY-MM-DD). Vì đang ở giai đoạn dự kiến nên di chuyển ngày tự do được. Không TẮT được.` |
| Từ bắt đầu đặt hàng đến trước chốt đơn | Đơn hàng bắt đầu vào. Di chuyển được nhưng mặc định TẮT để tránh thao tác nhầm | `Đang nhận đặt hàng (YYYY-MM-DD〜YYYY-MM-DD). Ban đầu TẮT để tránh thao tác nhầm. Chỉ BẬT khi thay đổi.` |
| Sau chốt đơn | Số lượng đã chốt, chuyển sang chỉ thị xuất hàng. **Không di chuyển ngày được từ màn hình lịch**. Đến trước ngày xuất hàng thì từng đơn từ "Chỉnh sửa" trong chi tiết dữ liệu giao hàng (bắt buộc lý do) (thay đổi 2026/09/29 [Quyết định v2.3 #63]. Cũ: từ chi tiết dữ liệu giao hàng cũng không di chuyển được) | `Đã quá chốt đơn (…). Không di chuyển được từ màn hình lịch. Đến trước ngày xuất hàng có thể đổi từng đơn từ "Chỉnh sửa" trong chi tiết dữ liệu giao hàng (cùng nửa đầu／nửa sau của cùng chu kỳ・bắt buộc lý do).` |

> Câu "vận hành・kho đều không di chuyển được ngày từ màn hình" trong văn bản phiên bản cũ không dùng vì **không tồn tại vai trò `Quản trị viên kho`** (quyết định lần 2 ngày 2026/09/21・§11-3). Dòng cũ tách văn bản trước/sau `locked` cũng đã **gộp thành 1 dòng vì cột mốc đổi ngày chỉ còn một là chốt đơn** (quyết định lần 3 ngày 2026/09/22).

- Giai đoạn của chu kỳ được phán định **theo từng tháng đối tượng**. Khi chuyển tháng thì khả năng của chế độ cũng chuyển theo.
- Ở trạng thái cố định (BẬT cố định・TẮT cố định) không cho thao tác công tắc. Nếu bấm thì trả lý do bằng toast.
- Bên cạnh công tắc hiển thị trạng thái hiện tại (`BẬT cố định` / `Chuyển đổi được` / `Chuyển đổi được (chỉ vận hành)` / `TẮT cố định`) và tên giai đoạn.
- Màn hình luôn hiển thị **timeline** (4 ký hiệu = Thiết lập lịch／Đăng ký menu〜／Công bố menu・bắt đầu đặt hàng〜／Chốt đơn, hiện đang ở đâu) (theo ký hiệu ở §5).

#### Thao tác khi BẬT

- Hiển thị **nút đổi ngày** ở dòng chi tiết. Khi bấm, hiển thị chi tiết đối tượng (doanh nghiệp・số giao hàng・số lượng) và ngày hiện tại, **chọn ngày mới trong cùng tháng**.
- **Ngày tạm ngừng chu kỳ** không chọn được (vô hiệu hóa). **Không chỉ ngày bên di chuyển mà cả ngày kia di chuyển cùng cũng được phán định** (sửa đổi 2026/09/17).
  - Ngày giao: ngày không giao được theo thứ・ngày xử lý như ngày lễ giao hàng・tạm ngừng chu kỳ・chu kỳ khác・ngày quá khứ
  - Ngày picking: ngày không xuất được・tạm ngừng chu kỳ・ngày quá khứ (dữ liệu giao hàng cũng không được từ hôm nay trở về trước)
  - Ứng viên rơi vào một trong hai thì vô hiệu hóa và hiển thị lý do (ví dụ: `Ngày giao 10/25 (CN): thứ không giao được: Chủ nhật`). Dòng ứng viên ghi kèm ngày kia (ví dụ: `10/26 (Hai)… giao 10/27 (Ba)`).
- **Khi di chuyển ngày ở màn hình lịch, ngày picking và ngày giao di chuyển cùng nhau giữ lead time** (sửa đổi 2026/09/17. Cũ: ở màn hình 04 di chuyển ngày picking cũng không di chuyển ngày giao).

| Ngày đã di chuyển | Ngày còn lại | Nếu ngày còn lại không được |
|---|---|---|
| Ngày giao (màn hình 05・"Giao hàng" của lịch vận hành) | Ngày picking = ngày giao mới − lead time | Nếu là ngày không xuất được thì **dời sớm về ngày xuất được trước đó** (giống §4.4 khi tạo) |
| Ngày picking (màn hình 04・"Xuất hàng" của lịch vận hành) | Ngày giao = ngày picking mới + lead time | Nếu không nhận được・xử lý như ngày lễ giao hàng・tạm ngừng chu kỳ・chu kỳ khác thì **không chọn được ứng viên đó** (không tự động dời ngày giao) |

  - Lead time ở đây là **giá trị đang có hiệu lực với dữ liệu giao hàng đó**. Thông thường là giá trị của loại giao hàng trong hợp đồng, nếu chỉ định riêng ở chi tiết dữ liệu giao hàng thì là giá trị đó (§4A-4D).
  - Khi di chuyển nhiều đơn cùng lúc cũng tính từng đơn với lead time riêng.
- **Khi đổi lead time và chỉ định riêng ngày picking và ngày giao thì thực hiện bằng "Chỉ định ngày riêng" ở chi tiết dữ liệu giao hàng (màn hình 06)** (§4A-4D). Không thực hiện bằng đổi ngày ở màn hình lịch. Màn hình đích hướng dẫn "Lead time N ngày. Nếu chỉ định riêng thì thực hiện ở chi tiết dữ liệu giao hàng", và khi chỉ chọn 1 đơn thì hiển thị link đến chi tiết.
- Dòng đã thay đổi gắn huy hiệu "Đã đổi", ngày gốc hiển thị bằng tooltip. Có thao tác **hoàn nguyên**.
- Thay đổi ghi vào **lịch sử thay đổi** (khi nào・ai・ở đâu・cái gì・số đơn bị ảnh hưởng).

### 5.1 Màn hình 03 Danh sách lịch xuất hàng

| Cột | Nội dung |
|---|---|
| Chu kỳ đối tượng | `Chu kỳ giao hàng tháng 8 năm 2026` |
| Giao hàng | `Giao hàng 1` / `Giao hàng 2` (khi giao nhiều lần) |
| Slot giao hàng | `B3` v.v. Ở chế độ special là "Chỉ định riêng" + hiển thị tham khảo slot của ngày đó |
| **Ngày giao 〔chuẩn〕** | Khi dời ngày hiển thị `ngày gốc (gạch ngang) → ngày chốt`. Cột có huy hiệu chuẩn và màu nền |
| Lead time | Giá trị cài đặt |
| Ngày picking 〔tính ngược〕 | Khi dời ngày ghi giống trên |
| Số lượng | Số lượng sau khi phân bổ |
| Trạng thái | `Dự kiến (draft)` / `Đã xác định (published)` / `locked`. Từ khi xác định trở đi không là đối tượng tính lại (§4A-3) |
| Phán định | Pill ở §4.5 |
| Kho → Giao hàng | `Kho → Điểm trung chuyển → Công ty giao hàng ⟨phát hành số theo dõi⟩` |

Dòng theo thứ tự tăng dần của ngày giao.

### 5.2 Màn hình 04 Lịch picking (quản trị viên vận hành)

- Lịch tháng (7 cột). Tổng hợp theo **ngày picking**. **Lọc được theo kho** (mặc định là kho mình phụ trách. Vì kho được phân khác nhau theo từng cơ sở, nếu vượt qua nhiều kho thì không đọc ra được lý do ngày không xuất được).
- Trong ô: ngày, tên ngày lễ (tự động hiển thị), slot giao hàng của ngày đó, tổng số lượng, thanh số lượng, dòng hợp đồng `Tên hợp đồng#số giao hàng số lượng →đến M/D`
- Ngày không xuất được là khung nét đứt màu tím (`Không xuất được`), thời gian tạm ngừng màu vàng (`Tạm ngừng`). Ngày xử lý như ngày lễ giao hàng thì vẫn picking được. Ô không được hiển thị **lý do**.
- **Cảnh báo ngày có số đơn trong 1 ngày vượt ngưỡng** (quyết định 2026/09/12). Không dừng xử lý ở mức giới hạn mà thể hiện ngày vượt bằng khung viền và số đơn, vận hành tự phán đoán. Phán định bằng **số đơn** chứ không phải số suất ăn. **Giao vật tư không tính vào số đơn** (quyết định 2026/09/19. Vì gửi thẳng từ kho đến Yamato, công sức picking không giống thực phẩm). Loại khỏi cả hiển thị số đơn trên màn hình lẫn phán định vượt, dòng vật tư hiển thị ở danh sách nhưng không đếm vào số đơn.
- Màn hình chuyển bằng **tab kho**, hiển thị số đơn tháng và số ngày vượt cho từng tab. **Ngưỡng đặt theo từng kho** (vì năng lực xử lý của kho khác nhau).
- **Tab kho chỉ là lọc dữ liệu, không phải đơn vị quyền** (quyết định lần 2 ngày 2026/09/21). Dù chuyển tab, phạm vi thao tác được không đổi. **Không tồn tại vai trò `Quản trị viên kho`**, xem màn hình 04・05 và di chuyển ngày đều là vận hành (§11-3). **Giá trị ban đầu 300 đơn／ngày** (quyết định 2026/09/14. Vì số đơn xử lý 1 ngày khoảng 300 đơn. Đổi từ giá trị cũ 150 đơn). Dù vượt **hệ thống cũng không làm gì** — vận hành tự điều chỉnh ngày bằng tay.
- Phía dưới là danh sách hợp đồng (cách xác định ngày giao / số lượng gói / quy tắc ngày không giao được / số lần picking trong tháng / số lần giao hàng trong tháng).

**Danh sách picking chỉ xác nhận trên màn hình quản lý (quyết định 2026/09/21・#50)**

- Nội dung picking **xác nhận ở màn hình này (04) và modal danh sách theo ngày**. **Không làm xuất PDF** (REQ-DL-103 "tự động tạo danh sách picking dạng PDF" **bị hủy**).
- Vì chỉ thị cho kho được chuyển bằng **CSV chỉ thị xuất hàng cho Thomas** (§4D-3), nên không cần xuất danh sách giấy từ hệ thống.
- Từ màn hình chỉ lấy được đến **xuất CSV** (xuất CSV của modal danh sách theo ngày・Phụ lục A-2).

### 5.3 Màn hình 05 Lịch giao hàng (quản lý giao hàng・kinh doanh)

- Chế độ xem khác tổng hợp cùng dữ liệu với 04 theo **ngày giao**. Cũng **lọc được theo kho**.
- Dòng hợp đồng trong ô là `Tên hợp đồng#số giao hàng số lượng ←xuất M/D` (ngày picking tương ứng).
- Trong thời gian tạm ngừng không có giao hàng nào. Ngày xử lý như ngày lễ giao hàng được phán định theo từng hợp đồng nên lịch của công ty có thể giao ngày lễ vẫn được hiển thị.
- **Ngày không xuất được có thể gây dời ngày giao** (sửa đổi 2026/09/21. Cũ: "không đổi ngày giao nên chỉ là chú giải tham khảo"). Nếu việc dời sớm ngày picking khiến không nằm trong chênh 0 của lead time hợp đồng thì ngày giao cũng di chuyển, nên cũng hiển thị trên lịch giao hàng làm lý do dời.
- **Không vẽ Chủ nhật cố định là "không xuất được" "không nhận được"** (quyết định 2026/09/19). Chủ nhật nghỉ là vì **được cài đặt như vậy theo mặc định** chứ không phải cố định theo đặc tả. Ở bất kỳ hiển thị nào của lịch・lịch trình・ngày ứng viên, không quyết định cứng theo thứ, mà phán định bằng xem **khung không xuất được của kho đó** và **thứ không giao được của hợp đồng đó** (§2.3・§3.1). Thứ Bảy cũng xử lý như vậy.
- **Trung chuyển chỉ hiển thị "có trung chuyển／không"** (quyết định 2026/09/19・§4A-3B). Không hiển thị trạng thái trung gian như đang trung chuyển・đã trung chuyển ở cột lẫn chú giải.

#### Điều kiện tìm kiếm của màn hình lịch (quyết định 2026/09/18)

Lịch (tháng・tuần・ngày) và quản lý xuất・giao hàng (danh sách) dùng **cùng điều kiện tìm kiếm**. Hàng trên là 2 từ khóa, hàng dưới là điều kiện chi tiết thu gọn được, mỗi mục của điều kiện chi tiết hiển thị nhãn ở lựa chọn đầu.

| # | Mục | Kiểu | Giá trị |
|---|---|---|---|
| 1 | **Số giao hàng・ID dự kiến**, ID・tên doanh nghiệp, ID・tên cơ sở, ID hợp đồng | text | Khớp một phần. Bao gồm cả số nhánh của nhân bản (`DL-…-1`) |
| 2 | Địa chỉ nơi giao, mã bưu điện, số điện thoại, số điện thoại người phụ trách | text | Khớp một phần |
| 3 | Course | select | Light／Standard |
| 4 | Trạng thái | select | Chờ xuất hàng／Đã xuất hàng／Đã nhận／Đã giao／Đã giao một phần／Chờ giao lại／Đang xác nhận／Hủy giao／Hủy bỏ (§4A-3B) |
| 5 | Máy bán hàng tự động | select | Có／Không |
| 6 | Mẫu giao hàng | select | **Chu kỳ／Special** (= cách xác định ngày giao・§3.3) + **Giao hàng theo lần** (chỉ vật tư・2026/09/21・#24) |
| 7 | Loại chuyến | select | **Chuyến giao ES／Chuyến giao COOL／Chuyến vật tư** (§4C-3. Có trung chuyển hay không xem ở điều kiện "Kho trung chuyển") |
| 8 | Số lần giao hàng | select | 1 lần／tháng・2 lần／tháng・4 lần／tháng |
| 9 | Kho picking | select | Master kho (loại kho = picking) |
| 10 | Công ty giao hàng ủy thác | select | Master công ty giao hàng |
| 11 | Kho trung chuyển | select | Master kho (loại kho = điểm trung chuyển) |
| 12 | Số phiếu vận chuyển | text | Khớp một phần |
| 13 | Tình trạng phân công | select | Đã phân công／Chưa phân công |
| 14 | ID・tên nhân viên giao hàng | text | Khớp một phần (bỏ qua khoảng trắng). Không dùng (vô hiệu hóa) khi tình trạng phân công = chưa phân công |

- **Trạng thái chỉ dữ liệu giao hàng mới có** (dự kiến không có trạng thái・§4A-3B). Khi chọn trạng thái ở màn hình lịch thì không hiển thị dự kiến trong kết quả. Ghi rõ điều đó trên màn hình.
- Khi lọc theo kho, "Nghỉ: xuất hàng" trong lịch cũng phán định theo điều kiện hoạt động của kho đó.
- Số phiếu vận chuyển được gắn sau khi xuất hàng nên dữ liệu giao hàng trước khi xuất hàng nằm ngoài đối tượng.
- **Khi tìm theo Số giao hàng mà ra 0 đơn thì hiển thị lối tìm lại bằng cách bỏ điều kiện thời gian.** Vì khi dán số để tìm thì không để ý đến thời gian, nên không biết lý do 0 đơn là "không có" hay "ngoài thời gian".
- **Chưa phân công không tìm được bằng tên nên giữ tình trạng phân công như một điều kiện độc lập.** Tài xế do công ty giao hàng ủy thác phân công từ 1 tuần trước đến ngày trước ngày giao (§4B-4), nên cần tìm được dữ liệu giao hàng trước khi phân công kết hợp với kho・thời gian.
- **Tình trạng phân công cũng chỉ dữ liệu giao hàng mới có.** Dự kiến nằm ngoài đối tượng phân công nên dù chọn chưa phân công hay đã phân công thì dự kiến cũng không hiển thị trong kết quả.

### 5.3C Thứ tự sắp xếp của hiển thị ngày và cần xử lý (thêm 2026/09/18)

Định nghĩa ở đây nội dung từng viết thành văn bản giải thích trên màn hình. **Phía màn hình không đặt giải thích mà chỉ hiển thị số đơn.**

**Thứ tự sắp xếp**

Sắp xếp theo thứ tự `Chu kỳ` → `Cần xử lý` → `Tên doanh nghiệp・tên cơ sở`. Trong cần xử lý theo thứ tự `Đơn đề nghị thay đổi` → `Chưa thiết lập tài xế`. Dòng cần xử lý đổi màu nền để dễ tìm.

**Điều kiện cần xử lý**

| Điều kiện | Khi nào thành cần xử lý |
|---|---|
| Đơn đề nghị thay đổi | Có đơn đề nghị thay đổi chưa xử lý (trước hạn chốt đơn) |
| Đến hạn đơn đề nghị thay đổi | Đang đề nghị・đang đề xuất mà đã quá **3 ngày trước hạn chốt đơn** (`change_request_warn_days`・mặc định 3 ngày). Sau hạn chốt vẫn còn đến khi vận hành xử lý (`review_items.kind = change_request_due`・§4A-3B・2026/09/29 [Quyết định v2.3 #37]) |
| Chú ý hạn sử dụng | Có sản phẩm mà số ngày từ ngày xuất hàng đến ngày giao > số ngày hạn sử dụng của sản phẩm − số ngày an toàn (`shelf_life_safety_days`・mặc định 2 ngày) (`review_items.kind = shelf_life_warning`・§4A-5・2026/09/29 [Quyết định v2.3 #35]) |
| Chưa thiết lập tài xế | **Chặng cần phân công (chặng do công ty mình・ủy thác chạy・§4B-1) mà đến ngày trước・ngày giao vẫn chưa thiết lập／đã qua ngày giao／đã xuất hàng mà chưa thiết lập**. Cần xác nhận `assignment_missing` thống nhất thành 1 lần **vào ngày trước ngày giao** (2026/09/29 [Quyết định v2.3 #43・#48]) |
| Vượt lead time | Lead time thực − lead time hợp đồng > 1 ngày (§4.4) |
| Di chuyển ngày giao | Di chuyển quá 3 ngày so với khung gốc (§4.5) |
| Đang xác nhận (số còn lại・giao lại) | Nhân bản giao từng phần・giao lại vẫn đang chờ xác nhận (§4A-4C) |
| Báo cáo sự cố (chưa giải quyết) | Đơn giao hàng có báo cáo sự cố chưa giải quyết (`review_items.kind = trouble_open`・đối tượng là đơn giao hàng・§4A-4B・bổ sung 2026/09/29 [Quyết định v2.3 #30]). Loại không tạo con tự động (sai lệch số lượng・chậm trễ・khác・loại chưa xác định) cũng được đăng ở đây |
| Con tự động của sự cố | Con được tự động tạo đồng thời với báo cáo sự cố vẫn đang chờ vận hành xác nhận (`review_items.kind = trouble_auto_child_pending`・§4A-4C・bổ sung 2026/09/24 [Quyết định v2.3 #22]・bổ sung 2026/09/29 [Quyết định v2.3 #30]. Cũ: con được tự động tạo khi quá hạn. Bãi bỏ 2026/09/29) |

**Lý do tính chưa thiết lập tài xế từ ngày trước**

Tài xế do **công ty giao hàng ủy thác phân công** (§4B-4・REQ-DL-149・REQ-DL-642). Thông thường được gắn trong **khoảng từ 1 tuần trước đến ngày trước ngày giao**, nên chưa thiết lập khi còn 2〜7 ngày đến ngày giao là bình thường, không tính vào cần xử lý. Giai đoạn này hiển thị phân biệt là "chờ phân công". Vận hành không phải bên phân công mà là bên **phát hiện việc đến ngày trước vẫn chưa được gắn**.

**Không hiển thị dấu đã điều chỉnh ở hiển thị tháng (quyết định 2026/09/18)**

Hiển thị tháng là màn hình chỉ xếp số đơn vào ô, không đọc ra được hoàn cảnh từng đơn (vì sao là ngày đó). Xếp dấu cũng chỉ tăng số lượng nên không hiển thị. **Hiển thị tuần・ngày hiện dấu theo từng dòng, ở danh sách và chi tiết dữ liệu giao hàng hiện dưới dạng giá trị ở cột・trường đơn đề nghị thay đổi.**

**Không chồng cùng thông tin lên header (quyết định 2026/09/18)**

Header của hiển thị ngày theo thứ tự từ trên: ① thanh công cụ (ngày) ② tab (số đơn xuất／giao) ③ dải chu kỳ (tên chu kỳ・cột mốc・lý do cố định chế độ đổi ngày) ④ tiêu đề ngày (khung・ngày lễ／tạm ngừng chỉ riêng ngày đó・hôm trước hôm sau), **không hiển thị cùng một giá trị ở 2 chỗ**. Ngày ở thanh công cụ, số đơn ở tab, tên chu kỳ ở dải nên tiêu đề ngày không lặp lại. Thời gian của chu kỳ・mã tuần・thời gian tạm ngừng **chỉ hiển thị ở hiển thị tuần** (ở hiển thị ngày thì khung thể hiện tuần và thứ). Dấu trạng thái của dải **chỉ hiện khi là ngoại lệ** (dự kiến = chưa xác định・tạm ngừng chu kỳ・ngoài khoảng thời gian tạo). "Dữ liệu giao hàng" thông thường không gắn dấu.

### 5.3B Màn hình 05B Quản lý xuất・giao hàng (danh sách) (thêm 2026/09/18)

Vì lịch chỉ tìm được "khi nào", nên **tách riêng danh sách để tìm theo điều kiện**. Chuyển giữa Lịch ⇄ Quản lý xuất・giao hàng ở menu bên trái.

#### Hiển thị gì

- **Chỉ hiển thị dữ liệu giao hàng.** Không hiển thị dự kiến (`draft`). Vì dự kiến chỉ có ngày nên không điền được các cột của danh sách (số lượng・phiếu vận chuyển・tài xế・trạng thái).
- Khi khoảng thời gian chỉ định có chứa dự kiến, ở trên danh sách hiển thị **"Trong khoảng này có N dự kiến (từ 〈ngày đầu〉 trở đi)"** kèm link đến hiển thị ngày của lịch. Để phân biệt được là không có hay chỉ là chưa thành dữ liệu giao hàng.

#### Cột

| Phân loại | Cột |
|---|---|
| Mặc định | No／Số giao hàng／Tên cơ sở (+ nhiệt độ)／Trạng thái／Đề nghị thay đổi／Ngày xuất／Ngày giao／Tài xế／Thao tác |
| Tuyến (chuyển đổi để hiển thị) | Loại giao hàng／Trung chuyển／Kho picking／Công ty giao hàng／Công ty ủy thác |

- **Cột tài xế hiển thị 2 dòng "Cấp 1／Cấp 2"**. Chặng do công ty vận tải chạy hiển thị "Công ty vận tải", chặng do công ty mình・ủy thác chạy hiển thị người phụ trách (chưa phân công thì "Chưa phân công") (2026/09/29 [Quyết định v2.3 #48]).
- Cột tuyến mặc định ẩn, chuyển đổi bằng **"Hiện／ẩn cột tuyến"**. Chỉ khi theo dõi tuyến mới xem kho hay công ty giao hàng, hiển thị thường xuyên sẽ quá dài ngang.
- Mở chi tiết (màn hình 06) từ Số giao hàng. Breadcrumb là "Quản lý giao hàng ／ Quản lý xuất・giao hàng ／ Chi tiết dữ liệu xuất・giao hàng", khi mở từ lịch vị trí cũng như vậy, chỉ nút quay lại trở về màn hình gốc.

#### Thời gian và thứ tự sắp xếp

- Thời gian chọn bằng radio **theo ngày xuất／theo ngày giao**. Mặc định theo ngày xuất・2 tuần kể từ tuần hiện tại.
- Sắp xếp theo ngày của tiêu chí đã chọn, đặt `aria-sort` cho tiêu đề cột đó (§12-9).
- Số đơn 1 trang chọn từ 10／20／50／100.

#### Giá trị master (lựa chọn của điều kiện tìm kiếm・quyết định 2026/09/18)

| Mục | Giá trị | Cách giữ |
|---|---|---|
| Course | Light／Standard | Master gói |
| Máy bán hàng tự động | Có／Không | Thuộc tính của cơ sở (hợp đồng) |
| Mẫu giao hàng | **Chu kỳ／Special／Giao hàng theo lần** | Giá trị giống "cách xác định ngày giao" của hợp đồng (`plan_mode`・§3.3). **Giao hàng theo lần (`on_demand`) chỉ cho vật tư**, lạnh・đông lạnh giữ 2 giá trị (2026/09/21・#24) |
| Loại chuyến | **Chuyến giao ES／Chuyến giao COOL／Chuyến vật tư** | Nội dung công việc trên ứng dụng (có trưng bày không). §4C-3. **Là trục khác với việc có trung chuyển**, tuyến xem bằng cột "Trung chuyển" và điều kiện "Kho trung chuyển" |
| Số lần giao hàng | 1 lần／tháng・2 lần／tháng・4 lần／tháng | Số lần giao hàng của hợp đồng (mỗi chu kỳ) |
| Kho picking・kho trung chuyển | Master kho (lọc theo loại kho) | §2.3A |
| Công ty giao hàng ủy thác | Master công ty giao hàng | §2.3B |

> Trước đây suy ra "phương thức giao hàng (chuyến giao ES／chuyến COOL)" từ việc có trung chuyển, nhưng vì trùng từ với loại chuyến ở §4C-3 mà khác nghĩa nên đã bỏ (2026/09/18). **Loại chuyến là mục nhập do hợp đồng (hợp đồng con) giữ**, **không suy ra từ việc có trung chuyển** (chốt 2026/09/21・REQ-DL-785 bị hủy). **Tuyến (có／không trung chuyển) được quyết định từ loại giao hàng**, xử lý tách riêng.

### 5.4 Lịch vận hành・thay đổi hàng loạt

- Nút trước sau của hiển thị tháng là "Tháng trước" "Tháng sau", hiển thị tuần là "Tuần trước" "Tuần sau", di chuyển theo đơn vị hiển thị.
- "Hôm nay" chuyển đến tháng chứa ngày hiện tại ở hiển thị tháng, chuyển đến tuần bắt đầu từ thứ Hai chứa ngày hiện tại ở hiển thị tuần.
- Ở hiển thị "Giao hàng", hiển thị cảnh báo số đơn chưa thiết lập tài xế và số đơn đề nghị thay đổi ở phía trên màn hình, và gắn dấu cảnh báo vào các dòng dự kiến tương ứng.
- Đích của thay đổi hàng loạt là danh sách theo thứ tự ngày để dễ so sánh ngay cả ở vùng bên hẹp. Cơ bản là thứ tự ngày tăng dần, ứng viên cùng ngày ưu tiên kho hiện tại.
- Thay đổi hàng loạt thực hiện bằng cách chọn nhiều bằng checkbox, **chỉ chọn được ngày từ hôm nay trở đi**. Ngày picking và ngày giao **di chuyển cùng nhau giữ lead time** (§5.0). Lead time bất thường (chỉ định riêng ngày picking và ngày giao) thực hiện bằng "Chỉ định ngày riêng" ở màn hình chi tiết dữ liệu giao hàng (màn hình 06) (REQ-DL-308・§4A-4D).
- Ngoài cảnh báo số đơn chưa thiết lập tài xế・đề nghị thay đổi, **hàng hóa chưa gắn (chưa phát hành phiếu vận chuyển)** được thông báo bằng email cho vận hành và công ty giao hàng ủy thác vào 3 ngày trước・1 ngày trước ngày giao dự kiến (REQ-DL-304).
- Ngày không chọn được không hiển thị ban đầu. Chỉ khi BẬT "Hiện cả ngày không chọn được" mới hiển thị vào danh sách kèm lý do không chọn được. "Cần xác nhận" luôn hiển thị như ứng viên chọn được.

---

## 6. Chính sách quản lý dữ liệu ngày lễ

**Nguồn là API ngày lễ công khai. Tự động lấy mỗi năm 1 lần đăng ký vào master ngày lễ, và cũng lấy lại được bằng "Lấy lại ngày lễ" trên màn hình** (thay đổi 2026/10/01・vận hành xác nhận. Cũ: [Tạm thời] nhập thủ công mỗi năm 1 lần dữ liệu công khai của Văn phòng Nội các 〈2026/09/21〉).

| Mục | Nội dung |
|---|---|
| Nguồn | **API ngày lễ công khai** (thay đổi 2026/10/01. Cũ: [Tạm thời] dữ liệu công khai của Văn phòng Nội các) |
| Cách nhập | **Mỗi năm 1 lần・thủ công** đăng ký vào master ngày lễ (dự kiến vận hành đăng ký phần năm sau vào tháng 12 năm trước・§10-1 #7) |
| Liên kết tự động | **Không làm.** Không có tự động nhập API ngoài・CSV |
| Thao tác của vận hành | **Thêm・sửa・xóa được** từ master ngày lễ (REQ-DL-307) |

- Màn hình cài đặt chu kỳ giao hàng tham chiếu dữ liệu ngày lễ đã đăng ký trong hệ thống.
- ~~Không đặt chức năng nhập ngày lễ từ CSV của Văn phòng Nội các hoặc API ngoài.~~ (Hủy 2026/10/01: lấy từ API ngày lễ công khai)
- Màn hình hiển thị số ngày lễ và danh sách ngày lễ trong khoảng thời gian đối tượng, không hiển thị ngày giờ đồng bộ hay nút đồng bộ lại.
- Ngày lễ đã đăng ký hiển thị với "Ngày lễ giao hàng" mặc định BẬT, có thể đổi sang TẮT theo từng ngày.
- Cách đăng ký・cập nhật dữ liệu ngày lễ nằm ngoài đối tượng của màn hình này.
- Ngày lễ **tham chiếu ngày lễ đã đăng ký trong master ngày lễ** rồi **sửa・thêm・xóa được tại hiện trường** (REQ-DL-307) (thay đổi 2026/09/21. Cũ: ngày lễ tự động lấy từ DB rồi). Ở màn hình này, Override theo ngày (BẬT/TẮT xử lý như ngày lễ) và thêm ngày nghỉ thủ công tương ứng với thao tác đó.
- Loại・nội dung DB nguồn lấy ngày lễ đang xác định (hành động nhóm REQ-DL-317, §9-2 #7).

---

## 7. Mô hình dữ liệu (đề xuất)

> **Nguồn duy nhất của bảng・cột・ràng buộc là `01_仕様/10_Giao_hàng/Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §14** (quyết định lần 4 ngày 2026/09/23). Chương này để lại **mục lục** hướng tới đó, vai trò và lý do quyết định. **Nếu danh sách cột khác nhau thì DEV là chuẩn.** Vì ghi cùng một ER ở 2 nơi nên tại thời điểm 2026/09/23 đã xuất hiện thiếu 5 bảng và 7 điểm không khớp.
>
> **Bảng chỉ có trong DEV**: `menus` / `order_quantities` / `plan_rates` / `corporations` / `sites` (DEV §14.10・§14.12).

```
delivery_cycle_settings            -- Cài đặt chu kỳ giao hàng (chỉ 1 bản ghi・§2.0A)
  id, first_a1_date,
  range_from, range_to,              -- Khoảng thời gian đối tượng tạo (tối đa 6 tháng kể cả tháng bắt đầu)
  fixed_through,                     -- Đã xác định đến đây (không sửa được). Tự động tiến đến tháng đã vào vận hành
  operation_start,                   -- Tháng bắt đầu vận hành của cài đặt (mép trái của dải)
  note, saved_at, saved_by
  -- Không giữ "phiên bản". Thiết lập theo từng tháng, xác định lần lượt từ tháng đã vào vận hành.
  -- Nội dung tháng đã xác định theo dõi bằng lịch sử thay đổi (delivery_cycle_change_logs).

delivery_cycle_pauses              -- Tab tạm ngừng chu kỳ
  id, setting_id, name, start_date, end_date,
  kind(normal | adjust),           -- Phân loại (thêm 2026/09/21).
                                   -- normal = tạm ngừng do vận hành đăng ký／adjust = tạm ngừng điều chỉnh để làm tròn theo đơn vị 7 ngày
                                   -- (§2.2 "Điều chỉnh độ lệch"・REQ-DL-819/820).
                                   -- Hiển thị phân biệt trong lịch・lịch sử thay đổi.
  adjust_for_pause_id NULL         -- Khi là adjust, bù cho tạm ngừng normal nào (thêm 2026/09/22).
                                   -- Guard khi lưu: nếu tổng số ngày của 1 normal + adjust gắn với nó không phải bội số của 7 thì không lưu được.
                                   -- Hệ thống chỉ trả về số ngày thiếu, không tự động chèn (REQ-DL-819).

delivery_holiday_days              -- Tab ngày lễ・nghỉ đột xuất (cờ theo ngày)
  id, setting_id, date, is_delivery_holiday, is_picking_closed, source, name

-- non_picking_days / non_picking_cycle_slots đã bãi bỏ (2026/09/21).
-- Thống nhất vào warehouse_non_picking_days / warehouse_non_picking_slots (bên dưới).

change_requests                    -- Đơn đề nghị thay đổi (bản ghi tiếp nhận)
  -- ★Đổi tên từ delivery_change_requests theo quyết định lần 4 ngày 2026/09/23.
  --   Không chỉ delivery mà cả shipping_plan cũng là đối tượng, xử lý gộp đề nghị về ngày・tuyến・số lượng・hủy hợp đồng
  --   nên tên "của delivery" quá hẹp. Chi tiết cột DEV §14.11 là chuẩn.
  -- ★Với 1 dữ liệu giao hàng, đề nghị pending hoặc proposed chỉ có tối đa 1 tại cùng thời điểm.
  --   deliveries.change_request_status là bản sao phi chuẩn hóa của nó (nếu không có thì NULL).
  -- ★Hạn xử lý = hạn chốt đơn của giao hàng・dự kiến đối tượng (delivery_cycles.order_close_date). Không giữ cột.
  --   Nếu đến (hạn chốt − change_request_warn_days (mặc định 3 ngày)) mà vẫn pending / proposed thì
  --   UPSERT review_items.kind = change_request_due. Sau hạn chốt vẫn còn đến khi vận hành xử lý.
  --   Hệ thống không tự động từ chối (2026/09/29 [Quyết định v2.3 #37]).
  id, contract_id, target_type(plan | delivery), target_id,   -- Đích phản ánh (§4A-4)
  request_kind(site_block | move | skip),                     -- Chia 2 của §3.4. Nơi lưu khi phê duyệt thay đổi
  original_delivery_date, requested_delivery_date NULL,
  no_preferred_date, reason, status(draft | submitted | approved | rejected),
  review_required, review_reason, requested_at, reviewed_at, reviewed_by
  -- Khi phê duyệt, site_block ghi ra site_receive_blocks, move/skip ghi ra delivery_overrides

site_receive_blocks                -- Ràng buộc nhận hàng của cơ sở (§3.1C). "Ngày không nhận được" đã phê duyệt
  id, contract_id,                                            -- Đơn vị giữ là hợp đồng (cơ sở)
  block_type(date | range | dow), date NULL, start_date NULL, end_date NULL,
  dow_mask NULL,                                              -- Bitmask khi chỉ định theo thứ
  repeat(none | yearly), reason, source(corp | ops),
  status(submitted | active | cancelled), effective_from,
  request_id NULL, approved_at, approved_by
  -- Có tác dụng như điều kiện tạo ngày giao (§4.3 isSiteBlocked). Không bị ảnh hưởng khi tạo lại cài đặt chu kỳ

delivery_overrides                 -- Override đã phê duyệt (§4A-4). Giữ bên ngoài dự kiến
  id, contract_id, line_no, channel_id,
  override_type(move | skip | fix),                           -- fix = chỉ định riêng của vận hành (§4A-4D)
  anchor_delivery_date,                                       -- Ngày giao tại thời điểm phê duyệt (khóa re-anchor)
  new_delivery_date NULL,                                     -- Giữ bằng ngày tuyệt đối. Không giữ tương đối
  source(corp | ops), reason, requester_name, approved_at, approved_by,
  snapshot_json,                                              -- Căn cứ tại thời điểm phê duyệt (§4.4 → §3.4)
  status(applied | unapplied | expired | cancelled),
  unapplied_reason NULL, last_verified_at
  -- Áp dụng lại mỗi lần tạo lại. Nếu không áp dụng được thì chuyển status sang unapplied / expired và đưa vào cần xác nhận
  -- "Đã điều chỉnh" là hiển thị suy ra gắn vào dự kiến đang được áp dụng, phía dự kiến không giữ cờ

holidays                           -- Ngày lễ đã đăng ký trong hệ thống
  date PK, name

delivery_cycle_days                -- Chu kỳ giao hàng đã tạo (materialized)
  date PK, cycle_no, cycle_label, slot_code, week, is_first, is_pause

delivery_cycles                    -- Header cho 1 chu kỳ (2026/09/21・#33/#41)
  id, cycle_no, cycle_month,
  -- ★Suy ra cycle_month (quyết định lần 2 ngày 2026/09/21・không làm nhánh ngoại lệ)
  --   cycle_month = **tháng mà khung thứ 14 `B7` thuộc về** (yyyy-mm).
  --   Quy tắc này luôn cho kết quả giống "tháng có nhiều ngày hơn trong 28 ngày của khung A1〜D7",
  --   và khi 14 đối 14 thì tự động là **tháng trước**. Do đó không cần chia trường hợp đồng số.
  --   (Cũ: lần 1 #41 "tháng có nhiều ngày hơn trong 28 ngày. Khi 14 đối 14 đồng số thì chưa quyết・tạm thời là tháng của B7".
  --     Lần 2 ngày 2026/09/21 thống nhất thành "tháng B7 thuộc về", giải quyết chưa quyết)
  --   Ngày tạm ngừng chu kỳ không tiêu thụ khung nên không tính vào số (chỉ xem ngày của khung).
  --   yyyymm của ID hợp đồng con (ID hợp đồng-yyyymm) cũng dùng giá trị này.
  a1_date, b7_date, d7_date,         -- b7_date = ngày của khung thứ 14 (dùng để suy ra cycle_month)
  menu_open_date, order_start_date, order_close_date,
  marker_source(menu | provisional), marker_copied_at
  -- Cột mốc phía menu là chuẩn. Khi tạo chu kỳ sao chép ngày thực, giữ và hiển thị trên màn hình.
  -- Khi chưa đăng ký menu thì giữ ngày 15 tháng trước làm hạn chốt tạm (marker_source=provisional),
  -- và thay bằng ngày thực tại thời điểm menu được đăng ký (§4A-2E).
  -- ★Khi marker_source = provisional thì chỉ làm được
  --   **hạn chót nhận thay đổi và khởi động kiểm tra** (quyết định lần 2 ngày 2026/09/21).
  --   **Chốt số lượng (order_finalize)・gửi email xác định・chỉ thị xuất hàng (ship order) không chạy
  --     cho đến khi hạn chốt thực (marker_source = menu) đến từ menu** (§4A-2E・§11-1).

contracts                          -- Hợp đồng (02)
  id, customer_name, mode(cycle | special), plan_qty, delivery_count,
  lead_time, shift_dir(-1 | 1),
  warehouse, relay_warehouse, carrier, use_yamato,
  receive_off_sat, receive_off_sun, receive_off_holiday,
  delivery_condition                        -- Điều kiện giao hàng của cơ sở (#22)
  -- ★Khung giờ nhận giữ ở site_receive_windows (bảng con) (quyết định lần 2 ngày 2026/09/21)
  -- (Cũ: chỉ giữ 1 cặp receive_window_from / receive_window_to. Hủy ở lần 2 ngày 2026/09/21)
  -- Ngày không nhận được chỉ định theo ngày giữ ở site_receive_blocks (§3.1C)
  -- Tên mục màn hình là "Thứ không giao được" (tên cũ: thứ không nhận được)／"Dời sớm・dời muộn" (tên cũ: hướng dời).
  -- Tên vật lý dùng nguyên ng_weekdays / holiday_shift của danh sách mục, không đổi (2026/09/21・#31).

site_receive_windows               -- ★Khung giờ nhận hàng của cơ sở (quyết định lần 2 ngày 2026/09/21・§3.1C)
  id, site_id, from_time, to_time, sort_order
  -- 1 cơ sở có nhiều dòng. Vì có cơ sở chia buổi sáng・buổi chiều nên không làm dạng chỉ giữ 1 cặp from/to.
  -- Đơn vị giữ là hợp đồng (cơ sở). Trên màn hình xếp theo thứ tự sort_order.
  -- Không dùng để tính ngày (ngày giao xác định bằng ngày không nhận được・thứ không giao được).

delivery_receive_windows           -- ★Snapshot phía dữ liệu giao hàng (quyết định lần 2 ngày 2026/09/21)
  id, delivery_id, from_time, to_time, sort_order, snapshot_at
  -- Khi tạo dữ liệu giao hàng, snapshot site_receive_windows **nguyên cả danh sách**.
  -- Dù sau này sửa phía cơ sở, dữ liệu giao hàng đã tạo không thay đổi (giống địa chỉ).
  -- Thẻ nơi giao của ứng dụng tài xế hiển thị toàn bộ khung giờ theo thứ tự này.

contract_delivery_lines            -- Chi tiết giao hàng
  id, contract_id, line_no, slot_code NULL, specified_day NULL, qty

shipping_plans                     -- Lịch xuất hàng (03, tạo bằng batch). 1 bản ghi = chi tiết giao hàng × loại giao hàng
  id, contract_id, line_no, channel_id, cycle_id, occurrence_key,
  -- ★Ràng buộc duy nhất (quyết định lần 2 ngày 2026/09/21)
  --   UNIQUE (contract_id, line_no, channel_id, cycle_id, occurrence_key)
  --   occurrence_key = giá trị chỉ định duy nhất lần này trong chu kỳ (slot `A1`〜`D7`,
  --   hoặc ngày chỉ định riêng "ngày N hàng tháng" "ngày cuối tháng hàng tháng").
  --   (Cũ: REQ-DL-721 "lịch giao hàng duy nhất theo (ID hợp đồng, ngày giao)"／
  --     Cũ: `ID hợp đồng + số chi tiết giao hàng + ID loại giao hàng + số chu kỳ + slot (hoặc ngày chỉ định)`.
  --     Chốt thành khóa trên ở lần 2 ngày 2026/09/21, (contract_id, delivery_date) bị hủy)
  --   Lý do không làm (contract_id, delivery_date) duy nhất: 1 hợp đồng có thể có
  --   nhiều nhiệt độ・loại giao hàng trong cùng ngày (lạnh và đông lạnh xếp cùng ngày giao).
  cycle_no, cycle_label, slot_code,
  seed_date, delivery_date, delivery_shift_days,
  raw_pick_date, picking_date, pick_shift_days,
  lead_time, actual_lead_time,
  estimated_qty,                                        -- ★Số lượng dự kiến (quyết định lần 2 ngày 2026/09/21)
  -- Dự kiến giữ estimated_qty bên trong. Ở draft chỉ là không cho doanh nghiệp thấy số lượng,
  -- không phải "dự kiến không có số lượng" (§4A-1・§4A-7・S1).
  -- Giá trị là số lượng chuẩn phân bổ số lượng gói của hợp đồng theo số lần giao hàng (§3.2). Khi tạo xác định
  -- chuyển sang deliveries.planned_qty, thay bằng số lượng đã chốt khi chốt đơn.
  lifecycle(draft | published | locked),                -- ★plan lifecycle (§4A-3)
  -- (Cũ: `status(draft | published | locked)`. Lần 2 ngày 2026/09/21 đã tách tên với
  -- deliveries.status〈delivery status〉. Không gọi chung là "trạng thái")
  override_id NULL,                                     -- delivery_overrides đang được áp dụng (hiển thị suy ra "Đã điều chỉnh")
  -- Không giữ cờ pinned (sửa đổi 2026/09/18・§4A-4). Phê duyệt do phía delivery_overrides giữ
  contract_month_id NULL,                               -- Hợp đồng tháng đã tạo xác định
  delivery_id NULL,                                     -- Dữ liệu giao hàng sau khi tạo xác định
  temp_type(frozen | chilled | ambient | material)      -- Nhiệt độ. Đông lạnh/lạnh là bản ghi riêng
  warehouse_id, carrier_id, manual_moved(bool), shift_reversed(bool),
    -- ★route_id đã xóa theo quyết định lần 4 ngày 2026/09/23. Vì dự kiến được thay thế (UPSERT) mỗi lần tạo lại,
    --   nếu giữ FK tới leg thì đích tham chiếu sẽ lơ lửng. Dự kiến chỉ giữ route_snapshot_source,
    --   leg thực tế được tạo ở delivery_legs tại thời điểm thành dữ liệu giao hàng.
  route_snapshot_source(contract_month | contract)      -- ★Nguồn snapshot (quyết định lần 2 ngày 2026/09/21)
  -- Nếu đã có hợp đồng con (contract_month_delivery_channels) thì dùng route của nó,
  -- chỉ dùng hợp đồng cha (contract_delivery_channels) khi chưa có hợp đồng con (§3.1B・S2).
  -- Khi hợp đồng con đã được tạo trước như trả trước 1 năm thì contract_month là chuẩn.

warehouses                         -- Master kho (REQ-DL-410・§2.3A). Điều kiện hoạt động ở đây là chuẩn
  id,                                -- Picking=WH00001 / Trung chuyển=HU00001 (tiền tố phân theo loại)
  name, slip_name, kana,             -- slip_name là tên hiển thị ở nơi gửi của phiếu vận chuyển
  warehouse_type(picking | relay | return),  -- Loại kho. Phần của màn hình được chia hiển thị theo giá trị này
                                     -- ★return = nơi nhận lại (trụ sở, v.v. Là nơi giao của chuyến trả hàng sản phẩm còn lại).
                                     --   Thêm 2026/09/29 [Quyết định v2.3 #41]. Trung chuyển (relay) có thể đăng ký cả cơ sở của công ty giao hàng ủy thác [#50]
  carrier_id NULL,                   -- Chỉ trung chuyển: loại vận chuyển (công ty giao hàng vận hành điểm trung chuyển đó)
  status(active | inactive),         -- Có hiệu lực / Vô hiệu. Vô hiệu không hiển thị ở nơi được phân mới (không di chuyển dự kiến hiện có)
  warehouse_code NULL,               -- Chỉ picking: mã kho của công ty dùng cho liên kết Thomas
  branch_code NULL,                  -- Chỉ trung chuyển: mã bưu cục của công ty giao hàng (hiển thị trên phiếu vận chuyển)
  zip, pref, city, town, building, tel, fax, note, search_key,
  pick_count_threshold,              -- Ngưỡng cảnh báo số đơn picking 1 ngày (theo kho・mặc định 300)
  ship_order_lead_days,              -- Chỉ thị xuất hàng gộp 2 tuần, xuất trước mấy ngày so với ngày bắt đầu của 2 tuần đối tượng
                                     -- (mặc định 3 = thứ Sáu. Sửa đổi 2026/09/19・xác nhận 2026/09/21. Cũ: mấy ngày trước ngày picking・mặc định 1)
                                     -- Điểm khởi đầu của locked (thời điểm xuất gộp)
  thomas_csv_unit(warehouse)         -- CSV chỉ thị xuất hàng xuất theo từng kho
  -- Trung chuyển không có lead_time / điều kiện hoạt động / liên kết. Cũng không phát hành lại phiếu vận chuyển.

warehouse_staff                    -- Người phụ trách kho・điểm trung chuyển (kế thừa từ master điểm trung chuyển hiện có)
  id, warehouse_id, role(main | sub), name, kana, email, tel

-- warehouse_lead_times đã bãi bỏ (2026/09/14). Lead time do loại giao hàng của hợp đồng giữ.

products                           -- Master sản phẩm (§2.3C)
  id, code, name, temp_type(frozen | chilled | ambient | material),
  pack_size,                        -- Số lượng trong 1 gói (1 thùng = N suất)
  shelf_life_days, unit_price, description, status
  -- ★shelf_life_days dùng cho thông báo tự động hạn sử dụng ngắn (2026/09/29 [Quyết định v2.3 #35]):
  --   nếu số ngày từ ngày xuất hàng đến ngày giao > shelf_life_days − shelf_life_safety_days thì
  --   review_items.kind = shelf_life_warning (phán định khi tạo・tính lại dự kiến, đổi kho, nhân bản).

-- Cài đặt vận hành (dùng chung toàn công ty・khóa và giá trị. Chi tiết cột DEV §3.6 là chuẩn・thêm 2026/09/29 [Quyết định v2.3 #35・#37])
--   shelf_life_safety_days   mặc định 2   Số ngày an toàn của hạn sử dụng ngắn
--   change_request_warn_days mặc định 3   Hiển thị đến hạn đơn đề nghị thay đổi trước hạn chốt đơn mấy ngày
--   (trouble_auto_duplicate_after_minutes đã xóa 2026/09/29 [Quyết định v2.3 #30])
  -- Sản phẩm có đơn giá・mô tả khác nhau đăng ký là sản phẩm riêng (không đổi giá trị theo kho)

product_warehouses                 -- Kho xử lý sản phẩm (sản phẩm × kho. Nhiều-nhiều)
  id, product_id, warehouse_id, status(active | inactive)
  -- Chỉ giữ sự thật "sản phẩm này được xử lý tại kho này".
  -- Sản phẩm hiển thị cho doanh nghiệp = sản phẩm có xử lý tại kho của cơ sở đó.

-- non_picking_slot_sets đã bị bãi bỏ (2026/09/14). Ô không xuất hàng được là 1 ô cho mỗi kho.
-- non_picking_days / non_picking_cycle_slots cũng đã bị bãi bỏ (2026/09/21).
-- Ô và ngày không xuất hàng chỉ giữ ở warehouse_non_picking_slots / warehouse_non_picking_days bên dưới.

warehouse_non_picking_slots        -- Ô không xuất hàng theo kho (mỗi kho 1 bộ · chỉnh sửa ở màn hình 01)
  id, setting_id, warehouse_id, slot_code(A1-D7)
  -- Áp dụng cho toàn bộ kỳ đối tượng thiết lập. Không thay đổi được tháng đã xác định.

warehouse_non_picking_days         -- Ngày không xuất hàng theo ngày của từng kho (chỉnh sửa ở màn hình 01 · đăng ký được theo khoảng thời gian)
  id, setting_id, warehouse_id, date_from, date_to, type(manual_closed | business_override), reason
  -- business_override là Override riêng lẻ "ô không xuất được nhưng ngày này vẫn hoạt động"

contract_delivery_channels         -- Phân loại giao hàng (§3.1B). "Giá trị mặc định" mà hợp đồng cha giữ
  id, contract_id, temp_type(frozen | chilled | ambient | material),
  warehouse_id,
    -- ★carrier1_id / relay_warehouse_id / carrier2_id đã bị xóa ở quyết định lần 4 ngày 2026/09/23.
    --   Người vận chuyển và điểm trung chuyển đều giữ ở phía contract_routes (leg).
    --   Lý do: tên cột carrier1/carrier2 cố định ở 2 đoạn, mâu thuẫn với "tuyến giao hàng có số chặng thay đổi"
    --   (quyết định 2026/09/04). Cùng một thông tin ở 2 nơi thì không xác định được đâu là chuẩn.
  lead_time,                              -- 0〜7 ngày. Không tự động bổ sung từ master kho (2026/09/21)
  service_form(es_delivery | cool | material),  -- ★Loại chuyến. Chủ sở hữu là **phân loại giao hàng này** (quyết định lần 2 ngày 2026/09/21)
    -- Không đặt ở tuyến của hợp đồng (contract_routes). Không suy ra từ việc có trung chuyển hay không (#29).
    -- (Cũ: lần 1 #29 "loại chuyến là mục nhập do hợp đồng (hợp đồng con) giữ". Lần 2 ngày 2026/09/21 giới hạn nơi giữ ở phân loại giao hàng)
  delivery_regime(self | partner_driver | parcel_carrier),  -- ★Thể chế giao hàng (thêm ở lần 2 ngày 2026/09/21)
    -- self = tự công ty / partner_driver = tài xế ủy thác / parcel_carrier = công ty vận chuyển.
    -- Nếu khác nhau theo từng đoạn thì delivery_regime ở phía route legs được ưu tiên, ở đây là giá trị mặc định.
  share_pct, effective_from               -- Đổi kho thì từ tháng áp dụng

contract_month_delivery_channels   -- "Giá trị thực tế của tháng đó" mà hợp đồng con giữ (2026/09/21 · #25/#45)
  id, contract_month_id, channel_id,      -- Tham chiếu đến phân loại giao hàng của cha
  temp_type, warehouse_id,
    -- ★carrier1_id / relay_warehouse_id / carrier2_id đã bị xóa ở quyết định lần 4 ngày 2026/09/23.
    --   Tuyến được chụp snapshot ở contract_month_routes (leg).
  lead_time, service_form, delivery_regime, snapshot_at
  -- Khi tạo hợp đồng con, chụp snapshot giá trị mặc định của hợp đồng cha. Từ đó tháng đó chạy theo giá trị của phía con.
  -- ★Dự định: "nếu có hợp đồng con thì dùng snapshot tuyến của con, chỉ dùng cha khi chưa có con"
  --   (quyết định lần 2 ngày 2026/09/21). Như trường hợp trả trước 1 năm một lần mà hợp đồng con đã được tạo trước cho 12 chu kỳ,
  --   thì dự định của tháng đó cũng được tạo từ phía con. Kết quả phán định được lưu ở shipping_plans.route_snapshot_source.
  -- (Cũ: chỉ ghi "dự định (draft) khi chưa có hợp đồng con thì tạo từ giá trị mặc định của hợp đồng cha".
  --   Lần 2 ngày 2026/09/21 nêu rõ trường hợp con có trước)

-- ★Quyết định lần 4 ngày 2026/09/23: delivery_routes cũ (dùng chung 1 bảng cho contract_id / delivery_id) bị bãi bỏ, tách thành 3 bảng:
--   contract_routes (hợp đồng cha) / contract_month_routes (snapshot của hợp đồng con) /
--   delivery_legs (1 dữ liệu giao hàng). Chỉ delivery_legs mới có driver_id.
--   Chi tiết các cột: Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3 §14.2・§14.4 là chuẩn (đầu §7).

contract_routes                    -- Định nghĩa tuyến theo từng phân loại giao hàng của hợp đồng cha (REQ-DL-411, số chặng thay đổi)
  id, channel_id, leg_no,
  from_type(warehouse | relay), from_id,
  to_type(relay | destination), to_id NULL, carrier_id,
  delivery_regime(self | partner_driver | parcel_carrier),
  is_final_leg(bool), assign_scope(ops | carrier)
  -- UNIQUE(channel_id, leg_no) / UNIQUE(channel_id) WHERE is_final_leg
  -- Không có driver_id (việc phân công chỉ tồn tại theo đơn vị dữ liệu giao hàng).

contract_month_routes              -- Snapshot cho hợp đồng con (tháng chu kỳ)
  id, month_channel_id, leg_no,
  from_type(warehouse | relay), from_id,
  to_type(relay | destination), to_id NULL, carrier_id,
  delivery_regime(self | partner_driver | parcel_carrier),
  is_final_leg(bool), assign_scope(ops | carrier), snapshot_at
  -- UNIQUE(month_channel_id, leg_no) / UNIQUE(month_channel_id) WHERE is_final_leg
  -- Không có driver_id.

delivery_legs                      -- Các đoạn thực tế của 1 dữ liệu giao hàng
  id, delivery_id, leg_no,
  from_type(warehouse | relay), from_id,
  to_type(relay | destination), to_id, carrier_id, temp_type,
  delivery_regime(self | partner_driver | parcel_carrier),  -- ★Ai vận chuyển đoạn này (thêm ở lần 2 ngày 2026/09/21)
  is_final_leg(bool),              -- ★Có phải đoạn cuối không (thêm ở lần 2 ngày 2026/09/21)
    -- Đoạn cuối = leg có to_type = destination. Khớp với giá trị lớn nhất của leg_no.
    -- ★Hoàn thành giả định・phát hiện thiếu giao được phán định bằng delivery_regime của leg này (§4C-1・§11-1).
    --   parcel_carrier      → coi là hoàn thành giả định
    --   self / partner_driver → không coi là hoàn thành giả định. Nếu sáng hôm sau chưa hoàn thành thì chuyển vào missing queue
    -- (Cũ: phán định "chuyến ủy thác là hoàn thành giả định" dựa trên loại chuyến / thể chế giao hàng. Đổi ở lần 2 ngày 2026/09/21)
  driver_id NULL, assigned_by NULL, assigned_at NULL,  -- Phân công theo đơn vị đoạn (leg) (2026/09/21・#60)
                                   -- ★Chỉ delivery_legs mới có 3 cột này (quyết định lần 4 ngày 2026/09/23).
                                   -- ★Bản sao (số nhánh) sao chép toàn bộ legs, nhưng không sao chép 3 cột này.
  assign_scope(ops | carrier),     -- ★Có phân công hay không do delivery_regime của đoạn quyết định (2026/09/29 〔quyết định v2.3 #48〕):
                                   --   đoạn parcel_carrier không phân công / đoạn self・partner_driver
                                   --   phân công bất kể là lần 1 hay lần 2.
                                   --   (Cũ: tạm thời chỉ phân công lần 2 〈điểm trung chuyển → nơi giao〉.
                                   --     Lần 1 〈kho → điểm trung chuyển〉 do công ty vận chuyển chở nên không phân công. Thay thế 2026/09/29 〔quyết định v2.3 #48〕)
  picked_up_at NULL, picked_up_by NULL,  -- ★Thời điểm nhận hàng・người nhận hàng theo từng đoạn (2026/09/29〔quyết định v2.3 #49〕).
                                   --   Được nhập khi tài xế thực hiện "nhận hàng" ở đoạn đó.
                                   --   Chuyển deliveries.status từ Đã xuất → Đã nhận chỉ xảy ra ở lần nhận đầu tiên trên ứng dụng của ES.
                                   --   Nhận tại điểm trung chuyển ở lần 2 chỉ nhập thời gian, trạng thái vẫn là Đã nhận (không giữ trạng thái giữa chừng của trung chuyển).
                                   --   Không sao chép khi tạo bản sao.
  snapshot_source(contract_month | contract), snapshot_at
                                   -- ★Khi materialize, nếu có hợp đồng con thì chép từ contract_month_routes,
                                   --   nếu không có thì chép từ contract_routes. Giữ lại nguồn đã chép (2026/09/23).
                                   -- ★Sau khi chép là bất biến. Sửa contract_routes cũng không làm thay đổi dữ liệu giao hàng hiện có.
  -- UNIQUE(delivery_id, leg_no) / UNIQUE(delivery_id) WHERE is_final_leg
  -- guard chung (cả 3 bảng): leg_no là số thứ tự liên tiếp từ 1, không nhảy số / leg 1 có from_type = warehouse và
  --   from_id = channel.warehouse_id / from_id của leg n+1 = to_id của leg n /
  --   is_final_leg có đúng 1 dòng và to_type = destination / không trung chuyển = 1 leg, có trung chuyển = 2 leg.
  -- ★Thay đổi tuyến "chỉ riêng chuyến giao này" thì UPDATE trực tiếp delivery_legs (không giữ route_override · 2026/09/23).
  -- Dù có trung chuyển thì lead time chuẩn là 1 giá trị tổng của hợp đồng. Số ngày theo từng đoạn là giá trị tham khảo, không dùng để tính toán (#21).
  -- ★relay (có / không trung chuyển) được suy ra từ route legs này. Không lưu như một trạng thái
  --   (quyết định lần 2 ngày 2026/09/21). Chỉ cần có 1 leg chứa điểm trung chuyển là "có trung chuyển".
  -- ★service_form (loại chuyến) không đặt ở đây. Chủ sở hữu là phân loại giao hàng (contract_delivery_channels).

carriers                           -- Master công ty giao hàng (REQ-DL-412)
  id, name, kind(self | outsourced),
  temp_types(frozen | chilled_ambient | material),   -- 3 giá trị (2026/09/21・#8)
                                     -- Đông lạnh / Lạnh・Nhiệt độ thường / Vật tư. Nhiệt độ thường được xếp cùng ô với Lạnh
  areas, has_coolant_mgmt,
  has_vending, inquiry_url, status

deliveries                         -- Dữ liệu giao hàng (đơn vị của màn hình 06)
  id, shipping_plan_id, contract_id, site_id,
    -- ★Đổi tên từ branch_id (quyết định lần 4 ngày 2026/09/23). Thống nhất cùng tên với contracts.site_id・site_receive_windows.site_id.
    --   Ý nghĩa không đổi, là snapshot nơi giao (sites.id) tại thời điểm materialize.
  order_id NULL,                            -- ★Tham chiếu đến Order của chu kỳ đó (thêm 2026/09/23)
  lead_time NULL,                           -- ★Lead time chỉ riêng chuyến giao này (cũ: route_override.lead · 2026/09/23)
  delivery_date, shipped_date,
  status(出荷待 | 出荷済 | 受取済 | 納品済 | 一部納品済 | 再配達待 | 確認中 | 中止 | 取消),
    -- ★delivery status (§4A-3B). Là trục riêng với plan lifecycle (shipping_plans.lifecycle),
    -- không gọi gộp là "trạng thái" (quyết định lần 2 ngày 2026/09/21).
    -- Không dùng các giá trị cũ (Đang chuẩn bị / Đang chuẩn bị gửi / Hoàn tất gửi / Chưa nhận / Đã nhận / Hoàn tất giao hàng).
    -- ★"確認中" trong luồng sự cố chỉ dùng cho con chưa xuất hàng (shipped_date IS NULL) và ứng viên phục hồi.
    --   Không chuyển cha (Đã xuất / Đã nhận / Đã giao) sang "確認中" khi báo cáo sự cố (bổ sung 2026/09/24 〔quyết định v2.3 #20〕).
    --   (Cũ: Đã xuất / Đã nhận → 確認中 (báo cáo sự cố), Đã giao → 確認中 (liên hệ sau khi giao). Bãi bỏ 2026/09/24)
  locked_at NULL,                           -- ★Thời điểm trở thành locked (quyết định lần 2 ngày 2026/09/21)
  locked_source(ship_order_sent),           -- ★Điểm khởi đầu của locked. Chỉ có 1 giá trị
    -- Điểm khởi đầu của locked = thời điểm chỉ thị xuất hàng được gửi thành công lần đầu (ship_orders.sent_ok_at).
    -- Dù có mã vận đơn cũng không locked. Nếu mã vận đơn xuất hiện trước chỉ thị xuất hàng thì
    -- phát hiện・thông báo là anomaly (§4A-3・§11-1 tracking_anomaly_detect).
    -- (Cũ: "đã ra chỉ thị xuất hàng" hoặc "đã gắn mã vận đơn", cái nào sớm hơn. Đổi ở lần 2 ngày 2026/09/21)
  -- ★Điều kiện được/không được đổi ngày (quyết định lần 3 ngày 2026/09/22 · §4A-5)
  --   Chỉ dùng delivery_cycles.order_close_date để phán định. Không phán định bằng locked_at.
  --   Trước hạn chót : vận hành đổi được từng dòng hoặc hàng loạt. Lý do là tùy ý
  --   Sau hạn chót : không đổi ngày (từ chối UPDATE). Xử lý bằng hủy + sao chép. Cũng không có nhánh ngoại lệ dành cho vận hành
  --   (Cũ: sau hạn chót・locked_at IS NULL chỉ vận hành đổi được từng dòng・bắt buộc có lý do・giới hạn ở bản ghi hiển thị ở mục cần xác nhận.
  --     Quyết định lần 2 ngày 2026/09/21 bị hủy bởi quyết định lần 3 ngày 2026/09/22)
  parent_delivery_id NULL,                  -- ★Cha của bản sao (giao lại・giao từng phần・chuyến thay thế) (§4A-4C)
  branch_seq NULL,                          -- Số nhánh (1〜9). Cha con tối đa 1 tầng
    -- Ràng buộc: cha chỉ giới hạn ở dữ liệu giao hàng published hoặc locked.
    -- Không tạo được bản sao từ draft (shipping_plans) (quyết định lần 2 ngày 2026/09/21).
    -- Ở draft chỉ có thể "sao chép / thay đổi dự định", không giữ parent_delivery_id.
  duplicate_type(remainder | redelivery | alternative | trouble_pending | return) NULL,
                                            -- ★Loại của con (bổ sung 2026/09/24 〔quyết định v2.3 #26〕). trouble_pending = con tự động của sự cố.
                                            --   return = trả lại hàng còn lại (thêm 2026/09/29 〔quyết định v2.3 #41〕). Không thanh toán.
  return_to_warehouse_id NULL,              -- ★Nơi trả lại (warehouses.warehouse_type = return). Chỉ giữ khi duplicate_type = return.
                                            --   address_snapshot・destination_name là địa chỉ・tên của nơi trả lại (2026/09/29〔quyết định v2.3 #41〕)
                                            --   Được vận hành xử lý đổi thành remainder／redelivery để tái sử dụng (§4A-4B)
  creation_source(materialize | ops_duplicate | trouble_auto),
                                            -- ★Cách được tạo. Tạo khi xác định / sao chép bởi vận hành / con tự động đồng thời với đăng ký báo cáo sự cố (§4A-4C)
                                            --   (Cũ: trouble_timeout = batch quá hạn sự cố. Đổi tên thành trouble_auto 2026/09/29 〔quyết định v2.3 #30・#33〕)
  source_trouble_delivery_id NULL,          -- ★Dữ liệu giao hàng xảy ra sự cố (cha hay con đều được · §4A-4C). Thêm 2026/09/29 〔quyết định v2.3 #29・#33〕
  source_trouble_report_id NULL,            -- ★Báo cáo sự cố đầu tiên đã tạo con tự động. Chỉ để tham chiếu
                                            --   (Cũ: mỗi báo cáo tối đa 1 con. Đổi sang duy nhất theo từng dữ liệu giao hàng 2026/09/29 〔quyết định v2.3 #29〕)
  schedule_confirmed, quantity_confirmed,   -- ★Ngày・số lượng đã xác định chưa (bool). Con tự động được tạo với cả hai là false,
                                            --   cho đến khi cả hai là true thì không chuyển từ 確認中 → 出荷待 (DOMAIN_TROUBLE_CHILD_UNCONFIRMED)
    -- UNIQUE(source_trouble_delivery_id) WHERE creation_source = 'trouble_auto' AND status <> '取消'
    --   (Mỗi dữ liệu giao hàng xảy ra sự cố có tối đa 1 con tự động còn sống. Không tạo con thứ 2 do báo cáo thứ 2 trở đi・thử lại・vận hành xử lý.
    --    Cũng từ chối sao chép thủ công: DOMAIN_TROUBLE_CHILD_EXISTS. Bổ sung 2026/09/29 〔quyết định v2.3 #29〕)
    --   (Cũ: UNIQUE(source_trouble_report_id) WHERE source_trouble_report_id IS NOT NULL. Bãi bỏ 2026/09/29)
    -- Khi con xảy ra sự cố thì không sao chép từ con mà tạo số nhánh kế tiếp của cha (nội dung sao chép từ con đó).
    --   Vượt quá số nhánh 9 thì DOMAIN_BRANCH_LIMIT + cần xác nhận (bổ sung 2026/09/29 〔quyết định v2.3 #28〕)
    -- Tạo khi xác định: creation_source = materialize, schedule_confirmed = true, quantity_confirmed là true khi xác định số lượng.
    -- Sao chép bởi vận hành: creation_source = ops_duplicate. Con tự động: creation_source = trouble_auto (cũ: trouble_timeout).
    -- Chỉ thị xuất hàng・phiếu vận chuyển・phân công・thanh toán・thông báo・hoàn thành giả định không áp dụng cho trouble_pending trước khi xác định (§4D-3).
  change_request_status(変更可 | 申請中 | 提案中 | 調整済 | 変更不可),  -- Trục yêu cầu thay đổi (§4A-3B)
    -- Trung chuyển (không có / có trung chuyển) không lưu mà suy ra từ route legs (delivery_legs) (§4A-3B).
  address_snapshot(郵便番号・都道府県・住所・電話・担当者), destination_name,
  delivery_condition_snapshot,              -- Điều kiện giao hàng của cơ sở (#22). Hiển thị trên ứng dụng tài xế
    -- ★Khung giờ nhận hàng đã được chuyển sang delivery_receive_windows (bảng con) (quyết định lần 2 ngày 2026/09/21).
    -- (Cũ: receive_window_snapshot chỉ giữ 1 cặp from/to. Hủy ở lần 2 ngày 2026/09/21)
  temp_type, planned_qty, delivered_qty, delivered_at,
  delivery_regime(self | partner_driver | parcel_carrier),  -- ★"Thể chế giao hàng" trong 3 trục của chuyến (thêm ở lần 2 ngày 2026/09/21)
    -- self = tự công ty / partner_driver = tài xế ủy thác / parcel_carrier = công ty vận chuyển.
    -- Giá trị của final leg ảnh hưởng đến phán định hoàn thành giả định・phát hiện thiếu giao (§4C-1・§11-1).
    -- (Cũ: service_type(self | outsourced) 2 giá trị. Đổi sang 3 giá trị ở lần 2 ngày 2026/09/21)
  service_form(es_delivery | cool | material),  -- Chuyến giao ES / Chuyến giao COOL / Chuyến vật tư (§4C-3)
    -- Chủ sở hữu của loại chuyến là phân loại giao hàng (delivery channel). Ở đây là snapshot lúc tạo.
    -- Không đặt ở tuyến của hợp đồng (contract_routes) (quyết định lần 2 ngày 2026/09/21).
  completion_source(reported | presumed | customer),  -- Phân biệt hoàn thành giả định (§4C-1)
  freight_billable(bool) NULL, freight_bill_reason,  -- ★Có thanh toán cước vận chuyển giao lại・hủy hay không (§4D-1). Mặc định không thanh toán,
                                            --   nếu true thì bắt buộc có lý do (2026/09/29〔quyết định v2.3 #40〕)
                                            --   (Cũ: redelivery_billable / redelivery_bill_reason 〈chỉ giao lại〉. Đổi tên 2026/09/29 〔quyết định v2.3 #40〕)
  coolbag_no NULL, coolant_no NULL,         -- Chỉ ghi nhận. Không có quản lý thu hồi (§12-7)
                                            -- 【Tạm thời】Phần qua Yamato là dùng một lần (không thu hồi) · 2026/09/21
  cash_expected_amount, cash_collected_amount, note

trouble_types                      -- ★Master loại sự cố (6 phân loại · §4A-4B). Tạo mới ở bổ sung 2026/09/29 〔quyết định v2.3 #30・#33〕
  code PK(qty_diff | wrong_delivery | damage | absent | delay | other),
  name, default_action,
  auto_child,                      -- ★Có tạo con tự động đồng thời với báo cáo hay không (bool). Giá trị ban đầu: giao nhầm・vắng mặt・hư hỏng = true /
                                   --   chênh lệch số lượng・chậm trễ・khác = false
  sort_order, status

trouble_app_reasons                -- ★Bảng đối ứng lựa chọn của ứng dụng → 6 phân loại (§4A-4B). Tạo mới ở bổ sung 2026/09/29 〔quyết định v2.3 #30・#33〕
  app_reason_raw PK,
  type_code NULL                   -- NULL = chưa xác định loại ("thiếu sản phẩm・giao nhầm". Vận hành gắn sau)

trouble_reports                    -- Báo cáo sự cố (§4A-4B)
  id, delivery_id,
  type_code NULL,                  -- trouble_types.code. ★NULL = chưa xác định loại (bổ sung 2026/09/29 〔quyết định v2.3 #33〕)
                                   --   (Cũ: type_code(qty_diff | … | other) là bắt buộc)
  reported_by(driver | carrier | customer | ops), note, reported_at,
  app_reason_raw NULL,             -- Nguyên văn lựa chọn của ứng dụng (không đổi màn hình mà đối ứng sang 6 phân loại bằng trouble_app_reasons · #66)
  -- (Cũ: auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes 〈thiết lập vận hành · bắt buộc. UTC〉.
  --   Quá mốc này mà resolved_at IS NULL thì trouble_auto_duplicate tạo con tự động 〔quyết định v2.3 #22・#26〕.
  --   Xóa 2026/09/29 〔quyết định v2.3 #30・#33〕. Thiết lập vận hành trouble_auto_duplicate_after_minutes cũng bị xóa)
  -- Dù đăng ký báo cáo cũng không đổi deliveries.status (〔quyết định v2.3 #20〕). Việc giải quyết do vận hành (hậu cần) thực hiện (§4A-4B).
  -- Đăng ký báo cáo = báo cáo + khóa giao hàng + (nếu là loại auto_child) con tự động + 2 mục cần xác nhận (trouble_open・
  --   trouble_auto_child_pending) + kiểm toán trong 1 transaction (bổ sung 2026/09/29 〔quyết định v2.3 #30・#33〕)
  -- "Thu hồi" của giao nhầm chỉ ghi vào note. Không giữ mục riêng cho ngày thu hồi・người thu hồi・số lượng thu hồi (#68)
  resolution(full | partial | partial_no_resend | redelivery | same_day_revisit | stop) NULL,
                                   -- ★Giao đủ toàn bộ / Giao một phần + con / Giao một phần (phần còn lại không gửi) / Giao lại / Quay lại trong ngày / Hủy
                                   --   (partial_no_resend bổ sung 2026/09/29 〔quyết định v2.3 #31〕. Khớp với DEV §14.7.
                                   --    Cũ: resolution(redeliver | substitute | discard | cancel | void))
  resolved_at,
  resolved_by,                     -- Vận hành (hậu cần). Với tự động giải quyết do chậm trễ thì là hệ thống (actor_type = system・〔quyết định v2.3 #32〕)
  resolution_reason
  -- Giải quyết theo đơn vị giao hàng: đóng tất cả báo cáo chưa giải quyết của chuyến giao đó trong 1 lần, ghi cùng resolution / resolved_at /
  --   resolved_by / resolution_reason vào từng báo cáo (bổ sung 2026/09/29 〔quyết định v2.3 #29〕)

delivery_lines                     -- ★Chi tiết thực tế = chi tiết theo sản phẩm của 1 dữ liệu giao hàng (quyết định lần 4 ngày 2026/09/23)
  id, delivery_id, product_id,
  planned_qty, delivered_qty,
  expiry_date NULL,                -- Hạn dùng tốt nhất / hạn tiêu dùng
  stock_before NULL, stock_after NULL,  -- Tồn kho thực tế trước và sau khi trưng bày (báo cáo của ứng dụng tài xế)
  disposed_qty NULL, note,
  substituted_from_product_id NULL,  -- ★Sản phẩm gốc được thay thế (2026/09/29〔quyết định v2.3 #39〕). product_id = sản phẩm thực tế đã giao.
                                   --   Thanh toán tính theo đơn giá của sản phẩm gốc. Đăng ký bằng giải quyết sự cố "giao đủ toàn bộ bằng hàng thay thế" và
                                   --   sửa thực tế (chỉ vận hành・bắt buộc có lý do)
  -- UNIQUE(delivery_id, product_id)
  -- Từ trước đến nay không có trong ER nào, không tồn tại nơi đặt báo cáo tồn kho thực tế・trước sau khi trưng bày・hủy bỏ.
  -- Giao từng phần (giao một phần) thì dữ liệu giao hàng con đã sao chép có delivery_lines riêng (không sửa của cha).
  -- Khác với chi tiết giao hàng của hợp đồng contract_delivery_lines. Chú ý đừng nhầm tên.

review_items                       -- ★Bảng thực của "cần xác nhận" (quyết định lần 4 ngày 2026/09/23 · §4A-5B)
  id,
  kind(plan_ungeneratable | plan_recheck | date_review | qty_missing | qty_mismatch |
       ship_order_failed | ship_order_diff | tracking_anomaly | shipment_result_ng |
       missing | assignment_missing | trouble_open | trouble_auto_child_pending | billing_gap | import_error |
       shelf_life_warning | change_request_due),
       -- ★shelf_life_warning: chú ý thời hạn tiêu dùng ngắn (đối tượng là dự định hoặc giao hàng. 2026/09/29〔quyết định v2.3 #35〕)
       -- ★change_request_due: đến hạn yêu cầu thay đổi (change_request_warn_days ngày trước hạn chót. 2026/09/29〔quyết định v2.3 #37〕)
       -- ★assignment_missing: đoạn cần phân công (self・partner_driver) mà đến ngày trước ngày giao vẫn chưa có người phụ trách
       --   (2026/09/29〔quyết định v2.3 #43・#48〕. Cũ: chưa phân công tại thời điểm lock・1 tuần trước ngày giao)
       -- ★trouble_open: báo cáo sự cố chưa giải quyết (đối tượng là giao hàng). Mở đồng thời với đăng ký báo cáo, đóng trong cùng transaction với
       --   giải quyết theo đơn vị giao hàng (bao gồm tự động giải quyết do chậm trễ) (bổ sung 2026/09/29 〔quyết định v2.3 #30・#33〕)
       -- ★trouble_auto_child_pending: con tự động của sự cố (đối tượng là con). Đóng trong cùng transaction với giải quyết sự cố
       --   (bổ sung 2026/09/24 〔quyết định v2.3 #22・#24・#26〕)
  target_type(shipping_plan | delivery | contract_month | invoice | import), target_id,
  business_date, detail_json,
  status(open | resolved | ignored),
  first_detected_at, last_detected_at,
  resolved_by NULL, resolved_at NULL, resolution_note NULL
  -- UNIQUE(kind, target_type, target_id) WHERE status = 'open'
  -- Batch chỉ thực hiện UPSERT, khi phát hiện lại cùng một vấn đề thì chỉ cập nhật last_detected_at.
  -- Trước đây mỗi lần đều tính bằng biểu thức điều kiện nên không có nơi để "đóng" các mục mà vận hành đã xử lý xong.
  -- Badge số lượng của lịch vận hành và danh sách cần xác nhận cùng đếm bảng này.

ship_orders                        -- Chỉ thị xuất hàng cho Thomas (§4D-3)
  id, delivery_id, warehouse_id, rev, qty, payload_hash,
  sent_at, sent_by, is_zeroed(bool),  -- Hủy thì gửi lại với qty=0. Không có I/F hủy
  send_status(pending | ok | failed), -- ★Kết quả gửi (thêm ở lần 2 ngày 2026/09/21)
  sent_ok_at NULL                     -- ★Thời điểm gửi thành công
  -- ★Điểm khởi đầu của locked là "send_status = ok lần đầu tiên". Ghi sent_ok_at đó vào
  --   deliveries.locked_at và đặt locked_source = ship_order_sent (§4A-3).
  --   Chỉ tạo file xuất ra・phần gửi thất bại thì không locked.
  --   Gửi lại (tăng rev) không làm thay đổi điểm khởi đầu của locked.

delivery_tracking_numbers          -- Mã vận đơn (1 chuyến giao có thể có nhiều, REQ-DL-303・§4D-2)
  id, delivery_id, tracking_no, carrier_id, issued_by(carrier_csv | manual | api | es_generated),
  box_no NULL, box_total NULL,     -- ★Số thùng・số lượng thùng khi es_generated (2026/09/29〔quyết định v2.3 #47〕)
  is_relay_leg(bool), status(active | voided), voided_reason NULL, created_at
  -- ★es_generated = chuyến lấy hàng do ES đánh số (2026/09/29〔quyết định v2.3 #47〕). Số = Số giao hàng + số thùng 2 chữ số
  --   (ví dụ DL-261020-0021-01). Khi gửi chỉ thị xuất hàng thành công thì tạo theo số thùng dự kiến, nếu số thùng
  --   thực tế xuất hàng khác thì thêm phần thiếu, phần thừa thì voided. Không hiển thị liên kết trang theo dõi.
  -- status được thêm ở quyết định lần 3 ngày 2026/09/22 (§4D-4・REQ-DL-889).
  -- Khi đổi địa chỉ nơi giao sau chỉ thị xuất hàng thì voided mã hiện có,
  -- sau khi chỉ thị xuất hàng rev mới gửi thành công thì phát hành lại. Không xóa dòng mà để lại.
  -- Nguyên tắc, ES không đánh số mà nhận và giữ mã do công ty giao hàng đánh số.
  -- Ngoại lệ: chuyến mà bên ủy thác đến lấy hàng tại kho thì ES đánh số dựa trên ID dữ liệu giao hàng (quyết định 2026/09/21).
  -- Dữ liệu giao hàng 1 : N mã vận đơn (xác định 2026/09/21). Không có xuất gộp (nhiều dữ liệu giao hàng trong 1 mã vận đơn).
  -- Chưa nhận một phần・giao một phần được phán định theo đơn vị mã vận đơn nên nhất định phải duy trì 1 nhiều.

site_attachments                   -- Tài liệu của địa điểm (sơ đồ lối vào・hướng dẫn・quy trình giữ hàng tại văn phòng)
  id, owner_type(site | warehouse | relay), owner_id,
  kind(route_map | manual | parking | other), audience(carrier | customer),
  file_path, uploaded_by, updated_at
  -- Gắn với master của cơ sở・điểm trung chuyển. Không sao chép vào dữ liệu giao hàng, màn hình chi tiết chỉ tham chiếu để hiển thị.
  -- Thay thế thực hiện ở phía master (không tạo thay thế chỉ riêng chuyến giao này · §4A-4C).

delivery_attachments               -- Tài liệu của chuyến giao này (ảnh trước và sau khi trưng bày・đỗ xe・thu tiền・báo cáo giao hàng)
  id, delivery_id, kind, audience(carrier | customer), file_path, uploaded_by, created_at
  -- Gắn với 1 dữ liệu giao hàng. Số nhánh (giao từng phần・giao lại) là hàng hóa khác nên giữ riêng.

invoices                           -- ★Hóa đơn (quyết định lần 2 ngày 2026/09/21 · §4D-1)
  id, contract_month_id, billing_month,
  billing_type(advance | settlement),  -- ① Trả trước / ② Quyết toán theo thực tế
  payment_due_date,                    -- Hạn thanh toán. Mỗi hóa đơn chỉ có 1
  issued_at, billone_ref, status
  -- ★Khóa phân chia: **billing_type** hoặc **payment_due_date**.
  --   Một hóa đơn chỉ có một hạn thanh toán. Nếu hạn khác nhau giữa trả trước và quyết toán theo thực tế thì
  --   làm **2 hóa đơn** (UNIQUE (contract_month_id, billing_type, payment_due_date)).
  --   Phương án chọn 1 hạn chung không được chọn vì khó thực hiện đối chiếu bù trừ thanh toán.
  -- (Cũ: lần 1 #71 "giữ hạn thanh toán trong thanh toán của hợp đồng con bằng 2 mục advance_payment_due_date /
  --   settlement_payment_due_date". Lần 2 ngày 2026/09/21 cụ thể hóa thành
  --   dạng "tách hóa đơn". 1 hóa đơn = 1 hạn thanh toán)
  -- Không thực hiện bù trừ thanh toán・quản lý tình trạng thanh toán (Bill One là chuẩn).

invoice_lines                      -- Chi tiết thanh toán (có điều chỉnh bên trong từng loại ① trả trước・② quyết toán theo thực tế)
  id, invoice_id, line_type(charge | adjustment),
  adjustment(refund | offset) NULL, plan_rate_generation, qty, amount, note
  -- "③ Điều chỉnh" không làm thành bảng độc lập (#70). Giữ dưới dạng dòng bên trong ① hoặc ②.

delivery_notifications             -- Thông báo chưa liên kết, v.v. (REQ-DL-304)
  id, delivery_id, type(unlinked_3d | unlinked_1d | confirmed_mail), sent_at, to
```

Index khuyến nghị: `shipping_plans(picking_date)` (màn hình 04), `shipping_plans(delivery_date)` (màn hình 05), `delivery_cycle_days(slot_code)`, `deliveries(delivery_date, site_id)` (màn hình 06・07), `delivery_tracking_numbers(tracking_no)` (tìm kiếm toàn cục).

**Batch** (**§11-1 là chuẩn. 11 batch**. Lần 2 ngày 2026/09/21 thêm `tracking_anomaly_detect` và `billing_issue`. Bổ sung 2026/09/24 thêm `trouble_auto_duplicate` thành 12 batch 〔quyết định v2.3 #25〕, nhưng **bổ sung 2026/09/29 bãi bỏ và trở về 11 batch**〔quyết định v2.3 #30〕. **Cũ: 12 batch**)

| Batch | Thực hiện | Xử lý |
|---|---|---|
| `contract_monthly_generate` | Hằng ngày 01:30 | Tạo hợp đồng con của chu kỳ chưa tạo đã qua ngày chuẩn tạo, và chụp snapshot phí (§4A-2B) |
| `plan_rollout` | Hằng ngày 02:00 + ngay sau khi lưu thiết lập | Tạo・tạo lại dự định giao hàng đến hết kỳ thiết lập (loại trừ từ `published` trở đi). Khóa là `contract_id + line_no + channel_id + cycle_id + occurrence_key`. Tuyến ưu tiên hợp đồng con・cha là dự phòng. Cũng nhập `estimated_qty`. Sau khi tạo thì áp dụng lại override đã phê duyệt |
| `delivery_materialize` | Hằng ngày 02:30 | Tạo xác định `draft` đã qua **ngày bắt đầu Order** thành dữ liệu giao hàng và cập nhật `lifecycle` thành `published` |
| `order_finalize` | Hằng ngày 02:45 | Xác định số lượng của chu kỳ đã qua ngày chốt Order và ghi vào dữ liệu giao hàng (§4A-2D). **`marker_source = provisional` nằm ngoài đối tượng** (§4A-2E) |
| `plan_recheck` | Hằng ngày 03:00 + ngay sau khi lưu thiết lập | Tính lại kiểm tra trước phê duyệt 1〜6 cho override đang áp dụng và `published`, tạo "cần xác nhận" (§4A-4E) |
| `billing_issue` | Hằng ngày 04:30 | Lập 1 hóa đơn cho mỗi `billing_type` × `payment_due_date` đối với hợp đồng con đã qua ngày xác định thanh toán (§4D-1・§7 `invoices`) |
| `billing_gap_detect` | Hằng ngày 05:00 | Phát hiện thiếu sót của hợp đồng con tháng thanh toán đã qua ngày xác định thanh toán (phát hiện sót thanh toán · §4A-2B) |
| ~~`trouble_auto_duplicate`~~ (**bãi bỏ 2026/09/29**〔quyết định v2.3 #30〕) | — | **Bãi bỏ.** Con tự động được tạo trong cùng transaction với đăng ký báo cáo sự cố・gắn lại loại (§4A-4C). **(Cũ: độc lập với chuỗi chính. Cùng ngày giờ vận hành thì trước 2 batch lúc 06:00 bên dưới. Với báo cáo sự cố chưa giải quyết dù đã quá `auto_duplicate_due_at`, không đổi trạng thái của cha (đã xuất・đã nhận・đã giao), tạo 1 con tự động (`確認中`・`trouble_pending`) và UPSERT mục cần xác nhận `trouble_auto_child_pending` 〈bổ sung 2026/09/24 〔quyết định v2.3 #22・#25〕〉)** |
| `delivery_presume_complete` | Hằng ngày 06:00 | Trong các dữ liệu giao hàng đã qua ngày giao, loại có **`delivery_regime` của final leg là `parcel_carrier`**, **`status = 出荷済` và không có báo cáo sự cố chưa giải quyết** thì chuyển thành "Đã giao (giả định)" (§4C-1・〔quyết định v2.3 #25〕) |
| `delivery_detect_missing` | Hằng ngày 06:00 | Đưa dữ liệu giao hàng có **final leg là `self` / `partner_driver`**, **`status IN (出荷済, 受取済)` và không có báo cáo sự cố chưa giải quyết** vào missing queue (cần xác nhận) (phát hiện thiếu giao・〔quyết định v2.3 #25〕) |
| `tracking_anomaly_detect` | Hằng ngày 07:00 | Phát hiện dữ liệu giao hàng có mã vận đơn mà không có ghi nhận gửi thành công chỉ thị xuất hàng, đưa vào cần xác nhận (phát hiện anomaly · §4A-3) |
| `ship_order_diff` | Hằng ngày 07:00 | Phát hiện chênh lệch giữa chỉ thị xuất hàng đã gửi lần cuối và dữ liệu giao hàng, đưa "cần gửi lại: N mục" vào cần xác nhận (§4D-3) |

> **5 batch hằng ngày** ở trên (`contract_monthly_generate` → `plan_rollout` → `delivery_materialize` → `order_finalize` → `plan_recheck`) được thực hiện bằng chuỗi job theo thứ tự này. Chi tiết・tính idempotent・trường hợp bất thường xem §11-1.

**Xử lý địa chỉ**: Thay đổi master địa chỉ nơi giao không tự động phản ánh vào bản ghi đã tạo, mà áp dụng cho bản ghi mới từ tháng sau trở đi (REQ-DL-124). Mặt khác, yêu cầu là màn hình hiển thị "địa chỉ đúng tại thời điểm đó theo từng ngày giao" (REQ-DL-314). Để dung hòa, **giữ địa chỉ dưới dạng snapshot khi tạo dữ liệu giao hàng** (`deliveries.address_snapshot`), hiển thị・phiếu giao hàng・phiếu vận chuyển tham chiếu snapshot.

**Snapshot khung giờ nhận hàng・điều kiện giao hàng** (quyết định lần 2 ngày 2026/09/21): Chép vào cùng thời điểm với địa chỉ (**khi tạo xác định dữ liệu giao hàng**). Khung giờ nhận hàng có thể có nhiều dòng chứ không chỉ 1 cặp nên **sao chép `site_receive_windows` nguyên danh sách sang `delivery_receive_windows`** (cũng giữ `sort_order`). Điều kiện giao hàng giữ 1 mục ở `deliveries.delivery_condition_snapshot`. Ở giai đoạn dự định (`draft`) không snapshot mà tham chiếu master cơ sở. Con tạo bằng sao chép (số nhánh) **sao chép nguyên snapshot của cha**, không lấy lại master cơ sở tại thời điểm sao chép.

**Dữ liệu liên kết bên ngoài**

| Đích liên kết | Dữ liệu | Phương thức | Chính sách hiện tại |
|---|---|---|---|
| Thomas (kho) | CSV chỉ thị xuất hàng / CSV thực tế xuất hàng (mã vận đơn) | CSV (hai chiều) | Tự động xuất theo định dạng chuẩn của Thomas (REQ-DL-317). Hỗ trợ UTF-8 đang xác nhận với nhà cung cấp |
| Yamato Transport và các đơn vị ủy thác khác | Mã vận đơn | Nhập CSV | Chuyển đổi bắt buộc / không cần mã vận đơn tùy phương thức giao hàng (REQ-DL-116) |
| Tình trạng giao hàng của từng công ty giao hàng | Trạng thái giao hàng | **Liên kết ngoài** | Không liên kết API mà chuyển đến trang liên hệ của từng công ty. **API Yamato là giai đoạn 3** (xác nhận 2026/09/21. Cũ: "bỏ qua ở giai đoạn 2"). REQ-DL-414 cập nhật chính sách của REQ-DL-212／317 |
| Công ty giao hàng ủy thác | Yêu cầu báo giá・trả lời, email xác định, CSV chi tiết thu tiền | Màn hình + email + CSV | Xuất CSV bao gồm chi tiết theo từng cơ sở (văn phòng) (REQ-DL-507) |

---

## 8. Vấn đề chưa quyết định・Mục cần xác nhận khi triển khai

> **Vấn đề về thời hạn đưa "Đã giao" trở lại "確認中" không còn nữa** (bổ sung 2026/09/24〔quyết định v2.3 #20〕). Liên hệ sau khi giao vẫn giữ `納品済`, xử lý bằng báo cáo sự cố và cần xác nhận, không đưa trở lại `確認中` (§4A-4C). Việc không đặt thời hạn tiếp nhận (#61) vẫn không đổi.

> **Cách xử lý khi tháng chu kỳ ngang bằng 14 đối 14 đã được giải quyết** (quyết định lần 2 ngày 2026/09/21). Định nghĩa **tháng chu kỳ = tháng mà ô thứ 14 `B7` thuộc về**, khi bằng nhau thì tự động là tháng trước (§4.2). Vì không tạo nhánh ngoại lệ nên không để lại như vấn đề chưa quyết.

> **Các mục đã quyết định ngày 2026/09/21 đã được loại khỏi bảng này.** Nội dung quyết định nằm ở `01_仕様/00_Quyết_định/Cần_xác_nhận_Trả_lời_20260921.md` (trả lời 84 mục cần xác nhận). Bảng này chỉ giữ lại 6 mục dưới đây trong phần G "Chưa quyết định" của tài liệu đó mà quyết định lần 2 (`Quyết_định_v2.1_20260921.md`) chưa giải quyết (**14 đối 14 của tháng chu kỳ đã được giải quyết ở lần 2 nên đã loại**).
>
> Đồng thời, những mục được ghi vào nội dung chính là **【Tạm thời】** (`HU` = Hub・mã kho・nguồn dữ liệu ngày lễ・tên gọi công ty giao hàng / hệ thống kho・cách xử lý túi giữ lạnh・số điện thoại liên hệ) sẽ được thay nội dung chính khi vận hành xác nhận xong. Không đưa vào vấn đề chưa quyết. **6 mục tạm thời này tiếp tục triển khai với giá trị tạm thời**. Lập 6 mục thành 1 bảng xác nhận gửi cho vận hành, khi có trả lời sẽ thay nội dung chính (2026/09/29〔quyết định v2.3 #44〕).
>
> **Bổ sung 4 ngày 2026/09/29 〔quyết định v2.3 #34〜#51〕 đã giải quyết #1・#5・#6.** Các mục giao cho Yamato là 【Tạm thời】 chờ xác nhận từ Yamato (§4D-3・〔quyết định v2.3 #46〕).

| # | Mục | Vấn đề |
|---|---|---|
| ~~1~~ | ~~Phạm vi dự định hiển thị trên trang chuyên dụng của công ty giao hàng~~ | ✅ **Giải quyết 2026/09/29 〔quyết định v2.3 #34・#51〕.** Phần đã xác định thì tất cả các mục, dự định thì **chỉ đến chu kỳ tháng sau・ngày giao・tên cơ sở・nhóm nhiệt độ・số lượng mục** (không hiển thị số lượng). Chỉ thấy các chuyến giao có đoạn do công ty mình phụ trách (§4C-4). (Cũ: chưa quyết hiển thị trước bao nhiêu tháng・đến mục nào) |
| ~~2~~ | ~~Số lượng đổi ngày sau hạn chót~~ | ✅ **Giải quyết bởi quyết định lần 3 ngày 2026/09/22.** Sau hạn chót không đổi ngày mà **hủy + sao chép** nên cách vận hành đổi từng mục không còn nữa (§4A-5). Kỳ nghỉ liền nhiều ngày vẫn tiếp tục dồn về chuyển hàng loạt bằng tạm dừng chu kỳ |
| 3 | Xác nhận đặc tả hiện hành về thanh toán・hợp đồng / màn hình chi tiết yêu cầu | Ngày 2026/09/19 mới thực hiện đến xác nhận đặc tả hiện hành liên quan giao hàng. Còn lại **xác nhận đặc tả hiện hành về thanh toán・hợp đồng và màn hình chi tiết yêu cầu**. **Giải quyết một phần**: có phần đã tiến triển nhờ quyết định ngày 9/25 (phát hành hóa đơn)・9/28 (liên quan yêu cầu) (bổ sung 4 ngày 2026/09/29) |
| ~~4~~ | ~~Cách vận hành khi muốn xuất hàng vào ngày dừng do điều chỉnh (thực tế không nghỉ)~~ | ✅ **Giải quyết bởi quyết định lần 3 ngày 2026/09/22.** Ngày điều chỉnh không tự động vào mà **người quản trị quyết định nơi đặt**, nên nếu có ngày muốn xuất hàng thì chuyển ngày điều chỉnh đó sang ngày khác (§2.2) |
| ~~5~~ | ~~Chỉ thị xuất hàng của Thomas có I/F hủy hay không~~ | ✅ **Giải quyết 2026/09/29〔quyết định v2.3 #45〕.** Hủy **xác định theo phương thức gửi lại (phiên bản mới có số lượng 0)**. Dù có I/F hủy cũng không dùng. CSV triển khai với các mục tối thiểu, làm sao để có thể thay riêng phần xuất ra (nếu UTF-8 không được thì chuyển sang Shift_JIS khi xuất). Thứ tự・tên cột chờ nhà cung cấp (§4D-3). (Cũ: tiến hành theo phương thức gửi lại, nhưng cần xác nhận với nhà cung cấp) |
| ~~6~~ | ~~Điều kiện phán định tự động cho thay đổi có sản phẩm thời hạn tiêu dùng ngắn~~ | ✅ **Giải quyết 2026/09/29〔quyết định v2.3 #35〕.** Số ngày từ ngày xuất hàng đến ngày giao > `products.shelf_life_days` − `shelf_life_safety_days` (mặc định 2 ngày) thì cần xác nhận `shelf_life_warning`. Việc chia tách vẫn do vận hành phán đoán như trước (§4A-5・REQ-DL-624). (Cũ: chưa có ngưỡng) |
| 7 | Trường hợp chỉ một phần thùng không đến khi hoàn thành giả định | Với chuyến giao **hoàn thành giả định (`presumed`) mà chỉ một phần thùng không đến**, có được chuyển sang `一部納品済` không (bổ sung 2026/09/29 chỉ cho phép 再配達待・中止 · §4A-4B・〔quyết định v2.3 #27〕). Là trường hợp biết được mất mát theo đơn vị mã vận đơn. Thanh toán theo thực tế |

---

## 9. Nhất quán với yêu cầu giao hàng (sắp xếp 2026-09-12)

Liệt kê quan hệ tương ứng giữa yêu cầu của 『Đặc tả yêu cầu chi tiết Picking・Xuất hàng・Giao hàng・Tài xế』 và tài liệu này, cùng các điểm còn chưa nhất quán. **Chuẩn của logic tính lịch là tài liệu này**, chuẩn của yêu cầu nghiệp vụ・ID yêu cầu là đặc tả yêu cầu đó.

### 9-1. Quan hệ tương ứng

| ID yêu cầu | Tóm tắt yêu cầu | Nơi phản ánh trong tài liệu này |
|---|---|---|
| REQ-DL-201 | Chuyển lịch sang dựa trên ngày giao | §0 Nguyên tắc, §3.3, §4.4 (ngày giao là chuẩn・ngày picking tính ngược) |
| REQ-DL-202 | Định nghĩa trước việc đẩy sớm / lùi lại, khi không đẩy sớm được thì lùi lại + cảnh báo | §3.1 Đẩy sớm・lùi lại (hợp đồng = đơn vị cơ sở), §4.4 Dự phòng |
| REQ-DL-203 | Ngày lễ・kỳ nghỉ dài tự động điều chỉnh bằng thiết lập tạm dừng chu kỳ | §2.2, §4.2 (tạm dừng không tiêu thụ ô) |
| REQ-DL-204 | Làm nổi bật dữ liệu di chuyển thủ công | §4.5 |
| REQ-DL-301/302 | Tách xuất hàng đông lạnh・lạnh, biểu tượng đông lạnh | §0 Nhóm nhiệt độ, §3.1, §3.2, §4.4 |
| REQ-DL-303/304 | Nhiều mã vận đơn, thông báo chưa liên kết (3 ngày trước・1 ngày trước) | §5.4, §7 `delivery_tracking_numbers` |
| REQ-DL-305 | Hợp nhất yêu cầu thay đổi với chi tiết giao hàng, tên người yêu cầu, sửa sau khi bị từ chối | §3.4 |
| REQ-DL-306 | ~~Kỳ thiết lập tối đa 12 tháng~~ → **cơ bản 6 tháng**・ngày bắt đầu từ tháng này trở đi (sửa 2026/09/12・xác nhận 2026/09/21) | §2.3 (giá trị triển khai là 9-2 #2) |
| REQ-DL-307 | Thứ tự ưu tiên giữa tạm dừng và ngày nghỉ, lấy ngày lễ từ DB + chỉnh sửa tại hiện trường | §2.2, §2.3 |
| REQ-DL-308 | Chia lịch theo xuất hàng / giao hàng, di chuyển hàng loạt từ hôm nay trở đi | §1.1, §5.2／5.3, §5.4 |
| REQ-DL-309 | Chi tiết dữ liệu giao hàng hợp nhất trong 1 màn hình, danh sách từ hôm nay〜cuối tháng này | §1.1 Màn hình 06, §5.4 |
| REQ-DL-312 | Lịch dành cho doanh nghiệp (chu kỳ・ngày lễ・tìm kiếm・thực tế) | §1.1 Màn hình 07 |
| REQ-DL-314/124 | Hiển thị địa chỉ tại thời điểm ngày giao / thay đổi master từ tháng sau | §7 Xử lý địa chỉ (snapshot) |
| REQ-DL-410/411/412 | Tạo mới master kho, tuyến giao hàng thay đổi được, master công ty giao hàng | §0, §3.1, §7 |
| REQ-DL-414 | Tình trạng giao hàng là liên kết ngoài (**API Yamato là giai đoạn 3** · xác nhận 2026/09/21) | §7 Dữ liệu liên kết bên ngoài |
| REQ-DL-501/502 | Picking theo phương thức chọn ô chu kỳ, hạn chế thay đổi vắt qua | §2.3 Ô chu kỳ không dùng được, §3.4 |
| REQ-DL-507 | Xuất CSV chi tiết thu tiền theo từng văn phòng | §7 Dữ liệu liên kết bên ngoài |

### 9-2. Chưa nhất quán・Cần xác nhận

> Số của "Tùy chọn đặc tả" trên UI mock có phần khác với bảng này (#7 = đơn vị giữ thiết lập = #9 của bảng này). Phía demo đã khớp với số của đặc tả yêu cầu 8F-6.

| # | Vấn đề | Tài liệu này | Phía đặc tả yêu cầu | Việc cần quyết định |
|---|---|---|---|---|
| ~~1~~ | ~~Thứ trong tuần của ngày đầu chu kỳ~~ | **Quyết định (2026/09/12)**: cố định vào thứ Hai. Nhập ngày không phải thứ Hai thì làm tròn về thứ Hai ngay trước (sửa REQ-DL-203) | — | Hoàn tất |
| ~~2~~ | ~~Giới hạn trên của kỳ tạo~~ | **Quyết định (2026/09/12)**: cơ bản 6 tháng. Thống nhất thiết lập・hiển thị・phạm vi có thể yêu cầu đều là 6 tháng (sửa REQ-DL-306) | — | Hoàn tất |
| ~~3~~ | ~~Ngày chỉ định của chế độ special~~ | **Quyết định (2026/09/12)**: master chỉ có 2 loại "ngày N hằng tháng / ngày cuối tháng". Bất thường một lần được xử lý bằng sửa trực tiếp dữ liệu giao hàng (§3.2) | — | Hoàn tất |
| ~~4~~ | ~~Giới hạn picking/giao hàng~~ | **Quyết định (2026/09/12)**: không dừng xử lý, cảnh báo ngày mà **số mục trong 1 ngày** vượt ngưỡng. Ngưỡng là giá trị thiết lập | — | Hoàn tất (chỉ còn cần quyết giá trị ban đầu của ngưỡng) |
| ~~5~~ | ~~Thay đổi có sản phẩm hạn dùng ngắn~~ | **Quyết định (2026/09/12)**: Không được・chuyển đổi・cần xác nhận phải luôn hiển thị lý do. **Việc chia tách** phần thời hạn tiêu dùng ngắn **không tự động phán định mà vận hành quyết định**. **Hạn chót tiếp nhận khớp với hạn chót của kỳ Order** (REQ-DL-128) | — | Hoàn tất |
| 6 | ~~Phạm vi đổi ngày giao do doanh nghiệp~~ | **Quyết định (2026/09/12)**: có thể yêu cầu đến hết kỳ chu kỳ giao hàng đã tạo (tối đa 6 tháng sau). Tháng chưa hoàn tất thiết lập thì không thuộc đối tượng hiển thị・yêu cầu (§3.4, REQ-DL-609) | — | Hoàn tất |
| ~~10~~ | ~~Xử lý nhiều kho~~ | **Quyết định (2026/09/12)**: hợp đồng giữ theo phân loại giao hàng (nhóm nhiệt độ・vật tư × kho × công ty giao hàng). Lead time theo kho, điều kiện hoạt động lấy master kho là chuẩn, đổi kho từ tháng áp dụng, CSV chỉ thị xuất hàng theo kho | — | Hoàn tất |
| 7 | Nguồn lấy dữ liệu ngày lễ | Tham chiếu ngày lễ đã đăng ký trong hệ thống (không nhập từ bên ngoài) | Xác định loại・nội dung DB nguồn lấy (8C-8) | **【Tạm thời】Nhập thủ công dữ liệu công khai của Văn phòng Nội các mỗi năm 1 lần** (2026/09/21・§6). Bản chất của DB đã tham chiếu ở hệ thống hiện có đang chờ vận hành xác nhận |
| 9 | Đơn vị giữ thiết lập | **Quyết định (2026/09/12)**: Đẩy sớm・lùi lại・thứ không giao được・ngày không nhận được・lead time・ngày chuyển đổi・ngày bắt đầu áp dụng được giữ theo **đơn vị hợp đồng (cơ sở)** (sửa REQ-DL-202) | — | Hoàn tất |
| ~~8~~ | ~~Sửa dự định đã tạo~~ | **Quyết định (2026/09/12)**: Dùng `draft / published / locked`, bảo vệ cái đã phê duyệt (**sửa 2026/09/18**: đổi cách bảo vệ từ cờ pinned sang override đã phê duyệt · §4A-4). Ảnh hưởng đến `published` là cảnh báo "cần xác nhận" (§4A-5, REQ-DL-612) | — | Hoàn tất |

---

## 10. Đề xuất cho các vấn đề chưa quyết định (2026-09-12)

Đề xuất muốn tiến hành theo phương án này đối với các vấn đề còn lại ở §8・§9-2. Nếu không có ý kiến phản đối thì sẽ quyết định và phản ánh vào từng chương.

### 10-1. Liên quan đến vận hành

| # | Vấn đề | Đề xuất | Lý do |
|---|---|---|---|
| 1 | Có quên tạo xác định lần thiết lập đầu tiên không | **Không dựa vào trí nhớ của người.** Hệ thống phát hiện "dự định giao hàng đã qua hạn chốt Order mà chưa có dữ liệu giao hàng", hiển thị ① "Cần tạo xác định: N mục" trong modal hoàn tất lưu thiết lập, ② **thường trực trong cảnh báo cần xác nhận** của lịch vận hành, ③ nút để **tạo xác định hàng loạt** từ đó. Cho đến khi giải quyết thì cảnh báo không mất, batch hằng ngày cũng phát hiện lại | Dựa vào vận hành thủ công thì chắc chắn sẽ sót. Điều kiện phát hiện rõ ràng nên hệ thống có thể bắt được |
| 2 | Phân bổ số lượng cho phân loại giao hàng | **Hợp đồng không giữ tỷ lệ. Giai đoạn dự định không giữ số lượng** (chỉ phân loại・ngày giao・ngày picking・kho), khi tạo xác định thì **xác định số lượng từng phân loại từ nội dung Order đã xác định**. Tỷ lệ cấu thành của hợp đồng chỉ dừng ở hiển thị tham khảo trên màn hình | Số lượng được quyết định bằng Order hằng tháng. Theo chính sách không cho doanh nghiệp xem số lượng giai đoạn dự định (§4A-7), phán định tải cũng dựa trên số mục (§5.2) nên dự định không cần số lượng |
| 3 | Giữ chỗ tồn kho theo kho | Giai đoạn dự định không giữ chỗ. **Khi tạo xác định thì giữ chỗ tồn kho kho**, dù thiếu cũng không dừng việc tạo mà đưa ra **cần xác nhận** là "thiếu tồn kho" | Tồn kho của 6 tháng sau chưa xác định. Nếu dừng thì vận hành không tiến triển nên làm sao để nhận ra và vận hành phán đoán |
| 4 | Thêm・đóng kho | Thêm: không tự động di chuyển dự định hiện có (**từ tháng áp dụng** khi đổi phân loại giao hàng của hợp đồng). Đóng: giữ **ngày dự định đóng** trong master kho, từ ngày đó trở đi không chọn được làm nơi phân bổ. Liệt kê các hợp đồng còn dự định sau ngày đóng, vận hành chuyển giao | Khớp với quyết định đổi kho từ tháng áp dụng (REQ-DL-630) |
| 5 | Dự định âm thầm thay đổi do tính toán lại | Không thông báo cho doanh nghiệp (đã quyết định). Thay vào đó hiển thị **"Ngày cập nhật cuối"** trên lịch doanh nghiệp và **dấu thay đổi** ở dự định có ngày bị dịch chuyển do lần tính lại gần nhất | 6 tháng × mỗi lần đổi thiết lập đều thông báo thì quá nhiều thông báo. Chỉ để lại phương tiện để nhận ra |
| 6 | Tách đông lạnh・lạnh thì lịch doanh nghiệp thành 2 mục/ngày | **Phía doanh nghiệp hiển thị gộp thành 1 mục theo đơn vị giao hàng (nhận hàng)**, mở chi tiết thì hiển thị chi tiết theo từng phân loại (mã vận đơn・trạng thái・thực tế). Phía vận hành・kho giữ chi tiết theo từng phân loại | Với doanh nghiệp, "ngày đó hàng được giao" là 1 mục. Không hiển thị nguyên hoàn cảnh vận hành |
| 7 | Nguồn lấy dữ liệu ngày lễ | Lấy master ngày lễ của hệ thống làm **nguồn tham chiếu duy nhất**, không tạo nhập từ bên ngoài (đã quyết định). Quyết định **người phụ trách và thời điểm cập nhật hằng năm 1 lần** (ví dụ: tháng 12 năm trước đăng ký phần năm sau) thành quy tắc vận hành, bù đắp bằng cơ chế thêm・xóa từ màn hình | Vì không tạo chức năng nhập nên nếu không có quy tắc vận hành sẽ sót khi sang năm |

### 10-2. Liên quan đến dữ liệu・tính toán

| # | Vấn đề | Đề xuất | Lý do |
|---|---|---|---|
| 8 | Khi chuỗi chuyển đổi chạm giới hạn 20 ngày | Cắt ngang và đưa ra **cần xác nhận là "không tạo được dự định"** (kèm hợp đồng・cơ sở・chu kỳ・lý do đối tượng). Phạm vi tự động tìm giới hạn **trong cùng chu kỳ** | Tìm vô hạn thì cũng đến những ngày không có ý nghĩa nghiệp vụ |
| 9 | Lệch tháng của tên chu kỳ và đơn vị thanh toán | **Thanh toán chốt theo tháng dương lịch.** Tên chu kỳ (`2026年10月 配送サイクル`) chỉ coi là nhãn hiển thị, đối tượng thanh toán được phán định theo **tháng dương lịch của ngày giao** | Thanh toán khớp với cách chốt hiện có thì an toàn hơn. Chu kỳ là hoàn cảnh hậu cần |
| 10 | Phân bổ trùng cùng Slot | **~~Cùng Slot + cùng phân loại giao hàng là lỗi~~ → không áp dụng theo quyết định lần 3 ngày 2026/09/22.** Dù trong cùng hợp đồng có 2 chuyến giao trùng ô cũng không thành vấn đề, **hiển thị tag cảnh báo và lưu được** (giữ nguyên hành vi hiện tại · §3.2). Khóa duy nhất của dự định là `contract_id + line_no + channel_id + cycle_id + occurrence_key` nên 2 mục cùng ô thành 2 bản ghi riêng | Trong thực tế có khi xử lý hàng lỗi mà xuất 2 mục cùng ô, không có lý do để hệ thống chặn (REQ-DL-892) |
| 11 | Mức chênh lệch cho phép của lead time thực | Hiển thị bình thường đến **dài hơn giá trị thiết lập 1 ngày**, **từ 2 ngày trở lên** thì cần xác nhận. **Ngắn hơn giá trị thiết lập thì cảnh báo ngay** (vì là hướng không kịp) | Đẩy sớm liên quan trực tiếp đến tồn kho・độ tươi nên xem xét nghiêm hơn |
| 12 | Kỳ tạm dừng không thành nơi chuyển đổi đến | **Xác định giữ nguyên đặc tả hiện tại** (ngày tạm dừng không phát sinh giao hàng cũng như picking, và cũng không thành nơi chuyển đổi đến) | Tạm dừng là ngừng toàn công ty. Dồn về đó cũng không xuất hàng được |
| 13 | ID dự định và thời gian lưu giữ | ID dự định là `PL-YYMMDD-số thứ tự` (dựa trên ngày giao), sau khi xác định thì chuyển sang `DL-…`. Dự định vẫn để lại làm lịch sử sau khi xác định, **xóa sau 24 tháng gần nhất** | Cần truy vết dự định quá khứ cho yêu cầu thay đổi và kiểm toán |
| 14 | Yêu cầu đồng thời cho cùng 1 dự định | Khi còn yêu cầu chưa xử lý thì **không yêu cầu trùng**. Khi thay đổi hàng loạt của vận hành mâu thuẫn với yêu cầu thì không ưu tiên bên sau thắng, mà **đưa yêu cầu vào cần xác nhận để vận hành phán đoán** | Khớp với quan điểm bảo vệ cái đã phê duyệt (§4A-4) |

---

## 11. Đề xuất hướng tới triển khai — Batch・Kiểm toán・Quyền hạn・Phi chức năng・Di chuyển dữ liệu (2026-09-12)

Đề xuất 5 điểm còn thiếu của đặc tả. **Batch được thiết kế với tiền đề catch-up hằng ngày (hằng ngày nhặt các phần chưa xử lý đã qua ngày chuẩn)** (sửa 2026/09/15・xác nhận 2026/09/21. Cũ: "về cơ bản thực hiện vào thứ Hai"). Mốc của chu kỳ không cố định theo ngày dương lịch, A1 cũng không trùng với ngày 1 dương lịch nên tiền đề chạy vào một thứ cụ thể không thành lập (§4A-2・§11-1).

### 11-1. Thiết kế batch

| Job | Thực hiện | Xử lý |
|---|---|---|
| `contract_monthly_generate` | **Hằng ngày 01:30** | Tạo hợp đồng con cho "chu kỳ chưa tạo đã qua ngày chuẩn tạo hợp đồng con" và cố định snapshot phí. Vì theo lead time thanh toán nên có khi đi trước dữ liệu giao hàng (§4A-2B). Trả trước 1 năm một lần thì tạo gộp phần 12 chu kỳ |
| `plan_rollout` | **Hằng ngày 02:00** + ngay sau khi lưu thiết lập chu kỳ giao hàng | Tạo dự định giao hàng đến cuối kỳ thiết lập, tạo lại `draft` rồi áp dụng lại override đã phê duyệt. **Khóa là `contract_id + line_no + channel_id + cycle_id + occurrence_key`**. **Tuyến lấy từ snapshot của hợp đồng con nếu có, nếu không có thì từ giá trị mặc định của cha** và lưu ở `route_snapshot_source` (quyết định lần 2 ngày 2026/09/21). **Cũng nhập `estimated_qty` (số lượng dự định)** (`draft` chỉ là không cho doanh nghiệp xem) |
| `delivery_materialize` | **Hằng ngày 02:30** | Tạo xác định dữ liệu giao hàng cho "`draft` đã qua **ngày bắt đầu Order**" và đặt `lifecycle` thành `published`. Đồng thời tạo ô Order, nếu hợp đồng con chưa được tạo thì tạo ở đây |
| `order_finalize` | **Hằng ngày 02:45** | Xác định số lượng Order của "chu kỳ đã qua ngày chốt Order" và ghi số lượng đã xác định vào dữ liệu giao hàng. Doanh nghiệp chưa đặt thì xác định bằng số lượng chuẩn (§4A-2). **Chu kỳ `marker_source = provisional` (hạn chót tạm) nằm ngoài đối tượng** (quyết định lần 2 ngày 2026/09/21・§4A-2E) |
| `plan_recheck` | **Hằng ngày 03:00** + ngay sau khi lưu thiết lập | Tính lại kiểm tra trước phê duyệt 1〜6 cho override đang áp dụng và `published`, đưa những mục không thành lập vào "cần xác nhận" (§4A-4E). **Bổ sung 2026/09/29**: UPSERT thời hạn tiêu dùng ngắn `shelf_life_warning`〔quyết định v2.3 #35〕, đến hạn yêu cầu thay đổi `change_request_due` (từ 3 ngày trước hạn chót・không tự động từ chối)〔#37〕, **đoạn cần phân công (`self`・`partner_driver`) mà đến ngày trước ngày giao vẫn chưa có người phụ trách** `assignment_missing`〔#43・#48〕 (DEV §16.5) |
| `billing_issue` | **Hằng ngày 04:30** | Lập hóa đơn của hợp đồng con đã qua ngày xác định thanh toán. Tạo **1 hóa đơn cho mỗi cặp `billing_type` và `payment_due_date`** (trả trước và quyết toán theo thực tế có hạn khác nhau thì 2 hóa đơn · §4D-1・§7 `invoices`). **Không ghi 2 hạn thanh toán trong 1 hóa đơn** |
| `billing_gap_detect` | **Hằng ngày 05:00** | Với tháng thanh toán đã qua ngày xác định thanh toán, phát hiện hợp đồng hiệu lực mà không có hợp đồng con và đưa vào "cần xác nhận" (**phát hiện sót thanh toán** · §4A-2B) |
| ~~`trouble_auto_duplicate`~~ (**bãi bỏ 2026/09/29**〔quyết định v2.3 #30〕) | — | **Bãi bỏ.** Con tự động được tạo trong cùng transaction với đăng ký báo cáo sự cố (hoặc gắn lại loại) (§4A-4C・DEV §13.2.1・§15.12.1). Cũng không giữ hạn (`auto_duplicate_due_at`) và số phút của thiết lập vận hành. (Cũ: Thực hiện = độc lập với chuỗi chính. Cùng ngày giờ vận hành thì trước `delivery_presume_complete`／`delivery_detect_missing` (bổ sung 2026/09/24 〔quyết định v2.3 #25〕) / Đối tượng: `trouble_reports.resolved_at IS NULL` và `auto_duplicate_due_at <= ngày giờ vận hành` và `status IN (出荷済, 受取済, 納品済)` của cha và chưa có con giữ báo cáo đó ở `source_trouble_report_id`. Mỗi mục 1 transaction: ① khóa báo cáo sự cố và cha ② xác nhận lại chưa giải quyết và trạng thái của cha (không đổi cha thành 確認中) ③ đưa ra ngày dự kiến tạm để hiển thị ④ tạo con theo quy tắc sao chép §4A-4C (`duplicate_type = trouble_pending`・`creation_source = trouble_timeout`・`source_trouble_report_id`・`確認中`・2 cờ xác định là false) ⑤ số lượng・chi tiết là tạm ở mức tối đa có thể gửi lại (ngoài đối tượng chỉ thị xuất hàng・thanh toán) ⑥ UPSERT cần xác nhận `trouble_auto_child_pending` (đối tượng là con) ⑦ nhật ký kiểm toán (`actor_type = system`・ID tương quan của batch). Ràng buộc duy nhất của `source_trouble_report_id` là chốt chặn cuối, nếu transaction khác đã tạo trước thì coi là thành công và bỏ qua (DEV §16.8.1). Bãi bỏ 2026/09/29) |
| `delivery_presume_complete` | **Hằng ngày 06:00** | Trong các dữ liệu giao hàng đã qua ngày giao, chuyển loại có **`delivery_regime` của final leg (`is_final_leg = true`) là `parcel_carrier` (công ty vận chuyển giao trực tiếp)** thành "**Đã giao (giả định)**" (§4C-1). **Đối tượng chỉ là loại `status = 出荷済` và không có báo cáo sự cố chưa giải quyết** (bổ sung 2026/09/24 〔quyết định v2.3 #25〕). **Loại final leg là `self` / `partner_driver` (ứng dụng tài xế của ES) nằm ngoài đối tượng** |
| `delivery_detect_missing` | **Hằng ngày 06:00** | Phát hiện dữ liệu giao hàng có **final leg là `self` / `partner_driver`** mà sáng hôm sau vẫn không phải "**Đã giao**・Hủy bỏ・Hủy" và đưa vào **missing queue (cần xác nhận)** (**phát hiện thiếu giao**). **Đối tượng chỉ là loại `status IN (出荷済, 受取済)` và không có báo cáo sự cố chưa giải quyết** (bổ sung 2026/09/24 〔quyết định v2.3 #25〕). Không đổi trạng thái |
| `tracking_anomaly_detect` | **Hằng ngày 07:00** | Phát hiện dữ liệu giao hàng **có mã vận đơn mà không có ghi nhận gửi thành công chỉ thị xuất hàng**, đưa "Mã vận đơn được gắn trước chỉ thị xuất hàng: N mục" vào cần xác nhận (**phát hiện anomaly** · §4A-3 · thêm ở lần 2 ngày 2026/09/21) |
| `ship_order_diff` | **Hằng ngày 07:00** | Phát hiện chênh lệch giữa chỉ thị xuất hàng đã gửi lần cuối và dữ liệu giao hàng, đưa "cần gửi lại: N mục" vào cần xác nhận (§4D-3) |

**Job không chạy ở chu kỳ có hạn chót tạm (`marker_source = provisional`)** (quyết định lần 2 ngày 2026/09/21 · §4A-2E)

| Job・Xử lý | Khi hạn chót tạm |
|---|---|
| `order_finalize` (xác định số lượng) | **Ngoài đối tượng** (nhặt sau khi đăng ký menu và `marker_source = menu`) |
| Gửi email xác định (doanh nghiệp・công ty giao hàng ủy thác) | **Không gửi** |
| Gửi chỉ thị xuất hàng (liên kết Thomas). Do đó cũng không đặt `locked` | **Không gửi** |
| Đóng hạn chót tiếp nhận thay đổi (tắt chế độ đổi ngày) | **Chạy** |
| `plan_recheck` và các kiểm tra・tạo cần xác nhận khác | **Chạy** |

- **5 batch hằng ngày** ở trên (`contract_monthly_generate` → `plan_rollout` → `delivery_materialize` → `order_finalize` → `plan_recheck`) được thực hiện bằng **chuỗi job theo thứ tự này**, nếu bước trước thất bại thì bước sau không chạy. `billing_issue` / `billing_gap_detect` và 4 batch liên quan thực tế giao hàng (`delivery_presume_complete`・`delivery_detect_missing`・`ship_order_diff`・`tracking_anomaly_detect`) chạy độc lập. **(Cũ: `trouble_auto_duplicate` cũng chạy độc lập và chạy trước `delivery_presume_complete`／`delivery_detect_missing` cùng ngày giờ vận hành 〈bổ sung 2026/09/24 〔quyết định v2.3 #25〕〉. Bãi bỏ 2026/09/29 〔quyết định v2.3 #30〕)**
- `delivery_presume_complete` và `delivery_detect_missing` là job **chia đối tượng theo final leg** (quyết định lần 2 ngày 2026/09/21. **Cũ: "nhìn cùng đối tượng từ hai phía ngược nhau". Cái trước là chuyến công ty vận chuyển, cái sau là toàn bộ gồm cả tự giao**). Cái trước hoàn thành phần **final leg do công ty vận chuyển giao trực tiếp**, cái sau đưa vào missing queue phần **final leg là ứng dụng tài xế của ES** mà chưa hoàn thành. **Đối tượng không chồng nhau nên không xảy ra sót hay tính trùng.** Thứ tự là hoàn thành giả định → phát hiện thiếu giao (cũ: `trouble_auto_duplicate` → hoàn thành giả định → phát hiện thiếu giao. Bãi bỏ 2026/09/29 〔quyết định v2.3 #30〕). **Cả hai đều không nhặt dữ liệu giao hàng có báo cáo sự cố chưa giải quyết** (sự cố được xử lý bằng giải quyết của vận hành và con tự động · 〔quyết định v2.3 #25〕. Điều kiện này vẫn giữ nguyên ở bổ sung 2026/09/29).
- Ngày mốc khác nhau theo từng chu kỳ, và **ngày đầu chu kỳ A1 không trùng với ngày 1 dương lịch** (§4A-2). Vì vậy mỗi job không chỉ định ngày mà dùng phương thức **"hằng ngày nhặt các đối tượng đã qua ngày chuẩn"**. Nếu chạy hằng ngày thì dù ngày chuẩn là ngày nào cũng **được xử lý chậm nhất vào ngày hôm sau**.
- **Batch chạy hằng ngày cả ngày lễ** (kho nghỉ và hệ thống chạy là hai việc khác nhau. Xác nhận 2026/09/21).

**Tính idempotent (chạy hai lần cũng không hỏng)**

- Dự định giao hàng **UPSERT** với khóa duy nhất **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** (quyết định lần 2 ngày 2026/09/21). Chạy lại cũng không trùng.
  - `occurrence_key` là giá trị chỉ duy nhất lần này trong chu kỳ đó (ô `A1`〜`D7`, hoặc ngày chỉ định riêng "ngày N hằng tháng" "ngày cuối tháng").
  - **Không đặt `(contract_id, delivery_date)` làm khóa duy nhất** (quyết định lần 2 ngày 2026/09/21). Vì 1 hợp đồng có thể có nhiều nhóm nhiệt độ・phân loại giao hàng trong cùng 1 ngày, nếu duy nhất theo ngày giao thì lạnh và đông lạnh sẽ xung đột. **(Cũ: REQ-DL-721 "dự định giao hàng duy nhất theo (ID hợp đồng, ngày giao)" bị hủy. Đổi ở lần 2 ngày 2026/09/21)**
  - Tạo thay thế (quy trình tạo lại ở §2.0A・§4A-4) cũng đối chiếu bằng **cùng khóa này**. Không đối chiếu bằng ngày.
- Điều kiện đối tượng của tạo xác định chỉ giới hạn ở `lifecycle = draft` và `quá ngày bắt đầu Order`. Khi thành công, cập nhật `lifecycle = published` và `delivery_id` trong cùng 1 transaction nên **lần chạy thứ 2 có 0 đối tượng**.
- Đặt ràng buộc duy nhất của `plan_id` ở phía dữ liệu giao hàng để ngăn tạo trùng về mặt vật lý.

**Trường hợp bất thường**

| Sự việc | Xử lý |
|---|---|
| Xử lý của 1 hợp đồng thất bại | **Cắt transaction theo đơn vị hợp đồng**. Các hợp đồng khác tiếp tục xử lý, chỉ ghi nhận phần thất bại |
| Thất bại tạm thời | Tự động thử lại tối đa 3 lần (khoảng cách tăng theo cấp số nhân) |
| Thử lại vẫn thất bại | Ghi vào `batch_errors`, hiển thị **"Tạo xác định thất bại: N mục" trong cảnh báo cần xác nhận** của lịch vận hành. Có thể **chạy lại thủ công** thu hẹp theo đối tượng |
| Chạy chồng lên nhau | Khóa theo job, nếu đang chạy thì lần sau bỏ qua và ghi vào log |
| Sót mục quá hạn chót | **Hằng ngày** nhất định phát hiện lại "đã qua hạn chót mà chưa xác định" (cùng điều kiện với §10-1 #1. Xác nhận 2026/09/21. Cũ: mỗi thứ Hai) |

**Log thực hiện**: Lưu bắt đầu・kết thúc・số mục đối tượng・số mục thành công／thất bại・thời gian cần, để có thể xác nhận 30 lần gần nhất trên màn hình.

**Lý do chuyển sang hằng ngày (sửa 2026/09/15)**: Bản cũ là hằng tuần (mỗi thứ Hai), từ hạn chót đến tạo xác định cách nhau tối đa 6 ngày, lo ngại với hợp đồng có lead time ngắn thì chỉ thị xuất hàng không kịp. Vì mốc của chu kỳ không còn cố định theo ngày dương lịch nên ý nghĩa "chạy vào một thứ cụ thể" cũng không còn, do đó thống nhất theo **phương thức catch-up hằng ngày**. Vẫn chuẩn bị đường dẫn để vận hành thu hẹp đối tượng và **tạo xác định thủ công**.

### 11-2. Lịch sử thay đổi (nhật ký kiểm toán)

**Đối tượng**: Dự định giao hàng, dữ liệu giao hàng, master kho, thiết lập giao hàng của hợp đồng, thiết lập chu kỳ giao hàng toàn công ty.

| Mục | Nội dung |
|---|---|
| Ngày giờ / Người thực hiện | ID người dùng và vai trò. Trường hợp batch là "Hệ thống" + ID thực hiện batch |
| Đối tượng | Loại (dự định／dữ liệu giao hàng／master) và ID |
| Thao tác | Tạo・đổi ngày・đổi kho・tạo／hủy／hết hiệu lực override・chuyển trạng thái・xóa |
| Trước thay đổi → Sau thay đổi | Chỉ các mục đã thay đổi |
| Lý do | ID yêu cầu thay đổi, ID thay đổi hàng loạt, ID thực hiện batch, hoặc lý do nhập tay |

- **Thao tác nhất định phải để lại lịch sử**: di chuyển ngày thủ công, thay đổi hàng loạt, hủy・hết hiệu lực override, đổi kho, xóa dự định do tạm dừng・hủy hợp đồng, tạo xác định, tính lại do đổi thiết lập.
- Thời gian lưu giữ là **24 tháng** giống dự định.
- Màn hình **hợp nhất "Lịch sử yêu cầu・phê duyệt" của chi tiết dữ liệu giao hàng vào tab "Lịch sử"**, xếp theo thời gian yêu cầu và thay đổi của hệ thống.

### 11-3. Mức chi tiết của quyền hạn

Ngoài bảng thô vai trò × màn hình, **định nghĩa riêng từng thao tác có thể gây sự cố**.

| Thao tác | Vận hành (hậu cần) | Vận hành (CS) | Kinh doanh | Doanh nghiệp／Cơ sở | Giao hàng ủy thác |
|---|---|---|---|---|---|
| Lưu thiết lập chu kỳ giao hàng | ○ | × | × | × | × |
| Chỉnh sửa master kho | ○ | × | × | × | × |
| Chỉnh sửa thiết lập giao hàng của hợp đồng | ○ | × | ○ | × | × |
| Di chuyển thủ công・thay đổi hàng loạt dự định | ○ | × | × | × | × |
| Hủy override | ○ | × | × | × | × |
| Chạy thủ công tạo xác định | ○ | × | × | × | × |
| Phê duyệt・từ chối・đề xuất ngày thay thế yêu cầu thay đổi | ○ | ○ | × | × | × |
| Xóa mục cần xác nhận | ○ | ○ | × | × | × |
| Sửa ngày・hủy dữ liệu giao hàng (trước hạn chót) | ○ | × | × | × | × |
| **Sửa ngày dữ liệu giao hàng (sau hạn chót Order)** | **× (xử lý bằng hủy + sao chép. Không phân biệt trước và sau `locked` · quyết định lần 3 ngày 2026/09/22)** | × | × | × | × |
| Đăng ký tài xế・cấp tài khoản | ○ | × | × | × | △ (phần của công ty mình) |
| **Phân công tài xế・thay đổi phân công** | ○ | × | × | × | ○ (phần của công ty mình) |
| Báo cáo sự cố (**không đổi trạng thái** mà mở cần xác nhận. Bổ sung 2026/09/24 〔quyết định v2.3 #20〕. Cũ: chuyển thành 確認中) | ○ | ○ | × | × | ○ |
| **Giải quyết sự cố** (giải quyết cha・tái sử dụng／hủy con tự động・xác định ngày và số lượng) | ○ | × | × | × | × |
| Hủy・sắp xếp giao lại・**sao chép** | ○ | × | × | × | × |
| Nhập・sửa số tiền thu | ○ | ○ | × | × | △ (báo cáo phần của công ty mình) |

- **Thao tác nguy hiểm (hủy override・thay đổi hàng loạt・chỉnh sửa master kho) bắt buộc nhập lý do** và lưu vào lịch sử.
- **Vai trò `倉庫管理者` không tồn tại** (xóa hoàn toàn ở quyết định lần 2 ngày 2026/09/21. Thực hiện triệt để việc "không đặt vai trò kho" của 2026/09/14). **Mọi thao tác của kho do vận hành (hậu cần) thực hiện.** Đăng ký ngày không xuất hàng, xem màn hình 04・05, đổi ngày đều là vận hành. Không để lại từ `倉庫管理者` trong tài liệu này・demo・bảng quyền hạn.
- **"Tab kho" của màn hình không phải đơn vị quyền hạn mà chỉ là lọc dữ liệu** (quyết định lần 2 ngày 2026/09/21). Chuyển tab thì người thấy được・việc làm được không đổi. Là cơ chế hiển thị để đọc phân biệt số mục và ngưỡng theo từng kho (§5.2・REQ-DL-623).
- **Đổi ngày giờ giao hàng chỉ vận hành, đổi phân công tài xế là cả vận hành + công ty giao hàng ủy thác** (REQ-DL-149・§4B-2). Phân công không đổi ngày nên cho phép cả sau `locked`.

### 11-4. Yêu cầu phi chức năng (đặt tạm. Số thực cần xác nhận)

| Mục | Đặt tạm |
|---|---|
| Quy mô | Doanh nghiệp 200／Cơ sở 1.500／Hợp đồng 1.500, phân loại giao hàng trung bình 2,5, chi tiết giao hàng trung bình 2 |
| Số dự định giao hàng | 1.500 × 2 × 2,5 × 6 chu kỳ ≒ **45.000 mục／6 tháng** (1 năm khoảng 90 nghìn mục) |
| Số dữ liệu giao hàng | Chỉ phần xác định nên **khoảng 7.500 mục/tháng** |
| Màn hình | Hiển thị lịch trong 1 giây, tìm kiếm danh sách trong 2 giây |
| Batch | `plan_rollout` trong 5 phút, `delivery_materialize` trong 10 phút |
| Sử dụng đồng thời | Vận hành 10・Doanh nghiệp 100・Tài xế 50 |

> Việc đặt kỳ tạo là 6 tháng là vì lý do hiệu năng, nên cần xác nhận số thực ở trên (đặc biệt là số hợp đồng và số cơ sở) để có cơ sở.

### 11-5. Di chuyển dữ liệu hiện có

**Đối tượng**: Doanh nghiệp・cơ sở・hợp đồng・địa chỉ nơi giao・lịch hiện hành・giao hàng đang tiến hành・mã vận đơn・số túi giữ lạnh／chất giữ lạnh.

| Bước | Nội dung |
|---|---|
| 1 | Di chuyển master (doanh nghiệp・cơ sở・kho・công ty giao hàng・điểm trung chuyển) trước |
| 2 | Di chuyển hợp đồng, **phân loại giao hàng được tạo một cách máy móc từ "kho + công ty giao hàng + nhóm nhiệt độ" hiện hành** (cơ bản 1 hợp đồng 1 phân loại, chỉ hợp đồng có đông lạnh thì 2 phân loại) |
| 3 | Quyết định A1 lần đầu của chu kỳ giao hàng. **Không phải giữa tháng di chuyển mà là thứ Hai bắt đầu từ ngày 1 tháng sau trở đi** làm A1 lần đầu |
| 4 | Dữ liệu giao hàng của tháng di chuyển **nhập nguyên thực tế của hệ thống hiện hành, không tính lại** (khóa ở mức tương đương `published`) |
| 5 | Từ lần tạo xác định đầu tiên sau khi chuyển đổi chạy bằng logic mới |

- **Khuyến nghị chạy song song 1 tháng**. Xuất **báo cáo chênh lệch** đối chiếu danh sách ngày giao của hệ thống hiện hành và hệ thống mới, xác nhận độ lệch rồi mới chuyển đổi.
- Cần xác nhận: Có trích xuất được dữ liệu hiện hành bằng CSV không, lịch sử mã vận đơn mang sang đến đâu, cách xử lý yêu cầu thay đổi đang tiến hành tại thời điểm di chuyển.

---

## 12. Phương châm thiết kế thu hẹp mức tự do (đề xuất 2026-09-12)


> ⚠️ **Chương này là ghi chép "đề xuất" tại thời điểm 2026-09-12, không phải đặc tả hiện hành.** Nếu mâu thuẫn với nội dung chính thì nội dung chính của từng chương và §14 (danh sách quyết định) là chuẩn. Tại thời điểm 2026/09/22, **#10 (phân bổ trùng cùng Slot) đã xác định là không áp dụng**. Các mục khác cũng cần xác nhận từng mục có áp dụng hay không.
Đặc tả hiện tại có mức tự do thiết lập cao, **số tổ hợp quá nhiều nên dễ sinh lỗi**. Đếm thì như sau.

| Vị trí | Tổ hợp có thể có |
|---|---|
| 1 dòng phân loại giao hàng | Nhóm nhiệt độ 4 × kho 3 × công ty giao hàng lần 1 là 4 × trung chuyển 3 × công ty giao hàng lần 2 là 4 ＝ **576 cách** |
| Hợp đồng (tối đa 4 phân loại) | 576 lũy thừa 4 ＝ thực tế là vô hạn |
| Phần khác của hợp đồng | Lead time 8 × đẩy sớm・lùi lại 2 × chế độ 2 × số lần giao 4 × ngày không nhận được 8 ＝ **1.024 cách** |
| Trạng thái dự định | status 3 × trạng thái yêu cầu 5 ＝ **15 cách** (đã điều chỉnh là giá trị suy ra nên không nhân) |

Đây là lượng không thể kiểm thử hết. **Giảm những chỗ có thể tự do thiết lập, lựa chọn lấy từ master, và để có thể nhận ra những tổ hợp không phù hợp**.

### 12-1. Cho chọn từ Master và bảo vệ bằng kiểm tra tính nhất quán

Ban đầu đã đưa ra phương án "chọn từ mẫu giao hàng do vận hành định nghĩa", nhưng **không thể cố định tổ hợp thực tế** nên không áp dụng (2026/09/13). Thay vào đó, hạn chế rủi ro của việc nhập tự do bằng 3 điểm sau.

**① Lựa chọn luôn lấy từ Master.**

| Mục | Nguồn lựa chọn |
|---|---|
| Kho picking | Master kho (loại kho = Picking, đang hoạt động) |
| Điểm trung chuyển | Master trung chuyển (loại kho trong Master kho = Trung chuyển). Bao gồm "Không sử dụng" |
| Công ty giao hàng cấp 1・cấp 2 | Master công ty giao hàng |

Không thể nhập tự do hay đăng ký giá trị không có trong Master. **Lead time không tự động điền từ kho** (quyết định 2026/09/21. Cũ: khi chọn kho thì lead time theo kho được tự động điền làm giá trị mặc định). Nhập từ 0〜7 ngày cho từng loại giao hàng của hợp đồng (lạnh／đông lạnh／vật tư).

**② Cho Master giữ "dải nhiệt độ hỗ trợ" và "khu vực hỗ trợ", đưa ra cảnh báo với tổ hợp không phù hợp.**

- Cho Master công ty giao hàng giữ dải nhiệt độ xử lý được và khu vực hỗ trợ (Kanto／Chubu／Kansai／Kyushu). **Dải nhiệt độ hỗ trợ có 3 giá trị: Đông lạnh／Lạnh・Nhiệt độ thường／Vật tư** (quyết định 2026/09/21・#8. Nhiệt độ thường xếp chung nhóm với Lạnh. Phương án 4 giá trị 〈Đông lạnh・Lạnh・Nhiệt độ thường・Vật tư〉 và phương án 2 giá trị đều bị hủy).
- Đối chiếu **khu vực nơi giao hàng** của hợp đồng với **dải nhiệt độ** của loại giao hàng, hiển thị cảnh báo trên màn hình nếu chỉ định không phù hợp (ví dụ: "Không hỗ trợ khu vực Kansai", "Không hỗ trợ đông lạnh").
- **Không cấm.** Vì có thể có chuyến ngoại lệ, hoặc Master chưa kịp cập nhật nên cho phép chọn nhưng giúp người dùng nhận ra. Số lượng chỉ định không phù hợp luôn hiển thị bên dưới loại giao hàng.
- Khi đổi nơi giao hàng cũng chạy cùng phép kiểm tra, thông báo **"Có N chỉ định không phù hợp với khu vực・dải nhiệt độ"**. Không tự động thay thế.

**③ Tổ hợp hay dùng được xếp lên trên làm đề xuất.** Sắp xếp lại ứng viên dựa trên thực tích và địa chỉ nơi giao hàng (kết nối với recommend của REQ-DL-132 và tìm kiếm địa chỉ của REQ-DL-205). Đây chỉ là thứ tự sắp xếp, không hạn chế quyền tự do lựa chọn.

### 12-2. Giới hạn các mục có thể ghi đè bằng hợp đồng (whitelist)

| Hợp đồng được quyết định | Master quyết định (hợp đồng không được can thiệp) |
|---|---|
| Slot giao hàng／ngày giao chỉ định | **Bản thân các lựa chọn** kho・công ty giao hàng・điểm trung chuyển (Master giữ. Không được nhập tự do) |
| Số lần giao hàng | Khung không thể xuất hàng・ngày không thể xuất hàng・ngưỡng số lượng |
| Ngày không thể nhận hàng (T7, CN, ngày lễ) | — |
| Dời lên trước・dời ra sau (dời ngày giao hàng theo hướng nào) | Thời gian tạm dừng chu kỳ・ngày được coi là ngày lễ giao hàng |
| Có thể giao ngày lễ hay không | — |
| **Lead time (nhập số・0〜7 ngày. Theo từng loại giao hàng)** | (Master kho không giữ lead time. Cũng không tự động bổ sung・2026/09/21) |

- **Lead time được nhập bằng số theo từng loại giao hàng của hợp đồng (lạnh／đông lạnh／vật tư)** (sửa đổi 2026/09/21). **Master kho không giữ lead time và không tự động bổ sung giá trị mặc định**, nên cũng không có hiển thị "thay đổi từ mặc định của kho N ngày". Phạm vi là 0〜7 ngày.
- Kho・công ty giao hàng・điểm trung chuyển **được chọn trong hợp đồng**, nhưng các giá trị chọn được do Master giữ. Giá trị không có trong Master thì không vào được hợp đồng.
- Ngoài lead time, không tạo "mục có thể ghi ở cả hai nơi". Nơi đặt cấu hình luôn chỉ là 1 chỗ.

### 12-3. Thống nhất lối vào để ghi đè ngày về 1

Hiện nay "di chuyển thủ công", "thay đổi hàng loạt", "hủy override", "phê duyệt yêu cầu thay đổi" — cả 4 đều ghi đè ngày.

- Thống nhất lối vào là **thao tác đổi ngày ở màn hình chi tiết dữ liệu giao hàng／kế hoạch**, **thay đổi hàng loạt được xem là phiên bản nhiều bản ghi của thao tác đó** (xử lý bên trong đi qua cùng một hàm).
- **Không có chức năng hủy thủ công trạng thái "đã điều chỉnh".** "Đã điều chỉnh" là hiển thị cho biết override đã duyệt đang được áp dụng, nên nếu muốn hủy thì làm lại yêu cầu thay đổi, hoặc vận hành hủy override kèm lý do.
- Xử lý ghi đè ngày **luôn đi qua cùng một phép kiểm tra (ngày không thể, lead time, kho của loại)**. Không viết kiểm tra riêng cho từng màn hình.

### 12-4. Đóng kín chuyển trạng thái bằng bảng

Lập thành bảng thay vì văn xuôi, **hệ thống từ chối mọi chuyển trạng thái ngoài những chuyển trạng thái được cho phép**.

**Có 2 bảng** (quyết định đợt 2 ngày 2026/09/21). `plan lifecycle` và `delivery status` là các máy trạng thái khác nhau nên **không gộp vào 1 bảng**.

**Bảng 1: `plan lifecycle` (`shipping_plans.lifecycle`)**

| Hiện tại | Thao tác | Tiếp theo | Người thực hiện |
|---|---|---|---|
| draft | Tạo xác định (đã qua ngày bắt đầu đặt hàng) | published | Batch |
| draft | Phê duyệt yêu cầu thay đổi | draft (đã điều chỉnh = đang áp dụng override) | Vận hành |
| draft | Phê duyệt tạm dừng・hủy hợp đồng | Xóa | Vận hành |
| draft | **Nhân bản** | **Không được** (đối với kế hoạch chỉ có thể "sao chép／thay đổi kế hoạch"・quyết định đợt 2 ngày 2026/09/21) | — |
| published | **Lần gửi chỉ thị xuất hàng đầu tiên đã thành công** | locked | Hệ thống |
| published / locked | Nhân bản (giao lại・giao từng phần・chuyến thay thế) | Tạo mới dữ liệu giao hàng con (số nhánh・`parent_delivery_id`・trạng thái Đang xác nhận) | Vận hành |
| published / locked | **Đăng ký báo cáo sự cố loại tạo con tự động (`trouble_types.auto_child = true`)**／vận hành gán loại đó cho sự cố (khi chuyến giao hàng đó không có con tự động còn hiệu lực) | Tạo mới 1 con tự động (số nhánh・`parent_delivery_id`・trạng thái Đang xác nhận・`trouble_pending`・`creation_source = trouble_auto`). Nếu sự cố xảy ra ở con thì lấy số nhánh tiếp theo của cha (số nhánh vượt 9 là `DOMAIN_BRANCH_LIMIT` + cần xác nhận). **Không thay đổi trạng thái của cha** (bổ sung 2026/09/24 〔quyết định v2.3 #22〕・bổ sung 2026/09/29 〔quyết định v2.3 #28〜#30〕) | Hệ thống (cùng transaction với đăng ký báo cáo・gán lại loại) |
| ~~published / locked~~ | ~~Báo cáo sự cố quá `auto_duplicate_due_at` mà chưa được giải quyết~~ | ~~Tạo mới 1 con tự động~~ | ~~Batch (`trouble_auto_duplicate`)~~ (**Cũ. Bãi bỏ 2026/09/29 〔quyết định v2.3 #30〕**) |
| published | Phê duyệt yêu cầu thay đổi・sửa ngày | published (lưu lại lịch sử) | Vận hành |
| locked | — | Không chuyển trạng thái | — |

**Cấm**: `published → draft`, `locked → published`, **nhân bản từ `draft`** (quyết định đợt 2 ngày 2026/09/21), hủy thủ công trạng thái đã điều chỉnh (hủy override không có lý do), xóa dữ liệu giao hàng đã xác định (kể cả tạm dừng・hủy hợp đồng thì dữ liệu giao hàng vẫn được giữ lại và vận hành hủy từng cái). **Không dùng việc cấp số vận đơn làm trigger của `locked`** (quyết định đợt 2 ngày 2026/09/21. **Cũ: "published｜chỉ thị xuất hàng・phát hành vận đơn｜locked｜kho／hệ thống". Thay đổi ở đợt 2 ngày 2026/09/21**).

**Bảng 2: `delivery status` (`deliveries.status`)**

Bảng chuyển trạng thái của Chờ xuất／Đã xuất／Đã nhận／Đã giao／Đã giao một phần／Chờ giao lại／Đang xác nhận／Dừng／Hủy được đặt ở **§4A-3B**, mọi chuyển trạng thái không có trong đó đều bị hệ thống từ chối (REQ-DL-756). **Chuyển trạng thái của yêu cầu thay đổi cũng là một bảng riêng ở §4A-3B**. Trung chuyển không lưu mà suy ra từ route legs (cùng cách nghĩ với §12-5・REQ-DL-755).

> **Không gọi chung 2 cái này là "trạng thái".** `plan lifecycle` biểu thị "từ khi nào thì không được động vào", `delivery status` biểu thị "hàng đã đi đến đâu". 1 dữ liệu giao hàng có đồng thời giá trị của cả hai.

### 12-5. Giá trị suy ra không lưu (nếu lưu thì phải luôn ghi đè bằng tính toán lại)

Lead time thực tế, khung không thể giao hàng, ứng viên không thể giao hàng theo lead time, cờ cần xác nhận được **tính ra bằng phép tính**. Kể cả khi giữ trong bảng thì cũng được xem là giá trị luôn bị ghi đè bởi tính toán lại, không tạo chỗ để con người chỉnh sửa. Quản lý kép là nguồn gốc của sự không nhất quán.

### 12-6. Thu hẹp phạm vi giá trị

- Lead time **vẫn nhập bằng số** (**0〜7 ngày**・quyết định 2026/09/21. Cũ: 0〜30 ngày). **Vì Master kho không giữ nên không tự động bổ sung giá trị mặc định**. Nhập theo từng loại giao hàng của hợp đồng (lạnh／đông lạnh／vật tư).
- Tỷ lệ cấu thành (%) bị bãi bỏ (kế hoạch không giữ số lượng = §10-1 #2).
- Số lần giao hàng vẫn là 1〜4. Chỉ định riêng vẫn là 2 loại "ngày N hàng tháng／cuối tháng" (đã quyết định).

### 12-7. Quyết định những gì không làm ở Giai đoạn 2

Mức tự do được bổ sung theo từng giai đoạn. Đề xuất **không làm những mục sau ở Giai đoạn 2**.

| Mục để sau | Lý do |
|---|---|
| Tuyến đường có từ 2 tầng trung chuyển trở lên | Thực tế chỉ có tối đa 1 tầng. Chỉ làm cấu trúc dữ liệu có thể thay đổi, màn hình giới hạn ở 1 tầng |
| Chỉ định tuần thứ N trong tháng của thứ | Đã quyết định không áp dụng |
| Giữ tồn kho ở giai đoạn kế hoạch | Chỉ khi tạo xác định |
| **Xuất PDF danh sách picking** | Xác nhận trên màn hình quản trị và xuất CSV là đủ. Chỉ thị cho kho được chuyển bằng CSV chỉ thị xuất hàng (quyết định 2026/09/21・#50. REQ-DL-103 bị hủy) |
| **Quản lý cho mượn／thu hồi túi giữ lạnh・chất giữ lạnh** | Ứng dụng tài xế (V1.0・đã xác định) **không có màn hình nhập thu hồi** nên có làm cũng không vận hành được. Chỉ giữ số làm **mục ghi nhận tùy chọn** của dữ liệu giao hàng, số lượng xem như vật tư tiêu hao của kho và theo dõi bằng **kiểm kê hàng tháng** (số lượng mua − số lượng còn lại). **【Tạm thời】Túi giữ lạnh・chất giữ lạnh của phần gửi qua Yamato là dùng một lần (không thu hồi). Chỉ ghi nhận số** (2026/09/21・đang xác nhận với vận hành là thực tế có thu hồi hay không, có nhờ doanh nghiệp trả lại hay không). Khi cần thì ở Giai đoạn 3 sẽ thêm kiểm tra thu hồi vào ứng dụng |
| **Trạng thái trung gian của trung chuyển** | Do gửi qua Yamato nên không lấy được (§4C-2) |
| **Thay tài xế hàng loạt** | Thay từng cái một. Số lượng có hạn, và nếu di chuyển hàng loạt thì không theo dõi được lịch sử phụ trách (quyết định 2026/09/21・#65) |
| **Vị trí của tài xế** | Ứng dụng không có chức năng. Nếu sau này cần thì xem xét riêng |
| **I/F hủy chỉ thị xuất hàng** | Không có hủy, **thay thế bằng gửi lại với số lượng 0** (§4D-3) |
| **Di chuyển giữa các kho (yokomochi)** | Có trong thực tế nhưng không tạo phiếu di chuyển. **Hấp thụ bằng điều chỉnh tồn kho** (quyết định 2026/09/14) |
| **Màn hình・quyền dành cho kho** | Kho không có màn hình trong hệ thống. Đăng ký ngày không thể xuất hàng và xem màn hình 04 đều do vận hành thực hiện (quyết định 2026/09/14) |

### 12-9. Quy tắc chung của màn hình (2026-09-18・xử lý 50 mục review UI)

| # | Quy tắc |
|---|---|
| 1 | **Hiển thị ngày theo `yyyy-mm-dd`, tháng theo `yyyy-mm`.** Nhập ngày cũng không phụ thuộc vào cài đặt khu vực của trình duyệt, hiển thị cùng một ký hiệu (không đổi kể cả khi ngôn ngữ thiết bị là tiếng Anh) |
| 2 | **Nội dung chính・nhãn thao tác từ 12px trở lên.** Không dùng cỡ 9〜11px |
| 3 | **Không truyền đạt trạng thái chỉ bằng màu hay nét đứt.** Kết hợp chữ và hình dạng. Tuy nhiên **nơi hiển thị dấu hiệu tuân theo cách hiển thị ngày 2026/09/21** (không dùng ví dụ cũ "◇ Kế hoạch／◆ Xác định"): |
| 3-1 | **Hiển thị tháng của Web vận hành**: không hiển thị dấu hiệu nào cho cả xác định lẫn kế hoạch. **Kế hoạch được phân biệt bằng khung nét đứt và dòng số lượng "Kế hoạch N bản ghi"** (REQ-DL-828) |
| 3-2 | **Hiển thị tuần của Web vận hành**: không hiển thị "◆ Dữ liệu giao hàng" ở tiêu đề nhóm. **Chỉ hiển thị "◇ Kế hoạch" của ngoại lệ và tên chu kỳ biểu thị phần của chu kỳ khác** (REQ-DL-828) |
| 3-3 | **Hiển thị ngày・danh sách・chi tiết của Web vận hành**: hiển thị trạng thái (Chờ xuất〜Hủy) và yêu cầu thay đổi (Có thể thay đổi〜Không thể thay đổi) bằng **badge chữ** (§4A-3B) |
| 3-4 | **Web doanh nghiệp**: **giữ lại dấu "Kế hoạch"** (quyết định 2026/09/21・#77). Vì doanh nghiệp không có cách nào khác để biết đã xác định hay chưa |
| 4 | **Không tạo thao tác chỉ có double-click.** Danh sách・hiển thị tuần mở bằng cách click vào tên hoặc nút chi tiết luôn hiển thị |
| 5 | **Modal hoàn tất được bằng bàn phím.** Khi mở thì focus vào tiêu đề, Tab xoay vòng trong modal, Esc đóng và quay lại nút ban đầu. Gắn `role="dialog"`・`aria-modal`・`aria-labelledby` |
| 6 | **Thông báo dùng `aria-live`.** Lý do không thể thao tác・lỗi không tự biến mất, đóng bằng ×  |
| 7 | **Với nút không thao tác được, luôn hiển thị lý do gần nút** (không chỉ dùng tooltip) |
| 8 | **Điều kiện cần xử lý (cảnh báo)**: ① có yêu cầu thay đổi chưa xử lý ② chưa thiết lập tài xế mà đã đến ngày trước ngày giao hàng trở đi, hoặc đã xuất hàng. Vì tài xế được công ty giao hàng ủy thác phân công từ 1 tuần trước đến 1 ngày trước ngày giao nên 2〜7 ngày trước là "chờ phân công", không tính là cần xử lý |
| 9 | **Cột mặc định của danh sách** là Số giao hàng・Cơ sở・Trạng thái・Yêu cầu thay đổi・Ngày xuất・Ngày giao・Tài xế. Tuyến (loại giao hàng・trung chuyển・kho・công ty giao hàng) hiển thị khi chuyển đổi |
| 10 | **Thu hẹp thao tác chính của màn hình còn 1.** Các thao tác khác (xuất CSV・giải thích thuật ngữ) gom vào menu "Khác" |
| 10-2 | **Lịch sử thay đổi hiển thị theo từng đối tượng.** Không đặt lịch sử thay đổi toàn màn hình ở màn hình lịch trình, xem ở tab "Lịch sử thay đổi" của chi tiết xuất hàng・dữ liệu giao hàng (quyết định 2026/09/18). Vì danh sách toàn màn hình khiến các dòng xếp ra mà không biết là chuyến giao hàng nào, vận hành không theo dõi được |
| 11 | Cho phép mở **giải thích thuật ngữ** từ màn hình (kế hoạch・dữ liệu giao hàng・tạo xác định・chu kỳ・slot・ngày xuất・đã điều chỉnh・trung chuyển・coi như hoàn tất・cần xác nhận, v.v.) |
| 12 | **Tách phần giải thích chỉ dành cho demo khỏi UI thật.** Nếu để lại trong màn hình thì gắn badge "Demo" |
| 13 | **Độ tương phản giữa chữ và nền từ 4.5:1 trở lên** (tương đương WCAG 2.1 AA). Bao gồm cả chữ nằm trên nền màu nhạt như chữ bổ sung・pill trạng thái・"Nghỉ: xuất hàng" của lịch. Logotype không thuộc đối tượng |
| 14 | **Luôn hiển thị vị trí hiện tại của bàn phím.** Hiển thị đường viền `:focus-visible` cho mọi phần tử thao tác (bao gồm nút bỏ viền・nút dạng liên kết) |
| 15 | **Không tạo phần tử thao tác không có tên.** Checkbox chọn dòng có tên cho biết đối tượng như "Chọn 〈tên cơ sở〉・〈dải nhiệt độ〉・giao hàng 〈ngày〉". Nút chỉ có biểu tượng, select số bản ghi, tiêu đề trống của bảng cũng gắn `aria-label` hoặc văn bản chỉ dành cho đọc màn hình |
| 16 | **Truyền cấu trúc màn hình cho công nghệ hỗ trợ.** Nội dung chính là `main`, menu trái là `aside` có tên, thanh trên là `banner`, tiêu đề hạ cấp tuần tự từ `h1` (không bỏ qua `h1`) |
| 17 | **Cho tiêu đề bảng giữ thứ tự sắp xếp** (`aria-sort`). Khi cột chuẩn sắp xếp thay đổi thì giá trị bên tiêu đề cũng chuyển theo |

**Giá trị chuẩn của độ tương phản (đo 2026/09/18・đã phản ánh vào demo)**

| Mục đích | Màu | Nền trắng | Nền xám #eceff3 |
|---|---|---|---|
| Chữ bổ sung | `#616a78` | 5.47 | 4.74 |
| Xuất hàng | `#b64708` | 5.39 | 4.68 |
| Giao hàng | `#21702f` | 6.13 | 5.32 |
| Bình thường | `#17713d` | 6.06 | 5.25 |
| Cảnh báo・Lỗi | `#b92a23` | 6.14 | 5.33 |
| Liên kết・đang chọn (trên nền màu nhạt) | `#1459b3` | 6.75 | 5.86 |
| Nền badge (chữ trắng) | `#a85d00` | 4.96 | — |

**Chưa xử lý (cố ý hoãn・2026/09/18)**

| Mục | Lý do hoãn |
|---|---|
| Gắn `role="tablist"` cho tab | Nếu gắn đúng thì bắt buộc phải di chuyển bằng phím mũi tên, và nếu triển khai nửa chừng thì còn khó thao tác hơn là để dạng nút. Làm một lượt khi có thể triển khai cả di chuyển bàn phím giữa các tab |
| `aria-label` tóm tắt ô hiển thị tháng | Cần quyết định cách diễn đạt trước khi tóm tắt nội dung ô (ngày・chu kỳ・khung・số lượng・ngày nghỉ・số yêu cầu). Quyết định xong mới gắn |
| Làm vùng click từ 40×40px trở lên | Ảnh hưởng đến layout của bảng mật độ cao nên làm cùng lúc với hỗ trợ 1024px |
| Màu logotype | Ngoài đối tượng WCAG. Xử lý khi đối chiếu với quy định thương hiệu |

### Yêu cầu (bổ sung 2026/09/18)

| ID yêu cầu | Phân loại yêu cầu | Nội dung yêu cầu | Trạng thái |
|---|---|---|---|
| REQ-DL-757 | Yêu cầu nghiệp vụ | Lấy ngày công bố menu và ngày bắt đầu đặt hàng là cùng một ngày (mặc định: ngày 1 tháng trước), chia giai đoạn của chu kỳ thành 3 giai đoạn (thiết lập lịch trình = đang đăng ký menu／công bố menu・bắt đầu đặt hàng／chốt đặt hàng) | Đã quyết định (2026/09/18) |
| REQ-DL-758 | Yêu cầu hiển thị | Hiển thị trên dải của màn hình lịch trình "Thiết lập lịch trình／Đăng ký menu〜〈ngày công bố〉／Công bố menu・bắt đầu đặt hàng 〈ngày công bố〉〜／Chốt đặt hàng 〈ngày chốt〉" | Đã quyết định (2026/09/18) |
| REQ-DL-759 | Yêu cầu kiểm soát | Giá trị ban đầu của tháng bắt đầu của kỳ đối tượng thiết lập là **"tháng đầu tiên chưa thiết lập"**, và **tháng sau nữa là giới hạn dưới chứ không phải giá trị ban đầu** (sửa đổi 2026/09/21. Cũ: giá trị ban đầu = tháng sau nữa). Không hiển thị tháng hiện tại・tháng sau trong dropdown. Tháng kết thúc mặc định là 6 tháng bao gồm tháng bắt đầu | Đã quyết định (sửa đổi 2026/09/21) |
| REQ-DL-760 | Yêu cầu chức năng | Giá trị ban đầu của ngày đầu tiên của chu kỳ giao hàng (A1 đầu tiên) là ngày sau D7 của chu kỳ trước đó và có thể đổi bằng tay. Khi thay đổi thì cảnh báo số ngày chênh lệch so với phần tiếp nối, và có thể trả về giá trị ban đầu bằng "Quay về phần tiếp nối" | Đã quyết định (2026/09/18) |
| REQ-DL-761 | Yêu cầu hiển thị | Ghi kèm "Vốn là 〈khung〉" vào ngày tạm dừng chu kỳ, để cho thấy khung được quyết định theo tuần × thứ nên số thứ tự không bị lệch do tạm dừng | Đã quyết định (2026/09/18) |
| REQ-DL-762 | Yêu cầu màn hình | Chuyển đổi thiết lập không thể xuất hàng ở tab kho và hiển thị dưới dạng bảng tuần (A〜D) × thứ. Có thể chuyển đổi hàng loạt từ tên thứ・tên tuần, tóm tắt nội dung chọn bằng tiếng Nhật, và có thể trả về giá trị ban đầu | Đã quyết định (2026/09/18) |
| REQ-DL-763 | Yêu cầu hiển thị | Hiển thị khung không thể giao hàng được tự động xác định từ khung không thể xuất hàng ở cả trên lưới (khung tương ứng hiển thị "Giao hàng ×") và trong danh sách | Đã quyết định (2026/09/18) |
| REQ-DL-764 | Yêu cầu chức năng | Có thể thêm・xóa ngày không thể xuất hàng (chỉ định theo ngày) của từng kho, và từ ngày có thể chuyển đến lịch của tháng đó | Đã quyết định (2026/09/18) |
| REQ-DL-765 | Yêu cầu hiển thị | "Nghỉ: xuất hàng" của lịch ghi kèm tên kho vào ngày chỉ một số kho không thể xuất hàng | Đã quyết định (2026/09/18) |
| REQ-DL-766 | Yêu cầu hiển thị | Tuân theo quy tắc chung của màn hình (§12-9) (ký hiệu ngày・cỡ chữ・hiển thị không phụ thuộc màu・thao tác bàn phím・thông báo・hiển thị thường trực lý do vô hiệu) | Đã quyết định (2026/09/18) |
| REQ-DL-767 | Yêu cầu chức năng | Tiếp nhận yêu cầu thay đổi của doanh nghiệp, chia thành "ràng buộc nhận hàng của cơ sở" và "điều chỉnh chỉ lần này". Ngày không thể nhận được lưu thành ngày không thể nhận hàng của cơ sở, và tự động tránh kể cả khi làm lại thiết lập chu kỳ | Đã quyết định (2026/09/18) |
| REQ-DL-768 | Yêu cầu chức năng | Có thể đăng ký ngày không thể nhận hàng・thứ không thể giao hàng của cơ sở theo đơn vị hợp đồng (cơ sở), có chỉ định kỳ hạn và lặp lại hằng năm, có hiệu lực qua phê duyệt của vận hành | Đã quyết định (2026/09/18) |
| REQ-DL-769 | Yêu cầu chức năng | Giữ thay đổi đã duyệt dưới dạng override đã duyệt độc lập thay vì cờ `pinned` của kế hoạch, và áp dụng lại mỗi lần tạo lại | Đã quyết định (2026/09/18) |
| REQ-DL-770 | Yêu cầu chức năng | Giữ ngày sau thay đổi của override bằng ngày tuyệt đối; mất hiệu lực nếu ngày giao hàng đối tượng không còn, và là đề xuất nếu ngày sau thay đổi không thành lập | Đã quyết định (2026/09/18) |
| REQ-DL-771 | Yêu cầu chức năng | Trước khi phê duyệt yêu cầu thay đổi, đánh giá khả năng giao hàng・khả năng xuất hàng・lead time・số lượng picking・tuyến giao hàng・khả năng lấy hàng của chuyến công ty vận tải, và không đưa ngày không thể vào ứng viên | Đã quyết định (2026/09/18) |
| REQ-DL-772 | Yêu cầu chức năng | Khi phê duyệt, ghi lại ngày picking・kho・tuyến・loại chuyến・số lượng・revision thiết lập thành snapshot căn cứ | Đã quyết định (2026/09/18) |
| REQ-DL-773 | Yêu cầu chức năng | Kiểm tra lại hằng ngày các override đang áp dụng và đưa những cái không còn thành lập vào cần xác nhận (bao gồm chưa phân công tài xế) | Đã quyết định (2026/09/18) |
| REQ-DL-774 | Yêu cầu chức năng | Chuyển trạng thái đã điều chỉnh mà được đánh giá là không thể thực hiện sang "Đề xuất", trình ngày thay thế cho doanh nghiệp và đồng thuận lại | Đã quyết định (2026/09/18) |
| REQ-DL-775 | Yêu cầu hiển thị | Hiển thị kết quả re-anchor (áp dụng／mất hiệu lực／đề xuất) của override đã duyệt thành chi tiết trong xem trước số lượng ảnh hưởng trước khi lưu, và bắt buộc có checkbox xác nhận khi có mất hiệu lực・đề xuất | Đã quyết định (2026/09/18) |
| REQ-DL-776 | Yêu cầu hiển thị | Không hiển thị "đã điều chỉnh" bằng cách diễn đạt có thể đọc là "chắc chắn giao được vào ngày đó". Khi vận hành di chuyển trạng thái đã điều chỉnh và khi override mất hiệu lực thì để lại kèm lý do trong lịch sử yêu cầu và lịch của doanh nghiệp | Đã quyết định (2026/09/18) |
| REQ-DL-777 | Yêu cầu hiển thị | Độ tương phản giữa chữ và nền từ 4.5:1 trở lên (trừ logotype) | Đã quyết định (2026/09/18) |
| REQ-DL-778 | Yêu cầu màn hình | Hiển thị focus (`:focus-visible`) cho mọi phần tử thao tác | Đã quyết định (2026/09/18) |
| REQ-DL-779 | Yêu cầu màn hình | Cho checkbox chọn・nút biểu tượng・select・tiêu đề trống của bảng có tên đọc màn hình cho biết đối tượng | Đã quyết định (2026/09/18) |
| REQ-DL-780 | Yêu cầu màn hình | Thể hiện cấu trúc màn hình bằng landmark (`main`／`aside` có tên／`banner`), không bỏ qua cấp tiêu đề | Đã quyết định (2026/09/18) |
| REQ-DL-781 | Yêu cầu hiển thị | Thiết lập `aria-sort` cho cột chuẩn sắp xếp của danh sách và cho theo kịp khi chuẩn thay đổi | Đã quyết định (2026/09/18) |
| REQ-DL-782 | Yêu cầu màn hình | Xuất hàng・quản lý giao hàng (danh sách) chỉ hiển thị dữ liệu giao hàng, và khi kỳ có chứa kế hoạch thì hiển thị số lượng và liên kết đến hiển thị ngày của lịch trình | Đã quyết định (2026/09/18) |
| REQ-DL-783 | Yêu cầu màn hình | Có thể chuyển đổi để hiển thị cột tuyến của danh sách (loại giao hàng・trung chuyển・kho・công ty giao hàng・công ty ủy thác) | Đã quyết định (2026/09/18) |
| REQ-DL-784 | Yêu cầu màn hình | Dùng cùng điều kiện tìm kiếm cho lịch trình và danh sách, có thể lọc theo tình trạng phân công (đã phân công／chưa phân công) | Đã quyết định (2026/09/18) |
| REQ-DL-785 | Yêu cầu dữ liệu | ~~Không lưu phương thức giao hàng (chuyến ES giao hàng／chuyến COOL) mà suy ra từ việc loại giao hàng có điểm trung chuyển hay không~~ → **Loại chuyến (chuyến ES giao hàng／chuyến COOL giao hàng／chuyến vật tư) là mục nhập mà hợp đồng (hợp đồng con) giữ, không suy ra từ có trung chuyển hay không** | **Hủy・thay thế (2026/09/21・#29)** |
| REQ-DL-786 | Yêu cầu màn hình | Không đặt lịch sử thay đổi toàn màn hình ở màn hình lịch trình, xem lịch sử thay đổi ở tab của chi tiết dữ liệu giao hàng | Đã quyết định (2026/09/18) |
| REQ-DL-787 | Yêu cầu kiểm soát | Giữ chênh lệch giữa lead time thực tế và lead time hợp đồng trong vòng 1 ngày. Nếu vượt quá thì dịch ngày giao hàng theo hướng "dời lên trước・dời ra sau" của hợp đồng để thu về trong phạm vi | Đã quyết định (2026/09/18) |
| REQ-DL-788 | Yêu cầu kiểm soát | Kể cả khi ứng viên nào cũng không thu chênh lệch về trong 1 ngày, vẫn không để lại ngày không thể picking, lấy cặp có chênh lệch nhỏ nhất và đưa vào cần xác nhận. Hiển thị số ngày chênh lệch ở cần xác nhận | Đã quyết định (2026/09/18) |
| REQ-DL-789 | Yêu cầu nghiệp vụ | Ngày doanh nghiệp không thể nhận hàng không phải đăng ký bằng yêu cầu thay đổi từng lần mà đăng ký thành ngày không thể nhận hàng của cơ sở | Đã quyết định (2026/09/18) |
| REQ-DL-790 | Yêu cầu kiểm soát | Ngày chuẩn tạo hợp đồng con là ngày sớm hơn giữa "1 tháng trước ngày chốt thanh toán" và "**ngày bắt đầu đặt hàng**" (sửa đổi 2026/09/21. Cũ: **ngày trước** ngày bắt đầu đặt hàng). Kể cả khi tạo cùng ngày, vẫn tạo hợp đồng con trước dữ liệu giao hàng theo thứ tự job của batch hằng ngày | **Đã quyết định (sửa đổi 2026/09/21)** |
| REQ-DL-791 | Yêu cầu hiển thị | Không viết mô tả "đã điều chỉnh" ở dạng phủ định, thống nhất là "Ngày do vận hành quyết định. Không dịch chuyển bằng tính toán tự động. Khi cần dịch chuyển thì liên hệ và quyết định lại" | Đã quyết định (2026/09/18) |
| REQ-DL-792 | Yêu cầu dữ liệu | Giữ loại chuyến (chuyến ES giao hàng／chuyến COOL giao hàng／chuyến vật tư)・cơ chế giao hàng (tự có／công ty giao hàng ủy thác／công ty vận tải)・tuyến (có／không trung chuyển) như các trục riêng, không dùng phân loại "chuyến ủy thác" | Đã quyết định (2026/09/18) |
| REQ-DL-793 | Yêu cầu màn hình | Ở phần chọn slot giao hàng của thiết lập giao hàng hợp đồng, hiển thị số lượng theo từng khung và ngưỡng số lượng ở kho của loại giao hàng đó. Từ 90% trở lên là đông đúc, vượt là vượt giới hạn, và không chặn việc chọn | Đã quyết định (2026/09/18) |
| REQ-DL-798 | Yêu cầu kiểm soát | Không đặt giới hạn cho lượng dịch chuyển ngày giao hàng và ưu tiên chênh lệch lead time. Tuy nhiên khi dịch chuyển quá 3 ngày so với khung gốc thì đưa vào cần xác nhận kèm số ngày dịch chuyển | Đã quyết định (2026/09/18) |
| REQ-DL-799 | Yêu cầu chức năng | Khi xử lý giao từng phần・giao lại, bản ghi gốc được xác định bằng số lượng giao thực tế và hoàn tất trước, bản nhân bản của số lượng còn lại・phần giao lại được tạo với **trạng thái = Đang xác nhận** và kèm ngày giao tạm | Đã quyết định (2026/09/18) |
| REQ-DL-800 | Yêu cầu chức năng | Đưa bản nhân bản Đang xác nhận vào cần xác nhận với nội dung "Chờ xử lý số lượng còn lại／Chờ xác nhận ngày giao lại", vận hành có thể chọn "Xác định vào ngày này", "Đổi ngày", "Dừng". Kết quả được lưu vào lịch sử thay đổi cùng lý do | Đã quyết định (2026/09/18) |
| REQ-DL-801 | Yêu cầu kiểm soát | Không đưa bản nhân bản Đang xác nhận vào đối tượng của chỉ thị xuất hàng. Chỉ sau khi xác nhận xong và thành Chờ xuất thì mới vào chỉ thị xuất hàng của **xuất gộp 2 tuần (3 ngày trước ngày bắt đầu・thứ Sáu)** (xác nhận 2026/09/21. Cũ: ngày trước ngày picking). Con tự động của sự cố không chuyển sang Chờ xuất cho đến khi cả `schedule_confirmed` và `quantity_confirmed` đều là true (bổ sung 2026/09/24 〔quyết định v2.3 #23・#24〕) | Đã quyết định (2026/09/18・sửa ký hiệu 2026/09/21) |
| REQ-DL-803 | Yêu cầu hiển thị | Ở tab tháng của lịch thiết lập chu kỳ giao hàng, chỉ hiển thị các tháng của kỳ đối tượng thiết lập (tháng bắt đầu〜tháng kết thúc). Không hiển thị tháng không thể chỉnh sửa | Đã quyết định (2026/09/18) |
| REQ-DL-802 | Yêu cầu hiển thị | Giá trị của yêu cầu thay đổi là Có thể thay đổi／Đang yêu cầu／Đề xuất／**Đã điều chỉnh**／Không thể thay đổi. Dấu "đã điều chỉnh" **không hiển thị ở hiển thị tháng**, hiển thị ở hiển thị tuần・hiển thị ngày・danh sách・chi tiết dữ liệu giao hàng | Đã quyết định (2026/09/18) |
| REQ-DL-794 | Yêu cầu nghiệp vụ | Tháng áp dụng của đăng ký liên quan hợp đồng (thay đổi nội dung・tạm dừng・hủy・tiếp tục) là tháng sau nếu đang trong kỳ đặt hàng, và tháng sau nữa nếu đã chốt đặt hàng | Đã quyết định (2026/09/18) |
| REQ-DL-795 | Yêu cầu kiểm soát | Không hủy dữ liệu giao hàng đã chỉ thị xuất hàng vì lý do thay đổi hợp đồng. Xử lý riêng trước tháng phản ánh bằng thay đổi "chỉ chuyến giao hàng này" trong chi tiết dữ liệu giao hàng | Đã quyết định (2026/09/18) |
| REQ-DL-796 | Yêu cầu kiểm soát | Xử lý ảnh hưởng đến kế hoạch・dữ liệu giao hàng・hợp đồng con theo ma trận ảnh hưởng ở §4A-6 cho từng nội dung thay đổi của hợp đồng | Đã quyết định (2026/09/18) |
| REQ-DL-797 | Yêu cầu kiểm soát | Khi tạm dừng thì dừng override đã duyệt và ngày không thể nhận hàng của cơ sở, khôi phục khi tiếp tục. Khi hủy hợp đồng thì hủy bỏ | Đã quyết định (2026/09/18) |

### 12-8. Kỳ vọng hiệu quả

Nếu đưa các nội dung trên vào, các tổ hợp cần kiểm thử sẽ giảm như sau.

| Đối tượng | Hiện trạng | Sau đề xuất |
|---|---|---|
| Cấu hình giao hàng của hợp đồng | Nhập tự do・không kiểm tra nhất quán | Lựa chọn chỉ là giá trị có thật trong Master + cảnh báo nhất quán khu vực・dải nhiệt độ |
| Đường ghi đè ngày | 4 đường | 1 đường (+ phiên bản hàng loạt) |
| Tổ hợp trạng thái | 24 | 6 chuyển trạng thái có trong bảng chuyển trạng thái |

---

## Phụ lục A. Mock UI đã xác nhận hoạt động

`picking_schedule_setting_demo_ja.html` là file HTML đơn (không phụ thuộc bên ngoài, **cố định giao diện sáng**) triển khai toàn bộ logic tính toán của đặc tả này. Có thể xác nhận tương tác các nội dung sau.

- Tạo lại 28 slot theo thay đổi A1 đầu tiên・kỳ đối tượng tạo・kỳ tạm dừng
- Chuyển đổi riêng lẻ "ngày lễ giao hàng" "không thể xuất hàng" theo từng ngày lễ・ngày nghỉ đột xuất
- Chỉnh sửa khung chu kỳ không thể xuất hàng theo từng kho, và thao tác phản ánh hàng loạt thiết lập hiện tại cho 3 kho
- Yêu cầu thay đổi chu kỳ bắt đầu tháng sau của doanh nghiệp, ứng viên vắt qua tháng trong cùng chu kỳ, không có ngày mong muốn, lý do không thể chọn, luồng cần xác nhận của vận hành
- Hiển thị theo thời gian thực khung không thể giao hàng cơ bản và ứng viên không thể giao hàng theo lead time 1〜3 ngày
- Thêm・xóa ngày không thể xuất hàng, và dời lên trước kế hoạch picking tương ứng
- Hiển thị ngày lễ đã đăng ký trong hệ thống, và Override ngày lễ theo đơn vị ngày
- Tự động chia số lượng theo thay đổi số lần giao hàng
- Ảnh hưởng của chuyển đổi dời lên trước／dời ra sau đến ngày giao hàng・ngày picking・lead time thực tế
- Tính toán lại theo thời gian thực của màn hình 03/04/05

### Phụ lục A-2. Chức năng bổ sung của Mock UI (2026-09-12)

**Mục 00 "Tùy chọn đặc tả"** — Có thể chuyển đổi 8 điểm chưa nhất quán ở §9-2 trên màn hình và so sánh ảnh hưởng. Khi chuyển đổi thì 01〜06 được tính toán lại ngay.

| # | Lựa chọn | Thay đổi khi chuyển đổi |
|---|---|---|
| 1 Thứ của ngày đầu tiên chu kỳ | **Cố định thứ Hai**／ngày tùy ý (cũ) | Làm tròn A1 đầu tiên về thứ Hai trước đó, tính toán lại phân bổ 28 slot và toàn bộ ngày |
| 2 Giới hạn trên của kỳ đối tượng tạo | **6 tháng (áp dụng)**／12 tháng (cũ・để so sánh) | Cảnh báo kỳ đối tượng và số tab tháng. **Đặc tả cơ bản là 6 tháng** (quyết định 2026/09/12・xác nhận 2026/09/21). 12 tháng là để so sánh trên demo, khi chọn thì hiển thị lưu ý "Hiển thị dài hạn đến 6 tháng sau" |
| 3 Cách chỉ định riêng | **Đến cuối tháng・tuần thứ N**／chọn được cả cuối tháng／chỉ 1〜28 ngày (cũ) | Thêm "Cuối tháng hàng tháng" "Tuần thứ N hàng tháng" vào ngày giao chỉ định của thiết lập giao hàng hợp đồng, đọc lại ngày theo từng tháng |
| 4 Giới hạn picking mỗi ngày | **Cảnh báo theo số lượng** (có thể đổi ngưỡng trên màn hình)／không giới hạn (cũ) | Cảnh báo ngày vượt ở màn hình 04 bằng khung viền và số lượng, hiển thị số ngày vượt ở tổng kết tháng hiện tại. Có thể xác nhận hoạt động bằng cách bật "Mẫu mật độ cao" |
| 5 Sản phẩm có hạn dùng ngắn | **Hiển thị lý do + di chuyển tách**／không đưa vào đánh giá (cũ) | Hiển thị lý do không thể và "cần xác nhận" "hạn ngắn" ở ô của màn hình 04・05, hiển thị lý do dịch chuyển ở đánh giá của 03 và danh sách theo ngày |
| 6 Phạm vi yêu cầu thay đổi của doanh nghiệp | **Kỳ đã tạo (tối đa 6 tháng)**／chỉ chu kỳ tháng sau (cũ) | Tab chu kỳ của yêu cầu thay đổi và ngày ứng viên. Ngày quá khứ・tháng hiện tại không thể chọn, kèm lý do không thể |
| 7 Đơn vị giữ thiết lập | Đơn vị hợp đồng (cơ sở)／đồng nhất theo Master khách hàng | Câu giải thích phạm vi áp dụng của thiết lập giao hàng hợp đồng |
| 8 Chỉnh sửa kế hoạch đã tạo | **draft・published・locked**／luôn tạo lại (cũ) | Hiển thị cột trạng thái ở danh sách kế hoạch xuất hàng, hiển thị locked nằm ngoài đối tượng tính toán lại |

**Hiển thị mật độ cao của màn hình 04・05** — Tự động chuyển ô theo số lượng của 1 ngày (đến 2 bản ghi: thẻ／3〜5 bản ghi: gọn／6〜9 bản ghi: gộp theo hợp đồng／từ 10 bản ghi: chip dải nhiệt độ). Cũng có thể cố định thủ công chế độ hiển thị. Hiển thị badge số lượng bên phải ngày (từ 10 bản ghi là cam, từ 20 bản ghi là đỏ), click vào ô thì mở modal danh sách theo ngày (chi tiết dải nhiệt độ・chi tiết・xuất CSV). Công tắc "Mẫu mật độ cao (+18 cơ sở)" cho phép kiểm chứng cách hiển thị ở quy mô 20 cơ sở.

**Cách tiến hành demo** — Có thanh điều hướng mục cố định (F・00〜08) ở phía trên màn hình, di chuyển bằng click, nút trước／sau, phím ← →. Dưới tiêu đề mỗi mục có kèm 1 dòng "Nội dung cần trình bày". "Reset" để trở về trạng thái ban đầu (Esc đóng modal đang mở). Hiển thị **cố định giao diện sáng**, không bị ảnh hưởng bởi cài đặt chế độ tối của OS.

**Xác nhận chọn Master và kiểm tra nhất quán (§12-1)** — Loại giao hàng của thiết lập giao hàng hợp đồng chọn kho picking từ Master kho, điểm trung chuyển từ Master trung chuyển (loại kho = Trung chuyển), công ty giao hàng cấp 1・cấp 2 từ Master công ty giao hàng. Khi chuyển nơi giao hàng (cơ sở), cảnh báo xuất hiện với chỉ định không phù hợp với khu vực của nơi giao hàng đó và dải nhiệt độ của loại (ví dụ: giao hàng tự có chỉ Kanto, Eisei Logi chỉ Chubu・Kansai). Master công ty giao hàng nằm ở phần dưới của mục 07, có thể xác nhận dải nhiệt độ hỗ trợ・khu vực hỗ trợ, và có đang được dùng trong hợp đồng này hay không.

**Thống nhất Mock UI sang shell màn hình quản trị vận hành (2026/09/13)** — Đã đưa các màn hình F・00・02〜05・07・08 vào trong **shell màn hình quản trị vận hành ES STATION** giống màn hình 01 (menu bên trái + breadcrumb + hiển thị người dùng). Mọi màn hình trên demo đều ở dạng cho biết vị trí mà vận hành thực sự mở (Quản lý giao hàng／Quản lý khách hàng／Quản lý Master／Các thiết lập). 06 vốn đã có shell màn hình quản trị như một demo tích hợp. Đồng thời, "ghi chú thiết kế (dung lượng ảnh・số lượng đỉnh)" của 08 không phải nội dung của màn hình nên đã chuyển thành ghi chú bên ngoài màn hình.

**Phản ánh loại chuyến・coi như hoàn tất・phát hiện thiếu giao trên demo (2026/09/13)** — Thêm cột **loại chuyến (giao hàng tự có／chuyến công ty vận tải)** vào mục 08, và chuyến công ty vận tải hiển thị "không giữ giữa chừng". Thêm **Giao hàng hoàn tất (coi như)**・**Nghi thiếu giao**・**Chỉ xuất hàng (Yamato giao thẳng = chuyến vật tư)** vào trạng thái, và thống nhất thuật ngữ "Một phần chưa giao" thành **Giao một phần**. Thêm phát hiện thiếu giao vào danh sách cần xác nhận, và có thể tạo bản nhân bản (số nhánh) cả từ thiếu giao.

**Thêm luồng tổng thể (mục F) và quản lý tài xế (mục 08) (2026/09/13)** — Thêm "F Luồng tổng thể" ở đầu Mock UI, vừa chuyển đổi các thẻ giai đoạn ① Chuẩn bị Master → ② Thiết lập toàn công ty → ③ Hợp đồng → ④ Thay đổi・yêu cầu・khóa → ⑤ Thiết lập tài xế → ⑥ Xác nhận sự cố → ⑦ Nhân bản, vừa có thể xác nhận người phụ trách・nội dung được quyết định・thứ chuyển giao tiếp theo・guard, và trạng thái theo từng giai đoạn (`draft`／`published`／`locked`). Ở cuối thêm "08 Quản lý tài xế (vận hành)", có thể xác nhận KPI tiến độ trong ngày, phân công và tiến độ theo tài xế, tiến trình STEP1〜5 của chuyến ES giao hàng theo từng dữ liệu giao hàng, cần xác nhận (một phần chưa nhận・một phần chưa giao・chênh lệch số lượng kiểm hàng・báo cáo sự cố・chưa phân công), và thao tác **nhân bản bản ghi con số nhánh từ một phần chưa giao**.

**Xác nhận loại giao hàng và Master kho (§3.1B・§2.3)** — Thêm bảng "Loại giao hàng" vào thiết lập giao hàng hợp đồng (dải nhiệt độ・vật tư × kho × công ty giao hàng cấp 1 × điểm trung chuyển × công ty giao hàng cấp 2 × lead time × tỷ lệ cấu thành). **※ Demo là trước khi phản ánh quyết định 2026/09/21** (lead time do loại giao hàng của hợp đồng giữ chứ không phải Master kho・§3.1B. Phản ánh phía demo để lần sau). Khi đổi kho thì lead time tự động chuyển sang giá trị mặc định của Master kho, kế hoạch xuất hàng được tạo theo chi tiết giao hàng × loại giao hàng và ngày picking thay đổi theo từng loại. Ở mục 07 "Master kho" có thể xác nhận trong 1 màn hình loại kho・mã văn phòng kinh doanh・khung không thể xuất hàng・ngày không thể theo ngày・ngưỡng số lượng・lead time theo khu vực・đơn vị xuất của CSV chỉ thị xuất hàng. Tab kho của màn hình 04・05 tổng hợp theo kho của loại giao hàng.

**Xác nhận kế hoạch và dữ liệu giao hàng (§4A)** — Hiển thị cột trạng thái ở danh sách kế hoạch xuất hàng theo mặc định (`Kế hoạch (draft)`／`Xác định (published)`／`locked`), có thể xác nhận cách hiển thị cấu trúc 2 tầng với tháng hiện tại = locked・tháng sau = published・từ đó trở đi = draft. Màn hình yêu cầu thay đổi của doanh nghiệp trở thành dạng chuyển đổi chu kỳ giao hàng bằng tab, xếp 6 chu kỳ đã tạo (+ tháng chưa tạo), và cách hiển thị thay đổi thành "chỉ ngày・không có số lượng" ở giai đoạn kế hoạch và "cập nhật trực tiếp dữ liệu giao hàng" ở giai đoạn đã xác định. Đặc tả cũ (chỉ chu kỳ tháng sau) có thể so sánh bằng tùy chọn đặc tả #6. Đã thêm bộ lọc kho vào màn hình 04・05.

**Màn hình dữ liệu giao hàng (mục 06)** — Thêm dải nhiệt độ・tuyến・số vận đơn・trạng thái・thu tiền vào danh sách xuất hàng・giao hàng. Chi tiết là 1 màn hình tích hợp, có tuyến giao hàng (2 dòng gồm điểm trung chuyển và nơi giao hàng cuối), số vận đơn (nhiều số・nơi phát hành・không phát hành lại ở điểm trung chuyển), snapshot địa chỉ tại thời điểm giao hàng, hiển thị chênh lệch thực tích giao hàng, thu tiền, tách tài liệu đính kèm dành cho nhà thầu ủy thác / dành cho khách hàng, lịch sử yêu cầu・phê duyệt.
