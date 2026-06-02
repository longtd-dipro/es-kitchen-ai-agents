# es-kitchen-web-supplier — Patterns & Conventions

> Repo này được scaffold từ cùng template với `es-kitchen-web-admin` — **dependencies giống hệt** (cùng version React 19.2, Vite, RTK 2.12, TanStack Query 5.10, Ant Design 6.4, react-hook-form 7.76, yup 1.7).
>
> **Pattern chính → tham chiếu `frontend/es-kitchen-web-admin/overview/patterns.md`** (single source of truth). File này chỉ note những điểm **khác biệt** hoặc **ràng buộc riêng** của repo Supplier.

---

## Stack reference

| Layer | Library | Version | Pattern doc |
|---|---|---|---|
| HTTP client | Axios | 1.16 | [web-admin patterns — HTTP Client](../../es-kitchen-web-admin/overview/patterns.md#http-client-pattern) |
| Server state | TanStack Query | 5.10 | [web-admin patterns — TanStack Query](../../es-kitchen-web-admin/overview/patterns.md#tanstack-query-pattern-v5) |
| Client state | Redux Toolkit | 2.12 | [web-admin patterns — Redux Toolkit](../../es-kitchen-web-admin/overview/patterns.md#redux-toolkit-pattern-v2) |
| Routing | react-router-dom | 7.15 | [web-admin patterns — Routing](../../es-kitchen-web-admin/overview/patterns.md#routing-pattern) |
| Forms | react-hook-form + yup | 7.76 / 1.7 | [web-admin patterns — Form](../../es-kitchen-web-admin/overview/patterns.md) — section "Form Pattern" |
| UI | Ant Design + TailwindCSS | 6.4 / 4.3 | [web-admin patterns — Ant Design v6](../../es-kitchen-web-admin/overview/patterns.md) — section "Ant Design v6" |
| Auth tokens | js-cookie | 3.0 | Cookie storage (KHÔNG localStorage) |

---

## Khác biệt với web-admin

| Khía cạnh | web-admin (E03) | web-supplier (E04) |
|---|---|---|
| Stage | Đầy đủ 24 routes, 13 services | Scaffold — 6 routes, 5 services |
| Domain | System Admin — quản trị toàn hệ thống | Supplier — quản lý menu, nhận đơn |
| Locale | `'Accept-Language': 'ja'` | Inherit — kiểm tra `services/http/` trước khi đổi |
| Permission model | Operation vs User accounts | Supplier account (single role) — sẽ mở rộng theo SPEC |

---

## Ràng buộc riêng

### 1. Domain trong service file

Endpoint của Supplier phải prefix `/supplier/`:

```typescript
// ✅ services/client/order.service.ts (sau khi implement)
export const orderService = {
  getOrders: (params) => API.get('/supplier/orders', params),
  acceptOrder: (id) => API.post(`/supplier/orders/${id}/accept`),
};

// ❌ KHÔNG dùng /admin/* — đó là E03
```

### 2. Auth flow

Login endpoint: `POST /supplier/auth/login` (xem `features/supplier-authentication/`).

Cookie naming convention giống web-admin nhưng giá trị bearer token là token của supplier domain — backend phải verify đúng `role=supplier` trong JWT payload.

### 3. Component reuse

27 `Base*` components trong `components/Common/` được copy giống hệt web-admin. Khi sửa logic của 1 base component:
- **Không tự sync** sang web-admin
- Nếu cần fix bug ở base component, đề xuất tách thành package `@eskitchen/ui` shared (cross-repo refactor — cần PM approve)

### 4. Tailwind config

TailwindCSS v4 — config qua PostCSS (`postcss.config.js`), KHÔNG có file `tailwind.config.js` cũ. Theme tokens trong `shared/theme/`.

### 5. Test coverage

`package.json` script `test` hiện là `echo "No tests configured" && exit 0`. Khi implement feature đầu tiên cần test:
- Setup Jest + React Testing Library + msw (giống pattern web-admin sẽ có)
- Coverage target: ≥ 70% cho component critical path

---

## Implementing feature mới — checklist

Khi bắt đầu task implementation từ `features/<feature>/es-kitchen-web-supplier/tasks/task-X-Y.md`:

1. Đọc DESIGN.md cùng folder để hiểu API contract
2. Tạo service file mới trong `services/client/` (nếu chưa có)
3. Tạo page mới trong `pages/<feature>/` theo pattern `page.tsx + [id]/page.tsx + components/`
4. Add route vào `routes/index.tsx` với `withSuspense()` + lazy loading
5. Add route constant vào `constants/route.ts`
6. Form: react-hook-form + yup, schema trong `validation/`
7. Server state: TanStack Query v5 (object syntax)
8. Client state (nếu có): Redux slice trong `stores/reducers/`
9. Tuân thủ Ant Design v6 breaking changes — xem patterns.md của web-admin

---

## Trigger Tech Lead khi cần update overview

Khi repo này đã có thêm feature → outdated overview:

```
"Hãy là Tech Lead, cập nhật overview docs cho repo es-kitchen-web-supplier"
```
