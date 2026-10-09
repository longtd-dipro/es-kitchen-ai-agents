# TC Implementation Plan: auth-dashboard (Delivery Partner Portal E05 P2)

> Nguồn: `analysis.md` v1.1 (22 AC · 10 AMB, 2 High đã chốt) + Figma canvas `Delivery (P2)`.
> Platform: **Web desktop 1440×1024** → áp `testing_dimensions` section Web.

---

## OW_AUTH_001 — ログイン

- **Archetype:** Form (Authentication)
- **Chiến lược Test Case:**
  - `ログインID` và `パスワード` validate **cùng lúc khi bấm nút**, KHÔNG validate lúc rời focus → mọi TC validation phải thực hiện qua thao tác bấm `ログイン`, không phải blur.
  - Boundary tập trung ở `パスワード` (min 8) và `ログインID` (1–255) — dùng BVA cho 4 mốc mỗi trường.
  - AC-02 khẳng định **không có cơ chế khoá tài khoản**: cần 1 TC bảo mật lặp 10 lần sai rồi nhập đúng để ghi nhận hành vi hiện tại (chốt AMB-10).
  - AMB-01 đã chốt: tài khoản `仮登録` phải ra message RIÊNG `「お申し込みは審査中です。」` — tách hẳn khỏi TC sai mật khẩu.
  - 3 lối ra khỏi màn (`ログイン` / `新規登録` / quên mật khẩu) đều phải có TC điều hướng riêng.
- **UI chung:** 1 cột, card căn giữa nền trắng, logo ESSTATION phía trên card.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `ログインID` | Textbox | High | BVA (1 / 255) | Cùng bị validate 1 lượt với password khi bấm nút |
| `パスワード` | Password | High | BVA (7 / 8) + EP (có chữ / có số) | — |
| Icon 👁 hiện/ẩn mật khẩu | Button (toggle) | Medium | State Transition (password ↔ text) | Phụ thuộc `パスワード` có giá trị |
| Nút `ログイン` | Button | High | Decision Table (ID hợp lệ × PW hợp lệ × trạng thái TK) | Trigger validate toàn bộ form |
| Nút `新規登録` | Button | Low | — | → `OW_AUTH_003` |
| Link `パスワードを忘れた方はこちら` | Link | Low | — | → `OW_AUTH_002` |

---

## OW_AUTH_002 — パスワード再設定 (Wizard 4 bước)

- **Archetype:** Wizard (4 step)
- **Chiến lược Test Case:**
  - Test theo **State Transition** giữa 4 bước, không gộp: mỗi bước có điều kiện vào/ra riêng; đặc biệt kiểm tra không nhảy cóc bước bằng URL trực tiếp.
  - `認証コード` là trọng tâm rủi ro: đúng / sai / hết hạn TTL 5 phút → 3 nhánh riêng (AC-12).
  - Countdown `再送信` (AC-13): test tại `00:01`, `00:00` và ngay sau khi vừa gửi lại — dùng BVA theo thời gian.
  - AC-14 là điểm đặc biệt: sau bước 4 user **đã ở trạng thái đăng nhập** → TC phải verify vào thẳng `OW_HOME_001` mà không nhập lại credential.
  - `パスワード（確認用）` chỉ có ý nghĩa khi so với `新しいパスワード` → TC cặp đôi, không test độc lập.
- **UI chung:** 1 cột, card căn giữa, hiển thị bước hiện tại; mỗi bước chỉ có 1–2 field + 1 nút chính.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Bước 1 — `ログインID` | Textbox | High | — | Cặp với email bước 1 |
| Bước 1 — `メールアドレス` | Email | High | EP (đã đăng ký / chưa đăng ký) | — |
| Bước 1 — Nút `認証コードを送信` | Button | High | — | Kích hoạt gửi mail + chuyển bước 2 |
| Bước 2 — `認証コード` | Textbox (4 số) | High | Decision Table (đúng × sai × hết hạn) | Phụ thuộc mã đã gửi ở bước 1 |
| Bước 2 — Link `再送信` + countdown | Link + Timer | High | BVA thời gian (`00:01` / `00:00`) | Disable khi countdown > `00:00` |
| Bước 2 — Nút `確認` | Button | High | — | — |
| Bước 3 — `新しいパスワード` | Password | High | BVA (7 / 8 / 20 / 21) | — |
| Bước 3 — `パスワード（確認用）` | Password | High | EP (khớp / không khớp) | **Phụ thuộc** `新しいパスワード` |
| Bước 3 — 2 icon 👁 | Button (toggle) | Low | — | — |
| Bước 4 — Nút `ホーム画面へ` | Button | High | — | Verify đã auto-login (AC-14) |

---

## OW_AUTH_003 — 申し込むフォーム 1/2 (基本情報)

- **Archetype:** Form Create (multi-step, bước 1/2)
- **Chiến lược Test Case:**
  - Màn nhiều field nhất module (18 field) → **mỗi field 1 bộ validation riêng theo loại**, tuyệt đối không dùng chung 1 bộ cho text/email/phone/postal.
  - 2 hành vi tự động là trọng tâm: `カナ` tự sinh khi blur `委託配送先名` (AC-06) và mã bưu điện 7 số tự điền 3 trường địa chỉ (AC-04) → test cả chiều thuận lẫn chiều sửa tay đè lên giá trị tự điền.
  - AC-05 là **negative đảo ngược**: mã bưu điện không tồn tại thì KHÔNG báo lỗi và KHÔNG xoá giá trị — dễ bị dev làm sai thành hiện lỗi.
  - Bảng `担当者` là bảng động: thêm dòng, xoá dòng, và rule `メイン担当者` không xoá được (AC-08) → dùng Decision Table theo 区分 × hành động.
  - Nút `次へ` disabled cho tới khi toàn bộ mục bắt buộc hợp lệ (AC-07) → TC kiểm tra trạng thái nút sau mỗi lần điền thiếu 1 field.
  - Text/textarea phải có TC security (XSS, SQL injection).
- **UI chung:** 1 cột, 2 khối xếp dọc (基本情報 / 担当者 dạng bảng động), footer 2 nút `キャンセル` · `次へ`.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `委託配送先名` (A.1.1) | Textbox | High | BVA (1 / 50 / 51) + Security | **Blur → tự sinh `カナ`** |
| `カナ` (A.1.2) | Textbox | Medium | EP (全角カナ / 半角カナ) | Nhận giá trị tự sinh từ A.1.1, sửa tay được |
| `郵便番号` (A.1.4) | Textbox | High | BVA (6 / 7 / 8 số) + EP (tồn tại / không tồn tại) | **Blur 7 số → tự điền A.1.8 / A.1.9 / A.1.10** |
| Nút `住所検索` (A.1.6) | Button | Medium | — | Chỉ bật sau khi có mã bưu điện; làm cùng việc với blur A.1.4 |
| `都道府県` (A.1.8) | Dropdown | Medium | — | Nhận giá trị tự điền, sửa tay được |
| `市区町村` (A.1.9) | Textbox | Medium | BVA (1 / 255 / 256) | Nhận giá trị tự điền |
| `町域・番地` (A.1.10) | Textbox | Medium | BVA (1 / 255 / 256) | Nhận giá trị tự điền |
| `建物・部屋番号` (A.1.11) | Textbox | Low | BVA (0 / 255 / 256) | — |
| `電話番号` (A.1.12) | Phone | High | BVA (9 / 10 / 11 / 12) + EP (có gạch ngang) | — |
| `FAX番号` (A.1.13) | Phone | Low | EP (để trống = hợp lệ) | Chỉ validate khi có nhập |
| `区分` (A.2.1) | Dropdown | High | Decision Table (メイン × サブ × hành động xoá) | **Quyết định dòng có xoá được không (AC-08)** |
| `担当者名` (A.2.2) | Textbox | Medium | BVA (1 / 50 / 51) + Security | **Blur → tự sinh `フリガナ`** |
| `フリガナ` (A.2.3) | Textbox | Low | EP (全角カナ) | Nhận giá trị tự sinh từ A.2.2 |
| `メールアドレス` (A.2.4) | Email | High | EP (format) + unique check server-side | Check trùng giữa các bản ghi 担当者 hợp lệ |
| `TEL` (A.2.5) | Phone | Medium | BVA (10 / 11) | — |
| Nút xoá dòng (A.2.6) | Button | High | Decision Table | **Phụ thuộc `区分`** — メイン không xoá được |
| Nút `行を追加` (A.2.7) | Button | Medium | — | Dòng mới có `区分` chưa chọn |
| Nút `キャンセル` (I.1) | Button | Low | — | Hiện dialog xác nhận |
| Nút `次へ` (I.2) | Button | High | Decision Table (đủ / thiếu từng mục bắt buộc) | **Phụ thuộc toàn bộ field bắt buộc** |

---

## OW_AUTH_004 — 申し込むフォーム 2/2 (配送対応情報)

- **Archetype:** Form Create (multi-step, bước 2/2)
- **Chiến lược Test Case:**
  - Trọng tâm là **cây 対応エリア 3 tầng** (8 vùng × 47 tỉnh) — logic tick cha/con + trạng thái indeterminate `－` (AC-09) là chỗ dễ sai nhất → dựng Decision Table theo 4 tổ hợp Figma mô tả.
  - Đồng bộ 2 chiều tag ↔ cây: bấm `×` trên tag phải bỏ tick tỉnh tương ứng → TC cho cả 2 chiều, không chỉ 1 chiều.
  - Nút `登録` có **6 điều kiện** đồng thời (AC-10) → Decision Table, mỗi điều kiện thiếu 1 cái = 1 TC.
  - `契約書に同意します。` là gate cuối — TC riêng cho trạng thái chưa tick.
  - 2 textarea ghi chú cần TC security + BVA 500 ký tự. Message quá 500 ký tự hiện đang là **tiếng Việt** trong Figma → tag `[UNCONFIRMED]` (AMB-08).
- **UI chung:** 1 cột, 3 khối (対応エリア / 車両・設備情報 / 同意), footer `キャンセル` · `登録`.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| `対応エリア` (B.1.1) | Dropdown đa cấp (tree + tag) | High | Decision Table (4 tổ hợp tick cha/con) | **Đồng bộ 2 chiều với vùng tag phía trên** |
| `配送不可曜日` (B.1.2) | Checkbox group | Low | — | 8 lựa chọn cố định (T2–CN + 祝日) |
| `対応エリアに関する備考` (B.1.3) | Textarea | Medium | BVA (500 / 501) + Security | Message lỗi đang là tiếng Việt → `[UNCONFIRMED]` |
| `保有車両` (B.2.1) | Multi-select (tag) | High | EP (0 / 1 / nhiều) | — |
| `冷凍ボックスのレンタル希望` (B.2.2) | Radio | Medium | — | — |
| `冷蔵ボックスのレンタル希望` (B.2.3) | Radio | Medium | — | — |
| `冷蔵保管スペース` (B.2.4) | Radio | Medium | — | — |
| `車両・設備情報に関する備考` (B.2.5) | Textarea | Low | BVA (500 / 501) + Security | — |
| `契約書に同意します。` (B.3) | Checkbox | High | — | **Gate cuối của nút `登録`**; cách xem hợp đồng chưa chốt → `[UNCONFIRMED]` (AMB-02) |
| Nút `キャンセル` (I.1) | Button | Low | — | Dialog xác nhận |
| Nút `登録` (I.3) | Button | High | Decision Table (6 điều kiện) | **Phụ thuộc B.1.1 · B.2.1 · B.2.2 · B.2.3 · B.2.4 · B.3** |

---

## OW_AUTH_005 — 申し込み完了

- **Archetype:** Detail (màn tĩnh xác nhận)
- **Chiến lược Test Case:**
  - Màn này **chưa có frame Figma** — nội dung theo quyết định ngày 22/09 (AMB-01). Toàn bộ TC tag `[UNCONFIRMED]` về mặt layout, nhưng logic điều hướng và trạng thái hồ sơ thì đã chốt nên test được.
  - Điểm test giá trị nhất không nằm ở màn này mà ở **hệ quả**: hồ sơ phải ở trạng thái `仮登録` và đăng nhập bằng tài khoản đó phải ra message `「お申し込みは審査中です。」` → TC liên màn với `OW_AUTH_001`.
  - Test F5 / vào bằng URL trực tiếp (không qua submit) để tránh lộ màn xác nhận giả.
- **UI chung:** 1 cột, card căn giữa: icon trạng thái + thông điệp + 1 nút về đăng nhập.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Thông điệp xác nhận | Text (read-only) | Medium | — | Layout `[UNCONFIRMED]` — chưa có frame |
| Nút `ログイン画面へ` | Button | Medium | — | → `OW_AUTH_001` |
| Trạng thái hồ sơ sau submit | Behavior (liên màn) | High | State Transition (`仮登録` → `有効`) | **Phụ thuộc `OW_AUTH_004` I.3 + `OW_AUTH_001`** |

---

## OW_HOME_001 — ホーム

- **Archetype:** Dashboard (3 khối độc lập)
- **Chiến lược Test Case:**
  - 3 khối tải độc lập → test riêng từng khối, và test tổ hợp khi 1 khối lỗi / rỗng mà 2 khối kia vẫn phải hiển thị bình thường.
  - Lịch tháng là khối rủi ro cao nhất: phân tuần A/B/C/D đúng màu (AC-17), badge `⚠N件` đúng số (AC-16), **chỉ 1 ô** có viền hôm nay (AC-15) → TC đếm, không chỉ TC nhìn.
  - Click ô lịch phải sang **lịch TUẦN** chứa ngày đó (AC-18) — dễ bị làm nhầm sang lịch tháng.
  - Khối お知らせ: thứ tự mới→cũ + thời gian tương đối `今日` / `昨日` (AC-19) → cần test data có mốc hôm nay, hôm qua, và cũ hơn.
  - 2 link của khối 見積 trỏ ra ngoài scope → TC tag `[UNCONFIRMED]` (AMB-07).
  - Empty state cả 3 khối chưa thiết kế → TC tag `[UNCONFIRMED]` (AMB-05).
- **UI chung:** Sidebar trái 210px + vùng nội dung 2 cột (calendar-card ~740px bên trái; 2 card お知らせ + 見積 xếp dọc bên phải).

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Sidebar 7 mục | Navigation | Medium | — | Dùng chung mọi màn sau đăng nhập |
| Lịch tháng (A) | Calendar grid | High | — | — |
| Nhãn + màu phân tuần (A.1) | Badge | Medium | Decision Table (A/B/C/D/tháng khác) | — |
| Số đơn `配送: xxx件` (A.2) | Text | Medium | — | Chỉ hiện ở ngày có lịch giao |
| Nhãn trạng thái đặc biệt (A.3) | Label | Medium | EP (臨時休業 / 休 / 未設定) | — |
| Badge cảnh báo `⚠N件` (A.4) | Badge | High | BVA (0 / 1 / nhiều đơn chưa gán) | Cùng component với 凡例 «chưa gán tài xế» |
| Viền ngày hôm nay (A.5) | Visual marker | High | — | **Phải duy nhất 1 ô toàn lịch** |
| Marker ngày lễ/nghỉ (A.6) | Visual marker | Low | — | — |
| Ô lịch (click) (A.7) | Click area | High | — | → `OW_SCHD_002` tuần chứa ngày đó |
| Link `スケジュールへ` (A.8) | Link | Medium | — | → `OW_SCHD_001` |
| Danh sách お知らせ (B) | List (scroll) | Medium | — | Sắp xếp mới → cũ |
| Thời gian tương đối (B.1) | Text | Medium | BVA (hôm nay / hôm qua / cũ hơn) | — |
| Badge phân loại (B.2) | Badge | Low | — | Loại `メンテナンス` → `[UNCONFIRMED]` (AMB-06) |
| Link tiêu đề お知らせ (B.3) | Link | Medium | — | → `OW_ANNO_002` |
| Danh sách 見積 chưa phản hồi (C) | List (scroll) | Low | — | — |
| Badge `未回答` (C.1) | Badge | Low | — | — |
| Link tiêu đề yêu cầu (C.2) | Link | Low | — | Đích ngoài scope → `[UNCONFIRMED]` (AMB-07) |
| `依頼日 / 回答期限` (C.3) | Text | Low | — | — |
| Link `見積もり一覧へ` (C.4) | Link | Low | — | Đích ngoài scope → `[UNCONFIRMED]` (AMB-07) |

---

## OW_ANNO_002 — お知らせ詳細

- **Archetype:** Detail (read-only)
- **Chiến lược Test Case:**
  - Màn đơn giản nhất module — trọng tâm là **render rich text** (`■` tiêu đề phụ, `・` danh sách, chữ đậm) và định dạng ngày `yyyy年M月d日 HH:mm`.
  - Badge phân loại dùng **chung master** với `OW_HOME_001` B.2 → TC đối chiếu 2 màn phải cùng nhãn cùng màu cho cùng 1 thông báo.
  - Test nội dung dài bất thường (không xuống dòng, nhiều ký tự) để bắt lỗi vỡ layout.
  - Trường hợp thông báo bị E03 xoá khi đang xem → `[UNCONFIRMED]` (AMB-05).
- **UI chung:** Sidebar + 1 cột nội dung, card trắng: badge → ngày giờ → tiêu đề → rich text → link quay lại.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Badge phân loại | Badge | Medium | — | **Dùng chung master với `OW_HOME_001` B.2** |
| Ngày giờ đăng | Text | Low | — | Định dạng `yyyy年M月d日 HH:mm` |
| Tiêu đề | Text | Low | BVA (tiêu đề rất dài) | — |
| Nội dung rich text | Rich text | Medium | — | Hỗ trợ `■` · `・` · chữ đậm |
| Link `一覧に戻る` | Link | Medium | — | → `OW_HOME_001` |

---

## OW_SCHD_001 — スケジュール（月表示）

- **Archetype:** List/Search (dạng lịch) + Filter
- **Chiến lược Test Case:**
  - Bộ lọc **2 tầng**: 2 ô tìm kiếm cơ bản luôn hiện + 6 điều kiện chỉ hiện khi mở accordion → TC phải verify điều kiện ẩn có thực sự được áp khi thu gọn accordion lại.
  - Mỗi dropdown lọc có tập giá trị cố định lấy từ bảng Figma → test từng giá trị, không gộp.
  - Điều hướng thời gian có 4 cách (`月/週` toggle · date picker · `＜ ＞` · `今日`) → mỗi cách 1 TC, và TC kết hợp (chọn tháng xa rồi bấm `今日`).
  - Badge số lượng theo 温度帯 (AC-20) và badge `⚠未N件` cần test data có đủ 3 loại nhiệt độ + ngày có/không có đơn chưa gán.
  - 凡例 phải liệt kê đủ 7 nhóm ký hiệu → 1 TC đối chiếu 凡例 với ký hiệu thực tế trên lịch.
- **UI chung:** Sidebar + header điều khiển (toggle 月/週 · date picker · `＜ ＞` · `今日`) → thanh tìm kiếm 2 tầng → lưới lịch tháng → 凡例.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Toggle `月 / 週` (S.1) | Button (toggle) | High | State Transition | ⇄ `OW_SCHD_002`, giữ điều kiện lọc |
| Date picker `対象年月` (S.2) | Date picker | Medium | BVA (tháng đầu/cuối năm) | Định dạng `yyyy-mm` |
| Nút `＜` / `＞` (S.3) | Button | Medium | BVA (qua mốc tháng 1 / tháng 12) | — |
| Nút `今日` (S.4) | Button | Medium | — | Về tháng chứa ngày hệ thống |
| Tìm kiếm 法人/拠点 (S.5) | Textbox | Medium | EP (khớp gần đúng) + Security | — |
| Tìm kiếm địa chỉ/SĐT (S.6) | Textbox | Medium | EP (khớp gần đúng) + Security | — |
| Accordion `⌄ / ⌃` (S.7 / S.14) | Button (accordion) | High | State Transition | **Ẩn/hiện S.8–S.13; verify điều kiện ẩn vẫn được áp** |
| `荷物温度帯` (S.8) | Dropdown | Medium | — | 3 giá trị |
| `配送状況` (S.9) | Dropdown | Medium | — | 5 giá trị |
| `自販機` (S.10) | Dropdown | Low | — | 2 giá trị |
| `配送方法` (S.11) | Dropdown | Low | — | `ES配送` / `COOL便` |
| `配送元` (S.12) | Textbox | Low | EP (khớp gần đúng) | — |
| 送り状/スタッフ (S.13) | Textbox | Medium | EP (khớp gần đúng) | — |
| Nút `検索` (S.15) | Button | High | — | **Phụ thuộc toàn bộ S.5–S.13** |
| Badge số theo 温度帯 (C.1) | Badge | High | — | Cần test data đủ 3 loại |
| Badge `⚠未N件` (C.2) | Badge | High | BVA (0 / 1 / nhiều) | Cùng quy tắc với `OW_HOME_001` A.4 |
| Viền ngày hôm nay (C.3) | Visual marker | Medium | — | Duy nhất 1 ô |
| Ô lịch (click) (C.4) | Click area | High | — | → `OW_SCHD_002` |
| 凡例 (D) | Legend | Medium | — | Phải khớp ký hiệu thực tế trên lịch |

---

## OW_SCHD_002 — スケジュール（週表示）

- **Archetype:** List/Search (dạng lịch tuần)
- **Chiến lược Test Case:**
  - Cấu trúc 7 cột cố định T2→CN → test tuần có ngày lễ, tuần giao thoa 2 tháng, tuần không có đơn nào.
  - Mỗi ô ngày là **danh sách cuộn độc lập** → test cuộn trong ô, và test ngày có rất nhiều điểm giao (rủi ro hiệu năng đã nêu ở UX Review — chưa có giới hạn số dòng, AMB-19 bên module B).
  - Tên điểm giao vượt khung phải rút gọn `...` + tooltip khi hover (AC-22) → TC với tên rất dài.
  - Giữ điều kiện lọc khi toggle từ `月` sang `週` — TC liên màn.
- **UI chung:** Giữ nguyên header điều khiển + thanh tìm kiếm của `OW_SCHD_001`; thân là 7 cột T2→CN, mỗi cột là danh sách cuộn.

| Component | Component Type | Risk Level | Technique Flag | Ghi chú phụ thuộc |
|---|---|---|---|---|
| Lưới 7 cột T2→CN (W) | Calendar grid | Medium | BVA (tuần giao 2 tháng) | — |
| Danh sách giao hàng/ngày (W.1) | List (scroll) | High | BVA (0 / 1 / rất nhiều dòng) | Ngày không có lịch giao → ô trống |
| Icon 温度帯 trong dòng (W.2) | Icon | Medium | — | Cùng định nghĩa với 凡例 màn tháng |
| Tên điểm giao (W.3) | Text + Tooltip | Medium | BVA (tên rất dài) | Rút gọn `...` + tooltip khi hover |
| Dòng đơn (click) (W.4) | Click area | High | — | → `OW_DLVR_002` (module delivery-ops) |
| Toggle `月` | Button (toggle) | High | State Transition | ⇄ `OW_SCHD_001`, **giữ điều kiện lọc** |

---

## Ghi chú tổng quát

- **Assumption môi trường test:**
  - Mail service hoạt động thật khi test OTP (`OW_AUTH_002`) — nếu bị mock, TC countdown + TTL 5 phút không phản ánh đúng hành vi production.
  - 郵便番号 lookup API available lúc test — cần chuẩn bị sẵn ít nhất 1 mã bưu điện **tồn tại** và 1 mã **không tồn tại** để test AC-04 / AC-05.
  - Dữ liệu lịch giao hàng phải được seed sẵn với đủ: 3 loại 温度帯, ngày có đơn chưa gán tài xế, ngày `臨時休業`, ngày lễ, và ít nhất 1 tuần rỗng.
  - Cần ít nhất 4 tài khoản test: `有効` · `仮登録` (chưa duyệt) · sai mật khẩu để test lặp 10 lần · tài khoản dùng cho luồng reset mật khẩu (có email thật nhận được mã).
- **Bị chặn bởi ambiguity còn TBD (Medium/Low → tag `[UNCONFIRMED]`, không dừng):** AMB-02 · AMB-03 · AMB-04 · AMB-05 · AMB-06 · AMB-07 · AMB-08 · AMB-09.
- **Thứ tự thực thi đề nghị:** `OW_AUTH_001` → `OW_AUTH_003` → `OW_AUTH_004` → `OW_AUTH_005` → `OW_AUTH_002` → `OW_HOME_001` → `OW_ANNO_002` → `OW_SCHD_001` → `OW_SCHD_002`.
