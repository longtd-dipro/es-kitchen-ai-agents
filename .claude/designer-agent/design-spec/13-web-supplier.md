# 13 — Supplier Web (E04 · 仕入先Web) — PURPLE

> Repo: `es-kitchen-web-supplier` · Screen prefix `SW_` · Ref: `refs/supplier_detail_SW_HOME_006.png` + `refs/supplier_reference_SW_HOME_001-006.png`
> Figma nguồn: `SW_HOME_006-Processing shipments` `19558:178039` (1440×1571) · **bộ 6 màn tham chiếu `Group 29` `34579:235837`** (SW_HOME_001…006, đo 2026-10-09).
> Kế thừa toàn bộ `10-desktop-web-shell.md`.

## 0. Bộ màn tham chiếu (nguồn sự thật cho Supplier)

| Frame | Node | Loại | Ghi chú |
|---|---|---|---|
| SW_HOME_001-Top_close | `19905:203835` | TOP · tab すべて, mục thông báo thu gọn | Tabs + Collapsible |
| SW_HOME_002-Top_open | `19905:203888` | TOP · mở 1 mục | |
| SW_HOME_003-Top_open_full | `19905:203793` | TOP · tab お知らせ, mục mở đầy đủ + link | |
| SW_HOME_004-Monthly menu list | `19504:179076` | 一覧 (注文管理) | Collab search + Table + pagination |
| SW_HOME_005-List of products ordered by month | `19504:179708` | 一覧 con (注文詳細編集) | + CSV出力 / 仮発注 / 本発注 |
| SW_HOME_006-Processing shipments | `19558:178039` | 詳細 (出荷処理) | Section collapsible + ma trận |

Cả 6 màn **chỉ ghép instance của library + override màu tím**, không vẽ rectangle. Dữ liệu trong frame là dữ liệu mẫu (にっしぐち, ヤマダ株式会社…).

## 1. Theme

| Vai trò | Hex | Variable / ghi chú |
|---|---|---|
| primary (nav active, 保存, 検索, tab active, link phân trang) | `#6639BA` | **Dùng variable library `slot/stroke`** (= `purple/600`; còn `slot/label/fill` cùng giá trị) — đo thấy cả 6 màn bind `slot/stroke`. Button/Tabs không có theme tím → override fill/stroke |
| hover | `#512A97` | chưa có variable |
| info card bg | `#F1F1FF` | viền `#D8B9FF`/`#ECD8FF` |
| cell highlight / selected | `#ECE8FC` · `#E7E7FF` (đo ở HOME_006) | |
| viền tím nhạt (card/collapsible) | `#EAE1FA` | đo ở stroke của Collap / Tabs |
| outline button | viền + chữ `#6639BA` | 「クリア」「仮発注」「CSV出力」 |
| link nội dung | `#0969DA` (+ icon `open_in_new` cùng màu) | KHÔNG tím; `company/500`/`info/500` |
| link phân trang active | `#6639BA` (HOME_004) · `#0969DA` (HOME_005) | **không nhất quán** — xem §9 |

Code production E04 có thể còn orange — Designer luôn dùng purple (designer-context §8.1). Trạng thái **không** dùng tím (chỉ 4 tone status + bộ badge §6).

## 2. Sider (instance `sider` — `phase=phase 1, status=expand` 210 × cao theo frame)

- Nội dung (từ trên xuống): `Logo` (Default) · 4 nav item · khoảng trống · `Sol` (`Property=6`) · `MenuFold` ở đáy.
- 4 mục, đúng thứ tự: **TOP** (icon Phosphor `House`) · **受注一覧** (`Clipboard`) · **注文管理** (`Package`) · **会社のプロフィール** (`Buildings`). Không có mục 操作マニュアル.
- Nav item 184×48 (x=13), label `Text md` 16: mặc định `#424A53` Regular; **active** nền `#6639BA`, chữ + icon trắng.
- Active theo màn: HOME_001–003 = TOP · HOME_004/005/006 = **注文管理** (kể cả HOME_006 có breadcrumb 「受注一覧 / 出荷処理」 — xem §9 mâu thuẫn).
- Component hiện có `sider` trong file thuộc portal khác (menu Admin/Delivery); Supplier là **instance của cùng set `phase 1`** nhưng nhãn/icon đã override.

## 3. Header (instance `Header` 1230×54)

- Trái: icon mặt trời + 「お帰りなさい」 16 `#24292F`.
- Phải: icon sách (`Icon/BookOpenText` 24 — link manual) · `Support` · avatar · tên người dùng 16 `#24292F` (mẫu 「にっしぐち」) · `Icon/CaretDown`.
- Không hiển thị tên công ty/様 (khác prototype SW_*, xem §9).

## 4. Page header (`.Page-Header(Legacy)` 1182 × 92–98, x=24)

- `heading` cao 56: **Breadcrumb** (instance `Breadcrumb`, 14, mục trước `#6E7781`, mục cuối `#24292F`, separator 「/」 `#BFBFBF`) + **title 24/32 Regular** `#24292F` (y=24).
- `button list` bên phải cao 48, gap 12, **Button size=lg** (130 / 138 / 84 rộng):
  - SW_HOME_001 (trang TOP): 3 nút (neutral outline · primary outline · primary solid).
  - HOME_005: 「CSV出力」(outline tím + icon) · 「仮発注」(outline tím) · 「本発注」(solid tím).
  - HOME_006: 「戻る」(neutral) · 「この発注をキャンセルする」(outline đỏ `#CF222E`) · 「保存」(solid tím).
- Tabs đặt **trong** card dưới page header (xem §5), không phải trên cùng.

## 5. Pattern TOP (SW_HOME_001/002/003)

1. Title 「お知らせを確認する」, breadcrumb 「TOP」.
2. **Tabs** (`Tabs/Parts/Item` `variant=line`, `Color=Default`, 120×40–42, gap 8, trong card x=20 y=20 rộng 1142): すべて · 重要 · お知らせ. Selected: chữ + ink bar `#6639BA`; còn lại `#424A53`. (`Color=Default` của Tabs là xanh trong library → override tím.)
3. Dưới tabs: các **Collapsible** (`Collap` → `Collab Tab` cao 48 + `Wrap` pad 16). Tiêu đề 「【2024/02/29】配送方法について」 16 Medium `#24292F`, nút caret `Icon Button ghost sm` bên phải.
4. Khi mở: nội dung 16 (đo `#000000` — nên bind `text/high`), rồi các **Link** `#0969DA` + icon `open_in_new` (`Link` `Icon End=Yes`).
5. Mỗi `Collap` cao 192 (mở) · thu gọn chỉ còn Collab Tab 48.

## 6. Pattern 一覧 — 注文管理 (SW_HOME_004)

- Page header chỉ breadcrumb + title (không button).
- **Table/Column-Based** 1230 × 809, bên trong x=16:
  - `Collab Tab` (search panel) 1198×72: `Icon Button` caret (32) + 3 `Input` 279×40 (ô 1 là date 「2024/04」, ô 2·3 là select メニュー種別 / ステータス, icon `Iconly` 20 bên phải) + `Search Buttons` 218×40 (「クリア」 outline tím + 「検索」 solid tím).
  - **Table** 1198 × 625: header row **55** (`Components/Table-Cell/Header` `Size=large`, chữ 16 Medium `#24292F`), data row **57** (`Table/Data Cell/Text` `size=sm`, 14 Regular `#24292F`), divider `#EAEEF2`. Cột: No (`row expand` `status=number`) · 注文年月 · メニュー種別 · 出荷予定日 · 出荷実績日 · 商品数 · 合計金額 · ステータス · 操作 (`table-cell/action`: bút chì + tải xuống, dọc `Divider`).
  - `pagination` 1198×48 căn phải (「…」, số, active tím).
- **Badge trạng thái** (`Badge Size=lg`, bộ Untitled-style; dùng chung §9 policy):

| Nhãn | Color | Chữ | Nền |
|---|---|---|---|
| 未処理 / 仮発注済 | Gray | `#414651` | `#F5F5F5` |
| 仮注文 | Orange | `#C4320A` | `#FFF6ED` |
| 正式注文 | Blue | `#175CD3` | (chưa đo — mặc định library) |
| 確認済み | Success | `#027A48` | `#ECFDF3` |

## 7. Pattern 一覧 con — 注文詳細編集 (SW_HOME_005)

- Breadcrumb 「注文管理 / 注文詳細編集」 + badge 「未処理」 cạnh title; 3 nút ở §4.
- Search panel có `Input` size S (商品名, tháng 「2025年10月」, ステータス) + 「クリア」「検索」, thêm nút 「契約登録」 (outline tím) ở dưới.
- Table: thêm cột **Checkbox** (`Checkbox/Parts/Item size=sm`; ô lỗi viền `#CF222E`), No · 商品名 · カテゴリ · 仕入先 · 論理必要数 · 在庫数 · オーダー数 · 仮発注 · 本発注 · ステータス (badge Gray 「仮発注済」) · 操作 (bút chì + thùng rác). Hàng 57.

## 8. Pattern 詳細 — 出荷処理 (SW_HOME_006)

1. Page header: breadcrumb 「受注一覧 / 出荷処理」, title 「出荷処理」; nút 「戻る」(neutral) · 「この発注をキャンセルする」(negative outline) · 「保存」(primary solid).
2. **Info card** đầu: nền `#F1F1FF`, radius 12, pad 16/24: icon hộp 24 + 「商品名 (10002)」 18 Medium; 2 cột cặp label/value 16 (label `#6E7781`, value `#424A53`): メニュー年月 · 発注明細No · カテゴリ · 備考.
3. Section **必要数** (collapsible, band `neutral/50` + vạch trái tím 3px, tiêu đề 20 Medium `#424A53`): search nội dung (倉庫 select, 開始日 ~ 終了日, 「クリア」 outline tím, 「検索」 solid tím); **bảng ma trận** 倉庫/日付 × ngày 1..14 (cột ≈ 43) + 基準数計 / 予測数 / 選択必要数 / 合計; ô chọn nền `#E7E7FF`/`#ECE8FC`; scrollbar ngang.
4. Section **在庫情報**: 3 ô KPI (nhãn trái 16 + số phải 20 Medium).
5. Section **発注情報** + Badge Success 「仮発注済」: lưới form 3 cột (仕入先*, 納入倉庫* select, ロット read-only) → textarea 仕入備考 (0/100) → 4 cột (仮発注数*, 希望納期* date, 本発注*, 希望賞味期限 date) → textarea. Dấu `*` `#CF222E` 18.
6. Band **仕入先回答**: nền `success/50` (`#EDFDF0`), tiêu đề + Badge 「納期回答済み」, meta phải 「出荷予定日 …」.

> Figma Supplier ghi nhãn song ngữ JP (VN) — đó là note cho team; màn production chỉ tiếng Nhật trừ khi SPEC yêu cầu.

## 9. Component library đã dùng (instance) & mâu thuẫn

**Instance (đo 2026-10-09):** `sider` (phase 1/expand) · `Logo` · `Sol` · `Header` · `Breadcrumb` · `Tabs/Parts/Item` (`variant=line`) · `Tab Item` · `Collab Tab` · `Collap`/`Collapsible Section` · `Button` (`theme=neutral/primary`, `variant=outline/solid`, `size=lg/md`) · `Search Buttons` · `Icon Button` (`neutral ghost sm`) · `Input` (Size S/M, Filled, Variant2) · `Components/Link` · `Icon/open_in_new` · `Icon/BookOpenText` · `Iconly` (Search/Calendar/Arrow-Down/Download/Delete) · `Icon/PencilSimple` · `Table/Data Cell/Text` · `Components/Table-Cell/Header` · `row expand` · `table-cell/action` · `Divider` · `Badge` (Gray/Orange/Blue/Success, lg) · `Checkbox/Parts/Item` · `Components/Pagination-Item` · `pagination`.

**Variable đã bind:** `slot/stroke` (tím) · `slot/label/fill` (tím) · `neutral/50,100,500,700,800` · `text/high,middle,low,placeholder,disabled` · `white` · `company/500` · `info/500` · `negative/500` · `success/50`.

**Mâu thuẫn / chưa rõ (ghi Open Questions khi gặp):**

| # | Mâu thuẫn | Quyết định tạm |
|---|---|---|
| S1 | HOME_006 breadcrumb 「受注一覧 / 出荷処理」 nhưng sider active = 注文管理; mục 受注一覧 không bao giờ active trong 6 màn | Theo Figma mẫu; hỏi Design Lead map mục nav ↔ màn |
| S2 | Header mẫu không có tên công ty/様; prototype `SW_*` có | Theo Figma mẫu (spec 13); thêm tên công ty ở vị trí tên người dùng nếu SPEC yêu cầu |
| S3 | Sider mẫu không có 操作マニュアル; icon sách ở header là link manual | Link manual = icon `BookOpenText` ở header |
| S4 | Màu link phân trang active: HOME_004 `#6639BA`, HOME_005 `#0969DA` | Dùng tím (primary); HOME_005 coi là sót override |
| S5 | Body mục thông báo TOP đo `#000000` (không bind variable) | Dùng `text/high` `#24292F` |
| S6 | Bộ Badge (Gray/Orange/Blue/Success) màu Untitled-style (`#414651`, `#C4320A`, `#175CD3`, `#027A48`) khác tone status foundation §3 | Dùng đúng bộ Badge library cho trạng thái đơn; tone §3 cho Alert/message |

## 10. Definition of Done riêng Supplier
- [ ] Mọi fill primary = `#6639BA` (bind `slot/stroke` nếu được), không orange/blue cho CTA/nav.
- [ ] Sider đúng 4 mục (TOP · 受注一覧 · 注文管理 · 会社のプロフィール), nav active tím, có Logo + Sol + MenuFold.
- [ ] Header 54 có 「お帰りなさい」, icon sách, avatar, tên người dùng.
- [ ] Page header: breadcrumb + title 24 Regular; nút size lg gap 12; Tabs nằm trong card dưới page header.
- [ ] Search panel = `Collab Tab` (vạch trái tím), クリア outline tím + 検索 solid tím.
- [ ] Table header 55 / row 57; trạng thái dùng `Badge` lg đúng màu §6.
- [ ] Section band có vạch trái tím; link nội dung `#0969DA` + `open_in_new`.
- [ ] Không dùng tím cho badge trạng thái.

## 11. Ghi chú vẽ lại SW_* (2026-10-09) — instance vs native
- **Dùng instance library:** sider/header (clone frame mẫu SW_HOME), Button, Input, Badge, ô bảng (`Table-Cell/Header` cao 55 + `Table/Data Cell/Text` cao 57, cứng — không co được), `Checkbox/Parts/Item`, `Textarea`.
- **Lưu ý import:** set key của `Table-Cell/Header` và `Textarea` KHÔNG import được bằng `importComponentSetByKeyAsync`; lấy `mainComponent` từ một instance có sẵn trong frame mẫu (HOME_004 / HOME_006). Set `Table/Data Cell/Text` (`e42181be…`) và `Checkbox/Parts/Item` (`5b8403f5…`) import bình thường.
- **Font:** Header cell mặc định Roboto Medium → đổi Noto Sans JP Bold; Textarea đổi Noto Sans JP Regular (có tiếng Nhật).
- **Còn native có chủ đích (library chưa có / không có tím):** Tabs (library chỉ Default/Yellow/Company), hàng nhóm và hàng bảng cao >57 (nhiều dòng), alert/notice, modal/toast, KPI/card, calendar, stepper, segmented, thanh chọn hàng loạt. Khi library bổ sung → thay tại chỗ.
- **Nền canvas:** frame mẫu SW_HOME dùng nền trắng; spec shell (10) ghi `#F0F2F5` — chưa thống nhất, xem S7.
- Bảng tăng chiều cao so với prototype (header 48→55, hàng 54→57): nội dung bên dưới đẩy xuống, frame kéo dài tương ứng.

| # | Mâu thuẫn | Xử lý |
|---|---|---|
| S7 | Nền canvas frame mẫu trắng vs spec shell `#F0F2F5` | Frame SW_* hiện giữ nền như mẫu; hỏi Design Lead nếu cần đồng bộ |
