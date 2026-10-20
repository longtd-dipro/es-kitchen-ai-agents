> Bản dịch tiếng Việt của `ja/01_仕様/運営Web_権限表_20261003.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Bảng phân quyền Web vận hành (2026-10-03 · chính thức)

**Chính thức (quyết định mới nhất)**: bảng phân quyền vận hành do người dùng quyết định ngày 2026-10-03 (7 vai trò × chức năng). Code ở `07_開発/lib/domain/seed/account.ts` (OPS_TABLE) và `lib/ops/permissions.ts`.
- Phiên bản trước (bản khớp với "Bảng màn hình × vai trò (đề xuất)" ở §4-3 Thiết kế cơ bản · commit f16cad1) được **thay thế bằng bảng này**.
- Vai trò do Quản trị hệ thống (người có thể sửa 「権限付与」(Cấp quyền)) tạo và chỉnh sửa ở màn hình 「アカウント管理 ＞ 権限」(Quản lý tài khoản > Quyền). Bảng là giá trị ban đầu.
- Ký hiệu: CRUD = xem · tạo · sửa · xóa · nhập CSV · xuất CSV · thao tác theo từng chức năng (phê duyệt · công khai · chốt · phát hành · đặt hàng chính thức · nhập kho) / R/U = xem · sửa · xuất CSV · thao tác theo từng chức năng (không tạo · xóa · nhập CSV) / R = xem · xuất CSV / × = không có. Người có từ 2 vai trò trở lên thì lấy vai trò cao hơn.
- Vai trò không có trong bảng: giữ lại 「閲覧のみ」(Chỉ xem) (R cho mọi chức năng trừ Cấp quyền · liên kết Hubspot/API), 「倉庫スタッフ」(Nhân viên kho) (Dashboard R · Quản lý nhập kho R/U) (người dùng quyết định 2026-10-03).
- **2026-10-05 (vận hành A · sổ quyết định F)**: doanh nghiệp · cơ sở · hợp đồng con **không đặt nút đăng ký mới · xóa**. Tạo (C) = nhập thay ở Quản lý đơn đăng ký hợp đồng, xóa (D) = không có. Vai trò CRUD có thể "nhập CSV chỉ để sửa · cập nhật, nhập thay".
- **2026-10-05 (hong trả lời · sổ quyết định E)**: **Toàn quyền và Quản trị hệ thống (vai trò có thể sửa 「権限付与」) là CRUD ở tất cả chức năng** (ở bảng dưới, dù ghi R vẫn có thể tạo · sửa · xóa · nhập CSV. Đã sửa Toàn quyền của Quản lý gói · Quản lý master vật tư · Khảo sát · Quản lý doanh thu thành CRUD). **R/U** = xem · sửa · xuất CSV · thao tác theo từng chức năng (phê duyệt · công khai · chốt, v.v.). **Không** tạo · xóa · nhập CSV. **R** = chỉ xem · xuất CSV.
- **2026-10-07 (hong trả lời · sổ quyết định I)**: riêng 「**請求照合**」(đối chiếu hóa đơn) của Quản lý đặt hàng thì **Kế toán cũng được thay đổi** (Kế toán trong bảng vẫn là R. Không làm được các thao tác đặt hàng khác).
- **2026-10-06 (hong trả lời · sổ quyết định F)**: các chức năng của 「権限付与」 (Danh sách tài khoản · Quyền · Quản lý bảo trì · Phiên bản & cập nhật bắt buộc · Quản lý IP whitelist) là **Toàn quyền = CRUD · 6 vai trò còn lại = R** (sửa × ở dòng 「権限付与」 trong bảng thành R). 「Hubspot/API連携」(liên kết Hubspot/API) (email nhận thông báo liên hệ) vẫn như trước, chỉ Toàn quyền.
- **2026-10-14 (hong chỉ thị · sổ quyết định F "Cấu trúc quyền vận hành D" ④ · sổ tiếp nhận #299 ⑤ · #499)**: **R/U (Logistics) của Quản lý xuất hàng · giao hàng cũng làm được hủy · sao chép · gửi lại · phê duyệt · từ chối · nhập kết quả xuất hàng / vận đơn (nhập CSV)** (chỉ không được tạo · xóa. Riêng chức năng này phạm vi R/U rộng hơn). **Cài đặt chu kỳ giao hàng chỉ Toàn quyền CRUD và Logistics R/U mới mở được** (trong 7 vai trò còn lại, 5 vai trò là ×. 「閲覧のみ」 và 「監査」(Kiểm toán) xem được toàn bộ màn hình nên chỉ được xem).
- **2026-10-13 (hong trả lời · sổ quyết định V)**: tách Quản lý đơn đăng ký hợp đồng khỏi 「プラン契約管理」(Quản lý hợp đồng gói). **Nhập thay (tạo · sửa) = Toàn quyền · Kinh doanh · CS**, **phê duyệt · từ chối = chỉ Toàn quyền** (cũ: Kinh doanh chỉ xem, R/U của CS có bao gồm cả phê duyệt).
- **2026-10-06 (hong trả lời · sổ quyết định F)**: các chức năng của 「権限付与」 (Danh sách tài khoản · Quyền · Quản lý bảo trì · Phiên bản & cập nhật bắt buộc · Quản lý IP whitelist · Cài đặt hướng dẫn sử dụng 〔thêm 2026-10-12 · sổ tiếp nhận #537〕) là **Toàn quyền = CRUD · 6 vai trò còn lại = R** (sửa × ở dòng 「権限付与」 trong bảng thành R). 「Hubspot/API連携」 (email nhận thông báo liên hệ) vẫn như trước, chỉ Toàn quyền.
- **2026-10-12 (hong trả lời · sổ quyết định F vận hành D Quản lý xuất hàng · giao hàng ① · sổ tiếp nhận #293 · #499)**: **hủy · sao chép · gửi lại · phê duyệt · từ chối · nhập kết quả xuất hàng / vận đơn** của Quản lý xuất hàng · giao hàng là "thao tác theo từng chức năng", nên **Logistics (R/U) cũng làm được** (Kinh doanh · CS · Quản lý sản phẩm · Phát triển sản phẩm vẫn là CRUD nên làm được). Điều R/U không làm được là tạo · xóa thông thường và nhập CSV ở danh sách. **Chỉ Toàn quyền (CRUD) và Logistics (R/U) mới mở · lưu được Cài đặt chu kỳ giao hàng** (các vai trò khác là ×, và nút 「配送サイクル設定」(Cài đặt chu kỳ giao hàng) trên Lịch trình cũng không hiện: sổ tiếp nhận #299 ⑤).
- Chỉ Web vận hành. Các site khác (doanh nghiệp · đơn vị giao hàng ủy thác · tài xế · nhà cung cấp) chỉ bị giới hạn trong "phạm vi dữ liệu của chính mình".

| Nhóm | Chức năng | Màn hình | Toàn quyền | Kế toán | Kinh doanh | CS | Quản lý sản phẩm | Phát triển sản phẩm | Logistics |
|---|---|---|---|---|---|---|---|---|---|
| Nhóm thao tác cơ bản | Cấp quyền | Danh sách tài khoản · Quyền · Quản lý bảo trì · Phiên bản & cập nhật bắt buộc · Quản lý IP whitelist · Cài đặt hướng dẫn sử dụng (2026-10-12 sổ tiếp nhận #537) · Thêm / xóa master thuế suất (2026-10-05 sổ quyết định E) | CRUD | R | R | R | R | R | R |
| Nhóm thao tác cơ bản | Dashboard | Dashboard | R | R | R | R | R | R | R |
| Nhóm thao tác cơ bản | Hướng dẫn thao tác (nội bộ) | — | R | R | R | R | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý thông tin doanh nghiệp | Danh sách doanh nghiệp | CRUD | R | R | R/U | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý cơ sở | Danh sách cơ sở | CRUD | R | R | R | R | R | R/U |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý hợp đồng gói | Danh sách hợp đồng con | CRUD | R | R | R/U | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý đơn đăng ký hợp đồng | Quản lý đơn đăng ký hợp đồng (nhập thay · xử lý) | CRUD | R | CRUD | CRUD | R | R | R |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Phê duyệt · từ chối đơn đăng ký hợp đồng | Quản lý đơn đăng ký hợp đồng (phê duyệt · từ chối) | CRUD | × | × | × | × | × | × |
| Nhóm quản lý doanh nghiệp · cơ sở · hợp đồng | Quản lý hợp đồng cho thuê tủ lạnh · tủ đông | Sổ quản lý túi giữ lạnh | CRUD | R/U | R | R | R | R | R |
| Nhóm quản lý thu tiền · loại bỏ | Quản lý thu tiền | Quyết toán thực tế · Chốt hóa đơn · Hóa đơn | CRUD | CRUD | R | R | R | R | R |
| Nhóm quản lý thu tiền · loại bỏ | Quản lý loại bỏ · thu tiền | Kiểm kê (tồn kho cơ sở) | CRUD | R | R | R/U | R | R | R/U |
| Nhóm quản lý thu tiền · loại bỏ | Nhập loại bỏ | Nhập thay · đánh dấu "đã xác nhận" cho Kiểm kê (tồn kho cơ sở) | CRUD | R | R | R/U | R | R | R/U |
| Nhóm quản lý master sản phẩm · gói | Quản lý master sản phẩm | Master sản phẩm · Quản lý danh mục sản phẩm | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý master vật tư | Master vật tư (「新規登録」(Đăng ký mới) là quyền tạo (C): 2026-10-05) | CRUD | R | R | R | R | R | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý master tủ lạnh · tủ đông | Master dòng máy | CRUD | R | CRUD | R | CRUD | CRUD | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý gói | Master gói · Master tùy chọn · Master giảm giá | CRUD | R | R | R | R | R | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý chiến dịch miễn phí · hàng mẫu | Hàng mẫu kinh doanh | CRUD | R | CRUD | R | R/U | R | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý tồn kho (món ăn) | Tồn kho kho | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý master sản phẩm · gói | Quản lý tồn kho (vật tư) | Tồn kho kho | CRUD | R | R | R | CRUD | R | R |
| Nhóm quản lý đối tác · giao hàng | Quản lý đại lý · đối tác | Master phí giới thiệu · Master đại lý · Lịch sử giới thiệu · Lịch sử thanh toán | CRUD | CRUD | CRUD | R | R | R | R |
| Nhóm quản lý đối tác · giao hàng | Quản lý nhà cung cấp | Master nhà cung cấp | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý đối tác · giao hàng | Quản lý giao hàng ủy thác | Đơn vị giao hàng ủy thác · Nhân viên giao hàng · Yêu cầu báo giá (Quản lý giao hàng ＞ Yêu cầu báo giá: danh sách · chi tiết · tạo · sửa. Quyền giống master đơn vị giao hàng ủy thác. Các tab 「検索」(Tìm kiếm) 「見積依頼」(Yêu cầu báo giá) của master đơn vị giao hàng ủy thác đã bỏ ngày 2026-10-18 = sổ quyết định AT · sổ tiếp nhận #818) | CRUD | R | R | R | R | R | CRUD |
| Nhóm quản lý đối tác · giao hàng | Quản lý điểm trung chuyển | Master kho (bao gồm tìm kiếm địa chỉ điểm trung chuyển) | CRUD | R | R | R | R | R | CRUD |
| Nhóm quản lý menu · đơn hàng | Đăng ký · chỉnh sửa menu hàng tháng (thủ công) | Menu hàng tháng · Mục tiêu đơn giá trung bình | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Sao chép / xem menu quá khứ | — | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý mẫu menu hàng tháng | — | CRUD | R | CRUD | CRUD | CRUD | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý đơn hàng | Quản lý đơn hàng sản phẩm · Quản lý đơn hàng vật tư (tab 「出荷日の集計」(Tổng hợp theo ngày xuất hàng) cũng xem được bằng quyền xem của Quản lý xuất hàng · giao hàng) | CRUD | R | CRUD | CRUD | R | R/U | R |
| Nhóm quản lý menu · đơn hàng | Quản lý đặt hàng | Đặt hàng · Đặt hàng vật tư · Lịch sử đặt hàng · nhập kho | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý nhập kho | Đăng ký nhập kho | CRUD | R | R | R | R | CRUD | R |
| Nhóm quản lý menu · đơn hàng | Quản lý xuất hàng · giao hàng | Lịch trình · Xuất hàng · Quản lý giao hàng · Cần xác nhận | CRUD | R | CRUD | CRUD | CRUD | CRUD | R/U |
| Nhóm quản lý menu · đơn hàng | Cài đặt chu kỳ giao hàng | Cài đặt chu kỳ giao hàng (A1 · tạm ngừng · ngày lễ · ngày không xuất hàng. Chỉ người sửa được mới mở được: hong trả lời 2026-10-08 · sổ tiếp nhận No.181) | CRUD | × | × | × | × | × | R/U |
| Nhóm chức năng khác | Quản lý thông báo | Danh sách thông báo | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD | CRUD |
| Nhóm chức năng khác | Thu thập · phân tích khảo sát | Quản lý khảo sát | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Quản lý doanh thu | Quản lý mua hàng · Yêu thích | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Tương tác người dùng | Đánh giá · Ý kiến | CRUD | R | R/U | R/U | R/U | R/U | R |
| Nhóm chức năng khác | Quản lý điểm / Quản lý tem | — | CRUD | CRUD | CRUD | CRUD | R | R | R |
| Nhóm chức năng khác | Quản lý ưu đãi | — | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Quản lý chiến dịch giới thiệu | — | CRUD | R | R | R | R | R | R |
| Nhóm chức năng khác | Liên kết Hubspot/API | ~~Liên hệ (gửi HubSpot)~~ (đã bỏ màn hình: sổ quyết định AT #25) | CRUD | × | × | × | × | × | × |

## Ghi chú theo sổ quyết định (2026-10-08 · sổ quyết định F 2026-10-07 · 10-08)
- **Quản lý thu tiền (Quyết toán thực tế · Chốt hóa đơn · Hóa đơn)**: chốt · phát hành là **Toàn quyền · Kế toán**. CS được xem · xuất CSV (R). **Logistics là R** (tạm đặt. Xác nhận cuối cùng ở màn hình quyền). **Màn hình 「現金の突き合わせ」(đối chiếu tiền mặt) của Quản lý thu tiền (`/ops/billing/collection`) chỉ tham chiếu · không sửa được, tất cả vai trò kể cả Logistics là R** (ngày 2026-10-08 đã hủy "chỉ Logistics là CRUD": sổ quyết định F "Quản lý thu tiền chỉ tham chiếu…"). Cũ: Logistics = CRUD.
- **Kiểm kê (tồn kho cơ sở)** (cũ: Quản lý tồn kho (hóa đơn)): **Điều chỉnh tồn kho (từng cái · hàng loạt) chỉ Toàn quyền · Quản trị hệ thống** (không hiện nút bút chì · điều chỉnh cho Kế toán · CS · Logistics). **Nhập thay và 「確認済にする」(đánh dấu đã xác nhận) là Toàn quyền · CS · Logistics** (R/U ở dòng 「廃棄入力」(Nhập loại bỏ) phía trên). Kế toán chỉ xem (cũ: R/U). Các điểm chi tiết có thể điều chỉnh sau ở màn hình quyền. Bảng này không tách "Điều chỉnh tồn kho" và "Nhập thay" thành các dòng riêng, nên ghi chú này là chuẩn.

- **Đăng ký · nhập CSV kiểm kê tồn kho kho (điểm khởi đầu) (AW_WHS_006 · 007)** (2026-10-08 · sổ quyết định S · sổ tiếp nhận #447): quyền tính **theo từng dòng**. Dòng có "đối tượng" là vật tư = quyền tạo (C) của Quản lý tồn kho (vật tư) (Toàn quyền · Quản lý sản phẩm), dòng sản phẩm = quyền tạo (C) của Quản lý tồn kho (món ăn) (Toàn quyền · Phát triển sản phẩm). Nếu có dù chỉ 1 dòng thuộc đối tượng mà người nhập không có quyền thì báo lỗi dòng và dừng toàn bộ (giống "Ngoại lệ khi nhập CSV tồn kho kho" ở sổ quyết định P). Chỉ cần có một trong hai quyền là mở được màn hình. Modal 「この商品を記録」(ghi nhận sản phẩm này) ở chi tiết tồn kho kho · trả lại tồn kho thuộc Quản lý tồn kho (món ăn), điều chỉnh vật tư (「調整」(điều chỉnh) của Đặt hàng vật tư) thuộc Quản lý tồn kho (vật tư).

## Cần xác nhận (từ nhật ký công việc của cloud)
- Các nút riêng lẻ trong từng màn hình (tạo · xóa · phê duyệt · công khai, v.v.) vẫn chưa được phân biệt hiển thị (khi bấm thì server trả 403 · toast).

- Sửa 2026-10-05 (hong trả lời · thiết kế màn hình Q3 = A): đổi Toàn quyền của 「プラン管理」(Quản lý gói) từ R → **CRUD** (giống `plans: ALL_R` của code `lib/domain/seed/account.ts`. Nếu tất cả vai trò vẫn là R thì không ai sửa được Master gói · Tùy chọn · Giảm giá). Sổ quyết định F.
