# [FE] Payment_App_Mobile — Flutter: Link Email Flow (3 Screens + LinkEmailController)

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 8h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Flutter Mobile |
| Repo | `es-kitchen-payment-app` |
| Depends on | task-3-1 (isGuestProvider + AuthRepository methods) |
| Song song với | task-3-2, task-3-4 |
| Estimate | ~8h |

## Mục tiêu

Implement toàn bộ "Link Email / Upgrade" flow cho guest user (US-04): 3 màn hình mới (nhập email → nhập OTP → set password), `LinkEmailController`, `LinkEmailState`, và routing. Sau khi hoàn tất flow này, guest tự động được nâng cấp thành full account mà không cần logout/login lại (AC-04-4).

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-payment-app/DESIGN.md` (section 3, 4, 5.5, 5.6, 6, 7)
- File liên quan:
  - `lib/features/auth/login/ui/login_page.dart` — xem layout pattern tổng thể
  - `lib/features/auth/register/ui/register_otp_page.dart` — tái dùng pattern OTP input (4 chữ số)
  - Bất kỳ màn hình nào có countdown timer 60s trong codebase (vd `forgot_password_otp_page.dart` nếu tồn tại) — tái dùng pattern
  - `lib/app/routers/app_router.dart` — xem cách thêm route mới (auto_route pattern)
  - `lib/data/repositories/auth_repository.dart` — đã có `sendLinkEmailOtp()` và `verifyLinkEmailOtp()` từ task-3-1
  - `lib/app/core/prefs/app_prefs.dart` — đã có `saveUserType()` từ task-3-1

## Yêu cầu implement

### 1. Tạo mới: `lib/features/auth/link_email/state/link_email_state.dart`

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
part 'link_email_state.freezed.dart';

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
    @Default(60) int resendCooldown, // countdown giây, 0 = có thể resend
  }) = _LinkEmailState;
}
```

Chạy codegen: `flutter pub run build_runner build --delete-conflicting-outputs`

### 2. Tạo mới: `lib/features/auth/link_email/controller/link_email_controller.dart`

```dart
import 'package:hooks_riverpod/hooks_riverpod.dart';
import '../state/link_email_state.dart';

class LinkEmailController extends Notifier<LinkEmailState> {
  @override
  LinkEmailState build() => const LinkEmailState();

  Future<void> sendOtp(String email) async {
    state = state.copyWith(isLoading: true, errorMessage: '');
    try {
      final authRepo = ref.read(authRepositoryProvider);
      await authRepo.sendLinkEmailOtp(email);
      state = state.copyWith(
        isLoading: false,
        email: email,
        isOtpSent: true,
        resendCooldown: 60,
      );
      _startResendCountdown(); // bắt đầu đếm ngược 60s
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _parseError(e),
      );
    }
  }

  void _startResendCountdown() {
    // Dùng Timer.periodic để đếm ngược resendCooldown từ 60 → 0
    // Khi = 0 → Resend button active
    // Pattern: xem codebase hiện có (forgot_password_otp hoặc tương đương)
  }

  Future<void> resendOtp() async {
    if (state.resendCooldown > 0) return; // guard
    await sendOtp(state.email);
  }

  Future<void> verifyAndUpgrade({
    required String otp,
    required String password,
  }) async {
    state = state.copyWith(isLoading: true, errorMessage: '', otp: otp, password: password);
    try {
      final authRepo = ref.read(authRepositoryProvider);
      final response = await authRepo.verifyLinkEmailOtp(
        email: state.email,
        otp: otp,
        password: password,
      );

      // Save new token + update userType (AC-04-4: không force logout)
      final prefs = ref.read(appPrefsProvider);
      await prefs.saveToken(response.accessToken);
      await prefs.saveRefreshToken(response.refreshToken);
      await prefs.saveUserType('registered'); // account upgraded

      state = state.copyWith(isLoading: false, isSuccess: true);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _parseError(e),
      );
    }
  }

  String _parseError(Object e) {
    // Map HTTP error code/message sang user-friendly message
    // Tái dùng pattern error parsing hiện có trong codebase
    return 'エラーが発生しました。もう一度お試しください。';
  }
}

final linkEmailControllerProvider =
    NotifierProvider<LinkEmailController, LinkEmailState>(LinkEmailController.new);
```

### 3. Tạo mới: `lib/features/auth/link_email/ui/link_email_page.dart`

```dart
// Screen 1: Nhập email
class LinkEmailPage extends ConsumerWidget {
  const LinkEmailPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(linkEmailControllerProvider);
    final controller = TextEditingController();

    return Scaffold(
      appBar: AppBar(title: const Text('メールアドレスを連携する')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            TextFormField(
              controller: controller,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(
                labelText: 'メールアドレス',
                hintText: 'example@email.com',
              ),
            ),
            if (state.errorMessage.isNotEmpty)
              Text(state.errorMessage, style: const TextStyle(color: Colors.red)),
            const Spacer(),
            ElevatedButton(
              onPressed: state.isLoading
                  ? null
                  : () async {
                      await ref
                          .read(linkEmailControllerProvider.notifier)
                          .sendOtp(controller.text.trim());
                      if (ref.read(linkEmailControllerProvider).isOtpSent) {
                        context.router.push(const LinkEmailOtpRoute());
                      }
                    },
              child: state.isLoading
                  ? const CircularProgressIndicator()
                  : const Text('送信'),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 4. Tạo mới: `lib/features/auth/link_email/ui/link_email_otp_page.dart`

```dart
// Screen 2: Nhập OTP (4 chữ số)
// Tái dùng pattern OTP input từ register_otp_page.dart
// Tái dùng pattern countdown timer 60s (resend button)
// Khi OTP hợp lệ (format) → navigate to LinkEmailSetPasswordRoute
// Lưu otp trong state, truyền sang screen 3
```

**Lưu ý:** OTP là 4 chữ số (BR-12) — input phải enforce maxLength=4, numeric only.

**Countdown timer:** Resend button disabled trong 60s đầu, active sau khi `resendCooldown = 0`. Tái dùng pattern countdown hiện có trong codebase (tìm file có `Timer.periodic` + `resend` trong tên).

### 5. Tạo mới: `lib/features/auth/link_email/ui/link_email_set_password_page.dart`

```dart
// Screen 3: Set password
// 2 field: password + confirm password
// Validation: password >= 8 chars, confirm == password
// Button "確認" → gọi verifyAndUpgrade(otp, password)
// On success:
//   - isGuestProvider rebuild → false
//   - Navigate back to app shell (pop all link email routes)
//   - Toast: "連携完了しました"
// On error: hiển thị errorMessage
```

**Xử lý sau upgrade thành công:**

```dart
if (state.isSuccess) {
  // Pop toàn bộ link email stack để về app shell
  context.router.popUntilRoot();
  // hoặc navigate về UserPage
  // Toast notification
  ScaffoldMessenger.of(context).showSnackBar(
    const SnackBar(content: Text('連携完了しました')),
  );
}
```

### 6. Sửa: `lib/app/routers/app_router.dart`

Thêm 3 routes mới trong `AppShellRoute` children:

```dart
AutoRoute(page: LinkEmailRoute.page),
AutoRoute(page: LinkEmailOtpRoute.page),
AutoRoute(page: LinkEmailSetPasswordRoute.page),
```

Chạy codegen: `flutter pub run build_runner build --delete-conflicting-outputs`

## Unit Tests (BẮT BUỘC)

### Test file: `test/features/auth/link_email/controller/link_email_controller_test.dart`

```dart
void main() {
  group('LinkEmailController', () {
    late ProviderContainer container;
    late MockAuthRepository mockAuthRepo;
    late MockAppPrefs mockPrefs;

    setUp(() {
      mockAuthRepo = MockAuthRepository();
      mockPrefs = MockAppPrefs();
      container = ProviderContainer(overrides: [
        authRepositoryProvider.overrideWithValue(mockAuthRepo),
        appPrefsProvider.overrideWithValue(mockPrefs),
      ]);
    });

    group('sendOtp()', () {
      test('should set isOtpSent=true and start cooldown on success', () async {
        when(() => mockAuthRepo.sendLinkEmailOtp(email: 'test@mail.com'))
            .thenAnswer((_) async {});

        await container.read(linkEmailControllerProvider.notifier).sendOtp('test@mail.com');

        final state = container.read(linkEmailControllerProvider);
        expect(state.isOtpSent, true);
        expect(state.email, 'test@mail.com');
        expect(state.resendCooldown, 60);
        expect(state.errorMessage, '');
      });

      test('should set errorMessage on failure', () async {
        when(() => mockAuthRepo.sendLinkEmailOtp(email: any(named: 'email')))
            .thenThrow(Exception('email exists'));

        await container.read(linkEmailControllerProvider.notifier).sendOtp('existing@mail.com');

        expect(container.read(linkEmailControllerProvider).errorMessage, isNotEmpty);
        expect(container.read(linkEmailControllerProvider).isOtpSent, false);
      });
    });

    group('verifyAndUpgrade()', () {
      test('should save new token and set userType=registered on success', () async {
        when(() => mockAuthRepo.verifyLinkEmailOtp(
          email: any(named: 'email'),
          otp: any(named: 'otp'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => LoginResponse(accessToken: 'new_at', refreshToken: 'new_rt'));
        when(() => mockPrefs.saveToken(any())).thenAnswer((_) async {});
        when(() => mockPrefs.saveRefreshToken(any())).thenAnswer((_) async {});
        when(() => mockPrefs.saveUserType(any())).thenAnswer((_) async {});

        // Set initial email state
        container.read(linkEmailControllerProvider.notifier).state =
            const LinkEmailState(email: 'test@mail.com', isOtpSent: true);

        await container.read(linkEmailControllerProvider.notifier).verifyAndUpgrade(
          otp: '1234',
          password: 'SecurePass1!',
        );

        final state = container.read(linkEmailControllerProvider);
        expect(state.isSuccess, true);
        verify(() => mockPrefs.saveUserType('registered')).called(1);
      });

      test('should set errorMessage on OTP invalid', () async {
        when(() => mockAuthRepo.verifyLinkEmailOtp(
          email: any(named: 'email'),
          otp: any(named: 'otp'),
          password: any(named: 'password'),
        )).thenThrow(Exception('invalid OTP'));

        container.read(linkEmailControllerProvider.notifier).state =
            const LinkEmailState(email: 'test@mail.com');

        await container.read(linkEmailControllerProvider.notifier).verifyAndUpgrade(
          otp: '9999',
          password: 'SecurePass1!',
        );

        expect(container.read(linkEmailControllerProvider).isSuccess, false);
        expect(container.read(linkEmailControllerProvider).errorMessage, isNotEmpty);
      });

      test('should NOT force logout — token preserved (AC-04-4)', () async {
        when(() => mockAuthRepo.verifyLinkEmailOtp(
          email: any(named: 'email'),
          otp: any(named: 'otp'),
          password: any(named: 'password'),
        )).thenAnswer((_) async => LoginResponse(accessToken: 'new_at', refreshToken: 'new_rt'));
        when(() => mockPrefs.saveToken(any())).thenAnswer((_) async {});
        when(() => mockPrefs.saveRefreshToken(any())).thenAnswer((_) async {});
        when(() => mockPrefs.saveUserType(any())).thenAnswer((_) async {});

        container.read(linkEmailControllerProvider.notifier).state =
            const LinkEmailState(email: 'test@mail.com');

        await container.read(linkEmailControllerProvider.notifier).verifyAndUpgrade(
          otp: '1234',
          password: 'SecurePass1!',
        );

        // Verify new token saved (not cleared)
        verify(() => mockPrefs.saveToken('new_at')).called(1);
      });
    });

    group('resendOtp()', () {
      test('should NOT call sendOtp when resendCooldown > 0', () async {
        container.read(linkEmailControllerProvider.notifier).state =
            const LinkEmailState(email: 'test@mail.com', resendCooldown: 30);

        await container.read(linkEmailControllerProvider.notifier).resendOtp();

        verifyNever(() => mockAuthRepo.sendLinkEmailOtp(email: any(named: 'email')));
      });

      test('should call sendOtp when resendCooldown = 0', () async {
        when(() => mockAuthRepo.sendLinkEmailOtp(email: any(named: 'email')))
            .thenAnswer((_) async {});
        container.read(linkEmailControllerProvider.notifier).state =
            const LinkEmailState(email: 'test@mail.com', resendCooldown: 0);

        await container.read(linkEmailControllerProvider.notifier).resendOtp();

        verify(() => mockAuthRepo.sendLinkEmailOtp(email: 'test@mail.com')).called(1);
      });
    });
  });
}
```

**Coverage target:**
| File | Target |
|---|---|
| `link_email_controller.dart` | ≥ 75% |
| `link_email_state.dart` (freezed) | N/A (generated) |

**Verify:** `flutter test test/features/auth/link_email/`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login flow (existing) | `login_page.dart`, `login_controller.dart` | Không bị touch — verify `flutter test test/features/auth/login/` |
| Register flow | `register_*` | Không bị touch |
| Router — existing routes | `app_router.dart` | `app_router.gr.dart` sau codegen không xóa routes cũ |
| AppPrefs token key | `app_prefs.dart` | `saveToken()` dùng key khác với `saveUserType()` — không overwrite |
| isGuestProvider rebuild | `user_type_provider.dart` | Sau `saveUserType('registered')` → `prefs.isGuest = false` → provider rebuild → UI update tức thì |

## Không được làm

- Không implement màn hình Order History trong task này — order history tái dùng endpoint hiện có, không cần sửa
- Không sửa Register flow — chỉ tạo Link Email flow riêng
- Không dùng `Navigator.push` trực tiếp — dùng `auto_route` (`context.router.push(...)`)
- Không implement email template — chỉ gọi API

## Definition of Done

- [ ] Build pass (`flutter build apk --debug`)
- [ ] `flutter analyze` pass
- [ ] Unit Tests pass — coverage đạt target (≥ 75% cho controller)
- [ ] Codegen pass (`app_router.gr.dart`, `link_email_state.freezed.dart` cập nhật)
- [ ] Flow E2E thủ công: Link Email button → nhập email → OTP → set password → account upgraded → restricted items accessible ngay (không restart)
- [ ] AC-04-4 verify: sau upgrade token vẫn valid (không bị logout)
- [ ] Resend countdown 60s hoạt động đúng
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
