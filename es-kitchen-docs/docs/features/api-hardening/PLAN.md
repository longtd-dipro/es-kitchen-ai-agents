# PLAN: API Hardening — es-kitchen-api

**Ngày tạo:** 2026-06-02
**Tác giả:** PM Agent
**Status:** Draft — chờ PM confirm deadline với gate calendar

---

## Summary

| Item | Giá trị |
|---|---|
| Tổng tasks | 14 tasks |
| Repo | `es-kitchen-repository/es-kitchen-api` (single-repo internal) |
| Estimate | ~52h (~7 man-day, ~1.5 sprint 2 tuần) |
| Allocation | 1 Senior BE (100%) |
| FE / Mobile | Không có — tech-debt internal, không đụng web/mobile repo |
| Status | Draft |

---

## Phase-Gate Alignment

| Phase PLAN | Issues covered | Gate target | Deadline |
|---|---|---|---|
| Phase 1 — Security Hotfix | S1, S2, S3, S4 (4 Critical) | G3 (W20) | TBD |
| Phase 2 — Data Integrity + Testing | D1, D2, P1, T1 (6 tasks) | G3 (W20) | TBD |
| Phase 3 — Performance + Code Quality | P2, P3, Q1, Q2 (4 tasks) | G4 (W24) | TBD |

> Deadline cu the cua tung phase: TBD — PM can confirm voi gate calendar (G3 = W20, G4 = W24 theo SPEC).
> Phase 1 la Critical priority nhung van deploy theo release schedule chuan (STG → soak → PROD), khong hotfix urgent.

---

## Timeline

```
                        1 Senior BE — sequential execution

Phase 1 - Security Hotfix (4 tasks)
task-1-1  [CORS Whitelist         ] ████
task-1-2  [ThrottlerModule        ]     ████
task-1-3  [orderBy Whitelist      ]         ████
task-1-4  [Payment Log Redaction  ]             ████
                                                    |
Phase 2 - Data Integrity + Testing (6 tasks)        |
task-2-1  [Migration timestamptz  ]                 ████
task-2-2  [verifyOtp transaction  ]                     ████
task-2-3  [Notification batch     ]                         ████
task-2-4  [Unit test OrderService ]                             ████
task-2-5  [Unit test CartService  ]                                 ████
task-2-6  [Unit test RegistrationS]                                     ████
                                                                             |
Phase 3 - Performance + Code Quality (4 tasks)                               |
task-3-1  [Dashboard TABLESAMPLE  ]                                          ████
task-3-2  [Redis Cache Layer      ]                                              ████
task-3-3  [MenuService Decoupling ]                                                  ████
task-3-4  [@Global() Cleanup      ]                                                      ████

Legend: ████ = sprint work unit (estimate TBD per task)
Tong estimate: ~52h / 7 man-day / ~1.5 sprint 2 tuan
```

> Khong co FE lane / Mobile lane — api-hardening la single-repo BE initiative.
> Phase 3 lam sau khi Phase 2 hoan thanh de dam bao T1 test coverage la safety net cho Q1 refactor.

---

## Contract Lock

**N/A — single-repo internal.**

api-hardening khong thay doi public API contract (method, path, request/response schema). Cac repo FE va Mobile khong can update. Khong co WebSocket events moi, khong co push notification payload moi.

---

## Dependencies & External Blockers

Co 4 external blockers phai resolve truoc khi implement cac task lien quan:

| # | Blocker | Task bi anh huong | Nguoi xu ly | Status |
|---|---|---|---|---|
| B1 | DevOps cau hinh `ALLOWED_ORIGINS` env var cho DEV/STG/PROD | task-1-1 (CORS) | DevOps | Pending |
| B2 | DBA + DevOps confirm maintenance window cho migration timestamptz PROD; backup DB truoc khi chay | task-2-1 (D1) | DBA + DevOps | Pending |
| B3 | DevOps cung cap `REDIS_HOST` / `REDIS_PORT` ElastiCache endpoint cho DEV/STG | task-3-2 (Redis P3) | DevOps | Pending |
| B4 | PM + Design confirm dashboard padding behavior khi catalog < 20 products (anh huong TABLESAMPLE edge case) | task-3-1 (P2) | PM + Design | Pending |

> Cac blocker phai duoc resolve truoc khi bat dau task tuong ung. PM can track va push resolution som de khong delay phase.

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Migration timestamptz (D1) gay data corruption neu TZ data lech — dac biet `payment.paid_at`, `otp.expires_at` | Medium | High | Backup DB truoc migration; test migration tren DB dump STG truoc khi chay PROD; migration co `down()` de rollback |
| Redis ElastiCache moi — cold cache impact perf ban dau sau deploy | Medium | Low | TTL ngan lam safety net; cache miss fallback ve DB; monitor cache hit rate sau deploy |
| verifyOtp compensating action (D2) — neu ca Cognito delete lan DB rollback deu fail → orphan Cognito account | Low | Medium | Log day du (Cognito user ID + timestamp + error reason); DevOps chuan bi manual cleanup runbook + alert |
| Throttle rate (S2) qua chat → legitimate user bi block khi share IP (NAT gateway, van phong) | Medium | Low | Khoi diem 10 req/phut per IP; whitelist IP CI runner; dieu chinh limit sau khi quan sat traffic thuc te STG |
| MenuService decoupling (Q1) gay regression an tren menu + cart + favorite flow | Low | High | Bat buoc co integration test cover menu+cart+favorite truoc khi merge task-3-3 |

---

## Assignees

| Role | Nguoi | Pham vi |
|---|---|---|
| Senior BE (implementer) | TBD | Toan bo 14 tasks, tuan tu theo phase |
| Tech Lead (reviewer) | TBD | Code review tat ca PR truoc khi merge |
| Security Lead | TBD | Sign-off S1–S4 truoc G3 |
| DevOps | TBD | Resolve B1, B2, B3; deploy STG; monitor sau deploy |
| DBA | TBD | Review va confirm migration plan D1 truoc khi chay STG/PROD |

---

## QA Strategy

- **Dev tu test**: Unit test do dev viet (task-2-4 / 2-5 / 2-6) — khong dung manual TC, khong co QC agent rieng
- **qa-agent verify per task**: Sau khi moi task done, qa-agent verify AC theo task file
- **Khong co manual regression**: api-hardening khong thay doi UX, khong can manual regression full
- **Integration test (bat buoc cho Q1)**: task-3-3 (MenuService decoupling) phai co integration test cover truoc khi merge

---

## Tieu chi Done (Definition of Done)

- [ ] Unit test chay pass tren CI pipeline (khong flaky)
- [ ] Code review duoc Tech Lead approve
- [ ] qa-agent verify AC per task — sign-off
- [ ] Deploy STG pass (khong co regression tren cac tinh nang hien co)
- [ ] Security Lead sign-off S1–S4 truoc G3
- [ ] Non-regression verify: cac tinh nang hien co (checkout, cart, menu, dashboard, notification) van hoat dong dung sau tung phase merge
- [ ] Migration D1 da duoc test tren STG truoc khi submit len PROD

---

## Task Index

### Phase 1 — Security Hotfix (4 tasks, target G3)

| Task | Mu ta | Issue | Estimate |
|---|---|---|---|
| task-1-1 | CORS whitelist — `ALLOWED_ORIGINS` env var | S1 Critical | TBD |
| task-1-2 | ThrottlerModule — global guard + auth override | S2 Critical | TBD |
| task-1-3 | orderBy whitelist `sales-analytics.service.ts` | S3 Critical | TBD |
| task-1-4 | Payment log redaction `elepay.service.ts` | S4 Critical | TBD |

### Phase 2 — Data Integrity + Testing (6 tasks, target G3)

| Task | Mo ta | Issue | Estimate |
|---|---|---|---|
| task-2-1 | Migration timestamptz — 6 entity files | D1 High | TBD |
| task-2-2 | verifyOtp transaction + compensating action | D2 High | TBD |
| task-2-3 | NotificationService batch cursor pagination | P1 High | TBD |
| task-2-4 | Unit test OrderService.checkout | T1 High | TBD |
| task-2-5 | Unit test CartService.addItem | T1 High | TBD |
| task-2-6 | Unit test RegistrationService.verifyOtp + D2 compensating | T1 High | TBD |

> Rang buoc: task-2-4 / 2-5 / 2-6 lam sau task-2-2 de co the verify compensating action trong test.

### Phase 3 — Performance + Code Quality (4 tasks, target G4)

| Task | Mo ta | Issue | Estimate |
|---|---|---|---|
| task-3-1 | Dashboard TABLESAMPLE thay ORDER BY RANDOM() | P2 Medium | TBD |
| task-3-2 | Redis cache layer — RedisCacheModule + MenuService | P3 Medium | TBD |
| task-3-3 | MenuService decoupling — tach CartService/FavoriteService | Q1 Medium | TBD |
| task-3-4 | AppModule @Global() cleanup | Q2 Low | TBD |

> Rang buoc: task-3-3 phai co integration test cover menu+cart+favorite truoc khi merge.
> Rang buoc: task-3-2 can B3 (ElastiCache endpoint) duoc resolve truoc khi bat dau.

---

## Deploy Strategy

- **Flow chuan:** STG → soak period → PROD (theo release train binh thuong)
- **Khong hotfix urgent**: Tat ca 3 phase ghep vao cung release cycle (Phase 2 cleanup theo SPEC), ke ca Phase 1 Critical
- **STG soak**: Dam bao Security Lead co du thoi gian review S1–S4 tren STG truoc G3
- **PROD deploy D1**: Chi deploy migration timestamptz sau khi DBA confirm + maintenance window duoc chap thuan

---

## Buoc tiep theo cho Dev

> Hay la Backend Developer, implement task:
> `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/api-hardening/es-kitchen-api/tasks/task-1-1.md`

Sau khi hoan thanh task-1-1, chuyen sang task-1-2 → task-1-3 → task-1-4 (Phase 1 hoan thanh) truoc khi bat dau Phase 2.

---

*PLAN nay se duoc cap nhat khi PM confirm deadline cu the cho G3/G4 va khi cac external blocker duoc resolve.*
