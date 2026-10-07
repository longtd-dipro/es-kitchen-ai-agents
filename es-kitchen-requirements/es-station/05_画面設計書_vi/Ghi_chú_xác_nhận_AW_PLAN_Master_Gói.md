# Ghi chú xác nhận: Master Gói (Plan) (Web vận hành) — Ghi chú rà soát trước khi viết Thiết kế màn hình

Ngày: 2026-10-05 ／ Người rà: Claude (cloud) ／ Nguồn: code thật (`app/ops/masters/plans`, `app/ops/masters/_masters/*`, `lib/ops/masters/*`, `lib/domain/*`), `docs/決定台帳.md`, `docs/決定の受付簿.md`, `docs/01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md`, `Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md`, `40_Master_Phí_Thanh_toán/Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md` §0.12 và "Màn hình: Chỉnh sửa Master Gói (84 mục)", `Bảng_phân_quyền_Web_vận_hành_20261003.md`, `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` §10, `Quyết_định_STEP7_Quy_định_về_danh_sách_20261001.md`.

Quy ước trong memo: **[Q]** = cần hong trả lời ／ **[Bài tập về nhà]** = Sổ quyết định・quyết định đã chốt, code chưa theo → Thiết kế màn hình viết theo quyết định, ghi `demo_ok` (code sửa sau) ／ **[open]** = chưa ai quyết, hỏi khách ／ **[msg]** = câu chữ message, xử lý sau cùng Message List.

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

Screen Code tạm: `AW_PLAN_xxx` (AW = Web quản trị viên vận hành). Quy ước Screen Code đã chốt 2026-10-05 (Sổ quyết định E) → **[Q7] đã trả lời**.

| Screen | Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|---|
| Danh sách Master Gói | AW_PLAN_001 | 001 Hiển thị ban đầu | `/ops/masters/plans` |
| | | 002 Đổi điều kiện tìm kiếm nhưng chưa áp dụng | gõ vào ô tìm kiếm, chưa nhấn "Tìm kiếm" (hiện "Chưa áp dụng") |
| | | 003 0 kết quả | tìm từ khóa không có + "Tìm kiếm" |
| | | 004 Xác nhận xóa | thùng rác của plan chưa dùng (use=0) |
| | | 005 Không thể xóa | thùng rác của plan đang dùng (use>0) |
| | | 006 Hiển thị mục đã xóa | bỏ check "Không hiển thị mục đã xóa" + "Tìm kiếm" |
| | | 007 Nhập CSV (modal) | nút "Nhập CSV" (chỉ khi có quyền csvImport) |
| Chi tiết Master Gói | AW_PLAN_002 | 008 Hiển thị ban đầu (tab ES Standard) | `/ops/masters/plans/ES000004` |
| | | 009 Tab ES Lite (tủ lạnh) | click tab |
| | | 010 Tab ES Lite (máy bán hàng tự động) | click tab |
| | | 011 Tab Lịch sử thay đổi | click tab |
| | | 012 Thêm thế hệ giá (dòng nhập) | nút "＋ Thêm thế hệ giá" (※ phụ thuộc Q1) |
| | | 013 Chuyển hàng loạt thế hệ giá (modal) | nút "Chuyển hàng loạt thế hệ giá" → màn "Thay đổi hàng loạt" dùng chung, chỉ tham chiếu |
| Đăng ký・Chỉnh sửa Master Gói | AW_PLAN_003 | 014 Đăng ký mới - Hiển thị ban đầu | `/ops/masters/plans/new` |
| | | 015 Đăng ký mới - Tab ES Lite (tủ lạnh) | click tab |
| | | 016 Đăng ký mới - Tab ES Lite (máy bán hàng tự động) | click tab |
| | | 017 Đăng ký mới - Lỗi nhập liệu | nhấn "Đăng ký" khi để trống → hộp "Không thể lưu (n mục)" + viền đỏ |
| | | 018 Chỉnh sửa - Hiển thị ban đầu | `/ops/masters/plans/ES000004/edit` |
| | | 019 Chỉnh sửa - Lỗi nhập liệu (không khớp giới hạn trên) | sửa giới hạn trên sai rồi "Lưu" |
| | | 020 Hủy nội dung chỉnh sửa? (modal) | sửa 1 ô rồi "Hủy" |

Ghi chú: Đăng ký mới và Chỉnh sửa cùng 1 form (`MasterDetail` mode new/edit), khác nhau ở tiêu đề, nút (Đăng ký／Lưu), và Đăng ký mới hiện thêm bảng Gói giá cũ (xem Q1). Gộp thành 1 sheet "Đăng ký・Chỉnh sửa", ghi khác biệt theo trạng thái.

Số item dự kiến: Danh sách ≈ 25 ／ Chi tiết ≈ 95 ／ Đăng ký・Chỉnh sửa ≈ 95 (theo 84 mục trong Danh sách mục master + thế hệ giá + trang bị ban đầu).

---

## 2. Điểm cần hong quyết định [Q] — **đã trả lời hết 2026-10-05 (xem dòng Trả lời ở mỗi câu)**

### Q1. Cách giữ **giá** của plan: Thế hệ giá (code) hay Bảng gói giá (spec)? — ảnh hưởng lớn nhất
> **Trả lời (hong 2026-10-05): C.** Đã ghi Sổ quyết định F và Sổ tiếp nhận #52 (chờ triển khai). Thiết kế màn hình viết theo C: card Thế hệ giá với 2 cột giá (Chuyến COOL／Chuyến ES giao hàng) cho mỗi Course, Công khai = thế hệ đang áp dụng; màn Đăng ký mới nhập thế hệ đầu tiên thay cho bảng Gói giá cũ; cột giá ở Danh sách giữ nguyên.
- **Spec** (Danh sách mục master §Chỉnh sửa Master Gói, quyết định 28-178/180/181): mỗi Course có bảng Gói giá: Công khai（chỉ 1 dòng）／Gói giá（giá gốc・lần sửa đổi thứ nhất…）／Thời gian bắt đầu・Thời gian kết thúc（date）／**Giá (chuyến COOL)・Giá (chuyến ES giao hàng)**／Chi tiết (cơ bản 10%／doanh nghiệp chịu 8%)／Lite có thêm chênh lệch nâng cấp lên Standard.
- **Code** (`PriceGens.tsx`, `lib/domain/types.ts` Plan.priceGens, vấn đề 4b-9・7-1・7-2): bảng Gói giá cũ **ẩn** ở Chi tiết・Chỉnh sửa (chỉ còn ở Đăng ký mới). Thay bằng card "Thế hệ giá (dữ liệu dùng chung)": ID thế hệ／Bắt đầu áp dụng (tháng chu kỳ yyyy-mm)／Kết thúc áp dụng／**1 giá tháng (chưa thuế) cho mỗi Course, không tách chuyến COOL・chuyến ES giao hàng**／Ghi chú／Hợp đồng con đang dùng／Đăng ký／Thao tác (Sửa・Xóa・Đính chính lỗi). Không có Công khai, không có Chi tiết.
- Sổ quyết định E (2026-10-05) "Thế hệ giá: Lite cũng có giá riêng theo từng thế hệ (A)" ủng hộ mô hình thế hệ, nhưng không nói về chuyến COOL／chuyến ES giao hàng và Công khai.
- Trong Sổ quyết định và 00_Quyết_định không thấy quyết định nào bỏ việc tách giá theo phương thức giao hàng. Màn Danh sách vẫn có 5 cột giá tách chuyến COOL／chuyến ES giao hàng.
- Lựa chọn:
  - **A. Theo code (Thế hệ giá, 1 giá/Course/thế hệ, theo tháng chu kỳ)**: khớp dữ liệu dùng chung và luồng Thay đổi hàng loạt đã làm. Nhược: mất cờ Công khai và việc tách COOL/ES, cột Danh sách phải đổi; Danh sách mục master và 28-180 phải sửa.
  - **B. Theo spec (Bảng gói giá với COOL/ES, Công khai, date)**: khớp màn hình hiện hành P1 và 28-178〜181. Nhược: code phải làm lại, mô hình dữ liệu dùng chung đổi.
  - **C. Lai: Thế hệ giá nhưng mỗi thế hệ giữ giá chuyến COOL và chuyến ES giao hàng riêng cho mỗi Course, Công khai = thế hệ mới nhất**.
  - Đề xuất: **C** nếu thực tế giá khác nhau theo phương thức giao hàng (màn hình hiện hành có 2 giá nên khả năng cao là có); nếu hong xác nhận giá không phụ thuộc phương thức giao hàng thì **A**.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** chọn **C**. Thế hệ giá theo tháng chu kỳ; mỗi thế hệ × Course có 2 giá chuyến COOL và chuyến ES giao hàng. **Công khai là cờ do bên vận hành chọn trên thế hệ, không phải thế hệ mới nhất = công khai.** Thế hệ không công khai dùng làm giá riêng cho một công ty (chọn ở Hợp đồng con). Cách giới hạn thế hệ riêng cho công ty nào → ghi `chk` khi viết data, hỏi tiếp.

### Q2. Card "Trang bị ban đầu・Vật tư bao gồm trong gói" đặt ở Master Gói (code) hay Master Vật tư (spec)?
> **Trả lời (hong 2026-10-05): A.** Giữ ở Chi tiết Master Gói (code). Đã ghi Sổ quyết định F, Sổ tiếp nhận #53, sửa Danh sách mục master §0.12. Chỗ đặt Nhập CSV của bảng này chưa quyết (ghi "Cần xác nhận" trong Sổ tiếp nhận).
- Spec: Danh sách mục master §0.12 ghi bảng "Vật tư × Gói" ở **phía Master Vật tư**, "Master Gói không giữ" (hong trả lời M6 2026-10-03). Sổ tiếp nhận #20 (chờ triển khai): Master Vật tư của Web vận hành.
- Code: `PlanMaterials.tsx` đặt trong Chi tiết của Master Gói (Vật tư × Course Trang bị ban đầu + Số lượng bao gồm trong gói + Lịch sử thay đổi), lưu vào `dm.master.plans.initialItems／includedMaterials`.
- Đề xuất: giữ **spec (Master Vật tư)**, Chi tiết Master Gói chỉ hiện tham chiếu (read-only) hoặc không hiện; code là bài tập về nhà. Nếu hong muốn tiện thao tác theo plan thì chọn code và sửa Danh sách mục master.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** giữ spec: **Master Vật tư** giữ bảng Vật tư×Gói; Chi tiết Master Gói chỉ tham chiếu. Code `PlanMaterials.tsx` là bài tập về nhà.

### Q3. Quyền: ai được Tạo・Sửa・Xóa Master Gói?
> **Trả lời (hong 2026-10-05): A.** Quyền đầy đủ CRUD, 6 vai trò còn lại R. Đã sửa Bảng quyền, ghi Sổ quyết định F và Sổ tiếp nhận #54.
- Bảng quyền Web vận hành dòng "Quản lý Gói": **R cho cả 7 vai trò** (kể cả Quyền đầy đủ) → không ai sửa được qua UI.
- Code `lib/domain/seed/account.ts` OPS_TABLE `plans: ALL_R` = **Quyền đầy đủ CRUD**, 6 vai trò còn lại R.
- Đề xuất: theo **code** (Quyền đầy đủ CRUD), sửa Bảng quyền. Nếu đúng ý là chỉ Quản trị hệ thống sửa thì cần nói rõ (hiện sysadmin là site riêng, không có màn Master Gói).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** Quyền đầy đủ và Quản trị hệ thống **CRUD mọi chức năng**; 6 vai trò còn lại R. Bảng quyền đã sửa. Theo code hiện tại.
- **hong trả lời 2026-10-05 (qua memo khảo sát Q6＝A): Quyền đầy đủ CRUD, 6 vai trò R.** Bảng quyền đã sửa.

### Q4. Danh sách: Sắp xếp và thứ tự mặc định
> **Trả lời (hong 2026-10-05): 1 = C (Số lượng cung cấp tối đa hàng tháng tăng dần → ID Gói tăng dần), 2 = có Sắp xếp theo L2.** Sổ quyết định F, Sổ tiếp nhận #55 (chờ triển khai: thêm UI Sắp xếp vào MasterList).
- Quyết định STEP7 L2: mọi Danh sách có "Sắp xếp"; L-3: thứ tự ban đầu ghi trong Thiết kế màn hình (không ghi = Ngày giờ cập nhật giảm dần).
- Code: không có UI Sắp xếp; thứ tự hiện tại theo seed (ID Gói tăng dần).
- Đề xuất: mặc định **ID Gói tăng dần** (danh sách ngắn, ID tăng theo số bữa ăn, dễ dò); thêm Sắp xếp là bài tập về nhà của code.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** mặc định **ID Gói tăng dần** (quy tắc chung: Master = ID tăng dần, màn khác = Ngày giờ cập nhật giảm dần). UI Sắp xếp là bài tập về nhà của code.

### Q5. Có giữ trường "Số lượng cung cấp hàng tháng (đông lạnh) - Giới hạn dưới" không?
> **Trả lời (hong 2026-10-05): giữ.** Sổ quyết định F, Sổ tiếp nhận #56.
- Danh sách mục master: "Việc có hiển thị giới hạn dưới của đông lạnh trên master hay không đang được xác nhận nội bộ (REQ-PM-039). Màn hình hiện hành có". Code có.
- Đề xuất: **giữ** (code có, 28-178 ③ có check giới hạn dưới ≦ giới hạn trên).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** **giữ** Số lượng cung cấp hàng tháng (đông lạnh) - Giới hạn dưới.

### Q6. Xác nhận khi rời màn hình đang nhập (Q02)
> **Trả lời (hong 2026-10-05): có, toàn hệ thống.** Dùng Message List No.25. Sổ quyết định F, Sổ tiếp nhận #57 (các form khác cần rà).
- input_standard.md: "Chưa quyết: xác nhận khi rời đi trong lúc đang nhập (Q02)". Code có modal "Hủy nội dung chỉnh sửa?" khi Hủy／rời trang lúc dirty.
- Đề xuất: **có** (theo code) cho toàn hệ thống.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** **có**, Q02 toàn hệ thống. Thêm: lỗi khi lưu thống nhất inline (P-FORM), hộp "Không thể lưu (n mục)" của Master là bài tập về nhà của code.
- **hong trả lời 2026-10-05 (memo khảo sát Q8＝A): có, toàn hệ thống.**

### Q7. Quy ước Screen Code
> **Trả lời (hong 2026-10-05):** `<Module(2)>_<Feature(4)>_<Seq(3)>`, Module UA/DA/CW/AW/SW/OW. Đã viết `docs/01_仕様/Quy_ước_mã_màn_hình_20261005.md`, Sổ quyết định F, Sổ tiếp nhận #58. Master Gói dùng AW_PLAN_001〜003 như đề xuất.
- Docs không có quy ước. Thiết kế màn hình_Báo cáo sự cố (mobile) dùng M01/S02. Khuôn skill dùng `XX_XXX_001`.
- Đề xuất: `<Site 2 chữ>_<Chức năng>_<3 chữ số>`: AW=Web quản trị viên vận hành, CW=Web doanh nghiệp, DR=Tài xế, CA=Nơi giao ủy thác, SP=Nhà cung cấp. Ví dụ `AW_PLAN_001`.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** chốt `<Site 2 chữ>_<Viết tắt chức năng>_<3 chữ số>` với AW／CW／**TW** (nơi giao ủy thác)／**DW** (tài xế)／**SW** (nhà cung cấp). Code `AW_PLAN_001〜003` trong memo này giữ nguyên.
- **hong trả lời 2026-10-05 (memo khảo sát Q9＝A): dùng quy ước này.**

---

## 3. Code khác quyết định đã chốt → Thiết kế màn hình viết theo quyết định, code là bài tập về nhà [Bài tập về nhà]

| # | Nội dung | Quyết định | Code hiện tại |
|---|---|---|---|
| H1 | Cột "Phí ban đầu (chưa thuế)" trong Gói giá của ES Lite (máy bán hàng tự động) (màn Đăng ký mới) | **Bãi bỏ** (hong M2 2026-10-03, Sổ tiếp nhận #18, Sổ quyết định "Chi phí ban đầu của máy bán hàng tự động") | **đã bỏ** trong main 2026-10-05 (spec/plans.ts, planCsv.ts) → không còn là bài tập về nhà |
| H2 | 28-178 ①: Giới hạn trên đông lạnh＋giới hạn trên lạnh・nhiệt độ thường | **≧ Tổng** (Quyết định_STEP5 trả lời Q5 2026-10-01 sửa từ ＝) | code đúng (≧). Danh sách mục master còn ghi ＝ → sửa doc |
| H3 | 28-178 ⑥ Khoảng thời gian không chồng lấn; 28-182 ⑦⑧ (≧1 dòng mẫu chuẩn, dòng tủ lạnh bắt buộc trừ ES250・ES600 trở lên, Số lượng chứa tối đa ≧ số lượng giao mỗi lần là cảnh báo); 28-184 ⑨ (≧1 dòng máy bán hàng tự động, không đưa tủ lạnh・tủ đông vào) | có trong Kiểm tra khi lưu | code chỉ check: tên trống, tổng>0, giới hạn trên/dưới, số lần giao hàng≧1, giá≧phần doanh nghiệp chịu, 1 dòng Công khai |
| H4 | Số ký tự tối đa: tên 60, ghi chú 500 (input_standard, Danh sách mục master 2026-10-03) | có | input không có maxlength |
| H5 | Nhập tên gói công khai → nếu tên gói quản lý trống thì copy (REQ-PM-003) | có | không thấy trong code |
| H6 | Thuế suất chọn từ Master Thuế suất, Quản trị hệ thống thêm được (28-149, Sổ quyết định E #9) | có | 2 lựa chọn cố định |
| H7 | Danh sách cột Course = Course có thể chọn; Danh sách cột giá (xem Q1) | — | — |

## 4. Giá trị chưa chốt với khách [open] (ghi vào sheet OPEN, không đoán)

| # | Mục | Ghi chú |
|---|---|---|
| O1 | Giá trị Số lần giao hàng chuẩn (đông lạnh) | ~~Chưa nhận bảng tủ đông~~ → **hong 2026-10-05: tạm 1 lần/tháng cho mọi plan, bên vận hành sửa sau** (Sổ quyết định F, Sổ tiếp nhận #60). Đã bỏ khỏi OPEN |
| O2 | Giá trị Tỷ lệ "Sắp hết" | ~~Cần xác nhận (ví dụ: 25)~~ → **hong 2026-10-05: mặc định 25%, bên vận hành đổi theo plan** (Sổ quyết định F, Sổ tiếp nhận #60). Đã bỏ khỏi OPEN |
| O3 | Làm tròn phần doanh nghiệp chịu | ~~Phụ lục §6 ①: làm tròn xuống【tạm thời】~~ → **hong 2026-10-05: làm tròn 四捨五入 (làm tròn thường)** (Sổ quyết định F, Sổ tiếp nhận #59 chờ triển khai). Đã bỏ khỏi OPEN |

## 5. Message [msg] — xử lý sau khi có Message List
- 0 kết quả: code "Không có dữ liệu khớp điều kiện. Hãy thay đổi điều kiện hoặc nhấn "Xóa điều kiện"." ／ Định nghĩa chung "Không có dữ liệu tương ứng." (I01)
- Xác nhận xóa: code "Bạn có muốn xóa không？／Sẽ chuyển sang trạng thái đã xóa (mặc định bị ẩn khỏi danh sách. Không thể hoàn tác)." ／ Q01
- Không thể xóa: "Không thể xóa vì có {n} hợp đồng đang sử dụng. Nếu muốn ẩn, hãy đổi trạng thái công khai." → cần ID mới
- Lỗi lưu: hộp "Không thể lưu ({n} mục)" + danh sách + viền đỏ (RV-OPS-20261002 O-i) — khác P-FORM (inline dưới ô) → ghi là pattern riêng của Master
- Rời đi: "Hủy nội dung chỉnh sửa？／Nội dung đang chỉnh sửa sẽ không được lưu. …" ／ Q02
- Thành công: "Đã đăng ký" "Đã lưu" "Đã xóa" ／ S01, S02
- Thế hệ giá: nhiều toast riêng (phụ thuộc Q1)

## 6. Những điểm đã khớp (không hỏi)
- Danh sách 10／20／50 kết quả, "Không hiển thị mục đã xóa" mặc định, Tìm kiếm chỉ áp dụng khi nhấn Tìm kiếm/Enter + Chưa áp dụng (STEP7, 2026-10-03)
- Xóa logic, đang sử dụng thì không xóa được (RV-OPS-20261002 O-b), ID ES＋6 chữ số (28-177)
- Course chọn nhiều 3 giá trị, tab theo Course (28-184/185), doanh nghiệp chịu 100 yên/8%/10% (28-147〜149), số tiền miễn trách theo đơn vị Gói (§6 ⑤)
- ES30 không công khai (Sổ quyết định E #16): seed ES000002 public=false

---

## 7. Kết quả (2026-10-05, sau khi hong trả lời Q1〜Q7)

- Dữ liệu: `Dữ_liệu/AW_PLAN_Master_Gói.py` (3 màn hình, 20 trạng thái, 269 mục), `Dữ_liệu/_Chung_Thông_báo.py` (gán số Message List; ja_o theo Message List), `Dữ_liệu/_Chung_Mẫu_thao_tác.py` (+ P-FORMBOX, P-CSV).
- `make.py --check`: 0 lỗi, 0 chưa xác nhận. `--capture` trên app thật: 269/269 vị trí tìm thấy. Build `--book Web_quản_trị_vận_hành_Master` không cần `--draft`.
- Kết quả: `Đầu_ra/Web_quản_trị_vận_hành_Master/Thiết_kế_màn_hình_AW_PLAN_Master_Gói.html` (viewer song ngữ), `Web_quản_trị_vận_hành_Master_JA.xlsx`・`_VI.xlsx`. **Không commit đầu ra** (hong 2026-10-05: giữ quy tắc `docs/**/*.html`), tạo lại bằng make.py khi cần.
- OPEN (3): Làm tròn phần doanh nghiệp chịu (làm tròn xuống【tạm thời】 vs Sổ quyết định E làm tròn thường), Giá trị Số lần giao hàng chuẩn (đông lạnh) (chưa nhận bảng tủ đông), Giá trị Tỷ lệ "Sắp hết".
- Message: 43 ID dùng, 22 chưa có trong Message List (sheet "Đề xuất bổ sung vào Message List"), 3 khác câu chữ với Message List: E31 (No.43), E37 (No.42), E40 (No.69). Xử lý sau khi hong xem ([msg]).
- Bài tập về nhà cho code đã ghi `demo_ok` trong dữ liệu: Sắp xếp (#55), Thế hệ giá × phương thức giao hàng và màn Đăng ký mới (#52), maxlength (H4), copy Công khai→Quản lý (H5), Master Thuế suất (H6), check 28-178⑥/28-182⑦⑧/28-184⑨ (H3), tab của course không chọn vẫn bật (A15), câu chữ 0 kết quả・xác nhận xóa theo Message List.
- Chưa làm: `--release 1.0` (chờ hong xem HTML và chốt Message); Dòng máy・Tùy chọn・Giảm giá cùng book Web_quản_trị_vận_hành_Master.

## 8. Góp ý của hong trên HTML (2026-10-05) → đã sửa cả code lẫn Thiết kế màn hình
- Thứ tự card ở Chi tiết: Thiết lập Gói → Chi tiết phí → Tab → Thế hệ giá → Trang bị ban đầu (`MasterDetail.tsx`; Sổ quyết định F, Sổ tiếp nhận #61). Đánh số lại: 3 Thiết lập Gói, 4 Phí, 5 Tab, 6・7 ES Standard, 8 Thế hệ giá, 9 Trang bị ban đầu.
- Lỗi khi lưu: hiện câu lỗi ngay dưới mục (viền đỏ + "…là mục bắt buộc."); giữ hộp tổng hợp ở trên (`logic.ts` Check.msgs, `parts.tsx`, `masters.css`; P-FORMBOX; Sổ quyết định F, Sổ tiếp nhận #62).
- HTML đăng lại (Version 2): https://claude.ai/artifact/TbJSZ7BenkxsFe8C4noMZr

## 9. Góp ý thứ 3 của hong (2026-10-05, ảnh màn hình hiện hành)
- Màn hiện hành: trong tab của mỗi course, dưới phần thiết lập có **bảng Gói giá** (Công khai radio, tên thế hệ, thời gian bắt đầu/kết thúc theo ngày, giá chuyến COOL/chuyến ES giao hàng). Bản Thiết kế màn hình v2 đã gộp vào card Thế hệ giá ở cuối → thiếu. Phương án C (Q1) **bị thay**: giữ bảng Gói giá trong tab, 1 dòng = 1 thế hệ, thêm cột Hợp đồng con đang dùng và thao tác (Sửa/Xóa/Đính chính lỗi). Không còn card Thế hệ giá riêng. Sổ quyết định F sửa dòng Q1, Sổ tiếp nhận #63 (chờ triển khai: gộp chức năng của PriceGens vào bảng).
- Code: bỏ ẩn bảng Gói giá ở Chi tiết・Chỉnh sửa (`MasterDetail.tsx`), dữ liệu dòng = priceGens (fromDomain). Card Thế hệ giá vẫn còn ở cuối trang cho đến khi gộp xong (không đánh số trong Thiết kế màn hình).
- Đánh số lại Chi tiết: 6 Thiết lập → 7 Gói giá → 8 Thiết bị cho thuê chuẩn (ES Standard); 10/11/12 (ES Lite); 13/14/15 (máy bán hàng tự động); 16 Lịch sử thay đổi; 9 Trang bị ban đầu; trạng thái 012 = Chuyển hàng loạt. Màn Đăng ký・Chỉnh sửa: trạng thái 013〜019.
- "Trang bị ban đầu cũng đặt dưới tab": Thiết bị cho thuê chuẩn đã nằm trong tab (8/12/15). Nếu hong muốn nói card Trang bị ban đầu・Vật tư bao gồm trong gói (9) cũng vào trong tab theo course thì cần xác nhận (đang hỏi).
- Góp ý thứ 4 (2026-10-05): "Chuyển hàng loạt thế hệ giá" → **B**: bỏ khỏi Master Gói (nút 1.4 và trạng thái 012), làm từ Thay đổi hàng loạt ở Danh sách Hợp đồng con. Sổ quyết định F, Sổ tiếp nhận #64. Code đã bỏ nút ở MasterDetail và PriceGens.
- "Trang bị ban đầu cũng đặt dưới tab" = **2** (hong 2026-10-05): card Trang bị ban đầu・Vật tư bao gồm trong gói vào trong từng tab Course, sau Thiết bị cho thuê chuẩn (9 / 13 / 17). Số lượng miễn phí hàng tháng dùng chung cho plan hiện ở mọi tab. Code: PlanMaterials nhận `course`, MasterDetail vẽ trong pane. Sổ quyết định F, Sổ tiếp nhận #65.
- Message (hong 2026-10-05): E31 theo Message List No.43 (cảnh báo, cho ghi đè); E37 và E40 giữ câu mới, hong sửa No.42 và No.69 trong Excel rồi xuất lại CSV. Sổ quyết định F, Sổ tiếp nhận #66. 22 message mới: chờ hong xác nhận thêm vào Message List (sheet Đề xuất bổ sung).
- 22 message mới: hong OK (2026-10-05) → Sổ tiếp nhận #67. hong dán sheet Đề xuất bổ sung vào Excel, đánh số, xuất lại CSV; m điền `ml` sau.
- **Release 1.0** (2026-10-05): `make.py --release 1.0 --book Web_quản_trị_vận_hành_Master`. snapshot: `Đầu_ra/Web_quản_trị_vận_hành_Master/_release/snapshot.json` (commit).
