export const meta = {
  name: 'add-screens-to-specs',
  description: 'Thêm section ## Screens vào tất cả SPEC.md trong features folder',
  phases: [
    { title: 'Update SPECs', detail: 'Mỗi agent đọc 1 SPEC, phân tích screens, ghi lại file' },
  ],
}

const SPEC_FILES = [
  'es-kitchen-docs/docs/features/admin-account-management/SPEC.md',
  'es-kitchen-docs/docs/features/admin-role-permission/SPEC.md',
  'es-kitchen-docs/docs/features/agency-management/SPEC.md',
  'es-kitchen-docs/docs/features/ai-recommendation/SPEC.md',
  'es-kitchen-docs/docs/features/api-hardening/SPEC.md',
  'es-kitchen-docs/docs/features/authentication/SPEC.md',
  'es-kitchen-docs/docs/features/collection-cancellation/SPEC.md',
  'es-kitchen-docs/docs/features/contract-management/SPEC.md',
  'es-kitchen-docs/docs/features/delivery-dispatching/SPEC.md',
  'es-kitchen-docs/docs/features/delivery-driver/SPEC.md',
  'es-kitchen-docs/docs/features/delivery-partner/SPEC.md',
  'es-kitchen-docs/docs/features/guest-mode/SPEC.md',
  'es-kitchen-docs/docs/features/inventory-equipment/SPEC.md',
  'es-kitchen-docs/docs/features/ip-whitelist/SPEC.md',
  'es-kitchen-docs/docs/features/maintain-management/SPEC.md',
  'es-kitchen-docs/docs/features/marketing/SPEC.md',
  'es-kitchen-docs/docs/features/menu-order/SPEC.md',
  'es-kitchen-docs/docs/features/notification-management/SPEC.md',
  'es-kitchen-docs/docs/features/order-list/SPEC.md',
  'es-kitchen-docs/docs/features/payment/SPEC.md',
  'es-kitchen-docs/docs/features/supplier-ordering/SPEC.md',
  'es-kitchen-docs/docs/features/survey-management/SPEC.md',
  'es-kitchen-docs/docs/features/system-other/SPEC.md',
  'es-kitchen-docs/docs/features/user-binding/SPEC.md',
  'es-kitchen-docs/docs/features/user-engagement/SPEC.md',
  'es-kitchen-docs/docs/features/version-management/SPEC.md',
]

phase('Update SPECs')

await pipeline(
  SPEC_FILES,
  async (specPath) => {
    await agent(`
Bạn là BA Agent của ESKITCHEN. Nhiệm vụ: thêm section "## Screens" vào file SPEC.md sau.

**File cần update:** ${specPath}

**Bước 1:** Đọc toàn bộ nội dung file.

**Bước 2:** Phân tích các màn hình (screens) từ Happy Path, User Stories, Acceptance Criteria trong file. Mỗi màn hình là 1 giao diện người dùng thấy trực tiếp.

**Bước 3:** Tạo bảng Screens theo format:

\`\`\`markdown
## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| <tên màn hình rõ nghĩa> | <E01/E02/E03/E04/E05/E06> | <E0X (tên app)> | <nội dung/action chính> |
\`\`\`

Mapping App:
- E01 = es-kitchen-payment-app (mobile)
- E02 = es-kitchen-web-company (Company Admin)
- E03 = es-kitchen-web-admin (System Admin)
- E04 = es-kitchen-web-supplier (Supplier)
- E05 = es-kitchen-web-outsource-web-private (Outsource)
- E06 = es-kitchen-webapp-driver (Driver)

Nếu không đủ thông tin để xác định screen cụ thể → tạo screens hợp lý nhất (~90% đúng), ghi chú "*inferred" cuối tên screen.

**Bước 4:** Chèn section "## Screens" vào file:
- Nếu file có section "## Bước tiếp theo" hoặc "## Out of Scope" → chèn SAU section đó (cuối cùng trước "Bước tiếp theo" nếu có)
- Nếu không có → append xuống cuối file

**Bước 5:** Nếu file có section "## Bước tiếp theo", thêm dòng sau vào cuối section đó (chỉ nếu chưa có):
\`\`\`
→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: ${specPath}"
  (hoặc slash command: /create-ui-design ${specPath})
\`\`\`

**Quan trọng:**
- KHÔNG xóa hay thay đổi nội dung hiện có
- KHÔNG thêm Figma Link column (chưa cần)
- CHỈ thêm section ## Screens và cập nhật Bước tiếp theo
- Ghi lại file với nội dung đã cập nhật bằng Edit tool
`, { label: specPath.split('/').slice(-2, -1)[0], phase: 'Update SPECs' })
  }
)
