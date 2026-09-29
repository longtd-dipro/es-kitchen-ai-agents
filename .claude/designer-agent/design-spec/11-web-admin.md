# 11 — Admin Web (E03 · System Admin · 運営Web) — BLUE

> Repo: `es-kitchen-web-admin` · Screen prefix `AW_` · Ref: `refs/admin_list_AW_MAINTAIN_001.png`, `refs/admin_modal_AW_MAINTAIN_003.png`
> Figma section: MAINTAIN MANAGEMENT `20526:111624` (frames `AW_MAINTAIN_001..003`, `AW_MAIVER_001..003`, `削除確認 22464:87521`).
> Kế thừa toàn bộ `10-desktop-web-shell.md`.

## 1. Theme

| Vai trò | Hex | Variable Figma |
|---|---|---|
| primary (nav active, 保存, 検索) | `#0969DA` | `company/500` = `primary/500` = `info/500` |
| hover | `#0550AE` | `company/600` |
| subtle (sub-menu active, hover outline) | `#E5F6FF` | `info/50` / `company/50` |
| muted | `#CEEDFF` | `company/100` |
| Button theme variant | `theme=Company` | (tên ngược — xem foundation §8) |
| Login wash | `#61B3FF` | `company/300` |

**Màu phụ đặc thù Admin:** orange `admin/500 #F4860C` chỉ cho hành động/trạng thái "bảo trì" (nút 「メンテナンス終了」, pill 「メンテナンス中」, card Android đang bảo trì nền `admin/50 #FFF9EB` viền `admin/200 #FDDA8A`). Không dùng orange làm primary.

## 2. Sider menu (thực tế)

ダッシュボード · メニュー管理 · マスタ管理 · 法人・契約管理 · アカウント管理 · 売上管理 · 設定管理 (▸ メンテナンス管理 · バージョン・強制アップデート · IPホワイトリスト) — tất cả có caret (menu con).

## 3. Pattern trang đặc thù

### 3.1 メンテナンス管理 (AW_MAINTAIN_001)
- 2 **OS card** cạnh nhau (mỗi card ~560×326, radius 8, viền `divider/low`, pad 16):
  - Header: ô icon 64 (nền trắng viền, radius 8, logo Apple/Android) + tên OS `Text xl/Bold` 20 + status pill phải (稼働中 green / メンテナンス中 orange).
  - Khối nội dung nền `neutral/50` radius 8: label 「タイトル:」 12 `text/low` + value 16 `text/high`, divider, 「説明内容:」 + value.
  - Footer: nút lớn full-width trái (48) 「⏻ メンテナンス開始」 (neutral outline) / 「⏻ メンテナンス終了」 (orange solid) + nút 「✎ 編集」 (neutral outline 128).
- Bảng lịch sử bên dưới: No · 端末OS (icon 30 + tên) · タイトル · 説明内容 (ellipsis) · 開始日時 · 終了日時 (format `2025/12/08 12:36:19`).

### 3.2 Popup
- `AW_MAINTAIN_002` Confirm maintain · `AW_MAINTAIN_003` Edit (form modal 680 — xem shell §12) · `AW_MAIVER_002/003` Create/Edit Noti (1439×886 overlay).
- Tiêu đề modal: 「情報を修正する」; nút: キャンセル (outline blue) + 保存 (solid blue).

### 3.3 Bảng đặc tả trong Figma
Section chứa bảng spec (Table 2169×1952...) và text mô tả JP/VN cạnh frame — Designer nên đặt note mô tả tương tự cạnh frame mới.

## 4. Definition of Done riêng Admin
- [ ] Không có orange ngoài ngữ cảnh bảo trì.
- [ ] Nav sub-item active: chữ `#0969DA` trên `#E5F6FF`.
- [ ] Pagination active blue.
