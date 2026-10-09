# [BE] [Delivery_Web] — 配送管理: filter theo từ khoá (拠点, 住所, 配送元, 送り状/スタッフ)

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送管理
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 5h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-13 |
| Estimate | ~5h |

## Mục tiêu
Bổ sung 4 điều kiện tìm kiếm dạng từ khoá cho `GET /deliverer/delivery-blocks` theo bộ lọc nâng cao của Figma.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-11 (ghi chú: **không thêm `dateType`**, dùng 2 cặp range sẵn có)
- **Figma-Analysis.md** → §2.4, node `31498:193284`
- `src/modules/deliverer/http/requests/delivery-block-search.request.ts` — **param đang có:** `shipmentNo`, `scheduledSendDateFrom/To`, `deliveryDateFrom/To`, `transitPointId`, `status`, `page`, `limit`, `sortBy`, `order`
- `src/modules/deliverer/services/delivery-block.service.ts`

## Yêu cầu implement

### Sửa: `delivery-block-search.request.ts` — THÊM (giữ nguyên param cũ)
```typescript
branchKeyword?: string;          // 拠点ID・名
addressKeyword?: string;         // 配送先住所 / 郵便番号 / 電話番号 / 担当者電話番号
origin?: string;                 // 配送元
trackingOrStaffKeyword?: string; // 送り状番号 / 配送スタッフID / 配送スタッフ名
```

### Sửa: `delivery-block.service.ts` — áp filter vào query builder
Escape `%` và `_`; dùng parameter binding, không nối chuỗi.

## Unit Tests (BẮT BUỘC)
```typescript
it('should filter by branch id or branch name', ...);
it('should match address, postal code, tel and contact tel with one keyword', ...);
it('should match tracking no, driver code and driver name with one keyword', ...);
it('should escape % and _ in keywords', ...);
it('should keep existing shipmentNo/status/date filters unchanged', ...);
```
**Coverage:** ≥ 80% · **Verify:** `npm run test -- delivery-block`

## API Definition
| Method | Endpoint | Param thêm |
|---|---|---|
| GET | `/deliverer/delivery-blocks` | `branchKeyword`, `addressKeyword`, `origin`, `trackingOrStaffKeyword` |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Màn 配送状況 FE hiện tại | FE `DeliveryFilterBar.tsx` | Filter cũ (`shipmentNo`, ngày, status) vẫn chạy |
| Hiệu năng list | — | `EXPLAIN` không sinh seq-scan lớn khi lọc |

## Không được làm
- Không đổi tên / bỏ param cũ
- Không thêm `dateType` — radio 配送日（着） map sang cặp range đã có

## Definition of Done
- [ ] Build · Lint · Unit Tests pass · Non-Regression verify đủ
- [ ] Actual Hour · Status → `Done` → `Reviewing`
