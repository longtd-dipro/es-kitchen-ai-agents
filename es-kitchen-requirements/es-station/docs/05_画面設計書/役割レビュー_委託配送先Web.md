# 役割レビュー（BA・QC・UI/UX）— 委託配送先Web（OW_HOME・SCHD・DELV・TRBL・COLL・QUOT・STAF・PROF・AUTH）

作成日：2026-10-08。方式：`.claude/skills/screen-design-doc/references/role_review.md`（依頼文どおり BA → QC → UI/UX）。
入力：`make.py --review --all`（9 file）、`OW_*.py` 9 file、`_共通パターン.py`・`_共通_メッセージ.py`、台帳 F（10-05〜10-08）・K・L・M、`01_仕様/10_配送`、`基本設計_全体の定義_提案`、`外部連携_エラーの流れ_一覧`、`運営Web_権限表`、`確認メモ_TW_委託配送先.md`、`demo_ok棚卸_委託配送先Web.md`。
**Người review chỉ đề xuất. Không sửa data / code / 台帳 / 受付簿 / spec.**
D1〜D9: đã chạy với bộ nhớ đệm chụp (`.capture_cache` sao chép từ worktree a5c5e6fd…, chỉ đọc nguồn; đã xem trực tiếp ảnh OW_PROF_001・OW_DELV_001・OW_DELV_012 để xác nhận).
Không lặp lại 145 `demo_ok` / backlog code đã có trong `demo_ok棚卸_委託配送先Web.md`. Bảng dưới chỉ gồm điểm mới hoặc điểm bổ sung.

## (a) Bảng phát hiện（tối đa 15・cao → thấp）

| # | 役 | 対象（view id・No.／spec） | 指摘（1文） | 提案（1文） | 行き先 | 重大度 |
|---|---|---|---|---|---|---|
| 1 | BA | OW_AUTH 007 No.7.2・011 No.11・009／台帳 F「認証コード（全サイト共通）」「パスワードの扱い」 | Mã 4 chữ số, hiệu lực 5 phút, **không giới hạn số lần nhập**, thêm "gửi lại" không giới hạn, và đúng mã là **tự đăng nhập luôn** (No.11) → 10.000 tổ hợp, thử hết được trong 5 phút (vẫn có thể thử thêm với mã mới) = chiếm tài khoản; cũng mâu thuẫn với 台帳 F 2026-09-30「ドライバーのログイン」còn ghi "失敗回数". | Hỏi hong có giữ "không giới hạn" không; đề xuất: sai N lần (推奨 5 lần) thì mã mất hiệu lực (không khóa tài khoản, nên không trái "ロックしない") hoặc bỏ auto-login sau reset. | 要確認（hong）→ 受付簿「変更」（台帳 F 2026-10-08 を変える） | 高 |
| 2 | BA | OW_STAF 012 No.19.2・034 No.34.5・029／配送_06 §12-3（line 201）・E09 | No.19.2 cho phép "nếu không có email của người đó thì nhập email quản trị", nhưng E09 / CSV No.34.5 cấm trùng email → chỉ 1 nhân viên dùng được email quản trị; nhân viên không có email không đăng ký được (đồng thời là nơi nhận mã reset/ID). | Quyết: cho phép trùng email trong cùng công ty (reset phải đi kèm ID) hoặc bắt mỗi người email riêng và bỏ câu "nhập email quản trị". | 要確認（hong）／仕様を直す（配送_06 §12-3 と E09 の整合） | 高 |
| 3 | BA | OW_DELV 026 No.39.3・027 No.40・No.32／配送_08（地点の資料「マスタ側で差し替える。この配送だけの差し替えはしない」）・REQ-DL-826・配送_06 line 237 | Data cho phép đối tác **xóa tài liệu do khách (法人) tải lên** (搬入経路図 = "地点の資料" thuộc master 拠点/中継先); spec chỉ cho xóa "file mình tải lên" và REQ-DL-826 quy định chỉ sửa ở master → xóa nhầm làm mất tài liệu dùng cho các chuyến sau. | Giới hạn: đối tác chỉ xóa file do đối tác tải (32.1); tài liệu địa điểm/khách tải lên chỉ xem. Nếu hong muốn cho xóa thì ghi rõ ngoại lệ vào spec. | 仕様を直す／要確認（hong）。データ側 39.3 と DECISIONS（行45）は「決定済み」と書いているが根拠（配送_06 §8E-3）は「アップロードしたファイル」のみ | 高 |
| 4 | BA | OW_AUTH 016 No.22.1・018 No.24・DECISIONS 行42／台帳 F「配送スタッフの一括発行・停止の文言・委託の申込」(2026-10-07) | Data còn ghi số tiếp nhận **"CA＋5桁"** ở No.22.1, No.24 và DECISIONS, trong khi 台帳 F đã quyết **CA-YYYYMMDD-NNNN** (chỉ demo_ok No.24.1 ghi đúng) → mâu thuẫn quyết định. Ngoài ra 運営H「申込の確認」(duyệt) vẫn chưa có màn ở phía 運営. | Sửa 3 chỗ sang CA-YYYYMMDD-NNNN (cả ví dụ trong S402); ghi phụ thuộc: màn 運営H「申込の確認」là việc của 運営. | データ・画面を直す（台帳どおり）／運営H 設計書の宿題 | 高 |
| 5 | BA | OW_STAF 012 No.18.6・No.16.1・No.12／OW_DELV 13.2・E408・E412 | Chuyển trạng thái nhân viên sang **無効/利用停止** (hiệu lực ngay) không có kiểm tra "đang phụ trách chuyến" như khi 削除 (E412) → chuyến vẫn gán cho người đã vô hiệu; không nói chuyến đó xử lý ra sao, ai được báo, driver app còn thấy không; cũng không nói 無効 và 利用停止 khác nhau thế nào (ai được đặt 利用停止). | Áp cùng điều kiện với E412 (chặn hoặc cảnh báo + yêu cầu đổi người trước), và định nghĩa 無効 vs 利用停止 vs 免許未登録 (thứ tự ưu tiên badge khi trùng). | 要確認（hong）／仕様を直す | 高 |
| 6 | BA | OW_AUTH 001 No.1.5・004 No.4・005 No.5.2（E401・E520・E526）／台帳 F（H-4）・K | Stopped account hiện **E401 "tài khoản bị dừng"** riêng, còn sai ID/mật khẩu là E520 → biết được ID nào tồn tại / đang bị dừng (SW dùng E520 để không lộ); chưa rõ E401 hiện **trước hay sau** khi mật khẩu đúng; reset password cho tài khoản stopped chưa mô tả. | Chỉ hiện E401 sau khi mật khẩu đúng (hoặc đổi sang E520); ghi cách xử lý reset với tài khoản dừng. Quyết định "giữ nguyên" của hong 2026-10-07 là về văn bản, không bàn thứ tự kiểm tra. | データを直す（thứ tự kiểm tra）／要確認（hong）nếu muốn đổi văn bản | 中 |
| 7 | BA | OW_AUTH 005 No.5.2・5.3・No.12・13／台帳 F「パスワードの扱い」 | Nơi nhận mã không nhất quán: No.5.2 khớp "email của người phụ trách" (kể cả sub), No.5.3 "thông báo gửi tới **tất cả** người phụ trách", No.12 và 台帳 nói **email người phụ trách chính**; ngoài ra mã reset có thể gửi cho người không nên nhận. | Thống nhất: ID + email phải trùng **email メイン担当者**; mã chỉ gửi email đó (sub không nhận). | 仕様を直す／データを直す | 中 |
| 8 | QC | OW_TRBL 001 No.3.4・No.4.5・No.9・view 005／確認メモ H-35 | Danh sách lọc 種類 (No.3.4) **không có** 数量相違・未配送 (loại do hệ thống tự báo, hiển thị ở No.4.5/No.10) → không lọc được các dòng đó; tên option cũng lệch (D2 ghi 「不在・受け取り不可」, text No.3.4 ghi 「不在」), và 誤配送/その他 xuất hiện ở cả 2 場面 nên option trùng tên. | Thêm 数量相違・未配送 (hoặc mục "自動報告"), thống nhất tên với master 運営 và cho phép lọc theo 場面. | データを直す／運営のトラブル種類マスタと照合 | 中 |
| 9 | QC | OW_COLL 001 No.2・3.1・No.3 | "支払の明細（月）" lấy tháng của 開始日: mặc định 開始日 = hôm nay −20 ngày nên thường rơi vào **tháng trước**; 開始日 trống ("không giới hạn dưới") thì không xác định được tháng; khoảng thời gian vắt qua 2 tháng không rõ. | Cho chọn tháng riêng (hoặc lấy tháng của 終了日/ngày hiện tại) và chặn/hiện lý do khi 開始日 trống; ghi ranh giới tháng (納品日 theo JST). | データを直す／要確認（hong）tháng thanh toán tính theo gì | 中 |
| 10 | UI | OW_DELV 001 初期表示・No.5.13〜5.16／D4（機械報告は本物）・D2 | Ở 1440px bảng rộng 2115px: **届け先拠点名・住所・送り状番号・配送区分** nằm ngoài khung nhìn (đã xác nhận trên ảnh), cột 担当区間・引取先 bị cắt; thông tin tối quan trọng (nơi giao) phải kéo ngang. | Rút cột mặc định / cố định cột 配送No + 届け先, thu cột phụ vào hàng chi tiết hoặc tooltip, đặt độ rộng tối đa + wrap. | データ・画面を直す | 中 |
| 11 | BA | OW_QUOT 010 No.20.5・20.6・012 No.12.6／台帳 F「見積回答の項目と期限」 | Nhập **ngày** (No.20.5) nhưng chỉ lưu **tháng chu kỳ**, hiển thị "yyyy年m月 サイクルから" → người dùng không biết ngày bị làm tròn; và không có ràng buộc 見積の有効期限 ≥ 最短開始可能日 (có thể hết hạn trước khi bắt đầu). | Đổi ô sang chọn tháng/chu kỳ (hoặc ghi rõ quy tắc làm tròn); thêm kiểm tra 有効期限 ≥ ngày bắt đầu (message mới). | 仕様を直す／要確認（hong）quy tắc chu kỳ | 中 |
| 12 | BA | `_共通_メッセージ.py` I02 vs E31／台帳 K・F「同時更新のメッセージ（E31）」(10-05)・M-1「同時に編集」(10-03・旧文) | I02 nói "người lưu sau sẽ **bị lỗi**" nhưng E31 (đã quyết 10-05) là cảnh báo **cho phép ghi đè**; dòng cũ M-1 còn ghi "エラー…再読み込み" → mâu thuẫn, OW_STAF 020/QUOT 024/DELV dùng cả hai. | Sửa I02 theo E31 ("…上書きするか選べます"); đánh dấu dòng M-1 là cũ. | データ（メッセージ）を直す／台帳 M-1 の直し漏れ | 中 |
| 13 | BA | OW_PROF 001 No.3.2・002 No.5.1〜5.4・No.1.5／台帳 F「委託配送先のプロフィールの変更」・「仕入先のプロフィール」・配送_11 14.5 | Sửa **tên công ty, địa chỉ, 対応エリア, 配送不可曜日** có hiệu lực ngay, không duyệt, chỉ thông báo trên màn 運営H (SW chỉ được sửa liên lạc) → ảnh hưởng thẳng đến việc 運営 gán hợp đồng/lịch, nhưng PROF không có tab 変更履歴 (STAF có) nên không truy vết người đổi (tài khoản dùng chung 1 công ty). | Thêm tab 変更履歴 (P-HIST) và nội dung thay đổi vào thông báo; hỏi lại phạm vi cho sửa (tên/mã pháp nhân chỉ xem như SW?). | 要確認（hong）／受付簿「変更」（台帳 F 2026-10-07 の範囲） | 中 |
| 14 | QC | OW_DELV 007 No.13.5・No.5.1・012 No.19.5・No.21.11 | Chưa nêu: phạm vi "すべて選択" (chỉ trang hiện tại hay toàn bộ kết quả 10/20/50), xử lý đồng thời khi 運営 sửa 担当/備考 cùng lúc với đối tác (E31), và 備考 do 運営 hay đối tác viết (cùng 1 ô?). | Ghi: すべて選択 = chỉ trang hiện tại; áp E31 cho 確定 và 備考; làm rõ 備考 là ô của đối tác (tách khỏi 備考 運営). | 仕様を直す／データを直す | 中 |
| 15 | UI | OW_AUTH 012 No.13.2〜13.4・STAF 001 No.3.1・OW_AUTH 016 No.20.2〜20.4（D1・D8） | Ô 担当者名 (60)・フリガナ (60)・メール (160) trong bảng chỉ rộng ~13 chữ (213px) nên không thấy hết; radio 17px (D8) cần nhấn đúng chấm, và "[番地]" lẫn trong dữ liệu mẫu PROF 3.8 (ảnh OW_PROF_001). | Nới cột (min ~24 chữ), cho label của radio nhận click, sửa seed "みなとみらい[番地]". | データ・画面を直す（seed は c） | 低 |

Tổng: **15 điểm** — BA 10 (cao 5・trung 5), QC 3 (trung 3), UI/UX 2 (trung 1・thấp 1). Cao 5 / Trung 9 / Thấp 1.
Các mục OPEN đã có (住所検索・配送不可曜日と対応曜日・免許証保存期間) là 要確認 đã biết, không tính là phát hiện mới.

## (b) Gợi ý test QC theo 機能（「đầu vào → kết quả mong đợi」）

### OW_AUTH（ログイン・再設定・申し込み）
- ID trống / mật khẩu trống → E01 inline dưới ô, viền đỏ（không toast）
- ID "ｄｅ00001"(全角) + khoảng trắng đầu/cuối → chuẩn hoá thành DE00001 rồi đăng nhập
- ID sai / mật khẩu sai → E520 trên form, nhập nhiều lần không bị khóa
- Tài khoản stopped + mật khẩu đúng → E401（kiểm tra thêm: mật khẩu sai thì E401 hay E520? xem #6）
- Reset: ID+email không khớp → E526（không nói bên nào sai）; mã 4 số: nhập sau 5 phút → E522, nhập sai 6 lần → E521 (kiểm tra có giới hạn không, #1)
- Mật khẩu mới: 7 ký tự → E523; 8 ký tự có chữ+số → OK; 64 → OK; 65 → E523; toàn chữ → E523; "確認用" khác → E524
- Hoàn tất reset → tự đăng nhập, về OW_HOME_001
- Đăng ký 1/2: 担当者 chỉ 1 dòng → không xoá được dòng cuối; không có メイン → E413; email sai → E07; 郵便番号 6 số → E05
- Đăng ký 2/2: không chọn エリア/温度帯/車両 → E02; chưa đồng ý → E527; double-click 登録 → chỉ 1 đơn (受付番号 CA-YYYYMMDD-NNNN duy nhất)
- Nhập dở rồi 「キャンセル」/reload → Q02; 「戻る」từ 2/2 → dữ liệu 1/2 vẫn còn

### OW_HOME（ホーム・お知らせ詳細）
- Công ty không có thông báo cho mình → I203; có thông báo gửi công ty khác → không hiện
- Không có báo giá chưa trả lời → I301; có báo giá hết hạn/đã trả lời → không hiện
- Thông báo quan trọng → badge 「重要」 đỏ, đứng trên cùng
- Thông báo tự động (Q-10) → tag 「自動通知」, thứ tự cùng thông báo 運営
- /carrier/news/99999 hoặc ID của công ty khác → I400 + nút về Home（không hiện thông báo đầu tiên）
- Ngày hôm nay đúng ngày giao −3 / −1 chưa gán nhân viên → hiện W300, 3 ngày trước cũng hiện
- Ô ngày trong lịch (tháng hiện tại) → chuyển OW_SCHD_001; chuyến chỉ "予定" cũng được đếm
- Token đăng nhập quá 1 ngày → thao tác kế tiếp về màn đăng nhập

### OW_SCHD（スケジュール）
- Tháng đầu có chuyến −1 / tháng chu kỳ kế tiếp +1 → I200 / I201 (toast), không đổi tháng
- Đổi 月↔週 → điều kiện tìm kiếm giữ nguyên
- Tìm "ひかり" Enter / 検索 → chỉ đếm chuyến khớp; xoá điều kiện → trả về toàn bộ
- Tuần không có chuyến → "配送なし" từng ngày, không hiện I01
- Ô ngày → sang tuần chứa ngày đó（không sang 配送管理）
- Chuyến 予定 → viền chấm "予定 N件", không lộ số lượng/điều kiện giao
- Có chuyến chưa gán nhân viên → badge 「未 n件」 cả tháng/tuần; tên chi nhánh dài → ellipsis + tooltip

### OW_DELV（配送管理）
- Mặc định: 納品日, hôm nay −3〜+10 ngày, tăng dần theo 納品日; 終了日 < 開始日 → E08
- 0 kết quả → I01, CSV出力 bị vô hiệu; CSV theo toàn bộ điều kiện (không theo trang)
- Chọn 予定/確認中/出荷済(1次)/納品済 → checkbox disabled + lý do tooltip
- Chọn 2 dòng (1 đã gán, 1 chưa) → W301 số 1; 確定 → S301 (m dòng chờ gửi lại 出荷指示)
- Không chọn nhân viên → E02; nhân viên 無効 → E408; 1 dòng đổi trạng thái giữa chừng → E409 và không thay đổi gì
- Double-click 確定 → chỉ thực hiện 1 lần
- Chi tiết: ID công ty khác / không tồn tại → I400; ?tab= được giữ khi reload
- 備考 500 ký tự OK, 501 → E04; lưu rồi mở lại vẫn còn
- Tệp đính kèm: 11 file → E411; > 5MB → E11; xoá file đối tác tải → Q01 → S02; xoá file khách tải → (xem #3)

### OW_TRBL（トラブル）
- Có トラブル 対応中 → W302 (số không đổi khi lọc); 0 → không hiện
- Mặc định: tháng chu kỳ hiện tại; lọc 解決済み khi không có → I01
- Lọc theo 種類 gồm cả 数量相違・未配送 (xem #8); lọc 受付日 ngược → E08
- Dòng tự động → báo cáo viên là 「自動」; nhấn dòng → mở tab トラブル của 配送詳細（Enter bằng bàn phím cũng được）
- Trouble của chuyến công ty khác → không hiển thị/không mở được
- Màn chỉ đọc: không có nút tạo/sửa

### OW_COLL（集金管理）
- Khoảng thời gian 開始/終了 → bảng, tổng, CSV đều đổi (kiểm tra 3 nơi khớp nhau)
- Từ khoá "山口" → bảng + tổng chỉ của người đó; nhân viên không phụ trách chuyến → 「—」 (không phải 0円)
- 終了 < 開始 → E08; 0 dòng → I01, CSV không xuất
- 「支払の明細（月）」 với 開始日 trống / vắt qua 2 tháng / mặc định (xem #9)
- Tổng 税込 (集金/駐車) và 支払額 税抜 trong CSV ghi rõ（税込）（税抜）, số tiền lớn 999,999,999 hiển thị 3 chữ số, căn phải
- Sắp xếp mọi cột, 10/20/50 dòng/trang, giữ điều kiện khi quay lại từ 配送スタッフ詳細

### OW_QUOT（見積依頼）
- Hạn còn 3 ngày → 「残りN日」 vàng; ngày hạn → 「本日期限」 đỏ; sau 23:59 → 期限切れ, không còn nút 回答
- Thẻ số (未回答/回答済み/金額再確認) → lọc + đồng bộ ô điều kiện, con số trên thẻ không đổi khi lọc
- ID của công ty khác → I400; mở 回答 khi 期限切れ/対応不可 → E410, không gửi được
- Gửi: không có file → E02; Word/Excel → E411; 11 file hoặc >5MB → E11; tổng chi tiết = 0 → E01
- 最短開始可能日 trống → E02; 有効期限 trống → E02, trước ngày trả lời → E08（và 有効期限 < 最短開始日: xem #11）
- NG: không chọn lý do → E02; lý do 「その他」 + comment trống → E01; comment 501 ký tự → E04
- Bấm 送信 → modal Q300 → 送信する → S304 / S305; double-click → 1 bản trả lời
- 回答を修正 trong hạn: form có sẵn nội dung cũ; 運営 sửa cùng lúc → E31

### OW_STAF（配送スタッフ）
- 登録: không có ảnh bằng lái → vẫn đăng ký được, trạng thái tự 「免許未登録」 và không phát hành tài khoản (I305)
- Tên/カナ 60 ký tự OK, 61 → E04; カナ hiragana → E03; email sai → E07; email trùng → E09（xem #2）
- ステータス 無効 khi đang phụ trách chuyến → (xem #5)
- Xoá: có chuyến 予定〜再配達待 → E412 chỉ nút 閉じる; không có → Q01 → S02, dòng hiện 「削除済」 chỉ khi lọc "表示する"
- アカウント一括発行: chọn người 無効/không email/không ảnh → I303/I304/I305 + W10, người đã có tài khoản → không gửi gì, không reset
- パスワード再設定 → Q302 → S306 (không hiện mã trên màn)
- CSV取込: file không phải UTF-8 / sai cột → E51; dòng lỗi bỏ qua, dòng đúng vẫn nhập (E52); 5,000 dòng OK, 5,001 → lỗi; ID có sẵn → 対象外; email trùng trong file → E09
- CSV tiếng Nhật xuất từ Excel (Shift_JIS) → xác nhận hiện E51 và hướng dẫn rõ ràng
- Tab ?tab=deliv: lọc kỳ/trạng thái, tổng 集金/駐車 theo toàn bộ kết quả; người đã xoá → tab vẫn xem được, không có nút sửa

### OW_PROF（プロフィール）
- 編集 → 2 tab cùng chuyển sang chế độ sửa, lưu 1 lần; đổi tab không mất dữ liệu đang nhập
- Tên trống → E01; 郵便番号 6 số → E05; điện thoại 9/12 số → E06; không còn メイン担当者 → E413
- Chưa chọn エリア/温度帯/保有車両 → E02
- 配送不可曜日 gồm cả 祝日 → khi lưu chuyển thành 対応曜日 (đảo), kiểm tra tất cả 7 ngày + 祝日
- 保存 → S01 và hiển thị ngay nội dung mới; thông báo gửi 運営H (không có mail)
- Nhập dở rồi chuyển menu / đóng trình duyệt → Q02; 2 người cùng sửa → E31 (I02 hiện người đang sửa)
- 住所検索 luôn hiện khi sửa; bảng 保冷バッグ chỉ đọc

## (c) Điểm máy báo nhưng là báo nhầm

- **D1 OW_AUTH 007 No.7.2 認証コード (4桁, 48px)**: mã nhập bằng **4 ô, mỗi ô 1 chữ số** (No.7 nói rõ); máy đo 1 ô nên báo nhầm.
- **D3 タブ cắt chữ** (OW_DELV 012 No.20, OW_PROF 001 No.2, OW_STAF 012 No.17): ảnh OW_PROF_001 / OW_DELV_012 cho thấy cả 2〜5 tab hiển thị đầy đủ; chỉ là khung `area` bao ngoài. Báo nhầm.
- **B4 "không có trạng thái không quyền"** (AUTH, DELV, PROF, STAF): Web đối tác chỉ có 1 vai trò (委託配送先管理者, `基本設計_全体の定義_提案` line 125, OW_HOME No.1.1); quyền admin 運営 thuộc 運営Web_権限表. Báo nhầm (không cần màn 権限なし).
- **U3 / Q6** cho OW_HOME 002, OW_STAF 002・004, OW_QUOT 002, OW_COLL/SCHD/TRBL/QUOT/DELV 画面 001・002 "thiếu trạng thái 0件 / lỗi nhập": những view này là trạng thái đã lọc của danh sách; 0件 (I01/I203/I301) đã có ở view khác (DELV 003, STAF 003, QUOT 004, TRBL 003, HOME No.4.2/5.2), ô tìm kiếm chỉ có text E04. Báo nhầm (trừ COLL: 0 dòng chưa có view riêng, mức thấp).
- **Q4 OW_AUTH 13.7 / OW_QUOT 20.2.2「行を削除」, AUTH 1.6「新規登録」**: chỉ xóa dòng trong form/chuyển màn hình, không phải thực thi phía server. Báo nhầm. **Q4 AUTH 5.3 認証コードを送信**: thiếu thông báo thành công (nên xét, mức thấp).
- **Q5 (DELV 13.5/19.5/23.1/25/39.3/40.1, STAF 12.1/16.x, PROF 1.3)**: điều kiện hiển thị/hoạt động đã nằm trong cột 動き của chính item (ví dụ 編集 chỉ khi trạng thái 出荷待以降, 削除 ẩn với 削除済み); chỉ cần ghi lại thành cột 条件 nếu muốn máy hết báo. Phần lớn báo nhầm.
- **D5/D6 (AUTH 016, QUOT 010/012, PROF 002, STAF 012)**: nhóm "地点/連絡先" có ý nghĩa nghiệp vụ, nút chính chỉ nằm dưới khung nhìn ở form dài. Báo nhầm hoặc mức thấp (có thể cố định nút).
- **D8 radio 17px (AUTH 016, PROF 002, DELV/STAF checkbox)**: ô là input, label vẫn click được; mức thấp (gộp vào #15).
- **U4 "新規登録/登録", "キャンセル/戻る/閉じる"**: khác chức năng (mở form vs gửi; huỷ vs quay lại vs đóng modal), không phải dao động tên. Báo nhầm, chỉ nên xem lại tên nút 「新規登録」 ở màn đăng nhập (thực chất là お申し込み).
- **D3 OW_SCHD 002 No.6 (tuần, 4 chỗ bị cắt)**: thật nhưng nhẹ; chip tên chi nhánh nên có tooltip (đã nằm trong thiết kế "ellipsis + tooltip" cần quy định).

## (d) Điểm cần đi qua 受付簿 và câu hỏi cho hong

**Đi qua 受付簿 (thay đổi quyết định 台帳)** — `CLAUDE.md`: không sửa 台帳/spec trực tiếp.

| # | 種別 | 内容 | 推奨 |
|---|---|---|---|
| 1 | 変更 | 台帳 F 2026-10-08「認証コード：入力回数の上限なし・5回間違えてもコードを無効にしない」。「2026/10/08 に △ と決めています。回数上限を設ける案に変えますか？」 | **推奨：5回間違えたらそのコードを無効（再送で新しいコード）、アカウントのロックはしない。**auto-login は維持するなら必須 |
| 2 | 変更/確認 | 台帳 F 2026-10-07「委託配送先のプロフィール：承認なし・通知のみ」の範囲。「社名・住所・対応エリアも即反映でよいか」 | **推奨：承認なしは維持。社名・法人情報は参照のみ（SW と同じ）にするか、最低でも 変更履歴 タブ + 通知に変更前後を載せる** |
| 3 | 確認→仕様 | 配送スタッフのメール重複（E09）と「管理者のメールを入れる」（配送_06 §12-3） | **推奨：同一委託配送先内ではメール重複を許可し、再設定はログインID+メールの組で確認** |

**hong への質問（推奨つき）**
1. 搬入経路図など「地点の資料」を委託配送先が削除してよいか（OW_DELV 39.3）。**推奨：不可（委託が上げた資料だけ削除可、地点の資料は参照のみ。配送_08・REQ-DL-826 のまま）。**
2. 配送スタッフを「無効／利用停止」にするとき、担当中の配送がある場合どうするか。**推奨：削除と同じく E412 相当で止め、付け替えを先にさせる。無効と利用停止の違い（誰が設定するか）を台帳に1行追加。**
3. E401 を出すタイミング。**推奨：パスワードが正しいときだけ E401、それ以外は E520（存在・停止を隠す）。文言は「いまのまま」。**
4. 集金管理「支払の明細（月）」の月の決め方。**推奨：専用の「対象月」を持つ（初期＝今日の月）。開始日からは決めない。**
5. 見積回答の「最短開始可能日」は日付か月（サイクル）か、また 見積の有効期限 ≥ 最短開始可能日 を必須にするか。**推奨：選択はサイクル（年月）にして、有効期限は開始日以降を必須。**
6. 認証コード／パスワード再設定の送り先（メイン担当者のみか、担当者全員か）。**推奨：メイン担当者のメールだけ。**
7. トラブル一覧の種類フィルター：自動報告（数量相違・未配送）を含めるか。**推奨：含める（種類マスタに合わせる）。**
8. 同時更新（E31）のメッセージ I02 を E31 に揃えてよいか（台帳 M-1 の旧行を直し漏れとして整理）。**推奨：揃える。**

**データ・画面を直すだけ（ユーザーの了解後）**：#4（CA-YYYYMMDD-NNNN）、#8、#10、#12、#14、#15。
