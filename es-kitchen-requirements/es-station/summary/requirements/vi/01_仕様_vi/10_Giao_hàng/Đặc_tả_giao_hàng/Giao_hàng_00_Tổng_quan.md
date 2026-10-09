<!-- Nguyên bản: Đặc_tả_tích_hợp_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_v2.3.md (chia theo từng chương vào 2026-10-03. Nội dung giữ nguyên như thời điểm chia) -->

# Đặc tả tích hợp: Chu kỳ giao hàng, Xuất hàng, Picking, Giao hàng

**Phiên bản**: v2.3 (2026-09-23. Đã phản ánh phụ lục 2026/09/24 〈Con tự động của sự cố〉, **phụ lục 2026/09/29 〈Rà soát xử lý sự cố〉**, **phụ lục 2026/09/29 〈Giải quyết vấn đề tồn đọng・Ủy thác cấp 1〉**, **phụ lục 6 2026/09/29 〈Tiếp nhận đăng ký: kho・số lần giao hàng・đơn hàng・bộ vật tư khởi tạo・dùng thử〉**, **phụ lục 7 2026/09/29 〈Định nghĩa bộ vật tư khởi tạo và dữ liệu giao hàng〉**, **trả lời bảng yêu cầu 2026/09/30 〈Master nơi giao ủy thác・Hỏi đáp giao hàng・Thông báo chưa gán tài xế, v.v.〉**)　**Đối tượng**: ES Station (ES Kitchen) Giai đoạn 2　**Ngôn ngữ**: Tiếng Nhật

## 0. Về tài liệu này

### 0-1. Mục đích

Đặc tả về giao hàng・lịch trình (chu kỳ giao hàng)・xuất hàng・picking trước đây được chia làm 2 bản: **đặc tả thiết kế** (`Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md`) và **yêu cầu rút ra từ biên bản họp** (`ピッキング出荷配送ドライバー_詳細要件仕様.md`). Tài liệu này **gộp cả hai thành 1 bản theo thứ tự luồng nghiệp vụ**, nhằm giúp đọc từ đầu để hiểu "việc gì xảy ra theo thứ tự nào, và quyết định ở đâu".

### 0-3. Vị trí (quan hệ giữa bản chuẩn và tham chiếu)

**Từ 2026-10-03: bản chuẩn của đặc tả giao hàng chỉ là thư mục `Đặc_tả_giao_hàng/` (tài liệu này được chia theo từng chương).** Mô hình dữ liệu (bảng・cột・ràng buộc) cũng được đưa vào `Đặc_tả_giao_hàng/` bằng tiếng Nhật. Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (nếu mâu thuẫn với đặc tả thì sổ quyết định là chuẩn).

| Tài liệu | Vai trò | Trạng thái |
|---|---|---|
| `docs/決定台帳.md` | Danh sách các quyết định đang có hiệu lực | **Chuẩn ưu tiên cao nhất** |
| `01_仕様/10_Giao_hàng/Đặc_tả_giao_hàng/` (thư mục này) | Đặc tả xuyên suốt theo thứ tự luồng nghiệp vụ + mô hình dữ liệu | **Chuẩn** |
| `01_仕様/00_Quyết_định/決定_*.md` | Lý do・diễn biến của từng quyết định | Tham khảo (với chủ đề đã có trong sổ thì sổ quyết định được ưu tiên) |
| `01_仕様/10_Giao_hàng/Đặc_tả_DEV_Chu_kỳ_Xuất_hàng_Picking_Giao_hàng_VI_v2.3.md` | Đặc tả chức năng cho phát triển (VI) | **Đóng băng (nguyên bản)**. Mô hình dữ liệu được chuyển sang thư mục này sau khi Nhật hóa |
| `01_仕様/10_Giao_hàng/Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` | Phần chính của đặc tả thiết kế cũ | **Đóng băng (nguyên bản)** |
| `議事録/仕様/ピッキング出荷配送ドライバー_詳細要件仕様.md` (REQ-DL) | Danh sách yêu cầu | **Đóng băng (nguyên bản)**. Chỉ tham chiếu làm nguồn của số REQ-DL |
| `01_仕様/10_Giao_hàng/Giao_hàng_Trouble_và_hủy_Luồng_xử_lý_vi.md` | Bản dịch VI về sự cố | **Đóng băng (nguyên bản)** |
| `99_過去/ES_Phase2_作業引き継ぎ.md` | Nhật ký ghi bổ sung tại chỗ các quyết định | Dùng khi cần lần theo diễn biến |

**Ngoài phạm vi đặc tả này**: gửi thông báo (danh sách thông báo・điều kiện kích hoạt・người nhận・nội dung). **Gửi thông báo được xử lý trong đặc tả chức năng chung (quản trị hệ thống). Nằm ngoài phạm vi giao hàng** 〔hong trả lời 2026-10-03〕. Ngoài ra còn có UI/UX màn hình, quy trình chuyển đổi dữ liệu, test case. Với hợp đồng・đơn hàng・thanh toán thì chỉ xử lý **đầu vào và đầu ra** (đọc cài đặt giao hàng của hợp đồng / đọc số lượng chốt của đơn hàng / chuyển cho thanh toán) 〔Nguyên bản: DEV §1〕

> `01_仕様/10_Giao_hàng/Thiết_kế_màn_hình_Báo_cáo_trouble_V1.0.md` **không phải tài liệu về sự cố giao hàng** (đây là màn hình riêng để khách hàng báo cáo sự cố thiết bị). Không nhầm lẫn.

### 0-4. Cách ghi nguồn

〔Quyết định v2.3 #n〕 = quyết định lần 4 (#20〜#26 là phụ lục 2026/09/24, #27〜#33 là phụ lục 2026/09/29, #34〜#51 là phụ lục 4 2026/09/29) / 〔Quyết định v2.2 #n〕 = quyết định lần 3 / 〔Quyết định v2.1 #n〕 = quyết định lần 2 / 〔Quyết định #n〕 = quyết định lần 1 / 〔Chu kỳ §x〕 = `Đặc_tả_Cài_đặt_chu_kỳ_giao_hàng.md` v2.1 / 〔Yêu cầu REQ-DL-nnn〕 = `ピッキング出荷配送ドライバー_詳細要件仕様.md` v2.1 / 〔Bàn giao ngày〕 / 〔Bảng yêu cầu dòng N・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕 = trả lời bảng yêu cầu ngày 2026/09/30 (0-2L).

**Đánh số trùng của ID yêu cầu**: REQ-DL-701〜718 bị dùng hai lần cho cùng một số, giữa phần ngày 2026/09/14 và phần ngày 2026/09/25・09/29. 〔Yêu cầu REQ-DL-7xx〕 trong tài liệu này chỉ phần ngày 09/14. Phần ngày 09/25・09/29 được trích kèm ngày, ví dụ "REQ-DL-7xx (09/25)" 〔Nguyên bản: Yêu cầu §8G〕. Trong phần 09/25・09/29, các mục chưa đưa vào tài liệu này (711・713・718) đang được xác nhận ở `配送_10` §18-1. 708・709 (thông báo・email) được xử lý trong đặc tả chức năng chung 〔hong trả lời 2026-10-03〕.

### 0-5. Phương châm biên soạn

1. **Không điền bằng suy đoán.** Giá trị tạm đặt ghi là **【Tạm thời】**.
2. **Quyết định được ưu tiên cao nhất.** Phụ lục 4 2026/09/29 ＞ phụ lục 2026/09/29 ＞ phụ lục 2026/09/24 ＞ lần 4 ＞ lần 3 ＞ lần 2 ＞ lần 1 ＞ nguyên bản. Nội dung cũ được giữ trong ngoặc dạng "(Cũ: 〜. Đổi ở lần 4 2026/09/23)".
3. **Không giấu các mâu thuẫn còn lại.** 57 mục được đặt trong nội dung dưới dạng `⚠️ Cần xác nhận #N` và lập danh sách ở §20.
4. **Thống nhất thuật ngữ.** "Chu kỳ giao hàng" / "Không xuất hàng được" / "Giao một phần" / "Master kho" / "Thứ không giao được" / "Lùi sớm・Lùi muộn". **Không gọi chung `plan lifecycle` và `delivery status` là "trạng thái".**

### 0-6. Cách đọc

- Người đọc lần đầu: **§1 → §4 → §7 → §9 → §11**.
- Điểm vào để triển khai: **§6 (logic tính toán) → §16 (mô hình dữ liệu) → §17 (batch)**.
- Điểm vào để review・xác nhận với Vận hành: **§19 (quyết định. Mới nhất là §19-7) → §18 (mục chưa quyết) → §20 (mâu thuẫn còn lại)**.

---

## 1. Tổng quan

### 1-1. Các site・người dùng xuất hiện

| Site／Hệ thống | Người dùng chính | Làm gì trong nghiệp vụ này | Nguồn |
|---|---|---|---|
| **Web Vận hành** | Quản trị viên vận hành (logistics／CS), quản trị viên hệ thống, kinh doanh | Chuẩn bị master kho・master công ty vận chuyển・tài xế, **hỏi đáp giao hàng (tìm nơi ủy thác・phụ phí vùng đang đàm phán. Thêm ngày 2026/09/30)**, cài đặt chu kỳ giao hàng, cài đặt giao hàng của hợp đồng, lịch trình (xuất hàng・giao hàng), quản lý xuất hàng・giao hàng, chi tiết dữ liệu giao hàng, xuất lệnh xuất hàng, xử lý mục cần xác nhận. **Chỉ Vận hành (logistics) mới có thể hủy・dừng・sắp xếp giao lại・nhân bản**. **Mọi thao tác của kho (đăng ký hoàn tất picking・đăng ký ngày không xuất hàng được・xem lịch trình picking) cũng đều do Vận hành (logistics) thực hiện** | 〔Chu kỳ §1.2〕〔Chu kỳ §11-3〕〔Yêu cầu REQ-DL-885〕〔Quyết định v2.1 #2〕 |
| **Web Doanh nghiệp** | Người dùng doanh nghiệp・người dùng cơ sở | Xem dự kiến giao・thực tế giao trên lịch giao hàng (màn hình 07). Đơn xin đổi ngày giao, đăng ký ngày cơ sở không nhận hàng được (Vận hành phê duyệt), đăng ký đơn hàng (số lượng). **Dấu "Dự kiến" được giữ lại ở phía Web Doanh nghiệp**. **Ở giai đoạn `draft` không hiển thị số lượng** (về dữ liệu vẫn giữ số lượng dự kiến) **Trang chủ = lịch giao hàng tháng hiện tại (màn hình 07)**. **Quản trị viên doanh nghiệp xem toàn bộ cơ sở của công ty mình, người phụ trách cơ sở chỉ xem các cơ sở được gán**. Chi tiết giao hàng không hiển thị ngày picking・kho・công ty vận chuyển 〔Quyết định v2.3 #54〜#57〕 | 〔Chu kỳ §3.1C〕〔Yêu cầu REQ-DL-312・882〕〔Quyết định #77〕〔Quyết định v2.1 S1〕 |
| **Web công ty vận chuyển ủy thác** | Công ty vận chuyển ủy thác | Xem **dữ liệu giao hàng có chặng (leg) do công ty mình phụ trách** (dự kiến chỉ đến chu kỳ tháng sau・chỉ đến số lượng. Sau khi chốt thì toàn bộ mục 〔Quyết định v2.3 #34・#51〕), **gán・đổi tài xế**, trả lời báo giá (**có thể báo giá／không đáp ứng được・phí tháng・tệp đính kèm・bình luận・nơi trung chuyển**. Đổi ngày 2026/09/30. Cũ: OK／NG・phí), danh sách khu vực giao hàng／lịch trình／thông báo／yêu cầu báo giá, **hiển thị chưa gán tài xế (3 ngày trước ngày giao・ngày hôm trước)**, **thông báo hủy hợp đồng cơ sở của chuyến ES配送便 do công ty mình phụ trách**, xuất CSV dữ liệu thu tiền. **Không thể đổi ngày** | 〔Chu kỳ §1.3⑤〕〔Yêu cầu REQ-DL-133・149〕〔Bảng yêu cầu dòng 26・41・142・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕 |
| **Web tài xế giao hàng (ứng dụng)** | Tài xế giao hàng | Nhận hàng tại kho, 5 bước của ES配送便 (ảnh trước khi trưng bày → xác nhận tồn kho・hủy → kiểm hàng → ảnh sau khi trưng bày → thu tiền), báo cáo hoàn tất COOL配送便, báo cáo sự cố, xem thông báo・sổ tay. **Không có chat, khi khẩn cấp dùng nút gọi điện** 〔Bảng yêu cầu dòng 49・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕. **Chỉ đến mức báo cáo**, không thể hủy・dừng. **Hình thức cung cấp là Web (trình duyệt), triển khai trước** | 〔Chu kỳ §4B-5〕〔Yêu cầu REQ-DL-852〕〔Quyết định #63〕 |
| **Hệ thống kho Thomas**【Tạm thời ghi】 | Kho | Trao đổi hai chiều CSV lệnh xuất hàng (Vận hành → Thomas・**theo kho**) và CSV thực tích xuất hàng・số vận đơn (Thomas → Vận hành). **Giả định không có I/F hủy**, ghi đè bằng gửi lại kèm số phiên bản | 〔Chu kỳ §4D-3〕〔Yêu cầu §8 Liên kết dữ liệu giữa các site・bên ngoài〕 |
| **Yamato Transport và các công ty vận tải khác** (Sagawa・Fukuyama・Eisei Logi, v.v.) | — | Vận chuyển thực tế. Về nguyên tắc ES không đánh số vận đơn mà nhận từ công ty vận chuyển và lưu giữ (**chỉ chuyến mà bên nhận ủy thác đến kho lấy hàng thì ES đánh số dựa trên ID dữ liệu giao hàng**). **API Yamato là Giai đoạn 3**, liên kết bên ngoài của Giai đoạn 2 **chỉ có 2: CSV lệnh xuất hàng và CSV số vận đơn** | 〔Chu kỳ §4D-2〕〔Yêu cầu REQ-DL-414・863〕〔Quyết định #55〕 |

- **Vai trò `Quản trị viên kho` không tồn tại.** Xóa hoàn toàn. Vì kho không có màn hình trong hệ thống nên mọi thao tác của kho đều do **Vận hành (logistics)** thực hiện. **"Tab kho" trên màn hình không phải đơn vị phân quyền mà chỉ là bộ lọc dữ liệu** (chuyển tab thì người xem được và việc làm được vẫn không đổi. Đây chỉ là cơ chế hiển thị để đọc riêng số lượng và ngưỡng theo từng kho) 〔Quyết định v2.1 #2〕〔Yêu cầu REQ-DL-680・623・885〕〔Chu kỳ §11-3〕
- Công ty vận chuyển ủy thác không nhận liên lạc từ ES mà **nắm lịch trình tương lai qua site chuyên dụng của công ty vận chuyển**. Lịch trình hiển thị ở đó là dự kiến, **thời điểm chốt trùng với thời điểm chốt đặt hàng (order)** 〔Chu kỳ §4C-4〕. **Phạm vi hiển thị trên site chuyên dụng (Web công ty vận chuyển ủy thác) đã được quyết định ở phụ lục 4 2026/09/29** (11-6) 〔Quyết định v2.3 #34・#51〕

### 1-2. Luồng xuyên suốt

**Hình 1: Luồng xuyên suốt** (hiển thị dạng hình trong bản HTML) — 7 giai đoạn từ chuẩn bị master đến thanh toán, cùng với điều kiện kích hoạt và kết quả tạo ra ở mỗi giai đoạn. Đến ④ là dự kiến (`plan lifecycle`) và chỉ hiển thị ngày cho doanh nghiệp, từ ⑤ trở đi là dữ liệu giao hàng. Ở ⑥, khi lệnh xuất hàng được gửi thành công lần đầu thì chuyển sang `locked`.

<!-- FIG: fig-overall -->

Cài đặt chu kỳ giao hàng §1.1 định nghĩa **7 giai đoạn một chiều**. Bảng dưới sắp xếp lại luồng đó theo chu kỳ giao hàng → giao hàng → thanh toán. Đến ④ là "dự kiến (ngày là chuẩn)", từ ⑤ trở đi là "đã chốt (có số lượng và `delivery status`)".

| # | Giai đoạn | Phụ trách・người dùng | Màn hình chính | Nội dung được quyết định ở đây | Chuyển cho bước sau |
|---|---|---|---|---|---|
| ① | **Chuẩn bị master** | Quản trị viên vận hành (logistics) | 06B Master kho／06C Master công ty vận chuyển・Master trung chuyển／08 Cài đặt tài xế | Thông tin nhận dạng kho・mã kho・ngưỡng số lượng・lead time lệnh xuất hàng, nhóm nhiệt độ hỗ trợ／khu vực hỗ trợ／ngày không giao ủy thác của công ty vận chuyển, nơi trung chuyển, tài xế, **kho xử lý sản phẩm** | Các lựa chọn có thể chọn trong hợp đồng |
| ② | **Cài đặt chu kỳ giao hàng** | Quản trị viên hệ thống・quản trị viên vận hành | 01 Cài đặt chu kỳ giao hàng | A1 đầu tiên (**cố định thứ Hai**), 28 slot (tuần A〜D × thứ 1〜7), tạm dừng chu kỳ, ngày được coi là ngày lễ giao hàng, thời gian đối tượng cài đặt (**cơ bản 6 tháng**), **ô không xuất hàng được theo từng tab kho・ngày không xuất hàng được theo ngày** | Lịch dùng chung toàn công ty (ngày nào có thể giao hàng) |
| ③ | **Cài đặt giao hàng của hợp đồng** | Kinh doanh (hợp đồng = theo từng cơ sở) | 02 Cài đặt giao hàng hợp đồng | Phân loại giao hàng (nhóm nhiệt độ・vật tư × kho × công ty vận chuyển cấp 1 × nơi trung chuyển × công ty vận chuyển cấp 2), **loại chuyến `service_form`**, chi tiết giao hàng, cách quyết định ngày giao (slot chu kỳ／ngày N hàng tháng／cuối tháng hàng tháng), số lượng, **lead time (0〜7 ngày・theo từng phân loại giao hàng)**, **lùi sớm・lùi muộn**, **thứ không giao được**, ngày không nhận được | Quy tắc giao hàng của từng hợp đồng |
| ④ | **Tạo dự kiến giao hàng** | Batch (khi lưu cài đặt chu kỳ giao hàng) | 03 Danh sách dự kiến xuất hàng／04 Lịch trình picking／05 Lịch trình giao hàng | Từ 01 × 02 tính **ngày giao → ngày picking (ngày giao − lead time)**, tạo hàng loạt dự kiến giao hàng (`plan lifecycle` = `draft`) cho toàn bộ thời gian đã cài đặt. **Không tạo cuốn chiếu (rolling)** | Dữ liệu kế hoạch có ngày. **Số lượng dự kiến `estimated_qty` được giữ nội bộ nhưng không hiển thị cho doanh nghiệp ở `draft`** |
| ⑤ | **Tạo chính thức dữ liệu giao hàng** | Batch hàng ngày (catch-up) + Vận hành | 05／05B／06 Chi tiết dữ liệu giao hàng | Tạo chính thức chu kỳ đã qua **ngày bắt đầu đặt hàng (order)** thành dữ liệu giao hàng (`published`) và gắn `delivery status` = Chờ xuất hàng. Vào **ngày chốt đặt hàng** thì chốt số lượng và cố định chế độ đổi ngày ở trạng thái OFF. Việc Vận hành thay đổi hàng loạt・phê duyệt đơn xin thay đổi của doanh nghiệp cũng diễn ra trong giai đoạn này | Dữ liệu giao hàng đã chốt ngày・số lượng・tuyến |
| ⑥ | **Lệnh xuất hàng・Picking** | Quản trị viên vận hành → Thomas → Kho | 04／06 | **Xuất CSV lệnh xuất hàng theo từng kho, gộp 2 tuần (tuần A＋B／tuần C＋D), vào 3 ngày trước (thứ Sáu) ngày bắt đầu** (= quy định "gửi khi nào"). **`published` → `locked` xảy ra vào thời điểm lệnh xuất hàng được gửi thành công lần đầu**. Hàng đông lạnh và hàng lạnh được xuất riêng | Dữ liệu giao hàng đã có lệnh xuất hàng. Từ đó không ghi đè ngày・số lượng |
| ⑦ | **Giao hàng・Giao nhận・Thanh toán** | Công ty vận chuyển ủy thác・tài xế・Vận hành | 08／Ứng dụng tài xế／06／07 | Gán tài xế, nhận hàng, báo cáo giao hàng (final leg là ứng dụng tài xế của ES) hoặc xem như hoàn tất (final leg do công ty vận tải trực tiếp giao), báo cáo sự cố (không đổi trạng thái của bản ghi cha) → Vận hành (logistics) chọn cách xử lý・nếu đến hạn chưa giải quyết thì tạo con tự động (đang xác nhận) 〔Quyết định v2.3 #20〜#22〕 (Cũ: sự cố đang xác nhận → chọn cách xử lý. Bỏ ngày 2026/09/24), **giao một phần**・nhân bản giao lại. Thanh toán chốt theo **tháng dương lịch của ngày giao・dựa trên thực tế giao hàng** | Thực tế giao hàng・thu tiền・vận đơn・dữ liệu thanh toán (đưa sang Bill One) |

〔Chu kỳ §1.1〕〔Chu kỳ §4A-2〕〔Chu kỳ §4D-3〕〔Yêu cầu REQ-DL-809・812〕

**Điểm khởi đầu của `locked` chỉ có một**〔Quyết định v2.1 #3〕〔Yêu cầu REQ-DL-867・868〕〔Chu kỳ §1.4〕

| Sự kiện | Ảnh hưởng tới `plan lifecycle` |
|---|---|
| Đã **xuất (tạo)** CSV lệnh xuất hàng | **Không chuyển** (vẫn là `published`) |
| **Lệnh xuất hàng được gửi thành công lần đầu** | **Chuyển sang `locked` (trigger duy nhất)** |
| **Đã gắn số vận đơn** | **Không chuyển** |
| **Số vận đơn xuất hiện trước lệnh xuất hàng** | **Vẫn là `published` ＋ phát hiện・thông báo là anomaly (bất thường)** và đưa vào mục cần xác nhận |

- Trong ⑦ có thể xảy ra vòng lặp **xác nhận sự cố → nhân bản → gán tài xế** (với bản ghi con nhân bản thì gán lại người phụ trách). **Vòng lặp chỉ xảy ra từ ⑤ trở đi**, không quay lại ②③ 〔Chu kỳ §1.1〕
- **Ngày tạo hợp đồng con của thanh toán tháng hiện tại được đồng bộ với "ngày bắt đầu đặt hàng (order)"** (cùng ngày với việc tạo chính thức dữ liệu giao hàng) 〔Yêu cầu REQ-DL-841〕〔Quyết định #40〕
- Các mốc (công bố menu = bắt đầu đặt hàng／chốt đặt hàng) **không tính ở phía chu kỳ giao hàng mà phía menu là chuẩn**. **Khi tạo chu kỳ thì sao chép ngày thực tế và lưu vào chu kỳ**. Khi menu chưa đăng ký thì lấy **ngày 15 tháng trước làm hạn chốt tạm** (`marker_source = provisional`), và **trong thời gian hạn chốt tạm chỉ có thể làm hai việc: hạn chốt tiếp nhận thay đổi và khởi chạy kiểm tra**, **không chạy chốt số lượng・gửi email xác nhận・lệnh xuất hàng** 〔Quyết định v2.1 #9〕〔Yêu cầu REQ-DL-879・840〕
- **Phân loại giao hàng "vật tư" nằm ngoài đối tượng của ④⑤.** Dữ liệu giao hàng vật tư **được tạo mỗi lần giỏ hàng vật tư được chốt** (nếu cùng cơ sở・cùng ngày giao・còn chuyến vật tư chưa có lệnh xuất hàng thì gộp thành 1 bản ghi 〔Quyết định v2.3 #36〕), không có giai đoạn dự kiến giao hàng (`draft`). **Giao hàng theo yêu cầu (`on_demand`) chỉ dành cho vật tư** 〔Chu kỳ §4A-2C〕〔Quyết định #24〕

### 1-3. Danh sách màn hình

| No | Màn hình | Phụ trách chính | Giai đoạn | Vai trò |
|---|---|---|---|---|
| 01 | **Cài đặt chu kỳ giao hàng** (lịch + bảng cài đặt) | Quản trị viên hệ thống・quản trị viên vận hành | ② | Điều kiện dùng chung toàn công ty (A1 đầu tiên・28 slot・tạm dừng chu kỳ・ngày được coi là ngày lễ giao hàng・thời gian đối tượng cài đặt) và **ô không xuất hàng được theo từng tab kho・ngày không xuất hàng được theo ngày** |
| 02 | Cài đặt giao hàng hợp đồng | Kinh doanh (theo từng hợp đồng) | ③ | Phân loại giao hàng, loại chuyến, chi tiết giao hàng, cách quyết định ngày giao, slot／ngày chỉ định, lead time, số lượng |
| 03 | Danh sách dự kiến xuất hàng | Batch (tự động) | ③→④ | Kết quả ngày giao・ngày picking được tạo từ 01×02 |
| 04 | Lịch trình picking | **Quản trị viên vận hành (logistics)** | ④ | Danh sách theo ngày sắp xếp theo ngày picking. **Tab kho** (bộ lọc)・cảnh báo ngưỡng số lượng. **Vì kho không có màn hình trong hệ thống nên đây là màn hình để Vận hành xem** |
| 05 | Lịch trình giao hàng | Quản lý giao hàng・kinh doanh | ④ | Danh sách theo ngày sắp xếp theo ngày giao (cùng dữ liệu với 04, khác góc nhìn) |
| 05B | Quản lý xuất hàng・giao hàng (danh sách) | Quản trị viên vận hành | ④⑤ | Danh sách tìm kiếm **chỉ dữ liệu giao hàng** theo thời gian・điều kiện. 04・05 là lịch, còn đây là tìm kiếm. Là màn hình cha của 06 |
| 06 | Chi tiết dữ liệu giao hàng (tích hợp) | Quản trị viên vận hành | ④⑥⑦ | Tập hợp vào 1 màn hình: thông tin 1 giao hàng・thực tế giao hàng・đơn xin thay đổi・thu tiền・tệp đính kèm. Chỉ định ngày riêng lẻ, thay đổi tuyến giao hàng chỉ 1 lần, xử lý sự cố, **nhân bản** cũng ở đây |
| 06B | Master kho | Quản trị viên vận hành (logistics) | ① | Quản lý hàng loạt kho picking và nơi trung chuyển theo **loại kho**. **Ô không xuất hàng được và ngày không xuất hàng được theo ngày được cài đặt ở màn hình 01**. 【2026/10/01 T4-2】Kho picking có **khu vực phụ trách** (chọn nhiều tỉnh/thành). Dùng để quyết định kho picking của mẫu kinh doanh |
| 06C | Master công ty vận chuyển・Master trung chuyển | Quản trị viên vận hành (logistics) | ① | Nhóm nhiệt độ hỗ trợ (**3 giá trị: đông lạnh／lạnh・nhiệt độ thường／vật tư**)・khu vực hỗ trợ (**theo đơn vị tỉnh/thành**)・**thứ hỗ trợ**・**bảng giá (khu vực × phí thanh toán・phụ phí vùng)**・**Số túi giữ lạnh・Số gói giữ lạnh**・ngày không giao ủy thác・nơi trung chuyển (mã văn phòng) (thêm ngày 2026/09/30 〔Bảng yêu cầu dòng 28・39・44・57・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕) |
| — | **Hỏi đáp giao hàng** (thêm ngày 2026/09/30) | Kinh doanh・quản trị viên vận hành | ① | Ngay cả khi đang đàm phán vẫn có thể tìm từ địa chỉ (tỉnh/thành・quận/huyện・mã bưu điện) để biết nơi ủy thác・khu vực hỗ trợ・thứ hỗ trợ・mức phụ phí vùng tham khảo, và gửi yêu cầu báo giá cho nơi ủy thác (3-3) 〔Bảng yêu cầu dòng 53・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕 |
| 07 | Lịch giao hàng cho doanh nghiệp・cơ sở | Người dùng doanh nghiệp／cơ sở | ③④ | Góc nhìn công khai cùng dữ liệu với 05 cho phía doanh nghiệp. Hiển thị chu kỳ・ngày lễ, tìm kiếm, modal thực tế giao hàng, lối vào đơn xin thay đổi. **Hiển thị dấu "Dự kiến"** |
| 08 | Cài đặt tài xế・Quản lý tài xế | Quản trị viên vận hành + công ty vận chuyển ủy thác | ①⑤ | Đăng ký tài xế・cấp tài khoản・trạng thái đăng ký số điện thoại. Tiến độ trong ngày, gán và đổi người phụ trách (**từng bản ghi một**), gửi thông báo・sổ tay |
| — | Ứng dụng tài xế (trình duyệt Web・V1.0) | Tài xế | ⑤⑥ | KPI trang chủ, danh sách giao hàng, nhận hàng, 5 bước ES配送便, COOL配送便, báo cáo sự cố, thông báo, sổ tay. **Hiển thị toàn bộ khung giờ nhận hàng trên thẻ nơi giao** |

〔Chu kỳ §1.2〕〔Chu kỳ §5.3B〕〔Yêu cầu REQ-DL-309・312・413・852・878〕〔Quyết định #63・#65・#77〕〔Quyết định v2.1 #8〕. Màn hình 04 và 05 **tách lịch giữa xuất hàng (picking) và giao hàng** (cùng dữ liệu, khác góc nhìn) 〔Yêu cầu REQ-DL-308〕. **Không làm chức năng đổi tài xế hàng loạt** (đổi từng bản ghi một) 〔Yêu cầu REQ-DL-855〕〔Quyết định #65〕

### 1-4. Đầu vào・đầu ra・guard theo từng giai đoạn

"Guard" chỉ **những việc không được làm／hệ thống sẽ chặn ở giai đoạn đó**.

| Giai đoạn | Đầu vào | Đầu ra | Guard |
|---|---|---|---|
| **① Chuẩn bị master** | Loại kho, mã kho／mã văn phòng, ngưỡng số lượng (mặc định 300 đơn／ngày), lead time lệnh xuất hàng (mặc định 3 ngày), nhóm nhiệt độ hỗ trợ・khu vực hỗ trợ (theo đơn vị tỉnh/thành) của công ty vận chuyển・**thứ hỗ trợ・bảng giá・Số túi giữ lạnh・Số gói giữ lạnh** (thêm ngày 2026/09/30 〔Bảng yêu cầu dòng 28・39・44・57・Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930〕)・ngày không giao ủy thác, tài xế, kho xử lý sản phẩm | Lựa chọn có thể chọn ở phân loại giao hàng của hợp đồng. Điều kiện hoạt động dùng để xác định ngày | **Không có kho thay thế**. **Master kho không có lead time**. Nơi trung chuyển không có lead time và không phát hành lại vận đơn. Tổ hợp trái với nhóm nhiệt độ・khu vực hỗ trợ sẽ **cảnh báo** ở phía hợp đồng (không cấm). **Không cho sửa ô không xuất hàng được ở master kho** (hướng dẫn sang màn hình 01) |
| **② Cài đặt chu kỳ giao hàng** | A1 đầu tiên (cố định thứ Hai. Nếu không phải thứ Hai thì làm tròn về thứ Hai liền trước), tạm dừng chu kỳ, ngày được coi là ngày lễ giao hàng, thời gian đối tượng cài đặt (cơ bản 6 tháng) | Lịch 28 slot (tuần A〜D × thứ 1=Hai〜7=Chủ nhật). Dùng chung toàn công ty | **Tạm dừng không làm lệch slot và thứ** (số ngày tạm dừng phải là bội của 7. Phần thiếu `7 −（số ngày tạm dừng mod 7）` do hệ thống tính và hiển thị, **vị trí đặt do quản trị viên quyết định. Không tự động chèn**). Ngày nghỉ theo từng kho không biểu diễn ở đây mà biểu diễn bằng ô・ngày **không xuất hàng được**. **Cảnh báo khi sắp hết thời gian cài đặt chỉ hiển thị trong màn hình** (không tạo thông báo dashboard) |
| **③ Cài đặt giao hàng của hợp đồng** | Phân loại giao hàng, loại chuyến, chi tiết giao hàng, cách quyết định ngày giao, số lượng, lead time | **Dự kiến giao hàng (`draft`)** | Hợp đồng chỉ được ghi đè các mục trong whitelist. **Lead time là 0〜7 ngày**, **không tự động điền từ master kho**. Khi đổi kho thì **áp dụng từ tháng áp dụng (A1 của tháng chu kỳ)** và không động đến quá khứ. 1 hợp đồng = 1 cơ sở, **kho・công ty vận chuyển có thể khác nhau theo từng phân loại giao hàng**. **Giao hàng theo yêu cầu (`on_demand`) chỉ dành cho vật tư** |
| **④ Tạo dự kiến giao hàng** | Cài đặt 01 × 02 | `draft` có ngày giao・ngày picking | **Không tạo cuốn chiếu (rolling)** (chỉ tạo cho thời gian đã cài đặt. Tháng chưa cài đặt thì không thể công bố menu). **Nếu trong 20 ngày không tìm thấy ngày nào giao được thì đưa vào mục cần xác nhận dưới dạng "không thể tạo dự kiến"** (không tự động quyết định ngày). **Khóa duy nhất của dự kiến là `contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key`**, không dùng `(contract_id, delivery_date)`. Tạo lại là **thay thế** chứ không phải thêm. **Không thể nhân bản dữ liệu giao hàng từ `draft`** (chỉ có thể sao chép／thay đổi dự kiến) |
| **⑤ Tạo chính thức・thay đổi dữ liệu giao hàng** | Sửa ngày・thay đổi hàng loạt của Vận hành, đơn xin thay đổi của doanh nghiệp (cần phê duyệt), phản ánh thay đổi cài đặt ①②, override đã phê duyệt | `draft` →(ngày bắt đầu đặt hàng) **`published`** →(chốt số lượng vào ngày chốt đặt hàng)→(gửi thành công lần đầu lệnh xuất hàng) **`locked`** | Cửa vào để ghi đè ngày **thống nhất thành 1**. Doanh nghiệp chỉ có thể xin trong **thời gian chu kỳ đã tạo (tối đa 6 tháng sau, trừ ngày quá khứ・tháng hiện tại)**. **Trước hạn chốt** Vận hành có thể đổi từng bản ghi hoặc hàng loạt, lý do là tùy chọn. **Từ sau hạn chốt đặt hàng đến ngày trước ngày xuất hàng, Vận hành đổi từng bản ghi・bắt buộc có lý do・trong cùng nửa đầu／nửa sau của cùng chu kỳ. Từ ngày xuất hàng trở đi thì hủy + nhân bản** 〔Quyết định v2.3 #63〕 (Cũ: sau hạn chốt đặt hàng không đổi ngày — hủy + nhân bản 〈Quyết định v2.2 #1〉. Sửa theo sổ quyết định 2026-10-03). **Thay đổi chỉ 1 lần** trong mọi trường hợp đều **bắt buộc lưu vào lịch sử thay đổi: trước → sau và người thao tác** |
| **⑥ Lệnh xuất hàng・Picking** | Dữ liệu giao hàng đã chốt (theo kho・theo nhóm nhiệt độ) | CSV lệnh xuất hàng (theo chuẩn Thomas・**theo kho**・kèm số phiên bản). Danh sách picking **chỉ xác nhận trên màn hình quản trị** | **Không có hủy.** Dừng là **gửi lại với số lượng 0**. **Không làm xuất PDF danh sách picking**. Đông lạnh và lạnh được xuất riêng. **Chỉ xuất ra thì không `locked`**. **Có số vận đơn cũng không `locked`** (nếu xuất hiện trước thì là anomaly) |
| **⑦ Giao hàng・Giao nhận・Thanh toán** | Gán tài xế, nhận hàng, báo cáo giao hàng, báo cáo sự cố, nhân bản (**giao một phần**・giao lại・chuyến thay thế) | Thực tế giao hàng・thu tiền・ảnh・vận đơn・dữ liệu thanh toán | **Đổi ngày giờ giao hàng chỉ Vận hành**, **gán tài xế do Vận hành + công ty vận chuyển ủy thác** (gán không đổi ngày nên vẫn được sau `locked`). Hủy・dừng・sắp xếp giao lại chỉ Vận hành (logistics) và **bắt buộc có lý do**. Nhân bản **tối đa 1 cấp cha-con** (số hậu tố tối đa 9) và **chỉ thực hiện được từ `published` hoặc `locked`**. **Báo cáo sự cố・liên lạc sau giao hàng cũng không đổi trạng thái bản ghi cha** (đã giao vẫn là đã giao. Mở sự cố và mục cần xác nhận, Vận hành (logistics) giải quyết. Sửa thực tế sau khi chốt thanh toán được phản ánh vào tháng sau qua ③ điều chỉnh) 〔Quyết định v2.3 #20〕 (Cũ: không đặt thời hạn để đưa hàng đã giao trở lại "đang xác nhận". Bỏ ngày 2026/09/24) |

〔Chu kỳ §1.3〕〔Chu kỳ §4A-2〕〔Chu kỳ §11-3〕〔Yêu cầu REQ-DL-865・866・867・872・873・879〕〔Quyết định #14・#19・#24・#50・#61〕〔Quyết định v2.1 #1・#3・#5・#6・#9〕

**Quy tắc để không chảy ngược**〔Chu kỳ §1.5〕

1. **Giai đoạn sau không ghi đè dữ liệu của giai đoạn trước.** Khi muốn sửa từng dữ liệu giao hàng thì **không động đến master kho** hay chu kỳ giao hàng. Ngược lại, nếu thay đổi cài đặt ①② tác động đến các bản ghi từ `published` trở đi thì không tự động ghi đè mà đưa vào "cần xác nhận"
2. **Chỉ batch ③④ mới tạo ngày.** Từ đó về sau chỉ "dịch chuyển" và không có công thức tính
3. **Ghi nhận không xóa mà bổ sung.** Dù hủy・dừng・nhân bản thì đều giữ lại bản ghi gốc (phục vụ thanh toán và kiểm toán). **Cũng không để lại việc chưa xử lý** (cần xác nhận・đang xác nhận・ngay sau khi nhân bản đều hiển thị ở "cần xác nhận" của lịch trình Vận hành)
4. **Bắt buộc có lý do.** Đổi ngày thủ công・thay đổi hàng loạt・hủy override đã phê duyệt・đổi kho・xóa dự kiến・hủy・dừng・nhân bản đều bắt buộc nhập lý do (**chỉ "thay đổi chỉ 1 lần" trước hạn chốt là lý do tùy chọn**. Lịch sử luôn được lưu)

---

## 2. Thuật ngữ và hệ thống ID

### 2-1. Định nghĩa thuật ngữ

| Thuật ngữ | Định nghĩa | Nguồn |
|---|---|---|
| **Chu kỳ giao hàng** | Lịch trình dùng chung toàn công ty, 1 vòng là 28 ngày. 4 tuần (A/B/C/D) × 7 ngày = 28 slot (`A1`〜`D7`). Cấu thành bởi **tuần × thứ**, A1 luôn là thứ Hai, A6 luôn là thứ Bảy. **Thống nhất gọi là "chu kỳ giao hàng"** (không dùng "chu kỳ nhập giao") | 〔Chu kỳ §0・§0-0〕〔Quyết định #20〕 |
| **Slot giao hàng (mã ô)** | Mã định danh chỉ 1 ngày trong chu kỳ `A1`〜`D7`. **Luôn khớp với "tuần (A〜D) × thứ (1=Hai…7=CN)"**. **Slot quyết định ngày giao chứ không phải ngày picking** | 〔Chu kỳ §0〕 |
| **Tháng chu kỳ** | Năm tháng làm tên gọi của chu kỳ. **Tháng chứa ô thứ 14 là `B7`** (§2-3) | 〔Chu kỳ §4.2〕〔Yêu cầu REQ-DL-881〕〔Quyết định v2.1 #11〕 |
| **Ngày giao (ngày hàng đến)** | Ngày hàng đến doanh nghiệp. **Là mốc (anchor) của mọi phép tính ngày** | 〔Chu kỳ §0〕 |
| **Ngày picking** | Ngày kho thực hiện xuất kho. **Luôn được tính ngược bằng "ngày giao − lead time"**. Chiều này chung cho mọi chế độ và không đảo ngược | 〔Chu kỳ §0〕 |
| **Lead time** | Số ngày từ picking đến giao hàng. Được giữ **theo từng phân loại giao hàng (lạnh／đông lạnh／vật tư) của hợp đồng**, phạm vi **0〜7 ngày**. **Master kho không giữ và cũng không tự động điền giá trị mặc định**. Dù có trung chuyển thì **tổng cộng 1 giá trị là chuẩn**, phần chia cấp 1・cấp 2 chỉ hiển thị tham khảo | 〔Chu kỳ §12-1〕〔Yêu cầu REQ-DL-831・832〕〔Quyết định #10／#16／#52・#4・#21〕 |
| **Tạm dừng chu kỳ (thời gian tạm dừng chu kỳ giao hàng)** | Thời gian dừng chính việc tiến hành chu kỳ, như nghỉ hè・nghỉ Tết・nghỉ lễ dài. Ngày tạm dừng **không gán slot và không tiêu thụ ô**. Các ô bị dừng **được tiếp tục tuần tự từ ngày sau khi hết tạm dừng**, toàn bộ chu kỳ bị lùi muộn đúng bằng số ngày tạm dừng. **Số lần giao hàng không giảm** | 〔Chu kỳ §0・§2.2〕〔Yêu cầu REQ-DL-807〕 |
| **Ngày được coi là ngày lễ giao hàng** | Ngày áp dụng quy tắc "không giao ngày lễ" phía hợp đồng. Chỉ hợp đồng tương ứng được dời ngày giao, còn công ty có thể giao ngày lễ thì giao bình thường. **Không phải toàn công ty đều không giao được** | 〔Chu kỳ §0・§2.3〕 |
| **Không xuất hàng được** | Kho không thể picking. Loại chỉ định theo ô gọi là **ô không xuất hàng được**, loại chỉ định theo ngày gọi là **ngày không xuất hàng được** (không dùng "không picking được", "xuất hàng NG", "P không được") | 〔Chu kỳ §0〕 |
| **Ô không xuất hàng được** | Ô mà kho không làm việc, chỉ định theo trục "tuần × thứ" (`A1`〜`D7`). Có thể thay đổi theo từng tuần, như **cùng thứ Năm nhưng tuần A làm việc・tuần B nghỉ**. **Mỗi kho có 1 bộ**, áp dụng cho toàn bộ thời gian đối tượng cài đặt | 〔Chu kỳ §0・§2.3〕〔Yêu cầu REQ-DL-722・804〕 |
| **Ngày không xuất hàng được** | Ngày kho không thể picking do ngày nghỉ định kỳ・kiểm kê・bảo trì thiết bị, v.v. **Có thể đăng ký theo khoảng từ ngày bắt đầu〜ngày kết thúc**. Được giữ theo từng kho. **Khi trùng thì cả ngày picking và ngày giao đều là đối tượng dời** | 〔Chu kỳ §0・§2.3〕〔Yêu cầu REQ-DL-842・689〕〔Quyết định #15〕 |
| **Thứ không giao được** | Thứ・ngày lễ mà phía doanh nghiệp (cơ sở) không nhận được. Giữ **theo đơn vị hợp đồng (cơ sở)** và chỉ kiểm soát **ngày giao**. Tên vật lý `ng_weekdays` giữ nguyên (không dùng tên cũ "thứ không nhận được") | 〔Chu kỳ §0-0・§3.1〕〔Quyết định #31〕 |
| **Ngày không nhận được** | **Ngày** mà phía doanh nghiệp (cơ sở) không nhận được (nghỉ・kiểm kê・thi công・nghỉ Tết). Có chỉ định khoảng thời gian và lặp lại hàng năm | 〔Chu kỳ §3.1C〕 |
| **Lùi sớm・Lùi muộn** | Cài đặt hợp đồng về **hướng dời** khi ngày giao rơi vào **thứ không giao được**・ngày được coi là ngày lễ giao hàng・ngày không nhận được・ngày **không xuất hàng được** (mặc định là lùi sớm). Tên vật lý `holiday_shift` giữ nguyên (không dùng tên cũ "hướng thay thế") | 〔Chu kỳ §0-0・§3.1〕〔Quyết định #31〕 |
| **Thay thế (dời ngày)** | Dời lần giao rơi vào ngày không giao được tới ngày giao được, theo **"lùi sớm・lùi muộn"** của hợp đồng. **Không đặt giới hạn số ngày dời**, nhưng nếu dời quá 3 ngày so với ô gốc thì đưa vào cần xác nhận. **Ô được tiếp tục sau tạm dừng không được dời về trước tạm dừng** (chỉ tìm theo hướng lùi muộn) | 〔Chu kỳ §2.2・§4.4〕〔Yêu cầu REQ-DL-806・825〕 |
| **Dự kiến giao hàng (plan)** | Bản ghi kế hoạch được tạo từ cài đặt chu kỳ giao hàng × cài đặt giao hàng hợp đồng. Có ngày giao・ngày picking・slot・kho được gán・công ty vận chuyển・lead time thực tế. **Nội bộ giữ số lượng dự kiến `estimated_qty` nhưng `draft` không hiển thị số lượng cho doanh nghiệp** (không phải "dự kiến không có số lượng") | 〔Chu kỳ §0・§4A-1〕〔Yêu cầu REQ-DL-882〕〔Quyết định v2.1 S1〕 |
| **Dữ liệu giao hàng (delivery)** | Dữ liệu vận hành của 1 lần giao hàng, được **tạo chính thức (materialize)** từ dự kiến giao hàng. Có số vận đơn・tuyến giao hàng・tài xế・số lượng chốt・thực tế giao hàng・thu tiền・tệp đính kèm. **Không tính ngày mà chỉ kế thừa dự kiến** | 〔Chu kỳ §0・§4A-1〕 |
| **`plan lifecycle` (vòng đời dự kiến)** | **3 giá trị mà dự kiến giao hàng (`shipping_plans.lifecycle`) nhận** `draft` / `published` / `locked`. Biểu thị **"từ khi nào không thể động đến"**. Trên màn hình gọi là **giai đoạn** | 〔Chu kỳ §0・§4A-3〕〔Yêu cầu REQ-DL-883〕〔Quyết định v2.1 S5〕 |
| **`delivery status` (trạng thái giao hàng)** | **Các giá trị mà dữ liệu giao hàng (`deliveries.status`) nhận**: Chờ xuất hàng／Đã xuất hàng／Đã nhận／Đã giao／Đã giao **một phần**／Chờ giao lại／Đang xác nhận／Dừng／Hủy. Biểu thị **"hàng đã đi đến đâu"**. Trên màn hình gọi là **trạng thái**. **Không đổi khi báo cáo sự cố** (`Đang xác nhận` trong luồng sự cố chỉ thuộc về bản ghi con chưa xuất hàng) | 〔Chu kỳ §0・§4A-3B〕〔Yêu cầu REQ-DL-883〕〔Quyết định v2.1 S5〕〔Quyết định v2.3 #20〕 |
| **final leg (chặng cuối)** | Trong tuyến giao hàng (route legs), chặng cuối cùng đến nơi giao (`delivery_legs.is_final_leg`). **Việc xem như hoàn tất hay bắt làm giao thiếu chỉ được quyết định bởi `delivery_regime` của chặng này** | 〔Chu kỳ §0・§4C-1〕〔Yêu cầu REQ-DL-871〕〔Quyết định v2.1 #4〕 |
| **Xem như hoàn tất** | Với chuyến mà **final leg do công ty vận tải trực tiếp giao**, nếu quá ngày giao mà không ai báo cáo thì batch **06:00 sáng ngày hôm sau ngày giao** tự động coi là "đã giao (xem như)". **Chuyến mà final leg là ứng dụng tài xế của ES thì không xem như hoàn tất** | 〔Chu kỳ §0・§4C-1〕〔Yêu cầu REQ-DL-869・870〕〔Quyết định v2.1 #4〕 |
| **missing queue (hàng đợi cần xác nhận giao thiếu)** | Hàng đợi cần xác nhận gom các chuyến mà **final leg là ứng dụng tài xế của ES** nhưng đến sáng hôm sau vẫn không ở trạng thái Đã giao・Dừng・Hủy | 〔Chu kỳ §0・§4C-1〕〔Yêu cầu REQ-DL-869・663〕 |
| **Giao một phần (đã giao một phần)** | Trạng thái chỉ giao một phần số lượng dự kiến. Số còn lại luôn được giữ bằng **nhân bản (số hậu tố)** và **bản nhân bản đó được tạo ở trạng thái "đang xác nhận"**. "Hoàn tất mà còn một phần chưa giao" trong ứng dụng về dữ liệu cũng là trạng thái này | 〔Chu kỳ §0・§4A-4C〕〔Yêu cầu REQ-DL-649-2〕 |
| **Con tự động (con tự động của sự cố)** | Dữ liệu giao hàng con mà hệ thống tạo trong cùng transaction **khi đăng ký báo cáo sự cố của loại mà master loại đặt là "tạo" (giao nhầm・vắng mặt・hư hỏng)**. `Đang xác nhận`・`duplicate_type=trouble_pending`・`creation_source=trouble_auto`. Ngày・số lượng là tạm, cho đến khi Vận hành (logistics) chốt thì nằm ngoài đối tượng của lệnh xuất hàng・vận đơn・gán・thanh toán・thông báo・xem như hoàn tất. **Với 1 giao hàng xảy ra sự cố, số bản ghi còn sống tối đa là 1** (Cũ: batch tạo khi quá hạn・1 báo cáo 1 bản ghi. Đổi ngày 2026/09/29) | 〔Quyết định v2.3 #23・#29・#30〕〔DEV §13.2.1〕 |
| **Trung chuyển (relay)** | Việc có nơi trung chuyển (văn phòng của công ty vận chuyển. Có thể là cơ sở của công ty vận chuyển ủy thác 〔Quyết định v2.3 #50〕) giữa kho và nơi giao. **Chỉ giữ 2 giá trị "có／không có trung chuyển"**, **suy ra từ route legs và không lưu như trạng thái**. **Không giả định trung chuyển từ 2 cấp trở lên**. Việc gán tài xế theo **đơn vị chặng (leg)**, **không gán chặng của công ty vận tải, gán chặng của công ty mình・ủy thác** (Cũ: vận hành hiện tại chỉ gán cấp 2 〈nơi trung chuyển → nơi giao〉. Thay thế ngày 2026/09/29 〔Quyết định v2.3 #48〕). Việc nhận tại nơi trung chuyển được lưu bằng thời điểm nhận của từng chặng 〔Quyết định v2.3 #49〕 | 〔Chu kỳ §4C-2〕〔Yêu cầu REQ-DL-876・836〕〔Quyết định #60〕〔Quyết định v2.1 #7〕〔Quyết định v2.3 #48〕 |
| **Loại chuyến (`service_form`)** | **ES配送便／COOL配送便／資材便**. **Là mục nhập mà phân loại giao hàng (delivery channel) giữ**, **không đặt ở tuyến của hợp đồng**. Không suy ra từ việc có trung chuyển hay không | 〔Chu kỳ §4C〕〔Yêu cầu REQ-DL-875〕〔Quyết định v2.1 #7〕 |
| **Thể chế giao hàng (`delivery_regime`)** | Phân loại ai vận chuyển. **3 giá trị `self` (tự công ty)／`partner_driver` (tài xế ủy thác)／`parcel_carrier` (công ty vận tải)**. Giữ giá trị mặc định của phân loại giao hàng và **giá trị thực tế theo từng chặng (leg)** | 〔Chu kỳ §0・§4C〕〔Yêu cầu REQ-DL-874〕〔Quyết định v2.1 #7〕 |
| **Phân loại giao hàng (kênh)** | Đơn vị giao hàng mà hợp đồng giữ. Cặp **nhóm nhiệt độ (đông lạnh／lạnh／nhiệt độ thường) hoặc vật tư × kho × công ty vận chuyển (cấp 1・trung chuyển・cấp 2)**. Dự kiến giao hàng・dữ liệu giao hàng được tạo theo đơn vị này. **Cũng là nơi giữ `service_form`** | 〔Chu kỳ §0・§3.1B〕〔Quyết định v2.1 #7〕 |
| **Nhóm nhiệt độ (phân loại hàng)** | Loại đông lạnh／loại lạnh／nhiệt độ thường／vật tư. Không dùng tên cũ "cool便". **Đông lạnh và lạnh được picking・lệnh xuất hàng riêng** | 〔Chu kỳ §0〕〔Yêu cầu REQ-DL-301〕 |
| **Master kho** | Master quản lý hàng loạt kho picking và nơi trung chuyển theo **loại kho**. Không đặt tên là "master cơ sở" (dễ nhầm với "cơ sở" chỉ nơi giao của hợp đồng) | 〔Chu kỳ §0・§2.3A〕〔Yêu cầu REQ-DL-410〕 |
| **Override đã phê duyệt** | Kết quả do con người quyết định, như phê duyệt đơn xin thay đổi. Không phải thuộc tính của dự kiến mà được giữ độc lập, mỗi lần tạo lại thì áp dụng lại vào dự kiến. Dự kiến được áp dụng sẽ hiển thị "Đã điều chỉnh" | 〔Chu kỳ §0・§4A-4〕 |

> **Không gọi chung `plan lifecycle` và `delivery status` là "trạng thái".** Đây là hai máy trạng thái riêng, bảng chuyển trạng thái cũng riêng. 1 dữ liệu giao hàng **đồng thời có cả hai giá trị**, như "`lifecycle` = `locked`" và "`status` = Đã nhận". Dòng `draft` để trống cột trạng thái là "—" và chỉ hiển thị trạng thái của đơn xin thay đổi 〔Quyết định v2.1 S5〕〔Yêu cầu REQ-DL-883〕〔Chu kỳ §0・§1.4〕

### 2-2. Cách đọc mã ô

- Mã ô là **tuần (A／B／C／D) × thứ (1=Hai・2=Ba・3=Tư・4=Năm・5=Sáu・6=Bảy・7=CN)**. `A6` đọc là thứ Bảy tuần A, `B5` đọc là thứ Sáu tuần B. Trên màn hình, nút ô không giao được ghi kèm thứ (như `A6 土`) 〔Chu kỳ §0・§2.3〕
- **`A1` luôn là thứ Hai.** A1 đầu tiên (ngày đầu của chu kỳ giao hàng) cố định thứ Hai, nếu nhập ngày không phải thứ Hai thì **làm tròn về thứ Hai liền trước** để tạo và hiển thị kết quả làm tròn trên màn hình 〔Chu kỳ §2.3〕 Nếu có tạm dừng chu kỳ thì ô bị lùi muộn đúng bằng số ngày tạm dừng, nhưng vì **tạm dừng luôn được làm tròn thành bội của 7 ngày** nên **tương ứng giữa ô và thứ không bị lệch** (`A1` của chu kỳ kế tiếp vẫn là thứ Hai) 〔Chu kỳ §4.2〕〔Yêu cầu REQ-DL-819〕 Lý do giữ bằng tuần × thứ là **có thể thay đổi làm việc・nghỉ theo từng tuần dù cùng thứ**, và tuần B・tuần D không xuất hàng đến thứ Năm・thứ Sáu là vì số lượng giao hàng của tuần đó ít nên kho nghỉ cách tuần 〔Chu kỳ §2.3〕
- Giá trị mặc định của ô **không xuất hàng được** là **A6・A7／B4〜B7／C6・C7／D4〜D7**. **Ô không giao được** tự động xác định từ đó là **A1・B1・C1・D1 (thứ Hai hàng tuần)**, không phải giá trị cố định mà **được tính lại theo thay đổi của ô không xuất hàng được**. Ranh giới chu kỳ được xác định theo vòng tròn (sau D7 là A1). **Không cố định Chủ nhật là không xuất hàng được・không nhận được** 〔Chu kỳ §2.3・§5.3〕〔Yêu cầu REQ-DL-818〕
- Khi ô có màu xám (không chọn được), **trong ô hiển thị ngắn gọn** "B1 Hai (không giao được)", **chi tiết ở tooltip** hiển thị ô **không xuất hàng được**・tên kho・lead time 〔Yêu cầu REQ-DL-847〕〔Quyết định #23〕

### 2-3. Tháng chu kỳ = tháng chứa ô thứ 14 `B7`

| Khía cạnh | Nội dung |
|---|---|
| **Định nghĩa** | **Tháng chu kỳ (tên chu kỳ) là tháng chứa ô thứ 14 `B7`**. **Không tạo nhánh ngoại lệ** |
| Quan hệ với "tháng có nhiều ngày hơn" | Quy tắc này **luôn cho cùng kết quả với "tháng có nhiều ngày hơn trong 28 ngày của ô A1〜D7"**. Vì ranh giới giữa 14 ngày đầu và 14 ngày sau của 28 ngày nằm giữa `B7` và `C1`, nên tháng có nhiều ngày hơn chắc chắn chứa `B7` |
| **Khi 14 đối 14** | **Cứ thế `B7` thuộc tháng nào thì lấy tháng đó = tháng trước** (ví dụ: nếu `A1` = 2027-01-18 thì 18〜31/1 là 14 ngày, 1〜14/2 là 14 ngày, `B7` = 31/1 nên là **chu kỳ tháng 1/2027**). **Không giữ phân nhánh riêng cho trường hợp bằng nhau** |
| Phạm vi đếm | **Chỉ đếm ngày của ô.** Ngày tạm dừng chu kỳ không tiêu thụ ô nên không tính. Dù tạm dừng làm độ dài theo lịch kéo dài thì vị trí `B7` được quyết định theo thứ tự ô nên tháng chu kỳ không đổi |
| Ví dụ | Chu kỳ `A1 = 2026-09-07` là 07/9〜11/10 (21〜27/9 là tạm dừng chu kỳ nên không dùng ô). `B7` là 2026-09-20 nên là **`Chu kỳ tháng 9/2026`** (tính theo số ngày cũng ra cùng kết quả với 17 ngày tháng 9 và 11 ngày tháng 10). 2026/10/01 STEP4 Q1=A, thống nhất theo lịch của quản lý giao hàng (Ví dụ cũ: A1 = 2026-08-31) |
| ID hợp đồng con | `yyyymm` trong `ID hợp đồng-yyyymm` cũng được quyết định **theo cùng quy tắc**. **1 chu kỳ = 1 hợp đồng con**, dù vắt qua tháng vẫn gắn vào hợp đồng con của tháng chu kỳ |
| Quan hệ với tháng thanh toán | Tháng chu kỳ và tháng thanh toán có thể không trùng nhau. **Tháng thanh toán được giữ riêng ở `billing_month`** |
| Nơi khác có tác dụng | Xác định gói cố định・đặt hàng (giới hạn số lượng cung cấp hàng tháng), **tháng áp dụng của thay đổi kho・tuyến giao hàng của hợp đồng** (chuyển từ A1 của chu kỳ đó), menu dùng làm mốc của chu kỳ đó (= menu của tháng chu kỳ) |

〔Chu kỳ §4.2・§4A-2〕〔Yêu cầu REQ-DL-839・864・881〕〔Quyết định v2.1 #11〕

### 2-4. Hệ thống ID

| Đối tượng | Định dạng | Ví dụ | Nguồn |
|---|---|---|---|
| ID kho (kho picking) | `WH` + 5 chữ số | `WH00001` | 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-682〕 |
| ID kho (nơi trung chuyển) | `HU` + 5 chữ số (**【Tạm thời】HU = Hub**) | `HU00001` | 〔Chu kỳ §2.3A〕〔Quyết định E#5〕 |
| ID doanh nghiệp・ID cơ sở | `CU` + tối thiểu 5 chữ số | `CU00001` | 〔Bàn giao §4-8〕 |
| ID hợp đồng (hợp đồng cha) | `CP` + tối thiểu 7 chữ số | `CP0000001` | 〔Bàn giao §4-8〕 |
| ID hợp đồng con | ID hợp đồng + `-yyyymm` (`yyyymm` là **tháng chu kỳ**) | `CP0000001-202607` | 〔Bàn giao §4-8〕〔Yêu cầu REQ-DL-881〕 |
| ID gói (plan) | `ES` + tối thiểu 6 chữ số | `ES000012` | 〔Bàn giao §4-8〕 |
| ID dòng máy／ID tùy chọn／ID giảm giá | 2 ký tự phân loại dòng máy (RF／VM／MW／HW／BX) + 6 chữ số／`OP` + 6 chữ số／`DC` + 6 chữ số. **Không giữ ID áp dụng** (tùy chọn・giảm giá được xác định bằng ID hợp đồng con + mã. `AP-` chỉ là số của đơn đăng ký mới: hong trả lời 2026-10-03) | `RF000001`／`OP000001`／`DC000001` | 〔Bàn giao §4-8〕〔Sổ quyết định〕 |
| Khóa duy nhất của dự kiến giao hàng | `contract_id` + `line_no` + `channel_id` + `cycle_id` + `occurrence_key` | — | 〔Yêu cầu REQ-DL-873〕〔Quyết định v2.1 #6〕 |
| Số giao hàng | `DL-` + `yymmdd` ngày xuất hàng dự kiến (thời điểm tạo dữ liệu giao hàng) + `-` + số thứ tự 4 chữ số. **Đã gắn thì không đổi** (đổi ngày cũng không đánh lại). Ngày thực tế xuất đi được giữ riêng ở "ngày xuất hàng (thực tế)" (`deliveries.shipped_date`) và hiển thị bên cạnh số giao hàng | `DL-261020-0021` (dự kiến xuất 20/10) | 〔Quyết định_STEP4 trả lời Q2〕〔Sổ quyết định〕〔hong trả lời 2026-10-03〕 |
| Số hậu tố của dữ liệu giao hàng (nhân bản) | Số giao hàng + `-1`〜`-9` | `DL-…-1` | 〔Chu kỳ §4A-4C〕 |
| Số phiên bản của lệnh xuất hàng | Số lệnh + `/ revN` | `DL-260820-0012 / rev2` | 〔Chu kỳ §4D-3〕 |

- **ID kho được phân tiền tố theo loại kho.** Vì kế thừa nguyên ID nơi trung chuyển hiện có, nhìn ID là biết loại. **Không thể đổi loại kho sau khi đăng ký** (vì tiền tố được quyết định bởi loại). **Không tái sử dụng ID đã xóa** 〔Chu kỳ §2.3A〕〔Yêu cầu REQ-DL-682・683・685〕 **`HU` chỉ dùng cho ID nội bộ, không dùng ở vận đơn・liên kết CSV・biểu mẫu**【Tạm thời】〔Quyết định E#5〕
- **`occurrence_key` là giá trị chỉ duy nhất lần này trong chu kỳ đó** (slot `A1`〜`D7`, hoặc ngày chỉ định riêng "ngày N hàng tháng"・"cuối tháng hàng tháng"). **Không dùng `(contract_id, delivery_date)`** (vì 1 hợp đồng có thể có nhiều nhóm nhiệt độ・phân loại giao hàng trong cùng 1 ngày). Việc tạo và tạo lại (thay thế) đều đối chiếu bằng khóa này 〔Chu kỳ §4A-2〕〔Quyết định v2.1 #6〕

---
