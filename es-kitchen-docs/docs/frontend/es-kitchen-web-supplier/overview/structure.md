# es-kitchen-web-supplier — Cấu trúc Source

> Repo: `es-kitchen-web-supplier` · Epic: E04 Supplier · Phase 2 scaffold
> Stack: React 19.2 / Vite 7+ / RTK v2 / TanStack Query v5.10 / Ant Design v6.4 / TailwindCSS v4.3

---

## Trạng thái hiện tại

**Scaffold stage** — đang ở giai đoạn template ban đầu. Mới có:
- 5 auth pages (Login, ForgotPassword, Verify, ResetPassword, ResetSuccess)
- 1 Dashboard page placeholder

Toàn bộ feature nghiệp vụ (menu management, order receive, profile, sales analytics...) sẽ được implement dần qua BMAD pipeline — xem `features/supplier-authentication/` và `features/order-list/` cho các feature đã có DESIGN/tasks.

---

## Cấu trúc thư mục

```
es-kitchen-web-supplier/
└── src/
    ├── pages/
    │   ├── auth/                ← Login · ForgotPassword · Verify · ResetPassword · ResetSuccess
    │   └── dashboard/           ← DashboardPage (placeholder)
    │
    ├── components/
    │   ├── Auth/                ← Auth-specific UI
    │   └── Common/              ← 27 Base* components (BaseTable, BaseButton, BaseModal, ...)
    │
    ├── layouts/
    │   ├── AuthLayout.tsx        ← Sidebar + header (authenticated)
    │   ├── AuthCenteredLayout.tsx ← Centered (reset-success)
    │   └── NonAuthLayout.tsx     ← Login pages
    │
    ├── routes/
    │   ├── index.tsx            ← createBrowserRouter
    │   └── guards/
    │       ├── RequireAuth.tsx  ← Redirect login nếu chưa auth
    │       └── PublicOnly.tsx   ← Redirect dashboard nếu đã auth
    │
    ├── stores/
    │   └── reducers/
    │       └── auth.ts          ← Auth state (accessToken, refreshToken, user, status)
    │
    ├── services/
    │   ├── client/              ← Domain services
    │   │   ├── api.ts           ← Axios Requester singleton
    │   │   ├── auth.service.ts
    │   │   ├── user.service.ts
    │   │   ├── file-upload.service.ts
    │   │   └── error-report.service.ts
    │   ├── http/                ← Axios instance + interceptors + cookie token helpers
    │   └── query/               ← TanStack Query setup
    │
    ├── shared/
    │   ├── providers/           ← App-level providers (Theme, Query, Auth, ...)
    │   └── theme/               ← Ant Design theme config
    │
    ├── hooks/
    ├── models/                  ← TypeScript interfaces
    ├── constants/               ← ROUTE constants
    ├── enums/
    ├── types/
    ├── utils/
    │   └── client/
    ├── validation/              ← yup schemas
    ├── statics/
    │   ├── icons/
    │   │   └── nav-icons/
    │   └── images/
    └── styles/
```

---

## Routes hiện có

| Route path | Page | Layout | Guard |
|---|---|---|---|
| `/` | Redirect → `/login` | NonAuthLayout | PublicOnly |
| `/login` | `LoginPage` | NonAuthLayout | PublicOnly |
| `/forgot-password` | `ForgotPasswordPage` | NonAuthLayout | PublicOnly |
| `/verify` | `VerifyCodePage` | NonAuthLayout | PublicOnly |
| `/reset-password` | `ResetPasswordPage` | NonAuthLayout | PublicOnly |
| `/reset-success` | `ResetSuccessPage` | AuthCenteredLayout | RequireAuth |
| `/dashboard` | `DashboardPage` | AuthLayout | RequireAuth |
| `/*` | Redirect → `/login` | — | — |

Lazy loading via `withSuspense()` wrapper — bắt buộc.

---

## Redux Store

| Slice | File | State |
|---|---|---|
| `auth` | `stores/reducers/auth.ts` | `accessToken`, `refreshToken`, `user`, `status` |

Auth flow giống `es-kitchen-web-admin` — token lưu trong **cookie** (qua `js-cookie`).

---

## API Service Layer

```
services/client/api.ts        ← Axios Requester (singleton API)
services/client/*.service.ts  ← 5 domain services hiện có:
                                 auth, user, file-upload, error-report
```

Service gọi trực tiếp `API.get/post/put/patch/delete`. TanStack Query wrap trong pages/hooks.

---

## Feature scope (theo BMAD)

Đang có DESIGN/tasks trong `features/`:

- `features/supplier-authentication/` — Auth flow chi tiết
- `features/order-list/es-kitchen-web-supplier/` — Order list page (Phase 3 task-3-1, 3-2, 3-3)

Future scope (chưa có docs): Menu management · Profile · Sales · Notification.
