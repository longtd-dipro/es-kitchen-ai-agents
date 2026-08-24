# es-kitchen-api — Patterns & Conventions

> Đọc file này trước khi viết code NestJS mới. Follow pattern đang có — không tự refactor.

---

## Module Pattern

```typescript
// Mỗi module import entity riêng qua TypeOrmModule.forFeature()
@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderDetail, Company]),
    JwtModule.registerAsync({ global: true, useClass: JwtAdminConfigService }),
    MailModule,
  ],
  controllers: [OrderController, CompanyController],
  providers: [OrderService, CompanyService, AdminStrategy],
})
export class AdminModule {}
```

**Quy tắc:**
- Mỗi module khai báo entity dùng trong module đó — không dùng chung repository giữa modules
- JwtModule.registerAsync với `global: true` — token valid trong toàn module
- MailModule import khi cần gửi email (AWS SES)

---

## Controller Pattern

```typescript
// RouterModule.register trong app.module.ts đặt prefix thực tế
// @Controller() chỉ đặt sub-path (không lặp lại prefix module)
@Controller('orders')
@UseGuards(AdminGuard)                      // Guard ở controller level
@ApiTags('Admin / Orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiUnifiedResponse(OrderResponse, true)  // true = paginated (xem pattern bên dưới)
  async getOrders(@Query() query: GetOrdersRequest) {
    return this.orderService.getOrders(query);
  }

  @Get(':id')
  @ApiUnifiedResponse(OrderResponse)
  async getOrderDetail(@Param('id') id: string) {
    return this.orderService.getOrderDetail(id);
  }

  @Post()
  @ApiUnifiedResponse(OrderResponse)
  async createOrder(@Body() body: CreateOrderRequest) {
    return this.orderService.createOrder(body);
  }
}
```

**URL prefix thực tế (xác nhận từ RouterModule.register trong app.module.ts):**

| Module | path trong RouterModule | Ví dụ URL thực tế |
|---|---|---|
| AdminModule | `'admin'` | `/admin/orders` |
| AdminCompanyModule | `'company-admin'` | `/company-admin/company-orders` |
| UserModule | `''` (rỗng) | `/auth/...`, `/products/...` (không có prefix) |
| SupplierModule | `'supplier'` | `/supplier/orders` |
| DriverModule | `'driver'` | `/driver/auth/login` |
| DelivererModule | `'deliverer'` | `/deliverer/auth/login` |
| AiProModule | `'ai-pro'` | `/ai-pro/dataset` |

> ⚠️ Company Admin prefix là `/company-admin/...` — không phải `/admin-company/...`.

---

## Service Pattern

```typescript
@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderDetail) private orderDetailRepository: Repository<OrderDetail>,
  ) {}

  async getOrders(query: GetOrdersRequest) {
    const qb = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.company', 'company')
      .where('order.deleted_at IS NULL');

    // orderBy whitelist — BẮT BUỘC để tránh TypeError
    const ORDER_BY_MAP: Record<string, string> = {
      createdAt: 'order.createdAt',
      companyCode: 'company.companyCode',
    };
    const orderByField = ORDER_BY_MAP[query.orderBy] ?? 'order.createdAt';
    qb.orderBy(orderByField, query.order ?? 'DESC');

    return qb.getManyAndCount();
  }
}
```

**Lưu ý quan trọng — Known Bug:**
```typescript
// ❌ KHÔNG làm — TypeORM orderBy với string từ query param
qb.orderBy(query.orderBy, 'DESC');
// → TypeError: Cannot read properties of undefined (reading 'databaseName')

// ✅ LUÔN dùng whitelist map
const ORDER_BY_MAP = { createdAt: 'order.createdAt', ... };
const field = ORDER_BY_MAP[query.orderBy] ?? 'order.createdAt';
qb.orderBy(field, 'DESC');
```

---

## Entity Pattern

```typescript
@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;                               // bigint → TypeScript string (TypeORM returns as string)

  @Column({ name: 'company_id', type: 'bigint' })
  companyId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ name: 'status', type: 'enum', enum: OrderStatus, enumName: 'order_status_enum' })
  status: OrderStatus;                      // enumName bắt buộc để tránh conflict TypeORM

  @ManyToOne(() => Company, { eager: false })  // eager: false — tránh N+1
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;                         // Soft delete — không DELETE cứng
}
```

**Conventions:**
- PK: `bigint` (TypeScript nhận về `string`) — `@PrimaryGeneratedColumn('increment', { type: 'bigint' })`
- Column name: phải explicit `{ name: 'snake_case' }` — TypeORM không tự convert
- Timestamps: `timestamptz` — không dùng `timestamp`
- Soft delete: `@DeleteDateColumn` với `deletedAt` — không DELETE cứng
- Enum: dùng TypeScript enum + `type: 'enum'` + `enumName` explicit để tránh conflict
- Relation: `eager: false` bắt buộc để tránh N+1 — join khi cần qua QueryBuilder

---

## DTO / Request Pattern

```typescript
// requests/get-orders.request.ts
import { IsOptional, IsString, IsEnum } from 'class-validator';

export class GetOrdersRequest {
  @IsOptional()
  @IsString()
  orderBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @IsString()
  companyCode?: string;
}
```

**Quy tắc:**
- Tất cả request DTO dùng `class-validator` decorators
- Đặt trong `http/requests/` — không đặt inline trong controller
- Response DTO đặt trong `http/responses/`

---

## Guard Pattern

Mỗi module có strategy riêng với tên unique để không conflict khi nhiều module cùng register Passport.

```typescript
// modules/admin/guards/admin.guard.ts
@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.ADMIN_JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    return payload;   // gắn vào request.user
  }
}
```

**Guard theo module:**

| Module | Guard class | Strategy name | Lấy token từ |
|---|---|---|---|
| AdminModule | `AdminGuard` | `'admin-jwt'` | Bearer header |
| AdminCompanyModule | `AdminCompanyGuard` | `'admin-company-jwt'` | Bearer header |
| UserModule | `JwtAuthGuard` | `'user-jwt'` | Bearer header |
| SupplierModule | `SupplierGuard` | `'supplier-jwt'` | Bearer header |
| DriverModule | `DriverGuard` | `'driver-jwt'` | Bearer header |
| DelivererModule | `DelivererGuard` | `'deliverer-jwt'` | Bearer header |
| AiProModule | `AiProApiKeyGuard` | — | `x-api-key` header (không phải JWT) |

---

## @ApiUnifiedResponse Pattern (Swagger)

Tất cả controller mới dùng decorator `@ApiUnifiedResponse` thay vì `@ApiResponse` thô để đồng bộ response envelope.

```typescript
// commons/framework/decorators/ApiUnifiedResponse.ts
export const ApiUnifiedResponse = (model?: Type, isPagination?: boolean) =>
  applyDecorators(
    ApiExtraModels(BaseApiResponse, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(BaseApiResponse) },
          {
            properties: {
              data: isPagination
                ? { type: 'object', properties: {
                    items: { type: 'array', items: { $ref: getSchemaPath(model) } },
                    total: { type: 'number' },
                  } }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
```

**Cách dùng trong controller:**

```typescript
// Single response (không phân trang)
@Get(':id')
@ApiUnifiedResponse(OrderResponse)
async getOrder() {}

// Paginated list
@Get()
@ApiUnifiedResponse(OrderResponse, true)
async getOrders() {}

// Không có data trả về (chỉ success envelope)
@Delete(':id')
@ApiUnifiedResponse()
async deleteOrder() {}
```

**Response envelope `BaseApiResponse`:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }         // single object hoặc { items: [...], total: N }
}
```

---

## Multi-module Auth Pattern

Supplier, Driver, và Deliverer đều implement auth flow giống hệt nhau. Mỗi module có controller và service độc lập, nhưng cấu trúc endpoint và logic flow là đồng nhất.

```
POST /<module>/auth/login              → cấp access_token + refresh_token
POST /<module>/auth/refresh            → refresh access_token (dùng refresh_token trong body)
POST /<module>/auth/logout             → invalidate refresh_token
POST /<module>/auth/forgot-password/request-otp   → gửi OTP qua email
POST /<module>/auth/forgot-password/verify-otp    → verify OTP, trả về reset_token
POST /<module>/auth/forgot-password/reset-password → đổi password bằng reset_token
```

Ví dụ cho SupplierModule (`/supplier/auth/...`), DriverModule (`/driver/auth/...`), DelivererModule (`/deliverer/auth/...`).

**Nguyên tắc:**
- `request-otp` và `verify-otp` và `reset-password` là public — không cần guard
- `logout` cần guard (phải login trước)
- `hashed_refresh_token` lưu bcrypt hash trong DB, `@Exclude()` khỏi response
- OTP lưu trong bảng `otps` dùng chung

---

## Migration Pattern

```typescript
// migrations/1234567890-add-payment-method.ts
export class AddPaymentMethod1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE payment_methods (
        id BIGSERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        deleted_at TIMESTAMPTZ
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE payment_methods`);
  }
}
```

**Quy tắc migration:**
- Mỗi schema change = 1 file migration riêng
- Phải có cả `up()` và `down()`
- Không sửa migration đã chạy trên STG/PROD
- Tên file: `<timestamp>-<description>.ts`

---

## Event / Listener Pattern

```typescript
// commons/events/order-created.event.ts
export class OrderCreatedEvent {
  constructor(public readonly orderId: string) {}
}

// modules/admin-company/listeners/admin-company.listener.ts
@Injectable()
export class AdminCompanyListener {
  @OnEvent('order.created')
  handleOrderCreated(event: OrderCreatedEvent) {
    // side effects: notification, email, etc.
  }
}
```

---

## Redis Cache Pattern

```typescript
@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private repo: Repository<Product>,
    private redis: RedisService,
  ) {}

  async getProduct(id: string) {
    const cacheKey = `eskitchen:product:${id}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const product = await this.repo.findOne({ where: { id } });
    await this.redis.set(cacheKey, JSON.stringify(product), 'EX', 300); // 5 min TTL
    return product;
  }
}
```

**Key naming:** `eskitchen:<domain>:<id>` hoặc `eskitchen:<domain>:list:<hash>`  
**TTL:** Bắt buộc — không set key không có expiry.

---

## Test Pattern

```typescript
// <service>.spec.ts — Jest + @nestjs/testing
describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: jest.Mocked<Repository<Order>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: getRepositoryToken(Order),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(OrderService);
    orderRepository = module.get(getRepositoryToken(Order));
  });

  it('should return order', async () => {
    orderRepository.findOne.mockResolvedValue({ id: '1' } as Order);
    const result = await service.getOrderDetail('1');
    expect(result.id).toBe('1');
  });
});
```

**Scope test bắt buộc:** `*.service.ts`, `*.guard.ts`, `*.interceptor.ts`  
**Bỏ qua:** DTO, Entity files.
