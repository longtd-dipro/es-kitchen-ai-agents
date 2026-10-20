> Bản dịch tiếng Việt của `ja/01_仕様/55_発注・仕入・入荷/発注・仕入・入荷.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đặt hàng · Trang nhà cung cấp · Nhập kho

> **Tài liệu chuẩn của chủ đề này.** Ngày 2026-10-05, chỉ tổng hợp lại "những gì đang có hiệu lực" từ tài liệu gốc và các quyết định bên dưới rồi viết mới.
> Các quyết định đang có hiệu lực nằm trong `docs/決定台帳.md` (chủ đề này là **I**, liên quan E・H・J). Nếu có mâu thuẫn thì sổ quyết định là chuẩn.
> Tài liệu gốc (đóng băng, chỉ để xem lịch sử): `docs/議事録_仕様/発注仕入入荷_詳細要件仕様.md` (REQ-PO. Diễn biến và lịch sử thay đổi theo từng cuộc họp), `00_決定/決定_STEP6回答_発注仕入先_20261001.md`・`決定_STEP6追補_OPEN回答と倉庫の入荷確認_20261001.md`・`決定_シナリオ説明書の確認_20261002.md`.
> Tồn kho・kiểm kê xem `60_在庫/在庫.md`, hàng thay thế xem `65_代替品/代替品.md`, nội dung email xem `30_申請/メール一覧_発注・仕入先・入荷_20261001.md`.

## 1. Luồng tổng thể và thời điểm

```
Tạo menu → Đặt hàng tạm (trước khi công khai menu) → Công khai・nhận đơn (ngày 1〜15 của tháng trước)
 → Đặt hàng chính nửa đầu (phần các chuyến tuần A・B) → Nhà cung cấp phê duyệt → Báo cáo xuất hàng → Ghi nhận nhập kho → Tồn kho kho → Picking・xuất hàng
 → Đặt hàng chính nửa sau (phần các chuyến tuần C・D) → (tương tự)
```

| Mốc | Khi nào | Căn cứ |
|---|---|---|
| Đặt hàng tạm | **Trước khi công khai menu** (điều kiện công khai có "phê duyệt đặt hàng tạm"). Là việc nhờ nhà cung cấp chuẩn bị trước một lượng nhất định | Sổ quyết định I |
| Đặt hàng chính nửa đầu | Phần các chuyến tuần A・B. **B5〜C1 của chu kỳ trước** | Sổ quyết định I |
| Đặt hàng chính nửa sau | Phần các chuyến tuần C・D. **D5〜A1 của chu kỳ kế tiếp** | Sổ quyết định I |
| Khi bấm đặt hàng chính | Nếu có cơ sở "đăng ký tạm" bắt đầu từ chu kỳ là đối tượng đặt hàng thì **hiển thị cảnh báo** (không chặn đặt hàng chính, vẫn đặt được). Nếu để nguyên đăng ký tạm quá ngày 15 thì sẽ tự động đăng ký theo giá trị chuẩn, vận hành sửa hoặc lùi lại trước đợt đặt hàng chính buổi sáng ngày 16 | Sổ quyết định AL・AF (2026-10-16) |
| Nhắc nhở đặt hàng chính | Vào đầu kỳ và ngày cuối kỳ, thông báo cho **người phụ trách đặt hàng** (vai trò có thể chỉnh sửa 「発注管理」(quản lý đặt hàng). Giá trị ban đầu là toàn quyền・phát triển sản phẩm) và vai trò **quản lý hệ thống** (không gửi email). Hiển thị ở **cảnh báo trên TOP** của Web vận hành dòng 「本発注の時期です（サイクル・前半／後半・期間）：本発注がまだの発注 n件」 (Đã đến kỳ đặt hàng chính (chu kỳ・nửa đầu／nửa sau・thời gian): n đơn chưa đặt hàng chính), khi không còn đơn chưa đặt hàng chính thì biến mất (ngày cuối hiển thị màu đỏ) | Sổ quyết định E (2026-10-05) → Sổ quyết định T・Z (2026-10-12・14), sổ tiếp nhận #498 |
| Đặt hàng bổ sung | Phần tăng thêm sau hạn chót đặt đơn (đơn tự động của gói dùng thử・đơn đăng ký được phê duyệt sau hạn chót・phần bổ sung sau khi chốt mẫu kinh doanh・hàng thay thế). Tạo thành **dữ liệu đặt hàng mới (đặt hàng chính)** và lưu lại lý do. Ngày cơ sở là B7・D7 | Sổ quyết định I・H・J |
| Vật tư | Không có đặt hàng tạm. **Chỉ đặt hàng chính・theo từng lần** (§9) | Sổ quyết định I |

- Việc chốt đặt hàng **tự động theo hạn chót đặt đơn**. Không có thao tác chốt hoặc hủy chốt thủ công (REQ-PO-108・109).
- Việc dời ngày của chuyến đã qua thời điểm đặt hàng chính có giới hạn (từng chuyến một・bắt buộc nêu lý do・trong cùng một nửa 〈A↔B／C↔D〉. Sang chu kỳ khác・nửa khác chỉ khi xử lý sự cố). Xem đặc tả giao hàng.

## 2. Số lượng cần và số lượng đặt

| # | Quy tắc | Căn cứ |
|---|---|---|
| 2-1 | **Số lượng cần = đơn của các cơ sở thuộc hợp đồng + đơn dùng thử + mẫu kinh doanh**. Số mẫu kinh doanh: với mỗi sản phẩm đối tượng, các tháng từ tháng sau trở đi là "số suất đã quyết trong menu × 2 cái" (không thay đổi theo số đăng ký thực tế. Hạn chót nhận đăng ký là sau đặt hàng chính. Phần chênh lệch là đặt hàng bổ sung. Hạn tiêu thụ ngắn cũng chia đều cho 4 tuần. Sổ quyết định S 2026-10-14), các tháng từ tháng này trở về trước là số lượng đã đăng ký (đã tiếp nhận) (mỗi loại 2 cái là cố định. `75_営業サンプル/営業サンプル.md` 2-16). Tổng hợp theo từng kho (Kanto・Kansai), **đặt hàng theo từng kho**. Sản phẩm và kho là quan hệ nhiều-nhiều | REQ-PO-103・212 |
| 2-2 | Trong phần chi tiết, **phần của hợp đồng đăng ký tạm được tách ra hiển thị là "tạm"**. Không tạo dữ liệu giao hàng có ngày gửi trống (lỗi) | REQ-PO-612 |
| 2-3 | Màn hình hiển thị cùng lúc số lượng theo từng ngày và tổng theo từng nửa chu kỳ (nửa đầu・nửa sau) | REQ-PO-110 |
| 2-4 | Không hiển thị "dự đoán" số lượng đặt. Hiển thị **số lượng đặt hàng・đơn hàng 2〜3 lần gần nhất** để tham khảo, con người quyết định. Số tham khảo cho đặt hàng tạm: lịch sử 1 tháng = tỷ lệ tăng, nhiều tháng = trung bình có trọng số + tỷ lệ tăng (tỷ lệ tăng là mức tăng tổng số của gói) | REQ-PO-101・102 |
| 2-5 | Sản phẩm có lot (số lượng mỗi gói) thì số lượng cần được **làm tròn lên theo đơn vị lot** (có thể sửa tay) | REQ-PO-105 |
| 2-6 | Không có ô số lượng dự phòng. Cộng thêm bằng **nút +3／+5／+10** và nhập tay | REQ-PO-104 (hủy)・402 |
| 2-7 | Chu kỳ đặt hàng cơ bản gồm 2 kỳ: nửa đầu・nửa sau. Sản phẩm có hạn tiêu thụ ngắn có thể chia thành **4 kỳ・theo tuần** v.v. | REQ-PO-401 |
| 2-8 | Giá trị mặc định của ngày nhập kho mong muốn là **ngày hôm đó** (tính ngược từ lịch picking). Có nút chọn 1 ngày trước・2 ngày trước | REQ-PO-404 |
| 2-9 | Chi tiết đặt hàng không hiển thị cột 「スロット」 (Slot) và 「顧客納品日」 (ngày giao cho khách) (tính theo ngày picking) | REQ-PO-403 |
| 2-10 | Chọn sản phẩm trong danh sách, chỉ định ngày nhập kho mong muốn (khoảng thời gian) để **đặt hàng tạm hàng loạt**. Các sản phẩm theo tuần như salad được đặt ở màn hình chi tiết. Chỉ đặt hàng loạt được những sản phẩm có cùng ngày nhập kho mong muốn・hạn dùng | REQ-PO-201・203・205・406 |
| 2-11 | Hiển thị **màn hình xác nhận** trước khi chốt đặt hàng | REQ-PO-405 |
| 2-12 | **Danh sách đặt hàng của chu kỳ hằng tháng là các sản phẩm trong menu của tháng đó**. Nút 「商品追加」 (thêm sản phẩm) dùng để thêm vào đơn đặt hàng **các sản phẩm ngoài menu** (bánh kẹo・nước sốt trộn salad v.v.). Sản phẩm đã thêm hiển thị trong danh sách kèm dấu 「メニュー外」 (ngoài menu). **Không thêm vật tư** (đặt hàng vật tư như §9). Đặt hàng bổ sung cho phần thiếu của hàng thay thế tự động hiển thị trong danh sách | REQ-PO-113, Sổ quyết định I (2026-10-07) |
| 2-12b | **Cả đặt hàng lẫn đặt hàng bổ sung đều tách màn hình và cách làm giữa sản phẩm thông thường và sản phẩm hạn tiêu thụ ngắn** (thông thường = theo từng đơn vị đặt hàng／hạn tiêu thụ ngắn = theo từng dòng 〔kho × ngày giao〕) | Sổ quyết định I (2026-10-07) |
| 2-13 | Nội dung ghi chú cố định (ngày sản xuất・giao buổi sáng v.v.) được nhập bằng ô chọn hoặc tự động điền, có thể sửa riêng từng cái | REQ-PO-206 |
| 2-14 | Số đặt hàng: thông thường = `PO-YYYYMM-品番-U01`, hạn tiêu thụ ngắn = `PO-YYYYMM-品番-倉庫記号＋Slot` (品番 = mã hàng, 倉庫記号 = ký hiệu kho). Không đưa ký hiệu chu kỳ (nửa đầu・nửa sau) vào | Sổ quyết định I |

## 3. Trạng thái đặt hàng

`仮発注 → 納期回答待ち → 納期回答済 → 本発注 → 本発注の承認待ち → 本発注承認済み → 出荷済 → 入荷済み` (Đặt hàng tạm → Chờ phản hồi ngày giao → Đã phản hồi ngày giao → Đặt hàng chính → Chờ phê duyệt đặt hàng chính → Đã phê duyệt đặt hàng chính → Đã xuất hàng → Đã nhập kho)
Ngoài ra còn **「受注不可」 (Không nhận đơn)** (phản hồi của nhà cung cấp) và **「キャンセル」 (Hủy)** (vận hành). (REQ-PO-111)

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
| 4-1 | Vận hành có thể sửa số lượng **cho đến khi nhà cung cấp phê duyệt đặt hàng chính** (đặt hàng tạm thì nhờ nhà cung cấp phản hồi lại, đặt hàng chính thì nhờ nhà cung cấp phê duyệt lại) | Sổ quyết định I |
| 4-2 | Sau khi phê duyệt thì không sửa được. **Tăng = đặt hàng bổ sung, giảm = hủy rồi đặt lại** | Sổ quyết định I |
| 4-3 | Việc đã sửa・hủy・bổ sung được lưu kèm số lượng vào tab 「変更履歴」 (lịch sử thay đổi) trong chi tiết đặt hàng | REQ-PO-304 |
| 4-4 | Sau khi phê duyệt đặt hàng chính, nếu khi nhập kho phát hiện sản phẩm bị thiếu thì **không tự động giảm**. Vận hành chọn cách xử lý (§8) | Sổ quyết định I |

## 5. Trang nhà cung cấp

| # | Quy tắc | Căn cứ |
|---|---|---|
| 5-1 | Tên danh sách là **「受注一覧」 (danh sách đơn nhận)** (màn hình và tên trạng thái của vận hành không đổi) | REQ-PO-620 |
| 5-2 | **Không hiển thị số tiền** (đơn giá nhập・số tiền đặt hàng・tổng hợp・số tiền trong CSV) | Sổ quyết định I |
| 5-3 | Tên sản phẩm là **tên dành cho nhà cung cấp** (không phải tên công khai) | Sổ quyết định I |
| 5-4 | Không hiển thị ranh giới nửa đầu・nửa sau (hiển thị theo ngày nhập kho mong muốn) | REQ-PO-207 |
| 5-5 | Phê duyệt đặt hàng chính: ngày giao hàng (ngày hàng đến kho)・số thùng nhập kho・hạn sử dụng. Chưa phê duyệt thì không báo cáo xuất hàng được | Sổ quyết định I・E |
| 5-6 | **Giao từng phần**: từ 「分納依頼」 (yêu cầu giao từng phần) của mỗi đơn đặt hàng, nhập ngày và số lượng cho từng lần. **Không cần vận hành phê duyệt** (vận hành chỉ nhận thông báo trên màn hình・không có email). **Cả ngày dự kiến xuất hàng lẫn ngày giao** của mỗi lần **tối đa đến ngày nhập kho mong muốn ban đầu (bao gồm ngày đó)**・**tối đa 3 lần** (**cố định 3 lần**. Không đặt trên màn hình cài đặt của vận hành: Sổ quyết định S・sổ tiếp nhận #535). Ngoài phạm vi thì không đăng ký được (E470). Phản hồi・phê duyệt đặt hàng chính・phê duyệt hàng loạt・CSV đều dùng cùng ranh giới. **Các quy tắc này cũng được kiểm tra ở server (API)**: số lần và ngày giao từng phần, báo cáo xuất hàng chỉ sau khi phê duyệt đặt hàng chính, không nhận đơn thì bắt buộc lý do và bình luận (Sổ quyết định T・sổ tiếp nhận #494) | Sổ quyết định I・R (2026-10-08), REQ-PO-303 |
| 5-7 | **Báo cáo xuất hàng**: phương thức giao (giao thẳng 〈dùng công ty vận chuyển〉／giao bằng xe công ty／mang đến kho. **Bắt buộc**)・công ty vận chuyển (chọn từ danh sách)・số vận đơn (**tùy chọn・không kiểm tra định dạng**)・hạn sử dụng. Phương thức giao・công ty vận chuyển lấy giá trị lần trước làm mặc định | Sổ quyết định I・E, REQ-PO-135・619 |
| 5-8 | Nếu số thùng nhập kho × số lượng mỗi thùng (lot) không khớp với số lượng thì hiển thị xác nhận (vẫn cho tiếp tục). Nếu số thùng nhiều hơn số lượng thì không đăng ký được. **Server cũng kiểm tra như vậy** (số thùng > số lượng bị từ chối với E473) | REQ-PO-609 |
| 5-9 | Sản phẩm có hạn tiêu thụ ngắn xuất hàng mỗi ngày, nên **nhập・lưu hàng loạt ở danh sách xuất hàng**, và có thể **chuyển hàng loạt sang đã xuất hàng** các đơn đã đánh dấu. Danh sách có ô nhập này cũng hiển thị 10／20／50 dòng, 「すべて選択」 (chọn tất cả) là trang đang hiển thị | REQ-PO-621, Sổ quyết định S (2026-10-08) |
| 5-10 | Hạn mong muốn chỉ hiển thị giá trị gửi từ vận hành (ngày giao cho khách + số ngày bảo đảm). Tên ô: hạn tiêu thụ ngắn = 「希望消費期限」 (hạn tiêu thụ mong muốn), thông thường = 「希望賞味期限」 (hạn sử dụng mong muốn) | Sổ quyết định I |
| 5-11 | **1 công ty 1 tài khoản**. Người phụ trách (chính・phụ) là nhiều địa chỉ nhận email. Đặt lại mật khẩu bằng mã xác thực (Sổ quyết định K) | Sổ quyết định I・K |
| 5-12 | Hồ sơ khi lưu sẽ được đưa thẳng vào master của vận hành (không cần vận hành phê duyệt) | Sổ quyết định I |
| 5-17 | **Phê duyệt hàng loạt (phản hồi ngày giao・đặt hàng chính)**: áp dụng cùng kiểm tra như phê duyệt từng đơn cho các đơn đã chọn. **Các dòng E470・E473・E475 chỉ loại riêng dòng đó**, các dòng khác được phê duyệt, các dòng bị loại hiển thị trong danh sách kèm lý do. **W322 (số thùng × số lượng mỗi thùng không khớp số lượng) là cảnh báo**: hiển thị các dòng tương ứng trong danh sách, chưa phê duyệt, bấm 「承認」 (phê duyệt) thêm lần nữa thì cả lô được tiến hành. CSV cũng kiểm tra như vậy (E470・E473 là lỗi dòng, W322 là cảnh báo dòng). Phần đơn vị giao hàng ủy thác・tài xế theo Sổ quyết định F・S | Sổ quyết định AB (2026-10-14), sổ tiếp nhận #370 |
| 5-13 | **Đặt hàng chính thì cả phê duyệt lẫn từ chối đều hiển thị xác nhận (Q01)** (cả hai đều không thể hoàn tác) | Sổ quyết định S (2026-10-08) |
| 5-14 | **Tìm kiếm trong danh sách đơn nhận** = năm tháng xuất hàng・số đặt hàng・tên sản phẩm・kho nhận hàng・loại・ngày giao mong muốn (từ／đến). **Xuất CSV gồm 19 cột** (số đặt hàng・ngày giờ đặt hàng・loại・mã hàng・tên sản phẩm・năm tháng đối tượng・kho nhận hàng・phân loại・số đặt hàng tạm・số đặt hàng chính・đơn vị・trạng thái phản hồi・phê duyệt đặt hàng chính・ngày dự kiến xuất hàng・ngày xuất hàng・số vận đơn・nhập kho・ngày nhập kho mong muốn・số lượng). Không xuất 「便」 (chuyến), 「お届け日」 (ngày giao đến), 「金額」 (số tiền) | Sổ quyết định S (2026-10-08) |
| 5-15 | **Thông báo ở trang chủ được đặt trong khung riêng và có thể cuộn** (không cắt theo số lượng・quan trọng ở trên, tiếp theo theo thứ tự mới nhất). Giữ lại màn hình 「お知らせ一覧」 (danh sách thông báo) (`SW_HOME_003`), mở từ liên kết ở trang chủ (không thêm vào menu・không có tìm kiếm). Danh sách **phân trang 10 dòng mỗi trang**. Không có trạng thái 「既読」 (đã đọc) (đã đọc chỉ có ở ứng dụng tài xế). 「キャンセルの帯」 (dải hủy) ở trang chủ **hiển thị các lần hủy trong 7 ngày gần nhất kèm số lượng, quá 7 ngày thì biến mất** (không có chưa đọc). Không hiển thị 「新着」「NEW」 (mới) ở danh sách đơn nhận và menu (cách tìm là thứ tự sắp xếp 〈mới nhất trước〉 và tab 「納期回答待ち」 (chờ phản hồi ngày giao)) | Sổ quyết định S (2026-10-08・#457・#464・#465) |
| 5-16 | Dù liên kết hướng dẫn thao tác trống, phía nhà cung cấp vẫn giữ màn hình 「操作マニュアル」 (hướng dẫn thao tác) và hiển thị 「準備中」 (đang chuẩn bị) (không xóa menu. Các trang khác giữ nguyên theo Sổ quyết định F) | Sổ quyết định S (2026-10-08) |

## 6. Master nhà cung cấp và đăng ký

| # | Quy tắc | Căn cứ |
|---|---|---|
| 6-1 | Nhà cung cấp có thể đăng ký từ biểu mẫu (tên đứng danh nghĩa・địa chỉ・điện thoại・người phụ trách・có coi thứ Bảy, Chủ nhật, ngày lễ là ngày làm việc hay không). Vận hành phê duyệt (cấp tài khoản・email) hoặc từ chối (lý do・email) ở **「申込の確認」 (xác nhận đăng ký)** của master nhà cung cấp | REQ-PO-301・613 |
| 6-2 | **Có coi thứ Bảy, Chủ nhật, ngày lễ là ngày làm việc hay không**: 24 giờ trong việc xác nhận sót đơn (§7-1) chỉ tính ngày làm việc. Với nhà cung cấp hiện có, ES hỏi rồi nhập | REQ-PO-604 |
| 6-3 | **Phương thức đặt hàng**: ES Station (đăng nhập để phản hồi)／Email (nhận trả lời・điện thoại rồi vận hành nhập thay)／Bên ngoài (hệ thống đặt hàng của nhà cung cấp. Vận hành chỉ ghi nhận đặt hàng và nhập kho. **Không gửi một email nào** 〈kể cả cảnh báo chưa xử lý〉. Phản hồi・phê duyệt đặt hàng chính・báo cáo xuất hàng do vận hành nhập thay) | REQ-PO-605・412, Sổ quyết định I (hong trả lời 2026-10-05) |
| 6-4 | Phân loại nhà cung cấp (thông thường・hạn tiêu thụ ngắn) theo **từng sản phẩm (dữ liệu đặt hàng)**. 1 công ty có thể xử lý cả hai | Sổ quyết định I |
| 6-5 | Chữ cái đầu của ID là **SP** (HU là điểm trung chuyển) | Sổ quyết định I |

## 7. Thông báo・Email

| # | Quy tắc | Căn cứ |
|---|---|---|
| 7-1 | **Phòng ngừa sót đơn**: khi đặt hàng chính thì hiển thị ở trang chủ nhà cung cấp + gửi email. Kiểm tra **mỗi 24 giờ** kể từ lúc đặt hàng chính (chỉ tính ngày làm việc), nếu chưa xử lý thì gửi email cảnh báo cho nhà cung cấp (lặp lại đến khi được xử lý) + hiển thị cho vận hành. Khi phê duyệt thì dừng | REQ-PO-302 |
| 7-2 | Thông báo từ nhà cung cấp (đặt hàng chính chưa xử lý・giao từng phần・thay đổi ngày giao・không nhận đơn・chênh lệch nhập kho) hiển thị ở **dải phía trên danh sách đặt hàng** của vận hành (khi có dashboard thì chuyển sang đó) | Sổ quyết định I |
| 7-3 | Email gửi nhà cung cấp có **cùng nội dung** cho cả nhà cung cấp đăng nhập lẫn nhà cung cấp nhận qua email (không gửi cho nhà cung cấp có phương thức đặt hàng = bên ngoài) (không đính kèm PDF đơn đặt hàng・**không đính kèm liên kết để phản hồi**). Vận hành có thể **nhập thay cho đơn đặt hàng của bất kỳ nhà cung cấp nào** | Sổ quyết định I |
| 7-4 | Nội dung・người nhận xem `30_申請/メール一覧_発注・仕入先・入荷_20261001.md` (S1〜S11) | — |

## 8. Ghi nhận nhập kho và chênh lệch

| # | Quy tắc | Căn cứ |
|---|---|---|
| 8-1 | Với THOMAS thì **xuất CSV chỉ thị nhập kho** (giữ nguyên như hiện tại). **Không nhập CSV kết quả nhập kho** | Sổ quyết định I |
| 8-2 | Với mỗi đơn đặt hàng, **nhập tay số lượng sản phẩm đã nhập và số thùng** (quản lý hệ thống của vận hành, hoặc vai trò 「倉庫スタッフ」 (nhân viên kho)). Giao từng phần thì theo từng lần | Sổ quyết định I |
| 8-2a | Cách đăng ký nhập kho: **ngày nhập kho chỉ nhập 1 lần ở ô bên cạnh nút 「保存」 (lưu) (mặc định là hôm nay・chỉ từ hôm nay trở về trước). Hạn sử dụng／hạn tiêu thụ không nhập・không sửa khi đăng ký nhập kho (chỉ hiển thị hạn mà nhà cung cấp đã nhập 〈nếu vận hành đã nhập hạn mong muốn khi đặt hàng thì là hạn đó〉). Các dòng đã nhập được đăng ký hàng loạt bằng 「保存」** (nếu có lỗi thì không lưu dòng nào). Không có nút 「予定どおり入荷」 (nhập kho đúng dự kiến), 「入荷を登録」 (đăng ký nhập kho) ở chi tiết dữ liệu đặt hàng là liên kết mở màn hình đăng ký nhập kho. Khi chấp nhận thiếu hụt, luôn gửi thông báo cho doanh nghiệp | Sổ quyết định I (2026-10-08) |
| 8-2b | **Hạn sử dụng・hạn tiêu thụ là bắt buộc với mọi sản phẩm.** Giá trị mặc định là hạn mong muốn mà vận hành đã nhập khi đặt hàng (Sổ quyết định I 2026-10-07), để xác nhận・sửa | Sổ quyết định I (hong trả lời 2026-10-05) |
| 8-3a | Khi nhập kho **nhiều hơn dự kiến**: 「多い分を受け入れる」 (chấp nhận phần dư) (đóng đơn đặt hàng, phần dư vào tồn kho kho) | Sổ quyết định I (2026-10-07) |
| 8-3 | Số lượng sản phẩm bằng với đơn đặt hàng (từ lần giao từng phần thứ 2 là phần còn lại) = **khớp**. **Chỉ khác số thùng vẫn là khớp** | Sổ quyết định I |
| 8-4 | Nếu khác thì **「差異あり・対応待ち」 (có chênh lệch・chờ xử lý)**. Tiếp tục hiển thị ở TOP của vận hành・danh sách đặt hàng. Có 3 cách xử lý: ① **Chờ giao từng phần** (tối đa 3 lần・ngày dự kiến nhập kho kế tiếp) ② **Xử lý bằng hàng thay thế** (chuyển sang thiết lập hàng thay thế) ③ **Chấp nhận thiếu hụt** (đặt các chuyến bị ảnh hưởng thành 「除外のみ」 (chỉ loại trừ)・không xuất hóa đơn・liên hệ doanh nghiệp. Nội dung liên hệ là 「お届けする商品の変更（入荷の不足）」 (thay đổi sản phẩm giao (thiếu hàng nhập kho)), không dùng X17〔thông báo hàng thay thế〕: Sổ quyết định AB・2026-10-14). Không cần chọn ngay để có thể hỏi nhà cung cấp rồi mới quyết định. **Khi muốn giao sản phẩm thay thế thì chọn ②** (cũng ghi trong phần giải thích của ③). Bảng các chuyến bị ảnh hưởng hiển thị **「代替品を追加」 (thêm hàng thay thế)** cho từng chuyến (khi đang chọn ② hoặc ③), bấm vào thì mở thiết lập hàng thay thế với sản phẩm lỗi・lý do・**chỉ ngày xuất hàng của chuyến đó** đã điền sẵn. Không thể thêm hàng thay thế cho chuyến sau khi đã loại bằng ③. Không chọn trộn lẫn theo từng chuyến (Sổ quyết định AB・sổ tiếp nhận #341) | Sổ quyết định I |
| 8-4a | **Sau khi chấp nhận thiếu hụt và loại khỏi chuyến**, chuyến đó **không hiển thị nút 「代替品を追加」** (cũng không hiển thị dạng không bấm được. Không thể thêm hàng thay thế cho chuyến đã loại). Khi muốn giao sản phẩm thay thế thì chọn ② trước khi loại | Sổ quyết định AK (2026-10-15・hong trả lời M30) |
| 8-5 | Khi nhà cung cấp lùi ngày nhập kho, giao hàng **không tự động dời**. Cảnh báo cho vận hành | Sổ quyết định I |
| 8-6 | Nhập kho thì tồn kho kho tăng (`60_在庫/在庫.md` §2) | — |

## 9. Đặt hàng vật tư

- Không có đặt hàng tạm・**chỉ đặt hàng chính・theo từng lần**. Màn hình của nhà cung cấp là **màn hình riêng, khác với chi tiết đặt hàng sản phẩm** (`SW_ORDR_004`). **Lối vào được trộn chung trong danh sách đơn nhận** (không tạo danh sách riêng). Tiến trình gồm **3 bước: đã đặt hàng chính → đã xuất hàng → đã nhập kho**. Nơi nhận, kể cả văn phòng ES, **chỉ hiển thị tên kho**. **Không dùng giao từng phần** (Sổ quyết định S 2026-10-08・#458). Nơi nhận là **kho theo từng vật tư** (kho xử lý trong master vật tư. Văn phòng ES cũng là 1 kho). Nhập kho do vận hành nhập (Sổ quyết định I・thay đổi ngày 2026-10-07). Mức tham khảo theo từng kho (Sổ quyết định I).
- Tồn kho vật tư được giữ ở **văn phòng ES và tất cả kho picking**. Vật tư không gửi cùng chuyến thực phẩm (chuyến vật tư) (danh sách vấn đề 2-5・2026/10/02). **Kho của chuyến vật tư là kho picking của tuyến có phân loại giao hàng 「資材」 (vật tư) của cơ sở đó** (Sổ quyết định S・2026-10-08).
- **1 lần đặt hàng là 1 kho cho mỗi vật tư** (kho nhận hàng là 1. Khi đặt hàng cho kho khác nữa thì tạo đơn đặt hàng riêng). Có thể đặt hàng nhiều vật tư cùng lúc (mỗi vật tư 1 đơn đặt hàng. Khi lẫn vật tư có kho khác nhau thì tự động chia thành dòng theo từng kho). Các đơn đặt hàng đã nhập cho văn phòng ES được giữ nguyên. Sổ quyết định S (#450)・Sổ quyết định AA (#584).
- **Mức tham khảo đặt hàng** theo từng kho = (đơn vật tư đã nhận chưa xuất hàng + trung bình mỗi ngày của 28 ngày gần nhất × **số ngày đến khi giao**) − tồn kho vật tư của kho đó − đang đặt hàng (làm tròn lên theo lot). Số ngày đến khi giao **không lưu trong master vật tư**, mà nhập mỗi lần cùng với kho ở màn hình đặt hàng vật tư (mặc định 7). Không dùng ngày giao của nhà cung cấp (Sổ quyết định F 「資材の納期（日）」 (thời hạn giao vật tư (ngày))・I 「資材の発注」 (đặt hàng vật tư), sổ tiếp nhận #394).
- Đơn hàng vật tư của khách xem `50_注文/注文.md` §9.

## 10. Màn hình của vận hành

| # | Quy tắc | Căn cứ |
|---|---|---|
| 10-1 | Không tạo màn hình chỉ có lịch sử đặt hàng (giữ menu 「発注・入荷履歴」 (lịch sử đặt hàng・nhập kho), mở cùng màn hình với 「発注データごと」 (theo dữ liệu đặt hàng) của danh sách đặt hàng). **Danh sách đặt hàng** hiển thị tìm kiếm theo tên sản phẩm・lọc theo danh mục・số thùng・số tiền đặt hàng・**trạng thái đối chiếu hóa đơn** (đã xác nhận hóa đơn của nhà cung cấp hay chưa). Có thể chuyển đổi hiển thị 「商品ごと／発注データごと」 (theo sản phẩm／theo dữ liệu đặt hàng) | Sổ quyết định I, REQ-PO-114・305・307 |
| 10-2 | Chi tiết đặt hàng dạng dọc. Tab lịch sử thay đổi・dự kiến và số lượng thực tế của từng lần giao từng phần | REQ-PO-401・132 |
| 10-2b | **Không tạo** màn hình・CSV chỉ có danh sách hóa đơn của nhà cung cấp (xem bằng trạng thái đối chiếu hóa đơn và tổng hợp tháng × nhà cung cấp) | Sổ quyết định N (hong 2026-10-05) |
| 10-3 | Xếp hạng số đơn・tỷ lệ・số lượng đặt hàng theo sản phẩm hiển thị ở mục **「商品別」 (theo sản phẩm) của quản lý mua hàng** (xuất CSV) | Sổ quyết định K, REQ-PO-618 |
| 10-4 | Màn hình đặt hàng hiển thị 「代替品数」 (số lượng hàng thay thế) (`65_代替品/代替品.md`) | REQ-PO-220 |
| 10-5 | Dữ liệu đặt hàng được gom về 1 nơi (đơn đặt hàng trong DB chung, giống trang nhà cung cấp). Dữ liệu mẫu đặt hàng chỉ có ở vận hành (205 bản ghi) cũng được chuyển sang. Nhà cung cấp không có trang nhà cung cấp được phân biệt bằng phương thức đặt hàng (bên ngoài) (không thông báo・vận hành nhập thay). Nhà cung cấp có phương thức đặt hàng là email, nếu có tài khoản thì cũng xem được đơn đặt hàng trên trang nhà cung cấp | Sổ quyết định AS・sổ tiếp nhận #767・#776 |
| 10-6 | Năm tháng đối tượng trên màn hình đặt hàng là tất cả các tháng có menu chưa bị xóa (tháng mới ở trên・chọn trước tiên tháng đang nhận đơn). Sản phẩm・nhà cung cấp・số lượng mỗi thùng lấy từ master sản phẩm | Sổ quyết định AS・sổ tiếp nhận #776 |

## 11. Thời hạn (hạn sử dụng・hạn tiêu thụ)

- Hạn mong muốn truyền cho nhà cung cấp = ngày giao cho khách + số ngày bảo đảm (§5-10).
- Khi phê duyệt đặt hàng chính, nhà cung cấp nhập hạn sử dụng (**bắt buộc**・Sổ quyết định E). Cũng có thể nhập ở báo cáo xuất hàng. Khi ghi nhận nhập kho cũng **bắt buộc** (§8-2b). Hạn sử dụng này là dữ liệu gốc cho **cảnh báo ngày giao lần tới** của ứng dụng tài xế (bước ② của chuyến giao ES) (sản phẩm có trong menu hằng tháng không thuộc đối tượng cảnh báo・Sổ quyết định S 2026-10-08).
- ES hạn sử dụng・hạn tiêu thụ ngắn của master sản phẩm được dùng để **tính ngày hết hạn** trên màn hình đặt hàng, và dẫn đến **đề xuất hủy** tồn kho đã hết hạn (danh sách vấn đề 2026/10/03).

## 12. Những việc chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U2 | Địa chỉ nhận trả lời email (đầu mối đặt hàng) | Chờ xác nhận với khách hàng. **Ghi cố định trong nội dung email** (không đặt trên màn hình cài đặt của Web vận hành). Cho đến khi quyết định thì để nguyên 【発注窓口のアドレス】 (địa chỉ đầu mối đặt hàng) (Sổ quyết định S・sổ tiếp nhận #536) |
| U3 | Đưa việc tăng số lượng khách hàng vào số tham khảo của đặt hàng tạm như thế nào (REQ-PO-115) | Chờ xác nhận với khách hàng |
| U4 | Hình thức phản hồi của nhà cung cấp với đặt hàng tạm (OK／NG với ngày giao mong muốn・nếu NG thì lý do và phương án thay thế. Bảng yêu cầu dòng 184) | Đã quyết một phần (không nhận đơn + bình luận). Phần còn lại chờ xác nhận với khách hàng |
| U6 | Mã hóa ký tự của CSV THOMAS (có thể dùng UTF-8 hay không) | Chờ xác nhận với nhà cung cấp (vendor) |
