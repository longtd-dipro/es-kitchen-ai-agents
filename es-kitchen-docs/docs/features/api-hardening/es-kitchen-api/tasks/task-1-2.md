# [BE] [Admin_Web] — Rate Limiting: ThrottlerModule + auth override

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Released hotfix-202606
- **Estimate Hour:** 3h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Task này là internal tech-debt cross-cutting (S2 — Security). Category tạm gán `Admin_Web`. Throttle limit sẽ affect tất cả clients (E01/E02/E03/E04).

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 1 — Security Hotfix |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-1-1, task-1-3, task-1-4 |
| Estimate | ~3h |

## Mục tiêu
Cài đặt `@nestjs/throttler` làm global guard, override per-route trên 3 login endpoints với limit 10 req/60s để ngăn brute force attack.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.2, 3.2)
- File liên quan:
  - `src/app.module.ts` — xem cấu trúc imports hiện tại, cách inject `ConfigService`
  - `src/modules/admin/http/controllers/auth.controller.ts` — xem `@Post('login')` pattern
  - `src/modules/admin-company/http/controllers/auth.controller.ts` — same
  - `src/modules/user/http/controllers/auth.controller.ts` — same

## Yêu cầu implement

### Cài package

```bash
npm install @nestjs/throttler
```

### Sửa: `src/app.module.ts`

Thêm import `ThrottlerModule` và global guard provider. Xóa decorator `@Global()` ở task-3-4 (out-of-scope task này).

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
// ... existing imports

@Global()   // <-- giữ nguyên @Global() — không xóa ở task này (task-3-4 xử lý)
@Module({
  imports: [
    // ... existing imports giữ nguyên ...

    /** Rate limiting */
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL') ?? 60,
            limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
          },
        ],
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    /** Global throttler guard */
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Env vars cần thêm:**
```
THROTTLE_TTL=60       # giây
THROTTLE_LIMIT=100    # request tối đa trong TTL window (global default)
```
DEV/STG: có thể set `THROTTLE_LIMIT=10000` để tránh block automation test.

### Sửa: auth controllers — thêm `@Throttle` override

Ba file cần sửa, pattern giống nhau — thêm decorator `@Throttle` lên `@Post('login')` method:

**`src/modules/admin/http/controllers/auth.controller.ts`:**
```typescript
import { Throttle } from '@nestjs/throttler';

// Trong class, trên method login:
@Throttle({ default: { ttl: 60, limit: 10 } })
@Post('login')
async login(...) {
  // existing logic giữ nguyên
}
```

**`src/modules/admin-company/http/controllers/auth.controller.ts`:** cùng pattern.

**`src/modules/user/http/controllers/auth.controller.ts`:** cùng pattern trên `@Post('login')`.

**Response khi vượt ngưỡng (HTTP 429):**
`TransformInterceptor` xử lý tự động — format chuẩn:
```json
{
  "statusCode": 429,
  "message": "Too Many Requests",
  "data": null
}
```
Không cần thêm xử lý custom response.

**Storage:** In-memory (default của ThrottlerModule). Đủ cho single-instance. Multi-instance scale cần `ThrottlerStorageRedisService` — out-of-scope, tạo task riêng nếu cần.

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/admin/http/controllers/auth.controller.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth.service';
import { createMock } from '@golevelup/ts-jest';

describe('Admin AuthController — throttle decorator', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot({ throttlers: [{ ttl: 60, limit: 10 }] }),
      ],
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: createMock<AuthService>() },
      ],
    }).compile();
    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login method should have @Throttle decorator with limit 10', () => {
    const metadata = Reflect.getMetadata(
      'throttler:metadata',
      controller.login,  // hoặc AuthController.prototype.login
    );
    expect(metadata).toBeDefined();
    expect(metadata?.default?.limit).toBe(10);
    expect(metadata?.default?.ttl).toBe(60);
  });
});
```

> Pattern tương tự áp dụng cho `admin-company` và `user` auth controller spec. Không cần tạo spec riêng cho 3 file — ghi chú trong DoD test manual với curl.

**Coverage target:**
| File | Target |
|---|---|
| `auth.controller.ts` (admin) | ≥ 70% |

**Verify:** `npm run test -- auth.controller`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Admin login flow bình thường | `src/modules/admin/http/controllers/auth.controller.ts` | Login 1-2 lần → HTTP 200; login 11+ lần trong 60s → HTTP 429 |
| Company Admin login | `src/modules/admin-company/http/controllers/auth.controller.ts` | Same |
| User login | `src/modules/user/http/controllers/auth.controller.ts` | Same |
| Automation test / CI | `.github/workflows/` | Set `THROTTLE_LIMIT=10000` trong CI env để tránh false positive |
| Global API (non-login) | Tất cả controllers | Default 100 req/60s — không ảnh hưởng đến các endpoint nghiệp vụ thông thường |

## Không được làm
- Không set `@SkipThrottle()` trên login endpoint — đây là mục tiêu của task
- Không thay đổi response format của login — chỉ thêm decorator
- Không sửa `AllExceptionsFilter` để xử lý 429 riêng — `TransformInterceptor` đã handle
- Không xóa `@Global()` khỏi `AppModule` — task-3-4 xử lý

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — decorator metadata verified
- [ ] Non-Regression verify đủ
- [ ] Manual test: 11 login requests liên tiếp → request thứ 11 trả về 429
- [ ] CI env có `THROTTLE_LIMIT=10000` để tránh block test
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
