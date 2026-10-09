# Requirements Analysis: driver-app — delivery-driver

## Summary

**Feature:** `delivery-driver` — App Tài Xế (Driver Mobile Web)
**Module:** `driver-app` (toàn bộ 8 business flow, gộp 1 module để xuất 1 workbook)
**Mục đích:** Tài xế của công ty vận chuyển ủy thác dùng app để thực hiện trọn một ngày làm việc: nhận hàng tại kho → giao hàng đến điểm giao → trưng bày sản phẩm vào tủ lạnh/box + kiểm tồn kho + đăng ký hàng hủy + thu tiền mặt → báo cáo sự cố khi có vấn đề.
**Actors liên quan:** `E06 — Driver` (actor chính, duy nhất thao tác trên app) · `E05 — Outsource Admin` (cấp tài khoản, ngoài scope) · `E03 — System Admin / ES Kitchen` (đăng thông báo, nhận thông báo 実集金額 lệch, xử lý báo cáo sự cố — ngoài scope) · `ES Kitchen tổng đài 050-5784-2777` · `System` (tự sinh tag mới, tự cập nhật trạng thái)
**Platform:** **Web (mobile-first)** — ReactJS Mobile Web, **không phải PWA/native**. Viewport Figma thật **390×844**. → áp `testing_dimensions` section **Web Platform** + **Cross-Platform**, **KHÔNG** áp Mobile Platform (không có cài đặt app / app lifecycle / push notification).
**Luồng trong scope:** 8 flow — A1 Account Access · A2 Home Dashboard · A3 Notifications · A4 配送一覧 · A5 倉庫受取 · A6 ES配送便 (5 bước) · A7 COOL配送便 · A8 トラブル報告
**Out of scope:** Màn 「マニュアル」 (không có design — AMB-08) · tạo/sửa tài khoản tài xế (E05) · soạn thông báo (E03) · xử lý phía ES Kitchen sau khi nhận báo cáo · điều phối/phân công lô hàng · push notification (FCM) · bản đồ/điều hướng route · chat HubSpot (không có trong Figma — AMB-34)
**Dependencies:** `features/delivery-partner/` (E05 cấp tài khoản + thông tin My Page) · `features/delivery-dispatching/` (nguồn lô hàng, mã vận đơn, phân công tài xế) · `es-kitchen-api` (toàn bộ API — **cần Contract Lock trước Phase 3**)
**Source:** `es-kitchen-docs/docs/features/delivery-driver/SPEC.md` (v2 · 22/09/2026) — **SPEC đã có 98 AC do BA confirm → skip mapping REQ→AC**, chỉ chạy phát hiện Ambiguities + Screen Inventory.

**Input sources đã verify:**

| Input | Trạng thái | Ghi chú |
|---|---|---|
| SPEC.md `## BA Deliverables` | ✅ Có | 5 rows, đủ status |
| SPEC.md `## Screens` cột Figma Link | ⚠️ **Chưa điền** | Designer chưa fill. QC đọc trực tiếp Figma gốc `DA - update` (`16422:114492`) thay thế — đây là nguồn design thật, high-fidelity |
| Figma Output 1 — Flow Tổng Quan | ✅ Có | node `32099:49634` |
| Figma Output 2 — Screen Flow (có bảng ⑦ ERROR/POPUP INDEX 82 dòng) | ✅ Có | node `32105:49624` — **nguồn chính cho negative TC** |
| Figma Design UI/UX (page gốc) | ✅ Có | node `16422:114461` = page `Driver Moblie Web (P2)_review 可`, chứa 95 frame + 48 bảng mô tả item song ngữ |
| HTML Prototype | ❌ Không có | BA skip theo yêu cầu user — thay bằng Figma gốc (đã high-fidelity, có đủ mockup) |

---

## Q&A — Ambiguities

> 34 item, map 1-1 với `OQ-xx` trong `SPEC.md ## Open Questions` và file `OPEN-QUESTIONS.md`.
> Cột **Status**: `TBD` = chờ BrSE trả lời · `CONFLICT` = 2 node Figma mâu thuẫn, bắt buộc người quyết.

| ID | Reference | Screen | Question + Đề xuất | Impact | Severity | Status |
|----|-----------|--------|--------------------|--------|----------|--------|
| AMB-01 | OQ-08 · 48 bảng Figma không có nhóm Network/Server | **Tất cả 28 màn** | Message + hành vi khi mất mạng / server 500 / maintenance? **Đề xuất:** dùng chung 1 cặp message toàn app, giữ dữ liệu đang nhập, cho retry | TC nhóm 3 Network + nhóm 4 Server error của **28/28 màn** không assert được message | **High** | ✅ Confirmed 22/09 |
| AMB-02 | OQ-09 · không có màn 「セッション切れ」 | **Tất cả 28 màn** | JWT/session hết hạn giữa lúc dùng app → xử lý thế nào? Có refresh token? Dữ liệu đang tick/nhập có giữ? | Rủi ro mất dữ liệu ở `DA_RECV_001`, `DA_ESDL_002/003`, `DA_RPTD_002` — TC nhóm 2 Auth của 28/28 màn | **High** | ✅ Confirmed 22/09 |
| AMB-03 | OQ-23 · connector `23371:142972` vs table `23451:37606` | `DA_ESDL_003` | Điều kiện hiện popup Step 3: 「すべての差異が0以外」 (TẤT CẢ lệch) hay 「差異が1件以上」 (CÓ ≥1 lệch)? **Đề xuất:** theo bảng (≥1 lệch) | Sai logic core: quyết định khi nào BẮT BUỘC liên hệ ES Kitchen. TC-AC-65/66 không viết được | **High** | ✅ Confirmed 22/09 (resolved) |
| AMB-04 | OQ-07 · Figma không mô tả pagination | `DA_LIST_001/002/003`, `DA_RECV_001`, `DA_ESDL_002/003` | Có phân trang không? Trần số bản ghi mỗi lần tải? **Đề xuất:** 配送一覧 20/lần + infinite scroll; các màn lọc client tải hết, trần 200 dòng | Không viết được TC boundary data (0/1/vừa 1 trang/nhiều trang) theo `screen_strategy` List archetype | **High** | ✅ Confirmed 22/09 |
| AMB-05 | OQ-34 · connector `18578:41563` · `18870:187993` | `DA_RECV_001`, `DA_COOL_001` | Tag MỚI khi hoàn thành một phần kế thừa `伝票番号`/`送り状番号` cũ hay cấp mới? Giới hạn số lần sinh? **Đề xuất:** giữ `送り状番号`, cấp `伝票番号` mới, không giới hạn | Không verify được kết quả sau khi nhận/giao thiếu — TC-AC-46, AC-83 | **High** | ✅ Confirmed 22/09 |
| AMB-06 | OQ-32 · table `20235:148473` vs `23808:112206`/`23134:63310` | `DA_HOME_001` | Tap thẻ từ Home đi tới `DA_DLVR_001-11/-1` hay `DA_COOL_001`/`DA_ESDL_000_*`? **Đề xuất:** dùng code bảng chi tiết, Designer đổi tên frame | TC điều hướng từ Home ghi sai screen code → QC không trace được | **Medium** | ✅ Confirmed 22/09 (resolved) |
| AMB-07 | OQ-25 · connector `18870:15080/15085/15090/15100` | `DA_ESDL_006` | Connector có Step 1/2/3/5 edit, **thiếu Step 4 edit** — ảnh sau trưng bày có sửa lại trong 7 ngày? **Đề xuất:** có sửa được | Thiếu/thừa TC cho chức năng 編集 Step 4 | **Medium** | ✅ Confirmed 22/09 (resolved) |
| AMB-08 | OQ-01 · quét 95 frame không có màn nào | Bottom nav (mọi màn có nav) | Tab 「マニュアル」 nội dung là gì? **Đề xuất:** màn xem tài liệu hướng dẫn trưng bày, cần Designer vẽ thêm | Không viết được TC cho 1/5 tab bottom nav | **Medium** | ✅ Confirmed 22/09 |
| AMB-09 | OQ-02 · `20319:242429` A.4 「要確認」 | `DA_NOTI_001` | 「もっと表示」 tải bao nhiêu thông báo/lần? **Đề xuất:** 20 | TC boundary phân trang thông báo không có số cụ thể | Medium | ✅ Confirmed 22/09 |
| AMB-10 | OQ-03 · `20239:151066` mục 3 「要確認」 | `DA_AUTHEN_002_02` | Email có mask một phần? **Đề xuất:** `sa***@email.com` | TC verify hiển thị email không assert được | Low | ✅ Confirmed 22/09 |
| AMB-11 | OQ-04 · `20319:242429` B.5 「要確認」 | `DA_NOTI_002` | Link mở browser ngoài hay WebView? **Đề xuất:** tab browser mới | TC verify hành vi mở link | Low | ✅ Confirmed 22/09 |
| AMB-12 | OQ-05 · `20319:242429` B.6 「要確認」 | `DA_NOTI_002` | File đính kèm định dạng nào, mở hay tải? **Đề xuất:** PDF/JPEG/PNG, tải về | TC verify file đính kèm | Medium | ✅ Confirmed 22/09 |
| AMB-13 | OQ-13 · `20240:152458` mục 2 「要確認 ⚠️」 | `DA_AUTHEN_002_06` | Câu tiếp sau 「パスワードリセットに成功しました。」? **Đề xuất:** 「新しいパスワードでログインしました。」 | TC verify text màn hoàn tất | Low | ✅ Confirmed 22/09 |
| AMB-14 | OQ-21 · `23335:36257` mục 4.3 「要確認」 | `DA_ESDL_002` | 「※次回納品日 〇月〇日」 có hiển thị năm? **Đề xuất:** không | TC verify format ngày | Low | ✅ Confirmed 22/09 |
| AMB-15 | OQ-22 · `23335:36257` mục 6.1 「要確認」 | `DA_ESDL_002` | Bấm 「戻る」 Step 2 → Step 1 có giữ dữ liệu? **Đề xuất:** CÓ giữ (để nhất quán với Step 3) | TC verify data persistence khi điều hướng ngược — ảnh hưởng UX tài xế nhập lại từ đầu | **High** | ✅ Confirmed 22/09 |
| AMB-16 | OQ-31 · `23808:112206` mục 15 「要確認」 | `DA_COOL_001` | Đơn COOL便 ngày tương lai có hiện nút 「完了」? **Đề xuất:** không hiện (giống ES便) | TC-AC-80 điều kiện hiện nút | Medium | ✅ Confirmed 22/09 |
| AMB-17 | OQ-06 · Figma không có màn empty cho 配送一覧 | `DA_LIST_001/002/003` | Empty state 3 tab khi khoảng ngày không có bản ghi? **Đề xuất:** 「該当する配送はありません。」 | TC Screen State Empty của 3 màn List | Medium | ✅ Confirmed 22/09 |
| AMB-18 | OQ-10 · không có icon refresh trên màn nào | `DA_HOME_001`, `DA_LIST_*`, `DA_HOME_005` | Cơ chế refresh khi admin đổi lịch/trạng thái lúc tài xế đang xem? **Đề xuất:** pull-to-refresh thủ công | TC nhóm 6 Conflict (dữ liệu stale) | Medium | ✅ Confirmed 22/09 |
| AMB-19 | OQ-11 · Figma không định nghĩa | `DA_AUTHEN_002_01` | SES không gửi được mã → app báo gì? **Đề xuất:** 「認証コードの送信に失敗しました。しばらくしてから再度お試しください。」 | TC nhóm 8 External integration fail | Medium | ✅ Confirmed 22/09 |
| AMB-20 | OQ-12 · Figma không định nghĩa | `DA_AUTHEN_002_04` | Token reset có thời hạn riêng ngoài 5 phút của mã? **Đề xuất:** 30 phút | TC boundary thời hạn luồng reset | Medium | ✅ Confirmed 22/09 |
| AMB-21 | OQ-14 · `20240:152458` chỉ ghi điều kiện hiển thị | `DA_AUTHEN_002_06` | Truy cập trực tiếp `/reset-password/complete` chưa qua B3? **Đề xuất:** redirect `DA_AUTHEN_001` | TC Security — truy cập trái luồng | **High** | ✅ Confirmed 22/09 |
| AMB-22 | OQ-15 · Figma không định nghĩa | `DA_NOTI_002` | API đánh dấu đã đọc lỗi → chấm đỏ giữ nguyên? **Đề xuất:** giữ nguyên, không báo lỗi | TC nhóm 4 Server error của màn chi tiết | Low | ✅ Confirmed 22/09 |
| AMB-23 | OQ-16 · Figma không định nghĩa | `DA_NOTI_002` | Admin xóa thông báo khi tài xế đang mở? **Đề xuất:** 「このお知らせは削除されました。」 → về list | TC nhóm 6 Conflict | Low | ✅ Confirmed 22/09 |
| AMB-24 | OQ-17 · Figma không định nghĩa | `DA_RECV_001`, `DA_ESDL_002` | Bật 「未受取のみ表示」/「未確認のみ表示」 khi đã tick hết → hiển thị gì? **Đề xuất:** 「未受取の荷物はありません。」/「未確認の商品はありません。」 | TC Screen State Empty sau khi lọc | Medium | ✅ Confirmed 22/09 |
| AMB-25 | OQ-18 · Figma chỉ mô tả luồng thành công | `DA_RECV_001` | API hoàn tất nhận hàng lỗi → tick có giữ để thử lại? **Đề xuất:** giữ nguyên + Toast lỗi | TC nhóm 4 Server error — rủi ro tài xế tick lại 30–50 vận đơn | **High** | ✅ Confirmed 22/09 |
| AMB-26 | OQ-19 · Figma không định nghĩa fallback | `DA_RECV_001`, `DA_COOL_001`, `DA_ESDL_*`, `DA_RPTD_002`, `E-16` | `tel:` hoặc camera không mở được → fallback? **Đề xuất:** `tel:` lỗi → hiện số dạng text; camera lỗi → chỉ chọn file | TC nhóm 8 External của mọi màn có gọi ES / quét mã / chụp ảnh | Medium | ✅ Confirmed 22/09 |
| AMB-27 | OQ-20 · symbol `20262:41179` không có bảng mô tả | `DA_RECV_003` | Màn này gồm item gì? Khác `DA_RECV_001` ở đâu ngoài chỉ đọc? **Đề xuất:** giống `DA_RECV_001` nhưng checkbox disabled, ẩn nút 「完了」, back không popup | **Không viết được TC chi tiết cho 1 màn** — chỉ viết được TC mức "chỉ đọc" | **High** | ✅ Confirmed 22/09 |
| AMB-28 | OQ-24 · `23559:38617` mục 3.2 chỉ ghi 「警告を表示」 | `DA_ESDL_005` | Cảnh báo 実集金額 lệch hiển thị dạng gì? Thông báo admin qua kênh nào? **Đề xuất:** Inline error màu cam dưới ô nhập; admin nhận thông báo in-app | TC-AC-71 không assert được dạng hiển thị. **Liên quan tiền** | **High** | ✅ Confirmed 22/09 |
| AMB-29 | OQ-26 · Figma không mô tả cho COOL便 | `DA_COOL_001` | Back khi đã tick ≥1 có popup xác nhận hủy như `DA_RECV_001`? **Đề xuất:** có, dùng chung `E-03` | TC nhóm 6 Conflict — rủi ro mất tick | Medium | ✅ Confirmed 22/09 |
| AMB-30 | OQ-27 · Figma không định nghĩa | `DA_RPTD_001` | Không có đơn 未配送 nào để báo cáo → hiển thị gì? **Đề xuất:** 「報告可能な配送はありません。」 + ẩn 「次へ」 | TC Screen State Empty | Medium | ✅ Confirmed 22/09 |
| AMB-31 | OQ-28 · Figma chỉ có 1 viewport | Tất cả màn | Có breakpoint khác ngoài 390×844? Font scale theo viewport? **Đề xuất:** 1 breakpoint, co giãn 320–480px, font không scale | TC Responsive & Layout (`testing_dimensions` Web) | Medium | ✅ Confirmed 22/09 |
| AMB-32 | OQ-29 · Figma chỉ có trạng thái 「loading」 | `DA_ESDL_001/004/006`, `DA_RPTD_002` | 20 ảnh × 10MB — có nén / retry / upload nền? **Đề xuất:** nén client ≤2MB, retry 3 lần, không upload nền | TC performance upload trên 4G — rủi ro thực tế cao | **High** | ✅ Confirmed 22/09 |
| AMB-33 | OQ-30 · chỉ 5 bảng AUTHEN có ô 「URL・パス」 | Tất cả màn trừ `DA_AUTHEN_*` | URL của các màn còn lại? **Đề xuất:** `/home` `/notifications` `/notifications/:id` `/account` `/deliveries` `/warehouse/:id` `/es/:id` `/es/:id/step:n` `/cool/:id` `/trouble` `/trouble/:id` | TC deep-link + TC Security truy cập trái luồng | Medium | ✅ Confirmed 22/09 |
| AMB-34 | OQ-33 · so `versions/v1_25062026/SPEC.md` vs Figma | — | Chat/hỗ trợ HubSpot có ở SPEC v1 nhưng không có trong Figma — còn trong scope P2? **Đề xuất:** loại khỏi scope | Thừa/thiếu 1 màn trong bộ TC | Medium | ✅ Confirmed 22/09 |

> ✅ **CẬP NHẬT 22/09/2026 — toàn bộ 34 AMB đã được BrSE chốt.** Giá trị đã chốt nằm ở `SPEC.md ## Decisions — BrSE confirmed 22/09/2026`.
> **2 quyết định LỆCH đề xuất của BA, TC phải viết theo quyết định của BrSE:**
> - **AMB-02 (OQ-09):** session **persistent, TTL ~1 năm** (BA đề xuất session ngắn + không giữ dữ liệu). ⚠️ Rủi ro bảo mật đã ghi nhận trong SPEC. → TC session expiry chuyển **Priority Low** (không xảy ra trong thực tế test), thay bằng TC **verify session sống qua restart browser**.
> - **AMB-10 (OQ-03):** email ở `DA_AUTHEN_002_02` **KHÔNG mask** (BA đề xuất mask). → TC assert email hiển thị **đầy đủ**.
>
> **2 việc phát sinh cho Designer** (ảnh hưởng TC): **OQ-01** cần vẽ màn 「マニュアル」 → TC tab này **hoãn**, ghi `[BLOCKED-DESIGN]`. **OQ-32** đổi tên frame `DA_DLVR_001-*`.

**Thống kê Q&A:** 34 item = **11 High** (AMB-01·02·03·04·05·15·21·25·27·28·32) + 18 Medium + 5 Low · trong đó **3 CONFLICT** (AMB-03·06·07 — Figma tự mâu thuẫn, BẮT BUỘC người quyết, không thể tự suy).

---

## Acceptance Criteria

> Nguồn: `SPEC.md ## Acceptance Criteria` — 98 AC **đã do BA confirm từ Figma (FACT)** → không map lại.
> `Status = Confirmed` khi AC trace về bảng mô tả Figma. `Status = TBD` khi AC phụ thuộc 1 AMB chưa chốt.

| AC ID | Nhóm | Nội dung | Status | AMB liên quan |
|---|---|---|---|---|
| `AC-01` | Xác thực | `ログインID` bắt buộc 1–255 ký tự ASCII; trống → 「ログインIDを入力してください。」 | Confirmed | — |
| `AC-02` | Xác thực | Mật khẩu bắt buộc ≥8 ký tự, ≥1 chữ cái, ≥1 chữ số; vi phạm → 「8文字以上で、英字・数字を含めてください。」; trống → 「パスワードを入力してください。」 | Confirmed | — |
| `AC-03` | Xác thực | Validate **toàn bộ field cùng lúc khi bấm nút**, không validate realtime khi gõ. | Confirmed | — |
| `AC-04` | Xác thực | Icon mắt toggle `password ↔ text` ở **mọi** ô mật khẩu (login · mật khẩu mới · xác nhận mật khẩu). | Confirmed | — |
| `AC-05` | Xác thực | Sai thông tin đăng nhập **không làm khóa tài khoản** ở bất kỳ số lần nào. | Confirmed | — |
| `AC-06` | Xác thực | Email bắt buộc, định dạng `xxx@xxx.xxx`, ≤256 ký tự; sai → 「メールアドレスの形式が正しくありません。」 | Confirmed | — |
| `AC-07` | Xác thực | Mã xác thực: đúng **4 ô**, mỗi ô 1 chữ số, **chỉ nhận số**, **tự chuyển focus**; nút xác nhận chỉ active khi đủ 4 số. | Confirmed | — |
| `AC-08` | Xác thực | Mã hiệu lực **5 phút**; hết hạn **màn hình không đổi trạng thái**, chỉ báo lỗi khi bấm xác nhận. | Confirmed | — |
| `AC-09` | Xác thực | Nút gửi lại đếm ngược **60 giây** hiển thị dạng `00:59`; **không giới hạn số lần** gửi lại. | Confirmed | — |
| `AC-10` | Xác thực | Xác nhận mật khẩu phải **trùng khớp tuyệt đối**; lệch → 「パスワードが一致しません。」 | Confirmed | — |
| `AC-11` | Xác thực | Sau `DA_AUTHEN_002_06`, bấm nút về Home vào thẳng `DA_HOME_001` **ở trạng thái đã đăng nhập**, **không qua màn login**. | Confirmed | — |
| `AC-12` | Xác thực | 「ログイン画面に戻る」 hủy luồng reset và **xóa dữ liệu đang nhập**. | Confirmed | — |
| `AC-13` | Home / Thông báo / My Page | `残り件数 = 本日の配送件数 − 完了件数`; `進捗率 = floor(完了 ÷ 本日件数 × 100)` hiển thị %. | Confirmed | — |
| `AC-14` | Home / Thông báo / My Page | Tiến độ **chỉ tính ES配送 + COOL配送**; `倉庫から受取` **không tính** vào cả tổng lẫn số hoàn thành. | Confirmed | — |
| `AC-15` | Home / Thông báo / My Page | Không có dữ liệu hôm nay → **ẩn cả khối 本日の配送進捗**. | Confirmed | — |
| `AC-16` | Home / Thông báo / My Page | Lịch hiển thị đúng **3 ngày**: 「本日（YYYY-M-D）」「明日（YYYY-M-D）」「明後日（YYYY-M-D）」. | Confirmed | — |
| `AC-17` | Home / Thông báo / My Page | Thứ tự thẻ trong cùng ngày đúng: ①COOL便(未配送) ②ES配送便(未配送) ③倉庫受取(未受取) ④COOL便(トラブル) ⑤ES配送便(トラブル). | Confirmed | — |
| `AC-18` | Home / Thông báo / My Page | Thẻ kho chỉ hiện `未受取`; thẻ COOL/ES chỉ hiện `未配送` và `トラブル`. Đã hoàn thành → **ẩn**. | Confirmed | — |
| `AC-19` | Home / Thông báo / My Page | Khi kho `未受取`: COOL/ES **không có thẻ độc lập**, chỉ nằm trong vùng chi tiết thẻ kho; bấm vào → toast 「先に倉庫受取を完了してください。」 **màu cam**, tự ẩn sau 2–3 giây, **không chuyển màn**. | Confirmed | — |
| `AC-20` | Home / Thông báo / My Page | Nút hiện/ẩn chi tiết đổi nhãn đúng: đang mở 「非表示▲」, đang đóng 「詳細表示▼」. | Confirmed | — |
| `AC-21` | Home / Thông báo / My Page | Bottom nav có đúng **5 tab**: ホーム · マニュアル · 配送一覧 · トラブル · アカウント. | Confirmed | — |
| `AC-22` | Home / Thông báo / My Page | Mở `DA_NOTI_002` **tự động gọi API đánh dấu đã đọc**; quay lại danh sách chấm đỏ biến mất. | Confirmed | — |
| `AC-23` | Home / Thông báo / My Page | **Không có** chức năng "đánh dấu tất cả đã đọc". | Confirmed | — |
| `AC-24` | Home / Thông báo / My Page | Ngày giờ thông báo theo **JST**: trong ngày 「今日・HH:mm」, ngày khác 「M月D日・HH:mm」; **không dùng「昨日」**. | Confirmed | — |
| `AC-25` | Home / Thông báo / My Page | Nội dung thông báo **giữ nguyên xuống dòng và đoạn văn** như admin nhập. | Confirmed | — |
| `AC-26` | Home / Thông báo / My Page | 「もっと表示」 tap **hoặc cuộn xuống** đều tải thêm; hết thông báo → **ẩn nút**. | Confirmed | — |
| `AC-27` | Home / Thông báo / My Page | My Page: **6 trường chỉ đọc**, không có ô nào edit được; `ログインID` đúng format `DR` + 5 chữ số. | Confirmed | — |
| `AC-28` | 配送一覧 | Mặc định: Tab A được chọn, `開始日` = hôm nay, `終了日` = hôm nay + 7 ngày. | Confirmed | — |
| `AC-29` | 配送一覧 | Ràng buộc `開始日 ≤ 終了日` và khoảng ≤ **31 ngày**; vi phạm hiện đúng 2 message ①②. | Confirmed | — |
| `AC-30` | 配送一覧 | Tab A dùng dropdown trạng thái **chọn đơn**; Tab B/C dùng dropdown kho・trung chuyển **chọn nhiều**. | Confirmed | — |
| `AC-31` | 配送一覧 | Tab A: search **lọc realtime khi gõ**; Tab B/C: search **chỉ chạy khi bấm Enter**. Xóa input → hiện lại toàn bộ. | Confirmed | — |
| `AC-32` | 配送一覧 | Tab A **rút gọn** tên kho sau 2 dòng (`…`); Tab B/C **xuống dòng hiển thị đủ**, không rút gọn. | Confirmed | — |
| `AC-33` | 配送一覧 | Icon bông tuyết = `冷凍`; icon tủ lạnh = `冷蔵・常温` **gộp chung một số**. | Confirmed | — |
| `AC-34` | 配送一覧 | Số lượng hiển thị đúng theo thời điểm: tương lai `{n}個（予定）` · đã picking `{n}箱` · chưa picking `未確定` (Tab A) / **ẩn** (Tab B/C). | Confirmed | — |
| `AC-35` | 配送一覧 | Chưa import mã vận đơn → **ẩn hẳn** field `{n}箱`, không hiện `0箱`. | Confirmed | — |
| `AC-36` | 配送一覧 | Badge màu đúng: `未受取`/`未配送` cam · `受取済`/`配送完了` xanh lá · `トラブル` đỏ. | Confirmed | — |
| `AC-37` | 配送一覧 | Ngày giao định dạng `yyyy-mm-dd（thứ）`, **thứ tính tự động từ ngày**. | Confirmed | — |
| `AC-38` | 配送一覧 | Bấm thẻ điều hướng đúng **14 dòng** trong `## Quy tắc trạng thái & quyền sửa`. | ✅ Confirmed 22/09 | AMB-04 |
| `AC-39` | 荷物受取 | **Không có** nút chọn tất cả; chỉ tick được từng vận đơn. | Confirmed | — |
| `AC-40` | 荷物受取 | Nút 「完了」 grayout khi 0 tick (**không có message lỗi**); active khi ≥1 tick. | Confirmed | — |
| `AC-41` | 荷物受取 | Tick một dòng → badge dòng đó đổi `未受取` → `受取済` ngay. | Confirmed | — |
| `AC-42` | 荷物受取 | Tick **hết** + 完了 → **không hiện modal**, toast 「荷物の受取は完了しました。」 tự ẩn sau **5 giây** → về Home. | Confirmed | — |
| `AC-43` | 荷物受取 | Còn **sót** + 完了 → Modal; nút 「一部保留のまま完了」 active khi checkbox tick **HOẶC** đã bấm gọi ES (điều kiện **OR**). | Confirmed | — |
| `AC-44` | 荷物受取 | Bấm 「ESへ電話する」 **tự động tick** checkbox "đã liên hệ" và kích hoạt nút hoàn thành. | Confirmed | — |
| `AC-45` | 荷物受取 | Số điện thoại ES đúng **`050-5784-2777`** ở **mọi** nơi xuất hiện. | Confirmed | — |
| `AC-46` | 荷物受取 | Hoàn thành một phần: phần đã tick = hoàn thành; phần chưa tick → **sinh tag kho mới trạng thái `未受取`**. | Confirmed | — |
| `AC-47` | 荷物受取 | Back khi đã tick ≥1 → Popup 「編集内容を破棄しますか？」; chưa tick → về ngay, **không popup**. | Confirmed | — |
| `AC-48` | 荷物受取 | Popup: 「キャンセル」 giữ nguyên tick + nội dung nhập; 「破棄」 **xóa sạch**. | Confirmed | — |
| `AC-49` | 荷物受取 | Ô search 「納品先名」 **chặn nhập** quá 100 ký tự (không báo lỗi). | Confirmed | — |
| `AC-50` | 荷物受取 | Badge `トラブル` **không** bị thay đổi bởi thao tác tick/bỏ tick. | Confirmed | — |
| `AC-51` | ES配送便 — 5 bước | Nút 「陳列を開始する」 **chỉ hiện khi `未配送` VÀ đơn giao trong ngày hôm nay**; đơn tương lai → **không hiện**. | Confirmed | — |
| `AC-52` | ES配送便 — 5 bước | Thanh tiến trình 5 bước **không chạm để di chuyển** — chỉ bằng 「戻る」「続ける」; trạng thái hiển thị đúng (hoàn thành ✓ xanh · hiện tại số xanh · chưa hoàn thành số xám). | Confirmed | — |
| `AC-53` | ES配送便 — 5 bước | Step 1 & Step 4: ảnh **tối thiểu 1, tối đa 20**; nút 「続ける」 chỉ active khi ≥1 ảnh. | Confirmed | — |
| `AC-54` | ES配送便 — 5 bước | Ảnh: **JPEG/PNG/HEIC/WebP**, **tối đa 10MB/file**; chưa tải → 「写真はまだありません」 + placeholder; đang tải → 「loading」. | Confirmed | — |
| `AC-55` | ES配送便 — 5 bước | Nút xóa ảnh (×) ở **góc trên phải mỗi thumbnail**; thay ảnh = xóa rồi tải lại. | Confirmed | — |
| `AC-56` | ES配送便 — 5 bước | Mọi step có câu liên hệ khẩn cấp 「※ご不明な点は弊社代表番号で、緊急連絡先の「050-5784-2777」までお願いします。」 | Confirmed | — |
| `AC-57` | ES配送便 — 5 bước | Step 2: `実在庫` **tự tính** = `理論在庫 − 廃棄数`, **vẫn sửa thủ công được**. | Confirmed | — |
| `AC-58` | ES配送便 — 5 bước | Step 2: tick `確認` → nút −/＋ và ô nhập **cùng dòng bị grayout**. | Confirmed | — |
| `AC-59` | ES配送便 — 5 bước | Step 2: nút 「確認」 **chỉ active khi TẤT CẢ sản phẩm đã tick**. | Confirmed | — |
| `AC-60` | ES配送便 — 5 bước | Step 2: quét barcode đăng ký hủy được cả sản phẩm **không có trong danh sách**; sau quét sản phẩm **tự bật `確認`**. | Confirmed | — |
| `AC-61` | ES配送便 — 5 bước | Step 2/3: `廃棄数`・`実在庫`・`実際数` chỉ nhận **số nguyên ≥ 0**; vi phạm → message tương ứng. | Confirmed | — |
| `AC-62` | ES配送便 — 5 bước | Step 2/3 màn thành công: banner xanh 「在庫/廃棄が成功しました。」 + thời gian định dạng `yyyy年mm月dd日HH時mm分`. | Confirmed | — |
| `AC-63` | ES配送便 — 5 bước | Step 3: `実際数` **giá trị ban đầu = `予定数`**. | Confirmed | — |
| `AC-64` | ES配送便 — 5 bước | Step 3: nút 「確認」 active khi **≥1** tick (khác Step 2 yêu cầu **tất cả**). | Confirmed | — |
| `AC-65` | ES配送便 — 5 bước | Step 3: có sót **hoặc** có chênh lệch → popup; **bắt buộc** tick 「ESキッチンへ連絡済みです。」 mới bấm được 「報告完了」. | ✅ Confirmed 22/09 | AMB-03 |
| `AC-66` | ES配送便 — 5 bước | Step 3: **không sót và không chênh lệch** → chuyển **thẳng** màn thành công, không popup. | ✅ Confirmed 22/09 | AMB-03 |
| `AC-67` | ES配送便 — 5 bước | Cột `差異 = 予定数 − 実際数`; màu **0 = đen · âm = cam · dương = xanh lá**. | Confirmed | — |
| `AC-68` | ES配送便 — 5 bước | Step 3 「戻る」 về Step 2 **giữ dữ liệu đã nhập**. | ✅ Confirmed 22/09 | AMB-15 |
| `AC-69` | ES配送便 — 5 bước | Step 5: `集金予定額` **chỉ đọc, nền xám**, định dạng phân cách 3 chữ số + 「円」. | Confirmed | — |
| `AC-70` | ES配送便 — 5 bước | Step 5: `実集金額` mặc định **0**, số nguyên **0–999,999**. | Confirmed | — |
| `AC-71` | ES配送便 — 5 bước | Step 5: `実集金額` chưa nhập hoặc lệch `集金予定額` → **cảnh báo + thông báo admin**, nhưng **vẫn cho bấm 「完了」**. | ✅ Confirmed 22/09 | AMB-28 |
| `AC-72` | ES配送便 — 5 bước | Step 5: nút 「完了」 **luôn active**, **không hiện hộp thoại xác nhận**; bấm → trạng thái `配送完了` → về màn chi tiết ES配送便. | Confirmed | — |
| `AC-73` | ES配送便 — 5 bước | Banner hoàn tất **chỉ hiện sau khi xong cả 5 bước** và bấm 完了 ở bước cuối. | Confirmed | — |
| `AC-74` | ES配送便 — 5 bước | Tab 陳列情報 **chỉ truy cập được sau khi hoàn tất 5 bước**; step nav 1–5 chạm xem lại nội dung từng bước. | Confirmed | — |
| `AC-75` | ES配送便 — 5 bước | Nút 「編集」 **chỉ hiện trong 7 ngày** sau khi hoàn tất; quá 7 ngày → **ẩn**. | Confirmed | — |
| `AC-76` | ES配送便 — 5 bước | 駐車報告: ảnh hóa đơn **bắt buộc tối đa 1 ảnh**; chưa có → **không lưu được** (「レシート画像をアップロードしてください」). | Confirmed | — |
| `AC-77` | ES配送便 — 5 bước | 駐車報告: phí đỗ xe tùy chọn, số nguyên **0–999,999**, mặc định 0; bấm × hủy **không hiện hộp thoại xác nhận**. | Confirmed | — |
| `AC-78` | COOL配送便 | Mã bưu chính hiển thị **kèm dấu gạch ngang**, nguyên giá trị master (vd `151-0051`). | Confirmed | — |
| `AC-79` | COOL配送便 | Danh sách vận đơn **không thể chạm**; mỗi vận đơn có checkbox xác nhận riêng. | Confirmed | — |
| `AC-80` | COOL配送便 | Nút 「完了」 hiện khi `未配送` **và** là đơn giao trong ngày; active khi tick ≥1. | ✅ Confirmed 22/09 | AMB-16 |
| `AC-81` | COOL配送便 | Tick **hết** + 完了 → hoàn tất trực tiếp → Home + toast 「荷物配達完了しました。」 (đóng bằng **nút ×**). | Confirmed | — |
| `AC-82` | COOL配送便 | Tick **một phần** + 完了 → popup; nút 「一部未配送のまま完了」 active khi tick "đã liên hệ" **HOẶC** đã gọi ES. | Confirmed | — |
| `AC-83` | COOL配送便 | Hoàn tất một phần COOL便: kiện đã tick = `完了`; kiện chưa tick → **sinh tag COOL便 mới trạng thái `未配送`**. | Confirmed | — |
| `AC-84` | COOL配送便 | Mở lại chi tiết COOL便 sau khi hoàn tất → banner 「荷物の配送は完了しました。」 | Confirmed | — |
| `AC-85` | COOL配送便 | `納品備考` hiển thị trong **khung nhấn mạnh riêng có icon** (cả ES配送便 và COOL便). | Confirmed | — |
| `AC-86` | トラブル報告 | Popup gọi ES hiện khi bấm tab 「トラブル」 **hoặc** icon chuông ở header 荷物受取 / ES配送便 / COOL便. | Confirmed | — |
| `AC-87` | トラブル報告 | `DA_RPTD_001`: **chỉ hiển thị đơn `未配送`** (theo 「※未配送の注文のみ表示されます。」). | Confirmed | — |
| `AC-88` | トラブル報告 | Icon loại **3 màu**: xanh = ES配送便 · tím = COOL便 · **cam = kho**. | Confirmed | — |
| `AC-89` | トラブル報告 | Radio **chỉ chọn 1** điểm; sau khi chọn mới hiện nút 「戻る」「次へ」. | Confirmed | — |
| `AC-90` | トラブル報告 | Chọn **kho** → hiển thị các đơn **chưa nhận VÀ chưa giao** thuộc kho đó. | Confirmed | — |
| `AC-91` | トラブル報告 | Checkbox chọn tất cả hiện **trạng thái trung gian (−)** khi chỉ chọn một phần. | Confirmed | — |
| `AC-92` | トラブル報告 | Vận đơn **bắt buộc ≥1**; nội dung sự cố **bắt buộc chọn 1** trong 4 giá trị. | Confirmed | — |
| `AC-93` | トラブル報告 | Chọn `その他` → hiện ô lý do **bắt buộc**, 1–255 ký tự, **viền đỏ**. | Confirmed | — |
| `AC-94` | トラブル報告 | Ảnh sự cố **tùy chọn**, 0–20 ảnh; `備考` **tùy chọn**, 0–500 ký tự, **nhập nhiều dòng**. | Confirmed | — |
| `AC-95` | トラブル報告 | Nút 「送信」 chỉ active khi **≥1 vận đơn VÀ đã chọn nội dung sự cố**. | Confirmed | — |
| `AC-96` | トラブル報告 | Modal xác nhận có câu 「送信後、対象の荷物は操作できなくなります。ESキッチンの確認・対応までお待ちください。」 | Confirmed | — |
| `AC-97` | トラブル報告 | Gửi thành công → trạng thái đơn **tự cập nhật thành `トラブル` (đỏ)**; toast 「報告を送信しました。」 trên cùng màn Home (đóng bằng ×); **kiện hàng không thao tác được nữa**. | Confirmed | — |
| `AC-98` | トラブル報告 | Validate gửi báo cáo ở **phía server**. | Confirmed | — |

**Thống kê AC:** 98 AC = **92 Confirmed** + **6 TBD** (AC-38→AMB-04 · AC-65/66→AMB-03 · AC-68→AMB-15 · AC-71→AMB-28 · AC-80→AMB-16).
✅ **Cập nhật 22/09/2026:** cả 6 AC TBD đã Confirmed (AMB liên quan đã chốt) → **KHÔNG còn TC nào cần prefix `[UNCONFIRMED]`**. TC viết theo giá trị chốt ở `SPEC.md ## Decisions`.
Ngoại lệ duy nhất: TC cho tab 「マニュアル」 ghi `[BLOCKED-DESIGN]` vì Designer chưa vẽ màn (OQ-01).

---

## Screen Inventory

> Confirm từ Figma page `Driver Moblie Web (P2)_review 可` (`16422:114461`), section `DA - update` (`16422:114492`).
> Cột **Figma node** = node id để QC mở trực tiếp: `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=<node>`
> Cột **Sheet** = sheet đích trong workbook `.xlsx` (9 sheet, do template giới hạn 14 sheet / ~96 dòng mỗi sheet).

### 28 màn chính

| # | Screen Code | Tên màn | Archetype | Figma node | Sheet |
|---|---|---|---|---|---|
| 1 | `DA_AUTHEN_001` | Đăng nhập | Form | `20238-149519` | A1-Authen |
| 2 | `DA_AUTHEN_002_01` | Reset B1 — ID + Email | Form | `16422-120856` | A1-Authen |
| 3 | `DA_AUTHEN_002_02` | Reset B2 — Mã 4 số | Form | `16422-120906` · state active `16422-120940` | A1-Authen |
| 4 | `DA_AUTHEN_002_04` | Reset B3 — Mật khẩu mới | Form | `16422-120873` | A1-Authen |
| 5 | `DA_AUTHEN_002_06` | Reset — Hoàn tất | Detail | `16422-120894` | A1-Authen |
| 6 | `DA_HOME_001` | Home — Tiến độ + Lịch 3 ngày | Khác (Dashboard) | `15719-120976` · `16422-114580` | A2-Home |
| 7 | `DA_NOTI_001` | Danh sách thông báo | List | `20276-175614` | A3-Notification |
| 8 | `DA_NOTI_002` | Chi tiết thông báo | Detail | `20276-175647` | A3-Notification |
| 9 | `DA_HOME_005` | Tài khoản (My Page) | Detail (read-only) | `16892-78274` | A3-Notification |
| 10 | `DA_LIST_001_Kho` | 配送一覧 Tab A 倉庫受取 | List/Search | `18439-175106` · `20285-178603` | A4-DeliveryList |
| 11 | `DA_LIST_002_ES` | 配送一覧 Tab B 未配送 | List/Search | `18439-174962` | A4-DeliveryList |
| 12 | `DA_LIST_003_COOL` | 配送一覧 Tab C 配送完了 | List/Search | `18439-175034` | A4-DeliveryList |
| 13 | `DA_RECV_001` | Nhận hàng tại kho — sửa được | List + Form | `16481-48515` · `16887-76722` | A5-WarehouseRecv |
| 14 | `DA_RECV_003` | Nhận hàng tại kho — chỉ đọc | Detail (read-only) | `20262-41179` | A5-WarehouseRecv |
| 15 | `DA_ESDL_000_0` | ES配送便 Tab 基本情報 (hôm nay) | Detail | `16383-114020` | A6-1-ES-Step12 |
| 16 | `DA_ESDL_000_1` | ES配送便 — tương lai (chỉ đọc) | Detail (read-only) | `19036-18274` | A6-1-ES-Step12 |
| 17 | `DA_ESDL_000_2` | ES配送便 — đã hoàn thành | Detail | `19663-152788` | A6-1-ES-Step12 |
| 18 | `DA_ESDL_001` | Step 1 — 陳列前写真 | Form (File Upload) | `18645-24837` · `16422-114716` | A6-1-ES-Step12 |
| 19 | `DA_ESDL_002` | Step 2 — 在庫/廃棄 | Form (Table nhập liệu) | `18058-158268` · scan `16422-114840` · `18123-165893` · checked `18260-89828` | A6-1-ES-Step12 |
| 20 | `DA_ESDL_002-05` | Step 2 — Kết quả thành công | Detail (Report) | `18260-90236` | A6-1-ES-Step12 |
| 21 | `DA_ESDL_003` | Step 3 — 陳列 (検品) | Form (Table nhập liệu) | `16422-114955` · scan `18252-82725` · popup `18252-82730` · diff `17000-119128` · `18578-45802` | A6-2-ES-Step345 |
| 22 | `DA_ESDL_003-06` | Step 3 — Kết quả (bảng 差異) | Detail (Report) | `16422-115045` | A6-2-ES-Step345 |
| 23 | `DA_ESDL_004` | Step 4 — 陳列後写真 | Form (File Upload) | `16422-115333` · `16422-114757` | A6-2-ES-Step345 |
| 24 | `DA_ESDL_005` | Step 5 — 集金登録 | Form | `16422-115605` | A6-2-ES-Step345 |
| 25 | `DA_ESDL_006` | Sau hoàn thành — Tab 陳列情報 + 駐車報告 | Detail + Form (tab) | `18578-42560` · `18578-44771` · `18578-44248` · `18578-43759` · `18578-46215` · `18578-46758` · `18578-47594` | A6-2-ES-Step345 |
| 26 | `DA_COOL_001` | COOL便 — Chi tiết giao hàng | Detail + Form | `20266-172696` · check all `18870-186914` · success `18870-188561` | A7-COOL |
| 27 | `DA_RPTD_001` | Báo cáo sự cố — Chọn điểm giao/kho | List/Search | `18260-101521` · `18870-191330` | A8-TroubleReport |
| 28 | `DA_RPTD_002` | Báo cáo sự cố — Chi tiết | Form | `16422-115223` · `16659-83144` · `16422-115205` | A8-TroubleReport |

### 18 màn phụ (Modal / Popup / Toast / Banner / Empty state — ĐỀU tính là màn hình)

| ID | Loại | Nội dung | Thuộc màn | Sheet |
|---|---|---|---|---|
| `E-01` | Toast | 「荷物の受取は完了しました。」 tự ẩn 5 giây → về Home | `DA_RECV_001` | A5-WarehouseRecv |
| `E-02` | Modal | Nhận kho THIẾU — bắt liên hệ ES (tick HOẶC gọi) | `DA_RECV_001` | A5-WarehouseRecv |
| `E-03` | Modal | 「編集内容を破棄しますか？」 | `DA_RECV_001` | A5-WarehouseRecv |
| `E-04` | Toast | 「先に倉庫受取を完了してください。」 CAM, 2–3s | `DA_HOME_001` | A2-Home |
| `E-05` | Empty state | SOL ちゃん — cả 3 ngày trống | `DA_HOME_001` | A2-Home |
| `E-06` | Empty state | 「配送予定データはありません。」 — 1 ngày trống | `DA_HOME_001` | A2-Home |
| `E-07` | Empty state | 「データがありません。」 — thông báo rỗng | `DA_NOTI_001` | A3-Notification |
| `E-08` | Modal | スキャン廃棄登録 (Step 2) | `DA_ESDL_002` | A6-1-ES-Step12 |
| `E-09` | Banner | 「在庫/廃棄が成功しました。」 + thời gian | `DA_ESDL_002-05` | A6-1-ES-Step12 |
| `E-10` | Modal | スキャン検品登録 (Step 3) | `DA_ESDL_003` | A6-2-ES-Step345 |
| `E-11` | Modal | Chênh lệch Step 3 — BẮT BUỘC tick liên hệ ES | `DA_ESDL_003` | A6-2-ES-Step345 |
| `E-12` | Banner | 「荷物の配送は完了しました。」 + thời gian | `DA_ESDL_006` | A6-2-ES-Step345 |
| `E-13` | Modal | COOL便 giao thiếu — bắt liên hệ ES | `DA_COOL_001` | A7-COOL |
| `E-14` | Toast | 「荷物配達完了しました。」 đóng bằng × | `DA_HOME_001` | A7-COOL |
| `E-15` | Banner | Mở lại COOL便 sau hoàn tất | `DA_COOL_001` | A7-COOL |
| `E-16` | Modal | Popup gọi ES 「ESキッチンへ電話しますか？」 | Home / RECV / ESDL / COOL | A8-TroubleReport |
| `E-17` | Modal | Xác nhận gửi báo cáo | `DA_RPTD_002` | A8-TroubleReport |
| `E-18` | Toast | 「報告を送信しました。」 đóng bằng × | `DA_HOME_001` | A8-TroubleReport |

**Tổng: 46 màn hình** (28 chính + 18 phụ) → gộp thành **9 sheet** trong workbook.

---

## Assumption môi trường test

> Không phải câu hỏi cho PM/BA (khác AMB-XX) — là điều kiện hạ tầng mà bộ TC ngầm dựa vào.

| # | Assumption |
|---|---|
| 1 | Tài khoản tài xế đã được **E05 tạo sẵn** (app không có luồng tự đăng ký) — QC cần ≥2 account để test song song |
| 2 | Dữ liệu lô hàng đã được **điều phối & gán cho tài xế** từ luồng `delivery-dispatching` — QC cần seed data cho cả 3 mốc thời gian: **hôm nay · tương lai · quá khứ (trong và ngoài 7 ngày)** |
| 3 | Kho đã **import mã vận đơn** cho một phần data, và **chưa import** cho phần khác — để test rule ẩn/hiện 「{n}箱」 (AC-35) |
| 4 | Có data cho cả **2 trạng thái picking**: đã picking (hiện số thật) và chưa picking (hiện 「未確定」) — AC-34 |
| 5 | **AWS SES** hoạt động và QC truy cập được inbox của email test để lấy mã 4 số |
| 6 | **AWS S3** nhận upload ảnh; QC có sẵn file test: JPEG/PNG/HEIC/WebP hợp lệ, 1 file >10MB, 1 file định dạng không hỗ trợ (VD `.txt`) |
| 7 | Thiết bị test **có camera** để quét barcode, và có sẵn barcode thật của sản phẩm trong/ngoài danh sách |
| 8 | Thiết bị test **xử lý được `tel:`** để verify nút gọi `050-5784-2777` (dùng số test nếu không muốn gọi thật) |
| 9 | **Admin Web (E03)** truy cập được để verify các tác động ngược: thông báo 実集金額 lệch (AMB-28), trạng thái đơn đổi sang 「トラブル」 sau báo cáo (AC-97) |
| 10 | Có thể **giả lập mất mạng / server 500** (DevTools throttling / chặn API) để chạy TC nhóm 3 & 4 — **phụ thuộc AMB-01 được chốt trước** |
| 11 | Browser test: **Safari iOS + Chrome Android** (E06 là mobile web, không có app store build) |
