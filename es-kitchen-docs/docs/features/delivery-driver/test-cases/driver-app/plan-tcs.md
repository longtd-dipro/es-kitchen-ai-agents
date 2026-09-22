# TC Implementation Plan: driver-app — delivery-driver

> Nguồn: `analysis.md` (34 AMB · 98 AC · 46 màn) + `.claude/context/specification.md` (E06 = ReactJS Mobile Web)
> **Platform dimensions áp dụng:** `testing_dimensions` → **Web Platform** (Browser Behavior · Session & Cookie · Responsive & Layout · Cross-Browser) + **Cross-Platform** (UI & Message Handling · Security · API Layer). **KHÔNG áp Mobile Platform** (không có cài đặt app / app lifecycle / push notification / xoay màn hình native).
> **Độ sâu:** `Standard` theo quyết định user — **bỏ Visual TC cho 6 states**, giữ Happy Path + Negative + Field-level validation riêng từng trường + Logic/Decision Table.
> **Grouping:** 28 màn → **9 sheet** (template xlsx giới hạn 14 sheet, ~96 dòng/sheet).

---

# SHEET A1-Authen

## DA_AUTHEN_001 — Đăng nhập
- **Archetype:** Form (Create — submit credentials)
- **Chiến lược Test Case:**
  - Test **field-level riêng** cho `ログインID` và `パスワード` trước (BVA 1/255 ký tự, ASCII-only, rule ≥8 + có chữ + có số), sau đó mới test cross-field khi bấm nút — vì AC-03 quy định validate **toàn bộ field cùng lúc khi bấm nút**, không realtime
  - TC riêng cho **AC-05: sai nhiều lần KHÔNG khóa tài khoản** — chạy 10 lần sai liên tiếp rồi đăng nhập đúng, verify vào được. Đây là điểm dễ dev tự thêm lockout
  - TC riêng cho **toggle icon mắt** (AC-04) — verify `type` đổi `password ↔ text`, áp cho cả 3 ô mật khẩu trong module
  - Security: message lỗi dùng chung cho sai ID và sai mật khẩu (AC-01/AC-02) — verify **không phân biệt** để tránh dò tài khoản
  - `[UNCONFIRMED]` TC nhóm Network/Server (AMB-01) và Session (AMB-02)
- **UI chung:** 1 cột — hình minh họa ESSTATION trên, form giữa (2 ô + icon mắt), link 「パスワードを忘れた方はこちら」 + nút đăng nhập dưới.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Hình minh họa + text 「今日も一日、安全運転で頑張りましょう。」 | Label | Low | — | — |
| `ログインID` | Textbox | High | Boundary Tier — 0/1/255/256 ký tự | — |
| `パスワード` | Textbox (masked) | High | Boundary Tier — 7/8/255/256 + Decision Table (có chữ × có số) | — |
| Icon mắt hiện/ẩn mật khẩu | Button (toggle) | Low | — | Phụ thuộc ô `パスワード` |
| Link 「パスワードを忘れた方はこちら」 | Link | Medium | — | — |
| Nút Đăng nhập | Button (submit) | High | Decision Table — ID hợp lệ × mật khẩu hợp lệ × khớp DB | Validate đồng thời cả 2 ô (AC-03) |

## DA_AUTHEN_002_01 — Reset B1: ID + Email
- **Archetype:** Form (Create)
- **Chiến lược Test Case:**
  - Field-level riêng: `ログインID` (1–255) và `メールアドレス` (định dạng `xxx@xxx.xxx`, ≤256) — mỗi trường 1 nhóm TC, không gộp
  - TC trọng tâm **AC-06 + cặp ID+email phải KHỚP NHAU** (không chỉ tồn tại riêng lẻ): dựng Decision Table 4 tổ hợp (ID đúng/sai × email đúng/sai), verify 3 tổ hợp sai đều ra cùng message 「ログインIDまたはメールアドレスが正しくありません。」
  - TC **AC-12: 「ログイン画面に戻る」 xóa dữ liệu đang nhập** — nhập dở rồi back, quay lại verify 2 ô rỗng
  - `[UNCONFIRMED]` TC nhóm External: SES không gửi được mã (AMB-19)
- **UI chung:** 1 cột — tiêu đề 「パスワードリセット」, mô tả, 2 ô nhập, nút 「認証コードを送信」, link quay lại.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Tiêu đề + mô tả | Label | Low | — | — |
| `ログインID` | Textbox | High | Boundary Tier — 0/1/255/256 | — |
| `メールアドレス` | Textbox | High | EP — định dạng hợp lệ/thiếu @/thiếu domain/ký tự lạ; Boundary 256/257 | — |
| Nút 「認証コードを送信」 | Button (submit) | High | **Decision Table — ID khớp × email khớp** (4 tổ hợp) | Validate đồng thời 2 ô |
| Link 「ログイン画面に戻る」 | Link | Medium | — | Xóa dữ liệu 2 ô khi bấm |

## DA_AUTHEN_002_02 — Reset B2: Mã xác thực 4 số
- **Archetype:** Form (Create) — có yếu tố State Transition theo thời gian
- **Chiến lược Test Case:**
  - **State Transition** cho nút xác nhận: 0–3 chữ số = disabled → đủ 4 chữ số = active (`DA_AUTHEN_002_03`) → xóa 1 chữ số = disabled lại. AC-07
  - **State Transition theo thời gian** cho nút gửi lại: 60s đếm ngược disabled → 0s active → bấm gửi lại → reset về 60s. Verify AC-09 **không giới hạn số lần** (bấm gửi lại ≥3 lần)
  - TC đặc thù **AC-08: mã hết hạn 5 phút nhưng màn hình KHÔNG đổi trạng thái** — chờ >5 phút, verify UI y nguyên, chỉ báo lỗi khi bấm xác nhận. Đây là hành vi phản trực giác, dev dễ làm sai
  - TC 4 ô nhập: chỉ nhận số (chặn chữ/ký tự đặc biệt), **tự chuyển focus** sau mỗi chữ số, xóa lùi focus
  - `[UNCONFIRMED]` TC verify email có mask hay không (AMB-10)
- **UI chung:** 1 cột — tiêu đề, mô tả, email đã gửi (chỉ đọc), 4 ô mã, nút xác nhận (→), link gửi lại có đếm ngược, ghi chú hạn 5 phút.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Email đã gửi (chỉ đọc) | Label | Low | — | Lấy từ `DA_AUTHEN_002_01`; mask hay không: AMB-10 |
| 4 ô nhập mã | Textbox (numeric × 4) | High | **State Transition — số ô đã điền (0→4)** + EP chỉ số | Auto-focus ô kế tiếp |
| Nút xác nhận (→) | Button (submit) | High | Decision Table — mã đúng × còn hạn | **Chỉ active khi đủ 4 chữ số** (4 ô trên) |
| Nút 「再送信」 + đếm ngược | Button (timed) | Medium | **State Transition theo thời gian — 60s→0s** | Reset đếm ngược khi bấm |
| Ghi chú 「※認証コードの有効期限は5分です。」 | Label | Low | — | — |

## DA_AUTHEN_002_04 — Reset B3: Mật khẩu mới
- **Archetype:** Form (Create)
- **Chiến lược Test Case:**
  - Field-level riêng cho `新しいパスワード` (≥8, có chữ, có số) — Boundary 7/8 + Decision Table (chữ × số)
  - **Cross-field** `パスワード（確認用）` phụ thuộc ô trên: test riêng case trùng khớp / lệch 1 ký tự / lệch hoa-thường / rỗng. AC-10
  - TC toggle icon mắt cho **cả 2 ô** (AC-04)
  - `[UNCONFIRMED]` TC token reset hết hiệu lực giữa chừng (AMB-20)
- **UI chung:** 1 cột — tiêu đề, mô tả, email tham chiếu (chỉ đọc), 2 ô mật khẩu + icon mắt, nút ✓, link quay lại.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Email tham chiếu (chỉ đọc) | Label | Low | — | Verify **không sửa được** |
| `新しいパスワード` | Textbox (masked) | High | Boundary Tier 7/8/255/256 + Decision Table (chữ × số) | — |
| `パスワード（確認用）` | Textbox (masked) | High | EP — trùng khớp / lệch ký tự / lệch hoa-thường / rỗng | **Phụ thuộc `新しいパスワード`** (AC-10) |
| Icon mắt × 2 | Button (toggle) | Low | — | Mỗi icon gắn 1 ô riêng |
| Nút xác nhận (✓) | Button (submit) | High | Decision Table — mật khẩu hợp lệ × 2 ô trùng khớp | Validate đồng thời 2 ô |
| Link 「ログイン画面に戻る」 | Link | Medium | — | Ngắt luồng reset |

## DA_AUTHEN_002_06 — Reset: Hoàn tất
- **Archetype:** Detail/View
- **Chiến lược Test Case:**
  - TC trọng tâm **AC-11: bấm nút về Home vào thẳng app ở trạng thái ĐÃ ĐĂNG NHẬP, không qua màn login** — verify bằng cách kiểm tra Home load được data của user vừa reset
  - **TC Security** `[UNCONFIRMED]` (AMB-21): truy cập trực tiếp URL `/reset-password/complete` khi chưa qua B3 — verify có bị chặn không
  - TC verify text màn hoàn tất `[UNCONFIRMED]` (AMB-13 — câu tiếp sau 「パスワードリセットに成功しました。」 chưa chốt)
  - TC hồi quy: mật khẩu CŨ không đăng nhập được nữa, mật khẩu MỚI đăng nhập được
- **UI chung:** Card modal có hình xe tải trên nền hình minh họa ES STATION + nút về màn hình chính.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Card + hình xe tải | Label | Low | — | Chỉ hiện khi chuyển hợp lệ từ `DA_AUTHEN_002_04` (AMB-21) |
| Text 「パスワードリセットに成功しました。」 | Label | Low | — | Câu tiếp theo: AMB-13 |
| Nút về màn hình chính | Button | High | — | Auto-login — verify session hợp lệ (AC-11) |

---

# SHEET A2-Home

## DA_HOME_001 — Home: Tiến độ + Lịch 3 ngày
- **Archetype:** Khác (Dashboard + Card-list) → dùng **Fallback** của `screen_strategy` + nguyên tắc Data Display/Boundary/Screen State của List archetype
- **Chiến lược Test Case:**
  - **Công thức tiến độ là TC rủi ro cao nhất màn này**: dựng Decision Table cho `進捗率 = floor(完了 ÷ 本日件数 × 100)` với **quy tắc loại trừ 倉庫受取** (AC-14). Test tổ hợp: chỉ có ES · chỉ có COOL · có cả kho+ES+COOL (verify kho KHÔNG vào tổng) · 0 đơn · làm tròn xuống (2/3 = 66% không phải 67%)
  - **State Transition cho cổng chặn kho** (AC-19) — trạng thái kho `未受取` → COOL/ES không có thẻ độc lập + bấm ra Toast `E-04`; sau khi kho `受取済` → COOL/ES thành thẻ độc lập bấm được. Đây là rule nghiệp vụ quan trọng nhất của app
  - **Thứ tự sắp xếp 5 mức** (AC-17) — seed đủ 5 loại thẻ trong cùng 1 ngày, verify đúng thứ tự COOL未配送 → ES未配送 → 倉庫未受取 → COOLトラブル → ESトラブル
  - Boundary hiển thị: cả 3 ngày trống (`E-05` SOLちゃん) · 1 ngày trống (`E-06`) · không có dữ liệu hôm nay (ẩn cả khối tiến độ, AC-15) — 3 empty state khác nhau, dễ lẫn
  - Toggle 「詳細表示▼」/「非表示▲」 đổi nhãn đúng (AC-20) + bottom nav đúng 5 tab (AC-21)
  - `[UNCONFIRMED]` điều hướng screen code (AMB-06 CONFLICT) · refresh khi admin đổi lịch (AMB-18)
- **UI chung:** Header (tên tài xế + lời chào + icon chuông) → khối 本日の配送進捗 → 3 section lịch theo ngày (thẻ CAM/TÍM/XANH) → bottom nav 5 tab.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Header — tên tài xế + 「安全運転でいってらっしゃいませ。」 | Label | Low | — | — |
| Icon chuông thông báo | Button | Medium | — | → `DA_NOTI_001` |
| Khối 本日の配送進捗 (4 số liệu + thanh %) | Label (computed) | **High** | **Decision Table — loại đơn (ES/COOL/倉庫) × trạng thái** + Boundary làm tròn | **Ẩn toàn khối** khi không có dữ liệu hôm nay (AC-15) |
| Section header 3 ngày (本日/明日/明後日) | Label | Medium | Boundary — hôm nay / +1 / +2 ngày | — |
| Thẻ kho 倉庫受取 (CAM) | Table row / Card | **High** | **State Transition — 未受取 → 受取済 (ẩn thẻ)** | Cổng chặn cho thẻ COOL/ES cùng kho |
| Nút 「詳細表示▼」/「非表示▲」 | Button (toggle) | Low | — | Thuộc thẻ kho; mở ra danh sách COOL/ES bên trong |
| Thẻ COOL便 (TÍM) | Card | **High** | Decision Table — trạng thái kho × vị trí thẻ (độc lập / trong chi tiết) | **Phụ thuộc trạng thái thẻ kho** (AC-19) |
| Thẻ ES配送便 (XANH) | Card | **High** | Decision Table — trạng thái kho × vị trí thẻ | **Phụ thuộc trạng thái thẻ kho** (AC-19) |
| Bottom nav 5 tab | Button group | Medium | — | Tab 「マニュアル」 chưa có màn (AMB-08) |

---

# SHEET A3-Notification

## DA_NOTI_001 — Danh sách thông báo
- **Archetype:** List/Search (không có filter, có pagination dạng 「もっと表示」)
- **Chiến lược Test Case:**
  - Test độc lập: sắp xếp (mới nhất lên đầu, AC-20-list) · chấm đỏ chưa đọc · 「もっと表示」 · cuộn xuống tải thêm — **không test tổ hợp**
  - **Boundary data**: 0 thông báo (`E-07`) · 1 thông báo · vừa đủ 1 lần tải · nhiều hơn 1 lần tải · đã tải hết (nút **ẩn** chứ không disable — AC-26, dễ làm sai)
  - **Format thời gian JST là TC dễ sai nhất**: dựng Boundary cho 「今日・HH:mm」 vs 「M月D日・HH:mm」 — test mốc 23:59 hôm nay, 00:00 hôm nay, hôm qua (verify **KHÔNG hiển thị 「昨日」** — AC-24)
  - `[UNCONFIRMED]` số lượng tải mỗi lần (AMB-09)
- **UI chung:** Header (back 「＜」 + tiêu đề 「お知らせ一覧」) → danh sách 1 dòng/thông báo → nút 「もっと表示」 cuối danh sách.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | Low | — | → `DA_HOME_001` |
| Tiêu đề 「お知らせ一覧」 | Label | Low | — | — |
| Hàng thông báo (ngày giờ + tiêu đề link + chấm đỏ) | Table row | Medium | — | Tap tiêu đề → `DA_NOTI_002` |
| Ngày giờ JST | Label (formatted) | **High** | **Boundary — mốc 00:00 / 23:59 / hôm qua** (KHÔNG dùng 「昨日」) | — |
| Chấm đỏ chưa đọc | Label (indicator) | Medium | State Transition — chưa đọc → đã đọc (sau khi mở chi tiết) | **Phụ thuộc `DA_NOTI_002`** đã mở hay chưa |
| Nút 「もっと表示」 | Button (pagination) | Medium | Boundary — còn dữ liệu / hết dữ liệu (ẩn nút) | Số lượng/lần: AMB-09 |

## DA_NOTI_002 — Chi tiết thông báo
- **Archetype:** Detail/View
- **Chiến lược Test Case:**
  - TC trọng tâm **AC-22: mở màn TỰ ĐỘNG gọi API đánh dấu đã đọc** (không cần thao tác) — verify bằng cách quay lại list thấy chấm đỏ mất
  - TC **AC-25: giữ nguyên xuống dòng và đoạn văn** như admin nhập — seed nội dung có nhiều dòng trống, list, đoạn dài
  - TC **AC-23: KHÔNG có chức năng đánh dấu tất cả đã đọc** — verify không tồn tại nút này ở cả list và detail
  - `[UNCONFIRMED]` cách mở link (AMB-11) · định dạng file đính kèm (AMB-12) · API đánh dấu đã đọc lỗi (AMB-22) · admin xóa khi đang mở (AMB-23)
- **UI chung:** Header back 「＜」 → tiêu đề → ngày giờ → nội dung (giữ format) → link (nếu có) → file đính kèm (nếu có).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | Low | — | → `DA_NOTI_001` |
| Tiêu đề | Label | Low | Boundary — tiêu đề rất dài (app không giới hạn, admin giới hạn) | — |
| Ngày giờ JST | Label (formatted) | Medium | Boundary — cùng quy tắc `DA_NOTI_001` | — |
| Nội dung (rich text) | Label | Medium | EP — 1 dòng / nhiều đoạn / có dòng trống / rất dài | Giữ nguyên xuống dòng (AC-25) |
| Link trong nội dung | Link | Medium | — | Cách mở: AMB-11 |
| File đính kèm | File (download) | Medium | EP — PDF / ảnh / định dạng khác | Định dạng hỗ trợ: AMB-12 |
| **Hành vi ngầm: gọi API đánh dấu đã đọc khi load** | (Behavior) | **High** | State Transition — chưa đọc → đã đọc | Ảnh hưởng chấm đỏ ở `DA_NOTI_001` (AC-22) |

## DA_HOME_005 — Tài khoản (My Page)
- **Archetype:** Detail/View (read-only)
- **Chiến lược Test Case:**
  - TC trọng tâm **AC-27: cả 6 trường CHỈ ĐỌC** — verify từng trường không có ô input, không edit được (thử tap, thử long-press, thử inspect DOM xem có `input` không)
  - TC format `ログインID` = `DR` + 5 chữ số (AC-27) — verify với account thật
  - TC 「ログアウト」 (AC-24-auth): kết thúc phiên → về `DA_AUTHEN_001`; **hồi quy quan trọng**: sau logout, bấm Back của browser KHÔNG vào lại được Home (Session & Cookie — `testing_dimensions` Web)
  - TC bottom nav 5 tab hiển thị đúng ở màn này
  - `[UNCONFIRMED]` refresh khi E05 sửa thông tin (AMB-18)
- **UI chung:** Header lời chào → khối 基本情報 dạng label–value (6 trường) → nút 「ログアウト」 → bottom nav.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Header lời chào 「{tên} さん、…」 | Label | Low | — | — |
| `ログインID` (chỉ đọc) | Label | Medium | EP — format `DR00000` | — |
| `メールアドレス` (chỉ đọc) | Label | Low | — | — |
| `配送スタッフ名` (chỉ đọc) | Label | Low | Boundary — tên dài / ký tự Nhật | — |
| `カナ` (chỉ đọc) | Label | Low | EP — katakana | — |
| `電話番号` (chỉ đọc) | Label | Low | — | — |
| `委託配送先名` (chỉ đọc) | Label | Medium | — | Nguồn từ E05 |
| Nút 「ログアウト」 | Button | **High** | — | Kết thúc phiên — verify Back browser không vào lại được |
| Bottom nav 5 tab | Button group | Low | — | — |

---

# SHEET A4-DeliveryList

## DA_LIST_001_Kho — 配送一覧 Tab A: 倉庫受取
- **Archetype:** List/Search
- **Chiến lược Test Case:**
  - Test **độc lập** từng chức năng: khoảng ngày · dropdown trạng thái · ô tìm kiếm · tap thẻ — **không test toàn bộ tổ hợp**
  - Tổ hợp ưu tiên duy nhất: **dropdown trạng thái `未受取` + tap thẻ** → verify ra đúng `DA_RECV_001` (sửa được) chứ không phải `DA_RECV_003`, vì đây là đường vào nghiệp vụ chính
  - **Boundary khoảng ngày là TC rủi ro cao**: dựng Boundary Tier cho rule ≤31 ngày — 30 / 31 / 32 ngày, và `終了日` = `開始日` / `終了日` < `開始日`. AC-29
  - **Search ở Tab A lọc REALTIME khi gõ** (khác Tab B/C phải Enter — AC-31): test gõ từng ký tự, xóa hết → hiện lại toàn bộ; tìm khớp một phần trên 4 trường `倉庫名`・`中継先`・`納品先拠点名`・`住所`
  - Data Display: quy tắc 3 trạng thái số lượng (AC-34) + ẩn 「{n}箱」 khi chưa import vận đơn (AC-35) + rút gọn tên kho sau 2 dòng (AC-32) + badge màu (AC-36) + format `yyyy-mm-dd（thứ）` tự tính thứ (AC-37)
  - `[UNCONFIRMED]` empty state (AMB-17) · pagination (AMB-04)
- **UI chung:** Header 「配送一覧」 → 2 date picker → tab bar 3 tab → dropdown trạng thái + ô tìm kiếm → danh sách thẻ → bottom nav.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `開始日` | Date picker | **High** | **Boundary Tier — 30/31/32 ngày, quá khứ/tương lai** | Cặp với `終了日` (rule ≤31 ngày) |
| `終了日` | Date picker | **High** | Boundary Tier — `= 開始日` / `< 開始日` / `+31` / `+32` | **Phụ thuộc `開始日`** (AC-29) |
| Tab bar (A/B/C) | Button group | Medium | State Transition — Tab A mặc định khi mở màn (AC-28) | → `DA_LIST_002_ES` / `DA_LIST_003_COOL` |
| Dropdown trạng thái (chọn **đơn**) | Dropdown | Medium | EP — 未受取 / 受取済 / トラブル / không chọn (= tất cả) | Khác Tab B/C dùng chọn nhiều (AC-30) |
| Ô tìm kiếm (realtime) | Textbox (search) | Medium | EP — khớp đủ / khớp một phần / ký tự đặc biệt / rỗng (hiện lại toàn bộ) | Lọc **realtime**, khác Tab B/C (AC-31) |
| Tag 「倉庫受取」 | Label | Low | — | Cố định màu xanh lam |
| Tên kho / trung chuyển | Label | Medium | Boundary — tên ngắn / dài (rút gọn sau 2 dòng `…`) | Rule rút gọn KHÁC Tab B/C (AC-32) |
| Ngày giao `yyyy-mm-dd（thứ）` | Label (formatted) | Medium | Boundary — thứ tự động tính (7 ngày trong tuần) | AC-37 |
| Badge trạng thái | Label | Medium | EP — 未受取 cam / 受取済 xanh lá / トラブル đỏ | AC-36 |
| Stat `{n}社` · `{n}箱` | Label (computed) | **High** | **Decision Table — đã import vận đơn × đã picking** | Ẩn `{n}箱` khi chưa import (AC-35) |
| Stat 冷凍 / 冷蔵・常温 (icon) | Label | Medium | Decision Table — thời điểm (tương lai/hôm nay/quá khứ) × đã picking | Icon tủ lạnh = **冷蔵+常温 gộp** (AC-33) |
| Thẻ (tappable) | Table row | **High** | **Decision Table — trạng thái × thời điểm → màn đích + quyền** (5 tổ hợp) | AC-38 `[UNCONFIRMED]` AMB-04 |

## DA_LIST_002_ES — 配送一覧 Tab B: 未配送
- **Archetype:** List/Search
- **Chiến lược Test Case:**
  - TC phân biệt rõ với Tab A: dropdown kho **chọn NHIỀU** (AC-30) và search **phải bấm Enter** (AC-31) — 2 điểm dev dễ làm giống Tab A
  - TC **AC-32: tên điểm giao XUỐNG DÒNG hiển thị đủ** (không rút gọn) và địa chỉ hiển thị **đầy đủ** gồm tòa nhà/tầng/công ty/phòng ban — ngược với Tab A
  - Boundary ô tìm kiếm: 0 / 255 / 256 ký tự (chặn input)
  - Decision Table cho tap thẻ: ES便 hôm nay → `DA_ESDL_000_0` (sửa) · ES便 tương lai → `DA_ESDL_000_1` (đọc) · COOL便 → `DA_COOL_001` · トラブル → chỉ đọc. AC-38
  - Điều kiện hiện `品数`: **>0 VÀ (đã picking HOẶC tương lai)** — 4 tổ hợp Decision Table
- **UI chung:** Giống Tab A về khung; khác bộ lọc (dropdown chọn nhiều) và nội dung thẻ (icon loại giao, địa chỉ đầy đủ).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Dropdown kho・trung chuyển (chọn **nhiều**) | Dropdown (multi-select) | Medium | EP — chọn 0 / 1 / nhiều / tất cả | Khác Tab A (AC-30) |
| Ô tìm kiếm (Enter) | Textbox (search) | Medium | Boundary 0/255/256 + **chỉ chạy khi Enter** | Khác Tab A (AC-31) |
| Icon loại giao (ES / COOL) | Label | Medium | EP — 2 loại | — |
| Tên điểm giao | Label | Medium | Boundary — dài → **xuống dòng đủ**, KHÔNG rút gọn | Ngược Tab A (AC-32) |
| Địa chỉ đầy đủ | Label | Medium | EP — có/không tòa nhà, tầng, phòng ban | AC-32 |
| Badge trạng thái | Label | Medium | EP — 未配送 cam / トラブル đỏ | AC-36 |
| Stat `{n}箱` | Label (computed) | Medium | Decision Table — tương lai / đã picking / chưa picking (**ẩn**) | AC-34 |
| Stat `品数` (mát/đông) | Label (computed) | Medium | **Decision Table — >0 × (đã picking HOẶC tương lai)** | AC-34 |
| Thẻ (tappable) | Table row | **High** | **Decision Table — loại × trạng thái × thời điểm** | AC-38 |

## DA_LIST_003_COOL — 配送一覧 Tab C: 配送完了
- **Archetype:** List/Search
- **Chiến lược Test Case:**
  - Figma ghi mọi mục 「タブBと同仕様」 → **không lặp lại toàn bộ TC của Tab B**; chỉ test: (1) badge **chỉ** có `配送完了` xanh lá, (2) quyền sửa khi tap thẻ khác Tab B
  - TC trọng tâm **rule 7 ngày** (AC-38 + AC-75): ES便 hoàn tất trong 7 ngày → vào `DA_ESDL_006` **có** nút 「編集」; quá 7 ngày → **ẩn** nút. Dựng Boundary: ngày 6 / ngày 7 / ngày 8 sau khi hoàn tất
  - TC COOL便 đã hoàn tất → chỉ đọc + hiện banner `E-15` khi mở lại (AC-84)
  - `[UNCONFIRMED]` empty state (AMB-17)
- **UI chung:** Giống hệt Tab B.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Bộ lọc + search (same Tab B) | Dropdown + Textbox | Low | — | Figma: 「タブBと同仕様」 — chỉ smoke test |
| Badge trạng thái | Label | Medium | EP — **chỉ** 配送完了 xanh lá | AC-36 |
| Thẻ (tappable) | Table row | **High** | **Boundary Tier — 6 / 7 / 8 ngày sau khi hoàn tất** | Quyết định ẩn/hiện nút 「編集」 ở `DA_ESDL_006` (AC-75) |

---

# SHEET A5-WarehouseRecv

## DA_RECV_001 — Nhận hàng tại kho (sửa được)
- **Archetype:** List + Form (tick nhiều dòng rồi submit)
- **Chiến lược Test Case:**
  - **Đây là màn rủi ro cao nhất module A5** — quyết định mở khóa toàn bộ đơn COOL/ES của kho
  - **Decision Table cho nút 「完了」** (AC-40/42/43): số dòng tick (0 / một phần / hết) × đã liên hệ ES (chưa / tick checkbox / bấm gọi) → 3 kết quả: nút disabled · Toast `E-01` · Modal `E-02`
  - TC **AC-39: KHÔNG có nút chọn tất cả** — verify không tồn tại; và với lô 30+ vận đơn phải tick từng dòng (ghi nhận effort thực tế cho QC)
  - **Điều kiện OR ở Modal `E-02`** (AC-43/44): tick checkbox **HOẶC** bấm gọi ES → nút active. Test riêng từng nhánh + verify bấm gọi ES **tự động tick** checkbox
  - **AC-46: hoàn thành một phần sinh TAG KHO MỚI `未受取`** — verify trên Home có thẻ kho mới với đúng số vận đơn còn lại. `[UNCONFIRMED]` cách đánh số (AMB-05)
  - **State Transition cho nút back** (AC-47/48): 0 tick → về ngay · ≥1 tick → Popup `E-03` → 「キャンセル」 giữ tick / 「破棄」 xóa sạch
  - Lọc/tìm kiếm **phía client**: bật 「未受取のみ表示」 sau khi tick vài dòng (dòng đã tick bị ẩn nhưng **trạng thái tick vẫn giữ**) · ô tìm kiếm chặn >100 ký tự (AC-49)
  - TC **AC-50: badge `トラブル` độc lập checkbox** — tick/bỏ tick không đổi badge
  - `[UNCONFIRMED]` API hoàn tất lỗi có giữ tick (AMB-25) · empty sau khi lọc (AMB-24) · `tel:` fallback (AMB-26)
- **UI chung:** Header (back + 「荷物受取」) → thông tin kho (tên/ngày/số phiếu/địa chỉ) → checkbox lọc + ô tìm kiếm → danh sách vận đơn có checkbox + badge → nút 「完了」 sticky đáy.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | **High** | **State Transition — 0 tick → về ngay; ≥1 tick → Popup `E-03`** | **Phụ thuộc số dòng đã tick** (AC-47) |
| Tên kho / ngày giao / `伝票番号` / địa chỉ | Label | Medium | Boundary — `伝票番号` không giới hạn định dạng/độ dài | — |
| Checkbox 「未受取のみ表示」 | Checkbox (filter) | Medium | State Transition — ON/OFF × dòng đã tick | Lọc client; **giữ trạng thái tick** khi toggle (AC-41) |
| Ô tìm kiếm 「納品先名」 | Textbox (search) | Medium | **Boundary — 99 / 100 / 101 ký tự (chặn input)** | Lọc client realtime (AC-49) |
| Checkbox nhận (từng dòng) | Checkbox | **High** | **Decision Table — số dòng tick (0 / một phần / hết)** | **KHÔNG có chọn tất cả** (AC-39); điều khiển nút 「完了」 |
| Badge trạng thái (từng dòng) | Label | **High** | State Transition — 未受取 → 受取済 (theo checkbox) · トラブル **độc lập** | Phụ thuộc checkbox trừ `トラブル` (AC-41/50) |
| Tên điểm nhận / `送り状番号` | Label | Low | — | — |
| Nút 「完了」 | Button (submit) | **High** | **Decision Table — tick (0/một phần/hết) × đã liên hệ ES** | Điều khiển bởi checkbox dòng (AC-40/42/43) |
| `E-01` Toast hoàn tất | Toast | Medium | Boundary — tự ẩn sau 5 giây | Chỉ hiện khi tick HẾT (AC-42) |
| `E-02` Modal nhận thiếu (checkbox + nút gọi ES + nút hoàn thành + hủy) | Dialog | **High** | **Decision Table — tick checkbox OR bấm gọi ES** | Chỉ hiện khi còn sót; bấm gọi **tự tick** checkbox (AC-44) |
| `E-03` Popup hủy chỉnh sửa | Dialog | **High** | EP — 「キャンセル」 giữ tick / 「破棄」 xóa sạch | Chỉ hiện khi ≥1 tick (AC-48) |

## DA_RECV_003 — Nhận hàng tại kho (chỉ đọc)
- **Archetype:** Detail/View (read-only)
- **Chiến lược Test Case:**
  - ⚠️ **Figma KHÔNG có bảng mô tả cho màn này (AMB-27)** → chỉ viết được TC ở mức "verify chỉ đọc", **toàn bộ TC màn này tag `[UNCONFIRMED]`**
  - TC verify **4 đường vào đều ra màn chỉ đọc** (AC-38): `受取済` · `トラブル` · quá khứ · tương lai
  - TC verify **không thao tác được**: checkbox disabled, **ẩn** nút 「完了」, back **không** hiện popup xác nhận
  - Chờ AMB-27 chốt để bổ sung TC chi tiết từng item
- **UI chung:** Chưa xác định — Figma không có bảng mô tả (AMB-27).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | Medium | — | Về ngay, **không** popup (khác `DA_RECV_001`) |
| Checkbox (disabled) | Checkbox (read-only) | Medium | — | Hiển thị trạng thái đã tick, không sửa được |
| Nút 「完了」 | Button | Medium | — | **Phải ẩn hoàn toàn** |
| Các item khác | **UNKNOWN** | — | — | **AMB-27 — chờ BrSE cung cấp bảng mô tả** |

---

# SHEET A6-1-ES-Step12

## DA_ESDL_000_0 — ES配送便 Tab 基本情報 (hôm nay, 未配送)
- **Archetype:** Detail/View + 1 action button
- **Chiến lược Test Case:**
  - TC trọng tâm **AC-51: nút 「陳列を開始する」 chỉ hiện khi `未配送` VÀ đơn giao TRONG NGÀY** — dựng Decision Table 3 chiều: trạng thái (未配送/配送完了/トラブル) × thời điểm (hôm nay/tương lai/quá khứ) → hiện hay ẩn nút
  - TC verify `納品備考` hiển thị trong **khung nhấn mạnh riêng có icon** (AC-85) — đây là thông tin chỉ dẫn quan trọng cho tài xế, không được hiển thị như text thường
  - TC danh sách vận đơn: **kèm số thứ tự, KHÔNG chạm được** (phân biệt với `DA_COOL_001` nơi vận đơn có checkbox)
  - Data Display: tên điểm giao · ngày `yyyy-mm-dd（曜日）` · badge 3 loại · mã bưu điện · địa chỉ · người phụ trách · SĐT · tóm tắt 「〇箱/〇品(lạnh)/〇品(đông)」
- **UI chung:** Header (back + 「ES配送便」) → thẻ điểm giao → khối thông tin chi tiết → `納品備考` (khung nhấn mạnh) → tóm tắt số thùng → danh sách vận đơn → nút 「陳列を開始する」.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | Medium | — | — |
| Thẻ điểm giao (tên / ngày / badge) | Label | Medium | EP — badge 未配送 / 配送完了 / トラブル | Badge `トラブル` độc lập checkbox |
| Mã bưu điện / địa chỉ / người phụ trách / SĐT | Label | Low | — | — |
| `納品備考` | Label (highlight box) | **High** | EP — có / không có ghi chú | **Phải trong khung có icon** (AC-85) |
| Tóm tắt 「〇箱/〇品」 | Label (computed) | Medium | — | — |
| Danh sách `送り状番号` | Table (read-only) | Medium | — | Kèm số thứ tự, **không chạm được** |
| Nút 「陳列を開始する」 | Button | **High** | **Decision Table — trạng thái × thời điểm (9 tổ hợp)** | AC-51 — quyết định vào được 5 bước hay không |

## DA_ESDL_000_1 — ES配送便 dữ liệu tương lai (chỉ đọc)
- **Archetype:** Detail/View (read-only)
- **Chiến lược Test Case:**
  - TC duy nhất trọng tâm: **nút 「陳列を開始する」 KHÔNG hiện** với đơn ngày tương lai (tên frame Figma ghi rõ `Cannot edit future data`)
  - TC verify số lượng hiển thị dạng `{số đặt}個（予定）` (khác đơn hôm nay đã picking hiện `{n}箱`)
  - Không lặp lại TC Data Display của `DA_ESDL_000_0` (cùng layout) — chỉ smoke 1 TC
- **UI chung:** Giống `DA_ESDL_000_0`, bỏ nút 「陳列を開始する」.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Khối thông tin (same `000_0`) | Label | Low | — | Chỉ smoke test |
| Stat số lượng | Label (computed) | Medium | EP — `{n}個（予定）` cho dữ liệu tương lai | AC-34 |
| Nút 「陳列を開始する」 | Button | **High** | — | **Phải ẩn hoàn toàn** |

## DA_ESDL_000_2 — ES配送便 đã hoàn thành
- **Archetype:** Detail/View + tab
- **Chiến lược Test Case:**
  - TC banner 「荷物の配送は完了しました。」 + thời gian `yyyy年mm月dd日HH時mm分` (AC-73)
  - **Boundary rule 7 ngày** (AC-75): ngày 6 / 7 / 8 sau khi hoàn tất → nút 「編集」 hiện / hiện / **ẩn**
  - TC chuyển tab sang 陳列情報 → `DA_ESDL_006`
- **UI chung:** Giống `DA_ESDL_000_0` + banner hoàn tất + tab sang 陳列情報.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Banner hoàn tất + thời gian | Label | Medium | EP — format `yyyy年mm月dd日HH時mm分` | AC-73 |
| Badge `配送完了` | Label | Low | — | — |
| Tab sang 陳列情報 | Button (tab) | Medium | — | → `DA_ESDL_006` |
| Nút 「編集」 | Button | **High** | **Boundary Tier — 6 / 7 / 8 ngày** | AC-75 |

## DA_ESDL_001 — Step 1: 陳列前写真
- **Archetype:** Form (File Upload)
- **Chiến lược Test Case:**
  - **Field-level cho File Upload** theo `component_checklist` Section File Upload: định dạng hợp lệ (JPEG/PNG/HEIC/WebP) vs không hỗ trợ · kích thước 9.9MB / 10MB / 10.1MB · số lượng 0 / 1 / 20 / 21 ảnh (AC-53/54)
  - **State Transition cho nút 「続ける」**: 0 ảnh = disabled → 1 ảnh = active → xóa hết = disabled lại (AC-53)
  - TC **AC-55: xóa ảnh bằng × ở góc trên phải thumbnail; thay ảnh = xóa rồi tải lại** (không có chức năng thay trực tiếp)
  - TC thanh tiến trình 5 bước **không chạm để nhảy bước** (AC-52) — thử tap vào step 3, verify không chuyển
  - TC câu liên hệ khẩn cấp 050-5784-2777 hiện đúng (AC-56)
  - `[UNCONFIRMED]` nén/retry/upload nền (AMB-32) · camera fallback (AMB-26)
- **UI chung:** Header (back + 「陳列前」) → thẻ điểm giao → thanh tiến trình 5 bước → mục tải ảnh → câu liên hệ khẩn cấp → 2 nút chân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | Medium | — | Về `DA_ESDL_000_0` **ngay** (không popup) |
| Thanh tiến trình 5 bước | Label (indicator) | Medium | State Transition — hoàn thành ✓ / hiện tại / chưa hoàn thành | **Không chạm để di chuyển** (AC-52) |
| Khu vực tải ảnh | File Upload | **High** | **Boundary Tier — 0/1/20/21 ảnh · 9.9/10/10.1MB** + EP định dạng | AC-53/54 |
| Nút xóa ảnh (×) | Button | Medium | Boundary — xóa ảnh cuối cùng (về 0 → nút 「続ける」 disabled) | Ảnh hưởng trạng thái nút 「続ける」 |
| Nút chọn file (camera / file) | Button | Medium | EP — camera / chọn file trong máy | Camera fallback: AMB-26 |
| Câu liên hệ khẩn cấp | Label | Low | — | AC-56 |
| Nút 「戻る」 | Button | Low | — | → `DA_ESDL_000_0` |
| Nút 「続ける」 | Button | **High** | **State Transition — số ảnh 0 ↔ ≥1** | **Phụ thuộc khu vực tải ảnh** (AC-53) |

## DA_ESDL_002 — Step 2: 在庫/廃棄
- **Archetype:** Form (Table nhập liệu nhiều dòng)
- **Chiến lược Test Case:**
  - **TC rủi ro cao nhất: công thức `実在庫 = 理論在庫 − 廃棄数`** (AC-57) — dựng Boundary + Decision Table: 廃棄数 = 0 / = 理論在庫 / > 理論在庫 (ra số âm?) · verify **tự tính lại** khi đổi 廃棄数 · verify **vẫn sửa tay được** 実在庫
  - **Field-level riêng** cho `廃棄数` và `実在庫`: số nguyên ≥0 — Boundary −1 / 0 / 1 / số rất lớn · nhập chữ · nhập thập phân (AC-61)
  - **AC-59: nút 「確認」 chỉ active khi TẤT CẢ sản phẩm đã tích** — khác Step 3 chỉ cần ≥1. Test: tích n−1 dòng (disabled) → tích dòng cuối (active) → bỏ tích 1 dòng (disabled lại)
  - **AC-58: tích `確認` → grayout nút −/＋ và ô nhập CÙNG DÒNG** (không ảnh hưởng dòng khác) — verify theo từng dòng
  - **AC-60: quét barcode đăng ký hủy được cả SP KHÔNG có trong danh sách** + sau quét **tự bật `確認`** (`E-08` modal)
  - Search lọc realtime theo tên **hoặc mã sản phẩm (barcode)**
  - `[UNCONFIRMED]` 「戻る」 có giữ dữ liệu (AMB-15) · 次回納品日 có năm (AMB-14) · empty sau lọc 「未確認のみ表示」 (AMB-24)
- **UI chung:** Header → thẻ điểm giao → thanh tiến trình → tiêu đề 「廃棄登録と実在庫の確認」 + hướng dẫn → search + nút quét mã + 次回納品日 + checkbox 「未確認のみ表示」 → bảng sản phẩm → 2 nút chân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Ô tìm kiếm sản phẩm | Textbox (search) | Medium | EP — tên SP / mã barcode / khớp một phần / rỗng | Lọc realtime trong màn |
| Nút quét mã vạch | Button | **High** | EP — SP có trong danh sách / **KHÔNG có trong danh sách** | → `E-08`; sau quét **tự bật `確認`** (AC-60) |
| 「※次回納品日 〇月〇日」 | Label | Low | — | Có năm hay không: AMB-14 |
| Checkbox 「未確認のみ表示」 | Checkbox (filter) | Medium | State Transition — ON/OFF × dòng đã tích | Empty sau lọc: AMB-24 |
| Checkbox `確認` (từng dòng) | Checkbox | **High** | **Decision Table — số dòng tích (0 / n−1 / tất cả)** | Grayout ô nhập **cùng dòng** (AC-58); điều khiển nút 「確認」 |
| `理論在庫` (chỉ đọc + tooltip) | Label | Medium | — | Giá trị hệ thống tính |
| `廃棄数（△）` | Textbox (numeric) + Stepper | **High** | **Boundary Tier — −1/0/1/lớn · chữ · thập phân** | Thay đổi → **tự tính lại `実在庫`** (AC-57) |
| `実在庫（廃棄後）` | Textbox (numeric) + Stepper | **High** | **Boundary + Decision Table — auto-tính × sửa tay** | **Phụ thuộc `理論在庫` và `廃棄数`** (AC-57) |
| `E-08` Modal quét mã hủy | Dialog | **High** | EP — 「続けてスキャン」 / 「一覧に戻る」 (cả 2 đều LƯU) | Sau khi lưu → tự bật `確認` dòng tương ứng |
| Nút 「戻る」 | Button | Medium | — | Về Step 1 — **giữ dữ liệu hay không: AMB-15** |
| Nút 「確認」 | Button | **High** | **State Transition — chưa tích hết ↔ tích HẾT** | AC-59 — khác Step 3 (chỉ cần ≥1) |

## DA_ESDL_002-05 — Step 2: Kết quả thành công
- **Archetype:** Detail/View (Report)
- **Chiến lược Test Case:**
  - TC banner `E-09` 「在庫/廃棄が成功しました。」 + thời gian `yyyy年mm月dd日HH時mm分` (AC-62)
  - TC bảng tóm tắt khớp giá trị đã nhập ở Step 2: `連番` / `商品名` / `廃棄数` / `実在庫` — **hồi quy quan trọng**: sửa 廃棄数 ở Step 2 rồi quay lại, verify bảng cập nhật đúng
  - TC thanh tiến trình: ①② = ✓, ③ = bước tiếp theo (số xám), ④⑤ = chưa hoàn thành
  - TC 「戻る」 về màn nhập Step 2 · 「続ける」 → Step 3
- **UI chung:** Header + thẻ điểm giao → banner hoàn tất → thanh tiến trình → bảng tóm tắt → 2 nút.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `E-09` Banner hoàn tất + thời gian | Label | Medium | EP — format thời gian | AC-62 |
| Thanh tiến trình (①②✓ ③xám) | Label (indicator) | Low | — | — |
| Bảng tóm tắt (連番/商品名/廃棄数/実在庫) | Table (read-only) | **High** | — | **Phải khớp giá trị nhập ở `DA_ESDL_002`** |
| Nút 「戻る」 | Button | Medium | — | Về `DA_ESDL_002` |
| Nút 「続ける」 | Button | Medium | — | **Luôn active** → `DA_ESDL_003` |

---

# SHEET A6-2-ES-Step345

## DA_ESDL_003 — Step 3: 陳列 (検品)
- **Archetype:** Form (Table nhập liệu nhiều dòng)
- **Chiến lược Test Case:**
  - **TC rủi ro cao nhất: điều kiện hiện popup `E-11`** — ⚠️ **AMB-03 CONFLICT** (Figma tự mâu thuẫn: 「すべての差異が0以外」 vs 「差異が1件以上」). Dựng Decision Table cho **cả 2 cách hiểu**, tag `[UNCONFIRMED]`, chờ BrSE chốt rồi bỏ nhánh sai
  - **AC-63: `実際数` giá trị ban đầu = `予定数`** — verify khi mở màn lần đầu, và sau khi 「戻る」 từ Step 4 quay lại
  - **AC-64: nút 「確認」 active khi ≥1 tích** (khác Step 2 cần TẤT CẢ) — test tích 1 dòng duy nhất trong n dòng
  - **AC-65: điều kiện BẮT BUỘC tick 「ESキッチンへ連絡済みです。」** ở `E-11` — khác `E-02`/`E-13` (điều kiện OR có nút gọi ES tự tick). Ở đây nút gọi ES **KHÔNG** tự tick → test riêng nhánh này
  - **AC-68: 「戻る」 về Step 2 GIỮ dữ liệu đã nhập** — nhập dở 実際数, back, quay lại verify còn nguyên
  - TC quét barcode `E-10` → tự tích `確認` (AC-60)
- **UI chung:** Header → thẻ điểm giao → thanh tiến trình → search + nút quét mã → bảng sản phẩm (確認 / 商品名+予定数 / 実際数) → 2 nút chân trang.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút quét mã vạch | Button | **High** | — | → `E-10`; sau quét tự bật `確認` |
| Checkbox `確認` (từng dòng) | Checkbox | **High** | **Decision Table — số dòng tích (0 / 1 / tất cả)** | Grayout ô `実際数` cùng dòng; nút 「確認」 cần **≥1** (AC-64) |
| `商品名` + 「予定数：〇個」 | Label | Medium | — | Hệ thống tự hiển thị, **không chạm được** |
| `実際数` | Textbox (numeric) + Stepper | **High** | **Boundary −1/0/1/lớn** + **Decision Table — = 予定数 / ≠ 予定数 (chênh lệch)** | **Giá trị ban đầu = `予定数`** (AC-63) |
| `E-10` Modal quét kiểm phẩm | Dialog | **High** | EP — 「続けてスキャン」 / 「一覧に戻る」 | Tự bật `確認` sau khi lưu |
| `E-11` Modal chênh lệch + liên hệ ES | Dialog | **High** | ⚠️ **Decision Table 2 CÁCH HIỂU — AMB-03 CONFLICT** | Checkbox **BẮT BUỘC** (khác `E-02`/`E-13` dùng OR) — AC-65 |
| Nút 「戻る」 | Button | Medium | — | Về Step 2, **GIỮ dữ liệu** (AC-68) |
| Nút 「確認」 | Button | **High** | **Decision Table — có sót × có chênh lệch** | AC-64/65/66 `[UNCONFIRMED]` AMB-03 |

## DA_ESDL_003-06 — Step 3: Kết quả (bảng 差異)
- **Archetype:** Detail/View (Report)
- **Chiến lược Test Case:**
  - **TC màu cột `差異` là TC phản trực giác nhất module** (AC-67): `差異 = 予定数 − 実際数`; **0 = ĐEN · âm (thực tế NHIỀU hơn) = CAM · dương (thực tế ÍT hơn) = XANH LÁ**. Dựng Boundary: 差異 = −1 / 0 / +1 và verify đúng 3 màu
  - TC màn này vào được từ **2 đường** (AC-44-ES): bấm 「確定」 khi không chênh lệch, HOẶC bấm 「報告完了」 khi có chênh lệch + đã liên hệ ES
  - TC rút gọn tên sản phẩm bằng `…` khi vượt chiều rộng
  - TC 「戻る」 về Step 3 · 「続ける」 → Step 4
- **UI chung:** Header + thẻ điểm giao → banner → thanh tiến trình → bảng 連番/商品/予定数/実際数/差異 → 2 nút.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Banner hoàn tất | Label | Low | — | — |
| Bảng kết quả (5 cột) | Table (read-only) | **High** | — | Phải khớp giá trị nhập ở `DA_ESDL_003` |
| Cột `差異` (có màu) | Label (computed + color) | **High** | **Boundary Tier — −1 / 0 / +1 → CAM / ĐEN / XANH LÁ** | = `予定数 − 実際数` (AC-67) |
| Cột `商品` (rút gọn) | Label | Low | Boundary — tên dài → `…` | — |
| Nút 「戻る」 / 「続ける」 | Button | Medium | — | → `DA_ESDL_003` / `DA_ESDL_004` |

## DA_ESDL_004 — Step 4: 陳列後写真
- **Archetype:** Form (File Upload)
- **Chiến lược Test Case:**
  - Cùng thông số Step 1 → **không lặp lại toàn bộ** Boundary định dạng/kích thước; chỉ chạy 1 TC smoke cho mỗi rule + tập trung vào điểm KHÁC: nút 「戻る」 về **`DA_ESDL_003-06`** (màn kết quả Step 3), không phải màn nhập
  - TC **State Transition nút 「続ける」**: 0 ảnh disabled → ≥1 ảnh active → `DA_ESDL_005` (AC-53)
  - `[UNCONFIRMED]` AMB-07 CONFLICT: Step 4 có sửa lại được trong 7 ngày không (connector thiếu 「Step 4 edit」)
- **UI chung:** Giống Step 1, tiêu đề 「陳列後」.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Khu vực tải ảnh | File Upload | **High** | Boundary 0/1/20/21 ảnh (smoke — cùng rule Step 1) | AC-53/54 |
| Nút xóa ảnh (×) | Button | Medium | Boundary — xóa ảnh cuối → nút disabled | — |
| Nút 「戻る」 | Button | Medium | — | → **`DA_ESDL_003-06`** (khác Step 1) |
| Nút 「続ける」 | Button | **High** | State Transition — 0 ↔ ≥1 ảnh | → `DA_ESDL_005` |

## DA_ESDL_005 — Step 5: 集金登録
- **Archetype:** Form
- **Chiến lược Test Case:**
  - **TC liên quan TIỀN → Risk cao nhất module**: `実集金額` Boundary −1 / 0 / 1 / 999,998 / 999,999 / 1,000,000 · nhập chữ · thập phân (AC-70)
  - **AC-71: lệch `集金予定額` hoặc để 0 → CẢNH BÁO + thông báo admin, nhưng VẪN cho bấm 「完了」** — đây là hành vi đặc biệt (cảnh báo không chặn). Decision Table: 実集金額 = 0 / < dự kiến / = dự kiến / > dự kiến → cảnh báo hay không × cho hoàn tất hay không. `[UNCONFIRMED]` dạng hiển thị cảnh báo (AMB-28)
  - **AC-72: nút 「完了」 LUÔN active, KHÔNG có hộp thoại xác nhận** — verify bấm là hoàn tất ngay, không popup
  - TC `集金予定額` **chỉ đọc, nền xám**, format phân cách 3 chữ số + 「円」 (AC-69)
  - TC hồi quy: sau 「完了」 trạng thái đơn = `配送完了` + banner `E-12` (AC-72/73)
  - **TC cross-check với Admin Web**: verify admin nhận được thông báo khi lệch (AMB-28 phần 2)
- **UI chung:** Header + thẻ điểm giao → thanh tiến trình → `集金予定額` (chỉ đọc) + `実集金額` (nhập) → nút 「完了」.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `集金予定額` (chỉ đọc, nền xám) | Label | Medium | EP — format `10,000 円` | Verify **không sửa được** (AC-69) |
| `実集金額` | Textbox (numeric) | **High** | **Boundary Tier — −1/0/1/999,998/999,999/1,000,000 · chữ · thập phân** | So với `集金予定額` → quyết định cảnh báo (AC-70/71) |
| Cảnh báo lệch số tiền | (dạng hiển thị: **AMB-28**) | **High** | **Decision Table — 実集金額 vs 集金予定額 (4 tổ hợp)** | **Không chặn** nút 「完了」 (AC-71) |
| Nút 「完了」 | Button (submit) | **High** | — | **LUÔN active, KHÔNG hộp thoại xác nhận** (AC-72) |
| Tác động sau hoàn tất | (Behavior) | **High** | State Transition — 未配送 → 配送完了 | Banner `E-12` + thông báo admin (AC-72/73) |

## DA_ESDL_006 — Sau hoàn thành: Tab 陳列情報 + 駐車報告
- **Archetype:** Detail/View (tab) + Form (駐車報告 inline edit)
- **Chiến lược Test Case:**
  - **AC-74: chỉ truy cập được SAU KHI hoàn tất cả 5 bước** — thử vào khi mới xong Step 3, verify bị chặn
  - **Step nav 1–5 chạm để xem lại** từng bước (AC-74): verify nội dung mỗi bước đúng (①④ = thumbnail ảnh chạm phóng to · ② = bảng 廃棄数/実在庫 · ③ = bảng 差異 · ⑤ = 集金予定額/実集金額)
  - **Boundary rule 7 ngày cho nút 「編集」** (AC-75): ngày 6 / 7 / 8 → hiện / hiện / **ẩn**. Áp cho cả icon ✏️ của 駐車報告
  - **駐車報告 State Transition**: chỉ đọc → (✏️) chỉnh sửa → (💾 lưu / × hủy) → chỉ đọc. TC **AC-76: ảnh hóa đơn BẮT BUỘC, chưa có thì KHÔNG lưu được**
  - TC **AC-77: bấm × hủy KHÔNG hiện hộp thoại xác nhận** (khác `DA_RECV_001` có popup `E-03`)
  - `[UNCONFIRMED]` AMB-07 — Step 4 edit
- **UI chung:** Header → banner `E-12` → tab (基本情報 / 陳列情報) → step nav 1–5 → nội dung bước đang chọn → khối 駐車報告 (chỉ đọc ↔ chỉnh sửa).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `E-12` Banner hoàn tất + thời gian | Label | Medium | — | Chỉ hiện sau khi xong CẢ 5 bước (AC-73) |
| Step nav 1–5 (chạm xem lại) | Button group (tab) | **High** | State Transition — 5 bước × trạng thái đang chọn | **Chỉ truy cập sau khi hoàn tất 5 bước** (AC-74) |
| Nội dung ①陳列前 / ④陳列後 (thumbnail) | Table (image) | Medium | — | Chạm phóng to |
| Nội dung ②在庫/廃棄 (bảng) | Table (read-only) | Medium | — | Khớp `DA_ESDL_002` |
| Nội dung ③陳列 (bảng 差異) | Table (read-only) | Medium | — | Khớp `DA_ESDL_003-06` |
| Nội dung ⑤集金登録 | Label | Medium | — | Khớp `DA_ESDL_005` |
| Nút 「編集」 | Button | **High** | **Boundary Tier — 6 / 7 / 8 ngày sau hoàn tất** | AC-75; Step 4 edit: **AMB-07** |
| 駐車報告 — icon ✏️ | Button (toggle mode) | Medium | State Transition — chỉ đọc → chỉnh sửa | Chỉ hiện ≤7 ngày |
| 駐車報告 — ảnh hóa đơn | File Upload | **High** | Boundary — 0 / 1 ảnh (tối đa 1) + EP định dạng/kích thước | **BẮT BUỘC** — chưa có thì 💾 không lưu được (AC-76) |
| 駐車報告 — phí đỗ xe | Textbox (numeric) | Medium | **Boundary — −1/0/999,999/1,000,000** | Tùy chọn (AC-77) |
| 駐車報告 — icon 💾 lưu | Button | **High** | Decision Table — có ảnh hóa đơn × có phí | **Phụ thuộc ảnh hóa đơn** (AC-76) |
| 駐車報告 — icon × hủy | Button | Medium | — | **KHÔNG hộp thoại xác nhận** (AC-77) |

---

# SHEET A7-COOL

## DA_COOL_001 — COOL便: Chi tiết giao hàng
- **Archetype:** Detail/View + Form (tick nhiều dòng rồi submit)
- **Chiến lược Test Case:**
  - Cấu trúc logic **gần giống `DA_RECV_001`** → tái dùng khung Decision Table, nhưng test riêng các điểm KHÁC:
    - Nút 「完了」 **chỉ hiện khi `未配送` VÀ đơn TRONG NGÀY** (AC-80) — `DA_RECV_001` không có điều kiện ngày này. `[UNCONFIRMED]` đơn tương lai (AMB-16)
    - Vận đơn **không chạm được**, mỗi vận đơn có checkbox riêng (AC-79)
    - Hoàn tất một phần → **sinh tag COOL便 mới `未配送`** (AC-83), không phải tag kho
    - Toast `E-14` đóng bằng **nút ×** (khác `E-01` tự ẩn sau 5 giây) — AC-81
    - Mở LẠI màn sau hoàn tất → banner `E-15` (AC-84) — `DA_RECV_001` không có
    - `[UNCONFIRMED]` back khi đã tick có popup xác nhận hay không (AMB-29)
  - TC mã bưu chính **kèm dấu gạch ngang, nguyên giá trị master** (AC-78) — VD `151-0051`
  - TC `納品備考` trong khung nhấn mạnh có icon (AC-85)
- **UI chung:** Header (back + 「COOL便」/「荷物受取」) → thẻ điểm giao → thông tin chi tiết → `納品備考` → tóm tắt số thùng → danh sách vận đơn có checkbox → nút 「完了」.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Nút back 「＜」 | Button | Medium | — | Popup xác nhận hay không: **AMB-29** |
| Mã bưu chính | Label | Medium | EP — format `151-0051` kèm gạch ngang | AC-78 |
| Địa chỉ / người phụ trách / SĐT | Label | Low | — | — |
| `納品備考` | Label (highlight box) | **High** | EP — có / không | Khung có icon (AC-85) |
| Tóm tắt 「〇箱/〇品」 | Label (computed) | Medium | — | — |
| Danh sách `送り状番号` | Table (read-only) | Medium | — | **Không chạm được** (AC-79) |
| Checkbox xác nhận đã giao (từng dòng) | Checkbox | **High** | **Decision Table — số dòng tick (0 / một phần / hết)** | Điều khiển nút 「完了」 (AC-80) |
| Badge trạng thái | Label | **High** | EP — 未配送 / 配送完了 / トラブル (**độc lập checkbox**) | AC-79 |
| Nút 「完了」 | Button (submit) | **High** | **Decision Table — trạng thái × thời điểm × số dòng tick** | AC-80 `[UNCONFIRMED]` AMB-16 |
| `E-13` Modal giao thiếu | Dialog | **High** | **Decision Table — tick checkbox OR bấm gọi ES** | Sinh tag COOL便 mới (AC-82/83) |
| `E-14` Toast hoàn tất | Toast | Medium | — | **Đóng bằng nút ×** (khác `E-01`) — AC-81 |
| `E-15` Banner khi mở lại | Label | Medium | State Transition — 配送完了 → mở lại thấy banner | AC-84 |

---

# SHEET A8-TroubleReport

## DA_RPTD_001 — Báo cáo sự cố: Chọn điểm giao / kho
- **Archetype:** List/Search (single-select bằng radio)
- **Chiến lược Test Case:**
  - **AC-86: `E-16` popup gọi ES hiện từ 2 đường** — tab 「トラブル」 ở Home, và **icon chuông ở header màn 荷物受取 / ES配送便 / COOL便**. Test cả 4 điểm vào
  - **AC-87: CHỈ hiển thị đơn `未配送`** — seed thêm đơn `配送完了`/`受取済`, verify không xuất hiện
  - **AC-89: radio CHỈ chọn 1** + nút 「戻る」「次へ」 **chỉ hiện SAU KHI chọn** — test trước/sau khi chọn
  - **AC-90: chọn KHO → hiển thị các đơn chưa nhận VÀ chưa giao thuộc kho đó** (logic khác chọn điểm giao)
  - **AC-88: icon 3 màu** — xanh ES / tím COOL / **cam = kho**. Test cả 3 loại thẻ
  - TC `所属倉庫名` **chỉ hiện với thẻ điểm giao**, không có ở thẻ kho (AC-88-detail); thẻ kho hiện thêm 「〇社」
  - Search khớp một phần theo **tên kho / tên điểm / số vận đơn** (3 trường), lọc realtime
  - `[UNCONFIRMED]` empty state khi không có đơn 未配送 (AMB-30)
- **UI chung:** Header (back + 「トラブル報告」) → 「配達一覧」 → ô tìm kiếm → 3 dòng hướng dẫn → danh sách thẻ có radio → 2 nút (chỉ hiện sau khi chọn).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `E-16` Popup gọi ES | Dialog | **High** | EP — 4 điểm vào (tab トラブル + icon chuông ở 3 màn) | AC-86 |
| Ô tìm kiếm | Textbox (search) | Medium | EP — tên kho / tên điểm / số vận đơn / khớp một phần | Lọc realtime |
| 3 dòng văn bản hướng dẫn | Label | Medium | — | Gồm 「※複数の拠点…それぞれの拠点ごとに登録してください。」 |
| Icon loại giao (3 màu) | Label | Medium | EP — xanh ES / tím COOL / **cam kho** | AC-88 |
| Badge trạng thái | Label | Medium | EP — **chỉ** 未配送 / 未受取 | AC-87 |
| `所属倉庫名` | Label | Medium | Decision Table — thẻ điểm giao (hiện) × thẻ kho (ẩn) | — |
| Tóm tắt hàng hóa | Label (computed) | Medium | Decision Table — thẻ kho hiện thêm 「〇社」 | — |
| Radio chọn điểm/kho | Radio button | **High** | **Decision Table — chọn điểm giao × chọn KHO (2 logic khác nhau)** | Chọn kho → hiện đơn chưa nhận + chưa giao (AC-90) |
| Nút 「戻る」/「次へ」 | Button | **High** | State Transition — chưa chọn (ẩn) → đã chọn (hiện) | **Phụ thuộc radio** (AC-89) |

## DA_RPTD_002 — Báo cáo sự cố: Chi tiết
- **Archetype:** Form (Create)
- **Chiến lược Test Case:**
  - **AC-95: nút 「送信」 chỉ active khi ≥1 vận đơn VÀ đã chọn nội dung sự cố** — Decision Table 4 tổ hợp (có/không vận đơn × có/không loại sự cố)
  - **AC-91: checkbox chọn tất cả có 3 trạng thái** — bật (tất cả) / tắt (không) / **trung gian (−)** khi chọn một phần. Đây là điểm dev dễ bỏ trạng thái trung gian
  - **AC-93: ô lý do CHỈ hiện khi chọn 「その他」**, bắt buộc, 1–255 ký tự, **viền đỏ** — State Transition: chọn 箱数不足 (ẩn ô) → chọn その他 (hiện ô) → chọn lại 荷物破損 (ẩn ô, dữ liệu đã nhập có mất?)
  - **Field-level riêng**: ô lý do (Boundary 0/1/255/256) · `備考` (Boundary 0/500/501, **nhập nhiều dòng**) · ảnh (0/20/21, ≤10MB, 4 định dạng) — AC-93/94
  - **AC-97: sau gửi thành công → trạng thái đơn TỰ cập nhật `トラブル` (ĐỎ) + KIỆN HÀNG KHÔNG THAO TÁC ĐƯỢC** — hồi quy: quay lại Home, thử tap đơn đó verify bị khóa
  - **AC-98: validate phía SERVER** — test bypass client (sửa DOM bỏ disabled rồi submit) verify server vẫn chặn
  - TC 「戻る」 → **nội dung đã nhập BỊ HỦY** (AC-50-rptd), không có popup xác nhận
- **UI chung:** Header (back + 「トラブル報告」) → thẻ điểm giao đã chọn → checkbox chọn tất cả + danh sách vận đơn có checkbox → radio 4 loại sự cố → (ô lý do nếu その他) → upload ảnh → `備考` → 2 nút.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Thẻ thông tin điểm giao đã chọn | Label | Low | — | Từ `DA_RPTD_001` |
| Checkbox chọn tất cả | Checkbox (tri-state) | **High** | **State Transition — bật / tắt / TRUNG GIAN (−)** | **Phụ thuộc checkbox từng dòng** (AC-91) |
| Checkbox vận đơn (từng dòng) | Checkbox | **High** | Boundary — 0 / 1 / tất cả | **BẮT BUỘC ≥1** (AC-92); điều khiển checkbox chọn tất cả |
| Radio nội dung sự cố (4 giá trị) | Radio button | **High** | **State Transition — その他 (hiện ô lý do) ↔ 3 giá trị khác (ẩn)** | **BẮT BUỘC chọn 1** (AC-92); điều khiển ô lý do |
| Ô nhập lý do | Textbox | **High** | **Boundary — 0/1/255/256 ký tự** | **Chỉ hiện + bắt buộc khi chọn 「その他」** (AC-93) |
| Upload ảnh sự cố | File Upload | Medium | Boundary 0/20/21 ảnh · ≤10MB · 4 định dạng | **Tùy chọn** (AC-94) |
| Nút xóa ảnh (×) | Button | Low | — | Thay ảnh = xóa rồi tải lại |
| `備考` | Textarea | Medium | **Boundary — 0/500/501 ký tự**, nhập nhiều dòng | **Tùy chọn** (AC-94) |
| Nút 「戻る」 | Button | Medium | — | **Nội dung đã nhập BỊ HỦY**, không popup |
| Nút 「送信」 | Button (submit) | **High** | **Decision Table — ≥1 vận đơn × đã chọn loại sự cố** | AC-95 |
| `E-17` Modal xác nhận gửi | Dialog | **High** | EP — 「報告する」 / 「キャンセル」 | Có câu cảnh báo khóa kiện hàng (AC-96) |
| `E-18` Toast + tác động sau gửi | Toast + Behavior | **High** | State Transition — 未配送 → トラブル (ĐỎ) + KHÓA kiện hàng | Validate phía **SERVER** (AC-97/98) |

---

## Ghi chú grouping → sheet

| Sheet | Màn chính | Màn phụ | Ước TC |
|---|---|---|---|
| A1-Authen | `DA_AUTHEN_001` · `002_01` · `002_02` · `002_04` · `002_06` | — | ~85 |
| A2-Home | `DA_HOME_001` | `E-04` `E-05` `E-06` | ~55 |
| A3-Notification | `DA_NOTI_001` · `DA_NOTI_002` · `DA_HOME_005` | `E-07` | ~60 |
| A4-DeliveryList | `DA_LIST_001_Kho` · `DA_LIST_002_ES` · `DA_LIST_003_COOL` | — | ~80 |
| A5-WarehouseRecv | `DA_RECV_001` · `DA_RECV_003` | `E-01` `E-02` `E-03` | ~75 |
| A6-1-ES-Step12 | `DA_ESDL_000_0` · `000_1` · `000_2` · `001` · `002` · `002-05` | `E-08` `E-09` | ~95 |
| A6-2-ES-Step345 | `DA_ESDL_003` · `003-06` · `004` · `005` · `006` | `E-10` `E-11` `E-12` | ~95 |
| A7-COOL | `DA_COOL_001` | `E-13` `E-14` `E-15` | ~50 |
| A8-TroubleReport | `DA_RPTD_001` · `DA_RPTD_002` | `E-16` `E-17` `E-18` | ~70 |
| **TỔNG** | **28 màn chính** | **18 màn phụ** | **~665 TC** |

> ⚠️ Sheet A6-1 và A6-2 ước ~95 TC — sát trần **96 dòng/sheet** của template. Nếu vượt khi sinh thật, tách thêm sheet (vẫn còn dư 5 slot trong giới hạn 14 sheet).
