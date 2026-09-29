# 21 — WebApp ES_QR (mua hàng quét mã tại quầy · mobile web) — YELLOW

> Repo: **WebApp MỚI thêm vào Phase 2** (✅ user confirm 2026-09-29) — chưa có repo trong Ecosystem; ghi "repo: TBD (new)" trong handover · Screen prefix `UA_` (vd `[UA_PROD_001] Product Detail _ New`)
> Ref: `refs/esqr_home.png` · Figma section "Update NEW" `31896:133017` (Home `31077:435460`, Product Detail, Cart, Scan, Cart (Sản phẩm hết hạn) Countdown — "LUỒNG XỬ LÝ MUA NHẦM HÀNG VÀ TỒN KHO V3", update 11/09).
> Cùng ngôn ngữ thị giác với `20-mobile-app-user.md` (yellow, sheet bo 24) — đọc file 20 trước cho component chung (stepper, footer, input).

## 1. Frame & theme

- **390 × 844**, status bar 44. Nền ngoài sheet: `app/200 #FEE28A` (vàng nhạt) thay cho ảnh mây.
- Primary: gradient `#FAC215 → #FFC562`, glow `cta main`; accent `app/500 #EAB308`.

## 2. Home (danh mục + danh sách)

| Khối | Spec |
|---|---|
| Header (y 44, h 48, pad 12, gap 16) | nút menu 36 (nền `admin/50 #FFF9EB`, viền `#F5F5F5`, radius 9, icon List 24) · ô search trắng radius 8 **viền `#FAC215`** + glow vàng, pad 10/14, placeholder 「何をお探しですか？」 16 `text/low`, icon search 20 |
| Main sheet | trắng, radius top 24, drop-shadow 0 -4 6 `rgba(225,183,74,.5)` |
| **Category grid** | 2 hàng × 4 ô **97.5×97.5**, viền dashed `divider/low`; ảnh món 56 + nhãn 14 (全て · 肉 · 魚 · 惣菜 · 主食 · 汁物 · サラダ・果物 · 飲料・甘味) |
| Page indicator | track 45×4 `neutral/100` radius full + thumb 18×4 `app/500` |
| **Product Card** (list, pad 16 dọc, border-bottom `divider/low`, gap 14) | ảnh 68 (radius 12/4) + nút tim 24 tròn góc (tuỳ) · tên 14/20 Medium `#0A0A0A` · hàng Tag · giá 「100円」 16 Bold `#CF222E` │ divider 1px │ 「161kcal/100g」 14 `text/low` · **nút giỏ 40×40** vàng (icon ShoppingCart 20) góc phải dưới |
| Tag (outline, radius 4, pad 0/8, 12 bold ls 5%) | 残りわずか · NEW → `#E60012` · 短消費期限 → `warning/500 #EAB308` |
| **FAB スキャン** | tròn 72, gradient `#FAC215 → #FFF9EB`, shadow 0 4 10 `#00000040`, icon Barcode 28 + 「スキャン」 12 Bold `text/middle`; góc phải dưới (x ≈ 75%, y 721) |

## 3. Product Detail

- Ảnh hero full-width (~390×200) · tên 16 Medium · Tag · giá 20 Bold đỏ + nút giỏ · mô tả 12–14 + 「⌄ もっと見る」 · card 「栄養成分」 (nền `neutral/50`, bảng エネルギー / たんぱく質 / 炭水化物 / 脂質) · footer 「合計 (4)：400 円」 + 「カートへ ›」.
- **Hết hàng**: ảnh phủ đen 50% + chữ 「在庫なし」 trắng 20; trong list: nhãn đỏ 12 「利用者にもう提供されていません」.

## 4. Cart & luồng tồn kho (V3)

- Cart dùng lại pattern file 20 (拠点ID CUxxxxxxx read-only, 拠点名, 商品リスト + すべてクリア, stepper, footer 支払い).
- Sản phẩm **hết hạn / countdown**: Tag đỏ 「賞味期限」 cạnh tên + dòng lỗi đỏ 12 「30分経過しています。お手元にある商品の場合はバーコードをスキャンしてください。」 + nút outline nhỏ 「スキャンする」.
- Scan barcode: ảnh camera trong khung radius 16 + sheet vàng mây dưới + 「商品のバーコードを スキャンしてください。」.
- Popup thêm giỏ: 「商品をカートに追加しました！」 16 Bold + tên SP · 「続けてスキャン」 (outline) · 「カートへ ›」 (yellow).
- Popup xác nhận hàng trên tay (khi tồn kho hết): 「商品がお手元にあることを確認されましたか?」 · 「戻る」 (outline) · 「確認」 (yellow).

## 5. Definition of Done — ES_QR
- [ ] 390×844, nền `#FEE28A`, sheet bo 24.
- [ ] Category grid 4 cột dashed; product card đủ tag/giá/kcal/nút giỏ.
- [ ] FAB スキャン trên màn danh sách.
- [ ] Đủ state: còn hàng · hết hàng · hết hạn countdown · popup.
- [ ] Handover ghi rõ đây là WebApp mới (chưa có repo).
