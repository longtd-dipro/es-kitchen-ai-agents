> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực xem `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế xem mục "G" của sổ cái.

# Quyết định v2.3 phụ lục 5 — 2026/09/29 (thời điểm bắt đầu tạo dữ liệu dự kiến・giao hàng / nút xuất・nhập CSV của THOMAS)

> Phụ lục tiếp theo phụ lục 4 (`Quyết_định_v2.3_Bổ_sung_Vấn_đề_chưa_giải_quyết_và_ủy_thác_đợt_1_20260929.md`・#34〜#51). **Phiên bản vẫn là v2.3**. Đánh số tiếp từ #52. Trích dẫn dạng 〔Quyết định v2.3 #NN〕.
> Nguyên do: câu hỏi của hong ngày 2026/09/29 "Nếu đăng ký tạm thì dữ liệu giao hàng đã được tạo chưa? Hay tạo sau khi đăng ký chính thức?", "Demo đã có CSV xuất / CSV nhập của THOMAS chưa?". **Trả lời cùng ngày: tạo từ cơ sở đã xác nhận (đăng ký chính thức) / đặt nút xuất・nhập CSV.**
> Quy tắc phản ánh vẫn như trước: **① mô tả nghiệp vụ ② bảng state / batch ③ mô hình dữ liệu — sửa đồng thời 3 chỗ**.

---

## 52. Việc bắt đầu tạo dữ liệu dự kiến・dữ liệu giao hàng・hợp đồng con là khi cơ sở được xác nhận (đăng ký chính thức)

| Trạng thái | Dự kiến (`shipping_plans`) | Dữ liệu giao hàng (`deliveries`) | Hợp đồng con (`contract_months`) |
|---|---|---|---|
| Đăng ký tạm (đang "thiết lập" ở tiếp nhận) | **Không tạo** | **Không tạo** | **Không tạo** |
| Đã xác nhận cơ sở (đăng ký chính thức) | **Tạo ngay** từ tháng chu kỳ bắt đầu đến cuối thời hạn thiết lập | **Tạo ngay nếu đã qua ngày bắt đầu đặt hàng** của chu kỳ bắt đầu (nếu chưa qua thì như thường lệ, tạo vào ngày bắt đầu đặt hàng) | **Tạo ngay** phần của tháng chu kỳ bắt đầu (phần đã qua ngày chuẩn tạo) |
| Tạm dừng / khoảng trống từ khi hết dùng thử đến khi triển khai chính thức (28-35) / kết thúc | Không tạo | Không tạo | Không tạo |

- Lý do: trong lúc đăng ký tạm, tuyến giao hàng (kho・công ty giao hàng・lead time・chu kỳ giao hàng) chưa được nhập hoặc còn thay đổi giữa chừng (28-77). Nếu tạo rồi xóa thì sẽ xuất hiện các dự kiến tạm thời trong lịch doanh nghiệp, Web công ty giao hàng ủy thác và ngưỡng số lượng.
- **Việc xác nhận theo đơn vị cơ sở** (chi tiết đơn đăng ký 15.1 #15). Ngay cả trong cùng một đơn đăng ký, hợp đồng của cơ sở đã xác nhận sẽ được tạo lần lượt trước.
- Khi việc xác nhận diễn ra **sau hạn chốt đặt hàng** của chu kỳ bắt đầu đó, theo 28-27, **tự động chỉnh tháng chu kỳ bắt đầu sang chu kỳ kế tiếp rồi mới** tạo.
- Xử lý batch của việc xác nhận không chờ batch hằng ngày, mà ngay sau thao tác xác nhận sẽ chạy theo thứ tự `contract_monthly_generate` → `plan_rollout` → `delivery_materialize` **chỉ cho hợp đồng đó** (xử lý vẫn giữ tính idempotent để batch hằng ngày cũng có thể nhặt được).
- Các thay đổi (đổi gói・mở lại, v.v.) giữ nguyên quy tắc hiện có (tạo lại dự kiến từ tháng áp dụng trở đi・xóa dự kiến khi phê duyệt tạm dừng). Khi xác nhận mở lại (quay về "đăng ký chính thức" từ chu kỳ mở lại・28-65), tạo dự kiến từ chu kỳ mở lại.
- Demo: trong cấu hình giao hàng của hợp đồng hiển thị "Tạo dữ liệu dự kiến・giao hàng: 2026/09/10 xác nhận cơ sở (đăng ký chính thức) → tạo từ chu kỳ tháng 10 (không tạo trong lúc đăng ký tạm)".

## 53. Xuất・nhập CSV của THOMAS từ màn hình

Đặt các nút trên màn hình "Chỉ thị xuất hàng・nhập dữ liệu".

| Nút | Làm gì |
|---|---|
| **Xuất CSV chỉ thị xuất hàng (THOMAS)** | Chọn kho và đối tượng (cửa sổ 2 tuần・phần bổ sung), xuất chỉ thị xuất hàng tại thời điểm đó (các mục theo DEV §19.1) ra CSV. **Dùng để kiểm tra・liên kết thủ công**. Xuất ra **không có nghĩa là đã gửi, và cũng không đặt `locked`** (`locked` chỉ khi gửi thành công・Quyết định v2.1 #3) |
| **CSV** ở dòng lịch sử gửi | Tải lại một lần nữa **chính nội dung đã gửi** của phiên bản đó (`ship_orders.export_file_ref`) |
| **Xuất CSV phiếu vận chuyển (Yamato)** | Xuất theo các mục tạm thời của phụ lục 4 #46 (tên người nhận giữ tại bưu cục = công ty giao hàng ủy thác nhận hàng・cột ghi chú・ngày giao dự kiến = ngày hàng đến bưu cục・thùng) |
| **Nhập CSV thực tế xuất hàng (THOMAS)** | Xử lý theo DEV §19.4. `import_id` theo đơn vị file・xử lý theo từng dòng・dòng lỗi là `import_error` cần xác nhận |
| **Nhập CSV mã vận đơn** | Xử lý theo DEV §19.3 (như trên) |
| **Mẫu (thực tế xuất hàng) / Mẫu (mã vận đơn)** | Xuất file mẫu để nhập (dòng tiêu đề + dòng ví dụ) |
| **Dòng lỗi** ở dòng lịch sử nhập | Xuất ra CSV các dòng không nhập được (số dòng・số giao hàng・lý do) |

- Mã hóa ký tự là **Shift_JIS** (chuyển đổi ở tầng xuất・#45), thứ tự và tên cột là tạm thời cho đến khi nhận được từ THOMAS. File xuất của demo là mẫu (UTF-8・có BOM).
- Thao tác xuất・nhập **chỉ dành cho vận hành (logistics)**. Việc xuất cũng được ghi vào nhật ký kiểm toán (ai・khi nào・cửa sổ nào).

---

## Tình trạng phản ánh

| Tài liệu | Trạng thái |
|---|---|
| Đặc tả DEV (§4.7・§14.8・§15.16・§16.1〜16.3・§19.6) | Đã phản ánh 2026/09/29 |
| Đặc tả tổng hợp v2.3 (§0-2G・§7-3・§10-4・§19-8) + HTML | Đã phản ánh 2026/09/29 |
| Demo giao hàng (Artifact Version 30・`16_運営_配送.html`) | Đã phản ánh 2026/09/29 (nút chỉ thị xuất hàng・nhập dữ liệu, hiển thị cấu hình giao hàng của hợp đồng) |
| Một câu trong modal xác nhận của demo tiếp nhận・phê duyệt (es_apply_demo／es_ops_apply_entity_demo) | Chưa phản ánh |
