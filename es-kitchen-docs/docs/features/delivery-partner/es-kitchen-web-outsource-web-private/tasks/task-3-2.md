# [FE] [Delivery_Web] — FileViewerModal: hỗ trợ PDF + hành động xoá

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — Common
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 4h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-1 |
| Song song với | task-3-3 |
| Estimate | ~4h |

## Mục tiêu
Cho phép viewer xử lý file PDF (không preview, chỉ hiện dung lượng + tải về) và hoàn thiện hành động 削除 trong menu `⋮`.

## Context (đọc trước khi code)
- **Figma:** node **`31498:193947`** (`..._ImageView_PDF`) — hiện icon PDF, `2.4 MB`, `このファイルはプレビューできません。`, nút zoom **disabled**
- **Design-Technical.md (FE)** → FE-17
- `src/components/Common/FileViewerModal.tsx` — file tạo ở task-3-1

## Yêu cầu implement

### Step 3 — Sửa `FileViewerModal.tsx`
```typescript
// isPdf = mimeType === 'application/pdf' || fileName.endsWith('.pdf')
// isPdf → render icon PDF + formatBytes(sizeBytes) + text 'このファイルはプレビューできません。'
//         disable nút 縮小 / 拡大, giữ nút tải về + điều hướng + pager
// Menu ⋮ → mục 削除 (màu đỏ) gọi onDelete, có confirm trước khi xoá
```

## Unit Tests (BẮT BUỘC)
```typescript
it('renders the PDF placeholder instead of an image for application/pdf', ...);
it('disables zoom controls for PDF files', ...);
it('formats the file size in MB', ...);
it('asks for confirmation before calling onDelete', ...);
it('keeps navigation working in a mixed image/PDF list', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage FileViewerModal`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Danh sách trộn ảnh + PDF: chuyển qua lại hiển thị đúng chế độ từng file
- [ ] Nút tải về PDF tải đúng file

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Xem ảnh (task-3-1) | `FileViewerModal.tsx` | Test suite của task-3-1 vẫn pass |

## Không được làm
- Không nhúng thư viện render PDF (Figma yêu cầu không preview)
- Không tự xoá file khi `onDelete` không được truyền

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Actual Hour · Status → `Done` → `Reviewing`
