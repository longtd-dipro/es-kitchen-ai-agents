# [FE] [Delivery_Web] — 配送詳細: chuyển sang 4 tab + chuyển khối 配送概要

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
| Depends on | **task-2-5 (BE)** |
| Song song với | task-3-5 |
| Estimate | ~7h |

## Mục tiêu
Tái cấu trúc màn 配送詳細 thành 4 tab (`配送概要 / 配送住所 / 実績 / 添付資料`) và chuyển toàn bộ field hiện có sang tab 配送概要 **không mất field nào**.

## Context (đọc trước khi code)

### 🎨 Figma
- **Screen Code:** `OW_DLVR_002` · node **`31498:190718`** (tab 配送概要)

### 🏗️ Tech Lead output
- **Design-Technical.md (FE)** → FE-04, §8 **R2** (rủi ro mất section cũ)
- **BE task:** `task-2-5.md` → response detail đã mở rộng

### 📂 File liên quan trong codebase
- `src/pages/delivery-status/DeliveryStatusDetailPage.tsx`
- `src/pages/delivery-status/components/DeliveryStatusDetailForm.tsx` — **5 section hiện có: 配送スタッフ選択 / 納品先情報 / 中継先情報 / 荷物情報 / 報告情報**
- `src/pages/orders/orderDetailTabs.constants.ts` — pattern khai báo tab

## API Definition (copy từ BE task-2-5)
| Method | Endpoint | Response |
|---|---|---|
| GET | `/delivery-blocks/:id` | field cũ + `completedAt`, `performanceNote`, `disposal` |

## Yêu cầu implement

### Step 1/2 — service/hook giữ nguyên (`useDeliveryDetail` đã có); chỉ mở rộng type
### Step 3 — Tab hoá
1. Tạo `src/pages/delivery-status/deliveryDetailTabs.constants.ts`: `overview | address | performance | attachment`
2. `DeliveryStatusDetailPage.tsx`: render tab, đồng bộ `?tab=` (pattern `SchedulePage`)
3. Tạo `components/OverviewTab.tsx` — **map từng field cũ sang tab mới**, dùng lại `DetailSection` / `DetailTextField` / `DetailDateField`
4. Tab `配送住所` / `実績` / `添付資料` render placeholder "準備中" — task-3-16/3-13/3-15 điền

**Checklist bắt buộc — đối chiếu field cũ → mới** (tick từng dòng trong PR):
- [ ] 納品先情報: 納品先名 · 住所 · 電話番号 · ご担当者 · 納品予定日
- [ ] 中継先情報: 中継先名 · 住所 · 電話番号 · ご担当者
- [ ] 荷物情報: 送り状No · 配送会社 · 荷物名 · 発送予定日 · 納品日 · 備考
- [ ] 報告情報: 駐車料金 · レシート画像 · 報告画像 · 配送スタッフ連絡欄
- [ ] Field mới theo Figma: 配送ステータス · 荷物温度帯 · クール便 · 配送区分 · 送り状No (nhiều dòng)

> Field nào Figma xếp sang tab khác (vd 駐車料金 → 添付資料) thì **ghi rõ trong PR** là sẽ chuyển ở task nào, không xoá khi tab đích chưa làm.

## Unit Tests (BẮT BUỘC)
```typescript
it('renders 4 tabs and defaults to overview', ...);
it('syncs the active tab to the URL query', ...);
it('renders every legacy field in the overview tab', ...);   // ← chống regression R2
it('fetches the detail only once for all tabs', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage DeliveryStatusDetail`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Mở 1 配送 thật: tab 配送概要 hiển thị đủ dữ liệu như màn cũ
- [ ] Đổi tab **không** gọi lại API
- [ ] Reload với `?tab=performance` mở đúng tab

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Màn 配送詳細 cũ | `DeliveryStatusDetailForm.tsx` | Checklist field ở trên tick đủ |
| Gán tài xế | `DeliveryStatusDetailForm.tsx` | Chức năng gán vẫn dùng được (panel chuyển ở task-3-12) |
| Mở từ lịch tuần | `WeeklyListTab.tsx` | Vào detail từ lịch vẫn đúng |

## Không được làm
- Không xoá field cũ khi chưa có tab đích
- Không tách thành 4 query
- Không đổi endpoint

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Checklist field tick đủ trong PR
- [ ] Integration check pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
