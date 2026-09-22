# [BE] [Delivery_Web] — Tìm kiếm trên màn スケジュール (2 nhóm điều kiện)

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — スケジュール
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-2-1, task-2-3 |
| Song song với | task-2-7 |
| Estimate | ~6h |

## Mục tiêu
Cho phép lọc lịch tháng/tuần theo 2 nhóm điều kiện của Figma: nhóm 1 `法人ID・名, 拠点ID・名, 契約ID`; nhóm 2 `住所, 郵便番号, 電話番号, 担当者電話番号`.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 `DelivererScheduleQueryRequest`
- **Figma-Analysis.md** → §2.3 (thanh search trong node `31498:190314`)
- `src/modules/deliverer/services/delivery-block.service.ts` — xem cách JOIN sang `companies` / `contracts` / `delivery_addresses` đã có, tái dùng alias

## Yêu cầu implement

### Sửa: `deliverer-schedule.service.ts`
```typescript
// applyKeywordFilters(qb, q) — dùng chung cho monthly() và weekly()
// keyword        → company.id::text ILIKE | company.name ILIKE | branch.id::text ILIKE | branch.name ILIKE | contract.id::text ILIKE
// addressKeyword → address.full ILIKE | address.postal_code ILIKE | address.tel ILIKE | contact.tel ILIKE
// Escape ký tự % và _ trong input trước khi ghép ILIKE
```

## Unit Tests (BẮT BUỘC)
```typescript
it('should match company name partially (ILIKE)', ...);
it('should match contract id exactly typed as text', ...);
it('should escape % and _ so they are treated literally', ...);
it('should AND the two keyword groups together', ...);
it('should not apply any filter when both keywords are empty', ...);
```
**Coverage:** ≥ 80% · **Verify:** `npm run test -- deliverer-schedule`

## API Definition
Bổ sung query param cho 2 endpoint đã có:
| Method | Endpoint | Param thêm |
|---|---|---|
| GET | `/deliverer/schedule/monthly` | `keyword`, `addressKeyword` |
| GET | `/deliverer/schedule/weekly` | `keyword`, `addressKeyword` |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| monthly/weekly không filter | `deliverer-schedule.service.ts` | Gọi không truyền keyword → kết quả như trước |
| Performance | — | Kiểm tra `EXPLAIN` không sinh seq-scan trên `delivery_blocks` khi có filter |

## Không được làm
- Không nối chuỗi SQL thô — dùng parameter binding của TypeORM
- Không thêm filter ngoài 2 nhóm Figma vẽ

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
