# Ghi chú xác nhận: Quản lý khảo sát (Web vận hành) — Ghi chú rà soát trước khi viết Thiết kế màn hình

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Nguồn: code thật (`app/ops/surveys/**`, `lib/domain/survey.ts`, `lib/domain/areas/survey.ts`, `lib/domain/seed/survey.ts`, `lib/csv/survey.ts`, `lib/domain/batch.ts`, `lib/domain/seed/notice.ts`, `lib/ops/permissions.ts`, `lib/domain/seed/account.ts`), `docs/決定台帳.md` (E "「Tất cả」của khảo sát", "Cách chạy batch bản chính thức", B Giao hàng REQ-DL-718), `docs/01_仕様/Bảng_phân_quyền_Web_vận_hành_20261003.md`, `docs/01_仕様/Định_nghĩa_nhập_xuất_CSV_20261003.md`, `docs/01_仕様/Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` §10, `Quyết_định_STEP7_Quy_định_về_danh_sách_20261001.md`, `Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md` QC, `.claude/skills/screen-design-doc/references/input_standard.md`, Message List CSV (`docs/01_仕様/30_Đơn_yêu_cầu/MessageList_*_20261001.csv`).

Quy ước: **[Q]** = cần hong trả lời ／ **[Bài tập về nhà]** = Sổ quyết định đã chốt, code chưa theo → thiết kế viết theo quyết định, ghi `demo_ok` ／ **[open]** = chưa ai quyết, hỏi khách ／ **[msg]** = câu chữ message, xử lý sau cùng Message List.

Câu hỏi dùng chung với Master gói (確認メモ_AW_PLAN Q3・Q4・Q6・Q7) chỉ cần hong trả lời 1 lần, áp dụng cho mọi màn hình.

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code tạm: `AW_SURV_xxx` (AW = Web quản trị viên vận hành; quy ước chờ Q7 chung). Sheet: **4 sheet** = Danh sách／Đăng ký・chỉnh sửa／Chi tiết (tổng hợp câu trả lời)／Nhập CSV. Đăng ký và chỉnh sửa cùng 1 form (`SurveyEdit` mode new/edit) → gộp 1 sheet, ghi khác biệt theo trạng thái. Modal (chọn riêng lẻ・mẫu) là trạng thái trong sheet cha.

Login để chụp: `LOGIN = {"site": "ops", "loginId": "Ad00010"}` (Toàn quyền). Dữ liệu mẫu (seed, hôm nay = 2026-10-05): SV-1020 Đã xóa ／ SV-1021 Kết thúc ／ SV-1023 Dừng phát hành ／ SV-1024 Đang công khai (Tất cả) ／ SV-1025 Đang công khai (Chọn riêng lẻ・một phần chưa trả lời) ／ SV-1026 Dự kiến (Chọn riêng lẻ). Template ST-001〜003 (Tiêu chuẩn).

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| Danh sách khảo sát | AW_SURV_001 | 001 Hiển thị ban đầu | `/ops/surveys` |
| | | 002 Đổi điều kiện tìm kiếm nhưng chưa áp dụng | gõ Từ khóa, chưa nhấn Tìm kiếm |
| | | 003 0 kết quả | từ khóa không có + Tìm kiếm |
| | | 004 Hiển thị mục đã xóa | bỏ check "Không hiển thị mục đã xóa" + Tìm kiếm (SV-1020 hiện) |
| | | 005 Xác nhận xóa (modal) | thùng rác của SV-1026 |
| | | 006 Tạo từ mẫu (modal) | nút "Tạo từ mẫu", chọn ST-001 |
| Đăng ký・chỉnh sửa khảo sát | AW_SURV_002 | 007 Đăng ký mới - Thông tin cơ bản | `/ops/surveys/new` |
| | | 008 Đăng ký mới - Tab câu hỏi | tab Câu hỏi (1 câu hỏi trống, 2 lựa chọn) |
| | | 009 Hộp thoại chọn riêng lẻ | đối tượng phát hành＝Chọn riêng lẻ → Chọn |
| | | 010 Sau khi chọn riêng lẻ (bảng đối tượng) | sau khi Xác nhận lựa chọn |
| | | 011 Đang tạo từ mẫu | `/ops/surveys/new?tpl=ST-001` |
| | | 012 Lỗi nhập liệu (thông tin cơ bản) | Đăng ký khi để trống |
| | | 013 Lỗi nhập liệu (câu hỏi) | để trống nội dung câu hỏi／chỉ có 1 lựa chọn → Đăng ký |
| | | 014 Chỉnh sửa - Dự kiến | `/ops/surveys/SV-1026/edit` |
| | | 015 Chỉnh sửa - Đang công khai, thông tin cơ bản (khóa ngày giờ bắt đầu trả lời) | `/ops/surveys/SV-1024/edit` |
| | | 016 Chỉnh sửa - Đang công khai, câu hỏi (chỉ sửa câu chữ) | tab Câu hỏi (Notice màu vàng, không có thêm・xóa・sắp xếp) |
| | | 017 Hủy nội dung chỉnh sửa (modal) | sửa 1 ô rồi Hủy |
| Chi tiết khảo sát | AW_SURV_003 | 018 Dự kiến - Thông tin cơ bản | `/ops/surveys/SV-1026` |
| | | 019 Dự kiến - Tab câu hỏi (chỉ đọc) | tab Câu hỏi |
| | | 020 Đang công khai - Thông tin cơ bản (chọn riêng lẻ・cột trả lời) | `/ops/surveys/SV-1025` |
| | | 021 Đang công khai - Tab câu hỏi＝tổng hợp câu trả lời | `/ops/surveys/SV-1024` tab Câu hỏi (màn hình 28) |
| | | 022 Lọc tổng hợp (doanh nghiệp・cơ sở) | chọn Doanh nghiệp + Tìm kiếm → "Xuất CSV câu trả lời (n người)" đổi |
| | | 023 Tab lịch sử thay đổi | tab Lịch sử thay đổi |
| | | 024 Xác nhận dừng phát hành (modal) | nút Dừng phát hành |
| | | 025 Xác nhận xóa (modal) | nút Xóa |
| | | 026 Lưu làm mẫu (modal) | nút "Lưu làm mẫu" |
| | | 027 Kết thúc | `/ops/surveys/SV-1021` (không có Chỉnh sửa・Xóa・Dừng phát hành) |
| | | 028 Dừng phát hành | `/ops/surveys/SV-1023` (xem Q4) |
| | | 029 Đã xóa | `/ops/surveys/SV-1020` |
| Nhập CSV khảo sát | AW_SURV_004 | 030 ① Nhập CSV - Ban đầu | `/ops/surveys/import` |
| | | 031 Modal nhập CSV (chọn tệp) | nút "Chọn CSV và nhập" (modal chung) |
| | | 032 Modal nhập CSV (xác nhận・có lỗi) | tệp có dòng lỗi → CSV danh sách lỗi, không thể Đăng ký |
| | | 033 ② Xác nhận・lưu (thông tin cơ bản＋danh sách câu hỏi) | sau khi Đăng ký trong modal |
| | | 034 Sau khi loại bỏ câu hỏi | thùng rác 1 dòng → "Câu hỏi đã loại bỏ: 1 mục, Khôi phục" |
| | | 035 Lỗi đăng ký | Đăng ký khi thông tin cơ bản để trống |

Số mục dự kiến: Danh sách ≈ 22 ／ Đăng ký・chỉnh sửa ≈ 45 (thông tin cơ bản 12 + chọn riêng lẻ 10 + câu hỏi 10 + nút) ／ Chi tiết ≈ 35 (tổng hợp 15) ／ Nhập CSV ≈ 15.

---

## 2. Điểm cần hong quyết định [Q]

### Q1. 6 quyết định "Quyết định 2026/10/03" ghi trong code nhưng **không có trong Sổ quyết định** → xác nhận và ghi vào Sổ quyết định?
Code (`lib/domain/survey.ts`, `areas/survey.ts`, `Templates.tsx`, `Results.tsx`, `lib/csv/survey.ts`) ghi là quyết định 2026/10/03, nhưng `docs/決定台帳.md` chỉ có 1 dòng về khảo sát ("Tất cả" trừ đang tạm ngừng sử dụng, 2026-10-05) và `00_Quyết_định/` không có file nào. Có thể nằm trong `00_確認してほしい/課題一覧` (cloud không thấy).
- (a) **Người trả lời＝chỉ người dùng ứng dụng (U＋8 chữ số)**. Không hiển thị cho tài khoản doanh nghiệp・cơ sở; doanh nghiệp・cơ sở chỉ là điều kiện lọc khi chọn riêng lẻ. ※ REQ-DL-718 ghi "phát hành trực tiếp cho doanh nghiệp・doanh nghiệp cụ thể・toàn bộ người dùng"; Sổ quyết định B Giao hàng chỉ ghi "Phát hành khảo sát (REQ-DL-718) là chức năng chung".
- (b) **Sau khi bắt đầu trả lời**: chỉ sửa câu chữ (nội dung câu hỏi・chữ của lựa chọn); không thêm・xóa・sắp xếp・loại câu hỏi・bắt buộc・số lượng lựa chọn; không đổi ngày giờ bắt đầu trả lời; đối tượng đã trả lời không bị loại khỏi đối tượng phát hành.
- (c) **Mẫu**: "Tạo từ mẫu" (sao chép nội dung hướng dẫn・câu hỏi) và "Lưu làm mẫu"; 3 mẫu tiêu chuẩn (Khảo sát mức độ hài lòng・Đánh giá menu・Khả năng sử dụng ứng dụng) không xóa được.
- (d) **Xuất CSV câu trả lời**: 1 dòng＝1 người trả lời; cột ID câu trả lời・ID người dùng・Người dùng・ID doanh nghiệp・Tên doanh nghiệp・ID cơ sở・Tên cơ sở・Ngày giờ trả lời＋mỗi câu hỏi 1 cột (nhiều lựa chọn nối bằng ";"); theo bộ lọc doanh nghiệp・cơ sở.
- (e) **Nhập CSV câu hỏi** dùng modal nhập CSV chung + lịch sử nhập; 1 dòng lỗi → không đăng ký; sau đó nhập thông tin cơ bản rồi Đăng ký (2 bước, khớp CSV入出力_定義 dòng 138).
- (f) **Nhắc nhở** N ngày trước khi kết thúc (1〜30), thứ Bảy・Chủ nhật・ngày lễ → ngày làm việc trước đó (giống thông báo chung cho khách hàng).
- Đề xuất: **xác nhận cả 6 → ghi 6 dòng vào mục E của Sổ quyết định trong cùng PR** (căn cứ: hong trả lời 2026-10-03・ghi chú trong code). Nếu điểm nào không đúng, thiết kế viết theo hong, code là bài tập về nhà.
- **hong trả lời 2026-10-05: xác nhận cả 6** → đã ghi 6 dòng vào mục E của Sổ quyết định. Điểm (a) hong nói thêm "Có thể filter theo cty. User nào đang thuộc cty đó có thể trả lời" → hỏi tiếp Q1b.

### Q1b. Khi chọn riêng lẻ theo doanh nghiệp・cơ sở: lưu **danh sách người** (như code) hay lưu **doanh nghiệp・cơ sở** (động)?
- Code: hộp thoại lọc theo doanh nghiệp・cơ sở rồi tick từng người → lưu **ID người** (`picks: [{type:'user', id}]`). Người vào công ty sau khi tạo khảo sát **không** thuộc đối tượng phát hành; người chuyển công ty vẫn còn.
- hong (trả lời Q1): "User nào đang thuộc cty đó có thể trả lời" → nghe như **lưu doanh nghiệp (・cơ sở)**, ai đang thuộc tại thời điểm trả lời thì được.
- A. Lưu doanh nghiệp・cơ sở (động): chọn doanh nghiệp／cơ sở trong hộp thoại, số đối tượng tính lại mỗi lần (giống "Tất cả"). Người mới vào công ty được trả lời. Code đổi data model (`picks` thêm type corp/branch) + hộp thoại.
- B. Giữ code (lưu từng người): chính xác tới từng người, nhưng không tự thêm người mới.
- C. Cả hai: hộp thoại cho chọn doanh nghiệp／cơ sở (động) **và** tick thêm/bớt từng người.
- Đề xuất: **A** (khớp câu trả lời của hong và cách "Tất cả" đang chạy; đơn giản hơn C).
- **hong trả lời 2026-10-05: A**. → Thiết kế: đối tượng phát hành = Tất cả／Chọn riêng lẻ (chọn doanh nghiệp・cơ sở). Hộp thoại chọn riêng lẻ đổi thành chọn doanh nghiệp／cơ sở (checkbox theo cơ sở, gom theo doanh nghiệp), số đối tượng động. Bảng đối tượng trong thông tin cơ bản hiện người hiện đang thuộc các cơ sở đã chọn (+ cột Trả lời ở Chi tiết). Code là **bài tập về nhà** (H6).

### Q2. Số ký tự tối đa (code ≠ chuẩn nhập liệu `input_standard.md`)
| Mục | Code | Chuẩn | Đề xuất |
|---|---|---|---|
| Tên khảo sát | 100 (`maxLength`, validateSurvey) | Ký tự 1 dòng **60** | **60** (theo chuẩn) |
| Tên mẫu | 100 | 60 | **60** |
| Nội dung hướng dẫn (mô tả) | 500 (`INTRO_MAX`) | Ghi chú 500 | 500 ✓ |
| Nội dung câu hỏi | 200 | không có loại | **200 giữ** (câu hỏi dài hơn tên; ghi lý do) |
| Lựa chọn (1 mục) | 100 | 1 dòng 60 | **60** |
| Câu trả lời tự do (phía ứng dụng) | 1000 (`answerProblems`) | Ghi chú 500 | **1000 giữ** (là câu trả lời của người dùng, không phải ghi chú; ghi lý do) hoặc 500 nếu hong muốn đồng nhất |
| Số ngày nhắc nhở | 1〜30 | Số lần 99 | 1〜30 ✓ (ghi là giới hạn nghiệp vụ) |
Code chưa có maxLength ở lựa chọn phía server (chỉ client) → bài tập về nhà nhỏ.
- **hong trả lời 2026-10-05: A** → ghi Sổ quyết định E "Giới hạn ký tự của khảo sát". Code: tên・tên mẫu・lựa chọn 100 → 60 là bài tập về nhà (H2).

### Q3. Tên gọi chưa thống nhất trong cùng chức năng (chọn 1 để dùng cho thiết kế・code・CSV)
- Danh sách cột "Thời gian bắt đầu" "Thời gian kết thúc" ↔ form "Ngày giờ bắt đầu trả lời" "Ngày giờ kết thúc trả lời". Đề xuất: **Ngày giờ bắt đầu trả lời／Ngày giờ kết thúc trả lời** ở cả danh sách・CSV.
- Form câu hỏi "Danh mục" ↔ tổng hợp・nhập CSV・danh sách "Loại câu hỏi" (ảnh Phase 1 màn hình 25 dùng Danh mục). Đề xuất: **Loại câu hỏi** mọi nơi (Danh mục dễ nhầm với danh mục sản phẩm).
- Danh sách "Tiến độ trả lời" = `n/m trả lời (x%)` ↔ Chi tiết `Trả lời n／m người (x%)`. Đề xuất giữ danh sách ngắn, chi tiết đầy đủ (không hỏi, chỉ ghi).
- **hong trả lời 2026-10-05: A** → Sổ quyết định E "Tên mục của khảo sát". Code đổi nhãn là bài tập về nhà (H3).

### Q4. Khảo sát ở trạng thái Dừng phát hành: có cho Chỉnh sửa・Xóa không?
- Code: Dừng phát hành → vẫn **Chỉnh sửa・Xóa được** (`canEdit` chỉ loại Kết thúc・Đã xóa); Dừng phát hành không hoàn lại ("Không thể khôi phục").
- A. Giữ như code (sửa được tên・nội dung hướng dẫn… nhưng không phát lại). B. **Dừng phát hành coi như Kết thúc: chỉ Xóa được, không Chỉnh sửa** (đơn giản, tránh hiểu nhầm là phát lại được). C. Như Kết thúc (không Chỉnh sửa・không Xóa).
- Đề xuất: **B**.
- **hong trả lời 2026-10-05: B** → Sổ quyết định E "Cách xử lý khảo sát đã dừng phát hành". Code: ẩn Chỉnh sửa (danh sách: bút chì・chi tiết: nút) và `survey.save` trả 409 khi Dừng phát hành là bài tập về nhà (H7).

### Q5. Đường gửi thông báo bắt đầu trả lời・nhắc nhở cho người dùng ứng dụng
- Code: `notify(... channels: ['site'])` → chỉ **thông báo trong ứng dụng (push)**; `lib/domain/mails.ts` lại liệt kê "Nhắc nhở khảo sát" là mail template `survey_remind`, `seed/notice.ts` có subject/body mail cho `survey_open`/`survey_remind` (sites: []).
- A. **Chỉ push trong ứng dụng** (người dùng ứng dụng có email nhưng không gửi mail). B. Push + mail.
- Đề xuất: **A** (khớp code; mail chỉ là template dự phòng) → sửa ghi chú trong `mails.ts`.
- **hong trả lời 2026-10-05: A** → Sổ quyết định E "Đường gửi và thời điểm của thông báo khảo sát". Sửa ghi chú `mails.ts` là bài tập về nhà nhỏ (H8).
- Thời điểm gửi: theo Sổ quyết định E "Batch bản chính thức" = 9:00 → thông báo gửi vào **9:00 đầu tiên sau ngày giờ bắt đầu trả lời** (ví dụ bắt đầu 14:00 → 9:00 hôm sau). Viết vào thiết kế, không hỏi.

### Q6 (= AW_PLAN Q3, chung). Quyền Quản lý khảo sát
- `運営Web_権限表` dòng "Thu thập・phân tích khảo sát": **R cho cả 7 vai trò** → không ai Tạo・Chỉnh sửa・Xóa・Nhập CSV・Dừng phát hành.
- Code `seed/account.ts` `surveys: ALL_R` = **Toàn quyền CRUD**, 6 vai trò còn lại R. Màn hình ẩn nút theo grants (§10-6 "không hiển thị").
- Đề xuất: theo **code** (Toàn quyền CRUD), sửa Bảng quyền. Nếu muốn CS cũng tạo được khảo sát thì nói rõ.
- **hong trả lời 2026-10-05: A** → sửa Bảng quyền (Quản lý gói・Quản lý khảo sát Toàn quyền CRUD), Sổ quyết định E. Code đã đúng (ALL_R). Các dòng Quản lý doanh thu・Quản lý ưu đãi・Quản lý chiến dịch giới thiệu cũng R×7 trong bảng nhưng code ALL_R → chưa hỏi, ghi Sổ quyết định là chưa xác nhận.

### Q7 (= AW_PLAN Q4, chung). Thứ tự mặc định của Danh sách
- Code: `list` sort **ID khảo sát giảm dần** (mới nhất trên). Có UI sắp xếp (chọn cột + tăng dần/giảm dần) ✓ STEP7 L2.
- Đề xuất: ghi **ID khảo sát giảm dần** (= mới nhất trước) vào thiết kế.
- **hong trả lời 2026-10-05: B = Ngày giờ kết thúc trả lời giảm dần** → Sổ quyết định E. Code `list` sort theo id là bài tập về nhà (H9).

### Q8 (= AW_PLAN Q6, chung). Xác nhận khi rời màn hình đang nhập (Q02)
- Code có modal "Hủy nội dung chỉnh sửa" (đăng ký・chỉnh sửa・nhập CSV ②). `input_standard.md`: chưa quyết. Đề xuất: **có**, toàn hệ thống.
- **hong trả lời 2026-10-05: A** → Sổ quyết định E, `input_standard.md`, `_Chung_Mẫu_thao_tác.py` P-FORM đã sửa.

### Q9 (= AW_PLAN Q7, chung). Quy ước Screen Code
- Đề xuất `<Site 2 ký tự>_<Chức năng>_<3 chữ số>`: AW_SURV_001〜004.
- **hong trả lời 2026-10-05: A** → Sổ quyết định E.

### Q10. "Tất cả" là động: người dùng mới đủ điều kiện **sau** khi bắt đầu trả lời có vào đối tượng phát hành không?
- Code: Tất cả = tính lại mỗi lần (`eligible(r)`), nên user mới đăng ký / cơ sở mới đăng ký chính thức sau khi mở sẽ **được trả lời** và được tính vào số đối tượng, nhưng **không nhận thông báo bắt đầu trả lời** (gửi 1 lần lúc mở, `openedAt`); nhắc nhở thì có (gửi cho người chưa trả lời lúc đó).
- A. Giữ như code (động; ghi rõ trong thiết kế). B. Chốt danh sách đối tượng lúc bắt đầu trả lời (không đổi sau đó).
- Đề xuất: **A** (đơn giản, khớp "Tất cả"), ghi rõ: số đối tượng là số hiện tại.
- **Giải quyết bởi Q1b＝A** (đối tượng phát hành động cho cả Tất cả và Chọn riêng lẻ): không hỏi, ghi vào thiết kế.

---

## 3. Code khác quyết định đã chốt → thiết kế viết theo quyết định, code là bài tập về nhà [Bài tập về nhà]

| # | Nội dung | Quyết định | Code hiện tại |
|---|---|---|---|
| H1 | Quyền | Toàn quyền CRUD, 6 vai trò R (hong Q6＝A) | code đúng; Bảng quyền đã sửa 2026-10-05 |
| H2 | Số ký tự tối đa | Tên・tên mẫu・lựa chọn **60**, nội dung câu hỏi 200, nội dung hướng dẫn 500, trả lời tự do 1000 (hong Q2＝A) | Tên 100・tên mẫu 100・lựa chọn 100 (client `maxLength` + `validateSurvey`・`saveTemplate`) |
| H3 | Tên cột・tên mục | Danh sách・CSV "Ngày giờ bắt đầu trả lời" "Ngày giờ kết thúc trả lời", câu hỏi "Loại câu hỏi" (hong Q3＝A) | Danh sách "Thời gian bắt đầu" "Thời gian kết thúc" (`page.tsx` cols), form "Danh mục" (`SurveyEdit.tsx` Field label, validate message "Hãy chọn Danh mục (loại câu hỏi)") |
| H4 | Message 0 kết quả | Định nghĩa chung §10-2 "Không có dữ liệu phù hợp." (I01) | Danh sách chung: "Không có dữ liệu khớp điều kiện. Hãy đổi điều kiện tìm kiếm hoặc nhấn "Xóa điều kiện"."; PickDialog: "Không có dữ liệu phù hợp." → [msg] |
| H5 | maxLength của lựa chọn | chỉ client (`maxLength={100}`), server không check | thêm check server khi chốt Q2 |
| H7 | Chỉnh sửa khi Dừng phát hành | **Không chỉnh sửa・được xóa** (hong Q4＝B) | `canEdit` chỉ loại Kết thúc・Đã xóa; `saveCore` không chặn Dừng phát hành |
| H8 | Ghi chú mail | Thông báo・nhắc nhở chỉ push trong ứng dụng (hong Q5＝A) | `lib/domain/mails.ts` dòng "Nhắc nhở khảo sát" liệt kê như mail; `seed/notice.ts` template `survey_open`/`survey_remind` (sites: []) để làm tiêu đề push, không gửi mail |
| H9 | Thứ tự ban đầu của danh sách | Ngày giờ kết thúc trả lời giảm dần (hong Q7＝B) | `areas/survey.ts` `list` sort theo id giảm dần |
| H6 | Đối tượng phát hành của chọn riêng lẻ | **Chọn doanh nghiệp・cơ sở rồi lưu** (động. hong Q1b＝A 2026-10-05) | Chọn từng người dùng và lưu ID (`picks: user`). Cần sửa `PickDialog`・`SurveyTarget`・`targetsOf`・`checkPicks`・`audience` |

## 4. Giá trị chưa chốt với khách [open]
- Không có (khảo sát là chức năng nội bộ của Vận hành; khách không cần quyết).

## 5. Message [msg] — xử lý sau cùng Message List (Message List 2026-10-01 **không có** dòng nào về khảo sát)
- Bắt buộc: code "Hãy nhập tên khảo sát" "Hãy nhập nội dung câu hỏi" "Hãy chọn Danh mục (loại câu hỏi)" ↔ ML "{Tên mục đối tượng} là mục bắt buộc." (inline) / chung E01・E02.
- Số ký tự: "Tên khảo sát tối đa 100 ký tự" "Nội dung hướng dẫn tối đa 500 ký tự" ↔ E04 "Hãy nhập {tên mục} trong vòng {n} ký tự.".
- Ngày giờ: "Hãy nhập ngày giờ bắt đầu trả lời theo dạng yyyy-mm-dd HH:mm" "Ngày giờ kết thúc trả lời phải sau ngày giờ bắt đầu trả lời" (≈ E08 nhưng là ngày giờ) → cần ID mới hoặc mở rộng E08.
- Phạm vi: "Hãy nhập thông báo nhắc nhở trong khoảng 1〜30 ngày trước" ↔ E12.
- Câu hỏi: "Hãy nhập từ 2 lựa chọn trở lên" "Có lựa chọn trống (nếu không cần hãy xóa)" "Có 2 lựa chọn giống nhau" "Hãy thêm ít nhất 1 câu hỏi" "Hãy chọn đối tượng chọn riêng lẻ" → ID mới.
- 409 từ server (toast): "Không thể chỉnh sửa khảo sát đã kết thúc" "Sau khi bắt đầu trả lời không thể đổi ngày giờ bắt đầu trả lời" "Sau khi bắt đầu trả lời không thể thêm・xóa câu hỏi (chỉ có thể sửa câu chữ)"…"Không thể loại đối tượng đã trả lời (n người) khỏi đối tượng phát hành" "Ngày giờ kết thúc trả lời phải sau thời điểm hiện tại (muốn kết thúc hãy dùng "Dừng phát hành")" "Không thể xóa khảo sát đã kết thúc" "Không thể xóa mẫu có sẵn" "Đã có mẫu cùng tên "…"" → ID mới (toast ≤ 40 chữ: nhiều câu dài hơn → rút gọn).
- Xác nhận: Xóa (danh sách có tên khảo sát, chi tiết không có; cả 2 khác Q01 chung) / Dừng phát hành / Hủy nội dung chỉnh sửa (Q02).
- Toast thành công: "Đã đăng ký khảo sát SV-xxxx (Dự kiến)" "Đã lưu…" "Đã xóa (vẫn còn dưới dạng "Đã xóa"…)" "Đã dừng phát hành" "Đã lưu mẫu "…" (n câu hỏi)" "Đã xóa mẫu" "Đã đăng ký khảo sát SV-xxxx (n câu hỏi)" (CSV) ↔ S01・S02.
- Không có quyền: toast NO_PERM "Bạn không có quyền" ↔ E32.

## 6. Những điểm đã khớp (không hỏi)
- Danh sách: 10／20／50 mục (mặc định 10), "Tìm kiếm"/Enter mới áp dụng + chưa áp dụng, "Không hiển thị mục đã xóa" mặc định, UI sắp xếp, badge Đã xóa (STEP7 L1〜L4・L-1〜L-4).
- "Tất cả" = cơ sở Đăng ký chính thức・Dự kiến đóng × hợp đồng Có hiệu lực・Đang thủ tục hủy × người dùng ứng dụng Có hiệu lực → **Tạm ngừng sử dụng・Dừng・Đăng ký tạm・Đóng・Kết thúc bị loại** ✓ Sổ quyết định E (2026-10-05 #18).
- Xóa logic (vẫn còn dưới dạng Đã xóa・giữ cả câu trả lời); Kết thúc không xóa được; danh sách ẩn bút chì・thùng rác ở Kết thúc・Đã xóa.
- Trạng thái tính từ ngày giờ: Dự kiến → Đang công khai → Kết thúc; Dừng phát hành・Đã xóa từ bản ghi. Badge: Đang công khai xanh lá, Dự kiến xanh dương, Dừng phát hành vàng, Kết thúc・Đã xóa xám (`lib/format/status.ts` 'ended' gồm Dừng phát hành・Đã xóa) ✓ Hiển thị chung.
- ID: Khảo sát SV-＋4 chữ số, Câu trả lời SR-＋4 chữ số-＋4 chữ số, Mẫu ST-＋3 chữ số, Câu hỏi Q＋số (hệ thống đánh số) ✓.
- Ngày giờ hiển thị yyyy-mm-dd HH:MM (`fmtDateTime`), nhập = thành phần ngày + giờ (mặc định bắt đầu 08:00・kết thúc 18:00) ✓ chuẩn.
- Batch: thông báo bắt đầu trả lời・nhắc nhở ở `surveyTick` phase morning 9:00 ✓ Sổ quyết định E; nhắc nhở thứ Bảy・Chủ nhật・ngày lễ → ngày làm việc trước đó ✓ customerNotice chung.
- Nút theo quyền: Đăng ký mới・Tạo từ mẫu (tạo), Chỉnh sửa (chỉnh sửa), Xóa・Dừng phát hành・Lưu/xóa mẫu (API grants), Nhập CSV・Xuất CSV (csvImport/csvExport) → ẩn khi không có ✓ §10-6 "không hiển thị".
- Web doanh nghiệp không có màn hình khảo sát (QC Quyết định_STEP5: không hiển thị nút khảo sát ở đơn hàng dùng thử). "Khảo sát" ở màn hình đặt hàng của Web doanh nghiệp (món nhân viên muốn ăn・quan tâm) là chức năng khác, không thuộc thiết kế này.

---

## 7. Kết quả (2026-10-05)
- Q1〜Q9 đã có câu trả lời của hong (ghi ở từng mục trên và Sổ quyết định E). Q10 giải quyết bởi Q1b.
- Dữ liệu `Dữ_liệu/AW_SURV_Khảo_sát.py`: 4 màn, 35 trạng thái, 136 mục. `make.py --check` OK; `--capture` tìm thấy đủ số ở cả 35 trạng thái.
- Xuất: `Đầu_ra/AW_SURV_Khảo_sát管理/` (xlsx JA/VI, HTML, img). HTML vào git.
- Bài tập về nhà cho code (ghi `demo_ok`, 28 chỗ): H1 không cần (code đúng), H2 số ký tự, H3 tên cột/nhãn, H4 câu chữ message, H5 server check lựa chọn, H6 chọn riêng lẻ theo doanh nghiệp・cơ sở, H7 Dừng phát hành không sửa, H8 ghi chú mail, H9 thứ tự danh sách.
- Message List: 30 câu chữ mới về khảo sát chưa có trong Message List → sheet "Đề xuất bổ sung vào Message List".

## 8. Đồng bộ với nhánh master (`claude/jolly-dijkstra-62jr5h`) và kế hoạch song song (2026-10-05, sau merge)
- Screen Code theo Quy ước mã màn hình_20261005: `AW_SURV_001〜004` (Feature 4 chữ). File dữ liệu đổi tên `AW_SURV_Khảo_sát.py`.
- Message của khảo sát cấp lại theo dải Lĩnh vực Vận hành F (Kế hoạch chạy song song §2): E200〜E219, Q150・Q151, S150〜S152, I150・I151 (ID cũ E14〜E45・Q03・Q04・S04〜S06・I03・I06 bỏ, vì master dùng các số đó cho ý khác). Q02 = Message List No.25 (Hủy／Bỏ), E31 = No.43, S02 "Đã hoàn tất xóa.", I01 "Không có dữ liệu để hiển thị.", xóa thất bại = E33.
- Nhập CSV (Sổ quyết định F, hong trên master): **không có nút Mẫu / Dữ liệu hiện tại** (toàn hệ thống) → câu hỏi A/B/C ở mục 7 đã được giải quyết = B. **Dòng lỗi bị bỏ, các dòng khác vẫn đăng ký** → 1.4・3.2 viết lại; bỏ trạng thái "① Chọn tệp (modal của code)", còn 34 trạng thái. Bố cục trong trang (hong chỉ đạo cho màn này) giữ nguyên, ghi là khác với P-CSV (modal) → code là bài tập về nhà.
- HTML・xlsx・img không vào git (hong, master). Artifact là bản để hong xem.
- Chi tiết 018/020: bảng doanh nghiệp・cơ sở không có cột Trả lời (hong 2026-10-05).
- hong 2026-10-05: bỏ trạng thái "② Kết quả nhập (có lỗi)", gộp kết quả nhập vào "② Xác nhận・lưu" (1 trạng thái: kết quả + thông tin cơ bản + danh sách câu hỏi). Còn **33 trạng thái**. Ảnh chụp dùng CSV 1 dòng lỗi + 2 dòng hợp lệ.
- hong 2026-10-05: định nghĩa tệp CSV mẫu (cột, kiểu, bắt buộc, độ dài, validation, message) → trạng thái 034 "Định dạng tệp CSV (mẫu)" No.5〜5.5 trong thiết kế, và mục 6 của `docs/01_仕様/Định_nghĩa_nhập_xuất_CSV_20261003.md`. Tổng 34 trạng thái.
- hong 2026-10-05: CSV có cả thông tin cơ bản (B): 4 cột Tên khảo sát・Nội dung hướng dẫn・Ngày giờ bắt đầu trả lời・Ngày giờ kết thúc trả lời ở đầu, dòng đầu điền vào ②. Code parser chỉ 5 cột → bài tập về nhà. Ghi Sổ quyết định E (dòng nhập CSV) và CSV入出力_定義 §6.
- hong 2026-10-05: "Tạo từ mẫu" chỉ ở Danh sách (bỏ ở màn Đăng ký); Dừng phát hành thêm vào cột thao tác của Danh sách (3.13, cùng modal Q150). Code là bài tập về nhà: bỏ nút ở Đăng ký, thêm icon ở Danh sách.
- 2026-10-05: code đã gỡ nút "Tạo từ mẫu" ở màn đăng ký (`SurveyEdit.tsx`). "Tạo từ mẫu" của Danh sách → `/ops/surveys/new?tpl=` vẫn như trước.
- hong 2026-10-05 (A): Đăng ký・chỉnh sửa cũng có "Lưu làm mẫu" (No.1.4, trạng thái 035). Code đã sửa (`SurveyEdit.tsx` saveAsTemplate). Sổ quyết định E dòng Mẫu bổ sung nội dung sao chép và Tiêu chuẩn = builtin.
