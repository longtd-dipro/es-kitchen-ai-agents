# [BE] [Admin_Web] — orderBy Whitelist trong SalesAnalyticsService

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Released hotfix-202606
- **Estimate Hour:** 2h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Đây là SQL injection risk (S3). Category `Admin_Web` vì endpoint sales analytics chỉ Admin (E03) dùng.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 1 — Security Hotfix |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-1-1, task-1-2, task-1-4 |
| Estimate | ~2h |

## Mục tiêu
Thay thế raw string interpolation `` `"${filter.orderBy}"` `` ở line 73 và 159 trong `sales-analytics.service.ts` bằng whitelist map, ngăn SQL injection qua orderBy parameter.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.3)
- File liên quan:
  - `src/modules/admin/services/sales-analytics.service.ts:60-161` — xem đúng dòng 73 và 159 để confirm hiện trạng
  - `src/modules/admin/services/sales-analytics.service.ts:375-391` — xem pattern `sortMapping` đã đúng trong `getByProduct` làm tham khảo

## Yêu cầu implement

### Sửa: `src/modules/admin/services/sales-analytics.service.ts`

**Bước 1:** Thêm constant `COMPANY_ORDER_BY_MAP` ngay trước class definition (sau imports):

```typescript
// Đặt trước: export class SalesAnalyticsService {
const COMPANY_ORDER_BY_MAP: Record<string, string> = {
  companyCode: '"companyCode"',
  companyName: '"companyName"',
  totalQuantity: '"totalQuantity"',
  totalSales: '"totalSales"',
  countPaymentPaid: '"countPaymentPaid"',
  countPaymentRefunded: '"countPaymentRefunded"',
  totalPaymentRefunded: '"totalPaymentRefunded"',
  totalPaymentByCash: '"totalPaymentByCash"',
  totalPaymentByElepayApplepay: '"totalPaymentByElepayApplepay"',
  totalPaymentByElepayAupay: '"totalPaymentByElepayAupay"',
  totalPaymentByElepayCodes: '"totalPaymentByElepayCodes"',
  totalPaymentByElepayCreditCard: '"totalPaymentByElepayCreditCard"',
  totalPaymentByElepayDpay: '"totalPaymentByElepayDpay"',
  totalPaymentByElepayGooglepay: '"totalPaymentByElepayGooglepay"',
  totalPaymentByElepayMerpay: '"totalPaymentByElepayMerpay"',
  totalPaymentByElepayPaypay: '"totalPaymentByElepayPaypay"',
  totalPaymentByElepayAeonpay: '"totalPaymentByElepayAeonpay"',
  totalPaymentCashless: '"totalPaymentCashless"',
};
```

**Bước 2:** Thay thế tại `getByCompany` (line 73):
```typescript
// TRƯỚC:
baseQb.orderBy(`"${filter.orderBy}"`, filter.order);

// SAU:
const safeOrderBy = COMPANY_ORDER_BY_MAP[filter.orderBy] ?? '"totalQuantity"';
baseQb.orderBy(safeOrderBy, filter.order);
```

**Bước 3:** Thay thế tại `exportCsvByCompany` (line 159) — cùng pattern:
```typescript
// TRƯỚC:
baseQb.orderBy(`"${filter.orderBy}"`, filter.order);

// SAU:
const safeOrderBy = COMPANY_ORDER_BY_MAP[filter.orderBy] ?? '"totalQuantity"';
baseQb.orderBy(safeOrderBy, filter.order);
```

**Fallback behavior:** Nếu `filter.orderBy` không có trong map → fallback `"totalQuantity"` (không throw, không reflect giá trị input lại). DTO đã có `@IsIn([...])` validation nên invalid value không đến service — whitelist map là tầng phòng thủ thứ hai (defense-in-depth).

**Verify column list:** Danh sách keys trong `COMPANY_ORDER_BY_MAP` phải khớp với các column trong SELECT list của `buildSalesAnalyticCompanyQuery`. Đọc query builder trong method đó để verify không thiếu/thừa column.

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/admin/services/sales-analytics.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { SalesAnalyticsService } from './sales-analytics.service';
import { Order } from '../../../entities/order.entity';
import { OrderDetail } from '../../../entities/order-detail.entity';
import { MenuProduct } from '../../../entities/menu-product.entity';
import { Menu } from '../../../entities/menu.entity';
import { Product } from '../../../entities/product.entity';
import { Company } from '../../../entities/company.entity';

describe('SalesAnalyticsService — orderBy whitelist', () => {
  let service: SalesAnalyticsService;
  let mockOrderRepo: any;

  beforeEach(async () => {
    // Mock query builder chain
    const qbMock = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
      getRawOne: jest.fn().mockResolvedValue({ count: '0', totalQuantity: '0', totalSales: '0', countPaymentPaid: '0', countPaymentRefunded: '0', totalPaymentPaid: '0', totalPaymentRefunded: '0', totalPaymentByCash: '0', totalPaymentByElepayAeonpay: '0', totalPaymentByElepayApplepay: '0', totalPaymentByElepayAupay: '0', totalPaymentByElepayCreditCard: '0', totalPaymentByElepayDpay: '0', totalPaymentByElepayGooglepay: '0', totalPaymentByElepayMerpay: '0', totalPaymentByElepayPaypay: '0', totalPaymentCashless: '0' }),
    };

    mockOrderRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      manager: { query: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesAnalyticsService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: createMock() },
        { provide: getRepositoryToken(MenuProduct), useValue: createMock() },
        { provide: getRepositoryToken(Menu), useValue: createMock() },
        { provide: getRepositoryToken(Product), useValue: createMock() },
        { provide: getRepositoryToken(Company), useValue: createMock() },
      ],
    }).compile();

    service = module.get<SalesAnalyticsService>(SalesAnalyticsService);
  });

  it('should call orderBy with whitelisted column when valid orderBy provided', async () => {
    const qb = mockOrderRepo.createQueryBuilder();
    await service.getByCompany({
      orderBy: 'totalSales',
      order: 'DESC',
      page: 1,
      limit: 10,
    } as any);
    // Verify orderBy was called with quoted column name, NOT raw interpolation
    expect(qb.orderBy).toHaveBeenCalledWith('"totalSales"', 'DESC');
  });

  it('should fallback to totalQuantity when orderBy is not in whitelist', async () => {
    const qb = mockOrderRepo.createQueryBuilder();
    await service.getByCompany({
      orderBy: 'malicious_input; DROP TABLE users;--',
      order: 'ASC',
      page: 1,
      limit: 10,
    } as any);
    expect(qb.orderBy).toHaveBeenCalledWith('"totalQuantity"', 'ASC');
  });

  it('should not reflect raw orderBy input into query string', async () => {
    const qb = mockOrderRepo.createQueryBuilder();
    const injectionAttempt = '1; DROP TABLE payments;--';
    await service.getByCompany({
      orderBy: injectionAttempt,
      order: 'DESC',
      page: 1,
      limit: 10,
    } as any);
    const orderByCall = (qb.orderBy as jest.Mock).mock.calls[0][0];
    expect(orderByCall).not.toContain(injectionAttempt);
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `sales-analytics.service.ts` | ≥ 80% (orderBy path) |

**Verify:** `npm run test -- sales-analytics.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Sales analytics by company — pagination | `sales-analytics.service.ts:getByCompany` | GET `/admin/sales-analytics/by-company?orderBy=totalSales&order=DESC` → sort đúng |
| Sales analytics CSV export | `sales-analytics.service.ts:exportCsvByCompany` | Export CSV với orderBy hợp lệ → CSV sort đúng |
| getByProduct (đã có whitelist) | `sales-analytics.service.ts:375-391` | Không thay đổi — verify vẫn hoạt động bình thường |

## Không được làm
- Không thay đổi DTO validation hay response format
- Không sửa `getByProduct` hay `exportCsvByProduct` — đã đúng, ngoài scope task này
- Không throw exception khi orderBy không hợp lệ — fallback về default là behavior mong muốn (DTO đã validate trước)
- Không refactor `buildSalesAnalyticCompanyQuery` — chỉ sửa 2 dòng `orderBy`

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — cả 3 test cases
- [ ] Non-Regression verify đủ
- [ ] Manual verify: orderBy với giá trị hợp lệ vẫn sort đúng
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
