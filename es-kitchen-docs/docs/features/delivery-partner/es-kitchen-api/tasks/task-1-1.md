# [BE] [Delivery_Web] — Migration: trạng thái phát hành tài khoản cho 配送スタッフ

## Backlog Info
- **Issue Type:** Task
- **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD — PM điền_
- **Milestone:** _TBD — PM điền_
- **Estimate Hour:** 4h
- **Actual Hour:** —
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 1 — DB migration |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | none |
| Estimate | ~4h |

## Mục tiêu
Thêm khả năng phân biệt tài xế **đã phát hành tài khoản** (発行済み) và **chưa phát hành** (未発行) — dữ liệu nền cho cột `アカウント状態` ở màn 配送スタッフ一覧 và cho chức năng phát hành hàng loạt.

## Context (đọc trước khi code)

### 🏗️ Tech Lead output
- **Design-Technical.md:** `es-kitchen-docs/docs/features/delivery-partner/es-kitchen-api/Design-Technical.md` → §3.2 **M1**
- **Phân tích Figma:** `es-kitchen-docs/docs/features/delivery-partner/Figma-Analysis.md` → §2.6 (node `31498:192233`)

### 📂 File liên quan trong codebase
- `src/entities/driver.entity.ts` — entity sẽ sửa; xem convention `@Column({ name: 'snake_case' })`
- `database/migrations/` — xem 2-3 migration gần nhất để copy naming convention `<timestamp>-<PascalCaseName>.ts`
- `src/modules/deliverer/services/deliverer-driver.service.ts` — consumer sẽ dùng cột mới ở task-2-7

## Yêu cầu implement

### Tạo: `database/migrations/<timestamp>-AddDriverAccountIssuedState.ts`

```typescript
// up()
// ALTER TABLE drivers ADD COLUMN account_issued_at timestamptz NULL;
// ALTER TABLE drivers ADD COLUMN account_issued_by bigint NULL;
// CREATE INDEX idx_drivers_deliverer_issued ON drivers (deliverer_id, account_issued_at);
// down(): drop index + 2 cột
```

### Sửa: `src/entities/driver.entity.ts`

```typescript
@Column({ name: 'account_issued_at', type: 'timestamptz', nullable: true })
accountIssuedAt: Date | null;

@Column({ name: 'account_issued_by', type: 'bigint', nullable: true })
accountIssuedBy: string | null;
```

### Backfill (BẮT BUỘC cân nhắc trước khi chạy)
Tài xế đã từng nhận mật khẩu qua `POST /deliverer/drivers/:id/send-password` trước đây **không có dấu vết** trong DB.
→ Trong `up()` **KHÔNG tự backfill**. Ghi chú lại cho PM: toàn bộ driver hiện có sẽ hiển thị `未発行` sau migration. Nếu PM muốn coi driver đang `有効` là `発行済み` thì bổ sung UPDATE trong migration — **chỉ khi PM xác nhận bằng văn bản**.

## Unit Tests (BẮT BUỘC)
Migration không có unit test riêng. Thay vào đó:
- [ ] Chạy `npm run migration:run` trên DB local → kiểm tra 2 cột + index tồn tại
- [ ] Chạy `npm run migration:revert` → kiểm tra rollback sạch
- [ ] Chạy `npm run test -- deliverer-driver` → suite hiện có vẫn pass (entity đổi không làm vỡ mapping)

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Danh sách / chi tiết tài xế (portal) | `src/modules/deliverer/services/deliverer-driver.service.ts` | GET `/deliverer/drivers` và `/:id` vẫn trả đúng dữ liệu |
| Quản lý tài xế (admin) | `src/modules/admin/...driver...` | GET `/admin/drivers` vẫn chạy |
| Driver App login | `src/modules/driver/` | Login tài xế vẫn hoạt động (entity `drivers` dùng chung) |

## Không được làm
- Không đổi/xoá cột `status`, `deleted_at`, `license_image_urls` đang có
- Không thêm giá trị enum trạng thái mới trong task này (xem task-2-7)
- Không backfill dữ liệu khi chưa có xác nhận của PM

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Migration run + revert đều sạch
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật
- [ ] Status → `Done` → `Reviewing`
