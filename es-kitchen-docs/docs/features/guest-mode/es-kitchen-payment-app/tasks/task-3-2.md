# [FE] Payment_App_Mobile — Flutter: UserPage + BottomBar + ValidateCompany (Guest UI Restrictions)

## Backlog Info
- **Issue Type:** Task
- **Category:** Payment_App_Mobile
- **Parent Issue:** Guest Mode — Phase 2 Implementation
- **Version:** Phase 2
- **Milestone:** Released xxx
- **Estimate Hour:** 7h
- **Actual Hour:** — _(điền khi Resolved)_
- **Status:** Open

## Metadata
| Thuộc tính | Giá trị |
|---|---|
| Phase | 3 — Flutter Mobile |
| Repo | `es-kitchen-payment-app` |
| Depends on | task-3-1 (isGuestProvider phải có trước) |
| Song song với | task-3-3, task-3-4 |
| Estimate | ~7h |

## Mục tiêu

Implement các UI restriction cho guest user theo BR-10 và US-02: (1) Ẩn 5 menu item trong UserPage và hiển thị "メールアドレスを連携する", (2) xử lý BottomBar tab cho guest (approach placeholder), (3) cập nhật `ValidateCompanyResponseModel` để parse `guestPaymentAllowed`, (4) ẩn cash payment option trong checkout khi guest.

## Context (đọc trước khi code)

- DESIGN.md: `es-kitchen-docs/docs/features/guest-mode/es-kitchen-payment-app/DESIGN.md` (section 5.2, 5.3, 5.4)
- File liên quan:
  - `lib/features/user/ui/user_page.dart` — xem layout sections hiện tại (アカウント / 設定) và cách render menu items để thêm điều kiện `isGuest`
  - `lib/features/bottom_bar/ui/bottom_bar_page.dart` — xem cấu trúc 5 tab hiện có, cách index được quản lý
  - `lib/data/models/order/validate_company_response.dart` — xem model hiện tại để thêm `guestPaymentAllowed`
  - `lib/features/cart/ui/cart_page.dart` (line ~351) và `cart_details_confirm_page.dart` (line ~263) — xem `_buildCompanyId` widget và payment method rendering
  - `lib/features/user/provider/user_type_provider.dart` — từ task-3-1, `isGuestProvider` đã có

## Yêu cầu implement

### 1. Sửa: `lib/features/user/ui/user_page.dart`

**Mục tiêu:** Ẩn 5 menu items cho guest, hiển thị "メールアドレスを連携する".

Hiện tại `UserPage` render các menu item cố định. Sau khi sửa:

```dart
// Ở đầu build():
final isGuest = ref.watch(isGuestProvider);

// Section アカウント:
if (isGuest)
  _buildMenuItem(
    label: 'メールアドレスを連携する',
    icon: Icons.link,
    onTap: () => context.router.push(const LinkEmailRoute()),
  ),
// Profile (ẩn với guest):
if (!isGuest)
  _buildMenuItem(label: 'プロフィール', ...),
// Order History — luôn hiển thị:
_buildMenuItem(label: '購入履歴', ...),

// Section 設定:
if (!isGuest)
  _buildMenuItem(label: '支払い方法', ...),
_buildMenuItem(label: '規約・プライバシー', ...), // luôn hiển thị

// Logout button (ẩn với guest):
if (!isGuest)
  _buildLogoutButton(),

// アカウント削除 (ẩn với guest):
if (!isGuest)
  _buildDeleteAccountButton(),
```

**BR-10 mapping:**
| Item | Hành vi |
|---|---|
| プロフィール | `if (!isGuest)` |
| 支払い方法 | `if (!isGuest)` |
| ログアウト button | `if (!isGuest)` |
| アカウント削除 | `if (!isGuest)` |
| メールアドレスを連携する | `if (isGuest)` — item mới |
| 購入履歴 | luôn hiển thị |
| 規約・プライバシー | luôn hiển thị |

**Lưu ý:** SPEC BR-10 có 7 items bị ẩn nhưng Thông báo (Notifications) và Yêu thích (Favorites) được xử lý ở BottomBar (không phải UserPage menu). Danh sách trên chỉ áp dụng cho UserPage section.

### 2. Sửa: `lib/features/bottom_bar/ui/bottom_bar_page.dart`

**Approach: Placeholder (recommended theo DESIGN section 5.3 OQ-2)** — giữ nguyên 5 tab, hiển thị placeholder bên trong FavoritePage và NotificationPage khi là guest.

Lý do chọn approach này: không thay đổi `_currentIndex` logic → không có rủi ro index shift.

**Sửa trong FavoritePage và NotificationPage** (hoặc trực tiếp trong BottomBar nếu dùng `IndexedStack`):

```dart
// Ví dụ trong BottomBarPage — wrap content của tab Favorites:
final isGuest = ref.watch(isGuestProvider);

// Trong IndexedStack hoặc body của từng tab:
// Tab Favorites (index 1):
isGuest
    ? const GuestRestrictedWidget() // widget mới tái dùng — xem OQ-3
    : const FavoritePage(),

// Tab Notifications (index 3):
isGuest
    ? const GuestRestrictedWidget()
    : const NotificationPage(),
```

**GuestRestrictedWidget** (tạo shared widget):
```dart
// lib/shared/widgets/guest_restricted_widget.dart
class GuestRestrictedWidget extends StatelessWidget {
  const GuestRestrictedWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.lock_outline, size: 48, color: Colors.grey),
          const SizedBox(height: 16),
          const Text('登録が必要です', style: TextStyle(fontSize: 16)),
          const SizedBox(height: 8),
          TextButton(
            onPressed: () => context.router.push(const LinkEmailRoute()),
            child: const Text('アカウントを作成する'),
          ),
        ],
      ),
    );
  }
}
```

**Manual Smoke Test quan trọng cho BottomBar:**

Sau khi implement, PHẢI test thủ công các case sau (ghi vào note khi submit PR):
- [ ] Guest: bấm tab Favorites → placeholder hiển thị, không crash
- [ ] Guest: bấm tab Notifications → placeholder hiển thị, không crash
- [ ] Guest: hiện ở tab Favorites (index 1) → navigate sang UserPage (index 4) → tab index đúng
- [ ] Guest: upgrade thành registered → `isGuestProvider` = false → Favorites và Notifications accessible ngay (không cần restart app)
- [ ] Registered user: không bị ảnh hưởng — Favorites và Notifications hiển thị bình thường

### 3. Sửa: `lib/data/models/order/validate_company_response.dart`

Thêm field mới vào model:

```dart
@JsonKey(name: 'guestPaymentAllowed', defaultValue: true)
final bool guestPaymentAllowed;
```

`defaultValue: true` đảm bảo parse an toàn nếu backend cũ chưa trả về field này (BR-05).

Chạy codegen: `flutter pub run build_runner build --delete-conflicting-outputs`

### 4. Sửa: `lib/features/cart/ui/cart_page.dart` và `cart_details_confirm_page.dart`

**Ẩn Cash payment option cho guest:**

Tìm nơi render danh sách payment methods. Khi build list:
```dart
final isGuest = ref.watch(isGuestProvider);
final filteredMethods = isGuest
    ? paymentMethods.where((m) => !m.isCash).toList() // filter bỏ CASH
    : paymentMethods;
```

**Block checkout khi `guestPaymentAllowed = false`:**

Khi `validateCompanyCode` response trả về `valid: false` với reason là guest-specific:
```dart
if (!validateResult.valid && isGuest && !validateResult.guestPaymentAllowed) {
  // Hiển thị dialog block
  showDialog(
    context: context,
    builder: (_) => AlertDialog(
      content: Text('この会社はゲストの支払いを許可していません'),
      actions: [
        TextButton(
          onPressed: () => context.router.push(const LinkEmailRoute()),
          child: const Text('アカウントを作成する'), // CTA → LinkEmail flow
        ),
      ],
    ),
  );
  return;
}
```

**Lưu ý về CTA:** Theo DESIGN OQ-4, khi user đã là guest → CTA "アカウントを作成する" phải dẫn đến `LinkEmailRoute` (upgrade), không phải `RegisterRoute` (đăng ký mới). Confirm lại với client nếu cần, tạm implement theo `LinkEmailRoute`.

**Company ID input:** `_buildCompanyId` widget ở `cart_page.dart:351` và `cart_details_confirm_page.dart:263` đã tồn tại — không sửa (BR-09 compliant).

## Unit Tests (BẮT BUỘC)

### Test file: `test/features/user/ui/user_page_test.dart`

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';

void main() {
  group('UserPage — Guest Mode rendering', () {
    testWidgets('should hide Profile, Payment, Logout, DeleteAccount for guest', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            isGuestProvider.overrideWithValue(true),
          ],
          child: const MaterialApp(home: UserPage()),
        ),
      );

      expect(find.text('プロフィール'), findsNothing);
      expect(find.text('支払い方法'), findsNothing);
      expect(find.text('ログアウト'), findsNothing);
      expect(find.text('アカウント削除'), findsNothing);
    });

    testWidgets('should show Link Email CTA for guest', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [isGuestProvider.overrideWithValue(true)],
          child: const MaterialApp(home: UserPage()),
        ),
      );
      expect(find.text('メールアドレスを連携する'), findsOneWidget);
    });

    testWidgets('should show all items for registered user', (tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [isGuestProvider.overrideWithValue(false)],
          child: const MaterialApp(home: UserPage()),
        ),
      );
      expect(find.text('プロフィール'), findsOneWidget);
      expect(find.text('支払い方法'), findsOneWidget);
    });

    testWidgets('should always show Order History for both guest and registered', (tester) async {
      for (final isGuest in [true, false]) {
        await tester.pumpWidget(
          ProviderScope(
            overrides: [isGuestProvider.overrideWithValue(isGuest)],
            child: const MaterialApp(home: UserPage()),
          ),
        );
        expect(find.text('購入履歴'), findsOneWidget);
      }
    });
  });
}
```

### Test file: `test/data/models/validate_company_response_test.dart`

```dart
void main() {
  group('ValidateCompanyResponse.fromJson()', () {
    test('should parse guestPaymentAllowed = true', () {
      final json = {'valid': true, 'guestPaymentAllowed': true, ...};
      final model = ValidateCompanyResponseModel.fromJson(json);
      expect(model.guestPaymentAllowed, true);
    });

    test('should default guestPaymentAllowed to true when field missing', () {
      final json = {'valid': true}; // field không có trong response
      final model = ValidateCompanyResponseModel.fromJson(json);
      expect(model.guestPaymentAllowed, true); // defaultValue: true
    });

    test('should parse guestPaymentAllowed = false', () {
      final json = {'valid': false, 'guestPaymentAllowed': false};
      final model = ValidateCompanyResponseModel.fromJson(json);
      expect(model.guestPaymentAllowed, false);
    });
  });
}
```

**Coverage target:**
| File | Target |
|---|---|
| `user_page.dart` (conditional rendering) | ≥ 70% |
| `validate_company_response.dart` | ≥ 75% |

**Verify:** `flutter test test/features/user/` và `flutter test test/data/models/`

## Non-Regression Table

| Tính năng | File liên quan | Rủi ro | Cách verify |
|---|---|---|---|
| BottomBar tab index | `bottom_bar_page.dart` | Placeholder approach ít rủi ro hơn hide tab | Smoke test 5 cases ở mục 2 trên |
| Cart flow — registered user | `cart_page.dart` | Filter payment methods không ảnh hưởng registered | Unit test: isGuest=false → không filter |
| UserPage registered user | `user_page.dart` | Điều kiện `!isGuest` không hide item sai | Widget test: isGuest=false → tất cả items hiển thị |
| validateCompany response parse | `validate_company_response.dart` | Field mới có `defaultValue: true` → backward compat | Unit test: json thiếu field → parse không crash |

## Không được làm

- Không implement BottomBar approach "ẩn tab" (hide hoàn toàn tab) — dùng placeholder approach để tránh index shift
- Không implement Link Email screens trong task này — task riêng (task-3-3)
- Không sửa `cart_controller.dart` checkout logic ngoài filter payment methods và block dialog
- Không implement Notifications hay Favorites logic — chỉ thêm `GuestRestrictedWidget` placeholder

## Definition of Done

- [ ] Build pass (`flutter build apk --debug`)
- [ ] `flutter analyze` pass
- [ ] Unit Tests pass — coverage đạt target
- [ ] Widget tests cho UserPage: guest ẩn đúng 5 items, registered thấy đầy đủ
- [ ] Smoke test BottomBar: 5 cases thủ công pass (ghi note trong PR)
- [ ] `ValidateCompanyResponseModel` parse đúng `guestPaymentAllowed` kể cả khi field thiếu
- [ ] Cash option bị filter trong checkout khi isGuest=true
- [ ] Non-Regression verify đủ
- [ ] Actual Hour cập nhật
- [ ] Status → Request Review
