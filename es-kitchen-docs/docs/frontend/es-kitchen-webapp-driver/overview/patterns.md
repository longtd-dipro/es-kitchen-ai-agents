# es-kitchen-webapp-driver — Patterns & Conventions

> Đọc file này trước khi viết code cho E06. **Khác nhóm AntD/Redux (E02–E05)** — dùng shadcn + zustand.

---

## 1. UI stack — shadcn/ui + Base UI + Radix

- Components dựng bằng shadcn convention: source đặt tại `src/components/ui/` (button, input, dialog, …)
- Underlying primitive: `@base-ui/react` (từ Base UI team) + `radix-ui` cho các component chưa có Base UI
- **Không dùng AntD** trong repo này — nếu cần component mới, add shadcn thêm hoặc build từ Radix/Base UI

### Cách thêm shadcn component

```bash
pnpm dlx shadcn@latest add <component>
```

Nhưng phải check config `components.json` để đảm bảo path alias đúng.

---

## 2. State — zustand cho client, TanStack Query cho server

- **Zustand:** `src/stores/useAuthStore.ts` — hiện chỉ có auth. Nếu cần store thêm (theme, UI state), tạo `useXxxStore.ts` riêng, không gom một mega-store.
- **TanStack Query v5 object syntax bắt buộc** — giống các FE repo khác. Config mặc định `staleTime: 5min`, `retry: 1` (khác E03 dùng `staleTime: 0`).

```tsx
const { data } = useQuery({
  queryKey: ['deliveries', driverId],
  queryFn: () => deliveryService.list(driverId),
});
```

- **Không dùng Redux, không dùng Context API cho global state.**

---

## 3. Toast — Sonner, không react-toastify

```tsx
import { toast } from 'sonner';

toast.success('Delivery confirmed');
toast.error('Network error');
```

`<Toaster position="top-center">` mount trong `App.tsx`. Không import `react-toastify` — không có trong dependency.

---

## 4. Icons — lucide-react (không Phosphor/AntD icons)

```tsx
import { Package, MapPin, Check } from 'lucide-react';
```

Không mix `@phosphor-icons/react` — E06 stack không có.

---

## 5. Class merging — `cn()` utility

```tsx
import { cn } from '@/lib/utils';

<button className={cn('base-classes', condition && 'active-classes', className)} />
```

`cn` = `twMerge(clsx(...))` — resolve conflict TailwindCSS class. Không dùng `classnames` package.

---

## 6. Component variant — `class-variance-authority`

```tsx
const buttonVariants = cva('base', {
  variants: {
    variant: { default: '...', outline: '...' },
    size: { sm: '...', md: '...' },
  },
});
```

Chuẩn shadcn pattern — dùng cho component có nhiều biến thể (button, badge, alert).

---

## 7. Layout — mobile-first, BottomNavigation

- Viewport constrain `max-w-3xl` (768px) — không full width
- `dvh` unit thay `vh` (Safari mobile URL bar issue)
- `<BottomNavigation />` render trong `AuthLayout` — không tự tạo nav riêng cho page

---

## 8. Route guards

- `RequireAuth` — check auth store status, redirect kèm `?redirect=` khi cần
- `PublicOnly` — chặn logged-in user vào login
- **Không có permission guard** — driver không phân quyền chi tiết

---

## 9. Barcode scanner — react-barcode-scanner

Feature scan barcode dùng `react-barcode-scanner` (không phải `@zxing/browser` như E07). Nếu cần scan QR/barcode → import từ package này.

---

## 10. Forms — react-hook-form + Yup

Giống các FE repo khác — schema Yup trong `src/validation/`. Không dùng AntD `Form` (không có AntD).

---

## 11. HTTP interceptors

- Request interceptor gắn `Authorization: Bearer <token>` + timezone header
- Response interceptor handle 401 qua `sessionExpired.ts` → `SessionExpiredModal`
- Service không cần add token manual

---

## 12. Lazy loading

Pages lazy qua `React.lazy()` với `BaseLoadingFullScreen` fallback. Suspense boundary set ở route level.

---

## 13. Path aliases

Import qua alias (`@/`, `@components`, `@services`, …). Không relative `../..`.

---

## 14. Không có

- ❌ **Ant Design** — dùng shadcn/Base UI/Radix
- ❌ **Redux Toolkit** — dùng zustand
- ❌ **react-toastify** — dùng Sonner
- ❌ **Phosphor icons** — dùng lucide-react
- ❌ **Socket.IO** — notification qua polling TanStack Query
- ❌ **Rich text editor** — không có feature cần
- ❌ **PWA manifest** — không standalone install
- ❌ **Vite 7** — dùng Vite 8

---

## Session monitoring

`useSessionExpired()` + `SessionExpiredModal`:

- Modal hiển thị khi API trả 401
- User confirm → clear auth store → redirect login
- Không tự force logout mà không show modal (UX kém trên mobile)
