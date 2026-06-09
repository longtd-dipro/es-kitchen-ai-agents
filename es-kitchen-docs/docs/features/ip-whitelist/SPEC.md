# SPEC: IP Whitelist & 2FA Access Restriction

> **Loại:** Single-repo (E03 System Admin Web + API)
> **Repos liên quan:** `es-kitchen-api` · `es-kitchen-web-admin` (E03)
> **Actor chính:** System Admin (E03)
> **Ngày:** 2026-06-02
> **Status:** Draft — nhiều Open Questions
> **Source:** `es-kitchen-requirements/ip_whitelist/requirement.md` + `es-kitchen-requirements/role_permission/requirement.md` (section 1)

---

## 1. Mô tả nghiệp vụ

Hệ thống ESKITCHEN cho phép System Admin quản lý **danh sách IP được phép truy cập** (whitelist) các trang admin nhạy cảm. Cơ chế bảo mật 2 lớp:

- **IP trong whitelist** → truy cập trực tiếp (chỉ cần login bình thường)
- **IP không trong whitelist** → yêu cầu thêm **2FA (OTP)** sau khi nhập password

Trạng thái mặc định: **whitelist rỗng → tất cả IP đều vào được** (giai đoạn dev / mới setup). Khi Admin thêm IP đầu tiên, cơ chế restriction được kích hoạt.

---

## 2. Actors & Preconditions

| Actor | Vai trò | Precondition |
|---|---|---|
| System Admin (E03) | Quản lý danh sách IP whitelist (thêm/sửa/xóa), bật/tắt cơ chế | Có quyền "IP Whitelist Management" trong role |
| Tất cả Admin / Supplier / Outsource / Driver user khi login | Bị check IP khi đăng nhập | Đã có account |

> **Phạm vi áp dụng:** *OQ-1* — Áp dụng cho web nào? Chỉ web-admin (E03) hay tất cả web nội bộ (Supplier/Outsource/Driver)?

---

## 3. Happy Path — Admin cấu hình IP Whitelist

1. Admin login web-admin → vào menu **Security → IP Whitelist**
2. Hệ thống hiển thị danh sách IP hiện tại (cột: IP/CIDR, Mô tả, Ngày thêm, Người thêm, Action)
3. Admin click **Add IP**
4. Form: IP address (hoặc CIDR range *OQ-2*), Description (optional), Enabled toggle
5. Validate format → save → hiển thị trong danh sách
6. Admin có thể Edit / Delete từng IP

## 4. Happy Path — User login từ IP trong whitelist

1. User mở web → nhập ID + password
2. API kiểm tra IP gốc của request → nằm trong whitelist → login thành công như flow auth thông thường

## 5. Happy Path — User login từ IP ngoài whitelist (có whitelist active)

1. User mở web → nhập ID + password
2. API kiểm tra IP → KHÔNG nằm trong whitelist
3. Hệ thống yêu cầu **OTP** *(OQ-3: kênh gửi OTP — email / SMS / Authenticator app?)*
4. User nhập OTP → verify → login thành công
5. *OQ-4*: OTP hết hạn sau bao lâu? Resend cooldown?

---

## 6. Alternative Flows & Edge Cases

| Tình huống | Xử lý |
|---|---|
| Whitelist rỗng | Tất cả IP cho qua, không cần OTP (default state mới setup) |
| User vào từ proxy / VPN | IP thấy là proxy, không phải IP thật → *OQ-5: lấy IP nào?* (X-Forwarded-For?) |
| Admin xóa hết IP khi whitelist đang active | *OQ-6: tự động disable cơ chế? Hay vẫn buộc OTP cho tất cả?* |
| User nhập sai OTP nhiều lần | *OQ-7: lock account? Quay về login screen?* |
| Admin tự khóa mình ra ngoài (xóa nhầm IP công ty) | *OQ-8: cần backup access? Master IP không xóa được?* |
| Whitelist update khi user đang có session | Session đang có vẫn hợp lệ đến khi expire? *(OQ-9)* |
| IP changed mid-session (mobile chuyển wifi) | *OQ-10: force re-auth hay cho phép?* |
| IPv6 vs IPv4 | *OQ-11: hỗ trợ cả hai? Format input?* |

---

## 7. Acceptance Criteria

| # | Criteria |
|---|---|
| AC-01 | Admin có thể xem danh sách IP whitelist hiện tại |
| AC-02 | Admin có thể thêm IP (hoặc CIDR range nếu confirm OQ-2) |
| AC-03 | Admin có thể sửa / xóa IP đã thêm |
| AC-04 | Khi whitelist rỗng → tất cả IP login được không cần OTP |
| AC-05 | Khi whitelist có ít nhất 1 IP → request từ IP đó login bình thường |
| AC-06 | Khi whitelist active → request từ IP ngoài whitelist bị yêu cầu OTP |
| AC-07 | OTP đúng → login thành công; OTP sai → từ chối |
| AC-08 | Validate format IP / CIDR — báo lỗi rõ nếu sai format |
| AC-09 | Tất cả action Admin có popup warning + confirm (theo Common Rules) |
| AC-10 | Log đầy đủ: ai thêm/sửa/xóa IP, khi nào, từ đâu (audit log) |

---

## 8. Open Questions — Cần confirm

| # | Câu hỏi | Tầm quan trọng | Ảnh hưởng |
|---|---|---|---|
| OQ-1 | Áp dụng cho web nào: chỉ E03 hay tất cả web nội bộ (E03 + E04 + E05 + E06)? | 🔴 Critical | Scope toàn bộ feature |
| OQ-2 | Hỗ trợ CIDR range (`192.168.1.0/24`) hay chỉ IP đơn lẻ? | 🟡 High | UI input + validation + matching logic |
| OQ-3 | OTP gửi qua kênh nào: email / SMS / Authenticator app (TOTP)? | 🔴 Critical | Integration scope, infra |
| OQ-4 | OTP expiry (vd 5 phút), resend cooldown, số lần thử | 🟡 High | Security + UX |
| OQ-5 | Phía sau proxy/load balancer: lấy IP từ `X-Forwarded-For` hay IP socket? | 🔴 Critical | Đúng nghiệp vụ |
| OQ-6 | Admin xóa hết IP khi whitelist active → tự động về default (rỗng cho qua) hay vẫn enforce OTP? | 🟡 High | Edge case behavior |
| OQ-7 | OTP nhập sai N lần — xử lý? | 🟠 Medium | Security |
| OQ-8 | Cơ chế chống Admin tự khóa mình: master IP không xóa được? Backup recovery email? | 🟡 High | Operational safety |
| OQ-9 | Whitelist update khi user đang có session — session hiện tại có invalidate không? | 🟠 Medium | Session management |
| OQ-10 | IP của user thay đổi giữa session (mobile chuyển wifi) — force re-auth? | 🟠 Medium | UX |
| OQ-11 | Hỗ trợ IPv6? | 🟠 Medium | Validation + matching |
| OQ-12 | Có UI bật/tắt toàn bộ cơ chế (kill switch) cho emergency không? | 🟡 High | Operational |
| OQ-13 | OTP có cần ghi audit log không? (ai nhập OTP từ IP nào, khi nào) | 🟠 Medium | Audit / compliance |

---

## 9. Out of Scope

- Geo-IP blocking (chặn theo quốc gia) — feature riêng nếu cần
- VPN detection
- Device fingerprinting
- IP whitelist cho End User mobile (E01) hay Company Admin (E02) — chỉ áp dụng cho admin/supplier/outsource/driver
- Single Sign-On với 2FA provider ngoài (Okta, Auth0)

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| AW_IPWL_001 | IP Whitelist List | System Admin | E03 (es-kitchen-web-admin) | List | Xem danh sách IP/CIDR đã whitelist (cột: IP, Mô tả, Ngày thêm, Người thêm, Action); có nút Add IP |
| AW_IPWL_002 | Add IP Form *inferred | System Admin | E03 (es-kitchen-web-admin) | Form | Form thêm IP/CIDR mới: input địa chỉ IP hoặc CIDR range, description (optional), enabled toggle, validate format |
| AW_IPWL_003 | Edit IP Form *inferred | System Admin | E03 (es-kitchen-web-admin) | Form | Form sửa IP/CIDR đã có: chỉnh sửa địa chỉ, mô tả, trạng thái enabled |
| AW_IPWL_004 | Delete IP Confirm Dialog *inferred | System Admin | E03 (es-kitchen-web-admin) | Modal | Popup xác nhận xóa IP khỏi whitelist (theo AC-09 — warning + confirm trước khi xóa) |
| AW_IPWL_005 | Login — OTP Step (E03) | System Admin | E03 (es-kitchen-web-admin) | Form* | Màn hình nhập OTP sau khi login từ IP ngoài whitelist; hiển thị kênh nhận OTP, nút Resend, countdown hết hạn |
| SW_IPWL_001 | Login — OTP Step (E04) *inferred | Supplier | E04 (es-kitchen-web-supplier) | Form* | Nhập OTP sau khi login từ IP ngoài whitelist — nếu OQ-1 confirm mở rộng sang E04 |
| OW_IPWL_001 | Login — OTP Step (E05) *inferred | Outsource | E05 (es-kitchen-web-outsource-web-private) | Form* | Nhập OTP sau khi login từ IP ngoài whitelist — nếu OQ-1 confirm mở rộng sang E05 |
| DA_IPWL_001 | Login — OTP Step (E06) *inferred | Driver | E06 (es-kitchen-webapp-driver) | Form* | Nhập OTP sau khi login từ IP ngoài whitelist — nếu OQ-1 confirm mở rộng sang E06 |

> **Lưu ý:** Screens E04/E05/E06 được đánh dấu *inferred và phụ thuộc kết quả confirm OQ-1 (scope áp dụng). Nếu OQ-1 xác nhận chỉ E03 thì chỉ giữ 5 screens đầu.
