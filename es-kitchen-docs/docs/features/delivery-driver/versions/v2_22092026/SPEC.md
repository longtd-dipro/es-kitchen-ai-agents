# SPEC: App Tài Xế — Driver Mobile Web (E06)

> Domain: `giao-hang-tai-xe` · Backlog: ESKITCHEN-1238 · Phase: 2 · Epic: **E06 — Driver App**
> Repo: `es-kitchen-webapp-driver` (FE) + `es-kitchen-api` (BE)
> **Nguồn duy nhất:** Figma section `DA - update` (`16422:114492`) — page `Driver Moblie Web (P2)_review 可`
> Ngày cập nhật: 2026-09-22 · Version: **v2** (v1 ngày 25/06/2026 lưu tại `versions/v1_25062026/SPEC.md`)

---

> ⚠️ **NGUYÊN TẮC BIÊN SOẠN SPEC NÀY — đọc trước khi dùng**
>
> SPEC này được viết **100% từ nội dung có sẵn trong Figma** `DA - update`: 95 frame màn hình, 48 bảng mô tả item song ngữ JP/VN, 54 connector và 16 flow note.
>
> - ✅ Mọi câu trong SPEC đều trace được về 1 node Figma cụ thể (ghi ID node ở `## Source Register`).
> - ❌ **Không** bổ sung hành vi, validation, message, edge case hay đề xuất nào mà Figma không có.
> - Chỗ nào Figma **không định nghĩa** → ghi thẳng `UNKNOWN — Figma không định nghĩa` và đưa vào `## Open Questions`. Không suy đoán, không lấp chỗ trống.
> - Chỗ nào **chính Figma ghi 「要確認」** (cần xác nhận) → giữ nguyên ghi chú đó, không tự quyết.
> - Text hiển thị cho user giữ nguyên **tiếng Nhật gốc** trong 「」 vì đó là nội dung thật trên app; phần diễn giải nghiệp vụ viết tiếng Việt.

---

## Mô tả nghiệp vụ

App Tài Xế (E06) là **web app mobile** (ReactJS, không phải native/PWA) dành cho tài xế của **công ty vận chuyển được ủy thác**. Tài xế dùng app để thực hiện trọn một ngày làm việc: nhận hàng tại kho → giao hàng đến điểm giao → trưng bày sản phẩm vào tủ lạnh/box tại điểm giao → kiểm tồn kho & đăng ký hàng hủy → thu tiền mặt → báo cáo sự cố khi có vấn đề.

Figma `DA - update` chia nghiệp vụ thành **10 luồng** (theo nhãn Flow note):

| # | Flow note trên Figma | Nội dung |
|---|---|---|
| 1 | 🚀 Login | Đăng nhập bằng `ログインID` + mật khẩu |
| 2 | 🚀 Reset pw | Đặt lại mật khẩu 4 màn qua email + mã 4 chữ số |
| 3 | 🚀 Home | Tiến độ hôm nay + lịch giao hàng 3 ngày |
| 4 | 🚀 My Page | Thông tin cơ bản tài xế (chỉ đọc) + đăng xuất |
| 5 | 🚀 notifications | Danh sách + chi tiết thông báo |
| 6 | 🚀 List SHIP — 配送一覧（DA_LIST_00） | Tra cứu theo khoảng ngày, 3 tab |
| 7 | 🚀 倉庫で受け取る — nhận từ kho | Tick vận đơn nhận tại kho |
| 8 | 🚀 (ES配送便) — Step 1→5 | Quy trình trưng bày 5 bước + màn sau khi hoàn thành |
| 9 | 🚀 COOL配送便 | Giao hàng COOL (không trưng bày) |
| 10 | 🚀 トラブル報告 | Báo cáo sự cố + popup gọi ES Kitchen |

**Ba loại nghiệp vụ giao hàng** (phân biệt bằng màu thẻ trên Home):

| Loại | Màu thẻ | Nội dung công việc |
|---|---|---|
| `倉庫受取` (nhận hàng tại kho) | Cam | Nhận hàng từ kho picking / kho trung chuyển. Là **bước đầu bắt buộc** |
| `COOL便` | Tím | Giao hàng đã nhận tại kho đến điểm giao. Chỉ tick xác nhận đã giao |
| `ES配送便` | Xanh | Giao hàng **+ kiểm tồn kho + đăng ký hàng hủy + trưng bày sản phẩm + thu tiền** — quy trình 5 bước |

**Hai quy tắc nghiệp vụ chi phối toàn app:**

1. **Kho chặn giao hàng** — khi `倉庫受取` còn `未受取`, các đơn COOL便/ES配送便 thuộc kho đó **không hiển thị thành thẻ độc lập** và **không bấm vào được**; chỉ hiện toast 「先に倉庫受取を完了してください。」 (nguồn: bảng `20235:148473` mục 5.6/6.6).
2. **Hoàn thành một phần thì tự tách tag mới** — khi hoàn tất mà còn mục chưa tick, phần đã tick được xử lý là hoàn thành, phần chưa tick **tự sinh một tag mới mang trạng thái `未受取`/`未配送`** để xử lý sau (nguồn: connector `18578:41563` cho kho, `18870:187993` cho COOL便). Điều kiện: **phải đã liên hệ ES Kitchen** (tick checkbox hoặc bấm nút gọi `050-5784-2777`).

App **yêu cầu kết nối mạng liên tục** — Figma không có màn offline nào.

---

## BA Deliverables

| # | Output | Status | Path / URL |
|---|---|---|---|
| 0 | `SPEC.md` (file này) | ✅ Done | `es-kitchen-docs/docs/features/delivery-driver/SPEC.md` |
| 1 | Figma Frame — **Output 1: Flow Tổng Quan + Technology Table + Sitemap WBS** | ✅ Done | [`Output 1 — Flow Tổng Quan + Sitemap WBS — App Tài Xế (E06 P2)`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=32099-49634) · node `32099:49634` · 2280×3216 |
| 2 | Figma Frame — **Output 2: Screen Flow (8 Group + Master Map + Combined Detail + 3 bảng index)** | ✅ Done | [`Output 2 — Screen Flow (Merged Branch) — App Tài Xế (E06 P2)`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=32105-49624) · node `32105:49624` · 3600×5396 |
| 3 | Figma Frame — Screens + Items | ❌ Skipped — user quyết định. Figma gốc `DA - update` đã có đủ 95 mockup + 48 bảng item chi tiết hơn | [Figma `DA - update`](https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16422-114492) |
| 4 | HTML Prototype | ❌ Skipped — user quyết định. Figma gốc đã đóng vai trò prototype | — |

**Downstream instructions:**

| Agent | Đọc phần nào |
|---|---|
| **Tech Lead Design** | `## Screen Details` (validation + error message là contract với BE) · `## Quy tắc trạng thái & quyền sửa` · `## Open Questions` (OQ-08 · OQ-09 · OQ-23 là blocking — chốt trước khi thiết kế) |
| **Designer** | **Không cần vẽ lại** — Figma gốc đã high-fidelity. Chỉ điền cột `Figma Link` trong `## Screens` |
| **QC** | `## Acceptance Criteria` + bảng `Non-Happy Case` từng screen (message thật đã có, dùng assert trực tiếp) + `## Quy tắc trạng thái & quyền sửa` làm test matrix |
| **FE / Mobile Dev** | Đọc trực tiếp Figma node theo cột `Figma Link`; SPEC dùng để tra validation/điều kiện hiển thị |

---

## Source Register

> Mọi statement trong SPEC trace về 1 row dưới. `FACT` = có trong Figma (bảng mô tả / connector / frame). `CONFLICT` = ≥2 node Figma mâu thuẫn. `UNKNOWN` = Figma không định nghĩa hoặc chính Figma ghi 「要確認」.
> **Không có row nào loại `PROPOSAL` hoặc `INFERENCE`** — theo yêu cầu "100% Figma, không tự động thêm".

### Nhóm A — Xác thực

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-A01 | `ログインID`: bắt buộc, 1–255 ký tự, ASCII. Do **công ty vận chuyển ủy thác cấp**. Tương lai có thể đổi sang dạng email | FACT | table `20237:149057` mục 3 |
| RQ-A02 | Mật khẩu: bắt buộc, **≥8 ký tự, ≥1 chữ cái, ≥1 chữ số**, hiển thị `●`, icon mắt toggle `password↔text` | FACT | table `20237:149057` mục 4 / 4.1 |
| RQ-A03 | Validate **toàn bộ field cùng lúc khi bấm nút** (`全入力項目を一括チェック`) | FACT | table `20237:149057` mục 6 |
| RQ-A04 | **Không có tính năng khóa tài khoản** (`ロック機能なし`) | FACT | table `20237:149057` mục 6 |
| RQ-A05 | Reset pw bước 1: đối chiếu **cặp ID + email**; khớp → gửi mã 4 chữ số qua email | FACT | table `20239:150170` mục 5 |
| RQ-A06 | Email: bắt buộc, định dạng `xxx@xxx.xxx`, ≤256 ký tự, ASCII | FACT | table `20239:150170` mục 4 |
| RQ-A07 | Mã xác thực: **4 ô riêng, mỗi ô 1 chữ số, tự chuyển focus**, chỉ nhận số, **hiệu lực 5 phút**; hết hạn **màn hình không đổi trạng thái** | FACT | table `20239:151066` mục 4 |
| RQ-A08 | Nút xác nhận: xám khi chưa đủ 4 số (`DA_AUTHEN_002_02`), active khi đủ (`DA_AUTHEN_002_03`) | FACT | table `20239:151066` mục 5 |
| RQ-A09 | Gửi lại mã: đếm ngược **60 giây** (hiển thị `00:59`), **không giới hạn số lần gửi lại** | FACT | table `20239:151066` mục 6 |
| RQ-A10 | Mật khẩu mới + xác nhận mật khẩu phải **trùng khớp tuyệt đối** | FACT | table `20240:151938` mục 5 |
| RQ-A11 | Sau khi reset xong → nút về Home **vào thẳng màn chính ở trạng thái đã tự động đăng nhập**, không qua màn login | FACT | table `20240:152458` mục 3 |
| RQ-A12 | Màn hoàn tất chỉ hiển thị khi **chuyển hợp lệ từ `DA_AUTHEN_002_04`** | FACT | table `20240:152458` mục 1 |
| RQ-A13 | Nội dung câu thông báo hoàn tất sau 「パスワードリセットに成功しました。」 | UNKNOWN | table `20240:152458` mục 2: 「以降の文言は要確認 ⚠️」 |
| RQ-A14 | Email ở màn nhập mã có mask một phần hay không | UNKNOWN | table `20239:151066` mục 3: 「マスク方式の有無は要確認。⚠️」 |
| RQ-A15 | 「ログイン画面に戻る」 → về `DA_AUTHEN_001`, **dữ liệu đang nhập bị hủy** | FACT | table `20239:150170` mục 6 · `20240:151938` mục 7 |

### Nhóm B — Home / Thông báo / My Page

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-B01 | Header Home: tên tài xế đang đăng nhập + câu cố định 「安全運転でいってらっしゃいませ。」 + icon chuông → màn thông báo | FACT | table `20234:148074` mục 1.1–1.3 |
| RQ-B02 | Khối 本日の配送進捗 **chỉ hiển thị khi có dữ liệu lịch hôm nay**; không có dữ liệu → **ẩn cả khối** | FACT | table `20234:148074` mục 2 |
| RQ-B03 | Tiến độ = ES配送 + COOL配送; **「倉庫から受取」không tính vào** tổng lẫn số hoàn thành | FACT | table `20234:148074` mục 2.1 / 2.2 |
| RQ-B04 | `残り件数 = 本日の配送件数 − 完了件数`; `進捗率 = floor(完了 ÷ 本日件数 × 100)` hiển thị dạng % | FACT | table `20234:148074` mục 2.3 / 2.4 |
| RQ-B05 | Lịch hiển thị **3 ngày**: 「本日（YYYY-M-D）」「明日（YYYY-M-D）」「明後日（YYYY-M-D）」 | FACT | table `20231:148602` mục 3 / 3.1 |
| RQ-B06 | Một ngày không có dữ liệu → 「配送予定データはありません。」 | FACT | table `20231:148602` mục 3.2 · `20224:209135` |
| RQ-B07 | **Cả 3 ngày** không có dữ liệu → hiện nhân vật **SOL ちゃん** + 「お疲れさまです！今のところ配送予定はありません。予定が入りましたら表示されます。」 | FACT | table `20231:148602` mục 3.3 · `20224:209135` |
| RQ-B08 | Thứ tự trong cùng ngày: ①COOL便(未配送) ②ES配送便(未配送) ③倉庫受取(未受取) ④COOL便(トラブル) ⑤ES配送便(トラブル) | FACT | table `20231:148602` mục 3.4 |
| RQ-B09 | Thẻ kho (cam): chỉ hiển thị `未受取`; **`受取済` thì ẩn**. Nội dung: tên kho · địa chỉ · `{n}社 {n}箱（冷蔵）{n}品（冷凍）{n}品` · badge 「未受取」 | FACT | table `20235:148276` mục 4 – 4.4 |
| RQ-B10 | Thẻ kho tap → `DA_RECV_001` | FACT | table `20235:148276` mục 4.5 |
| RQ-B11 | Nút hiện/ẩn chi tiết trên thẻ kho: đang mở 「非表示▲」, đang đóng 「詳細表示▼」 | FACT | table `20235:148276` mục 4.6 |
| RQ-B12 | Khi kho `未受取`: COOL便/ES配送便 **chỉ xuất hiện trong vùng chi tiết của thẻ kho**, không có thẻ độc lập | FACT | table `20235:148276` mục 4.7 · `20224:209135` |
| RQ-B13 | Thẻ COOL便 (tím) / ES配送便 (xanh): chỉ hiển thị `未配送` và `トラブル`; **`配送完了` thì ẩn** | FACT | table `20235:148473` mục 5 / 6 |
| RQ-B14 | Tap thẻ COOL便: thẻ độc lập → `DA_DLVR_001-11`; trong chi tiết kho → **không chuyển màn**, hiện toast | FACT | table `20235:148473` mục 5.6 |
| RQ-B15 | Tap thẻ ES配送便: thẻ độc lập → `DA_DLVR_001-1`; trong chi tiết kho → **không chuyển màn**, hiện toast | FACT | table `20235:148473` mục 6.6 |
| RQ-B16 | Toast chặn: 「先に倉庫受取を完了してください。」 — hiện **phía dưới màn hình ~2–3 giây rồi tự ẩn**, kiểu cảnh báo **màu cam** | FACT | table `20235:148473` mục 5.6 / 6.6 |
| RQ-B17 | Mã màn của ES配送便/COOL便 khi tap từ Home ghi là `DA_DLVR_001-*`, nhưng bảng mô tả chi tiết dùng `DA_ESDL_*` và `DA_COOL_001` | **CONFLICT** | table `20235:148473` mục 5.6/6.6 **vs** table `23134:63310` / `23808:112206` + tên frame |
| RQ-B18 | Thông báo: mỗi thông báo 1 hàng gồm ngày giờ · tiêu đề (link xanh) · chỉ báo chưa đọc; **sắp xếp mới nhất lên đầu**; 0 mục thì ẩn danh sách | FACT | table `20319:242429` mục A.3 |
| RQ-B19 | Ngày giờ theo **JST**: trong ngày 「今日・HH:mm」, ngày khác 「M月D日・HH:mm」; **không hiển thị「昨日」** | FACT | table `20319:242429` mục A.3.1 |
| RQ-B20 | Chấm đỏ chỉ ở thông báo chưa đọc. **Mở màn chi tiết → server cập nhật đã đọc**; quay lại danh sách chấm đỏ ẩn. **Không có chức năng đánh dấu tất cả đã đọc** | FACT | table `20319:242429` mục A.3.3 / B |
| RQ-B21 | 「もっと表示」 chỉ hiện khi còn thông báo chưa tải; **tap hoặc cuộn xuống** đều tải thêm; hết thì **ẩn nút** | FACT | table `20319:242429` mục A.4 |
| RQ-B22 | Số lượng thông báo tải mỗi lần | UNKNOWN | table `20319:242429` mục A.4: 「1回あたりの読込件数は要確認」 |
| RQ-B23 | Danh sách thông báo rỗng → 「データがありません。」 | FACT | table `20319:242429` mục A.5 |
| RQ-B24 | Chi tiết thông báo: tiêu đề · ngày giờ · nội dung **giữ nguyên xuống dòng và đoạn văn**. Giới hạn ký tự do **phía admin** quản lý, app không giới hạn | FACT | table `20319:242429` mục B.2 / B.4 |
| RQ-B25 | Link trong nội dung mở bằng browser ngoài hay WebView trong app | UNKNOWN | table `20319:242429` mục B.5: 「遷移方式は要確認」 |
| RQ-B26 | File đính kèm: định dạng hỗ trợ và cách hiển thị | UNKNOWN | table `20319:242429` mục B.6: 「対応ファイル形式・表示方式は要確認」 |
| RQ-B27 | My Page: 6 trường **chỉ đọc**, thông tin do **delivery admin (E05) nhập**, tài xế không sửa được | FACT | annotation `18870:17324` |
| RQ-B28 | 6 trường: `ログインID` (format `DR00000`) · `メールアドレス` · `配送スタッフ名` · `カナ` (katakana) · `電話番号` · `委託配送先名` (công ty vận chuyển trực thuộc) | FACT | annotation `18870:17310/17318/17311/17329/17334/17339` + frame `16892:78274` |
| RQ-B29 | My Page có nút 「ログアウト」 | FACT | frame `16892:78274` |
| RQ-B30 | Bottom nav 5 tab: ホーム · マニュアル · 配送一覧 · トラブル · アカウント | FACT | frame `16892:78274` |
| RQ-B31 | Tab 「マニュアル」 (Manual) — **không có màn hình nào trong Figma `DA - update`** | UNKNOWN | Quét toàn bộ 95 frame: không có node nào cho Manual |

### Nhóm C — 配送一覧 (Danh sách vận chuyển)

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-C01 | 画面ID `DA_LIST_00`, tên 「配送一覧」, vào từ **thanh điều hướng「配送一覧」** | FACT | table `20274:174991` |
| RQ-C02 | Chú thích icon: **bông tuyết = 冷凍**; **tủ lạnh = 冷蔵・常温（合算）** | FACT | table `20274:174991` phần アイコン凡例 |
| RQ-C03 | `開始日` mặc định **hôm nay**; `終了日` mặc định **hôm nay + 7 ngày**; cả hai chọn được **quá khứ và tương lai** | FACT | table `20275:175065` mục 1.1 / 1.2 |
| RQ-C04 | Ràng buộc: `開始日 ≤ 終了日` **và** `終了日 − 開始日 ≤ 31 ngày`. Message ①「終了日は開始日以降を選択してください。」②「期間は1ヶ月以内で選択してください。」 | FACT | table `20275:175065` mục 1.1 / 1.2 |
| RQ-C05 | Tab A 「倉庫受取」 **được chọn mặc định**; bao gồm **tất cả** trạng thái 未受取・受取済・トラブル | FACT | table `20275:175065` mục A |
| RQ-C06 | Tab B 「未配送」: COOL便・ES配送便 có trạng thái `未配送` **hoặc** `トラブル` | FACT | table `20275:175065` mục B |
| RQ-C07 | Tab C 「配送完了」: COOL便・ES配送便 có trạng thái `配送完了` | FACT | table `20275:175065` mục C |
| RQ-C08 | Tab A: dropdown trạng thái (**chọn đơn**) 未受取・受取済・トラブル; không chọn = hiện tất cả | FACT | table `20285:178257` mục A.1 |
| RQ-C09 | Tab A: search khớp một phần trên `倉庫名`・`中継先`・`納品先拠点名`・`住所`; **xóa input → hiện lại toàn bộ** | FACT | table `20285:178257` mục A.2 |
| RQ-C10 | Tab A: tag loại giao hàng cố định 「倉庫受取」 (tag màu xanh lam) | FACT | table `20285:178257` mục A.3 |
| RQ-C11 | Tab A: tên kho/trung chuyển **hiển thị tối đa 2 dòng rồi rút gọn (…)**; xem đủ ở màn chi tiết | FACT | table `20285:178257` mục A.4 |
| RQ-C12 | Ngày giao định dạng `yyyy-mm-dd（thứ）`, **thứ tính tự động từ ngày** | FACT | table `20285:178257` mục A.5 |
| RQ-C13 | Badge màu: `未受取` cam · `受取済` xanh lá · `トラブル` đỏ (Tab A); `未配送` cam · `トラブル` đỏ (Tab B); **chỉ** `配送完了` xanh lá (Tab C) | FACT | table `20285:178257` A.6 · `20297:178978` B6 · `20297:179370` C6 |
| RQ-C14 | Tab A: `集計 社数` = tổng số công ty giao hàng tại kho đó, định dạng `{n}社` | FACT | table `20285:178257` mục A.8 |
| RQ-C15 | Tab A: `集計 箱数` định dạng `{n}箱`; **chưa import mã vận đơn / chưa biết số thùng → ẨN field này** | FACT | table `20285:178257` mục A.9 |
| RQ-C16 | Số lượng hàng theo thời điểm: **tương lai** `{số đặt}個（予定）` · **hôm nay/quá khứ đã picking** `{thực tế}箱` · **chưa picking** `未確定` | FACT | table `20285:178257` mục A.10 / A.11 |
| RQ-C17 | Tab B/C: dropdown kho・trung chuyển (**chọn nhiều**), danh sách tham chiếu master; không chọn = hiện tất cả | FACT | table `20297:178978` mục B1 |
| RQ-C18 | Tab B/C: search tự do trên `納品先拠点名`・`住所`, 0–255 ký tự, **phải nhấn Enter** mới chạy | FACT | table `20297:178978` mục B2 |
| RQ-C19 | Tab B/C: tên điểm giao **dài thì xuống dòng hiển thị toàn bộ** (khác Tab A rút gọn) | FACT | table `20297:178978` mục B3 |
| RQ-C20 | Tab B/C: địa chỉ hiển thị **đầy đủ** gồm tên tòa nhà・tầng・tên công ty・phòng ban | FACT | table `20297:178978` mục B8 |
| RQ-C21 | Tab B/C: `箱数` — tương lai `{n}箱（予定）` · đã picking `{thực tế}箱` · **chưa picking → ẩn** | FACT | table `20297:178978` mục B9 |
| RQ-C22 | Tab B/C: `品数` (mát/thường, đông lạnh) chỉ hiện khi **>0 VÀ (đã picking HOẶC dữ liệu tương lai)** | FACT | table `20297:178978` mục B10 / B11 |
| RQ-C23 | Tab C 「タブBと同仕様」 — mọi mục B1–B11 dùng chung thông số, chỉ khác badge | FACT | table `20297:179370` mục C1–C11 |
| RQ-C24 | Phân trang / trần số bản ghi mỗi lần tải ở 配送一覧 | UNKNOWN | Figma không mô tả pagination ở cả 3 tab |
| RQ-C25 | Empty state của 3 tab 配送一覧 khi khoảng ngày không có bản ghi | UNKNOWN | Figma không có màn empty cho 配送一覧 |

### Nhóm D — 荷物受取 (Nhận hàng tại kho)

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-D01 | Nút back: **0 thao tác checkbox → về màn trước ngay**; **≥1 thao tác → popup xác nhận hủy chỉnh sửa** | FACT | table `20338:264152` mục A.1 |
| RQ-D02 | Tiêu đề 「荷物受取」 cố định giữa header | FACT | table `20338:264152` mục A.2 |
| RQ-D03 | Tên kho xuất hàng (vd 「オージーフーズ倉庫」), lấy từ API | FACT | table `20338:264152` mục A.3 |
| RQ-D04 | Ngày giao `yyyy-mm-dd`; **tất cả mục cùng ngày, không có giờ cụ thể** | FACT | table `20338:264152` mục A.4 |
| RQ-D05 | `伝票番号` hiển thị nguyên từ dữ liệu import — **không giới hạn định dạng hay độ dài** | FACT | table `20338:264152` mục A.5 |
| RQ-D06 | 「未受取のみ表示」 checkbox: ON → lọc **realtime phía client** chỉ mục `未受取`; OFF → hiện tất cả | FACT | table `20338:264152` mục A.7 |
| RQ-D07 | Search 「納品先名」: lọc realtime **phía client**, **tối đa 100 ký tự — chặn input**, placeholder 「納品先名」 | FACT | table `20338:264152` mục A.8 |
| RQ-D08 | Checkbox nhận từng mục — **chỉ chọn từng mục, KHÔNG có nút chọn tất cả**. Thao tác ≥1 mục = trạng thái「đang chỉnh sửa」 | FACT | table `20338:264152` mục A.9 |
| RQ-D09 | Badge trạng thái 3 loại: ①`未受取` (ban đầu, chưa check) ②`受取済` (đã check) ③`トラブル` (báo cáo sự cố thủ công từ chức năng khác — **độc lập với checkbox**) | FACT | table `20338:264152` mục A.10 |
| RQ-D10 | Nút 「完了」: active khi **≥1 mục đã check**; chưa check → **vô hiệu/grayout, KHÔNG có thông báo lỗi** | FACT | table `20338:264152` mục A.13 |
| RQ-D11 | Bấm 完了 khi **tất cả đã check** → **không hiện modal**, hiện toast | FACT | table `20338:264152` mục A.13 ① |
| RQ-D12 | Bấm 完了 khi **còn mục chưa check** → hiện modal xác nhận | FACT | table `20338:264152` mục A.13 ② |
| RQ-D13 | Toast: 「荷物の受取は完了しました。」 — **tự ẩn sau 5 giây**, sau đó **chuyển về màn Home** | FACT | table `20343:265007` mục C.1 |
| RQ-D14 | Modal xác nhận: tiêu đề 「荷物の受取は完了しましたか？」 + icon kiện hàng + 「一部の荷物が未確認の状態です。すべて受取していない場合は、ESキッチンまでご連絡ください。」 | FACT | table `20338:264153` mục B.1 / B.2 / B.3 |
| RQ-D15 | Checkbox 「未受取分は、ESキッチンへ連絡済みです。」 — ban đầu chưa check, **tự động check khi bấm nút gọi ES** | FACT | table `20338:264153` mục B.4 |
| RQ-D16 | Nút 「ESへ電話する（050-5784-2777）」 — mở app điện thoại; **đồng thời tự check B.4 và kích hoạt nút hoàn thành** | FACT | table `20338:264153` mục B.5 |
| RQ-D17 | Nút 「一部保留のまま完了」: ban đầu grayout; active khi **B.4 đã check HOẶC B.5 đã bấm** (điều kiện OR); bấm → hoàn thành dù còn mục chưa nhận → **chuyển về Home** | FACT | table `20338:264153` mục B.6 |
| RQ-D18 | Nút 「キャンセル」 trong modal → đóng modal, về màn chi tiết, **trạng thái check được giữ nguyên** | FACT | table `20338:264153` mục B.7 |
| RQ-D19 | Popup hủy chỉnh sửa: 「編集内容を破棄しますか？」 + 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」 | FACT | table `20343:265007` mục D.1 / D.2 |
| RQ-D20 | Popup: 「キャンセル」 → giữ nguyên trạng thái check + nội dung nhập; 「破棄」 → **xóa toàn bộ** và về màn trước | FACT | table `20343:265007` mục D.3 / D.4 |
| RQ-D21 | **Nhận một phần**: 「倉庫：受取済み分は完了として扱う。未受取分は別の倉庫タグを自動生成する。新規生成された倉庫タグは「未受取」として管理する」 | FACT | connector `18578:41563` |
| RQ-D22 | Quyền sửa màn chi tiết nhận hàng: `未受取`(hôm nay) → **sửa được** (check + nút 完了); `受取済`・`トラブル`・quá khứ・tương lai → **chỉ đọc** | FACT | table `20285:178257` mục A.12 |
| RQ-D23 | Nội dung cụ thể của `DA_RECV_003` | UNKNOWN | Figma có symbol `20262:41179` tên `DA_RECV_003` nhưng **không có bảng mô tả riêng** |

### Nhóm E — ES配送便 (quy trình trưng bày 5 bước)

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-E01 | Tab thông tin cơ bản hiển thị: tên điểm giao · ngày giao `yyyy-mm-dd（曜日）` · badge trạng thái · mã bưu chính · địa chỉ · người phụ trách · số điện thoại · ghi chú giao hàng · tóm tắt số thùng · danh sách vận đơn | FACT | table `23134:63310` mục A.3–A.13 |
| RQ-E02 | Badge 3 loại: `未配送` (chưa nhận/ban đầu) · `配送完了` (đã check hoàn tất) · `トラブル` (báo cáo thủ công từ chức năng khác — **độc lập với checkbox**) | FACT | table `23134:63310` mục A.5 |
| RQ-E03 | `納品備考` hiển thị trong **khung nhấn mạnh riêng (hộp thông tin có icon)** — ghi chỉ dẫn địa điểm nhận・cách nhận・liên hệ・điểm đặc biệt | FACT | table `23134:63310` mục A.11 |
| RQ-E04 | Tóm tắt: 「〇箱」(tổng thùng) /「〇品」+icon lạnh /「〇品」+icon đông | FACT | table `23134:63310` mục A.12 |
| RQ-E05 | Danh sách vận đơn hiển thị **kèm số thứ tự, không thể chạm** | FACT | table `23134:63310` mục A.13 |
| RQ-E06 | Nút 「陳列を開始する」: **chỉ hiện khi `未配送` VÀ là đơn giao trong ngày hôm nay**; đơn tương lai → **không hiện**. Bấm → Step 1 | FACT | table `23134:63310` mục A.14 |
| RQ-E07 | Thanh tiến trình 5 bước: ①陳列前 ②在庫/廃棄 ③陳列 ④陳列後 ⑤完了. **Không chạm để di chuyển** — chỉ bằng nút 「戻る」「続ける」. Trạng thái: hoàn thành = tròn xanh + ✓ + chữ xanh · hiện tại = tròn xanh + số + chữ xanh · chưa hoàn thành = tròn xám + số + chữ xám | FACT | table `23266:36257` mục 2.1 |
| RQ-E08 | **Step 1 陳列前**: 「冷蔵庫・ボックス内の陳列前写真をアップロードしてください。」; ảnh **tối thiểu 1, tối đa 20**; chưa tải → 「写真はまだありません」+ placeholder; đang tải → 「loading」 | FACT | table `23266:36257` mục 3.1 / 3.2 |
| RQ-E09 | Định dạng ảnh **JPEG/PNG/HEIC/WebP (đề xuất)**, **tối đa 10MB/file (đề xuất)** — Figma ghi rõ chữ 「（提案）」 | FACT | table `23266:36257` mục 3.4 |
| RQ-E10 | Message lỗi ảnh: 「対応していないファイル形式です」「ファイルサイズは10MB以下にしてください」「写真は最大20枚までです」 | FACT | table `23266:36257` mục 3.4 |
| RQ-E11 | Nút xóa ảnh (×) ở **góc trên phải mỗi thumbnail**; **thay ảnh = xóa rồi tải lại** | FACT | table `23266:36257` mục 3.3 |
| RQ-E12 | Nút chọn file khởi động **camera hoặc chọn file trong máy** | FACT | table `23266:36257` mục 3.4 |
| RQ-E13 | Liên hệ khẩn cấp (mọi step): 「※ご不明な点は弊社代表番号で、緊急連絡先の「050-5784-2777」までお願いします。」 | FACT | table `23266:36257` mục 4.1 · `24942:90741` mục 4 |
| RQ-E14 | Step 1: nút 「続ける」 **chỉ active khi đã tải ≥1 ảnh**; chưa tải → grayout | FACT | table `23266:36257` mục 5.2 |
| RQ-E15 | **Step 2 在庫/廃棄**: tiêu đề 「廃棄登録と実在庫の確認」 + 「廃棄数を確認のうえ、残りの実在庫を確認してください。確認が完了した商品は、チェックしてください。※検索または商品スキャンからも廃棄登録できます。」 | FACT | table `23335:36257` mục 3.1 / 3.2 |
| RQ-E16 | Step 2 search: khớp một phần **tên hoặc mã sản phẩm (barcode)**, lọc realtime trong màn | FACT | table `23335:36257` mục 4.1 |
| RQ-E17 | Nút quét mã vạch: **sản phẩm không có trên danh sách vẫn đăng ký hủy được bằng quét**; sau quét → hiện modal đăng ký hủy | FACT | table `23335:36257` mục 4.2 |
| RQ-E18 | 「※次回納品日 〇月〇日」 hệ thống tự động hiển thị | FACT | table `23335:36257` mục 4.3 |
| RQ-E19 | Có hiển thị năm trong 次回納品日 hay không | UNKNOWN | table `23335:36257` mục 4.3: 「年表示の有無は要確認」 |
| RQ-E20 | 「未確認のみ表示」 checkbox: ON → chỉ hiện sản phẩm cột 確認 **chưa tích** | FACT | table `23335:36257` mục 4.4 |
| RQ-E21 | Step 2 mỗi dòng: `確認` checkbox — khi bật thì **nút −/＋ và ô nhập 廃棄数・実在庫 cùng dòng bị vô hiệu (grayout)**; sản phẩm đăng ký hủy bằng scan **tự động bật** | FACT | table `23335:36257` mục 5.2 |
| RQ-E22 | `理論在庫`: số tồn **dựa trên thực tế mua hàng**, giá trị hệ thống tính. Tooltip 「理論在庫：購入実績ベースの在庫数です。」 | FACT | table `23335:36257` mục 5.3 |
| RQ-E23 | `廃棄数（△）`: số nguyên ≥0, nút −/＋ hoặc nhập trực tiếp. Tooltip 「次回納品日までに賞味期限切れとなる商品を回収後、数量を入力してください。」 Thay đổi → **tự tính lại 実在庫** | FACT | table `23335:36257` mục 5.4 |
| RQ-E24 | `実在庫（廃棄後）` = `理論在庫 − 廃棄数` **tự động tính, vẫn sửa thủ công được**. Tooltip 「実在庫＝理論在庫−廃棄数（自動計算されます。手動で変更可能）」 | FACT | table `23335:36257` mục 5.5 |
| RQ-E25 | Message lỗi Step 2: 「廃棄数は0以上の整数で入力してください」「実在庫は0以上の整数で入力してください」 | FACT | table `23335:36257` mục 5.4 / 5.5 |
| RQ-E26 | Step 2 nút 「確認」: **chỉ active khi TẤT CẢ sản phẩm đều đã tích 確認**; chưa xong → grayout. Bấm → Step 3 | FACT | table `23335:36257` mục 6.2 |
| RQ-E27 | Step 2 nút 「戻る」 → về Step 1. **Việc giữ lại dữ liệu đã nhập chưa xác nhận** | UNKNOWN | table `23335:36257` mục 6.1: 「入力データ保持の有無は要確認」 |
| RQ-E28 | Modal quét mã hủy: 商品名 (chỉ đọc) · 「論理在庫：〇個」 · 廃棄数 (≥0) · 在庫数 (≥0) · nút 「続けてスキャンする」 · nút 「一覧に戻る」. Cả 2 nút đều **lưu nội dung**; sản phẩm đã đăng ký **tự bật 確認** | FACT | table `25152:42096` mục 7.1–7.6 |
| RQ-E29 | Step 2 màn thành công: **banner xanh lá trên cùng** — icon ✓ + 「在庫/廃棄が成功しました。」 + thời gian xử lý định dạng `yyyy年mm月dd日HH時mm分` | FACT | table `24731:177078` mục 1.3 |
| RQ-E30 | Step 2 màn thành công: bảng tóm tắt 連番 · 商品名 · 廃棄数（△） · 実在庫; nút 戻る → Step 2, nút 続ける → Step 3 | FACT | table `24731:177078` mục 3.1–3.5 / 4.1 / 4.2 |
| RQ-E31 | **Step 3 陳列**: mỗi dòng có `確認` checkbox (bật → vô hiệu ô 実際数 cùng dòng; scan → tự bật) · `商品名 + 予定数：〇個` (hệ thống tự hiển thị, không chạm được) · `実際数` số nguyên ≥0, **giá trị ban đầu = 予定数** | FACT | table `23451:37606` mục 4.1–4.3 |
| RQ-E32 | Step 3: `実際数 ≠ 予定数` → **coi là chênh lệch**, là đối tượng popup liên hệ ES khi xác nhận | FACT | table `23451:37606` mục 4.3 |
| RQ-E33 | Step 3 nút 「戻る」 → về Step 2, **dữ liệu đã nhập được giữ lại** | FACT | table `23451:37606` mục 5.1 |
| RQ-E34 | Step 3 nút 「確認」 active khi **≥1 dòng đã tích**; bấm → nếu **①có SP chưa xác nhận HOẶC ②có ≥1 chênh lệch** → popup liên hệ ES; **①② đều không** → chuyển thẳng màn thành công | FACT | table `23451:37606` mục 5.2 |
| RQ-E35 | Điều kiện hiện popup Step 3 ghi ở connector là 「未チェックの項目が1件以上ある場合 / すべての差異が0以外」, khác diễn đạt với bảng mục 5.2 (「差異が1件以上」) | **CONFLICT** | connector `23371:142972` **vs** table `23451:37606` mục 5.2 |
| RQ-E36 | Modal quét kiểm phẩm: 商品名 · 「注文個数：〇個」 · 実際数 (≥0) · 「続けてスキャンする」 · 「一覧に戻る」; sản phẩm đã đăng ký **tự bật 確認** | FACT | table `23497:38196` mục 6.1–6.5 |
| RQ-E37 | Quét mã thì **tự động tích** 確認 | FACT | connector `18681:12739` 「Scanで入力した場合、自動チェックが入ります。」 · `23371:142973` |
| RQ-E38 | Popup chênh lệch Step 3: 「荷物の陳列は完了しましたか？」+「一部の荷物が未確認の状態、または差異が発生しております。」+「ESキッチンまで連絡する必要があります。」 | FACT | table `23514:38197` mục 7.1 |
| RQ-E39 | Popup chênh lệch: checkbox 「ESキッチンへ連絡済みです。」 **BẮT BUỘC** — bật thì nút 「報告完了」 mới active | FACT | table `23514:38197` mục 7.2 / 7.4 |
| RQ-E40 | Popup chênh lệch có nút 「ESへ電話する（050-5784-2777）」 | FACT | table `23514:38197` mục 7.3 |
| RQ-E41 | 「報告完了」 → thực hiện hoàn tất trưng bày → màn thành công Step 3. 「キャンセル」 → đóng popup, về màn trưng bày, **không thực hiện xử lý** | FACT | table `23514:38197` mục 7.4 / 7.5 |
| RQ-E42 | Step 3 màn thành công: bảng 連番 · 商品 (dài thì rút gọn `…`) · 予定数 · 実際数 · 差異 | FACT | table `24891:96525` mục 3.1–3.5 |
| RQ-E43 | Cột 差異 = `予定数 − 実際数` tự động tính. **Màu: 0 = đen · giá trị âm (thực tế NHIỀU hơn dự kiến) = cam · giá trị dương (thực tế ÍT hơn dự kiến) = xanh lá** | FACT | table `24891:96525` mục 3.5 |
| RQ-E44 | Step 3 màn thành công hiển thị sau khi bấm 「確定」 (không chênh lệch) **hoặc** 「報告完了」 (có chênh lệch, đã liên hệ ES) | FACT | table `24891:96525` header |
| RQ-E45 | **Step 4 陳列後**: khu vực tải ảnh **tối thiểu 1, tối đa 20**; cùng thông số định dạng/kích thước/nút xóa như Step 1; nút 「続ける」 chỉ active khi ≥1 ảnh → Step 5 | FACT | table `24942:90741` mục 3.1–3.3 / 5.2 |
| RQ-E46 | Step 4 nút 「戻る」 → về **Step 3 màn thành công** | FACT | table `24942:90741` mục 5.1 |
| RQ-E47 | **Step 5 集金登録**: `集金予定額` hệ thống tự hiển thị, **không sửa (nền xám)**, định dạng phân cách 3 chữ số + 「円」 (vd `10,000 円`) | FACT | table `23559:38617` mục 3.1 |
| RQ-E48 | `実集金額`: tài xế nhập thủ công, **giá trị ban đầu 0**, số nguyên **0–999,999**, phân cách 3 chữ số + 「円」 | FACT | table `23559:38617` mục 3.2 |
| RQ-E49 | `実集金額` chưa nhập (vẫn 0) hoặc khác `集金予定額` → **hiện cảnh báo VÀ thông báo cho admin**; **sau cảnh báo vẫn bấm 完了 được** | FACT | table `23559:38617` mục 3.2 |
| RQ-E50 | Message Step 5: 「実集金額は0〜999,999の整数で入力してください」 · cảnh báo 「実集金額が未入力、または集金予定額と一致しません。ご確認ください。」 | FACT | table `23559:38617` mục 3.2 |
| RQ-E51 | Step 5 nút 「完了」: **luôn active**; bấm → hoàn tất toàn bộ quy trình, **KHÔNG hiện hộp thoại xác nhận**, cập nhật trạng thái thành `配送完了`, quay về màn chi tiết ES配送便 | FACT | table `23559:38617` mục 3.3 |
| RQ-E52 | Banner hoàn tất: **chỉ hiện khi đã xong cả 5 bước và bấm 完了 ở bước cuối**. Banner xanh lá ngay dưới header: icon ✓ + 「荷物の配送は完了しました。」 + thời gian `yyyy年mm月dd日HH時mm分` | FACT | table `23244:36210` |
| RQ-E53 | **Tab 陳列情報 (sau hoàn thành)**: chỉ truy cập được **sau khi hoàn tất 5 bước**; step nav 1–5 **chạm để xem lại nội dung từng bước**; trạng thái: đang chọn = tròn xanh + số; chưa chọn (đã hoàn thành) = tròn xanh + ✓ | FACT | table `23747:111658` mục 7.1 |
| RQ-E54 | Nội dung xem lại: ①陳列前 = thumbnail ảnh (chạm phóng to) · ②在庫/廃棄 = bảng 商品名/廃棄数/実在庫 · ③陳列 = bảng 商品名/予定数/実際数/差異 · ④陳列後 = thumbnail ảnh · ⑤集金登録 = 集金予定額/実集金額 | FACT | table `23747:111658` mục 7.3–7.7 |
| RQ-E55 | Nút 「編集」: **chỉ hiện trong vòng 7 ngày sau khi giao hàng hoàn tất**; bấm → màn chỉnh sửa của **bước đang xem**; **quá 7 ngày → ẩn (chỉ xem)** | FACT | table `23747:111658` mục 8 |
| RQ-E56 | **駐車報告 (chế độ chỉ đọc)**: tiêu đề 「駐車報告」 · icon ✏️ (chỉ hiện ở chế độ chỉ đọc, **vẫn hiện nếu trong 7 ngày sau hoàn tất**) · ảnh hóa đơn đã đăng ký (chưa có → placeholder 「領収書をアップロード」) · phí đỗ xe (chưa có → 「0 円」) | FACT | table `23693:39294` mục 7.1–7.4 |
| RQ-E57 | **駐車報告 (chế độ chỉnh sửa)**: icon × hủy (**không hiện hộp thoại xác nhận**) · icon 💾 lưu (**ảnh hóa đơn bắt buộc, chưa có thì không lưu được**) | FACT | table `23698:40099` mục 7.1 / 7.2 |
| RQ-E58 | Ảnh hóa đơn: **bắt buộc, tối đa 1 ảnh**, camera hoặc file trong máy, JPEG/PNG/HEIC/WebP, tối đa 10MB; tải rồi vẫn xóa・thay được | FACT | table `23698:40099` mục 7.3 |
| RQ-E59 | Phí đỗ xe: tùy chọn, số nguyên **0–999,999**, giá trị ban đầu 0, phân cách 3 chữ số + 「円」 | FACT | table `23698:40099` mục 7.4 |
| RQ-E60 | Message 駐車報告: 「レシート画像をアップロードしてください」「対応していないファイル形式です」「ファイルサイズは10MB以下にしてください」「駐車料金は0〜999,999の整数で入力してください」 | FACT | table `23698:40099` mục 7.2–7.4 |
| RQ-E61 | Quyền sửa ES配送便 theo thời điểm: **trong 7 ngày → sửa được** (nút 陳列を開始する / 編集); **quá 7 ngày → chỉ đọc**; `トラブル`・dữ liệu tương lai → **chỉ đọc** | FACT | table `20297:178978` mục B12 · `20297:179370` mục C12 |
| RQ-E62 | Có 4 connector ghi 「Step 1 edit」「Step 2 edit」「Step 3 edit」「Step 5 edit」 — **không có 「Step 4 edit」** | FACT | connector `18870:15080/15085/15090/15100` |

### Nhóm F — COOL配送便

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-F01 | Tiêu đề màn hiển thị 「COOL便」 hoặc 「荷物受取」 | FACT | table `23808:112206` mục 2 |
| RQ-F02 | Thông tin hiển thị: tên điểm giao · ngày giao · badge trạng thái · mã bưu chính (vd `151-0051`, **kèm dấu gạch ngang, nguyên giá trị master**) · địa chỉ · người phụ trách · số điện thoại · 納品備考 · tóm tắt số thùng | FACT | table `23808:112206` mục 3–12 |
| RQ-F03 | Badge 3 loại giống ES配送便: `未配送` · `配送完了` · `トラブル` (độc lập với checkbox) | FACT | table `23808:112206` mục 5 |
| RQ-F04 | Danh sách vận đơn **không thể chạm**; mỗi vận đơn có **checkbox xác nhận nhận hàng** riêng — xác nhận đã giao hàng cho company | FACT | table `23808:112206` mục 13 / 14 |
| RQ-F05 | Nút 「完了」: hiện khi `未配送` **và là đơn giao trong ngày**; active khi tích ≥1, disable khi 0 | FACT | table `23808:112206` mục 15 |
| RQ-F06 | Bấm 完了: **tích hết** → xử lý hoàn tất trực tiếp → về Home + toast thành công; **tích một phần** → popup 「荷物の配送は完了しましたか？」 | FACT | table `23808:112206` mục 15 |
| RQ-F07 | Đơn COOL便 **ngày tương lai** có hiện nút 完了 hay không | UNKNOWN | table `23808:112206` mục 15: 「未来日の配送での表示有無は要確認」 |
| RQ-F08 | Popup COOL便: icon × đóng · 「荷物の配送は完了しましたか？」+「一部の荷物が未確認の状態です。すべて配送していない場合は、ESキッチンまでご連絡ください。」 | FACT | table `23808:112820` mục 2.1 / 2.2 |
| RQ-F09 | Checkbox 「未配送分は、ESキッチンへ連絡済みです。」 **BẮT BUỘC**; tích **hoặc** sau khi bấm 「ESへ電話する」 → nút 「一部未配送のまま完了」 active | FACT | table `23808:112820` mục 2.3 / 2.4 |
| RQ-F10 | **Hoàn tất một phần COOL便**: kiện đã tích = 「完了」; kiện chưa tích → **tự động tạo tag giao hàng COOL便 MỚI trạng thái `未配送`**; sau xử lý → về Home + toast | FACT | table `23808:112820` mục 2.5 · connector `18870:187993` |
| RQ-F11 | Nút 「キャンセル」 trong popup → đóng, về màn chi tiết, **không thực hiện xử lý** | FACT | table `23808:112820` mục 2.6 |
| RQ-F12 | Toast COOL便: 「荷物配達完了しました。」 hiện **trên cùng màn Home**, đóng bằng nút × | FACT | table `23808:113126` mục 3.1 |
| RQ-F13 | **Banner khi mở lại**: sau khi hoàn tất, mở lại màn chi tiết COOL便 → banner 「荷物の配送は完了しました。」 | FACT | table `23808:113126` mục 3.2 |
| RQ-F14 | Điều kiện kích hoạt nút: 「以下のいずれかの条件を満たした場合、本ボタンを活性化する。チェックボックスにチェックしている / ESへ電話連絡を行っている」 | FACT | connector `18571:187374` · `18870:187992` |

### Nhóm G — トラブル報告 (Báo cáo sự cố)

| ID | Statement | Class | Evidence (Figma node) |
|---|---|---|---|
| RQ-G01 | Popup gọi ES hiển thị khi: **bấm tab 「トラブル」 trên bottom nav ở Home**, **hoặc** bấm **icon chuông ở góc trên phải header** của các màn 荷物受取 / ES配送便 chi tiết / COOL便 chi tiết | FACT | table `23983:41426` header |
| RQ-G02 | Popup gọi ES: hình mascot (kèm dấu ？) + 「ESキッチンへ電話しますか？」 | FACT | table `23983:41426` mục 1.1 |
| RQ-G03 | Checkbox 「ESキッチンへ連絡済みです。」 — **dùng để ghi nhận tình trạng liên hệ** | FACT | table `23983:41426` mục 1.2 |
| RQ-G04 | Nút 「ESへ電話する（050-5784-2777）」 → gọi điện | FACT | table `23983:41426` mục 1.3 |
| RQ-G05 | Nút 「トラブル報告へ」 → chuyển sang màn báo cáo sự cố (レポート報告) | FACT | table `23983:41426` mục 1.4 |
| RQ-G06 | Nút 「戻る」 → đóng popup, về màn Home | FACT | table `23983:41426` mục 1.5 |
| RQ-G07 | Màn chọn điểm giao: tiêu đề 「トラブル報告」 + mục 「配達一覧」 | FACT | table `24042:41580` mục 2.2 / 2.3 |
| RQ-G08 | Search: khớp một phần theo **tên kho・tên điểm giao・số vận đơn**; lọc **realtime trong màn** | FACT | table `24042:41580` mục 2.4 |
| RQ-G09 | Văn bản hướng dẫn: 「※影響を受けた拠点を選択してください。」「※複数の拠点でトラブルが発生している場合は、それぞれの拠点ごとに登録してください。」「※未配送の注文のみ表示されます。」 | FACT | table `24042:41580` mục 2.5 |
| RQ-G10 | Icon loại giao hàng **3 màu**: xanh = ES配送便 · tím = COOL便 · **cam = kho** | FACT | table `24042:41580` mục 2.6 |
| RQ-G11 | Badge **2 loại** ở màn này: `未配送` · `未受取` | FACT | table `24042:41580` mục 2.8 |
| RQ-G12 | `所属倉庫名` **chỉ hiển thị với card điểm giao (ES配送便/COOL便)**, không có ở card kho | FACT | table `24042:41580` mục 2.9 |
| RQ-G13 | Tóm tắt hàng hóa: 「〇箱」「〇品(lạnh)」「〇品(đông)」; **riêng card kho hiển thị thêm 「〇社」** | FACT | table `24042:41580` mục 2.11 |
| RQ-G14 | Radio button: **chỉ chọn 1** điểm giao/kho. Sau khi chọn → hiện nút 「戻る」「次へ」. **Chọn kho → hiển thị các đơn chưa nhận VÀ chưa giao thuộc kho đó** | FACT | table `24042:41580` mục 2.12 |
| RQ-G15 | Nút 「戻る」 (sau khi chọn) → về Home; nút 「次へ」 active màu xanh → màn báo cáo chi tiết của điểm đã chọn | FACT | table `24042:41580` mục 2.13 / 2.14 |
| RQ-G16 | Màn chi tiết báo cáo hiển thị thông tin điểm giao đã chọn: icon loại · tên điểm · địa chỉ · số thùng · số hàng lạnh/đông | FACT | table `24076:42158` mục 3.3 |
| RQ-G17 | Checkbox chọn tất cả ở **góc trên phải thẻ điểm giao**: bật = chọn tất cả vận đơn bên dưới, tắt = bỏ hết; **chọn một phần → trạng thái trung gian (−)** | FACT | table `24076:42158` mục 3.4 |
| RQ-G18 | Checkbox vận đơn: tích riêng lẻ, **chọn nhiều được**, **bắt buộc ≥1** (điều kiện tiên quyết). Lỗi: 「影響を受けた注文を1件以上選択してください」 | FACT | table `24076:42158` mục 3.6 |
| RQ-G19 | Văn bản hướng dẫn 「※影響を受けた注文を選択してください」 | FACT | table `24076:42158` mục 3.7 |
| RQ-G20 | Radio nội dung sự cố **bắt buộc, chọn 1** trong 4: `箱数不足` (thiếu thùng) · `誤配送` (giao sai) · `荷物破損` (hàng hư hỏng) · `その他` (khác). Lỗi: 「トラブル内容を選択してください」 | FACT | table `24076:42158` mục 3.8 |
| RQ-G21 | Ô nhập lý do: **chỉ hiện khi chọn `その他`**, bắt buộc, 1–255 ký tự, placeholder 「理由を入力してください」, **viền đỏ nhấn mạnh**. Lỗi: 「理由を入力してください」「理由は255文字以内で入力してください」 | FACT | table `24076:42158` mục 3.9 |
| RQ-G22 | Upload ảnh sự cố: **tùy chọn**, 0–20 ảnh, camera hoặc file trong máy, **JPEG/PNG/HEIC/WebP**, **tối đa 10MB/file**; chưa tải → 「写真はまだありません」+ placeholder | FACT | table `24076:42158` mục 3.10 |
| RQ-G23 | Message lỗi ảnh sự cố: 「対応していないファイル形式です」「ファイルサイズは10MB以下にしてください」「写真は最大20枚までです」 | FACT | table `24076:42158` mục 3.10 |
| RQ-G24 | Nút xóa ảnh (×) góc trên phải thumbnail; **thay ảnh = xóa rồi tải lại** | FACT | table `24076:42158` mục 3.11 |
| RQ-G25 | 備考 (ghi chú): tùy chọn, 0–500 ký tự, **nhập nhiều dòng**. Lỗi: 「備考は500文字以内で入力してください」 | FACT | table `24076:42158` mục 3.13 |
| RQ-G26 | Nút 「戻る」 ở màn chi tiết → về màn chọn điểm giao, **nội dung đã nhập bị hủy** | FACT | table `24076:42158` mục 3.14 |
| RQ-G27 | Nút 「送信」: **chỉ active khi đã chọn ≥1 vận đơn VÀ đã chọn nội dung sự cố**; chưa xong → disable (xám). Bấm → popup xác nhận gửi | FACT | table `24076:42158` mục 3.15 |
| RQ-G28 | Modal xác nhận gửi: mascot + 「この内容で報告を送信しますか？」 + 「送信後、対象の荷物は操作できなくなります。ESキッチンの確認・対応までお待ちください。」 | FACT | table `24084:42989` mục 4.1 |
| RQ-G29 | Nút 「報告する」 → gửi báo cáo; thành công → **trạng thái đơn tự cập nhật thành `トラブル`**, chuyển về Home + toast thành công. Validate **phía server** | FACT | table `24084:42989` mục 4.2 |
| RQ-G30 | Nút 「キャンセル」 → đóng popup, về màn báo cáo chi tiết, **không gửi** | FACT | table `24084:42989` mục 4.3 |
| RQ-G31 | Toast thành công: 「報告を送信しました。」 hiện **trên cùng màn Home**, đóng bằng nút × | FACT | table `24084:42990` mục 5.1 |
| RQ-G32 | Sau khi báo cáo: badge thẻ đơn trên Home tự cập nhật thành `トラブル` **(màu đỏ)**; **kiện hàng liên quan KHÔNG thao tác được**, chờ ES Kitchen xác nhận・xử lý | FACT | table `24084:42990` mục 5.2 |

### Nhóm H — Gap toàn hệ thống (Figma không định nghĩa)

| ID | Statement | Class | Evidence |
|---|---|---|---|
| RQ-H01 | Message và hành vi khi **mất mạng** (mọi màn) | UNKNOWN | Quét 48 bảng: không có row nào thuộc nhóm Network |
| RQ-H02 | Message và hành vi khi **server lỗi 500 / maintenance** | UNKNOWN | Quét 48 bảng: không có row nào thuộc nhóm Server error |
| RQ-H03 | Hành vi khi **JWT/session hết hạn** giữa lúc đang dùng app | UNKNOWN | Không có màn 「セッション切れ」 trong 95 frame |
| RQ-H04 | Cơ chế **refresh dữ liệu** khi admin đổi lịch/trạng thái trong lúc tài xế đang xem (pull-to-refresh / polling / WebSocket) | UNKNOWN | Figma không mô tả; không có icon refresh trên bất kỳ màn nào |
| RQ-H05 | Hành vi khi **truy cập trực tiếp URL** một màn không hợp lệ (vd `/reset-password/complete` mà chưa qua bước 3) | UNKNOWN | Figma chỉ ghi điều kiện hiển thị, không ghi hành vi chặn |
| RQ-H06 | Đường dẫn URL của các màn ngoài luồng `DA_AUTHEN_*` | UNKNOWN | Chỉ 5 bảng `DA_AUTHEN_*` có ô 「URL・パス」; các màn khác không có |

---

## Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| **E06 — Driver** (tài xế) | Actor chính — thực hiện toàn bộ nghiệp vụ trong app | Có `ログインID` (format `DR00000`) + mật khẩu do **công ty vận chuyển ủy thác (E05) cấp**; có email đã đăng ký |
| **E05 — Outsource Admin** (công ty vận chuyển ủy thác) | Cấp `ログインID`, nhập thông tin cơ bản hiển thị ở My Page | Ngoài phạm vi SPEC này — xem `features/delivery-partner/SPEC.md` |
| **E03 — System Admin (ES Kitchen)** | Đăng thông báo; **nhận thông báo khi 実集金額 lệch**; tiếp nhận & xử lý báo cáo sự cố | Ngoài phạm vi SPEC này |
| **ES Kitchen — tổng đài `050-5784-2777`** | Đầu mối điện thoại khi nhận/giao thiếu, có chênh lệch trưng bày, hoặc gặp sự cố | — |
| **Kho picking / kho trung chuyển** | Nguồn phát hàng và mã vận đơn; **chưa import mã vận đơn thì app ẩn số thùng** | — |
| **System** (actor hệ thống) | Gửi email mã xác thực · tự cập nhật đã đọc · tính `実在庫` và `差異` · **tự sinh tag mới khi hoàn thành một phần** · tự cập nhật trạng thái sang `トラブル` | — |

**Preconditions chung:**
- Tài khoản tài xế **đã được E05 tạo sẵn** — Figma **không có màn tự đăng ký**.
- Lô hàng đã được điều phối và gán cho tài xế (nghiệp vụ thuộc `features/delivery-dispatching/SPEC.md`).
- Thiết bị có kết nối mạng — Figma không có màn offline.

**Cross-repo:** Yes — `es-kitchen-webapp-driver` (FE) + `es-kitchen-api` (BE). **Cần Contract Lock trước Phase 3.**

---

## Flow Tổng Quan

```
[1] XÁC THỰC
Driver → DA_AUTHEN_001 (Đăng nhập)
   ├─[đúng]──────────→ DA_HOME_001
   ├─[sai]───────────→ Inline「ログインIDまたはパスワードが正しくありません。」(KHÔNG khóa tài khoản)
   └─[quên mật khẩu]─→ DA_AUTHEN_002_01 (ID + email)
                          │[cặp ID+email khớp → gửi mã 4 số]
                          ↓
                       DA_AUTHEN_002_02 (4 ô mã · hiệu lực 5 phút · gửi lại sau 60s)
                          │[đủ 4 số → nút active = DA_AUTHEN_002_03] [mã đúng]
                          ↓
                       DA_AUTHEN_002_04 (mật khẩu mới + xác nhận, trùng khớp tuyệt đối)
                          ↓
                       DA_AUTHEN_002_06 (hoàn tất) ─[TỰ ĐỘNG ĐĂNG NHẬP]─→ DA_HOME_001

[2] HOME — điều hành trong ngày
DA_HOME_001
   ├─ 本日の配送進捗 (ES + COOL; KHÔNG tính 倉庫受取) — ẩn cả khối nếu không có dữ liệu hôm nay
   ├─ 配送予定一覧 3 ngày (本日/明日/明後日), thứ tự: COOL未配送 → ES未配送 → 倉庫未受取 → COOLトラブル → ESトラブル
   │    ├─ Thẻ 倉庫受取 (CAM, chỉ khi 未受取) ──tap──→ DA_RECV_001
   │    │      └─「詳細表示▼」→ xem COOL/ES bên trong ──tap──→ Toast「先に倉庫受取を完了してください。」(cam, 2-3s) · KHÔNG chuyển màn
   │    ├─ Thẻ COOL便 (TÍM, độc lập — chỉ sau khi kho đã nhận) ──tap──→ DA_COOL_001
   │    └─ Thẻ ES配送便 (XANH, độc lập) ──tap──→ DA_ESDL_000_0
   ├─ Icon chuông ──→ DA_NOTI_001 ──tap dòng──→ DA_NOTI_002 (tự đánh dấu đã đọc)
   └─ Bottom nav: ホーム · マニュアル(?) · 配送一覧 · トラブル · アカウント
          ├─ 配送一覧 → DA_LIST_00 (Tab A/B/C)
          ├─ トラブル → Popup gọi ES → DA_RPTD_001
          └─ アカウント → DA_HOME_005 ──「ログアウト」──→ DA_AUTHEN_001

[3] NHẬN HÀNG TẠI KHO
DA_RECV_001 (tick từng vận đơn — KHÔNG có chọn tất cả)
   └─「完了」(active khi ≥1 tick)
        ├─[tick HẾT]─────→ Toast「荷物の受取は完了しました。」(5s) → DA_HOME_001
        └─[còn SÓT]──────→ Modal「荷物の受取は完了しましたか？」
                              │ ĐK mở nút: tick「連絡済み」 HOẶC bấm「ESへ電話する」(auto-tick)
                              ├─[一部保留のまま完了]→ phần đã tick = hoàn thành
                              │                       phần chưa tick → TỰ SINH TAG KHO MỚI (未受取)
                              │                       → DA_HOME_001
                              └─[キャンセル]────────→ về DA_RECV_001, GIỮ tick
DA_RECV_001 ─[back khi đã tick ≥1]─→ Popup「編集内容を破棄しますか？」─[破棄]→ xóa hết tick

[4] ES配送便 — QUY TRÌNH TRƯNG BÀY 5 BƯỚC
DA_ESDL_000_0 (tab 基本情報) ─「陳列を開始する」(chỉ khi 未配送 + hôm nay)─→
   Step1 DA_ESDL_001 陳列前写真 (1-20 ảnh) ──[続ける: ≥1 ảnh]──→
   Step2 DA_ESDL_002 在庫/廃棄 (理論在庫 · 廃棄数△ · 実在庫=理論−廃棄)
         ├─ Quét barcode → Modal đăng ký hủy (続けてスキャン / 一覧に戻る) → tự tích 確認
         └──[確認: TẤT CẢ đã tích]──→ DA_ESDL_002-05 (banner xanh「在庫/廃棄が成功しました。」+ bảng kết quả)
   ──[続ける]──→
   Step3 DA_ESDL_003 陳列 (予定数 vs 実際数)
         ├─ Quét barcode → Modal kiểm phẩm → tự tích 確認
         └──[確認: ≥1 tích]──┬─[KHÔNG sót & KHÔNG chênh lệch]──────────→ DA_ESDL_003-06 (bảng 差異)
                              └─[CÓ sót HOẶC CÓ chênh lệch]→ Popup「荷物の陳列は完了しましたか？」
                                      │ ĐK: BẮT BUỘC tick「ESキッチンへ連絡済みです。」
                                      ├─[報告完了]→ DA_ESDL_003-06
                                      └─[キャンセル]→ về Step3, không xử lý
   ──[続ける]──→
   Step4 DA_ESDL_004 陳列後写真 (1-20 ảnh) ──[続ける: ≥1 ảnh]──→
   Step5 DA_ESDL_005 集金登録 (集金予定額 readonly · 実集金額 0-999,999, mặc định 0)
         └─「完了」(LUÔN active, KHÔNG hộp thoại xác nhận) → trạng thái = 配送完了
                │ nếu 実集金額 chưa nhập hoặc lệch → CẢNH BÁO + thông báo admin, VẪN cho hoàn tất
                ↓
   DA_ESDL_006 (tab 陳列情報) — banner xanh「荷物の配送は完了しました。」+ thời gian
         ├─ Step nav 1-5: chạm xem lại nội dung từng bước
         ├─「編集」: CHỈ trong 7 ngày → sửa lại bước đang xem (Step 1/2/3/5 — connector không có Step 4 edit)
         └─ 駐車報告: chỉ đọc ──✏️──→ chỉnh sửa (ảnh hóa đơn BẮT BUỘC 1 ảnh · phí đỗ xe 0-999,999) ──💾──→ chỉ đọc

[5] COOL配送便
DA_COOL_001 (tick từng vận đơn xác nhận đã giao)
   └─「完了」(hiện khi 未配送 + trong ngày; active khi tick ≥1)
        ├─[tick HẾT]─────→ hoàn tất → DA_HOME_001 + Toast「荷物配達完了しました。」(đóng bằng ×)
        └─[còn SÓT]──────→ Popup「荷物の配送は完了しましたか？」
                              │ ĐK: tick「未配送分は、ESキッチンへ連絡済みです。」HOẶC bấm「ESへ電話する」
                              ├─[一部未配送のまま完了]→ kiện đã tick = 完了
                              │                          kiện chưa tick → TỰ SINH TAG COOL便 MỚI (未配送)
                              │                          → DA_HOME_001 + Toast
                              └─[キャンセル / ×]────────→ về màn chi tiết, không xử lý
DA_COOL_001 (mở lại sau khi hoàn tất) → Banner「荷物の配送は完了しました。」

[6] トラブル報告
Tab「トラブル」(Home) HOẶC icon chuông (荷物受取 / ES配送便 / COOL便) → Popup「ESキッチンへ電話しますか？」
   ├─[ESへ電話する]──────→ gọi 050-5784-2777
   ├─[トラブル報告へ]────→ DA_RPTD_001 (chọn 1 điểm giao/kho bằng radio — CHỈ 未配送 được hiện)
   │                          └─[次へ]→ DA_RPTD_002 (chi tiết báo cáo)
   │                                ├─ Tick vận đơn bị ảnh hưởng (BẮT BUỘC ≥1, có checkbox chọn tất cả 3 trạng thái)
   │                                ├─ Radio nội dung sự cố (BẮT BUỘC 1): 箱数不足 / 誤配送 / 荷物破損 / その他
   │                                │     └─[その他]→ hiện ô lý do BẮT BUỘC (1-255 ký tự, viền đỏ)
   │                                ├─ Ảnh sự cố (tùy chọn, 0-20) · 備考 (tùy chọn, 0-500)
   │                                └─「送信」(active khi ≥1 vận đơn + đã chọn nội dung)
   │                                       ↓
   │                                   Modal「この内容で報告を送信しますか？」
   │                                   +「送信後、対象の荷物は操作できなくなります。」
   │                                       ├─[報告する]→ trạng thái đơn = トラブル (đỏ) → DA_HOME_001
   │                                       │              + Toast「報告を送信しました。」· kiện KHÔNG thao tác được
   │                                       └─[キャンセル]→ về DA_RPTD_002, không gửi
   └─[戻る]──────────────→ đóng popup, về DA_HOME_001
```

---

## Quy tắc trạng thái & quyền sửa

> Tổng hợp từ table `20285:178257` A.12 · `20297:178978` B12 · `20297:179370` C12 · `23134:63310` A.14 · `23808:112206` mục 15 · `23747:111658` mục 8.
> **QC dùng bảng này làm test matrix.**

| Loại | Trạng thái | Thời điểm | Màn đích | Quyền |
|---|---|---|---|---|
| 倉庫受取 | `未受取` | Hôm nay | `DA_RECV_001` | ✅ Sửa được — tick + nút 「完了」 |
| 倉庫受取 | `受取済` | Bất kỳ | `DA_RECV_003` | 🔒 Chỉ đọc |
| 倉庫受取 | `トラブル` | Bất kỳ | `DA_RECV_003` | 🔒 Chỉ đọc |
| 倉庫受取 | Bất kỳ | Quá khứ | `DA_RECV_003` | 🔒 Chỉ đọc |
| 倉庫受取 | Bất kỳ | Tương lai | `DA_RECV_003` | 🔒 Chỉ đọc |
| ES配送便 | `未配送` | **Hôm nay** | `DA_ESDL_000_0` | ✅ Sửa được — nút 「陳列を開始する」 |
| ES配送便 | `未配送` | Tương lai | `DA_ESDL_000_1` | 🔒 Chỉ đọc — **nút 「陳列を開始する」 không hiện** |
| ES配送便 | `配送完了` | **Trong 7 ngày** kể từ khi hoàn tất | `DA_ESDL_000_2` / `DA_ESDL_006` | ✅ Sửa được — nút 「編集」 từng bước |
| ES配送便 | `配送完了` | **Quá 7 ngày** | `DA_ESDL_000_2` / `DA_ESDL_006` | 🔒 Chỉ đọc — **nút 「編集」 bị ẩn** |
| ES配送便 | `トラブル` | Bất kỳ | `DA_ESDL_000` | 🔒 Chỉ đọc — kiện hàng không thao tác được, chờ ES Kitchen |
| COOL便 | `未配送` | **Trong ngày** | `DA_COOL_001` | ✅ Sửa được — tick + nút 「完了」 |
| COOL便 | `未配送` | Tương lai | `DA_COOL_001` | ⚠️ **UNKNOWN** — 「未来日の配送での表示有無は要確認」 (RQ-F07 / OQ-31) |
| COOL便 | `配送完了` | Bất kỳ | `DA_COOL_001` | 🔒 Chỉ đọc + Banner 「荷物の配送は完了しました。」 |
| COOL便 | `トラブル` | Bất kỳ | `DA_COOL_001` | 🔒 Chỉ đọc |

**Quy tắc chuyển trạng thái (state machine) — theo Figma:**

```
倉庫受取:  未受取 ──[tick hết + 完了]──────────────→ 受取済
                 ├─[tick một phần + đã liên hệ ES]─→ 受取済 (phần đã tick)
                 │                                  + TAG KHO MỚI 未受取 (phần còn lại)
                 └─[báo cáo sự cố]────────────────→ トラブル  (độc lập checkbox)

COOL便:    未配送 ──[tick hết + 完了]──────────────→ 配送完了
                 ├─[tick một phần + đã liên hệ ES]─→ 配送完了 (phần đã tick)
                 │                                  + TAG COOL便 MỚI 未配送 (phần còn lại)
                 └─[báo cáo sự cố]────────────────→ トラブル

ES配送便:  未配送 ──[hoàn tất cả 5 step + 完了 ở Step5]→ 配送完了 (+ banner & thời gian)
                 └─[báo cáo sự cố]────────────────→ トラブル
```

---

## Happy Path

### HP-01 — Đăng nhập
1. Mở app → `DA_AUTHEN_001`: hình minh họa ESSTATION (xe tải + tài xế) + 「今日も一日、安全運転で頑張りましょう。」
2. Nhập `ログインID` + mật khẩu (hiển thị `●`, icon mắt để hiện/ẩn).
3. Bấm nút đăng nhập → validate **toàn bộ field cùng lúc** → gọi API xác thực.
4. Thành công → `DA_HOME_001`.

### HP-02 — Đặt lại mật khẩu
1. `DA_AUTHEN_001` → 「パスワードを忘れた方はこちら」 → `DA_AUTHEN_002_01`.
2. Nhập `ログインID` + email đã đăng ký → 「認証コードを送信」.
3. Hệ thống đối chiếu **cặp ID + email** → khớp → gửi mã 4 chữ số → `DA_AUTHEN_002_02`.
4. Nhập 4 chữ số (tự chuyển focus từng ô) → nút xác nhận chuyển active (`DA_AUTHEN_002_03`) → bấm → `DA_AUTHEN_002_04`.
5. Nhập mật khẩu mới + xác nhận (trùng khớp tuyệt đối) → bấm ✓ → `DA_AUTHEN_002_06`.
6. Màn hoàn tất 「パスワードリセットに成功しました。」 → bấm nút về màn chính → **vào thẳng `DA_HOME_001` ở trạng thái đã tự động đăng nhập**.

### HP-03 — Xem Home, chọn việc trong ngày
1. `DA_HOME_001`: header tên tài xế + 「安全運転でいってらっしゃいませ。」 + icon chuông.
2. Khối 本日の配送進捗: số đơn hôm nay / hoàn thành / còn lại / thanh % (**chỉ tính ES + COOL**).
3. Khối 配送予定一覧: 3 section 「本日」「明日」「明後日」, thứ tự trong ngày COOL未配送 → ES未配送 → 倉庫未受取 → COOLトラブル → ESトラブル.
4. Khi kho `未受取`: chỉ hiện thẻ kho (cam); bấm 「詳細表示▼」 xem danh sách COOL/ES bên trong.
5. Bấm thẻ kho → `DA_RECV_001`.
6. Sau khi nhận kho xong: thẻ kho **ẩn**, COOL/ES thành **thẻ độc lập bấm được** → `DA_COOL_001` / `DA_ESDL_000_0`.

### HP-04 — Đọc thông báo
1. Icon chuông → `DA_NOTI_001`: mỗi thông báo 1 hàng (ngày giờ + tiêu đề link xanh + chấm đỏ nếu chưa đọc), mới nhất lên đầu.
2. Bấm tiêu đề → `DA_NOTI_002`; **màn load → server cập nhật đã đọc**.
3. Quay lại danh sách → chấm đỏ đã ẩn.

### HP-05 — Xem tài khoản / đăng xuất
1. Bottom nav 「アカウント」 → `DA_HOME_005`.
2. Xem 基本情報 6 trường (chỉ đọc): `ログインID` · `メールアドレス` · `配送スタッフ名` · `カナ` · `電話番号` · `委託配送先名`.
3. 「ログアウト」 → `DA_AUTHEN_001`.

### HP-06 — Tra cứu 配送一覧
1. Bottom nav 「配送一覧」 → `DA_LIST_00`, **Tab A 倉庫受取 được chọn sẵn**, `開始日` = hôm nay, `終了日` = hôm nay + 7 ngày.
2. Tab A: dropdown trạng thái (chọn đơn) + search **lọc realtime khi gõ** trên `倉庫名`・`中継先`・`納品先拠点名`・`住所`.
3. Tab B/C: dropdown kho・trung chuyển (**chọn nhiều**) + search tự do **phải bấm Enter**.
4. Bấm thẻ → màn chi tiết tương ứng, quyền sửa theo `## Quy tắc trạng thái & quyền sửa`.

### HP-07 — Nhận hàng tại kho (nhận ĐỦ)
1. Thẻ kho `未受取` → `DA_RECV_001`: tên kho · ngày giao · `伝票番号` · địa chỉ + danh sách vận đơn.
2. (Tùy chọn) bật 「未受取のみ表示」 hoặc gõ 「納品先名」 để lọc **phía client**.
3. Tick **từng** vận đơn đã nhận → badge dòng đó đổi `未受取` → `受取済`.
4. Tick hết → bấm 「完了」 → **không hiện modal**, hiện toast 「荷物の受取は完了しました。」 (tự ẩn sau 5 giây) → `DA_HOME_001`.

### HP-08 — Nhận hàng tại kho (nhận THIẾU)
1. Bước 1–3 như HP-07 nhưng **còn vận đơn chưa tick**.
2. Bấm 「完了」 → Modal 「荷物の受取は完了しましたか？」 + 「一部の荷物が未確認の状態です。すべて受取していない場合は、ESキッチンまでご連絡ください。」
3. Mở khóa nút bằng **một trong hai**: tick 「未受取分は、ESキッチンへ連絡済みです。」 **hoặc** bấm 「ESへ電話する（050-5784-2777）」 (**tự động tick checkbox**).
4. Bấm 「一部保留のまま完了」 → phần đã tick = hoàn thành; phần chưa tick → **tự sinh tag kho mới `未受取`** → `DA_HOME_001`.

### HP-09 — ES配送便: quy trình trưng bày 5 bước
1. Thẻ ES配送便 → `DA_ESDL_000_0` (tab 基本情報): tên điểm giao · ngày giao · badge · mã bưu chính · địa chỉ · người phụ trách · điện thoại · `納品備考` (khung nhấn mạnh có icon) · tóm tắt 「〇箱/〇品(lạnh)/〇品(đông)」 · danh sách vận đơn có số thứ tự.
2. Bấm 「陳列を開始する」 (**chỉ hiện khi `未配送` + hôm nay**) → **Step 1**.
3. **Step 1 陳列前** (`DA_ESDL_001`): tải ảnh trước trưng bày theo 「冷蔵庫・ボックス内の陳列前写真をアップロードしてください。」 — **1–20 ảnh**. Nút 「続ける」 active khi ≥1 ảnh → Step 2.
4. **Step 2 在庫/廃棄** (`DA_ESDL_002`): với mỗi sản phẩm — xem `理論在庫`, nhập `廃棄数（△）` (hàng sẽ hết hạn trước 次回納品日), hệ thống **tự tính `実在庫 = 理論在庫 − 廃棄数`** (sửa thủ công được), rồi tick `確認` (tick xong dòng đó bị grayout). Có thể quét barcode để đăng ký hủy cả sản phẩm **không có trong danh sách**.
5. Bấm 「確認」 (**chỉ active khi TẤT CẢ sản phẩm đã tick**) → `DA_ESDL_002-05`: banner xanh 「在庫/廃棄が成功しました。」 + thời gian `yyyy年mm月dd日HH時mm分` + bảng 連番/商品名/廃棄数/実在庫. Bấm 「続ける」 → Step 3.
6. **Step 3 陳列** (`DA_ESDL_003`): mỗi sản phẩm hiện `予定数：〇個`, ô `実際数` mặc định = `予定数`; sửa nếu lệch rồi tick `確認`. Quét barcode để kiểm phẩm nhanh (tự tích 確認).
7. Bấm 「確認」 (active khi ≥1 tick):
   - **Không sót & không chênh lệch** → thẳng `DA_ESDL_003-06`.
   - **Có sót hoặc có chênh lệch** → Popup 「荷物の陳列は完了しましたか？」 + 「ESキッチンまで連絡する必要があります。」 → **bắt buộc tick 「ESキッチンへ連絡済みです。」** → 「報告完了」 → `DA_ESDL_003-06`.
8. `DA_ESDL_003-06`: bảng 連番/商品/予定数/実際数/差異, cột `差異 = 予定数 − 実際数` (0 đen · âm cam · dương xanh lá). Bấm 「続ける」 → Step 4.
9. **Step 4 陳列後** (`DA_ESDL_004`): tải ảnh sau trưng bày **1–20 ảnh** → 「続ける」 → Step 5.
10. **Step 5 集金登録** (`DA_ESDL_005`): `集金予定額` chỉ đọc (nền xám); nhập `実集金額` (0–999,999, mặc định 0). Bấm 「完了」 (**luôn active, không có hộp thoại xác nhận**) → trạng thái = `配送完了` → về màn chi tiết ES配送便.
11. `DA_ESDL_006` (tab 陳列情報): banner xanh 「荷物の配送は完了しました。」 + thời gian; step nav 1–5 **chạm để xem lại** nội dung từng bước; **trong 7 ngày** có nút 「編集」 để sửa lại bước đang xem; khối 駐車報告 (✏️ → tải ảnh hóa đơn **bắt buộc 1 ảnh** + nhập phí đỗ xe → 💾 lưu).

### HP-10 — COOL配送便
1. Thẻ COOL便 → `DA_COOL_001`: thông tin điểm giao (gồm mã bưu chính dạng `151-0051`) + `納品備考` + tóm tắt số thùng + danh sách vận đơn có **checkbox xác nhận đã giao**.
2. Tick từng vận đơn → nút 「完了」 active (hiện khi `未配送` + trong ngày).
3. **Tick hết** → xử lý hoàn tất trực tiếp → `DA_HOME_001` + toast 「荷物配達完了しました。」 (đóng bằng ×).
4. Mở lại màn chi tiết sau khi hoàn tất → banner 「荷物の配送は完了しました。」

### HP-11 — COOL配送便 giao thiếu
1. Bước 1–2 như HP-10 nhưng **tick một phần**.
2. Bấm 「完了」 → Popup 「荷物の配送は完了しましたか？」 + 「一部の荷物が未確認の状態です。すべて配送していない場合は、ESキッチンまでご連絡ください。」
3. Tick 「未配送分は、ESキッチンへ連絡済みです。」 **hoặc** bấm 「ESへ電話する」 → nút 「一部未配送のまま完了」 active.
4. Bấm → kiện đã tick = `完了`; kiện chưa tick → **tự sinh tag COOL便 mới `未配送`** → `DA_HOME_001` + toast.

### HP-12 — Báo cáo sự cố
1. Tab 「トラブル」 (Home) **hoặc** icon chuông ở header màn 荷物受取 / ES配送便 / COOL便 → Popup 「ESキッチンへ電話しますか？」 (mascot + dấu ？).
2. Bấm 「トラブル報告へ」 → `DA_RPTD_001`: danh sách điểm giao/kho (**chỉ đơn `未配送`**), icon 3 màu (xanh = ES · tím = COOL · cam = kho), badge `未配送`/`未受取`.
3. Chọn **1** điểm bằng radio → hiện nút 「戻る」「次へ」 → 「次へ」 → `DA_RPTD_002`.
4. `DA_RPTD_002`: tick vận đơn bị ảnh hưởng (**bắt buộc ≥1**; có checkbox chọn tất cả với trạng thái trung gian `−`), chọn radio nội dung sự cố (**bắt buộc 1** trong `箱数不足`/`誤配送`/`荷物破損`/`その他`), nếu `その他` → nhập lý do (**bắt buộc**, 1–255 ký tự), (tùy chọn) tải 0–20 ảnh + `備考` 0–500 ký tự.
5. Bấm 「送信」 (active khi đủ 2 điều kiện bắt buộc) → Modal 「この内容で報告を送信しますか？」 + 「送信後、対象の荷物は操作できなくなります。ESキッチンの確認・対応までお待ちください。」
6. Bấm 「報告する」 → trạng thái đơn tự cập nhật thành `トラブル` (đỏ) → `DA_HOME_001` + toast 「報告を送信しました。」; **kiện hàng liên quan không thao tác được nữa**.

---

## Alternative Flows & Edge Cases

| ID | Tình huống | Hành vi (theo Figma) | Nguồn |
|---|---|---|---|
| AF-01 | Sai ID **hoặc** sai mật khẩu | Một message chung 「ログインIDまたはパスワードが正しくありません。」. **Không khóa tài khoản** ở bất kỳ số lần nào | RQ-A04 |
| AF-02 | Cặp ID + email không khớp khi reset | 「ログインIDまたはメールアドレスが正しくありません。」 | RQ-A05 |
| AF-03 | Mã xác thực quá 5 phút | **Màn hình không đổi trạng thái**; bấm xác nhận mới báo 「認証コードが正しくありません。」 | RQ-A07 |
| AF-04 | Gửi lại mã nhiều lần | Được phép — **không giới hạn số lần**; mỗi lần reset đếm ngược về 60 giây | RQ-A09 |
| AF-05 | Bấm 「ログイン画面に戻る」 giữa luồng reset | Hủy luồng, **dữ liệu đang nhập bị hủy**, về `DA_AUTHEN_001` | RQ-A15 |
| AF-06 | **Cả 3 ngày** không có lịch giao | Hiện **SOL ちゃん** + 「お疲れさまです！今のところ配送予定はありません。予定が入りましたら表示されます。」 | RQ-B07 |
| AF-07 | **Một ngày** không có dữ liệu (2 ngày kia có) | Section ngày đó hiện 「配送予定データはありません。」; **không** hiện SOL ちゃん | RQ-B06 |
| AF-08 | Không có dữ liệu giao hàng hôm nay | Khối 本日の配送進捗 **bị ẩn hoàn toàn** | RQ-B02 |
| AF-09 | Bấm thẻ COOL/ES khi kho `未受取` | Toast **màu cam** 「先に倉庫受取を完了してください。」 ở **phía dưới màn hình ~2–3 giây rồi tự ẩn**; **không chuyển màn** | RQ-B16 |
| AF-10 | Đơn ở trạng thái `トラブル` | Vẫn hiển thị trên Home (thứ tự cuối), badge đỏ; **kiện hàng không thao tác được**, chờ ES Kitchen xử lý | RQ-B08 · RQ-G32 |
| AF-11 | Danh sách thông báo rỗng | 「データがありません。」 | RQ-B23 |
| AF-12 | Đã hiển thị hết thông báo | Nút 「もっと表示」 **bị ẩn** (không phải disable) | RQ-B21 |
| AF-13 | Chọn `終了日` trước `開始日` | 「終了日は開始日以降を選択してください。」 | RQ-C04 |
| AF-14 | Chọn khoảng ngày > 31 ngày | 「期間は1ヶ月以内で選択してください。」 | RQ-C04 |
| AF-15 | Kho chưa import mã vận đơn | **Ẩn hẳn** field `{n}箱` (không hiện `0箱`) | RQ-C15 |
| AF-16 | Chưa picking xong (hôm nay/quá khứ) | Tab A hiện `未確定`; Tab B/C **ẩn** field số lượng | RQ-C16 · RQ-C21 |
| AF-17 | Dữ liệu ngày tương lai | Hiện `{số đặt}個（予定）` / `{n}箱（予定）` | RQ-C16 · RQ-C21 |
| AF-18 | Xóa nội dung ô tìm kiếm | Hiển thị lại **toàn bộ** danh sách | RQ-C09 · RQ-C18 |
| AF-19 | Gõ > 100 ký tự vào 「納品先名」 (`DA_RECV_001`) | **Chặn input** — không cho gõ thêm, không có message lỗi | RQ-D07 |
| AF-20 | Gõ > 255 ký tự vào search Tab B/C | **Chặn input** | RQ-C18 |
| AF-21 | Bấm back ở `DA_RECV_001` khi **chưa tick gì** | Về màn trước **ngay**, không popup | RQ-D01 |
| AF-22 | Bấm back ở `DA_RECV_001` khi **đã tick ≥1** | Popup 「編集内容を破棄しますか？」; 「キャンセル」 giữ nguyên tick + nội dung nhập, 「破棄」 **xóa toàn bộ** | RQ-D01 · RQ-D19 · RQ-D20 |
| AF-23 | Bấm 「キャンセル」 trong Modal nhận thiếu | Đóng modal, về `DA_RECV_001`, **giữ nguyên trạng thái tick** | RQ-D18 |
| AF-24 | Vận đơn đã bị báo sự cố từ chức năng khác | Badge `トラブル` — **độc lập hoàn toàn với checkbox**; tick/bỏ tick không đổi badge này | RQ-D09 · RQ-E02 · RQ-F03 |
| AF-25 | Bật 「未受取のみ表示」 sau khi đã tick vài dòng | Dòng đã tick bị ẩn (đã thành `受取済`); lọc chạy **phía client** | RQ-D06 |
| AF-26 | Tick `確認` ở Step 2 | Nút −/＋ và ô nhập `廃棄数`・`実在庫` **cùng dòng bị grayout** | RQ-E21 |
| AF-27 | Quét barcode ở Step 2 / Step 3 | Sản phẩm đó **tự động được tích `確認`** | RQ-E37 |
| AF-28 | Quét barcode sản phẩm **không có trong danh sách** (Step 2) | Vẫn đăng ký hủy được qua modal quét | RQ-E17 |
| AF-29 | Sửa `廃棄数` ở Step 2 | `実在庫` **tự động tính lại** = `理論在庫 − 廃棄数`; vẫn sửa thủ công được | RQ-E23 · RQ-E24 |
| AF-30 | Chưa tick hết sản phẩm ở Step 2 | Nút 「確認」 **grayout** — Step 2 yêu cầu **TẤT CẢ** sản phẩm phải tick | RQ-E26 |
| AF-31 | Step 3: `実際数 ≠ 予定数` | Coi là **chênh lệch** → khi bấm 確認 sẽ hiện popup liên hệ ES | RQ-E32 |
| AF-32 | Step 3: bấm 「確認」 khi có sót **hoặc** có chênh lệch | Popup 「荷物の陳列は完了しましたか？」 — **bắt buộc tick 「ESキッチンへ連絡済みです。」** mới bấm được 「報告完了」 | RQ-E34 · RQ-E39 |
| AF-33 | Step 3: 「キャンセル」 trong popup chênh lệch | Đóng popup, về màn trưng bày, **không thực hiện xử lý** | RQ-E41 |
| AF-34 | Step 3: bấm 「戻る」 về Step 2 | **Dữ liệu đã nhập được giữ lại** | RQ-E33 |
| AF-35 | Step 2: bấm 「戻る」 về Step 1 | ⚠️ **UNKNOWN** — 「入力データ保持の有無は要確認」 | RQ-E27 / OQ-22 |
| AF-36 | Step 1 / Step 4: chưa tải ảnh nào | Nút 「続ける」 **grayout**; khu vực ảnh hiện 「写真はまだありません」 + placeholder | RQ-E08 · RQ-E14 · RQ-E45 |
| AF-37 | Tải ảnh sai định dạng / quá 10MB / quá 20 ảnh | 「対応していないファイル形式です」/「ファイルサイズは10MB以下にしてください」/「写真は最大20枚までです」 | RQ-E10 |
| AF-38 | Muốn thay ảnh đã tải | **Xóa (×) rồi tải lại** — không có chức năng thay trực tiếp | RQ-E11 · RQ-G24 |
| AF-39 | Step 5: `実集金額` để 0 hoặc khác `集金予定額` | **Hiện cảnh báo 「実集金額が未入力、または集金予定額と一致しません。ご確認ください。」 + thông báo cho admin**; **vẫn bấm 「完了」 được** | RQ-E49 |
| AF-40 | Step 5: nhập `実集金額` ngoài 0–999,999 | 「実集金額は0〜999,999の整数で入力してください」 | RQ-E50 |
| AF-41 | 駐車報告: bấm 💾 lưu khi chưa có ảnh hóa đơn | **Không lưu được** — 「レシート画像をアップロードしてください」 | RQ-E57 · RQ-E58 |
| AF-42 | 駐車報告: bấm × hủy chỉnh sửa | Về chế độ chỉ đọc, **không hiện hộp thoại xác nhận** | RQ-E57 |
| AF-43 | ES配送便 quá 7 ngày sau khi hoàn tất | Nút 「編集」 **bị ẩn** — chỉ xem | RQ-E55 |
| AF-44 | COOL便 giao thiếu: chưa tick "đã liên hệ" và chưa gọi ES | Nút 「一部未配送のまま完了」 **disable (xám)** | RQ-F09 |
| AF-45 | COOL便 ngày tương lai | ⚠️ **UNKNOWN** — 「未来日の配送での表示有無は要確認」 | RQ-F07 / OQ-31 |
| AF-46 | Báo cáo sự cố: chọn **kho** ở `DA_RPTD_001` | Hiển thị các đơn **chưa nhận VÀ chưa giao** thuộc kho đó | RQ-G14 |
| AF-47 | Báo cáo sự cố: chọn tất cả một phần | Checkbox chọn tất cả hiện **trạng thái trung gian (−)** | RQ-G17 |
| AF-48 | Báo cáo sự cố: chọn `その他` mà không nhập lý do | 「理由を入力してください」; ô có **viền đỏ** nhấn mạnh | RQ-G21 |
| AF-49 | Báo cáo sự cố: chưa chọn vận đơn hoặc chưa chọn nội dung | Nút 「送信」 **disable (xám)**; nếu submit → 「影響を受けた注文を1件以上選択してください」/「トラブル内容を選択してください」 | RQ-G18 · RQ-G20 · RQ-G27 |
| AF-50 | Báo cáo sự cố: bấm 「戻る」 ở màn chi tiết | Về màn chọn điểm giao, **nội dung đã nhập bị hủy** | RQ-G26 |
| AF-51 | Nhiều điểm giao cùng gặp sự cố | 「※複数の拠点でトラブルが発生している場合は、それぞれの拠点ごとに登録してください。」 — **phải đăng ký riêng từng điểm** | RQ-G09 |
| AF-52 | **Mất mạng** (mọi màn) | ⚠️ **UNKNOWN — Figma không định nghĩa** | RQ-H01 / OQ-08 |
| AF-53 | **Server lỗi 500 / maintenance** | ⚠️ **UNKNOWN — Figma không định nghĩa** | RQ-H02 / OQ-08 |
| AF-54 | **Session/JWT hết hạn** giữa lúc dùng app | ⚠️ **UNKNOWN — Figma không định nghĩa** (rủi ro mất dữ liệu đang tick/nhập) | RQ-H03 / OQ-09 |
| AF-55 | Admin đổi lịch/trạng thái khi tài xế đang xem | ⚠️ **UNKNOWN — Figma không có cơ chế refresh** | RQ-H04 / OQ-10 |

---

## Acceptance Criteria

**Xác thực**
- [ ] **AC-01** `ログインID` bắt buộc 1–255 ký tự ASCII; trống → 「ログインIDを入力してください。」
- [ ] **AC-02** Mật khẩu bắt buộc ≥8 ký tự, ≥1 chữ cái, ≥1 chữ số; vi phạm → 「8文字以上で、英字・数字を含めてください。」; trống → 「パスワードを入力してください。」
- [ ] **AC-03** Validate **toàn bộ field cùng lúc khi bấm nút**, không validate realtime khi gõ.
- [ ] **AC-04** Icon mắt toggle `password ↔ text` ở **mọi** ô mật khẩu (login · mật khẩu mới · xác nhận mật khẩu).
- [ ] **AC-05** Sai thông tin đăng nhập **không làm khóa tài khoản** ở bất kỳ số lần nào.
- [ ] **AC-06** Email bắt buộc, định dạng `xxx@xxx.xxx`, ≤256 ký tự; sai → 「メールアドレスの形式が正しくありません。」
- [ ] **AC-07** Mã xác thực: đúng **4 ô**, mỗi ô 1 chữ số, **chỉ nhận số**, **tự chuyển focus**; nút xác nhận chỉ active khi đủ 4 số.
- [ ] **AC-08** Mã hiệu lực **5 phút**; hết hạn **màn hình không đổi trạng thái**, chỉ báo lỗi khi bấm xác nhận.
- [ ] **AC-09** Nút gửi lại đếm ngược **60 giây** hiển thị dạng `00:59`; **không giới hạn số lần** gửi lại.
- [ ] **AC-10** Xác nhận mật khẩu phải **trùng khớp tuyệt đối**; lệch → 「パスワードが一致しません。」
- [ ] **AC-11** Sau `DA_AUTHEN_002_06`, bấm nút về Home vào thẳng `DA_HOME_001` **ở trạng thái đã đăng nhập**, **không qua màn login**.
- [ ] **AC-12** 「ログイン画面に戻る」 hủy luồng reset và **xóa dữ liệu đang nhập**.

**Home / Thông báo / My Page**
- [ ] **AC-13** `残り件数 = 本日の配送件数 − 完了件数`; `進捗率 = floor(完了 ÷ 本日件数 × 100)` hiển thị %.
- [ ] **AC-14** Tiến độ **chỉ tính ES配送 + COOL配送**; `倉庫から受取` **không tính** vào cả tổng lẫn số hoàn thành.
- [ ] **AC-15** Không có dữ liệu hôm nay → **ẩn cả khối 本日の配送進捗**.
- [ ] **AC-16** Lịch hiển thị đúng **3 ngày**: 「本日（YYYY-M-D）」「明日（YYYY-M-D）」「明後日（YYYY-M-D）」.
- [ ] **AC-17** Thứ tự thẻ trong cùng ngày đúng: ①COOL便(未配送) ②ES配送便(未配送) ③倉庫受取(未受取) ④COOL便(トラブル) ⑤ES配送便(トラブル).
- [ ] **AC-18** Thẻ kho chỉ hiện `未受取`; thẻ COOL/ES chỉ hiện `未配送` và `トラブル`. Đã hoàn thành → **ẩn**.
- [ ] **AC-19** Khi kho `未受取`: COOL/ES **không có thẻ độc lập**, chỉ nằm trong vùng chi tiết thẻ kho; bấm vào → toast 「先に倉庫受取を完了してください。」 **màu cam**, tự ẩn sau 2–3 giây, **không chuyển màn**.
- [ ] **AC-20** Nút hiện/ẩn chi tiết đổi nhãn đúng: đang mở 「非表示▲」, đang đóng 「詳細表示▼」.
- [ ] **AC-21** Bottom nav có đúng **5 tab**: ホーム · マニュアル · 配送一覧 · トラブル · アカウント.
- [ ] **AC-22** Mở `DA_NOTI_002` **tự động gọi API đánh dấu đã đọc**; quay lại danh sách chấm đỏ biến mất.
- [ ] **AC-23** **Không có** chức năng "đánh dấu tất cả đã đọc".
- [ ] **AC-24** Ngày giờ thông báo theo **JST**: trong ngày 「今日・HH:mm」, ngày khác 「M月D日・HH:mm」; **không dùng「昨日」**.
- [ ] **AC-25** Nội dung thông báo **giữ nguyên xuống dòng và đoạn văn** như admin nhập.
- [ ] **AC-26** 「もっと表示」 tap **hoặc cuộn xuống** đều tải thêm; hết thông báo → **ẩn nút**.
- [ ] **AC-27** My Page: **6 trường chỉ đọc**, không có ô nào edit được; `ログインID` đúng format `DR` + 5 chữ số.

**配送一覧**
- [ ] **AC-28** Mặc định: Tab A được chọn, `開始日` = hôm nay, `終了日` = hôm nay + 7 ngày.
- [ ] **AC-29** Ràng buộc `開始日 ≤ 終了日` và khoảng ≤ **31 ngày**; vi phạm hiện đúng 2 message ①②.
- [ ] **AC-30** Tab A dùng dropdown trạng thái **chọn đơn**; Tab B/C dùng dropdown kho・trung chuyển **chọn nhiều**.
- [ ] **AC-31** Tab A: search **lọc realtime khi gõ**; Tab B/C: search **chỉ chạy khi bấm Enter**. Xóa input → hiện lại toàn bộ.
- [ ] **AC-32** Tab A **rút gọn** tên kho sau 2 dòng (`…`); Tab B/C **xuống dòng hiển thị đủ**, không rút gọn.
- [ ] **AC-33** Icon bông tuyết = `冷凍`; icon tủ lạnh = `冷蔵・常温` **gộp chung một số**.
- [ ] **AC-34** Số lượng hiển thị đúng theo thời điểm: tương lai `{n}個（予定）` · đã picking `{n}箱` · chưa picking `未確定` (Tab A) / **ẩn** (Tab B/C).
- [ ] **AC-35** Chưa import mã vận đơn → **ẩn hẳn** field `{n}箱`, không hiện `0箱`.
- [ ] **AC-36** Badge màu đúng: `未受取`/`未配送` cam · `受取済`/`配送完了` xanh lá · `トラブル` đỏ.
- [ ] **AC-37** Ngày giao định dạng `yyyy-mm-dd（thứ）`, **thứ tính tự động từ ngày**.
- [ ] **AC-38** Bấm thẻ điều hướng đúng **14 dòng** trong `## Quy tắc trạng thái & quyền sửa`.

**荷物受取**
- [ ] **AC-39** **Không có** nút chọn tất cả; chỉ tick được từng vận đơn.
- [ ] **AC-40** Nút 「完了」 grayout khi 0 tick (**không có message lỗi**); active khi ≥1 tick.
- [ ] **AC-41** Tick một dòng → badge dòng đó đổi `未受取` → `受取済` ngay.
- [ ] **AC-42** Tick **hết** + 完了 → **không hiện modal**, toast 「荷物の受取は完了しました。」 tự ẩn sau **5 giây** → về Home.
- [ ] **AC-43** Còn **sót** + 完了 → Modal; nút 「一部保留のまま完了」 active khi checkbox tick **HOẶC** đã bấm gọi ES (điều kiện **OR**).
- [ ] **AC-44** Bấm 「ESへ電話する」 **tự động tick** checkbox "đã liên hệ" và kích hoạt nút hoàn thành.
- [ ] **AC-45** Số điện thoại ES đúng **`050-5784-2777`** ở **mọi** nơi xuất hiện.
- [ ] **AC-46** Hoàn thành một phần: phần đã tick = hoàn thành; phần chưa tick → **sinh tag kho mới trạng thái `未受取`**.
- [ ] **AC-47** Back khi đã tick ≥1 → Popup 「編集内容を破棄しますか？」; chưa tick → về ngay, **không popup**.
- [ ] **AC-48** Popup: 「キャンセル」 giữ nguyên tick + nội dung nhập; 「破棄」 **xóa sạch**.
- [ ] **AC-49** Ô search 「納品先名」 **chặn nhập** quá 100 ký tự (không báo lỗi).
- [ ] **AC-50** Badge `トラブル` **không** bị thay đổi bởi thao tác tick/bỏ tick.

**ES配送便 — 5 bước**
- [ ] **AC-51** Nút 「陳列を開始する」 **chỉ hiện khi `未配送` VÀ đơn giao trong ngày hôm nay**; đơn tương lai → **không hiện**.
- [ ] **AC-52** Thanh tiến trình 5 bước **không chạm để di chuyển** — chỉ bằng 「戻る」「続ける」; trạng thái hiển thị đúng (hoàn thành ✓ xanh · hiện tại số xanh · chưa hoàn thành số xám).
- [ ] **AC-53** Step 1 & Step 4: ảnh **tối thiểu 1, tối đa 20**; nút 「続ける」 chỉ active khi ≥1 ảnh.
- [ ] **AC-54** Ảnh: **JPEG/PNG/HEIC/WebP**, **tối đa 10MB/file**; chưa tải → 「写真はまだありません」 + placeholder; đang tải → 「loading」.
- [ ] **AC-55** Nút xóa ảnh (×) ở **góc trên phải mỗi thumbnail**; thay ảnh = xóa rồi tải lại.
- [ ] **AC-56** Mọi step có câu liên hệ khẩn cấp 「※ご不明な点は弊社代表番号で、緊急連絡先の「050-5784-2777」までお願いします。」
- [ ] **AC-57** Step 2: `実在庫` **tự tính** = `理論在庫 − 廃棄数`, **vẫn sửa thủ công được**.
- [ ] **AC-58** Step 2: tick `確認` → nút −/＋ và ô nhập **cùng dòng bị grayout**.
- [ ] **AC-59** Step 2: nút 「確認」 **chỉ active khi TẤT CẢ sản phẩm đã tick**.
- [ ] **AC-60** Step 2: quét barcode đăng ký hủy được cả sản phẩm **không có trong danh sách**; sau quét sản phẩm **tự bật `確認`**.
- [ ] **AC-61** Step 2/3: `廃棄数`・`実在庫`・`実際数` chỉ nhận **số nguyên ≥ 0**; vi phạm → message tương ứng.
- [ ] **AC-62** Step 2/3 màn thành công: banner xanh 「在庫/廃棄が成功しました。」 + thời gian định dạng `yyyy年mm月dd日HH時mm分`.
- [ ] **AC-63** Step 3: `実際数` **giá trị ban đầu = `予定数`**.
- [ ] **AC-64** Step 3: nút 「確認」 active khi **≥1** tick (khác Step 2 yêu cầu **tất cả**).
- [ ] **AC-65** Step 3: có sót **hoặc** có chênh lệch → popup; **bắt buộc** tick 「ESキッチンへ連絡済みです。」 mới bấm được 「報告完了」.
- [ ] **AC-66** Step 3: **không sót và không chênh lệch** → chuyển **thẳng** màn thành công, không popup.
- [ ] **AC-67** Cột `差異 = 予定数 − 実際数`; màu **0 = đen · âm = cam · dương = xanh lá**.
- [ ] **AC-68** Step 3 「戻る」 về Step 2 **giữ dữ liệu đã nhập**.
- [ ] **AC-69** Step 5: `集金予定額` **chỉ đọc, nền xám**, định dạng phân cách 3 chữ số + 「円」.
- [ ] **AC-70** Step 5: `実集金額` mặc định **0**, số nguyên **0–999,999**.
- [ ] **AC-71** Step 5: `実集金額` chưa nhập hoặc lệch `集金予定額` → **cảnh báo + thông báo admin**, nhưng **vẫn cho bấm 「完了」**.
- [ ] **AC-72** Step 5: nút 「完了」 **luôn active**, **không hiện hộp thoại xác nhận**; bấm → trạng thái `配送完了` → về màn chi tiết ES配送便.
- [ ] **AC-73** Banner hoàn tất **chỉ hiện sau khi xong cả 5 bước** và bấm 完了 ở bước cuối.
- [ ] **AC-74** Tab 陳列情報 **chỉ truy cập được sau khi hoàn tất 5 bước**; step nav 1–5 chạm xem lại nội dung từng bước.
- [ ] **AC-75** Nút 「編集」 **chỉ hiện trong 7 ngày** sau khi hoàn tất; quá 7 ngày → **ẩn**.
- [ ] **AC-76** 駐車報告: ảnh hóa đơn **bắt buộc tối đa 1 ảnh**; chưa có → **không lưu được** (「レシート画像をアップロードしてください」).
- [ ] **AC-77** 駐車報告: phí đỗ xe tùy chọn, số nguyên **0–999,999**, mặc định 0; bấm × hủy **không hiện hộp thoại xác nhận**.

**COOL配送便**
- [ ] **AC-78** Mã bưu chính hiển thị **kèm dấu gạch ngang**, nguyên giá trị master (vd `151-0051`).
- [ ] **AC-79** Danh sách vận đơn **không thể chạm**; mỗi vận đơn có checkbox xác nhận riêng.
- [ ] **AC-80** Nút 「完了」 hiện khi `未配送` **và** là đơn giao trong ngày; active khi tick ≥1.
- [ ] **AC-81** Tick **hết** + 完了 → hoàn tất trực tiếp → Home + toast 「荷物配達完了しました。」 (đóng bằng **nút ×**).
- [ ] **AC-82** Tick **một phần** + 完了 → popup; nút 「一部未配送のまま完了」 active khi tick "đã liên hệ" **HOẶC** đã gọi ES.
- [ ] **AC-83** Hoàn tất một phần COOL便: kiện đã tick = `完了`; kiện chưa tick → **sinh tag COOL便 mới trạng thái `未配送`**.
- [ ] **AC-84** Mở lại chi tiết COOL便 sau khi hoàn tất → banner 「荷物の配送は完了しました。」
- [ ] **AC-85** `納品備考` hiển thị trong **khung nhấn mạnh riêng có icon** (cả ES配送便 và COOL便).

**トラブル報告**
- [ ] **AC-86** Popup gọi ES hiện khi bấm tab 「トラブル」 **hoặc** icon chuông ở header 荷物受取 / ES配送便 / COOL便.
- [ ] **AC-87** `DA_RPTD_001`: **chỉ hiển thị đơn `未配送`** (theo 「※未配送の注文のみ表示されます。」).
- [ ] **AC-88** Icon loại **3 màu**: xanh = ES配送便 · tím = COOL便 · **cam = kho**.
- [ ] **AC-89** Radio **chỉ chọn 1** điểm; sau khi chọn mới hiện nút 「戻る」「次へ」.
- [ ] **AC-90** Chọn **kho** → hiển thị các đơn **chưa nhận VÀ chưa giao** thuộc kho đó.
- [ ] **AC-91** Checkbox chọn tất cả hiện **trạng thái trung gian (−)** khi chỉ chọn một phần.
- [ ] **AC-92** Vận đơn **bắt buộc ≥1**; nội dung sự cố **bắt buộc chọn 1** trong 4 giá trị.
- [ ] **AC-93** Chọn `その他` → hiện ô lý do **bắt buộc**, 1–255 ký tự, **viền đỏ**.
- [ ] **AC-94** Ảnh sự cố **tùy chọn**, 0–20 ảnh; `備考` **tùy chọn**, 0–500 ký tự, **nhập nhiều dòng**.
- [ ] **AC-95** Nút 「送信」 chỉ active khi **≥1 vận đơn VÀ đã chọn nội dung sự cố**.
- [ ] **AC-96** Modal xác nhận có câu 「送信後、対象の荷物は操作できなくなります。ESキッチンの確認・対応までお待ちください。」
- [ ] **AC-97** Gửi thành công → trạng thái đơn **tự cập nhật thành `トラブル` (đỏ)**; toast 「報告を送信しました。」 trên cùng màn Home (đóng bằng ×); **kiện hàng không thao tác được nữa**.
- [ ] **AC-98** Validate gửi báo cáo ở **phía server**.

---

## Out of Scope

- Màn hình 「マニュアル」 — tab có trong bottom nav nhưng **không có design nào trong Figma `DA - update`** (OQ-01).
- Tạo / sửa / xóa tài khoản tài xế → thuộc E05, xem `features/delivery-partner/SPEC.md`.
- Soạn và đăng thông báo → thuộc E03 (System Admin Web).
- Xử lý phía ES Kitchen sau khi tài xế gọi báo thiếu / gửi báo cáo sự cố → SPEC E03.
- Điều phối, phân công lô hàng, import mã vận đơn từ kho → `features/delivery-dispatching/SPEC.md`.
- Push notification (FCM) — Figma **chỉ có thông báo in-app**, không có push.
- Bản đồ / điều hướng route — Figma không có màn nào.
- Chat / hỗ trợ (HubSpot widget) — có trong SPEC v1 nhưng **không có trong Figma `DA - update`** (OQ-02).

---

## Screens

> **TỔNG: 46 màn hình** = **28 màn chính** + **18 màn phụ** (modal / popup / toast / banner / empty state).
>
> | Loại | Số lượng | Đếm vào tổng? |
> |---|---|---|
> | Màn hình chính | 28 | ✅ |
> | Màn phụ: Modal · Popup · Toast · Banner · Empty state (`E-01`…`E-18`) | 18 | ✅ |
> | **TỔNG MÀN HÌNH** | **46** | |
>
> **Thống kê error display trong `## Screen Details`** (đếm bằng script trên chính file này, không đếm bằng mắt — 28 screen × bảng 8 nhóm Non-Happy = 260 dòng):
>
> | Loại hiển thị | Số dòng | Là màn hình? |
> |---|---|---|
> | Modal (5) · Empty state (7) · Toast (1) · Banner (1) | **14** | ✅ đếm |
> | Inline error (40) · Chặn UI (19) · Button disabled (9) | **68** | ❌ chỉ là state của màn cha |
> | `UNKNOWN` — Figma **không định nghĩa** dạng hiển thị / message | **106** | ⚠️ vào `## Open Questions` |
> | `N/A` — nhóm Non-Happy không áp dụng cho screen đó | **72** | — |
> | **Tổng dòng Non-Happy** | **260** | |
>
> ⚠️ **Lưu ý đọc số:** 18 màn phụ `E-01`…`E-18` **không trùng** với 14 dòng "là màn hình" ở bảng dưới — vì một số `E-xx` là **modal/toast/banner của luồng thành công** (E-01 · E-08 · E-09 · E-10 · E-12 · E-14 · E-15 · E-18), không phải error case nên không xuất hiện trong bảng Non-Happy.
> **106 dòng `UNKNOWN` là con số quan trọng nhất của SPEC này** — phần lớn đến từ việc Figma không định nghĩa lỗi mạng (OQ-08), lỗi server (OQ-08) và session hết hạn (OQ-09) trên cả 28 màn.
>
> **Quy ước ID để trace sang Figma Output 2:** bảng **⑦ ERROR / POPUP INDEX** trong Output 2 đánh số **`D-001` … `D-082`** cho **82 dòng error display loại ĐẾM + STATE**, theo **đúng thứ tự xuất hiện từ trên xuống trong `## Screen Details`** của file này (quét bằng script, bỏ qua dòng `UNKNOWN` và `N/A`).
> Nhờ vậy `D-xxx` trace 1-1 về SPEC mà không cần gắn ID thủ công vào từng dòng. 106 dòng `UNKNOWN` được gom vào bảng **⑤ EXCEPTION MATRIX** dưới dạng 34 `OQ-xx`.

### Màn chính

| Screen Code | Screen | Actor | App | Screen Type | Transition To | Figma Link |
|---|---|---|---|---|---|---|
| `DA_AUTHEN_001` | Đăng nhập | E06 | E06 | Form | `[OK]`→`DA_HOME_001` / `[Quên pass]`→`DA_AUTHEN_002_01` | _(Designer điền)_ |
| `DA_AUTHEN_002_01` | Reset pw B1 — ID + Email | E06 | E06 | Form | `[OK]`→`DA_AUTHEN_002_02` / `[Back]`→`DA_AUTHEN_001` | _(Designer điền)_ |
| `DA_AUTHEN_002_02` | Reset pw B2 — Mã 4 số | E06 | E06 | Form | `[Mã đúng]`→`DA_AUTHEN_002_04` | _(Designer điền)_ |
| `DA_AUTHEN_002_04` | Reset pw B3 — Mật khẩu mới | E06 | E06 | Form | `[OK]`→`DA_AUTHEN_002_06` | _(Designer điền)_ |
| `DA_AUTHEN_002_06` | Reset pw — Hoàn tất | E06 | E06 | Detail | →`DA_HOME_001` (đã auto-login) | _(Designer điền)_ |
| `DA_HOME_001` | Home — Tiến độ + Lịch 3 ngày | E06 | E06 | Dashboard | →`DA_RECV_001`/`DA_COOL_001`/`DA_ESDL_000_0`/`DA_NOTI_001`/`DA_HOME_005`/`DA_LIST_001_Kho`/`E-16` | _(Designer điền)_ |
| `DA_NOTI_001` | Danh sách thông báo | E06 | E06 | List | →`DA_NOTI_002` | _(Designer điền)_ |
| `DA_NOTI_002` | Chi tiết thông báo | E06 | E06 | Detail | →`DA_NOTI_001` (back) | _(Designer điền)_ |
| `DA_HOME_005` | Tài khoản (My Page) | E06 | E06 | Settings | `[Logout]`→`DA_AUTHEN_001` | _(Designer điền)_ |
| `DA_LIST_001_Kho` | 配送一覧 Tab A — 倉庫受取 | E06 | E06 | List | →`DA_RECV_001`/`DA_RECV_003` | _(Designer điền)_ |
| `DA_LIST_002_ES` | 配送一覧 Tab B — 未配送 | E06 | E06 | List | →`DA_ESDL_000_0`/`DA_ESDL_000_1`/`DA_COOL_001` | _(Designer điền)_ |
| `DA_LIST_003_COOL` | 配送一覧 Tab C — 配送完了 | E06 | E06 | List | →`DA_ESDL_000_2`/`DA_ESDL_006`/`DA_COOL_001` | _(Designer điền)_ |
| `DA_RECV_001` | Nhận hàng tại kho — sửa được | E06 | E06 | List | `[Tick hết]`→`E-01` / `[Còn sót]`→`E-02` / `[Back+tick]`→`E-03` | _(Designer điền)_ |
| `DA_RECV_003` | Nhận hàng tại kho — chỉ đọc | E06 | E06 | Detail | ←back `DA_LIST_001_Kho` | _(Designer điền)_ |
| `DA_ESDL_000_0` | ES配送便 — Tab 基本情報 (hôm nay, 未配送) | E06 | E06 | Detail | `[陳列を開始する]`→`DA_ESDL_001` | _(Designer điền)_ |
| `DA_ESDL_000_1` | ES配送便 — dữ liệu tương lai (chỉ đọc) | E06 | E06 | Detail | ←back | _(Designer điền)_ |
| `DA_ESDL_000_2` | ES配送便 — đã hoàn thành | E06 | E06 | Detail | →`DA_ESDL_006` | _(Designer điền)_ |
| `DA_ESDL_001` | Step 1 — 陳列前写真 | E06 | E06 | Wizard | `[続ける]`→`DA_ESDL_002` / `[戻る]`→`DA_ESDL_000_0` | _(Designer điền)_ |
| `DA_ESDL_002` | Step 2 — 在庫/廃棄 | E06 | E06 | Form | `[確認]`→`DA_ESDL_002-05` / `[Scan]`→`E-08` | _(Designer điền)_ |
| `DA_ESDL_002-05` | Step 2 — Kết quả thành công | E06 | E06 | Report | `[続ける]`→`DA_ESDL_003` / `[戻る]`→`DA_ESDL_002` | _(Designer điền)_ |
| `DA_ESDL_003` | Step 3 — 陳列 (検品) | E06 | E06 | Form | `[Không lệch]`→`DA_ESDL_003-06` / `[Có lệch]`→`E-11` / `[Scan]`→`E-10` | _(Designer điền)_ |
| `DA_ESDL_003-06` | Step 3 — Kết quả thành công (bảng 差異) | E06 | E06 | Report | `[続ける]`→`DA_ESDL_004` / `[戻る]`→`DA_ESDL_003` | _(Designer điền)_ |
| `DA_ESDL_004` | Step 4 — 陳列後写真 | E06 | E06 | Wizard | `[続ける]`→`DA_ESDL_005` / `[戻る]`→`DA_ESDL_003-06` | _(Designer điền)_ |
| `DA_ESDL_005` | Step 5 — 集金登録 | E06 | E06 | Form | `[完了]`→`DA_ESDL_006` + `E-12` | _(Designer điền)_ |
| `DA_ESDL_006` | Sau hoàn thành — Tab 陳列情報 + 駐車報告 | E06 | E06 | Detail | `[編集]`→Step tương ứng (≤7 ngày) | _(Designer điền)_ |
| `DA_COOL_001` | COOL便 — Chi tiết giao hàng | E06 | E06 | Detail | `[Tick hết]`→`DA_HOME_001`+`E-14` / `[Còn sót]`→`E-13` | _(Designer điền)_ |
| `DA_RPTD_001` | Báo cáo sự cố — Chọn điểm giao/kho | E06 | E06 | List | `[次へ]`→`DA_RPTD_002` / `[戻る]`→`DA_HOME_001` | _(Designer điền)_ |
| `DA_RPTD_002` | Báo cáo sự cố — Chi tiết | E06 | E06 | Form | `[送信]`→`E-17` / `[戻る]`→`DA_RPTD_001` | _(Designer điền)_ |

### Màn lỗi / modal / toast / banner / empty

| ID | Screen | Hiển thị | Thuộc màn | Transition To |
|---|---|---|---|---|
| `E-01` | Toast 「荷物の受取は完了しました。」 (5 giây) | Toast | `DA_RECV_001` | →`DA_HOME_001` |
| `E-02` | Modal 受取完了確認・ES連絡 (nhận thiếu) | Modal | `DA_RECV_001` | `[完了]`→`DA_HOME_001` / `[キャンセル]`→`DA_RECV_001` |
| `E-03` | Popup 「編集内容を破棄しますか？」 | Modal | `DA_RECV_001` | `[破棄]`→màn trước / `[キャンセル]`→`DA_RECV_001` |
| `E-04` | Toast 「先に倉庫受取を完了してください。」 (cam, 2–3 giây) | Toast | `DA_HOME_001` | — (ở lại) |
| `E-05` | Empty state SOL ちゃん (cả 3 ngày trống) | Empty state | `DA_HOME_001` | — |
| `E-06` | Empty state 「配送予定データはありません。」 (1 ngày trống) | Empty state | `DA_HOME_001` | — |
| `E-07` | Empty state 「データがありません。」 (thông báo rỗng) | Empty state | `DA_NOTI_001` | — |
| `E-08` | Modal スキャン廃棄登録 | Modal | `DA_ESDL_002` | `[続けてスキャン]`→`E-08` / `[一覧に戻る]`→`DA_ESDL_002` |
| `E-09` | Banner 「在庫/廃棄が成功しました。」 + thời gian | Banner | `DA_ESDL_002-05` | — |
| `E-10` | Modal スキャン検品登録 | Modal | `DA_ESDL_003` | `[続けてスキャン]`→`E-10` / `[一覧に戻る]`→`DA_ESDL_003` |
| `E-11` | Modal 陳列完了確認・ES連絡 (có sót / chênh lệch) | Modal | `DA_ESDL_003` | `[報告完了]`→`DA_ESDL_003-06` / `[キャンセル]`→`DA_ESDL_003` |
| `E-12` | Banner 「荷物の配送は完了しました。」 + thời gian (ES配送便) | Banner | `DA_ESDL_006` | — |
| `E-13` | Popup 配送完了確認・ES連絡 (COOL便 giao thiếu) | Modal | `DA_COOL_001` | `[完了]`→`DA_HOME_001` / `[キャンセル / ×]`→`DA_COOL_001` |
| `E-14` | Toast 「荷物配達完了しました。」 (đóng bằng ×) | Toast | `DA_HOME_001` | — |
| `E-15` | Banner 「荷物の配送は完了しました。」 (COOL便 mở lại) | Banner | `DA_COOL_001` | — |
| `E-16` | Popup 「ESキッチンへ電話しますか？」 | Modal | `DA_HOME_001` / `DA_RECV_001` / `DA_ESDL_000_*` / `DA_COOL_001` | `[トラブル報告へ]`→`DA_RPTD_001` / `[戻る]`→`DA_HOME_001` |
| `E-17` | Modal 報告送信確認 | Modal | `DA_RPTD_002` | `[報告する]`→`DA_HOME_001`+`E-18` / `[キャンセル]`→`DA_RPTD_002` |
| `E-18` | Toast 「報告を送信しました。」 (đóng bằng ×) | Toast | `DA_HOME_001` | — |

> **Ghi chú granularity (Test C/D theo `spec-template.md`):**
> - `DA_AUTHEN_002_03` **không phải màn riêng** — là state "nút xác nhận active" của `DA_AUTHEN_002_02`.
> - `DA_ESDL_002-01/-02/-03/-04`, `DA_ESDL_003-01/-02`, `DA_ESDL_001-01/-02`, `DA_ESDL_004-01/-02`, `DA_COOL_001-01/-02/-03`, `DA_RPTD_001-01/-02`, `DA_RPTD_002-01/-02/-03` là **state** của màn tương ứng (default / scan / đã tick / thành công), **không tách Screen Code**.
> - `DA_ESDL_006-01`…`-08` là **các tab của step nav 1–5** trong cùng màn `DA_ESDL_006` → 1 Screen Code.
> - `DA_ESDL_002-05` và `DA_ESDL_003-06` **được tách riêng** vì pass Test C: layout là **bảng kết quả + banner**, khác hẳn layout danh sách nhập liệu của Step 2/3.

---

## Screen Details

> **Cách đọc section này:** mỗi block ghi **layout + component có hành vi/validation** + bảng `Non-Happy Case` rà đủ **8 nhóm** theo `spec-template.md`.
> Danh sách item **đầy đủ từng pixel** đã có sẵn trong bảng mô tả Figma (ID node ghi ở đầu mỗi block) — SPEC **không sao chép lại** để tránh hai nguồn lệch nhau. FE/Designer đọc Figma; QC/TL đọc SPEC.
> Nhóm nào Figma không có case → ghi `N/A — <lý do>`. Nhóm nào Figma **không định nghĩa** → ghi `UNKNOWN` + mã OQ. **Không suy đoán.**

---

### DA_AUTHEN_001 — Đăng nhập
> Nguồn: table `20237:149057` · meta `20238:149526` · URL `/login`

**Happy Case:**
- Layout: 1 cột — hình minh họa ESSTATION (logo + xe tải + tài xế) trên, form giữa, link phụ dưới.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Top | Text | 「今日も一日、安全運転で頑張りましょう。」 | — |
  | Body | Input text | `ログインID` — bắt buộc, 1–255, ASCII. Do công ty vận chuyển ủy thác cấp | Nhập |
  | Body | Input password | Mật khẩu — bắt buộc, ≥8 ký tự, ≥1 chữ, ≥1 số, hiển thị `●` | Nhập |
  | Body | Icon button | Icon mắt | Toggle `password ↔ text` |
  | Body | Link | 「パスワードを忘れた方はこちら」 | → `DA_AUTHEN_002_01` |
  | Bottom | Button primary | Đăng nhập | Validate **tất cả cùng lúc** → API → `DA_HOME_001` |

- Interactions: validate **khi bấm nút** (`ボタンクリック時`), không realtime. **Không có tính năng khóa tài khoản.**
- Animation đề xuất: _(Figma không định nghĩa)_

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Bỏ trống `ログインID` | Inline error | 「ログインIDを入力してください。」 |
| 1 Validation input | Bỏ trống mật khẩu | Inline error | 「パスワードを入力してください。」 |
| 1 Validation input | Mật khẩu <8 ký tự hoặc thiếu chữ/số | Inline error | 「8文字以上で、英字・数字を含めてください。」 |
| 2 Auth | ID hoặc mật khẩu sai | Inline error | 「ログインIDまたはパスワードが正しくありません。」 |
| 3 Network | Mất mạng khi đăng nhập | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 / maintenance | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 5 Empty state | N/A — màn form, không có danh sách | — | — |
| 6 Conflict | N/A — không có thao tác đồng thời | — | — |
| 7 Business rule | N/A — Figma ghi rõ 「ロック機能なし」 | — | — |
| 8 External | N/A — không gọi dịch vụ ngoài | — | — |

---

### DA_AUTHEN_002_01 — Reset mật khẩu B1: ID + Email
> Nguồn: table `20239:150170` · meta `20238:149553` · URL `/reset-password/step1`

**Happy Case:**
- Layout: 1 cột — tiêu đề 「パスワードリセット」, mô tả, 2 ô nhập, nút chính, link quay lại.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Top | Text | 「登録済みのメールアドレスを入力してください。再設定用認証コードをお送りします。」 | — |
  | Body | Input text | `ログインID` — bắt buộc, 1–255, ASCII | Nhập |
  | Body | Input text | Email — bắt buộc, `xxx@xxx.xxx`, ≤256, ASCII | Nhập |
  | Bottom | Button primary | 「認証コードを送信」 | Đối chiếu **cặp ID + email** → gửi mã 4 số → `DA_AUTHEN_002_02` |
  | Bottom | Button | 「ログイン画面に戻る」 | → `DA_AUTHEN_001`, **dữ liệu đang nhập bị hủy** |

- Interactions: validate **toàn bộ cùng lúc khi bấm nút**.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Bỏ trống `ログインID` | Inline error | 「ログインIDを入力してください。」 |
| 1 Validation input | Bỏ trống email | Inline error | 「メールアドレスを入力してください。」 |
| 1 Validation input | Email sai định dạng | Inline error | 「メールアドレスの形式が正しくありません。」 |
| 2 Auth | Cặp ID + email không khớp | Inline error | 「ログインIDまたはメールアドレスが正しくありません。」 |
| 3 Network | Mất mạng khi gửi | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 5 Empty state | N/A — màn form | — | — |
| 6 Conflict | N/A | — | — |
| 7 Business rule | N/A | — | — |
| 8 External | Hệ thống email không gửi được mã | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-11) |

---

### DA_AUTHEN_002_02 — Reset mật khẩu B2: Mã xác thực 4 số
> Nguồn: table `20239:151066` · meta `20238:149552` · URL `/reset-password/step2`
> Bao gồm state `DA_AUTHEN_002_03` (nút xác nhận active).

**Happy Case:**
- Layout: 1 cột — tiêu đề, mô tả, email đã gửi, 4 ô mã, nút xác nhận, link gửi lại + ghi chú hạn dùng.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Top | Text | 「パスワード再設定用メールを送信しました。下記のメールアドレスをご確認ください。」 | — |
  | Body | Text readonly | Email đã nhập bước trước — **có mask hay không: UNKNOWN (OQ-03)** | — |
  | Body | Input × 4 | 4 ô độc lập, mỗi ô 1 chữ số, **chỉ nhận số**, hiệu lực **5 phút** | Nhập → **tự chuyển focus ô kế** |
  | Body | Button (→) | Xác nhận — grayout khi chưa đủ 4 số; active khi đủ (`DA_AUTHEN_002_03`) | Đối chiếu mã → `DA_AUTHEN_002_04` |
  | Bottom | Button + countdown | 「再送信」 — đếm ngược **60 giây** (vd `00:59`), **không giới hạn số lần** | Active sau 0 giây → gửi lại + reset đếm ngược |
  | Bottom | Text | 「※認証コードの有効期限は5分です。」 | — |

- Interactions: đếm ngược bắt đầu **ngay khi màn hiển thị**. **Hết hạn 5 phút màn hình KHÔNG đổi trạng thái.**

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Chưa nhập đủ 4 chữ số | Button disabled | — (nút xám, không có message) |
| 2 Auth | Mã nhập sai | Inline error | 「認証コードが正しくありません。」 |
| 7 Business rule | Mã quá hạn 5 phút | Inline error | 「認証コードが正しくありません。」 — **màn hình không đổi trạng thái khi hết hạn** |
| 3 Network | Mất mạng khi xác nhận / gửi lại | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 5 Empty state | N/A — màn form | — | — |
| 6 Conflict | N/A | — | — |
| 8 External | Email gửi lại không tới | — | N/A — Figma cho gửi lại **không giới hạn số lần**, tài xế tự bấm lại |

---

### DA_AUTHEN_002_04 — Reset mật khẩu B3: Mật khẩu mới
> Nguồn: table `20240:151938` · meta `20238:149554` · URL `/reset-password/step3`

**Happy Case:**
- Layout: 1 cột — tiêu đề, mô tả 「新しいパスワードを入力してください。」, email tham chiếu (chỉ đọc), 2 ô mật khẩu, nút ✓, link quay lại.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Text readonly | Email đã đăng ký — tham chiếu, **không sửa** | — |
  | Body | Input password | Mật khẩu mới — bắt buộc, ≥8, ≥1 chữ, ≥1 số, `●` + icon mắt | Nhập |
  | Body | Input password | Xác nhận mật khẩu — bắt buộc, **trùng khớp tuyệt đối** + icon mắt | Nhập |
  | Bottom | Button primary (✓) | Xác nhận | Validate tất cả cùng lúc → cập nhật mật khẩu → `DA_AUTHEN_002_06` |
  | Bottom | Button | 「ログイン画面に戻る」 | → `DA_AUTHEN_001`, **ngắt luồng reset** |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Bỏ trống mật khẩu mới | Inline error | 「パスワードを入力してください。」 |
| 1 Validation input | Mật khẩu <8 ký tự hoặc thiếu chữ/số | Inline error | 「8文字以上で、英字・数字を含めてください。」 |
| 1 Validation input | Xác nhận không trùng mật khẩu mới | Inline error | 「パスワードが一致しません。」 |
| 2 Auth | Token reset hết hiệu lực giữa chừng | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-12) |
| 3 Network | Mất mạng khi submit | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 5 Empty state | N/A — màn form | — | — |
| 6 Conflict | N/A | — | — |
| 7 Business rule | N/A | — | — |
| 8 External | N/A | — | — |

---

### DA_AUTHEN_002_06 — Reset mật khẩu: Hoàn tất
> Nguồn: table `20240:152458` · meta `20238:149555` · URL `/reset-password/complete`

**Happy Case:**
- Layout: card modal có hình xe tải, đặt trên nền hình minh họa ES STATION.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Card + illustration | Modal card có hình xe tải; **chỉ hiện khi chuyển hợp lệ từ `DA_AUTHEN_002_04`** | — |
  | Body | Text | 「パスワードリセットに成功しました。」 — **phần văn bản tiếp theo: UNKNOWN (OQ-13)** | — |
  | Bottom | Button primary | Về màn hình chính | → `DA_HOME_001` **ở trạng thái đã tự động đăng nhập**, **không qua màn login** |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 2 Auth | Truy cập trực tiếp `/reset-password/complete` mà chưa qua B3 | UNKNOWN | UNKNOWN — Figma chỉ ghi điều kiện hiển thị, không ghi hành vi chặn (OQ-14) |
| 1 Validation input | N/A — màn chỉ đọc | — | — |
| 3 Network | N/A — màn không gọi API | — | — |
| 4 Server error | N/A | — | — |
| 5 Empty state | N/A | — | — |
| 6 Conflict | N/A | — | — |
| 7 Business rule | N/A | — | — |
| 8 External | N/A | — | — |

---

### DA_HOME_001 — Home: Tiến độ + Lịch 3 ngày
> Nguồn: table `20234:148074` (header + tiến độ) · `20231:148602` (lịch) · `20235:148276` (thẻ kho) · `20235:148473` (thẻ COOL/ES) · `20224:209135` (ma trận điều kiện)

**Happy Case:**
- Layout: Header (tên + lời chào + chuông) → khối 本日の配送進捗 → 3 section lịch theo ngày → bottom nav 5 tab.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Text | Tên tài xế đang đăng nhập | — |
  | Header | Text | 「安全運転でいってらっしゃいませ。」 (cố định) | — |
  | Header | Icon button | Chuông thông báo | → `DA_NOTI_001` |
  | Body | Progress block | 本日の配送件数 / 完了件数 / 残り件数 / 進捗率. **Chỉ ES + COOL**; `倉庫から受取` không tính. **Ẩn cả khối** nếu không có dữ liệu hôm nay | — |
  | Body | Section header | 「本日（YYYY-M-D）」「明日（YYYY-M-D）」「明後日（YYYY-M-D）」 | — |
  | Body | Card kho (**cam**) | Tên kho · địa chỉ · `{n}社 {n}箱（冷蔵）{n}品（冷凍）{n}品` · badge 「未受取」. **Chỉ hiện khi `未受取`** | → `DA_RECV_001` |
  | Body | Button | 「詳細表示▼」 / 「非表示▲」 | Mở/đóng vùng chi tiết trên thẻ kho |
  | Body | Card COOL (**tím**) | Tên công ty · kho nguồn · địa chỉ · số lượng · badge `未配送`/`トラブル`. **Ẩn khi `配送完了`** | Thẻ độc lập → `DA_DLVR_001-11` *(xem RQ-B17 CONFLICT)*; trong chi tiết kho → `E-04` |
  | Body | Card ES (**xanh**) | Tên công ty · kho nguồn · địa chỉ · số lượng · badge `未配送`/`トラブル`. **Ẩn khi `配送完了`** | Thẻ độc lập → `DA_DLVR_001-1` *(xem RQ-B17 CONFLICT)*; trong chi tiết kho → `E-04` |
  | Footer | Bottom nav | ホーム · マニュアル · 配送一覧 · トラブル · アカウント | 配送一覧→`DA_LIST_001_Kho` · トラブル→`E-16` · アカウント→`DA_HOME_005` · マニュアル→**UNKNOWN (OQ-01)** |

- Interactions: thứ tự thẻ trong ngày ①COOL`未配送` ②ES`未配送` ③Kho`未受取` ④COOL`トラブル` ⑤ES`トラブル`.
- Animation đề xuất: _(Figma không định nghĩa)_

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 5 Empty state | **Cả 3 ngày** không có lịch giao | Empty state | 「お疲れさまです！今のところ配送予定はありません。予定が入りましたら表示されます。」 (kèm nhân vật SOL ちゃん) |
| 5 Empty state | **Một ngày** không có dữ liệu | Empty state | 「配送予定データはありません。」 |
| 7 Business rule | Bấm thẻ COOL/ES khi kho `未受取` | Toast | 「先に倉庫受取を完了してください。」 — màu **cam**, phía dưới màn, tự ẩn sau **2–3 giây**, **không chuyển màn** |
| 7 Business rule | Đơn ở trạng thái `トラブル` | Banner | Badge đỏ 「トラブル」 — kiện hàng **không thao tác được**, chờ ES Kitchen xác nhận・xử lý |
| 3 Network | Mất mạng khi tải Home | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-09) |
| 6 Conflict | Admin đổi lịch trong lúc tài xế đang xem | UNKNOWN | UNKNOWN — Figma không có cơ chế refresh (OQ-10) |
| 1 Validation input | N/A — màn chỉ đọc, không có form | — | — |
| 8 External | N/A — màn không gọi dịch vụ ngoài | — | — |

---

### DA_NOTI_001 — Danh sách thông báo
> Nguồn: table `20319:242429` mục A

**Happy Case:**
- Layout: Header (back 「＜」 + tiêu đề 「お知らせ一覧」) → danh sách 1 dòng / thông báo → nút tải thêm.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button 「＜」 | Quay lại | → `DA_HOME_001` |
  | Body | List row | Ngày giờ + tiêu đề (**link màu xanh**) + chấm đỏ nếu chưa đọc. **Mới nhất lên đầu**. 0 mục → ẩn danh sách | Tap tiêu đề → `DA_NOTI_002` |
  | Body | Text | Ngày giờ **JST**: trong ngày 「今日・HH:mm」, ngày khác 「M月D日・HH:mm」. **Không dùng「昨日」** | — |
  | Body | Indicator | Chấm đỏ — **chỉ** với thông báo chưa đọc | — |
  | Bottom | Button | 「もっと表示」 — **chỉ hiện khi còn thông báo chưa tải**; số lượng mỗi lần **UNKNOWN (OQ-02)** | Tap **hoặc cuộn xuống** → tải thêm |

- Interactions: **không có** chức năng đánh dấu tất cả đã đọc.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 5 Empty state | Không có thông báo nào | Empty state | 「データがありません。」 |
| 7 Business rule | Đã tải hết thông báo | Button disabled | — (nút 「もっと表示」 **bị ẩn**, không phải disable) |
| 3 Network | Mất mạng khi tải danh sách | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-09) |
| 1 Validation input | N/A — màn chỉ đọc | — | — |
| 6 Conflict | N/A | — | — |
| 8 External | N/A | — | — |

---

### DA_NOTI_002 — Chi tiết thông báo
> Nguồn: table `20319:242429` mục B

**Happy Case:**
- Layout: Header back 「＜」 → tiêu đề → ngày giờ → nội dung → link (nếu có) → file đính kèm (nếu có).
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button 「＜」 | Quay lại | → `DA_NOTI_001` |
  | Body | Title | Tiêu đề do admin đặt. **Giới hạn ký tự do phía admin quản lý, app không giới hạn** | — |
  | Body | Text | Ngày giờ **JST** — cùng quy tắc `DA_NOTI_001` | — |
  | Body | Rich text | Nội dung — **giữ nguyên xuống dòng và đoạn văn** | — |
  | Body | Link | **Chỉ khi nội dung chứa link** | Mở link — **cách mở UNKNOWN (OQ-04)** |
  | Body | Attachment | **Chỉ khi có file đính kèm** | Mở / tải — **định dạng + cách hiển thị UNKNOWN (OQ-05)** |

- Interactions: **khi màn load → gọi API cập nhật đã đọc lên server** (không cần thao tác của tài xế).

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 8 External | File đính kèm không mở/tải được | UNKNOWN | UNKNOWN — Figma ghi 「対応ファイル形式・表示方式は要確認」 (OQ-05) |
| 4 Server error | API đánh dấu đã đọc lỗi | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-15) |
| 3 Network | Mất mạng khi mở chi tiết | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-09) |
| 6 Conflict | Admin xóa thông báo khi tài xế đang mở | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-16) |
| 1 Validation input | N/A — màn chỉ đọc | — | — |
| 5 Empty state | N/A — luôn có nội dung khi vào được màn | — | — |
| 7 Business rule | N/A | — | — |

---

### DA_HOME_005 — Tài khoản (My Page)
> Nguồn: annotation `18870:17324` / `17310` / `17318` / `17311` / `17329` / `17334` / `17339` · frame `16892:78274`

**Happy Case:**
- Layout: Header lời chào → khối 基本情報 dạng label–value → nút đăng xuất → bottom nav.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Text | 「{tên} さん、安全運転でいってらっしゃいませ。」 | — |
  | Body | Section title | 「基本情報」 | — |
  | Body | Field readonly | `ログインID` — format `DR00000` (vd `DR00001`) | — |
  | Body | Field readonly | `メールアドレス` | — |
  | Body | Field readonly | `配送スタッフ名` | — |
  | Body | Field readonly | `カナ` — phiên âm katakana | — |
  | Body | Field readonly | `電話番号` | — |
  | Body | Field readonly | `委託配送先名` — công ty vận chuyển tài xế trực thuộc | — |
  | Body | Button | 「ログアウト」 | Kết thúc phiên → `DA_AUTHEN_001` |
  | Footer | Bottom nav | 5 tab | → tương ứng |

- Interactions: **toàn bộ 6 trường chỉ đọc** — thông tin do delivery admin (E05) nhập, tài xế **không sửa được**.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 3 Network | Mất mạng khi tải thông tin | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-09) |
| 6 Conflict | E05 sửa thông tin khi tài xế đang xem | UNKNOWN | UNKNOWN — Figma không có cơ chế refresh (OQ-10) |
| 1 Validation input | N/A — không có ô nhập nào | — | — |
| 5 Empty state | N/A — tài khoản luôn có đủ 6 trường | — | — |
| 7 Business rule | N/A | — | — |
| 8 External | N/A | — | — |

---

### DA_LIST_001_Kho — 配送一覧 Tab A: 倉庫受取
> Nguồn: meta `20274:174991` · filter/tab `20275:175065` · items `20285:178257`

**Happy Case:**
- Layout: Header 「配送一覧」 → thanh 2 date picker → tab bar 3 tab → thanh lọc (dropdown + search) → danh sách thẻ → bottom nav.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Top | Date picker | `開始日` — mặc định **hôm nay**; chọn được quá khứ/tương lai | Chọn → lọc lại |
  | Top | Date picker | `終了日` — mặc định **hôm nay + 7 ngày**; ràng buộc `≥ 開始日` và khoảng `≤ 31 ngày` | Chọn → lọc lại |
  | Top | Tab bar | A 倉庫受取 (**mặc định**) · B 未配送 · C 配送完了 | → `DA_LIST_002_ES` / `DA_LIST_003_COOL` |
  | Body | Dropdown (**đơn**) | `未受取` · `受取済` · `トラブル`; không chọn = tất cả | Chọn → lọc |
  | Body | Input search | Khớp một phần: `倉庫名`・`中継先`・`納品先拠点名`・`住所` | Gõ → **lọc realtime**; xóa input → hiện lại toàn bộ |
  | Body | Tag | 「倉庫受取」 cố định (**màu xanh lam**) | — |
  | Body | Text | Tên kho / trung chuyển — **tối đa 2 dòng rồi rút gọn (…)** | — |
  | Body | Text | Ngày giao `yyyy-mm-dd（thứ）` — thứ **tính tự động từ ngày** | — |
  | Body | Badge | `未受取` cam / `受取済` xanh lá / `トラブル` đỏ | — |
  | Body | Text | Địa chỉ — dài thì rút gọn `…` | — |
  | Body | Stat | `{n}社` · `{n}箱` — **ẩn `{n}箱` nếu chưa import mã vận đơn** | — |
  | Body | Stat + icon | Bông tuyết `冷凍` (chỉ khi >0) · Tủ lạnh `冷蔵・常温` gộp (chỉ khi >0). Tương lai `{n}個（予定）` · đã picking `{n}箱` · chưa picking `未確定` | — |
  | Body | Card (tappable) | Toàn thẻ | `未受取`+hôm nay → `DA_RECV_001`; còn lại → `DA_RECV_003` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `終了日` < `開始日` | Inline error | 「終了日は開始日以降を選択してください。」 |
| 1 Validation input | Khoảng ngày > 31 ngày | Inline error | 「期間は1ヶ月以内で選択してください。」 |
| 7 Business rule | Chưa import mã vận đơn | Chặn UI | — (**ẩn hẳn** field `{n}箱`, không hiện `0箱`) |
| 7 Business rule | Chưa picking xong (hôm nay/quá khứ) | Inline error | 「未確定」 (hiển thị thay số lượng) |
| 5 Empty state | Khoảng ngày không có bản ghi nào | UNKNOWN | UNKNOWN — Figma không có empty state cho 配送一覧 (OQ-06) |
| 3 Network | Mất mạng khi tải danh sách | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-09) |
| 6 Conflict | Admin đổi điều phối khi tài xế đang xem | UNKNOWN | UNKNOWN — Figma không có cơ chế refresh (OQ-10) |
| 8 External | N/A — màn không gọi dịch vụ ngoài | — | — |

---

### DA_LIST_002_ES — 配送一覧 Tab B: 未配送
> Nguồn: `20297:178978`

**Happy Case:**
- Layout: giống Tab A về khung; khác bộ lọc và nội dung thẻ.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Dropdown (**chọn nhiều**) | Kho / trung chuyển — tham chiếu **master**; không chọn = tất cả | Chọn → lọc |
  | Body | Input search | Tự do trên `納品先拠点名`・`住所`, 0–255 ký tự | **Bấm Enter** mới chạy; xóa input → hiện lại toàn bộ |
  | Body | Text | Tên điểm (tên công ty) — **dài thì xuống dòng hiển thị toàn bộ** (khác Tab A) | — |
  | Body | Icon | Icon loại giao: ES配送便 / COOL便 | — |
  | Body | Badge | `未配送` cam / `トラブル` đỏ | — |
  | Body | Text + icon kho | Tên kho / trung chuyển mà hàng đi qua | — |
  | Body | Text | Địa chỉ **đầy đủ** — gồm tên tòa nhà・tầng・tên công ty・phòng ban | — |
  | Body | Stat | `{n}箱` — tương lai `{n}箱（予定）` · đã picking `{n}箱` · chưa picking **ẩn** | — |
  | Body | Stat + icon | `品数` mát/thường và đông lạnh — chỉ khi **>0 VÀ (đã picking HOẶC tương lai)** | — |
  | Body | Card (tappable) | Toàn thẻ | Theo `## Quy tắc trạng thái & quyền sửa` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Nhập > 255 ký tự vào ô tìm kiếm | Chặn UI | — (chặn input) |
| 1 Validation input | Khoảng ngày sai (như Tab A) | Inline error | 「終了日は開始日以降を選択してください。」/「期間は1ヶ月以内で選択してください。」 |
| 7 Business rule | Chưa picking xong | Chặn UI | — (**ẩn hẳn** `{n}箱` và `品数`) |
| 7 Business rule | Bấm thẻ `トラブル` / dữ liệu tương lai | Chặn UI | — (vào màn chi tiết nhưng **chỉ đọc**, nút thao tác không hiện) |
| 5 Empty state | Không có đơn `未配送` trong khoảng ngày | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-06) |
| 3 Network | Mất mạng | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 6 Conflict | Đơn bị đổi trạng thái bởi admin khi đang xem | UNKNOWN | UNKNOWN (OQ-10) |
| 8 External | N/A | — | — |

---

### DA_LIST_003_COOL — 配送一覧 Tab C: 配送完了
> Nguồn: `20297:179370` — Figma ghi mọi mục C1–C11 là 「タブBと同仕様」

**Happy Case:**
- Layout: **giống hệt Tab B**.
- Components có hành vi: giống Tab B, khác 2 điểm:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Badge | **Chỉ** `配送完了` (xanh lá) | — |
  | Body | Card (tappable) | Toàn thẻ | ES便 ≤7 ngày → sửa được (nút 編集); ES便 >7 ngày → chỉ đọc; COOL便 → chỉ đọc; tương lai → chỉ đọc |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Khoảng ngày sai | Inline error | 「終了日は開始日以降を選択してください。」/「期間は1ヶ月以内で選択してください。」 |
| 7 Business rule | Bấm thẻ ES便 đã **quá 7 ngày** | Chặn UI | — (mở chi tiết nhưng **ẩn nút 「編集」**) |
| 5 Empty state | Chưa hoàn thành đơn nào trong khoảng ngày | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-06) |
| 3 Network | Mất mạng | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 6 Conflict | N/A — dữ liệu đã hoàn tất | — | — |
| 1 Validation input | Nhập > 255 ký tự ô tìm kiếm | Chặn UI | — (chặn input) |
| 8 External | N/A | — | — |

---

### DA_RECV_001 — Nhận hàng tại kho (荷物受取), sửa được
> Nguồn: `20338:264152` (mục A) · connector `18578:41563` (quy tắc tách tag mới)

**Happy Case:**
- Layout: Header (back + 「荷物受取」) → khối thông tin kho → thanh lọc → danh sách vận đơn có checkbox → nút 「完了」.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back | 「＜」 | **0 tick** → về ngay; **≥1 tick** → `E-03` |
  | Header | Title | 「荷物受取」 — cố định giữa header | — |
  | Body | Text | Tên kho xuất hàng (vd 「オージーフーズ倉庫」) — từ API | — |
  | Body | Text | Ngày giao `yyyy-mm-dd` — **tất cả mục cùng ngày, không có giờ cụ thể** | — |
  | Body | Text | `伝票番号` — **nguyên từ dữ liệu import, không giới hạn định dạng/độ dài** | — |
  | Body | Text | Địa chỉ giao hàng — từ API | — |
  | Body | Checkbox | 「未受取のみ表示」 | ON → lọc **realtime phía client** chỉ `未受取`; OFF → tất cả |
  | Body | Input search | 「納品先名」 — **tối đa 100 ký tự (chặn input)**, placeholder 「納品先名」 | Gõ → lọc **realtime phía client** |
  | Body | Checkbox (per dòng) | **Chỉ tick từng mục — KHÔNG có nút chọn tất cả**. ≥1 tick = trạng thái「đang chỉnh sửa」 | Tick → badge dòng đổi `未受取`→`受取済` |
  | Body | Badge (per dòng) | `未受取` (ban đầu) / `受取済` (đã tick) / `トラブル` (**độc lập với checkbox**) | — |
  | Body | Text (per dòng) | Tên công ty điểm nhận · `送り状番号` (nguyên từ import) | — |
  | Footer | Button primary | 「完了」 — **grayout khi 0 tick (không có message)**, active khi ≥1 tick | Tick hết → `E-01`; còn sót → `E-02` |

- Interactions: lọc + tìm kiếm **phía client**; trạng thái tick giữ nguyên khi bật/tắt lọc.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Gõ quá 100 ký tự vào ô tìm kiếm | Chặn UI | — (**chặn input**, không báo lỗi) |
| 7 Business rule | Chưa tick vận đơn nào | Button disabled | — (nút xám; Figma ghi rõ 「チェックなし時はボタン非活性のためエラーメッセージなし」) |
| 7 Business rule | Bấm 完了 khi còn vận đơn chưa tick | Modal | 「荷物の受取は完了しましたか？」 + 「一部の荷物が未確認の状態です。すべて受取していない場合は、ESキッチンまでご連絡ください。」 |
| 7 Business rule | Vận đơn đã bị báo sự cố ở chức năng khác | Inline error | Badge 「トラブル」 — **không đổi được bằng tick** |
| 6 Conflict | Bấm back khi đã tick ≥1 | Modal | 「編集内容を破棄しますか？」 |
| 5 Empty state | Bật 「未受取のみ表示」 khi đã tick hết | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-17) |
| 3 Network | Mất mạng khi bấm 完了 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API xử lý hoàn tất lỗi | UNKNOWN | UNKNOWN — Figma không định nghĩa rollback trạng thái tick (OQ-18) |
| 2 Auth | Session hết hạn giữa lúc đang tick | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-09) |
| 8 External | Thiết bị không mở được app điện thoại khi bấm gọi ES | UNKNOWN | UNKNOWN — Figma không định nghĩa fallback (OQ-19) |

---

### DA_RECV_003 — Nhận hàng tại kho, chỉ đọc
> Nguồn: symbol `20262:41179` (tên frame) · quyền sửa từ `20285:178257` mục A.12
> ⚠️ **Figma KHÔNG có bảng mô tả riêng cho màn này** — chỉ có tên symbol và quy tắc quyền sửa. Nội dung chi tiết là **UNKNOWN (OQ-20)**; SPEC **không suy đoán** component.

**Happy Case:**
- Layout: UNKNOWN — Figma không có bảng mô tả. Theo `20285:178257` A.12, đây là đích đến khi trạng thái là `受取済` / `トラブル` / quá khứ / tương lai, và **quyền là chỉ đọc**.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | — | UNKNOWN | Figma không định nghĩa danh sách item cho `DA_RECV_003` (OQ-20) | — |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | N/A — Figma xác định màn là **chỉ đọc** | — | — |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 3 Network | Mất mạng khi tải | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 5 Empty state | UNKNOWN | UNKNOWN | UNKNOWN (OQ-20) |
| 6 Conflict | N/A — chỉ đọc | — | — |
| 7 Business rule | N/A — mọi thao tác đã bị chặn bởi quyền chỉ đọc | — | — |
| 8 External | N/A | — | — |

---

### DA_ESDL_000_0 — ES配送便: Tab 基本情報 (hôm nay, 未配送)
> Nguồn: `23134:63310` (mục A)

**Happy Case:**
- Layout: Header (back + 「ES配送便」) → thẻ điểm giao → khối thông tin chi tiết → `納品備考` (khung nhấn mạnh) → tóm tắt số thùng → danh sách vận đơn → nút 「陳列を開始する」.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back | 「＜」 — **0 tick → về ngay; ≥1 tick → popup hủy chỉnh sửa** | → màn trước |
  | Header | Title | 「ES配送便」 — cố định giữa header | — |
  | Body | Text | Tên điểm giao (từ API) · ngày giao `yyyy-mm-dd（曜日）` | — |
  | Body | Badge | `未配送` / `配送完了` / `トラブル` (**độc lập với checkbox**) | — |
  | Body | Text | Mã bưu điện · địa chỉ · người phụ trách · số điện thoại | — |
  | Body | Info box | `納品備考` — **khung nhấn mạnh riêng có icon**; ghi chỉ dẫn địa điểm nhận・cách nhận・liên hệ・điểm đặc biệt | — |
  | Body | Stat | 「〇箱」 (tổng) /「〇品」+icon lạnh /「〇品」+icon đông | — |
  | Body | List | Danh sách `送り状番号` **kèm số thứ tự, không thể chạm** | — |
  | Footer | Button primary | 「陳列を開始する」 — **chỉ hiện khi `未配送` VÀ đơn giao trong ngày hôm nay**; đơn tương lai **không hiện** | → `DA_ESDL_001` (Step 1) |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 7 Business rule | Đơn ngày tương lai | Chặn UI | — (**nút 「陳列を開始する」 không hiện** → `DA_ESDL_000_1`) |
| 7 Business rule | Đơn `トラブル` | Chặn UI | — (chỉ đọc, kiện hàng không thao tác được, chờ ES Kitchen) |
| 6 Conflict | Bấm back khi đã có thao tác checkbox | Modal | 「編集内容を破棄しますか？」 |
| 3 Network | Mất mạng khi tải chi tiết | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — tab 基本情報 không có ô nhập | — | — |
| 5 Empty state | N/A — luôn có ≥1 vận đơn khi vào được màn | — | — |
| 8 External | N/A | — | — |

---

### DA_ESDL_000_1 — ES配送便: dữ liệu tương lai (chỉ đọc)
> Nguồn: frame `19036:18274` 「DA_ESDL_000_1 future data(Cannot edit future data)」 · quyền sửa `20297:178978` B12

**Happy Case:**
- Layout: giống `DA_ESDL_000_0`, **bỏ nút 「陳列を開始する」**.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Toàn bộ khối thông tin | Giống `DA_ESDL_000_0` | — |
  | Body | Stat | Số lượng hiển thị dạng `{số đặt}個（予定）` (dữ liệu tương lai) | — |
  | Footer | Button 「陳列を開始する」 | **Không hiện** — tên frame Figma ghi rõ `Cannot edit future data` | — |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 7 Business rule | Tài xế muốn bắt đầu trưng bày sớm | Chặn UI | — (nút không hiện; Figma: 「未来日の配送では非表示」) |
| 3 Network | Mất mạng khi tải | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — chỉ đọc | — | — |
| 5 Empty state | N/A | — | — |
| 6 Conflict | N/A — chỉ đọc | — | — |
| 8 External | N/A | — | — |

---

### DA_ESDL_000_2 — ES配送便: đã hoàn thành
> Nguồn: frame `19663:152788` / symbol `20266:174078` 「DA_ESDL_000_2 Completed(Editable until 7 days before)」 · quyền sửa `20297:179370` C12 · `23747:111658` mục 8

**Happy Case:**
- Layout: giống `DA_ESDL_000_0` + banner hoàn tất; có tab để sang 陳列情報.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Banner | 「荷物の配送は完了しました。」 + thời gian `yyyy年mm月dd日HH時mm分` | — |
  | Body | Badge | `配送完了` (xanh lá) | — |
  | Body | Tab | Chuyển sang tab 陳列情報 | → `DA_ESDL_006` |
  | Body | Button 「編集」 | **Chỉ hiện trong 7 ngày** kể từ khi hoàn tất; quá 7 ngày → **ẩn** | → màn chỉnh sửa bước đang xem |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 7 Business rule | Quá 7 ngày sau khi hoàn tất | Chặn UI | — (**nút 「編集」 bị ẩn**, chỉ xem) |
| 3 Network | Mất mạng khi tải | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — tab 基本情報 chỉ đọc | — | — |
| 5 Empty state | N/A | — | — |
| 6 Conflict | N/A | — | — |
| 8 External | N/A | — | — |

---

### DA_ESDL_001 — Step 1: 陳列前写真 (ảnh trước trưng bày)
> Nguồn: `23266:36257`

**Happy Case:**
- Layout: Header (back + 「陳列前」) → thẻ điểm giao → thanh tiến trình 5 bước → mục tải ảnh → liên hệ khẩn cấp → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back 「＜」 | Về **ngay** màn trước | → `DA_ESDL_000_0` |
  | Header | Title | 「陳列前」 — cố định giữa header | — |
  | Body | Card | Thẻ điểm giao — **cùng thông số** với thẻ ở tab 基本情報 (tên điểm giao / ngày giao `yyyy-mm-dd（曜日）` / trạng thái) | — |
  | Body | Step indicator | 5 bước ①陳列前 ②在庫/廃棄 ③陳列 ④陳列後 ⑤完了. **Không chạm để di chuyển** — chỉ bằng 「戻る」「続ける」. Hoàn thành = tròn xanh+✓+chữ xanh · hiện tại = tròn xanh+số+chữ xanh · chưa hoàn thành = tròn xám+số+chữ xám | — |
  | Body | Text | 「冷蔵庫・ボックス内の陳列前写真をアップロードしてください。」 | — |
  | Body | Upload area | **Tối thiểu 1, tối đa 20 ảnh**. Chưa tải → 「写真はまだありません」 + placeholder. Đang tải → 「loading」 | Click |
  | Body | Button (×) | Nút xóa ảnh — ở **góc trên phải mỗi thumbnail**. **Thay ảnh = xóa rồi tải lại** | Click → xóa ảnh đó |
  | Body | Button chọn file | Khởi động **camera hoặc chọn file trong máy**. JPEG/PNG/HEIC/WebP **（提案）**, tối đa 10MB/file **（提案）** | Click |
  | Body | Text | 「※ご不明な点は弊社代表番号で、緊急連絡先の「050-5784-2777」までお願いします。」 | — |
  | Footer | Button 「戻る」 | Về màn chi tiết ES配送便 | → `DA_ESDL_000_0` |
  | Footer | Button 「続ける」 | **Chỉ active khi đã tải ≥1 ảnh**; chưa tải → grayout | → `DA_ESDL_002` (Step 2) |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Tải ảnh sai định dạng | Inline error | 「対応していないファイル形式です」 |
| 1 Validation input | File > 10MB | Inline error | 「ファイルサイズは10MB以下にしてください」 |
| 1 Validation input | Tải quá 20 ảnh | Inline error | 「写真は最大20枚までです」 |
| 7 Business rule | Chưa tải ảnh nào | Button disabled | — (nút 「続ける」 grayout) |
| 5 Empty state | Chưa tải ảnh nào | Empty state | 「写真はまだありません」 (+ placeholder) |
| 3 Network | Mất mạng khi upload ảnh | UNKNOWN | UNKNOWN — Figma chỉ định nghĩa trạng thái 「loading」 (OQ-08) |
| 4 Server error | API upload lỗi | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn khi đang upload | UNKNOWN | UNKNOWN (OQ-09) |
| 6 Conflict | N/A — Figma không mô tả thao tác đồng thời | — | — |
| 8 External | Thiết bị không mở được camera | UNKNOWN | UNKNOWN — Figma không định nghĩa fallback (OQ-19) |

---

### DA_ESDL_002 — Step 2: 在庫/廃棄 (kiểm tồn kho & đăng ký hàng hủy)
> Nguồn: `23335:36257` · modal quét `25152:42096` · connector `18681:12739`

**Happy Case:**
- Layout: Header (back + 「在庫/廃棄」) → thẻ điểm giao → step indicator → tiêu đề + hướng dẫn → khu tìm kiếm/quét → danh sách sản phẩm → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Section title | 「廃棄登録と実在庫の確認」 | — |
  | Body | Text | 「廃棄数を確認のうえ、残りの実在庫を確認してください。確認が完了した商品は、チェックしてください。※検索または商品スキャンからも廃棄登録できます。」 | — |
  | Body | Input search | Khớp một phần **tên sản phẩm hoặc mã sản phẩm (barcode)** | Gõ → lọc **realtime trong màn** |
  | Body | Button quét mã | **Sản phẩm không có trong danh sách vẫn đăng ký hủy được bằng quét** | Quét → `E-08` (modal đăng ký hủy) |
  | Body | Text | 「※次回納品日 〇月〇日」 — hệ thống tự động hiển thị. **Có hiển thị năm hay không: UNKNOWN (OQ-21)** | — |
  | Body | Checkbox | 「未確認のみ表示」 | ON → chỉ hiện sản phẩm cột `確認` **chưa tích** |
  | Body | Text (per dòng) | Tên sản phẩm | — |
  | Body | Checkbox (per dòng) | `確認` — đánh dấu đã xác nhận tồn kho thực. **Bật → nút −/＋ và ô nhập `廃棄数`・`実在庫` cùng dòng bị grayout**. Sản phẩm đăng ký hủy bằng quét **tự động bật** | Click |
  | Body | Text + tooltip (per dòng) | `理論在庫` — số tồn **dựa trên thực tế mua hàng**, giá trị hệ thống tính. Tooltip 「理論在庫：購入実績ベースの在庫数です。」 | Hover icon ？ |
  | Body | Number input (per dòng) | `廃棄数（△）` — số nguyên **≥0**, nút −/＋ hoặc nhập trực tiếp. Tooltip 「次回納品日までに賞味期限切れとなる商品を回収後、数量を入力してください。」. Thay đổi → **tự tính lại `実在庫`**. Grayout khi đã tích `確認` | Nhập / Click |
  | Body | Number input (per dòng) | `実在庫（廃棄後）` = `理論在庫 − 廃棄数` **tự động tính, vẫn sửa thủ công được**. Tooltip 「実在庫＝理論在庫−廃棄数（自動計算されます。手動で変更可能）」. Grayout khi đã tích `確認` | Nhập / Click / Tự động |
  | Footer | Button 「戻る」 | Về Step 1. **Việc giữ lại dữ liệu đã nhập: UNKNOWN (OQ-22)** | → `DA_ESDL_001` |
  | Footer | Button 「確認」 | **Chỉ active khi TẤT CẢ sản phẩm đều đã tích `確認`**; chưa xong → grayout | → `DA_ESDL_002-05` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `廃棄数` không phải số nguyên ≥0 | Inline error | 「廃棄数は0以上の整数で入力してください」 |
| 1 Validation input | `実在庫` không phải số nguyên ≥0 | Inline error | 「実在庫は0以上の整数で入力してください」 |
| 7 Business rule | Chưa tích `確認` hết tất cả sản phẩm | Button disabled | — (nút 「確認」 grayout) |
| 7 Business rule | Đã tích `確認` một dòng | Chặn UI | — (nút −/＋ và ô nhập cùng dòng bị **grayout**) |
| 3 Network | Mất mạng khi bấm 確認 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn giữa lúc nhập | UNKNOWN | UNKNOWN (OQ-09) |
| 5 Empty state | Bật 「未確認のみ表示」 khi đã tích hết | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-17) |
| 6 Conflict | Bấm 「戻る」 về Step 1 | UNKNOWN | UNKNOWN — 「入力データ保持の有無は要確認」 (OQ-22) |
| 8 External | Thiết bị không mở được camera để quét barcode | UNKNOWN | UNKNOWN — Figma không định nghĩa fallback (OQ-19) |

---

### DA_ESDL_002-05 — Step 2: Kết quả thành công
> Nguồn: `24731:177078`
> Tách riêng theo **Test C**: layout là **banner + bảng kết quả**, khác hẳn layout danh sách nhập liệu của `DA_ESDL_002`.

**Happy Case:**
- Layout: Header + thẻ điểm giao (**cùng thông số Step 2**) → banner hoàn tất → step indicator → bảng tóm tắt → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Banner (xanh lá) | Ở **trên cùng màn**: icon ✓ + 「在庫/廃棄が成功しました。」 + thời gian xử lý `yyyy年mm月dd日HH時mm分`. Hiện sau khi bấm 「確認」 ở Step 2 | — |
  | Body | Step indicator | ①陳列前 = ✓ · ②在庫/廃棄 = ✓ · ③陳列 = **bước tiếp theo (số xám)** · ④⑤ = chưa hoàn thành | — |
  | Body | Section title | 「廃棄登録と実在庫の確認」 | — |
  | Body | Table | `連番` (số thứ tự) · `商品名` · `廃棄数（△）` (giá trị chốt ở Step 2) · `実在庫` (giá trị chốt ở Step 2) | — |
  | Footer | Button 「戻る」 | Về màn nhập Step 2 | → `DA_ESDL_002` |
  | Footer | Button 「続ける」 | **Active (xanh)** | → `DA_ESDL_003` (Step 3) |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 3 Network | Mất mạng khi tải màn kết quả | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — màn chỉ đọc kết quả | — | — |
| 5 Empty state | N/A — luôn có ≥1 sản phẩm khi vào được màn | — | — |
| 6 Conflict | N/A | — | — |
| 7 Business rule | N/A — nút 「続ける」 luôn active | — | — |
| 8 External | N/A | — | — |

---

### DA_ESDL_003 — Step 3: 陳列 (検品 — trưng bày & kiểm số lượng)
> Nguồn: `23451:37606` · modal quét `23497:38196` · modal chênh lệch `23514:38197` · connector `23371:142972` / `23371:142973` / `18784:14510`

**Happy Case:**
- Layout: Header (back + 「陳列」) → thẻ điểm giao → step indicator → khu tìm kiếm/quét → danh sách sản phẩm → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Button quét mã | Quét để kiểm phẩm | Quét → `E-10` (modal kiểm phẩm) |
  | Body | Checkbox (per dòng) | `確認` — đánh dấu **đã kiểm tra / trưng bày xong**. Bật → nút −/＋ và ô `実際数` cùng dòng **grayout**. Sản phẩm đăng ký bằng quét **tự động bật** | Click |
  | Body | Text (per dòng) | Tên sản phẩm + 「予定数：〇個」 (hệ thống tự hiển thị, **không thể chạm**) | — |
  | Body | Number input (per dòng) | `実際数` — số nguyên **≥0**, nút −/＋ hoặc nhập trực tiếp. **Giá trị ban đầu = `予定数`**. `実際数 ≠ 予定数` → **coi là chênh lệch**. Grayout khi đã tích `確認` | Nhập / Click |
  | Footer | Button 「戻る」 | Về Step 2 — **dữ liệu đã nhập được giữ lại** | → `DA_ESDL_002` |
  | Footer | Button 「確認」 | Active khi **≥1** dòng đã tích (khác Step 2 yêu cầu tất cả); chưa tích cái nào → grayout | **Không sót & không chênh lệch** → `DA_ESDL_003-06`; **có sót HOẶC có chênh lệch** → `E-11` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `実際数` không phải số nguyên ≥0 | Inline error | 「実際数は0以上の整数で入力してください」 |
| 7 Business rule | Chưa tích dòng nào | Button disabled | — (nút 「確認」 grayout) |
| 7 Business rule | Bấm 確認 khi **còn sản phẩm chưa xác nhận** hoặc **có chênh lệch `実際数 ≠ 予定数`** | Modal | 「荷物の陳列は完了しましたか？」 + 「一部の荷物が未確認の状態、または差異が発生しております。」 + 「ESキッチンまで連絡する必要があります。」 |
| 7 Business rule | Đã tích `確認` một dòng | Chặn UI | — (nút −/＋ và ô `実際数` cùng dòng bị **grayout**) |
| 3 Network | Mất mạng khi bấm 確認 | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn giữa lúc nhập | UNKNOWN | UNKNOWN (OQ-09) |
| 5 Empty state | N/A — Figma không có empty state cho danh sách sản phẩm Step 3 | — | — |
| 6 Conflict | Điều kiện hiện popup ghi khác nhau giữa connector và bảng | UNKNOWN | ⚠️ **CONFLICT RQ-E35** — cần BrSE chốt (OQ-23) |
| 8 External | Thiết bị không mở được camera để quét | UNKNOWN | UNKNOWN (OQ-19) |

---

### DA_ESDL_003-06 — Step 3: Kết quả thành công (bảng 差異)
> Nguồn: `24891:96525`
> Hiện sau khi bấm 「確定」 (không chênh lệch) **hoặc** 「報告完了」 (có chênh lệch, đã liên hệ ES).

**Happy Case:**
- Layout: Header + thẻ điểm giao (cùng thông số Step 2) → banner hoàn tất → step indicator → bảng kết quả → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Banner (xanh lá) | Icon ✓ + 「在庫/廃棄が成功しました。」 + thời gian `yyyy年mm月dd日HH時mm分` | — |
  | Body | Table | `連番` · `商品` (**dài thì rút gọn `…`**) · `予定数` (hệ thống tự hiển thị) · `実際数` (giá trị chốt ở Step 3) · `差異` | — |
  | Body | Table cell | `差異 = 予定数 − 実際数` **tự động tính**. Màu: **0 = đen** · **giá trị âm (thực tế NHIỀU hơn dự kiến) = cam** · **giá trị dương (thực tế ÍT hơn dự kiến) = xanh lá** | — |
  | Footer | Button 「戻る」 | Về màn nhập Step 3 | → `DA_ESDL_003` |
  | Footer | Button 「続ける」 | **Active (xanh)** | → `DA_ESDL_004` (Step 4) |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 3 Network | Mất mạng khi tải màn kết quả | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — màn chỉ đọc kết quả | — | — |
| 5 Empty state | N/A — luôn có ≥1 sản phẩm | — | — |
| 6 Conflict | N/A | — | — |
| 7 Business rule | N/A — nút 「続ける」 luôn active | — | — |
| 8 External | N/A | — | — |

---

### DA_ESDL_004 — Step 4: 陳列後写真 (ảnh sau trưng bày)
> Nguồn: `24942:90741`

**Happy Case:**
- Layout: Header (back + 「陳列後」) → thẻ điểm giao → step indicator → mục tải ảnh → liên hệ khẩn cấp → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back 「＜」 | Về **ngay** màn chi tiết giao hàng ES | → `DA_ESDL_000_0` |
  | Header | Title | 「陳列後」 — cố định giữa header | — |
  | Body | Upload area | **Tối thiểu 1, tối đa 20 ảnh**. Chưa tải → 「写真はまだありません」 + placeholder. Đang tải → 「loading」 | Click |
  | Body | Button (×) | Xóa ảnh — góc trên phải thumbnail. Thay ảnh = xóa rồi tải lại | Click |
  | Body | Button chọn file | Camera hoặc file trong máy. JPEG/PNG/HEIC/WebP **（提案）**, ≤10MB/file **（提案）** | Click |
  | Body | Text | 「※ご不明な点は弊社代表番号で、緊急連絡先の「050-5784-2777」までお願いします。」 | — |
  | Footer | Button 「戻る」 | Về **Step 3 màn thành công** | → `DA_ESDL_003-06` |
  | Footer | Button 「続ける」 | **Chỉ active khi đã tải ≥1 ảnh**; chưa tải → grayout | → `DA_ESDL_005` (Step 5 集金登録) |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Tải ảnh sai định dạng | Inline error | 「対応していないファイル形式です」 |
| 1 Validation input | File > 10MB | Inline error | 「ファイルサイズは10MB以下にしてください」 |
| 1 Validation input | Tải quá 20 ảnh | Inline error | 「写真は最大20枚までです」 |
| 7 Business rule | Chưa tải ảnh nào | Button disabled | — (nút 「続ける」 grayout) |
| 5 Empty state | Chưa tải ảnh nào | Empty state | 「写真はまだありません」 (+ placeholder) |
| 3 Network | Mất mạng khi upload | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API upload lỗi | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn khi đang upload | UNKNOWN | UNKNOWN (OQ-09) |
| 6 Conflict | N/A | — | — |
| 8 External | Thiết bị không mở được camera | UNKNOWN | UNKNOWN (OQ-19) |

---

### DA_ESDL_005 — Step 5: 集金登録 (đăng ký thu tiền)
> Nguồn: `23559:38617` · banner hoàn tất `23244:36210`

**Happy Case:**
- Layout: Header + thẻ điểm giao → step indicator → mục nhập thu tiền → nút 「完了」.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Text readonly | `集金予定額` — hệ thống tự hiển thị, **không sửa (nền xám)**, phân cách 3 chữ số + 「円」 (vd `10,000 円`) | — |
  | Body | Number input | `実集金額` — tài xế nhập thủ công, **giá trị ban đầu 0**, số nguyên **0–999,999**, phân cách 3 chữ số + 「円」 | Nhập |
  | Footer | Button 「完了」 | **LUÔN active**. Bấm → hoàn tất toàn bộ quy trình, **KHÔNG hiện hộp thoại xác nhận**, cập nhật trạng thái thành `配送完了`, quay về màn chi tiết ES配送便. Validate **phía server** | → `DA_ESDL_006` + banner `E-12` |

- Interactions: `実集金額` chưa nhập (vẫn 0) **hoặc** khác `集金予定額` → **hiện cảnh báo VÀ thông báo cho admin**; **sau cảnh báo vẫn bấm 「完了」 được**.

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | `実集金額` ngoài khoảng 0–999,999 hoặc không phải số nguyên | Inline error | 「実集金額は0〜999,999の整数で入力してください」 |
| 7 Business rule | `実集金額` chưa nhập (vẫn 0) **hoặc** khác `集金予定額` | UNKNOWN | 「実集金額が未入力、または集金予定額と一致しません。ご確認ください。」 — **Figma ghi 「警告を表示」 nhưng KHÔNG nói dạng hiển thị nào (toast/banner/inline)** → OQ-24. **Vẫn cho bấm 完了** |
| 3 Network | Mất mạng khi bấm 完了 | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API hoàn tất lỗi (validate phía server) | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn khi đang nhập | UNKNOWN | UNKNOWN (OQ-09) |
| 5 Empty state | N/A — màn chỉ có 2 trường | — | — |
| 6 Conflict | N/A | — | — |
| 8 External | N/A — Figma không mô tả tích hợp thanh toán ở màn này | — | — |

---

### DA_ESDL_006 — Sau hoàn thành: Tab 陳列情報 + 駐車報告
> Nguồn: tab 陳列情報 `23747:111658` · 駐車報告 chỉ đọc `23693:39294` · 駐車報告 chỉnh sửa `23698:40099` · banner `23244:36210` · connector `18870:15080/15085/15090/15100`

**Happy Case:**
- Layout: Header → banner hoàn tất → tab (基本情報 / 陳列情報) → step nav 1–5 → nội dung bước đang chọn → khối 駐車報告.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Body | Banner (xanh lá) | Ngay dưới header: icon ✓ + 「荷物の配送は完了しました。」 + thời gian `yyyy年mm月dd日HH時mm分`. **Chỉ hiện khi đã hoàn tất cả 5 bước và bấm 完了 ở bước cuối** | — |
  | Body | Step nav (1–5) | ①陳列前 ②在庫/廃棄 ③陳列 ④陳列後 ⑤集金登録. **Chạm từng bước để chuyển xem nội dung**. Đang chọn = tròn xanh+số+chữ xanh · chưa chọn (đã hoàn thành) = tròn xanh+✓+chữ xanh. **Chỉ truy cập được sau khi hoàn tất 5 bước** | Click |
  | Body | Section title | Tên bước đang chọn (vd 「①陳列前」) | — |
  | Body | Thumbnail list | ①陳列前 / ④陳列後: danh sách ảnh đã tải dạng thumbnail | **Chạm để phóng to** |
  | Body | Table | ②在庫/廃棄: `商品名` / `廃棄数` / `実在庫` | — |
  | Body | Table | ③陳列: `商品名` / `予定数` / `実際数` / `差異` | — |
  | Body | Text | ⑤集金登録: `集金予定額` / `実集金額` | — |
  | Body | Button 「編集」 | **Chỉ hiện trong vòng 7 ngày** sau khi giao hàng hoàn tất. Bấm → màn chỉnh sửa của **bước đang xem** (vd đang xem ①陳列前 → Step1 edit). **Quá 7 ngày → ẩn (chỉ xem)** | → Step tương ứng |
  | Body | Section title | 「駐車報告」 | — |
  | Body | Icon button (✏️) | **Chỉ ở chế độ chỉ đọc**; vẫn hiện nếu **trong vòng 7 ngày** sau hoàn tất | → chế độ chỉnh sửa |
  | Body | Image (chỉ đọc) | Ảnh hóa đơn đã đăng ký; chưa có → placeholder 「領収書をアップロード」 | — |
  | Body | Text (chỉ đọc) | Phí đỗ xe (phân cách 3 chữ số + 「円」); chưa có → 「0 円」 | — |
  | Body | Icon button (×) | **Chế độ chỉnh sửa**: hủy nội dung chỉnh sửa, về chế độ chỉ đọc. **KHÔNG hiện hộp thoại xác nhận** | Click |
  | Body | Icon button (💾) | **Chế độ chỉnh sửa**: validate rồi lưu, về chế độ chỉ đọc. **Ảnh hóa đơn chưa có → KHÔNG lưu được** | Click |
  | Body | Upload (chỉnh sửa) | Ảnh hóa đơn — **BẮT BUỘC, tối đa 1 ảnh**, camera hoặc file, JPEG/PNG/HEIC/WebP, ≤10MB. Tải rồi vẫn xóa・thay được. Chưa có → 「写真はまだありません」 + placeholder | Click |
  | Body | Number input (chỉnh sửa) | Phí đỗ xe — **tùy chọn**, số nguyên **0–999,999**, giá trị ban đầu 0, phân cách 3 chữ số + 「円」 | Nhập |

- Interactions: connector Figma có 4 nhãn 「Step 1 edit」「Step 2 edit」「Step 3 edit」「Step 5 edit」 — **không có 「Step 4 edit」** (RQ-E62 → OQ-25).

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Bấm 💾 lưu khi chưa có ảnh hóa đơn | Inline error | 「レシート画像をアップロードしてください」 |
| 1 Validation input | Ảnh hóa đơn sai định dạng | Inline error | 「対応していないファイル形式です」 |
| 1 Validation input | Ảnh hóa đơn > 10MB | Inline error | 「ファイルサイズは10MB以下にしてください」 |
| 1 Validation input | Phí đỗ xe ngoài 0–999,999 | Inline error | 「駐車料金は0〜999,999の整数で入力してください」 |
| 7 Business rule | **Quá 7 ngày** sau khi hoàn tất | Chặn UI | — (nút 「編集」 và icon ✏️ **bị ẩn**, chỉ xem) |
| 5 Empty state | Chưa có ảnh hóa đơn (chế độ chỉ đọc) | Empty state | 「領収書をアップロード」 (placeholder) |
| 6 Conflict | Bấm × hủy chỉnh sửa | Chặn UI | — (về chế độ chỉ đọc, **không hiện hộp thoại xác nhận**) |
| 3 Network | Mất mạng khi lưu 駐車報告 | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API lưu lỗi (Figma ghi validate 「両方」 = cả client và server) | UNKNOWN | UNKNOWN — Figma không định nghĩa message (OQ-08) |
| 2 Auth | Session hết hạn khi đang chỉnh sửa | UNKNOWN | UNKNOWN (OQ-09) |
| 8 External | Thiết bị không mở được camera | UNKNOWN | UNKNOWN (OQ-19) |

---

### DA_COOL_001 — COOL便: Chi tiết giao hàng
> Nguồn: `23808:112206` · popup `23808:112820` · sau hoàn tất `23808:113126` · connector `18870:187993` / `18870:188552` / `18870:187992` / `20266:170407`

**Happy Case:**
- Layout: Header (back + tiêu đề) → thẻ điểm giao → khối thông tin chi tiết → `納品備考` → tóm tắt số thùng → danh sách vận đơn có checkbox → nút 「完了」.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back 「＜」 | Quay lại | → `DA_LIST_002_ES` / `DA_HOME_001` |
  | Header | Title | 「COOL便」 **hoặc** 「荷物受取」 | — |
  | Body | Text | Tên điểm giao (từ API) · ngày giao `yyyy-mm-dd（曜日）` — **tất cả mục cùng ngày, không có giờ cụ thể** | — |
  | Body | Badge | `未配送` / `配送完了` / `トラブル` (**độc lập với checkbox**), tự cập nhật theo trạng thái checkbox | — |
  | Body | Text | Mã bưu chính — vd `151-0051`, **kèm dấu gạch ngang, nguyên giá trị master** | — |
  | Body | Text | Địa chỉ · người phụ trách · số điện thoại | — |
  | Body | Info box | `納品備考` — **khung nhấn mạnh riêng có icon**; chỉ dẫn địa điểm nhận・cách nhận・liên hệ・điểm đặc biệt | — |
  | Body | Stat | 「〇箱」 (tổng) /「〇品」+icon lạnh /「〇品」+icon đông | — |
  | Body | List (per dòng) | `送り状番号` — **không thể chạm** | — |
  | Body | Checkbox (per dòng) | Xác nhận **đã giao hàng cho company**; tích riêng lẻ từng vận đơn | Tích ≥1 → nút 「完了」 active |
  | Footer | Button 「完了」 | Hiện khi `未配送` **và là đơn giao trong ngày** (đơn tương lai: **UNKNOWN OQ-31**). Active khi tích ≥1, disable khi 0. Validate **phía server** | **Tích hết** → hoàn tất trực tiếp → `DA_HOME_001` + `E-14`; **tích một phần** → `E-13` |
  | Body | Banner | Sau khi hoàn tất, **mở lại màn này** → banner 「荷物の配送は完了しました。」 | — |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 7 Business rule | Chưa tích vận đơn nào | Button disabled | — (nút 「完了」 xám) |
| 7 Business rule | Bấm 完了 khi **tích một phần** (còn chưa xác nhận) | Modal | 「荷物の配送は完了しましたか？」 + 「一部の荷物が未確認の状態です。すべて配送していない場合は、ESキッチンまでご連絡ください。」 |
| 7 Business rule | Vận đơn đã bị báo sự cố ở chức năng khác | Inline error | Badge 「トラブル」 — **độc lập với checkbox** |
| 7 Business rule | Đơn `配送完了` / `トラブル` / dữ liệu tương lai | Chặn UI | — (**chỉ đọc**; `配送完了` còn hiện banner hoàn tất) |
| 3 Network | Mất mạng khi bấm 完了 | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API hoàn tất lỗi (validate phía server) | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn giữa lúc đang tích | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — màn không có ô nhập text/số | — | — |
| 5 Empty state | N/A — luôn có ≥1 vận đơn khi vào được màn | — | — |
| 6 Conflict | Bấm back khi đã tích ≥1 | UNKNOWN | UNKNOWN — Figma **không** mô tả popup hủy chỉnh sửa cho COOL便 (khác `DA_RECV_001`) → OQ-26 |
| 8 External | Thiết bị không mở được app điện thoại khi bấm gọi ES | UNKNOWN | UNKNOWN (OQ-19) |

---

### DA_RPTD_001 — Báo cáo sự cố: Chọn điểm giao / kho
> Nguồn: `24042:41580`

**Happy Case:**
- Layout: Header (back + 「トラブル報告」) → tiêu đề mục 「配達一覧」 → ô tìm kiếm → văn bản hướng dẫn → danh sách thẻ có radio → 2 nút (chỉ hiện sau khi chọn).
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back 「＜」 | Quay lại màn trước (màn Home) | → `DA_HOME_001` |
  | Header | Title | 「トラブル報告」 | — |
  | Body | Section title | 「配達一覧」 | — |
  | Body | Input search | Khớp một phần theo **tên kho・tên điểm giao・số vận đơn** | Gõ → lọc **realtime trong màn** |
  | Body | Text | 「※影響を受けた拠点を選択してください。」「※複数の拠点でトラブルが発生している場合は、それぞれの拠点ごとに登録してください。」「※未配送の注文のみ表示されます。」 | — |
  | Body | Icon (per thẻ) | **3 màu**: xanh = ES配送便 · tím = COOL便 · **cam = kho** | — |
  | Body | Text (per thẻ) | Tên điểm giao (company) **hoặc** tên kho | — |
  | Body | Badge (per thẻ) | **2 loại**: `未配送` / `未受取` | — |
  | Body | Text (per thẻ) | `所属倉庫名` — **chỉ hiển thị với thẻ điểm giao (ES配送便/COOL便)**, không có ở thẻ kho | — |
  | Body | Text (per thẻ) | Địa chỉ điểm giao / kho | — |
  | Body | Stat (per thẻ) | 「〇箱」「〇品 (lạnh)」「〇品 (đông)」; **riêng thẻ kho hiển thị thêm 「〇社」** | — |
  | Body | Radio (per thẻ) | **Chỉ chọn 1** điểm giao/kho. **Chọn kho → hiển thị các đơn chưa nhận VÀ chưa giao thuộc kho đó** | Chọn → hiện nút 「戻る」「次へ」 |
  | Footer | Button 「戻る」 | **Chỉ hiện sau khi đã chọn 1 điểm** | → `DA_HOME_001` |
  | Footer | Button 「次へ」 | **Chỉ hiện sau khi đã chọn 1 điểm**; active (xanh). Validate **phía client**: bắt buộc chọn điểm giao | → `DA_RPTD_002` |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 7 Business rule | Chưa chọn điểm giao nào | Chặn UI | — (nút 「戻る」「次へ」 **chưa hiện**) |
| 7 Business rule | Đơn đã `配送完了` / `受取済` | Chặn UI | — (**không hiển thị trong danh sách**; Figma: 「※未配送の注文のみ表示されます。」) |
| 5 Empty state | Không có đơn `未配送` nào để báo cáo | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-27) |
| 3 Network | Mất mạng khi tải danh sách | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API 500 | UNKNOWN | UNKNOWN (OQ-08) |
| 2 Auth | Session hết hạn | UNKNOWN | UNKNOWN (OQ-09) |
| 1 Validation input | N/A — ô tìm kiếm không có giới hạn ký tự trong Figma | — | — |
| 6 Conflict | Đơn bị đổi trạng thái khi tài xế đang chọn | UNKNOWN | UNKNOWN — Figma không có cơ chế refresh (OQ-10) |
| 8 External | N/A | — | — |

---

### DA_RPTD_002 — Báo cáo sự cố: Chi tiết
> Nguồn: `24076:42158` · modal xác nhận `24084:42989` · sau khi gửi `24084:42990`

**Happy Case:**
- Layout: Header (back + 「トラブル報告」) → thẻ thông tin điểm giao đã chọn → danh sách vận đơn có checkbox → radio nội dung sự cố → (ô lý do nếu `その他`) → upload ảnh → 備考 → 2 nút chân trang.
- Components có hành vi:

  | Vị trí | Component | Nội dung / Ràng buộc | Action |
  |---|---|---|---|
  | Header | Button back 「＜」 | Về màn chọn điểm giao | → `DA_RPTD_001` |
  | Header | Title | 「トラブル報告」 | — |
  | Body | Card | Thông tin điểm giao đã chọn: icon loại · tên điểm · địa chỉ · số thùng · số hàng lạnh/đông | — |
  | Body | Checkbox (chọn tất cả) | Ở **góc trên phải thẻ điểm giao**. ON = chọn tất cả vận đơn bên dưới, OFF = bỏ hết. **Chọn một phần → trạng thái trung gian (−)** | Click |
  | Body | Text (per dòng) | `送り状番号` của từng kiện | — |
  | Body | Checkbox (per dòng) | Tích riêng lẻ, **chọn nhiều được**, **BẮT BUỘC ≥1** (điều kiện tiên quyết để báo cáo) | Click |
  | Body | Text | 「※影響を受けた注文を選択してください」 | — |
  | Body | Radio | Nội dung sự cố — **BẮT BUỘC chọn 1**: `箱数不足` (thiếu thùng) / `誤配送` (giao sai) / `荷物破損` (hàng hư hỏng) / `その他` (khác) | Click |
  | Body | Input text | Ô lý do — **chỉ hiện khi chọn `その他`**, **BẮT BUỘC**, 1–255 ký tự, placeholder 「理由を入力してください」, **viền đỏ nhấn mạnh** | Nhập |
  | Body | Upload area | Ảnh sự cố — **tùy chọn**, 0–20 ảnh, camera hoặc file trong máy, **JPEG/PNG/HEIC/WebP**, **≤10MB/file**. Chưa tải → 「写真はまだありません」 + placeholder | Click |
  | Body | Button (×) | Xóa ảnh — góc trên phải thumbnail. **Thay ảnh = xóa rồi tải lại** | Click |
  | Body | Textarea | `備考` — **tùy chọn**, 0–500 ký tự, **nhập nhiều dòng** | Nhập / Mất focus |
  | Footer | Button 「戻る」 | Về màn chọn điểm giao — **nội dung đã nhập bị hủy** | → `DA_RPTD_001` |
  | Footer | Button 「送信」 | **Chỉ active (xanh) khi đã chọn ≥1 vận đơn VÀ đã chọn nội dung sự cố**; chưa đủ → disable (xám). Validate **phía client** | → `E-17` (modal xác nhận gửi) |

**Non-Happy Case:**

| Nhóm | Trigger | Hiển thị | Message |
|---|---|---|---|
| 1 Validation input | Chưa chọn vận đơn nào | Inline error | 「影響を受けた注文を1件以上選択してください」 |
| 1 Validation input | Chưa chọn nội dung sự cố | Inline error | 「トラブル内容を選択してください」 |
| 1 Validation input | Chọn `その他` mà bỏ trống lý do | Inline error | 「理由を入力してください」 |
| 1 Validation input | Lý do quá 255 ký tự | Inline error | 「理由は255文字以内で入力してください」 |
| 1 Validation input | `備考` quá 500 ký tự | Inline error | 「備考は500文字以内で入力してください」 |
| 1 Validation input | Ảnh sai định dạng / >10MB / >20 ảnh | Inline error | 「対応していないファイル形式です」/「ファイルサイズは10MB以下にしてください」/「写真は最大20枚までです」 |
| 7 Business rule | Chưa đủ 2 điều kiện bắt buộc | Button disabled | — (nút 「送信」 xám) |
| 5 Empty state | Chưa tải ảnh nào | Empty state | 「写真はまだありません」 (+ placeholder) |
| 3 Network | Mất mạng khi gửi báo cáo | UNKNOWN | UNKNOWN (OQ-08) |
| 4 Server error | API gửi báo cáo lỗi (validate **phía server**) | UNKNOWN | UNKNOWN — Figma không định nghĩa (OQ-08) |
| 2 Auth | Session hết hạn khi đang nhập | UNKNOWN | UNKNOWN (OQ-09) |
| 6 Conflict | Bấm back khi đã nhập dở | Chặn UI | — (Figma: **nội dung đã nhập bị hủy**, không có popup xác nhận) |
| 8 External | Thiết bị không mở được camera | UNKNOWN | UNKNOWN (OQ-19) |

---

## Responsive Requirements

| Breakpoint | Screen size (W×H) | Layout changes |
|---|---|---|
| Web app (mobile-first) | **390×844** | Viewport thật của toàn bộ 95 frame trong Figma `DA - update`. 1 cột; card full-width; nút chân trang (「完了」「続ける」「確認」) **sticky đáy màn** |

> **Lệch chuẩn kit — ghi nhận, không tự sửa:** `spec-template.md` quy định `375×812` cho Web app mobile-first, nhưng Figma dự án dùng **390×844** trên toàn bộ frame. SPEC theo Figma vì Figma là nguồn design thật mà FE sẽ implement.

**Quy tắc chung (theo Figma):**
- Navigation: **bottom tab 5 mục** (ホーム · マニュアル · 配送一覧 · トラブル · アカウント) — xuất hiện ở `DA_HOME_001`, `DA_HOME_005`, `DA_LIST_00*`; **không xuất hiện** trong luồng `DA_AUTHEN_*` và các màn tác nghiệp (`DA_RECV_001`, `DA_ESDL_*`, `DA_COOL_001`, `DA_RPTD_*`) — các màn này dùng nút back 「＜」.
- Thanh tiến trình 5 bước: chỉ ở luồng `DA_ESDL_001`→`005` và tab 陳列情報 của `DA_ESDL_006`.
- Xử lý text tiếng Nhật dài — **2 quy tắc khác nhau, dễ implement nhầm**:
  - `DA_LIST_001_Kho` (Tab A): tên kho **hiển thị tối đa 2 dòng rồi rút gọn `…`**; địa chỉ cũng rút gọn `…`.
  - `DA_LIST_002_ES` / `DA_LIST_003_COOL` (Tab B/C): tên điểm giao **xuống dòng hiển thị toàn bộ**; địa chỉ hiển thị **đầy đủ** gồm tên tòa nhà・tầng・công ty・phòng ban.
  - `DA_ESDL_003-06`: tên sản phẩm trong bảng kết quả **rút gọn `…`** khi vượt chiều rộng.
- Font scale / grid / breakpoint khác: **UNKNOWN — Figma chỉ có 1 viewport 390×844** (OQ-28).

---

## UX Review Notes

> Theo yêu cầu "100% Figma, không tự động thêm", section này **chỉ ghi nhận quan sát trực tiếp từ Figma** — **không kèm đề xuất cải tiến** của BA.

**UX — quan sát từ Figma:**
- Luồng ES配送便 dài **5 bước bắt buộc tuần tự**, thanh tiến trình **không cho chạm để nhảy bước** (`RQ-E07`) — tài xế chỉ đi được bằng 「戻る」「続ける」.
- Điều kiện mở khóa nút hoàn thành **khác nhau giữa 3 nghiệp vụ**, cần chú ý khi implement:
  - `DA_RECV_001` (kho): tick checkbox **HOẶC** bấm gọi ES → **OR** (`RQ-D17`).
  - `DA_COOL_001`: tick checkbox **HOẶC** bấm gọi ES → **OR** (`RQ-F09`).
  - `DA_ESDL_003` (Step 3 chênh lệch): **BẮT BUỘC tick checkbox** mới active (`RQ-E39`) — Figma ghi 「必須」, nút gọi ES ở popup này **không** tự tick.
- Điều kiện nút 「確認」 **khác nhau giữa Step 2 và Step 3**: Step 2 yêu cầu **TẤT CẢ** sản phẩm tích (`RQ-E26`); Step 3 chỉ cần **≥1** (`RQ-E34`).
- `DA_RECV_001` **không có nút chọn tất cả** (`RQ-D09`), nhưng `DA_RPTD_002` **có** checkbox chọn tất cả kèm trạng thái trung gian (`RQ-G17`) — hai màn cùng dạng danh sách vận đơn nhưng hành vi khác nhau.
- Chỉ `DA_RECV_001` có popup xác nhận hủy chỉnh sửa khi bấm back (`RQ-D01`); `DA_RPTD_002` **hủy thẳng không hỏi** (`RQ-G26`); `DA_COOL_001` **Figma không mô tả** (OQ-26).

**Information Design — quan sát từ Figma:**
- Quy tắc hiển thị số lượng được định nghĩa theo **3 trạng thái thời điểm** (tương lai `予定` / đã picking số thật / chưa picking `未確定` hoặc ẩn) — `RQ-C16`, `RQ-C21`, `RQ-C22`.
- Icon tủ lạnh đại diện cho **`冷蔵` + `常温` gộp chung một số** (`RQ-C02`) — Figma có bảng chú thích icon riêng (`20274:174991`).
- Cột `差異` ở Step 3 dùng **màu ngược trực giác**: giá trị **âm** (thực tế NHIỀU hơn dự kiến) = **cam**; giá trị **dương** (thực tế ÍT hơn dự kiến) = **xanh lá** (`RQ-E43`).
- Thời gian thông báo **cố ý không dùng「昨日」** (`RQ-B19`) — cần ghi rõ để dev không hiểu là thiếu sót.
- Số điện thoại ES Kitchen **`050-5784-2777`** xuất hiện ở 5 chỗ: modal nhận thiếu kho, popup COOL便 giao thiếu, popup chênh lệch Step 3, văn bản liên hệ khẩn cấp Step 1/Step 4, popup gọi ES từ tab トラブル.

**Performance — quan sát từ Figma:**
- Lọc và tìm kiếm ở `DA_RECV_001` (`RQ-D06`, `RQ-D07`), `DA_ESDL_002` (`RQ-E16`), `DA_RPTD_001` (`RQ-G08`) đều chạy **phía client** → cần tải toàn bộ danh sách một lần. Figma **không định nghĩa phân trang hay trần số bản ghi** (`RQ-C24` → OQ-07).
- `配送一覧` cho phép khoảng **tối đa 31 ngày** (`RQ-C04`) nhưng **không có phân trang** trong Figma.
- Upload ảnh: **tối đa 20 ảnh × 10MB** ở Step 1, Step 4, và báo cáo sự cố → tối đa 200MB/lần trên mạng di động. Figma chỉ định nghĩa trạng thái 「loading」, **không có** cơ chế nén, retry, hay upload nền (OQ-29).
- **Không có real-time** (WebSocket/polling) ở bất kỳ màn nào trong Figma (`RQ-H04`).

---

## Open Questions

> Toàn bộ OQ dưới đây phát sinh vì **Figma không định nghĩa** hoặc **chính Figma ghi 「要確認」**. SPEC **không suy đoán** để lấp.

### Blocking mức hệ thống (nên chốt 1 lần cho cả app)

| ID | Câu hỏi | Nguồn | Chặn ai |
|---|---|---|---|
| **OQ-08** | Message + hành vi chuẩn khi **mất mạng** và khi **server lỗi 500 / maintenance**? Dùng chung 1 message cho toàn app hay theo màn? | `RQ-H01`/`RQ-H02` — 48 bảng Figma **không có row nào** thuộc nhóm Network / Server error | FE · QC — **ảnh hưởng 28/28 màn** |
| **OQ-09** | Khi **JWT/session hết hạn** giữa lúc dùng app thì xử lý thế nào? Có refresh token? Dữ liệu đang tick/nhập có được giữ? | `RQ-H03` — không có màn 「セッション切れ」 trong 95 frame | BE · FE — **rủi ro mất dữ liệu ở `DA_RECV_001`, `DA_ESDL_002`, `DA_ESDL_003`, `DA_RPTD_002`** |
| **OQ-10** | Có cơ chế **refresh dữ liệu** khi admin đổi lịch/trạng thái trong lúc tài xế đang xem (pull-to-refresh / polling / WebSocket)? | `RQ-H04` — không có icon refresh trên bất kỳ màn nào | BE · FE |
| **OQ-07** | `配送一覧` (31 ngày) · `DA_RECV_001` · `DA_ESDL_002/003` có **phân trang** không? Trần số bản ghi mỗi lần tải? | `RQ-C24` — Figma không mô tả pagination | BE (thiết kế API) |
| **OQ-30** | **Đường dẫn URL** của các màn ngoài `DA_AUTHEN_*`? | `RQ-H06` — chỉ 5 bảng `DA_AUTHEN_*` có ô 「URL・パス」 | FE (routing) |

### Figma tự ghi 「要確認」

| ID | Câu hỏi | Nguồn (nguyên văn Figma) |
|---|---|---|
| **OQ-02** | 「もっと表示」 tải bao nhiêu thông báo mỗi lần? | `20319:242429` A.4: 「1回あたりの読込件数は要確認」 |
| **OQ-03** | Email ở `DA_AUTHEN_002_02` có mask một phần không? | `20239:151066` mục 3: 「マスク方式の有無は要確認。⚠️」 |
| **OQ-04** | Link trong nội dung thông báo mở bằng browser ngoài hay WebView trong app? | `20319:242429` B.5: 「遷移方式は要確認」 |
| **OQ-05** | File đính kèm thông báo hỗ trợ định dạng nào, mở hay tải về? | `20319:242429` B.6: 「対応ファイル形式・表示方式は要確認」 |
| **OQ-13** | Nội dung câu tiếp theo sau 「パスワードリセットに成功しました。」? | `20240:152458` mục 2: 「以降の文言は要確認 ⚠️」 |
| **OQ-21** | 「※次回納品日 〇月〇日」 có hiển thị **năm** không? | `23335:36257` mục 4.3: 「年表示の有無は要確認」 |
| **OQ-22** | Bấm 「戻る」 từ Step 2 về Step 1 có **giữ dữ liệu đã nhập** không? | `23335:36257` mục 6.1: 「入力データ保持の有無は要確認」 |
| **OQ-31** | Đơn COOL便 **ngày tương lai** có hiện nút 「完了」 không? | `23808:112206` mục 15: 「未来日の配送での表示有無は要確認」 — xem `RQ-F07` |

### Mâu thuẫn giữa các node Figma (CONFLICT)

| ID | Mâu thuẫn | Nguồn | Chặn ai |
|---|---|---|---|
| **OQ-23** | Điều kiện hiện popup ở Step 3: connector ghi 「未チェックの項目が1件以上ある場合 / **すべての差異が0以外**」, bảng ghi 「①未確認商品あり または ②**差異が1件以上**」. Hai cách diễn đạt cho kết quả **khác nhau** (「tất cả chênh lệch ≠ 0」 vs 「có ≥1 chênh lệch」) | `RQ-E35` — connector `23371:142972` vs table `23451:37606` mục 5.2 | BE · FE · QC — **ảnh hưởng logic core** |
| **OQ-32** | Mã màn khi tap thẻ từ Home ghi `DA_DLVR_001-11` (COOL) / `DA_DLVR_001-1` (ES), nhưng bảng chi tiết dùng `DA_COOL_001` / `DA_ESDL_000_*` | `RQ-B17` — table `20235:148473` mục 5.6/6.6 vs table `23808:112206` / `23134:63310` | FE (routing) · QC (trace screen code) |
| **OQ-25** | Connector có 「Step 1 edit」「Step 2 edit」「Step 3 edit」「Step 5 edit」 — **thiếu 「Step 4 edit」**. Step 4 (ảnh sau trưng bày) có sửa lại được trong 7 ngày không? | `RQ-E62` — connector `18870:15080/15085/15090/15100` | BE · FE |

### Figma không có màn / không định nghĩa

| ID | Câu hỏi | Nguồn |
|---|---|---|
| **OQ-01** | Tab 「マニュアル」 trong bottom nav — nội dung là gì? Có phải màn hướng dẫn trưng bày như SPEC v1 mô tả? | `RQ-B31` — quét 95 frame: **không có màn nào** |
| **OQ-06** | Empty state của 3 tab `配送一覧` khi khoảng ngày không có bản ghi? | `RQ-C25` — Figma không có màn empty cho 配送一覧 |
| **OQ-20** | `DA_RECV_003` gồm những item gì? Khác `DA_RECV_001` ở đâu ngoài việc chỉ đọc? | `RQ-D23` — symbol `20262:41179` **không có bảng mô tả** |
| **OQ-11** | Nếu hệ thống email không gửi được mã xác thực, app báo gì? | Figma không định nghĩa |
| **OQ-12** | Token reset mật khẩu có thời hạn riêng ngoài 5 phút của mã 4 số không? | Figma không định nghĩa |
| **OQ-14** | Truy cập trực tiếp `/reset-password/complete` mà chưa qua B3 thì sao? | `20240:152458` chỉ ghi điều kiện hiển thị |
| **OQ-15** | Nếu API đánh dấu đã đọc lỗi, chấm đỏ có giữ nguyên không? | Figma không định nghĩa |
| **OQ-16** | Admin xóa thông báo khi tài xế đang mở chi tiết thì hiển thị gì? | Figma không định nghĩa |
| **OQ-17** | Bật 「未受取のみ表示」/「未確認のみ表示」 khi đã tick hết thì hiển thị gì? | Figma không định nghĩa |
| **OQ-18** | Nếu API hoàn tất nhận hàng lỗi, trạng thái tick có được giữ để thử lại không? | Figma chỉ mô tả luồng thành công |
| **OQ-19** | Thiết bị không mở được **app điện thoại** (`tel:`) hoặc **camera** thì fallback thế nào? | Figma không định nghĩa |
| **OQ-24** | Cảnh báo 「実集金額が未入力、または集金予定額と一致しません。」 hiển thị **dạng gì** (toast / banner / inline / modal)? Thông báo cho admin qua kênh nào? | `23559:38617` mục 3.2 chỉ ghi 「警告を表示し、adminへも通知」 |
| **OQ-26** | `DA_COOL_001`: bấm back khi đã tích ≥1 có hiện popup xác nhận hủy như `DA_RECV_001` không? | Figma **không** mô tả cho COOL便 |
| **OQ-27** | `DA_RPTD_001`: không có đơn `未配送` nào để báo cáo thì hiển thị gì? | Figma không định nghĩa |
| **OQ-28** | Có breakpoint nào khác ngoài 390×844? Font scale theo viewport? | Figma chỉ có 1 viewport |
| **OQ-29** | Upload tối đa 20 ảnh × 10MB — có nén ảnh, retry, hay upload nền không? | Figma chỉ định nghĩa trạng thái 「loading」 |
| **OQ-33** | Chức năng **chat/hỗ trợ (HubSpot widget)** có trong SPEC v1 nhưng **không có trong Figma `DA - update`** — còn trong scope Phase 2 không? | So sánh `versions/v1_25062026/SPEC.md` §Screens `DA_DRVR_011` vs Figma |
| **OQ-34** | Tag mới sinh ra khi hoàn thành một phần (kho / COOL便) có **kế thừa `伝票番号`・`送り状番号`** cũ hay cấp mới? Có giới hạn số lần sinh tag liên tiếp không? | `RQ-D21` connector `18578:41563` · `RQ-F10` connector `18870:187993` — chỉ nói 「別の倉庫タグを自動生成する」, **không nói cách đánh số** — **blocking cho thiết kế DB** |

### Quyết định đã chốt trong session này

| ID | Vấn đề | Quyết định |
|---|---|---|
| **DEC-01** | Screen code cũ `DA_DRVR_001`–`011` (SPEC v1) mâu thuẫn với screen code thật trên Figma | **Dùng screen code Figma** (`DA_AUTHEN_*`, `DA_HOME_*`, `DA_NOTI_*`, `DA_LIST_*`, `DA_RECV_*`, `DA_ESDL_*`, `DA_COOL_*`, `DA_RPTD_*`) vì đây là nguồn design thật mà FE/QC sẽ đọc. SPEC v1 giữ nguyên tại `versions/v1_25062026/SPEC.md` |
| **DEC-02** | Ngôn ngữ SPEC | Diễn giải nghiệp vụ **tiếng Việt**; text hiển thị cho user **giữ nguyên tiếng Nhật** trong 「」 |
| **DEC-03** | Phạm vi Figma output | **Chỉ Output 1 + Output 2** trên page `Feature - Flow`. Output 3 (Screens + Items) và Output 4 (HTML Prototype) **skip** vì Figma gốc đã có đủ 95 mockup + 48 bảng item |

---

## Dependencies

| Dependency | Mô tả | Liên quan |
|---|---|---|
| `es-kitchen-api` | Toàn bộ API: xác thực · reset mật khẩu · thông báo · hồ sơ tài xế · lịch giao hàng · 配送一覧 3 tab · nhận hàng kho · **sinh tag mới khi hoàn thành một phần** · 5 bước trưng bày · thu tiền · 駐車報告 · báo cáo sự cố | Cross-repo — **cần Contract Lock trước Phase 3** |
| AWS SES | Gửi email mã xác thực 4 chữ số | Infra |
| AWS S3 | Lưu ảnh: 陳列前 (≤20) · 陳列後 (≤20) · レシート駐車 (1) · ảnh sự cố (≤20) | Infra |
| Barcode scanner (camera thiết bị) | Quét mã sản phẩm ở Step 2 (đăng ký hủy) và Step 3 (kiểm phẩm) | Device API |
| `tel:` handler | Nút gọi `050-5784-2777` ở 5 vị trí | Device API |
| **E05 — Outsource Admin** | Nguồn cấp `ログインID` + thông tin hiển thị ở My Page | `features/delivery-partner/SPEC.md` |
| **E03 — System Admin** | Nguồn đăng thông báo · **nhận thông báo khi 実集金額 lệch** · tiếp nhận & xử lý báo cáo sự cố | SPEC E03 |
| Kho Thomas / kho picking | Import mã vận đơn → quyết định app có hiển thị số thùng hay không (`RQ-C15`) | External integration |
| `features/delivery-dispatching/SPEC.md` | Nguồn dữ liệu lô hàng, phân công tài xế, chu kỳ picking | E03/E05 |

---

## Bước tiếp theo

**SPEC sẵn sàng — nhưng ⚠️ nên chốt OQ-08 · OQ-09 · OQ-23 với BrSE trước khi Tech Lead thiết kế** (3 câu này ảnh hưởng toàn bộ màn hoặc logic core).

Chạy song song:

- `"Hãy là Tech Lead Design, làm Design-Technical.md từ SPEC này: es-kitchen-docs/docs/features/delivery-driver/SPEC.md"`
- `"Hãy là QC, sinh test cases từ SPEC này: es-kitchen-docs/docs/features/delivery-driver/SPEC.md"`
  (hoặc `/test/analyze-req` → `/test/plan-tcs` → `/test/gen-tcs`)
- Designer: **không cần vẽ lại** — chỉ điền cột `Figma Link` trong `## Screens` bằng URL node của 95 frame trong `DA - update`.

⚠️ **HANDOVER RULE:** downstream agent chỉ nhận path SPEC.md này — section `## BA Deliverables` đã chứa đủ path/URL của mọi output.
