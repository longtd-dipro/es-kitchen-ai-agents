# [BE] [Admin_Web] — Unit Test: RegistrationService.verifyOtp() (bao gồm compensating action)

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Phase 2 Cleanup
- **Estimate Hour:** 5h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Task này phụ thuộc vào task-2-2 (transaction + compensating được implement trước). Không thể viết test đầy đủ nếu source chưa có transaction.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — Data Integrity + Testing |
| Repo | `es-kitchen-api` |
| Depends on | task-2-2 (verifyOtp phải có transaction + compensating trước) |
| Song song với | task-2-4, task-2-5 |
| Estimate | ~5h |

## Mục tiêu
Hoàn chỉnh unit test cho `RegistrationService.verifyOtp()` — cover tất cả branches bao gồm: OTP invalid/expired, Cognito fail, DB transaction fail + compensating action, compensating fail (CRITICAL log). Target coverage ≥ 80%.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.5, 6.1)
- File liên quan:
  - `src/modules/user/services/registration.service.ts` — đọc toàn bộ `verifyOtp()` SAU KHI task-2-2 đã implement (có transaction + compensating)
  - `src/commons/utiliz/aws/cognito.service.ts:288-312` — confirm signature của `deleteUser()`
  - Task `task-2-2.md` — xem flow logic chi tiết

> **Lưu ý:** Phải implement task-2-2 trước rồi mới viết spec này. Spec file mở đầu đã được tạo trong task-2-2 với 2 test cases cơ bản — task này bổ sung đầy đủ.

## Yêu cầu implement

### Hoàn chỉnh: `src/modules/user/services/registration.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getDataSourceToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
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
import { AwsCognitoUserPool } from '../../../commons/enums/aws.enum';
import { User } from '../../../entities/user.entity';

// ─── Shared test fixtures ──────────────────────────────────────────────────

const validRequest = {
  email: 'user@test.com',
  otp: '123456',
  password: 'Password@1234',
};

const mockPendingUser = {
  email: 'user@test.com',
  userName: 'Test User',
  gender: 'M',
  birthday: '1990-01-01',
  companyId: null,
  employeeId: null,
};

const mockOtp = {
  code: '123456',
  email: 'user@test.com',
  companyCode: 'GUEST',
  expiresAt: new Date(Date.now() + 300_000),  // 5 phút từ giờ
  isUsed: false,
};

const mockUser: Partial<User> = {
  id: 'user-123',
  email: 'user@test.com',
  companyId: null,
};

// ─── Test Suite ────────────────────────────────────────────────────────────

describe('RegistrationService.verifyOtp', () => {
  let service: RegistrationService;
  let mockCognito: jest.Mocked<CognitoService>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockDataSource: any;
  let mockPendingRepo: any;
  let mockOtpRepo: any;

  function buildManagerMock(savedUser = mockUser): Partial<EntityManager> {
    return {
      create: jest.fn().mockReturnValue(savedUser),
      save: jest.fn().mockResolvedValue(savedUser),
      insert: jest.fn().mockResolvedValue({}),
      remove: jest.fn().mockResolvedValue({}),
      update: jest.fn().mockResolvedValue({}),
    };
  }

  beforeEach(async () => {
    mockPendingRepo = { findOne: jest.fn().mockResolvedValue(mockPendingUser) };
    mockOtpRepo = { findOne: jest.fn().mockResolvedValue(mockOtp) };
    mockCognito = createMock<CognitoService>();
    mockCognito.createUserAndConfirm.mockResolvedValue(undefined);
    mockCognito.deleteUser.mockResolvedValue(undefined);
    mockAuthService = createMock<AuthService>();
    mockAuthService.getTokens.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    } as any);

    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (fn) => fn(buildManagerMock())),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationService,
        { provide: getRepositoryToken(PendingUser), useValue: mockPendingRepo },
        { provide: getRepositoryToken(Otp), useValue: mockOtpRepo },
        { provide: getRepositoryToken(Company), useValue: { findOne: jest.fn().mockResolvedValue(null) } },
        { provide: getRepositoryToken(UserCompanyHistory), useValue: createMock() },
        { provide: getDataSourceToken(), useValue: mockDataSource },
        { provide: CognitoService, useValue: mockCognito },
        { provide: UserService, useValue: createMock<UserService>() },
        { provide: AuthService, useValue: mockAuthService },
        { provide: MailService, useValue: createMock<MailService>() },
        {
          provide: I18nService,
          useValue: { t: jest.fn().mockImplementation((key: string) => key) },
        },
      ],
    }).compile();

    service = module.get<RegistrationService>(RegistrationService);
  });

  // ─── Input validation branches ───────────────────────────────────────────

  describe('input validation', () => {
    it('should throw BadRequestException when pending user not found', async () => {
      mockPendingRepo.findOne.mockResolvedValue(null);

      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when OTP is expired', async () => {
      // Mock validateOtp to return 'expired'
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('expired');

      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(BadRequestException);
      expect(mockCognito.createUserAndConfirm).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when OTP is invalid', async () => {
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('invalid');

      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(BadRequestException);
      expect(mockCognito.createUserAndConfirm).not.toHaveBeenCalled();
    });
  });

  // ─── Cognito failure ─────────────────────────────────────────────────────

  describe('Cognito failure', () => {
    it('should throw InternalServerErrorException when Cognito createUserAndConfirm fails', async () => {
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('valid');
      mockCognito.createUserAndConfirm.mockRejectedValue(new Error('Cognito error'));

      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(
        InternalServerErrorException,
      );
      // Cognito fail → deleteUser KHÔNG được gọi (user chưa tạo)
      expect(mockCognito.deleteUser).not.toHaveBeenCalled();
    });
  });

  // ─── DB transaction failure + compensating ───────────────────────────────

  describe('DB transaction failure', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('valid');
      mockCognito.createUserAndConfirm.mockResolvedValue(undefined);
    });

    it('should call Cognito deleteUser when DB transaction fails', async () => {
      mockDataSource.transaction.mockRejectedValue(new Error('DB connection timeout'));

      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(
        InternalServerErrorException,
      );

      expect(mockCognito.createUserAndConfirm).toHaveBeenCalledTimes(1);
      expect(mockCognito.deleteUser).toHaveBeenCalledWith(
        AwsCognitoUserPool.USER,
        validRequest.email,
      );
    });

    it('should still throw InternalServerErrorException even if compensating action succeeds', async () => {
      mockDataSource.transaction.mockRejectedValue(new Error('DB error'));
      mockCognito.deleteUser.mockResolvedValue(undefined);  // compensating succeeds

      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should log CRITICAL error when compensating action also fails (orphan account)', async () => {
      mockDataSource.transaction.mockRejectedValue(new Error('DB error'));
      mockCognito.deleteUser.mockRejectedValue(new Error('Cognito delete failed'));

      // Should NOT throw additional error from compensating fail — just log
      await expect(service.verifyOtp(validRequest as any)).rejects.toThrow(
        InternalServerErrorException,
      );

      // Verify deleteUser was attempted despite failure
      expect(mockCognito.deleteUser).toHaveBeenCalledWith(
        AwsCognitoUserPool.USER,
        validRequest.email,
      );
    });
  });

  // ─── Happy path ──────────────────────────────────────────────────────────

  describe('happy path', () => {
    beforeEach(() => {
      jest.spyOn(service as any, 'validateOtp').mockResolvedValue('valid');
    });

    it('should return user and tokens on success (guest user, no company)', async () => {
      const result = await service.verifyOtp(validRequest as any);

      expect(mockCognito.createUserAndConfirm).toHaveBeenCalledTimes(1);
      expect(mockDataSource.transaction).toHaveBeenCalledTimes(1);
      expect(mockAuthService.getTokens).toHaveBeenCalledWith(
        expect.objectContaining({ id: mockUser.id, email: mockUser.email }),
      );
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
    });

    it('should insert UserCompanyHistory when user has companyId', async () => {
      const pendingWithCompany = { ...mockPendingUser, companyId: 'company-001' };
      mockPendingRepo.findOne.mockResolvedValue(pendingWithCompany);

      const managerMock = buildManagerMock({ ...mockUser, companyId: 'company-001' } as User);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(managerMock));

      await service.verifyOtp(validRequest as any);

      expect(managerMock.insert).toHaveBeenCalledWith(
        UserCompanyHistory,
        expect.objectContaining({ companyId: 'company-001' }),
      );
    });

    it('should NOT insert UserCompanyHistory when user has no companyId', async () => {
      mockPendingRepo.findOne.mockResolvedValue({ ...mockPendingUser, companyId: null });
      const managerMock = buildManagerMock({ ...mockUser, companyId: null } as User);
      mockDataSource.transaction.mockImplementation(async (fn) => fn(managerMock));

      await service.verifyOtp(validRequest as any);

      expect(managerMock.insert).not.toHaveBeenCalled();
    });
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `registration.service.ts` | ≥ 80% |

**Verify:** `npm run test:cov -- registration.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| User registration happy path | `registration.service.ts:register` | `register()` method không bị ảnh hưởng — spec tập trung vào `verifyOtp()` |
| resendOtp | `registration.service.ts:resendOtp` | Method riêng — không bị ảnh hưởng |
| Auth login (khác với registration) | `auth.service.ts` | Service khác, không liên quan |

## Không được làm
- Không thay đổi bất kỳ dòng source code nào — chỉ viết test
- Không spy vào method đang test (`verifyOtp`) — chỉ spy vào private helpers như `validateOtp`
- Không skip "orphan account" test case — đây là critical business requirement

## Definition of Done
- [ ] task-2-2 đã được implement (transaction + compensating trong source)
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] `npm run test:cov -- registration.service` — coverage ≥ 80%
- [ ] Test cases: OTP expired, OTP invalid, Cognito fail, DB fail + compensating called, compensating fail graceful, happy path guest, happy path with company
- [ ] Tất cả test cases pass (không có `.skip`)
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
