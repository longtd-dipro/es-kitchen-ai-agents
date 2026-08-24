# SPEC — Webapp Payment (One QR)

> **Feature codename:** `webapp-payment-oneqr`
> **Epic:** E07 — User Web Ordering (repo: `es-kitchen-webapp-payment`)
> **Sinh từ:** `ai-memories/【ESキッチン様】Estimation_WebApp_OneQR_20260801_WIP.xlsx` + Figma `ES-QR` section (node `27460:56833`)
> **Author:** BA agent · 2026-08-21
> **Status:** ✅ **Discovery closed** (client answered BA TODOs 2026-08-21) → Ready for Contract Lock. Còn 2 follow-up (BA-11, BA-12) chờ Designer/Figma verify — không block bắt đầu Design phase.

---

## 1. Business context

Client Nhật Bản (ESKITCHEN) hiện có **E01 Mobile App** (Flutter — `es-kitchen-payment-app`) cho end user đặt hàng tại bếp doanh nghiệp. Trải nghiệm mobile app đòi hỏi user cài đặt + đăng ký — tạo ma sát với những khách hàng chỉ ghé bếp 1-2 lần (ví dụ khách vãng lai, nhân viên hợp đồng ngắn).

**One QR** là **web variant** cho phép user quét QR dán tại tủ lạnh/kệ (per-拠点 QR duy nhất) → mở trực tiếp trong browser → chọn món → thanh toán bằng elepay (credit card, PayPay, d払い, au PAY, メルペイ, 楽天ペイ, Alipay, Apple Pay, Google Pay, Aeon Pay, 現金) → hoàn tất. **Không cần cài app, không cần đăng ký tài khoản.**

**Positioning:**

- **E01 Mobile** — user thường xuyên, có tài khoản, có push notification, favorite, allergy setting, purchase history đầy đủ, tutorial.
- **E07 Web (One QR)** — user vãng lai / one-off, guest-first, không tài khoản, không notification, chỉ core ordering flow.

**Client goal:** giảm friction install/register cho khách hàng mới → tăng conversion tại bếp mới triển khai.

---

## 2. Actors

| Actor | Mô tả | Điểm vào |
|---|---|---|
| **End User (Guest)** | Người ăn tại bếp — không cần tài khoản. Session gắn với browser cookie/localStorage. | Quét QR tại 拠点 → `/shop/:code` |
| **System Admin (E03)** | Cấu hình `1日あたりの購入数量制限` per company + bật/tắt `現金` payment method. | E03 `es-kitchen-web-admin` (không phải scope E07) |
| **Company Admin (E02)** | Cấu hình 拠点 (site/branch) và output QR cho từng 拠点. | E02 `es-kitchen-web-company` (không phải scope E07) |
| **Backend (`es-kitchen-api`)** | Cấp guest session, resolve QR code → 拠点 info, xử lý cart/order/payment. | User module (`api/v*/user/*`) |
| **elepay** | Payment gateway — xử lý tất cả method non-cash. | External |

---

## 3. Scope

### 3.1 In scope (từ Excel — 27 items, tổng 12.875 人日 dev + 0.225 人日 requirements)

#### Common

| # | Feature | Estimate (人日) | Ghi chú |
|---|---|---|---|
| 1 | Deploy website mới lên AWS — domain đã sẵn sàng: **PROD `https://es-qr.es-kitchen.co.jp`**, **STG `https://stg-es-qr.es-kitchen.co.jp`**, **DEV `https://dev-es-qr.es-kitchen.co.jp`** | 3.0 | Infra work (BA-10 confirmed) |
| 2 | Output QR code riêng cho từng 拠点 (Admin) — **QR không hết hạn** (permanent per 拠点) | 1.5 dev + 0.225 requirements | Feature ở E03/E02 admin, không phải scope web E07 (BA-02 confirmed) |

#### Menu & Product

| # | Feature | Estimate (人日) |
|---|---|---|
| 3 | 月替わりメニュー表示 (冷蔵 / 冷凍 / 常温 tab) | 1.0 |
| 4 | ソート機能 (theo category: 肉/魚/惣菜/主食/汁物/サラダ・果物/飲料・甘味) | 0.25 |
| 5 | 1日あたりの購入数量制限 (per company config) | 0.25 |
| 6 | 商品情報表示 (name, photo, description, allergen, nutrition, price) + 写真拡大 | 0.5 |
| 7 | カートに入れる | 0.5 |
| 8 | 商品価格 (theo company subsidy) | 0.25 |
| 9 | キーワード検索 (name + category + nutrition) | 0.125 |
| 10 | 絞り込み検索 (category tab) | 0.125 |
| 11 | 商品バーコード読み取る (barcode scan → product detail) | 1.0 |

#### Cart

| # | Feature | Estimate (人日) |
|---|---|---|
| 12 | カート内商品一覧 (hiển thị 拠点ID + product list + total) | 0.25 |
| 13 | 数量の追加・削除 | 0.125 |

#### Payment

| # | Feature | Estimate (人日) |
|---|---|---|
| 14 | 決済内容確認 | 0.125 |
| 15 | 現金 (nếu admin bật) | 0.125 |
| 16 | クレジット/デビットカード (elepay SDK) | 0.25 |
| 17 | PayPay (elepay) | 0.25 |
| 18 | メルペイ (elepay) | 0.25 |
| 19 | au PAY (elepay) | 0.25 |
| 20 | d払い (elepay) | 0.25 |
| 21 | 楽天ペイ (elepay) | 0.5 |
| 22 | Alipay (elepay) | 0.25 |
| 23 | Apple Pay (elepay) | 0.25 |
| 24 | Google Pay (elepay) | 0.25 |
| 25 | 決済完了 screen (success + order # + line items) | 0.5 |

> **Ghi chú:** BA-06 confirmed — **Aeon Pay KHÔNG nằm trong scope**. Figma cần được cập nhật lại để bỏ option này (Designer follow-up).

#### Purchase History & Refund

| # | Feature | Estimate (人日) |
|---|---|---|
| 26 | 購入履歴一覧 (list, có purchase status) | 0.125 |
| 27 | 購入履歴詳細 (product name, date, price, status success/failed) | 0.125 |
| 28 | 返金申請 (trong 30 phút sau khi mua, kèm reason form) | 0.25 |

#### Legal

| # | Feature | Estimate (人日) |
|---|---|---|
| 29 | 利用規約・プライバシーポリシー閲覧 + agree checkbox | 0.25 |

**Tổng:** 12.875 人日 dev + 0.225 人日 requirement = **13.1 人日 ≈ 0.65 人月** (1 dev).

### 3.2 Out of scope (Excel Removed — 25 items)

Explicitly **KHÔNG làm** trong E07 (đã cắt so với E01 Mobile):

- ❌ ログイン · パスワード再設定 · 会員登録 — **guest-first**, không tài khoản
- ❌ チュートリアル (onboarding slides)
- ❌ アレルゲンフィルタリング + アレルギー設定変更
- ❌ お気に入り登録・解除 · お気に入り一覧
- ❌ 商品レビュー (★+ comment)
- ❌ 商品レコメンド (personalized) · ランキング/人気商品
- ❌ **WeChat Pay** (chỉ giữ Alipay cho khách China)
- ❌ プッシュ通知 · 通知履歴 · 通知詳細 · 通知設定 ON/OFF
- ❌ マイページ — ユーザー基本情報 · 基本情報の編集
- ❌ 支払い方法の登録・変更 (default payment method save)
- ❌ ヘルスケアの可視化
- ❌ 運営者用アンケート · 法人用アンケート (希望商品回答)
- ❌ ご意見・要望投稿機能 (feedback form)
- ❌ ログアウト · 退会

**Lý do gạch:** giữ trọng tâm là **one-off ordering flow** — mọi thứ đòi hỏi user profile/session dài hạn đều loại bỏ.

### 3.3 Design assumption (Excel R63)

> "Web デザインにつきましては、現行アプリのデザイン（スマートフォン向けデザインのみ）を活用する前提でお見積りしております"

**UI/UX design effort = 0** trong Excel. Web reuse Figma frames của mobile app hiện tại (`ES-QR` section trong Figma file `VKAAOyoSPvgoB3H2qdeeV3`). Không có `designer-agent` deliverable riêng cho E07 — chỉ adapt/port từ mobile frames.

---

## 4. User flow (chính)

```
1. User quét QR tại 拠点
     ↓
2. Browser mở → /shop/:code
     ↓
3. BE resolve code → 拠点 (id + name + company_id) + cấp guest JWT
   ├─ code hợp lệ → set cookie session + navigate /
   └─ code không tồn tại/sai định dạng → /invalid-code (fallback + link tới app install)
   Note: QR permanent, không có case "expired". Chỉ fail khi code không tồn tại hoặc bị revoke bởi admin.
     ↓
4. Home (Menu list) — /
   - Category tabs (冷蔵/冷凍/常温 hoặc theo category thực tế Home)
   - Search bar (何をお探しですか？)
   - Product cards (photo, name, NEW badge, price, kcal/100g, 短消費期限 tag, cart quick-add)
   - FAB scan button (bottom-right)
     ↓
5a. Tap product → Product Detail — /product/:id
    - Full photo (tap để zoom)
    - Name, description, allergen, nutrition, price
    - Quantity picker + add to cart
5b. Tap FAB scan → Scan — /scan
    - Camera view + barcode overlay
    - Scan barcode → auto-navigate về Product Detail (/product/:id)
    - Message: "商品のバーコードをスキャンしてください"
     ↓
6. Cart — /cart
   - 拠点ID (readonly), 拠点名 (readonly)
   - Product list với qty +/- buttons
   - Total: 合計 (N): XXX 円
   - CTA: 支払い >
     ↓
7. Cart confirm — /cart/confirm
   - Order summary (line items + total)
   - Legal agreement checkbox (Terms + Privacy)
   - CTA: 決済方法を選ぶ
     ↓
8. Payment method — /cart/payment-methods
   - Radio list (10 options — Aeon Pay đã bỏ theo BA-06): クレジット/デビット, Apple Pay, Google Pay, PayPay, d払い, au PAY, メルペイ, 楽天ペイ, Alipay, 現金 (nếu admin bật)
   - CTA: 保存 → redirect sang elepay SDK (non-cash) hoặc confirm dialog (cash)
     ↓
9. Payment processing (external elepay)
     ↓
10a. Payment success — /payment/success
     - ✓ icon + "決済完了" + order #
     - Line item summary
     - CTA: 履歴を見る / トップへ
10b. Payment canceled — /payment/canceled
     - User cancelled at elepay
     - CTA: もう一度支払う / トップへ
10c. Payment pending/failed — /orders/pending
     - Waiting for webhook confirmation hoặc failed
     - Auto-poll status
     ↓
11. Purchase history — /history
    - List past orders (bound to browser cookie/localStorage)
    - Status badge (決済完了 / 失敗)
     ↓
12. History detail — /history/:orderId
    - Product name, purchase date, price, status
    - 返金申請 button (chỉ hiện nếu ≤ 30 phút sau mua)
     ↓
13. Refund form — /history/:orderId/refund
    - Reason textarea
    - CTA: 送信
     ↓
14. Refund result — modal / /refund/success | /refund/failed
14a. Refund success — modal / /refund/success
14b. Refund failed — modal / /refund/failed
```

**Legal flow (parallel):**

- `/legal` — 利用規約 + プライバシーポリシー gộp chung 1 URL (BA-08 confirmed — không tách 2 route)
- Access qua: link ở checkout confirm + footer link

---

## 5. Screens

Screens từ Figma section `ES-QR` (node `27460:56833`). **Screen code convention:** dùng prefix `WP_` cho E07 (Web Payment) — riêng với `UA_` (mobile App) và `AW_/CW_` (admin web). Chi tiết đặt code → xem BA TODO 7.

| Screen Code | Figma node | Vai trò | Route | Figma Link |
|---|---|---|---|---|
| `WP_SHOP_001` | `27460:56836` (Scan variant) hoặc mới | Shop entry (resolve QR) | `/shop/:code` | (TBD) |
| `WP_ERROR_001` | (TBD) | Invalid/expired code fallback | `/invalid-code` | (TBD) |
| `WP_MENU_001` | `27460:59623` (Home) | Menu list — category tab + search + product cards + FAB scan | `/` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-59623 |
| `WP_MENU_002` | `27460:57953` (Empty Data) | Menu empty state (không có sản phẩm) | `/` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-57953 |
| `WP_PROD_001` | `27460:57341` (Product Detail) | Product detail | `/product/:id` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-57341 |
| `WP_PROD_002` | `27460:57650` (None image) | Product detail — no-image fallback | `/product/:id` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-57650 |
| `WP_PROD_003` | `27460:58933` (full img) | Product photo — full-screen zoom | modal | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-58933 |
| `WP_SCAN_001` | `27460:56836` (Scan) | Barcode camera view | `/scan` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-56836 |
| `WP_CART_001` | `27460:58227` (Cart) | Cart list (拠点 info + product qty +/-) | `/cart` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-58227 |
| `WP_CART_002` | `27460:59999` (Cart confirm) | Confirm order trước payment (có legal check) | `/cart/confirm` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-59999 |
| `WP_PAY_001` | (need extract) | Payment method selection | `/cart/payment-methods` | (TBD từ Figma cart flow) |
| `WP_PAY_002` | `29037:150997` (Payment success) | Payment success | `/payment/success` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=29037-150997 |
| `WP_PAY_003` | `27460:59465` (Canceled) | Payment canceled | `/payment/canceled` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-59465 |
| `WP_PAY_004` | `28522:242605` (Pending/失敗) | Payment pending / failed | `/orders/pending` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=28522-242605 |
| `WP_HIST_001` | `27460:59099` (Purchase History List) | Purchase history list | `/history` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-59099 |
| `WP_HIST_002` | `27460:59412` (Purchase History Details) | Purchase history detail | `/history/:orderId` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-59412 |
| `WP_REFUND_001` | `27460:58303` (Purchase Detail with refund) | Refund form (reason input) | `/history/:orderId/refund` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-58303 |
| `WP_REFUND_002` | `28522:242791` (Refund success) | Refund submitted success | modal / `/refund/success` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=28522-242791 |
| `WP_REFUND_003` | `28522:242907` (Refund failed) | Refund failed | modal / `/refund/failed` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=28522-242907 |
| `WP_LEGAL_001` | `27460:58432` (Terms & Privacy) | 利用規約 + プライバシーポリシー gộp 1 page (BA-08 confirmed) | `/legal` | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-58432 |
| ~~`WP_LEGAL_002`~~ | ~~`27460:58463`~~ | ~~Dropped~~ — chỉ dùng 1 URL cho Legal, variant thứ 2 không dùng | — | — |

**Tổng: 20 screens** (WP_LEGAL_002 đã drop theo BA-08).

---

## 6. Acceptance Criteria (per feature)

### AC-01 — Shop entry via QR

- **Given** user quét QR có code hợp lệ (**QR permanent, không có case expired** — BA-02 confirmed)
- **When** browser mở `/shop/:code`
- **Then**:
  - BE resolve code → return 拠点 (id, name, company_id) + guest JWT
  - Set session cookie `httponly` + Secure
  - Navigate `/` (Home)
- **Nếu code không tồn tại / sai format / bị admin revoke:**
  - Navigate `/invalid-code`
  - Hiển thị message + link install app (env `VITE_APP_INSTALL_URL`)

### AC-02 — Home menu display

- **Given** user đã vào Home với guest session hợp lệ
- **When** page load
- **Then**:
  - Load monthly menu của company hiện tại (theo `拠点 → company`)
  - Hiển thị category tabs: **全て / 肉 / 魚 / 惣菜 / 主食 / 汁物 / サラダ・果物 / 飲料・甘味** (thứ tự từ Figma)
  - Product card mỗi item: photo, name, NEW badge (nếu vừa thêm), 短消費期限 badge (nếu hạn ngắn), price (theo company subsidy), kcal/100g, cart quick-add button
  - Search bar: "何をお探しですか？"
  - FAB scan button (yellow, bottom-right)
  - **Không cần xử lý case menu rỗng** (BA-13 confirmed — company luôn có menu cho tháng hiện tại). Screen `WP_MENU_002` (Empty Data trong Figma) chỉ giữ làm defensive fallback, không phải flow chính.

### AC-03 — Category filter

- **Given** user đang ở Home
- **When** tap category tab (VD 肉)
- **Then** list filter theo category, giữ scroll position

### AC-04 — Keyword search

- **Given** user gõ vào search bar
- **When** typing (debounce 300ms) hoặc submit
- **Then** search theo product name + category name + nutrition tags → hiển thị list matched

### AC-05 — Product detail

- **Given** user tap product card
- **When** navigate `/product/:id`
- **Then**:
  - Load full detail: name, photo (tap để zoom fullscreen), description, allergen, nutrition info, price
  - Quantity picker (1 mặc định)
  - CTA: カートに追加
  - Nếu product không có photo → hiển thị placeholder (WP_PROD_002)

### AC-06 — Barcode scan → product detail

- **Given** user tap FAB scan → `/scan`
- **When** camera activated + barcode detected (via `@zxing/browser`)
- **Then**:
  - Validate barcode qua API
  - Nếu match product → auto-navigate `/product/:id`
  - Nếu không match → toast lỗi + giữ scan mode
- **Nếu user deny camera permission:**
  - Hiển thị fallback UI + hướng dẫn bật camera trong browser settings

### AC-07 — Add to cart

- **Given** user tap カートに追加 (từ product detail) hoặc cart button trên card (từ Home)
- **When** click
- **Then**:
  - Thêm item vào cart local (persist `localStorage` — BA-03 confirmed)
  - Toast confirm
  - **Daily limit theo thiết lập của Company** (BA-05 confirmed — BE query company setting, không có logic client-side). Nếu vượt → BE trả error → hiển thị toast "本日の購入上限に達しました"

### AC-08 — Cart page

- **Given** user vào `/cart`
- **When** page load
- **Then**:
  - Hiển thị 拠点ID (readonly, format `CU00000000`) + 拠点名 (readonly)
  - List cart items: thumbnail + name + price + qty +/- buttons + qty number
  - Total row: 合計 (N): XXX 円 (N = số items unique)
  - CTA: 支払い >
  - Nếu cart trống → hiển thị empty state + CTA về Home

### AC-09 — Cart quantity edit

- **Given** user ở `/cart`
- **When** tap + hoặc − ở product row
- **Then**:
  - +: tăng qty, update total (check giới hạn)
  - −: giảm qty; nếu qty = 0 → remove item khỏi cart
  - Update localStorage

### AC-10 — Cart confirm

- **Given** user tap 支払い ở `/cart`
- **When** navigate `/cart/confirm`
- **Then**:
  - Hiển thị order summary (readonly line items)
  - Legal agreement checkbox: "利用規約とプライバシーポリシーに同意します" (link tới `/legal/terms`, `/legal/privacy`)
  - CTA: 決済方法を選ぶ (disabled cho tới khi tick checkbox)

### AC-11 — Payment method selection

- **Given** user tap 決済方法を選ぶ
- **When** navigate `/cart/payment-methods`
- **Then** hiển thị radio list **10 options** (BA-06: Aeon Pay đã bỏ khỏi scope):
  1. クレジット / デビットカード (elepay)
  2. Apple Pay (elepay, iOS Safari only)
  3. Google Pay (elepay, Android Chrome only)
  4. PayPay (elepay)
  5. d払い (elepay)
  6. au PAY (elepay)
  7. メルペイ (elepay)
  8. 楽天ペイ (elepay)
  9. Alipay (elepay)
  10. 現金 — nếu admin bật cho company (config qua E03)
- CTA: 保存 → trigger payment (redirect elepay SDK hoặc show cash confirmation)

### AC-12 — Payment success

- **Given** payment complete (webhook confirmed)
- **When** elepay redirect về `/payment/success` hoặc socket event `chargeSucceeded` nhận được
- **Then**:
  - Hiển thị ✓ icon + 決済完了 message
  - Order number (BE issue)
  - Line item summary + total
  - Clear cart (localStorage)
  - Add order vào purchase history (bind cookie/localStorage)
  - CTA: 履歴を見る (→ /history) hoặc トップへ (→ /)

### AC-13 — Payment canceled

- **Given** user cancel ở elepay page
- **When** elepay redirect về `/payment/canceled`
- **Then**:
  - Hiển thị message "決済がキャンセルされました"
  - Cart giữ nguyên (không clear)
  - CTA: もう一度支払う (→ /cart/payment-methods) hoặc トップへ

### AC-14 — Payment pending / failed

- **Given** payment status = `pending` (chờ webhook) hoặc `failed`
- **When** redirect về `/orders/pending`
- **Then**:
  - Hiển thị loading state + "決済処理中です..."
  - Poll status API mỗi 3s (max 60s)
  - Nếu succeeded → navigate `/payment/success`
  - Nếu failed → hiển thị error + CTA もう一度支払う
  - Nếu timeout → hiển thị "処理に時間がかかっています。履歴からご確認ください" + CTA履歴

### AC-15 — Purchase history list

- **Given** user vào `/history`
- **When** page load
- **Then**:
  - Load orders bound với browser cookie/localStorage session (không phải per-user vì guest)
  - List: thumbnail + product summary + purchase date + total + status badge (決済完了 / 決済失敗)
  - Sort mới nhất trên đầu
  - Empty state nếu chưa có order

### AC-16 — Purchase history detail

- **Given** user tap 1 order từ list
- **When** navigate `/history/:orderId`
- **Then**:
  - Line item detail (name, qty, price)
  - Purchase date + status
  - Total
  - 返金申請 button — **chỉ hiện nếu:**
    - Status = 決済完了
    - Trong vòng **30 phút** kể từ purchase
    - Chưa có refund pending/success

### AC-17 — Refund request

- **Given** user tap 返金申請 trong 30 phút
- **When** navigate `/history/:orderId/refund`
- **Then**:
  - Reason textarea (required, max 500 chars)
  - CTA: 送信
  - Submit → BE create refund request → hiển thị modal success (WP_REFUND_002)
  - Nếu BE error → modal failed (WP_REFUND_003)
  - Sau 30 phút button ẩn — user không thể refund qua web (phải liên hệ admin)

### AC-18 — Legal (Terms + Privacy — 1 URL)

- **Given** user tap link từ checkout confirm hoặc footer
- **When** navigate `/legal`
- **Then** hiển thị 1 trang duy nhất gộp cả 利用規約 + プライバシーポリシー (BA-08 confirmed — không tách 2 route). Content BE serve static hoặc CMS-managed.

### AC-19 — Session persistence

- **Given** user đã có guest session trong cookie
- **When** đóng browser + mở lại + truy cập lại `/shop/:code` cùng
- **Then**:
  - Reuse session cookie (giữ cart + history)
  - Nếu session token expired → refresh silently
  - Nếu 拠点 code khác → clear cart + tạo session mới với 拠点 mới (BA TODO 2)

### AC-20 — Cross-browser/device history warning

- **Given** user chuyển browser/device
- **When** vào lại
- **Then** purchase history KHÔNG carry over (limitation của guest flow — cần communicate với user qua UI note trong /history)

---

## 7. Non-functional requirements

| Category | Requirement |
|---|---|
| **Browser support** | Chrome (latest), Safari iOS 16+, Chrome Android — theo Excel R16–R19 |
| **Test devices** | iPhone X (iOS 16+), Samsung Galaxy A22 (Android 14+) |
| **Performance** | Home load < 2s (3G Fast), TTI < 3s, LCP < 2.5s |
| **PWA** | Manifest + service worker (autoUpdate) — user có thể "Add to Home Screen" (BA TODO 9) |
| **Language** | Japanese (`lang="ja"`) — hardcoded, không i18n cho E07 |
| **Font** | Noto Sans JP variable |
| **Accessibility** | Keyboard nav cho core action (cart qty, payment select), aria labels |
| **Security** | HTTPS only, secure cookie (HttpOnly + SameSite=strict), elepay SDK không lưu card data local |
| **Rate limiting** | BE throttle guest session creation per IP (chống bot QR scanning) |

---

## 8. Data / Integration

### 8.1 API endpoints (cần BE bổ sung / reuse từ `user` module)

| Endpoint | Method | Vai trò | Reuse hay New? |
|---|---|---|---|
| `/api/v1/user/company-qr/resolve` | POST | Resolve QR code → 拠点 + guest JWT | **New** hoặc extend existing `company-qr` controller |
| `/api/v1/user/auth/guest-session` | POST | Refresh guest token | Reuse (đã có `auth` controller) |
| `/api/v1/user/company-menu/list` | GET | Monthly menu list theo company + filter | Reuse |
| `/api/v1/user/product/:id` | GET | Product detail | Reuse |
| `/api/v1/user/product/scan/:barcode` | GET | Resolve barcode → product | **New** hoặc reuse existing scan endpoint |
| ~~`/api/v1/user/cart/*`~~ | — | ~~Cart CRUD~~ — **KHÔNG cần** (BA-03: cart lưu 100% client-side `localStorage`) | Skipped |
| `/api/v1/user/order` | POST | Create order + init payment | Reuse |
| `/api/v1/user/payment-method/list` | GET | List enabled payment methods per company (bao gồm toggle cash) | Reuse |
| `/api/v1/user/elepay-webhook` | POST | Webhook payment status | Reuse (đã có) |
| `/api/v1/user/order/list?session_id=` | GET | Purchase history theo guest session | **New** — cần filter theo session cookie thay vì user_id |
| `/api/v1/user/order/:id` | GET | Order detail | Reuse |
| `/api/v1/user/refund` | POST | Submit refund request | Reuse |
| `/api/v1/user/legal/terms` `/privacy` | GET | Legal content | Reuse |

### 8.2 External integrations

| Service | Vai trò | Ghi chú |
|---|---|---|
| **elepay JS SDK v2** | Payment (all non-cash) | Đã có trong `es-kitchen-webapp-payment/package.json` |
| **@zxing/browser** | Barcode scanner | Đã có |
| **AWS S3** | Product images | Reuse infrastructure |
| **PostgreSQL LISTEN/NOTIFY** | Socket cho payment status (thay Redis) | Reuse pattern của `es-kitchen-api` |

### 8.3 New DB fields cần cân nhắc

- `orders.guest_session_id` (nullable text) — track order theo guest session cookie (thay vì `user_id` cho guest flow). BE cần thêm column hoặc dùng `orders.session_token`. Confirm với Tech Lead Design.
- `payment_methods.aeon_pay_enabled` (nếu confirm Aeon Pay là mới)

---

## 9. Design token (E07)

- **Primary color:** yellow — theme_color PWA hiện là `#fee28a` (warning-200)
  - **BA TODO 8:** Confirm với Designer màu primary chính thức — theo Figma Home hiện tại là `#FAC215` (`colors.primitives.yellow.400` / `colors.semantics.app.400`) — cùng token với E01 Mobile.
- **Font:** Noto Sans JP variable
- **Layout:** mobile-first, max-w-3xl (768px) center trên desktop
- **Border radius:** action = 6px, halfmodal = 8px, modal = 12px (theo design token)
- Component base: shadcn/ui + Base UI + Radix

---

## 10. Dependencies & risks

### Dependencies

| From | To | Ghi chú |
|---|---|---|
| E07 web | `es-kitchen-api` User module | Cần endpoint mới cho `company-qr/resolve`, `product/scan/:barcode`, `order/list?session_id=` |
| E07 web | E03 admin | Config **payment method toggle** (現金 on/off) + **daily purchase limit** per company |
| E07 web | E02 company admin | Config 拠点 + generate QR |
| E07 web | elepay | SDK v2 tích hợp — cùng credentials với mobile app |
| E07 web | AWS | Domain + hosting + S3 assets |

### Risks

| # | Risk | Impact | Mitigation |
|---|---|---|---|
| R1 | Guest session — order lịch sử bị mất khi user đổi browser | Medium | Communicate rõ ràng trong /history UI. Cân nhắc email-linking flow (out of scope Phase 2 nhưng có thể là Phase 3) |
| R2 | Camera permission bị deny → không scan được barcode | Medium | Fallback: manual keyword search / cart quick-add từ list |
| R3 | elepay redirect flow có thể mất session cookie (SameSite issue) | High | Test kỹ trên iOS Safari 16+ (SameSite=strict + third-party redirect) |
| R4 | Design mobile → web adaptation không cover desktop viewport | Low | Fixed max-w-3xl mobile-first, chấp nhận desktop chỉ là container center |
| R5 | 30-phút refund window quá ngắn, user không kịp | Low | Bằng với mobile app hiện tại — nhất quán |
| ~~R6~~ | ~~Aeon Pay chưa xác nhận~~ — **Resolved** (BA-06: bỏ khỏi scope) | — | Designer cần update Figma bỏ Aeon Pay option |
| R7 | Concurrent orders vượt daily limit khi user đổi browser | Medium | BE enforce limit server-side theo **company setting** (BA-05); reset counter hàng ngày |

---

## 11. BA TODOs — Client answers (2026-08-21)

Client đã trả lời tất cả 15 câu — Discovery phase closed. Dưới đây là consolidated answers + impact lên SPEC.

### 11.1 Đã confirmed (13/15)

| # | Câu hỏi | Câu trả lời chốt | Impact lên SPEC |
|---|---|---|---|
| ✅ BA-01 | Cơ chế guest-first | **Guest-first, không có auth** cho end user (admin login vẫn qua E03 riêng) | Section 4 flow giữ nguyên · AC-01 giữ nguyên · Route guard `RequireCompany`/`NoCompanyOnly` |
| ✅ BA-02 | Xử lý QR không hợp lệ | **QR permanent, không hết hạn**. Chỉ fail khi code không tồn tại hoặc bị admin revoke | AC-01 đã cập nhật — bỏ case "expired" · Section 4 flow đã note |
| ✅ BA-03 | Lưu giỏ hàng | **Client-side `localStorage`** (đúng như giả định) | Section 8 API — bỏ endpoint `/api/v1/user/cart/*` · AC-07 đã note |
| ✅ BA-04 | Lịch sử mua bind với gì | **Bind session cookie/localStorage, không cần email link** — chấp nhận limitation đổi browser mất history | AC-19/AC-20 giữ nguyên · Note trong `/history` UI |
| ✅ BA-05 | Daily purchase limit scope | **Theo thiết lập của Company** (BE dùng company setting hiện có, không cần enforce theo IP/fingerprint) | AC-07 đã cập nhật · Risk R7 đã cập nhật |
| ✅ BA-06 | Aeon Pay | **KHÔNG có trong scope** | Section 3.1 payment table không thay đổi (đã đúng — không có dòng Aeon Pay) · Section 4 flow đã bỏ · AC-11 giảm còn **10 methods** · Figma cần Designer bỏ option |
| ✅ BA-07 | Screen code convention | **Dùng prefix mới `WP_*`** | Section 5 đã dùng `WP_*` — không đổi |
| ✅ BA-08 | Legal — số URL | **1 URL duy nhất** hiển thị cả Terms + Privacy | Section 5 — bỏ `WP_LEGAL_002` · Section 4 flow đã gộp · AC-18 đã update route `/legal` |
| ✅ BA-09 | PWA install prompt | **Enable manifest, không chủ động prompt install** | Section 7 giữ nguyên |
| ✅ BA-10 | Domain AWS | **Đã có sẵn 3 environment:** PROD `https://es-qr.es-kitchen.co.jp` · STG `https://stg-es-qr.es-kitchen.co.jp` · DEV `https://dev-es-qr.es-kitchen.co.jp` | Section 3.1 item 1 đã update · DevOps chỉ deploy artifact, không cần domain provisioning |
| ✅ BA-13 | Menu rỗng | **Không có case này** — company luôn có menu tháng hiện tại | AC-02 đã note — `WP_MENU_002` (Empty Data) giữ làm defensive fallback thôi |
| ✅ BA-14 | 短消費期限 badge threshold | **Theo đề xuất — 2 ngày** (align với mobile app) | AC-02 giữ · BE query `expiry_date - now ≤ 2` để trả flag `is_short_expiry` |
| ✅ BA-15 | Order # format | **Reuse format hiện có trong repo `es-kitchen-api`** | Tech Lead Design cần grep source `es-kitchen-api` (module `user/order`) để confirm format thực tế |

### 11.2 Follow-up cần verify (2/15 — không block Design phase)

| # | Câu hỏi | Câu trả lời | Cần làm gì |
|---|---|---|---|
| ⚠️ BA-11 | Màu primary chính thức | Client trả lời ngắn "Designer" — không rõ là **(a) chờ Designer confirm** hay **(b) hỏi Designer** | **Action:** BA/PM liên hệ Designer bên client — confirm chính thức: primary `#FAC215` (yellow) và đồng bộ `theme_color` PWA manifest từ `#fee28a` → `#FAC215`. **Không block** Design phase vì màu có thể adjust khi FE implement. |
| ⚠️ BA-12 | Số lượng lịch sử mua cap | Client trả lời "Lấy từ FIGMA URL" — Figma không explicit về cap | **Action:** Designer/Tech Lead cần kiểm tra Figma cụ thể node `WP_HIST_001` xem có show limit không. Nếu không → default **không cap** (paginate 20 items/lần load, infinite scroll). |

### 11.3 Follow-up phát sinh từ answers (mới)

| # | Câu hỏi mới | Lý do phát sinh | Priority |
|---|---|---|---|
| BA-16 | Khi admin revoke QR (BA-02), user đang có session active với 拠点 đó — có force logout ngay hay chờ user thao tác tiếp mới detect? | BA-02 mention "bị admin revoke" — cần define UX | Medium — hỏi Client PM |
| BA-17 | Legal content (Terms + Privacy 1 URL) — nội dung do ai cung cấp? Là markdown/HTML/plain text? Có versioning không? | BA-08 chốt 1 URL nhưng chưa rõ content source | High — hỏi Client PM + Legal |
| BA-18 | Format Order # trong repo `es-kitchen-api` hiện là gì (VD `ORD-YYYYMMDD-XXXXX`)? | BA-15 nói reuse existing → cần Tech Lead grep xác nhận | Low — Tech Lead grep trong Design phase |

---

## 12. Estimation summary

| Category | 人日 |
|---|---|
| 要件定義 (requirement) | 0.225 |
| UI/UX design | **0** (reuse mobile Figma) |
| 実装 (implementation) | 12.875 |
| **合計** | **13.1 人日 (~0.65 人月)** |

**Timeline assumption** (1 dev, 20 working days/month):
- **Requirement + design confirm:** ~1 week (bao gồm answer 15 BA TODOs)
- **Dev + unit test:** ~3 weeks
- **QA (integration + regression):** ~1 week
- **UAT + deploy:** ~0.5 week
- **Tổng from kick-off to prod:** ~5–6 weeks

Chi tiết timeline, phase gate G1–G6 → PM agent lập PLAN.md.

---

## 13. Reference

- Excel estimation: `ai-memories/【ESキッチン様】Estimation_WebApp_OneQR_20260801_WIP.xlsx`
- Figma section ES-QR: https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=27460-56833
- Existing E01 Mobile app: `es-kitchen-repository/es-kitchen-payment-app`
- Existing E07 web scaffold: `es-kitchen-repository/es-kitchen-webapp-payment` (structure/patterns docs → `docs/frontend/es-kitchen-webapp-payment/overview/`)
- Related backend API doc: `docs/backend/es-kitchen-api/overview/api-catalog.md` (User module — 26 controllers)
- Design token: `.claude/rules/design_rule.md`
- Screen code rule: `.claude/context/business-flows/screen-code-rule.md`

---

## 14. Handover — Bước tiếp theo

✅ **Discovery closed** — 13/15 BA TODOs đã confirmed, 2 mục follow-up không block (BA-11 màu primary, BA-12 history cap) + 3 câu hỏi mới phát sinh (BA-16/17/18) — có thể xử lý parallel với Design phase.

### Workflow tiếp

1. **Designer follow-up** (parallel, không block):
   - Cập nhật Figma bỏ Aeon Pay khỏi payment method list (theo BA-06)
   - Confirm màu primary chính thức `#FAC215` (BA-11)
   - Verify Figma node `WP_HIST_001` có cap số lượng không (BA-12)
2. **QC agent** (parallel với 3): sinh test cases từ SPEC này (`/test/generate_manual_testcases_rbt`)
3. **Tech Lead Design** (start ngay):
   - `es-kitchen-api/DESIGN.md` — new endpoints (`company-qr/resolve`, `product/scan/:barcode`, `order/list?session_token=`) + reuse User module hiện có
   - `es-kitchen-webapp-payment/DESIGN.md` — route config theo section 5, zustand store, service layer, elepay integration
   - Tech Lead grep `es-kitchen-api` để confirm format Order # (BA-18)
4. **Tech Lead Tasks** — phân rã tasks (Phase 1 DB migration → Phase 2 API → Phase 3 FE → Phase 4 Integration)
5. **PM agent** — làm PLAN.md với timeline 5–6 weeks, mark deps giữa các phase

### Prompt gợi ý cho next step

```
"Hãy là Tech Lead Design, làm DESIGN.md từ SPEC: es-kitchen-docs/docs/features/webapp-payment-oneqr/SPEC.md"
```

```
"Hãy là QC, sinh test cases từ SPEC: es-kitchen-docs/docs/features/webapp-payment-oneqr/SPEC.md"
```

### Follow-up hỏi client (async, không block)

Prompt gợi ý gửi Client PM:
> Xin xác nhận thêm 3 điểm sau (không block bắt đầu code, nhưng cần trước khi test):
> 1. **BA-11** — Màu primary chính thức của E07 là `#FAC215` (yellow, giống mobile app E01)? Và `theme_color` PWA cập nhật từ `#fee28a` → `#FAC215` được chưa?
> 2. **BA-16** — Khi admin revoke QR của 1 拠点, user đang có session active với 拠点 đó — muốn force logout ngay hay chờ user thao tác tiếp mới báo lỗi?
> 3. **BA-17** — Nội dung Legal (Điều khoản + Chính sách) do ai cung cấp? Format markdown/HTML/plain text? Có versioning (v1/v2) không?
