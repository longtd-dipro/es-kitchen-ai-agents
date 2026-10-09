# 10 — Desktop Web Shell (chung Admin · Company · Supplier · Công ty vận chuyển E05)

> 4 web portal dùng **cùng 1 shell + cùng bộ component**, chỉ đổi màu primary (xem `00-foundation.md` §1 và file 11–14).
> Đo từ metadata `SW_HOME_006` (19558:178039), `OW_SCHED_001` (31498:191879), `AW_MAINTAIN_001` (20526:111707), `CW_ORDER_003` (27216:394503).

---

## 1. Frame

- Width **1440** (một số frame 1442 do viền — dùng 1440). Height: **1024** mặc định cho màn 一覧; chi tiết dài → cao theo nội dung (vd 1571), KHÔNG cắt.
- Layout ngang: `sider 210` + `Container 1230` (x = 210).

```
┌─────────┬──────────────────────────────────────────────────────────┐
│ sider   │ Header 1230×54 (white)                                   │
│ 210     ├──────────────────────────────────────────────────────────┤
│ (white) │ .Page-Header 1230×94  pad 20/24                          │
│         │   Breadcrumb (22) + Title 24/32 ─────── [button list 48] │
│         ├──────────────────────────────────────────────────────────┤
│         │ Content (page-bg #F0F2F5) — card trắng x=24, w=1182      │
│         │   pad 16 · [SearchPanel] · [Table] · [Pagination]        │
│ Sol     │                                                          │
│ ≡ fold  │                                                          │
└─────────┴──────────────────────────────────────────────────────────┘
```

## 2. Sider (210 × full height)

- Nền trắng, cạnh phải `drop-shadow/0.15`. Phần đáy có gradient rất nhạt màu `primary-50` (Company: vàng cam nhạt; Admin: xanh nhạt).
- **Logo block** 210×54: logo ESSTATION (mặt trời + chảo, chữ cam/đỏ).
- **Nav item** 184×48 (inset 13px), radius 8, icon 20 (Phosphor Regular, `text/middle`) + label `Text md/Regular` 16, gap 8, pad-left 12. Mục có menu con → caret-down 20 ở phải.
  - Default: nền trắng, chữ `text/middle`.
  - **Active (parent)**: nền `primary` solid, chữ + icon trắng, **Bold**, caret-up.
  - **Sub-item** (không icon, indent ~46): Active = nền `primary-subtle`, chữ `primary` (Admin `#0969DA` trên `#E5F6FF`; Company `#F4860C` trên `#FFEFDE`).
  - Label dài → ellipsis 「バージョン・強…」.
- Đáy: mascot **Sol** (~130×150) + icon menu-fold 20 ở góc trái dưới.
- < 1280px → thu về 80px (chỉ icon). Component: `Dashboard-expand-collapse-unselect` (local) — mỗi nav item là 1 instance.

## 3. Header (1230 × 54)

- Nền trắng, đáy kẻ `divider/low`.
- Trái (pad 24): icon mặt trời 28 + 「お帰りなさい」 `Text md/Regular` `text/high`.
- Phải: icon sách (manual) 24 · avatar tròn 36 (mascot) · tên user/công ty `Text md/Regular` · caret-down 20. Gap 12–16.

## 4. Page Header (`.Page-Header(Legacy)` 1230 × 94)

- Pad 20 dọc / 24 ngang. Breadcrumb 22 cao: `Text sm` 14, mục trước `text/low`, mục cuối `text/high`, separator 「/」 `neutral/300`.
- Title `24/32 Medium` `text/high`, cách breadcrumb 4.
- **Button list** bên phải (cao 48, gap 12): thứ tự trái→phải = phụ → chính. Ví dụ Supplier: 「戻る」(neutral outline 80) · 「この発注をキャンセルする」(negative outline) · 「保存」(primary solid 84).
- Màn 一覧 CRUD: 「CSV取込」→「CSV出力」→「新規登録」(solid + icon Plus).
- Company có thêm **Tab cửa hàng** ngay dưới title (xem file 12).

## 5. Content card

- Nền canvas `#F0F2F5`; card trắng radius 8 (hoặc 0 khi full-bleed), margin 24, padding 16, các khối cách 16.

## 6. Search Panel (`Collab Tab` — vùng điều kiện tìm kiếm)

- Nền `neutral/50 #F6F8FA`, **vạch trái 3px màu primary**, cao 56–60 (1 dòng), padding 8/16.
- Đầu dòng: Icon Button tròn 32 (caret up/down) để thu gọn — chỉ hiện khi field rơi xuống dòng 2.
- Field: Input/Select/DatePicker cao **40–44**, radius 6, viền `neutral/200`, placeholder `text/low` 14. Select 176–345px, ô search tự do 240–440px. Date range: 2 input 195 + dấu 「~」 (icon tilde 24) ở giữa.
- Radio/checkbox lọc inline (vd ● 配送日（着））.
- Phải: 「クリア」 (outline primary, 97×40–44) + 「検索」 (solid primary 97×40–44), gap 12.

## 7. Table (`Table/Column-Based`)

- Header row **55**, nền `neutral/50`, chữ `Text sm` **Bold** `text/high`, pad ngang 8. Cột checkbox 38.
- Data row **54** (53 + divider 1 `divider/low`); có badge → 57. Chữ `Text sm/Regular` `text/middle`/`text/high`, pad 8, text dài 2 dòng hoặc ellipsis 「…」.
- Cột đầu `No` (số thứ tự) hoặc ID link. **Link** (ID / 配送No / tên SP) = `#0969DA`, (Company: gạch chân).
- Cột số → căn phải. Cột thao tác 「操作」: icon bút chì (編集) + thùng rác (削除) 20. Hàng 削除済 → nền `surface-disabled`, không icon.
- Cột cố định/tổng (vd 基準数計, 合計) có thể nền `neutral/50`. Ô highlight chọn: `primary-subtle`.
- Bảng rộng → cuộn ngang, scrollbar 8px dưới bảng.
- Components: `table-header/default`, `Table/Data Cell/Text` (key ở designer-context §11.2).

## 8. Pagination (`pagination` 1150–1198 × 48)

Căn phải: 「100件中 1–10件」 `Text sm` · `<` · 1 · `…` · 4 · 5 · **6** · 7 · 8 · `…` · 50 · `>` · select 「10件／ページ」.
Item 32×32 radius 6 viền `neutral/200`; active = viền + chữ **primary** (Admin/Logistic lib mặc định blue; Company override orange).

## 9. Badge / Tag / Status

> ✅ **Quyết định 2026-09-29: DÙNG CHUNG** — mọi kiểu dưới đây là bộ component chung cho **tất cả platform** (web + mobile + driver), không gắn riêng portal nào.
> **Quy tắc chọn:** trạng thái **tiến trình / luồng xử lý** (出荷・配送・受取 — thay đổi theo bước) → **Status solid**; trạng thái **bản ghi** (契約・拠点・公開 — thuộc tính tương đối tĩnh) → **Badge soft** (nền 100 + chữ 700); **thuộc tính sản phẩm / nhãn** → **Tag outline**; trạng thái vận hành có tính "đang diễn ra" → **Status pill + dot**.

| Loại | Style | Ví dụ |
|---|---|---|
| **Tag outline** (`Tag` component) | nền trắng, viền 1px màu tone, chữ cùng màu `Text xs/bold` ls 5%, radius 4, pad 2/8, min-w 48 | おすすめ (green) · 短消費期限 (red) · NEW (blue) · 未配送 (warning) |
| **Status pill + dot** | radius full, nền tone-50, dot 6 + chữ tone-500 12 bold | 稼働中 (success) · メンテナンス中 (orange `admin/*`) |
| **Status solid** (vd 配送状況) | nền solid tone, chữ trắng 12 bold, radius 4, 70×20 | 出荷準備 (yellow) · 出荷済 (green) · トラブル (red) · 配送完了 (blue) · 荷受済 (info-50 nền + chữ blue) |
| Badge contract/拠点 (artifact) | nền tone-100 + chữ tone-700 | 本登録 success · 仮登録 info · 休止中 warning · 解約 negative · 満了 neutral |
| **TempTag** (配送温度帯) | radius 4, icon 14 + chữ 12 | 冷凍: nền `#0969DA` chữ trắng + ❄ · 冷蔵・常温: nền `#97D3FF`/info-100 chữ blue + tủ lạnh · 資材: nền `#FDDA8A` chữ nâu + hộp |

## 10. Form (màn chi tiết / 編集 / 新規登録)

- Section có thể thu gọn (`Collap`): **band tiêu đề** cao 48, nền `neutral/50`, **vạch trái 3px primary**, tiêu đề `Text lg`/20 Regular `text/high` (có thể kèm Badge), Icon Button tròn 32 (caret-up) bên phải. Nội dung pad 16.
- Lưới field: 3 cột (354 + gap 24) hoặc 4 cột (259.5 + gap 24) trong 1110.
- Field = label `Text sm/bold-pro` hoặc 16 Medium `text/high` + `*` đỏ + input **40** (radius 6) + helper 12 `text/low`. Cao tổng 74.
- Input read-only/disabled: nền `neutral/50`, chữ `text/low`.
- Textarea: cao 80, bộ đếm 「0/100」 góc phải dưới 12 `text/low`.
- Date input: icon lịch 20 bên phải, format 「2025/04/12」.
- Info card đầu trang (Supplier): nền primary-subtle radius 12 viền primary-100, icon 24 + tên `Text lg` + các cặp label (`text/low`)/value (`text/high` Medium).
- Band kết quả/phản hồi: nền `success-50` full width, tiêu đề 20 + Badge + meta phải.

## 11. Buttons

| Variant | Style | Cao |
|---|---|---|
| Primary solid | nền primary, chữ trắng Medium, radius 6 | sm 32 · md 40 · lg 48 |
| Primary outline | nền trắng, viền primary, chữ primary; hover nền primary-subtle | 32/40/48 |
| Neutral outline | nền trắng, viền `neutral/200`, chữ `text/middle`, `box-shadow/raise` | 32/40/48 |
| Negative outline | viền + chữ `#CF222E` | 48 |
| Negative solid (削除) | nền `#CF222E`, hover `#A40E26` | 40/48 |
| Warning action (Admin メンテナンス終了) | nền `#F4860C` chữ trắng | 48 |
| Icon Button | tròn 32 (ghost/outline) hoặc vuông 32 radius 6 | 32 |
| CSV (CsvButton) | nền trắng, viền primary-300, icon khay + chữ primary, cao 48 | 48 |

Icon trong nút 20, gap 8. Nút có icon trước chữ (vd ⏻ メンテナンス開始, ✎ 編集, 🗑 すべてクリア).

## 12. Modal

- **Form modal** (`[AW_MAINTAIN_003] Popup Edit`): rộng ~680, radius 12, `box-shadow/popOut`, scrim `rgba(0,0,0,.45)`.
  - Header pad 24: tiêu đề `Text xl/Bold` 20 「情報を修正する」 + icon X 24 phải; divider.
  - Body pad 24: label bold 16 + `*` đỏ, input 40, textarea + counter.
  - Footer divider, căn phải: 「キャンセル」 (outline primary 140×48) + 「保存」 (solid primary 140×48), gap 16.
- **Confirm** (`削除確認`): **450 × 316**, icon tròn đỏ 「!」 48 căn giữa, tiêu đề 「削除しますか？」 20 bold, mô tả 14 `text/middle` căn giữa, 2 nút full-width chia đôi: キャンセル (outline) + 削除 (solid đỏ). X góc phải.
- Toast: góc trên phải/giữa, `box-shadow/popOut`, icon check + 「保存しました」.

## 13. Mẫu CRUD (artifact — áp dụng cả 4 site)

- **一覧**: page header 「CSV取込」「CSV出力」「新規登録」; ID cột đầu là link → 詳細; cột 「操作」 bút chì/thùng rác.
- **詳細**: title 「〇〇詳細 ID」, nút 「削除」(outline negative) + 「編集」(solid); field readOnly.
- **編集**: title 「〇〇編集 ID」, 「キャンセル」+「保存」. **新規登録**: 「〇〇新規登録」, 「キャンセル」+「登録」.
- Rời khi có thay đổi → ConfirmDiscard. 削除 → ConfirmDelete → về 一覧 + toast.

## 14. Definition of Done — màn Desktop Web

- [ ] Frame 1440 wide, sider 210 + container 1230, header 54, page header 94.
- [ ] Primary đúng portal (file 11–14), dùng variable đúng tên (xem bẫy đặt tên §8 foundation).
- [ ] Nav active đúng mục, sub-item active đúng style.
- [ ] Search panel có vạch trái primary; クリア outline + 検索 solid.
- [ ] Table header 55 / row 54, ≥ 10 dòng data thật (JP), pagination đủ.
- [ ] Mascot Sol + logo có mặt; không emoji; font Noto Sans JP.
- [ ] Component là instance (Button/Input/Table cell/Pagination/Badge), không rectangle.
