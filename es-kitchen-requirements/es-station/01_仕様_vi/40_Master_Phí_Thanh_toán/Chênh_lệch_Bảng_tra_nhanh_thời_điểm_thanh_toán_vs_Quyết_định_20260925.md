# Danh sách chênh lệch: Bảng tra nhanh thời điểm thanh toán và quyết định・demo ngày 9/25

- Kết luận (2026/09/25 hong): **`決定_請求書発行_20260925` là chuẩn**. Bảng tra nhanh `02_デモ/92_説明_請求タイミング早見表.html` (2026/09/08) đã cũ
- Đối tượng so sánh: `決定_請求書発行_20260925.md` (dự án)／`15_運営_請求.html`／`97_説明_請求書発行フロー_vi.html`／`12_運営_法人拠点契約.html`
- Tài liệu này chỉ nêu điểm cần chỉ ra. Chưa phản ánh vào đặc tả・demo

## A. Các điểm lệch (cần quyết định thống nhất theo bên nào)

| # | Vấn đề | Bảng tra nhanh (cũ) | Quyết định 9/25 | Hiện trạng demo |
|---|---|---|---|---|
| A1 | Ngày phát hành hóa đơn | Phát hành trong tháng thanh toán. Hóa đơn tháng 7 có kết quả 6/21〜7/20 = sau khi chốt 7/25 thì phát hành trước cuối tháng 7 | Chốt ngày 25 → gửi **ngày 1 tháng sau** (phần chốt tháng 7 là 8/1) | billing_ops: ngày 1 tháng sau (tháng chốt 2026-07 → 2026/08/01)／flow_vi: 8/1／entity: lẫn lộn cả ví dụ INV-2026-07-001 và INV-2026-08-001 |
| A2 | ① Offset trả trước (thanh toán trước 1 tháng) | Hóa đơn tháng 7 → **phần tháng 8** | Gửi 8/1 → **phần tháng 9** (chu kỳ = tháng gửi + 1) | billing_ops・flow_vi đúng theo quyết định |
| A3 | Thanh toán tháng hiện tại (lead time 0) | Hóa đơn tháng 7 (phát hành cuối tháng 7) → phần tháng 7 = thanh toán ở cuối kỳ | Gửi 9/1 → phần tháng 9 = thanh toán ở đầu kỳ | Đúng theo quyết định |
| A4 | Tên hóa đơn (tháng) của ② quyết toán theo thực tế | Cùng tháng với tháng chốt (6/21〜7/20 → hóa đơn tháng 7) | Tháng gửi = tháng sau tháng chốt (6/21〜7/20 → gửi 8/1・INV-2026-08) | Đúng theo quyết định. Ghi chú quyết định bằng miệng ngày 9/25 là "phát hành 7/31" thuộc về phía bảng tra nhanh |
| A5 | Nơi giữ lead time | Giá trị mặc định của doanh nghiệp + ghi đè theo hợp đồng・**khoản mục** | Cài đặt của hợp đồng | entity・billing_ops: giá trị mặc định của doanh nghiệp + ghi đè theo **cơ sở** (chỉ khi nơi thanh toán = cơ sở này). Không có ghi đè theo đơn vị khoản mục |
| A6 | Căn cứ hạn thanh toán・ngày phát hành | Doanh nghiệp giữ "căn cứ ngày phát hành hóa đơn／hạn thanh toán" | Quy tắc cố định (cuối tháng trước của tháng chu kỳ ①／nếu chỉ ② thì cuối tháng gửi). Không giữ mục này | billing_ops: quy tắc cố định／entity: vẫn còn ví dụ lựa chọn "ngày 27 tháng hiện tại" (dự kiến sửa riêng) |

※ Đính chính: nếu xét theo tháng của hóa đơn (tháng gửi) thì offset trả trước giống nhau giữa bảng tra nhanh và quyết định (thanh toán trước 1 tháng thì hóa đơn tháng 7 là phần tháng 8). Điểm thực sự lệch là kỳ của ② quyết toán theo thực tế và ngày gửi (cuối tháng hay ngày 1 tháng sau). Dưới đây là nhận định ban đầu: xem "tháng của hóa đơn" là **tháng phát hành (bảng tra nhanh)** hay **ngày 1 tháng sau là ngày gửi (quyết định)**. Phát hành 7/31 hay 8/1 chỉ chênh 1 ngày, nhưng tháng đối tượng của trả trước sẽ lệch 1 tháng (A2・A3).

## B. Các điểm thống nhất

- Không có thanh toán gộp 3 tháng. Ngoại lệ duy nhất là trả trước gộp 1 năm
- Thời điểm thanh toán do khoản mục giữ (trả trước hàng tháng／trả trước gộp 1 năm／trả sau)
- Trả sau (quyết toán theo thực tế) không liên quan lead time, là từ ngày 21 tháng trước đến ngày 20 tháng này
- Phát hiện sót hóa đơn đếm "tháng chu kỳ × khoản mục", với gộp 1 năm thì xét theo thời gian bao phủ
- Khoản mục giữ giá chưa thuế + thuế suất
- Dòng chi tiết bắt buộc hiển thị thời gian đối tượng

## C. Diễn biến sau đó của "6. Những điều cần quyết định" trong bảng tra nhanh

| Vấn đề | Tình trạng |
|---|---|
| Nơi giữ lead time | Chưa thống nhất (A5) |
| Thanh toán trước 2 tháng thì chốt ngày 20, xác định ngày 25 có kịp không | Đã quyết định xác định ngày 25. Phương án tách ngày xác định giữa trả trước và trả sau không được chấp nhận |
| Tháng bắt đầu tính của gộp 1 năm | Cần xác nhận (billing_ops chỉ hiển thị tham chiếu "tháng bắt đầu tính") |
| Hủy giữa kỳ của gộp 1 năm | Đã quyết định (9/19): hợp đồng con đã thanh toán sẽ hoàn tiền・bù trừ bằng ③điều chỉnh |
| Điều chỉnh giá giữa kỳ của gộp 1 năm | Cần xác nhận |
| Khi thay đổi lead time giữa chừng | Cần xác nhận (billing_ops cũng ghi chú "cần quyết định quy tắc chuyển đổi") |
| Thời gian gia hạn thanh toán lần đầu | Cần xác nhận |

## Kết luận

1. A1〜A4: Theo quyết định. Xác định ngày 25 → gửi ngày 1 tháng sau, chu kỳ trả trước = tháng gửi + lead time, ② là chu kỳ của tháng gửi − 1 (6/21〜7/20 → gửi 8/1). Hủy ghi chú bằng miệng 9/25 "phát hành 7/31"
2. A5: "Cài đặt của hợp đồng" trong quyết định = các mục của hợp đồng cha được quản lý ở màn hình cơ sở, nên giá trị mặc định của doanh nghiệp + ghi đè theo cơ sở (hợp đồng) là khớp với demo. Không giữ ghi đè theo đơn vị khoản mục
3. A6: Theo quyết định là quy tắc cố định. Không giữ "căn cứ ngày phát hành／hạn thanh toán" của bảng tra nhanh

## Xử lý (2026/09/25)

- Đã viết lại `02_デモ/92_説明_請求タイミング早見表.html` theo quyết định (gửi ngày 1 tháng sau・quy tắc cố định của hạn thanh toán・② là chu kỳ của tháng gửi − 1・lead time là mặc định doanh nghiệp + ghi đè theo cơ sở・bảng quyết định／cần xác nhận)
- Bản cũ ở `99_過去/billing_timing_map_ja_20260908.html`
