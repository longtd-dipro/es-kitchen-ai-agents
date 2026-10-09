# Danh sách mục master (Dòng máy・Tùy chọn・Giảm giá)

> Ngày tạo: 2026/09/16　Đối tượng: **chỉ Web Vận hành** (không hiển thị trên Web Doanh nghiệp)
> Các mục phía cơ sở・hợp đồng con xem §0.6〜§0.7 của "**Danh sách mục Doanh nghiệp・Cơ sở・Hợp đồng・Hợp đồng con**", tab "Thiết bị・Tùy chọn" của cơ sở, và "Biến động thiết bị", "Biến động tùy chọn・giảm giá" của hợp đồng con.
> Cùng nội dung có thể lọc bằng bản Excel `Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.xlsx` (**phần bổ sung 2026/10/01 chỉ phản ánh vào md. Excel chưa cập nhật, md là bản chuẩn**).
> Cập nhật 2026/10/01: bổ sung Q-A〜Q-E・O12 (Tùy chọn OP000024〜035, loại・đối tượng của số tiền, điều kiện giảm giá và "tham chiếu phí gói"), U5 (trạng thái → trạng thái sử dụng). Quyết định: `00_Quyết_định/Quyết_định_STEP3_Bổ_sung_Thiếu_sót_Master_Tùy_chọn_Giảm_giá_20261001.md`
> 2026-10-03 cập nhật: sửa theo `docs/決定台帳.md` (DC000003・OP000022・thuê tủ đông của khách cũ・thời gian sử dụng tối thiểu・phí vi phạm・tỷ lệ đông lạnh・nhập chữ 1 dòng) và định nghĩa Tùy chọn・Giảm giá (hong trả lời 2026-10-03 #1〜11・tối #5). Chỗ đã sửa có ghi "(Cũ: …. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá)", chỗ chưa quyết có gắn "⚠️ Cần xác nhận (2026-10-03)". Chuẩn cho từng ID của Tùy chọn・Giảm giá là bảng ở **Phần II "Những điều đã quyết ngày 2026/10/03"**.

---

## 0. Cách đọc tài liệu này

### 0.0 Vai trò của 3 master

| Master | Chứa gì | Quan hệ với Phase 1 |
|---|---|---|
| **Master Dòng máy** (`RF`/`VM`/`MW`/`HW`/`BX` + 6 chữ số) | Bản thân thiết bị. Đặc tả・ảnh・ô theo loại dòng máy (layout máy bán hàng tự động)・phí ban đầu／phí hàng tháng (chưa thuế)・số tiền thu hồi khi hủy・**thời gian sử dụng tối thiểu**・xác định miễn phí (theo course) | **Có màn hình** (đã đối chiếu với màn hình hiện hành ngày 2026/09/17). Phase 2 thêm BX (hộp vật tư)・cơ sở đang cho thuê. **Không có phiên bản giá (lịch sử điều chỉnh) (quyết định 2026/09/25)** |
| **Master Tùy chọn** (`OP` + 6 chữ số) | Những thứ không phải vật thể. Thêm số lần giao hàng・phí giao hàng theo khu vực・lắp đặt hộ・phí thủ tục・phạt | **Mới** (trước đây quản lý bên ngoài hệ thống) |
| **Master Giảm giá** (`DC` + 6 chữ số) | Khuyến mãi・đại lý・chuyển từ công ty khác・giới thiệu・volume・chênh lệch nâng cấp Standard (Cũ: chênh lệch điều chỉnh phí) | **Mới** (như trên) |

**Thiết bị không phải tùy chọn mà là master Dòng máy.** Ví dụ tùy chọn trong đặc tả yêu cầu có "hộp vật tư, lắp đặt tủ lạnh", nhưng trùng với master Dòng máy nên đã loại. Hộp vật tư đăng ký vào master Dòng máy bằng `BX`, đặt **gói thuộc đối tượng thiết bị tiêu chuẩn là phí ban đầu 0・phí hàng tháng 0** (khi nào tính phí thì chỉ cần nhập số).

**Thời gian sử dụng tối thiểu do master Dòng máy giữ.** Vì mỗi dòng máy khác nhau, như tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng. Thời gian sử dụng tối thiểu của hợp đồng cha là **giá trị đại diện (tham chiếu) của thiết bị dài nhất**, còn **phí vi phạm được xác định theo từng thiết bị rồi cộng gộp**.

**Phí hủy khi hủy trong thời gian sử dụng tối thiểu được tính từ "số tiền thu hồi khi hủy (chi phí hỗ trợ thiết bị)" của từng dòng máy** (quyết định 2026/09/17. Phát sinh cả với gói được miễn phí). **Phí vi phạm = số tiền thu hồi × số tháng còn lại ÷ thời gian sử dụng tối thiểu (tủ lạnh 3・máy bán hàng tự động 12), tính theo từng thiết bị rồi cộng gộp. Thời gian tạm ngưng không tính vào thời gian sử dụng tối thiểu** (sổ cái "Phí vi phạm", "Tạm ngưng và thời gian sử dụng tối thiểu" 2026-10-01). (Cũ: cách ghi lấy nguyên số tiền thu hồi làm phí hủy cho 1 máy. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá)

**Phí thu hồi do master Tùy chọn giữ ở "Phí thu hồi thiết bị" (OP000022・phí một lần・0 yên) (chuyển từ master Dòng máy ngày 2026/09/29).** Giữ 0 yên, khi cần thì vận hành nhập số tiền ở hợp đồng con (hong trả lời 2026-10-03 #2・sổ cái "OP000022"). (Cũ: không ghi ID／không dùng ¥5,000 tạm đang làm dở. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) Vì thu hồi cũng không thu thêm phí nên không có động lực nào để thúc giục thu hồi. Do đó việc quên thu hồi chỉ được bảo đảm bằng phát hiện "ngày trả dự kiến < hôm nay và số lượng chưa trả > 0" (tab "Cho thuê・Lịch sử" của master Dòng máy cũng xem được theo từng dòng máy).

**Phí vận chuyển・công việc cũng do master Tùy chọn giữ (2026/09/29).** Phí giao thiết bị (1 máy ¥4,800／từ 2 máy ¥7,800)・phụ phí công việc cầu thang (+¥3,000)・phí thu hồi thiết bị (hiện 0 yên) được quyết định theo số máy・tòa nhà・công việc, không phải theo dòng máy. Số tiền tiêu chuẩn chỉ là mức tham khảo (28-16), số tiền thực tế sửa ở biến động của hợp đồng con.

**Các ô nhập cho tùy chọn không liên động chỉ gồm tên・phân loại・loại phí・đơn vị・số tiền tiêu chuẩn・thuế suất・phân loại công khai・trạng thái (2026/09/29).** Mục hợp đồng liên động・điều kiện liên động・cách lấy số lượng・không khớp liên động chỉ hiện ra với loại A. Không có tự động ghi nhận (do loại liên động quyết định)・có được trùng hay không (do loại phí quyết định)・gói đối tượng (không có quy định).

### 0.1 Vì sao tạo master Tùy chọn・Giảm giá

Phí tùy chọn và giảm giá từ trước đến nay **được giữ ngoài hệ thống (bảng quản lý)**. Vì trong hợp đồng không có chỗ để đặt, nên

- **Sự thật "cơ sở này đang ký tùy chọn thêm số lần giao hàng" không còn lưu ở đâu** (chỉ có một dòng số tiền trong số tiền thanh toán ①)
- **Tùy chọn 0 yên biến mất** (phí lắp đặt nằm trong gói, v.v.)
- Khi tạo hợp đồng con tháng sau, **không có gốc để biết nên sao chép cái gì**
- Giảm giá chỉ có 1 mục "áp dụng giảm giá", **không nhập được việc áp dụng đồng thời khuyến mãi + đại lý + volume**

là tình trạng trước đây. Vì vậy tạo **master Tùy chọn** và **master Giảm giá**, thống nhất cùng dạng với việc cho thuê thiết bị.

### 0.2 Đăng ký ở hợp đồng con, xem ở cơ sở

| | Chủ sở hữu của sự thật kéo dài | Nơi đăng ký | Số tiền |
|---|---|---|---|
| Thiết bị | Cơ sở "Thiết bị・Tùy chọn" | Hợp đồng con "Biến động thiết bị" | Dòng khoản mục của ① (model) |
| **Tùy chọn** | **Hợp đồng con (theo tháng chu kỳ)** | **Hợp đồng con "Biến động tùy chọn・giảm giá"** | Dòng khoản mục của ① (option) |
| **Giảm giá** | Như trên | Như trên + Nhập CSV áp dụng (phía trên danh sách. Nút ở tab chi tiết đã bỏ ngày 2026-10-05) | Dòng khoản mục của ① (discount・số âm) |

(Cũ: "chủ sở hữu của sự thật kéo dài" của tùy chọn・giảm giá = cơ sở "Thiết bị・Tùy chọn" (danh sách áp dụng của cơ sở). Sửa theo 28-144 ② "Tùy chọn・giảm giá… giữ ở hợp đồng con theo tháng chu kỳ", "bỏ… 'danh sách áp dụng' của cơ sở", 28-145 ⑥ "Ở tab 'Thiết bị・Tùy chọn' của cơ sở, hiển thị bằng bảng tùy chọn・giảm giá của hợp đồng con tháng chu kỳ hiện tại". Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá)

**Chỗ sửa được chỉ có một.** Tab "Thiết bị・Tùy chọn" của cơ sở **chỉ xem tùy chọn・giảm giá của hợp đồng con tháng chu kỳ hiện tại**, việc đăng ký bắt đầu・dừng làm ở hợp đồng con (Cũ: danh sách áp dụng của cơ sở chỉ xem. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá). Vì tùy chọn hay giảm giá luôn là chuyện "từ tháng nào", và tháng đó chính là hợp đồng con. Phí cũng nằm trong ① của cùng hợp đồng con.

### 0.3 Mục hợp đồng và "trường hợp liên quan／không liên quan"

Tùy chọn có loại **liên quan đến mục đã có sẵn trong hợp đồng** và loại **không liên quan**. Điểm này được gói vào 1 cột (**mục hợp đồng liên động**).

| | Quan hệ với phía hợp đồng | Ví dụ | Ai là chuẩn | Nơi đăng ký |
|---|---|---|---|---|
| **A Có liên động (hệ thống định nghĩa)** | Hợp đồng đã có mục | Số lần giao hàng／ES-QR／chế độ khách／người dùng dùng tiền mặt／giới hạn cung cấp hàng tháng (phí giao hàng theo khu vực liên động theo tỉnh đã bỏ・2026/09/29) | **Mục hợp đồng là chuẩn** | Sửa mục hợp đồng (không đăng ký ở biến động) |
| **Không liên động・loại phí là phí hàng tháng** (B trước đây) | Hợp đồng không có mục. Đã gắn thì kéo dài mãi | Phí quản lý thiết bị／phí giao hàng theo khu vực (số tiền đổi theo công ty giao hàng nên không liên động・2026/09/29)／phí thủ tục | Hợp đồng con (Cũ: danh sách áp dụng của cơ sở. 28-144. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) | Biến động hợp đồng con |
| **Không liên động・loại phí là phí một lần** (C trước đây. Phí ban đầu đã gộp vào phí một lần ngày 2026/09/29) | Chỉ một lần | Lắp đặt hộ／tăng kích thước／lắp đặt lại／phạt chưa kiểm tra | Hợp đồng con (Cũ: danh sách áp dụng của cơ sở. 28-144. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) | Biến động hợp đồng con |

> 2026-10-03: Trong các ví dụ trên, "phí quản lý thiết bị" (OP000012) không đưa vào master cho đến khi khách hàng xác nhận (hong trả lời #4). "Phí thủ tục" là tên hiển thị trên hóa đơn của OP000016 (chưa kiểm kê・phí một lần ¥3,000・tự động). "Phạt chưa kiểm tra" là tên cũ của OP000016. Tên hiển thị trên hóa đơn của chi phí ban đầu (OP000008) là "Chi phí ban đầu" (hong trả lời #3).

**(Quyết định 2026/09/28) Loại A vận hành không được tự do tạo.** Hệ thống định nghĩa trước theo từng mục hợp đồng liên động, vận hành chỉ sửa được tên hiển thị・số tiền・trạng thái, v.v. (không thể đăng ký mới・xóa loại A). **"Liên tục／một lần" của tùy chọn không liên động không biểu thị bằng loại liên động mà bằng loại phí** (phí hàng tháng = liên tục, phí ban đầu・phí một lần = một lần). Lựa chọn loại liên động chỉ có 2: "A liên động với mục hợp đồng (hệ thống định nghĩa)／không liên động".

**Loại A là "trường hợp liên quan".** Khi đổi số lần giao hàng từ 8 lần → 12 lần, không phải gắn tùy chọn riêng mà **phí phát sinh như kết quả của việc đổi số lần giao hàng**. Master Tùy chọn trở thành bảng giá "khi giá trị đó thì tính bao nhiêu". Đây là ranh giới để không tạo ra nơi đăng ký trùng.

**Loại A phát hiện việc bỏ sót.** Batch hằng ngày liệt kê các cơ sở có giá trị mục hợp đồng và dòng khoản mục đang có không khớp nhau. Cùng cách nghĩ với việc phát hiện thu hồi thiết bị chưa hoàn tất, là biện pháp bảo đảm khi ghi nhận tự động bị lỗi.

### 0.4 Không đưa thiết bị vào tùy chọn

Ví dụ tùy chọn trong đặc tả yêu cầu có "hộp vật tư, lắp đặt tủ lạnh", nhưng **trùng với master Dòng máy**. Cứ để vậy thì việc thêm hộp vật tư có thể đăng ký được cả từ "Biến động thiết bị" lẫn từ "Tùy chọn".

- Thêm hộp vật tư → **Biến động thiết bị (cho thuê thêm)**, phí thuộc **master Dòng máy**
- Master Tùy chọn chỉ giữ **những thứ không phải vật thể** … thêm số lần giao hàng・phí giao hàng theo khu vực・lắp đặt hộ・phí thủ tục・phạt, v.v.

### 0.5 "Giảm giá tùy chọn" biểu thị bằng đối tượng áp dụng

Nếu cho master Giảm giá có **đối tượng áp dụng**, thì "giảm giá là một tùy chọn" và "giảm giá cho tùy chọn" đều xử lý cùng một dạng.

| Đối tượng áp dụng | Ví dụ |
|---|---|
| Phí gói | Miễn phí chênh lệch cho khách hiện hữu nâng từ Light → Standard (tự động tính Standard − Light. REQ-PM-032・Mẫu B・28-170). **DC000021 Giảm giá chuyển từ Light cũ → Standard** (Cũ: DC000003 Chênh lệch nâng cấp Standard. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| **Phí tùy chọn** | Miễn phí tùy chọn thêm số lần giao hàng |
| Phí thiết bị | Giảm phí hàng tháng của tủ lạnh |
| Phí ban đầu | Giảm giá chuyển từ công ty khác |
| Toàn bộ hóa đơn | Chiết khấu volume |

**Giảm giá cũng có loại "hàng tháng／một lần" (quyết định 2026/09/30 28-172).** Cùng cách nghĩ với loại phí của tùy chọn (phí hàng tháng = liên tục／phí một lần = 1 lần). Giảm giá hàng tháng thì từ hợp đồng con được gắn, trong thời gian áp dụng (vô thời hạn／chỉ định số tháng), mỗi tháng có một dòng giảm giá trong ①; giảm giá một lần thì chỉ có 1 dòng trong ① của hợp đồng con được gắn (ví dụ: giảm giá chuyển từ công ty khác). "Thời gian áp dụng" ở danh sách hiển thị là "Hàng tháng・mãi mãi／Hàng tháng・N tháng／Một lần".

**(2026-10-03) Gộp DC000003 vào DC000021 "Giảm giá chuyển từ Light cũ → Standard", DC000003 chuyển trạng thái sử dụng thành "Kết thúc" (không dùng lại ID)** (sổ cái "DC000003"・hong trả lời #5). Các quy tắc ở đoạn dưới (28-170〜175) kế thừa sang DC000021. Nội dung DC000021: giảm hàng tháng (Standard − Light) để phí cơ bản bằng giá ES Light (tủ lạnh) của cùng gói／kéo dài đến khi vận hành gỡ khỏi hợp đồng／chỉ doanh nghiệp・cơ sở đã có từ trước khi phát hành／"hạn đăng ký" có thể để trống = ngày kết thúc thời gian tiếp nhận của master Giảm giá có thể để trống (danh sách vấn đề 7-2). **Tiền thuê tủ đông không gộp vào giảm giá, tính riêng theo phí hàng tháng của master Dòng máy** (sổ cái "Thuê tủ đông của khách cũ"). (Cũ: ghi là DC000003 Chênh lệch nâng cấp Standard. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá)

> **Cách gắn (2026-10-03 hong trả lời M1＝A)**: Khi phê duyệt việc đổi gói của khách hiện hữu (Light → Standard), ở màn hình phê duyệt **DC000021 được tích sẵn**. Vận hành có thể bỏ tích. (Cũ: vận hành gắn thủ công・không tự động gắn khi phê duyệt 〈28-173〉)

**Chênh lệch nâng cấp Standard (DC000003 → từ 2026-10-03 là DC000021) được gắn khi khách hiện hữu = khách đã ký hợp đồng từ trước khi phát hành chức năng này nâng từ Light lên Standard** (28-170・28-171). Hàng tháng・vô thời hạn. **Ở màn hình phê duyệt đổi gói được tích sẵn, vận hành có thể bỏ tích** (M1＝A. Cũ: vận hành gắn thủ công・không tự động gắn khi phê duyệt). Có thể gắn hàng loạt bằng CSV. Khách hàng (Web Doanh nghiệp) không thể gắn・gỡ (28-173). Sau khi điều chỉnh phí, vẫn tự động tính Standard − Light tại thời điểm đó (28-174). Phần của khách hiện hữu được **đăng ký bằng chuyển đổi dữ liệu**. Vì ngày bắt đầu hợp đồng của hợp đồng đã chuyển có thể khác thực tế nên không xác định đối tượng bằng ngày bắt đầu hợp đồng (28-175).

**Có thứ tự khi áp dụng chồng.** Nếu khuyến mãi 20% và đại lý ¥5,000 áp dụng đồng thời thì số tiền đổi theo thứ tự áp dụng. **Thứ tự áp dụng nhập theo từng giảm giá (quyết định 2026/09/25).** Mức tham khảo khi phân vân là "**số tiền trước・tỷ lệ sau**".

**Không giữ "số tiền doanh nghiệp chịu (số tiền nhân viên chịu)" và điều chỉnh giá ở đây.** Vì đó là điều chỉnh một lần theo từng cơ sở, không phải giảm giá đăng trong danh mục. Giữ nguyên là mục nhập của hợp đồng con, số tiền hiện ở dòng khoản mục của ①.

### 0.6 Điều chỉnh phí quản lý bằng lịch sử thay đổi (thay đổi 2026/09/28)

Khi đổi số tiền của tùy chọn, **ghi đè số tiền tiêu chuẩn và lưu vào lịch sử thay đổi: trước → sau・người đổi・ngày giờ (không giữ số cơ sở bị ảnh hưởng: thay đổi master không ảnh hưởng hợp đồng・2026-10-05)**. Không giữ phiên bản giá (①・②…) (trước đây là "thêm phiên bản"). Dòng khoản mục của hợp đồng con đã xác nhận・đã thanh toán không đổi, từ hợp đồng con chưa xác nhận sẽ dùng số tiền mới. "Danh sách áp dụng" của master Tùy chọn cũng không giữ (cơ sở đang áp dụng xem ở tab "Thiết bị・Tùy chọn" của cơ sở).

### 0.7 Áp dụng hàng loạt cho 800 cơ sở

Master Giảm giá có **Nhập CSV áp dụng** phía trên danh sách (ID giảm giá + ID cơ sở + tháng bắt đầu／kết thúc áp dụng. Cũ: nhập CSV hàng loạt ở tab chi tiết = bỏ ngày 2026-10-05). Vì đã quyết định vận hành áp dụng chênh lệch nâng cấp Standard (**DC000021 Giảm giá chuyển từ Light cũ → Standard**. Cũ: DC000003. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) cho khách hiện hữu đã nâng từ Light lên Standard (khoảng 800 cơ sở) (REQ-PM-033・28-170. Cũ: ghi là "chênh lệch do điều chỉnh phí" là sai). Giảm giá đã nhập sẽ gắn vào **hợp đồng con** của từng cơ sở (từ tháng bắt đầu áp dụng trở đi) (Cũ: tiền đề gắn vào danh sách áp dụng của cơ sở. 28-144. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá). Trước khi nhập có màn hình hiện số dòng và khác biệt, dòng không tìm thấy ID cơ sở・dòng đã đang áp dụng sẽ là lỗi và không nhập.

### 0.8 Làm gì ở đâu (phân vân thì xem đây)

| Chỗ phân vân | Cách làm |
|---|---|
| Đăng ký bắt đầu・dừng | "Biến động tùy chọn・giảm giá" của hợp đồng con |
| Muốn đổi loại liên động A | Đổi mục phía hợp đồng (số lần giao hàng・ES-QR, v.v.). Bản thân tùy chọn loại A do hệ thống định nghĩa, vận hành không tạo được (2026/09/28) |
| Muốn sửa số tiền | Dòng khoản mục của số tiền thanh toán ① ở hợp đồng con |
| Muốn điều chỉnh phí | Sửa số tiền tiêu chuẩn của master Tùy chọn (lưu vào lịch sử thay đổi. Không giữ phiên bản giá・2026/09/28) |
| Giảm giá hàng loạt cho 800 cơ sở | "Nhập CSV áp dụng" ở danh sách master Giảm giá (Cũ: nhập CSV hàng loạt ở chi tiết・bỏ 2026-10-05) |
| Muốn thêm tủ lạnh・hộp vật tư | Không phải tùy chọn mà là "Biến động thiết bị" của hợp đồng con |
| Tùy chọn 0 yên | Để lại ở hợp đồng con như đang áp dụng (ở tab "Thiết bị・Tùy chọn" của cơ sở thấy phần của tháng chu kỳ hiện tại). Không hiện trên hóa đơn (Cũ: để lại ở danh sách của cơ sở như đang áp dụng. 28-144・28-145 ⑥. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| Phí thu hồi khi thu hồi thiết bị | OP000022 Phí thu hồi thiết bị là 0 yên. Chỉ khi cần thì vận hành nhập số tiền ở hợp đồng con (hong trả lời 2026-10-03 #2) |
| Tiền thuê máy bán hàng tự động | Gắn OP000037 Thuê máy bán hàng tự động (hàng tháng) ở hợp đồng con, số tiền nhập theo từng hợp đồng (giá trị ban đầu = master Dòng máy. Quy tắc thanh toán 2-12) |

### 0.9 Những thứ thêm vào master Dòng máy ở Phase 2

| Mục | Vì sao thêm |
|---|---|
| **Thêm "Hộp vật tư" (BX) vào loại dòng máy** | Hộp vật tư cũng quản lý bằng master Dòng máy. Hiện chưa có đăng ký |
| ~~Phí thu hồi~~ | **2026/09/29: đã chuyển sang "Phí thu hồi thiết bị" của master Tùy chọn** (vì phí vận chuyển・công việc được quyết định theo số máy・tòa nhà・công việc chứ không phải dòng máy) |
| **Phiên bản giá (lịch sử điều chỉnh)** | Không ghi đè số tiền mà thêm phiên bản. Hợp đồng con đã thanh toán vẫn tham chiếu phiên bản cũ. **Chỉ master Gói (Plan). Master Dòng máy không giữ (quyết định 2026/09/25). Master Tùy chọn cũng không giữ (quyết định 2026/09/28・quản lý bằng lịch sử thay đổi)** |
| **Cơ sở đang cho thuê** | Hiện đang cho thuê dòng máy này mấy máy ở đâu. Dùng để liên lạc thu hồi・thay thế và phát hiện thu hồi chưa hoàn tất theo từng dòng máy |
| **Phí thuê hàng tháng (máy bán hàng tự động)** | Khi có phí thuê riêng ngoài phí hàng tháng (REQ-CT-106). **2026-10-03: dùng làm giá trị ban đầu của số tiền tùy chọn OP000037 "Thuê máy bán hàng tự động" (hàng tháng). Thanh toán qua OP000037, nhập số tiền theo từng hợp đồng** (quy tắc thanh toán 2-12・hong trả lời #7) (Cũ: cần xác nhận. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| **Phân loại công khai** (hiện trên đơn đăng ký của Web Doanh nghiệp／chỉ vận hành chọn được) | Hiện chưa có ô này. Nếu không có thì cả máy làm nóng cũng sẽ xếp vào danh sách thiết bị của biểu mẫu đăng ký doanh nghiệp. Master Tùy chọn có cùng ô này (quyết định 2026/09/18) |
| **Số máy tối đa khi đăng ký** | Mỗi cơ sở đăng ký tối đa mấy máy (ví dụ: tủ lạnh 3 máy・lò vi sóng 2 máy). Phần vượt quá chuyển sang tư vấn với người phụ trách (quyết định 2026/09/18) |

**Khi chọn loại dòng máy thì chỉ hiện ô của loại đó.** Máy bán hàng tự động tạo ô bằng "Tạo layout" từ số tầng (hàng)・số cột, mỗi ô quyết định loại chứa (Single 8／Single 10／Double 8／Double 10／Belt 5) và bật／tắt. Phí thuê hàng tháng cũng chỉ nhập được khi là máy bán hàng tự động.

### 0.9-2 Những chỗ đã sửa sau khi đối chiếu với màn hình hiện hành (2026/09/17)

Cho đến nay "các mục hiện có" của master Dòng máy được dựng từ đặc tả yêu cầu. **Đã đối chiếu từng mục với ảnh chụp màn hình hiện hành (tủ lạnh・lò vi sóng・máy làm nóng・máy bán hàng tự động・thao tác layout máy bán hàng tự động) và làm lại.**

| Điều đã quyết | Nội dung |
|---|---|
| Phí chưa thuế | Phí ban đầu・phí hàng tháng giữ dạng chưa thuế (vào dòng khoản mục ① của hợp đồng con cũng giữ chưa thuế, thuế tiêu thụ cộng thêm trên hóa đơn・2026/09/25). **Thuế suất chọn từ master Thuế suất (dropdown dùng chung toàn bộ màn hình. Mặc định 10%)** (Cũ: không giữ ô thuế suất・thiết bị tính 10%. Danh sách vấn đề 2026-10-03 "thuế suất là dropdown master Thuế suất… áp dụng cả cho dòng máy". Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| Số tiền thu hồi khi hủy | "Số tiền thu hồi khi hủy (chi phí hỗ trợ thiết bị)" trên màn hình hiện hành được xử lý là **phí hủy trong thời gian sử dụng tối thiểu** |
| Loại dòng máy | 4 loại hiện hành (tủ lạnh・tủ đông／máy bán hàng tự động／lò vi sóng／máy làm nóng) + hộp vật tư (thêm ở P2). Đã bỏ loại chỉ riêng tủ đông (FZ) |
| Xác định miễn phí | ~~2 loại theo course (Light／Standard). Nếu tổng giới hạn cung cấp hàng tháng từ giá trị chỉ định trở lên thì cả phí ban đầu・phí hàng tháng miễn phí~~ **→ Quyết định 2026/09/30 28-182: bỏ khỏi master Dòng máy. Thiết bị nằm trong gói (miễn phí) chỉ do "thiết bị cho thuê tiêu chuẩn" của master Gói (Plan) quyết định.** Master Dòng máy chỉ còn "gói bao gồm tiêu chuẩn (tham chiếu)". Phí hủy vẫn nằm ngoài đối tượng |
| Cấu trúc màn hình | Bản demo vẫn 3 tab, sắp xếp nội dung cho khớp màn hình hiện hành |
| Thuật ngữ | "Thời gian ký hợp đồng tối thiểu" → "Thời gian sử dụng tối thiểu", "Hot Water" → "Máy làm nóng (Hot Warmer)", "Gói phí sử dụng lắp đặt tiêu chuẩn" → "Gói thuộc đối tượng thiết bị tiêu chuẩn" (cách viết của màn hình hiện hành) |

**Các mục đã thay thế・bãi bỏ** có ở sheet "04_統合した項目" của Excel (phương thức làm lạnh・khoảng nhiệt độ và ngày cập nhật bị bãi bỏ vì không có trên màn hình hiện hành).

**Những điều không đọc ra được từ màn hình hiện hành, cần xác nhận**

- Lựa chọn của trạng thái hiệu lực (trên màn hình chỉ thấy "Hiệu lực")
- Lựa chọn nhà sản xuất của từng loại và cách giữ (master nhà sản xuất hay giá trị cố định)
- Công thức tính số lượng chứa tối đa của máy bán hàng tự động (ví dụ 468 trên màn hình không khớp với tổng đơn giản các số của từng ô)／có đếm ô vô hiệu không／ý nghĩa của các số loại chứa
- Khi tạo lại layout thì các thiết lập trước đó có mất không
- Đơn vị nhiệt độ giữ ấm của máy làm nóng
- Ở ví dụ tủ lạnh, ô ID dòng máy là RC000001 còn tiêu đề là RF000001, không khớp nhau
- Quan hệ giữa số tiền thu hồi khi hủy và "phí vi phạm hủy là số tiền cố định chung (master Tùy chọn・Phí khác)" trước đây

### 0.9-3 Cách hiển thị thiết bị trên biểu mẫu đăng ký doanh nghiệp (quyết định 2026/09/18・2026/09/29 đổi cấu hình tủ lạnh)

> **【Thay thế bằng quyết định 2026/09/29】Tủ lạnh đăng ký nguyên bảng "Kích thước tủ lạnh theo gói" của tài liệu khách hàng vào "thiết bị cho thuê tiêu chuẩn" của master Gói (Plan)** (không tự tính từ dung tích. Chuẩn xem `Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md`). "1 máy・kích thước chọn lại được khi số lượng chứa tối đa ≧ số suất ES" và bảng 46L／84L／120L bên dưới là **cũ** (2026/09/18) và giữ lại.
>
> | Gói | Số lần giao hàng | Tiêu chuẩn | Thay thế | Tư vấn |
> |---|---|---|---|---|
> | ES50 | 1 | 48L×1 | — | — |
> | ES100 | 2 | 48L×1 | — | — |
> | ES150 | 2 | 84L×1 | — | — |
> | ES200・ES250 | 2 | 105L×1 | — | — |
> | ES300 | 2 | 142L×1 | — | — |
> | ES400・ES500 | 2 | 84L×1＋142L×1 | 84L×2 | — |
> | ES600 | 2 | 105L×1＋142L×1 | — | ○ |
> | ES650〜ES950 | 4 | 105L×1＋142L×1 | — | ○ |
> | ES1000・ES1100 | 4 | 142L×2 | — | ○ |
>
> - Dòng máy: tủ trưng bày lạnh 48L (RF000001)／84L (RF000002)／105L (RF000003)／142L (RF000004). Phí hàng tháng tạm ¥5,000／¥6,000／¥6,500／¥7,000, số lượng chứa tối đa・kích thước cần xác nhận.
>   **Phí hàng tháng tạm tính theo từng dòng máy (kích thước)** (¥5,000／¥6,000／¥6,500／¥7,000 ở trên. Tủ đông・máy bán hàng tự động cũng theo từng dòng máy, hộp vật tư ¥0). Để phát sinh chênh lệch theo kích thước 〔hong trả lời 2026-10-03 (M8＝A)〕. (Cũ: phương án sáng 10/03 "tủ lạnh／tủ đông ¥3,000・máy bán hàng tự động ¥5,000 đồng giá" không dùng)
> - **Chọn từ nhiều máy・mẫu (tiêu chuẩn／thay thế)**. ES400・500 khách có thể chọn tiêu chuẩn hoặc thay thế khi đăng ký. Từ ES600 trở lên, Web Doanh nghiệp chỉ hiển thị cấu hình tiêu chuẩn, không cho chọn kích thước (vận hành tư vấn rồi đổi).
> - Căn cứ dung tích là **số lượng giao 1 lần** (giới hạn cung cấp hàng tháng theo nhóm nhiệt độ ÷ số lần giao hàng tiêu chuẩn・28-153・28-154). OPEN ⑬ được giải quyết bằng cách này.
> - Dù mẫu thay thế rẻ hơn tiêu chuẩn cũng không hoàn tiền (chỉ thu chênh lệch khi dương). Việc có cho đổi sang kích thước lớn hơn tiêu chuẩn (ví dụ: 84L ở ES50) bằng thu chênh lệch hay không cần xác nhận.
> - Tủ đông cũng có bảng cùng dạng (chờ tài liệu・28-157). Hộp vật tư xem §III-10.


Thiết bị trên biểu mẫu đăng ký doanh nghiệp chia thành **phần nằm trong gói** và **phần muốn thêm**.

| | Nội dung | Thao tác của khách | Phí |
|---|---|---|---|
| **Thiết bị nằm trong gói** | **ES Standard: 1 tủ lạnh ＋ 1 tủ đông**, **ES Light: 1 tủ lạnh**. ＋ hộp vật tư (theo số lượng của gói). **Số máy do gói・course quyết định** | **Chọn lại được kích thước** (chỉ loại chứa đủ số suất). Không đổi được số máy | **Cho thuê miễn phí** |
| **Thiết bị muốn thêm** | Phần còn lại, và số máy vượt quá phần nằm trong gói | Chọn dòng máy (kích thước) và số máy | **Có phí** (phí hàng tháng của master Dòng máy) |

**Thiết bị cho thuê miễn phí thay đổi theo course** (quyết định 2026/09/18).
**ES Standard là 1 tủ lạnh＋1 tủ đông**, **ES Light là 1 tủ lạnh**. Hộp vật tư cả hai đều theo số lượng của gói.
Khách Light muốn tủ đông thì chọn từ "Thiết bị muốn thêm" (có phí).

| Gói・Course | Thiết bị cho thuê miễn phí | Hộp vật tư |
|---|---|---|
| Gói 50 Light | Tủ trưng bày lạnh 46L × 1 | 1 cái |
| Gói 50 **Standard** | Tủ trưng bày lạnh 46L × 1　＋　**Tủ đông 60L × 1** | 1 cái |
| Gói 100 Light | Tủ trưng bày lạnh 84L × 1 | 2 cái |
| Gói 100 **Standard** | Tủ trưng bày lạnh 84L × 1　＋　**Tủ đông 100L × 1** | 2 cái |
| Gói 150 Light | Tủ trưng bày lạnh 120L × 1 | 3 cái |
| Gói 150 **Standard** | Tủ trưng bày lạnh 120L × 1　＋　**Tủ đông 150L × 1** | 3 cái |

**Các tổ hợp ở trên là giá trị tạm của bản demo.** Nội dung thực tế dự kiến đăng ký vào "thiết bị cho thuê tiêu chuẩn" của master Gói (Plan)
**theo từng gói・course**.
**(Quyết định 2026/09/30 28-182) Thiết bị được miễn phí chỉ do thiết bị cho thuê tiêu chuẩn của master Gói (Plan) quyết định.** Master Dòng máy không giữ "gói đối tượng miễn phí ban đầu・hàng tháng" (ngưỡng theo course).

> **(2026/09/29) "Hộp vật tư 1 cái／2 cái／3 cái" trong bảng trên được hủy.** Mặc định của hộp vật tư là bộ theo từng gói (3 loại hộp tiêu chuẩn + giỏ, hoặc loại tủ ngăn kéo + giỏ), chuẩn xem §III-10 (quyết định 28-160〜163). Cấu hình tủ lạnh (48L／84L／105L／142L・nhiều máy・mẫu tiêu chuẩn／thay thế) cũng đã thay đổi theo `Quyết_định_Master_tủ_lạnh_và_cấu_hình_theo_gói_20260929.md` (chưa phản ánh vào danh sách này).

**Kích thước tủ lạnh・tủ đông nằm trong gói có thể chọn lại** (quyết định 2026/09/18). Vì tùy gói có thể không cần kích thước lớn.
Tuy nhiên **chỉ loại chứa đủ số suất của hợp đồng**, và việc xác định dùng **"số lượng chứa tối đa" của master Dòng máy ≧ số suất ES của gói**.
Kích thước không đủ dung tích sẽ **bị làm xám trong dropdown và hiện lý do**.
Khi đổi gói mà kích thước đang chọn không còn đủ, **quay về kích thước tiêu chuẩn của gói đó**.

| Gói | Giao 1 lần | 46L (80 suất) | 84L (150 suất) | 120L (220 suất) |
|---|---|---|---|---|
| Gói 50 | 50 suất | Chọn được | Chọn được | Chọn được |
| Gói 100 | 100 suất | **Không chọn được** | Chọn được | Chọn được |
| Gói 150 | 150 suất | **Không chọn được** | Chọn được | Chọn được |

**Khi chọn kích thước lớn hơn tiêu chuẩn thì không thu phí bản thân máy mà chỉ thu chênh lệch** (quyết định 2026/09/18).

```
差額 ＝ 選んだ機種の月額料金 − 無料対象機種（プランの標準）の月額料金
```

**Nếu âm thì không làm gì** (chọn kích thước nhỏ hơn cũng không hoàn tiền).

| Gói (tiêu chuẩn) | 46L ¥4,000 | 84L ¥6,000 | 120L ¥8,000 |
|---|---|---|---|
| Gói 50 (tiêu chuẩn **46L**) | Miễn phí | **+¥2,000／tháng** | **+¥4,000／tháng** |
| Gói 100 (tiêu chuẩn **84L**) | Không chọn được | Miễn phí | **+¥2,000／tháng** |
| Gói 150 (tiêu chuẩn **120L**) | Không chọn được | Miễn phí (không hoàn tiền) | Miễn phí |

Chênh lệch được tạo ở dòng khoản mục của hợp đồng con ① với【phân loại nguồn＝model】, tên khoản mục dạng "Tên dòng máy (chênh lệch kích thước)".

**Dù kích thước không đủ dung tích, nếu khách có yêu cầu thì vận hành vẫn đổi được** (quyết định 2026/09/18).
Trên Web Doanh nghiệp không cho chọn để tránh nhầm, yêu cầu được tiếp nhận qua "ghi chú ngoài gói" hoặc liên hệ.
**Ở màn hình vận hành (cơ sở "Thiết bị・Tùy chọn"・hợp đồng con "Biến động thiết bị") không giới hạn dung tích, chỉ hiện cảnh báo**.
Vì tùy tần suất giao hàng hay cách đặt tồn kho mà có trường hợp vẫn chứa được.

**Khách hàng được yêu cầu chọn đến dòng máy (kích thước).** Vì phí khác nhau theo kích thước nên chỉ theo loại thì không báo giá được,
và việc có đặt vừa chỗ lắp đặt hay không chỉ khách hàng mới phán đoán được. Biểu mẫu hiện hành cũng hiển thị bằng tên dòng máy như "Tủ trưng bày lạnh 84L".
Vì vậy **không giữ** "dòng máy mặc định khi đăng ký (đại diện từng loại)".

**Thời gian sử dụng tối thiểu dùng nguyên giá trị của master Dòng máy.** Thời gian sử dụng tối thiểu của hợp đồng hiển thị trên màn hình là
**giá trị đại diện của thiết bị dài nhất** trong thiết bị nằm trong gói và thiết bị thêm (phí vi phạm xác định theo từng thiết bị rồi cộng gộp như trước).

### 0.9-4 Xác nhận master Dòng máy hiện hành có đủ không (2026/09/18)

Đã kiểm tra từng cái xem cách hiển thị thiết bị trên biểu mẫu đăng ký doanh nghiệp (§0.9-3) **có thực hiện được chỉ bằng các mục của master Dòng máy hiện hành hay không**.

| Cần cho biểu mẫu đăng ký | Master Dòng máy hiện hành | Đánh giá |
|---|---|---|
| Hiện tên dòng máy | Tên dòng máy | **Đủ** |
| Hiện ảnh | Ảnh dòng máy・ảnh chính | **Đủ** |
| Hiện kích thước (để phán đoán chỗ lắp đặt) | Rộng・sâu・cao | **Đủ** |
| Xác định dung tích (có chứa đủ số suất không) | **Số lượng chứa tối đa (tủ lạnh・tủ đông)**. Phần giải thích màn hình hiện hành cũng nói "đối chiếu với số lượng cung cấp hàng tháng của gói" | **Đủ** (nhưng xem ① bên dưới) |
| Tính phí hàng tháng・chênh lệch kích thước | Phí hàng tháng (chưa thuế) | **Đủ** |
| Hiện thời gian sử dụng tối thiểu | Thời gian sử dụng tối thiểu | **Đủ** |
| Thu hẹp dòng máy hiện trên đơn đăng ký | — | **Chưa đủ → thêm phân loại công khai** (§0.9) |
| Giới hạn số máy khi đăng ký | — | **Chưa đủ → thêm số máy tối đa khi đăng ký** (§0.9) |
| Gói nào・dòng máy nào・bao gồm mấy máy | "Gói đối tượng miễn phí ban đầu・hàng tháng" chỉ là **ngưỡng giới hạn cung cấp hàng tháng** theo course. **Chuyện số tiền, không biểu thị được dòng máy và số máy** | **Chưa đủ → phía master Gói (Plan) cần "thiết bị cho thuê tiêu chuẩn (dòng máy＋số máy)"** (② bên dưới) |
| Lấy phí theo tháng năm mong muốn bắt đầu hợp đồng | **Master Dòng máy không giữ phiên bản giá (quyết định 2026/09/25)**. Lấy phiên bản của master Gói (Plan)・master Tùy chọn | Không đổi |
| Hộp vật tư | **Hiện chưa có đăng ký** (BX thêm ở P2) | Dự kiến đã thêm ở P2 |

**Còn 4 việc cần quyết định mới.**

**① Bắt buộc "số lượng chứa tối đa" đối với dòng máy hiện ở Web Doanh nghiệp**
Hiện tại là "△" (tùy chọn). Nếu để trống thì không xác định được dung tích và có thể chọn cả kích thước không đủ.
Dòng máy có **phân loại công khai ＝ hiện trên đơn đăng ký của Web Doanh nghiệp thì số lượng chứa tối đa là bắt buộc**.

**② Chỉ với master Dòng máy thì không phân biệt được tủ lạnh và tủ đông**
Ngày 2026/09/17 đã **bỏ loại chỉ riêng tủ đông (FZ), gộp thành 1 loại "tủ lạnh・tủ đông"**.
Vì vậy nếu xác định "cùng loại thì thay thế được" thì **tủ trưng bày lạnh có thể bị thay bằng tủ đông**.
Cần một trong hai.

- **Phương án A (khuyến nghị)**　Cho dòng của "thiết bị cho thuê tiêu chuẩn" của master Gói (Plan) giữ **các dòng máy có thể thay thế**.
  Vì gói quyết định "ô này chọn từ 3 dòng máy này" nên không phải đụng master Dòng máy.
- **Phương án B**　Chia lại loại dòng máy của master Dòng máy thành "tủ lạnh" và "tủ đông". Sẽ thay đổi loại của màn hình hiện hành.

**③ Master Dòng máy không biểu thị được "báo giá riêng" của máy bán hàng tự động**
Phí hàng tháng là bắt buộc (○) nên không có cách biểu thị "không hiện số tiền".
Cách đơn giản là chuẩn bị **giá trị thứ 3 của phân loại công khai "hiện trên đơn đăng ký (số tiền báo giá riêng)"**.

**④ Số dùng để xác định dung tích**
Hiện đang xem theo "số lượng chứa tối đa ≧ số suất ES của gói". Khi số lần giao hàng nhiều lần,
số vào tủ lạnh mỗi lần có thể khác với số suất (Phần IV OPEN ⑬).

### 0.10 Chỗ đã giảm mục (2026/09/16)

Vì số ô trên một màn hình quá nhiều nên **đã gộp các mục chia quá nhỏ thành 1 ô**. Cột vật lý của cài đặt ghi gộp bằng dấu "/" ở cột tên vật lý nên dữ liệu giữ không giảm.

| Trước | Sau |
|---|---|
| Số tiền giảm (chưa thuế)／tỷ lệ giảm (%)／chuẩn chênh lệch tự động／số tiền tối đa (4 ô) | **Giá trị giảm** (1 ô・ô nhập đổi theo phân loại tính toán) |
| Course đối tượng／phương thức giao hàng đối tượng／gói đối tượng／mã đại lý đối tượng／giới hạn loại hợp đồng (5 ô) | **Điều kiện cơ sở có thể gắn** (chỉ 2 mục: mã đại lý đối tượng・giới hạn loại hợp đồng. Course・phương thức giao hàng・gói đã bỏ ngày 2026/09/29) |

Ô ở tab "Tính toán・Điều kiện" giảm từ 17 → 10. "Phát hiện không khớp liên động" của master Tùy chọn được chuyển sang **tab "Áp dụng・Lịch sử"** là nơi xem kết quả phát hiện.

### 0.11 Chú giải Phase

**Master Tùy chọn・master Giảm giá đều là P2 mới** (Phase 1 không có. Vì trước đây quản lý ngoài hệ thống).
**Master Dòng máy có màn hình nên có lẫn P1／P1→P2 đổi／P2 mới.** Bảng ở §0.9 là phần P2 mới.

### 0.12 Master Gói (Plan) (bổ sung 2026/09/30・quyết định 28-176)

Master Gói (Plan) mà 28-128 đã nói "bây giờ chưa làm" được đưa vào tài liệu này và demo (demo tích hợp, Quản lý master ＞ Master Gói (Plan)). **Ô của màn hình hiện hành (4 ảnh chụp màn hình 2026/09/30) là P1**, ô đã quyết định để thêm là **P2 mới**. Chủ sở hữu quyết định của các mục vẫn là `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md`.

| Vị trí đặt | Có ở màn hình hiện hành (P1) | Thêm ở Phase 2 (P2 mới) |
|---|---|---|
| Thiết lập gói (luôn hiện phía trên tab) | ID gói／tên gói công khai・quản lý／trạng thái công khai／tổng giới hạn cung cấp hàng tháng／hệ số cơ bản × bội số／course | Số người sử dụng dự kiến (để hiển thị). Mục "Chi tiết phí・miễn trách (chung của gói)": số tiền doanh nghiệp chịu (gồm thuế・1 suất)／thuế suất phần doanh nghiệp chịu／thuế suất phí cơ bản／phần doanh nghiệp chịu (chưa thuế・tự động tính)／số tiền miễn trách |
| Tab ES Standard・ES Light | Giới hạn trên・dưới của số lượng cung cấp hàng tháng nhóm đông lạnh (chỉ Standard)・lạnh・nhiệt độ thường／ghi chú／bảng gói giá (công khai・gói giá・thời gian bắt đầu・thời gian kết thúc・giá COOL便・ES配送便) | Số lần giao hàng tiêu chuẩn theo nhóm nhiệt độ／số lượng giao 1 lần (tự động)／tỷ lệ sắp hết (%)／cột chi tiết giá (phí cơ bản・phần doanh nghiệp chịu)／cột "chênh lệch nâng cấp Standard" ở bảng ES Light／bảng thiết bị cho thuê tiêu chuẩn (mẫu・dòng máy・số máy) và "quyết định sau khi tư vấn" |
| Tab lịch sử thay đổi | Ngày giờ thay đổi・nội dung thay đổi・người thay đổi | Phân loại thay đổi (nhập tay／nhập CSV) |

**Không giữ**: tỷ lệ đông lạnh (28-155)／tỷ lệ dịch vụ (REQ-PM-038)／bộ vật tư ban đầu (master Vật tư × Gói)／tùy chọn giao hàng・hợp đồng (master Tùy chọn).

> Không giữ tỷ lệ đông lạnh (sổ cái "Tỷ lệ đông lạnh" 2026-10-03・28-155). Số lượng đông lạnh do giới hạn cung cấp hàng tháng nhóm đông lạnh của gói quyết định. Tỷ lệ tạm như "đông lạnh 20／lạnh 80" không dùng ở bất cứ đâu.
>
> **Số lượng miễn phí của vật tư (2026-10-03 hong trả lời M6＝A)**: Số lượng miễn phí của vật tư theo từng gói được giữ bằng cách thêm cột **"Số lượng miễn phí hàng tháng"** vào **bảng "Vật tư × Gói" phía master Vật tư** (cùng bảng với bộ ban đầu của vật tư). Mỗi vật tư・mỗi gói một giá trị. **Số lượng miễn phí là số suất của gói** (ví dụ: gói 100 → vật tư nào cũng miễn phí đến 100 cái／tháng. Đúng như lời khách〔hong trả lời 2026-10-03〕). Vận hành sửa được theo từng vật tư. **Bộ ban đầu của vật tư (phần gửi lần đầu) là số lượng khác** (cột bộ ban đầu của cùng bảng). Cách xử lý số lần giao thêm như trước (từ lần giao thứ 2 trong cùng chu kỳ là OP000036). Phần đặt vượt quá tính theo giá・thuế suất của master Vật tư, giao hàng từ lần thứ 2 trong cùng chu kỳ là OP000036 (hong trả lời #1). Bảng này sẽ nhập được bằng CSV. ~~Không giữ ở master Gói (Plan).~~ **→ hong trả lời 2026-10-05 (thiết kế màn hình Q2＝A): màn nhập bảng này là thẻ "Thiết bị ban đầu・Vật tư nằm trong gói" của chi tiết master Gói (Plan) của Web Vận hành (bộ thiết bị ban đầu theo vật tư × course ＋ số lượng miễn phí hàng tháng 〈để trống＝số suất của gói〉). Không giữ ở phía master Vật tư (sổ cái F).**
>
> hong trả lời 2026-10-03 #10: số tiền miễn trách・số tiền doanh nghiệp chịu・hệ số cơ bản × bội số, **khi sửa trên màn hình thì có hiệu lực thực sự với thanh toán・đặt hàng**. Tỷ lệ sắp hết・số người sử dụng dự kiến để sau (khi đã quyết màn hình sử dụng).

**Đã thêm course ES Light (máy bán hàng tự động) (quyết định 2026/09/30 28-184).** Để không phải tính tay phí gói của cơ sở máy bán hàng tự động, master Gói (Plan) giữ cùng với ES Light (tủ lạnh). Tab (giới hạn trên・dưới lạnh・nhiệt độ thường・số lần giao hàng tiêu chuẩn・tỷ lệ sắp hết)／gói giá (**chỉ ES配送便**. Không gồm phí thuê máy bán hàng tự động＝thanh toán riêng bằng OP000037: sổ cái 2026/10/03. Cũ: gồm phí cho thuê máy bán hàng tự động)／thiết bị cho thuê tiêu chuẩn (**dòng máy bán hàng tự động bắt buộc・không đưa tủ lạnh và tủ đông vào** + hộp vật tư). "Course" chuyển thành chọn nhiều (ES Standard／ES Light (tủ lạnh)／ES Light (máy bán hàng tự động)). Cơ sở máy bán hàng tự động là hợp đồng con đã chọn ES Light (máy bán hàng tự động) (phương thức giao hàng cố định là ES配送便・28-19).

**Thiết bị nằm trong gói (miễn phí) chỉ do thiết bị cho thuê tiêu chuẩn của master Gói (Plan) quyết định (quyết định 2026/09/30 28-182).** Bỏ "Light／Standard_xác định miễn phí_số lượng cung cấp hàng tháng" của master Dòng máy, chỉ còn "gói bao gồm tiêu chuẩn (tham chiếu)". Để giảm công thiết lập, đã thêm **nhập CSV thiết bị cho thuê tiêu chuẩn** và **"Làm cùng cấu hình với Standard"** của ES Light (mặc định: có・tự động trừ tủ đông).

**Điểm nhận ra ở màn hình hiện hành và trả lời (2026/09/30 hong)**
- **28-177 (sửa)**: ID gói ở danh sách là ES0000001 (7 chữ số) và tất cả các dòng cùng 1 ID → danh sách cũng thành **ES＋6 chữ số** giống chi tiết, ID riêng theo từng dòng.
- **28-178 (kiểm tra khi lưu)**: giới hạn trên lạnh・nhiệt độ thường của ES Light vẫn lưu được khi là 80 (tổng 100) → có kiểm tra. ① Standard: giới hạn trên đông lạnh＋giới hạn trên lạnh・nhiệt độ thường **≧** tổng giới hạn cung cấp hàng tháng (sửa từ ＝ ở STEP5 Q5 2026/10/01. Thêm đông lạnh tùy ý thì có thể lớn hơn tổng・hong xác nhận 2026-10-05) ② Light: giới hạn trên lạnh・nhiệt độ thường＝tổng ③ giới hạn dưới≦giới hạn trên ④ số lần giao hàng tiêu chuẩn≧1 ⑤ giá≧phần doanh nghiệp chịu ⑥ bản công khai mỗi course 1 dòng・thời gian không chồng nhau. Demo chạy bằng nút lưu.
- **28-179**: "Hệ số cơ bản × bội số" là bội số nhân với số tiêu chuẩn (mỗi cơ bản 50 cái) mà vận hành thiết lập ở màn hình đặt hàng để tự động phản ánh vào đơn hàng của doanh nghiệp.
- **28-180**: "Công khai" của gói giá = "đang chọn" trong yêu cầu (giá hiện ở Web Doanh nghiệp・thế hệ dùng cho hợp đồng con mới・chỉ 1 dòng).
- Trong demo đăng ký・hợp đồng, gói được hiện bằng ID riêng cho từng course như "ES000012 ES Standard 100". Master Gói (Plan) hiện hành là **1 gói có 2 tab Standard・Light**, nên hợp đồng giữ bằng ID gói＋course ("loại menu (course)" của hợp đồng con) mới đúng. Cách ghi của demo sẽ sửa như sau.

---

# Phần I　Danh sách mục master

> **Quy tắc nhập chung (danh sách vấn đề 2026-10-03 "Quy tắc nhập chung"・sổ cái "Nhập chữ 1 dòng")**: chữ 1 dòng **tối đa 60 ký tự** (cả tên・kana)／địa chỉ tối đa 255／ghi chú・mô tả・memo **nhiều dòng・tối đa 500** (không có ghi chú 1 dòng)／số tiền 0〜999,999,999・"1,000円"・căn phải・ghi (gồm thuế)(chưa thuế)／thuế suất là **dropdown master Thuế suất** (dùng chung toàn bộ màn hình)／số máy・số lần・số tháng tối đa 99, số suất・giới hạn cung cấp hàng tháng tối đa 9,999／ngày yyyy-mm-dd・năm tháng yyyy-mm・ngày giờ yyyy-mm-dd HH:MM／ID・mã do hệ thống đánh số (không cho nhập). Các ô chữ từng là varchar(120)／varchar(80), v.v. trong bảng dưới đã sửa theo quy tắc này (mỗi dòng có ghi cũ).

## Màn hình danh sách (Danh sách master Dòng máy・Danh sách master Tùy chọn・Danh sách master Giảm giá)　thêm 2026/09/28

Cùng dạng với danh sách master Kho (chốt 2026/09/14). **Vùng tìm kiếm＋bảng danh sách＋cột thao tác＋nút phía trên (Nhập CSV・Xuất CSV・Đăng ký mới)＋phân trang**. Menu bên mở danh sách, chi tiết (xem)・chỉnh sửa・đăng ký mới mở từ danh sách.

**Chung cho 3 danh sách**

| # | Mục | Quy tắc |
|---|---|---|
| 1 | Nút phía trên | Theo thứ tự Nhập CSV → Xuất CSV → Đăng ký mới (CsvButton của ES Kitchen／Đăng ký mới là 1 nút chính) |
| 2 | Liên kết ID (No) | Mở chi tiết (xem). Bên phải tiêu đề chi tiết có "Xóa" (viền đỏ)＋"Chỉnh sửa" |
| 3 | Cột thao tác | Bút chì＝chỉnh sửa, thùng rác＝xác nhận xóa ("Bạn có muốn xóa không?" → "Xóa"). Xóa là xóa logic, đặt trạng thái "Đã xóa" và vẫn để lại trên danh sách. Dòng đã xóa không hiện biểu tượng chỉnh sửa・xóa |
| 4 | Đăng ký mới | Màn hình đăng ký mới (tiêu đề "Đăng ký mới 〇〇"・Hủy＋Đăng ký). ID đánh số khi đăng ký nên không hiển thị |
| 5 | Rời giữa chừng khi chỉnh sửa・đăng ký mới | Nếu đã đổi nội dung nhập thì hiện "Bạn có muốn hủy nội dung chỉnh sửa không?". Nếu chưa đổi thì rời luôn |
| 6 | Tìm kiếm | Lọc bằng nút tìm kiếm (hoặc Enter). Văn bản khớp một phần. Chỉ khi điều kiện tìm kiếm xuống từ 2 dòng trở lên mới hiện mũi tên ở đầu để thu gọn thành 1 dòng |
| 7 | Xuất CSV | Toàn bộ dòng khớp điều kiện tìm kiếm (không liên quan trang đang hiển thị) |
| 8 | Nhập CSV | Tạo mới＋cập nhật theo ID (ID trống là tạo mới). Dòng lỗi không được nhập, hiện số dòng và nội dung lỗi |
| 9 | Thứ tự | Ban đầu là mới nhất theo ngày giờ đăng ký. Sắp xếp được theo tiêu đề cột: ID・tên・loại・trạng thái・ngày giờ đăng ký |
| 10 | Phân trang | "Trong N dòng 1–10" ＋ số trang ＋ số dòng hiển thị (10／50／100) |
| 11 | Loại A của tùy chọn | Loại liên động A (liên động với mục hợp đồng) do hệ thống định nghĩa trước. Danh sách・chi tiết không hiện Xóa, không chọn được ở đăng ký mới. Ở chỉnh sửa cũng không đổi được loại liên động (2026/09/28) |

### Màn hình: Danh sách master Dòng máy

**Điều kiện tìm kiếm** (văn bản khớp một phần・dropdown có tên điều kiện ở đầu)

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID dòng máy, tên dòng máy | Văn bản | — |
| 2 | Loại dòng máy | Dropdown | Tủ lạnh／Tủ đông／Máy bán hàng tự động／Lò vi sóng／Máy làm nóng (Hot Warmer)／Hộp vật tư |
| 3 | Nhà sản xuất | Dropdown | Hoshizaki／Fukushima Galilei／Fuji Electric／Panasonic／Annaka |
| 4 | Phân loại công khai | Dropdown | Hiện trên đơn đăng ký của Web Doanh nghiệp／Chỉ vận hành chọn được |
| 5 | Trạng thái hiệu lực | Dropdown | Hiệu lực／Vô hiệu／Đã xóa |

**Cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID dòng máy | `model_code` | 2 ký tự của loại dòng máy + 6 chữ số. Liên kết mở chi tiết |
| 2 | Tên dòng máy | `name` | — |
| 3 | Loại dòng máy | `kind` | Tủ lạnh／Tủ đông／Máy bán hàng tự động／Lò vi sóng／Máy làm nóng (Hot Warmer)／Hộp vật tư |
| 4 | Nhà sản xuất | `maker` | Nhà sản xuất theo từng loại dòng máy |
| 5 | Phí hàng tháng (chưa thuế) | `monthly_fee` | Căn phải |
| 6 | Thời gian sử dụng tối thiểu | `min_term_months` | Tháng. Để trống＝không có thời hạn |
| 7 | Phân loại công khai | `publish_scope` | — |
| 8 | Trạng thái hiệu lực | `status` | Hiệu lực (xanh lá)／Vô hiệu (xám)／Đã xóa (xám・dòng bị làm xám) |
| 9 | Đang cho thuê | `—（tính từ cho thuê）` | Số máy đang cho thuê hiện tại |
| 10 | Ngày giờ đăng ký | `created_at` | yyyy-mm-dd HH:MM (Cũ: yyyy/mm/dd hh:mm. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| 11 | Thao tác | `—` | Bút chì＝chỉnh sửa／Thùng rác＝xác nhận xóa |

### Màn hình: Danh sách master Gói (Plan)

**Điều kiện tìm kiếm** (văn bản khớp một phần・dropdown có tên điều kiện ở đầu)

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID gói, tên gói quản lý, tên gói công khai | Văn bản | — |
| 2 | Trạng thái công khai | Dropdown | Công khai／Không công khai／Đã xóa |
| 3 | Giới hạn cung cấp hàng tháng | Dropdown | 30／50／100／150／200／250／300／400／500／600／1000 |
| 4 | Course | Dropdown | Standard／Light (tủ lạnh)／Light (máy bán hàng tự động) |
| 5 | Giá (COOL便) | Khoảng số (giới hạn dưới〜trên・chưa thuế) | Gói có COOL便 (Standard／Light) của gói giá công khai nằm trong khoảng. Trống＝không giới hạn (2026-10-05 hong trả lời A・sổ tiếp nhận #128) |
| 6 | Giá (ES配送便) | Khoảng số (giới hạn dưới〜trên・chưa thuế) | Như trên (ES配送便 của Standard／Light／Light (máy bán hàng tự động)) (2026-10-05 A) |
| 7 | Tên thế hệ của gói giá | Dropdown | Tạo từ tên thế hệ có trong gói giá của gói (ví dụ: Phí gốc／Điều chỉnh lần 1〜). Gói có dòng của thế hệ đó (2026-10-05 B) |
| 8 | Tình trạng sử dụng | Dropdown | Đang dùng (có từ 1 hợp đồng cha)／Chưa dùng (2026-10-05 C) |
| 9 | Dòng máy của thiết bị cho thuê tiêu chuẩn | Dropdown | Dòng máy có trong thiết bị cho thuê tiêu chuẩn của gói (ID dòng máy＋tên dòng máy). Gói có dòng máy đó (2026-10-05 D) |
| 10 | Ngày cập nhật | Khoảng ngày (từ〜đến) | Ngày lưu gần nhất trên màn hình (đăng ký・chỉnh sửa・nhập CSV. `plan.updated_at`) (2026-10-05 E) |

**Cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID gói | `plan_code` | ES＋6 chữ số. Liên kết mở chi tiết (danh sách của màn hình hiện hành hiển thị 7 chữ số・thống nhất thành 6 chữ số) |
| 2 | Tên gói quản lý | `name_admin` | — |
| 3 | Tên gói công khai | `name_public` | — |
| 4 | Giới hạn cung cấp hàng tháng | `monthly_cap_total` | Suất |
| 5 | Course | `course_scope` | Course chọn được (Standard・Light (tủ lạnh)・Light (máy bán hàng tự động)). Thêm vào danh sách 2026/09/30・thêm máy bán hàng tự động ở 28-184 |
| 6 | Standard COOL便 | `—（gói giá công khai）` | ES Standard_giá công khai. Chưa thuế・căn phải |
| 7 | Standard ES配送便 | `—（gói giá công khai）` | Như trên |
| 8 | Light COOL便 | `—（gói giá công khai）` | ES Light_giá công khai. Chưa thuế・căn phải. Gói chỉ có course＝Standard thì là "—" |
| 9 | Light ES配送便 | `—（gói giá công khai）` | Như trên |
| 10 | Light (máy bán hàng tự động) ES配送便 | `—（gói giá công khai）` | Giá công khai của ES Light (máy bán hàng tự động). Máy bán hàng tự động chỉ có ES配送便 (28-184) |
| 11 | Trạng thái công khai | `status` | Công khai (xanh lá)／Không công khai (xám)／Đã xóa (xám・dòng bị làm xám) |
| 12 | Thao tác | `—` | Bút chì＝chỉnh sửa／Thùng rác＝xác nhận xóa |

### Màn hình: Danh sách master Tùy chọn

**Điều kiện tìm kiếm** (văn bản khớp một phần・dropdown có tên điều kiện ở đầu)

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID tùy chọn, tên tùy chọn | Văn bản | — |
| 2 | Loại tùy chọn | Dropdown | Giao hàng／Chức năng ứng dụng／Lắp đặt・công việc／Hành chính／Phạt |
| 3 | Loại liên động | Dropdown | A Liên động với mục hợp đồng (hệ thống định nghĩa)／Không liên động |
| 4 | Phân loại công khai | Dropdown | Hiện trên đơn đăng ký của Web Doanh nghiệp／Chỉ vận hành chọn được |
| 5 | Trạng thái sử dụng (Cũ: Trạng thái・U5) | Dropdown | Đang dùng／Kết thúc／Đã xóa |

**Cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID tùy chọn | `option_code` | OP＋6 chữ số. Liên kết mở chi tiết |
| 2 | Tên tùy chọn (quản lý) | `name` | — |
| 3 | Loại tùy chọn | `category` | — |
| 4 | Loại liên động | `link_type` | A Liên động với mục hợp đồng (hệ thống định nghĩa)／Không liên động. A do hệ thống định nghĩa trước nên không hiện biểu tượng xóa (2026/09/28) |
| 5 | Loại phí | `fee_type` | Phí hàng tháng (liên tục)／Phí một lần (1 lần). Phí ban đầu đã gộp vào phí một lần (2026/09/29) |
| 6 | Số tiền tiêu chuẩn (chưa thuế) | `std_amount` | Số tiền của phiên bản phí đang có hiệu lực. Căn phải |
| 7 | Phân loại công khai | `publish_scope` | — |
| 8 | Trạng thái sử dụng (Cũ: Trạng thái・U5) | `status` | Đang dùng (xanh lá)／Kết thúc (xám)／Đã xóa (xám・dòng bị làm xám). Đổi tên vì dễ nhầm với phân loại công khai・trạng thái công khai (2026/10/01) |
| 9 | Đang áp dụng | `—（tính từ hợp đồng con của tháng chu kỳ hiện tại）` | Số cơ sở đang áp dụng (master Tùy chọn không giữ danh sách áp dụng・2026/09/28) (Cũ: tính từ danh sách áp dụng của cơ sở. 28-144 đã bỏ danh sách áp dụng của cơ sở. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| 10 | Ngày giờ đăng ký | `created_at` | yyyy-mm-dd HH:MM (Cũ: yyyy/mm/dd hh:mm. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| 11 | Thao tác | `—` | Bút chì＝chỉnh sửa／Thùng rác＝xác nhận xóa (A do hệ thống định nghĩa nên không có xóa) |

### Màn hình: Danh sách master Giảm giá

**Điều kiện tìm kiếm** (văn bản khớp một phần・dropdown có tên điều kiện ở đầu)

| # | Điều kiện | Loại | Lựa chọn |
|---|---|---|---|
| 1 | ID giảm giá, tên giảm giá | Văn bản | — |
| 2 | Đối tượng áp dụng | Dropdown | Phí gói／Phí tùy chọn／Phí thiết bị／Phí ban đầu／Toàn bộ hóa đơn |
| 3 | Phân loại tính toán | Dropdown | Số tiền cố định／Tỷ lệ／Chênh lệch tự động／Tham chiếu phí gói |
| 4 | Trạng thái sử dụng (Cũ: Trạng thái・U5) | Dropdown | Đang dùng／Kết thúc／Đã xóa |

**Cột của danh sách**

| # | Cột | Tên vật lý | Nội dung |
|---|---|---|---|
| 1 | ID giảm giá | `discount_code` | DC＋6 chữ số. Liên kết mở chi tiết |
| 2 | Tên giảm giá (quản lý) | `name` | — |
| 3 | Đối tượng áp dụng | `target` | — |
| 4 | Phân loại tính toán | `calc_type` | Số tiền cố định／Tỷ lệ／Chênh lệch tự động／Tham chiếu phí gói |
| 5 | Giá trị giảm | `discount.amount / rate` | Số tiền cố định＝yên, tỷ lệ＝% (có số tiền tối đa), chênh lệch tự động＝"Tự động" |
| 6 | Thời gian áp dụng | `period` | Hàng tháng・mãi mãi／Hàng tháng・N tháng／Một lần (loại và thời gian của giảm giá. Quyết định 2026/09/30 28-172) |
| 7 | Trạng thái sử dụng (Cũ: Trạng thái・U5) | `status` | Đang dùng (xanh lá)／Kết thúc (xám)／Đã xóa (xám・dòng bị làm xám) |
| 8 | Đang áp dụng | `—（tính từ hợp đồng con của tháng chu kỳ hiện tại）` | Số cơ sở đang áp dụng (Cũ: tính từ danh sách áp dụng. 28-144. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| 9 | Ngày giờ đăng ký | `created_at` | yyyy-mm-dd HH:MM (Cũ: yyyy/mm/dd hh:mm. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) |
| 10 | Thao tác | `—` | Bút chì＝chỉnh sửa／Thùng rác＝xác nhận xóa |


## Màn hình: Chỉnh sửa master Gói (Plan) (84 mục)

### Tab: Thiết lập gói (13 mục)

**Thiết lập gói**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | ID gói | `plan.no` | varchar(20) | Tự động | ○ | ES＋6 chữ số (ví dụ: ES000004). Không đổi sau khi đánh số. 【Sửa màn hình hiện hành (quyết định 2026/09/30 28-177): danh sách hiển thị ES0000001 (7 chữ số) và tất cả các dòng cùng 1 ID. Danh sách cũng dùng ES＋6 chữ số giống chi tiết (quyết định 2026/09/15), hiện ID riêng theo từng dòng】 | Đã chốt |
| 2 | Tên gói công khai | `plan.name_public` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) | Nhập | ○ | Tên hiện trên Web Doanh nghiệp (đăng ký・đổi gói) và hóa đơn. Ví dụ: Gói 100. Khi nhập, nếu tên gói quản lý đang trống thì điền cùng giá trị (REQ-PM-003) | Đã chốt |
| 3 | Tên gói quản lý | `plan.name_admin` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) | Nhập | ○ | Tên dùng nội bộ. Danh sách・tìm kiếm dùng tên này. Ví dụ: Gói 100／Gói 150 chuyên dụng công ty ○○ | Đã chốt |
| 4 | Trạng thái công khai | `plan.status` | varchar(12) | Nhập | ○ | Công khai／Không công khai. Nếu đặt không công khai thì không hiện trên màn hình khách hàng (đăng ký・đổi gói của Web Doanh nghiệp). Cơ sở đang ký hợp đồng vẫn giữ nguyên. Dùng để giữ lại gói 30 hay gói chuyên dụng của doanh nghiệp (REQ-PM-008). Xóa là xóa logic, vẫn để lại trên danh sách là "Đã xóa" | Đã chốt |
| 5 | Tổng giới hạn cung cấp hàng tháng | `plan.monthly_cap_total` | integer | Nhập | ○ | Tổng số suất có thể cung cấp trong 1 tháng (suất). Giống con số trong tên gói (ví dụ: Gói 100＝100). 【Kiểm tra khi lưu (quyết định 2026/09/30 28-178)】① ES Standard: giới hạn trên đông lạnh＋giới hạn trên lạnh・nhiệt độ thường ≧ giá trị này (sửa từ ＝ ở STEP5 Q5 2026/10/01. Có thể nhiều hơn tổng・hong xác nhận 2026-10-05) ② ES Light (tủ lạnh)・ES Light (máy bán hàng tự động): giới hạn trên lạnh・nhiệt độ thường ＝ giá trị này (vì không có đông lạnh) ③ nhóm nhiệt độ nào cũng giới hạn dưới ≦ giới hạn trên ④ số lần giao hàng tiêu chuẩn từ 1 trở lên ⑤ giá của gói giá ≧ phần doanh nghiệp chịu (phí cơ bản không âm) ⑥ bản công khai chỉ 1 dòng mỗi course・thời gian của gói giá không chồng nhau ⑦ thiết bị cho thuê tiêu chuẩn có ít nhất 1 dòng mẫu Tiêu chuẩn (kể cả "quyết định sau khi tư vấn" cũng nhập cấu hình tiêu chuẩn. Dòng tủ lạnh là bắt buộc, trừ ES250・ES600 trở lên không có hộp vật tư) ⑧ tủ lạnh・tủ đông・máy bán hàng tự động tiêu chuẩn phải có số lượng chứa tối đa ≧ số lượng giao 1 lần (không đủ thì cảnh báo・28-182) ⑨ thiết bị cho thuê tiêu chuẩn của ES Light (máy bán hàng tự động) có ít nhất 1 dòng máy bán hàng tự động・không nhập dòng tủ lạnh và tủ đông (28-184). Khi course＝"chỉ 〜" thì không kiểm tra tab phía không dùng. Cũng dùng cho tính phần doanh nghiệp chịu (số tiền doanh nghiệp chịu × giá trị này) (28-148) | Đã chốt |
| 6 | Hệ số cơ bản × bội số | `plan.base_ratio` | numeric(4,1) | Nhập | ○ | Bội số so với 50 cái cơ bản (ví dụ: Gói 100＝2 lần). **Dùng để nhân bội số này với số tiêu chuẩn (mỗi 50 cái cơ bản) mà vận hành thiết lập ở màn hình đặt hàng, tự động phản ánh vào đơn hàng (số lượng tiêu chuẩn) của doanh nghiệp** (quyết định 2026/09/30 28-179). Không hiện ở danh sách (quyết định 2026/06/09: hệ số sản phẩm ẩn ở danh sách) | Đã chốt |
| 7 | Course | `plan.course_scope` | varchar(60) | Nhập | ○ | Course chọn được ở gói này (chọn nhiều): ES Standard／ES Light (tủ lạnh)／ES Light (máy bán hàng tự động). Tab của course không chọn thì không dùng (vô hiệu). 【Quyết định 2026/09/30 28-184】Thêm ES Light (máy bán hàng tự động) và đổi sang chọn nhiều (Cũ: 3 lựa chọn Tất cả／Chỉ ES Standard／Chỉ ES Light・radio của màn hình hiện hành) | Đã chốt |
| 8 | Số người sử dụng dự kiến (để hiển thị) | `plan.headcount_hint` | varchar(20) | Nhập | △ | Ví dụ: 14 người. Dùng làm mức tham khảo của gói khi báo giá・phỏng vấn lúc đăng ký. Không dùng cho thanh toán・xác định | Đã chốt |

**Chi tiết phí・miễn trách (chung của gói)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Số tiền doanh nghiệp chịu (gồm thuế・1 suất) | `plan.subsidy_per_meal` | integer | Nhập | ○ | Mặc định 100. Yên・gồm thuế. Xử lý như số tiền nằm trong phí gói, không thu thêm. Khi bật "Áp dụng phúc lợi" của hợp đồng con, hóa đơn chia phí gói thành 2 dòng: phí cơ bản／phúc lợi (phần doanh nghiệp chịu) (28-147・28-150) | Đã chốt |
| 2 | Thuế suất phần doanh nghiệp chịu | `plan.subsidy_tax_rate_id` | bigint | Nhập | ○ | Chọn từ master Thuế suất. Mặc định thuế suất giảm 8% (28-149) | Đã chốt |
| 3 | Thuế suất phí cơ bản | `plan.base_tax_rate_id` | bigint | Nhập | ○ | Chọn từ master Thuế suất. Mặc định thuế suất tiêu chuẩn 10% (28-149) | Đã chốt |
| 4 | Phần doanh nghiệp chịu (chưa thuế・tự động tính) | `—（tính）` | — | Tham chiếu | ○ | Số tiền doanh nghiệp chịu × tổng giới hạn cung cấp hàng tháng ÷ (1＋thuế suất phần doanh nghiệp chịu). ~~Làm tròn xuống dưới 1 yên【tạm】~~ **Dưới 1 yên làm tròn bốn bỏ năm nhập (hong trả lời 2026-10-05・sổ cái F)**. Chi tiết của từng dòng gói giá là giá − giá trị này ＝ phí cơ bản (28-148) | Đã chốt |
| 5 | Số tiền miễn trách | `plan.deductible_yen` | integer | Nhập | ○ | Phạm vi cho phép của chênh lệch tồn kho (hao hụt quản lý). Yên. Ví dụ: gói 100 là 300. Phần vượt quá thì thu bằng quyết toán thực tế. "Số tiền diện tích" trong biên bản họp chính là mục này (28-151・REQ-PM-007). 【Việc có chia theo course không cần xác nhận ⑤. Hiện tại 1 giá trị theo gói】 | Đã chốt |

### Tab: ES Standard (25 mục)

**Thiết lập gói ES Standard (đông lạnh・lạnh・nhiệt độ thường)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Đông lạnh_số lượng cung cấp hàng tháng_giới hạn trên | `plan_course.frozen_max` | integer | Nhập | ○ | Suất. Số đông lạnh quyết định theo số cái trong gói (giá trị này), không giữ giới hạn trên・dưới theo tỷ lệ (%) (2026/09/30 bảng yêu cầu dòng 170. Cũ: giới hạn như "đông lạnh tối đa 30% toàn gói" được biểu thị bằng giá trị này). Không giữ ô tỷ lệ đông lạnh (28-155) | Đã chốt |
| 2 | Đông lạnh_số lượng cung cấp hàng tháng_giới hạn dưới | `plan_course.frozen_min` | integer | Nhập | ○ | Suất. 【**Quyết định 2026-10-05**: giữ (dùng cho kiểm tra giới hạn dưới ≦ giới hạn trên. Sổ cái)】 | Đã chốt |
| 3 | Lạnh・nhiệt độ thường_số lượng cung cấp hàng tháng_giới hạn trên | `plan_course.chilled_max` | integer | Nhập | ○ | Suất. Cộng với giới hạn trên đông lạnh thành tổng giới hạn cung cấp hàng tháng | Đã chốt |
| 4 | Lạnh・nhiệt độ thường_số lượng cung cấp hàng tháng_giới hạn dưới | `plan_course.chilled_min` | integer | Nhập | ○ | Suất | Đã chốt |
| 5 | Lạnh・nhiệt độ thường_số lần giao hàng tiêu chuẩn | `plan_course.std_delivery_chilled` | smallint | Nhập | ○ | Lần／tháng. Số lần giao hàng lạnh nằm trong gói này. Phần số lần giao hàng của hợp đồng vượt quá số này sẽ gắn thêm số lần giao hàng (OP000001) (theo từng nhóm nhiệt độ・không bù trừ・28-154・28-156). Từ 1 trở lên (không giữ 0). Ở bảng tủ lạnh: ES50＝1／ES100〜600＝2／ES650 trở lên＝4 | Đã chốt |
| 6 | Đông lạnh_số lần giao hàng tiêu chuẩn | `plan_course.std_delivery_frozen` | smallint | Nhập | ○ | Lần／tháng. Từ 1 trở lên (28-156). **Giá trị ban đầu của tất cả gói là 1 lần／tháng (hong trả lời 2026-10-05・sổ cái F). Khi nhận được bảng tủ đông thì vận hành sửa ở master Gói (Plan)** (Cũ: đặt tạm bằng số lần của lạnh) | Đã chốt |
| 7 | Số lượng giao 1 lần (lạnh・nhiệt độ thường) | `—（tính）` | — | Tham chiếu | — | Giới hạn trên lạnh・nhiệt độ thường ÷ số lần giao hàng tiêu chuẩn của lạnh・nhiệt độ thường (làm tròn lên). Dùng để xác định kích thước tủ lạnh (dòng máy có số lượng chứa tối đa từ giá trị này trở lên) (28-153) | Đã chốt |
| 8 | Số lượng giao 1 lần (đông lạnh) | `—（tính）` | — | Tham chiếu | — | Giới hạn trên đông lạnh ÷ số lần giao hàng tiêu chuẩn đông lạnh (làm tròn lên). Dùng để xác định kích thước tủ đông (28-153) | Đã chốt |
| 9 | Tỷ lệ sắp hết (%) | `plan_course.low_stock_rate` | numeric(5,2) | Nhập | ○ | Xác định nhãn "Sắp hết" của ứng dụng cá nhân. Ngưỡng＝làm tròn xuống (số đơn hàng thực tế của cơ sở × tỷ lệ). **Giá trị ban đầu 25% (hong trả lời 2026-10-05・sổ cái F). Vận hành đổi được theo từng gói・course** (28-152・REQ-PM-009／010) | Đã chốt |
| 10 | Ghi chú | `plan_course.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: không ghi giới hạn. Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) | Nhập | △ | — | Đã chốt |

**Gói giá ES Standard**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Công khai | `plan_price.is_public` | boolean | Cột bảng | ○ | Chỉ chọn 1 dòng. Là giá hiện ở đăng ký・đổi gói của Web Doanh nghiệp, và là thế hệ dùng cho hợp đồng con mới tạo. Hợp đồng con đã tạo giữ nguyên thế hệ lúc tạo (hợp đồng con "Gói giá được áp dụng"). Cùng ý nghĩa với trạng thái "đang chọn" của yêu cầu (REQ-PM-008) (quyết định 2026/09/30 28-180) | Đã chốt |
| 2 | Gói giá | `plan_price.revision` | varchar(20) | Cột bảng | ○ | Phí gốc／Điều chỉnh lần 1／Điều chỉnh lần 2／Điều chỉnh lần 3… (①〜④ trong biên bản họp). Thêm dòng mỗi lần điều chỉnh phí (REQ-PM-001・037) | Đã chốt |
| 3 | Thời gian bắt đầu | `plan_price.valid_from` | date | Cột bảng | ○ | Ngày bắt đầu áp dụng của thế hệ này. 【Thêm 2026/09/30】Khi thêm dòng, ngày hôm trước tự động điền vào thời gian kết thúc của dòng trước. Thời gian không được chồng nhau. **Mục tham khảo (ghi nhận)**: hợp đồng dùng thế hệ nào do "Gói giá được áp dụng" của hợp đồng con quyết định, thời gian không giới hạn thế hệ chọn được (28-181・hong 2026-10-05) | Đã chốt |
| 4 | Thời gian kết thúc | `plan_price.valid_to` | date | Cột bảng | △ | Trống＝chưa kết thúc. Mục tham khảo (ghi nhận) (28-181・hong 2026-10-05) | Đã chốt |
| 5 | Giá (COOL便) | `plan_price.amount_cool` | integer | Cột bảng | ○ | Yên・chưa thuế (phí gói 1 tháng). 【Giá làm phí cơ bản nhỏ hơn 0 yên thì không lưu được (28-148)】 | Đã chốt |
| 6 | Giá (ES配送便) | `plan_price.amount_es` | integer | Cột bảng | ○ | Yên・chưa thuế | Đã chốt |
| 7 | Chi tiết COOL便 (cơ bản 10%／doanh nghiệp chịu 8%) | `plan_price.base_amount / subsidy_amount` | integer | Cột bảng | ○ | Tự động tính (không nhập): phí cơ bản (chưa thuế) ＝ giá − phần doanh nghiệp chịu (chưa thuế). Số tiền khi giữ phí gói thành 2 dòng ở hợp đồng con ①. Thuế suất là giá trị của ô chung của gói (28-148・28-150) | Đã chốt |
| 8 | Chi tiết ES配送便 (cơ bản 10%／doanh nghiệp chịu 8%) | `plan_price.base_amount / subsidy_amount` | integer | Cột bảng | ○ | Tự động tính (không nhập): phí cơ bản (chưa thuế) ＝ giá − phần doanh nghiệp chịu (chưa thuế). Số tiền khi giữ phí gói thành 2 dòng ở hợp đồng con ①. Thuế suất là giá trị của ô chung của gói (28-148・28-150) | Đã chốt |

**Thiết bị cho thuê tiêu chuẩn của ES Standard**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Quyết định sau khi tư vấn | `plan_course.equip_consult` | boolean | Nhập | ○ | Không／Có. Có＝Web Doanh nghiệp chỉ hiển thị cấu hình tiêu chuẩn, không cho chọn kích thước, việc đổi thì tư vấn (vận hành thay đổi). ES600 trở lên (quyết định_master tủ lạnh và cấu hình theo gói #3) | Đã chốt |
| 2 | Nhập CSV thiết bị cho thuê tiêu chuẩn | `—（thao tác）` | — | Thao tác | △ | Đăng ký・cập nhật hàng loạt thiết bị cho thuê tiêu chuẩn của tất cả gói bằng CSV gồm ID gói・course・mẫu・ID dòng máy・số máy・ghi chú (quyết định 2026/09/30 28-182: để giảm lượng thiết lập ở master Gói (Plan)). Theo từng ID gói＋course, thay thế bằng các dòng CSV. Dòng lỗi không được nhập, hiện số dòng và nội dung lỗi | Đã chốt |
| 3 | Mẫu | `plan_std_equipment.pattern` | varchar(8) | Cột bảng | ○ | Tiêu chuẩn／Thay thế. Thay thế là cấu hình khách có thể chọn khi đăng ký thay cho tiêu chuẩn (ví dụ: 84L×2 của ES400・500). Các dòng cùng mẫu được xử lý như 1 cấu hình | Đã chốt |
| 4 | Loại dòng máy | `—（master Dòng máy）` | — | Cột bảng | — | Tự động điền từ dòng máy | Đã chốt |
| 5 | Dòng máy | `plan_std_equipment.model_id` | bigint | Cột bảng | ○ | Chọn từ master Dòng máy (tủ lạnh・tủ đông・hộp vật tư). **Dòng máy・số máy có ở đây là "thiết bị nằm trong gói", cả phí ban đầu・phí hàng tháng đều miễn phí** (quyết định 2026/09/30 28-182. Cũ: việc miễn phí hay không do ngưỡng của master Dòng máy・⑫B). Khi chọn mẫu thay thế cũng miễn phí. Dòng máy không có ở đây và phần vượt số máy tính theo phí của master Dòng máy (có phí). Khi muốn kích thước lớn hơn tiêu chuẩn thì là chênh lệch phí hàng tháng với dòng máy tiêu chuẩn cùng loại (chênh lệch kích thước・chỉ khi dương【tạm】). Phí hủy (số tiền thu hồi khi hủy) nằm ngoài đối tượng miễn phí. Hộp vật tư là bộ của 28-160. ES250・ES600 trở lên không nhập dòng hộp vật tư (vận hành thiết lập theo từng cơ sở・28-165) | Đã chốt |
| 6 | Số máy | `plan_std_equipment.qty` | smallint | Cột bảng | ○ | Máy (hộp vật tư là cái) | Đã chốt |
| 7 | Ghi chú | `plan_std_equipment.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: varchar(120). Sửa theo sổ cái 2026-10-03／định nghĩa Tùy chọn・Giảm giá) | Cột bảng | △ | — | Đã chốt |

### Tab: ES Lite (tủ lạnh) (23 mục)

**Thiết lập gói ES Lite (lạnh・nhiệt độ thường)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Lạnh・nhiệt độ thường_Số suất cung cấp hàng tháng_Giới hạn trên | `plan_course.chilled_max` | integer | Nhập | ○ | Suất ăn. ES Lite không có đông lạnh nên đặt bằng đúng tổng giới hạn trên số suất cung cấp hàng tháng. **Không bằng nhau thì không lưu được (quyết định 2026/09/30 28-178)**. [Ví dụ trên màn hình hiện tại là 80 (tổng 100) mà vẫn lưu được] | Đã quyết |
| 2 | Lạnh・nhiệt độ thường_Số suất cung cấp hàng tháng_Giới hạn dưới | `plan_course.chilled_min` | integer | Nhập | ○ | Suất ăn | Đã quyết |
| 3 | Lạnh・nhiệt độ thường_Số lần giao hàng tiêu chuẩn | `plan_course.std_delivery_chilled` | smallint | Nhập | ○ | Lần／tháng. Số lần giao hàng lạnh nằm trong gói này. Phần số lần giao hàng của hợp đồng vượt quá mức này sẽ được tính thêm Tăng số lần giao hàng (OP000001) (theo từng nhóm nhiệt độ・không bù trừ cho nhau・28-154・28-156). Từ 1 trở lên (không có 0). Theo bảng tủ lạnh: ES50＝1／ES100〜600＝2／ES650 trở lên＝4 | Đã quyết |
| 4 | Số suất giao mỗi lần (lạnh・nhiệt độ thường) | `—（tính toán）` | — | Tham chiếu | — | Giới hạn trên lạnh・nhiệt độ thường ÷ số lần giao hàng tiêu chuẩn lạnh・nhiệt độ thường (làm tròn lên). Dùng để xác định kích thước tủ lạnh (dòng máy có sức chứa tối đa từ giá trị này trở lên) (28-153) | Đã quyết |
| 5 | Tỷ lệ "sắp hết hàng" (%) | `plan_course.low_stock_rate` | numeric(5,2) | Nhập | ○ | Dùng để xác định huy hiệu "Sắp hết hàng" của ứng dụng cá nhân. Ngưỡng＝làm tròn xuống (số đơn hàng thực tế của cơ sở × tỷ lệ). **Giá trị ban đầu 25% (hong trả lời 2026-10-05・sổ cái F). Vận hành có thể đổi theo từng gói・course** (28-152・REQ-PM-009／010) | Đã quyết |
| 6 | Ghi chú | `plan_course.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: không ghi giới hạn. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | △ | — | Đã quyết |

**Gói giá ES Lite**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Dùng công khai | `plan_price.is_public` | boolean | Cột bảng | ○ | Chỉ chọn 1 dòng. Là thế hệ giá hiển thị ở phần đăng ký・đổi gói trên Web doanh nghiệp, dùng cho hợp đồng con tạo mới. Hợp đồng con đã tạo giữ nguyên thế hệ tại thời điểm tạo (hợp đồng con "Gói giá được áp dụng"). Cùng ý nghĩa với trạng thái "Đang chọn" của yêu cầu (REQ-PM-008) (quyết định 2026/09/30 28-180) | Đã quyết |
| 2 | Gói giá | `plan_price.revision` | varchar(20) | Cột bảng | ○ | Giá gốc／Điều chỉnh lần 1／Điều chỉnh lần 2／Điều chỉnh lần 3… (①〜④ trong biên bản họp). Thêm dòng mỗi khi điều chỉnh giá (REQ-PM-001・037) | Đã quyết |
| 3 | Thời gian bắt đầu | `plan_price.valid_from` | date | Cột bảng | ○ | Ngày bắt đầu áp dụng của thế hệ này. [Bổ sung 2026/09/30] Khi thêm dòng, ngày hôm trước tự động được điền vào thời gian kết thúc của dòng trước. Các khoảng thời gian không được chồng nhau. **Mục tham khảo (ghi nhận)**: hợp đồng dùng thế hệ nào do "Gói giá được áp dụng" của hợp đồng con quyết định, không giới hạn thế hệ chọn được theo khoảng thời gian (28-181・hong 2026-10-05) | Đã quyết |
| 4 | Thời gian kết thúc | `plan_price.valid_to` | date | Cột bảng | △ | Để trống＝chưa kết thúc. Mục tham khảo (ghi nhận) (28-181・hong 2026-10-05) | Đã quyết |
| 5 | Giá (chuyến COOL) | `plan_price.amount_cool` | integer | Cột bảng | ○ | Yên・chưa thuế (phí gói 1 tháng). [Không lưu được mức giá làm phí cơ bản nhỏ hơn 0 yên (28-148)] | Đã quyết |
| 6 | Giá (chuyến giao ES) | `plan_price.amount_es` | integer | Cột bảng | ○ | Yên・chưa thuế | Đã quyết |
| 7 | Chi tiết chuyến COOL (cơ bản 10%／doanh nghiệp chịu 8%) | `plan_price.base_amount / subsidy_amount` | integer | Cột bảng | ○ | Tự động tính (không nhập): phí cơ bản (chưa thuế)＝giá − phần doanh nghiệp chịu (chưa thuế). Là số tiền khi hợp đồng con ① giữ phí gói thành 2 dòng. Thuế suất là giá trị ở ô chung của gói (28-148・28-150) | Đã quyết |
| 8 | Chi tiết chuyến giao ES (cơ bản 10%／doanh nghiệp chịu 8%) | `plan_price.base_amount / subsidy_amount` | integer | Cột bảng | ○ | Tự động tính (không nhập): phí cơ bản (chưa thuế)＝giá − phần doanh nghiệp chịu (chưa thuế). Là số tiền khi hợp đồng con ① giữ phí gói thành 2 dòng. Thuế suất là giá trị ở ô chung của gói (28-148・28-150) | Đã quyết |
| 9 | Chênh lệch nâng cấp Standard (chuyến COOL／chuyến giao ES) | `—（tính toán）` | integer | Cột bảng | ○ | Tự động tính: Standard − Lite của cùng thế hệ. Là số tiền của giảm giá **DC000021 (Ưu đãi chuyển từ Lite cũ sang Standard)** (cũ: DC000003 (chênh lệch nâng cấp Standard). DC000003 được gộp vào DC000021 và "kết thúc". 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá). Kể cả sau khi điều chỉnh giá, vẫn tính theo chênh lệch của thế hệ áp dụng cho hợp đồng con đó và cố định khi tạo hợp đồng con (28-170・28-174) | Đã quyết |

**Thiết bị cho thuê tiêu chuẩn ES Lite**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Cấu hình giống Standard | `plan_course.equip_same_as_std` | boolean | Nhập | ○ | Có／Không. Mặc định Có. Có＝lấy thiết bị cho thuê tiêu chuẩn của ES Standard bỏ đi dòng tủ đông làm nguyên cấu hình của ES Lite (bảng bên dưới chỉ để tham chiếu). Nếu muốn riêng Lite có cấu hình khác thì chọn Không và nhập bảng (quyết định 2026/09/30 28-182: để chỉ phải nhập 1 lần cho mỗi gói) | Đã quyết |
| 2 | Bàn bạc để quyết định | `plan_course.equip_consult` | boolean | Nhập | ○ | Không／Có. Có＝trên Web doanh nghiệp chỉ hiển thị cấu hình tiêu chuẩn mà không cho chọn kích thước, việc thay đổi sẽ bàn bạc (vận hành thay đổi). ES600 trở lên (Quyết định_Master tủ lạnh và cấu hình theo gói #3) | Đã quyết |
| 3 | Nhập CSV thiết bị cho thuê tiêu chuẩn | `—（thao tác）` | — | Thao tác | △ | Đăng ký・cập nhật hàng loạt thiết bị cho thuê tiêu chuẩn của tất cả gói bằng CSV gồm ID gói・course・mẫu (pattern)・ID dòng máy・số lượng・ghi chú (quyết định 2026/09/30 28-182: để giảm lượng thiết lập ở master gói). Với mỗi ID gói + course, thay thế bằng các dòng của CSV. Dòng lỗi không được nhập, hiển thị số dòng và nội dung lỗi | Đã quyết |
| 4 | Mẫu (pattern) | `plan_std_equipment.pattern` | varchar(8) | Cột bảng | ○ | Tiêu chuẩn／Thay thế. Thay thế là cấu hình khách hàng có thể chọn khi đăng ký thay cho tiêu chuẩn (ví dụ: 2 chiếc 84L của ES400・500). Các dòng cùng mẫu được gộp xử lý thành 1 cấu hình | Đã quyết |
| 5 | Phân loại dòng máy | `—（master dòng máy）` | — | Cột bảng | — | Tự động điền từ dòng máy | Đã quyết |
| 6 | Dòng máy | `plan_std_equipment.model_id` | bigint | Cột bảng | ○ | Chọn từ master dòng máy (tủ lạnh・tủ đông・hộp vật tư). **Dòng máy・số lượng ghi ở đây là "thiết bị nằm trong gói", miễn phí cả phí ban đầu và phí hàng tháng** (quyết định 2026/09/30 28-182. Cũ: miễn phí hay không do ngưỡng của master dòng máy・⑫B). Khi chọn mẫu thay thế cũng miễn phí. Dòng máy không có trong danh sách và phần vượt số lượng thì tính theo giá của master dòng máy (có phí). Khi khách muốn kích thước lớn hơn tiêu chuẩn thì tính chênh lệch phí hàng tháng so với dòng máy tiêu chuẩn cùng phân loại (chênh lệch kích thước・chỉ khi dương [tạm thời]). Tiền thu hồi khi hủy hợp đồng (số tiền thu hồi khi hủy) không thuộc đối tượng miễn phí. Hộp vật tư là bộ của 28-160. ES250・ES600 trở lên không nhập dòng hộp vật tư (vận hành thiết lập theo từng cơ sở・28-165) | Đã quyết |
| 7 | Số lượng | `plan_std_equipment.qty` | smallint | Cột bảng | ○ | Chiếc (hộp vật tư tính là cái) | Đã quyết |
| 8 | Ghi chú | `plan_std_equipment.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: varchar(120). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Cột bảng | △ | — | Đã quyết |

### Tab: ES Lite (máy bán hàng tự động) (19 mục)

**Thiết lập gói ES Lite (máy bán hàng tự động)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Lạnh・nhiệt độ thường_Số suất cung cấp hàng tháng_Giới hạn trên | `plan_course.chilled_max` | integer | Nhập | ○ | Suất ăn. Máy bán hàng tự động không có đông lạnh nên đặt bằng đúng tổng giới hạn trên số suất cung cấp hàng tháng (không bằng nhau thì không lưu được・28-178) | Đã quyết |
| 2 | Lạnh・nhiệt độ thường_Số suất cung cấp hàng tháng_Giới hạn dưới | `plan_course.chilled_min` | integer | Nhập | ○ | Suất ăn | Đã quyết |
| 3 | Lạnh・nhiệt độ thường_Số lần giao hàng tiêu chuẩn | `plan_course.std_delivery_chilled` | smallint | Nhập | ○ | Lần／tháng. Từ 1 trở lên. Phương thức giao hàng của cơ sở máy bán hàng tự động được cố định là chuyến giao ES (28-19) | Đã quyết |
| 4 | Số suất giao mỗi lần (lạnh・nhiệt độ thường) | `—（tính toán）` | — | Tham chiếu | — | Giới hạn trên lạnh・nhiệt độ thường ÷ số lần giao hàng tiêu chuẩn (làm tròn lên). **Chỉ dòng máy có sức chứa tối đa của máy bán hàng tự động từ giá trị này trở lên** mới đặt làm tiêu chuẩn được (không đủ thì cảnh báo) | Đã quyết |
| 5 | Tỷ lệ "sắp hết hàng" (%) | `plan_course.low_stock_rate` | numeric(5,2) | Nhập | ○ | Cùng cách hiểu với ES Lite (tủ lạnh) (28-152) | Đã quyết |
| 6 | Ghi chú | `plan_course.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: không ghi giới hạn. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | △ | — | Đã quyết |

**Gói giá ES Lite (máy bán hàng tự động)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Dùng công khai | `plan_price.is_public` | boolean | Cột bảng | ○ | Chỉ chọn 1 dòng (dùng công khai＝đang chọn・28-180) | Đã quyết |
| 2 | Gói giá | `plan_price.revision` | varchar(20) | Cột bảng | ○ | Giá gốc／Điều chỉnh lần 1…. Dùng cùng tên thế hệ với các course khác | Đã quyết |
| 3 | Thời gian bắt đầu | `plan_price.valid_from` | date | Cột bảng | ○ | Ngày bắt đầu áp dụng của thế hệ này. Mục tham khảo (ghi nhận) (28-181・hong 2026-10-05) | Đã quyết |
| 4 | Thời gian kết thúc | `plan_price.valid_to` | date | Cột bảng | △ | Để trống＝chưa kết thúc. Mục tham khảo (ghi nhận) (28-181・hong 2026-10-05) | Đã quyết |
| 5 | Giá (chuyến giao ES) | `plan_price.amount_es` | integer | Cột bảng | ○ | Yên・chưa thuế (phí gói 1 tháng). **Không bao gồm phí thuê máy bán hàng tự động** (cùng phí cơ bản với ES Lite (tủ lạnh). Cho đến khi có giá mới của khách hàng, [tạm] cùng số tiền với Lite (tủ lạnh): 2026-10-05). Phí thuê máy bán hàng tự động được **nhập theo từng hợp đồng bằng Tùy chọn OP000037 "Thuê máy bán hàng tự động" (hàng tháng)** [hong trả lời 2026-10-02 (_Danh sách OPEN 1002-01 A')・sổ cái 2026-10-03] (cũ: số tiền bao gồm phí cho thuê máy bán hàng tự động・máy bán hàng tự động có trong thiết bị cho thuê tiêu chuẩn thì miễn phí <28-182・28-184>). Cơ sở máy bán hàng tự động cố định là chuyến giao ES nên **không có giá chuyến COOL**. Không lưu được mức giá làm phí cơ bản nhỏ hơn 0 yên | Đã quyết |
| 6 | ~~Phí ban đầu (chưa thuế)~~ | ~~`plan_price.initial_fee`~~ | — | — | — | **Bãi bỏ (2026-10-03 hong trả lời M2＝A)**: phí ban đầu của máy bán hàng tự động là **Tùy chọn OP000008 "Phí ban đầu"** (một lần), số tiền **nhập theo từng hợp đồng**, giá trị ban đầu là giá trị của master dòng máy (quy tắc thanh toán 2-12・định nghĩa tùy chọn・giảm giá 1-A). Master gói không giữ. (Cũ: giữ theo từng thế hệ gói giá, tự động tạo cho hợp đồng con lần đầu sử dụng course máy bán hàng tự động <28-186>) |
| 7 | Chi tiết chuyến giao ES (cơ bản 10%／doanh nghiệp chịu 8%) | `plan_price.base_amount / subsidy_amount` | integer | Cột bảng | ○ | Tự động tính: phí cơ bản (chưa thuế)＝giá − phần doanh nghiệp chịu (chưa thuế) (28-148) | Đã quyết |

**Thiết bị cho thuê tiêu chuẩn ES Lite (máy bán hàng tự động)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Bàn bạc để quyết định | `plan_course.equip_consult` | boolean | Nhập | ○ | Không／Có (giống các course khác) | Đã quyết |
| 2 | Mẫu (pattern) | `plan_std_equipment.pattern` | varchar(8) | Cột bảng | ○ | Tiêu chuẩn／Thay thế | Đã quyết |
| 3 | Phân loại dòng máy | `—（master dòng máy）` | — | Cột bảng | — | Tự động điền từ dòng máy | Đã quyết |
| 4 | Dòng máy | `plan_std_equipment.model_id` | bigint | Cột bảng | ○ | Chọn từ master dòng máy (máy bán hàng tự động・hộp vật tư). **Bắt buộc có từ 1 dòng máy bán hàng tự động (VM) trở lên, không nhập dòng tủ lạnh・tủ đông** (course đặt máy bán hàng tự động thay cho tủ lạnh). Dòng máy・số lượng có trong danh sách thì miễn phí (28-182). **Tuy nhiên phí thuê máy bán hàng tự động được thanh toán riêng bằng OP000037** [hong trả lời 2026-10-02 (_Danh sách OPEN 1002-01 A')・sổ cái 2026-10-03] | Đã quyết |
| 5 | Số lượng | `plan_std_equipment.qty` | smallint | Cột bảng | ○ | Chiếc (hộp vật tư tính là cái) | Đã quyết |
| 6 | Ghi chú | `plan_std_equipment.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: varchar(120). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Cột bảng | △ | — | Đã quyết |

### Tab: Lịch sử thay đổi (4 mục)

**Lịch sử thay đổi**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Ngày giờ thay đổi | `plan_history.changed_at` | timestamp | Cột bảng | ○ | yyyy-mm-dd HH:MM (cũ: yyyy/mm/dd hh:mm. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Đã quyết |
| 2 | Nội dung thay đổi | `plan_history.detail` | text | Cột bảng | ○ | Tên mục "trước khi thay đổi"→"sau khi thay đổi" | Đã quyết |
| 3 | Người thay đổi | `plan_history.changed_by` | varchar(40) | Cột bảng | ○ | — | Đã quyết |
| 4 | Phân loại thay đổi | `plan_history.kind` | varchar(12) | Cột bảng | ○ | Nhập tay／Nhập CSV. [Bổ sung 2026/09/30] Thống nhất với lịch sử thay đổi của các master khác | Đã quyết |


## Màn hình: Chỉnh sửa master dòng máy (64 mục)

### Tab: Thông tin cơ bản (40 mục)

**Thông tin cơ bản**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | ID dòng máy | `model.no` | varchar(20) | Tự động | ○ | 2 ký tự của phân loại dòng máy ＋ 6 chữ số. **RF＝tủ lạnh, FZ＝tủ đông (tách ra ở quyết định ⑫-3 ngày 2026/09/23)**, VM＝máy bán hàng tự động, MW＝lò vi sóng, HW＝máy giữ nóng, BX＝hộp vật tư (thêm ở P2). [Dòng máy tủ đông hiện có sẽ được đánh số lại: RF000005→FZ000001／RF000006→FZ000002／RF000007→FZ000003. Do trước khi phát triển Phase2 nên không có dữ liệu chuyển đổi] [Không phải số seri mà dùng để quản lý hệ thống] Số hiệu từng thiết bị do danh sách cho thuê của cơ sở giữ. [Trong ví dụ tủ lạnh của màn hình hiện tại, ô là RC000001 còn tiêu đề là RF000001 nên không khớp (cần xác nhận)] | Đã quyết |
| 2 | Tên dòng máy | `model.name` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | ○ | Ví dụ: Tủ trưng bày lạnh 84L (2026/09/29 4 dòng máy tủ lạnh. Ví dụ cũ: Tủ đông lạnh công nghiệp RF-1200). Dùng cho tên thiết bị trên màn hình đăng ký・màn hình hợp đồng・hóa đơn | Đã quyết |
| 3 | Furigana tên dòng máy | `model.name_kana` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(120). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | ○ | Katakana (chữ và số của mã hiệu giữ nguyên). [Màn hình hiện tại ghi là "Tên dòng máy (kana)". Thống nhất thuật ngữ thành Furigana] | Đã quyết |
| 4 | Trạng thái hiệu lực | `model.status` | varchar(12) | Nhập | ○ | Có hiệu lực／Vô hiệu. Dù vô hiệu thì thiết bị đã cho thuê vẫn giữ nguyên. Chỉ là không chọn được cho trường hợp mới. [Màn hình hiện tại chỉ thấy "Có hiệu lực". Các lựa chọn khác cần xác nhận] | Cần xác nhận |
| 5 | Ghi chú dòng máy | `model.note` | text (nhiều dòng・tối đa 500 ký tự. Cũ: không ghi giới hạn. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | △ | Ví dụ: Công suất cao・hỗ trợ sử dụng liên tục | Đã quyết |
| 6 | Phân loại công khai | `model.visibility` | varchar(12) | Nhập | ○ | Hiển thị ở đăng ký trên Web doanh nghiệp／Chỉ vận hành chọn được. [Bổ sung 2026/09/18] Có xếp vào "Thiết bị muốn thêm" của biểu mẫu đăng ký doanh nghiệp hay không. Cùng ô với master tùy chọn・master giảm giá. Nếu hiển thị nhiều dòng máy cùng phân loại thì ô sẽ tăng lên, nên chỉ hiển thị 1 dòng máy cho mỗi kích thước ở phần đăng ký. [Do có dòng máy không hiển thị số tiền như máy bán hàng tự động nên cần xác nhận có cần giá trị thứ 3 "Hiển thị ở đăng ký (số tiền báo giá riêng)" không] | Cần xác nhận |
| 7 | Số lượng tối đa khi đăng ký | `model.form_max_qty` | smallint | Nhập | △ | [Bổ sung 2026/09/18] Mỗi cơ sở được đăng ký tối đa bao nhiêu chiếc từ Web doanh nghiệp. Ví dụ: tủ lạnh 3・lò vi sóng 2・hộp vật tư 9. Phần vượt quá hiển thị "Vui lòng liên hệ người phụ trách" | Đã quyết |

**Quy cách・kích thước**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Rộng | `model.width_mm` | integer | Nhập | ○ | mm. Dùng để xét tuyến đường vận chuyển vào | Đã quyết |
| 2 | Sâu | `model.depth_mm` | integer | Nhập | ○ | mm | Đã quyết |
| 3 | Cao | `model.height_mm` | integer | Nhập | ○ | mm | Đã quyết |
| 4 | Trọng lượng | `model.weight_kg` | numeric(6,1) | Nhập | ○ | kg. Dùng để xét tải trọng sàn・vận chuyển vào | Đã quyết |
| 5 | Dung tích | `model.capacity_l` | integer | Nhập | △ | L | Đã quyết |
| 6 | Nguồn điện | `model.power_v` | varchar(20) | Nhập | △ | V. Ví dụ: 100／100-200 | Đã quyết |
| 7 | Công suất tiêu thụ | `model.watt` | integer | Nhập | △ | W. Dùng để xác nhận ổ cắm tại nơi lắp đặt | Đã quyết |

**Ảnh dòng máy**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Ảnh dòng máy | `model_photo.file` | varchar(255) | Đính kèm | △ | Có thể đăng ký nhiều ảnh. Thêm bằng "Thêm ảnh", khi rê con trỏ lên ảnh sẽ hiện nút xem・xóa. Dùng cho màn hình đăng ký và xác nhận tuyến đường vận chuyển vào | Đã quyết |
| 2 | Ảnh chính | `model_photo.is_main` | boolean | Nhập | ○ | Chọn 1 ảnh trong số ảnh đã đăng ký bằng nút radio. Danh sách・màn hình đăng ký hiển thị ảnh chính | Đã quyết |

**Phân loại dòng máy**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Phân loại dòng máy | `model.category` | varchar(20) | Nhập | ○ | **Tủ lạnh／Tủ đông** (tách thành 2 phân loại ở quyết định ⑫-3 ngày 2026/09/23)／Máy bán hàng tự động／Lò vi sóng／Máy giữ nóng／[Hộp vật tư (thêm ở P2)]. Khi chọn, các ô theo từng phân loại hiện ra bên dưới (tiêu đề của các phân loại khác hiển thị mờ và không chọn được). Tiền tố của ID dòng máy cũng được quyết định ở đây (tủ lạnh＝RF／tủ đông＝FZ). [Lý do tách] Nếu chỉ có 1 phân loại thì không thể chỉ dựa vào master dòng máy để xác định "dòng máy có thể thay thế", và cũng không thể xác định kích thước của đối tượng miễn phí | Đã quyết |
| 2 | Hãng tủ lạnh／tủ đông | `model.maker` | varchar(60) | Nhập | △ | [Khi phân loại dòng máy＝tủ lạnh／tủ đông] Dropdown. Bắt buộc khi thuộc phân loại đó. Ví dụ: Hoshizaki. [Nội dung lựa chọn và cách lưu (master hãng hay giá trị cố định) cần xác nhận] | Cần xác nhận |
| 3 | Số kệ | `model.shelf_count` | smallint | Nhập | △ | [Khi phân loại dòng máy＝tủ lạnh／tủ đông] Ví dụ: 6 | Đã quyết |
| 4 | Sức chứa tối đa (tủ lạnh／tủ đông) | `model.max_items` | integer | Nhập | ○ | [Khi phân loại dòng máy＝tủ lạnh／tủ đông] Chứa được bao nhiêu suất. Ví dụ: 300. Dùng để xác định "có chứa được số suất ăn trong hợp đồng không" khi chọn kích thước ở biểu mẫu đăng ký doanh nghiệp. **(Quyết định ⑫-2 ngày 2026/09/23) Bắt buộc với tủ lạnh・tủ đông・máy bán hàng tự động. Lò vi sóng・máy giữ nóng・hộp vật tư không có (hộp vật tư đã bỏ ngày 2026/09/29・28-162).** Số dùng để xác định: tủ lạnh＝số suất giao mỗi lần của lạnh (giới hạn trên số suất cung cấp hàng tháng lạnh・nhiệt độ thường ÷ số lần giao hàng tiêu chuẩn lạnh), tủ đông＝số suất giao mỗi lần của đông lạnh (giới hạn trên số suất cung cấp hàng tháng đông lạnh ÷ số lần giao hàng tiêu chuẩn đông lạnh. Quyết định 2026/09/29 28-154・28-155. Cũ: số suất ES × tỷ lệ đông lạnh 30%) (quyết định ⑬) | Đã quyết |
| 5 | Hãng máy bán hàng tự động | `model.maker` | varchar(60) | Nhập | △ | [Khi phân loại dòng máy＝máy bán hàng tự động] Dropdown. Bắt buộc khi thuộc phân loại đó. Ví dụ: Fuji Electric. [Lựa chọn cần xác nhận] | Cần xác nhận |
| 6 | Hỗ trợ thanh toán không dùng tiền mặt | `model.cashless` | boolean | Nhập | △ | [Khi phân loại dòng máy＝máy bán hàng tự động] Hỗ trợ／Không hỗ trợ | Đã quyết |
| 7 | Số tầng (hàng) | `model.vm_rows` | smallint | Nhập | △ | [Khi phân loại dòng máy＝máy bán hàng tự động] Số hàng của bố cục (A, B, C…). Ví dụ: 6 | Đã quyết |
| 8 | Số cột | `model.vm_cols` | smallint | Nhập | △ | [Khi phân loại dòng máy＝máy bán hàng tự động] Số cột của bố cục (1, 2, 3…). Ví dụ: 10 | Đã quyết |
| 9 | Sức chứa tối đa (máy bán hàng tự động) | `model.max_items` | integer | Tự động | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Tự động tính từ bố cục bên dưới (chỉ đọc). [Công thức tính cần xác nhận: ví dụ trên màn hình hiện tại (468) không khớp với tổng đơn giản các con số của từng ô] | Cần xác nhận |
| 10 | Tạo bố cục | `—（thao tác）` | — | Thao tác | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Tạo các ô theo số tầng (hàng) × số cột. Ngay sau khi tạo tất cả là "Đơn 8". [Cần xác nhận khi tạo lại thì các thiết lập trước đó có mất không] | Cần xác nhận |
| 11 | Thiết lập loại ngăn chứa | `—（thao tác）` | — | Thao tác | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Chọn ô (bấm tiêu đề hàng để chọn cả hàng) rồi quyết định loại bằng các nút Đơn 8／Đơn 10／Đôi 8／Đôi 10／Băng chuyền 5. Loại Đôi gộp 2 ô ngang thành 1 ô. Khi chưa chọn ô thì không bấm được nút | Đã quyết |
| 12 | Có hiệu lực／Vô hiệu | `—（thao tác）` | — | Thao tác | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Đặt ô đã chọn là vô hiệu (ô không dùng)／đặt lại là có hiệu lực. Ô vô hiệu hiển thị màu xám | Đã quyết |
| 13 | Bố cục máy bán hàng tự động: hàng | `model_vm_cell.row` | char(1) | Cột bảng | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] A, B, C… (bằng số tầng (hàng)) | Đã quyết |
| 14 | Bố cục máy bán hàng tự động: cột | `model_vm_cell.col` | smallint | Cột bảng | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] 1, 2, 3… (bằng số cột) | Đã quyết |
| 15 | Bố cục máy bán hàng tự động: loại ngăn chứa | `model_vm_cell.slot_type` | varchar(12) | Cột bảng | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Đơn 8／Đơn 10／Đôi 8／Đôi 10／Băng chuyền 5. [Cần xác nhận con số có phải là sức chứa của 1 ô không] | Đã quyết |
| 16 | Bố cục máy bán hàng tự động: gộp ô | `model_vm_cell.span` | smallint | Cột bảng | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Loại Đôi gộp 2 ô ngang thành 1 ô (2). Các loại khác là 1 | Đã quyết |
| 17 | Bố cục máy bán hàng tự động: có hiệu lực／vô hiệu | `model_vm_cell.enabled` | boolean | Cột bảng | ○ | [Khi phân loại dòng máy＝máy bán hàng tự động] Ô vô hiệu thì không dùng. [Cần xác nhận có tính vào sức chứa tối đa không] | Đã quyết |
| 18 | Hãng lò vi sóng | `model.maker` | varchar(60) | Nhập | △ | [Khi phân loại dòng máy＝lò vi sóng] Dropdown. Bắt buộc khi thuộc phân loại đó. Ví dụ: Panasonic. [Lựa chọn cần xác nhận] | Cần xác nhận |
| 19 | Công suất | `model.output_w` | integer | Nhập | △ | [Khi phân loại dòng máy＝lò vi sóng] W. Bắt buộc khi thuộc phân loại đó. Ví dụ: 1200 | Đã quyết |
| 20 | Dung tích bên trong | `model.inner_capacity_l` | integer | Nhập | △ | [Khi phân loại dòng máy＝lò vi sóng] L. Ví dụ: 26 | Đã quyết |
| 21 | Hãng máy giữ nóng | `model.maker` | varchar(60) | Nhập | △ | [Khi phân loại dòng máy＝máy giữ nóng] Dropdown. Bắt buộc khi thuộc phân loại đó. Ví dụ: Annaka. [Lựa chọn cần xác nhận] | Cần xác nhận |
| 22 | Nhiệt độ giữ ấm | `model.keep_temp` | smallint | Nhập | △ | [Khi phân loại dòng máy＝máy giữ nóng] Ví dụ: 60. [Màn hình không hiển thị đơn vị. Cần xác nhận có lưu theo ℃ không] | Cần xác nhận |
| 23 | Số tầng | `model.tiers` | smallint | Nhập | △ | [Khi phân loại dòng máy＝máy giữ nóng] Ví dụ: 3 | Đã quyết |
| 24 | Ô của hộp vật tư | `—（không có）` | — | Tham chiếu | — | [Khi phân loại dòng máy＝hộp vật tư] Không có ô theo từng phân loại. **(2026/09/29・28-162) Cũng không có sức chứa tối đa** (vì không dùng để xác định dung tích theo số suất ăn nên đã bỏ khỏi mục bắt buộc của ⑫-2). **Đăng ký 1 dòng máy cho mỗi loại** (28-161): hộp tiêu chuẩn《khay ngăn》《khay sâu》《đồ ăn kiểu food》(W260×D370×H170mm・xếp chồng được)／hộp kiểu tủ ngăn kéo (lớn・W600×D400×H860mm, có bánh xe thì 920mm・khoảng 7kg)／giỏ. Kích thước・trọng lượng ghi ở "Quy cách・kích thước", các lưu ý như "xếp chồng được" "hộp đồ ăn kiểu food không đặt trực tiếp xuống sàn vì lý do vệ sinh" ghi ở "Ghi chú dòng máy". **Mặc định theo từng gói (loại nào bao nhiêu cái) không nằm ở master dòng máy mà do "Thiết bị cho thuê tiêu chuẩn" của master gói giữ** (28-160) | Đã quyết |

### Tab: Giá・điều kiện hợp đồng (7 mục)

**Gói áp dụng thiết bị tiêu chuẩn**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Phí ban đầu (chưa thuế) | `model.initial_fee` | integer | Nhập | ○ | Số tiền chỉ tính 1 lần khi lắp đặt. [Giữ theo giá chưa thuế. Ở dòng khoản mục của hợp đồng con ① cũng nhập giá chưa thuế, thuế tiêu thụ được cộng thêm trên hóa đơn (2026/09/25)] [Thuế suất chọn từ master thuế suất (mặc định 10%). Cũ: không có ô thuế suất (thiết bị tính 10%). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá] Có thể đăng ký 0 yên (hộp vật tư: ban đầu 0・hàng tháng 0) | Đã quyết |
| 2 | Phí hàng tháng (chưa thuế) | `model.monthly_fee` | integer | Nhập | ○ | Số tiền tính hàng tháng. Tự động điền vào dòng khoản mục của hợp đồng con ① với [phân loại nguồn＝model] theo giá chưa thuế (thuế tiêu thụ được cộng thêm trên hóa đơn) | Đã quyết |
| 3 | Số tiền thu hồi khi hủy hợp đồng (phí hỗ trợ trang thiết bị) | `model.cancel_fee` | integer | Nhập | △ | [Số tiền (chưa thuế) làm cơ sở cho tiền hủy hợp đồng của mỗi thiết bị này khi hủy trong thời gian sử dụng tối thiểu] (quyết định 2026/09/17). **Tiền phạt vi phạm ＝ số tiền này × số tháng còn lại ÷ thời gian sử dụng tối thiểu** (sổ cái "Tiền phạt vi phạm" 2026-10-01・quy tắc thanh toán 3-4. Cũ: cách viết lấy nguyên số tiền này làm tiền hủy hợp đồng cho mỗi thiết bị. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá). Chú thích trên màn hình: ※Kể cả gói thuộc đối tượng miễn phí, nếu hủy trong thời gian sử dụng tối thiểu vẫn phát sinh tiền hủy hợp đồng. Tiền phạt vi phạm được xét theo từng thiết bị rồi cộng gộp. **(Quyết định 2B ngày 2026/09/23) Đây là số tiền tiêu chuẩn.** Nếu phía hợp đồng đã nhập "Số tiền thu hồi khi hủy hợp đồng (ghi đè)" thì ưu tiên giá trị đó. Với dòng máy như máy bán hàng tự động mà phí tháo dỡ thay đổi theo điều kiện lắp đặt thì ghi đè theo từng hợp đồng để sử dụng. [Mối quan hệ với "tiền phạt hủy hợp đồng là số tiền cố định chung (master tùy chọn・phí khác)" từ trước đến nay cần xác nhận] | Đã quyết |
| 4 | Thời gian sử dụng tối thiểu | `model.min_term_months` | smallint | Nhập | △ | Tháng. Khác nhau theo dòng máy (ví dụ: **tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng**. Cũ: tủ lạnh 12 tháng・máy bán hàng tự động 24 tháng. Sổ cái "Thời gian sử dụng tối thiểu". 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá). Ngày cho thuê ＋ thời gian này − 1 ngày là ngày hết hạn của từng thiết bị, hủy hợp đồng trước đó sẽ phát sinh tiền phạt vi phạm (số tiền thu hồi khi hủy hợp đồng × số tháng còn lại ÷ thời gian này). **Thời gian tạm ngừng không được tính** (sổ cái "Tạm ngừng và thời gian sử dụng tối thiểu"). Tối đa 99 (tháng). Với loại miễn phí như hộp vật tư thì để trống (không có thời hạn) | Đã quyết |
| 5 | Phí thuê hàng tháng (máy bán hàng tự động) | `model.lease_fee` | integer | Nhập | △ | [Chỉ khi phân loại dòng máy＝máy bán hàng tự động] Khi có phí thuê riêng ngoài phí hàng tháng (chưa thuế). [Màn hình hiện tại không có] **Không giữ** (2026-10-05: phí thuê máy bán hàng tự động＝**phí hàng tháng (No.2)** của máy bán hàng tự động. Giá trị ban đầu của số tiền 1 máy của OP000037 "Thuê máy bán hàng tự động" là phí hàng tháng. Sổ cái "Phí thuê máy bán hàng tự động"). Phí gói không bao gồm phí thuê nên không bị tính trùng. Phí thuê được áp dụng cho tất cả hợp đồng con của ES Lite (máy bán hàng tự động) | Đã quyết |
| ~~6~~ | ~~Gói bao gồm tiêu chuẩn (tham chiếu)~~ | — | — | — | — | **Bãi bỏ (2026-10-05 hong trả lời・sổ tiếp nhận #147)**: xem thông tin tương tự ở thiết bị cho thuê tiêu chuẩn của master gói (miễn phí hay không cũng được quyết định ở đó・28-182). Loại khỏi cột của chi tiết・xuất CSV | Bãi bỏ |

**Điều chỉnh giá (không giữ phiên bản)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Phiên bản giá (lịch sử điều chỉnh) | `—（không giữ）` | — | Tham chiếu | — | **(Quyết định 2026/09/25) Master dòng máy không giữ phiên bản giá.** Màn hình hiện tại cũng không có và vận hành cũng không dùng. Khi thay đổi giá thì sửa trực tiếp phí ban đầu・phí hàng tháng・số tiền thu hồi khi hủy hợp đồng. Dòng khoản mục ① của các hợp đồng con đã tạo được cố định số tiền khi sinh ra nên không thay đổi về sau. [Master gói có phiên bản giá. Master tùy chọn ngày 2026/09/28 cũng quyết định không giữ (quản lý bằng lịch sử thay đổi)] | Đã quyết |

### Tab: Cho thuê・lịch sử (17 mục)

**Cơ sở đang cho thuê**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | ID cho thuê | `loan.no` | varchar(20) | Cột bảng | ○ | Dạng LN-0001. Liên kết đến tab "Thiết bị・tùy chọn" của cơ sở | Đã quyết |
| 2 | ID cơ sở | `loan.branch_id` | bigint | Cột bảng | ○ | CU＋từ 5 chữ số | Đã quyết |
| 3 | Tên cơ sở | `—（từ cơ sở）` | — | Cột bảng | ○ | — | Đã quyết |
| 4 | Số hiệu thiết bị | `loan.serial_no` | varchar(40) | Cột bảng | △ | Số tài sản・số seri. Hiện tại được để trống | Đã quyết |
| 5 | Số chưa trả | `loan.qty_open` | smallint | Cột bảng | ○ | Số cho thuê − số đã trả | Đã quyết |
| 6 | Ngày cho thuê | `loan.lent_on` | date | Cột bảng | ○ | — | Đã quyết |
| 7 | Ngày dự kiến trả | `loan.due_on` | date | Cột bảng | △ | Để trống＝không có thời hạn | Đã quyết |
| 8 | Trạng thái cho thuê | `loan.status` | varchar(12) | Cột bảng | ○ | Đang giao／Đang cho thuê／Đang yêu cầu thu hồi／Đã thu hồi／Chưa trả | Đã quyết |
| 9 | Trạng thái cho thuê (lọc) | `—（thao tác）` | — | Dropdown | — | Dropdown phía trên bảng: Trừ đã thu hồi (mặc định)／Tất cả／Đang giao／Đang cho thuê／Đang yêu cầu thu hồi／Chưa trả／Đã thu hồi (2026-10-05 hong trả lời・sổ tiếp nhận #114. Cũ: toggle "Hiển thị cả đã thu hồi") | Đã quyết |
| 10 | Xuất CSV | `—（thao tác）` | — | Thao tác | — | Xuất các cơ sở đang cho thuê dòng máy này. Dùng để liên lạc thu hồi (recall)・thay thế | Đã quyết |
| 11 | Tổng đang cho thuê | `—（tính toán）` | — | Tham chiếu | ○ | Hiện đang cho thuê bao nhiêu chiếc dòng máy này. Là con số để xem ảnh hưởng của việc tăng giá・thay thế | Đã quyết |
| 12 | Thu hồi chưa hoàn tất (cảnh báo) | `—（tính toán）` | — | Tham chiếu | ○ | Số lượng có ngày dự kiến trả < hôm nay và số chưa trả > 0. Khi xem theo từng dòng máy sẽ biết việc thu hồi thiết bị nào đang bị chậm | Đã quyết |

**Lịch sử (master dòng máy)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Ngày giờ thay đổi | `model_history` | — | Cột bảng | — | — | Đã quyết |
| 2 | Nội dung thay đổi | `model_history` | — | Cột bảng | — | Ghi theo dạng item_name「value1」→「value2」 | Đã quyết |
| 3 | Người thay đổi | `model_history` | — | Cột bảng | — | Vận hành／Nhập CSV | Đã quyết |
| 4 | Phân loại thay đổi | `model_history` | — | Cột bảng | — | Nhập tay／Nhập CSV (cũ: Thêm phiên bản. Không giữ phiên bản giá 2026/09/25) | Đã quyết |
| ~~5~~ | ~~Số cơ sở bị ảnh hưởng~~ | ~~`model_history`~~ | — | — | — | **Bãi bỏ (2026-10-05 hong trả lời・sổ tiếp nhận #142)**: thay đổi của master dòng máy không ảnh hưởng đến hợp đồng・cơ sở (hợp đồng giữ giá trị của dòng máy tại thời điểm thiết lập) | Bãi bỏ |


## Màn hình: Chỉnh sửa master tùy chọn (25 mục)

### Tab: Thông tin cơ bản (12 mục)

**Thông tin cơ bản**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | ID tùy chọn | `option.no` | varchar(20) | Tự động | ○ | OP ＋6 chữ số (ví dụ: OP000001). Hệ thống "2 ký tự＋6 chữ số" giống ID dòng máy・ID gói. Không thay đổi sau khi đánh số | Đã quyết |
| 2 | Tên tùy chọn (dùng nội bộ) | `option.name_admin` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | ○ | Tên dùng nội bộ. Danh sách・tìm kiếm dùng tên này | Đã quyết |
| 3 | Tên hiển thị trên hóa đơn | `option.name_invoice` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | ○ | Hiển thị nguyên như tên khoản mục trên hóa đơn. [Bỏ cách làm ghi tháng đối tượng của chi phí phát sinh trong ngoặc, thay vào đó giữ ở cột thời gian đối tượng của dòng khoản mục] [2026-10-03 hong trả lời #3: không hiển thị 2 loại dòng cùng tên trên hóa đơn. Tên hiển thị trên hóa đơn của OP000008 là "**Phí ban đầu**", OP000016 (chưa kiểm kê) là "**Phí thủ tục**" (sổ cái "Tên màn hình・tên khoản mục")] | Đã quyết |
| 4 | Phân loại tùy chọn | `option.category_id` (cũ `option.category` varchar(20)) | bigint | Nhập | ○ | Chọn từ **master phân loại tùy chọn** (tên・thứ tự・đang dùng／kết thúc. Vận hành có thể thêm) (hong 2026-10-05・sổ cái F). Giá trị ban đầu: Giao hàng／Chức năng ứng dụng／Lắp đặt・công việc／Hành chính／Phạt. Dùng cho thứ tự và tổng hợp trên hóa đơn | Đã quyết |
| 5 | Mô tả | `option.description` | text (nhiều dòng・tối đa 500 ký tự. Cũ: không ghi giới hạn. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | △ | Mô tả để vận hành không bị phân vân khi chọn. Không hiển thị trên Web doanh nghiệp | Đã quyết |
| 6 | Phân loại công khai | `option.visibility` | varchar(12) | Nhập | ○ | Hiển thị ở đăng ký trên Web doanh nghiệp／Chỉ vận hành chọn được. Khách hàng có tự chọn được hay không | Cần xác nhận |
| 7 | Trạng thái sử dụng (cũ: Trạng thái・U5) | `option.status` | varchar(12) | Nhập | ○ | Đang dùng／Kết thúc. Dù kết thúc thì cơ sở đang áp dụng vẫn tiếp tục được thanh toán như cũ (chỉ là không chọn được cho trường hợp mới) | Đã quyết |
| 8 | ~~Thứ tự hiển thị~~ | ~~`option.sort_no`~~ | — | — | — | **Không giữ** (hong 2026-10-05・sổ cái F). Thứ tự của lựa chọn・hóa đơn là: thứ tự của phân loại tùy chọn → ID tùy chọn | Xóa |

**Liên động với mục hợp đồng**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Loại liên động | `option.link_type` | varchar(4) | Nhập | ○ | [A] Liên động với mục hợp đồng (hệ thống định nghĩa)／Không liên động. [Quyết định 2026/09/28: loại A không phải do vận hành tự do tạo mà hệ thống định nghĩa trước cho từng mục hợp đồng liên động (số lần giao hàng・ES-QR・chế độ khách, v.v.). Vận hành chỉ sửa được tên hiển thị・số tiền・trạng thái, v.v., không thể đăng ký mới và xóa loại A. Khi đăng ký mới chỉ chọn được "Không liên động"] [Với tùy chọn không liên động, "Liên tục／Một lần" (B／C trước đây) được quyết định bởi loại phí: phí hàng tháng＝liên tục (gắn vào là tính mãi), phí ban đầu・phí phát sinh một lần＝một lần]. Phân loại này quyết định có hiển thị ở biến động của hợp đồng con không và có tự động tính vào không | Đã quyết |
| 2 | Mục hợp đồng liên động | `option.link_field` | varchar(40) | Tham chiếu | △ | [Chỉ hiển thị khi loại liên động＝A・hệ thống định nghĩa nên không thể thay đổi (2026/09/28)] Số lần giao hàng／ES-QR／Chế độ khách／Người dùng dùng tiền mặt, v.v. 1 tùy chọn loại A ứng với 1 mục hợp đồng | Đã quyết |
| 3 | Điều kiện liên động | `option.link_condition` | varchar(120) | Tham chiếu | △ | [Chỉ hiển thị khi loại liên động＝A・hệ thống định nghĩa nên không thể thay đổi (2026/09/28)] Mục đó có hiệu lực khi mang giá trị nào. Ví dụ: ES-QR＝sử dụng／Chế độ khách＝sử dụng／số lần giao hàng vượt chuẩn của gói | Đã quyết |
| 4 | Cách lấy số lượng | `option.qty_rule` | varchar(20) | Tham chiếu | △ | [Chỉ hiển thị khi loại liên động＝A・hệ thống định nghĩa] Cố định 1／Nguyên giá trị của mục hợp đồng／Chỉ phần vượt chuẩn của gói. Ví dụ: số lần giao hàng 12 lần・chuẩn gói 8 lần → nếu là "phần vượt" thì số lượng là 4. Số lượng của tùy chọn không liên động được nhập khi gắn ở hợp đồng con (2026/09/29) | Đã quyết |

### Tab: Giá (7 mục)

**Giá tiêu chuẩn**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Loại phí | `option.fee_type` | varchar(12) | Nhập | ○ | Phí hàng tháng (liên tục)／Phí phát sinh một lần (1 lần). Được điền nguyên vào loại phí của dòng khoản mục hợp đồng con ①. Phí hàng tháng＝gắn vào là tính mãi (1 cái cho 1 cơ sở. Khi muốn tăng số lượng thì điều chỉnh bằng số lượng), phí phát sinh một lần＝chỉ một lần (có thể gắn nhiều lần cho cùng một cơ sở). [2026/09/29: gộp phí ban đầu vào phí phát sinh một lần (do cách thanh toán giống nhau). Các ô tự động tính vào・cho phép trùng lặp được quyết định bởi loại liên động và loại phí nên không giữ] | Đã quyết |
| 2 | Đơn vị | `option.unit` | varchar(20) | Nhập | ○ | Cơ sở／Chiếc／Lần／1 đơn vị vượt (chỉ riêng loại A tăng số lần giao hàng). Với tùy chọn không liên động thì không dùng để tính toán, chỉ biểu thị đơn vị của số lượng (hiển thị bên cạnh "Số lượng" trên hóa đơn). Số tiền thanh toán ＝ số tiền tiêu chuẩn × số lượng (2026/09/29: rút gọn từ đơn vị tính phí) | Đã quyết |
| 3 | Số tiền tiêu chuẩn (chưa thuế) | `option.amount` | integer | Nhập | ○ | Yên (chưa thuế. Quyết định 2026/09/25). [Điều chỉnh giá được ghi đè và quản lý bằng lịch sử thay đổi (không giữ phiên bản giá・2026/09/28). Số tiền của hợp đồng con đã được thanh toán không thay đổi] Có thể đăng ký 0 yên (để giữ lại tùy chọn nằm trong gói ở trạng thái đang áp dụng mà không tính phí) | Đã quyết |
| 4 | Thuế suất | `option.tax_rate_id` | bigint | Nhập | ○ | Chọn từ master thuế suất (dropdown chung cho mọi màn hình. Mặc định 10%) (cũ: `option.tax_rate` numeric(4,1)・giữ 8% (giảm thuế)／10% bằng tham số. Danh sách vấn đề 2026-10-03 "Thuế suất là dropdown của master thuế suất". 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Đã quyết |

**Loại số tiền và đối tượng (quyết định 2026/10/01_Bổ sung STEP3_Thiếu sót của master tùy chọn・giảm giá Q-D・Q-E)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Loại số tiền | `option.amount_kind` | varchar(12) | Nhập | ○ | Cố định／Từ mức tối thiểu (từ 〇〇 yên～)／Nhập mỗi lần／Theo từng cơ sở／Quyết định theo chênh lệch／**Tham chiếu master dòng máy (có thể sửa theo từng hợp đồng)**＝khi gắn vào sẽ điền số tiền của dòng máy đó trong master dòng máy và vận hành có thể sửa (OP000037 Thuê máy bán hàng tự động・OP000008 Phí ban đầu của máy bán hàng tự động) [hong trả lời 2026-10-03 (M4＝A)]. Với "Nhập mỗi lần" và "Từ mức tối thiểu", khi gắn ở "Biến động tùy chọn・giảm giá" của hợp đồng con thì bắt buộc nhập số tiền (số tiền tiêu chuẩn để trống hoặc là mức tối thiểu). Ví dụ: OP000010 Thay tủ lạnh (theo yêu cầu khách)・OP000003 Phí sử dụng chế độ khách＝nhập mỗi lần. Lựa chọn trên Web Vận hành là "Tham chiếu dòng máy (giá trị master dòng máy・có thể sửa theo từng hợp đồng)" (mã `機種参照`. Triển khai 2026-10-05) | Đã quyết |
| 2 | Course đối tượng | `option.target_courses` | varchar(60) | Nhập | ○ | Đầu tiên là "Tất cả" (mặc định BẬT). Bỏ chọn thì chọn nhiều từ ES Standard／ES Lite (tủ lạnh)／ES Lite (máy bán hàng tự động) (không chọn cái nào thì báo lỗi). Giá trị để trống＝tất cả (hong 2026-10-05・sổ cái F). Không chọn được ở hợp đồng con của cơ sở ngoài đối tượng | Đã quyết |
| 3 | Phân loại dòng máy đối tượng | `option.target_model_kinds` | varchar(60) | Nhập | ○ | Đầu tiên là "Tất cả" (mặc định BẬT). Bỏ chọn thì chọn nhiều từ tủ lạnh／tủ đông／máy bán hàng tự động, v.v. (phân loại dòng máy của master dòng máy). Giá trị để trống＝tất cả (hong 2026-10-05・sổ cái F) | Đã quyết |

- **Phê duyệt**: Tùy chọn không có người phê duyệt cụ thể. **Bất kỳ quản trị viên vận hành có quyền đều có thể đăng ký・phê duyệt** (không dùng "phê duyệt của MG Hayashi" ở B15 trong bảng của khách hàng. Q-E).

### Tab: Xác nhận liên động・lịch sử (6 mục)

**Xác nhận liên động**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Phát hiện không khớp liên động | `—（tính toán）` | — | Tham chiếu | ○ | [Chỉ loại A] Phát hiện bằng batch hằng ngày các cơ sở có giá trị mục hợp đồng không khớp với dòng khoản mục đang có. Cùng cách hiểu với việc thu hồi thiết bị chưa hoàn tất, là cơ chế đảm bảo khi tự động tính vào bị sót | Đã quyết |

**Lịch sử (master tùy chọn)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Ngày giờ thay đổi | `option_history` | — | Cột bảng | — | — | Đã quyết |
| 2 | Nội dung thay đổi | `option_history` | — | Cột bảng | — | Ghi theo dạng item_name「value1」→「value2」 | Đã quyết |
| 3 | Người thay đổi | `option_history` | — | Cột bảng | — | Vận hành | Đã quyết |
| 4 | Phân loại thay đổi | `option_history` | — | Cột bảng | — | Nhập tay／Nhập CSV (điều chỉnh giá cũng được lưu ở đây: số tiền tiêu chuẩn trước khi thay đổi → sau khi thay đổi) | Đã quyết |
| ~~5~~ | ~~Số cơ sở bị ảnh hưởng~~ | `option_history` | — | Cột bảng | — | **Bãi bỏ (2026-10-05 hong trả lời・sổ tiếp nhận #148)**: thay đổi của master không ảnh hưởng đến hợp đồng・cơ sở (cũ: số cơ sở có dòng khoản mục của hợp đồng con chưa chốt bị thay đổi do thay đổi đó) | Bãi bỏ |


## Màn hình: Chỉnh sửa master giảm giá (38 mục)

### Tab: Thông tin cơ bản (8 mục)

**Thông tin cơ bản**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | ID giảm giá | `discount.no` | varchar(20) | Tự động | ○ | DC ＋6 chữ số (ví dụ: DC000001). Cùng hệ thống với ID tùy chọn・ID dòng máy | Đã quyết |
| 2 | Tên giảm giá (dùng nội bộ) | `discount.name` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | ○ | Tên dành cho vận hành dùng ở danh sách・tìm kiếm. Không hiển thị trên hóa đơn (hóa đơn hiển thị tên hiển thị trên hóa đơn). Xử lý giống "Tên tùy chọn (dùng nội bộ)" của tùy chọn (2026/09/28) | Đã quyết |
| 3 | Mã dùng nội bộ | `discount.code_admin` | varchar(40) | Nhập | ○ | Nhập nguyên mã hiện đang dùng ở bảng quản lý ngoài hệ thống. Là khóa của việc nhập CSV | Đã quyết |
| 4 | Tên hiển thị trên hóa đơn | `discount.name_invoice` | varchar(60) (tối đa 60 ký tự. Cũ: varchar(80). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | ○ | Tên dòng giảm giá hiển thị trên hóa đơn. Hiển thị dưới dạng dòng khoản mục âm | Đã quyết |
| 5 | Phân loại giảm giá | `discount.category_id` | bigint | Nhập | ○ | Chọn từ **master phân loại giảm giá** (tên・thứ tự・đang dùng／kết thúc. Vận hành có thể thêm. Cùng dạng với master phân loại tùy chọn). Giá trị ban đầu: Giảm giá khuyến mãi／Giảm giá đại lý／Giảm giá chuyển từ công ty khác／Giảm giá giới thiệu／Chiết khấu số lượng／Chênh lệch nâng cấp (cũ: Chênh lệch điều chỉnh giá 28-170) (2026-10-05 hong trả lời・sổ tiếp nhận #144. Cũ: 6 loại cố định) | Đã quyết |
| 6 | Mô tả | `discount.description` | text (nhiều dòng・tối đa 500 ký tự. Cũ: không ghi giới hạn. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Nhập | △ | Mô tả để không bị phân vân khi quyết định áp dụng | Đã quyết |
| 7 | Phân loại công khai | `discount.visibility` | varchar(12) | Nhập | ○ | Hiển thị tên trên Web doanh nghiệp／Chỉ vận hành xem. Tên hiển thị luôn xuất hiện trên hóa đơn | Cần xác nhận |
| 8 | Trạng thái sử dụng (cũ: Trạng thái・U5) | `discount.status` | varchar(12) | Nhập | ○ | Đang dùng／Kết thúc. Dù kết thúc thì cơ sở đang áp dụng vẫn tiếp tục như cũ | Đã quyết |

### Tab: Tính toán・điều kiện (15 mục)

**Tính toán giảm giá**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Đối tượng áp dụng | `discount.target` | varchar(20) | Nhập | ○ | Phí gói／[Phí tùy chọn]／Phí thiết bị／Phí ban đầu (phí ban đầu của gói・thiết bị. Khi trừ phí phát sinh một lần của tùy chọn thì chỉ định bằng "Phí tùy chọn" + tùy chọn đối tượng・2026/09/29)／Toàn bộ hóa đơn. "Giảm giá tùy chọn" được biểu thị ở đây (miễn phí tùy chọn tăng số lần giao hàng, v.v.) | Đã quyết |
| 2 | Tùy chọn đối tượng | `discount.target_option_id` | bigint | Nhập | △ | [Chỉ khi đối tượng áp dụng＝phí tùy chọn] Chọn bằng dropdown từ master tùy chọn. Dòng đầu "(Tất cả tùy chọn)"＝để trống＝tất cả tùy chọn là đối tượng | Đã quyết |
| 3 | Phân loại tính toán | `discount.calc_type` | varchar(12) | Nhập | ○ | Số tiền cố định／Tỷ lệ／[Chênh lệch tự động]／[Tham chiếu phí gói] (2026/10/01 STEP3 Q3: lấy phí hàng tháng tương ứng trong master gói của gói・course được tham chiếu làm số tiền giảm. Không vượt quá số tiền thanh toán. Ví dụ: DC000013). Chênh lệch tự động tính số tiền giảm từ chênh lệch giá Standard − Lite (mẫu B vận hành bằng giảm giá mà không tăng loại phí). [Quyết định 2026/09/30 28-170] Dùng khi khách hàng hiện có nâng cấp từ Lite lên Standard, giảm giá để miễn phí phần chênh lệch (**DC000021 Ưu đãi chuyển từ Lite cũ sang Standard**. Cũ: Chênh lệch nâng cấp Standard (Lite→Standard・khách hàng hiện có)＝DC000003. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Đã quyết |
| 4 | Giá trị giảm giá | `discount.amount / discount.rate / discount.auto_basis / discount.cap_amount` | integer / numeric(5,2) / varchar(60) / integer | Nhập | ○ | Ô nhập chuyển đổi theo phân loại tính toán. Số tiền cố định＝số tiền (yên・chưa thuế)／Tỷ lệ＝tỷ lệ (%) + số tiền tối đa (để trống＝không giới hạn)／Chênh lệch tự động＝cơ sở (phí chung hiện tại − phí hàng tháng trước khi chuyển. Tự động tính bằng cách tham chiếu Standard・Lite của master gói). Ô không dùng thì vô hiệu hóa | Đã quyết |
| 5 | Cách xử lý thuế suất | `discount.tax_rule` | varchar(20) | Nhập | ○ | Giống khoản mục gốc／Chỉ định riêng. Với hóa đơn lẫn 8% và 10%, quyết định trừ từ bên nào. Thuế suất của "Chỉ định riêng" chọn từ dropdown master thuế suất (danh sách vấn đề 2026-10-03 "Thuế suất là dropdown master thuế suất… cả giảm giá・ưu đãi chuyển đổi").<br>**DC000013 (dùng thử・¥24,500) chia ra để trừ theo đúng chi tiết của "Gói 50・Lite"**: phần phí cơ bản của gói 50 trừ từ dòng 10%, phần doanh nghiệp chịu trừ từ dòng 8%. Hợp đồng có phúc lợi TẮT (1 dòng) thì trừ toàn bộ từ dòng 10% [hong trả lời 2026-10-05 (#4)] | Đã quyết |
| 6 | Chồng giảm giá | `discount.stackable` | boolean | Nhập | ○ | Có thể áp dụng đồng thời với giảm giá khác hay không. Vì tiền đề là khuyến mãi + đại lý + số lượng có thể áp dụng cùng lúc nên mặc định là "Được" | Đã quyết |
| 7 | Thứ tự áp dụng | `discount.apply_order` | smallint | Nhập | ○ | Nhập cho từng giảm giá (quyết định 2026/09/25). Áp dụng theo thứ tự từ nhỏ đến lớn. [Khi nhiều giảm giá chồng lên nhau thì số tiền thay đổi theo thứ tự nên bắt buộc phải có] Khi phân vân thì tham khảo "số tiền trước, tỷ lệ sau" | Đã quyết |

**Thời gian áp dụng và cơ sở có thể gắn**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Loại giảm giá | `discount.charge_type` | varchar(8) | Nhập | ○ | Hàng tháng (liên tục)／Một lần (1 lần). [Quyết định 2026/09/30 28-172] Cùng cách hiểu với loại phí của tùy chọn (phí hàng tháng＝liên tục／phí phát sinh một lần＝1 lần). Hàng tháng＝từ hợp đồng con được gắn, trong suốt thời gian áp dụng bên dưới, mỗi tháng tạo dòng giảm giá ở ① của hợp đồng con. Một lần＝chỉ tạo 1 lần ở ① của hợp đồng con được gắn (không dùng ô thời gian áp dụng). Ví dụ: Chênh lệch nâng cấp Standard・giảm giá đại lý＝hàng tháng, giảm giá chuyển từ công ty khác (từ phí ban đầu)＝một lần | Đã quyết |
| 2 | Cách giữ thời gian áp dụng | `discount.term_type` | varchar(12) | Nhập | ○ | [Khi loại giảm giá＝hàng tháng] Không thời hạn／Chỉ định số tháng. Giảm giá khuyến mãi là chỉ định số tháng kiểu "chỉ 3 tháng đầu" | Đã quyết |
| 3 | Số tháng áp dụng | `discount.term_months` | smallint | Nhập | △ | [Khi loại giảm giá＝hàng tháng và chỉ định số tháng] Tính từ tháng bắt đầu áp dụng. Tháng kết thúc tự động tính | Đã quyết |
| 4 | Điều kiện cơ sở có thể gắn | `discount.scope_agency / discount.scope_contract_type` | varchar(40) / varchar(20) | Nhập | △ | Không phải điều kiện tự động có hiệu lực mà là kiểm tra khi gắn ở hợp đồng con (cơ sở không phù hợp thì không chọn được). Mã đại lý đối tượng (khi là giảm giá đại lý, chỉ cơ sở khớp với mã đại lý của hợp đồng gốc)／Giới hạn loại hợp đồng (khuyến mãi dùng thử mặc định ngoài đối tượng). Cả hai đều có "Tất cả" ở đầu＝không giới hạn. [2026/09/29: đã bỏ course đối tượng・phương thức giao hàng đối tượng・gói đối tượng (nếu có quy định thì ghi ở ô mô tả)] | Đã quyết |

**Điều kiện có thể gắn (2026/10/01 Quyết định_Bổ sung STEP3_Thiếu sót của master tùy chọn・giảm giá Q-E)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Gói・course đối tượng | `discount.target_courses / discount.target_plans` | varchar(60) / varchar(200) | Nhập | △ | Gói・course có thể gắn. Đặt "Tất cả" ở đầu ô chọn và mặc định BẬT, bỏ chọn thì chọn từng cái (không chọn cái nào thì E02. Giống course đối tượng của tùy chọn・2026-10-05 hong trả lời・sổ tiếp nhận #145). Để trống (tất cả BẬT)＝tất cả (ví dụ: **DC000021 Ưu đãi chuyển từ Lite cũ sang Standard**＝chỉ ES Standard. Cũ: DC000003 Chênh lệch nâng cấp Standard. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá). Khôi phục course đối tượng・gói đối tượng đã bỏ ngày 2026/09/29 (không giữ phương thức giao hàng đối tượng) | Đã quyết |
| 2 | Giới hạn số lần | `discount.limit_scope / discount.limit_count` | varchar(12) / smallint | Nhập | △ | Không giới hạn／1 lần cho mỗi doanh nghiệp／1 lần cho mỗi cơ sở／N lần cho mỗi doanh nghiệp／N lần cho mỗi cơ sở. Ví dụ: DC000013 Giảm giá khuyến mãi dùng thử＝1 lần cho mỗi doanh nghiệp | Đã quyết |
| 3 | Điều kiện tự động gắn | `discount.auto_rule` | varchar(30) | Nhập | △ | Không gắn (gắn bằng tay)／Loại hợp đồng＝khuyến mãi dùng thử／Liên động với mục hợp đồng. Ví dụ: DC000013 tự động gắn vào hợp đồng con có loại hợp đồng là khuyến mãi dùng thử | Đã quyết |
| 4 | Thời gian tiếp nhận | `discount.accept_from / discount.accept_to` | date / date | Nhập | △ | Khoảng thời gian có thể gắn giảm giá (ngày bắt đầu・ngày kết thúc). Dành cho khuyến mãi. Khác với số tháng áp dụng (sau khi gắn có hiệu lực bao nhiêu tháng). Để trống＝không có thời hạn. "Thời hạn đăng ký" của ưu đãi chuyển đổi DC000021 được biểu thị bằng ngày kết thúc ở đây, trong lúc chưa quyết thì để trống (danh sách vấn đề 7-2) | Đã quyết |

### Tab: Áp dụng・lịch sử (15 mục)

**Danh sách áp dụng**

> 2026-10-03: ở 28-144 đã quyết định giảm giá do **hợp đồng con (theo từng tháng chu kỳ) giữ**. "Danh sách áp dụng" này được đọc như **bảng tham chiếu lấy từ hợp đồng con của tháng chu kỳ hiện tại** các cơ sở được gắn giảm giá này (cũ: tiền đề master giảm giá giữ việc áp dụng theo từng cơ sở (`discount_apply`). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá).
> **Danh sách áp dụng (2026-10-03 hong trả lời M9＝A)**: tab này **chỉ để hiển thị**, được tạo từ các dòng tùy chọn・giảm giá của hợp đồng con. Việc nhập CSV hàng loạt cũng **ghi trực tiếp vào các dòng của hợp đồng con**. Bản ghi nhập nằm ở tab "Lịch sử". **Không giữ bảng `discount_apply`** (tên vật lý bên dưới là cũ. Thay bằng cột của dòng hợp đồng con).

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | ID cơ sở | `discount_apply.branch_id` | bigint | Cột bảng | ○ | CU＋từ 5 chữ số. Liên kết đến tab "Thiết bị・tùy chọn" của cơ sở | Đã quyết |
| 2 | Tên cơ sở | `—（từ cơ sở）` | — | Cột bảng | ○ | — | Đã quyết |
| 3 | Tháng bắt đầu áp dụng | `discount_apply.from_month` | varchar(7) | Cột bảng | ○ | Dạng 2026-10 | Đã quyết |
| 4 | Tháng kết thúc áp dụng | `discount_apply.to_month` | varchar(7) | Cột bảng | △ | Để trống＝đang áp dụng. Khi chỉ định số tháng thì tự động điền | Đã quyết |
| 5 | Số tiền giảm (chưa thuế) | `discount_apply.amount` | integer | Cột bảng | ○ | Khi là chênh lệch tự động thì kết quả tính toán được cố định ở đây | Đã quyết |
| 6 | Cách đăng ký | `discount_apply.source` | varchar(12) | Cột bảng | ○ | Đăng ký thủ công／Nhập CSV | Đã quyết |
| 7 | Trạng thái áp dụng (lọc) | `—（thao tác）` | — | Dropdown | — | Dropdown phía trên bảng: Đang áp dụng (mặc định)／Kết thúc／Tất cả (2026-10-05 hong trả lời・sổ tiếp nhận #114. Cũ: toggle "Hiển thị cả phần đã kết thúc") | Đã quyết |
| ~~8~~ | ~~Nhập CSV hàng loạt~~ | — | — | — | — | **Bãi bỏ (2026-10-05 hong trả lời・sổ tiếp nhận #106)**: không đặt nút ở tab của chi tiết. Nhập CSV／xuất CSV của việc áp dụng nằm ở "Nhập CSV áp dụng" "Xuất CSV áp dụng" phía trên danh sách master giảm giá (1 dòng＝giảm giá × cơ sở × tháng bắt đầu áp dụng. Ghi trực tiếp vào hợp đồng con・sổ cái 42) | Bãi bỏ |
| 9 | Định dạng CSV (tham chiếu) | `—（mô tả）` | — | Tham chiếu | ○ | Dòng 1 là header (ID cơ sở,số tiền giảm,tháng bắt đầu áp dụng,tháng kết thúc áp dụng). Dòng không tìm thấy ID cơ sở・dòng đã đang áp dụng sẽ báo lỗi và không nhập | Đã quyết |
| 10 | Tổng đang áp dụng | `—（tính toán）` | — | Tham chiếu | ○ | Số cơ sở đang áp dụng và tổng số tiền giảm mỗi tháng | Đã quyết |

**Lịch sử (master giảm giá)**

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Giá trị・lựa chọn／nội dung | Trạng thái |
|---|---|---|---|---|---|---|---|
| 1 | Ngày giờ thay đổi | `discount_history` | — | Cột bảng | — | — | Đã quyết |
| 2 | Nội dung thay đổi | `discount_history` | — | Cột bảng | — | Ghi theo dạng item_name「value1」→「value2」 | Đã quyết |
| 3 | Người thay đổi | `discount_history` | — | Cột bảng | — | Vận hành | Đã quyết |
| 4 | Phân loại thay đổi | `discount_history` | — | Cột bảng | — | Nhập tay／Nhập CSV | Đã quyết |
| ~~5~~ | ~~Số cơ sở bị ảnh hưởng~~ | `discount_history` | — | Cột bảng | — | **Bãi bỏ (2026-10-05 hong trả lời・sổ tiếp nhận #148)**: thay đổi của master không ảnh hưởng đến hợp đồng・cơ sở (cũ: số cơ sở có dòng giảm giá bị thay đổi do thay đổi đó) | Bãi bỏ |


---

# Phần II　Ứng viên đăng ký (bản nháp trước khi nhập tay)

Là các mục nhặt ra từ biên bản họp và đặc tả yêu cầu. **Nhiều mục không xuất hiện số tiền trong biên bản họp nên để trống**. Khi đăng ký hãy nhập số tiền thực tế.

## Ứng viên đăng ký tùy chọn

| # | Tên tùy chọn (đề xuất) | Phân loại | Liên động | Mục hợp đồng liên động | Loại phí | Đơn vị | Số tiền tiêu chuẩn | Điều cần xác nhận |
|---|---|---|---|---|---|---|---|---|
| 1 | **Tăng số lần giao hàng** (OP000001) | Giao hàng | **A (hệ thống định nghĩa)** | Số lần giao hàng (thiết lập tuyến giao hàng) | Phí hàng tháng | 1 đơn vị vượt | ¥3,000／lần | [Đã quyết 2026-10-03] Theo từng nhóm nhiệt độ, **số lần × ¥3,000** (hàng tháng) vượt quá số lần giao hàng tiêu chuẩn của master gói. Không bù trừ giữa các nhóm nhiệt độ (28-85・28-154・28-156・hong trả lời "Tăng số lần giao hàng＝số lần × số tiền") (cũ: điều cần xác nhận "Lấy số lần chuẩn của gói từ đâu. Chỉ tính phần vượt có được không"・số tiền tiêu chuẩn —. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 2 | **Phí giao hàng theo khu vực** | Giao hàng | **Không liên động** | — | Phí hàng tháng | Cơ sở | — | [Quyết định 2026/09/29] Không liên động. Vì số tiền thay đổi tùy đơn vị giao hàng ủy thác và cùng một địa chỉ cũng không cố định. Tùy chọn chỉ có 1, số tiền tiêu chuẩn để trống, số tiền được nhập theo từng cơ sở ở biến động của hợp đồng con |
| 3 | **Phí sử dụng ES-QR** (OP000002・tên hiển thị trên hóa đơn "ES-QR") | Chức năng ứng dụng | **A (hệ thống định nghĩa)** | ES-QR | Phí hàng tháng | Cơ sở | ¥1,000 | Khi mục hợp đồng ES-QR＝sử dụng thì phí hàng tháng được tạo. Thanh toán trước. Việc miễn phí cho khách hàng hiện có được biểu thị bằng ghi đè số tiền theo từng hợp đồng (0 yên) (Quyết định_Trả lời STEP3・P6・REQ-CT-304) (cũ: [cần xác nhận] đang xác nhận có thể tự động xử lý phí hàng tháng khi sử dụng ESQR vào thanh toán hay không・số tiền tiêu chuẩn —. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 4 | **Phí sử dụng chế độ khách** | Chức năng ứng dụng | **A (hệ thống định nghĩa)** | Chế độ khách | Phí hàng tháng | Cơ sở | — | [Quyết định 2026/09/29] Đăng ký là loại A (khi mục hợp đồng "Chế độ khách" là "sử dụng"). Số tiền chưa quyết |
| 5 | **Lắp đặt hộ** | Lắp đặt・công việc | **Không liên động** | — | Phí phát sinh một lần | Lần | — | Chi phí phát sinh một lần. Tháng đối tượng được giữ ở cột thời gian đối tượng của dòng khoản mục (bỏ cách ghi trong ngoặc ở tên khoản mục). [2026/09/30 Dòng 156 của bảng yêu cầu] Doanh nghiệp chọn được ở đăng ký mới và đơn yêu cầu thay đổi (công khai＝hiển thị ở đăng ký trên Web doanh nghiệp) |
| 6 | ~~**Phí nâng cấp kích thước**~~ → **2026/10/01 đổi tên thành OP000010 Thay tủ lạnh (theo yêu cầu khách) (bổ sung Q-A). Chênh lệch kích thước là OP000023 (hàng tháng)** | Lắp đặt・công việc | **Không liên động** | — | Phí phát sinh một lần | Lần | — | Đổi dòng máy chỉ hỗ trợ nâng cấp kích thước (REQ-CT-173). Được tạo đồng thời với biến động thiết bị (đổi dòng máy) |
| 7 | **Lắp đặt lại・di dời** | Lắp đặt・công việc | **Không liên động** | — | Phí phát sinh một lần | Lần | — | Di chuyển trong cơ sở hoặc lắp đặt lại. Có liên kết với biến động thiết bị không |
| 8 | **Phí ban đầu** (OP000008. Tên hiển thị trên hóa đơn "Phí ban đầu") | Hành chính | **Không liên động** | — | Phí phát sinh một lần | Cơ sở | 10,000 | Phí ban đầu được thanh toán trong tháng (REQ-CT-182). Chỉ 1 lần ở hợp đồng con đầu tiên của lần triển khai mới. Trên hóa đơn hiển thị là "Phí ban đầu", không đặt cùng tên "Phí thủ tục" của OP000016 (hong trả lời #3) (cũ: Phí ban đầu (phí thủ tục)・số tiền tiêu chuẩn —. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá). Việc có bị tính trùng với phí ban đầu của master gói hay không cần xác nhận cùng với ⚠️ về phí ban đầu của máy bán hàng tự động bên dưới |
| 9 | **Phí quản lý thiết bị** (OP000012) | Hành chính | **Không liên động** | — | Phí hàng tháng | Cơ sở | — | [2026-10-03 hong trả lời #4] **Không đưa vào master cho đến khi khách hàng xác nhận** (phí giao lại OP000009・lắp đặt tiêu chuẩn OP000018 cũng tương tự). Việc có bị tính trùng với phí hàng tháng của master dòng máy hay không cũng chờ khách hàng xác nhận (cũ: [cần xác nhận] có bị tính trùng không. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 10 | **Chưa kiểm kê** (OP000016. Tên hiển thị trên hóa đơn "Phí thủ tục") | Phạt | **Không liên động** | — | Phí phát sinh một lần | Lần | 3,000 | **Tự động**: khi đến ngày 20 (ngày chốt của khách hàng) mà chưa có báo cáo kiểm kê (kiểm tra tồn kho). Cơ sở đang tạm ngừng・cơ sở không có kiểm tra・dùng thử không thuộc đối tượng. Dù từ ngày 21 vận hành nhập hộ thì phí thủ tục vẫn giữ nguyên. Không giữ lại thanh toán. 1 dòng ở phía thanh toán sau (MM_20261002 §1-14・Quyết định_Trả lời STEP5 Q3・sổ cái "Tên màn hình・tên khoản mục") (cũ: Phạt chưa kiểm tra・ai đăng ký vào lúc nào (tự động từ kết quả kiểm kê hay thủ công). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 11 | ~~**Thuê tủ đông (khách hàng hiện có・theo kích thước)**~~ → **2026-10-03 sổ cái "Thuê tủ đông của khách hàng cũ": thanh toán theo số tiền của master dòng máy. Không tạo tùy chọn theo kích thước** (cũ: nội dung bên phải của dòng này. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Lắp đặt・công việc | **Không liên động** | — | Phí hàng tháng | Chiếc | — | [2026/09/30 Dòng 174 của bảng yêu cầu (quyết định cuộc họp 2026/09/25)] Tiền tủ đông khi khách hàng hiện có chuyển sang Standard. Tạo từng cái cho mỗi kích thước (số tiền chưa quyết). Gắn hàng loạt bằng CSV. Standard mới đã bao gồm trong phí cơ bản nên không dùng. Thay thế OP-RENT-FZ (¥6,000 đồng giá) trong chi tiết đơn đăng ký bằng mục này |
| 12 | **Phí ban đầu tủ đông (khách hàng hiện có)** | Lắp đặt・công việc | **Không liên động** | — | Phí phát sinh một lần | Chiếc | **Số tiền chờ khách hàng xác nhận** | [2026/09/30 Dòng 174 của bảng yêu cầu] Phí ban đầu khi khách hàng hiện có đặt thêm tủ đông. Gắn hàng loạt bằng CSV. OP000033. **Số tiền chờ khách hàng xác nhận** (sổ cái "Thuê tủ đông của khách hàng cũ"・hong trả lời #6). Cho đến khi quyết định, vận hành nhập số tiền ở hợp đồng con (cũ: số tiền tiêu chuẩn 20,000. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |

## Ứng viên đăng ký giảm giá

| # | Tên giảm giá (đề xuất) | Phân loại giảm giá | Đối tượng áp dụng | Phân loại tính toán | Thời gian áp dụng | Thu hẹp đối tượng | Điều cần xác nhận |
|---|---|---|---|---|---|---|---|
| 1 | **Giảm giá khuyến mãi lần đầu** (DC000002) | Giảm giá khuyến mãi | Phí gói | **Số tiền cố định ¥3,000 [tạm]** | **Hàng tháng・3 tháng** | — | [2026-10-03 tối hong trả lời #5 (A)] Đưa vào master. Số tiền・số tháng là [tạm] (không phải giá trị khách hàng quyết định). Vận hành gắn bằng tay (cũ: tỷ lệ hoặc số tiền cố định・chỉ định số tháng・có tạo 1 cái cho mỗi khuyến mãi không. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 2 | **Giảm giá đại lý** (DC000001) | Giảm giá đại lý | Phí gói | **Tỷ lệ 5%・tối đa ¥5,000 [tạm]** | Không thời hạn | Mã đại lý đối tượng (chỉ hợp đồng có đại lý) | [2026-10-03 tối hong trả lời #5 (A)] Đưa vào master. Giá trị là [tạm]. Khác với phí giới thiệu trả cho đại lý (đại lý・phí giới thiệu) (cũ: số tiền cố định・có tạo cho từng đại lý không. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 3 | **Giảm giá chuyển từ công ty khác** (DC000012) | Giảm giá chuyển từ công ty khác | Phí ban đầu | Số tiền cố định | Chỉ định số tháng (chỉ ban đầu) | — | [2026-10-03 tối hong trả lời #5] **Không đưa vào master.** Nếu cần thì giảm số tiền của phí ban đầu OP000008 theo từng hợp đồng (tiếp nhận・③ điều chỉnh) (cũ: đưa vào dưới dạng dòng giảm giá đối với phí ban đầu (REQ-CT-202〜205). 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 4 | **Giảm giá giới thiệu** (DC000009) | Giảm giá giới thiệu | Phí gói | Số tiền cố định hoặc tỷ lệ | Chỉ định số tháng | — | [2026-10-03 tối hong trả lời #5] **Không đưa vào master** (không có căn cứ và dễ nhầm với phí giới thiệu. Nếu cần thì xác nhận với khách hàng) (cũ: xác nhận phân chia vai trò với master gói giới thiệu. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 5 | **Chiết khấu số lượng** (DC000010) | Chiết khấu số lượng | Toàn bộ hóa đơn | Tỷ lệ | Không thời hạn | Điều kiện số cơ sở (demo tạm: cùng doanh nghiệp từ 5 cơ sở trở lên・3%) | [2026-10-03 tối hong trả lời #5] **Không đưa vào master** (chưa có cách tính trừ từ toàn bộ hóa đơn) (cũ: điều kiện xác định chưa quyết・demo là giá trị tạm. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| 6 | **Chênh lệch nâng cấp Standard (Lite→Standard・khách hàng hiện có)** → **2026-10-03: gộp vào DC000021 "Ưu đãi chuyển từ Lite cũ sang Standard". DC000003 "kết thúc"** (cũ: đăng ký là DC000003. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) | Chênh lệch nâng cấp | Phí gói | Chênh lệch tự động | Hàng tháng・không thời hạn | Course＝ES Standard (chỉ khách hàng đã ký hợp đồng trước khi phát hành chức năng này và nâng cấp từ Lite・28-171) | [Quyết định 2026/09/30 28-170] Khi khách hàng hiện có nâng cấp từ Lite lên Standard, giảm giá chênh lệch (Standard − Lite) để miễn phí. CSV hàng loạt cho khoảng 800 cơ sở (REQ-PM-032／033). Tên cũ "Chênh lệch điều chỉnh giá (Standard→chung)" là sai. Trả lời 2026/09/30: khách hàng hiện có＝khách hàng đã ký hợp đồng trước khi phát hành (28-171)／hàng tháng (28-172)／vận hành gắn bằng tay, không tự động gắn khi phê duyệt nâng cấp・khách hàng không tự gắn／gỡ (28-173)／kể cả sau điều chỉnh giá vẫn tự động là Standard − Lite (28-174)／khách hàng hiện có đăng ký bằng chuyển đổi dữ liệu. Không xác định theo ngày bắt đầu hợp đồng của dữ liệu chuyển đổi (28-175) |

## Các mục đã quyết định đăng ký ngày 2026/10/01 (ID đã chốt. Quyết định_Bổ sung STEP3_Thiếu sót của master tùy chọn・giảm giá)

Mục chưa quyết số tiền thì "loại số tiền＝nhập mỗi lần". Tên・số tiền là của bảng khách hàng ([đề xuất tạm]) nên cũng sẽ xác nhận với khách hàng.

| ID | Tên tùy chọn | Phân loại | Loại phí | Loại số tiền | Đối tượng (course・phân loại dòng máy) | Căn cứ |
|---|---|---|---|---|---|---|
| OP000003 | Phí sử dụng chế độ khách (loại A) | Chức năng ứng dụng | Phí hàng tháng | **Nhập mỗi lần** (cho đến khi quyết định số tiền. O13) | Tất cả | Bổ sung §1 |
| OP000010 | **Thay tủ lạnh (theo yêu cầu khách)** (cũ: Phí nâng cấp kích thước) | Lắp đặt・công việc | Phí phát sinh một lần | Nhập mỗi lần | Tủ lạnh | Bổ sung Q-A (bảng E20). Chênh lệch kích thước (hàng tháng) chỉ thanh toán bằng OP000023 |
| OP000023 | Chênh lệch kích thước (hàng tháng) | Lắp đặt・công việc | Phí hàng tháng | Quyết định theo chênh lệch | Tủ lạnh・tủ đông | Quyết định tối 2026/10/01 (không công khai) |
| OP000024 | Phí điều động khẩn cấp | Giao hàng | Phí phát sinh một lần | Nhập mỗi lần | Tất cả | Bảng E7 (O1) |
| OP000025 | Phí công việc đặc biệt (nâng tay) | Lắp đặt・công việc | Phí phát sinh một lần | Nhập mỗi lần | ES Lite (máy bán hàng tự động)／máy bán hàng tự động | Bảng B21 (O2) |
| OP000026 | Phí công việc đặc biệt (dùng cần cẩu) | Lắp đặt・công việc | Phí phát sinh một lần | Nhập mỗi lần | ES Lite (máy bán hàng tự động)／máy bán hàng tự động | Bảng B22 (O2) |
| OP000027 | Phí công việc đặc biệt (khác) | Lắp đặt・công việc | Phí phát sinh một lần | Nhập mỗi lần | ES Lite (máy bán hàng tự động)／máy bán hàng tự động | Bảng B23 (O2) |
| OP000028 | Phí khảo sát trước nơi lắp đặt・vận chuyển vào | Lắp đặt・công việc | Phí phát sinh một lần | Nhập mỗi lần | ES Lite (máy bán hàng tự động)／máy bán hàng tự động | Bảng B24 (O3) |
| OP000029 | Thay thế do hỏng (cùng kiểu・cùng kích thước) | Lắp đặt・công việc | Phí phát sinh một lần | Cố định ¥0 | Tủ lạnh・tủ đông | Bảng E19 (O5) |
| OP000030 | Phí thủ tục máy bán hàng tự động | Hành chính | Phí hàng tháng | Nhập mỗi lần | ES Lite (máy bán hàng tự động)／máy bán hàng tự động | Bảng yêu cầu dòng 113 (O10) |
| OP000031 | Phí mua lại món ăn sẵn | Hành chính | Phí phát sinh một lần | Nhập mỗi lần | Tất cả | Bảng yêu cầu dòng 113 (O10). Việc mua lại hàng tồn còn lại khi hủy hợp đồng (S4-2) cũng thanh toán bằng mục này |
| OP000032 | ~~Thuê tủ đông (khách hàng hiện có)~~ **Kết thúc** | Lắp đặt・công việc | Phí hàng tháng | Nhập mỗi lần | ES Standard／tủ đông | **Kết thúc 2026-10-03**: tiền thuê tủ đông của khách hàng hiện có được tạo bằng **dòng thiết bị** (phí hàng tháng của master dòng máy). Không gắn bằng tùy chọn [hong trả lời 2026-10-03 (M5＝A)] |
| OP000033 | Phí ban đầu tủ đông (khách hàng hiện có) | Lắp đặt・công việc | Phí phát sinh một lần | **Nhập mỗi lần (số tiền chờ khách hàng xác nhận)** | ES Standard／tủ đông | Bảng yêu cầu dòng 174 (O11). Sổ cái "Thuê tủ đông của khách hàng cũ"・hong trả lời #6 (cũ: cố định ¥20,000. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| OP000034 | Giao hàng bổ sung (phát sinh một lần・1 lần) | Giao hàng | Phí phát sinh một lần | Cố định ¥5,000 | Tất cả | Bảng E8 (O8・Q-B). Khác với tăng số lần giao hàng hàng tháng (OP000001 ¥3,000/lần) |
| OP000035 | Người dùng dùng tiền mặt (loại A) | Chức năng ứng dụng | Phí hàng tháng | Cố định ¥0 (tạm) | Tất cả | O12. Khi cần thu phí thì điều chỉnh số tiền (ghi đè + lịch sử thay đổi) |

| ID | Tên giảm giá | Phân loại tính toán | Điều kiện | Căn cứ |
|---|---|---|---|---|
| DC000013 | Giảm giá khuyến mãi dùng thử (cũ: Giảm giá khuyến mãi dùng thử (miễn phí trong thời gian áp dụng)) | **Tham chiếu phí gói** (phí hàng tháng của ES000003 gói 50・ES Lite (tủ lạnh). Không vượt quá số tiền thanh toán) | Giới hạn số lần＝1 lần cho mỗi doanh nghiệp／điều kiện tự động gắn＝loại hợp đồng là khuyến mãi dùng thử. Chỉ bù trừ phần số tiền cố định, quyết toán thực tế (hao hụt quản lý) vẫn được thanh toán (P8). Số tiền hiện tại là **¥24,500・1 lần cho mỗi doanh nghiệp, nếu nơi nhận thanh toán theo từng cơ sở thì là cơ sở đầu tiên** (sổ cái "Giảm giá dùng thử"). Tháng gia hạn dùng thử cũng miễn phí bằng DC000013 (danh sách vấn đề 10/03) | STEP3 Q3・bổ sung Q-E |
| ~~DC000003~~ | ~~Chênh lệch nâng cấp Standard~~ → **Trạng thái sử dụng "Kết thúc". Gộp vào DC000021 Ưu đãi chuyển từ Lite cũ sang Standard** (sổ cái "DC000003") | Chênh lệch tự động | Gói・course đối tượng＝chỉ ES Standard (chuyển giao cho DC000021) | Bổ sung Q-E (cũ: đăng ký là đang dùng. 2026-10-03 sửa cho khớp với sổ cái／định nghĩa tùy chọn・giảm giá) |
| DC000021 | Ưu đãi chuyển từ Lite cũ sang Standard | Chênh lệch tự động (phí cơ bản＝giá của ES Lite (tủ lạnh) cùng gói) | Đối tượng＝chỉ ES Standard・chỉ doanh nghiệp・cơ sở có từ trước khi phát hành・hàng tháng・cho đến khi vận hành gỡ ra・thời gian tiếp nhận (thời hạn đăng ký) có thể để trống | Danh sách vấn đề 7-2・sổ cái "DC000003" (thêm 2026-10-03) |
| DC000005 | Khuyến mãi mới mùa xuân (2026・20%) | Tỷ lệ | — | **Kết thúc** (giữ lại ID làm ví dụ quá khứ. Định nghĩa tùy chọn・giảm giá §2-B [hong trả lời 2026-10-03 (M7＝A)]). (Cũ: thay thế AP-0005 của demo vận hành・Web doanh nghiệp・DC000001 cũ. DC000001 từ 10/03 là giảm giá đại lý) |

- Phí hàng tháng của máy bán hàng tự động: gói 100 ES Lite (máy bán hàng tự động) của master gói là **¥48,000** (Q-C). Giá máy bán hàng tự động của gói 150・200・300 giữ nguyên cho đến khi khách hàng xác nhận (S9＝C).
## Những điều đã quyết định ngày 2026/10/03 (bản chuẩn theo từng ID của Tùy chọn và Giảm giá)

Căn cứ: `docs/決定台帳.md` (2026-10-03), mục #1〜11 "Chốt (chiều 2026/10/03)" và #5 "Chốt 2026/10/03 tối" trong danh sách vấn đề (課題一覧) về "Master Tùy chọn / Giảm giá / Gói / Sản phẩm", cùng định nghĩa Tùy chọn・Giảm giá (2026-10-03).
- **Gộp thành 1 master (giữ nguyên ID hiện tại).** Số tiền hiển thị trên các màn hình thanh toán, đăng ký, tiếp nhận đều đọc từ master này (không tạo danh sách riêng khác).
- Số tiền là chưa gồm thuế. 【Tạm】= giá trị không phải do khách hàng quyết định. Thuế suất luôn chọn từ master thuế suất (mặc định 10%).
- Khi mâu thuẫn với bảng ứng viên ở Phần II phía trên và bảng ngày 10/01, bảng này là bản chuẩn.

**Tùy chọn (Option)**

| ID | Tên hiển thị trên hóa đơn | Tên quản lý | Liên động | Loại phí | Số tiền | Phát sinh khi nào | Ai gán | Căn cứ |
|---|---|---|---|---|---|---|---|---|
| OP000001 | Thêm số lần giao hàng | Thêm số lần giao hàng | A (số lần giao hàng) | Hàng tháng | ¥3,000／lần | Theo từng mức nhiệt độ, **số lần vượt quá số lần giao hàng tiêu chuẩn × ¥3,000**. Không bù trừ | Tự động | 28-85・28-154・28-156, hong trả lời (10/03 B) |
| OP000002 | ES-QR | Phí sử dụng ES-QR | A (ES-QR) | Hàng tháng | ¥1,000 | ES-QR = sử dụng. Trả trước | Tự động | Quyết định_Trả lời STEP3・P6 |
| OP000003 | Chế độ khách (Guest mode) | Phí sử dụng Chế độ khách | A (Chế độ khách) | Hàng tháng | Nhập mỗi lần (chưa định số tiền) | Chế độ khách = sử dụng | Tự động | Bổ sung O13 |
| OP000004 | Phí giao hàng theo khu vực | Phí giao hàng theo khu vực | Không liên động | Hàng tháng | Theo từng cơ sở (mặc định ¥4,000) | Tùy theo khu vực giao hàng | Vận hành | Quyết định_Trả lời STEP3 Q5' |
| OP000007 | Lắp đặt hộ | Lắp đặt hộ (tủ lạnh) | Không liên động | Một lần | **Nhập mỗi lần** (báo giá khi đăng ký là "báo giá riêng"). Không dùng ¥15,000 của bản demo. Số tiền chính thức cần xác nhận với khách hàng 〔hong trả lời 2026-10-03 (M10＝A)〕 | Doanh nghiệp chọn khi đăng ký / yêu cầu thay đổi | Đăng ký | Bảng yêu cầu dòng 156 |
| OP000008 | **Phí khởi tạo** | Phí khởi tạo | Không liên động | Một lần | ¥10,000 (có thể chỉnh theo từng hợp đồng) | 1 lần cho hợp đồng con đầu tiên của lần triển khai mới (thanh toán trong tháng đó) | Vận hành | REQ-CT-182・hong trả lời #3 |
| OP000010 | Đổi tủ lạnh (do khách hàng) | Như bên trái | Không liên động | Một lần | Nhập mỗi lần | Đổi do lý do của khách hàng | Vận hành | Bổ sung Q-A |
| OP000014 | Dịch vụ chỉ định khung giờ giao hàng | Như bên trái | Không liên động | Hàng tháng | ¥2,000 | Khi chọn chỉ định khung giờ trong đăng ký | Đăng ký | Quyết định_v2.3 bổ sung_Form đăng ký và master |
| OP000015 | Lắp đặt lại・di dời | Lắp đặt lại・di dời (chuyển hàng hóa) | Không liên động | Một lần | **Nhập mỗi lần**. Không dùng ¥8,000 của bản demo. Số tiền chính thức cần xác nhận với khách hàng 〔hong trả lời 2026-10-03 (M10＝A)〕 | Khi lắp đặt lại・di dời | Vận hành | Bổ sung §1 (O6) |
| OP000016 | **Phí thủ tục hành chính** | Chưa kiểm kê | Không liên động | Một lần | ¥3,000 | Khi không có báo cáo kiểm kê trước ngày 20 (trừ tạm dừng・không kiểm tra・dùng thử) | Tự động | MM_20261002 §1-14・Sổ quyết định "Tên màn hình・tên khoản phí" |
| OP000017 | Thay đổi lớp dán (wrapping) máy bán hàng tự động | Như bên trái | Không liên động | Một lần | Báo giá riêng (nhập mỗi lần) | Chọn khi đăng ký (**chỉ cơ sở có máy bán hàng tự động**) | Đăng ký | Sổ quyết định "Loại thiết bị" |
| OP000019 | Phí giao thiết bị (1 máy) | Như bên trái | Không liên động | Một lần | ¥4,800 | Giao hàng khi thay・thêm・thu hồi thiết bị (đề xuất từ biến động thiết bị) | Tự động đề xuất・Vận hành có thể chỉnh | 28-16・28-53 |
| OP000020 | Phí giao thiết bị (từ 2 máy trở lên) | Như bên trái | Không liên động | Một lần | ¥7,800 | Như trên (từ 2 máy trở lên) | Như trên | 28-16・28-53 |
| OP000021 | Phụ thu công việc leo cầu thang | Như bên trái | Không liên động | Một lần | ¥3,000 | Từ tầng 3 trở lên không có thang máy | Vận hành | 28-16 |
| OP000022 | Phí thu hồi thiết bị | Phí thu hồi thiết bị (1 máy) | Không liên động | Một lần | **0 yên** | Khi thu hồi do hủy hợp đồng, v.v. Chỉ khi cần thì Vận hành mới nhập số tiền | Vận hành | Sổ quyết định "OP000022"・hong trả lời #2 (cũ: không dùng mức ¥5,000／máy tạm trong lúc đang làm việc) |
| OP000023 | Chênh lệch kích thước (hàng tháng) | Như bên trái | Không liên động | Hàng tháng | Được xác định theo chênh lệch (chỉ khi dương) | Thay đổi kích thước tủ lạnh・tủ đông | Tự động đề xuất | Quyết định_Trả lời STEP3 Q4 |
| OP000024〜031・034 | (như bảng ngày 10/01) | — | Không liên động | — | — | — | Vận hành | Bổ sung §1 |
| OP000032 | ~~Thuê tủ đông (khách hàng hiện hữu)~~ **Đã kết thúc** | Như bên trái | Không liên động | Hàng tháng | **Phí hàng tháng của master dòng máy** (sổ quyết định) | Khách hàng hiện hữu chuyển từ Lite cũ sang Standard | ⚠️ Cần xác nhận bảng ngày 10/01 phía trên | **Kết thúc 2026-10-03**: tiền thuê tủ đông của khách hàng hiện hữu được tính ở **dòng thiết bị** (phí hàng tháng của master dòng máy). Không gán bằng tùy chọn〔hong trả lời 2026-10-03 (M5＝A)〕 |
| OP000033 | Phí khởi tạo tủ đông (khách hàng hiện hữu) | Như bên trái | Không liên động | Một lần | **Số tiền đang chờ khách hàng xác nhận** (cho đến khi quyết định, Vận hành nhập) | Như trên | Vận hành | Sổ quyết định・hong trả lời #6 (cũ: ¥20,000) |
| OP000035 | Khách hàng dùng tiền mặt | Như bên trái | A (khách hàng dùng tiền mặt) | Hàng tháng | ¥0 (tạm) | Khách hàng dùng tiền mặt = được phép | Tự động | Bổ sung §6 |
| OP000036 | Giao thêm vật tư | Giao thêm vật tư (một lần・1 lần) | Không liên động | Một lần | ¥2,000【Tạm】 | Mỗi chuyến vật tư từ lần thứ 2 trở đi **trong cùng tháng chu kỳ** (không phải tháng dương lịch). Tính 1 lần vào khoản trả sau cho kỳ chốt | Tự động | Bổ sung 5 Q13・hong trả lời #1 |
| **OP000037** (mới) | Tên hiển thị trên hóa đơn "**Phí hàng tháng máy bán hàng tự động**" (thuê máy bán hàng tự động = phí hàng tháng của máy bán hàng tự động)〔hong trả lời 2026-10-03 (M11)〕 | Thuê máy bán hàng tự động | Không liên động | Hàng tháng | **Tham chiếu dòng máy**. Giá trị ban đầu của số tiền 1 máy = phí hàng tháng trong master dòng máy của máy bán hàng tự động tại cơ sở (có thể chỉnh theo từng hợp đồng) × **số máy** (số máy bán hàng tự động đang cho mượn) | **Tự động gán vào hợp đồng con của ES Lite (máy bán hàng tự động)** (với các course khác thì bị gỡ. 2026-10-05) | Tự động | Sổ quyết định dòng "OP000022"・hong trả lời #7・Quy tắc thanh toán 2-12・REQ-PM-054 |

- **Vật tư**: ngoài OP000036, **vật tư đặt vượt quá số lượng của gói cũng được tính phí** (hong trả lời #1). Giá và thuế suất theo từng vật tư nằm trong master vật tư (mặc định ¥0). Số lượng miễn phí của gói được giữ trong bảng "Vật tư × Gói" dưới dạng "số lượng miễn phí hàng tháng" (**quyết định 2026-10-03**・sổ quyết định B "Số lượng miễn phí của vật tư").
- **Không đưa vào master**: OP000009 Phí giao lại・OP000012 Phí quản lý thiết bị・OP000018 Lắp đặt tiêu chuẩn (đã bao gồm trong gói) sẽ **không đưa vào cho đến khi có xác nhận của khách hàng** (hong trả lời #4). OP000013 Bổ sung vật tư định kỳ = kết thúc, OP000011 Báo cáo vận hành hàng tháng = kết thúc, OP000005 = đã xóa, OP000006 = số trống (không tái sử dụng ID).
- OP000030 Phí thủ tục máy bán hàng tự động (hàng tháng・nhập mỗi lần) được giữ lại như một khoản **tách biệt** với OP000037 (phí hàng tháng máy bán hàng tự động = thuê) (yêu cầu của kế toán dòng 113). **Không dùng cho phí hàng tháng・phí thuê**〔hong trả lời 2026-10-03 (M11)〕. Phí thủ tục này là phí gì thì cần xác nhận với khách hàng (`_OPEN一覧` 1003-09).

**Giảm giá**

| ID | Tên hiển thị trên hóa đơn | Cách tính | Thời hạn・số lần | Cách gán | Trạng thái | Căn cứ |
|---|---|---|---|---|---|---|
| DC000013 | Giảm giá chiến dịch dùng thử | Tham chiếu phí gói (ES000003・phí hàng tháng ES Lite (tủ lạnh)・¥24,500. Không vượt quá số tiền thanh toán. Không trừ quyết toán theo thực tế) | Thời gian dùng thử (kể cả tháng gia hạn). Mỗi doanh nghiệp 1 lần (nếu nơi thanh toán theo từng cơ sở thì là cơ sở đầu tiên) | Tự động (loại hợp đồng = chiến dịch dùng thử) | Đang sử dụng | Sổ quyết định "Giảm giá dùng thử"・STEP3 Q3 |
| DC000021 | Giảm giá chuyển đổi từ Lite cũ sang Standard | Tự động tính chênh lệch (phí cơ bản = giá ES Lite (tủ lạnh) của cùng gói). Tiền thuê tủ đông tính riêng (phí hàng tháng của master dòng máy) | Hàng tháng・cho đến khi Vận hành gỡ. Chỉ doanh nghiệp・cơ sở có từ trước khi phát hành. Hạn đăng ký có thể để trống | Tích chọn sẵn trên màn hình phê duyệt thay đổi gói (Vận hành có thể gỡ. Cũng có thể gán hàng loạt bằng CSV) (**quyết định 2026-10-03**・sổ quyết định B "Cách gán giảm giá chuyển đổi DC000021") | Đang sử dụng | Danh sách vấn đề 7-2・Sổ quyết định "DC000003" |
| DC000003 | (Chênh lệch nâng cấp Standard) | — | — | — | **Kết thúc** (gộp vào DC000021) | Sổ quyết định "DC000003"・hong trả lời #5 |
| DC000002 | Giảm giá chiến dịch lần đầu | Số tiền cố định ¥3,000【Tạm】・trừ từ phí gói | Hàng tháng・3 tháng | Vận hành | Đang sử dụng【Tạm】 | 10/03 tối #5 (A) |
| DC000001 | Giảm giá đại lý | Tỷ lệ 5%・tối đa ¥5,000【Tạm】・trừ từ phí gói | Hàng tháng・mãi mãi | Vận hành (chỉ hợp đồng có đại lý) | Đang sử dụng【Tạm】 | 10/03 tối #5 (A) |

- **Giảm giá không đưa vào master** (10/03 tối #5): DC000004 (miễn phí thêm số lần giao hàng → ghi đè OP000001 về 0 yên theo hợp đồng)・DC000007 (giảm giá đại lý số tiền cố định → dùng DC000001)・DC000008 (giảm 10% tùy chọn)・DC000009 (giảm giá giới thiệu → nếu cần thì hỏi khách hàng)・DC000010 (chiết khấu theo số lượng)・DC000011 (giảm nửa phí hàng tháng tủ lạnh → chỉnh số tiền bằng biến động thiết bị)・DC000012 (chuyển từ công ty khác → hạ số tiền OP000008 theo hợp đồng).
- Về cách tính giảm giá, hiện tại chỉ làm được "trừ từ phí gói" (số tiền cố định・tỷ lệ). Giảm giá trừ từ phí tùy chọn・phí thiết bị・toàn bộ hóa đơn sẽ được tạo khi khách hàng nói cần (Định nghĩa Tùy chọn・Giảm giá §9).

---

# Phần III　Hệ thống ID

| Đối tượng | Định dạng | Ví dụ | Kiểu | Biểu thức chính quy |
|---|---|---|---|---|
| ID dòng máy (master dòng máy) | 2 ký tự phân loại dòng máy ＋ số thứ tự (tối thiểu 6 chữ số) | `RF000001` | varchar(20) | Ghi bên dưới |
| ID tùy chọn (master tùy chọn) | `OP` ＋ số thứ tự (tối thiểu 6 chữ số) | `OP000001` | varchar(20) | `^OP[0-9]{6,}$` |
| ID giảm giá (master giảm giá) | `DC` ＋ số thứ tự (tối thiểu 6 chữ số) | `DC000001` | varchar(20) | `^DC[0-9]{6,}$` |
| ~~ID áp dụng (tùy chọn・giảm giá của cơ sở)~~ | **Bãi bỏ** (xác định bằng ID hợp đồng con ＋ mã. `AP-` là số tiếp nhận của đăng ký mới)〔hong trả lời 2026-10-03 (K7＝A)〕 | — | — | — |


Biểu thức chính quy của ID dòng máy:

```
^(RF|VM|MW|HW|BX)[0-9]{6,}$
```

Thống nhất theo dạng "**2 ký tự + 6 chữ số**" giống ID gói (`ES`＋6 chữ số). RF＝tủ lạnh・tủ đông, VM＝máy bán hàng tự động, MW＝lò vi sóng, HW＝máy hâm nóng, BX＝hộp vật tư. Không cố định số chữ số, khi số lượng tăng thì số chữ số tăng cũng được. Kiểu là varchar độ dài thay đổi.

---

# Phần III-9　Những điều đã quyết định ngày 2026/09/23

Phản ánh `01_仕様/00_Quyết_định/Quyết_định_v2.3_20260923.md`. Chỉ trích những mục liên quan đến master dòng máy.

| Quyết định | Nội dung | Nơi phản ánh |
|---|---|---|
| ⑫-3 | Chia phân loại dòng máy thành 2 loại: **tủ lạnh (RF)／tủ đông (FZ)**. Đánh số lại RF000005〜7 → FZ000001〜3 | ID dòng máy・phân loại dòng máy |
| ⑫ | ~~"Thiết bị bao gồm trong gói (cho mượn miễn phí)" được xác định bằng "Gói áp dụng miễn phí ban đầu・hàng tháng" của master dòng máy (ngưỡng số lượng cung cấp hàng tháng theo course)~~ **→ Quyết định 28-182 ngày 2026/09/30: chỉ xác định bằng thiết bị cho mượn tiêu chuẩn của master gói (dòng máy và số máy・tiêu chuẩn／thay thế)** | Master gói "Thiết bị cho mượn tiêu chuẩn"／master dòng máy "Gói bao gồm tiêu chuẩn (tham chiếu)" |
| ⑫-2 | Sức chứa tối đa **bắt buộc đối với tủ lạnh・tủ đông・máy bán hàng tự động**. Lò vi sóng・máy hâm nóng không có. **(2026/09/29 đã bỏ hộp vật tư・28-162 → §III-10)** (cũ: hộp vật tư cũng bắt buộc) | Sức chứa tối đa (2 chỗ) |
| ⑫-5 | ~~Phán định dung lượng tủ đông bằng **số suất ES × "tỷ lệ đông lạnh" của master gói** (mặc định 30%)~~ **→ Hủy theo quyết định 28-155 ngày 2026/09/29. Phán định bằng giới hạn số lượng cung cấp hàng tháng đông lạnh ÷ số lần giao hàng tiêu chuẩn đông lạnh (28-154)** | Master gói (`Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md`) |
| ⑬ | Phán định dung lượng tủ lạnh dùng **số suất ES (số lượng giao hàng 1 lần)** là được | Sức chứa tối đa |
| 2B | Số tiền thu hồi khi hủy hợp đồng: **master dòng máy giữ số tiền tiêu chuẩn, nếu "số tiền thu hồi khi hủy hợp đồng (ghi đè)" bên hợp đồng có giá trị thì ưu tiên giá trị đó** | Số tiền thu hồi khi hủy hợp đồng／thêm mục vào hợp đồng |

## Cách tính chênh lệch kích thước (hệ quả của ⑫)

> **Thay đổi theo quyết định 28-182 ngày 2026/09/30.** Cơ sở của chênh lệch không còn là "dòng máy có phí hàng tháng cao nhất trong số các dòng máy cùng phân loại được miễn phí trong hợp đồng đó", mà là **dòng máy cùng phân loại trong thiết bị cho mượn tiêu chuẩn của master gói**. Chênh lệch kích thước ＝ phí hàng tháng của dòng máy đã chọn − phí hàng tháng của dòng máy tiêu chuẩn (nếu âm thì ¥0・【tạm thời】). **Công thức và bảng ngưỡng bên dưới được giữ lại như ghi chép tại thời điểm 2026/09/23 (đã hủy).**

```
Chênh lệch kích thước ＝ phí hàng tháng của dòng máy đã chọn
             −（dòng máy có phí hàng tháng cao nhất trong số các dòng máy cùng phân loại được miễn phí trong hợp đồng đó）
             ※ Nếu âm thì ¥0
```

Phán định miễn phí là **tổng giới hạn cung cấp hàng tháng ≧ ngưỡng**. Mức tham khảo của ngưỡng: gói 50＝200／gói 100＝400／gói 150＝600 (số suất ES × số lần giao hàng 4).

| Dòng máy | Phí hàng tháng | Lite | Standard | Cách xử lý ở Gói 100 Standard (400) |
|---|---|---|---|---|
| RF000001 Tủ lạnh 46L (**từ 2026/09/29 là tủ trưng bày lạnh 48L・¥5,000 tạm. Cấu hình tủ lạnh lấy theo bảng mới ở §0.9-3 là chuẩn, bảng này là ví dụ tại thời điểm 2026/09/23**) | ¥4,000 | 200 | 200 | Miễn phí |
| RF000002 Tủ lạnh 84L | ¥6,000 | 400 | 400 | **Miễn phí (cao nhất trong phân loại này＝cơ sở của chênh lệch)** |
| RF000003 Tủ lạnh 120L | ¥8,000 | 600 | 600 | Không được miễn phí → chênh lệch ¥8,000 − ¥6,000 ＝ **¥2,000** |
| FZ000001 Tủ đông 60L | ¥4,500 | (để trống) | 200 | Miễn phí |
| FZ000002 Tủ đông 100L | ¥5,500 | (để trống) | 400 | **Miễn phí** |
| FZ000003 Tủ đông 150L | ¥7,000 | (để trống) | 600 | Không được miễn phí → chênh lệch ¥1,500 |
| BX000001〜5 Hộp vật tư (§III-10) | ¥0 | 200 | 200 | Phí hàng tháng ¥0 nên không ảnh hưởng đến kết quả. Cái gì được gắn bao nhiêu cái theo thiết bị cho mượn tiêu chuẩn của master gói (28-160) |
| MW000001 Lò vi sóng | ¥5,000 | (để trống) | (để trống) | Thiết bị bổ sung (toàn bộ số tiền) |
| VM000001 Máy bán hàng tự động | Báo giá riêng | (để trống) | (để trống) | Thiết bị bổ sung (báo giá riêng) |

**Để trống ngưỡng tủ đông của Lite** nhằm thể hiện "với Lite thì tủ đông không được miễn phí".

# Phần III-10　2026/09/29 Mặc định của hộp vật tư (quyết định 28-160〜163)

Căn cứ: tài liệu của khách hàng "Starter Kit (PP)", "Kích thước BOX (tiêu chuẩn)", "Kích thước BOX (lớn)" (ảnh đính kèm trong chat ngày 2026/09/29). Bản chuẩn của quyết định là `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Mặc_định_hộp_vật_tư_20260929.md`.

**Hộp vật tư là hàng cho mượn (master dòng máy BX). Mặc định theo từng gói nằm trong "Thiết bị cho mượn tiêu chuẩn" của master gói.** Khác với bộ vật tư ban đầu (master vật tư × gói・28-129), bộ ban đầu không bao gồm hộp vật tư.

## Hộp vật tư đăng ký vào master dòng máy (ID là đề xuất)

| ID dòng máy | Tên dòng máy (đề xuất) | Rộng×Sâu×Cao | Trọng lượng | Nội dung ghi vào ghi chú dòng máy | Phí hàng tháng |
|---|---|---|---|---|---|
| BX000001 | Hộp 《Đĩa có ngăn》 | 260×370×170mm | Cần xác nhận | Có thể xếp chồng | ¥0 |
| BX000002 | Hộp 《Đĩa sâu》 | 260×370×170mm | Cần xác nhận | Có thể xếp chồng | ¥0 |
| BX000003 | Hộp 《Đồ ăn》 | 260×370×170mm | Cần xác nhận | Có thể xếp chồng／vì vệ sinh nên không đặt trực tiếp xuống sàn | ¥0 |
| BX000004 | Hộp dạng tủ ngăn kéo (lớn) | 600×400×860mm (có bánh xe 920mm) | Khoảng 7kg | 4 tầng・có bánh xe. Chỉ khi gói lớn | ¥0 |
| BX000005 | Giỏ | Cần xác nhận | Cần xác nhận | — | ¥0 |

- **Không có sức chứa tối đa** (28-162. Vì không dùng để phán định dung lượng theo số suất nên đã bỏ khỏi mục bắt buộc ở ⑫-2).
- Thời gian sử dụng tối thiểu・số tiền thu hồi khi hủy hợp đồng để trống (hàng miễn phí・§0.0). Phí hàng tháng theo master dòng máy như 28-9 (hiện là ¥0).

## Mặc định đưa vào "Thiết bị cho mượn tiêu chuẩn" của master gói

| Gói | Đĩa có ngăn | Đĩa sâu | Đồ ăn | Dạng tủ ngăn kéo | Giỏ |
|---|---|---|---|---|---|
| ES50・ES100・ES150・ES200 | 1 | 1 | 1 | — | 1 |
| ES300・ES400・ES500 | — | — | — | 1 | 1 |

- Không thay đổi theo course (Lite／Standard)【tạm thời】. Dù chọn mẫu tiêu chuẩn / thay thế nào của tủ lạnh (ES400・500) thì dòng hộp vật tư vẫn như nhau.
- Khi cần nhiều hơn mặc định: doanh nghiệp dùng "thiết bị muốn bổ sung" trong đăng ký, Vận hành dùng "biến động thiết bị" của hợp đồng con (ghi chú trong tài liệu "nếu hộp Đồ ăn không đủ xin hãy liên hệ"). Trao đổi về chỗ đặt thì dùng "ghi chú ngoài gói" trong đăng ký.
- ES250・ES600 trở lên không có trong tài liệu thì không thêm dòng hộp vật tư (Vận hành thiết lập theo từng cơ sở・28-165).

# Phần IV　Những điều chưa quyết định (OPEN)

| # | Hạng mục | Nội dung | Phụ trách |
|---|---|---|---|
| 1 | Chế độ khách・dùng tiền mặt có phí hay không | **Quyết định (2026/09/29)**: đăng ký phí sử dụng Chế độ khách theo loại A (số tiền chưa định). Thanh toán tiền mặt có chủ trương bãi bỏ từ 2026/08/25 | Aoyama |
| 2 | Phí hàng tháng ES-QR | **→ Đã giải quyết (phản ánh 2026-10-03)**: OP000002・loại A・hàng tháng ¥1,000・trả trước (Quyết định_Trả lời STEP3・P6). Miễn phí cho khách hàng hiện hữu là ghi đè số tiền (0 yên) (cũ: dừng ở "xác nhận xem có thể tự động xử lý thanh toán theo dạng giống tùy chọn mua hay không" (đặc tả hợp đồng §8D-3). Đã sửa cho khớp với sổ quyết định／định nghĩa Tùy chọn・Giảm giá 2026-10-03) | Hong |
| 3 | Tính trùng giữa phí quản lý thiết bị và tùy chọn | Ở dòng khoản phí ①, phần xuất phát từ master dòng máy (model) và phần xuất phát từ tùy chọn (option) có bị trùng nhau không. **2026-10-03: phí quản lý thiết bị (OP000012) không đưa vào master cho đến khi có xác nhận của khách hàng (hong trả lời #4). Đang chờ khách hàng** | Hong |
| 4 | Thứ tự áp dụng chồng | **Quyết định (2026/09/25)**: nhập thứ tự áp dụng theo từng giảm giá | Aoyama |
| 5 | Tháng bắt đầu có hiệu lực của loại liên động A | **Quyết định (2026/09/25)**: từ hợp đồng con của tháng sau. Không có mục "tháng bắt đầu có hiệu lực" | Aoyama |
| 6 | Phân loại công khai | Có tùy chọn nào hiển thị trên màn hình đăng ký của Web doanh nghiệp không (nếu có thì cũng cần sửa form đăng ký) | Aoyama |
| 7 | Miễn phí có điều kiện | **Quyết định (2026/09/29)**: không giữ trong master tùy chọn. Khi muốn về 0 yên theo điều kiện thì biểu thị bằng master giảm giá (đối tượng áp dụng＝phí tùy chọn) | Aoyama |
| 8 | Nơi đặt khoản thanh toán vượt quá tổn thất quản lý | **Quyết định (2026/09/29)**: không đưa vào master tùy chọn. Quản lý bằng luồng khác | Hong |
| 9 | Tiền phạt hủy thiết bị và tiền phạt hủy hợp đồng chung (**Quyết định 2B ngày 2026/09/23 đã xác định master dòng máy giữ số tiền tiêu chuẩn và có thể ghi đè theo hợp đồng. Chỉ còn lại quan hệ với số tiền cố định chung**). **Phản ánh 2026-10-03: cách tính tiền phạt đã được xác định theo sổ quyết định "Tiền phạt" ＝ số tiền thu hồi × số tháng còn lại ÷ thời gian sử dụng tối thiểu (tủ lạnh 3・máy bán hàng tự động 12). Sổ quyết định không có số tiền cố định chung** | Lấy cả "số tiền thu hồi khi hủy hợp đồng" của master dòng máy (tiền hủy hợp đồng trong thời gian sử dụng tối thiểu) và tiền phạt hủy hợp đồng số tiền cố định chung (master tùy chọn・phí khác), hay chỉ lấy một trong hai | Aoyama |
| 10 | Sức chứa tối đa của layout máy bán hàng tự động | Công thức tính・cách xử lý ô vô hiệu・ý nghĩa của số trong loại chứa (ví dụ 468 trên màn hình hiện tại không khớp với tổng đơn giản) | Hong |
| ~~14~~ | ~~Giá trị ban đầu của tỷ lệ đông lạnh~~ **→ 2026/09/29 28-155 quyết định không giữ chính tỷ lệ đông lạnh** | Đã quyết định giữ trong master gói. Tỷ lệ % cụ thể đưa vào từng gói (bản nháp: 30%) | Aoyama |
| ~~15~~ | ~~Số dùng cho phán định miễn phí~~ **→ 2026/09/30 quyết định 28-182 đã bỏ chính việc phán định miễn phí của master dòng máy nên không cần** | Mô tả của master dòng máy là "tổng giới hạn cung cấp hàng tháng". Demo của trang doanh nghiệp đang chạy bằng "số suất ES". **Lấy cái nào làm chuẩn** (tổng＝số suất ES × số lần giao hàng 4 nên bậc của ngưỡng thay đổi) | Hong |
| 16 | Số tiền thu hồi khi hủy hợp đồng của máy bán hàng tự động (số tiền tiêu chuẩn) | Đã quyết định giữ số tiền tiêu chuẩn trong master dòng máy. Bao nhiêu thì chưa định (demo đặt tạm ¥150,000) | Aoyama |
| 17 | Sức chứa tối đa của tủ đông | Do trở thành bắt buộc ở ⑫-2 nên cần giá trị (bản nháp: 60L＝40／100L＝70／150L＝110) | Aoyama |
| 11 | Lựa chọn nhà sản xuất theo từng phân loại dòng máy | Nội dung lựa chọn, và giữ bằng master nhà sản xuất hay giá trị cố định | Hong |
| 12 | Hiệu lực／Vô hiệu | `—（thao tác）` | — | Thao tác | ○ | 【Khi phân loại dòng máy＝máy bán hàng tự động】Đặt ô đã chọn là vô hiệu (ô không dùng)／đưa về hiệu lực. Ô vô hiệu hiển thị màu xám | Đã xác định |
| 13 | Layout máy bán hàng tự động: hàng | `model_vm_cell.row` | char(1) | Cột bảng | ○ | 【Khi phân loại dòng máy＝máy bán hàng tự động】A, B, C… (bằng số tầng (hàng)) | Đã xác định |
| 12 | Chưa thu hồi xong (cảnh báo) | `—（tính toán）` | — | Tham chiếu | ○ | Số lượng có ngày dự kiến trả < hôm nay và số lượng chưa trả > 0. Xem theo từng dòng máy thì biết việc thu hồi thiết bị nào đang bị chậm | Đã xác định |
| ~~12~~ | ~~**Chủ sở hữu thiết bị bao gồm trong gói**~~ **→ Quyết định ⑫B ngày 2026/09/23: xác định bằng "Gói áp dụng miễn phí ban đầu・hàng tháng" của master dòng máy (ngưỡng số lượng cung cấp hàng tháng theo course). Không thêm mục mới. Số máy do thiết bị cho mượn tiêu chuẩn của master gói giữ.** | "Trong gói cho mượn miễn phí tủ lạnh・hộp vật tư (tùy gói có cả tủ đông) (kích thước chỉ định)" (2026/09/18). Chưa quyết định **gói nào bao gồm dòng máy (kích thước) nào, bao nhiêu máy** là do master gói giữ dưới dạng bảng, hay biểu thị bằng "Gói áp dụng miễn phí ban đầu・hàng tháng (ngưỡng số lượng cung cấp hàng tháng theo course)" của master dòng máy. Ngưỡng hiện tại **là chuyện số tiền, không có chuyện số máy** nên không biểu thị được số lượng hộp vật tư (gói 50＝1・100＝2・150＝3). Demo cho master gói giữ "thiết bị cho mượn tiêu chuẩn (dòng máy＋số máy)" | Aoyama |
| ~~12-2~~ | ~~Có bắt buộc sức chứa tối đa hay không~~ **→ Quyết định 2026/09/23: tủ lạnh・tủ đông・máy bán hàng tự động・hộp vật tư là bắt buộc. Lò vi sóng・máy hâm nóng không có. (2026/09/29 đã bỏ hộp vật tư・28-162)** | Dòng máy hiển thị trên Web doanh nghiệp dùng để phán định dung lượng nên muốn đặt sức chứa tối đa (hiện là tùy chọn) là **bắt buộc** (§0.9-4 ①) | Aoyama |
| ~~12-3~~ | ~~Phân biệt tủ lạnh và tủ đông~~ **→ Quyết định B ngày 2026/09/23: chia phân loại dòng máy thành 2 loại "tủ lạnh (RF)" và "tủ đông (FZ)". Đánh số lại RF000005〜7 hiện có thành FZ000001〜3 (vì trước khi phát triển Phase2 nên không có dữ liệu di chuyển).** | Vì gộp phân loại làm 1 nên không thể quyết định dòng máy có thể thay thế chỉ bằng master dòng máy. Đề xuất cho "dòng máy có thể thay thế" vào thiết bị cho mượn tiêu chuẩn của master gói (§0.9-4 ②) | Aoyama |
| 12-4 | Cách biểu thị "báo giá riêng" của máy bán hàng tự động | Vì phí hàng tháng là bắt buộc nên không thể biểu thị "không đưa ra số tiền". Đề xuất thêm "hiển thị trong đăng ký (số tiền báo giá riêng)" vào phân loại công khai (§0.9-4 ③) | Aoyama |
| ~~12-5~~ | ~~Số dùng để phán định dung lượng tủ đông~~ **→ Quyết định C ngày 2026/09/23: master gói giữ "tỷ lệ đông lạnh" (mặc định 30%. Biên bản họp 2026/09/15 "đông lạnh tối đa 30% toàn gói" được thành mục). Số sức chứa cần thiết của tủ đông＝số suất ES × tỷ lệ đông lạnh.** **→ 2026/09/29 28-155 hủy. Không giữ tỷ lệ đông lạnh (sổ quyết định "tỷ lệ đông lạnh" 2026-10-03). Tủ đông phán định bằng giới hạn số lượng cung cấp hàng tháng đông lạnh ÷ số lần giao hàng tiêu chuẩn đông lạnh (28-154)** (cũ: giữ nguyên quyết định C mà không có ghi chú hủy. Đã sửa cho khớp với sổ quyết định／định nghĩa Tùy chọn・Giảm giá 2026-10-03) | Tủ lạnh có thể phán định bằng "sức chứa tối đa ≧ số suất ES của gói", nhưng **gói không có thông tin trong số suất đó đông lạnh là bao nhiêu suất** nên không phán định được dung lượng tủ đông. Demo **không phán định dung lượng chỉ riêng tủ đông** (chọn kích thước nào cũng được). Cho master gói giữ "chi tiết lạnh／đông lạnh", hoặc giữ nguyên không phán định tủ đông | Aoyama |
| ~~13~~ | ~~Số dùng để phán định dung lượng~~ **→ Quyết định 2026/09/23: tủ lạnh dùng số suất ES (số lượng giao hàng 1 lần) là được. Tủ đông nhân với tỷ lệ ở 12-5.** **→ Tỷ lệ của tủ đông đã hủy theo 28-155 (sổ quyết định "tỷ lệ đông lạnh"). Cả lạnh và đông lạnh đều phán định bằng "số lượng giao hàng 1 lần"** (2026-10-03 đã sửa cho khớp với sổ quyết định／định nghĩa Tùy chọn・Giảm giá) | Việc phán định kích thước được thực hiện bằng "sức chứa tối đa của master dòng máy ≧ số suất ES của gói". **Số suất ES của gói có giống với "số lượng giao hàng 1 lần" hay không**. Khi số lần giao hàng là nhiều lần, số vào tủ lạnh mỗi lần có thể khác với số suất | Hong |
