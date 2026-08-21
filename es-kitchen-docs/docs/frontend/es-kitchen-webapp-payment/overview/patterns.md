# es-kitchen-webapp-payment — Patterns & Conventions

> Đọc file này trước khi viết code cho E07. **Cùng nhóm stack với E06** (shadcn + zustand + Sonner + lucide-react) nhưng có thêm **elepay SDK + @zxing scanner + PWA**.

---

## Kế thừa từ E06 webapp-driver

Đa số pattern áp dụng nguyên vẹn — xem `../es-kitchen-webapp-driver/overview/patterns.md`:

- #1 UI stack: shadcn/ui + Base UI + Radix
- #2 State: zustand + TanStack Query v5 object syntax
- #3 Toast: Sonner (không react-toastify)
- #4 Icons: lucide-react (không Phosphor/AntD icons)
- #5 Class merging: `cn()` utility
- #6 Component variant: `class-variance-authority`
- #10 Forms: react-hook-form + Yup
- #11 HTTP interceptors — không tự thêm token
- #12 Lazy loading + Suspense
- #13 Path aliases

---

## Đặc thù E07

### 1. Route guards — company session, không auth-based

Khác E02–E06 (dùng `RequireAuth`/`PublicOnly`), E07 dùng:

- **`RequireCompany`** — chặn nếu chưa resolve company session (chưa scan QR shop)
- **`NoCompanyOnly`** — cho guest flow (khi chưa vào shop)

Auth flow ở E07 là **guest-first**: user vào shop qua QR không cần đăng ký → được cấp session token. Route guard check `useCompanySessionStore`, không phải `useAuthStore`.

### 2. Zustand — 4 store phân tách theo domain

```
useAuthStore       ← JWT token, session validation
useUserStore       ← User profile
useCompanySessionStore ← Active shop/company (resolved từ QR)
useCheckoutStore   ← Cart items, order state
```

**Rule:** không gom vào mega-store. Store phải scope theo domain concern. Nếu cần store mới → tạo `useXxxStore.ts` riêng.

### 3. QR Scanner — `@zxing/browser`

```tsx
// hooks/useScanToCart.ts (pattern)
import { BrowserMultiFormatReader } from '@zxing/browser';
```

Không dùng `react-barcode-scanner` (E06). Camera API + `@zxing/library` là stack chuẩn cho E07.

**Rule khi scan:**
- Sau khi scan → validate qua `qr.service.ts` (API check) → nếu hợp lệ, dispatch `useCheckoutStore.addItem()`
- Xử lý case denied camera permission — hiển thị fallback text input

### 4. Payment — elepay SDK v2

```typescript
// services/client/elepay.ts
import { Elepay } from 'elepay-js-sdk';
```

**Rule:**
- **Không xử lý card number trực tiếp** — delegate hoàn toàn cho elepay SDK
- **Không tích hợp Stripe/PayPal/VNPay** — chỉ elepay (Alipay + WeChat Pay + card)
- Payment status track qua `usePaymentCountdown` hook + polling `payment.service.ts`
- Success → redirect `/payment/success`

### 5. Cart persistence

`cart.service.ts` persist cart items vào `localStorage` — user refresh không mất cart. **Rule:**
- Clear cart sau khi payment success qua `useCartReset`
- Không lưu payment info vào localStorage — chỉ cart items

### 6. Mobile-first + PWA

- Viewport fixed `h-dvh w-screen` — tránh full width trên desktop
- PWA manifest cho phép install standalone
- Service worker autoUpdate — không cần manual reload khi có version mới

### 7. Session ordering flow

```
QR scan (ngoài shop)
  → /shop/:code
  → useSyncCompanySession → resolve company + guest token
  → RequireCompany passes
  → / (HomePage) → /menu → /scan → /cart → /cart/confirm → /cart/payment-methods → /payment/success
```

**Rule khi thêm route trong flow:**
- Nếu cần company session → thêm vào group `RequireCompany`
- Nếu là landing/error → dùng `NoCompanyOnly`

### 8. TanStack Query default — chưa cấu hình rõ

Config trong `queryClient.ts` — nếu chưa set `staleTime`, giá trị mặc định (0) sẽ refetch nhiều. Khi thêm query lớn (menu list) → override `staleTime` cụ thể để tránh thrash.

---

## Không tự thêm

- ❌ **Ant Design** — dùng shadcn/Base UI/Radix
- ❌ **Redux Toolkit** — dùng zustand
- ❌ **react-toastify** — dùng Sonner
- ❌ **Phosphor icons** — dùng lucide-react
- ❌ **Socket.IO** — payment status dùng polling + elepay webhook
- ❌ **Stripe/PayPal/VNPay** — chỉ elepay
- ❌ **Rich text editor** — không có use case
- ❌ **react-barcode-scanner** — dùng `@zxing/browser`

---

## Design token — chưa align

Repo hiện chưa import Figma design token — dùng Tailwind palette mặc định. PWA `theme_color` là `#fee28a` (warning-200 yellow). Khi UI trưởng thành → cần:

1. Confirm với Designer về màu primary chính thức cho E07 (có thể là yellow như E01 Mobile, hoặc màu mới)
2. Wire `next-themes` provider nếu cần dark mode
3. Import design token qua Tailwind config theo `.claude/rules/design_rule.md`

---

## Fix cần thiết (Dev repo work)

Các fix source code (BA không tự sửa — chỉ note):

1. `package.json` name: `"es-kitchen-web-admin"` → `"es-kitchen-webapp-payment"`
2. `README.md`: rewrite từ đầu (hiện đang mô tả web-supplier)
3. `@assets` alias: align `src/assets/` ↔ `src/statics/`
4. Wire `<ThemeProvider>` từ next-themes trong `App.tsx` nếu cần dark mode
5. Cấu hình Vitest cho `pnpm run test`
6. Config deploy script cho preview + production
