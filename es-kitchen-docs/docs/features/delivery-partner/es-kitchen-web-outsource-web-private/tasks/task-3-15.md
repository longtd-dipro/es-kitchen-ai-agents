# [FE] [Delivery_Web] — 配送詳細 tab 添付資料 (駐車報告 + 集金報告)

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 8h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-11, **task-2-6 (BE)**, task-3-1 |
| Song song với | task-3-14 |
| Estimate | ~8h |

## Mục tiêu
Tab 添付資料: khối 駐車報告 (phí đỗ xe + ảnh biên lai) và khối 集金報告 (số tiền dự kiến / thực thu).

## Context (đọc trước khi code)
- **Figma:** node **`31498:193742`**
- **Design-Technical.md (FE)** → FE-06
- **BE task:** `task-2-6.md` → `attachments`
- `src/components/Common/FileViewerModal.tsx` (task-3-1/3-2)
- `src/pages/delivery-status/components/DetailSection.tsx`, `DetailTextField.tsx` — tái dùng

## API Definition (copy từ BE task-2-6)
```
attachments: {
  parking:    { fee: string | null, receiptUrls: string[] }
  collection: { expectedAmount: string | null, collectedAmount: string | null, difference: string | null }
}
```

## Yêu cầu implement

### Step 3 — `components/AttachmentTab.tsx`
- `駐車報告`: `駐車料金` (readonly, format `1,500円`) + thumbnail từng ảnh trong `receiptUrls`, có tên file dưới ảnh
- Bấm thumbnail → `FileViewerModal` với toàn bộ `receiptUrls` và đúng `initialIndex`
- `集金報告`: `集金予定額` · `集金額` (readonly). Nếu BE trả `difference` khác 0 → hiển thị nổi bật
- Không có ảnh → khối vẫn hiện, phần ảnh để trống theo Figma

## Unit Tests (BẮT BUỘC)
```typescript
it('formats the parking fee with thousand separators and 円', ...);
it('opens the viewer at the clicked receipt index', ...);
it('renders the collection amounts read-only', ...);
it('renders without receipts without crashing', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage AttachmentTab`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Đơn có biên lai thật → xem được ảnh, tải về được
- [ ] Đơn không có biên lai → không lỗi
- [ ] Số tiền hiển thị khớp màn 集金管理

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Section 報告情報 cũ | `DeliveryStatusDetailForm.tsx` | Sau khi chuyển sang tab này, gỡ khỏi tab 配送概要 để không hiển thị 2 nơi |
| Màn 集金額 | `BillDetailPage.tsx` | Cùng nguồn dữ liệu — số liệu 2 màn phải khớp |

## Không được làm
- Không cho upload ở tab này (upload thuộc tab 配送住所 — task-3-16)
- Không tự tính lại 差異

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
