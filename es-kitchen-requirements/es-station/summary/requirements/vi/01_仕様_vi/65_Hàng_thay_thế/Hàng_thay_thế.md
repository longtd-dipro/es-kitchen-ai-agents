# Hàng thay thế (xử lý sản phẩm lỗi)

> **Nguồn chuẩn của chủ đề này.** Ngày 05/10/2026, đã viết lại mới chỉ gồm "những điều đang có hiệu lực" từ các bản gốc và quyết định dưới đây.
> Các quyết định đang có hiệu lực hiện nay là `docs/決定台帳.md` (**J**, B "Xử lý hàng thay thế", I "Ghi nhận nhập kho và chênh lệch"). Nếu có điểm không khớp thì bảng tổng hợp quyết định là chuẩn.
> Bản gốc (đóng băng・chỉ để xem quá trình): `docs/議事録_仕様/代替品対応_詳細要件仕様.md` (REQ-ALT), `docs/議事録_仕様/代替品対応_お客様確認シート.md`, `Danh_sách_câu_hỏi_Cài_đặt_hàng_thay_thế_và_ảnh_hưởng_hạ_nguồn_20261001.md`, `00_Quyết_định/Quyết_định_Cài_đặt_hàng_thay_thế_3_mẫu_và_hạ_nguồn_20261001.md`.
> Hàng thay thế được đưa ra trong sự cố giao hàng (khi giao bị thiếu・hư hỏng, v.v.) xem `10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_07_Trouble_và_hàng_thay_thế.md`. Ở đây là vấn đề **lỗi của chính sản phẩm** (hư hỏng・lô bị lỗi, v.v.).

## 1. Dùng khi nào

- Phát hiện sản phẩm đã nhập bị lỗi (lỗi theo lô, hoặc vấn đề của chính sản phẩm nên áp dụng cho tất cả các lô).
- Khi nhập kho bị thiếu sản phẩm và vận hành chọn "xử lý bằng hàng thay thế" (`55_Đặt_hàng_Nhập_mua_Nhập_kho/Đặt_hàng_Nhập_mua_Nhập_kho.md` §8-4).
- Vận hành thiết lập từ "Thiết lập hàng thay thế" của quản lý menu. Tách riêng lưu nháp và xác định (REQ-PO-220).

## 2. Chỉ có 3 cách xử lý

Phân chia theo ngày phát hiện lỗi (ngày phát hiện) và ngày xuất hàng của chuyến. Không thay đổi theo hình thức nhập kho (2 lần mỗi tháng／hàng tươi nhập mỗi ngày).

| Cách xử lý | Chuyến đối tượng | Việc thực hiện | Thanh toán |
|---|---|---|---|
| **① Thay thế** | Ngày xuất hàng sau ngày phát hiện (thiết lập **trước ngày xuất hàng 1 ngày**) | Đổi sản phẩm lỗi sang sản phẩm thay thế (**1 sản phẩm đổi 1 sản phẩm**) | Tính theo **đơn giá của sản phẩm gốc** |
| **② Bồi thường** | Ngày xuất hàng là ngày phát hiện hoặc trước đó (đã giao hàng rồi) | Giao sản phẩm thay thế | **Không tính phí** (để lại dòng 0 yên trong quyết toán thực tế) |
| **③ Chỉ loại trừ** | Giống ① | Chỉ loại sản phẩm lỗi ra. Thông báo cho khách hàng "không nằm trong phần giao hàng" | **Không tính phí** |

- 3 cách này do ES quyết định (không xác nhận với khách hàng).
- Không gửi cho khách hàng đã kết thúc hợp đồng (REQ-ALT-603).

## 3. Những điều quyết định khi thiết lập

| # | Hạng mục | Quy định | Căn cứ |
|---|---|---|---|
| 3-1 | Phạm vi đối tượng | Chỉ định bằng **thời gian đối tượng (hàng gửi từ ngày bắt đầu〜ngày kết thúc)** và **lô** (theo lô／tất cả lô). Hàng tươi cũng có thể áp dụng cho tất cả lô | REQ-ALT-606・401・402 |
| 3-2 | Sản phẩm thay thế | Chỉ sản phẩm **cùng nhóm nhiệt độ**・chỉ sản phẩm **có thể cung cấp theo course của cơ sở**. Với cơ sở máy bán hàng tự động, sản phẩm không vào máy bán hàng tự động thì **chỉ cảnh báo** | Bảng tổng hợp J |
| 3-3 | Tồn kho của sản phẩm thay thế | Trước khi lưu, hiển thị xem tồn kho kho (dự kiến) có đủ không. Phần thiếu thì **đặt hàng bổ sung** để nhập kho rồi mới giao | Bảng tổng hợp J |
| 3-4 | Số lượng bồi thường | "Toàn bộ số lượng đã đặt" hoặc "chỉ phần còn lại (tồn kho lý thuyết)" do **vận hành chọn cho từng sản phẩm lỗi**. Giá trị ban đầu là "toàn bộ số lượng đã đặt" | Bảng tổng hợp J |
| 3-5 | Chuyến giao bồi thường | **Giá trị ban đầu là chuyến kế tiếp**. Trong danh sách đơn hàng đối tượng, có thể đổi theo từng chuyến thành "chuyến kế tiếp／chuyến sau nữa／giao hàng bổ sung". Nếu không có chuyến kế tiếp hoặc còn xa (hơn 14 ngày theo tham khảo) thì giao hàng bổ sung. **Chi phí giao hàng của giao hàng bổ sung do ES chịu** | Bảng tổng hợp J |
| 3-6 | Tồn kho lỗi của kho | Chọn "trả lại nhà cung cấp／hủy tại kho". Cả hai đều **dừng xuất hàng** | Bảng tổng hợp J |
| 3-7 | Thông báo cho khách hàng | **Mặc định là gửi** (vận hành có thể bỏ). Email X17 ＋ thông báo trên Web doanh nghiệp. Chỉ các cơ sở đã đặt sản phẩm tương ứng | Bảng tổng hợp J |

## 4. Những thứ được sửa theo khi lưu (hạ nguồn)

| Nơi được sửa | Nội dung | Căn cứ |
|---|---|---|
| Dữ liệu đơn hàng・giao hàng | Sửa đồng thời chi tiết. Để lại **nguồn thay thế** trong chi tiết (giống ghi nhận hàng thay thế của sự cố giao hàng) | REQ-ALT-701 |
| Chỉ thị xuất hàng | Nếu đã gửi thì **nâng phiên bản và gửi lại** cho đến trước ngày xuất hàng 1 ngày. Từ ngày xuất hàng là ② Bồi thường | REQ-ALT-702 |
| Đặt hàng | Thêm số lượng cần của sản phẩm thay thế, giảm sản phẩm lỗi. Nếu sau đặt hàng chính thức thì **đặt hàng bổ sung**. Màn hình đặt hàng có "Số lượng hàng thay thế" | REQ-ALT-706 |
| Tồn kho cơ sở | Hàng lỗi còn lại ở cơ sở được **ghi nhận là hủy** và trừ khỏi tồn kho lý thuyết (không tính là hao hụt quản lý). Chuyến giao ES ＝ tài xế thu hồi・hủy ở chuyến sau, chuyến COOL ＝ doanh nghiệp tự hủy và khai báo qua báo cáo kiểm kê | REQ-ALT-705 |
| Thanh toán | Như bảng ở §2. Phần thuế của phần thay thế được tách vào dòng 8% | REQ-ALT-704, danh sách vấn đề 4a-8 (03/10/2026) |
| Màn hình của khách hàng | "Hàng thay thế (gốc: 〇〇)" trong chi tiết giao hàng・phiếu giao hàng・đơn hàng hằng tháng | REQ-ALT-708 |
| Hiện trường giao hàng | "Hàng thay thế (gốc: 〇〇)" và chỉ thị thu hồi・hủy trong ứng dụng tài xế・danh sách giao hàng của nơi giao hàng ủy thác | REQ-ALT-709 |

- Khi lưu, hiển thị danh sách "phản ánh xuống hạ nguồn" ở trên.

## 5. Những điều chưa quyết định

Không có (ngày 01/10/2026 đã quyết định toàn bộ OPEN-1〜5). Phần còn lại của triển khai chi tiết (đưa đặt hàng bổ sung hàng thay thế lên trang web nhà cung cấp, v.v.) được theo dõi tại `docs/決定の受付簿.md`.
