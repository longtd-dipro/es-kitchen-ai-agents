> Bản dịch tiếng Việt của `ja/01_仕様/85_購入・決済/購入・決済・返金.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Mua hàng, thanh toán, hoàn tiền

> **Đây là bản chuẩn cho chủ đề này.** Tổng hợp các quyết định về mua hàng, thanh toán, hoàn tiền đã xác nhận đến 2026-10-09 thành đặc tả xuyên suốt màn hình, API của công ty thanh toán, tồn kho và thống kê.
> Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Khi khác nhau, sổ quyết định là chuẩn.

## 1. Đối tượng và mã định danh

| # | Quy định |
|---|---|
| 1-1 | Lượt mua từ app cá nhân, ESQR và khách (guest) được xử lý như cùng một loại dữ liệu mua hàng. Nguồn mua được lưu riêng để phân biệt |
| 1-2 | Mã đơn là `OD` + 7 chữ số. Khi 1 đơn có nhiều sản phẩm, dù có nhiều dòng sản phẩm thì mã đơn vẫn là một |
| 1-3 | Đơn vị hoàn tiền không phải dòng sản phẩm mà là **toàn bộ đơn (mã OD)**. Không hoàn tiền chỉ một phần sản phẩm của cùng một đơn |
| 1-4 | ESQR và khách cũng có user ID giống người dùng thông thường. Không có tài khoản chính thức hay email, không lưu giới tính và độ tuổi |

## 2. Mua hàng và tồn kho

| # | Quy định |
|---|---|
| 2-1 | Bỏ vào giỏ hàng thì không thay đổi tồn kho. Khi tạo đơn (trước khi thanh toán) thì giữ chỗ tạm, khi thanh toán hoàn tất thì trừ tồn kho lý thuyết của cơ sở nơi mua |
| 2-2 | Thời gian chờ thanh toán là 30 phút. Khi quá hạn, thất bại hoặc hủy thì gỡ phần giữ chỗ tạm |
| 2-3 | Mua bằng quét mã là 1 cái mỗi lần và không kiểm tra tồn kho. Tồn kho lý thuyết được phép âm |
| 2-4 | Cách xử lý tồn kho khi hoàn tiền thành công xem §4. Khi hoàn tiền thất bại hoặc không rõ kết quả thì không thay đổi tồn kho |

## 3. Điều kiện được hoàn tiền và nội dung nhập

| # | Quy định |
|---|---|
| 3-1 | Chỉ quyền đầy đủ (full) trên Web vận hành mới được thực hiện hoàn tiền. Web doanh nghiệp chỉ được xem |
| 3-2 | Thời hạn được hoàn tiền là 3 tháng kể từ ngày thanh toán hoàn tất (tạm thời). Phán định có tính cả hôm nay. Khi biết được thời hạn hủy của công ty thanh toán thì xem xét lại |
| 3-3 | Lý do chọn 1 trong 5: 「注文が重複している」(đơn bị trùng), 「注文を間違えた」(đặt nhầm), 「商品が品切れだった」(sản phẩm hết hàng), 「商品に不具合があった」(sản phẩm bị lỗi), 「その他」(khác) |
| 3-4 | Khi chọn 「その他」 thì bắt buộc nhập ghi chú (nhiều dòng, tối đa 500 ký tự) |
| 3-5 | Đối tượng hoàn tiền là toàn bộ đơn. Màn hình xác nhận hiển thị mã đơn, sản phẩm đối tượng, số lượng, số tiền hoàn, phương thức thanh toán, lý do |

## 4. Thực hiện hoàn tiền và trạng thái

| # | Quy định |
|---|---|
| 4-1 | Khi bấm 「返金」(hoàn tiền) trên màn hình, gọi ngay API hoàn tiền của công ty thanh toán cho đơn đối tượng |
| 4-2 | Chỉ trong lúc chờ phản hồi của API mới là 「返金中」(đang hoàn tiền). 「返金中」 không phải trạng thái hoàn tất lâu dài |
| 4-3 | Khi API thành công, chuyển tất cả dòng sản phẩm của cùng đơn sang 「返金済」(đã hoàn tiền), ghi lại ngày giờ hoàn tiền, lý do, thông tin tham chiếu của công ty thanh toán |
| 4-4 | Khi thành công, tự động cộng số lượng mua của từng sản phẩm trong cùng đơn vào tồn kho lý thuyết của cơ sở nơi mua |
| 4-5 | Việc cập nhật sang 「返金済」 và cộng tồn kho được ghi nhận như 1 xử lý thành công duy nhất. Không để chỉ một bên thành công |
| 4-6 | Khi API thất bại hoặc không rõ kết quả, không thay đổi trạng thái đã xác định của lượt mua và cũng không thay đổi tồn kho. Ghi lại ngày giờ lỗi, đơn đối tượng, nội dung lỗi và hiển thị trên màn hình |
| 4-7 | Khi thất bại, vận hành có thể thực hiện lại. Khi không rõ kết quả, xác nhận thủ công phía công ty thanh toán rồi mới thực hiện lại hoặc xác định trạng thái |
| 4-8 | Dù bấm đúp, gửi lại hay thao tác đồng thời, cũng không thực hiện hai lần API hoàn tiền và cộng tồn kho của cùng một đơn. Xử lý idempotent bằng khóa thực hiện hoàn tiền duy nhất gắn với mã đơn |

## 5. Thống kê, hiển thị, CSV

| # | Quy định |
|---|---|
| 5-1 | Số lượt mua và số tiền mua bao gồm 「支払済」(đã thanh toán) và 「返金中」, trừ đi 「返金済」. Không tính 「キャンセル」(hủy) |
| 5-2 | Số lần hoàn tiền và số tiền hoàn chỉ đếm 「返金済」. Không đếm 「返金中」, thất bại, không rõ kết quả |
| 5-3 | KPI, dòng tổng, danh sách, CSV, phần quản lý mua hàng và người dùng của Web vận hành và Web doanh nghiệp đều dùng chung định nghĩa ở §5-1 và §5-2 |
| 5-4 | Hiển thị trạng thái và giá trị CSV là 「支払済」「返金中」「返金済」, không dùng dạng 「〜済み」 |
| 5-5 | Thất bại và không rõ kết quả được hiển thị như lịch sử thực hiện hoàn tiền, tách riêng khỏi trạng thái mua hàng. Không để lượt mua trông như 「返金済」 |
| 5-6 | Danh sách mua hàng và mua hàng theo người dùng trên Web doanh nghiệp **không hiển thị các lượt mua đã hủy, ESQR và khách**. Doanh nghiệp và cơ sở chỉ xem lượt mua của hội viên (người mua có tài khoản) thuộc cơ sở của mình. Kỳ mặc định là tháng hiện tại (ngày 1 ~ hôm nay) (trả lời của hong 2026-10-15, sổ quyết định AK SALE-Q1・Q2. Chi tiết màn hình ở `80_運営・法人の画面/運営・法人の画面.md` §2-8〜2-11) |

## 6. Ranh giới xử lý và ghi nhận

Bản thân việc gọi API hoàn tiền và việc cập nhật trong hệ thống sau khi thành công không thể nằm trong cùng một transaction cơ sở dữ liệu. Vì vậy, tối thiểu phải ghi nhận các mục sau theo đơn vị đơn hàng.

| Ghi nhận | Mục đích |
|---|---|
| Khóa thực hiện hoàn tiền | Xử lý việc gửi lại API hay thao tác hai lần như cùng một lần hoàn tiền |
| Mã đơn, mã thanh toán, phương thức thanh toán | Đối chiếu với phía công ty thanh toán |
| Ngày giờ yêu cầu, ngày giờ phản hồi, kết quả | Theo dõi thành công, thất bại, không rõ kết quả |
| Số tiền hoàn, lý do, ghi chú, người thực hiện | Kiểm toán và hiển thị trên màn hình |
| Ngày giờ phản ánh tồn kho | Xác nhận việc cộng tồn kho sau khi hoàn tiền thành công chỉ hoàn tất đúng 1 lần |

Sau khi nhận kết quả thành công từ công ty thanh toán, việc cập nhật đơn sang 「返金済」, cộng tồn kho và xác định lịch sử thực hiện hoàn tiền được làm trong 1 transaction trong hệ thống. Nếu thất bại giữa chừng thì không xác định là đã thành công, và phải có thể tiếp tục lại cùng xử lý một cách an toàn.

## 7. Phạm vi dùng nguyên giai đoạn 1 và các điểm chưa xác nhận

| ID | Điều cần xác nhận | Cách xử lý cho đến khi quyết định |
|---|---|---|
| PAY-P1-01 | Đặc tả API hoàn tiền của từng công ty thanh toán: URL, xác thực, yêu cầu/phản hồi, timeout, Webhook/API tra cứu, khóa idempotent | **Làm đúng như code giai đoạn 1. Ở giai đoạn 2 không tạo mới định nghĩa chi tiết của API hoàn tiền và không thêm adapter mới** (trả lời của hong 2026-10-09) |
| PAY-OPEN-02 | Thời hạn 3 tháng, và thời hạn có thể hủy theo từng phương thức thanh toán | Dùng 3 tháng làm giá trị tạm thời |
| PAY-OPEN-03 | Chi tiết màn hình vận hành và quyền để xác định 「成功」(thành công) hoặc 「失敗」(thất bại) sau khi xác nhận thủ công trường hợp không rõ kết quả | Lưu lịch sử và lỗi, không tự động coi là thành công |

## 8. Điều kiện nghiệm thu

- Dù cùng một mã OD có nhiều sản phẩm, 1 lần thao tác chỉ hoàn tiền toàn bộ đơn đó.
- Chỉ khi thành công, tất cả dòng sản phẩm mới thành đã hoàn tiền, và từng số lượng được cộng đúng 1 lần vào tồn kho lý thuyết của cơ sở nơi mua.
- Khi API thất bại, timeout hoặc không rõ kết quả, đơn không thành đã hoàn tiền và tồn kho không được cộng, đồng thời có thể xác nhận được nguyên nhân.
- Dù gửi lại hay thực hiện đồng thời cùng một thao tác, số tiền hoàn và tồn kho cũng không bị nhân đôi.
- Đang hoàn tiền vẫn được tính vào số lượt mua và số tiền mua, chỉ đã hoàn tiền mới bị trừ khỏi số lượt mua và số tiền mua.
- Web vận hành, Web doanh nghiệp, CSV, KPI và dòng tổng cho ra cùng một giá trị.
