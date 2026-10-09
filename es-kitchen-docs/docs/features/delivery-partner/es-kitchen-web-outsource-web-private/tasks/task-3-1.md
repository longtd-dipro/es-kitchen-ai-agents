# [FE] [Delivery_Web] — Component FileViewerModal: xem ảnh (zoom / tải / điều hướng)

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — Common
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | none — **không chờ BE** |
| Song song với | task-3-3, task-3-4 |
| Estimate | ~6h |

## Mục tiêu
Tạo component dùng chung `FileViewerModal` để xem ảnh đính kèm (レシート, 免許証, 搬入経路): zoom, tải về, chuyển ảnh trước/sau, hiển thị `n / total`.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen:** viewer ảnh — node **`31498:193797`** (`Admin_PicckingShipDetail_ImageView`)
- **Tooltip:** node `31498:194093` — `ダウンロード` / `縮小` / `拡大` / `削除` / `閉じる`
- File: `VKAAOyoSPvgoB3H2qdeeV3` — đọc qua Figma MCP trước khi code

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-17, §2.3 (lý do tách Common component)
- **Figma-Analysis.md** → §2.4

### 📂 File liên quan trong codebase
- `src/components/Common/` — xem pattern export + naming của `Base*` components
- `src/pages/collection-reports/components/BillImagesModal.tsx` — **modal ảnh đã có**, đọc trước: có thể tái dùng/nâng cấp thay vì viết mới

## API Definition
Không gọi API. Component nhận props:
```typescript
type FileItem = { url: string; fileName: string; mimeType?: string; sizeBytes?: number };
type Props = {
  files: FileItem[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
  onDelete?: (file: FileItem, index: number) => void;   // ẩn nút 削除 khi không truyền
};
```

## Yêu cầu implement

### Step 1 — Không có service (component thuần UI)
Trước khi tạo mới: đọc `BillImagesModal.tsx`; nếu trùng >70% chức năng thì **refactor nó thành `FileViewerModal`** và cập nhật chỗ đang dùng, thay vì tạo component thứ hai.

### Step 2 — Không có hook riêng
State cục bộ: `index`, `zoom`. Không tạo Redux slice.

### Step 3 — `src/components/Common/FileViewerModal.tsx`
- Header: `fileName` (trái) · nhóm nút phải: tải về · 縮小 · 拡大 · `⋮` (menu chứa 削除 khi có `onDelete`) · đóng
- Thân: ảnh căn giữa, scale theo `zoom` (bước 25%, min 50%, max 300%)
- Mũi tên trái/phải nổi 2 bên khi `files.length > 1`; footer `${index+1} / ${files.length}`
- Đóng bằng nút ✕ và phím `Esc`
- Tooltip đúng nhãn tiếng Nhật trong Figma

## Unit Tests (BẮT BUỘC)

### Test file: `src/components/Common/FileViewerModal.test.tsx`
```typescript
it('renders the file name and pager position', ...);
it('moves to the next/previous file and clamps at both ends', ...);
it('increases and decreases zoom within min/max bounds', ...);
it('hides the delete action when onDelete is not provided', ...);
it('calls onClose when pressing Escape', ...);
```
**Coverage target:** `FileViewerModal.tsx` ≥ 70% · **Verify:** `npm run test -- --coverage FileViewerModal`

## Kiểm tra Integration (BẮT BUỘC trước Request Review)
- [ ] Mount thử trong 1 page bất kỳ với 6 ảnh giả → chuyển đủ 6, pager đúng `1/6 … 6/6`
- [ ] Zoom không làm vỡ layout modal
- [ ] Không có lỗi console khi mở/đóng liên tục

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Xem ảnh biên lai ở màn 集金額 | `src/pages/collection-reports/components/BillImagesModal.tsx` | Nếu refactor → mở lại màn 集金額, ảnh vẫn xem được |

## Không được làm
- Không tự tải thư viện lightbox mới (phải xin duyệt dependency theo `POLICY.md` §4)
- Không hard-code URL ảnh
- Không xử lý PDF trong task này (task-3-2)

## Definition of Done
- [ ] Build · Lint · Type-check pass
- [ ] Unit Tests pass — coverage đạt target
- [ ] Integration check pass
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
