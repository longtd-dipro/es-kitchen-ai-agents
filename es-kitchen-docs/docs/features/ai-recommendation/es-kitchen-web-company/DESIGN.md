# DESIGN: AI Recommendation — es-kitchen-web-company

> **SPEC:** `es-kitchen-docs/docs/features/ai-recommendation/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md`
> **Reference:** `../overview.md`
> **Date:** 2026-06-02

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Page | `src/pages/order/OrderCreatePage.tsx` | EDIT — thêm step "Order Method Selection" |
| Component | `src/components/ai-recommendation/ModeSelector.tsx` | NEW (5 mode card) |
| Component | `src/components/ai-recommendation/RecommendationResultTable.tsx` | NEW |
| Component | `src/components/ai-recommendation/Mode5ManualInput.tsx` | NEW |
| Component | `src/components/ai-recommendation/Mode6ChatInput.tsx` | NEW |
| Component | `src/components/ai-recommendation/RecommendationLoadingState.tsx` | NEW |
| Hook | `src/hooks/ai-recommendation/useRecommendation.ts` | NEW (mutation + poll) |
| Hook | `src/hooks/ai-recommendation/useRecommendationRun.ts` | NEW (poll run status) |
| Service | `src/services/ai-recommendation.service.ts` | NEW |
| Route | `/orders/create` flow (multi-step) | EDIT |

---

## 2. UI Flow

```
Order Create page
  Step 1: Chọn Branch + Plan tháng
  Step 2: Order Method
    [Card] Mode 1 — Equal split (icon =)
    [Card] Mode 2 — AI: Company history (icon 🤖)
    [Card] Mode 4 — Employee preference (icon 🗳)
    [Card] Mode 5 — Manual (icon ✏️)
    [Card] Mode 6 — Chat AI (icon 💬)
  Step 3: (theo mode)
    - Mode 1/2/4: hiển thị loading → kết quả → bảng có thể chỉnh
    - Mode 5: Mode5ManualInput — bảng tất cả item, qty=0, user nhập
    - Mode 6: Mode6ChatInput — textbox + button "Run", lặp lại cho đến khi confirm
  Step 4: Review & Submit Order
```

---

## 3. Components

### 3.1 `ModeSelector`

- 5 Card với title + description ngắn từ SPEC
- Mode 3 disabled với tooltip "Phase 2 — coming soon"
- Click chọn → setState mode → next step

### 3.2 `RecommendationResultTable`

- AntD EditableTable, columns:
  | Product ID | Tên món | Category | Unit Price | Recommended Qty | Edited Qty |
- Inline edit `Edited Qty` (number input)
- Sum total + validate vs `plan_total` → cảnh báo nếu mismatch
- Footer: hiển thị category ratio actual vs target
- Button "Submit Order"

### 3.3 `Mode5ManualInput`

- Tương tự ResultTable nhưng tất cả Qty = 0
- Inline validation per row + sum constraint
- Tự tính category/price ratio realtime

### 3.4 `Mode6ChatInput`

- TextArea + "Apply Conditions" button
- History conversation panel (OQ-11 chốt) — hiển thị các condition đã apply
- Mỗi lần apply → re-run recommendation, update ResultTable

### 3.5 `RecommendationLoadingState`

- Skeleton + thời gian estimate
- Nếu run > 10s → hiển thị "Đang tối ưu hoá..." với progress (poll status)
- Error state nếu MILP infeasible (OQ-4)

---

## 4. State Management

| State | Loại |
|---|---|
| Current order draft (mode, branch, plan, items) | RTK slice `orderDraftSlice` |
| Recommendation run status (poll) | TanStack Query `useQuery({queryKey: ['ai-run', runId], refetchInterval: 2000})` |
| Mutation trigger recommend | TanStack Query mutation |

---

## 5. Interface với repo khác

| Repo | Endpoint |
|---|---|
| `es-kitchen-api` | `POST /company/ai-recommendation/recommend`, `GET /runs/:id`, `POST /runs/:id/submit-order` |

---

## 6. Luồng Mode 2 từ FE

```
1. User chọn Mode 2 → submit
2. mutation.mutate({ planMonth, mode: 'mode_2', branchId })
3. Response: { runId, status: 'pending' }
4. useQuery poll GET /runs/:runId mỗi 2s
5. Status = success → hiển thị ResultTable
6. User chỉnh số → click Submit Order
7. POST /runs/:runId/submit-order
8. Redirect to Order detail
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| Order Create flow hiện tại | `src/pages/order/...` | Thêm step có thể break flow CSV upload existing | Mode 5 = entry point cho CSV upload existing, không xoá |
| Order DTO submit | `src/services/order.service.ts` | DTO mới có thêm `aiRunId` optional | Backward-compatible field |
