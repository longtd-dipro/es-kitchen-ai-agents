# Test Cases — Quản lý Profile (E05 Công ty vận chuyển)
> Nguồn: Basic Design JSON grp_9_profile.json · Platform: Web desktop 1440×1024 · Ngôn ngữ UI: tiếng Nhật · [UNCONFIRMED] = TC dựa trên INFERENCE (OQ-14/OQ-12)

## Test Data Reference

| Nhóm | Giá trị cụ thể |
| --- | --- |
| Tài khoản hợp lệ | OW000123 / Pass1234 |
| ID đơn vị | DE000001 |
| Tên công ty hợp lệ | Công ty ABC |
| Tên 50 ký tự (biên max) | AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEE |
| Tên 51 ký tự (max+1) | AAAAAAAAAABBBBBBBBBBCCCCCCCCCCDDDDDDDDDDEEEEEEEEEEF |
| カナ hợp lệ | コンパニーエービーシー |
| カナ half-width sai | ｺﾝﾊﾟﾆｰ (katakana half-width) |
| Mã bưu điện hợp lệ | 1000001 |
| Mã bưu điện sai (6 chữ số) | 100000 |
| Mã bưu điện không tồn tại | 0000000 |
| Tỉnh/thành | 東京都 |
| Quận/huyện | 千代田区 |
| Khu vực / số nhà | 大手町1-1 |
| SĐT hợp lệ 10 chữ số | 090-0000-0000 |
| SĐT hợp lệ 11 chữ số | 0120-000-0000 |
| SĐT sai 9 chữ số | 090-000-000 |
| FAX hợp lệ | 03-0000-0000 |
| FAX sai 9 chữ số | 03-000-000 |
| Tên nhân viên hợp lệ | 山田太郎 |
| Tên nhân viên 50 ký tự | 山田太郎AAAAAABBBBBBCCCCCCDDDDDDEEEEEEFFFFGGGGHHHHIIII |
| Tên nhân viên 51 ký tự | 山田太郎AAAAAABBBBBBCCCCCCDDDDDDEEEEEEFFFFGGGGHHHH太郎太 |
| Email hợp lệ | user_a@example.com |
| Email sai định dạng | notanemail |
| Email 257 ký tự | Chuỗi email hợp lệ về định dạng nhưng có phần local 250 ký tự — tạo khi test: 250 ký tự 'a' + @b.com |
| Email trùng | user_b@example.com (email đã tồn tại trong hệ thống) |
| XSS payload | `<script>alert(1)</script>` |
| SQLi payload | `' OR 1=1--` |

## OW_PROF_001 — プロフィール（基本情報）

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRB-001 | OW_PROF_001 — Layout tổng thể (chế độ xem) | UI | Medium | BD:OW_PROF_001/1, BD:OW_PROF_001/2, BD:OW_PROF_001/3, BD:OW_PROF_001/4, BD:OW_PROF_001/6, BD:OW_PROF_001/7, BD:OW_PROF_001/8, BD:OW_PROF_001/9, BD:OW_PROF_001/10, BD:OW_PROF_001/11, BD:OW_PROF_001/12, BD:OW_PROF_001/15, BD:OW_PROF_001/+8, BD:OW_PROF_001/+9 | [UI Visual] Check tất cả phần tử hiển thị đúng ở chế độ xem OW_PROF_001 | Đã đăng nhập; đang ở OW_PROF_001 chế độ xem | 1. Mở sidebar → chọn プロフィール<br>2. Quan sát toàn màn | 1. Tab 基本情報 active; 2. Hiện nút 編集 góc phải; 3. Tất cả field (ID, tên, カナ, mã bưu điện, tỉnh, quận, khu vực, tòa nhà, SĐT, FAX) ở trạng thái read-only; 4. Bảng 担当者 hiển thị cột 区分/担当者名/フリガナ/メールアドレス/TEL; 5. Tab 配送対応情報 hiển thị cạnh tab đang active | — | Medium |
| PRB-002 | OW_PROF_001 — Textbox states (chế độ sửa) | UI | Medium | BD:OW_PROF_001/2, BD:OW_PROF_001/3, BD:OW_PROF_001/4, BD:OW_PROF_001/7, BD:OW_PROF_001/8, BD:OW_PROF_001/9, BD:OW_PROF_001/10, BD:OW_PROF_001/11, BD:OW_PROF_001/+2, BD:OW_PROF_001/+3, BD:OW_PROF_001/+4, BD:OW_PROF_001/+5 | [UI Visual] Check trạng thái Normal, Focus và Error của các ô nhập văn bản ở chế độ sửa | Đã đăng nhập; đang ở OW_PROF_001 chế độ xem | 1. Nhấn 編集<br>2. Quan sát ô 委託配送先名 trạng thái Normal<br>3. Click vào ô → quan sát trạng thái Focus<br>4. Xóa nội dung ô → nhấn 保存 → quan sát trạng thái Error | 1. Normal: viền mặc định, text hiện giá trị đã lưu; 2. Focus: viền highlight, cursor hiển thị; 3. Error: viền đỏ, message lỗi hiện dưới ô | — | Medium |
| PRB-003 | OW_PROF_001 — Dropdown states (chế độ sửa) | UI | Medium | BD:OW_PROF_001/6, BD:OW_PROF_001/+1 | [UI Visual] Check trạng thái Normal và Open của Dropdown 都道府県 và 区分 ở chế độ sửa | Đã đăng nhập; OW_PROF_001 chế độ xem | 1. Nhấn 編集<br>2. Quan sát dropdown 都道府県 trạng thái Normal (đóng)<br>3. Click mở dropdown → quan sát danh sách | 1. Normal: hiển thị giá trị đã lưu; 2. Open: danh sách 47 tỉnh/thành hiện bên dưới, có thể chọn | — | Medium |
| PRB-004 | OW_PROF_001 — Button hiện/ẩn theo chế độ | UI | Medium | BD:OW_PROF_001/5, BD:OW_PROF_001/13, BD:OW_PROF_001/14, BD:OW_PROF_001/15 | [UI Visual] Check button 住所検索, キャンセル, 保存, 編集 hiện/ẩn đúng theo chế độ xem và sửa | Đã đăng nhập; OW_PROF_001 chế độ xem | 1. Quan sát chế độ xem: kiểm nút 編集 hiện, nút キャンセル/保存/住所検索 ẩn<br>2. Nhấn 編集<br>3. Quan sát chế độ sửa: kiểm nút 編集 ẩn, nút キャンセル/保存 hiện header góc phải, 住所検索 hiện cạnh mã bưu điện | 1. Chế độ xem: chỉ 編集 hiện; 2. Chế độ sửa: 編集 ẩn, キャンセル + 保存 hiện ở header góc phải trên, 住所検索 hiện | — | Medium |
| PRB-005 | OW_PROF_001 — Table 担当者 states | UI | Medium | BD:OW_PROF_001/12, BD:OW_PROF_001/+6, BD:OW_PROF_001/+7 | [UI Visual] Check bảng 担当者 hiển thị đúng 5 cột và switch xem/sửa | Đã đăng nhập; OW_PROF_001 chế độ xem có ít nhất 1 dòng メイン担当者 | 1. Quan sát bảng chế độ xem: kiểm 5 cột, không có icon xóa, không có nút thêm<br>2. Nhấn 編集<br>3. Quan sát bảng chế độ sửa: kiểm input trong ô, icon 削除 và nút 行を追加 hiện | 1. Xem: 5 cột read-only (区分/担当者名/フリガナ/メールアドレス/TEL), email dài hiện 「…」; 2. Sửa: ô chuyển thành input, icon 削除 và nút 行を追加 hiện | — | Medium |
| PRB-006 | OW_PROF_001 — Security XSS | Security | High | BD:OW_PROF_001/2, BD:OW_PROF_001/7 | Check ô 委託配送先名 không thực thi XSS khi nhập script (đại diện mọi ô văn bản màn này) | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập chuỗi XSS vào ô 委託配送先名<br>2. Nhấn 保存 | Không có popup alert hiện ra; script bị escape hoặc từ chối | XSS payload | High |
| PRB-007 | OW_PROF_001 — Security SQLi | Security | High | BD:OW_PROF_001/2 | Check ô 委託配送先名 không thực thi SQL Injection (đại diện mọi ô văn bản màn này) | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập chuỗi SQLi vào ô 委託配送先名<br>2. Nhấn 保存 | Không xảy ra SQL injection; hệ thống xử lý bình thường hoặc báo lỗi validate | SQLi payload | High |
| PRB-008 | OW_PROF_001 — Chuyển sang chế độ sửa | Behavior | Critical | BD:OW_PROF_001/15 | Check nhấn 編集 chuyển sang chế độ sửa không reload trang | Đã đăng nhập; OW_PROF_001 chế độ xem | 1. Nhấn nút 編集 | Màn chuyển sang chế độ sửa không reload; tất cả field trở thành input; nút 編集 ẩn, キャンセル/保存 hiện ở header góc phải trên | — | Critical |
| PRB-009 | OW_PROF_001 — キャンセル hủy thay đổi | Behavior | Critical | BD:OW_PROF_001/13 | Check nhấn キャンセル hủy thay đổi và quay về chế độ xem | Đã đăng nhập; OW_PROF_001 chế độ sửa đã sửa ô 委託配送先名 | 1. Sửa ô 委託配送先名 thành "Công ty XYZ"<br>2. Nhấn キャンセル | Màn quay về chế độ xem; ô 委託配送先名 hiển thị giá trị cũ trước khi sửa, không phải "Công ty XYZ" | — | Critical |
| PRB-010 | OW_PROF_001 — 保存 thành công | Behavior | Critical | BD:OW_PROF_001/14 | Check nhấn 保存 với dữ liệu hợp lệ lưu thành công và quay về chế độ xem | Đã đăng nhập; OW_PROF_001 chế độ sửa; tất cả field bắt buộc đã điền hợp lệ | 1. Sửa ô 委託配送先名 thành "Công ty ABC Updated"<br>2. Nhấn 保存 | Màn quay về chế độ xem hiển thị "Công ty ABC Updated"; không còn ở chế độ sửa | — | Critical |
| PRB-011 | OW_PROF_001 — 保存 hiện lỗi inline khi validation fail | Behavior | High | BD:OW_PROF_001/14 | Check nhấn 保存 khi có lỗi validation hiển thị lỗi inline và không lưu | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa ô 委託配送先名 (bắt buộc)<br>2. Xóa ô 市区町村 (bắt buộc)<br>3. Nhấn 保存 | Màn ở lại chế độ sửa; lỗi inline hiện dưới mỗi ô trống; không lưu dữ liệu | — | High |
| PRB-012 | OW_PROF_001 — カナ tự sinh từ 委託配送先名 | Behavior | High | BD:OW_PROF_001/3 | Check ô カナ tự động điền khi rời focus ô 委託配送先名 | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa ô カナ<br>2. Nhập tên Nhật vào 委託配送先名 (VD 山田商事)<br>3. Click ra ngoài ô (rời focus) | Ô カナ tự điền katakana tương ứng (VD ヤマダショウジ) | — | High |
| PRB-013 | OW_PROF_001 — カナ có thể sửa thủ công | Behavior | Medium | BD:OW_PROF_001/3 | Check ô カナ có thể sửa tay sau khi tự sinh | Đã đăng nhập; OW_PROF_001 chế độ sửa; カナ đã được tự sinh | 1. Sửa ô カナ thành コンパニーエービーシー<br>2. Nhấn 保存 | Hệ thống lưu giá trị カナ đã sửa tay, không ghi đè lại | カナ hợp lệ | Medium |
| PRB-014 | OW_PROF_001 — 郵便番号 tự điền địa chỉ khi rời focus | Behavior | High | BD:OW_PROF_001/4, BD:OW_PROF_001/6, BD:OW_PROF_001/7, BD:OW_PROF_001/8 | Check nhập 7 chữ số mã bưu điện và rời focus tự điền 都道府県, 市区町村, 町域・番地 | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập 1000001 vào ô 郵便番号<br>2. Click ra ngoài (rời focus) | Ô 都道府県 tự chọn 東京都; ô 市区町村 tự điền 千代田区; ô 町域・番地 tự điền giá trị tương ứng | Mã bưu điện hợp lệ | High |
| PRB-015 | OW_PROF_001 — 郵便番号 không tồn tại không báo lỗi | Behavior | Medium | BD:OW_PROF_001/4 | Check nhập mã bưu điện không tồn tại không hiện lỗi, giữ nguyên giá trị cũ | Đã đăng nhập; OW_PROF_001 chế độ sửa; đang có giá trị địa chỉ cũ | 1. Nhập 0000000 vào ô 郵便番号<br>2. Click ra ngoài (rời focus) | Không hiện thông báo lỗi; ô 都道府県/市区町村/町域・番地 giữ nguyên giá trị cũ không bị xóa | Mã bưu điện không tồn tại | Medium |
| PRB-016 | OW_PROF_001 — Nút 住所検索 làm việc giống focus-out | Behavior | Medium | BD:OW_PROF_001/5 | Check nhấn nút 住所検索 tự điền địa chỉ như khi rời focus ô mã bưu điện | Đã đăng nhập; OW_PROF_001 chế độ sửa; ô 郵便番号 đã nhập 1000001 | 1. Nhấn nút 住所検索 | Ô 都道府県/市区町村/町域・番地 tự điền như khi rời focus; kết quả giống TC PRB-014 | Mã bưu điện hợp lệ | Medium |
| PRB-017 | OW_PROF_001 — 都道府県 tự điền có thể sửa thủ công | Behavior | Medium | BD:OW_PROF_001/6 | Check dropdown 都道府県 đã tự điền từ mã bưu điện có thể thay đổi thủ công | Đã đăng nhập; OW_PROF_001 chế độ sửa; 都道府県 đã tự điền 東京都 | 1. Click dropdown 都道府県<br>2. Chọn tỉnh khác (VD 大阪府)<br>3. Nhấn 保存 | Hệ thống lưu tỉnh mới 大阪府 được chọn thủ công | — | Medium |
| PRB-018 | OW_PROF_001 — 担当者名 tự sinh フリガナ | Behavior | High | BD:OW_PROF_001/+2, BD:OW_PROF_001/+3 | Check ô フリガナ trong dòng 担当者 tự điền khi rời focus ô 担当者名 | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập tên nhân viên 山田太郎 vào cột 担当者名<br>2. Click ra ngoài (rời focus) | Ô フリガナ của dòng đó tự điền ヤマダタロウ | Tên nhân viên hợp lệ | High |
| PRB-019 | OW_PROF_001 — 委託配送先名 trống | Validate | Critical | BD:OW_PROF_001/2, E_PROF001_001 | Check để trống 委託配送先名 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa hết nội dung ô 委託配送先名<br>2. Nhấn 保存 | Ở lại màn chế độ sửa; lỗi inline hiện dưới ô: 「委託配送先名を入力してください。」; không lưu | — | Critical |
| PRB-020 | OW_PROF_001 — 委託配送先名 biên 50 và 51 ký tự | Validate | High | BD:OW_PROF_001/2, E_PROF001_002 | Check 委託配送先名 chấp nhận 50 ký tự và từ chối 51 ký tự | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập tên 50 ký tự → nhấn 保存 → kiểm lưu thành công<br>2. Vào lại chế độ sửa → nhập tên 51 ký tự → nhấn 保存 | Bước 1: lưu thành công (50 ký tự chấp nhận); Bước 2: ở lại màn, lỗi: 「委託配送先名は50文字以内で入力してください。」 | Tên 50 ký tự; Tên 51 ký tự | High |
| PRB-021 | OW_PROF_001 — カナ nhập katakana half-width | Validate | High | BD:OW_PROF_001/3, E_PROF001_003 | Check nhập katakana half-width vào カナ và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập ｺﾝﾊﾟﾆｰ (katakana half-width) vào ô カナ<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「カナは全角カナで入力してください。」; không lưu | カナ half-width sai | High |
| PRB-022 | OW_PROF_001 — 郵便番号 trống | Validate | Critical | BD:OW_PROF_001/4, E_PROF001_004 | Check để trống 郵便番号 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa hết nội dung ô 郵便番号<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「郵便番号を入力してください」; không lưu | — | Critical |
| PRB-023 | OW_PROF_001 — 郵便番号 sai định dạng | Validate | High | BD:OW_PROF_001/4, E_PROF001_005 | Check nhập mã bưu điện không phải 7 chữ số half-width hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập mã bưu điện 6 chữ số 100000<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「郵便番号は7桁の半角数字で入力してください」; không lưu | Mã bưu điện sai | High |
| PRB-024 | OW_PROF_001 — 都道府県 chưa chọn | Validate | Critical | BD:OW_PROF_001/6, E_PROF001_006 | Check không chọn 都道府県 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa; dropdown 都道府県 để trống (chưa chọn) | 1. Đảm bảo dropdown 都道府県 chưa có giá trị<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「都道府県を選択してください。」; không lưu | — | Critical |
| PRB-025 | OW_PROF_001 — 市区町村 trống | Validate | Critical | BD:OW_PROF_001/7, E_PROF001_007 | Check để trống 市区町村 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa hết nội dung ô 市区町村<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「市区町村を入力してください。」; không lưu | — | Critical |
| PRB-026 | OW_PROF_001 — 町域・番地 trống | Validate | Critical | BD:OW_PROF_001/8, E_PROF001_008 | Check để trống 町域・番地 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa hết nội dung ô 町域・番地<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「町域・番地を入力してください。」; không lưu | — | Critical |
| PRB-027 | OW_PROF_001 — 市区町村 và 町域・番地 chấp nhận max 255 ký tự | Validate | Medium | BD:OW_PROF_001/7, BD:OW_PROF_001/8 | Check cả hai ô 市区町村 và 町域・番地 chấp nhận đúng 255 ký tự | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập chuỗi 255 ký tự vào ô 市区町村<br>2. Nhập chuỗi 255 ký tự vào ô 町域・番地<br>3. Nhấn 保存 | Lưu thành công; không có lỗi về độ dài | Chuỗi 255 ký tự 'A' lặp lại | Medium |
| PRB-028 | OW_PROF_001 — 建物・部屋番号 là tùy chọn và chấp nhận max 255 | Validate | Medium | BD:OW_PROF_001/9 | Check ô 建物・部屋番号 có thể để trống và chấp nhận max 255 ký tự | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Để trống ô 建物・部屋番号 → nhấn 保存 → kiểm lưu thành công<br>2. Vào lại chế độ sửa → nhập 255 ký tự → nhấn 保存 | Bước 1: lưu thành công (tùy chọn, bỏ trống OK); Bước 2: lưu thành công (255 ký tự chấp nhận) | Chuỗi 255 ký tự 'A' lặp lại | Medium |
| PRB-029 | OW_PROF_001 — 電話番号 trống | Validate | Critical | BD:OW_PROF_001/10, E_PROF001_009 | Check để trống 電話番号 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Xóa hết ô 電話番号<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「電話番号を入力してください。」; không lưu | — | Critical |
| PRB-030 | OW_PROF_001 — 電話番号 sai định dạng | Validate | High | BD:OW_PROF_001/10, E_PROF001_010 | Check nhập SĐT sai định dạng hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập SĐT sai 9 chữ số 090-000-000<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「電話番号の形式が正しくありません（半角数字・ハイフン、10〜11桁）」; không lưu | SĐT sai 9 chữ số | High |
| PRB-031 | OW_PROF_001 — 電話番号 hợp lệ 10 và 11 chữ số | Validate | High | BD:OW_PROF_001/10 | Check SĐT 10 chữ số và 11 chữ số đều chấp nhận | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập SĐT 10 chữ số 090-0000-0000 → nhấn 保存 → kiểm lưu OK<br>2. Vào lại → nhập SĐT 11 chữ số 0120-000-0000 → nhấn 保存 | Bước 1: lưu thành công (10 chữ số hợp lệ); Bước 2: lưu thành công (11 chữ số hợp lệ) | SĐT 10 chữ số; SĐT 11 chữ số | High |
| PRB-032 | OW_PROF_001 — FAX番号 tùy chọn và kiểm định dạng khi có nhập | Validate | Medium | BD:OW_PROF_001/11, E_PROF001_011 | Check FAX để trống OK, nhập sai định dạng hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Để trống FAX → nhấn 保存 → kiểm lưu thành công (FAX tùy chọn)<br>2. Vào lại → nhập FAX sai 03-000-000 (9 chữ số) → nhấn 保存 | Bước 1: lưu thành công; Bước 2: ở lại màn, lỗi inline: 「FAX番号の形式が正しくありません（半角数字・ハイフン・10〜11桁）」 | FAX sai 9 chữ số | Medium |
| PRB-033 | OW_PROF_001 — 担当者名 trống | Validate | Critical | BD:OW_PROF_001/+2, E_PROF001_012 | Check để trống 担当者名 và nhấn 保存 hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa; bảng 担当者 có ít nhất 1 dòng | 1. Xóa hết ô 担当者名 của dòng メイン担当者<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「担当者名を入力してください」; không lưu | — | Critical |
| PRB-034 | OW_PROF_001 — 担当者名 biên 50 và 51 ký tự | Validate | High | BD:OW_PROF_001/+2, E_PROF001_013 | Check 担当者名 chấp nhận 50 ký tự và từ chối 51 ký tự | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập tên 50 ký tự vào 担当者名 → nhấn 保存 → kiểm lưu OK<br>2. Vào lại → nhập tên 51 ký tự → nhấn 保存 | Bước 1: lưu thành công; Bước 2: ở lại màn, lỗi: 「担当者名は50文字以内で入力してください。」 | Tên nhân viên 50 ký tự; Tên nhân viên 51 ký tự | High |
| PRB-035 | OW_PROF_001 — メールアドレス sai định dạng | Validate | High | BD:OW_PROF_001/+4, E_PROF001_014 | Check nhập email sai định dạng hiện lỗi | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập notanemail vào cột メールアドレス của 担当者<br>2. Nhấn 保存 | Ở lại màn; lỗi inline: 「メールアドレスの形式が正しくありません。」; không lưu | Email sai định dạng | High |
| PRB-036 | OW_PROF_001 — メールアドレス vượt 256 ký tự | Validate | High | BD:OW_PROF_001/+4, E_PROF001_015 | Check A.2.4 email 256 ký tự vượt max 255 hiển thị lỗi độ dài | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập 256 ký tự vào A.2.4 email<br>2. Rời focus | 1. Lỗi 「255文字以内で入力してください。」 hiển thị dưới A.2.4 | Email 256 ký tự (local 249 ký tự a + @b.com) | High |
| PRB-037 | OW_PROF_001 — メールアドレス trùng | Validate | High | BD:OW_PROF_001/+4, E_PROF001_016 | Check nhập email đã tồn tại trong hệ thống hiện lỗi trùng | Đã đăng nhập; OW_PROF_001 chế độ sửa; email user_b@example.com đã được đăng ký bởi tài khoản khác | 1. Nhập user_b@example.com vào cột メールアドレス<br>2. Nhấn 保存 | Ở lại màn; lỗi inline dưới ô email: 「このメールアドレスは既に使用されています。」; không lưu | Email trùng | High |
| PRB-038 | OW_PROF_001 — メールアドレス hợp lệ chấp nhận | Validate | Medium | BD:OW_PROF_001/+4 | Check email đúng định dạng được chấp nhận khi lưu | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập user_a@example.com vào cột メールアドレス<br>2. Nhấn 保存 với tất cả field hợp lệ | Lưu thành công; không có lỗi về email | Email hợp lệ | Medium |
| PRB-039 | OW_PROF_001 — TEL người phụ trách hợp lệ | Validate | Medium | BD:OW_PROF_001/+5 | Check cột TEL担当者 chấp nhận SĐT 10〜11 chữ số hợp lệ | Đã đăng nhập; OW_PROF_001 chế độ sửa | 1. Nhập 090-0000-0000 vào cột TEL của dòng 担当者<br>2. Nhấn 保存 với tất cả field hợp lệ | Lưu thành công; TEL được chấp nhận | SĐT hợp lệ 10 chữ số | Medium |
| PRB-040 | [UNCONFIRMED] OW_PROF_001 — NET error khi 保存 | Behavior | High | BD:OW_PROF_001/14, E_PROF001_S_001 | [UNCONFIRMED] Check mất mạng khi nhấn 保存 hiện thông báo lỗi mạng | Đã đăng nhập; OW_PROF_001 chế độ sửa; đã điền hợp lệ | 1. Ngắt kết nối mạng<br>2. Nhấn 保存 | Hiện toast: 「ネットワークエラーが発生しました。時間をおいて再度お試しください。」; ở lại chế độ sửa, giữ dữ liệu | — | High |
| PRB-041 | [UNCONFIRMED] OW_PROF_001 — SYS error khi 保存 | Behavior | High | BD:OW_PROF_001/14, E_PROF001_S_002 | [UNCONFIRMED] Check API trả 500 khi nhấn 保存 hiện thông báo lỗi hệ thống | Đã đăng nhập; OW_PROF_001 chế độ sửa; server trả 500 | 1. Trigger API trả 500 (mock/staging)<br>2. Nhấn 保存 | Hiện toast: 「システムエラーが発生しました。管理者にお問い合わせください。」; ở lại chế độ sửa, giữ dữ liệu | — | High |
| PRB-042 | [UNCONFIRMED] OW_PROF_001 — SESSION hết hạn khi thao tác | Behavior | High | BD:OW_PROF_001/14, E_PROF001_E_001 | [UNCONFIRMED] Check phiên hết hạn khi thao tác trên màn hiện màn hết phiên | Đã đăng nhập; OW_PROF_001 chế độ sửa; token đã hết hạn | 1. Để phiên hết hạn<br>2. Nhấn 保存 | Hiện màn hết phiên với message: 「セッションの有効期限が切れました。再度ログインしてください。」; redirect về OW_AUTH_001 | — | High |
| PRB-043 | 区分 請求担当者 選択可能確認 | Logic | High | BD:OW_PROF_001/+1 | Check 区分 dropdown trong bảng担当者 Profile có lựa chọn 請求担当者 (BILLING) | Đã đăng nhập tài khoản test đã đăng nhập. OW_PROF_001 tab 基本情報 ở chế độ chỉnh sửa | 1. Quan sát dropdown A.2.1 区分 trong bảng担当者<br>2. Mở dropdown A.2.1<br>3. Quan sát danh sách lựa chọn | 1. Dropdown 区分 hiển thị 3 lựa chọn: メイン担当者, サブ担当者, 請求担当者<br>2. Có thể chọn 請求担当者 | — | High |

## OW_PROF_002 — プロフィール（配送対応情報）

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRD-001 | [UNCONFIRMED] OW_PROF_002 — Layout tổng thể (chế độ xem) | UI | Medium | BD:OW_PROF_002/1, BD:OW_PROF_002/2, BD:OW_PROF_002/3, BD:OW_PROF_002/4, BD:OW_PROF_002/5, BD:OW_PROF_002/6, BD:OW_PROF_002/7, BD:OW_PROF_002/8, BD:OW_PROF_002/9, BD:OW_PROF_002/10, BD:OW_PROF_002/11, BD:OW_PROF_002/+1, BD:OW_PROF_002/+2 | [UNCONFIRMED] [UI Visual] Check tất cả phần tử hiển thị đúng ở chế độ xem OW_PROF_002 | Đã đăng nhập; đang ở OW_PROF_001 chế độ xem | 1. Nhấn tab 配送対応情報<br>2. Quan sát toàn màn | 1. Tab 配送対応情報 active; 2. Tag khu vực hiển thị không có nút ×; 3. Checkbox/Radio ở trạng thái read-only; 4. Nút 編集 hiển thị; 5. Tab 基本情報 hiển thị cạnh tab đang active | — | Medium |
| PRD-002 | [UNCONFIRMED] OW_PROF_002 — Các nhóm checkbox bắt buộc chưa chọn khi 保存 | Validate | High | BD:OW_PROF_002/1, BD:OW_PROF_002/5, BD:OW_PROF_002/6, BD:OW_PROF_002/7, E_PROF002_001, E_PROF002_003, E_PROF002_004, E_PROF002_005 | [UNCONFIRMED] Check không chọn khu vực, không chọn tùy chọn lạnh/bảo quản bắt buộc và nhấn 保存 hiện lỗi tương ứng | Đã đăng nhập; OW_PROF_002 chế độ sửa; tất cả nhóm checkbox bắt buộc đã bỏ chọn | 1. Bỏ chọn tất cả khu vực trong 対応エリア<br>2. Nhấn 保存 → kiểm lỗi 対応エリア (E_PROF002_001)<br>3. Chọn lại 対応エリア; bỏ chọn tất cả 冷凍ボックスレンタル (nếu bắt buộc) → 保存 → kiểm lỗi (E_PROF002_003)<br>4. Bỏ chọn 冷蔵ボックスレンタル (nếu bắt buộc) → 保存 → kiểm lỗi (E_PROF002_004)<br>5. Bỏ chọn 冷蔵保管スペース (nếu bắt buộc) → 保存 → kiểm lỗi (E_PROF002_005) | Bước 2: lỗi inline dưới 対応エリア; Bước 3-5: lỗi inline dưới nhóm tương ứng; không lưu khi còn lỗi | E_PROF002_001, E_PROF002_003, E_PROF002_004, E_PROF002_005 | High |
| PRD-003 | [UNCONFIRMED] OW_PROF_002 — 保有車両 chưa chọn và 備考 vượt max | Validate | High | BD:OW_PROF_002/4, BD:OW_PROF_002/8, E_PROF002_002, E_PROF002_006 | [UNCONFIRMED] Check không chọn phương tiện hiện lỗi và 車両・設備備考 vượt 500 ký tự hiện lỗi | Đã đăng nhập; OW_PROF_002 chế độ sửa | 1. Bỏ chọn tất cả 保有車両 → nhấn 保存 → kiểm lỗi E_PROF002_002<br>2. Chọn lại 保有車両; nhập 501 ký tự vào 車両・設備備考 → nhấn 保存 → kiểm lỗi E_PROF002_006 | Bước 1: lỗi inline dưới 保有車両 (E_PROF002_002); Bước 2: lỗi inline dưới 車両・設備備考 (E_PROF002_006); không lưu khi còn lỗi | E_PROF002_002, E_PROF002_006 | High |
| PRD-004 | [UNCONFIRMED] OW_PROF_002 — NET error khi 保存 | Behavior | High | BD:OW_PROF_002/10, E_PROF002_S_001 | [UNCONFIRMED] Check mất mạng khi nhấn 保存 trên OW_PROF_002 hiện thông báo lỗi mạng | Đã đăng nhập; OW_PROF_002 chế độ sửa; đã điền hợp lệ | 1. Ngắt kết nối mạng<br>2. Nhấn 保存 | Hiện toast lỗi mạng (E_PROF002_S_001); ở lại chế độ sửa, giữ dữ liệu | — | High |
| PRD-005 | [UNCONFIRMED] OW_PROF_002 — SYS error khi 保存 | Behavior | High | BD:OW_PROF_002/10, E_PROF002_S_002 | [UNCONFIRMED] Check API trả 500 khi nhấn 保存 trên OW_PROF_002 hiện thông báo lỗi hệ thống | Đã đăng nhập; OW_PROF_002 chế độ sửa; server trả 500 | 1. Trigger API trả 500 (mock/staging)<br>2. Nhấn 保存 | Hiện toast lỗi hệ thống (E_PROF002_S_002); ở lại chế độ sửa, giữ dữ liệu | — | High |
| PRD-006 | [UNCONFIRMED] OW_PROF_002 — SESSION hết hạn khi thao tác | Behavior | High | BD:OW_PROF_002/10, E_PROF002_E_001 | [UNCONFIRMED] Check phiên hết hạn khi thao tác trên OW_PROF_002 hiện màn hết phiên | Đã đăng nhập; OW_PROF_002 chế độ sửa; token đã hết hạn | 1. Để phiên hết hạn<br>2. Nhấn 保存 | Hiện màn hết phiên (E_PROF002_E_001); redirect về OW_AUTH_001 | — | High |

## Navigation — Quản lý Profile

| ID | Function Name | Category | Risk Level | Traceability ID | Test Scenario | Precondition | Steps | Expected Results | Test Data | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PRFNAV-001 | Navigation — Sidebar プロフィール → OW_PROF_001 | Navigation | Critical | BD:OW_PROF_001/+8, BD:OW_PROF_001/15 | Check nhấn プロフィール trên sidebar vào OW_PROF_001 tab 基本情報 chế độ xem | Đã đăng nhập; đang ở màn bất kỳ | 1. Nhấn プロフィール trên sidebar | Mở OW_PROF_001; tab 基本情報 active mặc định; màn ở chế độ xem (không phải sửa) | — | Critical |
| PRFNAV-002 | Navigation — OW_SCHD_001 → OW_PROF_001 | Navigation | Medium | BD:OW_PROF_001/+8 | Check chuyển từ màn Lịch trình sang プロフィール qua sidebar | Đã đăng nhập; đang ở OW_SCHD_001 | 1. Nhấn プロフィール trên sidebar | Mở OW_PROF_001 chế độ xem; tab 基本情報 active; mục sidebar プロフィール hiển thị active | — | Medium |
| PRFNAV-003 | Navigation — Tab 配送対応情報 (chế độ xem) → OW_PROF_002 | Navigation | Critical | BD:OW_PROF_001/+9, BD:OW_PROF_002/+1 | Check nhấn tab 配送対応情報 từ chế độ xem chuyển sang OW_PROF_002 | Đã đăng nhập; OW_PROF_001 chế độ xem | 1. Nhấn tab 配送対応情報 | Mở OW_PROF_002 chế độ xem; tab 配送対応情報 active; dữ liệu hiển thị | — | Critical |
| PRFNAV-004 | Navigation — Tab 基本情報 từ OW_PROF_002 → OW_PROF_001 | Navigation | Critical | BD:OW_PROF_002/+1 | Check nhấn tab 基本情報 từ OW_PROF_002 chuyển về OW_PROF_001 chế độ xem | Đã đăng nhập; đang ở OW_PROF_002 chế độ xem | 1. Nhấn tab 基本情報 | Mở OW_PROF_001 chế độ xem; tab 基本情報 active | — | Critical |
| PRFNAV-005 | Navigation — 編集 → OW_PROF_001 chế độ sửa | Navigation | Critical | BD:OW_PROF_001/15 | Check nhấn 編集 chuyển sang chế độ sửa không reload | Đã đăng nhập; OW_PROF_001 chế độ xem | 1. Nhấn nút 編集 | Màn switch sang chế độ sửa không có reload trang; tab 基本情報 vẫn active | — | Critical |
| PRFNAV-006 | Navigation — 保存 hợp lệ → về OW_PROF_001 chế độ xem với giá trị mới | Navigation | Critical | BD:OW_PROF_001/14 | Check nhấn 保存 hợp lệ quay về chế độ xem hiển thị giá trị đã cập nhật | Đã đăng nhập; OW_PROF_001 chế độ sửa; đã sửa 委託配送先名 | 1. Sửa 委託配送先名 thành "Công ty ABC Updated"<br>2. Nhấn 保存 | Chuyển về chế độ xem; ô 委託配送先名 hiển thị "Công ty ABC Updated"; không có lỗi | — | Critical |
| PRFNAV-007 | Navigation — キャンセル → về OW_PROF_001 chế độ xem, giữ giá trị cũ | Navigation | Critical | BD:OW_PROF_001/13 | Check nhấn キャンセル quay về chế độ xem với dữ liệu gốc không thay đổi | Đã đăng nhập; OW_PROF_001 chế độ sửa; đã sửa 委託配送先名 | 1. Sửa 委託配送先名 thành "Công ty XYZ"<br>2. Nhấn キャンセル | Chuyển về chế độ xem; ô 委託配送先名 hiển thị giá trị cũ trước khi sửa, không phải "Công ty XYZ" | — | Critical |
| PRFNAV-008 | Navigation — 保存 validation error → ở lại chế độ sửa | Navigation | High | BD:OW_PROF_001/14 | Check nhấn 保存 khi có lỗi validation ở lại chế độ sửa | Đã đăng nhập; OW_PROF_001 chế độ sửa; ô 委託配送先名 đang trống | 1. Xóa 委託配送先名<br>2. Nhấn 保存 | Ở lại OW_PROF_001 chế độ sửa; lỗi inline hiện; không navigate sang màn nào | — | High |
| PRFNAV-009 | Navigation — Sửa lại lỗi rồi 保存 → thành công | Navigation | High | BD:OW_PROF_001/14 | Check sau khi có lỗi, sửa đúng và nhấn 保存 lại thành công | Đã đăng nhập; OW_PROF_001 chế độ sửa sau khi đã nhấn 保存 và thấy lỗi validate | 1. Sửa ô lỗi thành giá trị hợp lệ<br>2. Nhấn 保存 | Lưu thành công; chuyển về chế độ xem với giá trị mới | — | High |
| PRFNAV-010 | Navigation — Sau キャンセル, nhấn 編集 lại hiển thị giá trị đã lưu | Navigation | Medium | BD:OW_PROF_001/13, BD:OW_PROF_001/15 | Check sau キャンセル, nhấn 編集 lại ô hiển thị giá trị đã lưu, không phải giá trị đã hủy | Đã đăng nhập; OW_PROF_001 chế độ xem sau khi đã hủy | 1. Nhấn 編集<br>2. Sửa 委託配送先名 thành "Tên Tạm"<br>3. Nhấn キャンセル<br>4. Nhấn 編集 lại | Ô 委託配送先名 hiển thị giá trị đã lưu trong DB, không phải "Tên Tạm" | — | Medium |
| PRFNAV-011 | Navigation — E2E: Sửa thông tin cơ bản và lưu thành công | Integration | Critical | BD:OW_PROF_001/15, BD:OW_PROF_001/14, BD:OW_PROF_001/13 | Check luồng E2E đầy đủ gồm vào profile, sửa thông tin cơ bản, lưu và xác nhận kết quả hiển thị đúng | Đã đăng nhập với tài khoản OW000123 | 1. Vào sidebar → プロフィール<br>2. Nhấn 編集<br>3. Sửa 委託配送先名 và 電話番号 hợp lệ<br>4. Nhấn 保存<br>5. Quan sát màn sau lưu | Màn quay về chế độ xem; 委託配送先名 và 電話番号 hiển thị giá trị mới; không có lỗi | Tài khoản hợp lệ | Critical |
| PRFNAV-012 | Navigation — E2E: Validation error rồi sửa và lưu thành công | Integration | High | BD:OW_PROF_001/14 | Check luồng khi có validation error, sửa lại giá trị hợp lệ và lưu thành công | Đã đăng nhập; OW_PROF_001 chế độ xem | 1. Nhấn 編集<br>2. Xóa 委託配送先名<br>3. Xóa 郵便番号<br>4. Nhấn 保存 → kiểm lỗi<br>5. Điền lại 委託配送先名 và 郵便番号 hợp lệ<br>6. Nhấn 保存 | Bước 4: lỗi inline hiện ở cả 2 ô, ở lại màn; Bước 6: lưu thành công, về chế độ xem | Mã bưu điện hợp lệ | High |
| PRFNAV-013 | Navigation — Tab 配送対応情報 ở chế độ sửa (behavior UNKNOWN) | Navigation | Medium | BD:OW_PROF_001/+9 | Check nhấn tab 配送対応情報 khi OW_PROF_001 đang ở chế độ sửa ghi nhận hành vi thực tế | Đã đăng nhập; OW_PROF_001 chế độ sửa; đã có thay đổi chưa lưu | 1. Nhấn tab 配送対応情報 | Ghi nhận hành vi thực tế (hành vi chưa được định nghĩa: có thể hiện dialog cảnh báo hoặc chuyển tab ngay) | — | Medium |

## Navigation Matrix

| Từ màn | Phần tử (BD no) | Điều kiện | Đến màn | Ghi chú |
| --- | --- | --- | --- | --- |
| Sidebar | プロフィール menu item | Đã đăng nhập | OW_PROF_001 (tab 基本情報, chế độ xem) | Mặc định tab 基本情報 |
| OW_PROF_001 (xem) | 15 — Nút 編集 | — | OW_PROF_001 (chế độ sửa) | Không reload |
| OW_PROF_001 (sửa) | 14 — Nút 保存 (thành công) | Validation pass | OW_PROF_001 (chế độ xem, giá trị mới) |  |
| OW_PROF_001 (sửa) | 14 — Nút 保存 (lỗi) | Validation fail | OW_PROF_001 (chế độ sửa) | Inline error hiện |
| OW_PROF_001 (sửa) | 13 — Nút キャンセル | — | OW_PROF_001 (chế độ xem, giá trị cũ) | Hủy thay đổi |
| OW_PROF_001 (xem) | +9 — Tab 配送対応情報 | Chế độ xem | OW_PROF_002 (chế độ xem) |  |
| OW_PROF_001 (sửa) | +9 — Tab 配送対応情報 | Chế độ sửa | UNKNOWN (OQ-12) | Chưa định nghĩa |
| OW_PROF_002 (xem) | +1 — Tab 基本情報 | — | OW_PROF_001 (chế độ xem) |  |
| OW_PROF_002 (xem) | 11 — Nút 編集 | — | OW_PROF_002 (chế độ sửa) | Không reload |
| OW_PROF_002 (sửa) | 10 — Nút 保存 (thành công) | Validation pass | OW_PROF_002 (chế độ xem, giá trị mới) | INFERENCE |
| OW_PROF_002 (sửa) | 9 — Nút キャンセル | — | OW_PROF_002 (chế độ xem, giá trị cũ) | INFERENCE |

## Coverage Matrix

| Screen | BD no | Tên item | TC IDs |
| --- | --- | --- | --- |
| OW_PROF_001 | 1 | 委託配送ID | PRB-001 (layout) |
| OW_PROF_001 | 2 | 委託配送先名 | PRB-001, PRB-002, PRB-006, PRB-007, PRB-008, PRB-009, PRB-010, PRB-011, PRB-019, PRB-020 |
| OW_PROF_001 | 3 | カナ | PRB-001, PRB-002, PRB-012, PRB-013, PRB-021 |
| OW_PROF_001 | 4 | 郵便番号 | PRB-001, PRB-002, PRB-014, PRB-015, PRB-022, PRB-023 |
| OW_PROF_001 | 5 | 住所検索ボタン | PRB-004, PRB-016 |
| OW_PROF_001 | 6 | 都道府県 | PRB-001, PRB-003, PRB-014, PRB-017, PRB-024 |
| OW_PROF_001 | 7 | 市区町村 | PRB-001, PRB-002, PRB-014, PRB-025, PRB-027 |
| OW_PROF_001 | 8 | 町域・番地 | PRB-001, PRB-002, PRB-014, PRB-026, PRB-027 |
| OW_PROF_001 | 9 | 建物・部屋番号 | PRB-001, PRB-002, PRB-028 |
| OW_PROF_001 | 10 | 電話番号 | PRB-001, PRB-002, PRB-029, PRB-030, PRB-031 |
| OW_PROF_001 | 11 | FAX番号 | PRB-001, PRB-002, PRB-032 |
| OW_PROF_001 | 12 | 担当者テーブル | PRB-001, PRB-005 |
| OW_PROF_001 | 13 | キャンセルボタン | PRB-004, PRB-009, PRFNAV-007, PRFNAV-010 |
| OW_PROF_001 | 14 | 保存ボタン | PRB-004, PRB-010, PRB-011, PRB-040, PRB-041, PRB-042, PRFNAV-006, PRFNAV-008, PRFNAV-009 |
| OW_PROF_001 | 15 | 編集ボタン | PRB-004, PRB-008, PRFNAV-001, PRFNAV-005 |
| OW_PROF_001 | +1 | 区分 | PRB-003, PRB-005 |
| OW_PROF_001 | +2 | 担当者名 | PRB-002, PRB-005, PRB-018, PRB-033, PRB-034 |
| OW_PROF_001 | +3 | フリガナ (担当者) | PRB-002, PRB-005, PRB-018 |
| OW_PROF_001 | +4 | メールアドレス (担当者) | PRB-002, PRB-005, PRB-035, PRB-036, PRB-037, PRB-038 |
| OW_PROF_001 | +5 | TEL (担当者) | PRB-002, PRB-005, PRB-039 |
| OW_PROF_001 | +6 | 削除アイコン | PRB-005 |
| OW_PROF_001 | +7 | 行を追加ボタン | PRB-005 |
| OW_PROF_001 | +8 | Tab 基本情報 | PRB-001, PRFNAV-001, PRFNAV-004 |
| OW_PROF_001 | +9 | Tab 配送対応情報 | PRB-001, PRFNAV-003, PRFNAV-013 |
| OW_PROF_002 | 1 | 対応エリア | PRD-001, PRD-002 |
| OW_PROF_002 | 2 | 配送不可曜日 | PRD-001 |
| OW_PROF_002 | 3 | 対応エリア備考 | PRD-001 |
| OW_PROF_002 | 4 | 保有車両 | PRD-001, PRD-003 |
| OW_PROF_002 | 5 | 冷凍ボックスレンタル希望 | PRD-001, PRD-002 |
| OW_PROF_002 | 6 | 冷蔵ボックスレンタル希望 | PRD-001, PRD-002 |
| OW_PROF_002 | 7 | 冷蔵保管スペース | PRD-001, PRD-002 |
| OW_PROF_002 | 8 | 車両・設備備考 | PRD-001, PRD-003 |
| OW_PROF_002 | 9 | キャンセルボタン | PRD-001 |
| OW_PROF_002 | 10 | 保存ボタン | PRD-001, PRD-004, PRD-005, PRD-006 |
| OW_PROF_002 | 11 | 編集ボタン | PRD-001, PRFNAV-003 |
| OW_PROF_002 | +1 | Tab 基本情報 | PRD-001, PRFNAV-004 |
| OW_PROF_002 | +2 | Tab 配送対応情報 | PRD-001, PRFNAV-003 |

## Not Covered — UNKNOWN

| Hạng mục | Lý do | OQ |
| --- | --- | --- |
| 委託配送ID — Trường read-only INFERENCE (item 1 OW_PROF_001) | Need Confirm: item không có trong SPEC, suy từ Figma frame; UNCONFIRMED không có message code | OQ-14 |
| 委託配送ID — max+1 length validation | Need Confirm: không có message code được định nghĩa | OQ-14 |
| 区分 — empty validation message | SPEC chưa định nghĩa message khi 区分 để trống; không có message code | — |
| フリガナ (担当者) — half-width katakana validation | SPEC chưa định nghĩa message; không có message code | — |
| メールアドレス (担当者) — empty validation message | SPEC chưa định nghĩa message khi email trống | — |
| TEL (担当者) — empty validation | SPEC chưa định nghĩa message; INFERENCE | — |
| TEL (担当者) — format invalid validation | SPEC chưa định nghĩa message | — |
| 行を追加 — thêm dòng mới vào bảng 担当者 | INFERENCE: chức năng không thấy trên Figma. Không có message code | — |
| 削除アイコン — メイン担当者 icon disabled | INFERENCE: không thấy trên Figma. UNCONFIRMED không có message code | OQ-12 |
| 削除アイコン — サブ担当者 xóa dòng | INFERENCE: không thấy trên Figma. UNCONFIRMED không có message code | — |
| OW_PROF_001 — Dialog cảnh báo khi chuyển tab khi đang sửa | Hành vi chưa định nghĩa | OQ-12 |
| OW_PROF_001 — Thông báo lưu thành công (toast?) | Chưa định nghĩa | OQ-18 |
| OW_PROF_001 — 郵便番号 service không phản hồi | Hành vi chưa định nghĩa | OQ-11 |
| OW_PROF_001 — 市区町村 max+1 256 ký tự | Không có message code được định nghĩa | — |
| OW_PROF_001 — 町域・番地 max+1 256 ký tự | Không có message code được định nghĩa | — |
| OW_PROF_001 — double-click 編集/保存/住所検索 | Dropped: decorative behavior không có trong bảng | — |
| OW_PROF_001 — loading state skeleton | Dropped: loading skeleton decorative | — |
| OW_PROF_002 — Toàn bộ màn INFERENCE (OQ-14) | Không có bảng 画面設計書 riêng; nội dung suy luận | OQ-14 |
| OW_PROF_002 — E_PROF002_003/004/005 (frz/rfg/stg empty) | Đã cover trong PRD-002 (multi-step, UNCONFIRMED — tất cả OW_PROF_002 là INFERENCE theo OQ-14) | OQ-14 |
| OW_PROF_002 — E_PROF002_006 (note_len) | Đã cover trong PRD-003 (UNCONFIRMED — max 500 là giá trị đề xuất chưa confirm) | OQ-14 |
| OW_PROF_002 — E_PROF002_S_001/S_002/E_001 (net/sys/session) | Đã cover trong PRD-004/005/006 (UNCONFIRMED — hành vi chưa confirm) | OQ-12, OQ-14 |
| OW_PROF_002 — 編集 chuyển sang chế độ sửa | UNCONFIRMED không có message code → Not Covered | OQ-14 |
| OW_PROF_002 — キャンセル hủy thay đổi | UNCONFIRMED không có message code → Not Covered | OQ-14 |
| OW_PROF_002 — 保存 success | UNCONFIRMED không có message code; thông báo thành công cũng UNKNOWN | OQ-14, OQ-18 |
| OW_PROF_002 — Tag ↔ Cây đồng bộ 2 chiều | INFERENCE; UNCONFIRMED không có message code | OQ-14 |
| OW_PROF_002 — すべて選択 / 選択解除 | INFERENCE; UNCONFIRMED không có message code | OQ-14 |
| OW_PROF_002 — 配送不可曜日 checkbox behavior | INFERENCE tùy chọn; không có validation message | OQ-14 |
| OW_PROF_002 — 車両・設備備考 max+1 501 ký tự | INFERENCE; max 500 là đề xuất; không cover | OQ-14 |
| Log lịch sử thay đổi hồ sơ | Chưa định nghĩa | OQ-18 |
| Fee-area (FeeAreaTab) | Bị loại khỏi hồ sơ Phase 2 | OQ-04 |
