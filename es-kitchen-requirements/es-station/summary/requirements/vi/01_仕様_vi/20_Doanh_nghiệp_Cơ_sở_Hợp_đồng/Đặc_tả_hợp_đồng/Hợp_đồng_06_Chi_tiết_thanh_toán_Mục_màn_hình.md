# Đặc tả hợp đồng: Các mục màn hình Chi tiết thanh toán (chốt thanh toán・hóa đơn)

<!-- Nguồn: 20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Doanh_nghiệp_Cơ_sở_Hợp_đồng_Hợp_đồng_con_Danh_sách_mục.md (tách ngày 2026-10-03. Nội dung chính giữ nguyên như tại thời điểm tách) -->

<!-- 2026-10-03 Chỉ chuyển "cấu trúc 2 bảng" từ 契約_07 §0.8 sang. Chốt kỳ・xác nhận・phát hành・hạn thanh toán・thuế・các giai đoạn của trạng thái thanh toán lấy Quy tắc thanh toán §1・2-4 làm chuẩn -->

### 0.8 Số tiền thanh toán của hợp đồng con chia thành 2 bảng: ① Số tiền cố định (trả trước) và ② Quyết toán theo thực tế (trả sau) (2026/09/15)

Số tiền của 1 hợp đồng con có lẫn **2 loại có thời điểm xác nhận khác nhau và hóa đơn đi kèm cũng khác nhau**. Nếu gộp vào 1 bảng thì không biết là thanh toán của tháng nào, nên **chia thành 2 bảng**.

| | ① Số tiền thanh toán cố định (trả trước) | ② Số tiền thanh toán quyết toán theo thực tế (trả sau) |
|---|---|---|
| Nội dung | Phí gói cố định・tùy chọn・thiết bị・giảm giá・chi phí phát sinh (spot) | Chênh lệch quyết toán phát sinh từ kết quả kiểm kê (phần vượt quá mức miễn trách). Chuyển kỳ・bù trừ giữ ở ③ chi tiết điều chỉnh (cũ: điều chỉnh chuyển từ tháng trước. Đã sửa cho khớp với 契約_01 §3 ngày 2026-10-03) |
| Kỳ đối tượng | 1 chu kỳ của hợp đồng・tháng chu kỳ (A1〜D7) (cũ: 1 tháng dương lịch, ví dụ 2026/07/01〜07/31. Đã sửa cho khớp với 契約_00 §0.3 ngày 2026-10-03) | Từ ngày 21 tháng trước đến ngày 20 tháng này (ví dụ 2026/06/21〜07/20). **Chốt kỳ ngày 20**. Không bị ảnh hưởng bởi lead time |
| Tháng thanh toán | Hợp đồng・tháng chu kỳ ＋ lead time phát hành hóa đơn (−3〜+1. Ví dụ tháng chu kỳ 2026-07・−1 → 2026-06) (cũ: tháng chu kỳ − lead time. Đã sửa cho khớp với Quy tắc thanh toán 1-2 ngày 2026-10-03) | **Tháng sau tháng chu kỳ** (ví dụ 2026-08. Phát hành 8/1) (cũ: phát hành 7/31. Đã sửa cho khớp với sổ quyết định ngày 2026-10-03) |
| Thời điểm xác nhận | Ngày 25 của tháng trước tháng thanh toán (ví dụ tháng thanh toán 2026-06 → xác nhận 2026/05/25・phát hành 6/1) (cũ: ngày 25 của tháng thanh toán. Đã sửa cho khớp với sổ quyết định ngày 2026-10-03) | Ngày 25 sau khi chốt kỳ (ngày 20) (ví dụ 2026/07/25) |
| Hóa đơn đi kèm | Ví dụ INV-2026-06-001 | Ví dụ INV-2026-07-001 |
| Trạng thái thanh toán | Đã tạo／① Số tiền cố định đã xác nhận／Cơ sở đã xác nhận／Doanh nghiệp đã xác nhận／Đã thanh toán | Chưa tổng hợp／② Quyết toán theo thực tế đã xác nhận／Cơ sở đã xác nhận／Doanh nghiệp đã xác nhận／Đã thanh toán |

- **Hợp đồng con không chỉ có một số hóa đơn.** ① và ② đi kèm các hóa đơn khác nhau nên số hóa đơn・trạng thái thanh toán・người xác nhận／ngày giờ xác nhận **do bảng ① và ② mỗi bảng sở hữu**. Ở tab hợp đồng chỉ hiển thị gộp cả hai dưới dạng "Tình trạng thanh toán (tham chiếu)".
- **Mỗi dòng có cột "Kỳ đối tượng".** Mặc định là kỳ đối tượng của bảng, nhưng chi phí phát sinh (spot) có thể chỉ định tháng khác. Chuyển kỳ・bù trừ do ③ chi tiết điều chỉnh giữ hóa đơn gốc・tháng chu kỳ gốc (cũ: điều chỉnh chuyển kỳ thì nhập kỳ gốc. Đã sửa cho khớp với 契約_01 §3 ngày 2026-10-03). **Bãi bỏ cách vận hành ghi tháng đối tượng của chi phí phát sinh (spot) trong ngoặc ở tên khoản phí** (REQ-CT-236).
- **Tổng (①＋②) của bảng tóm tắt số tiền là giá trị tham khảo.** Vì ① và ② **của hợp đồng con này** khác nhau về thời điểm xác nhận và hóa đơn đi kèm nên không phải là số tiền của 1 hóa đơn.
- Tuy nhiên **thông thường 1 hóa đơn có cả ① và ②**. Hóa đơn phát hành trong một tháng sẽ ghi chung "**khoản trả trước của tháng sắp giao hàng**" và "**khoản quyết toán theo thực tế của tháng vừa chốt kỳ**" (đến từ các hợp đồng con khác nhau). Ví dụ: hóa đơn phát hành 2026/08/01 (lead time phát hành hóa đơn＝1 tháng trước (−1)) ＝ khoản trả trước của chu kỳ 2026-09 ＋ quyết toán theo thực tế 2026/06/21〜07/20 (phần chu kỳ 2026-07 đã xác nhận ngày 7/25) (cũ: hóa đơn gửi ngày 2026/08/01 (lead time 1). Đã sửa cho khớp với sổ quyết định ngày 2026-10-03). Toàn bộ hóa đơn xem ở **danh sách hóa đơn** của doanh nghiệp・cơ sở.
- Phân loại của bảng tự nó đã thể hiện ①／② nên dòng không có cột "phân loại thanh toán".
- **Số tiền giữ ở dạng chưa gồm thuế (quyết định 2026/09/25).** Dòng khoản phí là số tiền chưa thuế＋thuế suất. Thuế tiêu thụ được tính theo từng thuế suất trên hóa đơn và cộng thêm, hiển thị cột "Thuế tiêu thụ" trong danh sách hóa đơn. Phần lẻ làm tròn (làm tròn số học) trên tổng theo từng hóa đơn・từng thuế suất (số âm làm tròn theo giá trị tuyệt đối). Thuế theo từng cơ sở chỉ để tham khảo, số thuế của doanh nghiệp là chính thức (cũ: làm tròn xuống・giá trị tạm của demo. Đã sửa cho khớp với Quy tắc thanh toán 2-4 ngày 2026-10-03). Master tùy chọn・master giảm giá・master dòng máy cũng giữ ở dạng chưa gồm thuế.
- Ngày chốt kỳ・xác nhận・phát hành (Quy tắc thanh toán 1-1), hạn thanh toán (1-5), các giai đoạn hiển thị của trạng thái thanh toán (1-6), thuế tiêu thụ (2-4) lấy Quy tắc thanh toán làm chuẩn.

## Màn hình: Chi tiết thanh toán (chốt thanh toán・hóa đơn) (22 mục)

### Tab: ① Số tiền cố định (trả trước) (10 mục)

**① Số tiền thanh toán cố định (trả trước)**　<small>Thanh toán (hợp đồng con)</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho doanh nghiệp | Yêu cầu thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・lựa chọn／nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Tháng thanh toán | `advance_billing_month` | char(7) | Nhập | ○ | — | Không | — | — | Mặc định là Hợp đồng・tháng chu kỳ ＋ lead time phát hành hóa đơn (−3〜+1. Ví dụ: tháng chu kỳ 2026-07・−1 → 2026-06). 【Khi chưa được ghi vào hóa đơn (chưa tính), Vận hành có thể đổi sang tháng khác. Sau khi đã ghi vào hóa đơn thì không thể đổi】Là tháng khác với tháng thanh toán của ② | **P2 mới** |
| 2 | No | `fee_line.seq` | integer | Cột bảng | ○ | — | Không | — | — | — | P1 |
| 3 | Khoản phí | `fee_line.name` | varchar(60) | Cột bảng | ○ | — | Không | — | — | Nhập tay hoặc chọn từ master tùy chọn. 【Phí khởi tạo・phí hàng tháng của thiết bị cũng vào dưới dạng dòng khoản phí (phân loại nguồn＝model). Không tạo dòng (miễn phí) cho đến số máy có trong thiết bị cho mượn tiêu chuẩn của master gói (28-182)】(cũ: master tùy chọn・phí khác／gói áp dụng thiết bị tiêu chuẩn của master dòng máy. Đã sửa cho khớp với master §III-9 ngày 2026-10-03). Tối đa 60 ký tự (cũ: varchar(120). Đã sửa cho khớp với sổ quyết định ngày 2026-10-03) | P1 |
| 4 | Loại phí | `fee_line.kind` | varchar(20) | Cột bảng | ○ | — | Không | — | — | Phí khởi tạo／Phí hàng tháng／Phí một lần (phí spot). 【Tiền phạt hủy hợp đồng được lập thành dòng "phí một lần" ở ① của hợp đồng con cuối cùng khi hủy (phân loại nguồn model・theo từng thiết bị). Quyết định 2026/09/29】 | P1 |
| 5 | Kỳ đối tượng | `fee_line.target_from / fee_line.target_to` | date | Cột bảng | ○ | — | Không | — | — | Giữ theo từng dòng xem dòng đó là khoản của kỳ nào. Mặc định là kỳ đối tượng của bảng. Chỉ chi phí phát sinh (spot) mới có thể chỉ định kỳ khác (bãi bỏ cách vận hành ghi trong ngoặc ở tên khoản phí) | **P2 mới** |
| 6 | Số tiền chưa thuế (yên) | `fee_line.amount` | integer | Cột bảng | ○ | — | Không | — | — | Giữ dạng chưa thuế. Thuế tiêu thụ được tính theo từng thuế suất trên hóa đơn và cộng thêm (quyết định 2026/09/25). Phase 1 là số tiền đã gồm thuế | **P1→P2 đổi** |
| 7 | Thuế suất | `fee_line.tax_rate` | smallint | Cột bảng | ○ | — | Không | — | — | Giữ thuế suất chọn từ master thuế suất (dropdown) theo từng hạng mục và phản ánh vào hóa đơn (ví dụ: thuế suất tiêu chuẩn 10%／thuế suất giảm 8%). **Cố định giá trị thuế suất vào dòng** (dù sửa master thuế suất thì dòng đã tạo không đổi). Dòng của gói: phí cơ bản＝10%・phần doanh nghiệp chịu＝8% (quyết định 2026/09/29 28-149) | **P2 mới** |
| 8 | Phân loại nguồn | `fee_line.source` | varchar(10) | Cột bảng | ○ | — | Không | — | — | plan (master gói. **Phí gói được lập thành 2 dòng: phí cơ bản (10%) và phần doanh nghiệp chịu (8%)**・quyết định 2026/09/29 28-148)／option (master tùy chọn)／discount (master giảm giá)／model (master dòng máy)／manual (nhập tay・điều chỉnh giá). Dòng option và discount 【được lập tự động từ danh sách áp dụng của cơ sở】nên việc sửa số tiền là ở phía master hoặc biến động | **P2 mới** |
| 9 | Thêm・xóa dòng | `—（thao tác）` | — | Thao tác | — | — | Không | — | — | Thêm／xóa dòng. Sau khi ① đã xác nhận・đã thanh toán thì không thể thêm・xóa | P1 |
| 10 | Tổng số tiền thanh toán ① cố định (trả trước) | `advance_total` | integer | Tham chiếu | ○ | — | Không | — | — | Tổng số tiền chưa thuế của bảng này. Hiển thị ngay dưới bảng. Thuế tiêu thụ được tính theo đơn vị hóa đơn・từng thuế suất nên không hiển thị ở đây | **P2 mới** |

### Tab: ② Quyết toán theo thực tế (trả sau) (9 mục)

**② Số tiền thanh toán quyết toán theo thực tế (trả sau)**　<small>Thanh toán (hợp đồng con)</small>

> Với hợp đồng con mà quyết toán theo thực tế chưa được xác nhận đến lúc xác nhận ngày 25, từ ngày 26 trở đi hiển thị・cảnh báo thúc giục chốt kỳ cho người phụ trách CS. Chỉ người phụ trách CS mới hiển thị・thao tác được màn hình quyết toán theo thực tế (kiểm soát bằng quyền của Vận hành. Tên quyền theo 7 vai trò quyền của Vận hành). 〔Bản gốc: 契約_詳細要件 REQ-CT-281・282〕

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho doanh nghiệp | Yêu cầu thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・lựa chọn／nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | No | `fee_line.seq` | integer | Cột bảng | ○ | — | Không | — | — | — | P1 |
| 2 | Khoản phí | `fee_line.name` | varchar(60) | Cột bảng | ○ | — | Không | — | — | Tự động tạo từ kết quả kiểm kê. Cũng có thể thêm bằng nhập tay. Tối đa 60 ký tự (cũ: varchar(120). Đã sửa cho khớp với sổ quyết định ngày 2026-10-03) | P1 |
| 3 | Loại phí | `fee_line.kind` | varchar(20) | Cột bảng | ○ | — | Không | — | — | Quyết toán theo thực tế. Chuyển kỳ・bù trừ giữ ở ③ chi tiết điều chỉnh (cũ: dòng điều chỉnh (chuyển kỳ) ở ②. Đã sửa cho khớp với 契約_01 §3 ngày 2026-10-03) | **P2 mới** |
| 4 | Kỳ đối tượng | `fee_line.target_from / fee_line.target_to` | date | Cột bảng | ○ | — | Không | — | — | Giữ theo từng dòng xem dòng đó là thực tế của kỳ nào. Mặc định là kỳ đối tượng của bảng (cũ: điều chỉnh chuyển từ tháng trước thì nhập kỳ gốc. Chuyển kỳ chuyển sang ③ chi tiết điều chỉnh. Đã sửa cho khớp với 契約_01 §3 ngày 2026-10-03) | **P2 mới** |
| 5 | Số tiền chưa thuế (yên) | `fee_line.amount` | integer | Cột bảng | ○ | — | Không | — | — | Giữ dạng chưa thuế. Thuế tiêu thụ được tính theo từng thuế suất trên hóa đơn và cộng thêm (quyết định 2026/09/25). Phase 1 là số tiền đã gồm thuế | **P1→P2 đổi** |
| 6 | Thuế suất | `fee_line.tax_rate` | smallint | Cột bảng | ○ | — | Không | — | — | Giữ thuế suất chọn từ master thuế suất (dropdown) theo từng hạng mục và phản ánh vào hóa đơn (ví dụ: thuế suất tiêu chuẩn 10%／thuế suất giảm 8%). **Cố định giá trị thuế suất vào dòng** (dù sửa master thuế suất thì dòng đã tạo không đổi). Dòng của gói: phí cơ bản＝10%・phần doanh nghiệp chịu＝8% (quyết định 2026/09/29 28-149) | **P2 mới** |
| 7 | Phân loại nguồn | `fee_line.source` | varchar(10) | Cột bảng | ○ | — | Không | — | — | manual (nhập tay)／stock (kiểm kê) (cũ: carryover (chuyển từ tháng trước). Đã chuyển sang ③ chi tiết điều chỉnh. Đã sửa cho khớp với 契約_01 §3 ngày 2026-10-03) | **P2 mới** |
| 8 | Thêm・xóa dòng | `—（thao tác）` | — | Thao tác | — | — | Không | — | — | Thêm／xóa dòng. Sau khi ② đã xác nhận・đã thanh toán thì không thể thêm・xóa | P1 |
| 9 | Tổng số tiền thanh toán ② quyết toán theo thực tế (trả sau) | `arrears_total` | integer | Tham chiếu | ○ | — | Không | — | — | Tổng số tiền chưa thuế của bảng này. Hiển thị ngay dưới bảng. Thuế tiêu thụ được tính theo đơn vị hóa đơn・từng thuế suất nên không hiển thị ở đây | **P2 mới** |

### Tab: ③ Chi tiết điều chỉnh (thêm 2026-10-03)

**③ Chi tiết điều chỉnh**　<small>Thanh toán (hợp đồng con)</small>

Mục: Hóa đơn gốc／Tháng chu kỳ gốc／Loại (bù trừ・chênh lệch・chuyển kỳ・thanh toán lại)／Lý do／Số tiền chưa thuế／Thuế suất／Hóa đơn đã ghi vào. Khi phê duyệt, hệ thống tự động tạo chênh lệch theo từng tháng đã thanh toán, và khi tạo hóa đơn tiếp theo sẽ lấy các chi tiết điều chỉnh chưa được ghi vào (契約_01 §1-1・§3).

### Tab: Tóm tắt số tiền (3 mục)

**Tóm tắt số tiền**　<small>Thanh toán (hợp đồng con)</small>

| # | Tên mục | Tên vật lý | Kiểu | Nhập | Bắt buộc | Hiển thị cho doanh nghiệp | Yêu cầu thay đổi | Vận hành phê duyệt | Thông báo | Giá trị・lựa chọn／nội dung | Phase |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Chi tiết (khởi tạo／hàng tháng／một lần／điều chỉnh) | `—（tính từ dòng khoản phí ①②）` | — | Tham chiếu | ○ | — | Không | — | — | Hiển thị trong 1 dòng tổng theo từng loại phí của ① và tổng của ③ chi tiết điều chỉnh (cũ: điều chỉnh (chuyển kỳ) của ②. Đã sửa cho khớp với 契約_01 §3 ngày 2026-10-03). Trong chi tiết cũng hiển thị tổng giảm giá (giảm giá chuyển công ty・giảm giá riêng, v.v.)〔Bản gốc: 契約_詳細要件 §8E-3・REQ-CT-250〕. Ví dụ: khởi tạo ¥10,000 ・hàng tháng ¥12,000 ・một lần ¥11,000 ・điều chỉnh ¥0. Cả bốn mục chi tiết đều là giá trị tính toán nên gộp vào 1 ô tham chiếu | P1 |
| 2 | Tổng (①＋②・tham khảo) | `ref_total` | integer | Tham chiếu | ○ | — | Không | — | — | Tổng của ① ＋ tổng của ②. Vì ① và ② của hợp đồng con này khác nhau về thời điểm xác nhận và hóa đơn đi kèm nên không phải là số tiền của 1 hóa đơn. Là giá trị tham khảo để xác nhận trên màn hình | **P2 mới** |
| 3 | Doanh thu của tháng này (chỉ Vận hành) | `revenue_total` | integer | Tham chiếu | ○ | — | Không | — | — | Doanh thu của tháng đó, cộng gộp phí cơ bản (trả trước) ＋ quyết toán theo thực tế dồn về tháng giao hàng. Vì khiến khách hàng nhầm lẫn nên không hiển thị cho doanh nghiệp, dùng cho tính toán nội bộ của Vận hành. Cách tính giá vốn・lợi nhuận gộp・lợi nhuận ròng đang được xem xét | **P2 mới** |


---
