# es-kitchen-webapp-driver — Cấu trúc Source

> Nguồn = es-kitchen-webapp-driver@62b870a ngày 2026-10-16 (HEAD; working tree có sửa `vite.config.ts` chưa commit — chỉ ghi nhận). Từ lần sync trước chỉ thay đổi nhỏ: nút マニュアル ở BottomNavigation (ESKITCHEN-1867) + CI self-hosted runner.
> Repo: `es-kitchen-webapp-driver` · Epic: **E06 Driver Web App** (web ưu tiên điện thoại, không phải app native).

**File này nói gì:** bản đồ repo E06 — app dành cho tài xế, dùng công nghệ gì, thư mục nào chứa gì, có những trang nào.
**Đọc khi:** mới vào repo, hoặc cần biết "file này nằm ở đâu".
**Đọc tiếp:** `patterns.md` (cách làm từng việc).

> **Khác lớn nhất so với E02/E03/E04/E05:** E06 **không dùng Ant Design, không dùng Redux**. Thay bằng **shadcn/ui + Base UI + Radix** (UI), **zustand** (state), **sonner** (toast). E07 `webapp-payment` cùng nhóm stack này.

---

## 1. App này làm gì

Tài xế dùng trên điện thoại để: nhận đơn, làm các bước giao hàng (kể cả chụp ảnh, quét mã vạch, ghi nhận thu tiền), báo sự cố (issue), xem thông báo. Luồng thẳng, từng bước; không có dashboard phức tạp.

---

## 2. Tech stack

| Lớp | Package | Version |
|---|---|---|
| Framework | React + React DOM | 19.2.6 |
| Build | Vite | 8.0.13 |
| Dev port | 3006 (`host: true` để test qua điện thoại) | |
| Ngôn ngữ | TypeScript | 6.0.3 |
| UI nền | **shadcn/ui** + @base-ui/react + radix-ui | 1.4.1 / 1.4.3 |
| Icon | lucide-react | 1.16.0 |
| CSS | TailwindCSS + `@tailwindcss/vite` | 4.3.0 |
| State client | **zustand** | 5.0.13 |
| State server (dữ liệu API) | @tanstack/react-query | 5.100.10 |
| Router | react-router-dom | 7.15.1 |
| Form | react-hook-form + yup | 7.76.0 / 1.7.1 |
| HTTP | axios | 1.16.1 |
| Cookie | js-cookie | 3.0.7 |
| Toast | **sonner** (không dùng react-toastify) | 2.0.7 |
| Ngày | date-fns + dayjs | 4.4.0 / 1.11.20 |
| Quét mã vạch | react-barcode-scanner | 4.0.1 |
| Gộp class | class-variance-authority · clsx · tailwind-merge | 0.7.1 / 2.1.1 / 3.6.0 |
| Theme | next-themes | 0.4.6 |
| Khác | react-day-picker ^10.0.1 · shadcn CLI 4.7.0 · @fontsource-variable/noto-sans-jp 5.2.10 · tw-animate-css 1.4.0 | — |

### E06 khác các web còn lại thế nào

| Việc | E02–E05 (web quản trị) | E06 (và E07) |
|---|---|---|
| Component UI | Ant Design | shadcn/ui + Base UI + Radix (`components/ui/`) + `components/Common/` |
| State client | Redux Toolkit | zustand (`stores/useAuthStore.ts`) |
| Toast | `message` của AntD / react-toastify | `sonner` |
| Icon | Phosphor (E05) | lucide-react (+ SVG import `?react`) |
| Màn hình | Desktop, có sidebar | Điện thoại, thanh tab dưới (bottom nav) |

---

## 3. Cây thư mục

```
es-kitchen-webapp-driver/
├── src/
│   ├── components/       ui/ (shadcn) · Common/ (wrapper dự án) · Auth/
│   ├── constants/        route, enum, config
│   ├── enums/
│   ├── hooks/            useAuth, useSessionExpired, useTableParams, ...
│   ├── layouts/          AuthLayout · NonAuthLayout · AuthCenteredLayout · Header · BottomNavigation · Logo
│   ├── lib/              utils (cn)
│   ├── models/
│   ├── pages/            account, auth, delivery, home, issues, notifications, orders
│   ├── routes/           Router + guards (RequireAuth, PublicOnly)
│   ├── services/
│   │   ├── http/         axios + interceptor + sessionExpired
│   │   ├── query/        TanStack Query client (staleTime 5 phút, retry 1)
│   │   └── client/       9 file (api.ts + 8 service)
│   ├── shared/
│   ├── statics/          images, fonts, icons
│   ├── stores/           zustand (useAuthStore)
│   ├── styles/           global.css (Tailwind)
│   ├── types/  utils/  validation/
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts · tsconfig.json · package.json
```

**Quy ước co-location:** trang phức tạp có thư mục con `_components/`, `constants/`, `hooks/` ngay trong thư mục trang đó. Ví dụ `pages/delivery/` có `hooks/useDeliveryDetail`. Hook dùng chung nhiều trang mới lên `src/hooks/`.

---

## 4. Dữ liệu đi từ API đến màn hình

```
Page (vd DeliveryPage)
   │
   ▼
hook trong pages/<x>/hooks (useDeliveryList)  ── TanStack Query: cache, loading, error
   │
   ▼
service (services/client/delivery.service.ts)
   │ API.get(...)  — Requester bọc axios
   ▼
interceptor: gắn Bearer token; 401 → báo phiên hết hạn / clearAuthState()
   ▼
Backend
```

- **zustand chỉ giữ phiên đăng nhập** (`useAuthStore`). Dữ liệu nghiệp vụ nằm trong cache TanStack Query.
- Không có Socket.IO: thông báo lấy bằng gọi lại (polling) qua TanStack Query.

---

## 5. Routes

> Đếm từ `src/routes/index.tsx`: **14 route** (4 public + `/reset-success` + 9 protected) — không đổi so với bản trước. `*` → `/login`.

| Nhóm | Layout | Route |
|---|---|---|
| Public (bọc `PublicOnly`) | `NonAuthLayout` | `/login` · `/forgot-password` · `/verify` · `/reset-password` |
| Protected (bọc `RequireAuth`) | `AuthCenteredLayout` | `/reset-success` |
| Protected | `AuthLayout` (Header + Outlet + BottomNavigation) | `/home` (index → redirect) · `/delivery` · `/delivery/:id` · `/orders` · `/issues` · `/issues/:id` · `/account` · `/notifications` · `/notifications/:id` |

Lưu ý:
- `/orders` là trang **placeholder** (`OrdersPage.tsx`, không có service riêng).
- Tab 「マニュアル」 ở BottomNavigation **không** trỏ `/orders`. Nó mở `MANUAL_URL` (PDF ES Station) ở tab mới (`BottomNavigation.tsx`).

---

## 6. Pages (`src/pages/`)

| Thư mục | Nội dung |
|---|---|
| `account/` | Hồ sơ tài xế |
| `auth/` | login, forgot, verify, reset, reset-success |
| `delivery/` | DeliveryPage, DeliveryDetailPage; `_components/`: DeliveryCoolDetailPage / DeliveryESDetailPage / DeliveryWarehouseDetailPage; `_es/` = luồng nhiều bước ES (Step1–5) + `useDeliveryESStep`; `constants/list.ts`; `hooks/`: useDeliveryDetail, useDeliveryList, useParkingReport, useWarehouseReceipt |
| `home/` | Trang chủ (thống kê + lịch giao) |
| `issues/` | IssuesPage, IssueReportPage; hook `useTroubleReport` |
| `notifications/` | Danh sách + chi tiết |
| `orders/` | Placeholder |

---

## 7. Layouts (tối ưu cho điện thoại)

| File | Vai trò |
|---|---|
| `AuthLayout.tsx` | Header + Outlet + BottomNavigation (thanh tab dưới) |
| `NonAuthLayout.tsx` | Khung đơn giản cho login/auth |
| `AuthCenteredLayout.tsx` | Khung giữa màn hình (reset thành công, không có thanh tab) |
| `Header.tsx` | Thanh trên (logo + nút back + user) |
| `BottomNavigation.tsx` | Thanh tab dưới giống app điện thoại |
| `Logo.tsx` | Logo |

Viewport: `max-w-3xl` (768px), đơn vị `dvh` (chiều cao khung nhìn động, tránh lỗi thanh địa chỉ trình duyệt điện thoại).

---

## 8. Store — zustand (không Redux)

`src/stores/useAuthStore.ts`:
- State: `accessToken`, `refreshToken`, `user`, `status` (`LOADING | UNAUTHENTICATED | AUTHENTICATED`).
- Actions: `setAuthTokens`, `setCurrentUser`, `clearAuthState`, `syncAuthStateFromCookies`.
- Không có store khác — dữ liệu server đưa vào TanStack Query.

---

## 9. API services (`src/services/`)

**Client (8 service + `api.ts`):** `auth` · `delivery` · `home` · `notification` · `receipt` · `error-report` · `trouble-report` · `file-upload` (đuôi `.service.ts`) · `api.ts` (class `Requester` bọc axios).

Endpoint (grep): `/auth/*`, `/account/me`, `/home`, `/schedules`, `/delivery-list`, `/notifications` (+`/unread-count`), `/trouble-reports` (+`/targets`), `/uploads/presigned-upload-url`, `/api/error/report`.

**HTTP:** `axios.instance.ts` · `authToken.ts` · `handleRequest.ts` · `handleResponse.ts` · `sessionExpired.ts` · `index.ts`.

**Query:** `queryClient.ts` — `staleTime: 5 phút`, `retry: 1`, `refetchOnWindowFocus: false`, mutation `retry: 0` (E03 dùng `staleTime: 0`, khác).

---

## 10. Custom hooks

`src/hooks/`: `useAuth`, `useCan`, `useDebouncedValue`, `useInView`, `useMutationCustom`, `useSessionExpired`, `useTableParams`, `router`.
Hook theo trang nằm trong `pages/<x>/hooks/` (delivery, home, issues, notifications). Util riêng: `utils/geolocation.ts`, `utils/photoDraft.ts`.

---

## 11. Phiên đăng nhập

- JWT lưu cookie qua `js-cookie`; request interceptor gắn Bearer token.
- `AuthBootstrap` lấy user hiện tại khi app mở, nếu có token.
- 401: nếu request đã mang header `Authorization` → `sessionExpired.ts` báo cho `SessionExpiredModal`; 401 khác → `clearAuthState()`.
- Redirect kèm `?redirect=<đường-dẫn-mã-hóa>` để quay lại đúng chỗ sau đăng nhập.

---

## 12. Path alias

| Alias | Trỏ tới |
|---|---|
| `@/*` | `src/*` |
| `@components` `@layouts` `@pages` `@routes` `@services` `@shared` `@hooks` `@utils` `@types` `@assets` | thư mục tương ứng |

---

## 13. Biến môi trường

| Biến | Dùng để |
|---|---|
| `VITE_API_BASE_URL` | URL API |
| `VITE_AUTH_URL` | URL dịch vụ xác thực |

---

## 14. Khởi động app

```
main.tsx:  createRoot → StrictMode → QueryClientProvider → App

App.tsx:   khung cố định (max-w-3xl, tối ưu điện thoại)
  ├── <AuthBootstrap />        lấy user hiện tại
  ├── <RouterProvider router={router} />
  ├── <SessionExpiredModal />
  └── <Toaster />              Sonner, position="top-center"
```

Không có Redux Provider, AntdProvider, ToastContainer (react-toastify).

---

## 15. Giao diện

- TailwindCSS 4.3 — `@tailwindcss/vite` (JIT) + `@tailwindcss/postcss`.
- shadcn/ui + Radix + Base UI — không có AntD.
- `tailwind-merge` + `class-variance-authority` để gộp class; `prettier-plugin-tailwindcss` để format; `tw-animate-css` cho animation.
- CSS toàn cục: `src/styles/global.css`.
- **Màu chủ đạo (E06):** xanh dương `#0969DA` = `colors.semantics.company.500` (cùng token với E03) — theo doc cũ + `design_rule.md`. `src/index.css` dùng biến CSS của shadcn (chưa đối chiếu hex trong lượt sync này).

**Vite:** port 3006; `host: true` mở ra mạng LAN để test bằng điện thoại; dùng plugin `@tailwindcss/vite` (không đi qua chuỗi PostCSS).

---

## 16. Không có

- Ant Design · Redux Toolkit · react-toastify (dùng Sonner).
- Socket.IO — thông báo qua polling TanStack Query.
- PWA manifest — không phải app độc lập.
