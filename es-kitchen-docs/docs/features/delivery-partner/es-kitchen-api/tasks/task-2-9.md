# [BE] [Delivery_Web] — Endpoint POST /drivers/bulk-issue-account

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 5h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-2-8 |
| Song song với | task-2-10 |
| Estimate | ~5h |

## Mục tiêu
Expose `bulkIssueAccount()` qua REST, đảm bảo trả **HTTP 200 kể cả khi có dòng lỗi** để FE render màn `一部エラーあり`.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-06, §7.3
- `deliverer-driver.controller.ts` — pattern `@Controller('drivers')` + `DelivererGuard` + `@ApiUnifiedResponse`

## Yêu cầu implement

### Sửa: `deliverer-driver.controller.ts`
```typescript
@Post('bulk-issue-account')
// Body: BulkIssueAccountRequest { driverIds: string[] }  @ArrayMinSize(1) @ArrayMaxSize(100)
// Trả 200 với { total, succeeded, failed, results } — KHÔNG ném exception khi failed > 0
// Swagger: mô tả rõ "partial success — check `failed` field, not HTTP status"
```

### Tạo: `src/modules/deliverer/http/requests/bulk-issue-account.request.ts`

## Unit Tests (BẮT BUỘC)
### Test file: `deliverer-driver.controller.spec.ts`
```typescript
it('should return 200 with failed>0 instead of throwing', ...);
it('should reject an empty driverIds array with 400', ...);
it('should reject more than 100 ids with 400', ...);
it('should pass the authenticated delivererId to the service', ...);
```
**Coverage:** controller ≥ 70% · **Verify:** `npm run test -- deliverer-driver.controller`

## API Definition
| Method | Endpoint | Auth | Request | Response | Error |
|---|---|---|---|---|---|
| POST | `/deliverer/drivers/bulk-issue-account` | Bearer JWT + `DelivererGuard` | `{ driverIds: string[] }` (1–100) | `{ total, succeeded, failed, results: BulkResult[] }` | 400, 401, 403 |

**Retry (再度実行):** FE gọi lại chính endpoint này với `driverIds` = các dòng `FAILED`.

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Các route `/deliverer/drivers/:id` | `deliverer-driver.controller.ts` | Route mới `bulk-issue-account` **không được** bị nuốt bởi route param `:id` — khai báo TRƯỚC `:id` |
| Swagger deliverer | `config/swagger.config.ts` | Endpoint xuất hiện đúng doc Deliverer |

## Không được làm
- Không ném `BadRequestException` khi chỉ có một phần dòng lỗi
- Không đặt route sau `@Get(':id')` gây shadow route

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] API Definition điền đủ — FE bắt đầu được task-3-20
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
