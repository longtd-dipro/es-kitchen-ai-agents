# [BE] Payment_App_Mobile — AuthService: guestLogin() + sendLinkEmailOtp() + verifyLinkEmailOtp()

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 7h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — NestJS Service + API Endpoint |
| Repo | `es-kitchen-api` |
| Depends on | task-1-1 |
| Song song với | task-2-2 (sau khi task-1-1 done) |
| Estimate | ~7h |

## Mục tiêu

Thêm 3 method mới vào `AuthService` (user module): `guestLogin()`, `sendLinkEmailOtp()`, `verifyLinkEmailOtp()`. Đây là business logic core cho toàn bộ guest authentication flow (US-01 và US-04).

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-api/DESIGN.md` (section 4 — Service Layer, section 6 — Flow chi tiết)
- File liên quan:
  - `es-kitchen-repository/es-kitchen-api/src/modules/user/services/auth.service.ts` — file chính cần sửa. Đọc toàn bộ để hiểu pattern inject, OTP flow (`generateOtp`, `validateOtp`, `markOtpAsUsed`), `getTokens()`
  - `es-kitchen-repository/es-kitchen-api/src/commons/utiliz/aws/cognito.service.ts` — dùng `signUpUser()` method (không phải `signUp()` — method thực tế là `signUpUser`)
  - `es-kitchen-repository/es-kitchen-api/src/entities/user.entity.ts` — sau task-1-1 đã có `userType: UserType` và `password: string | null`

## Yêu cầu implement

### Sửa: `src/modules/user/services/auth.service.ts`

**Inject thêm `@InjectRepository(User)`** vào constructor (hiện tại service chỉ inject `Otp` repository, không inject `User` repo — cần thêm để query/save User):

```typescript
@InjectRepository(User)
private readonly userRepository: Repository<User>,
```

**Thêm import:**
```typescript
import { User } from 'src/entities/user.entity';
import { UserType } from 'src/commons/enums/user.enum';
```

**Method 1: `guestLogin()`**

```typescript
async guestLogin(): Promise<{ accessToken: string; refreshToken: string }> {
  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    const suffix = crypto.randomBytes(4).toString('hex'); // 8 hex chars = [0-9a-f]
    const email = `guest_${suffix}@eskitchen.local`;
    const userName = `ゲスト_${suffix}`;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      attempt++;
      continue;
    }

    const user = this.userRepository.create({
      email,
      userName,
      userType: UserType.GUEST,
      password: null,
      companyId: null,
      userCode: `GUEST_${suffix.toUpperCase()}`, // unique user_code required
    });

    await this.userRepository.save(user);
    return this.getTokens({ id: user.id, email: user.email });
  }

  throw new InternalServerErrorException(
    this.i18n.t('user.auth.guest_create_failed', {
      lang: I18nContext.current()?.lang,
    }),
  );
}
```

**Lưu ý:** `user_code` column là `unique` trong entity — phải generate giá trị unique. Dùng `GUEST_${suffix.toUpperCase()}` (format rõ ràng, không conflict với registered user code).

**Method 2: `sendLinkEmailOtp(userId: string, email: string)`**

```typescript
async sendLinkEmailOtp(userId: string, email: string): Promise<void> {
  const user = await this.userService.findById(userId);

  if (!user || user.userType !== UserType.GUEST) {
    throw new ForbiddenException(
      this.i18n.t('user.auth.guest_only', { lang: I18nContext.current()?.lang }),
    );
  }

  // BR-11: Block nếu email đã tồn tại dưới dạng registered
  const existing = await this.userRepository.findOne({
    where: { email, userType: UserType.REGISTERED },
  });
  if (existing) {
    throw new BadRequestException(
      this.i18n.t('user.auth.email_already_exists', { lang: I18nContext.current()?.lang }),
    );
  }

  const otp = await this.generateOtp(GUEST_COMPANY_CODE, email); // tái dùng method private hiện có
  await this.sendOtpLinkEmailEmail(email, otp);
}
```

**Method 3: `verifyLinkEmailOtp(userId, email, otp, password)`**

```typescript
async verifyLinkEmailOtp(
  userId: string,
  email: string,
  otp: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const user = await this.userService.findById(userId);

  if (!user || user.userType !== UserType.GUEST) {
    throw new ForbiddenException(
      this.i18n.t('user.auth.guest_only', { lang: I18nContext.current()?.lang }),
    );
  }

  // Double-check BR-11
  const existing = await this.userRepository.findOne({
    where: { email, userType: UserType.REGISTERED },
  });
  if (existing) {
    throw new BadRequestException(
      this.i18n.t('user.auth.email_already_exists', { lang: I18nContext.current()?.lang }),
    );
  }

  const otpStatus = await this.validateOtp(GUEST_COMPANY_CODE, email, otp); // tái dùng
  if (otpStatus === 'expired') {
    throw new BadRequestException(
      this.i18n.t('user.auth.otp_expired', { lang: I18nContext.current()?.lang }),
    );
  }
  if (otpStatus === 'invalid') {
    throw new BadRequestException(
      this.i18n.t('user.auth.otp_invalid', { lang: I18nContext.current()?.lang }),
    );
  }

  await this.markOtpAsUsed(GUEST_COMPANY_CODE, email, otp); // tái dùng

  // Tạo Cognito user (method thực tế là signUpUser, không phải signUp)
  await this.cognitoService.signUpUser(AwsCognitoUserPool.USER, {
    email,
    password,
    companyCode: undefined,
  });

  // Hash password và upgrade account
  const hashedPassword = await argon2.hash(password);
  await this.userRepository.update(user.id, {
    email,
    password: hashedPassword,
    userType: UserType.REGISTERED,
  });

  return this.getTokens({ id: user.id, email });
}
```

**Method private: `sendOtpLinkEmailEmail()`**

```typescript
private async sendOtpLinkEmailEmail(email: string, otp: string): Promise<void> {
  await this.mailService.sendTemplated({
    to: [email],
    templateName: 'otp-link-email', // tạo template mới (xem OQ-3 trong DESIGN)
    context: {
      userName: email.split('@')[0],
      otpCode: otp,
      expirationTime: '5 minutes',
    },
    subjectOverride: '【ESステーション】メールアドレス連携用認証コードのご案内',
  });
}
```

**Fallback nếu template `otp-link-email` chưa tồn tại:** tái dùng `otp-forgot-password` tạm thời, ghi TODO comment để Designer tạo template sau.

### Cập nhật: `src/modules/user/user.module.ts`

Đảm bảo `User` entity được `forFeature([..., User])` nếu chưa có trong module.

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/user/services/auth.service.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from 'src/entities/user.entity';
import { Otp } from 'src/entities/otp.entity';
import { UserType } from 'src/commons/enums/user.enum';
import { CognitoService } from 'src/commons/utiliz/aws/cognito.service';
import { MailService } from 'src/commons/utiliz/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('AuthService — Guest Mode methods', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<User>>;
  let cognitoService: jest.Mocked<CognitoService>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: createMock<UserService>() },
        { provide: CognitoService, useValue: createMock<CognitoService>() },
        { provide: MailService, useValue: createMock<MailService>() },
        { provide: JwtService, useValue: createMock<JwtService>() },
        { provide: ConfigService, useValue: createMock<ConfigService>() },
        { provide: I18nService, useValue: createMock<I18nService>() },
        {
          provide: getRepositoryToken(User),
          useValue: createMock<Repository<User>>(),
        },
        {
          provide: getRepositoryToken(Otp),
          useValue: createMock<Repository<Otp>>(),
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    cognitoService = module.get(CognitoService);
    userService = module.get(UserService);
  });

  describe('guestLogin()', () => {
    it('should create guest user and return tokens', async () => {
      userRepo.findOne.mockResolvedValue(null); // no collision
      userRepo.create.mockReturnValue({ id: '1', email: 'guest_abc@eskitchen.local' } as User);
      userRepo.save.mockResolvedValue({ id: '1', email: 'guest_abc@eskitchen.local' } as User);
      jest.spyOn(service as any, 'getTokens').mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await service.guestLogin();

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(userRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should retry on suffix collision and succeed on 2nd attempt', async () => {
      userRepo.findOne
        .mockResolvedValueOnce({ id: '99' } as User) // collision on 1st suffix
        .mockResolvedValueOnce(null); // no collision on 2nd
      userRepo.create.mockReturnValue({ id: '1' } as User);
      userRepo.save.mockResolvedValue({ id: '1', email: 'guest_xxx@eskitchen.local' } as User);
      jest.spyOn(service as any, 'getTokens').mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });

      const result = await service.guestLogin();
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw InternalServerErrorException after 3 collision retries', async () => {
      userRepo.findOne.mockResolvedValue({ id: '99' } as User); // always collision
      await expect(service.guestLogin()).rejects.toThrow();
    });
  });

  describe('sendLinkEmailOtp()', () => {
    it('should throw ForbiddenException if user is not guest', async () => {
      userService.findById.mockResolvedValue({ userType: UserType.REGISTERED } as User);
      await expect(service.sendLinkEmailOtp('1', 'test@email.com')).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if email already exists as registered', async () => {
      userService.findById.mockResolvedValue({ userType: UserType.GUEST } as User);
      userRepo.findOne.mockResolvedValue({ id: '2', userType: UserType.REGISTERED } as User);
      await expect(service.sendLinkEmailOtp('1', 'existing@email.com')).rejects.toThrow(BadRequestException);
    });

    it('should call generateOtp and send email for valid guest + new email', async () => {
      userService.findById.mockResolvedValue({ userType: UserType.GUEST } as User);
      userRepo.findOne.mockResolvedValue(null); // email not registered
      jest.spyOn(service as any, 'generateOtp').mockResolvedValue('1234');
      const sendOtpSpy = jest.spyOn(service as any, 'sendOtpLinkEmailEmail').mockResolvedValue(undefined);

      await service.sendLinkEmailOtp('1', 'new@email.com');
      expect(sendOtpSpy).toHaveBeenCalledWith('new@email.com', '1234');
    });
  });

  describe('verifyLinkEmailOtp()', () => {
    it('should throw ForbiddenException if user is not guest', async () => {
      userService.findById.mockResolvedValue({ userType: UserType.REGISTERED } as User);
      await expect(
        service.verifyLinkEmailOtp('1', 'e@mail.com', '1234', 'pwd'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException on expired OTP', async () => {
      userService.findById.mockResolvedValue({ id: '1', userType: UserType.GUEST } as User);
      userRepo.findOne.mockResolvedValue(null);
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('expired');
      await expect(
        service.verifyLinkEmailOtp('1', 'e@mail.com', '1234', 'pwd'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on invalid OTP', async () => {
      userService.findById.mockResolvedValue({ id: '1', userType: UserType.GUEST } as User);
      userRepo.findOne.mockResolvedValue(null);
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('invalid');
      await expect(
        service.verifyLinkEmailOtp('1', 'e@mail.com', '9999', 'pwd'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should upgrade guest to registered and return new tokens on valid OTP', async () => {
      userService.findById.mockResolvedValue({ id: '1', userType: UserType.GUEST } as User);
      userRepo.findOne.mockResolvedValue(null);
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('valid');
      jest.spyOn(service as any, 'markOtpAsUsed').mockResolvedValue(undefined);
      cognitoService.signUpUser.mockResolvedValue(undefined as any);
      userRepo.update.mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service as any, 'getTokens').mockResolvedValue({ accessToken: 'new_at', refreshToken: 'new_rt' });

      const result = await service.verifyLinkEmailOtp('1', 'new@mail.com', '1234', 'SecurePass1!');
      expect(result).toHaveProperty('accessToken', 'new_at');
      expect(userRepo.update).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({ userType: UserType.REGISTERED, email: 'new@mail.com' }),
      );
    });
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `auth.service.ts` (guest methods) | ≥ 80% |

**Verify:** `npm run test -- auth.service`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login thường (`login()` method) | `src/modules/user/services/auth.service.ts` | Unit test hiện có của `login()` vẫn pass sau khi thêm `@InjectRepository(User)` |
| Forgot Password (`forgotPassword()`) | `auth.service.ts` | Tái dùng `GUEST_COMPANY_CODE` const — không conflict với flow guest |
| Register flow | `registration.service.ts` | Không bị touch — verify bằng `npm run test -- registration.service` |
| OTP rate limit (1/60s) | `auth.service.ts:generateOtp()` | Method `generateOtp` là private, không sửa — guest flow tái dùng nguyên |
| `getTokens()` payload | `auth.service.ts` | Payload `{ id, email }` — không đưa `userType` vào JWT, verify trong unit test |

## Không được làm

- Không sửa `login()`, `forgotPassword()`, `resetPassword()` — chỉ thêm 3 method mới
- Không thêm `userType` vào JWT payload — security decision theo DESIGN section 8
- Không tạo Cognito user trong `guestLogin()` — guest không có Cognito user
- Không sửa `registration.service.ts` trong task này
- Không tự tạo email template HTML — ghi TODO comment và tạm dùng template hiện có

## Definition of Done

- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target (≥ 80% cho 3 method mới)
- [ ] Test tất cả edge case: collision retry, guest-only guard, OTP expired/invalid, BR-11 email exist
- [ ] Non-Regression verify: `login()` + `forgotPassword()` unit tests vẫn pass
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
