# es-kitchen-web-supplier — Patterns & Conventions

> Repo E04 — cùng template với E03/E02 nhưng dùng **Vite 8 + AntD 6.4** (mới hơn) và có **fake data services** phục vụ dev offline.

---

## Kế thừa từ E03 web-admin

Đa số pattern áp dụng nguyên vẹn — xem `../es-kitchen-web-admin/overview/patterns.md`:

- #1 Lazy loading + Suspense
- #3 Redux chỉ cho client state
- #4 TanStack Query v5 object syntax bắt buộc
- #5 `useMutationCustom` cho mutation
- #6 Forms: react-hook-form + Yup
- #7 HTTP interceptors — không tự thêm token
- #8 API service pattern
- #10 Path aliases bắt buộc
- #11 `useTableParams`
- #13 `useUnsavedChangesGuard`
- #14 Toast — `react-toastify`
- #17 Named export
- #18 Env vars `VITE_*`
- #19 Không dùng list

---

## Đặc thù E04

### 1. Fake data services — `*.fake.ts`

Repo có sẵn `<service>.fake.ts` bên cạnh `<service>.service.ts` để chạy offline khi API chưa sẵn sàng. **Rule:**

- Khi API thật sẵn sàng → **swap** import từ `.fake` sang `.service`, xoá file `.fake`. Không giữ song song trong production.
- Không viết thêm `.fake` cho service mới nếu API đã stable.
- `.fake.ts` chỉ return static data — không mô phỏng error state phức tạp.

### 2. Vite 8 — cẩn thận với plugin ecosystem

Vite 8.0.13 mới hơn E02/E03 (Vite 7). Khi copy plugin config từ E02/E03 → check version constraint. Ví dụ `vite-plugin-svgr` phiên bản 5.x mới compat với Vite 8.

### 3. AntD 6.4 — breaking change từ 6.2

E04 dùng AntD `6.4.2`. Component API có thể khác `6.2.x` (E02/E03) — check migration guide khi share component cross-repo.

### 4. Không có socket session

Giống E02: `use*SessionSocket` không có. Session quản lý qua 401 response.

### 5. Layout tối giản

Sidebar E04 chỉ 3–4 mục (TOP, 受注一覧, パスワード変更, その他). Không dùng accordion đa cấp như E03.

### 6. Chỉ 1 Redux slice

`auth` là slice duy nhất. Mọi server data đưa vào TanStack Query. Không tạo thêm slice cho page-level state — dùng `useState` hoặc URL param.

---

## Theme màu

**Primary purple `#6639BA`** = `colors.primitives.purple.600`.

> **Lưu ý:** purple **KHÔNG có trong `colors.semantics.*`** — dùng primitive trực tiếp. Khi tạo component chung cross-repo, cẩn thận vì purple là màu độc quyền E04.

---

## Không tự thêm

- ❌ Rich text editor — E04 workflow đơn giản, không cần
- ❌ Chart library — chưa có dashboard cần chart
- ❌ Drag-drop — không có bảng cần reorder trong scope hiện tại
- ❌ Socket.IO — order update dùng polling qua TanStack Query
