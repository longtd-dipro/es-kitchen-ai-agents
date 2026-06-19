# [BE] [Supplier_Web] — Thêm PATCH /supplier/account/profile endpoint

## Backlog Info
- **Issue Type:** Task
- **Category:** Supplier_Web
- **Parent Issue:** Supplier My Page (プロフィール) — E04 Supplier Web
- **Version:** Phase 2
- **Milestone:** Released TBD
- **Estimate Hour:** 4h
- **Actual Hour:** 2h
- **Status:** Request Review

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — NestJS service + API endpoint |
| Repo | `es-kitchen-api` |
| Depends on | none (không cần Phase 1 — không có DB migration) |
| Song song với | none |
| Estimate | ~4h |

## Mục tiêu
Thêm method `updateProfile` vào `SupplierAuthService` và đăng ký PATCH handler trong `SupplierAccountController` để Supplier có thể cập nhật `supplierName` và `email` của mình qua endpoint `PATCH /supplier/account/profile`.

## Context (đọc trước khi code)
- SPEC.md: `es-kitchen-docs/docs/features/supplier-profile/SPEC.md`
- DESIGN.md: `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-api/DESIGN.md`
- File liên quan:
  - `es-kitchen-repository/es-kitchen-api/src/modules/supplier/http/controllers/supplier-account.controller.ts` — controller hiện có (GET me + POST change-password); thêm PATCH handler vào đây
  - `es-kitchen-repository/es-kitchen-api/src/modules/supplier/services/supplier-auth.service.ts` — service hiện có; thêm method `updateProfile`
  - `es-kitchen-repository/es-kitchen-api/src/modules/supplier/http/requests/supplier-change-password.request.ts` — xem pattern DTO với class-validator
  - `es-kitchen-repository/es-kitchen-api/src/modules/supplier/http/responses/supplier-me.response.ts` — xem pattern response DTO

## Yêu cầu implement

### 1. Tạo mới: `src/modules/supplier/http/requests/supplier-update-profile.request.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class SupplierUpdateProfileRequest {
  @ApiProperty({ example: '山田商店' })
  @IsNotEmpty()
  @MaxLength(255)
  supplierName: string;

  @ApiProperty({ example: 'supplier@example.com' })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(255)
  email: string;
}
```

### 2. Sửa: `src/modules/supplier/services/supplier-auth.service.ts`

Thêm method `updateProfile` vào class `SupplierAuthService`. Không sửa các method hiện có.

```typescript
async updateProfile(
  supplierId: string,
  dto: SupplierUpdateProfileRequest,
): Promise<{ success: boolean }> {
  const supplier = await this.supplierRepository.findOne({
    where: { id: supplierId, deletedAt: IsNull() },
  });

  if (!supplier) {
    throw new UnauthorizedException(
      this.i18n.t('supplier.auth.account_not_found', {
        lang: I18nContext.current()?.lang,
      }),
    );
  }

  try {
    await this.supplierRepository.update(
      { id: supplierId },
      { supplierName: dto.supplierName, email: dto.email },
    );
  } catch (error: unknown) {
    // PostgreSQL unique constraint violation error code 23505
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === '23505'
    ) {
      throw new ConflictException(
        this.i18n.t('supplier.auth.email_already_exists', {
          lang: I18nContext.current()?.lang,
        }),
      );
    }
    throw error;
  }

  return { success: true };
}
```

> Import thêm `ConflictException` từ `@nestjs/common` vào đầu file.

### 3. Sửa: `src/modules/supplier/http/controllers/supplier-account.controller.ts`

Thêm PATCH handler. Không sửa các handler hiện có (`getMe`, `changePassword`).

```typescript
// Thêm import ở đầu file:
import { Patch } from '@nestjs/common'; // thêm Patch vào destructure từ @nestjs/common
import { SupplierUpdateProfileRequest } from '../requests/supplier-update-profile.request';

// Thêm method vào class SupplierAccountController:
@Patch('profile')
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Update supplier profile (name and email)' })
async updateProfile(
  @GetSupplier('sub') supplierId: string,
  @Body() body: SupplierUpdateProfileRequest,
): Promise<{ success: boolean }> {
  return this.authService.updateProfile(supplierId, body);
}
```

> Controller đã có `@UseGuards(SupplierGuard)` và `@ApiBearerAuth()` ở class level — không cần thêm vào method.

### 4. Kiểm tra i18n key

Xác nhận key `supplier.auth.email_already_exists` đã tồn tại trong file i18n. Nếu chưa có, thêm vào file i18n tương ứng (thường là `src/i18n/ja/supplier.json` hoặc tương đương). Nếu không tìm thấy file i18n → dùng string trực tiếp thay cho i18n key và ghi chú TODO.

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/supplier/services/supplier-auth.service.spec.ts`

> Nếu file spec chưa tồn tại, tạo mới. Nếu đã có, thêm describe block mới cho `updateProfile` — không sửa test hiện có.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SupplierAuthService } from './supplier-auth.service';
import { Supplier } from '../entities/supplier.entity';

describe('SupplierAuthService.updateProfile', () => {
  let service: SupplierAuthService;
  let supplierRepository: jest.Mocked<Repository<Supplier>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupplierAuthService,
        {
          provide: getRepositoryToken(Supplier),
          useValue: createMock<Repository<Supplier>>(),
        },
        { provide: 'JwtService', useValue: createMock() },
        { provide: 'ConfigService', useValue: createMock() },
        { provide: I18nService, useValue: { t: jest.fn().mockReturnValue('error message') } },
        { provide: 'CognitoService', useValue: createMock() },
        { provide: 'MailService', useValue: createMock() },
        { provide: 'SupplierPasswordResetService', useValue: createMock() },
      ],
    }).compile();

    service = module.get<SupplierAuthService>(SupplierAuthService);
    supplierRepository = module.get(getRepositoryToken(Supplier));
  });

  it('should return { success: true } when update succeeds', async () => {
    // Arrange
    const mockSupplier = { id: '1', supplierName: '旧名前', email: 'old@example.com' } as Supplier;
    supplierRepository.findOne.mockResolvedValue(mockSupplier);
    supplierRepository.update.mockResolvedValue({ affected: 1, raw: [], generatedMaps: [] });

    // Act
    const result = await service.updateProfile('1', {
      supplierName: '新名前',
      email: 'new@example.com',
    });

    // Assert
    expect(result).toEqual({ success: true });
    expect(supplierRepository.update).toHaveBeenCalledWith(
      { id: '1' },
      { supplierName: '新名前', email: 'new@example.com' },
    );
  });

  it('should throw UnauthorizedException when supplier not found', async () => {
    // Arrange
    supplierRepository.findOne.mockResolvedValue(null);

    // Act & Assert
    await expect(
      service.updateProfile('999', { supplierName: 'name', email: 'test@test.com' }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ConflictException when email already exists (PostgreSQL 23505)', async () => {
    // Arrange
    const mockSupplier = { id: '1' } as Supplier;
    supplierRepository.findOne.mockResolvedValue(mockSupplier);
    const pgError = Object.assign(new Error('unique constraint'), { code: '23505' });
    supplierRepository.update.mockRejectedValue(pgError);

    // Act & Assert
    await expect(
      service.updateProfile('1', { supplierName: 'name', email: 'dup@test.com' }),
    ).rejects.toThrow(ConflictException);
  });

  it('should re-throw unknown errors', async () => {
    // Arrange
    const mockSupplier = { id: '1' } as Supplier;
    supplierRepository.findOne.mockResolvedValue(mockSupplier);
    const unknownError = new Error('DB connection failed');
    supplierRepository.update.mockRejectedValue(unknownError);

    // Act & Assert
    await expect(
      service.updateProfile('1', { supplierName: 'name', email: 'test@test.com' }),
    ).rejects.toThrow('DB connection failed');
  });
});
```

### Test file: `src/modules/supplier/http/controllers/supplier-account.controller.spec.ts`

> Nếu chưa có, tạo mới.

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { SupplierAccountController } from './supplier-account.controller';
import { SupplierAuthService } from '../../services/supplier-auth.service';

describe('SupplierAccountController.updateProfile', () => {
  let controller: SupplierAccountController;
  let authService: jest.Mocked<SupplierAuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupplierAccountController],
      providers: [
        { provide: SupplierAuthService, useValue: createMock<SupplierAuthService>() },
      ],
    }).compile();

    controller = module.get<SupplierAccountController>(SupplierAccountController);
    authService = module.get(SupplierAuthService);
  });

  it('should call authService.updateProfile and return result', async () => {
    // Arrange
    authService.updateProfile.mockResolvedValue({ success: true });

    // Act
    const result = await controller.updateProfile('1', {
      supplierName: '新名前',
      email: 'new@example.com',
    });

    // Assert
    expect(result).toEqual({ success: true });
    expect(authService.updateProfile).toHaveBeenCalledWith('1', {
      supplierName: '新名前',
      email: 'new@example.com',
    });
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `supplier-auth.service.ts` (method `updateProfile`) | ≥ 80% |
| `supplier-account.controller.ts` (handler `updateProfile`) | ≥ 70% |

**Verify:** `npm run test -- supplier-auth.service.spec` và `npm run test -- supplier-account.controller.spec`

## API Definition

> Điền sau khi implement xong. FE sẽ copy bảng này vào task-3-1 trước khi bắt đầu code.

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/supplier/account/me` | — | `{ id, supplierCode, supplierName, email, status, lastLoginAt, createdAt }` |
| PATCH | `/supplier/account/profile` | `{ supplierName: string, email: string }` | `{ success: true }` |

**Base URL:** `VITE_API_BASE_URL` (env var — không hard-code)
**Auth:** Bearer JWT — `SupplierGuard` (class-level trên controller)

**Error codes:**
| Code | Trường hợp |
|---|---|
| 400 | `supplierName` rỗng hoặc `email` sai định dạng (class-validator) |
| 401 | Token không hợp lệ hoặc supplier không tìm thấy |
| 409 | Email đã được sử dụng bởi supplier khác (unique constraint `idx_suppliers_email_active`) |

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login — `buildMeResponse` trong login response | `supplier-auth.service.ts` | Chạy `POST /supplier/auth/login` với credential hợp lệ → verify response vẫn trả về `supplier` object đầy đủ |
| Change Password | `supplier-account.controller.ts` | Gọi `POST /supplier/account/change-password` → verify vẫn trả về `{ message }` |
| `GET /supplier/account/me` | `supplier-account.controller.ts` | Gọi với token hợp lệ → verify response shape không thay đổi |
| Unique email index `idx_suppliers_email_active` | `supplier.entity.ts` | Test PATCH với email của chính supplier đó → phải thành công (không vi phạm unique) |

## Không được làm
- Không sửa method `login`, `buildMeResponse`, `changePassword`, `getSupplierForResponse` trong `supplier-auth.service.ts`
- Không thay đổi signature của `GET /supplier/account/me` — FE đang dùng
- Không thêm DB migration — schema đã đủ
- Không thêm Redis cache — DESIGN xác nhận không cần
- Không refactor code lân cận dù thấy cần cải thiện

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target
- [ ] Non-Regression verify đủ
- [ ] **API Definition điền đủ** — FE có thể bắt đầu task-3-1
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
