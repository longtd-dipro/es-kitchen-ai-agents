# 12 — Company Web (E02 · Company Admin · 法人Web) — ORANGE

> Repo: `es-kitchen-web-company` · Screen prefix `CW_` · Ref: `refs/company_list_CW_ORDER_003.png`
> Figma section `27216:392900` (CW_ORDER_002/003, Order_ default_grid/list, Survey, CW_BIND_002, Modal 682×753, UA_CPSV_001 mobile survey, AW_CORPORATE_001).
> Kế thừa toàn bộ `10-desktop-web-shell.md`.

## 1. Theme

| Vai trò | Hex | Variable Figma |
|---|---|---|
| primary (nav active, 登録 solid, tab active, 検索 outline) | `#F4860C` | `admin/500` ⚠️ tên ngược |
| hover / pressed | `#D86107` | — |
| sub-menu active bg | `#FFEFDE` | `50 orange` |
| summary card bg | `#FFF9EB` | `admin/50` |
| summary card border | `#FDDA8A` | `admin/200` |
| outline button border (nhạt) | `#FEEDC7`–`#FDDA8A` | `admin/100–200` |
| Button theme variant | `theme=Admin` | |
| Logo orange (chỉ logo) | `#FAA51D` | brand |

- Chữ trắng trên `#F4860C` chỉ ~2.9:1 → nhãn trên nền primary **Bold ≥ 14–16px**.
- Link tên sản phẩm trong bảng: blue `#0969DA` **gạch chân**.

## 2. Sider menu (thực tế)

売上集計 ▾ · ユーザー一覧 · 配送管理 ▾ · 法人・契約管理 ▾ · **月次注文** ▾ (▸ 商品注文 · 資材注文 · 注文履歴).

## 3. Pattern trang đặc thù

### 3.1 Tab cửa hàng / 拠点 (dưới page title)
- Hàng tab ngang: 「東京本社 (登録済)」 active = chữ `#F4860C` 16 Medium + gạch dưới 2px orange; tab khác `text/middle`. Nhãn phụ trong ngoặc 10–12 `text/low` (デフォルト / ES登録済 / 中止).

### 3.2 商品注文 (CW_ORDER_003) — toolbar
- Trái: 「プラン **100** スタンダード」 (số 20 Bold).
- Phải (cao 32–40, gap 12): 「AIの提案で注文」 (outline orange + icon) · 「アンケート」 (outline orange + icon) · 「変更履歴確認」 (neutral outline + icon) · 「キャンセル」 (neutral outline) · 「登録」 (solid orange).
- Search panel: vạch trái orange; ô search có icon kính lúp placeholder 「商品名、詳細情報、原材料、アレルゲン情報」; Select カテゴリ/保存方法/商品タグ; checkbox 短消費期限なし; クリア (neutral outline) + 検索 (outline orange).

### 3.3 Thẻ tổng hợp (summary card)
- Nền `#FFF9EB`, viền `#FDDA8A`, radius 8, pad 12–16, chia cột bằng divider dọc.
- Cột 合計: 「合計 **200**/200個」 số 18–20 orange; dòng TempTag 冷蔵・常温 160/200個, 冷凍 40/200個.
- Cột 第1便…第4便: nhãn 12 `text/low` + ngày 「8月1日」 + số 「50 個」 20.
- Nút 「統計」 outline orange.

### 3.4 Bảng đặt hàng
- Cột: No · ☐ · 写真 (thumb 32 radius 4) · 商品名 (link) · カテゴリ · 商品タグ (Tag outline: おすすめ green, 短消費期限 red, NEW blue) · 短消費期限 · アンケートスコア (「420点」 bold + 「10人/100人」 12) · 定価 · 第1便…第4便 (**stepper**) · 合計数.
- **Stepper**: nút − (viền đỏ/orange, icon −) · số 16 · nút + (viền orange, icon +), mỗi nút 24–28 vuông radius 4.
- Toggle list/grid (segmented 2 icon) phải trên bảng; 「全てチェック」 checkbox trái.
- `Order_ default_grid`: dạng lưới card sản phẩm (ảnh + tên + tag + stepper).

## 4. Definition of Done riêng Company
- [ ] Mọi fill primary = `#F4860C` (không `#FAA51D`).
- [ ] Tab cửa hàng có nếu màn thuộc 月次注文/拠点.
- [ ] Pagination active orange; link SP blue gạch chân.

---

## 5. Customer-facing Company Web — SHELL "申し込むフォーム" (bổ sung 2026-10-12)

> Nguồn đo (Figma `VKAAOyoSPvgoB3H2qdeeV3`, page **Company web (P2)** `18162:161442`):
> - Section `not final` **`28019:260266`** — 申し込むフォーム (V1.0): Login · R01–R04 · Done · modal (ref `refs/company_apply_form_V1.png`).
> - Section **`19174:77566`** — Quản lý company: AW_CORPORATE_000–004 (ref `refs/company_manage_AW_CORPORATE.png`) → shell nội bộ §2 + pattern chi tiết/tab §8.
>
> ⚠️ Company Web có **2 shell khác nhau**: (A) **Portal có sider** (§2–§4, AW_CORPORATE_*, 月次注文) · (B) **Customer form shell không sider** (§5–§7) — dùng cho Đăng nhập / Đăng ký hợp đồng / Trang của tôi / Yêu cầu thay đổi của Web doanh nghiệp (prototype `Demo_form_đăng_ký_Web_doanh_nghiệp.html`).

### 5.1 Canvas & khung trang (shell B)

| Phần | Giá trị đo |
|---|---|
| Viewport | **1440** rộng, cao theo nội dung (R01 = 1798–2213). Frame auto-layout dọc, gap 32 |
| Nền trang | Gradient tuyến tính dọc `#FAF3EB`(0) → `#F8B66D`(1) |
| TopNavBar | 1440×**139**, fill `#FAF9F8`, pad ngang 91; gồm 2 hàng: **hàng 1** (cao 81, pad dọc 16): Logo ES STATION 254×49 + link 「ESキッチンホームページ」 14 Regular `#534434`, bên phải avatar user 41×41 tròn · **hàng 2** `Tabs` (cao 58): tiêu đề trang 32 Bold `#F4860C` + `Tabs/Parts/Item` (variant line) + nút pill 「ステップ n / 3」 |
| Nút pill bước | cao 40, pad 8/24, radius 9999, nhãn 14 SemiBold `#F4860C`, viền orange |
| Thanh thông báo | frame 1440×82 (pad ngang 24) → card trắng 1256×82, radius **16**, pad 8/32, chữ 16 Regular `#6E7781` + nút pill phải 「ログイン画面へ戻る」 (40, r9999, `#F4860C` 14 SemiBold) |
| Content card | 1260 rộng, nền `#FFFFFF`, pad **24**, gap 10, radius theo frame (card trắng nằm giữa 2 mép gradient, lề trái/phải 90) |
| Footer | 1440×**120**, fill `#FAF9F8`, viền trên `#D8C3AD`, pad ngang 40; logo ES KITCHEN 317×63 + 「© 2026 ES Kitchen. All rights reserved.」 12 Medium `#534434` |

### 5.2 Màu bổ sung (đo trực tiếp)

| Vai trò | Hex | Variable | Dùng |
|---|---|---|---|
| Tiêu đề trang · tab/step active · chữ nút outline · link nhấn | `#F4860C` | `admin/500` | |
| **CTA đặc (solid)** | `#FAA51D` | `admin/400` (Button `theme=Company`) | 「次へ」「登録」「ログイン」 — chữ trắng 18 Medium/Bold |
| Viền outline button | `#F4860C` 1px | `admin/500` | 「キャンセル」「ログイン画面へ」 nền trắng |
| Nền nút phụ (sub CTA) | `#FEF9E8` + chữ `#CA9A04` 18 Medium | — | 「新規契約」 trên Login |
| Viền card/collapsible | `#FEEDC7` | `admin/100` | |
| Nền tiêu đề collapsible (Collab Tab) | `#F6F8FA` | `neutral/50` | |
| Nền thẻ báo giá | `#FFEFDE` | `50 orange` | Summary Card r16 |
| Giá trị nhấn (số tiền, giá trị plan) | `#B3410A` | — | số 16 Bold; tổng 36 Bold; ghi chú 12 Regular |
| Nền icon tick hoàn tất | `#FFF9EB` | `admin/50` | |
| Nút disabled | `#EAEEF2` | `gray/100` | 「登録」 khi chưa tick đồng ý |
| Text mô tả phụ | `#6E7781` | `text/placeholder` | |
| Text chính | `#424A53` / `#24292F` | `text/middle` / `text/high` | |
| Bắt buộc `*` | `#CF222E` | `negative/500` | 18 Medium |
| Link | `#0969DA` | `info/500` | 14 Regular |

### 5.3 Typography

Noto Sans JP duy nhất (Poppins 18 chỉ xuất hiện ở số/nhãn logo, bỏ qua; Be Vietnam Pro chỉ là ghi chú annotation, KHÔNG dùng cho UI).
Tiêu đề trang **32 Bold** `#F4860C` · tiêu đề xác nhận (căn giữa) 32 Medium `#24292F` · tiêu đề collapsible **20 Medium** · label field **16 Bold** · giá trị/body **16 Regular** · phụ 14 · hint 12 · nút **18 Medium** · tiêu đề modal 18 Bold.

## 6. Component Customer form (shell B)

### 6.1 Button — cao **48**, pad 8/20, radius **6**, nhãn **18 Medium**
| Biến thể | Fill | Viền | Chữ |
|---|---|---|---|
| Solid | `#FAA51D` | — | trắng |
| Outline | `#FFFFFF` | `#F4860C` 1px | `#F4860C` |
| Disabled | `#EAEEF2` | — | `text/disabled` |
| Login CTA (full width 400×**52**, r8) | `#FAA51D` | — | trắng **18 Bold** |
| Sub CTA (400×52, r8) | `#FEF9E8` | — | `#CA9A04` 18 Medium |
| Pill (nav/step) | trắng/trong | orange | `#F4860C` 14 SemiBold, cao 40, r9999 |
Cặp nút cuối form: **2 nút 295×48 cạnh nhau, gap 24** (outline trái 「キャンセル」/「戻る」, solid phải 「次へ」/「登録」), căn giữa khối 614 rộng.

### 6.2 Field (Input with Title)
Label Wrapper: label **16 Bold `#424A53`** + `*` 18 Medium `#CF222E` + (tuỳ chọn) icon `Icon/Question` 24 · Input cao **40**, pad 8/12, radius **6**, viền `#D0D7DE` 1, nền trắng · hint 12 Regular `#B3410A` (※…) · lỗi: viền `#CF222E` 1.5 (`In Valied=No`) + dòng lỗi 12 `negative/500`.
Library: `Input` (set `54397665…` S, `b52c2ce3…` M), `Radio` units=n direction=horizontal, `Radio/Parts/Item` (md, 40), `Checkbox` units=n (8 ô cho 納品不可曜日), `Checkbox/Parts/Item`, Select = local `Component 1 / Select` + `Iconly/Light/Arrow - Down 2`.

### 6.3 Collapsible section (Collab Tab) — nhóm field
Khung `Collap`: nền trắng, viền `#FEEDC7`, V gap 8.
- **Collab Tab** (instance local `Collab Tab`, 1180×48): nền `#F6F8FA`, viền orange, pad 8/16/8/24; tên nhóm **20 Medium** `#424A53` + Icon Button 32 r1000 trắng (Arrow Up/Down 2).
- **Nội dung**: grid wrap pad 16 gap 16, radius 8; **lưới 4 cột**: ô rộng = 566 (2 cột) hoặc 275 (1 cột) trong thân 1180; field rộng (建物・部屋番号, địa chỉ) = 2 cột.

### 6.4 Thẻ báo giá (Summary Card — cột phải, sticky)
`Summary Card (Right side)` 313×auto: nền `#FFEFDE`, **r16**, pad 15/16, gap 16. Tiêu đề 18 Bold `#424A53` 「お支払い明細」.
- **Overlay** trắng r8 pad 12 gap 8: các dòng *nhãn 14 Regular `#424A53` — giá trị 16 Bold `#B3410A`* (希望プラン n / コース / 利用人数目安 / 配送方法 / 資材のボックス / 設備).
- **Detail** trắng r12 pad 12 gap 16: プラン小計 / オプション小計 / キャンペーン割引 (số 16 Medium `#B3410A` + 「円」12) · đường kẻ · 「見積合計」14 + **số tổng 36 Bold `#B3410A`** + 「円/月」14.
- Bản trang xác nhận (R03): rộng 407, pad 24, đặt cạnh Company Card (789).

### 6.5 Card xác nhận (R03)
Tiêu đề căn giữa 32 Medium 2 dòng · `Delivery Card` / `Company Card`: nền `#F6F8FA`, r12, viền `#D0D7DE`, pad 16; bảng trắng bên trong, header `Components/Table-Cell-Advanced-Header`, cell `Table/Data Cell/Text size=xs`; icon sửa/xoá `Iconly Edit/Delete` ở cột 操作 · Checkbox đồng ý 18 (`キャンペーン規約 に同意します。`) · cặp nút (§6.1), nút 「登録」 disabled `#EAEEF2` tới khi tick.

### 6.6 Modal hoàn tất
450×368, nền trắng **r8**, pad 16, gap 24: vòng tròn 100 `#FFF9EB` chứa dấu tick; tiêu đề 18 Bold `#525252`; nút đóng 32 góc phải; nội dung 14 Regular `#525252` căn giữa; nút outline orange 418×48 「ログイン画面へ」.

### 6.7 Login card
Nền: ảnh `Main BG/BG - Company` (đồng cỏ + mascot Sol) 1440×1024. Card **464×568**, **r34**, glass trắng + shadow, pad 24/32 gap 24: logo 400×80 → 「ログイン」 **24 Bold** `#24292F` → 2 Input (400×74, gap 20) → CTA 400×52 → sub CTA 「新規契約」 → link 「パスワードを忘れた方はこちら」 14 `#0969DA` căn giữa.

### 6.8 Ghi chú dạng số / tag
Khối note trong form: 12–14 Regular `#B3410A` (※…). Tag thiết bị / trạng thái dùng **Badge library** (`e773ec7c…`) theo `badgePolicy`.

## 7. Layout nội dung form (R01/R02)

| Vùng | Rộng | Ghi chú |
|---|---|---|
| Khung trong content card | 1212 (1260 − pad 24×2) | H gap 10 |
| Cột trái (form) | **889** | Hàng đầu: 契約区分 (Radio 433) + 契約数 Input (433) → các `Collap` |
| Cột phải (báo giá) | **313** | Summary Card §6.4 |
| Cặp nút cuối | 614 (295+24+295) | căn giữa dưới cột trái |
| Nhiều hợp đồng | mỗi 「希望プラン n」 = 1 `Collap`; collapsed = chỉ Collab Tab 48 | |
| Bảng 納品先情報 (list inline) | full 1180, bảng trắng, cột 88–254 | nút sửa/xoá cuối hàng |

## 8. Portal nội bộ Company (shell A) — pattern từ `19174:77566`

Frame 1442×1024–1128: `sider` 210 (Logo 54 → menu: ダッシュボード · 拠点/location · **法人・契約管理** ▾ gồm Tab Item `#F4860C` (active) + `#FEF9E8` (sub active) · Support/Sol dưới) · `Header` 1232×54 · `.Page-Header(Legacy)` 1232×78 (breadcrumb `Components/Link`+`Separator`, title, nút 閉じる/編集/保存) · `Wrap` nền `#F0F2F5` pad 24 · `Section` trắng pad 16 r8.
- **Tab detail** (基本情報 / 担当者・アカウント / 契約一覧 / 変更履歴): `Tabs/Parts/Item` variant=line `Color=Default` (active orange); trong tab: `Collab Tab` + bảng key-value (Input disabled `State=Disable` ở chế độ xem; chế độ edit đổi sang Input thường).
- Bảng: header `Table-Cell/Header` (Sorter/Filter), cell `Table/Data Cell/Text size=xs|sm`, `_Badge base` trạng thái, `table-cell/action` (PencilSimple + Delete), `Pagination-Item` medium.
- Nút `Icon/Folder` ở section 契約一覧 = link sang hợp đồng.

## 9. Phân tích đủ / thiếu cho Web doanh nghiệp (Gap analysis 2026-10-12)

| # | Hạng mục cần cho 15 màn (prototype) | Trạng thái | Nguồn / xử lý |
|---|---|---|---|
| G1 | Shell khách hàng (TopNav + gradient + Footer) | ✅ ĐỦ sau bổ sung | §5.1 |
| G2 | Login card + lỗi đăng nhập | 🟡 Login có; **banner lỗi chưa có** | Đề xuất: banner nền `#FCEAED`/viền `negative/500`, chữ 14, nút phụ trong banner (§10) |
| G3 | Wizard step (ステップ n/3) | 🟡 chỉ có nút pill | Đề xuất stepper 3 chấm trong thanh thông báo (§10) |
| G4 | Form field / Radio / Checkbox / Select / upload | ✅ | §6.2 · upload file list chỉ có icon PaperClip/DeleteOutlined (thiếu khung drop) → §10 |
| G5 | Collapsible card nhiều hợp đồng | ✅ | §6.3 |
| G6 | Thẻ báo giá phải | ✅ | §6.4 |
| G7 | Xác nhận (bảng so sánh theo cột / accordion) | 🟡 có card + bảng; **dạng cột nhiều hợp đồng chưa có** | §6.5 + §10 |
| G8 | Modal hoàn tất | ✅ | §6.6 |
| G9 | Modal xác nhận hỏi (? icon, 2 nút) · modal cảnh báo đỏ (hủy) | ❌ chưa có | Đề xuất từ §6.6 (§10) |
| G10 | Trang của tôi: bảng chi nhánh + badge trạng thái 利用中/休止中 | 🟡 bảng + Badge library có; **mapping màu trạng thái chưa chốt** | §10 |
| G11 | Chọn 7 thủ tục (pick card), chọn chi nhánh (bsel) | ❌ | Đề xuất §10 |
| G12 | Diff 利用中→追加/解約 (chip) | ❌ | Đề xuất §10 |
| G13 | Menu SP + layout **390** | ❌ **Figma không có bản SP** | ✅ User quyết 2026-10-12: **chỉ PC** |
| G14 | Ngừng sử dụng (empty/notice lớn) | ❌ | Đề xuất §10 |

## 10. Quy tắc ĐỀ XUẤT cho phần chưa có trong Figma (suy ra từ token đã đo — cần Design Lead confirm)
> 2026-10-12: user xác nhận (1) CTA solid `#FAA51D` đúng; (2) phần chưa có lấy style/màu theo frame `company Login` `18375:135066` (CTA `Company/400`, sub `app/50`+`app/600`, viền `neutral/200`, text `text/*`); (3) chỉ PC. Đã áp dụng khi dựng section `34753:82124`.

1. **Banner lỗi/cảnh báo** (login, hủy): r8, pad 12/16, nền `#FCEAED`, viền `negative/500` 1, icon `WarningCircle`, chữ 14 `#CF222E`; info = nền `#E5F6FF` viền `info/500`; ok = nền `#FFF9EB` viền `#FDDA8A`.
2. **Stepper 3 bước**: chấm 24 tròn (done = `#FAA51D` + tick trắng; now = viền `#F4860C` số cam; todo = `#EAEEF2`), nối bằng line 2px; nhãn 14 dưới/bên chấm; đặt trong thanh thông báo 82.
3. **Modal xác nhận hỏi**: dùng khung §6.6, icon vòng `#FFF9EB` với 「?」 cam; hủy hợp đồng dùng vòng `#FCEAED` + 「!」 đỏ; 2 nút (outline 「戻る」 + solid 「…する」; hủy = solid `negative/500`).
4. **Pick card thủ tục / chọn chi nhánh**: thẻ trắng r8 viền `#D0D7DE`; chọn = viền `#F4860C` 2 + nền `#FFEFDE`; không khả dụng = nền `#F6F8FA` + chữ `text/disabled`.
5. **Badge trạng thái chi nhánh**: 利用中 = success soft; 休止中 = warning soft; 解約 = negative soft; 承認待ち = info soft (badgePolicy: soft cho bản ghi).
6. **Diff chip**: 追加 = success soft, 解約 = negative soft, 変更なし = gray soft + mũi tên `利用中 → 追加`.
7. **Bảng xác nhận nhiều hợp đồng**: cột đầu 項目 (nền `#F6F8FA`, 16 Bold) + mỗi hợp đồng 1 cột, header cột = Collab-style 48.

## 11. Definition of Done riêng Customer form (shell B)
- [ ] Nền trang gradient `#FAF3EB→#F8B66D`; TopNavBar 139 + Footer 120 `#FAF9F8`.
- [ ] Tiêu đề trang 32 Bold `#F4860C`; CTA solid `#FAA51D` (KHÔNG `#F4860C` cho fill nút ở shell B); outline viền `#F4860C`.
- [ ] Nút form cao 48 r6 nhãn 18 Medium; field cao 40 r6 viền `#D0D7DE`; `*` đỏ 18.
- [ ] Nhóm field dùng Collab Tab `#F6F8FA` 48 + viền `#FEEDC7`; lưới 4 cột gap 16.
- [ ] Số tiền / giá trị plan `#B3410A`; tổng 36 Bold.
- [ ] Mọi phần "ĐỀ XUẤT" §10 được gắn nhãn khi vẽ để Design Lead duyệt.
