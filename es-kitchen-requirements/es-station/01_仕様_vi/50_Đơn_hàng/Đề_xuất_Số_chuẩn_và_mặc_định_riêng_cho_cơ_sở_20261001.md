> **Đã đóng băng (bản gốc, 2026-10-05). Từ nay không cập nhật.** Bản chuẩn của đơn hàng là `docs/01_仕様/50_Đơn_hàng/Đơn_hàng.md`, các quyết định hiện đang có hiệu lực là `docs/決定台帳.md` (H・F). Trong đề xuất này, phần "giới hạn trên cho mỗi sản phẩm" đã bị hủy.

# Đề xuất: Số tiêu chuẩn (số cơ sở) và đơn hàng mặc định riêng cho cơ sở (2026/10/01・Bản 2)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Nội dung xem xét bổ sung của STEP5 (Web doanh nghiệp・Quản lý menu).
> Quyết định tiền đề: `Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` §2-4 (số tiêu chuẩn là "phân bổ theo hệ thống" + vận hành chỉ định hàng ngoại lệ・danh mục + có thể đổi thủ công).
> **Bản 2 (2026/10/01)**: Đã thay tài liệu AI tham chiếu bằng `00_確認してほしい/お客様資料/Order-Spec-for-AI-Team_20260731.docx` (đặc tả đơn hàng dành cho đội AI・2026/07/31. Có Q&A) (anh Long: "ES_Kitchen_AI_Document đã cũ"). §3 (khác biệt với tài liệu cũ) và các câu hỏi Q1 đến Q5 của bản 1 đã bị hủy, §3・§6 được viết lại.
> Tham chiếu khác: Tổng hợp định nghĩa yêu cầu, chủ đề 4-15 (RD-AP-136 đến 151), Bảng yêu cầu các dòng 76・81・83・141・171, quyết định 28-178・28-179・28-101, Khác biệt với hợp đồng gói của demo đơn hàng hàng tháng (Q1).
> **Demo chưa thay đổi.** Tài liệu này là đề xuất, sẽ đưa vào đặc tả sau khi nhận được trả lời cho các câu hỏi ở §6.

## 1. Yêu cầu của khách hàng (2026/10/01 anh Long)

1. Số tiêu chuẩn là "phân bổ theo hệ thống". Tuy nhiên có **những sản phẩm không muốn đưa vào số tiêu chuẩn**. Giống như đơn hàng của doanh nghiệp, mong muốn có thể chọn **chỉ định danh mục・sản phẩm ngoại lệ**. **Tốt nhất là vận hành có thể đổi thủ công**
2. Với đề xuất AI cho doanh nghiệp, muốn đề xuất theo **tồn kho・gói・tỷ lệ hủy・danh mục đã thiết lập**
3. **Từ tháng sau, đề xuất giá trị mặc định riêng cho khách hàng thay vì số tiêu chuẩn của vận hành**

## 2. Những điều được ghi trong Order-Spec (2026/07/31) (điểm chính)

| Phân loại | Nội dung |
|---|---|
| Thiết lập của doanh nghiệp (preset) | Bật／tắt danh mục (chỉ "thịt gà"・theo từng danh mục), lấy／không lấy hạn dùng ngắn (**thường mặc định là không lấy**). Dùng thay cho số tiêu chuẩn của vận hành. Giới hạn trên về số lượng là "có (liên quan đến phúc lợi)" [cần xác nhận], giới hạn trên về số tiền là "không (tạm thời)" |
| Ràng buộc bắt buộc phải giữ (cứng) | Tổng ≦ số gói／số lượng mỗi chuyến = số gói ÷ số chuyến (chênh lệch ±1, tổng = số gói)／giới hạn trên theo từng vùng nhiệt độ／**giới hạn trên cho mỗi sản phẩm (ví dụ: 5 cái／sản phẩm. Hàng đông lạnh đếm gộp theo cùng nhóm)**／Course và kho picking (hợp đồng)／độ phù hợp cột của máy bán hàng tự động／danh mục doanh nghiệp đã TẮT／lấy・không lấy hạn dùng ngắn. **Không nới lỏng ràng buộc. Nếu không đủ, hiển thị là thiếu do ràng buộc nào** |
| Giới hạn trên theo vùng nhiệt độ | **✅Đã xác định: giới hạn trên đông lạnh + giới hạn trên lạnh・nhiệt độ thường không cần giống với tổng (giới hạn cung cấp hàng tháng)** (ví dụ: gói Standard, lạnh・nhiệt độ thường giới hạn trên 200・đông lạnh giới hạn trên 200・tổng 200) |
| Số tiêu chuẩn của vận hành (ESS cũ) | Trên màn hình tạo menu có 3 loại: **số đơn hàng cơ sở／số đơn hàng cơ sở không có hạn dùng ngắn／số đơn hàng cơ sở máy bán hàng tự động**. Khi doanh nghiệp không tự đặt hàng thì số tiêu chuẩn của vận hành được điền vào |
| Chế độ của AI | 2 cổng vào: ① "Đề xuất từ quá khứ" (tạo nhanh) ② "Điều chỉnh bằng chat" (sửa sau khi đề xuất). Cả hai đều tạo・sửa cùng một bản nháp. Phân bổ đều do BE thực hiện |
| Xem trước → Áp dụng | Xem trước sau khi tạo (mỗi menu một lần). **Check "Áp dụng từ lần sau trở đi"**. Áp dụng = giống như đã lưu một lần |
| Cách phê duyệt | Doanh nghiệp giữ lại・loại bỏ・sửa số lượng theo từng sản phẩm, rồi lưu toàn bộ đơn hàng (không phải phê duyệt hàng loạt cả bảng) |
| Đầu vào của đề xuất | Tối thiểu: thuộc tính sản phẩm (danh mục・course・tag・hạn dùng ngắn・giá・cột máy bán hàng tự động・kho picking) và thiết lập・hợp đồng của cơ sở. Thêm vào: lịch sử đơn hàng đã xác định, sản phẩm đã bị sửa・xóa, đánh giá (nếu tin cậy được), tiếp tục (＊), lịch sử đã xuất hiện trong menu. **Không có tồn kho・hủy・thực tích bán hàng** |
| Sản phẩm tương tự | Hiện tại đối chiếu bằng danh mục・tag・course・vùng nhiệt độ・khoảng giá. Trả về lý do đề xuất |
| Máy bán hàng tự động | Chỉ giữ độ phù hợp của loại cột (đơn・đôi・băng chuyền). Không gán・tối ưu vị trí. Số lượng chứa chỉ để tham khảo, số gói được ưu tiên. Nếu 1 cơ sở có nhiều máy thì chia theo từng máy |
| Chat | Chỉ trong các sản phẩm của menu・chỉ số lượng và phân bổ chuyến. Hỗ trợ chất gây dị ứng (loại bỏ／giảm), phân loại cách nấu, biến thể ký hiệu |

## 3. Điểm khác biệt với đặc tả・demo hiện tại

| # | Nội dung | Đặc tả・demo hiện tại | Order-Spec | Ảnh hưởng |
|---|---|---|---|---|
| D1 | Tổng giới hạn trên theo vùng nhiệt độ | 28-178① "Giới hạn trên đông lạnh + giới hạn trên lạnh・nhiệt độ thường = tổng giới hạn cung cấp hàng tháng" (kiểm tra khi lưu) | Không cần giống nhau (✅đã xác định) | **Cần sửa 28-178①**. Q1 của đơn hàng hàng tháng (phân bổ đông lạnh và lạnh tự do trong phạm vi giới hạn trên・dưới・2026/09/30) cũng có thể thực hiện bằng cách này |
| D2 | Giới hạn trên cho mỗi sản phẩm | Đặc tả・demo đều không có (chỉ có mức tham khảo số lượng chứa của máy bán hàng tự động) | Ràng buộc cứng (ví dụ 5 cái／sản phẩm, đông lạnh gộp chung) | Chưa quyết định giữ giá trị ở đâu |
| D3 | Cột số tiêu chuẩn của vận hành | Demo mới: 2 cột ES Standard／ES Lite (theo course. RD-AP-147 là OPEN) | ESS cũ: 3 loại gồm số đơn hàng cơ sở／không hạn dùng ngắn／máy bán hàng tự động | Quyết định hình thức mới (§4①) |
| D4 | Mặc định của hạn dùng ngắn | RD-AP-148: nếu chưa thiết lập thì là "có hạn dùng ngắn" | Mặc định thường là "không lấy" | Chọn cái nào làm mặc định |
| D5 | Giá trị mặc định riêng cho khách hàng (yêu cầu 3) | RD-AP-149 (tự động áp dụng từ tháng sau trở đi) là OPEN. Màn hình AI của demo không có "Áp dụng từ lần sau trở đi" | Check "Áp dụng từ lần sau trở đi" | **Yêu cầu 3 có thể thực hiện bằng check của Order-Spec** |
| D6 | Đầu vào của AI | RD-AP-141: thực tích đơn hàng・**tỷ lệ hủy・tồn kho** (2026/09/30) | Không có tồn kho・hủy・thực tích bán hàng | Để đáp ứng yêu cầu 2 cần nhờ đội AI bổ sung |
| D7 | Cách chia chuyến | Demo mới: đếm chuyến theo từng vùng nhiệt độ (lạnh 2 lần 40／40, đông lạnh 2 lần 10／10. Thiết lập tuyến giao hàng của hợp đồng theo từng vùng nhiệt độ・28-154) | Mỗi lần = số gói ÷ số chuyến (cách viết không chia theo vùng nhiệt độ) | Cần thống nhất với đội AI sẽ tính theo cách nào |
| D8 | Cổng vào của AI | Demo: 3 cái là "phân bổ đều", "tham chiếu dữ liệu quá khứ", "chỉ thị cho AI bằng chat" (RD-AP-136) | 2 cổng vào (đề xuất từ quá khứ／chat sau khi đề xuất). Phân bổ đều là BE | Thống nhất cổng vào trên màn hình |
| D9 | Lọc sản phẩm theo kho picking | Màn hình đặt hàng của demo không lọc | Chỉ sản phẩm do kho của hợp đồng xử lý | Xác nhận cùng STEP4・6 |

## 4. Cơ chế đề xuất (Bản 2)

### ① Số tiêu chuẩn của vận hành (theo từng menu)
- Vận hành nhập **trọng số** một giá trị cho mỗi sản phẩm (công sức tương đương việc nhập số cơ sở hiện nay). Đồng thời có thể chỉ định **sản phẩm không đưa vào tiêu chuẩn (ngoại lệ)** và **danh mục**.
- Hệ thống **phân bổ** từ trọng số để tạo số lượng theo 3 loại của ESS cũ (thông thường／không hạn dùng ngắn／máy bán hàng tự động) và theo course (Standard・Lite) (không hạn dùng ngắn = phân bổ loại trừ sản phẩm có hạn dùng ngắn, máy bán hàng tự động = chỉ phân bổ theo sản phẩm phù hợp với cột).
- Việc phân bổ giữ các ràng buộc cứng của Order-Spec (tổng・chuyến ±1・giới hạn trên dưới theo vùng nhiệt độ・giới hạn trên của 1 sản phẩm・cột máy bán hàng tự động). Cộng thêm 1 lần lượt từ phần dư lớn nhất (cùng cách nghĩ với 28-101).
- **Vận hành có thể sửa kết quả bằng tay** (ghi đè trên bảng mẫu theo gói × course. Số đã sửa được ưu tiên). Trước khi công khai có xem trước và kiểm tra chữ đỏ.

### ② Thiết lập mặc định của cơ sở (preset của doanh nghiệp)
- Gom "Thiết lập của doanh nghiệp" của Order-Spec và RD-AP-148・145 vào một màn hình: bật／tắt danh mục・lấy／không lấy hạn dùng ngắn・số tiền sản phẩm (100 yên・200 yên)・sản phẩm ngoại lệ (hàng tháng 0)・giới hạn trên của 1 sản phẩm ([cần xác nhận] phúc lợi).
- Giữ theo từng cơ sở và tiếp tục từ tháng sau trở đi. Có thể sửa từ cả đơn hàng hàng tháng của Web doanh nghiệp và từ vận hành.

### ③ Giá trị mặc định riêng cho khách hàng (yêu cầu 3) = "Áp dụng từ lần sau trở đi"
- Doanh nghiệp xác nhận đề xuất của AI trên màn hình xem trước, **tick "Áp dụng từ lần sau trở đi" rồi áp dụng**, thì từ tháng sau, **vào ngày bắt đầu đặt hàng, hệ thống tự động tạo đề xuất AI cùng điều kiện với menu mới và đưa vào bản nháp** (vì menu thay đổi hàng tháng nên kế thừa thiết lập "tạo bằng AI" chứ không phải bản thân con số).
- Cơ sở không tick sẽ là số lượng lấy số tiêu chuẩn của vận hành ở ① áp dụng thiết lập ở ②.
- Đề xuất thay "Chế độ AI (nếu đến hạn chót chưa đăng ký thì xác định bằng số của AI)" hiện tại bằng check này [cần xác nhận Q1].
- Yêu cầu 2 (tồn kho・tỷ lệ hủy) sẽ nhờ đội AI bổ sung làm đầu vào (D6). Vì tổng được quyết định bởi số gói nên tồn kho・tỷ lệ hủy được dùng để "thay đổi cấu thành".

## 5. Những thứ cần lưu lại (để đánh giá AI)

- Đề xuất của AI (có phiên bản. Order-Spec Q&A D "lưu phiên bản để ngăn data leakage"), đơn hàng doanh nghiệp đã lưu, sản phẩm đã sửa・đã xóa
- Thực tích: số lượng bán・số lượng hủy・số còn lại của kiểm kê tồn kho

## 6. Câu hỏi (Bản 2・chờ trả lời)

| # | Vấn đề | Lựa chọn | Khuyến nghị |
|---|---|---|---|
| Q1 | Cách tạo giá trị mặc định riêng cho khách hàng (yêu cầu 3) | **A** Check "Áp dụng từ lần sau trở đi" của Order-Spec: cơ sở mà doanh nghiệp đã check thì từ tháng sau tự động đưa đề xuất AI với menu mới vào bản nháp. Thay Chế độ AI hiện tại bằng cái này ／ **B** Cơ sở có lịch sử thì tự động dùng AI dù doanh nghiệp không chọn ／ **C** Vận hành chuyển đổi theo từng cơ sở | A (theo đúng Order-Spec・doanh nghiệp đồng ý và sử dụng. Cũng có thể đóng RD-AP-149) |
| Q2 | Thêm tồn kho・tỷ lệ hủy・thực tích bán hàng vào đầu vào của AI (yêu cầu 2・RD-AP-141) | **A** Nhờ đội AI bổ sung. Dùng đến dữ liệu đã xác định tại thời điểm đặt hàng (khi đặt hàng cho tháng 11 thì đến kiểm kê tồn kho của kỳ tháng 9) ／ **B** Trước mắt giữ nguyên đầu vào của Order-Spec, tồn kho・hủy để Phase3 | A |
| Q3 | Cách giữ số tiêu chuẩn của vận hành | **A** Một trọng số + chỉ định ngoại lệ・danh mục → hệ thống phân bổ 3 loại (thông thường／không hạn dùng ngắn／máy bán hàng tự động) × course, vận hành có thể sửa bằng tay ／ **B** Vận hành nhập tay 3 cột giống ESS cũ (nếu chia theo course thì số cột tăng thêm) | A |
| Q4 | Giới hạn trên cho mỗi sản phẩm (ràng buộc cứng của Order-Spec. Ví dụ 5 cái) | **A** Đặt theo từng gói trong master gói (gói 100 = 5 cái, v.v.) ／ **B** Vận hành đặt theo từng sản phẩm khi tạo menu ／ **C** Doanh nghiệp quyết định trong thiết lập mặc định của cơ sở (giới hạn số lượng phúc lợi). Cũng có thể cả A＋C | A (＋phúc lợi tách riêng bằng C) |
| Q5 | Tổng giới hạn trên theo vùng nhiệt độ (D1) | **A** Theo Order-Spec (✅đã xác định), sửa 28-178① thành "Tổng giới hạn trên không cần giống tổng giới hạn cung cấp hàng tháng (tổng giới hạn trên ≧ tổng)" ／ **B** Giữ nguyên 28-178① hiện tại | A |
| Q6 | Mặc định của hạn dùng ngắn (D4) | **A** Không lấy (Order-Spec) ／ **B** Lấy (RD-AP-148) | Xác nhận với khách hàng (cơ sở bổ sung mỗi lần bằng chuyến ES giao hàng thì có thể lấy, cơ sở dùng chuyến COOL・1 đến 2 lần mỗi tháng thì không lấy sẽ an toàn hơn) |
| Q7 | Cách chia chuyến (D7) | **A** Đếm chuyến theo từng vùng nhiệt độ (giống thiết lập tuyến giao hàng của hợp đồng. Theo đúng demo mới) → truyền đạt cho đội AI ／ **B** Gộp vùng nhiệt độ và tính "số gói ÷ số chuyến" | A |

→ **Trả lời (2026/10/01)**: Q1 phương thức check (nhận thức là đã phản ánh vào Figma)／Q2 A (đã nhờ đội AI)／Q3 A＋đơn giá trung bình cũng là tư liệu để quyết định／Q4 A master gói／Q5 A sửa 28-178①／Q6 vì là COOL nên có cảm giác sẽ không có "không hạn dùng ngắn" (cách hiểu cần xác nhận)／Q7 A theo từng vùng nhiệt độ. Chi tiết xem `Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` §2-4.

→ **Trả lời bổ sung (2026/10/01 chiều tối)**: Q3 đơn giá trung bình = **đơn giá trung bình／cái = Σ(đơn giá nhập × số tham khảo) ÷ 50** của "Phiếu yêu cầu bảng menu" hiện nay (R8.11 ¥177.16・"giữ ở mức 170 yên") được hệ thống đưa ra, nếu ra ngoài phạm vi mục tiêu thì chữ đỏ. Q6 = giữ lại "lấy／không lấy hạn dùng ngắn" trong thiết lập cơ sở, đồng thời giữ lại "số đơn hàng cơ sở không có hạn dùng ngắn" của vận hành. Chế độ AI thay bằng "Áp dụng từ lần sau trở đi". Giá trị tạm đặt xem quyết định §2-5.

→ **Đính chính (2026/10/01 đêm)**: Giới hạn trên cho mỗi sản phẩm **không giữ** (theo quyết định "không cần số đặt hàng tối đa" 2026/01/27). Q4・D2・"giới hạn trên của 1 sản phẩm" trong §4 bị hủy. Cũng sẽ báo đội AI loại khỏi Order-Spec.

## 7. Ảnh hưởng đến các bước khác

| Nơi bị ảnh hưởng | Loại | Nội dung |
|---|---|---|
| STEP2 | Chuẩn (chiều ngược) | Giữ thiết lập mặc định của cơ sở (②) và "Áp dụng từ lần sau trở đi" ở cơ sở. Thay thế chế độ AI |
| STEP3 | Chuẩn | Master gói: đính chính 28-178① (Q5), giới hạn trên của 1 sản phẩm (Q4). Master sản phẩm: dùng cột máy bán hàng tự động・dòng máy tương thích・hạn dùng ngắn・kho picking làm ràng buộc cho phân bổ |
| STEP4 | Bản sao | Số còn lại của kiểm kê tồn kho・thực tích bán hàng・hủy làm đầu vào của AI (Q2). Lọc sản phẩm theo kho picking (D9) |
| STEP6 | Bản sao | Cách tạo đơn hàng mặc định thay đổi → dự kiến số lượng đặt hàng (đặt hàng tạm) |
