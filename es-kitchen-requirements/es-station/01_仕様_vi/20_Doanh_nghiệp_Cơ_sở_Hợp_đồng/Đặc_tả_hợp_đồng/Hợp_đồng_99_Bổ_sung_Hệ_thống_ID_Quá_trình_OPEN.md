# Đặc tả hợp đồng: Bổ sung (hệ thống ID・các quyết định ngày 25/09/2026・các OPEN còn lại)

<!-- Nguồn: 20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md (tách ngày 03/10/2026. Nội dung chính giữ nguyên như thời điểm tách) -->

## Phần II　Bổ sung

### Hệ thống ID (xác định 15/09/2026)

| Đối tượng | Định dạng | Ví dụ | Kiểu |
|---|---|---|---|
| ID doanh nghiệp | `CU` ＋ số thứ tự (tối thiểu 5 chữ số) | `CU00001` | varchar(20) |
| ID cơ sở | `CU` ＋ số thứ tự (tối thiểu 5 chữ số) | `CU00643` | varchar(20) |
| ID hợp đồng (hợp đồng cha) | `CP` ＋ số thứ tự (tối thiểu 6 chữ số) | `CP000001` | varchar(20) |
| ID hợp đồng con | ID hợp đồng ＋ `-yyyymm` (**hợp đồng・tháng chu kỳ**) | `CP000001-202607` | varchar(30) |
| ID gói (master gói) | `ES` ＋ số thứ tự (tối thiểu 6 chữ số) | `ES000012` | varchar(20) |
| ID dòng máy (master dòng máy) | 2 ký tự phân loại dòng máy ＋ số thứ tự (tối thiểu 6 chữ số). RF／FZ／VM／MW／HW／BX (trước đây: không có FZ. Sửa theo master ⑫-3 ngày 03/10/2026) | `RF000001` | varchar(20) |
| **ID tùy chọn** (master tùy chọn) | `OP` ＋ số thứ tự (tối thiểu 6 chữ số) | `OP000001` | varchar(20) |
| **ID giảm giá** (master giảm giá) | `DC` ＋ số thứ tự (tối thiểu 6 chữ số) | `DC000001` | varchar(20) |
| ~~**ID áp dụng** (tùy chọn・giảm giá của cơ sở)~~ | **Bãi bỏ**: tùy chọn・giảm giá do hợp đồng con nắm giữ (28-144/145). Một dòng được xác định bằng "ID hợp đồng con ＋ mã tùy chọn／giảm giá". `AP-` chỉ dùng cho số tiếp nhận của đăng ký mới 〔trả lời của hong 03/10/2026 (K7＝A)〕 | ~~`AP-0001`~~ | — |

> `-yyyymm` của ID hợp đồng con đã được xác định. **yyyymm là tháng hợp đồng (tháng chu kỳ) của hợp đồng con** 〔trả lời của hong 03/10/2026 (K6)〕.

Số chữ số không cố định. Chỉ cần giữ định dạng tiền tố ＋ số thứ tự, khi số lượng tăng lên thì số chữ số tăng theo cũng không sao.
Khóa duy nhất là **`UNIQUE(hợp đồng cha, hợp đồng・tháng chu kỳ)`**. Tháng thanh toán được quyết định riêng theo lead time phát hành hóa đơn của doanh nghiệp, nên không thể đọc ra tháng thanh toán từ ID hợp đồng con.

### Những điều đã quyết định ngày 25/09/2026

| Hạng mục | Quyết định |
|---|---|
| Lead time phát hành hóa đơn theo từng cơ sở | **Cho phép ghi đè theo từng cơ sở**. Giữ lại "Ghi đè lead time phát hành hóa đơn" |
| Thứ tự khi chồng nhiều giảm giá | **Nhập thứ tự áp dụng cho từng giảm giá** |
| Tháng bắt đầu có hiệu lực của loại liên động A | Thay đổi trước hạn chót đặt hàng (mặc định ngày 15 tháng trước) thì tính phí từ hợp đồng con của tháng sau, nếu quá hạn thì tính từ tháng sau nữa (trước đây: từ hợp đồng con của tháng sau. Sửa theo 契約_01 §4 ngày 03/10/2026). Không giữ "tháng bắt đầu có hiệu lực" trong master tùy chọn |
| Có hiển thị danh sách hóa đơn trên Web doanh nghiệp hay không | **Hiển thị** (tab "Giá・thanh toán" của hợp đồng con vẫn không hiển thị) |
| Lấy tình trạng thanh toán | **Không lấy** từ Bill One. Danh sách hóa đơn không có cột tình trạng thanh toán |
| Chốt kỳ và tháng thanh toán của quyết toán thực tế (②) | **Chốt ngày 20・xác định ngày 25・gửi ngày 1 tháng sau. Tháng thanh toán là tháng sau tháng chu kỳ** (21/6〜20/7 là hóa đơn gửi ngày 1/8) |
| Cách giữ số tiền | Giữ theo **chưa thuế ＋ thuế suất**, thuế tiêu dùng được cộng thêm theo từng thuế suất trên hóa đơn (cả gói・dòng máy・tùy chọn・giảm giá) |

### Các OPEN còn lại (sau cuộc họp định kỳ 15/09/2026)

| Hạng mục | Vấn đề | Người phụ trách |
|---|---|---|
| ~~Phê duyệt của vận hành khi thay đổi chế độ khách~~ | Đã chốt (02/10/2026): không cần phê duyệt・phản ánh ngay ＋ thông báo cho vận hành | — |
| ~~Quy tắc giới hạn dưới của đơn hàng~~ | ~~Giới hạn dưới của đồ đông lạnh là từ 10% trở lên hay là 0. Giới hạn trên đã quyết định là 30% (không bãi bỏ, xử lý bằng gói riêng)~~ **→ Đã chốt 30/09/2026: đồ đông lạnh không có giới hạn trên・dưới theo tỷ lệ (%), mà quyết định bằng số lượng của gói (số lượng cung cấp hằng tháng đồ đông lạnh trong master gói) (bảng yêu cầu dòng 170)** | — |
| Công thức của master gói | Công thức tính số tiền gói, hiển thị chi tiết số tiền doanh nghiệp chịu・số tiền nhân viên chịu. Màn hình master gói hiện tại không có số tiền miễn trách・số tiền diện tích・tỷ lệ sắp hết. **Đã giải quyết một phần (03/10/2026)**: số tiền doanh nghiệp chịu 100 yên đã gồm thuế／món ăn・thuế suất 8%／10%・2 dòng (28-147〜150), "số tiền diện tích" là nghe nhầm của số tiền miễn trách (28-151), miễn trách・số tiền doanh nghiệp chịu・tỷ lệ × lần so với cơ bản sẽ được phản ánh vào tính toán (danh sách vấn đề 03/10 #10). **Còn lại**: tỷ lệ sắp hết・số người sử dụng | Aoyama (cùng anh Uchida) |
| ~~Đăng ký thay đổi phương thức thanh toán~~ | ~~Hiện không thể đăng ký (vận hành xử lý). Có cho đăng ký trên hệ thống hay không~~ **→ Đã giải quyết**: doanh nghiệp chỉ được xem (không đăng ký được), việc thay đổi do vận hành thực hiện (契約_03 Thanh toán #3・#4 phụ lục 28/09/2026, quy tắc thanh toán 4-6) | — |
| ~~Liên kết HubSpot~~ | ~~Liên kết API với khóa là ID doanh nghiệp・ID cơ sở. Làm ở giai đoạn 2 hay để sau~~ **→ Đã giải quyết**: giai đoạn 2 chỉ gửi chatbot AI và liên hệ tới HubSpot. Liên kết dữ liệu・CRM là giai đoạn 3 (danh sách vấn đề "HubSpot (Phase 2)" 02/10) | — |
| ~~Xác nhận tình trạng giao hàng・liên kết API~~ | **Quyết định (17/09/2026)**: lấy tình trạng là giai đoạn 3 (chỉ thông tin tham khảo). Giai đoạn 2 không có batch, chỉ có liên kết tới trang theo dõi (trước đây: xem xét lấy bằng batch 3 giờ 1 lần) | Aoyama (cùng bên phát triển) |
| ~~Thanh toán hằng tháng của ESQR~~ | ~~Có thể tự động đưa phí hằng tháng khi dùng ESQR vào thanh toán dưới dạng tùy chọn hay không~~ **→ Đã giải quyết**: tự động tạo bằng tùy chọn loại A "Phí sử dụng ES-QR". Trả trước, phần không kịp thì chuyển sang hóa đơn tiếp theo (quy tắc thanh toán 2-7・master Phần II #3) | — |
| ~~Lead time của tuyến giao hàng~~ | ~~Nếu có điểm trung chuyển, có cần giữ riêng số ngày kho→trung chuyển／trung chuyển→cơ sở hay không~~ **→ Đã giải quyết**: chỉ giữ 1 tổng. Chi tiết 1 chặng・2 chặng chỉ để tham khảo, không dùng để tính ngày (quyết định lần 2 ngày 21/09/2026・契約_05 Tuyến giao hàng #6) | — |
| ~~Giới hạn tạm dừng~~ | ~~Tối đa 6 tháng mỗi năm・tiếp tục từ 3 tháng trở lên sau khi mở lại (REQ-CT-239・tạm thời)~~. Tạm dừng được biểu thị bằng trạng thái hợp đồng của hợp đồng cha **→ Đã giải quyết**: tổng cộng tối đa 1 năm (28-10・quy tắc thanh toán 3-2). Không áp dụng "6 tháng mỗi năm ＋ 3 tháng sau khi mở lại" | — |
| Chỉnh lý trạng thái thiết bị | Xem xét lại cấu trúc hiển thị trạng thái của thiết bị, v.v. **Đã giải quyết một phần**: trạng thái cho thuê là Đang giao／Đang cho thuê／Đang yêu cầu thu hồi／Đã thu hồi／Chưa trả (契約_04 #11). Khi hủy hợp đồng không tạo chuyến thu hồi mà ghi lại "dự kiến thu hồi", vận hành bấm "Đã thu hồi" (danh sách vấn đề 02/10). Chưa xác nhận đã xem xét xong hay chưa | Hong |
| Định nghĩa "Chưa trả" | Quá ngày dự kiến trả bao nhiêu ngày thì coi là chưa trả. Cách xử lý khi tình trạng chưa trả kéo dài (hiện chưa có quy trình vận hành. Dừng ở mức phát hiện). **Đã giải quyết một phần**: ngày dự kiến trả < hôm nay mà chưa trả (chỉ cảnh báo・không tính phí. 契約_04 #11・#20). Chưa quyết định số ngày | Aoyama |
| ~~Ai nhập số lượng trả~~ | ~~Vận hành nhập khi thu hồi, hay lấy thông tin từ đơn vị vận chuyển~~ **→ Đã giải quyết**: vận hành bấm "Đã thu hồi" khi thu hồi (hệ thống không quản lý giao・thu hồi thiết bị. Danh sách vấn đề 02/10) | — |
| ~~Tính phí chế độ khách・sử dụng tiền mặt~~ | ~~Có tính phí dưới dạng tùy chọn hay chỉ là thiết lập (thanh toán tiền mặt có chủ trương bãi bỏ từ 25/08/2026)~~ **→ Đã giải quyết**: chế độ khách＝tùy chọn loại A (OP000003・số tiền nhập mỗi lần), tiền mặt＝OP000035 ¥0 (tạm) (master Phần IV #1・bảng ID 01/10) | — |
| Tính trùng phí quản lý thiết bị và tùy chọn | Ở dòng chi phí của ①, phần xuất phát từ master dòng máy (model) và phần xuất phát từ tùy chọn (option) có chồng nhau không (phí quản lý thiết bị chưa đưa vào master. Chờ khách hàng・danh sách vấn đề 03/10 #4) | Hong |
| Trường hợp khách mua đồ ăn kèm lẫn mua qua ứng dụng | Nếu nhân viên cũng thanh toán qua ứng dụng cho hàng công ty đã mua đứt thì bị trùng. Cách xử lý với khách hàng bị lẫn (1002-10) 〔nguồn gốc: 契約_詳細要件 REQ-CT-288・§14〕 | Xác nhận với khách |
| Liên kết kế toán (freee／Xero) | Luồng dữ liệu báo giá・thanh toán, liên kết ID nơi phát hành. Xác nhận lý do triển khai và có cần hay không 〔nguồn gốc: 契約_詳細要件 §8E-5・§10 REQ-CT-253〕 | Aoyama・Dipro |
| Liên kết API với Rentakun (quản lý cho thuê) | Đặc tả API sẽ do giám đốc cung cấp (tên "Rentakun" cần xác nhận lại khi nghe) 〔nguồn gốc: 契約_詳細要件 §7・REQ-CT-178〕 | Giám đốc・Dipro |
| Quyền hạn hợp đồng | Chỉnh lý quyền hạn hợp đồng (nhân viên kinh doanh chỉ đăng ký・không phê duyệt được, giám đốc phê duyệt giá・giới thiệu・phương châm, v.v.) cho khớp với 7 vai trò quyền hạn của vận hành 〔nguồn gốc: 契約_詳細要件 §9〕 | — |
| Trạng thái hợp đồng bảo trì | Xác nhận với bộ phận phụ trách về trạng thái hợp đồng bảo trì (chưa triển khai tới hiện trường) 〔nguồn gốc: 契約_詳細要件 §11〕 | Hong／Aoyama |

**Hoãn lại**: Đặt lịch thay đổi người phụ trách cơ sở vào ngày trong tương lai (khó triển khai nên xử lý bằng thao tác thông thường). ／ Việc quản lý chìa khóa tủ lạnh (số nhận dạng) sẽ xem xét từ giai đoạn 3 trở đi ("số luân phiên" cần xác nhận lại khi nghe) 〔nguồn gốc: 契約_詳細要件 §8F-2〕. ／ Không tạo màn hình riêng "Danh sách thanh toán／chưa thanh toán của tất cả cơ sở" phía vận hành (thiếu sót thanh toán được phát hiện bằng ngày xác định thanh toán) 〔nguồn gốc: 契約_詳細要件 §8D-3〕.

> 44 mục thay đổi do chuyển đổi được tổng hợp trong sheet `02_移行で変わるもの` của bản Excel, các hạng mục đã giảm bớt khỏi màn hình được tổng hợp trong sheet `04_統合した項目`.
> Các hạng mục của master dòng máy・master tùy chọn・master giảm giá nằm trong tài liệu riêng "Danh sách hạng mục master (dòng máy・tùy chọn・giảm giá)" (`Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.xlsx` / `.md`).

<!-- patch_step2_spec_20261001 -->
