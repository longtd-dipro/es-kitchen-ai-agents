# [BE] [Admin_Web] — Payment Log Redaction: xóa console.log trong ElepayService

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Released hotfix-202606
- **Estimate Hour:** 1h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Đây là PII/payment data leak risk (S4). Category tạm gán `Admin_Web`; thực tế ảnh hưởng tất cả flows có payment (E01 checkout).

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 1 — Security Hotfix |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-1-1, task-1-2, task-1-3 |
| Estimate | ~1h |

## Mục tiêu
Xóa 2 `console.log` trong `elepay.service.ts` có thể leak payment DTO ra logs production. Thay bằng NestJS `Logger` chỉ log charge ID (không log payload).

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.4)
- File liên quan:
  - `src/commons/utiliz/elepay/elepay.service.ts:69-70` — `console.log` trong `createCharge()`
  - `src/commons/utiliz/elepay/elepay.service.ts:248-259` — `console.log` block trong `createEasyQRCode()`
  - Xem toàn bộ file để confirm không còn `console.log` nào khác chứa payment data

## Yêu cầu implement

### Sửa: `src/commons/utiliz/elepay/elepay.service.ts`

**Bước 1:** Thêm Logger vào constructor class (nếu chưa có):
```typescript
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
// ... other imports

@Injectable()
export class ElepayService {
  private readonly logger = new Logger(ElepayService.name);
  // ... rest of class
```

**Bước 2:** Xóa `console.log` tại line 70 trong `createCharge()`:
```typescript
// TRƯỚC (line 69-70):
async createCharge(dto: CreateElepayChargeDto): Promise<ElepayChargeObject> {
  console.log('Creating Elepay charge with DTO:', dto); // Debug log to inspect the DTO contents

// SAU — xóa dòng console.log, giữ nguyên logic:
async createCharge(dto: CreateElepayChargeDto): Promise<ElepayChargeObject> {
  // (không có log ở đây — log charge ID SAU khi tạo thành công, xem bước 3)
```

**Bước 3:** Log charge ID sau khi `createCharge` thành công (thêm vào cuối method, sau `return this.request(...)`):
```typescript
// Trong createCharge(), SAU khi gọi request:
const result = await this.request<ElepayChargeObject>('POST', '/charges', { ...payload });
this.logger.log(`Charge created: ${result.id}`);
return result;
```

> Lưu ý: Hiện tại `createCharge` dùng `return this.request(...)` trực tiếp. Cần đổi thành `const result = await ...` để có thể log ID. Không log `dto`, không log `payload`.

**Bước 4:** Xóa `console.log` block tại line 249-259 trong `createEasyQRCode()`:
```typescript
// TRƯỚC (line 248-260):
async createEasyQRCode(dto: CreateElepayCodeDto): Promise<ElepayCodeObject> {
  console.log(
    `Creating Elepay EasyQR code with DTO: ${JSON.stringify({
      amount: dto.amount,
      // ... toàn bộ DTO fields
    })}`,
  ); // Debug log to inspect the DTO contents

  const response = await this.request<ElepayCodeObject>('POST', '/codes', { ... });
  return response;

// SAU — xóa console.log, thêm Logger sau khi tạo thành công:
async createEasyQRCode(dto: CreateElepayCodeDto): Promise<ElepayCodeObject> {
  const response = await this.request<ElepayCodeObject>('POST', '/codes', {
    amount: dto.amount,
    currency: dto.currency,
    orderNo: dto.orderNo,
    description: dto.description,
    frontUrl: dto.frontUrl,
    extra: dto.extra,
    metadata: dto.metadata,
  });
  this.logger.log(`EasyQR code created: ${response.codeId}`);
  return response;
```

**Bước 5:** Review toàn bộ `elepay.service.ts` để tìm thêm `console.log` khác (nếu có). Xóa tất cả `console.log` trong file này.

## Unit Tests (BẮT BUỘC)

### Test file: `src/commons/utiliz/elepay/elepay.service.spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { ElepayService } from './elepay.service';
import { ELEPAY_CONFIG } from './elepay.constants'; // adjust import path as needed

describe('ElepayService — log redaction', () => {
  let service: ElepayService;
  let consoleSpy: jest.SpyInstance;

  beforeEach(async () => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ElepayService,
        {
          provide: ELEPAY_CONFIG, // adjust token name
          useValue: {
            secretKey: 'test-secret',
            publicKey: 'test-public',
            webhookSecret: 'test-webhook',
            apiBase: 'https://api-sandbox.elepay.io',
            frontUrl: 'http://localhost',
          },
        },
      ],
    }).compile();

    service = module.get<ElepayService>(ElepayService);
    // Mock HTTP request to avoid real API calls
    jest.spyOn(service as any, 'request').mockResolvedValue({ id: 'ch_test_123', codeId: 'code_test_456' });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('createCharge should NOT call console.log with DTO payload', async () => {
    await service.createCharge({
      amount: 1000,
      currency: 'JPY',
      paymentMethod: 'alipay' as any,
      orderNo: 'TEST-001',
      resource: 'order',
    });
    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it('createEasyQRCode should NOT call console.log with DTO payload', async () => {
    await service.createEasyQRCode({
      amount: 500,
      currency: 'JPY',
      orderNo: 'TEST-002',
      description: 'test',
      frontUrl: 'http://localhost',
    } as any);
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
```

> Nếu `ELEPAY_CONFIG` injection token không đúng tên, xem `src/commons/utiliz/elepay/elepay.module.ts` để xác nhận token name thực tế.

**Coverage target:**
| File | Target |
|---|---|
| `elepay.service.ts` | ≥ 70% (test 2 critical methods) |

**Verify:** `npm run test -- elepay.service`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Checkout với elepay payment | `src/modules/user/services/order.service.ts` | Checkout → charge ID vẫn log ở Logger, không log payload |
| QR code payment | `elepay.service.ts:createEasyQRCode` | QR payment flow → codeId vẫn log ở Logger |
| Payment webhook | `src/commons/utiliz/elepay/elepay-webhook.service.ts` | Webhook vẫn xử lý đúng sau khi sửa service |

## Không được làm
- Không log `dto` hay bất kỳ payment payload nào — chỉ log ID sau khi tạo thành công
- Không thay đổi logic trong `createCharge()` hay `createEasyQRCode()` ngoài việc xóa console.log và thêm Logger
- Không sửa `elepay-webhook.service.ts` hay các service khác trong folder elepay

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — cả 2 test cases (no console.log called)
- [ ] Non-Regression verify đủ
- [ ] Grep toàn bộ `elepay.service.ts` cho `console.log` — kết quả phải là 0 matches
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
