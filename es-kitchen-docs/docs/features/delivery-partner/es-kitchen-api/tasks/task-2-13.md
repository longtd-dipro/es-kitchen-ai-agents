# [BE] [Delivery_Web] — 配送管理: filter enum (温度帯, 自販機, 配送方法) + sắp xếp

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
| Song song với | task-2-12 |
| Estimate | ~5h |

## Mục tiêu
Bổ sung 3 filter dạng enum và hoàn thiện sắp xếp cho danh sách 配送管理.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-11
- **Figma-Analysis.md** → §2.4, node `31498:193284`
- `src/commons/enums/cargo-type.enum.ts`, `delivery-type.enum.ts`, `delivery-mode.enum.ts`
- `delivery-block-search.request.ts` — đã có `sortBy` + `order` + `static get allowedSortBy()` → **mở rộng whitelist, không viết cơ chế mới**
- `src/entities/quotation-request.entity.ts` — `vending_machine_type` (tham chiếu giá trị 自販機)

## Yêu cầu implement

### Sửa: `delivery-block-search.request.ts`
```typescript
cargoType?: CargoType;         // 荷物温度帯 — 冷凍 / 冷蔵・常温 / 資材
vendingMachine?: string;       // 自販機 — xác nhận nguồn giá trị trước khi hard-code enum
deliveryMethod?: DeliveryType; // 配送方法 — ES配送 / COOL便 ...
// Mở rộng allowedSortBy: thêm các cột Figma cho phép sort (配送日（着） mặc định)
```

### ⚠️ Trường 自販機
Chưa xác định chắc nguồn dữ liệu trong `delivery_blocks`. Trước khi code: `tilth_search` xác nhận cột/quan hệ thật. **Không đoán** — nếu không tìm thấy, ghi lại và hỏi Tech Lead, tạm thời bỏ filter này khỏi scope task.

## Unit Tests (BẮT BUỘC)
```typescript
it('should filter by cargoType enum', ...);
it('should reject an invalid enum value with 400', ...);
it('should sort by an allowed column only', ...);
it('should fall back to the default sort when sortBy is not whitelisted', ...);
```
**Coverage:** ≥ 80% · **Verify:** `npm run test -- delivery-block`

## API Definition
| Method | Endpoint | Param thêm |
|---|---|---|
| GET | `/deliverer/delivery-blocks` | `cargoType`, `vendingMachine`_(nếu xác nhận được nguồn)_, `deliveryMethod` |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Sort hiện tại (`scheduledDeliveryDate` mặc định) | `delivery-block-search.request.ts` | Không truyền `sortBy` → thứ tự như cũ |
| Filter cũ | `delivery-block.service.ts` | Test suite cũ pass |

## Không được làm
- Không hard-code giá trị enum không tồn tại trong `commons/enums/`
- Không bỏ cơ chế whitelist `allowedSortBy` đang có

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] Kết luận về trường `自販機` ghi rõ trong PR
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
