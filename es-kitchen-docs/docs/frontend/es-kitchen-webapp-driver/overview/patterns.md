# es-kitchen-webapp-driver — Patterns & Conventions

> Đọc file này trước khi viết code React cho E06 Driver Web App.
> Stack khác với các web repo khác: **Zustand** thay RTK, **shadcn/ui** thay Ant Design.

---

## State Management — Zustand (không phải Redux)

```typescript
// stores/useAuthStore.ts
export const useAuthStore = create<AuthState & AuthActions>(set => ({
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  status: hasInitialSession ? SESSION_STATUS.LOADING : SESSION_STATUS.UNAUTHENTICATED,
  user: null,

  setAuthTokens({ accessToken, refreshToken }) {
    setAuthCookies({ accessToken, refreshToken });
    set({ accessToken, refreshToken, user: null, status: SESSION_STATUS.LOADING });
  },

  setCurrentUser(user) {
    set({ user, status: SESSION_STATUS.AUTHENTICATED });
  },

  clearAuthState() {
    clearAuthCookies();
    set({ accessToken: null, refreshToken: null, user: null, status: SESSION_STATUS.UNAUTHENTICATED });
  },

  // Đọc lại từ cookie — gọi khi tab focus / visibility change
  syncAuthStateFromCookies() {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    set({
      accessToken,
      refreshToken,
      status: accessToken && refreshToken ? SESSION_STATUS.LOADING : SESSION_STATUS.UNAUTHENTICATED,
      user: null,
    });
  },
}));

// Dùng trong component
const { user, setCurrentUser, clearAuthState } = useAuthStore();
```

> ⚠️ Không import `useSelector`, `useDispatch`, hay bất kỳ RTK API nào ở repo này.

Khi thêm state mới: tạo Zustand store mới, không nhét vào `useAuthStore`.

---

## UI Components — shadcn/ui + Common/*

Repo này dùng **shadcn/ui** thay Ant Design. Components nằm trong `src/components/ui/`.

```typescript
// ✅ Dùng shadcn components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

// ❌ Không import từ antd
import { Button } from "antd"; // SAI — antd không có trong repo này
```

Bên cạnh shadcn, repo có layer **`src/components/Common/`** chứa các wrapper cao cấp hơn:

| Component | Mô tả |
|---|---|
| `PageLayout` | Full-screen overlay qua `createPortal`, dùng cho trang chi tiết |
| `BaseBottomSheet` | Card container `rounded-t-[24px]` cho nội dung chính mỗi page |
| `BaseCenterModal` | Modal overlay centered, `createPortal` |
| `ModalBottom` | Modal bottom sheet, `createPortal`, safe area aware |
| `BaseAuthButton` | CTA button gradient xanh (full-width, 52px) |
| `BaseGradientButton` | FAB-style gradient button (square 44px, thường gắn icon scan) |
| `BaseSegmentedTabs` | Tab sliding indicator tự custom |
| `BasePhotoUpload` | Upload ảnh với preview grid 3 cột, iOS-safe hidden input |
| `BaseSectionTitle` | Tiêu đề section trong trang chi tiết |

Thêm component shadcn mới: `npx shadcn@latest add <component-name>`

---

## HTTP Client Pattern

Cùng `Requester` class pattern với các web repo khác:

```typescript
// services/client/api.ts
const API = new Requester();
export default API;
```

API prefix của driver **không có prefix** như `/admin/` hay `/admin-company/`:

```typescript
// services/client/auth.service.ts — endpoint thực tế
const APIs = {
  SIGNIN: "/auth/login",
  ME: "/account/me",                              // ⚠️ không phải /company/me
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password/request",
  VERIFY_FORGOT_PASSWORD_OTP: "/auth/forgot-password/verify-otp",
  RESET_PASSWORD: "/auth/forgot-password/reset-password", // ⚠️ không phải /confirm
};
```

Login dùng `driverCode` + `password` (không phải `email` hay `companyCode`):

```typescript
export const signIn = async (values: {
  driverCode: string;   // ⚠️ field là driverCode, không phải companyCode
  password: string;
}): Promise<IBaseApiResponse<AdminLoginResponse>> => {
  return API.post(APIs.SIGNIN, values);
};
```

401 response → interceptor tự gọi `useAuthStore.getState().clearAuthState()`.

---

## TanStack Query Pattern (v5)

Cùng object syntax với các repo khác:

```typescript
// ✅ v5 syntax
const { data } = useQuery({
  queryKey: ['driver-orders', filters],
  queryFn: () => driverService.getOrders(filters),
});

// ✅ Dùng useMutationCustom thay useMutation trực tiếp (xem section riêng bên dưới)
const { mutate } = useMutationCustom({
  mutationFn: (orderId: string) => driverService.updateOrderStatus(orderId),
  customSuccessMessage: "更新しました",
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
  },
});
```

> Hiện tại nhiều page vẫn dùng mock data (`MOCK_*`). Khi implement API thật, thay `useState(MOCK_*)` bằng `useQuery`.

---

## useMutationCustom — Mutation Wrapper

Wrapper bọc `useMutation` với auto toast error/success. **Dùng thay cho `useMutation` trực tiếp trong mọi mutation**.

```typescript
import { useMutationCustom } from "@/hooks/useMutationCustom";

const { mutate, isPending } = useMutationCustom({
  mutationFn: deliveryService.completeDelivery,

  // Auto toast.error với message từ response — mặc định bật
  // skipAutoErrorHandling: true,          // tắt nếu muốn tự xử lý error

  // Auto toast.success — chỉ bật khi có customSuccessMessage
  customSuccessMessage: "配送完了しました",

  onSuccess: (data) => {
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    navigate(ROUTE.HOME);
  },
});
```

---

## Toast — sonner (không phải AntD message)

```typescript
import { toast } from "sonner";

// ✅ Dùng sonner
toast.success("配送完了しました");
toast.error("エラーが発生しました");

// ❌ Không dùng
import { message } from "antd"; // SAI
```

`<Toaster />` đã được mount tại root qua `components/ui/sonner.tsx`.

---

## shadcn cn() Utility

```typescript
import { cn } from "@/lib/utils";

// Kết hợp class có điều kiện
<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## SVG Import via `?react`

Tất cả icon SVG import qua vite-plugin-svgr với suffix `?react` để render thành React component:

```typescript
// ✅ Đúng — trở thành React component
import ScanBarcodeIcon from "@/statics/icons/scan-barcode.svg?react";
import TruckIcon from "@/statics/icons/truck.svg?react";

// Dùng như component thông thường, có thể truyền className
<TruckIcon className="text-text-low size-3.5 shrink-0" />
<ScanBarcodeIcon className="w-full" />
```

Không import SVG dưới dạng URL string rồi dùng `<img src>` — mất khả năng tô màu qua CSS.

---

## Auth Flow

```
App khởi động → AuthBootstrap.tsx → syncAuthStateFromCookies()
  status = LOADING → fetchCurrentUser() → GET /account/me
  → setCurrentUser() → status = AUTHENTICATED

Login → POST /auth/login (driverCode + password)
  → setAuthTokens() → cookies + Zustand store (status = LOADING)
  → fetchCurrentUser() → setCurrentUser()
  → redirect /home

401 → Axios interceptor → clearAuthState() → status = UNAUTHENTICATED → redirect /login
```

---

## Layout Structure

Tất cả trang đã auth wrap trong `AuthLayout`:

```
AuthLayout
├── <Outlet />           ← các page render vào đây
│   (AuthCenteredLayout hoặc AuthLayout tùy group)
└── BottomNavigation     ← fixed, luôn hiển thị
```

**BottomNavigation** — 5 tabs, `NavLink` + `isActive` swap icon outline/bold:

| Tab | Route | Icon |
|---|---|---|
| ホーム | `/home` | home / home-bold |
| マニュアル | `/orders` | book / book-bold |
| 配送一覧 | `/delivery` | truck / truck-bold |
| 遅延報告 | `/issues` | siren / siren-bold |
| アカウント | `/account` | account / account-bold |

---

## Routing Pattern

```typescript
// routes/index.tsx — cấu trúc thực tế
export const router = createBrowserRouter([
  {
    element: <PublicOnly />,        // redirect → /home nếu đã auth
    children: [
      {
        element: withSuspense(<NonAuthLayout />),
        children: [
          { path: ROUTE.LOGIN, element: <LoginPage /> },
          { path: ROUTE.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
          { path: ROUTE.VERIFY, element: <VerifyCodePage /> },
          { path: ROUTE.RESET_PASSWORD, element: <ResetPasswordPage /> },
        ],
      },
    ],
  },
  {
    element: <RequireAuth />,       // redirect → /login nếu chưa auth
    children: [
      {
        element: <AuthCenteredLayout />,   // trang reset thành công (không có bottom nav)
        children: [
          { path: ROUTE.RESET_SUCCESS, element: withSuspense(<ResetSuccessPage />) },
        ],
      },
      {
        element: <AuthLayout />,           // trang chính — có bottom nav
        children: [
          { path: ROUTE.HOME, element: withSuspense(<HomePage />) },
          { path: ROUTE.DELIVERY, element: withSuspense(<DeliveryPage />) },
          { path: ROUTE.DELIVERY_DETAIL, element: withSuspense(<DeliveryDetailPage />) },
          { path: ROUTE.ORDERS, element: withSuspense(<OrdersPage />) },
          { path: ROUTE.ISSUES, element: withSuspense(<IssuesPage />) },
          { path: ROUTE.ACCOUNT, element: withSuspense(<AccountPage />) },
          { path: ROUTE.NOTIFICATIONS, element: withSuspense(<NotificationsPage />) },
        ],
      },
    ],
  },
  { path: "*", element: <Navigate to={ROUTE.LOGIN} replace /> },
]);
```

Tất cả page lazy-loaded qua `React.lazy` + `withSuspense` (fallback = `BaseLoadingFullScreen`).

---

## BaseBottomSheet — Container Card chính

Dùng để bọc nội dung chính của các trang home/delivery/orders — tạo hiệu ứng card trắng bo góc trên, tự padding tránh bottom nav:

```tsx
import BaseBottomSheet from "@/components/Common/BaseBottomSheet";

// Dùng trong page
<div className="flex flex-1 flex-col">
  <Logo />
  <Header />

  <BaseBottomSheet>
    {/* nội dung trang */}
  </BaseBottomSheet>
</div>
```

Đã xử lý `padding-bottom: calc(--bottom-nav-height + env(safe-area-inset-bottom) + 16px)` — **không tự thêm padding bottom** khi wrap bằng `BaseBottomSheet`.

---

## PageLayout — Full-Screen Overlay cho trang chi tiết

Dùng cho tất cả trang chi tiết giao hàng (COOL detail, ES delivery steps). Render qua `createPortal` vào `document.body`, z-index 20, che toàn màn hình kể cả bottom nav.

```tsx
import PageLayout from "@/components/Common/PageLayout";

<PageLayout
  title="COOL便"
  header={{ onBack: () => navigate(-1) }}   // mặc định: navigate(-1) hoặc về /home
  headerActions={
    <Button variant="icon" size="icon" onClick={handleIssue}>
      <SirenIcon className="size-6!" />
    </Button>
  }
  footer={{
    confirmText: "完了",
    onConfirm: handleComplete,
    confirmDisabled: !allChecked,
    cancelText: "戻る",          // optional — nếu có thì footer 2 cột
    onCancel: handleBack,
  }}
  className="flex flex-1 flex-col"
>
  {/* nội dung trang — scroll tự động qua main overflow-y-auto */}
  <div className="flex flex-col gap-4 px-4 py-4">
    ...
  </div>
</PageLayout>
```

**Quan trọng:** Không dùng `BaseBottomSheet` bên trong `PageLayout` — `PageLayout` đã tự quản lý scroll.

---

## Modal Patterns

Hai loại modal, chọn theo UX:

### BaseCenterModal — Modal giữa màn hình

```tsx
import BaseCenterModal from "@/components/Common/BaseCenterModal";

<BaseCenterModal
  open={showModal}
  onClose={() => setShowModal(false)}
  title="タイトル"           // optional
  showCloseButton={true}    // optional, default false
>
  <p>内容...</p>
  <Button onClick={handleConfirm}>確認</Button>
</BaseCenterModal>
```

Render qua `createPortal`, click backdrop đóng modal. Border radius 24px.

### ModalBottom — Bottom Sheet Modal

```tsx
import ModalBottom from "@/components/Common/ModalBottom";

<ModalBottom
  open={showSheet}
  onClose={() => setShowSheet(false)}
  title="フィルター"
  showCloseButton={true}    // default true
>
  {/* nội dung */}
</ModalBottom>
```

`rounded-t-2xl`, padding bottom tự tính `env(safe-area-inset-bottom)`.

---

## Barcode Scanner — BaseBarcodeCameraArea

Dùng `react-barcode-scanner` (polyfill `BarcodeDetector` browser API) để quét barcode/QR qua camera sau.

```tsx
import "react-barcode-scanner/polyfill";  // import ở file consumer
import BaseBarcodeCameraArea from "./_shared/BaseBarcodeCameraArea";

<BaseBarcodeCameraArea
  onScan={(value: string) => {
    // value = rawValue của barcode được detect
    handleBarcodeScanned(value);
  }}
  paused={showResultModal}   // tạm dừng scan khi modal kết quả đang mở
/>
```

**Camera states:** `idle` (chưa bật) → user tap → `granted` (đang scan) hoặc `denied`/`unsupported`.

**Cooldown 3s:** barcode giống nhau bị bỏ qua 3 giây sau lần scan đầu (tránh trigger liên tục).

**HTTPS required:** `BaseBarcodeCameraArea` tự check `window.isSecureContext`, hiển thị error nếu không phải HTTPS.

**Cleanup:** stream camera được stop trong `useEffect` cleanup — **không cần gọi thêm** từ bên ngoài.

Pattern dùng scan: bấm nút FAB `BaseGradientButton` để navigate đến sub-view scanner (`ESStepView.Step2Scan`), sau khi scan xong mở `BaseCenterModal` để confirm số lượng:

```tsx
// ESStep2Inventory.tsx — FAB button mở scanner sub-view
<BaseGradientButton onClick={() => step.goTo(ESStepView.Step2Scan)}>
  <ScanIcon className="size-6 shrink-0 text-white" />
</BaseGradientButton>

// ESStep3Scanner.tsx — scanner sub-view gọi callback
<BaseBarcodeCameraArea onScan={step.openStep3ScanModal} paused={step.showStep3ScanModal} />
```

---

## ES Delivery Multi-Step Flow

ES배送便 có flow nhiều bước, state được quản lý bởi `useDeliveryESStep` hook và persisted qua URL search param `?step=`.

```typescript
// useDeliveryESStep.ts — step navigation qua URL
import { useSearchParams } from "react-router-dom";

export enum ESStepView {
  Detail      = "detail",
  Step1       = "step1",       // 陳列前写真
  Step2       = "step2",       // 在庫/廃棄
  Step2Scan   = "step2-scan",  // scanner sub-view
  Step2Confirm= "step2-confirm",
  Step3       = "step3",       // 陳列
  Step3Scan   = "step3-scan",
  Step3Confirm= "step3-confirm",
  Step4       = "step4",       // 陳列後写真
  Step5       = "step5",       // 集金登録
}

// goTo thay đổi ?step= trong URL — browser back button hoạt động đúng
step.goTo(ESStepView.Step2);
```

`DeliveryDetailPage` đọc `?type=` param để quyết định render `DeliveryESDetailPage` hay `DeliveryCoolDetailPage`:

```tsx
const DeliveryDetailPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") as DeliveryType | null;
  return type === DeliveryType.ES ? <DeliveryESDetailPage /> : <DeliveryCoolDetailPage />;
};
```

**ArrangementStepper** hiển thị tiến trình 5 bước (陳列前 → 在庫/廃棄 → 陳列 → 陳列後 → 集金登録):

```tsx
import ArrangementStepper from "./_shared/ArrangementStepper";

// activeIndex: step đang làm (0-based), completedUpTo: số bước đã xong
<ArrangementStepper activeIndex={1} completedUpTo={1} />
```

---

## Order Card Patterns

Hai loại card dùng chung pattern (icon badge + company + status + depot + address + phones):

| Component | Dùng ở | Click behavior |
|---|---|---|
| `DeliveryOrderCard` | HomePage (DayGroup) | `Link` navigate → `/delivery/:id?type=` |
| `OrderListCard` | DeliveryPage (ES/COOL tab) | `button` + `onClick` prop |

```tsx
// DeliveryOrderCard — clickable: false khi dùng bên trong DepotCard (warehouse child)
<DeliveryOrderCard order={order} clickable={true} isChildrenCard={false} />

// OrderListCard — TROUBLE status: tự pin lên đầu list + hiện alert strip đỏ
const filtered = [...items].sort((a, b) => (a.status === "TROUBLE" ? -1 : b.status === "TROUBLE" ? 1 : 0));
filtered.map(order => <OrderListCard key={order.id} order={order} onClick={() => handleClick(order)} />)
```

**DepotCard** — card kho hàng, collapsible, hiển thị danh sách child orders khi expand:

```tsx
<DepotCard depot={warehouseItem} onPress={() => setSelectedDepot(warehouseItem)} />
```

**StatusBadge** — dùng discriminated union để type-safe với 2 loại status:

```tsx
import StatusBadge from "./StatusBadge";

<StatusBadge variant="order" status={order.status} />     // OrderStatus
<StatusBadge variant="warehouse" status={depot.status} /> // WarehouseStatus
```

---

## Home Page — DeliveryStats + DeliverySchedule

Home page gồm 2 thành phần chính:

```tsx
// Stats card (overlays bg image)
<div className="mx-4">
  <DeliveryStats stats={stats} />   // tổng/hoàn thành/còn lại + progress bar animated
</div>

// Schedule sheet (BaseBottomSheet)
<BaseBottomSheet className="mt-3">
  <DeliverySchedule schedule={schedule} />
  {allEmpty && <EmptyAllDays />}
</BaseBottomSheet>
```

`DeliverySchedule` render danh sách `DayGroup`, mỗi group sort item: WAREHOUSE lên đầu, COMPLETED xuống cuối.

---

## BaseSegmentedTabs — Sliding Indicator Tabs

Custom tab với sliding indicator dùng `offsetLeft` + `offsetWidth` tính qua `useEffect`:

```tsx
import BaseSegmentedTabs from "@/components/Common/BaseSegmentedTabs";
import type { SegmentedTabItem } from "@/components/Common/BaseSegmentedTabs";

const tabs: SegmentedTabItem[] = [
  { key: "warehouse", label: "倉庫受付" },
  { key: "es", label: "ES配送便" },
  { key: "cool", label: "COOL便" },
];

<BaseSegmentedTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
```

`DeliveryTab` (`delivery/_components/DeliveryTab.tsx`) là variant của `BaseSegmentedTabs` hiển thị badge count.

---

## Custom Hooks

| Hook | Mô tả |
|---|---|
| `useTableParams` | Sync pagination/sort/filter với URL search params; dùng `queueMicrotask` để batch updates |
| `useMutationCustom` | Wrapper useMutation + auto toast (xem section riêng) |
| `useAuth` | Đọc `user` từ `useAuthStore`, expose `driverName` |
| `useDebouncedValue` | Debounce giá trị input cho search |
| `useInView` | IntersectionObserver hook cho lazy-animate (disconnect sau lần đầu visible) |
| `useCan` | Permission check dựa trên user role |

---

## Thêm page mới — Checklist

- [ ] Tạo folder trong `src/pages/<domain>/`
- [ ] Thêm lazy import + route vào `routes/index.tsx`
- [ ] Thêm route path vào `constants/route.ts`
- [ ] Thêm service file `services/client/<domain>.service.ts` nếu cần API mới
- [ ] API endpoint **không có prefix** `/admin/` — xác nhận với BE trước khi code
- [ ] Login field là `driverCode` (không phải `companyCode` hay `email`)
- [ ] ME endpoint là `/account/me` (không phải `/company/me`)
- [ ] Dùng shadcn/ui + `components/Common/*` — không import từ `antd`
- [ ] State mới → Zustand store mới trong `stores/` — không nhét vào `useAuthStore`
- [ ] Toast → `sonner`, không dùng `antd message`
- [ ] Mutation → `useMutationCustom` thay `useMutation` trực tiếp
- [ ] SVG icon → import `?react` suffix, không dùng `<img src>`
- [ ] Trang chi tiết (full-screen overlay) → dùng `PageLayout`
- [ ] Trang chính (home/list) → bọc nội dung bằng `BaseBottomSheet`
- [ ] Modal centered → `BaseCenterModal`; modal bottom sheet → `ModalBottom`
