> **Đã đóng băng (bản gốc, 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực xem `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế xem mục "G" của sổ quyết định.

# Quyết định: Phản hồi cho review của TechLead (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Phản hồi cho các đề xuất 1, 5, 7, 10 trong mục "Góc nhìn TechLead" của tài liệu review "Review thiết kế demo (góc nhìn BA・QC)" (Claude Docs).
> **Chưa phản ánh vào demo・đặc tả.** Các câu hỏi còn lại Q1〜Q15 nằm trong mục "Các câu hỏi cần xác nhận" của cùng phần đó.

## 1. Quyết định

| # | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| TL-1 | Tạo trước Hợp đồng con (đề xuất 1) | **Giữ nguyên cách tạo trước như hiện tại (1-B)** | Lý do: có "thay đổi hợp đồng từ tháng này trở đi (thanh toán theo năm, v.v.)". Cần bổ sung: (1) trong lúc chờ phê duyệt thì dừng chỉnh sửa trực tiếp các mục liên quan (2) khi phê duyệt, nếu giá trị trước thay đổi khác với giá trị hiện tại thì dừng lại (3) sao chép cả nơi nhận hóa đơn・thời gian chuẩn bị (lead time) sang Hợp đồng con |
| TL-2 | Hợp đồng con đang tạm ngừng và quyết toán thực tế (đề xuất 5) | **Không tạo Hợp đồng con. Nếu cần thì trong thời gian tạm ngừng cũng không quyết toán thực tế** | **Ghi đè**: Quyết định_STEP3 bổ sung_Quy tắc thanh toán P5 (khi tạm ngừng nếu cần vẫn quyết toán, và thanh toán gộp khi mở lại・hủy hợp đồng). Cách xử lý khi thiết bị vẫn để nguyên và việc bán hàng vẫn tiếp tục là Q1 |
| TL-3 | Cơ sở và Hợp đồng cha (đề xuất 7) | **1 đối 1 (nhận định của Long)** | Theo đặc tả (Danh sách hạng mục §0.4), chuyển từ dùng thử sang triển khai chính thức sẽ thành Hợp đồng cha khác, nên hiểu là "tại một thời điểm chỉ có 1 hợp đồng hiệu lực, lịch sử có nhiều hợp đồng". Xác nhận ở Q2 |
| TL-4 | Thiết bị không rõ ngày cho mượn khi chuyển đổi dữ liệu (đề xuất 10) | **Yêu cầu nhập** | Ngày cho mượn là bắt buộc trong dữ liệu chuyển đổi. Ai nhập và trước khi nào là Q3 |
| TL-5 | Tài khoản | Trạng thái hiệu lực・tạm dừng của tài khoản không suy ra từ trạng thái hợp đồng mà được giữ ở chính tài khoản | "Hiện tại tài khoản đã có hiệu lực và được sử dụng từ trước khi ký hợp đồng" (Long). Đây là cách hiểu của Claude. Nếu khác thì sửa lại |
