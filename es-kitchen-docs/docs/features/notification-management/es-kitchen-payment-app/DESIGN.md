# DESIGN: Notification Management — es-kitchen-payment-app (User E01)

> **SPEC:** `es-kitchen-docs/docs/features/notification-management/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md` (section 3.2 - actor `user`)
> **Date:** 2026-06-02

---

## 1. Phạm vi mobile

User mobile (E01) nhận notification qua 2 kênh:
1. **Push notification** (Firebase FCM) — khi notification được publish
2. **In-app list** — luôn có thể xem lại trong app

Khác web (top banner), mobile dùng dedicated screen + push notification.

---

## 2. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Screen | `lib/features/notification/screens/notification_list_screen.dart` | NEW |
| Screen | `lib/features/notification/screens/notification_detail_screen.dart` | NEW |
| Widget | `lib/features/notification/widgets/notification_item.dart` | NEW |
| Widget | `lib/features/notification/widgets/unread_badge.dart` | NEW (chèn vào tab bar / home icon) |
| Provider | `lib/features/notification/providers/notification_list_provider.dart` | NEW (StateNotifierProvider) |
| Provider | `lib/features/notification/providers/unread_count_provider.dart` | NEW |
| Model | `lib/features/notification/models/notification_model.dart` (freezed) | NEW |
| API | `lib/features/notification/api/notification_api.dart` (Retrofit) | NEW |
| Push handler | `lib/core/notification/push_handler.dart` | EDIT — handle type `admin_broadcast` |
| Routing | `auto_route` config | EDIT |
| Local cache | Hive box `notification_cache` | NEW (offline read history) |

---

## 3. Screen flow

```
Home tab bar có "Notification" tab với UnreadBadge
  ↓ tap
NotificationListScreen
  - Infinite scroll list
  - Pull to refresh
  - Empty state nếu chưa có
  - Item: tiêu đề + snippet + thời gian + dot indicator NEW nếu unread
  ↓ tap item
NotificationDetailScreen
  - Full content
  - Attachment chips → tap download/open trong viewer
  - Tự gọi API mark-as-read khi mount
  - Update local cache
```

### Push notification handle

```
App background / killed → Firebase push đến
  ↓ user tap notification
push_handler.dart parse payload {type: 'admin_broadcast', notification_id: ...}
  ↓
router.push(NotificationDetailRoute(id))
```

App foreground → in-app notification banner (qua `flutter_local_notifications` hoặc inline UI), tap → detail.

---

## 4. State / Provider (Riverpod 3)

```dart
@freezed
class NotificationItem with _$NotificationItem {
  const factory NotificationItem({
    required String id,
    required String title,
    required String contentSnippet,
    required DateTime createdAt,
    required bool isRead,
    @Default([]) List<AttachmentRef> attachments,
  }) = _NotificationItem;
}

class NotificationListNotifier extends StateNotifier<AsyncValue<List<NotificationItem>>> {
  Future<void> loadMore();
  Future<void> refresh();
  Future<void> markAsRead(String id);
}

final notificationListProvider = StateNotifierProvider<NotificationListNotifier, AsyncValue<List<NotificationItem>>>(...);
final unreadCountProvider = StateNotifierProvider<UnreadCountNotifier, int>(...);
```

---

## 5. API Integration

```dart
@RestApi()
abstract class NotificationApi {
  factory NotificationApi(Dio dio) = _NotificationApi;
  
  @GET('/user/notifications')
  Future<PaginatedResponse<NotificationItem>> list(@Query('page') int page, @Query('limit') int limit);
  
  @GET('/user/notifications/{id}')
  Future<NotificationDetail> getDetail(@Path() String id);  // backend auto-marks read
  
  @GET('/user/notifications/unread-count')
  Future<UnreadCountResponse> getUnreadCount();
}
```

---

## 6. Push notification payload

Backend gửi:
```json
{
  "notification": {
    "title": "新しいお知らせ",
    "body": "[Title của notification]"
  },
  "data": {
    "type": "admin_broadcast",
    "notification_id": "12345"
  }
}
```

Handler:
```dart
void onPushTapped(RemoteMessage msg) {
  if (msg.data['type'] == 'admin_broadcast') {
    final id = msg.data['notification_id'];
    router.push(NotificationDetailRoute(id: id));
  }
  // Các type khác handle riêng (vd ai_preference_survey)
}
```

---

## 7. Offline / Cache

- Hive box `notification_cache` lưu:
  - List 50 notification gần nhất
  - Read status local
- Khi offline → đọc từ cache
- Khi online → sync diff với server (update unread/read state)

---

## 8. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| Existing push handler có `type: 'order_status'`, `'delivery'`, ... | `push_handler.dart` | Add new type `'admin_broadcast'` có thể bị skip nếu handler default | Switch case rõ + default fallback log |
| Existing notification list (nếu có cho order events) | (grep) | Trùng tên `NotificationItem` model | Namespace rõ: `AdminBroadcastNotification` vs `OrderNotification` — hoặc dùng `type` discriminator trong cùng model |
| FCM token registration | (existing) | Re-register có thể duplicate | Backend dedupe theo token unique |

---

## 9. Interface với repo khác

| Repo | Endpoint |
|---|---|
| `es-kitchen-api` | `GET /user/notifications`, `GET /user/notifications/:id`, `GET /user/notifications/unread-count` + FCM push từ backend |
