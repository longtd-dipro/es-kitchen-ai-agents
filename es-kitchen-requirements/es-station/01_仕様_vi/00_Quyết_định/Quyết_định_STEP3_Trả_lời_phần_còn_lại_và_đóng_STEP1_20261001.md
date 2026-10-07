> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định: Trả lời các câu hỏi còn lại của STEP3 · các câu hỏi để đóng STEP1 (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Câu trả lời cho `質問一覧_STEP1を閉じる・STEP3の残り_20261001.md`, cùng các chỉ thị · xác nhận bổ sung nhận được đồng thời.
> **Quyết định này được ưu tiên khi mâu thuẫn với các quyết định cùng ngày hoặc trước đó** (đặc biệt đính chính ngày phát hành hóa đơn của STEP2 Q4).
> Tham khảo: `00_確認してほしい/お客様資料/【ES STATION】システム内メッセージ管理-Message List.xlsx` (danh sách thông báo · email của giai đoạn 1), `00_確認してほしい/お客様資料/BillOne_API連携_確認事項.docx` (trả lời của Bill One).

## 1. Các quyết định hiện có được đính chính

| Hiện có | Sau đính chính |
|---|---|
| STEP2 Q4 · Trả lời STEP1: chốt ngày 25 → **phát hành vào cuối tháng đó** (chốt 9/25 → phát hành 9/30 → tháng thanh toán 10) | Chốt ngày 25 → **phát hành bằng Bill One vào ngày 1 tháng sau** (chốt 9/25 → **phát hành 10/1** → tháng thanh toán 10 · hạn thanh toán 10/27). Là câu trả lời của S6-2. Hạn thanh toán (28-72: ngày 27 tháng thanh toán / ngày 27 tháng sau) không đổi |
| Phương án hướng dẫn đăng nhập của giai đoạn 2 (liên kết thiết lập mật khẩu · 24 giờ) | **Khớp với email giai đoạn 1 (Message List "Email" No.2)**: ghi ID cơ sở (ID đăng nhập) và mật khẩu ban đầu trong nội dung, ghi "Sau lần đăng nhập đầu tiên, nhất định hãy đổi mật khẩu". Địa chỉ nhận là chính · phụ · người phụ trách thanh toán (28-139) |
| Phương án đặt lại mật khẩu của giai đoạn 2 (liên kết · 24 giờ) | **Khớp với giai đoạn 1**: mã xác thực (hiệu lực 5 phút). Khi đặt lại xong thì gửi "Thông báo đặt lại mật khẩu" cho toàn bộ người phụ trách của cơ sở (Message List No.3 · No.4) |

## 2. Phần còn lại của STEP3

| # | Vấn đề | Quyết định |
|---|---|---|
| S1 | Lắp đặt · thu hồi thiết bị giữa tháng | **A Quyết định theo hạn chốt đặt hàng**: nếu đăng ký đến hạn chốt (ngày 15 tháng trước) thì tính đủ từ tháng chu kỳ đó, nếu sau hạn chốt thì từ tháng chu kỳ kế tiếp. Thu hồi cũng giống vậy (đăng ký đến hạn chốt thì đến tháng chu kỳ đó) |
| S2 | Thay đổi giữa chừng thời gian chờ (lead time) | **A Không giới hạn + cảnh báo trên màn hình** (cảnh báo chồng lấn · thiếu trên màn hình vận hành và yêu cầu xác nhận. RD-BL-045) |
| S3-1 | Tháng khởi tính của trả hàng năm | **A Tháng chu kỳ bắt đầu hợp đồng** |
| S3-2 | Sửa đổi phí giữa kỳ của trả hàng năm | **A Giữ phí hiện tại đến tháng khởi tính kế tiếp** |
| S4-1 | Thanh toán cuối khi hủy hợp đồng | **A 1 hóa đơn cuối vào tháng sau tháng hủy hợp đồng** (quyết toán thực tế cuối cùng + tiền phạt + mua lại tồn kho còn lại) |
| S4-2 | Tồn kho còn lại | **A Thanh toán dưới dạng mua lại bằng tồn kho tính toán × đơn giá bán** |
| S4-3 | Tài khoản | **A Giữ ở trạng thái "Chỉ tham chiếu" đến hạn thanh toán của hóa đơn cuối, sau đó dừng** |
| S5 | Lệch 1 yên thuế tiêu dùng theo từng cơ sở | **A Lấy số thuế của doanh nghiệp làm chuẩn, theo từng cơ sở hiển thị là "Tham khảo" (như hiện tại)** |
| S6-1 | Thời điểm gửi đến Bill One | **A Sau khi chốt ngày 25, vận hành bấm "Phát hành bằng Bill One" để gửi hàng loạt** |
| S6-2 | Ngày phát hành | **Ngày đầu tháng sau** (đính chính ở §1) |
| S6-3 | ID nơi phát hành | **A 1 ID cho mỗi nơi nhận hóa đơn (doanh nghiệp / cơ sở). Nếu chưa đăng ký thì tự động tạo khi phát hành (RD-BL-031)** |
| S6-4 | Khi không gửi được | **A Hiển thị "Lỗi gửi" trên màn hình vận hành, sửa rồi gửi lại** |
| S6-5 | Thay thế | **A Hủy ở Bill One → phát hành lại bằng ID khác. Ở ES giữ ID cũ là "Đã hủy"** (Bill One trả lời Q6 · Q7: hủy · PDF không có API, sửa là hóa đơn mới theo điều chỉnh đỏ đen) |
| S6-bổ sung | Kết quả nhập tiền (đối soát) | **Không nhập (như hiện tại. K-07 · RD-BL-024)**. Câu trả lời của Bill One (lấy được bằng clearings API) giữ làm tham khảo |
| S7 | Thanh toán thẻ tín dụng | **B Giữ làm lựa chọn, thanh toán nằm ngoài hệ thống** (ES chỉ giữ phân loại) |
| S8 | Số tiền cơ sở của phí đại lý | **A Chỉ số tiền cố định sau khi trừ giảm giá, chưa tính thuế (trả trước)**. **Hóa đơn của thời gian dùng thử không thuộc đối tượng** |
| S9 | Giá gói 150 · 200 · 300 của máy bán hàng tự động | **C Giữ như hiện tại cho đến khi xác nhận với khách hàng** (¥74,000 / ¥96,000 / ¥139,000) |
| S10 | Kiểm tra tồn kho của trụ sở chính | **A Sửa trụ sở chính thành dạng tài xế khai báo, ví dụ doanh nghiệp kiểm tra thì làm ở cơ sở khác (cơ sở mẫu của chuyến COOL)** |
| S11 | Những mục đã quyết nhưng chưa đưa vào demo | **A Phản ánh gộp** |

## 3. Đóng STEP1

| # | Vấn đề | Quyết định |
|---|---|---|
| T1 | "Hôm nay của demo" trong chi tiết đơn đăng ký của vận hành | **C Cố định hôm nay là 10/05, ngày đăng ký giữ nguyên** |
| T2 | Cách chọn ngày hủy hợp đồng | **A Như hiện tại (có thể chọn từ ngày cuối chu kỳ sau thời điểm sớm nhất)** |
| T3-1 | Nơi nhận thông báo hủy hợp đồng | **A Tự động gửi đến công ty giao hàng (công ty giao hàng ②) đã đăng ký ở tuyến giao hàng (hợp đồng con) của cơ sở đó** |
| T3-2 | Cơ sở chỉ có xe của công ty | **A Không cần thông báo cho công ty ủy thác. Thông báo cho người phụ trách giao hàng nội bộ trên màn hình** |
| T4-1 | Lead time của hàng mẫu | **A Nhờ cho biết giá trị thực tế** (trước đó đặt tạm) |
| T4-2 | Khu vực phụ trách của kho | **A Thêm hạng mục "Khu vực phụ trách" vào Master kho** |
| T4-3 | Số kho | **B Giữ 3 kho** |
| T4-4 | Số lượng | **A Như hiện tại (1 mục = 1 địa chỉ nhận)** |
| T4-5 | Dời ngày giao hàng mẫu | **B Dời giống giao hàng theo hợp đồng** (đính chính "không dời" ở dòng 182 bảng yêu cầu) |
| T5 | Phần còn lại của danh sách phạm vi ảnh hưởng | **Tất cả theo khuyến nghị**: D3 = A (nội dung là S4), D5 = A bắt buộc phê duyệt, D7 = A cập nhật ghi chú đặc tả lên mới nhất, D9 = A, D10 = A, D11 = A (sau RS-09), D12 · E-11 = B tự phê duyệt được (lưu lịch sử), D13 = A, D14 = A, tạo bản chuẩn ở X-2 rồi đưa ra demo ở X-1, E-3 = B không tách, E-4 = A kế thừa từ máy cũ, E-5 = A kết nối, E-7' = A lấy 2 lựa chọn làm chuẩn và đính chính 28-27, E-9 = B doanh nghiệp chỉ tham chiếu, E-10 = A thay đổi course + biến động thiết bị, E-12 = B sang Phase2, E-13 = A khớp với Tài liệu đặc tả tổng hợp |
| T6 | Xác nhận nhỏ | **Tất cả theo khuyến nghị**: U4 = B giữ nguyên (vì T1 = C), U5 = A đổi tên thành "Trạng thái sử dụng", U14 = A bỏ FAX, U16 = A kết nối với ID đơn đăng ký có thật |

## 4. Chỉ thị bổ sung

- **Kiểm tra đầu vào**: nếu số, v.v. được nhập ở dạng toàn-width (全角) thì khi lưu tự động đổi sang half-width (半角) rồi lưu (mã bưu điện · số điện thoại · FAX · địa chỉ email · số lượng · số tiền, v.v.). Bổ sung vào `Đặc_tả_kiểm_tra_nhập_liệu_Form_đăng_ký_20261001.md` và đưa vào demo.
- **Email · thông báo**: khớp với định dạng Quản lý thông báo của giai đoạn 1 (Message List), thêm email và thông báo trên màn hình của giai đoạn 2.
