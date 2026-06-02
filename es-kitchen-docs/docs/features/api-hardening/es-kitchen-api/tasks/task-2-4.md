# [BE] [Admin_Web] — Unit Test: OrderService.checkout()

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 6h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Đây là viết test thuần — không thay đổi source code. Category `Admin_Web` theo convention; thực tế `OrderService.checkout()` phục vụ E01 Mobile.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Data Integrity + Testing |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-5, task-2-6 |
| Estimate | ~6h |

## Mục tiêu
Tạo unit test file cho `OrderService.checkout()` — critical payment path hiện không có test. Target coverage ≥ 80% cho `order.service.ts`.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Phase 2, T1)
- File liên quan:
  - `src/modules/user/services/order.service.ts:230-` — đọc toàn bộ `checkout()` method để hiểu branches
  - `src/modules/user/services/order.service.ts:51-80` — xem các dependencies được inject
  - `src/modules/user/http/requests/checkout.request.ts` — xem DTO structure

> **Quan trọng:** Đọc toàn bộ `checkout()` method trong source trước khi viết test. Method dài và có nhiều branches (user không tồn tại, pending order, payment strategy, transaction). Test phải cover đủ branches chính.

## Yêu cầu implement

### Tạo: `src/modules/user/services/order.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderService } from './order.service';
import { Order } from '../../../entities/order.entity';
import { OrderDetail } from '../../../entities/order-detail.entity';
import { Payment } from '../../../entities/payment.entity';
import { Cart } from '../../../entities/cart.entity';
import { CartItem } from '../../../entities/cart-item.entity';
import { User } from '../../../entities/user.entity';
import { Company } from '../../../entities/company.entity';
import { PaymentMethod } from '../../../entities/payment-method.entity';
// Import thêm entities khác nếu OrderService inject (xem constructor thực tế)
import { UserCompanyRestriction } from '../../../entities/user-company-restriction.entity';
import { I18nService } from 'nestjs-i18n';
import { ElepayService } from '../../../commons/utiliz/elepay/elepay.service';
import { DataSource } from 'typeorm';

describe('OrderService', () => {
  let service: OrderService;
  let mockOrderRepo: jest.Mocked<any>;
  let mockUserRepo: jest.Mocked<any>;
  let mockCartRepo: jest.Mocked<any>;
  let mockCartItemRepo: jest.Mocked<any>;
  let mockDataSource: jest.Mocked<any>;

  const mockUser = {
    id: 'user-001',
    email: 'user@test.com',
    companyId: 'company-001',
  };

  const mockCart = {
    id: 'cart-001',
    userId: 'user-001',
    cartItems: [
      {
        id: 'item-001',
        productId: 'prod-001',
        quantity: 2,
        product: { id: 'prod-001', name: 'Test Product', price: '500' },
      },
    ],
  };

  beforeEach(async () => {
    const qbMock = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

    mockOrderRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qbMock),
      manager: { query: jest.fn() },
    };

    mockUserRepo = { findOne: jest.fn() };
    mockCartRepo = { findOne: jest.fn() };
    mockCartItemRepo = { find: jest.fn() };
    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (fn) => {
        const managerMock = {
          create: jest.fn().mockReturnValue({}),
          save: jest.fn().mockResolvedValue({ id: 'order-001', orderDetails: [], paymentMethod: null }),
          insert: jest.fn().mockResolvedValue({}),
          update: jest.fn().mockResolvedValue({}),
          find: jest.fn().mockResolvedValue([]),
          findOne: jest.fn().mockResolvedValue(null),
        };
        return fn(managerMock);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: createMock() },
        { provide: getRepositoryToken(Payment), useValue: createMock() },
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Company), useValue: createMock() },
        { provide: getRepositoryToken(PaymentMethod), useValue: createMock() },
        { provide: getRepositoryToken(UserCompanyRestriction), useValue: createMock() },
        // Thêm các repo/service khác mà OrderService inject — xem constructor thực tế
        { provide: 'DataSource', useValue: mockDataSource },
        { provide: ElepayService, useValue: createMock<ElepayService>() },
        {
          provide: I18nService,
          useValue: { t: jest.fn().mockImplementation((key: string) => key) },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  // ─── Happy Path ───────────────────────────────────────────────────────────

  describe('checkout — happy path', () => {
    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(
        service.checkout('non-existent-user', {} as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when cart is empty', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockCartRepo.findOne.mockResolvedValue({ id: 'cart-001', cartItems: [] });
      mockCartItemRepo.find.mockResolvedValue([]);

      await expect(
        service.checkout('user-001', { paymentMethodId: 'pm-001' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when pending order already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      mockOrderRepo.findOne.mockResolvedValue({ id: 'existing-order', status: 'PENDING' });

      await expect(
        service.checkout('user-001', {} as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Additional branches (developer phải đọc checkout() và thêm) ─────────
  // Các cases sau đây cần developer tự thêm sau khi đọc toàn bộ method:
  // - Payment method không tìm thấy → throw
  // - Elepay charge success → order created với status PROCESSING
  // - Cash payment → order created với status khác
  // - Giảm cart items sau khi checkout thành công
  // Mỗi case phải có ít nhất 1 expect()

  it('checkout should return OrderResponse when success (smoke test)', async () => {
    mockUserRepo.findOne.mockResolvedValue(mockUser);
    mockOrderRepo.findOne.mockResolvedValueOnce(null);  // no pending order
    mockCartRepo.findOne.mockResolvedValue(mockCart);
    mockCartItemRepo.find.mockResolvedValue(mockCart.cartItems);

    // Mock payment method và elepay — adjust theo actual checkout() logic
    // Developer cần customize mock này sau khi đọc checkout() đầy đủ

    // Expect: không throw (smoke test — detail trong các cases bên dưới)
    // Nếu checkout cần nhiều mock hơn, developer bổ sung vào beforeEach hoặc arrange inline
    expect(service.checkout).toBeDefined();
  });
});
```

**Hướng dẫn cho developer:**
1. Đọc toàn bộ `order.service.ts:230-350` (hoặc hết method checkout) trước khi viết test
2. Identify tất cả branches: user not found, pending order exists, cart empty, payment method, elepay strategy, cash strategy, transaction
3. Với mỗi branch: 1 test case describe rõ "should ... when ..."
4. Mock chính xác return value theo từng branch
5. Target: ≥ 80% coverage của `order.service.ts`

**Coverage target:**
| File | Target |
|---|---|
| `order.service.ts` | ≥ 80% |

**Verify:** `npm run test:cov -- order.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Checkout endpoint (E01 Mobile) | `order.controller.ts:POST /user/orders/checkout` | Unit test không thay đổi controller — integration test riêng |
| Retry payment | `order.service.ts:retryPayment` | Spec file mới không ảnh hưởng method khác |
| Order list | `order.service.ts:getMyOrders` | Không bị ảnh hưởng |

## Không được làm
- Không thay đổi bất kỳ dòng code nào trong `order.service.ts` — task này chỉ viết test
- Không mock `DataSource` theo cách khác với convention `@golevelup/ts-jest`
- Không skip test cases vì khó mock — nếu cần helper thì tạo riêng

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] `npm run test:cov -- order.service` — coverage ≥ 80% cho `order.service.ts`
- [ ] Tất cả test cases pass (không có `.skip`)
- [ ] Minimum: user not found, cart empty, pending order exists phải có test
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
