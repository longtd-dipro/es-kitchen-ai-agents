> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: Xác nhận bản mô tả kịch bản (⓪ Luồng cơ bản) (2026/10/02)

> Người yêu cầu: Long (Tran Duc Long)／Soạn: Claude (Cowork). Đối tượng: ⓪ Luồng cơ bản của bản mô tả kịch bản (`01_仕様/90_デモ確認/シナリオ説明書_20261001.html`・Artifact "ES シナリオ説明書").
> Anh Long trả lời: "Theo đề xuất" (2026/10/02). **Quyết định này được ưu tiên khi mâu thuẫn với các quyết định cùng ngày hoặc trước đó.**

## 1. Quyết định

| # | Vấn đề | Quyết định | Nội dung |
|---|---|---|---|
| ① | Cách áp dụng ngày chuẩn B7・D7 của đặt hàng bổ sung | **A** | Dùng cách đọc giống quy tắc dùng thử (STEP5 T1) cho tất cả đặt hàng bổ sung (dùng thử・đăng ký được phê duyệt sau hạn chót・đặt bổ sung sau khi chốt mẫu kinh doanh). **Nếu kịp B7 của chu kỳ hiện tại thì từ nửa đầu của chu kỳ tiếp theo, nếu là D7 thì từ nửa sau của chu kỳ tiếp theo (từ tuần C)**. Ví dụ: B7 của chu kỳ tháng 10 (10/12〜11/08) = 10/25 → nửa đầu chu kỳ tháng 11, D7 = 11/08 → nửa sau chu kỳ tháng 11 |
| ② | Ngày đặt hàng chính thức | **A** | Không định ngày. Chỉ ghi "Sau hạn chót đặt hàng, Vận hành đặt hàng chính thức (1 lần/tháng)". "Ngày 15〜17" trong demo vận hành là mục tiêu vận hành, không phải quy định. Thông báo chưa đặt hàng (A+) sẽ sau khi nghe ý kiến của Vận hành |
| ③ | Skill của bản mô tả kịch bản | **Cập nhật** | Bổ sung việc đọc ⓪ trước như nền tảng và đưa ⑪〜⑳ thành kịch bản chính thức |

## 2. Những điều đã tìm hiểu được (những việc không đặt câu hỏi)

| Mục | Kết quả | Nguồn |
|---|---|---|
| Ngày công khai menu・ngày bắt đầu đặt hàng | **Công khai menu = bắt đầu đặt hàng = ngày 1 tháng trước** (thống nhất cùng ngày vào 2026/09/18). Ngày thực tế thì cài đặt phía menu là chuẩn, được sao chép và giữ khi tạo chu kỳ (không dùng ngày hằng số) | Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng v1.48・§5, bản đặc tả tích hợp v2.3 §4-3, quyết định #33 |
| Những thứ hoạt động vào ngày bắt đầu đặt hàng | Tạo xác định dữ liệu giao hàng (draft → published) và tạo hợp đồng con của thanh toán tháng hiện tại | Bản đặc tả tích hợp v2.3 (REQ-DL-841・quyết định #40) |
| Cách quyết định tháng chu kỳ | Tháng mà ô thứ 14 B7 thuộc về | Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng §5 (quyết định lần 2 ngày 2026/09/21) |

## 3. Những điều còn lại

| # | Nội dung | Tình trạng |
|---|---|---|
| 1 | **Khi nào đặt hàng tạm**. 発注仕入入荷_詳細要件仕様 §2-4 (2025/12/02) nói "Vào ngày sau hạn chót, tạo đặt hàng chính thức nửa đầu tháng sau và đặt hàng tạm nửa sau (đặt hàng tạm chuyển thành chính thức khi đến thời điểm)". Không khớp với "đặt hàng chính thức 1 lần/tháng (sau hạn chót)" của STEP6 Q5 (2026/10/01) | Chưa quyết (trong bản mô tả kịch bản hiển thị "ngày chưa quyết") |

## 4. Những nơi đã phản ánh

- Bản mô tả kịch bản ⓪: ở "Đơn hàng → Đặt hàng" của bảng A thêm cách đọc ① , ở bảng lịch trình D thêm "10/01 công khai menu = bắt đầu đặt hàng", "〜10/15 đặt hàng tạm (ngày chưa quyết)", "10/15〜 đặt hàng chính thức (không định ngày)", thay bảng các điểm cần xác nhận (cả tiếng Nhật và tiếng Việt)
