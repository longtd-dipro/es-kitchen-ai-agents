> **Đã đóng băng (nguyên bản · 2026-10-05). Từ nay không cập nhật.** Các quyết định đang có hiệu lực xem tại `docs/決定台帳.md`. Nơi nội dung của file này được chuyển đến và các quyết định đã bị thay thế xem mục "G" trong sổ cái.

# Quyết định: Trả lời STEP3 (Master và Thanh toán) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Trả lời các câu hỏi Q1〜Q6 của STEP3 (Master dòng máy, gói, tùy chọn, giảm giá và thanh toán) trong đợt xác nhận toàn bộ demo.
> **Tài liệu này chỉ là bản ghi quyết định. Demo, đặc tả, ghi chú bàn giao vẫn chưa được thay đổi** (do phiên khác đang cập nhật. Sẽ phản ánh sau khi công việc đó kết thúc, và bản trước khi phản ánh được giữ lại tại `02_デモ/履歴/`).
> Nếu mâu thuẫn với các quyết định đã có thì ưu tiên tài liệu này (ghi chú bàn giao §2).

## 1. Quyết định

| # | Câu hỏi | Quyết định | Nội dung |
|---|---|---|---|
| Q1 | Master riêng của demo thanh toán (15_運営_請求) | **A** | Căn chỉnh giá trị và ID của gói, dòng máy, tùy chọn, giảm giá trong demo thanh toán theo master chuẩn của Vận hành (Master dòng máy, gói / Master tùy chọn, giảm giá). Màn hình master của demo thanh toán hiển thị "Chỉ để tham khảo, Demo" |
| Q2 | Gói dùng thử ES000001 | **Loại bỏ hoàn toàn** | Xóa cả dòng khỏi master gói (cũng không giữ lại dưới dạng "Đã xóa" theo kiểu xóa logic). Dùng thử chỉ được biểu diễn bằng "gói chính + giảm giá chiến dịch dùng thử DC000013". ES000001 trong demo thanh toán (100 suất, ¥60,500／¥52,800) cũng bị xóa |
| Q3 | Tên và phân loại tính toán của DC000013 | **A** | Bỏ "(miễn phí trong thời gian)" khỏi tên (ví dụ: Giảm giá chiến dịch dùng thử). Thêm "Tham chiếu phí gói" vào phân loại tính toán của master giảm giá, DC000013 tham chiếu "phí gói của gói 50, tủ lạnh, Lite (mức phí tháng tương ứng trong master gói)" |
| Q4 | OP000010 Phí nâng cỡ (một lần ¥5,000) và OP000023 Chênh lệch cỡ (hàng tháng) | **B** | Bãi bỏ OP000010 Phí nâng cỡ. Khoản thanh toán phát sinh do thay đổi cỡ chỉ còn OP000023 Chênh lệch cỡ (hàng tháng, chỉ khi mang dấu +) |
| Q5 | Cách quản lý máy bán hàng tự động | **B** | Máy bán hàng tự động chỉ được quản lý như thiết bị cho thuê tiêu chuẩn của course ES Lite (máy bán hàng tự động). Không dùng tổ hợp "ES Standard + phí hàng tháng của máy bán hàng tự động" |
| Q5' | Cấu hình của trụ sở chính (kết quả của Q5) | **ES Lite (máy bán hàng tự động) 100** | Trụ sở chính = gói 100 ES Lite (máy bán hàng tự động). Phí hàng tháng ¥57,000 = gói ¥52,000 + phí giao hàng theo khu vực ¥4,000 + ES-QR ¥1,000. Chênh lệch nâng cấp lên Standard (−¥3,500), chênh lệch cỡ 84L (+¥1,000), phí hàng tháng của máy bán hàng tự động (tạm ¥8,500) không còn nữa. Phương thức giao hàng cố định là xe ES giao hàng (28-19) |
| Q6 | ID chuẩn của tùy chọn, giảm giá | **A** | Lấy ID trong Master tùy chọn, giảm giá (14_運営_オプション値引きマスタ) làm chuẩn, căn chỉnh các lựa chọn của "Thay đổi tùy chọn, chiết khấu" của hợp đồng con theo đó |

## 2. Ảnh hưởng đến các quyết định đã có (sửa khi phản ánh)

- **Phí hàng tháng của trụ sở chính ¥60,500 (ghi chú bàn giao §4 "Master, số tiền", v1.40) → sửa thành ¥57,000.** Việc căn chỉnh lại số tiền cũ trong lịch sử đã thanh toán (v1.41) cũng được căn lại theo ¥57,000.
- U10 (máy bán hàng tự động ¥15,000 trong master dòng máy và tạm ¥8,500): dòng phí hàng tháng của máy bán hàng tự động của trụ sở chính không còn. Việc có giữ phí hàng tháng trong master dòng máy hay không (nếu là thiết bị cho thuê tiêu chuẩn thì xử lý là miễn phí) sẽ được xác nhận khi phản ánh.
- U15 (dòng chênh lệch cỡ 84L): không còn cần thiết đối với trụ sở chính.
- Danh sách áp dụng của DC000003: trụ sở chính là ES Lite (máy bán hàng tự động) nên không thuộc đối tượng. Osaka, Nagoya (Lite) cũng không thuộc đối tượng. Sửa mẫu của danh sách áp dụng (H4).
- Ví dụ chênh lệch cỡ của "Trụ sở chính Tokyo" trong demo đơn đăng ký (142L ¥2,000) và ví dụ "ES Standard + máy bán hàng tự động" cũng cần xem xét lại.

## 3. Đối tượng khi phản ánh (tương ứng với các góp ý của STEP3)

| Góp ý | Cần sửa | Vị trí chính |
|---|---|---|
| H1, Q6 | ID của các lựa chọn hợp đồng con (OP000006 Phí nâng cỡ → bãi bỏ, OP000010 Phí quản lý thiết bị → OP000012, v.v., thay thế DC000001／002, v.v.) | 10_運営_まとめ (Doanh nghiệp, cơ sở, hợp đồng), thành phần 12 |
| H2, Q1 | PLANS của demo thanh toán (thế hệ điều chỉnh giá, mức trần của Lite, số tiền miễn trách, số tiền doanh nghiệp chịu, tỷ lệ cơ bản × hệ số), MODELS (RF／FZ／VM／BX, bỏ phán định theo ngưỡng), OPTIONS (OP000001 ¥3,000/lần, v.v.), DISCOUNTS (DC000003, DC000013) | 10_運営_まとめ (Thanh toán), thành phần 15 |
| H3 | Ngày phát hành hóa đơn thành "phát hành cuối tháng" (issueDate của demo thanh toán, hóa đơn INV-2026100001 và phần giải thích trên Web doanh nghiệp, "gửi 10/1" trong demo đơn đăng ký). Hạn thanh toán theo 28-72 (ngày 27) | Demo thanh toán, 20_法人_まとめ, demo đơn đăng ký |
| H4 | Danh sách áp dụng DC000003 (trụ sở chính, Osaka, Nagoya), dòng chênh lệch của trụ sở chính trong demo thanh toán | Master tùy chọn, giảm giá, demo thanh toán |
| H5 | Chia phí gói thành 2 dòng (Shinagawa, Yodoyabashi), phần doanh nghiệp chịu trong demo đơn đăng ký (100 yên×100 suất÷1.08 = ¥9,259) | Demo thanh toán, demo đơn đăng ký |
| Q2 | Xóa ES000001 khỏi danh sách master gói, xóa ES000001 trong demo thanh toán | Master dòng máy, gói, demo thanh toán |
| Q3 | Tên, phân loại tính toán của DC000013 (master giảm giá, demo thanh toán, cách ghi trong demo đơn đăng ký) | Master tùy chọn, giảm giá, v.v. |
| Q4 | Bãi bỏ OP000010 (dòng trong master, lựa chọn trong demo đơn đăng ký, ứng viên #6 trong đặc tả) | Master tùy chọn, giảm giá, demo đơn đăng ký, danh sách hạng mục master |
| Q5 | Căn chỉnh dữ liệu của trụ sở chính (course, chi tiết, số tiền ¥57,000) trên toàn bộ màn hình | Toàn bộ demo Vận hành, Web doanh nghiệp |

## 4. Những điều vẫn chưa quyết định (liên quan STEP3)

- K-03 Thời gian sử dụng tối thiểu (số tháng của tủ lạnh, máy bán hàng tự động)
- U13 Thanh toán tháng 7 của Vận hành ¥93,850 và ¥98,250 trên Web doanh nghiệp (số tiền của trụ sở chính thay đổi nên phải tính lại các con số)
- Cập nhật đặc tả (danh sách hạng mục master): Phân loại công khai → Trạng thái công khai, thời gian sử dụng tối thiểu, mô tả về phán định miễn phí, ứng viên cho thuê tủ đông, phí khởi tạo tủ đông (dòng 174 của bảng yêu cầu)
