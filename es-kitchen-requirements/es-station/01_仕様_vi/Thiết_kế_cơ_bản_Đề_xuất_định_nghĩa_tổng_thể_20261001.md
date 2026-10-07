# Thiết kế cơ bản: Đề xuất "Định nghĩa toàn hệ thống" (các quy tắc áp dụng xuyên suốt các màn hình) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) ／ Soạn: Claude (Cowork). Đề xuất "định nghĩa toàn hệ thống" (không phải theo từng màn hình mà là các quy tắc có hiệu lực với mọi màn hình) khi tạo tài liệu thiết kế cơ bản・thiết kế chi tiết từ bản demo.
> Mục tiêu là để tester có thể tạo test case.
> Tài liệu căn cứ: `Quy_tắc_thanh_toán_Đặc_tả_v1`, `ステップ間の影響定義_20261001`, `変更申請_影響範囲と制御一覧_20261001`, `Danh_sách_email_Đăng_ký_và_yêu_cầu_20261001`, `Đặc_tả_kiểm_tra_nhập_liệu_Form_đăng_ký_20261001`, `決定_*` (00_Quyết_định), `デモ全体確認_未決事項と選択肢_20261001`, demo Vận hành・demo Web Doanh nghiệp (10_運営_まとめ・20_法人_まとめ).
>
> **Cách xem trạng thái**
> - **Quyết định**: có trong file quyết định. Ghi nguyên như vậy
> - **Đề xuất**: phương án của Claude. Chưa được quyết định nên cần xác nhận phương án này có ổn không
> - **Chưa quyết**: có các lựa chọn, cần Long／khách hàng trả lời (tổng hợp ở §13)

---

## 1. Quy tắc về danh sách message

**Nguồn chuẩn là Excel** (`【ES STATION】システム内メッセージ管理-Message List_フェーズ2追加_20261001.xlsx`). Số thứ tự tiếp nối No. của Phase 1 (quyết định). Ở đây đề xuất "quy tắc chung cho mọi message".

### 1-1. Loại message và cách hiển thị

| Loại | Trường hợp dùng | Nơi hiển thị | Cách biến mất | Trạng thái |
|---|---|---|---|---|
| Lỗi nhập liệu | Không khớp kiểm tra nhập liệu | Chữ đỏ dưới mục + viền đỏ quanh mục. Cuộn màn hình đến mục lỗi đầu tiên | Sửa rồi kiểm tra lại thì biến mất | Quyết định (Kiểm tra nhập liệu C1) |
| Lỗi nghiệp vụ | Có yêu cầu đang chờ phê duyệt, vượt quá 12 tháng tạm ngưng cộng dồn v.v. | Dải đỏ ở phía trên màn hình (phía trên biểu mẫu) | Giữ nguyên cho đến khi đóng | Đề xuất |
| Xác nhận | Thao tác không thể hoàn tác (phê duyệt・từ chối・xác định・phát hành Bill One・hủy・xóa・gửi) | Hộp thoại ("OK／Hủy". Tên nút lấy theo tên thao tác: ví dụ "Phê duyệt") | Đóng bằng nút | Đề xuất |
| Hoàn tất | Đã lưu・gửi・phê duyệt xong | Toast ở góc trên bên phải màn hình | Tự biến mất sau 3 giây | Đề xuất |
| Cảnh báo | Có thể tiếp tục nhưng cần lưu ý (thay đổi giữa chừng thời gian chờ phát hành hóa đơn WEB No.63 v.v.) | Hộp thoại ("Vẫn lưu", "Quay lại") | Đóng bằng nút | Đề xuất |
| Thông báo | Thông báo trạng thái như giai đoạn chỉ tham khảo (WEB No.75) | Dải ở phía trên màn hình (toàn bộ màn hình) | Giữ nguyên hiển thị trong khi trạng thái còn tiếp tục | Quyết định (No.75) |
| Lỗi hệ thống | Lỗi kết nối・lỗi server | Dải đỏ ở phía trên màn hình + "Vui lòng thử lại" | Giữ nguyên cho đến khi đóng | Đề xuất |

### 1-2. Quy tắc về câu chữ (đề xuất)

- Hướng đến doanh nghiệp・tài xế・nhà cung cấp dùng kính ngữ ("〜ください", "〜できません"). Hướng đến Vận hành thì ngắn gọn ("〜してください").
- Giá trị chèn vào dùng `{tên mục}` (giống Excel).
- Lỗi nhập liệu hiển thị tất cả cùng lúc (không hiển thị từng lỗi một).
- Không dùng câu chữ chỉ có "Đã xảy ra lỗi". Viết rõ **cái gì・vì sao・nên làm thế nào**.

### 1-3. Các cột muốn bổ sung vào Excel (đề xuất)

| Cột | Nội dung |
|---|---|
| ID | Loại + No. như WEB-63 |
| Loại | 7 loại ở §1-1 |
| Nơi hiển thị | Tên màn hình và số thứ tự mục (số trong thiết kế màn hình) |
| Điều kiện | Hiển thị ở thao tác nào・trạng thái nào |
| Tiếng Nhật／Tiếng Việt | Câu chữ |

---

## 2. Quy tắc về định nghĩa email

### 2-1. Chung (quyết định. Danh sách email §0)

- Người gửi: "[ES Station] Vận hành ES Kitchen" no-reply@es-kitchen.co.jp. Chỉ để gửi.
- Tiêu đề bắt đầu bằng "[ES Station]" (chỉ gửi hàng loạt thông báo thì không tự động thêm).
- Lời mở đầu・chữ ký giống Phase 1. Không đính kèm file.
- Hóa đơn không gửi từ ES (gửi từ Bill One). Hướng dẫn dùng thử gửi từ HubSpot.

### 2-2. Các quy tắc muốn bổ sung (đề xuất)

| Quy tắc | Đề xuất |
|---|---|
| Cùng địa chỉ | Nếu người nhận trùng nhau trong 1 lần gửi thì gộp thành 1 email (mở rộng cách nghĩ đã quyết ở M1 cho mọi email) |
| Thời điểm gửi | Bắt buộc ghi "gửi ngay" và "gửi theo batch (giờ)" |
| Khi gửi không được | Cho phép xem lịch sử gửi (ngày giờ・người nhận・kết quả) trên màn hình Vận hành, và thông báo lỗi cho Vận hành trên màn hình. Chỉ Vận hành mới được gửi lại |
| Khi không có người nhận | Nếu không có địa chỉ email người nhận thì không gửi, thông báo cho Vận hành trên màn hình |
| Đang tạm ngưng・sau khi hủy hợp đồng | Không gửi nhắc nhở đặt hàng・kiểm tra tồn kho (X1・X12) cho cơ sở đang tạm ngưng. Không gửi gì cho cơ sở đã hủy hợp đồng (trừ M12 tạm dừng tài khoản) |
| Ngôn ngữ | Chỉ tiếng Nhật (không cần tiếng Việt) |

### 2-3. Các mục cần ghi cho từng email

No.／Tên email／Khi nào gửi (nguyên nhân)／Thời điểm (ngay・giờ batch)／Người nhận (To・CC)／**Điều kiện không gửi**／Tiêu đề／Nội dung／Mục chèn vào và ví dụ／Có thể gửi lại không／Căn cứ

### 2-4. Những mục chưa quyết

"Cần xác nhận" trong danh sách email: M4 người nhận khi nhập thay, M7 email khi rút lại, M8 có gửi email cho Vận hành khi đổi người phụ trách không, M11 email vào ngày dừng và ngày hôm trước. X7 CSV phát hành tài khoản tài xế, X11 nội dung đơn đặt hàng (email).

---

## 3. Danh sách thông báo (ngoài email)

### 3-1. Loại thông báo

| Loại | Đối tượng | Trạng thái |
|---|---|---|
| Thông báo trên màn hình (Trang chủ・Danh sách thông báo) | Vận hành・doanh nghiệp・công ty giao hàng ủy thác・nhà cung cấp | Quyết định |
| Push notification của ứng dụng | Người dùng ứng dụng | Chỉ công bố menu của Phase 1. Phase 2 không bổ sung gì (quyết định) |
| Huy hiệu・hiển thị cảnh báo trên danh sách | Vận hành (cần xác nhận・chưa xử lý) | Có trong demo |

### 3-2. Các thông báo đã biết hiện nay (kiểm kê)

| Thông báo | Đối tượng | Nguyên nhân | Căn cứ |
|---|---|---|---|
| Hủy hợp đồng cơ sở chỉ dùng xe công ty | Vận hành (phụ trách giao hàng) | Phê duyệt hủy hợp đồng | WEB No.71・72 |
| Thay đổi người phụ trách・tên doanh nghiệp | Vận hành | Đã đổi mục được phản ánh ngay trên Web Doanh nghiệp | M8・STEP2 Q3・Q10 |
| Kiện hàng chưa đặt tài xế | Công ty giao hàng ủy thác・Vận hành | 3 ngày trước và 1 ngày trước ngày giao hàng | X5・Bảng yêu cầu dòng 142 |
| Đặt hàng chính thức chưa xử lý | Nhà cung cấp・Vận hành cấp cao nhất | Cứ mỗi 24 giờ làm việc kể từ khi đặt hàng chính thức | X10・REQ-PO-302 |
| Yêu cầu giao từng phần | Vận hành | Nhà cung cấp yêu cầu giao từng phần | REQ-PO-303 (chỉ trên màn hình・không có email) |
| Hủy đặt hàng | Nhà cung cấp | Vận hành hủy | REQ-PO-112 |
| Dữ liệu giao hàng cần xác nhận | Vận hành | 3 ngày trước ngày xuất hàng vẫn còn thay đổi | Đặc tả tích hợp |
| Lỗi gửi Bill One | Vận hành | Gửi thất bại | WEB No.65 |
| Giai đoạn chỉ tham khảo | Doanh nghiệp | Đăng nhập vào cơ sở đã hủy hợp đồng | WEB No.75 |
| Gửi hàng loạt thông báo | Đối tượng đã chọn | Vận hành gửi | X13 |

### 3-3. Các quy tắc muốn bổ sung (đề xuất)

- Với mỗi thông báo: đối tượng (role)／nguyên nhân／câu chữ／màn hình đích của link／có giữ đã đọc・chưa đọc không／khi nào biến mất (thời hạn・biến mất khi đã xử lý).
- Thêm "nhà cung cấp" vào đối tượng gửi thông báo (Danh sách màn hình Web nhà cung cấp §4-2).

---

## 4. Danh sách quyền

### 4-1. Role (có trong demo)

| Hệ thống | Role | Làm được gì | Trạng thái |
|---|---|---|---|
| Web Vận hành | Toàn quyền | Mọi màn hình・thao tác | Demo |
| | Quản trị Master | Đăng ký・chỉnh sửa quản lý Master | Demo |
| | Phụ trách giao hàng | Master giao hàng, tham khảo・chỉnh sửa đặt hàng・nhập kho | Demo |
| | Phụ trách kinh doanh | Tham khảo・chỉnh sửa quản lý doanh nghiệp・hợp đồng, quản lý đại lý・giới thiệu | Demo |
| | Phụ trách kế toán | Tham khảo・chỉnh sửa quản lý doanh thu・lịch sử thanh toán | Demo |
| | Chỉ xem | Chỉ tham khảo mọi màn hình (không hiển thị nút đăng ký・thao tác) | Demo |
| Web Doanh nghiệp | Tài khoản doanh nghiệp | Mọi cơ sở của doanh nghiệp. Yêu cầu thay đổi thông tin doanh nghiệp chỉ tài khoản doanh nghiệp | Quyết định |
| | Tài khoản cơ sở | Chỉ cơ sở của mình | Quyết định |
| Web giao hàng ủy thác | Quản trị viên đơn vị giao hàng ủy thác | Giao hàng・tài xế của công ty mình | Demo |
| Ứng dụng tài xế | Tài xế | Lần giao được phân công cho mình | Demo |
| Web nhà cung cấp | Nhà cung cấp | Đơn nhận của công ty mình | Demo |
| Ứng dụng | Người dùng ứng dụng | Mua hàng | Phase 1 |

Có thể gán nhiều role cho 1 người (demo: "Toàn quyền, Quản trị Master, Phụ trách kinh doanh"). Cộng dồn các "việc làm được" của các role đã gán (đề xuất).

Quy tắc chung về quyền được tổng hợp ở **§10-6** cho Web Vận hành và **§10-7** cho Web Doanh nghiệp (tài khoản doanh nghiệp／tài khoản cơ sở).

### 4-2. Quyền thay đổi theo trạng thái (quyết định)

| Trạng thái cơ sở | Việc làm được trên Web Doanh nghiệp |
|---|---|
| Bình thường | Tất cả |
| Có yêu cầu đang chờ phê duyệt | Không thể gửi yêu cầu mới (chỉ cơ sở đó) |
| Đang tạm ngưng | **Chỉ tham khảo**. Chỉ làm được đăng ký mở lại・đăng ký hủy hợp đồng・liên hệ (28-3・28-21) |
| Sau hủy hợp đồng〜hạn thanh toán của hóa đơn cuối cùng | Chỉ tham khảo (WEB No.75) |
| Từ ngày sau hạn thanh toán〜 | Không đăng nhập được (WEB No.76) |

### 4-3. Bảng màn hình × role (thay thế bằng quyết định 2026-10-03)

**2026-10-03: theo quyết định của người dùng, bảng quyền của Vận hành (7 vai trò × chức năng. CRUD・R/U・R・×) là chuẩn.** Bảng là `01_仕様/Bảng_phân_quyền_Web_vận_hành_20261003.md` (code là `07_開発/lib/domain/seed/account.ts` OPS_TABLE・`lib/ops/permissions.ts`).
- Vai trò: Toàn quyền・Kế toán・Kinh doanh・CS・Quản lý sản phẩm・Phát triển sản phẩm・Logistics (+ giữ lại "Chỉ xem" "Nhân viên kho" không có trong bảng).
- Vai trò do quản trị hệ thống (người chỉnh sửa được "Cấp quyền") tạo・sửa trong màn hình "Quản lý tài khoản ＞ Quyền". Bảng là giá trị ban đầu.
- Người có từ 2 vai trò trở lên thì lấy vai trò cao hơn. Chỉ Web Vận hành (các site khác bị giới hạn trong phạm vi dữ liệu của mình).

<details><summary>Cũ: Bảng màn hình × role (đề xuất hình thức・2026-10-01) — đã được thay thế</summary>

(4-3 cũ)

Ký hiệu: ◎ đến mức đăng ký・chỉnh sửa・xóa ／ ○ tham khảo + một phần thao tác ／ △ chỉ tham khảo ／ × không hiển thị trong menu

| Menu của Web Vận hành | Toàn quyền | Master | Giao hàng | Kinh doanh | Kế toán | Chỉ xem |
|---|---|---|---|---|---|---|
| Quản lý doanh nghiệp・hợp đồng | ◎ | △ | △ | ◎ | △ | △ |
| Quản lý đơn đăng ký hợp đồng (tiếp nhận・phê duyệt) | ◎ | × | △ | ◎ | △ | △ |
| Quản lý Master (dòng máy・gói・tùy chọn・giảm giá) | ◎ | ◎ | △ | △ | △ | △ |
| Giao hàng・xuất hàng・picking | ◎ | △ | ◎ | △ | × | △ |
| Đặt hàng・nhập kho | ◎ | △ | ◎ | × | △ | △ |
| Thanh toán (xác định・phát hành Bill One・hủy) | ◎ | × | × | △ | ◎ | △ |
| Đánh giá・đặt hàng menu | ◎ | ◎ | △ | △ | × | △ |
| Tài khoản・quyền | ◎ | × | × | × | × | △ |
| Gửi thông báo | ◎ | × | ○ | ○ | × | △ |

Tương ứng giữa ký hiệu và loại thao tác: ◎ = tất cả các thao tác trong P1〜P8 có ở menu đó, ○ = P1 + một phần (ghi bằng số P trong thiết kế màn hình), △ = chỉ P1. Quy tắc chung về quyền của Web Vận hành là **§10-6**.

**Bảng này là đề xuất** (tạo từ mô tả role của demo). Đặc biệt muốn xác nhận "Việc phê duyệt đơn đăng ký hợp đồng do phụ trách kinh doanh có ổn không", "Việc xác định・phát hành hóa đơn do phụ trách kế toán có ổn không", "role nào là 'quản trị viên vận hành có quyền' có thể phê duyệt nâng kích thước tủ lạnh".


</details>

### 4-4. Các quy tắc nhất định phải xem khi test (đề xuất)

- Nếu mở trực tiếp bằng URL một màn hình không có quyền, hiển thị "Bạn không có quyền xem màn hình này." và đưa về Trang chủ.
- Tài khoản cơ sở không thể xem dữ liệu của cơ sở khác・doanh nghiệp khác ở bất kỳ nơi nào: màn hình・URL・CSV.
- Với quyền chỉ tham khảo, không hiển thị nút đăng ký・lưu・xóa・phê duyệt (không phải là không bấm được, mà là không hiển thị).

---

## 5. Chuyển trạng thái, và bảng trạng thái × thao tác

### 5-1. Các trạng thái có

| Đối tượng | Trạng thái | Trạng thái |
|---|---|---|
| Đăng ký mới | Tiếp nhận → Đăng ký tạm → Thiết lập thông tin chi tiết → Đăng ký chính thức (có từ chối・rút lại) | Demo |
| Yêu cầu thay đổi (8 loại) | Chờ phê duyệt → Đã phê duyệt／Phê duyệt một phần／Từ chối／Đã rút lại. Phê duyệt theo từng cơ sở, từ chối bắt buộc có lý do | Quyết định |
| Trạng thái thanh toán của hợp đồng con (Vận hành) | Trả trước: đã tạo → ① xác định → xác định cơ sở → xác định doanh nghiệp → đã xuất hóa đơn. Trả sau: chưa tổng hợp → ② xác định → xác định cơ sở → xác định doanh nghiệp → đã xuất hóa đơn | Quyết định (STEP2 Q6) |
| Hiển thị thanh toán (Web Doanh nghiệp) | Chưa xác định／Đã xác định／Đã xuất hóa đơn | Quyết định |
| Hóa đơn (Bill One) | Chưa phát hành → Đã phát hành／Lỗi gửi (gửi lại thì thành đã phát hành) → Hủy (phát hành lại bằng số mới) | Quyết định (S6-4・S6-5) |
| Trạng thái hợp đồng của hợp đồng con | Có hiệu lực v.v. (không dùng "Đang hợp đồng") | Quyết định một phần (STEP2 C1). Toàn bộ giá trị **cần xác nhận** |
| Cơ sở | Có hiệu lực／Dự kiến tạm ngưng／Đang tạm ngưng／Dự kiến hủy hợp đồng／Đã hủy hợp đồng | **Đề xuất** (từ "Dự kiến tạm ngưng" "Đang tạm ngưng" của demo) |
| Tài khoản doanh nghiệp・cơ sở | Chưa phát hành／Đã phát hành／Đã đăng nhập／Đang tạm dừng (demo). Bổ sung giai đoạn "chỉ tham khảo" sau khi hủy hợp đồng | Demo・chỉ tham khảo là quyết định S4-3 |
| Người dùng Vận hành | Có hiệu lực／Vô hiệu／Ngừng sử dụng／Đã xóa | Demo (§10-6 R5) |
| Dữ liệu giao hàng | Tạo → locked (lần gửi đầu tiên của chỉ thị xuất hàng thành công) → Hoàn tất giao hàng. Cần xác nhận (3 ngày trước) | Đặc tả tích hợp |
| Đặt hàng (nhà cung cấp) | Đặt hàng tạm → Đã trả lời thời hạn giao → Đặt hàng chính thức → Đã xuất hàng → Đã nhập kho／Hủy | Demo |
| Master | Trạng thái công khai: Công khai／Không công khai. Trạng thái sử dụng: Đang dùng／Đang dừng | Quyết định (trạng thái công khai)・U5 chưa quyết |

### 5-2. Những điều ghi cho mỗi lần chuyển trạng thái

Nguồn chuyển → Đích chuyển／Nguyên nhân (của ai・thao tác nào・batch)／Điều kiện／Những thứ chạy đồng thời (email・thông báo・dữ liệu)／Có hoàn tác được không (ví dụ: "làm lại" sau khi phê duyệt)

### 5-3. Bảng trạng thái × thao tác (ví dụ: cơ sở)

| Thao tác | Có hiệu lực | Có yêu cầu chờ phê duyệt | Dự kiến tạm ngưng | Đang tạm ngưng | Dự kiến hủy hợp đồng | Đã hủy hợp đồng |
|---|---|---|---|---|---|---|
| Yêu cầu thay đổi gói・giao hàng・thiết bị | ○ | × | × | × | × | × |
| Yêu cầu thay đổi thông tin cơ sở | ○ | × | ○ (đề xuất) | × | × | × |
| Yêu cầu tạm ngưng | ○ | × | × | × | × | × |
| Yêu cầu mở lại | × | × | × | ○ | × | × |
| Yêu cầu hủy hợp đồng | ○ | × | ○ (đề xuất) | ○ (28-21) | × | × |
| Đặt hàng hàng tháng・kiểm tra tồn kho | ○ | ○ | ○ | × | ○ (đến chu kỳ cuối cùng・đề xuất) | × |
| Xem hóa đơn | ○ | ○ | ○ | ○ | ○ | Đến hạn thanh toán |

Tạo bảng cùng dạng cho yêu cầu・thanh toán・hóa đơn・đặt hàng・dữ liệu giao hàng.

---

## 6. Danh sách giá trị phân loại (giá trị code)

### 6-1. Hình thức

Tên phân loại／Code／Tên hiển thị (tiếng Nhật)／Tên hiển thị (tiếng Việt)／Thứ tự sắp xếp／Màn hình sử dụng／Căn cứ

### 6-2. Các phân loại chính (đã biết hiện nay)

| Phân loại | Giá trị | Căn cứ |
|---|---|---|
| Loại yêu cầu | Thay đổi gói／Thay đổi giao hàng／Thay đổi thiết bị／Thay đổi thông tin cơ sở／Thay đổi thông tin doanh nghiệp／Tạm ngưng／Mở lại／Hủy hợp đồng | Trả lời STEP1 (8 loại) |
| Phân loại phê duyệt | Bắt buộc phê duyệt／Chỉ thông báo (phản ánh ngay + thông báo cho Vận hành)／Chỉ Vận hành | Nhóm 28・Trả lời STEP1 |
| Loại hợp đồng | Triển khai chính thức／Chiến dịch dùng thử | Mục đăng ký |
| Loại thiết bị | Tủ lạnh・tủ đông／Máy bán hàng tự động | Kiểm tra nhập liệu 3-3 |
| Course | ES Standard／ES Lite (tủ lạnh)／ES Lite (máy bán hàng tự động) | Master gói |
| Phương thức giao hàng | Giao hàng ES／Giao hàng COOL (xe công ty là phân loại của tuyến giao hàng) | Kiểm tra nhập liệu 3-3・T3 |
| Phương thức thanh toán | Chuyển khoản tự động／Chuyển khoản ngân hàng／Thẻ tín dụng | 28-32・S7 |
| Chu kỳ thanh toán | Trả theo tháng／Trả theo năm | Kiểm tra nhập liệu 3-1 |
| Bên nhận hóa đơn | Gửi hóa đơn cho doanh nghiệp／Gửi hóa đơn cho cơ sở này | Kiểm tra nhập liệu 3-3 |
| Hạn thanh toán | Ngày 27 của tháng thanh toán／Ngày 27 của tháng sau tháng thanh toán | 28-72 |
| Thời gian chờ phát hành hóa đơn | −3〜+1 (tháng) | Đặc tả tích hợp |
| Khi không thể giao hàng | Dời sớm lên ngày trước／Dời muộn xuống ngày sau | Kiểm tra nhập liệu 3-3 |
| Phân loại người phụ trách | Người phụ trách chính／Người phụ trách thanh toán／Người phụ trách phụ | Kiểm tra nhập liệu 3-2 |
| Trạng thái công khai | Công khai／Không công khai | Trả lời STEP1 |
| Role Vận hành | §4-1 | Demo |

### 6-3. Dạng ID (quyết định・demo)

AP-YYYYMMDD-NNNN (đăng ký mới)／CH-YYYYMMDD-NNNN (yêu cầu thay đổi = 8 loại yêu cầu hợp đồng)／DD-YYYYMMDD-NNNN (yêu cầu đổi ngày giao. 2026/10/01 S7-37)／CU+5 chữ số (doanh nghiệp・cơ sở)／CP+7 chữ số-YYYYMM (hợp đồng con)／INV-YYYYMMNNNN (hóa đơn)／ES+6 chữ số (gói)／OP+6 chữ số (tùy chọn)／DC+6 chữ số (giảm giá)／Ad+5 chữ số (người dùng Vận hành)／HU+5 chữ số (nơi trung chuyển)・RT (nơi trả hàng). Quy tắc số giao hàng sẽ quyết định ở STEP7 (chưa quyết). NNNN là số thứ tự theo từng ngày (2026/10/01 S7-7). ID thông báo thì danh sách là 5 chữ số (12444), còn chi tiết trên Figma là NT0000020 nên không khớp (đang xác nhận ở STEP7 S7-41).

---

## 7. Logic tính toán và ví dụ kiểm tra

**Nguồn chuẩn của quy tắc tính toán là `Quy_tắc_thanh_toán_Đặc_tả_v1`**. Trong tài liệu thiết kế cơ bản, lấy "công thức" và "ví dụ kiểm tra" từ đó.

### 7-1. Công thức

| Tính toán | Công thức | Căn cứ |
|---|---|---|
| Tính theo ngày | Không làm (trả đủ cho từng tháng chu kỳ) | P1 |
| Tháng áp dụng | Ngày yêu cầu ≦ hạn chốt đặt hàng (mặc định ngày 15 tháng trước) → từ tháng chu kỳ đó. Quá hạn thì từ tháng chu kỳ sau | S1 |
| Tháng thanh toán (trả trước) | Tháng chu kỳ + thời gian chờ phát hành hóa đơn (−3〜+1) | STEP2 Q7 |
| Dòng phúc lợi | 100 yên × tổng giới hạn cung cấp hàng tháng ÷ 1.08 (làm tròn xuống). Chia phí gói thành 2 dòng: phí cơ bản (10%) + phúc lợi (8%) | 28-148〜150 |
| Thuế tiêu dùng | Tổng theo từng hóa đơn・từng thuế suất × thuế suất → làm tròn (số tiền âm thì làm tròn theo giá trị tuyệt đối) | v1.43・P9 |
| Phí phạt hủy | Σ (số tiền thu hồi thiết bị khi hủy hợp đồng × số tháng còn lại ÷ thời hạn sử dụng tối thiểu). Tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng. Tính từ ngày cho mượn, không tính khi đang tạm ngưng | 28-2・STEP2 Q8 |
| Mua lại tồn kho còn lại | Tồn kho tính toán × đơn giá bán (OP000031) | S4-2 |
| Giảm giá dùng thử DC000013 | Đến mức phí của gói 50・Lite (tủ lạnh). Không vượt quá số tiền thanh toán. Mỗi doanh nghiệp 1 lần. Không áp dụng cho quyết toán thực tế | STEP3 Q3・P8 |
| Chênh lệch kích thước | Chỉ khi dương mới áp dụng OP000023 (hàng tháng). Số âm tính là 0 yên | Phụ lục Q-A |

### 7-2. Ví dụ kiểm tra (giá trị của demo. Dùng làm giá trị kỳ vọng của test)

| # | Ví dụ | Đầu vào | Giá trị kỳ vọng | Trạng thái |
|---|---|---|---|---|
| K1 | Số tiền hàng tháng của Trụ sở chính | ES Lite (máy bán hàng tự động) 100 | ¥53,000 (chưa thuế) | Quyết định (Phụ lục Q-C) |
| K2 | Số tiền hàng tháng của Chi nhánh Osaka | Gói ¥24,500 + thêm số lần giao hàng ¥3,000 | ¥27,500 | Quyết định |
| K3 | Phí phạt hủy máy bán hàng tự động | Số tiền thu hồi ¥24,000 × còn 6 tháng ÷ 12 | ¥12,000 | Giá trị tạm |
| K4 | Phí phạt hủy tủ lạnh đang tạm ngưng | ¥15,000 × còn 2 tháng ÷ 3 (dưới 1 tháng làm tròn lên) | ¥10,000 | **Cách xử lý tháng lẻ là tạm** |
| K5 | Phát hành và hạn thanh toán | Xác định ngày 9/25 | Phát hành 10/1・tháng thanh toán là tháng 10・hạn thanh toán 10/27 | Quyết định (S6-2) |

Ví dụ muốn bổ sung (đề xuất): ranh giới làm tròn thuế (x.5 yên), hóa đơn có dòng điều chỉnh âm, yêu cầu vào đúng ngày hạn chốt, trường hợp giảm giá dùng thử vượt số tiền thanh toán, phí phạt hủy kéo dài qua thời gian tạm ngưng, 12 chu kỳ của trả theo năm.

---

## 8. Quy tắc về ngày・giờ

| # | Quy tắc | Nội dung | Trạng thái |
|---|---|---|---|
| D1 | Múi giờ chuẩn | Giờ Nhật Bản (JST). Server・batch・phán định hạn chốt đều theo JST | Đề xuất |
| D2 | Giờ của hạn chốt | Yêu cầu đến 23:59:59 ngày hạn chốt được tính là "trong hạn chốt" | Đề xuất |
| D3 | Hạn chốt đặt hàng | Mặc định ngày 15 tháng trước (có thể đổi theo từng cơ sở) | Quyết định |
| D4 | Lịch thanh toán | Chốt ngày 20 → xác định ngày 25 → phát hành ngày 1 tháng sau. Quyết toán thực tế từ ngày 21 tháng trước〜ngày 20 tháng này | Quyết định |
| D5 | Hạn thanh toán | Ngày 27 của tháng thanh toán／tháng sau | Quyết định |
| D6 | Lịch chu kỳ | Lịch của quản lý giao hàng là chuẩn (STEP4 Q1) | Quyết định |
| D7 | Ngày hủy hợp đồng | Ngày cuối của chu kỳ | Quyết định |
| D8 | Ngày làm việc | Trừ thứ Bảy・Chủ nhật・ngày lễ và ngày không thể giao hàng toàn công ty. Nếu ngày gửi email là ngày nghỉ thì lùi về ngày làm việc trước đó (X1) | Quyết định |
| D9 | Cách đếm "〜 ngày trước" | Đếm theo ngày dương lịch ("3 ngày trước" = ngày cách ngày giao hàng 3 ngày). Những thứ đếm theo ngày làm việc thì ghi "ngày làm việc" | Đề xuất |
| D10 | Dạng hiển thị | Ngày YYYY/MM/DD, năm tháng YYYY年M月, ngày giờ YYYY/MM/DD HH:MM | Đề xuất (cách ghi của demo) |
| D11 | Cách đếm thời gian tạm ngưng | Đến tối đa 12 tháng cộng dồn. Đếm theo số tháng chu kỳ | Quyết định (cách đếm là đề xuất) |
| D12 | Lịch chu kỳ trước tháng 7/2026 (GW v.v.) | Chưa định | Chưa quyết |

Để test, "hôm nay của demo" được cố định là 2026/10/05 (quyết định T1 = C).

---

## 9. Liên động xuyên màn hình (phạm vi ảnh hưởng)

Nguồn chuẩn là `ステップ間の影響定義` và `変更申請_影響範囲と制御一覧`. Trong tài liệu thiết kế cơ bản, làm thành dạng có thể xác nhận bằng test.

### 9-1. Hình thức (đề xuất)

| Điểm bắt đầu (màn hình・thao tác) | Đối tượng bị ảnh hưởng (màn hình・số mục) | Loại | Có hiệu lực từ khi nào | Cách xác nhận |
|---|---|---|---|---|
| Ví dụ: Quản lý Master／đổi giá của gói | Phí của hợp đồng con (chỉ hợp đồng con tạo mới) | Sao chép | Từ hợp đồng con tạo lần sau. Hợp đồng con đã tạo・đã thanh toán không thay đổi | Hợp đồng con hiện có không thay đổi／hợp đồng con mới có giá mới |
| Ví dụ: Web Doanh nghiệp／phê duyệt thay đổi thông tin cơ sở (địa chỉ) | Dữ liệu giao hàng・phiếu vận đơn | Sao chép | Các lần giao từ ngày chuẩn do Vận hành chọn trở đi | Lần giao đã tạo giữ nguyên địa chỉ tại thời điểm ngày giao hàng |
| Ví dụ: Phê duyệt hủy hợp đồng | Email dừng giao hàng M9・dữ liệu giao hàng・thanh toán (hóa đơn cuối cùng)・tài khoản | Kiểm soát | Sau ngày hủy hợp đồng (ngày cuối chu kỳ) | Sau ngày giao hàng cuối cùng không tạo dữ liệu giao hàng |

Có 4 loại (Nguồn chuẩn・Sao chép・Hiển thị・Kiểm soát). **Với "Sao chép" bắt buộc phải ghi "có hiệu lực từ khi nào"** (quyết định: Định nghĩa ảnh hưởng §4-4).

---

## 10. Đặc tả chung

### 10-1. Nhập liệu (quyết định. Đặc tả kiểm tra nhập liệu §1)

Loại bỏ khoảng trắng đầu cuối (C3), đổi số・dấu gạch ngang・chữ cái sang ký tự nửa chiều rộng rồi mới kiểm tra (C4), vượt số ký tự thì lỗi (C5), không nhận emoji (C6), nút gửi bị vô hiệu sau khi bấm (C7).

### 10-2. Danh sách・tìm kiếm (số mục・sắp xếp・mục đã xóa là quyết định ngày 2026/10/01 của Long. `Quyết_định_STEP7_Quy_định_về_danh_sách_20261001.md`)

| Quy tắc | Đề xuất |
|---|---|
| Số mục | **Quyết định**: 1 trang 10 mục (giống "10 mục／trang" của Phase 1). Số mục có thể chọn khớp với Phase 1 (demo là 10／20／50. Cần xác nhận) |
| Sắp xếp | **Quyết định**: danh sách có "Sắp xếp", chọn thứ tự (mục) để sắp xếp (cùng hình thức với sắp xếp "tổng số lượng" "số lượng bán" của Phase 1). Thứ tự sắp xếp ban đầu ghi trong thiết kế màn hình theo từng màn hình (nếu không ghi thì mới nhất trước = ngày giờ cập nhật giảm dần: đề xuất) |
| Tìm kiếm chữ | Khớp một phần. Không phân biệt chữ toàn chiều rộng・nửa chiều rộng, chữ hoa・chữ thường |
| Kết hợp điều kiện | Mục khác nhau là AND, chọn nhiều trong cùng một mục là OR |
| 0 kết quả | "Không có dữ liệu phù hợp." |
| Dữ liệu đã xóa | **Quyết định**: có thể hiển thị trên danh sách. Tuy nhiên giá trị mặc định của điều kiện tìm kiếm là trạng thái đã chọn "Không hiển thị dữ liệu đã xóa" (nếu đổi điều kiện thì dữ liệu đã xóa cũng hiện ra. Dữ liệu đã xóa phân biệt bằng trạng thái "Đã xóa") |

### 10-3. Lưu・cập nhật (đề xuất)

| Quy tắc | Đề xuất |
|---|---|
| Chỉnh sửa đồng thời | So sánh ngày giờ cập nhật lúc mở với lúc lưu, nếu người khác đã lưu trước thì báo lỗi: "Người khác đã cập nhật dữ liệu này. Vui lòng tải lại màn hình rồi thử lại." |
| Xóa | Xóa logic (giữ lại dữ liệu. Danh sách mặc định không hiển thị, có thể hiển thị "Đã xóa" bằng điều kiện tìm kiếm = §10-2). Hợp đồng・thanh toán・yêu cầu không xóa mà xử lý bằng trạng thái |
| Lịch sử thay đổi | Doanh nghiệp・cơ sở・hợp đồng con・Master lưu lại ai・khi nào・đã đổi gì (demo có lịch sử thay đổi) |
| Rời đi mà không lưu | Khi đang nhập mà định rời màn hình, hiển thị "Nội dung đã nhập chưa được lưu. Bạn có muốn chuyển đi không？" |

### 10-4. Đăng nhập・kết nối (đề xuất)

| Quy tắc | Đề xuất |
|---|---|
| Thời gian không thao tác | Đăng xuất sau 60 phút với Web Vận hành, 30 phút với Web Doanh nghiệp (**thời gian khớp với Phase 1** nên cần xác nhận) |
| Khi hết phiên đăng nhập | Về màn hình đăng nhập. Sau khi đăng nhập quay lại màn hình ban đầu |
| Lỗi kết nối | Lỗi hệ thống ở §1-1. Không xóa nội dung đã nhập |
| Nút Quay lại của trình duyệt | Dù quay lại từ màn hình đã gửi xong cũng không bị gửi 2 lần |

### 10-5. Hiển thị số tiền・số (đề xuất)

Số tiền là ¥#,##0 (ghi chưa thuế hay đã gồm thuế trong tên mục), số lượng là #,##0, tỷ lệ là 0.0%.

### 10-6. Quy tắc chung về quyền của Web Vận hành (bổ sung 2026/10/01)

Vì màn hình・nút của Web Vận hành thay đổi theo role nên không ghi theo từng màn hình mà lấy đây làm quy tắc chung. Trong định nghĩa mục của thiết kế màn hình, ở cột "Quyền" của nút chỉ ghi loại thao tác dưới đây (P1〜P8).

#### 10-6-1. Loại thao tác (số tham chiếu từ thiết kế màn hình)

| No | Loại thao tác | Ví dụ | Khi không có quyền |
|---|---|---|---|
| P1 | Tham khảo | Mở danh sách・chi tiết | Không hiển thị trong menu. Nếu mở trực tiếp bằng URL thì "Bạn không có quyền xem màn hình này." → về Trang chủ |
| P2 | Đăng ký・chỉnh sửa | "Đăng ký mới" "Chỉnh sửa" "Lưu" | Không hiển thị nút. Chi tiết chỉ hiển thị dạng tham khảo (không hiển thị ô nhập) |
| P3 | Xóa | "Xóa" | Không hiển thị nút |
| P4 | Phê duyệt・từ chối | Tiếp nhận・đăng ký tạm・đăng ký chính thức của đơn đăng ký, phê duyệt・từ chối yêu cầu thay đổi, phê duyệt nâng kích thước tủ lạnh | Không hiển thị nút |
| P5 | Xác định・phát hành | Xác định thanh toán, "Phát hành bằng Bill One", hủy・phát hành lại hóa đơn | Không hiển thị nút |
| P6 | Nhập thay | Nhập đơn đăng ký・yêu cầu thay cho doanh nghiệp | Không hiển thị nút "Nhập thay" |
| P7 | Xuất・nhập | Xuất CSV・nhập CSV・xuất PDF | Không hiển thị nút |
| P8 | Gửi・tài khoản | Gửi thông báo, phát hành tài khoản doanh nghiệp・cơ sở, gửi lại hướng dẫn đăng nhập, quản lý người dùng Vận hành・role | Không hiển thị nút |

Nguyên tắc là "không hiển thị" (không làm thành màu xám không bấm được). Quy tắc của demo: "Với quyền chỉ tham khảo, nút đăng ký mới và nút thao tác của từng màn hình không hiển thị" (CrudPattern của DS).

#### 10-6-2. Quy tắc về role

| # | Quy tắc | Nội dung | Trạng thái |
|---|---|---|---|
| R1 | Nhiều role | Có thể gán nhiều role cho 1 người. Việc làm được là cộng dồn (chỉ cần 1 role cho phép là làm được) | Demo・cộng dồn là đề xuất |
| R2 | Khi đổi role | Có hiệu lực từ thao tác ở màn hình tiếp theo (không cần đăng nhập lại). Nếu thực hiện thao tác không có quyền ở màn hình đang mở thì "Không thể thực hiện thao tác này do không có quyền." | Đề xuất |
| R3 | Role của chính mình | Không đổi được role của chính mình・không thể vô hiệu hóa chính mình | Đề xuất |
| R4 | Toàn quyền cuối cùng | Khi chỉ có 1 người dùng toàn quyền thì không thể gỡ・vô hiệu hóa toàn quyền của người đó | Đề xuất |
| R5 | Trạng thái người dùng | Có hiệu lực／Vô hiệu／Ngừng sử dụng／Đã xóa (các lựa chọn của demo). Trạng thái khác "Có hiệu lực" thì không đăng nhập được. Nếu vô hiệu hóa khi đang đăng nhập thì đăng xuất ở thao tác tiếp theo | Demo・đăng xuất là đề xuất |
| R6 | Tự phê duyệt | Người đã nhập thay yêu cầu có tự phê duyệt được không | **Chưa quyết (D12・E-11)** |
| R7 | Ghi lại người thao tác | Đăng ký・chỉnh sửa・xóa・phê duyệt・xác định・phát hành・hủy・gửi thì ghi lại ai・khi nào・làm gì vào lịch sử thay đổi. Nhập thay thì ghi "Nhập thay: tên người dùng Vận hành" | Đề xuất |
| R8 | Cách nhìn số tiền | Có tạo role không xem được số tiền (thanh toán・đơn giá・phí phạt hủy) không | Đề xuất: không tạo (cả "Chỉ xem" cũng thấy số tiền). Cần xác nhận |
| R9 | Thu hẹp phạm vi phụ trách | Không giới hạn theo **phạm vi dữ liệu** như phụ trách kinh doanh chỉ thấy doanh nghiệp mình phụ trách (role là đơn vị màn hình và thao tác). Chuyển kho cũng chỉ là lọc hiển thị, không phải đơn vị quyền (ghi chú của demo) | Đề xuất (kho là demo) |

#### 10-6-3. Những điều xem khi test

- Theo từng role, việc hiển thị／không hiển thị menu・nút khớp với bảng §4-3
- Không thể thực hiện màn hình・thao tác không có quyền qua URL hoặc từ màn hình đang mở (server cũng chặn)
- Với nhiều role, kết quả là cộng dồn
- Người thao tác được lưu trong lịch sử thay đổi

### 10-7. Quy tắc chung về quyền của Web Doanh nghiệp (tài khoản doanh nghiệp／tài khoản cơ sở) (bổ sung 2026/10/01)

Web Doanh nghiệp không phải theo role mà theo **2 loại tài khoản doanh nghiệp và tài khoản cơ sở**, phạm vi nhìn thấy và việc làm được khác nhau. Trong định nghĩa mục của thiết kế màn hình, ở cột "Quyền" của nút chỉ ghi một trong "Doanh nghiệp・cơ sở" hoặc "Chỉ doanh nghiệp", các quy tắc chi tiết xem ở đây.

#### 10-7-1. Cách sở hữu tài khoản (quyết định 2026/09/29)

| # | Quy tắc | Nội dung |
|---|---|---|
| C1 | Tài khoản dùng chung | Đăng nhập không phải theo từng người phụ trách mà dùng chung. Doanh nghiệp có 1 tài khoản theo ID doanh nghiệp, cơ sở có 1 tài khoản theo từng cơ sở (ID cơ sở = ID đăng nhập) |
| C2 | Ai đã thao tác | Khi gửi・lưu yêu cầu thì chọn "người yêu cầu" từ những người phụ trách đã đăng ký. "Người yêu cầu" trong danh sách yêu cầu・lịch sử yêu cầu = người (tài khoản) đã chọn |
| C3 | Phạm vi nhìn thấy | Tài khoản doanh nghiệp = tất cả cơ sở của công ty mình. Tài khoản cơ sở = chỉ cơ sở đó |

#### 10-7-2. Việc làm được ở từng màn hình

| Màn hình・thao tác | Tài khoản doanh nghiệp | Tài khoản cơ sở | Căn cứ |
|---|---|---|---|
| Trang chủ | Lịch giao hàng của tất cả cơ sở (đầu ô lịch có tên cơ sở) + danh sách thông báo + lần giao cần xác nhận. Có thể lọc theo cơ sở | Lịch của cơ sở mình + danh sách thông báo | Quyết định H1・demo |
| Danh sách cơ sở | Tất cả cơ sở của công ty mình | Chỉ cơ sở của mình | Demo |
| Chỉnh sửa cơ sở (ô không cần phê duyệt thì phản ánh ngay, ô cần phê duyệt thì yêu cầu) | ○ | ○ (cơ sở của mình) | Demo |
| Xóa cơ sở | × (chỉ Vận hành. Không hiển thị nút) | × | Demo |
| Chỉnh sửa ghi chú giao hàng của nội dung hợp đồng (hợp đồng con) | ○ | ○ (cơ sở của mình) | Demo |
| Đăng ký thay đổi (7 loại ngoài thay đổi thông tin doanh nghiệp) | ○ | ○ (cơ sở của mình. Cũng làm được hủy hợp đồng・tạm ngưng) | Quyết định 2026/09/29 |
| Yêu cầu thay đổi thông tin doanh nghiệp | ○ | × (không hiển thị trong lựa chọn) | Quyết định・demo |
| Thêm cơ sở | ○ | ○. Cơ sở mới được thêm **không hiển thị với tài khoản đã thêm** (xem bằng tài khoản cơ sở mới và tài khoản doanh nghiệp. Kết quả gửi qua email) | Quyết định 2026/09/29・H3 = A |
| Danh sách yêu cầu | Tất cả cơ sở của công ty mình + thay đổi thông tin doanh nghiệp | Chỉ yêu cầu của cơ sở mình (yêu cầu "thêm cơ sở" do chính mình thực hiện cũng không hiển thị = H3) | Quyết định H4・H3 |
| Rút lại yêu cầu (trước phê duyệt) | ○ (yêu cầu do tài khoản nào gửi cũng được) | ○ (cơ sở của mình. Tuy nhiên **không rút lại được yêu cầu do tài khoản doanh nghiệp gửi**: không hiển thị nút và hiển thị "Việc rút lại thực hiện từ tài khoản doanh nghiệp") | Quyết định H2 |
| Hiển thị dòng máy | Mã dòng máy + tên dòng máy (ví dụ: RF000002 Tủ trưng bày lạnh 84L) | Giống | Quyết định H5 |
| Đặt hàng hàng tháng | ○ | ○ (cơ sở của mình) | Demo |
| Báo cáo kiểm kê (cũ: kiểm tra tồn kho) | Cơ sở Giao hàng COOL nhập・báo cáo. **Cơ sở Giao hàng ES cũng có thể xem báo cáo của tài xế rồi đếm lại và báo cáo (báo cáo cuối cùng có hiệu lực. hong 2026-10-05)**, đang tạm ngưng thì không kiểm tra | Giống (cơ sở của mình) | Demo・Sổ quyết định E 2026-10-05 |
| Hóa đơn | Toàn bộ hóa đơn gửi doanh nghiệp | Với hóa đơn gửi doanh nghiệp thì **chỉ phần của cơ sở đó**. Hóa đơn gửi cơ sở thì toàn bộ | Demo |
| Cài đặt thanh toán (đơn vị phát hành v.v.) | Chỉ tham khảo (Vận hành thay đổi) | Chỉ tham khảo | E-9 = B |
| Thông tin doanh nghiệp (thông tin cơ bản・thanh toán・cơ sở・danh sách hợp đồng) | ○ (hiển thị menu) | × (không hiển thị trong menu) | Quyết định・demo |
| Thêm・xóa người phụ trách doanh nghiệp | ○ (phản ánh ngay + thông báo cho Vận hành. Bắt buộc 1 người phụ trách chính・1 người phụ trách thanh toán) | × | STEP2 Q10 |

#### 10-7-3. Những điều thay đổi theo trạng thái (giống §4-2)

- Cơ sở đang tạm ngưng: cơ sở đó chỉ tham khảo. Chỉ làm được đăng ký mở lại・hủy hợp đồng và liên hệ.
- Doanh nghiệp có **tất cả cơ sở đang tạm ngưng**: tài khoản doanh nghiệp vẫn đăng nhập được, màn hình chỉ tham khảo (28-3). Nếu có dù chỉ 1 cơ sở đang sử dụng thì là màn hình bình thường.
- Sau khi hủy hợp đồng: chỉ tham khảo đến hạn thanh toán của hóa đơn cuối cùng, từ ngày hôm sau không đăng nhập được.
- Cơ sở có yêu cầu đang chờ phê duyệt: không gửi được yêu cầu mới của cơ sở đó (rút lại thì được).

#### 10-7-4. Những thứ không hiển thị trên Web Doanh nghiệp (không hiển thị ở cả hai loại tài khoản)

Lịch sử thay đổi (vì hiển thị tên người phụ trách của Vận hành)／các phần liên quan đến phí của hợp đồng con (thông tin thanh toán・①②・tóm tắt số tiền・giảm giá・số tiền chịu・biến động giảm giá tùy chọn)／số tiền thu hồi khi hủy hợp đồng (ghi đè)／kho・công ty giao hàng・thời gian chờ của tuyến giao hàng／mã đại lý・ghi chú nội bộ・nhân viên kinh doanh ES・Bill One ID／người dùng dùng tiền mặt (ghi chú của demo).

#### 10-7-5. Những điều đã quyết H1〜H5 (2026/10/01 Long trả lời. `Quyết_định_Tài_khoản_Web_doanh_nghiệp_H1-H5_20261001.md`)

| # | Nội dung | Quyết định |
|---|---|---|
| H1 | Nội dung Trang chủ của tài khoản doanh nghiệp (trang chủ xem tất cả cơ sở) | Giống portal của công ty giao hàng ủy thác, là lịch giao hàng của tất cả cơ sở và danh sách thông báo. Có thể lọc theo cơ sở (demo đã tạo từ 2026/09/30) |
| H2 | Tài khoản cơ sở có rút lại được yêu cầu về cơ sở mình do tài khoản doanh nghiệp gửi không | Không được. Người rút lại được chỉ là tài khoản đã gửi yêu cầu và tài khoản doanh nghiệp |
| H3 | Cơ sở mới do tài khoản cơ sở "thêm cơ sở" có hiển thị với tài khoản đã thêm không | **A: không hiển thị**. Cơ sở mới và yêu cầu "thêm cơ sở" đó không hiển thị trong danh sách cơ sở・danh sách yêu cầu của tài khoản đã thêm. Phát hành tài khoản cơ sở mới cho cơ sở mới (hướng dẫn đăng nhập gửi cho người phụ trách của cơ sở mới), tài khoản doanh nghiệp xem được. Kết quả xác nhận (lý do phê duyệt・từ chối) gửi qua email cho người đăng ký (RD-CT-062・063) |
| H4 | Danh sách yêu cầu: tài khoản cơ sở chỉ thấy yêu cầu của cơ sở mình không | Đúng (vì H3 = A nên không có ngoại lệ) |
| H5 | Có hiển thị mã dòng máy (RF000002 v.v.) trên Web Doanh nghiệp không | Hiển thị (để xác định dòng máy khi quản lý・liên hệ). Hiển thị cùng tên dòng máy: danh sách cho mượn・thiết bị của hợp đồng con・biến động thiết bị・đăng ký thay đổi thiết bị (lựa chọn・màn hình xác nhận)・số tiền ước tính quyết toán hủy hợp đồng |

#### 10-7-6. Những điều xem khi test

- Với tài khoản cơ sở, không thể xem dữ liệu của cơ sở khác・doanh nghiệp khác từ màn hình・URL・hóa đơn・danh sách yêu cầu
- Với tài khoản cơ sở, không hiển thị menu "Thông tin doanh nghiệp" và lựa chọn "Thay đổi thông tin doanh nghiệp"
- Khi mở hóa đơn gửi doanh nghiệp bằng tài khoản cơ sở thì chỉ hiển thị phần của cơ sở đó
- Người phụ trách đã chọn được lưu ở người yêu cầu
- Các mục ở §10-7-4 không hiển thị ở cả hai loại tài khoản
- Trang chủ của tài khoản doanh nghiệp hiển thị lần giao của tất cả cơ sở và lọc được theo cơ sở. Trang chủ của tài khoản cơ sở chỉ có cơ sở của mình (H1)
- Khi mở yêu cầu do tài khoản doanh nghiệp gửi bằng tài khoản cơ sở thì không hiển thị "Rút lại". Yêu cầu do tài khoản cơ sở gửi thì cả tài khoản cơ sở lẫn tài khoản doanh nghiệp đều rút lại được (H2)
- Sau khi "Thêm cơ sở" bằng tài khoản cơ sở, cơ sở đó và yêu cầu không hiển thị trong danh sách cơ sở・danh sách yêu cầu của tài khoản đó. Hiển thị với tài khoản doanh nghiệp (H3)
- Mã dòng máy hiển thị trước tên dòng máy (H5)

---

## 11. Batch・biểu mẫu・CSV

### 11-1. Batch (xử lý chạy tự động)

| Batch | Khi nào | Nội dung | Căn cứ |
|---|---|---|---|
| Tạo hợp đồng con | Hằng ngày | Tạo hợp đồng con từ lần thứ 2 (lần đầu là thủ công) | Danh sách mục §0.2 |
| Chốt・xác định thanh toán | Chốt ngày 20・xác định ngày 25 | Xác định là thủ công hay tự động thì **cần xác nhận** | Quy tắc thanh toán 1-1 |
| Phát hành bằng Bill One | Vận hành bấm (thủ công・hàng loạt) | — | S6-1 |
| Tạm dừng tài khoản | Hằng ngày | Tạm dừng vào ngày sau hạn thanh toán của hóa đơn cuối cùng + M12 | S4-3 |
| Email bắt đầu・hạn chốt đặt hàng | Hằng tháng | X1 | Bảng yêu cầu dòng 62 |
| Thông báo chưa đặt tài xế | Hằng ngày | 3 ngày trước và 1 ngày trước ngày giao hàng | X5 |
| Cảnh báo đặt hàng chính thức chưa xử lý | Mỗi 24 giờ làm việc | X10 | REQ-PO-302 |
| Tạo・cần xác nhận dữ liệu giao hàng | Hằng ngày | Đặc tả tích hợp | Đặc tả tích hợp |

Các mục ghi cho từng cái (đề xuất): Tên batch／Giờ khởi động (JST)／Đối tượng／Xử lý／**Khi thất bại** (chạy lại・thông báo cho Vận hành)／Kết quả không đổi dù chạy 2 lần.

### 11-2. Biểu mẫu

PDF hóa đơn (do Bill One tạo), PDF phiếu giao hàng (Web Doanh nghiệp), phiếu vận đơn, danh sách picking. Từng cái: nguyên nhân xuất／các mục／thứ tự／tên file.

### 11-3. CSV

Nhập Master gói (có template), danh sách mẫu kinh doanh, đơn nhận của nhà cung cấp, tài khoản tài xế (OPEN). Từng cái: định nghĩa cột／mã hóa ký tự (**đề xuất: UTF-8 có BOM**. Để mở bằng Excel)／lỗi khi nhập (hiển thị danh sách dòng lỗi và lý do, nếu có dù chỉ 1 dòng lỗi thì không nhập tất cả: đề xuất)／số dòng tối đa.

---

## 12. Bảng thuật ngữ (tiếng Nhật・tiếng Việt)

| Thuật ngữ | Ý nghĩa | Tiếng Việt (đề xuất) |
|---|---|---|
| Doanh nghiệp (pháp nhân) | Công ty của khách hàng ký hợp đồng | Pháp nhân (doanh nghiệp) |
| Cơ sở (nơi giao hàng) | Nơi giao sản phẩm. Dưới doanh nghiệp có nhiều cơ sở | Cơ sở (điểm giao hàng) |
| Hợp đồng cha／Hợp đồng con | Hợp đồng của cơ sở／chi tiết theo từng tháng chu kỳ của hợp đồng đó | Hợp đồng cha / Hợp đồng con |
| Tháng chu kỳ | 1 tháng của lịch giao hàng (khác với tháng dương lịch) | Tháng chu kỳ |
| Hạn chốt đặt hàng | Ngày quyết định việc thay đổi có hiệu lực từ tháng đó hay không (mặc định ngày 15 tháng trước) | Hạn chót đặt hàng |
| Tháng thanh toán (trả trước) | Tháng thanh toán khoản trả trước (tháng chu kỳ + thời gian chờ) | Tháng xuất hóa đơn (trả trước) |
| Quyết toán thực tế | Quyết toán tổn thất quản lý v.v. của chu kỳ đã chốt (trả sau) | Quyết toán thực tế |
| Năm tháng bắt đầu hợp đồng ban đầu | Năm tháng cơ sở ký hợp đồng lần đầu | Năm tháng bắt đầu hợp đồng ban đầu |
| Tạm ngưng／Mở lại／Hủy hợp đồng | — | Tạm ngưng / Tiếp tục / Hủy hợp đồng |
| Phân loại phê duyệt | Bắt buộc phê duyệt／Chỉ thông báo／Chỉ Vận hành | Phân loại phê duyệt |
| Trạng thái công khai | Có đưa Master ra đơn đăng ký hay không | Trạng thái công khai |
| Giao hàng ES／Giao hàng COOL／Xe công ty | Phương thức giao hàng | ES配送便 / COOL便 / Xe công ty (giữ nguyên tên riêng) |
| Công ty giao hàng ủy thác | Công ty vận chuyển Giao hàng ES | Công ty giao hàng ủy thác |
| Thời hạn sử dụng tối thiểu／Phí phạt hủy | — | Thời hạn sử dụng tối thiểu / Phí phạt hủy |

Tiếng Việt là đề xuất. Quyết định cùng với `i18n_vi.json` của demo (lập danh sách những chỗ dịch bị lệch).

---

## 13. Những điều muốn nhờ quyết định (xác nhận đề xuất này)

| # | Nội dung | Đề xuất của Claude |
|---|---|---|
| 1 | Cách hiển thị message (§1-1): hoàn tất là toast 3 giây, xác nhận là hộp thoại | Theo đề xuất |
| 2 | Xử lý khi gửi email thất bại・không có người nhận (§2-2) | Lưu lịch sử gửi, thông báo cho Vận hành trên màn hình |
| 3 | Bảng role Vận hành và màn hình (§4-3). Phê duyệt = phụ trách kinh doanh, xác định・phát hành thanh toán = phụ trách kế toán có ổn không | Theo bảng |
| 4 | Người lập phiếu có tự phê duyệt được không (D12・E-11) | Giữ chưa quyết. Xác nhận với khách |
| 5 | Giá trị trạng thái của cơ sở (§5-1) và các ô "đề xuất" của trạng thái × thao tác (§5-3) | Theo bảng |
| 6 | Giờ của hạn chốt (D2)・cách đếm "〜 ngày trước" (D9) | 23:59:59・ngày dương lịch |
| 7 | Số mục・thứ tự sắp xếp・tìm kiếm của danh sách (§10-2) | **Quyết định (2026/10/01)**: 10 mục・chọn thứ tự bằng "Sắp xếp"・dữ liệu đã xóa mặc định không hiển thị. Tìm kiếm chữ (khớp một phần)・kết hợp điều kiện・câu chữ 0 kết quả giữ nguyên đề xuất |
| 8 | Xử lý chỉnh sửa đồng thời・xóa (§10-3) | Báo lỗi cho người lưu sau・xóa logic |
| 9 | Thời gian đến khi đăng xuất (§10-4) | Khớp với Phase 1 (nhờ cho biết giá trị) |
| 10 | Xác định thanh toán (ngày 25) là thủ công hay tự động (§11-1) | Vận hành xác nhận rồi xác định (thủ công) |
| 11 | Mã hóa ký tự CSV・xử lý lỗi khi nhập (§11-3) | UTF-8 BOM・~~nếu có dù chỉ 1 dòng lỗi thì không nhập~~ → **chỉ không nhập dòng lỗi, đăng ký các dòng khác** (hong 2026-10-05・Danh sách mục Master, màn hình danh sách #8. Sổ quyết định F) |
| 12 | Xử lý tháng lẻ của phí phạt hủy (K4) | Làm tròn lên (theo giá trị tạm hiện nay) |
| 13 | Quy tắc chung về quyền của Web Vận hành (§10-6): nút "không hiển thị", role cộng dồn, không đổi được role của chính mình・toàn quyền cuối cùng | Theo đề xuất |
| 14 | Có tạo role không xem được số tiền (R8) không, có giới hạn theo phạm vi dữ liệu (chỉ doanh nghiệp mình phụ trách) (R9) không | Không tạo cả hai |
| 15 | Quy tắc tài khoản doanh nghiệp／tài khoản cơ sở của Web Doanh nghiệp (§10-7) | Theo đề xuất (H1〜H5 đã quyết định 2026/10/01: §10-7-5) |

Những điều đã còn lại là chưa quyết (`デモ全体確認_未決事項と選択肢`): E-3 thời hạn tiếp nhận hủy hợp đồng, E-4 thời hạn sử dụng tối thiểu khi nâng kích thước, E-5 yêu cầu báo giá, E-9 đơn vị phát hành hóa đơn, E-10 tủ lạnh Lite → máy bán hàng tự động, E-12 thông báo đại lý, E-13 tên gọi ③ điều chỉnh, U5 tên trạng thái sử dụng.

<!-- patch_h1h5_spec_20261001 -->
