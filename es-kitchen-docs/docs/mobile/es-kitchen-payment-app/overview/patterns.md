# es-kitchen-payment-app — Patterns & Conventions

> Đọc file này trước khi viết code Flutter mới cho E01. Follow pattern đang có — không tự refactor.
> Source xác nhận từ codebase thực tế (branch develop, 2026-07).

---

## 1. Provider / State Pattern (Riverpod)

### 1.1 NotifierProvider — pattern chính

Codebase dùng `Notifier<State>` + `NotifierProvider` (Riverpod 3.x). **Không dùng `StateNotifier` / `StateNotifierProvider`** (legacy).

```dart
// features/menu/provider/menu_provider.dart
final menuProvider = NotifierProvider<MenuController, MenuState>(
  MenuController.new,
);

// Trang cần auto-dispose khi rời khỏi → dùng .autoDispose
final searchProvider = NotifierProvider.autoDispose<SearchController, SearchState>(
  SearchController.new,
);
```

### 1.2 Controller — Notifier<State>

```dart
// features/menu/controller/menu_controller.dart
class MenuController extends Notifier<MenuState> {
  @override
  MenuState build() {
    // Khởi tạo state ban đầu
    return const MenuState(isLoading: true, categories: [], products: [], isLoadingCategories: true);
  }

  Future<void> fetchCategories() async {
    try {
      final res = await ref
          .read(repositoryProvider)     // ref.read() trong action — không watch
          .api
          .getCategories(sortBy: AppConstants.sortBySort);
      state = state.copyWith(
        categories: res.data,
        categorySelected: res.data.isNotEmpty ? res.data.first : null,
        isLoadingCategories: false,
      );
      fetchProducts();
    } catch (e) {
      state = state.copyWith(isLoading: false, categories: [], products: []);
    }
  }
}
```

### 1.3 State — @immutable + manual copyWith

State class **không dùng @freezed**. Dùng `@immutable` + viết `copyWith()` thủ công:

```dart
// features/menu/state/menu_state.dart
@immutable
class MenuState {
  const MenuState({
    required this.isLoading,
    required this.categories,
    this.categorySelected,
    required this.products,
    required this.isLoadingCategories,
  });

  final bool isLoading;
  final bool isLoadingCategories;
  final List<CategoryModel> categories;
  final CategoryModel? categorySelected;
  final List<ProductModel> products;

  // Getter thuần tuý — không side-effect
  bool get isIdle => !isLoading;

  MenuState copyWith({
    bool? isLoading,
    List<CategoryModel>? categories,
    CategoryModel? categorySelected,
    List<ProductModel>? products,
    bool? isLoadingCategories,
  }) {
    return MenuState(
      isLoading: isLoading ?? this.isLoading,
      categories: categories ?? this.categories,
      categorySelected: categorySelected ?? this.categorySelected,
      products: products ?? this.products,
      isLoadingCategories: isLoadingCategories ?? this.isLoadingCategories,
    );
  }
}
```

### 1.4 UI Widget — ConsumerStatefulWidget / ConsumerWidget

```dart
// features/menu/menu_page.dart
class MenuPage extends ConsumerStatefulWidget {
  const MenuPage({super.key});

  @override
  ConsumerState<MenuPage> createState() => _MenuPageState();
}

class _MenuPageState extends ConsumerState<MenuPage> {
  @override
  void initState() {
    super.initState();
    // gọi action sau khi frame đầu render xong
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      ref.read(menuProvider.notifier).fetchCategories();
      ref.read(cartProvider.notifier).getCart();
    });
  }

  @override
  Widget build(BuildContext context) {
    // ref.read() cho notifier (action call)
    final menuController = ref.read(menuProvider.notifier);

    // ref.watch().select() để chỉ rebuild khi field cụ thể thay đổi
    final totalQuantityInCart = ref.watch(
      cartProvider.select((v) => v.totalQuantity),
    );

    // ...
  }
}
```

### 1.5 ref.listen + .select() — side effect (dialog, navigation)

Dùng `ref.listen` trong `build()` để trigger side effect mà không rebuild widget:

```dart
// features/app_shell/app_shell_page.dart
@override
Widget build(BuildContext context) {
  ref.listen<bool>(
    appShellProvider.select((state) => state.shouldShowModal),
    (prev, next) {
      if (next) {
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const ModalUpdateAppWidget(),
        );
      }
    },
  );

  ref.listen<bool>(
    cartProvider.select((v) => v.isPaymentSuccess),
    (prev, next) {
      if (next) context.router.push(const SuccessRoute(message: ''));
    },
  );

  return const AutoRouter();
}
```

**Quy tắc:**
- `NotifierProvider` là pattern chính — không dùng `StateNotifierProvider` (legacy)
- `NotifierProvider.autoDispose` cho màn hình cần giải phóng state khi pop
- `ref.read()` trong action/callback; `ref.watch()` trong `build()`
- `ref.watch(provider.select(...))` để tránh rebuild thừa khi chỉ cần 1 field
- `ref.listen()` trong `build()` cho side effect — không trong `initState`
- Không dùng `Provider` (non-Riverpod), BLoC, GetX

---

## 2. API Client Pattern (Retrofit + Dio)

### 2.1 Provider chain

```
dioProvider (Dio)
  → appApiProvider (AppApi)
    → repositoryProvider (ApiRepository)
      → Controller
```

```dart
// data/api/provider/api_provider.dart
final appApiProvider = Provider<AppApi>((ref) {
  final dio = ref.watch(dioProvider);
  return AppApi(dio);             // Retrofit-generated implementation
});

// data/repositories/provider/repository_provider.dart
final repositoryProvider = Provider<ApiRepository>((ref) {
  return ApiRepository(ref.watch(appApiProvider));
});
```

### 2.2 AppApi — @RestApi()

Toàn bộ API call khai báo trong 1 abstract class duy nhất:

```dart
// data/api/app_api.dart
@RestApi()
abstract class AppApi {
  factory AppApi(Dio dio, {String? baseUrl}) = _AppApi;

  // @Extra để điều khiển interceptor behavior
  @GET(AppEndpoints.categories)
  Future<ApiResponse<List<CategoryModel>>> getCategories({
    @Query('sortBy') String sortBy = AppConstants.sortByDisplayOrder,
  });

  @POST(AppEndpoints.checkout)
  @Extra({'showLoading': true})                    // bật loading overlay
  Future<ApiResponse<CheckOutResponse>> checkout(
    @Body() CheckOutRequest request,
  );

  @GET(AppEndpoints.elepayKey)
  @Extra({'skipShowError': true})                  // tắt error toast tự động
  Future<ApiResponse<String>> getElepayKey();

  @GET(AppEndpoints.orderDetail)
  Future<ApiResponse<OrderDetailResponseModel>> getOrderDetail(
    @Path("orderId") String orderId,
  );

  @GET(AppEndpoints.orders)
  Future<ApiResponse<PaginatedResponse<List<OrderModel>>>> getOrders(
    @Queries() ParamsRequest param,               // query params từ model
  );
}
```

### 2.3 ApiRepository — wrapper cho controller

Controller không gọi `AppApi` trực tiếp, luôn qua `ApiRepository`:

```dart
// data/repositories/repository.dart
class ApiRepository {
  final AppApi api;
  ApiRepository(this.api);

  Future<ApiResponse<List<CategoryModel>>> getCategories({
    String sortBy = AppConstants.sortByDisplayOrder,
  }) => api.getCategories(sortBy: sortBy);

  Future<ApiResponse<CartResponseModel>> addToCart(
    String productId,
    int quantity,
  ) => api.addToCart(AddToCartRequest(productId: productId, quantity: quantity));
}

// Trong controller
await ref.read(repositoryProvider).getCategories();
```

### 2.4 Dio Interceptors

**AppInterceptor** (auth + loading + 401):

```dart
// app/core/network/interceptors/app_interceptor.dart
class AppInterceptor extends Interceptor {
  final Ref ref;
  AppInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = ref.read(appPrefsProvider).token;
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';  // inject token
    }
    if (options.extra['showLoading'] == true) {
      ref.read(globalLoadingProvider.notifier).state = true;
    }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (err.requestOptions.extra['showLoading'] == true) {
      ref.read(globalLoadingProvider.notifier).state = false;
    }
    if (err.response?.statusCode == 401) {
      ref.read(appPrefsProvider).clear();
      ref.read(appRouterProvider).replaceAll([const LoginRoute()]);  // redirect login
      return handler.next(err);
    }
    if (err.requestOptions.extra['skipShowError'] != true) {
      ToastHelper.showError(ref, getApiErrorMessage(err));
    }
    super.onError(err, handler);
  }
}
```

**NetworkInterceptor** (offline check):

```dart
class NetworkInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final status = ref.read(networkProvider);
    if (status == NetworkStatus.offline) {
      return handler.reject(
        DioException(
          requestOptions: options,
          type: DioExceptionType.connectionError,
          error: 'インターネットに接続できません。通信環境をご確認ください。',
        ),
        true,
      );
    }
    handler.next(options);
  }
}
```

**Quy tắc:**
- Controller chỉ gọi `ref.read(repositoryProvider).methodName()` — không gọi `AppApi` trực tiếp
- Tất cả endpoint khai báo trong `app_api.dart` — không tạo thêm `@RestApi` class
- URL constant trong `app_endpoints.dart` — không hard-code string trong `app_api.dart`
- `@Extra({'showLoading': true})` cho action quan trọng; `@Extra({'skipShowError': true})` cho call background
- `app_api.g.dart` là generated — không sửa tay; sau khi thêm method chạy `build_runner`

---

## 3. Routing Pattern (auto_route)

### 3.1 Khai báo route

```dart
// app/routers/app_router.dart
@AutoRouterConfig(replaceInRouteName: 'Page,Route')  // MenuPage → MenuRoute
class AppRouter extends RootStackRouter {
  @override
  RouteType get defaultRouteType => RouteType.cupertino();

  @override
  List<AutoRoute> get routes => [
    // Custom transition
    CustomRoute(
      page: LoginRoute.page,
      transitionsBuilder: TransitionsBuilders.slideBottom,
      duration: const Duration(milliseconds: 300),
    ),
    // Nested shell (authenticated area)
    AutoRoute(
      page: AppShellRoute.page,
      children: [
        CustomRoute(
          page: BottomBarRoute.page,
          initial: true,
          transitionsBuilder: TransitionsBuilders.slideLeftWithFade,
          duration: const Duration(milliseconds: 300),
        ),
        AutoRoute(page: CartRoute.page),
        AutoRoute(page: ProductDetailsRoute.page),
        AutoRoute(page: PurchaseDetailRoute.page),
        // ... các route con khác
      ],
    ),
    RedirectRoute(path: '*', redirectTo: '/'),
  ];
}
```

### 3.2 Page annotation

Mỗi page widget phải có `@RoutePage()`:

```dart
// features/cart/ui/cart_page.dart
@RoutePage()
class CartPage extends ConsumerStatefulWidget { ... }

// features/product_details/product_details_page.dart
@RoutePage()
class ProductDetailsPage extends ConsumerWidget { ... }
```

### 3.3 Navigation trong UI

```dart
// push — thêm route vào stack
context.router.push(const EditInformationRoute());

// push với params
context.router.push(ProductDetailsRoute(id: product.id));

// push và nhận kết quả trả về
final res = await context.router.push(ScanCodeRoute(type: EScanType.qrcode));
if (res != null) { ... }

// replace — thay thế route hiện tại
context.router.replace(LoginRoute());

// replaceAll — reset stack (sau login/logout)
ref.read(appRouterProvider).replaceAll([const LoginRoute()]);
```

**Quy tắc:**
- Luôn dùng `context.router.push(...)` — không `Navigator.push`
- `app_router.gr.dart` là generated — không sửa tay; chỉ thêm route trong `app_router.dart`
- Convention: file `xxx_page.dart` → annotation `@RoutePage()` → generated `XxxRoute`
- `CustomRoute` khi cần transition tùy chỉnh; `AutoRoute` cho transition mặc định

---

## 4. Model Pattern (json_annotation)

> **Lưu ý quan trọng:** Codebase thực tế dùng `@JsonSerializable()` từ `json_annotation` — **KHÔNG dùng `@freezed`**. Structure.md đề cập freezed là ví dụ chưa được cập nhật.

### 4.1 Model cơ bản

```dart
// data/models/categories/category_model.dart
import 'package:json_annotation/json_annotation.dart';
part 'category_model.g.dart';

@JsonSerializable()
class CategoryModel {
  @JsonKey(name: 'id')
  final String id;
  @JsonKey(name: 'name')
  final String name;
  @JsonKey(name: 'sort', defaultValue: 0)      // defaultValue cho trường có thể null
  final int sort;
  @JsonKey(name: 'isAll', defaultValue: true)
  final bool isAll;

  CategoryModel({
    required this.id,
    required this.name,
    required this.sort,
    required this.isAll,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) =>
      _$CategoryModelFromJson(json);

  Map<String, dynamic> toJson() => _$CategoryModelToJson(this);

  CategoryModel copyWith({ String? id, String? name, int? sort, bool? isAll }) {
    return CategoryModel(
      id: id ?? this.id,
      name: name ?? this.name,
      sort: sort ?? this.sort,
      isAll: isAll ?? this.isAll,
    );
  }
}
```

### 4.2 Custom fromJson helper

Khi field có kiểu dữ liệu phức tạp từ API:

```dart
// data/models/product/product_detail_model.dart
@JsonKey(name: 'price', fromJson: _parsePrice)   // custom parser
final int? price;

@JsonKey(name: 'images', fromJson: _parseImages)
final List<String>? images;

// Helper function ở file-level (không phải method)
int? _parsePrice(dynamic value) {
  if (value == null) return null;
  if (value is int) return value;
  if (value is double) return value.toInt();
  if (value is String) return int.tryParse(value);
  return null;
}

List<String>? _parseImages(dynamic value) {
  if (value == null || value is! List) return null;
  return value.map((e) {
    if (e is String) return e;
    if (e is Map) return (e['url'] ?? '').toString();
    return '';
  }).toList();
}
```

### 4.3 Generic response wrappers

```dart
// data/models/ext/api_response.dart
@JsonSerializable(genericArgumentFactories: true)
class ApiResponse<T> {
  final T data;
  final String statusCode;
  final String message;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) => _$ApiResponseFromJson(json, fromJsonT);
}

// Dùng trong AppApi:
Future<ApiResponse<List<CategoryModel>>> getCategories(...);
Future<ApiResponse<PaginatedResponse<List<OrderModel>>>> getOrders(...);
```

**Quy tắc:**
- Dùng `@JsonSerializable()` + `json_annotation` — không `@freezed`
- `@JsonKey(name: ...)` cho mọi field (ngay cả khi tên trùng) để tường minh
- `@JsonKey(defaultValue: ...)` thay vì null check ở controller
- Custom `fromJson` helper ở file-level khi API trả về kiểu không chuẩn
- `.g.dart` là generated — không sửa tay; chạy `build_runner` sau mỗi thay đổi model
- Mọi model phải có `fromJson` factory + `copyWith()` thủ công

---

## 5. Socket.IO Pattern

### 5.1 SocketService — Singleton

```dart
// app/core/services/socket/socket_service.dart
class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;     // singleton
  SocketService._internal();

  io.Socket? _socket;

  void connect() {
    final url = dotenv.env['SOCKET_URL'] ?? '';   // URL từ .env — không hard-code
    if (url.isEmpty || _socket?.connected == true) return;  // guard duplicate connection

    _socket = io.io(
      url,
      io.OptionBuilder()
          .setTransports(SocketConfig.transports)
          .disableAutoConnect()              // kết nối thủ công
          .build(),
    );
    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
```

### 5.2 Async wait với Completer + timeout

Pattern dùng cho payment callback (chờ kết quả charge từ server qua socket):

```dart
Future<Map<String, dynamic>?> waitForChargeResult(
  String chargeId, {
  Duration timeout = SocketConfig.chargeResultTimeout,
}) {
  final completer = Completer<Map<String, dynamic>?>();

  void resolve(Map<String, dynamic> data) {
    if (!completer.isCompleted && data['id'] == chargeId) {
      completer.complete(data);
    }
  }

  _socket?.on(SocketConfig.chargeSucceeded, (data) {
    resolve(Map<String, dynamic>.from(data as Map));
  });

  _socket?.on(SocketConfig.chargeFailed, (data) {
    resolve(Map<String, dynamic>.from(data as Map));
  });

  // Timeout — tự complete với null nếu quá thời gian
  Future.delayed(timeout, () {
    if (!completer.isCompleted) completer.complete(null);
  });

  return completer.future;
}
```

**Quy tắc:**
- `SocketService` là singleton Dart — không expose qua Riverpod provider riêng
- `SOCKET_URL` phải lấy từ `dotenv.env` — không hard-code
- Guard `_socket?.connected == true` trước khi gọi `connect()` — tránh duplicate
- Dùng `Completer` cho async wait event; luôn có timeout để không block vô hạn
- `socket.off(event)` bắt buộc khi ngừng lắng nghe để tránh memory leak

---

## 6. Elepay Payment Pattern

### 6.1 Init SDK (lazy, một lần duy nhất)

```dart
// app/core/services/elepay/elepay_service.dart
class ElepayService {
  final Ref _ref;
  bool _initialized = false;

  ElepayService(this._ref);

  Future<void> initElepay() async {
    if (_initialized) return;              // idempotent
    try {
      final res = await _ref.read(repositoryProvider).getElepayKey();
      await ElepayFlutter.initElepay(
        ElepayConfiguration(
          res.data,                        // key từ API — không hard-code
          languageKey: ElepayLanguageKey.japanese,
          googlePayEnvironment: GooglePayEnvironment.production,
        ),
      );
      _initialized = true;
    } catch (_) {}
  }
}

// Provider
final elepayServiceProvider = Provider<ElepayService>((ref) => ElepayService(ref));

// Gọi khi shell khởi động
ref.read(elepayServiceProvider).initElepay();
```

### 6.2 Checkout flow

```dart
// features/cart/controller/cart_controller.dart — checkout credit card
Future<void> checkoutCreditCard() async {
  try {
    state = state.copyWith(isPaymentProcessing: true);

    // 1. Gọi BE để tạo charge → nhận metadata
    final res = await ref.read(repositoryProvider).checkout(
      CheckOutRequest(
        paymentMethodId: PaymentMethod.creditCard.toStringValue,
        companyCode: state.companyID,
        cardId: state.isGuestMode ? '' : state.selectCard?.id ?? '',
        resource: Platform.isIOS ? 'ios' : 'android',
      ),
    );

    // 2. Chuyển metadata cho Elepay SDK xử lý UI payment
    final sdkResult = await ElepayFlutter.handleCharge(
      jsonEncode(res.data.payment?.metadata),
    );

    // 3. Xử lý kết quả
    if (sdkResult is ElepayResultFailed) {
      state = state.copyWith(
        isPaymentSuccess: false,
        isPaymentFailed: true,
        errorMsg: Platform.isAndroid ? sdkResult.message : sdkResult.reason,
      );
    }
    if (sdkResult is ElepayResultSucceeded) {
      state = state.copyWith(isPaymentSuccess: true, items: []);
    }
    if (sdkResult is ElepayResultCancelled) {
      state = state.copyWith(isPaymentFailed: true);
    }
  } catch (e) {
    state = state.copyWith(isPaymentFailed: true);
  } finally {
    state = state.copyWith(isPaymentProcessing: false);
  }
}

// Đăng ký credit card mới
final sdkResult = await ElepayFlutter.handleSource(jsonEncode(res.data));
```

**Quy tắc:**
- Key elepay lấy từ API (`/user/elepay-key`) — không hard-code trong app
- `ElepayFlutter.handleCharge(payload)` cho thanh toán; `ElepayFlutter.handleSource(payload)` cho đăng ký card
- Luôn xử lý 3 kết quả: `ElepayResultSucceeded`, `ElepayResultFailed`, `ElepayResultCancelled`
- `isPaymentProcessing` state bắt buộc để block double-tap; set `false` trong `finally`
- iOS và Android có thể trả về message khác nhau — dùng `sdkResult.reason` trên iOS, `sdkResult.message` trên Android

---

## 7. Sizing Convention (flutter_screenutil)

### 7.1 Responsive sizing

```dart
// Luôn dùng .w / .h / .r — không hard-code số pixel
Container(
  width: 135.w,             // responsive width
  height: 32.h,             // responsive height
)

BorderRadius.circular(8.r)  // responsive border radius

EdgeInsets.symmetric(horizontal: 16.w)
EdgeInsets.only(top: 12.h, bottom: 16.h)
```

### 7.2 Spacing via extension (awesome_extensions)

```dart
// awesome_extensions_flutter shorthand
8.h.heightBox                       // SizedBox(height: 8.h)
6.w.widthBox                        // SizedBox(width: 6.w)
widget.paddingLTRB(16.w, 8.h, 16.w, 0)
widget.paddingOnly(top: 12.h)
widget.paddingHorizontal(8.w)
```

### 7.3 Dynamic sizing theo platform

```dart
// Chiều cao safe area khác nhau iOS / Android
MediaQuery.of(context).padding.bottom == 0
    ? 20.h
    : Platform.isAndroid
    ? MediaQuery.of(context).padding.bottom + 16.h
    : MediaQuery.of(context).padding.bottom
```

**Quy tắc:**
- `.w` cho width và horizontal spacing
- `.h` cho height và vertical spacing
- `.r` cho border radius
- Không hard-code số pixel bất kỳ — mọi sizing qua `flutter_screenutil`
- `MediaQuery.of(context).padding.bottom` cho safe area (không dùng hằng số cố định)

---

## 8. Color & Typography Tokens

### 8.1 ResColors — singleton

```dart
// Dùng trong widget
Container(color: ResColors().yellow)
Text('...', style: TextStyle(color: ResColors().textHigh))
Border.all(color: ResColors().neutral_200)

// Các token thông dụng E01:
// ResColors().primary       → #CA9A04 (yellow-600, app primary dark)
// ResColors().yellow_400    → #FAC215 (app primary accent)
// ResColors().textHigh      → #24292F (text.high)
// ResColors().textLow       → #6E7781 (text.low)
// ResColors().negative_500  → #CF222E (error)
// ResColors().neutral_200   → #D0D7DE (border default)
```

### 8.2 ResTextStyles — singleton

Convention đặt tên: `s{size}w{weight}` — size tính bằng logical pixel, weight là font weight:

```dart
// Dùng trực tiếp
Text('見出し', style: ResTextStyles().s18w700)

// Override 1 thuộc tính
Text('body', style: ResTextStyles().s14w400.copyWith(
  color: ResColors().textLow,
))

// Các style thông dụng:
// s12w400 → caption / helper (12px / w400)
// s14w400 → body secondary  (14px / w400)
// s14w500 → body medium      (14px / w500)
// s16w500 → body default     (16px / w500)
// s18w700 → heading          (18px / w700)
// s24w700 → title            (24px / w700)
// Font family NotoSansJP — không đổi
```

**Quy tắc:**
- Không hard-code hex color — dùng `ResColors().tokenName`
- Không hard-code `TextStyle(fontSize: ..., fontWeight: ...)` trực tiếp — dùng `ResTextStyles().sXXwYYY`
- `.copyWith()` để override màu/decoration mà giữ nguyên font family và size
- `ResDMTextStyles` là font DM Sans — dùng riêng cho số/code; mặc định luôn là `ResTextStyles` (Noto Sans JP)
