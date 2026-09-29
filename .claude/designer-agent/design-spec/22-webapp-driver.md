# 22 — WebApp Driver (E06 · 配送ドライバー · mobile web) — BLUE (+ COOL purple)

> Repo: `es-kitchen-webapp-driver` (React 19 · shadcn/ui + Base UI · Lucide — FE map icon Phosphor→Lucide) · Screen prefix `DA_`
> Ref: `refs/driver_home_DA_HOME_001.png`, `refs/driver_cool_DA_COOL_001.png` · Figma `33034:353615` "🚀 COOL配送便 (V1.0)" (DA_HOME_001, DA_COOL_001 - 01/02/03, DA_DLVR_001, DA_RECV_001 - 6/7).

## 1. Frame & theme

- **390 × 844** (màn dài → cao theo nội dung, vd 1028). Nền app `#FAFAFA`. **Không có status bar giả** (web app).
- Primary `#0969DA` (`company/500` — tên ngược). Accent **COOL便** `#5A3AE9` / nền `#ECE8FC`.
- Card: trắng, radius 8, viền `divider/low`, shadow `box-shadow/stick`.

## 2. Header (390 × 64)

- Trắng, pad 12/20, shadow 0 1 3 `#0000001A`.
- Trái: nút tròn 40 (trắng, viền `#F1F5F9`, drop 0 1 1 `#0000000D`, icon CaretLeft 24). Giữa: title 18 Medium `text/middle` (「COOL便」「荷物受取」). Phải: nút tròn 40 icon **Siren** (báo トラブル).

## 3. Home (DA_HOME_001)

- Hero: minh hoạ xe tải ES KITCHEN + mascot + logo ESSTATION trên nền trời/thành phố; bong bóng chat trắng 「**Mochiduki** さん、安全運転で いってらっしゃいませ。」 (tên blue); nút chuông tròn 40 phải.
- **KPI card** (trắng, viền 1px `#0969DA`, radius 8): 3 cột — icon 24 + số 20 Bold blue + nhãn 12: 本日の配送件数 10 · 完了件数 2 · 残り件数 8; dưới: 「本日の進捗」 12 blue + progress bar (track `neutral/100`, fill `#0969DA` với nhãn 「20%」 trắng).
- Sheet trắng radius top 24: 「配送予定一覧」 16 Medium · 「■本日（2026-6-1）」.
- **Delivery card** (list): icon tile 36 radius 8–12 (kho = orange, COOL = purple `#5A3AE9`, ES = blue minh hoạ) · tên 16–18 Medium · Tag phải (未受取: nền `warning-100` chữ `#854D0E`; 未配送: outline warning) · dòng địa chỉ icon pin 14 + 12–14 `text/middle` · hàng metric (icon 14 + số blue Medium + đơn vị: 2 社 · 4 箱 · 500 品 · ❄ 500 品) · chip 「非表示 ⌃」 (pill trắng viền) để thu gọn.
- **Bottom tab bar** (h ~64 + safe): 5 mục ホーム · マニュアル · 配送一覧 · トラブル · アカウント — icon 24 + nhãn 10–12; active blue, còn lại `text/low`.
- Toast thành công (320×48, top 52): nền blue, icon check tròn + 「荷物配送完了しました。」 trắng + X.

## 4. COOL便 detail (DA_COOL_001)

1. **Order card** nền `#ECE8FC` radius 8 pad 12: icon tile 36 nền `#5A3AE9` radius 12 + tên công ty 16 Medium (2 dòng) · divider · icon CalendarBlank 20 + 「2026-06-12（月）」 14 · Tag 「未配送」 (outline warning) / 「配送完了」 (outline success).
2. Tiêu đề section 16 Medium `text/middle`: 「納品先情報」.
3. **Info card** (trắng, viền, radius 8, pad 12, gap 8): hàng label 70px `text/low` 14/22 + value `text/high` 14/22, divider giữa các hàng: 納品先 · 郵便番号 · 住所 · 担当者 · 電話番号 · 納品備考 → **Inline message** nền `#ECE8FC` viền `#5A3AE9` radius 8 pad 12 icon WarningCircle 24 + text 14.
4. 「荷物情報」 → **List card**: header nền `#ECE8FC` pad 12: 3 metric (icon Package 20 + số 16 Medium `#5A3AE9` + đơn vị: 3 箱 · 10 品 · ❄ 20 品); rows: 「1 📦 2107-6228-5031」 14 + checkbox 20 (checked nền `#5A3AE9` radius 2) phải, divider.
5. **Bottom Nav CTA** (h 80, trắng, drop 0 -6 4 `rgba(116,116,116,.1)`, pad 16): nút full-width **52**, radius 8, nền `#0969DA`, viền 2 `#0969DA`, glow blue, chữ 「完了」 18 Bold trắng. Disabled (chưa check hết): nền `neutral/200` chữ `text/low`.
6. State 03 successly: dưới header có **status band** (h 72): icon tròn 32 success + 「荷物の配送は完了しました。」 16 + meta 12 thời gian.

## 5. Popup xác nhận (DA_RECV_001)

- Card 342 rộng, radius 12, pad 16, nút X 40 góc phải; ảnh minh hoạ (thùng hàng vàng) 163×168 giữa.
- Tiêu đề 16 Bold căn giữa 「荷物の配送は完了しましたか？」 + mô tả 14 `text/middle`.
- Checkbox 「本配送分は、ESキッチンへ連絡済みです。」.
- Nút dọc (gap 16, full 310): 「ESへ電話する (050-5784-2777)」 solid blue 48 · 「一部未配送のまま完了」 outline blue 52 (**disabled** cho tới khi check checkbox hoặc đã gọi ES) · 「キャンセル」 neutral outline 52.

## 6. Definition of Done — Driver
- [ ] 390×844, nền `#FAFAFA`, header 64 với nút tròn 40.
- [ ] Blue cho CTA/tab/KPI; purple chỉ cho ngữ cảnh COOL便.
- [ ] CTA bottom 52 full-width có glow; state disabled.
- [ ] Bottom tab 5 mục (màn cấp 1) hoặc bottom CTA (màn chi tiết).
- [ ] Note cho FE: shadcn/ui + Lucide tương đương.
