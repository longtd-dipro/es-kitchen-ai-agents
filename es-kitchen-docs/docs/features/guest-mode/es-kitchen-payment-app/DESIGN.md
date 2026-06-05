# DESIGN: Guest Mode — es-kitchen-payment-app

> **Feature:** Guest Mode
> **Repo:** `es-kitchen-payment-app` (E01 Flutter)
> **SPEC:** `es-kitchen-docs/docs/features/guest-mode/SPEC.md`
> **Ngày tạo:** 2026-06-05
> **Tech Lead:** ngaht@dipro.vn

---

## 1. Tổng quan thay đổi

| Layer | File | Loại thay đổi |
|---|---|---|
| Screen (mới) | `lib/features/auth/guest/ui/guest_login_page.dart` | Không tạo riêng — button được thêm vào `login_page.dart` |
| Screen (mới) | `lib/features/auth/link_email/ui/link_email_page.dart` | Mới — nhập email |
| Screen (mới) | `lib/features/auth/link_email/ui/link_email_otp_page.dart` | Mới — nhập OTP |
| Screen (mới) | `lib/features/auth/link_email/ui/link_email_set_password_page.dart` | Mới — set password |
| Screen (sửa) | `lib/features/auth/login/ui/login_page.dart` | Thêm button "ゲストとして利用する" |
| Screen (sửa) | `lib/features/user/ui/user_page.dart` | Ẩn 5 menu item, thêm "メールアドレスを連携する" |
| Screen (sửa) | `lib/features/bottom_bar/ui/bottom_bar_page.dart` | Ẩn tab Favorites + Notifications khi guest |
| Screen (sửa) | `lib/features/cart/ui/cart_page.dart` / `cart_details_confirm_page.dart` | Chặn cash option; Company ID input đã có (tái dùng) |
| Controller (mới) | `lib/features/auth/link_email/controller/link_email_controller.dart` | Mới |
| State (mới) | `lib/features/auth/link_email/state/link_email_state.dart` | Mới (freezed) |
| Provider (mới) | `lib/features/auth/link_email/provider/link_email_provider.dart` | Mới |
| Controller (sửa) | `lib/features/auth/login/controller/login_controller.dart` | Thêm `guestLogin()` method |
| State (sửa) | `lib/features/auth/login/state/login_state.dart` | Không đổi (isLoading, isSuccess đủ dùng) |
| Repository (sửa) | `lib/data/repositories/auth_repository.dart` | Thêm `guestLogin()`, `sendLinkEmailOtp()`, `verifyLinkEmailOtp()` |
| API (sửa) | `lib/data/api/app_api.dart` | Thêm 3 API method |
| API (sửa) | `lib/data/api/app_api.g.dart` | Regenerate |
| Endpoints (sửa) | `lib/data/api/app_endpoints.dart` | Thêm 3 endpoint constant |
| Model (mới) | `lib/data/models/auth/guest/` | Guest request/response models |
| Model (mới) | `lib/data/models/auth/link_email/` | LinkEmail request/response models |
| Router (sửa) | `lib/app/routers/app_router.dart` | Thêm 3 route mới (link email screens) |
| Router (sửa) | `lib/app/routers/app_router.gr.dart` | Regenerate |
| Prefs (sửa) | `lib/app/core/prefs/app_prefs.dart` | Thêm `saveUserType()`, `getUserType()` |
| Provider (mới) | `lib/features/user/provider/user_type_provider.dart` | Provider đọc userType từ app state |
| ValidateCompany (sửa) | `lib/data/models/order/validate_company_response.dart` | Thêm field `guestPaymentAllowed` |

---

## 2. Token Storage

**Hiện trạng quan trọng:** App hiện dùng `SharedPreferences` (qua `AppPrefs`) để lưu token — không phải `FlutterSecureStorage`. SPEC yêu cầu AC-01-3 "lưu vào secure storage như user thường".

**Quyết định:** Guest token lưu theo cùng cơ chế hiện có (`SharedPreferences`) — không thay đổi storage mechanism trong scope này. Lý do: (1) User thường cũng dùng SharedPreferences; (2) Nâng cấp lên secure_storage là task infra/security riêng ngoài scope Guest Mode.

**Guest session re-use (AC-01-5):**
- App startup → kiểm tra `AppPrefs.token` có giá trị không
- Nếu có → gọi API verify token (tái dùng `/user/me` hoặc refresh token flow hiện có)
- Nếu token valid → navigate vào app shell bình thường (không tạo guest mới)
- Nếu token invalid/expire → navigate về LoginPage

**Lưu UserType:**
- Sau `guestLogin()` thành công → gọi `GET /user/me` để lấy `userType` → lưu vào `AppPrefs`
- `AppPrefs` thêm: `saveUserType(String type)` / `getUserType()` / `isGuest` getter

---

## 3. API Endpoints mới (Mobile consume)

| Method | Path | Mục đích |
|---|---|---|
| `POST` | `/auth/user/guest-login` | Tạo guest session |
| `POST` | `/auth/user/link-email` | Gửi OTP để upgrade |
| `POST` | `/auth/user/link-email/verify` | Verify OTP + set password + upgrade |

**Tái dùng existing endpoints:**
| Method | Path | Mục đích |
|---|---|---|
| `GET` | `/user/orders/validate-company?companyCode=X` | Validate company + guestPaymentAllowed |
| `GET` | `/user/orders/history` | Order history (filter by userId — tự động đúng) |
| `GET` | `/user/me` | Lấy userType sau login |

**App Endpoints constants (`app_endpoints.dart`) — thêm:**
```dart
static const guestLogin = 'auth/user/guest-login';
static const linkEmail = 'auth/user/link-email';
static const linkEmailVerify = 'auth/user/link-email/verify';
```

---

## 4. Data Models

### 4.1 Models mới

**`GuestLoginResponse`** (`lib/data/models/auth/guest/guest_login_response.dart`):
```dart
// Tái dùng LoginResponse — cùng structure { accessToken, refreshToken }
// Có thể alias hoặc tái dùng trực tiếp LoginResponse
```

**`LinkEmailRequest`** (`lib/data/models/auth/link_email/link_email_request.dart`):
```dart
@freezed
class LinkEmailRequest with _$LinkEmailRequest {
  const factory LinkEmailRequest({
    required String email,
  }) = _LinkEmailRequest;
  factory LinkEmailRequest.fromJson(Map<String, dynamic> json) => ...;
}
```

**`LinkEmailVerifyRequest`** (`lib/data/models/auth/link_email/link_email_verify_request.dart`):
```dart
@freezed
class LinkEmailVerifyRequest with _$LinkEmailVerifyRequest {
  const factory LinkEmailVerifyRequest({
    required String email,
    required String otp,
    required String password,
  }) = _LinkEmailVerifyRequest;
  factory LinkEmailVerifyRequest.fromJson(Map<String, dynamic> json) => ...;
}
```

**`LinkEmailVerifyResponse`** — tái dùng `LoginResponse` (cùng `{ accessToken, refreshToken }`).

### 4.2 Model sửa

**`ValidateCompanyResponseModel`** — thêm field:
```dart
final bool guestPaymentAllowed;
```

---

## 5. Screen & Controller Layer

### 5.1 LoginPage — sửa

**File:** `lib/features/auth/login/ui/login_page.dart`

**Thay đổi:**
- Thêm button "ゲストとして利用する" bên dưới button "新規登録"
- Button style: outline hoặc text button (phân biệt với primary button Login)
- `onTap`: gọi `ref.read(loginControllerProvider.notifier).guestLogin()`
- Spinner khi loading (tái dùng `isLoading` state)
- Error handling: nếu fail → show error toast, ở lại LoginPage

**LoginController — thêm method:**
```dart
Future<void> guestLogin() async {
  state = state.copyWith(isLoading: true, errorMessage: '');
  try {
    final authRepo = ref.read(authRepositoryProvider);
    final response = await authRepo.guestLogin();
    ref.read(appPrefsProvider).saveToken(response.accessToken);

    // Lấy userType từ /user/me
    final userInfo = await ref.read(repositoryProvider).getUserInfo();
    await ref.read(appPrefsProvider).saveUserType(userInfo.data.userType ?? 'guest');

    state = state.copyWith(isLoading: false, isSuccess: true);
  } catch (e) {
    state = state.copyWith(isLoading: false, errorMessage: 'ゲストログインに失敗しました');
  }
}
```

**LoginState** — không cần thêm field (isLoading + isSuccess + errorMessage đủ).

### 5.2 UserPage (MyPage) — sửa

**File:** `lib/features/user/ui/user_page.dart`

**Thay đổi với guest:**

Hiện tại `UserPage` có 2 sections:
- **アカウント**: プロフィール (Profile), 購入履歴 (Order History)
- **設定**: 支払い方法 (Payment), 規約・プライバシー

Và bên dưới: Logout button + アカウント削除

**Guest user — ẩn các items sau (BR-10):**
- `UserPage` section アカウント: ẩn "プロフィール" (Cài đặt Profile)
- `UserPage` section 設定: ẩn "支払い方法" (Cài đặt payment methods)
- Logout button: ẩn
- アカウント削除: ẩn

**Guest user — hiện thêm:**
- Item "メールアドレスを連携する" (Link Email) ở đầu section アカウント
- Item "購入履歴" (Order History) vẫn hiển thị

**Logic render:**
```dart
final isGuest = ref.watch(isGuestProvider); // đọc từ AppPrefs.getUserType()

// Hiển thị/ẩn có điều kiện
if (!isGuest) UserMenuItem(label: 'プロフィール', ...),
if (isGuest) UserMenuItem(label: 'メールアドレスを連携する', onTap: () => context.router.push(LinkEmailRoute())),
UserMenuItem(label: '購入履歴', ...),          // luôn hiển thị
if (!isGuest) UserMenuItem(label: '支払い方法', ...),
UserMenuItem(label: '規約・プライバシー', ...),  // luôn hiển thị
if (!isGuest) UserLogoutButton(...),
if (!isGuest) Text('アカウント削除', ...),
```

### 5.3 BottomBarPage — sửa

**File:** `lib/features/bottom_bar/ui/bottom_bar_page.dart`

Hiện tại có 5 tab: Menu, Favorites, [Scan center], Notifications, MyPage.

**Guest user — ẩn tab Favorites + Notifications (BR-10):**

**Approach:** Dùng `IndexedStack` (hoặc filter `_pages` + `items`) để hiển thị có điều kiện.

```dart
final isGuest = ref.watch(isGuestProvider);

List<Widget> get _pages => [
  MenuPage(scanKey: _scanKey),
  if (!isGuest) FavoritePage(),
  Container(), // scan placeholder
  if (!isGuest) NotificationPage(),
  UserPage(),
];
```

Đồng thời filter `BottomNavigationBarItem` tương ứng.

**Lưu ý:** `_currentIndex` cần được quản lý cẩn thận khi số lượng tab thay đổi — dùng mapping index thay vì hard-code.

**Alternative approach đơn giản hơn:** Giữ nguyên cấu trúc BottomBar 5 tab, chỉ ẩn content bên trong FavoritePage và NotificationPage khi là guest (hiển thị placeholder "登録が必要です"). Approach này ít rủi ro hơn về logic index. **Recommend approach này.**

### 5.4 Cart/Checkout — sửa

**Files:** `lib/features/cart/ui/cart_page.dart`, `cart_details_confirm_page.dart`

**Thay đổi 1 — Ẩn Cash option cho guest:**
- `validateCompanyCode` response giờ trả về `guestPaymentAllowed: bool`
- `CartController` đọc `isGuest` từ `AppPrefs`
- Khi render payment methods: nếu `isGuest` → filter bỏ payment method có `code = 'CASH'` (hoặc type tương đương trong data)

**Thay đổi 2 — Block checkout nếu `guestPaymentAllowed = false`:**
- Khi `validateCompanyCode` trả về `valid: false` với reason chứa guest-specific message → hiển thị dialog block với CTA "アカウントを作成する"
- CTA navigate đến `RegisterRoute()` (route đăng ký thường hiện có)

**Company ID input:** `_buildCompanyId` widget đã tồn tại trong `cart_page.dart:351` và `cart_details_confirm_page.dart:263`. Không cần tạo mới — tái dùng hoàn toàn (BR-09 compliant).

### 5.5 Link Email Flow (3 screens mới)

**Screen 1: LinkEmailPage** (`lib/features/auth/link_email/ui/link_email_page.dart`)
- Text input email với validation
- Button "送信" → gọi `linkEmailController.sendOtp(email)`
- Loading indicator
- Error message display
- On success → navigate to `LinkEmailOtpRoute`

**Screen 2: LinkEmailOtpPage** (`lib/features/auth/link_email/ui/link_email_otp_page.dart`)
- OTP input (4 digits) — tái dùng pattern từ `register_otp_page.dart` hiện có
- Countdown timer 60s cho resend (tái dùng pattern forgot_password_otp)
- Button "再送信" (disabled trong 60s)
- On success OTP nhập → navigate to `LinkEmailSetPasswordRoute`

**Screen 3: LinkEmailSetPasswordPage** (`lib/features/auth/link_email/ui/link_email_set_password_page.dart`)
- Password input + Confirm password
- Button "確認" → gọi `linkEmailController.verifyAndUpgrade(email, otp, password)`
- On success → navigate back to app shell, refresh userType → all restricted items become accessible

### 5.6 LinkEmailController

**File:** `lib/features/auth/link_email/controller/link_email_controller.dart`

**State:**
```dart
@freezed
class LinkEmailState with _$LinkEmailState {
  const factory LinkEmailState({
    @Default('') String email,
    @Default('') String otp,
    @Default('') String password,
    @Default('') String confirmPassword,
    @Default(false) bool isLoading,
    @Default(false) bool isOtpSent,
    @Default(false) bool isSuccess,
    @Default('') String errorMessage,
    @Default(60) int resendCooldown,
  }) = _LinkEmailState;
}
```

**Methods:**
- `sendOtp(String email)` → gọi `authRepo.sendLinkEmailOtp(email)`
- `resendOtp()` → gọi lại `sendOtp` sau 60s
- `verifyAndUpgrade(String email, String otp, String password)` → gọi `authRepo.verifyLinkEmailOtp(email, otp, password)` → save new token → update userType = 'registered' in AppPrefs

### 5.7 isGuestProvider

**File:** `lib/features/user/provider/user_type_provider.dart`

```dart
final isGuestProvider = Provider<bool>((ref) {
  final prefs = ref.watch(appPrefsProvider);
  return prefs.getUserType() == 'guest';
});
```

Khi `verifyLinkEmailOtp` thành công → save new token + update userType 'registered' → `isGuestProvider` tự động rebuild tất cả consumer (UserPage, BottomBarPage, CartPage).

---

## 6. Routing

**Router thêm (`app_router.dart`):**
```dart
AutoRoute(page: LinkEmailRoute.page),
AutoRoute(page: LinkEmailOtpRoute.page),
AutoRoute(page: LinkEmailSetPasswordRoute.page),
```

Các route này đặt trong `AppShellRoute` children — accessible từ `UserPage`.

**Route guard:** Không cần guard riêng — nếu user không phải guest thì button Link Email không hiển thị. Nếu truy cập trực tiếp → API sẽ trả về 403, controller show error.

---

## 7. State Management

**Provider mới:**
- `isGuestProvider: Provider<bool>` — read-only, derive từ `AppPrefs`
- `linkEmailControllerProvider: NotifierProvider<LinkEmailController, LinkEmailState>`

**Không cần Redux/Riverpod state mới cho guest** — `isGuest` là derived state từ `AppPrefs` (storage), không cần global store riêng.

**Khi upgrade thành full account:**
1. Save token mới vào `AppPrefs`
2. Save `userType = 'registered'` vào `AppPrefs`
3. `isGuestProvider` sẽ return `false` → tất cả UI tự rebuild (Riverpod reactivity)
4. **Không force logout/login** — token mới được trả về từ `link-email/verify` (AC-04-4)

---

## 8. Interface với repo khác

| API | Direction | Ghi chú |
|---|---|---|
| `POST /auth/user/guest-login` | App → API | Response `{ accessToken, refreshToken }` — cùng format login thường |
| `POST /auth/user/link-email` | App → API | Request `{ email }` |
| `POST /auth/user/link-email/verify` | App → API | Request `{ email, otp, password }` — response `{ accessToken, refreshToken }` |
| `GET /user/orders/validate-company` | App → API | Response thêm `guestPaymentAllowed: bool` |

**Contract Lock items (cần confirm với BE trước Phase 3):**
1. `POST /auth/user/guest-login` — response format
2. `POST /auth/user/link-email` — request/response + error codes
3. `POST /auth/user/link-email/verify` — request/response + error codes
4. `GET /user/orders/validate-company` — response thêm field `guestPaymentAllowed`
5. `GET /user/me` — response có chứa `userType` field không? (cần confirm BE thêm field này)

---

## 9. Non-Regression Risks

| Tính năng hiện có | File liên quan | Rủi ro |
|---|---|---|
| Login thường | `login_page.dart`, `login_controller.dart` | Thêm button guest không break button Login — low risk |
| Register flow | `register_page.dart`, `register_controller.dart` | Không liên quan. Low risk |
| BottomBar tab index | `bottom_bar_page.dart` | Ẩn/hiện tab làm index shift → user ở tab index 2 (Notifications) có thể nhảy sai tab sau toggle. Cần test cẩn thận với approach ẩn tab |
| Cart/Checkout flow | `cart_controller.dart` | Filter payment methods → nếu logic filter sai có thể ẩn cả non-cash method với regular user. Cần test |
| validateCompany response | `validate_company_response.dart` | Thêm field mới (`guestPaymentAllowed`) — nếu backend trả về nhưng model không parse → field null → guest có thể lọt qua check. Cần đảm bảo parse đúng |
| UserPage render | `user_page.dart` | Điều kiện ẩn menu item phức tạp → cần snapshot test |
| AppPrefs | `app_prefs.dart` | Thêm `userType` key → nếu existing install không có key này → `getUserType()` return null → `isGuest` = false → user thường bị OK nhưng guest sẽ không được nhận diện đúng cho đến khi fetch lại |

---

## 10. Security Considerations

- **AC-01-3 (Secure Storage gap):** App hiện dùng `SharedPreferences` — không phải secure storage. Token lưu plain trong device storage. Đây là pre-existing issue, không phải regression của Guest Mode. Ghi nhận để xử lý trong security task riêng.
- **Guest token expiry:** Tái dùng JWT expiry config hiện có. Guest session tồn tại cho đến khi token expire hoặc app uninstall.
- **OTP brute force (mobile-side):** Không có giới hạn retry trên Mobile (theo SPEC BR-12). Backend đã có rate limit 1/60s cho resend.

---

## 11. Open Questions cho Tech Lead Tasks

- **OQ-1:** `GET /user/me` response hiện tại có trả về `userType` không? Nếu chưa → BE cần thêm. Mobile cần biết userType ngay sau login để set `AppPrefs`.
- **OQ-2:** BottomBar approach: ẩn hoàn toàn tab (phức tạp về index) hay hiển thị tab nhưng show placeholder bên trong? Recommend **approach placeholder** — ít breaking change hơn.
- **OQ-3:** Screen "登録が必要です" (AC-02-2) khi guest truy cập route trực tiếp — cần shared widget hoặc mỗi screen tự handle? Recommend shared `GuestRestrictedWidget`.
- **OQ-4:** CTA "アカウントを作成する" khi company block guest payment — navigate đến `RegisterRoute` hay `LinkEmailRoute`? Với user đã là guest, nên navigate đến `LinkEmailRoute` (upgrade). Cần confirm với BA/client.
