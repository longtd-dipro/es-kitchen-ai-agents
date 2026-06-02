# [BE] [Admin_Web] — Dashboard: Thay ORDER BY RANDOM() bằng TABLESAMPLE SYSTEM

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 3h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Dashboard là tính năng E03 Admin. Task này là performance fix — không thay đổi business behavior (vẫn hiển thị ~10 sản phẩm random). Cần PM/Design confirm nếu "padding behavior" cần được bỏ hoàn toàn khi catalog nhỏ.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Performance + Code Quality |
| Repo | `es-kitchen-api` |
| Depends on | task-3-2 (optional — nếu dashboard cũng dùng Redis cache sau này) |
| Song song với | task-3-3, task-3-4 |
| Estimate | ~3h |

## Mục tiêu
Thay `ORDER BY RANDOM()` (full-table scan + sort) tại `dashboard.service.ts:204-217` bằng `TABLESAMPLE SYSTEM(5)` (block sampling). Không thay đổi response format hay behavior hiển thị dashboard.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.7)
- File liên quan:
  - `src/modules/admin/services/dashboard.service.ts:190-218` — xem đoạn code hiện tại của padding logic
  - Xác nhận tên table là `products` và PK column là `id` (kiểm tra `product.entity.ts`)

> **BLOCKER tiềm năng:** Nếu số lượng products trong catalog hiện tại < 20 rows (DEV/STG), `TABLESAMPLE SYSTEM(5)` có thể trả về 0 rows. Confirm với team về số lượng products trước khi implement. Nếu catalog nhỏ, bàn với PM về việc bỏ padding logic hoàn toàn.

## Yêu cầu implement

### Sửa: `src/modules/admin/services/dashboard.service.ts` (line 203-217)

**Thay thế toàn bộ padding block:**

```typescript
// TRƯỚC (line 203-217):
// if (targetProductIds.length < 10) {
//   let padQuery = this.orderRepository.manager.getRepository('Product')
//     .createQueryBuilder('product')
//     .select('product.id', 'productId')
//     .orderBy('RANDOM()')
//     .limit(10 - targetProductIds.length);
//   if (targetProductIds.length > 0) {
//     padQuery.where('product.id NOT IN (:...targetProductIds)', { targetProductIds });
//   }
//   const paddingProducts = await padQuery.getRawMany();
//   targetProductIds.push(...paddingProducts.map(p => String(p.productId)));
// }

// SAU — TABLESAMPLE SYSTEM(5) thay vì ORDER BY RANDOM():
if (targetProductIds.length < 10) {
  const needed = 10 - targetProductIds.length;

  let padRaw: { productId: string }[];

  if (targetProductIds.length > 0) {
    // Exclude top-selling products đã có
    padRaw = await this.orderRepository.manager.query(
      `SELECT id::text AS "productId"
       FROM products TABLESAMPLE SYSTEM(5)
       WHERE id NOT IN (${targetProductIds.map((_, i) => `$${i + 1}`).join(',')})
       LIMIT $${targetProductIds.length + 1}`,
      [...targetProductIds, needed],
    );
  } else {
    // Không có top-selling products — lấy sample từ toàn bộ catalog
    padRaw = await this.orderRepository.manager.query(
      `SELECT id::text AS "productId"
       FROM products TABLESAMPLE SYSTEM(5)
       LIMIT $1`,
      [needed],
    );
  }

  // Fallback: nếu TABLESAMPLE trả về ít hơn needed (catalog nhỏ), query thêm không dùng TABLESAMPLE
  if (padRaw.length < needed) {
    const excludeIds = [
      ...targetProductIds,
      ...padRaw.map(r => r.productId),
    ];
    const fallbackNeeded = needed - padRaw.length;
    let fallbackRaw: { productId: string }[];

    if (excludeIds.length > 0) {
      fallbackRaw = await this.orderRepository.manager.query(
        `SELECT id::text AS "productId"
         FROM products
         WHERE id NOT IN (${excludeIds.map((_, i) => `$${i + 1}`).join(',')})
         LIMIT $${excludeIds.length + 1}`,
        [...excludeIds, fallbackNeeded],
      );
    } else {
      fallbackRaw = await this.orderRepository.manager.query(
        `SELECT id::text AS "productId" FROM products LIMIT $1`,
        [fallbackNeeded],
      );
    }
    padRaw = [...padRaw, ...fallbackRaw];
  }

  targetProductIds.push(...padRaw.map(r => r.productId));
}
```

**Lưu ý:**
- `TABLESAMPLE SYSTEM(5)` lấy ~5% số blocks ngẫu nhiên — với catalog 1000 sản phẩm → ~50 rows; với catalog 20 rows → có thể 0-1 row
- Fallback query (không có TABLESAMPLE) đảm bảo luôn pad đủ ngay cả khi catalog nhỏ
- Tên table `products` phải khớp với actual table name — xác nhận bằng `\d products` trên DB hoặc xem entity decorator

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/admin/services/dashboard.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { DashboardService } from './dashboard.service';
import { Order } from '../../../entities/order.entity';
import { OrderDetail } from '../../../entities/order-detail.entity';
import { Company } from '../../../entities/company.entity';
import { UserFavorite } from '../../../entities/user-favorite.entity';
import { I18nService } from 'nestjs-i18n';

describe('DashboardService — padding with TABLESAMPLE', () => {
  let service: DashboardService;
  let mockOrderRepo: any;

  beforeEach(async () => {
    const managerMock = {
      query: jest.fn(),
      getRepository: jest.fn().mockReturnValue({
        createQueryBuilder: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnThis(),
          addSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          addOrderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          groupBy: jest.fn().mockReturnThis(),
          getRawMany: jest.fn().mockResolvedValue([]),
        }),
      }),
    };

    mockOrderRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
      manager: managerMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: createMock() },
        { provide: getRepositoryToken(Company), useValue: createMock() },
        { provide: getRepositoryToken(UserFavorite), useValue: createMock() },
        { provide: I18nService, useValue: { t: jest.fn() } },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should NOT use ORDER BY RANDOM() in padding query', async () => {
    // top-selling returns 5 products (fewer than 10 → triggers padding)
    const topSales = Array.from({ length: 5 }, (_, i) => ({ productId: `prod-${i}` }));
    mockOrderRepo.createQueryBuilder().getRawMany.mockResolvedValue(topSales);

    // TABLESAMPLE returns 3 products
    const sampleProducts = [{ productId: 'pad-001' }, { productId: 'pad-002' }, { productId: 'pad-003' }];
    // Fallback needed for remaining 2
    const fallbackProducts = [{ productId: 'fall-001' }, { productId: 'fall-002' }];
    (mockOrderRepo.manager.query as jest.Mock)
      .mockResolvedValueOnce(sampleProducts)     // TABLESAMPLE query
      .mockResolvedValueOnce(fallbackProducts)   // fallback query
      .mockResolvedValue([]);                    // subsequent queries

    await service.getFavoritesVsSales({ month: '2026/06' } as any);

    const queryCalls = (mockOrderRepo.manager.query as jest.Mock).mock.calls;
    const allQueries = queryCalls.map(call => (call[0] as string).toUpperCase());

    // Must use TABLESAMPLE
    const hasTABLESAMPLE = allQueries.some(q => q.includes('TABLESAMPLE'));
    expect(hasTABLESAMPLE).toBe(true);

    // Must NOT use ORDER BY RANDOM()
    const hasRANDOM = allQueries.some(q => q.includes('ORDER BY RANDOM()'));
    expect(hasRANDOM).toBe(false);
  });

  it('should include fallback query when TABLESAMPLE returns fewer rows than needed', async () => {
    mockOrderRepo.createQueryBuilder().getRawMany.mockResolvedValue([]);  // 0 top-selling

    // TABLESAMPLE only returns 3 (fewer than 10 needed)
    const sampleProducts = [{ productId: 'p1' }, { productId: 'p2' }, { productId: 'p3' }];
    const fallbackProducts = Array.from({ length: 7 }, (_, i) => ({ productId: `f-${i}` }));
    (mockOrderRepo.manager.query as jest.Mock)
      .mockResolvedValueOnce(sampleProducts)
      .mockResolvedValueOnce(fallbackProducts)
      .mockResolvedValue([]);

    await service.getFavoritesVsSales({ month: '2026/06' } as any);

    // query called at least twice: TABLESAMPLE + fallback
    expect(mockOrderRepo.manager.query).toHaveBeenCalledTimes(expect.any(Number));
    const callCount = (mockOrderRepo.manager.query as jest.Mock).mock.calls.length;
    expect(callCount).toBeGreaterThanOrEqual(2);
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `dashboard.service.ts` | ≥ 70% |

**Verify:** `npm run test -- dashboard.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Dashboard "Favorites vs Sales" chart (Admin E03) | `dashboard.service.ts:getFavoritesVsSales` | Sau khi sửa, chart vẫn hiển thị ~10 sản phẩm, không throw |
| Monthly sales (method khác trong DashboardService) | `dashboard.service.ts:getMonthlySales` | Không bị ảnh hưởng |
| Sales by payment method | `dashboard.service.ts:getSalesByPaymentMethod` | Không bị ảnh hưởng |

## Không được làm
- Không dùng `ORDER BY RANDOM()` ở bất kỳ dạng nào trong đoạn padding
- Không thay đổi response format của `getFavoritesVsSales`
- Không bỏ fallback query — cần đảm bảo hoạt động đúng khi catalog nhỏ

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — cả 2 test cases
- [ ] Non-Regression verify đủ
- [ ] Manual verify trên STG: dashboard hiển thị đúng số sản phẩm
- [ ] Confirm với PM/Design về catalog nhỏ scenario nếu cần
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
