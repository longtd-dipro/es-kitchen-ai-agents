> Bản dịch tiếng Việt của `ja/01_仕様/75_営業サンプル/営業サンプル.md` (nguồn es-station, bản 2026-10-20). Khi khác nhau, bản tiếng Nhật và `docs/決定台帳.md` là chuẩn.

# Mẫu kinh doanh・Mẫu thử nghiệm

> **Nguồn chuẩn của chủ đề này.** Ngày 2026-10-05, tổng hợp lại từ các nguyên bản và quyết định bên dưới, chỉ viết mới những nội dung "hiện đang có hiệu lực".
> Các quyết định đang có hiệu lực nằm ở `docs/決定台帳.md` (F "Mẫu thử nghiệm" và các mục khác). Nếu có khác biệt thì sổ quyết định là chuẩn.
> Nguyên bản (đã đóng băng, chỉ để xem lại quá trình): `docs/議事録_仕様/サンプル_仕様まとめ.md`, `00_決定/決定_STEP1回答_申込とサンプル_20261001.md` (mẫu kinh doanh), `決定_STEP3残りとSTEP1を閉じる回答_20261001.md` (T4).

## 1. Chủng loại

| Chủng loại | Là gì | Giai đoạn 2 |
|---|---|---|
| **Mẫu kinh doanh** | Hàng dùng thử gửi cho khách hàng tiềm năng | **Quản lý trên hệ thống** (§2 bên dưới) |
| **Mẫu thử nghiệm** (lưu giữ・dự phòng thử nghiệm・ăn thử) | Dùng nội bộ trong ES Kitchen | **Giữ nguyên cách làm hiện tại**: đặt hàng bình thường từ cơ sở・hợp đồng dành cho ES Kitchen (qua hợp đồng). Không làm cờ "ES 製造商品" (sản phẩm do ES sản xuất) và không làm tự động tạo |
| Mẫu đặc biệt của nhà máy・liên kết với sản xuất | — | Tương lai |
| Chỉnh sửa lịch sử thực hiện chiến dịch・tỷ lệ thành công | — | Không làm (2026/07/08) |

- Không làm trạng thái khách hàng 「サンプル」(Mẫu) và 「無料試し」(Dùng thử miễn phí) (dùng thử được thể hiện bằng hợp đồng. Mẫu thì lưu lịch sử ở địa chỉ nhận).

## 2. Mẫu kinh doanh

| # | Quy định | Căn cứ |
|---|---|---|
| 2-1 | Tiếp nhận được nhập **trong hệ thống**. Là **đăng ký đơn giản chuyên dụng cho mẫu** trên Web vận hành. Chỉ nhập **địa chỉ nhận** (không tạo doanh nghiệp・cơ sở・hợp đồng) | STEP1 (2026/10/01) |
| 2-2 | **Số lượng được quyết định theo từng menu** (trên màn hình tạo menu. Mặc định 60 mẫu/tháng = 15 mẫu × 4・có thể thêm. **Sau khi công khai thì không thể thay đổi khung** 〔muốn thay đổi thì đăng ký ở tháng của menu khác. Sổ quyết định AL・2026-10-16. Cũ: có thể sửa đến khi menu được công khai 〈chốt〉〕). Bỏ việc cố định 15 mẫu mỗi tuần | MM 2026/10/02, RD-MN-045 |
| 2-3 | Sản phẩm dùng cho mẫu kinh doanh được quyết định bằng ô chọn 「営業サンプル」(Mẫu kinh doanh) trên màn hình master sản phẩm / tạo menu | 2026/06/26 |
| 2-4 | **Số lượng tính vào khung: 1 địa chỉ nhận = 1 mẫu** (đăng ký 2 lần là 2 mẫu). Số lượng theo từng sản phẩm là 1〜9 cái (giá trị ban đầu mỗi loại 2 cái. Có thể thay đổi hàng loạt các sản phẩm đã chọn) | T4-4, sổ quyết định F 2026-10-08 |
| 2-5 | **Ngày xuất hàng**: nhập ngày giao hàng, tính ngược từ lead time. Nếu rơi vào ngày không thể picking thì đẩy sớm lên ngày có thể picking ngay trước đó, và **ngày giao hàng cũng dịch chuyển bằng đúng số ngày đó** (giống giao hàng theo hợp đồng) | Yêu cầu dòng 182, T4-5 |
| 2-6 | **Kho picking theo từng địa chỉ nhận** (không theo từng sản phẩm). Mỗi lần đăng ký đều nhập tuyến giao hàng (kho picking・công ty vận chuyển・điểm trung chuyển), không thể chọn sản phẩm mà kho đó không xử lý (kho không giữ khu vực phụ trách). **Không làm xuất hàng tách kho (số nhánh): sản phẩm ở kho khác thì đăng ký thêm 1 lần nữa** (khung tính 2 mẫu・lần thứ 2 cho cùng địa chỉ nhận sẽ cảnh báo). Khi đổi kho, các sản phẩm mà kho mới không xử lý sẽ bị bỏ chọn, **số lượng được giữ lại** | Sổ quyết định F 2026-10-08 (tuyến giao hàng của mẫu kinh doanh), sổ quyết định S (#448) |
| 2-7 | Lead time khác nhau theo từng địa chỉ nhận (địa chỉ công ty nhận), và có thể khác nhau mỗi lần. **Mỗi lần đăng ký, vận hành nhập tay** (bắt buộc・số nguyên 0〜30 ngày. Hệ thống không đề xuất). Ngày xuất hàng = ngày giao hàng − lead time. Không giữ lead time theo từng kho | Sổ quyết định F 2026-10-08 (lead time của mẫu kinh doanh) |
| 2-8 | **Danh sách và xuất CSV**. Lịch sử theo từng địa chỉ nhận | 2026/08/19, STEP1 |
| 2-8b | **Không liên kết với doanh nghiệp** (dù công ty đó đăng ký sau này cũng không kế thừa). Những điều biết được sau này thì ghi vào ô ghi chú | Sổ quyết định N (hong 2026-10-05) |
| 2-9 | **Sau khi chốt tiếp nhận vẫn có thể thêm.** Tuy nhiên phần thêm sau khi chốt không tạo chỉ thị xuất hàng ở lần chốt đó (trạng thái 「締め後追加」(thêm sau chốt)). **Sẽ thành chỉ thị xuất hàng ở lần chốt của tuần xuất hàng kế tiếp** (sổ quyết định AL・2026-10-16). Mẫu thêm sau chốt cũng có thể hủy (2-12) | 2026/08/19, sổ quyết định S (#449) |
| 2-10 | Phần dư sau khi chốt được trả về ES bằng chỉ thị xuất hàng hoàn kho (`60_在庫/在庫.md` §2-6) | Yêu cầu dòng 99 |
| 2-11 | Được tính vào số lượng cần đặt hàng (số lượng cần = đơn hàng của hợp đồng + dùng thử + mẫu kinh doanh). Phần tăng thêm sau khi chốt thì đặt hàng bổ sung. Cách đếm số lượng mẫu kinh doanh xem 2-16 | `55_発注・仕入・入荷/発注・仕入・入荷.md` §1・§2 |
| 2-12 | **Hủy**: mẫu 「受付済」(đã tiếp nhận) có thể hủy bất cứ lúc nào (ngay lập tức). **Mẫu 「締め済」(đã chốt) và 「締め後追加」 có thể hủy đến 23:59 (giờ Nhật) ngày trước ngày xuất hàng của mẫu đó**. Từ ngày xuất hàng trở đi thì không thể hủy (xử lý bằng hoàn kho, v.v.). Lý do là tùy ý (để trống vẫn hủy được. Sổ quyết định W). Trạng thái 「取消」(đã hủy) không tính vào khung, danh sách mặc định không hiển thị. Hủy mẫu đã chốt thì xuất CSV dòng thay đổi cho THOMAS và đăng ký lại (cùng cách với thay đổi sau chỉ thị xuất hàng ở sổ quyết định L). Việc phản ánh do **vận hành chuyển CSV cho kho, kho thực hiện** (sổ quyết định AL・2026-10-16) | Sổ quyết định F 2026-10-07, sổ quyết định S (#449) |
| 2-13 | **Chốt tiếp nhận**: có cả tự động (2 ngày làm việc trước thứ Hai của tuần xuất hàng【tạm・có thể thay đổi trong cài đặt của vận hành】) và thủ công khi vận hành bấm 「受付を締める」(chốt tiếp nhận) để chốt sớm. Khi chốt thì tạo chỉ thị xuất hàng cho các mẫu đã tiếp nhận, đồng thời tạo CSV cho THOMAS và dữ liệu giao hàng (2-17) | Sổ quyết định F 2026-10-07・10-08 |
| 2-14 | **Hủy chốt** (**"có thể" là quyết định sau**. "Không làm" ở sổ quyết định F 2026-10-07 đã bị thay thế = sổ quyết định AL・2026-10-16): có thể làm **đến 23:59 (giờ Nhật) ngày trước ngày xuất hàng đầu tiên** của tuần xuất hàng đó (khi hủy thì hủy chỉ thị xuất hàng và dữ liệu giao hàng của tuần đó, xuất CSV dòng thay đổi và đăng ký lại). **Tuần đã hủy chốt thủ công thì chốt tự động không chạy lại nữa** (vận hành chốt lại thủ công thì gỡ bỏ). Hạn của hủy (2-12) là ngày xuất hàng của từng mẫu, hạn của hủy chốt là ngày xuất hàng đầu tiên của tuần | Sổ quyết định F 2026-10-08, sổ quyết định S (#449) |
| 2-15 | **Khung theo tháng**: đếm bằng số địa chỉ nhận đã tiếp nhận (không đếm mẫu đã hủy). **Chặn đăng ký vượt khung** (E149). Tháng chưa cài khung thì cảnh báo nhưng vẫn đăng ký được | Sổ quyết định M-5・F, hong xác nhận 2026-10-08 (sổ quyết định S #448. Trong sổ quyết định không có dòng) |
| 2-16 | **Tồn kho dự kiến và đặt hàng**: chỉ thị xuất hàng của mẫu được trừ khỏi tồn kho dự kiến (dự kiến xuất hàng của tồn kho kho) sau khi chốt tiếp nhận và chỉ thị xuất hàng đã được tạo (mẫu đã tiếp nhận trước khi chốt và mẫu thêm sau chốt thì không trừ. Ngày trừ là ngày xuất hàng của từng mẫu). **Số lượng đưa vào đặt hàng**: theo từng sản phẩm đối tượng, các tháng từ tháng sau trở đi là "số mẫu của khung quyết định trong menu × 2 cái" (không thay đổi theo số đăng ký thực tế. Phần chênh lệch đặt hàng bổ sung. Hạn sử dụng ngắn cũng chia đều cho 4 tuần), các tháng từ tháng này trở về trước là số lượng đã đăng ký (đã tiếp nhận). Phần tăng thêm sau khi chốt xử lý bằng đặt hàng bổ sung (sổ quyết định S 2026-10-14) | Sổ quyết định S (#448), sổ quyết định F 2026-10-08 |
| 2-17 | **Dữ liệu giao hàng**: tạo khi chốt tiếp nhận, đồng thời với chỉ thị xuất hàng. Trên danh sách quản lý xuất hàng・giao hàng của vận hành D hiển thị với **loại 「サンプル」(Mẫu)**, **hợp đồng・cơ sở để trống**, **được tính vào giới hạn 300 đơn/ngày**. Cách hiển thị trên Web đơn vị giao hàng ủy thác được quyết định trong tài liệu thiết kế OW. **Không đưa vào tính toán hóa đơn・quyết toán**. Trạng thái ban đầu giống giao hàng thông thường. Khi hủy chốt tiếp nhận hoặc khi mẫu bị hủy sau khi chốt, dữ liệu giao hàng chuyển sang 「取消」 và được giữ lại (không xóa). Trên Web đơn vị giao hàng ủy thác cũng hiển thị giống giao hàng thông thường (hiển thị địa chỉ nhận thay cho hợp đồng・cơ sở)〔sổ quyết định AA・#582〕 | Sổ quyết định F 2026-10-08, sổ quyết định S (#451) |
| 2-18 | **Tab tháng trên danh sách (màn hình vận hành)**: **4 tab từ tháng 9〜tháng 12 (cố định) + 「過去分」(phần quá khứ)**. Tab 「出荷週の受付」(tiếp nhận theo tuần xuất hàng) chỉ hiển thị các tuần thuộc chu kỳ của tháng đã chọn (tuần vắt qua hai tháng chỉ hiển thị ở tháng của chu kỳ mà nó thuộc về). 「過去分」 hiển thị các tuần của chu kỳ trước tháng 9, có thể xem tình trạng chốt và hủy chốt (giới hạn đến bao nhiêu tháng trước thì chưa quyết định). 4 con số của khung là theo tháng nên không hiển thị ở 「過去分」. Tab 「サンプル一覧」(danh sách mẫu) không lọc theo tab tháng mà hiển thị toàn bộ thời gian (lọc bằng bộ lọc 「月」(tháng)). **Tháng khi mở là tháng của chu kỳ hôm nay** (nằm trong phạm vi các tab tháng) | Sổ quyết định Z (2026-10-14) |
| 2-19 | **Xuất hàng** do **kho (phía THOMAS)** thực hiện (sổ quyết định AL・2026-10-16 Q188〜Q191・Q193・Q194) | Sổ quyết định AL |

## 3. Những điều chưa quyết định

| # | Nội dung | Trạng thái |
|---|---|---|
| ~~U2~~ | ~~Giá trị thực tế của lead time mẫu~~ | **Đã giải quyết (2026-10-08)**: vận hành nhập tay mỗi lần đăng ký (2-7) |
| ~~U3~~ | ~~Cách tính ngày nhận sớm nhất của mẫu (ước lượng bằng tỉnh/thành → lead time. Yêu cầu dòng 98)~~ | **Đã giải quyết (2026-10-08)**: hệ thống không đề xuất tự động (2-7) |
| U4 | Có dịch chuyển thứ tự các tab tháng (cố định tháng 9〜12) theo ngày hôm nay hay không. Giới hạn 「過去分」 đến bao nhiêu tháng trước (hiện tại là cố định tháng 9〜12 và toàn bộ trước đó) | Cần xác nhận (hong) |
