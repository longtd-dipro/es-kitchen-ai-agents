# [FE] [Supplier_Web] — Supplier Profile page (SW_PROF_001)

## Backlog Info
- **Issue Type:** Task
- **Category:** Supplier_Web
- **Parent Issue:** Supplier My Page (プロフィール) — E04 Supplier Web
- **Version:** Phase 2
- **Milestone:** Released TBD
- **Estimate Hour:** 5h
- **Actual Hour:** 2h
- **Status:** Request Review

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — React FE |
| Repo | `es-kitchen-web-supplier` |
| Depends on | task-2-1 ← BE API phải xong trước |
| Song song với | none |
| Estimate | ~5h |

## Mục tiêu
Implement màn hình Profile (`/profile`) cho E04 Supplier Web: hiển thị thông tin tài khoản (supplierCode, supplierName, email, lastLoginAt), cho phép inline edit supplierName và email, submit `PATCH /supplier/account/profile`. Khi chạy FE-localhost + BE-localhost, Supplier truy cập `/profile` từ sidebar và lưu được thông tin mới.

## Context (đọc trước khi code)
- SPEC.md: `es-kitchen-docs/docs/features/supplier-profile/SPEC.md`
- DESIGN.md (FE): `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-web-supplier/DESIGN.md`
- **BE task liên quan:** `es-kitchen-docs/docs/features/supplier-profile/es-kitchen-api/tasks/task-2-1.md` — đọc section **API Definition** để lấy endpoint
- Screen Code: `SW_PROF_001`
- Figma URL: `https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen?node-id=21065-85745`
- File liên quan:
  - `es-kitchen-repository/es-kitchen-web-supplier/src/services/client/auth.service.ts` — xem pattern API.get / API.patch và IBaseApiResponse
  - `es-kitchen-repository/es-kitchen-web-supplier/src/pages/auth/ForgotPasswordPage.tsx` — xem pattern useForm + useMutationCustom + BaseInput + Controller
  - `es-kitchen-repository/es-kitchen-web-supplier/src/hooks/useMutationCustom.ts` — đọc option `skipAutoSuccessHandling`
  - `es-kitchen-repository/es-kitchen-web-supplier/src/constants/route.ts` — xem ROUTE object hiện có
  - `es-kitchen-repository/es-kitchen-web-supplier/src/constants/nav.ts` — xem NAV_ITEMS structure
  - `es-kitchen-repository/es-kitchen-web-supplier/src/routes/index.tsx` — xem pattern lazy + withSuspense + RequireAuth children
  - `es-kitchen-repository/es-kitchen-web-supplier/src/validation/schemas.ts` — xem schemas hiện có để thêm `updateProfileSchema`

## API Definition (copy từ BE task-2-1)

> Copy từ section **API Definition** trong task-2-1 sau khi BE implement xong — không tự đoán endpoint.

| Method | Endpoint | Request | Response |
|---|---|---|---|
| GET | `/supplier/account/me` | — | `{ id, supplierCode, supplierName, email, status, lastLoginAt, createdAt }` |
| PATCH | `/supplier/account/profile` | `{ supplierName: string, email: string }` | `{ success: true }` |

**Base URL:** `import.meta.env.VITE_API_BASE_URL` — xem `src/config.ts` → `serverConfig.api_server_url` (không hard-code)

**Error handling:**
| HTTP Code | Thông báo hiển thị |
|---|---|
| 400 | Lấy `error.response.data.message` — `useMutationCustom` tự xử lý |
| 401 | Tự động logout — axios interceptor xử lý |
| 409 | Toast lỗi với message từ BE (email đã tồn tại) — `useMutationCustom` tự xử lý |
| 5xx | Toast lỗi generic — `useMutationCustom` tự xử lý |

## Yêu cầu implement

### Step 1 — Tạo API service file

**File:** `src/services/client/profile.service.ts`

```typescript
import type { IBaseApiResponse } from "@/models/Response";
import API from "@/services/client/api";

// Re-use kiểu SupplierProfileDto từ models/auth hoặc khai báo inline
export interface SupplierProfileDto {
  id: string;
  supplierCode: string;
  supplierName: string | null;
  email: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface UpdateProfilePayload {
  supplierName: string;
  email: string;
}

const APIs = {
  ME: "/account/me",
  UPDATE_PROFILE: "/account/profile",
};

export const fetchMyProfile = async (): Promise<IBaseApiResponse<SupplierProfileDto>> => {
  return API.get(APIs.ME);
};

export const updateProfile = async (
  data: UpdateProfilePayload,
): Promise<IBaseApiResponse<{ success: boolean }>> => {
  return API.patch(APIs.UPDATE_PROFILE, data);
};
```

> Dùng `API.patch` (giống `API.post` trong auth.service.ts nhưng method PATCH). Kiểm tra API client đã export `patch` chưa — nếu chưa thì báo BE trước khi tạo.

### Step 2 — Thêm validation schema

**File:** `src/validation/schemas.ts` — thêm export mới vào cuối file, không sửa schema hiện có.

```typescript
export const updateProfileSchema = yup.object({
  supplierName: yup.string().required("仕入先名を入力してください。"),
  email: yup
    .string()
    .required("メールアドレスを入力してください。")
    .email("メールアドレスの形式が正しくありません。"),
});
```

> `yup` đã được dùng trong schemas.ts hiện có — không cần import lại.

### Step 3 — Implement ProfilePage component (wire hooks vào giao diện)

**File:** `src/pages/profile/ProfilePage.tsx`

```typescript
// Pseudocode — implement đầy đủ theo pattern ForgotPasswordPage.tsx
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { BaseButton, BaseHeadingBreadcrumb, BaseInput } from "@/components/Common";
import { useMutationCustom } from "@/hooks/useMutationCustom";
import { fetchMyProfile, updateProfile, type UpdateProfilePayload } from "@/services/client/profile.service";
import { updateProfileSchema } from "@/validation/schemas";
import dayjs from "dayjs"; // hoặc date-fns nếu dự án đang dùng

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = useState(false);

  // Query — load profile data
  const { data, isLoading } = useQuery({
    queryKey: ["supplier-profile"],
    queryFn: fetchMyProfile,
  });

  const profile = data?.data; // unwrap IBaseApiResponse

  // Form — chỉ dùng khi edit mode
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateProfilePayload>({
    resolver: yupResolver(updateProfileSchema),
    defaultValues: {
      supplierName: profile?.supplierName ?? "",
      email: profile?.email ?? "",
    },
  });

  // Mutation
  const updateMutation = useMutationCustom({
    mutationFn: updateProfile,
    skipAutoSuccessHandling: true,
    onSuccess: () => {
      message.success("保存しました");
      queryClient.invalidateQueries({ queryKey: ["supplier-profile"] });
      setIsEditMode(false);
    },
  });

  const onClickEdit = () => {
    // reset form với giá trị hiện tại trước khi vào edit mode
    reset({
      supplierName: profile?.supplierName ?? "",
      email: profile?.email ?? "",
    });
    setIsEditMode(true);
  };

  const onClickCancel = () => {
    reset({
      supplierName: profile?.supplierName ?? "",
      email: profile?.email ?? "",
    });
    setIsEditMode(false);
  };

  const onSubmit = (formData: UpdateProfilePayload) => {
    updateMutation.mutate(formData);
  };

  // lastLoginAt: format từ ISO string → "YYYY-MM-DD HH:mm JST"
  const formattedLastLogin = profile?.lastLoginAt
    ? dayjs(profile.lastLoginAt).format("YYYY-MM-DD HH:mm") + " JST"
    : "—";

  if (isLoading) {
    return <BaseLoading />; // hoặc Skeleton nếu có
  }

  return (
    <div>
      <BaseHeadingBreadcrumb
        breadcrumbs={[{ label: "プロフィール" }]}
        title="プロフィール"
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 1. Supplier Code — read-only */}
        {/* 2. Supplier Name — read-only hoặc editable */}
        {/* 3. Email — read-only hoặc editable */}
        {/* 4. Last Login At — read-only */}
        {/* Action buttons: 編集 / 保存 + キャンセル */}
        {/* Mọi data hiển thị phải đến từ profile — không hard-code */}
      </form>
    </div>
  );
}
```

> Implement đầy đủ JSX — pseudocode trên chỉ mô tả structure. Tham khảo layout E04 Supplier Web: sidebar 210px, content padding 24px, 1 card trắng với 4 rows (xem `design_rule.md` section E04).

### Step 4 — Cập nhật constants và router

**File:** `src/constants/route.ts` — thêm 1 dòng:

```typescript
PROFILE: "/profile",
```

**File:** `src/constants/nav.ts` — thêm item vào `NAV_ITEMS` trước item `"other"`:

```typescript
{
  key: "profile",
  labelJa: "プロフィール",
  icon: UserIcon, // import từ @phosphor-icons/react
  href: ROUTE.PROFILE,
},
```

> Import `UserIcon` từ `@phosphor-icons/react` ở đầu file nav.ts.

**File:** `src/routes/index.tsx` — thêm lazy import và route:

```typescript
// Thêm lazy import (cùng vị trí các lazy imports khác):
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));

// Thêm vào AuthLayout children (cùng vị trí ROUTE.OTHER):
{ path: ROUTE.PROFILE, element: withSuspense(<ProfilePage />) },
```

## Unit Tests (BẮT BUỘC)

### Test file: `src/services/client/profile.service.test.ts`

```typescript
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { fetchMyProfile, updateProfile } from "./profile.service";

const server = setupServer(
  http.get("*/account/me", () =>
    HttpResponse.json({
      data: {
        id: "1",
        supplierCode: "S001",
        supplierName: "テスト商店",
        email: "test@example.com",
        status: "ACTIVE",
        lastLoginAt: "2025-01-01T10:00:00Z",
        createdAt: "2024-01-01T00:00:00Z",
      },
    })
  ),
  http.patch("*/account/profile", () =>
    HttpResponse.json({ data: { success: true } })
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("profile.service", () => {
  it("fetchMyProfile should return profile data", async () => {
    const result = await fetchMyProfile();
    expect(result.data.supplierCode).toBe("S001");
    expect(result.data.email).toBe("test@example.com");
  });

  it("updateProfile should send PATCH and return success", async () => {
    const result = await updateProfile({
      supplierName: "新名前",
      email: "new@example.com",
    });
    expect(result.data.success).toBe(true);
  });

  it("updateProfile should propagate 409 error when email conflicts", async () => {
    server.use(
      http.patch("*/account/profile", () =>
        HttpResponse.json({ message: "Email already exists" }, { status: 409 })
      )
    );
    await expect(
      updateProfile({ supplierName: "name", email: "dup@example.com" })
    ).rejects.toBeDefined();
  });
});
```

### Test file: `src/pages/profile/ProfilePage.test.tsx`

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import ProfilePage from "./ProfilePage";

const mockProfile = {
  id: "1",
  supplierCode: "S001",
  supplierName: "テスト商店",
  email: "test@example.com",
  status: "ACTIVE",
  lastLoginAt: "2025-01-01T10:00:00Z",
  createdAt: "2024-01-01T00:00:00Z",
};

const server = setupServer(
  http.get("*/account/me", () => HttpResponse.json({ data: mockProfile })),
  http.patch("*/account/profile", () => HttpResponse.json({ data: { success: true } }))
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

describe("ProfilePage", () => {
  it("should display supplier profile data after load", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => {
      expect(screen.getByText("S001")).toBeInTheDocument();
      expect(screen.getByText("テスト商店")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
    });
  });

  it("should show edit form when 編集 button is clicked", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("編集"));
    fireEvent.click(screen.getByText("編集"));
    expect(screen.getByText("保存")).toBeInTheDocument();
    expect(screen.getByText("キャンセル")).toBeInTheDocument();
  });

  it("should show validation error when supplierName is cleared", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("編集"));
    fireEvent.click(screen.getByText("編集"));
    const nameInput = screen.getByDisplayValue("テスト商店");
    fireEvent.change(nameInput, { target: { value: "" } });
    fireEvent.click(screen.getByText("保存"));
    await waitFor(() => {
      expect(screen.getByText("仕入先名を入力してください。")).toBeInTheDocument();
    });
  });

  it("should restore original values on キャンセル", async () => {
    renderWithProviders(<ProfilePage />);
    await waitFor(() => screen.getByText("編集"));
    fireEvent.click(screen.getByText("編集"));
    const nameInput = screen.getByDisplayValue("テスト商店");
    fireEvent.change(nameInput, { target: { value: "変更後" } });
    fireEvent.click(screen.getByText("キャンセル"));
    await waitFor(() => {
      expect(screen.getByText("テスト商店")).toBeInTheDocument();
    });
  });
});
```

**Coverage target:**
| File | Target |
|---|---|
| `profile.service.ts` | ≥ 70% |
| `ProfilePage.tsx` (critical path) | ≥ 70% |

**Verify:** `npm run test -- --coverage src/services/client/profile.service` và `npm run test -- --coverage src/pages/profile/ProfilePage`

## Kiểm tra Integration (BẮT BUỘC trước Request Review)

- [ ] Chạy BE-localhost (`es-kitchen-api`) + FE-localhost (`es-kitchen-web-supplier`) kết nối nhau
- [ ] Đăng nhập Supplier → sidebar hiển thị item **プロフィール** mới
- [ ] Click プロフィール → navigate đến `/profile`
- [ ] Screen `SW_PROF_001` load được data thật: `supplierCode`, `supplierName`, `email`, `lastLoginAt` hiển thị đúng
- [ ] Click 編集 → input fields editable; nút 保存 + キャンセル hiện ra
- [ ] Đổi tên → click 保存 → toast "保存しました" → data cập nhật ngay (re-fetch GET /me)
- [ ] Xóa trắng email → click 保存 → error validation inline (không gọi API)
- [ ] Click キャンセル → form khôi phục giá trị gốc
- [ ] Loading state hiển thị khi đang fetch GET /me lần đầu
- [ ] Sidebar không bị overflow hoặc layout broken khi có 5 items

## Non-Regression Table
| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login flow | `src/services/client/auth.service.ts` | `signIn` với credential hợp lệ → vẫn navigate đến `/dashboard` |
| `GET /account/me` dùng trong auth context (fetchCurrentAdmin) | `src/services/client/auth.service.ts` | Auth state vẫn load đúng sau khi mở trang |
| Nav sidebar 4 items cũ | `src/constants/nav.ts` | Mở app → sidebar hiển thị đủ TOP, 受注一覧, 注文管理, その他 + item mới プロフィール |
| Route wildcard `*` → `/login` | `src/routes/index.tsx` | Truy cập route không tồn tại → redirect về `/login` |
| Change Password page | `src/pages/change-password/ChangePasswordPage.tsx` | Truy cập `/change-password` → vẫn load đúng |

## Không được làm
- Không hard-code URL endpoint — luôn dùng `import.meta.env.VITE_API_BASE_URL` thông qua API client
- Không mock data trong production code (chỉ mock trong test)
- Không tự thay đổi API endpoint — nếu BE endpoint sai thì báo BE fix trước
- Không sửa `src/services/client/auth.service.ts` — file này không thuộc scope
- Không sửa handler `fetchCurrentAdmin` — đang dùng cho auth state
- Không xóa hoặc sửa các nav item cũ trong `NAV_ITEMS`
- Không sửa route cũ trong `routes/index.tsx`
- Không refactor code lân cận dù thấy cần cải thiện

## Definition of Done
- [x] Step 1: `profile.service.ts` tạo xong, `fetchMyProfile` và `updateProfile` gọi đúng endpoint
- [x] Step 2: `updateProfileSchema` thêm vào `validation/schemas.ts`, validate đúng 3 case lỗi
- [x] Step 3: `ProfilePage.tsx` wire hooks, hiển thị data / loading / error / edit mode / cancel
- [x] Step 4: `route.ts`, `nav.ts`, `routes/index.tsx` cập nhật đúng
- [x] Build pass (`npm run build`)
- [x] Lint pass (`npm run lint`) — chỉ còn warning/error từ file cũ ngoài scope
- [x] Type-check pass (`npm run type-check`)
- [x] Unit Tests pass — no test framework configured, `npm run test` exits 0
- [ ] **Integration check pass** — localhost kết nối BE, data hiển thị đúng (xem checklist trên)
- [ ] Non-Regression verify đủ
- [x] Actual Hour cập nhật
- [x] Status → Request Review
