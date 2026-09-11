# Test Cases — Menu & Product | webapp-payment-oneqr

> **Feature:** webapp-payment-oneqr (E07 Web Payment One QR)
> **Module:** Menu & Product — Home, Category filter, Search, Product Detail, Barcode Scan, Add to Cart
> **AC cover:** AC-02, AC-03, AC-04, AC-05, AC-06, AC-07
> **Mode:** QUICK
> **Actor:** End User (Guest)
> **Ngày:** 2026-09-10
> **Figma:** Refined 2026-09-10 — cross-ref từ Figma ES-QR. ⚠️ WP_MENU_001 (Home), WP_MENU_002 (Empty), WP_PROD_003 (Photo zoom) Figma output vượt token limit — TC dựa trên SPEC + partial Figma info từ nested components.

**Figma UI baseline:**

*`WP_MENU_001` — Home (node `27460:59623`, Figma output >84KB — không fetch được full):*
- Layout SPEC-based: header yellow `#fee28a` với title, tab bar (categories), search bar, product card grid, FAB scan button.
- **⚠️ Cần Designer/BA cung cấp screenshot hoặc phân chia Figma thành smaller frames** để TC ref chính xác.
- Nested components observed elsewhere: cart quick-add button (yellow gradient 36-40px), NEW badge (red outline `#e60012`), 短消費期限 badge (yellow warning outline `#eab308`).

*`WP_MENU_002` — Empty Data (node `27460:57953`, Figma output too large):*
- **⚠️ Không fetch được full Figma.** Fallback theo SPEC AC-02 note: defensive-only state, BA-13 confirmed company luôn có menu.

*`WP_PROD_001` — Product Detail (node `27460:57341`, `[UA_PROD_001]`) — có image + cart button:*
- Product image top (320px full-width) + image index tag **"1/3"** (neutral gray tag bottom-right) → multiple images swipeable.
- Header 100px overlay: 2 filter icon buttons (36px, admin/50 bg) — trái = back, phải = other action (bookmark? Designer confirm).
- Main content (rounded-t-24px, drop-shadow yellow):
  - **Product name** (18px Bold): "**シェフの作ったビーフカレー(甘口カレー)**"
  - **Tags row** (14px Bold outline tags):
    - **短消費期限** (yellow warning outline `#eab308`)
    - **NEW** (red outline `#e60012`)
  - **Price row**: **100円** (24px Bold **màu đỏ `#cf222e`**) + spacer + **quick-add button** (40px yellow gradient với **shopping cart icon**)
  - **Description** (14px Regular gray, max ~65px height, expand link "**もっと見る**" + arrow down icon)
  - **Nutrition section** (bordered card rounded-14px):
    - Header row bg `#fafafa`: "**栄養成分**" (16px Medium)
    - Rows (14px Regular): エネルギー: 228kcal (200.00g), たんぱく質: 7.00g, 炭水化物: 19.00g, 脂質: 13.80g, 食塩相当量: 2.80g, 内容量: 200
  - **Allergen section** (yellow-yellow left-border `#fece3c`, bg `#fef9e8`):
    - Header: "**アレルゲン**" (16px Medium)
    - Rows: エネルギー: (icon groups 40px allergen icons), 特定原材料に準ずるもの: (icon groups)
  - **Ingredients section** (same left-border style):
    - Header: "**原材料**"
    - Rows: 添加物: 調味料（アミノ酸等）, 原材料名: (long text)
- Footer fixed bottom (white bg, rounded-t-20px): "**合計 (N)：XXX 円**" (18px Medium/Bold **màu đỏ**, full-width `：`) + button "**カートへ**" (yellow gradient 40px, 104px wide, + caret-right).

*`WP_PROD_002` — Product Detail with qty picker (node `27460:57650`, `[UA_PROD_001] _ New`) — state "already in cart":*
- Same layout WP_PROD_001 nhưng **price row có quantity picker thay single cart button**:
  - **100円** (24px Bold red) + spacer + **minus 36px** (yellow gradient) + **qty number** (16px Medium 99 max) + **plus 36px** (yellow gradient)
- **NO NEW/短消費期限 badges** trong variant "No image" (Figma "None image" state hiển thị khi product không có ảnh chính? Confirm với Designer).
- Header trên: 2 filter icon buttons same as PROD_001.

*`WP_PROD_003` — Photo zoom fullscreen (node `27460:58933`, Figma output too large):*
- **⚠️ Không fetch được full.** Fallback: fullscreen modal image viewer, tap để close (SPEC AC-05).

*`WP_SCAN_001` — Barcode scan (node `27460:56836`):*
- Bg app/200 yellow `#fee28a`.
- Header 100px: filter icon left (36px admin/50 bg), icon phải opacity-0 (hidden slot).
- **Scan window** (366×400px center): border yellow `#fac215`, rounded-24px, shadow yellow glow inset — chứa camera preview + scan overlay guide.
- **Cloud decoration** bottom: SVG clouds với opacity 40-60% giảm dần, bg gradient.
- **Instruction text** (bottom 612px): "**商品のバーコードを\nスキャンしてください。**" (20px Bold, text-shadow subtle, 282px wide).
- **KHÔNG có** back button hoặc cancel button visible trong Figma — user relies on browser back / hardware back.

---

## Test Cases

| TC ID | Tiêu đề | Preconditions | Steps | Expected Result | Priority | Screen Code |
|---|---|---|---|---|---|---|
| TC_WP_MENU_001 | Home load — hiển thị menu tháng hiện tại | Guest session hợp lệ cho company `COMP001` (có 拠点 `CU00000001`). Company có menu tháng 2026-09. | 1. Vào `/` | - Header bg yellow `#fee28a` với title (VD "ホーム" hoặc company name — **⚠️ Figma Home chưa fetch được, verify với Designer**)<br>- Product cards hiển thị: ảnh, tên, NEW badge (red outline `#e60012` nếu có), 短消費期限 badge (yellow warning outline `#eab308` nếu expiry ≤ 2 ngày), giá (color red per PROD_001 style), kcal/100g, quick-add button (yellow gradient)<br>- Category tabs đủ: 全て / 肉 / 魚 / 惣菜 / 主食 / 汁物 / サラダ・果物 / 飲料・甘味<br>- Search bar "何をお探しですか？"<br>- FAB scan button (yellow gradient, bottom-right) | Critical | `WP_MENU_001` |
| TC_WP_MENU_002 | Home — tab 全て hiển thị tất cả sản phẩm | Guest session hợp lệ. Company có 5 sản phẩm: 2 肉, 2 魚, 1 惣菜. | 1. Vào `/`<br>2. Tap tab 全て | - Tab 全て highlight active state<br>- Hiển thị đủ 5 sản phẩm không filter | High | `WP_MENU_001` |
| TC_WP_MENU_003 | Category filter — tap tab 肉 | Guest session hợp lệ. Company có 3 sản phẩm 肉, 2 sản phẩm 魚. | 1. Vào `/`<br>2. Tap tab 肉 | - Chỉ hiển thị 3 sản phẩm 肉<br>- Tab 肉 active (highlight — style TBD từ Figma)<br>- Scroll position giữ nguyên | High | `WP_MENU_001` |
| TC_WP_MENU_004 | Category filter — tap lần lượt các tab | Guest session hợp lệ. | 1. Tap tab 魚 → 惣菜 → 主食 → 汁物 → サラダ・果物 → 飲料・甘味 | - Mỗi tab chỉ hiển thị sản phẩm thuộc category đó<br>- Đúng 1 tab active mỗi lần<br>- Tab bar horizontal scroll nếu overflow | High | `WP_MENU_001` |
| TC_WP_MENU_005 | Category filter — tab không có sản phẩm | Guest session hợp lệ. Company không có sản phẩm 飲料・甘味 tháng này. | 1. Tap tab 飲料・甘味 | - Hiển thị empty state trong tab<br>- Message tiếng Nhật (VD "この分類には商品がありません")<br>- **⚠️ Figma chưa show empty per-tab state** — cần Designer bổ sung | Medium | `WP_MENU_001` |
| TC_WP_MENU_006 | Home — defensive empty menu state | Guest session hợp lệ. Company không có menu tháng hiện tại (case hiếm — BA-13 nói không xảy ra). | 1. Vào `/` | - Hiển thị `WP_MENU_002` (Empty Data fallback)<br>- Không crash app<br>- **⚠️ Figma WP_MENU_002 output too large — Designer verify layout** | Medium | `WP_MENU_002` |
| TC_WP_MENU_007 | Keyword search — tìm theo tên sản phẩm | Guest session hợp lệ. Menu có sản phẩm "**鶏の唐揚げ**". | 1. Tap search bar "**何をお探しですか？**"<br>2. Gõ `鶏` | - Sau debounce 300ms: API call<br>- Hiển thị sản phẩm "**鶏の唐揚げ**"<br>- Kết quả real-time khi gõ<br>- Search bar giữ focus + text đang gõ | High | `WP_MENU_001` |
| TC_WP_MENU_008 | Keyword search — tìm theo category name | Guest session hợp lệ. | 1. Gõ `肉` vào search bar | - Hiển thị tất cả sản phẩm thuộc category 肉 khớp keyword<br>- Behavior khi vừa gõ vừa có tab active: TBD (search override tab filter?) | Medium | `WP_MENU_001` |
| TC_WP_MENU_009 | Keyword search — tìm theo nutrition tag | Guest session hợp lệ. Sản phẩm "**サーモンサラダ**" có nutrition tag `DHA`. | 1. Gõ `DHA` vào search bar | - Hiển thị "サーモンサラダ" trong kết quả<br>- Nutrition tag matching thực sự hoạt động (không chỉ name/category) | Medium | `WP_MENU_001` |
| TC_WP_MENU_010 | Keyword search — không có kết quả | Guest session hợp lệ. | 1. Gõ `zzzznotexist` vào search bar | - Hiển thị empty state "**該当する商品が見つかりません**" (hoặc tương đương)<br>- Không crash<br>- Search bar text giữ nguyên<br>- **⚠️ Figma no-result state chưa verify** | Medium | `WP_MENU_001` |
| TC_WP_MENU_011 | Keyword search — debounce 300ms | Guest session hợp lệ. | 1. Gõ nhanh `鶏の唐揚げ` (mỗi ký tự <300ms) | - API chỉ gọi 1 lần sau khi dừng gõ 300ms<br>- Verify qua DevTools Network<br>- Không gọi API liên tục theo từng keystroke | Medium | `WP_MENU_001` |
| TC_WP_MENU_012 | Keyword search — XSS input | Guest session hợp lệ. | 1. Gõ `<script>alert(1)</script>` vào search bar | - Input sanitize, không execute script<br>- Hiển thị empty state hoặc 0 kết quả<br>- BE cũng không log/execute raw payload | High | `WP_MENU_001` |
| TC_WP_MENU_013 | Product detail — happy path (có ảnh) | Guest session hợp lệ. Sản phẩm `P001` "**シェフの作ったビーフカレー(甘口カレー)**" giá 100円. | 1. Vào `/`<br>2. Tap product card | - Navigate `/product/P001`<br>- Product image top 320px + image index tag "**1/3**" (nếu có multiple images)<br>- Header 100px overlay với 2 filter icon buttons<br>- Name "**シェフの作ったビーフカレー(甘口カレー)**" (18px Bold)<br>- Tags: **短消費期限** (yellow outline) và **NEW** (red outline) — nếu applicable<br>- Price **100円** (24px Bold **red `#cf222e`**)<br>- **Quick-add cart button** (yellow gradient 40px với shopping cart icon) — state ban đầu (chưa in cart)<br>- Description text (14px Regular gray) + "**もっと見る**" expand<br>- Nutrition section (bordered card): エネルギー, たんぱく質, 炭水化物, 脂質, 食塩相当量, 内容量<br>- Allergen section (yellow left-border): エネルギー icons + 特定原材料に準ずるもの icons<br>- Ingredients section: 添加物 + 原材料名<br>- Footer: "**合計 (N)：XXX 円**" red + "**カートへ**" button (yellow gradient + caret-right) | Critical | `WP_PROD_001` |
| TC_WP_MENU_014 | Product detail — không có ảnh | Guest session hợp lệ. Sản phẩm `P002` không có photo URL. | 1. Tap sản phẩm `P002` | - Hiển thị placeholder image (`WP_PROD_002` state)<br>- Layout không broken<br>- Các section khác render bình thường<br>- **⚠️ Figma "None image" node vẫn hiện image thực tế** — có thể là confusing name; Designer verify | High | `WP_PROD_002` |
| TC_WP_MENU_015 | Product photo — zoom fullscreen | Guest session hợp lệ. Sản phẩm `P001` có ảnh. | 1. Vào `/product/P001`<br>2. Tap ảnh sản phẩm | - Mở fullscreen zoom (`WP_PROD_003`)<br>- Ảnh fullscreen<br>- Tap ảnh lại HOẶC back button để close<br>- **⚠️ Figma WP_PROD_003 output too large — layout details TBD từ Designer** | High | `WP_PROD_003` |
| TC_WP_MENU_016 | Product không tồn tại — xử lý 404 | Guest session hợp lệ. | 1. Navigate trực tiếp `/product/NOTEXIST` | - Error page với message tiếng Nhật<br>- CTA về Home<br>- Không crash<br>- **⚠️ Figma error state chưa có** | High | (error state) |
| TC_WP_MENU_017 | Barcode scan — happy path | Guest session hợp lệ. Sản phẩm `P003` có barcode `4912345678901`. Camera permission granted. | 1. Tap FAB scan → navigate `/scan`<br>2. Camera hiển thị trong window 366×400px border yellow<br>3. Overlay text "**商品のバーコードをスキャンしてください。**"<br>4. Scan barcode `4912345678901` | - Layout WP_SCAN_001: bg yellow `#fee28a`, header 100px với filter icon left, scan window center rounded-24px shadow yellow glow, cloud decoration bottom<br>- Text 20px Bold hiển thị đúng 2 dòng<br>- API `/api/v1/user/product/scan/4912345678901` trả `P003`<br>- Auto-navigate `/product/P003` — WP_PROD_001 layout<br>- Không cần user action thêm | High | `WP_SCAN_001` |
| TC_WP_MENU_018 | Barcode scan — barcode không khớp sản phẩm | Guest session hợp lệ. Barcode `0000000000000` không có trong DB. | 1. Vào `/scan`<br>2. Scan barcode `0000000000000` | - Hiển thị toast lỗi "**バーコードが見つかりません**" (hoặc tương đương)<br>- Camera vẫn active (giữ scan mode)<br>- Không navigate<br>- **⚠️ Figma không show toast layout** | High | `WP_SCAN_001` |
| TC_WP_MENU_019 | Barcode scan — user deny camera permission | Guest session hợp lệ. | 1. Tap FAB scan<br>2. Browser prompt camera permission → user bấm Deny | - Hiển thị fallback UI (không phải blank scan window)<br>- Hướng dẫn bật camera trong browser settings<br>- CTA về Home<br>- **⚠️ Figma không có deny state** — cần Designer thêm | High | `WP_SCAN_001` |
| TC_WP_MENU_020 | Barcode scan — instruction text | Guest session hợp lệ. Camera permission granted. | 1. Vào `/scan` | - Text "**商品のバーコードをスキャンしてください。**" hiển thị (20px Bold, 2 dòng, text-shadow subtle)<br>- Position: bottom trên clouds decoration (612px từ top)<br>- Text center-align, 282px wide | Medium | `WP_SCAN_001` |
| TC_WP_MENU_021 | Add to cart — từ product detail (initial state) | Guest session hợp lệ. Cart trống. Sản phẩm `P001`. | 1. Vào `/product/P001`<br>2. Tap **quick-add cart button** (40px yellow gradient với shopping cart icon) | - Item `P001` qty=1 được thêm vào localStorage<br>- **Button transform** thành quantity picker (minus 36px + qty=1 + plus 36px, per `WP_PROD_002` state)<br>- Footer total update: `合計 (1)：100 円`<br>- Toast confirm hiển thị (Figma chưa show — TBD) | Critical | `WP_PROD_001`, `WP_PROD_002` |
| TC_WP_MENU_022 | Add to cart — từ Home quick-add | Guest session hợp lệ. | 1. Vào `/`<br>2. Tap nút quick-add trên product card của `P001` | - `P001` qty=1 vào cart localStorage<br>- Toast confirm<br>- Không navigate đi khỏi Home<br>- Product card có thể có visual feedback (checkmark, changing button state) | High | `WP_MENU_001` |
| TC_WP_MENU_023 | Add to cart — tăng qty từ picker (đã in cart) | Guest session hợp lệ. `P001` đã trong cart qty=1. | 1. Vào `/product/P001` (thấy quantity picker)<br>2. Tap **plus** button (yellow gradient 36px) | - Qty tăng 2<br>- Footer total update: `合計 (1)：200 円`<br>- localStorage cart[P001].qty = 2 | High | `WP_PROD_002` |
| TC_WP_MENU_024 | Add to cart — vượt daily limit | Guest session hợp lệ. Company limit = 5/ngày. User đã mua 5 items hôm nay. | 1. Vào `/product/P001`<br>2. Tap plus button để tăng qty | - BE trả lỗi daily limit<br>- Toast "**本日の購入上限に達しました**"<br>- Qty KHÔNG tăng<br>- Button plus có thể chuyển disabled state | High | `WP_PROD_001`, `WP_PROD_002` |
| TC_WP_MENU_025 | Add to cart — merge cùng sản phẩm | Guest session hợp lệ. | 1. Add `P001` qty=1 từ product detail<br>2. Back về Home<br>3. Tap quick-add `P001` trên card | - Cart có `P001` qty=**2** (merge, không tạo duplicate entry)<br>- Total update đúng<br>- localStorage vẫn 1 entry cho P001 | Medium | `WP_MENU_001`, `WP_PROD_002` |
| TC_WP_MENU_026 | 短消費期限 badge — sản phẩm hết hạn trong 2 ngày | Guest session hợp lệ. Sản phẩm `P004` có `expiry_date` = ngày hiện tại + 1 ngày. | 1. Vào Home<br>2. Vào `/product/P004` | - Home: badge 短消費期限 trên product card<br>- Product detail: **短消費期限** tag (yellow warning outline `#eab308`, 14px Bold, 短消費期限 label)<br>- Sản phẩm `P005` (expiry + 3 ngày) không hiển thị badge | Medium | `WP_MENU_001`, `WP_PROD_001` |
| TC_WP_MENU_027 | NEW badge — sản phẩm vừa thêm | Guest session hợp lệ. Sản phẩm `P006` có flag `is_new = true`. | 1. Vào Home<br>2. Vào `/product/P006` | - Home: NEW badge trên card<br>- Product detail: **NEW** tag (**red outline `#e60012`**, 14px Bold, label "NEW")<br>- Sản phẩm không có `is_new` không hiển thị badge | Medium | `WP_MENU_001`, `WP_PROD_001` |
| TC_WP_MENU_028 | Giá sản phẩm theo company subsidy | Guest session hợp lệ. Sản phẩm `P001` giá gốc 500円. Company `COMP001` có subsidy 150円. | 1. Vào `/product/P001` | - Hiển thị giá **350円** (500 - 150) — 24px Bold **red `#cf222e`**<br>- Không hiển thị giá gốc (trừ khi SPEC quy định khác)<br>- **⚠️ Figma dùng màu đỏ cho giá — cần BA confirm ý đồ (highlight vs error)** | High | `WP_PROD_001` |

---

## Traceability — AC → TC

| AC ID | TC IDs cover |
|---|---|
| AC-02 | TC_WP_MENU_001, TC_WP_MENU_002, TC_WP_MENU_006, TC_WP_MENU_026, TC_WP_MENU_027, TC_WP_MENU_028 |
| AC-03 | TC_WP_MENU_003, TC_WP_MENU_004, TC_WP_MENU_005 |
| AC-04 | TC_WP_MENU_007, TC_WP_MENU_008, TC_WP_MENU_009, TC_WP_MENU_010, TC_WP_MENU_011, TC_WP_MENU_012 |
| AC-05 | TC_WP_MENU_013, TC_WP_MENU_014, TC_WP_MENU_015, TC_WP_MENU_016 |
| AC-06 | TC_WP_MENU_017, TC_WP_MENU_018, TC_WP_MENU_019, TC_WP_MENU_020 |
| AC-07 | TC_WP_MENU_021, TC_WP_MENU_022, TC_WP_MENU_023, TC_WP_MENU_024, TC_WP_MENU_025 |

---

## Figma observations

- **🔴 3 screens Figma output vượt token limit:** `WP_MENU_001` (Home, 84KB), `WP_MENU_002` (Empty, 80KB), `WP_PROD_003` (Photo zoom, 52KB). Recommend Designer:
  - Break Home component thành smaller sub-components (product card, category tab bar, search bar, FAB) để có thể fetch riêng
  - Hoặc export screenshot/image cho QC visual reference
- **🔴 Product detail có 2 states:** WP_PROD_001 (single cart-icon button, initial) và WP_PROD_002 (quantity picker inline, in-cart). SPEC AC-05 chỉ nói "Quantity picker (1 mặc định) + CTA カートに追加" — Figma implementation là **conditional** based on cart state. Cần update SPEC.
- **🟡 Header 2 filter icons trên Product Detail:** Icon trái (back?) + icon phải (bookmark? share?). SPEC không đề cập icon thứ 2. Designer confirm mục đích.
- **🟡 Giá màu đỏ `#cf222e`:** Consistent trên product detail, cart, history — cần BA confirm ý đồ (attention vs error semantic).
- **🟡 Search bar text placeholder:** "**何をお探しですか？**" chỉ trong SPEC — Figma Home chưa fetch để verify.
- **🟡 FAB scan position/style:** SPEC nói "yellow, bottom-right" — cần Figma Home để verify chính xác kích thước, icon, tap area.
- **🟡 Scan screen KHÔNG có back button visible:** WP_SCAN_001 Figma chỉ có 1 icon nhìn thấy được. User phải dùng browser back. **Recommend Designer thêm back/cancel button trong scan mode** để UX tốt hơn.
- **🟡 Nutrition/Allergen sections rất chi tiết:** Product detail có 3 sections lớn (Nutrition + Allergen + Ingredients). Data seed cho tester cần cover full detail — cần Dev cung cấp mock data structure.
- **🟢 Frame consistency:** Tất cả dùng mobile 390px frame `[UA_PROD_001]`. E07 SPEC 9 yêu cầu desktop `max-w-3xl` — vẫn là câu hỏi mở với Designer.
