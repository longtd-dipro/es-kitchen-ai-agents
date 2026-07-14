# BF_HỢP ĐỒNG Quản lý Hợp đồng

> Domain slug: `hop-dong` · 56 stories (Phase 1) + **21 thêm mới / 4 xóa** (Phase 2)

## Stories

| ID | EPIC | STORY | STORY_2 | STORY_3 | DESCRIPTION | PRIORITY | BUSINESS FLOW | Field (JP) | Field (VN) | Bắt buộc | Loại input | Mô tả/ Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | Trial contract | Trial contract application form |  | Form điền thông tin để doanh nghiệp đăng ký sử dụng bản dùng thử (Trial). Tổng bộ phê duyệt để cấp tài khoản. https://www.figma.com/board/iCeNUokzaWdL9KhdBqp49b/ES-Kitchen---Figjam?node-id=7102-91445&t=wYM5dtKPLQknYTa6-4 | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 会社名 | Tên công ty | Required | Text | Tên công ty bằng chữ Kanji |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | Application form for this contract | Application form for this contract |  | Form đăng ký chuyển đổi từ dùng thử sang hợp đồng chính thức. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 会社名カナ | Tên công ty (Kana) | Required | Text | Tên công ty phiên âm theo bảng chữ Katakana |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Next scheduled delivery date displayed |  | Hiển thị ngày dự kiến giao hàng tiếp theo (áp dụng cho tất cả chi nhánh nếu có). | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 部署 | Phòng ban | Optional | Text | Tên phòng ban / bộ phận trong công ty |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Visualization of usage |  | Trực quan hóa số liệu sử dụng bằng biểu đồ (tổng tiền, tỷ lệ sử dụng, top 3 sản phẩm phổ biến, số lần giao hàng). | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 郵便番号 | Mã bưu chính | Required | Text | Định dạng 123-4567, chỉ nhập số half-width, cho phép dấu (-) |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | Site management function | Location List Management |  | Quản lý danh sách các chi nhánh / cơ sở của doanh nghiệp (Tên, địa chỉ, người phụ trách). | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 市区町村 | Quận / Huyện | Required | Text | Tên quận, huyện, thị xã |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Location details | View location details | Xem chi tiết thông tin của từng cơ sở và thông tin thiết bị (tủ lạnh) tại đó. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 町域・番地 | Địa chỉ chi tiết | Required | Text | Tên phường, số nhà, số lô |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  |  | Person in Charge Change History Record | Ghi nhận lịch sử các lần thay đổi người phụ trách tại cơ sở. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 建物・部屋番号 | Tên tòa nhà / Số phòng | Optional | Text | Tên building, số tầng, số phòng (nếu có) |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Editing locations | Edit location details | Chỉnh sửa thông tin liên hệ, địa chỉ của cơ sở. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 従業員数概算 | Số nhân viên ước tính | Required | Dropdown | Chọn quy mô công ty, mặc định "10人以下" (dưới 10 người) |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  |  | Changing delivery address information when moving | Khai báo cập nhật địa chỉ giao hàng mới khi doanh nghiệp chuyển văn phòng. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 電話番号 | Số điện thoại | Required | Text | Số điện thoại công ty, cho phép dấu (-), nhập số half-width |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  |  | Inspection schedule registration and delivery arrangements | Ví dụ: Đăng ký các ngày tòa nhà cúp điện/kiểm tra để loại trừ khỏi lịch giao hàng. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | FAX番号 | Số FAX | Optional | Text | Số FAX, cho phép dấu (-), nhập số half-width |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | Corporate contract management | View contract plans | Current contract plan display | Xem danh sách các gói hợp đồng (Plan) đang sử dụng tại từng cơ sở. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 支払い方法 | Phương thức thanh toán | Optional | Radio | Chọn 1 trong 4: クレジット決済 (Thẻ tín dụng) · 口座振替 (Khấu trừ TK) · お振込み (Chuyển khoản) · 年額支払 (Trả năm) |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  |  | Check contract history | Xem lại danh sách lịch sử các lần ký kết/thay đổi hợp đồng. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  |  | List of models | Hiển thị danh sách ID các thiết bị (tủ lạnh/máy bán hàng) đang thuê tại cơ sở. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | Thông tin người phụ trách (担当者情報) |  |  |  |  |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | Contract plan change/cancellation request |  | Gửi yêu cầu thay đổi sang gói hợp đồng khác hoặc yêu cầu Hủy hợp đồng. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 | My Page | Change customer information |  | Chỉnh sửa và cập nhật thông tin liên hệ của quản trị viên doanh nghiệp. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | Field (JP) | Field (VN) | Bắt buộc | Loại input | Mô tả/ Ghi chú |
| 02 | 法人顧客向けWEB-Company Admin_画面一覧 |  | View Terms of Service and Privacy Policy |  | Xem Điều khoản sử dụng và Chính sách bảo mật (yêu cầu tick đồng ý). | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 担当者名 | Tên người phụ trách | Required | Text | Họ tên người liên hệ chính của công ty |
|  |  |  |  |  |  |  |  | 担当者電話番号 | SDT người phụ trách | Required | Text | Số điện thoại trực tiếp, cho phép dấu (-), half-width |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Corporate information management | Grouping locations into company |  | Nhóm nhiều cơ sở (chi nhánh) lại và quản lý dưới dạng một Pháp nhân (Company) duy nhất theo cấu trúc hình cây (cha - con). | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 担当者メールアドレス | Email người phụ trách | Required | Email | Địa chỉ email liên lạc của người phụ trách |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | New location registration | Manual registration | Đăng ký thủ công từng cơ sở riêng lẻ: Tên, Pháp nhân sở hữu, Địa chỉ, Người phụ trách, Quy tắc giao hàng và Thông tin thiết bị (tủ lạnh/tủ đông). | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | List of relocation/moving history | Hiển thị danh sách lịch sử theo dõi khi cơ sở có sự chuyển đổi/di dời địa chỉ. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | Thông tin người phụ trách thanh toán (請求者情報) |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  |  | Tính năng xóa thông tin cơ sở (Location) khỏi hệ thống. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Trial contract | Xử lý quy trình xét duyệt đăng ký hợp đồng dùng thử (Trial) và phát hành tài khoản dùng thử. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | Field (JP) | Field (VN) | Bắt buộc | Loại input | Mô tả/ Ghi chú |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Plan contract management | List of Plan Contracts | List View | Hiển thị danh sách hợp đồng (Plan) theo từng Pháp nhân trong tháng. Hỗ trợ tìm kiếm theo năm/tháng, loại menu, tên pháp nhân, trạng thái hợp đồng. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | Checkbox đồng nhất | Sao chép từ người phụ trách | Optional | Checkbox | Nếu tick, tự động điền lại thông tin từ mục担当者, bỏ qua các field bên dưới |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  |  | Download CSV | Tải xuống dữ liệu danh sách hợp đồng Plan dưới dạng file CSV. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 請求担当者名 | Tên người phụ trách thanh toán | Required | Text | Tên người nhận hóa đơn / chứng từ thanh toán |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Plan contract details / Edit |  | Xem chi tiết/chỉnh sửa thông tin hợp đồng: Cài đặt giao hàng tự động, phí khởi tạo, phí hàng tháng, trạng thái hủy/đổi hợp đồng và lý do. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 請求担当者電話番号 | SĐT người phụ trách thanh toán | Required | Text | Số điện thoại, cho phép dấu (-), half-width |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Adding a plan contract |  | Đăng ký gói hợp đồng mới: Thông tin Plan, thiết lập ngày giao hàng tự động, địa điểm giao hàng và tùy chọn không nhận hàng. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | 請求担当者メールアドレス | Email người phụ trách thanh toán | Required | Email | Email nhận hóa đơn điện tử |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Deleting a plan contract |  | Xóa thông tin gói hợp đồng Plan khỏi hệ thống. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 | Plan Management | Plan List |  | Hiển thị danh sách gói dịch vụ (Plan). Cho phép tìm kiếm theo loại menu và tùy chọn bao gồm cả Plan đã xóa. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Plan registration |  | Đăng ký gói (Plan) mới, lựa chọn loại Menu và thiết lập chi tiết. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng | Thông tin địa chỉ giao hàng (納品先情報) |  |  |  |  |
| 03 | 運営管理者Web-SystemAdmin_画面一覧 |  | Plan details / Edit |  | Xem chi tiết thông tin gói. Tùy chọn Bật hiển thị / Ẩn (Hide/Show) gói dịch vụ đó. | 4 | [HỢP ĐỒNG] Quản lý Hợp đồng |  |  |  |  |  |
|  |  |  |  |  |  |  |  | Field (JP) | Field (VN) | Bắt buộc | Loại input | Mô tả/ Ghi chú |
|  |  |  |  |  |  |  |  | Checkbox đồng nhất | Sao chép từ thông tin phía trên | Optional | Checkbox | Nếu tick, tự động điền lại toàn bộ thông tin phía trên vào mục này |
|  |  |  |  |  |  |  |  | お届け先名 | Tên nơi nhận hàng | Required | Text | Tên công ty hoặc địa điểm nhận giao hàng |
|  |  |  |  |  |  |  |  | 部署 | Phòng ban | Optional | Text | Tên phòng ban / bộ phận trong công ty |
|  |  |  |  |  |  |  |  | 郵便番号 | Mã bưu chính | Required | Text | Định dạng 123-4567, chỉ nhập số half-width, cho phép dấu (-) |
|  |  |  |  |  |  |  |  | 都道府県 | Tỉnh / Thành phố | Required | Text | Tên tỉnh hoặc thành phố trực thuộc (都道府県) |
|  |  |  |  |  |  |  |  | 市区町村 | Quận / Huyện | Required | Text | Tên quận, huyện, thị xã |
|  |  |  |  |  |  |  |  | 町域・番地 | Địa chỉ chi tiết | Required | Text | Tên phường, số nhà, số lô |
|  |  |  |  |  |  |  |  | 建物・部屋番号 | Tên tòa nhà / Số phòng | Optional | Text | Tên building, số tầng, số phòng (nếu có) |
|  |  |  |  |  |  |  |  | 担当者名 | Người phụ trách nhận hàng | Required | Text | Tên người trực tiếp nhận hàng tại địa điểm giao |
|  |  |  |  |  |  |  |  | 電話番号 | Số điện thoại | Required | Text | SĐT tại địa chỉ giao hàng, half-width |
|  |  |  |  |  |  |  |  | 搬入経路 | Lối vào giao hàng | Required | Radio | Chọn: なし (Không có lối đặc biệt) hoặc あり (Có lối riêng / cần lưu ý) |
|  |  |  |  |  |  |  |  | ファイル添付 | Đính kèm file | Optional | File upload | Upload tài liệu đính kèm nếu có (sơ đồ, hợp đồng…) |
|  |  |  |  |  |  |  |  | Thông tin đơn hàng và điều kiện giao nhận (注文・配送設定) |  |  |  |  |
|  |  |  |  |  |  |  |  | Field (JP) | Field (VN) | Bắt buộc | Loại input | Mô tả/ Ghi chú |
|  |  |  |  |  |  |  |  | プラン | Gói dịch vụ | Optional | Dropdown | Chọn gói đăng ký. VD: 50プラン = tối đa 300 suất / tháng. Mô tả gói hiển thị ngay bên phải dropdown. |
|  |  |  |  |  |  |  |  | 配送方法 | Phương thức giao hàng | Optional | Dropdown | Chọn loại vận chuyển. VD: COOL便 =giao tận nơi. ES配送 = ES Kitchen thực hiện từ khâu giao hàng đến quản lý. |
|  |  |  |  |  |  |  |  | 基準数パターン | Mẫu số lượng chuẩn | Optional | Dropdown | Quy tắc tính số suất mặc định theo kỳ. VD: 通常 (bình thường). Ảnh hưởng đến cách hệ thống gợi ý số lượng đặt hàng. |
|  |  |  |  |  |  |  |  | 契約開始希望月 | Tháng muốn bắt đầu hợp đồng | Required | Date (YYYY/MM) | Nhập tháng/năm muốn bắt đầu sử dụng dịch vụ. Định dạng YYYY/MM (VD: 2025/12). Chỉ cần tháng, không cần ngày cụ thể. |
|  |  |  |  |  |  |  |  | 受け取れない曜日 | Ngày không nhận được hàng | Required | Radio + Checkbox | Chọn 1 trong 2 option: (1) "受け取れない曜日がある" → tick các ngày trong tuần không nhận được (月〜金, trừ thứ 7 & CN); (2) "お任せ" → để hệ thống tự sắp xếp, ngoại trừ kỳ nghỉ dài. |
|  |  |  |  |  |  |  |  | 備考 | Ghi chú | Required | Text area | Ô nhập tự do để ghi thêm yêu cầu đặc biệt, lưu ý về giao hàng, hoặc thông tin khác cần truyền đạt cho bộ phận phê duyệt. |
|  |  |  |  |  |  |  |  | Điều khoản sử dụng & xác nhận (利用規約・確認) |  |  |  |  |
|  |  |  |  |  |  |  |  | Field (JP) | Field (VN) | Bắt buộc | Loại input | Mô tả/ Ghi chú |
|  |  |  |  |  |  |  |  | 利用規約スクロール | Scrollbox điều khoản | Optional | Read-only text | Hiển thị toàn bộ nội dung điều khoản dịch vụ dạng scrollable box. Người dùng cần đọc trước khi tick đồng ý. Nội dung không thể chỉnh sửa. |
|  |  |  |  |  |  |  |  | 利用規約に同意する | Đồng ý điều khoản sử dụng | Required | Checkbox | Bắt buộc tick trước khi submit. Nếu chưa tick, nút 確認 sẽ bị disabled hoặc hiện lỗi validation. |
|  |  |  |  |  |  |  |  | 確認ボタン | Nút Xác nhận | Required | Button (Submit) | Nút submit form. Chỉ active khi checkbox 利用規約 đã được tick. |
---

## Phase 2 Scope Changes (2026-07)

> Nguồn: `management/specification/Business_flow_scope_change.xlsx` · BF01

### Thêm mới (21 mục)

| EPIC | Screen Code | L1 (Tính năng) | L2 | L3 | Chi tiết |
| --- | --- | --- | --- | --- | --- |
| E03 | AW_CORPORATE_002 | QL chi nhánh | Đăng ký chi nhánh mới | Xuất CSV | Xuất data hàng loạt từ hệ thống để có thể edit bằng CSV |
| E03 | (NEW) | Quy trình duyệt đăng ký HĐ | DS đăng ký HĐ | | Hiển thị danh sách đăng ký HĐ mới + đăng ký thay đổi HĐ từ pháp nhân; search/filter theo loại, thời gian, công ty, chi nhánh, trạng thái |
| E03 | (NEW) | Quy trình duyệt đăng ký HĐ | Chi tiết đăng ký HĐ | | Hiển thị chi tiết nội dung đăng ký; đăng ký mới = toàn bộ nội dung; đăng ký thay đổi = diff trước/sau |
| E03 | (NEW) | Quy trình duyệt đăng ký HĐ | Duyệt đăng ký HĐ | | Xác nhận + duyệt/từ chối; sau duyệt → tạo HĐ mới hoặc update thông tin HĐ |
| E03 | (NEW) | Quy trình duyệt đăng ký HĐ | Duyệt đăng ký HĐ | Cấp TK trước | Phát hành TK admin cho pháp nhân trước khi HĐ bắt đầu |
| E03 | (NEW) | Quy trình duyệt đăng ký HĐ | Duyệt đăng ký HĐ | Cài đặt nguồn GT | Set nguồn giới thiệu (pháp nhân/đại lý) khi đăng ký HĐ mới; nếu đại lý → auto apply PLAN phí GT |
| E03 | (NEW) | Quy trình duyệt đăng ký HĐ | Lịch sử phê duyệt | | Lịch sử duyệt đăng ký HĐ: thời gian apply, người duyệt, trạng thái, comment |
| E03 | (NEW) | QL hợp đồng | DS phí thu | | Quản lý theo pháp nhân: nội dung HĐ, phương thức giao, PLAN, thiết bị/option, rule điều chỉnh phí |
| E03 | (NEW) | QL hợp đồng | DS phí thu | QL phương thức tính phí | Cài đặt/xác nhận phương thức giá bán (giá thường/giá riêng DN) + phương thức thu phí (theo lượng/mua đứt) |
| E03 | AW_PLAN_001 | QL PLAN | DS PLAN | Nhập / Xuất CSV | Nhập/xuất CSV hàng loạt master PLAN + thông tin cài đặt giá |
| E03 | (NEW) | QL PLAN | Chi tiết PLAN | Chi tiết điều chỉnh giá PLAN | Quản lý nhiều setting giá cho mỗi PLAN; chọn/switch giá đang apply |
| E03 | (NEW) | QL PLAN | Chi tiết PLAN | Điều chỉnh phí theo HĐ | Đổi giá đang apply sang setting giá khác cho pháp nhân đang HĐ |
| E03 | (NEW) | QL tùy chọn dịch vụ | Hiển thị tùy chọn | | DS tùy chọn thiết bị/dịch vụ/vật tư; tên, phân loại, giá apply, trạng thái hiệu lực |
| E03 | (NEW) | QL tùy chọn dịch vụ | CRUD tùy chọn | | Đăng ký/edit thông tin cơ bản và thông tin giá của tùy chọn |
| E03 | (NEW) | QL tùy chọn dịch vụ | CRUD tùy chọn | QL phí tùy chọn vật tư | Quản lý hạn mức vật tư miễn phí + đơn giá thêm theo từng PLAN |
| E03 | (NEW) | QL tùy chọn dịch vụ | QL lịch sử phí | | Lịch sử đổi giá theo từng option; set ngày bắt đầu/kết thúc |
| E03 | (NEW) | QL tùy chọn dịch vụ | Xóa / Vô hiệu tùy chọn | | Option chưa dùng → xóa; đã dùng → chỉ vô hiệu |
| E03 | (NEW) | QL giảm giá | DS giảm giá | | DS: tên, phân loại, phí đích, phương thức giảm, thời gian apply, trạng thái |
| E03 | (NEW) | QL giảm giá | CRUD giảm giá | | Cài đặt điều kiện, số tiền/tỷ lệ, đối tượng apply, thời gian, có/không kết hợp |
| E03 | (NEW) | QL giảm giá | QL lịch sử giảm giá | | Lịch sử đổi giá; set ngày bắt đầu/kết thúc; giữ giá cũ + đăng ký giá mới |
| E03 | (NEW) | QL giảm giá | Vô hiệu giảm giá | | Giảm giá đang dùng/có lịch sử → không xóa mà chỉ vô hiệu hóa |

### Xóa đi (4 mục)

| EPIC | Screen Code | L1 (Tính năng) | L2 | L3 | Lý do xóa |
| --- | --- | --- | --- | --- | --- |
| E03 | AW_CONTRACT_004 | QL hợp đồng | Thêm HĐ | DS đề xuất bên vận chuyển | Timing thực thi khác nhau → xóa khỏi luồng thêm HĐ |
| E03 | AW_CONTRACT_004 | QL hợp đồng | Thêm HĐ | Xuất CSV đồng bộ Google MyMap | Không còn sử dụng MyMap |
| E03 | AW_INVOICE_001 | QL hợp đồng | DS phí thu | Hóa đơn theo hợp đồng | Thay bằng tích hợp API Bill One |
| E03 | AW_INVOICE_002 | QL hợp đồng | DS phí thu | Xem trước hóa đơn | Thay bằng tích hợp API Bill One |
