# DESIGN: Guest Mode — es-kitchen-web-admin

> **Feature:** Guest Mode
> **Repo:** `es-kitchen-web-admin` (E03 System Admin Web)
> **SPEC:** `es-kitchen-docs/docs/features/guest-mode/SPEC.md`
> **Ngày tạo:** 2026-06-05
> **Tech Lead:** ngaht@dipro.vn

---

## 1. Tổng quan thay đổi

Scope E03 rất hẹp: chỉ thêm **1 toggle field** `guestPaymentAllowed` vào form **Edit Company** hiện có. Không tạo tab mới, không tạo trang mới, không tạo component mới.

| Layer | File | Loại thay đổi |
|---|---|---|
| Model | `src/models/company.ts` | Thêm field `guestPaymentAllowed` vào `CompanyBasicInfoDto` và `UpdateCompanyBasicInfoRequest` |
| Service | `src/services/client/company.service.ts` | Không đổi (đã có `updateCompanyBasicInfo` + `fetchCompanyBasicInfo`) |
| Page/Component | `src/pages/company-management/[id]/components/tabs/pricing-payment/` | Thêm Toggle Switch vào section phù hợp |

---

## 2. Database Changes

Không có database change ở repo này. Xem DESIGN API cho migration.

---

## 3. API Contract (consumed by E03)

E03 consume endpoint hiện có — chỉ thêm field mới:

**`GET /companies/:id/basic-info`** — response thêm:
```json
{
  "data": {
    "id": "1",
    "companyCode": "COMP001",
    "name": "株式会社サンプル",
    "isCashPaymentAllowed": true,
    "guestPaymentAllowed": true,
    ...
  }
}
```

**`PATCH /companies/:id/basic-info`** — request body thêm:
```json
{
  "guestPaymentAllowed": true
}
```

**Không có endpoint mới** — toggle submit cùng với form Edit Company hiện có (AC-06-5).

---

## 4. Model Changes

**File:** `src/models/company.ts`

### 4.1 Thêm vào `CompanyBasicInfoDto`

```typescript
export interface CompanyBasicInfoDto {
  id: string;
  companyCode: string;
  name: string;
  nameKana: string | null;
  employeeCount: string | null;
  status: CompanyStatusCode;
  isCashPaymentAllowed: boolean;
  guestPaymentAllowed: boolean;   // THÊM MỚI
  orderLimit: string | null;
  userMonthlyLimit: number | null;
  customerNote: string | null;
  address: CompanyAddressDto;
}
```

### 4.2 Thêm vào `UpdateCompanyBasicInfoRequest`

```typescript
export interface UpdateCompanyBasicInfoRequest {
  name?: string;
  nameKana?: string;
  employeeCount?: string;
  status?: CompanyStatus;
  statusCode?: CompanyStatusCode;
  isCashPaymentAllowed?: boolean;
  guestPaymentAllowed?: boolean;   // THÊM MỚI
  orderLimit?: string | null;
  userMonthlyLimit?: number | null;
  customerNote?: string;
  customerPostalCode?: string;
  addressPrefecture?: string;
  addressCity?: string;
  addressStreet?: string;
  addressBuilding?: string;
  customerTel?: string;
  fax?: string;
}
```

---

## 5. Component / UI Layer

### 5.1 Vị trí Toggle trong form Edit Company

**Quyết định vị trí (US-06, AC-06-1):** Toggle đặt trong **tab/section hiện có gần Payment settings**. Dựa trên cấu trúc folder hiện có:

```
pages/company-management/[id]/components/tabs/pricing-payment/
```

Toggle "ゲスト支払いを許可する" đặt trong section này — cùng khu vực với `isCashPaymentAllowed` để nhất quán về UX (cả hai đều là payment policy).

### 5.2 Component pattern (không tạo mới)

Tái dùng pattern Toggle/Switch hiện có trong codebase. Form Edit Company dùng `react-hook-form` — thêm field mới vào form schema:

```typescript
// Trong form schema (yup)
guestPaymentAllowed: yup.boolean().required().default(true),
```

```tsx
// Trong form component
<Controller
  name="guestPaymentAllowed"
  control={control}
  render={({ field }) => (
    <FormItem label="ゲスト支払いを許可する">
      <Switch
        checked={field.value}
        onChange={field.onChange}
      />
    </FormItem>
  )}
/>
```

### 5.3 Default value

Khi form load (`fetchCompanyBasicInfo`): `guestPaymentAllowed = data.guestPaymentAllowed ?? true`

Default `true` xử lý trường hợp company cũ chưa có field (tương đương BR-05 + AC-06-2).

### 5.4 Form Submit

Không cần thay đổi flow submit. `updateCompanyBasicInfo(id, formData)` đã bao gồm toàn bộ form data. Field `guestPaymentAllowed` được spread cùng các fields khác.

---

## 6. State Management

**Không cần Redux slice mới.** Form state được quản lý bởi `react-hook-form` (local component state). Server state được quản lý bởi **TanStack Query v5** hiện có:

```typescript
// Fetch (existing query — không sửa queryKey)
const { data } = useQuery({
  queryKey: ['company', id, 'basic-info'],
  queryFn: () => fetchCompanyBasicInfo(id),
});

// Mutate (existing mutation — không sửa)
const mutation = useMutation({
  mutationFn: (data: UpdateCompanyBasicInfoRequest) =>
    updateCompanyBasicInfo(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['company', id, 'basic-info'] });
  },
});
```

Field `guestPaymentAllowed` tự động được include trong query response và mutation request — không cần logic riêng.

---

## 7. Interface với repo khác

| API | Direction | Ghi chú |
|---|---|---|
| `GET /companies/:id/basic-info` | E03 → API | Response thêm `guestPaymentAllowed` |
| `PATCH /companies/:id/basic-info` | E03 → API | Request body thêm `guestPaymentAllowed` |

**Thay đổi AC-06-4:** Khi Admin save form với `guestPaymentAllowed = false`, Mobile app sẽ nhận giá trị mới trong lần gọi `validateCompanyCode` tiếp theo. Không có WebSocket/realtime push — là pull-based (Mobile gọi API mỗi lần checkout).

---

## 8. Luồng xử lý chi tiết

```
Admin mở trang Company Detail → tab Basic Info / Pricing & Payment
  1. useQuery fetch GET /companies/:id/basic-info
  2. Form populate với data.guestPaymentAllowed (default true nếu field null)
  3. Admin toggle switch ON/OFF
  4. Admin bấm "Save" (form submit hiện có)
  5. useMutation gọi PATCH /companies/:id/basic-info { ...formData, guestPaymentAllowed: boolean }
  6. On success → invalidate query → form refresh với giá trị mới từ server
  7. Toast "保存しました" (success notification hiện có)
```

---

## 9. Non-Regression Risks

| Tính năng hiện có | File liên quan | Rủi ro |
|---|---|---|
| Form Edit Company Basic Info | `company-management/[id]/...` | Thêm field mới vào form schema — nếu yup schema strict thì existing valid submissions vẫn pass. Chỉ cần đảm bảo field mới có `default(true)`. Low risk |
| `fetchCompanyBasicInfo` / `updateCompanyBasicInfo` | `services/client/company.service.ts` | API service không thay đổi — request/response type interface thêm field optional. Backward compatible |
| `CompanyBasicInfoDto` — các component khác sử dụng | `models/company.ts` | Thêm field mới không break các component đang dùng `CompanyBasicInfoDto` (optional/additive change) |
| TypeScript strict mode | Toàn bộ repo | Nếu có component destructure `CompanyBasicInfoDto` và dùng exhaustive check → cần thêm `guestPaymentAllowed`. Cần scan usage của type này |

**Blast radius check cho `CompanyBasicInfoDto`:**
File `src/models/company.ts` được import tại `src/services/client/company.service.ts` và các form components trong `company-management/`. Thay đổi là **additive** (thêm optional field) → không break existing consumers.

---

## 10. Security Considerations

- Toggle chỉ accessible với **System Admin (E03)** — đã protected bởi `AdminGuard` hiện có trên API `PATCH /companies/:id/basic-info`.
- **Company Admin (E02) không có access** — không trong scope (Out of Scope trong SPEC).
- Không cần permission mới — role Admin đã đủ quyền modify company settings.

---

## 11. Migration & Rollout

Không có migration ở FE. Deploy sau khi API đã deploy và migration DB đã chạy.

**Rollout order:**
1. API deploy + migration → `guestPaymentAllowed` xuất hiện trong response
2. Web Admin deploy → Toggle hiển thị trong form
3. Mobile deploy → Guest feature available end-to-end

**Backward compat:** Nếu FE deploy trước API (không khuyến nghị), field `guestPaymentAllowed` undefined trong response → default `true` vẫn hoạt động đúng (per BR-05).

---

## 12. Open Questions cho Tech Lead Tasks

- **OQ-1:** Tab chứa Toggle — hiện tại folder `pricing-payment/` có `index.ts` (17 tokens). Cần xác nhận đây là tab Pricing & Payment trong Company Detail page hay chỉ là re-export. Nếu tab đó chưa render `isCashPaymentAllowed` thì cần xem tab nào đang render field này để đặt toggle đúng chỗ.
- **OQ-2:** Yup schema cho form Edit Company basic info hiện tại chưa được tìm thấy trong analysis. Dev cần locate file schema (`schema.ts` hoặc inline trong component) trước khi thêm field.
- **OQ-3:** `CompanyDetailFormValues` type (line ~165 trong `models/company.ts`) không có `guestPaymentAllowed`. Nếu form dùng type này → cần thêm. Cần thêm vào `CompanyDetailFormValues` nếu component sử dụng type đó.
