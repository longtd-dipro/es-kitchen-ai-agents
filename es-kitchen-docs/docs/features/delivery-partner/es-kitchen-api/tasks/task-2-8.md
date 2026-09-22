# [BE] [Delivery_Web] — Phát hành tài khoản hàng loạt: service + kết quả từng dòng

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 7h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-1-1 |
| Song song với | task-2-5 |
| Estimate | ~7h |

## Mục tiêu
Viết `bulkIssueAccount()` — phát hành tài khoản cho nhiều tài xế trong 1 lần gọi, **partial success**: 1 dòng lỗi không làm hỏng các dòng đã thành công.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-06, §5 (luồng 4 bước), §7.3, §8 R5
- **Figma-Analysis.md** → §2.6, node `31498:194129` (Section 6 — 4 modal state)
- `src/modules/deliverer/services/deliverer-driver.service.ts` — hàm `sendPassword()` hiện có (**tách dùng chung**, xem R5)
- `src/modules/deliverer/http/controllers/deliverer-driver.controller.ts`

## Yêu cầu implement

### Sửa: `deliverer-driver.service.ts`
```typescript
// 1. Tách logic của sendPassword() hiện tại thành private issueAccountForDriver(driver): Promise<void>
//    → single endpoint và bulk dùng CHUNG, tránh lệch logic (R5)
async bulkIssueAccount(delivererId: string, driverIds: string[]): Promise<BulkIssueAccountResponse> {
  // Validate 1..100 id
  // Load driver WHERE id IN (...) AND deliverer_id = me  → id không thuộc về mình: FAILED / DRIVER_INACTIVE
  // for each driver (tuần tự, MỖI DRIVER 1 TRANSACTION RIÊNG):
  //   - email rỗng            → FAILED / EMAIL_MISSING
  //   - account_issued_at != null → FAILED / ALREADY_ISSUED (idempotent, KHÔNG gửi lại mail)
  //   - driver không active   → FAILED / DRIVER_INACTIVE
  //   - issueAccountForDriver() lỗi Cognito → FAILED / COGNITO_ERROR
  //   - gửi mail lỗi          → FAILED / MAIL_SEND_FAILED
  //   - thành công → set account_issued_at/by + ghi driver_history_logs
  // Trả { total, succeeded, failed, results[] }
}
```

### Tạo: `src/modules/deliverer/http/responses/bulk-issue-account.response.ts`
`errorMessage` lấy từ i18n `ja` (FE hiển thị trực tiếp trong modal, không tự dịch).

## Unit Tests (BẮT BUỘC)
```typescript
it('should return SUCCESS rows and FAILED rows in the same response', ...);
it('should not roll back succeeded drivers when a later driver fails', ...);  // ← partial success
it('should return ALREADY_ISSUED without sending mail again (idempotent)', ...);
it('should return DRIVER_INACTIVE for an id belonging to another deliverer', ...);
it('should reject more than 100 ids', ...);
it('should write a driver_history_log for every SUCCESS row', ...);
```
**Coverage:** service ≥ 80% · **Verify:** `npm run test -- deliverer-driver`

## API Definition
_(endpoint đăng ký ở task-2-9; task này chỉ lo service + DTO)_
```
BulkIssueAccountResponse: { total, succeeded, failed, results: BulkResult[] }
BulkResult: { driverId, driverCode, driverName, email, status: 'SUCCESS'|'FAILED',
              errorCode: 'EMAIL_MISSING'|'ALREADY_ISSUED'|'COGNITO_ERROR'|'MAIL_SEND_FAILED'|'DRIVER_INACTIVE'|null,
              errorMessage: string|null }
```

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `POST /deliverer/drivers/:id/send-password` | `deliverer-driver.controller.ts` | Sau khi tách hàm dùng chung, endpoint đơn lẻ vẫn gửi mail đúng |
| Tạo tài xế mới | `deliverer-driver.service.ts` | `POST /deliverer/drivers` vẫn chạy |

## Không được làm
- Không bọc toàn bộ vòng lặp trong 1 transaction (sẽ mất partial success)
- Không đẩy sang queue/async — FE cần kết quả ngay để render modal
- Không duplicate logic phát hành: single và bulk dùng chung 1 hàm

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
