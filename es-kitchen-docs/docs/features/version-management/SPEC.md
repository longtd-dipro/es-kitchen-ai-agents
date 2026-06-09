# SPEC: Version Management (Mobile App)

> **Loại:** Cross-repo (Admin web + Mobile app + API)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-admin` (E03) · `es-kitchen-payment-app` (E01)
> **Actor chính:** System Admin (E03) — quản lý version; End User (E01) — bị Force Update / nhận thông tin version mới
> **Ngày:** 2026-06-02
> **Status:** Draft
> **Source:** `es-kitchen-requirements/version_management/requirement.md` + assets `version_1.png`, `version_2.png`
> **Liên quan:** Mobile Version Rule trong `.claude/context/specification.md` (DEV `0.0.x` / STG `0.1.x` / PROD `1.0.x`)

---

## 1. Mô tả nghiệp vụ

System Admin có thể **quản lý các version mobile app (E01)** theo `platform × environment`. Khi có version mới release, Admin nhập thông tin vào hệ thống. Mobile app khi launch sẽ check version → nếu bản đang dùng cũ hơn version yêu cầu:

- **Force Update = ON** → block usage, hiển thị popup buộc update
- **Force Update = OFF** → hiển thị popup gợi ý (có nút "Update later" / "Update now")

Mục tiêu: kiểm soát version người dùng đang dùng, đảm bảo bug fix critical được rollout.

---

## 2. Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| System Admin (E03) | Tạo/sửa/xóa version record, bật/tắt force update | Có quyền "Version Management" |
| End User (E01) | Nhận popup khi version cũ | Đã cài app, có kết nối mạng |

**Scope:** chỉ mobile app E01 (iOS + Android). Web các E khác không trong scope *(OQ-1)*.

---

## 3. Happy Path — Admin tạo Version mới

1. Admin vào **System → Version Management → Add Version**
2. Form (`version_1.png`):
   - **Platform** — iOS / Android (radio hoặc dropdown)
   - **Version Name** — vd `1.0.5`
   - **Version Code** — số nguyên tăng dần (Android: `versionCode`; iOS: `CFBundleVersion`)
   - **Environment** — dev / stg / prod
   - **Description** — release notes
   - **Download URL** — link App Store / TestFlight / APK *(OQ-2)*
   - **Force Update** — toggle
3. Submit → popup warning + confirm (theo Common Rules)
4. Confirm → save record

## 4. Happy Path — Admin sửa Version

1. Admin click Edit row → form pre-fill
2. Sửa các field — đặc biệt: **Force Update toggle** thường được bật/tắt sau khi observe issue real
3. Bật Force Update → popup warning đặc biệt (impact lớn — block user)
4. Confirm → update

## 5. Happy Path — Admin xóa Version

1. Click Delete → popup warning + confirm
2. Logical delete
3. *OQ-3: behavior khi user đang ở version đó? Vẫn được dùng hay popup "Version not supported"?*

## 6. Happy Path — Admin filter

1. Filter dropdown: Platform (All / iOS / Android), Environment (All / dev / stg / prod)
2. List update theo filter
3. *OQ-4: sort theo Version Code desc mặc định?*

## 7. Happy Path — End User launch app

1. App start → gọi API check version với `(platform, environment, current_version_code)`
2. API trả về:
   ```json
   {
     "latest_version_name": "1.0.5",
     "latest_version_code": 105,
     "force_update": true,
     "download_url": "...",
     "release_notes": "..."
   }
   ```
3. App so sánh `current_version_code` < `latest_version_code`:
   - **Yes + force_update = true** → popup "Bắt buộc cập nhật", chỉ có nút "Update now" → tap → mở download_url
   - **Yes + force_update = false** → popup "Có version mới", 2 nút "Update later" / "Update now"
   - **No (already latest)** → không popup
4. *OQ-5: popup show trên screen nào (splash, home)? Show 1 lần hay mỗi launch?*

---

## 8. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| User offline khi launch | Skip check, dùng cached info nếu có *(OQ-6)* |
| API check version fail | *OQ-7: assume latest (skip popup) hay assume cũ (force popup)?* |
| User từ chối update khi force_update = true | App ở splash, không vào được home — chỉ có nút Update now |
| Version Code không tăng đúng (Admin nhập sai) | Validate inline: phải > version code cũ của cùng platform/env *(OQ-8)* |
| iOS user — Download URL trỏ về App Store | Mở Safari → App Store |
| Android user — Download URL có thể là APK | Cảnh báo "Install from unknown source"? *(OQ-9)* |
| Bật force update, user đang ở giữa transaction payment | *(OQ-10)* Cho hoàn tất hay force update ngay? |
| Force update nhưng store chưa approve version mới | Tình huống nguy hiểm — *OQ-11: cơ chế rollback Force Update nhanh chóng?* |
| 2 version cùng số trên cùng platform/env | Validate unique (`platform × env × version_code`) |
| Description rỗng | Cho phép — không bắt buộc |
| Force update bật cho DEV/STG env | Cảnh báo nhẹ vì dev/stg ít user nhưng vẫn ảnh hưởng tester |

---

## 9. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Admin có thể tạo version với đủ fields: platform, version name, version code, environment, description, download URL, force update |
| AC-02 | Validate: version code phải tăng dần so với version cũ của cùng platform × env |
| AC-03 | Validate: `(platform × env × version_code)` unique |
| AC-04 | Action Create / Update / Delete / Enable Force Update có popup warning + confirm (Common Rules) |
| AC-05 | Bật Force Update có popup warning đặc biệt (impact cao) |
| AC-06 | Admin có thể filter list theo platform / environment |
| AC-07 | API check version trả về đúng version mới nhất theo `(platform, environment)` của request |
| AC-08 | Mobile app E01 hiển thị popup Force Update khi `current_version_code < latest_version_code` và `force_update = true` |
| AC-09 | Mobile app E01 hiển thị popup Optional Update (có nút Later) khi `force_update = false` |
| AC-10 | Khi Force Update ON, user không thể bypass — chỉ có nút Update now |
| AC-11 | Audit log: ai tạo/sửa/xóa/bật force, khi nào, version gì |
| AC-12 | Tuân thủ Mobile Version Rule: DEV `0.0.x`, STG `0.1.x`, PROD `1.0.x` — validate format |

---

## 10. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng |
|---|---|---|
| OQ-1 | Có áp dụng cho web (E02/E03/E04/E05/E06) không? (force refresh CDN nếu version cũ) | 🟠 Medium |
| OQ-2 | Download URL — App Store URL cố định hay nhập mới mỗi version? Android: APK trực tiếp hay Play Store? | 🟡 High |
| OQ-3 | Xóa version: user đang ở version đó vẫn dùng được hay bị block? | 🟡 High |
| OQ-4 | Sort default: Version Code desc? Created date desc? | 🟠 Low |
| OQ-5 | Popup hiển thị tại screen nào — splash, home? Tần suất nếu Optional Update? | 🟡 High |
| OQ-6 | User offline khi launch — skip check, dùng cached info? | 🟠 Medium |
| OQ-7 | API check fail — assume latest (skip) hay assume cũ (force popup)? | 🟡 High |
| OQ-8 | Version Code phải > version code cũ — validate chặt? Cho phép insert version cũ (vd hotfix branch)? | 🟡 High |
| OQ-9 | Android APK direct download — có hỗ trợ không? (chỉ Play Store?) | 🟠 Medium |
| OQ-10 | Force update bật khi user đang payment — cho hoàn tất hay force ngay? (đồng bộ với maintain SPEC OQ-5) | 🔴 Critical |
| OQ-11 | Cơ chế tắt force update nhanh khi store chưa approve — có dashboard kill switch không? | 🔴 Critical |
| OQ-12 | Description có hỗ trợ multi-language không (JP/VN/EN)? | 🟡 High |
| OQ-13 | Description có hỗ trợ markdown/rich text? | 🟠 Low |
| OQ-14 | Có gửi push notification "Version mới available" không, hay chỉ popup khi launch? | 🟠 Medium |
| OQ-15 | API check version endpoint: 1 endpoint trả tất cả (filter theo platform/env query), hay endpoint riêng? | 🟠 Medium |
| OQ-16 | Khi version DEV/STG được tạo, có cảnh báo Admin "chỉ tester biết" để tránh nhầm với PROD? | 🟠 Low |

---

## 11. Out of Scope

- Auto OTA update (over-the-air, không qua store) — tuân thủ store policy
- A/B testing version
- Beta channel / Release channel multiple
- Version diff / changelog auto-compare
- Rollback user về version cũ
- Update web app version (chỉ CDN cache invalidate, không trong scope)
- Multi-language description (Phase sau)

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Version Management List | System Admin | E03 (System Admin Web) | Danh sách version records, filter theo platform / environment, action Edit / Delete |
| Add Version Form | System Admin | E03 (System Admin Web) | Form tạo version mới: platform, version name, version code, environment, description, download URL, force update toggle |
| Edit Version Form | System Admin | E03 (System Admin Web) | Form sửa version đã có, pre-fill data; bật Force Update hiện popup warning đặc biệt |
| Force Update Popup (Mobile) | End User | E01 (Mobile App) | Popup block usage khi `force_update = true` và version cũ hơn; chỉ có nút "Update now" |
| Optional Update Popup (Mobile) | End User | E01 (Mobile App) | Popup gợi ý update khi `force_update = false` và version cũ hơn; có nút "Update later" và "Update now" |

---

## Bước tiếp theo

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/version-management/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/version-management/SPEC.md)
