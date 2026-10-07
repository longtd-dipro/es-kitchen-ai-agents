# Danh sách email (đăng ký・yêu cầu・tài khoản) 2026/10/01

> Người yêu cầu: Long (Tran Duc Long) / Soạn thảo: Claude (Cowork). Tài liệu ứng với quyết định 2-2 của STEP1 "Nội dung email được tổng hợp trong tài liệu riêng (danh sách email)".
> Phần 1 thuộc phạm vi STEP1 (đăng ký・yêu cầu thay đổi・tài khoản), ghi điều kiện gửi, người nhận, tiêu đề và bản nháp nội dung. Phần 2 là kiểm kê các email còn lại (nội dung sẽ soạn ở từng bước).
> Nội dung email là **bản nháp**. 【 】 là giá trị được chèn vào. Căn cứ được ghi ở mục "Căn cứ" của từng email. Những điều chưa quyết định được ghi là "Cần xác nhận".
> **Cập nhật 2026/10/01**: Đã chỉnh theo định dạng quản lý tin nhắn của Phase 1 (`【ES STATION】システム内メッセージ管理-Message List.xlsx`). Phần của Phase 2 được đưa vào sheet "メール" No.6〜15 và sheet "運営管理者／法人顧客向けWEB" No.46〜70 (Phase 2) trong `【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`. **Nội dung chuẩn là Excel**. Tài liệu này giải thích điều kiện gửi・người nhận・căn cứ.
> Điểm thay đổi để thống nhất với Phase 1 (anh Long xác nhận): hướng dẫn đăng nhập giữ nguyên No.2 (ID cơ sở・mật khẩu ban đầu・đổi mật khẩu sau lần đăng nhập đầu tiên), việc đặt lại mật khẩu dùng No.3 (mã xác thực・5 phút)・No.4 (thông báo đặt lại).

## 0. Quy định chung cho tất cả email

| Hạng mục | Quy định | Căn cứ |
|---|---|---|
| Người gửi | "[ES Station] Vận hành ES Kitchen" no-reply@es-kitchen.co.jp (giống Phase 1). Dịch vụ gửi email của AWS・chỉ dùng để gửi | Message List (email No.1〜5)・Biên bản họp 7-14 |
| Tiêu đề | Email của hệ thống bắt đầu bằng "[ES Station]" (giống Phase 1). ※ Với gửi hàng loạt thông báo (X13), không tự động gắn cụm từ cố định vào tiêu đề | Message List・Quyết định về email thông báo |
| Mở đầu・chữ ký | Nội dung bắt đầu bằng "Cảm ơn quý khách đã sử dụng ES Station.", cuối email gắn "※ Nếu không có thông tin về email này thì hủy", "※ Chỉ dùng để gửi" và chữ ký của bộ phận hỗ trợ ES Kitchen (giống Phase 1) | Message List |
| Đính kèm | Không đính kèm (hướng dẫn xem trên màn hình sau khi đăng nhập / bằng liên kết) | Như trên. Việc đính kèm PDF của QR đã hủy ngày 2026/02/24 |
| Hóa đơn | ES không gửi. Hóa đơn (PDF) và thông báo được gửi từ Bill One | RD-BL-020・025 |
| Hướng dẫn dùng thử | ES không gửi. Gửi bằng email tự động của HubSpot | Biên bản họp (liên kết HubSpot cho đăng ký dùng thử) |

Nội dung dưới đây chỉ nêu điểm chính. Nội dung chính thức (kèm mở đầu・chữ ký) xem trong Excel.

| Tài liệu này | Excel "メール" No. |
|---|---|
| M1 Xác nhận đã tiếp nhận đơn đăng ký mới | 6 |
| M2 Hướng dẫn đăng nhập | 2 (nội dung)・7 (người nhận và thời điểm gửi ở Phase 2) |
| M3 Chuyển sang triển khai chính thức | 8 |
| M4 Xác nhận đã tiếp nhận đơn đăng ký thay đổi | 9 |
| M5 Phê duyệt | 10 |
| M6 Từ chối | 11 |
| M7 Rút lại đơn | 12 |
| M8 Thay đổi người phụ trách, v.v. (gửi vận hành) | 13 |
| M9 Dừng giao hàng (gửi công ty giao hàng ủy thác) | 14 |
| M10 Đặt lại mật khẩu | 3・4 (Phase 2 cũng giống vậy. Ghi chú ở 15) |
| M12 Thông báo tạm ngừng tài khoản | 16 |
| Thông báo trên màn hình (hủy hợp đồng・Bill One) | WEB No.71〜76 |

---

## Phần 1　Email về đăng ký・yêu cầu・tài khoản (STEP1)

### M1　Đăng ký mới　Xác nhận đã tiếp nhận

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi tiếp nhận đơn đăng ký mới qua Web doanh nghiệp (không cần đăng nhập) hoặc do vận hành nhập hộ (kể cả nhập CSV). **Hiện tại chỉ soạn nội dung, không gửi email thật** (lưu vào lịch sử thông báo. Hong trả lời 2026-10-05). Ở màn hình nhập hộ chưa biết người phụ trách chính nên chỉ gửi cho người đăng ký |
| Người nhận | **Cả người đăng ký và người phụ trách chính** (nếu là cùng một người thì gửi 1 email). Không đặt ô chọn nơi gửi |
| Căn cứ | Quyết định về hạng mục đăng ký (người đăng ký được chọn từ những người phụ trách), Biên bản họp "Email xác nhận tiếp nhận đăng ký gửi cho cả người đăng ký và người phụ trách chính" |

Tiêu đề: Đã tiếp nhận đơn đăng ký của quý khách (Số tiếp nhận 【AP-YYYYMMDD-NNNN】)

```
【Tên doanh nghiệp】
Kính gửi 【Họ tên người nhận】

Cảm ơn quý khách đã đăng ký ES STATION.
Chúng tôi đã tiếp nhận với nội dung dưới đây. Bộ phận vận hành sẽ kiểm tra nội dung và liên hệ trong 2〜3 ngày làm việc.

■ Số tiếp nhận　　　：【AP-YYYYMMDD-NNNN】
■ Ngày đăng ký　　　：【YYYY/MM/DD】
■ Loại hợp đồng　　：【Triển khai chính thức／Chiến dịch dùng thử】
■ Nơi giao hàng　　　：【Tên cơ sở】 và 【n】 cơ sở khác
■ Mong muốn bắt đầu：từ chu kỳ 【tháng M năm YYYY】

■ Đặt lịch buổi họp khởi động (kickoff)：https://booking.receptionist.jp/kickoff-mtg-schedule/60min
　 Xin quý khách đặt lịch buổi họp khởi động (1 giờ) để chuẩn bị bắt đầu sử dụng.

Khi liên hệ, vui lòng cho biết số tiếp nhận.
```

(URL của buổi họp khởi động được bổ sung ngày 2026-10-03: sổ cái "Hướng dẫn họp khởi động khi hoàn tất đăng ký". Dùng thử cũng giống vậy)

### M2　Hướng dẫn đăng nhập (cấp tài khoản)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | **Khi đăng ký tạm** (ô chọn "Cấp tài khoản" của vận hành mặc định là ON). Nếu chuyển sang OFF thì gửi khi đăng ký chính thức |
| Người nhận | **Toàn bộ người phụ trách chính・phụ・thanh toán** của cơ sở + (nếu không nằm trong số người phụ trách) người đăng ký |
| Gửi lại | Vận hành có thể "Gửi lại email hướng dẫn đăng nhập" từ chi tiết đơn đăng ký |
| Nội dung | **Giữ nguyên No.2 của Phase 1** (ID cơ sở = ID đăng nhập・mật khẩu ban đầu・"Tài khoản này là tài khoản dùng chung của cơ sở"・"Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên"). Anh Long xác nhận ngày 2026/10/01 là thống nhất theo Phase 1 (không áp dụng phương án "không dùng mật khẩu tạm" của 7-2-O1) |
| Căn cứ | Trả lời STEP1 (cấp tài khoản khi đăng ký tạm), 28-139 (người nhận), Message List email No.2 |

### M3　Thông báo chuyển từ dùng thử sang triển khai chính thức

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi vận hành đánh số và đăng ký tạm hợp đồng cha của triển khai chính thức bằng "Chuyển đổi từ dùng thử sang triển khai chính thức" (ô chọn "Gửi email thông báo chuyển đổi cho người phụ trách cơ sở". Mặc định ON) |
| Người nhận | Người phụ trách của cơ sở (tài khoản đã được cấp từ thời dùng thử nên không gửi hướng dẫn đăng nhập) |
| Căn cứ | Trả lời STEP1 (việc chuyển đổi được thêm vào nhập hộ của vận hành) |

Tiêu đề: Thông báo chuyển sang triển khai chính thức (【Tên cơ sở】)

```
【Tên doanh nghiệp】【Tên cơ sở】
Kính gửi 【Họ tên người nhận】

Cảm ơn quý khách đã sử dụng chiến dịch dùng thử.
Chúng tôi đang tiến hành thủ tục chuyển sang triển khai chính thức.

■ Bắt đầu triển khai chính thức：từ chu kỳ 【tháng M năm YYYY】 (từ lần giao hàng ngày 【YYYY/MM/DD】)
■ Lần thanh toán đầu tiên　　　：hóa đơn 【tháng M năm YYYY】 (dự kiến phát hành 【YYYY/MM/DD】)
■ Số hợp đồng　　　　　　　　：【CP…】

Thiết bị đã lắp đặt trong thời gian dùng thử có thể tiếp tục sử dụng nguyên trạng. Thời gian sử dụng tối thiểu của thiết bị được tính từ ngày bắt đầu triển khai chính thức.
ID đăng nhập và mật khẩu giống như thời gian dùng thử.
```

### M4　Đơn đăng ký thay đổi　Xác nhận đã tiếp nhận

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi gửi yêu cầu thay đổi (8 loại: thay đổi gói／giao hàng／thiết bị／thông tin cơ sở／thông tin doanh nghiệp, tạm ngưng, tiếp tục, hủy hợp đồng) trên Web doanh nghiệp. Cũng gửi khi vận hành nhận qua điện thoại, v.v. rồi nhập hộ |
| Người nhận | Người gửi yêu cầu (địa chỉ email của tài khoản đang đăng nhập). **Trường hợp nhập hộ** thì gửi cho người phụ trách chính của cơ sở đó 〔Hong trả lời 2026-10-03 (B10-1＝A)〕 |
| Căn cứ | Biểu mẫu đăng ký của Web doanh nghiệp ("Chúng tôi đã gửi email xác nhận tiếp nhận tới địa chỉ email đã đăng ký"), trả lời STEP1 (8 loại) |

Tiêu đề: Đã tiếp nhận đơn đăng ký 【loại yêu cầu】 (Số tiếp nhận 【CH-YYYYMMDD-NNNN】)

```
【Tên doanh nghiệp】【Tên cơ sở】
Kính gửi 【Họ tên người nhận】

Chúng tôi đã tiếp nhận đơn đăng ký dưới đây. Bộ phận vận hành sẽ kiểm tra và liên hệ trong 2〜3 ngày làm việc.
Cho đến khi việc kiểm tra hoàn tất, cơ sở này không thể gửi đơn đăng ký mới.

■ Số tiếp nhận　　　　　　　：【CH-YYYYMMDD-NNNN】
■ Loại đơn đăng ký　　　　　：【Thay đổi gói, v.v.】
■ Tháng chu kỳ muốn bắt đầu：chu kỳ 【tháng M năm YYYY】
■ Nội dung　　　　　　　　　：【Tóm tắt nội dung yêu cầu】

Quý khách có thể kiểm tra tình trạng đơn đăng ký tại mục "Đơn đăng ký/yêu cầu" trên Web doanh nghiệp.
```

### M5　Đơn đăng ký thay đổi　Phê duyệt (phản ánh vào hợp đồng)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi vận hành phê duyệt yêu cầu thay đổi |
| Người nhận | Yêu cầu của cơ sở: thông báo của cơ sở đó (người phụ trách chính của cơ sở・người gửi yêu cầu). **Thay đổi thông tin doanh nghiệp**: gửi 1 email cho doanh nghiệp (theo đơn vị doanh nghiệp・người phụ trách chính của doanh nghiệp) |
| Căn cứ | Màn hình phê duyệt của vận hành ("Khi phê duyệt, email thông báo của cơ sở này sẽ được gửi tới doanh nghiệp", "Thay đổi thông tin doanh nghiệp gửi 1 email theo đơn vị doanh nghiệp") |

Tiêu đề: Đã phê duyệt đơn đăng ký 【loại yêu cầu】 (Số tiếp nhận 【CH-…】)

```
【Tên doanh nghiệp】【Tên cơ sở】
Kính gửi 【Họ tên người nhận】

Chúng tôi đã phê duyệt đơn đăng ký dưới đây và phản ánh vào hợp đồng.

■ Số tiếp nhận　　　　　　：【CH-…】
■ Nội dung　　　　　　　　：【Trước khi thay đổi】→【Sau khi thay đổi】
■ Chu kỳ áp dụng　　　　　：từ chu kỳ 【tháng M năm YYYY】
■ Ảnh hưởng đến thanh toán：【Chuyển thành ¥… mỗi tháng (chưa gồm thuế)／Không thay đổi】

【Trường hợp hủy hợp đồng】Ngày hủy hợp đồng là 【YYYY/MM/DD】 (ngày cuối của chu kỳ). Lần thanh toán cuối cùng là 1 hóa đơn của tháng sau tháng hủy (【tháng M năm YYYY】) (quyết toán thực tế lần cuối・tiền phạt vi phạm・mua lại sản phẩm còn lại). Quý khách có thể đăng nhập ở chế độ chỉ xem cho đến hạn thanh toán của lần thanh toán cuối cùng (【YYYY/MM/DD】), và tài khoản sẽ bị tạm ngừng vào ngày hôm sau.
【Trường hợp tạm ngưng】Thời gian tạm ngưng là các chu kỳ từ 【tháng M năm YYYY】 đến 【tháng M năm YYYY】. Dự kiến tiếp tục vào chu kỳ 【tháng M năm YYYY】. Không tính phí gói trong các tháng tạm ngưng. Quyết toán thực tế trong thời gian tạm ngưng sẽ được thanh toán gộp khi tiếp tục hoặc hủy hợp đồng.
```

### M6　Đơn đăng ký thay đổi　Trường hợp không thể chấp nhận (từ chối)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi vận hành từ chối yêu cầu thay đổi (bắt buộc có lý do) |
| Người nhận | Giống M5 |
| Căn cứ | Danh sách yêu cầu của Web doanh nghiệp (hiển thị "Không thể chấp nhận" và lý do) |

Tiêu đề: Về đơn đăng ký 【loại yêu cầu】 (Số tiếp nhận 【CH-…】)

```
【Tên doanh nghiệp】【Tên cơ sở】
Kính gửi 【Họ tên người nhận】

Rất tiếc, chúng tôi không thể chấp nhận đơn đăng ký dưới đây.

■ Số tiếp nhận：【CH-…】
■ Nội dung　　：【Tóm tắt nội dung yêu cầu】
■ Lý do　　　　：【Lý do từ chối】

Quý khách có thể thay đổi nội dung và đăng ký lại. Nếu có điểm nào chưa rõ, vui lòng liên hệ với chúng tôi.
```

### M7　Rút lại đơn đăng ký

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi doanh nghiệp rút lại yêu cầu |
| Người nhận | **Người rút lại đơn + người phụ trách chính của cơ sở đó** (nếu là cùng một người thì gửi 1 email). Với vận hành thì thông báo trên màn hình 〔Hong trả lời 2026-10-03 (B10-2＝A)〕 |
| Căn cứ | Danh sách yêu cầu của Web doanh nghiệp (ngày giờ rút lại). Gửi email 〔Hong trả lời 2026-10-03 (B10-2＝A)〕 |

Tiêu đề: Đã rút lại đơn đăng ký (Số tiếp nhận 【CH-…】)

### M8　Thay đổi người phụ trách・tên doanh nghiệp, v.v. (thông báo cho vận hành)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi thay đổi trên Web doanh nghiệp các hạng mục được phản ánh ngay mà không cần phê duyệt: tên doanh nghiệp・tên doanh nghiệp (hợp đồng)・furigana・tên doanh nghiệp nhận hóa đơn (STEP2 Q3), thay đổi・thêm・xóa người phụ trách của doanh nghiệp・cơ sở (STEP2 Q10) |
| Người nhận | **Vận hành** (luôn thông báo khi thay đổi người phụ trách chính・người phụ trách thanh toán). Không gửi cho khách hàng |
| Phương thức | Chỉ thông báo trên màn hình của vận hành (không gửi email cho vận hành) 〔Hong trả lời 2026-10-03 (B10-3＝A), bảng yêu cầu dòng 71〕. Phía khách hàng là M13 |
| Căn cứ | Trả lời STEP1 (phân loại phê duyệt: chỉ thông báo), STEP2 Q3・Q10 |

Tiêu đề: Người phụ trách của 【Tên doanh nghiệp】【Tên cơ sở】 đã được thay đổi

```
Trên Web doanh nghiệp đã có thay đổi sau (đã được phản ánh mà không cần phê duyệt).

■ Doanh nghiệp・Cơ sở：【Tên doanh nghiệp】【Tên cơ sở】
■ Nội dung thay đổi　 ：【Người phụ trách chính Tamura Naoko → Ogawa Sho, v.v.】
■ Người thay đổi　　　：【Họ tên (tài khoản)】
■ Ngày giờ thay đổi　 ：【YYYY/MM/DD HH:MM】
```

### M13　Hướng dẫn cho người phụ trách mới (tài liệu hướng dẫn)〔Hong trả lời 2026-10-03 (B10-3＝A), bảng yêu cầu dòng 71〕

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi người phụ trách của doanh nghiệp・cơ sở được **thêm・thay đổi** trên Web doanh nghiệp hoặc màn hình của vận hành (không gửi khi xóa) |
| Người nhận | Địa chỉ email của **người phụ trách mới được thêm・thay đổi** |
| Nội dung | Thông báo đã trở thành người phụ trách và **liên kết tới tài liệu hướng dẫn (video + tài liệu)**. Liên kết nhận từ khách hàng (`議事録/_OPEN一覧.md` 1003-14) |
| Không gửi | Không gửi định kỳ (4 lần/năm) (bảng yêu cầu dòng 71) |

Tiêu đề: [ES Station] Đăng ký người phụ trách và hướng dẫn tài liệu sử dụng

### M9　Thông báo dừng giao hàng do hủy hợp đồng (gửi công ty giao hàng ủy thác)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi vận hành phê duyệt hủy hợp đồng (tự động) |
| Người nhận | Tự động gửi tới **công ty giao hàng (công ty giao hàng ②) được đăng ký trong tuyến giao hàng (hợp đồng con) của cơ sở đó** (công ty giao hàng ủy thác của chuyến ES giao hàng, công ty vận tải của chuyến COOL). **Không gửi cho cơ sở chỉ dùng xe nội bộ**. Thay vào đó hiển thị thông báo trên màn hình cho bộ phận giao hàng nội bộ (WEB No.71・72) (T3-1・T3-2) |
| Căn cứ | REQ-CT-289, quyết định tối 2026/10/01 (tự động thông báo khi phê duyệt và hiển thị mẫu nội dung trên màn hình) |

Tiêu đề: Thông báo dừng giao hàng (【Tên cơ sở】／【ID cơ sở】)

```
Kính gửi người phụ trách 【Tên công ty giao hàng ủy thác】

Xin chân thành cảm ơn sự hợp tác của quý công ty. Đây là bộ phận vận hành ES STATION.
Hợp đồng của cơ sở dưới đây sắp kết thúc nên chúng tôi xin thông báo dừng giao hàng.

■ Tên cơ sở　　　　：【Tên cơ sở】 (【Tên doanh nghiệp】)／【ID cơ sở】／【Số hợp đồng】
■ Ngày giao hàng cuối cùng：【YYYY/MM/DD】
■ Giao hàng sau đó：dừng lại. Toàn bộ lịch giao hàng sau ngày giao hàng cuối cùng đã bị xóa và sẽ không tạo dữ liệu giao hàng.
■ Liên hệ　　　　　：Bộ phận giao hàng, Vận hành ES STATION (điện thoại【…】／email【…】)

Xin trân trọng cảm ơn.
```

### M10　Đặt lại mật khẩu

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi nhập địa chỉ email đã đăng ký tại "Quên mật khẩu" trên màn hình đăng nhập |
| Nội dung | **Dùng nguyên No.3 của Phase 1 (mã xác thực・hiệu lực 5 phút) và No.4 (thông báo đặt lại mật khẩu・gửi toàn bộ người phụ trách của cơ sở)**. Web doanh nghiệp・Web vận hành・công ty giao hàng ủy thác・nhà cung cấp cũng giống vậy |
| Căn cứ | Message List email No.3・No.4, anh Long xác nhận ngày 2026/10/01 |

### M11　Thông báo trước khi bắt đầu・tiếp tục sau tạm ngưng (cần xác nhận)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Biên bản họp có nội dung "Gửi email thông báo vào đúng ngày dừng (và email nhắc nhở của ngày hôm trước)". Chưa rõ đó là tạm ngưng hay hủy hợp đồng, và theo quyết định hiện tại có giữ lại hay không nên **cần xác nhận** |
| Người nhận | Người phụ trách chính của cơ sở (đề xuất) |

### M12　Thông báo tạm ngừng tài khoản (cơ sở đã hủy hợp đồng)

| Hạng mục | Nội dung |
|---|---|
| Thời điểm gửi | Khi tạm ngừng tài khoản của cơ sở đã hủy hợp đồng (tự động). Tạm ngừng vào ngày hôm sau hạn thanh toán của hóa đơn cuối cùng (S4-3) |
| Người nhận | Toàn bộ người phụ trách chính・phụ・thanh toán của cơ sở |
| Căn cứ | Quyết định_STEP3 phần còn lại và trả lời để đóng STEP1 S4-3, quyết định_bổ sung email và thông báo_20261001 (anh Long ngày 2026/10/01: vẫn gửi) |
| Thông báo trước | Nội dung hủy hợp đồng của email phê duyệt (M5) ghi "Chỉ xem cho đến hạn thanh toán・tạm ngừng vào ngày hôm sau". Trong thời gian chỉ xem, hiển thị thông báo ở phần trên của Web doanh nghiệp (WEB No.75) |

Tiêu đề: [ES Station] Thông báo tạm ngừng tài khoản (【Tên cơ sở】)

```
Do hợp đồng đã được hủy, chúng tôi đã tạm ngừng tài khoản của cơ sở dưới đây.

■ Tên cơ sở　　　：【Tên cơ sở】 (【ID cơ sở】)
■ Ngày hủy hợp đồng：【YYYY/MM/DD】
■ Ngày tạm ngừng　：【YYYY/MM/DD】 (ngày hôm sau hạn thanh toán của lần thanh toán cuối cùng)

Chân thành cảm ơn quý khách đã sử dụng dịch vụ đến nay.
Sau khi tạm ngừng, quý khách sẽ không thể đăng nhập. Quý khách có thể xem hóa đơn trên Bill One.
```

### Thông báo trên màn hình (hủy hợp đồng・Bill One. Excel "WEB" No.71〜76)

| No. | Tình huống | Màn hình | Thông báo |
|---|---|---|---|
| 71 | Khi phê duyệt hủy hợp đồng của cơ sở chỉ dùng xe nội bộ | Vận hành: Quản lý đơn đăng ký hợp đồng／Chi tiết yêu cầu (hủy hợp đồng) | Cơ sở này chỉ dùng xe nội bộ nên không có thông báo cho công ty giao hàng ủy thác. Đã hiển thị thông báo cho bộ phận giao hàng nội bộ (ngày giao hàng cuối cùng {YYYY/MM/DD}). |
| 72 | Khi phê duyệt hủy hợp đồng của cơ sở chỉ dùng xe nội bộ (thông báo cho bộ phận giao hàng nội bộ) | Vận hành: Trang chủ／Thông báo (bộ phận giao hàng) | Hợp đồng của {tên cơ sở} ({ID cơ sở}) sẽ kết thúc. Ngày giao hàng cuối cùng là {YYYY/MM/DD}. Sau đó sẽ không tạo dữ liệu giao hàng. |
| 73 | Khi hủy hóa đơn và phát hành lại (xác nhận) | Vận hành: Hóa đơn | Bạn đã hủy hóa đơn {INV-…} trên Bill One chưa? Trên ES, hóa đơn {INV-…} sẽ được chuyển sang "Đã hủy" và lập lại bằng số hóa đơn mới (việc hủy trên Bill One được thực hiện trên màn hình của Bill One). |
| 74 | Khi hủy hóa đơn và phát hành lại | Vận hành: Hóa đơn | Đã chuyển hóa đơn {INV-cũ} sang "Đã hủy" và tạo {INV-mới}. Vui lòng gửi bằng "Phát hành trên Bill One". |
| 75 | Khi đăng nhập bằng tài khoản của cơ sở đã hủy hợp đồng (thời gian chỉ xem) | Web doanh nghiệp: Tất cả màn hình | Hợp đồng đã kết thúc vào {YYYY/MM/DD}. Quý khách có thể sử dụng ở chế độ chỉ xem đến {YYYY/MM/DD} (hạn thanh toán của lần thanh toán cuối cùng). |
| 76 | Khi cố đăng nhập bằng tài khoản đã bị tạm ngừng | Web doanh nghiệp: Đăng nhập | Tài khoản này đã bị tạm ngừng do hủy hợp đồng. Vui lòng liên hệ bộ phận hỗ trợ ES Kitchen để biết thêm chi tiết. |

※ Trong sheet "通知（Push）" của Excel không có mục nào cần thêm ở Phase 2 (thông báo push của ứng dụng chỉ có phần công khai menu của Phase 1. Tính đến 2026/10/01).

---

## Phần 2　Các email khác (kiểm kê・nội dung sẽ soạn ở từng bước)

| No | Email | Thời điểm・người nhận | Trạng thái | Căn cứ | Bước |
|---|---|---|---|---|---|
| X1 | Bắt đầu・hạn chót・nhắc nhở đặt hàng | Hàng tháng. Doanh nghiệp. Nếu ngày gửi rơi vào thứ Bảy, Chủ nhật, ngày lễ hoặc ngày toàn công ty không giao hàng được thì dời lên ngày làm việc trước đó (không xét ngày nghỉ của từng cơ sở) | Đã quyết định | Bảng yêu cầu dòng 62 | STEP5 |
| X2 | Thông báo công khai menu | Khi công khai menu. Doanh nghiệp. Kèm hướng dẫn về ngày giao hàng dự kiến tháng sau và thay đổi lịch giao hàng | Đã quyết định | Biên bản họp | STEP5 |
| X3 | Hoàn tất giao hàng | Khi tài xế đánh dấu hoàn tất giao hàng. Doanh nghiệp. Kèm số lượng giao (thay cho chữ ký) | Đã quyết định | 2026/04/24 | STEP4 |
| X4 | Chờ xuất hàng・Đã xuất hàng | **Không gửi** (hiển thị trạng thái・số vận đơn・liên kết theo dõi trên trang chủ doanh nghiệp). Thông báo xuất tủ lạnh chưa quyết định | Đã quyết định (một phần chưa quyết) | 10-8 | STEP4 |
| X5 | Hàng chưa chỉ định tài xế | 3 ngày trước và 1 ngày trước ngày giao hàng. Công ty giao hàng ủy thác (+ hiển thị "Vận hành cần xác nhận" và Web ủy thác) | Đã quyết định | Bảng yêu cầu dòng 142 | STEP4 |
| X6 | Phân công giao hàng (gửi tài xế) | Khi gán lịch giao hàng. Tài xế (không có trong danh sách thông báo・thông báo trên trang chủ) | Đã quyết định | 2026/06/02 | STEP4 |
| X7 | Cấp tài khoản tài xế | Nút cấp tài khoản. Email cá nhân của tài xế (nếu không có thì email của quản trị viên). Có giữ lại xuất CSV hay không là OPEN | Một phần chưa quyết | 7-2-O2 | STEP4 |
| X8 | Yêu cầu gửi công ty giao hàng ủy thác | Khi có yêu cầu thay đổi của chuyến ES giao hàng. Đồng thời trên màn hình và qua email (không cho tài xế xem nội dung yêu cầu・số tiền) | Đã quyết định (có liên kết tới yêu cầu báo giá hay không là RS-09 chưa quyết) | Biên bản họp | STEP4 |
| X9 | Thông báo đặt hàng chính thức (nhà cung cấp) | Khi đặt hàng chính thức. Trang chủ Web nhà cung cấp + email | Đã quyết định (ngày 2026/10/01 đã chuyển sang `Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md`) | Biên bản họp | STEP6 |
| X10 | Cảnh báo đặt hàng chính thức chưa xử lý (nhà cung cấp) | Kiểm tra mỗi 24 giờ theo ngày làm việc kể từ khi đặt hàng chính thức, nếu chưa xử lý thì lặp lại cho đến khi được xử lý + trang chủ vận hành | Đã quyết định (ngày 2026/10/01 đã chuyển sang `Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md`) | Bảng yêu cầu dòng 14 | STEP6 |
| X11 | Đơn đặt hàng (nhà cung cấp có phương thức đặt hàng = email) | Khi đặt hàng. Nội dung chưa định | Đã quyết định (2026/10/01: không phải PDF đơn đặt hàng mà là nội dung trong email. Đã chuyển sang S1〜S7 của `Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md`) | Bảng yêu cầu dòng 139 | STEP6 |
| X12 | Nhắc nhở kiểm tra tồn kho | Trước ngày chốt. Doanh nghiệp (cơ sở do doanh nghiệp kiểm tra). **Không gửi cho cơ sở đang tạm ngưng** (kiểm tra trong thời gian tạm ngưng là tùy chọn・quyết định STEP5) | Đã quyết định (thời điểm cần xác nhận) | Biên bản họp | STEP5 |
| X13 | Gửi hàng loạt thông báo | Vận hành lọc đối tượng trên màn hình thông báo rồi gửi. Chọn ô "Gửi cả email" để gửi đồng thời | Đã quyết định (tạm thời) | 2026/01/23 | STEP7 |
| X14 | Thông báo cho đại lý (khách được giới thiệu ký hợp đồng・thay đổi gói・hủy hợp đồng) | Xác định bằng HubSpot rồi gửi Slack／email | Đã quyết định (có đưa email yêu cầu lập hóa đơn vào Phase2 hay không chưa quyết) | Bảng yêu cầu dòng 92・117 | STEP7 |
| X15 | Email định kỳ nhắc thay đổi người phụ trách・địa chỉ | **Không gửi** | Đã quyết định | Biên bản họp | — |
| X16 | Thông báo nội dung đăng ký (PDF) | Xem xét ở Phase3 | Hoãn lại | Bảng yêu cầu Phase3 dòng 7 | — |
| X17 | Thông báo hàng thay thế (sản phẩm lỗi) | Khi vận hành lưu thiết lập hàng thay thế (mặc định gửi・vận hành có thể bỏ). Doanh nghiệp đã đặt chuyến giao hàng liên quan (người phụ trách thanh toán・người phụ trách chính). ① Thay thế／② Bồi thường (chuyến sẽ giao)／③ Chỉ loại trừ ("Không nằm trong hàng được giao"), và cũng hiển thị cùng nội dung trong thông báo của Web doanh nghiệp | Đã quyết định (2026/10/01)・nội dung xem X17 bên dưới | Quyết định_Thiết lập hàng thay thế_3 mẫu và luồng sau_20261001 (REQ-ALT-708) | STEP7 |
| X18 | Thông báo đã chốt bằng đơn hàng mặc định | Khi hết hạn đặt hàng mà không có đơn nên chốt theo số lượng đặt cơ bản (batch hàng ngày・1 lần cho mỗi chu kỳ và cơ sở・kể cả dùng thử). Thông báo trên Web doanh nghiệp = tài khoản của cơ sở・doanh nghiệp, email = người phụ trách chính của cơ sở (nội dung order_default_fixed) | Đã quyết định | Sổ cái E 2026-10-05 (#24) | Sổ tiếp nhận No.50 |


### X17 Thông báo hàng thay thế (nội dung)〔Bản nháp 2026/10/01〕

- Thời điểm gửi: khi vận hành lưu thiết lập hàng thay thế (mặc định gửi・vận hành có thể bỏ). Mỗi cơ sở 1 email (không gộp nhiều cơ sở của cùng một doanh nghiệp)
- Người nhận: người phụ trách chính・người phụ trách thanh toán của cơ sở đó (trùng thì gửi 1 email). Cũng hiển thị cùng nội dung trong thông báo của Web doanh nghiệp
- Tiêu đề: [ES Station] Thông báo hàng thay thế ({Tên sản phẩm lỗi}・{Tên cơ sở})

```
{Tên doanh nghiệp}
Kính gửi người phụ trách {Tên cơ sở}

Cảm ơn quý khách đã luôn sử dụng ES Station.
Vào {ngày phát hiện lỗi}, chúng tôi đã phát hiện lỗi ở {tên sản phẩm lỗi} (lý do: {lý do lỗi}).
Chúng tôi xin lỗi vì sự bất tiện này. Việc giao hàng sẽ được xử lý như sau.

■ Các lần giao hàng sắp tới ({chỉ cơ sở có chuyến ① thay thế})
・{Ngày giao hàng}：{Tên sản phẩm lỗi} {số lượng} cái → giao thay bằng {tên sản phẩm thay thế} {số lượng} cái
　(Thanh toán vẫn theo giá của {tên sản phẩm lỗi})

■ Phần đã giao (đã giao hàng) ({chỉ cơ sở có chuyến ② bồi thường})
・Xin quý khách không sử dụng {tên sản phẩm lỗi} {số lượng} cái đã giao vào {ngày giao hàng}
・Thay vào đó, chúng tôi sẽ gửi {tên sản phẩm thay thế} {số lượng} cái trong lần giao hàng ngày {ngày của chuyến giao}　(không tính phí)
・Đối với {tên sản phẩm lỗi} còn lại, {ES giao hàng: nhân viên phụ trách sẽ thu hồi trong lần giao hàng tiếp theo／COOL: phiền quý khách tự hủy bỏ và báo trong kiểm tra tồn kho}
　(Phần đã hủy bỏ sẽ không bị tính phí như chênh lệch tồn kho)

■ Phần loại khỏi lần giao hàng ({chỉ cơ sở có chuyến ③ chỉ loại trừ})
・{Ngày giao hàng}：{Tên sản phẩm lỗi} {số lượng} cái không nằm trong hàng được giao

Quý khách cũng có thể xem nội dung này trong thông báo ở "Trang chủ" của Web doanh nghiệp, chi tiết từng lần giao hàng và phiếu giao hàng.
Nếu có điểm nào chưa rõ, vui lòng liên hệ {nơi liên hệ}.

ES Station
```
- Điều chưa quyết định: cách ghi nơi liên hệ (với ③ chỉ loại trừ đã quyết định là "không tính phí"・2026/10/01)

## Tổng hợp các điểm cần xác nhận

1. Người gửi: có đúng là giống Phase 1 no-reply@es-kitchen.co.jp không (chỉ xác nhận)
2. M4: người nhận email xác nhận tiếp nhận khi nhập hộ
3. M7: có gửi email rút lại đơn hay không
4. M8: có thông báo cho vận hành bằng email khi thay đổi người phụ trách hay không (hay chỉ thông báo trên màn hình)
5. ~~M9: cách xác định công ty giao hàng ủy thác, cơ sở chỉ dùng xe nội bộ~~ → Đã quyết định (T3-1・T3-2)
6. M11: có giữ lại "email vào đúng ngày dừng・ngày hôm trước" hay không
