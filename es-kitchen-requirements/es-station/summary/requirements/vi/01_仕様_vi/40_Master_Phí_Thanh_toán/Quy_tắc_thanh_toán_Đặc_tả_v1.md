# Đặc tả quy tắc thanh toán v1 (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Soạn: Claude (Cowork). Tài liệu tổng hợp thành một các quy tắc thanh toán đã quyết định trong STEP2・STEP3 và trong các câu trả lời đóng STEP1.
> **Không thêm quyết định mới**. File quyết định ở cột "Căn cứ" của từng dòng là chuẩn, nếu mâu thuẫn với tài liệu này thì ưu tiên file quyết định.
> File quyết định làm căn cứ (`01_仕様/00_Quyết_định/`):
> `Quyết_định_STEP2_Trả_lời_Doanh_nghiệp_Cơ_sở_Hợp_đồng_20261001.md` (STEP2), `Quyết_định_STEP3_Trả_lời_Master_và_Thanh_toán_20261001.md` (STEP3 Q), `Quyết_định_STEP3_Bổ_sung_Thiếu_sót_Master_Tùy_chọn_Giảm_giá_20261001.md` (bổ sung), `Quyết_định_STEP3_Bổ_sung_Quy_tắc_thanh_toán_20261001.md` (P), `Quyết_định_STEP3_Trả_lời_phần_còn_lại_và_đóng_STEP1_20261001.md` (S・T), `Quyết_định_Hạng_mục_chuyển_tiếp_sau_v146_20261001.md`, `Quyết_định_Bổ_sung_email_và_thông_báo_20261001.md`.
> **Bổ sung 2026-10-03**: Thêm các quy tắc chỉ có trong 契約_詳細要件 đã đóng băng (các dòng có〔Nguồn gốc: …〕) và nội dung chuyển từ 契約_07 (cảnh báo ở 1-9・3-4). Các dòng mâu thuẫn với sổ cái・契約_01 đã sửa, cách viết ban đầu để lại ở "(Trước đây: …)".
> Định nghĩa các mục xem `20_Doanh_nghiệp_Cơ_sở_Hợp_đồng/Đặc_tả_hợp_đồng/` (2 bảng ①② ở 契約_06 §0.8. Ví dụ của 項目一覧 §0.9 cũ đã chuyển sang 1-9 của tài liệu này), master xem `40_Master_Phí_Thanh_toán/Danh_sách_mục_Master_Dòng_máy_Tùy_chọn_Giảm_giá.md`.
> Đã gắn chú thích sửa cho RD-BL-003・034・035・052・072・075・078 của bản tổng hợp định nghĩa yêu cầu.

## 1. Lịch thanh toán

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 1-1 | Chốt・xác nhận・phát hành | **Chốt ngày 20 → xác nhận ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau**. Ví dụ: xác nhận 9/25 → phát hành 10/1 → tháng thanh toán là tháng 10 → hạn nhập tiền 10/27 | S6-2 (sửa "phát hành cuối tháng" của STEP2 Q4) |
| 1-2 | Tháng thanh toán | Tháng thanh toán = tháng phát hành. ① Tháng thanh toán của trả trước = tháng chu kỳ + lead time phát hành hóa đơn (−3〜+1). Ghi là "tháng thanh toán (trả trước)" (không thêm "〜phần") | STEP2 Q7・1-9 (旧 項目一覧 §0.9) |
| 1-3 | Nội dung trên 1 hóa đơn | ① Trả trước (chu kỳ sắp giao hàng) và ② quyết toán thực tế (chu kỳ vừa chốt) trên cùng 1 hóa đơn | 1-9 (旧 項目一覧 §0.9)・契約_06 §0.8 |
| 1-4 | Kỳ quyết toán thực tế | **Cố định từ ngày 21 tháng trước đến ngày 20 tháng này** (không chia theo ngày kiểm kê của từng công ty) | P7 (sửa RD-BL-078) |
| 1-5 | Hạn nhập tiền | 1 hóa đơn có 1 hạn. Theo thiết lập của nơi nhận hóa đơn (doanh nghiệp / cơ sở) là **ngày 27 của tháng thanh toán** hoặc **ngày 27 của tháng sau tháng thanh toán**. Ngày trừ tiền của chuyển khoản tự động・thẻ tín dụng cũng như vậy | 28-72 |
| 1-6 | Trạng thái thanh toán | Vận hành có 5 giai đoạn (trả trước: đã tạo / ① xác nhận / cơ sở xác nhận / doanh nghiệp xác nhận / đã thanh toán, trả sau: chưa tổng hợp / ② xác nhận / cơ sở xác nhận / doanh nghiệp xác nhận / đã thanh toán). Web doanh nghiệp có 3 giai đoạn (chưa xác nhận / đã xác nhận / đã thanh toán) | STEP2 Q6 |
| 1-7 | Khi quyết toán thực tế chưa xác nhận | Dù quyết toán thực tế chưa xác nhận vẫn phát hành hóa đơn. Quyết toán thực tế chưa xác nhận không đưa vào lần thanh toán này, sau khi xác nhận thì điều chỉnh ở thanh toán tháng sau (vì không có hóa đơn thì không được thanh toán) | 〔Nguồn gốc: 契約_詳細要件 要件(2026/10/02) REQ-CT-301〕 |
| 1-8 | Thúc giục xác nhận và quyền hạn | Với hợp đồng con mà quyết toán thực tế chưa xác nhận đến lúc xác nhận ngày 25, từ ngày 26 hiển thị・cảnh báo thúc giục chốt cho nhân viên CS. Chỉ nhân viên CS mới hiển thị・thao tác được màn hình quyết toán thực tế (kiểm soát bằng quyền của vận hành. Tên quyền theo 7 vai trò quyền của vận hành) | 〔Nguồn gốc: 契約_詳細要件 REQ-CT-281・282〕 |

**1-9 Ví dụ theo lead time phát hành hóa đơn** (quyết định 2026/09/29. Ngày 2026/10/01 S6-2 đổi ngày phát hành thành "ngày 1 của tháng thanh toán". 2026-10-03 chuyển từ 契約_07 §0.9)

Hóa đơn **chốt ngày 20 → xác nhận ngày 25 → phát hành bằng Bill One vào ngày 1 tháng sau (= ngày 1 của tháng thanh toán)** (vận hành nhấn "Phát hành bằng Bill One" để gửi hàng loạt・S6-1). Trên 1 hóa đơn có cả ① trả trước (chu kỳ sắp giao hàng) và ② quyết toán thực tế (chu kỳ vừa chốt). **Hạn nhập tiền chỉ có 1 cho mỗi hóa đơn**, được quyết định theo thiết lập của nơi nhận hóa đơn.

```
Tháng thanh toán   = tháng chu kỳ của hợp đồng・chu kỳ ① + lead time phát hành hóa đơn (−3〜+1)
Ngày phát hành     = ngày 1 của tháng thanh toán (xác nhận ngày 25 tháng trước)
Tháng chu kỳ của ② = tháng thanh toán − 1 (kỳ là ngày 21 tháng trước〜ngày 20 tháng này)
Hạn nhập tiền      = ngày 27 của tháng thanh toán hoặc ngày 27 của tháng sau tháng thanh toán ("hạn nhập tiền" của nơi nhận hóa đơn)
```

Ví dụ: khi tháng chu kỳ của ① là 2026-09

| Lead time | Kỳ của ① | Ngày phát hành (tháng thanh toán) | Hạn nhập tiền (ngày 27 của tháng thanh toán) | Hạn nhập tiền (ngày 27 tháng sau) |
|---|---|---|---|---|
| 3 tháng trước (−3) | 9/1〜9/30 | 6/1 (tháng 6) | 6/27 | 7/27 |
| 2 tháng trước (−2) | 9/1〜9/30 | 7/1 (tháng 7) | 7/27 | 8/27 |
| 1 tháng trước (−1・mặc định) | 9/1〜9/30 | 8/1 (tháng 8) | 8/27 | 9/27 |
| Tháng này (0) | 9/1〜9/30 | 9/1 (tháng 9) | 9/27 | 10/27 |
| Tháng sau (+1・trả sau) | 9/1〜9/30 | 10/1 (tháng 10) | 10/27 | 11/27 |

- **Ngày trừ tiền** của chuyển khoản tự động・thẻ tín dụng cũng dùng ngày này.
- Thanh toán một lần theo năm (chu kỳ thanh toán = trả theo năm) thanh toán 12 chu kỳ từ tháng chu kỳ của tháng khởi điểm trên 1 hóa đơn. Hợp đồng con không giữ "đơn vị trả trước" (2026/09/29).
- Kỳ "9/1〜9/30" của ① là ví dụ. Thực tế là 1 chu kỳ của tháng chu kỳ (A1〜D7. 契約_00 §0.3).

## 2. Quy tắc về số tiền

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 2-1 | Tính theo ngày | **Không làm**. Hợp đồng theo đơn vị chu kỳ. Phí hàng tháng (gói・thiết bị・tùy chọn) tính đủ cho mỗi tháng chu kỳ | P1 |
| 2-2 | Thay đổi・lắp đặt・thu hồi giữa tháng | **Quyết định theo hạn chót đặt hàng (mặc định là ngày 15 tháng trước)**. Đơn đăng ký trước hạn chót tính đủ từ tháng chu kỳ đó, sau hạn chót thì từ tháng chu kỳ tiếp theo. Thu hồi cũng như vậy (đơn đăng ký trước hạn chót thì đến hết tháng chu kỳ đó) | S1 |
| 2-3 | 2 dòng của phí gói | Cơ sở áp dụng phúc lợi thì phí gói chia thành 2 dòng **phí cơ bản (10%) + phúc lợi (phần doanh nghiệp chịu・8%)**. Phúc lợi = 100 yên × tổng giới hạn cung cấp hàng tháng ÷ 1.08 (làm tròn xuống). Cơ sở không áp dụng thì 1 dòng phí cơ bản (10%) | 28-148〜150・STEP3 H5 |
| 2-4 | Thuế tiêu dùng | ES tính. **Làm tròn tổng theo từng hóa đơn・từng thuế suất** (số âm làm tròn theo giá trị tuyệt đối). Cũng gửi tiền thuế cho Bill One, bắt buộc để số tiền trên màn hình và hóa đơn khớp nhau. Thuế theo từng cơ sở hiển thị là "tham khảo", tiền thuế của doanh nghiệp là chuẩn. **Thuế suất là bất kỳ mức nào của master thuế suất** (không giới hạn 8%・10%. Hóa đơn hiển thị các ô "đối tượng ○% (chưa thuế)" "thuế tiêu dùng (○%)" theo từng thuế suất. 2026-10-05) | v1.43・P9・S5 |
| 2-5 | Thay đổi của tháng đã trả trước | Nếu có nghỉ・hủy・hạ gói thì phần của tháng đã thanh toán sẽ **bù trừ ở hóa đơn tiếp theo** (dòng trừ để điều chỉnh). Phần không bù trừ hết thì hoàn tiền ngoài hệ thống | P2 |
| 2-6 | Thanh toán lần đầu | Khi việc phê duyệt đơn đăng ký không kịp xác nhận ngày 25, thì gộp 2 tháng vào hóa đơn (lần đầu) tiếp theo | P3 |
| 2-7 | Phí hàng tháng ES-QR | **Trả trước** (giống các phí hàng tháng khác). Phần không kịp trả trước (bắt đầu dùng sau khi xác nhận, v.v.) chuyển sang hóa đơn tiếp theo | P6 (sửa RD-BL-003) |
| 2-8 | Chiến dịch dùng thử | Giảm giá chiến dịch dùng thử DC000013 (phân loại tính toán = tham chiếu phí gói・mỗi doanh nghiệp 1 lần・tự động gắn vào hợp đồng con dùng thử) chỉ bù trừ số tiền cố định (phí gói). Quyết toán thực tế (hao hụt quản lý) vẫn thanh toán | STEP3 Q3・P8 |
| 2-9 | Số tiền của tùy chọn | Với tùy chọn có loại số tiền là "nhập mỗi lần" "từ mức tối thiểu", khi gắn vào hợp đồng con bắt buộc nhập số tiền | Bổ sung Q-D・Q-E |
| 2-10 | Phí thiết bị | Thiết bị cho mượn tiêu chuẩn của master gói là miễn phí (không tạo dòng). Máy bán hàng tự động chỉ giữ làm thiết bị cho mượn tiêu chuẩn của course ES Lite (máy bán hàng tự động), không làm tổ hợp "ES Standard + phí hàng tháng máy bán hàng tự động" (1 cơ sở 1 course) | 28-182・STEP3 Q5・Chuyển tiếp 3 |
| 2-11 | Chênh lệch kích cỡ | Chênh lệch kích cỡ chỉ thanh toán bằng OP000023 (hàng tháng・chỉ khi dương). OP000010 là "đổi tủ lạnh (do khách hàng)" (đơn lẻ・nhập mỗi lần) | Bổ sung Q-A |
| 2-12 | Cho thuê・chi phí ban đầu của máy bán hàng tự động | Cho thuê máy bán hàng tự động (hàng tháng・OP000037) và chi phí ban đầu của máy bán hàng tự động (spot) nhập số tiền theo từng hợp đồng. Giá trị ban đầu là giá trị của master dòng máy. Vì phí thuê khác nhau theo khách hàng. **Cho thuê = số tiền 1 máy × số máy** (máy bán hàng tự động đang cho mượn). Tự động gắn vào hợp đồng con ES Lite (máy bán hàng tự động). Phí gói không bao gồm phí thuê (triển khai 2026-10-05) | 〔Nguồn gốc: 契約_詳細要件 要件(2026/10/02) REQ-CT-303〕 |
| 2-13 | Mua lại món ăn chế biến sẵn | Hợp đồng mua lại món ăn chế biến sẵn (契約_05 hợp đồng #8) tự động tính từ kết quả giao hàng: ① số tiền cố định = phần nhân viên chịu 100 yên × số lượng, ② quyết toán thực tế = Σ (số lượng giao × (đơn giá − 100 yên)) | 〔Nguồn gốc: 契約_詳細要件 REQ-CT-306〕 |
| 2-14 | Âm・thanh toán thừa | Khi tổng quyết toán thực tế âm, hoặc thanh toán thừa do tăng giá, v.v. thì không hoàn tiền mà bù trừ ở thanh toán các tháng sau (dòng của ③ chi tiết điều chỉnh. 契約_06). Trên hóa đơn ghi cả dương・âm để thấy đã bù trừ (bằng chứng hoàn tiền về kế toán) | 〔Nguồn gốc: 契約_詳細要件 REQ-CT-279・280〕 (dòng "② điều chỉnh (chuyển tiếp)" của bản gốc được đọc thành ③ chi tiết điều chỉnh cho khớp 契約_01 §3) |

## 3. Nghỉ・tiếp tục・hủy

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 3-1 | Thanh toán khi đang nghỉ | Không thanh toán phí gói của tháng đang nghỉ. **Khi đang nghỉ không quyết toán thực tế.** Kiểm tồn kho vào lúc bắt đầu nghỉ để quyết toán phần cho đến đó. Chênh lệch phát sinh trong lúc nghỉ ở thiết bị để nguyên tại chỗ sẽ được phát hiện ở kiểm tồn kho khi tiếp tục (hoặc khi hủy) (Trước đây: quyết toán thực tế làm hàng tháng nếu cần nhưng không thanh toán, gộp thanh toán khi tiếp tục hoặc khi hủy. 2026-10-03 sửa cho khớp 契約_01 §5) | 契約_01 §5 (TL-2 bổ sung・Q1 = B. Ghi đè P5) |
| 3-2 | Giới hạn nghỉ | Tối đa 12 tháng cộng dồn. Tháng dự kiến tiếp tục là bắt buộc (không chọn được "chưa định") | Quyết định tối 2026/10/01 |
| 3-3 | Ngày hủy | Tiếp nhận được phán định theo hạn chót đặt hàng (đơn đăng ký trước hạn chót áp dụng từ tháng sau・sau hạn chót áp dụng từ tháng sau nữa). Ngày hủy là ngày cuối của chu kỳ. Không có hạn chót sớm hơn riêng cho máy bán hàng tự động | D4 = A・K-05・RD-CT-140 |
| 3-4 | Tiền phạt | Cộng dồn "số tiền thu hồi khi hủy" của từng thiết bị × số tháng còn lại ÷ thời gian sử dụng tối thiểu. Thời gian sử dụng tối thiểu là tủ lạnh 3 tháng・máy bán hàng tự động 12 tháng (tính từ ngày cho mượn của từng thiết bị. Khi đang nghỉ **chỉ không tính thiết bị để nguyên tại chỗ**. Khi đã rút thiết bị về thì không thu tiền phạt. **Khi lắp đặt lại thiết bị đã rút về, vận hành chọn 1 trong 2**: ① tính lại từ ngày lắp đặt lại (mặc định) / ② kế thừa phần còn lại trước khi nghỉ, thanh toán 1 lần phí lắp đặt lại (OP000015))〔hong trả lời 2026-10-03 (K4 xác nhận lại)・chờ khách hàng xác nhận〕. Nếu tại thời điểm nhập ngày mong muốn hủy mà có tiền phạt thì cảnh báo trước khi xác nhận (2026-10-03 chuyển từ 契約_07 §0.11) | 28-2・STEP2 Q8 |
| 3-5 | Thanh toán cuối | **Hóa đơn cuối cùng 1 hóa đơn vào tháng sau tháng hủy** (quyết toán thực tế cuối cùng + tiền phạt + mua lại tồn kho còn lại) | S4-1 |
| 3-6 | Tồn kho còn lại | Thanh toán dưới dạng mua lại bằng **tồn kho tính toán × đơn giá bán** (OP000031 phí mua lại món ăn chế biến sẵn) | S4-2 |
| 3-7 | Tài khoản | Để lại ở chế độ "chỉ xem" đến hạn nhập tiền của hóa đơn cuối cùng, ngày hôm sau thì dừng. Khi dừng thì gửi email (email Message List No.16). Thông báo trước theo nội dung hủy của email phê duyệt (No.10)<br>**Cũng gửi email nhắc nhở vào ngày trước khi dừng**〔hong trả lời 2026-10-03 (K15)〕〔Nguồn gốc: REQ-CT-145〕 | S4-3・決定_メールと通知の追加 |

## 4. Trả theo năm・phương thức thanh toán

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 4-1 | Tháng khởi điểm của trả theo năm | Tháng chu kỳ bắt đầu hợp đồng | S3-1 |
| 4-2 | Sửa phí giữa kỳ của trả theo năm | Giữ phí hiện tại đến tháng khởi điểm tiếp theo | S3-2 |
| 4-3 | Thanh toán trả theo năm | Thanh toán 12 chu kỳ từ tháng chu kỳ của tháng khởi điểm trên 1 hóa đơn. Hợp đồng con không giữ "đơn vị trả trước" | 1-9 (旧 項目一覧 §0.9. 2026/09/29) |
| 4-4 | Thẻ tín dụng | Vẫn để trong lựa chọn phương thức thanh toán. Thanh toán thực hiện ngoài hệ thống (ES chỉ giữ phân loại) | S7 = B |
| 4-5 | Thay đổi giữa chừng lead time phát hành hóa đơn | Không giới hạn. Cảnh báo ở màn hình vận hành để xác nhận các tháng trả trước bị trùng・thiếu (Message List WEB No.63) | S2・RD-BL-045 |
| 4-6 | Thiết lập thanh toán (đơn vị phát hành, v.v.) | Doanh nghiệp chỉ xem. Thay đổi do vận hành | E-9 = B (chú thích ở RD-BL-052) |
| 4-7 | Quyết toán thực tế của trả theo năm | Dù trả theo năm, quyết toán thực tế (②) vẫn thanh toán theo chốt hàng tháng. Chỉ số tiền cố định (①) mới trả theo năm | 〔Nguồn gốc: 契約_詳細要件 §8C-2・§8E-2 REQ-CT-223・248〕 (REQ-CT-223 vẫn là "chọn hàng tháng hay theo năm (tạm)") |

## 5. Liên kết với Bill One

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 5-1 | Thời điểm gửi | Sau xác nhận ngày 25, vận hành nhấn "Phát hành bằng Bill One" để gửi hàng loạt (ngày phát hành là ngày 1 tháng sau). Xác nhận ngày 25 có thể lọc các hợp đồng con có thay đổi・hợp đồng con có quyết toán thực tế hoặc giảm giá để kiểm tra trước, phần còn lại xác nhận hàng loạt〔Nguồn gốc: 契約_詳細要件 REQ-CT-222・286〕 | S6-1・S6-2 |
| 5-2 | ID nơi phát hành | Mỗi nơi nhận hóa đơn (doanh nghiệp / cơ sở) có 1. Nếu chưa đăng ký thì tự động tạo khi phát hành | S6-3・RD-BL-031 |
| 5-3 | Khi không gửi được | Hiển thị "lỗi gửi" ở màn hình vận hành, sửa rồi gửi lại (Message List WEB No.64 phát hành・No.65 gửi thất bại) | S6-4 |
| 5-4 | Sửa | Nguyên tắc là bù trừ ở hóa đơn tháng sau. Thay thế chỉ khi vận hành phán đoán: hủy ở Bill One (màn hình Bill One. Không có API) → ES chuyển ID cũ thành "hủy" và phát hành lại bằng ID khác (WEB No.73・74) | P4・S6-5・Bill One trả lời Q6・Q7 |
| 5-5 | Nhập tiền (đối chiếu) | Không nhập (clearings API của Bill One chỉ để tham khảo) | S6 bổ sung・K-07・RD-BL-024 |
| 5-6 | Gửi hóa đơn | ES không gửi. Hóa đơn (PDF) và thông báo gửi từ Bill One | RD-BL-020・025 |
| 5-7 | CSV phân tích doanh thu | Xuất CSV của danh sách thanh toán bao gồm các cột cho phân tích doanh thu (doanh thu・số doanh nghiệp hợp đồng・số cơ sở hợp đồng・số tháng liên tục・nhân viên kinh doanh phụ trách・loại hợp đồng・đơn giá). Các cột này không hiển thị trong danh sách trên màn hình (phân tích bằng Looker Studio, v.v.) | 〔Nguồn gốc: 契約_詳細要件 §8・REQ-CT-291〕 |
| 5-8 | Tìm kiếm danh sách hóa đơn | Thêm "phương thức thanh toán" vào điều kiện tìm kiếm của danh sách hóa đơn | 〔Nguồn gốc: 契約_詳細要件 §8D-3・REQ-CT-293〕 |

## 6. Phí đại lý

| # | Quy tắc | Nội dung | Căn cứ |
|---|---|---|---|
| 6-1 | Số tiền chuẩn | Chỉ số tiền cố định (trả trước) chưa thuế・sau giảm giá. **Thanh toán trong thời gian dùng thử không thuộc đối tượng** | S8 |

## 7. Những mục chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| 1 | Giá chính thức của gói 50 ES Lite (tủ lạnh) (tạm ¥24,500). Có dùng lần sửa đổi thứ tư của master gói (2026/10/01〜 ¥25,000) cho các hợp đồng mới từ tháng 10 trở đi hay không | Khách hàng xác nhận |
| 2 | Giá của gói máy bán hàng tự động 150・200・300 (giữ ¥74,000／¥96,000／¥139,000) | Khách hàng xác nhận (S9 = C) |
| 3 | Tên・số tiền của các tùy chọn đã thêm (OP000024〜035) | Bảng danh sách của khách hàng là【đề xuất tạm】nên cần xác nhận |
| 4 | Phí tủ đông (bảng yêu cầu dòng 174・OP000032・033) | DIPRO xác nhận |

## 8. Cách xử lý trong demo (thời điểm v1.48 ngày 2026/10/01)

| Quy tắc | Demo |
|---|---|
| 1-1 ngày phát hành・1-5 hạn nhập tiền・2-3・2-4・2-10・2-11 | Đã có (demo thanh toán của vận hành, doanh nghiệp・cơ sở・hợp đồng・quản lý đơn đăng ký, quản lý cơ sở của Web doanh nghiệp) |
| 1-6 5 giai đoạn của trạng thái thanh toán | Đã có ở danh sách hợp đồng con・quản lý đơn đăng ký. Màn hình xác nhận thanh toán chưa hỗ trợ |
| 3-1・3-5〜3-7・2-2 | Hiển thị như quy tắc ở "phạm vi bị ảnh hưởng bởi đơn đăng ký này" của chi tiết đơn đăng ký (không có hoạt động tính toán) |
| 4-5 cảnh báo lead time・5-3 lỗi gửi và gửi lại・5-4 hủy và phát hành lại | **Đã có (v1.48)**: demo thanh toán của vận hành. Lỗi gửi là ví dụ lần 1 của Osaka Kitchen (C3) bị timeout. Cảnh báo lead time nằm ở điều kiện thanh toán của doanh nghiệp |
| 3-7 tài khoản (chỉ xem・dừng)・email | **Đã có (v1.48)**: chuyển đổi demo của Web doanh nghiệp "sau khi hủy (chỉ xem)" "sau khi dừng (đăng nhập)", mẫu email ở chi tiết đơn đăng ký của vận hành (phê duyệt No.10・dừng tài khoản No.16・dừng giao hàng No.14) |
| 6-1 phí đại lý・1-6 5 giai đoạn của màn hình xác nhận thanh toán | Không có màn hình |
