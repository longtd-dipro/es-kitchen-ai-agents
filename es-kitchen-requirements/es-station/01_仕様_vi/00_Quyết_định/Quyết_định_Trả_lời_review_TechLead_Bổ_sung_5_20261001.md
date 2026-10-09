> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Trả lời đánh giá của TechLead・Bổ sung 5 (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long)／Soạn: Claude (Cowork). Tiếp theo `Quyết_định_Trả_lời_review_TechLead_Bổ_sung_4_20261001.md`. **Không phản ánh vào demo (đang thực hiện STEP5).** Việc chỉnh lý đặc tả đã được phản ánh vào `01_仕様/Sắp_xếp_đặc_tả_Trục_thời_gian_bản_sao_và_tính_nhất_quán_20261001.md`. Số câu hỏi là "Những câu hỏi muốn xác nhận" của tài liệu đánh giá (Claude Docs).

| # | Vấn đề | Quyết định | Ghi đè・bổ sung |
|---|---|---|---|
| Q4 | Sau khi yêu cầu thanh toán lại do chưa nhận tiền, khi biết đã nhận tiền của phần gốc | **Làm cho có thể rút lại yêu cầu thanh toán lại trước khi phát hành. Sau khi rút lại, nếu cần thì thanh toán lại với nội dung đúng** (anh Long: "cần rút lại trước khi thanh toán lại rồi mới thanh toán lại". Cách hiểu của Claude) | Không chấp nhận phương án triệt tiêu bằng dòng chi tiết điều chỉnh âm. Nếu biết sau khi hóa đơn có chứa phần thanh toán lại đã được phát hành thì chờ xác nhận |
| Q8 | Phạm vi dừng thời gian sử dụng tối thiểu trong thời gian tạm dừng | **A: Chỉ dừng thiết bị để nguyên. Thiết bị đã thu hồi thì đếm lại từ ngày lắp đặt lại** | **Ghi đè**: Quy tắc thanh toán v1 3-4 "không đếm trong thời gian tạm dừng (tất cả)". Giống #615・#636 của danh sách mục |
| Q10 | Khi chuyến được coi là hoàn tất chưa được giao đến | **Theo đề xuất: đăng ký sự cố để tự động hoàn lại tồn kho (nếu đã chốt thì quyết toán tháng sau)** | — |
| Q11 | Khi báo cáo giao hàng offline xung đột với việc hủy của Vận hành | **Theo đề xuất: đưa vào cần xác nhận để Vận hành chọn** | — |
| Q12 | Khi sản phẩm không đủ do nhập kho NG sau khi phê duyệt đặt hàng chính thức | **Theo đề xuất: không tự động giảm, Vận hành chọn hàng thay thế・giao hàng giảm bớt** | — |
| Q13 | Phí giao hàng bổ sung của vật tư | **Theo đề xuất: coi bên mới (¥2,000 ở STEP5 §2-5) là chuẩn** | Số tiền xác nhận với khách hàng. Ghi đè STEP4 O-3 (¥1,000・tạm) |
| Q14 | Phân quyền nhân viên kho và màn hình xác nhận nhập kho | **Theo đề xuất: coi STEP6 bổ sung W1 là chuẩn, sửa bản đặc tả tích hợp §17-6** | — |
| Q15 | Thay đổi người phụ trách sau khi hủy (giai đoạn chỉ xem) | **Theo đề xuất: chỉ người phụ trách thanh toán được thay đổi đến thanh toán cuối cùng** | Bản sau khi hủy của DR-3 (trong thời gian tạm dừng có thể đổi người phụ trách) |

Còn lại: Q9 (xác nhận với kho), cách đọc lại REQ-CT-144 (xác nhận với khách hàng), ai thực hiện kiểm tra tồn kho lúc bắt đầu tạm dừng.
