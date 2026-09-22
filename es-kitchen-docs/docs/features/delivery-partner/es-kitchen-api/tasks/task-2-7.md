# [BE] [Delivery_Web] — 配送スタッフ一覧: 免許, アカウント状態, filter & sort

## Backlog Info
- **Issue Type:** Task · **Category:** Delivery_Web
- **Parent Issue:** Delivery Partner P2 — 配送スタッフ
- **Version:** _TBD_ · **Milestone:** _TBD_
- **Estimate Hour:** 8h · **Actual Hour:** — · **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Service + API |
| Repo | `es-kitchen-api` |
| Depends on | task-1-1 |
| Song song với | task-2-1, task-2-5 |
| Estimate | ~8h |

## Mục tiêu
Bổ sung dữ liệu cho màn 配送スタッフ一覧: ảnh 免許, trạng thái phát hành tài khoản, lọc theo 区分/ステータス/アカウント状態 và sắp xếp.

## Context (đọc trước khi code)
- **Design-Technical.md** → §4 BE-05, §8 R4 (rủi ro enum)
- **Figma-Analysis.md** → §2.6, node `31498:192233`
- `src/modules/deliverer/http/requests/deliverer-driver-search.request.ts` — **param đang có: `q`, `type`, `status`, `page`, `limit`** → giữ nguyên tên, chỉ thêm mới
- `src/modules/deliverer/http/responses/deliverer-driver-list.response.ts`
- `src/modules/deliverer/services/deliverer-driver.service.ts`
- `src/entities/driver.entity.ts` — `license_image_urls` (text[]), `account_issued_at` (task-1-1)

## Yêu cầu implement

### Sửa: `deliverer-driver-search.request.ts`
```typescript
// GIỮ NGUYÊN: q, type, status, page, limit
// THÊM: accountState?: 'ISSUED' | 'NOT_ISSUED'
//       sortBy?: 'driverCode' | 'driverName' | 'status' | 'createdAt' = 'createdAt'
//       order?: 'ASC' | 'DESC' = 'DESC'     ← tên `order` cho khớp delivery-block-search.request.ts
```

### Sửa: `deliverer-driver.service.ts`
```typescript
// ORDER_BY_MAP whitelist — BẮT BUỘC (dự án đã có bug prod vì truyền thẳng orderBy)
const ORDER_BY_MAP = {
  driverCode: 'driver.driver_code',
  driverName: 'driver.driver_name',
  status:     'driver.status',
  createdAt:  'driver.created_at',
};
// accountState: ISSUED → account_issued_at IS NOT NULL; NOT_ISSUED → IS NULL
```

### Sửa: `deliverer-driver-list.response.ts`
```typescript
licenseImageUrls: string[];                    // FE hiển thị ảnh đầu tiên
accountState: 'ISSUED' | 'NOT_ISSUED';
driverName: string | null;                     // xác nhận đã có; nếu chưa → bổ sung
```

### ⚠️ Trạng thái `免許未登録`
Figma có nhãn `免許未登録`. **Trước khi thêm giá trị enum mới**, chạy `tilth_deps` trên enum `DriverStatus` và grep mọi `switch` dùng enum này (admin + driver app). Nếu blast radius > 0 → **không thêm enum**, thay bằng cờ suy ra: `hasLicense = licenseImageUrls.length > 0` và để FE hiển thị nhãn. Ghi quyết định vào PR.

## Unit Tests (BẮT BUỘC)
```typescript
it('should map account_issued_at to ISSUED / NOT_ISSUED', ...);
it('should filter by accountState', ...);
it('should reject an unknown sortBy value (fallback to default, never raw string)', ...);
it('should keep existing q/type/status filters working', ...);
it('should scope the query to the current deliverer', ...);
```
**Coverage:** service ≥ 80%, controller ≥ 70% · **Verify:** `npm run test -- deliverer-driver`

## API Definition
| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/deliverer/drivers` | `?q&type&status&accountState&page&limit&sortBy&order` | `{ items: DriverListItem[], total, page, limit, totalPages }` |

`DriverListItem` thêm: `licenseImageUrls: string[]`, `accountState: 'ISSUED'|'NOT_ISSUED'`, `driverName: string|null`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Màn 配送スタッフ FE hiện tại | FE `EmployeePage.tsx` | List cũ vẫn load, các cột cũ không đổi |
| `/admin/drivers` | `src/modules/admin/...` | Không sửa; gọi thử vẫn chạy |
| Driver App | `src/modules/driver/` | Nếu có đổi enum → phải test login + list của driver app |

## Không được làm
- Không đổi tên param `q` → `keyword`
- Không truyền thẳng `sortBy` vào `orderBy()` — bắt buộc qua map
- Không thêm giá trị enum `DriverStatus` khi chưa kiểm blast radius

## Definition of Done
- [ ] Build · Lint · Unit Tests pass
- [ ] Quyết định về `免許未登録` ghi rõ trong PR
- [ ] API Definition điền đủ — FE bắt đầu được task-3-18
- [ ] Non-Regression verify đủ · Actual Hour · Status → `Done` → `Reviewing`
