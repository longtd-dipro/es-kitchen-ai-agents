# Test Cases Overview — Guest Mode

> **Feature:** Guest Mode (Phase 2)
> **QC Output date:** 2026-06-05
> **Mode:** FULL RBT 6 bước
> **SPEC ref:** `es-kitchen-docs/docs/features/guest-mode/SPEC.md`
> **Scope:** Mobile App E01 + Admin Web E03 + API (indirect)

---

## Tổng số TC

| File | Module | Tổng TC | Critical | High | Medium | Low |
|---|---|---|---|---|---|---|
| `tc_guest_login.md` | Guest Login (US-01) | 15 | 2 | 9 | 3 | 1 |
| `tc_feature_restriction.md` | Feature Restriction (US-02) | 15 | 2 | 10 | 2 | 1 |
| `tc_guest_checkout.md` | Guest Checkout (US-03) | 19 | 6 | 10 | 2 | 1 |
| `tc_link_email.md` | Link Email / Upgrade (US-04) | 29 | 6 | 16 | 5 | 2 |
| `tc_order_history.md` | Order History (US-05) | 8 | 1 | 5 | 2 | 0 |
| `tc_admin_toggle.md` | Admin Toggle (US-06) | 13 | 3 | 8 | 2 | 0 |
| `tc_cross_flow.md` | Cross-Flow / Edge Cases | 13 | 4 | 6 | 2 | 1 |
| **TỔNG** | | **112** | **24** | **64** | **18** | **6** |

### Breakdown theo Type

| Type | Số TC | % |
|---|---|---|
| Positive (Happy Path) | 28 | 25% |
| Negative | 34 | 30% |
| UI Visual (6 states per field) | 26 | 23% |
| Boundary / Edge Case | 24 | 22% |

### Breakdown theo Scope

| Scope | Số TC |
|---|---|
| Mobile App E01 | 82 |
| Admin Web E03 | 13 |
| Cross-flow (E01 + E03 + API) | 17 |

---

## Risk Matrix

> Đánh giá theo xác suất xảy ra lỗi (Likelihood) × mức độ ảnh hưởng nghiệp vụ (Impact).

| Module | Risk Area | Likelihood | Impact | Risk Level | Lý do |
|---|---|---|---|---|---|
| Guest Checkout — guestPaymentAllowed toggle OFF giữa checkout | Race condition / edge case | Medium | Critical | **HIGH** | Guest bị charge lỗi hoặc order sai trạng thái |
| Link Email — Email collision (full account) | Người dùng nhớ nhầm email | High | High | **HIGH** | Data không được merge nhưng UX tệ nếu message không rõ |
| Guest Login — API failure (tạo guest thất bại) | Network / server instability | Medium | High | **HIGH** | Người dùng bị stuck ở Login screen, mất onboarding |
| Feature Restriction — Hidden items deeplink bypass | Security edge case | Medium | High | **HIGH** | Guest truy cập được trang protected qua deeplink |
| Guest Checkout — Cash payment option xuất hiện với guest | Dev bỏ sót điều kiện | Low | Critical | **HIGH** | Vi phạm BR-03, khách hàng có thể đặt hàng COD không thu được tiền |
| Link Email — OTP expire / resend race condition | Timing issue | Medium | Medium | **MEDIUM** | Người dùng bị stuck ở OTP screen |
| Admin Toggle — Default value company mới | Config error | Low | High | **MEDIUM** | Company mới bị tắt guest payment mặc định → giảm onboarding |
| Order History — Data isolation giữa 2 guest sessions | Security | Low | High | **MEDIUM** | Guest xem được order của guest khác |
| Guest Login — Duplicate guest khi double tap | Race condition | Low | Medium | **LOW** | Tạo ra orphan account trong DB |
| Admin Toggle — Toggle không submit cùng form | Dev implement sai | Low | Low | **LOW** | UX không nhất quán, nhưng không mất data |

---

## Coverage Matrix — AC → TC

### US-01: Guest Login

| AC ID | Mô tả ngắn | TC cover |
|---|---|---|
| AC-01-1 | Button hiển thị, không disabled | GM_LOGIN_TC_004 |
| AC-01-2 | Không yêu cầu input, vào app ≤ 3s | GM_LOGIN_TC_005 |
| AC-01-3 | Token lưu secure storage | GM_LOGIN_TC_006 |
| AC-01-4 | API fail → error toast, vẫn ở Login | GM_LOGIN_TC_007, GM_LOGIN_TC_008 |
| AC-01-5 | Re-open: tái dùng session cũ hoặc tạo mới nếu invalid | GM_LOGIN_TC_009, GM_LOGIN_TC_010 |
| AC-01-6 | Xóa app + cài lại → guest mới | GM_LOGIN_TC_011 |

### US-02: Feature Restriction

| AC ID | Mô tả ngắn | TC cover |
|---|---|---|
| AC-02-1 | 7 items hidden hoàn toàn | GM_RESTRICT_TC_002 đến TC_008, TC_015 |
| AC-02-2 | Deeplink bị restrict → redirect | GM_RESTRICT_TC_009, TC_010, TC_011 |
| AC-02-3 | Guest duyệt menu + thêm giỏ hàng | GM_RESTRICT_TC_012 |
| AC-02-4 | Guest xem order history của session | GM_RESTRICT_TC_013 |

### US-03: Guest Checkout

| AC ID | Mô tả ngắn | TC cover |
|---|---|---|
| AC-03-0 | Step nhập Company ID bắt buộc | GM_CHECKOUT_TC_007 |
| AC-03-1 | Cash payment ẩn với guest | GM_CHECKOUT_TC_008, TC_009 |
| AC-03-2 | Company ID không tồn tại → lỗi rõ | GM_CHECKOUT_TC_010, TC_011, TC_012, TC_013 |
| AC-03-3 | guestPaymentAllowed=false → block hoàn toàn | GM_CHECKOUT_TC_014, TC_015 |
| AC-03-4 | guestPaymentAllowed=true → checkout hoàn tất | GM_CHECKOUT_TC_016 |
| AC-03-5 | Toggle OFF giữa checkout → API lỗi phù hợp | GM_CHECKOUT_TC_017, GM_CROSS_TC_003 |

### US-04: Link Email / Upgrade

| AC ID | Mô tả ngắn | TC cover |
|---|---|---|
| AC-04-1 | Email validation trước khi gọi API | GM_LINKEMAIL_TC_009, TC_010, TC_011, TC_012 |
| AC-04-2 | OTP gửi ≤ 60 giây | GM_LINKEMAIL_TC_013 |
| AC-04-3 | OTP đúng → type=registered + features accessible | GM_LINKEMAIL_TC_014, TC_015, TC_029 |
| AC-04-4 | Session token vẫn valid sau upgrade | GM_LINKEMAIL_TC_016 |
| AC-04-5 | Email đã tồn tại → error, không gửi OTP, không merge | GM_LINKEMAIL_TC_017, TC_018, GM_CROSS_TC_004 |
| AC-04-6 | Resend button cooldown 60 giây | GM_LINKEMAIL_TC_019 |
| AC-04-7 | OTP expire 5 phút | GM_LINKEMAIL_TC_020, TC_021 |
| AC-04-8 | Order history giữ lại sau upgrade | GM_LINKEMAIL_TC_028 |

### US-05: Order History

| AC ID | Mô tả ngắn | TC cover |
|---|---|---|
| AC-05-1 | Guest xem order history của mình | GM_HISTORY_TC_002 |
| AC-05-2 | Chỉ hiện orders của session hiện tại | GM_HISTORY_TC_003 |
| AC-05-3 | Xóa app + cài lại → history rỗng | GM_HISTORY_TC_004 |
| AC-05-4 | Sau upgrade: order history giữ nguyên | GM_HISTORY_TC_005 |

### US-06: Admin Toggle

| AC ID | Mô tả ngắn | TC cover |
|---|---|---|
| AC-06-1 | Toggle trong form Edit Company, không tạo tab mới | GM_ADMIN_TC_005, TC_013 |
| AC-06-2 | Default = ON khi tạo mới / chưa có setting | GM_ADMIN_TC_006, TC_007 |
| AC-06-3 | Admin lưu → API cập nhật guestPaymentAllowed | GM_ADMIN_TC_008, TC_009 |
| AC-06-4 | Thay đổi có hiệu lực với checkout tiếp theo | GM_ADMIN_TC_010 |
| AC-06-5 | Toggle submit cùng form (không có endpoint riêng) | GM_ADMIN_TC_011, TC_012 |

### Coverage Summary

| Tổng AC | AC đã cover | AC chưa cover | Coverage % |
|---|---|---|---|
| 23 | 23 | 0 | **100%** |

---

## Coverage Matrix — Business Rules → TC

| BR ID | Rule tóm tắt | TC cover |
|---|---|---|
| BR-01 | Email guest: `guest_<8 alphanum lowercase>@eskitchen.local` | GM_LOGIN_TC_012, TC_013 |
| BR-02 | Account type = `guest` | GM_LOGIN_TC_014, TC_015 |
| BR-03 | Guest không thanh toán tiền mặt | GM_CHECKOUT_TC_008, TC_009 |
| BR-04 | Guest chỉ thanh toán nếu guestPaymentAllowed=true | GM_CHECKOUT_TC_014, TC_016 |
| BR-05 | Default guestPaymentAllowed = true | GM_ADMIN_TC_006, TC_007 |
| BR-06 | Sau link email: type → registered, restrictions gỡ | GM_LINKEMAIL_TC_014, TC_015, TC_029 |
| BR-07 | Guest không có password, upgrade phải set password thủ công | GM_LINKEMAIL_TC_023, TC_024, TC_025 |
| BR-08 | Re-open: tái dùng session cũ hoặc tạo mới | GM_LOGIN_TC_009, TC_010 |
| BR-09 | Company ID không lưu giữa checkout | GM_CHECKOUT_TC_018, TC_019 |
| BR-10 | 7 items hidden (không phải disabled) với guest | GM_RESTRICT_TC_002 đến TC_008, TC_015 |
| BR-11 | Email đã tồn tại (full account) → block | GM_LINKEMAIL_TC_017, GM_CROSS_TC_004 |
| BR-12 | OTP expire 5 phút, cooldown 60s, retry không giới hạn, OTP 4 chữ số | GM_LINKEMAIL_TC_019, TC_020, TC_021, TC_022 |
| BR-13 | Order history filter theo userId; xóa app → history cũ mất; sau upgrade giữ lại | GM_HISTORY_TC_003, TC_004, TC_005, TC_006 |

**BR Coverage: 13/13 = 100%**

---

## Top 5 High-Risk TCs (phải pass trước khi release)

| Rank | TC ID | Mô tả | Risk | Lý do ưu tiên |
|---|---|---|---|---|
| 1 | GM_CROSS_TC_003 | Toggle OFF giữa checkout → API lỗi phù hợp | Critical | Race condition tiền bạc — không silent fail |
| 2 | GM_CHECKOUT_TC_017 | Admin tắt guestPaymentAllowed giữa guest đang thanh toán | Critical | Guest bị charge nhầm hoặc order sai state |
| 3 | GM_CHECKOUT_TC_008 | Cash payment option không xuất hiện với guest | Critical | Vi phạm BR-03, ảnh hưởng thu tiền của supplier |
| 4 | GM_CROSS_TC_004 | Email collision (full account) → block, không merge data | Critical | Data integrity + UX confusion |
| 5 | GM_LINKEMAIL_TC_014 | Full upgrade flow: OTP đúng → type=registered + features accessible | Critical | Core feature value của Guest Mode |

---

## Execution Guidance

### Prerequisites

**Accounts cần chuẩn bị:**

| Role | Account | Ghi chú |
|---|---|---|
| System Admin E03 | `qc_sysadmin_20260605@eskitchen.test` | Quyền edit company settings |
| Company Admin E02 | `qc_e02_admin@eskitchen.test` | Dùng cho TC verify E02 không có toggle |
| Registered User | `qc_restrict_20260605@eskitchen.test` / `Test@12345` | So sánh menu items với guest |
| Email nhận OTP | `qc_link_20260605_001@test.com` | Email inbox truy cập được trong test env |
| Email nhận OTP (expire test) | `qc_link_expire_20260605@test.com` | Email inbox truy cập được |
| Email đã là full account | `existing_full@test.com` | Account đã registered trước đó |

**Test Companies cần chuẩn bị:**

| Company ID | guestPaymentAllowed | Dùng cho |
|---|---|---|
| `COMP-GUEST-ON-001` | true | Happy path checkout |
| `COMP-GUEST-OFF-001` | false | Block checkout test |
| `COMP-TOGGLE-TEST-001` | true → OFF (trong test) | Admin toggle ON→OFF |
| `COMP-TOGGLE-TEST-002` | false → ON (trong test) | Admin toggle OFF→ON |
| `COMP-CROSS-001` | true | Cross-flow TC |
| `COMP-CROSS-002` | true (tắt giữa test) | Race condition toggle |
| `COMP-CROSS-003` | true | Toggle không ảnh hưởng browse |
| `COMP-LEGACY-001` | null (chưa có field) | Default value test |

**elepay Sandbox:**
- Test card: `4000000000000002` / Expiry `12/28` / CVV `123`
- Dùng elepay sandbox endpoint, không phải production

**OTP:**
- OTP sandbox: cần access email inbox của các email test trên môi trường staging
- Nếu staging có OTP override/bypass cho test → dùng bypass code đã thống nhất với dev

### Run Order (theo độ ưu tiên)

```
Phase 1 — Critical TCs trước (Release blocker):
  GM_LOGIN_TC_004, TC_005, TC_007
  GM_RESTRICT_TC_001, TC_009
  GM_CHECKOUT_TC_007, TC_008, TC_014, TC_016, TC_017
  GM_LINKEMAIL_TC_014, TC_017
  GM_ADMIN_TC_008, TC_009, TC_010
  GM_CROSS_TC_001, TC_003, TC_004
  GM_HISTORY_TC_005
  GM_CROSS_TC_012

Phase 2 — High TCs (Should pass):
  Các TC còn lại có Priority = High

Phase 3 — Medium / Low TCs (Nice to run):
  UI Visual TCs, boundary cases, out-of-scope verification
```

### Thời gian estimate

| Phase | Số TC | Thời gian ước tính |
|---|---|---|
| Phase 1 — Critical | 24 | ~6 giờ |
| Phase 2 — High | 64 | ~16 giờ |
| Phase 3 — Medium/Low | 24 | ~5 giờ |
| **Tổng** | **112** | **~27 giờ** |

> Estimate dựa trên ~15 phút/TC (bao gồm chuẩn bị test data và ghi kết quả).

### Môi trường

- **Staging** (ưu tiên) — để verify API integration thật
- **DEV** (nếu Staging chưa deploy) — chỉ cho UI/visual TCs và flow TCs không cần payment
- elepay sandbox: bắt buộc cho mọi TC liên quan payment

---

## Bước tiếp theo sau khi QC hoàn thành

- Khi tìm bug: "Hãy là QC, sinh bug report: `<mô tả lỗi>`" (slash: `/test/generate_bug_report`)
- Khi SPEC update: "Hãy là QC, update test cases cho feature: `guest-mode`" (slash: `/test/update_testcases_from_requirements`)
- Trước release: "Hãy là QC, sinh execution checklist + regression suite cho release: `<release name>`" (slash: `/test/generate_test_execution_checklist`)
- Sau dev xong: "Hãy là QA, verify task này: `<task file path>`"
