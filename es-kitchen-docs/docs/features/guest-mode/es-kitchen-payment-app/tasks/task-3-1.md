# [FE] Payment_App_Mobile — Flutter: AppPrefs + isGuestProvider + Guest Login Button (Foundation)

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 6h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Flutter Mobile |
| Repo | `es-kitchen-payment-app` |
| Depends on | task-2-4 (Contract Lock) |
| Song song với | task-3-2, task-3-4 (Web Admin) |
| Estimate | ~6h |

## Mục tiêu

Xây dựng foundation cho guest mode trên Flutter: (1) thêm `userType` vào `AppPrefs`, (2) tạo `isGuestProvider`, (3) thêm API method `guestLogin()` vào repository, (4) thêm `guestLogin()` method vào `LoginController`, (5) thêm button "ゲストとして利用する" vào `LoginPage`. Đây là prerequisite cho tất cả task Flutter khác trong Phase 3.

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-payment-app/DESIGN.md` (section 2, 3, 5.1, 5.7, 6, 7)
- File liên quan:
  - `lib/app/core/prefs/app_prefs.dart` — xem pattern lưu/đọc token hiện có để thêm `userType` đúng convention
  - `lib/data/repositories/auth_repository.dart` — xem pattern method `login()` để thêm `guestLogin()` tương tự
  - `lib/data/api/app_api.dart` — xem pattern annotation retrofit để thêm `guestLogin` endpoint
  - `lib/data/api/app_endpoints.dart` — xem format constant hiện có
  - `lib/features/auth/login/controller/login_controller.dart` — xem pattern `login()` method để thêm `guestLogin()`
  - `lib/features/auth/login/ui/login_page.dart` — xem layout hiện có để đặt button đúng vị trí

## Yêu cầu implement

### 1. Sửa: `lib/app/core/prefs/app_prefs.dart`

Thêm 3 method:
```dart
static const _userTypeKey = 'user_type';

Future<void> saveUserType(String type) async {
  await _prefs.setString(_userTypeKey, type);
}

String? getUserType() {
  return _prefs.getString(_userTypeKey);
}

bool get isGuest => getUserType() == 'guest';
```

### 2. Tạo mới: `lib/features/user/provider/user_type_provider.dart`

```dart
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:es_kitchen/app/core/prefs/app_prefs.dart';

/// Derives guest status from AppPrefs — no global store needed.
/// Automatically rebuilds all consumers when userType changes in AppPrefs.
final isGuestProvider = Provider<bool>((ref) {
  final prefs = ref.watch(appPrefsProvider);
  return prefs.isGuest;
});
```

**Lưu ý:** `appPrefsProvider` phải là Riverpod provider (nếu chưa có, cần tạo hoặc verify). Xem pattern inject `AppPrefs` hiện có trong codebase trước khi implement.

### 3. Sửa: `lib/data/api/app_endpoints.dart`

Thêm constants:
```dart
static const guestLogin = 'auth/user/guest-login';
static const linkEmail = 'auth/user/link-email';
static const linkEmailVerify = 'auth/user/link-email/verify';
```

### 4. Sửa: `lib/data/api/app_api.dart`

Thêm method (tái dùng response type `LoginResponse` — cùng structure `{accessToken, refreshToken}`):
```dart
@POST(AppEndpoints.guestLogin)
Future<LoginResponse> guestLogin();
```

Sau khi thêm → chạy codegen: `flutter pub run build_runner build --delete-conflicting-outputs`

### 5. Sửa: `lib/data/repositories/auth_repository.dart`

Thêm method:
```dart
Future<LoginResponse> guestLogin() async {
  return await _api.guestLogin();
}
```

### 6. Sửa: `lib/features/auth/login/controller/login_controller.dart`

Thêm method `guestLogin()`:
```dart
Future<void> guestLogin() async {
  state = state.copyWith(isLoading: true, errorMessage: '');
  try {
    final authRepo = ref.read(authRepositoryProvider);
    final response = await authRepo.guestLogin();

    // Lưu token (cùng mechanism với login thường)
    await ref.read(appPrefsProvider).saveToken(response.accessToken);
    await ref.read(appPrefsProvider).saveRefreshToken(response.refreshToken);

    // Lấy userType từ /user/me và lưu vào AppPrefs
    // (verify với BE trong Contract Lock task-2-4 rằng /user/me có field userType)
    final userInfo = await ref.read(userRepositoryProvider).getMe();
    await ref.read(appPrefsProvider).saveUserType(userInfo.userType ?? 'guest');

    state = state.copyWith(isLoading: false, isSuccess: true);
  } catch (e) {
    state = state.copyWith(
      isLoading: false,
      errorMessage: 'ゲストログインに失敗しました。もう一度お試しください。',
    );
  }
}
```

**Fallback:** Nếu `GET /user/me` chưa có `userType` (Contract Lock chưa confirm) → save `'guest'` hardcode tạm thời với TODO comment.

### 7. Sửa: `lib/features/auth/login/ui/login_page.dart`

Thêm button bên dưới button "新規登録" (hoặc vị trí đã có trong thiết kế):

```dart
// Sau button 新規登録:
const SizedBox(height: 12),
TextButton(
  onPressed: state.isLoading
      ? null
      : () => ref.read(loginControllerProvider.notifier).guestLogin(),
  child: const Text(
    'ゲストとして利用する',
    style: TextStyle(
      // font.text sm.medium — 14px / weight 500
      // color: colors.semantics.neutral.500 (phân biệt với primary button)
    ),
  ),
),
```

**Error handling:** Nếu `guestLogin()` fail → hiển thị `state.errorMessage` với SnackBar/Toast hiện có trong codebase (tái dùng pattern). Không để user bị stuck.

**Loading state:** Tái dùng `state.isLoading` — disable button trong khi đang gọi API.

## Unit Tests (BẮT BUỘC)

### Test file: `test/features/auth/login/controller/login_controller_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:mocktail/mocktail.dart';

class MockAuthRepository extends Mock implements AuthRepository {}
class MockAppPrefs extends Mock implements AppPrefs {}

void main() {
  group('LoginController.guestLogin()', () {
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

    tearDown(() => container.dispose());

    test('should set isLoading=true then isSuccess=true on success', () async {
      when(() => mockAuthRepo.guestLogin()).thenAnswer(
        (_) async => LoginResponse(accessToken: 'at', refreshToken: 'rt'),
      );
      when(() => mockPrefs.saveToken(any())).thenAnswer((_) async {});
      when(() => mockPrefs.saveRefreshToken(any())).thenAnswer((_) async {});
      when(() => mockPrefs.saveUserType(any())).thenAnswer((_) async {});
      // mock getMe() nếu có

      final notifier = container.read(loginControllerProvider.notifier);
      await notifier.guestLogin();

      final state = container.read(loginControllerProvider);
      expect(state.isSuccess, true);
      expect(state.isLoading, false);
      expect(state.errorMessage, '');
    });

    test('should set errorMessage on API failure', () async {
      when(() => mockAuthRepo.guestLogin()).thenThrow(Exception('network error'));

      final notifier = container.read(loginControllerProvider.notifier);
      await notifier.guestLogin();

      final state = container.read(loginControllerProvider);
      expect(state.isSuccess, false);
      expect(state.isLoading, false);
      expect(state.errorMessage, isNotEmpty);
    });
  });

  group('isGuestProvider', () {
    test('should return true when userType is guest', () {
      final mockPrefs = MockAppPrefs();
      when(() => mockPrefs.isGuest).thenReturn(true);

      final container = ProviderContainer(overrides: [
        appPrefsProvider.overrideWithValue(mockPrefs),
      ]);

      expect(container.read(isGuestProvider), true);
    });

    test('should return false when userType is registered', () {
      final mockPrefs = MockAppPrefs();
      when(() => mockPrefs.isGuest).thenReturn(false);

      final container = ProviderContainer(overrides: [
        appPrefsProvider.overrideWithValue(mockPrefs),
      ]);

      expect(container.read(isGuestProvider), false);
    });
  });
}
```

**Coverage target:**
| File | Target |
|---|---|
| `login_controller.dart` (guestLogin method) | ≥ 75% |
| `user_type_provider.dart` | ≥ 75% |
| `app_prefs.dart` (userType methods) | ≥ 75% |

**Verify:** `flutter test test/features/auth/login/controller/login_controller_test.dart`

## Non-Regression Table

| Tính năng | File liên quan | Cách verify |
|---|---|---|
| Login thường | `login_controller.dart:login()` | Unit test `login()` method vẫn pass sau khi thêm `guestLogin()` |
| Token lưu login thường | `app_prefs.dart` | Thêm `userType` key không xung đột với `token` / `refreshToken` key |
| `isGuestProvider` khi key chưa có | `app_prefs.dart:getUserType()` | Return `null` → `isGuest = false` → user treated as registered (safe default) |
| Codegen app_api.g.dart | `app_api.dart` | Chạy `flutter pub run build_runner build` — không lỗi codegen |

## Không được làm

- Không thay đổi `SharedPreferences` sang `FlutterSecureStorage` — ngoài scope (DESIGN section 2, Security note)
- Không sửa `login()` method trong `LoginController`
- Không implement UI cho UserPage, BottomBar, Cart trong task này — task riêng (task-3-2, task-3-3)
- Không hardcode button style — dùng design tokens theo `.claude/rules/design_rule.md`

## Smoke Test thủ công (Manual)

Sau khi implement:
1. Build app DEV: `flutter run --flavor dev`
2. Mở Login screen → verify button "ゲストとして利用する" hiển thị, phân biệt rõ với button Login thường
3. Bấm button → spinner xuất hiện → app navigate vào app shell trong ≤ 3 giây (AC-01-2)
4. Kiểm tra `AppPrefs.getUserType()` = `'guest'` (debug print hoặc dev tool)
5. Tắt app → mở lại → session được tái dùng (AC-01-5) — không tạo guest mới

## Definition of Done

- [ ] Build pass (`flutter build apk --debug`)
- [ ] `flutter analyze` pass (no error)
- [ ] Unit Tests pass — coverage đạt target
- [ ] Codegen chạy không lỗi (`app_api.g.dart` cập nhật)
- [ ] Smoke test thủ công pass (5 bước trên)
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
