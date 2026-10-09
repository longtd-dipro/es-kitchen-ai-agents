# 20 — User Mobile App (E01 · iOS/Android · Flutter) — YELLOW

> Repo: `es-kitchen-payment-app` (Flutter, `flutter_screenutil` baseline 390×844) · Screen prefix `UA_`
> Ref: `refs/mobile_cart.png`, `refs/mobile_flow_overview.png` · Figma section `29112:212045` (Cart `29112:180796`, Scan ×4, `[UA_PAYM_001] Payment Details Confirmation`).

## 1. Frame & safe area

- **390 × 844** (KHÔNG 375×812). Status bar iOS 44 (`System / Status Bar`, giờ 「9:41」). Home Indicator 21 (thanh 139×5 `#08121A` 50%).

## 2. Theme (yellow "App")

| Vai trò | Giá trị |
|---|---|
| CTA / stepper / action | gradient dọc `#FAC215` → `#FAC215` (50%) → `#FFC562`, viền 1–2px `#FAC215`, radius 8, shadow `cta main` (glow vàng) |
| Chữ trên CTA vàng | `text/high #24292F` Medium (KHÔNG trắng) |
| Nhấn/hover | `#CA9A04` (`app/600`) |
| Nền nhạt | `#FEF9E8` (`app/50`), `#FFF9EB` (`admin/50`) |
| Giá tiền / số tổng | `#CF222E` |
| Link | `#1480FF` gạch chân (「カードを追加する」) |
| Variant Button library | `theme=App` |

## 3. Cấu trúc màn chuẩn (Cart / Payment confirm)

```
┌ header 390×200 (ảnh minh hoạ bầu trời mây vàng, crop) ┐
│  Status bar 44                                        │
│  Title bar 48: [‹ 36] ─── 「カート」 18 Medium ─── [36] │
└───────────────────────────────────────────────────────┘
┌ Main sheet (y=100) white, radius top 24, pad 16, gap 16 ┐
│  shadow 0 -4 12 rgba(225,183,74,.5)                     │
│  … nội dung cuộn …                                       │
└──────────────────────────────────────────────────────────┘
┌ footer 390×85 white, radius top 20, shadow 0 -4 12 #0000000D ┐
│  cart info 64: 「合計 (4)：400 円」 18 ─────── [支払い ›] 40 │
│  Home Indicator 21                                          │
└─────────────────────────────────────────────────────────────┘
```

## 4. Components đặc thù

| Component | Spec |
|---|---|
| **Input with Title (inline)** | label trái `Text md/Bold` 16 `text/middle` (+ `*` đỏ 18) rộng ~60 · gap 6 · input 36–40, radius 6, viền `neutral/200`, pad 8/12, icon phải 20 (vd `Icon/QrCode`) |
| Input read-only | nền `gray/50 #F6F8FA`, viền `neutral/100`, chữ 16 `text/high` |
| Input lỗi | viền `#CF222E` + message 12 đỏ dưới 「有効な拠点IDを入力してください。」 |
| Note ※ | 14/20 `text/middle`, mỗi dòng bắt đầu 「※」 |
| Section header | 「商品リスト」 16 Medium `text/high` + nút outline nhỏ phải (32, viền `neutral/200`, icon thùng rác 18 + 「すべてクリア」 14 Medium) |
| **Product in cart** (row) | pad 12/0, border-bottom `divider/low`; ảnh 48 radius 4 · tên 14 Medium `text/high` (ellipsis) · giá 「100円」 16 Medium `#CF222E` · **stepper** phải: [−] 32 · số 16 Medium (w 22) · [+] 32, gap 8 — nút = yellow action |
| Product (confirm, compact) | cao 48: ảnh 32 · 「1点」 · tên · giá phải |
| Payment details | 「支払い詳細」 16 Medium · dòng 「合計金額 (4個)：」 + 「400円」 đỏ phải |
| Payment method row | icon thẻ 32 · 「クレジット / デビットカード」 14 + link 「カードを追加する」 · caret-right 20 |
| Footer cart info | 「合計」 18 Regular · 「(4)」「400」 18 Medium đỏ · 「円」 · CTA 「支払い ›」 (yellow, h 40, pad 12) |

## 5. Màn Scan (QR/拠点ID)

- Nền ảnh camera phủ tint vàng + khung ngắm 4 góc bo (viền trắng/xám 3px).
- Nút phải trên 「⌨ 手入力」 (chip trắng). Ở trạng thái chưa quét: mascot + text 「拠点のQRコードを スキャンしてください。」 16 Bold căn giữa.
- Nhập tay: bottom sheet trắng radius top 16: Input with Title 拠点ID* + note ※ + CTA full-width 「続き →」 (yellow, h 48–52, radius 8).
- Popup gợi ý tải app (card trắng + QR + App Store/Google Play) đè trên.

## 6. Definition of Done — Mobile App
- [ ] 390×844, status bar + home indicator.
- [ ] Header ảnh mây vàng + main sheet bo 24 + shadow vàng.
- [ ] CTA/stepper là gradient vàng chữ tối, có glow.
- [ ] Giá đỏ `#CF222E`, font Noto Sans JP, không emoji.
- [ ] Mọi state: default · filled · error · empty cart · loading (skeleton `#D0D7DE`).
- [ ] Ghi chú cho FE: sizing dùng `.w/.h/.sp` (screenutil) — không hard-code.
