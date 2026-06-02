# [BE] [Admin_Web] — Unit Test: CartService.addItem()

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 5h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Task này chỉ viết test — không thay đổi source code. `CartService.addItem()` có limit validation logic phức tạp (daily + monthly), cần coverage đủ để refactor an toàn sau.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Data Integrity + Testing |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-2-4, task-2-6 |
| Estimate | ~5h |

## Mục tiêu
Tạo unit test file cho `CartService.addItem()` — cover happy path, duplicate item (quantity increment), product not found, daily limit exceeded, monthly limit exceeded. Target coverage ≥ 80% cho `cart.service.ts`.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Phase 2, T1)
- File liên quan:
  - `src/modules/user/services/cart.service.ts:161-210` — xem `addItem()` đã đọc được (product check, getOrCreateCart, findOne existing, validateDailyLimit, validateMonthlyLimit)
  - `src/modules/user/services/cart.service.ts:22-160` — xem constructor, `getOrCreateCart`, `validateDailyLimit`, `validateMonthlyLimit`
  - `src/modules/user/http/requests/add-to-cart.request.ts` — xem DTO fields

> **Quan trọng:** Đọc toàn bộ `cart.service.ts` trước khi viết test, đặc biệt `validateDailyLimit()` và `validateMonthlyLimit()` để hiểu cần mock gì.

## Yêu cầu implement

### Tạo: `src/modules/user/services/cart.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CartService } from './cart.service';
import { Cart } from '../../../entities/cart.entity';
import { CartItem } from '../../../entities/cart-item.entity';
import { Product } from '../../../entities/product.entity';
import { Order } from '../../../entities/order.entity';
import { OrderDetail } from '../../../entities/order-detail.entity';
import { Company } from '../../../entities/company.entity';
import { UserCompanyRestriction } from '../../../entities/user-company-restriction.entity';
// Thêm các entity khác mà CartService inject — xem constructor thực tế
import { I18nService } from 'nestjs-i18n';

describe('CartService.addItem', () => {
  let service: CartService;
  let mockProductRepo: jest.Mocked<any>;
  let mockCartRepo: jest.Mocked<any>;
  let mockCartItemRepo: jest.Mocked<any>;
  let mockOrderRepo: jest.Mocked<any>;
  let mockOrderDetailRepo: jest.Mocked<any>;

  const mockProduct = {
    id: 'prod-001',
    name: 'Test Ramen',
    price: '800',
  };

  const mockCart = {
    id: 'cart-001',
    userId: 'user-001',
  };

  const mockDto = {
    productId: 'prod-001',
    quantity: 1,
    companyCode: 'COMP-001',
  };

  beforeEach(async () => {
    mockProductRepo = { findOne: jest.fn() };
    mockCartRepo = {
      findOne: jest.fn().mockResolvedValue(mockCart),
      create: jest.fn().mockReturnValue(mockCart),
      save: jest.fn().mockResolvedValue(mockCart),
    };
    mockCartItemRepo = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
    };
    mockOrderRepo = {
      createQueryBuilder: jest.fn().mockReturnValue({
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ totalOrdered: '0', dailyLimit: null }),
      }),
    };
    mockOrderDetailRepo = { createQueryBuilder: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: getRepositoryToken(Cart), useValue: mockCartRepo },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(Product), useValue: mockProductRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderDetail), useValue: mockOrderDetailRepo },
        { provide: getRepositoryToken(Company), useValue: createMock() },
        { provide: getRepositoryToken(UserCompanyRestriction), useValue: createMock() },
        // Thêm các provider khác nếu cần
        {
          provide: I18nService,
          useValue: { t: jest.fn().mockImplementation((key: string) => key) },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  // ─── Product not found ─────────────────────────────────────────────────────
  describe('when product does not exist', () => {
    it('should throw NotFoundException', async () => {
      mockProductRepo.findOne.mockResolvedValue(null);

      await expect(
        service.addItem('user-001', { ...mockDto }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─── New item (not in cart) ────────────────────────────────────────────────
  describe('when product is not yet in cart (new item)', () => {
    it('should create a new CartItem with correct quantity', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCartItemRepo.findOne.mockResolvedValue(null);  // no existing item
      const newItem = { ...mockDto, cartId: 'cart-001', productId: 'prod-001' };
      mockCartItemRepo.create.mockReturnValue(newItem);
      mockCartItemRepo.save.mockResolvedValue({ ...newItem, id: 'item-001' });
      // Mock loadCart to return cart with items
      jest.spyOn(service as any, 'loadCart').mockResolvedValue({ ...mockCart, cartItems: [newItem] });
      jest.spyOn(service as any, 'toResponse').mockReturnValue({ cartItems: [newItem] });

      const result = await service.addItem('user-001', mockDto);

      expect(mockCartItemRepo.create).toHaveBeenCalled();
      expect(mockCartItemRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  // ─── Duplicate item ────────────────────────────────────────────────────────
  describe('when product already exists in cart (duplicate)', () => {
    it('should increment quantity on existing CartItem', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      const existingItem = { id: 'item-001', cartId: 'cart-001', productId: 'prod-001', quantity: 2 };
      mockCartItemRepo.findOne.mockResolvedValue(existingItem);
      mockCartItemRepo.save.mockResolvedValue({ ...existingItem, quantity: 3 });
      jest.spyOn(service as any, 'loadCart').mockResolvedValue(mockCart);
      jest.spyOn(service as any, 'toResponse').mockReturnValue({});

      await service.addItem('user-001', { ...mockDto, quantity: 1 });

      expect(mockCartItemRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ quantity: 3 }),  // 2 + 1
      );
    });
  });

  // ─── Daily limit exceeded ──────────────────────────────────────────────────
  describe('when daily limit is exceeded', () => {
    it('should throw BadRequestException (or custom error) when daily limit exceeded', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCartItemRepo.findOne.mockResolvedValue(null);
      // Mock validateDailyLimit to throw
      jest.spyOn(service as any, 'validateDailyLimit').mockRejectedValue(
        new BadRequestException('daily limit exceeded'),
      );

      await expect(
        service.addItem('user-001', mockDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─── Monthly limit exceeded ────────────────────────────────────────────────
  describe('when monthly spending limit is exceeded', () => {
    it('should throw error when monthly limit exceeded', async () => {
      mockProductRepo.findOne.mockResolvedValue(mockProduct);
      mockCartItemRepo.findOne.mockResolvedValue(null);
      jest.spyOn(service as any, 'validateDailyLimit').mockResolvedValue(undefined);
      jest.spyOn(service as any, 'validateMonthlyLimit').mockRejectedValue(
        new BadRequestException('monthly limit exceeded'),
      );

      await expect(
        service.addItem('user-001', mockDto),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
```

**Hướng dẫn cho developer:**
1. Đọc toàn bộ `CartService` constructor để xác nhận chính xác các repository được inject — thêm provider đúng vào test module
2. Nếu `validateDailyLimit` / `validateMonthlyLimit` dùng `createQueryBuilder` phức tạp, spy trực tiếp vào các method đó thay vì mock query builder chain
3. Verify `toResponse()` private method — nếu phức tạp, spy và mock return value
4. Target: ≥ 80% coverage cho `cart.service.ts`

**Coverage target:**
| File | Target |
|---|---|
| `cart.service.ts` | ≥ 80% |

**Verify:** `npm run test:cov -- cart.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Add to cart (E01 Mobile) | `cart.controller.ts:POST /user/cart/items` | Unit test không thay đổi source → behavior giữ nguyên |
| Get cart | `cart.service.ts:getCart` | Không bị ảnh hưởng bởi spec file mới |
| Remove cart item | `cart.service.ts:removeItem` | Không bị ảnh hưởng |
| Checkout validation (daily/monthly limit) | `order.service.ts` | CartService limit logic vẫn đúng như cũ |

## Không được làm
- Không thay đổi bất kỳ dòng code nào trong `cart.service.ts`
- Không bỏ qua test case "duplicate item" — đây là behavior quan trọng (quantity increment)
- Không dùng `jest.spyOn(service, 'addItem')` để mock chính method đang test

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] `npm run test:cov -- cart.service` — coverage ≥ 80% cho `cart.service.ts`
- [ ] Tất cả test cases pass: product not found, new item, duplicate item, daily limit, monthly limit
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
