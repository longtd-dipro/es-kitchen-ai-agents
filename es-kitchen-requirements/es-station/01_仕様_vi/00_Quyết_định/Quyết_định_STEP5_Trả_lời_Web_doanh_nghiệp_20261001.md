> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực xem `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế xem mục "G" của sổ cái.

# Quyết định: Trả lời STEP5 (Web doanh nghiệp・Quản lý menu) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Ghi chép: Claude (Cowork). Nội dung xác nhận xem `デモ全体確認_STEP5_法人Web_20261001.md`.
> **Đã phản ánh vào demo (v1.59・2026/10/01)**. Nội dung xem `02_デモ/デモ_更新履歴.md` v1.59. Những gì chưa phản ánh nằm ở mục "Những thứ chưa đưa vào" của lịch sử cập nhật.

## 1. Quyết định (Long trả lời 2026/10/01)

| No | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| Q1 | Nếu trụ sở chính dùng màn hình máy bán hàng tự động thì Web doanh nghiệp sẽ mất mẫu đơn hàng đông lạnh | **B** | Trụ sở chính dùng màn hình đặt hàng ES Lite (máy bán hàng tự động) 100・Chuyến giao ES (như quyết định STEP3). **Đổi Văn phòng Yokohama (CU00950) thành ES Standard (có đông lạnh)**, làm mẫu đơn hàng đông lạnh cho Web doanh nghiệp. Vì Văn phòng Yokohama chỉ có trong đơn hàng hằng tháng và quản lý đơn hàng của vận hành, nên bổ sung thêm vào quản lý cơ sở・trang chủ・kiểm tra tồn kho・doanh nghiệp / cơ sở / hợp đồng của vận hành |
| Q2 | Dạng đơn hàng vật tư | **B Bất kỳ lúc nào** | Có thể đặt vật tư bất kỳ lúc nào (mỗi đơn hàng tạo dữ liệu giao hàng của chuyến vật tư. Giống quyết định v2.3 #36). **Cơ bản tối đa 1 lần/tháng** (đã bao gồm trong phí). **Nếu phát sinh đơn hàng・giao hàng vượt quá thì tính phí riêng** (gắn dưới dạng tùy chọn) |
| Q3 | Kiểm tra tồn kho khi tạm dừng | **A (như quyết định P5) + không báo lỗi** | Khi tạm dừng, nếu cần vẫn thực hiện kiểm tra tồn kho・quyết toán thực tế, và thanh toán sẽ gộp khi mở lại hoặc khi hủy hợp đồng (P5). **Tuy nhiên khi tạm dừng thì không kiểm tra cũng không hiển thị lỗi** (không cảnh báo chưa khai báo・quá hạn, không giữ thanh toán, không tính phí xử lý hành chính) |
| Q4 | Có cho doanh nghiệp xem đánh giá không | **Cho xem (trừ ý kiến)** | Web doanh nghiệp chỉ hiển thị **ẩn danh・sao・thẻ đánh giá**. **Không hiển thị ý kiến (văn bản tự do)**. Không hiển thị tên người đăng・ID người dùng |
| Q5 | Phiếu giao hàng (bảng yêu cầu, dòng 178) | **A** | Thêm chức năng xuất phiếu giao hàng vào Web doanh nghiệp. Xuất **theo tháng・theo cơ sở**. **Trừ vật tư** |
| Q6 | Chuyến đông lạnh | **A** | Đông lạnh **giữ nguyên 2 lần đặt tạm** (gói 100: đông lạnh 2 lần・10 phần mỗi lần). Không áp dụng bảng yêu cầu dòng 173 (đông lạnh chỉ chuyến đầu) |

## 2. Các chi tiết được quyết định từ các quyết định trên (làm tiền đề khi phản ánh. Nếu sai xin chỉ ra)

### Q1 Văn phòng Yokohama
- Văn phòng Yokohama: ES Standard gói 100 (ES000004)・chuyến COOL・lạnh 2 lần / đông lạnh 2 lần・số lượng cung cấp hằng tháng: đông lạnh 1〜20・lạnh・nhiệt độ thường 0〜80 (chuyển nội dung màn hình đặt hàng hiện tại của trụ sở chính sang Yokohama).
- Mẫu máy bán hàng tự động là trụ sở chính (ES Lite (máy bán hàng tự động) 100・Chuyến giao ES・chỉ lạnh). Hiển thị ô của máy bán hàng tự động (ô đôi・ô đơn・số lượng chứa tối đa) chuyển sang trụ sở chính.
- Các dòng Văn phòng Yokohama trong quản lý đơn hàng sản phẩm・quản lý đơn hàng vật tư của vận hành cũng sửa cột course・máy bán hàng tự động (Lite (máy bán hàng tự động)・có → Standard・không). Trụ sở chính thì ngược lại.
- Việc có bổ sung thanh toán・cho thuê (tủ lạnh・tủ đông)・hợp đồng con của Văn phòng Yokohama hay không sẽ quyết định phạm vi khi phản ánh (tối thiểu: danh sách・chi tiết quản lý cơ sở, trang chủ, kiểm tra tồn kho, danh sách doanh nghiệp・cơ sở・hợp đồng của vận hành).

### Q2 Đơn hàng vật tư
- Đơn hàng vật tư của Web doanh nghiệp bỏ kiểu "thời gian tiếp nhận giống sản phẩm・giao 1 lần", chuyển thành dạng **đặt bất kỳ lúc nào**. Mỗi đơn hàng tạo dữ liệu giao hàng của chuyến vật tư (Yamato) và hiển thị trên lịch ở trang chủ.
- **Tối đa 1 lần/tháng** đã bao gồm trong phí. Đơn hàng・giao hàng từ lần thứ 2 trong tháng đó **tính phí riêng**. Cách đếm là "số lần giao hàng của chuyến vật tư (theo tháng chu kỳ)".
- Phí riêng được gắn vào hợp đồng con dưới dạng tùy chọn. **Tạo mới OP000036 "Giao thêm vật tư (một lần・1 lần)"** (§2-2. Số tiền chưa quyết định).
- Màn hình đặt hàng của Web doanh nghiệp hiển thị "Đơn hàng vật tư tháng này là lần 1 (đã bao gồm trong phí) / từ lần 2 trở đi tính phí riêng ¥…".
- Bộ khởi tạo (đơn hàng tự động khi phê duyệt đăng ký) có tính vào số lần hay không 【cần xác nhận】.

### Q3 Kiểm tra tồn kho khi tạm dừng
- Trạng thái của cơ sở đang tạm dừng không phải "không kiểm tra" mà là "**tùy chọn**" (tạm dừng). Nếu khai báo thì ghi nhận và dùng cho quyết toán thực tế của vận hành. Nếu không khai báo thì cũng không chuyển thành "chưa khai báo (quá hạn)".
- Phía vận hành: kết quả quyết toán thực tế khi tạm dừng sẽ gộp vào hóa đơn khi mở lại hoặc khi hủy hợp đồng (P5. Nơi lưu kết quả sẽ thiết kế khi phản ánh STEP3).
- Văn phòng Nagoya tạm dừng từ chu kỳ tháng 10/2026, nên sửa các kỳ tháng 7〜9 thành "đã khai báo".

### Q4 Đánh giá
- Các cột của Web doanh nghiệp: ID đánh giá・ngày giờ đăng・cơ sở・sản phẩm và sao・thẻ đánh giá. Bỏ cột "Bình luận".
- Phạm vi hiển thị giống quyết định #55: tài khoản doanh nghiệp = tất cả cơ sở của công ty mình, tài khoản cơ sở = chỉ cơ sở của mình.
- "Đánh giá・Ý kiến" của vận hành giữ như trước (cũng xem được ý kiến).

### Q5 Phiếu giao hàng
- Trên Web doanh nghiệp chọn tháng đối tượng・cơ sở để xuất (định dạng giống phiếu giao hàng hiện tại. Bảng yêu cầu ghi bổ sung 2026/09/30 "OK").
- Xuất được nếu việc giao hàng của tháng đó đã bắt đầu (ví dụ: tại thời điểm tháng 8, nếu việc giao hàng của tháng 9 đã bắt đầu thì xuất được phần tháng 9).
- Vị trí đặt (trang chủ / lịch sử đặt hàng của đơn hàng hằng tháng / quản lý cơ sở) sẽ đề xuất khi phản ánh.

## 2-2. Phụ lục: Tùy chọn đặt thêm vật tư (Long trả lời 2026/10/01)

- **Không dùng OP000013 "Bổ sung vật tư định kỳ" (hằng tháng ¥1,500)**. Nó không xuất phát từ yêu cầu của khách hàng, mà được đưa vào master tùy chọn của demo vận hành từ "tùy chọn khác" trong demo biểu mẫu đăng ký cũ (`Tùy_chọn_Sắp_xếp_đặc_tả_và_demo_màn_hình_v1.md` #12 "chỉ có trong demo biểu mẫu đăng ký"). Nhận định của Long là "không có tùy chọn bổ sung vật tư định kỳ". → **Bãi bỏ** (loại khỏi master・"tùy chọn muốn thêm" của biểu mẫu đăng ký・ví dụ đăng ký của Trụ sở Tokyo (Sample Foods) trong quản lý đơn đăng ký. Demo sẽ sửa khi phản ánh STEP5).
- **Tạo mới: OP000036 "Giao thêm vật tư (một lần・1 lần)"**

| Mục | Giá trị |
|---|---|
| ID tùy chọn | OP000036 |
| Tên tùy chọn | Giao thêm vật tư (một lần・1 lần) |
| Phân loại | Giao hàng |
| Loại liên kết | Không liên kết (hệ thống vận hành gắn dựa trên số chuyến vật tư) |
| Loại phí | Phí một lần |
| Số tiền | **Chưa quyết định** (số tiền cố định. Xác nhận với khách hàng) |
| Đơn vị | Lần |
| Course áp dụng | Tất cả |
| Trạng thái công khai | Không công khai (không hiển thị trên biểu mẫu đăng ký) |
| Điều kiện gắn | Cứ mỗi đơn hàng vật tư (chuyến vật tư) từ lần thứ 2 trở đi trong cùng tháng chu kỳ thì gắn 1 cái |
| Thanh toán | Dòng "một lần" của hợp đồng con đó (hóa đơn tháng sau) |

- OP000034 "Giao thêm (một lần・1 lần) ¥5,000" là giao thêm thực phẩm (bảng liệt kê của khách hàng E8), nên tách riêng với vật tư (vật tư là chuyến vật tư của Yamato, cách giao và chi phí khác nhau).
- **Ghi đè quyết định 28-108 "Bộ khởi tạo miễn phí・đơn hàng vật tư từ lần 2 trở đi có phí"**: đến 1 lần/tháng thì đã bao gồm trong phí, từ lần 2 trở đi là OP000036. **Bộ khởi tạo (tự động khi phê duyệt đăng ký) không tính vào số lần** ("bộ khởi tạo miễn phí" của 28-108 giữ nguyên)【cần xác nhận】.

## 2-3. Phụ lục: Cách xử lý đơn hàng theo từng tình huống của hợp đồng (Long trả lời 2026/10/01)

| No | Vấn đề | Quyết định |
|---|---|---|
| QA | Khi phê duyệt đổi gói・thay đổi giao hàng (số lần giao hàng)・tạm dừng・hủy hợp đồng trong thời gian đặt hàng, đơn hàng đã đăng ký (hoặc mặc định) của chu kỳ đó | **A Tự động sửa**. Tạm dừng・hủy hợp đồng = hủy đơn hàng của chu kỳ đó. Đổi gói・thay đổi giao hàng = quay về đơn hàng mặc định theo điều kiện mới, thông báo cho doanh nghiệp và để họ nhập lại đến hạn chốt |
| QB | Sau khi chuyển từ dùng thử → triển khai chính thức, đơn hàng của chu kỳ triển khai chính thức đầu tiên | **A Đơn hàng hằng tháng thông thường (doanh nghiệp nhập)**. **Đơn hàng trong thời gian dùng thử vẫn tự động tạo như trước** (28-95・28-101. Doanh nghiệp không sửa được・vận hành tinh chỉnh đến ngày chốt đặt hàng). QB chỉ là cách xử lý sau khi chuyển |
| QC | Có cho doanh nghiệp xem đơn hàng dùng thử trên Web doanh nghiệp không | **A Cho xem chỉ để tham khảo** (số lượng・sản phẩm・ngày giao. Không hiển thị nút sửa・AI・khảo sát) |

- Bổ sung QA (tiền đề khi phản ánh): việc đã tự động sửa sẽ được ghi vào "phạm vi ảnh hưởng" của màn hình phê duyệt và thông báo cho doanh nghiệp. Khi còn ít ngày đến hạn chốt (ví dụ: phê duyệt vào trước ngày hạn chốt) cũng xử lý như vậy, nếu không nhập lại thì sẽ chốt theo đơn hàng mặc định của điều kiện mới.
- Bổ sung QB: nếu phê duyệt chuyển đổi diễn ra sau hạn chốt đơn hàng thì theo 2 lựa chọn sau hạn chốt (dời sang kỳ sau / đặt hàng hộ・quyết định STEP1).

## 2-4. Phụ lục: Cách quyết định số tiêu chuẩn (số cơ sở) (Long trả lời 2026/10/01)

- **Áp dụng đề xuất cải tiến 1 "Hệ thống phân bổ theo tỷ lệ"** (phân bổ theo trọng số, tự động tuân thủ giới hạn trên・dưới theo nhóm nhiệt độ, chênh lệch giữa các chuyến ±1, số lượng chứa của máy bán hàng tự động).
- Tuy nhiên, **vận hành có thể chỉ định sản phẩm (ngoại trừ) và danh mục không đưa vào số tiêu chuẩn** (cùng cách nghĩ với đơn hàng của doanh nghiệp).
- Quan trọng nhất là **vận hành có thể sửa kết quả bằng tay** (số sửa tay được ưu tiên).
- Việc mở rộng đề xuất AI của doanh nghiệp (tồn kho・gói・tỷ lệ hủy・danh mục đã thiết lập) và "từ tháng sau là giá trị mặc định riêng cho khách hàng" sẽ được xem xét trong `Đề_xuất_Số_chuẩn_và_mặc_định_riêng_cho_cơ_sở_20261001.md` (01_仕様/50_Đơn_hàng) (tài liệu AI tham khảo là `Order-Spec-for-AI-Team_20260731.docx`. `ES_Kitchen_AI_Document` đã cũ nên không dùng).

### Trả lời Q1〜Q7 của đề xuất (bản 2) (Long 2026/10/01)

| No | Vấn đề | Quyết định |
|---|---|---|
| Q1 | Mặc định riêng của khách hàng | **Cơ sở đã tích "Áp dụng từ lần sau" sẽ tự động soạn nháp đề xuất AI với menu mới từ tháng sau** (nhận định là đã đưa vào thiết kế Figma. Thêm checkbox vào màn hình AI của demo). Thay thế AI mode hiện tại (nếu chưa đăng ký đến hạn chốt thì chốt theo số của AI) bằng cái này【việc thay thế cần xác nhận】. Đóng RD-AP-149 |
| Q2 | Đầu vào của AI: tồn kho・tỷ lệ hủy・thực tế bán | **A**: dùng đến dữ liệu đã chốt tại thời điểm đặt hàng (khi đặt hàng tháng 11 thì dùng đến kiểm tra tồn kho kỳ tháng 9). **Đã yêu cầu nhóm AI** (nhận định của Long) |
| Q3 | Cách vận hành giữ số tiêu chuẩn | **A**: 1 trọng số + chỉ định ngoại trừ・danh mục → hệ thống phân bổ theo 3 loại (thường / không có hạn dùng ngắn / máy bán hàng tự động. RD-MN-041・042) × course, vận hành có thể sửa tay. **Đơn giá trung bình cũng là dữ liệu để quyết định** (đơn giá trung bình trong thống kê menu・RD-MN-057) → hiển thị đơn giá trung bình của kết quả phân bổ trong bảng mẫu【có để phạm vi mục tiêu và tô đỏ khi vượt ngoài hay chỉ hiển thị・giá bán hay đơn giá nhập thì cần xác nhận】 |
| Q4 | Giới hạn trên cho mỗi sản phẩm | **A Giữ theo từng gói trong master gói** (giá trị chưa quyết định) |
| Q5 | Tổng giới hạn trên của nhóm nhiệt độ | **A**: sửa 28-178① thành "giới hạn trên của đông lạnh + giới hạn trên của lạnh・nhiệt độ thường không cần bằng tổng giới hạn cung cấp hằng tháng (tổng giới hạn trên ≧ tổng)" (phù hợp với Order-Spec ✅ đã chốt. Đơn hàng hằng tháng Q1 "phân bổ tự do trong phạm vi" cũng được thực hiện bằng cách này) |
| Q6 | Mặc định của hạn dùng ngắn | Long: "Vì là COOL nên tôi nghĩ không có chuyện không có hạn dùng ngắn" → **Diễn giải (cần xác nhận)**: sản phẩm hạn dùng ngắn cũng là đối tượng như bình thường (mặc định = lấy. Giữ nguyên RD-AP-148). Cần xác nhận có giữ hay bỏ việc cơ sở được chọn "không lấy" trong thiết lập |
| Q7 | Cách chia chuyến | **A Đếm theo từng nhóm nhiệt độ** (giống thiết lập tuyến giao hàng của hợp đồng). Cũng thông báo cho nhóm AI |

## 2-5. Phụ lục: Trả lời xác nhận (chiều 2026/10/01 Long)

### Số tiêu chuẩn・AI
| Vấn đề | Quyết định |
|---|---|
| Q3 Đơn giá trung bình | Cách vận hành hiện tại là "Phiếu yêu cầu bảng menu" (bảng tính・Long chia sẻ ảnh R8.11): với từng sản phẩm, **đơn giá (đơn giá nhập) × số tham khảo (số cơ sở・tổng 50) = giá trị nhập**, **đơn giá trung bình/cái = tổng giá trị nhập ÷ 50** (R8.11 là 8,858 ÷ 50 = **¥177.16**). Ghi chú "**giữ ở mức 170 yên**". Có 3 cột số cơ sở (số tham khảo・cột đặt sản phẩm hạn dùng ngắn về 0・thêm 1 cột nữa). Menu 200 yên (◆) có số tham khảo 0. **Từ nay sẽ làm bằng hệ thống**. → Đặc tả: trong việc phân bổ số tiêu chuẩn của vận hành, tính **đơn giá nhập trung bình có trọng số theo số cơ sở**, và **tô đỏ nếu vượt ngoài phạm vi mục tiêu (ví dụ: 170〜179 yên)**. Phạm vi mục tiêu giữ ở menu (hoặc thiết lập của vận hành)【ai quyết định phạm vi và ở đâu thì cần xác nhận】 |
| Q6 Hạn dùng ngắn | Có thể có cơ sở không lấy hạn dùng ngắn → **giữ "lấy / không lấy hạn dùng ngắn" trong thiết lập cơ sở** (có trong RD-AP-148・Order-Spec. Demo không có). Cũng giữ "số đơn hàng cơ sở không có hạn dùng ngắn" của vận hành (tự động đặt sản phẩm hạn dùng ngắn về 0, sửa tay được. RD-MN-041・042). Mặc định là "lấy" |
| AI mode | **Thay bằng "Áp dụng từ lần sau"**. Cơ sở không tích・chưa đăng ký sẽ chốt theo số tiêu chuẩn của vận hành (đã áp dụng thiết lập cơ sở) |

### Dùng thử
| Vấn đề | Quyết định |
|---|---|
| T2 Tự động tạo khi dùng thử | Dùng thử không có máy bán hàng tự động. **Không dùng số tiêu chuẩn của vận hành mà để họ ăn thử từng chút tất cả sản phẩm** (28-101 "phân bổ cho tất cả sản phẩm" giữ nguyên). Giữ nhóm nhiệt độ・chênh lệch giữa các chuyến ±1 |
| T3 Từ tháng thứ 2 trở đi | **Hệ thống tự động tạo, doanh nghiệp chỉ tham khảo** |
| T3 Bổ sung | **Web doanh nghiệp không thấy được việc gia hạn dùng thử** → hiển thị thời gian dùng thử (tháng chu kỳ bắt đầu・kết thúc) và gia hạn trên Web doanh nghiệp (thêm khi phản ánh STEP2・5) |
| T4 Course | **Chỉ ES Lite (tủ lạnh)**. Không chọn được máy bán hàng tự động・Standard |
| T5 Màn hình tinh chỉnh của vận hành | **Cần** (thêm dòng "Dùng thử (tự động)" vào quản lý đơn hàng sản phẩm. Sửa được đến ngày chốt đặt hàng) |
| T1 Bắt đầu dùng thử (**ghi đè 28-103・28-104**) | **Ngày chốt đặt hàng là B7・D7** (ngày thứ 7 của tuần B・tuần D. Trước đây ghi B5・D5 với tiền đề ngày thứ 6・7 rơi vào thứ bảy・chủ nhật, nhưng theo quy tắc là B7・D7). **Kịp B7 thì từ chu kỳ tiếp theo** (cả nửa đầu・nửa sau. Cùng cách nghĩ với hạn chốt đơn hàng). **Kịp D7 thì từ nửa sau (tuần C) của chu kỳ tiếp theo** (vì việc đặt hàng nửa đầu đã xong). Nếu quá hạn thì xử lý theo ngày chốt đặt hàng kế tiếp. Hạn tinh chỉnh của vận hành (28-105) cũng là B7・D7 |
| T1' Số lượng khi bắt đầu từ nửa sau | Dùng thử là gói 50 (ES Lite (tủ lạnh)) với **số lần giao hàng tiêu chuẩn là 1 lần**, nên dù bắt đầu từ nửa sau **chỉ cần giao 1 lần (50 phần) đó bằng chuyến nửa sau là được**. Chỉ chu kỳ đầu tiên đặt chuyến 1 lần vào ô nửa sau (tuần C) (khi ô của hợp đồng ở nửa đầu [tuần A, v.v.])【cách đặt cần xác nhận】 |
| T1' Bổ sung (quyết định) | Việc có cho phép thêm số lần giao hàng khi dùng thử hay không **do vận hành quyết định**. Hệ thống giữ quy tắc đề phòng: **dùng thử có số lần giao hàng từ 2 lần trở lên mà kịp D7 thì bắt đầu từ tuần A của chu kỳ sau nữa** (vì chỉ nửa sau thì không đủ số lần) |
| T1'' Cách đếm thời gian dùng thử (quyết định) | **Chu kỳ bắt đầu từ nửa sau cũng được giao hàng nên được tính là tháng thứ 1 của thời gian dùng thử** |
| T1'''' Ô của chuyến đầu tiên (quyết định A) | Khi chuyến 1 lần của gói 50 là hợp đồng ở ô nửa đầu (ví dụ A2) và dùng thử bắt đầu từ nửa sau: **vận hành chọn ô nửa sau (ví dụ C2) ở bước xác nhận nội dung đăng ký** (nếu kịp D7 thì chỉ chọn được ô nửa sau). **Từ chu kỳ tiếp theo quay về ô của hợp đồng (A2)**. Giống luồng quyết định ngày giao bộ khởi tạo vật tư ở bước xác nhận nội dung đăng ký (28-107) |

### Kiểm tra tồn kho
| Vấn đề | Quyết định |
|---|---|
| Khai báo lại | Vì tồn kho thay đổi hàng ngày nên **có thể kiểm kê lại và khai báo nhiều lần đến ngày 20 (ngày chốt)** (lần khai báo cuối cùng có hiệu lực). Từ ngày 21 vận hành làm thủ công (chốt ở §2-6) |
| Nhập trước ngày chốt | **Được** |
| Điện thoại・QR (yêu cầu dòng 167) | **Làm kiểm tra tồn kho trên Web doanh nghiệp responsive cho mobile** |
| Nhắc nhở khi tạm dừng (X12) | **Không gửi** |

### Các giá trị chưa quyết định → giá trị đặt tạm cho đặc tả・demo (Long: "Hãy thêm dữ liệu demo". Phản ánh vào demo khi phản ánh STEP5)
| Mục | Giá trị đặt tạm | Cách nghĩ |
|---|---|---|
| Giới hạn trên mỗi sản phẩm (master gói) | Cơ bản **gói 50 là 5 phần**, tỷ lệ thuận theo tỷ lệ cơ bản × bội số: gói 30 là 3 phần・gói 100 là 10 phần・gói 150 là 15 phần・gói 200 là 20 phần. Đông lạnh đếm gộp theo cùng nhóm | Từ ví dụ "5 phần/sản phẩm" của Order-Spec và số tham khảo trong phiếu yêu cầu (tối đa 3/50) |
| Giao thêm vật tư OP000036 | **¥2,000/lần** (chưa thuế) | Đặt tạm tương đương cước chuyến vật tư (Yamato). Số tiền chính thức xác nhận với khách hàng |
| Số lần giao hàng tiêu chuẩn của đông lạnh | **Cùng số lần với lạnh** (gói 100 đông lạnh 2 lần・10 phần mỗi lần) | Giống giá trị đặt tạm của demo 28-157・STEP5 Q6 = A |
| Mục tiêu đơn giá trung bình | **170〜179 yên** (đơn giá nhập・có trọng số theo số cơ sở) | Ghi chú "giữ ở mức 170 yên" của phiếu yêu cầu |

## 2-6. Phụ lục: Trả lời các vấn đề còn lại (tối 2026/10/01 Long)

| Vấn đề | Quyết định |
|---|---|
| Phạm vi mục tiêu đơn giá trung bình | **Giữ 1 cái trong thiết lập của vận hành**. Dù sau này thay đổi, **cũng không phản ánh vào menu đã tạo (đã cập nhật) trước khi thay đổi** (menu giữ bản sao giá trị tại thời điểm tạo) |
| Sau khi đóng kiểm tra tồn kho | **Khách hàng (Web doanh nghiệp) nhập đến ngày 20**. Từ ngày 21 **vận hành có thể thêm・sửa thủ công** (nhập hộ). Hủy "từ 21〜25 chỉ cơ sở chưa khai báo mới khai báo" ở §2-5. 【Cần xác nhận: việc xác định chưa khai báo (giữ thanh toán・phí xử lý hành chính) là tại thời điểm ngày 20, hay hạn thêm của vận hành (ngày 25)】 |
| 1 cơ sở có nhiều máy bán hàng tự động | **1 hợp đồng = 1 máy bán hàng tự động** (nếu 2 máy thì tách thành 2 cơ sở・hợp đồng. Giống Order-Spec "1 máy = 1 hợp đồng"). Không làm cơ chế tách đơn hàng theo từng máy |
| Sản phẩm không vừa máy bán hàng tự động | **Tùy doanh nghiệp** (hiển thị trên màn hình đặt hàng, doanh nghiệp quyết định có đặt hay không. Cách nhận hàng là trách nhiệm của doanh nghiệp. Có chú ý trên màn hình) |
| Lọc sản phẩm theo kho picking | **Lọc**: chỉ hiển thị sản phẩm do kho picking của hợp đồng xử lý trong màn hình đặt hàng・số tiêu chuẩn・ứng viên AI |
| Văn phòng Yokohama | **Là ES Standard 100, tạo dữ liệu demo đầy đủ đến thanh toán・cho thuê・hợp đồng con** (khi phản ánh STEP5) |
| Thông báo QA | Khi tự động sửa đơn hàng, thông báo cho doanh nghiệp **do vận hành tùy chọn gửi** (không gửi tự động). Ghi đè "thông báo cho doanh nghiệp" ở §2-3 QA bằng nội dung này |

### Cơ sở không kiểm tra tồn kho (trả lời tối 2026/10/01)
- **Không giữ thanh toán** (phát sinh phí xử lý hành chính, không thể không thanh toán). Vẫn thanh toán bình thường cho cơ sở không kiểm tra và gắn **phạt không kiểm tra (¥3,000・chốt 2026/08/25)**.
- Việc xác định được diễn giải là **chưa khai báo tại thời điểm ngày 20 (đóng của khách hàng)**【cần xác nhận】. Số vận hành nhập tay từ ngày 21 dùng cho quyết toán thực tế (hao hụt quản lý), phạt giữ nguyên.
- Đặc tả màn hình quản lý cơ sở Web doanh nghiệp 2-5 "Khi quá hạn: thanh toán bị giữ và tính phí xử lý hành chính" sẽ được sửa thành "không giữ thanh toán・phạt không kiểm tra" khi phản ánh.

### Giới hạn trên mỗi sản phẩm (xem lại §2-4 Q4・giá trị đặt tạm §2-5)
- Nguồn gốc **chỉ là ví dụ "5 phần/sản phẩm" ở Order-Spec (2026/07/31) §5**. Mặt khác, trong cuộc họp 2026/01/27 đã chốt **"không cần số lượng đặt tối đa"** (chủ đề tổng hợp định nghĩa yêu cầu・hệ RD-MN). Không phải yêu cầu của khách hàng.
- → **Quyết định (Long tối 2026/10/01): B "không cần số lượng đặt tối đa" (như quyết định 1/27)**. **Không giữ** giới hạn trên mỗi sản phẩm (cũng không tạo trong master gói). **Hủy** §2-4 Q4 (giữ trong master gói) và giá trị đặt tạm của §2-5 (gói 50 là 5 phần). Cũng loại khỏi ràng buộc của phân bổ・AI. **Thông báo cho nhóm AI loại khỏi Order-Spec (§5 "Max mỗi sản phẩm"・§8.6)**.

### Đề xuất → trả lời (tối 2026/10/01): phiếu giao hàng = **A**, bảng yêu cầu dòng 130・172・185 = **theo đề xuất (đều A)**
- **Vị trí đặt phiếu giao hàng**: A Đơn hàng hằng tháng > nút "Phiếu giao hàng" ở dòng lịch sử đặt hàng (cơ sở × tháng đối tượng) (khuyến nghị: vì "theo tháng・theo cơ sở" của quyết định và đơn vị của danh sách giống nhau) / B Tab "Phiếu giao hàng" trong chi tiết cơ sở của quản lý cơ sở / C Chi tiết giao hàng của trang chủ (theo từng chuyến)
- **Bảng yêu cầu dòng 130** (trong xác nhận đơn hàng của vận hành, không biết doanh nghiệp nhập hay ES sửa): A Hiển thị 2 cột "Đăng ký của doanh nghiệp (ngày giờ・người phụ trách)" và "Thay đổi của ES (ngày giờ・người phụ trách)" trong danh sách・chi tiết quản lý đơn hàng sản phẩm (khuyến nghị. Lịch sử thay đổi đã có) / B Giữ nguyên 1 trạng thái hiện tại + cập nhật lần cuối
- **Bảng yêu cầu dòng 172** (đông lạnh ít thay đổi theo tháng nên muốn tách bảng menu thành lạnh và đông lạnh): A Menu hàng tháng có 2 ô "PDF menu (lạnh・nhiệt độ thường)" và "PDF menu (đông lạnh)". Menu có sản phẩm đông lạnh thì không công khai được nếu chưa đủ cả 2. Web doanh nghiệp hiển thị 2 cái cho cơ sở Standard, 1 cái cho cơ sở Lite (khuyến nghị) / B PDF vẫn là 1 cái
- **Bảng yêu cầu dòng 185** (trên màn hình đặt hàng muốn thể hiện lạnh・nhiệt độ thường・đông lạnh bằng hình thay vì thẻ chữ): A Biểu tượng + chữ ngắn (phân biệt cả màu: đông lạnh・lạnh・nhiệt độ thường). Giữ chữ để cho người khó phân biệt chỉ bằng màu hoặc biểu tượng (khuyến nghị) / B Chỉ biểu tượng / C Giữ thẻ chữ hiện tại

### Cách xử lý các giá trị đặt tạm (§2-5)
- Giới hạn trên mỗi sản phẩm・số tiền giao thêm vật tư・số lần giao hàng đông lạnh・mục tiêu đơn giá trung bình không có con số trong quyết định lẫn tài liệu, nên Claude đã đặt giá trị tạm để demo chạy được. **Sẽ xác nhận với khách hàng các giá trị tạm này dưới dạng "giá trị đề xuất"** (căn cứ ở bảng §2-5). Cho đến khi xác nhận được, cả demo và đặc tả đều ghi rõ là đặt tạm.

## 2-7. Phụ lục: Số tiêu chuẩn của vận hành cho máy bán hàng tự động (Long trả lời tối 2026/10/01・phản ánh ở v1.59b)

| Vấn đề | Quyết định |
|---|---|
| Cách giữ | Tạo **theo từng ô (đôi・đơn・băng chuyền)** giống màn hình đặt hàng của Web doanh nghiệp |
| Số mặt hàng mỗi ô | **Tự động lấy giá trị ban đầu từ số cột của master dòng máy, vận hành sửa được theo từng menu** (đến số sản phẩm phù hợp với menu) |
| Số của từng sản phẩm | **Phân bổ số gói theo trọng số (số cơ sở・Lite)** (tối đa 50 phần mỗi lần・chênh lệch giữa các chuyến ±1). **Cảnh báo nếu vượt số lượng chứa của cột** (số lượng chứa chỉ để tham khảo, số gói được ưu tiên = Order-Spec) |
| Mục tiêu đơn giá nhập trung bình | **Chỉ máy bán hàng tự động có mục tiêu riêng** trong thiết lập của vận hành (tạm 140〜159 yên). Course tủ lạnh vẫn là 170〜179 yên |
| Dòng máy | Tạo **theo từng dòng máy**. Hiện máy bán hàng tự động có 2 loại (Fuji Electric・Sanden). Thêm tạm VM000002 (Sanden) vào master dòng máy. Cấu hình cột (số lượng chứa × số cột) là tạm: Fuji Electric = ô đôi 10×5・ô đôi 8×6・ô đơn 10×6・băng chuyền 5×8, Sanden = ô đôi 10×4・ô đơn 8×8・không có băng chuyền |
| Sản phẩm không vừa | Không đưa vào sản phẩm không vừa máy bán hàng tự động (không khớp số lượng chứa của cột dòng máy・yêu cầu dòng 141) và sản phẩm ngoại trừ |

- Xác nhận với khách hàng: cấu hình cột thực tế của từng dòng máy, mục tiêu đơn giá nhập trung bình của máy bán hàng tự động, mã dòng máy・tên của Sanden.

## 3. Ảnh hưởng đến các bước khác

| Nơi bị ảnh hưởng | Loại | Nội dung | Trạng thái |
|---|---|---|---|
| STEP2 | Chính | Bổ sung Văn phòng Yokohama làm cơ sở của Công ty cổ phần Sample (ES Standard 100・chuyến COOL). Cấu hình đặt hàng của trụ sở chính (ES Lite (máy bán hàng tự động)) | **Đã phản ánh** (v1.59 đơn hàng hằng tháng・v1.60 quản lý cơ sở・thanh toán・kiểm tra tồn kho・danh sách cơ sở của vận hành) |
| STEP3 | Sao chép | Phí riêng từ lần 2 của vật tư = tạo mới OP000036 (số tiền chưa quyết định), bãi bỏ OP000013. Nơi lưu quyết toán thực tế khi tạm dừng (P5) | OP000036 (¥1,000 tạm)・bãi bỏ OP000013 đã phản ánh ở v1.59. Nơi lưu P5 thuộc phía STEP3 |
| STEP1 | Hiển thị | Loại OP000013 khỏi biểu mẫu đăng ký・quản lý đơn đăng ký | **Đã phản ánh** (v1.59) |
| STEP4 | Hiển thị | Tạo chuyến vật tư bất kỳ lúc nào → lịch ở trang chủ・dữ liệu giao hàng. Dữ liệu giao hàng của Văn phòng Yokohama | Lịch ở trang chủ đã phản ánh ở v1.60 (trụ sở chính 10/07・Yokohama 09/22 và việc giao hàng của Yokohama). Chưa phản ánh Yokohama vào dữ liệu giao hàng của vận hành (quản lý giao hàng) |
| STEP6 | Sao chép | Số đơn hàng đông lạnh của Văn phòng Yokohama → số đặt hàng | Chưa xác nhận |
| STEP7 | Hiển thị | Thông báo・email phí riêng của đơn hàng vật tư, có gửi nhắc nhở kiểm tra tồn kho (X12) cho cơ sở đang tạm dừng hay không | X12 "không gửi cho cơ sở đang tạm dừng" đã phản ánh vào danh sách email (v1.60). Thông báo phí riêng của vật tư chưa xác nhận |

## 4. Phản ánh vào demo (v1.60・tối 2026/10/01)
- Văn phòng Yokohama (CU00950・ES Standard 100・chuyến COOL・CP0000004): quản lý cơ sở・trang chủ・kiểm tra tồn kho của Web doanh nghiệp, danh sách cơ sở・danh sách hợp đồng cha của vận hành. Trong danh sách cơ sở của vận hành, sửa Trụ sở Nagoya của Mirai Shoji vốn trùng với CU00950 thành CU00701
- Thêm chuyến vật tư vào lịch ở trang chủ (trụ sở chính 10/07 MO-2610-0012・Yokohama 09/22 MO-2609-0026)
- Thêm "Thiết lập cơ sở" (xem・sửa) vào chi tiết đơn hàng sản phẩm của vận hành. Thêm QA vào phạm vi ảnh hưởng của quản lý đơn đăng ký hợp đồng. Quản lý thiết lập > Mục tiêu đơn giá trung bình (menu đã công khai giữ nguyên giá trị tại thời điểm công khai)
- Cơ sở dùng thử: **v1.61 chuyển sang doanh nghiệp khác** (Công ty cổ phần Michinoku Shoji CU00071・Trụ sở Sendai CU00975・CP0000012・chu kỳ tháng 10〜11 = gia hạn 1 tháng. Long: "Hãy tách riêng"). Thêm "Doanh nghiệp dùng thử" vào quyền của Web doanh nghiệp. Thêm "Thời gian dùng thử" vào quản lý cơ sở, đơn hàng hằng tháng chỉ để tham khảo (QC・T3)
- Đặc tả: sửa ngày chốt đặt hàng khi dùng thử trong đặc tả tổng hợp v2.3・DEV §4.8 thành B7・D7 (T1). Thêm "không gửi cho cơ sở đang tạm dừng" vào email X12 trong danh sách email
- v1.61: Sửa B8 Văn phòng Yokohama trong demo thanh toán của vận hành (15) thành ES Standard 100・chuyến COOL・triển khai chính thức giống Web doanh nghiệp (mẫu dùng thử là B9 Shonan Tech・chỉ trong demo thanh toán). Chi tiết cơ sở của vận hành chuyển sang giá trị theo từng cơ sở (Long: "Hãy phản ánh" "Hãy sửa")
- Giữ nguyên: tên sản phẩm của kiểm tra tồn kho, bản dịch tiếng Việt, giá trị trong chi tiết doanh nghiệp・chi tiết hợp đồng con của vận hành (như mẫu)
