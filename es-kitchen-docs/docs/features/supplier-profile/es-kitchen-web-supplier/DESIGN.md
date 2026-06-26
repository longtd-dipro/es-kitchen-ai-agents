# DESIGN: Supplier My Page — es-kitchen-web-supplier

## 1. Tổng quan thay đổi

| Layer | File | Loại thay đổi |
|---|---|---|
| Route constant | `src/constants/route.ts` | Sửa — thêm `PROFILE: "/profile"` |
| Nav constant | `src/constants/nav.ts` | Sửa — thêm item プロフィール |
| Service | `src/services/client/profile.service.ts` | Thêm mới |
| Page component | `src/pages/profile/ProfilePage.tsx` | Thêm mới |
| Router | `src/routes/index.tsx` | Sửa — đăng ký route `/profile` trong AuthLayout |

---

## 2. Database Changes

Không áp dụng — FE không trực tiếp thao tác DB.

### Redis Cache

Không áp dụng.

---

## 3. API Definition

> Copy từ DESIGN.md của `es-kitchen-api`. FE dùng trực tiếp phần này.

**Base URL:** `import.meta.env.VITE_API_BASE_URL` — xem `src/config.ts` → `serverConfig.api_server_url`.

### Endpoints FE gọi

| Method | Endpoint | Auth | Request | Response | Error codes |
|---|---|---|---|---|---|
| GET | `/supplier/account/me` | JWT (Bearer header) | — | `SupplierMeResponse` | 401 |
| PATCH | `/supplier/account/profile` | JWT (Bearer header) | `{ supplierName: string, email: string }` | `{ success: true }` | 400, 401, 409 |

**Response DTO — GET /supplier/account/me (fields FE render):**

```
id:           string       — không hiển thị trực tiếp
supplierCode: string       — read-only label
supplierName: string|null  — editable khi ở edit mode
email:        string       — editable khi ở edit mode
status:       string       — không hiển thị trên UI Profile (per SPEC Out of Scope)
lastLoginAt:  string|null  — read-only, format "YYYY-MM-DD HH:mm JST" (FE format từ ISO string)
createdAt:    string       — không hiển thị trên UI Profile
```

**Request body — PATCH /supplier/account/profile:**

```
supplierName: string  — required, không rỗng
email:        string  — required, không rỗng, email format
```

**Error handling:**

| HTTP Code | Thông báo hiển thị |
|---|---|
| 400 | Lấy `error.response.data.message` từ BE (class-validator message) |
| 401 | Tự động logout — `clearAuthState()` dispatch bởi axios interceptor |
| 409 | Toast lỗi với message từ BE (email đã tồn tại) |
| 5xx | Toast lỗi generic từ `useMutationCustom` |

---

## 4. Service Layer (FE)

### File mới: `src/services/client/profile.service.ts`

```typescript
const APIs = {
  ME: "/account/me",
  UPDATE_PROFILE: "/account/profile",
};

export const fetchMyProfile = async (): Promise<IBaseApiResponse<SupplierProfileDto>>
export const updateProfile = async (data: { supplierName: string; email: string }): Promise<IBaseApiResponse<{ success: boolean }>>
```

> Pattern đồng nhất với `auth.service.ts` — dùng `API.get` / `API.patch` từ `@/services/client/api`.

### Type: `SupplierProfileDto`

Thêm vào file mới `src/models/profile.ts`:

```typescript
export interface SupplierProfileDto {
  id: string;
  supplierCode: string;
  supplierName: string | null;
  email: string;
  status: string;
  lastLoginAt: string | null;   // ISO 8601 string, FE format thành "YYYY-MM-DD HH:mm JST"
  createdAt: string;
}

export interface UpdateProfileFormData {
  supplierName: string;
  email: string;
}
```

> Không sửa `CurrentAdminDto` hay `AuthCurrentUser` trong `models/auth.ts` — blast radius quá rộng (`AuthBootstrap.tsx` dùng `CurrentAdminDto` để normalize user state vào Redux). `SupplierProfileDto` là type độc lập chỉ dùng trong `ProfilePage`.

---

## 5. Interface với repo khác (cross-repo)

FE gọi:
- `GET /supplier/account/me` — load dữ liệu profile
- `PATCH /supplier/account/profile` — submit cập nhật

Không có WebSocket. Không có Push notification.

---

## 6. Luồng xử lý chi tiết

### 6.1 View mode (khi mount)

```
ProfilePage mount
  → useQuery({ queryKey: ['supplier-profile'], queryFn: fetchMyProfile })
  → Hiển thị read-only fields: supplierCode, supplierName, email, lastLoginAt
  → Nút 編集 visible
```

### 6.2 Edit mode

```
User click 編集
  → setEditMode(true)
  → useForm defaultValues = { supplierName, email } từ data query
  → Input fields supplierName + email trở thành editable
  → Nút 保存 + キャンセル hiện ra, nút 編集 ẩn đi
```

### 6.3 Submit

```
User click 保存
  → handleSubmit(onSubmit) từ react-hook-form
  → Client validate: supplierName required + email required + email format
  → Nếu invalid: hiện error inline, không gọi API
  → Nếu valid: gọi PATCH /supplier/account/profile
      → useMutationCustom (skipAutoSuccessHandling: true)
      → Nếu success:
          message.success("保存しました")
          queryClient.invalidateQueries({ queryKey: ['supplier-profile'] })
          setEditMode(false)
      → Nếu lỗi:
          useMutationCustom tự show toast lỗi từ error.response.data.message
          Form giữ nguyên giá trị đang nhập
```

### 6.4 Cancel

```
User click キャンセル
  → reset() — khôi phục defaultValues từ data query
  → setEditMode(false)
  → Không gọi API
```

---

## 7. Component Structure

```
src/pages/profile/
└── ProfilePage.tsx       ← page component duy nhất (không cần tách sub-component do layout đơn giản)
```

**ProfilePage.tsx — các phần chính:**

- `useQuery` lấy profile data (queryKey: `['supplier-profile']`)
- `useForm` (react-hook-form + yupResolver) — schema validate `supplierName` + `email`
- `useMutationCustom` — gọi PATCH endpoint
- State `isEditMode: boolean` — toggle view/edit
- Layout: 1 card trắng, 4 rows (supplierCode, supplierName, email, lastLoginAt)

**Validation schema (yup):**

```typescript
// src/validation/schemas.ts — thêm vào file hiện có
export const updateProfileSchema = yup.object({
  supplierName: yup.string().required("仕入先名を入力してください。"),
  email: yup
    .string()
    .required("メールアドレスを入力してください。")
    .email("メールアドレスの形式が正しくありません。"),
});
```

**Existing components tái sử dụng:**

| Component | Import | Dùng cho |
|---|---|---|
| `BaseInput` | `@/components/Common` | supplierName, email input |
| `BaseButton` | `@/components/Common` | nút 編集 / 保存 / キャンセル |
| `BaseHeadingBreadcrumb` | `@/components/Common` | Page title + breadcrumb |
| `message` (antd) | `antd` | Toast success / error |

---

## 8. Route & Navigation

### Thêm vào `src/constants/route.ts`

```typescript
PROFILE: "/profile",
```

### Thêm vào `src/constants/nav.ts` — `NAV_ITEMS`

```typescript
{
  key: "profile",
  labelJa: "プロフィール",
  icon: UserIcon,   // dùng icon User từ @phosphor-icons/react
  href: ROUTE.PROFILE,
},
```

> Vị trí trong menu: thêm trước item "その他" (OtherPage) — per thứ tự tự nhiên sidebar E04.

### Thêm vào `src/routes/index.tsx` — trong AuthLayout children

```typescript
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
// trong AuthLayout children array:
{ path: ROUTE.PROFILE, element: withSuspense(<ProfilePage />) },
```

---

## 9. Non-Regression Risks

| Tính năng hiện có | File liên quan | Rủi ro |
|---|---|---|
| `GET /account/me` đang dùng trong `auth.service.ts` → `fetchCurrentAdmin` | `src/services/client/auth.service.ts` | `auth.service.ts` giữ nguyên. `profile.service.ts` mới sẽ gọi cùng endpoint `/account/me` — không conflict. FE có 2 nơi gọi cùng endpoint với queryKey khác nhau nên không ảnh hưởng nhau. |
| Nav hiện tại 4 items (TOP, 受注一覧, 注文管理, その他) | `src/constants/nav.ts` | Thêm item mới プロフィール — không xóa/sửa item cũ. Kiểm tra layout sidebar không bị overflow khi có 5 items. |
| Route `*` fallback về `/login` | `src/routes/index.tsx` | Route mới `/profile` đăng ký trong `RequireAuth` — không conflict với wildcard. |
| `changePassword` route đang comment trong nav | `src/constants/nav.ts` | Không liên quan — giữ nguyên comment. |
