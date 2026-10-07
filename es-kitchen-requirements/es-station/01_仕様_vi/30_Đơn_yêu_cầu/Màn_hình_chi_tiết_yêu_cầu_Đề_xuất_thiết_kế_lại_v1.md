> **Đã đóng băng (bản gốc) 2026-10-03: từ nay không cập nhật.** Nguồn chuẩn về đơn đăng ký・phê duyệt là `30_Đơn_yêu_cầu/Đơn_yêu_cầu_và_phê_duyệt.md`. Các quyết định hiện đang có hiệu lực nằm ở `docs/決定台帳.md`.

# Phương án thiết kế lại màn hình chi tiết đơn đăng ký　v1.0

> Ngày lập: 2026/09/17　Phụ trách: Hong (BrSE・Dipro)
> Đây là phương án để làm lại demo hiện có `02_デモ/11_運営_申請受付.html` (2026/09/12) cho khớp với cấu trúc **hợp đồng cha・hợp đồng con** đã được chốt từ 9/15 đến 9/17.
> Căn cứ: `01_仕様/20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md` §0.2〜0.11／`99_過去/契約自動生成_配送データ自動生成_まとめ_v1_20260917.md`／`99_過去/ES_Phase2_作業引き継ぎ.md` §4
>
> **Chưa quyết định gì.** Khi quý khách chọn một phương án ở §3, chúng tôi sẽ làm theo đúng phương án đó.

---

## 0. Điểm chính

Demo hiện tại coi **hợp đồng là một thể thống nhất** (`CT-2026-081-01`) và trên màn hình có **mục "Tháng bắt đầu áp dụng"**.
Với các quyết định từ 9/15 đến 9/17, cả hai điều này đều không còn đứng vững.

| | Demo hiện tại | Đặc tả mới nhất |
|---|---|---|
| Hợp đồng | 1 hợp đồng (`CT-2026-081-01`) | **Hợp đồng cha** (`CP0000001`・số không đổi) ＋ **Hợp đồng con** (`CP0000001-202610`・1 hợp đồng cho mỗi chu kỳ giao hàng) |
| Cách áp dụng thay đổi | Nhập ngày vào "Tháng bắt đầu áp dụng" trên màn hình | **Không có mục này.** Sửa hợp đồng con của tháng kế tiếp, rồi chọn "Chỉ hợp đồng con này / Từ đây trở đi tất cả" ở **hộp thoại khi lưu** |

Nói cách khác, **với các màn hình nhóm thay đổi (đổi gói・tạm ngưng・hủy・tiếp tục), cách "quyết định ngày ngay trên màn hình chi tiết đơn đăng ký" sẽ thay đổi hoàn toàn**.
Ngược lại, **tiếp nhận đăng ký mới** (tạo doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con từ con số 0) vẫn dùng nguyên được cấu trúc của demo hiện tại.

Vì vậy ở §3 chúng tôi đưa ra 3 phương án về việc làm màn hình chi tiết đơn đăng ký đến mức nào.

---

## 1. Chênh lệch giữa demo hiện tại và đặc tả mới nhất (10 mục)

| # | Góc nhìn | Demo hiện tại | Đặc tả mới nhất | Cách sửa |
|---|---|---|---|---|
| 1 | Cấu trúc hợp đồng | 1 hợp đồng (`CT-2026-081-01`) | Hợp đồng cha `CP0000001` ＋ Hợp đồng con `CP0000001-202610` | Làm lại cả ID lẫn bố cục màn hình |
| 2 | Tháng áp dụng thay đổi | Ô nhập "Tháng bắt đầu áp dụng" trên màn hình | **Không có mục này.** Chọn phạm vi áp dụng ở hộp thoại khi lưu | Xóa ô, thay bằng hộp thoại |
| 3 | Đơn vị hợp đồng | 1 hợp đồng không vắt qua tháng | **1 chu kỳ giao hàng = 1 hợp đồng con** (4 tuần・A1 luôn là thứ Hai・vắt qua tháng dương lịch) | Đưa khái niệm tháng chu kỳ vào demo |
| 4 | Tab thiết lập chi tiết | Thông tin hợp đồng／Thông tin giao hàng／Thiết lập giá／Thông tin thiết bị／Tài liệu đính kèm (5 tab) | Hợp đồng con có **Hợp đồng／Giá・Thanh toán／Thiết bị・Tùy chọn／Lịch sử thay đổi** (4 tab). Tài liệu đính kèm nằm ở "Tài liệu・Lịch sử" của **cơ sở** | Thay lại các tab |
| 5 | Giá | 1 bảng (tổng tiền tháng) | **2 bảng: ① Số tiền cố định (trả trước)／② Quyết toán theo thực tế (trả sau)**. Tháng thanh toán và thời điểm chốt khác nhau | Tách thành 2 bảng |
| 6 | Thiết bị | "Dòng máy chốt" "Thay thế" | Đăng ký bằng **biến động thiết bị** (cho thuê mới／cho thuê thêm／thu hồi／đổi dòng máy) → phản ánh vào **danh sách cho thuê của cơ sở** | Làm lại thành bảng biến động |
| 7 | Tiền phạt hợp đồng | Số tiền cố định chung ¥100,000 (Master Tùy chọn・Phí khác) | **Xét "số tiền thu hồi khi hủy" của Master Dòng máy theo từng thiết bị rồi cộng gộp**. Hợp đồng cha chỉ là giá trị đại diện (tham chiếu) | Đổi sang hiển thị chi tiết theo từng thiết bị ※§8-③ |
| 8 | Giới hạn tạm ngưng | 1 năm | REQ-CT-239 (tạm thời) = **tối đa 6 tháng mỗi năm・sau khi tiếp tục phải duy trì từ 3 tháng trở lên** | Cần xác nhận cái nào đúng ※§8-④ |
| 9 | Tùy chọn・Giảm giá | Bày cố định trên màn hình | **Master Tùy chọn／Master Giảm giá** ＋ danh sách áp dụng của cơ sở ＋ "Biến động tùy chọn・giảm giá" của hợp đồng con. Loại liên động A/B/C | Làm lại thành bảng biến động |
| 10 | Thuật ngữ | Hợp đồng chính thức／Chiến dịch dùng thử／Thời hạn hợp đồng tối thiểu／Thay thế thiết bị | **Triển khai chính thức／Chiến dịch dùng thử／Thời hạn sử dụng tối thiểu／Biến động thiết bị** | Thay thế toàn bộ (tài liệu bàn giao §7) |

### 1.1 Bảng thay thế ID

| Đối tượng | Demo hiện tại | Mới nhất |
|---|---|---|
| Doanh nghiệp | `CP0001842` | `CU00001` |
| Cơ sở | `CU012478` | `CU00643` |
| Hợp đồng | `CT-2026-081-01` | Hợp đồng cha `CP0000001` |
| Hợp đồng theo tháng | (không có) | Hợp đồng con `CP0000001-202610` |
| Gói | "Gói 100" | `ES000012` ES Standard 100 |
| Dòng máy | `SC-180` | `RF000001` (RF／VM／MW／HW／BX) |
| Tùy chọn | (không có) | `OP000001` |
| Giảm giá | (không có) | `DC000001` |
| Áp dụng (cơ sở) | (không có) | `AP-0001` |

---

## 2. Chênh lệch lớn nhất: "Tháng bắt đầu áp dụng" không còn nữa

Demo hiện tại được làm theo kiểu **quyết định "áp dụng từ khi nào" ngay trong màn hình chi tiết đơn đăng ký**.
Trong demo đổi gói, ngày được nhập theo từng cơ sở: Trụ sở Tokyo 2026/11/01・Văn phòng kinh doanh Fukuoka 2026/12/01, và đơn đăng ký giữ các ngày đó.

Theo đặc tả mới nhất thì như sau.

```
Có đơn đổi gói gửi tới
  ↓
Bên vận hành đi từ Chỉnh sửa thông tin cơ sở → tab "Hợp đồng" → Danh sách hợp đồng con
  mở hợp đồng con của tháng chu kỳ muốn áp dụng (ví dụ CP0000001-202611)
  ↓
Đổi ID gói ở tab "Hợp đồng" rồi lưu
  ↓
Nếu đã sinh hợp đồng con của các chu kỳ phía sau thì hộp thoại hiện ra
  ┌ Chỉ hợp đồng con này        … chỉ đổi chu kỳ tháng 11/2026
  └ Từ hợp đồng con này trở đi  … cập nhật cả nguồn sinh (cơ sở・hợp đồng cha・gói),
                                  và sửa cả các hợp đồng con chưa chốt đã tạo trước (không sửa hợp đồng đã chốt・đã thanh toán)
  ↓
Trong lịch sử thay đổi sẽ lưu "chỉ 2026-11" ／ "từ 2026-11 trở đi tất cả"
```

**Không có ô nhập ngày ở bất cứ đâu.** "Mở hợp đồng con nào" chính là tháng áp dụng.

Vì vậy, nếu hoàn tất nhóm thay đổi ngay trong màn hình chi tiết đơn đăng ký thì sẽ rơi vào tình trạng **cùng một việc được quyết định ở 2 nơi**.
Điều này đụng trực diện vào tài liệu bàn giao §4-3 "Chỉ có một nơi sở hữu".

---

## 3. Đặt màn hình ở đâu (3 phương án)

### Phương án A (khuyến nghị)　Màn hình chi tiết đơn đăng ký chỉ dành cho "tiếp nhận đăng ký mới"

| | |
|---|---|
| Màn hình chi tiết đơn đăng ký xử lý | **Đăng ký mới (triển khai chính thức・chiến dịch dùng thử)**／**Chuyển từ dùng thử → triển khai chính thức** |
| Nhóm thay đổi (đổi gói・tạm ngưng・hủy・tiếp tục) | Không xử lý trong màn hình chi tiết đơn đăng ký. Phê duyệt ở **màn hình phê duyệt đơn thay đổi** (màn nhỏ) → việc thay đổi thực tế thực hiện ở màn hình cơ sở・hợp đồng con |
| Demo sẽ làm | ① Tiếp nhận đăng ký mới (gồm cả chuyển đổi)　② Phê duyệt đơn thay đổi (1 màn hình) |

**Lý do nghĩ như vậy**

- Đăng ký mới là "chưa có gì" → tạo ra. Thay đổi là "sửa cái đã có" → sửa ở màn hình đã có. Tính chất màn hình khác nhau.
- Nơi sửa các thay đổi đã có sẵn ở `12_運営_法人拠点契約.html` (tab "Hợp đồng" của cơ sở・4 tab của hợp đồng con). Không cần làm hai lần.
- Thứ màn hình phê duyệt cần không phải ô nhập mà là **thông báo trước điều gì sẽ xảy ra khi phê duyệt**. Cụ thể:
  - **Số hợp đồng con phía trước bị hủy** (REQ-CT-232-5)
  - **Số lịch giao hàng (draft) bị xóa**
  - **Ngày dự kiến trả lại** tự động đặt (ngày dừng ＋1 tháng)
  - **Xét tiền phạt hợp đồng** (theo từng thiết bị・cộng gộp)

### Phương án B　Giữ cấu trúc hiện tại 6 loại・1 màn hình, chỉ chỉnh nội dung cho khớp mô hình mới

| | |
|---|---|
| Ưu điểm | Dễ trình bày trong cuộc họp. So sánh được 6 loại trong 1 luồng |
| Nhược điểm | Với nhóm thay đổi, phải đặt trên màn hình thứ thay cho "Tháng bắt đầu áp dụng", và **bị trùng với hộp thoại lưu của hợp đồng con** |
| Dung hòa | Nhóm thay đổi **không cho nhập mà chỉ đặt liên kết tới hợp đồng con** ("Mở hợp đồng con của chu kỳ tháng 11/2026 →"). Thực chất gần với phương án A |

### Phương án C　Loại màn hình chi tiết đơn đăng ký khỏi phạm vi Giai đoạn 2

Trong 6 màn hình của danh sách mục (doanh nghiệp・cơ sở・hợp đồng con・dòng máy・tùy chọn・giảm giá) không có màn hình chi tiết đơn đăng ký.
Nếu đối tượng triển khai Giai đoạn 2 đã chốt là 6 màn hình thì cũng có lựa chọn **giữ nguyên bản hiện tại của demo màn hình chi tiết đơn đăng ký như "ghi chép luồng tiếp nhận của Giai đoạn 1" và không làm lại**.

### So sánh

| | Phương án A (khuyến nghị) | Phương án B | Phương án C |
|---|---|---|---|
| Khối lượng làm | Vừa (2 màn hình) | Lớn (làm lại cả 6 loại) | Nhỏ (không có) |
| Khớp với đặc tả mới nhất | ◎ | △ (nguy cơ nhập trùng) | ○ |
| Quy tắc "Chỉ có một nơi sở hữu" | ◎ | △ | ◎ |
| Dễ trình bày trong cuộc họp | ○ | ◎ | △ |
| Phản ánh vào danh sách mục | Cần bổ sung các mục đơn đăng ký・phê duyệt | Như bên trái (khối lượng nhiều) | Không cần |

---

## 4. Nội dung demo làm theo phương án A

### 4-1. Màn hình 1　Tiếp nhận đăng ký mới

Cho thấy việc từ **1 form đăng ký** sinh ra **1 doanh nghiệp・3 cơ sở・3 hợp đồng cha・3 hợp đồng con**.

**Màn hình A (xác nhận nội dung đăng ký)**

| Khối | Nội dung |
|---|---|
| Header đơn đăng ký | Số đơn `AP-20260904-0090`／Ngày đăng ký／Doanh nghiệp đăng ký／**Loại hợp đồng (triển khai chính thức／chiến dịch dùng thử)**／Số cơ sở đối tượng |
| Lịch bắt đầu theo từng cơ sở | Theo từng cơ sở: **Ngày bắt đầu hợp đồng・tháng chu kỳ đầu tiên・A1 (thứ Hai)・ngày cơ sở sinh hợp đồng con・tháng thanh toán lần đầu** trong 1 bảng |
| Accordion theo từng cơ sở | Nội dung đăng ký (gói・course・giao hàng・thiết bị・địa chỉ・người phụ trách). Dùng lại cấu trúc giống demo hiện tại |
| Cột bên phải | Thông tin doanh nghiệp・điều kiện thanh toán (**nơi nhận hóa đơn do cơ sở giữ**・đơn vị phát hành hóa đơn là doanh nghiệp)・người phụ trách đăng ký |

**B (modal xác nhận đăng ký tạm)** — Hiển thị những gì sẽ được tạo theo 4 tầng

```
Doanh nghiệp       1 mục   CU00001   Công ty Cổ phần Sample Foods
Cơ sở              3 mục   CU00643 / CU00644 / CU00645
Hợp đồng cha       3 mục   CP0000001 / CP0000002 / CP0000003     ← loại hợp đồng = triển khai chính thức
Hợp đồng con       3 mục   CP0000001-202610 / CP0000002-202610 / CP0000003-202611
                   (chỉ phần chu kỳ đầu tiên. Từ sau đó batch hằng ngày sẽ sinh)
Tài khoản          1 mục   Cấp cho cơ sở
```

**C (modal hoàn tất)** — Bảng kết quả ở trên ＋ "Tự động sinh lần tới: dự kiến tạo 2026-11 vào ngày 2026/10/01"

**D (thiết lập chi tiết theo từng cơ sở)** — Tab được **tách giữa cơ sở và hợp đồng con**

| Ở đâu | Tab | Điền gì trên màn hình này |
|---|---|---|
| Cơ sở | Thông tin cơ bản | Địa chỉ・thiết lập sử dụng app・người phụ trách・tài khoản |
| Cơ sở | Hợp đồng (hợp đồng cha) | Loại hợp đồng・ngày bắt đầu hợp đồng・thời hạn sử dụng tối thiểu・mã đại lý |
| Cơ sở | Tài liệu・Lịch sử | Tài liệu đường vận chuyển (dành cho khách hàng／dành cho bên ủy thác)・ảnh nơi lắp đặt |
| Hợp đồng con | Hợp đồng | ID gói・course・thiết lập tuyến giao hàng (theo loại giao hàng)・chu kỳ giao hàng |
| Hợp đồng con | Giá・Thanh toán | ① Các dòng khoản mục số tiền cố định (trả trước)／② Quyết toán theo thực tế (trả sau) |
| Hợp đồng con | Thiết bị・Tùy chọn | Biến động thiết bị (cho thuê mới)／Biến động tùy chọn・giảm giá |

**E (chốt)** — Chốt theo đơn vị cơ sở (như quyết định lần trước). Khi chốt, hợp đồng cha chuyển từ "đăng ký tạm → có hiệu lực".

### 4-2. Màn hình 2　Chuyển từ chiến dịch dùng thử → triển khai chính thức

Điểm mấu chốt là **cấp một số hợp đồng cha mới**.

```
Dùng thử       CP0000001 (loại hợp đồng = chiến dịch dùng thử)  … kết thúc 2026/09/30. Lưu lại như lịch sử
                ↕ Hai bên trỏ tới nhau qua "Chuyển đổi dùng thử・triển khai chính thức (tham chiếu)"
Chính thức     CP0000012 (cấp số mới)                            … bắt đầu 2026/10/01・thời hạn sử dụng tối thiểu tính từ đây
```

- Thiết lập cơ sở (chế độ khách・ES-QR…) được **kế thừa**
- Gói・thiết bị bên vận hành có thể **thiết lập lại** khi chuyển đổi (CSC120 → CSC180)
- Việc cho thuê thiết bị **do cơ sở sở hữu** nên dù hợp đồng cha thay đổi thì việc cho thuê vẫn tiếp tục (tủ lạnh để nguyên tại chỗ)
- Việc chuyển đổi thực hiện **riêng cho từng cơ sở**

### 4-3. Màn hình 3　Phê duyệt đơn thay đổi

Đây là màn hình để bên vận hành phê duyệt đơn thay đổi gửi từ Web doanh nghiệp. **Hầu như không có nhập liệu, nhiệm vụ chính là cho xem thông báo trước**.

| Đơn | Hiển thị trên màn hình phê duyệt | Điều xảy ra sau khi phê duyệt |
|---|---|---|
| Đổi gói | Hợp đồng con đối tượng (tháng chu kỳ)・trước/sau thay đổi・chênh lệch | Tạo lại snapshot của hợp đồng con đó. Các hợp đồng con phía trước chưa thanh toán cũng vậy (theo lựa chọn phạm vi áp dụng) |
| Tạm ngưng | Tháng chu kỳ bắt đầu tạm ngưng・**số hợp đồng con phía trước bị hủy**・số lịch giao hàng bị xóa・**ngày dự kiến trả lại** (ngày dừng ＋1 tháng) | Hợp đồng cha → tạm ngưng sử dụng. Hủy hợp đồng con phía trước chưa chốt. Xóa draft |
| Hủy | Ngày hủy・**xét tiền phạt hợp đồng (chi tiết theo từng thiết bị và cộng gộp)**・①② của thanh toán cuối cùng・thiết bị cần thu hồi | Hợp đồng cha → đang làm thủ tục hủy → dừng. Giống như trên |
| Tiếp tục | Tháng chu kỳ tiếp tục・**thiết bị cần lắp đặt lại** (tự xét từ danh sách cho thuê của cơ sở) | Hợp đồng cha → có hiệu lực. Tiếp tục sinh hợp đồng con |

---

## 5. Những điều có thể cho xem nhờ mô hình mới (điểm nhấn demo・7 điểm)

| # | Điểm nhấn | Vì sao muốn cho xem |
|---|---|---|
| 1 | Từ 1 đơn đăng ký sinh ra **ID 4 tầng** | Nhìn một lần là hiểu quan hệ giữa hợp đồng cha và hợp đồng con |
| 2 | **Tháng chu kỳ và tháng dương lịch lệch nhau** (A1 rơi vào cuối tháng trước) | Để cảm nhận rằng không phải "mỗi tháng 1 hợp đồng vào ngày mùng 1" |
| 3 | **Hộp thoại lưu hợp đồng con** (chỉ hợp đồng con này／từ đây trở đi tất cả ＋ số lượng phía sau) | Thao tác trung tâm thay cho việc bỏ "Tháng bắt đầu áp dụng" |
| 4 | **Hộp thoại "Tạo hợp đồng con trước đến tận phía sau"** | Luồng thao tác để chuẩn bị cho việc đổi gói vài tháng sau (2026/09/17・phương án A) |
| 5 | **2 bảng ①② và việc tháng thanh toán khác nhau** | Trên 1 hóa đơn có ① và ② đến từ các hợp đồng con khác nhau |
| 6 | **Biến động thiết bị → phản ánh vào danh sách cho thuê của cơ sở** | Phân vai: đăng ký ở hợp đồng con, xem ở cơ sở |
| 7 | **Tiền phạt hợp đồng được xét theo từng thiết bị rồi cộng gộp** | Cho thấy trạng thái bình thường: tủ lạnh đã hết hạn・máy bán hàng tự động thì chưa |

### 5.1 Mẫu tháng chu kỳ (năm 2026)

A1 luôn là thứ Hai. Các giá trị đã xác nhận trên lịch thực tế.

| Chu kỳ | A1 (ngày đầu・thứ Hai) | Ngày cuối | Cách gọi tháng chu kỳ |
|---|---|---|---|
| 1 | 2026/06/29 | 2026/07/26 | Chu kỳ tháng 7/2026 |
| 2 | 2026/07/27 | 2026/08/23 | Chu kỳ tháng 8/2026 |
| 3 | 2026/08/31 | 2026/09/27 | Chu kỳ tháng 9/2026 |
| 4 | **2026/09/28** | 2026/10/25 | Chu kỳ tháng 10/2026 |
| 5 | 2026/10/26 | 2026/11/22 | Chu kỳ tháng 11/2026 |
| 6 | 2026/11/23 | 2026/12/20 | Chu kỳ tháng 12/2026 |

> **Cần xác nhận (§8-①)**: Nội dung chính của Danh sách mục §0.3 ghi "tháng chu kỳ = **năm tháng mà A1 thuộc về**", nhưng
> ví dụ trong cùng mục đó (A1 = 2026/08/31 là "chu kỳ tháng 9/2026") lại là **tháng kế tiếp của tháng A1 thuộc về**.
> Bảng trên được làm theo ví dụ (tháng mà ngày cuối thuộc về = tháng chứa phần lớn việc giao hàng). Đây là chỗ mong quý khách quyết định cái nào đúng.

---

## 6. Phương án dữ liệu mẫu

| | |
|---|---|
| Doanh nghiệp | `CU00001` Công ty Cổ phần Sample Foods (đơn vị phát hành hóa đơn = phát hành gộp・thời gian chuẩn bị thanh toán trước 1 tháng) |
| Cơ sở 1 | `CU00643` Trụ sở Tokyo (nơi nhận hóa đơn = doanh nghiệp)　Hợp đồng cha `CP0000001` (triển khai chính thức・thời hạn sử dụng tối thiểu 12 tháng) |
| Cơ sở 2 | `CU00644` Chi nhánh Osaka (nơi nhận hóa đơn = doanh nghiệp)　Hợp đồng cha `CP0000002` (triển khai chính thức) |
| Cơ sở 3 | `CU00645` Văn phòng kinh doanh Fukuoka (**nơi nhận hóa đơn = cơ sở này**・ghi đè thời gian chuẩn bị là thanh toán trước 2 tháng)　Hợp đồng cha `CP0000003` (chiến dịch dùng thử 1 tháng) |

**Tạo sự khác biệt theo từng cơ sở**

| | Trụ sở Tokyo | Chi nhánh Osaka | Văn phòng kinh doanh Fukuoka |
|---|---|---|---|
| Loại hợp đồng | Triển khai chính thức | Triển khai chính thức | **Chiến dịch dùng thử** |
| Tháng chu kỳ đầu tiên | Tháng 10/2026 | Tháng 10/2026 | **Tháng 11/2026** |
| Hợp đồng con | `CP0000001-202610` | `CP0000002-202610` | `CP0000003-202611` |
| Ngày chuẩn sinh | 2026/09/01 (ngày bắt đầu order) | Như bên trái | **2026/09/25** (thanh toán trước 2 tháng) |
| Tháng thanh toán lần đầu | Tháng 9/2026 | Tháng 9/2026 | **Tháng 9/2026** (phần chu kỳ tháng 11) |
| Nơi nhận hóa đơn | Doanh nghiệp | Doanh nghiệp | **Cơ sở này** |
| Thiết bị | `RF000002` tủ lạnh (thời hạn sử dụng tối thiểu 3 tháng)＋`VM000001` máy bán hàng tự động (12 tháng) | `RF000001` tủ lạnh | `RF000001` tủ lạnh (dùng thử không có thời hạn sử dụng tối thiểu) |

Với cách đặt này, trong một đơn đăng ký đã có thể thấy hết
**khác biệt về loại hợp đồng・khác biệt về nơi nhận hóa đơn・khác biệt về thời gian chuẩn bị・khác biệt về tháng chu kỳ・khác biệt về thời hạn sử dụng tối thiểu**.

---

## 7. Cách làm và nơi lưu

| | |
|---|---|
| Script sinh | `項目一覧_生成スクリプト/apply_demo/` (**đã dời bản hiện hành đi ngày 2026/09/17**). Làm lại từ đây |
| Đầu ra | `02_デモ/11_運営_申請受付.html` (thay thế). Bản hiện hành dời sang `99_過去/` |
| Tài liệu đặc tả | Viết lại `99_過去/01_仕様_申請詳細_旧/ESステーション_申込区分別_申請詳細画面_仕様書_v1.md` thành v2 |
| Kiểm tra | Theo tài liệu bàn giao §3 "Việc bắt buộc làm sau khi sửa", dùng Playwright duyệt toàn bộ màn hình・toàn bộ tab và xác nhận 0 lỗi JS |
| Thiết kế | **Không đổi màu・style** (tài liệu bàn giao §6). Việc có làm giao diện giống `12_運営_法人拠点契約.html` hay không xem §8-⑥ |

---

## 8. Những điều muốn xác nhận

| # | Nội dung | Ảnh hưởng |
|---|---|---|
| ① | **Định nghĩa tháng chu kỳ**. "Năm tháng mà A1 thuộc về" hay "tháng kế tiếp như trong ví dụ (= tháng chứa phần lớn việc giao hàng)" | `yyyymm` của ID hợp đồng con lệch một tháng. Ngày tháng của toàn bộ demo |
| ② | **Màn hình chi tiết đơn đăng ký có thuộc đối tượng triển khai Giai đoạn 2 không**. Nó không nằm trong 6 màn hình của danh sách mục | Chọn phương án A／B／C. Có bổ sung các mục đơn đăng ký・phê duyệt vào danh sách mục hay không |
| ③ | **Tiền phạt hợp đồng chỉ là "số tiền thu hồi khi hủy" của Master Dòng máy**, hay vẫn tồn tại song song tiền phạt hủy hợp đồng cố định chung (Master Tùy chọn・Phí khác) (tài liệu bàn giao §5-2 #12) | Hiển thị số tiền trên màn hình phê duyệt hủy |
| ④ | **Giới hạn tạm ngưng**. "1 năm" như quý khách cho biết lần trước, hay "tối đa 6 tháng mỗi năm・sau khi tiếp tục phải duy trì từ 3 tháng trở lên" của REQ-CT-239 (tạm thời) | Validation của tạm ngưng |
| ⑤ | **Mức độ chi tiết của đơn thay đổi**. Đơn thay đổi theo từng mục (cột "Đơn thay đổi" trong danh sách mục) hay theo đơn vị loại như đổi gói・tạm ngưng・hủy | Cách làm màn hình phê duyệt |
| ⑥ | **Giao diện demo**. Có gộp về cùng khung với `12_運営_法人拠点契約.html` hay giữ nguyên giao diện demo đơn đăng ký hiện tại | Cách làm (đi cùng demo2.py hay giữ apply_demo độc lập) |

---

## 9. Đề xuất cách tiến hành

1. Chỉ quyết trước ①②④ của §8 (③⑤⑥ vẫn kịp quyết trong khi làm)
2. Làm **màn hình 1 (tiếp nhận đăng ký mới)** theo phương án A — ở đây tận dụng được cấu trúc demo hiện có, nhanh nhất có hình
3. Làm **màn hình 3 (phê duyệt đơn thay đổi)** — vai chính là thông báo trước về số lượng hủy・ngày dự kiến trả lại・tiền phạt hợp đồng
4. Viết lại tài liệu đặc tả thành v2
5. Quyết định có bổ sung các mục đơn đăng ký・phê duyệt vào danh sách mục hay không (tùy kết luận của ②)
