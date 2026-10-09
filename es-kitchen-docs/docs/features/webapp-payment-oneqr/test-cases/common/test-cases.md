# Test Cases — Common | webapp-payment-oneqr

> **Feature:** webapp-payment-oneqr (E07 Web Payment One QR)
> **Module:** Common — QR Entry, Session, Error fallback
> **AC cover:** AC-01, AC-19, AC-20
> **Mode:** QUICK
> **Actor:** End User (Guest)
> **Ngày:** 2026-09-10
> **Figma:** Refined 2026-09-10 — module này chủ yếu là **backend/redirect flow, UI element ít**. WP_SHOP_001 và WP_ERROR_001 chưa có Figma node xác định (SPEC ghi TBD). TC dưới đây cross-ref API contract và session behavior, không phải element UI cụ thể.

**Figma UI baseline:**
- `WP_SHOP_001` (/shop/:code): **Figma node TBD** — SPEC section 5 ghi "node `27460:56836` (Scan variant) hoặc mới". Screen là redirect page (ngắn, transient) — UI ít, chỉ cần loading state ngắn trước khi navigate về `/`.
- `WP_ERROR_001` (/invalid-code): **Figma node TBD** — chưa có mockup. TC dựa trên AC-01 (message + link install app từ env `VITE_APP_INSTALL_URL`).
- `WP_HIST_001` — dùng cho TC cross-browser (xem module history để có Figma detail).

---

## Test Cases

| TC ID | Tiêu đề | Preconditions | Steps | Expected Result | Priority | Screen Code |
|---|---|---|---|---|---|---|
| TC_WP_COM_001 | QR hợp lệ — navigate thành công về Home | Không có session. QR code hợp lệ `ABC123` đã tồn tại trong DB và chưa bị revoke. | 1. User quét QR → browser mở `https://dev-es-qr.es-kitchen.co.jp/shop/ABC123` | - BE `POST /api/v1/user/company-qr/resolve` → trả 拠点 info (id, name, company_id) + guest JWT<br>- Cookie `httponly; Secure; SameSite=strict` được set<br>- Browser redirect về `/` (Home — WP_MENU_001)<br>- Home load monthly menu của company tương ứng | Critical | `WP_SHOP_001` (⚠️ node TBD) |
| TC_WP_COM_002 | QR không tồn tại — hiển thị invalid-code page | Không có session. | 1. Browser mở `/shop/INVALID999` (code không có trong DB) | - BE trả lỗi 404 (hoặc equivalent)<br>- Browser redirect `/invalid-code` (WP_ERROR_001)<br>- Hiển thị message lỗi tiếng Nhật (VD "QRコードが見つかりません")<br>- Có link install app từ env `VITE_APP_INSTALL_URL` (button hoặc link)<br>- **⚠️ Figma node cho WP_ERROR_001 TBD** — layout chưa xác định | Critical | `WP_ERROR_001` (⚠️ node TBD) |
| TC_WP_COM_003 | QR sai format — hiển thị invalid-code page | Không có session. | 1. Browser mở `/shop/` (code rỗng)<br>2. Browser mở `/shop/<script>alert(1)</script>` (XSS attempt) | - Cả 2 case redirect `/invalid-code`<br>- Không execute script (input được URL-encode và sanitize server-side)<br>- Không crash server (BE reject early, không log payload thô)<br>- Message hiển thị đúng như TC_WP_COM_002 | High | `WP_ERROR_001` (⚠️ node TBD) |
| TC_WP_COM_004 | QR bị admin revoke — hiển thị invalid-code page | QR code `REVOKED01` đã tồn tại trước nhưng admin E03 đã revoke. | 1. Browser mở `/shop/REVOKED01` | - BE detect code bị revoke (VD `revoked_at IS NOT NULL`) → redirect `/invalid-code`<br>- Hiển thị message + link install app<br>- BA-16 open question: user đang có session active với 拠点 bị revoke — force logout ngay hay chờ next action (Follow-up chưa confirm) | High | `WP_ERROR_001` (⚠️ node TBD) |
| TC_WP_COM_005 | Session tồn tại — reuse khi quét lại cùng QR | User đã có guest session cookie hợp lệ từ lần quét trước. Cart có 2 items trong localStorage. | 1. Đóng browser<br>2. Mở lại browser<br>3. Quét QR cùng code `ABC123` → mở `/shop/ABC123` | - BE detect session cookie còn hiệu lực → skip generate new JWT, reuse<br>- Cart 2 items vẫn còn (localStorage cùng origin)<br>- Redirect về Home bình thường<br>- Không có prompt "khôi phục session" (silent reuse) | High | `WP_SHOP_001` (⚠️ node TBD) |
| TC_WP_COM_006 | Session token hết hạn — refresh silently | Guest session cookie tồn tại nhưng JWT đã expired (VD test bằng cách set token expiry ngắn). | 1. User truy cập bất kỳ page nào của app (VD `/history`) | - App detect 401 từ BE → auto gọi `POST /api/v1/user/auth/guest-session` để refresh token<br>- Không hiển thị dialog/redirect về `/invalid-code`<br>- Page load bình thường sau refresh<br>- Không có visible flicker (background refresh) | High | (bất kỳ page) |
| TC_WP_COM_007 | Quét QR 拠点 khác — clear cart + tạo session mới | User có session với 拠点 `CU00000001` (cart có 1 item, localStorage `es-kitchen-cart` có data). QR code `XYZ456` thuộc 拠点 `CU00000002`. | 1. User quét QR `XYZ456` → mở `/shop/XYZ456` | - BE resolve `XYZ456` → 拠点 `CU00000002`<br>- App detect 拠点 khác → **clear localStorage cart** (theo BA TODO 2, xác nhận behavior)<br>- Tạo session mới với 拠点 mới<br>- Redirect về Home của 拠点 `CU00000002` — menu load theo company mới<br>- **Cần confirm với BA:** có show warning "Cart cũ sẽ bị xóa" không? | High | `WP_SHOP_001` (⚠️ node TBD) |
| TC_WP_COM_008 | Cross-browser — history không carry over | User đã mua hàng trên Chrome. Mở Safari cùng thiết bị. | 1. Mở Safari → quét cùng QR → vào `/history` | - Danh sách history trống (không thấy order từ Chrome)<br>- Hiển thị UI note: "**購入履歴は現在のブラウザのみ表示されます**" (hoặc tương đương)<br>- Note render trong UI, không phải toast tạm thời<br>- (Xem module history để verify UI note chính xác từ Figma WP_HIST_001) | Medium | `WP_HIST_001` |
| TC_WP_COM_009 | Cookie secure — không có HTTPS thì không gửi | Môi trường test có HTTP redirect sang HTTPS. | 1. Thử truy cập bằng `http://dev-es-qr.es-kitchen.co.jp/shop/ABC123` | - Tự động 301/302 redirect sang HTTPS<br>- Cookie `Secure` flag — không bị gửi qua HTTP request<br>- Session cookie chỉ có trên HTTPS traffic (verify qua DevTools Application → Cookies) | High | `WP_SHOP_001` (⚠️ node TBD) |

---

## Traceability — AC → TC

| AC ID | TC IDs cover |
|---|---|
| AC-01 | TC_WP_COM_001, TC_WP_COM_002, TC_WP_COM_003, TC_WP_COM_004 |
| AC-19 | TC_WP_COM_005, TC_WP_COM_006, TC_WP_COM_007 |
| AC-20 | TC_WP_COM_008 |
| Non-functional (Security) | TC_WP_COM_003, TC_WP_COM_009 |

---

## Figma observations

- **🔴 WP_SHOP_001 node TBD:** SPEC section 5 ghi "node `27460:56836` (Scan variant) hoặc mới" — chưa quyết định. Trong thực tế `/shop/:code` là redirect transient (BE resolve → set cookie → 302 về `/`), UI chỉ cần loading spinner ngắn. **Recommend:** Designer bỏ Figma node dedicated cho screen này, chỉ cần loading component reuse.
- **🔴 WP_ERROR_001 node TBD:** SPEC không có Figma URL. Cần Designer tạo mockup cho `/invalid-code`: message tiếng Nhật + link install app (button styling theo design system yellow `#fac215` để consistent với các CTA khác).
- **🟡 BA-16 chưa confirm:** Khi admin revoke QR mà user đang có session — force logout hay grace period? TC_WP_COM_004 hiện đánh dấu open question.
- **🟡 BA TODO 2 (拠点 switch):** SPEC AC-19 chỉ ghi "拠点 code khác → clear cart + tạo session mới". Behavior tại UI chưa rõ (warning modal vs silent clear). TC_WP_COM_007 note cần confirm.
- **🟢 Non-functional security:** TC_WP_COM_003 và TC_WP_COM_009 độc lập với Figma — kiểm tra backend behavior và cookie flags.
