# Các vấn đề giao hàng chưa giải quyết và phương án giải quyết v1 (ngoài sự cố + trường hợp chặng 1 là đơn vị giao hàng ủy thác)

- Ngày tạo: 2026/09/29
- Đối tượng: các mục chưa quyết còn lại ở §18・§20 của đặc tả tổng hợp, C-5〜C-11・M-9 của `Thiết_kế_giao_hàng_Kiểm_tra_sót_tập_trung_trouble_v1`, trường hợp chặng 1 do đơn vị giao hàng ủy thác đảm nhận
- Phương châm: chọn làm đề xuất **phương án có thể xử lý bằng các màn hình và thành phần của thiết kế hiện tại (thiết kế màn hình Quản lý giao hàng Web Vận hành, bản 2026/09/28)**. Hạn chế tối đa việc tạo màn hình mới
- **Chỉ đưa ra phương án. Chưa phản ánh vào đặc tả・demo・thiết kế**

Chú thích: tên màn hình là tên artboard của thiết kế. 〔Đề xuất〕 là phương án thứ nhất.

---

## A. Các mục cần khách hàng (vận hành) quyết định

### A-1. Hiển thị lịch dự kiến đến mức nào trên trang chuyên dụng của đơn vị giao hàng ủy thác

- **Vấn đề**: Thời điểm chốt (hạn chốt đơn) đã được quyết, nhưng chưa quyết hiển thị trước bao nhiêu tháng và những mục nào. Không thể quyết định màn hình và quyền hạn của Web đơn vị giao hàng ủy thác.
- **〔Đề xuất〕**
  - **Dữ liệu giao hàng đã chốt (sau hạn chốt đơn)**: toàn bộ mục (tên cơ sở・địa chỉ・ngày giao・nhóm nhiệt độ・số lượng・điều kiện giao hàng・phiếu vận chuyển).
  - **Dự kiến (trước hạn chốt)**: **đến chu kỳ tháng sau**, **chỉ ngày giao・tên cơ sở・nhóm nhiệt độ・số lượng đơn (không hiển thị số lượng hàng)**. Gắn dấu "Dự kiến" giống Web doanh nghiệp.
  - Chỉ thấy **những đơn giao hàng có chặng (leg) do công ty mình phụ trách**.
- Phương án khác: không hiển thị dự kiến, chỉ hiển thị phần đã chốt (an toàn nhất, nhưng bên ủy thác khó sắp xếp nhân lực).
- **Thiết kế**: dùng nguyên "Lịch trình Tháng・Tuần・Ngày" của Vận hành cho Web đơn vị giao hàng ủy thác (theme carrier・xanh lá). Cố định bộ lọc "Đơn vị giao hàng ủy thác" là công ty mình, và ẩn cột số lượng của dự kiến. Không có màn hình mới.

### A-2. Điều kiện để hệ thống tự động cảnh báo sản phẩm có hạn sử dụng ngắn

- **Vấn đề**: Đã quyết việc tách đơn do vận hành phán đoán, nhưng chưa có điều kiện (ngưỡng) để hệ thống cảnh báo "có chứa sản phẩm hạn sử dụng ngắn".
- **〔Đề xuất〕** Đưa vào danh sách cần xác nhận khi **số ngày từ ngày xuất hàng đến ngày giao hàng vượt quá số ngày bằng số ngày hạn sử dụng của sản phẩm trừ đi số ngày an toàn**.
  - Giá trị sử dụng: `shelf_life_days` của master sản phẩm (đã có). Số ngày an toàn là 1 thiết lập chung toàn công ty (mặc định 2 ngày).
  - Xét khi lead time kéo dài do chuyển lịch・đổi kho・nhân bản.
- **Thiết kế**: Thêm 1 phân loại "Lưu ý hạn sử dụng" vào phân loại của danh sách cần xác nhận. Chi tiết dùng lại cùng dạng với "Chi tiết cần xác nhận (không thể tạo lịch dự kiến)" (nội dung + bảng xem xét ngày thay thế + xử lý).

### A-3. "Thời điểm" đơn đặt vật tư được nhập vào là khi nào

- **Vấn đề**: Chưa quyết là mỗi lần chốt giỏ hàng, hay gộp theo hạn chốt hằng tuần. Không xác định được thời điểm tạo dữ liệu giao hàng của vật tư.
- **〔Đề xuất〕** **Tạo dữ liệu giao hàng mỗi lần chốt giỏ hàng** (đúng như tên "giao hàng theo từng lần"). Chỉ thị xuất hàng được gửi gộp theo lần gom hằng ngày (catch-up) hiện có nên chỉ thị đến kho không tăng. **Khi vật tư cùng cơ sở・cùng ngày giao thành 2 đơn thì gộp thành 1 đơn** (gộp ngay ở giai đoạn dữ liệu giao hàng để không mâu thuẫn với quy tắc không xuất hàng gộp).
- Phương án khác: tạo gộp theo hạn chốt 1 lần/tuần (giảm số lượng đơn, nhưng khó đáp ứng vật tư gấp).
- **Thiết kế**: Không thay đổi. Hiển thị là "Chuyến vật tư" trong danh sách Quản lý xuất hàng・giao hàng (đã có).

### A-4. Khi đơn đăng ký thay đổi của doanh nghiệp bị để "Đang yêu cầu" mà không xử lý

- **Vấn đề**: Chỉ mới quyết là không tự động từ chối. Chưa có thời hạn và nhắc nhở.
- **〔Đề xuất〕**
  - **Thời hạn xử lý = hạn chốt đơn của đơn giao hàng đó** (vì sau hạn chốt không thể đổi ngày).
  - **3 ngày trước hạn chốt** đưa vào danh sách cần xác nhận "Đến hạn đơn đăng ký thay đổi". Nếu qua hạn chốt vẫn chưa xử lý thì **giữ lại trong danh sách cần xác nhận cho đến khi vận hành xử lý** (không tự động từ chối).
- **Thiết kế**: Đã có. Dùng nguyên "Thời hạn xử lý … còn 17 ngày" của Chi tiết đơn đăng ký thay đổi và phân loại "Đến hạn đơn đăng ký thay đổi" trong danh sách cần xác nhận. Chỉ cần ghi "3 ngày trước" vào đặc tả.

### A-5. Ý nghĩa của lead time giao hàng theo từng lần (vật tư)

- **Vấn đề**: Đang lẫn 2 nghĩa: "số ngày từ khi chốt đơn đến khi giao" và "ngày xuất hàng tính ngược từ ngày giao".
- **〔Đề xuất〕** **Thống nhất theo "ngày xuất hàng = ngày giao − lead time" như các mẫu giao hàng khác**. Ngày giao vật tư là "**ngày giao được đầu tiên đáp ứng lead time, tính từ ngày sau ngày đặt hàng**".
- **Thiết kế**: Cột "Lead time" ở dòng vật tư của Thiết lập giao hàng theo hợp đồng giữ nguyên. Chỉ thêm 1 dòng giải thích dưới cột.

### A-6. Không có mục để ghi nhận hàng thay thế

- **Vấn đề**: Đã quyết hàng thay thế "thanh toán theo giá của sản phẩm gốc", nhưng không có mục lưu lại đã thay cái gì bằng cái gì.
- **〔Đề xuất〕** Thêm **`substituted_from_product_id` (sản phẩm gốc được thay thế)** vào `delivery_lines`. 1 dòng = sản phẩm thực tế đã giao, thanh toán tính theo đơn giá của sản phẩm gốc.
- **Thiết kế**: Thêm **cột "Sản phẩm gốc"** vào bảng "Chênh lệch kiểm hàng" ở tab Thực tế của Chi tiết dữ liệu giao hàng. Khi chọn "Giao đủ bằng hàng thay thế" trong modal giải quyết sự cố thì cho chọn sản phẩm.

### A-7. Chi phí khi hủy sau khi đã xuất hàng

- **Vấn đề**: Sản phẩm không thanh toán (đã quyết). Chưa có cách xử lý cước vận chuyển・hủy bỏ・trả hàng.
- **〔Đề xuất〕**
  - Cước vận chuyển: dùng cờ "**Có thanh toán / không thanh toán cước**" giống giao lại cho cả trường hợp hủy (mặc định là "không", bắt buộc nhập lý do).
  - Hủy bỏ: ghi vào `disposed_qty` (đã có).
  - Trả hàng: gửi bằng chuyến trả hàng ở A-8.
- **Thiết kế**: Chỉ hiển thị cờ cước vận chuyển khi chọn "Hủy" trong modal giải quyết sự cố (dự kiến bổ sung ở mục D-2 của bảng kiểm tra thiếu sót).

### A-8. Cách tạo dữ liệu giao hàng để gửi hàng còn lại về trụ sở

- **Vấn đề**: Nhân bản sẽ sao chép nguyên nơi nhận hàng nên không hướng về trụ sở được. Cũng không có lối vào để tạo mới.
- **〔Đề xuất〕** **Thêm "Trả hàng" vào lý do nhân bản, và chỉ khi là trả hàng thì cho đổi nơi nhận hàng thành "nơi nhận hàng trả về"**. Nơi nhận hàng trả về được đăng ký 1 bản ghi trụ sở trong master kho để chọn. Số lượng là số lượng còn lại, **không thuộc đối tượng thanh toán**.
- **Thiết kế**: Thêm 1 lựa chọn "Trả hàng" vào radio lý do của modal nhân bản (dự kiến bổ sung ở D-7), và chỉ hiển thị select nơi nhận hàng khi chọn.

### A-9. Cách hiển thị trên Web doanh nghiệp khi đang có sự cố・sau khi hủy

- **Vấn đề**: Có phương án hiển thị "Đang xác nhận" trên Web doanh nghiệp cho đơn bị hủy trước khi xuất hàng, nhưng trùng với tên trạng thái "Đang xác nhận" (trạng thái chỉ dành cho đơn con).
- **〔Đề xuất〕** **Giữ riêng tên hiển thị cho Web doanh nghiệp, tách khỏi trạng thái**.

| Trạng thái・tình huống phía vận hành | Hiển thị trên Web doanh nghiệp |
|---|---|
| Hủy (có chuyến thay thế) | "Đang điều chỉnh ngày giao" |
| Có báo cáo sự cố chưa giải quyết (trạng thái vẫn là đã xuất hàng, v.v.) | Giữ nguyên trạng thái + ghi chú "Đang xác nhận tình trạng giao hàng" |
| Đơn con (Đang xác nhận) | "Đang chuẩn bị giao lại" |
| Đơn cha ở trạng thái chờ giao lại・đã giao một phần | "Đã giao một phần" "Dự kiến giao lại" |

- **Thiết kế**: Chỉ là nội dung chữ của badge trên lịch Web doanh nghiệp (theme company-admin). Không thay đổi Web Vận hành.

### A-10. Khi nào đưa vào danh sách cần xác nhận việc chưa thiết lập tài xế

- **Vấn đề**: Đang lẫn 3 mốc: thời điểm gửi chỉ thị xuất hàng (DEV), 1 tuần trước (§8-5 tổng hợp), ngày hôm trước (thiết kế).
- **〔Đề xuất〕** **Thống nhất danh sách cần xác nhận về 1 mốc "ngày trước ngày giao"** (đúng như thiết kế). Trước đó đã có thể thấy qua badge "Chưa phân công N đơn" ở hiển thị tháng・tuần là đủ. Sửa "1 tuần trước" ở §8-5 tổng hợp và "thời điểm gửi" ở DEV §13.1.
- **Thiết kế**: Không thay đổi (thiết kế hiện tại chính là phương án đề xuất).

### A-11. Xác nhận 6 mục tạm thời

- **Vấn đề**: Ý nghĩa của `HU`, mã kho, nguồn dữ liệu ngày lễ, tên chính thức của Yamato・Thomas, việc không thu hồi túi giữ lạnh, số điện thoại liên hệ vẫn đang là giá trị tạm.
- **〔Đề xuất〕** **Triển khai với giá trị tạm**, gom 6 mục vào 1 bảng xác nhận gửi cho vận hành. Khi có phản hồi thì thay nội dung. Không mục nào ảnh hưởng đến cấu trúc màn hình.
- **Thiết kế**: Không thay đổi.

---

## B. Các mục cần xác nhận với nhà cung cấp (vendor)

### B-1. Chỉ thị xuất hàng của Thomas (I/F hủy・các cột CSV・mã hóa ký tự)

- **Vấn đề**: Chưa xác nhận được có I/F hủy hay không, định nghĩa các cột CSV, và có hỗ trợ UTF-8 hay không.
- **〔Đề xuất〕**
  - Hủy đã được **chốt theo phương thức gửi lại (phiên bản mới có số lượng 0)**. Dù có I/F cũng không dùng.
  - CSV **triển khai với các mục tối thiểu của DEV §19.1, thiết kế để chỉ phần xuất ra có thể thay thế**. Khi nhận được thứ tự・tên cột thì chỉ sửa phần xuất ra.
  - Nếu không hỗ trợ UTF-8 thì **chuyển sang Shift_JIS khi xuất**.
- **Thiết kế**: Chỉ hiển thị "File đã gửi・phiên bản・kết quả" ở màn hình tình trạng gửi chỉ thị xuất hàng (D-14 bảng kiểm tra thiếu sót). Không hiển thị mã hóa ký tự trên màn hình.

### B-2. Các mục chuyển cho Yamato

- **Vấn đề**: Chưa xác định tên người nhận khi giao đến bưu cục, ngày giao dự kiến, và CSV của Thomas có cột cần cho phiếu vận chuyển của Yamato hay không.
- **〔Đề xuất〕 (phương án với tiền đề sẽ xác nhận với Yamato)**
  - Tên người nhận khi giao đến bưu cục: **đơn vị giao hàng ủy thác sẽ đến nhận**. Ghi tên cơ sở và Số giao hàng vào ô ghi chú.
  - Ngày giao dự kiến: **ngày hàng đến bưu cục** (tính từ giá trị tham khảo lead time của chặng 1).
  - Nếu CSV của Thomas không có cột thì **xuất riêng 1 CSV dành cho phiếu vận chuyển** (dạng nhập vào hệ thống phát hành phiếu vận chuyển của Yamato).
- **Thiết kế**: Dùng dòng điểm trung chuyển (mã bưu cục) trong tab Tuyến giao hàng của Chi tiết dữ liệu giao hàng. Không thay đổi.

---

## C. Công việc phía chúng ta

| No | Nội dung | Xử lý |
|---|---|---|
| C-1 | Danh sách mục của doanh nghiệp・cơ sở・hợp đồng・hợp đồng con chưa phản ánh v2.1 trở đi | Bổ sung các mục liên quan đến giao hàng (nhiều dòng khung giờ nhận hàng・`delivery_regime`・`service_form`・số lượng và giai đoạn của dự kiến, v.v.) vào `項目一覧_生成スクリプト/items.py` rồi tạo lại |
| C-2 | Ước tính lưu trữ ảnh và số lượng cao điểm | Ước tính tạm: 1 ngày 600 đơn (2 kho × 300 đơn) × 4 ảnh × 0,3MB ≒ **khoảng 0,7GB/ngày・khoảng 21GB/tháng**. Ảnh sự cố lưu 12 tháng nên **khoảng 260GB**. Xác nhận con số này với vận hành・hạ tầng |
| C-3 | Bảng của §18 No.3 trong đặc tả tổng hợp (chưa xác nhận đặc tả hiện tại của màn hình Thanh toán・Hợp đồng/Đơn đăng ký) đã cũ | Phản ánh phần đã tiến triển nhờ các quyết định ngày 9/25 (phát hành hóa đơn) và 9/28 (liên quan đơn đăng ký), chuyển thành "Giải quyết một phần" |

---

## D. Khi công ty giao hàng 1 (chặng 1) là đơn vị giao hàng ủy thác

**Điểm cần xác nhận trước: trường hợp B (chặng 1 là ủy thác và có trung chuyển) có thực sự tồn tại không.** Nếu không có thì một phần D-2・D-3 là không cần thiết.

| Trường hợp | Ví dụ | Xử lý hiện tại |
|---|---|---|
| A. Không trung chuyển・đơn vị ủy thác đến kho lấy hàng | Kho →(Eisei Logi)→ Cơ sở | Gần như đã đáp ứng. DEV không có việc đánh số phiếu vận chuyển ở ES (D-1) |
| B. Chặng 1 là ủy thác・có trung chuyển | Kho →(Ủy thác A)→ Điểm trung chuyển →(Ủy thác B)→ Cơ sở | Chưa đáp ứng (D-2〜D-4) |
| C. Chặng 1 là ủy thác・cuối cùng là Yamato | Kho →(Ủy thác)→ Bưu cục →(Yamato)→ Cơ sở | Gần như đã đáp ứng. Không có phân công cho chặng 1 (D-2) |

### D-1. Đánh số phiếu vận chuyển của chuyến lấy hàng ở ES (trường hợp A)

- **Vấn đề**: Đã quyết ở quyết định #55 nhưng DEV không có. Nguồn phát hành phiếu vận chuyển (`issued_by`) không có việc đánh số ở ES.
- **〔Đề xuất〕** Thêm **`es_generated`** vào `issued_by`. Số là **Số giao hàng + số thùng** (ví dụ: `DL-261020-0021-01`). Tạo đủ số lượng theo số thùng vào thời điểm gửi chỉ thị xuất hàng thành công.
- **Thiết kế**: Thêm cột "Nguồn phát hành" vào bảng "Số phiếu vận chuyển" của Chi tiết dữ liệu giao hàng và hiển thị "ES đánh số". Không hiển thị link trang tra cứu.

### D-2. Phân công tài xế cho cả chặng 1 (trường hợp B・C)

- **Vấn đề**: Cấu trúc cho phép phân công theo từng chặng, nhưng quy tắc vận hành (quyết định #60) và màn hình đang là "chỉ phân công chặng 2, chặng 1 hiển thị là 'công ty vận tải'".
- **〔Đề xuất〕** Đổi quy tắc thành "**chặng do công ty vận tải (Yamato・Sagawa) chở thì không phân công. Chặng do ủy thác・tự vận hành chở thì phân công**". Được quyết định tự động theo người vận chuyển của chặng (`delivery_regime`) nên màn hình chỉ có 1 nhánh.
- **Thiết kế**: Ô "Đơn vị giao hàng chở đến điểm kế tiếp" ở tab Tuyến giao hàng của Chi tiết dữ liệu giao hàng vốn đã hiển thị "Nhân viên giao hàng" ở chặng 2. **Hiển thị và nút phân công tương tự cũng hiện ở dòng chặng 1** (chặng của công ty vận tải vẫn như cũ là "Công ty vận tải"). Cột tài xế trong danh sách Quản lý xuất hàng・giao hàng hiển thị 2 dòng "Chặng 1 / Chặng 2".

### D-3. Ghi nhận việc bàn giao tại điểm trung chuyển như thế nào (trường hợp B)

- **Vấn đề**: "Đã nhận" chỉ có 1 lần. Khi tài xế chặng 1 nhận hàng ở kho là thành "Đã nhận", không lưu lại được việc tài xế chặng 2 nhận hàng tại điểm trung chuyển.
- **〔Đề xuất〕** **Không tăng trạng thái** (giữ quyết định không có trạng thái trung gian ở trung chuyển). Thay vào đó **giữ thời điểm nhận theo từng chặng `delivery_legs.picked_up_at`**.
  - Trạng thái chuyển thành "Đã nhận" ở lần nhận đầu tiên (chặng 1).
  - Khi tài xế chặng 2 thực hiện "Nhận hàng" tại điểm trung chuyển thì chỉ nhập thời điểm nhận của chặng đó.
  - Nếu sáng hôm sau ngày giao mà chưa có nhận của chặng 2 thì có thể bắt được bằng cơ chế phát hiện thiếu giao hàng hiện có.
- Phương án khác: không ghi nhận việc nhận của chặng 2 (đơn giản, nhưng không phát hiện được khi hàng bị dừng ở điểm trung chuyển).
- **Thiết kế**: Chỉ thêm 1 cột "Nhận hàng" (thời điểm・người nhận) vào bảng điểm của tab Tuyến giao hàng.

### D-4. Không chọn được đơn vị ủy thác cho chặng 1 trong Thiết lập giao hàng theo hợp đồng (trường hợp B・C)

- **Vấn đề**: Lựa chọn "Công ty giao hàng (chặng 1)" trong thiết kế chỉ có Yamato Transport・Sagawa Express・xe tự vận hành. Điểm trung chuyển cũng chỉ là bưu cục của Yamato・Sagawa.
- **〔Đề xuất〕** Cho chọn chặng 1・chặng 2 từ **toàn bộ master công ty giao hàng**. Điểm trung chuyển chọn từ **toàn bộ trung chuyển (HU) trong master kho** (có thể đăng ký cả cơ sở của công ty ủy thác làm điểm trung chuyển).
- **Thiết kế**: Chỉ đổi các lựa chọn của select trong Thiết lập giao hàng theo hợp đồng (chỉnh sửa). Không đổi bố cục.

### D-5. Phạm vi nhìn thấy trên Web đơn vị giao hàng ủy thác (trường hợp B)

- **〔Đề xuất〕** Đơn vị giao hàng ủy thác **chỉ thấy các đơn giao hàng có chặng do công ty mình phụ trách**. Bên phụ trách chặng 1 thao tác đến khi nhận ở kho, bên phụ trách chặng 2 thao tác từ điểm trung chuyển đến giao hàng. Dùng cùng màn hình với A-1.

---

## Tổng kết: Các thay đổi thiết kế nếu tiến hành theo phương án đề xuất

| Màn hình | Thay đổi | Liên quan |
|---|---|---|
| Danh sách cần xác nhận | Thêm phân loại "Lưu ý hạn sử dụng" | A-2 |
| Chi tiết dữ liệu giao hàng (Thực tế) | Cột "Sản phẩm gốc" trong chênh lệch kiểm hàng | A-6 |
| Chi tiết dữ liệu giao hàng (Tuyến giao hàng) | Phân công cả chặng 1, thêm cột "Nhận hàng" | D-2・D-3 |
| Chi tiết dữ liệu giao hàng (Phiếu vận chuyển) | Cột "Nguồn phát hành" (ES đánh số) | D-1 |
| Danh sách Quản lý xuất hàng・giao hàng | Cột tài xế thành 2 dòng Chặng 1 / Chặng 2 | D-2 |
| Thiết lập giao hàng theo hợp đồng (chỉnh sửa) | Lựa chọn chặng 1・điểm trung chuyển thành toàn bộ | D-4 |
| Modal giải quyết・modal nhân bản (dự kiến bổ sung) | Cờ cước vận chuyển khi hủy / lý do trả hàng và nơi nhận hàng trả về | A-7・A-8 |
| Web đơn vị giao hàng ủy thác | Dùng lại màn hình Lịch trình của Vận hành | A-1・D-5 |
| Web doanh nghiệp | Nội dung chữ của badge | A-9 |

Không tạo màn hình mới, chỉ thêm cột・lựa chọn・phân loại vào các màn hình hiện có là có thể đáp ứng.
