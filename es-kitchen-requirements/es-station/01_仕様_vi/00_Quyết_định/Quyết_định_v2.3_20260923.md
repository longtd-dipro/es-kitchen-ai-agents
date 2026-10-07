> **Đã đóng băng (bản gốc, 2026-10-05). Không cập nhật thêm.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung file này được chuyển đi đâu và những quyết định đã bị thay thế, xem mục "G" của sổ cái quyết định.

# Quyết định v2.3 (23/09/2026) ― 7 loại màn hình phê duyệt và Master dòng máy

Đây là phản hồi cho `00_確認してほしい/作業記録_20261003/要確認_選択肢とメリデメ_20260923.md`. **Đây là nơi sở hữu các quyết định**; demo và đặc tả sẽ được điều chỉnh theo file này.

---

## Danh sách quyết định

| # | Hạng mục | Quyết định |
|---|---|---|
| 1 | Đơn vị phê duyệt | **B Phê duyệt theo từng cơ sở** |
| 2 | Số tiền thu hồi khi hủy máy bán hàng tự động | **B Master dòng máy giữ số tiền tiêu chuẩn, có thể ghi đè theo hợp đồng** |
| 3 | Thiết bị khi đổi địa chỉ | **Không di dời, không thu hồi. Khách hàng tự chịu trách nhiệm di chuyển.** Nếu bên vận hành vận chuyển thì bổ sung Tùy chọn (Option) có phí |
| 4 | Khi ràng buộc thiết bị vượt quá ngày hết hạn hợp đồng | **A Không thay đổi hợp đồng cha.** Khi đăng ký phải nêu rõ "có ràng buộc kéo dài hơn ngày hết hạn hợp đồng" |
| 5 | Thời điểm phản ánh người phụ trách | **Cùng lúc với phê duyệt.** Không in lại phiếu giao hàng đã phát hành |
| 6 | Chuyển sang chuyển khoản tự động (口座振替) | **C Chuyển cùng lúc với phê duyệt. Cho đến khi thủ tục hoàn tất thì thanh toán bằng chuyển khoản ngân hàng** (thay đổi 28/09/2026: yêu cầu thay đổi từ doanh nghiệp không xử lý phương thức thanh toán. Giữ lại như quy tắc khi bên vận hành thay đổi phương thức thanh toán → `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` §4) |
| 7 | Chi phí giao hàng khi thay thế thiết bị | **C Báo giá theo từng lần** (Web doanh nghiệp chỉ nhận nguyện vọng, bên vận hành nhập số tiền) |
| 8 | Các lựa chọn lý do tạm dừng | **A Giữ 6 lựa chọn, ô mô tả tự do là tùy chọn** |
| 8-2 | Ghi lại quá trình đề xuất | **A Chỉ ghi lại lý do đã chọn** (không lưu lại các đề xuất đã xem) |
| ⑫ | Chủ sở hữu thiết bị thuộc Gói (đối tượng miễn phí) | **B Master dòng máy sở hữu. Phán định theo Gói** |
| ⑫-2 | Bắt buộc nhập sức chứa tối đa | **Tủ lạnh, tủ đông, máy bán hàng tự động, hộp vật tư là bắt buộc. Lò vi sóng không cần** |
| ⑫-3 | Phân biệt Lạnh và Đông lạnh | **B Tách loại dòng máy (RF = Lạnh / FZ = Đông lạnh)** |
| ⑫-5 | Phán định dung lượng tủ đông | **C Phán định theo tỷ lệ. Tỷ lệ được giữ trong Master gói** |
| ⑬ | Con số dùng để phán định dung lượng | **Số suất ăn ES (số lượng giao mỗi lần)**. Với tủ đông thì nhân với tỷ lệ ở ⑫-5 |

---

## Các thay đổi kèm theo quyết định

### ① Hệ thống ID dòng máy thay đổi (⑫-3 B)

```
Trước　^(RF|VM|MW|HW|BX)[0-9]{6,}$
Sau　　^(RF|FZ|VM|MW|HW|BX)[0-9]{6,}$
```

| Loại dòng máy | Tiền tố | Ý nghĩa |
|---|---|---|
| Tủ lạnh | **RF** | Tủ trưng bày lạnh |
| Tủ đông | **FZ** | Tủ trữ đông (**mới lập**) |
| Máy bán hàng tự động | VM | |
| Lò vi sóng | MW | |
| Máy giữ nóng (Hot Warmer) | HW | |
| Hộp vật tư | BX | |

Đánh số lại các dòng máy đông lạnh hiện có.

| Trước | Sau | Tên gọi |
|---|---|---|
| RF000005 | **FZ000001** | Tủ trữ đông 60L |
| RF000006 | **FZ000002** | Tủ trữ đông 100L |
| RF000007 | **FZ000003** | Tủ trữ đông 150L |

> **Lưu ý về chuyển đổi dữ liệu**　Nếu đã có thực tích cho thuê, hợp đồng, giao hàng được đăng ký với RF000005〜7 thì cần đổi ID.
> **Vì quyết định được chốt trước khi bắt đầu phát triển Phase2 nên hiện tại không có dữ liệu cần chuyển đổi.**

### ② Master dòng máy (⑫ B・⑫-2・2 B)

**(Đính chính 25/09/2026) Không thêm mục mới.** Ban đầu ở đây đã ghi mục mới "Gói đối tượng miễn phí", nhưng
Master dòng máy từ P1 đã có sẵn cột **"Gói đối tượng miễn phí phí ban đầu / phí hàng tháng"**, và có thể dùng nguyên cột này.

| Mục hiện có | Nội dung |
|---|---|
| `model.free_threshold_lite` (Lite_Số lượng cung cấp hàng tháng để phán định miễn phí) | Với hợp đồng có Course = ES Lite, nếu tổng hạn mức cung cấp hàng tháng từ giá trị này trở lên thì miễn phí phí ban đầu và phí hàng tháng. **Để trống = không miễn phí ở Course đó** |
| `model.free_threshold_std` (Standard_Số lượng cung cấp hàng tháng để phán định miễn phí) | Tương tự, áp dụng khi là Standard |

Vì được chia theo Course nên **nếu để trống tủ đông của Lite thì có thể biểu thị "ở Lite tủ đông không được miễn phí"**.
Ngưỡng là `Số suất ăn ES × Số lần giao hàng 4` (Gói 50 = 200 / 100 = 400 / 150 = 600).

| Dòng máy | Phí hàng tháng | Lite | Standard |
|---|---|---|---|
| RF000001 Lạnh 46L | ¥4,000 | 200 | 200 |
| RF000002 Lạnh 84L | ¥6,000 | 400 | 400 |
| RF000003 Lạnh 120L | ¥8,000 | 600 | 600 |
| FZ000001 Đông lạnh 60L | ¥4,500 | (để trống) | 200 |
| FZ000002 Đông lạnh 100L | ¥5,500 | (để trống) | 400 |
| FZ000003 Đông lạnh 150L | ¥7,000 | (để trống) | 600 |
| BX000001 Hộp vật tư | ¥0 | 200 | 200 |

```
Chênh lệch kích cỡ ＝ Phí hàng tháng của dòng máy đã chọn
             −（Trong các dòng máy cùng loại được miễn phí theo hợp đồng đó, dòng có phí hàng tháng cao nhất）
             ※ Nếu âm thì ¥0
```

**Các mục thêm / thay đổi**

| Mục | Nội dung | Bắt buộc |
|---|---|---|
| **Sức chứa tối đa** | Con số dùng để phán định dung lượng (thay đổi điều kiện bắt buộc của mục hiện có) | **Tủ lạnh, tủ đông, máy bán hàng tự động, hộp vật tư là bắt buộc** / Lò vi sóng, Máy giữ nóng (Hot Warmer) không có mục này |
| **Số tiền thu hồi khi hủy** | Mục hiện có. **Đây là số tiền tiêu chuẩn**. Có thể ghi đè ở phía hợp đồng | Tùy chọn (dòng máy báo giá riêng thì bắt buộc nhập ở hợp đồng) |
| ~~Phiên bản giá (lịch sử điều chỉnh)~~ | **(Quyết định 25/09/2026) Master dòng máy không có phiên bản giá.** Vì màn hình hiện tại không có và vận hành cũng không dùng, nên Phase 2 cũng không bổ sung. Khi thay đổi giá thì sửa trực tiếp phí ban đầu, phí hàng tháng và số tiền thu hồi khi hủy (dòng khoản mục ① của hợp đồng con cố định số tiền khi được tạo ra, nên sau này sẽ không thay đổi). Master gói và Master tùy chọn (Option) vẫn tiếp tục có phiên bản | — |

### ③ Mục thêm vào Master gói (⑫-5 C)

| Mục | Nội dung |
|---|---|
| **Tỷ lệ đông lạnh** | Dùng để phán định dung lượng tủ đông. `Sức chứa cần thiết cho đông lạnh ＝ Số suất ăn ES × Tỷ lệ đông lạnh`. **Mặc định 30%** (bị bãi bỏ ở bổ sung 29/09/2026 mục 28-155. Ngày 30/09/2026: đông lạnh không quyết định theo tỷ lệ mà theo số lượng trong Gói [Bảng yêu cầu dòng 170 · 30/09/2026 hong]) |

**Lý do mặc định là 30%**　Trong phần giải thích "Hạn mức cung cấp hàng tháng (đông lạnh・lạnh)" của hợp đồng con đã ghi sẵn
**"Đông lạnh tối đa 30% của toàn bộ Gói"** (biên bản họp 15/09/2026). Biến điều này thành một mục.

Ví dụ: Gói 100・Tỷ lệ đông lạnh 30% → Sức chứa cần thiết cho đông lạnh 30 → chỉ chọn được tủ đông có sức chứa tối đa từ 30 trở lên

**Tủ lạnh giữ nguyên Số suất ăn ES** (⑬). Nếu là Gói 100 thì chỉ chọn được tủ lạnh có sức chứa tối đa từ 100 trở lên.

### ④ Mục thêm vào hợp đồng (2 B)

| Mục | Nội dung |
|---|---|
| **Số tiền thu hồi khi hủy (ghi đè)** | Nếu để trống thì dùng số tiền tiêu chuẩn của Master dòng máy. Chỉ nhập khi khác nhau theo từng hợp đồng như máy bán hàng tự động |

### ⑤ Không tạo "di dời" trong biến động thiết bị (3)

Dù địa chỉ cơ sở thay đổi, **cũng không tạo bản ghi biến động thiết bị.** Khách hàng tự chịu trách nhiệm di chuyển.

| | |
|---|---|
| ID cho thuê | **Không thay đổi** |
| Thời gian sử dụng tối thiểu | **Không thay đổi** (không tính lại từ đầu) |
| Chi phí | **Miễn phí** (vì khách hàng tự vận chuyển) |
| Khi bên vận hành vận chuyển | Bổ sung **Tùy chọn (Option) có phí** bằng báo giá theo từng lần (cùng cách xử lý với mục 7) |

> Thay cho việc bên vận hành không vận chuyển, trên màn hình đăng ký của trang doanh nghiệp sẽ hiển thị
> "**Việc di chuyển thiết bị do quý khách thực hiện. Nếu muốn bên vận hành di chuyển, chúng tôi sẽ báo giá riêng**".

### ⑥ Phê duyệt theo từng cơ sở (1 B)

| | |
|---|---|
| Đơn đăng ký/yêu cầu | 1 đơn gồm nhiều cơ sở (không thay đổi trang doanh nghiệp) |
| Phê duyệt | **Phê duyệt・từ chối theo từng cơ sở.** Mỗi cơ sở có trạng thái phê duyệt riêng |
| Trạng thái của đơn | Tất cả cơ sở đã phê duyệt = Đã phê duyệt / chỉ một phần = **Phê duyệt một phần** / tất cả từ chối = Từ chối |
| Cấu trúc dữ liệu | Bảng đơn + **bảng chi tiết đơn (cơ sở)** (có trạng thái phê duyệt・thời điểm phê duyệt・người phê duyệt) |
| Thông báo cho khách hàng | **Gửi theo từng cơ sở** (không dừng tất cả để chờ phê duyệt của 1 cơ sở) |

### ⑦ Chuyển đổi phương thức thanh toán (6 C)

| | |
|---|---|
| Cùng lúc với phê duyệt | Chuyển phương thức thanh toán của hợp đồng sang **chuyển khoản tự động (口座振替)** |
| Cho đến khi thủ tục hoàn tất | In **chuyển khoản ngân hàng** trên hóa đơn và ghi tài khoản nhận tiền |
| Sau khi thủ tục hoàn tất | Từ hóa đơn kỳ sau sẽ ghi chuyển khoản tự động |
| Mục cần giữ | Hợp đồng có "**Trạng thái thủ tục chuyển khoản tự động** (Chưa làm thủ tục / Đang làm thủ tục / Hoàn tất)" |

> Không dừng việc thanh toán. Vì trong thời gian chờ thủ tục vẫn **có thể thanh toán bằng chuyển khoản ngân hàng**, nên việc ghi nhận doanh thu không bị chậm.

### ⑧ Ghi lại việc tạm dừng (8-2 A)

Chỉ lưu **lý do đã chọn**. Không ghi lại "đã xem đề xuất nào và không chọn".
Trên màn hình phê duyệt chỉ hiển thị "Lý do tạm dừng: Cải tạo・chuyển văn phòng" và phần mô tả tự do tùy chọn.

### ⑨ Nêu rõ khi ràng buộc thiết bị vượt quá ngày hết hạn hợp đồng (4 A)

Không thay đổi ngày hết hạn của hợp đồng cha. Thay vào đó, hiển thị ở **cả màn hình đăng ký của trang doanh nghiệp và màn hình phê duyệt của bên vận hành**.

> Thiết bị này có thời gian sử dụng tối thiểu đến **09/02/2028** (sau ngày hết hạn hợp đồng của quý khách là 30/09/2027).
> Nếu hủy trước ngày này, sẽ phát sinh tiền phạt vi phạm cho phần thiết bị này.

---

## Những điều chưa quyết định

> **Cập nhật 28/09/2026**　Phần lớn các mục trong bảng dưới đã được quyết định ở `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md`. Đã bổ sung cột quyết định.

| Hạng mục | Điều cần quyết định | Tình trạng (28/09/2026) |
|---|---|---|
| Giá trị ban đầu của tỷ lệ đông lạnh | Đã quyết định giữ trong Master gói. Demo dùng **30%** (theo "Đông lạnh tối đa 30% của toàn bộ Gói" trong biên bản họp 15/09/2026). Giá trị này có ổn không | **Quyết định 28-14**: tiến hành với 30% (khi biết máy thực tế thì bên vận hành sẽ sửa) |
| Con số dùng cho phán định miễn phí | Phần giải thích của Master dòng máy là "tổng hạn mức cung cấp hàng tháng". Demo của trang doanh nghiệp tính tổng bằng "Số suất ăn ES × Số lần giao hàng 4". Cần xử lý thế nào khi xuất hiện **Gói có số lần giao hàng không phải 4** | **Quyết định 28-15**: phán định theo tổng hạn mức cung cấp hàng tháng của Master gói |
| Sức chứa tối đa của tủ đông | Vì ở ⑫-2 đã thành bắt buộc nên cần giá trị (bản nháp: 60L = 40 / 100L = 70 / 150L = 110) | **Quyết định 28-14**: tiến hành theo bản nháp |
| Bảng tham khảo giao hàng khi thay thế | Báo giá theo từng lần đã quyết định. Để bên vận hành không bị chênh lệch, cần **1 bảng tham khảo** (bản nháp: 1 máy ¥4,800 / từ 2 máy ¥7,800 / từ tầng 3 không có thang máy + ¥3,000) | **Quyết định 28-16**: áp dụng. Hiển thị làm giá trị ban đầu trên màn hình phê duyệt |
| Nội dung chữ của 6 lựa chọn lý do tạm dừng | Đã quyết định giữ 6 lựa chọn. **Xác nhận nội dung chữ với kinh doanh** (đặc biệt "Không hài lòng về chất lượng・vận hành" khó chọn) | Chưa quyết (xác nhận với kinh doanh) |
| Số tiền thu hồi khi hủy máy bán hàng tự động (tiêu chuẩn) | Đã quyết định giữ trong Master dòng máy. **Số tiền tiêu chuẩn là bao nhiêu** (demo tạm đặt ¥150,000) | Quyết định một phần 28-8 (dòng máy báo giá riêng có thể để trống số tiền tiêu chuẩn, bắt buộc nhập ở hợp đồng). Số tiền xác nhận với kinh doanh |
| Hộp vật tư bổ sung có miễn phí không | Chưa có phản hồi | **Quyết định 28-9**: theo phí hàng tháng của Master dòng máy (hiện là ¥0) |
| URL trang phỏng vấn・có bắt buộc phỏng vấn không | Chưa có phản hồi | **Quyết định 28-24**: giữ là tùy chọn. URL xác nhận với kinh doanh |
| Doanh nghiệp đang tạm dừng có xem được hợp đồng・thanh toán trước đây không | Chưa có phản hồi | **Quyết định 28-3**: đăng nhập được, xem được ở chế độ chỉ đọc |
