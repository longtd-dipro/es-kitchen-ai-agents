# 00 — Foundation (áp dụng MỌI platform)

> Đọc trước mọi file platform. Giá trị đo từ Figma Phase 2 (`get_variable_defs` + sample pixel screenshot), bổ sung quy tắc từ Design System artifact.

---

## 1. Màu chủ đạo theo platform (Phase 2 — ĐÃ ĐO)

| Platform | Primary (solid / nav active / CTA) | Hover/Dark | Subtle bg (sub-menu active, band) | Primary text/link | Nguồn đo |
|---|---|---|---|---|---|
| **Admin Web E03** | `#0969DA` blue | `#0550AE` | `#E5F6FF` | `#0969DA` | nav active + 保存 button |
| **Company Web E02** | `#F4860C` orange | `#D86107` | `#FFEFDE` (sub-menu) · `#FFF9EB` (summary card) | `#F4860C` (tab), link bảng `#0969DA` | nav active + 登録 |
| **Supplier Web E04** | `#6639BA` purple | `#512A97` | `#F1F1FF` (info card) · `#ECE8FC` (cell highlight) | `#6639BA` | nav active + 保存 |
| **Công ty vận chuyển Web E05** (Logistic) | `#1A7F37` green | `#116329` | `#EDFDF0` | `#1A7F37`, link bảng `#0969DA` | nav active + 検索 |
| **User Mobile App E01** | `#FAC215` → `#FFC562` gradient (yellow) | `#CA9A04` | `#FEF9E8` / `#FFF9EB` | `#1480FF` (link) | stepper, 支払い CTA |
| **WebApp ES_QR** | `#FAC215` → `#FFC562` gradient | `#EAB308` (`app/500`) | `#FEE28A` (`app/200`, nền header) | — | cart action, FAB |
| **WebApp Driver E06** | `#0969DA` blue | `#0550AE` | `#E5F6FF` | `#0969DA` | CTA 完了, tab active |
| Driver — accent COOL便 | `#5A3AE9` purple | — | `#ECE8FC` | `#5A3AE9` | card đơn COOL, checkbox |

> Chữ trên nền primary: trắng `#FFFFFF`, **trừ** yellow CTA (E01/ES_QR) dùng chữ tối `text/high #24292F`.

## 2. Neutral + text + divider (chung mọi platform — Sparkle gray)

| Token Figma | Hex | Dùng |
|---|---|---|
| `neutral/50` = `gray/50` | `#F6F8FA` | Header bảng, search panel, section band, input read-only |
| `neutral/100` = `divider/low` | `#EAEEF2` | Kẻ hàng bảng, viền card, divider |
| `neutral/200` = `divider/middle` | `#D0D7DE` | Viền input, viền outline button, viền ngoài bảng |
| `neutral/300` = `divider/high` | `#AFB8C1` | Viền hover |
| `neutral/400` | `#8C959F` | Icon mờ |
| `neutral/500` = `text/low` = `text/placeholder` | `#6E7781` | Helper, placeholder, meta, label phụ |
| `neutral/700` = `text/middle` | `#424A53` | Nội dung, label, cell bảng, nav label |
| `neutral/800` | `#32383F` | Label đậm mobile |
| `text/high` (neutral/900) | `#24292F` | Tiêu đề, giá trị quan trọng |
| `base/foreground-primary` | `#0A0A0A` | Tên sản phẩm (ES_QR) |
| `base/foreground-secondary` | `#737373` | Meta phụ (mobile) |
| page-bg (web) | `#F0F2F5` | Nền canvas sau card (desktop web) |
| `bg` (driver) | `#FAFAFA` | Nền app Driver |
| Overlay | `rgba(0,0,0,0.45)` web · `Overlay/Medium #00000099` mobile | Scrim modal |

## 3. Màu trạng thái (KHÔNG đổi theo portal)

| Tone | 50 (nền message) | 100 (nền badge) | 500 (icon/viền/chữ trên trắng) | Chữ đậm |
|---|---|---|---|---|
| success | `#EDFDF0` | `#C5F7D0` | `#1A7F37` | `#044F1E` |
| info | `#E5F6FF` | `#CEEDFF` | `#0969DA` | `#033D8B` |
| warning | `#FEF9E8` | `#FEF0C3` | `#EAB308` (`warning/500`) · `#FAC215` (400) | `#854D0E` / `#CA9A04` (600) |
| negative | `#FFF6F5` | `#FFE5E4` | `#CF222E` | `#A40E26` |

- Giá tiền (mobile/QR): `#CF222E` (`red/500`). Dấu `*` bắt buộc: `#CF222E`.
- Tag "残りわずか"/"NEW" (ES_QR): viền + chữ `#E60012` (đỏ thương hiệu) — **chỉ** dùng ở ES_QR/mobile product tag.
- `brand-orange #FAA51D`, `brand-red #EE1F23`: **chỉ** logo ESSTATION, không dùng làm màu trạng thái.

## 4. Typography

**Font:** `Noto Sans JP` cho toàn bộ (token `font-family/Default`). Weights: 400 Regular · 500 Medium · 600 Semi · 700 Bold.
Mã/ID (tuỳ chọn, theo artifact): `BIZ UDGothic` / `BIZ UDPGothic`. Không dùng Roboto/Inter/DM Sans/Public Sans cho màn mới (có sót trong vài component Figma — coi là lỗi, thay bằng Noto Sans JP).

### 4.1 Text styles Figma Phase 2 (dùng tên này khi bind style)

| Style | Size / Line-height | Weight | Dùng |
|---|---|---|---|
| `Text xs/Regular` · `/Medium` · `/Bold` | 12 / 18 | 400/500/700 | Meta, badge, helper, breadcrumb, pagination meta, tab bar label |
| `Text xs/bold` (`character/1/bold-pro`) | 12 / 20, **letter-spacing 5%** | 700 | Tag/Badge label |
| `Text sm/Regular` · `/Medium` | 14 / 20 (hoặc 22) | 400/500 | Body, ô bảng, input value (web), nút md |
| `Body/regular` · `14px/regular` | 14 / 22 | 400 | Body web (AntD) |
| `Text sm/bold-pro` | 14 / 24, ls 5% | 700 | Nhãn field (web) |
| `Text md/Regular` · `/Medium` · `/Semi` · `/Bold` | 16 / 24 | 400–700 | Nav label, input value mobile, section title mobile, nút lg |
| `Text lg/Regular` · `/Medium` · `/Bold` | 18 / 24 | 400–700 | Tiêu đề header mobile, tổng tiền, CTA mobile |
| `Heading/H5/Medium` | 18 / 26 | 500 | Section title web |
| `Text xl/Regular` · `/Medium` · `/Bold` | 20 / 24 | 400–700 | Tiêu đề modal, tên card lớn |
| `Display xs/Medium` | 20 / 28 | 500 | Tiêu đề section lớn |
| `Display xs/Bold` | 24 / 28 | 700 | Số KPI |
| Page title (web) | 24 / 32 | 500 | Tiêu đề trang dưới breadcrumb |
| `Display sm/Medium` · `/Bold` | 32 / 36 | 500/700 | Số lớn (hiếm) |

### 4.2 Thang artifact (Sparkle `character/1–7`) — tương đương

12/20 · 14/24 · 16/24 · 18/28 · 20/32 · 24/36 · 28/44. Khi Figma có style Phase 2 tương ứng → ưu tiên style Phase 2.

### 4.3 Định dạng nội dung

- Tiền: `100円`, `¥1,284,500` (web tổng). Ngày: `2026/08/31` (web admin) hoặc `2026-08-22` (bảng logistic/driver) — **giữ đúng format của màn cùng module**.
- Số lượng có đơn vị: `50 個`, `10 品`, `3 箱`, `1,840食`. Cột số tiền/số lượng căn phải, `tabular-nums`.
- Nhãn UI tiếng Nhật, ngắn: 「編集」「削除」「保存」「検索」「クリア」「新規登録」「CSV出力」「CSV取込」「戻る」「キャンセル」「登録」.
- Không emoji trong UI.

## 5. Spacing (lưới 4px — token `padding/*`)

`2 · 4 · 6 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48`
- 8: gap giữa nút, padding ngang cell bảng.
- 12: gap trong nhóm field, padding card mobile/driver.
- 16: padding card/section, gutter mobile, gap giữa section.
- 20: padding dọc page header (web), padding header driver.
- 24: page gutter web, padding modal.

## 6. Radius · Border · Shadow

| Token | Giá trị | Dùng |
|---|---|---|
| `border-radius/xs` | 2 | Checkbox box |
| `border-radius/notice` | 4 | Tag, badge, inline message nhỏ, ảnh sản phẩm |
| `border-radius/action` (`md`) | 6 | Button, input, select, pagination item |
| `border-radius/lg` | 8 | Card, nav item, card driver, CTA mobile, action button vàng |
| `border-radius/modal` | 12 | Modal, info card supplier, icon tile driver |
| Mobile sheet | 24 (top-left/right) | Main sheet mobile/QR |
| full | 9999 | Pill status, avatar, icon button tròn driver, FAB |
| `Border-width/border-1` | 1 | Mọi viền |

| Shadow | Giá trị | Dùng |
|---|---|---|
| `box-shadow/raise` | 0 1 2 0 `#0000000D` | Input, outline button |
| `box-shadow/stick` | 0 1 2 -1 `#0000001A`, 0 1 3 0 `#0000001A` | Header sticky, card driver |
| `box-shadow/float` | 0 2 4 -2 `#0000001A`, 0 4 6 -1 `#0000001A` | Dropdown, popover |
| `box-shadow/popOut` | 0 4 6 -4 `#0000001A`, 0 10 15 -3 `#0000001A` | Modal web, toast |
| `drop-shadow/0.15` | 0 2 8 0 `#00000026` | Sider edge |
| `cta main` (yellow glow) | inner 0 0 6 3 `#FFFFFFA3` + 0 0 0 4 `#FFFFFFA3` + 0 0 0 3 `#F7AA2633` + 0 4 12 2 `#FAC2153D` | Nút vàng E01/ES_QR |
| `cloud shadow` | -6 6 20 0 `#E1B74A80` | Main sheet mobile |
| Driver CTA glow | 0 4 12 2 `rgba(125,192,255,.24)` + 0 0 0 3 `rgba(97,179,255,.2)` + 0 0 0 4 `rgba(255,255,255,.64)` | CTA blue driver |
| focus | 0 0 0 2 `#FFF`, 0 0 0 4 `#096CDC` | Focus bàn phím (mọi portal) |

## 7. Icon · Logo · Mascot

- **Icon set: Phosphor Icons, weight Regular** (Figma tên `Icon/CaretLeft`, `Icon/Package`, `Icon/QrCode`, `Icon/Barcode`, `Icon/Siren`, `Icon/WarningCircle`...). 20px trong nav/nút/input, 24px header mobile/driver, 14–16px trong dòng meta. Không trộn Material Symbols trong cùng màn. Icon-only button phải có label/aria.
- Một số icon cũ tên `Iconly` (search, arrow) — chấp nhận khi đã có sẵn trong component library.
- **Logo ESSTATION**: đầu sider web (block 210×54), hero Driver home; luôn trên nền trắng/sáng, không đổi màu, không kéo giãn.
- **Mascot Sol** (cô bé tóc vàng cầm sách "Recipe"): cuối sider mọi web portal; trên màn Scan/Home của mobile & Driver. Component local `Sol`.
- Header web: icon mặt trời + 「お帰りなさい」.

## 8. ⚠️ Bẫy đặt tên (BẮT BUỘC nhớ)

Library "ES Kitchen" đặt tên theme **ngược** với tên portal:

| Tên variable/variant trong Figma | Thực chất là màu | Dùng cho portal |
|---|---|---|
| `company/*` (company/500 `#0969DA`) · Button **`theme=primary`** | **Blue** | **Admin E03**, Driver E06, link, info |
| ⚠️ Button `theme=Company` (set `1e134ad8…`) | **Orange** — đo 2026-09-30: solid `#FAA51D`, outline `#F4860C` (ngược với tên variable `company/*`) | KHÔNG dùng cho Admin/Driver. Set Button chỉ có `theme=primary/neutral/secondary/Company` — không có `Admin`/`App` |
| `admin/*` (admin/500 `#F4860C`, admin/50 `#FFF9EB`, admin/200 `#FDDA8A`) · Button `theme=Admin` | **Orange** | **Company E02** (và nút "メンテナンス終了" ở Admin) |
| `app/*` / `App - primary/*` (app/500 `#EAB308`, app/200 `#FEE28A`, 400 `#FECE3C`, 600 `#CA9A04`) · Button `theme=App` | **Yellow** | Mobile E01, ES_QR |
| (chưa có theme) | Purple `#6639BA` | Supplier E04 → override fill |
| (chưa có theme) | Green `#1A7F37` (`success/500`) | Công ty vận chuyển E05 → override fill |

| ⚠️ **Ngoại lệ — component `Tabs` / `Tabs/Parts/Item`** (set `10217:95468`, `variant=line`) · `Color=Company` | **Orange** (ngược với Button!) | Company E02 |
| `Tabs` · `Color=Default` | **Blue** `#0969DA` | **Admin E03** (khớp AntD `Tabs` trong `es-kitchen-web-admin`: padding 12, chữ `#424A53`, active `#0969DA` Medium, ink bar 2px, kẻ dưới `#D0D7DE`) |
| Local `Search Buttons` (`5459:72877`, クリア+検索) | **Orange** | Chỉ Company — màn Admin dùng 2 `Button` `theme=primary` (outline + solid) |

→ Khi dựng màn **Company** dùng variable `admin/*`; màn **Admin** dùng `company/*`. Không "sửa" tên — chỉ map đúng. **Luôn đọc màu thực tế sau khi đặt variant** (mỗi component đặt tên theme một kiểu).

## 9. ⚠️ Mâu thuẫn đã phát hiện (chưa confirm — ghi vào Open Questions khi gặp)

| # | Mâu thuẫn | Quyết định tạm (Designer dùng) |
|---|---|---|
| C1 | Artifact: Company primary `#FAA51D`; Figma Phase 2 đo `#F4860C` | Dùng `#F4860C` (`admin/500`) cho fill; `#FAA51D` chỉ logo |
| C2 | Artifact: Supplier `#8250DF`; Figma `#6639BA` (designer-context §8.1 cũng `#6639BA`) | Dùng `#6639BA` |
| C3 | ✅ **RESOLVED 2026-09-29** — Logistic Web = **E05** `es-kitchen-web-outsource-web-private`, đã đổi tên thành **Công ty vận chuyển Web (委託配送会社Web)**. Lime `#8ACA0D` là màu cũ trong code | Dùng `#1A7F37` cho mọi màn E05 mới; FE migrate màu khi implement |
| C4 | designer-agent (cũ) quy định mobile 375×812; **mọi** frame mobile/QR/Driver Phase 2 là **390×844** | Dùng **390×844** (đã sửa trong agent) |
| C5 | Artifact: link = `primary-text`; Phase 2 link trong bảng (配送No, tên sản phẩm) = blue `#0969DA` ở mọi portal | Dùng `#0969DA` cho link bảng |
| C6 | ✅ **RESOLVED 2026-09-29** — **Dùng chung**: cả 2 kiểu badge (solid fill + nền 100/chữ 700) thuộc bộ component chung, áp dụng cho MỌI platform | Quy tắc chọn: xem `10-desktop-web-shell.md` §9 (solid = trạng thái tiến trình; soft = trạng thái bản ghi) |
| C7 | designer-context: E06 dùng shadcn + Lucide; Figma Driver dùng Phosphor icons | Figma vẽ Phosphor; ghi note cho FE map sang Lucide |
| C8 | ✅ **RESOLVED 2026-09-29** — ES_QR là **WebApp mới thêm vào** Phase 2 (chưa có repo trong Ecosystem) | Thiết kế theo spec 21; tên repo điền khi team tạo repo |

## 10. Giọng văn & xác nhận (theo artifact)

- Confirm xoá: tiêu đề 「削除しますか？」, nội dung 「本当に削除してもよろしいですか？削除すると元に戻せません。」, nút 「キャンセル」+「削除」(đỏ).
- Rời màn chỉnh sửa chưa lưu: 「編集内容を破棄しますか？」 → 「破棄」.
- Toast thành công: 「保存しました」「登録しました」「削除しました」.
- Lỗi chỉ rõ cách sửa: 「メールアドレスの形式が正しくありません」「有効な拠点IDを入力してください。」.
- Thuật ngữ thống nhất: 出荷不可 · サイクル · 一部納品 · 倉庫マスタ (không dùng 拠点マスタ) · フリガナ · 電話番号.
- Nút không có quyền → **ẩn**, không làm mờ.

## 11. Screen code (frame naming)

`<Prefix>_<FEAT(4-6)>_<Seq(3)>` — prefix thực tế Phase 2:
`AW_` Admin Web · `CW_` Company Web · `SW_` Supplier Web · `OW_` Công ty vận chuyển Web E05 (Logistic) · `UA_` User App (mobile + ES_QR) · `DA_` Driver App.
Biến thể trạng thái: `DA_COOL_001 - 02 check all`, `DA_RECV_001 - 6` (suffix ` - <state>`).

## 12. Đặt tên đa ngôn ngữ — group_name · section_name · screen_name (theo `NAMING_LANG` ở Bước 0.2b)

> Vấn đề: tên layer / tên Section / tên frame trên canvas Figma chỉ hiển thị **1 dòng** → tên song ngữ dài bị **cắt chữ** (「…」). Giải pháp: tách **tên layer** (để tìm kiếm) và **nhãn hiển thị** (để đọc).

**Mặc định đề xuất: `vi + ja + en`, thứ tự dòng vi → ja → en** (user có thể chọn khác ở Bước 0.2b).

### 12.1 Tên layer (node.name) — 1 dòng, nối bằng ` | `

| Loại | 1 ngôn ngữ | Đa ngôn ngữ (vi + ja + en) |
|---|---|---|
| group_name | `Luồng đăng ký hợp đồng` | `Luồng đăng ký hợp đồng \| 契約登録フロー \| Contract registration flow` |
| section_name | `契約管理` | `Quản lý hợp đồng \| 契約管理 \| Contract management` |
| screen_name | `AW_CONT_001 契約一覧` | `AW_CONT_001 \| Danh sách hợp đồng \| 契約一覧 \| Contract list` |

Screen Code luôn đứng **đầu** screen_name (giữ nguyên, không dịch).

### 12.2 Nhãn hiển thị (TEXT node) — BẮT BUỘC xuống dòng khi ≥ 2 ngôn ngữ

- Đặt **text label ngay phía trên** mỗi group / section / frame (cách 16–24px), mỗi ngôn ngữ **1 dòng** (`\n`).
- `textAutoResize = "HEIGHT"` + `resize(width_của_node, …)` → chữ tự xuống dòng, **không bao giờ bị cắt**. Không dùng `WIDTH_AND_HEIGHT` cho tên dài; không set height cố định.
- Style: dòng 1 (Screen Code hoặc ngôn ngữ chính) `Text lg/Bold` 18 `text/high`; các dòng sau `Text md/Regular` 16 `text/middle`; line-height theo style. Tiền tố ngôn ngữ tuỳ chọn: `vi:` / `ja:` / `en:` (12 `text/low`) khi cần phân biệt.
- Label là con của Section/group cha (không nằm trong frame màn hình) → không làm bẩn frame UI.

```js
// Ví dụ screen label vi + ja + en
const label = figma.createText();
await figma.loadFontAsync({ family: "Noto Sans JP", style: "Bold" });
await figma.loadFontAsync({ family: "Noto Sans JP", style: "Regular" });
label.characters = "AW_CONT_001\nDanh sách hợp đồng\n契約一覧\nContract list";
label.textAutoResize = "HEIGHT";
label.resize(frame.width, label.height);
label.x = frame.x; label.y = frame.y - label.height - 16;
label.name = "label · AW_CONT_001";
```

### 12.3 Checklist
- [ ] Đúng `NAMING_LANG` từng cấp (group / section / screen).
- [ ] Mọi tên ≥ 2 ngôn ngữ có label nhiều dòng, `textAutoResize = HEIGHT`, không chữ nào bị cắt (xác nhận bằng `get_screenshot`).
- [ ] Label không chồng lên frame khác (quét bbox).
- [ ] Bản dịch ja lấy từ SPEC/Figma gốc; thuật ngữ vi/en nhất quán §10.
