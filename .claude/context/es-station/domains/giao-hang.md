# Giao hàng (chu kỳ・xuất hàng・picking・giao hàng) — digest ES-STATION
> Nguồn: `10_Giao_hàng/Đặc_tả_giao_hàng/Giao_hàng_00_Tổng_quan.md` (§0-2) · `Giao_hàng_01_Master.md` (§3) · `Giao_hàng_02_Cài_đặt_chu_kỳ_và_tính_ngày.md` (§4,6) · `Giao_hàng_03_Cài_đặt_giao_hàng_của_hợp_đồng.md` (§5) · `Giao_hàng_04_Lịch_dự_kiến_dữ_liệu_giao_hàng_và_thay_đổi.md` (§7-8) · `Giao_hàng_05_Picking_và_chỉ_thị_xuất_hàng.md` (§9-10) · `Giao_hàng_06_Thực_hiện_giao_hàng_và_tài_xế.md` (§11-12) · `Giao_hàng_07_Trouble_và_hàng_thay_thế.md` (§13) · `Giao_hàng_08_Kết_nối_thanh_toán_và_màn_hình.md` (§14-15) · `Giao_hàng_09_Mô_hình_dữ_liệu_và_batch.md` (§16-17) · `Giao_hàng_11_Mô_hình_dữ_liệu.md` (ký hiệu DM14.x) · `Giao_hàng_12_API_batch_và_liên_kết_ngoài.md` (ký hiệu AP15–19). Bỏ qua `_99` (lịch sử) và README (mục lục). · Trạng thái: **chuẩn** (thư mục này là chuẩn từ 2026-10-03, v2.3; riêng `決定台帳.md` — sổ quyết định — ưu tiên cao hơn nếu mâu thuẫn [§0-3]). Bản DEV VI v2.3 và các tài liệu cũ: đóng băng · Digest tạo: 2026-10-08
> Quy ước: `[§x-y]` = số mục gốc của đặc tả (ánh xạ file ở trên); `[QĐ v2.3 #n]`/`[QĐ v2.1 #n]` = mã quyết định đang có hiệu lực. Hai chương 11/12 trùng số §14-15 với 08 nên ghi DM/AP.

## 1. Phạm vi & actors
- **Web vận hành (AW_)**: quản trị vận hành (logistics/CS), quản trị hệ thống, kinh doanh. Làm: master kho/công ty vận chuyển/tài xế, "Hỏi đáp giao hàng", cài đặt chu kỳ (màn 01), cài đặt giao hàng hợp đồng (02), lịch picking/giao (04/05), quản lý xuất-giao (05B), chi tiết dữ liệu giao hàng (06), xuất lệnh xuất hàng, xử lý "cần xác nhận" [§1-1, 1-3].
- **Chỉ vận hành (logistics)** được hủy/dừng/sắp xếp giao lại/nhân bản/đổi ngày; **mọi thao tác kho cũng do vận hành làm**. **Không tồn tại vai trò "Quản trị viên kho"**; "tab kho" chỉ là bộ lọc, không phải đơn vị phân quyền [§1-1, 9-2, 17-3; QĐ v2.1 #2].
- **Web doanh nghiệp (CW_)**: xem lịch giao (màn 07), xin đổi ngày, đăng ký ngày cơ sở không nhận được (vận hành duyệt), đặt hàng. QT doanh nghiệp xem mọi cơ sở của công ty; người phụ trách cơ sở chỉ xem cơ sở được gán (lọc ở API) [§1-1, 15-10; QĐ v2.3 #55].
- **Web công ty vận chuyển ủy thác (E05)**: chỉ thấy giao hàng có chặng (leg) do mình phụ trách; gán/đổi tài xế của mình; trả lời báo giá; **không đổi được ngày** [§1-1, 11-6, 12-6; QĐ v2.3 #34,#51].
- **Web/app tài xế (E06, V1.0 làm trên trình duyệt)**: nhận hàng, 5 bước ES配送便, COOL配送便, báo cáo sự cố/đỗ xe; **chỉ tới mức báo cáo**, không hủy/dừng [§12-2; QĐ #63].
- Ngoài hệ thống: kho Thomas (CSV hai chiều), Yamato & công ty vận tải khác, Bill One (thanh toán). **Gửi thông báo (danh sách/điều kiện/nội dung) nằm ngoài phạm vi nhóm này** (đặc tả chức năng chung) [§0-3].
- Ngoài phạm vi khác: UI/UX chi tiết, chuyển đổi dữ liệu, test case; hợp đồng/đơn hàng/thanh toán chỉ xử lý đầu vào-đầu ra [§0-3].

## 2. Thuật ngữ & định danh
| Thuật ngữ Việt | Gốc/tên vật lý | Nghĩa ngắn |
|---|---|---|
| Chu kỳ giao hàng | 配送サイクル | 28 slot = tuần A–D × thứ 1–7 (`A1`–`D7`); A1 luôn thứ Hai; chung toàn công ty [§2-1,2-2] |
| Tháng chu kỳ | `cycle_month` | Tháng chứa ô thứ 14 `B7` (14–14 → tháng trước); 1 chu kỳ = 1 hợp đồng con [§2-3; QĐ v2.1 #11] |
| Thứ không giao được / Lùi sớm・muộn | `ng_weekdays` / `holiday_shift` (−1/+1, mặc định −1) | Ràng buộc ngày giao theo hợp đồng (cơ sở); không dùng tên cũ [§2-1, 5-1] |
| Ô / ngày không xuất hàng được | `warehouse_non_picking_slots` / `_days` | Theo kho; ô mặc định `A6,A7/B4–B7/C6,C7/D4–D7` (mặc định, không cố định) [§4-6] |
| Tạm dừng chu kỳ | `delivery_cycle_pauses` (`kind=normal/adjust`) | Ngày nghỉ không tiêu thụ slot; phải là bội của 7 ngày [§4-5] |
| Ngày được coi là lễ giao hàng | `delivery_holiday_days` | Chỉ hợp đồng bật "không giao ngày lễ" mới bị dời [§3-5,4-4] |
| Dự kiến giao hàng | `shipping_plans` | Bản ghi kế hoạch (có `estimated_qty` nội bộ) [§7-1] |
| Dữ liệu giao hàng | `deliveries` | Bản ghi vận hành 1 lần giao; tạo chính thức (materialize) từ plan |
| `plan lifecycle` | `shipping_plans.lifecycle` | `draft`/`published`/`locked` — "từ khi nào không chạm được" |
| `delivery status` | `deliveries.status` | Chờ xuất hàng/Đã xuất hàng/Đã nhận/Đã giao/Đã giao một phần/Chờ giao lại/Đang xác nhận/Dừng/Hủy — "hàng đi tới đâu". **Không gọi chung hai thứ là "trạng thái"** [§7-7; QĐ v2.1 S5] |
| Phân loại giao hàng | `contract_delivery_channels` | (nhóm nhiệt độ/vật tư × kho × công ty vận chuyển); giữ `lead_time`, `service_form`, `delivery_regime` [§5-3] |
| Loại chuyến | `service_form` | ES配送便 / COOL配送便 / 資材便 (nằm ở phân loại giao hàng, không ở route) |
| Thể chế giao hàng | `delivery_regime` | `self` / `partner_driver` / `parcel_carrier` (mặc định ở kênh, giá trị thật theo từng leg) |
| final leg | `delivery_legs.is_final_leg` | Chặng cuối; **chỉ regime của nó quyết định "xem như hoàn tất"** [§11-2] |
| Lead time | `lead_days` / `lead_time` | 0–7 ngày, giữ theo phân loại giao hàng của hợp đồng; **master kho không giữ, không tự điền** [§5-4] |
| Override đã phê duyệt | `delivery_overrides` (`move/skip/fix`) | Điều chỉnh "chỉ lần này", giữ bằng ngày tuyệt đối [§8-1] |
| "Cần xác nhận" | `review_items` (open/resolved/ignored) | Bảng thực; batch chỉ UPSERT, chỉ vận hành mới đóng [§15-9] |
| Con tự động của sự cố | `duplicate_type=trouble_pending`, `creation_source=trouble_auto` | Tạo cùng giao dịch khi đăng ký sự cố loại giao nhầm/vắng mặt/hư hỏng; tối đa 1 con còn sống [§13-2] |
| Hợp đồng cha / con | `contract_delivery_channels` / `contract_month_*` | Cha = mặc định; con = giá trị thực tế của tháng, snapshot [§5-2] |

ID/format: kho `WH`+5 số (picking), `HU`+5 số (trung chuyển, "HU=Hub" **tạm**), `RT` điểm trả hàng (tạm) [§3-1, 2-4]; hợp đồng `CP`+7 số, hợp đồng con `CPxxxxxxx-yyyymm` (yyyymm = tháng chu kỳ); số giao hàng `DL-yymmdd-nnnn` (yymmdd = ngày xuất dự kiến lúc tạo, **không đổi khi đổi ngày**; ngày xuất thực ở `shipped_date`); nhánh nhân bản `DL-…-1`…`-9`; lệnh xuất `DL-… / revN`; vận đơn do ES đánh `DL-…-NN` (số thùng 2 chữ số) [§2-4, 10-5]. Khóa duy nhất plan: `contract_id+line_no+channel_id+cycle_id+occurrence_key`, **cấm dùng `(contract_id, delivery_date)`** [§7-2].

## 3. Quy tắc nghiệp vụ đã chốt (BA không được mâu thuẫn)
**Chu kỳ & ngày**
1. Chu kỳ chỉ có 1 (không có chu kỳ riêng cho xuất hàng). `A1` đầu bắt buộc thứ Hai (làm tròn về thứ Hai trước); mặc định tiếp nối sau `D7` chu kỳ trước. Thời gian thiết lập cơ bản 6 tháng; **không tạo cuốn chiếu (rolling)**, chỉ tạo khi lưu [§4-1, 4-2, 7-6].
2. Tháng hiện tại và tháng sau (đã mở đặt hàng) không sửa được chu kỳ; giới hạn dưới là "tháng sau nữa". Tháng chưa thiết lập → không tạo plan/delivery, không công khai menu được, DN không xin đổi ngày. Cảnh báo sắp hết hạn chỉ hiện trong màn hình, **không tạo thông báo dashboard** [§4-2, 4-3; QĐ #14].
3. Mốc lấy từ menu và **sao chép vào chu kỳ** (`order_start_date`, `order_close_date`); chưa có menu → hạn chốt tạm = ngày 15 tháng trước (`marker_source=provisional`). Với hạn tạm **chỉ được**: đóng tiếp nhận thay đổi + chạy kiểm tra; **không** chốt số lượng, gửi mail xác nhận, gửi lệnh xuất hàng [§4-3; QĐ v2.1 #9].
4. Tạm dừng chu kỳ: ưu tiên cao nhất, không tiêu thụ slot, số lần giao không giảm. Tổng ngày phải là bội 7; phần thiếu `7−(n mod 7)` do hệ thống tính-hiển thị, **quản trị viên chọn chỗ đặt "điều chỉnh", không tự chèn; chưa đủ bội 7 thì không lưu được**. Nghỉ ngắn dời 1–2 ngày → "ngày coi là lễ giao hàng"; nghỉ dài ≥3 ngày → tạm dừng (hướng dẫn vận hành, không phải ngưỡng cứng) [§4-5; QĐ v2.2 #2].
5. Slot sau tạm dừng chỉ được dời **muộn** (không quay trước thời điểm tạm dừng); ở ranh giới A1/C1 tự đảo sang muộn, D7 đảo sang sớm [§4-5, 6-3].
6. Ngày picking = ngày giao − lead time (luôn tính ngược, tìm theo hướng sớm). Thuật toán: ứng viên tối đa 20 ngày; ưu tiên chênh lead time 0 → cho phép +1 ngày (vàng, tự chốt) → chênh lớn hơn thì đỏ + "cần xác nhận"; không có ứng viên trong 20 ngày → "không thể tạo dự kiến" (không tự chọn ngày) [§6-1…6-4; REQ-DL-824].
7. Gặp ngày/ô không xuất hàng được: trước dời sớm picking (nếu còn chênh 0), nếu không thì dời **cả** picking và giao theo lùi sớm/muộn của hợp đồng. Dời >3 ngày so với ô gốc → cần xác nhận. Thứ ưu tiên: tạm dừng loại trừ > (lễ/thứ không giao/ngày cơ sở không nhận) > (ô/ngày không xuất) [§4-6, 4-7, 6-3].
8. Khi đổi cấu hình ô không xuất: `draft` tự tạo lại; `draft` có override → đẩy sớm picking, cần dời giao thì thành "đang đề xuất"; `published` **không dời**, vào "cần xác nhận"; `locked` ngoài đối tượng. Lưu màn 01 phải xem trước số lượng ảnh hưởng [§4-6, 3-6, 6-3].
9. Khung giờ nhận hàng: bảng con nhiều dòng (`site_receive_windows`), **cấm 1 cặp from/to**; snapshot vào `delivery_receive_windows` khi tạo delivery (không snapshot ở draft); không dùng tính ngày [§3-7; QĐ v2.1 #8].
10. Số lần giao hàng 1 chu kỳ: 1–8 (`delivery_count`); lead time 0–7; chỉ định riêng chỉ có "ngày N hàng tháng (1–28)" và "cuối tháng"; `on_demand` **chỉ cho vật tư** [§5-1, 5-7].

**Hợp đồng & tuyến**
11. 1 hợp đồng = 1 cơ sở; hợp đồng cha = mặc định, hợp đồng con = thực tế của tháng; tạo plan dùng snapshot hợp đồng con nếu đã có (`route_snapshot_source`) [§5-2, 7-4].
12. Công ty vận chuyển ①② **luôn bắt buộc cả hai**; không trung chuyển → nhập cùng 1 công ty vào cả hai; điểm trung chuyển phải chọn "Không" tường minh; không giả định trung chuyển ≥2 tầng; chặng 1 chọn được cả công ty ủy thác [§5-1, 5-3; QĐ v2.3 #50].
13. Tùy chọn "Thêm lần giao hàng" tự sinh khi số lần vượt chuẩn gói theo từng nhóm nhiệt độ, không bù trừ; số lần giao = 0 không lưu được [§5-1]. Trong hợp đồng con có ghi đè tuyến theo từng lần (`slot_routes`) — phương án B [§5-1].
14. Đổi kho/tuyến hợp đồng áp dụng từ **tháng áp dụng** (A1 của chu kỳ tháng sau nếu đăng ký trong kỳ đặt hàng; tháng sau nữa nếu sau hạn chốt). Thay đổi hàng loạt tuyến: lọc/CSV, xem trước ảnh hưởng, thông báo "kết thúc/thêm phụ trách" cho đơn vị ủy thác [§5-8, 5-10].
15. Sản phẩm × kho nhiều-nhiều; không có kho thay thế (đổi kho phải vận hành xử lý ở "cần xác nhận"); không chuyển ngang kho ở Phase 2 [§3-4, 9-2].

**Đổi ngày / khóa / dừng**
16. **`locked` chỉ do 1 sự kiện: lệnh xuất hàng gửi thành công lần đầu.** Xuất file, gửi lỗi, gửi lại, gắn vận đơn đều không `locked`; vận đơn xuất hiện trước lệnh → giữ `published` + anomaly "cần xác nhận". Cấm `published→draft`, `locked→published`, nhân bản từ `draft` [§7-7, 8-2, 10-2; QĐ v2.1 #3,#5].
17. **Quy định đổi ngày hiện hành (sửa 2026-10-02, sổ L)**: ranh giới là **kết thúc "thời kỳ đặt hàng chính thức"** (nửa đầu = B5~C1 chu kỳ trước, nửa sau = D5~A1 chu kỳ sau); trước đó đổi bao nhiêu chuyến cũng được (chọn bằng checkbox ở lịch, không kéo thả); sau đó đến trước ngày xuất 1 ngày: chỉ **1 chuyến/lần**, bắt buộc lý do, cùng nửa A↔B / C↔D; từ ngày xuất hàng: hủy + nhân bản. Ngày picking & giao dời cùng nhau giữ lead time; lệnh đã gửi → gửi lại `rev+1` [§8-3].
18. Đổi ngày sau ranh giới KHÔNG dùng "chỉ định ngày riêng"; kho picking không đổi được (hủy + nhân bản). Lý do để trống chỉ được phép với thay đổi 1 lần trước hạn chốt; lịch sử trước→sau + người thao tác luôn lưu; hủy/dừng/nhân bản/đổi hàng loạt/hủy override luôn bắt buộc lý do [§5-8, 8-3, 17-2].
19. Sau lệnh xuất đổi được: công ty vận chuyển ②/tài xế (gửi lại qua `ship_order_diff`), địa chỉ nơi giao (vận đơn cũ → `voided`, phát hành lại, `rev` mới). Không đổi `locked_at` [§15-13; QĐ v2.2 #3].
20. Yêu cầu đổi ngày của DN: trong khoảng chu kỳ đã tạo (≤6 tháng, trừ ngày quá khứ/tháng hiện tại), cùng chu kỳ, cùng nửa; lạnh+đông lạnh cùng cơ sở-cùng ngày dời cùng nhau; 2 nguyện vọng hoặc "giao vận hành"; không tự động từ chối — 3 ngày trước hạn chốt vào `change_request_due`, quá hạn vẫn giữ đến khi vận hành xử lý [§5-9; QĐ v2.3 #37]. Override chỉ nhận tới tháng sau nữa [§5-9].
21. Hủy/tạm dừng hợp đồng: chu kỳ đã qua hạn chốt đặt hàng **vẫn thực hiện đến cùng**; ngày hủy luôn là cuối chu kỳ; trong tạm dừng không sinh plan, tiếp tục thì sinh lại; hủy cơ sở ES配送便 → thông báo đơn vị ủy thác (web + mail) khi vận hành phê duyệt [§8-7].

**Picking & lệnh xuất**
22. Ngưỡng 300 đơn/ngày/kho (mặc định) **chỉ cảnh báo**, đếm theo số đơn, **không tính vật tư**. Danh sách picking chỉ xem trên màn hình/xuất CSV, **không xuất PDF** [§9-3, 9-4].
23. Lệnh xuất (Thomas): theo kho, gộp 2 tuần (A+B / C+D), gửi **thứ Sáu 3 ngày trước ngày bắt đầu** (`ship_order_lead_days` mặc định 3, ở master kho), catch-up hằng ngày; **không có hủy** — dừng = gửi lại `qty=0`, ghi đè bằng `rev`; gửi lại được **đến khi nhận kết quả xuất hàng**. Đông lạnh/lạnh xuất riêng [§10-1, 10-3, 10-6; QĐ v2.2 #4, v2.3 #45].
24. Điều kiện gửi lệnh: `published`, Chờ xuất hàng, `schedule_confirmed` & `quantity_confirmed` = true, không phải con `trouble_pending`, hạn chốt không tạm [§10-1].
25. Vận đơn 1-nhiều (theo thùng), **không gộp xuất**; ES đánh số chỉ khi bên ủy thác đến kho lấy hàng; trung chuyển không phát hành lại; "có cần vận đơn" theo việc có đoạn qua công ty vận tải [§10-5; QĐ #54,#55, v2.3 #47].
26. Kho văn phòng ES xuất vật tư: "liên kết THOMAS = không" → không gửi lệnh Thomas, làm bằng danh sách picking + CSV vận đơn Yamato [§3-1, 10-9].
27. Hạn sử dụng ngắn: nếu ngày(xuất→giao) > `shelf_life_days` − `shelf_life_safety_days` (mặc định 2) → `shelf_life_warning`; **vận hành tự quyết có tách hay không** [§9-4; QĐ v2.3 #35].

**Thực hiện giao & sự cố**
28. `Đã nhận` chỉ vào từ app tài xế ES (lần nhận đầu); nhận chặng sau ở trung chuyển chỉ ghi `picked_up_at/by`. Không có trạng thái trung gian của trung chuyển (relay là giá trị suy ra) [§7-7, 11-3; QĐ v2.3 #49].
29. final leg = `parcel_carrier` → batch 06:00 hôm sau coi "Đã giao (xem như)" (`completion_source=presumed`); final leg = `self/partner_driver` → **không** xem như, đưa vào missing queue. Hai job không chồng đối tượng; bản ghi có sự cố chưa giải quyết bị loại cả hai [§11-2, 11-5; QĐ v2.1 #4, v2.3 #25].
30. **Báo cáo sự cố/liên lạc sau giao KHÔNG đổi `delivery status` của bản cha** (Đã giao vẫn Đã giao); mở báo cáo + "cần xác nhận"; vận hành (logistics) giải quyết và **đóng trực tiếp bản cha** (giao đủ→Đã giao; giao một phần→Đã giao một phần + con số còn lại; không giao & gửi lại→Chờ giao lại + con toàn bộ; kết thúc→Dừng; quay lại trong ngày→Đã nhận). Giải quyết theo đơn vị lần giao, 1 giao dịch [§7-7, 13-2; QĐ v2.3 #20,#21,#29].
31. Con nhân bản/tự động: tạo ở `Đang xác nhận`, ngoài đối tượng lệnh xuất/vận đơn/phân công/thanh toán/xem như hoàn tất cho đến khi vận hành chốt ngày & số lượng. Cha-con chỉ 1 cấp, nhánh 1–9 (vượt → `DOMAIN_BRANCH_LIMIT`); sự cố ở con → nhánh kế tiếp của cha. "Giao một phần, không gửi phần còn lại" cần lý do, không con [§8-4, 13-2; QĐ v2.3 #23,#28,#31].
32. 6 loại sự cố (master `trouble_types`, cờ `auto_child` vận hành đổi được): sai lệch SL (không tạo con), giao nhầm/hư hỏng/vắng mặt (tạo con), chậm trễ (không; tự giải quyết nếu sau đó báo giao đủ), khác. "Thiếu hàng・giao nhầm" của app do vận hành phân loại; giữ nguyên văn `app_reason_raw` [§13-1].
33. Phân biệt `Dừng` (đã xuất khỏi kho) và `Hủy` (chưa xuất); cả hai thực tích 0, không thanh toán, bắt buộc lý do. Cước vận chuyển theo `freight_billable` (mặc định không; "có" cần lý do) [§7-7, 13-4; QĐ v2.3 #11,#40].
34. Hàng thay thế: thanh toán theo giá sản phẩm gốc (`substituted_from_product_id`); hủy bỏ không phải trạng thái (`disposed_qty`); gửi trả trụ sở = nhân bản `duplicate_type=return`, ngoài thanh toán, **chỉ trường hợp này mới đổi nơi giao sang điểm trả hàng** [§13-6, 8-4; QĐ v2.3 #39,#41].
35. Phân công tài xế: theo leg; leg `parcel_carrier` không gán; **không có đổi tài xế hàng loạt**; bản con không kế thừa phân công; cho phép sau `locked`. 3 ngày trước giao & ngày hôm trước chưa gán → `assignment_missing` + email đơn vị ủy thác (chặng ủy thác) [§12-1; QĐ v2.3 #43,#48].
36. Web DN dùng tên hiển thị riêng (Hủy có chuyến thay → "Đang điều chỉnh ngày giao hàng"; con → "Đang chuẩn bị giao lại"; …); **không hiện "Đang xác nhận"**. `draft` chỉ hiện ngày + dấu "Kế hoạch", không hiện số lượng [§15-10, 8-9; QĐ v2.3 #42].
37. Đơn vị ủy thác: dự kiến chỉ tới chu kỳ tháng sau (ngày/cơ sở/nhiệt độ/số bản ghi, dấu "Dự kiến"); sau hạn chốt đặt hàng thấy toàn bộ mục [§11-6; QĐ v2.3 #34].

**Thanh toán**
38. Chốt theo **tháng dương lịch của ngày giao thực tế** (cha-con chỉ là cách gộp phiếu); hủy sau hạn chốt = không thanh toán, không có phí hủy; sửa thực tích sau khi đã chốt → điều chỉnh tháng sau (adjustment trong ① trả trước/② tất toán thực tế, không có bảng ③) [§14-1…14-3; QĐ #69,#70].
39. Mỗi hóa đơn chỉ 1 hạn thanh toán (tách theo `billing_type`/`payment_due_date`); chốt ngày 20 → xác nhận ngày 25 → Bill One phát hành ngày 1 tháng sau; đối chiếu thu tiền/nhắc nợ thuộc Bill One [§14-4; QĐ v2.1 #10].
40. Chốt số lượng (`order_finalize`): không đơn hàng → số lượng tiêu chuẩn (AI OFF) hoặc AI đặt (AI ON, theo cơ sở); SL chốt = 0 hợp lệ (xử lý như hủy) [§14-5].

## 4. Trạng thái & dữ liệu chính
- **Máy trạng thái ①** `plan lifecycle` [§7-7]: `draft` (chỉ plan; DN thấy ngày) →(Batch, qua ngày bắt đầu đặt hàng) `published` →(Hệ thống, lệnh xuất gửi OK lần đầu) `locked`. `draft` bị xóa khi duyệt tạm dừng/hủy HĐ (vận hành). Không chuyển ngược.
- **Máy trạng thái ②** `delivery status` [§7-7] — ai chuyển:
  - (—)→Chờ xuất hàng: Batch · Chờ→Đã xuất hàng: Hệ thống (nhập CSV kết quả xuất/vận đơn) · Chờ→Hủy: vận hành.
  - Đã xuất→Đã nhận: tài xế (app ES) · Đã giao: tài xế; Đã giao (xem như): Batch · Dừng (từ Đã xuất/Đã nhận): vận hành.
  - Đã giao một phần / Chờ giao lại / Dừng / Hủy(con) / Đang xác nhận→Chờ xuất hàng: **chỉ vận hành (logistics)**.
  - Trạng thái cuối: Đã giao, Đã giao một phần, Chờ giao lại, Dừng, Hủy. `Đang xác nhận` không phải trạng thái cuối, chỉ dành cho con.
- Trục khác (không phải máy trạng thái): `change_request_status` (Có thể đổi/Đang yêu cầu/Đang đề xuất/Đã điều chỉnh/Không thể đổi; "Đã điều chỉnh" là giá trị suy ra từ override); relay (suy ra) [§7-7].
- Cột/bảng chính: `delivery_cycle_settings` (1 bản ghi), `delivery_cycles`, `delivery_cycle_days`, `delivery_cycle_pauses`, `warehouse_non_picking_*`, `contracts`, `contract_delivery_lines/channels`, `contract_routes`/`contract_month_routes`/`delivery_legs` (3 bảng route, đã bỏ `delivery_routes`), `shipping_plans`, `deliveries`, `delivery_lines`, `delivery_tracking_numbers`, `ship_orders`, `invoices`, `review_items`, `change_requests`, `delivery_overrides`, `trouble_reports`/`trouble_types`, `delivery_parking_reports`, `carrier_coolers`, `carrier_quote_responses`/`delivery_inquiries` [§16, DM14.x]. Độ dài text: 60 ký tự (1 dòng), 255 (địa chỉ), 500 (nhiều dòng) [DM14.0].
- Batch hằng ngày (catch-up, chạy cả ngày lễ; chuỗi 5 job dừng nếu bước trước lỗi): `contract_monthly_generate` 01:30 → `plan_rollout` 02:00 → `delivery_materialize` 02:30 → `order_finalize` 02:45 → `plan_recheck` 03:00; `billing_issue` 04:30; `billing_gap_detect` 05:00; `delivery_presume_complete`/`delivery_detect_missing` 06:00; `tracking_anomaly_detect`/`ship_order_diff` 07:00. `trouble_auto_duplicate` **đã bỏ 2026-09-29** [§17-1, AP16].
- Hợp đồng `provisional`, `suspended`, `ended` không được tạo plan/delivery/hợp đồng con; xác định cơ sở (đăng ký chính thức) chạy ngay 3 job cho cơ sở đó [§7-3; QĐ v2.3 #52].
- Vật tư: không có `draft`; tạo `published` mỗi lần chốt giỏ; cùng cơ sở-cùng ngày giao-chưa gửi lệnh thì gộp 1 bản ghi; ngày giao = ngày giao được đầu tiên sau ngày đặt thỏa lead time [§7-5; QĐ v2.3 #36,#38].
- Dùng thử: đơn tự sinh khi đăng ký tạm; chốt đặt hàng (nhập hàng) = B7/D7; giao từ tuần A (hoặc C) của chu kỳ kế tiếp [§7-9].
- Phân quyền: bảng thao tác theo vai trò (logistics/CS/kinh doanh/DN/ủy thác) ở [§17-3]. Lịch sử thay đổi lưu 24 tháng; ảnh 12 tháng; tài xế xem ≤90 ngày sau hoàn tất [§17-2, 12-4].

## 5. Liên kết với nhóm khác & hệ thống ngoài
- **THOMAS (kho)**: CSV lệnh xuất (theo kho, `warehouse_code` do vận hành nhập, đơn vị `thomas_csv_unit`) ↔ CSV kết quả xuất hàng + số vận đơn (~19:00). Lớp xuất file tách riêng (cột/tên cột/header/bảng mã), UTF-8 nếu không được thì Shift_JIS [§10-1, 10-4; AP19.1–19.4; QĐ v2.3 #45].
- **Yamato** (và Sagawa…): Giai đoạn 2 chỉ có 2 liên kết CSV (lệnh xuất + số vận đơn); **API Yamato / lấy tình trạng tự động = Giai đoạn 3** [§1-1, 10-8]. Mẫu URL tra cứu vận đơn theo công ty vận chuyển giữ trong master (`{送り状番号}`) [§3-3].
- **Bill One**: nhận dữ liệu thanh toán (hóa đơn); thu tiền/nhắc nợ ở Bill One [§14-4].
- Menu/đặt hàng (nhóm menu & order): nguồn các mốc (công khai menu = bắt đầu đặt = ngày 1 tháng trước; hạn chốt = ngày 15 tháng trước ở demo), `order_quantities`; công khai menu bị chặn nếu chưa thiết lập chu kỳ [§4-3, DM14.12].
- Hợp đồng/đăng ký (28-xx) & gói/giá (`plan_rates`, snapshot hợp đồng con); số tiền DN chịu 100 yên + thuế suất 8%/10% [§14-2]. Thông báo/email: đặc tả chức năng chung. Hàng thay thế 3 mẫu: đặc tả quản lý menu [§13-6].
- Web công ty vận chuyển (E05), app tài xế (E06), Web doanh nghiệp (E02, màn 07): xem §1. Quy tắc mã màn hình (`OW_`, `DA_`, `CW_`…) thuộc `screen-code-rule.md`, không có trong nhóm này.
- `配送_10` (§18-1 "mục chưa quyết", §20 mâu thuẫn còn lại) được dẫn chiếu nhưng **không nằm trong nhóm đã đọc** (suy luận: file riêng).

## 6. Điểm mở / Cần xác nhận / mâu thuẫn
**Còn mở (⚠️ trong tài liệu)**
- #2: vận hành tay đổi ngày từng bản ghi sau hạn chốt có kịp khi số lượng lớn không [§3-7 ghi chú, 8-3].
- #3/#25/#30, #28, #29: Thomas có I/F hủy không (đã chốt không dùng), định nghĩa cột CSV chỉ thị, UTF-8 — chờ nhà cung cấp [§10-4, 10-9].
- #5/#33: ý nghĩa "HU" và có dùng ID trung chuyển ở vận đơn/CSV/biểu mẫu không (tạm: chỉ nội bộ) [§2-4, 10-9].
- #8/#38: tên chính thức "Yamato Transport (Yamato)", "Thomas" (quan hệ Kurubin Yamato, cách viết THOMAS) [§3-7, 10-9].
- #9/#42: túi/gói giữ lạnh qua Yamato dùng một lần hay thu hồi (tạm: dùng một lần, chỉ ghi số/sổ) [§12-5, 14].
- #10/#43: có cần "tên công ty" trong quản lý tài xế không (chờ công ty D) [§3-7, 14].
- #16: "phân loại giao hàng" dùng 2 nghĩa; `service_form` 2 hay 3 giá trị (ES/COOL/vật tư) [§6-5 cuối].
- #17: giữ lead time từng leg (tham khảo) ở đâu khi có trung chuyển [§6-5 cuối].
- #27/#45: xác nhận đặc tả thanh toán hiện hành (ngày chốt đã quyết 20→25→1; còn phân biệt trả trước/sau) [§8-9, 14].
- #41: số điện thoại logistics `050-5784-2777` vs `050-3784-2771` — số nào hiện hành (tạm) [§12-2, 14]; #44: đa ngôn ngữ app tài xế (tạm) [§14].
- Báo giá ủy thác: đơn vị phí thanh toán (mỗi lần/hàng tháng), phí chia nhỏ hơn tỉnh, giữ hiệu lực/"trả lời lại"; cách đưa phụ phí vùng vào tùy chọn hợp đồng con (tự tạo/vận hành nhập) [§3-3].
- Vật tư: cách đếm số đơn khi 1 cơ sở có loại chuyến chia theo nhiệt độ [§10-9]; sự cố chỉ một phần thùng không tới sau "xem như hoàn tất" (§18 No.23 của `配送_10`) [§13-2]; tự chép số túi/gói lạnh từ master [§12-5]; hỗ trợ responsive Web ủy thác (tạm) [§12-6]; lưu trữ ảnh ~260GB (tạm) [§17-4]; chạy song song 1 tháng khi chuyển đổi [§17-5].
- Chương 11/12: `warehouse_code` vs ID kho; `ship_order_no` = `ship_orders.id+rev` hay `delivery_no`+rev; `site_attachments`, `delivery_notifications`, `batch_errors` chưa có định nghĩa cột trong DEV; bảng cài đặt hàng thay thế thuộc đặc tả menu; `DOMAIN_DATE_OUT_OF_RANGE`, bảng đơn hàng dùng thử/bộ khởi tạo (DM14.12) là **【Đề xuất】** [DM14.14, AP18–19].

**Mâu thuẫn/dễ nhầm (bản mới thắng)**
- Đổi ngày: bảng "hạn chốt đặt hàng" ở §5-8/§8-3 (cũ), §15-8, §4-3 đã **bị thay bằng quy định 2026-10-02 (thời kỳ đặt hàng chính thức, 1 chuyến/lần, cùng nửa)** — nhưng một số chương (§1-4, §5-8, §9-5, §17-3) vẫn mô tả theo "hạn chốt đặt hàng"; dùng §8-3 "Quy định hiện hành" làm chuẩn.
- Khu vực phụ trách của kho picking: §1-3 (06B) còn ghi "T4-2 chọn nhiều tỉnh/thành", nhưng §3-1 ghi **đã hủy đêm 2026-10-01 (Q-E=A)**; theo bản mới: không chia kho theo khu vực (1 kho → kho đó; nhiều kho → vận hành chọn).
- Mã kho Thomas: AP19.1 vẫn ghi "dùng ID kho `WH00001`" nhưng §3-1 #8 (2026-10-01) quy định **vận hành nhập, tách khỏi ID kho**.
- Chỉ thị xuất hàng vật tư: bản cũ "catch-up hằng ngày" → bản mới (2026-10-01) **không gửi Thomas** [§7-5, 10-9].
- Đã thay thế: "tự chèn điều chỉnh tạm dừng" → quản trị viên chọn chỗ [§4-5]; `Đang xác nhận` của bản cha khi có sự cố (bỏ 2026-09-24) → bản cha giữ nguyên trạng thái; batch tạo con khi quá hạn (bỏ 2026-09-29) → tạo ngay khi đăng ký báo cáo.
- Trùng ID yêu cầu REQ-DL-701~718 (phần 09/14 và 09/25・09/29) [§0-4].

## 7. Khi BA phân tích tính năng thuộc nhóm này
1. Tính năng chạm "trạng thái" nào — `plan lifecycle` hay `delivery status`? Ghi rõ trục; không dùng từ "status" chung. Kiểm tra `locked` chỉ do lệnh xuất gửi OK lần đầu.
2. Có thay đổi ngày/số lượng sau hạn chốt đặt hàng không? Áp dụng quy định 2026-10-02 (1 chuyến, cùng nửa, bắt buộc lý do, từ ngày xuất = hủy + nhân bản) và hỏi PM nếu tính năng cần bulk-edit sau ranh giới (nối với điểm mở #2).
3. Đã xét đủ ràng buộc ngày: tạm dừng, lễ giao hàng, thứ không giao/ngày cơ sở không nhận, ô/ngày không xuất của kho, lead time 0–7, lùi sớm/muộn, hướng đảo ở ranh giới chu kỳ, dời >3 ngày, "không tạo được dự kiến"? Mỗi lần dời/vào "cần xác nhận" phải kèm lý do hiển thị (ngắn ở danh sách, đầy đủ ở tooltip/chi tiết).
4. Tính năng có sinh bản ghi con (nhân bản, giao một phần, giao lại, sự cố tự động) không? Cần: cha-con 1 cấp, nhánh ≤9, `Đang xác nhận` ngoài lệnh xuất/vận đơn/thanh toán, tối đa 1 con tự động/lần giao, và ai (chỉ logistics) được chuyển trạng thái.
5. Ai là actor? Không đưa vai trò "quản lý kho"; tab kho chỉ là filter; ủy thác chỉ thấy/thao tác leg của mình; DN chỉ thấy dự kiến ở dạng ngày + "Kế hoạch"; tài xế chỉ báo cáo. Tên hiển thị trên Web DN phải theo bảng §15-10.
6. Tính năng có liên quan thanh toán không? Dùng tháng dương lịch của ngày giao thực tế; hủy/dừng/trả hàng/con chưa chốt không thanh toán; sửa sau chốt → điều chỉnh tháng sau; cờ `freight_billable`.
7. Có phụ thuộc kết nối ngoài chưa chốt (cột CSV Thomas, UTF-8/Shift_JIS, Yamato Phase 3, mẫu URL theo dõi)? Ghi rõ "tạm", tách lớp xuất; hỏi PM/khách trước khi đóng AC.
8. Với vật tư / dùng thử / hạn chốt tạm: không có `draft` ở vật tư, không chạy `order_finalize`/email/lệnh xuất khi hạn chốt tạm, ngày chốt dùng thử là B7/D7. Thông báo/email nằm ngoài nhóm: chỉ ghi "cần thông báo" và dẫn đặc tả chức năng chung, không tự định nghĩa nội dung.
