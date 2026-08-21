# es-kitchen-web-outsource-web-private — Patterns & Conventions

> Repo E05 — cùng stack với E04 (Vite 8 + AntD 6.4) nhưng có **pattern hook wrap TanStack Query per-domain**.

---

## Kế thừa từ E03 web-admin

Các pattern chung — xem `../es-kitchen-web-admin/overview/patterns.md`:

- #1 Lazy loading + Suspense
- #3 Redux chỉ cho client state (chỉ 1 slice `auth`)
- #4 TanStack Query v5 object syntax bắt buộc
- #5 `useMutationCustom`
- #6 Forms: react-hook-form + Yup
- #7 HTTP interceptors — không tự thêm token
- #8 API service pattern
- #10 Path aliases bắt buộc
- #11 `useTableParams`
- #13 `useUnsavedChangesGuard`
- #14 Toast — `react-toastify`
- #17 Named export
- #18 Env vars `VITE_*`

---

## Đặc thù E05

### 1. Custom hook wrap TanStack Query per-domain

E05 chuẩn hoá một hook cho mỗi domain query — thay vì gọi `useQuery` trực tiếp trong page.

```tsx
// hooks/useOrderRequests.ts
export const useOrderRequests = (params) => {
  return useQuery({
    queryKey: ['order-requests', params],
    queryFn: () => orderRequestService.list(params),
  });
};

// pages/orders/OrdersPage.tsx
const { data, isLoading } = useOrderRequests(params);
```

**Rule:** khi thêm resource mới → tạo `hooks/use<Resource>.ts` tương ứng, đừng viết `useQuery` inline trong page.

Các hook đang có: `useOrderRequests`, `useSchedule`, `useDeliveries`, `useDrivers`, `useFeeAreas`, `useCompanyProfile`, `useCompanyContacts`, `useAnnouncements`, `useCollectionReports`, `useDelivererRegister`.

### 2. Session expiry — hook + modal thay vì socket

E05 dùng `useSessionExpired()` + `SessionExpiredModal` — trigger từ axios response 401 (không dùng socket.io như E03). Đơn giản hơn nhưng không realtime.

### 3. 4 layout thay vì 3

Có thêm `PublicPageLayout` cho `/register` — khác `NonAuthLayout` về branding + CTA (registration là public workflow chính của E05, không phải phụ).

### 4. Chỉ 1 Redux slice

`auth` là slice duy nhất. Không tạo thêm — server data đưa vào TanStack Query.

### 5. Chart color safelist trong Tailwind

`tailwind.config` có safelist cho dynamic chart color (orange, green, yellow tones). Khi thêm chart mới cần color động → **add vào safelist**, không hard-code inline style.

---

## Theme màu

**Primary lime green `#8ACA0D`.**

> ⚠️ Màu này **KHÔNG có trong `.claude/rules/design_rule.md`** token table.

**Rule khi extend:**
- Không tự tạo shade `#8ACA0D` biến thể lung tung → xin design system owner define token trước.
- Component chung cross-repo → không dùng color-mode `admin` (orange) hoặc `company` (blue) — dùng hex trực tiếp, escape khỏi semantic layer.

---

## Không tự thêm

- ❌ Socket.IO — session monitoring dùng modal + axios interceptor
- ❌ Rich text — workflow đơn giản, không cần
- ❌ Chart library ngoài recharts (nếu cần chart, follow safelist pattern)
- ❌ Slice Redux mới cho data server — dùng TanStack Query
