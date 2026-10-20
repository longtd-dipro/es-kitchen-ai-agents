> Bản dịch tiếng Việt của `ja/01_仕様/70_代理店/代理店・紹介.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đại lý & Giới thiệu (phí giới thiệu · master đại lý · thanh toán)

> **Nguồn chính thức của chủ đề này.** Ngày 2026-10-05, chỉ tổng hợp lại và viết mới những nội dung "đang có hiệu lực" từ tài liệu gốc và các quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (B "Số tiền cơ sở của phí đại lý" v.v.). Nếu có mâu thuẫn thì sổ quyết định là chuẩn.
> Tài liệu gốc (đã đóng băng, chỉ để xem lại quá trình): `docs/議事録_仕様/代理店紹介_詳細要件仕様.md` (REQ-AG).
> Master giảm giá (giảm giá đại lý, v.v.) xem `40_マスタ・料金・請求/オプション・値引き_定義_20261003.md`, mã đại lý trong form đăng ký xem `20_法人・拠点・契約/申込フォーム.md`.

## 1. Cơ bản

| # | Quy định | Căn cứ |
|---|---|---|
| 1-1 | Với khách hàng ký hợp đồng thông qua giới thiệu, trả **phí giới thiệu** cho người giới thiệu (hoặc áp dụng giảm giá). Việc cài đặt do **vận hành** thực hiện (không phải do doanh nghiệp yêu cầu) | REQ-AG §1 |
| 1-2 | Có 4 loại giới thiệu: **giới thiệu doanh nghiệp · giới thiệu đại lý · giới thiệu đối tác · giới thiệu đại lý đặc biệt**. Mẫu phí của đại lý **mặc định có 4 loại A／B／C／D** (vận hành có thể thêm ở master phí giới thiệu: sổ quyết định Q・2026-10-08), được chọn ở màn hình chi tiết đại lý (đại lý chỉ chọn được các gói đang hiệu lực có loại nguồn giới thiệu là "代理店紹介" (giới thiệu đại lý)) | REQ-AG-001 |
| 1-3 | Việc gắn đại lý theo **từng cơ sở (từng hợp đồng cha)**. Mỗi cơ sở có thể gắn một đại lý khác nhau 〔thay đổi 2026-10-16・sổ quyết định B "Gắn đại lý"・sổ tiếp nhận #687. Cũ: theo đơn vị doanh nghiệp (1 doanh nghiệp = 1 đại lý)〕. Cách đếm 36 tháng・reset (§3) cũng **đếm theo từng cơ sở** (sổ quyết định AL・2026-10-16 Q187・Q228) | REQ-AG-021 |
| 1-5 | Người có thể **dừng giới thiệu** là **toàn quyền・quản trị hệ thống・kinh doanh** (sổ quyết định AL・2026-10-16) | Sổ quyết định AL |
| 1-4 | Khi thêm cơ sở, hiển thị đại lý của doanh nghiệp đó làm giá trị mặc định. Có thể đổi sang "対象外" (Không áp dụng) (ô lý do là tùy chọn) | REQ-AG-022 |

## 2. Số tiền · tỷ lệ phí

| Loại | Phí | Cách tính · thời hạn | Căn cứ |
|---|---|---|---|
| Giới thiệu doanh nghiệp (mẫu A) | **33,000 yên (đã gồm thuế)**・1 lần | Khi ký kết thành công. Cùng một doanh nghiệp thì dù có bao nhiêu cơ sở cũng chỉ 1 lần | REQ-AG-006 (hong trả lời 2026/09/30・K-01) |
| Giới thiệu đại lý (mẫu B) | 1 lần. Số tiền theo số lượng cung cấp hàng tháng [tạm]: đến 50 ¥22,000／đến 100 ¥33,000／trên đó ¥55,000 | Khi ký kết thành công. Tùy theo số cơ sở | Sổ quyết định L (số tiền cần xác nhận với khách hàng・`_OPEN一覧` 1005-05) |
| Giới thiệu đối tác (mẫu C) | **10%** số tiền cơ sở | **Tối đa 36 tháng** | REQ-AG-006 |
| Giới thiệu đại lý đặc biệt (mẫu D) | **7%** số tiền cơ sở | Trong suốt thời gian còn tiếp tục | REQ-AG-006 |

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | **Số tiền cơ sở = chỉ là số tiền cố định chưa thuế, sau giảm giá (trả trước).** Không tính phần quyết toán theo thực tế (trả sau). **Hóa đơn trong thời gian dùng thử không thuộc đối tượng** | Sổ quyết định B "Số tiền cơ sở của phí đại lý" |
| 2-2 | Số tiền được tính tự động, sau đó **có thể chỉnh sửa thủ công** (do điều chỉnh giá, trường hợp ngoại lệ). Số tiền giảm giá của giới thiệu doanh nghiệp cũng là ô có thể nhập | REQ-AG-002・004 |
| 2-3 | Hình thức thanh toán "**một lần (shot)／liên tục**" được cài đặt cho từng đại lý・từng hợp đồng | REQ-AG-005 |
| 2-4 | Giảm giá không ghi cứng trong code mà được giữ bằng **master giảm giá (mã giảm giá)**. Trong điều kiện cơ sở được áp dụng có "mã đại lý đối tượng" | REQ-AG-003, 28-60 |

## 3. Cách đếm 36 tháng (loại phí liên tục)

| # | Quy định | Căn cứ |
|---|---|---|
| 3-1 | Đếm **theo từng cơ sở**, **từ lúc bắt đầu hợp đồng chính thức (có phí)** (không đếm thời gian dùng thử) (2026-10-16 sổ quyết định AL・Q186・Q228. Cũ: từ lúc bắt đầu hợp đồng của cơ sở đầu tiên) | REQ-AG-011 |
| 3-2 | Vì đếm theo từng cơ sở nên dù cơ sở khác bị hủy, thời hạn của cơ sở đó cũng không bị ảnh hưởng (sổ quyết định AL・2026-10-16. Cũ: dù cơ sở đầu tiên bị hủy giữa chừng, nếu các cơ sở khác vẫn còn tiếp tục thì thời hạn giữ nguyên) | REQ-AG-012 |
| 3-3 | **Reset cũng đếm theo từng cơ sở** (sổ quyết định AL・2026-10-16. Cũ: reset khi tất cả cơ sở của doanh nghiệp đó đã mất). Cách xử lý khi cùng cơ sở đó ký lại hợp đồng sau khi cơ sở đã mất thì cần xác nhận | REQ-AG-013 |

## 4. Khi gói thay đổi

- Dùng nguyên gói tại thời điểm giới thiệu. **Dù gói thay đổi giữa chừng cũng không tính lại, không quyết toán chênh lệch** (REQ-AG-023). **Không thông báo cho đại lý khi đổi gói・hủy hợp đồng** (giai đoạn 1. Sổ quyết định AL・2026-10-16 Q184).
- Không ghi đè dữ liệu hợp đồng mà tạo dữ liệu mới theo từng tháng (có thể xem ngược lại về trước) (REQ-AG-044).

## 5. Mã đại lý (đăng ký)

| # | Quy định | Căn cứ |
|---|---|---|
| 5-1 | Form đăng ký có **ô mã đại lý (tùy chọn)**. Nếu để trống là "không có giới thiệu". Form dùng cho giới thiệu và form thông thường là một | REQ-AG-031 |
| 5-2 | Không dùng tự khai "Bạn biết đến ở đâu". Xác định người giới thiệu bằng **mã đại lý + vận hành xác nhận (tiếp nhận)** | REQ-AG-032 |

## 6. Màn hình của vận hành

| Màn hình | Nội dung | Căn cứ |
|---|---|---|
| Master đại lý | Thông tin đại lý・mẫu phí・gói giới thiệu・tỷ lệ／số tiền・người phụ trách chính・danh sách cơ sở đang có hiệu lực・danh sách lịch thanh toán | REQ-AG-041 |
| Danh sách giới thiệu | Người giới thiệu・người được giới thiệu・gói・course・số tiền hóa đơn・số tiền chi trả・ngày dự kiến kết thúc・số tiền chi trả theo từng tháng. Xuất CSV | REQ-AG-042 |
| Quản lý thanh toán | Dữ liệu theo từng đại lý・từng tháng. "未確認／確認済" (Chưa xác nhận／Đã xác nhận). Có thể sửa trạng thái thanh toán và ngày thanh toán từ danh sách | REQ-AG-043・045 |
| Tự động tạo lịch sử thanh toán | **Vào ngày 1 hàng tháng, tự động tạo lịch sử thanh toán cho phần của tháng trước** (đối tượng **chỉ là các giới thiệu đang hiệu lực**). Theo đúng code (`lib/domain/feePayments.ts`・`batch.ts`), không đặt điều kiện khác | Sổ quyết định AK (2026-10-15・hong trả lời M36) |

## 7. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U1 | **Hình thức cuối cùng của phương thức tính**: ngày 2026/01/16 được giải thích là "tỷ lệ (%)", ngày 2026/06/16 là "giảm giá theo gói + mã giảm giá". Số tiền・tỷ lệ (33,000 yên・10%・7%) và số tiền cơ sở đã được quyết định, nhưng chưa rõ sẽ dùng "giảm giá theo gói" đến mức nào | Xác nhận với khách hàng (giám đốc・anh Aoyama) |
| U2 | Số tiền của mẫu B (giới thiệu đại lý) (hiện là [tạm]). Đối ứng của các mẫu: A = doanh nghiệp・B = đại lý・C = đối tác・D = đại lý đặc biệt (hong 2026-10-05) | Xác nhận với khách hàng (`_OPEN一覧` 1005-05) |
| U3 | Thời điểm thanh toán (đã quyết định không đưa phần trả sau vào số tiền cơ sở. Chưa định khi nào trả) | Xác nhận với khách hàng |
| U4 | Điều kiện phát sinh thanh toán khi thêm cơ sở. Sổ quyết định AL (2026-10-16): phí khi thêm cơ sở **được quy định trong đặc tả theo từng mẫu** (đặc tả này chưa ghi = cần xác nhận. Quan hệ giữa "cùng một doanh nghiệp thì dù có bao nhiêu cơ sở cũng chỉ 1 lần" của mẫu A 〈§2〉 với việc gắn theo từng cơ sở・36 tháng cũng cần xác nhận) | Xác nhận với khách hàng・cần xác nhận |
| U5 | Thông báo số tiền chi trả cho đại lý bằng CSV・thông báo cho đại lý khi đổi gói／hủy (REQ-AG-046・047. Đã quyết định **giai đoạn 1 không thông báo** = sổ quyết định AL・2026-10-16)・email yêu cầu lập hóa đơn cho đại lý (dòng 117 của bảng yêu cầu) | Chưa quyết (quyết định khi báo giá) |
| U6 | Tự động nhận biết kênh giới thiệu từ việc ký kết thành công trên HubSpot và thông báo (REQ-AG-033) | Tạm thời. Phạm vi giai đoạn 2 chưa định |
| U7 | Giảm giá đại lý DC000001 (5%・tối đa ¥5,000) là [tạm] | Xác nhận với khách hàng |

- **Người giới thiệu được giữ 1 cái cho mỗi hợp đồng chính thức = mỗi hợp đồng cha. Khi đăng ký nhiều cơ sở cùng lúc, chỉ cần nhập 1 lần ở đơn đăng ký (lịch bắt đầu của tiếp nhận・tab hợp đồng cha) là được ghi vào hợp đồng cha của tất cả cơ sở** (vào từng hợp đồng cha khi đăng ký tạm・đăng ký chính thức. Màn hình ghi chú ngắn "全拠点に付きます" (Áp dụng cho tất cả cơ sở)). Người giới thiệu đã có lịch sử thanh toán thì không đổi được (quy tắc hiện có). Việc có hay không thao tác đổi riêng 1 cơ sở về sau (chi tiết hợp đồng cha) thì chưa quyết = ⚠️ cần xác nhận (2026-10-15 hong・bổ sung sổ tiếp nhận #647).
- 〔2026-10-18 sổ quyết định AS・sổ tiếp nhận #768・#777〕Giới thiệu từ đại lý cũng tự động tạo lịch sử giới thiệu. Khi đổi người giới thiệu giữa đại lý⇔doanh nghiệp ở bước tiếp nhận, **nếu chưa có lịch sử thanh toán thì giữ nguyên lịch sử giới thiệu đó, đổi sang phí giới thiệu (gói) của người giới thiệu mới, và ghi lại trong lịch sử**. Nếu đã có lịch sử thanh toán thì không đổi được (cả đại lý lẫn doanh nghiệp). Không giữ ID giới thiệu chỉ để hiển thị. Việc hết hạn của loại một lần v.v. được cập nhật hằng ngày.
