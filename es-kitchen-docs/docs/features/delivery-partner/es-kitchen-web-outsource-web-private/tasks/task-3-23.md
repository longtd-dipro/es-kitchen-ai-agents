# [FE] [Delivery_Web] — 配送スタッフ詳細: tab 担当配送情報

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Frontend |
| Repo | `es-kitchen-web-outsource-web-private` |
| Depends on | task-3-22, **task-2-12 (BE)**, **task-2-10 (BE)** |
| Song song với | task-3-24 |
| Estimate | ~6h |

## Mục tiêu
Tab hiển thị các chuyến của 1 nhân viên trong khoảng thời gian, kèm tổng 集金/駐車 và bộ lọc 配送状況.

## Context (đọc trước khi code)
- **Figma:** node **`31498:192634`** — filter kỳ + `配送状況`, 2 ô tổng, bảng 10 cột
- **Design-Technical.md (FE)** → FE-10
- **BE task:** `task-2-12.md` (filter list), `task-2-10.md` (tổng 集金/駐車)
- `src/pages/delivery-status/components/deliveryColumns.tsx` — tái dùng định nghĩa cột

## API Definition
| Method | Endpoint | Request |
|---|---|---|
| GET | `/delivery-blocks` | `?trackingOrStaffKeyword=<driverCode>&deliveryDateFrom&deliveryDateTo&status&page&limit` |

> Nếu BE bổ sung param `driverId` riêng thì ưu tiên dùng — **hỏi BE trước, không tự lọc ở FE**.

## Yêu cầu implement

### Step 1/2 — dùng lại `delivery.service.ts` + `useDeliveries` với params riêng
### Step 3 — `components/AssignedDeliveryTab.tsx`
- Filter: khoảng ngày (mặc định tháng hiện tại) + dropdown `配送状況` + `クリア` / `検索`
- 2 ô tổng: `集金合計金額` · `駐車合計料金`
- Bảng: `No · 配送日（着） · 荷物温度帯 · 配送No · 荷受け住所 · 届け先拠点名 · 届け先住所 · 配送状況 · 配送区分 · 集金合計金額 · 駐車合計料金`
- Bảng rộng → `scroll.x`; `配送No` bấm được → mở 配送詳細

## Unit Tests (BẮT BUỘC)
```typescript
it('queries deliveries scoped to the current driver', ...);
it('defaults the date range to the current month', ...);
it('renders the collection and parking totals', ...);
it('navigates to the delivery detail from the shipment link', ...);
it('renders an empty state when the driver has no delivery in range', ...);
```
**Coverage:** ≥ 70% · **Verify:** `npm run test -- --coverage AssignedDeliveryTab`

## Kiểm tra Integration (BẮT BUỘC)
- [ ] Nhân viên có chuyến thật → bảng đúng dữ liệu, tổng khớp màn 集金管理
- [ ] Lọc theo 配送状況 hoạt động
- [ ] Bấm 配送No mở đúng chi tiết

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Danh sách 配送管理 | `DeliveryStatusPage.tsx` | Dùng chung service — filter ở màn kia không bị ảnh hưởng |
| Tab 基本情報 | `EmployeeDetailPage.tsx` | Đổi tab không mất dữ liệu tab kia |

## Không được làm
- Không lọc theo nhân viên ở phía FE (phải do BE lọc)
- Không tự tính tổng từ trang hiện tại (tổng phải của toàn bộ kết quả lọc)

## Definition of Done
- [ ] Build · Lint · Type-check · Unit Tests pass
- [ ] Integration check pass · Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
