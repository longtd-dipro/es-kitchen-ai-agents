> **Đã đóng băng (tài liệu gốc・2026-10-05). Từ nay không cập nhật.** Quyết định đang có hiệu lực nằm ở `docs/決定台帳.md`. Nội dung của file này được chuyển đi đâu và các quyết định bị thay thế thì xem "G" trong sổ quyết định.

# Quyết định: 3 mẫu cài đặt hàng thay thế và phản ánh xuống hạ nguồn (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long)／Soạn: Claude (Cowork).
> Câu hỏi: `Danh_sách_câu_hỏi_Cài_đặt_hàng_thay_thế_và_ảnh_hưởng_hạ_nguồn_20261001.md` (Q-ALT1〜10). Trả lời: "Hãy chỉ dùng **3 mẫu**. Hãy áp dụng theo **phương án đề xuất**".
> Phản ánh: demo vận hành v1.64 (cài đặt hàng thay thế), `議事録/仕様/代替品対応_詳細要件仕様.md` §7-1 (REQ-ALT-701〜710), bản đặc tả tích hợp v2.3 §13-6, danh sách email X17.
> Tài liệu tương tự trên Mac: `01_仕様/00_Quyết_định/Quyết_định_Cài_đặt_hàng_thay_thế_3_mẫu_và_hạ_nguồn_20261001.md`

## 1. Chỉ có 3 mẫu xử lý (quyết định OPEN-1)

| Mẫu | Chuyến hàng áp dụng | Việc cần làm | Thanh toán |
|---|---|---|---|
| ① Thay thế | Chuyến có ngày xuất hàng sau ngày phát hiện lỗi (cài đặt trước ngày xuất hàng 1 ngày) | Đổi sản phẩm lỗi sang sản phẩm thay thế (1 sản phẩm đổi 1 sản phẩm) | Đơn giá của sản phẩm gốc (#39) |
| ② Bồi thường | Chuyến có ngày xuất hàng từ ngày phát hiện lỗi trở về trước (đã giao) | Giao sản phẩm thay thế (số lượng = số lượng đặt／tồn kho lý thuyết còn lại) | Không thanh toán (dòng 0 yên trong quyết toán theo thực tế) |
| ③ Chỉ loại trừ | Giống ① | Chỉ loại bỏ sản phẩm lỗi. Thông báo "không nằm trong phần đã giao" | Không thanh toán (quyết định 2026/10/01) |

## 2. Phản ánh xuống hạ nguồn (theo đúng phương án đề xuất)

| No | Quyết định |
|---|---|
| Q-ALT1 | **A**: Sửa đồng thời dòng chi tiết của đơn hàng và dữ liệu giao hàng. Ghi nguồn thay thế vào dòng chi tiết (cùng bản ghi với hàng thay thế của sự cố giao hàng) |
| Q-ALT2 | **A**: Đến trước ngày xuất hàng 1 ngày = gửi lại chỉ thị xuất hàng kèm số phiên bản (rev+1). Từ ngày xuất hàng trở đi = ② Bồi thường |
| Q-ALT3 | **C**: Mặc định là thêm vào chuyến tiếp theo. Khi không có chuyến tiếp theo・quá xa (mục tiêu sau 14 ngày)・hoặc Vận hành chọn thì giao hàng bổ sung (phí giao hàng do ES chịu) |
| Q-ALT4 | Thay thế = **A** đơn giá gốc／Bồi thường = **C** dòng 0 yên／Chỉ loại trừ = không thanh toán (quyết định 2026/10/01)／Phí giao hàng của giao bổ sung = **A** ES chịu |
| Q-ALT5 | **A**: Hàng lỗi tại cơ sở được ghi nhận là hủy bỏ và trừ vào tồn kho lý thuyết (không tính là hao hụt quản lý). Chuyến ES giao hàng = tài xế thu hồi・hủy ở chuyến tiếp theo, chuyến COOL = doanh nghiệp khai báo qua kiểm tra tồn kho |
| Q-ALT6 | **A**: Tự động sửa số lượng cần đặt hàng (nếu đã đặt hàng chính thức thì đặt hàng bổ sung). Màn hình đặt hàng có "số lượng hàng thay thế" |
| Q-ALT7 | **C**: Trong cài đặt hàng thay thế chọn "trả hàng cho nhà cung cấp／hủy tại kho", cả hai đều dừng xuất hàng |
| Q-ALT8 | **A**: Thông báo mặc định là gửi (Vận hành có thể bỏ). Email X17 + thông báo của Web doanh nghiệp. Chi tiết giao hàng・phiếu giao hàng・đơn hàng hàng tháng hiển thị "Hàng thay thế (gốc: 〇〇)" |
| Q-ALT9 | **A**: Danh sách giao hàng của ứng dụng tài xế・cổng thông tin nơi nhận ủy thác hiển thị "Hàng thay thế (gốc: 〇〇)" và chỉ thị thu hồi・hủy |
| Q-ALT10 | Nhiệt độ = **A** chỉ cùng nhiệt độ／máy bán hàng tự động = **B** chỉ cảnh báo／Course = **A** chỉ sản phẩm có thể cung cấp theo course của cơ sở |

## 3. Phản ánh vào demo (v1.64) và phần còn lại

- **Đã phản ánh (Vận hành › Quản lý menu › Cài đặt hàng thay thế)**: giải thích 3 mẫu, phân chia ① và ② theo ngày xuất hàng, hiển thị việc gửi lại chỉ thị xuất hàng (rev+1) (demo coi như đã gửi nếu xuất hàng trong vòng 10 ngày kể từ ngày phát hiện), cách giao bồi thường (chuyến tiếp theo・chỉ định ngày・giao bổ sung, khi không có chuyến tiếp theo hoặc quá xa thì tự động giao bổ sung), lô lỗi trong kho (trả hàng／hủy), hàng thay thế chỉ cùng nhiệt độ, cảnh báo máy bán hàng tự động, cách xử lý hàng lỗi tại cơ sở là hủy bỏ, thông báo mặc định là gửi. Khi lưu sẽ hiển thị danh sách "Phản ánh xuống hạ nguồn" (đơn hàng・dữ liệu giao hàng・chỉ thị xuất hàng・đặt hàng・kho・tồn kho cơ sở・thanh toán・khách hàng・hiện trường giao hàng) và để lại phản ánh hạ nguồn trong "Thêm hàng thay thế・bồi thường" của từng đơn hàng.
- **Đã phản ánh vào các màn hình hạ nguồn ở v1.66** (anh Long "hãy đưa vào"): chi tiết dữ liệu giao hàng・chỉ thị xuất hàng (gửi lại)・đặt hàng (số lượng hàng thay thế・đặt hàng bổ sung)・demo thanh toán (dòng 0 yên)・kiểm tra tồn kho・ứng dụng tài xế・cổng thông tin nơi nhận ủy thác・Web doanh nghiệp (thông báo・chi tiết giao hàng・phiếu giao hàng)・nội dung email X17 (bản đề xuất). Ví dụ là ALT-2610-0001. Vì dữ liệu demo của tài xế・nơi nhận ủy thác là riêng nên hiển thị cùng một ví dụ ở chuyến gần nhất
- Xác nhận với khách hàng (anh Aoyama) như §4 (3 mẫu・thanh toán của ③ đã quyết định).

## 4. Trả lời bổ sung (tối 2026/10/01 anh Long)

| No | Trả lời |
|---|---|
| Xác nhận 1 (3 mẫu) | **Phía chúng ta (ES) đã quyết định 3 mẫu**: ① Thay thế／② Bồi thường／③ Chỉ loại trừ. Không xác nhận với khách hàng |
| Xác nhận 2 (thanh toán của ③ chỉ loại trừ) | **Không thanh toán** (bỏ [tạm] và quyết định) |
| OPEN-2 (có thay đổi theo hình thức nhập kho không) | **A Không thay đổi**. Khác biệt được chỉ định bằng thời gian áp dụng và lô. Trước khi lưu kiểm tra tồn kho của sản phẩm thay thế, phần thiếu thì đặt hàng bổ sung để nhập kho rồi mới giao |
| OPEN-3 (2 phương thức bồi thường) | 2 lựa chọn (REQ-ALT-201・202). **A Vận hành chọn theo từng lỗi. Giá trị mặc định là "toàn bộ số lượng đã đặt"** |
| OPEN-4 (cách quyết định chuyến giao) | **A Mặc định là chuyến tiếp theo, và có thể đổi theo từng chuyến sang "chuyến tiếp theo／chuyến sau nữa／giao bổ sung"** |

- Đã phản ánh vào demo v1.67 (thanh toán của ③)・v1.68 (OPEN-2〜4: kiểm tra tồn kho・giá trị mặc định・thay đổi theo từng chuyến). Đặc tả: xử lý hàng thay thế §7-1 (REQ-ALT-711〜713). **Tất cả vấn đề về hàng thay thế đã được quyết định**
