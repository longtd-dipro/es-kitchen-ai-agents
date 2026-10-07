# Đặc tả giao hàng: Lịch sử quyết định (§0-2〜0-2Q, §19 cũ) — dùng để tham chiếu. Các quyết định đang có hiệu lực xem docs/決定台帳.md

<!-- Nguồn: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (tách theo chương ngày 2026-10-03. Nội dung giữ nguyên như tại thời điểm tách) -->

### 0-2. Thay đổi so với v2.0 (quyết định đợt 2 ngày 2026/09/21)

Đến v2.0, 84 điểm mâu thuẫn giữa các tài liệu gốc đã được giải quyết xong. Sau đó có **quyết định đợt 2 (11 mục + 5 mục cần sửa kèm theo)**, và bản v2.1 này phản ánh các quyết định đó. Những điểm có hiệu lực như sau.

| | Đến v2.0 | **v2.1** |
|---|---|---|
| Điểm khởi đầu của `locked` | Thời điểm xuất gộp dữ liệu 2 tuần | **Chỉ tại thời điểm chỉ thị xuất hàng được gửi thành công lần đầu.** Không `locked` chỉ vì có số vận đơn; nếu vận đơn xuất hiện trước chỉ thị xuất hàng thì phát hiện là **anomaly** |
| Coi như hoàn tất | Xét theo loại chuyến (chuyến ủy thác) | **Xét theo final leg (chặng cuối).** Ứng dụng tài xế ES = không coi như hoàn tất, sáng hôm sau chưa hoàn tất thì vào missing queue / Công ty vận tải giao trực tiếp = coi như hoàn tất |
| Đổi ngày sau hạn chót | Vận hành đổi từng mục, lý do tùy chọn | ~~Trước hạn chót = từng mục hoặc hàng loạt đều được / Sau hạn chót, trước `locked` = chỉ vận hành đổi từng mục, bắt buộc có lý do, giới hạn ở bản ghi cần xác nhận / Sau `locked` = hủy + nhân bản~~　**→ Quyết định đợt 3 ngày 2026/09/22 sửa lại thành "sau hạn chót thì không đổi" (0-2B)** |
| Nhân bản | Có thể nhân bản từ `draft` | **Không thể nhân bản từ `draft`.** `draft` chỉ được "sao chép/thay đổi kế hoạch". Nhân bản thực hiện từ `published`/`locked` |
| Khóa duy nhất của kế hoạch | (ID hợp đồng, ngày giao hàng) | **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** |
| Trục của chuyến | Loại chuyến do hợp đồng giữ | **3 trục: thêm mới `delivery_regime` (self / partner_driver / parcel_carrier), `service_form` đặt ở phân loại giao hàng, relay suy ra từ route legs (không lưu)** |
| Khung giờ nhận hàng | 1 cặp from/to | **Bảng con `site_receive_windows` + snapshot sang `delivery_receive_windows`** |
| Hạn chót tạm | Không giới hạn | **Với `marker_source=provisional` không chạy xác nhận số lượng, email xác nhận, chỉ thị xuất hàng** |
| Hạn thanh toán | 1 hóa đơn gồm cả trả trước và quyết toán thực tế | **Tách hóa đơn theo `billing_type`/`payment_due_date`. 1 hóa đơn = 1 hạn thanh toán** |
| Tháng chu kỳ | Tháng có nhiều ngày hơn (14 vs 14 chưa quyết) | **Tháng chứa ô thứ 14 `B7`.** Cho cùng kết quả, và với 14 vs 14 tự động là tháng trước. Không tạo nhánh ngoại lệ |
| Vai trò kho | "Không lập vai trò" | **Xóa hoàn toàn `倉庫管理者` (quản lý kho).** Tab kho chỉ là bộ lọc dữ liệu |
| Số lượng của kế hoạch | Có thể hiểu là "kế hoạch không giữ số lượng" | **Giữ nội bộ `shipping_plans.estimated_qty`.** Chỉ là không cho doanh nghiệp thấy khi ở `draft` |
| Trạng thái | Gọi chung là "trạng thái" | **Tách thành 2 máy trạng thái**: `plan lifecycle` (draft/published/locked) và `delivery status` (chờ xuất hàng ~ đã giao) |

Về cách phản ánh, đã quyết định **với mỗi quy tắc phải sửa đồng thời 3 chỗ: ① mô tả nghiệp vụ ② bảng state/batch ③ mô hình dữ liệu**. Nhằm tránh sự cố chỉ sửa phần đầu còn phần cuối vẫn là logic cũ.

> **2 bản demo (`picking_schedule_setting_demo_ja.html` / `delivery_schedule_plan_demo_ja.html` + artifact) và `Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md` chưa được phản ánh ở cả v2.1 lẫn v2.2.**

### 0-2B. Thay đổi so với v2.1 (quyết định đợt 3 ngày 2026/09/22)

Bản v2.2 này phản ánh quyết định đợt 3 (`01_仕様/00_Quyết_định/Quyết_định_v2.2_20260922.md`, 6 mục). **Nếu mâu thuẫn với đợt 2 thì đợt 3 được ưu tiên.** Toàn văn ở §19-3.

| | Đến v2.1 | **v2.2** |
|---|---|---|
| Đổi ngày sau hạn chót | 3 giai đoạn: trước hạn chót / sau hạn chót, trước `locked` (chỉ vận hành đổi từng mục, bắt buộc có lý do, giới hạn ở bản ghi cần xác nhận) / sau `locked` | **2 giai đoạn. Trước hạn chót = từng mục hoặc hàng loạt đều được / Sau hạn chót đặt hàng = không đổi ngày (hủy + nhân bản).** Mốc phân chia là **duy nhất hạn chót đặt hàng**, `locked` không phải mốc đổi ngày |
| Ngày điều chỉnh (`adjust`) | Tự động chèn `7 −(số ngày nghỉ mod 7)` ngày **ngay sau kỳ nghỉ** | **Không tự động chèn.** Chỉ **tính và hiển thị** số ngày thiếu, **quản trị viên quyết định vị trí đặt** (sau đó có thể sửa). Nếu chưa đủ bội số của 7 thì **không lưu được**. Có `adjust_for_pause_id` |
| Thay đổi sau chỉ thị xuất hàng | Chưa quyết (§18 No.20) | **Công ty vận tải ② / nhân viên giao hàng = đổi được (gửi lại) / địa chỉ nơi giao = `rev` mới + vận đơn `voided` → phát hành lại / kho picking, ngày = hủy + nhân bản** |
| Hạn gửi lại chỉ thị xuất hàng | Đến trước khi bắt đầu picking (giờ bắt đầu đang xác nhận) | **Đến khi nhận được kết quả xuất hàng của lần giao đó.** **Không giữ** giờ bắt đầu picking của kho |
| Trùng Slot cùng loại | Chưa quyết (đề xuất: cùng Slot + cùng phân loại giao hàng là lỗi) | **Hiển thị thẻ cảnh báo và vẫn lưu được** (như hiện hành. Phương án báo lỗi **không được chọn**) |
| Huy hiệu yêu cầu thay đổi | Chưa quyết (đếm toàn bộ) | **Chỉ đếm các yêu cầu chưa xử lý đã đến hạn.** Tổng số xem ở màn hình danh sách |

> **Lưu ý về thay đổi vị trí của `locked`**: từ v2.2, `locked` là **mốc của chỉ thị xuất hàng** (gửi lại, kiểm toán, kho bắt đầu làm việc), **không phải mốc quyết định có đổi được ngày hay không**. Việc có đổi được ngày hay không chỉ xét bằng `delivery_cycles.order_close_date`.

### 0-2C. Thay đổi so với v2.2 (quyết định đợt 4 ngày 2026/09/23)

Bản v2.3 này phản ánh quyết định đợt 4 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_20260923.md`, 10 mục). **Chỉ là quyết định về mô hình dữ liệu**, không thay đổi quy tắc nghiệp vụ. Toàn văn ở §19-4.

| | Đến v2.2 | **v2.3** |
|---|---|---|
| **Nguồn chuẩn của mô hình dữ liệu** | ER được viết ở 2 chỗ: §16 của tài liệu này và §7 của tài liệu gốc | **`Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §14 là nguồn chuẩn duy nhất.** §16 của tài liệu này chỉ ghi tên bảng và vai trò, không ghi danh sách cột |
| Tuyến giao hàng | 1 bảng `delivery_routes` (dùng chung `contract_id NULL` / `delivery_id NULL`) | **3 bảng**: `contract_routes` (hợp đồng cha) / `contract_month_routes` (snapshot hợp đồng con) / `delivery_legs` (mỗi lần giao). **Chỉ `delivery_legs` giữ `driver_id`** |
| Thay đổi tuyến "chỉ lần giao này" | Giữ ở `route_override` | **Bỏ `route_override`.** UPDATE trực tiếp `delivery_legs` + nhật ký kiểm toán |
| Công ty vận tải / điểm trung chuyển | Phân loại giao hàng cũng có `carrier1_id` / `relay_warehouse_id` / `carrier2_id` | **Bỏ khỏi phân loại giao hàng, chỉ để ở phía leg** (phù hợp số chặng thay đổi) |
| `shipping_plans.route_id` | Có | **Bỏ** (kế hoạch bị thay thế nên FK bị treo) |
| Bảng yêu cầu thay đổi | `delivery_change_requests` | **`change_requests`** (vì cũng giữ `shipping_plan_id`) |
| "Cần xác nhận" | Chỉ là tên gọi (không có bảng vật lý) | **Thêm mới `review_items`.** Có `status` và **có thể đóng**. Batch chỉ UPSERT |
| Tham chiếu nơi giao | `deliveries.branch_id` | **`deliveries.site_id`** (thống nhất với `contracts.site_id`) |
| Chi tiết kết quả | Không có ở bất kỳ ER nào | **Thêm mới `delivery_lines`** (số lượng dự kiến/đã giao theo sản phẩm, hạn dùng, tồn kho thực, hủy) + `deliveries.order_id` |
| Giá trị mặc định | DEV chưa ghi | **Ghi rõ ở DEV §3** (ngưỡng số lượng 300 đơn/ngày, lead time chỉ thị xuất hàng 3 ngày) |

### 0-2D. Bổ sung ngày 2026/09/24 (bản ghi con tự động của sự cố)

Đã phản ánh bổ sung ngày 2026/09/24 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Trouble_con_tự_động_20260924.md`, #20〜#26). **Phiên bản vẫn là v2.3** (tài liệu DEV cũng là "v2.3, phản ánh quyết định bổ sung 2026-09-24"). Nguồn chuẩn là các mục §9.4・§10.2・§12.1・§12.2・§13.2.1・§13.3・§13.4・§14.6・§14.7・§14.11・§15.11・§15.12・§16.8.1・§16.9・§16.10・§16.13・§17.1・§18 của `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md`, **nếu mâu thuẫn thì DEV là chuẩn**. Người giải quyết sự cố là **vận hành (logistics)**. Toàn văn ở §19-5.

| | Đến 2026/09/23 | **Bổ sung 2026/09/24** |
|---|---|---|
| Báo cáo sự cố và trạng thái bản ghi cha | Đã xuất hàng / đã nhận → **đang xác nhận**. Liên hệ sau khi giao: đã giao → **đang xác nhận** | **Không đổi trạng thái bản ghi cha.** Giữ nguyên đã xuất hàng / đã nhận, và liên hệ (khiếu nại) sau khi giao vẫn giữ đã giao. Ghi nhận báo cáo sự cố và mở mục cần xác nhận〔Quyết định v2.3 #20〕 |
| Dùng `確認中` (đang xác nhận) cho | Bản ghi cha nhận sự cố / bản ghi con đã nhân bản | **Trong luồng sự cố, chỉ cho bản ghi con chưa xuất hàng (`shipped_date IS NULL`) và ứng viên phục hồi**〔Quyết định v2.3 #20〕 |
| Cách đóng bản ghi cha | Từ đang xác nhận chọn đã giao / giao một phần / chờ giao lại / dừng / đã nhận | **Vận hành (logistics) đóng trực tiếp bản ghi cha**: đã giao / giao một phần + con (số còn lại) / chờ giao lại + con (toàn bộ) / đã nhận (quay lại trong ngày) / dừng. Điểm bắt đầu là đã xuất hàng, đã nhận (giao toàn bộ cũng có thể từ đã giao). Nếu có bản ghi con tự động thì **trong cùng transaction dùng lại hoặc hủy**〔Quyết định v2.3 #21〕 |
| Sự cố không được giải quyết đến hạn (**thay thế bởi #30 ngày 2026/09/29**, 0-2E) | Chưa quy định | **Nếu quá `auto_duplicate_due_at` (= `reported_at` + cài đặt vận hành `trouble_auto_duplicate_after_minutes`, bắt buộc) mà chưa giải quyết thì batch `trouble_auto_duplicate` tạo đúng 1 bản ghi con**: `確認中`・`duplicate_type=trouble_pending`・`creation_source=trouble_timeout`・`schedule_confirmed=false`・`quantity_confirmed=false`〔Quyết định v2.3 #22〕 |
| Bản ghi con tự động chưa xác định | — | **Không thuộc đối tượng của chỉ thị xuất hàng, vận đơn, gán tài xế, thanh toán, thông báo, coi như hoàn tất**〔Quyết định v2.3 #23〕 |
| Bản ghi con `確認中 → 出荷待` | Khi vận hành xác định ngày | **Chỉ khi `schedule_confirmed=true` và `quantity_confirmed=true`** (chưa xác định thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`). Nếu cách giải quyết không cần gửi lại, bản ghi con tự động được `hủy` trong cùng transaction〔Quyết định v2.3 #24〕 |
| Bản ghi con của 1 báo cáo sự cố | Không giới hạn | **Tối đa 1.** Nhân bản thủ công cũng dùng lại bản ghi con đó, bản thứ 2 bị từ chối bằng `DOMAIN_TROUBLE_CHILD_EXISTS`〔Quyết định v2.3 #21・#22〕 |
| Đối tượng coi như hoàn tất / phát hiện thiếu hàng | Chỉ xét final leg | **Loại trừ các lần giao có báo cáo sự cố chưa giải quyết.** Coi như hoàn tất = `status = 出荷済`, phát hiện thiếu hàng = `status IN (出荷済, 受取済)`. `trouble_auto_duplicate` chạy trước 2 batch này cùng thời điểm nghiệp vụ〔Quyết định v2.3 #25〕 |
| Mô hình dữ liệu | — | `deliveries` thêm `duplicate_type`/`creation_source`/`source_trouble_report_id` (UNIQUE)/`schedule_confirmed`/`quantity_confirmed`, `trouble_reports.auto_duplicate_due_at`, `review_items.kind = trouble_auto_child_pending`〔Quyết định v2.3 #26〕 |

> Vì thao tác đưa đã giao quay lại "đang xác nhận" không còn nữa, nên "thời hạn có thể quay lại" của 〔Quyết định #61〕 cũng không còn là vấn đề (11-7). Việc không đặt thời hạn tiếp nhận liên hệ sau khi giao vẫn giữ nguyên. **Không thêm mục chưa quyết mới vào §18.**

### 0-2E. Bổ sung 2026/09/29 (xem lại xử lý sự cố)

Đã phản ánh bổ sung ngày 2026/09/29 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Rà_soát_trouble_20260929.md`, #27〜#33). **Phiên bản vẫn là v2.3.** **Thay thế #22 (quá hạn thì tạo bản ghi con tự động) và #25 (batch `trouble_auto_duplicate`)** của bổ sung 09/24. Nguồn chuẩn là các mục §9.4・§12.1・§12.2・§13.2〜13.3・§14.6・§14.7・§14.11・§15.11・§15.12・§15.12.1・§16.8.1・§16.13・§17.1・§18 của tài liệu DEV, **nếu mâu thuẫn thì DEV là chuẩn**. Toàn văn ở §19-6.

| | Bổ sung 2026/09/24 | **Bổ sung 2026/09/29** |
|---|---|---|
| Khi tạo bản ghi con tự động | Nếu chưa giải quyết mà quá `auto_duplicate_due_at` (báo cáo + số phút theo cài đặt vận hành) thì batch `trouble_auto_duplicate` tạo | **Cùng lúc đăng ký báo cáo sự cố**, **chỉ tạo cho loại mà master loại sự cố quy định "tạo"** (giao nhầm・vắng mặt・hư hỏng = tạo / chênh lệch số lượng・chậm trễ・khác = không tạo). **Bỏ hạn chót, số phút, batch**〔Quyết định v2.3 #30〕 |
| Tính duy nhất của bản ghi con tự động | 1 bản ghi cho mỗi báo cáo sự cố (`UNIQUE(source_trouble_report_id)`) | **Mỗi lần giao xảy ra sự cố có 1 bản ghi con tự động còn sống (không phải đã hủy)** (`source_trouble_delivery_id`)〔Quyết định v2.3 #29〕 |
| Nhiều báo cáo sự cố | Chưa quy định | **Gộp theo lần giao và giải quyết một lần**〔Quyết định v2.3 #29〕 |
| Sự cố lại ở bản ghi con | Chưa quy định (không nhân bản được từ bản ghi con) | **Tạo số nhánh tiếp theo của bản ghi cha** (nội dung sao chép từ bản ghi con xảy ra sự cố)〔Quyết định v2.3 #28〕 |
| "Chưa nhận được" sau khi coi như hoàn tất | Từ đã giao chỉ chọn được giao toàn bộ | **Chỉ với đã giao ở trạng thái coi như hoàn tất (`presumed`), có thể chuyển sang chờ giao lại hoặc dừng.** Sau khi yêu cầu Yamato điều tra rồi mới quyết định〔Quyết định v2.3 #27〕 |
| Không gửi phần thiếu | Giao một phần luôn tạo bản ghi con | Thêm vào cách giải quyết **"giao một phần (phần còn lại không gửi)"**. Không tạo bản ghi con. Không có ngưỡng, vận hành tự chọn〔Quyết định v2.3 #31〕 |
| Giao sau khi chậm trễ | Vận hành giải quyết | **Khi lần giao chỉ có chậm trễ nhận được báo cáo giao toàn bộ, hệ thống tự động giải quyết là "giao toàn bộ"**〔Quyết định v2.3 #32〕 |
| Cần xác nhận | Bản ghi con tự động (`trouble_auto_child_pending`) | Thêm **báo cáo sự cố (chưa giải quyết) `trouble_open`**〔Quyết định v2.3 #30・#33〕 |

> Đã thêm 1 mục chưa quyết mới vào §18 (No.23: khi coi như hoàn tất nhưng chỉ một phần thùng không đến).

### 0-2F. Bổ sung 4 ngày 2026/09/29 (giải quyết vấn đề chưa giải quyết・ủy thác chặng 1)

Đã phản ánh bổ sung 4 ngày 2026/09/29 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Vấn_đề_chưa_giải_quyết_và_ủy_thác_đợt_1_20260929.md`, #34〜#51). **Phiên bản vẫn là v2.3.** Khởi nguồn là `Giao_hàng_Vấn_đề_chưa_giải_quyết_và_phương_án_v1.md` (2026/09/29), câu trả lời của vận hành là "**tiến hành theo phương án đề xuất / trường hợp chặng 1 là ủy thác và có trung chuyển thực sự có**". **Thay thế #60 đợt 1 (hiện chỉ gán chặng 2)**〔Quyết định v2.3 #48〕. Nguồn chuẩn là các mục §3.1・§3.2・§3.3・§3.6・§4.1・§9.1.1・§9.4・§11・§12.4・§13.1・§13.4・§13.5・§14.4〜14.7・§14.11・§15.2・§15.9・§15.15・§16.5・§19.1・§19.1.1 của tài liệu DEV, **nếu mâu thuẫn thì DEV là chuẩn**. Toàn văn ở §19-7.

| Mục | Từ trước đến nay | **Bổ sung 4 ngày 2026/09/29** |
|---|---|---|
| Phạm vi hiển thị trên Web công ty vận tải ủy thác | Chưa quyết (§18 No.1) | **Đã xác định (sau hạn chót) = toàn bộ mục** / **kế hoạch (trước hạn chót) = chỉ đến chu kỳ tháng sau・ngày giao・tên cơ sở・nhiệt độ・số lượng đơn** (không hiển thị số lượng, có dấu "kế hoạch"). Chỉ hiển thị **các lần giao có chặng do công ty mình phụ trách**. Màn hình dùng lại lịch của vận hành (tháng・tuần・ngày)〔Quyết định v2.3 #34・#51〕 |
| Thông báo hạn sử dụng ngắn | Chưa quyết (§18 No.6). Chia tách do vận hành quyết | **Nếu số ngày từ ngày xuất hàng đến ngày giao > số ngày hạn sử dụng − số ngày an toàn (mặc định 2 ngày)** thì cần xác nhận `shelf_life_warning`. Việc chia tách vẫn do vận hành quyết〔Quyết định v2.3 #35〕 |
| Dữ liệu giao hàng vật tư | "Khi có đơn hàng" chưa quyết / lead time có 2 nghĩa | **Tạo mỗi khi xác nhận giỏ hàng.** Nếu có chuyến vật tư cùng cơ sở・cùng ngày giao・trước chỉ thị xuất hàng thì **gộp thành 1**. Lead time là **ngày xuất hàng = ngày giao − lead time**, ngày giao là **ngày giao được đầu tiên từ ngày hôm sau ngày đặt hàng mà đảm bảo được lead time**〔Quyết định v2.3 #36・#38〕 |
| Yêu cầu thay đổi vẫn "đang yêu cầu" | Chỉ là không tự động từ chối | **Hạn xử lý = hạn chót đặt hàng. 3 ngày trước hạn chót thì cần xác nhận `change_request_due`.** Không tự động từ chối〔Quyết định v2.3 #37〕 |
| Vận phí・trả hàng của hàng thay thế・dừng | Không có mục giữ hàng gốc được thay / cờ vận phí chỉ cho giao lại / không có cách tạo để gửi về trụ sở | **`delivery_lines.substituted_from_product_id`** (thanh toán theo đơn giá hàng gốc) / **`freight_billable`** (trước đây `redelivery_billable`. Cũng dùng cho dừng) / lý do nhân bản **"trả hàng"** (`duplicate_type=return`・về kho trả hàng・không thanh toán)〔Quyết định v2.3 #39〜#41〕 |
| Hiển thị Web doanh nghiệp | Hiển thị hủy (có chuyến thay thế) là "đang xác nhận" | **Giữ tên hiển thị cho Web doanh nghiệp riêng với trạng thái** (đang điều chỉnh ngày giao / đang chuẩn bị giao lại / đã giao một phần / dự kiến giao lại / dừng giao hàng, v.v.)〔Quyết định v2.3 #42〕 |
| Cần xác nhận khi chưa đặt tài xế | Thời điểm gửi chỉ thị xuất hàng / 1 tuần trước ngày giao lẫn lộn | **1 lần vào ngày trước ngày giao**〔Quyết định v2.3 #43〕 (sửa 2026/09/30: vào 3 ngày trước và ngày trước ngày giao, hiển thị cần xác nhận của vận hành và Web công ty vận tải ủy thác, đồng thời gửi email cho công ty vận tải ủy thác〔Bảng yêu cầu dòng 142〕) |
| 6 mục tạm・Thomas・Yamato | Đang chờ xác nhận | **Tiến hành triển khai với giá trị tạm.** CSV Thomas **làm sao chỉ thay được phần xuất ra**, nếu không thể UTF-8 thì xuất ra Shift_JIS. Hủy xác định theo cách gửi lại. Các mục giao cho Yamato tiến hành theo **phương án tạm**〔Quyết định v2.3 #44〜#46〕 |
| Khi chặng 1 là công ty vận tải ủy thác | ES đánh số không có trong DEV / hiện chỉ gán chặng 2 / không ghi lại được việc nhận ở điểm trung chuyển / không chọn được ủy thác cho chặng 1 | **ES đánh số (`es_generated`・số lần giao + số thùng 2 chữ số)** / **gán theo người vận chuyển (không gán chặng của công ty vận tải)** / **thời điểm nhận theo từng chặng `delivery_legs.picked_up_at`** (không tăng trạng thái) / **công ty vận tải・điểm trung chuyển chọn từ toàn bộ master**〔Quyết định v2.3 #47〜#50〕 |
| Mô hình dữ liệu | — | `delivery_lines.substituted_from_product_id` / `deliveries.freight_billable` (đổi tên)・`return_to_warehouse_id`・`duplicate_type=return` / `warehouses.warehouse_type=return` / `delivery_tracking_numbers.issued_by=es_generated`・`box_no`・`box_total` / `delivery_legs.picked_up_at`・`picked_up_by` / `review_items.kind` thêm `shelf_life_warning`・`change_request_due` / cài đặt vận hành `shelf_life_safety_days` (mặc định 2)・`change_request_warn_days` (mặc định 3) |

> **Đã thay đổi các dòng của §18**: No.1・No.6 "đã giải quyết", No.3 "giải quyết một phần" (phần đã tiến triển nhờ các quyết định phát hành hóa đơn 9/25 và liên quan đến đơn đăng ký 9/28), No.5 xác định phương châm (vẫn còn xác nhận với nhà cung cấp), No.16・No.19 "tạm", No.7〜12 tiến hành triển khai với giá trị tạm. #1・#12・#18・#19・#20・#22・#24・#34〜#36・#40・#48・#53 của §20 cũng đã giải quyết (còn lại 31 mục). **Không thêm mục chưa quyết mới.**

### 0-2G. Bổ sung 5 ngày 2026/09/29 (thời điểm bắt đầu tạo kế hoạch・dữ liệu giao hàng / nút CSV của THOMAS)

Đã phản ánh bổ sung 5 ngày 2026/09/29 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Bắt_đầu_tạo_và_CSV_20260929.md`, #52〜#53). **Phiên bản vẫn là v2.3.** Nguồn chuẩn là các mục §4.7・§14.2・§14.8・§15.16・§16.1〜16.3・§19.6 của tài liệu DEV, **nếu mâu thuẫn thì DEV là chuẩn**. Toàn văn ở §19-8.

| Mục | Từ trước đến nay | **Bổ sung 5 ngày 2026/09/29** |
|---|---|---|
| Kế hoạch・dữ liệu giao hàng của hợp đồng đăng ký tạm | Chưa ghi hợp đồng ở trạng thái nào là đối tượng (thiếu sót) | **Trong thời gian đăng ký tạm (tiếp nhận "đang thiết lập"), không tạo kế hoạch・dữ liệu giao hàng・hợp đồng con.** Cũng không tạo trong thời gian nghỉ, khoảng trống từ khi hết thời gian dùng thử đến khi chính thức triển khai, và sau khi kết thúc〔Quyết định v2.3 #52〕 |
| Thời điểm bắt đầu tạo | Như trên | **Ngay sau khi xác định cơ sở (đăng ký chính thức), chỉ hợp đồng của cơ sở đó** tạo theo thứ tự hợp đồng con → kế hoạch (từ tháng chu kỳ bắt đầu đến cuối thời gian thiết lập) → dữ liệu giao hàng (chỉ các chu kỳ đã qua ngày bắt đầu đặt hàng). Nếu việc xác định quá hạn chót đặt hàng của chu kỳ bắt đầu thì sửa tháng chu kỳ bắt đầu thành chu kỳ tiếp theo rồi mới tạo (28-27)〔Quyết định v2.3 #52〕 |
| CSV của THOMAS | Chỉ có cơ chế gửi・nhập, không có thao tác trên màn hình | Màn hình "Chỉ thị xuất hàng・nhập" có các nút **xuất CSV chỉ thị xuất hàng (THOMAS) / xuất CSV cho vận đơn (Yamato) / nhập CSV kết quả xuất hàng・CSV số vận đơn / mẫu / dòng lỗi**. **Xuất ra không phải là gửi nên không `locked`**〔Quyết định v2.3 #53〕 |
| Mô hình dữ liệu | — | `contracts.status` (provisional〜ended)・`start_cycle_month`・`confirmed_at`・`confirmed_by` / `ship_order_exports` (ghi nhận xuất thủ công) |

### 0-2H. Bổ sung 6 ngày 2026/09/29 (tiếp nhận đăng ký: kho・số lần giao・bộ ban đầu của đơn hàng・vật tư・dùng thử)

Đã phản ánh những mục liên quan đến giao hàng・đơn hàng trong số các quyết định liên quan đến đơn đăng ký (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` §16・§17・28-77〜28-109). **Phiên bản vẫn là v2.3.** Mô hình dữ liệu được đặt ở DEV仕様書 §4.8 dưới dạng【đề xuất】, sẽ xác định sau khi DEV xác nhận. Toàn văn ở §19-9.

| Mục | Từ trước đến nay | **Bổ sung 6 ngày 2026/09/29** |
|---|---|---|
| Thời điểm quyết định kho・số lần giao | Nhập chung ở thiết lập giao hàng của hợp đồng (màn hình 02) | **Tại "xác nhận nội dung đăng ký" của tiếp nhận đăng ký, quyết định kho picking・số lần giao theo từng cơ sở・loại giao hàng** (trước đăng ký tạm). Vì cần để tạo bộ ban đầu của đơn hàng và vật tư. Công ty vận tải ①②・trung chuyển 1・lead time・mẫu giao hàng・chu kỳ giao hàng nhập ở thiết lập thông tin chi tiết của tiếp nhận (hợp đồng con | hợp đồng), phải hoàn tất trước đăng ký chính thức (guard của §15.16 theo DEV)〔28-93・28-77〕 |
| Thời điểm bộ ban đầu của đơn hàng・vật tư hoạt động | Sau đăng ký chính thức (cùng hợp đồng con・kế hoạch・dữ liệu giao hàng theo #52) | **Hoạt động tại thời điểm đăng ký tạm (hoàn tất xác nhận nội dung đăng ký).** Hợp đồng con・kế hoạch・dữ liệu giao hàng tạo khi đăng ký chính thức theo #52〔28-94・95・109〕 |
| Đơn hàng khi chính thức triển khai | — | Nếu có tài khoản (cơ sở, hoặc tài khoản của doanh nghiệp đã có), **doanh nghiệp có thể đặt hàng từ trong thời gian đặt hàng của tháng chu kỳ bắt đầu**. Nếu cả hai đều không có thì đến hạn chót sẽ là số lượng tiêu chuẩn. Nếu việc hoàn tất xác nhận quá hạn chót đặt hàng của chu kỳ bắt đầu thì sửa tháng bắt đầu thành chu kỳ tiếp theo (28-27)〔28-97・98〕 |
| Đơn hàng dùng thử | — | **Tự động tạo**: phân bổ giới hạn số lượng cung cấp hàng tháng của gói cho toàn bộ sản phẩm, phân chia theo số lần giao giống §4.4 (chênh lệch giữa các lần tối đa 1). **Doanh nghiệp không sửa được, vận hành có thể sửa cả số lượng lẫn sản phẩm đến ngày chốt đặt hàng**. Tạo cả khi không có tài khoản〔28-95・98・101・102・105〕 |
| Timeline dùng thử | Lấy hạn chót đặt hàng làm chuẩn | **Lấy ngày chốt đặt hàng (ngày thứ 7 của tuần B・D = B7・D7) làm chuẩn.** Nếu kịp B7 thì giao từ chu kỳ tiếp theo (cả nửa đầu・nửa sau), nếu kịp D7 thì giao từ nửa sau (tuần C) của chu kỳ tiếp theo. Nếu quá thì sang ngày chốt đặt hàng tiếp theo〔28-96・103・104 bị STEP5 T1 (2026/10/01) ghi đè〕 |
| Bộ ban đầu của vật tư | Tự động tạo khi hợp đồng thành lập (REQ-PO-217) | **Tự động tạo tại thời điểm đăng ký tạm. Ngày giao do vận hành nhập ở tab "hợp đồng con" của thiết lập thông tin chi tiết tiếp nhận (dưới tuyến giao hàng) (bắt buộc)**〔28-145. Trước đây: nhập ở xác nhận nội dung đăng ký〕, kho là kho giao vật tư, **miễn phí**. Nội dung là **số lượng bộ ban đầu giữ trong master vật tư (số lượng khác nhau theo số suất ăn của gói)**〔28-129〕. **Dữ liệu giao hàng của bộ ban đầu tạo khi đăng ký chính thức**〔28-130〕〔28-106〜108〕 |
| Từ chối・rút đơn khi vẫn đăng ký tạm | — | Hủy đơn hàng・bộ ban đầu vật tư đã tạo〔28-99〕 |
| Thay đổi kho・số lần giao sau đăng ký tạm | — | Cũng có thể sửa ở thiết lập thông tin chi tiết của tiếp nhận. Do ảnh hưởng đến đơn hàng・bộ ban đầu đã tạo, màn hình đưa ra cảnh báo và vận hành xem xét lại〔28-100〕 |
| Số lần giao và tùy chọn | — | **Theo từng nhiệt độ**, phần số lần giao vượt số lần giao tiêu chuẩn của master gói (lạnh・nhiệt độ thường / đông lạnh) thì tùy chọn loại A "thêm số lần giao" (OP000001) tự động được gán vào ① của hợp đồng con. Không bù trừ với nhiệt độ còn thiếu. Không giữ số lần giao 0 (lạnh từ 1 lần trở lên, ES Standard cả đông lạnh cũng từ 1 lần trở lên)〔28-154・28-156. Trước đây: so sánh theo tổng・28-85〕 |
| Cách chọn chu kỳ giao hàng (tiếp nhận) | Pull-down | **Chọn từ bảng tuần A〜D × thứ, bằng số lần giao. Không chọn được thứ không giao được.** (Hiển thị số lượng・ô không xuất hàng được giữ như §5-6)〔28-86〕 |

### 0-2I. Bổ sung 7 ngày 2026/09/29 (trang chủ Web doanh nghiệp: lịch giao hàng tháng này và chi tiết giao hàng)

Đã phản ánh bổ sung 7 ngày 2026/09/29 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Lịch_trang_chủ_doanh_nghiệp_20260929.md`, #54〜#57). **Phiên bản vẫn là v2.3.** Toàn văn ở §19-10.

| Mục | Từ trước đến nay | **Bổ sung 7 ngày 2026/09/29** |
|---|---|---|
| Trang chủ Web doanh nghiệp | Lịch giao hàng (màn hình 07) và "tình trạng giao hàng" (danh sách theo kỳ) tách riêng | **Trang chủ = bên trái là giao hàng tháng này (lịch), bên phải là thông báo và các lần giao cần xác nhận** (cùng bố cục với trang chủ Web công ty vận tải ủy thác). **Bỏ danh sách "tình trạng giao hàng"** (trước đây: lịch + các lần giao sắp tới + tình trạng yêu cầu thay đổi)〔Quyết định v2.3 #54〕 |
| Phạm vi hiển thị | Coi "doanh nghiệp/cơ sở" là 1 quyền | **Quản trị viên doanh nghiệp = toàn bộ cơ sở của công ty mình (lọc theo cơ sở) / nhân viên phụ trách cơ sở = chỉ các cơ sở được gán**〔Quyết định v2.3 #55〕 |
| Chi tiết giao hàng | Modal kết quả giao hàng | **Màn hình chi tiết giao hàng**: ngày dự kiến đến・khung giờ nhận・tình trạng・danh sách sản phẩm・tình hình giao hàng (5 bước・tồn kho và trưng bày theo sản phẩm・ảnh dành cho khách hàng)・số vận đơn và liên kết theo dõi. **Không hiển thị ngày picking・kho・công ty vận tải・trung chuyển・nhân viên**〔Quyết định v2.3 #56〕 |
| Lối vào yêu cầu thay đổi | Lối vào yêu cầu thay đổi của lịch | **"Yêu cầu đổi ngày giao" trong chi tiết giao hàng.** Phạm vi giữ như §8 (kế hoạch từ tháng sau・đến hạn chót). Tháng này・quá khứ・sau khi xác định thì không hiển thị nút mà hiển thị lý do〔Quyết định v2.3 #57〕 |
| Mô hình dữ liệu | — | 【Đề xuất】`role` của người dùng doanh nghiệp (`corp_admin`｜`site_staff`) và `corporate_user_sites` (gán nhân viên phụ trách cơ sở) |
| Các lần giao cần xác nhận | — | **Đề xuất ngày khác (cần trả lời) → các lần giao không đến・bị chậm → kết quả yêu cầu (14 ngày) → kế hoạch có thể yêu cầu (từ 3 tuần trước hạn chót)**. Đề xuất có "chấp nhận / từ chối" trong chi tiết〔Quyết định v2.3 #58〕 |
| Danh sách yêu cầu thay đổi của doanh nghiệp | — | Tab "Đổi ngày giao hàng" của menu trái "Yêu cầu". Tình trạng: đang yêu cầu / đề xuất ngày khác / phê duyệt / từ chối / rút lại (rút lại là【đề xuất】)〔Quyết định v2.3 #59〕 |
| Kết quả trong chi tiết giao hàng | Hiển thị 5 bước・tồn kho và trưng bày・ảnh dành cho khách hàng (#56) | **Không hiển thị**. Chỉ ngày giờ hoàn tất・người nhận・thu tiền・sản phẩm đã giao〔Quyết định v2.3 #60〕 |
| Design system | — | Huy hiệu của kế hoạch = info / huy hiệu của ô không xuống dòng, dùng dấu ngắn / tiêu đề "Chi tiết giao hàng" / thêm **NoticeList** vào ES Kitchen〔Quyết định v2.3 #61〕 |
| Cách hiển thị yêu cầu thay đổi | Màn hình chi tiết yêu cầu thay đổi (sau là tab "yêu cầu thay đổi") | **Trên chi tiết có "khung yêu cầu"**, xử lý (vận hành)・yêu cầu (doanh nghiệp) là **modal**〔Quyết định v2.3 #62〕 |

### 0-2J. Bổ sung 8 ngày 2026/09/29 (đổi ngày sau hạn chót đặt hàng)

Đã phản ánh bổ sung 8 ngày 2026/09/29 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Đổi_ngày_sau_hạn_chót_20260929.md`, #63). **Phiên bản vẫn là v2.3.** Toàn văn ở §19-11.

| Mục | Từ trước đến nay | **Bổ sung 8 ngày 2026/09/29** |
|---|---|---|
| Đổi ngày sau hạn chót | Không. Hủy + nhân bản〔Quyết định v2.2 #1〕 | **Đến ngày trước ngày xuất hàng, vận hành có thể đổi từng mục.** Ngày đổi sang là **cùng nửa đầu/nửa sau của cùng chu kỳ**. Bắt buộc có lý do. Đông lạnh và lạnh cùng ngày di chuyển cùng nhau |
| Lối vào | — | **"Sửa" trong chi tiết dữ liệu giao hàng.** Chỉ khi nhấn "Thay đổi" của ngày giao mới hiển thị lịch nhỏ 2 tuần của cùng nửa đầu/nửa sau để chọn (ngày không chọn được thì xám・vượt số lượng thì chữ đỏ) |
| Từ ngày xuất hàng trở đi | Hủy + nhân bản | Không đổi, vẫn là hủy + nhân bản. Thay đổi kho picking cũng không đổi, vẫn là hủy + nhân bản |

### 0-2K. Bổ sung 9 ngày 2026/09/29 (phản ánh nhận xét về thiết kế giao hàng)

Đã phản ánh bổ sung 9 ngày 2026/09/29 (`01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Phản_ánh_bình_luận_20260929.md`, #64〜#67). **Phiên bản vẫn là v2.3. Không thay đổi trạng thái・mô hình dữ liệu.** Toàn văn ở §19-12.

| Mục | Từ trước đến nay | **Bổ sung 9 ngày 2026/09/29** |
|---|---|---|
| Tab "Sự cố"・đăng ký hộ | Hiển thị bất kể trạng thái | **Không hiển thị ở kế hoạch・chờ xuất hàng** (hiển thị ở bản ghi con đang xác nhận)〔Quyết định v2.3 #64〕 |
| Giải quyết sự cố | Tất cả trong 1 modal | **2 giai đoạn**: ① chọn cách xử lý (với báo cáo chưa xác định loại thì loại là bắt buộc) → ② chỉ các ô cần thiết theo từng cách xử lý. Các mục bắt buộc của API cũng theo từng cách xử lý〔Quyết định v2.3 #65〕 |
| Thông báo của Web doanh nghiệp | Trang chủ chỉ có danh sách | **Chi tiết thông báo** (danh mục・ngày giờ đăng・tiêu đề・nội dung・đính kèm・quay lại danh sách). Chỉ các thông báo đang công khai và bản thân là đối tượng gửi〔Quyết định v2.3 #66〕 |
| Chỉ màn hình | — | Thêm cần xác nhận vào menu bên・bỏ chuyển đổi "chuẩn" của hiển thị tháng・thu gọn menu bên (tự động dưới 1280px)〔Quyết định v2.3 #67〕 |

### 0-2L. Trả lời bảng yêu cầu 2026/09/30 (phản ánh một phần của Phase2・phần chưa phản ánh)

Đã phản ánh những mục liên quan đến giao hàng trong các câu trả lời (`Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930.md`) của bảng yêu cầu ESS mới (Phase2). **Phiên bản vẫn là v2.3.** Nguồn chuẩn của mô hình dữ liệu là tài liệu DEV (§14.5・§14.6).

| Mục | Từ trước đến nay | **Trả lời bảng yêu cầu 2026/09/30** | Căn cứ |
|---|---|---|---|
| Master nơi giao ủy thác (3-3) | Khu vực hỗ trợ có 4 phân loại (Kanto/Chubu/Kansai/Kyushu). Không có phí・thứ hỗ trợ | **Khu vực hỗ trợ theo đơn vị tỉnh/thành phố**. Có **thứ hỗ trợ**・**bảng phí (khu vực × phí chi trả・phụ phí vùng. Nhập CSV)**・**số túi giữ lạnh・số chất giữ lạnh**. **Phụ phí vùng do vận hành nhập thủ công** (không tự động tính). **Không làm bản đồ toàn quốc・tìm kiếm theo tổ hợp thứ giao hàng** | 〔Bảng yêu cầu dòng 28・39・44・57・78〕 |
| Hỏi đáp giao hàng (3-3) | Không có đặc tả màn hình | **Ngay cả khi đang đàm phán thương mại cũng có thể tìm kiếm từ địa chỉ để biết nơi ủy thác・khu vực hỗ trợ・mức phụ phí vùng dự kiến**. Phụ phí vùng thanh toán dưới dạng **tùy chọn của hợp đồng con** (14-2) | 〔Bảng yêu cầu dòng 53〕 |
| Tìm kiếm điểm trung chuyển (3-1・3-2) | Tên kho・kana・mã văn phòng・tỉnh/thành | **Có thể tìm bằng quận/huyện・mã bưu điện, danh sách có cột địa chỉ**. **Không tự động xác định văn phòng gần nhất** | 〔Bảng yêu cầu dòng 29〕 |
| Báo giá ủy thác (12-6) | Có thể đáp ứng hay không・thứ giao hàng được・số tiền + chat | **Có thể báo giá / không đáp ứng được・phí hàng tháng・đính kèm・nhận xét・điểm trung chuyển**. Không có chat | 〔Bảng yêu cầu dòng 41・49〕 |
| Ứng dụng tài xế (12-2) | Không hiển thị điểm nhận・có chat | Điểm nhận hiển thị **tên văn phòng・địa chỉ・mã văn phòng・điện thoại của điểm trung chuyển**. Không có chat, khẩn cấp có nút gọi điện | 〔Bảng yêu cầu dòng 37・49〕 |
| Thông báo khi chưa đặt tài xế (10-5・12-1・15-9・17-1) | Chỉ cần xác nhận vào ngày trước ngày giao〔Quyết định v2.3 #43〕. 10-5 là thông báo "chưa phát hành vận đơn" | **3 ngày trước và ngày trước ngày giao**, hiển thị cần xác nhận của vận hành và Web công ty vận tải ủy thác, đồng thời **gửi email cho công ty vận tải ủy thác** | 〔Bảng yêu cầu dòng 142〕 |
| Thông báo hủy hợp đồng (8-7) | Không thông báo cho công ty vận tải ủy thác | **Hủy cơ sở có chuyến ES giao hàng: khi vận hành phê duyệt, thông báo bằng hiển thị + email cho công ty vận tải ủy thác phụ trách** | 〔Bảng yêu cầu dòng 26〕 |
| Tháng bắt đầu của đăng ký mới (8-7) | Chỉ thay đổi・nghỉ・hủy liên động với hạn chót đặt hàng | **Đăng ký mới cũng liên động với hạn chót đặt hàng** (đăng ký trước hạn chót thì bắt đầu từ tháng sau, sau hạn chót thì bắt đầu từ tháng sau nữa) | 〔Bảng yêu cầu dòng 159〕 |
| Thông báo cho doanh nghiệp về đổi ngày giao・ngày gửi (8-3・15-10) | Chưa quyết phương thức | **Hiển thị ngày giao mới nhất ở thông báo của trang chủ Web doanh nghiệp**. ~~Không gửi email~~ → 2026/10/01: **thay đổi sau hạn chót cũng gửi email** (0-2N) | 〔Bảng yêu cầu dòng 134〕 |
| Tổng hợp số lượng vật tư (10-9) | Không có | Ở danh sách dữ liệu giao hàng vật tư, **tổng hợp số lượng theo ngày gửi dự kiến, phân theo chuyến thực phẩm của cơ sở (chuyến COOL / chuyến ES giao hàng)** | 〔Bảng yêu cầu dòng 124〕 |
| Ảnh・ghi chú vận hành của báo cáo công việc (15-6・15-7) | Chưa có định nghĩa cách xem ảnh・ghi chú vận hành | Ảnh **xem bằng cách chuyển trái phải trong modal**. **Vận hành cũng có thể thêm ảnh**. Dữ liệu giao hàng có **ghi chú vận hành (`internal_memo`)** | 〔Bảng yêu cầu dòng 164〕 |
| Email khi chờ xuất hàng・đã xuất hàng (10-8) | Không gửi | ~~**Không thay đổi** (như đặc tả hiện hành)~~ → 2026/10/01: **gửi 1 email khi hoàn tất gửi hàng** (0-2N・10-8) | 〔Bảng yêu cầu dòng 127〕 |

### 0-2M. Các mô tả cũ đã sửa ở STEP4 của kiểm tra toàn bộ demo 2026/10/01

Với sự đồng ý của anh Long (2026/10/01), đã sửa các mô tả cũ còn sót trong tài liệu này dù đã có quyết định. **Phiên bản vẫn là v2.3.** Bản HTML (02_デモ/90_説明_統合仕様書_v2.3.html) chưa tạo lại. Tài liệu DEV (`delivery_lines.expiry_date`) chưa sửa.

| Mục | Từ trước đến nay | **2026/10/01** | Căn cứ |
|---|---|---|---|
| Hạn sử dụng (7-8・12-2・14・16) | Nhập hạn sử dụng ở STEP2, giữ `delivery_lines.expiry_date` | **Không theo dõi hạn. Không có ô nhập lẫn cột** | App_tài_xế_Điểm_sửa_đặc_tả_20260930 No.4 / 運営デモ×ドライバーアプリ改善案 A1 |
| Tồn kho lý thuyết khi kiểm kê (12-2) | Có thể xác nhận tồn kho lý thuyết khi kiểm kê | **Tồn kho lý thuyết chỉ ở STEP2 (xác nhận tồn kho・hủy khi giao hàng). Không hiển thị ở kiểm kê・bảng kiểm tra hàng tháng** | K-15 (trả lời 2026/09/30)・REQ-DL-151 |
| Mặc định của khung giờ giao (10-8) | Không ghi giá trị mặc định | **Mặc định là "buổi sáng"** | K-26 |
| Giới hạn ảnh (12-2) | Không ghi | **Tối thiểu 1 ảnh・tối đa 20 ảnh. Ảnh của báo cáo sự cố cũng như vậy** | K-30 (trả lời 2026/09/30)・REQ-DL-146 |

### 0-2N. Quyết định STEP4 của kiểm tra toàn bộ demo 2026/10/01 (anh Long đồng ý・theo đề xuất)

Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_STEP4_Trả_lời_Giao_hàng_20261001.md` §3. **Phiên bản vẫn là v2.3.** Bản HTML chưa tạo lại.

| Mục | Từ trước đến nay | **2026/10/01** | Mục đã phản ánh |
|---|---|---|---|
| Lead time (P10-1) | Tổng 1 giá trị là chuẩn・chặng là tham khảo (biên bản RD-DL-105・126 là theo từng chặng・mặc định 1 ngày) | **Giữ như đặc tả hiện tại (tổng 1 giá trị là chuẩn・không có mặc định)**. Giá trị theo từng chặng là "giá trị tham khảo có thể nhập" (dùng để tính ngày đến văn phòng Yamato) | 5-4 (không đổi) |
| Di chuyển ngày trước hạn chót (P10-2) | Ở màn hình lịch, di chuyển sang chu kỳ khác không lưu được | **Biên bản 2026/09/30 là chuẩn**: nơi chuyển đến là từ hôm nay trở đi, picking và giao hàng di chuyển cùng nhau theo lead time, không giới hạn số lượng, **di chuyển sang chu kỳ khác là cảnh báo (lưu được)**, nửa đầu nửa sau・tháng khác・ngày quá khứ là lỗi. Dù di chuyển, lần giao vẫn thuộc chu kỳ (hợp đồng con) ban đầu | Nội dung 15-8 sẽ sửa ở phiên bản sau |
| Giới hạn số lần giao (P10-4) | Tối đa 4 lần/chu kỳ | **Tối đa 8 lần/chu kỳ (2 lần/tuần × 4 tuần)**. Không thay đổi số lần tiêu chuẩn của master gói | 5-1 |
| Dời ngày ở ranh giới chu kỳ (P10-5) | Không có quy tắc | **Nếu A1・C1 bị dời sớm thì dời muộn, nếu D7 bị dời muộn thì dời sớm** (tự động đảo chiều để không vượt qua ranh giới nửa đầu nửa sau・chu kỳ, và thông báo là đảo chiều) | 6-3 |
| Đề xuất ủy thác (P10-6) | Tạm giữ (REQ-DL-132) | **Hủy** (theo hủy 2026/07/08・bảng yêu cầu dòng 28) | 12-6 |
| Thao tác sau báo cáo sự cố (P10-7) | Chưa định nghĩa (trạng thái "sự cố" đã bỏ) | Sau khi báo cáo, tài xế vẫn có thể tiếp tục nhập bước・hoàn tất. **Khi vận hành đăng ký cách giải quyết (resolution), tài xế không sửa được kết quả của lần giao đó** (ưu tiên hơn thời hạn sửa 7 ngày sau khi hoàn tất) | 13-2 |
| Nơi picking vật tư (P10-3) | Giao thẳng từ kho cho Yamato (v2.3 #36) | **Đang xác nhận với khách hàng** (biên bản RD-DL-207 là văn phòng ES) | — |
| Nhiệt độ (12-6) | Đăng ký ủy thác là "chọn nhiều đông lạnh/lạnh・nhiệt độ thường ngoài đối tượng" | **Thống nhất 3 giá trị (đông lạnh / lạnh・nhiệt độ thường / vật tư)** (giống 3-3・10-6) | 12-6 |
| Tên bước của chuyến ES giao hàng (12-2) | Ảnh trước khi trưng bày / xác nhận tồn kho・hủy / kiểm hàng / ảnh sau khi trưng bày / đăng ký thu tiền | **① trước trưng bày ② tồn kho/hủy ③ trưng bày (kiểm hàng) ④ sau trưng bày ⑤ đăng ký thu tiền** (theo ứng dụng tài xế・phương án cải thiện A4) | 12-2 |
| Email thay đổi xuất hàng・ngày giao (P11) | Không gửi (2026/09/30) | **Gửi 1 email khi hoàn tất gửi hàng, và gửi email khi đổi ngày sau hạn chót** (yêu cầu của khách hàng・bảng yêu cầu dòng 127・134. Khớp với ghi chú bổ sung của bảng) | 8-3・10-8 |
| Phần còn lại của nội dung đổi ngày sau hạn chót (K-29)・API Thomas (K-37) | Mô tả cũ còn sót | Đã khớp với quyết định v2.3 #63 / thêm 2B vào danh sách liên kết bên ngoài | 8-3・15-8・15-9・10-7 |

### 0-2O. Phản ánh câu trả lời cho xác nhận của khách hàng (STEP4) 2026/10/01 (anh Long trả lời)

Chi tiết xem `01_仕様/00_Quyết_định/Quyết_định_STEP4_Trả_lời_Giao_hàng_20261001.md` §5. **Phiên bản vẫn là v2.3.**

| Mục | **2026/10/01** | Mục |
| Dữ liệu ngày lễ (xác nhận vận hành D3-3) | **Lấy từ API ngày lễ công khai** (tự động 1 lần/năm + "lấy lại ngày lễ"). Vận hành có thể sửa. **Ghi đè** K-27 (đăng ký thủ công) | 3-5・4-4・10-7 |
| Chữ cái đầu của ID (D3-1) | "HU" miễn là không trùng với ID khác. **Master nhà cung cấp đang dùng HU và trùng với điểm trung chuyển, nên nhà cung cấp dùng chữ cái đầu khác (ví dụ SP)** (STEP6・7) | 3-1 |
| Mã kho của THOMAS (D3-2) | THOMAS không phải kho mà là hệ thống. **Mã kho không cố định, nên "mã kho (dùng liên kết THOMAS)" của master kho là mục vận hành nhập** (khác với ID kho của WH) | 3-1・10-1 |
| Tên chính thức (D3-4) | Tên chính thức của Yamato・Thomas vẫn chưa rõ. Màn hình tiến hành với cách ghi "Yamato Transport" và "THOMAS (hệ thống kho)" | — |
| Túi giữ lạnh (D3-5) | Vận hành không thu hồi. **Sổ cho mượn theo từng nơi ủy thác (B) + màn hình danh sách xuyên suốt・nhập CSV** (vì nhiều là nhà thầu cá nhân) | 3-3・12-5 |
| Số điện thoại hỏi đáp của Web doanh nghiệp (D3-6) | **Không hiển thị số điện thoại hỏi đáp trên Web doanh nghiệp**. Hướng dẫn khi không đổi được giao hàng là "vui lòng liên hệ vận hành" (đầu mối hỏi đáp tính riêng) | 15-10 |
| Tỷ lệ hủy (D1) | **Tỷ lệ hủy = số lượng hủy ÷ số lượng đặt hàng** | 7-8 |
| Cho thuê máy bán hàng tự động (C5) | ES Station không quản lý | — |
|---|---|---|
| Yêu cầu thay đổi và yêu cầu báo giá ủy thác (A1・dòng 27・RS-09) | Từ chi tiết yêu cầu của yêu cầu thay đổi chuyến ES giao hàng (số lần giao・thứ・địa chỉ・chuyến COOL ⇔ chuyến ES giao hàng), **có thể gửi yêu cầu báo giá cho công ty vận tải ủy thác (tùy chọn)**. Nơi yêu cầu do vận hành chọn từ các công ty được lọc theo khu vực・thứ hỗ trợ của master nơi giao ủy thác. **Không có báo giá vẫn phê duyệt được** | 8-x・12-6 |
| Cách xuất vật tư (A2) | **Picking tại văn phòng ES, giao thẳng cho Yamato**. Không gửi chỉ thị xuất hàng cho THOMAS. **Đăng ký văn phòng ES là kho picking dành cho vật tư trong master kho, và thêm mới "liên kết THOMAS (có / không)" cho kho**. Tình trạng giao hàng không phải API mà **mở URL trang hỏi đáp của công ty vận tải bằng số vận đơn để xác nhận**. Sau này có thể chuyển sang công ty vận tải ủy thác, chỉ cần đổi công ty vận tải của phân loại giao hàng "vật tư" của hợp đồng là tiếp nhận được | 3-1・10-9 |
| Nhập mua vật tư (STEP6 Q10・R5) | Đặt hàng vật tư **chỉ đặt chính thức・tùy thời** (không đặt tạm), **nơi giao là văn phòng ES (vật tư)** (WH00004・không liên kết THOMAS). Nhập kho do vận hành nhập bằng "đăng ký nhập kho" ở chi tiết dữ liệu đặt hàng (không dùng CSV nhập kho của THOMAS). REQ-PO-411 (bổ sung 2026/10/01) | Quyết_định_STEP6_Trả_lời_Đặt_hàng_Nhà_cung_cấp_20261001 |
| Trạng thái vật tư | Dùng trạng thái chung: **chờ xuất hàng** (xác nhận đơn) → kiểm tra bằng danh sách picking của văn phòng ES (dấu đã picking) → **đăng ký số vận đơn (nhập CSV hoặc thủ công) thành đã xuất hàng**. Yamato giao nên sau đó chuyển sang đã giao bằng coi như hoàn tất (REQ-DL-870) của chặng công ty vận tải | 7-7・10-9 |
| Phiếu giao hàng vật tư | **Không xuất** (RD-DL-216) | 7-8 |
| Ngày đến của vật tư | Giao vật tư trên Web doanh nghiệp **hiển thị hoàn tất gửi hàng và số vận đơn, không hiển thị ngày đến** (chỉ ngày dự kiến) (RD-DL-212) | 15-10 |
| Phí vật tư (A4) | **Bộ ban đầu miễn phí. Sau đó miễn phí đến 1 lần/tháng, từ lần đặt vật tư thứ 2 trở đi trong tháng tính phí** (thêm mới "phí đặt vật tư" đơn lẻ vào master tùy chọn・số tiền chưa quyết → STEP3) | 14-2 |
| Khung giờ giao (A7) | **Doanh nghiệp không chọn được** (vận hành đặt theo từng cơ sở・mặc định buổi sáng). Xuất ra CSV vận đơn của Yamato | 10-8 |
| Phát hiện văn phòng đã đóng (B1) | Không tự động phát hiện (không có phương tiện). Chỉ giữ danh sách có thể tra ngược các cơ sở đang dùng từ điểm trung chuyển (REQ-DL-209) | 3-1 |
| Tình trạng giao hàng của Yamato (B2) | Chỉ xác nhận bằng URL (trang hỏi đáp theo số vận đơn) | 10-7 |
| Bảng phân thứ giao hàng ủy thác (B3) | Không làm (hiện tại vận hành cũng không có). Thay bằng thứ hỗ trợ của master nơi giao ủy thác | 3-3 |
| Phụ phí vùng (B5) | Không giữ tiêu chuẩn tính toán. **Vận hành gán thủ công tùy chọn (phí giao hàng theo vùng)** | 14-2 |
| Giá trị đông lạnh・số lượng chứa tối đa・làn của máy bán hàng tự động (C1〜C3・C6) | **Vận hành nhập** vào các mục của master (giới hạn trên・dưới・số lần giao tiêu chuẩn đông lạnh của master gói, số lượng chứa tối đa của master dòng máy, thiết lập làn của máy bán hàng tự động). Không cần xác nhận với khách hàng | — |
| Giao hàng thiết bị (C4) | **Ngoài hệ thống**. Chỉ giữ ngày dự kiến lắp đặt・thu hồi・thay thế và ghi nhận cho mượn | — |
| Lead time của mẫu kinh doanh (D2) | Giữ làm **giá trị vận hành nhập** (theo từng kho) | Đặc tả mẫu |
| Phiếu giao hàng của doanh nghiệp (REQ-DL-316) | **Có thể xuất PDF (A4) từ chi tiết giao hàng của Web doanh nghiệp** (chờ xuất hàng・từ đã xuất hàng trở đi・phản ánh hàng thay thế・không xuất vật tư). REQ-DL-316 ghi giao hàng ủy thác (chuyến ES giao hàng) gói kèm tại kho nên Web doanh nghiệp không cần xuất. **Cũng xuất cho cơ sở chuyến ES giao hàng・chuyến COOL (anh Long trả lời 2026/10/01 O-2. Ghi đè "chuyến ES giao hàng không cần" của REQ-DL-316)**. Xuất theo tháng・cơ sở là quyết định STEP5 Q5 | 7-8・15-10 |

### 0-2P. Câu trả lời bổ sung tối 2026/10/01 STEP4 (anh Long)

| Mục | Quyết định | Nội dung |
|---|---|---|
| Phiếu giao hàng của doanh nghiệp (O-2) | **Cũng xuất cho cơ sở chuyến ES giao hàng** (chuyến COOL cũng giống. Không xuất vật tư) | 0-2O・15-10 |
| Phí giao hàng bổ sung vật tư (O-3) | **Tạm ¥1,000/lần (chưa thuế)**. Miễn phí 1 lần/tháng đã nằm trong phí, từ lần thứ 2 trở đi của chuyến vật tư trong cùng tháng chu kỳ gắn 1 OP000036 "giao hàng bổ sung vật tư (đơn lẻ・1 lần)" (giống STEP5 quyết định §2-2. Không dùng tên "phí đặt vật tư") | 7-5・10-9 |
| URL theo dõi (O-4) | Master công ty vận tải giữ **mẫu URL theo dõi**, vận hành có thể sửa | 3-3 |
| Email hoàn tất gửi hàng・đổi ngày (O-5・P11) | Đã đặt mẫu văn bản trong demo (tổng quan giao hàng của chi tiết giao hàng). Dòng 127・134 của bảng yêu cầu sửa thành "gửi" (quyết định file §9) | 10-8 |
| Màn hình hỏi đáp giao hàng | **2 tab**: ① tìm nơi ủy thác từ địa chỉ (hỏi đáp giao hàng của 3-3) ② tra cơ sở sử dụng từ điểm trung chuyển・số vận đơn・số lần giao (tra ngược của 3-2) | 3-2・3-3 |
| Tổng hợp vật tư | Màn hình hiển thị tổng vật tư theo ngày xuất hàng và nội dung theo từng lần giao, dùng cho picking của văn phòng ES (in・CSV vận đơn Yamato) | 10-9 |
| Ghi chú vận hành | Ghi chú nội bộ theo từng dữ liệu giao hàng (không hiển thị cho doanh nghiệp・nơi ủy thác・tài xế. Lưu trong lịch sử thay đổi) | 7-8 |
| Gửi mẫu kinh doanh (2026/10/01・anh Long) | **Không tạo thành dữ liệu giao hàng** (không trộn dữ liệu với giao hàng của hợp đồng). Xử lý bằng màn hình mẫu kinh doanh và CSV cho THOMAS, hệ thống không giữ theo dõi số vận đơn | Đặc tả mẫu 1-7 |
| Ví dụ chu kỳ | Đã sửa các ví dụ trong nội dung (A1 = 2026-08-31, v.v.) theo lịch của quản lý giao hàng (tháng 9 A1 = 9/07・tháng 10 A1 = 10/12) | 2-3・4-1・7-3・7-4・7-9 |

### 0-2Q. Tối 2026/10/01 khi thêm kho・công ty vận tải (anh Long)

| Mục | Nội dung | Nội dung |
|---|---|---|
| Công ty vận tải tuyến | **3 công ty Yamato Transport・Sagawa Express・Fukuyama Transporting**. Với các công ty vận tải khác, việc nhập vận đơn・kết quả xuất hàng sẽ **phát triển bổ sung**. Định dạng CSV của Sagawa・Fukuyama chưa quyết (chỉ định nghĩa Yamato) | 3-3・10-7 |
| Thay đổi tuyến giao hàng hàng loạt | **Quyết định (tối 2026/10/01)**: bằng lọc hoặc nhập CSV, chuyển hàng loạt kho・công ty vận tải・điểm trung chuyển từ chu kỳ bắt đầu áp dụng (có xem trước ảnh hưởng. Cùng dạng với điều chỉnh phí hàng loạt) | 5-10 |
| Thông báo thay thế nơi ủy thác | **Quyết định (tối 2026/10/01)**: gửi thông báo của cổng nơi giao ủy thác + email cho nơi ủy thác bị loại (kết thúc phụ trách)・nơi ủy thác mới (thêm phụ trách) | 5-10・8-7 |
| Chặng của tài xế | Có trường hợp nhận rồi không giao ngay, chở đến điểm trung chuyển, chặng 1・2 do tài xế khác nhau (như 11-3). **Màn hình hôm nay của ứng dụng tài xế tách thành "nhận (xuất hàng hôm nay・giao từ ngày mai trở đi)" và "giao (giao hôm nay)"** (Q-D = A). Lần giao chỉ nhận không mở ra, cũng không tính vào số lần giao hôm nay | 11-3・12-2 |
| Khu vực phụ trách của kho | **Không giữ** (Q-E = A・hủy quyết định T4-2). Kho của mẫu kinh doanh: nếu kho xử lý chỉ có 1 thì kho đó, nếu nhiều thì vận hành chọn | 3-1 |
| "URL xác nhận hỏi đáp" của tuyến giao hàng hợp đồng con | Lấy "mẫu URL theo dõi" của master công ty vận tải làm giá trị ban đầu, có thể ghi đè theo từng tuyến | 3-3 |

## 19. Quyết định (đợt 1〜đợt 4・bổ sung 2026/09/24・bổ sung 2026/09/29・bổ sung 4〜bổ sung 10)

Nội dung đã xác định từ 2026/09/21〜29. **Nếu mâu thuẫn, ưu tiên theo thứ tự: bổ sung 10 ngày 2026/09/29〜30 (§19-13) > bổ sung 9 ngày 2026/09/29 (§19-12) > bổ sung 8 ngày 2026/09/29 (§19-11) > bổ sung 7 ngày 2026/09/29 (§19-10) > bổ sung 6 ngày 2026/09/29 (§19-9) > bổ sung 5 ngày 2026/09/29 (§19-8) > bổ sung 4 ngày 2026/09/29 (§19-7) > bổ sung 2026/09/29 (§19-6) > bổ sung 2026/09/24 (§19-5) > đợt 4 (§19-4) > đợt 3 (§19-3) > đợt 2 (§19-2) > đợt 1 (§19-1)**. 2 tài liệu gốc (`Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` / `ピッキング出荷配送ドライバー_詳細要件仕様.md`) cũng đã được thống nhất theo cùng nội dung.

### 19-1. Quyết định đợt 1 (trả lời 84 mục cần xác nhận)

#### A. Quyết định liên quan đến cấu trúc

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 25 / 45 | Đơn vị lưu thiết lập tuyến giao hàng (kho・công ty vận tải・trung chuyển・lead time) | **Hợp đồng cha = giá trị mặc định, hợp đồng con = giá trị thực tế của tháng đó**. Snapshot từ cha khi tạo hợp đồng con. Kế hoạch 6 tháng sau tạo từ giá trị mặc định của hợp đồng cha | §5・§7・§16 |
| 29 | Loại chuyến (chuyến COOL / chuyến ES giao hàng) | **Là mục nhập do hợp đồng (hợp đồng con) giữ**. Không suy ra từ có trung chuyển hay không (REQ-DL-785 hủy) | §5・§11・§16 |
| 10 / 16 / 52 | Người giữ lead time và giá trị mặc định | **Master kho không giữ. Lead time theo từng phân loại giao hàng (lạnh / đông lạnh / vật tư) của hợp đồng**. Không tự động bổ sung giá trị mặc định. Xóa "giá trị mặc định lấy từ master kho" ở §3.1B・§12-1 | §3・§5・§6 |
| 4 | Giới hạn trên lead time hợp đồng | **0〜7 ngày** (§1.3 "0〜30 ngày" là sai) | §5・§16 |
| 54 / 78 / 81 / 38 | Quan hệ giữa vận đơn và dữ liệu giao hàng | **Xác định 1-nhiều. 1 dữ liệu giao hàng (xuất hàng) có nhiều số vận đơn (theo từng thùng). Không có trường hợp 1 vận đơn chứa nhiều dữ liệu giao hàng** (= không có gộp xuất hàng). "Nhiều-nhiều・bảng trung gian" ngày 2026/09/19 **bị hủy**. Sơ đồ ER trở lại `delivery_tracking_numbers` (1-nhiều) | §8・§10・§16 |
| 71 | Hạn thanh toán (hạn nhập tiền) | **Giữ làm mục** (phần trả trước / phần quyết toán thực tế). Tuy nhiên **thực vụ như đối chiếu nhập tiền do phía Bill One làm**. Rút lại "không giữ mục" của §4D-1 | §14・§16 |
| 70 | "③ Điều chỉnh" của thanh toán (hoàn tiền・bù trừ) | **Không làm thành bảng thứ 3 độc lập. Cho phép giữ điều chỉnh (hoàn tiền・bù trừ) bên trong ① trả trước・② quyết toán thực tế** | §14 |
| 60 | Gán tài xế chặng 1・2 của trung chuyển | **Cấu trúc cho phép gán theo đơn vị chặng (leg)**. ~~Vận hành hiện chỉ gán **chặng 2 (điểm trung chuyển → nơi giao)** (chặng 1 do công ty vận tải chở)~~ **(thay thế 2026/09/29: không gán chặng của công ty vận tải `parcel_carrier`, gán chặng tự công ty・ủy thác〔Quyết định v2.3 #48〕)** | §11・§12・§16 |
| 21 | Lead time khi có trung chuyển | **Tổng 1 giá trị là chuẩn**. Phần trung chuyển chỉ hiển thị làm giá trị tham khảo (không dùng để tính) | §5・§6 |
| 22 | Điều kiện nhận hàng của cơ sở | **Giữ khung giờ nhận hàng và điều kiện giao hàng làm mục**. Sao chép vào dữ liệu giao hàng để cho tài xế xem | §5・§12・§16 |

#### B. Quyết định liên quan đến chu kỳ・ngày

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 41 | Định nghĩa tháng chu kỳ | **Tháng có nhiều ngày hơn trong 28 ngày của ô A1〜D7**. Nếu A1 = 2026-08-31 thì trong 8/31〜9/27, tháng 9 có 27 ngày nên là **chu kỳ tháng 9/2026**. yyyymm của ID hợp đồng con (ID hợp đồng-yyyymm) cũng giống. **Chỉ đếm ngày của ô**, ngày nghỉ chu kỳ không tiêu hao ô nên không tính vào (dù kỳ nghỉ làm độ dài theo lịch kéo dài thì cách xác định tháng chu kỳ không đổi・xác nhận 2026/09/21). **Khi 14 vs 14 bằng nhau thì chọn tháng trước hay sau là chưa quyết** (tạm: tháng chứa ô thứ 14 B7 = tháng trước) | §2・§7 |
| 33 | Người giữ các mốc (công khai menu・bắt đầu đặt hàng・hạn chót đặt hàng) | **Phía menu là chuẩn. Sao chép ngày thực tế khi tạo chu kỳ và giữ**, hiển thị trên màn hình. Khi chưa đăng ký menu thì lấy ngày 15 tháng trước làm hạn chót tạm | §4・§7 |
| 40 | Ngày tạo hợp đồng con thanh toán tháng này | **Ngày bắt đầu đặt hàng** (cùng ngày với tạo xác định dữ liệu giao hàng). "Ngày trước ngày bắt đầu đặt hàng" hủy | §7 |
| 15 | Khi trúng ngày kho không xuất hàng được | **Dời cả ngày picking và ngày giao** (ngày không xuất hàng được cũng là đối tượng dời ngày giao). Hủy cách chỉnh lý "chỉ picking dừng" | §4・§6・§15 |
| 19 | Khi không tìm được ngày giao nào trong 20 ngày | **Hiển thị cần xác nhận là "không thể tạo kế hoạch"**. Không tự động quyết định ngày | §6 |
| 14 | Cảnh báo trước khi thời gian thiết lập sắp hết | **Chỉ hiển thị trong màn hình** (tháng cuối đã thiết lập và số tháng còn lại). Không làm thông báo dashboard | §4 |
| 24 | Mẫu giao hàng (plan_mode) | **Giao hàng theo yêu cầu (on_demand) chỉ cho vật tư**. Lạnh・đông lạnh vẫn 2 giá trị chu kỳ / đặc biệt | §5 |
| 27 | Văn bản hiển thị khi xảy ra dời ngày | **Danh sách ngắn gọn** ("dời sớm 2 ngày"), **chi tiết・tooltip đầy đủ** ("đang lệch 2 ngày so với B3 (2026-09-17) ban đầu") | §6・§15 |
| 23 | Hiển thị lý do khi ô xám | **Ô ngắn gọn** ("B1 Thứ Hai (không giao được)"), **chi tiết bằng tooltip** hiển thị ô không xuất hàng được・tên kho・lead time | §5・§15 |
| 20 | Tên gọi chu kỳ | **Thống nhất "chu kỳ giao hàng"**. Sửa "chu kỳ giao hàng (納品サイクル)" trong tài liệu đặc tả・đặc tả tổng hợp・demo (tên file `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` giữ nguyên) | Toàn chương |
| 31 | Tên mục điều kiện nhận hàng của cơ sở | **"Thứ không giao được" / "dời sớm・dời muộn"** (khớp cách nói của danh sách mục). Không dùng "thứ không nhận được", "hướng dời" | §5・§16 |

#### C. Quyết định liên quan đến picking・xuất hàng

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 50 | Danh sách picking | **Chỉ xác nhận ở màn hình quản lý. Không làm xuất PDF** (hủy "tự động tạo PDF" của REQ-DL-103) | §9 |
| 55 | Số vận đơn của chuyến công ty ủy thác đến kho lấy hàng | **ES đánh số vận đơn dựa trên ID dữ liệu giao hàng**. "ES không đánh số" không áp dụng cho chuyến lấy hàng | §10・§16 |
| 8 | Nhiệt độ hỗ trợ của master công ty vận tải | **3 giá trị: đông lạnh / lạnh・nhiệt độ thường / vật tư** (nhiệt độ thường cho vào cùng ô với lạnh). Cả 4 giá trị và 2 giá trị đều hủy | §3 |
| 26 | Nhập lý do "thay đổi chỉ 1 lần" | **Thay đổi tuyến giao hàng・chỉ định ngày riêng đều không bắt buộc lý do**. Luôn lưu trước → sau khi thay đổi và người thao tác vào lịch sử thay đổi | §8 |

#### D. Quyết định liên quan đến giao hàng・tài xế・thanh toán

| # | Vấn đề | Quyết định | Ảnh hưởng |
|---|---|---|---|
| 63 | Hình thức cung cấp ứng dụng tài xế V1.0 | **Web (trình duyệt) triển khai trước. Cân nhắc native hóa trong tương lai** | §12 |
| 66 | Báo cáo sự cố của ứng dụng và 6 phân loại master | **Màn hình ứng dụng giữ nguyên (đã xác định). Phía vận hành ánh xạ sang 6 phân loại master**. Đưa bảng đối chiếu vào đặc tả | §13 |
| 68 | Ghi nhận "thu hồi" khi giao nhầm | **Chỉ ghi trong báo cáo sự cố**. Không làm các mục riêng như ngày thu hồi・người thu hồi・số lượng thu hồi | §13 |
| 65 | Chuyển đổi tài xế hàng loạt | **Không cần (chuyển từng mục)**. Ghi rõ không làm ở giai đoạn 2 | §12 |
| 61 | Thời hạn có thể đưa đã giao về "đang xác nhận" | **Không đặt thời hạn (vận hành quyết định)**. Sau khi xác nhận thanh toán thì phản ánh vào tháng sau bằng "③ điều chỉnh". **(Bổ sung 2026/09/24 thay đổi tiền đề: đã giao không đưa về đang xác nhận mà mở sự cố và cần xác nhận〔Quyết định v2.3 #20〕. Việc không đặt thời hạn tiếp nhận liên hệ sau khi giao vẫn còn)** | §11・§14 |
| 69 | Khi dừng theo lý do của khách hàng sau hạn chót | **Không thanh toán (như hiện hành)**. Không tạo mục "phí hủy" | §14 |
| 69b | Sửa đơn giá | **Giữ theo sửa phí của master gói (các thế hệ ①〜④) và cũng ghi vào thanh toán** | §14 |
| 77 | Hiển thị "kế hoạch / xác định" của Web doanh nghiệp | **Dấu "kế hoạch" vẫn giữ ở Web doanh nghiệp** (hiển thị tháng của Web vận hành vẫn bỏ nhãn) | §15 |

#### E. Giá trị tạm (chờ vận hành xác nhận)

| # | Vấn đề | Tạm | Cần xác nhận |
|---|---|---|---|
| 5 | Ý nghĩa tiền tố `HU` của ID kho | **HU = Hub (điểm trung chuyển)**. Chỉ dùng cho ID nội bộ, không dùng ở vận đơn・liên kết CSV・biểu mẫu | Ý nghĩa chính xác ở hệ thống hiện có, và có được dùng ở liên kết bên ngoài không |
| 6 | Mã kho của kho picking (dùng liên kết Thomas) | **Dùng nguyên ID kho (dạng WH00001) làm mã liên kết** | Hệ thống mã của Thomas. Khi rõ sẽ thay thế |
| 9 | Nguồn dữ liệu ngày lễ | **Nhập thủ công 1 lần/năm dữ liệu công khai của Văn phòng Nội các và đăng ký vào master ngày lễ**. Không làm API bên ngoài・tự động nhập CSV. Vận hành có thể thêm・sửa | Thực chất của DB đã tham chiếu ở hệ thống hiện có |
| 58 | Tên gọi công ty vận tải・hệ thống kho | Thống nhất cách ghi **"Yamato Transport (viết tắt: Yamato)" "Thomas"** | Tên chính thức (quan hệ với Kuruvin Yamato, cách viết THOMAS) |
| 64 | Túi giữ lạnh・chất giữ lạnh của phần gửi qua Yamato | **Dùng một lần (không thu hồi)**. Chỉ ghi số | Thực tế có thu hồi không, có nhờ doanh nghiệp trả lại không |
| 67 | Số điện thoại hỏi đáp | Dành cho tài xế là **050-5784-2777**. Đầu mối báo lỗi thiết bị **050-3784-2771** ghi kèm là đầu mối riêng | Cái nào là chính thức hiện hành |

#### F. Cách sửa tài liệu (quyết định 2026/09/21)

- **Sửa toàn bộ kể cả tài liệu gốc.** Không chỉ đặc tả tổng hợp mà cả các mô tả cũ của `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` và `ピッキング出荷配送ドライバー_詳細要件仕様.md` cũng được viết lại sang giá trị mới.
- Phạm vi phản ánh **đến đặc tả tổng hợp + 2 tài liệu gốc**. 2 bản demo (`picking_schedule_setting_demo_ja.html` / `delivery_schedule_plan_demo_ja.html` + artifact) để lần sau.
- Ví dụ điển hình của mô tả cũ: ngưỡng số lượng 150→**300 đơn/ngày**, thời gian thiết lập 12 tháng→**cơ bản 6 tháng**, điểm khởi đầu của `locked` = ngày trước ngày picking→**xuất gộp 2 tuần (3 ngày trước ngày bắt đầu・thứ Sáu)**, tên cũ của trạng thái (đang chuẩn bị gửi / hoàn tất gửi…)→**hệ thống mới** (chờ xuất hàng / đã xuất hàng / đã nhận / đã giao / giao một phần / chờ giao lại / đang xác nhận / dừng / hủy), tạo cuốn chiếu→**không làm**, cách `pinned`→**cách override đã phê duyệt**, API Yamato→**giai đoạn 3**, A1 Chủ nhật→**Thứ Hai**.
- REQ-DL-804〜828 chưa đăng ký trong đặc tả yêu cầu. **Đăng ký vào đặc tả yêu cầu là đã phê duyệt.**

#### G. Những mục chưa quyết (để lại ở mục chưa quyết của §18)

- Công ty vận tải hiển thị kế hoạch ở trang riêng đến đâu (mấy tháng sau・mục nào) **→ giải quyết ở #34 của bổ sung 4 ngày 2026/09/29**
- Việc đổi ngày từng mục sau hạn chót đặt hàng có xử lý kịp khi số lượng nhiều hay không
- Xác nhận đặc tả hiện hành liên quan đến thanh toán・hợp đồng / màn hình chi tiết đơn đăng ký (2026/09/19 chỉ đến liên quan đến giao hàng)
- Cách vận hành khi muốn xuất hàng vào ngày bị dừng bởi điều chỉnh (thực tế không nghỉ)
- Chỉ thị xuất hàng của Thomas có I/F hủy hay không (tiến hành theo cách gửi lại, nhưng cần xác nhận với nhà cung cấp)
- Điều kiện tự động phán định thay đổi bao gồm sản phẩm có hạn tiêu thụ ngắn **→ giải quyết ở #35 của bổ sung 4 ngày 2026/09/29**
- **Khi tháng chu kỳ 14 vs 14 bằng nhau thì chọn tháng trước hay tháng sau** (tạm: tháng chứa ô thứ 14 B7 = tháng trước. Liên quan trực tiếp đến ID hợp đồng con)


### 19-2. Quyết định đợt 2 (v2.1)

#### Thứ tự xử lý (sửa theo thứ tự này)

1. Xác định chính sách đổi ngày và `locked` → 2. Xác định final leg và "coi như hoàn tất" → 3. Sửa bảng chuyển trạng thái →
4. Sửa mô hình dữ liệu và ràng buộc duy nhất → 5. Sửa điều kiện batch → 6. **Cuối cùng** thống nhất UI・quyền・thuật ngữ (demo 2 bản ở bước này)

---

#### 1. Đổi ngày sau hạn chót đặt hàng

> ⚠️ **Mục này đã bị hủy・thay thế bởi quyết định đợt 3 ngày 2026/09/22 (§19-3 #1).** Hiện hành là 2 giai đoạn "**trước hạn chót = từng mục hoặc hàng loạt đều được / sau hạn chót đặt hàng = không đổi ngày (hủy + nhân bản)**" (8-3). Dưới đây giữ lại làm bản ghi tại thời điểm quyết định đợt 2.

| Giai đoạn | Việc có thể làm |
|---|---|
| **Trước hạn chót** | Vận hành có thể đổi **từng mục hoặc hàng loạt** |
| ~~Sau hạn chót, trước `locked`~~ | ~~Chỉ vận hành đổi từng mục. Bắt buộc có lý do. Đối tượng giới hạn ở bản ghi cần xác nhận~~ **→ Hủy ở quyết định đợt 3 ngày 2026/09/22 (§19-3 #1). Sau hạn chót không đổi ngày mà hủy + nhân bản** |
| **Sau `locked`** | **Không đổi ngày.** Xử lý bằng hủy + nhân bản |

- 〔Ghi đè〕 #26 đợt 1 "chỉ định ngày riêng cũng không bắt buộc lý do" **chỉ áp dụng cho thay đổi thông thường trước hạn chót**. **Thay đổi ngoại lệ sau hạn chót quay lại bắt buộc có lý do**.
- 〔Ghi đè〕 Thêm điều kiện **"giới hạn ở bản ghi cần xác nhận"** vào "sau hạn chót chỉ vận hành đổi từng mục ở màn hình chi tiết".
- 3 chỗ: ①§8-4 ②bảng chế độ đổi ngày・bảng quyền ③điều kiện được phép thay đổi của `deliveries`.

#### 2. Vai trò kho

- **Xóa hoàn toàn `倉庫管理者` (quản lý kho).** Mọi thao tác của kho do **vận hành (logistics)** thực hiện.
- "Tab kho" của màn hình **chỉ là bộ lọc dữ liệu** (không phải đơn vị quyền).
- 3 chỗ: ①§9・§12 ②bảng quyền ③định nghĩa vai trò.

#### 3. Điểm khởi đầu của `locked`

- **Chỉ có 1 trigger: thời điểm chỉ thị xuất hàng được gửi thành công lần đầu.**
- **Có số vận đơn cũng không `locked`.**
- Nếu số vận đơn xuất hiện trước chỉ thị xuất hàng thì **phát hiện・thông báo là anomaly (bất thường)**.
- 〔Ghi đè〕 "Điểm khởi đầu của `locked` = thời điểm xuất gộp 2 tuần vào 3 ngày trước ngày bắt đầu (thứ Sáu)" của đợt 1 được sửa thành dạng **điểm khởi đầu là "gửi thành công" chứ không phải "xuất ra"** (xuất gộp 2 tuần vẫn còn là chuyện "khi nào gửi").
- 3 chỗ: ①§8-2・§10-1 ②chuyển trạng thái・điều kiện batch ③`deliveries.locked_at` và nhật ký chỉ thị xuất hàng.

#### 4. Coi như hoàn tất và thiếu hàng (xét theo final leg)

| Người vận chuyển của final leg (chặng cuối) | Cách xử lý hoàn tất | Cách xử lý thiếu hàng |
|---|---|---|
| **Ứng dụng tài xế ES** | **Không coi như hoàn tất** | Sáng hôm sau vẫn chưa hoàn tất thì **vào missing queue (cần xác nhận)** |
| **Công ty vận tải giao trực tiếp** | **Coi như hoàn tất** | Chỉ khi có liên hệ bất thường từ khách hàng・công ty vận tải thì chuyển sang **đang xác nhận** **(thay đổi bổ sung 2026/09/24: không đổi trạng thái, mở báo cáo sự cố và cần xác nhận〔Quyết định v2.3 #20〕)** |

- 〔Ghi đè〕 Bỏ cách phán định dựa trên loại chuyến "chuyến ủy thác xác định hoàn tất giao hàng bằng coi như", chuyển sang **phán định theo final leg**.
- 3 chỗ: ①§11-2・§11-5 ②chuyển trạng thái・batch phát hiện thiếu hàng ③cờ chặng cuối của `delivery_legs`.

#### 5. Nhân bản từ draft

- **Không nhân bản dữ liệu giao hàng từ draft.** Ở draft chỉ có thể **"sao chép/thay đổi kế hoạch"**.
- `parent_delivery_id`・số nhánh・**nhân bản kèm trạng thái đang xác nhận chỉ từ `published` hoặc `locked`**.
- 〔Ghi đè〕 "Nhân bản thực hiện được từ bất kỳ `draft` / `published` / `locked`" của đợt 1 **bị hủy**.
- 3 chỗ: ①§8-3 ②bảng chuyển trạng thái ③ràng buộc của `parent_delivery_id`.

#### 6. Khóa duy nhất của kế hoạch (plan)

- Lấy **`contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`** làm khóa.
- **Không dùng `(contract_id, delivery_date)`.** Vì 1 hợp đồng có thể có nhiều nhiệt độ・phân loại giao hàng trong cùng 1 ngày.
- 〔Ghi đè〕 "Kế hoạch giao hàng duy nhất theo (ID hợp đồng, ngày giao)" của REQ-DL-721 **bị hủy**.
- 3 chỗ: ①§7-2 ②điều kiện tạo lại (thay thế) ③ràng buộc duy nhất của `shipping_plans`.

#### 7. 3 trục của chuyến

- **Thêm `delivery_regime`**: `self` (tự công ty) / `partner_driver` (tài xế ủy thác) / `parcel_carrier` (công ty vận tải).
- **`service_form` (loại chuyến = chuyến COOL / chuyến ES giao hàng) đặt ở phân loại giao hàng (delivery channel). Không đặt ở tuyến của hợp đồng.**
- **`relay` (trung chuyển) suy ra từ route legs. Không lưu thành trạng thái.**
- 〔Ghi đè〕 #29 đợt 1 "loại chuyến là mục nhập do hợp đồng (hợp đồng con) giữ" được sửa thành dạng **giới hạn nơi giữ là "phân loại giao hàng"**. Việc không suy ra từ có trung chuyển hay không thì không đổi.
- 3 chỗ: ①§5-3・§11-1 ②phân nhánh theo loại chuyến ③cột của `delivery_channels`・`delivery_legs`.

#### 8. Khi có nhiều khung giờ nhận hàng

- Tạo bảng con **`site_receive_windows(site_id, from_time, to_time, sort_order)`**.
- Khi tạo dữ liệu giao hàng thì **snapshot nguyên danh sách** (`delivery_receive_windows`).
- **Không giữ dạng chỉ 1 cặp from/to.**
- 〔Ghi đè〕 Cụ thể hóa #22 đợt 1 "giữ khung giờ nhận hàng làm mục" thành **cách dùng bảng con**.
- 3 chỗ: ①§5-5・§12-2 ②thời điểm snapshot ③2 bảng.

#### 9. Hạn chót tạm (provisional deadline)

- Khi `marker_source = provisional`, việc có thể làm chỉ là **hạn chót tiếp nhận thay đổi và khởi động kiểm tra**.
- **Xác nhận số lượng・gửi email xác nhận・chỉ thị xuất hàng không chạy cho đến khi hạn chót thật đến từ menu.**
- 〔Ghi đè〕 Thêm giới hạn **phạm vi được làm với hạn chót tạm** vào #33 đợt 1 "nếu chưa đăng ký menu thì lấy ngày 15 tháng trước làm hạn chót tạm".
- 3 chỗ: ①§4-3・§7-4 ②điều kiện kích hoạt batch ③`delivery_cycles.marker_source`.

#### 10. Hạn thanh toán (hạn nhập tiền)

- **Tách hóa đơn theo `billing_type` hoặc `payment_due_date`.**
- **1 hóa đơn chỉ có 1 hạn thanh toán.** Nếu trả trước và quyết toán thực tế có hạn khác nhau thì làm **2 hóa đơn**.
- Chọn 1 hạn chung thì **khó đối chiếu (đối soát) nên không chọn**.
- 〔Ghi đè〕 Cụ thể hóa #71 đợt 1 "giữ hạn nhập tiền làm mục (phần trả trước / phần quyết toán thực tế)" thành dạng **tách hóa đơn**.
- 3 chỗ: ①§14-4 ②batch thanh toán ③khóa tách của `invoices`.

#### 11. Khi tháng chu kỳ là 14 vs 14

- Định nghĩa **tháng chu kỳ = tháng chứa ô thứ 14 (`B7`)**.
- Quy tắc này cho **cùng kết quả** với "tháng có nhiều ngày hơn", và khi 14 vs 14 thì **tự động là tháng trước**.
- **Không tạo nhánh ngoại lệ.**
- 〔Ghi đè〕 "Khi bằng nhau thì chưa quyết・tạm" của #41 đợt 1 **đã giải quyết**. Loại khỏi mục chưa quyết của §18.
- 3 chỗ: ①§2-3 ②đánh số hợp đồng con ③suy ra `delivery_cycles.cycle_month`.

---

#### Các mục cần sửa kèm theo

| # | Nội dung | 3 chỗ |
|---|---|---|
| S1 | **`shipping_plans` giữ nội bộ `estimated_qty`.** Tuy nhiên **ở draft không cho doanh nghiệp thấy số lượng**. Schema giữ số lượng dự kiến thì không viết "kế hoạch không giữ số lượng" | ①§7-1・Hình 1・Hình 4 ②điều kiện hiển thị của draft ③`shipping_plans.estimated_qty` |
| S2 | **Khi hợp đồng con đã được tạo trước như thanh toán trả trước 1 năm, kế hoạch dùng snapshot của tuyến hợp đồng con.** Chỉ dùng cha **khi chưa có con** | ①§5-2・§7-6 ②batch tạo kế hoạch ③phán định nguồn snapshot |
| S3 | **Đặt tiêu đề・phiên bản của tài liệu là v2.1** | — |
| S4 | **Đổi tiêu đề §11-2 từ "chuyến ủy thác" thành "khi công ty vận tải giao trực tiếp chặng cuối"** | ①§11-2 |
| S5 | **Tách 2 máy trạng thái.** `plan lifecycle` = `draft / published / locked`, `delivery status` = `chờ xuất hàng / … / đã giao`. **Không gọi chung cả hai là "trạng thái"** | ①thuật ngữ ②chia bảng chuyển trạng thái làm 2 ③`shipping_plans.lifecycle` và `deliveries.status` |


---

### 19-3. Quyết định đợt 3 (v2.2・2026/09/22)

Nguồn: `01_仕様/00_Quyết_định/Quyết_định_v2.2_20260922.md`. **Nếu mâu thuẫn với đợt 2 thì mục này được ưu tiên.** Các mục chưa quyết No.2・4・20・21・22 của §18 đã được giải quyết bởi mục này.

| # | Quyết định | Mục bị ghi đè | Mục tương ứng của tài liệu |
|---|---|---|---|
| **1** | **Thống nhất không đổi ngày sau hạn chót đặt hàng.** Trước hạn chót vận hành đổi được từng mục hoặc hàng loạt, sau hạn chót là **hủy + nhân bản**. Mốc phân chia là **duy nhất hạn chót đặt hàng**, `locked` là mốc của chỉ thị xuất hàng chứ không phải mốc đổi ngày | **Hủy** "sau hạn chót・trước `locked` chỉ vận hành đổi từng mục・bắt buộc có lý do・giới hạn ở bản ghi cần xác nhận" của quyết định v2.1 #1 | 8-3／15-9／15-12／16-5／17-2／17-3 |
| **2** | **Không tự động chèn ngày điều chỉnh (`adjust`).** Số ngày dừng mỗi lần nghỉ chu kỳ phải là **bội số của 7**, phần thiếu `7 −(số ngày dừng mod 7)` **hệ thống chỉ tính và hiển thị**. **Quản trị viên quyết định vị trí đặt**, sau đó có thể sửa. Ở trạng thái chưa đủ bội số của 7 thì **không lưu được**. Giữ `adjust_for_pause_id` để biết bù cho kỳ nghỉ nào | **Hủy** "tự động chèn điều chỉnh ngay sau kỳ nghỉ" ngày 2026/09/19 | 4-5 Quy tắc 4／16-1 |
| **3** | **Sau chỉ thị xuất hàng cũng đổi được.** Công ty vận tải ②・nhân viên giao hàng = đổi nguyên và gửi lại bằng `ship_order_diff` / **địa chỉ nơi giao** = phát hành chỉ thị xuất hàng `rev` mới, `voided` vận đơn hiện có rồi phát hành lại / **kho picking** = không đổi mà hủy + nhân bản / **ngày giao** = không đổi (#1) | Giải quyết mục chưa quyết §18 No.20 | 15-13 (thêm mới)／10-3／10-5／16-5 |
| **4** | **Hạn gửi lại chỉ thị xuất hàng là đến khi nhận được kết quả xuất hàng của lần giao đó.** **Hệ thống không giữ giờ bắt đầu picking của kho**. Chốt thanh toán theo mặc định là **tháng dương lịch của ngày giao thực tế** | Giải quyết mục chưa quyết §18 No.22 | 10-3／17-1 |
| **5** | **Gán trùng cùng Slot theo hiện hành.** Cùng hợp đồng, nếu 2 lần giao trúng cùng ô thì **hiển thị thẻ cảnh báo và vẫn lưu được** | **Không chọn** đề xuất "cùng Slot + cùng phân loại giao hàng là lỗi" của §18 No.21 | 5-6／16-2 |
| **6** | **Huy hiệu số lượng "yêu cầu thay đổi (chưa xử lý)" chỉ đếm các yêu cầu chưa xử lý đã đến hạn.** Tổng số xem ở màn hình danh sách. Vì là chuyện liên quan đến màn hình nên không đưa vào đặc tả DEV | Giải quyết mục chưa quyết §18 No.21 | 15-1 |

**Những mục chưa quyết (tại thời điểm đợt 3)**

| # | Nội dung | Trạng thái |
|---|---|---|
| §18 No.1 | Công ty vận tải hiển thị kế hoạch ở trang riêng đến đâu | **Đã xác định・có màn hình. Đang chờ cung cấp tài liệu.** Khi tài liệu đến sẽ đóng đồng thời cần xác nhận #1・#36・#40・#48 và §18 No.1. **→ Đã đóng ở #34・#51 của bổ sung 4 ngày 2026/09/29** |
### 19-4. Quyết định lần 4 (v2.3・2026/09/23) — Mô hình dữ liệu

Nguồn: `01_仕様/00_Quyết_định/Quyết_định_v2.3_20260923.md`. **Nếu mâu thuẫn với lần 3 thì ưu tiên văn bản này.** Các mục chưa quyết No.17・18 ở §18 đã được giải quyết bằng quyết định này. **Bản thân quy tắc nghiệp vụ không thay đổi.**

| # | Quyết định | Nội dung bị ghi đè | Mục tương ứng trong tài liệu này |
|---|---|---|---|
| **0** | **Nguồn chuẩn duy nhất cho bảng・cột・ràng buộc là `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` §14.** §16 của tài liệu này và §7 của bản gốc chỉ ghi tên bảng và vai trò, không ghi danh sách cột. `menus` / `order_quantities` / `plan_rates` / `corporations` / `sites` cũng chỉ có ở phía DEV | Hủy cách vận hành ghi cùng một ER ở 2 nơi | §0-3／§16 phần đầu |
| **1** | **Tuyến giao hàng gồm 3 bảng**: `contract_routes` (hợp đồng cha)／`contract_month_routes` (snapshot của hợp đồng con)／`delivery_legs` (1 lượt giao hàng). **Chỉ `delivery_legs` mới có `driver_id` / `assigned_by` / `assigned_at`**. Khi materialize, `delivery_legs` sao chép từ `contract_month_routes` nếu có hợp đồng con, nếu không có thì sao chép từ `contract_routes`, và lưu nguồn vào `snapshot_source`. Sau khi sao chép thì bất biến | **Bỏ `delivery_routes` (dùng chung 1 bảng)** | §16-3／§12-1 |
| **2** | **Bỏ `route_override`.** Việc đổi tuyến "chỉ cho lần giao này" được thực hiện bằng cách UPDATE trực tiếp `delivery_legs` ＋ nhật ký kiểm toán (`before_json` / `after_json`). Giá trị lead time riêng lẻ do `deliveries` giữ | Hủy `route_override` ở §15-6 và §4A-4D của bản gốc | §15-6／§15-13／§16-5 |
| **3** | **Bỏ `carrier1_id` / `relay_warehouse_id` / `carrier2_id` khỏi `contract_delivery_channels` và `contract_month_delivery_channels`.** Đơn vị vận chuyển và điểm trung chuyển chỉ do phía leg giữ | Hủy các cột mâu thuẫn với "Linh hoạt hóa tuyến giao hàng" ngày 2026/09/04 | §5-3／§16-2 |
| **4** | **Bỏ `shipping_plans.route_id`.** Kế hoạch chỉ giữ `route_snapshot_source` | — | §7-2／§16-2 |
| **5** | Tên bảng của đơn yêu cầu thay đổi là **`change_requests`** | Đổi tên từ `delivery_change_requests` | §16-2 |
| **6** | **"Cần xác nhận" trở thành bảng thật `review_items`.** `UNIQUE(kind, target_type, target_id) WHERE status = 'open'`, batch chỉ UPSERT, có thể **đóng** bằng thao tác của vận hành | Giải quyết tình trạng chỉ có tên gọi mà không có bảng vật lý | §15-9／§17-1／§16-2 |
| **7** | **`deliveries.branch_id` → `deliveries.site_id`** | Thống nhất cách gọi tên | §16-5／§16-7 |
| **8** | **Thêm mới chi tiết thực tích `delivery_lines`** (`UNIQUE(delivery_id, product_id)`) ＋ **`deliveries.order_id`**. Khi giao từng phần, bản ghi con được nhân bản có chi tiết riêng của mình | Giải quyết mục chưa quyết No.17 ở §18 | §16-5 |
| **9** | Ghi rõ giá trị mặc định (ngưỡng số lượng **300 đơn／ngày**・lead time chỉ thị xuất hàng **3 ngày**) vào DEV §3 | — | DEV §3 |

**Số hiệu yêu cầu**: REQ-DL-894〜903 (đặc tả yêu cầu §8O).

### 19-5. Bổ sung ngày 2026/09/24 (bản ghi con tự động của sự cố)

Nguồn: `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Trouble_con_tự_động_20260924.md` (#20〜#26). **Phiên bản vẫn là v2.3.** Bản chính là `Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` (§9.4・§10.2・§12.1・§12.2・§13.2.1・§13.3・§13.4・§14.6・§14.7・§14.11・§15.11・§15.12・§16.8.1・§16.9・§16.10・§16.13・§17.1・§18); nếu có sai khác thì DEV là chuẩn. **Nếu mâu thuẫn với lần 4 thì ưu tiên văn bản này.** Người xử lý sự cố là **vận hành (logistics)**. Không thêm mục chưa quyết mới vào §18.

| # | Quyết định | Nội dung bị ghi đè | Mục tương ứng trong tài liệu này |
|---|---|---|---|
| **20** | **Báo cáo sự cố không làm thay đổi trạng thái của bản ghi cha.** Giữ nguyên Đã xuất hàng／Đã nhận; liên hệ sau khi giao (khiếu nại) vẫn giữ Đã giao. Ghi lại báo cáo sự cố và mở "cần xác nhận". **`Đang xác nhận` trong luồng sự cố chỉ dùng cho bản ghi con chưa xuất hàng (`shipped_date IS NULL`)・ứng viên phục hồi** | **Bỏ** "Đã xuất hàng／Đã nhận → Đang xác nhận (báo cáo sự cố)" và "Đã giao → Đang xác nhận (liên hệ sau khi giao)" | §1-2／§1-4／§2-1／§7-7／§8-4／§11-2／§11-4／§11-7／§13-1／§13-2／§13-7／§14-3／§16-3／§16-5／§17-3 |
| **21** | **Vận hành (logistics) xử lý trực tiếp bản ghi cha.** Giao đủ toàn bộ＝Đã giao (bản ghi con tự động bị hủy)／giao một phần＝Đã giao một phần (tái sử dụng bản ghi con tự động làm `remainder`・số lượng còn lại)／giao lại toàn bộ＝Chờ giao lại (`redelivery`・tái sử dụng cho toàn bộ số lượng)／quay lại trong ngày＝Đã nhận (hủy)／không giao＝Dừng (hủy). Điểm xuất phát là Đã xuất hàng・Đã nhận (giao đủ toàn bộ cũng có thể từ Đã giao). Dù có bản ghi con tự động cũng không tạo bản thứ 2. Nhân bản thủ công cũng tái sử dụng bản ghi con của sự cố đó, bản thứ 2 bị `DOMAIN_TROUBLE_CHILD_EXISTS`. Nếu chưa có bản ghi con tự động thì tạo bản ghi con bằng nhân bản như trước | **Bỏ** "Đang xác nhận → Đã giao／Đã giao một phần／Chờ giao lại／Dừng／Đã nhận" | §7-7／§8-4／§13-2〜13-5 |
| **22** | ~~**Sự cố chưa được giải quyết đến hạn thì tạo bản ghi con tự động.**~~ **→ Ngày 2026/09/29 #30 thay thế (tạo cùng lúc với báo cáo・theo từng loại).** `auto_duplicate_due_at = reported_at + trouble_auto_duplicate_after_minutes` (số phút là bắt buộc trong cài đặt vận hành・không hard-code・UTC). Điều kiện: báo cáo sự cố chính thức／bản ghi cha là Đã xuất hàng・Đã nhận・Đã giao／chưa giải quyết／quá hạn／chưa có bản ghi con (chỉ "chưa hoàn tất" thì không tạo). Bản ghi con là `Đang xác nhận`・`duplicate_type=trouble_pending`・`creation_source=trouble_timeout`・cả hai cờ xác định đều false. Quy tắc sao chép giống nhân bản・cha con 1 cấp・số nhánh 1〜9. Ngày ứng viên là giá trị tạm để hiển thị, số lượng là lượng tối đa có thể phải gửi lại (tạm). **Mỗi báo cáo sự cố có tối đa 1 bản ghi con** (UPSERT／idempotent theo `source_trouble_report_id`). Cần xác nhận `trouble_auto_child_pending` (đối tượng là bản ghi con) | — (mới) | §2-1／§7-7／§11-7／§13-2／§15-2／§15-9／§16-2／§16-5 |
| **23** | **Bản ghi con tự động trước khi xác định không tham gia vào bất cứ thứ gì.** Nằm ngoài đối tượng của chỉ thị xuất hàng・phiếu vận chuyển・phân công tài xế・thanh toán・thông báo・coi như hoàn tất. Thêm vào điều kiện chỉ thị xuất hàng "`schedule_confirmed=true` và `quantity_confirmed=true`" và "không phải `trouble_pending` chưa giải quyết" | — | §10-1／§11-5／§12-1／§14-2 |
| **24** | **Chỉ khi vận hành (logistics) giải quyết sự cố của bản ghi cha, xác định số lượng・ngày giao và đặt cả hai cờ thành true thì mới chuyển bản ghi con tự động sang `Chờ xuất hàng`** (chưa xác định thì `DOMAIN_TROUBLE_CHILD_UNCONFIRMED`). Với cách giải quyết không cần gửi lại, trong cùng transaction chuyển bản ghi con tự động `Đang xác nhận → Hủy` (bắt buộc có lý do). Cần xác nhận `trouble_auto_child_pending` cũng được đóng trong cùng transaction | Thêm điều kiện cho "xác định ngày thì chuyển sang chờ xuất hàng" của bản ghi con | §7-7／§8-4／§13-2／§13-3 |
| **25** | ~~**Thêm mới batch `trouble_auto_duplicate`**~~ **→ Ngày 2026/09/29 #30 bãi bỏ (điều kiện coi như hoàn tất・phát hiện thiếu giao hàng giữ nguyên).** (Độc lập với chuỗi job chính. Cùng ngày giờ nghiệp vụ thì chạy trước `delivery_presume_complete`／`delivery_detect_missing`). `delivery_presume_complete`＝`status = Đã xuất hàng` và không có báo cáo sự cố chưa giải quyết (final leg là `parcel_carrier`)／`delivery_detect_missing`＝`status IN (Đã xuất hàng, Đã nhận)` và không có báo cáo sự cố chưa giải quyết (final leg là `self`／`partner_driver`) | Thêm điều kiện vào đối tượng của coi như hoàn tất・phát hiện thiếu giao hàng | §7-7／§11-2／§11-4／§11-5／§17-1 |
| **26** | **Mô hình dữ liệu** (chi tiết ở DEV §14): `deliveries.duplicate_type` (remainder｜redelivery｜alternative｜trouble_pending)／`creation_source` (materialize｜ops_duplicate｜trouble_timeout)／`source_trouble_report_id` (`UNIQUE WHERE NOT NULL`)／`schedule_confirmed`／`quantity_confirmed`, `trouble_reports.auto_duplicate_due_at`, `review_items.kind = trouble_auto_child_pending`, mã lỗi `DOMAIN_TROUBLE_CHILD_EXISTS`／`DOMAIN_TROUBLE_CHILD_UNCONFIRMED`. Việc tạo xác định thông thường là `creation_source=materialize`・`schedule_confirmed=true`・`quantity_confirmed` là true khi số lượng được xác định. Transaction: tạo bản ghi con tự động＝báo cáo sự cố＋khóa bản ghi cha＋bản ghi con＋cần xác nhận＋kiểm toán／giải quyết sự cố có bản ghi con tự động＝giải quyết bản ghi cha＋cập nhật・hủy bản ghi con＋giải quyết cần xác nhận＋kiểm toán | — | §16-2／§16-5／§17-1 |

---

### 19-6. Bổ sung ngày 2026/09/29 (xem lại xử lý sự cố)

Nguồn: `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Rà_soát_trouble_20260929.md` (#27〜#33). **Phiên bản vẫn là v2.3.** Bản chính là đặc tả DEV (§9.4・§12.1・§12.2・§13.2〜13.3・§14.6・§14.7・§14.11・§15.11・§15.12・§15.12.1・§16.8.1・§16.13・§17.1・§18); nếu có sai khác thì DEV là chuẩn. **Nếu mâu thuẫn với bổ sung ngày 9/24 thì ưu tiên văn bản này.** Nguyên nhân khởi đầu là C-1〜C-4 của `Thiết_kế_giao_hàng_Kiểm_tra_sót_tập_trung_trouble_v1.md`.

| # | Quyết định | Nội dung bị ghi đè | Mục tương ứng trong tài liệu này |
|---|---|---|---|
| **27** | **Sau khi coi như hoàn tất lại có "hàng chưa đến".** Nhờ Yamato điều tra, nếu xác nhận mất・chưa giao được, thì **chỉ với Đã giao có `completion_source = presumed`** mới có thể chuyển sang Chờ giao lại (tạo bản ghi con／tái sử dụng bản ghi con tự động)・Dừng. Không thanh toán. Khoản thanh toán đã xác định thì điều chỉnh vào tháng sau. `reported`・`customer` không thuộc đối tượng. Trường hợp chỉ một phần của thùng hàng chưa đến là chưa quyết (§18 No.23) | Thêm ngoại lệ vào #21 "từ Đã giao chỉ có giao đủ toàn bộ" | §7-7／§11-2／§11-7／§13-2 |
| **28** | **Lại xảy ra sự cố ở bản ghi con.** Không nhân bản từ bản ghi con mà tạo **nhánh kế tiếp của bản ghi cha** (nội dung sao chép từ bản ghi con xảy ra sự cố). Bản ghi con tự động cũng như vậy. Nếu quá nhánh 9 thì `DOMAIN_BRANCH_LIMIT`＋cần xác nhận | — (mới) | §7-7／§8-4／§13-2／§16-5 |
| **29** | **Nhiều báo cáo sự cố được giải quyết gộp theo đơn vị lần giao hàng.** Bản ghi con tự động là **1 bản ghi còn hiệu lực cho mỗi lần giao hàng xảy ra sự cố** (`source_trouble_delivery_id`) | #22 "Mỗi báo cáo sự cố có 1 bản ghi con (`UNIQUE(source_trouble_report_id)`)" | §7-7／§8-4／§13-2／§13-5／§16-5 |
| **30** | **Bản ghi con tự động được tạo cùng lúc với báo cáo, tạo hay không tạo theo từng loại.** Giao nhầm・vắng mặt・hư hỏng＝tạo／sai lệch số lượng・chậm trễ・khác＝không tạo. Loại chưa xác định ("thiếu hàng・giao nhầm") không tạo, đến khi vận hành gán loại thì mới xét. **Bãi bỏ thời hạn (`auto_duplicate_due_at`)・số phút trong cài đặt vận hành・batch `trouble_auto_duplicate`.** Loại không tạo vẫn còn trong cần xác nhận `trouble_open` | #22・#25 | §2-1／§7-7／§11-4／§11-5／§11-7／§13-1／§13-2／§15-9／§17-1 |
| **31** | **Thêm "giao một phần (phần còn lại không gửi)" vào cách giải quyết.** Đã giao một phần・không có bản ghi con・bản ghi con tự động bị hủy・không có ngưỡng (vận hành quyết định)・bắt buộc có lý do・phần chưa giao không thanh toán | #21 "giao một phần thì tạo bản ghi con" | §7-7／§13-1／§13-2 |
| **32** | **Tự động giải quyết sự cố chậm trễ.** Khi lần giao hàng mà báo cáo chưa giải quyết chỉ là chậm trễ nhận được báo cáo giao đủ toàn bộ, hệ thống giải quyết bằng "giao đủ toàn bộ" (`actor_type=system`) | — (mới) | §7-7／§13-1／§17-1 |
| **33** | **Mô hình dữ liệu**: `trouble_types` (mới・`auto_child`)／`trouble_app_reasons` (mới)／`trouble_reports.type_code` cho phép NULL・thêm `partial_no_resend` vào `resolution`・xóa `auto_duplicate_due_at`／`deliveries.creation_source` đổi `trouble_timeout` → `trouble_auto`・thêm `source_trouble_delivery_id` và thay đổi ràng buộc duy nhất／thêm `trouble_open` vào `review_items.kind`／xóa `trouble_auto_duplicate_after_minutes` khỏi cài đặt vận hành | Một phần của #26 | §16-5／§17-1 |

---

### 19-7. Bổ sung 4 ngày 2026/09/29 (giải quyết vấn đề chưa giải quyết・ủy thác tuyến 1)

Nguồn: `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Vấn_đề_chưa_giải_quyết_và_ủy_thác_đợt_1_20260929.md` (#34〜#51). **Phiên bản vẫn là v2.3.** Bản chính là đặc tả DEV (§3.1・§3.2・§3.3・§3.6・§4.1・§9.1.1・§9.4・§11・§12.4・§13.1・§13.4・§13.5・§14.4〜14.7・§14.11・§15.2・§15.9・§15.15・§16.5・§19.1・§19.1.1); nếu có sai khác thì DEV là chuẩn. **Nếu mâu thuẫn với bổ sung ngày 9/29 (#27〜#33) trở về trước thì ưu tiên văn bản này.** Nguyên nhân khởi đầu là `Giao_hàng_Vấn_đề_chưa_giải_quyết_và_phương_án_v1.md` (2026/09/29). Phản hồi của vận hành là "**tiến hành theo phương án đề xuất／trường hợp tuyến 1 là ủy thác và có trung chuyển là có thật**". Đã giải quyết No.1・No.6 ở §18 và chuyển No.19 thành "tạm thời".

| # | Quyết định | Nội dung bị ghi đè | Mục tương ứng trong tài liệu này |
|---|---|---|---|
| **34** | **Phạm vi hiển thị trên trang web chuyên dụng của công ty vận chuyển ủy thác.** Xác định (sau hạn chốt đơn hàng) = dữ liệu giao hàng với toàn bộ hạng mục (tên cơ sở・địa chỉ・ngày giao・nhiệt độ bảo quản・số lượng・điều kiện giao hàng・phiếu vận chuyển). Dự kiến (trước hạn chốt)＝**đến chu kỳ tháng sau**, **chỉ ngày giao・tên cơ sở・nhiệt độ bảo quản・số lượng đơn**(không hiển thị số lượng hàng), có dấu "dự kiến". Chỉ thấy lần giao hàng mà công ty mình phụ trách một chặng (#51). Màn hình tái sử dụng "Lịch trình Tháng・Tuần・Ngày" của vận hành cho Web công ty vận chuyển ủy thác (theme carrier) | Giải quyết §18 No.1 (chưa quyết) | §1-1／§10-7／§11-6／§12-6／§14-5／§15-10／§17-3 |
| **35** | **Thông báo tự động hạn sử dụng ngắn.** Lần giao hàng chứa sản phẩm có số ngày từ ngày xuất hàng đến ngày giao ＞ `products.shelf_life_days` − số ngày an toàn thì hiển thị vào cần xác nhận **`shelf_life_warning`**. Số ngày an toàn là 1 cài đặt chung toàn công ty (`shelf_life_safety_days`・mặc định 2 ngày). Xét khi tạo・tính lại kế hoạch (khi lead time kéo dài do dời lịch)・thay đổi kho・nhân bản. **Việc chia nhỏ vẫn do vận hành quyết định như trước** (không tự động chia) | Giải quyết §18 No.6 (chưa quyết) | §9-4／§15-9／§16-1／§16-2／§17-1 |
| **36** | **Dữ liệu giao hàng vật tư được tạo mỗi lần xác định giỏ hàng.** Nếu đã có dữ liệu giao hàng vật tư cùng cơ sở・cùng ngày giao・chưa gửi chỉ thị xuất hàng thì cộng thêm chi tiết và gộp thành 1. Chỉ thị xuất hàng gửi bằng catch-up hằng ngày hiện có | Giải quyết §20 #22・#35 (chưa quyết) | §5-7／§7-5／§10-9 |
| **37** | **Đơn yêu cầu thay đổi vẫn ở trạng thái "đang yêu cầu".** Hạn xử lý＝hạn chốt đơn hàng của lần giao hàng đó. 3 ngày trước hạn chốt, cần xác nhận **`change_request_due`** (`change_request_warn_days`・mặc định 3 ngày). Dù qua hạn chốt vẫn để trong cần xác nhận cho đến khi vận hành xử lý. **Hệ thống không tự động từ chối** | Giải quyết §20 #19 (chưa quyết) | §5-9／§7-7／§15-9／§16-1／§16-2／§17-1 |
| **38** | **Lead time của giao hàng theo lần (vật tư) cũng là ngày xuất hàng＝ngày giao−lead time.** Ngày giao vật tư là ngày giao khả dụng đầu tiên kể từ ngày sau ngày đặt hàng mà đảm bảo được lead time (việc xét ngày không thể giao・ngày không thể nhận・ngày không thể xuất hàng giống thông thường) | Giải quyết §20 #18 (chưa quyết). "Không xét khung không thể xuất hàng" và "chu kỳ hằng tuần của phía vật tư" ở §7-5・§10-9 | §5-4／§5-7／§7-5／§10-9 |
| **39** | **Ghi nhận hàng thay thế.** Thêm `delivery_lines.substituted_from_product_id` (hàng gốc được thay thế). 1 dòng＝sản phẩm thực tế đã giao, **thanh toán theo đơn giá của hàng gốc**. Đăng ký khi chọn "giao đủ toàn bộ bằng hàng thay thế" trong giải quyết sự cố và khi sửa thực tích (chỉ vận hành・bắt buộc có lý do) | — (mới) | §7-8／§13-6／§14-2／§15-6／§16-5 |
| **40** | **Cước vận chuyển khi dừng.** Dùng cờ cước vận chuyển của giao lại cho cả dừng, đổi tên cột thành **`freight_billable`** (cũ `redelivery_billable`). Mặc định "không", "có" thì bắt buộc có lý do. Không thanh toán sản phẩm. Hàng hủy bỏ là `disposed_qty`, việc gửi trả hàng còn lại là #41 | `deliveries.redelivery_billable` (đổi tên) | §7-7／§13-4／§13-6／§14-2／§16-5 |
| **41** | **Gửi trả hàng còn lại về trụ sở.** Thêm "gửi trả" vào lý do nhân bản (`duplicate_type = return`). Chỉ khi gửi trả mới có thể đổi nơi giao sang nơi nhận trả. Nơi nhận trả được chọn từ cơ sở đã đăng ký trong master kho với `warehouse_type = return`, giữ ở `deliveries.return_to_warehouse_id` (snapshot địa chỉ là nơi nhận trả). Số lượng là số còn lại・**nằm ngoài đối tượng thanh toán**. Cha con 1 cấp・số nhánh giống nhân bản | Trước đây không có cách tạo "gửi đến trụ sở làm nơi giao" | §3-1／§7-7／§8-4／§9-7／§13-5／§13-6／§14-2／§16-4／§16-5 |
| **42** | **Giữ tên hiển thị cho Web doanh nghiệp tách khỏi trạng thái** (không đổi tên trạng thái của Web vận hành): Hủy (có chuyến thay thế)＝Đang điều chỉnh ngày giao／Có báo cáo sự cố chưa giải quyết＝giữ nguyên trạng thái＋"Đang xác nhận tình hình giao hàng"／Bản ghi con (Đang xác nhận)＝Đang chuẩn bị giao lại／Đã giao một phần＝Đã giao một phần／Chờ giao lại＝Dự kiến giao lại／Hủy (không có chuyến thay thế)・Dừng＝Dừng giao hàng | §13-2 ① "hiển thị cho doanh nghiệp là 'Đang xác nhận'" | §8-9／§13-2／§15-10 |
| **43** | **Cần xác nhận `assignment_missing` (chưa đặt tài xế) được thống nhất thành 1 loại: khi đến "ngày trước ngày giao", chặng cần phân công (#48) chưa có người phụ trách.** Trước đó xem bằng huy hiệu "Chưa phân công N đơn" ở hiển thị tháng・tuần | DEV §13.1 "nếu tại thời điểm lock chưa phân công thì cần xác nhận", §8-5 "còn chưa đến 1 tuần trước ngày giao mà chưa phân công", §10-1・§12-1 "nếu tại thời điểm chỉ thị xuất hàng chưa phân công thì cần xác nhận" | §8-5／§10-1／§12-1／§15-2／§15-9／§16-2／§17-1 (sửa đổi 2026/09/30: hiển thị ở cần xác nhận của vận hành và Web công ty vận chuyển ủy thác vào 3 ngày trước và ngày trước ngày giao, gửi email cho công ty vận chuyển ủy thác. Thông báo "chưa phát hành phiếu vận chuyển" ở §10-5 cũng sửa theo. [Bảng yêu cầu dòng 142・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930]) |
| **44** | **6 mục tạm thời** (ý nghĩa của `HU`・mã kho・nguồn dữ liệu ngày lễ・tên chính thức của Yamato／Thomas・việc không thu hồi túi giữ lạnh・số điện thoại liên hệ) **tiếp tục triển khai với giá trị tạm**. Lập thành 1 bảng xác nhận gửi cho vận hành, khi có phản hồi thì thay nội dung chính | — | §18 No.7〜12 |
| **45** | **Chỉ thị xuất hàng của Thomas.** Hủy được chốt theo phương thức gửi lại (phiên bản mới có số lượng 0), dù có I/F hủy cũng không dùng. CSV triển khai với các hạng mục tối thiểu của DEV §19.1, và **làm sao để chỉ phần xuất có thể thay thế**. Nếu không hỗ trợ UTF-8 thì **chuyển sang Shift_JIS khi xuất** | — | §10-3／§10-4／§10-7／§18 No.5 |
| **46** | **Các hạng mục giao cho Yamato (tạm thời・chờ Yamato xác nhận).** Tên người nhận khi giữ tại bưu cục＝công ty vận chuyển ủy thác đến nhận (ghi tên cơ sở và số giao hàng vào ô ghi chú)／ngày giao dự kiến＝ngày đến bưu cục (từ giá trị tham khảo lead time của tuyến 1)／nếu CSV của Thomas không có cột thì xuất CSV riêng cho phiếu vận chuyển | Chuyển §18 No.19 từ "chưa quyết" thành "tạm thời" | §10-7／§10-8／§18 No.19 |
| **47** | **Đánh số phiếu vận chuyển của chuyến lấy hàng bằng ES** (triển khai quyết định #55). `issued_by = es_generated`, `box_no`・`box_total`. Số＝số giao hàng＋số thùng 2 chữ số (ví dụ `DL-261020-0021-01`). Khi gửi chỉ thị xuất hàng thành công, tạo theo số thùng dự kiến, nếu số thùng thực tích khác thì bổ sung phần thiếu, phần thừa là `voided`. Không hiển thị liên kết trang theo dõi | — (triển khai quyết định #55) | §7-8／§10-5／§15-6／§16-5 |
| **48** | **Chặng cần phân công tài xế được quyết định theo đơn vị vận chuyển.** Chặng của công ty vận tải (`parcel_carrier`) không phân công. Chặng tự vận chuyển (`self`)・ủy thác (`partner_driver`) thì phân công. Với chặng ủy thác, công ty vận chuyển ủy thác đó cũng có thể phân công tài xế của mình | Quyết định #60 "Vận hành hiện tại chỉ phân công tuyến 2 (tuyến 1 do công ty vận tải chở)" | §3-2／§7-8／§11-3／§12-1／§15-2／§15-6／§16-3／§17-3／§19-1 |
| **49** | **Ghi nhận bàn giao tại điểm trung chuyển.** Không tăng trạng thái. Thêm `delivery_legs.picked_up_at`・`picked_up_by`. Trạng thái Đã nhận là khi lần đầu nhận bằng ứng dụng ES (nếu tuyến 1 là ủy thác thì nhận tại kho). Khi tài xế tuyến 2 nhận hàng tại điểm trung chuyển thì chỉ nhập thời điểm nhận của chặng đó. Trường hợp không có nhận ở chặng cuối đến sáng hôm sau thì bắt bằng phát hiện thiếu giao hàng hiện có | — (mới) | §7-7／§11-3／§11-4／§15-6／§16-3 |
| **50** | **Công ty vận chuyển・điểm trung chuyển có thể chọn trong cài đặt giao hàng theo hợp đồng.** Cả tuyến 1・tuyến 2 đều chọn được từ toàn bộ master công ty vận chuyển (công ty vận tải・ủy thác・tự vận chuyển). Điểm trung chuyển chọn từ toàn bộ trung chuyển (`HU`) của master kho. Cơ sở của công ty vận chuyển ủy thác cũng có thể đăng ký làm điểm trung chuyển | Lựa chọn tuyến 1 của thiết kế (chỉ Yamato・Sagawa・chuyến tự vận chuyển) | §3-2／§3-3／§5-1／§5-3／§5-8／§16-4 |
| **51** | **Phạm vi nhìn thấy trên Web công ty vận chuyển ủy thác.** Chỉ thấy lần giao hàng mà công ty mình phụ trách một chặng. Chỉ thao tác được chặng của công ty mình (người phụ trách tuyến 1 đến khi nhận tại kho, người phụ trách tuyến 2 từ nhận tại điểm trung chuyển đến giao hàng) | "Chỉ dữ liệu giao hàng được phân công cho công ty mình" | §1-1／§11-6／§12-4／§12-6／§17-3 |

**Hạng mục công việc (không phải quyết định)**: ①Việc thêm các hạng mục liên quan đến giao hàng vào `Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục` **chưa thực hiện** (sửa `items.py` rồi tạo lại・§18 No.14) ②Đã ghi ước tính tạm về dung lượng lưu trữ ảnh vào §17-4 (§18 No.16) ③Đã cập nhật §18 No.3 thành "giải quyết một phần". **Chưa phản ánh vào 2 bản demo và thiết kế (artifact).**

---

### 19-8. Bổ sung 5 ngày 2026/09/29 (thời điểm bắt đầu tạo kế hoạch・dữ liệu giao hàng／nút CSV của THOMAS)

| # | Quyết định |
|---|---|
| 52 | **Kế hoạch・dữ liệu giao hàng・hợp đồng con được tạo từ hợp đồng đã xác định (đăng ký chính thức) cơ sở.** Đăng ký tạm (đang cài đặt)・đang tạm dừng・khoảng trống sau khi hết dùng thử・kết thúc thì không tạo. Ngay sau khi xác định, chỉ chạy hợp đồng của cơ sở đó theo thứ tự hợp đồng con → kế hoạch → tạo xác định. Nếu việc xác định quá hạn chốt đơn hàng của chu kỳ bắt đầu thì tháng chu kỳ bắt đầu chuyển sang chu kỳ kế tiếp (28-27) |
| 53 | **Đặt nút xuất・nhập CSV ở màn hình "Chỉ thị xuất hàng・nhập liệu".** Xuất CSV chỉ thị xuất hàng (THOMAS)／CSV dùng cho phiếu vận chuyển (Yamato), tải lại CSV theo từng lịch sử gửi, nhập thực tích xuất hàng・số phiếu vận chuyển, mẫu, dòng lỗi. Việc xuất không phải là gửi nên không tạo phiên bản và không `locked`. Mã hóa ký tự là Shift_JIS (chuyển đổi ở tầng xuất) |

### 19-9. Bổ sung 6 ngày 2026/09/29 (tiếp nhận đăng ký: kho・số lần giao hàng・đơn hàng・bộ vật tư ban đầu・dùng thử)

Chủ sở hữu quyết định là `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` §16・§17. Số hiệu là số hiệu quyết định về đơn đăng ký.

| # | Quyết định |
|---|---|
| 28-77・93 | Khách hàng không thể yêu cầu tuyến giao hàng. **Kho picking・số lần giao hàng được xác định ở bước xác nhận nội dung đăng ký**, còn công ty vận chuyển ①②・điểm trung chuyển 1・lead time・mẫu giao hàng・chu kỳ giao hàng thì vận hành nhập ở cài đặt thông tin chi tiết của tiếp nhận (hợp đồng con｜hợp đồng) |
| 28-83・84 | Công ty vận chuyển ①② là toàn bộ master công ty vận chuyển (công ty vận tải・ủy thác・chuyến tự vận chuyển). Công ty vận chuyển ② chỉ bắt buộc khi có điểm trung chuyển 1 |
| 28-85 | Phần tổng số lần giao hàng vượt tiêu chuẩn của gói thì tùy chọn loại A "Thêm số lần giao hàng" (OP000001) tự động thiết lập ở ① của hợp đồng con |
| 28-86・88 | Chu kỳ giao hàng chọn từ bảng tuần A〜D × thứ theo số lần giao hàng (không chọn được thứ không thể giao). Giá trị ban đầu của mẫu giao hàng là chu kỳ ES |
| 28-94・97・98 | Triển khai chính thức: sau khi hoàn tất xác nhận nội dung đăng ký＋tài khoản (cơ sở, hoặc doanh nghiệp đã có), doanh nghiệp có thể đặt đơn trong thời gian đặt đơn của tháng chu kỳ bắt đầu. Nếu không có cả hai thì đến hạn chốt sẽ dùng số lượng tiêu chuẩn |
| 28-95・101・102・105 | Dùng thử: tự động tạo đơn hàng (chia đều giới hạn cung cấp hàng tháng cho toàn bộ sản phẩm・chênh lệch giữa các lần tối đa 1). Doanh nghiệp không thể chỉnh sửa, vận hành có thể sửa cả số lượng lẫn sản phẩm đến ngày chốt đặt hàng. Tạo cả khi không có tài khoản |
| 28-96・103・104 | Dùng thử lấy ngày chốt đặt hàng (B7・D7) làm chuẩn (STEP5 T1 đổi từ B5・D5). B7 → từ chu kỳ kế tiếp, D7 → từ nửa sau (tuần C) của chu kỳ kế tiếp (nếu số lần giao hàng từ 2 trở lên thì từ tuần A của chu kỳ kế kế tiếp). Quá hạn thì sang ngày chốt kế tiếp |
| 28-106〜108 | Bộ vật tư ban đầu: sản phẩm của master vật tư・tự động tạo khi đăng ký tạm・ngày giao nhập ở bước xác nhận nội dung đăng ký (bắt buộc)・miễn phí (**nơi nhập ngày giao đổi sang tab "Hợp đồng con" của cài đặt thông tin chi tiết bởi 28-145 → §19-13**) |
| 28-99 | Nếu để đăng ký tạm rồi bị từ chối・rút lại thì hủy đơn hàng・bộ vật tư ban đầu |
| 28-100 | Sau đăng ký tạm vẫn có thể sửa kho・số lần giao hàng ở cài đặt thông tin chi tiết của tiếp nhận (hiển thị lưu ý về ảnh hưởng đến đơn hàng) |
| 28-109 | Đơn hàng・bộ vật tư ban đầu hoạt động ở đăng ký tạm, hợp đồng con・kế hoạch・dữ liệu giao hàng được tạo ở đăng ký chính thức (#52 giữ nguyên) |
| 28-129 | 【Bổ sung 7】Định nghĩa bộ vật tư ban đầu: số lượng trong master vật tư (theo số suất ăn của gói) |
| 28-130 | 【Bổ sung 7】Dữ liệu giao hàng của bộ vật tư ban đầu được tạo ở đăng ký chính thức (đơn hàng vật tư được tự động tạo khi đăng ký tạm) |

### 19-10. Bổ sung 7 ngày 2026/09/29 (trang chủ của Web doanh nghiệp: lịch giao hàng của tháng hiện tại và chi tiết giao hàng)

| # | Quyết định |
|---|---|
| 54 | **Trang chủ Web doanh nghiệp＝lịch giao hàng của tháng hiện tại** (màn hình 07). Chuyển tháng chỉ đến tháng đã tạo kế hoạch. Bấm vào ô để xem chi tiết giao hàng. Bên phải là thông báo và các lần giao hàng cần xác nhận (cùng thứ tự với trang chủ của Web công ty vận chuyển ủy thác. Cũ: bên dưới là các lần giao hàng sắp tới／đơn yêu cầu thay đổi／cách xem trạng thái). **Bãi bỏ danh sách "Tình trạng giao hàng"** |
| 55 | **Phạm vi hiển thị chia theo quyền**: quản trị viên doanh nghiệp＝toàn bộ cơ sở của công ty mình (lọc theo cơ sở)／nhân viên phụ trách cơ sở＝chỉ các cơ sở được phân công. [Đề xuất] `role` (corp_admin｜site_staff)・`corporate_user_sites` |
| 56 | **Chi tiết giao hàng**: ngày dự kiến đến・khung giờ nhận・tình trạng・danh sách sản phẩm (dự kiến là sau hạn chốt)・tình trạng giao hàng (5 bước・tồn kho và trưng bày theo từng sản phẩm・ảnh dành cho khách)・số phiếu vận chuyển và liên kết theo dõi (không có cột tên công ty). Không hiển thị ngày picking・kho・công ty vận chuyển・trung chuyển・nhân viên・cước vận chuyển・lịch sử thay đổi |
| 58 | **Các lần giao hàng cần xác nhận**: ①đề xuất ngày khác (cần trả lời. Nhận hoặc từ chối ở chi tiết) ②lần giao hàng không đến・bị chậm ③kết quả đơn yêu cầu (14 ngày) ④kế hoạch có thể yêu cầu (từ 3 tuần trước hạn chốt). Thành phần là NoticeList |
| 59 | **Danh sách đơn yêu cầu thay đổi của doanh nghiệp** đặt ở tab "Đổi ngày giao hàng" của menu trái "Đơn yêu cầu". Tình trạng: đang yêu cầu／đề xuất ngày khác／phê duyệt／từ chối／rút lại (rút lại là [đề xuất]) |
| 60 | **Không hiển thị ảnh・xác nhận tồn kho và hủy bỏ・5 bước trong chi tiết giao hàng của doanh nghiệp** (hủy một phần của #56) |
| 62 | **Đơn yêu cầu thay đổi được hiển thị ở "khung đơn yêu cầu" phía trên chi tiết, xử lý・yêu cầu bằng modal**. Vận hành: khung phía trên tổng quan giao hàng (hiện tại → nguyện vọng thứ nhất・thứ hai・lý do・người yêu cầu)＋từ chối／đề xuất ngày thay thế／phê duyệt → modal xử lý "Xác nhận đơn yêu cầu thay đổi" (thông tin cơ bản・tuyến／bảng ngày giao mong muốn／bảng ngày khác chọn bằng radio. Thiếu lead time・vượt số lượng・không thể xuất hàng hiển thị chữ đỏ. "Phê duyệt theo ngày đã chọn"＝nếu là ngày mong muốn thì đổi, nếu là ngày khác thì đề xuất cho doanh nghiệp／"Từ chối" bắt buộc có lý do) (cũ: modal liệt kê kiểm tra ①〜⑦ và ứng viên ngày thay thế). Doanh nghiệp: khung phía trên chi tiết giao hàng (phản hồi đề xuất), đơn yêu cầu mới từ nút ở tiêu đề thì mở modal yêu cầu. Người không có quyền thì không hiển thị nút (cũ: tab đơn yêu cầu thay đổi・màn hình chi tiết đơn yêu cầu thay đổi) |
| 61 | Theo hệ thống thiết kế: dự kiến＝info／huy hiệu của ô không xuống dòng, là dấu ngắn (tên chính thức ở tooltip)／tiêu đề "Chi tiết giao hàng"／thêm NoticeList vào ES Kitchen |
| 57 | **Đơn yêu cầu thay đổi từ chi tiết giao hàng**. Phạm vi giữ nguyên như §8 (kế hoạch từ tháng sau trở đi・đến hạn chốt đơn hàng). Tháng hiện tại・quá khứ・sau khi xác định thì không hiển thị nút mà hiển thị lý do. Chọn nguyện vọng thứ nhất・thứ hai từ cùng nửa đầu／nửa sau của cùng chu kỳ, hoặc không có ngày mong muốn. Bắt buộc có lý do |

### 19-11. Bổ sung 8 ngày 2026/09/29 (đổi ngày sau hạn chốt đơn hàng)

| # | Quyết định |
|---|---|
| 63 | **Dù sau hạn chốt đơn hàng, đến trước ngày xuất hàng 1 ngày, vận hành vẫn có thể đổi ngày từ "Chỉnh sửa" ở chi tiết dữ liệu giao hàng**. Từng đơn (không hàng loạt・không kéo thả)・bắt buộc có lý do・ngày đổi đến là cùng nửa đầu／nửa sau của cùng chu kỳ・ngày xuất hàng di chuyển cùng giữ nguyên lead time của hợp đồng・đồ đông lạnh・lạnh cùng ngày cũng di chuyển cùng・không đổi kho picking・chỉ thị xuất hàng đã gửi thì gửi lại bằng phiên bản mới. Từ ngày xuất hàng trở đi thì hủy＋nhân bản (cũ: sau hạn chốt đều là hủy＋nhân bản・quyết định v2.2 #1) |

### 19-12. Bổ sung 9 ngày 2026/09/29 (phản ánh nhận xét về thiết kế giao hàng)

| # | Quyết định |
|---|---|
| 64 | **Tab "Sự cố" và "Đăng ký sự cố thay" không hiển thị ở dự kiến・chờ xuất hàng**. Sau khi xuất hàng thì hiển thị dù chưa có sự cố. Bản ghi con đang xác nhận không bị ẩn. API vẫn chỉ nhận đăng ký đối với Đã xuất hàng・Đã nhận・Đã giao như trước |
| 65 | **Giải quyết sự cố gồm 2 bước** (①chọn cách xử lý・báo cáo chưa xác định loại thì bắt buộc chọn loại → ②chỉ các ô cần thiết). Bắt buộc: `full`＝số lượng giao được (hàng gốc tùy chọn)／`partial`＝số lượng giao được・ngày giao tạm của bản ghi con／`partial_no_resend`＝số lượng giao được／`redelivery`＝ngày giao tạm của bản ghi con・cước vận chuyển／`same_day_revisit`＝không có／`stop`＝cước vận chuyển. Lý do luôn bắt buộc. Ô không dùng thì bỏ qua (cũ: tất cả trong 1 modal) |
| 66 | **Chi tiết thông báo trên Web doanh nghiệp**: danh mục・ngày giờ đăng・tiêu đề・nội dung・tệp đính kèm (chỉ tệp đính kèm của thông báo gửi đến ESS)・quay lại danh sách. Chỉ hiển thị thông báo đang công khai và mình là đối tượng nhận. API danh sách・chi tiết phía nhận được đặt trong tài liệu phân phối thông báo (chưa phản ánh) |
| 67 | **Chỉ về màn hình**: thêm cần xác nhận vào menu bên "Quản lý giao hàng" của vận hành／bỏ chuyển đổi "chuẩn (xuất hàng／giao hàng)" của hiển thị tháng／menu bên có thể thu gọn (tự động đóng khi dưới 1280px). Việc gỡ các menu không có màn hình khỏi demo giao hàng chỉ áp dụng cho demo |

### 19-13. Bổ sung 10 ngày 2026/09/29〜30 (ngày giao bộ vật tư ban đầu・số lần giao hàng theo nhiệt độ bảo quản)

Bản chính của quyết định là `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` (28-145) và `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` (28-153〜157). Được đưa vào ngày 2026/09/30 do sót phản ánh khi dọn dẹp công việc song song.

| # | Quyết định | Phản ánh |
|---|---|---|
| 28-145 | Ngày giao của bộ vật tư ban đầu không nhập ở xác nhận nội dung đăng ký mà nhập ở **tab "Hợp đồng con" của cài đặt thông tin chi tiết của tiếp nhận (bên dưới tuyến giao hàng)** (bắt buộc). Đơn hàng vật tư (bộ ban đầu) vẫn tự động tạo khi đăng ký tạm | §0-2H・§7-5・§19-9 |
| 28-153・155 | Số lượng giao mỗi lần theo từng nhiệt độ bảo quản (giới hạn cung cấp hàng tháng ÷ số lần giao hàng tiêu chuẩn). **Không giữ tỷ lệ đông lạnh** | §5-1 |
| 28-154 | Số lần giao hàng tiêu chuẩn của master gói theo từng nhiệt độ bảo quản (lạnh・nhiệt độ thường／đông lạnh) | §5-1 |
| 28-156 | Việc thêm số lần giao hàng được tính theo từng nhiệt độ bảo quản, **không bù trừ**. **Không có số lần giao hàng bằng 0** (lạnh từ 1 lần trở lên, ES Standard thì đông lạnh cũng từ 1 lần trở lên) | §0-2H・§5-1・DEV §4.9 |
| 28-157 | Bảng tủ đông có cùng dạng với tủ lạnh (giá trị chờ tài liệu) | — |
