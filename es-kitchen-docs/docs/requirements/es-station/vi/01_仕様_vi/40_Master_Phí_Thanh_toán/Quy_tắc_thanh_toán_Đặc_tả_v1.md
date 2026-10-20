> Bản dịch tiếng Việt của `ja/01_仕様/40_マスタ・料金・請求/請求ルール_仕様_v1.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Đặc tả quy tắc hóa đơn v1 (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Tài liệu tổng hợp thành một các quy tắc hóa đơn đã quyết định trong STEP2・STEP3 và trong các câu trả lời đóng STEP1.
> **Không thêm quyết định mới**. File quyết định ở cột "Căn cứ" của từng dòng là chuẩn, nếu mâu thuẫn với tài liệu này thì ưu tiên file quyết định.
> File quyết định làm căn cứ (`01_仕様/00_決定/`):
> `決定_STEP2回答_法人拠点契約_20261001.md` (STEP2), `決定_STEP3回答_マスタと請求_20261001.md` (STEP3 Q), `決定_STEP3追補_オプション値引きマスタの不足_20261001.md` (bổ sung), `決定_STEP3追補_請求ルール_20261001.md` (P), `決定_STEP3残りとSTEP1を閉じる回答_20261001.md` (S・T), `決定_v146後の持ち越し_20261001.md`, `決定_メールと通知の追加_20261001.md`.
> **Bổ sung 2026-10-03**: Thêm các quy tắc chỉ có trong 契約_詳細要件 đã đóng băng (các dòng có〔Nguồn gốc: …〕) và nội dung chuyển từ 契約_07 (cảnh báo ở 1-9・3-4). Các dòng mâu thuẫn với sổ quyết định・契約_01 đã sửa, cách viết ban đầu để lại ở "(Trước đây: …)".
> Định nghĩa các mục xem `20_法人・拠点・契約/契約仕様/` (2 bảng ①② ở 契約_06 §0.8. Ví dụ của 旧 項目一覧 §0.9 đã chuyển sang 1-9 của tài liệu này), master xem `40_マスタ・料金・請求/マスタ項目一覧_機種_オプション_値引き.md`. Đã gắn chú thích sửa cho RD-BL-003・034・035・052・072・075・078 của bản tổng hợp định nghĩa yêu cầu.

## 1. Lịch xuất hóa đơn

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 1-1 | Chốt・xác nhận・phát hành | **Chốt ngày 20 → xác nhận ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau**. Ví dụ: xác nhận 9/25 → phát hành 10/1 → tháng xuất hóa đơn là tháng 10 → hạn nhập tiền 10/27 | S6-2 (sửa "phát hành cuối tháng" của STEP2 Q4) |
| 1-2 | Tháng xuất hóa đơn | Tháng xuất hóa đơn = tháng phát hành. ① Tháng xuất hóa đơn của trả trước = tháng chu kỳ + lead time phát hành hóa đơn (−3〜+1). Ghi là "tháng xuất hóa đơn (trả trước)" (không thêm "〜phần") | STEP2 Q7・1-9 (旧 項目一覧 §0.9) |
| 1-3 | Nội dung trên 1 hóa đơn | ① Trả trước (chu kỳ sắp giao hàng) và ② quyết toán thực tế (chu kỳ vừa chốt) trên cùng 1 hóa đơn | 1-9 (旧 項目一覧 §0.9)・契約_06 §0.8 |
| 1-4 | Kỳ quyết toán thực tế | **Cố định từ ngày 21 tháng trước đến ngày 20 tháng này** (không chia theo ngày kiểm kê của từng công ty) | P7 (sửa RD-BL-078) |
| 1-5 | Hạn nhập tiền | 1 hóa đơn có 1 hạn. Theo thiết lập của nơi nhận hóa đơn (doanh nghiệp / cơ sở) là **ngày 27 của tháng xuất hóa đơn** hoặc **ngày 27 của tháng sau tháng xuất hóa đơn**. Ngày trừ tiền của chuyển khoản tự động・thẻ tín dụng cũng như vậy | 28-72 |
| 1-6 | Trạng thái hóa đơn | Tên trạng thái của vận hành là **「未確定」(chưa xác nhận)／「確定」(đã xác nhận)／「請求済」(đã xuất hóa đơn)**. Xuất lại hóa đơn・hủy・lỗi gửi・「作成済（未発行）」(đã tạo (chưa phát hành)) thể hiện bằng badge. Web doanh nghiệp chỉ hiển thị 「確定」／「請求済」 (không hiển thị hóa đơn mà vận hành chưa xác nhận). Không dùng chữ 「済み」 trong tên trạng thái. Hóa đơn đã phát hành bằng BillOne là 「請求済」 + badge 「BillOne発行済」, trong lúc đã gửi sang BillOne và chờ kết quả là 「確定」 + badge 「発行中」 (sổ quyết định T 2026-10-14) | Sổ quyết định 「請求書の状態名」「状態の名前」 |
| 1-7 | Khi quyết toán thực tế chưa xác nhận | Dù quyết toán thực tế chưa xác nhận vẫn phát hành hóa đơn. Quyết toán thực tế chưa xác nhận không đưa vào hóa đơn lần này, sau khi xác nhận thì đưa vào **③ điều chỉnh của hóa đơn tháng sau** (vì không có hóa đơn thì không được thanh toán) (sổ quyết định AL・2026-10-16 thống nhất cách gọi "điều chỉnh tháng sau／quyết toán thực tế tháng sau") | 〔Nguồn gốc: 契約_詳細要件 要件(2026/10/02) REQ-CT-301〕 |
| 1-8 | Thúc giục xác nhận và quyền hạn | Với hợp đồng con mà quyết toán thực tế chưa xác nhận đến lúc xác nhận ngày 25, **từ ngày 21** thúc giục chốt bằng **cảnh báo ở TOP (hiển thị cho mọi vai trò)** (sổ quyết định AL・2026-10-16 bảng định nghĩa thời hạn ⑪. Trước đây: từ ngày 26 trở đi). Xác nhận・phát hành quyết toán thực tế・hóa đơn do **toàn quyền・kế toán** thực hiện, **CS chỉ xem・xuất CSV**. Logistics được xem (R. Tạm đặt. Xác nhận cuối cùng ở màn hình quyền. Chỉ màn hình đối chiếu tiền mặt thì logistics cũng CRUD). Quyền theo `運営Web_権限表_20261003.md` là chuẩn (Trước đây: cảnh báo cho nhân viên CS từ ngày 26 trở đi〈2026-10-16 đổi thành từ ngày 21〉・màn hình quyết toán thực tế chỉ nhân viên CS. Sửa cho khớp sổ quyết định F 2026-10-07・10-08) | 〔Nguồn gốc: 契約_詳細要件 REQ-CT-281・282〕 |

**1-9 Ví dụ theo lead time phát hành hóa đơn** (quyết định 2026/09/29. Ngày 2026/10/01 S6-2 đổi ngày phát hành thành "ngày 1 của tháng xuất hóa đơn". 2026-10-03 chuyển từ 契約_07 §0.9)

Hóa đơn **chốt ngày 20 → xác nhận ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau (= ngày 1 của tháng xuất hóa đơn)** (vận hành nhấn 「Bill One で発行」 (Phát hành bằng Bill One) để gửi hàng loạt・S6-1). Trên 1 hóa đơn có cả ① trả trước (chu kỳ sắp giao hàng) và ② quyết toán thực tế (chu kỳ vừa chốt). **Hạn nhập tiền chỉ có 1 cho mỗi hóa đơn**, được quyết định theo thiết lập của nơi nhận hóa đơn.

```
Tháng xuất hóa đơn = tháng chu kỳ của hợp đồng・chu kỳ ① + lead time phát hành hóa đơn (−3〜+1)
Ngày phát hành     = ngày 1 của tháng xuất hóa đơn (xác nhận ngày 25 tháng trước)
Tháng chu kỳ của ② = tháng xuất hóa đơn − 1 (kỳ là ngày 21 tháng trước〜ngày 20 tháng này)
Hạn nhập tiền      = ngày 27 của tháng xuất hóa đơn hoặc ngày 27 của tháng sau tháng xuất hóa đơn ("hạn nhập tiền" của nơi nhận hóa đơn)
```

Ví dụ: khi tháng chu kỳ của ① là 2026-09

| Lead time | Kỳ của ① | Ngày phát hành (tháng xuất hóa đơn) | Hạn nhập tiền (ngày 27 của tháng xuất hóa đơn) | Hạn nhập tiền (ngày 27 tháng sau) |
|---|---|---|---|---|
| 3 tháng trước (−3) | 9/1〜9/30 | 6/1 (tháng 6) | 6/27 | 7/27 |
| 2 tháng trước (−2) | 9/1〜9/30 | 7/1 (tháng 7) | 7/27 | 8/27 |
| 1 tháng trước (−1・mặc định) | 9/1〜9/30 | 8/1 (tháng 8) | 8/27 | 9/27 |
| Tháng này (0) | 9/1〜9/30 | 9/1 (tháng 9) | 9/27 | 10/27 |
| Tháng sau (+1・trả sau) | 9/1〜9/30 | 10/1 (tháng 10) | 10/27 | 11/27 |

- **Ngày trừ tiền** của chuyển khoản tự động・thẻ tín dụng cũng dùng ngày này.
- Thanh toán một lần theo năm (chu kỳ thanh toán = trả theo năm) xuất hóa đơn 12 chu kỳ từ tháng chu kỳ của tháng khởi điểm trên 1 hóa đơn. Hợp đồng con không giữ "đơn vị trả trước" (2026/09/29).
- Kỳ "9/1〜9/30" của ① là ví dụ. Thực tế là 1 chu kỳ của tháng chu kỳ (A1〜D7. 契約_00 §0.3).

## 2. Quy tắc về số tiền

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 2-1 | Tính theo ngày | **Không làm**. Hợp đồng theo đơn vị chu kỳ. Phí hàng tháng (gói・thiết bị・tùy chọn) tính đủ cho mỗi tháng chu kỳ | P1 |
| 2-2 | Thay đổi・lắp đặt・thu hồi giữa tháng | **Quyết định theo hạn chót đặt hàng (mặc định là ngày 15 tháng trước)**. Đơn đăng ký trước hạn chót tính đủ từ tháng chu kỳ đó, sau hạn chót thì từ tháng chu kỳ tiếp theo. Thu hồi cũng như vậy (đơn đăng ký trước hạn chót thì đến hết tháng chu kỳ đó) | S1 |
| 2-3 | 2 dòng của phí gói | Cơ sở áp dụng phúc lợi thì phí gói chia thành 2 dòng **phí cơ bản (10%) + phúc lợi (phần doanh nghiệp chịu・8%)**. Phúc lợi = 100 yên × tổng giới hạn cung cấp hàng tháng ÷ 1.08 (**làm tròn**. Số lẻ của tỷ lệ giảm giá cũng làm tròn. Trước đây: làm tròn xuống. Sổ quyết định F 2026-10-07 cho khớp với các màn hình khác liên quan đến hóa đơn). Cơ sở không áp dụng thì 1 dòng phí cơ bản (10%) | 28-148〜150・STEP3 H5 |
| 2-4 | Thuế tiêu dùng | ES tính. **Làm tròn tổng theo từng hóa đơn・từng thuế suất** (số âm làm tròn theo giá trị tuyệt đối). Cũng gửi tiền thuế cho Bill One, bắt buộc để số tiền trên màn hình và hóa đơn khớp nhau. Thuế theo từng cơ sở hiển thị là "tham khảo", tiền thuế của doanh nghiệp là chuẩn. **Thuế suất là bất kỳ mức nào của master thuế suất** (không giới hạn 8%・10%. Hóa đơn hiển thị các ô "đối tượng ○% (chưa thuế)" "thuế tiêu dùng (○%)" theo từng thuế suất. 2026-10-05) | v1.43・P9・S5 |
| 2-5 | Thay đổi của tháng đã trả trước | Nếu có nghỉ・hủy・hạ gói thì phần của tháng đã xuất hóa đơn sẽ bù trừ ở **③ điều chỉnh của hóa đơn tháng sau** (dòng trừ của điều chỉnh). Phần không bù trừ hết thì tùy trường hợp sẽ bù trừ từ tháng sau nữa trở đi, hoặc hoàn tiền ngoài hệ thống (sổ quyết định AL・2026-10-16 chi tiết hóa đơn ⑥). Chênh lệch do thay đổi hợp đồng, nếu tháng đã xác nhận thì cũng chuyển sang hóa đơn tháng sau (⑤) | P2 |
| 2-6 | Hóa đơn lần đầu | Khi việc phê duyệt đơn đăng ký không kịp xác nhận ngày 25, thì gộp 2 tháng vào hóa đơn (lần đầu) tiếp theo (có gộp hay không là do **vận hành chọn thủ công khi phê duyệt**. Sổ quyết định AL・2026-10-16 bảng định nghĩa thời hạn ⑬) | P3 |
| 2-7 | Phí hàng tháng ES-QR | **Trả trước** (giống các phí hàng tháng khác). Phần không kịp trả trước (bắt đầu dùng sau khi xác nhận, v.v.) chuyển sang hóa đơn tiếp theo | P6 (sửa RD-BL-003) |
| 2-8 | Chiến dịch dùng thử | Giảm giá chiến dịch dùng thử DC000013 (phân loại tính toán = tham chiếu phí gói・mỗi doanh nghiệp 1 lần・tự động gắn vào hợp đồng con dùng thử) chỉ bù trừ số tiền cố định (phí gói). Quyết toán thực tế (hao hụt quản lý) vẫn xuất hóa đơn | STEP3 Q3・P8 |
| 2-9 | Số tiền của tùy chọn | Với tùy chọn có loại số tiền là 「都度入力」(nhập mỗi lần)「最低額から」(từ mức tối thiểu), khi gắn vào hợp đồng con bắt buộc nhập số tiền | Bổ sung Q-D・Q-E |
| 2-10 | Phí thiết bị | Thiết bị cho mượn tiêu chuẩn của master gói là miễn phí (không tạo dòng). Máy bán hàng tự động chỉ giữ làm thiết bị cho mượn tiêu chuẩn của course ESライト (máy bán hàng tự động), không làm tổ hợp "ESスタンダード + phí hàng tháng máy bán hàng tự động" (1 cơ sở 1 course) | 28-182・STEP3 Q5・Chuyển tiếp 3 |
| 2-11 | Chênh lệch kích cỡ | Chênh lệch kích cỡ là chênh lệch so với dòng máy tiêu chuẩn cùng phân loại (chỉ khi dương). **Spot (1 lần) hay hàng tháng do master quyết định theo từng thiết bị (cũng có khi cả hai)**: spot xuất hóa đơn bằng dòng đơn lẻ, hàng tháng xuất hóa đơn bằng dòng hàng tháng của OP000023〔hong trả lời 2026-10-15・sổ quyết định AK・sổ tiếp nhận #642. Trước đây: chỉ OP000023 (hàng tháng)〕. Máy vượt quá tiêu chuẩn・dòng máy không có trong tiêu chuẩn cũng vậy (phí spot・phí hàng tháng của dòng máy đó). OP000010 là 「冷蔵庫交換（お客様都合）」 (đổi tủ lạnh (do khách hàng)) (đơn lẻ・nhập mỗi lần) | Bổ sung Q-A, sổ quyết định AK |
| 2-12 | Cho thuê・chi phí ban đầu của máy bán hàng tự động | **Phí thuê máy bán hàng tự động được bao gồm trong phí gói (ESライト〔máy bán hàng tự động〕). Bỏ OP000037** (2026-10-13 hong. Sổ quyết định V). Phần máy tiêu chuẩn bao gồm trong gói đã nằm trong phí gói, **chỉ khi thêm máy sau đó thì mới cộng phí hàng tháng của master dòng máy** (không nhân với số máy). Chi phí ban đầu của máy bán hàng tự động (spot) nhập số tiền theo từng hợp đồng (giá trị ban đầu là giá trị của master dòng máy). Trước đây: cho thuê = số tiền 1 máy × số máy (OP000037・triển khai 2026-10-05) | 〔Nguồn gốc: 契約_詳細要件 要件(2026/10/02) REQ-CT-303〕 |
| 2-13 | Mua lại món ăn chế biến sẵn | Hợp đồng mua lại món ăn chế biến sẵn (契約_05 hợp đồng #8) tự động tính từ kết quả giao hàng: ① số tiền cố định = phần nhân viên chịu 100 yên × số lượng, ② quyết toán thực tế = Σ (số lượng giao × (đơn giá − 100 yên)) | 〔Nguồn gốc: 契約_詳細要件 REQ-CT-306〕 |
| 2-14 | Âm・xuất hóa đơn thừa | Khi tổng quyết toán thực tế âm, hoặc xuất hóa đơn thừa do tăng giá, v.v. thì không hoàn tiền mà bù trừ ở hóa đơn các tháng sau (dòng của ③ chi tiết điều chỉnh. 契約_06). Khi hóa đơn tiếp theo không bù trừ hết thì tùy trường hợp sẽ bù trừ từ tháng sau nữa trở đi, hoặc hoàn tiền ngoài hệ thống (sổ quyết định AL・2026-10-16 chi tiết hóa đơn ⑥). Trên hóa đơn ghi cả dương・âm để thấy đã bù trừ (bằng chứng hoàn tiền về kế toán) | 〔Nguồn gốc: 契約_詳細要件 REQ-CT-279・280〕 (dòng "② điều chỉnh (chuyển tiếp)" của bản gốc được đọc thành ③ chi tiết điều chỉnh cho khớp 契約_01 §3) |

## 3. Nghỉ・tiếp tục・hủy

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 3-1 | Hóa đơn khi đang nghỉ | Không xuất hóa đơn phí gói của tháng đang nghỉ. **Khi đang nghỉ không quyết toán thực tế.** Kiểm tồn kho vào lúc bắt đầu nghỉ để quyết toán phần cho đến đó. Chênh lệch phát sinh trong lúc nghỉ ở thiết bị để nguyên tại chỗ sẽ được phát hiện ở kiểm tồn kho khi tiếp tục (hoặc khi hủy) (Trước đây: quyết toán thực tế làm hàng tháng nếu cần nhưng không xuất hóa đơn, gộp xuất hóa đơn khi tiếp tục hoặc khi hủy. 2026-10-03 sửa cho khớp 契約_01 §5) | 契約_01 §5 (TL-2 bổ sung・Q1 = B. Ghi đè P5) |
| 3-2 | Giới hạn nghỉ | Tối đa 12 tháng cộng dồn. Tháng dự kiến tiếp tục là bắt buộc (không chọn được 「未定」(chưa định)) | Quyết định tối 2026/10/01 |
| 3-3 | Ngày hủy | Tiếp nhận **đến trước khi phát hành hóa đơn của tháng đối tượng** (thay đổi 2026/10/09・hong trả lời 2026-10-12. Trước đây: tiếp nhận được phán định theo hạn chót đặt hàng〈đơn đăng ký trước hạn chót áp dụng từ tháng sau・sau hạn chót áp dụng từ tháng sau nữa〉). Ngày hủy là ngày cuối của chu kỳ. Không có hạn chót sớm hơn riêng cho máy bán hàng tự động. Khi hủy hóa đơn đã phát hành thì hủy trên màn hình Bill One, rồi phát hành lại từ ứng dụng (5-4) (hong 2026-10-14: từ ngày 26 trở đi xử lý như "tháng tiếp theo". Giữ "đến trước khi phát hành hóa đơn" cho đến khi kế toán trả lời. "Đến ngày 25 của 2 tháng trước"〔2026-10-13〕 ở phía `main` được thay thế) | D4 = A・K-05・RD-CT-140, sổ tiếp nhận #505 |
| 3-4 | Tiền phạt・phí hủy thiết bị | **Phí hủy thiết bị (phí hỗ trợ thiết bị)**. ~~**① Tiền phạt hợp đồng**: hủy do vi phạm hợp đồng là ¥12,000 (cố định・mỗi hợp đồng)~~ (2026/10/14 hủy bỏ: ¥12,000 là ví dụ của phí hủy thiết bị〔phí hỗ trợ thiết bị・số tiền theo từng kích cỡ dòng máy〕, không phải là một khoản phí riêng. hong trả lời 2026-10-14, OPEN 1013-09). **② Phí hủy thiết bị**: khi trả lại (hủy) thiết bị khi chưa đủ **"số tháng đối tượng phí hủy" của master dòng máy** tính từ khi bắt đầu cho mượn (**là mục khác với thời gian sử dụng tối thiểu〔minMonths = tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng. Trong thời gian này không thể đăng ký hủy〕**. Tủ lạnh・tủ đông là 12 tháng, máy bán hàng tự động là 36 tháng. Thêm mục vào master dòng máy. 2026-10-14 hong trả lời・sổ tiếp nhận #633〔thay thế "không tạo mục mới" của #590〕. Thiết bị không cho mượn thì không thuộc đối tượng. Thay đổi 2026/10/13. Trước đây: mọi thiết bị dưới 1 năm), thì **cộng dồn nguyên** **phí hủy của master dòng máy theo từng thiết bị** (bảng phí 2027 "phí hủy dưới 1 năm") (không chia theo số tháng). Số tiền trong bảng là **đã gồm thuế**, hệ thống giữ **số tiền chưa thuế = đã gồm thuế ÷ 1.1**, và tính thuế trên hóa đơn. Ở màn hình thủ tục hủy, xác nhận ý định trả lại thiết bị và hiển thị trước việc sẽ phát sinh phí (thay đổi 2026/10/09・hong trả lời 2026/10/12. Trước đây: cộng dồn "số tiền thu hồi khi hủy" của từng thiết bị × số tháng còn lại ÷ thời gian sử dụng tối thiểu). Thời gian sử dụng tối thiểu là tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (tính từ ngày cho mượn của từng thiết bị. Khi đang nghỉ **chỉ không tính thiết bị để nguyên tại chỗ**. Khi đã rút thiết bị về thì không thu tiền phạt. **Khi lắp đặt lại thiết bị đã rút về cũng kế thừa phần còn lại trước khi nghỉ** (không tính lại). Phí lắp đặt lại (OP000015) không tự động thu, chỉ khi cần thì vận hành thêm thủ công)〔hong trả lời 2026-10-06 (A-1)・khách hàng trả lời. Trước đây: vận hành chọn "tính lại／kế thừa + OP000015"〕. Nếu tại thời điểm nhập ngày mong muốn hủy mà có tiền phạt thì cảnh báo trước khi xác nhận (2026-10-03 chuyển từ 契約_07 §0.11)| 28-2・STEP2 Q8 |
| 3-5 | Hóa đơn cuối | **Hóa đơn cuối cùng 1 hóa đơn vào tháng sau tháng hủy** (quyết toán thực tế cuối cùng + tiền phạt + mua lại tồn kho còn lại). **Phát hành riêng** (ngày 1 tháng sau tháng hủy). **Chờ quyết toán thực tế cuối cùng xác nhận rồi mới xác nhận**, không phát hành khi còn chưa xác nhận. Xác nhận giống thông thường (có thể xác nhận từ ngày 21. Ngày phát hành in ra là ngày 1 tháng sau). Chênh lệch của báo cáo kiểm kê sau khi hủy (đến ngày 20 tháng sau) được xuất hóa đơn・điều chỉnh riêng sau khi phát hành hóa đơn cuối cùng (sổ quyết định AL・2026-10-16 chi tiết hóa đơn ⑫⑬⑭, bảng định nghĩa thời hạn ⑧) | S4-1 |
| 3-5b | Hóa đơn cuối cùng 0 yên | Vận hành cũng tạo hóa đơn cuối cùng cho cơ sở không có gì để xuất hóa đơn (0 yên・ghi nhận trong ES và không gửi sang Bill One. Tài khoản dừng sử dụng vào ngày sau hạn nhập tiền đó). Hóa đơn 0 yên không hiển thị trên Web doanh nghiệp. Cơ sở đã hủy mà quá tháng phải phát hành hóa đơn cuối cùng vẫn chưa tạo thì cảnh báo ở TOP của vận hành (từ tháng sau tháng phát hành. Ví dụ: hủy 12/06 → tháng phát hành là tháng 1 → từ tháng 2) | Sổ quyết định AS・sổ tiếp nhận #779 |
| 3-6 | Tồn kho còn lại | Chỉ khi doanh nghiệp chọn 「買取」(mua lại) thì xuất hóa đơn dưới dạng mua lại bằng **số lượng × đơn giá** (OP000031 phí mua lại món ăn chế biến sẵn). **Số lượng** = nếu có báo cáo kiểm kê cuối cùng của tháng hủy thì dùng số đó, nếu không thì dùng tồn kho tính toán. **Đơn giá** = giá bán tại thời điểm công khai thực đơn gần nhất có chứa sản phẩm đó〔hong trả lời 2026-10-12〕. Khi 「返却」(trả lại) thì không xuất hóa đơn | S4-2, sổ quyết định 「解約・買取の数量と単価」 |
| 3-7 | Tài khoản | Để lại ở chế độ 「参照のみ」(chỉ xem) đến hạn nhập tiền của hóa đơn cuối cùng, ngày hôm sau thì dừng (※2026-10-16 sổ quyết định AL: việc dừng tài khoản **do vận hành thực hiện thủ công, dự kiến dừng vào cuối tháng hủy**. Thay thế "dừng vào ngày sau hạn nhập tiền". Quan hệ với thời gian 『参照のみ』 cần xác nhận). Khi dừng thì gửi email (Message List email No.16). Thông báo trước theo nội dung hủy của email phê duyệt (No.10)<br>**Cũng gửi email nhắc nhở vào ngày trước khi dừng**〔hong trả lời 2026-10-03 (K15)〕〔Nguồn gốc: REQ-CT-145〕| S4-3・決定_メールと通知の追加 |

## 4. Trả theo năm・phương thức thanh toán

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 4-1 | Tháng khởi điểm của trả theo năm | Tháng chu kỳ bắt đầu hợp đồng | S3-1 |
| 4-2 | Sửa phí giữa kỳ của trả theo năm | Giữ phí hiện tại đến tháng khởi điểm tiếp theo | S3-2 |
| 4-3 | Hóa đơn trả theo năm | Xuất hóa đơn 12 chu kỳ từ tháng chu kỳ của tháng khởi điểm trên 1 hóa đơn. Hợp đồng con không giữ "đơn vị trả trước" | 1-9 (旧 項目一覧 §0.9. 2026/09/29) |
| 4-4 | Thẻ tín dụng | Vẫn để trong lựa chọn phương thức thanh toán. Thanh toán thực hiện ngoài hệ thống (ES chỉ giữ phân loại) | S7 = B |
| 4-5 | Thay đổi giữa chừng lead time phát hành hóa đơn | Không giới hạn. Cảnh báo ở màn hình vận hành để xác nhận các tháng trả trước bị trùng・thiếu (Message List WEB No.63) | S2・RD-BL-045 |
| 4-6 | Thiết lập hóa đơn (đơn vị xuất hóa đơn, v.v.) | Doanh nghiệp chỉ xem. Thay đổi do vận hành | E-9 = B (chú thích ở RD-BL-052) |
| 4-7 | Quyết toán thực tế của trả theo năm | Dù trả theo năm, quyết toán thực tế (②) vẫn xuất hóa đơn theo chốt hàng tháng. Chỉ số tiền cố định (①) mới trả theo năm | 〔Nguồn gốc: 契約_詳細要件 §8C-2・§8E-2 REQ-CT-223・248〕 (REQ-CT-223 vẫn là "chọn hàng tháng hay theo năm (tạm)") |

## 5. Liên kết với Bill One

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 5-1 | Thời điểm gửi | Sau xác nhận ngày 25, vận hành nhấn 「Bill One で発行」 (Phát hành bằng Bill One) để gửi hàng loạt (ngày phát hành là ngày 1 tháng sau). Xác nhận ngày 25 có thể lọc các hợp đồng con có thay đổi・hợp đồng con có quyết toán thực tế hoặc giảm giá để kiểm tra trước, phần còn lại xác nhận hàng loạt〔Nguồn gốc: 契約_詳細要件 REQ-CT-222・286〕. Việc gửi sang Bill One thực hiện ngay sau khi nhấn, và đặt ngày phát hành phía Bill One là ngày 1 (sổ quyết định AL・2026-10-16 bảng định nghĩa thời hạn ⑫) | S6-1・S6-2 |
| 5-2 | ID nơi phát hành | Mỗi nơi nhận hóa đơn (doanh nghiệp / cơ sở) có 1. Nếu chưa đăng ký thì tự động tạo khi phát hành | S6-3・RD-BL-031 |
| 5-3 | Khi không gửi được | Hiển thị 「送信エラー」(lỗi gửi) ở màn hình vận hành, sửa rồi gửi lại (Message List WEB No.64 phát hành・No.65 gửi thất bại). Gửi lại sang Bill One do vận hành thực hiện thủ công (không giới hạn số lần). Khi ở 「発行中」 mà không nhận được kết quả thì đặt nút thủ công (kiểm tra đã gửi được chưa・chuyển sang lỗi gửi) (có tự động chuyển sang lỗi gửi sau một khoảng thời gian nhất định hay không thì cần xác nhận) (sổ quyết định AL・2026-10-16 ⑨) | S6-4 |
| 5-4 | Sửa | Nguyên tắc là bù trừ ở hóa đơn tháng sau. Thay thế chỉ khi vận hành phán đoán: hủy ở Bill One (màn hình Bill One. Không có API) → ES chuyển ID cũ thành 「取消」(hủy) và phát hành lại bằng ID khác (WEB No.73・74). Sau 「作成を取り消す」(hủy tạo), người hủy phía Bill One là vận hành (người có tài khoản Bill One). Phát hành lại sau khi hủy thì làm lại từ bước tạo hóa đơn. Khi biết đã nhập tiền sau khi phát hành hóa đơn có xuất lại hóa đơn, chỉ có thể hủy rồi phát hành lại khi chưa nhập tiền (đã nhập tiền thì Bill One cũng không hủy được nên chỉ bù trừ ở tháng sau) (sổ quyết định AL・2026-10-16 ⑦⑩⑪) | P4・S6-5・Bill One trả lời Q6・Q7 |
| 5-5 | Nhập tiền (đối chiếu) | Không nhập (clearings API của Bill One chỉ để tham khảo) | S6 bổ sung・K-07・RD-BL-024 |
| 5-6 | Gửi hóa đơn | ES không gửi. Hóa đơn (PDF) và thông báo gửi từ Bill One | RD-BL-020・025 |
| 5-7 | CSV phân tích doanh thu | Xuất CSV của danh sách hóa đơn bao gồm các cột cho phân tích doanh thu (doanh thu・số doanh nghiệp hợp đồng・số cơ sở hợp đồng・số tháng liên tục・nhân viên kinh doanh phụ trách・loại hợp đồng・đơn giá). Các cột này không hiển thị trong danh sách trên màn hình (phân tích bằng Looker Studio, v.v.) | 〔Nguồn gốc: 契約_詳細要件 §8・REQ-CT-291〕 |
| 5-8 | Tìm kiếm danh sách hóa đơn | Thêm 「支払方法」(phương thức thanh toán) vào điều kiện tìm kiếm của danh sách hóa đơn | 〔Nguồn gốc: 契約_詳細要件 §8D-3・REQ-CT-293〕 |
| 5-9 | Chi tiết hóa đơn (quyết toán thực tế・điều chỉnh・hóa đơn cuối cùng. Sổ quyết định AL・2026-10-16 chi tiết hóa đơn) | ① Dòng có màu (tỷ lệ chênh lệch・tỷ lệ hủy bỏ từ 10% trở lên) cũng có thể chọn để xác nhận (có thể gộp). ② Sai sót sau khi đã xuất hóa đơn thì bù trừ ở ③ điều chỉnh của hóa đơn tháng sau. ③ 「締め月を進める」(chuyển tháng chốt) không nhấn được khi có hóa đơn đang lỗi gửi. ④ Khi sửa số tiền sau hạn chót thì vận hành sửa riêng từng cái (sau khi đã phát hành hóa đơn thì đưa chênh lệch vào hóa đơn của tháng sau, nếu không có tháng sau〈trả theo năm, v.v.〉 thì phát hành hóa đơn mới). ⑧ Hóa đơn 0 yên chỉ ghi nhận trong ES (không gửi sang Bill One・không hiển thị trên Web doanh nghiệp). Hóa đơn cuối cùng dù 0 yên vận hành vẫn tạo (3-5b)〔2026-10-18 thay thế bằng sổ quyết định AS #779. Trước đây: tạm thời giữ nguyên〕. ⑮ Thời điểm Bill One gửi cho doanh nghiệp・việc gửi hóa đơn 0 yên đang chờ khách hàng・Bill One trả lời ⑯ Dấu xác nhận của tháng chốt được giữ theo từng tháng (dù chuyển tháng chốt thì xác nhận của tháng trước vẫn còn). 「報告済」(đã báo cáo) chỉ quyết định bằng báo cáo kiểm kê (bao gồm nhập thay của vận hành). Chi tiết điều chỉnh giữ tháng chốt đã nhập, phán định kỳ thì xem tháng chốt trước (dữ liệu cũ thì theo ngày nhập) | Sổ quyết định AL (Q58・Q59・Q61・Q63・Q67・Q60・Q62・Q74)・AS (#766・#779・#781) |

## 6. Phí đại lý

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 6-1 | Số tiền chuẩn | Chỉ số tiền cố định (trả trước) chưa thuế・sau giảm giá. **Hóa đơn trong thời gian dùng thử không thuộc đối tượng** | S8 |

## 7. Những mục chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| 1 | Giá chính thức của gói 50 ESライト (tủ lạnh) (tạm ¥24,500). Có dùng lần sửa đổi thứ tư của master gói (2026/10/01〜 ¥25,000) cho các hợp đồng mới từ tháng 10 trở đi hay không | Khách hàng xác nhận |
| 2 | Giá của gói máy bán hàng tự động 150・200・300 (giữ ¥74,000／¥96,000／¥139,000) | Khách hàng xác nhận (S9 = C) |
| 3 | Tên・số tiền của các tùy chọn đã thêm (OP000024〜035) | Bảng danh sách của khách hàng là【đề xuất tạm】nên cần xác nhận |
| 4 | Phí tủ đông (bảng yêu cầu dòng 174・OP000032・033) | DIPRO xác nhận |

## 8. Cách xử lý trong demo (thời điểm v1.48 ngày 2026/10/01)

| Quy tắc | Demo |
|---|---|
| 1-1 ngày phát hành・1-5 hạn nhập tiền・2-3・2-4・2-10・2-11 | Đã có (demo hóa đơn của vận hành, doanh nghiệp・cơ sở・hợp đồng・quản lý đơn đăng ký, quản lý cơ sở của Web doanh nghiệp) |
| 1-6 5 giai đoạn của trạng thái hóa đơn | Đã có ở danh sách hợp đồng con・quản lý đơn đăng ký. Màn hình chốt hóa đơn chưa hỗ trợ |
| 3-1・3-5〜3-7・2-2 | Hiển thị như quy tắc ở 「この申請で影響する範囲」 (phạm vi bị ảnh hưởng bởi đơn đăng ký này) của chi tiết đơn đăng ký (không có hoạt động tính toán) |
| 4-5 cảnh báo lead time・5-3 lỗi gửi và gửi lại・5-4 hủy và phát hành lại | **Đã có (v1.48)**: demo hóa đơn của vận hành. Lỗi gửi là ví dụ lần 1 của 大阪キッチン (C3) bị timeout. Cảnh báo lead time nằm ở điều kiện hóa đơn của doanh nghiệp |
| 3-7 tài khoản (chỉ xem・dừng)・email | **Đã có (v1.48)**: chuyển đổi demo của Web doanh nghiệp 「解約後（参照のみ）」 (sau khi hủy (chỉ xem)) 「停止後（ログイン）」 (sau khi dừng (đăng nhập)), mẫu email ở chi tiết đơn đăng ký của vận hành (phê duyệt No.10・dừng tài khoản No.16・dừng giao hàng No.14) |
| 6-1 phí đại lý・1-6 5 giai đoạn của màn hình chốt hóa đơn | Không có màn hình |
| Nút nhận kết quả phát hành của 5-3 (「結果を受け取る」 (nhận kết quả) trong demo hóa đơn của vận hành) | **Chỉ dành cho demo** (nhận kết quả trên màn hình thay cho phản hồi của Bill One). **Không đặt ở môi trường thật** (môi trường thật nhận kết quả bằng phản hồi của Bill One). Sổ quyết định AK (2026-10-15・hong trả lời M38) |

## Lịch sử thay đổi

| Ngày họp | Đối tượng (mục・REQ) | Trước thay đổi | Sau thay đổi | Lý do thay đổi | Căn cứ (MM・thời điểm) | Trạng thái |
|---|---|---|---|---|---|---|
| 2026/10/09 | 3-3 ngày hủy (hạn chót tiếp nhận) | Tiếp nhận được phán định theo hạn chót đặt hàng | Tiếp nhận đến trước khi phát hành hóa đơn của tháng đối tượng. Hủy hóa đơn đã phát hành thì làm trên màn hình Bill One → phát hành lại từ ứng dụng (5-4) | Để tránh hủy・phát hành lại hóa đơn (tài liệu của khách hàng slide 27). hong trả lời 2026-10-12 | 〔MM_20261009_1200 ［01:15:55〜01:31:40］〕 sổ tiếp nhận #505 | Chờ triển khai |
| 2026/10/06 | 3-4 tiền phạt (thời gian sử dụng tối thiểu) | Lắp đặt lại thiết bị đã rút về: vận hành chọn ① tính lại／② kế thừa + phí lắp đặt lại | Kế thừa (không reset)・không có phí lắp đặt lại | Chủ trương của khách hàng | 〔MM_20261006_1200 ［00:20:42］〕 | Chờ triển khai |
| 2026/10/07 | 1 lịch xuất hóa đơn (bắt đầu quyết toán thực tế) | Chưa ghi cách xử lý quyết toán thực tế phần tháng 2 | Hóa đơn phát hành ngày 1 tháng 3 không bao gồm quyết toán thực tế tháng 2. Từ hóa đơn phát hành ngày 1 tháng 4 mới phản ánh hóa đơn quyết toán thực tế | Chuyển đổi khi release giai đoạn 2 (2/16) | 〔MM_20261007_1301 ［00:14:19〜00:16:47］〕 | Chờ triển khai |
| 2026/10/09 | 3-4 tiền phạt・phí hủy thiết bị | Cộng dồn "số tiền thu hồi khi hủy" của từng thiết bị × số tháng còn lại ÷ thời gian sử dụng tối thiểu (1 khoản) | 2 khoản phí riêng: ① tiền phạt hợp đồng (¥12,000 khi hủy do vi phạm hợp đồng), ② phí hủy thiết bị (trả lại dưới 1 năm thì cộng dồn nguyên phí hủy của master dòng máy theo từng thiết bị. Đã gồm thuế ÷ 1.1 ra chưa thuế) | Đề xuất trong cuộc họp (①). hong trả lời 2026/10/12: ① và ② là 2 khoản phí riêng | 〔MM_20261009_1200 ［01:03:33］〕 sổ tiếp nhận #504・#522 | Chờ triển khai |
| 2026/10/13 | 3-4 tiền phạt・phí hủy thiết bị (thời gian) | Phí hủy thiết bị = mọi thiết bị dưới 1 năm tính từ khi bắt đầu cho mượn | Tủ lạnh・tủ đông là dưới 1 năm, máy bán hàng tự động là dưới 3 năm. Thiết bị không cho mượn thì không thuộc đối tượng. Nếu cho mượn cả tủ lạnh và tủ đông thì tính cả hai. Đổi gói スタンダード/ライト → máy bán hàng tự động thì không có phí (#608), スタンダード → ライト thì có phí tủ đông (#609, triển khai vẫn từ giai đoạn 3 trở đi), máy bán hàng tự động → loại tủ lạnh thì dưới 3 năm có phí máy bán hàng tự động (#610) (#606〜#610 hong chấp nhận 2026/10/14) | Anh/chị Aoyama giải thích trong cuộc họp, hong trả lời 2026/10/14 (#605) | 〔MM_20261013_1156 ［01:29:01〜01:30:14］〕 sổ tiếp nhận #605 | Chờ triển khai |
| 2026/10/13 | 3-4 tiền phạt (hủy do vi phạm hợp đồng ¥12,000) | 2 khoản: ① tiền phạt hợp đồng ¥12,000 (cố định) và ② phí hủy thiết bị | Hủy bỏ ①. ¥12,000 là ví dụ của phí hủy thiết bị (phí hỗ trợ thiết bị・số tiền theo từng kích cỡ dòng máy). Phí chỉ có phí hủy thiết bị | hong trả lời 2026/10/14 (B) | 〔MM_20261013_1156 ［01:31:00〜01:34:05］〕 sổ tiếp nhận #522 hủy bỏ | Chờ triển khai |
| 2026/10/15 | 8 (cách xử lý trong demo) nút 「結果を受け取る」 | (không ghi) | Chỉ dành cho demo. Không đặt ở môi trường thật | Phản ánh câu trả lời của hong (sổ quyết định AK) | Sổ quyết định AK M38 | Chờ triển khai |
