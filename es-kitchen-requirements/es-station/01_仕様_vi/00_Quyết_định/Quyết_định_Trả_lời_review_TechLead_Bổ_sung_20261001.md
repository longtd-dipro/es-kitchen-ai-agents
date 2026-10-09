> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Trả lời đánh giá của TechLead・Bổ sung (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long)／Soạn: Claude (Cowork). Là trả lời lần 2 cho `Quyết_định_Trả_lời_review_TechLead_20261001.md`. Không viết lại tài liệu trước mà ghi đè tại đây.
> **Không phản ánh vào demo (đang thực hiện STEP5).** Chỉnh lý đặc tả ở `01_仕様/Sắp_xếp_đặc_tả_Trục_thời_gian_bản_sao_và_tính_nhất_quán_20261001.md`.

| # | Vấn đề | Trả lời・quyết định | Ghi đè |
|---|---|---|---|
| TL-1 bổ sung | Thay đổi liên quan đến tháng đã thanh toán | "Chỉ như ghi chú thì không tốt". Cách xử lý là phương án ở chỉnh lý đặc tả §1-1 (đề xuất A: tự động tạo dòng chi tiết điều chỉnh và đưa vào hóa đơn), chờ trả lời | — |
| TL-2 bổ sung | Tồn kho và quyết toán trong thời gian tạm dừng (Q1) | **B: Kiểm tra tồn kho và quyết toán lúc bắt đầu tạm dừng, không quyết toán trong thời gian tạm dừng** | — |
| TL-3 | Cơ sở và hợp đồng cha | **Dùng thử → triển khai chính thức không phải hợp đồng cha mới mà chuyển đổi trong cùng một hợp đồng (nhận thức của anh Long)** | Ghi đè cách hiểu của TL-3 "tại một thời điểm chỉ có một hiệu lực, lịch sử có nhiều". Vì mâu thuẫn với danh sách mục §0.4 (cấp số mới), việc ghi đè §0.4 đang chờ trả lời ở chỉnh lý đặc tả §6-1 |
| TL-4 | Ngày cho thuê khi chuyển đổi | **Không bắt buộc** | Ghi đè TL-4 "bắt buộc". Cách xử lý khi chưa nhập là chỉnh lý đặc tả §9 (đề xuất: ước tính lấy tháng bắt đầu hợp đồng ban đầu làm mốc tính) |
| TL-5 bổ sung | Tài khoản | Ví dụ: nếu hợp đồng là chu kỳ tháng 10 thì phải truy cập được từ tháng 9 → có hiệu lực trước ngày bắt đầu đặt hàng của chu kỳ đầu tiên | — |
| Q5 | Thay đổi tên người nhận từ sau khi xác định đến trước khi phát hành | **Cho phép. Chỉ cố định số tiền** | — |
| Q6 | Thời điểm bắt đầu có hiệu lực của cài đặt có phí | **Cả cài đặt và phí đều theo quy tắc hạn chót** | Ghi đè STEP2 Q2 "có hiệu lực từ chu kỳ hiện tại trở đi" đối với các cài đặt có phí |
| Q7 | Có áp dụng điều chỉnh giá cho khách hàng hiện có không | **Có. Đã được áp dụng nhưng chưa được quản lý trong hệ thống nên cần cài đặt ban đầu** | — |
| Q9 | Kho có tiếp nhận phiên bản mới vào ngày hôm trước không | **Cần xác nhận với kho. Nếu không tiếp nhận được thì rút ngắn thời hạn có thể đổi ngày sau hạn chót** | — |
