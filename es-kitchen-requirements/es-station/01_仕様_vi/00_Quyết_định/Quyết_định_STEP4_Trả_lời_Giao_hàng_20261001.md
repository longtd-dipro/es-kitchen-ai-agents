> **Đã đóng băng (bản gốc, 2026-10-05). Từ nay không cập nhật nữa.** Các quyết định đang có hiệu lực hiện nằm ở `docs/決定台帳.md`. Nơi chuyển nội dung của file này và các quyết định đã bị thay thế xem mục "G" của sổ quyết định.

# Quyết định: Trả lời STEP4 (Giao hàng / Tồn kho kho) (2026/10/01)

> Người yêu cầu: Long (Tran Duc Long) / Ghi chép: Claude (Cowork). Nội dung xác nhận xem `デモ全体確認_STEP4_配送_20261001.md`.
> **Chưa phản ánh vào demo** (chỉ thị của anh Long). Mục 3 là đề xuất của Claude, đang chờ anh Long trả lời.

## 1. Quyết định (anh Long trả lời 2026/10/01)

| No | Vấn đề | Quyết định |
|---|---|---|
| Q1 | Lịch Chu kỳ chuẩn | **A: Thống nhất theo lịch của Quản lý giao hàng (Chu kỳ tháng 10 = 10/12〜11/08, bao gồm cả ngày tạm dừng).** Sửa Quản lý đơn đăng ký và Doanh nghiệp/Cơ sở/Hợp đồng. Lập bảng lịch chuẩn 2026-02〜2027-03 |
| Q2 | Ngày và ID của giao hàng phía Vận hành | **B: Đặt lại nhưng giữ nguyên thứ trong tuần và khung Chu kỳ.** Ngày trong Số giao hàng = ngày xuất hàng. Sửa cả phần +6 ngày của Web doanh nghiệp và ID của cổng ủy thác |
| Q3 | Cơ sở mẫu kiểm tra tồn kho khi trụ sở chính chuyển thành chuyến ES giao hàng | **B: Trụ sở chính thành chuyến ES giao hàng, và thêm 1 cơ sở mẫu cho chuyến COOL** |
| Q4 | Tuyến của chi nhánh Osaka | **Kho Kansai → Ủy thác (đến lấy hàng) → Osaka** |
| Q5 | Các điểm nhỏ | Đổi ID khách hàng của Yume no Tobira sang số khác / thống nhất ID điểm trung chuyển thành HU + 5 chữ số, nhà cung cấp dùng tiền tố khác |
| S9 | Mô tả cũ trong đặc tả tích hợp | **Sửa.** Hạn sử dụng, tồn kho lý thuyết khi kiểm kê, giá trị mặc định của khung giờ giao hàng (buổi sáng), giới hạn ảnh được sửa vào 2026/10/01 (tích hợp 0-2M) |
| W1 | Nhập bản ghi tồn kho | **A: Màn hình danh sách + modal "Thêm bản ghi"** |
| W2 | Nút góc trên bên phải của tồn kho kho | **Giữ lại các nút "Ghi tồn kho" và "Trả tồn kho", nhưng bỏ khỏi menu bên** |
| W3 | Kho Chubu | **Không tồn tại thực tế, nhưng trong demo vẫn giữ tạm** (ghi rõ là đặt tạm) |
| W4 | Ngày xuất hàng của tồn kho kho | **Tính theo lead time của từng kho** (Kansai 2 ngày) |
| W5 | Thuật ngữ | **Thống nhất "Hạn sử dụng ngắn"** (bỏ "Hạn ngắn") |
| — | Tài liệu | Được phép lưu tài liệu STEP4 và quyết định này vào project và Mac |

## 2. Thuật ngữ và tiền đề

- Số giao hàng: ngày trong DL-yymmdd-nnnn là ngày xuất hàng (ví dụ trong đặc tả DL-261020-0021 = xuất hàng 10/20)
- Hôm nay: 2026/10/05 (toàn bộ demo)

## 3. Đề xuất của Claude (đang chờ trả lời)

### P7 Đơn vị trực thuộc của Sasaki Daichi (DR00022) → **Đề xuất: nội bộ (chuyến ES giao hàng)**
- Nguồn gốc: Master nhân viên giao hàng phía Vận hành ghi "Chuyến ES giao hàng (nội bộ)", chỉ 2 dòng trong danh sách giao hàng (DL-260929-0008-1 chuyến thay thế, DL-260930-0002 Toko Denki) là "Eisei Logi". Cổng ủy thác (màn hình của Eisei Logi) cũng không có
- Nếu chọn nội bộ thì chỉ cần sửa 2 dòng trong danh sách giao hàng. Nếu chọn Eisei Logi thì phải bổ sung vào 3 chỗ: master nhân viên, cổng ủy thác, danh sách tài khoản

### P10 Điểm khác nhau giữa biên bản họp và đặc tả (7 mục)

| Vấn đề | Biên bản họp | Đặc tả | Đề xuất | Lý do |
|---|---|---|---|---|
| Lead time | Đặt theo từng chặng (RD-DL-105 9/29・REQ-DL-714), mặc định 1 ngày (RD-DL-126) | Một giá trị tổng là chuẩn, giá trị từng chặng chỉ tham khảo, không có mặc định (v2.1 #6) | **Lấy đặc tả làm chuẩn, ghi rõ giá trị từng chặng là "giá trị tham khảo có thể nhập"** | Việc nhập từng chặng đã có sẵn (dùng để tính ngày hàng đến chi nhánh Yamato) nên yêu cầu trong biên bản đã được đáp ứng. Tính ngày picking bằng một giá trị duy nhất sẽ ít sai hơn. Không có mặc định (tránh quên nhập) là quyết định ngày 9/21, mới hơn biên bản |
| Di chuyển ngày trước hạn chót | Chu kỳ khác thì cảnh báo, nửa đầu/nửa sau・tháng khác・quá khứ thì lỗi, không giới hạn số lượng (RD-DL-040 **9/30**) | Chu kỳ khác thì không cho lưu | **Lấy biên bản (9/30) làm chuẩn** | Mới hơn đặc tả, là nội dung khách hàng đã quyết trong cuộc họp. Ghi chú rằng dù di chuyển thì giao hàng vẫn thuộc Chu kỳ gốc (hợp đồng con) |
| Nơi picking vật tư | Thực hiện tại văn phòng ES và không chỉ thị cho THOMAS (RD-DL-207 8/04) | Yamato giao thẳng từ kho, chỉ thị xuất hàng hằng ngày (v2.3 #36・9/29) | **Xác nhận với khách hàng** (đặc tả mới hơn, nhưng là quyết định nội bộ làm thay đổi kết luận của cuộc họp với khách hàng) | Quyết cùng với "kho chuyên dụng cho vật tư" bên dưới |
| Giới hạn số lần giao hàng | 2 lần/tuần・8 lần/tháng (RD-DL-079 7/14) | Tối đa 4 lần/1 Chu kỳ | **Lấy biên bản làm chuẩn (tối đa 8 lần/1 Chu kỳ)** | Là yêu cầu của khách hàng. 4 lần có vẻ xuất phát từ "1 lần/tuần × 4 tuần". Số lần chuẩn trong master gói giữ nguyên |
| Chuyển ngày tại ranh giới Chu kỳ | A1・C1 nếu bị đẩy lên sớm thì dời muộn, D7 nếu bị dời muộn thì đẩy lên sớm (RD-DL-024 8/18) | Không có quy tắc (REQ-DL-603: nếu không đẩy sớm được thì chuyển sang dời muộn) | **Lấy biên bản làm chuẩn và bổ sung vào đặc tả** | Nếu vượt qua ranh giới thì nửa đầu/nửa sau và Chu kỳ sẽ đổi, mâu thuẫn với "nửa đầu/nửa sau là lỗi" ở trên. Gộp cả hai thì hợp lý với "tự động đảo chiều để không vượt ranh giới" |
| Gợi ý đơn vị ủy thác | Hủy (RD-DL-166 7/8) | REQ-DL-132 tạm thời vẫn còn | **Hủy REQ-DL-132** | Dòng 28 của bảng yêu cầu (9/30) cũng ghi "không làm tìm kiếm theo tổ hợp・đề xuất tự động, mà xác nhận bằng tìm kiếm địa chỉ và master điểm giao ủy thác" |
| Thao tác sau khi báo sự cố | Khi có sự cố tài xế vẫn cập nhật được, khi Vận hành quyết định cách xử lý thì không cập nhật được (RD-DR-012) | Vì bỏ trạng thái "Sự cố" nên không có định nghĩa (v2.3 #20) | **Định nghĩa theo ý của biên bản**: sau khi báo, tài xế vẫn có thể nhập bước và hoàn tất. Khi Vận hành đăng ký giải quyết (resolution), tài xế không thể sửa kết quả của lần giao đó (ưu tiên hơn thời hạn sửa 7 ngày) | Giữ được ý đồ của biên bản mà không phải thêm trạng thái |

### P11 Email khi đổi ngày xuất hàng / giao hàng (dòng 127・134 của bảng yêu cầu)
- **Vì sao đang là "không gửi"**: Không phải quyết định của khách hàng. Ngày 2026/05/22 đã quyết "thông báo hoàn tất gửi hàng sẽ xem xét riêng, Phase 2 không dùng", và ngày 9/30 phía DIPRO (hong) trả lời "đúng như đặc tả hiện tại". Bối cảnh: Yamato không tạo được URL theo dõi có kèm số vận đơn (trả lời 9/15, đang xác nhận lại, dòng 38), việc nhập kết quả xuất hàng là hàng loạt nên sẽ thành lượng lớn email cùng lúc, và Web doanh nghiệp xem được trạng thái・số vận đơn
- Tuy nhiên **khách hàng đã viết là muốn được gửi, và phần trả lời của DIPRO trong bảng vẫn là "OK"**
- **Đề xuất**:
  - Dòng 127: **Gửi đúng 1 email khi hoàn tất gửi hàng (nhập kết quả xuất hàng)** (người phụ trách chính・phụ. Gồm số vận đơn và trang liên hệ của từng công ty. Nếu tạo được URL có kèm số thì dùng URL đó). Không gửi email "đang chuẩn bị gửi hàng" (chỉ hiển thị trên Web doanh nghiệp)
  - Dòng 134: **Sau hạn chót, khi Vận hành đổi ngày giao・ngày gửi thì cũng gửi email** (với ngày mới nhất. Vấn đề khách hàng gặp là "nhận email có ngày cũ"). Thay đổi trước hạn chót thì email xác nhận đã ghi ngày mới nhất nên không cần email bổ sung
- Nếu tiếp tục chính sách không gửi thì cần giải thích lý do trên cho khách hàng và sửa bảng

### W6 Giá trị ban đầu của số lượng trả trong "Trả tồn kho" → **Chỉ sản phẩm không dùng ở menu tiếp theo mới là "toàn bộ phần dư・check ON", sản phẩm có dùng là "0・check OFF"**
- Mục đích của Trả tồn kho (quyết định 2026/09/30) là "trả về phía công ty các sản phẩm không dùng trong tháng sau". Nếu giá trị ban đầu trả hết cả sản phẩm sẽ dùng thì lần xuất hàng sau sẽ thiếu
- Sản phẩm sẽ dùng nếu chọn thủ công vẫn trả được (số lượng tối đa bằng phần dư)
- Dữ liệu demo toàn bộ sản phẩm đều "dùng ở menu 2026-11" nên cần tạo vài sản phẩm không dùng

### W7 Nơi trả hàng về trụ sở ES
- Đặc tả (REQ-DL-934・935) đã có sẵn việc master kho giữ loại kho "**Nơi trả hàng** (return)", và hình thức chọn nơi nhận theo lý do sao chép "Trả hàng"
- **Đề xuất**: đăng ký trụ sở chính vào master kho với **loại kho = Nơi trả hàng** (không làm kho picking). Cần quyết tiền tố ID (ngoài WH／HU, ví dụ: RT). Nơi nhận của Trả tồn kho cũng chọn từ đây. Phase 2 không giữ tồn kho tại trụ sở chính (tồn kho kho chỉ là kho của THOMAS)

### Trả lời các câu hỏi về kho
| Câu hỏi | Trả lời |
|---|---|
| Có lập kho chuyên dụng cho vật tư không | Quyết định theo nơi picking vật tư (P10). **Nếu xuất từ văn phòng ES thì đăng ký "Văn phòng ES (vật tư)" làm kho picking trong master kho** và cho giữ ngày không xuất được・lead time・CSV vận đơn. Kho đó không gửi chỉ thị xuất hàng cho THOMAS nên kho cần thêm mục mới "Liên kết THOMAS có/không". Nếu xuất từ kho THOMAS thì không cần kho chuyên dụng (đủ dùng phân loại vật tư của kho Kanto) |
| Công ty vận chuyển = công ty giao hàng = công ty giao hàng ủy thác | **Đã xử lý.** Nếu cùng một công ty thì không qua điểm trung gian (nhận ở kho và giao luôn, 28-144 ⅺ). Vận đơn do ES đánh số (Số giao hàng + số thùng). Cổng ủy thác cũng hiển thị là "Chặng 1 (= chặng cuối)" |
| Công ty vận chuyển = công ty giao hàng = Yamato | **Đã xử lý.** Chuyến COOL (không qua điểm trung gian・cố định Yamato, REQ-DL-711). Không gán tài xế (chặng của công ty vận chuyển). Vận đơn là số của Yamato, coi như hoàn tất lúc 06:00 ngày hôm sau ngày giao (REQ-DL-870) |

## 4. Lần trả lời thứ 2 (anh Long, tối 2026/10/01: toàn bộ §3 đồng ý theo khuyến nghị)

| No | Quyết định |
|---|---|
| P7 | Sasaki Daichi thuộc **nội bộ (chuyến ES giao hàng)**. Sửa 2 dòng trong danh sách giao hàng |
| P10-1 | Lead time **theo đặc tả hiện tại (một giá trị tổng là chuẩn・không có mặc định)**. Giá trị từng chặng là giá trị tham khảo có thể nhập |
| P10-2 | Di chuyển ngày trước hạn chót **lấy biên bản 9/30 làm chuẩn** (chu kỳ khác thì cảnh báo, nửa đầu/nửa sau・tháng khác・quá khứ thì lỗi) |
| P10-3 | Nơi picking vật tư **xác nhận với khách hàng** |
| P10-4 | Giới hạn số lần giao hàng là **tối đa 8 lần/1 Chu kỳ** |
| P10-5 | Chuyển ngày tại ranh giới Chu kỳ: **A1・C1 dời muộn, D7 đẩy sớm** |
| P10-6 | Gợi ý đơn vị ủy thác (REQ-DL-132) **hủy** |
| P10-7 | Sau khi báo sự cố: **tài xế nhập được cho đến khi Vận hành giải quyết. Sau khi giải quyết thì không sửa được** |
| P11 | **1 email khi hoàn tất gửi hàng (nhập kết quả xuất hàng), và email khi Vận hành đổi ngày giao sau hạn chót** (theo đúng yêu cầu của khách hàng) |
| W6 | Giá trị ban đầu của Trả tồn kho: **chỉ sản phẩm không dùng ở menu tiếp theo mới lấy toàn bộ phần dư** |
| W7 | Trụ sở chính đăng ký vào master kho với **loại kho = Nơi trả hàng** (chữ đầu của ID tạm đặt là RT) |
| W8 | Kho chuyên dụng cho vật tư **tùy câu trả lời của P10-3** |
| S-1〜3 | **Sửa đặc tả** (expiry_date của DEV, phần còn lại của tích hợp, phần giao hàng của đề xuất sửa_K) |
| Mới | **Việc giao hàng dòng máy (thiết bị như tủ lạnh・máy bán hàng tự động) được quản lý ngoài hệ thống.** ES Station chỉ giữ ngày dự kiến lắp đặt・thu hồi・thay thế và bản ghi cho thuê, không giữ vận đơn・thông báo gửi hàng (câu trả lời cho dòng 120 của bảng yêu cầu) |

### Phản ánh vào đặc tả (2026/10/01)
- Đặc tả tích hợp: 0-2M (4 mô tả cũ)・**0-2N (P10・P11・dải nhiệt độ・tên bước・K-29・K-37)**. 5-1 (số lần giao hàng 1–8), 6-3 (chiều tại ranh giới), 8-3・15-8・15-9 (đổi ngày sau hạn chót), 10-7 (API Thomas 2B), 10-8 (email hoàn tất gửi hàng), 12-2 (tên bước), 12-6 (dải nhiệt độ 3 giá trị・hủy gợi ý), 13-2 (thao tác sau khi báo)
- Đặc tả cài đặt Chu kỳ giao hàng: K-27 (ngày lễ)・K-29 (đổi ngày sau hạn chót)
- Đặc tả DEV: xóa `delivery_lines.expiry_date`
- Yêu cầu chi tiết Picking・Xuất hàng・Giao hàng・Tài xế: hủy REQ-DL-132 (K-27・K-29・K-38・K-39 vốn đã được phản ánh)
- Backup: `99_過去/*_20261001_STEP4修正前*.md`
- Chưa: tạo lại bản HTML, quy tắc di chuyển trước hạn chót trong nội dung 15-8 (ghi ở 0-2N), phần tổng hợp định nghĩa yêu cầu của đề xuất sửa_K

## 5. Trả lời xác nhận với khách hàng (anh Long, tối 2026/10/01. `お客様確認_配送_STEP4_20261001.md`)

| No | Trả lời | Xử lý |
|---|---|---|
| A1 | **Có liên kết với yêu cầu báo giá nhưng không bắt buộc** | Có thể yêu cầu tùy chọn từ chi tiết đơn đăng ký. Không có báo giá vẫn phê duyệt được |
| A2 | **Giao thẳng bằng Yamato từ văn phòng ES**. Sau này có thể thay đổi (kể cả trường hợp công ty giao hàng ủy thác). Tình trạng không qua API mà mở URL bằng số vận đơn để xác nhận | Đăng ký văn phòng ES làm kho picking cho vật tư, kho thêm mới mục "Liên kết THOMAS (có/không)" (giải quyết luôn W8) |
| A4 | Bộ ban đầu miễn phí. **Sau đó cũng miễn phí đến 1 lần/tháng, quá đó thì tính phí** | Thêm mới "Phí đặt vật tư" dạng một lần vào master tùy chọn (số tiền chưa định) → **chuyển sang STEP3** |
| A6 | Máy bán hàng tự động cũng cùng hạn chót với tủ lạnh (ngày 15 tháng trước) (đã trả lời) | Không đổi |
| A7 | Doanh nghiệp không chọn được. Có thể cần cho CSV gửi Yamato | Vận hành đặt theo từng cơ sở (mặc định buổi sáng), xuất ra CSV vận đơn |
| B1 | Nếu được thì tốt nhưng không có phương tiện | Không tự động phát hiện. Chỉ tra ngược từ điểm trung chuyển → cơ sở sử dụng |
| B2 | Xác nhận tình trạng chỉ bằng URL | Không đổi |
| B3 | Bảng phân thứ trong tuần hiện cũng không có | Không làm |
| B4 | Sổ tay thao tác **tổng hợp ở cuối** | **OPEN (ở STEP7)** |
| B5 | Không có tiêu chuẩn phụ phí khu vực. Làm thủ công bằng tùy chọn | Không đổi (gắn phí giao hàng theo khu vực bằng tay) |
| C1〜C3・C6 | Số lượng chứa tối đa・số lần giao hàng đông lạnh・mức tối thiểu đông lạnh・làn của máy bán hàng tự động **đều có** | Vận hành nhập vào các mục của master (không cần xác nhận với khách hàng) |
| C4 | Giao hàng thiết bị là ngoài hệ thống | Đã quyết định |
| C5 | "Lease là gì?" | Giải thích và xác nhận lại (bên dưới) |
| D1 | Ý đồ câu hỏi không rõ | Giải thích và xác nhận lại (bên dưới) |
| D2 | Lead time của mẫu thì nhập là được | Giá trị do Vận hành nhập (theo từng kho) |
| D3 | "?" | Giải thích và xác nhận lại (bên dưới) |
| D4・D5 | Các mục chi nhánh Yamato giữ hàng・CSV của THOMAS sẽ xác nhận sau | OPEN |
| — | Bổ sung vào đặc tả những phần còn thiếu của đông lạnh・vật tư / bổ sung mẫu cho demo | Đặc tả bổ sung vào tích hợp 0-2O. **Demo (chuyến COOL・ES Standard・cơ sở mẫu có đông lạnh, phiếu giao hàng của Web doanh nghiệp) sẽ đưa vào bằng bản vá STEP4** (vì phiên khác của STEP3 đang chỉnh sửa demo) |

### Xác nhận lại (kèm giải thích)
- **C5 Lease**: Có vẻ ES thuê máy bán hàng tự động từ công ty cho thuê (hợp đồng lease) rồi cho khách hàng mượn. "Bảng quản lý cho thuê máy bán hàng tự động" ở dòng 42 của bảng yêu cầu là câu hỏi **có muốn quản lý hợp đồng với công ty lease (ngày bắt đầu lease・ngày kết thúc・số tiền trả hằng tháng・tên công ty lease) trên ES Station hay không**. Nếu không quản lý thì master dòng máy hiện tại (số hiệu từng máy) và bản ghi cho thuê là đủ.
- **D1 Mẫu số của tỷ lệ hủy**: Tỷ lệ hủy = số lượng hủy ÷ cái gì. ① **Số lượng giao** (số đã giao. Ví dụ: giao 100 cái, hủy 5 cái = 5%) ② **Số lượng đặt hàng**. Dùng cho cảnh báo tỷ lệ hủy (trên 3%) và gợi ý của AI. Đồng thời, có nên cho tài xế bấm "Không hủy" để phân biệt giữa "hủy 0" và "chưa nhập" hay không.
- **D3 6 mục xác nhận với Vận hành** (REQ-DL-938. Đang làm với giá trị tạm): ① Ý nghĩa của chữ đầu "HU" trong ID kho・điểm trung chuyển (giả định là Hub) ② Mã kho gửi cho THOMAS (hiện đang dùng tạm WH00001) ③ Nguồn dữ liệu ngày lễ (giả định nhập tay mỗi năm 1 lần từ dữ liệu của Văn phòng Nội các) ④ Tên công ty・tên hệ thống chính thức của Yamato・Thomas ⑤ Có ổn không nếu vận hành không thu hồi túi giữ lạnh ⑥ Số điện thoại liên hệ hiển thị trên Web doanh nghiệp (hiện là 050-5784-2777).

### Phiếu giao hàng của doanh nghiệp (câu hỏi của anh Long)
- Yêu cầu (REQ-DL-316) là "**Từ trạng thái chờ xuất・đã xuất trở đi, doanh nghiệp có thể xuất PDF (A4). Phản ánh hàng thay thế. Giao hàng ủy thác (chuyến ES giao hàng) được đóng kèm tại kho nên phía doanh nghiệp không cần xuất**".
- **Đặc tả màn hình và demo của Web doanh nghiệp không có chức năng xuất phiếu giao hàng** (đợt kiểm tra 9/30 ở dòng 158・181 của bảng yêu cầu cũng đã chỉ ra). Demo của Vận hành cũng chỉ có câu chữ ở 1 chỗ.
- Xử lý: đã ghi vào tích hợp 0-2O "Xuất PDF từ chi tiết giao hàng của Web doanh nghiệp. Không xuất cho vật tư". **Cần xác nhận có xuất cho cơ sở chuyến ES giao hàng hay không**. Màn hình sẽ bổ sung ở STEP5 (Web doanh nghiệp).

## 6. Trả lời xác nhận lại (anh Long, tối 2026/10/01)

| No | Trả lời | Xử lý |
|---|---|---|
| C5 | Lease máy bán hàng tự động **không quản lý** | Dòng 42 của bảng yêu cầu đóng với trạng thái "Ngoài phạm vi" |
| D1 | Tỷ lệ hủy = số lượng hủy ÷ **số lượng đặt hàng** | Tích hợp 0-2O. Ghi cả vào đặc tả tồn kho・đơn hàng (STEP5) |
| D3-1 | HU chỉ cần không trùng với ID khác | **Master nhà cung cấp đang dùng HU nên bị trùng** → nhà cung cấp đổi sang chữ đầu khác (ví dụ SP) (STEP6・7) |
| D3-2 | THOMAS là hệ thống chứ không phải kho. Mã kho không cố định | "Mã kho (dùng cho liên kết THOMAS)" trong master kho là mục do Vận hành nhập (khác với ID kho WH…) |
| D3-3 | Ngày lễ **lấy từ API công khai** | **Ghi đè K-27 (đăng ký thủ công)**. Tự động lấy mỗi năm 1 lần + "Lấy lại ngày lễ". Đã sửa tích hợp・cài đặt Chu kỳ giao hàng・REQ-DL-307 |
| D3-4 | Không rõ tên chính thức | Tiến hành với cách ghi "Yamato Transport" và "THOMAS (hệ thống kho)". Xác nhận ở mức ưu tiên thấp |
| D3-5 | Túi giữ lạnh không thu hồi. Cảm giác đặc tả hiện tại đang bị sót | Chờ trả lời theo phương án bên dưới |
| D3-6 | **Web doanh nghiệp không có số điện thoại liên hệ** | Bỏ số điện thoại khỏi Web doanh nghiệp (trong demo "Vui lòng gọi cho Vận hành (050-5784-2777)" → "Vui lòng liên hệ Vận hành". Bản vá STEP4). Số điện thoại dành cho tài xế (tích hợp, cần xác nhận #41) là chuyện khác |

### Phương án quản lý túi giữ lạnh・gói giữ lạnh (D3-5)
Đặc tả hiện tại: master điểm giao ủy thác chỉ giữ mỗi loại một "Số túi giữ lạnh・Số gói giữ lạnh" (REQ-DL-664: Phase 2 không quản lý cho mượn・thu hồi). Dữ liệu giao hàng cũng có cột số nhưng chưa quyết có sao chép từ đơn vị ủy thác hay không. Nguồn của dòng 44 bảng yêu cầu là "Bảng quản lý túi giữ lạnh & chất tích lạnh dùng cho ủy thác".

| Phương án | Nội dung | Ưu điểm | Nhược điểm |
|---|---|---|---|
| A Giữ nguyên | Mỗi đơn vị ủy thác 1 số | Không có gì phải làm | Không biết đã giao bao nhiêu・giao khi nào. Không xử lý được nhiều cái |
| **B〔Khuyến nghị〕Sổ cho mượn theo từng đơn vị ủy thác** | Thêm bảng "Túi giữ lạnh・gói giữ lạnh" vào master điểm giao ủy thác: số・loại (túi／gói giữ lạnh)・số lượng・ngày giao・trạng thái (đang cho mượn／thất lạc／hủy bỏ)・ghi chú. Vì không thu hồi nên không có "trả lại". Không sao chép vào dữ liệu giao hàng | Thay thế nguyên vẹn bảng quản lý hiện tại. Chỉ cần 1 màn hình (thêm・sửa bảng) | Không biết mỗi lần giao đã dùng túi nào |
| C Ghi theo từng lần giao | Ngoài B, ghi số túi vào dữ liệu giao hàng (lúc tài xế nhận hàng) | Truy vết được thất lạc | Tài xế phải nhập nhiều hơn. Với vận hành không thu hồi thì ít có công dụng |

## 7. Quản lý túi giữ lạnh (anh Long, tối 2026/10/01)

- **B (sổ cho mượn theo từng đơn vị ủy thác)**. Tuy nhiên **công ty giao hàng ủy thác có nhiều trên toàn quốc và nhiều là đơn vị giao hàng cá nhân**, nên làm theo dạng sau:
  - Sổ `carrier_coolers` (bảng con của master điểm giao ủy thác): số・loại (túi giữ lạnh／gói giữ lạnh)・số lượng・ngày giao・trạng thái (đang cho mượn／thất lạc／hủy bỏ)・ghi chú・nhân viên giao hàng đã giao (tùy chọn). Không giữ "trả lại"
  - **Màn hình danh sách xuyên suốt "Sổ túi giữ lạnh"** (Quản lý master ＞ Liên quan giao hàng): tìm theo tỉnh・đơn vị ủy thác・trạng thái・số, **nhập・xuất hàng loạt bằng CSV** (chuyển từ bảng quản lý hiện tại). Cùng bảng đó cũng có trong chi tiết đơn vị ủy thác
  - Đơn vị cá nhân đăng ký là "Công ty giao hàng ủy thác (1 nhân viên)" và cũng đưa vào cùng sổ
  - Không sao chép số vào dữ liệu giao hàng
- Đã phản ánh vào đặc tả tích hợp 3-3・12-5・0-2O.

## 8. Các mục đã sửa trong "cập nhật các quy tắc khác" (tối 2026/10/01)

- Đặc tả tích hợp: 15-8 (quy tắc di chuyển trước hạn chót: từ hôm nay trở đi・theo từng lead time・không giới hạn số lượng・chu kỳ khác thì cảnh báo・nửa đầu/nửa sau／tháng khác／quá khứ thì lỗi), 3-1 (thêm RT vào ID, mã kho 〈dùng cho liên kết THOMAS〉 do Vận hành nhập, liên kết THOMAS 〈có／không〉, khu vực phụ trách), 3-2 (tra ngược từ điểm trung chuyển → cơ sở sử dụng), 3-3・12-5 (sổ túi giữ lạnh), 0-2O (câu trả lời D1・D3・C5), ngày lễ (lấy bằng API)
- Đặc tả cài đặt Chu kỳ giao hàng: ngày lễ (lấy bằng API). REQ-DL-307 cũng được sửa đổi
- Ghi chú bàn giao: dòng STEP4 ở §3 và "Bổ sung của phiên STEP4". Định nghĩa ảnh hưởng giữa các bước: thêm "STEP4 → các bước khác" ở §5
- Ở v1.47 của phiên khác, đã thêm mẫu doanh nghiệp kiểm tra tồn kho bằng chuyến COOL (chi nhánh Chiba CU00961・gói 50 ES Lite) → **cơ sở mẫu của Q3 sẽ dùng cơ sở này**. Mẫu giao hàng đông lạnh sẽ tạo ở cơ sở ES Standard (bản vá STEP4)
- **Demo vẫn chưa sửa** (vì việc phản ánh STEP3 đang tiếp tục ở phiên khác)

> Tối 2026/10/01: demo đã được đưa vào ở v1.49 (phản ánh STEP4) và v1.51 (bổ sung ở §9 bên dưới).

## 9. Trả lời các OPEN còn lại (anh Long, tối 2026/10/01)

| No | Trả lời | Xử lý |
|---|---|---|
| O-1 | Các mục chi nhánh Yamato giữ hàng・CSV của THOMAS **sẽ đính kèm tài liệu sau** | OPEN (chờ tài liệu) |
| O-2 | Phiếu giao hàng của doanh nghiệp **cũng xuất cho cơ sở chuyến ES giao hàng** | Tích hợp 0-2O・0-2P. Chi tiết giao hàng của doanh nghiệp trong demo vốn đã có nút cho cả chuyến ES giao hàng (đã sửa phần giải thích) |
| O-3 | Phí từ lần thứ 2 trở đi của vật tư **dùng số tạm** | **¥1,000/lần (chưa gồm thuế・tạm)**. Giống với **OP000036 "Giao thêm vật tư (một lần・1 lượt)"** ở STEP5 quyết định §2-2 (không dùng tên "Phí đặt vật tư"). Demo master tùy chọn sẽ đưa vào khi phản ánh STEP5 (cùng lúc với việc ngừng OP000013) |
| O-4 | Tra URL theo dõi của Yamato và **cho phép chỉnh sửa URL** | Master công ty vận chuyển có "mẫu URL theo dõi" (thay `{送り状番号}`). Ví dụ của Yamato ở bên dưới. Nếu công ty vận chuyển đổi dạng thì Vận hành sửa trong master |
| O-5 | "?" | Giải thích ở dưới. Đã chuẩn bị nội dung đề xuất cho cột trả lời trong bảng (việc cập nhật bảng đang chờ anh Long xác nhận) |

### O-4 URL theo dõi của Yamato Transport (tra 2026/10/01)
- Trang chủ liên hệ (thông báo chính thức. https từ 2024/02): `https://toi.kuronekoyamato.co.jp/cgi-bin/tneko`
- Dạng mở chi tiết có kèm số vận đơn (xác nhận theo hướng dẫn của người vận hành EC chứ không phải trang chính thức): `https://member.kms.kuronekoyamato.co.jp/parcel/detail?pno={送り状番号}`. Chỉ dùng được cho **một số duy nhất**
- Dạng này có thể thay đổi (năm 2024 http → https, `jizen.kuronekoyamato.co.jp` cũ đã bị bỏ) nên **không ghi cứng trong code mà để là giá trị của master**. Nếu dạng có kèm số không dùng được nữa thì dùng URL trang chủ và hiển thị số trên màn hình・email
- Nguồn: Yamato Transport "Thông báo về thay đổi và ngừng URL của Website" (2023/09/28), Ganbare Tencho "Những chỗ thay đổi URL theo dõi hàng của Yamato 2 (từ 2024/4/1)"

### O-5 là gì
- Dòng 127 (email "đã gửi hàng") và dòng 134 (thông báo ngày mới nhất khi đổi ngày giao) của bảng yêu cầu đã được phía DIPRO trả lời ngày 9/30 là "đúng như đặc tả hiện tại (không gửi)", nhưng ngày 2026/10/01 ở P11 đã quyết định **gửi**. **Câu trả lời trong bảng vẫn còn cũ**, nên việc cần làm là sửa phần trả lời DIPRO trong bảng để thông báo cho khách hàng cách xử lý mới.
- Nội dung đề xuất (cột trả lời DIPRO):
  - Dòng 127: "Vào thời điểm nhập kết quả xuất hàng (hoàn tất gửi hàng), chúng tôi sẽ gửi 1 email cho người phụ trách chính・phụ. Email có số vận đơn và liên kết đến trang theo dõi của công ty vận chuyển (Yamato Transport có kèm số). Chúng tôi không gửi email 'đang chuẩn bị gửi hàng' mà chỉ hiển thị trên Web doanh nghiệp."
  - Dòng 134: "Nếu sau hạn chót đặt hàng, Vận hành thay đổi ngày giao・ngày xuất hàng, chúng tôi sẽ gửi email với ngày sau thay đổi. Thay đổi trước hạn chót thì ngày mới nhất đã có trong thông báo xác nhận nên không gửi email riêng."
- Mẫu email đã đặt trong chi tiết giao hàng của demo (bên dưới phần tổng quan giao hàng).

## 10. Giao hàng theo từng tình huống hợp đồng (xác nhận tối 2026/10/01)

Câu trả lời cho câu hỏi của anh Long: "Việc giao hàng khi doanh nghiệp mới・cơ sở mới・dùng thử・mẫu, và khi gia hạn・hủy・tạm dừng hợp đồng, xử lý hiện tại đã làm được chưa". ○ = có trong đặc tả, △ = một phần, × = không có.

| Tình huống | Đặc tả | Demo | Còn thiếu |
|---|---|---|---|
| Doanh nghiệp・cơ sở mới (triển khai chính thức) | ○ Đăng ký tạm: đơn hàng・bộ vật tư ban đầu; đăng ký chính thức: hợp đồng con・kế hoạch・dữ liệu giao hàng (tích hợp 0-2H・7-3). Tháng bắt đầu liên động với hạn chót đặt hàng (8-7) | △ Quản lý đơn đăng ký có tiếp nhận・phạm vi ảnh hưởng. **Quản lý giao hàng không có mẫu "giao hàng lần đầu" và "bộ vật tư ban đầu"** (chỉ có mẫu bộ ban đầu trong tổng hợp vật tư) | Mẫu giao hàng lần đầu |
| Dùng thử | ○ Đơn hàng tự động tạo・lấy ngày chốt đặt hàng (B5・D5) làm chuẩn・chỉ tạo hợp đồng con trong thời gian dùng thử (7-9) | × Quản lý giao hàng không có mẫu giao hàng dùng thử | Mẫu giao hàng dùng thử (cùng với "chỉ hiển thị để tham khảo" của STEP5 QC) |
| Dùng thử → chuyển sang triển khai chính thức | ○ Khoảng trống từ khi hết hạn đến khi bắt đầu giống như tạm dừng (không tạo giao hàng・hợp đồng con) | △ Chỉ có Quản lý đơn đăng ký | — |
| Mẫu kinh doanh | △ Màn hình mẫu kinh doanh: tiếp nhận・kho・ngày gửi・CSV cho THOMAS (đặc tả mẫu 1-7). **Chưa quyết có tạo dữ liệu giao hàng (số vận đơn・trạng thái giao hàng) hay không** | △ Chỉ có màn hình mẫu kinh doanh. Không hiện trong quản lý giao hàng | **Cần quyết định**: có biến việc gửi mẫu thành dữ liệu giao hàng không (để theo dõi số vận đơn・giải đáp thắc mắc) |
| Thay đổi hợp đồng (gói・số lần giao hàng・phương thức giao hàng・địa chỉ) | ○ 8-7・8-8 (tạo lại kế hoạch・cần xác nhận → thay đổi hàng loạt). Đơn hàng sẽ tự động sửa ở STEP5 QA | △ Phạm vi ảnh hưởng của Quản lý đơn đăng ký・cài đặt trước phê duyệt (cũng có yêu cầu báo giá 〈tùy chọn〉) | Mẫu "giao hàng được tạo lại do thay đổi" trong quản lý giao hàng |
| Tự động gia hạn (hợp đồng con hằng tháng) | ○ 7-4 (ngày chuẩn tạo・cả năm một lần thì gộp 12 bản ghi) | ○ Danh sách hợp đồng con | — |
| Tạm dừng | ○ Xóa kế hoạch・dữ liệu giao hàng từ Chu kỳ áp dụng trở đi, không tạo trong thời gian tạm dừng. Khi tiếp tục thì tạo lại lúc phê duyệt (8-7) | △ Quản lý đơn đăng ký・trang chủ doanh nghiệp (Nagoya = đang tạm dừng). Quản lý giao hàng không có mẫu "giao hàng bị hủy do tạm dừng" | Mẫu |
| Hủy hợp đồng | ○ Chu kỳ đã qua hạn chót thì giao đến cùng・ngày hủy là cuối Chu kỳ・chuyến ES giao hàng thông báo cho công ty giao hàng ủy thác (8-7) | △ Quản lý đơn đăng ký (phán định ngày hủy・nơi nhận thông báo). **Cổng điểm giao ủy thác không hiển thị thông báo hủy** | Thông báo hủy ở cổng・mẫu giao hàng cuối cùng |

**Ảnh hưởng giữa các bước (từ thượng nguồn đến STEP4)**: Các kiểm soát của STEP1 (dừng khi tạm dừng・hủy, thông báo cho công ty ủy thác, tạo lại khi thay đổi giao hàng, tháng bắt đầu) và các bản sao của STEP2 (địa chỉ・thứ không giao được・tuyến giao hàng・số lần giao hàng・Chu kỳ) **đã được đáp ứng trong đặc tả**. Phần demo chưa thể hiện hết là các "mẫu" trong bảng trên và thông báo hủy ở cổng điểm giao ủy thác. Dữ liệu trụ sở chính của STEP3 (chuyến ES giao hàng) đã phản ánh ở v1.49. Các quyết định của STEP5 (vật tư tùy thời・chi nhánh Yokohama = mẫu đông lạnh・tự động sửa đơn hàng của QA) cũng sẽ được đưa vào quản lý giao hàng khi phản ánh STEP5.

## 11. Trả lời §10 (anh Long, tối 2026/10/01)

| No | Trả lời | Xử lý |
|---|---|---|
| 1 | **Được phép** sửa cột trả lời của dòng 127・134 trong bảng yêu cầu | Đã sửa (trả lời ở cột trạng thái DIPRO, bổ sung dòng 134 thành OK). Bản trước là `99_過去/新ESS_要件シート_20261001_行127_134回答前.xlsx` |
| 2 | Việc gửi mẫu kinh doanh **không làm thành dữ liệu giao hàng (B)**. Không muốn trộn dữ liệu | Giữ nguyên màn hình mẫu kinh doanh và CSV cho THOMAS. Hệ thống không giữ việc theo dõi số vận đơn (việc đã đến nơi hay chưa do bộ phận kinh doanh xác nhận) |
| 3 | **Đưa vào** mẫu cho từng tình huống hợp đồng | Demo v1.53: 5 dòng gồm lần đầu・dùng thử・hủy do tạm dừng・lần cuối trước khi hủy hợp đồng・hủy do hủy hợp đồng, và thông báo hủy hợp đồng của cổng điểm giao ủy thác |
| 4 | Giao thêm vật tư **¥1,000 (tạm) là được** | Giữ lại làm giá trị cần xác nhận với khách hàng. Sẽ đưa vào OP000036 của master tùy chọn khi phản ánh STEP5 |

## 12. Sửa mâu thuẫn, và cách xử lý khi thêm kho・công ty vận chuyển (anh Long, tối 2026/10/01)

| No | Trả lời của anh Long | Xử lý |
|---|---|---|
| 1 | Số điện thoại của tài xế (050-5784-2777) **giữ lại** | Phần dành cho tài xế giữ nguyên như tích hợp "cần xác nhận #41" |
| 2 | Kho Chubu (tạm)・lịch trước tháng 7/2026 **tạm thời ổn** | Giữ nguyên hiện tại |
| 3 | Tài xế **cũng có khi không giao ngay sau khi nhận**. Nhận hàng, chở đến kho trung chuyển, rồi từ điểm trung chuyển đến khách hàng. **Có khi cùng một tài xế, có khi khác** | Đặc tả (tích hợp 11-3: phân công theo từng chặng, chặng 1 là ủy thác・có trung chuyển là trường hợp B) đúng theo dạng này. Bỏ cách đặt "chuyến trong ngày" của demo. **Cách hiển thị ứng dụng tài xế đang chờ xác nhận (Q-D bên dưới)** |
| 4 | Việc chuyển kho・công ty vận chuyển hàng loạt cho nhiều cơ sở **dùng được nếu có nhập CSV** (cả việc điều chỉnh hàng loạt giá gói) | **Phương châm**: làm chức năng thay đổi hàng loạt tuyến giao hàng (phương án bên dưới). Cùng dạng với chuyển đổi hàng loạt điều chỉnh giá (quyết định 28 #151) |
| 5 | Nhập vận đơn・kết quả xuất hàng của công ty vận chuyển mới **chỉ có thể phát triển thêm**. Lựa chọn hiện tại **chỉ Yamato・Sagawa・Fukuyama Transporting** | Công ty vận chuyển tuyến cố định là 3 công ty (đã bỏ Seino Transportation khỏi demo). **Định dạng CSV vận đơn・số phiếu của Sagawa・Fukuyama chưa có** (chỉ có Yamato) → xác nhận cùng với tài liệu của O-1 |
| 6 | Thông báo khi thay đổi đơn vị ủy thác **có lẽ cần** | Phương án: gửi cả cho đơn vị ủy thác bị gỡ và đơn vị ủy thác mới, bằng thông báo ở cổng điểm giao ủy thác + email (bên dưới) |
| 7 | Cảm giác là kho **không phân theo khu vực phụ trách** | **Chờ xác nhận (Q-E bên dưới)**. Mâu thuẫn với việc ngày 2026/10/01 T4-2 đã thêm "khu vực phụ trách" vào master kho (dùng để quyết định kho của mẫu kinh doanh) |

### Thay đổi hàng loạt tuyến giao hàng (phương án)
- Lối vào: Vận hành ＞ Quản lý doanh nghiệp・hợp đồng (danh sách hợp đồng con) có "Thay đổi hàng loạt tuyến giao hàng". **Lọc** (kho・công ty vận chuyển・điểm trung chuyển・tỉnh・course) **hoặc nhập CSV** (ID cơ sở・loại giao hàng・kho mới／công ty vận chuyển chặng 1・2／điểm trung chuyển・Chu kỳ bắt đầu áp dụng)
- Áp dụng: **từ Chu kỳ được chỉ định** (quy tắc hạn chót đặt hàng giống thay đổi hợp đồng 1 bản ghi). Ghi đè giá trị mặc định của hợp đồng cha và hợp đồng con từ Chu kỳ áp dụng trở đi. Dữ liệu giao hàng đã tạo thì cần xác nhận → thay đổi hàng loạt theo tích hợp 8-7 (thay đổi kho・công ty vận chuyển・trung chuyển)
- **Xem trước ảnh hưởng** trước khi nhập (số cơ sở・kế hoạch tạo lại・dữ liệu giao hàng thành "cần xác nhận"・cơ sở cần xem lại lead time). Dòng lỗi thì không nhập
- Thống nhất dạng màn hình với điều chỉnh giá hàng loạt (chuyển đổi thế hệ gói)

### Thông báo khi thay thế đơn vị ủy thác (phương án)
- Khi thay đổi tuyến giao hàng (cả 1 bản ghi lẫn hàng loạt) mà có cơ sở đổi công ty giao hàng ủy thác chặng 1・2, gửi cho **đơn vị ủy thác bị gỡ** "Kết thúc phụ trách (cơ sở・ngày phụ trách cuối)", và cho **đơn vị ủy thác mới** "Thêm phụ trách (cơ sở・ngày phụ trách đầu・địa chỉ・khung giờ nhận hàng・tài liệu)", bằng thông báo ở cổng điểm giao ủy thác + email
- Cùng cơ chế với thông báo hủy hợp đồng (tích hợp 8-7). Sẽ thêm vào danh sách email ở STEP7

### Điều muốn xác nhận
- **Q-D Cách hiển thị ứng dụng tài xế**: A = Trên màn hình hôm nay, hiển thị tách riêng "Nhận hàng" (xuất hàng hôm nay・giao từ ngày mai trở đi) và "Giao hàng" (giao hôm nay)〔khuyến nghị〕／B = Giữ nguyên hiện tại (giả định giao ngay trong ngày nhận hàng), chỉ chỉnh số trong demo cho khớp
- **Q-E Khu vực phụ trách của kho**: A = Không giữ (kho của mẫu kinh doanh: nếu sản phẩm chỉ có 1 kho xử lý thì dùng kho đó, nhiều kho thì Vận hành chọn)〔khuyến nghị〕／B = Giữ như hiện tại

## 13. Trả lời Q-D・Q-E (anh Long, tối 2026/10/01)

| No | Trả lời | Xử lý |
|---|---|---|
| Q-D | **A**: Tách màn hình hôm nay của ứng dụng tài xế thành "Nhận hàng (xuất hàng hôm nay・giao từ ngày mai trở đi)" và "Giao hàng (giao hôm nay)" | Tích hợp 0-2Q・12-2. Demo v1.56 |
| Q-E | **A**: Kho **không giữ** khu vực phụ trách. Kho của mẫu kinh doanh: nếu chỉ có 1 kho xử lý thì dùng kho đó, nhiều kho thì Vận hành chọn | **Hủy quyết định T4-2 (2026/10/01 STEP1)**. Tích hợp 3-1・0-2Q, đặc tả mẫu 1-7. Demo v1.56 |

## 14. Quyết định phương án §12 (anh Long, tối 2026/10/01 "Hãy phản ánh")

- **Thay đổi hàng loạt tuyến giao hàng**: quyết định đúng như phương án ở §12. Đặc tả tích hợp 5-10. Demo v1.57 (Vận hành ＞ Quản lý doanh nghiệp・hợp đồng ＞ Thay đổi hàng loạt tuyến giao hàng)
- **Thông báo khi thay thế đơn vị ủy thác**: quyết định đúng như phương án ở §12 (đơn vị bị gỡ = kết thúc phụ trách／đơn vị mới = thêm phụ trách. Thông báo ở cổng + email). Tích hợp 5-10・8-7. Nội dung email sẽ làm ở STEP7

