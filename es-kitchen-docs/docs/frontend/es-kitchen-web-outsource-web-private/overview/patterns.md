# es-kitchen-web-outsource-web-private — Patterns & Conventions

> Repo này được scaffold từ cùng template với `es-kitchen-web-admin` — **dependencies giống hệt** (cùng version React 19.2, RTK 2.12, TanStack Query 5.10, Ant Design 6.4, react-hook-form 7.76, yup 1.7).
>
> **Pattern chính → tham chiếu `frontend/es-kitchen-web-admin/overview/patterns.md`** (single source of truth). File này chỉ note những điểm **khác biệt** hoặc **ràng buộc riêng** của repo Outsource/Internal Web.

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
| Build tool | Vite | **8** | Khác web-admin (Vite 7) — kiểm tra plugin compatibility khi nâng cấp |

---

## Khác biệt với web-admin

| Khía cạnh | web-admin (E03) | outsource-web-private (E05) |
|---|---|---|
| Vite version | 7 | **8** (newer) |
| Domain prefix | `/admin/*` | `/operation/*` (tentative — confirm trước implement) |
| Permission scope | Toàn hệ thống | Giới hạn account/sales scope |
| User type | System admin (full power) | Operation staff (giới hạn theo role) |

---

## Ràng buộc riêng

### 1. Endpoint domain

Endpoint của Outsource Web phải prefix theo domain `operation` hoặc `internal` (xác nhận với BE Tech Lead khi implement feature đầu tiên):

```typescript
// ✅ Likely pattern
export const operationAccountService = {
  getAccounts: (params) => API.get('/operation/accounts', params),
};

// ❌ KHÔNG dùng /admin/* — đó là E03 System Admin
```

### 2. Auth flow

Login endpoint sẽ là `POST /operation/auth/login` (cần SPEC riêng — đang waiting BA define). JWT payload phải verify đúng `role=operation` hoặc tương đương.

### 3. Permission boundary

Khác web-admin, repo này **không có quyền** can thiệp vào:
- System config / global settings
- Cross-company supplier data
- Mobile app version control
- Maintain mode

Khi implement feature → confirm với PM về **permission boundary** trước khi viết DESIGN. Frontend phải có guard ngăn user truy cập route không thuộc scope của họ.

### 4. Vite 8 lưu ý

Repo này dùng Vite 8 (mới hơn web-admin Vite 7). Khi tham chiếu config:
- Một số plugin có thể có API khác
- HMR behavior có thể đổi
- Kiểm tra `vite.config.ts` để xem custom config

### 5. Component reuse

27 `Base*` components trong `components/Common/` được scaffold giống template. Khi sửa logic:
- **Không tự sync** sang repo khác
- Nếu cần shared component cross-repo → đề xuất tách thành package `@eskitchen/ui` (cần PM approve)

### 6. Test coverage

`package.json` script `test` hiện là `echo "No tests configured" && exit 0`. Khi implement feature đầu tiên:
- Setup Jest + React Testing Library + msw
- Coverage target: ≥ 70% cho component critical path

---

## Implementing feature mới — checklist

Khi bắt đầu task implementation từ `features/<feature>/es-kitchen-web-outsource-web-private/tasks/task-X-Y.md`:

1. Đọc DESIGN.md cùng folder để hiểu API contract
2. Tạo service file mới trong `services/client/` với prefix `/operation/*` (hoặc theo SPEC)
3. Tạo page mới trong `pages/<feature>/` theo pattern `page.tsx + [id]/page.tsx + components/`
4. Add route vào `routes/index.tsx` với `withSuspense()` + lazy loading
5. Add route constant vào `constants/route.ts`
6. Form: react-hook-form + yup, schema trong `validation/`
7. Server state: TanStack Query v5 (object syntax)
8. Client state (nếu có): Redux slice trong `stores/reducers/`
9. **Permission guard** — confirm với PM trước khi mở route mới

---

## Trigger Tech Lead khi cần update overview

```
"Hãy là Tech Lead, cập nhật overview docs cho repo es-kitchen-web-outsource-web-private"
```
