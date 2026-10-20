> Bản dịch tiếng Việt của `ja/01_仕様/30_申請/メール一覧_申込・申請_20261001.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Danh sách email (đăng ký・đơn yêu cầu・tài khoản) 2026/10/01

> Người yêu cầu: Long (Tran Duc Long)／Người soạn: Claude (Cowork). Tài liệu tương ứng với quyết định 2-2 của STEP1「メール文面は別資料（メール一覧）にまとめる」(nội dung email gom vào tài liệu riêng (danh sách email)).
> Phần 1 là phạm vi STEP1 (đăng ký・đơn yêu cầu thay đổi・tài khoản), ghi điều kiện gửi・người nhận・bản đề xuất tiêu đề và nội dung. Phần 2 là kiểm kê các email còn lại (nội dung soạn ở từng bước).
> Nội dung văn bản là **bản đề xuất**. 【 】 là giá trị được chèn vào. Căn cứ ghi ở mục「根拠」(căn cứ) của từng email. Những gì chưa quyết định ghi là「要確認」(cần xác nhận).
> **Cập nhật 2026/10/01**: đã theo định dạng quản lý thông điệp của giai đoạn 1 (`【ES STATION】システム内メッセージ管理-Message List.xlsx`). Phần giai đoạn 2 đã đưa vào sheet「メール」(Email) No.6〜15 và sheet「運営管理者／法人顧客向けWEB」(Web cho quản trị viên vận hành／khách hàng doanh nghiệp) No.46〜70 (giai đoạn 2) của `【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`. **Nội dung chuẩn là Excel**. Tài liệu này giải thích điều kiện gửi・người nhận・căn cứ.
> Những điểm đã đổi cho khớp giai đoạn 1 (anh Long xác nhận): hướng dẫn đăng nhập giữ nguyên No.2 (ID cơ sở・mật khẩu ban đầu) 〔2026-10-18 Web doanh nghiệp đã bỏ việc đổi mật khẩu sau lần đăng nhập đầu: sổ quyết định AT #36・sổ tiếp nhận #814・#821〕, đặt lại mật khẩu dùng No.3 (mã xác thực・5 phút)・No.4 (thông báo đặt lại).

## 0. Quy định chung cho mọi email

| Mục | Quy định | Căn cứ |
|---|---|---|
| Người gửi | 「【ESステーション】ESキッチン運営」no-reply@es-kitchen.co.jp (giống giai đoạn 1). Dịch vụ gửi email của AWS・chỉ gửi | Message List (email No.1〜5)・biên bản 7-14 |
| Tiêu đề | Email của hệ thống bắt đầu bằng「【ESステーション】」(giống giai đoạn 1). ※Gửi thông báo hàng loạt (X13) thì không tự động gắn cụm cố định vào tiêu đề | Message List・quyết định về email thông báo |
| Câu mở đầu・chữ ký | Nội dung bắt đầu bằng「ESステーションをご利用いただきありがとうございます。」(cảm ơn quý khách đã sử dụng ES Station), cuối thư gắn「※お心当たりがない場合は破棄」(nếu không có liên quan xin hủy)「※送信専用」(thư chỉ gửi) và chữ ký của bộ phận hỗ trợ ES Kitchen (giống giai đoạn 1) | Message List |
| File đính kèm | Không đính kèm (để khách đăng nhập xem trên màn hình／hướng dẫn bằng link) | Như trên. Đính kèm PDF QR đã bị hủy ngày 2026/02/24 |
| Hóa đơn | ES không gửi. Hóa đơn (PDF) và thông báo được gửi từ Bill One | RD-BL-020・025 |
| Hướng dẫn dùng thử | ES không gửi. Gửi bằng email tự động của HubSpot | Biên bản (liên kết HubSpot cho đăng ký dùng thử) |

Nội dung bên dưới chỉ là ý chính. Nội dung chính thức (kèm câu mở đầu・chữ ký) xem ở Excel.

| Tài liệu này | Excel「メール」No. |
|---|---|
| M1 Hoàn tất tiếp nhận đăng ký mới | 6 |
| M2 Hướng dẫn đăng nhập | 2 (nội dung)・7 (người nhận và thời điểm của giai đoạn 2) |
| M3 Chuyển sang triển khai chính thức | 8 |
| M4 Hoàn tất tiếp nhận đăng ký thay đổi | 9 |
| M5 Phê duyệt | 10 |
| M6 Từ chối | 11 |
| M7 Rút lại (Web doanh nghiệp không có nút rút lại. Cần xác nhận) | 12 |
| M8 Thay đổi người phụ trách v.v. (gửi vận hành) | 13 |
| M9 Dừng giao hàng (gửi công ty giao hàng ủy thác) | 14 |
| M10 Đặt lại mật khẩu | 3・4 (giai đoạn 2 cũng vậy. Ghi chú ở 15) |
| M12 Thông báo dừng tài khoản | 16 |
| Thông điệp trên màn hình (hủy hợp đồng・Bill One) | WEB No.71〜76 |

---

## Phần 1　Email đăng ký・đơn yêu cầu・tài khoản (STEP1)

### M1　Hoàn tất tiếp nhận đăng ký mới

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi đã tiếp nhận đăng ký mới từ Web doanh nghiệp (không đăng nhập) hoặc vận hành nhập thay (kể cả nhập CSV). **Hiện tại chỉ soạn nội dung, không gửi email thật** (lưu vào bản ghi thông báo. hong trả lời 2026-10-05). Ở màn hình nhập thay chưa biết người phụ trách chính nên chỉ gửi người đăng ký |
| Người nhận | **Cả người đăng ký và người phụ trách chính** (cùng một người thì 1 thư). Không đặt checkbox chọn nơi gửi |
| Căn cứ | Quyết định về mục đăng ký (người đăng ký chọn từ người phụ trách), biên bản「申込受付メールは申込者とメイン担当者の両方」(email tiếp nhận đăng ký gửi cả người đăng ký và người phụ trách chính) |

Tiêu đề: Chúng tôi đã tiếp nhận đăng ký của quý khách (số tiếp nhận【AP-YYYYMMDD-NNNN】)

```
【tên doanh nghiệp】
Kính gửi 【họ tên người nhận】

Cảm ơn quý khách đã đăng ký ES STATION.
Chúng tôi đã tiếp nhận với nội dung dưới đây. Vận hành sẽ xác nhận nội dung và liên hệ trong 2〜3 ngày làm việc.

■ Số tiếp nhận　：【AP-YYYYMMDD-NNNN】
■ Ngày đăng ký：【YYYY/MM/DD】
■ Loại hợp đồng：【triển khai chính thức／chiến dịch dùng thử】
■ Nơi giao hàng　　：【tên cơ sở】 và 【n】 cơ sở khác
■ Mong muốn bắt đầu　：từ chu kỳ 【tháng M năm YYYY】

■ Đặt lịch buổi họp kick-off: https://booking.receptionist.jp/kickoff-mtg-schedule/60min
　 Xin vui lòng đặt lịch buổi họp kick-off (1 giờ) để chuẩn bị bắt đầu sử dụng.

Khi liên hệ, xin vui lòng cho biết số tiếp nhận.
```

(URL buổi họp kick-off được thêm ngày 2026-10-03: sổ quyết định「申込の完了のキックオフ面談の案内」(hướng dẫn họp kick-off khi hoàn tất đăng ký). Dùng thử cũng vậy)

### M2　Hướng dẫn đăng nhập (cấp tài khoản)

| Mục | Nội dung |
|---|---|
| Khi gửi | **Khi đăng ký tạm** (checkbox「アカウントを発行する」(cấp tài khoản) của vận hành mặc định ON). Nếu tắt OFF thì gửi khi đăng ký chính thức |
| Người nhận | **Toàn bộ người phụ trách chính・phụ・hóa đơn** của cơ sở + người đăng ký (nếu không nằm trong số người phụ trách) |
| Gửi lại | Từ chi tiết đơn yêu cầu của vận hành có thể「ログイン案内メールを再送」(gửi lại email hướng dẫn đăng nhập). **Gửi lại cho tài khoản「未発行」(chưa cấp) thì thực hiện cả việc cấp tài khoản rồi gửi hướng dẫn** (tạo mật khẩu ban đầu mới) (sổ quyết định AL・2026-10-16) |
| Khi thêm cơ sở | Người nhận **chỉ là email của người phụ trách chính của cơ sở mới** (không áp dụng toàn bộ người ở trên・người đăng ký). Khi phê duyệt không tạo email phê duyệt riêng (chỉ M2) (sổ quyết định AL・2026-10-16) |
| Nội dung | **Giữ nguyên No.2 của giai đoạn 1** (ID cơ sở＝ID đăng nhập・mật khẩu ban đầu・「本アカウントは拠点の共通のアカウント」(tài khoản này là tài khoản dùng chung của cơ sở)). Ngày 2026/10/01 anh Long xác nhận cho khớp giai đoạn 1 (không lấy phương án「仮パスワードを使わない」(không dùng mật khẩu tạm) của 7-2-O1). 〔2026-10-18 thay bằng sổ quyết định AT #36・sổ tiếp nhận #814・#821: **luôn gửi mật khẩu ban đầu** (cả tài khoản doanh nghiệp・cơ sở). Không đưa vào các câu「初回ログイン後は必ずパスワードを変更してください」(sau lần đăng nhập đầu nhất định phải đổi mật khẩu)「初回ログインのときにパスワードを決めてください」(hãy đặt mật khẩu khi đăng nhập lần đầu). Muốn đổi mật khẩu thì làm từ chức năng đặt lại ở màn hình đăng nhập (Web doanh nghiệp không có màn hình đổi mật khẩu. Web vận hành giữ như hiện tại)〕 |
| Căn cứ | Trả lời STEP1 (cấp tài khoản khi đăng ký tạm), 28-139 (người nhận), Message List email No.2 |

### M3　Hướng dẫn chuyển từ dùng thử sang triển khai chính thức

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành cấp số・đăng ký tạm hợp đồng cha triển khai chính thức bằng「お試し→本導入の切替」(chuyển dùng thử→triển khai chính thức) (checkbox「切替のご案内メールを拠点担当者へ送る」(gửi email hướng dẫn chuyển đổi cho người phụ trách cơ sở). Mặc định ON) |
| Người nhận | Người phụ trách của cơ sở (tài khoản đã được cấp lúc dùng thử nên không gửi hướng dẫn đăng nhập) |
| Căn cứ | Trả lời STEP1 (chuyển đổi được thêm vào nhập thay của vận hành) |

Tiêu đề: Hướng dẫn chuyển sang triển khai chính thức (【tên cơ sở】)

```
【tên doanh nghiệp】【tên cơ sở】
Kính gửi 【họ tên người nhận】

Cảm ơn quý khách đã sử dụng chiến dịch dùng thử.
Chúng tôi đang tiến hành thủ tục chuyển sang triển khai chính thức.

■ Bắt đầu triển khai chính thức：chu kỳ 【tháng M năm YYYY】 (từ lần giao 【YYYY/MM/DD】)
■ Hóa đơn đầu tiên：hóa đơn 【tháng M năm YYYY】 (dự kiến phát hành 【YYYY/MM/DD】)
■ Số hợp đồng　：【CP…】

Thiết bị đã đặt trong thời gian dùng thử có thể tiếp tục sử dụng. Thời gian sử dụng tối thiểu của thiết bị được tính từ ngày bắt đầu triển khai chính thức.
ID đăng nhập・mật khẩu giống như lúc dùng thử.
```

### M4　Hoàn tất tiếp nhận đăng ký thay đổi

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi gửi đơn yêu cầu thay đổi trên Web doanh nghiệp (8 loại: thay đổi gói／giao hàng／thiết bị／thông tin cơ sở／thông tin doanh nghiệp, tạm dừng, tái khởi động, hủy hợp đồng). Cũng gửi khi vận hành tiếp nhận qua điện thoại v.v. và nhập thay |
| Người nhận | Người đã gửi đơn (địa chỉ email của tài khoản đang đăng nhập). **Khi nhập thay** thì là người phụ trách chính của cơ sở đó 〔hong trả lời 2026-10-03 (B10-1＝A)〕 |
| Căn cứ | Form đăng ký của Web doanh nghiệp (「ご登録のメールアドレスへ、受付完了のメールをお送りしました」(đã gửi email hoàn tất tiếp nhận đến địa chỉ email đã đăng ký)), trả lời STEP1 (8 loại) |

Tiêu đề: Chúng tôi đã tiếp nhận đăng ký 【loại đơn yêu cầu】 (số tiếp nhận【CH-YYYYMMDD-NNNN】)

```
【tên doanh nghiệp】【tên cơ sở】
Kính gửi 【họ tên người nhận】

Chúng tôi đã tiếp nhận đăng ký dưới đây. Vận hành sẽ xác nhận và liên hệ trong 2〜3 ngày làm việc.
Cho đến khi xác nhận xong, cơ sở này không thể gửi đăng ký mới.

■ Số tiếp nhận　　：【CH-YYYYMMDD-NNNN】
■ Loại đăng ký：【thay đổi gói v.v.】
■ Tháng chu kỳ muốn bắt đầu：chu kỳ 【tháng M năm YYYY】
■ Nội dung　　　　：【tóm tắt nội dung đơn yêu cầu】

Tình trạng đăng ký có thể xem tại「申請」(đơn yêu cầu) trên Web doanh nghiệp.
```

### M5　Đăng ký thay đổi　Phê duyệt (phản ánh vào hợp đồng)

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành phê duyệt đơn yêu cầu thay đổi |
| Người nhận | Đơn yêu cầu của cơ sở: thông báo của cơ sở đó (người phụ trách chính của cơ sở・người đã gửi đơn). **Thay đổi thông tin doanh nghiệp**: 1 thư gửi doanh nghiệp (theo đơn vị doanh nghiệp・người phụ trách chính của doanh nghiệp) |
| Căn cứ | Màn hình phê duyệt của vận hành (「承認すると、法人へこの拠点のお知らせメールを送ります」(khi phê duyệt sẽ gửi email thông báo của cơ sở này cho doanh nghiệp)「法人情報の変更は法人単位で1通」(thay đổi thông tin doanh nghiệp thì 1 thư theo đơn vị doanh nghiệp)) |

Tiêu đề: Chúng tôi đã phê duyệt đăng ký 【loại đơn yêu cầu】 (số tiếp nhận【CH-…】)

```
【tên doanh nghiệp】【tên cơ sở】
Kính gửi 【họ tên người nhận】

Chúng tôi đã phê duyệt đăng ký dưới đây và phản ánh vào hợp đồng.

■ Số tiếp nhận：【CH-…】
■ Nội dung　　：【trước thay đổi】→【sau thay đổi】
■ Chu kỳ phản ánh：từ chu kỳ 【tháng M năm YYYY】
■ Ảnh hưởng đến hóa đơn：【đổi thành phí hằng tháng ¥… (chưa thuế)／không thay đổi】

【Khi hủy hợp đồng】Ngày hủy hợp đồng là 【YYYY/MM/DD】 (ngày cuối của chu kỳ). Hóa đơn cuối cùng là 1 hóa đơn của tháng sau tháng hủy (【tháng M năm YYYY】) (quyết toán thực tế cuối cùng・tiền phạt・mua lại hàng còn lại). Đăng nhập chỉ để xem được đến hạn thanh toán của hóa đơn cuối cùng (【YYYY/MM/DD】), và bị dừng vào ngày hôm sau.
【Khi tạm dừng】Tạm dừng từ chu kỳ 【tháng M năm YYYY】 〜 【tháng M năm YYYY】. Dự kiến tái khởi động từ chu kỳ 【tháng M năm YYYY】. Các tháng tạm dừng không tính phí gói. Quyết toán thực tế trong thời gian tạm dừng sẽ được tính gộp khi tái khởi động hoặc hủy hợp đồng.
```

### M6　Đăng ký thay đổi　Khi không thể tiếp nhận (từ chối)

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành từ chối đơn yêu cầu thay đổi (bắt buộc có lý do) |
| Người nhận | Giống M5 |
| Căn cứ | Danh sách đơn yêu cầu của Web doanh nghiệp (hiển thị「お受けできませんでした」(không thể tiếp nhận) và lý do) |

Tiêu đề: Về đăng ký 【loại đơn yêu cầu】 (số tiếp nhận【CH-…】)

```
【tên doanh nghiệp】【tên cơ sở】
Kính gửi 【họ tên người nhận】

Chúng tôi không thể tiếp nhận đăng ký dưới đây.

■ Số tiếp nhận：【CH-…】
■ Nội dung　　：【tóm tắt nội dung đơn yêu cầu】
■ Lý do　　：【lý do từ chối】

Quý khách có thể thay đổi nội dung và đăng ký lại. Nếu có điểm chưa rõ xin vui lòng liên hệ.
```

### M7　Rút lại đăng ký

| Mục | Nội dung |
|---|---|
| Khi gửi | ~~Khi doanh nghiệp rút lại đơn yêu cầu~~ → **Web doanh nghiệp không đặt nút「取り下げ」(rút lại)** (sổ quyết định AL・2026-10-16). Khi cần rút lại thì quản trị viên hệ thống hủy thủ công. **Việc quản trị viên hệ thống hủy có gửi M7 hay không, tên trạng thái・lịch sử của việc hủy thì cần xác nhận** |
| Người nhận | **Người đã rút lại + người phụ trách chính của cơ sở đó** (cùng một người thì 1 thư). Với vận hành thì là thông báo trên màn hình 〔hong trả lời 2026-10-03 (B10-2＝A)〕 |
| Căn cứ | Danh sách đơn yêu cầu của Web doanh nghiệp (ngày giờ rút lại). Có gửi email 〔hong trả lời 2026-10-03 (B10-2＝A)〕 |

Tiêu đề: Đã rút lại đăng ký (số tiếp nhận【CH-…】)

### M8　Thay đổi người phụ trách・tên doanh nghiệp v.v. (thông báo cho vận hành)

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi trên Web doanh nghiệp thay đổi các mục được phản ánh ngay không cần phê duyệt: tên doanh nghiệp・tên doanh nghiệp (hợp đồng)・phiên âm furigana・tên doanh nghiệp nhận hóa đơn (STEP2 Q3), thay đổi・thêm・xóa người phụ trách của doanh nghiệp・cơ sở (STEP2 Q10) |
| Người nhận | **Vận hành** (thay đổi người phụ trách chính・người phụ trách hóa đơn thì nhất định phải thông báo). Không gửi cho khách hàng |
| Phương thức | Chỉ thông báo trên màn hình của vận hành (không gửi email cho vận hành) 〔hong trả lời 2026-10-03 (B10-3＝A), sheet yêu cầu dòng 71〕. Phía khách hàng là M13 |
| Căn cứ | Trả lời STEP1 (phân loại phê duyệt: chỉ thông báo), STEP2 Q3・Q10 |

Tiêu đề: Người phụ trách của 【tên doanh nghiệp】【tên cơ sở】 đã được thay đổi

```
Trên Web doanh nghiệp đã có thay đổi sau (đã phản ánh không cần phê duyệt).

■ Doanh nghiệp・cơ sở：【tên doanh nghiệp】【tên cơ sở】
■ Nội dung thay đổi　：【người phụ trách chính 田村 直子 → 小川 翔 v.v.】
■ Người thay đổi：【họ tên (tài khoản)】
■ Ngày giờ thay đổi　：【YYYY/MM/DD HH:MM】
```

### M13　Hướng dẫn cho người phụ trách mới (manual) 〔hong trả lời 2026-10-03 (B10-3＝A), sheet yêu cầu dòng 71〕

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi người phụ trách của doanh nghiệp・cơ sở được **thêm・thay đổi** trên Web doanh nghiệp hoặc màn hình vận hành (xóa thì không gửi) |
| Người nhận | Địa chỉ email của **người phụ trách mới được thêm・thay đổi** |
| Nội dung | Thông báo đã trở thành người phụ trách, và **link đến manual (video + tài liệu)**. Link nhận từ khách hàng (`議事録/_OPEN一覧.md` 1003-14) |
| Không gửi | Không gửi định kỳ (4 lần/năm) (sheet yêu cầu dòng 71) |

Tiêu đề: 【ESステーション】Hướng dẫn đăng ký người phụ trách và manual sử dụng

### M9　Thông báo dừng giao hàng do hủy hợp đồng (gửi công ty giao hàng ủy thác)

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi vận hành phê duyệt hủy hợp đồng (tự động) |
| Người nhận | Tự động gửi đến **công ty giao nhận (công ty giao hàng ②) đã đăng ký trong tuyến giao hàng (hợp đồng con) của cơ sở đó** (công ty giao hàng ủy thác của chuyến giao ES, công ty vận chuyển của chuyến COOL). **Cơ sở chỉ có chuyến tự giao thì không gửi**. Thay vào đó hiển thị thông báo trên màn hình cho bộ phận giao hàng nội bộ (WEB No.71・72) (T3-1・T3-2) |
| Căn cứ | REQ-CT-289, quyết định tối 2026/10/01 (thông báo tự động khi phê duyệt, hiển thị ví dụ nội dung trên màn hình) |

Tiêu đề: Thông báo dừng giao hàng (【tên cơ sở】／【ID cơ sở】)

```
Kính gửi người phụ trách 【tên công ty giao hàng ủy thác】

Cảm ơn quý công ty đã luôn hợp tác. Đây là vận hành ES STATION.
Do hợp đồng của cơ sở dưới đây kết thúc, chúng tôi xin thông báo dừng giao hàng.

■ Tên cơ sở　　　：【tên cơ sở】 (【tên doanh nghiệp】)／【ID cơ sở】／【số hợp đồng】
■ Ngày giao cuối cùng　：【YYYY/MM/DD】
■ Giao hàng sau đó　：Dừng. Mọi lịch giao sau ngày giao cuối cùng đã được xóa, dữ liệu giao hàng sẽ không được tạo.
■ Liên hệ：Vận hành ES STATION bộ phận giao hàng (điện thoại【…】／email【…】)

Xin trân trọng cảm ơn.
```

### M10　Đặt lại mật khẩu

| Mục | Nội dung |
|---|---|
| Khi gửi | Khi nhập địa chỉ email đã đăng ký ở「パスワードを忘れた方」(quên mật khẩu) trên màn hình đăng nhập |
| Nội dung | **Dùng nguyên No.3 (mã xác thực・hiệu lực 5 phút) và No.4 (thông báo đặt lại mật khẩu・gửi toàn bộ người phụ trách của cơ sở) của giai đoạn 1**. Web doanh nghiệp・Web vận hành・công ty giao hàng ủy thác・nhà cung cấp cũng vậy |
| 「パスワード再設定」(đặt lại mật khẩu) của vận hành | Khi nhấn từ màn hình vận hành thì **tạo mật khẩu ban đầu mới và gửi** (sổ quyết định AL・2026-10-16) |
| Hết hạn | Khi mã xác thực hết hạn thì làm lại từ「パスワードを忘れた方」để nhận mã mới (sổ quyết định AL・2026-10-16) |
| Căn cứ | Message List email No.3・No.4, anh Long xác nhận 2026/10/01 |

### M11　Thông báo trước khi bắt đầu tạm dừng・tái khởi động (cần xác nhận)

| Mục | Nội dung |
|---|---|
| Khi gửi | Biên bản có ghi「停止日当日（および前日リマインダー）に通知メールを送付すること」(gửi email thông báo vào đúng ngày dừng (và nhắc trước 1 ngày)). Chỉ tạm dừng hay hủy hợp đồng, và có giữ theo quyết định hiện tại hay không thì **cần xác nhận** |
| Người nhận | **Người nhận lời nhắc trước 1 ngày của ngày dừng giống M12 (No.16)＝người phụ trách chính・phụ・hóa đơn** (sổ quyết định AL・2026-10-16). Cách xử lý vào đúng ngày dừng・chỉ tạm dừng／hủy hợp đồng thì vẫn **cần xác nhận** |

### M12　Thông báo dừng tài khoản (cơ sở đã hủy hợp đồng)

| Mục | Nội dung |
|---|---|
| Khi dừng・mở lại thủ công | **Vận hành dừng・mở lại thủ công thì cũng không gửi email cho khách hàng** (chỉ màn hình và lịch sử) (sổ quyết định AL・2026-10-16). Việc dừng tài khoản khi hủy hợp đồng do vận hành làm thủ công (giả định cuối tháng hủy: sổ quyết định AL), nên quan hệ với việc gửi tự động ở「送るとき」(khi gửi) bên dưới・「入金期限の翌日」(ngày sau hạn thanh toán) thì **cần xác nhận** |
| Khi gửi | Khi dừng tài khoản của cơ sở đã hủy hợp đồng (tự động). Dừng vào ngày sau hạn thanh toán của hóa đơn cuối cùng (S4-3) |
| Người nhận | Toàn bộ người phụ trách chính・người phụ trách phụ・người phụ trách hóa đơn của cơ sở |
| Căn cứ | 決定_STEP3残りとSTEP1を閉じる回答 S4-3, 決定_メールと通知の追加_20261001 (2026/10/01 anh Long: cứ gửi) |
| Báo trước | Trong nội dung hủy hợp đồng của email phê duyệt (M5) ghi「入金期限まで参照のみ・その翌日に停止」(chỉ xem đến hạn thanh toán・dừng vào ngày hôm sau). Thời gian chỉ xem thì hiển thị thông báo ở phần trên của Web doanh nghiệp (WEB No.75) |

Tiêu đề: 【ESステーション】Thông báo dừng tài khoản (【tên cơ sở】)

```
Do quý khách hủy hợp đồng, chúng tôi đã dừng tài khoản của cơ sở dưới đây.

■ Tên cơ sở：【tên cơ sở】 (【ID cơ sở】)
■ Ngày hủy hợp đồng：【YYYY/MM/DD】
■ Ngày dừng：【YYYY/MM/DD】 (ngày sau hạn thanh toán của hóa đơn cuối cùng)

Xin chân thành cảm ơn quý khách đã sử dụng trong thời gian qua.
Sau khi dừng sẽ không thể đăng nhập. Hóa đơn có thể xem trên Bill One.
```

### Thông điệp trên màn hình (hủy hợp đồng・Bill One. Excel「WEB」No.71〜76)

| No. | Tình huống | Màn hình | Thông điệp |
|---|---|---|---|
| 71 | Khi phê duyệt hủy hợp đồng của cơ sở chỉ có chuyến tự giao | Vận hành: quản lý đơn yêu cầu hợp đồng／chi tiết đơn yêu cầu (hủy hợp đồng) | Cơ sở này chỉ có chuyến tự giao nên không có thông báo cho công ty giao hàng ủy thác. Đã hiển thị thông báo cho bộ phận giao hàng nội bộ (ngày giao cuối cùng {YYYY/MM/DD}). |
| 72 | Khi phê duyệt hủy hợp đồng của cơ sở chỉ có chuyến tự giao (thông báo cho bộ phận giao hàng nội bộ) | Vận hành: trang chủ／thông báo (bộ phận giao hàng) | Hợp đồng của {tên cơ sở} ({ID cơ sở}) sẽ kết thúc. Ngày giao cuối cùng là {YYYY/MM/DD}. Dữ liệu giao hàng sau đó sẽ không được tạo. |
| 73 | Khi hủy và phát hành lại hóa đơn (xác nhận) | Vận hành: hóa đơn | Đã hủy hóa đơn {INV-…} trên Bill One chưa? Trên ES sẽ đặt {INV-…} thành「取消」(đã hủy) và tạo lại bằng số hóa đơn mới (việc hủy trên Bill One thực hiện ở màn hình Bill One). |
| 74 | Khi đã hủy và phát hành lại hóa đơn | Vận hành: hóa đơn | Đã đặt hóa đơn {INV-cũ} thành đã hủy và tạo {INV-mới}. Xin hãy gửi bằng「Bill One で発行」(phát hành trên Bill One). |
| 75 | Khi đăng nhập bằng tài khoản của cơ sở đã hủy hợp đồng (thời gian chỉ xem) | Web doanh nghiệp: toàn bộ màn hình | Hợp đồng đã kết thúc vào {YYYY/MM/DD}. Quý khách có thể sử dụng ở chế độ chỉ xem đến {YYYY/MM/DD} (hạn thanh toán của hóa đơn cuối cùng). |
| 76 | Khi cố đăng nhập bằng tài khoản đã bị dừng | Web doanh nghiệp: đăng nhập | Tài khoản này đã bị dừng do hủy hợp đồng. Mọi thắc mắc xin liên hệ bộ phận hỗ trợ ES Kitchen. |

※ Sheet「通知（Push）」(thông báo (Push)) của Excel không có gì bổ sung ở giai đoạn 2 (thông báo push của ứng dụng chỉ có công bố menu của giai đoạn 1. Tại thời điểm 2026/10/01).

---

## Phần 2　Các email khác (kiểm kê・nội dung soạn ở từng bước)

| No | Email | Khi gửi・người nhận | Trạng thái | Căn cứ | Bước |
|---|---|---|---|---|---|
| X1 | Bắt đầu đặt hàng・hạn chốt・nhắc nhở | Hằng tháng. Doanh nghiệp. Nếu ngày gửi là thứ 7, chủ nhật, ngày lễ・ngày không giao hàng toàn công ty thì đẩy lên ngày làm việc trước đó (không xét ngày nghỉ riêng của từng cơ sở) | Đã quyết định | Sheet yêu cầu dòng 62 | STEP5 |
| X2 | Thông báo công bố menu | Khi công bố menu. Doanh nghiệp. Gồm cả ngày giao dự kiến của tháng sau・hướng dẫn thay đổi lịch giao hàng | Đã quyết định | Biên bản | STEP5 |
| X3 | Hoàn tất giao hàng | Khi tài xế đặt thành hoàn tất giao hàng. Doanh nghiệp. Có số lượng giao (thay cho chữ ký) | Đã quyết định | 2026/04/24 | STEP4 |
| X4 | Chờ xuất hàng・đã xuất hàng | **Không gửi** (hiển thị trạng thái・số vận đơn・link theo dõi trên trang chủ doanh nghiệp). Thông báo gửi tủ lạnh chưa quyết định | Đã quyết định (một phần chưa quyết định) | 10-8 | STEP4 |
| X5 | Kiện hàng chưa gán tài xế | 3 ngày trước và 1 ngày trước ngày giao. Công ty giao hàng ủy thác (+ vận hành cần xác nhận・hiển thị trên Web ủy thác) | Đã quyết định | Sheet yêu cầu dòng 142 | STEP4 |
| X6 | Phân công giao hàng (gửi tài xế) | Khi gán lịch giao hàng. Tài xế (không có danh sách thông báo・thông báo trên trang đầu) | Đã quyết định | 2026/06/02 | STEP4 |
| X7 | Cấp tài khoản tài xế | Nút cấp. Email cá nhân của tài xế (nếu không có thì email của quản trị viên). Có giữ xuất CSV hay không là OPEN | Một phần chưa quyết định | 7-2-O2 | STEP4 |
| X8 | Yêu cầu gửi công ty giao hàng ủy thác | Khi có đơn yêu cầu thay đổi chuyến giao ES. Màn hình + email đồng thời (nội dung yêu cầu・số tiền không cho tài xế xem) | Đã quyết định (có nối sang yêu cầu báo giá hay không thì RS-09 chưa quyết định) | Biên bản | STEP4 |
| X9 | Thông báo đặt hàng chính thức (nhà cung cấp) | Khi đặt hàng chính thức. Trang đầu Web nhà cung cấp + email | Đã quyết định (2026/10/01 đã chuyển sang `メール一覧_発注・仕入先・入荷_20261001.md`) | Biên bản | STEP6 |
| X10 | Cảnh báo chưa xử lý đặt hàng chính thức (nhà cung cấp) | Từ khi đặt hàng chính thức, kiểm tra mỗi 24 giờ theo ngày làm việc, nếu chưa xử lý thì lặp lại đến khi được xử lý + trang đầu vận hành | Đã quyết định (2026/10/01 đã chuyển sang `メール一覧_発注・仕入先・入荷_20261001.md`) | Sheet yêu cầu dòng 14 | STEP6 |
| X11 | Phiếu đặt hàng (nhà cung cấp có phương thức đặt hàng＝email) | Khi đặt hàng. Nội dung chưa định | Đã quyết định (2026/10/01: là nội dung thư chứ không phải PDF phiếu đặt hàng. Đã chuyển sang S1〜S7 của `メール一覧_発注・仕入先・入荷_20261001.md`) | Sheet yêu cầu dòng 139 | STEP6 |
| X12 | Nhắc kiểm tra tồn kho | Trước ngày chốt. Doanh nghiệp (cơ sở do doanh nghiệp kiểm tra). **Không gửi cho cơ sở đang tạm dừng** (kiểm tra trong thời gian tạm dừng là tùy ý・quyết định STEP5) | Đã quyết định (thời điểm cần xác nhận) | Biên bản | STEP5 |
| X13 | Gửi thông báo hàng loạt | Vận hành lọc đối tượng ở màn hình thông báo rồi gửi. Gửi đồng thời bằng checkbox「メールも送信」(gửi cả email) | Đã quyết định (tạm thời) | 2026/01/23 | STEP7 |
| X14 | Thông báo cho đại lý (thành công của bên được giới thiệu・thay đổi gói・hủy hợp đồng) | Xác định bằng HubSpot rồi gửi Slack／email | Đã quyết định (email yêu cầu tạo hóa đơn có đưa vào Phase2 hay không chưa quyết định) | Sheet yêu cầu dòng 92・117 | STEP7 |
| X15 | Email định kỳ nhắc thay đổi người phụ trách・địa chỉ | **Không gửi** | Đã quyết định | Biên bản | — |
| X16 | Thông báo nội dung đăng ký (PDF) | Xem xét ở Phase3 | Hoãn lại | Sheet yêu cầu Phase3 dòng 7 | — |
| X17 | Thông báo hàng thay thế (sản phẩm lỗi) | Khi vận hành lưu cài đặt hàng thay thế (mặc định gửi・vận hành bỏ được). Doanh nghiệp đã đặt chuyến đối tượng (người phụ trách hóa đơn・người phụ trách chính). ① thay thế／② bồi thường (chuyến giao)／③ chỉ loại trừ (「納品分に含まれません」(không gồm trong phần giao)), và cùng nội dung trên thông báo của Web doanh nghiệp | Đã quyết định (2026/10/01)・nội dung ở X17 bên dưới | 決定_代替品設定_3パターンと下流_20261001 (REQ-ALT-708) | STEP7 |
| X18 | Thông báo xác định bằng đơn hàng mặc định | Khi đến hạn chốt đặt hàng mà không có đơn và được xác định bằng số đặt hàng chuẩn (batch hằng ngày・1 lần theo từng chu kỳ và cơ sở・cả dùng thử). Thông báo trên Web doanh nghiệp＝tài khoản cơ sở・doanh nghiệp, email＝người phụ trách chính của cơ sở (nội dung order_default_fixed) | Đã quyết định | Sổ quyết định E 2026-10-05 (#24) | Sổ tiếp nhận No.50 |


### X17 Thông báo hàng thay thế (nội dung) 〔bản đề xuất 2026/10/01〕

- Khi gửi: khi vận hành lưu cài đặt hàng thay thế (mặc định gửi・vận hành bỏ được). Mỗi cơ sở 1 thư (nhiều cơ sở của cùng doanh nghiệp không gộp lại)
- Người nhận: người phụ trách chính・người phụ trách hóa đơn của cơ sở đó (trùng thì 1 thư). Cũng hiển thị cùng nội dung trên thông báo của Web doanh nghiệp
- Tiêu đề: 【ESステーション】Thông báo hàng thay thế ({tên sản phẩm lỗi}・{tên cơ sở})

```
{tên doanh nghiệp}
Kính gửi người phụ trách {tên cơ sở}

Cảm ơn quý khách đã luôn sử dụng ES Station.
Ngày {ngày phát hiện lỗi}, đã phát hiện lỗi ở sản phẩm {tên sản phẩm lỗi} (lý do: {lý do lỗi}).
Chúng tôi thành thật xin lỗi vì sự bất tiện. Việc giao hàng sẽ được thực hiện như sau.

■ Các lần giao sắp tới ({chỉ cơ sở có chuyến ① thay thế})
・{ngày giao}: {tên sản phẩm lỗi} {số} cái → thay bằng {tên sản phẩm thay thế} {số} cái để giao
　(hóa đơn vẫn tính theo giá của {tên sản phẩm lỗi})

■ Phần đã giao ({chỉ cơ sở có chuyến ② bồi thường})
・Xin đừng dùng {số} cái {tên sản phẩm lỗi} đã giao ngày {ngày giao}
・Thay vào đó, chúng tôi sẽ gửi {số} cái {tên sản phẩm thay thế} trong lần giao ngày {ngày của chuyến giao} (không tính phí)
・{tên sản phẩm lỗi} còn lại thì {chuyến giao ES: người phụ trách sẽ thu hồi vào lần giao tiếp theo／chuyến COOL: phiền quý khách hủy bỏ và báo trong kiểm tra tồn kho}
　(phần đã hủy bỏ không tính phí như chênh lệch tồn kho)

■ Phần loại khỏi lần giao ({chỉ cơ sở có chuyến ③ chỉ loại trừ})
・{ngày giao}: {số} cái {tên sản phẩm lỗi} không được gồm trong lần giao

Nội dung cũng có thể xem ở thông báo「ホーム」(trang chủ) của Web doanh nghiệp, chi tiết từng lần giao・phiếu giao hàng.
Nếu có điểm chưa rõ xin liên hệ {nơi liên hệ}.

ESステーション
```
- Điều chưa quyết định: cách ghi nơi liên hệ (③ chỉ loại trừ đã quyết định là「請求しない」(không tính phí)・2026/10/01)

## Tổng hợp cần xác nhận

1. Người gửi: dùng no-reply@es-kitchen.co.jp giống giai đoạn 1 có được không (chỉ xác nhận)
2. M4: người nhận email hoàn tất tiếp nhận khi nhập thay
3. M7: có gửi email rút lại hay không
4. M8: có thông báo thay đổi người phụ trách cho vận hành bằng cả email không (hay chỉ thông báo trên màn hình)
5. ~~M9: cách xác định công ty giao hàng ủy thác, cơ sở chỉ có chuyến tự giao~~ → Đã quyết định (T3-1・T3-2)
6. M11: có giữ「停止日当日・前日のメール」(email vào đúng ngày dừng・trước 1 ngày) hay không
