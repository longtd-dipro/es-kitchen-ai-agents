# Test Cases — Màn TOP: Trang chủ ／ Chi tiết thông báo (E05 Công ty vận chuyển)

> Nguồn: Basic Design nhóm G4 (grp_4_top.json, bảng Figma 31498:194757 và 31498:194740) · SPEC v2 `delivery-partner/SPEC.md` (Flow 4, Screens, AC-14 đến AC-19) · Platform: Web desktop 1440×1024 · Ngôn ngữ UI: tiếng Nhật · [UNCONFIRMED] = TC dựa trên INFERENCE (OQ-12)

## Test Data Reference

| Nhóm | Giá trị cụ thể |
|---|---|
| Tài khoản | OW000123 / Pass1234 (Công ty ABC) |
| Tài xế | DR000001 |
| Lịch tháng này | Ngày 15: 12 đơn đã gán đủ tài xế／Ngày 16: 0 đơn／Ngày 20: 5 đơn trong đó 3 đơn chưa gán tài xế／Ngày 10: 臨時休業／Ngày 12: 休／Ngày 25 đến 31: lễ／nghỉ |
| Thông báo | 「システム更新のお知らせ」 (loại システム更新)、「お知らせA」、「お知らせB」 (loại お知らせ); đăng hôm nay 10:00／hôm nay 09:00／hôm qua 18:00 |
| Báo giá | 2 yêu cầu chưa phản hồi (ngày yêu cầu 2026/10/01, hạn phản hồi 2026/10/15), 1 yêu cầu đã phản hồi |
| Chuỗi tấn công | `<script>alert(1)</script>`、`' OR 1=1--` |
| Message lỗi (INFERENCE) | 「セッションの有効期限が切れました。再度ログインしてください。」／「データの取得に失敗しました。再度お試しください。」／「システムエラーが発生しました。管理者にお問い合わせください。」 |

## OW_HOME_001 — ホーム (Trang chủ)

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| TOPH-001 | Bố cục tổng thể | UI | Medium | BD:OW_HOME_001/+1, BD:OW_HOME_001/+2, BD:OW_HOME_001/+3, BD:OW_HOME_001/+4, BD:OW_HOME_001/A, BD:OW_HOME_001/B, BD:OW_HOME_001/C | [UI Visual] Check màn trang chủ hiển thị đủ 3 khối với tiêu đề tương ứng và sidebar 7 mục ở độ phân giải 1440×1024 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Quan sát toàn bộ màn OW_HOME_001 ở cửa sổ 1440×1024 | 1. Khối lịch hiển thị tiêu đề 「今月の配送スケジュール」<br>2. Khối thông báo hiển thị tiêu đề 「お知らせ」<br>3. Khối báo giá hiển thị tiêu đề 「未回答の見積もり依頼」<br>4. Sidebar hiển thị 7 mục: ホーム, スケジュール, 配送管理, 見積もり管理, 集金・駐車, 配送スタッフ, プロフィール<br>5. Không xuất hiện thanh cuộn ngang | — | Medium |
| TOPH-002 | Lưới lịch | UI | High | BD:OW_HOME_001/A, BD:OW_HOME_001/A.1, BD:OW_HOME_001/A.5, BD:OW_HOME_001/A.6, AC-15, AC-17 | [UI Visual] Check lưới lịch 7 cột có nhãn tuần A／B／C／D với màu tương ứng, ô hôm nay có viền xanh đậm và khoảng ngày lễ có thanh ngang màu đỏ | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; tháng này có đủ 4 tuần A/B/C/D và ngày 25-31 là ngày lễ | 1. Quan sát hàng tiêu đề lưới lịch<br>2. Quan sát ô thuộc từng tuần A, B, C, D và ô tháng trước／sau<br>3. Tìm ô ngày hôm nay<br>4. Tìm hàng chứa ngày 25-31 | 1. Lưới có 7 cột thứ tự Thứ 2 đến Chủ nhật<br>2. Tuần A: nền xanh dương, B: nền xanh lá, C: nền cam, D: nền hồng; ô tháng trước／sau: nền xám<br>3. Ô hôm nay có viền xanh đậm (緑枠), duy nhất 1 ô có viền này<br>4. Hàng ngày 25-31 có thanh ngang màu đỏ | Ngày 25-31: lễ／nghỉ | High |
| TOPH-003 | Danh sách お知らせ | UI | High | BD:OW_HOME_001/B, BD:OW_HOME_001/B.1, BD:OW_HOME_001/B.2, BD:OW_HOME_001/B.3, AC-19 | [UI Visual] Check mỗi dòng trong khối お知らせ hiển thị thời gian tương đối 「今日・HH:mm」 hoặc 「昨日・HH:mm」, badge phân loại và tiêu đề dạng text link | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, khối お知らせ đã tải xong; có thông báo đăng hôm nay 10:00 và hôm qua 18:00 | 1. Quan sát các dòng trong khối お知らせ | 1. Thông báo hôm nay hiển thị 「今日・10:00」<br>2. Thông báo hôm qua hiển thị 「昨日・18:00」<br>3. Mỗi dòng hiển thị badge phân loại<br>4. Tiêu đề hiển thị dạng text link có thể click | Hôm nay 10:00／hôm qua 18:00 | High |
| TOPH-004 | Danh sách 見積もり | UI | Low | BD:OW_HOME_001/C, BD:OW_HOME_001/C.1, BD:OW_HOME_001/C.2, BD:OW_HOME_001/C.3, BD:OW_HOME_001/C.4, E_HOME001_S_001, OQ-05 | [UNCONFIRMED] [UI Visual] Check khối 未回答の見積もり依頼 hiển thị badge 「未回答」, tiêu đề dạng link, ngày yêu cầu và hạn phản hồi dạng yyyy/mm/dd, và link 「見積もり一覧へ」 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; có 2 yêu cầu báo giá chưa phản hồi | 1. Quan sát khối 未回答の見積もり依頼 | 1. Mỗi dòng hiển thị badge 「未回答」<br>2. Tiêu đề yêu cầu hiển thị dạng text link<br>3. Ngày yêu cầu và hạn phản hồi hiển thị đúng dạng yyyy/mm/dd (VD 2026/10/01 và 2026/10/15)<br>4. Link 「見積もり一覧へ」 hiển thị dạng text link | Yêu cầu 2026/10/01／Hạn 2026/10/15 | Low |
| TOPH-005 | Số đơn giao | Logic | High | BD:OW_HOME_001/A.2 | Check ngày có lịch giao hiển thị 「配送：N件」 với N đúng số đơn và ngày không có đơn không hiển thị dòng này | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; ngày 15 có 12 đơn, ngày 16 không có đơn | 1. Quan sát ô ngày 15<br>2. Quan sát ô ngày 16 | 1. Ô ngày 15 hiển thị 「配送：12件」<br>2. Ô ngày 16 không hiển thị 「配送」 và số đơn | Ngày 15: 12 đơn／Ngày 16: 0 đơn | High |
| TOPH-006 | Trạng thái đặc biệt | Logic | High | BD:OW_HOME_001/A.3 | Check ô ngày 臨時休業 hiển thị chữ đỏ 「臨時休業」, ô ngày 休 hiển thị chữ đỏ 「休」 và ô ngày chưa gán tài xế hiển thị chữ cam 「未設定」 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; ngày 10: 臨時休業, ngày 12: 休, ngày 20: chưa gán tài xế | 1. Quan sát ô ngày 10<br>2. Quan sát ô ngày 12<br>3. Quan sát ô ngày 20 | 1. Ô ngày 10 hiển thị nhãn 「臨時休業」 màu đỏ<br>2. Ô ngày 12 hiển thị nhãn 「休」 màu đỏ<br>3. Ô ngày 20 hiển thị nhãn 「未設定」 màu cam | Ngày 10: 臨時休業／Ngày 12: 休／Ngày 20: 未設定 | High |
| TOPH-007 | Badge cảnh báo | Logic | High | BD:OW_HOME_001/A.4, AC-16 | Check badge cảnh báo 「⚠N件」 hiển thị đúng số đơn chưa gán tài xế của ngày đó và không xuất hiện ở ngày đã gán đủ | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; ngày 20 có 5 đơn trong đó 3 chưa gán tài xế, ngày 15 có 12 đơn đã gán đủ | 1. Quan sát ô ngày 20<br>2. Quan sát ô ngày 15 | 1. Ô ngày 20 hiển thị badge đỏ 「⚠3件」, không phải 「⚠5件」<br>2. Ô ngày 15 không hiển thị badge 「⚠N件」 | Ngày 20: 5 đơn 3 chưa gán／Ngày 15: 12 đơn đã gán | High |
| TOPH-008 | Badge cảnh báo | Behavior | Medium | BD:OW_HOME_001/A.4 | Check badge cảnh báo 「⚠N件」 biến mất ở ô ngày 20 sau khi đơn chưa gán cuối cùng được gán tài xế | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; ngày 20 có 1 đơn chưa gán tài xế | 1. Gán tài xế DR000001 cho đơn chưa gán của ngày 20 ở màn OW_DLVR_002<br>2. Quay lại OW_HOME_001 và tải lại<br>3. Quan sát ô ngày 20 | 1. Ô ngày 20 không còn hiển thị badge 「⚠N件」 | Tài xế DR000001 | Medium |
| TOPH-009 | Đánh dấu hôm nay | Logic | High | BD:OW_HOME_001/A.5, AC-15 | Check chỉ duy nhất 1 ô trong lưới lịch có viền xanh đậm đánh dấu ngày hôm nay | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Đếm số ô có viền xanh đậm (緑枠) trên toàn lưới lịch | 1. Chỉ có đúng 1 ô có viền xanh đậm<br>2. Ô đó trùng với ngày hệ thống hiện tại | — | High |
| TOPH-010 | Ô lịch (click) | Navigation | Critical | BD:OW_HOME_001/A.7, AC-18 | Check click vào ô ngày 15 chuyển sang màn lịch tuần OW_SCHD_002 hiển thị tuần chứa ngày 15 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Click vào ô ngày 15 trên lưới lịch | 1. Chuyển sang màn OW_SCHD_002 (dạng tuần)<br>2. Tuần hiển thị là tuần chứa ngày 15<br>3. Không hiển thị dạng lịch tháng | Ngày 15 | Critical |
| TOPH-011 | Liên kết スケジュールへ | Navigation | Critical | BD:OW_HOME_001/A.8 | Check click link 「スケジュールへ」 chuyển sang màn lịch tháng OW_SCHD_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Click link 「スケジュールへ」 trong khối lịch | 1. Chuyển sang màn OW_SCHD_001 | — | Critical |
| TOPH-012 | Danh sách お知らせ | Logic | High | BD:OW_HOME_001/B, AC-19 | Check danh sách お知らせ hiển thị theo thứ tự mới nhất đến cũ nhất | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, khối お知らせ đã tải xong; có 3 thông báo đăng hôm nay 10:00, hôm nay 09:00, hôm qua 18:00 | 1. Quan sát thứ tự các dòng trong khối お知らせ | 1. Dòng đầu tiên: thông báo 今日・10:00<br>2. Dòng thứ hai: thông báo 今日・09:00<br>3. Dòng thứ ba: thông báo 昨日・18:00 | Hôm nay 10:00, 09:00／hôm qua 18:00 | High |
| TOPH-013 | Tiêu đề thông báo | Navigation | Critical | BD:OW_HOME_001/B.3, AC-19 | Check click tiêu đề thông báo 「システム更新のお知らせ」 chuyển sang OW_ANNO_002 hiển thị đúng thông báo đó | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; có thông báo 「システム更新のお知らせ」 | 1. Click tiêu đề 「システム更新のお知らせ」 trong khối お知らせ | 1. Chuyển sang màn OW_ANNO_002<br>2. Màn hiển thị tiêu đề 「システム更新のお知らせ」 | Thông báo: システム更新のお知らせ | Critical |
| TOPH-014 | Tiêu đề thông báo | Security | High | BD:OW_HOME_001/B.3 | Check tiêu đề thông báo chứa thẻ script hiển thị dạng ký tự văn bản và không thực thi mã | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, khối お知らせ đã tải xong; ES admin đã đăng thông báo có tiêu đề `<script>alert(1)</script>` | 1. Quan sát dòng thông báo có tiêu đề chứa thẻ script | 1. Hiển thị chuỗi `<script>alert(1)</script>` dạng ký tự văn bản<br>2. Không xuất hiện hộp thoại alert | `<script>alert(1)</script>` | High |
| TOPH-015 | Tải độc lập | Behavior | High | BD:OW_HOME_001/A, BD:OW_HOME_001/B, BD:OW_HOME_001/C | Check khối lịch hiển thị dữ liệu ngay khi tải xong mà không chờ khối お知らせ đang chậm và lỗi 1 khối không ảnh hưởng khối khác | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), API お知らせ trả chậm 5 giây, API lịch bình thường | 1. Mở màn OW_HOME_001<br>2. Quan sát các khối trong 5 giây đầu | 1. Khối lịch hiển thị dữ liệu trước khi khối お知らせ hoàn tất<br>2. Khối お知らせ hiển thị sau khi API trả về<br>3. Lỗi 1 khối không làm mất dữ liệu khối còn lại | API お知らせ: chậm 5s | High |
| TOPH-016 | Badge phân loại | Logic | Medium | BD:OW_HOME_001/B.2 | Check thông báo loại システム更新 hiển thị badge 「システム更新」 và thông báo loại お知らせ hiển thị badge 「お知らせ」 với màu khác nhau | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, khối お知らせ đã tải xong; có cả 2 loại thông báo | 1. Quan sát badge của thông báo loại システム更新<br>2. Quan sát badge của thông báo loại お知らせ | 1. Thông báo loại cập nhật hệ thống hiển thị badge 「システム更新」<br>2. Thông báo thường hiển thị badge 「お知らせ」<br>3. Màu 2 badge khác nhau | — | Medium |
| TOPH-017 | Lỗi hết phiên | Behavior | High | BD:OW_HOME_001/A, E_HOME001_S_001 | [UNCONFIRMED] Check thao tác trên màn trang chủ sau khi phiên hết hạn hiển thị full screen thông báo hết phiên | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; JWT đã hết hạn | 1. Click vào ô lịch khi JWT đã hết hạn | 1. Hiển thị full screen với message 「セッションの有効期限が切れました。再度ログインしてください。」<br>2. Không chuyển sang OW_SCHD_002 | JWT hết hạn | High |
| TOPH-018 | Lỗi mất mạng | Behavior | High | BD:OW_HOME_001/A, E_HOME001_E_001 | [UNCONFIRMED] Check mất mạng khi tải màn trang chủ hiển thị banner lỗi và người dùng ở lại OW_HOME_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), ngắt mạng trước khi tải | 1. Ngắt mạng<br>2. Tải lại màn OW_HOME_001 bằng F5 | 1. Hiển thị banner với message 「データの取得に失敗しました。再度お試しください。」<br>2. Vẫn ở lại OW_HOME_001 | Mất mạng | High |
| TOPH-019 | Lỗi hệ thống | Behavior | High | BD:OW_HOME_001/A, E_HOME001_S_002 | [UNCONFIRMED] Check API lịch trả lỗi 500 hiển thị banner lỗi hệ thống trong khi khối お知らせ vẫn hiển thị bình thường | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), API lịch trả HTTP 500, API お知らせ bình thường | 1. Mở màn OW_HOME_001 | 1. Hiển thị banner với message 「システムエラーが発生しました。管理者にお問い合わせください。」<br>2. Khối お知らせ vẫn hiển thị dữ liệu bình thường | API lịch: HTTP 500 | High |

## OW_ANNO_002 — お知らせ詳細 (Chi tiết thông báo)

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| TOPA-001 | Layout chi tiết | UI | High | BD:OW_ANNO_002/1, BD:OW_ANNO_002/2, BD:OW_ANNO_002/3, BD:OW_ANNO_002/4, BD:OW_ANNO_002/5 | [UI Visual] Check màn chi tiết thông báo hiển thị đủ 5 thành phần: badge phân loại, ngày giờ đăng, tiêu đề, nội dung và link 「一覧に戻る」 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002 mở từ thông báo 「システム更新のお知らせ」 | 1. Quan sát toàn bộ màn OW_ANNO_002 | 1. Badge phân loại hiển thị ở đầu màn<br>2. Ngày giờ đăng hiển thị<br>3. Tiêu đề thông báo hiển thị<br>4. Nội dung thông báo hiển thị<br>5. Link 「一覧に戻る」 hiển thị dạng text link | — | High |
| TOPA-002 | Ngày giờ đăng | Logic | High | BD:OW_ANNO_002/2 | Check ngày giờ đăng hiển thị đúng dạng 「yyyy年M月d日 HH:mm」 với tháng và ngày một chữ số không có số 0 đứng đầu | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002 mở từ thông báo đăng ngày 2026-01-05 lúc 07:05 | 1. Quan sát phần ngày giờ đăng | 1. Hiển thị 「2026年1月5日 07:05」 (tháng và ngày không có số 0 đứng đầu, giờ phút có số 0 đứng đầu) | Đăng 2026-01-05 07:05 | High |
| TOPA-003 | Tiêu đề | Logic | High | BD:OW_ANNO_002/3 | Check tiêu đề thông báo hiển thị đúng tiêu đề đã chọn từ trang chủ và không thể sửa | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002 mở từ thông báo 「システム更新のお知らせ」 | 1. Quan sát tiêu đề<br>2. Double-click vào tiêu đề và gõ ký tự bất kỳ | 1. Tiêu đề hiển thị 「システム更新のお知らせ」 đúng với thông báo đã chọn<br>2. Không xuất hiện ô nhập, tiêu đề không thay đổi | システム更新のお知らせ | High |
| TOPA-004 | Nội dung | Behavior | High | BD:OW_ANNO_002/4 | Check nội dung hiển thị rich text gồm tiêu đề phụ 「■」, danh sách 「・」, chữ đậm và nội dung dài cuộn được; nội dung chỉ đọc | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002; nội dung thông báo có dòng 「■メンテナンス日時」, dòng 「・2026年10月10日」, đoạn chữ đậm và tổng cộng 50 dòng | 1. Quan sát phần nội dung<br>2. Cuộn xuống cuối nội dung<br>3. Double-click vào nội dung và gõ ký tự bất kỳ | 1. Dòng 「■メンテナンス日時」 hiển thị dạng tiêu đề phụ<br>2. Dòng 「・2026年10月10日」 hiển thị dạng danh sách<br>3. Đoạn chữ đậm hiển thị đậm<br>4. Cuộn xuống được xem toàn bộ 50 dòng<br>5. Không xuất hiện chế độ sửa khi double-click | Nội dung 50 dòng | High |
| TOPA-005 | Bảo mật nội dung | Security | High | BD:OW_ANNO_002/3, BD:OW_ANNO_002/4 | Check tiêu đề và nội dung thông báo chứa thẻ script hiển thị dạng ký tự văn bản và không thực thi mã | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, thông báo có tiêu đề và nội dung chứa `<script>alert(1)</script>` | 1. Mở thông báo đó từ trang chủ<br>2. Quan sát tiêu đề và nội dung | 1. Tiêu đề hiển thị chuỗi `<script>alert(1)</script>` dạng văn bản<br>2. Nội dung hiển thị chuỗi script dạng văn bản<br>3. Không xuất hiện hộp thoại alert | `<script>alert(1)</script>` | High |
| TOPA-006 | Badge phân loại | Logic | Medium | BD:OW_ANNO_002/1, BD:OW_HOME_001/B.2, OQ-06 | Check badge phân loại ở màn chi tiết trùng tên và màu với badge của cùng thông báo đó ở trang chủ | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002 mở từ thông báo 「システム更新のお知らせ」 | 1. Ghi lại tên và màu badge ở màn OW_ANNO_002<br>2. Click 「一覧に戻る」 để về OW_HOME_001<br>3. Quan sát badge của cùng thông báo đó trong khối お知らせ | 1. Badge ở OW_ANNO_002 và badge ở OW_HOME_001 có cùng tên phân loại<br>2. Màu badge giống nhau ở cả 2 màn | — | Medium |
| TOPA-007 | Liên kết 一覧に戻る | Navigation | Critical | BD:OW_ANNO_002/5 | Check click link 「一覧に戻る」 chuyển về màn trang chủ OW_HOME_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002 mở từ thông báo 「システム更新のお知らせ」 | 1. Click link 「一覧に戻る」 | 1. Chuyển sang màn OW_HOME_001<br>2. 3 khối (lịch, お知らせ, báo giá) hiển thị bình thường | — | Critical |
| TOPA-008 | Lỗi hết phiên | Behavior | High | BD:OW_ANNO_002/4, E_ANNO002_S_001 | [UNCONFIRMED] Check mở màn chi tiết thông báo sau khi phiên hết hạn hiển thị full screen thông báo hết phiên | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_HOME_001, 3 khối đã tải xong; JWT đã hết hạn sau khi trang chủ tải | 1. Click tiêu đề một thông báo trong khối お知らせ | 1. Hiển thị full screen với message 「セッションの有効期限が切れました。再度ログインしてください。」<br>2. Không hiển thị nội dung chi tiết thông báo | JWT hết hạn | High |
| TOPA-009 | Lỗi mất mạng | Behavior | High | BD:OW_ANNO_002/4, E_ANNO002_E_001 | [UNCONFIRMED] Check mất mạng khi tải nội dung chi tiết thông báo hiển thị banner lỗi và ở lại màn | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_HOME_001; ngắt mạng sau khi trang chủ tải | 1. Ngắt mạng<br>2. Click tiêu đề một thông báo | 1. Hiển thị banner với message 「データの取得に失敗しました。再度お試しください。」<br>2. Ở lại màn, không hiển thị nội dung chi tiết | Mất mạng | High |
| TOPA-010 | Lỗi hệ thống | Behavior | High | BD:OW_ANNO_002/4, E_ANNO002_S_002 | [UNCONFIRMED] Check API chi tiết thông báo trả lỗi 500 hiển thị banner lỗi hệ thống và link 「一覧に戻る」 vẫn dùng được | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_HOME_001, 3 khối đã tải xong; API chi tiết thông báo trả HTTP 500 | 1. Click tiêu đề một thông báo | 1. Hiển thị banner với message 「システムエラーが発生しました。管理者にお問い合わせください。」<br>2. Link 「一覧に戻る」 vẫn hiển thị và dùng được | API chi tiết: HTTP 500 | High |

## Navigation — Màn TOP (Trang chủ ／ Chi tiết thông báo)

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
|---|---|---|---|---|---|---|---|---|---|---|
| TOPNAV-001 | Login → HOME | Navigation | Critical | AC-14, SPEC:Flow 1 | Check đăng nhập thành công chuyển sang trang chủ OW_HOME_001 với 3 khối hiển thị | Chưa đăng nhập, đang ở màn OW_AUTH_001 | 1. Nhập ログインID 「OW000123」 và mật khẩu 「Pass1234」<br>2. Nhấn nút ログイン | 1. Mở màn OW_HOME_001<br>2. 3 khối (lịch, お知らせ, báo giá) đang tải hoặc đã tải xong | OW000123 / Pass1234 | Critical |
| TOPNAV-002 | Reset PW → HOME | Navigation | Critical | AC-14, SPEC:Flow 3 | Check hoàn tất đặt lại mật khẩu rồi nhấn nút về màn hình chính mở trang chủ mà không yêu cầu đăng nhập lại | Tài khoản OW000123 đã hoàn tất bước 3 đặt lại mật khẩu, đang ở bước 4 hoàn tất trên OW_AUTH_002 | 1. Nhấn nút về màn hình chính ở bước 4 | 1. Mở màn OW_HOME_001<br>2. Không hiển thị màn đăng nhập, không yêu cầu nhập lại ログインID và mật khẩu | OW000123 | Critical |
| TOPNAV-003 | Cell click → SCHD_002 | Navigation | Critical | BD:OW_HOME_001/A.7, AC-18 | Check click ô lịch ngày 15 chuyển sang lịch tuần OW_SCHD_002 hiển thị tuần chứa ngày 15 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Click ô ngày 15 trên lưới lịch | 1. Mở OW_SCHD_002 (dạng tuần)<br>2. Tuần hiển thị chứa ngày 15<br>3. Không hiển thị dạng lịch tháng | Ngày 15 | Critical |
| TOPNAV-004 | Cell tháng trước → SCHD_002 | Navigation | High | BD:OW_HOME_001/A.7 | Check click ô thuộc tháng trước ở tuần đầu lưới lịch chuyển sang OW_SCHD_002 chứa đúng ngày đó | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; tuần đầu có ô thuộc tháng trước | 1. Click vào ô ngày thuộc tháng trước ở tuần đầu lưới lịch | 1. Mở OW_SCHD_002<br>2. Tuần hiển thị chứa đúng ngày vừa click thuộc tháng trước | — | High |
| TOPNAV-005 | スケジュールへ → SCHD_001 | Navigation | Critical | BD:OW_HOME_001/A.8 | Check click link 「スケジュールへ」 chuyển sang màn lịch tháng OW_SCHD_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Click link 「スケジュールへ」 trong khối lịch | 1. Mở màn OW_SCHD_001 | — | Critical |
| TOPNAV-006 | Title → ANNO_002 | Navigation | Critical | BD:OW_HOME_001/B.3, AC-19 | Check click tiêu đề thông báo chuyển sang OW_ANNO_002 với badge, ngày giờ đăng và tiêu đề trùng thông báo đã chọn | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; có thông báo 「システム更新のお知らせ」 | 1. Click tiêu đề 「システム更新のお知らせ」 trong khối お知らせ | 1. Mở OW_ANNO_002<br>2. Tiêu đề hiển thị 「システム更新のお知らせ」<br>3. Badge phân loại và ngày giờ đăng trùng với thông báo đã chọn | システム更新のお知らせ | Critical |
| TOPNAV-007 | 一覧に戻る → HOME | Navigation | Critical | BD:OW_ANNO_002/5 | Check click 「一覧に戻る」 quay về trang chủ OW_HOME_001 với 3 khối hiển thị đầy đủ | Đã đăng nhập bằng tài khoản OW000123 / Pass1234, đang ở màn OW_ANNO_002 mở từ thông báo 「システム更新のお知らせ」 | 1. Click link 「一覧に戻る」 | 1. Mở OW_HOME_001<br>2. 3 khối (lịch, お知らせ, báo giá) hiển thị bình thường | — | Critical |
| TOPNAV-008 | Mở thông báo thứ hai | Navigation | Medium | BD:OW_HOME_001/B.3 | Check mở thông báo thứ hai sau khi quay về trang chủ từ thông báo thứ nhất hiển thị đúng nội dung thông báo thứ hai | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; có 2 thông báo 「お知らせA」 và 「お知らせB」 | 1. Click tiêu đề 「お知らせA」<br>2. Click 「一覧に戻る」<br>3. Click tiêu đề 「お知らせB」 | 1. OW_ANNO_002 hiển thị đúng tiêu đề 「お知らせB」<br>2. Không hiển thị nội dung của 「お知らせA」 | お知らせA／お知らせB | Medium |
| TOPNAV-009 | Sidebar 5 mục → màn đích | Navigation | High | SPEC:Screens | Check click lần lượt 5 mục sidebar điều hướng đúng đến OW_SCHD_001, OW_DLVR_001, OW_CLCT_001, OW_STAF_001, OW_PROF_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Click mục 「スケジュール」 trong sidebar, quan sát màn đích, nhấn Back<br>2. Click mục 「配送管理」, quan sát, nhấn Back<br>3. Click mục 「集金・駐車」, quan sát, nhấn Back<br>4. Click mục 「配送スタッフ」, quan sát, nhấn Back<br>5. Click mục 「プロフィール」, quan sát | 1. 「スケジュール」 → OW_SCHD_001<br>2. 「配送管理」 → OW_DLVR_001<br>3. 「集金・駐車」 → OW_CLCT_001<br>4. 「配送スタッフ」 → OW_STAF_001<br>5. 「プロフィール」 → OW_PROF_001 | — | High |
| TOPNAV-010 | ホーム active | Logic | Medium | SPEC:Screens | Check mục 「ホーム」 trong sidebar hiển thị trạng thái active khi đang ở màn trang chủ | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Quan sát sidebar | 1. Mục 「ホーム」 hiển thị trạng thái active (tô sáng hoặc kiểu visual khác các mục còn lại) | — | Medium |
| TOPNAV-011 | Back từ SCHD_002 → HOME | Navigation | High | BD:OW_HOME_001/A.7 | Check nút Back của trình duyệt từ màn lịch tuần OW_SCHD_002 quay về trang chủ OW_HOME_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_SCHD_002 điều hướng từ ô ngày 15 | 1. Nhấn nút Back của trình duyệt | 1. Quay về OW_HOME_001<br>2. 3 khối hiển thị bình thường | — | High |
| TOPNAV-012 | Back từ ANNO_002 → HOME | Navigation | High | BD:OW_HOME_001/B.3 | Check nút Back của trình duyệt từ màn chi tiết thông báo OW_ANNO_002 quay về trang chủ OW_HOME_001 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_ANNO_002 mở từ 「システム更新のお知らせ」 | 1. Nhấn nút Back của trình duyệt | 1. Quay về OW_HOME_001<br>2. Danh sách お知らせ vẫn hiển thị thứ tự mới nhất đến cũ nhất | — | High |
| TOPNAV-013 | F5 reload HOME | Navigation | Medium | BD:OW_HOME_001/A | Check tải lại bằng F5 ở trang chủ vẫn ở OW_HOME_001 và 3 khối được tải lại | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong | 1. Nhấn F5 | 1. Vẫn ở OW_HOME_001<br>2. 3 khối được tải lại và hiển thị dữ liệu | — | Medium |
| TOPNAV-014 | Session + cell click | Behavior | High | BD:OW_HOME_001/A.7, E_HOME001_S_001 | [UNCONFIRMED] Check click ô lịch khi phiên đã hết hạn hiển thị full screen hết phiên và không mở OW_SCHD_002 | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; JWT hết hạn sau khi trang đã tải | 1. Click ô ngày 15 khi JWT đã hết hạn | 1. Hiển thị full screen với message 「セッションの有効期限が切れました。再度ログインしてください。」<br>2. Không mở OW_SCHD_002 | JWT hết hạn | High |
| TOPNAV-015 | E2E lịch | Integration | Critical | BD:OW_HOME_001/A.7, BD:OW_HOME_001/A.8, AC-18 | Check luồng đăng nhập, mở trang chủ, sang lịch tuần bằng click ô, nhấn Back về trang chủ rồi sang lịch tháng bằng link | Chưa đăng nhập, đang ở màn OW_AUTH_001 | 1. Đăng nhập bằng OW000123 / Pass1234<br>2. Click ô ngày 15<br>3. Nhấn nút Back của trình duyệt<br>4. Click link 「スケジュールへ」 | 1. Sau bước 1: mở OW_HOME_001<br>2. Sau bước 2: mở OW_SCHD_002 chứa ngày 15<br>3. Sau bước 3: quay về OW_HOME_001<br>4. Sau bước 4: mở OW_SCHD_001 | OW000123 / Pass1234 | Critical |
| TOPNAV-016 | E2E thông báo | Integration | Critical | BD:OW_HOME_001/B.3, BD:OW_ANNO_002/5, AC-19 | Check luồng mở chi tiết thông báo từ trang chủ, đọc đầy đủ 4 thành phần rồi click 「一覧に戻る」 về trang chủ | Đã đăng nhập bằng tài khoản OW000123 / Pass1234 (Công ty ABC), đang ở màn OW_HOME_001, 3 khối đã tải xong; có thông báo 「システム更新のお知らせ」 | 1. Click tiêu đề 「システム更新のお知らせ」<br>2. Kiểm tra badge, ngày giờ đăng, tiêu đề và nội dung<br>3. Click 「一覧に戻る」 | 1. Mở OW_ANNO_002 với đúng thông báo<br>2. Cả 4 thành phần (badge, ngày giờ, tiêu đề, nội dung) hiển thị đủ<br>3. Quay về OW_HOME_001 | システム更新のお知らせ | Critical |

## Navigation Matrix

| From | Via | To | TC ID |
|---|---|---|---|
| OW_AUTH_001 | Đăng nhập thành công | OW_HOME_001 | TOPNAV-001 |
| OW_AUTH_002 | Hoàn tất đặt lại mật khẩu | OW_HOME_001 | TOPNAV-002 |
| OW_HOME_001 | Click ô ngày lịch | OW_SCHD_002 | TOPH-010, TOPNAV-003, TOPNAV-004 |
| OW_HOME_001 | Click 「スケジュールへ」 | OW_SCHD_001 | TOPH-011, TOPNAV-005 |
| OW_HOME_001 | Click tiêu đề thông báo | OW_ANNO_002 | TOPH-013, TOPNAV-006 |
| OW_HOME_001 | Click sidebar スケジュール | OW_SCHD_001 | TOPNAV-009 |
| OW_HOME_001 | Click sidebar 配送管理 | OW_DLVR_001 | TOPNAV-009 |
| OW_HOME_001 | Click sidebar 集金・駐車 | OW_CLCT_001 | TOPNAV-009 |
| OW_HOME_001 | Click sidebar 配送スタッフ | OW_STAF_001 | TOPNAV-009 |
| OW_HOME_001 | Click sidebar プロフィール | OW_PROF_001 | TOPNAV-009 |
| OW_SCHD_002 | Browser Back | OW_HOME_001 | TOPNAV-011 |
| OW_ANNO_002 | Click 「一覧に戻る」 | OW_HOME_001 | TOPA-007, TOPNAV-007 |
| OW_ANNO_002 | Browser Back | OW_HOME_001 | TOPNAV-012 |

## Coverage Matrix

| AC / BD Item | TC ID |
|---|---|
| AC-14 (Home sau đăng nhập) | TOPNAV-001, TOPNAV-002 |
| AC-15 (Highlight ngày hôm nay) | TOPH-002, TOPH-009 |
| AC-16 (Badge cảnh báo đơn chưa gán) | TOPH-007 |
| AC-17 (Màu tuần A/B/C/D) | TOPH-002 |
| AC-18 (Click ô → lịch tuần) | TOPH-010, TOPNAV-003, TOPNAV-015 |
| AC-19 (Click tiêu đề → chi tiết thông báo) | TOPH-013, TOPNAV-006, TOPNAV-016 |
| BD:OW_HOME_001/A | TOPH-001, TOPH-015, TOPH-017, TOPH-018, TOPH-019, TOPNAV-013 |
| BD:OW_HOME_001/A.1 | TOPH-002 |
| BD:OW_HOME_001/A.2 | TOPH-005 |
| BD:OW_HOME_001/A.3 | TOPH-006 |
| BD:OW_HOME_001/A.4 | TOPH-007, TOPH-008 |
| BD:OW_HOME_001/A.5 | TOPH-002, TOPH-009 |
| BD:OW_HOME_001/A.6 | TOPH-002 |
| BD:OW_HOME_001/A.7 | TOPH-010, TOPNAV-003, TOPNAV-004, TOPNAV-011, TOPNAV-014, TOPNAV-015 |
| BD:OW_HOME_001/A.8 | TOPH-011, TOPNAV-005, TOPNAV-015 |
| BD:OW_HOME_001/B | TOPH-003, TOPH-012, TOPH-015 |
| BD:OW_HOME_001/B.1 | TOPH-003 |
| BD:OW_HOME_001/B.2 | TOPH-003, TOPH-016 |
| BD:OW_HOME_001/B.3 | TOPH-003, TOPH-013, TOPNAV-006, TOPNAV-008, TOPNAV-012, TOPNAV-016 |
| BD:OW_HOME_001/C | TOPH-004 |
| BD:OW_HOME_001/C.1 | TOPH-004 |
| BD:OW_HOME_001/C.2 | TOPH-004 |
| BD:OW_HOME_001/C.3 | TOPH-004 |
| BD:OW_HOME_001/C.4 | TOPH-004 |
| BD:OW_HOME_001/+1 | TOPH-001 |
| BD:OW_HOME_001/+2 | TOPH-001 |
| BD:OW_HOME_001/+3 | TOPH-001 |
| BD:OW_HOME_001/+4 | TOPH-001 |
| BD:OW_ANNO_002/1 | TOPA-001, TOPA-006 |
| BD:OW_ANNO_002/2 | TOPA-001, TOPA-002 |
| BD:OW_ANNO_002/3 | TOPA-001, TOPA-003, TOPA-005 |
| BD:OW_ANNO_002/4 | TOPA-001, TOPA-004, TOPA-005, TOPA-008, TOPA-009, TOPA-010 |
| BD:OW_ANNO_002/5 | TOPA-001, TOPA-007, TOPNAV-007, TOPNAV-016 |
| E_HOME001_S_001 | TOPH-004, TOPH-017, TOPNAV-014 |
| E_HOME001_E_001 | TOPH-018 |
| E_HOME001_S_002 | TOPH-019 |
| E_ANNO002_S_001 | TOPA-008 |
| E_ANNO002_E_001 | TOPA-009 |
| E_ANNO002_S_002 | TOPA-010 |

## Not Covered

Các TC bị loại khỏi file rút gọn (từ 129 TC → 45 TC) và lý do:

| Loại | Nội dung đã loại | Lý do loại |
|---|---|---|
| UI Visual dư | 6 TC kiểm riêng từng màu tuần A, B, C, D, ô tháng trước, ô tháng sau | Gộp vào TOPH-002 (1 TC layout lưới lịch tổng thể) |
| UI Visual dư | 4 TC kiểm riêng từng trạng thái đặc biệt (臨時休業, 休, 祝/lễ, 未設定 màu) | Gộp vào TOPH-006 |
| Navigation dư | TC double-click ô lịch, hover tooltip ngày, click ngày tháng sau trên lịch | BRIEF_TC2 rule 5: bỏ double-click, hover trang trí |
| Navigation dư | TC reload F5 từ OW_ANNO_002, TC forward-navigation (Alt+Right) | Không có evidence trong Basic Design |
| Behavior dư | TC loading skeleton hiển thị khi 3 khối đang tải | BRIEF_TC2 rule 5: bỏ loading skeleton |
| Behavior dư | TC kiểm badge 「⚠N件」 update realtime mà không cần reload | Không có evidence về realtime trong BD; không có message code |
| UNCONFIRMED / UNKNOWN | TC click link 見積もり管理 (C.1) sang màn quản lý báo giá | OQ-05: 見積もり管理 nằm ngoài phạm vi nhóm G4; chỉ giữ TC hiển thị UI (TOPH-004) |
| UNCONFIRMED / UNKNOWN | TC đổi tháng lịch bằng nút ← → trên lưới | BD không có item nào cho nút điều hướng tháng; item A và A.1-A.8 không đề cập |
| Compatibility | TC kiểm trên Firefox, Safari, Edge | BRIEF_TC2 rule 2: bỏ so sánh trình duyệt |
| Accessibility | TC keyboard navigation, focus order, ARIA label | Không có trong AC và Basic Design |
