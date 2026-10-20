> Bản dịch tiếng Việt của `ja/01_仕様/50_注文/注文.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đơn hàng (đơn hàng hằng tháng・đơn hàng vật tư・quản lý đơn hàng của vận hành)

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, viết lại mới bằng cách tổng hợp các tài liệu gốc và quyết định bên dưới.
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (chủ đề này chủ yếu thuộc **H**・**F**・**B**). Nếu có mâu thuẫn thì sổ quyết định là chuẩn.
> Tài liệu gốc (đóng băng・chỉ xem lịch sử): `提案_標準数と拠点専用デフォルト_20261001.md`, `月次注文デモ_プラン契約との差分_20260930.md`, `00_決定/決定_STEP5回答_法人Web_20261001.md`, tổng hợp định nghĩa yêu cầu chủ đề 4-15 (RD-AP-112〜151・chỉ ở local).
> Tham khảo: `Order-Spec-for-AI-Team.md` (tài liệu bàn giao cho đội AI), `spec_拠点別販売価格_カート_vi.md` (giá trong giỏ hàng của ứng dụng cá nhân).

## 0. Các đặc tả liên quan

| Muốn biết | Xem ở đâu |
|---|---|
| Menu・master sản phẩm・cách đề xuất số lượng tiêu chuẩn của vận hành | Sổ quyết định F (đặc tả menu chưa được sắp xếp) |
| Gói・giới hạn trên/dưới của số lượng cung cấp hằng tháng・số lần giao hàng tiêu chuẩn | `01_仕様/40_マスタ・料金・請求/プランマスタ.md` |
| Số lần giao hàng・chu kỳ giao hàng (cài đặt giao hàng của hợp đồng con) | `10_配送/配送仕様/配送_03_契約の配送設定.md` |
| Bắt đầu dùng thử・ngày chốt đặt hàng | `10_配送/配送仕様/配送_04_予定と配送データ・変更.md` §7-9 |
| Đặt hàng (đơn hàng → số lượng đặt hàng) | `55_発注・仕入・入荷/` |
| Báo cáo kiểm kê (kiểm tra tồn kho)・tồn kho lý thuyết | `60_在庫/` |
| Hàng thay thế | `65_代替品/` |

## 1. Nguyên tắc cơ bản của đơn hàng hằng tháng

| # | Quy định | Căn cứ |
|---|---|---|
| 1-1 | **1 cơ sở＝1 đơn hàng** (theo từng tháng chu kỳ). Tài khoản doanh nghiệp chuyển tab cơ sở để nhập được phần của tất cả cơ sở. Tài khoản cơ sở chỉ nhập cơ sở của mình | Order-Spec §4.1, sổ quyết định K |
| 1-2 | Thời gian tiếp nhận là **từ lúc công bố menu (＝bắt đầu đặt hàng. Mặc định là ngày 1 tháng trước) đến hạn chốt (mặc định là ngày 15 tháng trước)**. Ngày do menu giữ, vận hành sửa được. Hạn chốt là 1 lần mỗi tháng | RD-AP-112, sổ quyết định F |
| 1-3 | Đến hạn chốt có thể đăng ký lại bao nhiêu lần cũng được. **Không có thao tác đơn hàng tạm・bản nháp・phê duyệt** (cái đã nhấn「登録」(đăng ký) chính là đơn hàng) | RD-AP-114 |
| 1-4 | Cơ sở chưa đăng ký lần nào đến hạn chốt thì được xác định bằng **đơn hàng mặc định**. Nội dung ở §4 (「次回以降も適用」(áp dụng cho các lần sau) ON＝bản nháp của AI／OFF＝số lượng tiêu chuẩn của vận hành nhân với cài đặt của cơ sở) | RD-AP-113, sổ quyết định H |
| 1-5 | Trạng thái chỉ có **một** (chưa đăng ký／khách hàng đã đăng ký／ES Kitchen đã thay đổi／đơn hàng mặc định). Không tách thành hai phía khách hàng・phía ES. **Khi nào・ai** đã nhập・sửa được lưu vào lịch sử thay đổi (kể cả thay đổi của ES sau hạn chốt) | RD-AP-114・124 |
| 1-6 | **ES Kitchen (vận hành) cũng không sửa được sau khi chốt đơn hàng (ngày chốt đặt hàng＝B7・D7)** (chỉ xem. Đơn hàng thường và dùng thử (tự động) đều như nhau). Khi cần sửa thì dùng cài đặt hàng thay thế. Trước khi chốt thì vận hành sửa được. Khách hàng không thể hủy・dừng đơn hàng. Tạm dừng thực hiện bằng đơn yêu cầu (vận hành phê duyệt). Việc tạo lại đơn hàng khi sửa menu (đơn hàng tự động・dùng thử (tự động)) và cách xử lý sản phẩm bị bỏ ra theo sổ quyết định F「公開したメニューの編集と注文済みへの影響」(sửa menu đã công bố và ảnh hưởng đến đơn đã đặt) (#266): sản phẩm bị bỏ ra vẫn còn trong đơn hàng đã đăng ký・ES Kitchen đã nhập, vận hành chỉ giảm số lượng・đưa về 0 (không tăng được). Bộ lọc sản phẩm của đơn hàng・sản phẩm lỗi trong cài đặt hàng thay thế là sản phẩm của menu + sản phẩm còn trong đơn hàng. **「締め」(chốt)＝2 lần ngày chốt đặt hàng**: phần chuyến nửa đầu (tuần A・B) không sửa được sau B7, phần nửa sau (tuần C・D) không sửa được sau D7 (giống việc đặt hàng chính thức 2 lần/tháng: sổ quyết định I). Khi 1 đơn hàng có cả chuyến nửa đầu và nửa sau thì chốt theo từng chuyến (việc tách theo chuyến là cách Claude hiểu「2 đợt」của hong) | RD-AP-115, sổ quyết định H (#264・#266・#270) |
| 1-7 | Ngoài thời gian tiếp nhận vẫn **xem được** màn hình đơn hàng (không nhập được) | RD-AP-132 |
| 1-8 | Từ 7 ngày trước hạn chốt đến ngày hạn chốt, hiển thị cảnh báo cho cơ sở chưa đăng ký (trang chủ và màn hình đơn hàng). Doanh nghiệp bật/tắt được lời nhắc hạn chốt (thông báo・email) | Sổ quyết định E「ご注文がまだの警告」(cảnh báo chưa đặt hàng) |
| 1-9 | Khi xác định bằng đơn hàng mặc định thì có thông báo trên Web doanh nghiệp + gửi email cho người phụ trách chính của cơ sở (mỗi chu kỳ 1 lần) | Sổ quyết định E |
| 1-10 | Sản phẩm hiển thị trên màn hình đơn hàng chỉ gồm sản phẩm thuộc **course của cơ sở** (Light＝lạnh・nhiệt độ thường／Standard＝cả đông lạnh) và do **kho picking của hợp đồng** xử lý. Số lượng tiêu chuẩn・ứng viên của AI cũng vậy | Sổ quyết định H, Order-Spec §2 |
| 1-11 | Không làm màn hình chỉ xem menu. Chọn trong lúc xem ảnh・chi tiết ở màn hình đơn hàng (mặc định là hiển thị kèm ảnh). Hiển thị course・máy bán hàng tự động trong phần hiển thị gói | RD-AP-117 |

## 2. Quy định về số lượng

### 2-1. Không đăng ký được (lỗi)

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | **Tổng＝số lượng của gói** (tổng giới hạn trên số lượng cung cấp hằng tháng). Nhiều hơn hay ít hơn đều không đăng ký được. Không làm chức năng đặt thêm vượt giới hạn trên | RD-AP-120, sổ quyết định N |
| 2-2 | Số lượng theo từng chuyến (lần giao hàng) **đều nhau**. Khi không chia hết thì **chênh lệch giữa các chuyến trong ±1**, tổng khớp là được (ví dụ: 250・4 lần＝62／62／63／63) | RD-AP-120, Order-Spec §4.3 |
| 2-3 | Chuyến được **đếm theo từng nhóm nhiệt độ** (chuyến lạnh・nhiệt độ thường／chuyến đông lạnh. Giống cài đặt giao hàng của hợp đồng con) | Sổ quyết định H |
| 2-4 | **Theo từng nhóm nhiệt độ: giới hạn dưới ≦ số lượng ≦ giới hạn trên**. Giá trị là giới hạn trên・dưới của số lượng cung cấp hằng tháng đã sao chép sang hợp đồng con. Số lượng đông lạnh được quyết định bằng **số cái** (không giữ tỷ lệ). Giới hạn trên của đông lạnh + giới hạn trên của lạnh・nhiệt độ thường có thể lớn hơn tổng (trong phạm vi đó khách hàng chọn được cách phân bổ) | Sổ quyết định B「冷凍の割合」(tỷ lệ đông lạnh)・sổ quyết định H, RD-AP-128・129 |
| 2-5 | **Không giữ giới hạn trên theo từng sản phẩm** | Sổ quyết định B |
| 2-6 | Máy bán hàng tự động:「1便50個」(50 cái/chuyến)「1列に2種類」(2 loại/cột) **không phải giá trị cố định・không phải lỗi, mà theo layout của máy bán hàng tự động, vượt thì chỉ cảnh báo** (không chặn đăng ký) (sổ quyết định AL・2026-10-16. Cũ: không đặt được 2 loại sản phẩm vào 1 cột・1 lần giao tối đa 50 cái, không đăng ký được). Cách giữ layout (mục nào của master loại máy) cần xác nhận | RD-AP-125, sổ quyết định AL |

### 2-2. Chỉ cảnh báo (vẫn đăng ký được)

| # | Quy định | Căn cứ |
|---|---|---|
| 2-7 | **Vượt số lượng chứa** của cột máy bán hàng tự động → cảnh báo mang tính tham khảo (số lượng của gói được ưu tiên) | RD-AP-126, sổ quyết định H |
| 2-8 | **Tổng sản phẩm tương thích băng tải ＞ tổng sức chứa của các cột băng tải** → cảnh báo | RD-AP-126 (yêu cầu dòng 32) |
| 2-9 | **Số lượng đặt đông lạnh 1 lần ＞ sức chứa tối đa của tủ đông** → cảnh báo | RD-AP-128 (yêu cầu dòng 173) |
| 2-10 | Sản phẩm không vừa máy bán hàng tự động cũng vẫn hiển thị trên màn hình đơn hàng. Có đặt hay không **do doanh nghiệp quyết định** (cách nhận hàng là trách nhiệm của doanh nghiệp・hiển thị ghi chú lưu ý) | Sổ quyết định H |

### 2-3. Cơ sở có máy bán hàng tự động

- Chỉ cơ sở có course「ESライト（自販機）」(ES Light (máy bán hàng tự động)) đặt hàng **theo từng khung (đôi・đơn・băng tải)**. Lệch số lần giao giữa các khung thì chấp nhận được.
- **1 hợp đồng＝1 máy bán hàng tự động** (2 máy thì tách cơ sở・hợp đồng). Không làm cơ chế tách đơn hàng theo từng máy.
- Xem được số lượng chứa tối đa và số tồn kho tại thời điểm đặt hàng (RD-AP-127).

## 3. Cách nhập

| # | Quy định | Căn cứ |
|---|---|---|
| 3-1 | Có 2 cách nhập: ① **nhập theo từng lần giao** (tối đa 8 lần・「第1回をコピー」(sao chép lần 1)) ② **nhập tổng rồi tự động phân bổ** (phần dư dồn nhiều hơn vào các lần đầu). Sau khi phân bổ có thể sửa tay | RD-AP-118 |
| 3-2 | Ô số lượng: **nhấn vào là chọn toàn bộ** và ghi đè luôn được (cả Web doanh nghiệp・Web vận hành) | RD-AP-121 |
| 3-3 | **CSV**: xuất template, nhập vào để đặt hàng được | RD-AP-116 |
| 3-4 | Thống kê: tổng theo danh mục và số lượng theo từng lần giao (không hiển thị số tiền). Trong danh sách biết được chi tiết lạnh・đông lạnh | RD-AP-122 |
| 3-5 | Nhóm nhiệt độ hiển thị bằng **icon + chữ ngắn** (cũng phân biệt màu) | Sổ quyết định H |
| 3-6 | Hiển thị sản phẩm hạn dùng ngắn chỉ là「短賞味期限」(hạn dùng ngắn) (phân loại short／semi-short là dùng nội bộ) | RD-AP-056 |
| 3-7 | Phần trên của màn hình đặt sản phẩm của Web doanh nghiệp:「この月のご契約」(hợp đồng của tháng này)「検索条件」(điều kiện tìm kiếm) ban đầu đóng, hiển thị tóm tắt 1 dòng (xếp 2 cái cạnh nhau, nhấn để mở). Tiêu đề・tab gom lại trong 2〜3 dòng. Dải thời gian tiếp nhận để mở (1〜2 dòng). Dải tổng luôn là 1 dòng nhỏ (nhấn để mở). Sản phẩm là thẻ nhỏ (từ 1280px trở lên 6 cột・từ 1024px trở lên 4 cột・từ 768px trở lên 3 cột・hẹp hơn thì 2 cột) | Sổ quyết định AT・sổ tiếp nhận #807・#823 |

## 4. AI (đề xuất tự động) và「次回以降も適用」

| # | Quy định | Căn cứ |
|---|---|---|
| 4-1 | Từ「AI」trên màn hình đơn hàng chọn được 3 cách: **phân bổ đều／tham chiếu dữ liệu quá khứ／chỉ thị cho AI bằng chat**. Mỗi cách đều có hiển thị giải thích cách dùng | RD-AP-136・151 |
| 4-2 | Kết quả hiển thị bằng **xem trước**, nhấn「確定」(xác nhận) thì đưa vào màn hình đơn hàng (「戻る」「×」thì không đưa vào). **Sau đó nhấn「登録」thì mới thành đơn hàng** | RD-AP-137・138 |
| 4-3 | Màn hình AI: bên trái là chat・bên phải là xem trước. Lọc được theo danh mục・hạn dùng・số lượng・số tiền | RD-AP-139 |
| 4-4 | Đề xuất của AI cũng phải tuân thủ quy định §2. Cũng hỗ trợ đông lạnh | RD-AP-140・144 |
| 4-5 | Đầu vào của「過去データを参照」(tham chiếu dữ liệu quá khứ): **đơn hàng quá khứ・tỷ lệ hủy bỏ・tồn kho (thực tích bán hàng)** của cơ sở đó. Dùng dữ liệu đã xác định tính đến thời điểm đặt hàng (ví dụ: đơn hàng tháng 11 dùng đến kiểm kê kỳ tháng 9) | RD-AP-141, sổ quyết định H |
| 4-6 | Tỷ lệ hủy bỏ＝**hủy bỏ ÷ (tồn kho lần trước + giao hàng)** (cùng công thức với màn hình tồn kho) | Sổ quyết định H (hong trả lời 2026-10-05) |
| 4-7 | **「次回以降も適用」**: cơ sở đã tích ở xem trước và áp dụng thì từ tháng sau, vào ngày bắt đầu đặt hàng, **đề xuất của AI theo menu mới được tự động đưa vào bản nháp**. Nếu đến hạn chốt không đăng ký thì xác định bằng bản nháp đó.「AIモード」(chế độ AI) cũ đã được thay bằng cái này | Sổ quyết định H |
| 4-8 | Cơ sở không tích・cơ sở chưa đăng ký được xác định bằng **số lượng tiêu chuẩn của vận hành nhân với cài đặt mặc định của cơ sở (§5)** | Sổ quyết định H, RD-AP-146 |
| 4-9 | Không làm gợi ý theo trung bình của công ty khác (từ phase sau trở đi) | RD-AP-143 |
| 4-10 | **Model AI cho đơn hàng là Gemini** (ký hợp đồng trực tiếp với Google. API key do anh/chị Aoyama cung cấp cho Dipro). Chất lượng gần như bằng Claude, chi phí rẻ hơn một chút (quyết định 2026/10/13・giám đốc đồng ý. Sổ tiếp nhận #594) | Sổ quyết định AE, MM_20261013_1156 ［00:48:33〜00:50:40］ |

## 5. Cài đặt mặc định của cơ sở

Giữ theo từng cơ sở, tiếp tục từ tháng sau. Sửa được từ cả đơn hàng hằng tháng của Web doanh nghiệp và từ vận hành (「拠点の設定」(cài đặt cơ sở) trong chi tiết đơn đặt sản phẩm).

| Cài đặt | Mặc định | Căn cứ |
|---|---|---|
| Có／không theo từng danh mục | Tất cả đều có | RD-AP-148 |
| Lấy／không lấy sản phẩm hạn dùng ngắn | **Lấy** | Sổ quyết định H |
| Sản phẩm để 0 hằng tháng (ví dụ: các loại bánh mì) | Không có | RD-AP-145 |
| Giá sản phẩm: tích「100円の商品」(sản phẩm 100 yên)「200円の商品」(sản phẩm 200 yên). Sản phẩm thuộc mức giá bị bỏ tích sẽ không đưa vào đơn hàng mặc định và đề xuất của AI (vẫn đặt tay được). Giá là giá bán trong master sản phẩm | Cả hai ON | Sổ quyết định H (hong trả lời 2026-10-05), RD-AP-148 |
| 「次回以降も適用」(bản nháp của AI) | OFF | §4-7 |

## 6. Số lượng tiêu chuẩn của vận hành (số chuẩn)

- Theo từng menu, vận hành nhập **trọng số** của sản phẩm và chỉ định **sản phẩm・danh mục không đưa vào tiêu chuẩn**. Hệ thống phân bổ cho 3 loại (thường／không có hạn dùng ngắn／máy bán hàng tự động) × course, tuân thủ quy định §2 (tổng・chênh lệch chuyến ±1・giới hạn trên dưới theo nhóm nhiệt độ・số lượng chứa của máy bán hàng tự động). **Số lượng vận hành sửa tay được ưu tiên** (sổ quyết định H).
- Chuẩn tính cho 50 gói. Số lượng của cơ sở là **số lượng tiêu chuẩn × tỷ lệ cơ bản (100 gói＝gấp 2)** (28-179).
- Cách đề xuất (tỷ lệ đơn hàng → điều chỉnh đơn giá nhập trung bình về khoảng mục tiêu) và mục tiêu đơn giá trung bình ở sổ quyết định F.
- Máy bán hàng tự động thì làm theo từng khung・từng loại máy (sổ quyết định H).

## 7. Đơn hàng dùng thử

| # | Quy định | Căn cứ |
|---|---|---|
| 7-1 | Dùng thử **chỉ có ES Light (tủ lạnh)** (50 gói・số lần giao tiêu chuẩn là 1 lần) | Sổ quyết định H |
| 7-2 | Đơn hàng do **hệ thống tự động tạo** (cả từ tháng thứ 2). Phân bổ giới hạn trên số lượng cung cấp hằng tháng của gói **cho tất cả sản phẩm của menu** (không dùng số lượng tiêu chuẩn của vận hành). Chênh lệch chuyến ±1 | Sổ quyết định H |
| 7-3 | **Doanh nghiệp chỉ xem** (số lượng・sản phẩm・ngày giao. Không hiển thị nút sửa・AI) | Sổ quyết định H |
| 7-4 | Vận hành sửa được số lượng・sản phẩm từ dòng「お試し（自動）」(dùng thử (tự động)) trong quản lý đơn đặt sản phẩm **đến ngày chốt đặt hàng (theo chuyến: chuyến nửa đầu là B7, chuyến nửa sau là D7. §1-6)**. Dùng thử (tự động) không dùng số lượng tiêu chuẩn, được tạo lại **khi sản phẩm của menu tăng giảm** (trừ sản phẩm bị bỏ ra. Chỉ trước khi chốt) | Sổ quyết định F・H (#266) |
| 7-5 | Khi đăng ký tạm (hoàn tất xác nhận nội dung đăng ký) thì tạo đơn hàng và bộ vật tư ban đầu. Không có tài khoản cũng vẫn tạo | 28-94・95・98 (`申請・承認.md`) |
| 7-6 | Hướng dẫn khi cơ sở đăng ký tạm chưa có tháng đặt hàng được: nếu biết thì hiển thị ngày bắt đầu tiếp nhận đơn hàng (ví dụ「2026年12月分のご注文は 11/01 から受け付けます」(đơn hàng tháng 12/2026 được tiếp nhận từ 11/01)). Khi không biết・đã qua ngày bắt đầu tiếp nhận thì「ご契約開始月のオーダーの受付が始まるとご注文いただけます」(khi bắt đầu tiếp nhận đơn hàng của tháng bắt đầu hợp đồng thì có thể đặt hàng). Khi menu được công bố, cũng tạo hợp đồng con của tháng bắt đầu và đơn hàng mặc định cho cơ sở đăng ký tạm bắt đầu từ tháng đó (chuyển dùng thử→triển khai chính thức cũng vậy) | Sổ quyết định AS・sổ tiếp nhận #771 |
| 7-6 | Chu kỳ đầu tiên sau khi chuyển sang triển khai chính thức là đơn hàng hằng tháng thông thường (doanh nghiệp nhập) | Sổ quyết định H |

## 8. Đơn hàng khi phê duyệt thay đổi hợp đồng

| Nội dung đã phê duyệt | Đơn hàng của chu kỳ đó | Căn cứ |
|---|---|---|
| Tạm dừng・hủy hợp đồng | Hủy | Sổ quyết định H |
| Thay đổi gói・thay đổi số lần giao | **Trở về đơn hàng mặc định theo điều kiện mới**. Nhập lại được đến hạn chốt (không nhập lại thì xác định như vậy) | Sổ quyết định H |
| Xác nhận nội dung đăng ký của đăng ký mới (triển khai chính thức) | Nếu trong thời gian tiếp nhận của tháng chu kỳ bắt đầu thì doanh nghiệp nhập được. Nếu đã qua hạn chốt thì vận hành chọn「翌サイクルへ繰り下げ／運営が代理オーダー」(lùi sang chu kỳ sau／vận hành đặt hàng thay) | 28-97, sổ quyết định B |

- Những gì đã tự động sửa được hiển thị ở「影響範囲」(phạm vi ảnh hưởng) trên màn hình phê duyệt. Thông báo cho doanh nghiệp **do vận hành gửi tùy ý**.
- Sau khi đơn hàng được xác định, thay đổi lịch giao hàng từ khách hàng được tiếp nhận bằng「お届け日の変更の申請」(đơn yêu cầu thay đổi ngày giao) (`配送仕様`).

## 9. Đơn hàng vật tư

| # | Quy định | Căn cứ |
|---|---|---|
| 9-1 | **Đặt hàng được bất cứ lúc nào.** Mỗi đơn hàng tạo dữ liệu giao hàng của chuyến vật tư (gửi thẳng từ văn phòng ES bằng Yamato), hiển thị trên lịch của trang chủ | Sổ quyết định H, STEP4 A2 |
| 9-2 | **Tối đa 1 lần mỗi tháng chu kỳ là đã gồm trong phí. Từ lần thứ 2 thì OP000036「資材の追加配送（単発・1回）」(giao vật tư bổ sung (một lần))** được gắn vào hợp đồng con【tạm ¥2,000／lần】. Màn hình đơn hàng hiển thị「今月の資材注文は1回目（料金に含む）／2回目からは別料金」(đơn vật tư tháng này là lần 1 (đã gồm trong phí)／từ lần 2 tính phí riêng). **"Lần thứ mấy" được đếm theo tháng chu kỳ của ngày giao dự kiến**. Nếu hủy thì đơn tiếp theo được đẩy lên. Tháng đã xuất hóa đơn thì điều chỉnh hóa đơn. **Đơn vật tư của cơ sở dùng thử không gắn OP000036** (vận hành đăng ký thay cũng vậy) | Sổ quyết định H (#277) |
| 9-3 | Phần vượt số lượng miễn phí (theo từng vật tư・từng gói. Giá trị ban đầu là số suất ăn của gói) được tính phí theo giá・thuế suất của master vật tư | Sổ quyết định B「資材の無料の数量」(số lượng vật tư miễn phí) |
| 9-4 | Bộ ban đầu (miễn phí) được tự động tạo khi đăng ký tạm, không tính vào số lần. Số lượng theo bảng「資材 × プラン」(vật tư × gói) | 28-129, sổ quyết định H |
| 9-5 | Master vật tư tách riêng với master sản phẩm. Hộp vật tư không đưa vào bộ ban đầu | 28-169, `00_決定/決定_v2.3追補_申請まわり_20260928.md` §19 |
| 9-6 | Quản lý đơn vật tư của vận hành: **người nhập ngày gửi・số vận đơn là quản trị hệ thống** (không thêm quyền cập nhật cho logistics). **Đơn đã hủy chỉ xem** (không hiển thị sửa・hủy). Khi lưu chỉnh sửa, thêm checkbox chọn có thông báo cho khách hàng hay không (giống cài đặt hàng thay thế) | Sổ quyết định H (#277) |

## 10. Màn hình của vận hành (quản lý đơn hàng)

| # | Quy định | Căn cứ |
|---|---|---|
| 10-1 | Xác nhận đơn hàng theo **từng khách hàng (đơn đặt sản phẩm)・từng sản phẩm・từng vật tư**. Theo từng khách hàng thì hiển thị phân loại giao hàng (chuyến giao ES／chuyến COOL). Đơn vị là theo từng gói | RD-AP-130 |
| 10-2 | Danh sách・chi tiết quản lý đơn đặt sản phẩm có 2 cột「**法人の登録（日時・担当者）**」(doanh nghiệp đăng ký (ngày giờ・người phụ trách))「**ES の変更（日時・担当者）**」(ES thay đổi (ngày giờ・người phụ trách)) | Sổ quyết định H |
| 10-3 | Theo từng sản phẩm thì tìm theo ngày gửi・ngày đến, xuất CSV được các dòng đã chọn. Chọn được có gồm／không gồm gói đã hủy hợp đồng | RD-AP-131 |
| 10-4 | **Số điều chỉnh・tỷ lệ điều chỉnh** của đơn đặt sản phẩm: mục để quản trị hệ thống (vận hành) cộng thêm số lượng như một dịch vụ cho khách hàng. **Chỉ quản trị hệ thống mới cộng được**. Không tính phí. Phản ánh vào chỉ thị xuất hàng・đặt hàng・tồn kho lý thuyết (cách phản ánh xác nhận khi triển khai). **Không cộng được sau khi chốt đơn hàng (ngày chốt đặt hàng)** (sau khi chốt mà muốn đổi số lượng thì dùng cài đặt hàng thay thế). Không thêm cột「サービス数量」(số lượng dịch vụ) riêng. Đơn hàng có số điều chỉnh không thuộc đối tượng tạo lại đơn hàng tự động do thay đổi menu (#266). **Số điều chỉnh do quản trị hệ thống tự do nhập số nguyên từ 0 trở lên. Giới hạn trên＝số suất ăn của gói** (gói 50 thì là 50). **Tỷ lệ điều chỉnh không có lựa chọn, chỉ hiển thị số điều chỉnh ÷ số suất ăn dưới dạng % 1 chữ số thập phân** (không nhập). **Số điều chỉnh không đưa vào tính toán「合計＝プラン数」(tổng＝số gói)「便の差±1」(chênh lệch chuyến ±1)**. **Đơn hàng dùng thử (tự động) không cộng được số điều chỉnh** (cột chỉ đọc). **Chuyến đông lạnh cũng cộng được số điều chỉnh** (#282 ①). Ý nghĩa của「締め」ở §1-6 (theo chuyến: nửa đầu B7・nửa sau D7). Cài đặt hàng thay thế ở `65_代替品/` | RD-AP-123, sổ quyết định H (#251・#252・#263・#269・#270・#272) |
| 10-5 | Cơ sở dùng thử là dòng「お試し（自動）」(§7-4) | Sổ quyết định H |
| 10-6 | Trạng thái vẫn là「自動注文」(đơn hàng tự động), **khi là bản nháp đề xuất của AI thì có dấu「AI」nhỏ bên cạnh** (trạng thái・tab cơ sở của Web doanh nghiệp, danh sách quản lý đơn đặt sản phẩm của vận hành. CSV là「自動注文（AI）」). Chỉ cơ sở đã chọn「次回以降も適用」mới dùng số lượng của AI | Sổ quyết định AT・sổ tiếp nhận #808 |

## 11. Các phần khác của Web doanh nghiệp (xung quanh đơn hàng)

| # | Quy định | Căn cứ |
|---|---|---|
| 11-1 | **Phiếu giao hàng**: chỉ xuất từ chi tiết giao hàng (theo chuyến) (không xuất từ lịch sử đơn hàng). Không gồm vật tư. Xuất được nếu chuyến đó đã xác định (chờ xuất hàng) (chuyến dự kiến thì không xuất. Sổ quyết định T 2026-10-14). PDF được tải trực tiếp dưới dạng file | Sổ quyết định F (review ① của bản 1.1) |
| 11-2 | **Đánh giá**: chỉ hiển thị cho doanh nghiệp sao・sản phẩm・tag đánh giá・nickname (không hiển thị ý kiến・user ID・địa chỉ email) | Sổ quyết định H (REQ-UI-008) |
| 11-3 | Cơ sở dùng thử thì hiển thị thời gian dùng thử (tháng chu kỳ bắt đầu・kết thúc) và gia hạn | STEP5 §2-5 T3 |

## 12. Ứng dụng cá nhân (tham khảo)

- Giá ở giỏ hàng・xác nhận thanh toán (giá bán theo từng cơ sở・ESQR) ở `spec_拠点別販売価格_カート_vi.md` (2026/09/10. Đặc tả phía ứng dụng cá nhân).
- Thời gian mua được khi đang tạm dừng・sau khi hủy hợp đồng ở sổ quyết định K.

## 13. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| U2 | Số lần giao tiêu chuẩn của đông lạnh (【tạm】giống lạnh)・bảng sức chứa tối đa của tủ đông | Chờ bảng của khách hàng |
| U3 | Cách lấy sức chứa tối đa của cột băng tải (danh sách mục master §0.9 OPEN #10)・cấu thành cột thực tế theo từng loại máy | Xác nhận với khách hàng |
| U4 | Số tiền chính thức của OP000036 | Xác nhận với khách hàng |
| U5 | Những điều cần truyền đạt cho đội AI: bỏ giới hạn trên theo từng sản phẩm／mặc định của hạn dùng ngắn là「取る」(lấy)／chuyến theo từng nhóm nhiệt độ／đầu vào gồm tồn kho・tỷ lệ hủy bỏ (công thức hủy bỏ ÷〈tồn kho lần trước + giao hàng〉)・thực tích bán hàng／1 hợp đồng＝1 máy (sửa Order-Spec §4.2・§4.4・§7.3・§8) | hong truyền đạt cho đội AI |
