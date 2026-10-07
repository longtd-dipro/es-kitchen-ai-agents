> **Đã đóng băng (bản gốc · 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định đã bị thay thế, xem mục "G" của sổ cái.

# Quyết định: STEP3 bổ sung Thiếu sót của Master Tùy chọn · Giảm giá (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Là câu trả lời cho việc xác nhận thiếu sót của Master Tùy chọn · Giảm giá ở STEP3 (O1~O13 · hạng mục còn thiếu · Q-A~Q-E).
> Căn cứ: "(Tạm) Bảng danh sách tùy chọn đang soạn" của khách hàng (đích liên kết của dòng 52 Phase2 bảng yêu cầu. Tiêu đề là [Đề xuất tạm]), bảng yêu cầu (dòng 113 · 156 · 174), danh sách hạng mục master, demo vận hành.
> **Tài liệu này chỉ là bản ghi quyết định. Demo · đặc tả chưa được sửa** (do phiên khác đang cập nhật). Bản trước khi phản ánh để lại ở `02_デモ/履歴/`.
> Khi mâu thuẫn với `Quyết_định_STEP3_Trả_lời_Master_và_Thanh_toán_20261001.md` thì ưu tiên tài liệu này (Q4 · số tiền của trụ sở chính).

## 1. Thêm Tùy chọn (những mục được đánh giá là "thiếu" thì thêm)

ID là số thứ tự tạm (OP000024~). Sẽ xác định khi phản ánh. Những mục chưa quyết số tiền thì "Loại số tiền = nhập mỗi lần" (Q-D).

| ID tạm | Tên tùy chọn (đề xuất) | Phân loại | Loại phí | Loại số tiền | Đối tượng (course · loại dòng máy) | Căn cứ |
|---|---|---|---|---|---|---|
| OP000024 | Phí xuất động khẩn cấp | Giao hàng | Phí một lần | Nhập mỗi lần | Tất cả | Bảng danh sách E7 (O1) |
| OP000025 | Phí công việc đặc biệt (nâng bằng tay) | Lắp đặt · công việc | Phí một lần | Nhập mỗi lần | Máy bán hàng tự động | Bảng danh sách B21 (O2) |
| OP000026 | Phí công việc đặc biệt (dùng cần cẩu) | Lắp đặt · công việc | Phí một lần | Nhập mỗi lần | Máy bán hàng tự động | Bảng danh sách B22 (O2) |
| OP000027 | Phí công việc đặc biệt (khác) | Lắp đặt · công việc | Phí một lần | Nhập mỗi lần | Máy bán hàng tự động | Bảng danh sách B23 (O2) |
| OP000028 | Chi phí khảo sát trước vị trí lắp đặt | Lắp đặt · công việc | Phí một lần | Nhập mỗi lần | Máy bán hàng tự động | Bảng danh sách B24 (O3). Liên quan đến khảo sát hiện trường máy bán hàng tự động (kiểm tra 09/30 B2) |
| OP000029 | Thay thế do hỏng (cùng kích thước) | Lắp đặt · công việc | Phí một lần | Cố định ¥0 | Tủ lạnh · tủ đông | Bảng danh sách E19 (O5) |
| OP000030 | Phí máy bán hàng tự động | Văn phòng | Phí hàng tháng | Nhập mỗi lần | Máy bán hàng tự động | Bảng yêu cầu dòng 113 (O10) |
| OP000031 | Phí mua đứt món ăn | Văn phòng | Phí một lần | Nhập mỗi lần | Tất cả | Bảng yêu cầu dòng 113 (O10). Liên quan đến "mua đứt món ăn" ở dòng 7 Phase3 |
| OP000032 | Thuê tủ đông (khách hàng hiện có · theo kích thước) | Lắp đặt · công việc | Phí hàng tháng | Nhập mỗi lần | ES Standard | Bảng yêu cầu dòng 174 (trạng thái: DIPRO xác nhận) · Danh sách hạng mục master ứng viên 11 (O11) |
| OP000033 | Chi phí ban đầu tủ đông (khách hàng hiện có) | Lắp đặt · công việc | Phí một lần | Cố định ¥20,000 | ES Standard | Bảng yêu cầu dòng 174 · Danh sách hạng mục master ứng viên 12 (O11) |
| OP000034 | Giao hàng bổ sung (một lần · 1 lượt) | Giao hàng | Phí một lần | Cố định ¥5,000 | Tất cả | Bảng danh sách E8 (O8 · Q-B) |

- **O13 Phí sử dụng chế độ khách**: giữ OP000003, đổi loại số tiền thành "Nhập mỗi lần" (cho đến khi số tiền được quyết định).
- **Q-A (Đính chính Q4)**: không bỏ OP000010. Đổi tên và ý nghĩa thành "Đổi tủ lạnh (theo nhu cầu khách hàng)" (phí một lần · nhập mỗi lần. Bảng danh sách E20) và giữ lại. Chênh lệch kích thước (hàng tháng) chỉ thanh toán bằng OP000023.
- **Q-B**: Thêm số lần giao hàng (hàng tháng · OP000001 ¥3,000/lần) và giao hàng bổ sung một lần (OP000034 ¥5,000) là hai thứ khác nhau.
- Những mục không được đánh giá là "thiếu" (O6 Di chuyển hành lý = OP000015, O7 Dịch vụ lắp đặt = OP000007) giữ nguyên hiện tại. O12 xem §6.

## 2. Phí hàng tháng máy bán hàng tự động (Q-C: A)

- Điều chỉnh giá của ES Lite (máy bán hàng tự động) trong Master gói theo **¥48,000** của tài liệu khách hàng (phí sử dụng hàng tháng · đơn vị khuyến nghị kiểu F-1, bảng danh sách B19 · C19).
- Nơi áp dụng là **gói 100 (ES000004)** (bảng danh sách chỉ có một số tiền). Giá máy bán hàng tự động của gói 150 · 200 · 300 (hiện là ¥74,000 · ¥96,000 · ¥139,000) cần xác nhận.
- **Đính chính phí hàng tháng của trụ sở chính thành ¥53,000** (ES Lite (máy bán hàng tự động) 100 ¥48,000 + phí giao hàng khu vực ¥4,000 + ES-QR ¥1,000). Thay thế ¥57,000 của câu trả lời STEP3.

## 3. Thêm hạng mục (cột) của master (Q-E: A)

### Master Tùy chọn
| Hạng mục (đề xuất) | Nội dung |
|---|---|
| Loại số tiền | Cố định / Từ số tiền tối thiểu (từ ○○ yên~) / Nhập mỗi lần (mỗi lần gắn vào hợp đồng con thì nhập số tiền) / Theo từng cơ sở / Xác định theo chênh lệch. Khi là "Nhập mỗi lần" hoặc "Từ số tiền tối thiểu" thì bắt buộc nhập số tiền khi gắn vào hợp đồng con |
| Course đối tượng | ES Standard / ES Lite (tủ lạnh) / ES Lite (máy bán hàng tự động) (chọn nhiều · để trống = tất cả). Không thể chọn ở hợp đồng con của cơ sở ngoài đối tượng |
| Loại dòng máy đối tượng | Tủ lạnh / tủ đông / máy bán hàng tự động, v.v. (chọn nhiều · để trống = tất cả) |
| Phê duyệt | **Không giữ người phê duyệt cụ thể. Bất kỳ quản trị viên vận hành có thẩm quyền nào cũng có thể đăng ký · phê duyệt** (không áp dụng "phê duyệt của MG Hayashi" ở B15 bảng danh sách. Giống quyết định nâng kích thước tủ lạnh của STEP1) |

### Master Giảm giá
| Hạng mục (đề xuất) | Nội dung |
|---|---|
| Phân loại tính toán "Tham chiếu phí gói" | Lấy phí hàng tháng tương ứng trong Master gói của gói · course tham chiếu (ví dụ: DC000013 = ES000003 gói 50 · ES Lite (tủ lạnh)) làm số tiền giảm giá. Không vượt quá số tiền hóa đơn (STEP3 Q3) |
| Gói · course đối tượng | Gói · course có thể gắn (ví dụ: DC000003 = chỉ ES Standard) |
| Giới hạn số lần | Tối đa bao nhiêu lần cho mỗi doanh nghiệp / mỗi cơ sở (ví dụ: DC000013 = 1 lần cho mỗi doanh nghiệp) |
| Điều kiện tự động gắn | Ví dụ: nếu loại hợp đồng = chiến dịch dùng thử thì tự động gắn DC000013 |
| Thời gian tiếp nhận | Thời gian có thể gắn (ngày bắt đầu · ngày kết thúc). Dùng cho chiến dịch. Khác với số tháng áp dụng |

## 4. Đối tượng khi phản ánh

- Master Tùy chọn · Giảm giá (danh sách · màn hình chỉnh sửa · định nghĩa hạng mục), "Biến động tùy chọn · giảm giá" của hợp đồng con (lựa chọn và nhập số tiền), lựa chọn tùy chọn của demo đơn đăng ký, demo thanh toán, Master gói (giá máy bán hàng tự động), số tiền của trụ sở chính (toàn bộ màn hình · Web doanh nghiệp), danh sách hạng mục master (ứng viên tùy chọn · ứng viên giảm giá · định nghĩa hạng mục).

## 5. Những điều chưa quyết định

- Giá máy bán hàng tự động của gói 150 · 200 · 300 (phạm vi áp dụng của Q-C)
- Bảng yêu cầu dòng 174 (phí tủ đông) vẫn là "DIPRO xác nhận". OP000032 · 033 sẽ nhập số tiền sau khi xác định
- Bảng danh sách của khách hàng là [Đề xuất tạm] nên tên · số tiền của các tùy chọn đã thêm cũng sẽ được xác nhận với khách hàng

## 6. Quyết định bổ sung (2026/10/01)

- **O12 Khách dùng tiền mặt**: tạm thời đăng ký vào tùy chọn với **0 yên** tạm (loại liên động A · hạng mục hợp đồng = khách dùng tiền mặt). Khi cần thu phí thì sau đó đặt số tiền (việc sửa đổi phí là ghi đè + lịch sử thay đổi. Theo quy tắc sửa đổi Master Tùy chọn (2026/09/28)). "O12 chưa quyết" ở §5 được giải quyết bằng điều này.
