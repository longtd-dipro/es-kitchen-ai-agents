# Định nghĩa CSV xuất / nhập (bản nháp để duyệt – 2026/10/03)

Áp dụng cho mọi site. Quyết định gốc: **28-183** (Nhập CSV không có cột NEW/UPDATE/DELETE; khóa trùng thì ghi đè, không có thì tạo mới; hành vi mỗi loại dòng ghi trong tiêu đề template bằng 【 】).
Tiền trên màn hình: "1,000円" (chốt 10/03). **Trong CSV, tiền là số thuần** (`1000`), không có "円" hay dấu phẩy, để tính được trong Excel.

---

## 1. Xuất CSV

### 1-1. Quy tắc chung
| Mục | Quy tắc |
|---|---|
| Mã ký tự | UTF-8 **có BOM** (mở bằng Excel không lỗi tiếng Nhật) |
| Xuống dòng | CRLF |
| Dấu phân cách | Dấu phẩy `,`. Giá trị có `,` `"` hoặc xuống dòng thì bọc `"…"`, `"` bên trong viết thành `""` |
| Dòng 1 | Tên cột tiếng Nhật (giống tên trên màn hình / template nhập) |
| Phạm vi dòng | **Toàn bộ dòng khớp điều kiện đang lọc** (không chỉ trang đang xem). Không lọc gì = tất cả. Bản ghi đã xóa chỉ có khi đang bật "Hiển thị đã xóa" |
| Phạm vi cột | **Đầy đủ nội dung trong hệ thống**, không chỉ các cột đang hiện: mọi field của bản ghi, kể cả mã (ID) và tên tương ứng (ví dụ `拠点ID`, `拠点名`), trạng thái, ngày tạo / cập nhật / người cập nhật. Bảng con (ví dụ nhà cung cấp nhiều dòng của 1 sản phẩm) → 1 trong 2 cách: (a) nhiều dòng, lặp lại khóa cha; (b) file thứ 2 (zip). Mặc định (a) |
| Ngày | `yyyy-mm-dd`, ngày giờ `yyyy-mm-dd HH:mm`, năm tháng `yyyy-mm` (giống màn hình, quyết định 8-1) |
| Số | Số thuần, không dấu phẩy. Tiền: số nguyên (円). Tỷ lệ: số thập phân (`0.12`) hoặc ghi rõ `%` trong tên cột |
| Boolean | `1` / `0` (tên cột ghi rõ, ví dụ `公開可能(1=可)`) |
| Nhiều giá trị | Nối bằng `;` (ví dụ `商品タグ`: `NEW;定番`) |
| Quyền | Chỉ xuất data mà tài khoản đó được xem (Doanh nghiệp chỉ thấy data của mình) |
| Lịch sử | Mỗi lần xuất ghi log: ai, lúc nào, màn nào, điều kiện, số dòng |

### 1-2. Tên file
```
<画面名>_<条件>_<出力日時>.csv
```
- `画面名`: tên màn hình tiếng Nhật ngắn, ví dụ `商品マスタ`, `配送一覧`, `請求書`.
- `条件`: các điều kiện đang lọc, nối bằng `_`, dạng `項目-値`. Ví dụ `カテゴリ-肉類_倉庫-関東`. Khoảng thời gian: `期間-2026-10-01〜2026-10-31`. Không lọc gì → `全件`. Quá dài (> 80 ký tự) → cắt, thêm `ほか` (đầy đủ điều kiện vẫn có trong log xuất).
- `出力日時`: `yyyymmdd-HHmm`.
- Ký tự không dùng được trong tên file (`/ \ : * ? " < > |`) → đổi thành `-`.
- Ví dụ: `商品マスタ_カテゴリ-肉類_倉庫-関東_20261003-0915.csv`, `請求書_請求月-2026-10_全件_20261003-0915.csv`.

### 1-3. Component dùng chung: `CsvExportButton`
- Props: `screen` (tên màn), `filters` (điều kiện đang lọc: label + value), `fetchRows()` (gọi API lấy **toàn bộ** dòng khớp lọc, server trả đủ field), `columns` (định nghĩa cột CSV: key, tiêu đề, format).
- Một nút "Xuất CSV" cùng style mọi site (đặt ở góc phải trên list, cạnh "Nhập CSV" và "Đăng ký mới").
- Định nghĩa cột CSV để trong `lib/csv/<entity>.ts` (dùng chung cho xuất và template nhập → cột giống nhau).

---

## 2. Nhập CSV – tạo / cập nhật nhiều dòng một lần

### 2-1. Quy tắc chung
| Mục | Quy tắc |
|---|---|
| Mã ký tự | Nhận UTF-8 (có / không BOM). Không phải UTF-8 → lỗi file (giống ảnh Phase 1 số 05) |
| Template | Nút "Template" tải file mẫu: dòng tiêu đề + 1–2 dòng ví dụ + hành vi trong 【 】 ở tiêu đề (28-183). Có thể tải **dữ liệu hiện tại** làm template (= Xuất CSV) để sửa rồi nhập lại |
| ~~Template~~ (2026-10-05) | **Bỏ nút "Template" và "Dữ liệu hiện tại" trong modal** (hong 2026-10-05, sổ cái F). Cột giống Xuất CSV nên cần mẫu thì dùng Xuất CSV. |
| Dòng lỗi (2026-10-05) | **Dòng lỗi bị bỏ qua, các dòng khác (tạo mới・cập nhật) vẫn đăng ký**; bước xác nhận hiện dòng lỗi + CSV danh sách lỗi. Chỉ dừng khi lỗi cả tệp hoặc không có dòng nào đăng ký được (hong 2026-10-05, Danh sách mục master – màn hình danh sách #8, sổ cái F. Cũ: 1 dòng lỗi thì không đăng ký gì). |
| Tạo / cập nhật | **Khóa trùng → ghi đè, khóa không có → tạo mới.** Không có cột NEW/UPDATE/DELETE (28-183). **Không xóa qua CSV** (xóa = đánh dấu đã xóa làm trên màn hình), trừ loại dòng có ghi rõ 【削除】 trong template |
| Khóa | Mỗi màn định nghĩa khóa (ví dụ Sản phẩm = `品番`, Cơ sở = `拠点ID`). Khóa trống → tạo mới, mã tự cấp |
| Ô trống khi cập nhật | **Giữ nguyên giá trị cũ** (không xóa). Muốn xóa giá trị → ghi `-` (chỉ cột cho phép trống) |
| Quy trình | **2 bước** (giống ảnh 26 Khảo sát): ① chọn file (kéo thả) → kiểm tra; ② xem kết quả: số dòng Tạo mới / Cập nhật / Không thay đổi / Lỗi, bảng lỗi theo dòng, **so sánh trước → sau** của các dòng cập nhật → bấm "Đăng ký" |
| Có lỗi | **Không lưu dòng nào** (tất cả hoặc không). Tải được "CSV danh sách lỗi" (file gốc + cột エラー内容) để sửa |
| Cảnh báo | Không chặn, nhưng phải tích "Tôi đã xác nhận cảnh báo" mới bấm Đăng ký được |
| Ảnh hưởng | Áp dụng khung 7-1: trường thuộc loại ② (áp dụng từ tương lai) phải có cột `適用開始`; loại ④ (đã khóa: đã xác nhận / đã thanh toán / đã chỉ thị xuất hàng) → lỗi dòng. Màn xác nhận hiện ảnh hưởng tới flow phía sau (như modal thay đổi hàng loạt) |
| Giới hạn | Tối đa 5,000 dòng / file (nhiều hơn thì chia file). Trên 100 dòng cập nhật → chạy nền có thanh tiến độ |
| Lịch sử | Ghi lịch sử nhập: ai, lúc nào, file, số dòng mới / cập nhật; mỗi bản ghi bị đổi có lịch sử thay đổi "Cập nhật bằng nhập CSV" |

### 2-2. Kiểm tra (validate)
**Lỗi file** (dừng ngay):
- Không phải CSV / không đọc được / không phải UTF-8.
- Dòng tiêu đề khác template (thiếu cột bắt buộc, tên cột lạ).
- File rỗng, quá 5,000 dòng.

**Lỗi dòng** (liệt kê theo `行番号・列名・内容`):
| Loại | Ví dụ |
|---|---|
| Bắt buộc | `商品名` trống khi tạo mới |
| Kiểu | Số / ngày / boolean sai dạng (`2026/13/40`, `abc` ở cột số) |
| Phạm vi / độ dài | Giá âm, tên quá 100 ký tự, mã bưu điện không đủ 7 số |
| Danh mục | Giá trị không có trong master (danh mục, kho, thuế suất, tag, nhà cung cấp…) — **không tự tạo master mới** |
| Tham chiếu | `拠点ID` / `法人ID` / `品番` không tồn tại hoặc đã xóa |
| Trùng | Cùng khóa xuất hiện 2 lần trong file; giá trị phải duy nhất bị trùng với data khác (JAN, email) |
| Quy tắc nghiệp vụ | Giống hệt khi lưu trên màn hình (dùng chung 1 hàm validate của domain), ví dụ tổng 基準注文数 = 50, nhà cung cấp đang chọn đúng 1 |
| Khóa / quyền | Bản ghi đang khóa (loại ④) hoặc không có quyền sửa |

**Cảnh báo** (không chặn): giá trị thay đổi lớn (giá ±30%), bản ghi đang được dùng ở menu đang công khai, thiếu ảnh…

### 2-3. Component dùng chung: `CsvImportModal`
- Props: `entity` (định nghĩa cột + khóa + validate trong `lib/csv/<entity>.ts`), `templateRows()`, `preview(rows)` (gọi domain: parse + validate + tính tạo mới/cập nhật/khác biệt, **không ghi**), `commit(token)` (ghi; domain chạy lại validate để chắc chắn).
- Giao diện 2 bước như mục 2-1, cùng style ở mọi site; nút "Nhập CSV" đặt cạnh "Xuất CSV".
- Domain: mỗi entity có action `importPreview` / `importCommit` dùng chung khung `lib/domain/csv.ts`.

---

## 3. Màn nào có gì (đề xuất – sẽ rà chính xác từng màn khi làm)

| Site | Xuất CSV | Nhập CSV |
|---|---|---|
| **Vận hành** | **Mọi màn list** | Master: Sản phẩm, Danh mục, Tag, Thuế suất, Gói (Plan) (+ thế hệ giá・thiết bị), Dòng máy, Tùy chọn (Option), Giảm giá, Kho, Đơn vị giao hàng ủy thác, Tài xế, Nhà cung cấp, Vật tư. Data: Doanh nghiệp・Cơ sở (tạo nhiều / cập nhật thông tin), Hợp đồng (cập nhật trường cho phép, có ngày bắt đầu áp dụng), Menu hàng tháng (template Phase 2), Khảo sát, Thông báo (đối tượng), Đăng ký nhập kho (nhập nhiều dòng), Ghi chép tồn kho |
| **Doanh nghiệp** | Hóa đơn, Giao hàng, Lịch sử đơn hàng, Cơ sở, Kiểm tra tồn kho, Doanh thu / Đánh giá | Đơn hàng tháng (nhập số lượng nhiều cơ sở một lần) — ❓ cần không? |
| **Nhà cung cấp** | Danh sách đơn nhận, Giao hàng / Thanh toán | Phản hồi đơn nhận (ngày giao・số thùng nhiều đơn một lần) — ❓ cần không? |
| **Đơn vị giao hàng ủy thác** | Danh sách giao hàng, Thanh toán / Chi trả | Nhân viên (tạo nhiều) — ❓ cần không? |
| **Tài xế** | Không | Không |

## 4. Cần bạn xác nhận
1. Tiền trong CSV là **số thuần** (`1000`), không có "円" — OK?
2. Bảng con: mặc định **nhiều dòng lặp khóa cha** — OK?
3. Nhập CSV: **không xóa qua CSV** (trừ chỗ template ghi 【削除】) — OK?
4. Ô trống khi cập nhật = **giữ nguyên**, muốn xóa ghi `-` — OK?
5. Có lỗi → **không lưu dòng nào** — OK?
6. Giới hạn 5,000 dòng / file — OK?
7. 3 dấu ❓ ở bảng mục 3 (Nhập CSV cho Doanh nghiệp / Nhà cung cấp / Đơn vị giao hàng ủy thác).

## 5. Đã chốt (2026/10/03)
1. Tiền trong CSV = số thuần (`1000`).
2. Bảng con = nhiều dòng, lặp lại khóa cha (nhập lại thì gom theo khóa).
3. Không xóa qua CSV (trừ chỗ quyết định cũ cho 【削除】, ví dụ Giá của Master Gói (Plan) – 28-183).
4. Ô trống khi cập nhật = giữ nguyên; muốn xóa ghi `-`.
5. Có lỗi → không lưu dòng nào; có CSV danh sách lỗi.
6. Tối đa 5,000 dòng / file.
7. Nhập CSV ở site ngoài: Doanh nghiệp chưa cần; Nhà cung cấp có (trả lời ngày giao・số thùng nhiều đơn); Đơn vị giao hàng ủy thác có (tạo nhiều nhân viên).

---

## Tình trạng triển khai（2026/10/03）

Khung chung: `lib/csv/core.ts` (format/parse/tên file), `lib/csv/master.ts`・`data.ts`・`sites.ts` (cột + cách lưu từng entity — dùng chung cho Xuất CSV・Template・Nhập CSV), `lib/csv/flatten.ts` (xuất "toàn bộ field" cho màn chỉ có Xuất CSV), `lib/domain/csv.ts` + area `csv` (`importPreview`/`importCommit`/`jobStep`/`logExport`, lịch sử `dm.csv.imports`・`dm.csv.exports`・`dm.csv.changes`), component `components/csv/CsvExportButton`・`CsvImportModal` (+ adapter từng site: `app/ops/_ui/csv.tsx`, `app/corp/_ui/csv.tsx`, `app/supplier/_components/csv.tsx`, `app/carrier/_ui/csv.tsx`).
Validate nghiệp vụ = chạy đúng hàm lưu của màn hình trên DocRepo "chồng" (overlay) → lỗi của hàm đó thành lỗi dòng; có lỗi thì không ghi gì.

| Site | Màn hình | Xuất CSV | Nhập CSV (khóa) |
|---|---|---|---|
| Vận hành | Master sản phẩm | ✅ | ✅ Mã hàng (`品番`) (để trống = tạo mới. Đổi giá mà sản phẩm đang ở menu công khai = lỗi dòng) |
| Vận hành | Tag sản phẩm・Thuế suất (dải phía trên Master sản phẩm) | ✅ | ✅ ID tag・ID thuế suất (chỉ thêm. Không được đổi tên・tỷ lệ) |
| Vận hành | Quản lý danh mục sản phẩm | ✅ | ✅ ID danh mục sản phẩm |
| Vận hành | Master Gói (Plan) (+ thế hệ giá 【削除】・thiết bị cho thuê tiêu chuẩn) | ✅ (dạng của 28-183) | ✅ ID gói／khóa tạm (dạng riêng) |
| Vận hành | Master Dòng máy・Tùy chọn・Giảm giá | ✅ | ✅ ID dòng máy・ID tùy chọn・ID giảm giá (cột = các mục của màn hình chi tiết) |
| Vận hành | Master Kho・Đơn vị giao hàng ủy thác・Vật tư・Nhà cung cấp | ✅ | ✅ ID kho・ID đơn vị giao hàng ủy thác・ID vật tư・ID nhà cung cấp |
| Vận hành | Nhân viên giao hàng (Tài xế) | ✅ | ✅ ID nhân viên giao hàng |
| Vận hành | Sổ cái túi giữ lạnh・Quyền・IP・Phiên bản・Danh sách thông báo・Danh sách tài khoản | ✅ | — |
| Vận hành | Danh sách Doanh nghiệp・Danh sách Cơ sở | ✅ | ✅ ID doanh nghiệp・ID cơ sở (**chỉ cập nhật**. Tạo mới phải từ đơn đăng ký・28-33) |
| Vận hành | Danh sách hợp đồng con (Hợp đồng) | ✅ | ✅ Số hợp đồng cha + ngày bắt đầu áp dụng (áp cho các tháng chưa xác nhận từ tháng đó trở đi. Đã xác nhận・đã thanh toán = lỗi dòng) |
| Vận hành | Quản lý đơn đăng ký hợp đồng | ✅ | ✅ Đăng ký mới hàng loạt (1 dòng = 1 cơ sở, 1 đơn đăng ký theo khóa doanh nghiệp, từ trạng thái đang tiếp nhận theo luồng thông thường. Cột xem `Form_đăng_ký.md` §10-8-1・A11) |
| Vận hành | Danh sách menu hàng tháng | ✅ (1 dòng = 1 sản phẩm của menu) | — |
| Vận hành | Chi tiết・chỉnh sửa menu hàng tháng | — | ✅ Mã hàng (`品番`) (template Phase 2・thay thế menu) |
| Vận hành | Quản lý đơn hàng sản phẩm・Quản lý đơn hàng vật tư | ✅ | — |
| Vận hành | Danh sách khảo sát | ✅ | ✅ Màn nhập hiện có (2 bước). Nếu có lỗi thì không đăng ký được → đổi thành CSV danh sách lỗi |
| Vận hành | Thông báo (chọn riêng lẻ) | — | ✅ ID (thêm vào lựa chọn・lưu bằng thao tác lưu thông báo) |
| Vận hành | Thanh toán: Quyết toán thực tế・Xác nhận thanh toán・Hóa đơn・Danh sách tồn kho | ✅ | — |
| Vận hành | Giao hàng: Xuất hàng・Quản lý giao hàng・Cần xác nhận・Lịch (tháng/tuần/ngày)・Hỏi đáp giao hàng・Tổng hợp vật tư | ✅ | — |
| Vận hành | Chỉ thị xuất hàng・Nhập (THOMAS／Yamato)・CSV chỉ thị nhập kho | Không đổi (dạng liên kết) | Không đổi |
| Vận hành | Đặt hàng (theo sản phẩm)・Đặt hàng・Lịch sử nhập kho・Danh sách thanh toán nhập mua・Đặt hàng vật tư・Mẫu kinh doanh・Tồn kho kho・Ứng viên hoàn tồn kho | ✅ | — |
| Vận hành | Đăng ký nhập kho | ✅ | ✅ Số đơn đặt hàng (1 dòng = lần nhập kho lần này của 1 đơn đặt hàng. Khác với dự kiến thì có chênh lệch・chờ xử lý) |
| Vận hành | Ghi chép tồn kho | ✅ | ✅ Số ghi chép (để trống = tạo mới・chỉ thêm) |
| Vận hành | Đánh giá・Quản lý doanh thu・Yêu thích・Liên hệ・Quản lý bảo trì | ✅ | — |
| Vận hành | TOP・Mục tiêu đơn giá trung bình・Cài đặt chu kỳ giao hàng・Cài đặt hàng thay thế (luồng nhập liệu)・Màn hình chi tiết | — | — |
| Doanh nghiệp | Trang chủ (Giao hàng)・Hóa đơn・Lịch sử đơn hàng (sản phẩm／vật tư)・Danh sách cơ sở・Kiểm tra tồn kho・Quản lý doanh thu／Danh sách người dùng・Đánh giá | ✅ | — |
| Nhà cung cấp | Danh sách đơn nhận (+ chi tiết đặt hàng (kỳ) = để đối chiếu giao hàng・thanh toán) | ✅ | ✅ Số đơn đặt hàng (phản hồi đơn nhận: ngày xuất hàng dự kiến／phê duyệt đặt hàng chính thức: ngày giao・số thùng nhập kho・hạn sử dụng (hạn tiêu thụ). Hạn bắt buộc với mọi mặt hàng trừ vật tư: sổ cái E 2026-10-05) |
| Đơn vị giao hàng ủy thác | Danh sách giao hàng・Quản lý thu tiền・Chi tiết chi trả (tháng) | ✅ | — |
| Đơn vị giao hàng ủy thác | Nhân viên giao hàng | ✅ | ✅ ID nhân viên giao hàng (chỉ để trống = tạo mới. Không có ảnh = chưa đăng ký bằng lái) |
| Tài xế | — | — | — |

## 6. Nhập CSV khảo sát (Nhập CSV khảo sát Web Vận hành・2026-10-05)

Cùng nội dung với thiết kế màn hình `AW_SURV_004` (dữ liệu `docs/05_画面設計書/Dữ_liệu/AW_SURV_Khảo_sát.py` No.5). 1 dòng = 1 câu hỏi. **4 cột thông tin cơ bản lấy giá trị ở dòng 1 (dòng của câu hỏi đầu tiên) để điền vào ô ②** (từ dòng 2 trở đi không đọc. Nếu trống thì nhập ở ②. Thông báo nhắc nhở・đối tượng gửi không có trong CSV. hong 2026-10-05＝B). Ở ② xác nhận tên khảo sát・thời gian trả lời・đối tượng gửi rồi bấm "Đăng ký". Dòng lỗi không được nhập, các dòng khác vẫn đăng ký (§5・sổ cái F).

**File**：UTF-8 (có hoặc không BOM), phân cách bằng dấu phẩy, dòng 1 = tiêu đề `アンケート名,案内文,回答開始日時,回答終了日時,No,設問文,設問タイプ,必須,選択肢` (đúng thứ tự này. Sai thì E214), từ dòng 2 mỗi dòng = 1 câu hỏi, tối đa 5,000 dòng, bỏ qua dòng trống, không có dòng câu hỏi nào thì E219. Giá trị chứa `,` `"` xuống dòng thì bọc `"…"` (`"` viết thành `""`). Cắt khoảng trắng đầu cuối, đổi số・chữ cái・gạch nối full-width sang half-width rồi mới kiểm tra. File mẫu có cùng thứ tự cột với Xuất CSV (1 dòng = 1 câu hỏi) (không đặt nút template).

| Cột | Mục | Bắt buộc | Kiểu・độ dài | Quy tắc giá trị | Lỗi |
|---|---|---|---|---|---|
| 1 | Tên khảo sát (`アンケート名`) | － | Chuỗi 60 | Giá trị dòng 1 đưa vào ②. Khi đăng ký: trống thì E01・quá 60 thì E04 | E01／E04／E13 |
| 2 | Văn bản hướng dẫn (`案内文`) | － | Chuỗi 500 | Giá trị dòng 1 đưa vào ②. Xuống dòng thì bọc trong `"…"` | E04／E13 |
| 3 | Ngày giờ bắt đầu trả lời (`回答開始日時`) | － | yyyy-mm-dd HH:MM (yyyy/mm/dd cũng được) | Giá trị dòng 1 đưa vào ②. Không đọc được thì để trống, khi đăng ký thì E200 | E200 |
| 4 | Ngày giờ kết thúc trả lời (`回答終了日時`) | － | yyyy-mm-dd HH:MM | Như trên. Khi đăng ký phải sau ngày giờ bắt đầu trả lời, nếu không thì E201 | E200／E201 |
| 5 | No | － | Số nguyên (tham khảo) | Số để người xem tham khảo. Thứ tự quyết định theo thứ tự dòng, không đọc giá trị này (để trống cũng được) | — |
| 6 | Nội dung câu hỏi (`設問文`) | ○ | Chuỗi 200 | Không được trống. Không được dùng emoji (lỗi dòng) | E01／E04／E13 |
| 7 | Loại câu hỏi (`設問タイプ`) | ○ | 単一選択／複数選択／自由記述 (chọn một／chọn nhiều／tự do) | Đúng như 3 chuỗi này (trống cũng không được. Lỗi dòng) | E215 |
| 8 | Bắt buộc (`必須`) | － | "必須" (bắt buộc) hoặc "任意" (tùy chọn) | Trống = tùy chọn (lỗi dòng) | E216 |
| 9 | Lựa chọn (`選択肢`) | Có điều kiện | Chuỗi 60 × từ 2 trở lên, phân cách bằng "／" (dùng / half-width cũng được) | Chọn một・chọn nhiều: bỏ phần trống phải có từ 2 lựa chọn trở lên・không trùng nhau・mỗi lựa chọn tối đa 60 ký tự. Tự do: để trống (lỗi dòng) | E217／E204／E04／E218 |

Ví dụ điền:
```
アンケート名,案内文,回答開始日時,回答終了日時,No,設問文,設問タイプ,必須,選択肢
月間ランチメニューアンケート（11月）,11月のメニューについてのアンケートです。所要時間は約3分です。,2026-11-01 08:00,2026-11-20 18:00,1,ESステーションの利用頻度をお選びください。,単一選択,必須,週5回以上／週3〜4回／週1〜2回／月に数回
,,,,2,よく選ぶメニューのジャンルをお選びください。,複数選択,必須,和食／洋食／中華／エスニック／デザート
,,,,3,今後追加してほしいメニューをご記入ください。,自由記述,任意,
```
(Các cột thông tin cơ bản từ dòng 2 trở đi có thể để trống. Khi nạp nguyên dạng file Xuất CSV thì tất cả các dòng có cùng giá trị cũng được)
