> **Đóng băng (bản gốc・2026-10-05). Từ nay không cập nhật.** Chuẩn của hàng thay thế là `Hàng_thay_thế.md`. Tất cả câu hỏi này đã được trả lời (sổ cái J). Các quyết định đang có hiệu lực hiện nay nằm ở `docs/決定台帳.md`.

# Danh sách câu hỏi: Cài đặt hàng thay thế và ảnh hưởng tới hạ nguồn (đặt hàng・xuất hàng・giao hàng・tồn kho・thanh toán・thông báo) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Người soạn: Claude (Cowork). Các câu hỏi cần xác nhận ở STEP7 (xuyên suốt).
> Tổng hợp theo ý của anh Long: "Cài đặt hàng thay thế chắc chắn sẽ ảnh hưởng tới các luồng phía dưới, giao hàng, v.v."
> Tài liệu tiền đề: `議事録/仕様/代替品対応_詳細要件仕様.md` (REQ-ALT), Đặc tả tích hợp v2.3 (§8・§13-6・§14-2・quyết định #39), demo vận hành (Quản lý menu › Cài đặt hàng thay thế・v1.28), demo giao hàng (Xử lý sự cố・Chi tiết dữ liệu giao hàng).
> **Đã trả lời (§0). Đã phản ánh vào demo v1.64 và đặc tả.**
> Tài liệu giống nhau trên Mac: `01_仕様/50_Đơn_hàng/Danh_sách_câu_hỏi_Cài_đặt_hàng_thay_thế_và_ảnh_hưởng_hạ_nguồn_20261001.md`

## 0. Trả lời (2026/10/01 anh Long)

"Hãy làm **chỉ 3 mẫu** (① Thay thế / ② Bồi thường / ③ Chỉ loại bỏ). Hãy **áp dụng theo đề xuất**" → Q-ALT1〜10 đều theo đề xuất (Q-ALT4 chỉ loại bỏ tạm đặt là "không thanh toán"・xác nhận với khách hàng). Quyết định: `Quyết_định_Cài_đặt_hàng_thay_thế_3_mẫu_và_hạ_nguồn_20261001.md`. Đã phản ánh vào demo v1.64.

## 1. Trạng thái hiện tại (cái gì được sửa, cái gì không được sửa)

Khi lưu cài đặt hàng thay thế, demo hiện tại **chỉ sửa đơn hàng (số lượng trong quản lý đơn hàng sản phẩm) và lịch sử thay đổi của đơn hàng**. Các luồng phía sau đều không chạy.

| Luồng | Được tạo khi nào (đặc tả tích hợp) | Khi lưu cài đặt hàng thay thế (demo hiện tại) | Những điều lẽ ra phải bị ảnh hưởng |
|---|---|---|---|
| ① Đơn hàng | Doanh nghiệp tới hạn chót, sau hạn chót là vận hành | **Được sửa** (dòng và lịch sử của thay thế・loại bỏ・bồi thường) | — |
| ② Đặt hàng (tạm・chính thức) | Đặt hàng tạm = trước hạn chót, đặt hàng chính thức = sau hạn chót | Không được sửa (màn hình xác nhận có ghi "phản ánh vào dữ liệu đặt hàng") | Thiếu sản phẩm thay thế / đặt dư sản phẩm lỗi. Cũng chưa có "số lượng hàng thay thế" trên màn hình đặt hàng (REQ-PO-220・STEP6 G11) |
| ③ Dữ liệu giao hàng (chi tiết) | Tạo xác nhận vào ngày bắt đầu đơn (published) | Không được sửa | Sản phẩm・số lượng của chi tiết, nguồn thay thế (`substituted_from_product_id`) không được nhập → không hiện trong đơn giá thanh toán・phiếu giao hàng・danh sách giao hàng của tài xế |
| ④ Chỉ thị xuất hàng・Picking | CSV theo kho, 2 tuần trước ngày bắt đầu 3 ngày. Lần gửi đầu locked. Không có I/F hủy・gửi lại kèm số phiên bản | Không được sửa | Nếu đã gửi, kho sẽ làm việc theo số lượng cũ |
| ⑤ Giao hàng・Nhập giao (ủy thác・tài xế・chuyến COOL) | Ngày xuất hàng〜ngày giao hàng | Không được sửa | Chỉ thị hàng thay thế・thu hồi／hủy bỏ không được truyền tới hiện trường |
| ⑥ Tồn kho cơ sở (tồn kho lý thuyết・kiểm kê tồn kho) | Biến động theo giao hàng・bán hàng・hủy bỏ | Không được sửa | Nếu hàng lỗi còn lại ở cơ sở, chênh lệch kiểm kê tồn kho sẽ thành thất thoát quản lý (thanh toán) |
| ⑦ Tồn kho kho (lô lỗi) | Tồn kho của THOMAS | Không được sửa | Chưa quyết định việc dừng xuất・trả hàng・hủy bỏ lô lỗi |
| ⑧ Thanh toán | Trả trước (cố định) + quyết toán theo thực tế | Không được sửa (chỉ có văn bản "đơn giá của sản phẩm gốc", "bồi thường không thanh toán【cần xác nhận】") | Cách xử lý thanh toán cho thay thế・bồi thường・loại bỏ |
| ⑨ Thông báo cho khách hàng | — | Khi lưu chỉ có thể chọn "thông báo". Trong danh sách email không có email về hàng thay thế | Không hiện trên Web doanh nghiệp (thông báo・chi tiết giao hàng・phiếu giao hàng・đơn hàng hàng tháng) |
| ⑩ Hàng thay thế của sự cố giao hàng | "Giao đủ toàn bộ bằng hàng thay thế" trong Xử lý sự cố | Ghi lại ở nguồn thay thế của dữ liệu giao hàng (cơ chế khác) | Chưa liên kết với cài đặt hàng thay thế |

## 2. Câu hỏi (lựa chọn・đề xuất)

Hãy trả lời bằng ký hiệu. Đề xuất được in **đậm**.

### Q-ALT1　Cài đặt hàng thay thế sửa tới đâu (liên kết ①→③)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **A Sửa đồng thời đơn hàng và chi tiết dữ liệu giao hàng** (nhập nguồn thay thế vào chi tiết. Cùng ghi nhận với hàng thay thế của sự cố giao hàng) | Thanh toán・phiếu giao hàng・tài xế・tồn kho chạy theo 1 bản ghi. 2 cơ chế hàng thay thế hợp nhất thành 1 | Cần xử lý ghi đè dữ liệu giao hàng đã tạo xác nhận |
| B Chỉ sửa đơn hàng, vận hành sửa dữ liệu giao hàng thủ công | Cách làm nhỏ | Dễ quên sửa. Nhiều cơ sở thì không xoay xở kịp |
| C Chỉ đơn hàng. Dữ liệu giao hàng áp dụng từ lần tạo xác nhận sau | Đơn giản | Không có hiệu lực với tháng đã tạo xác nhận (tháng này・tháng sau) |

### Q-ALT2　Thay thế sau khi đã gửi chỉ thị xuất hàng (locked・trước khi xuất hàng) (④)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **A Đến trước ngày xuất hàng 1 ngày: gửi lại chỉ thị xuất hàng kèm số phiên bản (rev+1). Từ ngày xuất hàng trở đi: không thay thế mà xử lý như "đã giao (bồi thường)"** | Cùng ranh giới với việc đổi ngày sau hạn chót (đến trước ngày xuất hàng 1 ngày) nên dễ hiểu. Dùng được cơ chế gửi lại hiện có | Nếu kho đã bắt đầu picking thì phải làm lại |
| B Đã gửi chỉ thị xuất hàng thì không thay thế (tất cả là bồi thường) | Kho không phải làm lại | Hàng lỗi tới tay khách hàng |
| C Vận hành gọi điện cho kho để sửa, hệ thống chỉ ghi lại | Hành động ngay được | Thực tích của kho và bản ghi bị lệch |

### Q-ALT3　Cách giao hàng bồi thường (phần đã giao) (③④⑤)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| A Luôn thêm dòng vào dữ liệu giao hàng của chuyến tiếp theo (nếu chuyến đó đã locked thì gửi lại) | Không tốn thêm phí giao hàng | Nếu chuyến tiếp theo xa (mỗi tháng 1 lần・trước khi tạm dừng, v.v.) thì chậm |
| B Luôn giao thêm riêng lẻ (nhân bản) bằng chuyến riêng | Nhanh | Tốn phí giao hàng (ES chịu?) |
| **C Mặc định là A. Khi không có chuyến tiếp theo・chuyến quá xa thì vận hành chọn B** | Đáp ứng cả hai | Thêm 1 quyết định cho vận hành |

### Q-ALT4　Thanh toán (⑧)
| Đối tượng | Lựa chọn | Đề xuất |
|---|---|---|
| Thay thế (chưa giao) | A Đơn giá của sản phẩm gốc (giữ nguyên quyết định #39)／B Đơn giá của sản phẩm thay thế | **A** |
| Bồi thường (đã giao) | A Không thanh toán (ES chịu)／B Thanh toán theo đơn giá sản phẩm thay thế／C Không thanh toán, nhưng ghi lại trong quyết toán theo thực tế của hóa đơn bằng dòng 0 yên | **C** (khách hàng nhìn thấy, số tiền là 0) |
| Chỉ loại bỏ (không có hàng thay thế) | A Không thanh toán／B Trừ vào phí gói (hoàn tiền)／C Thêm số lượng ở chuyến tiếp theo | **Cần xác nhận** (do gói tính theo tháng nên cần xác nhận với khách hàng cách xử lý khi thiếu 1 sản phẩm) |
| Phí giao hàng của giao thêm (B của Q-ALT3) | A ES chịu／B Thanh toán (OP000034) | **A** (hàng lỗi là trách nhiệm của ES) |

### Q-ALT5　Hàng lỗi còn lại ở cơ sở (⑥)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **A Ghi nhận là hủy bỏ và trừ khỏi tồn kho lý thuyết (không tính là thất thoát quản lý). Chuyến giao hàng ES: tài xế thu hồi・hủy ở chuyến tiếp theo, chuyến COOL: doanh nghiệp tự hủy và khai báo khi kiểm kê tồn kho** | Không rơi vào thất thoát quản lý (thanh toán). Khớp với số của "bồi thường theo tồn kho lý thuyết còn lại" | Ứng dụng tài xế và kiểm kê tồn kho cần ô "thu hồi／hủy bỏ hàng thay thế" |
| B Thu hồi ở chuyến tiếp theo và trả về kho | Có thể kiểm tra hàng thực | Cần sắp xếp thu hồi・lưu kho |
| C Không làm gì (nhờ cơ sở tự xử lý) | Đơn giản | Tồn kho lý thuyết bị lệch, bị thanh toán như thất thoát quản lý |

### Q-ALT6　Phản ánh vào đặt hàng (②)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **A Tự động cộng số lượng cần của sản phẩm thay thế và giảm số lượng cần của sản phẩm lỗi. Nếu đã đặt hàng chính thức thì tạo dữ liệu đặt hàng bổ sung (phần hàng thay thế). Hiển thị "số lượng hàng thay thế" trên màn hình đặt hàng (REQ-PO-220)** | Không xảy ra lệch số lượng | Cần quy tắc tạo lại đặt hàng |
| B Chỉ hiển thị "số lượng hàng thay thế" trên màn hình đặt hàng. Vận hành tự sửa | Cách làm nhỏ | Dễ sót |
| C Giả định hàng thay thế xuất từ tồn kho của kho, không đụng tới đặt hàng | Đơn giản | Nếu tồn kho thiếu thì không xuất hàng được |

### Q-ALT7　Lô lỗi ở kho (⑦)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| A Dừng xuất và trả hàng về nhà cung cấp (ghi "lỗi・trả hàng" vào đặt hàng) | Có thể yêu cầu thanh toán nhà cung cấp | Site nhà cung cấp (STEP6) cần luồng trả hàng |
| B Hủy bỏ tại kho (trừ khỏi tồn kho) | Đơn giản | Chưa quyết định ai chịu chi phí |
| **C Chọn "trả hàng／hủy bỏ" trong cài đặt hàng thay thế, cả hai đều dừng xuất** | Có thể quyết định theo từng trường hợp | Thêm 1 hạng mục |

### Q-ALT8　Thông báo cho khách hàng (⑨)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **A Mặc định là "thông báo" (vận hành có thể bỏ). Email + thông báo trên Web doanh nghiệp. Hiển thị "Hàng thay thế (gốc: 〇〇)" ở chi tiết giao hàng・phiếu giao hàng・đơn hàng hàng tháng** | Biết được hàng nào sẽ tới. Đáp ứng REQ-ALT-102 (liên lạc "không nằm trong phần giao hàng") | Thêm 1 email vào danh sách email (tiêu đề・nội dung) |
| B Chỉ thông báo (không email) | Đơn giản | Khó được chú ý |
| C Vận hành chọn khi lưu (demo hiện tại・mặc định không gửi) | Linh hoạt | Quên gửi |

### Q-ALT9　Thông báo cho giao hàng ủy thác・tài xế (⑤)
| Lựa chọn | Ưu điểm | Nhược điểm |
|---|---|---|
| **A Hiển thị "Hàng thay thế (gốc: 〇〇)" và chỉ thị thu hồi／hủy bỏ (Q-ALT5) trên danh sách giao hàng (ứng dụng tài xế・portal nơi nhận giao hàng ủy thác)** | Hiện trường không bị bối rối. Khớp với chênh lệch kiểm hàng | Thêm hiển thị ở cả hai ứng dụng |
| B Không hiển thị (theo hàng của kho) | Cách làm nhỏ | Kiểm hàng sẽ có báo cáo "sản phẩm khác" |

### Q-ALT10　Giới hạn cách chọn sản phẩm thay thế (①)
| Luận điểm | Lựa chọn | Đề xuất |
|---|---|---|
| Nhóm nhiệt độ (đông lạnh ⇄ lạnh・nhiệt độ thường) | A Chỉ chọn được cùng nhóm nhiệt độ／B Khác cũng được (vào chuyến có nhóm nhiệt độ của hàng thay thế. Nếu không có chuyến thì giao thêm) | **A** (ngoại lệ vận hành xử lý bằng giao thêm) |
| Cơ sở máy bán hàng tự động | A Chỉ chọn được sản phẩm bỏ vừa vào máy bán hàng tự động／B Chọn được nhưng chỉ cảnh báo | **B** (cách xử lý sản phẩm không bỏ vừa máy bán hàng tự động tùy doanh nghiệp・quyết định STEP5) |
| Course (sản phẩm của Standard cho cơ sở Light) | A Chỉ sản phẩm có thể xuất theo course của cơ sở／B Không giới hạn | **A** |

## 3. Việc cần xác nhận với khách hàng (anh Aoyama) (vẫn OPEN)

| No | Nội dung |
|---|---|
| OPEN-1 | Nội dung của "3 mẫu" cách gửi hàng thay thế |
| OPEN-2 | Có thay đổi cách xử lý theo hình thức nhập kho (2 lần/tháng／hằng ngày) hay không |
| OPEN-3 | Ai chọn 2 phương thức bồi thường (theo số lượng đơn hàng／theo tồn kho lý thuyết còn lại), và dựa trên tiêu chí nào |
| OPEN-4 | Quy tắc chỉ định chuyến giao (cùng tháng・tháng sau・khi trải qua nhiều chuyến) |
| OPEN-5 | Đưa địa chỉ email vào việc trích xuất khách hàng đối tượng (có được giải quyết bằng A của Q-ALT8 không) |
| Bổ sung | Thanh toán khi chỉ loại bỏ (không có hàng thay thế) (Q-ALT4) |

## 4. Những mục sẽ sửa sau khi có câu trả lời (dự kiến)

Vận hành: cài đặt hàng thay thế (xử lý lưu・màn hình xác nhận), chi tiết đơn hàng sản phẩm, chi tiết dữ liệu giao hàng (chi tiết・nguồn thay thế), chỉ thị xuất hàng・nhập (gửi lại), đặt hàng (số lượng hàng thay thế・đặt hàng bổ sung), thanh toán (dòng 0 yên của quyết toán theo thực tế), kiểm kê tồn kho. Web doanh nghiệp: thông báo・chi tiết giao hàng・phiếu giao hàng・đơn hàng hàng tháng. Portal nơi nhận giao hàng ủy thác・ứng dụng tài xế: danh sách giao hàng. Đặc tả: Đặc tả tích hợp §13-6・§14-2, Đặc tả yêu cầu chi tiết về xử lý hàng thay thế, yêu cầu của đặt hàng, danh sách email.

## 5. Các luận điểm còn lại (tối 2026/10/01): Xác nhận 1・2 đã quyết định, OPEN-2〜4 là đề xuất

- Xác nhận 1: 3 mẫu (① Thay thế／② Bồi thường／③ Chỉ loại bỏ) **do ES quyết định** (không xác nhận với khách hàng)
- Xác nhận 2: ③ Chỉ loại bỏ **không thanh toán** (đã phản ánh vào demo v1.67・đặc tả)

### OPEN-2　Có thay đổi cách xử lý theo hình thức nhập kho (nhập 2 lần/tháng／nhập hằng ngày [hàng tươi]) hay không
| Lựa chọn | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A Không thay đổi + xác nhận tồn kho trước khi lưu (đề xuất)** | Màn hình・3 mẫu giống nhau. Khác biệt được chỉ định bằng "kỳ đối tượng" và "lô". Trước khi lưu, hiển thị tồn kho kho và lịch nhập hàng của sản phẩm thay thế có đủ hay không, chuyến nào thiếu thì chuyển sang "chuyến sau lần nhập tiếp theo" (hoặc đặt hàng bổ sung) | Vận hành chỉ cần nhớ 1 điều. Hàng tươi có lô theo từng ngày nên lọc "theo lô" được ngay | Thêm việc xác nhận tồn kho (dự báo đặt hàng・tồn kho kho đã có sẵn) |
| B Thay đổi giá trị ban đầu theo hình thức nhập kho | Nhập hằng ngày = theo lô・thay thế, nhập 2 lần/tháng = toàn bộ lô・chỉ loại bỏ làm giá trị ban đầu (có thể thay đổi) | Chọn ngay được dạng thường gặp | Chưa có căn cứ cho giá trị ban đầu (anh Aoyama cũng nói "có lẽ không khác nhiều") |
| C Hàng tươi không dùng cài đặt hàng thay thế | Hàng tươi sửa riêng lẻ bằng đặt hàng hằng ngày | Không cần làm màn hình | Việc trích xuất cơ sở đối tượng・thông báo・thanh toán thành thủ công (không khớp REQ-ALT-602) |

### OPEN-3　Bồi thường là 2 lựa chọn "toàn bộ số đã đặt" và "chỉ phần còn lại" phải không
- **Vâng, là 2 lựa chọn** (REQ-ALT-201・202. Trong cuộc họp đã nói rõ "2 mẫu"). Chưa quyết định là "chọn cái nào, ai chọn, dựa vào cái gì".
- "Chỉ phần còn lại" tính số bằng tồn kho lý thuyết của cơ sở (kiểm kê lần trước + giao hàng − bán hàng − hủy bỏ), nên trước khi kiểm kê tồn kho (giữa tháng) số có thể bị lệch.

| Lựa chọn | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A Vận hành chọn theo từng hàng lỗi. Giá trị ban đầu là "toàn bộ số đã đặt" (đề xuất)** | Chọn ở màn hình cài đặt hàng thay thế (demo hiện tại). Nếu phân vân thì toàn bộ | Khách hàng ít bất mãn. Số không bị lệch | Gánh nặng của ES có thể tăng |
| B Quyết định theo loại lỗi | Liên quan sức khỏe (hư hỏng・dị vật)・toàn bộ lô = toàn bộ, chất lượng như vị・hình thức = chỉ phần còn lại | Phán đoán đồng nhất | Cần quyết định ranh giới phân loại |
| C Luôn "toàn bộ số đã đặt" | Không chọn | Đơn giản nhất | Không dùng "chỉ phần còn lại" (yêu cầu 202) |

### OPEN-4　Cách quyết định chuyến giao hàng bồi thường・thay thế
| Lựa chọn | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| **A Chuyến tiếp theo (giá trị ban đầu) + có thể thay đổi theo từng cơ sở (đề xuất)** | Giá trị ban đầu là chuyến đầu tiên của cơ sở đó sau ngày phát hiện lỗi. Nếu không có chuyến tiếp theo・xa hơn 14 ngày thì giao thêm (ES chịu). Ở danh sách đơn hàng đối tượng, có thể đổi theo từng cơ sở sang "chuyến khác" hoặc "giao thêm" | Giao nhanh. Trường hợp "đưa lỗi của chuyến 1 vào chuyến 2" của gói 150 cũng đáp ứng được | Thêm thao tác sửa theo từng cơ sở ở danh sách |
| B Đưa vào các chuyến còn lại của cùng chu kỳ | Nếu cùng chu kỳ còn chuyến thì vào đó, nếu không thì chuyến đầu của chu kỳ sau | Không vượt qua tháng (đơn vị thanh toán) | Cơ sở 1 lần/tháng sẽ sang tháng sau |
| C Vận hành quyết định ngày thống nhất | "Chuyến đầu tiên sau ngày 〇" giống nhau cho mọi cơ sở (hiện là "chỉ định ngày") | Dùng được khi chờ hàng thay thế nhập kho | Khó phù hợp với hoàn cảnh từng cơ sở |
| D Chỉ giao thêm | Không chờ chuyến, giao thêm toàn bộ | Nhanh nhất | Tốn phí giao hàng (ES chịu) |

※ Demo hiện tại chọn được giá trị ban đầu của A và C・D (chưa có thay đổi theo từng cơ sở).

### Trả lời (OPEN-2〜4・tối 2026/10/01)
OPEN-2 = **A**, OPEN-3 = **A**, OPEN-4 = **A** (tất cả theo đề xuất). Đã phản ánh vào demo v1.68・đặc tả REQ-ALT-711〜713.
