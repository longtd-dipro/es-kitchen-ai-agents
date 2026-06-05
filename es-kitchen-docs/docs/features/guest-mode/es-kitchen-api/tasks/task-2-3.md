# [BE] Payment_App_Mobile — OrderService.validateCompanyCode() + Admin Company Basic Info (guestPaymentAllowed)

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 6h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 2 — NestJS Service + API Endpoint |
| Repo | `es-kitchen-api` |
| Depends on | task-1-1 |
| Song song với | task-2-1, task-2-2 |
| Estimate | ~6h |

## Mục tiêu

Hai thay đổi độc lập trong 1 task (scope nhỏ, cùng phục vụ guest payment flow):

1. Sửa `OrderService.validateCompanyCode()` để check `guestPaymentAllowed` khi user là guest (US-03)
2. Thêm field `guestPaymentAllowed` vào Admin Company Basic Info — `getBasicInfo()`, `updateBasicInfo()`, DTO request/response, `CompanyFieldDict`, và Company entity (US-06)

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-api/DESIGN.md` (section 3.2, 3.3, 4.2)
- File liên quan:
  - `es-kitchen-repository/es-kitchen-api/src/modules/user/services/order.service.ts` — xem `validateCompanyCode()` line 148-198, `select` hiện tại chỉ lấy `['id', 'companyCode', 'name', 'status']` — cần thêm `guestPaymentAllowed`
  - `es-kitchen-repository/es-kitchen-api/src/modules/admin/services/company.service.ts` — xem `getBasicInfo()` line 288-324 và `updateBasicInfo()` line 326-384
  - `es-kitchen-repository/es-kitchen-api/src/modules/admin/http/responses/company-detail.response.ts` — xem `CompanyBasicInfoItemResponse` line 27-64, cần thêm field
  - `es-kitchen-repository/es-kitchen-api/src/modules/admin/http/requests/update-company-basic-info.request.ts` — cần thêm `guestPaymentAllowed` optional field
  - `es-kitchen-repository/es-kitchen-api/src/commons/utiliz/history-logger/field-dictionaries.ts` — xem `CompanyFieldDict`, cần thêm key `guestPaymentAllowed`
  - `es-kitchen-repository/es-kitchen-api/src/entities/company.entity.ts` — sau task-1-1 đã có `guestPaymentAllowed: boolean`

## Yêu cầu implement

### Phần 1 — Sửa: `src/modules/user/services/order.service.ts`

**Sửa `validateCompanyCode()` method:**

Hiện tại `select` chỉ lấy `['id', 'companyCode', 'name', 'status']`. Cần thêm `guestPaymentAllowed` vào select và inject `UserService` (hoặc `userRepository`) để lấy `userType`.

**Approach (theo DESIGN OQ-5):** Inject `UserService` để tái dùng `findById()` — tránh inject thêm repository:

```typescript
// Trong constructor — thêm:
private readonly userService: UserService,
```

**Sửa `validateCompanyCode()`:**

```typescript
async validateCompanyCode(
  companyCode: string,
  userId: string,
): Promise<ValidateCompanyCodeResponse> {
  const company = await this.companyRepository.findOne({
    where: { companyCode },
    select: ['id', 'companyCode', 'name', 'status', 'guestPaymentAllowed'], // thêm field mới
  });

  if (
    !company ||
    company.status === CompanyStatus.SUSPENDED ||
    company.status === CompanyStatus.CANCELLED ||
    company.status === CompanyStatus.DELETED
  ) {
    return {
      valid: false,
      companyCode,
      companyName: null,
      companyId: null,
      reason: this.i18n.t('user.user.company_not_found_or_inactive', {
        lang: I18nContext.current()?.lang,
        args: { code: companyCode },
      }),
      guestPaymentAllowed: false,
    };
  }

  // Guest payment check (BR-04, BR-09)
  const user = await this.userService.findById(userId);
  if (user?.userType === UserType.GUEST && !company.guestPaymentAllowed) {
    return {
      valid: false,
      companyCode: company.companyCode,
      companyName: company.name,
      companyId: company.id,
      reason: this.i18n.t('user.order.guest_payment_not_allowed', {
        lang: I18nContext.current()?.lang,
      }),
      guestPaymentAllowed: false,
    };
  }

  const restriction = await this.restrictionRepo.findOne({
    where: { userId, companyId: company.id },
  });

  if (restriction?.isRestricted) {
    return {
      valid: false,
      companyCode,
      companyName: company.name,
      companyId: company.id,
      reason: this.i18n.t('user.order.purchase_restricted', {
        lang: I18nContext.current()?.lang,
      }),
      guestPaymentAllowed: company.guestPaymentAllowed,
    };
  }

  return {
    valid: true,
    companyCode: company.companyCode,
    companyName: company.name,
    companyId: company.id,
    reason: null,
    guestPaymentAllowed: company.guestPaymentAllowed, // field mới — luôn trả về
  };
}
```

**Thêm import:**
```typescript
import { UserType } from 'src/commons/enums/user.enum';
```

**Sửa `ValidateCompanyCodeResponse` type** (thêm field mới):
Tìm file response này trong `src/modules/user/http/responses/` và thêm `guestPaymentAllowed: boolean`.

### Phần 2 — Sửa Admin Company Basic Info

#### 2a. Sửa: `src/entities/company.entity.ts`

Đã được thêm trong task-1-1. Không cần sửa thêm.

#### 2b. Sửa: `src/commons/utiliz/history-logger/field-dictionaries.ts`

Thêm key vào `CompanyFieldDict`:
```typescript
export const CompanyFieldDict: Record<string, string> = {
  // ... existing keys ...
  guestPaymentAllowed: 'ゲスト支払い許可', // THÊM MỚI
};
```

Thêm vào `EntityDisplayMapper`:
```typescript
guestPaymentAllowed: (val) => (val ? '許可' : '不許可'),
```

#### 2c. Sửa: `src/modules/admin/http/requests/update-company-basic-info.request.ts`

Thêm field optional vào cuối class:
```typescript
@ApiPropertyOptional({ example: true, description: 'Allow guest payment for this company' })
@IsBoolean()
@IsOptional()
guestPaymentAllowed?: boolean;
```

#### 2d. Sửa: `src/modules/admin/http/responses/company-detail.response.ts`

Thêm field vào `CompanyBasicInfoItemResponse`:
```typescript
@ApiProperty({ example: true, description: 'Whether guest payment is allowed' })
guestPaymentAllowed: boolean;
```

#### 2e. Sửa: `src/modules/admin/services/company.service.ts`

**`getBasicInfo()` — thêm field vào return:**
```typescript
return {
  // ... existing fields ...
  isCashPaymentAllowed: company.isCashPaymentAllowed,
  guestPaymentAllowed: company.guestPaymentAllowed ?? true, // BR-05: default true
  // ...
};
```

**`updateBasicInfo()` — thêm field vào `Object.assign()`:**
```typescript
Object.assign(company, {
  // ... existing fields ...
  isCashPaymentAllowed: data.isCashPaymentAllowed,
  guestPaymentAllowed: data.guestPaymentAllowed, // undefined nếu không gửi → TypeORM bỏ qua
  // ...
});
```

## Unit Tests (BẮT BUỘC)

### Test file: `src/modules/user/services/order.service.spec.ts` (bổ sung section mới)

```typescript
describe('OrderService.validateCompanyCode() — Guest Mode', () => {
  let service: OrderService;
  let companyRepo: jest.Mocked<Repository<Company>>;
  let restrictionRepo: jest.Mocked<Repository<UserCompanyRestriction>>;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: UserService, useValue: createMock<UserService>() },
        { provide: getRepositoryToken(Company), useValue: createMock<Repository<Company>>() },
        { provide: getRepositoryToken(UserCompanyRestriction), useValue: createMock<Repository<UserCompanyRestriction>>() },
        // ... other deps
      ],
    }).compile();
    service = module.get(OrderService);
    companyRepo = module.get(getRepositoryToken(Company));
    restrictionRepo = module.get(getRepositoryToken(UserCompanyRestriction));
    userService = module.get(UserService);
  });

  it('should return valid=false with guest-specific reason when guestPaymentAllowed=false for guest user', async () => {
    companyRepo.findOne.mockResolvedValue({
      id: '1',
      companyCode: 'COMP001',
      name: 'Test Co',
      status: CompanyStatus.REGISTERED,
      guestPaymentAllowed: false,
    } as Company);
    userService.findById.mockResolvedValue({ userType: UserType.GUEST } as User);

    const result = await service.validateCompanyCode('COMP001', 'guest-user-id');

    expect(result.valid).toBe(false);
    expect(result.guestPaymentAllowed).toBe(false);
  });

  it('should return valid=true when guestPaymentAllowed=true for guest user', async () => {
    companyRepo.findOne.mockResolvedValue({
      id: '1',
      companyCode: 'COMP001',
      name: 'Test Co',
      status: CompanyStatus.REGISTERED,
      guestPaymentAllowed: true,
    } as Company);
    userService.findById.mockResolvedValue({ userType: UserType.GUEST } as User);
    restrictionRepo.findOne.mockResolvedValue(null);

    const result = await service.validateCompanyCode('COMP001', 'guest-user-id');

    expect(result.valid).toBe(true);
    expect(result.guestPaymentAllowed).toBe(true);
  });

  it('should NOT apply guestPaymentAllowed check for registered user (non-regression)', async () => {
    // BR quan trọng: registered user không bị check guestPaymentAllowed
    companyRepo.findOne.mockResolvedValue({
      id: '1',
      companyCode: 'COMP001',
      name: 'Test Co',
      status: CompanyStatus.REGISTERED,
      guestPaymentAllowed: false, // OFF — nhưng không ảnh hưởng registered user
    } as Company);
    userService.findById.mockResolvedValue({ userType: UserType.REGISTERED } as User);
    restrictionRepo.findOne.mockResolvedValue(null);

    const result = await service.validateCompanyCode('COMP001', 'reg-user-id');

    // Registered user vẫn valid ngay cả khi guestPaymentAllowed=false
    expect(result.valid).toBe(true);
  });

  it('should always include guestPaymentAllowed field in response regardless of user type', async () => {
    companyRepo.findOne.mockResolvedValue({
      id: '1',
      companyCode: 'COMP001',
      name: 'Test Co',
      status: CompanyStatus.REGISTERED,
      guestPaymentAllowed: true,
    } as Company);
    userService.findById.mockResolvedValue({ userType: UserType.REGISTERED } as User);
    restrictionRepo.findOne.mockResolvedValue(null);

    const result = await service.validateCompanyCode('COMP001', 'reg-user-id');

    expect(result).toHaveProperty('guestPaymentAllowed');
  });
});
```

### Test file: `src/modules/admin/services/company.service.spec.ts` (bổ sung)

```typescript
describe('CompanyService — guestPaymentAllowed', () => {
  it('should include guestPaymentAllowed in getBasicInfo response', async () => {
    // company.guestPaymentAllowed = true
    // expect result.guestPaymentAllowed === true
  });

  it('should default guestPaymentAllowed to true when field is null', async () => {
    // company.guestPaymentAllowed = null (old company record)
    // expect result.guestPaymentAllowed === true (BR-05)
  });

  it('should update guestPaymentAllowed when provided in updateBasicInfo', async () => {
    // data.guestPaymentAllowed = false
    // expect companyRepo.save called with guestPaymentAllowed = false
  });

  it('should NOT override guestPaymentAllowed when undefined in updateBasicInfo', async () => {
    // data.guestPaymentAllowed = undefined (field not sent)
    // expect company.guestPaymentAllowed unchanged
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `order.service.ts` (validateCompanyCode) | ≥ 80% |
| `company.service.ts` (getBasicInfo, updateBasicInfo) | ≥ 70% |

**Verify:** `npm run test -- order.service` và `npm run test -- company.service`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `validateCompanyCode` cho registered user | `order.service.ts` | Unit test "NOT apply guestPaymentAllowed check for registered user" — BẮT BUỘC pass |
| `getBasicInfo` Admin — các field khác | `company.service.ts` | Response vẫn có `isCashPaymentAllowed`, `orderLimit`, `address` — xem unit test |
| `updateBasicInfo` Admin — field không gửi | `update-company-basic-info.request.ts` | `guestPaymentAllowed?: boolean` optional → gọi API không gửi field này → DB không thay đổi |
| `CompanyFieldDict` — contract.service.ts | `field-dictionaries.ts` | `ContractFieldDict` và `CompanyFieldDict` là 2 object riêng → additive change không break |
| History log | `company.service.ts:updateBasicInfo()` | Sau khi thêm `guestPaymentAllowed` vào `CompanyFieldDict`, history log sẽ track đúng field này |

## Không được làm

- Không sửa checkout flow (`checkout()` method) — scope riêng
- Không thêm cache cho `guestPaymentAllowed` — DESIGN section 2.4 nói rõ không cache, query DB realtime
- Không sửa `CompanyFieldDict` và `ContractFieldDict` dùng lẫn nhau — 2 dict tách biệt
- Không thêm endpoint riêng cho toggle `guestPaymentAllowed` — submit cùng form (AC-06-5)

## Definition of Done

- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target
- [ ] Test case "registered user không bị chặn bởi guestPaymentAllowed=false" pass (non-regression quan trọng nhất)
- [ ] Swagger: `GET /user/orders/validate-company` response schema có `guestPaymentAllowed`
- [ ] Swagger: `PATCH /companies/:id/basic-info` request schema có `guestPaymentAllowed` (optional)
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
