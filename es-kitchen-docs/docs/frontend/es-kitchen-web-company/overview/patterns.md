# es-kitchen-web-company — Patterns & Conventions

> Đọc file này trước khi viết code React mới cho E02. Cùng stack với web-admin nhưng scope nghiệp vụ khác.

---

## Kế thừa từ E03 web-admin

E02 và E03 cùng React 19 · Vite 7 · AntD 6.2 · Redux Toolkit · TanStack Query v5. **Các pattern chung** — xem `../es-kitchen-web-admin/overview/patterns.md`, phần lớn áp dụng cho E02:

- #1 Lazy loading + Suspense
- #3 Redux chỉ cho client state
- #4 TanStack Query v5 object syntax bắt buộc
- #5 `useMutationCustom` cho mutation
- #6 Forms: react-hook-form + Yup (không dùng AntD `Form.Item` rules native)
- #7 HTTP interceptors — không tự thêm token
- #8 API service pattern (function export, không class)
- #10 Path aliases bắt buộc
- #11 `useTableParams`
- #13 `useUnsavedChangesGuard`
- #14 Toast — `react-toastify` cho global, AntD `message` cho modal-local
- #17 Named export component
- #18 Env vars `VITE_*`
- #19 Không dùng list

---

## Khác biệt với E03

### 1. Ít guard hơn — 2 tầng thay vì 3

E02 chỉ có `RequireAuth` + `PublicOnly`. **Không có `RequirePermission`** — mọi authenticated company admin đều thấy hết feature trong scope company (không RBAC nested).

Nếu tương lai thêm phân quyền trong E02 → cần thiết kế lại `RequirePermission` giống E03.

### 2. Không có socket session monitoring

E02 không dùng `useAdminSessionSocket()` — company admin không cần force logout từ server realtime. 401 detect qua axios response interceptor là đủ.

### 3. Layout có stats row

`AuthLayout.tsx` ở E02 có thêm **stats summary row (~60px)** trên đầu content — hiển thị KPIs của company. E03 không có.

### 4. Register flow riêng

E02 có `/register` public route với `RegisterLayout` riêng — E03 không cho self-register (admin do system tạo).

### 5. Post-reset flag qua sessionStorage

Sau khi reset password, flag `passwordJustReset=true` lưu trong `sessionStorage` (không persistent). Dùng để hiển thị notice trên trang login lần đầu sau reset. Không lưu qua cookie hoặc Redux.

---

## Không tự thêm

- ❌ Feature ngoài scope company (ví dụ quản lý deliverer, agency, supplier) — thuộc E03/E04/E05
- ❌ Rich text editor (TipTap) — E02 chưa có use case
- ❌ Chart library — E02 hiện dùng stats card đơn giản; nếu cần chart, phối hợp với PM/BA về nhu cầu thực

---

## Theme màu

**Primary orange `#FAA51D`** = `colors.primitives.orange.400` / `colors.semantics.admin.400`.

> **Lưu ý:** `colors.semantics.admin.*` là orange (dùng cho E02 Company Admin), `colors.semantics.company.*` là blue (dùng cho E03 System Admin và E06 Driver). Naming ngược với tên epic — đây là convention của ESKITCHEN design system.

Không tự đổi màu button/link primary — pass qua `AntdProvider` theme config trong `src/shared/theme/antd-theme.ts`.
