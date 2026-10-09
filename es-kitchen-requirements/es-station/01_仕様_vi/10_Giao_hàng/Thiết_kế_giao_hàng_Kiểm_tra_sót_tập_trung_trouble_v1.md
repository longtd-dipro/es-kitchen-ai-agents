# Kiểm tra thiếu sót giữa thiết kế giao hàng × đặc tả giao hàng (tập trung vào xử lý khi có sự cố) v1

- Ngày lập: 2026/09/29
- Thiết kế đối tượng: Artifact "Thiết kế màn hình quản lý giao hàng Web vận hành" (claude.ai/artifact/Qp9MqQ24o4rtRbJRAQKbGa・bản 2026/09/28・30 artboard)
- Đặc tả đã đối chiếu: `DEV仕様書_…_VI_v2.3` (gồm bổ sung 2026/09/24. Là nguồn đúng của mô hình dữ liệu)／`統合仕様書_…_v2.3` (§7-7・§8-4・§11・§13・§15-5〜15-9・§17-1・§18・§20)／`Quyết_định_v2.3_Bổ_sung_Trouble_con_tự_động_20260924`
- Theo quy tắc cách tiến hành, **tài liệu này chỉ nêu chỉ ra vấn đề**. Chưa phản ánh vào đặc tả・demo・thiết kế.

---

## 0. Kết luận

1. **Không có một màn hình nào để "giải quyết" sự cố.** Thao tác trung tâm của đặc tả là "bộ phận vận hành (logistics) giải quyết sự cố và đóng bản ghi cha" (tích hợp §13-2・DEV §15.12) không có chỗ đặt trong thiết kế. Các nút của chi tiết dữ liệu giao hàng (06) chỉ có "Hủy／Nhân bản／Chỉnh sửa", **không có lối vào để chọn hủy bỏ・giao một phần・giao lại・quay lại ngay trong ngày・giao toàn bộ (hàng thay thế)**.
2. **Trong thiết kế còn sót cách nghĩ trước bổ sung 9/24.** Như dòng bản ghi cha của dữ liệu giao hàng đang là `Đang xác nhận`, lịch sử "Giao một phần" do "hệ thống" thực hiện, cùng một bản ghi con xuất hiện cả như "nhân bản thủ công" lẫn "bản ghi con tự động" (§2).
3. **Bản thân đặc tả cũng có lỗ hổng.** Đặc biệt 3 điểm: "đã coi như hoàn thành (đã giao) nhưng thực ra chưa đến nơi", "xảy ra sự cố lần nữa ở bản ghi con giao lại", "1 bản ghi có nhiều báo cáo sự cố" không thể xử lý bằng bảng chuyển trạng thái・quy tắc nhân bản hiện tại (§3).

---

## 1. Màn hình・thao tác không có trong thiết kế (đặc tả có)

| No | Thứ không có | Căn cứ đặc tả | Ảnh hưởng |
|---|---|---|---|
| D-1 | **Danh sách・chi tiết báo cáo sự cố** (loại・người báo cáo・ngày giờ・nguyên văn `app_reason_raw`・ảnh・trạng thái = chưa giải quyết／đã giải quyết) | Tích hợp §13-1・§13-2, DEV §14.7 `trouble_reports` | Ở tab kết quả của 06 chỉ có chữ "Hư hỏng (có báo cáo sự cố)", không có chỗ xem bản thân báo cáo |
| D-2 | **Thao tác "quyết định cách xử lý" (giải quyết sự cố)**: Chọn giao toàn bộ (gồm hàng thay thế)／giao một phần／giao lại toàn bộ／quay lại ngay trong ngày／hủy bỏ. Bắt buộc có lý do. Nhập số lượng giao theo từng sản phẩm (`delivery_lines.delivered_qty`) | Tích hợp §11-4 "Không tạo lối đi chỉ đổi trạng thái từ màn hình. Nhất định phải đi qua thao tác 'quyết định cách xử lý'", §13-2 bảng, DEV §15.12 | **Thiếu sót lớn nhất**. Nếu không có thì không có cách nào đổi sang đã giao một phần・chờ giao lại・hủy bỏ |
| D-3 | **Gán loại theo 6 phân loại** (lựa chọn của ứng dụng → 6 phân loại của master. "Thiếu hàng・giao nhầm" do bộ phận vận hành phân loại) | Tích hợp §13-1 | Vì quy tắc là còn tồn tại ở trạng thái chưa giải quyết cho đến khi gán phân loại nên cần có chỗ để gán |
| D-4 | **Lối vào đăng ký thay** (bộ phận vận hành nhập liên hệ từ doanh nghiệp・cơ sở・công ty giao hàng. Chủ yếu dùng cho chuyến mà final leg là công ty vận tải・khiếu nại sau khi giao hàng) | Tích hợp §11-2・§11-7・§13-2 | Với hàng giao trực tiếp qua Yamato, nếu không có thì không thể ghi nhận dù chỉ 1 sự cố |
| D-5 | **Thao tác hủy bỏ (sau khi xuất hàng)** (đã xuất hàng／đã nhận → hủy bỏ・bắt buộc có lý do) | DEV §12.2 | Ở 06 không có nút "Hủy bỏ". "Hủy" chỉ dành cho trước khi xuất hàng (`shipped_date IS NULL`) nên không thay thế được |
| D-6 | **Modal hủy**: Bắt buộc có lý do／chỉ bấm được trước khi xuất hàng／nếu đã có chỉ thị xuất hàng thì nêu rõ "gửi lại phiên bản số lượng 0"／sau khi bắt đầu picking thì liên hệ qua điện thoại | Tích hợp §13-2 ①, DEV §10.3・§12.2 | Chỉ có nút, chưa thiết kế nội dung bên trong |
| D-7 | **Modal nhân bản**: Phân loại lý do (giao từng phần／giao lại／chuyến thay thế／khác) + nội dung lý do, số lượng theo từng sản phẩm, ngày giao hàng tạm, thay đổi kho・công ty giao hàng khi là chuyến thay thế, hiển thị "sự cố này đã có bản ghi con (dùng lại)" | Tích hợp §8-4・§13-5, DEV §15.11 (`DOMAIN_TROUBLE_CHILD_EXISTS`) | Chỉ có nút, chưa thiết kế nội dung bên trong |
| D-8 | **Chi tiết bản ghi con (đang xác nhận) và "xác định để chuyển sang chờ xuất hàng"**: Hiển thị là ngày・số lượng tạm, `schedule_confirmed`／`quantity_confirmed`, hiển thị nằm ngoài đối tượng chỉ thị xuất hàng・phân công・thanh toán, xác định／đổi ngày／hủy | Tích hợp §13-3 bước 4, DEV §12.2・§13.2.1 | Vì không có chỗ chuyển bản ghi con sang chờ xuất hàng nên cả bản ghi con tự động và bản ghi con thủ công đều dừng lại |
| D-9 | **Hiển thị liên kết cha con**: Bản ghi cha có "đích nhân bản (số lượng・trạng thái・ngày giao hàng)", bản ghi con có "nguồn nhân bản", chuyển qua lại lẫn nhau | Tích hợp §13-2 "Trạng thái ngoại lệ nhất định có lý do và lịch sử" ③ | Phía bản ghi cha chỉ có 1 mục "giao hàng tiếp theo". Chưa có hiển thị phía bản ghi con |
| D-10 | **Đăng ký hàng thay thế** (thay sản phẩm nào bằng sản phẩm nào. Thanh toán theo giá của sản phẩm gốc) | Tích hợp §13-6 | Không có màn hình lẫn mục (như C-5 của §3, phía đặc tả cũng không có mục) |
| D-11 | **Đăng ký tiêu hủy và tạo dữ liệu giao hàng "gửi số lượng còn lại về trụ sở"** | Tích hợp §13-6, DEV §13.5 | Tab kết quả có hiển thị số lượng tiêu hủy nhưng không có thao tác gửi số lượng còn lại về trụ sở |
| D-12 | **Cờ tính phí vận chuyển giao lại** (tính phí／không tính phí・mặc định không tính・bắt buộc có lý do) | Tích hợp §13-4, DEV `redelivery_billable` | Không có |
| D-13 | **Chi tiết cần xác nhận chỉ có 1 loại "không thể sinh kế hoạch"**. Không có màn hình sau khi bấm "xử lý" cho thiếu giao・bản ghi con tự động・chưa đặt tài xế・gửi lại chỉ thị xuất hàng・phiếu gửi hàng trước (nhiều trường hợp chỉ nhảy sang 06, ở đó không có nút xử lý) | Tích hợp §15-9 | Từ cần xác nhận không đến được xử lý |
| D-14 | **Màn hình tình trạng gửi chỉ thị xuất hàng và nhập dữ liệu**: Chạy lại khi gửi thất bại (`ship_order_failed`), nhập CSV kết quả xuất hàng・CSV phiếu gửi hàng và kết quả (số lượng nhập・dòng lỗi・`import_error`) | DEV §16.6・§19.3〜19.5 | Ở 06 có "nếu nhập CSV số phiếu" nhưng không có chỗ để nhập |
| D-15 | **Chỗ cài đặt thời gian (SLA・phút) đến khi tạo bản ghi con tự động của sự cố** | DEV §13.2.1 "bắt buộc ở cài đặt vận hành" | Giá trị và chỗ đặt đều chưa quyết định (C-4 của §3) |
| D-16 | **Hiển thị voided của phiếu gửi hàng** (phiếu gửi hàng bị vô hiệu do đổi địa chỉ không xóa mà để lại, hiển thị dưới dạng nhận ra là vô hiệu) | Tích hợp §15-13 | Bảng phiếu gửi hàng không có cách hiển thị voided |

---

## 2. Điểm khác nhau giữa thiết kế và đặc tả (chưa phản ánh bổ sung 9/24, v.v.)

| No | Ở đâu | Nội dung thiết kế | Đặc tả | Đề xuất cách sửa |
|---|---|---|---|---|
| M-1 | Lịch trình hiển thị theo ngày | `DL-260928-0004` (không có số nhánh = bản ghi cha) là **đang xác nhận** | Bản ghi cha dù có sự cố cũng không chuyển thành đang xác nhận. Đang xác nhận chỉ dành cho bản ghi con (quyết định v2.3 #20) | Đưa trạng thái về đã xuất hàng, và hiển thị dấu "có báo cáo sự cố chưa giải quyết" riêng |
| M-2 | Lịch sử ở tab kết quả của 06 (`DL-260928-0014`) | 11:50 "**Hệ thống**: đã nhận → đã giao một phần" | Việc chuyển thành đã giao một phần là thao tác giải quyết của bộ phận vận hành (logistics) (#21) | Sửa thành "Logistics Tanaka: giải quyết sự cố (giao một phần)" |
| M-3 | Như trên + danh sách cần xác nhận | Bản ghi con `-0014-1` trong lịch sử là 12:05 **nhân bản thủ công của bộ phận vận hành**, trong danh sách cần xác nhận là 12:00 **bản ghi con tự động (hết hạn)** | 1 sự cố có 1 bản ghi con. Chỉ một trong hai | Thống nhất theo một trong hai kịch bản. Nếu là bản ghi con tự động thì "báo cáo 11:42 → hết hạn → bản ghi con tự động → bộ phận vận hành giải quyết và dùng lại (remainder)" |
| M-4 | "Giao hàng tiếp theo" của 06 | `DL-260928-0014-1 (**chờ giao lại**)`／"nhân bản phần thiếu 2 suất" | Chờ giao lại là **trạng thái kết thúc của bản ghi cha**. Bản ghi con là đang xác nhận → chờ xuất hàng. Việc gửi sau phần thiếu là **giao từng phần (remainder)**, không phải giao lại | Bản ghi con là "đang xác nhận (tạm 10/01)", v.v. Lý do là "giao từng phần" |
| M-5 | Phân loại của danh sách cần xác nhận | Có "bản ghi con tự động của sự cố" nhưng **không có "báo cáo sự cố chưa giải quyết"** | Báo cáo sự cố chưa giải quyết mở cần xác nhận tại thời điểm báo cáo (dòng sự cố của tích hợp §15-9). Bản ghi con tự động là phân loại riêng sau khi hết hạn | Thêm phân loại "Báo cáo sự cố (chưa giải quyết)". Hiển thị thời gian còn lại đến SLA |
| M-6 | Phân loại của danh sách cần xác nhận | Trong `review_items.kind` của DEV, **thiếu qty_missing／qty_mismatch／ship_order_failed／shipment_result_ng／import_error／billing_gap／thất bại sinh xác định** | DEV §14.11 | Thêm vào lựa chọn phân loại và bảng cần xác nhận của hiển thị tháng (số lượng 0 cũng hiển thị phân loại) |
| M-7 | Danh sách cần xác nhận・bảng hiển thị tháng | Không có dòng của **bản ghi con thủ công (đang xác nhận)** của giao từng phần・giao lại | Tích hợp §15-9 "Nhân bản giao từng phần・giao lại (đang xác nhận)" | Thêm phân loại "Chờ xác định bản ghi con" |
| M-8 | Kết quả phiếu gửi hàng của 06 | "**Đã đến điểm trung chuyển (tham khảo)**" | Giai đoạn 2 không có batch lấy tình trạng của Yamato. Trung chuyển chỉ có／không, phần giữa xem ở trang tracking | Ở thiết kế giai đoạn 2 bỏ cả cột, chỉ để liên kết tới trang tracking |
| M-9 | Điều kiện chưa đặt tài xế | Cần xác nhận là "**ngày trước**" vẫn chưa đặt, kiểm tra ⑦ trước khi phê duyệt yêu cầu thay đổi là "1 tuần trước〜ngày trước" | Tích hợp §8-5 là "dưới **1 tuần** trước ngày giao hàng mà chưa phân công", DEV §13.1 là "nếu chưa phân công tại thời điểm **lock (gửi chỉ thị xuất hàng thành công)** thì cần xác nhận". Có 3 cách | Quyết định lấy cái nào làm chuẩn (câu hỏi §4) |
| M-10 | Kết quả 06 (các bước của chuyến giao ES) | "5. Thu tiền ¥3,240 (**bộ phận vận hành đã xác nhận**)" | Hệ thống không xử lý tiền mặt. Chỉ giữ số tiền dự kiến và số tiền thu thực tế, không có trạng thái "đã xác nhận" (DEV §13.6) | Chỉ để "Dự kiến ¥3,240／Thực thu ¥3,240" |
| M-11 | Kết quả 06 (bản ghi `done`) | Đi qua văn phòng Yamato Shinagawa nhưng lead time "0 ngày (chuyến nội bộ)", ngày xuất hàng = ngày giao hàng | Có trung chuyển mà lead time 0 ngày khó thành lập | Sửa mẫu thành lead time 1 ngày・xuất hàng 09/27, v.v. |
| M-12 | Bộ lọc trạng thái của danh sách xuất hàng・quản lý giao hàng | Có lựa chọn "**Kế hoạch**" ở lựa chọn | Danh sách chỉ có dữ liệu giao hàng. Không hiển thị kế hoạch (tích hợp §15-5) | Bỏ khỏi lựa chọn của danh sách (phía lịch trình vẫn giữ) |

---

## 3. Lỗ hổng của đặc tả (chưa quyết định・không xử lý được bằng quy tắc hiện tại)

| No | Luận điểm | Vấn đề với quy tắc hiện tại | Ví dụ lựa chọn |
|---|---|---|---|
| C-1 | **Sau khi coi như hoàn thành (đã giao), có liên hệ "chưa nhận được hàng"** | Ở #21, từ đã giao chỉ có thể chọn giải quyết là "giao toàn bộ". Không thể tiến đến giao lại・hủy bỏ. Thanh toán cũng phát sinh bằng việc giao theo cách coi như | ① Giữ nguyên đã giao và đóng bằng giao toàn bộ, gửi lại là dữ liệu giao hàng mới + thanh toán điều chỉnh ／ ② Chỉ với đã giao có `completion_source=presumed`, cho phép quay lại chờ giao lại・hủy bỏ bằng giải quyết |
| C-2 | **Ở bản ghi con giao lại, sự cố lại xảy ra lần nữa** | Nhân bản là "cha con 1 tầng" nên không thể nhân bản từ bản ghi con. Batch bản ghi con tự động cũng không thể tạo bản ghi con theo cùng quy tắc | ① Sự cố của bản ghi con thì tạo số nhánh tiếp theo (-2) từ bản ghi cha ／ ② Sự cố của bản ghi con không tạo bản ghi con tự động mà chỉ cần xác nhận ／ ③ Cho phép đến 2 tầng |
| C-3 | **Một lần giao hàng có nhiều báo cáo sự cố** (ví dụ: hư hỏng và thiếu số lượng) | Bản ghi con tự động là "1 bản ghi cho 1 báo cáo" nên tối đa tạo được 2 bản. Giải quyết theo đơn vị 1 lần giao hàng nên không quyết định được dùng lại bản ghi con của báo cáo nào | ① Các báo cáo chưa giải quyết của cùng lần giao hàng giải quyết gộp 1 lần, bản ghi con tự động là 1 bản theo đơn vị giao hàng ／ ② Giải quyết theo từng báo cáo |
| C-4 | **Giá trị và chỗ đặt của thời gian (SLA) đến khi tạo bản ghi con tự động** | Chỉ quyết định "bắt buộc ở cài đặt vận hành" mà chưa có giá trị. Cũng chưa quyết định chuyến nội bộ và chuyến ủy thác có giống nhau không | ① Dùng chung toàn công ty 1 giá trị (ví dụ: 240 phút từ báo cáo)／ ② Chuyến nội bộ và chuyến ủy thác khác nhau |
| C-5 | **Không có mục ghi nhận hàng thay thế** | `delivery_lines` không có cột "sản phẩm gốc được thay", `duplicate_type=alternative` là **chuyến** thay thế. Không có dữ liệu làm căn cứ tính thanh toán theo giá của sản phẩm gốc | ① Thêm `substituted_from_product_id` vào `delivery_lines` ／ ② Chỉ ghi hàng thay thế vào nội dung giải quyết của báo cáo sự cố |
| C-6 | **Chi phí của hủy bỏ (sau khi xuất hàng)**: cách xử lý phí vận chuyển・tiêu hủy・trả hàng | DEV chỉ viết "xử lý riêng", không có ai ghi nhận gì | ① Phí vận chuyển phán đoán riêng bằng cờ giống giao lại ／ ② ES chịu và không ghi nhận |
| C-7 | **Cách tạo dữ liệu giao hàng gửi số lượng còn lại về trụ sở** | Nhân bản sao chép nơi giao hàng nên không thể hướng về trụ sở. Cũng không có lối vào tạo mới | ① Ngoại lệ cho phép thay chỉ nơi giao hàng sang trụ sở bằng nhân bản ／ ② Thao tác tạo chuyên dụng cho "trả hàng" |
| C-8 | **Việc hiển thị hủy trước khi xuất hàng là "đang xác nhận" trên Web doanh nghiệp** | Điểm khác nhau đã biết của bổ sung 9/24. Cách gọi trùng với trạng thái đang xác nhận (chỉ bản ghi con) | ① Đổi tên hiển thị phía doanh nghiệp thành "đang điều chỉnh" ／ ② Giữ đang xác nhận |
| C-9 | **Bản ghi con đang xác nhận → hủy bỏ** | Tích hợp §13-3・§8-4 viết "hủy bỏ" là lối ra, nhưng DEV §12.2 chỉ có chờ xuất hàng／hủy (điểm khác nhau đã biết) | Vì chưa xuất hàng nên thống nhất thành "hủy" theo DEV là tự nhiên |
| C-10 | **Cách hiển thị trên Web doanh nghiệp khi đang có sự cố** | Trạng thái của bản ghi cha giữ nguyên đã xuất hàng／đã nhận. Khi nào・hiển thị gì cho doanh nghiệp (giữ nguyên ngày giao hàng dự kiến?) | ① Chỉ hiển thị ghi chú "đang xác nhận tình trạng giao hàng" ／ ② Không thay đổi gì cho đến khi giải quyết |
| C-11 | **Quy trình khi bộ phận vận hành xử lý thiếu giao (sáng hôm sau vẫn chưa hoàn thành)** | Chỉ hiển thị ở cần xác nhận, không viết tiếp theo làm gì (xác nhận với tài xế → đăng ký thay kết quả／đăng ký thay sự cố) | Làm "đối ứng thiếu giao" thành lựa chọn 1 trong 2: báo cáo giao hàng thay hoặc đăng ký thay sự cố |

---

## 4. Những điều muốn được quyết định tiếp theo (theo thứ tự ưu tiên)

1. C-1 Cách xử lý liên hệ "chưa nhận được" sau khi coi như hoàn thành
2. C-2 Cách xử lý khi sự cố lại xảy ra ở bản ghi con
3. C-3 Đơn vị giải quyết của nhiều báo cáo sự cố
4. C-4 Giá trị SLA, và có tách chuyến nội bộ・chuyến ủy thác không
5. M-9 Cần xác nhận chưa đặt tài xế là "tại thời điểm lock", "1 tuần trước" hay "ngày trước"

### Trả lời (2026/09/29 hong)

| No | Trả lời | Ghi chú |
|---|---|---|
| C-1 | **Liên hệ Yamato để điều tra**. Khi xác định là thất lạc・chưa giao, **chỉ với đã giao coi như hoàn thành (`completion_source=presumed`), bộ phận vận hành có thể tiến đến "chờ giao lại" "hủy bỏ" bằng giải quyết** (phương án ①・quyết định 2026/09/29) | Phản ánh 2026/09/29 (#27). Trường hợp chỉ một phần của thùng chưa đến thì chưa quyết định (tích hợp §18 No.23) |
| C-2 | **Số nhánh tiếp theo từ bản ghi cha** (không nhân bản từ bản ghi con. Giữ quy tắc cha con 1 tầng) | Phản ánh 2026/09/29 (#28) |
| C-3 | **Giải quyết gộp theo đơn vị giao hàng** (bản ghi con tự động cũng tối đa 1 bản cho 1 lần giao hàng) | Phản ánh 2026/09/29 (#29. Tính duy nhất đổi thành `source_trouble_delivery_id`) |
| C-4 | **Cùng lúc với báo cáo, tạo／không tạo theo từng loại** (kết luận bên dưới) | Phản ánh 2026/09/29 (#30〜#33) |

### Kết luận C-4 (trả lời 2026/09/29 hong)

Bỏ phương án chờ theo thời gian (SLA), quyết định **cùng lúc với báo cáo, tạo／không tạo bản ghi con tự động theo từng loại**. Cùng với đó quyết định thêm 3 điểm sau.

| Loại | Bản ghi con tự động |
|---|---|
| Giao nhầm・vắng mặt・hư hỏng | Tạo cùng lúc với báo cáo |
| Chênh lệch số lượng・chậm trễ・khác | Không tạo |

- Thêm "giao một phần (phần còn lại không gửi)" vào giải quyết (không có ngưỡng・do bộ phận vận hành phán đoán)
- Nếu lần giao hàng chỉ bị chậm có báo cáo giao hàng toàn bộ thì tự động giải quyết
- Thêm "Báo cáo sự cố (chưa giải quyết)" vào cần xác nhận (→ M-5 được giải quyết ở phía đặc tả)

**Đã phản ánh**: `Quyết_định_v2.3_Bổ_sung_Rà_soát_trouble_20260929.md` (#27〜#33)／đặc tả DEV／đặc tả tích hợp (+ HTML・ghi chú hình 4). C-1〜C-3 cũng nằm trong bổ sung này.

Dự kiến sau khi quyết định sẽ sửa theo thứ tự ① đặc tả (DEV・tích hợp・bổ sung quyết định) → ② thiết kế (D-1〜D-9 trước: chi tiết sự cố + modal giải quyết + modal hủy／nhân bản + xác định bản ghi con).
