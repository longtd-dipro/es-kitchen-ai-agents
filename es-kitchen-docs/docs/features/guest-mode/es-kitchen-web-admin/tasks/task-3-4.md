# [FE] Admin_Web — React: Toggle "ゲスト支払いを許可する" trong Edit Company Form

## Backlog Info
- **Issue Type:** Task
- **Category:** Admin_Web
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 4h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — React FE |
| Repo | `es-kitchen-web-admin` |
| Depends on | task-2-4 (Contract Lock) |
| Song song với | task-3-1, task-3-2, task-3-3 |
| Estimate | ~4h |

## Mục tiêu

Thêm toggle field `guestPaymentAllowed` vào form **Edit Company** hiện có trong `es-kitchen-web-admin` (E03 — System Admin Web). Scope hẹp: chỉ sửa type model, thêm 1 field vào form schema và 1 Switch component. Không tạo tab mới, không tạo trang mới, không tạo endpoint mới.

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-web-admin/DESIGN.md` (toàn bộ)
- File liên quan:
  - `src/models/company.ts` — xem `CompanyBasicInfoDto` và `UpdateCompanyBasicInfoRequest` để thêm field mới đúng chỗ
  - `src/pages/company-management/[id]/components/tabs/pricing-payment/` — đây là vị trí đặt toggle (cùng section `isCashPaymentAllowed`)
  - `src/services/client/company.service.ts` — **KHÔNG cần sửa** — service đã có `fetchCompanyBasicInfo` và `updateCompanyBasicInfo`
  - Bất kỳ component nào render `isCashPaymentAllowed` trong form Edit Company — tìm để đặt toggle mới gần đó

**QUAN TRỌNG — Resolve trước khi code:**

DESIGN section 12 có 3 Open Questions chưa resolve:
1. **OQ-1:** Folder `pricing-payment/` — verify `index.ts` có phải là tab render `isCashPaymentAllowed` hay chỉ re-export. Mở file và kiểm tra trước khi thêm toggle.
2. **OQ-2:** Locate yup schema file cho form Edit Company basic info (`schema.ts` hoặc inline trong component). Tìm bằng `tilth_search("guestPaymentAllowed")` hoặc `tilth_search("isCashPaymentAllowed")` trong `pages/company-management`.
3. **OQ-3:** Kiểm tra xem `CompanyDetailFormValues` type có được dùng trong form không — nếu có thì cũng cần thêm `guestPaymentAllowed` vào type đó.

Developer phải resolve 3 OQ này trước khi bắt đầu code bằng cách đọc files liên quan.

## Yêu cầu implement

### 1. Sửa: `src/models/company.ts`

**Thêm vào `CompanyBasicInfoDto`:**
```typescript
export interface CompanyBasicInfoDto {
  // ... existing fields ...
  isCashPaymentAllowed: boolean;
  guestPaymentAllowed: boolean;    // THÊM MỚI
  // ...
}
```

**Thêm vào `UpdateCompanyBasicInfoRequest`:**
```typescript
export interface UpdateCompanyBasicInfoRequest {
  // ... existing fields ...
  isCashPaymentAllowed?: boolean;
  guestPaymentAllowed?: boolean;   // THÊM MỚI — optional
  // ...
}
```

**Thêm vào `CompanyDetailFormValues` nếu type này tồn tại và dùng trong form:**
```typescript
// Kiểm tra xem type này có field form values không
guestPaymentAllowed?: boolean;
```

### 2. Tìm và sửa: Form schema (yup) của Edit Company Basic Info

Sau khi locate file schema (OQ-2), thêm field:

```typescript
// Trong yup schema:
guestPaymentAllowed: yup.boolean().required().default(true),
```

### 3. Tìm và sửa: Component render `isCashPaymentAllowed` toggle/switch

Sau khi locate đúng component trong `pricing-payment/` (OQ-1), thêm toggle ngay sau `isCashPaymentAllowed`:

```tsx
// Sau <FormItem label="現金決済可否"> (isCashPaymentAllowed):
<Controller
  name="guestPaymentAllowed"
  control={control}
  render={({ field }) => (
    <Form.Item
      label="ゲスト支払いを許可する"
      tooltip="ゲストユーザーがこの会社でのチェックアウトを許可するかどうかを設定します"
    >
      <Switch
        checked={field.value ?? true}  // default true (BR-05)
        onChange={field.onChange}
      />
    </Form.Item>
  )}
/>
```

**Default value khi fetch company data:**

```typescript
// Trong form reset/defaultValues:
guestPaymentAllowed: data?.guestPaymentAllowed ?? true, // BR-05: default true cho company cũ
```

### 4. Verify: Form submit không cần sửa

`updateCompanyBasicInfo(id, formData)` đã bao gồm toàn bộ form data. Field `guestPaymentAllowed` được spread tự động theo cùng flow. Không cần sửa submit handler.

### 5. TypeScript strict check

Sau khi thêm field vào `CompanyBasicInfoDto`, chạy `npm run build` để detect bất kỳ component nào đang destructure type này mà có exhaustive check hoặc strict typing sẽ fail. Fix tất cả TypeScript errors trước khi submit PR.

## Unit Tests (BẮT BUỘC)

### Test file: `src/pages/company-management/[id]/components/tabs/pricing-payment/__tests__/PricingPaymentTab.test.tsx`

(Hoặc tên file test tương ứng theo convention của repo — xem các `*.test.tsx` file hiện có trong cùng folder)

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm } from 'react-hook-form';

// Wrapper component để test form field
const FormWrapper = ({ defaultValues }: { defaultValues?: Partial<CompanyBasicInfoDto> }) => {
  const { control } = useForm({ defaultValues: { guestPaymentAllowed: true, ...defaultValues } });
  return <PricingPaymentSection control={control} />;
};

describe('PricingPaymentTab — guestPaymentAllowed toggle', () => {
  it('should render "ゲスト支払いを許可する" toggle', () => {
    render(<FormWrapper />);
    expect(screen.getByText('ゲスト支払いを許可する')).toBeInTheDocument();
  });

  it('should default toggle to ON (true)', () => {
    render(<FormWrapper defaultValues={{ guestPaymentAllowed: true }} />);
    const toggle = screen.getByRole('switch', { name: /ゲスト支払いを許可する/i });
    expect(toggle).toBeChecked();
  });

  it('should render toggle as OFF when guestPaymentAllowed=false', () => {
    render(<FormWrapper defaultValues={{ guestPaymentAllowed: false }} />);
    const toggle = screen.getByRole('switch', { name: /ゲスト支払いを許可する/i });
    expect(toggle).not.toBeChecked();
  });

  it('should default to true when guestPaymentAllowed is null/undefined (old company)', () => {
    render(<FormWrapper defaultValues={{ guestPaymentAllowed: undefined }} />);
    const toggle = screen.getByRole('switch', { name: /ゲスト支払いを許可する/i });
    // default value = true per BR-05
    expect(toggle).toBeChecked();
  });

  it('should toggle state when clicked', () => {
    render(<FormWrapper defaultValues={{ guestPaymentAllowed: true }} />);
    const toggle = screen.getByRole('switch', { name: /ゲスト支払いを許可する/i });
    fireEvent.click(toggle);
    expect(toggle).not.toBeChecked();
  });
});
```

**Lưu ý:** Ant Design `Switch` component có thể render role `switch` khác nhau — xem codebase test hiện có để tìm pattern query selector đúng.

**Coverage target:**
| File | Target |
|---|---|
| Component chứa toggle (pricing-payment) | ≥ 70% |

**Verify:** `npm run test -- --coverage pricing-payment`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| `CompanyBasicInfoDto` consumers khác | `src/models/company.ts` | `npm run build` không có TypeScript error sau khi thêm field |
| Form Edit Company submit các field cũ | Form component | Unit test: submit form với `guestPaymentAllowed` undefined → không crash, gọi API đúng |
| `isCashPaymentAllowed` toggle hiện có | pricing-payment component | Toggle cũ vẫn render và hoạt động sau khi thêm toggle mới |
| TanStack Query cache invalidation | `useQuery` cho `company/${id}/basic-info` | Sau save → query invalidate → form refresh với giá trị mới từ server |

## Không được làm

- Không tạo tab mới, trang mới, hoặc endpoint mới — AC-06-1, AC-06-5
- Không thêm custom API call riêng cho toggle — gọi cùng với form submit hiện có
- Không sửa `company.service.ts` trong FE — service layer không cần thay đổi
- Không sửa Company List page, Company Create page — ngoài scope
- Không refactor form schema hiện có — chỉ thêm 1 field mới
- Không sửa E02 (Company Admin) — Out of Scope trong SPEC

## Definition of Done

- [ ] Build pass (`npm run build`)
- [ ] Lint pass (`npm run lint`)
- [ ] Unit Tests pass — coverage đạt target (≥ 70%)
- [ ] Toggle hiển thị đúng vị trí trong form Edit Company (gần `isCashPaymentAllowed`)
- [ ] Default value = ON (true) khi mở form cho company cũ (không có field) — AC-06-2
- [ ] Bật/tắt toggle → Save → API nhận `guestPaymentAllowed: boolean` đúng giá trị — AC-06-3
- [ ] TypeScript: `npm run build` không có lỗi type mới liên quan đến `guestPaymentAllowed`
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
