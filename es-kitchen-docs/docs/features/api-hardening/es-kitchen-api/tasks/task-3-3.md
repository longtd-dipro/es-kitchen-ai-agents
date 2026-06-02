# [BE] [Admin_Web] — MenuService Decoupling: tách CartService/FavoriteService → inject repo trực tiếp

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 4h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Task này là code quality fix (Q1). `MenuService` hiện inject `CartService` + `FavoriteService` — circular dependency risk khi mở rộng. Thay bằng direct repo inject để giảm coupling. Response format không đổi.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Performance + Code Quality |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-3-1, task-3-4 |
| Estimate | ~4h |

## Mục tiêu
Thay `CartService` và `FavoriteService` injection trong `MenuService` bằng `CartItemRepository` và `UserFavoriteRepository` trực tiếp. Inline query đơn giản thay vì gọi qua service. Không thay đổi response format.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.8)
- File liên quan:
  - `src/modules/user/services/menu.service.ts:33-50` — xem constructor hiện tại (inject `FavoriteService` line 44, `CartService` line 45)
  - `src/modules/user/services/menu.service.ts` — xem toàn bộ file để biết `cartService` và `favoriteService` được dùng ở method nào
  - `src/modules/user/services/cart.service.ts` — xem method nào của CartService đang được dùng trong MenuService
  - `src/modules/user/services/favorite.service.ts` — xem method nào của FavoriteService đang được dùng
  - `src/modules/user/user.module.ts` — xem `TypeOrmModule.forFeature([...])` để biết cần thêm entity nào

## Yêu cầu implement

### Bước 1: Xác định method nào của CartService/FavoriteService đang được dùng trong MenuService

Trước khi code, đọc toàn bộ `menu.service.ts` và tìm tất cả calls đến `this.cartService.*` và `this.favoriteService.*`. Identify:
- Cần data gì từ cart? (likely: list cartItems của user)
- Cần data gì từ favorite? (likely: set productIds đã favorite)

### Bước 2: Sửa constructor trong `src/modules/user/services/menu.service.ts`

```typescript
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from '../../../entities/cart-item.entity';
import { UserFavorite } from '../../../entities/user-favorite.entity';
// Xóa: import { CartService } from './cart.service';
// Xóa: import { FavoriteService } from './favorite.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(MenuProduct)
    private readonly menuProductRepository: Repository<MenuProduct>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Allergen)
    private readonly allergenRepository: Repository<Allergen>,
    // Thay thế CartService:
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    // Thay thế FavoriteService:
    @InjectRepository(UserFavorite)
    private readonly userFavoriteRepository: Repository<UserFavorite>,
    private readonly i18n: I18nService,
    // KHÔNG có CartService, FavoriteService nữa
  ) {}
```

### Bước 3: Thay calls đến CartService/FavoriteService bằng inline query

**Thay `this.cartService.getCartItems(userId)` hoặc tương tự:**
```typescript
// Lấy cart items của user
const cartItems = await this.cartItemRepository.find({
  where: { cart: { userId } },
  select: ['productId', 'quantity'],
  relations: ['cart'],
});
```

**Thay `this.favoriteService.getFavoriteProductIds(userId)` hoặc tương tự:**
```typescript
// Lấy set product IDs đã favorite
const favorites = await this.userFavoriteRepository.find({
  where: { userId },
  select: ['productId'],
});
const favoriteIds = new Set(favorites.map(f => f.productId));
```

> **Lưu ý:** Tên field trong `CartItem` entity (`cartId`, `productId`, `quantity`) và relation `cart` phải được verify bằng cách đọc `src/entities/cart-item.entity.ts` và `src/entities/user-favorite.entity.ts`. Điều chỉnh query nếu field names khác.

### Bước 4: Cập nhật `UserModule` — thêm entities vào `TypeOrmModule.forFeature`

Trong `src/modules/user/user.module.ts`, đảm bảo `CartItem` và `UserFavorite` đã có trong `TypeOrmModule.forFeature([...])`. Nếu chưa có, thêm vào:

```typescript
TypeOrmModule.forFeature([
  // ... existing entities
  CartItem,      // thêm nếu chưa có
  UserFavorite,  // thêm nếu chưa có
])
```

> Trước khi thêm, kiểm tra xem `CartItem` đã được import qua module nào chưa để tránh duplicate registration.

### Bước 5: Xóa import CartService/FavoriteService khỏi MenuService

Sau khi đã thay hết calls, xóa:
```typescript
// Xóa các dòng này khỏi menu.service.ts:
// import { CartService } from './cart.service';
// import { FavoriteService } from './favorite.service';
```

**Verify không còn reference nào đến `this.cartService` hay `this.favoriteService` trong file.**

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/user/services/menu.service.spec.ts`

> Nếu task-3-2 đã tạo spec file, bổ sung test cases vào. Nếu chưa, tạo mới.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { MenuService } from './menu.service';
import { Menu } from '../../../entities/menu.entity';
import { MenuProduct } from '../../../entities/menu-product.entity';
import { Product } from '../../../entities/product.entity';
import { Allergen } from '../../../entities/allergen.entity';
import { CartItem } from '../../../entities/cart-item.entity';
import { UserFavorite } from '../../../entities/user-favorite.entity';
import { I18nService } from 'nestjs-i18n';

describe('MenuService — decoupled from CartService/FavoriteService', () => {
  let service: MenuService;
  let mockCartItemRepo: any;
  let mockFavoriteRepo: any;

  beforeEach(async () => {
    mockCartItemRepo = { find: jest.fn().mockResolvedValue([]) };
    mockFavoriteRepo = { find: jest.fn().mockResolvedValue([]) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: getRepositoryToken(Menu), useValue: { findOne: jest.fn().mockResolvedValue(null) } },
        {
          provide: getRepositoryToken(MenuProduct),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue({
              innerJoin: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              addSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
        { provide: getRepositoryToken(Product), useValue: createMock() },
        { provide: getRepositoryToken(Allergen), useValue: createMock() },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(UserFavorite), useValue: mockFavoriteRepo },
        { provide: I18nService, useValue: { t: jest.fn() } },
        // Không có CartService, FavoriteService — verify DI không cần nữa
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should query cartItemRepository directly (not CartService) for cart items', async () => {
    await service.getMenuProducts('user-test', {} as any);

    expect(mockCartItemRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ cart: { userId: 'user-test' } }),
      }),
    );
  });

  it('should query userFavoriteRepository directly (not FavoriteService) for favorites', async () => {
    await service.getMenuProducts('user-test', {} as any);

    expect(mockFavoriteRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-test' },
        select: ['productId'],
      }),
    );
  });

  it('should mark product as inCart when userId has that product in cart', async () => {
    mockCartItemRepo.find.mockResolvedValue([
      { productId: 'prod-001', quantity: 2 },
    ]);
    // Menu data returns prod-001
    jest.spyOn(service as any, 'fetchMenuProductsFromDb').mockResolvedValue([
      { id: 'prod-001', name: 'Ramen' },
    ]);

    const result = await service.getMenuProducts('user-test', {} as any);

    // Verify product in result has inCart = true
    // (Adjust assertion based on actual response structure)
    expect(result).toBeDefined();
  });

  it('should compile without CartService or FavoriteService in providers', () => {
    // If module compiles (beforeEach succeeds), this proves decoupling
    expect(service).toBeDefined();
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `menu.service.ts` | ≥ 80% |

**Verify:** `npm run test -- menu.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Menu screen (E01 Mobile) — response schema | `menu.controller.ts`, `menu-products.response.ts` | Response DTO fields (products, inCart, isFavorite) không thay đổi |
| Cart quantity trong menu | `menu.service.ts` | Sản phẩm trong giỏ hàng vẫn hiển thị đúng quantity |
| Favorite indicator trong menu | `menu.service.ts` | Sản phẩm đã favorite vẫn có `isFavorite: true` |
| CartService hoạt động độc lập | `cart.service.ts` | CartService không bị ảnh hưởng — vẫn dùng được |
| FavoriteService hoạt động độc lập | `favorite.service.ts` | FavoriteService không bị ảnh hưởng |
| CategoryService dùng MenuService | `category.service.ts:16` | `CategoryService.getAll()` vẫn hoạt động (`menuService.resolveActiveYearMonths` không đổi) |

## Không được làm
- Không thay đổi response format của bất kỳ menu endpoint nào
- Không xóa `CartService` hay `FavoriteService` — chỉ bỏ khỏi `MenuService` constructor, các nơi khác vẫn dùng
- Không refactor `CartService` hay `FavoriteService` internal logic
- Không implement logic phức tạp hơn những gì `CartService`/`FavoriteService` đang làm — chỉ inline equivalent read query

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — 4 test cases (cartItem repo, favorite repo, inCart mark, compile test)
- [ ] Non-Regression verify đủ
- [ ] Integration test: `GET /user/menu?userId=...` response schema không đổi so với trước khi refactor
- [ ] `CategoryService.getAll()` vẫn hoạt động (dùng `menuService.resolveActiveYearMonths`)
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
