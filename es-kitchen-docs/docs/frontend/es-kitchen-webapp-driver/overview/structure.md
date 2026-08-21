# es-kitchen-webapp-driver — Cấu trúc Source

> Repo: `es-kitchen-webapp-driver` · Epic: **E06 Driver Web App** (mobile-first web, không native)
> Vai trò: driver nhận đơn, quản lý delivery, báo cáo issue, xem notification — workflow linear, không dashboard phức tạp.

---

## Tech stack

| Layer | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Dev port | 3006 (host: true để test qua mobile) | |
| Language | TypeScript | 6.0.3 |
| UI base | **shadcn/ui** + @base-ui/react + radix-ui | 1.4.1 / 1.4.3 |
| Icons | lucide-react | 1.16.0 |
| CSS utility | TailwindCSS + `@tailwindcss/vite` | 4.3.0 |
| Client state | **zustand** | 5.0.13 |
| Server state | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Forms | react-hook-form + yup | 7.76.0 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Cookies | js-cookie | 3.0.7 |
| Toast | **sonner** (không react-toastify) | 2.0.7 |
| Date | date-fns + dayjs | 4.4.0 / 1.11.20 |
| Barcode | react-barcode-scanner | 4.0.1 |
| Class utility | class-variance-authority · clsx · tailwind-merge | 0.7.1 / 2.1.1 / 3.6.0 |
| Theme | next-themes | 0.4.6 |

> **Khác biệt lớn nhất với E02/E03/E04/E05:** **KHÔNG dùng Ant Design + KHÔNG dùng Redux**. Stack shadcn/ui + Base UI + Radix + zustand — cùng nhóm với E07 webapp-payment.

---

## Cấu trúc thư mục

```
es-kitchen-webapp-driver/
├── src/
│   ├── components/       ← shadcn UI + custom components
│   ├── constants/        ← route paths, enums, configs
│   ├── enums/
│   ├── hooks/            ← useAuth, useSessionExpired, useTableParams, …
│   ├── layouts/          ← AuthLayout · NonAuthLayout · AuthCenteredLayout · Header · BottomNavigation · Logo
│   ├── lib/              ← Utility libraries
│   ├── models/
│   ├── pages/            ← account, auth, delivery, home, issues, notifications, orders
│   ├── routes/           ← Router + guards (RequireAuth, PublicOnly)
│   ├── services/
│   │   ├── http/         ← axios + interceptors + session-expired
│   │   ├── query/        ← TanStack Query client (staleTime 5min, retry 1)
│   │   └── client/       ← 8+ domain services
│   ├── shared/
│   ├── statics/          ← images, fonts
│   ├── stores/           ← **zustand** stores (useAuthStore)
│   ├── styles/           ← global.css (Tailwind)
│   ├── types/
│   ├── utils/
│   ├── validation/
│   ├── App.tsx
│   └── main.tsx
│
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Routes (top-level)

### Public — `NonAuthLayout`

`/login` · `/forgot-password` · `/verify` · `/reset-password`

### Protected — `AuthLayout` (Header + BottomNavigation + Outlet)

`/home` (index) · `/delivery` · `/delivery/:id` · `/orders` · `/issues` · `/issues/:id` · `/account` · `/notifications` · `/notifications/:id`

### `AuthCenteredLayout`

`/reset-success`

---

## Pages (src/pages/)

`account/` (driver profile) · `auth/` (login, forgot, verify, reset) · `delivery/` (DeliveryPage, DeliveryDetailPage + `_components/`, `constants/`, `hooks/`) · `home/` (dashboard) · `issues/` (list + report detail) · `notifications/` (center + detail) · `orders/`

**Pattern per-page:** page phức tạp có sub-folder `_components/`, `constants/`, `hooks/` bên trong page folder (co-location).

---

## Layouts (mobile-optimized)

| File | Vai trò |
|---|---|
| `AuthLayout.tsx` | Header + Outlet + BottomNavigation — mobile tab bar |
| `NonAuthLayout.tsx` | Simple wrapper cho login/auth |
| `AuthCenteredLayout.tsx` | Centered layout cho reset success |
| `Header.tsx` | Top nav bar (logo + back + user) |
| `BottomNavigation.tsx` | Bottom tab (mimick mobile UX) |
| `Logo.tsx` | Logo component |

**Viewport constraints:** `max-w-3xl` (768px), `dvh` unit cho dynamic viewport height.

---

## Store — zustand (KHÔNG Redux)

`src/stores/useAuthStore.ts`:

- State: `accessToken`, `refreshToken`, `user`, `status` (`LOADING | UNAUTHENTICATED | AUTHENTICATED`)
- Actions: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `syncAuthStateFromCookies`

Không có store khác — server data đưa vào TanStack Query.

---

## API services — `src/services/`

**Client (8):**
`auth.service.ts` · `delivery.service.ts` · `home.service.ts` · `notification.service.ts` · `receipt.service.ts` · `error-report.service.ts` · `trouble-report.service.ts` · `file-upload.service.ts` · `api.ts` (Requester class wrapping axios)

**HTTP:**
`axios.instance.ts` · `authToken.ts` · `handleRequest.ts` · `handleResponse.ts` · `sessionExpired.ts` · `index.ts`

**Query:**
`queryClient.ts` — `staleTime: 5min`, `retry: 1` (khác E03: E03 dùng `staleTime: 0`)

---

## Custom hooks — `src/hooks/`

`useAuth`, `useCan`, `useDebouncedValue`, `useInView`, `useMutationCustom`, `useSessionExpired`, `useTableParams`, `router`

---

## Auth strategy

- **Cookie-based JWT** qua `js-cookie`
- Bearer token inject qua request interceptor
- `AuthBootstrap` component fetch current user on mount nếu có token
- 401/expired → `sessionExpired.ts` handle → `SessionExpiredModal` + silent logout
- Redirect với `?redirect=<encoded-path>` giữ đích sau login

---

## Path aliases

Từ `tsconfig.json` + `vite.config.ts`:

| Alias | Path |
|---|---|
| `@/*` | `src/*` |
| `@components` `@layouts` `@pages` `@routes` `@services` `@shared` `@hooks` `@utils` `@types` `@assets` | các folder tương ứng |

---

## Environment variables

| Var | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API server URL |
| `VITE_AUTH_URL` | Authentication service URL |

---

## Bootstrap — `src/main.tsx` + `App.tsx`

```
main.tsx:
  createRoot → StrictMode → QueryClientProvider → App

App.tsx:
  Fixed viewport container (max-w-3xl, mobile-optimized)
  ├── <AuthBootstrap /> — fetch current user
  ├── <RouterProvider router={router} />
  ├── <SessionExpiredModal />
  └── <Toaster /> — Sonner (top-center)
```

**Không Redux Provider · Không AntdProvider · Không ToastContainer (react-toastify).**

---

## Styling

- **TailwindCSS 4.3** — `@tailwindcss/vite` (JIT) + `@tailwindcss/postcss`
- **shadcn/ui + Radix + Base UI** primitives — không AntD
- `tailwind-merge` + `class-variance-authority` cho class merging
- `prettier-plugin-tailwindcss` để format
- `tw-animate-css` cho animation utility
- Global CSS: `src/styles/global.css`

**Theme màu (E06):** primary blue `#0969DA` = `colors.semantics.company.500` (**cùng token với E03**).

---

## Vite config

- Port 3006
- `host: true` — expose ra LAN để test qua mobile browser
- `@tailwindcss/vite` plugin (không dùng PostCSS chain)

---

## Không có

- ❌ Ant Design
- ❌ Redux Toolkit
- ❌ react-toastify (dùng Sonner)
- ❌ Socket.IO — notification qua polling TanStack Query
- ❌ PWA manifest — không phải standalone app
