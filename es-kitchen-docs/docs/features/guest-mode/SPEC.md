# SPEC: Guest Mode

> **Feature:** Guest Mode — cho phép người dùng trải nghiệm app mà không cần đăng ký tài khoản đầy đủ.
> **Ngày tạo:** 2026-06-05
> **BA:** longtd@dipro.vn
> **Scope:** Cross-repo — `es-kitchen-api` · `es-kitchen-payment-app` · `es-kitchen-web-admin`
> **Contract Lock cần thiết:** Có (3 repos)

---

## Mô tả nghiệp vụ

**Vấn đề:** Hiện tại người dùng muốn sử dụng app phải hoàn tất đăng ký tài khoản (email + OTP). Điều này tạo ra rào cản để trải nghiệm sản phẩm lần đầu.

**Giải pháp:** Thêm chế độ "Guest Mode" — người dùng bấm một nút duy nhất để vào app với tài khoản guest tự động. Guest có thể duyệt menu và đặt hàng, nhưng bị giới hạn một số tính năng nhạy cảm (notifications, favorites, payment methods, account management). Khi sẵn sàng, guest có thể liên kết email để nâng cấp thành tài khoản đầy đủ mà không mất dữ liệu trong session.

**Business value:** Giảm rào cản onboarding → tăng tỷ lệ chuyển đổi từ visitor thành registered user. Phù hợp với mô hình B2B2C của ESKITCHEN — nhân viên công ty có thể dùng thử trước khi đăng ký chính thức.

---

## Actors & Preconditions

| Actor | Vai trò trong feature |
|---|---|
| **E01 — End User (Guest)** | Đăng nhập guest, sử dụng app với giới hạn tính năng, upgrade lên full account |
| **E03 — System Admin** | Bật/tắt cài đặt "Cho phép guest thanh toán" per company |

**Preconditions chung:**
- App version đã hỗ trợ guest flow (button mới trên Login screen)
- Backend đã có endpoint tạo tài khoản guest và xử lý token cho guest
- Company đã tồn tại trong hệ thống (để toggle có hiệu lực)

**Preconditions cho Guest Login:**
- Người dùng KHÔNG cần có tài khoản trước
- Người dùng KHÔNG cần nhập bất kỳ thông tin nào

**Preconditions cho Upgrade (Link Email):**
- User đang trong session guest (đã đăng nhập dưới dạng guest)
- Email nhập vào chưa được đăng ký trong hệ thống (nếu đã tồn tại → block, xem BR-11)

---

## User Stories & Acceptance Criteria

### US-01: Đăng nhập với Guest Mode (E01)

**Mô tả:** Người dùng muốn vào app nhanh mà không cần đăng ký tài khoản.

**Precondition:** Người dùng ở màn hình Login.

**Happy Path:**
1. Người dùng thấy button "ゲストとして利用する" (Guest Mode) trên màn Login, phân biệt rõ với button Login thường.
2. Người dùng bấm button Guest Mode.
3. App gọi API tạo tài khoản guest — server tự động sinh:
   - `email`: dạng `guest_<suffix>@eskitchen.local` — suffix là **random alphanumeric 8 ký tự lowercase** (ví dụ `guest_a8f3k2x9@eskitchen.local`). Xem BR-01 về rationale chọn format này.
   - `name` (displayName): `ゲスト_<suffix>` (cùng suffix)
   - `type`: `guest`
4. Server trả về `accessToken` + `refreshToken` theo cùng format với login thường.
5. App lưu token, navigate vào app shell như user thường — không có badge/label "ゲスト" trên header (đã chốt: không cần).

**Acceptance Criteria:**
- AC-01-1: Button "ゲストとして利用する" hiển thị trên Login screen, không ẩn hoặc disabled.
- AC-01-2: Bấm button → không yêu cầu nhập email/password → vào app trong vòng ≤ 3 giây (bao gồm API call).
- AC-01-3: Token được lưu vào secure storage như user thường (không lưu plain text).
- AC-01-4: Gọi API tạo guest thất bại → app hiển thị error toast + user vẫn ở màn Login (không bị stuck).
- AC-01-5: Re-open app (app còn data, secure storage chưa bị xóa) → app đọc token từ secure storage, verify với BE, nếu còn valid thì **tái dùng guest session cũ** (không tạo mới). Nếu token invalid/không tồn tại → gọi `POST /auth/guest` tạo guest mới.
- AC-01-6: Xóa app + cài lại → secure storage bị clear → bấm Guest Mode → **tạo guest mới** (không thể recovery session cũ).

---

### US-02: Giới hạn tính năng cho Guest (E01)

**Mô tả:** Guest user không được phép dùng một số tính năng nhạy cảm yêu cầu định danh.

**Precondition:** User đã đăng nhập dưới dạng guest.

**Danh sách tính năng bị ẩn hoàn toàn với Guest:**

> **UX pattern (đã chốt):** Các items dưới đây bị **ẩn hoàn toàn** (hidden) khỏi menu — không dùng disabled + tooltip. Menu items biến mất với guest.

| Tính năng | Hành vi với Guest |
|---|---|
| Thông báo (Notifications) | Ẩn khỏi menu |
| Danh sách yêu thích (Favorites) | Ẩn khỏi menu |
| Cài đặt Profile | Ẩn khỏi menu |
| Cài đặt phương thức thanh toán | Ẩn khỏi menu |
| Quản lý tài khoản cá nhân | Ẩn khỏi menu |
| Đăng xuất | Ẩn khỏi menu |
| Xoá tài khoản | Ẩn khỏi menu |

**Tính năng ĐƯỢC phép với Guest:**
- Duyệt menu, xem chi tiết món
- Thêm vào giỏ hàng
- Đặt hàng (xem US-03 về điều kiện thanh toán)
- Xem lịch sử đơn hàng của chính session hiện tại (xem US-05)
- Liên kết email (upgrade — xem US-04)

**Acceptance Criteria:**
- AC-02-1: Với guest user, tất cả 7 mục trong bảng trên **không hiển thị** trong menu (không phải disabled, mà hidden hoàn toàn).
- AC-02-2: Nếu guest cố truy cập URL trực tiếp tới trang bị restrict → redirect về màn hình chính hoặc hiển thị inline placeholder "登録が必要です".
- AC-02-3: Guest vẫn có thể duyệt menu và thêm item vào giỏ hàng bình thường.
- AC-02-4: Guest có thể xem danh sách order history của session hiện tại (chỉ orders do guest đó tạo ra trong session này).

---

### US-03: Thanh toán với tài khoản Guest (E01)

**Mô tả:** Guest muốn thanh toán đơn hàng, nhưng bị giới hạn phương thức thanh toán.

**Precondition:** Guest đã có item trong giỏ hàng và đang ở bước checkout.

**Cơ chế liên kết Company (đã chốt):** Guest **KHÔNG** liên kết permanent với bất kỳ company nào. **Mỗi lần checkout, guest phải nhập Company ID** trước khi xem menu / thanh toán. BE validate company ID tồn tại + kiểm tra `guestPaymentAllowed = true` cho company đó.

**Business Rules — Thanh toán Guest:**
- **BR-PAY-01:** Guest KHÔNG được thanh toán bằng tiền mặt (cash).
- **BR-PAY-02:** Guest CHỈ được thanh toán nếu company nhập vào có setting "Cho phép guest thanh toán" = ON.
  - Nếu setting = OFF → chặn toàn bộ checkout, hiển thị thông báo "この会社はゲストの支払いを許可していません" (hoặc tương đương).
  - Nếu setting = ON → cho phép tiếp tục checkout, nhưng không hiển thị option thanh toán bằng tiền mặt.
- **BR-PAY-03:** Guest phải nhập Company ID mỗi lần checkout — không lưu Company ID từ checkout trước vào session.

**Happy Path (guest thanh toán được):**
1. Guest có item trong giỏ, bấm Checkout.
2. **[Step mới]** App hiển thị màn hình "会社IDを入力してください" — guest nhập Company ID (text input).
3. App gọi API validate: company ID tồn tại và có `guestPaymentAllowed = true`?
4. Nếu YES → hiển thị màn thanh toán, chỉ hiện các phương thức không phải cash (credit card, PayPay, Apple Pay qua elepay).
5. Guest hoàn tất thanh toán bình thường theo flow elepay hiện có.

**Alternative Flow — Company tắt guest payment:**
- Bước 2 trả về `guestPaymentAllowed = false` → app hiển thị màn hình/dialog thông báo không thể thanh toán với guest, kèm CTA "アカウントを作成する" (Tạo tài khoản) dẫn đến US-04.

**Acceptance Criteria:**
- AC-03-0: Checkout flow của guest có step nhập Company ID trước khi tiếp tục — không bỏ qua được.
- AC-03-1: Option thanh toán tiền mặt KHÔNG xuất hiện trong checkout khi user là guest (bất kể setting company).
- AC-03-2: Company ID không tồn tại → API trả về lỗi, app hiển thị thông báo "会社IDが見つかりません".
- AC-03-3: Company ID tồn tại nhưng `guestPaymentAllowed = false` → checkout bị block hoàn toàn với thông báo rõ ràng.
- AC-03-4: Khi `guestPaymentAllowed = true` → guest có thể hoàn tất thanh toán qua elepay.
- AC-03-5: Tắt guest payment giữa lúc guest đang ở checkout flow → lần gọi API checkout trả về lỗi phù hợp (không silent fail).

---

### US-04: Liên kết Email — Upgrade Guest thành Full Account (E01)

**Mô tả:** Guest muốn nâng cấp lên tài khoản đầy đủ để dùng toàn bộ tính năng.

**Precondition:** User đang đăng nhập dưới dạng guest.

**Happy Path:**
1. Guest truy cập trang "メールアドレスを連携する" (Link Email) — có thể từ profile menu hoặc từ CTA trên màn hình bị block.
2. Guest nhập địa chỉ email hợp lệ.
3. Bấm "送信" → hệ thống gửi OTP về email vừa nhập.
4. Guest nhập OTP (6 chữ số) trên màn hình Verify OTP.
5. OTP đúng → app hiển thị **Form Set Password** (giống form đăng ký mới thông thường — nhập password + xác nhận password). Không dùng email link tự động.
6. Guest điền password + bấm Confirm → hệ thống:
   - Lưu password vào account
   - Liên kết email với account guest hiện tại
   - Cập nhật `type` từ `guest` → `registered` (hoặc enum tương đương)
7. App hiển thị màn xác nhận "連携完了" (Liên kết thành công) + redirect vào app với tài khoản đã được nâng cấp.
8. Tất cả tính năng bị ẩn trước đây (US-02) nay trở nên accessible.

**Alternative Flows:**
- **AF-04-1 — Email đã tồn tại (full account):** Email nhập vào đã được dùng cho tài khoản đầy đủ → BE trả lỗi, app hiển thị: "このメールアドレスは既に使用されています。既存のアカウントでログインしてください。" (Email đã được sử dụng. Vui lòng đăng nhập bằng tài khoản hiện có.) + không gửi OTP. Guest phải nhập email khác hoặc quay ra màn Login để đăng nhập bằng account cũ. **Không merge data, không transfer order history của guest sang account cũ.**
- **AF-04-2 — OTP sai:** Nhập OTP sai → hiển thị error, cho phép nhập lại. Không có giới hạn retry cho việc nhập OTP sai — tái dùng behavior hiện có của OTP module (`validateOtp()` trong `registration.service.ts`).
- **AF-04-3 — OTP hết hạn:** OTP expire sau **5 phút** (tái dùng config hiện có: `expiresAt.setMinutes(+5)` tại `registration.service.ts:262`) → app hiển thị "コードの有効期限が切れました" + button "再送信" (Resend). Rate limit resend: 1 lần / 60 giây (tái dùng `generateOtp()` check `oneMinuteAgo` tại `registration.service.ts:232`).
- **AF-04-4 — User bỏ qua giữa chừng:** Guest đóng màn hình Link Email mà không hoàn tất → account vẫn là guest, không có thay đổi.

**Acceptance Criteria:**
- AC-04-1: Form nhập email có validation format (regex email) trước khi gọi API.
- AC-04-2: OTP được gửi tới email nhập vào trong vòng ≤ 60 giây.
- AC-04-3: Nhập OTP đúng → account `type` chuyển sang `registered` + toàn bộ tính năng bị lock trước đây nay accessible mà không cần logout/login lại.
- AC-04-4: Sau khi link thành công, session token hiện tại vẫn hợp lệ (không force logout).
- AC-04-5: Email đã tồn tại (full account) → app hiển thị error message rõ ràng, không gửi OTP, không merge/transfer data. Guest phải nhập email khác hoặc quay ra Login.
- AC-04-6: Resend OTP button chỉ active sau 60 giây kể từ lần gửi trước (cooldown — tái dùng rate limit 1 lần/60 giây của OTP module hiện có).
- AC-04-7: OTP expire sau 5 phút — tái dùng config `expiresAt.setMinutes(+5)` của `registration.service.ts`. Sau expire, user phải resend để lấy OTP mới.
- AC-04-8: Sau khi upgrade thành full account, order history của session guest đó được giữ lại và gắn vào full account (cùng userId trong DB — không mất data).

---

### US-05: Xem Order History trong Session (E01)

**Mô tả:** Guest muốn xem lại các đơn hàng đã đặt trong phiên sử dụng hiện tại.

**Precondition:** User đang đăng nhập dưới dạng guest và đã đặt ít nhất 1 đơn hàng trong session hiện tại.

**Happy Path:**
1. Guest truy cập màn hình Order History.
2. App hiển thị danh sách các order do guest đó tạo ra (filter theo `userId` của guest session hiện tại).
3. Guest có thể xem chi tiết từng order.

**Điều kiện về data persistence:**
- Order history chỉ truy cập được khi secure storage còn token hợp lệ (cùng guest session).
- Xóa app → secure storage bị clear → guest mới được tạo khi cài lại → order history cũ **không còn truy cập được** (đã là guest khác — khác `userId`).
- Sau khi upgrade thành full account: order history của guest session đó được giữ lại và gắn vào full account (cùng `userId` trong DB — không mất data).

**Acceptance Criteria:**
- AC-05-1: Guest có thể xem order history của chính mình (filter theo `userId` của guest hiện tại).
- AC-05-2: Order history chỉ hiển thị orders của session hiện tại (không hiển thị orders của guest khác).
- AC-05-3: Xóa app + cài lại → guest mới tạo ra → Order History rỗng (không recover được history cũ).
- AC-05-4: Sau khi upgrade thành full account, order history của guest session đó hiển thị đầy đủ trong account mới (không mất).

---

### US-06: System Admin Toggle "Guest Payment" (E03)

**Mô tả:** System Admin cần bật/tắt khả năng thanh toán của guest per company.

**Precondition:** System Admin đã đăng nhập vào `es-kitchen-web-admin`. Company đã tồn tại trong hệ thống.

**Happy Path:**
1. System Admin vào trang Company Management → mở form **Edit Company** của một công ty (form edit hiện có, không tạo trang mới).
2. Trong form Edit Company, Admin thấy toggle "ゲスト支払いを許可する" (Cho phép guest thanh toán) — đặt gần khu vực Payment settings nếu có, hoặc cuối form. Vị trí chi tiết trong form do Tech Lead Design quyết định.
3. Mặc định: Toggle = **ON** (Cho phép).
4. Admin bật/tắt toggle → lưu cùng với Save của form Company Detail (không cần Save riêng).
5. Thay đổi có hiệu lực ngay (realtime check ở Mobile app trong lần gọi API tiếp theo).

**Acceptance Criteria:**
- AC-06-1: Toggle "ゲスト支払いを許可する" hiển thị trong form **Edit Company** hiện có của System Admin — không tạo tab hoặc trang mới.
- AC-06-2: Default value của toggle = ON khi tạo company mới hoặc company chưa có setting này.
- AC-06-3: Admin lưu thay đổi → API cập nhật field `guestPaymentAllowed` trong Company record.
- AC-06-4: Thay đổi từ ON → OFF có hiệu lực với lần checkout tiếp theo của guest (không cần reload server).
- AC-06-5: Toggle submit cùng với toàn bộ form Edit Company (không có endpoint riêng cho toggle này). Vị trí chính xác trong form (gần Payment settings hoặc cuối form) do Tech Lead Design quyết định.

---

## Business Rules

| ID | Rule | Ảnh hưởng |
|---|---|---|
| **BR-01** | Format email guest: `guest_<suffix>@eskitchen.local` — suffix là **random alphanumeric 8 ký tự lowercase** (ví dụ `guest_a8f3k2x9`). Rationale: (1) collision risk thấp — 36^8 ≈ 2.8 tỷ combination; (2) human-readable, ngắn gọn; (3) phù hợp column `VARCHAR(50)` trong DB. Format name: `ゲスト_<suffix>` (cùng suffix). | API sinh suffix khi tạo guest |
| **BR-02** | Guest account type = `guest` — field `type` (hoặc `userType`) trong User entity. | API + Mobile phải đọc field này để xác định quyền |
| **BR-03** | Guest KHÔNG được dùng tiền mặt khi thanh toán — luôn áp dụng, bất kể company setting. | Mobile checkout screen |
| **BR-04** | Guest chỉ được thanh toán nếu company nhập tại checkout có `guestPaymentAllowed = true`. | API validate + Mobile UX |
| **BR-05** | Default `guestPaymentAllowed = true` khi company được tạo hoặc field chưa có giá trị. | API + Admin Web |
| **BR-06** | Sau khi link email thành công, account type chuyển từ `guest` → `registered`. Tất cả restrictions trong US-02 được gỡ bỏ. | API + Mobile |
| **BR-07** | Guest account không có password. Khi upgrade (link email): guest tự set password trực tiếp trong form upgrade (flow giống new registration) — không gửi email link. | API |
| **BR-08** | Re-open app (secure storage còn data): tái dùng guest session cũ nếu token còn valid. Nếu token invalid → tạo guest mới. Xóa app + cài lại (secure storage bị clear) → luôn tạo guest mới khi bấm Guest Mode. | Mobile |
| **BR-09** | Guest KHÔNG liên kết permanent với company. Mỗi lần checkout, guest phải nhập Company ID để validate payment. Company ID không được lưu lại giữa các lần checkout. | API + Mobile checkout flow |
| **BR-10** | Với guest user, 7 menu items sau bị **ẩn hoàn toàn** (hidden, không phải disabled): Thông báo, Yêu thích, Cài đặt Profile, Cài đặt phương thức thanh toán, Quản lý tài khoản, Đăng xuất, Xoá tài khoản. | Mobile |
| **BR-11** | Email đã tồn tại (full account) + guest cố link → **block hoàn toàn**. BE trả error, không merge data, không transfer order history. Guest phải nhập email khác hoặc quay ra đăng nhập bằng account cũ. | API + Mobile US-04 |
| **BR-12** | OTP expire **5 phút** — tái dùng config `expiresAt.setMinutes(+5)` của `registration.service.ts:262`. Rate limit gửi OTP: 1 lần / 60 giây — tái dùng check `oneMinuteAgo` tại `registration.service.ts:232`. Không có giới hạn retry cho việc nhập OTP sai (tái dùng `validateOtp()` hiện có). OTP là **4 chữ số** (`crypto.randomInt(1000, 9999)`). | API US-04 |
| **BR-13** | Guest chỉ xem được order history của session hiện tại (filter theo `userId`). Xóa app → secure storage clear → guest mới → order history cũ không thể truy cập (khác `userId`). Sau upgrade thành full account: order history giữ nguyên, gắn vào full account (cùng `userId` trong DB). | API + Mobile US-05 |

---

## Out of Scope

- Guest user **không** có push notification (không đăng ký FCM token cho guest).
- Guest **không** thể hoàn tiền (refund) — refund yêu cầu thông tin cá nhân xác thực.
- Guest **không** thể tham gia chương trình khuyến mãi, điểm thưởng (Marketing/Engagement domain — scope riêng).
- **Company Admin (E02)** không có màn hình toggle guest payment — chỉ System Admin (E03) quản lý.
- Migration dữ liệu guest account cũ (nếu có từ Phase 1) — không trong scope Phase 2.
- Guest mode cho **Supplier Web (E04)**, **Driver App (E06)**, **Company Admin Web (E02)** — không áp dụng.
- Badge/label "ゲスト" trên header của app — không cần (đã chốt với client).
- UI Design (Figma mockup) — BA chỉ đặc tả nghiệp vụ, Designer thực hiện UI.

---

## Open Questions — All Resolved

> Tất cả câu hỏi đã được client chốt. SPEC sẵn sàng handover Tech Lead Design. (Resolved: 2026-06-05)

| # | Câu hỏi gốc | Quyết định | Resolved |
|---|---|---|---|
| Q1–Q5, Q9 | Các câu hỏi session 1 | Đã cập nhật trước đó | 2026-06-05 |
| Q6 | OTP expire time? | 5 phút — tái dùng config hiện có (`registration.service.ts:262`). Xem BR-12. | 2026-06-05 |
| Q7 | OTP retry limit khi nhập sai? | Không có limit — tái dùng `validateOtp()` hiện có. Xem BR-12. | 2026-06-05 |
| Q8 | Email đã tồn tại (full account) + guest cố link → merge hay block? | Block hoàn toàn. Error message rõ. Không merge data. Xem BR-11, AF-04-1. | 2026-06-05 |
| Q10 | Toggle đặt ở tab nào trong Company Detail? | Đặt trong form Edit Company hiện có (không tab mới). Vị trí chi tiết do Tech Lead Design. Xem US-06, AC-06-1. | 2026-06-05 |
| Q11 | Badge/label "ゲスト" trên header app? | Không cần — bỏ khỏi scope. Xem Out of Scope. | 2026-06-05 |
| Q12 | Guest xem order history trong session không? | Có — xem orders của session hiện tại. Sau upgrade: giữ lại. Sau xóa app: mất. Xem US-05, BR-13. | 2026-06-05 |

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Login Screen (với Guest Mode button) | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình đăng nhập hiện có — có thêm button "ゲストとして利用する" để vào app không cần tài khoản |
| Home / Main Menu Screen (Guest) | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình chính sau khi đăng nhập guest — menu items bị giới hạn (7 items ẩn), duyệt menu và thêm vào giỏ hàng |
| Restricted Page Placeholder *inferred | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình / inline placeholder hiển thị "登録が必要です" khi guest cố truy cập URL của tính năng bị block |
| Company ID Input Screen | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình nhập Company ID trước khi checkout — bắt buộc mỗi lần, không lưu lại |
| Guest Payment Blocked Screen *inferred | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình / dialog thông báo không thể thanh toán khi company có `guestPaymentAllowed = false` — kèm CTA "アカウントを作成する" |
| Checkout / Payment Screen (Guest) | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình thanh toán cho guest — không có option tiền mặt, chỉ hiện credit card / PayPay / Apple Pay qua elepay |
| Order History Screen (Guest) | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Danh sách đơn hàng của session guest hiện tại (filter theo userId), có thể xem chi tiết từng order |
| Link Email Screen | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình nhập địa chỉ email để upgrade guest → full account ("メールアドレスを連携する") |
| OTP Verify Screen (Link Email) | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình nhập OTP 4 chữ số gửi về email, có nút Resend (cooldown 60 giây) |
| Set Password Screen (Link Email) | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Form đặt password sau khi OTP xác thực thành công — nhập password + xác nhận password |
| Link Email Success Screen *inferred | E01 — End User (Guest) | E01 (es-kitchen-payment-app) | Màn hình xác nhận "連携完了" sau khi upgrade thành công — redirect vào app với full account |
| Edit Company Form (with Guest Payment Toggle) | E03 — System Admin | E03 (es-kitchen-web-admin) | Form Edit Company hiện có — bổ sung toggle "ゲスト支払いを許可する" để System Admin bật/tắt guest payment per company |

---

## Bước tiếp theo

Contract Lock cần thiết trước Phase 3 (3 repos):
- REST API mới: `POST /auth/user/guest-login`, `POST /auth/user/link-email`, `GET /user/orders/validate-payment-method` (guest payment check)
- Field mới trong Company: `guestPaymentAllowed: boolean`
- Token response: cùng format `{ accessToken, refreshToken }` như login thường

Handover hints (chạy song song):
- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `es-kitchen-docs/docs/features/guest-mode/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `es-kitchen-docs/docs/features/guest-mode/SPEC.md`" (slash command: `/test/generate_manual_testcases_rbt`)
- "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/guest-mode/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/guest-mode/SPEC.md)
