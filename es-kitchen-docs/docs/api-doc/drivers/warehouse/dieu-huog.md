Dưới đây là bảng phân tích toàn bộ các hành động và luồng điều hướng (User Flow) dựa trên hệ thống các **đường dẫn mũi tên màu đỏ** trong sơ đồ luồng giao diện của bạn:

---

### 1. Luồng từ Màn hình Trang chủ sang Màn hình Chi tiết Nhận hàng

* **Màn hình gốc:** Màn hình Trang chủ chính (`DA_HOME_001` - góc trên cùng bên trái)
* **Thành phần tương tác:** Thẻ thông tin kho hàng đầu tiên **「オージーフーズ倉庫」** (Trạng thái: 未受取 - Chưa nhận)
* **Hành động:** Click
* **Màn hình đích:** Màn hình Danh sách Nhận hàng (`DA_RECV_001` - chưa check chọn)
* **Mô tả logic/Action:** Người dùng nhấn vào một kho hàng chưa nhận ở trang chủ để vào màn hình chi tiết, chuẩn bị thực hiện quy trình quét mã vạch hoặc kiểm đếm nhận hàng.

---

### 2. Luồng xử lý khi Nhấn "Hoàn thành" nhưng CHƯA check hết hàng hóa (Xuất hiện cảnh báo lỗi)

* **Màn hình gốc:** Màn hình Danh sách Nhận hàng (`DA_RECV_001` - chưa check chọn)
* **Thành phần tương tác:** Nút **「完了」** (Hoàn thành) ở thanh cố định dưới đáy màn hình.
* **Hành động:** Click (khi vẫn còn các item chưa được tick chọn)
* **Màn hình đích:** Pop-up Cảnh báo lỗi (Modal màu trắng viền đỏ bên trái màn hình)
* **Mô tả logic/Action:** Hệ thống kiểm tra điều kiện (Validation). Vì trạng thái danh sách vẫn còn những thùng hàng chưa được xác nhận, hệ thống ngăn chặn việc hoàn tất và hiển thị một pop-up cảnh báo lỗi để yêu cầu người dùng kiểm tra lại.

---

### 3. Luồng xử lý khi Nhấn "Hoàn thành" nhưng CHƯA check hết hàng hóa (Mở Modal xác nhận liên lạc)

* **Màn hình gốc:** Màn hình Danh sách Nhận hàng (`DA_RECV_001` - chưa check chọn)
* **Thành phần tương tác:** Nút **「完了」** (Hoàn thành) ở thanh cố định dưới đáy màn hình.
* **Hành động:** Click (Đường dẫn rẽ nhánh thứ hai hướng lên trên)
* **Màn hình đích:** Màn hình Modal Xác nhận Nhận hàng một phần (`DA_RECV_001 - 02` - trạng thái nút bấm bị khóa)
* **Mô tả logic/Action:** Điều hướng người dùng đến một hộp thoại hỏi: "Bạn đã hoàn thành nhận hàng chưa?". Do hệ thống phát hiện trạng thái chưa check hết (全てチェックではない), nút xác nhận hoàn thành một phần mặc định sẽ bị vô hiệu hóa (disabled).

---

### 4. Luồng Kích hoạt nút Hoàn thành một phần bằng Checkbox

* **Màn hình gốc:** Màn hình Modal Xác nhận Nhận hàng một phần (`DA_RECV_001 - 02`)
* **Thành phần tương tác:** Checkbox **「未受取分は、ESキッチンへ連絡済みです。」** (Đã liên lạc với ES Kitchen về phần chưa nhận)
* **Hành động:** Click / Tick chọn
* **Màn hình đích:** Màn hình Modal trạng thái Active (`DA_RECV_001 - 3`)
* **Mô tả logic/Action:** Thao tác này nhằm mở khóa điều kiện. Khi người dùng xác nhận bằng cách tích chọn checkbox, nút **「一部未受取のまま完了」** (Hoàn thành và chấp nhận một phần chưa nhận) từ trạng thái mờ/khóa sẽ được kích hoạt (Active) sang màu xanh nhạt để cho phép nhấn.

---

### 5. Luồng Hoàn tất đơn hàng thiếu (Sau khi đã liên lạc hỗ trợ)

* **Màn hình gốc:** Màn hình Modal trạng thái Active (`DA_RECV_001 - 3`)
* **Thành phần tương tác:** Nút **「一部未受取のまま完了」** (Hoàn thành và chấp nhận một phần chưa nhận)
* **Hành động:** Click
* **Màn hình đích:** Màn hình Trang chủ trạng thái Cập nhật (Góc trên cùng bên phải)
* **Mô tả logic/Action:** Ghi nhận hoàn tất xử lý sự cố. Hệ thống đóng modal, đưa người dùng quay trở lại màn hình trang chủ. Trạng thái tiến độ trong ngày sẽ được cập nhật lại tương ứng.

---

### 6. Luồng xử lý khi ĐÃ check chọn toàn bộ hàng hóa thành công

* **Màn hình gốc:** Màn hình Danh sách Nhận hàng (`DA_RECV_001` - Trạng thái đã tick chọn thủ công toàn bộ checkbox của các mã vạch)
* **Thành phần tương tác:** Nút **「完了」** (Hoàn thành) ở thanh dưới đáy màn hình.
* **Hành động:** Click (khi điều kiện: 全てチェック/All checked được thỏa mãn)
* **Màn hình đích:** Màn hình Thông báo hoàn thành thành công (`DA_RECV_003` - có thanh banner thông báo màu xanh lá cây ở trên cùng)
* **Mô tả logic/Action:** Hệ thống kiểm tra thấy toàn bộ danh sách hàng hóa đã được xác nhận đầy đủ. Quy trình nhận hàng thành công, màn hình chuyển sang trạng thái Read-only và hiển thị biểu tượng Check xanh kèm dòng chữ "Đã hoàn thành nhận hàng vào lúc...".

---

### 7. Luồng chuyển đổi Tab trên màn hình Lịch trình/Danh sách giao hàng

* **Màn hình gốc:** Màn hình Lịch trình/Danh sách giao hàng (`DA_LIST_001_Kho` - góc dưới cùng bên trái)
* **Thành phần tương tác:** Tab điều hướng phụ ở trên cùng (Cụ thể là click chuyển giữa các trạng thái Kho nhận / Chưa giao / Đã giao hoàn thành)
* **Hành động:** Click Tab
* **Màn hình đích:** Màn hình Lịch trình tương ứng với bộ lọc đã chọn (`DA_RECV_003` - hiển thị danh sách các kho đã xử lý xong)
* **Mô tả logic/Action:** Chuyển đổi bộ lọc dữ liệu (Filter Tab). Giúp người dùng quản lý và xem nhanh danh sách các trạm/kho hàng dựa theo tiến độ trạng thái công việc của họ trong ngày hoặc trong tuần.