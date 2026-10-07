# Định nghĩa Tùy chọn (Option)・Giảm giá (2026/10/03)

Mục đích: gom **mọi Tùy chọn / Giảm giá** về một định nghĩa duy nhất, ghi rõ **khi nào hệ thống phát sinh khoản tiền đó** (trigger) và **code hiện tại đang lấy ở đâu**.
Đây là tài liệu phân tích (chỉ đọc code, không sửa gì). Mọi số tiền "tạm" = chưa được khách xác nhận.

> **Lưu ý trạng thái code (10/03):** trong working tree của `07_開発` có thay đổi **chưa commit** do session khác đang làm: `lib/domain/seed/master.ts` (thêm `mgmtName` Tên quản lý, OP000016, OP000022 ¥5,000 tạm, OP000008 đổi invoiceName thành "Phí thủ tục"), `types.ts`, `lib/ops/masters/*`. Tài liệu này mô tả **trạng thái working tree hiện tại**; phần "commit gần nhất" khác ở: OP000016/OP000022 chưa có trong domain master, OP000008 tên "Phí khởi tạo".

Ký hiệu cột "Nguồn code": `M` = đọc master (đúng), `H` = hard-code (cần chuyển sang master), `D` = chỉ ở dữ liệu mẫu/demo.

---

## 0. Cấu trúc hiện tại (vì sao bị tách đôi)

| Nơi | Nội dung | Ghi chú |
|---|---|---|
| `lib/domain/seed/master.ts` OPTIONS / DISCOUNTS (L.100-114) | **Master chung (nguồn thật)**: OP000001/002/003/004/008/016/022/036 và DC000013/DC000021 | ① Mục phí của Hợp đồng con (`feesOf` trong `lib/domain/snapshot.ts:23-66`) và thanh toán đọc từ đây (chụp vào `cc.fees` khi tạo Hợp đồng con) |
| `lib/ops/masters/seedRows.ts` OPTIONS_ROWS / DISCOUNTS_ROWS | Danh sách mẫu của màn hình Master ops: OP000001〜036 (+ OP000005/011 đã Kết thúc・Đã xóa), DC000001〜013 | "giá trị của demo gốc" (HTML cũ). **Không** nối với tính tiền |
| `lib/ops/applications/intake.ts` L.305-329 (`MD_OPTS`, `MD_DISC`), `OP_ADD_YEN` L.209 | Danh sách chọn ở màn Tiếp nhận/Phê duyệt (ops) | Bản sao thứ 2 của danh sách ops |
| `lib/ops/contracts/forms.ts` | Dữ liệu mẫu hiển thị (ví dụ "OP000002 Phí sử dụng ES-QR (liên động loại A)") | Chỉ là chuỗi hiển thị |
| `lib/ops/billing/masters.ts` L.68-73 `DISCOUNTS` | DC000003/002/013/007 cho demo thanh toán cũ | `fromDomain.ts:223` luôn đặt `discIds: []` nên **không dùng trong dữ liệu thật** (chỉ demo độc lập). Còn lại `TRIAL_PLAN = 'ES000003'` (L.75) |
| `lib/corp/docs/apply/data.ts` L.95-105 `OPT_MASTER`, `DLV_ADD`; `lib/corp/sites/logic.ts:251`; `lib/corp/docs/logic.ts:120 PENALTY` | Danh sách / số tiền ở Web doanh nghiệp (form đăng ký, quản lý cơ sở, kiểm tra tồn kho) | Bản sao thứ 3 |

→ Một OP/DC có thể có **tối đa 4-5 bản sao** (domain / seedRows / intake / corp / billing demo). Mục tiêu của tài liệu: một nguồn = domain master.

---

## 1. Tùy chọn (Option) — bảng đầy đủ

Cột: **ID | Tên hiển thị trên hóa đơn | Tên quản lý (nội bộ) đề xuất | Loại (28-43/44) | Hàng tháng・Một lần | Số tiền (chưa thuế) | Thuế suất | Khi nào phát sinh (trigger) | Tự động / Vận hành làm tay | Nguồn code | Căn cứ quyết định**

Quy ước loại: **A = liên động với mục hợp đồng (do hệ thống định nghĩa. Không chọn được ở đăng ký mới・không xóa được. 28-43)** / **Không liên động**. Phí hàng tháng = liên tục, phí một lần・phí khởi tạo = chỉ 1 lần (28-44). Thuế: mặc định 10% (`TAX_STD`, `taxRateId`) trừ khi ghi khác.

### 1-A. Đã có trong domain master (8 mục)

| ID | Tên hiển thị trên hóa đơn | Tên quản lý (nội bộ) | Loại | Hàng tháng/Một lần | Số tiền | Thuế | Trigger (khi nào phát sinh) | Tự động? | Nguồn code | Căn cứ |
|---|---|---|---|---|---|---|---|---|---|---|
| **OP000001** | Thêm số lần giao hàng | Thêm số lần giao hàng | **A** (mục hợp đồng = số lần giao hàng) | Hàng tháng | ¥3,000 **／lần** | 10% | "Số lần vượt số lần giao hàng tiêu chuẩn theo từng nhóm nhiệt độ × 3,000 yên (hàng tháng)". Phần số lần trong thiết lập tuyến giao hàng của hợp đồng vượt số lần tiêu chuẩn của Master Gói (`plan_course.std_delivery_chilled/frozen`) **theo từng nhóm nhiệt độ**. **Không** bù trừ với nhóm nhiệt độ còn thiếu. Số lần giao hàng không thể bằng 0 | **Tự động** (tự dựng trong ① của Hợp đồng con) | `lifecycle.ts:44,316` (`EXTRA_DELIVERY_OPTION` **H** ID cố định, số lần `planChannels().extra` L.296-300) → `snapshot.ts:41-43` cộng `o.amountYen` **1 dòng・1 lần** **M (nhưng chưa nhân với số lần: §3-D5)**. `intake.ts:209` `OP_ADD_YEN=3000` **H**、`intake.ts:456` nhân ×need, `corp/docs/apply/data.ts:105` `DLV_ADD` **H**, `corp/sites/logic.ts:251` chuỗi ký tự **H** | 28-85 "Phần tổng vượt số lần giao hàng tiêu chuẩn của Master Gói sẽ tự dựng trong ① của Hợp đồng con dưới dạng Tùy chọn loại A…" / 28-154・28-156 (theo từng nhóm nhiệt độ・không bù trừ) `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` |
| **OP000002** | ES-QR | Phí sử dụng ES-QR | **A** (mục hợp đồng = sử dụng ES-QR) | Hàng tháng | ¥1,000 | 10% | Khi đặt mục hợp đồng ES-QR của cơ sở thành "sử dụng" thì phát sinh hàng tháng. Chọn Tùy chọn khi đăng ký = nghĩa là ES-QR "sử dụng". **Trả trước** (P6), nếu không kịp trả trước có thể chuyển sang hóa đơn tiếp theo. Khách hiện hữu được miễn phí thì ghi đè số tiền theo từng hợp đồng (0 yên) (REQ-CT-304) | Tự động (loại A・liên động với mục hợp đồng) **theo lý thuyết**. Hiện tại seed giữ `optionIds` và `allowEsqr` riêng rẽ (không có code liên động: §3-D8) | `seed/org.ts:183`(`optionIds: ['OP000002']`, `allowEsqr`)、`ops/areas/contracts.ts:141-155` (chỉ cập nhật cờ app), `corp/docs/apply/data.ts:95` **D/H** | `Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` "Phí sử dụng ES-QR là loại A… nghĩa là khi chọn thì đặt mục "ES-QR" của cơ sở thành "sử dụng"" / `決定_STEP3回答` (chi tiết trụ sở chính ¥53,000) / P6 `決定_STEP3追補_請求ルール` |
| **OP000003** | Chế độ khách (Guest mode) | Phí sử dụng chế độ khách | **A** (mục hợp đồng = chế độ khách) | Hàng tháng | ¥0 (cho đến khi quyết định số tiền. Danh sách ops là "nhập mỗi lần") | 10% | Khi đặt mục hợp đồng "Chế độ khách" của cơ sở thành "sử dụng". Hiện chưa định số tiền nên là 0 yên | Tự động (loại A) ※không có code liên động | `seed/master.ts:104`, `seedRows` là "nhập mỗi lần" (**không khớp** §3-D5) | `決定_STEP3追補_オプション値引きマスタの不足` O13 "Giữ OP000003 và đặt loại số tiền là "nhập mỗi lần" (cho đến khi quyết định số tiền)" |
| **OP000004** | Phí giao hàng khu vực | Phí giao hàng khu vực | Không liên động | Hàng tháng | ¥4,000 (mặc định. **Khác nhau theo từng cơ sở** = ghi đè số tiền) | 10% | Vận hành gắn vào ở "Điều chỉnh tùy chọn・giảm giá" của Hợp đồng con (tùy khu vực giao hàng). Trụ sở chính giống ES-QR, hàng tháng | **Vận hành gắn bằng tay** | `seed/org.ts:183` (chỉ có dữ liệu). Không có logic | `決定_STEP3回答` Q5' "Phí giao hàng khu vực ¥4,000" / `seedRows` "theo từng cơ sở" |
| **OP000008** | Phí thủ tục (※trên hóa đơn trùng tên với OP000016) | Phí khởi tạo | Không liên động | **Một lần** | ¥10,000 | 10% | "Chỉ 1 lần cho Hợp đồng con đầu tiên của lần triển khai mới" (phí khởi tạo **thanh toán trong tháng**). Phí khởi tạo của máy bán hàng tự động cũng dùng cùng Tùy chọn, số tiền theo từng hợp đồng (REQ-PM-055, giá trị ban đầu = Master Dòng máy) | **Vận hành gắn bằng tay** (thanh toán ③ điều chỉnh `kind:'init'`, tên・số tiền nhập tự do. **Không tham chiếu OP000008**) | `ops/billing/logic.ts:581-589` (phí khởi tạo của điều chỉnh tính trong tháng). **Không có** code đọc OP000008 của domain **H/D** | REQ-CT-182 "Phí khởi tạo tính trong tháng" / `プランマスタ_仕様まとめ.md` REQ-PM-055 / `未回答_確認待ち` Gói1-3 (trùng tên) |
| **OP000016** | Phí thủ tục | Chưa kiểm kê | Không liên động | Một lần | ¥3,000 | 10% | "Chưa nộp kiểm tra tồn kho đến ngày 20 (hạn chốt của khách hàng)". **Ngoại trừ**: tạm ngừng, không kiểm tra tồn kho, dùng thử. Dù từ ngày 21 trở đi vận hành nhập hộ thì phí thủ tục vẫn giữ nguyên. Không tạm giữ thanh toán. 1 dòng ở phía thanh toán sau của quyết toán thực tế | **Tự động** | `ops/billing/logic.ts:254` `penaltyOn`, `:269` xuất dòng. Số tiền là `S.cfg.penalty` (`billing/seed.ts:8 META.cfg.penalty=3000`) **H**. Web doanh nghiệp `corp/docs/logic.ts:120 PENALTY=3000` **H**. **Không đọc master OP000016** | MM_20261002_1200 §1-14 "Đổi "Phạt chưa thanh toán" → "Phí thủ tục"…chỉ đổi tên" / `決定_STEP5回答_法人Web` Q3 (tạm ngừng không thuộc đối tượng) / 2026/08/25 (¥3,000) / `シナリオ実行結果` B4 (dùng thử không thuộc đối tượng) |
| **OP000022** | Phí thu hồi thiết bị | Phí thu hồi thiết bị (1 máy) | Không liên động | Một lần | **¥5,000 / máy [Tạm]** (working tree. 28-54・danh sách ops・intake là **¥0**) | 10% | "Khi hủy hợp đồng và đặt thiết bị vào diện dự kiến thu hồi, số lượng máy thu hồi × số tiền này tự động ghi vào hóa đơn cuối (có thể sửa bằng điều chỉnh)" (note của master). ※Như comment bên trên, **có ý định nhưng xử lý hủy hợp đồng (`lifecycle.ts:724-738`) vẫn chưa xuất phí thu hồi**. "Thu hồi không mất phí" (comment L.382) | Tự động (dự kiến) / hiện tại vận hành nhập tay | `seed/master.ts:110` (working tree). Không có code bên sử dụng | 28-54 "Chuyển chi phí thu hồi của Master Dòng máy sang "Phí thu hồi thiết bị" của Master Tùy chọn (phí một lần・hiện tại 0 yên)" / `未回答_確認待ち` Gói1-1 (số tiền không có trong master → nhập tay) |
| **OP000036** | Giao hàng vật tư bổ sung | Giao hàng vật tư bổ sung (một lần・1 lần) | Không liên động | Một lần | **¥2,000 [Tạm]** | 10% | "Mỗi chuyến vật tư từ lần thứ 2 trở đi trong cùng một tháng (chu kỳ)". Vật tư có thể đặt bất kỳ lúc nào, 1 đơn = 1 chuyến vật tư. Đơn đầu tiên trong tháng miễn phí, từ lần thứ 2 mất phí. Các đơn đặt trong kỳ chốt (21 tháng trước〜20 tháng này) chỉ ghi vào thanh toán sau 1 lần | **Tự động** | `domain/areas/delivery.ts:594` `paid` = có đơn không bị hủy trong **cùng tháng dương lịch** (`orderedAt.slice(0,7)`) (**không phải tháng chu kỳ**: §3-D4). `ops/billing/fromDomain.ts:126-138` **M** (tên・số tiền từ `dm.master.options`). `ops/delivery/fromDomain.ts:685`, `ops/menu/fromDomain.ts:203`, `domain/areas/delivery.ts:605` cũng **M** | `決定_TechLeadレビュー回答_追補5` Q13 (¥2,000 là đúng・ghi đè ¥1,000 của STEP4 O-3・số tiền do khách xác nhận) / `決定_STEP4回答_配送` O-3 / `決定_STEP5回答_法人Web` §2-2 (bỏ OP000036・OP000013) |

### 1-B. Có căn cứ trong quyết định nhưng **chưa có** trong domain master

| ID | Tên hiển thị trên hóa đơn | Tên quản lý đề xuất | Loại | Hàng tháng/Một lần | Số tiền | Thuế | Trigger | Tự động/tay | Code hiện tại | Căn cứ |
|---|---|---|---|---|---|---|---|---|---|---|
| **OP000019** | Phí giao thiết bị (1 máy) | Phí giao thiết bị (1 máy) | Không liên động | Một lần | ¥4,800 | 10% | Giao hàng thay thế・thêm・thu hồi thiết bị (đề xuất "điều chỉnh thiết bị" khi phê duyệt, 1 máy). Đăng ký từ bảng tham khảo 28-16, số tiền thực tế có thể sửa ở điều chỉnh của Hợp đồng con | **Tự động đưa ra đề xuất・vận hành sửa được trước khi phê duyệt** | `lifecycle.ts:46 SWAP_FEE={one:4800,many:7800}` **H**, L.385・399. `ops/applications/intake.ts:308` **D** | 28-16 / 28-53 "Cước vận chuyển・phí công việc lưu trong Master Tùy chọn (phí một lần)" |
| **OP000020** | Phí giao thiết bị (từ 2 máy) | Phí giao thiết bị (từ 2 máy) | Không liên động | Một lần | ¥7,800 | 10% | Như trên, từ 2 máy | Như trên | Như trên | Như trên |
| **OP000021** | Phụ thu công việc cầu thang | Phụ thu công việc cầu thang | Không liên động | Một lần | ¥3,000 | 10% | Không có thang máy và từ tầng 3 trở lên (bảng tham khảo). Vận hành cộng vào đề xuất | **Vận hành cộng bằng tay** (chỉ là ghi chú của đề xuất. Code không cộng) | Chỉ chuỗi `basis` ở `lifecycle.ts:385` **H** | 28-16 "Không có thang máy từ tầng 3 trở lên + ¥3,000" |
| **OP000023** | Chênh lệch kích thước (hàng tháng) | Chênh lệch kích thước (hàng tháng) | Không liên động (quyết định theo chênh lệch) | Hàng tháng | Phí hàng tháng của dòng máy mới − phí hàng tháng của dòng máy cũ (chỉ khi dương) | 10% | Đổi kích thước tủ lạnh (đổi gói・đổi thiết bị). Giảm kích thước hoặc không dương thì không thu | **Tự động đưa ra đề xuất** (đề xuất điều chỉnh thiết bị) | `lifecycle.ts:389,407` (chuỗi `src:'サイズ差額'`. **Không tham chiếu OP000023**. Số tiền là `monthlyYen` của Master Dòng máy) | `決定_STEP3回答` Q4 "Thu phí khi đổi kích thước chỉ có OP000023 Chênh lệch kích thước (hàng tháng・chỉ khi dương)" |
| **OP000035** | Người dùng thanh toán tiền mặt | Người dùng thanh toán tiền mặt | **A** (mục hợp đồng = người dùng thanh toán tiền mặt) | Hàng tháng | ¥0 (tạm) | 10% | Khi đặt mục hợp đồng "Người dùng thanh toán tiền mặt" của cơ sở là "Cho phép" | Tự động (loại A) ※không có code liên động | `ops/areas/contracts.ts:155` chỉ cập nhật `allowCash`. Không có dòng master | `決定_STEP3追補_オプション値引きマスタの不足` §6 "Tạm thời đăng ký vào Tùy chọn với 0 yên (loại liên động A)" |
| **OP000007** | Lắp đặt hộ | Lắp đặt hộ (tủ lạnh) | Không liên động | Một lần | ¥15,000 (chỉ danh sách ops・**không có căn cứ số tiền**) | 10% | Khi doanh nghiệp chọn "lắp đặt hộ tủ lạnh" ở đăng ký mới・đơn thay đổi | Từ đơn đăng ký (doanh nghiệp chọn) → chi tiết thanh toán | `ops/applications/logic.ts:149` (chuỗi lựa chọn) **D** | Bảng yêu cầu dòng 156 (`Quyết_định_Trả_lời_phản_ánh_một_phần_bảng_yêu_cầu_20260930.md`) / RD-PM-076・RD-BL-071 |
| **OP000015** | Lắp đặt lại・Di dời | Lắp đặt lại・Di dời (di chuyển hàng) | Không liên động | Một lần | ¥8,000 (chỉ danh sách・không có căn cứ) | 10% | Lắp đặt lại・di dời thiết bị (bảng danh sách O6 "Di chuyển hàng" = OP000015 "giữ nguyên như hiện tại") | Vận hành gắn bằng tay | Chỉ danh sách **D** | `決定_STEP3追補_オプション値引きマスタの不足` §1 cuối "O6 Di chuyển hàng = OP000015… giữ nguyên như hiện tại" |
| **OP000010** | Đổi tủ lạnh (do khách) | Đổi tủ lạnh (do khách) | Không liên động | Một lần | Nhập mỗi lần | 10% | Khi đổi tủ lạnh vì lý do của khách | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung Q-A "Không bãi bỏ OP000010… đổi tên và ý nghĩa thành "Đổi tủ lạnh (do khách)" (một lần・nhập mỗi lần) và giữ lại" (sửa STEP3 trả lời Q4) |
| **OP000024** | Phí xuất động khẩn cấp | Phí xuất động khẩn cấp | Không liên động | Một lần | Nhập mỗi lần | 10% | Khi phát sinh xuất động khẩn cấp (vận hành phán đoán) | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (bảng danh sách E7・O1) |
| **OP000025/026/027** | Phí công việc đặc biệt (nâng tay／xử lý cần cẩu／khác) | Như bên trái | Không liên động | Một lần | Nhập mỗi lần | 10% | Khi phát sinh công việc đặc biệt lúc vận chuyển・lắp đặt máy bán hàng tự động | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (bảng danh sách B21〜B23・O2) |
| **OP000028** | Phí khảo sát nơi vận chuyển・lắp đặt | Như bên trái | Không liên động | Một lần | Nhập mỗi lần | 10% | Khi khảo sát hiện trường (xem trước) cho máy bán hàng tự động | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (B24・O3) |
| **OP000029** | Đổi do hỏng (cùng kích cỡ) | Như bên trái | Không liên động | Một lần | ¥0 | 10% | Khi tủ lạnh・tủ đông hỏng và đổi cùng loại (thanh toán là ghi nhận 0 yên) | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (E19・O5) |
| **OP000030** | Phí máy bán hàng tự động | Như bên trái | Không liên động | Hàng tháng | Nhập mỗi lần | 10% | Phí máy bán hàng tự động (hàng tháng). ※Có thể trùng vai trò với cho thuê máy bán hàng tự động (mới ở dưới) | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (yêu cầu dòng 113・O10) |
| **OP000031** | Phí mua đứt món ăn kèm | Như bên trái | Không liên động | Một lần | Nhập mỗi lần | 10% | Mua đứt món ăn kèm (liên kết với "mua đứt món ăn kèm" ở Phase3). ※"Mua đứt" **trùng** với chức năng khác phía sản phẩm (giá riêng của doanh nghiệp・thanh toán theo số lượng giao) | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (yêu cầu dòng 113・O10) / Danh sách vấn đề "Cần thêm 買取" |
| **OP000032** | Cho thuê tủ đông (khách hiện hữu) | Như bên trái | Không liên động | Hàng tháng | Nhập mỗi lần | 10% | Tiền thuê tủ đông của khách hiện hữu đã nâng từ Lite cũ lên Standard | **Đề xuất giảm giá chuyển đổi tự xuất** (`lifecycle.ts:414-416`, số tiền = `monthlyYen` của Master Dòng máy・tên "Tiền thuê tủ đông") → **vai trò gần như giống OP000032** | Chỉ danh sách **D** ／ Logic khác (`src:'冷凍庫の賃料'`) | STEP3 bổ sung §1 (dòng 174・danh sách mục master ứng viên 11) / Danh sách vấn đề 7-2 "Khách cũ nâng lên trả tiền thuê tủ đông (theo Master Dòng máy)" |
| **OP000033** | Phí khởi tạo tủ đông (khách hiện hữu) | Như bên trái | Không liên động | Một lần | ¥20,000 | 10% | Phí khởi tạo của trường hợp trên | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 (dòng 174・ứng viên 12). ※Yêu cầu dòng 174 vẫn là "DIPRO xác nhận" |
| **OP000034** | Giao hàng bổ sung (một lần・1 lần) | Như bên trái | Không liên động | Một lần | ¥5,000 | 10% | Khi vận hành được nhờ giao hàng bổ sung đơn lẻ (Q-B: thêm số lần giao hàng = khác với OP000001). Giao bổ sung vì hàng thay thế・bồi thường do ES chịu nên **không thu phí** | Vận hành tay | Chỉ danh sách **D** | STEP3 bổ sung §1 / Q-B (bảng danh sách E8) |
| **OP000014** | Dịch vụ chỉ định khung giờ giao hàng | Như bên trái | Không liên động | Hàng tháng | ¥2,000 | 10% | Khi doanh nghiệp chọn chỉ định khung giờ ở đăng ký | Từ đơn đăng ký | `corp/docs/apply/data.ts:96` **D** | `Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` §1 (đối tượng hiện tại ¥2,000) / K突き合わせ_20260930 K-26 |
| **OP000017** | Thay đổi decal máy bán hàng tự động | Như bên trái | Không liên động | Một lần | Báo giá riêng | 10% | Chỉ chọn được ở đăng ký khi là máy bán hàng tự động. Số tiền đưa vào Hợp đồng con theo báo giá | Từ đơn đăng ký | `corp/docs/apply/data.ts:97` **D** | `Quyết_định_v2.3_Bổ_sung_Form_đăng_ký_và_Master_20260929.md` §1 |
| **(Mới) Cho thuê máy bán hàng tự động** ※ID đề xuất OP000037 | Phí cho thuê máy bán hàng tự động (cần xác nhận) | Cho thuê máy bán hàng tự động | Không liên động | Hàng tháng | **Nhập theo từng hợp đồng**. Giá trị ban đầu = phí thuê hàng tháng của Master Dòng máy (ví dụ VM000001 ¥15,000 tạm) | 10% | Phí thuê hàng tháng của cơ sở có cho mượn máy bán hàng tự động | **Vận hành gắn ở Hợp đồng con, nhập số tiền theo từng hợp đồng** | **Không có**. `models.monthlyYen` của `seed/master.ts` và `ChildContract.fees` không có chỗ ghi đè riêng (`feesOf` cố định `o.amountYen`) **thiếu** | `プランマスタ_仕様まとめ.md` REQ-PM-054・`契約_詳細要件仕様.md` REQ-CT-303/304 |

### 1-C. Không có căn cứ quyết định, hoặc đã bãi bỏ (chỉ có trong danh sách ops)

| ID | Tên (danh sách ops) | Số tiền | Trạng thái | Nhận định |
|---|---|---|---|---|
| OP000009 | Phí giao lại | ¥1,500 | Đang dùng | **Không có căn cứ → cần xác nhận** (phí của sự cố giao lại? Không có ID trong quyết định・biên bản họp) |
| OP000012 | Phí quản lý thiết bị | ¥500 | Đang dùng | **Không có căn cứ → cần xác nhận** (ở `決定_STEP3回答` chỉ có "thống nhất ID lựa chọn OP000010 Phí quản lý thiết bị→OP000012", không có quyết định về số tiền・điều kiện phát sinh) |
| OP000018 | Lắp đặt tiêu chuẩn (đã gồm trong gói) | ¥0 | Đang dùng | **Không có căn cứ → cần xác nhận** ("đã gồm trong gói" không thành dòng thanh toán. Có thể không cần) |
| OP000013 | Bổ sung vật tư định kỳ | ¥1,500 | Tạm dừng | **Đã quyết định bãi bỏ** (`決定_STEP5回答_法人Web` Q-STEP3 "Không dùng OP000013") → chuyển sang Kết thúc và giữ lại |
| OP000011 | Báo cáo vận hành hàng tháng | ¥5,000 | Kết thúc | Đã kết thúc (đã bỏ khỏi form đăng ký). Giữ lại |
| OP000005 | Dịch vụ thu tiền mặt | ¥3,000 | Đã xóa | Không có căn cứ／đã xóa. Giữ lại (không tái sử dụng ID) |
| OP000006 | (Phí nâng cỡ) | — | Bãi bỏ | `決定_STEP3回答` H1 "OP000006 Phí nâng cỡ → bãi bỏ". Cũng không có trong danh sách |

### 1-D. Không phải Tùy chọn, nhưng là các mục phí hệ thống tự động thanh toán (chỉ có trong code・không có master)

| Mục phí | Khi nào | Nguồn số tiền | Thuế | Code |
|---|---|---|---|---|
| Tiền phạt vi phạm | Khi hủy hợp đồng mà còn thời gian sử dụng tối thiểu (1 hóa đơn cuối) | `recoveryYen × số tháng còn lại ÷ thời gian sử dụng tối thiểu × số máy` của Master Dòng máy (28-2) | 10% | `lifecycle.ts:672-735` (`addCharge kind:'違約金'`) |
| Chênh lệch thiết bị dùng thử | Từ dùng thử → triển khai chính thức, thiết bị lớn hơn tiêu chuẩn | Chênh lệch phí hàng tháng của dòng máy × thời gian sử dụng tối thiểu × số máy [Tạm], 1 lần ở hóa đơn đầu tiên của triển khai chính thức | 10% | `lifecycle.ts:410` |
| Phí hàng tháng thiết bị thêm | Thiết bị vượt tiêu chuẩn・thêm | Phí hàng tháng của Master Dòng máy × số máy (28-182) | 10% | `lifecycle.ts:392,407` |
| Tiền thuê tủ đông | Doanh nghiệp được giảm giá chuyển đổi Lite cũ→Standard | Phí hàng tháng của Master Dòng máy × số máy | 10% | `lifecycle.ts:414-416` |
| Chênh lệch quyết toán thực tế・Chênh lệch thu tiền mặt・Dòng hàng thay thế | Hàng tháng (thanh toán sau) | Phần vượt miễn trách tổn thất quản lý／chênh lệch tiền mặt／hàng thay thế (thay thế dùng đơn giá sản phẩm gốc). **8%** | 8% | `ops/billing/logic.ts:261-264` |
| Chi tiết điều chỉnh (điều chỉnh・spot・phí khởi tạo) | Vận hành nhập／tự động (khi tháng đã thanh toán thay đổi do đổi gói・tạm ngừng・hủy hợp đồng・hiệu chỉnh) | Nhập tự do／chênh lệch | Nhập | `ops/billing/logic.ts:581-589`、`fromDomain.ts:100-108` |
| Thanh toán theo năm (Y) | 12 tháng tại tháng bắt đầu | Phí hàng tháng × 12 | Từng dòng | `ops/billing/logic.ts` (`tim:'Y'`) |

→ Phương án đề xuất: "Phí khởi tạo" và "Phí spot" của ③ điều chỉnh sẽ theo dạng **chọn ID Tùy chọn rồi nhập số tiền**, giảm việc nhập tự do tên (§4).

---

## 2. Giảm giá (DISCOUNT)

Cột: **ID | Tên hiển thị trên hóa đơn | Đối tượng | Cách tính số tiền | Thời hạn・số lần | Cách xử lý thuế | trigger | Tự động/tay | Code hiện tại | Căn cứ**

### 2-A. Có trong domain master

| ID | Tên hiển thị trên hóa đơn | Đối tượng | Cách tính số tiền | Thời hạn・số lần | Cách xử lý thuế | Trigger | Tự động? | Code | Căn cứ |
|---|---|---|---|---|---|---|---|---|---|
| **DC000013** | Giảm giá chiến dịch dùng thử | **Phí gói** (domain) ／ toàn bộ thanh toán (danh sách ops・quyết định) | Phân loại tính toán "tham chiếu phí gói": phí hàng tháng tương ứng của Master Gói **gói 50 (ES000003)・tủ lạnh・Lite**. **Không vượt quá số tiền thanh toán (số tiền cố định)**. Không trừ quyết toán thực tế (tổn thất quản lý) (P8) | Thời gian dùng thử (tháng gia hạn cũng miễn phí). **1 lần cho mỗi doanh nghiệp** (nếu thanh toán theo từng cơ sở thì chỉ cơ sở đầu tiên) | Thuế suất giống gói (trừ tách theo phí cơ bản 10%／phần doanh nghiệp chịu 8%. "Không giữ thuế suất riêng cho giảm giá". **Quyết định 2026-10-05**: trừ theo đúng chi tiết gói 50: Sổ quyết định E) | "**Tự động gắn** vào Hợp đồng con có loại hợp đồng là chiến dịch dùng thử". Khi chuyển sang triển khai chính thức thì bị gỡ | **Tự động** | **domain**: `snapshot.ts:53-58` trừ **toàn bộ phí gói** (phần phí cơ bản + phần phúc lợi). Tham chiếu phí hàng tháng ES000003・giới hạn trên・1 lần mỗi doanh nghiệp **không có ở đây**. `lifecycle.ts:42,318-319,823,831,1079` (gắn・gỡ), `trial.ts:19,61` (gia hạn vẫn gắn, `TRIAL_DISCOUNT` **định nghĩa 2 lần H** với lifecycle). **ops/billing/logic.ts:148-169** (`TRIAL_PLAN` + 1 lần/doanh nghiệp + giới hạn trên) vì `discIds:[]` nên **không chạy (D)** | `決定_STEP3回答` Q3 ("tham chiếu phí gói") ／ `決定_STEP1回答_申込とサンプル` "toàn bộ thanh toán・100%・chỉ dùng thử・tự động… dù 1 doanh nghiệp có nhiều cơ sở cũng chỉ 1 lần" ／ `決定_STEP3追補` §3 mục của Master Giảm giá (giới hạn số lần・điều kiện tự gắn) ／ Danh sách vấn đề "gia hạn dùng thử…DC000013" |
| **DC000021** | Giảm giá chuyển đổi Lite cũ→Standard | Phí gói (chênh lệch phí cơ bản) | "Phí cơ bản = giá của ES Lite (tủ lạnh) cùng gói". Số tiền giảm = (giá course Standard − giá tủ lạnh Lite). Chỉ 1 dòng khi `price > lite`. Tiền thuê tủ đông tách riêng (phí hàng tháng của Master Dòng máy) | **Hàng tháng・mãi mãi** (cho đến khi vận hành gỡ khỏi hợp đồng). Chỉ doanh nghiệp・cơ sở đã tồn tại trước release. Hạn đăng ký có thể để trống (chưa chốt) | 10% (nếu có chỉ định `discountTax` thì theo đó, nếu không thì giống phí cơ bản). Chỉ 1 dòng chênh lệch | `migrate` gắn khi phê duyệt đổi gói (Lite→Standard). Khách Lite→Standard là đối tượng. **Không gắn cho hợp đồng Standard mới** | Tự động (luồng đổi gói gắn)／khoảng 800 cơ sở nhập hàng loạt bằng CSV (REQ-PM-033) | `lifecycle.ts:40 MIGRATE_DISCOUNT` (**H** hằng số), L.318-319 (gắn), L.424 `migrating`, `snapshot.ts:49-52` tính **M (rule:'liteBase')** | Danh sách vấn đề 7-2 "Nâng khách cũ Lite → Standard… giảm giá "Giảm giá chuyển đổi Lite cũ→Standard"" ／ 28-170 (đặc tả của DC000003 gốc) ／ note của `seed/master.ts:113` |

### 2-B. Có trong danh sách ops・demo thanh toán ops・intake nhưng **không có** trong domain

| ID | Tên | Đối tượng | Giá trị | Thời hạn | Căn cứ quyết định | Nhận định |
|---|---|---|---|---|---|---|
| **DC000003** | Chênh lệch nâng Standard (Lite→Standard・khách hiện hữu) | Phí gói | Tự động tính chênh lệch | Hàng tháng・mãi mãi | **28-170** (khoảng 800 cơ sở・giảm phần chênh lệch để miễn phí→"cùng số tiền với Lite"). Sau đó **DC000021 (giảm giá chuyển đổi) của 7-2 thay thế với cùng mục đích** | **Trùng lặp**. Chuyển DC000003 thành "Đã gộp (→DC000021)" và giữ lại ID hay không? (Q5) |
| **DC000002** | Giảm giá chiến dịch lần đầu | Phí gói | Số tiền cố định ¥3,000・3 tháng | Hàng tháng・3 tháng | `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` L.221 chỉ nhắc mã "Giảm giá chiến dịch lần đầu = DC000002" (không thấy quyết định về số tiền・điều kiện) | cần xác nhận (số tiền・điều kiện vẫn là demo) |
| DC000001 | Giảm giá đại lý (Partners・tỷ lệ) | Phí gói | 5% (tối đa 5,000 yên) | Mãi mãi | `決定_STEP3回答` H1 chỉ nhắc "thay thế DC000001／002" | cần xác nhận |
| DC000007 | Giảm giá đại lý (Linkup・số tiền cố định) | Phí gói | ¥2,000 | Mãi mãi | Không có căn cứ | cần xác nhận (khác với RFP phí đại lý…) |
| DC000004 | Miễn phí thêm số lần giao hàng (6 tháng) | Phí tùy chọn | ¥3,000 (1 lần của OP000001) | 6 tháng | Không có căn cứ | cần xác nhận |
| DC000008 | Giảm 10% tùy chọn (Hỗ trợ khai trương) | Phí tùy chọn | 10% | 3 tháng | Không có căn cứ | cần xác nhận |
| DC000009 | Giảm giá giới thiệu | Phí gói | ¥2,000 | 6 tháng | Không có căn cứ (**Phí** giới thiệu = phía trả cho đại lý là khác) | cần xác nhận |
| DC000010 | Giảm giá theo số lượng (từ 5 cơ sở) | Toàn bộ thanh toán | 3% | Mãi mãi | Không có căn cứ | cần xác nhận |
| DC000011 | Giảm nửa phí hàng tháng tủ lạnh (12 tháng) | Phí thiết bị | 50% (tối đa ¥3,500) | 12 tháng | Không có căn cứ | cần xác nhận |
| DC000012 | Giảm giá chuyển từ công ty khác | Phí khởi tạo | ¥10,000 | Một lần | Không có căn cứ | cần xác nhận |
| DC000005 / DC000006 | Chiến dịch tân binh mùa xuân / Chiến dịch mùa hè | Phí gói | 20% / 10% | Kết thúc／Đã xóa | Ví dụ trước đây | Giữ nguyên ở trạng thái Kết thúc・Đã xóa |

Hiện trạng triển khai giảm giá: kiểu `Discount` của domain chỉ có `target`・`note`・`rule?:'liteBase'`・`taxRateId?` (số tiền・phân loại tính toán・thời hạn・số lần・điều kiện tự động **không có trong kiểu**). Việc tính toán ở `snapshot.ts:46-63` rẽ nhánh theo ID giữa 2 mẫu (toàn bộ／liteBase).

---

## 3. Thiếu sót・Mâu thuẫn

### D1. Quyết định cần nhưng domain master chưa có
- **OP000019/020** (phí giao thiết bị)・**OP000021** (cầu thang): đã quyết định ở 28-16/28-53 là "lưu trong Master Tùy chọn (phí một lần)" nhưng số tiền viết cứng ở `lifecycle.ts:46 SWAP_FEE`.
- **OP000023** (chênh lệch kích thước): Là khoản thu duy nhất khi đổi kích thước theo STEP3 Q4. Code tính theo chênh lệch phí hàng tháng của dòng máy, không tham chiếu ID.
- **OP000035** (người dùng thanh toán tiền mặt ¥0): Đã quyết định đăng ký ở STEP3 bổ sung §6. Domain chưa có.
- **Cho thuê máy bán hàng tự động (mới)**: REQ-PM-054. OP000008 (phí khởi tạo) tương ứng REQ-PM-055, nhưng chỗ nhập số tiền theo từng hợp đồng (REQ-CT-304 ghi đè số tiền theo hợp đồng) không có ở `feesOf`.
- **OP000024〜034 / 007 / 010 / 014 / 015 / 017**: Các mục phí một lần・nhập mỗi lần đã được quyết định thêm (hoặc quyết định ở form đăng ký) ở phần bổ sung nhưng domain chưa đăng ký.
- **Các mục của Master Giảm giá** (STEP3 bổ sung §3): phân loại tính toán・gói/course đối tượng・giới hạn số lần・điều kiện tự gắn・thời gian tiếp nhận **không có trong kiểu** `Discount`. **Các mục của Tùy chọn** (loại số tiền・course đối tượng・loại dòng máy đối tượng) cũng không có.

### D2. Không có căn cứ quyết định (chỉ có trong danh sách ops) → cần xác nhận
Tùy chọn: OP000009 / 012 / 018 (+ căn cứ cho số tiền như ¥7,800). Giảm giá: DC000001/002/004/007/008/009/010/011/012. → **Không để demo hiển thị các con số chưa có quyết định như thể "có vẻ thật"** (nếu là dùng cho demo thì phải hiển thị rõ).

### D3. Các mục phí viết cứng trong code (nên đọc master)
| Mục phí | Nơi viết cứng | Sửa thành |
|---|---|---|
| Phí thủ tục OP000016 ¥3,000 | `billing/seed.ts:8` (`cfg.penalty`), `corp/docs/logic.ts:120` | `amountYen`・`taxRateId` của master OP000016 |
| Giao hàng vật tư bổ sung OP000036 | **Đang đọc master (OK)**. Chỉ ID là chuỗi (`fromDomain.ts:126`, comment `delivery.ts:594`) | Đưa hằng ID về một chỗ |
| Phí thu hồi thiết bị OP000022 | Bản thân code xuất phí thu hồi không có (hủy hợp đồng là "không mất phí") | Khi phê duyệt hủy hợp đồng, số máy thu hồi × số tiền master vào chi tiết điều chỉnh của hóa đơn cuối |
| Phí giao thiết bị OP000019/020 | `lifecycle.ts:46` | Tham chiếu 2 dòng master (chuyển theo số máy) |
| Thêm số lần giao hàng OP000001 | `intake.ts:209`, `corp/docs/apply/data.ts:105`, `corp/sites/logic.ts:251` (chuỗi "+3,000 yên／tháng") | Tham chiếu `amountYen` của master |
| Dùng thử DC000013 | `lifecycle.ts:42` và `trial.ts:19` (2 hằng số), `billing/masters.ts:75 TRIAL_PLAN` | Mục "gói・course tham chiếu" của Master Giảm giá |
| Giảm giá chuyển đổi DC000021 | `lifecycle.ts:40`, `snapshot.ts:49 rule==='liteBase'` | Cho dòng giảm giá giữ `calcKind:'liteBase'` |

### D4. Điều kiện không khớp
- **"Lần thứ 2" của OP000036**: Quyết định・nội dung màn hình là "từ lần thứ 2 trong cùng tháng sử dụng (chu kỳ)" (`app/corp/order/materials/page.tsx:65`). Code là **tháng dương lịch** (`delivery.ts:594` `orderedAt.slice(0,7)`). Có thể lệch với giao hàng đầu tháng／chốt ngày 21.
- **Cách hiểu về OP000036**: Câu trả lời 2026/10/03 "Vật tư hiện miễn phí, cũng có thể có sản phẩm tính phí, **đặt vượt số lượng của gói thì thu tiền**" và hiện tại "từ đơn thứ 2 mất phí" là **quy tắc khác nhau** (Q1).
- **Số tiền DC000013**: Quyết định là "phí hàng tháng của ES000003 (gói 50 ES Lite tủ lạnh), không vượt số tiền thanh toán". `feesOf` của domain trừ **toàn bộ phí gói của hợp đồng đó** (gói 50 Lite thì bằng nhau, nhưng gói 100 trở lên・nhiều cơ sở・đổi gói thì sẽ có chênh lệch). "1 lần mỗi doanh nghiệp" cũng chưa triển khai ở domain.
- **Số tiền OP000022**: 28-54／danh sách ops／intake là ¥0, domain trong working tree là ¥5,000 tạm.
- **Tên OP000008**: Danh sách ops・intake "Phí khởi tạo (phí thủ tục)"／domain cũ "Phí khởi tạo"／working tree "Hóa đơn: Phí thủ tục, Tên quản lý: Phí khởi tạo". OP000016 cũng là "Phí thủ tục" → **trên hóa đơn có 2 loại dòng trùng tên** (Q3).

### D5. Số tiền・tên không khớp (tùy nơi)
| ID | Nơi A | Nơi B |
|---|---|---|
| Tên OP000002 | domain "ES-QR" | Danh sách ops・đăng ký "Phí sử dụng ES-QR" (→ giữ làm tên quản lý, tên hiển thị trên hóa đơn "ES-QR") |
| OP000003 | domain ¥0 | Danh sách ops "nhập mỗi lần" (STEP3 bổ sung O13) |
| OP000004 | domain ¥4,000 | Danh sách ops "theo từng cơ sở"・intake `a:null` |
| OP000036 | domain ¥2,000 | STEP4 O-3 ¥1,000 (đã ghi đè ở bổ sung 5 Q13)／danh sách ops ¥2,000 ／ `lib/domain/README.md:187` ¥2,000 |
| **Số lần** OP000001 | `snapshot.ts:41-43` chỉ thêm `o.amountYen` **1 dòng・1 lần**. `lifecycle.ts:316` chỉ cho OP000001 vào `optionIds` **1 cái không trùng**, không giữ số lần (`pc.extra`) | `intake.ts:456`・`corp` là **số lần × ¥3,000**. → Hợp đồng vượt tiêu chuẩn **từ 2 lần trở lên** có thể khiến mục phí ① của Hợp đồng con vẫn là ¥3,000 (cần test. Seed chỉ có trường hợp vượt 1 lần: chi nhánh Osaka ¥27,500) |
| ES-QR / tiền mặt / khách | Theo lý thuyết là loại A (liên động) nhưng dòng tùy chọn và cờ mục hợp đồng được cập nhật **riêng rẽ** (`seed/org.ts:183` `optionIds` và `allowEsqr`, `ops/areas/contracts.ts:141-155` chỉ cập nhật cờ) | → Quên một trong hai thì chỉ có phí mà không có cờ／chỉ có cờ mà không có phí |

### D6. Khác
- `DISCOUNTS`・`disc()`・`calc:'gap'|'fixed'|'all'` của `ops/billing/masters.ts` chưa dùng trong dữ liệu thật (`discIds:[]`). **Xóa, hoặc ghi rõ "tham khảo・demo"** (quyết định STEP3 Q1).
- Thuế: cách xử lý thuế của giảm giá (trừ DC000013 tách thành phí cơ bản 10%・phần doanh nghiệp chịu 8%) **đã quyết định** (Sổ quyết định E "Cách tách thuế suất của giảm giá dùng thử" 2026-10-05). Tùy chọn là `taxRateId` (toàn bộ TAX_STD 10%).
- Thanh toán theo năm: tùy chọn hàng tháng cũng `tim:'Y'` 12 tháng tại tháng bắt đầu (`fromDomain.ts:86-95`). Một lần (`kind:'単発'`) vẫn là M.
- Hóa đơn cuối (hủy hợp đồng): tiền phạt vi phạm・phí thu hồi thiết bị (dự kiến)・tháng cuối của quyết toán thực tế tách thành "hóa đơn cuối" 1 bản riêng (quyết định 2026/10/03. `fromDomain.ts:100-108 finalM`).

---

## 4. Đề xuất mô hình thống nhất

### 4-1. Trường

Định nghĩa `Option` và `Discount` là 2 loại của "Charge" chung (giữ nguyên ID OP／DC hiện tại).

| Trường | Kiểu | Nội dung |
|---|---|---|
| `id` | string | OP + 6 chữ số／DC + 6 chữ số (không tái sử dụng) |
| `invoiceName` | string | Tên hiển thị trên hóa đơn (doanh nghiệp nhìn thấy) = `name` hiện tại |
| `adminName` | string | Tên quản lý (nội bộ) = `mgmtName` hiện tại. Danh sách・lựa chọn dùng tên quản lý + ID. Phân biệt OP000008/016 có cùng tên hiển thị |
| `category` | enum | Giao hàng／Chức năng app／Thủ tục／Lắp đặt・công việc／Phạt／(giảm giá theo đối tượng: phí gói・phí cơ bản・tùy chọn・thiết bị・khởi tạo・toàn bộ thanh toán) |
| `linkType` | 'A' ｜ 'none' | 28-43/44. Loại A bắt buộc có `linkedItem` (`deliveryCount`／`esqr`／`guestMode`／`userCash`) |
| `feeType` | Phí hàng tháng／Phí một lần (phí khởi tạo) | 28-44 |
| `amountKind` | Cố định／Từ mức tối thiểu／Nhập mỗi lần／Theo từng cơ sở／Quyết định theo chênh lệch／Tham chiếu | STEP3 bổ sung §3 |
| `amountYen` | number | Chưa thuế. Bắt buộc khi `amountKind=Cố định`. "Theo từng cơ sở"・"Nhập mỗi lần" là giá trị mặc định |
| `unit` | '回'｜'台'｜'件'｜'月'｜'' | Đơn vị nhân với số lượng (OP000001=lần, OP000022=máy, OP000019/020=chuyển theo số máy) |
| `taxRateId` | FK Master thuế suất | Giảm giá "giống mục phí gốc／chỉ định riêng" |
| `trigger` | enum (bảng dưới) | **Tương ứng 1-1 với code**. Hiển thị trên màn hình bằng câu "khi nào phát sinh" |
| `auto` | 'auto'｜'manual'｜'apply' | Tự động／Vận hành gắn bằng tay／Doanh nghiệp chọn ở đăng ký |
| `targetCourses`／`targetModelKinds` | mảng | STEP3 bổ sung §3 |
| `status` | Đang dùng／Tạm dừng／Kết thúc／Đã xóa | Như hiện tại |
| `note` | string | Căn cứ (số quyết định) |
| (Chỉ giảm giá) `calcKind` | fixed／rate／diffAuto／refPlan／liteBase | `rate` + giới hạn trên, `refPlan` + gói・course tham chiếu |
| (Chỉ giảm giá) `months`／`maxPerCorp`／`autoCondition`／`acceptFrom`・`acceptTo` | | STEP3 bổ sung §3, 7-2 (hạn đăng ký có thể để trống) |

Ứng viên `trigger` (thu gọn còn 7〜9 mục theo code hiện có):
`item.deliveryOver` (OP000001)／`item.esqr`・`item.guest`・`item.cash` (loại A)／`event.inventoryUnfiled` (OP000016)／`event.materialOrderPaid` (OP000036)／`event.equipSwap` (OP000019/020/021)／`event.equipSizeDiff` (OP000023)／`event.equipPickup` (OP000022)／`event.contractInit` (OP000008)／`manual` (các mục một lần・nhập mỗi lần khác). Phía giảm giá: `event.trialChild` (DC000013)／`event.planUpMigrate` (DC000021)／`manual`.

### 4-2. Quy trình chuyển đổi (không đổi ID)

1. **Cố định ID**: Giữ nguyên toàn bộ OP000001〜036・DC000001〜021. Bãi bỏ thì chuyển sang "Kết thúc" "Đã xóa" và giữ lại. Mới từ OP000037〜 (cho thuê máy bán hàng tự động). OP000006 để trống số.
2. **Hoàn thiện domain master**: Thêm các mục "đã quyết định" ở 1-B (OP000007/010/014/015/017/019/020/021/023/024〜035, cho thuê máy bán hàng tự động). Mục chưa quyết định số tiền thì `amountKind=Nhập mỗi lần`, giá trị ghi "tạm" và ghi chú. 1-C (không có căn cứ) **không thêm** (sau khi xác nhận với khách). DC000001〜012 cũng tương tự.
3. **Mở rộng kiểu**: Thêm các mục ở 4-1 vào `Option`／`Discount` (`mgmtName` đã được thêm. `invoiceName` giữ `name` hiện tại dưới tên khác cũng được). Thêm vào `check.run`: "ID OP/DC mà code tham chiếu phải tồn tại trong master", "loại A phải khớp với cờ".
4. **Gom hằng số về 1 chỗ**: Đặt bảng đối ứng `trigger → ID` ở `lib/domain/charges.ts` (mới), để `lifecycle.ts:40-46`・`trial.ts:19`・`billing/fromDomain.ts:126`・`intake.ts:209` sử dụng. Thay số tiền viết cứng (`SWAP_FEE`・`cfg.penalty`・`PENALTY`・`OP_ADD_YEN`・`DLV_ADD.fee`) bằng tham chiếu master.
5. **Chuyển logic về master**: OP000001 là số lần × số tiền (Hợp đồng con giữ số lần). OP000016 dùng số tiền・thuế suất của master. OP000022 khi phê duyệt hủy hợp đồng ghi số máy × số tiền vào chi tiết điều chỉnh. OP000019/020 chuyển theo số máy. "Lần thứ 2" của OP000036 xét theo tháng chu kỳ (hoặc quyết định của Q1).
6. **Xóa bản sao**: Danh sách ops (`seedRows.ts` OPTIONS_ROWS/DISCOUNTS_ROWS), `intake.ts` MD_OPTS/MD_DISC, `corp/docs/apply/data.ts` OPT_MASTER, `billing/masters.ts` DISCOUNTS sẽ **suy ra từ domain** (theo luồng `ops/masters/fromDomain.ts` hiện có). Form đăng ký được tạo từ domain theo "phân loại công khai + đang dùng".
7. **Thứ tự**: Trước hết 2→3 (thêm・kiểu), tiếp theo 4→5 (phía đọc), cuối cùng 6 (xóa). Nếu thay seed sẽ không khớp với master của DB hiện có (`07_開発/data/es.db`), nên **phản ánh cần `db:reset` hoặc migration**. `db:reset` là DB dùng chung nên **bắt buộc xác nhận với người dùng** (CLAUDE.md §1). Cho người dùng xem kế hoạch rồi mới bắt tay làm.

---

## 5. Câu hỏi cho người dùng (điểm chính)

> Trong chat sẽ hỏi 1 câu mỗi tin nhắn. Ở đây là danh sách.

1. **Thu phí vật tư theo cách nào?** — "Vật tư: hiện miễn phí; có thể có sản phẩm tính phí; order vượt số lượng theo plan thì thu tiền" (danh sách vấn đề 10/03). Code hiện tại là "đơn vật tư lần thứ 2 trong cùng tháng = OP000036 ¥2,000" (`delivery.ts:594`). A: Từ lần thứ 2 mất phí (hiện tại)／B: Từ phần vượt số lượng của gói mới mất phí (giá・thuế suất theo từng vật tư). Hướng đề xuất là B, nhưng cần quyết định giữ OP000036 hay tách thành cái khác.
2. **Số tiền phí thu hồi thiết bị (OP000022) là bao nhiêu?** — 28-54 "Phí thu hồi thiết bị (phí một lần・hiện tại 0 yên)". Hiện working tree là ¥5,000/máy (tạm), xử lý hủy hợp đồng chưa xuất. Đề xuất: giữ 0 yên hoặc vận hành nhập cho đến khi khách xác nhận.
3. **Trên hóa đơn có thể xuất hiện 2 loại "Phí thủ tục" không?** — OP000008 (phí khởi tạo mới ¥10,000) và OP000016 (chưa kiểm kê ¥3,000) đều có tên hiển thị trên hóa đơn là "Phí thủ tục". `未回答_確認待ち` Gói1-3 "Đổi OP000008 thành "Phí khởi tạo" được không?". Đề xuất: phí khởi tạo trên hóa đơn cũng là "Phí khởi tạo" (doanh nghiệp không bị nhầm).
4. **Xử lý các Tùy chọn có trong danh sách ops nhưng chưa có quyết định thế nào?** — OP000009 Phí giao lại ¥1,500／OP000012 Phí quản lý thiết bị ¥500／OP000018 Lắp đặt tiêu chuẩn (đã gồm trong gói). Đề xuất: cho đến khi khách xác nhận thì hiển thị "tạm" và không đưa vào domain (hoặc xóa).
5. **DC000003 và DC000021 có phải là một không?** — 28-170 "Chênh lệch nâng Standard" và 7-2 "Giảm giá chuyển đổi Lite cũ→Standard" có cùng mục đích (khi khách Lite hiện hữu nâng lên Standard thì phí cơ bản = Lite). Đề xuất: gộp vào DC000021, DC000003 là "Kết thúc (→DC000021)".
6. **Tủ đông (khách hiện hữu) thanh toán bằng OP000032/033 hay bằng đề xuất tự động của giảm giá chuyển đổi (phí hàng tháng của Master Dòng máy)?** — STEP3 bổ sung "OP000032 Cho thuê tủ đông (khách hiện hữu)／OP000033 Phí khởi tạo ¥20,000" và danh sách vấn đề 7-2 "Khách cũ nâng lên trả tiền thuê tủ đông (theo Master Dòng máy)". Đề xuất: tiền thuê liên động Master Dòng máy (tự động), phí khởi tạo ¥20,000 nhập tay bằng OP000033 cho đến khi quyết định.
7. **Có thể thêm cho thuê máy bán hàng tự động làm Tùy chọn mới (OP000037) không?** — REQ-PM-054 "Phí thuê máy bán hàng tự động giữ bằng 1 "Cho thuê máy bán hàng tự động" (hàng tháng) của Master Tùy chọn, số tiền nhập theo từng hợp đồng". Có khác với OP000030 "Phí máy bán hàng tự động" không? Đề xuất: lập mới OP000037, OP000030 giữ làm phí khác (xác nhận với khách).
8. **DC000001/002/004/007〜012 có giữ lại không?** — Các giảm giá demo chưa thấy quyết định (giảm giá đại lý・giảm giá giới thiệu・giảm theo số lượng…). Đề xuất: không đưa vào domain cho đến khi khách xác nhận, danh sách ops ghi rõ "tham khảo".

---

## 6. Master Gói — Kiểm tra liên động giữa thiết lập và hệ thống

Ký hiệu: ✅ nối đúng ý định / ⚠ nối một phần hoặc khác ý định / ❌ không nối (sửa master không ảnh hưởng gì, hoặc hard-code).
Cách kiểm tra: tìm nơi code **đọc** giá trị từ `dm.master.plans` (domain `Plan`, `lib/domain/types.ts:219-239`). Màn hình master ops (`lib/ops/masters/seed.ts`, `spec/plans.ts`) có nhiều ô hơn kiểu `Plan` của domain: ô nào không có trong `Plan` thì **không thể** ảnh hưởng tính toán.

| Mục | Ý định (quyết định / spec) | Code thực tế | Kết luận |
|---|---|---|---|
| **Giới hạn cung cấp hàng tháng** (theo nhiệt độ・lạnh nhiệt độ thường／đông lạnh)| 28-153: giữ theo nhiệt độ, đông lạnh chỉ có ở Standard | `Plan.limits[].meals` → `lifecycle.ts:284-300` (`planChannels`: `meals`) ; kiểm tra `areas/check.ts:305` (giới hạn trên ≤ `monthlyMeals`). Ô **giới hạn dưới** (`月次提供数_下限`) có ở màn master (`masters/seed.ts:28-34`) nhưng `PlanLimit` không có trường giới hạn dưới | ⚠ Giới hạn trên ✅, **giới hạn dưới ❌** (lưu ở màn hình, không dùng) |
| **Tổng giới hạn cung cấp hàng tháng** (`monthlyMeals`)| tổng các nhiệt độ | `snapshot.ts:33` (tính phần doanh nghiệp chịu), `menu/fromDomain.ts:91`, `lifecycle.ts:997`, `billing/fromDomain.ts:232` | ✅ (nhưng là ô nhập tay, không tự cộng từ `limits` → có thể lệch nhau; `check.ts:305` chỉ kiểm 1 chiều) |
| **Số lần giao hàng tiêu chuẩn** (theo nhiệt độ)| 28-154 "tuyến giao hàng của hợp đồng… số lần giao hàng tiêu chuẩn cũng theo từng nhóm nhiệt độ"; 28-156 không bù trừ | `Plan.limits[].deliveries` → `lifecycle.ts:284-300`: `extra += max(0, n − deliveries)` → thêm OP000001 | ⚠ tính số lần đúng, nhưng **tiền không nhân với số lần** (§3-D5) |
| **Số lượng giao mỗi lần** | 28: = giới hạn cung cấp hàng tháng ÷ số chuyến (không nhập) | `lifecycle.ts:298 mealsPerDelivery = floor(meals / n)`; ô ở màn master chỉ là hiển thị | ✅ (tính từ `limits`) |
| **Thiết bị cho mượn tiêu chuẩn** (dòng máy・số máy)| 28-182: máy trong tiêu chuẩn = miễn phí, vượt = phí hàng tháng của Master Dòng máy | `Plan.stdEquipment` → `lifecycle.ts:338,370,847` (đăng ký chính thức・đổi gói・dùng thử→triển khai chính thức lập đề xuất "điều chỉnh thiết bị"); `check`/nhập CSV | ✅ |
| **Phí cơ bản・giá theo course** | Bảng giá | `Plan.prices` → `snapshot.ts:30` | ✅ |
| **Thế hệ giá** (sửa đổi ①〜)| 7-1/7-2: áp dụng từ ngày bắt đầu áp dụng cho Hợp đồng con chưa khóa | `Plan.priceGens` → `snapshot.ts:64-70 pricesAt`, `bulk.ts:447-454`, `checkDecisions.ts:63`. `ops/billing/masters.ts` có bảng giá riêng (`TIERS`, `HIST`, `REV`) dùng ở demo thanh toán | ✅ domain / ⚠ bản sao demo ở `billing/masters.ts` |
| **Số tiền doanh nghiệp chịu (đã gồm thuế・1 suất)** | 28-147: mặc định ¥100/suất; 28-149 tách 8% | **`Plan` không có trường này.** `snapshot.ts:18 welfareOf = floor(meals×100 ÷1.08)` hard-code **100 và 1.08**; `ops/billing/masters.ts:53 emp: 100` hard-code | ❌ sửa ô ở master không đổi hóa đơn |
| **Thuế suất phần doanh nghiệp chịu / thuế suất phí cơ bản** | 28-149: chọn từ Master thuế suất | `welfareTaxRateId`/`taxRateId` → `tax.ts` `planBaseTax/planWelfareTax` → `snapshot.ts:36-37` | ⚠ thuế suất dòng đúng, nhưng phép **tách ngược ÷1.08 cố định** (đổi thuế suất 8% thì tách sai) |
| **Số tiền miễn trách** (tổn thất cho phép)| Quyết toán thực tế: tổn thất quản lý − miễn trách = phần vượt | `Plan` domain **không có**. `billing/logic.ts:126 dedOf = planOf(b).ded` lấy từ `ops/billing/masters.ts:47-62` (`TIERS` cột 5 + `DEDOF`) hard-code | ❌ sửa số tiền miễn trách ở Master Gói không ảnh hưởng quyết toán thực tế |
| **Tỷ lệ sắp hết (%)** | spec Master Gói: ngưỡng hiển thị "Sắp hết" | Chỉ ở màn master / CSV. Không có chỗ nào trong `lib/` `app/` đọc (grep không thấy) | ❌ |
| **Tỷ lệ cơ bản × hệ số** | ý định: số đặt hàng mặc định = 50 × hệ số (`app/corp/order/_components/modals.tsx:238`) | Màn master có ô; code tính lại `round(monthlyMeals/50)` (`ops/menu/fromDomain.ts:91`) | ⚠ giống nhau với gói 50/100, nhưng giá trị nhập ở ô tỷ lệ cơ bản × hệ số **bị bỏ qua** |
| **Số người sử dụng tham khảo (để hiển thị)**| chỉ hiển thị trên form đăng ký | Form Web doanh nghiệp dùng bảng riêng `PLAN_TBL` (`corp/docs/apply/data.ts:40-44`: `people:'7名'`, `fee`, `dstd`, thiết bị, `init`) — **không đọc** `dm.master.plans` | ❌ (bản sao thứ 2 của Master Gói) |
| **Trạng thái công khai** (`public`)| Gói công khai → hiển thị ở form đăng ký | `PLAN_TBL` tĩnh ở Web doanh nghiệp; `ops/areas/applications.ts:138` chỉ lọc `status==='有効'` | ❌ phía doanh nghiệp / ⚠ phía ops |
| **Phí khởi tạo** (gói / máy bán hàng tự động)| REQ-PM-055: phí khởi tạo = OP000008, số tiền theo hợp đồng (giá trị ban đầu = Master Dòng máy) | `Plan` không có. Phí khởi tạo VM ¥30,000 ở `ops/applications/intake.ts:300`, ¥50,000 ở `corp/docs/apply/data.ts:44` (`vm.init`) → **hai số khác nhau**, và không nối với OP000008 | ❌ |
| **Trang bị ban đầu** (bộ vật tư ban đầu) | `Quyết_định_v2.3_Bổ_sung_Master_Gói_20260929.md` L.49: "Số lượng bộ vật tư ban đầu (Master Vật tư × gói・28-129)" | `lifecycle.ts:929-938 initialSet`: ID vật tư S001〜S008 và số lượng (`max(10, meals)`, 10, 20) **viết cứng** | ❌ không đọc Master Vật tư × gói |
| **Mặc định ES-QR・tuyến giao hàng, v.v.** (đi kèm gói)| — | không có trong `Plan` | — |

→ Hậu quả thực tế: ở màn Master Gói, chỉ **giá・giới hạn cung cấp hàng tháng・số lần giao hàng tiêu chuẩn・thiết bị cho mượn tiêu chuẩn・ID thuế suất・thế hệ giá・số suất** là có hiệu lực. **Số tiền doanh nghiệp chịu・số tiền miễn trách・tỷ lệ sắp hết・tỷ lệ cơ bản × hệ số・số người sử dụng・trang bị ban đầu・phí khởi tạo・giới hạn dưới** sửa trên màn hình **không đổi** hành vi hệ thống.

Đề xuất sửa (thứ tự ưu tiên): (1) thêm `welfareYenPerMeal`, `deductibleYen`, `lowStockRate`, `baseRatio`, `minMeals` vào `Plan`/`PlanLimit` và đọc ở `snapshot.ts:18`, `billing/logic.ts:126`; (2) bỏ `TIERS/DEDOF/emp` ở `billing/masters.ts`; (3) form Web doanh nghiệp đọc `dm.master.plans` thay `PLAN_TBL`; (4) `initialSet` đọc bảng Vật tư × Gói; (5) tỷ lệ sắp hết chỉ làm khi có màn dùng nó (hỏi khách).

---

## 7. Master Sản phẩm — Kiểm tra liên động giữa thiết lập và hệ thống

Cách kiểm tra như §6; nguồn: `Product` (`lib/domain/types.ts:329-376`).

| Mục | Ý định | Code thực tế | Kết luận |
|---|---|---|---|
| **Kho picking** | Danh sách vấn đề "tuyến giao của khách hàng quyết định kho picking; chỉ món có ở kho đó mới hiện" | `domain/product.ts sellable` (kho của chuyến ∈ `pickWarehouseIds`), `seed/order.ts:93`, `areas/master.ts:119` (đổi kho → tính lại đơn), `check.ts`; menu ops `ops/menu/logic.ts:151-153`; mẫu kinh doanh `purchasing.ts:102-103` | ✅ |
| **Course** (Lite/Standard)| "Course và dòng máy trong hợp đồng cũng lọc menu"; đông lạnh chỉ có Standard | `sellable`, `menu/logic.ts:153-154` (đông lạnh = chỉ Standard・khớp course) | ✅ |
| **Cột máy bán hàng tự động / dòng máy tương thích** | "Máy bán hàng tự động thì món phải vừa cột của máy" | `domain/product.ts:36 vmFits` (có cột + dòng máy của máy bán hàng tự động ở cơ sở nằm trong `vending.models`), `vmFrame` tự động từ cột (`areas/master.ts:67`, `check.ts:156-157`), menu `menu/logic.ts:154` | ✅ (khi không biết máy bán hàng tự động của cơ sở thì "không hỏi" = cho qua. Điểm này không có trong đặc tả → ⚠ cần xác nhận) |
| **Phân loại hạn sử dụng ngắn** (ngoài đối tượng/Short/Semi-short)| STEP5 Q6: thiết lập cơ sở "lấy / không lấy hạn sử dụng ngắn". STEP6: phân loại số đặt hàng・nhà cung cấp | Hiển thị `domain/product.ts:15-18 shortLabel`, màn nhà cung cấp `supplier/fromDomain.ts:16`, thiết lập Web doanh nghiệp `corp/order/logic.ts:116` (loại trừ `!c.short && p.exp`). `purchasing/stock.ts:51-52` của đặt hàng ops **cố định quy cách 12・"tươi sống"** (`p.short ? 12 : p.lot`) | ⚠ (hiển thị・loại trừ theo sở thích của doanh nghiệp có liên động. Quy cách・phân loại của đặt hàng là giá trị cố định) |
| **Hạn sử dụng của ES (`esValue`/`esUnit`)・hạn của nhà sản xuất** | STEP6 Q7 "Hạn sử dụng mong muốn = ngày giao cho khách + số ngày bảo đảm (quy tắc của vận hành)" | **Chỉ kiểm tra bắt buộc nhập** (`ops/general/product.ts:71`). Không có chỗ nào **đọc** `esValue` để tính・đặt hàng・phán đoán giao hàng | ❌ |
| **Thuế suất (`taxRateId`)** | Giá bán = đã gồm thuế, tách ngược theo thuế suất. 2026/10/03 thuế suất ở mọi mục | Bản sao giá của menu `domain/menu.ts:56-57`, hiển thị màn hình `ops/general/fromDomain.ts:60`. **Dòng quyết toán thực tế・hàng thay thế cố định thuế suất 8%** (`billing/logic.ts:258-264`, `billing/fromDomain.ts altRows t:8`). Thuế suất đơn giá nhập mua = thuế suất của sản phẩm (mặc định của `tax.ts`). | ⚠ (dù đặt thuế suất sản phẩm là 10% thì quyết toán thực tế vẫn 8%) |
| **Giá bán (đã gồm thuế)** | Danh sách vấn đề "giá bán = đã gồm thuế"; khi xác nhận là bản sao | Bản sao `menu.prices` (`menu.ts:56`), thanh toán `billing/fromDomain.ts prodsOf` (đơn giá menu của chuyến trong kỳ chốt) | ✅ |
| **Nhà cung cấp・đơn giá nhập・quy cách** | STEP6: nhà cung cấp theo từng sản phẩm; sao chép đơn giá nhập khi đặt hàng chính thức | `supplier/fromDomain.ts:13-16`, `snapshot.ts:138-144 unitCostOf/stampUnitCost` (mặc định `selectedSupplier`), `areas/master.ts:59-67` | ✅ |
| **Mẫu kinh doanh** | Đánh dấu ở Master Sản phẩm → là đối tượng mẫu | `purchasing.ts:102` (`sampleOn && 有効`) | ✅ |
| **Hàng chủ lực (tag)・tag sản phẩm** | Chỉ tên tag (NEW／Đề xuất／Hạn sử dụng ngắn／Tái xuất hiện／Chủ lực／Lạnh vẫn ngon. `seed/products.ts:22`) | **Không có logic đọc** `tags` của sản phẩm. Phía menu dùng `items[].tags` của từng dòng menu (`ops/areas/menu.ts:254`, `corp/order/fromDomain.ts:71`). Tag "Hạn sử dụng ngắn" **quản lý 2 lần** với `shortClass` | ⚠ (tag của Master Sản phẩm và tag của menu là riêng. Không thấy hành vi đã quyết định cho "Chủ lực" → ý định chưa rõ) |
| **Vật tư kèm theo / chỉ thị đặc biệt khi xuất hàng** | Danh sách vấn đề 4a(4) "giữ vật tư kèm theo, không trừ tồn"; Danh sách mục C21 "bỏ vật tư kèm theo" (đề xuất) | Chỉ kiểm tra・CSV・màn hình (`areas/check.ts:155`, `csv/master.ts:89`). **Không có chỗ nào dùng** trong CSV chỉ thị xuất hàng・picking・tồn kho | ❌ (chỉ giữ. Phương án "bỏ" và "giữ" lẫn lộn → cần hỏi) |
| **Cách bảo quản (quản lý・hiển thị)** | Quản lý = nhóm nhiệt độ, hiển thị = dành cho doanh nghiệp | Quản lý→`temp` (`ops/general/product.ts:93`), đặt hàng `purchasing.ts:103`. Hiển thị chỉ để xem | ✅ |
| **Danh mục / Kana / JAN / Hình ảnh・dinh dưỡng・chất gây dị ứng** | Hiển thị・CSV | Màn hình・CSV・hiển thị Web doanh nghiệp | ✅ (mục không dùng để tính toán) |
| **Trạng thái sản phẩm (đã xóa)** | Không xóa được sản phẩm đang dùng | Đầu `sellable`, "đang dùng ở đâu" của `areas/master.ts` | ✅ |

→ Master Sản phẩm: **các mục ảnh hưởng đến giao hàng・menu・nhập mua (kho・course・máy bán hàng tự động・nhà cung cấp・mẫu) đều liên động ✅**. Các mục chưa liên động là **hạn sử dụng ES (hạn sử dụng mong muốn)・vật tư kèm theo／chỉ thị đặc biệt・tag sản phẩm (chủ lực)・thuế suất (quyết toán thực tế cố định 8%)**.

---

## 8. Câu hỏi bổ sung (thêm vào §5)

9. **Hạn sử dụng của ES và phân loại hạn sử dụng ngắn dùng cho phép tính nào?** — STEP6 Q7 "Hạn sử dụng mong muốn = ngày giao cho khách + số ngày bảo đảm (quy tắc của vận hành)". Hiện chỉ bắt buộc nhập, không dùng để tính. Đề xuất: dùng ở đặt hàng (hạn sử dụng mong muốn) và kiểm tra giao hàng (nếu làm thì là một phần của chức năng đặt hàng).
10. **"Số tiền miễn trách", "Số tiền doanh nghiệp chịu", "Tỷ lệ sắp hết", "Tỷ lệ cơ bản × hệ số", "Số người sử dụng" của Master Gói, nếu sửa trên màn hình thì có cho phép có hiệu lực thực sự không?** — Hiện sửa trên màn hình thì thanh toán・menu không đổi (§6). Đề xuất: số tiền miễn trách・số tiền doanh nghiệp chịu・tỷ lệ cơ bản × hệ số cho có hiệu lực. Tỷ lệ sắp hết・số người sử dụng là để hiển thị nên làm sau khi quyết định màn hình dùng.
11. **Vật tư kèm theo・chỉ thị đặc biệt khi xuất hàng có xuất ra CSV chỉ thị xuất hàng không? Hay bỏ cả mục?** — Danh sách vấn đề 4a "giữ vật tư kèm theo, không trừ tồn" và đề xuất C21 "bỏ vật tư kèm theo" mâu thuẫn nhau. Đề xuất: hướng xuất ra chỉ thị xuất hàng (THOMAS) là "giữ", không trừ tồn kho.

---

## 9. Đề xuất cho 9 giảm giá chưa có quyết định (DC000001・002・004・007〜012) — **chưa thêm vào master, chờ bạn xác nhận**

> Trạng thái code (tối 2026/10/03): domain master chỉ có DC000013 (dùng thử)・DC000021 (giảm giá chuyển đổi)・DC000003 (kết thúc → gộp vào DC000021)・DC000005/006 (kết thúc・đã xóa, giữ ID).
> 9 giảm giá dưới đây **không có** trong `lib/domain/seed/master.ts`. Vì vậy màn Tiếp nhận (ops) **không còn** danh sách chọn giảm giá (MD_DISC rỗng) cho tới khi bạn xác nhận.
> Khả năng tính tiền hiện tại (`lib/domain/snapshot.ts` `feesOf`): Giảm giá kiểu `fixed` (số tiền cố định)/`rate` (tỷ lệ・giới hạn trên) **chỉ trừ vào phí gói**. Trừ vào phí tùy chọn・phí thiết bị・toàn bộ thanh toán **chưa làm** (cần thêm code nếu khách muốn).
> Ngoài ra đã có 2 cách "giảm tiền" không cần giảm giá mới: **ghi đè số tiền theo hợp đồng** (`amounts` của Hợp đồng con・REQ-CT-304) và **sửa phí khởi tạo theo hợp đồng** (`initFeeYen` của Tiếp nhận／③ điều chỉnh).

| ID | Tên (demo cũ) | Giá trị demo | Căn cứ tìm được | Đề xuất | Ưu điểm | Nhược điểm |
|---|---|---|---|---|---|---|
| DC000002 | Giảm giá chiến dịch lần đầu | ¥3,000 × 3 tháng (phí gói) | `Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` L.221 "Giảm giá chiến dịch lần đầu = DC000002" (chỉ nhắc mã, không có số tiền/điều kiện) | **Thêm** dạng `fixed` ¥3,000・`months: 3`・vận hành tay・ghi [Tạm] | Code đã tính được (trừ phí gói); demo Tiếp nhận có ví dụ dùng mã này | Số tiền/thời hạn là số demo, chưa được khách duyệt |
| DC000001 | Giảm giá đại lý (Partners・tỷ lệ) | 5% (tối đa ¥5,000) | `決定_STEP3回答` H1 chỉ nhắc "thay thế DC000001／002" | **Thêm** dạng `rate` 5%・giới hạn trên ¥5,000・chỉ hợp đồng có đại lý (`agencyId`)・[Tạm] | Code tính được; có nhắc trong quyết định | Dễ nhầm với phí giới thiệu (tiền ES trả cho đại lý, `dm.referral`) — cần khách nói rõ 2 cái khác nhau |
| DC000007 | Giảm giá đại lý (Linkup・số tiền cố định) | ¥2,000 | Không có | **Không thêm**; nếu cần thì dùng DC000001 với giá trị theo hợp đồng | Tránh 2 giảm giá cùng mục đích | Mất tên riêng "Linkup" trên hóa đơn |
| DC000004 | Miễn phí thêm số lần giao hàng (6 tháng) | ¥3,000 | Không có | **Không thêm** — dùng ghi đè OP000001 = 0 yên theo hợp đồng (REQ-CT-304) | Không cần loại giảm giá trừ vào tùy chọn (chưa có code) | Ghi đè không tự hết hạn sau 6 tháng (vận hành phải tự gỡ) |
| DC000008 | Giảm 10% tùy chọn (Hỗ trợ khai trương) | 10%・3 tháng | Không có | **Không thêm** | — | Nếu khách cần → phải viết thêm code trừ vào phí tùy chọn |
| DC000009 | Giảm giá giới thiệu | ¥2,000・6 tháng | Không có (**Phí** giới thiệu là chiều ngược lại) | **Hỏi khách**; nếu cần thì `fixed` ¥2,000・6 tháng | Code tính được | Chưa có căn cứ; dễ nhầm với phí giới thiệu |
| DC000010 | Giảm giá theo số lượng (từ 5 cơ sở) | 3% (toàn bộ thanh toán) | Không có | **Không thêm** | — | Cần code mới (trừ trên tổng hóa đơn, đếm số cơ sở) |
| DC000011 | Giảm nửa phí hàng tháng tủ lạnh (12 tháng) | 50% (tối đa ¥3,500) | Không có | **Không thêm** — nếu cần, sửa số tiền thiết bị trong điều chỉnh thiết bị khi phê duyệt | Không cần code mới | Không tự hết hạn sau 12 tháng |
| DC000012 | Giảm giá chuyển từ công ty khác | ¥10,000 (phí khởi tạo・một lần) | Không có | **Không thêm** — giảm phí khởi tạo OP000008 theo hợp đồng (Tiếp nhận / ③ điều chỉnh) | Hôm nay đã làm được | Hóa đơn không hiện dòng "Giảm giá chuyển từ công ty khác" riêng |

### Câu hỏi: Có thêm DC000002 (chiến dịch lần đầu ¥3,000×3 tháng) và DC000001 (giảm giá đại lý 5%・giới hạn ¥5,000) vào master (ghi [Tạm]) không?
**Bối cảnh:** Màn Tiếp nhận・Phê duyệt của vận hành (chọn giảm giá cho hợp đồng mới) hiện trống vì master không có giảm giá tay nào. 2 mã này là 2 cái duy nhất có nhắc trong quyết định; 7 cái còn lại không có căn cứ, đề xuất không thêm (dùng ghi đè số tiền thay thế) hoặc chờ khách.
**Dẫn chứng:**
> "Giảm giá chiến dịch lần đầu = DC000002" — `01_仕様/00_Quyết_định/Quyết_định_v2.3_Bổ_sung_Liên_quan_đơn_yêu_cầu_20260928.md` L.221
> "Thay thế DC000001／002" — `決定_STEP3回答` H1
> "1-C (không có căn cứ) không thêm. DC000001〜012 cũng tương tự" — tài liệu này §4-2 bước 2
**Vì sao cần quyết:** nếu để trống, vận hành không có giảm giá tay nào để chọn ở màn Tiếp nhận; nếu thêm số demo, khách có thể hiểu là số đã chốt.

| Lựa chọn | Nội dung | Dẫn chứng | Ưu điểm | Nhược điểm (so với lựa chọn khác) |
|---|---|---|---|---|
| A | Thêm DC000002・DC000001 (ghi [Tạm]), 7 cái còn lại theo bảng trên | Quyết định có nhắc 2 mã | Tiếp nhận có giảm giá để demo; code đã tính được | Số tiền chưa được khách duyệt |
| B | Chưa thêm cái nào, hỏi khách cả 9 | §4-2 bước 2 | Không có số "giả" | Tiếp nhận không có giảm giá tay cho tới khi khách trả lời |

**Đề xuất:** A — khách đã nhắc 2 mã này; đánh dấu [Tạm] nên rủi ro hiểu nhầm thấp; công sức nhỏ (chỉ thêm 2 dòng master).
**Cần bạn trả lời:** A hay B (hoặc ý khác)?

## 10. Danh sách Tùy chọn loại A (Tùy chọn do hệ thống định nghĩa trước) (2026-10-05・hong trả lời "cần định nghĩa trong yêu cầu")

Tùy chọn liên động loại A không phải thứ vận hành tạo ra・xóa, mà hệ thống định nghĩa trước theo từng mục hợp đồng liên động (2026/09/28). Vận hành chỉ sửa được Tên hiển thị (tên quản lý・tên hiển thị trên hóa đơn)・số tiền・trạng thái công khai・trạng thái sử dụng・mô tả. Thêm・xóa do phát triển (release) thực hiện. Sổ quyết định F・sổ tiếp nhận #88.

| ID Tùy chọn | Tên quản lý | Mục hợp đồng liên động | Điều kiện liên động | Cách lấy số lượng | Đơn vị | Loại phí／Loại số tiền | Số tiền tiêu chuẩn (chưa thuế) [Tạm] |
|---|---|---|---|---|---|---|---|
| OP000001 | Thêm số lần giao hàng | Số lần giao hàng (thiết lập tuyến giao hàng) | Khi vượt số lần tiêu chuẩn của gói | Chỉ phần vượt số lần tiêu chuẩn của gói | Lần (1 đơn vị vượt) | Hàng tháng／Cố định | 3,000 yên |
| OP000002 | Phí sử dụng ES-QR | ES-QR | Sử dụng | Cố định 1 | Cơ sở | Hàng tháng／Cố định | 1,000 yên |
| OP000003 | Phí sử dụng chế độ khách | Chế độ khách | Sử dụng | Cố định 1 | Cơ sở | Hàng tháng／Nhập mỗi lần | 0 yên |
| OP000035 | Người dùng thanh toán tiền mặt | Người dùng thanh toán tiền mặt | Sử dụng | Cố định 1 | Cơ sở | Hàng tháng／Cố định | 0 yên (STEP3 bổ sung §6) |

- Không hiển thị "Xóa" ở danh sách・chi tiết. Loại liên động ở đăng ký mới chỉ có "Không liên động". Ngay cả khi chỉnh sửa cũng không đổi được loại liên động・mục hợp đồng liên động・điều kiện liên động・cách lấy số lượng (chỉ hiển thị).
- Việc không khớp liên động (cơ sở có giá trị mục hợp đồng và dòng mục phí không khớp nhau) được phát hiện bằng batch hàng ngày và hiển thị ở tab "Xác nhận liên động" của màn chi tiết.
- Nguồn: A(...) của `lib/domain/seed/master.ts` (tại thời điểm 2026-10-05).

## 11. Danh sách giảm giá do hệ thống định nghĩa trước (2026-10-05・hong "về màn hình giảm giá cũng phản ánh nội dung đã chỉ ra ở màn hình tùy chọn")

Giảm giá tự động gắn (điều kiện tự gắn = liên động với loại hợp đồng／mục hợp đồng) cũng như loại A của Tùy chọn (§10), không phải thứ vận hành tạo ra・xóa mà hệ thống định nghĩa trước. Vận hành sửa được tên giảm giá・tên hiển thị trên hóa đơn・số tiền (tỷ lệ)・trạng thái công khai・trạng thái sử dụng, v.v. Không hiển thị "Xóa" ở danh sách・chi tiết, "Điều kiện tự gắn" ở đăng ký mới chỉ có "Không gắn (gắn bằng tay)".

| ID giảm giá | Tên giảm giá | Điều kiện tự gắn | Cách tính | Giới hạn số lần |
|---|---|---|---|---|
| DC000013 | Giảm giá chiến dịch dùng thử | Loại hợp đồng = chiến dịch dùng thử (tự động gắn vào Hợp đồng con tạo ở Tiếp nhận) | Phần phí của ES Lite (tủ lạnh) gói 50 (không vượt số tiền thanh toán) | 1 lần mỗi doanh nghiệp |
| DC000021 | Giảm giá chuyển đổi Lite cũ→Standard | Phê duyệt đổi gói (Lite→Standard) | Phí cơ bản = giá của ES Lite (tủ lạnh) cùng gói (tủ đông là phí hàng tháng của Master Dòng máy) | — |

- Nguồn: DISCOUNTS của `lib/domain/seed/master.ts` (auto: 'auto'. Tại thời điểm 2026-10-05). Thêm・xóa bằng release.

## 12. Nơi đặt dữ liệu ban đầu (các dòng mặc định của Tùy chọn・Giảm giá) (2026-10-05・hong "bổ sung 1 sheet vào spec")

Nguồn đúng của các dòng Master Tùy chọn・Master Giảm giá có sẵn trong hệ thống từ đầu (dữ liệu ban đầu mặc định) là **sheet "Dữ liệu ban đầu (Tùy chọn・Giảm giá)"** của Thiết kế màn hình `Web_quản_trị_vận_hành_Master` (Excel JA／VI・"sheet bổ sung" của HTML). Được tạo từ dữ liệu mẫu `lib/domain/seed/master.ts` theo dạng xuất CSV, loại trừ các dòng Đã xóa (tại thời điểm 2026-10-05: Tùy chọn 31 dòng・Giảm giá 6 dòng). Khi đổi seed thì dựng lại sheet (SHEETS của `docs/05_画面設計書/Dữ_liệu/AW_OPTN_Master_Tùy_chọn.py`). §1・§2・§9 là quá trình (đã quyết định đưa vào・không đưa vào cái nào).
