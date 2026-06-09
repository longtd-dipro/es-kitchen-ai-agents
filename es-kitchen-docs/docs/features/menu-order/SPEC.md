# SPEC: Menu & Order — Quản lý Thực đơn & Đặt hàng

> Backlog ID: ESKITCHEN-1239
> Domain slug: `menu-order`
> Phase: 2
> SPEC Transfer: True

---

## Mô tả nghiệp vụ

Quy trình quản lý thực đơn và đặt hàng tháng của hệ thống ESKITCHEN bao gồm ba luồng chính:

1. **System Admin (E03) lên Menu tháng** — tạo/sao chép danh sách sản phẩm, thiết lập thứ tự, đính kèm PDF, quản lý đơn đặt hàng (Deli + Vật tư).
2. **Company Admin (E02) chốt đơn** — xem menu, đặt hàng thủ công (Card/Matrix), tải CSV, hoặc dùng AI tự động đề xuất; hệ thống tự kiểm tra giới hạn hợp đồng và gửi cảnh báo deadline.
3. **User Mobile (E01) mua món ăn** — xem gợi ý cá nhân hóa, chọn mua, thanh toán qua app.

Feature này có **phụ thuộc trực tiếp** vào domain Hợp đồng (contract phải active mới cho phép E02 đặt hàng) và domain Thanh toán (E01 thanh toán sau khi chọn món).

---

## Actors & Preconditions

| Actor | Vai trò | Điều kiện tiên quyết |
|---|---|---|
| **E03** — System Admin | Tạo/quản lý Menu tháng; quản lý Deli Order + Material Order | Đã đăng nhập; có quyền quản lý menu |
| **E02** — Company Admin | Xem menu, đặt hàng, xem lịch sử đơn | Đã đăng nhập; công ty có hợp đồng active; chưa quá deadline chốt đơn tháng |
| **E01** — User Mobile | Xem gợi ý sản phẩm, mua món ăn qua app | Đã đăng nhập app; đã liên kết công ty (QR binding); công ty của user có hợp đồng active |

> **Contract Lock cần thiết** — feature này cross-repo (E03 web-admin + E02 web-company + E01 payment-app + API). PM cần chốt REST API contract trước Phase 3.

---

## Happy Path

### HP-1: E03 Tạo Menu tháng (thủ công)

1. E03 truy cập màn hình Monthly Menu Management.
2. Nhấn "Add Product" — popup hiển thị toàn bộ danh sách từ Master Product (có search).
3. Tab "Popular Products" trong popup gợi ý sản phẩm phổ biến.
4. E03 chọn sản phẩm, xác nhận thêm vào menu tháng.
5. Kéo thả (drag & drop) để sắp xếp thứ tự hiển thị.
6. Tải lên file PDF menu; hệ thống tự nén nếu file lớn.
7. Lưu — menu tháng được publish.

### HP-2: E03 Tạo Menu tháng bằng cách sao chép

1. E03 chọn "Duplicate from past menu".
2. Chọn tháng/năm nguồn.
3. Hệ thống clone menu và **tự động cảnh báo + lọc ra** các sản phẩm đã xuất hiện liên tiếp 2 tháng.
4. E03 xem lại danh sách đề xuất loại bỏ, điều chỉnh, lưu.

### HP-3: E02 Đặt hàng thủ công

1. E02 truy cập màn hình Monthly Prepared Food Order.
2. Chọn tháng (tháng này / tháng sau); chọn tab sản phẩm (Lạnh / Đông lạnh / Thường).
3. Tìm kiếm sản phẩm bằng từ khóa (nếu cần).
4. Xem chi tiết sản phẩm (hình ảnh, mô tả, dị ứng, dinh dưỡng, giá nhân viên).
5. Nhập số lượng trên từng Card sản phẩm (hoặc chuyển sang Matrix list view).
6. Hệ thống **real-time**: cộng dồn tổng số lượng + tổng tiền; cảnh báo nếu vượt ngân sách phúc lợi.
7. Hệ thống hiển thị số lượng còn cần chọn để khớp gói hợp đồng.
8. E02 nhấn "Confirm & Submit" — xác nhận đơn.
9. Sau deadline chốt → giao diện khóa, không cho phép chỉnh sửa.

### HP-4: E02 Đặt hàng bằng CSV

1. E02 tải template CSV từ hệ thống.
2. Điền số lượng theo sản phẩm.
3. Upload CSV — hệ thống parse và hiển thị preview.
4. E02 xác nhận — đơn được tạo.

### HP-5: E02 Đặt hàng bằng AI (Auto-Order)

1. E02 chọn chế độ Auto-Order.
2. Chọn Mode:
   - **Mode 1 — Even Distribution**: hệ thống phân bổ đồng đều số lượng khớp gói hợp đồng (không dựa lịch sử).
   - **Mode 2 — AI History-based**: phân tích tần suất/lịch sử đặt hàng của công ty để đề xuất số lượng.
   - **Mode 4 — Survey-based**: lên đơn dựa trên kết quả khảo sát nguyện vọng nhân viên.
   - **Mode 6 — AI Chat**: E02 nhập yêu cầu dạng chat, Chatbot AI trả về giỏ hàng đề xuất.
3. Hệ thống generate giỏ hàng đề xuất.
4. E02 review, điều chỉnh (nếu cần), xác nhận gửi đơn.

### HP-6: E02 Đặt hàng Vật tư

1. Sau khi đặt Món ăn xong, hệ thống hiển thị **popup nhắc đặt vật tư** (đũa, thìa, khay...).
2. E02 nhập số lượng vật tư cần đặt cho tháng.
3. Xác nhận — đơn vật tư được tạo.
4. E02 xem lịch sử đơn vật tư, theo dõi ngày dự kiến giao (lấy từ API vận chuyển).

### HP-7: E01 Mua món ăn trên Mobile App

1. User mở app — màn hình hiển thị gợi ý sản phẩm cá nhân hóa kèm giá.
2. User chọn món, xem chi tiết.
3. User thêm vào giỏ, tiến hành thanh toán (flow thanh toán thuộc domain Payment).

### HP-8: E03 Quản lý Deli Order

1. E03 truy cập Deli Order Management.
2. Tìm kiếm theo chế độ (KH/Sản phẩm), lọc theo tháng/tên KH/trạng thái/loại tủ.
3. Xem danh sách đơn (Mã đơn, Tên gói, KH, Trạng thái) — sắp xếp theo timeline.
4. Tải CSV danh sách đơn theo bộ lọc.
5. Click vào đơn → xem chi tiết/chỉnh sửa: sửa số lượng, set tối thiểu, clear số lượng.
6. Gửi thông báo thay đổi trạng thái đơn đến KH/NCC/Tài xế theo hạng mục.

### HP-9: E03 Quản lý Vật tư Order (Material Order Management)

1. E03 xem danh sách đơn vật tư.
2. Click chi tiết → xem breakdown hạng mục bên trong đơn.
3. Chỉnh sửa/hủy số lượng; thêm Memo nội bộ.
4. Tạo **Provisional Order**: chọn NCC, nhập số lượng tạm, ngày giao và hạn sử dụng mong muốn.
   - Hệ thống tự tính số lượng tạm dựa trên trung bình lịch sử + tỷ lệ tăng trưởng KH.
5. Tạo **Final Order**: nhập số lượng chốt cuối cùng + yêu cầu giao hàng gửi NCC.
6. Hệ thống tự động cập nhật trạng thái đơn theo phản hồi NCC hoặc thao tác Admin.

### HP-10: E03 Xem lịch sử đặt hàng

1. E03 lọc theo NCC.
2. Xem bảng lịch sử — tổng tiền được tự động tính toán.
3. Click vào lịch sử → breakdown chi tiết từng mặt hàng từ NCC đó.

### HP-11: E02 Xem báo cáo sử dụng

1. E02 xem báo cáo tỷ lệ tiêu thụ, số lượng mua, hàng hủy của nhân viên (tự động trích xuất).
2. Xem Popular Products Ranking (món bán chạy nhất).
3. Admin tổng xem danh sách tình trạng sử dụng theo từng chi nhánh.
4. Tải xuống báo cáo dạng Excel/CSV.

---

## Alternative Flows & Edge Cases

### AF-1: Deadline chốt đơn — Cảnh báo & Khóa

- **7 ngày trước deadline**: hệ thống tự động gửi email + hiển thị cảnh báo trên giao diện E02.
- **3 ngày trước deadline**: gửi cảnh báo lần hai.
- **Sau deadline**: giao diện đặt hàng của E02 chuyển sang chế độ read-only (không cho sửa).
- **TODO (BA):** Deadline chốt đơn được cấu hình ở đâu — trong hợp đồng hay cấu hình toàn hệ thống? E03 có thể gia hạn deadline không?

### AF-2: Vượt ngân sách phúc lợi

- Hệ thống hiển thị **cảnh báo real-time** khi số lượng món vượt giới hạn phúc lợi công ty tài trợ (ví dụ: 82/38 món → cảnh báo).
- E02 vẫn có thể tiếp tục đặt nếu muốn (cảnh báo là informational, không block)?
- **TODO (BA):** Xác nhận — cảnh báo vượt ngân sách có block submit hay chỉ hiển thị warning?

### AF-3: CSV Upload lỗi

- File CSV sai format, sai mã sản phẩm, hoặc số lượng không hợp lệ → hệ thống hiển thị danh sách lỗi theo dòng.
- E02 tải file lỗi đính kèm thông báo để sửa.

### AF-4: Sản phẩm xuất hiện liên tiếp 2 tháng (duplicate menu)

- Khi sao chép menu cũ, hệ thống **tự động đánh dấu** sản phẩm đã có mặt 2 tháng liên tiếp.
- E03 quyết định giữ lại hoặc xóa — không tự động xóa.

### AF-5: AI Chat (Mode 6) — Không hiểu yêu cầu

- Chatbot không phân tích được nội dung chat → trả về thông báo yêu cầu nhập lại / gợi ý format.

### AF-6: Gói hợp đồng thay đổi giữa chu kỳ

- **TODO (BA):** Nếu gói hợp đồng của công ty thay đổi giữa tháng (sau khi đã chốt đơn), hệ thống xử lý như thế nào? Giữ nguyên đơn cũ hay tính lại?

### AF-7: User E01 không thuộc công ty có hợp đồng

- App hiển thị thông báo "Công ty chưa đăng ký dịch vụ" — không cho phép đặt hàng.

### AF-8: Material Order — Không đặt vật tư

- E02 có thể bỏ qua popup nhắc vật tư (popup không block).
- E02 có thể đặt vật tư riêng lẻ sau (không bắt buộc cùng lúc với món ăn).

---

## Acceptance Criteria

### AC-01: Tạo Menu tháng (E03)

- [ ] E03 có thể thêm sản phẩm từ Master Product vào menu tháng thông qua popup có search.
- [ ] Tab "Popular Products" trong popup hiển thị sản phẩm phổ biến.
- [ ] E03 kéo thả để thay đổi thứ tự hiển thị sản phẩm trên menu.
- [ ] E03 tải lên PDF menu; file >X MB được tự động nén trước khi lưu. **TODO (BA):** Ngưỡng dung lượng PDF là bao nhiêu?
- [ ] Menu tháng hiển thị đúng cho E02 sau khi publish.

### AC-02: Sao chép Menu (E03)

- [ ] E03 chọn tháng/năm nguồn và tạo menu mới từ bản copy.
- [ ] Hệ thống tự động phát hiện và đánh dấu sản phẩm xuất hiện liên tiếp ≥ 2 tháng.
- [ ] E03 xem danh sách sản phẩm bị đánh dấu và quyết định giữ/xóa.

### AC-03: Xem Menu (E02)

- [ ] E02 xem danh sách menu tháng này và tháng sau.
- [ ] Phân tab: Lạnh / Đông lạnh / Thường.
- [ ] Tìm kiếm sản phẩm bằng từ khóa.
- [ ] Xem chi tiết sản phẩm: hình ảnh, mô tả, thành phần dị ứng, dinh dưỡng, giá nhân viên.
- [ ] Xem review của nhân viên về sản phẩm.

### AC-04: Đặt hàng thủ công (E02)

- [ ] E02 nhập số lượng trên từng Card sản phẩm.
- [ ] E02 chuyển đổi giữa Card view và Matrix list view.
- [ ] Tổng số lượng và tổng tiền cập nhật real-time khi E02 thay đổi số lượng.
- [ ] Hệ thống hiển thị số lượng món còn cần chọn để đủ gói hợp đồng.
- [ ] Cảnh báo real-time khi số lượng vượt ngân sách phúc lợi.
- [ ] E02 submit đơn trước deadline → đơn được lưu thành công.
- [ ] Sau deadline → giao diện chỉnh sửa bị khóa.

### AC-05: Đặt hàng CSV (E02)

- [ ] E02 tải template CSV hợp lệ.
- [ ] Upload CSV → hệ thống hiển thị preview trước khi xác nhận.
- [ ] CSV có lỗi → hệ thống liệt kê lỗi theo dòng, không tạo đơn.
- [ ] Upload CSV hợp lệ → đơn được tạo sau khi E02 xác nhận.

### AC-06: Đặt hàng AI (E02 — AI PRO)

- [ ] Mode 1: Hệ thống tự phân bổ đồng đều số lượng khớp với gói hợp đồng.
- [ ] Mode 2: Hệ thống đề xuất số lượng dựa trên lịch sử đặt hàng của công ty.
- [ ] Mode 4: Hệ thống tạo đơn dựa trên kết quả khảo sát nhân viên.
- [ ] Mode 6: Chatbot nhận yêu cầu dạng chat và trả về giỏ hàng đề xuất.
- [ ] Sau khi AI generate, E02 có thể chỉnh sửa trước khi submit.
- [ ] **TODO (BA):** Tính năng AI PRO có phân quyền theo gói hợp đồng (chỉ gói cao cấp mới có) hay tất cả E02 đều dùng được?

### AC-07: Đặt hàng Vật tư (E02)

- [ ] Popup nhắc đặt vật tư hiển thị sau khi E02 submit đơn món ăn.
- [ ] E02 có thể bỏ qua popup (không bắt buộc).
- [ ] E02 đặt vật tư riêng lẻ bất kỳ lúc nào (không chỉ sau đặt món).
- [ ] E02 xem lịch sử đơn vật tư với ngày dự kiến giao từ API vận chuyển.

### AC-08: Cảnh báo deadline (Hệ thống → E02)

- [ ] Email cảnh báo tự động gửi tới E02 trước 7 ngày và 3 ngày so với deadline chốt đơn.
- [ ] Cảnh báo hiển thị trên giao diện web E02 trong khoảng thời gian đó.

### AC-09: Quản lý Deli Order (E03)

- [ ] Tìm kiếm theo KH/Sản phẩm, lọc theo tháng/tên KH/trạng thái/loại tủ.
- [ ] Danh sách đơn hiển thị: Mã đơn, Tên gói, KH, Trạng thái — sắp xếp theo timeline.
- [ ] Tải CSV danh sách đơn theo bộ lọc hiện tại.
- [ ] Xem + chỉnh sửa chi tiết đơn: sửa số lượng, set tối thiểu, clear số lượng.
- [ ] Gửi thông báo trạng thái đơn tới KH/NCC/Tài xế theo hạng mục sản phẩm.

### AC-10: Quản lý Material Order (E03)

- [ ] Xem danh sách + chi tiết đơn vật tư, thêm Memo nội bộ.
- [ ] Tạo Provisional Order: chọn NCC, nhập số lượng tạm + ngày giao + hạn sử dụng.
- [ ] Hệ thống tự tính số lượng Provisional dựa trên trung bình lịch sử + tỷ lệ tăng trưởng.
- [ ] Tạo Final Order: nhập số lượng chốt + yêu cầu giao hàng.
- [ ] Trạng thái đơn tự động cập nhật theo phản hồi NCC hoặc thao tác Admin.

### AC-11: Lịch sử đặt hàng (E03 & E02)

- [ ] E02 xem chi tiết lịch sử đơn món ăn các tháng trước.
- [ ] E03 lọc lịch sử theo NCC, xem tổng tiền tự động tính, xem breakdown từng mặt hàng.

### AC-12: Báo cáo sử dụng (E02)

- [ ] Báo cáo tỷ lệ tiêu thụ, số lượng mua, hàng hủy tự động trích xuất.
- [ ] Popular Products Ranking hiển thị.
- [ ] Admin tổng xem danh sách theo chi nhánh.
- [ ] Tải xuống Excel/CSV.

### AC-13: E01 Mobile — Gợi ý & Mua

- [ ] App hiển thị gợi ý sản phẩm cá nhân hóa kèm giá tương ứng.
- [ ] User chọn được món và tiến vào flow thanh toán (thanh toán nằm trong domain Payment, ngoài scope SPEC này).

---

## Out of Scope

- Chi tiết flow thanh toán của E01 (elepay/Alipay/WeChat Pay) → thuộc domain **Payment** (ESKITCHEN-1241).
- Quản lý Master Product (danh mục gốc sản phẩm) — đây là dữ liệu đầu vào, không phải nghiệp vụ của feature này.
- Quản lý khảo sát nhân viên (Mode 4 sử dụng kết quả khảo sát nhưng việc tạo/quản lý khảo sát thuộc domain **User Engagement** - ESKITCHEN-1245).
- Tích hợp Yamato / Sagawa cho tracking giao vật tư (API gọi ra — phụ thuộc domain Delivery).
- Quản lý NCC (Supplier) và xác nhận đơn từ phía NCC → thuộc domain **Đặt hàng NCC** (ESKITCHEN-1240).
- Driver nhận và thực hiện giao hàng → thuộc domain **Giao hàng** (ESKITCHEN-1237/1238).

---

## Dependencies

| Dependency | Domain / Feature | Mô tả |
|---|---|---|
| Hợp đồng active | [HỢP ĐỒNG] ESKITCHEN-1235 | E02 chỉ được đặt hàng khi công ty có hợp đồng active và đúng gói |
| User Binding | [USER BINDING] ESKITCHEN-1244 | E01 phải liên kết công ty trước khi mua món |
| Khảo sát nhân viên | [USER ENGAGEMENT] ESKITCHEN-1245 | AI Mode 4 đọc kết quả khảo sát |
| Payment | [THANH TOÁN] ESKITCHEN-1241 | E01 thanh toán sau khi chọn món |
| Delivery API | Yamato / Sagawa | E02 xem ngày dự kiến giao vật tư |
| Supplier confirmation | [ĐẶT HÀNG NCC] ESKITCHEN-1240 | E03 gửi Final Order → NCC xác nhận |

---

## Screens

| Screen | Actor | App | Mô tả ngắn |
|---|---|---|---|
| Monthly Menu Management | E03 | E03 (es-kitchen-web-admin) | Danh sách menu tháng; thêm/xóa sản phẩm; drag & drop sắp xếp thứ tự; tải lên PDF menu; publish |
| Add Product Popup | E03 | E03 (es-kitchen-web-admin) | Popup chọn sản phẩm từ Master Product (có search + tab Popular Products) để thêm vào menu tháng |
| Duplicate Menu | E03 | E03 (es-kitchen-web-admin) | Chọn tháng/năm nguồn để sao chép; xem danh sách sản phẩm bị đánh dấu xuất hiện ≥ 2 tháng liên tiếp *inferred |
| Deli Order Management | E03 | E03 (es-kitchen-web-admin) | Danh sách Deli Order; tìm kiếm/lọc theo KH/sản phẩm/tháng/trạng thái/loại tủ; tải CSV |
| Deli Order Detail | E03 | E03 (es-kitchen-web-admin) | Chi tiết 1 Deli Order; chỉnh sửa số lượng; set tối thiểu; clear số lượng; gửi thông báo trạng thái tới KH/NCC/Driver |
| Material Order Management | E03 | E03 (es-kitchen-web-admin) | Danh sách đơn vật tư; xem breakdown hạng mục; thêm Memo nội bộ; tạo Provisional Order và Final Order |
| Order History (E03) | E03 | E03 (es-kitchen-web-admin) | Lịch sử đặt hàng lọc theo NCC; tổng tiền tự động tính; xem breakdown từng mặt hàng |
| Monthly Prepared Food Order | E02 | E02 (es-kitchen-web-company) | Đặt hàng món ăn tháng; Card view + Matrix view; real-time tổng số lượng & tổng tiền; cảnh báo ngân sách; submit/lock sau deadline |
| Product Detail (E02) | E02 | E02 (es-kitchen-web-company) | Chi tiết sản phẩm: hình ảnh, mô tả, dị ứng, dinh dưỡng, giá nhân viên, review nhân viên *inferred |
| AI Auto-Order | E02 | E02 (es-kitchen-web-company) | Chọn Mode AI (Mode 1 Even / Mode 2 History / Mode 4 Survey); xem giỏ hàng đề xuất; chỉnh sửa trước khi submit |
| AI Chat Order | E02 | E02 (es-kitchen-web-company) | Chat với Chatbot AI (Mode 6); nhập yêu cầu tự nhiên; nhận giỏ hàng đề xuất |
| CSV Upload Order | E02 | E02 (es-kitchen-web-company) | Tải template CSV; upload file; xem preview; xem danh sách lỗi theo dòng nếu có |
| Material Order Popup | E02 | E02 (es-kitchen-web-company) | Popup nhắc đặt vật tư sau khi submit đơn món ăn; nhập số lượng vật tư; có thể bỏ qua |
| Material Order (E02) | E02 | E02 (es-kitchen-web-company) | Đặt vật tư độc lập; nhập số lượng từng loại vật tư (đũa, thìa, khay...) *inferred |
| Material Order History (E02) | E02 | E02 (es-kitchen-web-company) | Lịch sử đơn vật tư; xem ngày dự kiến giao từ API vận chuyển |
| Order History (E02) | E02 | E02 (es-kitchen-web-company) | Lịch sử đơn món ăn các tháng trước; xem chi tiết từng đơn *inferred |
| Usage Report | E02 | E02 (es-kitchen-web-company) | Báo cáo tỷ lệ tiêu thụ / số lượng mua / hàng hủy; Popular Products Ranking; xem theo chi nhánh; tải Excel/CSV |
| Product Suggestion (Home) | E01 | E01 (es-kitchen-payment-app) | Màn hình chính app; danh sách gợi ý sản phẩm cá nhân hóa kèm giá |
| Product Detail (E01) | E01 | E01 (es-kitchen-payment-app) | Chi tiết sản phẩm trên mobile; xem hình ảnh, mô tả, giá; thêm vào giỏ |

---

## Bước tiếp theo

SPEC hoàn thành. Chạy song song hai bước sau:

"Hãy là Tech Lead Design, làm DESIGN.md từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/menu-order/SPEC.md`"

"Hãy là QC, sinh test cases từ SPEC này: `/Users/longtd/Desktop/WORK/AI_AGENTS_ES_KITCHEN/es-kitchen-docs/docs/features/menu-order/SPEC.md`"
(hoặc slash command: `/test/generate_manual_testcases_rbt` cho FULL RBT / `/test/generate_testcases_from_requirements` cho QUICK)

→ "Hãy là Designer, tạo UI-SPEC.md + Figma từ SPEC này: es-kitchen-docs/docs/features/menu-order/SPEC.md"
  (hoặc slash command: /create-ui-design es-kitchen-docs/docs/features/menu-order/SPEC.md)
