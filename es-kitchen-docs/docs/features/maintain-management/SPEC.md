# SPEC: Maintenance Management (Mobile App)

> **Loại:** Cross-repo (Admin web + Mobile app + API)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-admin` (E03) · `es-kitchen-payment-app` (E01)
> **Actor chính:** System Admin (E03) — bật/tắt; End User (E01) — bị ảnh hưởng
> **Ngày:** 2026-06-02
> **Status:** Draft
> **Source:** `es-kitchen-requirements/maintain/requirement.md`

---

## 1. Mô tả nghiệp vụ

System Admin có thể **bật / tắt chế độ maintenance** cho từng tổ hợp `platform × environment` của mobile app. Khi maintenance ON:

- Mobile app gọi API status → nhận response maintenance
- App hiển thị **popup maintenance** và **block toàn bộ usage** đến khi maintenance OFF

Mục tiêu: cho phép vận hành (deploy / DB migration / fix hot bug) mà không để end user thao tác gây lỗi data.

---

## 2. Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| System Admin (E03) | Bật/tắt maintenance theo platform + environment | Có quyền "Maintenance Management" |
| End User (E01) — iOS / Android | Bị block khi maintenance ON | Đã cài app, có kết nối mạng để check status |

**Scope ban đầu:** chỉ mobile app E01. Web (E02/E03/E04/E05/E06) chưa trong scope *(OQ-1)*.

---

## 3. Happy Path — Admin bật Maintenance

1. Admin vào **System → Maintenance Management**
2. Hiển thị bảng matrix `platform × environment`:

| Platform | DEV | STG | PROD | |
|---|---|---|---|---|
| iOS | OFF | OFF | OFF | toggle/cell |
| Android | OFF | OFF | OFF | toggle/cell |

3. Admin click toggle 1 cell (ví dụ iOS-PROD) → **popup warning + confirm** *(theo Common Rules)*
4. Confirm → API update status → toggle ON
5. Mobile app E01 (iOS-PROD) gọi check API → nhận `maintenance: true` → show popup, block usage

## 4. Happy Path — Admin tắt Maintenance

1. Tương tự bước 3-4 nhưng toggle OFF
2. App lần check tiếp theo → `maintenance: false` → đóng popup, mở lại app

## 5. Happy Path — End User trong khi Maintenance ON

1. User mở app → app gọi API check maintenance status
2. Response `maintenance: true` → app hiển thị popup full-screen, block điều hướng
3. *OQ-2: nội dung popup — text cố định hay Admin nhập custom message?*
4. User chỉ có thể: đóng app, đợi → mở lại để check tiếp
5. *OQ-3: có nút "Check now" để retry không?*

---

## 6. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| User đang dùng app, maintenance bật giữa chừng | *OQ-4: app polling check theo interval bao lâu? Hay chỉ check khi launch?* |
| User offline khi maintenance bật | App cached → không biết maintenance → khi online lại check thấy → mới hiện popup |
| User đang trong payment flow giữa chừng | *OQ-5: cho phép hoàn tất transaction hiện tại hay force stop ngay?* |
| Maintenance bật trên PROD nhưng user dùng DEV build | App đọc env config → chỉ check status đúng env của build |
| API check maintenance lỗi | *OQ-6: assume OFF (fail open) hay assume ON (fail closed)?* |
| Admin bật maintenance cho 1 platform → user platform khác | Không bị ảnh hưởng |
| Maintenance ON quá lâu | *OQ-7: có cơ chế cảnh báo Admin "đã maintenance > X giờ"?* |

---

## 7. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Admin có thể bật/tắt maintenance riêng cho từng `platform × environment` (6 cell) |
| AC-02 | Action bật/tắt có popup warning + confirm |
| AC-03 | API trả về đúng trạng thái maintenance theo platform + environment của request |
| AC-04 | Mobile app E01 hiển thị popup maintenance khi nhận `maintenance: true` |
| AC-05 | Khi maintenance ON, app block usage — user không thao tác được tính năng khác |
| AC-06 | Khi maintenance OFF, app đóng popup tự động ở lần check kế tiếp |
| AC-07 | Audit log: ai bật/tắt, khi nào, platform + env nào |
| AC-08 | Chỉ Admin có quyền Maintenance Management mới bật/tắt được |
| AC-09 | Maintenance setting persist khi server restart |

---

## 8. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng | Ảnh hưởng |
|---|---|---|---|
| OQ-1 | Maintenance áp dụng cho web nào ngoài mobile? E02 Company Admin? | 🟡 High | Scope feature |
| OQ-2 | Popup maintenance: text cố định hay Admin nhập custom message (multi-language)? | 🟡 High | Admin UI + i18n |
| OQ-3 | App có nút "Check now" / "Retry" trong popup không? Hay auto-poll? | 🟠 Medium | Mobile UX |
| OQ-4 | App polling interval khi đã ON: 30s? 1 phút? 5 phút? | 🟡 High | Mobile network usage |
| OQ-5 | User đang giữa payment flow khi maintenance bật — cho hoàn tất hay force stop? | 🔴 Critical | Payment safety, có thể double-charge |
| OQ-6 | API check fail (network) — fail open (cho dùng) hay fail closed (assume maintenance)? | 🟡 High | UX vs Safety trade-off |
| OQ-7 | Cảnh báo Admin nếu maintenance ON quá lâu? Threshold? | 🟠 Medium | Operational |
| OQ-8 | Có schedule maintenance trước (ví dụ "bật từ 2h-4h sáng mai") không? | 🟠 Medium | Feature scope |
| OQ-9 | API endpoint format: 1 endpoint check tất cả, hay endpoint riêng theo platform/env? | 🟠 Medium | API design |
| OQ-10 | Force quit app trong khi maintenance — khi mở lại có lưu state không? | 🟠 Medium | Mobile state handling |

---

## 9. Out of Scope

- Maintenance cho web (E02/E03/E04/E05/E06) — chỉ mobile E01 trong Phase 2
- Schedule maintenance theo lịch (cron)
- Partial maintenance (chỉ block 1 vài tính năng)
- Multi-language popup
- Push notification thông báo trước maintenance
- Tự động unblock theo timer

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| AW_MANT_001 | Maintenance Management — Matrix | System Admin | E03 (System Admin Web) | Settings | Bảng matrix `platform × environment` (iOS/Android × DEV/STG/PROD) với toggle bật/tắt từng cell |
| AW_MANT_002 | Confirm Toggle Maintenance Popup | System Admin | E03 (System Admin Web) | Modal | Popup warning + confirm khi Admin click toggle một cell; hiển thị thông tin platform + env đang thay đổi |
| AW_MANT_003 | Maintenance Audit Log | System Admin | E03 (System Admin Web) | List | Danh sách lịch sử bật/tắt maintenance: ai thực hiện, thời gian, platform + env nào *inferred |
| UA_MANT_001 | Maintenance Block Screen (Popup) | End User | E01 (Mobile App) | Modal* | Full-screen popup block toàn bộ usage khi app nhận `maintenance: true`; user không thao tác được tính năng khác |

---

## Bước tiếp theo

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/maintain-management/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/maintain-management/SPEC.md)
