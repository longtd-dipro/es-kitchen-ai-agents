<!-- Nguồn: 01_仕様/Sắp_xếp_đặc_tả_Trục_thời_gian_bản_sao_và_tính_nhất_quán_20261001.md (chuyển ngày 2026-10-03. Nội dung giữ nguyên) -->

# Chỉnh lý đặc tả: Trục thời gian, bản sao, tính nhất quán dữ liệu (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork).
> Nguồn: Tài liệu review "Review thiết kế demo (góc nhìn BA・QC)" (Claude Docs) phần góc nhìn TechLead, và câu trả lời của Long (`00_Quyết_định/Quyết_định_Trả_lời_review_TechLead_20261001.md`・`Quyết_định_Trả_lời_review_TechLead_Bổ_sung_20261001.md`).
> **Chưa phản ánh vào demo (đang thực hiện STEP5). Các tài liệu đặc tả hiện có (thiết kế cơ bản・danh sách hạng mục・quy tắc thanh toán・đặc tả tổng hợp) cũng chưa được sửa.** Nơi cần sửa xem danh sách ở §11.
> Tài liệu này gom về một chỗ "khi nào sao chép dữ liệu, khi nào chốt, và thay đổi sau khi chốt được xử lý thế nào" trước khi giao cho bên phát triển. Nếu khác với file quyết định thì file quyết định là chuẩn.

## 0. Thuật ngữ

| Thuật ngữ | Ý nghĩa |
|---|---|
| Nguồn | Dữ liệu chuẩn do người nhập・quyết định (cơ sở, hợp đồng cha, lịch sử tạm dừng, master, lịch chu kỳ, v.v.) |
| Bản sao | Dữ liệu được tạo từ nguồn rồi chốt tại một thời điểm (hợp đồng con, dữ liệu giao hàng, hóa đơn) |
| Chốt | Sau đó dù nguồn thay đổi cũng không ghi đè. Thay đổi sau khi chốt được xử lý bằng "dòng điều chỉnh" hoặc "hủy・phát hành lại" |

## 1. Trục thời gian của hợp đồng (tạo trước hợp đồng con)

**Quyết định (TL-1)**: Giữ nguyên việc tạo trước như hiện nay. Lý do là để đáp ứng thanh toán trả trước (xuất hóa đơn trước tháng chu kỳ) và thay đổi hợp đồng kéo dài từ tháng hiện tại trở đi (thanh toán theo năm, v.v.).

Bổ sung:

1. Trong khi còn đơn đăng ký chờ phê duyệt, không thể chỉnh sửa trực tiếp các hạng mục đối tượng của đơn đó trên hợp đồng con của cơ sở đó
2. Khi phê duyệt, nếu "giá trị trước thay đổi" của đơn khác với giá trị hiện tại thì dừng phê duyệt và để vận hành xác nhận
3. Nơi gửi hóa đơn và lead time phát hành hóa đơn cũng được sao chép sang hợp đồng con khi tạo (hiện chưa sao chép nên nếu đổi giữa chừng thì tháng thanh toán sẽ bị chồng hoặc bị sót)

### 1-1. Xử lý thay đổi liên quan đến tháng đã xuất hóa đơn (**Quyết định: A**・2026/10/01 bổ sung 2)

Mối lo của Long: khi có thay đổi liên quan đến tháng đã xuất hóa đơn trước (thanh toán trước 2 tháng・thanh toán theo năm), chỉ xử lý ở mức ghi chú là không tốt.

Quyết định hiện tại (STEP3 bổ sung P2) là "phần của tháng đã xuất hóa đơn sẽ được bù trừ ở hóa đơn kế tiếp (dòng điều chỉnh âm)". Tuy nhiên chưa quyết nơi lưu dữ liệu điều chỉnh và cách hiển thị trên màn hình.

| Phương án | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A (Quyết định)** | Tại thời điểm phê duyệt, tính chênh lệch theo từng tháng đã xuất hóa đơn và **hệ thống tự động tạo** "dòng điều chỉnh". Hóa đơn kế tiếp sẽ có từng dòng như "Phần chu kỳ tháng 12/2026 Đổi gói (100→50) chênh lệch −¥22,000". Màn hình phê duyệt hiển thị "Số tháng đã xuất hóa đơn n tháng・Tổng chênh lệch ¥…・Tất toán ở hóa đơn kỳ tới". Tab hợp đồng của hợp đồng con hiển thị giá trị mới, dòng chi phí giữ nguyên giá trị lúc xuất hóa đơn với trạng thái "Đã xuất hóa đơn", có link tới dòng điều chỉnh | Không phụ thuộc vào ghi chú của con người. Khách hàng cũng thấy lý do trên hóa đơn. Giữ nguyên P2 | Cần ghi vào đặc tả quy tắc tính chênh lệch (không tính theo ngày・tính theo đơn vị tháng chu kỳ) |
| B | Không nhận thay đổi liên quan đến tháng đã xuất hóa đơn (chọn tháng bắt đầu từ tháng chưa xuất hóa đơn) | Triển khai đơn giản nhất | Không đáp ứng được yêu cầu muốn đổi từ tháng hiện tại (thanh toán theo năm, v.v.) |
| C | Hủy hóa đơn đã xuất rồi phát hành lại | Hóa đơn có số tiền đúng | Hủy trên Bill One là thao tác thủ công. Nếu đã nhận thanh toán thì phải hoàn tiền |

Bổ sung: Việc điều chỉnh giá thanh toán theo năm là "giữ nguyên giá hiện tại đến tháng khởi tính kế tiếp" (S3-2). Với phương án A cũng không tạo chênh lệch cho việc sửa đổi giá.

## 2. Danh sách bản sao (sao chép gì・khi nào sao chép・khi nào chốt)

| Hạng mục | Nguồn | Thời điểm sao chép | Thời điểm chốt | Nếu nguồn thay đổi sau khi chốt |
|---|---|---|---|---|
| Gói・Course・thiết lập giao hàng | Cơ sở・hợp đồng cha・gói | Khi tạo hợp đồng con | Xác nhận thanh toán (ngày 25) | Chưa xác nhận thì ghi đè／đã xác nhận thì dòng điều chỉnh (§1-1) |
| Giá (thế hệ giá của gói) | Master gói | Khi tạo | Khi tạo | Sửa giá được áp dụng từ các hạng mục chưa xác nhận kể từ "chu kỳ tháng bắt đầu áp dụng" (áp dụng cả cho hợp đồng hiện có: trả lời Q7). Việc sửa giá thanh toán là: lọc hợp đồng con theo thế hệ gói giá・course đối tượng, chỉ định chu kỳ bắt đầu áp dụng và chuyển hàng loạt sang thế hệ mới (REQ-PM-023). Việc thông báo trước do vận hành thực hiện thủ công bằng phát thông báo. 〔Nguồn gốc: 契約_詳細要件 §8B-3・REQ-CT-294〕 |
| Số tiền tùy chọn・giảm giá | Master tùy chọn・giảm giá | Khi tạo | Khi tạo | Như trên (phương án thống nhất sửa master cũng theo thế hệ + tháng bắt đầu áp dụng) |
| Thuế suất・số tiền doanh nghiệp chịu | Master・cơ sở | Khi tạo | Khi tạo | Không ghi đè |
| Phương thức thanh toán・chu kỳ thanh toán | Nơi gửi hóa đơn | Khi tạo | Khi tạo | Chưa xác nhận thì ghi đè |
| **Nơi gửi hóa đơn・lead time (bổ sung)** | Cơ sở | Khi tạo | Khi tạo | Thay đổi áp dụng "từ tháng chu kỳ chưa được tạo" |
| Tên người nhận・địa chỉ gửi (tên doanh nghiệp nhận hóa đơn・người phụ trách thanh toán) | Doanh nghiệp・cơ sở・người phụ trách | **Khi phát hành** hóa đơn | Khi phát hành | Dù thay đổi trong khoảng từ sau khi xác nhận ngày 25 đến trước khi phát hành ngày 1 thì vẫn đưa vào hóa đơn của tháng đó (trả lời Q5). **Chỉ chốt số tiền** |
| Số tiền thanh toán・thuế | Dòng chi phí của hợp đồng con・tất toán thực tế・dòng điều chỉnh | Xác nhận thanh toán (ngày 25) | Khi xác nhận | Không thay đổi. Sửa bằng dòng điều chỉnh hoặc hủy・phát hành lại |
| Ngày・số lượng của dữ liệu giao hàng | Dự kiến giao・đơn hàng | Bắt đầu order | Hạn chót (số lượng)／gửi chỉ thị xuất hàng (locked) | §7 |

## 3. Xác nhận thanh toán và sửa sai

- Biến **dòng điều chỉnh** thành một dữ liệu riêng (ghi bù trừ・chênh lệch・chuyển kỳ・thanh toán lại vào đây). Hạng mục: hóa đơn gốc・tháng chu kỳ gốc・loại・lý do・số tiền chưa thuế・thuế suất・hóa đơn đã đưa vào. Khi tạo hóa đơn kế tiếp, lấy các dòng điều chỉnh chưa được đưa vào
- Trạng thái hóa đơn: Đã tạo → Xác nhận → Đã phát hành →(Đã chuyển kỳ／Hủy). **Mỗi hóa đơn chỉ sửa sai bằng một cách** (hóa đơn đã chuyển kỳ không thể hủy, hóa đơn đã hủy không phải đối tượng bù trừ)
- Thanh toán lại cho khoản chưa nhận thanh toán (Q4・**quyết định bổ sung 5**): **Cho phép rút lại việc thanh toán lại trước khi phát hành.** Khi biết đã nhận thanh toán, vận hành rút lại khoản thanh toán lại và nếu cần thì thanh toán lại với nội dung đúng (không áp dụng cách bù bằng dòng điều chỉnh âm). Việc nhận thanh toán vẫn không được nhập vào như hiện nay
  - Chờ xác nhận: Cách xử lý khi biết đã nhận thanh toán **sau khi** hóa đơn có chứa khoản thanh toán lại đã được phát hành (theo cách hiểu của Claude thì sửa bằng hủy・phát hành lại)

## 4. Quy tắc tháng áp dụng

- Đăng ký liên quan đến hợp đồng: nếu trước hạn chót order (mặc định ngày 15 tháng trước) thì từ chu kỳ tháng sau, nếu quá hạn thì từ tháng sau nữa (lấy 2 lựa chọn D4・E-7'＝A làm chuẩn)
- **Thiết lập có phí (chế độ khách・ES-QR, v.v.) thì cả thiết lập lẫn phí đều có hiệu lực theo quy tắc hạn chót (trả lời Q6)**. **Ghi đè**: STEP2 Q2 "có hiệu lực với mọi hợp đồng con từ chu kỳ hiện tại trở đi" không áp dụng cho thiết lập có phí (thiết lập không có phí giữ như hiện nay)
  - **Chế độ khách là ngoại lệ (hong trả lời 2026-10-03・K3＝A)**: Ngay khi lưu trên Web doanh nghiệp là dùng được／dừng được (cờ của hợp đồng con từ tháng chu kỳ hiện tại trở đi). Phí (OP000003) được thêm vào／bỏ ra từ tháng đầu tiên theo quy tắc hạn chót, không thay đổi phí cho các tháng trước đó và các tháng đã xác nhận・đã xuất hóa đơn (sự khác biệt giữa cờ và phí được đánh dấu bằng `app.guestSplit`). Khi lưu có hộp thoại xác nhận "Dùng được ngay. Phí tính từ phần tháng ○"

## 5. Tạm dừng

**Quyết định (TL-2・bổ sung)**:

- Trong thời gian tạm dừng không tạo hợp đồng con (giữ nguyên 28-1a)
- **Trong thời gian tạm dừng không tất toán thực tế.** Đầu kỳ tạm dừng thực hiện kiểm tra tồn kho và tất toán phần đến lúc đó (trả lời Q1＝B). Chênh lệch do bán hàng trên thiết bị để nguyên trong thời gian tạm dừng sẽ được bù khi kiểm tra tồn kho lúc mở lại
- **Ghi đè**: STEP3 bổ sung P5 (trong thời gian tạm dừng nếu cần vẫn tất toán, thanh toán gộp khi mở lại・hủy hợp đồng)
- Việc dừng tính thời gian sử dụng tối thiểu trong thời gian tạm dừng chỉ áp dụng cho **thiết bị để nguyên** (Q8＝A・**quyết định bổ sung 5**). Thiết bị để nguyên thì phần còn lại trước khi tạm dừng được tiếp nối khi mở lại (STEP1). **Thiết bị đã thu hồi thì tính lại từ ngày lắp đặt lại** (giống danh sách hạng mục #615・#636). **Ghi đè**: Quy tắc thanh toán v1 3-4 "không tính trong thời gian tạm dừng (toàn bộ)"

**Quyết định (hong trả lời 2026-10-05): Kiểm tra tồn kho đầu kỳ tạm dừng do khách hàng (doanh nghiệp・cơ sở) thực hiện bằng kiểm tra tồn kho trên Web doanh nghiệp (cơ sở của ES giao hàng cũng vậy). Tháng kiểm tra là tháng của lần giao cuối cùng trước khi tạm dừng, và báo cáo trước khi tạm dừng bắt đầu.** (Cũ: Điều muốn xác nhận (doanh nghiệp là xe COOL・ES giao hàng là tài xế?))

## 6. Cơ sở・hợp đồng cha・dùng thử・tài khoản

### 6-1. Chuyển từ dùng thử sang triển khai chính thức (**Quyết định: A cùng hợp đồng cha・không cấp số mới**・2026/10/01 bổ sung 2. Ghi đè danh sách hạng mục §0.4)

Nhận thức của Long (bổ sung): **Từ dùng thử sang triển khai chính thức được chuyển đổi trên cùng hợp đồng cha.**
Quyết định hiện có (danh sách hạng mục §0.4・2026/09/16): **Khi chuyển thì cấp số hợp đồng cha mới.** Lý do là thời gian sử dụng tối thiểu・tiền phạt・tự động gia hạn hoàn toàn khác nhau, và thời gian sử dụng tối thiểu được tính từ ngày bắt đầu triển khai chính thức.

| Phương án | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A (Quyết định)** | Cùng hợp đồng cha. Hợp đồng cha có "lịch sử loại hợp đồng" (dùng thử: bắt đầu~kết thúc, triển khai chính thức: bắt đầu~), thời gian sử dụng tối thiểu・tiền phạt・tự động gia hạn được xác định từ ngày bắt đầu triển khai chính thức | Cơ sở và hợp đồng cha hoàn toàn 1-1. Từ góc nhìn khách hàng, số hợp đồng không đổi | Phải sửa §0.4 và demo (tham chiếu chuyển đổi・số mới). Việc xác định điều kiện hợp đồng có thêm điều kiện "kỳ nào" |
| B (Đặc tả hiện tại) | Hợp đồng cha khác. Đồng thời chỉ có một hợp đồng hiệu lực | Điều kiện hợp đồng được tách bạch rõ ràng | Xét theo lịch sử thì cơ sở và hợp đồng cha là 1-nhiều |

Cơ sở và hợp đồng cha là 1-1. Trạng thái của cơ sở (tạm dừng, v.v.) có thể hiển thị trực tiếp từ hợp đồng cha.

### 6-2. Trạng thái cơ sở

- Trạng thái cơ sở chỉ có "đăng ký và đóng" (đăng ký tạm・đăng ký chính thức・dự kiến đóng・đã đóng)
- "Tạm dừng" không đặt ở cơ sở mà hiển thị từ hợp đồng cha và lịch sử tạm dừng (giống #585 "không giữ cờ tạm dừng ở phía cơ sở")

### 6-3. Tài khoản

- Việc hiệu lực・đình chỉ tài khoản không xác định từ trạng thái hợp đồng mà do chính tài khoản giữ
- **Cho hiệu lực trước ngày bắt đầu order của chu kỳ đầu tiên** (ví dụ: hợp đồng bắt đầu từ chu kỳ tháng 10 thì dùng được từ tháng 9 để có thể đặt hàng trên Web doanh nghiệp trong thời gian order của tháng 9). Việc cấp phát giữ nguyên như hiện nay vào lúc đăng ký tạm (mặc định check ON)
- Đình chỉ giữ nguyên như hiện nay: ngày sau hạn thanh toán của hóa đơn cuối cùng

### 6-4. Theo từng trạng thái, ai dùng được đến khi nào (tạm dừng・hủy hợp đồng) (A1・A2 đều đã quyết định: bổ sung 3・bổ sung 4)

Có 3 loại tài khoản: **tài khoản doanh nghiệp**・**tài khoản cơ sở** (Web doanh nghiệp), và **ứng dụng cá nhân** (người dùng là nhân viên mua hàng tại cơ sở).

| Trạng thái | Web doanh nghiệp (tài khoản doanh nghiệp・cơ sở) | Ứng dụng cá nhân (nhân viên mua hàng) | Nguồn |
|---|---|---|---|
| Trước khi bắt đầu hợp đồng (từ đăng ký~ngày giao đầu tiên) | Dùng được (hiệu lực trước ngày bắt đầu order của chu kỳ đầu tiên. Có thể đặt hàng・thiết lập) | Đăng ký được. Mua hàng từ ngày giao đầu tiên (đến lúc đó chưa có sản phẩm) | Bổ sung TL-5 (đề xuất) |
| Đang sử dụng | Bình thường | Bình thường | — |
| Đang tạm dừng (để nguyên thiết bị) | Chỉ xem + đổi người phụ trách (DR-3). Đăng ký mở lại・hủy hợp đồng và liên hệ | **Mua được (A1 quyết định・bổ sung 4)** (yêu cầu của khách hàng ngày 2026/08/26 "Trong thời gian tạm dừng vẫn tiếp tục dùng ứng dụng"). Trong thời gian tạm dừng không tất toán. Chênh lệch tất toán bằng kiểm tra tồn kho lúc mở lại (hoặc lúc hủy hợp đồng) (giống Q1＝B) | Thiết kế cơ bản §10-7-3, biên bản họp 2026/08/26 |
| Đang tạm dừng (đã thu hồi thiết bị) | Như trên | Không có sản phẩm nên không mua được (không chọn được cơ sở／hiển thị "Đang tạm dừng") | — |
| Đến ngày hủy hợp đồng (ngày cuối của chu kỳ cuối cùng) | Bình thường | Bình thường | — |
| Từ ngày sau ngày hủy hợp đồng~hạn thanh toán hóa đơn cuối cùng | Chỉ xem (WEB No.75) | **Không mua được** (không chọn được cơ sở đó. Xem được lịch sử mua). Tồn kho còn lại doanh nghiệp mua đứt (S4-2) (**A2＝A quyết định**) | S4-3・bổ sung 3 |
| Từ ngày sau hạn thanh toán~ | Không đăng nhập được (email đình chỉ No.16) | Không chọn được cơ sở | S4-3・REQ-CT-145 |

**A2 Sau khi hủy hợp đồng, ứng dụng cá nhân mua được đến khi nào**: Yêu cầu REQ-CT-144 (đã quyết định) là "Sau khi hoàn tất hủy hợp đồng, việc sử dụng tài khoản・ứng dụng kéo dài đến 1 tháng sau, và đình chỉ vào ngày đình chỉ". Trong khi đó S4-1・S4-2 (2026/10/01) là "xuất 1 hóa đơn cuối cùng vào tháng sau tháng hủy hợp đồng, tồn kho còn lại doanh nghiệp mua đứt theo tồn kho tính toán × đơn giá bán". Nếu sau hủy hợp đồng nhân viên vẫn mua được thì **việc doanh nghiệp mua đứt và nhân viên mua hàng sẽ tính trùng lên cùng một sản phẩm**.

| Phương án | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A (Quyết định・2026/10/01 bổ sung 3)** | Việc mua trên ứng dụng cá nhân **đến ngày hủy hợp đồng**. Từ ngày hôm sau không chọn được cơ sở đó (xem được lịch sử mua). Tồn kho còn lại do doanh nghiệp mua đứt theo S4-2. "1 tháng" trong REQ-CT-144 được hiểu lại là thời gian gia hạn cho đến khi thu hồi thiết bị (ngày dự kiến trả = ngày đình chỉ + 1 tháng) | Hóa đơn cuối cùng (1 hóa đơn vào tháng sau tháng hủy hợp đồng) thành lập nguyên vẹn. Không phát sinh tính phí trùng | Cần xác nhận với khách hàng việc hiểu lại REQ-CT-144 |
| B | Việc mua trên ứng dụng cá nhân **đến ngày thu hồi thiết bị** (theo REQ-CT-144). Kiểm tra tồn kho cuối cùng thực hiện lúc thu hồi, mua đứt theo số còn lại đó | Nhân viên có thể mua hết sản phẩm còn lại | Hóa đơn cuối cùng trở thành "tháng sau tháng thu hồi" nên lệch với S4-1. Chưa xuất được hóa đơn cuối cùng cho đến khi xác định ngày thu hồi |

## 7. Giao hàng (đổi ngày・chỉ thị xuất hàng・offline)

- **Đổi ngày sau hạn chót**: Theo quyết định mới nhất (v2.3 #63・bổ sung 9/29), sau khi đã gửi chỉ thị xuất hàng (locked) vẫn có thể đổi từng đơn một đến ngày trước ngày xuất hàng. Một thao tác đổi ngày sẽ thực hiện gộp: phiên bản mới của chỉ thị xuất hàng・chuyển đặt hàng cho sản phẩm có hạn sử dụng ngắn・thông báo cho bên ủy thác và doanh nghiệp. Không đổi Số giao hàng
  - **【Chờ xác nhận Q9】THOMAS (kho) có thể tiếp nhận phiên bản mới vào ngày trước ngày xuất hàng không.** Nếu không tiếp nhận được thì rút ngắn thời hạn có thể đổi ngày sau hạn chót xuống "đến trước khi gửi chỉ thị xuất hàng"
- **Điểm khởi đầu của locked**: Thời điểm giao CSV chỉ thị xuất hàng cho kho (nếu gửi tự động thì khi thành công, nếu giao thủ công thì khi vận hành bấm "Đã gửi")
  Nếu CSV kết quả xuất hàng ngày hôm sau không có Số giao hàng đó thì cần xác nhận (như đề xuất)
- **Xung đột offline**: Thiết bị đầu cuối chỉ gửi báo cáo sự thật, trạng thái do máy chủ quyết định. Nếu báo cáo giao hàng đến cho đơn giao hàng đã bị vận hành hủy thì không bỏ đi mà đưa vào danh sách cần xác nhận để vận hành chọn (Q11＝A・quyết định bổ sung 5)
- **Hoàn thành mặc định**: Giữ nguyên như hiện nay. Nếu biết là chưa đến nơi thì tự động hoàn lại tồn kho qua đăng ký sự cố (nếu đã quyết toán thì ở lần tất toán tháng sau) (Q10＝A・quyết định bổ sung 5)
- **Ngày nghiệp vụ**: Ngày được xử lý chỉ là "ngày" theo giờ Nhật Bản, và chỉ có một cơ chế trả về "hôm nay" (sửa việc cố định UTC ở tích hợp §4-8)

## 8. Đặt hàng

- Sau khi phê duyệt đặt hàng chính thức thì không sửa (giữ nguyên STEP6 bổ sung R1)
- Chi tiết đặt hàng có "nhu cầu của lần giao nào", hiển thị hằng ngày số dư・số thiếu. Khi hết hàng không tự động giảm, vận hành chọn hàng thay thế・lần giao cần giảm (Q12＝A・quyết định bổ sung 5)

## 9. Chuyển đổi (Giai đoạn 1→2)

- **Không bắt buộc ngày cho thuê (bổ sung).** Thiết bị chưa nhập được chuyển đổi dưới dạng "Ngày cho thuê chưa nhập", thời gian sử dụng tối thiểu・tiền phạt được tính bằng **giá trị tạm lấy tháng năm bắt đầu hợp đồng ban đầu làm mốc** và hiển thị "ước tính". Khi vận hành nhập sau thì tính lại (như đề xuất)
- **Thiết lập ban đầu cho giá (trả lời Q7)**: Giá sau sửa đã được áp dụng cho khách hàng hiện có nhưng hệ thống không quản lý. Khi chuyển đổi cần nhập làm thiết lập ban đầu "thế hệ giá đang áp dụng (lần sửa đổi thứ ◯)" và việc áp dụng tùy chọn・giảm giá cho từng cơ sở
- Quyết định một tháng chu kỳ chuyển đổi, các hóa đơn trước đó chỉ để tham chiếu (không tính lại) (như đề xuất)
- Hợp đồng hiện có được chuyển đổi với course ES Lite. Cơ sở muốn Standard (Frozen) thì đổi hàng loạt bằng CSV và giữ nguyên số tiền hàng tháng bằng giảm giá chênh lệch (REQ-PM-032). 〔Nguồn gốc: 契約_詳細要件 §8B-1・REQ-CT-299〕

### 9-1. CSV chuyển đổi (khách hàng hiện có・khoảng 600 công ty) 〔hong trả lời 2026-10-03 (xác nhận lại A11＝A)〕

| Hạng mục | Quy định |
|---|---|
| Mục đích | Nhập hàng loạt vào Giai đoạn 2 các khách hàng hiện có (khoảng 600 công ty) có dữ liệu ở Giai đoạn 1. **Khác với CSV đăng ký mới (Form_đăng_ký.md §10-8-1)** |
| Cái được tạo | Tạo trực tiếp doanh nghiệp・cơ sở・hợp đồng cha・hợp đồng con・thiết bị (cho thuê)・thế hệ giá・việc áp dụng tùy chọn／giảm giá ở trạng thái **đang sử dụng (đăng ký chính thức・có hiệu lực)**. **Không qua tiếp nhận・phê duyệt. Không gửi email** |
| Khóa | **ID của Giai đoạn 1** (doanh nghiệp・cơ sở). Nếu có cùng khóa thì cập nhật, nếu không thì tạo (quy tắc nhập chung 28-183). Bảo trì dữ liệu có 2 lần (lần 1 tháng 11~12, lần 2 là phần chênh lệch ngay trước phát hành) nên có thể nhập lại bằng cùng một file |
| Hạng mục còn thiếu | Có thể nhập với ô trống (ngày cho thuê là "ước tính" §9). Hạng mục còn thiếu hiển thị ra danh sách **"Cần bổ sung"**, vận hành điền trên màn hình. Hiển thị theo từng dòng hạng mục nào còn thiếu |
| Giá trị mặc định | Course là ES Lite (§9). Ngày bắt đầu hợp đồng là ngày chuyển đổi (28-175). Giảm giá gắn khi chuyển đổi như ưu đãi chuyển đổi cũng nhập bằng cột |
| Tài khoản | Được tạo khi chuyển đổi, nhưng email hướng dẫn đăng nhập sẽ gửi riêng theo thời điểm phát hành (không gửi khi nhập chuyển đổi) |
| Quy tắc nhập | 2 giai đoạn (kiểm tra→đăng ký). **Dòng thiếu hạng mục bắt buộc (tên doanh nghiệp・tên cơ sở・địa chỉ, v.v.) là lỗi**, thiếu hạng mục tùy chọn thì cho qua với "Cần bổ sung" |
| ID | **Dùng nguyên ID của Giai đoạn 1** (khách hàng đang đăng nhập bằng ID đó. hong trả lời 2026-10-05) |
| Giao hàng | Không xuất được từ Giai đoạn 1. Không đưa vào CSV chuyển đổi, sau chuyển đổi vận hành sẽ nhập (hong trả lời 2026-10-05) |
| Người phụ trách・giá riêng của doanh nghiệp | Người phụ trách không giới hạn số lượng・giá riêng của doanh nghiệp nhập bằng CSV → cả hai đều là file riêng (hong trả lời 2026-10-05) |
| Cột | **Phương án** (phần còn lại chờ xác nhận với khách hàng): [CSV_chuyển_đổi_Đề_xuất_cột_20261003.md](../CSV_chuyển_đổi_Đề_xuất_cột_20261003.md) |

## 10. Chưa quyết・chờ trả lời

| No. | Nội dung | Trạng thái |
|---|---|---|
| Phần còn lại của Q4 | Khi biết đã nhận thanh toán sau khi hóa đơn có chứa khoản thanh toán lại được phát hành | **Đã trả lời 2026-10-05**: hủy rồi phát hành lại (sổ cái E) |
| Q9 | Kho có tiếp nhận phiên bản mới vào ngày trước ngày xuất hàng không | Xác nhận với kho |
| Q13 | Phí giao hàng bổ sung vật tư là ¥1,000 (STEP4 O-3) hay ¥2,000 (STEP5 §2-5) | Như đề xuất = coi STEP5 mới hơn (¥2,000) là chuẩn. Số tiền xác nhận với khách hàng |
| REQ-CT-144 | Hiểu lại "1 tháng" sau khi hủy hợp đồng là thời gian gia hạn cho đến khi thu hồi thiết bị | Xác nhận với khách hàng |
| §5 | Ai thực hiện kiểm tra tồn kho đầu kỳ tạm dừng | **Đã trả lời 2026-10-05**: khách hàng (doanh nghiệp・cơ sở)・tháng của lần giao cuối cùng trước khi tạm dừng (sổ cái E) |

Đã quyết định (bổ sung 5): Q4 (rút lại rồi thanh toán lại)・Q8 (chỉ dừng thiết bị để nguyên)・Q10 (hàng chưa đến của hoàn thành mặc định tự động hoàn lại)・Q11 (xung đột offline cần xác nhận, vận hành chọn)・Q12 (hết hàng do vận hành chọn)・Q14 (quyền của nhân viên kho lấy STEP6 bổ sung W1 làm chuẩn, sửa tích hợp §17-6)・Q15 (sau khi hủy hợp đồng, chỉ người phụ trách thanh toán còn đổi được đến hóa đơn cuối cùng).

## 11. Nơi cần sửa (phản ánh sau STEP5)

> 2026-10-03: Các dòng của "Danh sách hạng mục (doanh nghiệp・cơ sở・hợp đồng・hợp đồng con)" đã được phản ánh vào 契約_00~07 (giá trị cũ còn lại ở "(Cũ: …)" mỗi nơi). Quy tắc thanh toán v1 đã phản ánh 3-1 (không tất toán trong thời gian tạm dừng). 3-4 (thời gian sử dụng tối thiểu chỉ dừng với thiết bị để nguyên) đang xác nhận với hong, dòng điều chỉnh・hủy khoản thanh toán lại・tên người nhận tại thời điểm phát hành (Q5) chưa phản ánh.

| Tài liệu | Nơi cần sửa |
|---|---|
| Danh sách hạng mục (doanh nghiệp・cơ sở・hợp đồng・hợp đồng con) | **§0.4 Dùng thử→triển khai chính thức là cùng hợp đồng cha (không cấp số mới)・hợp đồng cha giữ kỳ của loại hợp đồng**／§0.2 "tự động tạo trước 1 tháng" → thống nhất với quy tắc tạo trước／sao chép nơi gửi hóa đơn・lead time sang hợp đồng con／màn hình và hạng mục dòng điều chỉnh／#609~615 tạm dừng (không tất toán・kiểm tra khi bắt đầu)／xóa #612 "chưa định cũng được"／công thức cũ và phần lẻ ở §0.8 |
| Quy tắc thanh toán v1 | 3-2~3-4 tạm dừng (không tất toán・thời gian sử dụng tối thiểu chỉ dừng với thiết bị để nguyên)／dòng điều chỉnh và trạng thái hóa đơn／hủy khoản thanh toán lại／tên người nhận tại thời điểm phát hành (Q5)／2-2 sau hạn chót có 2 lựa chọn |
| Thiết kế cơ bản | §5-1 trạng thái (cơ sở là đăng ký và đóng, tạm dừng lấy từ hợp đồng cha)／§7-1 sau hạn chót có 2 lựa chọn／§10-6-2・§13 bỏ các hạng mục đã quyết định khỏi mục chưa quyết／thời điểm hiệu lực tài khoản |
| Đặc tả tổng hợp v2.3 | §10-2・§15-13・§16-5・§17-3 "sau locked không đổi ngày" → thống nhất với §8-3／§4-8 UTC→giờ Nhật Bản／§16-1 ngày lễ dùng API công khai／§17-6 quyền nhân viên kho (STEP6 bổ sung)／§9-3 luồng vật tư |
| Danh sách hạng mục master | §0.6 nếu thống nhất cách sửa đổi thành "thế hệ + tháng bắt đầu áp dụng"／thời điểm bắt đầu hiệu lực của thiết lập có phí (Q6) |
| Đặc tả DEV | Bảng cho dòng điều chỉnh・sổ cái tồn kho cơ sở・liên kết giữa đặt hàng và nhu cầu・giao hàng vật tư・nhân viên kho・outbox |
