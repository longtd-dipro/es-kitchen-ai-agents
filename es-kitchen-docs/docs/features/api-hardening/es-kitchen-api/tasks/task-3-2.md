# [BE] [Admin_Web] — Redis Cache Layer: RedisCacheModule + cache-aside cho MenuService

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 6h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Category `Admin_Web`. Task này là infrastructure — ảnh hưởng performance của menu screen (E01 Mobile). Cần DevOps confirm ElastiCache endpoint trước khi có thể test trên DEV.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Performance + Code Quality |
| Repo | `es-kitchen-api` |
| Depends on | task-3-3 (MenuService decoupling phải xong trước để tránh inject conflict) |
| Song song với | task-3-1, task-3-4 |
| Estimate | ~6h |

## Mục tiêu
Tạo `RedisCacheModule` tại `src/commons/cache/` và implement cache-aside pattern trong `MenuService.getMenuProducts()`. Chỉ cache phần menu/product data chung — không cache cart/favorites (user-specific).

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 2.3, 6.2)
- File liên quan:
  - `src/modules/user/services/menu.service.ts` — xem toàn bộ `getMenuProducts()` để biết điểm inject cache
  - `src/app.module.ts` — xem cách import module mới
  - `src/modules/user/user.module.ts` — xem imports list để biết cần thêm `RedisCacheModule`

> **BLOCKER:** Cần DevOps cung cấp `REDIS_HOST` và `REDIS_PORT` cho DEV/STG ElastiCache. Không hardcode. Nếu chưa có endpoint, có thể dùng `localhost:6379` cho local dev nhưng phải có fallback graceful khi Redis không available.

## Yêu cầu implement

### Bước 1: Cài packages

```bash
npm install @nestjs/cache-manager cache-manager cache-manager-ioredis-yet
```

Confirm version compatibility: `cache-manager` v5+, `cache-manager-ioredis-yet` latest.

### Bước 2: Tạo `src/commons/cache/redis-cache.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get<string>('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT') ?? 6379,
        ttl: 600,  // default TTL 10 phút — override per key khi set
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
```

**Env vars cần thêm vào AWS Parameter Store:**
```
REDIS_HOST=<elasticache-endpoint>    # từ DevOps
REDIS_PORT=6379
```

### Bước 3: Import `RedisCacheModule` vào `UserModule`

Trong `src/modules/user/user.module.ts`, thêm `RedisCacheModule` vào `imports`:
```typescript
import { RedisCacheModule } from '../../commons/cache/redis-cache.module';

@Module({
  imports: [
    // ... existing imports
    RedisCacheModule,
  ],
  // ...
})
export class UserModule {}
```

### Bước 4: Inject `CACHE_MANAGER` vào `MenuService` và implement cache-aside

```typescript
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class MenuService {
  constructor(
    // ... existing injections (sau task-3-3 đã thay CartService/FavoriteService bằng repo) ...
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getMenuProducts(
    userId: string,
    query: GetMenuProductsRequest,
    now: Date = new Date(),
  ): Promise<MenuProductsResponse> {
    const activeYMs = await this.resolveActiveYearMonths(now);
    // Dùng year-month đầu tiên (current active) làm cache key
    const primaryYM = activeYMs[0] ?? 'unknown';
    const cacheKey = `menu:user:${primaryYM.replace('/', '-')}`;

    // ─── Cache-aside: phần menu/product data (không phụ thuộc user) ───
    let cachedMenuData: any = await this.cacheManager.get(cacheKey);

    if (!cachedMenuData) {
      // MISS: query DB (existing logic — không thay đổi query)
      cachedMenuData = await this.fetchMenuProductsFromDb(activeYMs, query);
      await this.cacheManager.set(cacheKey, cachedMenuData, 600);  // TTL 600s
    }

    // ─── User-specific data: query trực tiếp, KHÔNG cache ─────────────
    const cartItems = await this.cartItemRepository.find({
      where: { cart: { userId } },
      select: ['productId', 'quantity'],
      relations: ['cart'],
    });

    const favorites = await this.userFavoriteRepository.find({
      where: { userId },
      select: ['productId'],
    });
    const favoriteIds = new Set(favorites.map(f => f.productId));

    // ─── Merge cached menu data + user-specific data ───────────────────
    return this.buildMenuResponse(cachedMenuData, cartItems, favoriteIds);
  }

  // Extract DB query logic vào private method để test riêng
  private async fetchMenuProductsFromDb(
    activeYMs: string[],
    query: GetMenuProductsRequest,
  ): Promise<any> {
    // Existing query builder logic từ getMenuProducts() hiện tại
    // ... giữ nguyên toàn bộ query builder code ...
  }

  private buildMenuResponse(
    menuData: any,
    cartItems: CartItem[],
    favoriteIds: Set<string>,
  ): MenuProductsResponse {
    // Apply user-specific transformations (in cart, is favorite)
    // ... logic merge ...
  }
}
```

**Key patterns theo DESIGN:**

| Key | TTL | Invalidate khi |
|---|---|---|
| `menu:user:<yearMonth>` | 600s | Admin publish/unpublish menu của `yearMonth` đó |
| `categories:active` | 3600s | Admin/Supplier update/create/delete category |
| `allergens:all` | 3600s | Admin update allergen |

**Invalidation:** Thêm `await this.cacheManager.del(cacheKey)` vào admin service khi publish/unpublish menu. Phạm vi invalidation này nằm trong admin services — tạo note cho reviewer để track.

> **Scope giới hạn:** Task này chỉ implement cache cho `MenuService.getMenuProducts()`. Cache cho `categories` và `allergens` là separate enhancement — không implement trong task này trừ khi DESIGN thay đổi.

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/user/services/menu.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createMock } from '@golevelup/ts-jest';
import { MenuService } from './menu.service';
import { Menu } from '../../../entities/menu.entity';
import { MenuProduct } from '../../../entities/menu-product.entity';
import { Product } from '../../../entities/product.entity';
import { Allergen } from '../../../entities/allergen.entity';
import { CartItem } from '../../../entities/cart-item.entity';
import { UserFavorite } from '../../../entities/user-favorite.entity';
import { I18nService } from 'nestjs-i18n';

describe('MenuService.getMenuProducts — cache-aside', () => {
  let service: MenuService;
  let mockCacheManager: jest.Mocked<any>;

  const mockMenuRepo = {
    findOne: jest.fn().mockResolvedValue({ yearMonth: '2026/06', publishStatus: 'PUBLISHED' }),
  };
  const mockMenuProductRepo = {
    createQueryBuilder: jest.fn(),
  };
  const mockCartItemRepo = {
    find: jest.fn().mockResolvedValue([]),
  };
  const mockFavoriteRepo = {
    find: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    const qbMock = {
      innerJoin: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    mockMenuProductRepo.createQueryBuilder.mockReturnValue(qbMock);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: getRepositoryToken(Menu), useValue: mockMenuRepo },
        { provide: getRepositoryToken(MenuProduct), useValue: mockMenuProductRepo },
        { provide: getRepositoryToken(Product), useValue: createMock() },
        { provide: getRepositoryToken(Allergen), useValue: createMock() },
        { provide: getRepositoryToken(CartItem), useValue: mockCartItemRepo },
        { provide: getRepositoryToken(UserFavorite), useValue: mockFavoriteRepo },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: I18nService, useValue: { t: jest.fn() } },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  it('should return cached data on HIT without querying DB', async () => {
    const cachedData = [{ id: 'prod-001', name: 'Cached Ramen' }];
    mockCacheManager.get.mockResolvedValue(cachedData);

    await service.getMenuProducts('user-001', {} as any);

    expect(mockCacheManager.get).toHaveBeenCalledWith(expect.stringContaining('menu:user:'));
    expect(mockMenuProductRepo.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('should query DB and set cache on MISS', async () => {
    mockCacheManager.get.mockResolvedValue(null);  // MISS

    await service.getMenuProducts('user-001', {} as any);

    expect(mockMenuProductRepo.createQueryBuilder).toHaveBeenCalled();
    expect(mockCacheManager.set).toHaveBeenCalledWith(
      expect.stringContaining('menu:user:'),
      expect.anything(),
      600,  // TTL
    );
  });

  it('should always query DB for user-specific data (cart items, favorites)', async () => {
    mockCacheManager.get.mockResolvedValue([{ id: 'prod-001' }]);  // HIT

    await service.getMenuProducts('user-002', {} as any);

    // Cart và favorites luôn query DB, không dùng cache
    expect(mockCartItemRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ cart: { userId: 'user-002' } }) }),
    );
    expect(mockFavoriteRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-002' } }),
    );
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `redis-cache.module.ts` | ≥ 70% (integration test verify module loads) |
| `menu.service.ts` (cache path) | ≥ 80% |

**Verify:** `npm run test -- menu.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Menu screen (E01 Mobile) | `menu.controller.ts:GET /user/menu` | Sau khi thêm cache, response data giống nhau (dùng same fixture để compare) |
| Cart status trong menu | `menu.service.ts` | Cart items vẫn query DB trực tiếp, không bị stale cache |
| Favorite status trong menu | `menu.service.ts` | Favorites vẫn query DB, không bị stale cache |
| Admin publish menu → invalidate cache | Admin menu service | Sau khi admin publish, cache được xóa và user thấy menu mới |

## Không được làm
- Không cache cart items hay favorites — user-specific data
- Không hardcode `REDIS_HOST` — phải qua `ConfigService`
- Không thay đổi response DTO của `getMenuProducts`
- Không implement cache cho `categories` hay `allergens` trong task này — đó là separate task nếu cần

## Definition of Done
- [ ] `RedisCacheModule` tạo xong tại `src/commons/cache/redis-cache.module.ts`
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — 3 cases: HIT (no DB), MISS (DB + set cache), user-specific always DB
- [ ] Non-Regression verify đủ
- [ ] DevOps đã confirm `REDIS_HOST` và `REDIS_PORT` cho DEV
- [ ] Manual test: gọi menu endpoint lần 2 nhanh hơn lần 1 (cache HIT)
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
