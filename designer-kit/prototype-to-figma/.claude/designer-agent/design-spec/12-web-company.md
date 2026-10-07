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
