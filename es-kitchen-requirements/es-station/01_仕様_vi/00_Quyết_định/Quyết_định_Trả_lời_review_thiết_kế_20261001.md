> **Đã đóng băng (bản gốc, 2026-10-05). Từ nay không cập nhật.** Các quyết định hiện đang có hiệu lực xem `docs/決定台帳.md`. Nơi nội dung của file này được chuyển đến và các quyết định đã bị thay thế xem mục "G" trong sổ cái.

# Quyết định: Trả lời cho review thiết kế demo (góc nhìn BA・QC) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Là phần trả lời cho mục "Những điều cần quyết định trước" trong tài liệu review "Review thiết kế demo (góc nhìn BA・QC)" (Claude Docs).
> **Chưa phản ánh vào demo và đặc tả** (chỉ thị của anh Long: "chưa cập nhật demo"). Khi phản ánh thì xem §3.

## 1. Quyết định

| # | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| DR-1 | Hỗ trợ smartphone cho Web doanh nghiệp | **Có (chỉ kiểm kê tồn kho)** | Cho phép thực hiện kiểm kê tồn kho (khai báo kiểm kê) trên màn hình rộng smartphone. Các màn hình khác vẫn giả định dùng PC |
| DR-2 | Tiếng Việt trên màn hình tài xế | **Không phải yêu cầu chính thức** | Chỉ có bản đối dịch vì đội phát triển là người Việt Nam. Không yêu cầu như một chức năng dành cho khách hàng |
| DR-3 | Đổi người phụ trách ở cơ sở đang tạm ngưng (C-5) | **A: chỉ được đổi người phụ trách** | Kể cả khi tạm ngưng, vẫn được đổi・thêm・xóa "người phụ trách (chính, người phụ trách thanh toán, v.v.)" trên Web doanh nghiệp. Có hiệu lực ngay + thông báo cho vận hành (giống việc đổi người phụ trách hiện nay). Các mục khác vẫn chỉ xem |
| DR-4 | Có hiển thị đơn giá・số tiền cho nhà cung cấp không (S-6) | **Không hiển thị** | Không hiển thị đơn giá nhập, số tiền đặt hàng, số tiền theo ngày, số tiền trong CSV trên trang nhà cung cấp |
| DR-5 | Có chen bước phê duyệt của vận hành khi nhà cung cấp đổi hồ sơ không (S-7) | **Không chen** | Như demo hiện tại, lưu là phản ánh vào master của vận hành |
| DR-6 | Cách diễn đạt dành cho khách hàng trên Web doanh nghiệp (C-12) | **Hướng tới việc làm** | Soạn đề xuất bảng diễn đạt lại cho hợp đồng con・quyết toán theo thực tế, v.v., rồi xác nhận cùng với việc thay thuật ngữ ở STEP7 |

## 2. Lý do của DR-3 và việc ghi đè quyết định trước

- Thời gian tạm ngưng tối đa là 1 năm tính gộp. Trong thời gian đó, việc người phụ trách bộ phận hành chính tổng hợp thay đổi là chuyện bình thường, và khi tạm ngưng vẫn có email thông báo mở lại, hóa đơn, ngày dự kiến trả lại gửi đến, nên nếu người phụ trách vẫn là người cũ thì liên lạc sẽ không đến được.
- Người phụ trách thuộc loại phê duyệt "chỉ thông báo", không ảnh hưởng đến số tiền giao hàng・thanh toán.
- **Ghi đè**: Với quy định "Khi tạm ngưng chỉ được xem. Chỉ có thể đăng ký mở lại・hủy hợp đồng và liên hệ (28-3・28-21)" (Thiết kế cơ bản §4-2・§10-7-3, trả lời STEP1 "đăng nhập khi tạm ngưng chỉ được xem"), bổ sung **ngoại lệ "đổi người phụ trách"**.
- Chưa quyết: Sau khi hủy hợp đồng (chỉ được xem đến hạn thanh toán hóa đơn cuối cùng) có áp dụng cùng ngoại lệ không. Đề xuất của Claude là "chỉ được đổi người phụ trách thanh toán".

## 3. Các nơi cần phản ánh (chưa phản ánh)

| # | Demo | Đặc tả |
|---|---|---|
| DR-1 | Cho phép dùng kiểm kê tồn kho của Web doanh nghiệp trên màn hình rộng smartphone (đóng menu bên, chuyển bảng cơ sở thành thẻ, ô số lượng dùng bàn phím số). Review C-15・C-11 | Thêm vào thiết kế cơ bản "Hỗ trợ smartphone của Web doanh nghiệp chỉ là kiểm kê tồn kho" |
| DR-2 | Không có (đã hạ mức độ quan trọng của review D-3) | Không có |
| DR-3 | Chỉ cho "Sửa" ở cơ sở đang tạm ngưng (Nagoya) đối với người phụ trách. Sửa câu chữ trên màn hình "Có thể sửa thông tin cơ sở・người phụ trách". Review C-5 | Thiết kế cơ bản §4-2・§5-3・§10-7-3, Đặc tả màn hình quản lý cơ sở Web doanh nghiệp |
| DR-4 | Bỏ số tiền khỏi danh sách・chi tiết・CSV của trang nhà cung cấp. Review S-6 | Chuyển §5-2 của Danh sách màn hình trang nhà cung cấp thành "Quyết định" |
| DR-5 | Không có. Bỏ review S-7 khỏi danh sách góp ý | Chuyển §5-4 của Danh sách màn hình trang nhà cung cấp thành "Quyết định" |
| DR-6 | Sau khi bảng diễn đạt lại được chốt | Bảng thuật ngữ (STEP7) |
