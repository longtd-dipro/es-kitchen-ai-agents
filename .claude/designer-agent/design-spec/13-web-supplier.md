# 13 — Supplier Web (E04 · 仕入先Web) — PURPLE

> Repo: `es-kitchen-web-supplier` · Screen prefix `SW_` · Ref: `refs/supplier_detail_SW_HOME_006.png`
> Figma: `SW_HOME_006-Processing shipments` `19558:178039` (1440×1571).
> Kế thừa toàn bộ `10-desktop-web-shell.md`.

## 1. Theme

| Vai trò | Hex | Ghi chú |
|---|---|---|
| primary (nav active, 保存, 検索) | `#6639BA` | Không có theme variant trong library → **override fill** |
| hover | `#512A97` | |
| info card bg | `#F1F1FF` | viền `#D8B9FF`/`#ECD8FF` |
| cell highlight / subtle | `#ECE8FC` / `#FBEFFF` | |
| outline button | viền + chữ `#6639BA` | 「クリア」 |
| `slot/stroke` | `#6639BA` | viền slot |

Code production E04 có thể còn orange — Designer luôn dùng purple (designer-context §8.1). Trạng thái **không** dùng tím (chỉ 4 tone status).

## 2. Sider menu (thực tế)

TOP · 受注一覧 · **注文管理** (active) · 会社のプロフィール.

## 3. Pattern trang đặc thù — 出荷処理 (chi tiết đơn)

1. Page header: breadcrumb 「受注一覧 / 出荷処理」, title 「出荷処理」; nút 「戻る」(neutral outline) · 「この発注をキャンセルする」(negative outline) · 「保存」(solid purple).
2. **Info card** đầu: nền `#F1F1FF`, radius 12, pad 16/24: icon hộp 24 + 「商品名 (10002)」 `Text lg`; 2 cột cặp label/value (label `text/low` 16 + value Medium `text/high`): メニュー年月 · 発注明細No · カテゴリ · 備考.
3. Section **必要数** (collapsible, band `neutral/50` + vạch trái purple): search panel lồng (倉庫 select, 開始日~終了日, クリア outline purple, 検索 solid purple); **bảng ma trận** 倉庫/日付 × ngày 1..14 (cột 42.86) + 基準数計/予測数/選択必要数/合計 (nền `neutral/50`), row 45; ô được chọn nền `#ECE8FC`; scrollbar ngang.
4. Section **在庫情報**: 3 ô KPI (359×56, viền `neutral/200` radius 8): nhãn trái 16 + số phải 20 (「43,356」).
5. Section **発注情報** + Badge 「仮発注済」 (success): lưới form 3 cột (仕入先*, 納入倉庫* select, ロット read-only) → textarea 仕入備考 (0/100) → 4 cột (仮発注数*, 希望納期* date, 本発注*, 希望賞味期限 date) → textarea.
6. Band **仕入先回答**: nền `success-50`, tiêu đề 20 + Badge 「納期回答済み」, dòng 「株式会社やまぶん Sales Team」, phải: 「出荷予定日 (Ngày giao dự kiến): 2024/12/01」.

> Figma Supplier đang ghi nhãn song ngữ JP (VN) — đó là note cho team; màn production chỉ tiếng Nhật trừ khi SPEC yêu cầu.

## 4. Definition of Done riêng Supplier
- [ ] Mọi fill primary = `#6639BA` (override), không orange/blue.
- [ ] Section band có vạch trái purple.
- [ ] Không dùng tím cho badge trạng thái.
