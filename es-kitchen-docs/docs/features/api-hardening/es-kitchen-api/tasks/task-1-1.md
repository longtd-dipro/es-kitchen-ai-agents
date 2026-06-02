# [BE] [Admin_Web] — CORS Whitelist từ env var

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** API Hardening Initiative
- **Version:** Phase 2
- **Milestone:** Released hotfix-202606
- **Estimate Hour:** 2h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

> **Note cho PM:** Task này là internal tech-debt cross-cutting (S1 — Security). Category tạm gán `Admin_Web` vì ảnh hưởng trực tiếp đến CORS các FE clients. Xem xét tạo Category `Infrastructure` nếu Backlog hỗ trợ.

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 1 — Security Hotfix |
| Repo | `es-kitchen-api` |
| Depends on | none |
| Song song với | task-1-2, task-1-3, task-1-4 |
| Estimate | ~2h |

## Mục tiêu
Thay thế `origin: true` (chấp nhận mọi origin) bằng whitelist đọc từ env var `ALLOWED_ORIGINS`. Production bắt buộc có biến này, không thì throw error khi bootstrap.

## Context (đọc trước khi code)
- DESIGN.md: `es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/DESIGN.md` (Section 4.1)
- File liên quan:
  - `src/main.ts:19-22` — CORS config hiện tại (`origin: true`), xem cấu trúc bootstrap function
  - `src/app.module.ts` — xem cách dùng `ConfigService` trong project

> **BLOCKER:** Cần DevOps cấu hình `ALLOWED_ORIGINS` env var cho DEV/STG/PROD trước khi deploy. Không deploy lên STG khi biến này chưa có.

## Yêu cầu implement

### Sửa: `src/main.ts`

Thay thế block `app.enableCors(...)` hiện tại (line 19-23):

```typescript
// TRƯỚC (line 19-23):
// app.enableCors({
//   origin: true,
//   credentials: true,
//   exposedHeaders: ['Content-Disposition'],
// });

// SAU — đặt trước app.enableCors(), sau NestFactory.create():
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean) ?? [];

if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production');
}

app.enableCors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (curl, mobile native, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
});
```

**Lưu ý:**
- Không hardcode domain nào trong source code
- `allowedOrigins` có thể empty ở DEV/STG → không throw, CORS chỉ block origin không nằm trong list
- `filter(Boolean)` để loại bỏ string rỗng do trailing comma trong env var

**Env var format:**
```
# DEV
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3002,http://localhost:3003

# STG
ALLOWED_ORIGINS=https://stg-admin.eskitchen.jp,https://stg-company.eskitchen.jp,https://stg-supplier.eskitchen.jp

# PROD
ALLOWED_ORIGINS=https://admin.eskitchen.jp,https://company.eskitchen.jp,https://supplier.eskitchen.jp
```

## Unit Tests (BẮT BUỘC)

> `main.ts` là bootstrap function, không test trực tiếp bằng Jest unit test. Tuy nhiên logic parse `ALLOWED_ORIGINS` phải được extract và test riêng.

### Tạo helper function (nếu muốn test): `src/commons/helpers/cors.helper.ts`

```typescript
export function parseAllowedOrigins(envValue: string | undefined): string[] {
  return (envValue ?? '').split(',').map(o => o.trim()).filter(Boolean);
}

export function buildCorsOriginHandler(allowedOrigins: string[]) {
  return (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  };
}
```

### Test file: `src/commons/helpers/cors.helper.spec.ts`

```typescript
import { parseAllowedOrigins, buildCorsOriginHandler } from './cors.helper';

describe('parseAllowedOrigins', () => {
  it('should return empty array when env var is undefined', () => {
    expect(parseAllowedOrigins(undefined)).toEqual([]);
  });

  it('should parse comma-separated origins correctly', () => {
    const result = parseAllowedOrigins('http://localhost:3001, http://localhost:3002');
    expect(result).toEqual(['http://localhost:3001', 'http://localhost:3002']);
  });

  it('should filter out empty strings from trailing commas', () => {
    const result = parseAllowedOrigins('http://localhost:3001,');
    expect(result).toEqual(['http://localhost:3001']);
  });
});

describe('buildCorsOriginHandler', () => {
  const handler = buildCorsOriginHandler(['https://admin.eskitchen.jp']);

  it('should allow request with no origin (server-to-server, mobile)', (done) => {
    handler(undefined, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it('should allow whitelisted origin', (done) => {
    handler('https://admin.eskitchen.jp', (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it('should reject unknown origin', (done) => {
    handler('https://evil.com', (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err!.message).toContain('https://evil.com');
      done();
    });
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `cors.helper.ts` | ≥ 80% |

**Verify:** `npm run test -- cors.helper`

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Admin Web login (E03) | `src/modules/admin/http/controllers/auth.controller.ts` | `curl -H "Origin: http://localhost:3001" -I POST /admin/auth/login` → không bị CORS reject |
| Company Web login (E02) | `src/modules/admin-company/http/controllers/auth.controller.ts` | Same — test từ localhost:3002 |
| Mobile app (không có origin header) | `src/modules/user/http/controllers/auth.controller.ts` | Request không có Origin header phải được allow |
| Server-to-server webhook | `src/commons/utiliz/elepay/` | Elepay webhook callback không có Origin → phải pass |

## Không được làm
- Không hardcode bất kỳ domain nào trong `main.ts`
- Không thay đổi `ValidationPipe`, `ClassSerializerInterceptor`, `AllExceptionsFilter` cùng trong task này
- Không sửa `app.module.ts` — đó là task-1-2

## Definition of Done
- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target
- [ ] Non-Regression verify đủ
- [ ] DevOps đã confirm `ALLOWED_ORIGINS` được cấu hình trên DEV
- [ ] Test manual từ browser: origin hợp lệ pass, origin lạ trả về CORS error
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
