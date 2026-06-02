# Test Cases: IP Whitelist & 2FA Access Restriction

> **Feature:** ip-whitelist
> **SPEC:** `es-kitchen-docs/docs/features/ip-whitelist/SPEC.md`
> **DESIGN:** `../es-kitchen-api/DESIGN.md` · `../es-kitchen-web-admin/DESIGN.md`
> **Mode:** QUICK
> **Scope:** Web Admin (E03) UI + Login flow + API enforcement
> **Date:** 2026-06-02
> **Author:** qc-agent
> **Total TCs:** 78

---

## Test data conventions

| Loại | Pattern / Sample |
|---|---|
| IPv4 hợp lệ | `192.168.1.100`, `10.0.0.5`, `203.0.113.45`, `0.0.0.0`, `255.255.255.255` |
| IPv4 sai format | `256.1.1.1`, `192.168.1`, `192.168.1.1.1`, `192.168.01.1`, `not-an-ip` |
| CIDR IPv4 | `192.168.1.0/24`, `10.0.0.0/8`, `172.16.0.0/12`, `0.0.0.0/0` |
| CIDR sai | `192.168.1.0/33`, `192.168.1.0/-1`, `192.168.1.1/24` (host bits set) |
| IPv6 (OQ-11) | `::1`, `2001:db8::1`, `fe80::1`, `2001:db8::/32` |
| Test admin email | `qc_ipwl_<purpose>@eskitchen.test` |
| Test OTP codes | `123456` (valid 6 digit), `12345` (5 digit), `abcdef` (letters), `12345 ` (space) |
| XSS payload (description) | `<script>alert(1)</script>` |
| SQL injection | `'; DROP TABLE admin_ip_whitelist; --` |

## Modules

| ID | Module | Mô tả |
|---|---|---|
| IPWL_LIST | IP Whitelist List Page | Bảng danh sách IP + filter |
| IPWL_FORM | IP Add/Edit Form | IP/CIDR validation, description |
| IPWL_DELETE | IP Delete | Soft delete + master IP protection |
| IPWL_LOGIN | Login Flow with IP check | Whitelist empty/active behaviors |
| IPWL_OTP | OTP Verify Flow | OTP input + verification |
| IPWL_AUDIT | Audit Log | Log all CRUD + OTP attempts |

---

# Module 1: IPWL_LIST — IP Whitelist List Page

## 1.1 UI Visual TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_001 | IPWL_LIST | UI Screen | High | [UI Visual] Verify UI tổng thể trang IP Whitelist | Login admin có `security.ip.view` | 1. Vào System → Security → IP Whitelist | 1. Header "IP Whitelist Management" + button "Add IP" góc phải<br>2. Banner cảnh báo nếu whitelist rỗng: "⚠ Whitelist đang rỗng — tất cả IP đều có thể truy cập"<br>3. Table giữa, pagination dưới | — | Critical |
| ESK_IPWL_TC_002 | IPWL_LIST | UI State - Empty | Critical | [UI Visual] Empty state banner | DB `admin_ip_whitelist` rỗng | 1. Vào trang | 1. Banner màu vàng "⚠ Whitelist rỗng — bảo mật chưa kích hoạt"<br>2. Empty state trong table: "Chưa có IP nào. Thêm IP đầu tiên?" | — | Critical |
| ESK_IPWL_TC_003 | IPWL_LIST | UI State - Loading | Medium | [UI Visual] Loading skeleton | API delay > 500ms | 1. Reload trang | 1. Skeleton 5 row<br>2. Add IP button disabled | — | Medium |
| ESK_IPWL_TC_004 | IPWL_LIST | UI State - Error | High | [UI Visual] Error state khi API fail | API trả 500 | 1. Mock API 500<br>2. Reload | 1. "Không tải được danh sách. [Retry]" | — | High |
| ESK_IPWL_TC_005 | IPWL_LIST | UI Filter | Medium | [UI Visual] Filter "Enabled status" dropdown | Đã vào trang | 1. Quan sát filter dropdown | 1. 3 options: All / Enabled only / Disabled only<br>2. Default "All" | — | Medium |

## 1.2 Logic TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_006 | IPWL_LIST | Display | High | Check hiển thị đầy đủ cột | DB có 3 IP entries | 1. Vào trang | 1. Table có cột: IP/CIDR, Description, Enabled, Master, Created at, Created by, Action<br>2. Master IP có icon 🔒 ở cột Master | DB seed: 3 entry | Critical |
| ESK_IPWL_TC_007 | IPWL_LIST | Display | Medium | Check sort theo created_at DESC | DB nhiều entry | 1. Quan sát thứ tự | 1. Entry mới tạo nhất ở đầu | — | Medium |
| ESK_IPWL_TC_008 | IPWL_LIST | Display - CIDR | High | Check hiển thị CIDR format | DB có entry CIDR | 1. Quan sát row CIDR | 1. Format hiển thị `192.168.1.0/24` rõ ràng<br>2. Có tooltip "CIDR range — match nhiều IP" | `192.168.1.0/24` | High |
| ESK_IPWL_TC_009 | IPWL_LIST | Filter | Medium | Check filter Enabled only | DB có 3 enabled, 2 disabled | 1. Chọn "Enabled only" | 1. Hiển thị 3 row enabled | — | Medium |
| ESK_IPWL_TC_010 | IPWL_LIST | Permission | Critical | Admin không có `security.ip.view` không vào được trang | Login admin role "Order Viewer" | 1. Cố navigate URL | 1. Forbidden page hoặc menu không có link<br>2. API call 403 | — | Critical |
| ESK_IPWL_TC_011 | IPWL_LIST | Action | High | Click Edit row → mở modal IpForm pre-fill | Login admin có `security.ip.manage` | 1. Click icon Edit | 1. Modal `IpForm` mở với data pre-fill (IP, description, isCidr, isEnabled) | — | High |
| ESK_IPWL_TC_012 | IPWL_LIST | Action | Critical | Click Delete row → popup warning | Login admin có `security.ip.manage` | 1. Click icon Delete | 1. Popup "Xóa IP này. Bạn có thể tự khóa mình ra ngoài nếu IP đang dùng" + 2 button | — | Critical |

---

# Module 2: IPWL_FORM — IP Add/Edit Form (Modal)

## 2.1 UI Visual TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_013 | IPWL_FORM | UI Modal | High | [UI Visual] Verify UI modal Add IP | Login admin | 1. Click Add IP | 1. Modal mở center screen<br>2. Form fields: IP/CIDR (input), isCidr (toggle), cidrPrefix (number — hidden khi isCidr=false), Description (input), isEnabled (toggle, default ON)<br>3. Footer: Cancel + Save | — | High |
| ESK_IPWL_TC_014 | IPWL_FORM | UI Field - IP | Medium | [UI Visual] IP input visual states | Modal Add mở | 1. Normal (chưa focus)<br>2. Focus<br>3. Filled valid (`192.168.1.1`)<br>4. Filled invalid (`256.1.1.1`)<br>5. Disabled (khi đang submit) | 1. Normal: placeholder "Nhập IP hoặc CIDR (vd 192.168.1.0/24)"<br>2. Focus: border xanh<br>3. Filled valid: border xanh, icon check ✓<br>4. Error: border đỏ + message "IP không hợp lệ"<br>5. Disabled: gray, không gõ được | `192.168.1.1` · `256.1.1.1` | High |
| ESK_IPWL_TC_015 | IPWL_FORM | UI Field - CIDR Toggle | Medium | [UI Visual] isCidr toggle hiện/ẩn cidrPrefix | Modal mở | 1. isCidr OFF<br>2. Bật ON | 1. OFF: chỉ thấy IP input<br>2. ON: hiện thêm input "Prefix" number 0-32 (hoặc 0-128 IPv6) | — | Medium |
| ESK_IPWL_TC_016 | IPWL_FORM | UI Field - Description | Low | [UI Visual] Description input states (Normal/Focus/Filled) | Modal mở | 1. Normal<br>2. Focus<br>3. Nhập text | 1. Normal: placeholder "Mục đích, vd: Văn phòng HN"<br>2-3. Như các field text khác | "Văn phòng HN" | Low |
| ESK_IPWL_TC_017 | IPWL_FORM | UI Field - Master Warning | Critical | [UI Visual] Cảnh báo nếu IP form match IP hiện tại của Admin | Admin đang dùng IP `203.0.113.45`, thêm IP khác | 1. Nhập IP khác (vd `1.1.1.1`)<br>2. Quan sát warning | 1. Warning vàng "⚠ IP này khác IP bạn đang dùng. Nếu bạn tự khóa mình, bạn sẽ cần OTP để vào lại"<br>(OQ-8: nếu có cơ chế master, đề xuất toggle "Mark as Master") | `1.1.1.1` | Critical |

## 2.2 Field-Level Validation — `ipAddress` (IPv4)

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_018 | IPWL_FORM | Validation - IP | Critical | Check IP required | Modal Add | 1. Để rỗng<br>2. Save | 1. Inline error "IP là bắt buộc" | "" | Critical |
| ESK_IPWL_TC_019 | IPWL_FORM | Validation - IP | Critical | Check IPv4 valid - các giá trị hợp lệ | Modal | 1. Thử lần lượt 5 IP | 1. Tất cả pass validation | `192.168.1.100`, `10.0.0.5`, `203.0.113.45`, `0.0.0.0`, `255.255.255.255` | Critical |
| ESK_IPWL_TC_020 | IPWL_FORM | Validation - IP | Critical | Check IPv4 invalid - octet >255 | Modal | 1. Nhập `256.1.1.1` | 1. Inline error "Octet phải 0-255" | `256.1.1.1` | Critical |
| ESK_IPWL_TC_021 | IPWL_FORM | Validation - IP | High | Check IPv4 invalid - thiếu octet | Modal | 1. Nhập `192.168.1` | 1. Error "IP phải có 4 octet" | `192.168.1` | High |
| ESK_IPWL_TC_022 | IPWL_FORM | Validation - IP | High | Check IPv4 invalid - thừa octet | Modal | 1. Nhập `192.168.1.1.1` | 1. Error format | `192.168.1.1.1` | High |
| ESK_IPWL_TC_023 | IPWL_FORM | Validation - IP | Medium | Check IPv4 leading zero | Modal | 1. Nhập `192.168.01.1` | 1. Reject hoặc auto-trim leading zero (chốt với BA) | `192.168.01.1` | Medium |
| ESK_IPWL_TC_024 | IPWL_FORM | Validation - IP | Critical | Check IP text bất kỳ | Modal | 1. Nhập "not-an-ip" | 1. Error "Format IP không hợp lệ" | "not-an-ip" | Critical |
| ESK_IPWL_TC_025 | IPWL_FORM | Validation - IP | High | Check IP whitespace | Modal | 1. Nhập "  192.168.1.1  " | 1. Auto-trim → save `192.168.1.1` | "  192.168.1.1  " | High |
| ESK_IPWL_TC_026 | IPWL_FORM | Validation - IP | Critical | Check IP unique | DB có `192.168.1.1` enabled | 1. Nhập `192.168.1.1`<br>2. Save | 1. API 409 hoặc inline "IP đã tồn tại" | `192.168.1.1` | Critical |
| ESK_IPWL_TC_027 | IPWL_FORM | Validation - IP | Critical | Check XSS trong IP field | Modal | 1. Nhập `<script>alert(1)</script>` | 1. Reject — không phải IP format<br>2. Không trigger alert | `<script>alert(1)</script>` | Critical |
| ESK_IPWL_TC_028 | IPWL_FORM | Validation - IP | Critical | Check SQL injection | Modal | 1. Nhập `'; DROP TABLE admin_ip_whitelist; --` | 1. Reject (format check) — không xoá table<br>2. Verify DB còn nguyên | `'; DROP TABLE admin_ip_whitelist; --` | Critical |

## 2.3 Field-Level Validation — CIDR (OQ-2 chốt: có hỗ trợ)

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_029 | IPWL_FORM | Validation - CIDR | High | Check CIDR valid range | Modal, isCidr ON | 1. Nhập IP `192.168.1.0`, prefix `24` | 1. Save thành công | `192.168.1.0/24` | High |
| ESK_IPWL_TC_030 | IPWL_FORM | Validation - CIDR | High | Check CIDR prefix boundary - min 0 | Modal, isCidr ON | 1. IP `0.0.0.0`, prefix `0` | 1. Save (match all IPs) — kèm warning đặc biệt "/0 cho phép tất cả IP, bạn có chắc?" | `0.0.0.0/0` | High |
| ESK_IPWL_TC_031 | IPWL_FORM | Validation - CIDR | High | Check CIDR prefix boundary - max 32 | Modal, isCidr ON | 1. IP `192.168.1.1`, prefix `32` | 1. Save (== single IP) | `192.168.1.1/32` | High |
| ESK_IPWL_TC_032 | IPWL_FORM | Validation - CIDR | High | Check CIDR prefix invalid >32 | Modal | 1. Prefix `33` | 1. Error "Prefix IPv4 phải 0-32" | `192.168.1.0/33` | High |
| ESK_IPWL_TC_033 | IPWL_FORM | Validation - CIDR | High | Check CIDR prefix invalid negative | Modal | 1. Prefix `-1` | 1. Error inline | `192.168.1.0/-1` | High |
| ESK_IPWL_TC_034 | IPWL_FORM | Validation - CIDR | Medium | Check CIDR host bits set | Modal | 1. IP `192.168.1.1`, prefix `24` (host bits) | 1. Warning hoặc auto-normalize về `192.168.1.0/24` (chốt với BA hành vi) | `192.168.1.1/24` | Medium |

## 2.4 Field-Level Validation — IPv6 (BLOCKED by OQ-11)

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_035 | IPWL_FORM | Validation - IPv6 | ⚠️ BLOCKED by OQ-11 | Check IPv6 hợp lệ | OQ-11 chốt = có hỗ trợ IPv6 | 1. Nhập `2001:db8::1` | 1. Save thành công | `2001:db8::1`, `::1`, `fe80::1` | High (sau OQ-11) |
| ESK_IPWL_TC_036 | IPWL_FORM | Validation - IPv6 | ⚠️ BLOCKED by OQ-11 | Check CIDR IPv6 prefix max 128 | OQ-11 chốt | 1. Prefix `129` | 1. Error "Prefix IPv6 phải 0-128" | `2001:db8::/129` | Medium |

## 2.5 Field-Level Validation — `description`

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_037 | IPWL_FORM | Validation - Desc | Low | Check description optional | Modal | 1. Rỗng + IP hợp lệ<br>2. Save | 1. Save thành công | "" | Low |
| ESK_IPWL_TC_038 | IPWL_FORM | Validation - Desc | Medium | Check max length 255 | Modal | 1. Nhập 256 ký tự | 1. Error "Tối đa 255 ký tự" | "A" × 256 | Medium |
| ESK_IPWL_TC_039 | IPWL_FORM | Validation - Desc | Critical | Check XSS trong description | Modal | 1. Nhập `<script>alert(1)</script>` | 1. Save (text plain), list hiển thị escape không trigger alert | `<script>alert(1)</script>` | Critical |

## 2.6 Logic TCs - Create/Edit

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_040 | IPWL_FORM | Create | Critical | Check Create IP happy path | Modal Add | 1. IP `203.0.113.45`<br>2. Description "VPN office"<br>3. Enabled ON<br>4. Save → confirm | 1. Popup confirm<br>2. API POST → 201<br>3. Toast success<br>4. List update với row mới<br>5. Banner cảnh báo "whitelist rỗng" biến mất | `203.0.113.45` | Critical |
| ESK_IPWL_TC_041 | IPWL_FORM | Create | Critical | Check Create CIDR happy path | Modal Add, isCidr ON | 1. IP `10.0.0.0`, prefix `8`<br>2. Save → confirm | 1. Save, list hiển thị `10.0.0.0/8` | `10.0.0.0/8` | Critical |
| ESK_IPWL_TC_042 | IPWL_FORM | Edit | High | Check Edit IP → cập nhật | DB có entry | 1. Click Edit<br>2. Đổi description<br>3. Save | 1. API PUT → 200<br>2. Redis cache `admin:whitelist:active` invalidate | — | High |
| ESK_IPWL_TC_043 | IPWL_FORM | Edit | High | Check toggle Enabled off → IP không match nữa | DB IP `203.0.113.45` enabled, admin đang dùng IP đó | 1. Edit, toggle Enabled OFF, save<br>2. Logout<br>3. Login lại từ IP `203.0.113.45` | 1. IP không match active whitelist → OTP required | `203.0.113.45` | Critical |
| ESK_IPWL_TC_044 | IPWL_FORM | Cancel | Low | Check Cancel button | Modal đã điền | 1. Click Cancel | 1. Modal đóng, không lưu | — | Low |

---

# Module 3: IPWL_DELETE — Delete IP

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_045 | IPWL_DELETE | UI Popup | High | [UI Visual] Delete popup với cảnh báo self-lockout | Admin đang ở IP `203.0.113.45`, click Delete row IP đó | 1. Click Delete | 1. Popup đặc biệt: "⚠ Bạn đang truy cập từ IP này. Xóa sẽ buộc bạn dùng OTP lần login kế. Tiếp tục?" | — | Critical |
| ESK_IPWL_TC_046 | IPWL_DELETE | Happy | Critical | Check delete IP thường | DB có IP `1.1.1.1` non-master | 1. Click Delete<br>2. Confirm | 1. API DELETE 200<br>2. Soft delete<br>3. Row khỏi list<br>4. Redis cache invalidate | `1.1.1.1` | Critical |
| ESK_IPWL_TC_047 | IPWL_DELETE | Master Protection | ⚠️ BLOCKED by OQ-8 | Check delete IP master | DB IP có `is_master=true` | 1. Click Delete | 1. OQ-8 chốt: button Delete disabled hoặc API trả 403 "Master IP cannot be deleted" | — | Critical |
| ESK_IPWL_TC_048 | IPWL_DELETE | Edge case | ⚠️ BLOCKED by OQ-6 | Check delete IP cuối cùng → whitelist rỗng → cơ chế default | DB chỉ còn 1 IP, không phải master | 1. Delete IP cuối<br>2. Quan sát banner | 1. OQ-6 chốt: hoặc tự về default (rỗng = cho qua tất cả) + banner cảnh báo; hoặc vẫn enforce OTP cho mọi IP | — | Critical |

---

# Module 4: IPWL_LOGIN — Login Flow with IP Check

## 4.1 Whitelist Empty (default state)

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_049 | IPWL_LOGIN | Empty Whitelist | Critical | Check login từ IP bất kỳ khi whitelist rỗng | DB `admin_ip_whitelist` rỗng | 1. POST /admin/auth/login với credential hợp lệ từ IP `1.2.3.4` | 1. Response 200 với accessToken + refreshToken (KHÔNG có requireOtp)<br>2. Redirect dashboard | username/password hợp lệ | Critical |
| ESK_IPWL_TC_050 | IPWL_LOGIN | Empty Whitelist | High | Check banner cảnh báo trên dashboard khi whitelist rỗng | Whitelist rỗng | 1. Login Admin có quyền `security.ip.view` | 1. Banner top "⚠ Whitelist rỗng — bảo mật chưa kích hoạt. [Setup now]" | — | High |

## 4.2 Whitelist Active — IP trong whitelist

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_051 | IPWL_LOGIN | Whitelist Hit | Critical | Check login từ IP exact match | DB có `203.0.113.45` enabled, admin login từ IP đó | 1. POST /admin/auth/login | 1. 200 với JWT đầy đủ ngay, không OTP | `203.0.113.45` | Critical |
| ESK_IPWL_TC_052 | IPWL_LOGIN | Whitelist Hit | High | Check login từ IP trong CIDR range | DB CIDR `192.168.1.0/24`, login từ `192.168.1.50` | 1. POST login | 1. 200 + JWT đầy đủ — match CIDR | `192.168.1.50` | High |
| ESK_IPWL_TC_053 | IPWL_LOGIN | Whitelist Hit | High | Check login từ IP ngay biên CIDR | CIDR `192.168.1.0/24`, login từ `192.168.1.255` | 1. POST login | 1. Match (last host of /24) → 200 + JWT | `192.168.1.255` | High |
| ESK_IPWL_TC_054 | IPWL_LOGIN | Whitelist Disabled | Critical | Check login từ IP có nhưng entry disabled | DB IP `203.0.113.45` enabled=false | 1. Login từ IP đó | 1. KHÔNG match (vì disabled) → trả requireOtp | `203.0.113.45` | Critical |

## 4.3 Whitelist Active — IP không trong whitelist

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_055 | IPWL_LOGIN | Whitelist Miss | Critical | Check login từ IP ngoài whitelist → requireOtp | DB có IP `1.1.1.1`, admin login từ `8.8.8.8` | 1. POST /admin/auth/login | 1. Response 200 với `{ requireOtp: true, otpToken: <jwt 5min> }`<br>2. KHÔNG trả accessToken<br>3. Backend insert `admin_otp_codes` record<br>4. SES gửi email OTP cho admin | username/password + IP `8.8.8.8` | Critical |
| ESK_IPWL_TC_056 | IPWL_LOGIN | Whitelist Miss | Critical | Check FE redirect OTP screen | Response requireOtp | 1. FE handle response | 1. dispatch(setOtpPending(otpToken))<br>2. navigate `/auth/verify-otp` | — | Critical |
| ESK_IPWL_TC_057 | IPWL_LOGIN | Whitelist Miss | High | Check IP CIDR không match | CIDR `192.168.1.0/24`, login từ `192.168.2.1` | 1. POST login | 1. KHÔNG match → requireOtp | `192.168.2.1` | High |

## 4.4 Login Edge Cases

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_058 | IPWL_LOGIN | Invalid Credentials | Critical | Check sai password — không trigger OTP | Whitelist active | 1. POST login với password sai | 1. 401 Unauthorized<br>2. KHÔNG insert otp_codes (tiết kiệm SES)<br>3. KHÔNG tiết lộ "IP not in whitelist" | wrong password | Critical |
| ESK_IPWL_TC_059 | IPWL_LOGIN | Account Disabled | Critical | Check admin account disabled | Admin status=disabled, whitelist có IP đó | 1. Login | 1. 401 với "Account disabled, contact administrator"<br>2. KHÔNG check IP (auth fail trước) | — | Critical |
| ESK_IPWL_TC_060 | IPWL_LOGIN | Proxy IP | ⚠️ BLOCKED by OQ-5 | Check login qua proxy/ALB — đọc đúng IP gốc | Behind ALB, X-Forwarded-For: `8.8.8.8, 10.0.0.1` | 1. POST login | 1. OQ-5 chốt: TRUSTED_PROXY config → đọc `X-Forwarded-For[0] = 8.8.8.8` → match whitelist trên IP đó | XFF header | Critical |
| ESK_IPWL_TC_061 | IPWL_LOGIN | Proxy IP - Spoofing | Critical | Check không cho client spoof XFF nếu không trusted proxy | Direct connection (không sau ALB) | 1. POST login với header XFF giả `X-Forwarded-For: 1.1.1.1` | 1. Backend bỏ qua XFF (trust=false) → dùng socket IP thật → không match whitelist | spoof XFF | Critical |

---

# Module 5: IPWL_OTP — OTP Verify Flow

## 5.1 UI Visual TCs

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_062 | IPWL_OTP | UI Screen | High | [UI Visual] OTP screen layout | otpToken hợp lệ trong state | 1. Navigate `/auth/verify-otp` | 1. Header "Xác thực OTP"<br>2. 6 ô input number, auto-focus next<br>3. Timer countdown 5 phút<br>4. Resend button (disabled, cooldown 60s ban đầu)<br>5. Footer "Quay lại Login" | — | High |
| ESK_IPWL_TC_063 | IPWL_OTP | UI - Input States | Medium | [UI Visual] OTP input visual states | OTP screen | 1. Normal<br>2. Focus<br>3. Filled valid<br>4. Filled invalid | 1. Normal: 6 ô trống<br>2. Focus: ô active border xanh<br>3. Filled: hiển thị digit, auto-focus next<br>4. Invalid (after submit fail): tất cả border đỏ, message "OTP không đúng" | `123456` · `wrong` | Medium |
| ESK_IPWL_TC_064 | IPWL_OTP | UI - Loading | Medium | [UI Visual] Loading khi verify | Nhập đủ 6 digit | 1. Click Verify | 1. Submit button → spinner<br>2. Input boxes disabled | — | Medium |
| ESK_IPWL_TC_065 | IPWL_OTP | UI - Timer | High | [UI Visual] Countdown timer | OTP screen vừa mở | 1. Quan sát timer | 1. Display "Hết hạn sau 4:59... 4:58..." countdown<br>2. Khi <30s: text màu đỏ<br>3. Khi =0: button Verify disabled, message "OTP hết hạn. Resend?" | — | High |

## 5.2 Field-Level Validation — OTP code

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_066 | IPWL_OTP | Validation | Critical | Check OTP required | OTP screen | 1. Để rỗng<br>2. Click Verify | 1. Verify button disabled khi chưa đủ 6 digit | "" | Critical |
| ESK_IPWL_TC_067 | IPWL_OTP | Validation | High | Check OTP exact 6 digit | OTP screen | 1. Nhập `12345` (5 digit) | 1. Verify button vẫn disabled | `12345` | High |
| ESK_IPWL_TC_068 | IPWL_OTP | Validation | High | Check OTP chỉ chấp nhận số | OTP screen | 1. Cố nhập chữ `abcdef` | 1. Input filter chỉ cho số, ký tự chữ bị bỏ | `abcdef` | High |
| ESK_IPWL_TC_069 | IPWL_OTP | Validation | Medium | Check OTP paste 6 digit | OTP screen | 1. Copy `123456` paste vào ô đầu | 1. Auto-distribute 6 digit vào 6 ô | `123456` | Medium |

## 5.3 OTP Logic

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_070 | IPWL_OTP | Happy | Critical | Check OTP đúng → login success | OTP screen, code đúng trong DB hashed | 1. Nhập đúng OTP<br>2. Verify | 1. API POST /admin/auth/verify-otp 200<br>2. Response: accessToken + refreshToken<br>3. `admin_otp_codes.used_at` set<br>4. Redirect dashboard | đúng OTP từ email | Critical |
| ESK_IPWL_TC_071 | IPWL_OTP | Fail | Critical | Check OTP sai → fail | OTP screen | 1. Nhập sai code | 1. API 401 "Invalid OTP"<br>2. `admin_otp_codes.attempts` tăng 1<br>3. Inline error "OTP không đúng" | sai OTP | Critical |
| ESK_IPWL_TC_072 | IPWL_OTP | Fail - Lockout | ⚠️ BLOCKED by OQ-7 | Check OTP sai N lần | Đã sai 4 lần | 1. Nhập sai lần 5 | 1. OQ-7 chốt: vô hiệu otpToken / khóa account 15 phút | sai OTP × 5 | Critical |
| ESK_IPWL_TC_073 | IPWL_OTP | Expired | High | Check OTP hết hạn (>5 phút - OQ-4) | OTP screen, đợi 6 phút | 1. Nhập đúng OTP | 1. API 401 "OTP expired"<br>2. UI hiển thị "OTP hết hạn, request lại" | — | High |
| ESK_IPWL_TC_074 | IPWL_OTP | Resend | Medium | Check Resend OTP sau cooldown 60s | OTP screen, đợi 60s | 1. Click Resend | 1. Resend button → spinner<br>2. API gửi OTP mới<br>3. Cooldown reset 60s<br>4. OTP cũ vô hiệu (used_at=NOW hoặc invalidate) | — | Medium |
| ESK_IPWL_TC_075 | IPWL_OTP | Resend Rate Limit | High | Check spam Resend bị giới hạn | Click Resend nhiều lần | 1. Resend lần 1 OK<br>2. Trong 60s click lại | 1. Button disabled trong cooldown<br>2. Backend rate limit nếu bypass UI: trả 429 | — | High |
| ESK_IPWL_TC_076 | IPWL_OTP | Token Expired | High | Check otpToken JWT hết hạn (5 phút) | OTP screen mở >5 phút | 1. Submit OTP | 1. API 401 "Session expired, please login again"<br>2. Redirect login | — | High |

---

# Module 6: IPWL_AUDIT — Audit Log

| ID | Function | Category | Risk Level | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|
| ESK_IPWL_TC_077 | IPWL_AUDIT | Log - CRUD | High | Check audit log mỗi action Add/Edit/Delete IP | — | 1. Thực hiện Add 1 IP, Edit 1 IP, Delete 1 IP<br>2. Query audit log | 1. 3 record: action="add_ip"/"edit_ip"/"delete_ip", actor_admin_id, target IP, IP origin của actor, timestamp | — | High |
| ESK_IPWL_TC_078 | IPWL_AUDIT | Log - OTP | ⚠️ BLOCKED by OQ-13 | Check audit log OTP attempt | OQ-13 chốt = có log | 1. Login từ IP ngoài → nhập OTP đúng<br>2. Query log | 1. Record: action="otp_verified", admin_id, ip_origin, success=true | — | Medium |

---

# Traceability Matrix — AC → TC

| AC ID | Mô tả | TC IDs |
|---|---|---|
| AC-01 | Xem danh sách IP whitelist | `_006`, `_008`, `_009` |
| AC-02 | Thêm IP (hoặc CIDR — OQ-2) | `_018`-`_028`, `_040`, `_041` |
| AC-03 | Sửa / xóa IP đã thêm | `_011`, `_042`, `_043`, `_046` |
| AC-04 | Whitelist rỗng → cho qua, không OTP | `_002`, `_049`, `_050` |
| AC-05 | IP trong whitelist → login bình thường | `_051`, `_052`, `_053` |
| AC-06 | IP ngoài whitelist → yêu cầu OTP | `_055`, `_056`, `_057` |
| AC-07 | OTP đúng → login; sai → từ chối | `_070`, `_071` |
| AC-08 | Validate format IP/CIDR | `_018`-`_034` |
| AC-09 | Popup warning + confirm action Admin | `_012`, `_045` |
| AC-10 | Audit log đầy đủ | `_077`, `_078` |

## Coverage: 10/10 AC ≥1 TC cover ✅

---

# TCs bị block bởi Open Questions

| TC | Block bởi | Mô tả OQ |
|---|---|---|
| `_035`, `_036` | OQ-11 | IPv6 hỗ trợ hay không |
| `_047` | OQ-8 | Master IP cơ chế |
| `_048` | OQ-6 | Xóa hết IP khi active → fallback default |
| `_060` | OQ-5 | IP source X-Forwarded-For (TRUSTED_PROXY) — **Critical** |
| `_072` | OQ-7 | OTP sai N lần — lockout policy |
| `_078` | OQ-13 | OTP audit log có hay không |

> **5 OQ Critical (1, 3, 5, 6, 12 trong SPEC)** vẫn cần chốt trước implement — chốt được càng nhiều TC unblock càng nhiều.

---

# Notes for execution

1. **Setup test environment:**
   - Cần ≥2 IP test (1 trong whitelist, 1 ngoài) — dùng VPN hoặc proxy
   - SES sandbox config để nhận OTP email (whitelist email tester)
   - DB seed: 1 IP master, 2 IP non-master, 1 CIDR range

2. **Browser test:** Chrome (chính), Firefox (smoke), Safari (smoke)

3. **OTP testing:** dùng Mailosaur hoặc email test inbox riêng (KHÔNG dùng email production)

4. **Edge env config:** verify `TRUSTED_PROXY_LIST` qua Parameter Store khi test OQ-5

5. **Stress test riêng:**
   - Concurrent login → race condition `admin_otp_codes`
   - Spam OTP request → rate limit
   - 1000 IP entries → list performance

---

**QC Output**
- Test cases: 78 TCs
- Traceability: 10/10 AC ✅ fully covered
- 6 TCs bị block bởi OQ (4 Critical, 1 High, 1 Medium)
- Files đã tạo: `es-kitchen-docs/docs/features/ip-whitelist/test-cases/tc_ip_whitelist.md`

**Bước tiếp theo:**
→ Chốt 4 OQ Critical: OQ-1 (scope), OQ-3 (OTP channel), OQ-5 (proxy), OQ-12 (kill switch)
→ Sau khi dev xong: qa-agent verify
→ Manual test khi build staging
