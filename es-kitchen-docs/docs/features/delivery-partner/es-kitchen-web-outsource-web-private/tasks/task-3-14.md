# [FE] [Delivery_Web] — 配送詳細 tab 実績: khối 陳列結果確認

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
| Depends on | task-3-13, **task-2-6 (BE)** |
| Song song với | task-3-15 |
| Estimate | ~7h |

## Mục tiêu
Bổ sung khối 陳列結果確認 vào tab 実績: 3 ô tổng (予定合計数 / 実際合計数 / 差異合計数) và bảng so sánh 予定数 vs 実際数 với cột 誤差.

## Context (đọc trước khi code)
- **Figma:** node **`31498:193469`** — khối dưới của tab 実績
- **Design-Technical.md (FE)** → FE-05
- **BE task:** `task-2-6.md` → `display`
- `components/PerformanceTab.tsx` (task-3-13)

## API Definition (copy từ BE task-2-6)
```
display: {
  plannedTotal, actualTotal, diffTotal: number
  items: Array<{ no, productCode, productName, category, photoUrl, plannedQty, actualQty, diffQty }>
} | null
```

## Yêu cầu implement

### Step 3 — sửa `components/PerformanceTab.tsx`
- 3 ô tổng phía trên bảng
- Bảng: `No · 写真 · 品番 · 商品名 · カテゴリ · 予定数 · 実際数 · 誤差`
  - `誤差 ≠ 0` → chữ đỏ (cả giá trị âm và dương)
  - `実際数 === null` (tài xế chưa nhập) → hiển thị `—`, không tính vào tổng lệch
- `display === null` → empty state như khối 廃棄数確認
- Tách thành sub-component `DisplayResultSection.tsx` để file không phình

## Unit Tests (BẮT BUỘC)
```typescript
it('renders planned/actual/diff totals', ...);
it('colors a non-zero 誤差 red for both positive and negative values', ...);
it('renders a dash when actualQty is null', ...);
it('renders the empty state when display is null', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage PerformanceTab`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Đơn có chênh lệch số lượng → cột 誤差 hiển thị đỏ đúng dòng
- [ ] Đơn chưa kiểm đếm → hiển thị `—`, tổng không sai
- [ ] Cuộn dài không làm vỡ tab

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Khối 廃棄数確認 (task-3-13) | `PerformanceTab.tsx` | Test suite task-3-13 pass |

## Không được làm
- Không cho chỉnh sửa số liệu
- Không ẩn dòng có `diffQty = 0`

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
