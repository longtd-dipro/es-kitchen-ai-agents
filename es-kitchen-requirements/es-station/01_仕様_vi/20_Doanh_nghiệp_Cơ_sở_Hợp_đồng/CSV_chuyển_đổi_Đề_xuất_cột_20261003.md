# Phương án các cột CSV chuyển đổi (khách hàng hiện có・khoảng 600 công ty) (2026/10/03・phản ánh phản hồi hong 10/05・**phần còn lại là D**)

Quy tắc (mục đích・khóa・cần bổ sung・giá trị mặc định) lấy theo Hợp đồng_01 §9・§9-1 và Sổ cái "CSV chuyển đổi khách hàng hiện có". Tài liệu này chỉ là **phương án các cột**. Khi được phê duyệt sẽ triển khai (Sổ tiếp nhận No.28).

## 0. Dạng thức

- Chia thành **4 file** (vì một cơ sở có nhiều dòng). B〜D nối với cơ sở của A
  - **A. Doanh nghiệp・Cơ sở・Hợp đồng**: 1 dòng = 1 cơ sở. Các cột của doanh nghiệp có cùng giá trị ở các dòng của cùng doanh nghiệp (cách ghi giống CSV đăng ký mới)
  - **B. Thiết bị (cho thuê)**: 1 dòng = 1 cơ sở × 1 dòng máy
  - **C. Người phụ trách**: 1 dòng = 1 người (không giới hạn số người phụ trách: phản hồi hong 2026-10-05)
  - **D. Giá riêng của doanh nghiệp**: 1 dòng = 1 cơ sở × 1 sản phẩm (nhập bằng CSV: phản hồi hong 2026-10-05)
- Nhập theo 2 bước (kiểm tra → đăng ký). **Khóa = ID của Phase 1**. Nếu có thì cập nhật, nếu chưa có thì tạo (lần bảo trì dữ liệu thứ 2 có thể nhập lại cùng file)
- **ID = dùng nguyên ID của Phase 1** (doanh nghiệp・cơ sở. Khách hàng đang đăng nhập bằng ID đó: phản hồi hong 2026-10-05). ID đăng nhập của tài khoản Phase 2 cũng giống vậy.
  Vì thế, nếu không phù hợp quy tắc của Phase 2 (CU + 5 chữ số・doanh nghiệp và cơ sở dùng chung số thứ tự) thì báo lỗi khi nhập (E-1). Số mới cấp ở Phase 2 bắt đầu từ số kế tiếp của số lớn nhất trong các ID đã nhập
- **Giao hàng (khung・kho・công ty giao hàng) không xuất được từ Phase 1** (phản hồi hong 2026-10-05). Không đưa vào CSV chuyển đổi. Bên vận hành nhập sau khi chuyển đổi (E-3). Cho đến khi nhập thì không tạo giao hàng của cơ sở đó (hiển thị "Chưa thiết lập giao hàng" trong Cần bổ sung)
- **Bắt buộc** = nếu thiếu thì lỗi dòng. **Bổ sung** = nhập để trống, hiển thị trong danh sách "Cần bổ sung". **Tùy chọn** = có thể để trống (cũng không hiển thị trong Cần bổ sung)
- Mục chỉ chọn 1 lần trên màn hình nhập (không thành cột): **Tháng Chu kỳ chuyển đổi** (tạo hợp đồng con từ tháng này. Thanh toán trước đó chỉ để tham khảo・§9)

## A. Doanh nghiệp・Cơ sở・Hợp đồng (1 dòng = 1 cơ sở)

### A-1. Khóa・Doanh nghiệp

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| ID doanh nghiệp | Bắt buộc (nếu có doanh nghiệp) | ID của Phase 1 (CU + 5 chữ số). Cơ sở không có doanh nghiệp thì để trống |
| ID cơ sở | Bắt buộc | ID của Phase 1 (CU + 5 chữ số) |
| Tên doanh nghiệp | Bắt buộc (nếu có doanh nghiệp) | |
| Furigana tên doanh nghiệp | Bổ sung | |
| Tên đứng hợp đồng | Tùy chọn | Để trống = tên doanh nghiệp |
| Tên doanh nghiệp nhận hóa đơn | Bổ sung | |
| Mã bưu điện・tỉnh・quận huyện số nhà・tòa nhà của doanh nghiệp | Bắt buộc (tòa nhà là tùy chọn) | 4 cột |
| Số điện thoại doanh nghiệp | Bổ sung | |
| Số FAX doanh nghiệp | Tùy chọn | |
| Nhân viên kinh doanh ES | Tùy chọn | Tài khoản vận hành (Ad + 5 chữ số) |
| ID đại lý | Tùy chọn | AG + 5 chữ số |
| Phương thức thanh toán của doanh nghiệp | Bổ sung | Chuyển khoản tự động / Chuyển khoản ngân hàng / Thẻ tín dụng |
| Tình trạng thủ tục chuyển khoản tự động | Bổ sung | Chưa làm thủ tục / Đang làm thủ tục / Hoàn tất |
| Chu kỳ thanh toán của doanh nghiệp | Bổ sung | Trả hàng tháng / Trả hàng năm |
| Thời điểm phát hành hóa đơn | Bổ sung | Từ 3 tháng trước〜tháng sau (cùng giá trị với CSV đăng ký mới) |
| Đơn vị phát hành hóa đơn | Bổ sung | Phát hành gộp (1 bản cho doanh nghiệp) / Phát hành theo từng cơ sở |
| ID người thanh toán BillOne | Tùy chọn | |
| Nhắc nhở đặt hàng | Tùy chọn | 1 / 0 (để trống = có gửi) |

### A-2. Cơ sở

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| Tên cơ sở | Bắt buộc | |
| Furigana tên cơ sở | Bổ sung | |
| Mã bưu điện・tỉnh・quận huyện số nhà・tòa nhà của cơ sở | Bắt buộc (tòa nhà là tùy chọn) | 4 cột |
| Số điện thoại cơ sở | Bổ sung | |
| Số FAX cơ sở | Tùy chọn | |
| Tầng lắp đặt | Bổ sung | Máy bán hàng tự động là bổ sung, tủ lạnh là tùy chọn (Sổ cái 2026/10/03) |
| Số nhân viên ước tính | Bổ sung | |
| Khung giờ có thể nhận hàng | Bổ sung | `9:00-12:00;13:00-17:00` |
| Địa điểm lắp đặt・điều kiện giao hàng | Tùy chọn | |
| Không kiểm kê (trước đây: không kiểm tra tồn kho. Khi nhập cũng chấp nhận tên cũ) | Tùy chọn | 1 / 0 (để trống = có kiểm kê) |
| Ghi chú cơ sở | Tùy chọn | |

### A-3. Hợp đồng cha・Hợp đồng con (Gói・Course・Tùy chọn (Option)・Giảm giá)

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| Trạng thái cơ sở | Tùy chọn | Đăng ký chính thức / Dự kiến đóng cửa (để trống = đăng ký chính thức). Giá trị sẽ quyết ở E-2 |
| Trạng thái hợp đồng | Tùy chọn | Có hiệu lực / Tạm dừng sử dụng / Đang làm thủ tục hủy (để trống = có hiệu lực). **Giữ riêng với trạng thái cơ sở** (hong 2026-10-05). Giá trị sẽ quyết ở E-2 |
| Thời gian tạm dừng・tháng tiếp tục | Tùy chọn | Khi trạng thái hợp đồng = tạm dừng sử dụng (yyyy-mm〜yyyy-mm・tiếp tục yyyy-mm) |
| Ngày hủy | Tùy chọn | Khi trạng thái hợp đồng = đang làm thủ tục hủy (yyyy-mm-dd) |
| Loại hợp đồng | Tùy chọn | Triển khai chính thức / Dùng thử (để trống = triển khai chính thức). Khi là dùng thử thì nhập cả Tháng kết thúc dùng thử |
| Tháng năm bắt đầu hợp đồng ban đầu | Bổ sung | yyyy-mm. Thời gian sử dụng tối thiểu・mốc tính tiền phạt vi phạm. Để trống = "ước tính" (§9) |
| Nơi nhận hóa đơn | Bắt buộc | Doanh nghiệp / Cơ sở này |
| Phương thức thanh toán・chu kỳ thanh toán・thời điểm phát hành của cơ sở | Bổ sung (khi nơi nhận hóa đơn = cơ sở này) | 3 cột |
| ID Gói | Bắt buộc | ES + 6 chữ số |
| Course | Tùy chọn | **Để trống = ES Lite** (§9). Nếu B có dòng máy máy bán hàng tự động thì ES Lite (máy bán hàng tự động), nếu không thì ES Lite (tủ lạnh) (phản hồi hong 2026-10-05). Nếu muốn Standard thì đổi hàng loạt bằng CSV sau chuyển đổi (§9) |
| Thế hệ giá đang áp dụng | Bổ sung | Ví dụ "Sửa đổi lần thứ ba" (tên thế hệ giá của Master gói). Để trống = thế hệ hiện tại |
| Giá | Tùy chọn | Giá thông thường / Giá riêng của doanh nghiệp (để trống = giá thông thường). Đơn giá của giá riêng doanh nghiệp nằm ở file D |
| Quyết toán | Tùy chọn | Theo lượng dùng / Mua đứt (để trống = theo lượng dùng) |
| Tùy chọn (Option) | Tùy chọn | Nối các ID Tùy chọn (Option) bằng `;` |
| Ghi đè số tiền Tùy chọn (Option) | Tùy chọn | `OP000004=0;OP000037=8000` (khách hàng hiện có của ES-QR 0 yên, v.v.・REQ-CT-304) |
| Giảm giá | Tùy chọn | Nối các ID giảm giá bằng `;` (Giảm giá chuyển đổi DC000021 cũng ở đây) |
| Dùng tiền mặt・Khách・ES-QR | Tùy chọn | 3 cột. 1 / 0 (để trống = quyết định từ Tùy chọn (Option)) |
| Số suất ăn tối đa mỗi ngày | Tùy chọn | |

### A-4. Điều kiện giao hàng (không nhập tuyến giao hàng・§0)

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| Thứ không giao được | Tùy chọn | `Thứ Hai;Thứ Tư` |
| Khi không thể giao hàng | Bổ sung | Cùng giá trị với CSV đăng ký mới |
| Xử lý sản phẩm có hạn tiêu dùng ngắn | Bổ sung | Cùng giá trị với CSV đăng ký mới |

### A-5. Tài khoản

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| Có cấp tài khoản không | Tùy chọn | 1 / 0 (để trống = 1). Tạo nhưng không gửi email (hướng dẫn đăng nhập sẽ gửi riêng theo thời điểm release) |

## B. Thiết bị (cho thuê) (1 dòng = 1 cơ sở × 1 dòng máy)

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| ID cơ sở | Bắt buộc | Nối với cơ sở của A |
| ID dòng máy | Bắt buộc | Master dòng máy |
| Số lượng máy | Bắt buộc | |
| Ngày cho thuê | Bổ sung | yyyy-mm-dd. Để trống = "Chưa nhập ngày cho thuê"・thời gian sử dụng tối thiểu "ước tính" từ tháng năm bắt đầu hợp đồng ban đầu (§9) |
| Ghi chú | Tùy chọn | |

Khóa = ID cơ sở + ID dòng máy (nếu giống nhau thì ghi đè). Số lượng máy bán hàng tự động trở thành số lượng của Thuê máy bán hàng tự động (OP000037).

## C. Người phụ trách (1 dòng = 1 người)

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| ID doanh nghiệp・ID cơ sở | Bắt buộc (một trong hai) | Người phụ trách của doanh nghiệp chỉ ghi ID doanh nghiệp, người phụ trách của cơ sở ghi ID cơ sở |
| Loại | Bắt buộc | Người phụ trách chính / Người phụ trách thanh toán / Người phụ trách phụ |
| Tên | Bắt buộc | |
| Furigana | Bổ sung | |
| Email | Bổ sung | Nếu không có email của người phụ trách chính của doanh nghiệp thì không tạo được tài khoản (hiển thị trong Cần bổ sung) |
| Điện thoại | Bổ sung | |

- Mỗi doanh nghiệp・cơ sở có **1 người phụ trách chính** (từ 2 người trở lên là lỗi). Nếu không có người phụ trách thanh toán thì giống người phụ trách chính. Số người phụ trách phụ không giới hạn
- Khi nhập lại thì **thay thế người phụ trách của doanh nghiệp・cơ sở đó bằng nội dung file** (vì không có mục nào làm khóa được). Không gửi hướng dẫn hướng dẫn sử dụng (M13)

## D. Giá riêng của doanh nghiệp (1 dòng = 1 cơ sở × 1 sản phẩm)

| Cột | Phân loại | Cách nhập・ghi chú |
|---|---|---|
| ID cơ sở | Bắt buộc | Cơ sở có Giá = Giá riêng của doanh nghiệp ở A |
| Mã hàng | Bắt buộc | Master sản phẩm |
| Đơn giá (chưa thuế) | Bắt buộc | Yên・số nguyên |

Khóa = ID cơ sở + Mã hàng (nếu giống nhau thì ghi đè). Cơ sở có giá riêng của doanh nghiệp ở A nhưng không có dòng nào ở D thì hiển thị trong Cần bổ sung.

## Danh sách Cần bổ sung (Web vận hành)

- Sau khi nhập, hiển thị theo từng cơ sở **các dòng có cột bổ sung để trống** (liệt kê tên các cột còn thiếu). Khi điền trên màn hình thì biến mất khỏi danh sách
- Bộ lọc: cột còn thiếu・doanh nghiệp・file đã nhập

## E. Cần xác nhận (khách hàng・hong)

1. **Dạng ID của Phase 1**: doanh nghiệp・cơ sở đều là **CU + 5 chữ số** phải không. **Doanh nghiệp và cơ sở có dùng chung một số không** (Phase 2 là 1 số thứ tự duy nhất). Nếu khác thì sửa quy tắc đánh số của Phase 2
2. **Giá trị trạng thái**: Trạng thái của Phase 1 **chỉ có ở doanh nghiệp** (2026-10-05 hong "CSV: 77 Trạng thái"): Đăng ký chính thức / Đăng ký tạm / Tạm dừng (không đăng nhập được・người dùng cũng không chọn được ID cơ sở・không đặt hàng được) / Đã hủy (như trên) / Đã xóa (như trên). Không có trạng thái riêng của cơ sở・hợp đồng. → **Xử lý (hong 2026-10-05)**: Đăng ký chính thức = Có hiệu lực / Đăng ký tạm = nhập giữ nguyên Đăng ký tạm / Tạm dừng = Tạm dừng sử dụng (thời gian tạm dừng là Cần bổ sung) / Đã hủy・Đã xóa = không nhập. Các cột "Trạng thái cơ sở" "Trạng thái hợp đồng" ở A được thay bằng 1 cột "Trạng thái doanh nghiệp (Phase 1)"
3. **Cách nhập giao hàng** (đề xuất): sau khi chuyển đổi, bên vận hành tạo và nhập **CSV chỉ cho giao hàng** (1 dòng = 1 cơ sở × nhóm nhiệt độ: phương thức giao hàng・khung・kho・trung chuyển・công ty giao hàng ①②). Vì nhập từng cái trên màn hình cho khoảng 600 cơ sở là quá nặng
4. **Mật khẩu**: dù ID giống nhau, mật khẩu là (a) tất cả đặt lại (email hướng dẫn đăng nhập có link thiết lập), hay (b) mang theo của Phase 1 (chỉ khi đọc được dạng lưu của Phase 1)
5. Giữa lần chuyển đổi thứ 1 và thứ 2, không tạo doanh nghiệp・cơ sở trên môi trường production của Phase 2 (vì số sẽ trùng với khách hàng mới của Phase 1). Như vậy có được không
