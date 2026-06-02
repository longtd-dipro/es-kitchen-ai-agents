# DESIGN: AI Recommendation — es-kitchen-payment-app (Mode 4 Preference)

> **SPEC:** `es-kitchen-docs/docs/features/ai-recommendation/SPEC.md`
> **API DESIGN:** `../es-kitchen-api/DESIGN.md` (section 3.2)
> **Date:** 2026-06-02

---

## 1. Phạm vi mobile (E01)

Mobile app chỉ tham gia **Mode 4 — Employee Preference**:
- Nhận push notification "Khảo sát thực đơn tháng mới đã sẵn sàng"
- Mở screen survey
- User chọn món yêu thích (vote) + cho điểm
- Submit về API

Không liên quan mode 1/2/3/5/6 — đó là flow Company Admin trên web E02.

---

## 2. Tổng quan thay đổi

| Layer | File | Action |
|---|---|---|
| Screen | `lib/features/ai_preference/screens/preference_survey_screen.dart` | NEW |
| Screen | `lib/features/ai_preference/screens/preference_intro_screen.dart` | NEW |
| Widget | `lib/features/ai_preference/widgets/product_vote_card.dart` | NEW |
| Provider | `lib/features/ai_preference/providers/preference_provider.dart` | NEW (Riverpod 3 StateNotifierProvider) |
| Model | `lib/features/ai_preference/models/preference_model.dart` | NEW (`freezed`) |
| API | `lib/features/ai_preference/api/preference_api.dart` | NEW (Retrofit + Dio) |
| Routing | `auto_route` config | EDIT — thêm `/preference/survey` |
| Push handler | `lib/core/notification/push_handler.dart` | EDIT — handle type `ai_preference_survey` → navigate |

---

## 3. Screen flow

```
Push noti "新しいメニューのアンケート" 
  ↓ tap
PreferenceIntroScreen — mô tả mục đích, "Bắt đầu khảo sát"
  ↓
PreferenceSurveyScreen — list product cards
  - Mỗi card: ảnh + tên + category + giá + rating star (1-5) hoặc heart vote
  - "Skip" cho từng item
  - Progress bar (đã vote X/Y)
  ↓ Submit (sau khi đủ % vote tối thiểu)
PreferenceCompleteScreen — thank you
```

---

## 4. State / Provider (Riverpod 3)

```dart
@freezed
class PreferenceState with _$PreferenceState {
  const factory PreferenceState({
    required AsyncValue<List<MenuProductForSurvey>> products,
    required Map<String, int> votes,  // productId → score
    @Default(false) bool submitting,
  }) = _PreferenceState;
}

class PreferenceNotifier extends StateNotifier<PreferenceState> {
  PreferenceNotifier(this._api, this._planMonth) : super(initial) {
    _load();
  }
  
  Future<void> _load() async {
    final products = await _api.getSurveyMenu(_planMonth);
    state = state.copyWith(products: AsyncValue.data(products));
  }
  
  void vote(String productId, int score) { ... }
  
  Future<void> submit() async {
    state = state.copyWith(submitting: true);
    await _api.submitPreferences(_planMonth, state.votes);
    // navigate complete
  }
}
```

---

## 5. API Integration

```dart
// preference_api.dart
@RestApi()
abstract class PreferenceApi {
  factory PreferenceApi(Dio dio) = _PreferenceApi;
  
  @GET('/user/ai-preference/menu/{planMonth}')
  Future<MenuSurveyResponse> getSurveyMenu(@Path() String planMonth);
  
  @POST('/user/ai-preference/submit')
  Future<void> submitPreferences(@Body() SubmitPreferencesDto dto);
}
```

---

## 6. UI Specifics

- Dùng `flutter_screenutil` cho sizing
- Product image lazy load với `cached_network_image`
- Voting UI: Star 1-5 (theo OQ-12 chốt) hoặc heart toggle — đề xuất star 1-5 cho granularity
- Min vote threshold: 30% products (UX guard để data có ý nghĩa)
- Offline state: cache câu hỏi trong Hive, submit khi online lại

---

## 7. Push Notification Integration

```dart
// push_handler.dart — extend existing
void handle(RemoteMessage message) {
  final type = message.data['type'];
  if (type == 'ai_preference_survey') {
    final planMonth = message.data['plan_month'];
    router.push(PreferenceIntroRoute(planMonth: planMonth));
  }
}
```

Backend gửi push với payload:
```json
{
  "type": "ai_preference_survey",
  "plan_month": "2026-07-01",
  "title": "新しいメニューのアンケート",
  "body": "あなたの好みを教えてください"
}
```

---

## 8. Interface với repo khác

| Repo | Endpoint |
|---|---|
| `es-kitchen-api` | `GET /user/ai-preference/menu/:planMonth`, `POST /user/ai-preference/submit` |

---

## 9. Non-Regression Risks

| Tính năng hiện có | File | Rủi ro | Mitigation |
|---|---|---|---|
| Push notification existing | `push_handler.dart` | Thêm type mới có thể conflict | Switch case rõ ràng theo `type` field |
| Routing auto_route | `app_router.dart` | Thêm route mới phải regen | Chạy `build_runner` sau khi edit |
| Existing User API | `lib/features/*/api/...` | Add new api class — không ảnh hưởng API cũ | Inject riêng |
