# Test Cases — Payment | webapp-payment-oneqr

> **Feature:** webapp-payment-oneqr (E07 Web Payment One QR)
> **Module:** Payment — Method selection, Success, Canceled, Pending/Failed
> **AC cover:** AC-11, AC-12, AC-13, AC-14
> **Mode:** QUICK
> **Actor:** End User (Guest)
> **Ngày:** 2026-09-10
> **Figma:** Refined 2026-09-10 — cross-ref từ Figma ES-QR. **⚠️ Nhiều gap giữa SPEC và Figma** (xem observations).
> **Lưu ý bảo mật:** Không dùng card thật — chỉ test card elepay sandbox. Không log token/card data.

**Figma UI baseline:**

*`WP_PAY_001` — Payment Method Selection (node `27460:59999`, SPEC gán sai cho WP_CART_002):*
- Header 200px yellow `#fee28a`: filter icon left + title "**支払い方法の選択**" center + empty slot.
- Body heading: "**支払い方法を選択する**" (16px Medium).
- Radio list rounded-16px, mỗi row: icon (32-40px) trái + label 14px Regular + radio circle (40px).
- **Selected state**: border 2px orange admin/300 `#fbc14e`, hiển thị check.
- Thứ tự trong Figma: (1) クレジット/デビットカード [selected] (2) Apple Pay (3) Google Pay (4) PayPay (5) d払い (6) au PAY (7) **Aeon Pay** ← BA-06 nói bỏ (8) メルペイ (9) 現金 → **9 items, thiếu 楽天ペイ và Alipay từ SPEC**.
- CTA bottom: "**保存**" + check icon (yellow gradient 52px, 358px wide).

*`WP_PAY_002` — Payment Success (node `29037:150997`):*
- Bg gradient white → `#fff9eb` yellow tint. Logo ESSTATION top.
- Center: **Success Ring** 192px + ✓ check icon 96px + confetti (dots yellow/red/green/orange, ✦ sparkles).
- Text: "**お買い上げ**\n**ありがとうございます！**" (24px Bold, **màu xanh success `#1a7f37`**, 2 dòng).
- Note card: "またのご利用を\nお待ちしております！" (16px) + shopping-bag icon (48px yellow tint).
- **1 CTA duy nhất**: "**ホーム画面へ**" + caret-right (yellow gradient 52px).
- **KHÔNG có** order #, line items, "履歴を見る" CTA (contradict SPEC).

*`WP_PAY_003` — Payment Canceled (node `27460:59465`):*
- Node name Figma: `[UA_MYPG_004] Purchase History Details` — **reused Purchase History Detail** với status tag đỏ "**支払いキャンセル**".
- Header: title "**購入履歴詳細**" (KHÔNG phải "決済がキャンセルされました" như SPEC).
- Body: section "注文情報" (date, order #), "商品リスト" + Status tag `支払いキャンセル` (red solid), product rows, "支払い詳細" với total 200円 (red bold).
- **KHÔNG có** CTA "もう一度支払う" / "トップへ" ở bottom (contradict SPEC).

*`WP_PAY_004` — Payment Pending/Failed + confirmation modal (node `28522:242605`):*
- Header: title "**支払い未完了**".
- Body: warning icon 100px (red `#ffe5e4` circle + exclamation), heading "**お支払いが完了していません。**" (20px Bold), body copy 14px.
- Order summary card: 注文番号 `#ORD-892471`, 購入個数 `2`, 合計金額 **¥12,800** (red bold 20px).
- **Deadline alert box** yellow tint `#fff9eb` với clock icon + "**支払い期限 残り 05:59:59**" (countdown timer!) — SPEC chỉ nói poll 60s.
- Payment method row: logo + "**メルペイ**" + caret-right (có thể tap để đổi method).
- Button "**支払いキャンセル**" (48px, gray border) trong body.
- Footer 2 buttons: "**あとで支払う**" (outline) + "**再試行**" (yellow gradient 48px).
- **Modal overlay** (state 2): center popup border 4px yellow, warning icon, text "**支払いをキャンセルしてよろしいですか？**", nút đỏ "支払いをキャンセル" (bg light red `#ffe5e4`, border 2px red `#fa4549`, text red) + nút "戻る" (gray).

---

## Test Cases

| TC ID | Tiêu đề | Preconditions | Steps | Expected Result | Priority | Screen Code |
|---|---|---|---|---|---|---|
| TC_WP_PAY_001 | Payment method selection — hiển thị 10 methods (BA-06 đã bỏ Aeon Pay) | Guest session hợp lệ. Company có 現金 = enabled. Đang ở `/cart/confirm` sau khi tick checkbox. | 1. Tap "決済方法を選ぶ" → navigate `/cart/payment-methods` | - Header "**支払い方法の選択**"<br>- Body heading "**支払い方法を選択する**"<br>- Radio list rounded-16px, đúng 10 options theo thứ tự SPEC:<br>  1. クレジット / デビットカード (elepay, mặc định active với border orange admin/300)<br>  2. Apple Pay<br>  3. Google Pay<br>  4. PayPay<br>  5. d払い<br>  6. au PAY<br>  7. メルペイ<br>  8. 楽天ペイ<br>  9. Alipay<br>  10. 現金<br>- **Aeon Pay KHÔNG xuất hiện** (BA-06 requirement)<br>- CTA "**保存**" + check icon (yellow gradient) hiển thị bottom<br>- **⚠️ Figma hiện tại show 9 methods, có Aeon Pay, thiếu 楽天ペイ + Alipay** — Designer cần update | Critical | `WP_PAY_001` |
| TC_WP_PAY_002 | Payment method — 現金 ẩn khi admin disable | Guest session hợp lệ. Company có 現金 = disabled bởi E03 admin. | 1. Navigate `/cart/payment-methods` | - Hiển thị 9 options (không có 現金)<br>- Layout auto-reflow (list không có empty gap)<br>- CTA "保存" giữ nguyên | High | `WP_PAY_001` |
| TC_WP_PAY_003 | Payment method — Apple Pay ẩn/disable trên Android | Guest session hợp lệ. Thiết bị: Samsung Galaxy A22 (Android Chrome). | 1. Navigate `/cart/payment-methods` | - Apple Pay row không hiển thị (hoặc disable với opacity giảm + label "このデバイスでは使用できません")<br>- Confirm với Dev: hide vs disable strategy | High | `WP_PAY_001` |
| TC_WP_PAY_004 | Payment method — Google Pay ẩn/disable trên iOS | Guest session hợp lệ. Thiết bị: iPhone X (iOS Safari). | 1. Navigate `/cart/payment-methods` | - Google Pay row không hiển thị (hoặc disable) | High | `WP_PAY_001` |
| TC_WP_PAY_005 | Chọn phương thức và bấm 保存 — redirect elepay (non-cash) | Guest session hợp lệ. Đang ở `/cart/payment-methods`. | 1. Tap radio "**PayPay**"<br>2. Row PayPay chuyển sang selected state (border orange, radio dot filled)<br>3. Tap "**保存**" | - Radio state đúng: chỉ PayPay được select (border orange admin/300)<br>- Gọi POST `/api/v1/user/order` → nhận charge token<br>- Redirect elepay SDK page (PayPay flow)<br>- Không lưu card data locally | Critical | `WP_PAY_001` |
| TC_WP_PAY_006 | Chọn クレジット/デビットカード — elepay SDK | Guest session hợp lệ. Đang ở `/cart/payment-methods`. elepay sandbox credentials. | 1. Chọn "クレジット / デビットカード" (row đầu, mặc định đã selected)<br>2. Tap "保存" | - Redirect elepay SDK card entry page<br>- Dùng test card elepay sandbox (VD `4111111111111111`)<br>- Không lưu card number locally | Critical | `WP_PAY_001` |
| TC_WP_PAY_007 | 現金 — confirmation dialog | Guest session hợp lệ. Company có 現金 = enabled. | 1. Chọn "現金" (row cuối)<br>2. Tap "保存" | - **KHÔNG redirect elepay**<br>- Hiển thị confirmation dialog xác nhận thanh toán tiền mặt<br>- Dialog có nút confirm (yellow gradient) + cancel (gray outline)<br>- **⚠️ Figma cho cash dialog TBD** — cần Designer cung cấp | High | `WP_PAY_001` |
| TC_WP_PAY_008 | Chưa chọn phương thức — bấm 保存 | Guest session hợp lệ. Đang ở `/cart/payment-methods`, KHÔNG có radio nào selected (edge case: nếu default clear). | 1. Tap "保存" | - Không redirect<br>- Hiển thị validation error inline hoặc toast "**決済方法を選択してください**"<br>- **⚠️ Figma default có row đầu selected sẵn** → case này khó reach; confirm với Dev | High | `WP_PAY_001` |
| TC_WP_PAY_009 | Payment success — webhook confirmed | Guest session hợp lệ. Đã chọn PayPay và hoàn tất payment ở elepay. BE webhook `chargeSucceeded` received. | 1. elepay redirect về `/payment/success` | - Bg gradient white → yellow tint<br>- Logo ESSTATION top<br>- **Success Ring** 192px + ✓ check 96px + confetti dots<br>- Text "**お買い上げ**\n**ありがとうございます！**" (24px Bold, **màu xanh `#1a7f37`**)<br>- Note card "**またのご利用を お待ちしております！**" + shopping-bag icon<br>- Cart bị clear (localStorage rỗng)<br>- Order được thêm vào purchase history<br>- **⚠️ SPEC nói show order # + line items — Figma KHÔNG có** | Critical | `WP_PAY_002` |
| TC_WP_PAY_010 | Payment success — cart clear sau khi thanh toán | Guest session hợp lệ. Cart có `P001` qty=1 và `P002` qty=2. Payment thành công. | 1. Hoàn tất payment<br>2. Redirect về `/payment/success`<br>3. Tap "**ホーム画面へ**" → về Home | - Cart trống (localStorage `es-kitchen-cart` không còn P001, P002)<br>- Home hiển thị bình thường, không hiện cart badge/tổng<br>- Product list menu reload | Critical | `WP_PAY_002` |
| TC_WP_PAY_011 | Payment success — CTA "履歴を見る" | Đang ở `/payment/success`. | 1. Verify các CTA hiển thị<br>2. Tap "履歴を見る" (nếu tồn tại) | - **⚠️ Figma chỉ có 1 CTA "ホーム画面へ" (yellow gradient + caret-right)** — KHÔNG có "履歴を見る" như SPEC AC-12<br>- **Recommend Designer thêm secondary CTA "履歴を見る"** để user vào /history xem order vừa mua<br>- Nếu Dev implement theo SPEC: tap → navigate `/history`, order mới ở đầu list với status "決済完了" | High | `WP_PAY_002` |
| TC_WP_PAY_012 | Payment success — CTA "ホーム画面へ" (thay "トップへ") | Đang ở `/payment/success`. | 1. Tap "**ホーム画面へ**" | - Nút yellow gradient 52px full-width<br>- Navigate về `/` (Home = WP_MENU_001)<br>- Menu hiển thị bình thường<br>- **Note:** Figma dùng "ホーム画面へ" thay "トップへ" — same intent, khác wording | High | `WP_PAY_002` |
| TC_WP_PAY_013 | Payment canceled — user cancel ở elepay | Guest session hợp lệ. User chọn PayPay, redirect elepay, rồi bấm Cancel/Back ở elepay page. | 1. elepay redirect về `/payment/canceled` | - **⚠️ Figma layout hiện tại là reused Purchase History Detail** với title "**購入履歴詳細**" và status tag red "**支払いキャンセル**" — KHÔNG match SPEC ("決済がキャンセルされました")<br>- Body: 注文情報 (date, order #), 商品リスト với Status tag đỏ, 支払い詳細 total (red bold)<br>- **KHÔNG có CTA bottom** để retry payment hoặc back Home (Figma bug — cần Designer)<br>- Cart **không bị clear** (items giữ nguyên) | Critical | `WP_PAY_003` |
| TC_WP_PAY_014 | Payment canceled — "もう一度支払う" giữ nguyên cart | Đang ở `/payment/canceled`. Cart có `P001` qty=1. | 1. Tap "もう一度支払う" (nếu Dev implement theo SPEC — Figma missing) | - **⚠️ Nút này không có trong Figma hiện tại** — cần Designer thêm<br>- Nếu implement: navigate `/cart/payment-methods`<br>- Cart vẫn còn `P001` qty=1 | High | `WP_PAY_003` |
| TC_WP_PAY_015 | Payment pending — hiển thị order info + countdown 6h | Guest session hợp lệ. Payment status = `pending` (webhook chưa về). Đã chọn method メルペイ. | 1. Redirect về `/orders/pending` | - Header "**支払い未完了**"<br>- Warning icon 100px red + heading "**お支払いが完了していません。**" 20px Bold<br>- Order summary card: **注文番号 #ORD-XXXX, 購入個数 N, 合計金額 ¥XX,XXX** (red bold 20px)<br>- **Deadline alert box** yellow tint: ⏰ + "**支払い期限 残り HH:MM:SS**" (countdown live)<br>- Payment method row: logo + "**メルペイ**" + caret-right<br>- Bottom: "**あとで支払う**" (outline) + "**再試行**" (yellow gradient)<br>- **⚠️ SPEC chỉ nói loading state + poll 60s — Figma là full order + 6h countdown. Contradiction cần BA giải quyết** | High | `WP_PAY_004` |
| TC_WP_PAY_016 | Payment pending — tap "再試行" | Đang ở `/orders/pending`. | 1. Tap nút "**再試行**" (yellow gradient bottom-right) | - Redirect lại elepay SDK cho method đã chọn<br>- HOẶC navigate về `/cart/payment-methods` nếu Dev decide (confirm với BA)<br>- Countdown timer giữ nguyên state | High | `WP_PAY_004` |
| TC_WP_PAY_017 | Payment pending — tap "あとで支払う" | Đang ở `/orders/pending`. | 1. Tap "**あとで支払う**" (outline button bottom-left) | - Navigate về Home hoặc /history (Dev confirm)<br>- Order state giữ nguyên `pending` server-side<br>- User có thể quay lại /orders/pending từ history<br>- **⚠️ Behavior này KHÔNG có trong SPEC** — Figma feature mới | High | `WP_PAY_004` |
| TC_WP_PAY_018 | Payment pending — tap "支払いキャンセル" mở modal confirm | Đang ở `/orders/pending`. | 1. Tap "**支払いキャンセル**" (48px gray border button giữa body)<br>2. Verify modal | - Modal overlay bg dim `rgba(50,56,63,0.7)`<br>- Center popup border 4px yellow `#fac215`, rounded-20px, w-343px<br>- Warning icon 100px red<br>- Text "**支払いをキャンセルしてよろしいですか？**"<br>- Nút "**支払いをキャンセル**" (red border 2px `#fa4549`, text red 18px Medium)<br>- Nút "**戻る**" (gray outline)<br>- **⚠️ Modal này KHÔNG có trong SPEC** — feature mới | High | `WP_PAY_004` |
| TC_WP_PAY_019 | Payment pending — countdown expired → auto-cancel | Guest session hợp lệ. Order pending. Countdown timer chạy tới 00:00:00. | 1. Chờ hoặc simulate 6h passed<br>2. Observe UI | - Text "**※期限を過ぎると自動キャンセルされます。**" hiển thị dưới alert box<br>- Khi timer về 00:00:00: order auto-cancelled server-side<br>- UI: navigate về canceled screen HOẶC hiển thị message inline (Dev confirm)<br>- **⚠️ SPEC nói timeout 60s → "履歴からご確認ください" — Figma là 6h deadline; MAJOR difference** | High | `WP_PAY_004` |
| TC_WP_PAY_020 | Alipay — flow elepay | Guest session hợp lệ. Thiết bị hỗ trợ Alipay. | 1. Chọn "**Alipay**" (row 9 theo SPEC)<br>2. Tap "保存" | - **⚠️ Alipay KHÔNG có trong Figma hiện tại** — Designer cần thêm<br>- Nếu implement: redirect elepay Alipay flow<br>- Flow hoàn tất → redirect `/payment/success` với ✓ success UI | High | `WP_PAY_001` |

---

## Traceability — AC → TC

| AC ID | TC IDs cover |
|---|---|
| AC-11 | TC_WP_PAY_001, TC_WP_PAY_002, TC_WP_PAY_003, TC_WP_PAY_004, TC_WP_PAY_005, TC_WP_PAY_006, TC_WP_PAY_007, TC_WP_PAY_008 |
| AC-12 | TC_WP_PAY_009, TC_WP_PAY_010, TC_WP_PAY_011, TC_WP_PAY_012 |
| AC-13 | TC_WP_PAY_013, TC_WP_PAY_014 |
| AC-14 | TC_WP_PAY_015, TC_WP_PAY_016, TC_WP_PAY_017, TC_WP_PAY_018, TC_WP_PAY_019 |
| Cross-method coverage | TC_WP_PAY_020 |

---

## Figma observations (🔴 CRITICAL — nhiều mâu thuẫn cần BA/Designer giải quyết)

- **🔴 Payment method list mismatch:** Figma hiện có **9 methods bao gồm Aeon Pay**, SPEC yêu cầu **10 methods không có Aeon Pay** (+ 楽天ペイ + Alipay). Delta: (-) Aeon Pay, (+) 楽天ペイ, (+) Alipay. Designer phải update Figma per BA-06.
- **🔴 WP_PAY_002 (Success) missing order info:** Figma chỉ show success animation + "ホーム画面へ" CTA. SPEC AC-12 yêu cầu order # + line items + 2 CTAs (履歴を見る + トップへ). Cần Designer thêm order summary section và secondary CTA.
- **🔴 WP_PAY_003 (Canceled) design bug:** Figma dùng reused frame `[UA_MYPG_004] Purchase History Details` với title "購入履歴詳細" + status tag red. **Không match SPEC AC-13** (cần dedicated cancel screen với message + 2 CTAs もう一度支払う/トップへ). Cần Designer redesign hoặc BA confirm reuse-pattern.
- **🔴 WP_PAY_004 (Pending) SPEC-Figma major diff:**
  - SPEC: "loading state + poll 3s, timeout 60s"
  - Figma: full order detail card + **6-hour countdown deadline** + tap-to-change-method + retry/later/cancel actions + confirmation modal.
  - Đây là design pattern hoàn toàn khác (deferred payment vs blocking wait). BA cần confirm intent thực sự.
- **🟡 Aeon Pay in Figma:** BA-06 confirmed bỏ Aeon Pay, nhưng Figma vẫn có → Designer follow-up gấp.
- **🟡 "ホーム画面へ" vs "トップへ":** Figma dùng "ホーム画面へ" (to home screen), SPEC dùng "トップへ" (to top). Same intent, khác wording — chọn 1 để nhất quán với Legal page và cart flow.
- **🟡 Frame 390px iPhone shell:** Toàn bộ payment screens vẫn dùng mobile frame `[UA_*]`. SPEC 9 quy định desktop `max-w-3xl`. Designer cần điều chỉnh responsive.
- **🟢 Positive finding:** Yellow gradient CTA (`#fac215 → #ffc562`) consistent xuyên suốt (cart, payment, success, pending) → design system nhất quán.
