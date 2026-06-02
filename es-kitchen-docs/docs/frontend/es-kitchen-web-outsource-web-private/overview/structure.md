# es-kitchen-web-outsource-web-private — Cấu trúc Source

> Repo: `es-kitchen-web-outsource-web-private` · Epic: E05 Outsource/Internal Private Admin · Phase 2 scaffold
> Stack: React 19.2 / Vite 8 / RTK v2 / TanStack Query v5.10 / Ant Design v6.4 / TailwindCSS v4.3

---

## Vai trò

Internal back-office web — dành cho team operation (outsource hoặc internal staff) để quản lý account & sales data cho company trong nền tảng ESKITCHEN. Theo `README.md`:

> Admin application for managing accounts, and sales data for company on the ES Kitchen platform.

Phân biệt với `es-kitchen-web-admin` (E03): web-admin = System Admin quản trị toàn hệ thống, còn repo này = operation tool nhỏ hơn cho team outsource/internal.

---

## Trạng thái hiện tại

**Scaffold stage** — đang ở giai đoạn template ban đầu:
- 5 auth pages (Login, ForgotPassword, Verify, ResetPassword, ResetSuccess)
- 1 Dashboard page placeholder
- Auth flow giống các repo Frontend khác

Toàn bộ feature nghiệp vụ (account management, sales data, dashboard analytics...) sẽ được implement qua BMAD pipeline.

---

## Cấu trúc thư mục

```
es-kitchen-web-outsource-web-private/
└── src/
    ├── pages/
    │   ├── auth/                ← Login · ForgotPassword · Verify · ResetPassword · ResetSuccess
    │   └── dashboard/           ← DashboardPage (placeholder)
    │
    ├── components/
    │   ├── Auth/                ← Auth-specific UI
    │   └── Common/              ← 27 Base* components (giống template các repo FE)
    │
    ├── layouts/
    │   ├── AuthLayout.tsx
    │   ├── AuthCenteredLayout.tsx
    │   └── NonAuthLayout.tsx
    │
    ├── routes/
    │   ├── index.tsx            ← createBrowserRouter
    │   └── guards/
    │       ├── RequireAuth.tsx
    │       └── PublicOnly.tsx
    │
    ├── stores/
    │   └── reducers/
    │       └── auth.ts          ← Auth state
    │
    ├── services/
    │   ├── client/
    │   │   ├── api.ts           ← Axios Requester singleton
    │   │   └── ...services*     ← Domain services (sẽ mở rộng)
    │   ├── http/                ← Axios instance + cookie token helpers
    │   └── query/               ← TanStack Query setup
    │
    ├── shared/
    │   ├── providers/
    │   └── theme/
    │
    ├── hooks/
    ├── models/
    ├── constants/
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

Lazy loading via `withSuspense()` wrapper.

---

## Redux Store

| Slice | File | State |
|---|---|---|
| `auth` | `stores/reducers/auth.ts` | `accessToken`, `refreshToken`, `user`, `status` |

---

## API Service Layer

```
services/client/api.ts        ← Axios Requester (singleton API)
services/client/*.service.ts  ← Domain services (sẽ mở rộng theo feature scope)
```

Service file naming và pattern giống `es-kitchen-web-admin` — xem patterns.md để biết chi tiết.

---

## Feature scope (planning)

Chưa có DESIGN/tasks. Future scope theo README:
- Account management (operation/internal staff accounts)
- Sales data analytics
- Company data oversight
- Reporting/export

Khi BA tạo SPEC cho feature đầu tiên: → folder `features/<feature>/es-kitchen-web-outsource-web-private/`.

---

## Khác biệt với web-admin

| Khía cạnh | web-admin (E03) | outsource-web-private (E05) |
|---|---|---|
| Stage | Đầy đủ 24 routes, 13 services | Scaffold — 6 routes |
| Domain | System Admin quản trị toàn hệ thống | Operation tool — quản lý account & sales data |
| Endpoint prefix | `/admin/*` | `/operation/*` (tentative — confirm với BE Tech Lead khi implement) |
| Permission model | Operation vs User accounts | (đang thiết kế) |
