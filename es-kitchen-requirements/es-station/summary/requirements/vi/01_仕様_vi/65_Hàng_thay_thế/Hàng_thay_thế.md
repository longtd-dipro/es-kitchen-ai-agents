> Bản dịch tiếng Việt của `ja/01_仕様/65_代替品/代替品.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Hàng thay thế (xử lý sản phẩm lỗi)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, đã viết lại mới chỉ gồm "những điều đang có hiệu lực" từ các bản gốc và quyết định dưới đây.
> Các quyết định đang có hiệu lực là `docs/決定台帳.md` (**J**, B "Xử lý hàng thay thế", I "Ghi nhận nhập kho và chênh lệch"). Nếu có điểm không khớp thì sổ quyết định là chuẩn.
> Bản gốc (đóng băng・chỉ để xem quá trình): `docs/議事録_仕様/代替品対応_詳細要件仕様.md` (REQ-ALT), `docs/議事録_仕様/代替品対応_お客様確認シート.md`, `質問一覧_代替品設定と下流への影響_20261001.md`, `00_決定/決定_代替品設定_3パターンと下流_20261001.md`.
> Hàng thay thế đưa ra khi có sự cố giao hàng (khi giao bị thiếu・bị hỏng, v.v.) xem `10_配送/配送仕様/配送_07_トラブル・代替品.md`. Ở đây là chuyện **lỗi của chính sản phẩm** (hư hỏng・lỗi theo lô, v.v.).

## 1. Dùng khi nào

- Phát hiện sản phẩm đã nhập mua bị lỗi (lỗi theo lô, hoặc vấn đề của chính sản phẩm nên áp dụng cho tất cả các lô).
- Khi nhập kho bị thiếu sản phẩm và vận hành chọn "xử lý bằng hàng thay thế" (`55_発注・仕入・入荷/発注・仕入・入荷.md` §8-4).
- Vận hành thiết lập từ 「代替品設定」 (Thiết lập hàng thay thế) của quản lý menu. Không có lưu nháp; sau các bước điều kiện → cách xử lý → xác nhận đối tượng thì bấm 「確定する」 (Xác định) để xác định (đã xác định thì không hủy được. 2026-10-06 hong).

## 2. Chỉ có 3 cách xử lý

Phân chia theo ngày biết có lỗi (ngày phát hiện) và ngày xuất hàng của chuyến. Không thay đổi theo hình thức nhập kho (2 lần mỗi tháng／hàng tươi nhập mỗi ngày).

| Cách xử lý | Chuyến đối tượng | Việc thực hiện | Hóa đơn |
|---|---|---|---|
| **① Thay thế** | Ngày xuất hàng sau ngày phát hiện (thiết lập **muộn nhất là ngày trước ngày xuất hàng**) | Đổi sản phẩm lỗi sang sản phẩm thay thế (**1 sản phẩm đổi 1 sản phẩm**) | Tính theo **đơn giá của sản phẩm gốc** |
| **② Bồi thường** | Ngày xuất hàng là ngày phát hiện hoặc trước đó (đã giao hàng rồi) | Giao sản phẩm thay thế | **Không tính phí** (để lại dòng 0 yên trong quyết toán thực tế) |
| **③ Chỉ loại trừ** | Giống ① | Chỉ loại sản phẩm lỗi ra. Thông báo cho khách hàng "không nằm trong phần giao hàng" | **Không tính phí** |

- 3 cách này do ES quyết định (không xác nhận với khách hàng).
- Không gửi cho khách hàng đã kết thúc hợp đồng (REQ-ALT-603).

## 3. Những điều quyết định khi thiết lập

| # | Hạng mục | Quy định | Căn cứ |
|---|---|---|---|
| 3-1 | Phạm vi đối tượng | Chỉ định bằng **thời gian đối tượng (hàng gửi từ ngày bắt đầu〜ngày kết thúc)** và **lô** (theo lô／tất cả lô). Hàng tươi cũng có thể là tất cả lô | REQ-ALT-606・401・402 |
| 3-2 | Sản phẩm thay thế | **Chỉ gợi ý** sản phẩm cùng nhóm nhiệt độ・có thể cung cấp theo course của cơ sở・cùng kho. Vận hành **cũng chọn được sản phẩm ngoài gợi ý (có cảnh báo)**. Với cơ sở máy bán hàng tự động, sản phẩm không vào được máy bán hàng tự động cũng **chỉ cảnh báo** | Sổ quyết định J・M-2 "Hàng thay thế (quy định bổ sung)" |
| 3-3 | Tồn kho của sản phẩm thay thế | Trước khi lưu, hiển thị xem tồn kho kho (dự kiến) có đủ không. Phần thiếu thì **đặt hàng bổ sung**, nhập kho rồi mới giao | Sổ quyết định J |
| 3-4 | Số lượng bồi thường | "Toàn bộ số lượng đã đặt" hoặc "chỉ phần còn lại (tồn kho lý thuyết)" do **vận hành chọn cho từng lỗi**. Giá trị ban đầu là "toàn bộ số lượng đã đặt" | Sổ quyết định J |
| 3-5 | Chuyến giao bồi thường | **Giá trị ban đầu là chuyến kế tiếp**. Trong danh sách đơn hàng đối tượng, có thể đổi theo từng chuyến thành "chuyến kế tiếp／chuyến sau nữa／giao hàng bổ sung". Nếu không có chuyến kế tiếp hoặc còn xa (hơn 14 ngày theo mức tham khảo) thì giao hàng bổ sung. **Phí giao hàng của giao hàng bổ sung do ES chịu** | Sổ quyết định J |
| 3-6 | Tồn kho lỗi của kho | Chọn "trả lại nhà cung cấp／hủy tại kho". Cả hai đều **dừng xuất hàng** | Sổ quyết định J |
| 3-7 | Thông báo cho khách hàng | **Mặc định là gửi** (vận hành có thể bỏ). Email X17 ＋ thông báo trên Web doanh nghiệp. Chỉ các cơ sở đã đặt sản phẩm tương ứng | Sổ quyết định J |

## 4. Những thứ được sửa theo khi lưu (hạ nguồn)

| Nơi được sửa | Nội dung | Căn cứ |
|---|---|---|
| Dữ liệu đơn hàng・giao hàng | Sửa chi tiết cùng lúc. Để lại **nguồn thay thế (sản phẩm gốc)** trong chi tiết (cùng cách ghi nhận như hàng thay thế của sự cố giao hàng) | REQ-ALT-701 |
| Chỉ thị xuất hàng | Nếu đã gửi thì **nâng phiên bản và gửi lại** cho đến ngày trước ngày xuất hàng. Từ ngày xuất hàng trở đi là ② Bồi thường | REQ-ALT-702 |
| Đặt hàng | Cộng thêm số lượng cần của sản phẩm thay thế, giảm sản phẩm lỗi. Nếu đã sau đặt hàng chính thức thì **đặt hàng bổ sung**. Màn hình đặt hàng có 「代替品数」 (Số lượng hàng thay thế) | REQ-ALT-706 |
| Tồn kho cơ sở | Hàng lỗi còn lại ở cơ sở được **ghi nhận là hủy** và trừ khỏi tồn kho lý thuyết (không tính là hao hụt quản lý). Chuyến giao ES ＝ tài xế thu hồi・hủy ở chuyến sau, chuyến COOL ＝ doanh nghiệp tự hủy và khai báo qua báo cáo kiểm kê | REQ-ALT-705 |
| Hóa đơn | Như bảng ở §2. Thuế của phần thay thế được tách vào dòng 8% | REQ-ALT-704, danh sách vấn đề 4a-8 (2026/10/03) |
| Màn hình của khách hàng | 「代替品（元：〇〇）」 (Hàng thay thế (gốc: 〇〇)) trong chi tiết giao hàng・phiếu giao hàng・đơn hàng hằng tháng | REQ-ALT-708 |
| Hiện trường giao hàng | 「代替品（元：〇〇）」 và chỉ thị thu hồi・hủy trong ứng dụng tài xế・danh sách giao hàng của đơn vị giao hàng ủy thác | REQ-ALT-709 |

- Khi lưu, hiển thị dạng danh sách "phản ánh xuống hạ nguồn" ở trên.

## 5. Những điều chưa quyết định

Không có (ngày 2026/10/01 đã quyết định toàn bộ OPEN-1〜5). Phần triển khai chi tiết còn lại (đưa đặt hàng bổ sung cho hàng thay thế lên trang nhà cung cấp, v.v.) được theo dõi tại `docs/決定の受付簿.md`.

## 6. 「代替品の確認」 (Xác nhận hàng thay thế) trên Web doanh nghiệp (2026-10-14・sổ tiếp nhận #596)

※2026-10-18 hong: phương án bỏ màn hình này và chuyển sang từ thông báo đến màn hình đơn hàng của cơ sở・tháng đó (sổ tiếp nhận #815) đang được xác nhận với khách hàng. Cho đến khi quyết định, giữ nguyên mục này.

Một trong các chức năng thêm vào Web doanh nghiệp: 「代替品の設定の確認」 (xác nhận thiết lập hàng thay thế) (khách hàng đã đồng ý・hong đã thông qua). **Khách hàng không thiết lập**. Đây là màn hình **chỉ để xem** các xử lý hàng thay thế mà vận hành đã xác định, liên quan đến cơ sở của mình.
※Nội dung màn hình không có định nghĩa trong #596 nên được làm theo phương án của Claude (**đang chờ hong xác nhận**).

| Hạng mục | Quy định (phương án) |
|---|---|
| Vị trí | Menu bên 「代替品の確認」 (`/corp/alts`. Phía trên mục đánh giá). Tài khoản doanh nghiệp ＝ toàn bộ cơ sở của công ty mình, tài khoản cơ sở ＝ chỉ cơ sở của mình |
| Những gì hiển thị | Trong các thiết lập hàng thay thế vận hành đã xác định, những thiết lập **có bật "thông báo cho khách hàng"** (§3-7) và có chuyến của cơ sở mình là đối tượng. Từ thiết lập mới nhất |
| Tiêu đề của 1 thiết lập | Sản phẩm lỗi → sản phẩm thay thế (③ Chỉ loại trừ thì 「代わりの商品なし・納品分に含まれません」 (không có sản phẩm thay thế・không nằm trong phần giao hàng)), ID thiết lập, ngày biết có lỗi, ngày giờ thông báo |
| Dòng theo từng cơ sở | Cơ sở・cách xử lý (① Thay thế／② Bồi thường／③ Chỉ loại trừ)・ngày xuất hàng của chuyến đối tượng (link đến chi tiết giao hàng)・số lượng sản phẩm gốc・số lượng hàng thay thế・cách giao (cùng chuyến／chuyến kế tiếp／giao hàng bổ sung…／không giao)・cách xử lý hóa đơn |
| Cách diễn đạt xử lý hóa đơn | ① Thay thế ＝ 「元の商品の単価でご請求します」 (tính phí theo đơn giá của sản phẩm gốc)／② Bồi thường・③ Chỉ loại trừ ＝ 「請求しません」 (không tính phí) (bảng §2) |
| Hàng lỗi còn lại ở cơ sở | Cơ sở・sản phẩm・số lượng・cách xử lý (tài xế thu hồi・hủy／doanh nghiệp tự hủy và khai báo qua báo cáo kiểm kê). 「廃棄として記録します。管理ロスにはなりません」 (Ghi nhận là hủy. Không tính là hao hụt quản lý) (§4) |
| Những gì không hiển thị | Lý do lỗi, lô, nhà cung cấp・phân biệt trả lại／hủy, tồn kho・thiếu hụt・đặt hàng bổ sung của kho, ghi chú của vận hành (nội dung nội bộ) |
| Sau khi hủy hợp đồng (chỉ tham chiếu) | Xem được (màn hình chỉ để xem). Khách hàng đã kết thúc hợp đồng không được gửi thông báo hàng thay thế (§2・REQ-ALT-603) nên các thiết lập sau khi kết thúc không hiển thị |

**Quy định màn hình đã quyết định theo trả lời của hong ngày 2026-10-15 (sổ quyết định AK・A-1〜A-3)**

| Hạng mục | Quy định |
|---|---|
| Màu badge cách xử lý | 3 loại ① Thay thế／② Bồi thường／③ Chỉ loại trừ **đều dùng cùng một màu trung tính (xám)**, chỉ phân biệt bằng chữ (tên) (không chia màu xanh dương・xanh lá・vàng, v.v.) |
| Khi 0 bản ghi | Thống nhất theo I01 chung 「表示するデータがありません。」 (Không có dữ liệu để hiển thị.) (không làm câu riêng) |
| Khi nhiều | **Phân trang 10 bản ghi mỗi trang**. Dòng được sắp theo thứ tự **cơ sở → ngày xuất hàng**. **Đặt ô lọc giống như thiết lập hàng thay thế của vận hành** (hong 2026-10-15 chat "danh sách nào cũng có ô lọc". Sổ quyết định AK. Màn hình trong code cũng đã gắn: từ khóa (tên sản phẩm・ID thiết lập・tên cơ sở) ＋ cách xử lý) |

Kiểm tra: `scripts/qa/corp_alts_check.ts`.
