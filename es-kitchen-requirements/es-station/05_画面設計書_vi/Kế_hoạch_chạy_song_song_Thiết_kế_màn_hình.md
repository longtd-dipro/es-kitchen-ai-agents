# Kế hoạch chạy song song skill `screen-design-doc` cho toàn bộ màn hình (Kế hoạch thực thi song song Thiết kế màn hình)

Ngày: 2026-10-05 ／ Người viết: Claude (cloud) ／ hong đồng ý cách chia ngày 2026-10-05.
Mục đích: chạy skill `.claude/skills/screen-design-doc` cho **mọi chức năng của 5 site** mà không phá nhau khi merge, và không bắt hong ngồi chờ từng câu hỏi.

Quy ước trong file: **S / M / L** = chức năng nhỏ / vừa / lớn (theo số trạng thái và số hạng mục dự kiến). Token là **ước lượng** (độ lớn context một phiên cloud phải đọc + viết), không phải số đo thật.

---

## 1. Con số để lên kế hoạch

| | Memo (bước 1〜2) | Chạy hết 8 bước |
|---|---|---|
| Chức năng S (1〜3 trạng thái, ≈10〜25 hạng mục) | 80k〜120k | 150k〜250k |
| Chức năng M (4〜10 trạng thái, ≈30〜60 hạng mục) | 150k〜250k | 250k〜400k |
| Chức năng L (10〜20 trạng thái, ≈80〜100 hạng mục, như Master Gói (プランマスタ)) | 300k〜400k | 450k〜600k |
| Phần đọc chung mỗi phiên (skill, Sổ quyết định, Sổ tiếp nhận, Thiết kế cơ bản, Message List) | ≈150k, đọc 1 lần / phiên | |

- Căn cứ: lần Master Gói (commit fad821e) đọc ≈350 KB docs + ≈250 KB code + 97 KB Message List → ≈300k〜400k cho riêng memo.
- Tổng toàn hệ thống (91 chức năng bên dưới: 13 L, 38 M, 40 S): **≈25M〜35M token**. Một phiên cloud có ngân sách 15M nên bắt buộc chia nhiều phiên.
- **Nút thắt thật là số câu hỏi cho hong**, không phải token: Master Gói ra 7 câu. Vì vậy chia 2 giai đoạn: A chỉ ra memo (không cần hong), hong trả lời theo lô, B mới viết data.

---

## 2. Quy tắc bắt buộc khi chạy song song (Quy định chạy song song)

1. **Không sửa file chung trong giai đoạn A.** `Dữ_liệu/_Chung_Thông_báo.py`・`Dữ_liệu/_Chung_Mẫu_thao_tác.py`・`docs/決定台帳.md`・`docs/決定の受付簿.md` chỉ **đọc**. Message còn thiếu → ghi vào memo mục 「[msg] Message cần thêm」 (ID tạm `NEW-<領域>-01…`, kèm ja_c／ja_o／vi đề xuất). Phiên gộp (mục 6) mới cấp ID thật.
2. **Dải ID message theo lĩnh vực** (giai đoạn B, khi được phép thêm): giữ nguyên các ID đã có (E01〜E13, W02, E30〜E32, I01, I02, Q01, Q02, S01, S02). ID mới dùng tiền tố loại + số theo dải:

   | Lĩnh vực | E (Lỗi) | Q (Xác nhận) | S／I／W |
   |---|---|---|---|
   | Vận hành A Đơn đăng ký・Doanh nghiệp・Hợp đồng | E100〜E119 | Q100〜Q109 | S100〜／I100〜／W100〜 |
   | Vận hành B Menu | E120〜E139 | Q110〜Q119 | S110〜／I110〜／W110〜 |
   | Vận hành C Đặt hàng・Nhập kho | E140〜E159 | Q120〜Q129 | S120〜／I120〜／W120〜 |
   | Vận hành D Giao hàng | E160〜E179 | Q130〜Q139 | S130〜／I130〜／W130〜 |
   | Vận hành E Thanh toán・Mua hàng | E180〜E199 | Q140〜Q149 | S140〜／I140〜／W140〜 |
   | Vận hành F Chăm sóc khách hàng | E200〜E219 | Q150〜Q159 | S150〜／I150〜／W150〜 |
   | Vận hành G Master(1) | E220〜E239 | Q160〜Q169 | S160〜／I160〜／W160〜 |
   | Vận hành H Master(2) | E240〜E259 | Q170〜Q179 | S170〜／I170〜／W170〜 |
   | Vận hành I Đại lý・Tài khoản・Cài đặt | E260〜E279 | Q180〜Q189 | S180〜／I180〜／W180〜 |
   | Doanh nghiệp A Đơn hàng・Tồn kho・Thanh toán | E300〜E329 | Q200〜Q209 | S200〜／I200〜／W200〜 |
   | Doanh nghiệp B Đơn đăng ký・Cơ sở・Khác | E330〜E359 | Q210〜Q219 | S210〜／I210〜／W210〜 |
   | Đơn vị giao hàng ủy thác | E400〜E429 | Q300〜Q309 | S300〜／I300〜／W300〜 |
   | Tài xế | E430〜E459 | Q310〜Q319 | S310〜／I310〜／W310〜 |
   | Nhà cung cấp | E460〜E489 | Q320〜Q329 | S320〜／I320〜／W320〜 |

   Dải **chung** (chỉ phiên 0 và phiên gộp được thêm): E50〜E99, Q10〜Q19, S10〜S19, W10〜W19, I10〜I19.
   Trước khi thêm, vẫn phải tìm message cùng nghĩa đã có (quy tắc skill「không tạo 2 message cùng nghĩa」). Message dùng chung nhiều lĩnh vực → không tự thêm, báo phiên gộp.
3. **Câu hỏi cho hong không hỏi trực tiếp trong giai đoạn A.** Gom vào memo theo đúng dạng câu hỏi của skill (trích nguyên văn, file và mục, lựa chọn, ưu nhược, đề xuất). Hong trả lời **trong 1 phiên riêng** (mục 5); phiên đó là phiên duy nhất ghi `決定台帳.md`.
4. **Mỗi phiên 1 branch**, tên `claude/spec-<領域>` (ví dụ `claude/spec-ops-a`). Chỉ commit file của lĩnh vực mình: `docs/05_画面設計書/確認メモ_<領域>_*.md` (giai đoạn A), `Dữ_liệu/<ScreenCode頭>_*.py` (giai đoạn B). Không commit `Đầu_ra/`.
5. **Screen Code và quy ước đánh số** chốt ở phiên 0 trước. Chưa chốt thì không mở phiên A.
6. Mỗi phiên **tối đa 5〜7 chức năng** (hoặc 2 chức năng L + vài S). Hơn thì context bị nén nhiều lần, chất lượng memo giảm.
7. Data `.py` dùng `DEMO_FILE = "http://localhost:3000"`; phiên B tự chạy `npm run dev` trong container của mình (độc lập, không đụng nhau).

---

## 3. Phiên 0: việc phải chốt trước (Việc cần quyết định trước) — **Xong 2026-10-05** (hong trả lời trong chat, ghi Sổ quyết định E). Giai đoạn A có thể mở.

| # | Việc | Vì sao phải trước |
|---|---|---|
| 0-1 | ~~Quy ước Screen Code~~ **Đã chốt 2026-10-05 (Sổ quyết định E)**: `<Site2字>_<機能略>_<3桁>`. AW=Vận hành, CW=Doanh nghiệp, TW=Đơn vị giao hàng ủy thác, DW=Tài xế, SW=Nhà cung cấp. Viết tắt chức năng = chữ hoa tiếng Anh (PLAN, CORP, BILL…). 3 chữ số = số màn trong chức năng (001 Danh sách・002 Chi tiết・003 Đăng ký・Chỉnh sửa). id trạng thái đánh liên tục 001… trong chức năng, như memo Master Gói. | Xong. |
| 0-2 | ~~Cách giữ giá Gói (プラン)~~ **C**: Thế hệ giá × Course có 2 giá COOL便／ES配送便; **bản công khai là cờ do Vận hành chọn** (không phải mới nhất); thế hệ không công khai = giá riêng cho công ty. Chi tiết Sổ quyết định E. | Xong. Cách giới hạn thế hệ riêng theo công ty: hỏi khi viết data (Vận hành G, Vận hành A). |
| 0-3 | ~~Quyền~~ **Toàn quyền và Quản trị hệ thống CRUD mọi chức năng**; R/U = xem, sửa, xuất CSV, thao tác của chức năng, không tạo/xóa/nhập CSV; R = xem, xuất CSV. Bảng phân quyền đã sửa 4 dòng. | Xong. Phiên A không hỏi lại câu quyền; chỉ hỏi khi chức năng có thao tác riêng (Phê duyệt, Công khai, Xác nhận) chưa rõ vai trò. |
| 0-4 | ~~Duyệt `_Chung_Mẫu_thao_tác.py`~~ Đã thêm **P-CSV-IN, P-CSV-OUT, P-TAB, P-HIST, P-BULK**; P-FORM chốt Q02 toàn hệ thống và lỗi lưu inline (bỏ hộp thoại); P-LIST chốt thứ tự mặc định. | Xong. |
| 0-5 | ~~Duyệt message chung~~ Đã thêm **E50〜E52, Q10, Q11, S10, S11, W10** vào `_Chung_Thông_báo.py`. E32 (không có quyền) đã có. | Xong. |
| 0-6 | ~~Thứ tự ưu tiên~~ **Vận hành G → Doanh nghiệp A → Vận hành A → Vận hành D → Vận hành E → Vận hành B／C → Doanh nghiệp B → 3 site nhỏ → Vận hành F／H／I**. | Xong. |
| 0-7 | ~~Q2〜Q6 memo Master Gói~~ Đã trả lời, ghi vào memo. Vận hành G có thể vào giai đoạn B ngay (memo + trả lời đủ). | Xong. |

---

## 4. Chia lĩnh vực → phiên và danh sách chức năng (Cách chia lĩnh vực)

**Phân công đang chạy (2026-10-05):**

| Lĩnh vực | Phiên / branch | Giai đoạn |
|---|---|---|
| Vận hành G Master(1) | `claude/jolly-dijkstra-62jr5h` | A (memo Master Gói・Dòng máy・Tùy chọn・Giảm giá) |
| Vận hành F Quản lý khảo sát | `claude/trusting-archimedes-hlfc4a` | A (memo Khảo sát) |
| Doanh nghiệp A Đơn hàng・Tồn kho・Thanh toán | `claude/elegant-gauss-ppbt0w` (phiên điều phối, kiêm) | **A・Trả lời・B xong (2026-10-05)**: data 7 file, bản nháp HTML `Đầu_ra/法人Web/`, xlsx dựng lại bằng `make.py --book 法人Web`. Còn: hong xác nhận memo §8, chụp lại 8 trạng thái cần dữ liệu Vận hành |
| Phiên Trả lời・gộp | `claude/elegant-gauss-ppbt0w` | — |

Branch của phiên nào đã mở trước kế hoạch thì giữ tên cũ; phiên mới dùng `claude/spec-<領域>`.


Tên chức năng lấy từ menu trong code (`lib/ops/menu.ts`・`lib/corp/menu.ts`・`lib/carrier/menu.ts`・title của page). 1 chức năng = 1 sheet; Danh sách・Chi tiết・Tạo mới・Chỉnh sửa cùng 1 chức năng.
Cột 「Book」= file Excel sau cùng (quy tắc 1 site = 1 file, Vận hành chia theo lĩnh vực).

### Web quản trị vận hành (AW)

| Phiên | Chức năng | URL | Cỡ | Code chính |
|---|---|---|---|---|
| **Vận hành A** Đơn đăng ký・Doanh nghiệp・Hợp đồng (≈1.6M) | Dashboard | `/ops` | M | `app/ops/page.tsx`, `lib/ops/areas/general.ts` |
| | Quản lý đơn đăng ký hợp đồng (Danh sách・Chi tiết・Đăng ký hộ) | `/ops/applications`, `/[no]`, `/proxy/[tab]` | L | `app/ops/applications` (420 KB), `lib/ops/areas/applications.ts` |
| | Danh sách doanh nghiệp (Danh sách・Chi tiết・Chỉnh sửa) | `/ops/corps`, `/[id]`, `/[id]/edit` | L | `app/ops/corps` (168 KB), `lib/ops/areas/contracts.ts` |
| | Danh sách cơ sở (Danh sách・Chi tiết・Chỉnh sửa) | `/ops/branches`, `/[id]`, `/[id]/edit` | M | `app/ops/branches` |
| | Danh sách hợp đồng con (Danh sách・Chi tiết・Chỉnh sửa・Hợp đồng cha) | `/ops/contracts`, `/[id]`, `/[id]/edit`, `/parents/[no]` | M | `app/ops/contracts` |
| **Vận hành B** Menu (≈1.1M) | Menu tháng (Danh sách・Chi tiết・Chỉnh sửa) | `/ops/menu/monthly`, `/[ym]`, `/[ym]/edit` | M | `app/ops/menu/monthly`, `lib/ops/areas/menu.ts` |
| | Quản lý đơn hàng sản phẩm (Danh sách・Chi tiết・Chỉnh sửa・Hàng thay thế) | `/ops/menu/orders`, `/[no]`, `/[no]/edit`, `/alt` | L | `app/ops/menu/orders` |
| | Quản lý đơn hàng vật tư (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/menu/materials`, `/[no]`, `/new`, `/[no]/edit` | M | `app/ops/menu/materials` |
| | Quản lý danh mục sản phẩm | `/ops/masters/categories` | S | `app/ops/masters/categories` |
| **Vận hành C** Đặt hàng・Nhập kho (≈1.4M) | Đặt hàng (Danh sách・Chi tiết) | `/ops/purchasing/orders`, `/[pid]` | M | `app/ops/purchasing` (232 KB), `lib/ops/areas/purchasing.ts` |
| | Lịch sử đặt hàng・nhập kho | `/ops/purchasing/history` | S | |
| | Đăng ký nhập kho | `/ops/purchasing/receiving` | M | |
| | Tồn kho kho hàng (Danh sách・Chi tiết・Ghi nhận xuất nhập・Trả hàng) | `/ops/purchasing/stock`, `/[id]`, `/records`, `/returns` | M | |
| | Đặt hàng vật tư | `/ops/purchasing/materials` | S | |
| | Mẫu kinh doanh (Danh sách・Tạo mới) | `/ops/purchasing/samples`, `/new` | S | |
| **Vận hành D** Giao hàng (≈1.4M) | Lịch trình (+ Chu kỳ) | `/ops/delivery/schedule`, `/cycle` | M | `app/ops/delivery` (333 KB), `lib/ops/areas/delivery.ts` |
| | Quản lý xuất hàng・giao hàng (Danh sách・Chi tiết・Chỉnh sửa・Chỉ thị xuất hàng) | `/ops/delivery/list`, `/[id]`, `/[id]/edit`, `/ship-orders` | L | |
| | Cần xác nhận (Danh sách・Chi tiết) | `/ops/delivery/review`, `/[id]` | M | |
| | Tổng hợp vật tư | `/ops/delivery/material-summary` | S | |
| | Tra cứu đơn vị giao hàng ủy thác・điểm trung chuyển | `/ops/delivery/inquiries` | S | |
| **Vận hành E** Thanh toán・Mua hàng (≈1.4M) | Kiểm kê (tồn kho cơ sở) (Danh sách・Chi tiết・Chỉnh sửa・Hàng loạt) | `/ops/billing/stock`, `/[id]`, `/[id]/edit`, `/bulk` | M | `app/ops/billing` (192 KB), `lib/ops/areas/billing.ts` |
| | Quyết toán thực tế (Danh sách・Chi tiết・Chỉnh sửa) | `/ops/billing/actuals`, `/[id]`, `/[id]/edit` | M | |
| | Xác nhận thanh toán・Hóa đơn (Danh sách・Chi tiết・Chỉnh sửa・Theo hợp đồng con) | `/ops/billing/confirm`, `/[id]`, `/[id]/edit`, `/sub/[id]`, `/sub/[id]/edit` | L | |
| | Quản lý mua hàng | `/ops/sales` | M | `app/ops/sales` |
| | Tổng hợp yêu thích | `/ops/sales/favorites` | S | |
| **Vận hành F** Chăm sóc khách hàng・Thông báo (≈1.0M) | Đánh giá・Ý kiến (Danh sách・Chi tiết) | `/ops/reviews`, `/[id]` | M | `app/ops/reviews`, `lib/ops/areas/reviews.ts` |
| | Quản lý khảo sát (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa・Nhập) | `/ops/surveys`, `/[id]`, `/new`, `/[id]/edit`, `/import` | M | `app/ops/surveys`, `lib/domain/survey.ts` |
| | Danh sách thông báo (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/notices`, `/[id]`, `/new`, `/[id]/edit` | M | `app/ops/notices` |
| | Liên hệ (từ Web doanh nghiệp) | `/ops/inquiries` | S | `app/ops/inquiries` |
| **Vận hành G** Master(1) (≈1.3M) | Master Gói (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) **đã có memo** | `/ops/masters/plans`… | L | `app/ops/masters/_masters`, `lib/ops/masters` (461 KB) |
| | Master Tùy chọn (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/masters/options`… | M | |
| | Master Giảm giá (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/masters/discounts`… | M | |
| | Master Dòng máy (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/masters/devices`… | M | |
| **Vận hành H** Master(2) (≈1.3M) | Master Sản phẩm (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa・CSV tag) | `/ops/masters/products`… | L | `lib/domain/product.ts` |
| | Master Vật tư (+ nhập CSV vật tư × gói) | `/ops/masters/materials` | M | |
| | Master Nhà cung cấp (+ xác nhận đăng ký) | `/ops/masters/suppliers` | M | |
| | Đơn vị giao hàng ủy thác | `/ops/masters/consignees` | S | |
| | Master Kho | `/ops/masters/warehouses` | S | |
| | Nhân viên giao hàng | `/ops/masters/drivers` | S | |
| | Sổ túi giữ lạnh | `/ops/masters/coolers` | S | |
| **Vận hành I** Đại lý・Tài khoản・Cài đặt (≈1.4M) | Master Đại lý (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/agency/agencies`… | M | `app/ops/agency` |
| | Master Phí giới thiệu (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa) | `/ops/agency/fee-plans`… | M | |
| | Lịch sử giới thiệu (Danh sách・Chi tiết・Chỉnh sửa) | `/ops/agency/referrals`… | S | |
| | Lịch sử thanh toán (Danh sách・Chi tiết・Chỉnh sửa) | `/ops/agency/payments`… | S | |
| | Danh sách tài khoản | `/ops/accounts` | S | `app/ops/accounts`, `lib/ops/permissions.ts` |
| | Phân quyền (Danh sách・Chi tiết) | `/ops/accounts/permissions`, `/[id]` | M | |
| | Cài đặt: Quản lý bảo trì | `/ops/settings/maintenance` | S | `app/ops/settings` |
| | Cài đặt: Phiên bản & Cập nhật bắt buộc | `/ops/settings/version` | S | |
| | Cài đặt: Quản lý IP whitelist | `/ops/settings/ip` | S | |
| | Cài đặt: Mục tiêu đơn giá trung bình | `/ops/settings/avg-target` | S | |
| | Cài đặt: Thuế suất chênh lệch thu tiền mặt | `/ops/settings/cash-tax` | S | |
| | Cài đặt: Email nhận thông báo liên hệ | `/ops/settings/inquiry-mail` | S | |

Không làm: `/ops/orders` (redirect sang Đặt hàng), `/ops/[...slug]` (màn đang chuẩn bị).
Book (hong chốt 2026-10-05): Web quản trị vận hành_Đơn đăng ký・Hợp đồng (A) ／ _Menu・Đặt hàng (B+C) ／ _Giao hàng (D) ／ _Thanh toán・Mua hàng (E) ／ _Chăm sóc khách hàng (F) ／ _Master (G+H) ／ _Quản lý・Cài đặt (I).

### Web doanh nghiệp (CW)

| Phiên | Chức năng | URL | Cỡ |
|---|---|---|---|
| **Doanh nghiệp A** Đơn hàng・Tồn kho・Thanh toán (≈1.6M) | Trang chủ | `/corp` | M |
| | Đặt hàng sản phẩm (+ Đặt hàng AI) | `/corp/order`, `/order/ai` | L |
| | Đặt hàng vật tư | `/corp/order/materials` | M |
| | Lịch sử đặt hàng (Danh sách・Chi tiết) | `/corp/order/history`, `/[site]/[ym]` | M |
| | Kiểm tra tồn kho | `/corp/stock` | M |
| | Hóa đơn (Danh sách・Chi tiết) | `/corp/bills`, `/[no]` | M |
| | Chi tiết giao hàng | `/corp/deliveries/[id]` | S |
| **Doanh nghiệp B** Đơn đăng ký・Cơ sở・Khác (≈1.9M) | Đơn: Thay đổi ngày giao hàng | `/corp/requests` | M |
| | Đơn: Đơn đăng ký hợp đồng (Danh sách・Tạo mới・Chi tiết) | `/corp/requests/contract`, `/new`, `/[no]` | L |
| | Quản lý cơ sở (Danh sách・Chi tiết・Tạo mới・Chỉnh sửa・Chi tiết hợp đồng) | `/corp/sites`, `/[id]`, `/new`, `/[id]/edit`, `/[id]/contracts/[kid]` | L |
| | Thông tin doanh nghiệp (Chi tiết・Chỉnh sửa) | `/corp/corp-info`, `/edit` | S |
| | Quản lý mua hàng・người dùng (+ Chi tiết người dùng) | `/corp/sales`, `/users/[id]` | M |
| | Đánh giá (Danh sách・Chi tiết) | `/corp/reviews`, `/[id]` | S |
| | Liên hệ | `/corp/contact` | S |
| | Thông báo (Danh sách・Chi tiết) | `/corp/news`, `/[id]` | S |
| | Form đăng nhập・Đăng ký mới | `/corp/login`, `/corp/apply` | M |

Code: `app/corp/*`, `lib/corp` (344 KB, chia theo `lib/corp/areas/*`). Không làm `/corp/[...slug]`. Book: Web doanh nghiệp (1 file).

### Web đơn vị giao hàng ủy thác (TW) — 1 phiên (≈1.3M)

| Chức năng | URL | Cỡ |
|---|---|---|
| Trang chủ・Chi tiết thông báo | `/carrier`, `/news/[id]` | S |
| Lịch trình (tháng・tuần) | `/carrier/schedule` | M |
| Quản lý giao hàng (Danh sách + Thiết lập hàng loạt・Chi tiết) | `/carrier/deliveries`, `/[id]` | M |
| Sự cố | `/carrier/troubles` | S |
| Quản lý thu tiền | `/carrier/collect` | S |
| Yêu cầu báo giá (Danh sách・Chi tiết・Trả lời) | `/carrier/quotes`, `/[id]`, `/[id]/answer` | M |
| Nhân viên giao hàng (Danh sách・Chi tiết・Đăng ký・Cấp hàng loạt) | `/carrier/staff`, `/[id]`, `/new` | M |
| Hồ sơ | `/carrier/profile` | S |
| Đăng nhập・Đặt lại mật khẩu・Form đăng ký 1/2・2/2 | `/carrier/login`, `/password`, `/apply`, `/apply/2` | M |

Code: `app/carrier/*`, `lib/carrier` (59 KB). Book: Web đơn vị giao hàng ủy thác.

### Ứng dụng tài xế (DW) — 1 phiên (≈1.2M)

| Chức năng | URL | Cỡ |
|---|---|---|
| Trang chủ・Danh sách giao hàng | `/driver`, `/driver/list` | M |
| Chuyến ES配送便 (Danh sách・Chi tiết) | `/driver/es`, `/[id]` | M |
| Chuyến COOL便 (Danh sách・Chi tiết) | `/driver/cool`, `/[id]` | M |
| Nhận hàng (kho・điểm trung chuyển) | `/driver/receive`, `/receive/hub` | M |
| Hủy bỏ・Kiểm kê | `/driver/stock` | S |
| Báo cáo sự cố | `/driver/trouble` | S |
| Hướng dẫn (Danh sách・Chi tiết) | `/driver/manuals`, `/[id]` | S |
| Thông báo (Danh sách・Chi tiết) | `/driver/news`, `/[id]` | S |
| Tài khoản・Đăng nhập・Mật khẩu | `/driver/account`, `/login`, `/password` | S |

Code: `app/driver/*`, `lib/driver` (80 KB). Book: Ứng dụng tài xế.

### Web nhà cung cấp (SW) — 1 phiên (≈0.8M), có thể ghép chung phiên với Tài xế

| Chức năng | URL | Cỡ |
|---|---|---|
| Trang chủ・Chi tiết thông báo | `/supplier/home`, `/notices/[id]` | S |
| Đặt hàng (Danh sách・Chi tiết) | `/supplier/orders`, `/[no]` | M |
| Hồ sơ | `/supplier/profile` | S |
| Hướng dẫn thao tác | `/supplier/manual` | S |
| Đăng nhập・Cấp lại mật khẩu・Đăng ký giao dịch | `/supplier/login`, `/forgot`, `/apply` | M |

Code: `app/supplier/*`, `lib/supplier` (47 KB). Book: Web nhà cung cấp.

**Tổng: 91 chức năng (Vận hành 52 ／ Doanh nghiệp 16 ／ Đơn vị giao hàng ủy thác 9 ／ Tài xế 9 ／ Nhà cung cấp 5), 14 phiên.** Số token trong ngoặc là ước cho cả A+B của phiên đó.

---

## 5. Trình tự (Cách tiến hành)

```
Phiên 0 (1, có hong)  ─→  Giai đoạn A: 14 phiên song song, chỉ ra 確認メモ
                              │  (không hỏi hong, không sửa file chung)
                              ▼
                        Hong trả lời theo lô: 1 phiên 「回答」 đọc các memo,
                        hỏi hong từng câu, ghi 決定台帳 + 受付簿, commit
                              │
                              ▼
                        Giai đoạn B: 14 phiên song song (cùng cách chia),
                        viết data .py → --check → --capture → --draft
                              │
                              ▼
                        Phiên gộp (1): merge, cấp ID message thật, --check lại
                        toàn bộ, --book từng site, --release 1.0 khi hong OK
```

- **Giai đoạn A** mỗi phiên: đọc skill + `references/confirm_flow.md` → đọc code của lĩnh vực + Sổ quyết định + Sổ tiếp nhận + quyết định liên quan + Message List CSV → viết `確認メモ_<領域>.md` theo đúng dạng memo Master Gói (VIEWS từng chức năng, [Q], [宿題], [open], [msg]) → commit, push branch `claude/spec-<領域>`. Không chạy browser.
- **Phiên Trả lời**: gộp câu hỏi trùng giữa các memo (ví dụ quyền Xóa, nhập CSV) thành 1 câu. Mỗi câu trả lời → 1 dòng Sổ quyết định E. Kết quả ghi lại vào memo (mục 「回答」) để phiên B đọc.
- **Giai đoạn B** mỗi phiên: đọc memo + Trả lời → viết `Dữ_liệu/<Code>_<機能>.py` (DECISIONS từ Trả lời, open cho câu 「hỏi khách hàng」) → `make.py --check` về 0 → `npm run dev` + `--capture` → `--draft` để tự xem → commit data + HTML. Thêm message chỉ trong dải của mình (mục 2-2).
- **Phiên gộp**: merge 14 branch vào 1 (xung đột chỉ có thể ở `_Chung_Thông_báo.py`, giải bằng cách giữ cả hai vì dải ID khác nhau), tìm message trùng nghĩa giữa các lĩnh vực và gộp, `--check` toàn bộ, `--book` theo site, giao hong xem (HTML trước). `--release 1.0` theo book khi hong quyết giao dev.

Thứ tự mở phiên B nếu không mở hết cùng lúc: theo 0-6. Đề xuất: Vận hành G (đã có memo) → Doanh nghiệp A → Vận hành A → Vận hành D → còn lại.

---

## 6. Prompt mẫu để mở phiên (Cách mở phiên)

Giai đoạn A (thay `<領域>` và danh sách chức năng bằng bảng mục 4):

> Dùng skill `screen-design-doc`, chỉ làm bước 1 và 2 (Liệt kê・Memo xác nhận) cho lĩnh vực **<領域>** gồm các chức năng: <danh sách>. Làm theo `docs/05_画面設計書/Kế_hoạch_chạy_song_song_Thiết_kế_màn_hình.md` mục 2 (quy tắc song song): không sửa `_Chung_Thông_báo.py`・`_Chung_Mẫu_thao_tác.py`・`決定台帳.md`, không hỏi tôi trực tiếp, gom câu hỏi vào memo. Viết `docs/05_画面設計書/確認メモ_<領域>.md` theo dạng của `Ghi_chú_xác_nhận_AW_PLAN_Master_Gói.md`. Commit và push lên branch `claude/spec-<領域>`.

Giai đoạn B:

> Dùng skill `screen-design-doc`, bước 3〜6 cho lĩnh vực **<領域>**. Đọc `確認メモ_<領域>.md` (đã có Trả lời) và `Kế_hoạch_chạy_song_song_Thiết_kế_màn_hình.md` mục 2. Viết data `.py` cho từng chức năng, `--check` về 0, `npm run dev` rồi `--capture`, `--draft`. Message mới chỉ trong dải ID của lĩnh vực. Commit data và HTML, push `claude/spec-<領域>`.

---

## 7. Việc đã hỏi hong (Trả lời 2026-10-05)

- ~~Tiền tố Screen Code cho 5 site (0-1) và cách đánh số chức năng~~ → **Chốt như đề xuất** (hong 2026-10-05, Sổ quyết định E).
- ~~Chia Book của Vận hành~~ → **7 file như đề xuất** (hong 2026-10-05, Sổ quyết định E).
- ~~Có ghép Đơn vị giao hàng ủy thác・Tài xế・Nhà cung cấp vào 1〜2 phiên không~~ → **Được** (hong 2026-10-05). Khi ghép, mỗi site vẫn 1 memo riêng và 1 branch riêng cho dễ merge; chỉ chung phiên.
- ~~Ai chạy giai đoạn B trước khi hong trả lời xong tất cả memo~~ → **B của lĩnh vực nào chạy ngay khi lĩnh vực đó có Trả lời**, không chờ lĩnh vực khác (hong 2026-10-05, Sổ quyết định E).

Còn lại phải chốt ở phiên 0: 0-2 〜 0-7.
