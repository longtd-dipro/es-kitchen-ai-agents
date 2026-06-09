# SPEC: User Engagement — Tương tác & Khảo sát

> Backlog ID: ESKITCHEN-1245
> Domain: BF_[USER ENGAGEMENT] Tương tác & Khảo sát
> Phase: Phase 2

---

## Mô tả nghiệp vụ

Domain User Engagement bao gồm các tính năng giúp người dùng cuối (E01) tương tác sâu hơn với hệ thống sau khi mua hàng: đánh giá sản phẩm, đăng ký thông tin dị ứng, tham gia khảo sát do vận hành tạo, gửi feedback, và nhận gợi ý món ăn cá nhân hóa. Phía System Admin (E03) tạo và quản lý các chiến dịch khảo sát, xem kết quả tổng hợp tự động. Company Admin (E02) đánh giá tài xế sau giao hàng.

---

## Actors & Preconditions

| Actor | Repo liên quan | Điều kiện tiên quyết |
|---|---|---|
| E01 — End User (Mobile App) | `es-kitchen-payment-app` | Đã đăng nhập · Đã liên kết công ty (User Binding) |
| E02 — Company Admin (Web) | `es-kitchen-web-company` | Đã đăng nhập · Đơn hàng đã hoàn tất giao hàng |
| E03 — System Admin (Web) | `es-kitchen-web-admin` | Đã đăng nhập với quyền vận hành |
| BE | `es-kitchen-api` | — |

> Cross-repo (4 repos) — PM cần Contract Lock trước Phase 3.

---

## Stories

### ST-01: Hướng dẫn sử dụng (Onboarding Tutorial)

**Actor:** E01
**Mô tả:** Hiển thị tutorial dạng slide trong lần đầu đăng nhập sau khi ứng dụng khởi chạy. Dạng slide vuốt ngang, dự kiến 3–5 slide, hướng dẫn thao tác cơ bản theo thứ tự.

**Happy Path:**
1. User đăng nhập lần đầu tiên.
2. Hệ thống phát hiện flag "chưa xem tutorial" trong profile.
3. Màn hình tutorial tự động hiển thị dạng slide ngang.
4. User vuốt qua từng slide (3–5 slide).
5. User nhấn "Hoàn thành" hoặc vuốt hết slide cuối.
6. Hệ thống ghi nhận flag "đã xem tutorial" — không hiển thị lại.

**Acceptance Criteria:**
- Tutorial chỉ hiển thị đúng 1 lần duy nhất sau lần đăng nhập đầu tiên.
- Có thể skip tutorial bất kỳ lúc nào (nút Skip).
- Sau khi skip hoặc hoàn thành, không hiển thị lại trong các lần đăng nhập tiếp theo.
- Nội dung slide do vận hành cấu hình (không hard-code).

**TODO (BA):** Nội dung 3–5 slide do ai cấu hình — System Admin hay hard-code trong app? Có cần xem lại tutorial thủ công từ Settings không?

---

### ST-02: Lọc theo chất gây dị ứng (Allergen Filter)

**Actor:** E01
**Mô tả:** User đăng ký trước danh sách chất gây dị ứng cá nhân. Hệ thống dùng thông tin này để ẩn, hiển thị cảnh báo, hoặc làm nổi bật các món ăn chứa chất gây dị ứng khi hiển thị menu.

**Danh sách chất gây dị ứng tối thiểu:** Trứng, Sữa, Đậu phộng, Lúa mì, Tôm, Cua (và các chất khác theo quy định Nhật Bản).

**Happy Path:**
1. User vào Settings → Thiết lập dị ứng.
2. User chọn một hoặc nhiều chất gây dị ứng từ danh sách.
3. Hệ thống lưu thiết lập vào profile.
4. Khi xem menu, các món chứa chất đã chọn được: (a) ẩn, hoặc (b) hiển thị cảnh báo, hoặc (c) làm nổi bật — tùy cấu hình.
5. User có thể thay đổi thiết lập bất kỳ lúc nào.

**Acceptance Criteria:**
- User có thể chọn nhiều chất gây dị ứng cùng lúc.
- Thiết lập được lưu vào tài khoản (không phải local device).
- Menu phản ánh ngay lập tức khi thiết lập thay đổi.
- Có thể xóa toàn bộ thiết lập dị ứng (reset).

**TODO (BA):** Hành vi mặc định khi món chứa chất gây dị ứng là ẩn hay cảnh báo hay highlight — cần xác nhận với client.

---

### ST-03: Thay đổi thiết lập dị ứng và thực phẩm không thích hợp

**Actor:** E01
**Mô tả:** Tính năng cho phép user chỉnh sửa lại danh sách dị ứng đã đăng ký từ ST-02, đồng thời đăng ký thêm thực phẩm không thích hợp (không dị ứng nhưng không muốn ăn). Hiển thị cảnh báo tương ứng trên menu.

**Acceptance Criteria:**
- User có thể thêm/xóa chất gây dị ứng đã thiết lập.
- User có thể đăng ký danh sách thực phẩm không thích hợp riêng biệt với danh sách dị ứng.
- Cả hai danh sách đều tác động lên hiển thị menu.

> Dependency: ST-02 (Allergen Filter) phải hoàn thành trước.

---

### ST-04: Đánh giá sản phẩm (Product Rating)

**Actor:** E01
**Mô tả:** Sau khi hoàn tất mua hàng, user có thể đánh giá sao (1–5) và bình luận (tối đa 100 ký tự) cho sản phẩm đã mua. User có thể xem đánh giá của người khác trên trang chi tiết sản phẩm. System Admin nhận cảnh báo tự động khi sản phẩm có nhiều đánh giá thấp.

**Happy Path:**
1. Đơn hàng chuyển sang trạng thái hoàn tất.
2. App gửi push notification mời user đánh giá (hoặc hiển thị prompt khi mở app).
3. User chọn số sao (1–5) cho từng sản phẩm trong đơn.
4. User nhập bình luận (tuỳ chọn, tối đa 100 ký tự).
5. User submit → hệ thống lưu đánh giá.
6. Đánh giá hiển thị trên trang chi tiết sản phẩm.

**Alternative Flow:**
- User bỏ qua không đánh giá → không ép buộc.
- User đã đánh giá rồi → không cho đánh giá lại (hoặc cho sửa trong N ngày).

**Acceptance Criteria:**
- Chỉ được đánh giá sản phẩm đã mua và đơn đã hoàn tất.
- Mỗi user chỉ được đánh giá 1 lần / 1 sản phẩm / 1 đơn hàng.
- Bình luận tối đa 100 ký tự.
- Rating trung bình hiển thị trên trang sản phẩm.
- System Admin nhận cảnh báo tự động khi điểm trung bình sản phẩm dưới ngưỡng quy định.

**TODO (BA):** Ngưỡng điểm kích hoạt cảnh báo là bao nhiêu? Cảnh báo gửi qua email hay notification nội bộ?

---

### ST-05: Gợi ý dựa trên lịch sử mua hàng (Personalized Recommendation)

**Actor:** E01
**Mô tả:** Hiển thị bảng xếp hạng sản phẩm phổ biến và gợi ý cá nhân hóa dựa trên lịch sử mua hàng của user.

**Happy Path:**
1. User mở trang chủ hoặc trang menu.
2. Hệ thống hiển thị section "Gợi ý cho bạn" dựa trên lịch sử mua.
3. Hệ thống hiển thị section "Phổ biến" dựa trên tổng số order toàn hệ thống.
4. User nhấn vào sản phẩm gợi ý → chuyển đến trang chi tiết sản phẩm.

**Acceptance Criteria:**
- Hiển thị tối thiểu 5 sản phẩm gợi ý cá nhân.
- Gợi ý phản ánh lịch sử mua trong 30 ngày gần nhất (hoặc theo cấu hình).
- Nếu user chưa có lịch sử → fallback về danh sách phổ biến.
- Bảng xếp hạng phổ biến refresh theo chu kỳ (ngày/tuần).

**TODO (BA):** Logic gợi ý dùng rule-based hay ML? Nếu rule-based, tiêu chí xếp hạng "tương tự" là gì (category, supplier, giá...)?

---

### ST-06: Khảo sát dành cho người vận hành (Operator Survey)

**Actor:** E01 (trả lời) · E03 (tạo và quản lý)
**Mô tả:** E03 tạo đợt khảo sát với thời hạn phản hồi, chọn doanh nghiệp nhận. User (E01) trả lời trong thời hạn. Sau khi hết hạn, khảo sát tự động đóng và kết quả hiển thị trên màn hình quản trị.

**Happy Path (E03 — Tạo khảo sát):**
1. System Admin vào màn hình Questionnaire → Tạo mới.
2. Chọn loại khảo sát mặc định (template).
3. Thiết lập thời gian bắt đầu và thời hạn phản hồi.
4. Chọn một hoặc nhiều doanh nghiệp nhận.
5. Publish → hệ thống gửi notification đến user của các doanh nghiệp đã chọn.

**Happy Path (E01 — Trả lời khảo sát):**
1. User nhận notification về khảo sát mới.
2. User mở app → vào màn hình Khảo sát.
3. User đọc câu hỏi và điền câu trả lời.
4. User submit trước thời hạn.
5. Hệ thống ghi nhận phản hồi.

**Alternative Flow:**
- User không trả lời trước deadline → khảo sát tự động đóng, không nhận phản hồi thêm.
- User thử trả lời sau deadline → hiển thị thông báo "Khảo sát đã kết thúc".

**Acceptance Criteria:**
- E03 có thể tạo khảo sát và chọn nhiều doanh nghiệp cùng lúc.
- E03 xem lịch sử các chiến dịch khảo sát đã tạo.
- Khảo sát tự động đóng khi hết deadline.
- E01 không thể submit sau deadline.
- E01 chỉ trả lời một lần / một khảo sát.
- Kết quả được tổng hợp và hiển thị biểu đồ tự động trên admin.

---

### ST-07: Khảo sát dành cho doanh nghiệp — Sản phẩm mong muốn (Wish Survey)

**Actor:** E01
**Mô tả:** Hiển thị danh sách thực đơn tháng sau. User chọn sản phẩm yêu thích và đăng ký thành sản phẩm mong muốn (wish list). Đây là loại khảo sát đặc biệt về nhu cầu thực đơn.

**Happy Path:**
1. Hệ thống công bố danh sách thực đơn dự kiến tháng sau.
2. User vào màn hình "Sản phẩm mong muốn".
3. User xem danh sách và chọn các sản phẩm yêu thích.
4. User submit danh sách mong muốn.
5. Hệ thống ghi nhận và tổng hợp dữ liệu phía admin.

**Acceptance Criteria:**
- User thấy danh sách thực đơn tháng sau (chỉ khi đã được công bố).
- User có thể chọn nhiều sản phẩm.
- User có thể thay đổi lựa chọn trước deadline.
- Kết quả tổng hợp phải xem được ở admin (E03).

**TODO (BA):** Wish Survey là loại survey riêng hay là 1 template trong ST-06? Ai (E03 hay E02) xem kết quả tổng hợp?

---

### ST-08: Gửi ý kiến và yêu cầu đóng góp (Feedback Form)

**Actor:** E01
**Mô tả:** User gửi feedback (ý kiến, yêu cầu, khiếu nại, đề xuất cải tiến) đến quản trị viên qua biểu mẫu trong app. Admin có thể phản hồi qua email.

**Happy Path:**
1. User vào Settings → Gửi ý kiến.
2. User chọn loại feedback (ý kiến / yêu cầu / khiếu nại / đề xuất).
3. User điền nội dung (text field, giới hạn ký tự cần xác nhận).
4. User submit.
5. Hệ thống ghi nhận và gửi email thông báo đến admin.
6. Admin phản hồi qua email đến user.

**Acceptance Criteria:**
- Form có trường loại feedback (dropdown hoặc radio).
- Form có trường nội dung tự do.
- Sau khi submit, user nhận xác nhận đã gửi thành công.
- Admin (E03) nhận được feedback qua dashboard hoặc email.
- Admin có thể phản hồi qua email đến user.

**TODO (BA):** Feedback gửi đến E03 hay E02 hay cả hai? Có lưu lịch sử feedback trong app không?

---

### ST-09: Đánh giá tài xế (Driver Rating)

**Actor:** E02 — Company Admin
**Mô tả:** Company Admin đánh giá sao và bình luận cho tài xế sau khi giao hàng hoàn tất.

**Happy Path:**
1. Đơn giao hàng chuyển sang trạng thái hoàn tất.
2. Company Admin vào danh sách đơn hàng → chọn đơn vừa giao xong.
3. Nhấn "Đánh giá tài xế" → form hiện ra (sao 1–5 + bình luận).
4. Submit → lưu đánh giá liên kết với tài xế và đơn hàng.

**Acceptance Criteria:**
- Chỉ đánh giá được sau khi đơn hàng ở trạng thái hoàn tất.
- Mỗi đơn hàng chỉ được đánh giá tài xế 1 lần.
- Đánh giá lưu vào hồ sơ tài xế, xem được từ E03.

**TODO (BA):** E03 có màn hình xem lịch sử đánh giá tài xế không? Tài xế (E06) có thể xem điểm đánh giá của mình không?

---

### ST-10: Quản lý chiến dịch khảo sát — Tạo và phân phối (E03)

**Actor:** E03 — System Admin
**Mô tả:** System Admin tạo đợt khảo sát mới: chọn loại khảo sát mặc định, cấu hình thời gian gửi, chọn nhiều doanh nghiệp nhận cùng lúc.

> Đây là phần actor E03 của ST-06 được tách riêng để rõ phạm vi admin.

**Acceptance Criteria:**
- E03 tạo khảo sát với template mặc định.
- Chọn nhiều doanh nghiệp nhận trong 1 lần tạo.
- Cấu hình thời gian phát và thời hạn phản hồi.
- Lưu nháp trước khi publish.
- Xem lại lịch sử chiến dịch đã tạo (Survey Distribution History).

---

### ST-11: Xem lịch sử phân phối khảo sát (E03)

**Actor:** E03 — System Admin
**Mô tả:** Hiển thị danh sách các chiến dịch khảo sát đã được khởi tạo và gửi đi, kèm trạng thái (đang chạy / đã kết thúc) và số lượng phản hồi.

**Acceptance Criteria:**
- Danh sách có filter theo trạng thái và khoảng thời gian.
- Mỗi dòng hiển thị: tên chiến dịch, thời gian, số doanh nghiệp nhận, số phản hồi, trạng thái.
- Nhấn vào chiến dịch → xem chi tiết kết quả (ST-12).

---

### ST-12: Tổng hợp và trực quan hóa kết quả khảo sát (E03)

**Actor:** E03 — System Admin
**Mô tả:** Hệ thống tự động tổng hợp dữ liệu phản hồi và vẽ biểu đồ trực quan hóa kết quả khảo sát theo từng chiến dịch.

**Acceptance Criteria:**
- Kết quả tổng hợp tự động sau mỗi phản hồi mới (hoặc batch sau deadline).
- Hiển thị biểu đồ phù hợp với loại câu hỏi (pie chart, bar chart, ...).
- Có thể export kết quả (CSV hoặc PDF).
- Dữ liệu cá nhân được ẩn danh khi hiển thị tổng hợp (nếu yêu cầu).

**TODO (BA):** Phản hồi có ẩn danh hay hiển thị tên user? Có export PDF không hay chỉ CSV?

---

## Alternative Flows & Edge Cases

| Case | Xử lý |
|---|---|
| User đánh giá sản phẩm sau khi đơn bị cancel | Không cho phép — chỉ đánh giá khi đơn hoàn tất |
| User gửi feedback trùng lặp nhiều lần | Cho phép — mỗi lần là 1 ticket riêng |
| Khảo sát hết deadline khi user đang điền | Hiển thị thông báo "Đã hết hạn", không submit được |
| User chưa mua hàng cố xem đánh giá sản phẩm | Cho xem (read-only), không cho đánh giá |
| User không có lịch sử mua, xem gợi ý | Fallback về danh sách phổ biến toàn hệ thống |
| Tutorial đã xem nhưng user muốn xem lại | **TODO (BA):** Có cần nút "Xem lại hướng dẫn" trong Settings không? |
| Dị ứng đã thiết lập nhưng supplier không cung cấp thông tin thành phần | Không hiển thị cảnh báo — hiển thị "Thông tin thành phần chưa đầy đủ" |

---

## Acceptance Criteria (tổng thể)

1. Tất cả tính năng E01 chỉ khả dụng khi user đã đăng nhập và đã liên kết công ty.
2. Push notification (Firebase) được gửi cho: lời mời đánh giá sau đơn hoàn tất, thông báo có khảo sát mới.
3. Dữ liệu đánh giá và phản hồi khảo sát được lưu server-side (không phụ thuộc device).
4. Tất cả form có validation phía client trước khi submit.
5. E03 có thể xem kết quả đánh giá sản phẩm (aggregated rating) trên admin dashboard.

---

## Out of Scope

- Hệ thống Điểm (Point) và Tem thưởng (Stamp) — đề cập trong business flow index nhưng **không có story cụ thể** trong domain file. Cần tạo SPEC riêng.
- Trực quan hóa dữ liệu sức khỏe (Health Data Visualization) — đề cập trong domain nhưng chỉ liên kết với ST-02/ST-03, không có story độc lập. Cần làm rõ scope với client.
- Recommendation engine ML-based — nếu dùng rule-based thì trong scope; nếu cần ML model thì Out of Scope Phase 2.
- Tài xế (E06) xem điểm đánh giá cá nhân — chưa có story, cần xác nhận.
- Moderating / ẩn bình luận không phù hợp — chưa có yêu cầu.

---

## Dependencies

| Dependency | Lý do |
|---|---|
| Domain User Binding (ESKITCHEN-1244) | User phải liên kết công ty trước khi dùng tính năng engagement |
| Domain Menu & Order (ESKITCHEN-1239) | Đánh giá sản phẩm cần đơn hàng hoàn tất |
| Firebase Push Notification | Gửi lời mời đánh giá và thông báo khảo sát (E01) |
| Domain Giao hàng (ESKITCHEN-1236) | Đánh giá tài xế (E02) cần trạng thái giao hàng hoàn tất |
| Domain Marketing (ESKITCHEN-1246) | Có thể tích hợp điểm thưởng khi đánh giá — cần confirm |

---

## Screens

| Screen Code | Screen | Actor | App | Screen Type | Mô tả ngắn |
|---|---|---|---|---|---|
| UA_ENGM_001 | Onboarding Tutorial Slide | E01 | E01 (es-kitchen-payment-app) | Wizard | Màn hình slide ngang xuất hiện khi đăng nhập lần đầu, hướng dẫn sử dụng app |
| UA_ENGM_002 | Allergen Settings | E01 | E01 (es-kitchen-payment-app) | Form | Danh sách chất gây dị ứng để user chọn và lưu vào profile |
| UA_ENGM_003 | Unsuitable Food Settings | E01 | E01 (es-kitchen-payment-app) | Form | Chỉnh sửa danh sách dị ứng và đăng ký thực phẩm không thích hợp (kết hợp ST-02 + ST-03) |
| UA_ENGM_004 | Product Rating Form | E01 | E01 (es-kitchen-payment-app) | Form | Form đánh giá sao (1–5) và bình luận cho từng sản phẩm sau khi đơn hoàn tất |
| UA_ENGM_005 | Product Detail — Ratings Tab | E01 | E01 (es-kitchen-payment-app) | Detail | Trang chi tiết sản phẩm hiển thị điểm trung bình và danh sách bình luận từ người dùng khác |
| UA_ENGM_006 | Home / Menu — Recommendation Section | E01 | E01 (es-kitchen-payment-app) | Card-list | Trang chủ / menu hiển thị section "Gợi ý cho bạn" và "Phổ biến" dựa trên lịch sử mua |
| UA_ENGM_007 | Survey List (E01) | E01 | E01 (es-kitchen-payment-app) | List | Danh sách khảo sát đang mở dành cho user, có thể mở để trả lời |
| UA_ENGM_008 | Survey Answer Form | E01 | E01 (es-kitchen-payment-app) | Form | Form trả lời khảo sát từng câu hỏi, có deadline countdown |
| UA_ENGM_009 | Wish Survey — Desired Products | E01 | E01 (es-kitchen-payment-app) | Card-list | Danh sách thực đơn tháng sau để user chọn sản phẩm mong muốn |
| UA_ENGM_010 | Feedback Form | E01 | E01 (es-kitchen-payment-app) | Form | Form gửi ý kiến / yêu cầu / khiếu nại / đề xuất đến admin |
| CW_ENGM_001 | Order List — Driver Rating Action | E02 | E02 (es-kitchen-web-company) | List | Danh sách đơn hàng hoàn tất, có nút "Đánh giá tài xế" trên từng đơn |
| CW_ENGM_002 | Driver Rating Form | E02 | E02 (es-kitchen-web-company) | Modal | Form đánh giá sao (1–5) và bình luận cho tài xế sau giao hàng hoàn tất |
| AW_ENGM_001 | Survey Creation | E03 | E03 (es-kitchen-web-admin) | Form | Form tạo khảo sát mới: chọn template, cấu hình thời gian, chọn doanh nghiệp nhận |
| AW_ENGM_002 | Survey Distribution History | E03 | E03 (es-kitchen-web-admin) | List | Danh sách chiến dịch khảo sát đã tạo, filter theo trạng thái/thời gian |
| AW_ENGM_003 | Survey Results — Visualization | E03 | E03 (es-kitchen-web-admin) | Report | Biểu đồ tổng hợp kết quả khảo sát theo từng chiến dịch (pie chart, bar chart, export) |
| AW_ENGM_004 | Product Rating Dashboard (E03) *inferred | E03 | E03 (es-kitchen-web-admin) | Dashboard | Tổng hợp điểm đánh giá sản phẩm, cảnh báo khi điểm trung bình dưới ngưỡng |
| AW_ENGM_005 | Feedback Inbox (E03) *inferred | E03 | E03 (es-kitchen-web-admin) | List | Danh sách feedback nhận từ E01, có thể phản hồi qua email |

---

## Bước tiếp theo

Chạy song song sau khi SPEC được sign-off:

- "Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/user-engagement/SPEC.md`"
- "Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/user-engagement/SPEC.md`" (hoặc slash command `/test/generate_manual_testcases_rbt` cho FULL RBT)
→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/user-engagement/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/user-engagement/SPEC.md)
