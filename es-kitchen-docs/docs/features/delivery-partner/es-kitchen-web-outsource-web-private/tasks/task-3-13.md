# [FE] [Delivery_Web] — 配送詳細 tab 実績: khối 廃棄数確認

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-11, **task-2-5 (BE)** |
| Song song với | task-3-12 |
| Estimate | ~7h |

## Mục tiêu
Tab 実績: khối 配送実績 (配送完了日時 + 備考) và bảng 廃棄数確認 với 4 ô tổng + bảng item kèm cảnh báo 賞味期限.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_DLVR_002` · node **`31498:193469`** — khối trên cùng + bảng 廃棄数確認

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-05
- **BE task:** `task-2-5.md` → `completedAt`, `performanceNote`, `disposal`

### 📂 File liên quan
- `src/pages/delivery-status/deliveryDetailTabs.constants.ts` (task-3-11)
- `src/components/Common/` — `BaseTableEdit` / table wrapper hiện có

## API Definition (copy từ BE task-2-5)
```
completedAt: string | null
performanceNote: string | null
disposal: {
  totalDisposed, totalLogicalStock, totalActualStock, totalDifference: number
  items: Array<{ no, productCode, productName, category, photoUrl,
                 disposedQty, expiryDate, logicalStock, actualStock }>
} | null
```

## Yêu cầu implement

### Step 1/2 — không thêm service/hook (dùng `useDeliveryDetail` sẵn có)
### Step 3 — `components/PerformanceTab.tsx`
- Khối `配送実績`: `配送完了日時` (readonly) + `備考` (readonly, counter `0/100` như Figma)
- Khối `廃棄数確認`: 4 ô tổng `廃棄数 / 理論在庫 / 実在庫 / 差異`
- Bảng: `No · 写真 · 品番 · 商品名 · カテゴリ · 廃棄数 · 賞味期限 · 理論在庫 · 実在庫`
  - `賞味期限` < hôm nay → chữ đỏ
  - `廃棄数 > 0` → chữ đỏ
  - `写真` bấm được → mở `FileViewerModal` (task-3-1)
- `disposal === null` → empty state. ⚠️ **[PENDING Q8]** nội dung empty state chưa được nghiệp vụ chốt → tạm dùng `データがありません。` và ghi chú trong PR

## Unit Tests (BẮT BUỘC)
```typescript
it('renders the four summary boxes from the disposal totals', ...);
it('colors an expired 賞味期限 red', ...);
it('colors a positive 廃棄数 red', ...);
it('renders the empty state when disposal is null', ...);
it('opens the file viewer when a product photo is clicked', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage PerformanceTab`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Mở 1 配送 đã có report của tài xế → bảng hiển thị dữ liệu thật
- [ ] Mở 1 配送 chưa có report → empty state, không crash
- [ ] Bấm ảnh sản phẩm → viewer mở đúng ảnh

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Tab 配送概要 | `OverviewTab.tsx` | Không bị ảnh hưởng khi đổi tab |
| FileViewerModal | `src/components/Common/FileViewerModal.tsx` | Dùng lại, không sửa component |

## Không được làm
- Không cho sửa dữ liệu 実績 (portal chỉ đọc — dữ liệu do Driver App ghi)
- Không tự tính lại 差異 nếu BE đã trả
- Không gọi thêm API

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Ghi chú `[PENDING Q8]` trong PR
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
