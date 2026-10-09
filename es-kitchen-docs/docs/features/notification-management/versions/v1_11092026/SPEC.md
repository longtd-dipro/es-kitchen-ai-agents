# SPEC: Notification Management

> **Domain:** BF_[SYSTEM & OTHER] — Sub-feature: Notification Management
> **Backlog ID:** ESKITCHEN-1249 (parent domain)
> **Phase:** Phase 2
> **Target repo:** `es-kitchen-web-admin` (E03 System Admin Web)
> **Related SPEC:** `es-kitchen-docs/docs/features/system-other/SPEC.md` (domain overview)
> **Figma source:** https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16942-51758
> **Tạo bởi:** BA Agent — 2026-09-11
> **Version:** v1

---

## Mô tả nghiệp vụ

Notification Management là tính năng dành cho **System Admin (E03)** để quản lý toàn bộ thông báo hệ thống gửi đến các đối tượng khác nhau (Company, User Mobile, Driver, Supplier, Carrier). Bao gồm hai phần chính:

1. **Cấu hình loại thông báo (Notification Type Settings):** System Admin bật/tắt từng nhóm loại thông báo theo actor target (Company/Order/Delivery/Driver/User/Package). Mỗi nhóm có thể cấu hình riêng: bật/tắt toàn nhóm, lọc theo đối tượng (Plan, Company), và xem danh sách đối tượng được nhận theo bảng.

2. **Quản lý Email thông báo (Email Management):** System Admin xem danh sách email thông báo đã phát hành và lên lịch gửi, tìm kiếm/lọc theo nội dung và thời gian, xem chi tiết, và tạo/chỉnh sửa nội dung email thông qua một Rich Text Editor tích hợp.

**Mục tiêu nghiệp vụ:**
- Tập trung hóa điều phối thông báo tại một nơi duy nhất cho System Admin.
- Cho phép cấu hình linh hoạt theo từng nhóm đối tượng mà không cần code.
- Hỗ trợ lên lịch (scheduled) gửi thông báo.
- Cung cấp giao diện soạn thảo nội dung phong phú (Rich Text) cho email notification.

> **Liên quan SF trong system-other SPEC:**
> - SF-02: Nhắc nhở chốt đơn (E02 nhận — trigger từ E03 Notification Management)
> - SF-03: Danh sách & Chi tiết thông báo hệ thống (E02 xem — E03 phát hành)
> - SF-09 của domain system-other: Email Management (chi tiết Figma ở SPEC này)

---

## BA Deliverables

> Entry point cho TL Design / Designer / QC — đọc section này đầu tiên.

| # | Output | Status | Path / URL | Note |
|---|---|---|---|---|
| 0 | SPEC.md | Done | `es-kitchen-docs/docs/features/notification-management/SPEC.md` | File này |
| 1 | Figma Frame — Flow Tổng Quan | Skipped | — | Skipped — feature phân tích từ Figma input của user (output Figma nằm trong input URL); BA không vẽ lại flow trên cùng file |
| 2 | Figma Frame — Screen Flow | Skipped | — | Skipped — same reason as Output 1 |
| 3 | Figma Frame — Screens + Items | Skipped | — | Skipped — same reason; Figma design đã có tại node-id=16942-51758 |
| 4 | HTML Prototype | Skipped | — | Skipped — user yêu cầu SPEC.md từ Figma input, không yêu cầu prototype riêng |

**Figma Design Source (input):**
- Notification Management section: https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16942-51758
- Frame "Edit noti" (v1): https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16661-110426
- Frame "Edit noti" (v2): https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=30112-306327
- Frame "Email management": https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16651-25433

**Downstream instructions:**
- **Tech Lead Design:** Đọc `## Screens`, `## Screen Details`, và `## Acceptance Criteria` để tạo `Design-Technical.md` cho `es-kitchen-api` và `es-kitchen-web-admin`.
- **Designer:** Đọc `## Screens` + `## Screen Details` → tạo high-fidelity Figma screens → điền cột `Figma Link` trong `## Screens`.
- **QC:** Đọc `## Acceptance Criteria` và `## Alternative Flows & Edge Cases` để sinh test cases.

---

## Actors & Preconditions

### Actors liên quan

| Actor | Portal | Vai trò trong feature này |
|---|---|---|
| **E03** — System Admin | `es-kitchen-web-admin` (React) | **Primary actor** — cấu hình notification types, quản lý email thông báo, soạn thảo nội dung, bật/tắt từng nhóm, lên lịch gửi |
| **E02** — Company Admin | `es-kitchen-web-company` (React) | **Receiver** — nhận thông báo được E03 phát hành; xem danh sách và chi tiết |
| **E01** — End User (Mobile) | Flutter App | **Receiver** — nhận push notification khi E03 bật nhóm User notification |
| **E04** — Supplier | `es-kitchen-web-supplier` (React) | **Receiver** — nhận email notification khi E03 bật nhóm Order/Item notification |
| **E05** — Carrier (Outsource) | `es-kitchen-web-outsource-web-private` (React) | **Receiver** — nhận email notification khi E03 bật nhóm Delivery notification |
| **E06** — Driver | `es-kitchen-webapp-driver` (React web) | **Receiver** — nhận push notification khi E03 bật nhóm Driver notification |

> **Cross-repo:** Feature này ảnh hưởng `es-kitchen-api` (backend logic) + `es-kitchen-web-admin` (E03 UI). Các actor receiver không có UI thay đổi trong feature này — họ chỉ nhận notification. **Contract Lock cần thiết trước Phase 3 cho notification payload + API.**

### Preconditions

- E03: Đã đăng nhập hệ thống với tài khoản System Admin có quyền "Notification Management".
- Hệ thống đã có dữ liệu: danh sách Plans (Kế hoạch), danh sách Companies (Cty), danh sách Drivers.
- Firebase Cloud Messaging (FCM) và APNs đã được cấu hình trong backend.
- SES hoặc SMTP server đã được cấu hình cho email gửi ra ngoài.

---

## Flow Tổng Quan

### Flow 1 — Cấu hình Notification Types

```
E03 (System Admin)
  → Vào trang Notification Settings [AW_NOTI_001]
  → Xem 6 nhóm notification (Company / Order / Delivery / Driver / User / Package)
  → Mỗi nhóm: Toggle bật/tắt toàn nhóm
  → [Bật] → Chọn điều kiện lọc (Plan, Company)
           → Xem bảng danh sách đối tượng sẽ nhận
           → Nhấn Lưu → Cập nhật cấu hình [OK]
                                             ↓ [Lỗi]
                                        Toast "Lưu thất bại, vui lòng thử lại"
  → [Tắt] → Hệ thống ngừng gửi notification nhóm đó ngay lập tức
```

### Flow 2 — Quản lý Email Notification

```
E03 (System Admin)
  → Vào trang Email Management [AW_NOTI_003]
  → Xem danh sách email đã phát hành / lên lịch (tìm kiếm, lọc)
  → Chọn "Tạo mới" [AW_NOTI_004] → Soạn nội dung:
      - Nhập tiêu đề (Title)
      - Chọn thời gian gửi (Scheduled time)
      - Soạn nội dung Rich Text (Bold, Italic, List, Quote, Link, Media)
      - Cấu hình push notification đi kèm (toggle)
      - Chọn audience target (Plan / Company)
      → Nhấn Save (Draft) hoặc Publish
        → [Save Draft] → Lưu nháp, xuất hiện trong list với status "Draft"
        → [Publish] → Phát hành ngay / lên lịch theo scheduled time
                    → [Lỗi validation] → Toast lỗi inline
  → Nhấn "Sửa" trên record có sẵn [AW_NOTI_004] → Chỉnh sửa nội dung → Lưu
  → Nhấn "Xóa" → Xác nhận → Xóa khỏi danh sách
```

---

## Happy Path

### HP-1: Bật/Tắt nhóm Company Notification

**Actor:** E03
**Precondition:** Đã ở trang Notification Settings; nhóm Company Notification đang tắt

1. System Admin nhìn thấy nhóm "Company Notification" với toggle OFF.
2. System Admin bật toggle → trạng thái chuyển ON.
3. Hệ thống hiển thị bộ lọc: chọn Plan (dropdown), chọn Company (dropdown/multi-select).
4. Hệ thống hiển thị bảng danh sách Company sẽ nhận notification: cột # / Plan / Company / Action.
5. System Admin xem và xác nhận danh sách phù hợp.
6. System Admin nhấn "Lưu" (Save) ở cuối form.
7. Hệ thống lưu cấu hình và hiển thị toast "Lưu thành công".
8. Từ thời điểm đó, hệ thống sẽ gửi notification đến các Company theo điều kiện lọc đã thiết lập.

> Tương tự cho 5 nhóm còn lại: Order/Item, Delivery, Driver, User, Package — mỗi nhóm có bộ lọc riêng phù hợp với actor target.

### HP-2: Tạo Email Notification mới

**Actor:** E03
**Precondition:** Đã ở trang Email Management; đã nhấn "Create" / "Tạo mới"

1. System Admin thấy form soạn email [AW_NOTI_004] gồm 2 sections:
   - **Section 1** — Cấu hình gửi: Toggle nhóm nhận (Company / Order), bộ lọc Plan + Company.
   - **Section 2** — Nội dung email: Title (text input), Scheduled time (datetime picker), Body (Rich Text Editor), Push notification toggle.
2. System Admin nhập Title (bắt buộc).
3. System Admin chọn thời gian gửi (Scheduled time) — có thể để trống nếu gửi ngay.
4. System Admin soạn nội dung trong Rich Text Editor (toolbar: Bold, Italic, Underline, List, Quote, Link, Image).
5. System Admin toggle "Push notification đi kèm" nếu muốn gửi đồng thời push.
6. System Admin nhấn "Save" → Hệ thống lưu và publish (hoặc lên lịch nếu có scheduled time).
7. Email xuất hiện trong danh sách [AW_NOTI_003] với thông tin: #, Title+Preview, Tags, Scheduled time, Status, Action.

### HP-3: Tìm kiếm và lọc Email Management

**Actor:** E03
**Precondition:** Đã ở trang Email Management

1. System Admin nhập từ khóa vào ô tìm kiếm.
2. Hệ thống lọc danh sách real-time hoặc sau khi nhấn "Search".
3. System Admin có thể lọc thêm theo khoảng thời gian (date range picker).
4. Hệ thống hiển thị kết quả phù hợp; nếu không có kết quả → hiển thị trạng thái Empty.

---

## Alternative Flows & Edge Cases

### AE-01: Toggle tắt nhóm notification đang bật

Khi E03 tắt toggle của một nhóm đang bật:
- Hệ thống hiển thị confirm dialog: "Tắt nhóm này sẽ ngừng gửi notification đến [N] đối tượng. Xác nhận?"
- [Confirm] → Tắt ngay lập tức; cấu hình lọc giữ nguyên để dễ bật lại.
- [Cancel] → Toggle trở về trạng thái bật; không thay đổi.

> **Q&A AE-01:** *Khi tắt, các notification đang lên lịch (scheduled) có bị hủy không?* — **Chưa xác nhận** → ghi vào Q&A / Ambiguities.

### AE-02: Lưu cấu hình khi chưa chọn Company

Khi E03 bật toggle nhóm Company Notification nhưng không chọn Company nào trong bộ lọc:
- Hệ thống cho phép lưu → áp dụng cho **tất cả Company** (không lọc).
- **Hoặc:** Hiển thị warning "Chưa chọn đối tượng — notification sẽ gửi đến tất cả Company. Xác nhận?"
- **Chưa xác nhận behavior** → ghi vào Q&A / Ambiguities.

### AE-03: Soạn email bỏ trống Title

Khi E03 nhấn Save mà không nhập Title:
- Hệ thống không cho phép lưu.
- Hiển thị inline validation: "Tiêu đề là bắt buộc" (màu đỏ dưới field).
- Form không navigate đi.

### AE-04: Scheduled time ở quá khứ

Khi E03 chọn Scheduled time là thời điểm đã qua:
- Hệ thống hiển thị validation error: "Thời gian gửi phải ở tương lai".
- Không cho phép lưu.

### AE-05: Xóa email đã phát hành (Published)

Khi E03 nhấn Xóa một email có status "Published":
- **Chưa rõ behavior** — cần xác nhận với client: có cho phép xóa không, hay chỉ cho phép Archive?
- Ghi vào Q&A / Ambiguities.

### AE-06: Lỗi mạng khi lưu

Khi hệ thống gặp lỗi network/timeout trong quá trình Save:
- Hiển thị toast "Lưu thất bại. Vui lòng kiểm tra kết nối và thử lại."
- Form vẫn giữ dữ liệu đã nhập; không mất data.

---

## Acceptance Criteria

### AC-01: Notification Type Settings — Hiển thị đúng nhóm

```gherkin
Given System Admin mở trang Notification Settings
When trang load thành công
Then hiển thị đúng 6 nhóm notification:
  - Company Notification (icon: building)
  - Order/Item Notification (icon: box)
  - Delivery Notification (icon: truck)
  - Driver Notification (icon: license)
  - User Notification (icon: person)
  - Package/Contract Notification (icon: package)
And mỗi nhóm hiển thị toggle ON/OFF và trạng thái hiện tại
```

### AC-02: Toggle bật nhóm notification

```gherkin
Given System Admin ở trang Notification Settings
When System Admin bật toggle của nhóm "Company Notification"
Then hệ thống hiển thị bộ lọc: Plan selector, Company selector
And hiển thị bảng danh sách Company sẽ nhận thông báo (# / Plan / Company / Action)
And trạng thái toggle hiển thị ON
```

### AC-03: Lưu cấu hình notification

```gherkin
Given System Admin đã cấu hình bộ lọc cho ít nhất 1 nhóm notification
When System Admin nhấn nút Lưu (Save)
Then hệ thống lưu cấu hình thành công
And hiển thị toast "Lưu thành công"
And hệ thống bắt đầu áp dụng cấu hình mới cho các notification gửi ra sau đó
```

### AC-04: Email Management — Hiển thị danh sách

```gherkin
Given System Admin mở trang Email Management [AW_NOTI_003]
When trang load thành công
Then hiển thị bảng danh sách email notification với các cột:
  - # (STT)
  - Title + Content preview (2 dòng)
  - Tags/Audience (dạng chip/tag)
  - Scheduled datetime
  - Status
  - Action (Edit/Delete)
And bảng có phân trang
And có ô tìm kiếm và bộ lọc theo khoảng thời gian
```

### AC-05: Tạo Email Notification

```gherkin
Given System Admin ở trang tạo email [AW_NOTI_004]
When System Admin nhập Title, nội dung Rich Text, scheduled time (tùy chọn)
And nhấn Lưu (Save)
Then hệ thống tạo email notification thành công
And email xuất hiện trong danh sách [AW_NOTI_003]
And nếu có scheduled time → status là "Scheduled"; nếu không → status là "Published" hoặc "Sent"
```

### AC-06: Validation Title bắt buộc

```gherkin
Given System Admin ở form tạo/sửa email [AW_NOTI_004]
When System Admin để trống Title và nhấn Save
Then hệ thống không lưu
And hiển thị inline error "Tiêu đề là bắt buộc" dưới trường Title
And form không navigate
```

### AC-07: Validation Scheduled time

```gherkin
Given System Admin nhập Scheduled time là thời điểm trong quá khứ
When System Admin nhấn Save
Then hệ thống không lưu
And hiển thị inline error "Thời gian gửi phải ở tương lai"
```

### AC-08: Rich Text Editor toolbar

```gherkin
Given System Admin đang soạn nội dung email [AW_NOTI_004]
When Rich Text Editor hiển thị
Then toolbar có các nút: Bold, Italic, Strikethrough, Bulleted List, Numbered List, Quote, Horizontal Rule, Align Left/Center/Right, Insert Link, Remove Link, Read More, Custom toolbar
And có nút "Add Media" để đính kèm file/ảnh
And có Word count hiển thị ở footer editor
```

### AC-09: Tìm kiếm email

```gherkin
Given System Admin ở trang Email Management [AW_NOTI_003]
When System Admin nhập từ khóa vào ô tìm kiếm và nhấn Search (hoặc Enter)
Then hệ thống lọc danh sách theo title hoặc nội dung chứa từ khóa
When không có kết quả
Then hiển thị trạng thái Empty: "Không tìm thấy kết quả"
```

### AC-10: Xóa Email Notification

```gherkin
Given System Admin chọn "Xóa" một email trong danh sách
When System Admin xác nhận xóa
Then hệ thống xóa record khỏi danh sách
And hiển thị toast "Xóa thành công"
```

---

## Out of Scope

Những gì **KHÔNG** thuộc phạm vi feature `notification-management` này:

1. **E01 Mobile — Cài đặt push notification** (toggle tắt/bật trên app user) → đã thuộc SF-01 của `system-other/SPEC.md`.
2. **E02 Company Admin — Xem danh sách thông báo** (E02 nhận thông báo, không quản lý) → đã thuộc SF-03 của `system-other/SPEC.md`.
3. **Notification template management** (template email/push riêng biệt) → chưa có trong Figma; nếu cần → tạo SPEC mới.
4. **Analytics / Delivery report** (tỷ lệ mở email, click rate) → không thấy trong Figma, chưa trong scope.
5. **SMS notification** → không đề cập trong Figma; chưa trong scope Phase 2.
6. **Unsubscribe management** (E02/E04/E05 opt-out) → không thấy trong Figma; ghi vào Q&A.
7. **Attachment management riêng** (thư viện file đính kèm) → file đính kèm là inline trong Rich Text Editor, không có màn hình riêng.
8. **Localization / đa ngôn ngữ nội dung** → nội dung tiếng Nhật (như sample trong Figma) được nhập thủ công bởi admin; hệ thống không tự dịch.

---

## Screens

> Tổng: **4 màn hình** (E03 System Admin Web)
> Module prefix: `AW` (Admin Web = E03 `es-kitchen-web-admin`)
> Feature code: `NOTI` (Notification Management)

| Screen Code | Screen Name | Actor | App | Screen Type | Transition To | Figma Link |
|---|---|---|---|---|---|---|
| AW_NOTI_001 | Notification Settings | E03 | E03 | Settings | [Save OK] → toast / [Toggle] → AW_NOTI_001 (reload) | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16661-110426 |
| AW_NOTI_002 | Notification Settings (Simplified) | E03 | E03 | Settings | Same as AW_NOTI_001 | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=30112-306327 |
| AW_NOTI_003 | Email Management List | E03 | E03 | List | [Create] → AW_NOTI_004 / [Edit] → AW_NOTI_004 / [Delete] → confirm modal | https://www.figma.com/design/VKAAOyoSPvgoB3H2qdeeV3/ES-Kitchen-phase-2?node-id=16651-25433 |
| AW_NOTI_004 | Email Notification Create/Edit | E03 | E03 | Form | [Save] → AW_NOTI_003 / [Cancel] → AW_NOTI_003 | *(Designer điền)* |

> **Ghi chú:**
> - AW_NOTI_001 và AW_NOTI_002 là 2 variant của cùng một màn hình cấu hình notification — v2 (AW_NOTI_002) có ít section hơn (không có section soạn thảo nội dung inline). Cần xác nhận với BrSE/Designer xem đây là 2 state khác nhau hay 2 màn hình riêng biệt.
> - AW_NOTI_004 không có Figma frame riêng — suy luận từ Edit noti (v1) section soạn thảo nội dung.
> - `*` = cần Designer tạo và điền Figma Link.

---

## Screen Details

### AW_NOTI_001 — Notification Settings

**Layout:** Web admin layout — Sidebar (210px) + Header (54px) + Content area (1232px wide).
Content area: Page header với breadcrumb + title + 3 buttons (Save/Cancel/Draft). Body: 2 collapsible sections dọc.

**Happy Case:**

**Section A — Notification Type Settings (Collapsible, mở mặc định):**

- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Collapsible Tab | "Cài đặt loại thông báo" (tên section) | Click collapse/expand |
  | Body - Row 1 | Toggle Section: Company | Icon building + Label "Company Notification" + Switch ON/OFF ở cuối | Toggle bật/tắt |
  | Body - Row 1 - Filter | Input dropdown | Label "Plan" (placeholder) | Chọn Plan để lọc |
  | Body - Row 1 - Filter | Input dropdown | Label "Company" (placeholder) | Chọn Company để lọc |
  | Body - Row 1 - Table | Data Table | Cột: # / Plan / Company / Action (edit icon) — 5 rows sample | Click Action → sửa record |
  | Body - Row 2 | Toggle Section: Order/Item | Icon box + Label "Order Notification" + Switch ON/OFF | Toggle bật/tắt |
  | Body - Row 2 - Filter | Input dropdown | Kế hoạch (Plan) / Company filters | Chọn filter |
  | Body - Row 2 - Table | Data Table | Cột: # / Plan / Company / Action — 5 rows sample | — |
  | Body - Row 3 | Toggle Section: Delivery | Icon truck + Label "Delivery Notification" + Switch ON/OFF | Toggle bật/tắt |
  | Body - Row 3 - Table | Data Table | Same structure | — |
  | Body - Row 4 | Toggle Section: Driver | Icon license + Label "Driver Notification" + Switch ON/OFF | Toggle bật/tắt |
  | Body - Row 4 - Table | Data Table | Cột: # / Driver name / Action | — |
  | Body - Row 5 | Toggle Section: User | Icon person + Label "User Notification" + Switch ON/OFF | Toggle bật/tắt |
  | Body - Row 5 - Table | Data Table | Cột: # / Plan / User / Action | — |
  | Body - Row 6 | Toggle Section: Package/Contract | Icon package + Label "Package Notification" + Switch ON/OFF | Toggle bật/tắt |
  | Body - Row 6 - Filter | Input dropdown | Company filter | — |
  | Body - Row 6 - Table | Data Table | Cột: # / Plan / Company / Action | — |

**Section B — Email Content Editor (Collapsible, mở mặc định):**

- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Header | Collapsible Tab | "Nội dung thông báo" (tên section) | Click collapse/expand |
  | Body | Input Text | Label: "Tiêu đề" (required) — full width | Nhập title |
  | Body | Input row | Label: "Thời gian gửi" (Scheduled time) — datetime picker | Chọn ngày giờ |
  | Body | Input row | Label: "Nội dung" (required) — Rich Text Editor | Soạn nội dung |
  | Rich Text — Toolbar top | Buttons | [Add Media] + [Text / HTML toggle buttons] | Insert media |
  | Rich Text — Toolbar bottom | Icon Buttons | Bold, Italic, Strikethrough, \| divider, Bulleted list, Numbered list, Quote, \| divider, Horizontal rule, Align L/C/R, \| divider, Insert Link, Remove Link, Read More, Custom | Formatting |
  | Rich Text — Content Area | TextArea | Placeholder: "Start writing or type / to choose a block..." | Nhập nội dung |
  | Rich Text — Footer | Word count | "Word count: 0" | Read-only |
  | Body | Toggle row | Label: "Gửi kèm Push Notification" + Switch + Checkbox "Gửi đến [audience]" | Bật/tắt push |

**Page Header Buttons:**
| Button | Label | Action |
|---|---|---|
| Primary | "Lưu" / "Save" | Submit toàn bộ form |
| Secondary | "Hủy" / "Cancel" | Quay về trang trước (AW_NOTI_003 hoặc list) |
| Ghost | "Lưu nháp" / "Save Draft" | Lưu không publish |

**Non-Happy Case:**
| Trigger | Hiển thị | Message |
|---|---|---|
| Save khi Title trống | Inline error | "Tiêu đề là bắt buộc" (màu đỏ dưới field) |
| Scheduled time ở quá khứ | Inline error | "Thời gian gửi phải ở tương lai" |
| Lỗi mạng khi Save | Toast error | "Lưu thất bại. Vui lòng thử lại." |
| Tắt toggle nhóm đang bật | Confirm dialog | "Tắt nhóm này sẽ ngừng gửi tới [N] đối tượng. Xác nhận?" |

**Interactions:**
- Toggle ON: mở expand sub-content (filter + table) bên dưới nhóm đó.
- Toggle OFF: collapse sub-content.
- Collapsible section click: expand/collapse toàn section A hoặc B.

---

### AW_NOTI_002 — Notification Settings (Simplified / Variant)

**Layout:** Giống AW_NOTI_001 nhưng không có Section B (Content Editor). Chỉ có Section A (6 nhóm toggle + filter).

> **Ambiguity:** Chưa rõ đây là state khác của cùng màn hình (khi user collapse section B) hay là 1 màn hình riêng cho profile quyền hạn khác. → Ghi vào Q&A.

**Happy Case:**
- Identical với AW_NOTI_001 Section A.

---

### AW_NOTI_003 — Email Management List

**Layout:** Web admin layout — Sidebar + Header + Content area.
Content: Page header (title + "Create" button). Body: Toolbar filter + Data Table.

**Happy Case:**

- Components:
  | Vị trí | Component | Nội dung | Action |
  |---|---|---|---|
  | Page Header | Title | Tên trang email management | — |
  | Page Header | Button primary | "Tạo mới" / "Create" | → AW_NOTI_004 |
  | Toolbar — Collapse tab | Collapse toggle | Hiện/ẩn bộ lọc | Click |
  | Toolbar — Filter row | Search input | Tìm theo keyword | Nhập + Enter/Search |
  | Toolbar — Filter row | Date range picker | Lọc theo khoảng thời gian | Chọn ngày bắt đầu - kết thúc |
  | Toolbar — Filter row | Dropdown sort | Sắp xếp theo cột | Chọn |
  | Toolbar — Filter row | Button "Search" | Áp dụng filter | Click → reload table |
  | Toolbar — Filter row | Button "Reset" | Xóa filter | Click → reset |
  | Data Table | Row #1 | Số thứ tự (STT) | — |
  | Data Table | Row — Title+Content | Title (bold, 1 dòng) + Body preview (2 dòng, truncate) | — |
  | Data Table | Row — Tags | Chip/Tag audience (Plan name, Company name) — multi tag | — |
  | Data Table | Row — Scheduled time | "2026-02-10 09:00" format | — |
  | Data Table | Row — Status | Badge: Draft / Scheduled / Sent / Failed | — |
  | Data Table | Row — Action | Icon Edit + Icon Delete | Edit → AW_NOTI_004 / Delete → confirm |
  | Table Footer | Pagination | Tổng records, trang hiện tại, nút prev/next | Navigate |

**Sample data (từ Figma):**
- Row data: ID=12444, Title="自動請求書照合ソフトウェアのアップグレード計画", Preview="スケジュール通知：来月初めに、プレミアムプランを利用しているすべての企業に対して新しい電子請求書機能を自動的に有効化します。", Scheduled="2026-02-10 09:00"

**Non-Happy Case:**
| Trigger | Hiển thị | Message |
|---|---|---|
| Không có email nào | Empty state | "Chưa có email notification nào. Nhấn 'Tạo mới' để bắt đầu." |
| Search không có kết quả | Empty state | "Không tìm thấy kết quả phù hợp." |
| Lỗi load danh sách | Error state | "Tải dữ liệu thất bại. Vui lòng thử lại." + Retry button |
| Xóa record → Confirm xóa | Confirm modal | "Bạn có chắc chắn muốn xóa email này?" + [Xóa] / [Hủy] |

---

### AW_NOTI_004 — Email Notification Create/Edit

> **Note:** Màn hình này là form soạn thảo chi tiết — không có Figma frame độc lập; suy luận từ AW_NOTI_001 Section B và bối cảnh Email Management. Designer cần tạo mới.

**Layout:** Web admin layout — Sidebar + Header + Content area.
Content: Page header (title "Tạo email" hoặc "Sửa email" + breadcrumb + Save/Cancel/Draft buttons). Body: 2 sections (Section cấu hình gửi + Section nội dung).

**Happy Case:**

**Section 1 — Cấu hình gửi:**
| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Row | Toggle Company Notification | Label + Switch | Bật/tắt gửi đến Company |
| Row | Toggle Order Notification | Label + Switch | Bật/tắt gửi đến Order targets |
| Sub-row (khi toggle ON) | Filter: Plan | Dropdown — chọn Kế hoạch | Lọc audience |
| Sub-row (khi toggle ON) | Filter: Company | Dropdown multi-select — chọn Company | Lọc audience |
| Sub-row (khi toggle ON) | Table | Danh sách đối tượng sẽ nhận — Plan / Company / Action | Xem / remove |

**Section 2 — Nội dung email:**
| Vị trí | Component | Nội dung | Action |
|---|---|---|---|
| Row | Input: Tiêu đề | Text field (required), full-width | Nhập |
| Row | Input: Thời gian gửi | Datetime picker (optional) | Chọn ngày/giờ |
| Row | Rich Text Editor | Toolbar + Content area + Footer word count | Soạn nội dung |
| Row | Toggle: Push notification | Switch + Checkbox audience | Bật/tắt gửi kèm push |

**Non-Happy Case:**
| Trigger | Hiển thị | Message |
|---|---|---|
| Title trống | Inline error (field) | "Tiêu đề là bắt buộc" |
| Scheduled time quá khứ | Inline error (field) | "Thời gian gửi phải ở tương lai" |
| Lỗi Submit | Toast | "Lưu thất bại. Vui lòng thử lại." |
| Chưa chọn audience | Warning (TBD) | Xem Q&A AE-02 |

---

## UX Review Notes

**UX:** Happy Path để tạo email notification cần khoảng 5–7 bước (mở trang → cấu hình audience → nhập title → soạn nội dung → lưu) — trong ngưỡng chấp nhận. Không có pre-fill vì là nội dung mới hoàn toàn. CTA chính "Lưu" ở page header trên cùng — có thể khó thấy nếu user đang cuộn xuống soạn nội dung → đề xuất thêm floating Save button ở bottom hoặc sticky header khi scroll.

**Information Design:** Toggle nhóm notification và bảng target hiển thị inline trong cùng màn hình — logic rõ, nhất quán. Tuy nhiên 6 nhóm toggle + bảng mỗi nhóm sẽ tạo một màn hình rất dài → đề xuất lazy-load/collapse mặc định cho các nhóm đang OFF. Label "Input Label" trong Figma chưa được điền nội dung thật — cần Designer/BrSE xác nhận tên thật cho từng toggle section và cột bảng.

**Performance:** AW_NOTI_001 load 6 bảng danh sách (6 groups × N rows) — nếu N lớn (>100 rows/group), cần pagination per group hoặc lazy-load. AW_NOTI_003 (Email list) cần pagination chuẩn. Rich Text Editor cần lazy-load component.

---

## Responsive Requirements

Feature này target **Web app (desktop)** — E03 System Admin Web.

| Breakpoint | Screen size (W×H) | Layout notes |
|---|---|---|
| Desktop (primary) | 1440×1024 | Layout chuẩn — Sidebar 210px + Content 1232px; đây là kích thước Figma design |
| Desktop (minimum) | 1280×768 | Sidebar collapse về icon-only; content area co lại |

**Quy tắc:**
- Navigation: Sidebar trái fixed 210px (có thể collapse về icon-only).
- Bảng dữ liệu: horizontal scroll nếu content vượt viewport.
- Form fields: 2 columns (width ~260px/field) với gap giữa.
- Rich Text Editor: full-width trong content area.
- Không cần responsive cho mobile/tablet — E03 chỉ dùng desktop.

---

## Q&A / Ambiguities

Những điểm chưa được xác nhận trong Figma — cần làm rõ với BrSE/Client trước khi vào Design-Technical.md:

| # | Câu hỏi | Ảnh hưởng | Ưu tiên |
|---|---|---|---|
| Q-01 | Tên thật của từng section toggle là gì? Figma hiển thị "Input Label" placeholder cho tất cả 6 nhóm. Cần tên tiếng Nhật/tiếng Anh chính xác. | AW_NOTI_001 UI text, API enum value | High |
| Q-02 | AW_NOTI_001 và AW_NOTI_002 — đây là 2 state của cùng 1 màn hình (với/không có Section B), hay 2 màn hình riêng cho quyền hạn khác nhau? | Routing, screen count | High |
| Q-03 | Khi E03 tắt toggle một nhóm đang bật, các email đã lên lịch (scheduled) của nhóm đó có bị hủy không? | Backend logic, UX confirm dialog | Medium |
| Q-04 | Khi bật toggle Company Notification mà không chọn Company/Plan nào → gửi đến tất cả hay hiện warning? | Validation logic, UX | Medium |
| Q-05 | Email đã Published (đã gửi) — có cho phép Edit và Xóa không? Nếu có thì khi sửa email đã gửi → behavior là gì (versioning, re-send)? | CRUD permission, backend | Medium |
| Q-06 | Status của email notification gồm những giá trị nào? (Draft / Scheduled / Sent / Failed — hay có thêm?) | Bảng AW_NOTI_003 cột Status | Medium |
| Q-07 | Tên cột chính xác của bảng trong AW_NOTI_003: cột Tags/Audience hiển thị gì? (Plan name, Company name, hay category label?) | Designer, QC | Low |
| Q-08 | Attachment trong email (qua "Add Media") — upload lên S3 hay embed inline? Giới hạn dung lượng? | Backend storage, validation | Low |
| Q-09 | Unsubscribe — E02/E04/E05 có thể opt-out nhận email không? | Out-of-scope xác nhận | Low |
| Q-10 | Số notification ID (ví dụ "12444" trong Figma) — là auto-increment hay UUID? Hiển thị cho user dùng để làm gì? | Data model | Low |
