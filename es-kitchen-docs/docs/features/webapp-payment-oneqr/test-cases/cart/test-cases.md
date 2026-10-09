# Test Cases — Cart | webapp-payment-oneqr

> **Feature:** webapp-payment-oneqr (E07 Web Payment One QR)
> **Module:** Cart — Cart list, Quantity edit, Cart confirm
> **AC cover:** AC-08, AC-09, AC-10
> **Mode:** QUICK
> **Actor:** End User (Guest)
> **Ngày:** 2026-09-10
> **Figma:** Refined 2026-09-10 — cross-ref từ Figma section ES-QR. **⚠️ WP_CART_002 mapping trong SPEC bị sai** (xem observations).

**Figma UI baseline:**

*`WP_CART_001` — Cart list (node `27460:58227`):*
- Header 200px, bg app/200 `#fee28a` yellow: filter icon left (36px, bg admin/50), title "**カート**" center (18px Medium), empty slot right.
- Main (rounded-t-24px, white, shadow yellow glow):
  - Info block: label "**拠点ID**" (16px Bold) + value (14px Regular, VD `CU00000000`) inline; label "**拠点名**" + value (VD "株式会社エクセレントフーズ").
  - Product list header row: "**商品リスト**" (16px Medium) + button "**すべてクリア**" (14px Medium, icon trái, border neutral/200) → **clear-all không có trong SPEC**.
  - Product row (border-bottom divider/low): thumbnail 48px rounded-4px trái, title 14px Medium, giá `100円` **màu đỏ `#cf222e`** (negative/500) 16px Bold, actions phải: minus button + qty (16px Medium, ≤3 digit) + plus button; cả 2 button 36px vuông yellow gradient (`#fac215` → `#ffc562`), rounded-8px.
- Footer fixed bottom (bg white, rounded-t-20px, shadow): "**合計**" 18px + "**(N)：XXX 円**" (N và số tiền màu đỏ 18px Bold, dùng full-width colon `：`) + CTA "**支払い**" (14px Medium + caret-right icon, yellow gradient, 40px cao, w-90px).

*`WP_CART_002` — SPEC ghi node `27460:59999` nhưng node đó thực chất là **Payment Method Selection** (title "支払い方法の選択"), KHÔNG phải Cart Confirm. Xem observations bên dưới.*

---

## Test Cases

| TC ID | Tiêu đề | Preconditions | Steps | Expected Result | Priority | Screen Code |
|---|---|---|---|---|---|---|
| TC_WP_CART_001 | Cart page — hiển thị đúng 拠点 info và danh sách sản phẩm | Guest session hợp lệ với 拠点 `CU00000001` tên "東京本社". Cart có 2 sản phẩm: `P001` qty=1 (350円), `P002` qty=2 (200円 mỗi). | 1. Vào `/cart` | - Header title "**カート**" center (18px Medium, bg yellow `#fee28a`)<br>- Info block: "**拠点ID**" label bold + value readonly `CU00000001`; "**拠点名**" label bold + value readonly "東京本社"<br>- Product list header: "**商品リスト**" (16px Medium) + button "**すべてクリア**"<br>- Row `P001`: thumbnail 48px, tên (14px Medium), giá **350円 màu đỏ `#cf222e`** 16px Bold, minus/qty=1/plus (yellow gradient 36px)<br>- Row `P002`: giống trên, qty=2<br>- Footer: "**合計 (2)：750 円**" (số đỏ, dùng full-width `：`) + nút "**支払い >**" (yellow gradient + caret right) | Critical | `WP_CART_001` |
| TC_WP_CART_002 | Cart page — giỏ hàng trống | Guest session hợp lệ. Cart trống (localStorage cart rỗng). | 1. Vào `/cart` | - Header "カート" vẫn hiển thị<br>- Body: empty state (không có product row)<br>- CTA về Home hiển thị (VD "商品を見る")<br>- Footer "合計" ẩn hoặc hiển thị `合計 (0)：0 円` (confirm với Dev)<br>- Nút "支払い >" ẩn/disabled | High | `WP_CART_001` |
| TC_WP_CART_003 | Tăng quantity sản phẩm | Guest session hợp lệ. Cart có `P001` qty=1 (350円). | 1. Vào `/cart`<br>2. Tap nút **plus (yellow gradient)** ở row `P001` | - Qty ở giữa (16px Medium) tăng thành `2`<br>- Total footer update: `合計 (1)：700 円` (số đỏ)<br>- localStorage được update<br>- UI phản hồi ngay (optimistic update, không loading spinner) | High | `WP_CART_001` |
| TC_WP_CART_004 | Giảm quantity sản phẩm (qty > 1) | Guest session hợp lệ. Cart có `P001` qty=2. | 1. Vào `/cart`<br>2. Tap nút **minus (yellow gradient)** ở row `P001` | - Qty giảm thành `1`<br>- Total update đúng<br>- localStorage update<br>- Item vẫn còn trong cart, row không biến mất | High | `WP_CART_001` |
| TC_WP_CART_005 | Giảm quantity về 0 — xóa item khỏi cart | Guest session hợp lệ. Cart có `P001` qty=1, `P002` qty=1. | 1. Vào `/cart`<br>2. Tap nút **minus** ở row `P001` | - Row `P001` biến mất khỏi list (với divider trên/dưới)<br>- Chỉ còn row `P002`<br>- Total footer: `合計 (1)：200 円`<br>- localStorage không còn `P001`<br>- Không có confirmation modal (BA confirm: cần confirm dialog cho case này không?) | Critical | `WP_CART_001` |
| TC_WP_CART_006 | Xóa item cuối cùng trong cart | Guest session hợp lệ. Cart chỉ có `P001` qty=1. | 1. Vào `/cart`<br>2. Tap **minus** ở `P001` | - Cart trống → chuyển sang empty state (giống TC_WP_CART_002)<br>- Nút "支払い >" ẩn/disabled<br>- Footer total ẩn hoặc `合計 (0)：0 円` | High | `WP_CART_001` |
| TC_WP_CART_007 | Tăng qty — kiểm tra daily limit phía BE | Guest session hợp lệ. Company limit = 3/ngày. Cart có `P001` qty=2, `P002` qty=1. Tổng = 3. | 1. Vào `/cart`<br>2. Tap **plus** ở `P001` | - Toast hoặc dialog hiển thị "**本日の購入上限に達しました**"<br>- Qty `P001` không tăng (giữ nguyên = 2)<br>- Total không đổi | High | `WP_CART_001` |
| TC_WP_CART_008 | Total tính đúng với nhiều sản phẩm | Guest session hợp lệ. Cart: `P001` qty=3 (350円), `P002` qty=2 (200円), `P003` qty=1 (500円). | 1. Vào `/cart` | - 3 product rows hiển thị<br>- Footer: `合計 (3)：1.950 円` (số Bold đỏ). N=3 = số unique items, không phải tổng qty<br>- Tính đúng: 3×350 + 2×200 + 1×500 = 1050+400+500 = 1950円 | High | `WP_CART_001` |
| TC_WP_CART_009 | Tap "すべてクリア" — xóa toàn bộ cart | Guest session hợp lệ. Cart có 3 items. | 1. Vào `/cart`<br>2. Tap nút "**すべてクリア**" ở product list header | - Cart clear toàn bộ (localStorage rỗng)<br>- Chuyển sang empty state<br>- **Cần BA confirm:** có confirmation dialog trước khi clear không? (Figma không show dialog nhưng destructive action) | High | `WP_CART_001` |
| TC_WP_CART_010 | Cart confirm — happy path | Guest session hợp lệ. Cart có `P001` qty=1 (350円). | 1. Vào `/cart`<br>2. Tap "**支払い >**" (yellow gradient + caret right) | - Navigate `/cart/confirm`<br>- Hiển thị order summary readonly (line item `P001` 350円, total 350円)<br>- Legal agreement checkbox: "**利用規約とプライバシーポリシーに同意します**" hiển thị, ban đầu unchecked<br>- Link "利用規約とプライバシーポリシー" → `/legal`<br>- Nút "決済方法を選ぶ" ở trạng thái disabled<br>- **⚠️ Figma node cho screen này TBD** — cần Designer xác nhận layout | Critical | `WP_CART_002` (⚠️ node TBD) |
| TC_WP_CART_011 | Cart confirm — checkbox chưa tick, nút CTA disabled | Guest session hợp lệ. Đang ở `/cart/confirm`, checkbox chưa tick. | 1. Tap nút "決済方法を選ぶ" (đang disabled) | - Nút không responsive (visually disabled: opacity giảm hoặc gray)<br>- Không navigate đi<br>- (Layout details TBD — Figma node chưa xác định) | High | `WP_CART_002` (⚠️ node TBD) |
| TC_WP_CART_012 | Cart confirm — tick checkbox rồi mới bấm CTA | Guest session hợp lệ. Đang ở `/cart/confirm`. | 1. Tick checkbox "利用規約とプライバシーポリシーに同意します"<br>2. Tap "決済方法を選ぶ" | - Checkbox tick → nút CTA trở thành active (yellow gradient)<br>- Tap nút → navigate `/cart/payment-methods` (WP_PAY_001 — Payment Method Selection) | Critical | `WP_CART_002` (⚠️ node TBD) |
| TC_WP_CART_013 | Cart confirm — legal link mở đúng route | Guest session hợp lệ. Đang ở `/cart/confirm`. | 1. Tap link "利用規約とプライバシーポリシー" trong checkbox label | - Navigate `/legal`<br>- Trang Legal render đầy đủ (WP_LEGAL_001: title "規約・プライバシー", tab 利用規約/プライバシー) | High | `WP_CART_002` (⚠️ node TBD) |
| TC_WP_CART_014 | Cart confirm — order summary readonly | Guest session hợp lệ. Đang ở `/cart/confirm`. | 1. Vào `/cart/confirm`<br>2. Cố gắng edit quantity trực tiếp trên trang confirm | - Line items readonly: KHÔNG có nút minus/plus/qty picker<br>- Không thể thay đổi số lượng ở trang này<br>- Muốn edit qty → back về `/cart` | Medium | `WP_CART_002` (⚠️ node TBD) |
| TC_WP_CART_015 | Cart — localStorage persist sau khi refresh | Guest session hợp lệ. Cart có `P001` qty=2. | 1. Ở `/cart`<br>2. Refresh browser (F5)<br>3. Vào `/cart` lại | - Cart vẫn còn `P001` qty=2 sau reload<br>- Product row hiển thị đúng<br>- Total footer đúng<br>- Info block 拠点ID/拠点名 giữ nguyên | High | `WP_CART_001` |
| TC_WP_CART_016 | Boundary — quantity tối đa hợp lệ | Guest session hợp lệ. Company limit = 5/ngày. Cart hiện tại trống. | 1. Add `P001` qty=5 từ product detail<br>2. Vào `/cart`<br>3. Tap nút **plus** ở `P001` | - Khi qty = 5 và limit = 5: nút **plus** disable (visually gray) hoặc hiện toast "本日の購入上限に達しました"<br>- Qty không vượt 5<br>- (Figma không show state disabled cho button — Designer follow-up) | High | `WP_CART_001` |

---

## Traceability — AC → TC

| AC ID | TC IDs cover |
|---|---|
| AC-08 | TC_WP_CART_001, TC_WP_CART_002, TC_WP_CART_008, TC_WP_CART_015 |
| AC-09 | TC_WP_CART_003, TC_WP_CART_004, TC_WP_CART_005, TC_WP_CART_006, TC_WP_CART_007, TC_WP_CART_009, TC_WP_CART_016 |
| AC-10 | TC_WP_CART_010, TC_WP_CART_011, TC_WP_CART_012, TC_WP_CART_013, TC_WP_CART_014 |

---

## Figma observations (⚠️ cần BA/Designer xử lý gấp)

- **🔴 SPEC lỗi mapping WP_CART_002:** SPEC section 5 gán `WP_CART_002 = node 27460:59999`, nhưng Figma tại node đó là **Payment Method Selection** (title "支払い方法の選択"), KHÔNG phải Cart Confirm. Đây là **SPEC bug** — cần BA sửa mapping. TC 010-014 hiện đánh dấu `⚠️ node TBD` chờ Designer cung cấp Figma node đúng cho `/cart/confirm` (legal checkbox + summary readonly).
- **🟡 "すべてクリア" button không có trong SPEC:** Figma WP_CART_001 có nút "すべてクリア" (clear all) ở product list header. SPEC AC-08 và AC-09 không đề cập. Đã thêm TC_WP_CART_009. **Cần BA confirm:** có confirmation dialog trước khi clear không?
- **🟡 Format total dùng full-width colon:** SPEC ghi `合計 (N): XXX 円` (half-width `:`), Figma dùng `合計 (N)：XXX 円` (full-width `：`). Cần thống nhất — recommend theo Figma (Japanese-native).
- **🟡 Giá sản phẩm màu đỏ `#cf222e`:** SPEC không quy định màu giá. Figma dùng negative/500 red — trong design token đây là màu error/destructive, KHÔNG phải "highlight". Cần BA/Designer confirm ý đồ (drawing attention vs error semantic).
- **🟡 Header title "カート" khác với breadcrumb/menu label:** Không có breadcrumb hay page label trong SPEC — Figma chỉ có "カート" đơn giản ở header. OK.
- **⚠️ Frame 390px iPhone shell:** UI vẫn dùng frame mobile app (E01). E07 SPEC 9 quy định `max-w-3xl` desktop-center, cần Designer confirm responsive strategy.
