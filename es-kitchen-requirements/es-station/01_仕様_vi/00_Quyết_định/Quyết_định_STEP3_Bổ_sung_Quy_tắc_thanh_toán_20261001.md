> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Bổ sung STEP3 Quy tắc thanh toán (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long)／Soạn: Claude (Cowork). Trong việc rà soát phần thanh toán của STEP3 (mâu thuẫn giữa các tài liệu A1〜A7・chưa có quy tắc B1〜B13・chưa có trên màn hình), đây là trả lời cho P1〜P9.
> Tài liệu đối chiếu: tổng hợp định nghĩa yêu cầu (RD-BL-001〜104), các dòng kế toán của bảng yêu cầu Phase2 (112〜154・186・188), quyết định (28-1a・28-72・STEP2 Q4 v.v.), demo thanh toán.
> **Tài liệu này chỉ ghi lại quyết định. Chưa thay đổi demo・bản đặc tả (kể cả tổng hợp định nghĩa yêu cầu).** Phiên bản trước khi phản ánh được giữ ở `02_デモ/履歴/`.

## 1. Quyết định

| # | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| P2 | Khi có tạm dừng・hủy・hạ gói vào tháng đã thanh toán trước (B2) | **A** | Phần của tháng đã thanh toán sẽ được bù trừ ở hóa đơn kế tiếp (dòng trừ của điều chỉnh). Phần không bù trừ hết thì hoàn tiền ngoài hệ thống (cùng cách nghĩ với RD-BL-073・074). Cùng quy tắc cũng được dùng cho lead time 2〜3 tháng・thanh toán theo năm |
| P3 | Thanh toán lần đầu (B3) | **A** | Khi việc phê duyệt đăng ký muộn hơn thời điểm xác định ngày 25 và hóa đơn chứa phần lần đầu không kịp, thì gộp 2 tháng vào hóa đơn kế tiếp (hóa đơn lần đầu) |
| P4 | Chỉnh sửa hóa đơn sau khi gửi (B9) | **A** | Nguyên tắc là bù trừ ở hóa đơn tháng sau. Việc thay thế hóa đơn (Bill One hủy → phát hành lại bằng ID khác. RD-BL-023) chỉ khi Vận hành quyết định. Không giữ nguyện vọng theo từng khách hàng (dòng 188 của bảng yêu cầu) |
| P5 | Quyết toán theo thực tế trong thời gian tạm dừng (A3) | **B** | Trong thời gian tạm dừng, nếu cần vẫn thực hiện quyết toán theo thực tế hàng tháng (kiểm tra tồn kho・tính toán). Tuy nhiên không thanh toán, mà **thanh toán gộp khi tiếp tục hoặc khi hủy**. Sửa RD-BL-075 "nếu có quyết toán theo thực tế trong thời gian tạm dừng thì thanh toán". Vì không tạo hợp đồng con trong thời gian tạm dừng (28-1a), việc giữ kết quả quyết toán theo thực tế trong thời gian tạm dừng ở đâu sẽ thiết kế khi phản ánh |
| P6 | Thời điểm thanh toán ES-QR (A2) | **A+** | Tiền hàng tháng của ES-QR thống nhất là **trả trước** (giống các khoản hàng tháng khác), sửa RD-BL-003 (trả sau). **Trường hợp không kịp trả trước** (như bắt đầu dùng ES-QR sau khi đã xác định thanh toán) thì có thể điều chỉnh để **chuyển sang hóa đơn kế tiếp để thanh toán** |
| P7 | Kỳ của quyết toán theo thực tế (A4) | **A** | Cố định từ ngày 21 đến ngày 20. Sửa RD-BL-078 "chia theo ngày kiểm kê của từng công ty (21 chỉ là mục tiêu)" |
| P8 | Quyết toán theo thực tế trong thời gian dùng thử (B8) | **A** | Có thanh toán. Giảm giá chiến dịch dùng thử (DC000013) chỉ bù trừ số tiền cố định (phí gói), còn quyết toán theo thực tế (hao hụt quản lý) vẫn thanh toán |
| P9 | Tính thuế tiêu dùng (B10) | **A** | ES tính thuế tiêu dùng (làm tròn・theo từng hóa đơn・theo từng thuế suất. v1.43) và cũng gửi số thuế cho Bill One. Đảm bảo số tiền trên màn hình và hóa đơn luôn khớp nhau |
| P1 | Tính theo ngày (B1) | **Không tính theo ngày** | Hợp đồng theo đơn vị chu kỳ. Tiền hàng tháng (gói・thiết bị・tùy chọn) không chia theo số ngày đã dùng mà thanh toán đủ theo từng tháng chu kỳ. Việc thêm・gỡ thiết bị・tùy chọn và đổi gói cũng áp dụng theo đơn vị tháng chu kỳ (quyết định và đăng ký có hiệu lực từ tháng chu kỳ nào) |

## 2. Những điều chưa quyết định

- Bổ sung P1: khi lắp đặt・thu hồi thiết bị giữa tháng, tháng chu kỳ đó "thanh toán (đủ)" hay "từ tháng chu kỳ tiếp theo" sẽ xác nhận khi phản ánh (được quyết định bởi tháng chu kỳ áp dụng đăng ký).
- A1・A5・A6・A7: sửa các lựa chọn hạn thanh toán của tổng hợp định nghĩa yêu cầu (RD-BL-034・035・072・052) và demo thanh toán cho khớp với quyết định mới (khi phản ánh. Chỉ khớp theo nội dung đã quyết định).
- B4 Thay đổi lead time giữa chừng, B5 tháng bắt đầu tính của thanh toán theo năm・điều chỉnh giá giữa kỳ, B6 thanh toán cuối cùng khi hủy (D3), B10 phân bổ theo cơ sở (lệch 1 yên), B11 đặc tả liên kết Bill One, B12 thanh toán bằng thẻ tín dụng, B13 số tiền cơ sở của phí đại lý.
- Chưa có trên màn hình: hiển thị ghi chú khi thanh toán (RD-BL-070) trong demo thanh toán, dòng vi chỉnh (RD-BL-019), công việc đặc biệt nâng lift・tháo cửa (RD-BL-002), trạng thái thanh toán 5 bước・phát hành cuối tháng (chuyển tiếp của STEP2).
