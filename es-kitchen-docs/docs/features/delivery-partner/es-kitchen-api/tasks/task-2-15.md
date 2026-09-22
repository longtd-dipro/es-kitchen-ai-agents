# [BE] [Delivery_Web] — API lịch sử thay đổi 配送スタッフ

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 6h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-10 |
| Estimate | ~6h |

## Mục tiêu
Tạo `GET /deliverer/drivers/:id/history` phục vụ tab 変更履歴 — mirror thiết kế `GET /admin/drivers/:id/history` đã có trong tài liệu Phase 1, nhưng scope theo deliverer.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-14, §4.0 (đối chiếu: admin đã có endpoint tương ứng)
- **Figma-Analysis.md** → §2.6, node `31498:192891` — ⚠️ **dữ liệu mẫu trong Figma là của màn sản phẩm (C4), đừng copy vào test**
- `src/entities/driver-history-log.entity.ts` — `driver_id`, `content`, `changed_by`, `created_at`
- `src/modules/admin/...` — tìm implementation `admin/drivers/:id/history` nếu đã có, tái dùng shape response

## Yêu cầu implement

### Sửa: `deliverer-driver.controller.ts` + `deliverer-driver.service.ts`
```typescript
@Get(':id/history')
// service.getHistory(delivererId, driverId, { page, limit })
// 1. Verify driver.deliverer_id === delivererId → 404 nếu không
// 2. Query driver_history_logs ORDER BY created_at DESC, phân trang
```

## Unit Tests (BẮT BUỘC)
```typescript
it('should return history ordered by created_at desc', ...);
it('should paginate correctly', ...);
it('should return 404 when the driver belongs to another deliverer', ...);
it('should return an empty list when the driver has no history', ...);
```
**Coverage:** service ≥ 80%, controller ≥ 70% · **Verify:** `npm run test -- deliverer-driver`

## API Definition
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/drivers/:id/history` | `?page&limit` | `{ items: Array<{ changedAt, content, changedBy }>, total, page, limit, totalPages }` |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Route `/deliverer/drivers/:id` | `deliverer-driver.controller.ts` | Route con `:id/history` không shadow route detail |
| Ghi log ở task-2-8 | `deliverer-driver.service.ts` | Log do bulk-issue ghi ra hiển thị được ở endpoint này |

## Không được làm
- Không cho xem log của driver thuộc deliverer khác
- Không copy nội dung mẫu sai trong Figma (栄養成分 / 商品価格) vào code hay test

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] API Definition điền đủ — FE bắt đầu được task-3-24
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
