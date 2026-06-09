# Designer Context — ESKITCHEN

> Context bắt buộc cho `designer-agent` mỗi lần chạy. Tổng hợp UI components, theme, naming conventions từ source code thực tế của 6 repos (1 mobile + 5 web).
> **Updated:** 2026-06-09 (extracted từ source code es-kitchen-repository/).

---

## 1. Tech Stack — Map per repo

| App | Repo | UI Stack | Trạng thái |
|---|---|---|---|
| **E01** Mobile | `es-kitchen-payment-app` | Flutter 3.x · hooks_riverpod 3.0.1 · auto_route 11 · flutter_screenutil · NotoSansJP | Production |
| **E02** Company Admin | `es-kitchen-web-company` | React 19 · AntD 6.2.2 · TanStack Query 5 · RTK 2 · TailwindCSS 4 · react-hook-form + Yup | Production |
| **E03** System Admin | `es-kitchen-web-admin` | React 19 · AntD 6.2.2 · TanStack Query 5 · RTK 2 · TailwindCSS 4 · Phosphor Icons | Production |
| **E04** Supplier | `es-kitchen-web-supplier` | React 19 · AntD 6.4.2 · TanStack Query 5 · RTK 2 · TailwindCSS 4 · Phosphor Icons | Production |
| **E05** Outsource | `es-kitchen-web-outsource-web-private` | React 19 · Vite 8 · AntD 6.4.2 · RTK 2 · TailwindCSS 4 · Phosphor Icons | Production |
| **E06** Driver | `es-kitchen-webapp-driver` | React 19 · **shadcn/ui + Base UI** (KHÔNG AntD!) · Zustand 5 · Lucide Icons | Production |

> **Cảnh báo E06:** Driver app dùng **shadcn/ui** (lowercase `button.tsx`) thay vì AntD. Khi thiết kế cho E06 trên Figma, **KHÔNG** dùng AntD components — phải dùng shadcn-style (rounded-2xl, lucide icons).

---

## 2. Color Theme thực tế per repo

| App | Primary color (code) | Mapping ESKITCHEN token | Note |
|---|---|---|---|
| E01 Mobile | `#CA9A04` + `#FAC215` (yellow/gold) | `colors.primitives.yellow.400` (`app.400`) | Gold tone, dùng cho CTAs |
| E02 Company | `#faa61f` (orange) | `colors.primitives.orange.400` (`admin.400`) | ⚠️ Slight diff với design_rule (#FAA51D) |
| E03 System Admin | `#0969DA` (blue) | `colors.semantics.company.500` | Matches design_rule |
| E04 Supplier | `#6639BA` (purple) — **CONFIRMED 2026-06-09** | `colors.primitives.purple.600` | Code production hiện = orange `#faa61f` (chưa migrate). Designer dùng purple cho mọi screen E04 mới. |
| E05 Outsource | `#8ACA0D` (lime green) | KHÔNG có trong token table — hardcoded | Brand color riêng |
| E06 Driver | `#0969DA` (info-500) | `colors.semantics.company.500` | Same as E03 |

**Semantic colors chung (tất cả repos):**
- Negative/Error: `#CF222E`
- Success: `#2DA44E`
- Warning: `#EAB308`
- Info: `#0969DA`
- Border: `#D0D7DE`
- Background light: `#F0F2F5` (web) / `#F6F8FA` (E01 mobile)

---

## 3. Shared Components — Library catalog

### 3.1 Web E02-E05 (cùng pattern Base*)

Tất cả nằm trong `src/components/Common/`. **30+ components có sẵn — Designer Agent phải REUSE, không vẽ lại.**

| Component | Folder | Variants / Props chính | Có ở repos |
|---|---|---|---|
| `BaseButton` | `BaseButton/` | `outlinePrimary`, `default`; size: h-10 (middle), h-12 (large) | E02·E03·E04·E05 |
| `BaseButtonAction` | `BaseButtonAction/` | Edit / Delete inline action | E02·E03·E04·E05 |
| `BaseButtonAuth` | `BaseButtonAuth/` | Auth screen primary button | E04·E05 |
| `BaseButtonDownload` | `BaseButtonDownload/` | CSV export button | E02·E03·E04·E05 |
| `BaseButtonUpload` | `BaseButtonUpload/` | File upload trigger | E04·E05 |
| `BaseButtonExport` | `BaseButtonExport/` | Excel/CSV export utility | E05 |
| `BaseInput` | `Fields/BaseInput/` | RHF integration | All |
| `BaseInputPassword` | `Fields/BaseInputPassword/` | Eye icon toggle | All |
| `BaseInputNumber` | `Fields/BaseInputNumber/` | Number input | E03 |
| `BaseTextArea` | `Fields/BaseTextArea/` | Multi-line input | All |
| `BaseSelect` | `Fields/BaseSelect/` | Dropdown + TanStack Query | All |
| `BaseInfiniteSelect` | `Fields/BaseInfiniteSelect/` | Searchable + infinite scroll | E03·E04 |
| `BaseDatePicker` | `Fields/BaseDatePicker/` | dayjs-based | All |
| `BaseDateFilter` | `Fields/BaseDateFilter/` | Date range filter | E03·E04 |
| `BaseOTPInput` | `Fields/BaseOTPInput/` | OTP code input | E03 |
| `BaseTable` | `BaseTable/` | Pagination + sorting (ITableParams hook); row 54px | All |
| `BaseTableEdit` | `BaseTableEdit/` | Inline editable | All |
| `ChangeHistoryTable` | `ChangeHistoryTable/` | Change log table | E03 |
| `BaseModal` | `BaseModal/` | AntD Modal wrapper | All |
| `BaseModalConfirm` | `BaseModalConfirm/` | Confirm dialog | All |
| `DiscardChangesModal` | `DiscardChangesModal/` | Unsaved changes warning | E03 |
| `BaseBadgeStatus` | `BaseBadgeStatus/` | Status pill (neutral/success/rose/blue bg) | All |
| `BaseLoading` | `BaseLoading/` | Full page spinner | All |
| `BaseSpinner` | `BaseSpinner/` | Component-level spinner | E04·E05 |
| `BaseLabel` | `BaseLabel/` | Form label | All |
| `BaseErrorForm` | `BaseErrorForm/` | Validation error display | E04·E05 |
| `BaseCollapseSection` | `BaseCollapseSection/` | Accordion section | All |
| `BaseStep` | `BaseStep/` | Multi-step wizard | All |
| `BaseUploadFile` | `BaseUploadFile/` | File upload với validation | All |
| `BaseImageSelection` | `BaseImageSelection/` | Image picker | E03·E05 |
| `BaseSortDropdownField` | `BaseSortDropdownField/` | Sort order selector | E05 |
| `BaseHeadingBreadcrumb` | `BaseHeadingBreadcrumb/` | Page title + breadcrumb | All |
| `Nav` | `Nav/` | Sidebar nav (210px expanded, 80px collapsed) | All |
| `Header` | `Header/` | Top bar 54px (h-13.5) + user dropdown | All |
| `Layout` | `Layout/` | Header + children wrapper | E04·E05 |
| `AuthCard` | `AuthCard/` | Auth page card wrapper | E04 |
| `RequiredPermission` | `RequiredPermission/` | RBAC permission gate | E04·E05 |

### 3.2 Web E06 Driver (mobile-first, shadcn/ui)

Components trong `src/components/ui/` (shadcn primitives) và `src/components/Common/` (custom wrappers).

| Component | File | Mô tả |
|---|---|---|
| `Button` | `ui/button.tsx` | Variants: default, outline, ghost, destructive, link, icon. Sizes: xs/sm/lg/xl/icon |
| `Input` | `ui/input.tsx` | Standard + password-input variant |
| `Calendar` | `ui/calendar.tsx` | react-day-picker |
| `Checkbox` | `ui/checkbox.tsx` | Checkbox input |
| `Textarea` | `ui/textarea.tsx` | Multi-line |
| `Spinner` | `ui/spinner.tsx` | Loading indicator |
| `BaseBottomSheet` | `Common/BaseBottomSheet` | Card-like, `rounded-t-[24px]`, sticky footer above bottom nav |
| `PageLayout` | `Common/PageLayout` | Full-screen modal: header (back/title/home) + footer (2-button grid) |
| `PageHeader` | `Common/PageHeader` | Lightweight: back / center title / right action |
| `BaseAuthButton` | `Common/BaseAuthButton` | Primary form button với loading |
| `BaseLoading` | `Common/BaseLoading` | Inline spinner |
| `BaseTabs` | `Common/BaseTabs` | Tab component |
| `OrderListCard` | `pages/delivery/_components/OrderListCard.tsx` | Driver order card: icon badge + company + status + location + phone list |

### 3.3 E01 Mobile Flutter Widgets

**App-wide widgets:** `lib/app/widgets/`

| Widget | Purpose |
|---|---|
| `DpButton` / `DpButtonOutline` / `PrimaryButton` / `StaticPrimaryButton` | Button variants |
| `DpTextFormField` / `GradientTextField` / `LabelTextField` | Input fields |
| `DpDatePickerField` | Date picker |
| `VerificationCodeField` | OTP code |
| `LoadingOverlay` | Global loading spinner |
| `ToastOverlayWidget` | Snackbar replacement |
| Skeleton widgets (5 types) | Loading states: categories, product, payment method, notification, notification detail |
| `SuccessPage` | Post-transaction screen |

**Feature widgets:** `lib/features/widgets/`

| Widget | Purpose |
|---|---|
| `AppBarCustomWidget` | Custom top bar |
| `AppNetworkImage` | Cached image |
| `BaseDialogWidget` | Modal dialog |
| `CategoriesHorizontalTabsWidget` | Tab nav |
| `CountdownPaymentCard` | Payment timer |
| `ItemProductWidget` | Product card với quantity selector |
| `ItemMethodPayment` | Payment method list item |
| `ShoppingCartWidget` | Cart display (Riverpod) |
| `SummaryCartWidget` | Order total summary |
| `StatusBadge` | Order/payment status pill |
| `GenderSelector` | Radio-style gender picker |
| `ModalConfirmCancelWidget` | Yes/No confirmation |
| `EmptyWidget` | Empty state |

---

## 4. Layout patterns per app

### 4.1 Desktop Web (E02·E03·E04·E05)

```
┌──────────┬────────────────────────────────────┐
│ Sidebar  │ Header (54px, h-13.5)              │
│ 210px    ├────────────────────────────────────┤
│ (Nav     │ Page Header: Breadcrumb + Title    │
│ collapse │ (BaseHeadingBreadcrumb)            │
│ to 80px) ├────────────────────────────────────┤
│          │ Content area (bg #F0F2F5)          │
│          │   White card wrapper (rounded-lg)  │
│          │   px-3 sm, px-6 lg                  │
└──────────┴────────────────────────────────────┘
```

- **Mobile breakpoint:** `<768px` → Sidebar → Drawer (AntD `Drawer`, `placement="left"`)
- **Active sidebar item:** background = primary color, white text, bold

### 4.2 E06 Driver (mobile web)

```
┌──────────────────────┐
│ TopBar / PageHeader  │  ~56-64px sticky, shadow-[0px_1px_3px_#0000001A]
├──────────────────────┤
│   Content scroll     │
│   (card-list pattern)│
│   max-width 384px    │
├──────────────────────┤
│ BottomNavigation     │  5 items fixed: Home, Manual, Delivery, Delay, Account
└──────────────────────┘
```

- **NO sidebar** — linear workflow
- **Animations:** fade-in-up/down, truck-enter (auth/home)
- **Cards:** `rounded-2xl bg-white shadow-sm`

### 4.3 E01 Mobile Flutter

- **Design baseline:** 390 × 844 (iPhone 14) — `ScreenUtilInit(enableScaleWH=true, textScaler disabled)`
- **Sizing:** `flutter_screenutil` `.w / .h / .sp` — KHÔNG hard-code px
- **Safe area:** Platform-aware (Android vs iOS, ~0.75–0.85 viewport)
- **Navigation:** Cupertino default; custom (slide/fade/zoom) per route
- **Bottom sheet:** `DraggableScrollableSheet` (menu, cart)
- **Bottom nav:** 5+ tabs via `BottomBarRoute`

---

## 5. Typography & Tokens (chung tất cả repos)

- **Font primary:** Noto Sans JP (system fallback: system-ui, Helvetica, Arial)
- **Font weights:** 400 / 500 / 700 (E01 mobile có thêm 100-900)
- **Line height:** 1.5 default
- **Anti-aliasing:** enabled
- **Border radius default:** 8px (web) / 0.5rem-1.5rem (E06 cards)
- **Dark mode:** Tailwind class mode configured nhưng KHÔNG có UI toggle (chưa active)

---

## 6. Naming conventions

| Convention | Web (E02-E05) | Web E06 | Mobile E01 |
|---|---|---|---|
| Component files | `PascalCase/index.tsx` | `lowercase.tsx` (shadcn) hoặc `PascalCase/index.tsx` | `snake_case.dart` |
| Component naming | `BaseButton`, `Nav`, `Header` | `Button` (shadcn) / `PageLayout` | `ItemProductWidget`, `MenuPage` |
| Folder naming | `kebab-case` (`account-management/`) | `kebab-case` | `lowercase` (`menu/`, `cart/`) |
| SCSS modules | `kebab-case.module.scss` | Tailwind only | N/A |
| Hook naming | `useXxx` | `useXxx` | `xxxProvider` (Riverpod) |
| Service naming | `xxx.service.ts` | `xxx.service.ts` | `xxx_repository.dart` |
| Stores | Redux slices in `stores/reducers/` | Zustand stores | Riverpod providers |

---

## 7. Reference screens — sample page mỗi repo (để Designer học pattern)

| Repo | Sample page | Path |
|---|---|---|
| E02 | Sales Management | `src/pages/sales-management/page.tsx` |
| E03 | Account Management | `src/pages/account-management/page.tsx` |
| E04 | Dashboard | `src/pages/dashboard/DashboardPage.tsx` |
| E05 | Dashboard | `src/pages/dashboard/DashboardPage.tsx` |
| E06 | Home (Delivery) | `src/pages/home/HomePage.tsx` |
| E01 | Menu | `lib/features/menu/menu_page.dart` |

**Composition pattern điển hình (web admin):**
```
BaseHeadingBreadcrumb (title + breadcrumb)
  → Action buttons row (BaseButton, BaseButtonDownload)
  → White card wrapper (rounded-lg, p-4, bg-white)
    → Filter row (BaseInput, BaseSelect, BaseDateFilter, BaseButton search)
    → BaseTable (pagination + sorting + BaseButtonAction per row)
    → BaseModal/BaseModalConfirm trigger từ row actions
```

---

## 8. ⚠️ Conflicts & Gaps cần confirm

### 8.1 E04 Color theme — RESOLVED 2026-06-09

- **Decision:** E04 Supplier dùng **purple `#6639BA`** cho mọi design mới (theo Figma redesign `SW_AUTH_001`)
- **Note:** Code production hiện dùng orange `#faa61f` — chưa được migrate sang purple. FE Dev khi implement screen mới sẽ apply purple theme + đề xuất migrate Tailwind config E04.
- **Designer Agent KHÔNG cần hỏi user nữa** — luôn dùng purple `colors.primitives.purple.600` cho E04.

### 8.2 Components chưa có (cần đề xuất user)

Nếu thiết kế cần các thứ sau mà repo chưa có → trigger RULE "KHÔNG tự generate":
- Standalone date range picker (E03 có BaseDateFilter, các repo khác chưa)
- Custom chart legend (dùng Recharts default)
- Toast/notification centralization (E05 chưa có)
- Side-by-side form layouts
- E06 FAB pattern (chưa thấy trong code)
- E01 Chip / FilterChip / Stepper / SnackBar (dùng ToastOverlay thay)

### 8.3 Sample data conventions (lấy từ SPEC business knowledge)

- Order codes: `P00000019`, `SO-2026-0601-001`
- Product names: `北アルプスの天然水仕込`, `豚バラ肉スライス`, `鶏もも肉`
- Status labels: `納期回答待ち`, `出荷待ち`, `出荷済み`, `配送完了`
- Dates: `2024/04`, `3/1`, `4/2`
- Counts: `5`, `10件`, `100件中 1-10件`

---

## 9. Quick lookup khi Designer Agent thiết kế

1. **Xác định app target** (E01-E06) → load section 4 (layout) + section 2 (color) tương ứng
2. **Check Conflict 8.1** nếu target = E04 → hỏi user
3. **Liệt kê components cần dùng** từ Screen Type:
   - List → `BaseHeadingBreadcrumb` + Filter + `BaseTable` + Pagination
   - Form → `BaseHeadingBreadcrumb` + `BaseInput`/`BaseSelect`/`BaseDatePicker` + `BaseButton`
   - Detail → `BaseHeadingBreadcrumb` + `BaseCollapseSection` + readonly fields
   - Modal → `BaseModal` (hoặc `BaseModalConfirm` cho Yes/No)
   - Dashboard → Grid cards (`rounded-2xl bg-white shadow-sm`)
4. **Check section 3** xem component có sẵn trong target repo không
5. **Nếu thiếu** → trigger RULE "STOP và HỎI USER" trong `designer-agent.md`
6. **Sample data** → dùng convention section 8.3 (tiếng Nhật realistic)

---

## 10. Icon & Image Assets per repo

> Khi Designer thiết kế cần icon/image, **đọc trực tiếp SVG/PNG từ source code** rồi dùng `createNodeFromSvg()` (SVG) hoặc Image transfer pattern (PNG). KHÔNG vẽ tay icon từ rectangle.

### 10.1 Icon set chung — E02 · E03 · E04 · E05 (cùng bộ ~20 icons)

Path pattern: `src/statics/icons/<name>.svg`

| Icon name | E02/E03/E04/E05 paths | Mô tả | Default color |
|---|---|---|---|
| `logo-icon.svg` | ✅ tất cả | ESSTATION logo SVG | brand orange |
| `sun-icon.svg` | ✅ tất cả | Sun/greeting icon | varies (E04 = pencil white, E02/03 = sun) |
| `edit-icon.svg` | ✅ tất cả | Pencil edit | white hoặc `#424A53` |
| `delete-icon.svg` | ✅ tất cả | Trash | `#CF222E` |
| `calendar-icon.svg` | ✅ tất cả | Calendar grid | `#424A53` |
| `search-icon.svg` | ✅ tất cả | Magnifying glass | `#8C959F` |
| `sort-icon.svg` | ✅ tất cả | Sort arrows | `#faa61f` |
| `filter-icon.svg` | ✅ tất cả | Filter funnel | `#424A53` |
| `download-icon.svg` | ✅ tất cả | Download arrow | white |
| `upload-icon.svg` | ✅ tất cả | Upload arrow | white |
| `export-icon.svg` | ✅ tất cả | Export arrow → box | white |
| `logout-outlined.svg` | ✅ tất cả | Logout outlined | `#24292F` |
| `add-user-icon.svg` | ✅ tất cả | Add user | varies |
| `auth_checked.svg` | ✅ tất cả | Check mark | varies |
| `confirm-success.svg` | ✅ tất cả | Success check | green |
| `confirm-info.svg` | ✅ tất cả | Info circle | blue |
| `confirm-danger.svg` | ✅ tất cả | Warning triangle | red |
| `range-label.svg` | ✅ tất cả | Range indicator | varies |
| `arrow-down.svg` | E03 | Down arrow | varies |
| `nav-icons/` (folder) | ✅ tất cả | Sidebar nav icons | varies |
| `cart-icon.svg` | E02 only | Cart | orange |
| `yen-circle-icon.svg` | E02 only | ¥ circle | orange |
| `user-group-icon.svg` | E02 only | Users | varies |

**TSX icon components (E03 specific):**
- `delete-icon.tsx`, `edit-icon.tsx`, `filter-icon.tsx`, `pencil-icon.tsx`, `trash-icon.tsx`, `upload-icon.tsx` — wrap SVG vào React component.

### 10.2 Image assets per repo

Path pattern: `src/statics/images/<name>.png|webp`

| Image | E04 path | Mô tả |
|---|---|---|
| `logo.png` | ✅ E04 (và tương tự ở E02/E03/E05) | **ESSTATION full logo** — sun cười + chảo + chữ "ES" orange + "STATION" red. Dùng cho Sidebar logo + Header logo. |
| `sidebar-image.png` | ✅ E04 | **Sol mascot** — nhân vật cô gái tóc vàng cầm Recipe book, đặt bottom sidebar |
| `avatar-user.png` | ✅ E04 | User avatar placeholder cho Header |
| `auth-background.webp` | ✅ E04 | Auth screens background (warm wheat field) |
| `empty-image.png` | ✅ E04 | Empty state illustration |
| `notify-image.png` | ✅ E04 | Notification illustration |
| `cash-pay.png`, `google-pay.png`, `apple-pay.png`, `visa-pay.png`, `paypal.png` | ✅ E04 | Payment method icons |

**E06 Driver:** `src/statics/icons/` + `src/statics/images/` — chưa khảo sát chi tiết, follow same pattern.

**E01 Mobile (Flutter):** `assets/icons/` + `assets/images/` + `assets/gifs/` + `assets/fonts/` — Flutter convention.

### 10.3 Cách Designer Agent sử dụng

**Pattern 1 — SVG icon → inline vào Figma:**
```js
const svgContent = `<svg width="20" height="20" viewBox="0 0 20 20" ...>
  <path d="..." stroke="#6639BA" stroke-width="1.5"/>
</svg>`;
const iconNode = figma.createNodeFromSvg(svgContent);
iconNode.resize(20, 20);
slotFrame.appendChild(iconNode);
```

→ Designer Agent đọc file SVG bằng Read tool tại path đã ghi, copy nội dung SVG string, paste vào use_figma script. Nếu cần đổi màu → substitute color literal trong SVG string TRƯỚC khi import (vì `currentColor` import = black).

**Pattern 2 — PNG image:**
- Nếu image cần xuất hiện trên Figma → **chạy `generate_figma_design` parallel** để capture ảnh có imageHash, sau đó transfer imageHash vào frame.
- HOẶC: upload image vào Figma trước bằng `upload_assets` tool, lấy imageHash, dùng `figma.createImage()`.

**Pattern 3 — Logo + Sol mascot:**
- ESSTATION logo + Sol mascot KHÔNG vẽ tay. Dùng PNG transfer pattern (Pattern 2) HOẶC dùng local component có sẵn trong Figma file (Logo local key + Support local key).

---

## 11. ESKitchen Figma Library — Component Keys & Composition Pattern (CRITICAL)

> Bộ key đã discover từ reference screen `19504:179076` (Confirm order info) — dùng `importComponentByKeyAsync` / `importComponentSetByKeyAsync` trực tiếp, KHÔNG vẽ lại.

### 11.1 Library info

- **Name:** ES Kitchen
- **libraryKey:** `lk-51d79086f7177ec9e4a1b8281bd0e2337de3bf0cbe6386026552a57d3067a3a73af6023df34f965696bdd53983a3fd7712c520fda0270d2a283b158086e75f34`
- **Source:** team
- **Đã được file VKAAOyoSPvgoB3H2qdeeV3 subscribe**

### 11.2 Library Components (remote — dùng `importComponentSetByKeyAsync`)

| Component | Key | Variants chính | Dùng cho |
|---|---|---|---|
| **Button** | `1e134ad8aa99dc4e294a79bf087b2342c4a3a3a1` | `theme=Company/Admin/App`, `variant=outline/filled`, `state=enable/disabled/hover`, `size=sm/md/lg` | Buttons toàn dự án — theme Company = blue E03/E06; Admin = orange E02; App = yellow E01. **E04 purple** chưa có theme variant → override fill |
| **Input** | `c2b2d367691d1cbb014c2f2537e5234d0d31e51d` | `Size=medium/small`, `State=normal/error`, `Filled=true/false` | Text input |
| **Input (variant)** | `dd4368aee92ddaa1d5c9d1f6edee56a606b2bfc0` | `Property 1=Default`, `Size=S/M/L`, `Filled=Yes/No`, `State`, `In Valied=Yes/No` | Form input alt |
| **Select** | `1a9a2d8e82f78a52529f5c9fa90ea9b65b054e18` | `Size=medium`, `Filled`, `MultiSelect`, `Disabled`, `Open`, `Hovering` | Dropdown |
| **Badge** | `e773ec7ccd5e36c1f773e70326ce4dfeb8a07946` | `Size=lg/md/sm`, `Icon=False/True`, `Color=Gray/Green/Yellow/Red/Blue` | Status pill |
| **Table-Cell/Header** | `df10a9f4a9265af2f85f7f91daf54d7b1b517365` | `Size=large/medium`, `Icon=true`, `Sorter`, `Filter`, `Search` | Table header row cell |
| **Table/Data Cell/Text** | `e42181be0e35a6a3625ec75c704070533fbffbe0` | `size=sm/md/lg`, `align=left/center/right`, `state=enable/disabled` | Table body cell với text |
| **Pagination-Item** | `9117cc15ee55e801dd5a9b943f51ea30a38a9534` | `Size=medium`, `Active=true/false`, `Hovered`, `State` | Page number button |
| **Pagination-Prev** | `686759f8bc377ece09d0105ade581f2e9ffab1df` | `Size=medium`, `State=disabled/normal`, `Hovered` | Prev arrow |
| **Pagination-Next** | `20f709f2aecf334ddd348b070096c3b7fc201c2e` | `Size=medium`, `State=normal`, `Hovered` | Next arrow |
| **Pagination-Item-Ellipsis** | `2ccb16b6d4b7ed0072cbb7e818a9749dee88b13a` | `Size=medium`, `Direction=prev/next`, `State` | "..." gap |
| **Breadcrumb** | `3bfa925f0cfb77fa1e6604513f86fb24dbe0c468` | `Count=1/2/3/...` | Breadcrumb row |
| **Components/Link** | `d931eda86800721165e2045722e34db79bc5953b` | `Icon`, `Current`, `Dropdown`, `Text` | Inline link |
| **Components/Separator** | `14269b8a68b3ff3c61251ef1d403fe9d1c64e8f3` | — | Breadcrumb separator ">" |
| **Divider** | `6d502648841e9d25b8af1a83faf6c67cbfb315a2` | `style=solid`, `direction=horizontal/vertical`, `emphasis=low/medium/high` | Divider line |
| **Icon Button** | `44bd7f7e4ec3cfb8305b20f3938e9b307f69d7b2` | `theme`, `variant=ghost/outline`, `state`, `size=sm/md/lg` | Icon-only button |
| **Checkbox** | `aaf840205c28a805af1229053648f99511c344d8` | `units=1/N`, `direction=horizontal/vertical` | Checkbox group |
| **Checkbox/Parts/Item** | `5b8403f5d634770bb3654a0fa0bd9bb06f941be9` | `isInvalid`, `body`, `state`, `size` | Single checkbox |
| **Icon-Wrapper** | `093dfb5cbc5ddb2aab92a52e4f75c0cb61eb4219` | `Size=14px/16px/20px/24px`, `Union=true/false` | Icon container |
| **Iconly** (set 1) | `52d010c15f8cc3f4e9f16d9b94e73181da77050f` | Property 1, Property 2=Light/Regular, Property 3=Arrow-Down/Search/Setting/User... | Generic icon set |
| **Iconly** (set 2) | `ebcff30d7138c7226a34c9f23b53a76d59311447` | Property 2=Light, Property 3=Search... | Icon variants |
| **Iconly/Regular/Light/Arrow - Up 2** | `736f915b28d75c0857076161af0bd5d19aed641b` | — | Standalone arrow up |
| **Iconly/Light/Arrow - Down 2** | `59814467279334fe8f2fb55b36464855c7fbda7d` | — | Standalone arrow down |
| **Icon/expand_more** | `7f883d76affcb62b0fc4ff5a01b9f51ce2ddc1c3` | — | Expand caret |
| **Icon/CaretDown** | `e6465faccfc469134074865cce158588f79fa03e` | `Weight=Regular/Bold` | Caret down |
| **Icon/PencilSimple** | `2b9e0d932264390f51afee9313723253e5812eb2` | `Weight=Regular/Bold` | Edit pencil |
| **Iconly (Delete)** | `fd02b070b102702b9345895ede1cb1f5d7bc9a70` | `Property 1=Regular`, `Property 3=Delete` | Delete icon |
| **Components/Input-Affix** | `c359f8f6156ddcc57270fbc6cc1dc6c6dcbed5f0` | `Type=icon-14px/text/...` | Input prefix/suffix |
| **MenuFold** | `29b3215d520207342123986f9d64136ea739af78` | — | Sidebar collapse icon |

### 11.3 Local Components in file (KHÔNG dùng `importComponentByKeyAsync` — phải `getNodeByIdAsync` hoặc findOne by name)

| Component | Key (local) | Dùng cho |
|---|---|---|
| **Logo** | `2a79b25224f505dec85e8d411bd4d73674f347c9` | ESSTATION logo block 210x54 — render trong Header + Sidebar |
| **Header** | `5fb620f01050816b01799008b38919a90b765243` | Top header bar 1230x54 (greeting + avatar) |
| **Dashboard-expand-collapse-unselect** | `759c5bb52c51c16aee35b5e9f2cc0caff954c916` | Sidebar nav item 184x48 — variants Default/Selected. **Mỗi nav item là 1 instance của component này** |
| **Sol** (mascot) | `6223abdebf1f883dfc82280e0ce5e6ac4480adb9` | Sol character mascot — variants `Property=1..N` (6+ variants) |
| **account** | `9eae5f5161220c73cd79ae37d1aca4b7946245e9` | Sidebar nav "Account" — `status=expand`, `select status=Default/selected`, `dropdown` |
| **sales** | `9af12c7f80b0d91277108781006432f1dca39af1` | Sidebar nav "Sales" |
| **location** | `2eb9e0e7ee8156a784833d17748d63ad07af496d` | Sidebar nav "Location" |
| **row expand** | `04910330b1d33e9a3523bf95e24ec876e2ec5140` | Table row expand control |
| **pagination** | `b939a286baf37119a9ed9443a0be80b0980e0217` | Full pagination component 1198x48 |

> Local components phải dùng pattern:
> ```js
> const node = figma.currentPage.findOne(n => n.name === "Logo" && n.type === "COMPONENT_SET");
> const inst = node.defaultVariant.createInstance();
> ```

### 11.4 Library Variables (colors, padding, font tokens)

| Variable name | Key | Type | Usage |
|---|---|---|---|
| `company/500` | `26ea29b0cd35ad81e5d19ee9718b73ddf56f5e35` | COLOR | Blue primary E03/E06 |
| `text/high` | `e764867bca37486514e2cdab078ca52d683843ab` | COLOR | Heading text |
| `text/middle` | `41200f8c179748749355e1256243f5a50226c6d8` | COLOR | Body text |
| `text/low` | `a74027710d1fde2c85f7e3e3430e8c995a2946d5` | COLOR | Helper text |
| `slot/stroke` | `e052b87f1d52f5d59e4827fd82f30519fc2f40d1` | COLOR | Default border |
| `divider/low` | `3ad5be4b9c43d27ccaaa04276a569f9eaddff3f9` | COLOR | Subtle divider |
| `white` | `41803562292d5bef20d7597b9d179ff1630ab626` | COLOR | White |
| `padding/12` | `3d55636b91a4ac2b7d2111d9659866df9bb75970` | FLOAT | Small spacing |
| `padding/16` | `aad1a40a9bbab88ed5c92fd00aeaba8e809fdf76` | FLOAT | Medium spacing |
| `padding/24` | `5665c29c61e0d66468b969495a3efb4234920353` | FLOAT | Large spacing |
| `Font/Family/Default` | `bacb0ff1dd475d467fe646a14d9d37abd0e61d74` | STRING | Noto Sans JP |
| `Font/Size/16` | `9c6a298a555cc0a5983b91f1a02ed085f4b3d789` | FLOAT | Body size |
| `Font/Weight/Medium` | `16eacc731e74ae089bcfac242c0a24c8b6d13ca5` | STRING | 500 |
| `Font/Height/24` | `25209c57bbd0965fd965a9a16685e2aa4b5dd03a` | FLOAT | line-height 24px |

> Designer Agent dùng `setBoundVariable("paddingLeft", paddingVar)` thay vì hard-code px, và `setBoundVariableForPaint(paint, "color", colorVar)` thay vì hex.

### 11.4b ⭐ CLONE PATTERN — Cách nhanh nhất tạo high-fi screen

Thay vì build từ component instances thủ công (cost cao, dễ sai dimension), **CLONE reference screen có sẵn rồi override text + variants**:

**Reference screens chuẩn (đã verify):**
| Screen Code | Figma node | Mô tả | Dùng cho |
|---|---|---|---|
| `19504:179076` | Confirm thông tin đơn hàng | Detail/Form screen E02 Company | Reference cho Detail/Form Type |
| `16479:123684` | Confirm thông tin đơn hàng | List screen E04 với table + pagination | Reference cho **List Type** (most common) |

**Workflow (3 use_figma calls cho 1 screen):**

```js
// Call 1: Clone reference structure
const refFrame = await figma.getNodeByIdAsync('16479:123684');
const cloned = refFrame.clone();
cloned.name = '<TARGET_SCREEN_CODE>';
cloned.x = clearX; cloned.y = clearY;
return { clonedId: cloned.id };

// Call 2: Override sidebar nav + filter labels (setProperties cho nav, characters cho TEXT children của Input)
nav.setProperties({ 'Title#13440:5': newLabel });
nav.setProperties({ 'Property 1': 'Active' });   // for active nav
// For Input/Button: find TEXT children và set characters
const textNodes = inp.findAll(n => n.type === 'TEXT');
textNodes[0].characters = label;
textNodes[1].characters = value;

// Call 3: Override 10 table rows data (loop, override TEXT children per cell)
```

**Key gotchas:**
- Input/Button KHÔNG expose text qua componentProperties → phải find TEXT children và set characters
- Trước khi set characters, load font: `await figma.loadFontAsync(textNode.fontName)`
- Để đổi theme color (vd E04 purple): find fill shapes có (r+g+b)<2.5 và width>100, override fill via JSON.parse(JSON.stringify(fills)) pattern
- Skip invisible instances: `figma.skipInvisibleInstanceChildren = true`

### 11.5 Composition Pattern (chuẩn từ reference designer)

**Desktop List screen (E02/E03/E04/E05) 1440×1024:**

```
Frame "<SCREEN_CODE>" 1440×1024
├── Sidebar 210×1024
│   ├── Logo instance 210×54           (top)
│   ├── menu&logo frame 210×248
│   │   └── 4× Dashboard-expand-collapse-unselect 184×48 (y=16,72,128,184)
│   └── Support instance 210×250       (bottom — mascot + menu fold)
└── Container 1230×973 (x=210)
    ├── Header instance 1230×54
    ├── .Page-Header(Legacy) 1230×96
    │   └── heading frame 1182×56 (margin 24px)
    │       └── Breadcrumb instance + Title text
    └── Table/Column-Based 1230×823
        ├── Wrap (filter row) 1198×86 (margin 16px)
        │   └── Frame 673×70
        │       ├── Input instance 240×70 (filter 1)
        │       ├── Input instance 240×70 (filter 2)
        │       └── Button instance 173×40
        ├── Table 1198×625 (margin 16px, y=118)
        │   ├── Row (header) 1198×55
        │   │   └── 11× table-header/default instances (widths: 38, 110, 86, 180, 160, 120, 110, 101, 96, 125, 72)
        │   └── 11× Row (data) 1198×57 (stride 57)
        │       └── per row: row expand + 9× Table/Data Cell/Text (1 chứa Badge) + table-cell/action
        └── pagination instance 1198×48 (y=759)
```

**Key dimensions từ reference (KHÔNG đổi):**
- Sidebar width: **210px** (KHÔNG phải 180px)
- Container x: 210
- Container width: **1230px**
- Inner margin: **24px** cho page header, **16px** cho table wrap
- Header height: 54px
- Table row stride: 57px (cell height 56 + 1 divider)
- Pagination height: 48px

**KHÔNG được:**
- Vẽ rectangle thay component (Button, Input, Badge, Pagination phải là instance)
- Tự đặt nav item bằng frame + text (phải là `Dashboard-expand-collapse-unselect` instance)
- Hard-code color hex (phải bind variable)

---

*File này được auto-generate từ source code es-kitchen-repository/ + reference Figma screen `19504:179076` — re-run extraction khi codebase hoặc Figma library thay đổi đáng kể.*
