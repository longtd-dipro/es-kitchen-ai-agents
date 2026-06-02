# [BE] [Admin_Web] — AppModule @Global() Cleanup

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 3h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Đây là code quality fix (Q2) với blast radius lớn nhất trong Phase 3. `@Global()` trên `AppModule` làm cho tất cả providers globally available mà không cần import rõ ràng — hidden coupling, khó refactor. Task này xóa decorator và thêm explicit imports nơi cần.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Performance + Code Quality |
| Repo | `es-kitchen-api` |
| Depends on | task-3-2 (RedisCacheModule có isGlobal riêng, không cần AppModule @Global) |
| Song song với | task-3-1, task-3-3 |
| Estimate | ~3h |

## Mục tiêu
Xóa `@Global()` decorator khỏi `AppModule`. Tìm tất cả modules/services đang hưởng lợi từ global scope, thêm explicit `imports` nơi cần thiết để đảm bảo DI không break.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Phase 3, Q2)
- File liên quan:
  - `src/app.module.ts:19` — `@Global()` hiện tại, xem danh sách imports và providers
  - `src/modules/admin/admin.module.ts` — xem module imports để biết đang dùng gì từ AppModule
  - `src/modules/admin-company/admin-company.module.ts` — same
  - `src/modules/user/user.module.ts` — same
  - `src/commons/utiliz/fcm-firebase/fcm.module.ts` — xem xem FcmModule có `@Global` riêng không
  - `src/commons/utiliz/elepay/` — xem ElepayModule có `@Global` không

> **CẢNH BÁO blast radius:** Xóa `@Global()` có thể gây DI errors nếu có provider nào đó đang được inject mà không có explicit module import. Bắt buộc phải chạy `npm run build` sau mỗi thay đổi để catch lỗi sớm.

## Yêu cầu implement

### Bước 1: Xác định providers hiện đang "global" nhờ @Global()

Chạy phân tích blast radius trước khi sửa:

1. Xem `AppModule.providers` — những providers nào đang listed ở đây sẽ mất "global" scope
2. Xem `AppModule.imports` — những modules nào có `isGlobal: true` đã tự handle scope riêng
3. Tìm tất cả file inject providers từ `AppModule` mà không có explicit import trong module của họ

**Checklist providers/modules trong `AppModule`:**
- `ConfigModule.forRoot({ isGlobal: true })` — tự global, không cần @Global của AppModule
- `TypeOrmModule.forRootAsync(...)` — global scope không cần @Global
- `EventEmitterModule.forRoot()` — kiểm tra xem có cần explicit import không
- `ScheduleModule.forRoot()` — same
- `I18nModule.forRoot(...)` — same
- `FcmModule` — kiểm tra xem `FcmModule` có `isGlobal: true` hay cần re-export
- `ElepayModule.forRootAsync(...)` — xem ElepayModule có cung cấp global exports không

### Bước 2: Xóa `@Global()` khỏi `AppModule`

```typescript
// TRƯỚC:
@Global()
@Module({
  imports: [...],
})
export class AppModule {}

// SAU:
@Module({   // <-- Xóa @Global()
  imports: [...],
})
export class AppModule {}
```

Xóa luôn import `Global` từ `@nestjs/common` nếu không còn dùng ở đây:
```typescript
// TRƯỚC:
import { Global, Module } from '@nestjs/common';

// SAU:
import { Module } from '@nestjs/common';
```

### Bước 3: Sau khi xóa @Global(), chạy build để tìm DI errors

```bash
npm run build
```

Nếu có error dạng `Nest can't resolve dependencies of <ServiceName>`, nghĩa là service đó đang inject provider từ AppModule mà chưa có explicit import. Fix theo từng case.

### Bước 4: Thêm explicit imports nơi cần thiết

**Pattern thêm explicit import:**
```typescript
// Ví dụ: nếu AdminModule cần FcmModule:
@Module({
  imports: [
    FcmModule,  // <-- thêm explicit
    // ... other imports
  ],
})
export class AdminModule {}
```

**Các candidates thường cần thêm explicit import (verify bằng build error):**
- `EventEmitterModule` — nếu modules dùng `@OnEvent` decorator
- `I18nModule` — nếu services inject `I18nService` mà module chưa import
- `FcmModule` — nếu services inject `FcmService`
- `ElepayModule` — nếu services inject `ElepayService`

### Bước 5: Verify không có circular dependency mới

```bash
npm run build
npm run start:dev
# Không có circular dependency warnings
```

## Unit Tests (BẮT BUỘC)

`@Global()` removal là structural change không có logic để unit test trực tiếp. Thay vào đó, verify bằng compilation + integration:

### Test file: `src/app.module.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    // This test verifies that AppModule compiles without @Global()
    // and all dependencies are properly wired
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should compile the entire application without DI errors', () => {
    expect(module).toBeDefined();
  });

  it('AppModule should not have @Global() decorator', () => {
    // Verify @Global decorator is removed
    const isGlobal = Reflect.getMetadata('isGlobal', AppModule);
    expect(isGlobal).toBeFalsy();
  });
});
```

> Lưu ý: Test này require tất cả external services (DB, Redis, Cognito, ...) — nên mock hoặc chạy trong e2e environment. Nếu không có test DB, dùng mock providers.

**Coverage target:**
| File | Target |
|---|---|
| `app.module.ts` | Compile + DI test (không đo line coverage) |

**Verify:** `npm run test -- app.module` hoặc `npm run build` (primary verify)

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| ConfigService injection | Tất cả services dùng `ConfigService` | Sau build, `npm run start:dev` không có DI error |
| I18nService injection | Services dùng `I18nService` | Translate keys vẫn hoạt động |
| FcmService | `notification.service.ts` | FCM push notification vẫn trigger |
| ElepayService | `order.service.ts`, `elepay.service.ts` | Payment flow vẫn hoạt động |
| EventEmitter | Services dùng `@OnEvent` | Events vẫn được emit/receive |
| ScheduleModule (cron jobs) | Services dùng `@Cron` | Cron jobs vẫn trigger theo schedule |
| TypeORM repositories | Tất cả services dùng `@InjectRepository` | Không bị ảnh hưởng (TypeORM module handles separately) |

## Không được làm
- Không xóa `@Global()` rồi deploy ngay mà không build/test trước
- Không thêm `@Global()` vào các feature modules khác như giải pháp tạm
- Không thay đổi logic business của bất kỳ service nào trong task này

## Definition of Done
- [ ] `@Global()` đã xóa khỏi `AppModule`
- [ ] Build pass (`npm run build`) — không có DI error
- [ ] Lint pass (`npm run lint`)
- [ ] App khởi động được (`npm run start:dev`) — không có circular dependency warning
- [ ] Unit Test compile test pass
- [ ] Non-Regression verify đủ (tất cả services vẫn inject được dependencies)
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
