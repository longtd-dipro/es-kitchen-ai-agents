# [BE] [Admin_Web] — verifyOtp: Transaction + Compensating Action

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 5h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Category tạm gán `Admin_Web`. Thực tế đây là critical path của user registration (E01 Mobile). Lỗi ở đây tạo orphan Cognito account.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Data Integrity + Testing |
| Repo | `es-kitchen-api` |
| Depends on | task-2-1 (cần migration xong để OTP entity type đúng) |
| Song song với | task-2-3 |
| Estimate | ~5h |

## Mục tiêu
Bọc các DB steps (createUser → historyInsert → removePendingUser → markOtpUsed) trong `DataSource.transaction()`. Thêm compensating action gọi `CognitoService.deleteUser()` khi DB fail sau khi Cognito user đã được tạo.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.5, 6.1)
- File liên quan:
  - `src/modules/user/services/registration.service.ts:105-199` — xem `verifyOtp()` hiện tại đầy đủ
  - `src/commons/utiliz/aws/cognito.service.ts:288-312` — xem `deleteUser()` đã có sẵn
  - `src/modules/user/services/user.service.ts` — xem `createUser()` để biết cần inline logic hay không

## Yêu cầu implement

### Sửa: `src/modules/user/services/registration.service.ts`

**Bước 1:** Inject `DataSource` vào constructor:

```typescript
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThan } from 'typeorm';
// ... existing imports

@Injectable()
export class RegistrationService {
  private readonly logger = new Logger(RegistrationService.name);

  constructor(
    @InjectRepository(PendingUser)
    private readonly pendingUserRepository: Repository<PendingUser>,
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(UserCompanyHistory)
    private readonly historyRepository: Repository<UserCompanyHistory>,
    @InjectDataSource()
    private readonly dataSource: DataSource,         // <-- THÊM
    private readonly mailService: MailService,
    private readonly cognitoService: CognitoService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly i18n: I18nService,
  ) {}
```

**Bước 2:** Refactor `verifyOtp()` method (thay thế từ line 154 đến 199):

```typescript
async verifyOtp(request: VerifyOtpRegistrationRequest) {
  // === Phần 1: Validate (unchanged) ===
  const pendingUser = await this.pendingUserRepository.findOne({
    where: { email: request.email },
  });
  if (!pendingUser) {
    throw new BadRequestException(
      this.i18n.t('user.auth.registration_session_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    );
  }

  let company: Company | null = null;
  if (pendingUser.companyId) {
    company = await this.companyRepository.findOne({
      where: { id: pendingUser.companyId },
    });
    if (!company) {
      throw new BadRequestException(
        this.i18n.t('user.auth.company_not_found', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }
  }

  const otpKey = company?.companyCode ?? GUEST_COMPANY_CODE;
  const otpStatus = await this.validateOtp(otpKey, request.otp, request.email);

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

  // === Phần 2: Cognito create (OUTSIDE transaction — irreversible external call) ===
  try {
    await this.cognitoService.createUserAndConfirm(AwsCognitoUserPool.USER, {
      email: request.email,
      password: request.password,
      companyCode: company?.companyCode,
    });
  } catch (e) {
    throw new InternalServerErrorException(
      this.i18n.t('user.auth.create_account_failed', {
        lang: I18nContext.current()?.lang,
      }),
    );
  }

  // === Phần 3: DB transaction (wrap steps 2-4 trong 1 transaction) ===
  let user: User;
  try {
    user = await this.dataSource.transaction(async (manager) => {
      // Step a: create user (inline logic — không gọi userService.createUser để dùng cùng manager)
      const newUser = manager.create(User, {
        email: pendingUser.email,
        userName: pendingUser.userName,
        gender: pendingUser.gender,
        birthday: pendingUser.birthday,
        companyId: pendingUser.companyId ?? undefined,
        employeeId: pendingUser.employeeId,
        linkStatus: pendingUser.companyId
          ? UserLinkStatus.LINKED
          : UserLinkStatus.UNLINKED,
        linkedAt: pendingUser.companyId ? new Date() : null,
      });
      const savedUser = await manager.save(User, newUser);

      // Step b: save company history if linked
      if (savedUser.companyId) {
        await manager.insert(UserCompanyHistory, {
          userId: savedUser.id,
          companyId: savedUser.companyId,
        });
      }

      // Step c: remove pending user
      await manager.remove(PendingUser, pendingUser);

      // Step d: mark OTP as used
      await manager.update(
        Otp,
        { code: request.otp, email: request.email, companyCode: otpKey },
        { isUsed: true },
      );

      return savedUser;
    });
  } catch (dbError) {
    // Compensating action: xóa Cognito user vừa tạo
    this.logger.error(
      `DB transaction failed after Cognito user created. Email: ${request.email}. Attempting rollback.`,
      dbError instanceof Error ? dbError.stack : String(dbError),
    );
    try {
      await this.cognitoService.deleteUser(AwsCognitoUserPool.USER, request.email);
      this.logger.log(`Cognito rollback successful for ${request.email}`);
    } catch (cognitoRollbackError) {
      // Orphan account — cần manual cleanup
      this.logger.error(
        `CRITICAL: Cognito rollback FAILED for ${request.email}. Manual cleanup required.`,
        cognitoRollbackError instanceof Error
          ? cognitoRollbackError.stack
          : String(cognitoRollbackError),
      );
    }
    throw new InternalServerErrorException(
      this.i18n.t('user.auth.create_account_failed', {
        lang: I18nContext.current()?.lang,
      }),
    );
  }

  // === Phần 4: Token generation (unchanged) ===
  const payload = { id: user.id, email: user.email };
  const tokens = await this.authService.getTokens(payload);
  return {
    message: this.i18n.t('user.auth.registration_success', {
      lang: I18nContext.current()?.lang,
    }),
    user,
    ...tokens,
  };
}
```

**Lưu ý quan trọng:**
- Import `User` entity trực tiếp nếu chưa có trong imports của file
- `markOtpAsUsed()` private method hiện tại — kiểm tra implementation để inline đúng condition vào `manager.update()`
- Xác nhận tên column trong `Otp` entity (`code`, `email`, `companyCode`) bằng cách đọc `src/entities/otp.entity.ts`
- `UserService.createUser()` không được gọi nữa trong transaction — nhưng `UserService` vẫn được inject cho các method khác nên KHÔNG xóa khỏi constructor

## Unit Tests (BẮT BUỘC)

> Task-2-6 sẽ viết unit test đầy đủ cho `verifyOtp()` bao gồm compensating action. Task này chỉ cần smoke test để verify transaction behavior.

### Test file: `src/modules/user/services/registration.service.spec.ts` (bắt đầu, task-2-6 hoàn chỉnh)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { DataSource, EntityManager } from 'typeorm';
import { RegistrationService } from './registration.service';
import { PendingUser } from '../../../entities/pending-user.entity';
import { Otp } from '../../../entities/otp.entity';
import { Company } from '../../../entities/company.entity';
import { UserCompanyHistory } from '../../../entities/user-company-history.entity';
import { CognitoService } from '../../../commons/utiliz/aws/cognito.service';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { MailService } from '../../../commons/utiliz/mail/mail.service';
import { I18nService } from 'nestjs-i18n';

describe('RegistrationService.verifyOtp — transaction + compensating', () => {
  let service: RegistrationService;
  let mockCognito: jest.Mocked<CognitoService>;
  let mockDataSource: jest.Mocked<DataSource>;

  const mockOtpRepo = {
    findOne: jest.fn(),
  };
  const mockPendingRepo = {
    findOne: jest.fn(),
  };
  const mockCompanyRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const managerMock: Partial<EntityManager> = {
      create: jest.fn().mockReturnValue({ id: 'user-123', email: 'test@test.com', companyId: null }),
      save: jest.fn().mockResolvedValue({ id: 'user-123', email: 'test@test.com', companyId: null }),
      insert: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (fn) => fn(managerMock)),
    } as any;

    mockCognito = createMock<CognitoService>();
    mockCognito.createUserAndConfirm.mockResolvedValue(undefined);
    mockCognito.deleteUser.mockResolvedValue(undefined);

    mockOtpRepo.findOne.mockResolvedValue({
      code: '123456',
      expiresAt: new Date(Date.now() + 60000),
      isUsed: false,
    });
    mockPendingRepo.findOne.mockResolvedValue({
      email: 'test@test.com',
      userName: 'Test',
      companyId: null,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getRepositoryToken(PendingUser), useValue: mockPendingRepo },
        { provide: getRepositoryToken(Otp), useValue: mockOtpRepo },
        { provide: getRepositoryToken(Company), useValue: mockCompanyRepo },
        { provide: getRepositoryToken(UserCompanyHistory), useValue: createMock() },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: CognitoService, useValue: mockCognito },
        { provide: UserService, useValue: createMock<UserService>() },
        { provide: AuthService, useValue: createMock<AuthService>() },
        { provide: MailService, useValue: createMock<MailService>() },
        { provide: I18nService, useValue: { t: jest.fn().mockReturnValue('mocked message') } },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  it('should call Cognito deleteUser when DB transaction fails', async () => {
    // Arrange: Cognito success, DB fails
    mockDataSource.transaction.mockRejectedValueOnce(new Error('DB connection error'));

    // Act & Assert
    await expect(
      service.verifyOtp({ email: 'test@test.com', otp: '123456', password: 'Pass@1234' } as any),
    ).rejects.toThrow();

    expect(mockCognito.createUserAndConfirm).toHaveBeenCalledTimes(1);
    expect(mockCognito.deleteUser).toHaveBeenCalledWith(
      expect.anything(),  // AwsCognitoUserPool.USER
      'test@test.com',
    );
  });

  it('should NOT call deleteUser when Cognito createUserAndConfirm fails', async () => {
    // Arrange: Cognito fails immediately
    mockCognito.createUserAndConfirm.mockRejectedValueOnce(new Error('Cognito error'));

    // Act & Assert
    await expect(
      service.verifyOtp({ email: 'test@test.com', otp: '123456', password: 'Pass@1234' } as any),
    ).rejects.toThrow();

    expect(mockCognito.deleteUser).not.toHaveBeenCalled();
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `registration.service.ts` | ≥ 80% (task-2-6 sẽ bổ sung thêm cases) |

**Verify:** `npm run test -- registration.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Happy path registration | `registration.service.ts:verifyOtp` | OTP valid → user created → tokens returned (E2E test) |
| resendOtp vẫn hoạt động | `registration.service.ts:resendOtp` | Không bị ảnh hưởng — method riêng biệt |
| UserService.createUser (các nơi khác) | `user.service.ts` | Vẫn được gọi từ nơi khác ngoài registration |
| OTP expiry sau migration timestamptz | `otp.entity.ts` | OTP hết hạn bị reject đúng |

## Không được làm
- Không xóa `this.userService` khỏi constructor — có thể vẫn dùng ở các method khác
- Không thay đổi Cognito external behavior (createUserAndConfirm)
- Không modify `markOtpAsUsed()` private method nếu vẫn dùng ở nơi khác — inline logic vào transaction thay vì xóa method
- Không thay đổi response format của `verifyOtp` endpoint

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — 2 cases: compensating called on DB fail, not called on Cognito fail
- [ ] Non-Regression verify đủ
- [ ] E2E manual test: registration success path vẫn tạo user đúng
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
