# es-kitchen-payment-app — Patterns & Conventions

> **Nguồn:** es-kitchen-payment-app@71d89b8 (develop, commit cuối 2026-10-13) — đồng bộ ngày 2026-10-16. Code mẫu lấy từ codebase thực tế.

**File này nói gì:** các cách làm chuẩn trong app Flutter E01 (state, gọi API, điều hướng, model, thanh toán, realtime, sizing, màu/font), mỗi cách kèm ví dụ thật và bẫy hay gặp.
**Đọc khi:** trước khi viết code Flutter mới cho E01. Follow pattern đang có — không tự refactor.
Muốn biết file nằm ở đâu, app gồm phần nào → `structure.md`.

---

## 0. Tra nhanh: tình huống → cách xử lý → file mẫu

| Tình huống | Cách xử lý | File mẫu |
|---|---|---|
| Thêm màn hình mới | Tạo `xxx_page.dart` + `@RoutePage()`, khai báo trong `app_router.dart`, chạy `build_runner` | `features/cart/ui/cart_page.dart`, `app/routers/app_router.dart` |
| Quản lý state của màn | `Notifier<State>` + `NotifierProvider` + State `@immutable` có `copyWith` | `features/menu/{controller,state,provider}/` |
| Gọi API mới | Thêm method vào `AppApi` + hằng số vào `app_endpoints.dart` + wrapper trong `ApiRepository`, chạy `build_runner` | `data/api/app_api.dart`, `data/repositories/repository.dart` |
| Tạo model từ JSON | `@JsonSerializable()` + `@JsonKey(name:)` + `copyWith` tay | `data/models/categories/category_model.dart` |
| Hiện loading / tắt toast lỗi / bỏ token | `@Extra({'showLoading': true})` / `{'skipShowError': true}` / `{'skipAuth': true}` | `data/api/app_api.dart` |
| Chuyển màn | `context.router.push(...)` | §3.3 |
| Hiện dialog / chuyển màn khi state đổi | `ref.listen(provider.select(...))` trong `build()` | `features/app_shell/app_shell_page.dart` |
| Thanh toán | `ElepayFlutter.handleCharge` / `handleSource`, xử lý đủ 3 kết quả | `features/cart/controller/cart_controller.dart` |
| Biết kết quả thanh toán | `OrderStatusRetryMixin` (không phải socket) | `app/base/order_status_retry_mixin.dart` |
| Realtime | `SocketService` (hiện chưa dùng) | `app/core/services/socket/socket_service.dart` |
| Kích thước UI | `.w` / `.h` / `.r` | §7 |
| Màu, font | `ResColors()` / `ResTextStyles()` | §8 |

---

## 1. Provider / State (Riverpod)

**Khái niệm:**
- **Provider** = chỗ giữ một giá trị dùng chung (state, service, API client).
- **Notifier** = class giữ state + các hàm làm state đổi. Trong app gọi là "Controller" (vd `MenuController`).
- **`ref`** = tay cầm để đọc/theo dõi provider khác.

### 1.1 NotifierProvider — pattern chính

**Vấn đề:** cần 1 nơi giữ state màn hình và logic đổi state, tách khỏi UI.
**Cách làm:** `Notifier<State>` + `NotifierProvider` (Riverpod 3.x). **Không dùng `StateNotifier` / `StateNotifierProvider`** (legacy).

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

**Bẫy:** quên `.autoDispose` cho màn tạm → state cũ còn sót khi vào lại màn.

### 1.2 Controller — `Notifier<State>`

**Cách làm:** `build()` trả state ban đầu; các hàm async gọi repository rồi gán `state = state.copyWith(...)`.

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

**Bẫy:** dùng `ref.watch` trong hàm action → rebuild/leak không mong muốn. Trong action luôn `ref.read`.

### 1.3 State — `@immutable` + `copyWith` viết tay

**Vấn đề:** state phải bất biến để UI biết khi nào đổi.
**Cách làm:** **không dùng `@freezed`**. Dùng `@immutable` và viết `copyWith()` thủ công.

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

**Bẫy:** `copyWith` kiểu `x ?? this.x` không thể set field về `null`. Cần reset về null thì phải xử lý riêng (chưa có mẫu thống nhất trong tài liệu cũ — kiểm tra state cụ thể).

### 1.4 UI — `ConsumerStatefulWidget` / `ConsumerWidget`

**Cách làm:** `ref.read(...notifier)` để gọi action; `ref.watch(provider.select(...))` để chỉ rebuild khi 1 field đổi. Gọi action đầu tiên trong `addPostFrameCallback`.

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

**Bẫy:** gọi `ref.read(...)` thẳng trong `initState` mà không `addPostFrameCallback` + `mounted` → có thể đổi state khi widget đang build/đã dispose.

### 1.5 Side effect (dialog, chuyển màn) — `ref.listen` + `.select()`

**Vấn đề:** state đổi thì cần mở dialog/chuyển màn, nhưng không muốn rebuild widget.
**Cách làm:** `ref.listen` trong `build()`.

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

### Tóm quy tắc §1
- `NotifierProvider` là pattern chính; `NotifierProvider.autoDispose` cho màn cần giải phóng state khi pop.
- `ref.read()` trong action/callback; `ref.watch()` trong `build()`.
- `ref.watch(provider.select(...))` khi chỉ cần 1 field.
- `ref.listen()` trong `build()` cho side effect — không đặt trong `initState`.
- Không dùng `Provider` kiểu ngoài Riverpod, BLoC, GetX.

---

## 2. API Client (Retrofit + Dio)

### 2.1 Chuỗi provider

**Vấn đề:** controller cần gọi API nhưng không nên biết chi tiết HTTP.
**Cách làm:** 4 lớp nối nhau bằng provider.

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

### 2.2 `AppApi` — `@RestApi()`

**Cách làm:** toàn bộ endpoint khai báo trong **1 abstract class duy nhất**. `@Extra` điều khiển hành vi interceptor.

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

### 2.3 `ApiRepository` — lớp bọc cho controller

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

### 2.4 Dio interceptors

Interceptor = bộ chặn chạy trước mỗi request / sau mỗi response / khi lỗi.

**`AppInterceptor`** — gắn token, bật/tắt loading, xử lý 401. (Rút gọn: bản thật còn log `kDebugMode`, bỏ qua `CancelToken.isCancel`, và `onResponse` tắt loading.)

```dart
// app/core/network/interceptors/app_interceptor.dart
class AppInterceptor extends Interceptor {
  final Ref ref;
  AppInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = ref.read(appPrefsProvider).token;
    final skipAuth = options.extra['skipAuth'] == true;   // @Extra({'skipAuth': true}) cho endpoint public
    if (token != null && !skipAuth) {
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
    if (err.response?.statusCode == 401 && !skipAuth) {
      ref.read(appPrefsProvider).clear();
      ToastHelper.showError(ref, err.response?.data['message'] ?? '');
      ref.read(fcmServiceProvider).cancelAllNotifications();
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

**`NetworkInterceptor`** — chặn request khi offline, không cần chạm server:

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

### Bảng `@Extra`

| Extra | Tác dụng | Dùng khi |
|---|---|---|
| `showLoading: true` | Bật loading overlay toàn app | Action quan trọng (vd `checkout`) |
| `skipAuth: true` | Không gắn token | Endpoint public (login, đăng ký) |
| `skipShowError: true` | Không hiện toast lỗi tự động | Call chạy nền, tự xử lý lỗi (vd `getElepayKey`) |

### Thêm 1 API mới — các bước
1. Thêm hằng số URL vào `app_endpoints.dart`.
2. Thêm method vào `AppApi` (kèm `@Extra` nếu cần).
3. Thêm wrapper vào `ApiRepository`.
4. Chạy `build_runner` để sinh lại `app_api.g.dart`.
5. Controller gọi `ref.read(repositoryProvider).xxx()`.

**Bẫy:**
- Gọi `AppApi` trực tiếp trong controller → phá quy ước.
- Tạo thêm class `@RestApi` mới → không được, chỉ dùng `AppApi`.
- Hard-code URL string trong `app_api.dart` → phải qua `app_endpoints.dart`.
- Sửa tay `app_api.g.dart` → sẽ bị ghi đè.
- Quên `skipAuth` cho endpoint public → request vẫn gắn token cũ; quên xử lý 401 → xem interceptor tự đẩy về `LoginRoute`.

---

## 3. Routing (auto_route)

**Khái niệm:** auto_route sinh class `XxxRoute` từ page có `@RoutePage()`. Điều hướng dùng class đó, có kiểu và tham số rõ ràng.

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

### 3.2 Thêm màn mới

1. Tạo page, gắn `@RoutePage()`:

```dart
// features/cart/ui/cart_page.dart
@RoutePage()
class CartPage extends ConsumerStatefulWidget { ... }

// features/product_details/product_details_page.dart
@RoutePage()
class ProductDetailsPage extends ConsumerWidget { ... }
```

2. Thêm `AutoRoute(page: XxxRoute.page)` vào `app_router.dart` (trong `children` của `AppShellRoute` nếu là màn sau đăng nhập).
3. Chạy `build_runner`.

Convention: file `xxx_page.dart` → class `XxxPage` → route sinh ra `XxxRoute`.

### 3.2b Điều hướng từ push notification

`push_notification/controller/` đọc `data['route']` rồi chọn route:

| `route` | Route mở |
|---|---|
| `notification` | `NotificationDetailRoute` |
| `purchase-history-detail` | `PurchaseDetailRoute` |
| `survey-detail` | `NotificationDetailRoute` (dòng `SurveyRoute` đang comment) |
| `wishlist-detail` | `VoteProductRoute(wishListId)` |

Trước khi push, đóng dialog/modal đang mở.

### 3.3 Điều hướng trong UI

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

**Bẫy:**
- Dùng `Navigator.push` → sai, luôn dùng `context.router`.
- Sửa tay `app_router.gr.dart` → bị ghi đè; chỉ sửa `app_router.dart`.
- Thêm page mới mà quên khai báo trong `app_router.dart` → không có route để push.
- Ngoài widget (không có `context`) → dùng `ref.read(appRouterProvider)` như interceptor làm.
- `CustomRoute` khi cần transition riêng; `AutoRoute` cho transition mặc định (Cupertino).

---

## 4. Model (json_annotation)

> **Quan trọng:** codebase thực tế dùng `@JsonSerializable()` từ `json_annotation` (66 file) — **KHÔNG dùng `@freezed`** (0 file; `freezed` chỉ còn trong pubspec). `structure.md` đã sửa đồng bộ (2026-10-16).

### 4.1 Model cơ bản

**Vấn đề:** cần đổi JSON từ API thành object Dart có kiểu.
**Cách làm:** `@JsonSerializable()` + `part 'xxx.g.dart'`; `fromJson`/`toJson` trỏ vào code sinh ra; `copyWith` viết tay.

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

### 4.2 Custom `fromJson` cho field kiểu lạ

Khi API có thể trả `int`, `double` hoặc `String` cho cùng 1 field:

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

### 4.3 Wrapper response dùng chung

Mọi API trả về bọc trong `ApiResponse<T>` (có `data`, `statusCode`, `message`); danh sách phân trang bọc thêm `PaginatedResponse`.

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

**Quy tắc & bẫy:**
- Dùng `@JsonSerializable()` + `json_annotation` — không `@freezed`.
- `@JsonKey(name: ...)` cho mọi field (kể cả khi tên trùng) để tường minh.
- `@JsonKey(defaultValue: ...)` thay cho null check ở controller.
- Custom `fromJson` ở mức file khi API trả kiểu không chuẩn (tránh crash `type 'String' is not a subtype of 'int'`).
- `.g.dart` là generated — không sửa tay; chạy `build_runner` sau mỗi thay đổi model (quên → lỗi `_$XxxFromJson` không tìm thấy).
- Mọi model có `fromJson` factory + `copyWith()` viết tay.

---

## 5. Socket.IO

> ⚠️ **Trạng thái 2026-10-16 (xác minh lại ở 71d89b8):** `SocketService` chưa được import/gọi ở đâu trong `lib/` — phần dưới là code còn lại, **không phải luồng đang chạy**. Luồng đang chạy để lấy kết quả thanh toán: xem §6.3 (`OrderStatusRetryMixin`). Muốn dùng lại socket → xác nhận với BE/Tech Lead trước.

**Vấn đề (khi còn dùng):** sau khi trả tiền, server báo kết quả charge qua socket; app cần chờ kết quả đó nhưng không chờ vô hạn.

### 5.1 `SocketService` — singleton

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

### 5.2 Chờ kết quả bằng `Completer` + timeout

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

**Quy tắc & bẫy:**
- `SocketService` là singleton Dart — không expose qua provider Riverpod riêng.
- `SOCKET_URL` lấy từ `dotenv.env` — không hard-code.
- Guard `_socket?.connected == true` trước `connect()` — tránh kết nối trùng.
- `Completer` luôn đi kèm timeout để không block vô hạn.
- `socket.off(event)` bắt buộc khi ngừng lắng nghe, nếu không rò rỉ bộ nhớ.

---

## 6. Thanh toán Elepay

**Khái niệm:** elepay là cổng thanh toán (Alipay, WeChat Pay, thẻ). App không tự xử lý thẻ: BE tạo "charge" và trả `metadata`, app đưa metadata cho SDK elepay hiện UI thanh toán.

### 6.1 Khởi tạo SDK (lazy, một lần)

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

### 6.2 Luồng checkout

1. Gọi BE `checkout` → nhận `payment.metadata`.
2. Đưa metadata cho `ElepayFlutter.handleCharge` → SDK hiện UI thanh toán.
3. Xử lý 1 trong 3 kết quả: thành công / thất bại / huỷ.

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

**Quy tắc & bẫy:**
- Key elepay lấy từ API (`/user/elepay-key`) — không hard-code.
- `handleCharge(payload)` cho thanh toán; `handleSource(payload)` cho đăng ký card.
- Luôn xử lý đủ 3 kết quả: `ElepayResultSucceeded`, `ElepayResultFailed`, `ElepayResultCancelled`.
- `isPaymentProcessing` bắt buộc để chặn bấm đúp; luôn set `false` trong `finally`.
- iOS và Android trả message khác nhau: iOS dùng `sdkResult.reason`, Android dùng `sdkResult.message`.
- `initElepay` nuốt lỗi (`catch (_) {}`): nếu lấy key thất bại, SDK chưa init mà không báo gì — kiểm tra khi thanh toán không lên UI.

### 6.3 Xác nhận kết quả đơn sau thanh toán — `OrderStatusRetryMixin`

**Vấn đề:** thanh toán xong (thường qua app/trình duyệt khác), app quay lại nhưng chưa chắc biết đơn đã trả hay chưa.
**Cách làm:** khi app `resumed`, gọi lại trạng thái đơn tối đa 3 lần, cách 2 giây.

```dart
// app/base/order_status_retry_mixin.dart — mixin cho ConsumerState + WidgetsBindingObserver
static const int maxRetries = 3;
static const Duration retryInterval = Duration(seconds: 2);
// didChangeAppLifecycleState(resumed) → _startRetry() → ref.read(cartProvider.notifier).getOrderStatus(orderId)
```

- Page cung cấp `retryOrderId`; gọi `initRetryObserver()` / `disposeRetryObserver()`.
- `PaymentMixin` (`app/base/payment_mixin.dart`) lắng nghe `cartProvider.select(isPaymentSuccess / isPaymentFailed / isCardCreated / errorMsg)` → chuyển `SuccessRoute` / `PaymentPendingRoute` / hiện toast.

**Bẫy:** quên `disposeRetryObserver()` khi dispose page → observer còn sống, gọi API thừa.

---

## 7. Sizing (flutter_screenutil)

**Vấn đề:** màn hình điện thoại nhiều kích cỡ; số pixel cố định sẽ lệch.
**Cách làm:** mọi kích thước đi qua `flutter_screenutil`.

### 7.1 Responsive sizing

```dart
Container(
  width: 135.w,             // responsive width
  height: 32.h,             // responsive height
)

BorderRadius.circular(8.r)  // responsive border radius

EdgeInsets.symmetric(horizontal: 16.w)
EdgeInsets.only(top: 12.h, bottom: 16.h)
```

### 7.2 Khoảng cách bằng extension (awesome_extensions)

```dart
// awesome_extensions_flutter shorthand
8.h.heightBox                       // SizedBox(height: 8.h)
6.w.widthBox                        // SizedBox(width: 6.w)
widget.paddingLTRB(16.w, 8.h, 16.w, 0)
widget.paddingOnly(top: 12.h)
widget.paddingHorizontal(8.w)
```

> Ghi chú: `awesome_extensions` không nằm trong bảng package của `structure.md` — (chưa xác minh) tên package/version trong pubspec; đối chiếu `pubspec.yaml` trước khi dựa vào.

### 7.3 Theo platform

```dart
// Chiều cao safe area khác nhau iOS / Android
MediaQuery.of(context).padding.bottom == 0
    ? 20.h
    : Platform.isAndroid
    ? MediaQuery.of(context).padding.bottom + 16.h
    : MediaQuery.of(context).padding.bottom
```

**Quy tắc:**
- `.w` cho width và khoảng cách ngang; `.h` cho height và khoảng cách dọc; `.r` cho bo góc.
- Không hard-code số pixel — mọi sizing qua `flutter_screenutil`.
- Safe area dùng `MediaQuery.of(context).padding.bottom`, không dùng hằng số cố định.

---

## 8. Màu & chữ (design token)

**Vấn đề:** màu/font rải rác trong code sẽ lệch design system.
**Cách làm:** lấy từ 2 singleton `ResColors` và `ResTextStyles`.

### 8.1 `ResColors`

```dart
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

### 8.2 `ResTextStyles`

Đặt tên: `s{size}w{weight}` (size = logical pixel, weight = font weight).

```dart
Text('見出し', style: ResTextStyles().s18w700)

// Override 1 thuộc tính
Text('body', style: ResTextStyles().s14w400.copyWith(
  color: ResColors().textLow,
))
```

| Style | Dùng cho |
|---|---|
| `s12w400` | caption / helper |
| `s14w400` | body secondary |
| `s14w500` | body medium |
| `s16w500` | body default |
| `s18w700` | heading |
| `s24w700` | title |

Font family NotoSansJP — không đổi.

**Quy tắc & bẫy:**
- Không hard-code hex — dùng `ResColors().tokenName`.
- Không viết `TextStyle(fontSize: ..., fontWeight: ...)` trực tiếp — dùng `ResTextStyles().sXXwYYY`.
- `.copyWith()` để đổi màu/decoration mà giữ font family và size.
- `ResDMTextStyles` là font DM Sans — chỉ dùng cho số/code; mặc định luôn `ResTextStyles` (Noto Sans JP).
