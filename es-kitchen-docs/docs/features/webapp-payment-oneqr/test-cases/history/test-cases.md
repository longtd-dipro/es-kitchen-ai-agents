# Test Cases — Purchase History & Refund | webapp-payment-oneqr

> **Feature:** webapp-payment-oneqr (E07 Web Payment One QR)
> **Module:** Purchase History & Refund — History list, History detail, Refund flow
> **AC cover:** AC-15, AC-16, AC-17
> **Mode:** QUICK
> **Actor:** End User (Guest)
> **Ngày:** 2026-09-10
> **Figma:** Refined 2026-09-10 — cross-ref từ Figma ES-QR. **⚠️ Refund form structure Figma vs SPEC khác biệt lớn** (xem observations).

**Figma UI baseline:**

*`WP_HIST_001` — Purchase History List (node `27460:59099`, `[UA_MYPG_003]`):*
- Header 200px yellow `#fee28a`: filter icon + title "**購入履歴**" center + empty slot.
- Body: list history card rows (border-bottom divider/low), mỗi row `px-16 py-12`:
  - Date "**2026/1/18 12:10**" (14px Medium) + **status tag** (right of date)
  - Purchase info: "**購入個数：N**" và "**合計金額：XXX円**" (14px Medium)
  - Link "**詳細へ**" (14px Regular, **màu xanh `#096cdc`** ring/normal) ở phải row
- **Status tag variants** (12px Bold, tracking 0.6px, rounded-4px):
  - `**支払い未完了**` — bg yellow `#eab308` warning/500, text white
  - `**支払い完了**` — bg green `#1a7f37` success/500, text white
  - `**返金待ち**` — bg light blue `#e5f6ff` company/50, **text blue `#0969da`** company/500
  - `**支払いキャンセル**` — bg red `#cf222e` negative/500, text white
  - `**返金完了**` — bg blue `#0969da` info/500, text white
- **Pending row (waiting) đặc biệt**: bg **pink `#fff6f5`** (negative/50) và có **countdown deadline** ở bottom row: clock icon + "**支払い期限 残り 05:59:59**" (14px Medium **màu đỏ**) + note gray "※期限を過ぎると自動キャンセルされます。".

*`WP_HIST_002` — Purchase History Details (node `27460:59412`, `[UA_MYPG_004]`):*
- Header: title "**購入履歴詳細**".
- Body sections (mỗi section border-b divider):
  - "**注文情報**" (16px Medium): 注文日時 / 注文番号 (14px, right-aligned value 023489237567)
  - "**商品リスト**" + status tag (right): product rows với thumbnail 48px + qty (1点) + name (14px Regular) + price red 100円
  - "**支払い詳細**": 合計金額（N製品）: XXX円 (14px Medium red)
  - **Deadline Alert Box** (chỉ khi pending): bg admin/50 `#fff9eb`, border admin/100, clock icon + "**支払い期限 残り 05:59:59**" (text yellow app/700-800) + note gray
  - **Payment Method Section**: label "支払い方法" + row (logo + method name + caret-right) → tap để đổi method
- Footer (chỉ khi pending): 2 buttons "支払いキャンセル" (outline 48px) + "再試行" (yellow gradient 48px).

*`WP_REFUND_001` — Purchase History Details (SPEC map sai — node `27460:58303`):*
- **⚠️ Node này KHÔNG phải Refund form** — Figma là Purchase History Detail state "**支払い完了**" (green tag).
- Sections: 注文情報, 商品リスト với tag green, 支払い詳細, **その他** section chứa row "**返金**" (money icon) + link **"返金へ"** (14px Regular, blue `#096cdc`) → tap dẫn đến refund form.
- Footer text (14px Regular): "【自動返金】購入から30分以内のみ受付", "【30分経過後・商品不良】\n　自社の担当者へお問い合わせください。"
- **True refund form** = embedded component `Refund` (node `28522:242732`) trong WP_REFUND_002 — Figma tách flow như modal-over-form.

*Refund form (`Refund` component, node `28522:242732` bên trong REFUND_002/003):*
- Header title "**返金理由**".
- Body: label "**返金理由を選択してください**" + red asterisk "*" (required).
- **Radio list với 2 options** (KHÔNG phải textarea như SPEC):
  1. "**注文が重複している**"
  2. "**注文を間違えた**"
- Note text (14px Regular): "※上記以外の場合は、自社の担当者へお問い合わせください。", "※返金処理の時間は、決済会社によって異なる場合があります。", "※不正防止のため、返金履歴は管理者側で確認しております。"
- **Submit button KHÔNG visible trong Figma base layer** — có thể trigger implicit khi tap radio + confirm popup, hoặc Designer missing.

*`WP_REFUND_002` — Refund success modal (node `28522:242791`):*
- Base: refund form (2 radio).
- Overlay: bg dim `rgba(50,56,63,0.7)` + center popup (border 4px yellow `#fac215`, rounded-20px, w-343px).
- Popup content:
  - **Success circle** 135px bg green tint `#c5f7d0` + ✓ check icon (77px)
  - Text (16px Medium center): "**返金リクエストを受け付けました。**\n返金の反映時間は、決済サービスの規定によって異なります。"
  - CTA: "**購入履歴詳細に戻る**" (yellow gradient 52px full-width).

*`WP_REFUND_003` — Refund failed modal (node `28522:242907`):*
- Base: Purchase History Detail (successful state).
- Overlay: same modal styling as success.
- Popup content:
  - **Warning circle** 100px bg red tint `#ffe5e4` + exclamation icon
  - Text: "**商品は購入完了から30分以内にのみ返金されます。**" (16px Medium 1 dòng)
  - CTA: "**購入履歴詳細に戻る**" (yellow gradient).

---

## Test Cases

| TC ID | Tiêu đề | Preconditions | Steps | Expected Result | Priority | Screen Code |
|---|---|---|---|---|---|---|
| TC_WP_HIS_001 | History list — hiển thị danh sách order với status tag đúng | Guest session hợp lệ. User đã có 3 orders: `ORD001` (10 phút trước, `支払い完了`), `ORD002` (1 ngày trước, `支払い完了`), `ORD003` (2 ngày trước, `支払いキャンセル`). | 1. Vào `/history` | - Header "**購入履歴**" center<br>- 3 rows sort mới nhất trên đầu: ORD001 → ORD002 → ORD003<br>- Mỗi row: date "2026/XX/XX HH:MM" + status tag đúng màu + 購入個数 + 合計金額 + link "**詳細へ**" blue phải<br>- `ORD001`, `ORD002`: tag "**支払い完了**" green `#1a7f37`<br>- `ORD003`: tag "**支払いキャンセル**" red `#cf222e`<br>- Divider low giữa các row | Critical | `WP_HIST_001` |
| TC_WP_HIS_002 | History list — sort mới nhất trên đầu | Guest session hợp lệ. 5 orders ở các thời điểm khác nhau. | 1. Vào `/history` | - Order mới nhất luôn ở đầu<br>- Thứ tự giảm dần theo purchase timestamp<br>- Không cần pagination (Figma không show) — infinite scroll hoặc load-all | High | `WP_HIST_001` |
| TC_WP_HIS_003 | History list — empty state chưa có order | Guest session mới (không có order nào). | 1. Vào `/history` | - Header "購入履歴" vẫn hiển thị<br>- Body: empty state message (VD "購入履歴がありません")<br>- CTA về Home hoặc menu<br>- **⚠️ Figma không có empty state — Designer cần thêm** | High | `WP_HIST_001` |
| TC_WP_HIS_004 | History list — pending order có countdown deadline | Guest session hợp lệ. Order `ORD_PENDING` status = 支払い未完了, mua 10 phút trước. | 1. Vào `/history` | - Row `ORD_PENDING` bg **pink `#fff6f5`** (khác với các row khác bg trắng)<br>- Tag "**支払い未完了**" yellow warning/500<br>- Bottom row: clock icon + "**支払い期限 残り HH:MM:SS**" (14px Medium **màu đỏ `#cf222e`**)<br>- Countdown live update<br>- Note gray "※期限を過ぎると自動キャンセルされます。" | High | `WP_HIST_001` |
| TC_WP_HIS_005 | History list — note cross-browser limitation | Guest session hợp lệ. User đang dùng Chrome trên thiết bị đã mua bằng Safari. | 1. Vào `/history` từ Chrome | - History trống<br>- Hiển thị UI note tiếng Nhật giải thích limitation<br>- **⚠️ Figma không show note element** — Designer cần thêm (recommend static text ở top hoặc trong empty state) | Medium | `WP_HIST_001` |
| TC_WP_HIS_006 | History list — tag variants đầy đủ | Guest session hợp lệ. User có 5 orders cover đủ 5 status. | 1. Vào `/history` | - Tag "**支払い完了**" green `#1a7f37`<br>- Tag "**支払い未完了**" yellow `#eab308`<br>- Tag "**返金待ち**" light blue bg + text blue `#0969da`<br>- Tag "**支払いキャンセル**" red `#cf222e`<br>- Tag "**返金完了**" blue `#0969da`<br>- Không có tag khác | High | `WP_HIST_001` |
| TC_WP_HIS_007 | History detail — happy path (完了 order) | Guest session hợp lệ. Order `ORD001` status=支払い完了, có 2 items: "一度食べたらもうたま卵" qty=1 100円, "シェフの作ったビーフカレー" qty=1 100円. | 1. Vào `/history`<br>2. Tap link "**詳細へ**" ở row `ORD001` | - Navigate `/history/ORD001`<br>- Header "**購入履歴詳細**"<br>- Section "**注文情報**": 注文日時 + 注文番号 (right-aligned)<br>- Section "**商品リスト**" với tag "**支払い完了**" (green) bên phải<br>- Product rows: thumbnail 48px + qty "1点" + name + price **100円 red**<br>- Section "**支払い詳細**": 合計金額（2製品）: **200円** (14px Medium red)<br>- Section "**その他**": row 返金 icon + link "**返金へ**" (blue) | Critical | `WP_HIST_002`, `WP_REFUND_001` |
| TC_WP_HIS_008 | History detail — pending order (未完了) | Guest session hợp lệ. Order `ORD_PEND` status = 支払い未完了 (payment không complete). | 1. Vào `/history`<br>2. Tap row `ORD_PEND` | - Header "購入履歴詳細"<br>- Sections đầu tương tự<br>- Tag ở "商品リスト": "**支払い未完了**" yellow<br>- **Deadline Alert Box** hiển thị (bg yellow tint `#fff9eb`, clock icon + "**支払い期限 残り 05:59:59**" text yellow)<br>- **Payment Method Section**: logo + method name (VD メルペイ) + caret-right<br>- Footer: 2 buttons "**支払いキャンセル**" (outline) + "**再試行**" (yellow gradient) | Critical | `WP_HIST_002` |
| TC_WP_HIS_009 | History detail — link "返金へ" trong 30 phút, status 支払い完了 | Guest session hợp lệ. Order `ORD001` status=支払い完了, mua 10 phút trước. | 1. Vào `/history/ORD001` | - Section "**その他**" xuất hiện với row "返金" (money icon) + link "**返金へ**" (14px, blue `#096cdc`)<br>- Footer note tiếng Nhật: "【自動返金】購入から30分以内のみ受付", "【30分経過後・商品不良】　自社の担当者へお問い合わせください。" | Critical | `WP_REFUND_001` |
| TC_WP_HIS_010 | History detail — link "返金へ" ẩn khi quá 30 phút | Guest session hợp lệ. Order `ORD002` status=支払い完了, mua 31 phút trước. | 1. Vào `/history/ORD002` | - Section "その他" hiển thị nhưng **link "返金へ" ẩn** (hoặc row "返金" không hiện)<br>- Vẫn thấy footer note<br>- Không có CTA nào dẫn đến refund form | Critical | `WP_HIST_002` |
| TC_WP_HIS_011 | History detail — link "返金へ" ẩn khi status không phải 支払い完了 | Guest session hợp lệ. Order `ORD003` status=支払いキャンセル (trong 30 phút). | 1. Vào `/history/ORD003` | - Tag hiển thị "**支払いキャンセル**" red<br>- Section "その他" KHÔNG hiển thị link "返金へ" (không phải 支払い完了)<br>- Không có CTA refund | High | `WP_HIST_002` |
| TC_WP_HIS_012 | History detail — link "返金へ" ẩn khi đã có refund pending | Guest session hợp lệ. Order `ORD001` trong 30 phút, đã submit refund (status: 返金待ち). | 1. Vào `/history/ORD001` | - Tag "**返金待ち**" (blue bg light + text blue)<br>- Section "その他" không có link "返金へ" hoặc link disabled<br>- Không thể click đi refund lần 2 | High | `WP_HIST_002` |
| TC_WP_HIS_013 | Boundary — 30 phút chính xác | Guest session hợp lệ. Order mua đúng 30 phút trước (edge case). | 1. Vào detail page ngay ở mốc 30:00 | - Link "返金へ" vẫn hiển thị (boundary inclusive) HOẶC ẩn (strict < 30) — **cần confirm với Dev + SPEC**<br>- Note dưới footer clarify "購入から30分以内のみ受付" | High | `WP_HIST_002` |
| TC_WP_HIS_014 | Refund form — hiển thị radio 2 options (KHÔNG textarea) | Guest session hợp lệ. Đang ở `/history/ORD001/refund`. | 1. Tap "返金へ" từ history detail<br>2. Navigate `/history/ORD001/refund` | - Header title "**返金理由**"<br>- Label "**返金理由を選択してください**" + red asterisk "**\***" (required)<br>- **Radio list 2 options**:<br>  1. "**注文が重複している**"<br>  2. "**注文を間違えた**"<br>- Note text (14px Regular): "※上記以外の場合は、自社の担当者へお問い合わせください。", "※返金処理の時間は、決済会社によって異なる場合があります。", "※不正防止のため、返金履歴は管理者側で確認しております。"<br>- **⚠️ MAJOR: SPEC AC-17 yêu cầu textarea max 500 chars — Figma là radio-select. BA cần quyết định pattern.** | Critical | `WP_REFUND_001` |
| TC_WP_HIS_015 | Refund form — submit success → modal thành công | Guest session hợp lệ. Đang ở refund form. | 1. Chọn radio "**注文を間違えた**"<br>2. Tap submit (Figma chưa show button; assume implicit submit hoặc auto trigger) | - POST `/api/v1/user/refund` với reason payload<br>- Modal success xuất hiện (WP_REFUND_002):<br>  - Overlay dim `rgba(50,56,63,0.7)`<br>  - Popup border 4px yellow, rounded-20px, w-343px<br>  - Success circle 135px green tint + ✓ check<br>  - Text center: "**返金リクエストを受け付けました。**\n返金の反映時間は、決済サービスの規定によって異なります。"<br>  - CTA "**購入履歴詳細に戻る**" (yellow gradient) | Critical | `WP_REFUND_001`, `WP_REFUND_002` |
| TC_WP_HIS_016 | Refund form — chưa chọn radio, submit không hoạt động | Guest session hợp lệ. Đang ở refund form, chưa chọn radio nào. | 1. Cố gắng submit khi chưa chọn | - Submit không trigger (nếu có button, disabled)<br>- Hiển thị validation error inline<br>- **⚠️ Behavior TBD — Figma không có submit button visible** | High | `WP_REFUND_001` |
| TC_WP_HIS_017 | Refund form — max 500 ký tự (SPEC textarea) | Guest session hợp lệ. Đang ở refund form. | 1. **⚠️ Không applicable với Figma design hiện tại (radio)** — TC giữ để tracking SPEC vs Figma diff | - Nếu Dev implement theo Figma (radio): TC không apply, note "N/A - Figma là radio-select"<br>- Nếu Dev implement theo SPEC (textarea): counter chars, giới hạn 500 | Medium | `WP_REFUND_001` |
| TC_WP_HIS_018 | Refund form — BE error → modal failed | Guest session hợp lệ. BE trả lỗi khi submit refund (VD đã quá 30 phút server-side race condition). | 1. Chọn radio<br>2. Submit → BE trả 400/409 | - Modal failed hiển thị (WP_REFUND_003):<br>  - Overlay dim<br>  - Popup border 4px yellow<br>  - Warning circle 100px red tint + exclamation icon<br>  - Text: "**商品は購入完了から30分以内にのみ返金されます。**"<br>  - CTA "**購入履歴詳細に戻る**" (yellow gradient)<br>- Tap CTA → về history detail<br>- User có thể thử lại (nếu vẫn trong 30 phút) hoặc contact admin | High | `WP_REFUND_001`, `WP_REFUND_003` |
| TC_WP_HIS_019 | Refund form — XSS/sanitize (nếu textarea) | Guest session hợp lệ. | 1. **⚠️ Không applicable Figma (radio)** — TC giữ để tracking | - Nếu Dev implement textarea: sanitize input, escape script tags<br>- Nếu Dev implement radio: TC N/A (radio value là preset enum) | Medium (skip nếu radio) | `WP_REFUND_001` |
| TC_WP_HIS_020 | History detail — order không tồn tại | Guest session hợp lệ. | 1. Navigate trực tiếp `/history/NOTEXIST` | - Hiển thị thông báo lỗi (VD "注文が見つかりません")<br>- CTA về `/history` hoặc Home<br>- Không crash | Medium | (error state) |
| TC_WP_HIS_021 | Refund — sau khi submit success, không thể refund lại | Guest session hợp lệ. Order `ORD001` đã có refund success (返金完了). | 1. Navigate `/history/ORD001` | - Tag hiển thị "**返金完了**" blue `#0969da`<br>- Section "その他" không có link "返金へ"<br>- Không thể truy cập `/history/ORD001/refund` (404 hoặc redirect) | High | `WP_HIST_002` |

---

## Traceability — AC → TC

| AC ID | TC IDs cover |
|---|---|
| AC-15 | TC_WP_HIS_001, TC_WP_HIS_002, TC_WP_HIS_003, TC_WP_HIS_004, TC_WP_HIS_005, TC_WP_HIS_006 |
| AC-16 | TC_WP_HIS_007, TC_WP_HIS_008, TC_WP_HIS_009, TC_WP_HIS_010, TC_WP_HIS_011, TC_WP_HIS_012, TC_WP_HIS_013, TC_WP_HIS_020, TC_WP_HIS_021 |
| AC-17 | TC_WP_HIS_014, TC_WP_HIS_015, TC_WP_HIS_016, TC_WP_HIS_017, TC_WP_HIS_018, TC_WP_HIS_019 |

---

## Figma observations (🔴 CRITICAL — nhiều discrepancy giữa SPEC và Figma)

- **🔴 Refund reason: RADIO vs TEXTAREA:** SPEC AC-17 yêu cầu textarea free-text max 500 chars, Figma là radio với chỉ 2 preset options ("注文が重複している" / "注文を間違えた"). **MAJOR design intent gap** — BA cần quyết định: (a) giữ textarea (như SPEC — Designer update Figma) hay (b) giữ radio 2 options (như Figma — SPEC AC-17 update).
- **🔴 History list — 5 status tags thay vì 2:** SPEC AC-15 chỉ nói "決済完了 / 決済失敗" — Figma có 5 states: 支払い完了, 支払い未完了, 返金待ち, 支払いキャンセル, 返金完了. SPEC cần expand để cover full lifecycle.
- **🔴 Pending row 6h countdown:** Figma pending row có bg pink + countdown deadline (align với WP_PAY_004). SPEC AC-14 nói poll 60s max — mâu thuẫn với 6h deadline pattern. Cần BA reconcile.
- **🔴 Empty state missing in Figma:** WP_HIST_001 Figma chỉ show có data. Designer cần thêm empty state cho new user chưa có order.
- **🔴 Cross-browser note missing:** SPEC AC-20 nói show UI note về cross-browser limitation trong /history — Figma không có element này. Designer cần thêm.
- **🔴 WP_REFUND_001 mapping sai:** SPEC gán `27460:58303` cho refund form, nhưng Figma node đó là **Purchase History Detail (状态 支払い完了)** với entry point "返金へ" link. Real refund form là embedded component trong REFUND_002/003.
- **🟡 Submit button trong refund form không visible:** Figma refund form không có visible submit button. Có thể implicit submit khi tap radio, hoặc Designer miss. Cần verify.
- **🟡 Refund modal wording:**
  - Success: "**返金リクエストを受け付けました。**" — SPEC không quote text cụ thể
  - Failed: "**商品は購入完了から30分以内にのみ返金されます。**" — SPEC không quote, và chỉ 1 error type (30-min timeout); các error khác (network, BE 500) chưa có UI variant
- **🟡 Frame 390px iPhone shell:** Toàn bộ dùng mobile `[UA_MYPG_*]` frames. E07 SPEC 9 yêu cầu `max-w-3xl` desktop responsive.
- **🟢 Design system consistency:** Yellow gradient CTA + card border 4px yellow modal pattern nhất quán với các module khác.
