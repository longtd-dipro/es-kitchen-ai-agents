# Kiểm tra tính nhất quán xung quanh Plan Master (2026/09/30)

> hong: "Hãy kiểm tra lại thông số hiện tại và demo, xem có sót gì không, giữa các màn hình có xung đột không."
> Phạm vi: các quyết định ngày 2026/09/30 (28-170〜186) và các màn hình, tài liệu liên quan. **Tài liệu này chỉ nêu điểm cần chỉnh, đặc tả và demo vẫn chưa được sửa.**
> Màn hình đã xem: demo tích hợp v1.20 (Quản lý đơn đăng ký · Doanh nghiệp · Cơ sở · Hợp đồng con · Thanh toán · Quản lý Master), form đăng ký doanh nghiệp (es_apply_form), Web doanh nghiệp Quản lý cơ sở (es_corp_branch). Tài liệu đã xem: Quyết định_phụ lục v2.3_Plan Master / liên quan đến đơn đăng ký / mặc định của hộp vật tư, Quyết định_Master tủ lạnh và cấu hình theo gói, Danh sách mục Master, Danh sách mục Doanh nghiệp·Cơ sở·Hợp đồng·Hợp đồng con, Đặc tả DEV.
> Mức ưu tiên: **Cao** = số tiền thanh toán・ID・phán định bị lệch / **Trung bình** = cách diễn đạt・cách hoạt động khác nhau giữa các màn hình / **Thấp** = chỉ là vấn đề của demo.

---

## A. Điểm không khớp giữa các màn hình (xung đột)

| # | Ưu tiên | Nội dung | Ở đâu | Đúng (quyết định) | Cách sửa (đề xuất) |
|---|---|---|---|---|---|
| A1 | Cao | **Ý nghĩa của ID gói khác nhau tùy màn hình.** Plan Master là "ES000004 = gói 100 (course tách riêng)", còn đơn đăng ký・tiếp nhận・hợp đồng con・Web doanh nghiệp dùng ID riêng theo từng course như "ES000012 = ES Standard 100 / ES000008 = ES Lite 50". Trong danh sách Plan Master, **ES000008 = gói 300**, nên cùng một ID đang chỉ đến các gói khác nhau | es_apply_form (PLAN_TBL), es_apply (ap_data・cfg_*・PLAN_STD của engine), ID gói của hợp đồng con (mẫu・lựa chọn PLANS), es_corp_branch | Plan Master hiện hành (1 gói có các tab Standard・Lite). Hợp đồng con = ID gói + loại menu (course) + gói giá được áp dụng (28-181) | Đồng bộ gói của toàn bộ demo theo ID của Plan Master (ES000003 = gói 50, ES000004 = gói 100…), course hiển thị ở ô riêng |
| A2 | Cao | **Giới hạn cung cấp hàng tháng gấp 4 lần.** PLAN_TBL của form đăng ký là 50→200, 100→400, 150→600 (số suất ăn × 4) | es_apply_form | Plan Master: gói 100 = 100 suất/tháng (§6 ④) | Đổi PLAN_TBL theo giá trị của Plan Master. Việc phán định dung lượng・tính phần doanh nghiệp chi trả cũng sẽ thay đổi theo |
| A3 | Cao | **"Thiết bị có trong gói" ở form đăng ký đã cũ.** Miễn phí được phán định bằng ngưỡng của Master dòng máy (fl／fs), dòng máy là 46L／84L／120L・tủ đông 3 loại, hộp vật tư 1 loại × số lượng, dung tích tủ đông theo "tỷ lệ đông lạnh 30%", số lần giao hàng tiêu chuẩn là 2 lần cho mọi gói | es_apply_form (MODELS・inclBase・needOf・dstd) | 28-182 (chỉ quyết định bằng thiết bị cho thuê tiêu chuẩn), tủ lạnh 4 dòng (48／84／105／142L), hộp vật tư 5 loại (28-160), không giữ "tỷ lệ đông lạnh" (28-155), ES50 = 1 lần (bảng tủ lạnh) | Dựng lại form đăng ký theo thiết bị cho thuê tiêu chuẩn・số lần giao hàng tiêu chuẩn của Plan Master |
| A4 | Cao | **Máy bán hàng tự động vẫn là "báo giá riêng".** Form đăng ký không hiển thị tạm tính gói khi chọn máy bán hàng tự động | es_apply_form | 28-184 (gói giá của ES Lite (máy bán hàng tự động)) · 28-186 (phí khởi tạo) | Hiển thị phí gói và phí khởi tạo của máy bán hàng tự động. Tuy nhiên, việc có cho chọn ở đơn đăng ký hay không còn phụ thuộc cách quyết định B2 (khảo sát hiện trường) |
| A5 | Cao | **Gói ở hợp đồng con ① là 1 dòng・8%・"phí khởi tạo".** Demo là 1 dòng "Số tiền cố định của gói / Phí khởi tạo / 22,000 yên / 8%". Demo thanh toán cũng chỉ 1 dòng "Số tiền cố định của gói" | Hợp đồng con "① Số tiền thanh toán cố định (trả trước)", es_billing_ops | 28-148・28-150: phí gói gồm 2 dòng là phí cơ bản (10%) + phần doanh nghiệp chi trả (8%), loại phí là hàng tháng. Với gói 100 sửa đổi lần 3 là 49,500 yên (cơ bản 40,241 / doanh nghiệp chi trả 9,259) | Đổi bảng ① và demo thanh toán thành 2 dòng. Số tiền lấy từ gói giá của Plan Master |
| A6 | Trung bình | Mẫu "Điều kiện kế thừa từ gói" của hợp đồng con là "Khoanh 4・giới hạn đông lạnh 120／lạnh 180" | Hợp đồng con (tab Hợp đồng) | Plan Master gói 100: đông lạnh 20／lạnh 80, giá là "Sửa đổi lần 3" | Đồng bộ mẫu theo Plan Master |
| A7 | Trung bình | **Có 2 cách gọi gói giá.** Biên bản họp・hợp đồng con gọi là "khoanh 1〜khoanh 4", màn hình hiện hành gọi là "Giá gốc／Sửa đổi lần 1／Sửa đổi lần 2／Sửa đổi lần 3" | Hợp đồng con・tài liệu quyết định・Plan Master | Cách gọi của màn hình hiện hành | Quyết định bảng đối chiếu (Giá gốc = khoanh 1 …). Hiển thị của hợp đồng con theo cách gọi của màn hình hiện hành |
| A8 | Trung bình | Máy bán hàng tự động VM000001 trong Master dòng máy có phân loại công khai = "chỉ vận hành mới chọn được". Trong khi đó form đăng ký cho chọn máy bán hàng tự động, và Plan Master có ES Lite (máy bán hàng tự động) | Danh sách・chi tiết Master dòng máy, es_apply_form | Chưa quyết định (đi cùng B2) | Sau khi quyết định có cho chọn máy bán hàng tự động ở đơn đăng ký hay không, sẽ đồng bộ phân loại công khai |
| A9 | Trung bình | Phán định hiển thị tùy chọn OP000017 "Đổi decal máy bán hàng tự động" chỉ cho cơ sở có máy bán hàng tự động đang dựa vào "tên chứa chữ máy bán hàng tự động" | es_apply_form, Master tùy chọn | Đã có course ES Lite (máy bán hàng tự động) theo 28-184 | Có thể chuyển thành "chỉ hiển thị khi course = ES Lite (máy bán hàng tự động)" (cần xem xét thêm ô course áp dụng vào Master tùy chọn) |
| A10 | Trung bình | Lựa chọn đổi gói ở Web doanh nghiệp Quản lý cơ sở là ID theo từng course (ES Lite 50／ES Standard 100). Tủ lạnh → máy bán hàng tự động cần khảo sát hiện trường, nhưng chưa có quy định không hiển thị trong đơn đổi | es_corp_branch | A1・B2 | Đổi gói theo gói + course. Việc đổi course sang ES Lite (máy bán hàng tự động) sẽ là đơn dạng "tư vấn" (sau khi B2 được quyết định) |
| A11 | Trung bình | "Phân loại giao hàng" của hợp đồng con có thể chọn cả COOL便. Hợp đồng con ES Lite (máy bán hàng tự động) cũng không có kiểm tra chặn | Hợp đồng con (tab Hợp đồng), danh sách mục | Máy bán hàng tự động cố định là ES配送便 (28-19・28-184) | Nếu course của hợp đồng con = ES Lite (máy bán hàng tự động) thì cố định phân loại giao hàng là ES配送便 (kiểm tra khi lưu) |
| A12 | Trung bình | **Số liệu thời gian sử dụng tối thiểu có 2 phiên bản.** Nội dung chính "tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng", ví dụ trong Master dòng máy・demo là "tủ lạnh 12 tháng・máy bán hàng tự động 24 tháng" | Danh sách mục §0.11, danh sách mục Master, demo Master dòng máy | Chưa có phản hồi (K-03) | Nhận phản hồi rồi đồng bộ |
| A13 | Thấp | Cách gọi course: màn hình là "ES Lite (tủ lạnh)", giá trị course trong CSV là "Lite" | Plan Master, mẫu nhập CSV | 28-184 | Quyết định có đồng bộ giá trị CSV thành "Lite (tủ lạnh)" hay không (hiện đang ghi trong phần giải thích là Lite = ES Lite (tủ lạnh)) |
| A14 | Thấp | "Dữ liệu hiện tại" của demo nhập CSV và mẫu của màn hình chi tiết khác nhau một phần (miễn trừ của ES000004 là 250／300, tỷ lệ sắp hết của Lite là 30／25) | Demo Plan Master | — | Là khác biệt có chủ đích để minh họa việc ghi đè. Ghi vào phần giải thích của demo |
| A15 | Thấp | Dù mở gói khác từ danh sách Plan Master, nội dung trong tab (giới hạn・giá・thiết bị) vẫn là mẫu của gói 100. Ngay cả gói không chọn được máy bán hàng tự động, tab ES Lite (máy bán hàng tự động) vẫn hiển thị | Demo Plan Master | — | Là hạn chế của demo. Tab nào bỏ chọn course thì vô hiệu hóa |

## B. Chỗ thiếu trong đặc tả (chưa quyết định・chưa ghi)

| # | Ưu tiên | Nội dung | Cần quyết định |
|---|---|---|---|
| B1 | Cao | **Đặc tả DEV (nguồn chuẩn của mô hình dữ liệu) không có bảng của Plan Master.** plan／plan_course (3 loại course)／plan_price (thế hệ・phí khởi tạo)／plan_std_equipment／tax_rate, price_revision_id・3 giá trị course của hợp đồng con, đặc tả nhập CSV | Bổ sung vào đặc tả DEV (công việc chép lại nội dung đã quyết định) |
| B2 | Cao | **Luồng tiếp nhận tủ lạnh → máy bán hàng tự động (khảo sát hiện trường).** Loại đơn・trạng thái (chờ khảo sát hiện trường)・ô ngày khảo sát và kết quả・từ chối khi không lắp đặt được・cách quyết định tháng chu kỳ bắt đầu. **Khi chọn máy bán hàng tự động ở đơn đăng ký mới thì có chen khảo sát hiện trường hay không** | Đang xác nhận với hong (phương án lần trước) |
| B3 | Cao | Phán định "hợp đồng con dùng course máy bán hàng tự động **lần đầu**" của 28-186. Nếu hợp đồng gốc từng có hợp đồng con ES Lite (máy bán hàng tự động) trước đó thì không phải "lần đầu", đúng không? Khi máy bán hàng tự động → tủ lạnh → máy bán hàng tự động thì có tính lại không? Dùng thử → triển khai chính thức thì sao | Quy tắc phán định |
| B4 | Trung bình | Khi thu hồi tủ lạnh lúc chuyển từ tủ lạnh → máy bán hàng tự động, nếu còn trong thời gian sử dụng tối thiểu của tủ lạnh thì có phát sinh phí hủy hợp đồng không | Đang xác nhận với hong |
| B5 | Trung bình | Số tiền phí khởi tạo có thay đổi theo gói (số suất ăn) không (demo tạm đặt ¥50,000 cho mọi thế hệ) | Đang xác nhận với hong |
| B6 | Trung bình | **Ai được thay đổi** "gói giá được áp dụng" (28-181) của hợp đồng con. Có hiển thị trên Web doanh nghiệp không・lịch sử thay đổi và thông báo | Quyền hạn・phê duyệt・thông báo |
| B7 | Trung bình | **Chưa có màn hình Master thuế suất.** Plan Master chọn từ Master thuế suất (28-149), nhưng Quản lý Master không có màn hình lẫn demo | Làm màn hình, hay đưa vào Master dropdown dùng chung (§6 ⑥) |
| B8 | Trung bình | Đối tượng của chênh lệch Standard Up (DC000003) có bao gồm ES Lite (máy bán hàng tự động) → ES Standard không | Ghi rõ là ngoài đối tượng (đề xuất) |
| B9 | Trung bình | Khi nâng gói trong khi vẫn dùng máy bán hàng tự động (ví dụ: máy bán hàng tự động 100 → 150), nếu số lượng chứa tối đa của máy bán hàng tự động không đủ cho số lượng của 1 lần giao hàng thì xử lý thế nào (đổi dòng máy・phí khởi tạo) | Quy tắc |
| B10 | Trung bình | Công thức tính số lượng chứa tối đa của máy bán hàng tự động (Master dòng máy OPEN 10). Cần để phán định với số lượng của 1 lần giao hàng (28-184) | Công thức tính |
| B11 | Thấp | Nhập CSV: có để CSV chỉ định ID của gói mới không (hiện là khóa tạm + đánh số tự động) / quyền nhập / ghi "nhập CSV" vào lịch sử thay đổi | Chưa có phản hồi |
| B12 | Thấp | §5-1 "Số lần giao hàng và tùy chọn" của đặc tả tích hợp chưa theo từng nhóm nhiệt độ (28-154) | Sửa đặc tả tích hợp |

## C. Ghi chú cũ trong tài liệu (chưa cập nhật tình trạng phản ánh)

| # | Tài liệu | Ghi chú cũ | Hiện tại |
|---|---|---|---|
| C1 | Cuối tài liệu Quyết định_Master tủ lạnh và cấu hình theo gói, phần tình trạng phản ánh | "Danh sách mục Master §0.9-3・0.9-4／thiết bị cho thuê tiêu chuẩn của Plan Master: chưa phản ánh" | Thiết bị cho thuê tiêu chuẩn của Plan Master đã phản ánh ở v1.15・v1.17. Tên dòng máy ở đơn đăng ký・hợp đồng・thanh toán thì chỉ form đăng ký là chưa phản ánh |
| C2 | Cuối tài liệu Quyết định_phụ lục v2.3_mặc định của hộp vật tư | "Demo (dòng BX của danh sách Master dòng máy…) chưa phản ánh" | Master dòng máy・Plan Master đã phản ánh. Chỉ form đăng ký là chưa phản ánh |
| C3 | Quyết định_phụ lục v2.3_Plan Master §2 #11・§7 | "Có miễn phí hay không được phán định bằng ngưỡng của Master dòng máy (⑫B)" / tình trạng phản ánh với tiền đề "không làm demo Plan Master" | Theo 28-182 đã thống nhất về thiết bị cho thuê tiêu chuẩn, theo 28-176 đã có demo |
| C4 | Danh sách mục Master §0.9-3 | Bảng ngày 2026/09/18 (46L／120L・tủ đông) vẫn còn trong nội dung chính (đã hủy bằng chú thích) | Thay chính bảng đó bằng cấu hình mới |

## D. Những điểm đã xác nhận (không có mâu thuẫn)

- Chênh lệch Standard Up: −¥3,500 trong danh sách áp dụng của hợp đồng con・cơ sở = Standard 49,500 − Lite 46,000 của gói 100 sửa đổi lần 3 trong Plan Master (28-170・28-174).
- Số lần giao hàng tiêu chuẩn: Plan Master (ES50 = 1, từ ES100 trở lên = 2) và số lần của PLAN_STD trong demo tiếp nhận giống nhau (ID thì khác như ở A1).
- Dung tích: RF000001 của Master dòng máy (48L・số lượng chứa tối đa 50) ≧ số lượng của 1 lần giao hàng của gói 100 (Standard 40／Lite 50).
- Kiểm tra khi lưu của Plan Master và kiểm tra khi nhập CSV theo cùng một quy tắc (28-178・28-182・28-184).
- Việc chọn được gói giá ở hợp đồng con (28-181) và việc tính chênh lệch theo thế hệ của hợp đồng con (28-174) có liên kết với nhau.

## Thứ tự sửa (đề xuất)

1. **Gộp A1〜A5 (cao) lại**: dựng lại form đăng ký theo Plan Master (ID・giới hạn・số lần giao hàng tiêu chuẩn・thiết bị cho thuê tiêu chuẩn・giá máy bán hàng tự động), đồng bộ cách ghi gói ở tiếp nhận・hợp đồng con・Web doanh nghiệp・thanh toán và 2 dòng của ①.
2. **B1**: chép bảng của Plan Master vào đặc tả DEV.
3. **Sau khi nhận phản hồi B2〜B5**: đưa luồng tiếp nhận máy bán hàng tự động (khảo sát hiện trường) và phán định phí khởi tạo vào demo.
4. Cập nhật tình trạng phản ánh của C (làm được ngay).

---

## Tình trạng phản ánh (2026/09/30・demo v1.21)

hong: "Vâng, hãy phản ánh." (thứ tự sửa 1 = A1〜A5). Patch: `項目一覧_生成スクリプト/patch_plan_align_20260930.py`.

| # | Tình trạng | Nội dung |
|---|---|---|
| A1 | **Đã phản ánh** | Đã đồng bộ ID gói của form đăng ký・tiếp nhận (Quản lý đơn đăng ký)・hợp đồng con・doanh nghiệp・danh sách cơ sở・Web doanh nghiệp Quản lý cơ sở theo Plan Master (ES000003 = gói 50／ES000004 = gói 100／ES000005 = gói 150／ES000006 = gói 200). Cách ghi là "ES000004 gói 100 (ES Standard)", ở ô có course riêng thì "ES000004 gói 100". Số lần giao hàng tiêu chuẩn (PLAN_STD) của tiếp nhận được tra theo gói + course |
| A2 | **Đã phản ánh** | Giới hạn cung cấp hàng tháng của form đăng ký theo con số trong tên gói (50／100／150) |
| A3 | **Đã phản ánh** | Form đăng ký: thiết bị có trong gói lấy từ thiết bị cho thuê tiêu chuẩn của Plan Master (tủ lạnh 48L／84L・tủ đông FZ-600・hộp vật tư: khay chia／khay sâu／nhóm nắp đậy／giỏ). Đã đồng bộ danh sách dòng máy theo Master dòng máy (tủ lạnh 4・tủ đông 1・máy bán hàng tự động・lò vi sóng・hộp vật tư 5). Dung tích được phán định theo số lượng của 1 lần giao hàng (không có tỷ lệ đông lạnh). Số lần giao hàng tiêu chuẩn 50 = 1 lần. Đã sửa cả test của site doanh nghiệp (apply_form/test.js) theo dung tích・chênh lệch mới |
| A4 | **Đã phản ánh** | Form đăng ký: máy bán hàng tự động theo giá của ES Lite (máy bán hàng tự động) (gói 100 ¥52,000・gói 150 ¥74,000／tháng・ES配送便) và phí khởi tạo ¥50,000 (1 lần đầu). Hướng dẫn lắp đặt sau khi khảo sát hiện trường. Gói 50 không chọn được máy bán hàng tự động (báo giá riêng) |
| A5 | **Một phần** | Mẫu dòng khoản mục của hợp đồng con ① (bảng của demo2) đã thành 2 dòng (phí cơ bản 10%／phúc lợi 8%). **Tuy nhiên bảng này hiện không hiển thị trên màn hình hợp đồng con** (phí nằm ở demo thanh toán). **Demo thanh toán (es_billing_ops) vẫn chưa**: vẫn có bảng gói riêng (23 bậc・ES000002 = gói 30… không khớp ID của Plan Master)・phần doanh nghiệp chi trả là 0／100／150 yên tùy kích cỡ gói・"Số tiền cố định của gói" 1 dòng 8%. Số tiền trong ví dụ phí của demo tiếp nhận (như "100 yên × 300 suất" ở gói 100) cũng chưa khớp với Plan Master |
| A6 | **Đã phản ánh** | "Điều kiện kế thừa từ gói" của hợp đồng con thành đông lạnh 20／lạnh 80 |
| A7 | **Đã phản ánh** | Tiếp nhận・hợp đồng con: "gói giá khoanh 4" → "Sửa đổi lần 3" |
| Khác | Đã phản ánh | Course của cơ sở máy bán hàng tự động trong demo tiếp nhận đã thành ES Lite (máy bán hàng tự động) (28-184・28-185) |

**Còn lại (ứng viên tiếp theo)**: bảng gói・2 dòng・ID của demo thanh toán (phần còn lại của A5) / số tiền ví dụ phí của demo tiếp nhận / mức trung bình・thấp của A8〜A15 / B (đặc tả DEV v.v.) / C (tình trạng phản ánh của tài liệu).
