# DESIGN: AI Recommendation — es-kitchen-api

> **SPEC:** `es-kitchen-docs/docs/features/ai-recommendation/SPEC.md`
> **Reference:** `../overview.md` — kiến trúc 5 layer, Mode 2 chi tiết, Cold start, Retraining
> **Date:** 2026-06-02
> **Status:** Draft — phụ thuộc OQ-13 (API contract với Team AI service)

---

## 0. Tóm tắt vai trò es-kitchen-api

API là **orchestrator**, không chạy ML model. Team AI build service riêng (Python + LightGBM/OR-Tools). es-kitchen-api:

1. Lưu lịch sử (`ai_order_history`, `ai_menu_sync`, `ai_preferences`)
2. Cung cấp data cho Team AI qua **API ingest**
3. Gọi Team AI service để get recommendation, lưu kết quả vào `ai_recommendation_runs`
4. Trả kết quả về FE
5. Cronjob trigger monthly retrain

---

## 1. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Migration | `<ts>-create-ai-tables.ts` | NEW (5 bảng) |
| Entity | `ai-order-history.entity.ts` | NEW |
| Entity | `ai-menu-sync.entity.ts` | NEW |
| Entity | `ai-preference.entity.ts` | NEW (Mode 4 employee preference) |
| Entity | `ai-recommendation-run.entity.ts` | NEW (audit/cache results) |
| Entity | `ai-constraint-config.entity.ts` | NEW (Admin config category/price ratios) |
| Module | `src/modules/ai-recommendation/` | NEW |
| Service | `AIRecommendationOrchestrationService` | NEW |
| Service | `AIIngestService` | NEW (cron monthly) |
| Service | `AIServiceClient` (HTTP client to Team AI) | NEW |
| Service | `AIChatService` (Mode 6 — OpenAI ChatGPT) | NEW |
| Controller | `AIRecommendationController` (Company Admin) | NEW |
| Controller | `AIIngestController` (internal, dùng API key — Team AI gọi) | NEW |
| Controller | `AIPreferenceController` (Mobile E01 submit preference) | NEW |
| Cron | `AIRetrainingScheduler` | NEW |
| Cache | Redis `ai:recommend:<companyId>:<plan_month>` | NEW |

---

## 2. Database

### 2.1 `ai_order_history` — Bảng AI chuyên dụng (snapshot từ production tables)

```
PK: bigint id
Cols:
  company_id     bigint FK companies.id
  branch_id      bigint FK branches.id NULL
  plan_month     date                    -- ngày đầu tháng (vd 2026-06-01)
  product_id     bigint FK products.id
  category_id    bigint FK categories.id
  unit_price     numeric(10,2)
  ordered_qty    int
  waste_qty      int                     -- 廃棄数
  utilization    numeric(5,2)            -- (ordered - waste) / ordered * 100
  snapshot_at    timestamptz DEFAULT NOW()
Index:
  idx_ai_order_company_month (company_id, plan_month)
  idx_ai_order_product (product_id)
```

### 2.2 `ai_menu_sync` — Menu của tháng mới

```
PK: bigint id
Cols:
  plan_month     date
  product_id     bigint FK products.id
  category_id    bigint
  unit_price     numeric(10,2)
  is_new_item    boolean                 -- TRUE nếu chưa từng có trong history
  synced_at      timestamptz
Index:
  idx_ai_menu_month_product UNIQUE (plan_month, product_id)
```

### 2.3 `ai_preferences` — Khảo sát Mode 4

```
PK: bigint id
Cols:
  user_id        bigint FK users.id
  company_id     bigint FK companies.id
  plan_month     date
  product_id     bigint FK products.id
  preference_score int2          -- 1-5 hoặc theo OQ-12 BA chốt
  submitted_at   timestamptz
Index:
  UQ (user_id, plan_month, product_id)
  idx_ai_pref_company_month (company_id, plan_month)
```

### 2.4 `ai_recommendation_runs`

```
PK: uuid id
Cols:
  company_id     bigint
  plan_month     date
  mode           varchar(20)             -- mode_1/2/4/5/6
  status         varchar(20)             -- pending/running/success/failed
  input_payload  jsonb                   -- snapshot input gửi Team AI
  output_payload jsonb                   -- recommendation list
  error_message  text NULL
  custom_condition text NULL             -- Mode 6 user input
  triggered_by   bigint FK admins.id NULL
  started_at, finished_at timestamptz
```

### 2.5 `ai_constraint_configs` — Admin (E03) config ratios

```
PK: bigint id
Cols:
  config_key     varchar(100) UNIQUE     -- "category_ratio_default", "price_ratio_default"
  value          jsonb                   -- {"肉類": 0.4, "魚類": 0.35, "その他": 0.25}
  updated_by     bigint FK admins.id
  updated_at     timestamptz
```

### 2.6 Redis Cache

| Key | Value | TTL |
|---|---|---|
| `ai:recommend:<companyId>:<planMonth>:<mode>` | Output recommendation | 1 giờ |
| `ai:retrain:lock:<month>` | Lock cronjob | 2 giờ |

---

## 3. API Contract

### 3.1 Company Admin (E02) — Recommendation

Prefix `/company/ai-recommendation`, guard `CompanyAdminGuard`.

| Method | Path | Mô tả |
|---|---|---|
| POST | `/recommend` | Body `{ planMonth, mode, customCondition?, branchId? }` → trigger recommendation, return runId hoặc result trực tiếp nếu cache hit |
| GET | `/runs/:runId` | Poll status + result |
| GET | `/runs` | List history runs theo company |
| POST | `/runs/:runId/submit-order` | Confirm + chuyển recommendation → order thật |

### 3.2 Mobile (E01) — Mode 4 Preference

Prefix `/user/ai-preference`, guard `UserGuard`.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/menu/:planMonth` | Lấy menu để user vote |
| POST | `/submit` | Body `{ planMonth, preferences: [{productId, score}] }` |

### 3.3 Admin (E03) — Config

Prefix `/admin/ai-recommendation/config`, guard `AdminGuard + @RequirePermission('ai.config')`.

| Method | Path | Mô tả |
|---|---|---|
| GET | `/constraints` | Get config |
| PUT | `/constraints` | Update config |

### 3.4 Internal — Team AI ingest

Prefix `/internal/ai`, guard `ApiKeyGuard` (key từ Parameter Store).

| Method | Path | Mô tả |
|---|---|---|
| GET | `/order-history?company_id=...&from=...&to=...` | Team AI pull data training |
| GET | `/menu-sync?plan_month=...` | Team AI pull menu mới |
| POST | `/recommendation-result` | Team AI push kết quả về (async mode) |

---

## 4. Service Layer

### 4.1 `AIRecommendationOrchestrationService`

```typescript
async recommend(dto: RecommendDto, actorAdminId): Promise<RunIdOrResult> {
  // 1. Check cache hit → trả ngay
  // 2. Insert ai_recommendation_runs (status=pending)
  // 3. Theo mode:
  //    - MODE 1: tính equal split local, status=success ngay
  //    - MODE 2/3: gọi AIServiceClient.predict() → save output
  //    - MODE 4: aggregate ai_preferences → bridge vào pipeline Mode 2
  //    - MODE 5: trả empty template để FE Admin nhập tay
  //    - MODE 6: AIChatService.parseIntent() → inject constraint → re-run Mode 2
  // 4. Optimization step (MILP) — gọi Team AI service hay local?
  //    Phase 1: gọi Team AI (họ chạy OR-Tools Python)
  // 5. Save output, cache Redis
  // 6. Return result
}
```

### 4.2 `AIServiceClient`

```typescript
// HTTP client với retry, timeout (OQ-14 SLA)
constructor(@Inject('AI_SERVICE_BASE_URL') baseUrl, @Inject('AI_SERVICE_API_KEY') apiKey)

predict(input: AIPredictInput): Promise<AIPredictOutput>
  // POST {baseUrl}/predict
  // Header X-API-Key
  // Body: serialized snapshot company history + menu + constraints
  // Retry 2 lần, exponential backoff
  // Timeout 30s (OQ-14)
```

### 4.3 `AIIngestService`

```typescript
@Cron('0 0 1 * *')  // 0:00 ngày 1 mỗi tháng
async monthlyIngest() {
  // 1. Acquire Redis lock
  // 2. Snapshot orders tháng vừa qua → ai_order_history
  // 3. Snapshot menu mới → ai_menu_sync
  // 4. Gọi Team AI service POST /retrain (trigger)
  // 5. Release lock, log
}
```

### 4.4 `AIChatService` (Mode 6)

```typescript
constructor(@Inject('OPENAI_API_KEY') openaiKey)

async parseIntent(naturalText: string): Promise<ConstraintOverride> {
  // Gọi ChatGPT với system prompt mapping intent → constraint
  // Pre-defined intent dictionary (OQ-9 BA chốt)
  // Trả về { excludeCategories?, boostCategories?, priceTierShift? }
}
```

---

## 5. Interface với repo khác

| Repo | Cần gì |
|---|---|
| `es-kitchen-web-company` | Order create page mode selector, gọi `/company/ai-recommendation/recommend` + poll runId |
| `es-kitchen-payment-app` | Mode 4 survey screen, gọi `/user/ai-preference/*` |
| External Team AI service | HTTP REST API contract — OQ-13 phải chốt trước implement |

---

## 6. Luồng — Mode 2 end-to-end

```
1. Company Admin click "Recommend (Mode 2)" trên Order Create
2. FE → POST /company/ai-recommendation/recommend { planMonth, mode: 'mode_2' }
3. AIRecommendationOrchestrationService:
   a. Check Redis cache (hit → trả ngay)
   b. Insert ai_recommendation_runs (status=pending)
   c. Build AIPredictInput: query ai_order_history (12 tháng gần), ai_menu_sync (tháng mới), ai_constraint_configs
   d. AIServiceClient.predict(input)  ← gọi Team AI (sync)
   e. Receive output { items: [{product_id, quantity, ...}] }
   f. Save output → ai_recommendation_runs (status=success)
   g. Cache Redis
4. Return result hoặc runId (nếu async)
5. FE render bảng → Admin chỉnh → POST /runs/:runId/submit-order
6. Convert recommendation → orders thật qua OrderService existing
```

---

## 7. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| `OrderService.createOrder` | (existing) | Submit từ recommendation cần dùng đúng flow, không tạo bản record song song | Reuse existing `OrderService.createOrderBatch()` nếu có |
| Cronjob existing | (cần grep `@Cron`) | Conflict scheduler instance | Confirm cron chạy single instance qua flag/lock |
| FCM Firebase | `firebase.config.ts` | Survey Mode 4 cần push noti cho user → không break notification flow hiện tại | Dùng existing `FcmService` |
| External API credentials | Parameter Store | Hard-code key sẽ làm fail security audit | Tất cả keys qua `ConfigService` |

> **OQ-13 (API contract Team AI) phải confirm trước khi bắt đầu Phase 2 implementation.**
