> **Đóng băng (bản gốc・05/10/2026). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay xem tại `docs/決定台帳.md`. Nơi chuyển đến của nội dung tệp này và các quyết định đã bị thay thế xem mục "G" của bảng tổng hợp quyết định.

# Quyết định v2.3 phụ lục 3 — 29/09/2026 (Xem xét lại xử lý sự cố)

> Là phụ lục tiếp theo sau `Quyết_định_v2.3_20260923.md` (lần 4) → `Quyết_định_v2.3_Bổ_sung_Trouble_con_tự_động_20260924.md` (#20〜#26) → `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md`. **Phiên bản vẫn là v2.3**. Đánh số tiếp từ #27. Trích dẫn dưới dạng 〔Quyết định v2.3 #NN〕.
> Nguyên do: C-1〜C-4 và 4 điểm bổ sung của `Thiết_kế_giao_hàng_Kiểm_tra_sót_tập_trung_trouble_v1.md` (29/09/2026). **Trả lời của hong ngày 29/09/2026**.
> **Tài liệu này thay thế #22 (quá hạn thì tự động tạo hợp đồng con)・#25 (batch `trouble_auto_duplicate`)・một phần #26 của phụ lục 24/09.** Nếu có điểm không khớp thì tài liệu này được ưu tiên.
> Quy tắc phản ánh vẫn như trước: **sửa đồng thời 3 chỗ: ① giải thích nghiệp vụ ② bảng state／batch ③ mô hình dữ liệu**.

---

## 27. Khi sau khi coi là hoàn tất lại biết là "chưa giao tới" (C-1)

- Khi doanh nghiệp・cơ sở liên lạc là "chưa giao tới", vận hành đăng ký thay báo cáo sự cố, và **yêu cầu Yamato (công ty vận tải) điều tra**.
- Nếu kết quả điều tra xác định là mất hàng・chưa giao, thì **chỉ riêng `Đã giao` do coi là hoàn tất (`completion_source = presumed`)**, bằng việc xử lý của vận hành (logistics) có thể chuyển sang **`Chờ giao lại`** hoặc **`Hủy bỏ`**.
  - 〔Ghi đè〕Bổ sung thêm một ngoại lệ vào "cách xử lý có thể chọn từ Đã giao chỉ là giao đủ toàn bộ" của #21. **Trường hợp Đã giao theo báo cáo của tài xế (`reported`)・xác nhận nhận hàng của doanh nghiệp (`customer`) vẫn không thuộc đối tượng**.
  - Khi chọn `Chờ giao lại`, giống các lần giao lại khác, tạo hợp đồng con (`Đang xác nhận`)／nếu có hợp đồng con tự động thì dùng lại.
- Việc thanh toán theo thực tế, nên phần đã chuyển thành `Chờ giao lại`・`Hủy bỏ` thì không tính phí. **Nếu thanh toán đã xác định thì không sửa ngược lại, mà điều chỉnh (hoàn tiền・bù trừ) vào tháng sau** (tổng hợp §14-3).
- **Chưa quyết**: Trường hợp chỉ một phần của thùng không giao tới (có cho chuyển sang `Đã giao một phần` hay không) thì chưa quyết định.

## 28. Khi lại xảy ra sự cố ở hợp đồng con (giao lại・giao chia đợt, v.v.) (C-2)

- **Không nhân bản từ hợp đồng con. Tạo số nhánh kế tiếp của hợp đồng cha** (giữ quy tắc cha con 1 tầng).
  - Ví dụ: sự cố ở `DL-…-0014-1` → hợp đồng con mới là `DL-…-0014-2` (con của cha `-0014`). Nội dung (nơi giao hàng・điều kiện giao hàng・khung giờ nhận hàng・`delivery_legs`) được sao chép từ **hợp đồng con xảy ra sự cố**.
- Bản thân hợp đồng con xảy ra sự cố thì giống các lần giao hàng khác, được đóng bằng cách xử lý (`Chờ giao lại`・`Hủy bỏ`, v.v.).
- Hợp đồng con tự động (#30) cũng theo cùng quy tắc, được tạo thành số nhánh kế tiếp của cha.
- Nếu số nhánh vượt quá 9 thì đặt là `DOMAIN_BRANCH_LIMIT`, đưa vào cần xác nhận để vận hành phán đoán.

## 29. Khi một lần giao hàng có nhiều báo cáo sự cố (C-3)

- **Xử lý được thực hiện gộp theo từng lần giao hàng.** Đóng tất cả báo cáo sự cố chưa xử lý của lần giao hàng đó bằng 1 lần xử lý (ghi nhận cùng nội dung xử lý・ngày giờ xử lý・người xử lý vào từng báo cáo).
- **Hợp đồng con tự động chỉ tối đa 1 cái còn hiệu lực (khác `Hủy bỏ`) cho mỗi "một lần giao hàng xảy ra sự cố".** Dù báo cáo thứ 2 đến cũng không tăng hợp đồng con, dùng lại hợp đồng con có sẵn.
  - 〔Ghi đè〕Đổi "mỗi báo cáo sự cố có tối đa 1 hợp đồng con (`UNIQUE(source_trouble_report_id)`)" của 24/09 thành **duy nhất theo lần giao hàng**.

## 30. Hợp đồng con tự động được quyết định tạo hay không tạo theo từng loại ngay khi có báo cáo (C-4)

- **Không chờ thời gian (SLA), tạo hợp đồng con tự động ngay tại thời điểm đăng ký báo cáo sự cố.** Việc tính thời hạn (`auto_duplicate_due_at`)・số phút trong thiết lập vận hành (`trouble_auto_duplicate_after_minutes`)・batch `trouble_auto_duplicate` đều **bị bãi bỏ**.
  - 〔Ghi đè〕Hủy bỏ #22 "Sự cố không được xử lý trước thời hạn thì tạo hợp đồng con tự động"・#25 "Thiết lập mới batch `trouble_auto_duplicate`".
- **Có tạo hay không được quyết định bằng master loại sự cố (6 phân loại).**

| Loại | Hợp đồng con tự động | Lý do |
|---|---|---|
| Giao nhầm | **Tạo** | Hầu như chắc chắn cần thu hồi ＋ giao lại |
| Vắng mặt・không nhận được | **Tạo** | Hầu như chắc chắn cần giao lại |
| Hư hỏng・chất lượng kém | **Tạo** | Cần chuẩn bị hàng thay thế・giao lại |
| Sai lệch số lượng (thiếu・thừa) | **Không tạo** | Nếu chỉ 1〜2 cái thì có khi không gửi. Vận hành chọn "Gửi／Không gửi" khi xử lý, và chỉ tạo hợp đồng con khi gửi (#31) |
| Chậm trễ (kẹt xe・tai nạn・thời tiết) | **Không tạo** | Nếu giao tới trong ngày thì không cần. Tự động xử lý khi có báo cáo giao hàng trong ngày (#32) |
| Khác | **Không tạo** | Vận hành phán đoán riêng từng trường hợp |

- **Loại tại thời điểm báo cáo được quyết định từ các lựa chọn của ứng dụng tài xế** (bảng đối ứng của tổng hợp §13-1). "Thiếu hàng・giao nhầm" nằm giữa 2 phân loại **được coi là loại chưa định nên không tạo**. Sau đó vận hành gắn 6 phân loại, nếu loại đó là "tạo" thì **tạo hợp đồng con tự động tại thời điểm đó**.
- Khi vận hành đăng ký thay thì xét theo loại mà vận hành đã chọn.
- Nội dung hợp đồng con tự động giống ngày 24/09: `Đang xác nhận`・`duplicate_type = trouble_pending`・sao chép snapshot nơi giao hàng・điều kiện giao hàng・khung giờ nhận hàng・`delivery_legs` (không sao chép phiếu giao hàng・phân bổ・tệp đính kèm)・ngày dự kiến và số lượng là tạm・**cho đến khi xác định thì không thuộc đối tượng của chỉ thị xuất hàng・phiếu giao hàng・phân bổ・thanh toán・thông báo・coi là hoàn tất** (#23・#24 vẫn có hiệu lực).
- Dù là loại không tạo, **báo cáo sự cố chưa xử lý vẫn còn trong cần xác nhận** (thiết lập mới phân loại cần xác nhận "Báo cáo sự cố (chưa xử lý)"). Việc sót xử lý được ngăn tại đây.

## 31. Bổ sung vào xử lý "Giao một phần (phần còn lại không gửi)"

- Bổ sung cách xử lý **đóng mà không gửi phần thiếu** khi sai lệch số lượng, v.v.
  - Cha: `Đã giao một phần` (xác định theo số lượng giao thực tế). **Không tạo hợp đồng con**. Nếu có hợp đồng con tự động thì `Hủy bỏ` trong cùng transaction.
  - **Không có ngưỡng** về mức tối đa bao nhiêu cái thì không gửi. Vận hành chọn khi xử lý. **Bắt buộc có lý do**.
- Phần không giao thì không tính phí (tính phí theo thực tế).
- Điểm xuất phát là Đã xuất hàng／Đã nhận (giống giao một phần của #21).

## 32. Nếu sau báo cáo chậm trễ có báo cáo giao hàng thì tự động xử lý

- Với lần giao hàng mà báo cáo sự cố chưa xử lý **chỉ là chậm trễ**, nếu tài xế gửi **báo cáo giao đủ toàn bộ** thì hệ thống tự động xử lý báo cáo chậm trễ đó bằng **"Giao đủ toàn bộ"** (người xử lý là hệ thống・kiểm toán là `actor_type = system`).
- Nếu còn báo cáo chưa xử lý khác ngoài chậm trễ, hoặc số lượng giao khác với dự kiến thì không tự động xử lý (vận hành xử lý).
- Chậm trễ không giao tới trong ngày thì còn lại trong cần xác nhận dưới dạng báo cáo sự cố chưa xử lý. Vận hành xử lý bằng giao lại, v.v.

## 33. Mô hình dữ liệu và API (chi tiết xem DEV §12〜§18)

| Đối tượng | Thay đổi |
|---|---|
| `trouble_types` (thiết lập mới) | `code` (6 phân loại)・`name`・`default_action`・**`auto_child` (boolean)**・`sort_order`・`status`. Giá trị ban đầu là bảng của #30 |
| `trouble_app_reasons` (thiết lập mới) | `app_reason_raw` → `type_code` (`NULL` ＝ loại chưa định. "Thiếu hàng・giao nhầm") |
| `trouble_reports` | **Xóa `auto_duplicate_due_at`**. Cho phép `type_code` là `NULL` (loại chưa định). Thêm `partial_no_resend` vào `resolution`. `resolved_by` có thể là hệ thống |
| `deliveries` | Đổi tên `trouble_timeout` của `creation_source` thành **`trouble_auto`**. Thêm **`source_trouble_delivery_id`** (lần giao hàng xảy ra sự cố). Đổi ràng buộc duy nhất thành **`UNIQUE(source_trouble_delivery_id) WHERE creation_source = 'trouble_auto' AND status <> '取消'`** (bãi bỏ `UNIQUE(source_trouble_report_id)`) |
| `review_items.kind` | Thêm **`trouble_open`** (báo cáo sự cố chưa xử lý・đối tượng là lần giao hàng). Giữ lại `trouble_auto_child_pending` |
| Thiết lập vận hành | Xóa `trouble_auto_duplicate_after_minutes` |
| Batch | Xóa `trouble_auto_duplicate`. Điều kiện của `delivery_presume_complete`／`delivery_detect_missing` (không có báo cáo sự cố chưa xử lý) giữ nguyên |
| Chuyển trạng thái | Thêm: `Đã giao` (`presumed`) → `Chờ giao lại`／`Hủy bỏ` (xử lý của vận hành). `Đã xuất hàng`／`Đã nhận` → `Đã giao một phần` (`partial_no_resend`・không có hợp đồng con) |
| Transaction | **Đăng ký báo cáo sự cố ＝ báo cáo ＋ (nếu là loại `auto_child`) hợp đồng con tự động ＋ 2 mục cần xác nhận ＋ kiểm toán**. Khi gắn lại loại mà thành "tạo" ＝ cập nhật loại ＋ hợp đồng con tự động ＋ cần xác nhận ＋ kiểm toán |

---

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| `01_仕様/10_Giao_hàng/DEV仕様書_…_VI_v2.3.md` | Đã phản ánh 29/09/2026 |
| `01_仕様/10_Giao_hàng/統合仕様書_…_v2.3.md` (＋HTML) | Đã phản ánh 29/09/2026 |
| `01_仕様/10_Giao_hàng/Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` | Đã phản ánh 29/09/2026 (thuật ngữ・§1・§4A-3B・§4A-4B・§4A-4C・§4B・§4C-1・§4D-1・§5.3C・§7・§8 No.7・§11-1・§12-4) |
| `議事録/仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` | Đã phản ánh 29/09/2026 (phần đầu・bảng chuyển trạng thái §8・chú thích thay thế ở §8P・**thiết lập mới §8Q・REQ-DL-915〜926**・lịch sử thay đổi) |
| `01_仕様/10_Giao_hàng/Giao_hàng_Trouble_và_hủy_Luồng_xử_lý_vi.md` | Đã phản ánh 29/09/2026 (phần đầu・§0・§3・§3.1・viết lại §3A・§4・§5・§8・hình §9・§11・đã thống nhất bảng REQ theo số của đặc tả yêu cầu chi tiết) |
| 2 bản demo ＋ thiết kế (artifact) | **Chưa phản ánh** (sẽ sửa cùng với D-1〜D-16・M-1〜M-12 của kiểm tra sót v1) |
