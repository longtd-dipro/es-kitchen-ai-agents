# Đặt hàng · Trang nhà cung cấp · Nhập kho

> **Tài liệu chuẩn của chủ đề này.** Ngày 2026-10-05, chỉ tổng hợp lại "những gì đang có hiệu lực" từ tài liệu gốc và các quyết định bên dưới rồi viết mới.
> Các quyết định đang có hiệu lực nằm trong `docs/決定台帳.md` (chủ đề này là **I**, liên quan E・H・J). Nếu có mâu thuẫn thì sổ cái quyết định là chuẩn.
> Tài liệu gốc (đóng băng, chỉ để xem lịch sử): `docs/議事録_仕様/発注仕入入荷_詳細要件仕様.md` (REQ-PO. Diễn biến và lịch sử thay đổi theo từng cuộc họp), `00_Quyết_định/Quyết_định_STEP6_Trả_lời_Đặt_hàng_Nhà_cung_cấp_20261001.md`・`Quyết_định_STEP6_Bổ_sung_Trả_lời_OPEN_và_xác_nhận_nhập_kho_20261001.md`・`Quyết_định_Xác_nhận_tài_liệu_giải_thích_kịch_bản_20261002.md`.
> Tồn kho・kiểm kê xem `60_Tồn_kho/Tồn_kho.md`, hàng thay thế xem `65_Hàng_thay_thế/Hàng_thay_thế.md`, nội dung email xem `30_Đơn_yêu_cầu/Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md`.

## 1. Luồng tổng thể và thời điểm

```
Tạo menu → Đặt hàng tạm (trước khi công khai menu) → Công khai・nhận đơn (ngày 1〜15 của tháng trước)
 → Đặt hàng chính nửa đầu (phần các chuyến tuần A・B) → Nhà cung cấp phê duyệt → Báo cáo xuất hàng → Ghi nhận nhập kho → Tồn kho kho → Picking・xuất hàng
 → Đặt hàng chính nửa sau (phần các chuyến tuần C・D) → (tương tự)
```

| Mốc | Khi nào | Căn cứ |
|---|---|---|
| Đặt hàng tạm | **Trước khi công khai menu** (điều kiện công khai có "phê duyệt đặt hàng tạm"). Là việc nhờ nhà cung cấp chuẩn bị trước một lượng nhất định | Sổ cái I |
| Đặt hàng chính nửa đầu | Phần các chuyến tuần A・B. **B5〜C1 của chu kỳ trước** | Sổ cái I |
| Đặt hàng chính nửa sau | Phần các chuyến tuần C・D. **D5〜A1 của chu kỳ kế tiếp** | Sổ cái I |
| Nhắc nhở đặt hàng chính | Vào đầu kỳ và ngày cuối kỳ, thông báo cho vai trò **quản lý hệ thống** của vận hành | Sổ cái E |
| Đặt hàng bổ sung | Phần tăng thêm sau hạn chót đặt đơn (đơn tự động của gói dùng thử・đơn đăng ký được phê duyệt sau hạn chót・phần bổ sung sau khi chốt mẫu kinh doanh・hàng thay thế). Tạo thành **dữ liệu đặt hàng mới (đặt hàng chính)** và lưu lại lý do. Ngày cơ sở là B7・D7 | Sổ cái I・H・J |
| Vật tư | Không có đặt hàng tạm. **Chỉ đặt hàng chính・theo từng lần** (§9) | Sổ cái I |

- Việc chốt đặt hàng **tự động theo hạn chót đặt đơn**. Không có thao tác chốt hoặc hủy chốt thủ công (REQ-PO-108・109).
- Việc dời ngày của chuyến đã qua thời điểm đặt hàng chính có giới hạn (từng chuyến một・bắt buộc nêu lý do・trong cùng một nửa 〈A↔B／C↔D〉. Sang chu kỳ khác・nửa khác chỉ khi xử lý sự cố). Xem đặc tả giao hàng.

## 2. Số lượng cần và số lượng đặt

| # | Quy tắc | Căn cứ |
|---|---|---|
| 2-1 | **Số lượng cần = đơn của các cơ sở thuộc hợp đồng + đơn dùng thử + mẫu kinh doanh**. Tổng hợp theo từng kho (Kanto・Kansai), **đặt hàng theo từng kho**. Sản phẩm và kho là quan hệ nhiều-nhiều | REQ-PO-103・212 |
| 2-2 | Trong phần chi tiết, **phần của hợp đồng đăng ký tạm được tách ra hiển thị là "tạm"**. Không tạo dữ liệu giao hàng có ngày gửi trống (lỗi) | REQ-PO-612 |
| 2-3 | Màn hình hiển thị cùng lúc số lượng theo từng ngày và tổng theo từng nửa chu kỳ (nửa đầu・nửa sau) | REQ-PO-110 |
| 2-4 | Không hiển thị "dự đoán" số lượng đặt. Hiển thị **số lượng đặt hàng・đơn hàng 2〜3 lần gần nhất** để tham khảo, con người quyết định. Số tham khảo cho đặt hàng tạm: lịch sử 1 tháng = tỷ lệ tăng, nhiều tháng = trung bình có trọng số + tỷ lệ tăng (tỷ lệ tăng là mức tăng tổng số của gói) | REQ-PO-101・102 |
| 2-5 | Sản phẩm có lot (số lượng mỗi gói) thì số lượng cần được **làm tròn lên theo đơn vị lot** (có thể sửa tay) | REQ-PO-105 |
| 2-6 | Không có ô số lượng dự phòng. Cộng thêm bằng **nút +3／+5／+10** và nhập tay | REQ-PO-104 (hủy)・402 |
| 2-7 | Chu kỳ đặt hàng cơ bản gồm 2 kỳ: nửa đầu・nửa sau. Sản phẩm có hạn tiêu thụ ngắn có thể chia thành **4 kỳ・theo tuần** v.v. | REQ-PO-401 |
| 2-8 | Giá trị mặc định của ngày nhập kho mong muốn là **ngày hôm đó** (tính ngược từ lịch picking). Có nút chọn 1 ngày trước・2 ngày trước | REQ-PO-404 |
| 2-9 | Chi tiết đặt hàng không hiển thị cột "Slot" và "ngày giao cho khách" (tính theo ngày picking) | REQ-PO-403 |
| 2-10 | Chọn sản phẩm trong danh sách, chỉ định ngày nhập kho mong muốn (khoảng thời gian) để **đặt hàng tạm hàng loạt**. Các sản phẩm theo tuần như salad được đặt ở màn hình chi tiết. Chỉ đặt hàng loạt được những sản phẩm có cùng ngày nhập kho mong muốn・hạn dùng | REQ-PO-201・203・205・406 |
| 2-11 | Hiển thị **màn hình xác nhận** trước khi chốt đặt hàng | REQ-PO-405 |
| 2-12 | Sản phẩm không có trong menu (bánh kẹo・nước sốt trộn salad v.v.) cũng có thể đặt từ "Thêm sản phẩm" | REQ-PO-113 |
| 2-13 | Nội dung ghi chú cố định (ngày sản xuất・giao buổi sáng v.v.) được nhập bằng ô chọn hoặc tự động điền, có thể sửa riêng từng cái | REQ-PO-206 |
| 2-14 | Số đặt hàng: thông thường = `PO-YYYYMM-mã hàng-U01`, hạn tiêu thụ ngắn = `PO-YYYYMM-mã hàng-ký hiệu kho+Slot`. Không đưa ký hiệu chu kỳ (nửa đầu・nửa sau) vào | Sổ cái I |

## 3. Trạng thái đặt hàng

`Đặt hàng tạm → Chờ phản hồi ngày giao → Đã phản hồi ngày giao → Đặt hàng chính → Chờ phê duyệt đặt hàng chính → Đã phê duyệt đặt hàng chính → Đã xuất hàng → Đã nhập kho`
Ngoài ra còn **Không nhận đơn** (phản hồi của nhà cung cấp) và **Hủy** (vận hành). (REQ-PO-111)

| Trạng thái hiện tại | Ai・làm gì | Trạng thái kế tiếp |
|---|---|---|
| Đặt hàng tạm (chờ phản hồi ngày giao) | Nhà cung cấp phản hồi ngày giao | Đã phản hồi ngày giao |
| Đã phản hồi ngày giao | Vận hành đặt hàng chính (thời điểm xem §1) | Chờ phê duyệt đặt hàng chính |
| Chờ phê duyệt đặt hàng chính | Nhà cung cấp nhập **ngày giao hàng・số thùng nhập kho・hạn sử dụng (bắt buộc)** rồi phê duyệt (vận hành cũng có thể nhập thay) | Đã phê duyệt đặt hàng chính |
| Chờ phản hồi ngày giao・Chờ phê duyệt đặt hàng chính | Nhà cung cấp không nhận đơn (chọn lý do・bắt buộc nhập bình luận) | Không nhận đơn → Vận hành sắp xếp sang nhà cung cấp khác hoặc hủy |
| Đã phê duyệt đặt hàng chính | Nhà cung cấp báo cáo xuất hàng | Đã xuất hàng |
| Đã xuất hàng | Ghi nhận nhập kho (§8) | Đã nhập kho (nếu có chênh lệch thì chờ xử lý) |
| Bất kỳ trạng thái nào | Vận hành hủy | Hủy (không xóa・vẫn giữ trên màn hình của nhà cung cấp) |

## 4. Thời hạn có thể sửa・Hủy

| # | Quy tắc | Căn cứ |
|---|---|---|
| 4-1 | Vận hành có thể sửa số lượng **cho đến khi nhà cung cấp phê duyệt đặt hàng chính** (đặt hàng tạm thì nhờ nhà cung cấp phản hồi lại, đặt hàng chính thì nhờ nhà cung cấp phê duyệt lại) | Sổ cái I |
| 4-2 | Sau khi phê duyệt thì không sửa được. **Tăng = đặt hàng bổ sung, giảm = hủy rồi đặt lại** | Sổ cái I |
| 4-3 | Việc đã sửa・hủy・bổ sung được lưu kèm số lượng vào tab "Lịch sử thay đổi" trong chi tiết đặt hàng | REQ-PO-304 |
| 4-4 | Sau khi phê duyệt đặt hàng chính, nếu khi nhập kho phát hiện sản phẩm bị thiếu thì **không tự động giảm**. Vận hành chọn cách xử lý (§8) | Sổ cái I |

## 5. Trang nhà cung cấp

| # | Quy tắc | Căn cứ |
|---|---|---|
| 5-1 | Tên danh sách là **"Danh sách đơn nhận"** (màn hình và tên trạng thái của vận hành không đổi) | REQ-PO-620 |
| 5-2 | **Không hiển thị số tiền** (đơn giá nhập・số tiền đặt hàng・tổng hợp・số tiền trong CSV) | Sổ cái I |
| 5-3 | Tên sản phẩm là **tên dành cho nhà cung cấp** (không phải tên công khai) | Sổ cái I |
| 5-4 | Không hiển thị ranh giới nửa đầu・nửa sau (hiển thị theo ngày nhập kho mong muốn) | REQ-PO-207 |
| 5-5 | Phê duyệt đặt hàng chính: ngày giao hàng (ngày hàng đến kho)・số thùng nhập kho・hạn sử dụng. Chưa phê duyệt thì không báo cáo xuất hàng được | Sổ cái I・E |
| 5-6 | **Giao từng phần**: từ "Yêu cầu giao từng phần" của mỗi đơn đặt hàng, nhập ngày và số lượng cho từng lần. **Không cần vận hành phê duyệt** (vận hành chỉ nhận thông báo trên màn hình・không có email). Ngày giao của mỗi lần tối đa đến ngày nhập kho mong muốn ban đầu・**tối đa 3 lần** (có thể đổi bằng cài đặt của vận hành). Ngoài phạm vi thì không đăng ký được | Sổ cái I, REQ-PO-303 |
| 5-7 | **Báo cáo xuất hàng**: phương thức giao (giao thẳng 〈dùng công ty vận chuyển〉／giao bằng xe công ty／mang đến kho. **Bắt buộc**)・công ty vận chuyển (chọn từ danh sách)・số vận đơn (**tùy chọn**)・hạn sử dụng. Phương thức giao・công ty vận chuyển lấy giá trị lần trước làm mặc định | Sổ cái I・E, REQ-PO-135・619 |
| 5-8 | Nếu số thùng nhập kho × số lượng mỗi thùng (lot) không khớp với số lượng thì hiển thị xác nhận (vẫn cho tiếp tục). Nếu số thùng nhiều hơn số lượng thì không đăng ký được | REQ-PO-609 |
| 5-9 | Sản phẩm có hạn tiêu thụ ngắn xuất hàng mỗi ngày, nên **nhập・lưu hàng loạt ở danh sách xuất hàng**, và có thể **chuyển hàng loạt sang đã xuất hàng** các đơn đã đánh dấu | REQ-PO-621 |
| 5-10 | Hạn mong muốn chỉ hiển thị giá trị gửi từ vận hành (ngày giao cho khách + số ngày bảo đảm). Tên ô: hạn tiêu thụ ngắn = "Hạn tiêu thụ mong muốn", thông thường = "Hạn sử dụng mong muốn" | Sổ cái I |
| 5-11 | **1 công ty 1 tài khoản**. Người phụ trách (chính・phụ) là nhiều địa chỉ nhận email. Đặt lại mật khẩu bằng mã xác thực (sổ cái K) | Sổ cái I・K |
| 5-12 | Hồ sơ khi lưu sẽ được đưa thẳng vào master của vận hành (không cần vận hành phê duyệt) | Sổ cái I |

## 6. Master nhà cung cấp và đăng ký

| # | Quy tắc | Căn cứ |
|---|---|---|
| 6-1 | Nhà cung cấp có thể đăng ký từ biểu mẫu (tên đứng danh nghĩa・địa chỉ・điện thoại・người phụ trách・có coi thứ Bảy, Chủ nhật, ngày lễ là ngày làm việc hay không). Vận hành phê duyệt (cấp tài khoản・email) hoặc từ chối (lý do・email) ở **"Xác nhận đăng ký"** của master nhà cung cấp | REQ-PO-301・613 |
| 6-2 | **Có coi thứ Bảy, Chủ nhật, ngày lễ là ngày làm việc hay không**: 24 giờ trong việc xác nhận sót đơn (§7-1) chỉ tính ngày làm việc. Với nhà cung cấp hiện có, ES hỏi rồi nhập | REQ-PO-604 |
| 6-3 | **Phương thức đặt hàng**: ES Station (đăng nhập để phản hồi)／Email (nhận trả lời・điện thoại rồi vận hành nhập thay)／Bên ngoài (hệ thống đặt hàng của nhà cung cấp. Vận hành chỉ ghi nhận đặt hàng và nhập kho. **Không gửi một email nào** 〈kể cả cảnh báo chưa xử lý〉. Phản hồi・phê duyệt đặt hàng chính・báo cáo xuất hàng do vận hành nhập thay) | REQ-PO-605・412, Sổ cái I (hong trả lời 2026-10-05) |
| 6-4 | Phân loại nhà cung cấp (thông thường・hạn tiêu thụ ngắn) theo **từng sản phẩm (dữ liệu đặt hàng)**. 1 công ty có thể xử lý cả hai | Sổ cái I |
| 6-5 | Chữ cái đầu của ID là **SP** (HU là điểm trung chuyển) | Sổ cái I |

## 7. Thông báo・Email

| # | Quy tắc | Căn cứ |
|---|---|---|
| 7-1 | **Phòng ngừa sót đơn**: khi đặt hàng chính thì hiển thị ở trang chủ nhà cung cấp + gửi email. Kiểm tra **mỗi 24 giờ** kể từ lúc đặt hàng chính (chỉ tính ngày làm việc), nếu chưa xử lý thì gửi email cảnh báo cho nhà cung cấp (lặp lại đến khi được xử lý) + hiển thị cho vận hành. Khi phê duyệt thì dừng | REQ-PO-302 |
| 7-2 | Thông báo từ nhà cung cấp (đặt hàng chính chưa xử lý・giao từng phần・thay đổi ngày giao・không nhận đơn・chênh lệch nhập kho) hiển thị ở **dải phía trên danh sách đặt hàng** của vận hành (khi có dashboard thì chuyển sang đó) | Sổ cái I |
| 7-3 | Email gửi nhà cung cấp có **cùng nội dung** cho cả nhà cung cấp đăng nhập lẫn nhà cung cấp nhận qua email (không gửi cho nhà cung cấp có phương thức đặt hàng = bên ngoài) (không đính kèm PDF đơn đặt hàng・**không đính kèm liên kết để phản hồi**). Vận hành có thể **nhập thay cho đơn đặt hàng của bất kỳ nhà cung cấp nào** | Sổ cái I |
| 7-4 | Nội dung・người nhận xem `30_Đơn_yêu_cầu/Danh_sách_email_Đặt_hàng_Nhà_cung_cấp_Nhập_kho_20261001.md` (S1〜S11) | — |

## 8. Ghi nhận nhập kho và chênh lệch

| # | Quy tắc | Căn cứ |
|---|---|---|
| 8-1 | Với THOMAS thì **xuất CSV chỉ thị nhập kho** (giữ nguyên như hiện tại). **Không nhập CSV kết quả nhập kho** | Sổ cái I |
| 8-2 | Với mỗi đơn đặt hàng, **nhập tay số lượng sản phẩm đã nhập và số thùng** (quản lý hệ thống của vận hành, hoặc vai trò "nhân viên kho"). Giao từng phần thì theo từng lần | Sổ cái I |
| 8-2b | **Hạn sử dụng・hạn tiêu thụ là bắt buộc với mọi sản phẩm.** Hiển thị hạn mà nhà cung cấp đã nhập khi phê duyệt đặt hàng chính làm mặc định, để xác nhận・sửa | Sổ cái I (hong trả lời 2026-10-05) |
| 8-3 | Số lượng sản phẩm bằng với đơn đặt hàng (từ lần giao từng phần thứ 2 là phần còn lại) = **khớp**. **Chỉ khác số thùng vẫn là khớp** | Sổ cái I |
| 8-4 | Nếu khác thì **"Có chênh lệch・Chờ xử lý"**. Tiếp tục hiển thị ở TOP của vận hành・danh sách đặt hàng. Có 3 cách xử lý: ① **Chờ giao từng phần** (tối đa 3 lần・ngày dự kiến nhập kho kế tiếp) ② **Xử lý bằng hàng thay thế** (chuyển sang thiết lập hàng thay thế) ③ **Chấp nhận thiếu hụt** (đặt các chuyến bị ảnh hưởng thành "chỉ loại trừ"・không thanh toán・liên hệ doanh nghiệp). Không cần chọn ngay để có thể hỏi nhà cung cấp rồi mới quyết định | Sổ cái I |
| 8-5 | Khi nhà cung cấp lùi ngày nhập kho, giao hàng **không tự động dời**. Cảnh báo cho vận hành | Sổ cái I |
| 8-6 | Nhập kho thì tồn kho kho tăng (`60_Tồn_kho/Tồn_kho.md` §2) | — |

## 9. Đặt hàng vật tư

- Không có đặt hàng tạm・**chỉ đặt hàng chính・theo từng lần**. Nơi nhận là **văn phòng ES (vật tư)** (không có master kho・không liên kết THOMAS). Nhập kho do vận hành nhập (sổ cái I).
- Tồn kho vật tư được giữ ở **văn phòng ES và tất cả kho picking**. Vật tư không gửi cùng chuyến thực phẩm (chuyến vật tư) (danh sách vấn đề 2-5・2026/10/02).
- Đơn hàng vật tư của khách xem `50_Đơn_hàng/Đơn_hàng.md` §9.

## 10. Màn hình của vận hành

| # | Quy tắc | Căn cứ |
|---|---|---|
| 10-1 | Không tạo màn hình chỉ có lịch sử đặt hàng. **Danh sách đặt hàng** hiển thị tìm kiếm theo tên sản phẩm・lọc theo danh mục・số thùng・số tiền đặt hàng・**trạng thái đối chiếu thanh toán** (đã xác nhận hóa đơn của nhà cung cấp hay chưa). Có thể chuyển đổi hiển thị "theo sản phẩm／theo dữ liệu đặt hàng" | Sổ cái I, REQ-PO-114・305・307 |
| 10-2 | Chi tiết đặt hàng dạng dọc. Tab lịch sử thay đổi・dự kiến và số lượng thực tế của từng lần giao từng phần | REQ-PO-401・132 |
| 10-2b | **Không tạo** màn hình・CSV chỉ có danh sách thanh toán của nhà cung cấp (xem bằng trạng thái đối chiếu thanh toán và tổng hợp tháng × nhà cung cấp) | Sổ cái N (hong 2026-10-05) |
| 10-3 | Xếp hạng số đơn・tỷ lệ・số lượng đặt hàng theo sản phẩm hiển thị ở mục **"Theo sản phẩm" của quản lý mua hàng** (xuất CSV) | Sổ cái K, REQ-PO-618 |
| 10-4 | Màn hình đặt hàng hiển thị "số lượng hàng thay thế" (`65_Hàng_thay_thế/Hàng_thay_thế.md`) | REQ-PO-220 |

## 11. Thời hạn (hạn sử dụng・hạn tiêu thụ)

- Hạn mong muốn truyền cho nhà cung cấp = ngày giao cho khách + số ngày bảo đảm (§5-10).
- Khi phê duyệt đặt hàng chính, nhà cung cấp nhập hạn sử dụng (**bắt buộc**・sổ cái E). Cũng có thể nhập ở báo cáo xuất hàng. Khi ghi nhận nhập kho cũng **bắt buộc** (§8-2b).
- ES hạn sử dụng・hạn tiêu thụ ngắn của master sản phẩm được dùng để **tính ngày hết hạn** trên màn hình đặt hàng, và dẫn đến **đề xuất hủy** tồn kho đã hết hạn (danh sách vấn đề 2026/10/03).

## 12. Những việc chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U2 | Địa chỉ nhận trả lời email (đầu mối đặt hàng) | Chờ xác nhận với khách hàng |
| U3 | Đưa việc tăng số lượng khách hàng vào số tham khảo của đặt hàng tạm như thế nào (REQ-PO-115) | Chờ xác nhận với khách hàng |
| U4 | Hình thức phản hồi của nhà cung cấp với đặt hàng tạm (OK／NG với ngày giao mong muốn・nếu NG thì lý do và phương án thay thế. Bảng yêu cầu dòng 184) | Đã quyết một phần (không nhận đơn + bình luận). Phần còn lại chờ xác nhận với khách hàng |
| U6 | Mã hóa ký tự của CSV THOMAS (có thể dùng UTF-8 hay không) | Chờ xác nhận với nhà cung cấp (vendor) |
