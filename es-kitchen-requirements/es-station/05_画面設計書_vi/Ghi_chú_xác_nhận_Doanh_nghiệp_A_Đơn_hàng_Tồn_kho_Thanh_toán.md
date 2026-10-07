# Ghi chú xác nhận: Web Doanh nghiệp - Đơn hàng・Tồn kho・Thanh toán (lĩnh vực Doanh nghiệp A) — Ghi chú rà soát trước khi viết Thiết kế màn hình

Ngày: 2026-10-05 ／ Người rà: Claude (cloud, phiên `claude/elegant-gauss-ppbt0w`) ／ Giai đoạn A của `Kế_hoạch_chạy_song_song_Thiết_kế_màn_hình.md`.
Nguồn: code thật (`app/corp/page.tsx`, `app/corp/order/**`, `app/corp/stock`, `app/corp/bills`, `app/corp/deliveries/[id]`, `app/corp/_ui`, `app/corp/_docs`, `lib/corp/**`, `lib/domain/areas/{order,delivery,report}.ts`), `docs/決定台帳.md` (B・E・F), `docs/決定の受付簿.md`, `00_Quyết_định/Quyết_định_STEP5_Trả_lời_Web_doanh_nghiệp_20261001.md`, `Quyết_định_v2.3_Bổ_sung_Lịch_trang_chủ_doanh_nghiệp_20260929.md` (#54〜#62), `決定_法人Webアカウント_H1-H5`, `決定_STEP7_一覧の決まり`, `50_Đơn_hàng/Order-Spec-for-AI-Team.md`, `50_Đơn_hàng/Demo_đơn_hàng_hàng_tháng_Chênh_lệch_với_hợp_đồng_gói_20260930.md`, `40_Master_Phí_Thanh_toán/Quy_tắc_thanh_toán_Đặc_tả_v1.md`, `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Web_doanh_nghiệp_Quản_lý_cơ_sở_Đặc_tả_màn_hình_v1.md` §2-4・§2-5, `Thiết_kế_cơ_bản_Đề_xuất_định_nghĩa_tổng_thể_20261001.md` §10, `MessageList_WEB_20261001.csv`.

Quy ước: **[Q]** = cần hong trả lời ／ **[Việc tồn đọng]** = Sổ quyết định đã chốt, code chưa theo → thiết kế màn hình viết theo quyết định, ghi `demo_ok` ／ **[open]** = chưa ai quyết, hỏi khách ／ **[msg]** = câu chữ, xử lý ở giai đoạn B với dải ID Doanh nghiệp A (E300〜, Q200〜, S200〜, I200〜, W200〜).
**Không hỏi hong trực tiếp trong giai đoạn A** (quy tắc Kế hoạch chạy song song §2). Câu hỏi gom ở mục 2.

Login mẫu (`lib/domain/seed/account.ts`): CU00001 Doanh nghiệp (5 cơ sở), CU00871 Chi nhánh Osaka (Giao hàng ES・đơn hàng mặc định), CU00643 Trụ sở chính (ES Lite (máy bán hàng tự động)), CU00950 Yokohama (ES Standard・Giao hàng COOL), CU00961 Chiba (Giao hàng COOL・đã đăng ký), CU00902 Nagoya (tạm ngưng), CU00071 Michinoku Shoji (dùng thử), CU00031 Hikari Bussan (có sự cố chưa giải quyết), CU01310 (chỉ tham khảo). Mật khẩu bất kỳ. Ngày mẫu 2026-10-05; đổi bằng thanh DEMO.

---

## 1. Phạm vi và trạng thái (VIEWS) đề xuất

7 chức năng = 7 sheet (Book Web Doanh nghiệp). Screen Code theo Sổ quyết định E: `CW_<viết tắt chức năng>_<3 chữ số>`.

### 1-1. CW_HOME Trang chủ (`/corp`)

| Code | Trạng thái (id) | URL / cách tạo |
|---|---|---|
| CW_HOME_001 Trang chủ | 001 Tài khoản doanh nghiệp・tất cả cơ sở (tháng này) | CU00001, `/corp` |
| | 002 Tài khoản doanh nghiệp・lọc theo 1 cơ sở | select "Lọc theo cơ sở" |
| | 003 Tài khoản cơ sở | CU00871 |
| | 004 Tháng trước・tháng sau (ô lịch dự kiến) | ‹ › (2026-09 / 2026-11) |
| | 005 Ngoài phạm vi (toast) | ‹ ở tháng 9 |
| | 006 Cảnh báo chưa đặt hàng | Ngày DEMO 10/08〜10/15, cơ sở để mặc định |
| | 007 Lần giao cần xác nhận: có đề xuất | Trên Web Vận hành chuyển DD-20261005-0095 sang "Đề xuất ngày khác" |
| | 008 Lần giao cần xác nhận: đang kiểm tra tình trạng giao hàng | CU00031 |
| | 009 Huy hiệu trên ô lịch (giao một phần・đổi ngày・có đề xuất) | Chuyến 9/15 Osaka v.v. |
| | 010 Nhiều lần giao trong cùng một ngày (không mở được chi tiết) | CU00001 tất cả cơ sở (xem Q-H2) |
| | 011 Thông báo 0 mục／Lần giao cần xác nhận 0 mục | CU00001 ban đầu |
| | 012 Xuất CSV | Nút |

Dự kiến ≈ 35 mục (tiêu đề・cảnh báo・lịch・chú giải・thông báo・lần giao cần xác nhận・CSV).

### 1-2. CW_DLV Chi tiết lần giao (`/corp/deliveries/[id]`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_DLV_001 Chi tiết lần giao | 001 Dự kiến (có thể gửi yêu cầu) | Chuyến Osaka 11/24 |
| | 002 Dự kiến (đang yêu cầu) | Osaka 11/10 (DD-20261005-0095) |
| | 003 Dự kiến (đã quá hạn chốt) | Ngày DEMO 10/16〜 |
| | 004 Có đề xuất ngày khác (chấp nhận／từ chối) | Đề xuất trên Web Vận hành |
| | 005 Modal xác nhận từ chối | 004 → Từ chối |
| | 006 Đã xác nhận (chờ xuất hàng・bảng sản phẩm) | Osaka 10/13 DL-261012-0011 (dòng hàng thay thế) |
| | 007 Đang giao (có số vận đơn・giao hàng COOL) | Chiba・Yokohama đã xuất hàng |
| | 008 Đã giao (Giao hàng ES: người nhận・thu tiền) | Osaka 9/29 DL-260928-0014 |
| | 009 Đã giao một phần (thiếu hàng・các lần giao liên quan) | Osaka 9/15 |
| | 010 Đang kiểm tra tình trạng giao hàng | CU00031 Nhà máy Kawasaki |
| | 011 Chuyến vật tư | MO-2610-0012 |
| | 012 Yêu cầu đổi ngày giao (modal) | 001 → Nút |
| | 013 Lỗi nhập khi gửi yêu cầu | 012 khi chưa nhập |
| | 014 Không tìm thấy (ID của cơ sở khác) | CU00871 xem cơ sở khác |

≈ 60 mục.

### 1-3. CW_ORDER Đặt hàng sản phẩm (`/corp/order`, `/corp/order/ai`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_ORDER_001 Đặt hàng sản phẩm | 001 Thông thường (ES Lite (tủ lạnh)・hiển thị dạng thẻ) | CU00871 |
| | 002 Hiển thị dạng danh sách | Chuyển kiểu hiển thị |
| | 003 ES Standard (có đông lạnh) | Tab Yokohama／CU00950 |
| | 004 ES Lite (máy bán hàng tự động) (theo từng ô・lưu ý 50 sản phẩm) | CU00643 |
| | 005 Tạm ngưng | CU00902 |
| | 006 Dùng thử (chỉ tham khảo) | CU00071 |
| | 007 Cảnh báo chưa đặt hàng | DEMO 10/08〜 |
| | 008 Đã chốt | DEMO 10/16〜 |
| | 009 Chuyến không thể đặt do hàng thay thế | Khi cài đặt ALT ảnh hưởng đến chuyến tháng 11 (dữ liệu mẫu không xuất hiện) |
| | 010 Đang nhập (chưa đăng ký)・thanh thao tác hàng loạt | Đổi số lượng／tích chọn |
| | 011 Tìm kiếm 0 kết quả | Tìm kiếm |
| | 012 Đang trả lời khảo sát | Khảo sát → bắt đầu hướng dẫn |
| CW_ORDER_002 Modal | 013 Xác nhận hủy bỏ／014 Không thể đăng ký／015 Đăng ký hoàn tất／016 Chi tiết menu／017 Danh sách chỉ số／018 Lịch sử thay đổi／019 Cài đặt đơn hàng／020 Chọn phương pháp AI／021 Bắt đầu khảo sát／022 Khảo sát (đang trả lời) | Từng nút |
| CW_ORDER_003 AI (đề xuất tự động) | 023 Phân bổ đều／024 Tham chiếu dữ liệu quá khứ／025 Chat／026 Đề xuất không thể đăng ký／027 Xác nhận hủy bỏ | `/corp/order/ai?mode=even|past|chat` |

≈ 120 mục (chức năng lớn nhất của Web Doanh nghiệp).

### 1-4. CW_MAT Đặt vật tư (`/corp/order/materials`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_MAT_001 Đặt vật tư | 001 Thông thường／002 Tạm ngưng／003 Đang nhập／004 Lịch sử thay đổi | CU00871／CU00902 |

≈ 20 mục.

### 1-5. CW_HIST Lịch sử đặt hàng (`/corp/order/history`, `/[site]/[ym]`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_HIST_001 Lịch sử đặt hàng (danh sách) | 001 Đặt hàng sản phẩm／002 Đặt vật tư／003 0 kết quả／004 Tài khoản cơ sở／005 Phiếu giao hàng (modal) | Chuyển đổi・tìm kiếm |
| CW_HIST_002 Chi tiết lịch sử đặt hàng | 006 Tháng đang tiếp nhận (thay đổi đơn hàng)／007 Tháng đã qua／008 Dùng thử／009 Không xem được | `/corp/order/history/CU00871/2026-11` |

≈ 45 mục.

### 1-6. CW_STOCK Báo cáo kiểm kê (`/corp/stock`) (tên cũ "Kiểm tra tồn kho". Tên màn hình・tên menu là Báo cáo kiểm kê = Sổ quyết định E)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_STOCK_001 Kiểm tra tồn kho | 001 Tài khoản doanh nghiệp (tình trạng theo từng cơ sở + nhập liệu) | CU00001 → Chiba |
| | 002 Tài khoản cơ sở | CU00961 |
| | 003 Đang nhập (nhân viên phụ trách doanh nghiệp・kỳ này)／004 Lỗi nhập liệu | Chiba 2026-10 |
| | 005 Modal xác nhận báo cáo／006 Cảnh báo tăng mạnh／007 Chưa chọn người báo cáo | Báo cáo |
| | 008 Đã báo cáo (có thể đếm lại)／009 Đếm lại | Sau khi báo cáo |
| | 010 Cơ sở do tài xế kiểm tra (tham khảo) | Osaka・Trụ sở chính |
| | 011 Tháng đã qua - đã báo cáo／012 Tháng đã qua - chưa báo cáo (phí xử lý hành chính) | 2026-09 |
| | 013 Trước khi ký hợp đồng／014 Tạm ngưng／015 Kiểm tra tồn kho đầu kỳ tạm ngưng／016 Không kiểm tra | CU00071 2026-09／Nagoya từ 10/12 trở đi／Nagoya 2026-09／noStockCheck |
| | 017 Có sản phẩm đang trên đường giao／018 Dòng hủy bỏ・dự kiến hết hạn | seed |
| | 019 Xuất CSV | Nút |

≈ 50 mục.

### 1-7. CW_BILL Hóa đơn (`/corp/bills`, `/corp/bills/[no]`)

| Code | Trạng thái | URL / cách tạo |
|---|---|---|
| CW_BILL_001 Hóa đơn (danh sách) | 001 Tài khoản doanh nghiệp／002 Tài khoản cơ sở (bên nhận hóa đơn = doanh nghiệp・phần của cơ sở này)／003 Tài khoản cơ sở (bên nhận hóa đơn = cơ sở)／004 0 kết quả／005 Xuất CSV | CU00001／CU00871／CU00961 |
| CW_BILL_002 Chi tiết hóa đơn | 006 Gửi doanh nghiệp (cột cơ sở・có xuất lại hóa đơn)／007 Gửi cơ sở／008 Chi tiết hóa đơn gửi doanh nghiệp (tham khảo・từ cơ sở)／009 Lỗi gửi／010 Đã chuyển kỳ／011 Hóa đơn cuối cùng／012 Không tìm thấy | INV-2026100001／0015／CU00871／0016／INV-2026080001 |

≈ 55 mục.

**Tổng dự kiến ≈ 385 mục, 7 sheet.**

---

## 2. Điểm cần hong quyết định [Q] — **đã trả lời hết 2026-10-05** (dòng Trả lời ở mỗi câu, ghi Sổ quyết định E). Giai đoạn B có thể bắt đầu.

Gom theo chức năng. Mỗi câu: trích dẫn, lựa chọn, đề xuất. Câu đánh dấu ★ ảnh hưởng nhiều màn, nên trả lời trước.

### Chung

**Q-C1 ★ Tên hệ thống trong câu chữ của Web Doanh nghiệp.** Code dùng lẫn "ES Kitchen" (hầu hết), "ESSTATION" (chatbot, chi tiết hóa đơn), "ES STATION". Message List dùng "Quầy hỗ trợ ES Kitchen", mail sender "[ES Station] Vận hành ES Kitchen". `message_style.md` chưa có mục này.
- A. "ES Kitchen" thống nhất cho câu chữ hướng khách (Vận hành = "ES Kitchen") ／ B. "ES STATION".
- Đề xuất **A** (khớp Message List và mail). Ghi vào `message_style.md` §2-7 Thuật ngữ.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** "ES Kitchen" = tên khách (công ty vận hành), "ES STATION" = tên hệ thống. Không phải A/B: dùng cả hai đúng vai. Ghi vào Sổ quyết định E và message_style.

**Q-C2 ★ Trạng thái chỉ tham khảo (sau khi hủy hợp đồng) và tạm dừng.** Thiết kế cơ bản §10-7-3: sau khi hủy hợp đồng = chỉ tham khảo. Code: Trang chủ・Chi tiết lần giao・Đơn hàng hàng tháng・Kiểm tra tồn kho không chặn gì (vẫn đăng ký được), chỉ Quản lý cơ sở・Hóa đơn hiện banner. → Việc tồn đọng của code. **Hỏi:** chế độ chỉ tham khảo có được làm 3 việc này không: ① Yêu cầu đổi ngày giao ② Báo cáo kiểm tra tồn kho (hóa đơn cuối cần chênh lệch tồn kho) ③ Đặt vật tư.
- Đề xuất: ① không ② **có** (cần cho hóa đơn cuối cùng, Quy tắc thanh toán 3-5) ③ không.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất: ① không ② **có** (Báo cáo kiểm kê) ③ không. Nguồn trạng thái chỉ tham khảo: Quy tắc thanh toán 3-7, Thiết kế cơ bản §10-7-3.

**Q-C3 Nút "Xuất CSV" trên Trang chủ (lần giao) và Kiểm tra tồn kho・Hóa đơn・Lịch sử đặt hàng.** `CSV入出力_定義` dòng 148 đã có ✅ cho doanh nghiệp (Trang chủ・Hóa đơn・Lịch sử đặt hàng・Kiểm tra tồn kho). Chỉ xác nhận: cột CSV của Trang chủ hiện có ID giao hàng gốc・số vận đơn・hàng thay thế (18 cột). OK giữ nguyên? Đề xuất **giữ**, viết theo P-CSV-OUT.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

### Trang chủ (CW_HOME)

**Q-H1 "Cập nhật lần cuối {ngày} 03:00" ở tiêu đề.** Code ghi cứng "03:00" (`page.tsx:95`); không có quyết định nào về cập nhật lần cuối trên Trang chủ. Đề xuất **bỏ** (dữ liệu là realtime, không có batch 03:00 cho Trang chủ; batch hằng ngày là 0:00／9:00 theo Sổ quyết định E).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-H2 Một ngày có nhiều lần giao (tài khoản doanh nghiệp・tất cả cơ sở).** Quyết định #54 "Bấm vào ô thì mở chi tiết của lần giao đó". Code: nhiều lần giao cùng ngày → không mở được, chỉ toast.
- A. Bấm ô → popover liệt kê các lần giao trong ngày (cơ sở・nhóm nhiệt độ・trạng thái), chọn 1 → chi tiết ／ B. Mở lần giao đầu tiên ／ C. Giữ như code (bắt lọc cơ sở trước).
- Đề xuất **A**.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-H3 "Lần giao cần xác nhận" có 4 loại theo quyết định #58** (① Đề xuất ngày khác ② Không đến・bị chậm ③ Kết quả yêu cầu 14 ngày ④ Lần giao có thể yêu cầu 3 tuần trước). Code chỉ có ① và ② (đang xác nhận sự cố). ③④ là việc tồn đọng của code. **Hỏi:** giữ đủ 4 loại? Đề xuất **giữ 4** như #58 (đã quyết 2026/09/29, không thấy thay đổi).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

### Chi tiết lần giao (CW_DLV)

**Q-D1 Tên công ty vận chuyển trong link vận đơn.** Quyết định #56: "Hiển thị số vận đơn và link đến trang tra cứu. **Không tạo cột tên công ty vận chuyển**". Code: link "Trang tra cứu của {công ty vận chuyển} ↗" và chú thích "Trang tra cứu của công ty vận chuyển (Yamato Transport)".
- A. Cho phép tên hãng trong text link (không có cột riêng) ／ B. Link ghi "Trang tra cứu" không tên hãng.
- Đề xuất **A** (khách bấm vào trang Yamato thì cũng thấy tên; #56 chỉ cấm cột công ty vận chuyển).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-D2 Doanh nghiệp có rút lại được yêu cầu thay đổi không.** Quyết định #59: "Rút lại" là [Đề xuất]・chờ xác nhận. Code có trạng thái rút lại trong CR_TONE nhưng không có nút. Đề xuất **có**, chỉ khi đang yêu cầu (chưa đề xuất・chưa xử lý), nút ở lịch sử yêu cầu; cùng quy tắc H2 (tài khoản cơ sở không rút lại được yêu cầu của tài khoản doanh nghiệp).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-D3 Nút Phiếu giao hàng (PDF) trên Chi tiết lần giao.** Quyết định STEP5 §2-6: Phiếu giao hàng đặt ở **dòng Lịch sử đặt hàng (cơ sở × tháng đối tượng)**, theo tháng・cơ sở, trừ vật tư. Code có cả ở Chi tiết lần giao (theo từng chuyến) và Lịch sử đặt hàng. Đề xuất **bỏ ở Chi tiết lần giao**, giữ Lịch sử đặt hàng (đúng quyết định, tránh 2 loại phiếu giao hàng).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-D4 Ngày không chọn được trong yêu cầu thay đổi.** Quyết định #57: "Những ngày không chọn được (thứ không thể giao・ngày giao hiện tại v.v.) thì không bấm được". Code: chặn thứ Bảy・Chủ nhật + ngày giao hiện tại; chú thích lại ghi "Không thể giao vào ngày lễ・thứ Hai"; ngày lễ chỉ chặn ở server. **Hỏi:** quy tắc thứ không thể giao của doanh nghiệp là gì (ngày không thể giao toàn công ty + thứ không thể giao của cơ sở từ hợp đồng con?). Đề xuất: chặn = Master ngày nghỉ toàn công ty + thứ không thể giao của cơ sở (cài đặt tuyến giao hàng) + ngày giao hiện tại; không ghi cứng thứ Hai.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

### Đặt hàng sản phẩm (CW_ORDER)

**Q-O1 ★ Điều kiện đăng ký: tổng = số lượng gói hay ≦.** Order-Spec §4.3 "Tổng tất cả các lần ship = số lượng tối đa của Plan" và §4.4 "Max tổng ≤ Plan", "chênh lệch giữa các lần ship ≤ ±1" (bắt buộc khi Lưu). Chênh lệch bản demo đơn hàng hàng tháng Q1 (hong 2026/09/30): đông lạnh・lạnh "tự do trong phạm vi giới hạn trên・dưới". Code: cho đăng ký khi tổng ≦ số lượng gói (thiếu vẫn được, chỉ đỏ), **không** kiểm ±1 giữa các chuyến, giới hạn dưới luôn 0.
- A. **Tổng = số lượng gói bắt buộc**, mỗi nhóm nhiệt độ trong khoảng giới hạn dưới〜giới hạn trên (giới hạn dưới đông lạnh theo hợp đồng con), chênh lệch giữa các chuyến ≦ ±1 → chặn ／ B. Như code (≦, không ±1) ／ C. = bắt buộc, ±1 chỉ cảnh báo.
- Đề xuất **A** (vì tiền gói là theo số lượng cố định; Order-Spec ghi bắt buộc khi Lưu; ±1 từ 2026/07/24). Ảnh hưởng đề xuất AI và đơn hàng mặc định.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** **A**. Tổng = số lượng gói bắt buộc, nhóm nhiệt độ giới hạn dưới〜giới hạn trên, chênh lệch giữa các chuyến ±1 → chặn.

**Q-O2 ★ AI (đề xuất tự động) có 3 kiểu: phân bổ đều／dữ liệu quá khứ／chat.** Quyết định STEP5 §2-4・2-5: AI dùng đơn hàng quá khứ・tỷ lệ hủy bỏ・tồn kho; "áp dụng từ lần sau" thay cho chế độ AI. **Không có quyết định về chat** và phân bổ đều. Code: cả 3 chạy trong trình duyệt (chưa gọi AI team).
- A. Giữ 3 kiểu ／ B. Chỉ dữ liệu quá khứ (= AI của AI team) + phân bổ đều là fallback khi chưa có lịch sử ／ C. Chỉ dữ liệu quá khứ.
- Đề xuất **B**. Chat để phase sau (ghi tham khảo). Cần hong xác nhận với AI team.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** **A** giữ cả 3 (phân bổ đều／dữ liệu quá khứ／chat).

**Q-O3 Khảo sát nhân viên (hướng dẫn・15 món・điểm).** Code có bắt đầu khảo sát (ngày chốt), điểm = "Muốn ăn 2 điểm・Quan tâm 1 điểm [cần xác nhận]", 1 người 15 món, số lượt trả lời 41 ghi cứng. Sổ quyết định E chỉ có "'Tất cả' trong khảo sát loại trừ người dùng của cơ sở đang tạm ngưng". Vận hành F (quản lý khảo sát) đang làm ghi chú ở phiên khác. **Hỏi:** ① tính năng khảo sát trong Đặt hàng sản phẩm có thuộc phạm vi phase 2 không ② cách tính điểm ③ 15 món. Đề xuất: ① có (có màn Vận hành), ② 2 điểm/1 điểm như code, ③ 15 món — nhưng cần khớp với ghi chú Vận hành F.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-O4 Máy bán hàng tự động vượt 50 sản phẩm/chuyến thì chặn hay chỉ cảnh báo.** Order-Spec §4.5 "Cảnh báo (KHÔNG chặn)", "sức chứa máy chỉ tham khảo, ưu tiên Plan". Code: cảnh báo. Đề xuất **cảnh báo** (như code, khớp Order-Spec). Riêng cột băng chuyền vượt → cảnh báo (Order-Spec §4.5).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-O5 Nhãn giá "Giá niêm yết N yên".** Code không ghi đã gồm thuế/chưa thuế; Sản phẩm.Giá bán là đã gồm thuế (`types.ts:444`); Cài đặt đơn hàng・AI ghi "Số tiền (đã gồm thuế)". Thiết kế cơ bản §10-5: ghi rõ số tiền chưa thuế hay đã gồm thuế trong tên mục. Đề xuất **"Giá niêm yết (đã gồm thuế)"** mọi chỗ.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-O6 Giá trị ban đầu của Đặt vật tư.** Code: số của lần đặt gần nhất trong tháng, không có thì MAT_BASE ("số lượng tạm của demo"). STEP5 Q2: vật tư đặt bất cứ lúc nào. Đề xuất **0 tất cả** (mỗi lần đặt là 1 chuyến vật tư riêng; tránh đặt nhầm số cũ).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-O7 Xác nhận trước khi đăng ký Đặt vật tư từ lần 2 trở đi (có phí OP000036).** Code: không có hộp xác nhận; đăng ký thẳng. Đề xuất **có modal xác nhận** khi là lần 2+ trong chu kỳ tháng: "Do là lần đặt vật tư thứ 2 trở đi, sẽ phát sinh phí giao hàng bổ sung vật tư (¥{n}・chưa thuế). Bạn có muốn đặt hàng không?" (msg mới).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-O8 Cơ sở dùng thử có Đặt vật tư được không.** STEP5 T3: đơn hàng dùng thử do hệ thống tự tạo, doanh nghiệp chỉ xem; bộ ban đầu tự động. Code chặn Đặt hàng sản phẩm nhưng **không chặn Đặt vật tư**. Đề xuất **không cho** (chỉ tham khảo như Đặt hàng sản phẩm); cần thì liên hệ Vận hành.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-O9 Thứ tự sắp xếp ban đầu của danh sách** (Sổ quyết định E: không ghi = ngày giờ cập nhật giảm dần). Đặt hàng sản phẩm: thứ tự menu (Vận hành đặt) ／ Lịch sử đặt hàng: năm tháng đối tượng giảm dần ／ Hóa đơn: ngày phát hành giảm dần ／ Kiểm tra tồn kho tình trạng theo cơ sở: ID cơ sở tăng dần. Đề xuất như vậy, ghi vào từng sheet.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

### Kiểm tra tồn kho (CW_STOCK)

**Q-S1 ★ Tên màn hình: "Kiểm tra tồn kho" hay "Báo cáo kiểm kê".** Sổ quyết định B "Tên màn hình・tên khoản phí: màn khai báo tồn kho là **"Báo cáo kiểm kê"**" (hong 2026-10-03) và Sổ quyết định E 131 "Báo cáo kiểm kê của Web Doanh nghiệp". Menu Web Doanh nghiệp (thứ tự quyết định 2026/10/03) và code: "Kiểm tra tồn kho". Spec 2-5 cũng "Kiểm tra tồn kho".
- A. Menu và tên màn hình đều "Báo cáo kiểm kê" ／ B. Menu "Kiểm tra tồn kho", nút/hành động "Báo cáo kiểm kê" ／ C. Giữ "Kiểm tra tồn kho" (Sổ quyết định B chỉ nói màn Vận hành).
- Đề xuất **B** (khách hiểu "Kiểm tra tồn kho" là việc phải làm; "Báo cáo kiểm kê" là tên của khai báo trong Vận hành). Nếu hong chọn A thì sửa menu + Message List.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** **"Báo cáo kiểm kê"** cho cả menu và tên màn hình (hong đã trả lời 2026-10-03, nay xác nhận). Screen Code giữ CW_STOCK, tên màn hình Báo cáo kiểm kê. Sửa menu, spec 2-5, Message List.

**Q-S2 ★ Mốc chưa báo cáo (phí xử lý hành chính ¥3,000): ngày 20 hay ngày 25.** Quyết định STEP5 §2-6 "Hiểu rằng việc phán định là tại thời điểm ngày 20 [cần xác nhận]"; spec 2-5 vẫn ghi hạn khai báo ngày 25 (chưa sửa theo §2-6 "Khách nhập đến ngày 20"). Code: ngày 20, từ ngày 21 là Vận hành. Đề xuất **ngày 20** (khớp code và §2-6), sửa spec 2-5.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** mốc chưa báo cáo (phí xử lý hành chính) = **ngày 25**; hạn nhập của khách trên Web Doanh nghiệp **giữ ngày 20** (21〜25 Vận hành nhập thay). Code: phán định ngày 20 → việc tồn đọng đổi sang ngày 25.

**Q-S3 Các cột của bảng kiểm tra.** Spec 2-5: số lượng kiểm tra lần trước・số lượng kiểm tra lần này (bắt buộc toàn bộ sản phẩm). Code (Danh sách vấn đề 4-6, C-g — Danh sách vấn đề chỉ có ở local): Sản phẩm・Kiểm tra lần trước・**Đang trên đường giao・Sẽ hủy bỏ・Số hiện có・Số đã vứt・Số đã đến**, chỉ hiện sản phẩm liên quan (lần trước・đã giao・đang trên đường giao・hủy bỏ), không thêm sản phẩm ngoài danh sách. Đề xuất **theo code** (quyết định 10/02〜03 trong Danh sách vấn đề), thiết kế màn hình ghi 7 cột; sửa spec 2-5. Xác nhận: doanh nghiệp **không** thêm sản phẩm ngoài danh sách (khác tài xế: thêm bằng quét).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-S4 Số tháng xem được.** Spec 2-5: kỳ này + 3 tháng trước (chỉ xem). Code: kỳ này + 1 tháng (ghi cứng 2026-10／2026-09). Đề xuất **kỳ này + 3 tháng trước** theo spec; "tình trạng theo từng cơ sở" theo tháng đang chọn (code luôn là tháng hiện tại).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-S5 Giới hạn 4 chữ số (≦9999) cho số hiện có.** Code ghi cứng; `input_standard.md` không có mục số lượng tồn kho. Đề xuất **giữ 4 chữ số** và thêm vào input_standard (Số lượng: 0〜9999).
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

### Hóa đơn (CW_BILL)

**Q-B1 ★ Trạng thái hóa đơn trên Web Doanh nghiệp.** Quyết định STEP2 Q6／Quy tắc thanh toán 1-6: Web Doanh nghiệp **3 giai đoạn Chưa xác định／Đã xác định／Đã thanh toán (đã xuất hóa đơn)**. Quy tắc thanh toán 5-5: **không** nhập thanh toán (đối soát). Code: Đã phát hành／Đã nhận tiền／Chưa nhận tiền／"Xuất lại bằng INV-…" (không thể có "đã nhận tiền" nếu không đối soát).
- A. Theo quyết định: danh sách chỉ có hóa đơn từ khi đã xác định trở đi → trạng thái = Đã xác định／Đã xuất hóa đơn (+ xuất lại là huy hiệu riêng), bỏ Đã nhận tiền・Chưa nhận tiền ／ B. Theo code (cần đối soát → đổi 5-5) ／ C. Đã xác định／Đã xuất hóa đơn／Có xuất lại.
- Đề xuất **A** (đúng 1-6 và 5-5). "Chưa xác định" không hiện vì chưa phát hành.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** **A**: Đã xác định／Đã xuất hóa đơn (+ huy hiệu Xuất lại). Bỏ Đã nhận tiền・Chưa nhận tiền.

**Q-B2 Hiển thị trạng thái gửi Bill One (Đang chuẩn bị gửi／Đã gửi qua email／Đã mở／Không gửi được) và log cho doanh nghiệp.** Không có trong quyết định (Vấn đề 0-2). Đề xuất **hiện 1 huy hiệu** (Đã gửi／Không gửi được) không hiện log mở; log chi tiết chỉ ở Vận hành.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-B3 Danh sách hóa đơn có tìm kiếm・phân trang không.** Quyết định STEP7 L2: mọi danh sách có sắp xếp・phân trang 10 mục. Code: không lọc, không phân trang. Đề xuất **có** theo P-LIST: điều kiện tháng thanh toán・bên nhận hóa đơn・trạng thái; trang 10 mục.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

**Q-B4 Chữ "Số tiền cố định (trả trước)" "Quyết toán theo thực tế sử dụng (trả sau)".** Sổ quyết định B 60: **không hiển thị** chữ "trả trước" "trả sau" (cả màn hình lẫn hóa đơn đều dùng "Số tiền cố định" "Quyết toán theo thực tế"). Code Web Doanh nghiệp vẫn ghi (trả trước)(trả sau) ở chú thích danh sách, số tiền thanh toán, phân loại chi tiết. → **Việc tồn đọng của code**, không cần hỏi; chỉ xác nhận tên hiển thị cho khách: "Số tiền cố định" "Quyết toán theo thực tế sử dụng". Đề xuất giữ "Quyết toán theo thực tế sử dụng" (dễ hiểu hơn "Quyết toán thực tế" với khách) — hong chọn.
- **Trả lời (hong 2026-10-05, Sổ quyết định E):** như đề xuất.

---

## 3. Code khác quyết định đã chốt → thiết kế màn hình viết theo quyết định, code là việc tồn đọng [Việc tồn đọng]

| # | Nội dung | Quyết định (đúng) | Code hiện tại |
|---|---|---|---|
| H1 | Phạm vi tháng của lịch: đến tháng đã tạo lịch dự kiến (tối đa 6 tháng sau) | #54 | `HOME_MONTHS` ghi cứng 3 tháng |
| H2 | Hiển thị ngày lễ giao hàng; ranh giới chu kỳ | #54, Master ngày nghỉ | `HOLIDAYS` 3 ngày, `cycleOf` ghi cứng (phần tháng 9 từ 9/07 ≠ a1 9/14) |
| H3 | Lần giao cần xác nhận 4 loại (③ kết quả yêu cầu 14 ngày ④ yêu cầu được 3 tuần trước) | #58 | chỉ ① ② (xem Q-H3) |
| H4 | Chú giải khớp huy hiệu thực tế; "Hủy giao hàng" negative | #42, #61 | Chú giải có Đang điều chỉnh ngày・Giao lại không bao giờ hiện; Hủy giao hàng là neutral |
| H5 | 0 kết quả "Không có lần giao nào cần xác nhận" | message riêng | dùng chung "Không có thông báo" |
| H6 | Trạng thái CSV = tên hiển thị trên màn hình | #42 | CSV "Dự kiến giao hàng" vs màn hình "Chờ xuất hàng" |
| D1 | "Không có ngày mong muốn (giao cho Vận hành quyết định)" được yêu cầu | #57 | server từ chối "Vui lòng chọn ngày mong muốn" (bug) |
| D2 | Sau khi từ chối: khung "Đã từ chối" + chờ Vận hành | #58, #62 | trạng thái về đang yêu cầu, khung không hiện, noApplyText sai "Đã quá hạn chốt" (bug) |
| D3 | Chi tiết chuyến vật tư: "Đây là lần giao vật tư (xem nội dung trong Đặt vật tư)" | — | bảng rỗng |
| D4 | Dự kiến có chi tiết (tháng 11 đã đăng ký): hiện danh sách sản phẩm chỉ sau hạn chốt | #56 | chú thích trống |
| D5 | Vận đơn: không có cột tên công ty vận chuyển; Giao hàng ES không có số | #56 | OK (xem Q-D1) |
| D6 | Q02 xác nhận khi rời đi toàn hệ thống | Sổ quyết định E | Đơn hàng hàng tháng không đăng ký leaveGuard → rời màn hình mất dữ liệu không hỏi |
| O1 | Đơn hàng mặc định = số tiêu chuẩn × tỷ lệ cơ bản × hệ số × cài đặt của cơ sở (danh mục・số tiền・loại trừ・hạn sử dụng ngắn) | 28-179, STEP5 §2-4 | chỉ áp dụng loại trừ・hạn sử dụng ngắn; danh mục・số tiền・applyNext không dùng |
| O2 | "Áp dụng từ lần sau" ON: AI tạo bản nháp vào ngày bắt đầu tiếp nhận | STEP5 §2-5 | chưa có batch tạo bản nháp |
| O3 | Giới hạn dưới nhóm nhiệt độ (đông lạnh từ 1〜) từ snapshot hợp đồng con | 28-178, chênh lệch C2 | giới hạn dưới luôn 0 |
| O4 | Thẻ sản phẩm từ Master | Sổ quyết định F | ghi cứng 4 thẻ |
| O5 | Lọc sản phẩm theo kho picking | STEP5 §2-6 | OK; fallback "WH00001 Kho Kanto" ghi cứng |
| O6 | Biểu tượng nhóm nhiệt độ + chữ + màu | Bảng yêu cầu dòng 185 = A | chỉ chữ |
| O7 | PDF menu 2 loại (cho Lite／cho Standard), không cho Lite xem loại cho Standard | Sổ quyết định F | 1 PDF |
| O8 | Không có giới hạn trên cho mỗi sản phẩm | Sổ quyết định B 89 | OK (999 là giới hạn kỹ thuật của ô nhập) |
| O9 | Số mục hiển thị danh sách 10/20/50, ban đầu 10 | STEP7 L1 | per=12 giữ nguyên khi đổi sang danh sách |
| O10 | Toast "Tháng sau (2026-12)…" động | — | ghi cứng 2026-12 |
| O11 | Không hiển thị số tiền trong thống kê | 2026-07-28 | OK |
| M1 | "Số lần đặt vật tư tháng này n lần" đếm theo **tháng chu kỳ** (số lần giao chuyến vật tư) | STEP5 §2 Q2 | đếm theo tháng dương lịch |
| M2 | Tên hiển thị vật tư 3 loại course; Master vật tư × gói | 28-184, 28-129 | cơ bản OK; MAT_BASE tạm |
| T1 | Phiếu giao hàng: theo tháng・cơ sở, trừ vật tư, PDF template hiện hành, ngắt trang | STEP5 Q5, dòng 178 | modal demo, chưa có PDF; ghi chú hàng thay thế ghi cứng CU00871 |
| T2 | Lựa chọn tháng đối tượng lấy từ menu/hợp đồng | — | `MONTHS` ghi cứng 2026-04〜11; công thức ID menu ghi cứng |
| T3 | Chi tiết tháng tạm ngưng: không hiện "Thay đổi đơn hàng" | — | truy cập URL trực tiếp vẫn hiện |
| S1 | Tháng đối tượng kỳ này + 3 tháng; tình trạng theo cơ sở theo tháng đã chọn | spec 2-5 | ghi cứng 2 tháng (xem Q-S4) |
| S2 | Vận hành đã xác nhận → doanh nghiệp không sửa; UI ẩn nút đếm lại | report.ts | UI vẫn hiện nút, lưu mới báo lỗi |
| S3 | Hậu tố người báo cáo / phương pháp báo cáo cho tháng pauseCheck của Giao hàng ES | Sổ quyết định E | "Tài xế Giao hàng ES (tài khoản doanh nghiệp)" sai |
| S4 | Lỗi server dùng tên sản phẩm, không dùng productId | message_style | `{productId}：…` |
| S5 | Thông báo thu hồi hàng thay thế từ dữ liệu ALT | Quyết định_hàng thay thế Q-ALT8 | ghi cứng CU00871／2026-10 |
| S6 | Spec 2-5 "hạn khai báo ngày 25" → ngày 20; thống nhất "khai báo" → "báo cáo" | STEP5 §2-6 | spec chưa sửa; comment code ghi khai báo, UI ghi báo cáo |
| B1 | Bỏ chữ (trả trước)(trả sau) | Sổ quyết định B 60 | vẫn còn (xem Q-B4) |
| B2 | Trạng thái 3 giai đoạn | 1-6 | Đã phát hành／Đã nhận tiền／Chưa nhận tiền (xem Q-B1) |
| B3 | Danh sách: tìm kiếm・phân trang | STEP7 L1・L2 | không có |
| B4 | Dòng điều chỉnh → phân loại "Điều chỉnh" (③ chi tiết điều chỉnh) | Hợp đồng_06, 2-14 | gộp vào số tiền cố định |
| B5 | "Không tìm thấy hóa đơn" có khung EmptyState | DS | plain text |
| B6 | Chữ thuế suất "8%／10%" ghi cứng trong chú thích chi tiết | Sổ quyết định E 141 (bất kỳ thuế suất nào trong Master thuế suất) | ghi cứng |
| C1 | Chỉ tham khảo・tạm dừng thì chặn thao tác (xem Q-C2) | §10-7-3 | không chặn |
| C2 | Mật khẩu 〔tạm〕 từ 8 ký tự gồm chữ và số | Message List "Từ 8 ký tự gồm chữ cái・số" | OK; bỏ 〔tạm〕 (thuộc Doanh nghiệp B) |

---

## 4. Giá trị chưa chốt với khách [open]

| # | Mục | Ghi chú |
|---|---|---|
| O1 | OP000036 Số tiền giao hàng bổ sung vật tư | tạm ¥2,000／lần (STEP5 §2-5). Hiện ở Đặt vật tư・Lịch sử đặt hàng |
| O2 | Số lần giao tiêu chuẩn・số lượng giao mỗi lần của đông lạnh | tạm "giống lạnh" (28-157) |
| O3 | Mục tiêu đơn giá trung bình (chỉ Vận hành, không hiện cho doanh nghiệp) | — (không thuộc Doanh nghiệp A) |
| O4 | Phạm vi cho phép chênh lệch tồn kho (miễn trách) hiển thị trong chú thích Kiểm tra tồn kho | Số tiền miễn trách theo đơn vị gói (Phụ lục §6 ⑤), giá trị theo Master gói; chú thích hiện tại không ghi số |
| O5 | Phí phạt chưa kiểm tra ¥3,000 (quyết định 2026/08/25) | đã quyết, chỉ xác nhận khi báo giá |

---

## 5. Message [msg] — xử lý ở giai đoạn B (dải Doanh nghiệp A: E300〜329, Q200〜209, S200〜, I200〜, W200〜)

Đã có trong `_Chung_Thông_báo.py` (dùng ID chung, câu ja_c):
- Q02 Xác nhận khi rời đi (code "Bạn có muốn hủy nội dung chỉnh sửa không？／Nội dung đang chỉnh sửa sẽ không được lưu. …" → thống nhất Q02)
- I01 0 kết quả (code "Không có sản phẩm phù hợp điều kiện" "Chưa có hóa đơn nào" "Không có đơn đặt vật tư" → I01 + câu riêng nếu cần)
- S01 Lưu (Cài đặt đơn hàng), E32 Không có quyền (403 "Không xem được đơn hàng của cơ sở này"), E30 Lỗi kết nối ("Kết nối thất bại. Vui lòng thử lại sau một lúc" ≠ E30 → thống nhất E30)
- P-CSV-OUT: "Đã xuất CSV ({n} dòng)" → S mới chung? (đề xuất thêm S12 chung ở phiên gộp)

Cần thêm (ID tạm, ja_c theo message_style):

| ID tạm | Tình huống | Nội dung (từ code, cần rút ≦ 40 ký tự nếu là toast) |
|---|---|---|
| NEW-CORPA-01 W | Trang chủ・Đặt hàng sản phẩm: cảnh báo hạn chốt | "Đơn hàng tháng {tháng} chưa được nhập (hạn chốt {ngày}・còn {n} ngày)" + nội dung |
| NEW-CORPA-02 I | Đặt hàng sản phẩm: thời gian tiếp nhận | "Thời gian tiếp nhận {from}〜{to} (còn {n} ngày)"／"(đã chốt)" |
| NEW-CORPA-03 E | Không thể đăng ký (modal) | Danh sách điều kiện: tổng・nhóm nhiệt độ・chênh lệch giữa các chuyến (phụ thuộc Q-O1) |
| NEW-CORPA-04 S | Đã đăng ký đơn hàng | "Đã đăng ký đơn hàng. Bạn có muốn tiếp tục đặt vật tư không?" (modal) |
| NEW-CORPA-05 E | Ngoài thời gian tiếp nhận | "Không thể đăng ký vì đã hết thời gian tiếp nhận." |
| NEW-CORPA-06 I | Tạm ngưng | "Cơ sở này đang tạm ngưng. …" |
| NEW-CORPA-07 I | Dùng thử chỉ tham khảo | "Đơn hàng đang dùng thử (chỉ tham khảo)…" |
| NEW-CORPA-08 W | Máy bán hàng tự động vượt 50 sản phẩm | "Sản phẩm của máy bán hàng tự động tối đa 50 sản phẩm cho mỗi lần giao" |
| NEW-CORPA-09 W | Chuyến không thể đặt do hàng thay thế | "Có chuyến không thể đặt hàng do sản phẩm bị lỗi" |
| NEW-CORPA-10 S | Phản ánh AI | "Đã phản ánh AI (đề xuất tự động) vào màn hình đặt hàng. Vui lòng kiểm tra nội dung rồi bấm "Đăng ký"" |
| NEW-CORPA-11 Q | Vật tư: xác nhận từ lần 2 trở đi | (Q-O7) |
| NEW-CORPA-12 S | Đăng ký đặt vật tư | "Đã đăng ký đặt vật tư." |
| NEW-CORPA-13 E | Vật tư: không có số lượng | "Vui lòng nhập số lượng đặt từ 1 trở lên." |
| NEW-CORPA-14 Q | Kiểm tra tồn kho: xác nhận báo cáo | "Bạn có muốn báo cáo kiểm tra tồn kho không？" + người báo cáo |
| NEW-CORPA-15 S | Kiểm tra tồn kho: đã báo cáo | "Đã báo cáo kiểm tra tồn kho." |
| NEW-CORPA-16 E | Kiểm tra tồn kho: chưa nhập／vượt số đã đến | 2 câu |
| NEW-CORPA-17 W | Tăng mạnh so với lần trước | "Vui lòng kiểm tra lại số lượng của các sản phẩm có ⚠…" |
| NEW-CORPA-18 E | Chưa chọn người báo cáo | "Vui lòng chọn người báo cáo." |
| NEW-CORPA-19 I/W/E | Kiểm tra tồn kho: 7 loại Inline theo trạng thái | Trước khi ký hợp đồng／Tạm ngưng／Tài xế kiểm tra／Không kiểm tra／Đã báo cáo／Vui lòng báo cáo／Chưa được báo cáo |
| NEW-CORPA-20 S | Tiếp nhận yêu cầu thay đổi | "Đã tiếp nhận yêu cầu thay đổi {id}…" |
| NEW-CORPA-21 E | Lỗi nhập yêu cầu thay đổi: 4 loại + server 6 loại | "Vui lòng chọn ngày muốn thay đổi." v.v. |
| NEW-CORPA-22 Q | Bạn có muốn từ chối đề xuất không？ | Modal |
| NEW-CORPA-23 S | Đã chấp nhận đề xuất／Đã từ chối | Toast 2 |
| NEW-CORPA-24 I | Hóa đơn: hướng dẫn Bill One | "Hóa đơn (PDF) sẽ được gửi từ Bill One" |
| NEW-CORPA-25 I | 5 loại lý do không thể yêu cầu thay đổi | noApplyText |

Message List WEB có sẵn để đối chiếu: No. "Không có dữ liệu để hiển thị." (I01), "Bạn có muốn hủy nội dung chỉnh sửa không？" (Q02), "Hợp đồng đã kết thúc vào {ngày}…chỉ tham khảo" (banner chỉ tham khảo), "Tài khoản này đã bị tạm dừng do hủy hợp đồng" (Đăng nhập, Doanh nghiệp B).

---

## 6. Những điểm đã khớp (không hỏi)

- Cảnh báo hạn chốt từ 7 ngày trước〜ngày chốt, Trang chủ + Đặt hàng sản phẩm, loại trừ dùng thử・tạm ngưng, không tắt ON/OFF (Sổ quyết định E 177) ✓
- Phạm vi nhìn thấy của tài khoản doanh nghiệp／cơ sở (#55, C3), adminOnly chỉ thông tin doanh nghiệp ✓; người yêu cầu chọn từ người phụ trách (C2) ✓ (người báo cáo của Kiểm tra tồn kho)
- Bố cục Trang chủ: trái Lịch, phải Thông báo + Lần giao cần xác nhận (#54) ✓; dự kiến huy hiệu info, dấu ngắn trên ô lịch (#61) ✓
- Nội dung Chi tiết lần giao theo #56・#60 (không ảnh・5 bước・picking・kho) ✓; yêu cầu thay đổi từ trang chi tiết, nguyện vọng 1・2, bắt buộc lý do, nửa đầu／nửa sau (#57) ✓; khung của doanh nghiệp Từ chối／Chấp nhận (#62) ✓
- Đặt hàng sản phẩm: không giới hạn trên mỗi sản phẩm ✓, giới hạn trên theo từng nhóm nhiệt độ ✓, hiển thị sản phẩm không vừa máy bán hàng tự động + ghi chú lưu ý ✓, lọc theo kho picking ✓, cài đặt hạn sử dụng ngắn doanh nghiệp chỉ tham khảo (REQ-CT-300) ✓, thống kê không có số tiền ✓, lịch sử thay đổi ✓, thông báo sau khi đăng ký ✓, chặn tạm ngưng・dùng thử ✓
- Vật tư: bất cứ lúc nào, bao gồm 1 lần/tháng, OP000036, bộ ban đầu không đếm ✓ (STEP5 Q2)
- Phiếu giao hàng ở Lịch sử đặt hàng, theo tháng・cơ sở, trừ vật tư ✓
- Kiểm tra tồn kho: nhiều lần đến ngày 20 ✓, từ ngày 21 Vận hành ✓, phí phạt ¥3,000 từ OP000016 ✓, tạm ngưng không kiểm tra (Sổ quyết định 3-1, override STEP5 Q3) ✓, kiểm tra tồn kho đầu kỳ tạm ngưng do khách (bao gồm Giao hàng ES) ✓, người báo cáo (Sổ tiếp nhận 44) ✓, hỗ trợ di động ✓, giữ lại họ tên người báo cáo ✓
- Hóa đơn: phát hành ngày 1 tháng sau ✓, phúc lợi ON 2 dòng/OFF 1 dòng ✓, cột theo thuế suất (Master thuế suất) ✓, làm tròn ✓, xuất lại đã gồm thuế ✓, phần của cơ sở này từ cơ sở ✓, chi tiết quyết toán thực tế ✓, Cài đặt thanh toán trên Web Doanh nghiệp chỉ tham khảo ✓, PDF từ Bill One ✓

---

## 7. Việc tiếp theo

1. hong trả lời mục 2 (ưu tiên ★: Q-C1, Q-C2, Q-O1, Q-O2, Q-S1, Q-S2, Q-B1) → phiên Trả lời ghi Sổ quyết định E + Sổ tiếp nhận, ghi Trả lời vào ghi chú này.
2. Giai đoạn B Doanh nghiệp A: viết 7 file `Dữ_liệu/CW_*.py`, `--check`, `npm run dev` + `--capture` (login CU00001／CU00871／CU00961), `--draft`.
3. Việc tồn đọng mục 3 → Sổ tiếp nhận (chờ triển khai) khi hong chấp nhận.

---

## 8. Giai đoạn B (2026-10-05): điểm tự quyết khi viết data — hong xác nhận một lượt

Data 7 file đã viết (`Dữ_liệu/CW_*.py`, 101 trạng thái, ≈470 mục), `--check` 0 lỗi. Những chỗ Sổ quyết định・ghi chú không nói, người viết đã chọn như dưới (đều có thể đổi nhanh trong data). Trả lời "như vậy" hoặc nêu số muốn đổi.

| # | Màn | Đã chọn | Ghi chú |
|---|---|---|---|
| B-1 | Chung | Toast Xuất CSV = message chung **S12** "Đã xuất CSV ({n} dòng)." | dùng ở Trang chủ・Lịch sử đặt hàng・Báo cáo kiểm kê・Hóa đơn |
| B-2 | Chung | ~~giữ theo code~~ **Trả lời: tách cột theo P-HIST** (hong 2026-10-05) | Việc tồn đọng của code |
| B-3 (Trả lời A, không thêm màn, xác nhận 2 lần) | Trang chủ | Popover khi 1 ngày nhiều lần giao: tiêu đề "Các lần giao ngày {ngày (thứ)}", dòng theo ID cơ sở tăng dần → lạnh → đông lạnh → vật tư | Q-H2 |
| B-4 (Trả lời ừa) | Trang chủ | Lần giao cần xác nhận loại ③④ (#58): huy hiệu "Yêu cầu" "Dự kiến", tiêu đề "Lần giao ngày {ngày}: đã có kết quả yêu cầu" "Lần giao ngày {ngày}: có thể yêu cầu đổi ngày giao" | code chưa có |
| B-5 (Trả lời "Đến danh sách yêu cầu đổi ngày giao") | Trang chủ | Link góc phải "Đến danh sách đăng ký" giữ theo code; quyết định #59 viết "Đến danh sách yêu cầu thay đổi" | hong chọn chữ |
| B-6 | Trang chủ | Nút "Đặt vật tư" ẩn với chỉ tham khảo và với doanh nghiệp dùng thử | **Trả lời: ẩn cả Đặt vật tư・Đặt hàng sản phẩm** (hong 2026-10-05) |
| B-7 (Trả lời 500 ký tự) | Chi tiết lần giao | Lý do của yêu cầu thay đổi = textarea 500 ký tự (input_standard ghi chú); code là 1 dòng không giới hạn | Việc tồn đọng của code |
| B-8 (Trả lời có toast S211) | Chi tiết lần giao | Sau khi rút lại không có toast riêng, chỉ đổi trạng thái dòng lịch sử | thiếu ID S; cấp thêm nếu muốn toast |
| B-9 (Trả lời bỏ modal, toast S212 + hướng dẫn I216) | Đặt hàng sản phẩm | Modal Đăng ký hoàn tất ("Hoàn tất" "Đến Đặt vật tư") để loại xác nhận **Q203**, không phải S | vì có 2 nút |
| B-10 (Trả lời 9999 (chuẩn chung)) | Đặt hàng sản phẩm | Số lượng theo từng chuyến giới hạn **0〜9999** (input_standard); code ô nhập tối đa 999 | 999 hay 9,999? |
| B-11 (Trả lời 10/20/50 cả thẻ) | Đặt hàng sản phẩm | Hiển thị thẻ 12/24/48 mục giữ như code; hiển thị danh sách 10/20/50 (STEP7) | STEP7 chỉ nói danh sách |
| B-12 (Trả lời giữ) | Đặt hàng sản phẩm | Xem trước đề xuất AI vẫn hiện tổng tiền "¥9,400" như code (2026-07-28 chỉ cấm ở thống kê) | bỏ không? |
| B-13 (Trả lời ừa) | Đặt hàng sản phẩm | Tên trạng thái "ES Kitchen đã nhập" (ES đã đăng ký)・"Đặt hàng tự động" (mặc định) theo code | |
| B-14 (Trả lời ừa) | Đặt hàng sản phẩm | Giới hạn dưới〜giới hạn trên của nhóm nhiệt độ trong "Không thể đăng ký" dùng E12 có sẵn; tổng = số lượng gói → E310; chênh lệch giữa các chuyến ±1 → E311 | |
| B-15 (Trả lời Chưa đặt hàng) | Đặt vật tư | Trạng thái cơ sở khi chưa đặt = "Chưa đặt hàng" (code đang hiện "Đặt hàng tự động", sai nghĩa) | Việc tồn đọng của code |
| B-16 (Trả lời bỏ tháng khỏi tiêu đề) | Đặt vật tư | Số lượng đặt 0〜999; tiêu đề "Đặt vật tư {tháng chu kỳ}" giữ như code | bỏ tháng khỏi tiêu đề? |
| B-17 (Trả lời ừa, lần 1 cũng hiện hướng dẫn) | Đặt vật tư | Q205 (xác nhận lần 2+) không ghi mã OP000036 trong câu (message_style: không đưa mã nội bộ cho khách), giá để {số tiền} | |
| B-18 (Trả lời cần) | Lịch sử đặt hàng | Tab Đặt vật tư: sắp xếp ngày đặt giảm dần, có phân trang 10 mục (P-LIST), tab giữ trong URL ?tab= (P-TAB) | code chưa có → Việc tồn đọng |
| B-19 (Trả lời ừa) | Chi tiết lịch sử đặt hàng | Phần vật tư hiện theo Số đơn đặt vật tư của tháng chu kỳ đó (code đang hiện số đang nhập) | Việc tồn đọng của code |
| B-20 (Trả lời Chưa báo cáo → Đã báo cáo → Không kiểm tra) | Báo cáo kiểm kê | "Tình trạng theo từng cơ sở" không áp P-LIST (ít dòng, ID cơ sở tăng dần) | |
| B-21 (Trả lời: cơ sở Giao hàng ES doanh nghiệp cũng báo cáo được・báo cáo cuối cùng có hiệu lực, Sổ quyết định E) | Báo cáo kiểm kê | E325 dùng chữ "ES STATION" ("Cơ sở này không phải cơ sở báo cáo trên ES STATION") theo Q-C1 | hay "Web Doanh nghiệp"? |
| B-22 (Trả lời ừa) | Hóa đơn | Điều kiện tìm (P-LIST): Tháng thanh toán (month) ／ Bên nhận hóa đơn (Tất cả／Gửi doanh nghiệp／Gửi cơ sở, chỉ tài khoản doanh nghiệp) ／ Trạng thái (Tất cả／Đã xác định／Đã xuất hóa đơn) | tên do người viết đặt |
| B-23 (Trả lời ừa) | Hóa đơn | Màu huy hiệu: Đã xác định = xanh dương, Đã xuất hóa đơn = xanh lá, Xuất lại = vàng (kèm số INV); Đã gửi = xanh dương, Không gửi được = đỏ | |
| B-24 (Trả lời 3 phân loại + loại) | Hóa đơn | Phân loại chi tiết 4 loại: Số tiền cố định／Quyết toán theo thực tế sử dụng／Điều chỉnh／Xuất lại | Việc tồn đọng B4 |

Trạng thái **không chụp được bằng seed hiện tại** (ảnh là màn thường, ghi chú nói rõ; chụp lại khi có dữ liệu): Trang chủ 007・009 (có đề xuất・đổi ngày: cần Vận hành thao tác DD-20261005-0095), Chi tiết lần giao 004・005 (đề xuất), 007 (đang giao: seed không có đã xuất hàng), Đặt hàng sản phẩm 009 (hàng thay thế tháng 11), Báo cáo kiểm kê 016 (không kiểm tra: cần Vận hành đặt), Hóa đơn 011 (hóa đơn cuối cùng: seed không có).


---

## 9. Đánh giá phiên bản 1.0 (hong 2026-10-05) → Phiên bản 1.1

hong xem 7 HTML phiên bản 1.0 và góp 35 điểm. Trả lời và quyết định ghi ở Sổ quyết định E (4 dòng "Đánh giá phiên bản 1.0 của Web Doanh nghiệp (…)", "Template phiếu giao hàng"), Sổ tiếp nhận No.153・154. Tóm tắt:

| Màn | Đổi |
|---|---|
| Trang chủ | Lịch／Thông báo chia nửa nửa + chuyển đổi độ rộng; bỏ Xuất CSV; bỏ Đặt vật tư; 1 khối "Vui lòng xác nhận" (cảnh báo hạn chốt + 4 loại #58) |
| Chi tiết lần giao | bỏ khung giờ nhận hàng・dự kiến đến; "Số vận đơn"; đang yêu cầu là bảng đủ cột; modal yêu cầu thay đổi kiểu lịch 2 bước; Phiếu giao hàng (PDF) theo chuyến (template Sổ quyết định) |
| Đặt hàng sản phẩm | Đăng ký chính／Hủy phụ／còn lại vào "Khác"; link PDF menu; khối phụ thu gọn, thanh tổng cố định; biểu tượng nhóm nhiệt độ + màu ở góc ảnh; ô hàng thay thế vô hiệu rõ; sau hạn chốt → Chi tiết lịch sử đặt hàng |
| Đặt vật tư | "Lần thứ n trong tháng này"; hướng dẫn 2 dòng; bỏ cột course; ngày giao dự kiến chỉ khi Vận hành nhập số vận đơn・ngày gửi hàng (No.154) |
| Lịch sử đặt hàng | ID menu: đang tiếp nhận → Đặt hàng sản phẩm, sau hạn chốt → chi tiết; template phiếu giao hàng |
| Báo cáo kiểm kê | màn "Danh sách kiểm kê" riêng (CW_STOCK_002); hết chữ Kiểm tra tồn kho; người báo cáo mặc định là người phụ trách chính; PDF dùng cho kiểm kê; thêm sản phẩm (quét JAN／tìm kiếm); bỏ cảnh báo tăng mạnh; modal xác nhận đơn giản |
| Hóa đơn | không hiện lỗi gửi cho khách; không tìm thấy = EmptyState chuẩn |

Trả lời câu hỏi: không tìm thấy chỉ khi URL sai; bỏ khung giờ nhận hàng・dự kiến đến; Đặt hàng sản phẩm và Lịch sử đặt hàng không trùng (sau hạn chốt chỉ còn chi tiết); sản phẩm không vừa máy bán hàng tự động đã có khung; danh sách kiểm kê tách màn riêng. Thời gian chờ (lead time) chuyến vật tư chưa có giá trị (OPEN).

### 9-1. Về ảnh của phiên bản 1.1 (2026-10-05)

- Data・câu chữ phiên bản 1.1 đã hoàn thành (`--check` OK). Code demo (Web Doanh nghiệp・Quản lý đặt vật tư Web Vận hành) cũng đã khớp phiên bản 1.1 (Sổ tiếp nhận No.153・154 đã triển khai・code 132e0a7).
- Ảnh (ảnh chụp màn hình có đánh số), ở thời điểm phiên bản 1.2, một phần vẫn là ảnh cũ của code phiên bản 1.0 (cache khi chụp). **Phiên bản 1.3 (2026-10-05) chụp lại toàn bộ bằng `--force`**, cả 7 màn đều là ảnh của code từ phiên bản 1.1 trở đi. 7 artifact cũng đã publish phiên bản 1.3 vào cùng URL.
- Những điều đã sửa khi chụp lại: Đặt hàng sản phẩm mở menu "Khác" rồi mới bấm Khảo sát・Xác nhận lịch sử thay đổi・Cài đặt đơn hàng・AI／Trang chủ 010 khôi phục tháng・cơ sở mà trạng thái trước đã ghi nhớ／Chi tiết lần giao 015 chèn thời gian chờ trong lúc chọn ngày (013 No.23.1 không chụp cùng lúc vào màn 013 nên là `demo_ok`)／trùng lặp `bb` của Báo cáo kiểm kê đã đưa vào khối. Chụp bằng **`NEXT_PUBLIC_DEMO=1 npm run dev` (cổng 3000 phải trống)**. Với bản build production `npm run build && npm run start`, Đặt hàng sản phẩm bị dừng ở trạng thái đang tải.
- Tiến độ (2026-10-05): phiên bản 1.3 đã hoàn thành (Sổ tiếp nhận No.156: phiếu giao hàng chỉ ở chi tiết lần giao・lịch sử thay đổi là tab・đã báo cáo・danh sách hóa đơn và bảng số tiền). Chụp bằng cách khởi động `NEXT_PUBLIC_DEMO=1 npm run dev` **khi cổng 3000 trống**, rồi chụp bằng `--capture --force` (nếu bản build production cũ đang dùng cổng 3000 thì Đặt hàng sản phẩm bị dừng ở trạng thái đang tải).
