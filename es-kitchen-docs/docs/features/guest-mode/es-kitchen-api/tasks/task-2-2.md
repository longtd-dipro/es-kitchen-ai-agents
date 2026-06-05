# [BE] Payment_App_Mobile — AuthController: POST /auth/user/guest-login + POST /auth/user/link-email + POST /auth/user/link-email/verify

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 4h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — NestJS Service + API Endpoint |
| Repo | `es-kitchen-api` |
| Depends on | task-1-1, task-2-1 |
| Song song với | task-2-3 (sau khi task-2-1 done) |
| Estimate | ~4h |

## Mục tiêu

Expose 3 endpoint HTTP mới trong `AuthController` (user module) cho guest flow. Task này chỉ là HTTP layer — business logic đã có ở task-2-1. Bao gồm DTO request/validation và Swagger docs.

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-api/DESIGN.md` (section 3.1 — Endpoint mới)
- File liên quan:
  - `es-kitchen-repository/es-kitchen-api/src/modules/user/http/controllers/auth.controller.ts` — file chính cần sửa. Xem pattern `@Post`, `@UseGuards(JwtAuthGuard)`, `@GetUser('id')`
  - `es-kitchen-repository/es-kitchen-api/src/modules/user/http/requests/` — xem pattern DTO hiện có (vd `forgot-password.request.ts`) để đặt đúng convention
  - `es-kitchen-repository/es-kitchen-api/src/auth/guards/jwt-auth.guard.ts` — Guard hiện có, tái dùng

## Yêu cầu implement

### Tạo mới: `src/modules/user/http/requests/guest-link-email.request.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class GuestLinkEmailRequest {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'メールアドレスの形式が正しくありません' })
  @IsNotEmpty()
  email: string;
}
```

### Tạo mới: `src/modules/user/http/requests/guest-verify-link-email.request.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length, Matches, MinLength } from 'class-validator';

export class GuestVerifyLinkEmailRequest {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '1234', description: '4-digit OTP' })
  @IsString()
  @Length(4, 4)
  @Matches(/^\d{4}$/, { message: '認証コードは4桁の数字である必要があります' })
  otp: string;

  @ApiProperty({ example: 'SecurePassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;
}
```

### Sửa: `src/modules/user/http/controllers/auth.controller.ts`

Thêm 3 endpoint vào class `AuthController` hiện có:

```typescript
// --- Guest Mode endpoints ---

@Post('guest-login')
@ApiOperation({ summary: 'Guest login — create guest account and return tokens (US-01)' })
async guestLogin() {
  return await this.authService.guestLogin();
}

@Post('link-email')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Step 1: Guest sends email to receive OTP for upgrade (US-04)' })
async linkEmail(
  @GetUser('id') userId: string,
  @Body() body: GuestLinkEmailRequest,
) {
  await this.authService.sendLinkEmailOtp(userId, body.email);
  return {
    message: this.i18n.t('user.auth.otp_sent', { lang: I18nContext.current()?.lang }),
  };
}

@Post('link-email/verify')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Step 2: Verify OTP + set password to upgrade guest to registered (US-04)' })
async verifyLinkEmail(
  @GetUser('id') userId: string,
  @Body() body: GuestVerifyLinkEmailRequest,
) {
  return await this.authService.verifyLinkEmailOtp(
    userId,
    body.email,
    body.otp,
    body.password,
  );
}
```

**Inject thêm vào constructor** nếu chưa có `I18nService`:
```typescript
constructor(
  private readonly authService: AuthService,
  private readonly registrationService: RegistrationService,
  private readonly notificationService: NotificationService,
  private readonly i18n: I18nService, // thêm nếu chưa có
) {}
```

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/user/http/controllers/auth.controller.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { AuthController } from './auth.controller';
import { AuthService } from '../../services/auth.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { I18nService } from 'nestjs-i18n';

describe('AuthController — Guest Mode endpoints', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: RegistrationService, useValue: createMock<RegistrationService>() },
        { provide: NotificationService, useValue: createMock<NotificationService>() },
        { provide: I18nService, useValue: createMock<I18nService>() },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('POST /auth/user/guest-login', () => {
    it('should call authService.guestLogin() and return tokens', async () => {
      authService.guestLogin.mockResolvedValue({
        accessToken: 'at',
        refreshToken: 'rt',
      });

      const result = await controller.guestLogin();

      expect(authService.guestLogin).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });
  });

  describe('POST /auth/user/link-email', () => {
    it('should call sendLinkEmailOtp with userId and email', async () => {
      authService.sendLinkEmailOtp.mockResolvedValue(undefined);

      await controller.linkEmail('user-id-123', { email: 'new@mail.com' });

      expect(authService.sendLinkEmailOtp).toHaveBeenCalledWith(
        'user-id-123',
        'new@mail.com',
      );
    });
  });

  describe('POST /auth/user/link-email/verify', () => {
    it('should call verifyLinkEmailOtp and return new tokens', async () => {
      authService.verifyLinkEmailOtp.mockResolvedValue({
        accessToken: 'new_at',
        refreshToken: 'new_rt',
      });

      const result = await controller.verifyLinkEmail('user-id-123', {
        email: 'new@mail.com',
        otp: '1234',
        password: 'SecurePass1!',
      });

      expect(result).toEqual({ accessToken: 'new_at', refreshToken: 'new_rt' });
      expect(authService.verifyLinkEmailOtp).toHaveBeenCalledWith(
        'user-id-123',
        'new@mail.com',
        '1234',
        'SecurePass1!',
      );
    });
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `auth.controller.ts` (3 endpoint mới) | ≥ 70% |

**Verify:** `npm run test -- auth.controller`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login endpoint (`POST /auth/user/login`) | `auth.controller.ts` | Unit test existing `login()` phải pass không đổi |
| Register endpoint (`POST /auth/user/register`) | `auth.controller.ts` | Unit test không bị ảnh hưởng |
| Forgot password endpoints | `auth.controller.ts` | Unit test pass sau khi thêm 3 method mới |
| Swagger docs | `auth.controller.ts` | `npm run build` + check Swagger UI `/api/docs` không có lỗi |

## Không được làm

- Không sửa method `login()`, `register()`, `verifyOtp()`, `forgotPassword()` — chỉ thêm 3 method mới
- Không thêm business logic trong controller — controller chỉ delegate sang `authService`
- Không tạo controller mới — thêm vào `auth.controller.ts` hiện có
- Không thêm custom Guard mới — tái dùng `JwtAuthGuard` hiện có

## Definition of Done

- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target (≥ 70%)
- [ ] Swagger docs hiển thị đúng 3 endpoint mới tại `/api/docs`
- [ ] `POST /auth/user/guest-login` không yêu cầu auth (public)
- [ ] `POST /auth/user/link-email` và `POST /auth/user/link-email/verify` yêu cầu Bearer token
- [ ] Non-Regression verify: test các endpoint cũ vẫn pass
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
