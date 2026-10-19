# Hàng thay thế (xử lý sản phẩm lỗi) — digest ES-STATION
> Nguồn: `65_Hàng_thay_thế/Hàng_thay_thế.md` · Trạng thái: chuẩn (nguồn chuẩn, viết lại 05/10/2026; nếu lệch thì bảng quyết định `決定台帳.md` mục J, B, I là chuẩn) · Digest tạo: 2026-10-08

## 1. Phạm vi & actors
- Xử lý **lỗi của chính sản phẩm** (hư hỏng, lô lỗi), khác với hàng thay thế do sự cố giao hàng (thiếu/hỏng khi giao) -> xem `10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_07_Trouble_và_hàng_thay_thế.md`. [đầu file]
- Actor chính: **vận hành ES** thiết lập từ "Thiết lập hàng thay thế" của quản lý menu (Web vận hành AW_); lưu nháp và xác định tách riêng (REQ-PO-220). [§1]
- Bị ảnh hưởng hạ nguồn: Web doanh nghiệp (CW_, thông báo + màn hình chi tiết giao hàng/phiếu/đơn hàng tháng), Web nhà cung cấp (đặt hàng bổ sung), App tài xế và danh sách giao hàng của nơi giao hàng ủy thác (thu hồi/hủy). [§3-7, §4]
- Kích hoạt khi: phát hiện sản phẩm nhập bị lỗi; hoặc nhập kho thiếu và vận hành chọn "xử lý bằng hàng thay thế" (`55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §8-4). [§1]

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc Nhật/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Hàng thay thế | 代替品 (REQ-ALT-*) | Sản phẩm giao thay sản phẩm lỗi |
| Thay thế / Bồi thường / Chỉ loại trừ | ① ② ③ | 3 cách xử lý duy nhất [§2] |
| Ngày phát hiện | Không có tên Nhật trong tài liệu | Mốc phân chia cách xử lý cùng ngày xuất hàng của chuyến |
| Thời gian đối tượng | Không có tên Nhật trong tài liệu | Khoảng hàng gửi từ ngày bắt đầu đến ngày kết thúc [§3-1] |
| Lô | Không có tên Nhật trong tài liệu | Phạm vi áp dụng: theo lô / tất cả lô [§3-1] |
| Giao hàng bổ sung | Không có tên Nhật trong tài liệu | Chuyến giao riêng, phí ES chịu [§3-5] |
| Chuyến COOL | Không có tên Nhật trong tài liệu | Chuyến giao do doanh nghiệp tự xử lý hàng hủy [§4] |
| Email X17 | X17 | Mẫu email thông báo khách hàng [§3-7] |
- Mã yêu cầu tham chiếu: REQ-ALT-401/402/603/606/701/702/704/705/706/708/709, REQ-PO-220; danh sách vấn đề 4a-8 (03/10/2026). Không có format ID nghiệp vụ riêng trong tài liệu.

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
1. Chỉ có **3 cách xử lý**, do ES quyết định, không xác nhận với khách hàng; không thay đổi theo hình thức nhập kho (2 lần/tháng hay hàng tươi nhập hằng ngày). [§2]
2. **① Thay thế**: áp cho chuyến có ngày xuất hàng **sau** ngày phát hiện; thiết lập **trước ngày xuất hàng 1 ngày**; đổi 1 sản phẩm lấy 1 sản phẩm; tính tiền theo **đơn giá sản phẩm gốc**. [§2]
3. **② Bồi thường**: chuyến có ngày xuất hàng là ngày phát hiện hoặc trước đó (đã giao); giao sản phẩm thay thế **không tính phí**, để lại dòng 0 yên trong quyết toán thực tế. [§2, §4]
4. **③ Chỉ loại trừ**: cùng điều kiện chuyến với ①; chỉ loại sản phẩm lỗi, thông báo "không nằm trong phần giao hàng", không tính phí. [§2]
5. Không gửi cho khách hàng đã kết thúc hợp đồng. [§2, REQ-ALT-603]
6. Phạm vi đối tượng chỉ định bằng thời gian đối tượng + lô (theo lô / tất cả lô); hàng tươi cũng áp được cho tất cả lô. [§3-1]
7. Sản phẩm thay thế: chỉ **cùng nhóm nhiệt độ** và **cung cấp được theo course của cơ sở**; cơ sở máy bán hàng tự động mà sản phẩm không vào máy thì **chỉ cảnh báo** (không chặn). [§3-2]
8. Trước khi lưu phải hiển thị tồn kho kho (dự kiến) của sản phẩm thay thế có đủ không; thiếu thì **đặt hàng bổ sung** để nhập kho rồi mới giao. [§3-3]
9. Số lượng bồi thường do vận hành chọn **theo từng sản phẩm lỗi**: "toàn bộ số lượng đã đặt" (mặc định) hoặc "chỉ phần còn lại (tồn kho lý thuyết)". [§3-4]
10. Chuyến giao bồi thường mặc định là **chuyến kế tiếp**; đổi được theo từng chuyến (kế tiếp / sau nữa / giao hàng bổ sung). Không có chuyến kế tiếp hoặc còn xa (hơn 14 ngày, "theo tham khảo") thì giao hàng bổ sung; **phí giao hàng bổ sung do ES chịu**. [§3-5]
11. Tồn kho lỗi của kho: chọn "trả lại nhà cung cấp" hoặc "hủy tại kho"; cả hai đều **dừng xuất hàng**. [§3-6]
12. Thông báo khách hàng **mặc định gửi** (vận hành có thể bỏ): email X17 + thông báo Web doanh nghiệp; chỉ cơ sở đã đặt sản phẩm tương ứng. [§3-7]
13. Khi lưu phải hiển thị danh sách "phản ánh xuống hạ nguồn". [§4 cuối]
14. Chỉ thị xuất hàng đã gửi: **nâng phiên bản và gửi lại** đến trước ngày xuất hàng 1 ngày; từ ngày xuất hàng trở đi là ② Bồi thường. [§4, REQ-ALT-702]
15. Tồn kho cơ sở: hàng lỗi còn lại được ghi nhận là **hủy** (trừ khỏi tồn kho lý thuyết, không tính hao hụt quản lý). Chuyến ES: tài xế thu hồi/hủy ở chuyến sau; chuyến COOL: doanh nghiệp tự hủy và khai báo qua báo cáo kiểm kê. [§4, REQ-ALT-705]
16. Thanh toán: phần thuế của phần thay thế tách vào **dòng 8%**. [§4, REQ-ALT-704, 4a-8]

## 4. Trạng thái & dữ liệu chính
- Máy trạng thái: **Không có trong tài liệu**. Chỉ nêu "lưu nháp" và "xác định" tách riêng (REQ-PO-220) [§1], không định nghĩa giá trị trạng thái/ai chuyển.
- Thực thể/dữ liệu được nhắc (không có tên bảng/cột): thiết lập hàng thay thế (đối tượng, cách xử lý, sản phẩm thay thế, số lượng, chuyến giao); chi tiết đơn hàng/giao hàng có trường **nguồn thay thế** [§4, REQ-ALT-701]; chỉ thị xuất hàng có phiên bản [§4]; đơn đặt hàng có "Số lượng hàng thay thế" [§4, REQ-ALT-706]; dòng 0 yên trong quyết toán thực tế [§2].
- Hiển thị: "Hàng thay thế (gốc: 〇〇)" ở chi tiết giao hàng, phiếu giao hàng, đơn hàng hằng tháng (REQ-ALT-708) và ở App tài xế + danh sách nơi giao hàng ủy thác kèm chỉ thị thu hồi/hủy (REQ-ALT-709). [§4]

## 5. Liên kết với nhóm khác & hệ thống ngoài
- `10_Giao_hàng/.../Giao_hàng_07_Trouble_và_hàng_thay_thế.md`: hàng thay thế do sự cố giao hàng (ghi nhận nguồn thay thế dùng chung kiểu). [đầu file, §4]
- `55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §8-4: nhập kho thiếu -> xử lý bằng hàng thay thế. [§1]
- Hạ nguồn: đơn hàng/giao hàng, chỉ thị xuất hàng, đặt hàng (kể cả đặt hàng bổ sung), tồn kho cơ sở, thanh toán/quyết toán, Web doanh nghiệp, App tài xế. [§4]
- Quản lý menu (chứa màn "Thiết lập hàng thay thế"). [§1]
- Hệ thống ngoài (THOMAS/Yamato/Bill One/HubSpot/Cognito): Không có trong tài liệu.
- Nguồn quyết định: `docs/決定台帳.md` (J, B, I); bản gốc đóng băng: `docs/議事録_仕様/代替品対応_詳細要件仕様.md` (REQ-ALT), `代替品対応_お客様確認シート.md`, danh sách câu hỏi và quyết định ngày 01/10/2026. [đầu file]

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
- Không có điểm mở: toàn bộ OPEN-1〜5 đã quyết định ngày 01/10/2026. [§5]
- Phần triển khai chi tiết còn lại (vd đưa đặt hàng bổ sung hàng thay thế lên trang web nhà cung cấp) được theo dõi ở `docs/決定の受付簿.md`, tài liệu không nêu nội dung cụ thể. [§5]
- Ngưỡng "hơn 14 ngày" ghi là "theo tham khảo", chưa rõ có phải giá trị cứng không (suy luận). [§3-5]

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Cách xử lý (①②③) có được suy ra tự động từ ngày phát hiện vs ngày xuất hàng của từng chuyến, hay vận hành chọn tay? Tài liệu chỉ nói "phân chia theo" ngày. [§2]
2. Ranh giới ngày: "trước ngày xuất hàng 1 ngày" tính theo ngày lịch hay giờ cắt? Chuyến đúng ngày phát hiện là ② (đã giao). [§2, §4]
3. Màn thiết lập phải có: thời gian đối tượng, lô, kiểm tra nhóm nhiệt độ/course, cảnh báo máy bán hàng tự động, hiển thị tồn kho dự kiến, chọn số lượng bồi thường theo từng sản phẩm, đổi chuyến theo từng chuyến, chọn trả/hủy tồn lỗi, tùy chọn gửi thông báo, danh sách phản ánh hạ nguồn. [§3, §4]
4. Lưu nháp vs xác định (REQ-PO-220): hỏi PM các trạng thái và quyền, vì tài liệu không định nghĩa máy trạng thái. [§1]
5. Sau đặt hàng chính thức thì đặt hàng bổ sung: đối chiếu nhóm 55 và trang web nhà cung cấp (chi tiết đang theo dõi riêng). [§4, §5]
6. Thanh toán: dòng 0 yên cho ②③, đơn giá gốc cho ①, tách thuế 8% -- kiểm tra với nhóm thanh toán/quyết toán. [§2, §4]
7. Tài xế/hiện trường: chỉ thị thu hồi/hủy cho chuyến ES; chuyến COOL doanh nghiệp tự hủy và khai báo qua báo cáo kiểm kê. Cần luồng riêng theo loại chuyến. [§4]
8. Loại trừ khách hàng đã kết thúc hợp đồng khỏi danh sách gửi/áp dụng. [§2]
