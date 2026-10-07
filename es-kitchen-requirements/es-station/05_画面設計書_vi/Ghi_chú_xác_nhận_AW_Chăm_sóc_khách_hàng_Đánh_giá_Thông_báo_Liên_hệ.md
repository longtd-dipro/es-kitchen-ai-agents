# Ghi chú xác nhận: Web vận hành - Chăm sóc khách hàng (Đánh giá・Góp ý／Danh sách thông báo／Liên hệ) — Ghi chú rà soát trước khi viết Thiết kế màn hình

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Phạm vi Vận hành F (phần còn lại sau Quản lý khảo sát) ／ Nguồn: code thật (`app/ops/reviews/**`, `lib/ops/reviews/*`, `lib/ops/areas/reviews.ts`; `app/ops/notices/**`, `app/ops/_general/gen.ts` (notices), `lib/ops/general/{logic,fromDomain,seed}.ts`, `lib/ops/areas/general.ts`, `lib/domain/areas/notice.ts`, `lib/domain/mails.ts`; `app/ops/inquiries/page.tsx`, `app/corp/contact/page.tsx`), `docs/決定台帳.md` (K "Phạm vi hiển thị đánh giá cho doanh nghiệp", M "Thông báo rơi vào ngày nghỉ của khách hàng" "Thông báo" "Liên hệ (HubSpot)", B "Gửi thông báo (toàn bộ site)"), `docs/01_仕様/80_Màn_hình_vận_hành_và_doanh_nghiệp/Màn_hình_vận_hành_và_doanh_nghiệp.md` §3・§5, `Bảng_phân_quyền_Web_vận_hành_20261003.md`, `Định_nghĩa_nhập_xuất_CSV_20261003.md`, `Quy_ước_mã_màn_hình_20261005.md`, Message List CSV.

Quy ước: **[Q]** cần hong trả lời ／ **[Bài tập về nhà]** đã chốt, code chưa theo → Thiết kế màn hình theo quyết định + `demo_ok` ／ **[open]** hỏi khách ／ **[msg]** câu chữ message (dải Vận hành F: E200〜E219 đã dùng tới E219 cho Khảo sát → phần này dùng **E220〜**? → xem Q-C3).

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code theo Quy ước Screen Code (Feature 4 chữ): **AW_REVI** (Đánh giá), **AW_NOTI** (Thông báo; Figma Notification Management đã dùng AW_NOTI_001〜009), **AW_INQU** (Liên hệ). Book: Web quản trị viên vận hành_Chăm sóc khách hàng (cùng với AW_SURV).

### 1-1. Đánh giá・Góp ý (AW_REVI) — chỉ xem・tìm・xuất CSV (hong 2026-09-28)

| Screen | Code | Trạng thái | URL / cách tạo |
|---|---|---|---|
| Danh sách đánh giá | AW_REVI_001 | 001 Hiển thị ban đầu | `/ops/reviews` |
| | | 002 Chưa áp dụng | gõ từ khóa chưa nhấn Tìm kiếm |
| | | 003 0 kết quả | từ khóa không có + Tìm kiếm |
| | | 004 Menu sắp xếp | nhấn Sắp xếp |
| | | 005 Mở "Hiển thị thêm N sản phẩm khác" | nhấn Hiển thị thêm N sản phẩm khác ở dòng có ≥3 sản phẩm |
| | | 006 Lọc theo ★2 trở xuống | Đánh giá = ★2 trở xuống + Tìm kiếm |
| Chi tiết đánh giá | AW_REVI_002 | 007 Hiển thị ban đầu | `/ops/reviews/RV001064` (có bình luận) |
| | | 008 Không bình luận・đã rút lui・ẩn danh | RV của user đã rút lui / nickname trống |

Mục dự kiến: Danh sách ≈ 25 ／ Chi tiết ≈ 20.

### 1-2. Danh sách thông báo (AW_NOTI)

| Screen | Code | Trạng thái | URL / cách tạo |
|---|---|---|---|
| Danh sách thông báo | AW_NOTI_001 | 001 Hiển thị ban đầu | `/ops/notices` |
| | | 002 Chưa áp dụng ／ 003 0 kết quả ／ 004 Hiển thị mục đã xóa | như các Danh sách khác |
| | | 005 Xác nhận xóa | thùng rác |
| Đăng ký mới・Chỉnh sửa thông báo | AW_NOTI_002 | 006 Đăng ký mới Hiển thị ban đầu | `/ops/notices/new` |
| | | 007 Chọn riêng đối tượng gửi (modal) | Doanh nghiệp・cơ sở → Chọn riêng → Chọn |
| | | 008 Nhập CSV chọn riêng (modal) | nút Nhập CSV trong modal Chọn riêng |
| | | 009 Có gửi email (ô thiết lập email) | tích Gửi email → hiện các ô tiêu đề・người gửi・chỉ định ngày giờ・nội dung email・chữ ký |
| | | 010 Quan trọng | tích Quan trọng → hint ngày giờ gửi được khuyến nghị |
| | | 011 Lỗi nhập liệu | Đăng ký khi để trống |
| | | 012 Chỉnh sửa Đang công khai | `/ops/notices/12446/edit` |
| | | 013 Hủy nội dung chỉnh sửa | sửa rồi Hủy |
| Chi tiết thông báo | AW_NOTI_003 | 014 Đang công khai (có tệp đính kèm・có ghi chép gửi) | `/ops/notices/12446` |
| | | 015 Đã lên lịch ／ 016 Dừng gửi ／ 017 Kết thúc ／ 018 Đã xóa | 12448 ／ 12444 ／ 12447 ／ 12445 |
| | | 019 Xác nhận xóa (modal) | nút Xóa |
| | | 020 Xác nhận dừng gửi (modal) | **chưa có trong code** (Q-N3) |

Mục dự kiến: Danh sách ≈ 28 ／ Đăng ký・Chỉnh sửa ≈ 45 ／ Chi tiết ≈ 20.

### 1-3. Liên hệ (từ Web doanh nghiệp) (AW_INQU)

| Screen | Code | Trạng thái | URL / cách tạo |
|---|---|---|---|
| Danh sách liên hệ | AW_INQU_001 | 001 Hiển thị ban đầu (có mục mới) | `/ops/inquiries` |
| | | 002 Mở dòng (nội dung・mất dấu mới) | nhấn dòng IQ-261003-0001 |
| | | 003 0 kết quả | (search sau khi thêm Tìm kiếm: Q-I1) |

Mục dự kiến ≈ 18.

---

## 2. Điểm cần hong quyết định [Q]

### Chung (C)
- **Q-C1. Screen Code**: `AW_REVI` (Review), `AW_NOTI` (Figma), `AW_INQU` (Inquiry). OK?
- **Q-C2. Tên trạng thái "Đã lên lịch" (Thông báo) ↔ "Dự kiến" (Khảo sát)**: cùng nghĩa "chưa tới ngày bắt đầu". Đề xuất thống nhất **"Dự kiến"** (lib/format/status.ts đã có cả hai, cùng màu xanh dương). A: "Dự kiến" cho cả hai ／ B: giữ mỗi màn một tên.
- **Q-C3. Dải message**: Vận hành F được cấp E200〜E219 (20 số), Khảo sát đã dùng hết. Thông báo・Đánh giá・Liên hệ cần ≈ 8 message mới. Đề xuất dùng tiếp **E220〜E229** (dải Vận hành G Master(1) là E220〜E239 nhưng Vận hành G đã xong và chỉ dùng E33〜E50 cũ). A: dùng E220〜 ／ B: hong cấp dải khác.
- **Q-C4. Tên nhóm menu / breadcrumb**: menu là "Chăm sóc khách hàng" nhưng breadcrumb trong code của Thông báo・Liên hệ ghi "Thiết lập thông báo"; tiêu đề Liên hệ là "Liên hệ (gửi HubSpot)" còn menu ghi "Liên hệ (từ Web doanh nghiệp)". Đề xuất: breadcrumb "Chăm sóc khách hàng", tiêu đề "Liên hệ (từ Web doanh nghiệp)".

### Đánh giá・Góp ý (R)
- **Q-R1. ID**: code RV＋6 chữ số (RV001064), ID người dùng U＋8 chữ số, Số đơn hàng OD＋7 chữ số (DemoNote ghi "Cần xác nhận"). Chốt như code?
- **Q-R2. Xuất CSV**: 1 dòng＝1 sản phẩm (lặp các cột Đánh giá: ID đánh giá・ngày giờ đăng・ID người dùng・biệt danh・rút lui・ID doanh nghiệp・doanh nghiệp・ID cơ sở・cơ sở・số đơn hàng・ID sản phẩm・tên sản phẩm・điểm đánh giá・thẻ đánh giá・bình luận), theo điều kiện tìm kiếm, không có địa chỉ email (DemoNote "Cần xác nhận"). Chốt?
- **Q-R3. Link ở Chi tiết**: ID người dùng・số đơn hàng・doanh nghiệp・cơ sở・ID sản phẩm hiện là link giả (không đi đâu). Đề xuất: Doanh nghiệp → Chi tiết doanh nghiệp, Cơ sở → Chi tiết cơ sở, ID sản phẩm → Chi tiết Master Sản phẩm, ID người dùng → Danh sách tài khoản (tab Người dùng), Số đơn hàng = chữ thường (không có màn đơn app ở Vận hành). A: như đề xuất ／ B: tất cả chỉ là chữ.
- **Q-R4. 1 trang**: code mặc định 20 dòng (10/20/50). STEP7 L1 = 10. → bài tập về nhà (viết 10) trừ khi hong muốn 20 cho màn này.
- **Q-R5. Thẻ đánh giá cố định** (không có master; ★1〜2 = 6 thẻ không hài lòng, ★3〜5 = 6 thẻ hài lòng). Xác nhận? (hong 2026-09-28 theo DemoNote, chưa có trong Sổ quyết định).

### Danh sách thông báo (N)
- **Q-N1. ID của Thông báo**: code là số 5 chữ số (12444…). Các chức năng khác có tiền tố (SV-, IQ-, AP-…). Đề xuất **"NT-＋5 chữ số"** tự cấp. A: NT-＋5 chữ số ／ B: giữ số ／ C: khác.
- **Q-N2. Category**: code cố định 3 giá trị Thông báo／Bảo trì／Cập nhật hệ thống, nhưng seed có "Menu" (12454). Chốt danh sách? Đề xuất 4: Thông báo／Menu／Bảo trì／Cập nhật hệ thống, cố định (không master).
- **Q-N3. Dừng gửi**: Danh sách có trạng thái Dừng gửi nhưng **không có nút** để dừng (chỉ dừng được khi Xóa). Đề xuất như Khảo sát: nút Dừng gửi ở Chi tiết và cột thao tác Danh sách (Đang công khai・Dự kiến), xác nhận Q, không hoàn lại; Dừng gửi không Chỉnh sửa, Xóa được.
- **Q-N4. "Thông báo tới ESS"**: cột tick trong bảng Đối tượng gửi dùng chữ "ESS". Sổ quyết định: tên hệ thống là "ES STATION", không dùng "ESSTATION" "ES Station (viết katakana)". Đề xuất đổi thành **"Hiển thị trên site"** (hiện trong Danh sách thông báo của site/app đó). A: Hiển thị trên site ／ B: Hiển thị trên ES STATION ／ C: giữ ESS.
- **Q-N5. Người gửi mail**: code cố định "Văn phòng vận hành ES Kitchen <no-reply@es-kitchen.jp>", ô chữ ký cố định có `{info@es-kitchen.co.jp}`. Sổ quyết định B: Người gửi mail do Quản trị hệ thống quản lý. Đề xuất: Thiết kế màn hình ghi "đọc từ thiết lập của Quản trị hệ thống (giá trị ban đầu là mẫu)", giá trị thật → **[open] hỏi khách**.
- **Q-N6. Nội dung email có bắt buộc?**: label có * nhưng validate không kiểm tra; Chỉ định ngày giờ bắt buộc khi có Gửi email. Đề xuất: bắt buộc (theo label) khi có Gửi email.
- **Q-N7. Ngày giờ bắt đầu・kết thúc hiển thị**: code là ô text gõ `yyyy-mm-dd HH:mm`. Chuẩn: dùng thành phần Ngày + giờ như Khảo sát → bài tập về nhà (không hỏi). Ngày giờ kết thúc hiển thị trống = không kết thúc (giữ).
- **Q-N8. Tệp đính kèm**: code demo chỉ đếm số file. Thiết kế màn hình ghi theo input_standard (JPG・PNG・PDF・HEIC, 5MB, 10 tệp), tải được ở Chi tiết, không đính kèm mail (RD-NT-019). OK?
- **Q-N9. Thứ tự ban đầu của Danh sách**: đề xuất Ngày cập nhật cuối giảm dần (quy tắc chung). OK?

### Liên hệ (I)
- **Q-I1. Tìm kiếm・phân trang**: code không có (bảng phẳng). Đề xuất theo P-LIST: Từ khóa (số tiếp nhận・tiêu đề・họ tên), Doanh nghiệp, Loại (6 loại của Web doanh nghiệp: Hợp đồng・Đăng ký／Giao hàng・Nhận hàng／Sản phẩm・Menu／Thanh toán・Chi trả／App・Máy bán hàng tự động／Khác), Trạng thái, Chỉ mục mới, Ngày gửi (từ〜đến); 10 kết quả/trang; thứ tự ban đầu Ngày giờ gửi giảm dần.
- **Q-I2. Cột Doanh nghiệp・Cơ sở**: code chỉ hiện ID (CU00001 ／ CU00871). Đề xuất hiện **tên doanh nghiệp・tên cơ sở** (ID dưới dạng mono nhỏ) → bài tập về nhà.
- **Q-I3. Lỗi gửi**: trạng thái có "Lỗi gửi" nhưng không có thao tác. Đề xuất nút **"Gửi lại tới HubSpot"** (Quyền đầy đủ) ở dòng Lỗi gửi; thành công → Đã gửi (HubSpot). A: có gửi lại ／ B: không (bên vận hành xử lý tay ngoài hệ thống).
- **Q-I4. Mở nội dung**: hiện click dòng mở nội dung inline và bỏ dấu mới. Giữ (không làm màn Chi tiết riêng)? A: giữ inline ／ B: màn Chi tiết riêng.
- **Q-I5. Quyền**: Bảng quyền "Liên kết Hubspot/API" = CRUD Quyền đầy đủ, × các vai trò khác → chỉ Quyền đầy đủ (và Quản trị hệ thống) thấy màn này. Có đúng ý không? (CS thường là người đọc Liên hệ.) A: giữ ／ B: CS = R/U.

---

## 3. Code khác quyết định [Bài tập về nhà] (viết Thiết kế màn hình theo quyết định, `demo_ok`)
| # | Nội dung | Quyết định | Code |
|---|---|---|---|
| H1 | Danh sách đánh giá 1 trang 10 | STEP7 L1 | 20 |
| H2 | Danh sách đánh giá, message 0 kết quả | I01 | "Không có đánh giá khớp điều kiện" |
| H3 | Thông báo, nhập ngày giờ | Thành phần ngày＋giờ (chuẩn) | text yyyy-mm-dd HH:mm |
| H4 | Thông báo, câu chữ xác nhận xóa・hủy | Q01/Q02 (Message List) | câu riêng |
| H5 | Liên hệ, tên doanh nghiệp・tên cơ sở | Q-I2 | chỉ ID |
| H6 | Breadcrumb "Thiết lập thông báo" | Q-C4 | Thiết lập thông báo |
| H7 | Quyền engagement có `update` nhưng màn Đánh giá không có gì để sửa | R/U = Xuất CSV | — |

## 4. [open] hỏi khách
- O1 Địa chỉ email người gửi・ô chữ ký (Q-N5).

## 5. [msg] message mới dự kiến (dải theo Q-C3)
- E: Hãy chọn ít nhất 1 đối tượng gửi／Hãy chọn đối tượng trong phần chọn riêng của {phân loại}／Định dạng ngày giờ bắt đầu hiển thị／Định dạng chỉ định ngày giờ của email／Không thể chỉnh sửa thông báo ở trạng thái {trạng thái}／Không thể gửi lại (nếu Q-I3=A).
- Q: Xóa thông báo? (biến mất khỏi danh sách của từng site・dữ liệu vẫn còn dưới dạng đã xóa)／Dừng gửi? (Thông báo)／Gửi lại tới HubSpot?.
- S: Đã đăng ký (dùng lại S151)／Đã dừng gửi (dùng lại S150)／Đã gửi lại.
- I: Chưa có liên hệ nào (dùng lại I01)／Đây là thông báo chỉ gửi email (không hiển thị trên bất kỳ site nào).
- Dùng lại: E01・E02・E04・E13・E200 (định dạng ngày giờ)・E201・Q01・Q02・S01・S02・E33・E32.

## 6. Đã khớp (không hỏi)
- Đánh giá: chỉ Xem・Tìm kiếm・Xuất CSV; 1 dòng＝1 bài đăng, sản phẩm ★ thấp lên trước 2 món + N sản phẩm khác; Chưa đặt biệt danh＝người dùng ẩn danh; đã rút lui vẫn giữ + badge; không có địa chỉ email ở bất cứ đâu; doanh nghiệp thấy sao・sản phẩm・thẻ・biệt danh (Sổ quyết định K, màn doanh nghiệp không thuộc phạm vi này); Tìm kiếm chỉ khi Tìm kiếm/Enter + Chưa áp dụng; từ Chi tiết quay lại thì khôi phục điều kiện (P-LIST).
- Thông báo: 5 phân loại đối tượng gửi (Doanh nghiệp・cơ sở／Người dùng app／Nơi giao ủy thác／Nhân viên giao hàng／Nhà cung cấp), mỗi phân loại: Hiển thị trên site / Gửi email (vai trò: người phụ trách chính・thanh toán・phụ, app/driver: chính người đó) / Tất cả・Chọn riêng (+Nhập CSV ID); thông báo chỉ gửi email vẫn OK (Sổ quyết định M); Quan trọng → email tự động 8:00 ngày bắt đầu công khai (thứ Bảy・Chủ nhật・ngày lễ → ngày làm việc trước đó), ngày giờ được khuyến nghị khi lưu (Sổ quyết định M); Ghi chép gửi (đăng ký/cập nhật/đặt lịch gửi email/gửi email); Xóa = xóa logic; Khách và ESQR ngoài đối tượng (80_ §5-3).
- Liên hệ: gửi HubSpot từ Web doanh nghiệp, bên vận hành không nhận mail (TOP đếm mục mới, email nơi nhận thông báo ở Quản lý thiết lập = Vận hành I), trả lời trong HubSpot (Sổ quyết định M).

---

## 7. hong trả lời (2026-10-05)
- C1 AW_REVI／AW_NOTI／AW_INQU ✓ ／ C2 = A (thống nhất "Dự kiến") ／ C3 = A (dùng cả E220〜E229) ／ C4 "Chăm sóc khách hàng" không được → tên khác (đang hỏi).
- R1・R2 như đề xuất ／ R3 = A ／ R4 = 10 ／ R5 ✓ cố định, nhưng muốn sau này đổi được → đang hỏi cách (Quản lý thiết lập hay dev).
- N1 NT-＋5 chữ số ／ N2 4 category ／ N3 Dừng gửi như Khảo sát ／ N4 = B "Hiển thị trên ES STATION" ／ N5 giá trị trong code là mặc định, giữ làm **giá trị thiết lập** (đổi được sau; Quản lý thiết lập = Vận hành I) ／ N6 bắt buộc ／ N8 OK ／ N9 OK.
- I1 ✓ ／ I2 2 cột Tên doanh nghiệp・Tên cơ sở ／ I3 chưa rõ → giải thích lại ／ I4 = B (màn Chi tiết riêng → thêm AW_INQU_002) ／ I5 = A.
- Đã ghi Sổ quyết định E (8 dòng).
- C4 = A "Thông báo・Góp ý" (menu + breadcrumb) ／ R5 = B (không có màn sửa thẻ) ／ I3 = hong xác nhận scope sau → Thiết kế màn hình ghi `open` (nơi xác nhận: hong).
- **I3 = Quyết định (hong 2026-10-05 chiều tối)**: Lỗi gửi thì **hiển thị lỗi trên Web doanh nghiệp để khách hàng gửi lại** (giữ nội dung nhập trong form・không lưu ở ES). **Không làm** trạng thái "Lỗi gửi", "Gửi lại tới HubSpot", E "Không thể gửi lại", cảnh báo ở TOP. Bỏ "Trạng thái" khỏi điều kiện tìm kiếm của danh sách bên vận hành. Sổ quyết định "Cách xử lý lỗi gửi liên hệ (HubSpot)"・Sổ tiếp nhận #133. `open` (I3) của Thiết kế màn hình đóng lại theo nội dung này.

---

## 8. Kết quả tạo (2026-10-05)
- Dữ liệu: `Dữ_liệu/AW_REVI_Đánh_giá_và_ý_kiến.py` (2 màn・8 trạng thái) ／ `AW_NOTI_Thông_báo.py` (3 màn・18 trạng thái) ／ `AW_INQU_Liên_hệ.py` (2 màn・2 trạng thái). Thêm E220〜E223・Q152・Q153・I152 vào `_Chung_Thông_báo.py`.
- `make.py --check` OK → `--capture` (Chromium của cloud・Ad00010・Web thật) ở tất cả trạng thái REVI 8／NOTI 18／INQU 2 đều tìm thấy hết các số (missing 0) → `--book Web_quản_trị_vận_hành_Thông_báo_và_ý_kiến AW_SURV AW_REVI AW_NOTI AW_INQU`.
- Đầu ra: `Đầu_ra/Web_quản_trị_vận_hành_Thông_báo_và_ý_kiến/` (xlsx JA/VI・4 HTML・img). Đầu ra cũ của Khảo sát `Đầu_ra/AW_SURV_Khảo_sát管理/` đã được gộp vào book này nên đã xóa.
- Mẹo chụp: mẫu của Thông báo (Dự kiến 12457・Kết thúc 12458・Đã xóa 12459) được tạo trong setup của 003 bằng API `/api/dev/reset` → `saveNotice`／`deleteNotice` (trong setup không dùng được `location.reload()`). Điều kiện tìm kiếm của Đánh giá còn lại trong sessionStorage nên ở setup của mỗi trạng thái nhấn "Xóa điều kiện" (`sessionStorage.clear()` sẽ bị đăng xuất).
- Chỗ quyết định và code khác nhau được ghi lý do ở `demo_ok` = bài tập về nhà của code (giống §3): Đã lên lịch→Dự kiến, ID Thông báo NT-＋5 chữ số, "Hiển thị trên ES STATION", Dừng gửi (Danh sách・Chi tiết), giá trị thiết lập của người gửi・chữ ký, Tìm kiếm・phân trang・tên doanh nghiệp/cơ sở・màn Chi tiết・quyền xuất CSV của Liên hệ.
- open: I3 (cách xử lý lỗi gửi) đang chờ hong xác nhận scope (vẫn là `open`).

---

## 9. Chỉ ra của hong trên HTML (2026-10-05 chiều tối) và cách xử lý
| # | Chỉ ra | Xử lý | Ở đâu |
|---|---|---|---|
| 1 | Không có ID đánh giá → số đơn hàng. Doanh nghiệp・cơ sở thành cột riêng | Đã phản ánh (cả code). Danh sách・Chi tiết・CSV・tìm kiếm・URL＝số đơn hàng OD＋7 chữ số. Danh sách đánh giá của Web doanh nghiệp là bài tập về nhà | Sổ quyết định "Quy định Đánh giá・Góp ý (Web vận hành)", Sổ tiếp nhận #135, AW_REVI |
| 2 | Sắp xếp theo mọi cột của danh sách | Đã phản ánh (Đánh giá thì cả code: mục＋tăng dần／giảm dần. Thông báo thì thành phần dùng chung vốn đã có mọi cột) | Sổ quyết định "Quy định Danh sách" |
| 3 | Danh sách 10 kết quả (phân trang) | Theo Sổ quyết định (10/01). Đã sửa code Đánh giá từ 20→10 | — |
| 4 | Khung tìm kiếm của Danh sách thông báo khác các màn khác → xem lại thành phần | Nguyên nhân: Thông báo・Khảo sát, v.v. dùng `FilterBlock` dùng chung (.filter), Danh sách master・Đánh giá dùng `es-search` của Design System ES Kitchen. **hong＝A (3A)**: đã sửa thành phần dùng chung theo cách sắp xếp của es-search (ô điều kiện xuống dòng về bên trái, bên phải là Xóa điều kiện・Tìm kiếm và Sắp xếp, chỉ đóng/mở khi từ 2 dòng trở lên). Có tác dụng với mọi Danh sách của Vận hành dùng nó. sel của Thiết kế màn hình giữ nguyên (giữ lại .filter・.f-act・.sortbox) | Sổ quyết định "Quy định Danh sách", P-LIST, Sổ tiếp nhận #140, `ListView.tsx`・`ops.css` |
| 5 | Chọn riêng là popup riêng cho từng dòng (phân loại) | Đã phản ánh: trạng thái 006〜010 theo từng phân loại (code vốn đã theo từng phân loại) | Sổ quyết định "Tên cột・tệp đính kèm・thứ tự của đối tượng gửi Thông báo", Sổ tiếp nhận #137 |
| 6 | Câu chữ của modal đính kèm tệp NG | **hong＝A (2A)**: đổi phần giải thích ở ô đính kèm thành "Mở được ở chi tiết thông báo của từng site. Không đính kèm vào email (JPG・PNG・PDF・HEIC, 5MB mỗi tệp, tối đa 10 tệp)" (cả code) | Sổ tiếp nhận #139, AW_NOTI No.5.6 |
| 7 | Cho sửa được ô chữ ký | Đã phản ánh (cả code). Mặc định＝giá trị thiết lập | Sổ quyết định "Người gửi・chữ ký của email thông báo", Sổ tiếp nhận #136 |
| 8 | Đầu tiêu đề email có 【ES Station】 | Đã phản ánh (cả code: gắn khi gửi. Đã sửa cả mẫu 【ESSTATION】) | Sổ quyết định "Giá trị mặc định của tiêu đề・nội dung・chỉ định ngày giờ email thông báo" |
| 9 | Giá trị mặc định của tiêu đề・nội dung・ngày giờ công khai＝nội dung thông báo (sửa được) | Đã phản ánh (cả code: giá trị mặc định nội dung email＝nội dung) | Như trên |
| 10 | Đính kèm tối đa 5 tệp | **hong: rút lại** (giữ chuẩn chung 10 tệp) | Sổ tiếp nhận #138 |
| 11 | Thông báo có cần Xuất CSV không | Theo đặc tả (CSV入出力_定義 §: mọi Danh sách của Vận hành đều có Xuất CSV・Danh sách thông báo ✅) thì **có**. Nếu bỏ thì đổi theo trả lời của hong | — |
| 12 | Dừng gửi nằm ở màn hình nào | Khảo sát: Danh sách (cột thao tác) + Chi tiết. Thông báo: Danh sách (cột thao tác) + Chi tiết (chỉ Đang công khai・Dự kiến. Không hoàn lại được) | Sổ quyết định "Lối vào Dừng gửi của Khảo sát" "Dừng gửi của Thông báo" |
| 13 | Bỏ dấu "Chưa áp dụng" | Đã phản ánh (main Sổ tiếp nhận #127: đã bỏ khỏi mọi Danh sách. Trạng thái "Chưa áp dụng" cũng bỏ khỏi Thiết kế màn hình) | P-LIST |
- §5b (Liên hệ): Đã phản ánh I3＝B (đóng `open`, bỏ "Trạng thái" khỏi điều kiện tìm kiếm, trạng thái chỉ còn "Đã gửi (HubSpot)").
