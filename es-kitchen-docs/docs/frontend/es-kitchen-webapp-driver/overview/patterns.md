# es-kitchen-webapp-driver — Patterns & Conventions

> Nguồn = es-kitchen-webapp-driver@62b870a ngày 2026-10-16.

**File này nói gì:** cách làm đang chạy thật trong E06 (Driver Web App): state, UI, gọi API, đăng nhập, layout điện thoại, modal, quét mã vạch, luồng giao hàng ES nhiều bước.
**Đọc khi:** sắp viết code React cho E06.
**Nhớ:** stack khác các web còn lại — **Zustand thay Redux Toolkit, shadcn/ui thay Ant Design, sonner thay message/react-toastify**. Tên file/hook ở đây đều có trong bản cũ; chưa đọc lại toàn bộ source ngoài các mục đã ghi.

---

## 0. Tra nhanh: tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | Mục | File mẫu |
|---|---|---|---|
| Cần state toàn cục mới | Tạo store zustand mới trong `stores/`, không nhét vào `useAuthStore` | §1 | `stores/useAuthStore.ts` |
| Cần nút/ô nhập/checkbox | Dùng `components/ui/*` (shadcn); thêm bằng `npx shadcn@latest add <name>` | §2 | `components/ui/` |
| Gọi API mới | Thêm service trong `services/client/`; xác nhận endpoint với BE (không prefix `/admin/`) | §3 | `auth.service.ts` |
| Ghi dữ liệu | `useMutationCustom` | §5 | `hooks/useMutationCustom.ts` |
| Hiện thông báo | `toast` từ `sonner` | §6 | `components/ui/sonner.tsx` |
| Dùng icon SVG | `import X from "…svg?react"` | §8 | `statics/icons/` |
| Trang chính (home/list) | Bọc bằng `BaseBottomSheet` | §11 | — |
| Trang chi tiết toàn màn hình | `PageLayout` | §12 | `delivery/_components` |
| Popup giữa / popup đáy | `BaseCenterModal` / `ModalBottom` | §13 | — |
| Quét mã vạch | `BaseBarcodeCameraArea` | §14 | `ESStep3Scanner.tsx` |
| Luồng nhiều bước | Bước lưu trên URL `?step=` | §15 | `useDeliveryESStep.ts` |
| Phiên hết hạn | Interceptor + `SessionExpiredModal` | §4 | `services/http/handleResponse.ts` |

---

## 1. State — Zustand (không phải Redux)

**Vấn đề:** cần giữ phiên đăng nhập ở một chỗ mọi component đọc được.
**Cách làm:** một store zustand, `stores/useAuthStore.ts`.

```typescript
export const useAuthStore = create<AuthState & AuthActions>(set => ({
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  status: hasInitialSession ? SESSION_STATUS.LOADING : SESSION_STATUS.UNAUTHENTICATED,
  user: null,

  setAuthTokens({ accessToken, refreshToken }) {
    setAuthCookies({ accessToken, refreshToken });
    set({ accessToken, refreshToken, user: null, status: SESSION_STATUS.LOADING });
  },
  setCurrentUser(user) { set({ user, status: SESSION_STATUS.AUTHENTICATED }); },
  clearAuthState() {
    clearAuthCookies();
    set({ accessToken: null, refreshToken: null, user: null, status: SESSION_STATUS.UNAUTHENTICATED });
  },
  // đọc lại từ cookie — gọi khi tab focus / visibility change
  syncAuthStateFromCookies() { /* đọc cookie → set status LOADING hoặc UNAUTHENTICATED */ },
}));

// trong component
const { user, setCurrentUser, clearAuthState } = useAuthStore();
```

**Bẫy:**
- Không import `useSelector`, `useDispatch` hay API RTK nào ở repo này.
- State mới → store zustand mới. Không nhét thêm vào `useAuthStore`.
- Ngoài component (như interceptor) đọc store bằng `useAuthStore.getState()`.

---

## 2. UI — shadcn/ui + `components/Common/*`

**Cách làm:** component gốc ở `src/components/ui/` (shadcn). Phía trên là lớp wrapper `src/components/Common/`.

```typescript
// ✅ đúng
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
// ❌ sai — antd không có trong repo này
import { Button } from "antd";
```

| Component (`components/Common/`) | Việc |
|---|---|
| `PageLayout` | Lớp phủ toàn màn hình qua `createPortal`, cho trang chi tiết |
| `BaseBottomSheet` | Thẻ trắng bo góc trên `rounded-t-[24px]`, chứa nội dung chính mỗi trang |
| `BaseCenterModal` | Modal giữa màn hình, `createPortal` |
| `ModalBottom` | Modal dạng bottom sheet, `createPortal`, tính safe area |
| `BaseAuthButton` | Nút CTA gradient xanh (full-width, 52px) |
| `BaseGradientButton` | Nút kiểu FAB gradient (vuông 44px, thường gắn icon quét) |
| `BaseSegmentedTabs` | Tab có thanh trượt tự viết |
| `BasePhotoUpload` | Upload ảnh, preview lưới 3 cột, input ẩn an toàn cho iOS |
| `BaseSectionTitle` | Tiêu đề section trong trang chi tiết |

Thêm component shadcn mới: `npx shadcn@latest add <component-name>`.

Gộp class có điều kiện bằng `cn()`:

```typescript
import { cn } from "@/lib/utils";
<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## 3. HTTP client và endpoint

**Cách làm:** cùng pattern `Requester` như các web khác.

```typescript
// services/client/api.ts
const API = new Requester();
export default API;
```

Endpoint auth thật (`services/client/auth.service.ts`):

```typescript
const APIs = {
  SIGNIN: "/auth/login",
  ME: "/account/me",                                          // không phải /company/me
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password/request",
  VERIFY_FORGOT_PASSWORD_OTP: "/auth/forgot-password/verify-otp",
  RESET_PASSWORD: "/auth/forgot-password/reset-password",     // không phải /confirm
};

export const signIn = async (values: { driverCode: string; password: string }):
  Promise<IBaseApiResponse<AdminLoginResponse>> => API.post(APIs.SIGNIN, values);
```

**Bẫy:**
- **Không có prefix** `/admin/` hay `/admin-company/`.
- Login dùng `driverCode` + `password` — không phải `email` hay `companyCode`.
- Hiện không còn `MOCK_*` trong `src/` (đã grep). Trang mới phải gọi API thật.

---

## 4. Đăng nhập và phiên hết hạn

```
App khởi động → AuthBootstrap.tsx → syncAuthStateFromCookies()
  status = LOADING → fetchCurrentUser() → GET /account/me
  → setCurrentUser() → status = AUTHENTICATED

Login → POST /auth/login (driverCode + password)
  → setAuthTokens() → cookie + store (status = LOADING)
  → fetchCurrentUser() → setCurrentUser()
  → redirect /home
```

Xử lý 401 (`services/http/handleResponse.ts`):

```typescript
onError: (error) => {
  if (isSessionExpiredError(error)) notifySessionExpired();      // → SessionExpiredModal
  else if (error.response?.status === 401) useAuthStore.getState().clearAuthState();
  return Promise.reject(error);
}
```

- `isSessionExpiredError` = 401 **và** request đã mang header `Authorization`. Lý do: login/quên mật khẩu sai cũng trả 401, đó không phải hết phiên (`sessionExpired.ts`).
- Chỉ thấy xóa phiên; không thấy gọi refresh token trong `handleResponse.ts`.
- Guard: `PublicOnly` đã đăng nhập → `/home`; `RequireAuth` chưa đăng nhập → `/login` (kèm `?redirect=`).

---

## 5. TanStack Query (v5, object syntax) và `useMutationCustom`

**Truy vấn:**

```typescript
const { data } = useQuery({
  queryKey: ['driver-orders', filters],
  queryFn: () => driverService.getOrders(filters),
});
```

(Ví dụ minh họa của bản cũ; hook thật theo trang: `useDeliveryList`, `useDeliveryDetail`… trong `pages/delivery/hooks/`.)

Mặc định (`queryClient.ts`): `staleTime` 5 phút, `retry: 1`, không refetch khi focus cửa sổ.

**Ghi dữ liệu — luôn qua `useMutationCustom`** (wrapper bọc `useMutation`, tự `toast.error` với message từ response):

```typescript
import { useMutationCustom } from "@/hooks/useMutationCustom";

const { mutate, isPending } = useMutationCustom({
  mutationFn: deliveryService.completeDelivery,
  // skipAutoErrorHandling: true,      // tắt toast lỗi tự động nếu muốn tự xử lý
  customSuccessMessage: "配送完了しました",   // chỉ có thì mới toast.success
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    navigate(ROUTE.HOME);
  },
});
```

Option: `skipAutoErrorHandling`, `skipAutoSuccessHandling`, `customErrorMessage`, `customSuccessMessage`.

**Bẫy:** quên `invalidateQueries` → danh sách vẫn hiện dữ liệu cũ (cache 5 phút).

---

## 6. Toast — sonner

```typescript
import { toast } from "sonner";
toast.success("配送完了しました");
toast.error("エラーが発生しました");
// ❌ import { message } from "antd";
```

`<Toaster />` đã mount ở root (`components/ui/sonner.tsx`, `top-center`).

---

## 7. Hook dùng chung

| Hook | Việc |
|---|---|
| `useTableParams` | Đồng bộ phân trang / sort / lọc với URL; dùng `queueMicrotask` để gộp cập nhật |
| `useMutationCustom` | `useMutation` + toast tự động (§5) |
| `useAuth` | Đọc `user` từ `useAuthStore`, có `driverName` |
| `useDebouncedValue` | Trì hoãn giá trị ô tìm kiếm |
| `useInView` | IntersectionObserver cho hiệu ứng lazy (ngắt sau lần hiện đầu) |
| `useCan` | Kiểm quyền theo vai trò |

---

## 8. Icon SVG — import `?react`

```typescript
// ✅ trở thành component React (đổi màu được qua CSS)
import ScanBarcodeIcon from "@/statics/icons/scan-barcode.svg?react";
<TruckIcon className="text-text-low size-3.5 shrink-0" />
```

**Bẫy:** import SVG thành chuỗi URL rồi `<img src>` → mất khả năng tô màu bằng CSS.

---

## 9. Layout và thanh tab dưới

```
AuthLayout
├── <Outlet />          các trang render ở đây
└── BottomNavigation    cố định, luôn hiện
(AuthCenteredLayout: trang reset-success, không có thanh tab)
```

`BottomNavigation`: 5 tab, `NavLink` + `isActive` đổi icon outline/bold.

| Tab | Route | Icon |
|---|---|---|
| ホーム | `/home` | home / home-bold |
| マニュアル | link ngoài `MANUAL_URL` (PDF ES Station, `target="_blank"`) — **không** phải `/orders` | book / book-bold |
| 配送一覧 | `/delivery` | truck / truck-bold |
| トラブル | `/issues` | siren / siren-bold |
| アカウント | `/account` | account / account-bold |

---

## 10. Routing

```typescript
// routes/index.tsx
export const router = createBrowserRouter([
  { element: <PublicOnly />,            // đã đăng nhập → /home
    children: [{ element: withSuspense(<NonAuthLayout />), children: [
      { path: ROUTE.LOGIN, element: <LoginPage /> },
      { path: ROUTE.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTE.VERIFY, element: <VerifyCodePage /> },
      { path: ROUTE.RESET_PASSWORD, element: <ResetPasswordPage /> },
    ] }] },
  { element: <RequireAuth />,           // chưa đăng nhập → /login
    children: [
      { element: <AuthCenteredLayout />, children: [{ path: ROUTE.RESET_SUCCESS, element: withSuspense(<ResetSuccessPage />) }] },
      { element: <AuthLayout />, children: [
        { path: ROUTE.HOME, element: withSuspense(<HomePage />) },
        { path: ROUTE.DELIVERY, element: withSuspense(<DeliveryPage />) },
        { path: ROUTE.DELIVERY_DETAIL, element: withSuspense(<DeliveryDetailPage />) },
        { path: ROUTE.ORDERS, element: withSuspense(<OrdersPage />) },
        { path: ROUTE.ISSUES, element: withSuspense(<IssuesPage />) },
        { path: ROUTE.ACCOUNT, element: withSuspense(<AccountPage />) },
        { path: ROUTE.NOTIFICATIONS, element: withSuspense(<NotificationsPage />) },
      ] },
    ] },
  { path: "*", element: <Navigate to={ROUTE.LOGIN} replace /> },
]);
```

Mọi trang lazy-load qua `React.lazy` + `withSuspense` (fallback = `BaseLoadingFullScreen`). Đây là rút gọn; các route `/issues/:id`, `/notifications/:id` có trong `structure.md` §5.

---

## 11. `BaseBottomSheet` — thẻ nội dung chính

Dùng cho home / delivery / orders: thẻ trắng bo góc trên, tự chừa chỗ cho thanh tab dưới.

```tsx
<div className="flex flex-1 flex-col">
  <Logo />
  <Header />
  <BaseBottomSheet>{/* nội dung trang */}</BaseBottomSheet>
</div>
```

Đã tính sẵn `padding-bottom: calc(--bottom-nav-height + env(safe-area-inset-bottom) + 16px)`.
**Bẫy:** không tự thêm padding-bottom khi đã bọc bằng `BaseBottomSheet`.

---

## 12. `PageLayout` — trang chi tiết toàn màn hình

Dùng cho mọi trang chi tiết giao hàng (COOL, các bước ES). Render qua `createPortal` vào `document.body`, z-index 20, che cả thanh tab dưới.

```tsx
<PageLayout
  title="COOL便"
  header={{ onBack: () => navigate(-1) }}     // mặc định: navigate(-1) hoặc về /home
  headerActions={<Button variant="icon" size="icon" onClick={handleIssue}><SirenIcon className="size-6!" /></Button>}
  footer={{
    confirmText: "完了", onConfirm: handleComplete, confirmDisabled: !allChecked,
    cancelText: "戻る", onCancel: handleBack,   // có cancelText thì footer 2 cột
  }}
  className="flex flex-1 flex-col"
>
  <div className="flex flex-col gap-4 px-4 py-4">...</div>   {/* cuộn tự động qua main overflow-y-auto */}
</PageLayout>
```

**Bẫy:** không đặt `BaseBottomSheet` bên trong `PageLayout` — `PageLayout` đã tự quản lý cuộn.

---

## 13. Modal — chọn theo kiểu hiển thị

| Cần | Dùng | Ghi chú |
|---|---|---|
| Hộp thoại giữa màn hình | `BaseCenterModal` | `createPortal`, bấm nền để đóng, bo 24px; props `open`, `onClose`, `title?`, `showCloseButton?` (mặc định false) |
| Bảng trượt từ đáy | `ModalBottom` | `rounded-t-2xl`, tự tính `env(safe-area-inset-bottom)`; `showCloseButton` mặc định true |

```tsx
<BaseCenterModal open={showModal} onClose={() => setShowModal(false)} title="タイトル" showCloseButton>
  <Button onClick={handleConfirm}>確認</Button>
</BaseCenterModal>
<ModalBottom open={showSheet} onClose={() => setShowSheet(false)} title="フィルター">...</ModalBottom>
```

---

## 14. Quét mã vạch — `BaseBarcodeCameraArea`

**Vấn đề:** tài xế quét mã vạch/QR bằng camera sau.
**Cách làm:** `react-barcode-scanner` (polyfill `BarcodeDetector`).

```tsx
import "react-barcode-scanner/polyfill";   // import ở file dùng
import BaseBarcodeCameraArea from "./_shared/BaseBarcodeCameraArea";

<BaseBarcodeCameraArea
  onScan={(value: string) => handleBarcodeScanned(value)}   // value = rawValue
  paused={showResultModal}                                  // dừng quét khi modal kết quả mở
/>
```

- Trạng thái camera: `idle` → người dùng chạm → `granted` (đang quét) hoặc `denied` / `unsupported`.
- Cooldown 3 giây: cùng một mã bị bỏ qua 3 giây sau lần quét đầu.
- Cần HTTPS: component tự kiểm `window.isSecureContext`, báo lỗi nếu không.
- Camera tự tắt trong cleanup của `useEffect` — không cần tắt thêm từ ngoài.

Luồng dùng: bấm FAB `BaseGradientButton` → sang sub-view quét (`ESStepView.Step2Scan`) → quét xong mở `BaseCenterModal` xác nhận số lượng.

```tsx
// ESStep2Inventory.tsx
<BaseGradientButton onClick={() => step.goTo(ESStepView.Step2Scan)}><ScanIcon className="size-6 shrink-0 text-white" /></BaseGradientButton>
// ESStep3Scanner.tsx
<BaseBarcodeCameraArea onScan={step.openStep3ScanModal} paused={step.showStep3ScanModal} />
```

---

## 15. Luồng giao hàng ES nhiều bước

**Vấn đề:** giao ES có nhiều bước; bấm nút Back của trình duyệt phải về đúng bước, reload không mất bước.
**Cách làm:** bước hiện tại lưu trên URL `?step=`, quản lý bởi hook `useDeliveryESStep`.

```typescript
export enum ESStepView {
  Detail = "detail",
  Step1 = "step1",             // 陳列前写真
  Step2 = "step2",             // 在庫/廃棄
  Step2Scan = "step2-scan",    // sub-view quét
  Step2Confirm = "step2-confirm",
  Step3 = "step3",             // 陳列
  Step3Scan = "step3-scan",
  Step3Confirm = "step3-confirm",
  Step4 = "step4",             // 陳列後写真
  Step5 = "step5",             // 集金登録
}
step.goTo(ESStepView.Step2);   // đổi ?step= trên URL
```

`DeliveryDetailPage` đọc `?type=` để chọn màn:

```tsx
const type = searchParams.get("type") as DeliveryType | null;
return type === DeliveryType.ES ? <DeliveryESDetailPage /> : <DeliveryCoolDetailPage />;
```

`ArrangementStepper` hiện 5 bước (陳列前 → 在庫/廃棄 → 陳列 → 陳列後 → 集金登録):

```tsx
<ArrangementStepper activeIndex={1} completedUpTo={1} />   // activeIndex: bước đang làm (từ 0); completedUpTo: số bước đã xong
```

---

## 16. Thẻ đơn hàng, trang chủ, tab

**Hai loại thẻ** (cùng bố cục: badge icon + công ty + trạng thái + kho + địa chỉ + số điện thoại):

| Component | Dùng ở | Khi bấm |
|---|---|---|
| `DeliveryOrderCard` | HomePage (DayGroup) | `Link` → `/delivery/:id?type=` |
| `OrderListCard` | DeliveryPage (tab ES/COOL) | `button` + prop `onClick` |

```tsx
<DeliveryOrderCard order={order} clickable={true} isChildrenCard={false} />  // clickable=false khi nằm trong DepotCard
// OrderListCard: trạng thái TROUBLE tự ghim lên đầu + dải cảnh báo đỏ
const filtered = [...items].sort((a, b) => (a.status === "TROUBLE" ? -1 : b.status === "TROUBLE" ? 1 : 0));
```

- `DepotCard`: thẻ kho, thu gọn/mở, hiện đơn con khi mở: `<DepotCard depot={warehouseItem} onPress={...} />`.
- `StatusBadge`: union phân biệt 2 loại: `<StatusBadge variant="order" status={order.status} />` hoặc `variant="warehouse"`.

**Trang chủ:** `DeliveryStats` (tổng / hoàn thành / còn lại + thanh tiến độ) phủ lên ảnh nền; `DeliverySchedule` trong `BaseBottomSheet` render các `DayGroup` (mỗi nhóm: WAREHOUSE lên đầu, COMPLETED xuống cuối); `EmptyAllDays` khi không có gì.

**`BaseSegmentedTabs`:** tab có thanh trượt, tính vị trí bằng `offsetLeft` + `offsetWidth` trong `useEffect`.

```tsx
const tabs: SegmentedTabItem[] = [
  { key: "warehouse", label: "倉庫受付" }, { key: "es", label: "ES配送便" }, { key: "cool", label: "COOL便" },
];
<BaseSegmentedTabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
```

`DeliveryTab` (`delivery/_components/DeliveryTab.tsx`) là biến thể có badge đếm số.

---

## 17. Checklist thêm trang mới

- [ ] Tạo thư mục `src/pages/<domain>/`.
- [ ] Thêm lazy import + route vào `routes/index.tsx`; thêm path vào `constants/route.ts`.
- [ ] Cần API mới → `services/client/<domain>.service.ts`; endpoint **không có prefix `/admin/`**, xác nhận với BE trước.
- [ ] Login là `driverCode`; ME là `/account/me`.
- [ ] UI: shadcn/ui + `components/Common/*`; không import `antd`.
- [ ] State mới → store zustand mới; toast → `sonner`; mutation → `useMutationCustom`.
- [ ] Icon SVG → `?react`.
- [ ] Trang chi tiết toàn màn hình → `PageLayout`; trang chính → `BaseBottomSheet`.
- [ ] Modal giữa → `BaseCenterModal`; modal đáy → `ModalBottom`.
