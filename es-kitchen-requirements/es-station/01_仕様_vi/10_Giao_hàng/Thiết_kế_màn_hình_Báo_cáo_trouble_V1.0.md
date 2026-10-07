# Tài liệu Thiết kế Màn hình: Báo cáo Sự cố

**Version:** V1.0  
**Date:** 2026-06-15  
**App:** E01 – ES STATION (Flutter Mobile / iOS + Android)  
**Author:** BA Agent  

---

## 1. Danh sách màn hình

| ID màn hình | Loại | Tên màn hình | Ghi chú |
|--------|------|--------------------------|------|
| M01 | Modal | Modal xác nhận liên hệ ES Kitchen | Truy cập được từ cả Home và Lịch sử sửa chữa |
| S02 | Màn hình | Chọn nhà thầu | Chỉ qua M01 |
| S03 | Màn hình | Nhập thông tin báo cáo sự cố | Từ S02 hoặc M01 (qua Lịch sử sửa chữa) |
| M04 | Modal | Modal xác nhận gửi | Chỉ từ S03 |

---

## 2. Luồng điều hướng

```
【Flow chính】
Home
  └─[Chạm Báo cáo sự cố]──▶ M01
                              ├─[Gọi điện cho ES] → Mở ứng dụng điện thoại (ngoài app)
                              ├─[Đến Báo cáo sự cố] ──▶ S02
                              │                         └─[Tiếp theo] ──▶ S03
                              │                                        └─[Gửi] ──▶ M04
                              │                                                      ├─[Gửi] ──▶ Home (gửi thành công)
                              │                                                      └─[Hủy] ──▶ S03
                              └─[Quay lại] → Home

【Flow từ Lịch sử sửa chữa】
Lịch sử sửa chữa (S-REP)
  └─[Chạm Báo cáo sự cố]──▶ M01
                              └─[Đến Báo cáo sự cố] ──▶ S03 (tự động chọn nhà thầu)
                                                       └─ Phần sau giống như trên
```

---

## 3. M01: Modal xác nhận liên hệ ES Kitchen

### Mô tả
Modal đầu vào hiển thị khi chạm "Báo cáo sự cố" từ màn hình Home hoặc màn hình Lịch sử sửa chữa. Cho người dùng chọn giữa "Gọi điện" hoặc "Báo cáo trong app".

| No | Tên mục | Bắt buộc | Loại input | MIN | MAX | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger | Validation | Thời điểm kiểm tra | Error message |
|----|---------|---------|----------|-----|-----|-------------------|----------|---------|---------|----------|-------------------|--------------|
| 1 | Hình ảnh mascot | - | Chỉ đọc | - | - | Luôn hiển thị | Không | Hiển thị hình ảnh mascot ES Kitchen ở trên cùng giữa màn hình | Chỉ xem | - | - | - |
| 2 | Tiêu đề | - | Chỉ đọc | - | - | Luôn hiển thị | Không | Văn bản cố định "Bạn có muốn trao đổi với ES Kitchen không?" | Chỉ xem | - | - | - |
| 3 | Văn bản mô tả | - | Chỉ đọc | - | - | Luôn hiển thị | Không | Văn bản cố định giải thích cách liên hệ ES Kitchen (cần xác nhận nội dung) | Chỉ xem | - | - | - |
| 4 | Nút Gọi điện cho ES | - | Nút | - | - | Luôn hiển thị | Không | Label "Gọi điện cho ES (050-3784-2771)". Tap mở app điện thoại và gọi tới số đã định. Nút primary (xanh) | Click | - | - | - |
| 5 | Nút Báo cáo sự cố | - | Nút | - | - | Luôn hiển thị | Không | Tap chuyển sang S02 (Chọn nhà thầu). Nút secondary (outline) | Click | - | - | - |
| 6 | Nút Quay lại | - | Nút | - | - | Luôn hiển thị | Không | Tap đóng modal và quay lại màn hình trước | Click | - | - | - |

---

## 4. S02: Chọn nhà thầu

### Mô tả
Màn hình chọn 1 nhà thầu cần báo cáo từ danh sách. Có thể lọc bằng tìm kiếm.

| No | Tên mục | Bắt buộc | Loại input | MIN | MAX | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger | Validation | Thời điểm kiểm tra | Error message |
|----|---------|---------|----------|-----|-----|-------------------|----------|---------|---------|----------|-------------------|--------------|
| 1 | Tiêu đề màn hình | - | Chỉ đọc | - | - | Luôn hiển thị | Không | Văn bản cố định "Báo cáo sự cố" | Chỉ xem | - | - | - |
| 2 | Ô tìm kiếm | Tùy chọn | Text | 0 | 100 | Luôn hiển thị | Có | Lọc danh sách real-time theo tên nhà thầu. Cần xác nhận placeholder text | Nhập | - | Phía client | - |
| 3 | Danh sách nhà thầu | ✅ Bắt buộc | Chọn (Radio) | 1 | 1 | Luôn hiển thị | Có | Danh sách nhà thầu đang hợp đồng. Chỉ chọn được 1. Lọc real-time theo ô tìm kiếm. Cần xác nhận văn bản khi danh sách rỗng | Chọn | Phải chọn ít nhất 1 | Phía client | Vui lòng chọn nhà thầu |
| 3.1 | Tên nhà thầu | - | Chỉ đọc | - | - | Mỗi hàng trong danh sách | Không | Hiển thị tên nhà thầu lấy từ API | Chỉ xem | - | - | - |
| 3.2 | Tag trạng thái | - | Chỉ đọc | - | - | Mỗi hàng trong danh sách | Không | Hiển thị trạng thái hiện tại bằng tag màu (cần xác nhận loại tag và màu sắc) | Chỉ xem | - | - | - |
| 4 | Nút Tiếp theo | - | Nút | - | - | Luôn hiển thị | Không | Disabled khi chưa chọn nhà thầu. Tap chuyển sang S03. Nút primary (xanh) | Click | Đã chọn đúng 1 nhà thầu | Phía client | Vui lòng chọn nhà thầu |
| 5 | Nút Quay lại | - | Nút | - | - | Luôn hiển thị | Không | Tap quay lại M01 | Click | - | - | - |

---

## 5. S03: Nhập thông tin báo cáo sự cố

### Mô tả
Màn hình chọn loại sự cố, đính kèm ảnh và nhập nội dung báo cáo. Chuyển đến từ S02 (Chọn nhà thầu) hoặc M01 (qua Lịch sử sửa chữa).

| No | Tên mục | Bắt buộc | Loại input | MIN | MAX | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger | Validation | Thời điểm kiểm tra | Error message |
|----|---------|---------|----------|-----|-----|-------------------|----------|---------|---------|----------|-------------------|--------------|
| 1 | Tiêu đề màn hình | - | Chỉ đọc | - | - | Luôn hiển thị | Không | Văn bản cố định "Báo cáo sự cố" | Chỉ xem | - | - | - |
| 2 | Thông tin nhà thầu đã chọn | - | Chỉ đọc | - | - | Luôn hiển thị | Không | Hiển thị tên nhà thầu + tag trạng thái đã chọn ở S02. Trường hợp vào từ Lịch sử sửa chữa thì tự động điền nhà thầu (cần xác nhận) | Chỉ xem | - | - | - |
| 3 | Loại sự cố | ✅ Bắt buộc | Radio button | - | - | Luôn hiển thị | Có | Chọn 1 trong các tùy chọn bên dưới. Cần xác nhận danh sách đầy đủ (master hay giá trị cố định) | Chọn | Phải chọn ít nhất 1 | Phía client | Vui lòng chọn loại sự cố |
| 3.1 | Nước chảy / Nước tắc ("Nước không ra / không dừng") | - | Radio | - | - | Luôn hiển thị | Có | Sự cố cấp nước / vòi nước | Chọn | - | - | - |
| 3.2 | Cống kêu / Thoát nước ("Cống phát ra tiếng kêu") | - | Radio | - | - | Luôn hiển thị | Có | Sự cố cống thoát nước (cần xác nhận label chính xác) | Chọn | - | - | - |
| 3.3 | Máy điều hòa | - | Radio | - | - | Luôn hiển thị | Có | Sự cố điều hòa không khí | Chọn | - | - | - |
| 3.4 | Khác | - | Radio | - | - | Luôn hiển thị | Có | Sự cố không thuộc các loại trên | Chọn | - | - | - |
| 4 | Ảnh chụp | Tùy chọn | Upload hình ảnh | 0 | ? (cần xác nhận) | Luôn hiển thị | Có | Đính kèm ảnh hiện trường sự cố. Số lượng tối đa, dung lượng, định dạng (JPG/PNG/HEIC…) cần xác nhận. Tap để chọn từ thư viện hoặc camera. Ảnh đã upload hiển thị dạng thumbnail | Click | Định dạng file, dung lượng tối đa (cần xác nhận) | Phía client | Định dạng file không được hỗ trợ (cần xác nhận) |
| 5 | Ghi chú | Tùy chọn | Text | 0 | 500 | Luôn hiển thị | Có | Ô ghi chú tự do. Số ký tự tối đa và sự tồn tại của trường này cần xác nhận (khó đọc trong ảnh) | Nhập | Số ký tự tối đa (cần xác nhận) | Phía client | Vui lòng nhập không quá ○○ ký tự (cần xác nhận) |
| 6 | Nút Gửi | - | Nút | - | - | Luôn hiển thị | Không | Disabled khi chưa chọn loại sự cố. Tap hiển thị M04 (modal xác nhận). Nút primary (xanh) | Click | Đã chọn loại sự cố | Phía client | Vui lòng chọn loại sự cố |
| 7 | Nút Quay lại | - | Nút | - | - | Luôn hiển thị | Không | Tap quay lại S02 (trường hợp vào từ Lịch sử sửa chữa thì quay lại M01 — cần xác nhận) | Click | - | - | - |

---

## 6. M04: Modal xác nhận gửi

### Mô tả
Modal xác nhận cuối cùng hiển thị khi chạm nút "Gửi" ở S03. Yêu cầu người dùng xác nhận lần cuối trước khi gửi.

| No | Tên mục | Bắt buộc | Loại input | MIN | MAX | Điều kiện hiển thị | Có thể sửa | Chi tiết | Trigger | Validation | Thời điểm kiểm tra | Error message |
|----|---------|---------|----------|-----|-----|-------------------|----------|---------|---------|----------|-------------------|--------------|
| 1 | Văn bản xác nhận | - | Chỉ đọc | - | - | Khi M04 hiển thị | Không | Văn bản cố định "Bạn có muốn gửi báo cáo với nội dung này không?" | Chỉ xem | - | - | - |
| 2 | Nút Gửi | - | Nút | - | - | Khi M04 hiển thị | Không | Tap thực hiện gửi API. Trong khi gửi hiển thị loading spinner và disabled nút. Thành công đóng modal và về Home (cần xác nhận toast thành công). Thất bại hiển thị lỗi. Nút primary (xanh) | Click | - | Phía server | Gửi thất bại. Vui lòng thử lại sau |
| 3 | Nút Hủy | - | Nút | - | - | Khi M04 hiển thị | Không | Tap đóng modal, quay lại S03. Dữ liệu đã nhập được giữ nguyên | Click | - | - | - |

---

## 7. Danh mục cần xác nhận

| No | Hạng mục | Mục cần xác nhận |
|----|--------|-------------------------------|
| 1 | S03 Ảnh | Số lượng ảnh tối đa được phép đính kèm |
| 2 | S03 Ảnh | Dung lượng tối đa mỗi ảnh (MB) |
| 3 | S03 Ảnh | Định dạng file hỗ trợ (JPG / PNG / HEIC…) |
| 4 | S03 Loại sự cố | Danh sách đầy đủ loại sự cố (master hay giá trị cố định) |
| 5 | S03 Ghi chú | Có trường ghi chú không? Nếu có, tối đa bao nhiêu ký tự? |
| 6 | M04 Gửi thành công | Sau gửi thành công chuyển về màn hình nào (Home hay màn hình khác)? Có hiện toast thành công không? |
| 7 | S02 Chọn nhà thầu | Chọn 1 (radio) hay nhiều nhà thầu (checkbox)? |
| 8 | S02 Danh sách nhà thầu | Danh sách loại tag trạng thái và màu tương ứng |
| 9 | M01 Điều hướng | Khi vào từ Lịch sử sửa chữa qua M01→S03, nhà thầu có tự động được chọn không? |
| 10 | S03 Quay lại | Khi vào từ Lịch sử sửa chữa, nút "Quay lại" quay về M01 hay S02? |
| 11 | Toàn bộ | Hành vi khi offline (có lưu local khi gửi thất bại không?) |
| 12 | Toàn bộ | Có element nào ẩn/disabled theo role/quyền hạn không? |
