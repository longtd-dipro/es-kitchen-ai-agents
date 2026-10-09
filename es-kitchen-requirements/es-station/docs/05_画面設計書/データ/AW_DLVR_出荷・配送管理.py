# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ 配送管理 ＞ 出荷・配送管理（一覧・詳細・編集）（AW_DLVR_001〜003）
元：本物の Web（app/ops/delivery/list/**・_components/{DeliveryDetail,DetailModals,kit}・lib/ops/delivery/**・lib/ops/areas/delivery.ts・lib/domain/areas/delivery.ts）。
決まり：docs/決定台帳.md F「運営D 出荷・配送管理（確認メモ D-2 Q1〜Q9）」、B・E・K・L・M-4、受付簿 No.293、確認メモ_AW_運営D_配送.md（hong 回答 2026-10-07）。
出荷指示・取込（AW_SHIP_001）は別ファイル（別担当）。スケジュールの移動（MoveShipments）・変更申請の一括承認（ChangeRequests）は AW_SCHD。ここでは行き先だけ書く。
コードと決定が違うところは決定どおりに書き、demo_ok に宿題（コードを直す）を書く。決まっていないことは chk に書く（hong に聞く）。
"""

TITLE = ["出荷・配送管理（AW_DLVR）", "Quản lý xuất kho・giao hàng (AW_DLVR)"]
SHEET = ["出荷・配送管理", "Xuất kho・giao hàng"]
BASENAME = "画面設計書_AW_DLVR_出荷・配送管理"
IMG_PREFIX = "AW_DLVR"
OUT_DIR = "AW_DLVR_出荷・配送管理"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>。AW＝運営管理者Web、DLVR＝出荷・配送管理（Delivery）。001＝一覧、002＝詳細、003＝編集、004＝特例の配送を追加。出荷指示・取込は AW_SHIP（別ファイル）",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, DLVR = quản lý xuất kho・giao hàng (Delivery). 001 = danh sách, 002 = chi tiết, 003 = sửa, 004 = thêm giao hàng đặc biệt. Chỉ thị xuất kho・nhập là AW_SHIP (tệp riêng)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full）＋商品管理＋営業。見本：中村幸子。経理＝Ad00012（R）、物流＝Ad00011（R/U）
CODE_PATHS = ["app/ops/delivery/list", "app/ops/delivery/_components", "lib/ops/delivery", "lib/ops/areas/delivery.ts", "lib/domain/areas/delivery.ts", "lib/domain/seed"]

_SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"
DECISIONS = [
    {"date": "2026-10-08", "target": "AW_DLVR_001 No.1.5・AW_DLVR_004（特例の配送を追加）",
     "q": ["運営が手動で配送を追加できるか（HTML レビュー D-1）", "運営 có thêm giao hàng thủ công được không (review HTML D-1)"],
     "a": ["特例の配送を運営が手動で追加できる（客先の特例の要望）。詳細（契約・拠点／日付／商品と数量／温度帯／理由／出荷指示・請求への流れ）は同日の続きの回答で確定（下の行）。権限は作成ができる役割（フル権限・営業・CS・商品管理・商品開発。物流 R/U は出ない）",
           "運営 thêm được giao hàng đặc biệt thủ công (yêu cầu đặc biệt của khách). Chi tiết (hợp đồng・chi nhánh / ngày / sản phẩm và số lượng / nhiệt độ / lý do / luồng sang chỉ thị xuất kho・thanh toán) được chốt ở các dòng bên dưới. Quyền: vai trò có quyền tạo (フル権限・営業・CS・商品管理・商品開発; 物流 R/U không thấy)"],
     "src": "hong 回答 2026-10-08（HTML レビュー）"},
    {"date": "2026-10-07", "target": "AW_DLVR_002 No.1.8・1.9、AW_DLVR_001 No.5.10（操作の権限）",
     "q": ["取消・複製・再送・出荷実績／送り状の取込をだれができるか（権限表は 物流 R/U・営業・CS・商品系 CRUD。コードは 取消＝削除権・複製＝作成権・取込＝CSV取込権）",
           "Ai làm được 取消・複製・gửi lại・nhập kết quả xuất kho/phiếu gửi? (bảng quyền: 物流 R/U; 営業・CS・商品系 CRUD; code: 取消 = quyền xóa, 複製 = quyền tạo, nhập = quyền CSV取込)"],
     "a": ["B：取消・複製・再送・取込は「機能ごとの操作」。物流（R/U）もできる。営業・CS・商品系（CRUD）もできる。経理（R）はできない（コードの操作の権限を 更新 系に直す）",
           "B: 取消・複製・gửi lại・nhập là \"thao tác theo chức năng\"; 物流 (R/U) cũng làm được; 営業・CS・商品系 (CRUD) làm được; 経理 (R) không (sửa quyền thao tác trong code sang nhóm 更新)"],
     "src": _SRC + " Q1＝B・台帳 F・受付簿 No.293"},
    {"date": "2026-10-07", "target": "AW_DLVR_002（ボタン）",
     "q": ["「中止」の直接のボタンを作るか（出荷後に止めるとき）", "Có làm nút 「中止」 trực tiếp không (khi dừng sau xuất kho)?"],
     "a": ["B：作らない。中止は「トラブルを代理登録 → 対応を決める → 納品せずに終了する」で行う（配送_04 §7-7 をコードに合わせて直す）",
           "B: Không làm. 中止 thực hiện qua 「トラブルを代理登録 → 対応を決める → 納品せずに終了する」 (sửa 配送_04 §7-7 cho khớp code)"],
     "src": _SRC + " Q2＝B・台帳 F・受付簿 No.293"},
    {"date": "2026-10-07", "target": "AW_DLVR_003 No.3（日付の変更）・AW_DLVR_002 の帯",
     "q": ["編集の日付の変更を、スケジュールの移動とどう揃えるか／ロック（locked）の定義",
           "Đổi ngày ở màn sửa khớp thế nào với 移動 ở スケジュール / định nghĩa locked"],
     "a": ["B：編集に日付の変更欄を残し、スケジュールの移動と同じ規則を使う（本発注の前／後・1便・出荷指示を送ったあとは版 rev＋1・通知）。ロック（locked）＝出荷指示の初回の送信成功",
           "B: Giữ ô đổi ngày ở màn sửa, dùng cùng quy tắc với 移動 ở スケジュール (trước/sau 本発注・1 chuyến・rev+1 nếu đã gửi chỉ thị・thông báo). locked = lần gửi chỉ thị xuất kho thành công đầu tiên"],
     "src": _SRC + " Q3＝B・台帳 F・受付簿 No.293"},
    {"date": "2026-10-07", "target": "AW_DLVR_002 No.4.12（出荷指示の欄）",
     "q": ["出荷指示の「再送」はいま手動か（AW_SHIP が詳しく書く）。この画面の「出荷指示」欄に関係する部分",
           "「再送」 của chỉ thị xuất kho hiện là thủ công (AW_SHIP viết chi tiết); phần liên quan tới ô 「出荷指示」 ở màn này"],
     "a": ["B（いま）：変更した行の CSV を出し、運営が THOMAS に登録して「送信済にする」を押す。ES の自動送信はフェーズ3（将来）。この画面の「出荷指示」欄は 未送信／送信済 rev n の表示だけ",
           "B (hiện tại): xuất CSV các dòng đã đổi, 運営 đăng ký vào THOMAS rồi bấm 「送信済にする」. ES tự gửi là giai đoạn 3 (tương lai). Ô 「出荷指示」 ở màn này chỉ hiển thị 未送信 / 送信済 rev n"],
     "src": _SRC + " Q4＝B（将来A）・台帳 F・受付簿 No.293"},
    {"date": "2026-10-07", "target": "AW_DLVR_002 の状態 042〜044",
     "q": ["見本データにない状態（送信失敗・取込エラー・中止・再配送待）をどう設計書に出すか", "Trạng thái không có trong dữ liệu mẫu (gửi lỗi・lỗi nhập・中止・再配送待) thể hiện thế nào?"],
     "a": ["C：送信失敗は説明だけ（AW_SHIP 側・demo_ok・撮らない）。取込エラーは見本（IM2）で撮る（AW_SHIP 側）。中止・再配送待は操作（トラブル代理登録 → 対応を決める）で作って撮る（この画面の状態 042〜044）",
           "C: 送信失敗 chỉ mô tả (bên AW_SHIP・demo_ok・không chụp). Lỗi nhập chụp bằng mẫu IM2 (bên AW_SHIP). 中止・再配送待 tạo bằng thao tác rồi chụp (trạng thái 042〜044 của màn này)"],
     "src": _SRC + " Q5＝C・台帳 F・受付簿 No.293"},
    {"date": "2026-10-07", "target": "ステータスのバッジの色（AW_DLVR_001 No.5.5・5.6、AW_DLVR_002 No.1.3・4.1）",
     "q": ["配送のステータス・変更申請のバッジの色", "Màu badge trạng thái giao hàng・đơn xin đổi"],
     "a": ["B：出荷済・受取済＝青／納品済＝緑／再配送待・確認中＝黄／変更申請 申請中＝黄・提案中＝青・調整済＝灰（変更可・変更不可はバッジなし）。ほかは共通の表（予定・出荷待＝青、一部納品済＝黄、中止・取消＝灰）",
           "B: 出荷済・受取済 = xanh dương / 納品済 = xanh lá / 再配送待・確認中 = vàng / đơn xin đổi: 申請中 = vàng, 提案中 = xanh dương, 調整済 = xám (変更可・変更不可 không badge). Còn lại theo bảng chung (予定・出荷待 = xanh dương, 一部納品済 = vàng, 中止・取消 = xám)"],
     "src": _SRC + " Q6＝B・台帳 F・受付簿 No.293・P-STATUS-COLORS"},
    {"date": "2026-10-07", "target": "AW_DLVR_003 No.2.7（配達時間帯）",
     "q": ["配達時間帯を編集で直せるか", "Có sửa được 配達時間帯 ở màn sửa không?"],
     "a": ["B：編集では読み取りのみ。直すときは拠点マスタ（受取時間帯のスナップショット）で直す", "B: Chỉ đọc ở màn sửa. Muốn sửa thì sửa ở master 拠点 (snapshot khung giờ nhận hàng)"],
     "src": _SRC + " Q7＝B・台帳 F・受付簿 No.293"},
    {"date": "2026-10-07", "target": "AW_DLVR_002 のモーダル全部・AW_DLVR_003（離脱）",
     "q": ["入力中のモーダルを閉じるときの確認（Q02）", "Xác nhận (Q02) khi đóng cửa sổ đang nhập"],
     "a": ["A：入力したあとは Esc・×・キャンセル・背景クリックのすべてで Q02 を出す（取消・複製・代理登録・対応を決める・変更申請の確認）",
           "A: Sau khi đã nhập, Esc・×・キャンセル・bấm nền đều hiện Q02 (取消・複製・代理登録・対応を決める・変更申請の確認)"],
     "src": _SRC + " Q8＝A・台帳 F・受付簿 No.293（全サイト共通の Q02：2026-10-05）"},
    {"date": "2026-10-07", "target": "取消のモーダル「法人Webの表示」（AW_DLVR_002）",
     "q": ["取消した配送は法人Webに何と出すか", "Giao hàng đã hủy hiển thị gì trên Web công ty?"],
     "a": ["A：「表示しない（取消の配送は法人Webに出ない）」。「配送日調整中」のバッジは使わない（受付簿 No.160）",
           "A: 「表示しない（取消の配送は法人Webに出ない）」. Không dùng badge 「配送日調整中」 (受付簿 No.160)"],
     "src": _SRC + " Q9＝A・台帳 F・受付簿 No.293・No.160"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.2・3（契約・拠点）', "q": ['特例の配送の契約・拠点の決め方（Q1）', 'Cách xác định hợp đồng・chi nhánh (Q1)'], "a": ['拠点は必須。契約（子契約）は任意（選ぶとその契約のプラン・配送区分を初期値にする。選ばないときは配送区分を運営が選ぶ）', 'Chi nhánh bắt buộc. Hợp đồng (hợp đồng con) không bắt buộc (chọn thì lấy gói・phân loại giao hàng của hợp đồng làm giá trị ban đầu; không chọn thì 運営 chọn phân loại giao hàng)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.4・5（納品日・出荷日）', "q": ['納品日と出荷日の決め方（Q2）', 'Cách xác định ngày giao và ngày xuất kho (Q2)'], "a": ['納品日と出荷日の両方を運営が入力する（リードタイムから自動計算しない。日付の共通部品）。出荷日は納品日以前（E178）。出荷日が倉庫の出荷不可日なら警告 W136（止めない）', '運営 nhập cả ngày giao và ngày xuất kho (không tự tính từ lead time; ô ngày chung). Ngày xuất ≦ ngày giao (E178). Ngày xuất trùng ngày không xuất của kho thì cảnh báo W136 (không chặn)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.6・7（商品・数量・温度帯）', "q": ['商品・数量・温度帯の決め方（Q3・Q4）', 'Cách chọn sản phẩm・số lượng・nhiệt độ (Q3・Q4)'], "a": ['商品と数量は運営が手で選ぶ（商品の追加行・数量。プランの標準・上限は適用しない）。温度帯も運営が手で選ぶ', '運営 chọn thủ công sản phẩm và số lượng (dòng thêm sản phẩm・số lượng; không áp dụng mức chuẩn・giới hạn của gói). Nhiệt độ cũng do 運営 chọn thủ công'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.9（理由）', "q": ['理由は必須か・形式（Q5）', 'Lý do có bắt buộc không・dạng nhập (Q5)'], "a": ['理由は必須（自由記入・複数行 500字）', 'Lý do bắt buộc (nhập tự do・nhiều dòng 500 ký tự)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.10・AW_DLVR_001 No.5（出荷指示・請求・ラベル）', "q": ['出荷指示・請求への流れ（Q6）', 'Luồng sang chỉ thị xuất kho・thanh toán (Q6)'], "a": ['出荷指示にも流す（通常の配送と同じ：出荷待→出荷指示の対象・版・送り状）。一覧・詳細に「特例」のラベルを出す。請求：特例の配送そのものには料金の欄を持たない（料金が必要なときは運営が単発のオプションなどで別に足す。配送データは請求を作らない）', 'Cũng chảy sang chỉ thị xuất kho (giống giao hàng thường: 出荷待 → đối tượng chỉ thị・phiên bản・phiếu gửi). Hiện nhãn 「特例」 ở danh sách・chi tiết. Thanh toán: bản thân giao hàng đặc biệt không có ô phí (khi cần phí 運営 thêm riêng bằng tùy chọn đơn lẻ v.v.; dữ liệu giao hàng không tạo thanh toán)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.11（複製との違い）', "q": ['トラブルの複製との違い（Q7）', 'Khác với 複製 của sự cố (Q7)'], "a": ['複製は親の配送を元にひな形を引き継ぐ（枝番つき）。特例は何もない状態から作り、親の配送を持たない（枝番なし。配送No は通常の採番）', '複製 kế thừa mẫu từ giao hàng cha (có số nhánh). Đặc biệt tạo từ trạng thái trống, không có giao hàng cha (không số nhánh; 配送No đánh số như thường)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_004 No.8（配送パターン）', "q": ['配送パターンの扱い（Q8）', 'Xử lý mẫu giao hàng (Q8)'], "a": ['配送パターンは運営が選ぶ（既存の選択肢から選ぶ。既定は都度配送）', '運営 chọn mẫu giao hàng (trong các lựa chọn có sẵn; mặc định là 都度配送)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
    {"date": "2026-10-08", "target": 'AW_DLVR_001 No.1.5・AW_DLVR_004 No.13（権限）', "q": ['特例の配送を追加できる役割（Q9）', 'Vai trò được thêm giao hàng đặc biệt (Q9)'], "a": ['権限は権限の画面で決める（機能「出荷・配送管理」の「作成」の操作。初期値はフル権限・営業・CS・商品管理・商品開発）', 'Quyền do màn 「権限」 quyết định (thao tác 「作成」 của chức năng 「出荷・配送管理」; mặc định フル権限・営業・CS・商品管理・商品開発)'], "src": "hong 回答 2026-10-08（HTML レビュー・特例の配送）"},
]
DECISIONS += [
    {"date": "2026-10-07", "target": 'AW_DLVR_001 No.3.9・5.4・1.4', "q": ['条件・列の名前「配送方法」を「便種別」にそろえるか', 'Có thống nhất tên điều kiện・cột 「配送方法」 thành 「便種別」 không?'], "a": ['D1：「便種別」にそろえる（詳細・スケジュールと同じ）', 'D1: Thống nhất 「便種別」 (giống chi tiết・スケジュール)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D1'},
    {"date": "2026-10-07", "target": 'AW_DLVR_001 No.3.19', "q": ['検索後のトースト「検索しました…」を残すか', 'Có giữ toast 「検索しました…」 sau khi tìm không?'], "a": ['D2：出さない（P-LIST。コードは出している＝demo_ok）', 'D2: Không hiện (P-LIST; code đang hiện = demo_ok)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D2'},
    {"date": "2026-10-07", "target": 'AW_DLVR_002 No.11.11〜11.17（実績を直す）', "q": ['実績（完了日時・納品数・備考）と駐車料金を直す入口をどこに置くか', 'Đặt lối sửa kết quả (ngày giờ hoàn tất・số lượng giao・ghi chú) và phí đỗ xe ở đâu?'], "a": ['D3：実績タブの中（直すボタン → 入力 → 保存。理由必須・変更履歴）。編集画面には足さない', 'D3: Trong tab 実績 (nút sửa → nhập → lưu; bắt buộc lý do・lưu 変更履歴). Không thêm vào màn sửa'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D3'},
    {"date": "2026-10-07", "target": 'AW_DLVR_002 No.17', "q": ['存在しない配送No の文言を共通の E100 にするか', 'Câu khi 配送No không tồn tại có dùng E100 chung không?'], "a": ['D4：E100「{対象}（{ID}）が見つかりません。」を使う', 'D4: Dùng E100 「{対象}（{ID}）が見つかりません。」'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D4'},
    {"date": "2026-10-07", "target": 'AW_DLVR_002 No.18.10', "q": ['日付の形式エラーの専用メッセージを作るか', 'Có tạo thông báo riêng cho lỗi sai dạng ngày không?'], "a": ['D5：作らない（date picker。ほかのエラーは E161〜E163 のみ）', 'D5: Không tạo (date picker; các lỗi khác chỉ có E161〜E163)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D5'},
    {"date": "2026-10-07", "target": 'AW_DLVR_003 No.3', "q": ['編集の日付変更の規則・メッセージ', 'Quy tắc・thông báo khi đổi ngày ở màn sửa'], "a": ['D6：AW_SCHD の移動と同じ（E160〜E163・W130〜W132。出荷日の前日まで・資材便不可・本発注の前は何便でも／後は1便・同じ半分・理由必須・出荷不可日／休日は不可・警告は止めない・版+1で再送・通知）', 'D6: Giống 移動 của AW_SCHD (E160〜E163・W130〜W132; tới ngày trước xuất・không chuyến 資材・trước 本発注 nhiều chuyến / sau 1 chuyến・cùng nửa・bắt buộc lý do・ngày không xuất / ngày nghỉ không được・cảnh báo không chặn・rev+1 gửi lại・thông báo)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D6'},
    {"date": "2026-10-07", "target": 'AW_DLVR_003 No.3.3', "q": ['本発注より前の配送（予定）も編集から日付を変えられるか', 'Giao hàng trước 本発注 (予定) có đổi ngày từ màn sửa được không?'], "a": ['D7：変えられる（同じ規則・1便ずつ）', 'D7: Được (cùng quy tắc・từng chuyến một)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D7'},
    {"date": "2026-10-07", "target": 'AW_DLVR_003 No.5', "q": ['編集中に即保存の操作（メモ・送り状番号・資料の追加）を押せるか', 'Khi đang sửa có bấm được thao tác lưu ngay (ghi chú・số phiếu gửi・thêm tài liệu) không?'], "a": ['D8：編集中の未保存の内容があるあいだは非活性（P-MODAL-SAVE）', 'D8: Vô hiệu khi còn nội dung chưa lưu (P-MODAL-SAVE)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D8'},
    {"date": "2026-10-07", "target": 'AW_DLVR_003 No.7', "q": ['納品済・中止・取消の /edit を直接開いたときの見せ方', 'Cách thể hiện khi mở trực tiếp /edit của 納品済・中止・取消'], "a": ['D9：詳細へ戻して I03「{理由}（見るだけ）」を出す', 'D9: Quay về chi tiết và hiện I03 「{理由}（見るだけ）」'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D9'},
    {"date": "2026-10-07", "target": 'AW_DLVR_002 No.1.13', "q": ['詳細の補助機能（検索・すべて開く／閉じる・カード目次・編集できる項目だけ）を出すか', 'Có hiện chức năng phụ ở chi tiết (tìm mục・mở/đóng tất cả・mục lục card・chỉ mục sửa được) không?'], "a": ['D10：出さない', 'D10: Không hiện'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） D10'},
    {"date": "2026-10-07", "target": 'AW_DLVR_001 No.5・5.11、AW_DLVR_002 No.13.2・16.2（ページ送り）', "q": ['一覧の表示件数の選択肢と初期値', 'Lựa chọn và giá trị ban đầu của số dòng hiển thị'], "a": ['10／20／50／100・初期 10（この画面のすべての一覧）', '10/20/50/100, mặc định 10 (mọi danh sách ở các màn này)'], "src": 'hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B） 表示件数'},
    {"date": "2026-10-08", "target": 'AW_DLVR_001 No.3.2・3.9・5.3・5.4、AW_DLVR_002 No.2.9・4.11・9.2、AW_DLVR_003 No.3.1、変更申請の処理 No.21.6（件数の数え方）', "q": ['営業サンプルの配送データを運営D の一覧でどう見せるか。1日300件に数えるか（運営C2・確認表 C2-10）', 'Dữ liệu giao hàng của mẫu kinh doanh hiển thị thế nào ở danh sách vận hành D. Có tính vào 300 chuyến/ngày không (Vận hành C2・bảng xác nhận C2-10)'],
     "a": ['運営D の一覧に種類「サンプル」で出す（便種別の値に「サンプル」を足す）。契約・拠点は空（営業サンプルは法人・拠点・契約とつながない）。1日300件の上限の件数にも数える。配送データは営業サンプルの受付を締めたとき、出荷指示と同時に作る（AW_SMP）。委託配送先Web（OW）での見え方は OW 側の設計書で決める', 'Hiện ở danh sách vận hành D với loại 「サンプル」 (thêm 「サンプル」 vào giá trị loại chuyến). Hợp đồng・chi nhánh để trống (mẫu kinh doanh không liên kết với công ty・chi nhánh・hợp đồng). Cũng tính vào giới hạn 300 chuyến/ngày. Dữ liệu giao hàng được tạo cùng chỉ thị xuất hàng khi chốt tiếp nhận mẫu kinh doanh (AW_SMP). Cách hiển thị ở Web công ty vận chuyển ủy thác (OW) sẽ quyết ở tài liệu thiết kế OW'],
     "src": 'hong 回答 2026-10-08（確認表 C2-10）・台帳 S「営業サンプルの配送データの見せ方」・受付簿 #451'},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_DLVR_001", "ja": "出荷・配送管理 一覧", "vi": "Danh sách quản lý xuất kho・giao hàng"},
    {"code": "AW_DLVR_002", "ja": "出荷・配送データ詳細", "vi": "Chi tiết dữ liệu xuất kho・giao hàng"},
    {"code": "AW_DLVR_003", "ja": "出荷・配送データ編集", "vi": "Sửa dữ liệu xuất kho・giao hàng"},
    {"code": "AW_DLVR_004", "ja": "特例の配送を追加", "vi": "Thêm giao hàng đặc biệt"},
]


# ---------------------------------------------------------------- 書きやすくする道具
def F(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=600, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (JS + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d


# 宿題（コードは決定・仕様に未対応）の書き方：demo_ok（決定が正・コードを直す）
H_SORT = ["並べ替えは4通り（出荷日・納品日の昇順／降順）だけ。決定は全列で並べ替え（台帳 K「一覧の決まり」）", "Code chỉ có 4 cách sắp xếp (ngày xuất/giao tăng/giảm). Quyết định: sắp xếp được mọi cột (台帳 K)"]
H_PERIOD = ["コードは期間を 2026/09/28〜11/15 に固定。決定は「出荷日基準・当週から2週間」（配送_08 §15-5）", "Code cố định 2026/09/28〜11/15. Quyết định: cơ sở ngày xuất, từ tuần hiện tại 2 tuần (配送_08 §15-5)"]
H_ROUTE = ["「経路の列を表示」のスイッチはあるが列がない（配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別。配送_08 §15-5）。列を作る", "Có công tắc nhưng chưa có cột (配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別; 配送_08 §15-5). Làm các cột"]
H_COND = ["スケジュールと共通の条件のうち 配送パターン・配送回数・割当状況 が一覧にない（配送_08 §15-5）。割当はスイッチ「ドライバー未割当のみ」だけ。足す", "Điều kiện chung với スケジュール: 配送パターン・配送回数・割当状況 chưa có ở danh sách (配送_08 §15-5); chỉ có công tắc 「ドライバー未割当のみ」. Thêm vào"]
H_BAND = ["コードの帯は「1,284件・2026-11-09 以降」で固定。期間に合わせて件数と最初の日を計算する（配送_08 §15-5）", "Code cố định 「1,284件・2026-11-09 以降」. Tính theo kỳ đang chọn (配送_08 §15-5)"]
H_EMPTY = ["コードの文言「条件に合うデータはありません」。0件は I01（P-LIST）", "Code ghi câu khác; 0 dòng dùng I01 (P-LIST)"]
H_MEMORY = ["戻ったときの条件・ページ・表示件数の復元と、表示件数を人ごとに覚えることをコードはしていない（useState のみ）。P-LIST・P-PAGESIZE が正", "Code chưa khôi phục điều kiện/trang/số dòng và chưa nhớ số dòng theo người (chỉ useState). P-LIST・P-PAGESIZE đúng"]
H_CRBADGE = ["変更申請の列は文字だけ（バッジでない）。決定は文字のバッジ（配送_08 §15-3）：申請中＝黄・提案中＝青・調整済＝灰（共通の色の表は 提案中＝黄 なので、提案中を青に直す）", "Cột 変更申請 chỉ là chữ (không badge). Quyết định: badge chữ (配送_08 §15-3): 申請中 = vàng, 提案中 = xanh dương, 調整済 = xám (bảng màu chung đang để 提案中 = vàng; sửa thành xanh dương)"]
H_TAB = ["タブを URL（?tab=）に書かない（最初に読むだけ）。タブの件数は「トラブル 3」の形（コードは「トラブル（3）」）。P-TAB が正", "Tab không ghi vào URL (?tab=; chỉ đọc lúc đầu). Số đếm dạng 「トラブル 3」 (code: 「トラブル（3）」). P-TAB đúng"]
H_MAXLEN = ["入力欄に最大文字数の制御がない（メモ・理由は複数行 500字・絵文字不可 E13。台帳 F）", "Ô nhập chưa giới hạn số ký tự (メモ・理由 nhiều dòng 500 ký tự, không emoji E13; 台帳 F)"]
H_Q02 = ["モーダルは Esc・×・背景クリックで確認なしに閉じる。入力したあとは Q02 を出す（hong 2026-10-07 Q8＝A）", "Modal đóng bằng Esc・×・bấm nền không hỏi. Sau khi đã nhập phải hiện Q02 (hong 2026-10-07 Q8 = A)"]
H_SAMPLE = ["モーダルの日付・地点表・申請者などは見本の固定値（コード）。実データにつなぐ（受付簿 No.47 は帯と実績だけ）", "Ngày・bảng địa điểm・người xin trong modal là giá trị mẫu cố định (code). Nối với dữ liệu thật (受付簿 No.47 chỉ làm ở khung và 実績)"]
H_TOAST = ["トーストがコードごとに別の文言。S133・S134 など共通の ID に揃える", "Toast mỗi chỗ một câu trong code. Đồng nhất về ID chung như S133・S134"]
H_MULTI = ["理由・内容・メモに最大文字数の制御がなく、1行の欄。メモ・理由は複数行 500字（input_standard・台帳 F）", "Ô lý do・nội dung・メモ không giới hạn ký tự và là 1 dòng. メモ・lý do là nhiều dòng 500 ký tự (input_standard・台帳 F)"]

# JavaScript の部品（setup の先頭に付ける）
JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:el.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};"
      "const btn=t=>[...document.querySelectorAll('button,a')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);"
      "const fld=l=>[...document.querySelectorAll('.es-field')].find(f=>(f.querySelector('.es-field__label')?.textContent||'').replace('*','').trim()===l);"
      "const tab=n=>{[...document.querySelectorAll('[role=tab]')].find(b=>b.textContent.trim().startsWith(n)).click();};")
SEARCH = "q('.es-search button[type=submit]').click();await sleep(500);"


# ---------------------------------------------------------------- 特例の配送を追加（hong 回答 2026-10-08 で確定）
SP_NEW = ["コードにない。足す（hong 2026-10-08 の回答どおりに作る）", "Code chưa có. Cần thêm (làm đúng theo trả lời của hong 2026-10-08)"]


# ================================================================ AW_DLVR_001 一覧
SELF = ["フル権限・営業・CS・商品管理・商品開発（CRUD）と物流（R/U）に表示。経理（R）・閲覧のみには出ない", "Hiện với フル権限・営業・CS・商品管理・商品開発 (CRUD) và 物流 (R/U). 経理 (R)・閲覧のみ không thấy"]

L_HEAD = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      detail=["パンくず「配送管理 / 出荷・配送管理」・画面名・ボタン（出荷指示・取込／特例の配送を追加／CSV出力）。メニュー「配送管理」の配下。", "Breadcrumb 「配送管理 / 出荷・配送管理」, tên màn hình, nút (出荷指示・取込 / CSV出力). Nằm dưới menu 「配送管理」."]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「配送管理 / 出荷・配送管理」。「配送管理」は動かない文字。", "「配送管理 / 出荷・配送管理」. 「配送管理」 chỉ là chữ, không bấm được."]),
    F("1.2", "画面名", "Tên màn hình", ".es-pagehead__title", "label", detail=["「出荷・配送管理」。", "Tiêu đề 「出荷・配送管理」."]),
    F("1.3", "出荷指示・取込", "Chỉ thị xuất kho・nhập", ".es-pagehead__actions a::出荷指示・取込", "link", "click",
      detail=["出荷指示・取込の画面（AW_SHIP_001・別ファイル）へ。出荷指示の送信（いまは手動）と、出荷実績・送り状の取込はそちらで行う。", "Sang màn 出荷指示・取込 (AW_SHIP_001, tệp riêng). Gửi chỉ thị xuất kho (hiện thủ công) và nhập kết quả xuất kho・phiếu gửi làm ở đó."]),
    F("1.4", "CSV出力", "Xuất CSV", ".es-pagehead__actions button::CSV出力", "button", "click", pattern="P-CSV-OUT",
      detail=["検索条件（期間・基準を含む）のとおりの全件。列＝画面の列（配送No・出荷日（実績）・拠点名・温度帯・便種別・状態・変更申請・出荷予定日・納品日・配送スタッフ）に配送データの全項目を足す。閲覧できる役割すべてに出す。完了はトースト S12。",
              "Toàn bộ theo điều kiện tìm kiếm (gồm kỳ và cơ sở ngày). Cột = các cột trên màn hình (配送No・出荷日（実績）・拠点名・温度帯・便種別・状態・変更申請・出荷予定日・納品日・配送スタッフ) cộng toàn bộ trường của dữ liệu giao hàng. Hiện với mọi vai trò xem được. Xong hiện toast S12."],
      err=["S12"]),
    F("1.5", "特例の配送を追加", "Thêm giao hàng đặc biệt", ".es-pagehead__actions button::特例の配送を追加", "button", "click", cond=["権限は「権限」の画面で決める（機能「出荷・配送管理」の「作成」の操作。初期値はフル権限・営業・CS・商品管理・商品開発）。権限がない役割（初期値では物流 R/U・経理 R・閲覧のみ）には出ない（hong 2026-10-08 Q9）", "Quyền do màn 「権限」 quyết định (thao tác 「作成」 của chức năng 「出荷・配送管理」; mặc định フル権限・営業・CS・商品管理・商品開発). Vai trò không có quyền (mặc định 物流 R/U・経理 R・chỉ xem) không thấy (hong 2026-10-08 Q9)"],
      detail=["特例の配送（客先の特例の要望）を運営が手で追加する入力画面（AW_DLVR_004）を開く。複製（親の配送から作る）とは別で、何もない状態から作る。追加した配送は一覧に「特例」のラベル付きで出る（No.5 の配送No の横）。", "Mở màn nhập (AW_DLVR_004) để 運営 thêm thủ công giao hàng đặc biệt (yêu cầu đặc biệt của khách). Khác với 複製 (tạo từ giao hàng cha), tạo từ trạng thái trống. Giao hàng đã thêm hiện trong danh sách kèm nhãn 「特例」 (cạnh 配送No ở No.5)."],
      demo_ok=SP_NEW),
]
L_PERIOD = [
    F("2", "期間", "Kỳ", ".dnav", "area", detail=["期間（開始日〜終了日）。基準（出荷／納品・配送）で、出荷日と納品日のどちらで絞るかが変わる。", "Kỳ (từ ngày〜đến ngày). Tùy cơ sở (出荷 / 納品・配送) mà lọc theo ngày xuất kho hoặc ngày giao."]),
    F("2.1", "期間（開始日）", "Kỳ (từ ngày)", 'input[placeholder="開始日（yyyy-mm-dd）"]', "date", "input", req="－",
      len="日付 yyyy-mm-dd", init=["当週の月曜（出荷日基準）", "Thứ Hai của tuần hiện tại (cơ sở ngày xuất)"], ex=["2026-10-05", "Ngày bắt đầu của kỳ; chọn trong lịch hoặc gõ yyyy-mm-dd"],
      valid=["日付の共通部品（yyyy-mm-dd）。開始日だけ・終了日だけでもよい。", "Ô ngày chung (yyyy-mm-dd). Chỉ nhập ngày bắt đầu hoặc chỉ ngày kết thúc cũng được."],
      detail=["初期は出荷日基準で、当週から2週間（配送_08 §15-5）。Enter で検索。", "Ban đầu cơ sở ngày xuất, từ tuần hiện tại 2 tuần (配送_08 §15-5). Enter để tìm."],
      demo_ok=H_PERIOD),
    F("2.2", "期間（終了日）", "Kỳ (đến ngày)", 'input[placeholder="終了日（yyyy-mm-dd）"]', "date", "input", req="－",
      len="日付 yyyy-mm-dd", init=["開始日から2週間後", "2 tuần sau ngày bắt đầu"], ex=["2026-10-18", "Ngày kết thúc của kỳ"],
      valid=["日付の共通部品。開始日より前は選べない。", "Ô ngày chung. Không chọn được ngày trước ngày bắt đầu."],
      detail=["期間の終わり。Enter で検索。", "Ngày cuối của kỳ. Enter để tìm."], demo_ok=H_PERIOD),
]
L_SEARCH = [
    F("3", "検索条件", "Điều kiện tìm kiếm", ".es-search", "area", pattern="P-LIST",
      detail=["「検索」か Enter で反映（入力中は変えない・「未適用」の印なし）。条件が2行以上に折り返すときだけ開閉ボタンを出す。右に「クリア」「検索」。", "Áp dụng khi nhấn 検索 hoặc Enter (không đổi khi đang gõ・không hiện dấu 未適用). Nút đóng/mở chỉ hiện khi điều kiện xuống ≥2 dòng. Bên phải có 「クリア」「検索」."],
      demo_ok=H_MEMORY),
    F("3.1", "基準", "Cơ sở ngày", ".es-seg", "radio", "click", req="－",
      len=["選択（出荷／納品・配送）", "Chọn (xuất kho / giao hàng)"], init=["出荷", "出荷 (ngày xuất kho)"], ex=["納品・配送", "出荷 = lọc kỳ theo ngày xuất kho; 納品・配送 = theo ngày giao"],
      detail=["期間を出荷日と納品日のどちらで絞るか。切り替えたあと「検索」で反映する。", "Lọc kỳ theo ngày xuất kho hay ngày giao. Đổi xong nhấn 「検索」 để áp dụng."]),
    F("3.2", "キーワード（法人・拠点・契約）", "Từ khóa (công ty・chi nhánh・hợp đồng)", 'input[placeholder="法人ID・名、拠点ID・名、契約ID"]', "text", "input", req="－",
      len="文字列 60", init=["空", "Trống"], ex=["株式会社サンプル", "Khớp một phần với ID・tên công ty, ID・tên chi nhánh, ID hợp đồng (và 配送No)"],
      detail=["配送No・拠点名・法人名などに含まれる文字で絞る（部分一致）。営業サンプルの配送は契約・拠点・法人が空なので、これらの文字では見つからない（配送No や 宛先の住所などで探す。2026-10-08）。", "Lọc theo chữ có trong 配送No・tên chi nhánh・tên công ty… (khớp một phần). Giao hàng của mẫu kinh doanh có hợp đồng・chi nhánh・công ty để trống nên không tìm thấy bằng các chữ này (tìm bằng 配送No hoặc địa chỉ nhận… ; 2026-10-08)."], err=["E04"]),
    F("3.3", "住所など", "Địa chỉ…", 'input[placeholder="住所、郵便番号、電話番号、担当者電話番号"]', "text", "input", req="－",
      len="文字列 60", init=["空", "Trống"], ex=["港区芝公園", "Khớp một phần với địa chỉ・mã bưu điện・điện thoại・điện thoại người phụ trách"],
      detail=["納品先の住所・郵便番号・電話番号・担当者の電話番号に含まれる文字（部分一致）。", "Chữ có trong địa chỉ giao・mã bưu điện・điện thoại・điện thoại người phụ trách (khớp một phần)."], err=["E04"]),
    F("3.4", "コース", "Course", 'select[aria-label="コース"]', "select", "select", req="－",
      len=["選択（ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機））", "Chọn (ES Standard / ES Light tủ lạnh / ES Light máy bán hàng)"], init=["未選択（先頭＝条件名）", "Chưa chọn (dòng đầu = tên điều kiện)"],
      ex=["ESライト（自販機）", "Lọc theo course của hợp đồng"], detail=["選択肢は使っている配送のデータから作る。", "Lựa chọn lấy từ dữ liệu giao hàng đang có."]),
    F("3.5", "ステータス", "Trạng thái", 'select[aria-label="ステータス"]', "select", "select", req="－",
      len=["選択（出荷待／出荷済／受取済／納品済／一部納品済／再配送待／確認中／中止／取消）", "Chọn (chờ xuất / đã xuất kho / đã nhận / đã giao / giao một phần / chờ giao lại / đang xác nhận / dừng / hủy)"], init=["未選択", "Chưa chọn"],
      ex=["出荷待", "Lọc theo trạng thái. 「予定」 không có vì dữ liệu 予定 chưa hiện ở danh sách này"],
      detail=["「予定」は選べない（予定は配送データになるまでこの一覧に出ない）。", "Không chọn được 「予定」 (予定 chưa hiện ở danh sách này đến khi thành dữ liệu giao hàng)."]),
    F("3.6", "トラブル", "Sự cố", 'select[aria-label="トラブル"]', "select", "select", req="－",
      len=["選択（トラブル未解決あり／確認中の子あり）", "Chọn (còn sự cố chưa giải quyết / có con đang xác nhận)"], init=["未選択", "Chưa chọn"],
      ex=["トラブル未解決あり", "Lọc dữ liệu còn báo cáo sự cố chưa giải quyết"],
      detail=["「確認中の子あり」＝親のトラブル対応で作った確認中の子がある配送。", "「確認中の子あり」 = giao hàng có chuyến con ở trạng thái 確認中 tạo từ xử lý sự cố của chuyến cha."]),
    F("3.7", "自販機", "Máy bán hàng", 'select[aria-label="自販機"]', "select", "select", req="－",
      len=["選択（自販機あり／自販機なし）", "Chọn (có / không máy bán hàng)"], init=["未選択", "Chưa chọn"], ex=["自販機あり", "Lọc theo course ESライト（自販機） hay không"]),
    F("3.8", "温度帯", "Nhóm nhiệt độ", 'select[aria-label="温度帯"]', "select", "select", req="－",
      len=["選択（冷凍・冷蔵・常温・資材。使っている配送から作る）", "Chọn (đông lạnh, lạnh, thường, vật tư; lấy từ dữ liệu đang có)"], init=["未選択", "Chưa chọn"], ex=["冷凍", "Lọc theo nhóm nhiệt độ của chuyến"]),
    F("3.9", "便種別", "Loại chuyến", 'select[aria-label="配送方法"]', "select", "select", req="－",
      len=["選択（ES配送便／COOL便／資材便／サンプル）", "Chọn (chuyến ES / chuyến COOL / chuyến vật tư / mẫu)"], init=["未選択", "Chưa chọn"], ex=["サンプル", "Lọc theo loại chuyến (「サンプル」 = giao hàng của mẫu kinh doanh)"],
      detail=["配送データの便種別。条件名・列の見出しは「便種別」にそろえる（詳細・スケジュールと同じ。hong 2026-10-07）。営業サンプルの配送は種類「サンプル」で出す（hong 2026-10-08・受付簿 #451）。", "Loại chuyến của dữ liệu giao hàng. Tên điều kiện・tiêu đề cột thống nhất 「便種別」 (giống chi tiết・スケジュール; hong 2026-10-07). Giao hàng của mẫu kinh doanh hiển thị với loại 「サンプル」 (hong 2026-10-08・sổ tiếp nhận #451)."],
      demo_ok=["コードの条件名・列の見出しは「配送方法」。「便種別」に直す", "Tên điều kiện・tiêu đề cột trong code là 「配送方法」. Sửa thành 「便種別」"],),
    F("3.10", "ピッキング倉庫", "Kho picking", 'select[aria-label="ピッキング倉庫"]', "select", "select", req="－",
      len=["選択（倉庫名＋ID。使っている配送から作る）", "Chọn (tên kho + ID; lấy từ dữ liệu đang có)"], init=["未選択", "Chưa chọn"], ex=["関東倉庫 WH00001", "Lọc theo kho picking"]),
    F("3.11", "委託配送会社", "Công ty vận chuyển ủy thác", 'select[aria-label="委託配送会社"]', "select", "select", req="－",
      len=["選択（会社名。使っている配送から作る）", "Chọn (tên công ty; lấy từ dữ liệu đang có)"], init=["未選択", "Chưa chọn"], ex=["みどり便", "Lọc theo công ty vận chuyển trên đường đi"]),
    F("3.12", "中継倉庫", "Kho trung chuyển", 'select[aria-label="中継倉庫"]', "select", "select", req="－",
      len=["選択（中継先名＋ID。使っている配送から作る）", "Chọn (tên điểm trung chuyển + ID; lấy từ dữ liệu đang có)"], init=["未選択", "Chưa chọn"], ex=["ヤマト 品川営業所 HU00124", "Lọc theo điểm trung chuyển trên đường đi"]),
    F("3.13", "送り状番号", "Số phiếu gửi", 'input[placeholder="送り状番号"]', "text", "input", req="－",
      len="文字列 60", init=["空", "Trống"], ex=["4471-1006-0012", "Khớp một phần với số phiếu gửi (ヤマト 12 chữ số hoặc số do ES cấp)"], detail=["送り状番号（部分一致）。欄は最大60字が見える幅にする。", "Số phiếu gửi (khớp một phần). Ô rộng đủ hiển thị tối đa 60 ký tự."], err=["E04"]),
    F("3.14", "配送スタッフ", "Nhân viên giao hàng", 'select[aria-label="配送スタッフID・名"]', "select", "select", req="－",
      len=["選択（ID＋名前。使っている配送から作る）", "Chọn (ID + tên; lấy từ dữ liệu đang có)"], init=["未選択", "Chưa chọn"], ex=["DR00014 山口 健", "Lọc theo nhân viên được gán cho chặng"]),
    F("3.15", "ドライバー未割当のみ", "Chỉ chưa gán tài xế", "label.es-switch::ドライバー未割当のみ", "check", "check", req="－",
      len=["ON／OFF", "ON / OFF"], init=["OFF", "OFF"], ex=["ON", "ON = chỉ hiện giao hàng còn chặng chưa gán tài xế (chặng công ty vận tải đường dài không tính)"],
      detail=["ドライバー（配送スタッフ）が決まっていない区間がある配送だけ。運送会社の区間は割り当てないので数えない。", "Chỉ giao hàng có chặng chưa có tài xế (nhân viên giao hàng). Chặng của công ty vận tải đường dài không gán nên không tính."],
      demo_ok=H_COND),
    F("3.16", "配送パターン・配送回数・割当状況", "Mẫu giao・số lần giao・tình trạng gán", "-", "select", "select", req="－",
      len=["選択（配送パターン：サイクル／個別指定／都度配送、配送回数：1回〜8回、割当状況：割当済／未割当）", "Chọn (mẫu giao: theo chu kỳ / chỉ định riêng / giao theo lần; số lần giao: từ 1 đến 8 lần; tình trạng gán: đã gán / chưa gán)"], init=["未選択", "Chưa chọn"],
      ex=["未割当", "Điều kiện chung với スケジュール. 割当状況 thay cho công tắc 「ドライバー未割当のみ」"],
      detail=["スケジュールと共通の条件（配送_08 §15-5 #5・#8・#13）。割当状況＝割当済／未割当。コードの スイッチ 3.15 は割当状況の「未割当」に当たる。選択欄は最も長い選択肢が切れない幅にする。", "Điều kiện chung với スケジュール (配送_08 §15-5 #5・#8・#13). 割当状況 = đã gán / chưa gán. Công tắc 3.15 trong code tương ứng với 「未割当」. Ô chọn rộng đủ để không cắt lựa chọn dài nhất."],
      demo_ok=H_COND),
    F("3.17", "並べ替え", "Sắp xếp", '.es-search select::出荷日の昇順', "select", "select", req="－",
      len=["選択（全列。昇順／降順）", "Chọn (mọi cột; tăng / giảm)"], init=["出荷日の昇順", "Ngày xuất kho tăng dần"], ex=["納品日の降順", "Chọn cột và chiều sắp xếp; mặc định ngày xuất kho tăng dần"],
      detail=["初期の並びは出荷日の昇順（同じなら配送No）。決定は全列で並べ替え（台帳 K）。", "Mặc định ngày xuất kho tăng dần (bằng nhau thì theo 配送No). Quyết định: sắp xếp mọi cột (台帳 K)."], demo_ok=H_SORT),
    F("3.18", "クリア", "Xóa điều kiện", ".es-search__gridact button::クリア", "button", "click", detail=["期間と条件を初期に戻し、一覧も戻す。", "Đưa kỳ và điều kiện về ban đầu, danh sách cũng về ban đầu."]),
    F("3.19", "検索", "Tìm kiếm", ".es-search__gridact button[type=submit]", "button", "click", detail=["条件を反映して1ページ目へ。検索したあとのトースト（「検索しました…」）は出さない（P-LIST。hong 2026-10-07）。", "Áp dụng điều kiện và về trang 1. Không hiện toast 「検索しました…」 sau khi tìm (P-LIST; hong 2026-10-07)."],
      demo_ok=["コードは検索のあとに「検索しました（…・n件）」のトーストを出す。出さない", "Code hiện toast 「検索しました（…・n件）」 sau khi tìm. Bỏ đi"]),
]
L_BAND = [
    F("4", "予定件数の帯", "Dải số lượng dữ liệu dự kiến", ".es-card .es-inline", "label", "show", err=["I134"],
      detail=["期間のあとに予定（配送データになる前）が何件あるかを出す。リンク「スケジュールの日表示で見る ›」で AW_SCHD の日表示へ。", "Cho biết sau kỳ còn bao nhiêu dữ liệu dự kiến (chưa thành dữ liệu giao hàng). Link 「スケジュールの日表示で見る ›」 sang hiển thị ngày của AW_SCHD."], demo_ok=H_BAND),
    F("4.1", "件数・並び", "Số dòng・thứ tự", ".tools", "label", detail=["「n件（並び）」。例：3件（出荷日の昇順）。", "「n件（thứ tự）」. Ví dụ: 3件（出荷日の昇順）."]),
    F("4.2", "経路の列を表示", "Hiện cột đường đi", "label.es-switch::経路の列を表示", "check", "check", req="－",
      len=["ON／OFF", "ON / OFF"], init=["OFF", "OFF"], ex=["ON", "ON = thêm các cột đường đi (配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別)"],
      detail=["ON にすると経路の列（配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別）を足す（配送_08 §15-5）。", "Bật thì thêm cột đường đi (配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別) (配送_08 §15-5)."], demo_ok=H_ROUTE),
]
L_TABLE = [
    F("5", "配送データの表", "Bảng dữ liệu giao hàng", ".es-table", "table", pattern="P-LIST", err=["I01"],
      detail=["1行＝1配送データ（予定は出ない）。行を押すと詳細（AW_DLVR_002）へ。初期の並びは出荷日の昇順。1ページ 10件（表示件数 10／20／50／100・初期 10）。行の色：要対応（トラブル未解決・ドライバー未割当）＝黄、子・日付調整済＝青（左に青い線）、取消・中止＝灰。営業サンプルの配送（種類「サンプル」）は拠点名の欄が空（5.3）。0件は I01。表は画面の幅の中に収め、画面全体の横スクロールは出さない（はみ出すときは表の中だけ横スクロール）。長い拠点名・コース名・倉庫名は列の幅に上限を決めて折り返す（または省略して、触れると全文をツールチップで出す）。",
              "1 dòng = 1 dữ liệu giao hàng (予定 không hiện). Nhấn dòng mở chi tiết (AW_DLVR_002). Mặc định ngày xuất kho tăng dần. 10 dòng/trang (số dòng hiển thị 10/20/50/100, mặc định 10). Màu dòng: cần xử lý (sự cố chưa giải quyết・chưa gán tài xế) = vàng; chuyến con・đã chỉnh ngày = xanh dương (vạch xanh bên trái); 取消・中止 = xám. Giao hàng của mẫu kinh doanh (loại 「サンプル」) để trống cột tên chi nhánh (5.3). 0 dòng hiện I01. Bảng nằm gọn trong chiều rộng màn hình, không có thanh cuộn ngang toàn trang (nếu tràn thì chỉ cuộn ngang trong bảng). Tên chi nhánh・khóa học・kho dài thì đặt giới hạn độ rộng cột và xuống dòng (hoặc rút gọn, chạm vào thì hiện toàn văn bằng tooltip)."],
      demo_ok=H_EMPTY),
    F("5.1", "No", "STT", ".es-table th::No", "label", detail=["表の通し番号（ページをまたいで続く）。", "Số thứ tự trong bảng (liên tục qua các trang)."]),
    F("5.2", "配送No", "Mã giao hàng (配送No)", ".es-table th::配送No", "link", "click",
      detail=["DL-YYMMDD-NNNN（作ったときの出荷予定日で付く。日付を変えても変わらない）。子は -枝番（最大9）。押すと詳細へ（トラブル未解決の行は「トラブル」タブを開く）。下に「出荷 mm-dd（曜）（実績）」（出荷済以降）。", "DL-YYMMDD-NNNN (gắn theo ngày xuất dự kiến lúc tạo; đổi ngày cũng không đổi). Chuyến con có -số nhánh (tối đa 9). Nhấn mở chi tiết (dòng còn sự cố mở tab 「トラブル」). Dưới có 「出荷 mm-dd（曜）（実績）」 (từ 出荷済)."]),
    F("5.3", "拠点名（温度帯）", "Tên chi nhánh (nhóm nhiệt độ)", ".es-table th::拠点名", "label", detail=["拠点名（納品済は納品したときの名前。変わっていれば「旧名（現：新名）」）。下に 温度帯 ・ 補足（子・資材の注文・トラブル未解決・変更申請など）。営業サンプルの配送は契約・拠点が空なので、拠点名の欄も空（「—」）。", "Tên chi nhánh (đã giao thì dùng tên lúc giao; nếu đã đổi tên thì 「tên cũ（現：tên mới）」). Dưới là nhóm nhiệt độ ・ ghi chú (chuyến con・đơn vật tư・sự cố chưa giải quyết・đơn xin đổi…). Giao hàng của mẫu kinh doanh có hợp đồng・chi nhánh để trống nên cột tên chi nhánh cũng để trống (「—」)."],
      open=["営業サンプルの配送で、受け取る会社（宛先の法人名）を一覧のどこに出すか（拠点名の欄が空になるため）。出す場所・書き方は未決。また一覧の「種類」を、便種別の値に「サンプル」を足す形でよいか（別の列にするか）", "Với giao hàng của mẫu kinh doanh, hiển thị công ty nhận (tên công ty nhận) ở đâu trên danh sách (vì cột tên chi nhánh để trống)? Vị trí・cách ghi chưa quyết. Ngoài ra 「loại」 ở danh sách có phải là thêm giá trị 「サンプル」 vào loại chuyến không (hay làm cột khác)?"], ask="hong"),
    F("5.4", "便種別", "Loại chuyến", ".es-table th::配送方法", "label", detail=["ES配送便／COOL便／資材便／サンプル。見出しは「便種別」。営業サンプルの配送は「サンプル」（契約・拠点は空。1日300件の件数に数える）。", "ES配送便 / COOL便 / 資材便 / サンプル. Tiêu đề 「便種別」. Giao hàng của mẫu kinh doanh là 「サンプル」 (hợp đồng・chi nhánh để trống; tính vào số 300 chuyến/ngày)."], demo_ok=["コードの見出しは「配送方法」。「便種別」に直す。コードの便種別（ES配送便／COOL便／資材便）に「サンプル」はない。営業サンプルの配送データを作ったとき足す（hong 2026-10-08・受付簿 #451）", "Tiêu đề trong code là 「配送方法」. Sửa thành 「便種別」. Loại chuyến trong code (ES配送便 / COOL便 / 資材便) chưa có 「サンプル」. Thêm khi tạo dữ liệu giao hàng của mẫu kinh doanh (hong 2026-10-08・sổ tiếp nhận #451)"]),
    F("5.5", "状態", "Trạng thái", ".es-table th::状態", "label", pattern="P-STATUS-COLORS",
      detail=["バッジ。予定・出荷待・出荷済・受取済＝青、納品済＝緑、一部納品済・再配送待・確認中＝黄、中止・取消＝灰（hong 2026-10-07 Q6＝B）。", "Badge. 予定・出荷待・出荷済・受取済 = xanh dương, 納品済 = xanh lá, 一部納品済・再配送待・確認中 = vàng, 中止・取消 = xám (hong 2026-10-07 Q6 = B)."],
      demo_ok=["共通の色の表は 出荷済＝青・受取済＝青・納品済＝緑・再配送待・確認中＝黄 になっている。コードの定数 ST_TONE（出荷済＝緑）は使われないので、定数を決定に合わせて直す", "Bảng màu chung đã ra 出荷済 = xanh dương…; hằng số ST_TONE trong code (出荷済 = xanh lá) không còn dùng, sửa cho khớp quyết định"]),
    F("5.6", "変更申請", "Đơn xin đổi", ".es-table th::変更申請", "label", pattern="P-STATUS-COLORS",
      detail=["お届け日の変更の状態を文字のバッジで出す：申請中＝黄・提案中＝青・調整済＝灰。変更可・変更不可はバッジを出さない（空）。", "Hiện trạng thái đổi ngày giao bằng badge chữ: 申請中 = vàng・提案中 = xanh dương・調整済 = xám. 変更可・変更不可 không hiện badge (để trống)."],
      demo_ok=H_CRBADGE),
    F("5.7", "出荷予定日", "Ngày xuất kho dự kiến", ".es-table th::出荷予定日", "label", detail=["mm-dd（曜）。", "mm-dd (thứ)."]),
    F("5.8", "納品日", "Ngày giao", ".es-table th::納品日", "label", detail=["mm-dd（曜）。", "mm-dd (thứ)."]),
    F("5.9", "配送スタッフ（区間）", "Nhân viên giao hàng (theo chặng)", ".es-table th::配送スタッフ", "label",
      detail=["区間ごとに「1次 名前（会社）」。割当がない区間は「割当待ち」（灰）。運送会社の区間は「—（運送会社）」、確認中は「—（確定後に割当）」、取消は「—」。", "Theo từng chặng 「1次 tên（công ty）」. Chặng chưa gán hiện 「割当待ち」 (xám). Chặng công ty vận tải đường dài 「—（運送会社）」, 確認中 「—（確定後に割当）」, 取消 「—」."]),
    F("5.10", "編集", "Sửa", ".es-table th::操作", "button", "click", cond=SELF,
      detail=["鉛筆のボタン。編集画面（AW_DLVR_003）へ。出るのは編集できる状態の行だけ（納品済・中止・取消以外。決定は 配送_08 §15-13）。", "Nút bút chì. Sang màn sửa (AW_DLVR_003). Chỉ hiện ở dòng có trạng thái sửa được (trừ 納品済・中止・取消; quyết định 配送_08 §15-13)."],
      demo_ok=["コードは 予定・出荷待 の行だけに出す。決定は納品済・中止・取消以外（配送_08 §15-13・配送_12 §15.13）。初期表示の1ページ目には出荷待の行がなく鉛筆が出ないので、番号は「操作」列の見出しに付ける", "Code chỉ hiện ở dòng 予定・出荷待. Quyết định: trừ 納品済・中止・取消 (配送_08 §15-13・配送_12 §15.13). Trang 1 của màn hình ban đầu không có dòng 出荷待 nên chưa thấy nút bút chì; số được gắn vào tiêu đề cột 「操作」"]),
    F("5.11", "ページ送り", "Phân trang", ".es-pagination", "area", pattern="P-PAGESIZE",
      detail=["「n件中 a–b件」・前へ・番号・次へ・表示件数（10／20／50／100・初期 10）。表示件数は人ごと・一覧ごとに覚える。", "「n件中 a–b件」・trước・số trang・sau・số dòng/trang (10/20/50/100, mặc định 10). Số dòng được nhớ theo người và theo danh sách."], demo_ok=H_MEMORY),
]
L_ALL = L_HEAD + L_PERIOD + L_SEARCH + L_BAND + L_TABLE

# 状態 002〜006 は変わる項目だけ
L_SWITCH = [
    F("3.1", "基準", "Cơ sở ngày", ".es-seg", "radio", "click", req="－",
      len=["選択（出荷／納品・配送）", "Chọn (xuất kho / giao hàng)"], init=["出荷", "出荷 (ngày xuất kho)"], ex=["納品・配送", "Chọn 納品・配送 rồi nhấn 検索: kỳ được lọc theo ngày giao"],
      detail=["「納品・配送」にして検索すると、期間を納品日で絞る。結果の並びは出荷日の昇順のまま。", "Chọn 「納品・配送」 rồi tìm thì kỳ được lọc theo ngày giao. Thứ tự kết quả vẫn là ngày xuất kho tăng dần."]),
    F("5", "配送データの表", "Bảng dữ liệu giao hàng", ".es-table", "table", pattern="P-LIST", detail=["納品日が期間に入る配送が並ぶ。", "Hiện các giao hàng có ngày giao nằm trong kỳ."]),
]
L_FILTER = [
    F("3.6", "トラブル", "Sự cố", 'select[aria-label="トラブル"]', "select", "select", req="－",
      len=["選択（トラブル未解決あり／確認中の子あり）", "Chọn (còn sự cố chưa giải quyết / có con đang xác nhận)"], init=["未選択", "Chưa chọn"], ex=["トラブル未解決あり", "Chọn rồi nhấn 検索 để lọc"]),
    F("3.15", "ドライバー未割当のみ", "Chỉ chưa gán tài xế", "label.es-switch::ドライバー未割当のみ", "check", "check", req="－",
      len=["ON／OFF", "ON / OFF"], init=["OFF", "OFF"], ex=["ON", "ON = chỉ hiện giao hàng còn chặng chưa gán tài xế"]),
    F("5", "配送データの表", "Bảng dữ liệu giao hàng", ".es-table", "table", pattern="P-LIST",
      detail=["絞り込んだ行。行の色（要対応＝黄・子＝青・取消＝灰）が見分けられる。", "Các dòng đã lọc. Phân biệt được màu dòng (cần xử lý = vàng・chuyến con = xanh dương・取消 = xám)."]),
    F("5.5", "状態", "Trạng thái", ".es-table th::状態", "label", pattern="P-STATUS-COLORS",
      detail=["バッジの色は Q6 の決定どおり（出荷済・受取済＝青、納品済＝緑、再配送待・確認中＝黄、中止・取消＝灰）。", "Màu badge theo quyết định Q6 (出荷済・受取済 = xanh dương, 納品済 = xanh lá, 再配送待・確認中 = vàng, 中止・取消 = xám)."]),
]
L_EMPTY = [
    F("5.12", "0件の表示", "Hiển thị 0 dòng", ".rv3-empty td", "label", "show", err=["I01"],
      detail=["表の中に I01 を1行で出す。ページ送りは「0件」。", "Hiện I01 trong bảng (1 dòng). Phân trang 「0件」."], demo_ok=H_EMPTY),
]
L_READONLY = [
    F("1.5", "操作ボタン（参照のみ）", "Nút thao tác (chỉ xem)", ".es-pagehead__actions", "area", "view",
      detail=["経理（R）などの参照のみの役割：CSV出力・出荷指示・取込のリンクは出る。表の「編集」ボタンは出ない（詳細も 編集・取消・複製・代理登録・対応を決める が出ない）。", "Vai trò chỉ xem như 経理 (R): vẫn có CSV出力 và link 出荷指示・取込; nút 「編集」 trong bảng không hiện (màn chi tiết cũng không có 編集・取消・複製・代理登録・対応を決める)."]),
    F("5.10", "編集（非表示）", "Sửa (ẩn)", ".es-table thead th::操作", "label", "view",
      detail=["操作の列は空（「編集」を出さない）。権限がない操作は出さない（P-LIST）。", "Cột thao tác để trống (không hiện 「編集」). Thao tác không có quyền thì không hiện (P-LIST)."]),
]
L_ROUTE = [
    F("4.2", "経路の列を表示", "Hiện cột đường đi", "label.es-switch::経路の列を表示", "check", "check", req="－",
      len=["ON／OFF", "ON / OFF"], init=["OFF", "OFF"], ex=["ON", "ON = thêm các cột đường đi vào bảng"],
      detail=["ON にすると経路の列（配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別）が増える。", "Bật thì thêm các cột đường đi (配送区分・中継・ピッキング倉庫・配送会社・委託会社・便種別)."], demo_ok=H_ROUTE),
]

V_LIST = [
    V("001", "AW_DLVR_001", "初期表示", "Hiển thị ban đầu", "/ops/delivery/list", L_ALL, "", wait=800,
      note=["フル権限（Ad00010）で表示。出荷基準・期間の初期値・並びは出荷日の昇順。", "Hiển thị với フル権限 (Ad00010). Cơ sở ngày xuất, kỳ ban đầu, ngày xuất kho tăng dần."]),
    V("002", "AW_DLVR_001", "「納品・配送」基準に切り替えて検索", "Chuyển cơ sở 「納品・配送」 rồi tìm", "/ops/delivery/list", L_SWITCH,
      "[...document.querySelectorAll('.es-seg button')].find(b=>b.textContent.includes('納品・配送')).click();await sleep(200);" + SEARCH, wait=700),
    V("003", "AW_DLVR_001", "詳細条件で絞り込み（トラブル・未割当・行の色）", "Lọc theo điều kiện chi tiết (sự cố・chưa gán・màu dòng)", "/ops/delivery/list", L_FILTER,
      "setv(q('select[aria-label=\"トラブル\"]'),'トラブル未解決あり');" + "await sleep(200);" + SEARCH, wait=700),
    V("004", "AW_DLVR_001", "該当なし（0件）", "Không có kết quả (0 dòng)", "/ops/delivery/list", L_EMPTY,
      "setv(q('input[placeholder=\"法人ID・名、拠点ID・名、契約ID\"]'),'zzzz');" + "await sleep(200);" + SEARCH, wait=700),
    V("005", "AW_DLVR_001", "参照のみの役割（経理 R）", "Vai trò chỉ xem (経理 R)", "/ops/delivery/list", L_READONLY, "", login="Ad00012",
      note=["経理（Ad00012・R）でログイン。表の「編集」が出ない。", "Đăng nhập 経理 (Ad00012・R). Không có nút 「編集」 trong bảng."]),
    V("006", "AW_DLVR_001", "経路の列を表示（スイッチ ON）", "Hiện cột đường đi (bật công tắc)", "/ops/delivery/list", L_ROUTE,
      "q('label.es-switch input[type=checkbox]') && [...document.querySelectorAll('label.es-switch')].find(l=>l.textContent.includes('経路の列')).click();await sleep(300);",
      note=["コードは経路の列がまだない（スイッチだけ動く）。決定の列は項目 4.2 を参照。", "Code chưa có cột đường đi (chỉ công tắc). Cột theo quyết định xem mục 4.2."]),
]


# ================================================================ AW_DLVR_002 詳細
OPBTN = ["取消・複製・代理登録・対応を決める・編集は、その操作の権限（機能ごとの操作＝更新 系）がある役割だけ。フル権限・営業・CS・商品系（CRUD）・物流（R/U）に出る。経理（R）には出ない（hong 2026-10-07 Q1＝B）", "取消・複製・代理登録・対応を決める・編集 chỉ hiện với vai trò có quyền thao tác (thao tác theo chức năng = nhóm 更新): フル権限・営業・CS・商品系 (CRUD)・物流 (R/U). 経理 (R) không thấy (hong 2026-10-07 Q1 = B)"]
H_OPPERM = ["コードの権限は 取消＝削除権・複製＝作成権（物流 R/U ができない）。決定は 更新 系の操作（hong 2026-10-07 Q1＝B）。apiPerm の op を直す", "Quyền trong code: 取消 = quyền xóa・複製 = quyền tạo (物流 R/U không làm được). Quyết định: nhóm 更新 (hong 2026-10-07 Q1 = B). Sửa op trong apiPerm"]
H_STATE_BTN = ["コードのボタンの出し分け：取消＝予定・出荷待・確認中／複製＝子でなく予定・取消でない／代理登録＝出荷済以降／編集＝予定・出荷待（編集は決定では 納品済・中止・取消 以外：配送_08 §15-13）", "Code: 取消 = 予定・出荷待・確認中 / 複製 = không phải chuyến con, không phải 予定・取消 / 代理登録 = từ 出荷済 / 編集 = 予定・出荷待 (quyết định: trừ 納品済・中止・取消: 配送_08 §15-13)"]

D_HEAD = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area",
      detail=["パンくず・画面名＋配送No・状態の帯（状態・段階・トラブル・変更申請・親）・操作ボタン。", "Breadcrumb, tên màn hình + 配送No, dải trạng thái (trạng thái・giai đoạn・sự cố・đơn xin đổi・chuyến cha), nút thao tác."]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「配送管理 / 出荷・配送管理 / 出荷・配送データ詳細」。「出荷・配送管理」は一覧（AW_DLVR_001）へのリンク。", "「配送管理 / 出荷・配送管理 / 出荷・配送データ詳細」. 「出荷・配送管理」 là link về danh sách (AW_DLVR_001)."]),
    F("1.2", "画面名・配送No", "Tên màn hình・配送No", ".es-pagehead__title", "label", detail=["「出荷・配送データ詳細 DL-YYMMDD-NNNN」。", "「出荷・配送データ詳細 DL-YYMMDD-NNNN」."]),
    F("1.3", "状態", "Trạng thái", ".es-pagehead .stat .k::状態", "label", pattern="P-STATUS-COLORS",
      detail=["拠点名・温度帯のあとに 状態バッジ。予定・出荷待・出荷済・受取済＝青、納品済＝緑、一部納品済・再配送待・確認中＝黄、中止・取消＝灰（Q6＝B）。", "Sau tên chi nhánh・nhóm nhiệt độ là badge trạng thái. 予定・出荷待・出荷済・受取済 = xanh dương, 納品済 = xanh lá, 一部納品済・再配送待・確認中 = vàng, 中止・取消 = xám (Q6 = B)."]),
    F("1.4", "段階", "Giai đoạn", ".es-pagehead .stat .k::段階", "label", detail=["灰のバッジ：予定／確定／確定（出荷指示済み）／確定待ち（出荷指示の対象外＝確認中の子）。", "Badge xám: 予定 / 確定 / 確定（出荷指示済み）/ 確定待ち（đối tượng ngoài chỉ thị xuất kho = chuyến con đang 確認中）."]),
    F("1.5", "トラブル", "Sự cố", ".es-pagehead .stat .k::トラブル", "label", cond=["未解決のトラブル報告があるとき", "Khi còn báo cáo sự cố chưa giải quyết"], detail=["赤のバッジ「未解決 n件」。", "Badge đỏ 「未解決 n件」."]),
    F("1.6", "変更申請", "Đơn xin đổi", ".es-pagehead .stat .k::変更申請", "label", cond=["申請中の変更申請があるとき", "Khi có đơn xin đổi đang 申請中"], pattern="P-STATUS-COLORS", detail=["黄のバッジ「申請中 DD-…」。", "Badge vàng 「申請中 DD-…」."]),
    F("1.7", "親", "Chuyến cha", ".es-pagehead .stat .k::親", "link", "click", cond=["子の配送のとき", "Khi là chuyến con"], detail=["親の配送No のリンク。押すと親の詳細の「トラブル」タブへ。", "Link tới 配送No của chuyến cha. Nhấn mở tab 「トラブル」 của chuyến cha."]),
    F("1.8", "取消", "Hủy", ".es-pagehead__actions button::取消", "button", "click", cond=OPBTN,
      detail=["取消のモーダル（状態 025）。取消できるのは倉庫から出る前（予定・出荷待・確認中）だけ。", "Mở modal 取消 (trạng thái 025). Chỉ hủy được khi chưa ra khỏi kho (予定・出荷待・確認中)."], demo_ok=H_OPPERM),
    F("1.9", "複製", "Nhân bản", ".es-pagehead__actions button::複製", "button", "click", cond=OPBTN,
      detail=["複製のモーダル（状態 027）。子の配送でなく、予定・取消でない配送に出る（子は1配送に最大9）。", "Mở modal 複製 (trạng thái 027). Hiện với giao hàng không phải chuyến con, không phải 予定・取消 (tối đa 9 chuyến con cho 1 giao hàng)."], demo_ok=H_OPPERM),
    F("1.10", "トラブルを代理登録", "Đăng ký sự cố thay", ".es-pagehead__actions button::トラブルを代理登録", "button", "click", cond=OPBTN,
      detail=["トラブルの代理登録のモーダル（状態 029）。出荷済以降の配送に出る。", "Mở modal đăng ký sự cố thay (trạng thái 029). Hiện với giao hàng từ 出荷済."]),
    F("1.11", "対応を決める", "Quyết định cách xử lý", ".es-pagehead__actions button::対応を決める", "button", "click", cond=["未解決のトラブルがあり、権限があるとき", "Khi còn sự cố chưa giải quyết và có quyền"],
      detail=["トラブルの対応を決めるモーダル（状態 031〜034）。「中止」の直接のボタンは作らない。出荷後に止めるときは、トラブルを代理登録して「納品せずに終了する」を選ぶ（Q2＝B）。", "Mở modal quyết định cách xử lý (trạng thái 031〜034). Không có nút 「中止」 trực tiếp. Muốn dừng sau xuất kho thì đăng ký sự cố rồi chọn 「納品せずに終了する」 (Q2 = B)."]),
    F("1.12", "編集", "Sửa", ".es-pagehead__actions a::編集", "link", "click", cond=OPBTN,
      detail=["編集画面（AW_DLVR_003）へ。編集できる状態は 納品済・中止・取消 以外（配送_08 §15-13）。", "Sang màn sửa (AW_DLVR_003). Trạng thái sửa được: trừ 納品済・中止・取消 (配送_08 §15-13)."], demo_ok=H_STATE_BTN),
]
D_TABS = [
    F("3", "タブ", "Tab", ".es-tabs", "tab", "click", pattern="P-TAB",
      detail=["配送概要／配送ルート／実績／トラブル（出荷後だけ）／添付資料／変更履歴。URL の ?tab= で開くタブを決める（ov・route・res・trb・doc・hist）。トラブル未解決のときは「トラブル 3」の形で件数を出す。",
              "配送概要 / 配送ルート / 実績 / トラブル (chỉ sau xuất kho) / 添付資料 / 変更履歴. Tab mở theo ?tab= trên URL (ov・route・res・trb・doc・hist). Khi còn sự cố hiện số đếm dạng 「トラブル 3」."], demo_ok=H_TAB),
]
D_OV = [
    F("4", "配送概要", "Tổng quan giao hàng", ".es-card .es-section-title::配送概要", "area", detail=["読むだけ（この画面に入力欄はない。直すのは編集画面 AW_DLVR_003）。", "Chỉ xem (màn này không có ô nhập; sửa ở màn sửa AW_DLVR_003)."]),
    F("4.2", "配送No", "Mã giao hàng (配送No)", ".es-field::配送No", "label", detail=["作ったときの出荷予定日で付けた番号（日付を変えても変わらない）。", "Số gắn theo ngày xuất dự kiến lúc tạo (đổi ngày cũng không đổi)."]),
    F("4.3", "出荷日（実績）", "Ngày xuất kho (thực tế)", ".es-field::出荷日（実績）", "label", detail=["実際に出荷した日。まだなら「—（まだ出荷していない）」。", "Ngày thực tế xuất kho. Chưa xuất thì 「—（まだ出荷していない）」."]),
    F("4.4", "荷物名", "Tên hàng", ".es-field::荷物名", "label", detail=["例：冷凍 惣菜セット／資材。", "Ví dụ: 冷凍 惣菜セット / 資材."]),
    F("4.5", "対象サイクル・納品スロット", "Chu kỳ・khung giao", ".es-field::対象サイクル", "label", detail=["例：10月サイクル ・ A2。資材の便は「資材（サイクルなし）」。", "Ví dụ: 10月サイクル ・ A2. Chuyến vật tư là 「資材（サイクルなし）」."]),
    F("4.6", "納品日", "Ngày giao", ".es-field::納品日", "label", detail=["yyyy-mm-dd（曜）。確認中の子は「（仮）」を付ける。", "yyyy-mm-dd (thứ). Chuyến con 確認中 có kèm 「（仮）」."]),
    F("4.7", "出荷日（ピッキング日）", "Ngày xuất kho (ngày picking)", ".es-field::出荷日（ピッキング日）", "label", detail=["納品日からリードタイムを引いた日。下にリードタイム（例：リードタイム 1日）。", "Ngày giao trừ lead time. Bên dưới có lead time (ví dụ: リードタイム 1日)."]),
    F("4.8", "配達時間帯", "Khung giờ giao", ".es-field::配達時間帯", "label", detail=["拠点の受取時間帯のスナップショット（複数あれば「10:00〜12:00・13:00〜15:00」）。ここでも編集画面でも直せない。直すときは拠点マスタ（hong 2026-10-07 Q7＝B）。", "Snapshot khung giờ nhận hàng của chi nhánh (nhiều khung thì 「10:00〜12:00・13:00〜15:00」). Không sửa được ở đây và cả ở màn sửa. Muốn sửa thì sửa ở master 拠点 (hong 2026-10-07 Q7 = B)."]),
    F("4.9", "到着予定（ドライバー共有）", "Dự kiến đến (tài xế chia sẻ)", ".es-field::到着予定", "label", detail=["納品日当日にドライバーが共有する到着予定。完了後は「HH:MM（完了）」。それまでは「—（納品日当日にドライバーが共有）」。", "Giờ đến dự kiến do tài xế chia sẻ trong ngày giao. Sau khi xong 「HH:MM（完了）」. Trước đó 「—（納品日当日にドライバーが共有）」."]),
    F("4.10", "配送区分", "Phân loại giao hàng", ".es-field::配送区分", "label", detail=["温度帯（冷凍・冷蔵・常温・資材）。", "Nhóm nhiệt độ (đông lạnh・lạnh・thường・vật tư)."]),
    F("4.11", "便種別", "Loại chuyến", ".es-field::便種別", "label", detail=["ES配送便／COOL便／資材便／サンプル。", "ES配送便 / COOL便 / 資材便 / サンプル."]),
    F("4.12", "出荷指示", "Chỉ thị xuất kho", ".es-field::出荷指示", "label",
      detail=["「未送信」「送信済 rev n」「対象外」。下に送信予定（出荷指示の窓の送信予定日。追加分は追加送信日）・送信日時。いまの送信は手動（変更した行の CSV を出し、運営が THOMAS に登録して「送信済にする」：Q4＝B）。ES の自動送信はフェーズ3。送信済（初回の送信成功）になった時点でロック（locked）。対象外＝資材・予定・確認中。",
              "「未送信」「送信済 rev n」「対象外」. Dưới là dự kiến gửi (ngày dự kiến gửi của cửa sổ trong AW_SHIP; phần bổ sung thì ngày gửi bổ sung)・thời điểm gửi. Hiện gửi thủ công (xuất CSV các dòng đã đổi, 運営 đăng ký vào THOMAS rồi bấm 「送信済にする」: Q4 = B). ES tự gửi là giai đoạn 3. Khi thành 送信済 (gửi thành công lần đầu) thì khóa (locked). 対象外 = vật tư・予定・確認中."]),
    F("4.13", "契約ID", "ID hợp đồng", ".es-field::契約ID", "link", "click", detail=["親契約のID。押すと拠点・契約情報へ。", "ID hợp đồng cha. Nhấn sang 拠点・契約情報."]),
    F("4.14", "子契約ID", "ID hợp đồng con", ".es-field::子契約ID", "link", "click", detail=["子契約のID。押すと拠点・契約情報へ。資材の便は「—」。", "ID hợp đồng con. Nhấn sang 拠点・契約情報. Chuyến vật tư là 「—」."]),
    F("4.15", "オーダーID／資材の注文／子の種類", "ID đơn / đơn vật tư / loại chuyến con", ".es-field::オーダーID", "label",
      detail=["通常の便＝オーダーID（O-YYYYMM-拠点ID。押すとメニューのオーダーへ）、資材の便＝資材の注文（MO-…）、子＝子の種類（分納・再配送など）と親の配送No。", "Chuyến thường = ID đơn (O-YYYYMM-ID chi nhánh; nhấn sang đơn của menu), chuyến vật tư = 資材の注文 (MO-…), chuyến con = loại chuyến con (分納・再配送…) và 配送No của chuyến cha."]),
    F("4.16", "備考", "Ghi chú", "-", "label",
      detail=["配送データの備考（delivery_note）。配送概要に出す（配送_08 §15-6・7-8）。長さは技術メモ（配送_10 #12）で決める。", "Ghi chú của dữ liệu giao hàng (delivery_note). Hiện trong 配送概要 (配送_08 §15-6・7-8). Độ dài quyết định ở ghi chú kỹ thuật (配送_10 #12)."],
      demo_ok=["コードの配送概要に備考の欄がない。足す（H12）", "Tổng quan trong code chưa có ô ghi chú. Thêm vào (H12)"]),
]
D_QTY = [
    F("5", "数量の表", "Bảng số lượng", ".es-card .es-table", "table", detail=["見出しは状態で変わる：予定＝数量（予定・オーダー締切で確定）／確認中＝数量（再送しうる最大量）／ほか＝数量（オーダー締切で確定）。資材の便は資材の注文の明細。", "Tiêu đề đổi theo trạng thái: 予定 = 数量（予定・オーダー締切で確定）/ 確認中 = 数量（再送しうる最大量）/ còn lại = 数量（オーダー締切で確定）. Chuyến vật tư là chi tiết đơn vật tư."]),
    F("5.1", "商品名・商品ID", "Tên・ID sản phẩm", ".es-card .es-table th::商品名", "label", detail=["代替品は「（代替：元の商品）」を付ける。納品したときの商品名を出す。", "Hàng thay thế kèm 「（代替：sản phẩm gốc）」. Hiện tên sản phẩm lúc giao."]),
    F("5.2", "予定数量・確定数量", "Số lượng dự kiến・số lượng chốt", ".es-card .es-table th::予定数量", "label", detail=["右寄せ。商品ごとの数は「個」、便の合計の食数は「食」。確定数量は納品の実績があればその数、締切後は予定どおり、それ以前は「—」。", "Căn phải. Số theo từng sản phẩm là 「個」, tổng suất của chuyến là 「食」. Số lượng chốt là số thực giao nếu có, sau chốt là theo dự kiến, trước đó là 「—」."]),
    F("5.3", "確定のしかた", "Cách chốt", ".es-card .es-table th::確定のしかた", "label", detail=["「法人のオーダー（締切前／締切で確定）」「納品の実績」「仮（解決・確定で決まる）」「資材の注文」。", "「法人のオーダー（締切前／締切で確定）」「納品の実績」「仮（解決・確定で決まる）」「資材の注文」."]),
]
D_MEMO = [
    F("7", "運営メモ", "Ghi chú nội bộ", ".opm", "area", detail=["社内だけ。法人・委託配送先・ドライバーには出さない。追加したメモは変更履歴にも残る。", "Chỉ nội bộ. Không hiện cho công ty・đơn vị vận chuyển ủy thác・tài xế. Ghi chú đã thêm cũng lưu trong 変更履歴."]),
    F("7.1", "メモ", "Ghi chú", "textarea[aria-label=運営メモ]", "textarea", "input", req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["次回から、到着の10分前に受付の森様へ電話する", "Nội dung dặn dò cho các lần giao sau (nhiều dòng, tối đa 500 ký tự)"],
      valid=["必須。前後の空白を取る。500文字以内・絵文字は不可。", "Bắt buộc. Cắt khoảng trắng đầu cuối. Tối đa 500 ký tự, không emoji."],
      detail=["複数行の欄。「メモを追加」で保存する（画面の「保存」とは別。この追加だけ即保存する）。", "Ô nhiều dòng. Lưu bằng 「メモを追加」 (tách riêng với 「保存」 của màn hình; chỉ thao tác thêm này lưu ngay)."],
      err=["E01", "E04", "E13"], demo_ok=H_MAXLEN),
    F("7.2", "メモを追加", "Thêm ghi chú", ".opm button::メモを追加", "button", "click", cond=["編集の権限があるとき", "Khi có quyền sửa"],
      detail=["押すとメモを追加し、トースト S133「メモを追加しました。」。空なら 7.1 に E01。", "Nhấn để thêm ghi chú, toast S133 「メモを追加しました。」. Nếu trống thì E01 ở 7.1."], err=["S133"], demo_ok=H_TOAST),
    F("7.3", "メモの一覧", "Danh sách ghi chú", ".opm__list", "label", detail=["新しい順。「日時 追加した人　内容」。", "Mới nhất trên cùng. 「日時 người thêm　内容」."]),
]
D_MAIL = [
    F("8", "法人へ送るメール（見本）", "Email gửi công ty (mẫu)", ".opm__mail", "area",
      detail=["メイン・サブの担当者あて。出荷実績の取込（発送完了）で1通。オーダー締切のあとに運営が納品日・出荷日を変えたときにも送る（変更前→後・理由つき）。締切前の変更は確定のお知らせに最新の日付が載るので送らない。",
              "Gửi cho người phụ trách chính・phụ. 1 email khi nhập kết quả xuất kho (hoàn tất gửi). Cũng gửi khi 運営 đổi ngày giao・ngày xuất sau hạn chốt đơn (kèm trước → sau・lý do). Đổi trước hạn chốt thì không gửi vì thông báo xác nhận đã ghi ngày mới nhất."],
      demo_ok=["メール見本の件名・署名が「ESステーション」。システム名は「ES STATION」（メッセージの決まり 2026-10-05）に直す", "Tiêu đề・chữ ký mẫu email ghi 「ESステーション」. Tên hệ thống là 「ES STATION」 (quy định thông báo 2026-10-05); sửa"]),
    F("8.1", "① 発送完了のお知らせ", "① Thông báo đã gửi hàng", ".opm__mail summary::発送完了", "area", detail=["出荷実績の取込のとき。配送No・お届け予定日・便種別・送り状番号を載せる。ヤマト運輸のときは追跡ページの URL も載せる（委託配送先マスタの追跡URLひな形から作る）。", "Khi nhập kết quả xuất kho. Ghi 配送No・ngày giao dự kiến・phương thức・số phiếu gửi. Với ヤマト運輸 có thêm URL trang tra cứu (lấy từ mẫu URL theo dõi ở master đơn vị vận chuyển ủy thác)."]),
    F("8.2", "② お届け日の変更のお知らせ", "② Thông báo đổi ngày giao", ".opm__mail summary::お届け日の変更", "area", detail=["締切後に運営が日付を変えたとき。変更前・変更後・理由を載せる。", "Khi 運営 đổi ngày sau hạn chốt. Ghi ngày trước・sau・lý do."]),
]

D_LOCK = [
    F("2", "お知らせの帯", "Dải thông báo", ".es-inline", "area", "show",
      detail=["ヘッダーの下に出る帯。状態によって 2.1〜2.3 のどれかが出る。", "Dải hiện dưới đầu trang. Tùy trạng thái mà hiện một trong 2.1〜2.3."]),
    F("2.1", "ロックの帯", "Dải khóa", ".es-inline--warning", "label", "show", err=["I136"], cond=["出荷待で、出荷指示の初回の送信が成功しているとき（ロック）", "Khi 出荷待 và chỉ thị xuất kho đã gửi thành công lần đầu (khóa)"],
      detail=["黄の帯（I136）。出荷指示を送信したあとに納品日・出荷日を変えるときの案内（スケジュールの移動と同じ規則：1便ずつ・理由必須・新しい版 rev＋1 で出荷指示を再送・法人へ通知）。ピッキング倉庫を変えるときは取消して複製で作り直す。",
              "Dải vàng (I136). Hướng dẫn khi đổi ngày giao・ngày xuất sau khi đã gửi chỉ thị xuất kho (cùng quy tắc với 移動 ở スケジュール: từng chuyến・bắt buộc lý do・gửi lại chỉ thị bản mới rev+1・thông báo công ty). Đổi kho picking thì hủy rồi 複製 để tạo lại."],
      demo_ok=["コードは「オーダー締切の後（締切済サイクルの出荷待）」で帯を出し、本文も「出荷日の前日まで・同じ半分・1件ずつ」。決定では ロック＝出荷指示の初回送信成功（hong 2026-10-07 Q3）。条件と文を直す（締切済サイクルの出荷待でも未送信なら出さない）", "Code hiện dải khi 「sau hạn chốt đơn (出荷待 của chu kỳ đã chốt)」. Quyết định: locked = gửi chỉ thị lần đầu thành công (hong 2026-10-07 Q3). Sửa điều kiện và câu (chu kỳ đã chốt nhưng chưa gửi thì không hiện)"]),
]
D_TROUBLE_BAND = [
    F("2.2", "未解決トラブルの帯", "Dải sự cố chưa giải quyết", ".es-inline--negative", "label", "show", err=["I138"], cond=["未解決のトラブル報告があるとき", "Khi còn báo cáo sự cố chưa giải quyết"],
      detail=["赤の帯（I138）。状態はそのまま（受取済など）で、「対応を決める」でまとめて解決する案内。不在の報告と同時に作った子（確認中）があればその配送Noを出す。", "Dải đỏ (I138). Hướng dẫn: trạng thái giữ nguyên (ví dụ 受取済), dùng 「対応を決める」 để giải quyết gộp. Nếu có chuyến con (確認中) tạo cùng lúc với báo cáo vắng mặt thì hiện 配送No đó."]),
]
D_CHILD_BAND = [
    F("2.3", "確認中の子の帯", "Dải chuyến con đang xác nhận", ".es-inline--info", "label", "show", err=["I139"], cond=["確認中の子のとき", "Khi là chuyến con 確認中"],
      detail=["青の帯（I139）。親の配送Noを出す。日付と数量は仮で、確定するまで出荷指示・送り状・割当・請求の対象外。親のトラブルを解決してから「確定して出荷待へ」で出荷待にする。", "Dải xanh (I139). Hiện 配送No của chuyến cha. Ngày và số lượng là tạm, đến khi chốt thì ngoài đối tượng chỉ thị xuất kho・phiếu gửi・gán・thanh toán. Giải quyết sự cố của cha rồi bấm 「確定して出荷待へ」 để thành 出荷待."]),
]
D_CHILD_CONFIRM = [
    F("6", "納品日と数量を確定する", "Chốt ngày giao và số lượng", ".es-section-title::納品日と数量を確定する", "area", "show", cond=["確認中の子のとき", "Khi là chuyến con 確認中"],
      detail=["確認中の子だけに出る欄。納品日（仮）を入れ、下の「確定して出荷待へ」で出荷待にする。", "Ô chỉ hiện với chuyến con 確認中. Nhập ngày giao (tạm) rồi bấm 「確定して出荷待へ」 bên dưới để thành 出荷待."]),
    F("6.1", "納品日（仮）", "Ngày giao (tạm)", ".es-field:has(.es-field__req)::納品日", "date", "input", req="○", cond=["確認中の子のとき", "Khi là chuyến con 確認中"],
      err=["E01"], len="日付 yyyy-mm-dd", init=["2026-10-08（見本の固定値）", "2026-10-08 (giá trị mẫu cố định)"], ex=["2026-10-20", "Ngày giao thực tế sẽ chốt cho chuyến con"],
      valid=["日付の共通部品（yyyy-mm-dd）。必須。ピッキング日はリードタイムを保って決まる。", "Ô ngày chung (yyyy-mm-dd). Bắt buộc. Ngày picking tính theo lead time."],
      detail=["画面の表示名は「納品日」で、暫定の日付。確定すると納品日になる。", "Trên màn hình hiện nhãn dạng 「仮」 của ngày giao. Khi chốt thì thành ngày giao."],
      demo_ok=["コードは初期値を 2026-10-08・出荷日を 2026-10-07 の固定値で出す。親の解決で決まった子の日付を初期値にする", "Code để giá trị cố định 2026-10-08 / ngày xuất 2026-10-07. Dùng ngày của chuyến con do xử lý của cha quyết định làm giá trị ban đầu"]),
    F("6.2", "確定して出荷待へ", "Chốt và chuyển sang 出荷待", "button::確定して出荷待へ", "button", "click", cond=["確認中の子で、権限があるとき。親のトラブルが未解決なら非活性", "Chuyến con 確認中 và có quyền. Vô hiệu nếu sự cố của cha chưa giải quyết"],
      detail=["押すと出荷待にする。成功はトースト S133「子を確定して出荷待にしました。」。親が未解決のあいだは非活性で、理由 E173 をボタンのそばに出す。", "Nhấn để chuyển sang 出荷待. Thành công: toast S133 「子を確定して出荷待にしました。」. Khi cha chưa giải quyết thì vô hiệu và hiện lý do E173 cạnh nút."], err=["S133", "E173"], demo_ok=H_TOAST),
]
D_CR_BAND = [
    F("4.1", "変更申請の帯", "Khung đơn xin đổi", ".crb", "area", "show", cond=["申請中の変更申請があるとき", "Khi có đơn xin đổi đang 申請中"], pattern="P-STATUS-COLORS",
      detail=["見出し「配送予定日の変更申請 DD-…」＋黄バッジ「申請中」＋判定（システム判定：問題なし／希望日なし／要再確認／提案中）＋処理期限。内容は共通データの申請から（受付簿 No.47）。", "Tiêu đề 「配送予定日の変更申請 DD-…」 + badge vàng 「申請中」 + phán định (hệ thống: 問題なし / 希望日なし / 要再確認 / 提案中) + hạn xử lý. Nội dung lấy từ dữ liệu chung (受付簿 No.47)."]),
    F("4.1.1", "現在の納品日・希望日", "Ngày giao hiện tại・ngày mong muốn", ".crb__dates", "label", detail=["現在の納品日 → 第一希望・第二希望（日付・サイクル・備考）。", "Ngày giao hiện tại → nguyện vọng 1・2 (ngày・chu kỳ・ghi chú)."]),
    F("4.1.2", "申請理由・申請者", "Lý do・người xin", ".crb__row", "label", detail=["申請理由・申請者（名前）・申請日時。", "Lý do・người xin (tên)・ngày giờ xin."]),
    F("4.1.3", "否認する", "Từ chối", ".crb__f button::否認する", "button", "click", cond=["変更申請の処理の権限があるとき", "Khi có quyền xử lý đơn xin đổi"], detail=["変更申請の確認のモーダル（状態 035）を開く。", "Mở modal xác nhận đơn xin đổi (trạng thái 035)."]),
    F("4.1.4", "代替日を提案する", "Đề xuất ngày thay thế", ".crb__f button::代替日を提案する", "button", "click", cond=["同上", "Như trên"], detail=["同じモーダルを開く（別日を選んで提案）。", "Mở cùng modal (chọn ngày khác để đề xuất)."]),
    F("4.1.5", "承認する", "Duyệt", ".crb__f button::承認する", "button", "click", cond=["同上", "Như trên"], detail=["同じモーダルを開く（希望日で承認）。承認したらスケジュールの月表示へ移る。", "Mở cùng modal (duyệt theo ngày mong muốn). Duyệt xong sang hiển thị tháng của スケジュール."]),
]
D_CR_PAST = [
    F("6", "変更申請（処理済み）の表", "Bảng đơn xin đổi (đã xử lý)", ".es-section-title::この配送の変更申請", "table", "view", cond=["処理済みの変更申請があるとき", "Khi có đơn xin đổi đã xử lý"], pattern="P-STATUS-COLORS",
      detail=["列：申請番号・受付日・申請者・内容（納品日 → 希望日・理由）・状態（承認＝緑・否認＝赤・ほか＝灰）・処理者・理由。", "Cột: số đơn・ngày nhận・người xin・nội dung (ngày giao → ngày mong muốn・lý do)・trạng thái (承認 = xanh lá・否認 = đỏ・còn lại = xám)・người xử lý・lý do."]),
]

# 条件つきで出るヘッダーの項目（トラブル・変更申請・親・代理登録・対応を決める）は、出る状態（008・014・016・040）に置く。A（出荷待）には出ない
COND_HEAD = ("1.5", "1.6", "1.7", "1.10", "1.11")
_hd = lambda *nos: [x for x in D_HEAD if x["no"] in nos]
D_OV_ALL = [x for x in D_HEAD if x["no"] not in COND_HEAD] + D_LOCK + D_TABS + D_OV + D_QTY + D_MEMO + D_MAIL


# ---- 配送ルート・実績・トラブル・添付資料・変更履歴（タブ）
D_ROUTE = [
    F("9", "配送ルート", "Tuyến giao hàng", ".es-card .es-section-title::配送ルート", "area", detail=["子契約の配送ルート設定から引き継いだ内容（読むだけ）。ドライバーは区間ごとに割り当てる（ES配送便・COOL便とも。運送会社の区間は割り当てない・委託と自社の区間は1次でも割り当てる）。", "Nội dung kế thừa từ cài đặt tuyến giao của hợp đồng con (chỉ xem). Tài xế gán theo từng chặng (cả ES配送便・COOL便; chặng công ty vận tải đường dài không gán; chặng ủy thác・tự vận hành gán cả chặng 1)."]),
    F("9.1", "配送区分", "Phân loại giao hàng", ".es-field::配送区分", "label", detail=["温度帯（冷凍・冷蔵・常温・資材）。", "Nhóm nhiệt độ (đông lạnh・lạnh・thường・vật tư)."]),
    F("9.2", "便種別", "Loại chuyến", ".es-field::便種別", "label", detail=["ES配送便／COOL便／資材便／サンプル。", "ES配送便 / COOL便 / 資材便 / サンプル."]),
    F("9.3", "リードタイム", "Lead time", ".es-field::リードタイム", "label", detail=["出荷日から納品日までの日数（例：1日）。", "Số ngày từ ngày xuất kho đến ngày giao (ví dụ: 1日)."]),
    F("9.4", "配送回数（1サイクル）", "Số lần giao (1 chu kỳ)", ".es-field::配送回数", "label", detail=["子契約の配送回数（例：2回）。", "Số lần giao của hợp đồng con (ví dụ: 2回)."],
      demo_ok=["コードは「2回」の固定値。子契約の値を出す（H11・配送_08 §15-6）", "Code để cố định 「2回」. Hiện giá trị của hợp đồng con (H11・配送_08 §15-6)"]),
    F("9.5", "配送パターン", "Mẫu giao hàng", ".es-field::配送パターン", "label", detail=["サイクル／個別指定／都度配送（子契約の値）。", "サイクル / 個別指定 / 都度配送 (giá trị của hợp đồng con)."],
      demo_ok=["コードは「サイクル」の固定値。子契約の値を出す（H11）", "Code để cố định 「サイクル」. Hiện giá trị của hợp đồng con (H11)"]),
    F("9.6", "中継", "Trung chuyển", ".es-field::中継", "label", detail=["「中継あり」「中継なし」。ルートの区間から判定する（途中の状態は持たない）。", "「中継あり」「中継なし」. Xác định từ các chặng của tuyến (không giữ trạng thái giữa chừng)."]),
    F("9.7", "問い合わせ確認URL", "URL tra cứu", "-", "link", "click", detail=["荷物の問い合わせ確認ページの URL（配送_08 §15-6）。路線便は追跡ページ、委託・自社は無し。", "URL trang tra cứu hàng (配送_08 §15-6). Chuyến đường dài là trang theo dõi, ủy thác・tự vận hành thì không có."],
      demo_ok=["コードのルートに問い合わせ確認URLの欄がない（送り状の表の追跡ページだけ）。足す（H11）", "Trong tuyến của code chưa có ô URL tra cứu (chỉ có trang theo dõi trong bảng phiếu gửi). Thêm (H11)"]),
    F("9.8", "ルートの説明", "Giải thích tuyến", ".es-card .note::子契約", "label", detail=["「子契約 … の配送ルート設定から引き継ぎ」の説明文。", "Câu giải thích 「子契約 … の配送ルート設定から引き継ぎ」."]),
    F("9.9", "地点と配送会社（ルート順）", "Địa điểm và công ty vận chuyển (theo thứ tự tuyến)", ".es-card .subh::地点と配送会社^", "table", "view",
      detail=["出荷倉庫 → 中継 → 納品先の順の表。列：No・名称・ID（倉庫・中継先は倉庫マスタ、拠点は拠点・契約へのリンク）・住所・電話・担当者・納品条件・次の地点へ運ぶ配送会社・この地点での受取・搬入経路（押すと「添付資料」タブへ）。", "Bảng theo thứ tự kho xuất → trung chuyển → nơi giao. Cột: No・tên・ID (kho・điểm trung chuyển link sang master kho, chi nhánh link sang 拠点・契約)・địa chỉ・điện thoại・người phụ trách・điều kiện giao・công ty vận chuyển tới điểm kế・cách nhận tại điểm này・lối vào (nhấn mở tab 「添付資料」)."]),
    F("9.10", "送り状番号", "Số phiếu gửi", ".es-card .es-section-title::送り状番号", "area", detail=["送り状の表と、下に説明。1次が委託・自社の便は ES が採番（配送No＋箱番号。追跡ページはない）。1次が路線の便は出荷のあと運送会社の CSV で取り込むか、ここで入れる。", "Bảng phiếu gửi và giải thích bên dưới. Chuyến có chặng 1 là ủy thác・tự vận hành thì ES cấp số (配送No + số thùng; không có trang theo dõi). Chuyến có chặng 1 là đường dài thì nhập CSV của hãng sau khi xuất kho hoặc nhập ở đây."]),
    F("9.11", "送り状の表", "Bảng phiếu gửi", ".es-card .es-table::送り状番号", "table", detail=["列：送り状番号・発行元（ES採番／運送会社）・配送会社・箱（n / 全体）・状態（有効＝緑・無効＝灰）・操作（路線便の有効な行だけ）。運送会社の送り状はリンク（追跡ページ）。", "Cột: số phiếu gửi・nơi phát hành (ES cấp / hãng vận tải)・công ty vận chuyển・thùng (n / tổng)・trạng thái (有効 = xanh lá・無効 = xám)・thao tác (chỉ dòng hợp lệ của chuyến đường dài). Phiếu của hãng vận tải là link (trang theo dõi)."]),
    F("9.12", "送り状の説明", "Giải thích phiếu gửi", ".es-card .note::ES が採番します", "label", detail=["路線便：「送り状は出荷のあとに運送会社の CSV で取り込むか、ここで入れます（ヤマトは12桁の数字）…」。委託・自社：「ES が採番します（配送No＋箱番号）…」。", "Chuyến đường dài: 「送り状は出荷のあとに運送会社の CSV で取り込むか、ここで入れます（ヤマトは12桁の数字）…」. Ủy thác・tự vận hành: 「ES が採番します（配送No＋箱番号）…」."]),
]
D_TRACK = [
    F("10", "送り状番号の追加・訂正", "Thêm・sửa số phiếu gửi", ".es-card .es-section-title::送り状番号", "area", cond=["路線便の配送（予定・取消でない）で、権限（機能ごとの操作＝更新）があるとき", "Chuyến đường dài (không phải 予定・取消) và có quyền (thao tác theo chức năng = 更新)"],
      detail=["路線便の送り状番号は運営が入れる（ヤマトの API は使わない）。追加・訂正・無効にする。", "Số phiếu gửi chuyến đường dài do 運営 nhập (không dùng API ヤマト). Thêm・sửa・vô hiệu."]),
    F("10.1", "送り状番号（追加）", "Số phiếu gửi (thêm)", 'input[placeholder="例：4471-1006-0012"]', "text", "input", req="○",
      len="文字列 20", init=["空", "Trống"], ex=["4471-1006-0012", "Số phiếu gửi ヤマト: 12 chữ số (có thể kèm dấu gạch nối)"],
      valid=["ヤマトは12桁の数字（ハイフンは入れても可）。ほかの荷物で使われている番号は不可。ほかの運送会社の形式は未確認（open）。", "ヤマト: 12 chữ số (có thể kèm dấu gạch nối). Không dùng số đang dùng cho hàng khác. Định dạng của hãng khác chưa xác nhận (open)."],
      detail=["ラベル「送り状番号を追加（ヤマト：12桁の数字）」。Enter か「追加」で登録する。空のときは「追加」を押せない。登録できたら S133。", "Nhãn 「送り状番号を追加（ヤマト：12桁の数字）」. Enter hoặc 「追加」 để đăng ký. Trống thì không bấm được 「追加」. Đăng ký xong hiện S133."],
      err=["E01", "E170", "E09", "S133"],
      open=["ヤマト以外の路線便（佐川・福山通運など）の送り状番号の形式と追跡URLのひな形は、お客様・ヤマト以外の運送会社に確認する（配送_10 #19・確認メモ D-2 [open] 4）", "Định dạng số phiếu gửi của các hãng ngoài ヤマト (佐川・福山通運…) và mẫu URL theo dõi cần xác nhận với khách / hãng vận tải (配送_10 #19・ghi chú xác nhận D-2 [open] 4)"],
      ask="お客様（物流）・運送会社",
      demo_ok=["重複の文言がコードでは「送り状番号 … はほかの荷物で使っています」。共通の E09（既に登録されています）に揃える。入力チェックの文言は画面ではなくトースト（コード）。インラインにする", "Câu trùng trong code là 「…はほかの荷物で使っています」; dùng E09 chung. Lỗi hiện ở toast (code); chuyển thành lỗi inline"]),
    F("10.2", "追加", "Thêm", ".es-card button::追加", "button", "click", cond=["入力があるとき", "Khi đã nhập"], detail=["送り状番号を登録する（箱の番号は続き）。変更履歴に「送り状番号の登録：…」を残す。同じ出荷日・同じ運送会社の送り状がそろったら配送依頼のメールを送る。", "Đăng ký số phiếu gửi (số thùng nối tiếp). Ghi vào 変更履歴 「送り状番号の登録：…」. Khi đủ phiếu cùng ngày xuất・cùng hãng thì gửi email yêu cầu giao."], err=["S133"], demo_ok=H_TOAST),
    F("10.3", "訂正", "Sửa", ".es-card td button::訂正", "button", "click", cond=["有効な送り状の行", "Dòng phiếu gửi còn hiệu lực"], detail=["その行の番号を入力欄にして直す。「保存」「やめる」が出る。変更履歴に「送り状番号の訂正：旧 → 新」を残す。", "Biến số của dòng thành ô nhập để sửa. Hiện 「保存」「やめる」. Ghi vào 変更履歴 「送り状番号の訂正：cũ → mới」."]),
    F("10.4", "無効にする", "Vô hiệu", ".es-card td button::無効にする", "button", "click", cond=["有効な送り状の行", "Dòng phiếu gửi còn hiệu lực"], err=["Q01", "S133"],
      detail=["誤って入れた番号を無効にする（記録は残す）。元に戻せないので Q01「本当に無効にしてもよろしいですか？」を出してから実行する。", "Vô hiệu số nhập nhầm (vẫn giữ lịch sử). Không hoàn tác được nên hiện Q01 「本当に無効にしてもよろしいですか？」 trước khi thực hiện."],
      demo_ok=["コードは確認なしですぐ実行する。Q01 を出す（H16）", "Code thực hiện ngay không hỏi. Hiện Q01 (H16)"]),
    F("10.5", "追跡ページ", "Trang theo dõi", ".es-card td a[target=_blank]", "link", "click", cond=["運送会社の有効な送り状", "Phiếu gửi hợp lệ của hãng vận tải"], detail=["ヤマトの追跡ページを開く（API 連携はしない。配送状況は追跡ページで確かめる）。", "Mở trang theo dõi của ヤマト (không liên kết API; kiểm tra tình trạng giao hàng ở trang theo dõi)."]),
]
D_RESULT = [
    F("11", "納品実績", "Kết quả giao hàng", ".es-card .es-section-title::納品実績", "area", detail=["納品の実績（共通データから。受付簿 No.47）。データがない欄・表は出さない。受取者は出さない。完了日時・納品数・備考と駐車料金の直し方は、この実績タブの中（「実績を直す」→入力→保存。理由必須・変更履歴。11.11〜11.17。hong 2026-10-07 D3）。編集画面（AW_DLVR_003）には足さない。", "Kết quả giao hàng (từ dữ liệu chung; 受付簿 No.47). Ô・bảng không có dữ liệu thì không hiện. Không hiện người nhận. Cách sửa ngày giờ hoàn tất・số lượng giao・ghi chú và phí đỗ xe nằm ngay trong tab 実績 này (「実績を直す」 → nhập → lưu; bắt buộc lý do・lưu 変更履歴; 11.11〜11.17; hong 2026-10-07 D3). Không thêm vào màn sửa (AW_DLVR_003)."],
      demo_ok=["実績は運営が直せる（理由必須・履歴）。コードは読み取りだけ（H17）", "運営 sửa được 実績 (bắt buộc lý do・lịch sử). Code chỉ đọc (H17)"]),
    F("11.1", "状態", "Trạng thái", ".es-field::状態", "label", detail=["配送データの状態（バッジなしの文字）。", "Trạng thái của dữ liệu giao hàng (chữ, không badge)."]),
    F("11.2", "納品完了日時", "Ngày giờ hoàn tất giao", ".es-field::納品完了日時", "label", detail=["yyyy-mm-dd HH:MM。", "yyyy-mm-dd HH:MM."]),
    F("11.3", "完了の確定方法", "Cách xác nhận hoàn tất", ".es-field::完了の確定方法", "label", detail=["「ドライバーの報告」か「みなし完了（運送会社が配達。納品日の翌朝に納品済）」。", "「ドライバーの報告」 hoặc 「みなし完了（運送会社が配達。納品日の翌朝に納品済）」."]),
    F("11.4", "配送スタッフ", "Nhân viên giao hàng", ".es-field::配送スタッフ", "label", detail=["納品した人。", "Người đã giao."]),
    F("11.5", "駐車料金（税込）", "Phí đỗ xe (đã gồm thuế)", ".es-field::駐車料金", "label", detail=["ドライバーが立て替え → 委託配送会社がまとめて運営へ請求（法人には請求しない）。「n円（領収書ファイル名）」。無ければ「—」。", "Tài xế ứng trước → công ty vận chuyển ủy thác gom lại gửi cho 運営 (không tính cho công ty khách). 「n円（tên tệp biên lai）」. Không có thì 「—」."], demo_ok=["決定では運営が直せる（理由必須・履歴）。コードは読み取りだけ（H17）", "Quyết định: 運営 sửa được (bắt buộc lý do・lịch sử). Code chỉ đọc (H17)"]),
    F("11.6", "後続の配送", "Chuyến giao tiếp theo", ".es-field::後続の配送", "link", "click", cond=["子の配送があるとき", "Khi có chuyến con"], detail=["子の配送Noのリンク（状態・食数つき）。", "Link tới 配送No của chuyến con (kèm trạng thái・số suất)."]),
    F("11.7", "ES配送便の手順", "Các bước của ES配送便", ".es-checklist", "area", cond=["ES配送便で手順の記録があるとき", "Khi ES配送便 có ghi nhận các bước"], detail=["ドライバーアプリの手順のチェックリスト（○＝完了・×＝NG・△＝警告・－＝対象外）。「配送完了」は報告済みの意味で、トラブル未解決のあいだ状態は受取済のまま。", "Danh sách các bước trên app tài xế (○ = xong・× = NG・△ = cảnh báo・－ = không áp dụng). 「配送完了」 nghĩa là đã báo cáo; trong lúc sự cố chưa giải quyết thì trạng thái vẫn là 受取済."]),
    F("11.8", "検品の差異・代替品", "Chênh lệch kiểm hàng・hàng thay thế", ".es-card .lbl::検品の差異", "table", cond=["差異または代替品があるとき", "Khi có chênh lệch hoặc hàng thay thế"], detail=["列：商品名・確定・実績・差（右寄せ。不足は赤）・代替元・理由。実績の確定は運営が行う。代替品は代替元の商品の単価で請求する。", "Cột: tên sản phẩm・chốt・thực tế・chênh lệch (căn phải; thiếu thì đỏ)・hàng gốc・lý do. Việc chốt kết quả do 運営. Hàng thay thế tính theo đơn giá của hàng gốc."]),
    F("11.9", "在庫確認・陳列の結果", "Kết quả kiểm tồn・trưng bày", ".es-card .es-section-title::在庫確認・陳列の結果", "table", cond=["在庫の記録があるとき", "Khi có ghi nhận tồn kho"], detail=["商品ごとに 陳列前の在庫・廃棄・今回の納品・陳列後の在庫（右寄せ・食）。陳列後の在庫＝陳列前 − 廃棄 ＋ 今回の納品。賞味期限は追跡しない。陳列前後の写真は「添付資料」タブ。", "Theo từng sản phẩm: tồn trước trưng bày・hủy・giao lần này・tồn sau trưng bày (căn phải・suất). Tồn sau = tồn trước − hủy + giao lần này. Không theo dõi hạn dùng. Ảnh trước/sau ở tab 「添付資料」."]),
    F("11.10", "区間ごとの受取", "Nhận theo chặng", ".es-card .es-section-title::区間ごとの受取", "table", cond=["区間の受取の記録があるとき", "Khi có ghi nhận nhận theo chặng"], detail=["列：区間・運ぶ会社・運び手・受取（日時）。", "Cột: chặng・công ty vận chuyển・người vận chuyển・nhận (ngày giờ)."]),
]
D_RESULT_FIX = [
    F("11.11", "実績を直す", "Sửa kết quả", ".es-card button::実績を直す", "button", "click", cond=OPBTN,
      detail=["実績タブの中のボタン。押すと 11.2（納品完了日時）・納品数・備考・11.5（駐車料金）がその場で入力欄になり、「保存」「やめる」が出る。実績がある配送だけ。編集画面（AW_DLVR_003）には足さない（hong 2026-10-07 D3）。", "Nút trong tab 実績. Nhấn thì 11.2 (ngày giờ hoàn tất)・số lượng giao・ghi chú・11.5 (phí đỗ xe) thành ô nhập ngay tại chỗ, hiện 「保存」「やめる」. Chỉ giao hàng đã có kết quả. Không thêm vào màn sửa (AW_DLVR_003) (hong 2026-10-07 D3)."],
      demo_ok=["コードは実績を読み取りだけで出す（H17）。直す入口をこのタブに作る", "Code chỉ hiển thị kết quả để đọc (H17). Làm lối sửa trong tab này"]),
    F("11.12", "納品完了日時（直す）", "Ngày giờ hoàn tất (sửa)", "-", "date", "input", demo_ok=["コードにはまだない画面（実績を直す入口。台帳 F 2026-10-08 D3）。作るときにこの項目を足す", "Chưa có trên code (lối sửa kết quả; 台帳 F 2026-10-08 D3). Thêm mục này khi làm code"], req="○",
      len=["日時 yyyy-mm-dd HH:MM", "Ngày giờ yyyy-mm-dd HH:MM"], init=["いまの納品完了日時", "Ngày giờ hoàn tất hiện tại"], ex=["2026-10-07 14:30", "Ngày giờ hoàn tất giao đã sửa"],
      valid=["日時の共通部品。出荷日より前は不可。", "Ô ngày giờ chung. Không được trước ngày xuất kho."], detail=["直した値は変更履歴に 変更前 → 変更後 で残る。", "Giá trị đã sửa lưu vào 変更履歴 dạng trước → sau."], err=["E01"]),
    F("11.13", "納品数（直す）", "Số lượng giao (sửa)", "-", "text", "input", demo_ok=["コードにはまだない画面（実績を直す入口。台帳 F 2026-10-08 D3）。作るときにこの項目を足す", "Chưa có trên code (lối sửa kết quả; 台帳 F 2026-10-08 D3). Thêm mục này khi làm code"], req="○",
      len=["整数 0〜9999（食）", "Số nguyên 0〜9999 (suất)"], init=["いまの納品数", "Số lượng giao hiện tại"], ex=["12", "Số suất đã giao thực tế của từng sản phẩm"],
      valid=["商品ごとに 0 以上の整数。全角は半角に直す。", "Mỗi sản phẩm là số nguyên ≥ 0. Số toàn góc đổi sang nửa góc."], detail=["実績の納品数（実績の確定は運営が行う）。", "Số lượng giao trong kết quả (việc chốt kết quả do 運営)."], err=["E01", "E12", "E14"]),
    F("11.14", "備考（直す）", "Ghi chú (sửa)", "-", "textarea", "input", demo_ok=["コードにはまだない画面（実績を直す入口。台帳 F 2026-10-08 D3）。作るときにこの項目を足す", "Chưa có trên code (lối sửa kết quả; 台帳 F 2026-10-08 D3). Thêm mục này khi làm code"], req="－",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["いまの備考", "Ghi chú hiện tại"], ex=["受付の森様に手渡し", "Ghi chú của kết quả giao (nhiều dòng, tối đa 500 ký tự)"],
      valid=["500文字以内・絵文字は不可。前後の空白を取る。", "Tối đa 500 ký tự, không emoji. Cắt khoảng trắng đầu cuối."], detail=["任意。", "Tùy chọn."], err=["E13"]),
    F("11.15", "駐車料金（直す）", "Phí đỗ xe (sửa)", "-", "text", "input", demo_ok=["コードにはまだない画面（実績を直す入口。台帳 F 2026-10-08 D3）。作るときにこの項目を足す", "Chưa có trên code (lối sửa kết quả; 台帳 F 2026-10-08 D3). Thêm mục này khi làm code"], req="－",
      len=["整数 0〜99999（円・税込）", "Số nguyên 0〜99999 (yên, đã gồm thuế)"], init=["いまの駐車料金", "Phí đỗ xe hiện tại"], ex=["800", "Phí đỗ xe đã gồm thuế (yên); để trống nếu không có"],
      valid=["0 以上の整数（円）。全角は半角に直す。", "Số nguyên ≥ 0 (yên). Số toàn góc đổi sang nửa góc."], detail=["ドライバーが立て替えた駐車料金（法人には請求しない）。", "Phí đỗ xe tài xế ứng trước (không tính cho công ty khách)."], err=["E12", "E14"]),
    F("11.16", "直す理由", "Lý do sửa", "-", "textarea", "input", demo_ok=["コードにはまだない画面（実績を直す入口。台帳 F 2026-10-08 D3）。作るときにこの項目を足す", "Chưa có trên code (lối sửa kết quả; 台帳 F 2026-10-08 D3). Thêm mục này khi làm code"], req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["ドライバーの報告の時刻が違っていたため", "Lý do sửa (nhiều dòng, tối đa 500 ký tự); lưu vào 変更履歴"],
      valid=["必須。500文字以内・絵文字は不可。前後の空白を取る。", "Bắt buộc. Tối đa 500 ký tự, không emoji. Cắt khoảng trắng đầu cuối."], detail=["空のまま「保存」を押すと E01。", "Để trống mà nhấn 「保存」 thì E01."], err=["E01", "E13"]),
    F("11.17", "保存・やめる", "Lưu・Thôi", "-", "button", "click", demo_ok=["コードにはまだない画面（実績を直す入口。台帳 F 2026-10-08 D3）。作るときにこの項目を足す", "Chưa có trên code (lối sửa kết quả; 台帳 F 2026-10-08 D3). Thêm mục này khi làm code"], pattern="P-FORM", err=["S01", "E30", "E31", "Q02"],
      detail=["「保存」で実績を更新し、S01「保存しました。」。変更履歴に 項目・変更前・変更後・理由・操作者 を残す。「やめる」は入力を捨てて読み取りに戻る（入力したあとは Q02）。ほかの人が先に直していれば E31。保存できなければ E30。", "「保存」 cập nhật kết quả và hiện S01 「保存しました。」. Lưu vào 変更履歴 mục・trước・sau・lý do・người thao tác. 「やめる」 bỏ nội dung và quay về chế độ đọc (đã nhập thì Q02). Có người khác sửa trước thì E31. Không lưu được thì E30."]),
]
D_RESULT_EMPTY = [
    F("12", "実績なしの表示", "Hiển thị chưa có kết quả", ".es-empty", "area", "show", err=["I133"],
      detail=["I133「納品実績はまだありません。」＋説明：納品日（日付）の当日、ドライバーの報告（路線便は翌朝にみなし完了）で登録される。確認中の子は「確定して出荷されると実績が入ります」。", "I133 「納品実績はまだありません。」 + giải thích: được đăng ký vào ngày giao nhờ báo cáo của tài xế (chuyến đường dài thì sáng hôm sau theo みなし完了). Chuyến con 確認中: 「確定して出荷されると実績が入ります」."],
      demo_ok=["コードの文言「まだ納品実績がありません」を I133 に揃える", "Câu trong code 「まだ納品実績がありません」; đồng nhất về I133"]),
]
D_TROUBLE = [
    F("13", "トラブル", "Sự cố", ".es-card .note::ドライバー", "area", detail=["ドライバー・委託配送会社の報告と、運営の代理登録を並べる。報告しても配送データの状態は変えない。解決は配送単位でまとめて行う。", "Xếp cạnh nhau báo cáo của tài xế・công ty vận chuyển ủy thác và đăng ký thay của 運営. Báo cáo không đổi trạng thái dữ liệu giao hàng. Giải quyết gộp theo từng giao hàng."]),
    F("13.1", "トラブルを代理登録（タブ内）", "Đăng ký sự cố thay (trong tab)", ".es-card button::トラブルを代理登録", "button", "click", cond=OPBTN, detail=["ヘッダーの同じボタンと同じ（状態 026 のモーダル）。", "Giống nút cùng tên ở đầu trang (modal trạng thái 026)."]),
    F("13.2", "トラブルの表", "Bảng sự cố", ".es-card .es-table::アプリの選択肢", "table", pattern="P-STATUS-COLORS",
      detail=["表示件数 10／20／50／100（初期 10）。列：No・種別（6区分のバッジ。未解決＝赤・解決済＝黄）・アプリの選択肢（原文）・報告者・日時・内容・写真・自動子（配送Noのリンク）・状態（未解決＝赤・解決済＝緑）。", "Số dòng hiển thị 10/20/50/100 (mặc định 10). Cột: No・loại (badge 6 nhóm; chưa giải quyết = đỏ・đã giải quyết = vàng)・lựa chọn trên app (nguyên văn)・người báo・ngày giờ・nội dung・ảnh・chuyến con tự động (link 配送No)・trạng thái (未解決 = đỏ・解決済 = xanh lá)."]),
    F("13.3", "6区分の対応表の説明", "Giải thích bảng đối chiếu 6 nhóm", ".es-card .note::アプリの選択肢は次の6区分", "label", cond=["未解決のとき", "Khi chưa giải quyết"], detail=["アプリの選択肢 → 運営の6区分（数量相違／誤配送／破損・品質不良／不在・受け取り不可／遅延／その他）と、自動子を作る区分（誤配送・不在・破損）の説明。種別が決まっていない報告は解決のときに6区分を付ける。", "Giải thích đối chiếu lựa chọn trên app → 6 nhóm của 運営 (数量相違 / 誤配送 / 破損・品質不良 / 不在・受け取り不可 / 遅延 / その他) và nhóm tạo chuyến con tự động (誤配送・不在・破損). Báo cáo chưa rõ loại thì gán 6 nhóm khi giải quyết."]),
    F("13.4", "対応を決める（タブ内）", "Quyết định cách xử lý (trong tab)", ".es-card button::対応を決める", "button", "click", cond=["未解決のトラブルがあり、権限があるとき", "Khi còn sự cố chưa giải quyết và có quyền"], detail=["ヘッダーの同じボタンと同じ（状態 028〜031 のモーダル）。", "Giống nút cùng tên ở đầu trang (modal trạng thái 028〜031)."]),
]
D_TROUBLE_DONE = [
    F("13.5", "解決", "Giải quyết", ".es-card .es-section-title::解決", "area", cond=["すべて解決済みのとき", "Khi tất cả đã giải quyết"], detail=["「対応」（例：全量を納品できた）・「解決者・日時」・「後続の配送」・「理由」。読むだけ。", "「対応」 (ví dụ: 全量を納品できた)・「解決者・日時」・「後続の配送」・「理由」. Chỉ xem."]),
]
D_TROUBLE_EMPTY = [
    F("14", "トラブルなしの表示", "Hiển thị chưa có sự cố", ".es-empty", "area", "show", err=["I133"],
      detail=["I133「トラブル報告はまだありません。」＋説明：出荷後にドライバー・委託配送会社から報告があるとここに並ぶ。子の配送は「元のトラブルは親 … の「トラブル」タブで解決します」。", "I133 「トラブル報告はまだありません。」 + giải thích: sau xuất kho khi tài xế・công ty ủy thác báo thì xếp ở đây. Chuyến con: 「元のトラブルは親 … の「トラブル」タブで解決します」."],
      demo_ok=["コードの文言「トラブル報告はありません」を I133 に揃える", "Câu trong code 「トラブル報告はありません」; đồng nhất về I133"]),
]
D_DOCS = [
    F("15", "添付資料", "Tài liệu đính kèm", ".es-card .es-section-title::地点の資料", "area", detail=["① 地点の資料（拠点・中継先マスタから参照）と ② この配送の資料の2つ。", "Hai phần: ① tài liệu địa điểm (tham chiếu từ master chi nhánh・điểm trung chuyển) và ② tài liệu của giao hàng này."]),
    F("15.1", "① 地点の資料", "① Tài liệu địa điểm", ".es-card .files", "area", detail=["搬入経路図・拠点マニュアル・駐車場案内・中継拠点の受け渡し手順（PDF・画像）。「委託業者向け」「顧客向け」のバッジ。差し替えはマスタ側で行い、この配送だけの差し替えはしない。リンク「拠点・契約情報を開く ›」。", "Sơ đồ lối vào・sổ tay chi nhánh・hướng dẫn bãi đỗ xe・quy trình bàn giao tại điểm trung chuyển (PDF・ảnh). Badge 「委託業者向け」「顧客向け」. Thay tài liệu ở master, không thay riêng cho giao hàng này. Link 「拠点・契約情報を開く ›」."],
      demo_ok=["コードは地点の資料が固定の見本4点（拠点のデータにつながっていない）。マスタの資料につなぐ（H17・受付簿 No.47）", "Code để 4 tài liệu mẫu cố định (chưa nối với dữ liệu chi nhánh). Nối với tài liệu ở master (H17・受付簿 No.47)"]),
    F("15.2", "② この配送の資料", "② Tài liệu của giao hàng này", ".es-section-title::この配送の資料", "area", detail=["陳列前後・検品・トラブルの写真と報告。納品済みでも追加・差し替えでき、変更履歴に残る。ファイルは JPG・PNG・PDF・HEIC、1件 5MB・10件まで（E11）。", "Ảnh và báo cáo trước/sau trưng bày・kiểm hàng・sự cố. Thêm・thay được kể cả khi đã giao, lưu vào 変更履歴. Tệp JPG・PNG・PDF・HEIC, mỗi tệp 5MB, tối đa 10 tệp (E11)."], err=["E11"],
      demo_ok=["コードは固定の見本。資料の追加・差し替えを実際に保存する（H17・受付簿 No.47）", "Code là mẫu cố định. Lưu thật khi thêm・thay tài liệu (H17・受付簿 No.47)"]),
    F("15.3", "資料を追加", "Thêm tài liệu", ".es-card button::資料を追加", "file", "upload", req="－", cond=["編集の権限があるとき", "Khi có quyền sửa"],
      len=["ファイル（JPG・PNG・PDF・HEIC・1件5MB・10件まで）", "Tệp (JPG, PNG, PDF, HEIC, 5MB/tệp, tối đa 10 tệp)"], init=["なし", "Chưa có"], ex=["陳列後.jpg", "Ảnh trưng bày xong, chụp tại điểm giao"],
      valid=["形式・サイズ・件数は共通（E11）。Excel・Word は受け付けない。HEIC は表示のときに変換する。", "Định dạng・dung lượng・số lượng theo chuẩn chung (E11). Không nhận Excel・Word. HEIC được chuyển khi hiển thị."],
      detail=["押すとファイルを選んで追加し、トースト S133「資料を追加しました。」。", "Nhấn để chọn tệp thêm vào, toast S133 「資料を追加しました。」."], err=["E11", "S133"], demo_ok=["コードはボタンを押すとトーストを出すだけ（ファイルは追加されない）", "Code chỉ hiện toast khi nhấn nút (không thêm tệp)"]),
]
D_HIST = [
    F("16", "変更履歴", "Lịch sử thay đổi", ".es-tabs", "area", pattern="P-HIST",
      detail=["申請・承認とシステムの変更を時系列で並べる。変更前 → 変更後と操作者を残す（保持 24ヶ月・暫定。open）。決定は P-HIST の列（日時・操作者・操作・項目・変更前・変更後・理由）の表。新しいものが上。直せない・消せない。", "Xếp theo thời gian các thay đổi: đơn xin・phê duyệt và thay đổi của hệ thống. Lưu trước → sau và người thao tác (giữ 24 tháng・tạm; open). Quyết định: bảng theo cột của P-HIST (ngày giờ・người thao tác・thao tác・mục・trước・sau・lý do). Mới nhất ở trên. Không sửa・xóa được."],
      open=["変更履歴の保持期間「24ヶ月」は暫定（配送_10 #16）。写真は12ヶ月（配送_06 12-4）", "Thời gian giữ 変更履歴 「24ヶ月」 là tạm (配送_10 #16). Ảnh 12 tháng (配送_06 12-4)"], ask="お客様",
      demo_ok=["コードは時系列の文章（Timeline）で、P-HIST の表（日時・操作者・操作・項目・変更前・変更後・理由）になっていない（H10）", "Code là dòng văn bản theo thời gian (Timeline), chưa là bảng P-HIST (ngày giờ・người thao tác・thao tác・mục・trước・sau・lý do) (H10)"]),
    F("16.1", "種類で絞り込み", "Lọc theo loại", ".es-card select", "select", "select", req="－",
      len=["選択（申請・承認／日付・数量／ルート・担当／状態／トラブル／出荷指示）", "Chọn (đơn xin, phê duyệt / ngày, số lượng / tuyến, phụ trách / trạng thái / sự cố / chỉ thị xuất kho)"], init=["すべての種類", "Tất cả loại"],
      ex=["日付・数量", "Chọn loại thì chỉ hiện các dòng loại đó"], detail=["選ぶとすぐ絞り込む。表の右上に置く。", "Chọn là lọc ngay. Đặt ở góc phải trên của bảng."]),
    F("16.2", "履歴の並び", "Danh sách lịch sử", ".es-timeline", "table", detail=["表示件数 10／20／50／100（初期 10）。「日時・操作した人・内容」。内容は変更前 → 変更後（例：納品日 10-07 → 10-08）・理由つき。", "Số dòng hiển thị 10/20/50/100 (mặc định 10). 「日時・người thao tác・nội dung」. Nội dung là trước → sau (ví dụ: 納品日 10-07 → 10-08) kèm lý do."]),
]
D_NOTFOUND = [
    F("17", "配送データが見つからない", "Không tìm thấy dữ liệu giao hàng", ".es-empty", "area", "show", err=["E100"],
      detail=["存在しない配送No の URL を開いたとき：E100「{対象}（{ID}）が見つかりません。」（{対象}＝配送データ、{ID}＝配送No。ほかの運営画面と共通）＋リンク「出荷・配送管理へ戻る ›」。パンくずと画面名は出る。", "Khi mở URL có 配送No không tồn tại: E100 「{対象}（{ID}）が見つかりません。」 ({対象} = dữ liệu giao hàng, {ID} = 配送No; dùng chung với các màn vận hành khác) + link 「出荷・配送管理へ戻る ›」. Vẫn hiện breadcrumb và tên màn hình."],
      demo_ok=["コードの文言は「配送データ {配送No} が見つかりません」。E100 に揃える", "Câu trong code là 「配送データ {配送No} が見つかりません」. Đồng nhất về E100"]),
]


# ---- モーダル（詳細の操作）。入力したあとに Esc・×・キャンセル・背景で閉じるときは Q02（hong 2026-10-07 Q8＝A）
def M(code, no, title_ja, title_vi, desc_ja, desc_vi, foot_ja="拠点名 ・ 温度帯 ・ 状態（例：大阪支店 ・ 冷蔵 ・ 出荷待）。", foot_vi="Tên chi nhánh ・ nhóm nhiệt độ ・ trạng thái (ví dụ: 大阪支店 ・ 冷蔵 ・ 出荷待)."):
    """モーダルの共通の項目（枠・タイトル・閉じる・フッターの案内）"""
    s = '[data-m=%s]' % code
    return [
        F(no, title_ja, title_vi, s, "modal", "click", cond=OPBTN, err=["Q02"],
          detail=["詳細の画面の上に重ねて開く大きなモーダル。%s入力したあとに Esc・×・キャンセル・背景のクリックで閉じるときは Q02（編集中の内容は保存されません）を出して、破棄するか選ばせる。何も入力していなければそのまま閉じる。" % desc_ja,
                  "Modal lớn mở chồng lên màn chi tiết. %sSau khi đã nhập, khi đóng bằng Esc・×・キャンセル・bấm nền thì hiện Q02 (nội dung đang sửa sẽ không được lưu) để chọn hủy bỏ hay không. Chưa nhập gì thì đóng luôn." % desc_vi],
          demo_ok=H_Q02),
        F(no + ".1", "タイトル・配送No", "Tiêu đề・配送No", s + " .es-dialog__head h2", "label", detail=["「%s」と配送No。" % title_ja.replace("（モーダル）", ""), "Tiêu đề 「%s」 và 配送No." % title_ja.replace("（モーダル）", "")]),
        F(no + ".2", "閉じる（×）", "Đóng (×)", s + " .es-dialog__close", "button", "click", err=["Q02"], detail=["モーダルを閉じる。入力済みなら Q02。", "Đóng modal. Đã nhập thì hiện Q02."], demo_ok=H_Q02),
        F(no + ".3", "フッターの案内", "Ghi chú chân modal", s + " .es-dialog__foot b", "label", detail=[foot_ja, foot_vi]),
    ]

CANCEL_ITEMS = M("DeliveryCancel", "17", "配送データの取消（モーダル）", "Hủy dữ liệu giao hàng (modal)", ["取消できるのは倉庫から出る前（予定・出荷待・確認中）だけ。", ""], ["", "拠点名 ・ 温度帯 ・ 状態。"], )
CANCEL_ITEMS += [
    F("17.4", "取消するとどうなるか", "Khi hủy thì thế nào", "[data-m=DeliveryCancel] table.imp", "table", detail=["影響の表。出荷指示・送り状・請求・法人Webの表示の4行。注記：取消できるのは倉庫から出る前だけ。出荷後に止めるときは「トラブルを代理登録」→「対応を決める」→「納品せずに終了する」を使う（Q2＝B）。", "Bảng ảnh hưởng gồm 4 dòng: chỉ thị xuất kho・phiếu gửi・thanh toán・hiển thị trên Web công ty. Ghi chú: chỉ hủy được khi chưa ra khỏi kho. Muốn dừng sau xuất kho thì dùng 「トラブルを代理登録」→「対応を決める」→「納品せずに終了する」 (Q2 = B)."],
      demo_ok=["コードの注記は「出荷後に止めるときは『対応を決める』の中止を使います」。『対応を決める』は未解決のトラブルがあるときだけ出るので、「トラブルを代理登録 → 対応を決める」に直す", "Ghi chú trong code: 「出荷後に止めるときは『対応を決める』の中止を使います」. 『対応を決める』 chỉ hiện khi có sự cố chưa giải quyết nên sửa thành 「トラブルを代理登録 → 対応を決める」"]),
    F("17.5", "出荷指示（影響）", "Chỉ thị xuất kho (ảnh hưởng)", "[data-m=DeliveryCancel] table.imp td::出荷指示", "label", detail=["この配送の出荷指示の状態（未送信／送信済 rev n／対象外）。送信済なら数量0の新しい版で打ち消す（いまは手動：変更した行の CSV を出し、運営が THOMAS に登録）。ピッキング開始後は倉庫へ電話でも連絡する。", "Trạng thái chỉ thị xuất kho của giao hàng này (未送信 / 送信済 rev n / 対象外). Nếu đã gửi thì hủy bằng bản mới số lượng 0 (hiện thủ công: xuất CSV dòng đã đổi, 運営 đăng ký vào THOMAS). Đã bắt đầu picking thì liên hệ kho cả bằng điện thoại."]),
    F("17.6", "送り状（影響）", "Phiếu gửi (ảnh hưởng)", "[data-m=DeliveryCancel] table.imp td::送り状", "label", detail=["この配送の送り状の件数（例：2件）。取消すると無効にする。", "Số phiếu gửi của giao hàng này (ví dụ: 2件). Hủy thì vô hiệu."]),
    F("17.7", "請求（影響）", "Thanh toán (ảnh hưởng)", "[data-m=DeliveryCancel] table.imp td::請求", "label", detail=["「対象外（実績0）」。", "「対象外（実績0）」."]),
    F("17.8", "法人Webの表示", "Hiển thị trên Web công ty", "[data-m=DeliveryCancel] table.imp td::法人Webの表示", "label",
      detail=["「表示しない（取消の配送は法人Webに出ない）」。「配送日調整中」のバッジは使わない（hong 2026-10-07 Q9＝A・受付簿 No.160）。", "「表示しない（取消の配送は法人Webに出ない）」. Không dùng badge 「配送日調整中」 (hong 2026-10-07 Q9 = A・受付簿 No.160)."],
      demo_ok=["コードのモーダルは「法人Webの表示｜配送日調整中」と書いている（実際の法人Webは何も出さない）。「表示しない（取消の配送は法人Webに出ない）」に直す", "Modal trong code ghi 「法人Webの表示｜配送日調整中」 (thực tế Web công ty không hiện gì). Sửa thành 「表示しない（取消の配送は法人Webに出ない）」"]),
    F("17.9", "理由", "Lý do", "[data-m=DeliveryCancel] .es-field::理由", "select", "select", req="○",
      len=["選択（倉庫の設備故障／車両を手配できない／天候（大雪など）／法人からの依頼（締切後・システム外で調整）／その他）", "Chọn (kho hỏng thiết bị / không bố trí được xe / thời tiết (tuyết lớn…) / theo yêu cầu của công ty (sau chốt, thỏa thuận ngoài hệ thống) / khác)"],
      init=["倉庫の設備故障（コードの見本の値）", "倉庫の設備故障 (giá trị mẫu của code)"], ex=["天候（大雪など）", "Lý do hủy chọn từ danh sách cố định"],
      valid=["必須。", "Bắt buộc."], detail=["取消の理由（分類）。", "Lý do hủy (phân loại)."], err=["E02"]),
    F("17.10", "理由の詳細", "Chi tiết lý do", "[data-m=DeliveryCancel] .es-field::理由の詳細", "textarea", "input", req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["関東倉庫の冷蔵庫故障。関西倉庫から出す（コードの見本の値）", "関東倉庫の冷蔵庫故障。関西倉庫から出す (giá trị mẫu của code)"], ex=["関東倉庫の冷蔵庫が故障したため。関西倉庫から出す", "Mô tả lý do hủy cụ thể (nhiều dòng, tối đa 500 ký tự)"],
      valid=["必須。前後の空白を取る。500文字以内・絵文字は不可。", "Bắt buộc. Cắt khoảng trắng đầu cuối. Tối đa 500 ký tự, không emoji."], detail=["取消の理由の詳しい内容。変更履歴に残る。", "Nội dung chi tiết lý do hủy. Lưu vào 変更履歴."], err=["E01", "E04", "E13"], demo_ok=H_MULTI),
    F("17.11", "続けて代わりの便を複製で作る", "Tạo tiếp chuyến thay thế bằng 複製", "[data-m=DeliveryCancel] .es-check", "check", "check", req="－",
      len=["ON／OFF", "ON / OFF"], init=["ON", "ON"], ex=["ON", "ON = sau khi hủy mở ngay modal 複製 (loại 代替便)"],
      cond=["複製の権限があるとき", "Khi có quyền 複製"], detail=["ON のまま取消すると、取消のあと複製のモーダル（代替便）が続けて開く。", "Để ON thì sau khi hủy, modal 複製 (loại 代替便) mở tiếp."]),
    F("17.12", "取消の説明", "Giải thích hủy", "[data-m=DeliveryCancel] .note", "label", detail=["「取消した配送データは消さずに残し、変更履歴に理由と操作者を記録します。」", "Dữ liệu giao hàng đã hủy không bị xóa mà được giữ lại, 変更履歴 ghi lý do và người thao tác."]),
    F("17.13", "キャンセル", "Hủy bỏ", "[data-m=DeliveryCancel] .es-dialog__foot button::キャンセル", "button", "click", err=["Q02"], detail=["モーダルを閉じる。入力済みなら Q02。", "Đóng modal. Đã nhập thì hiện Q02."], demo_ok=H_Q02),
    F("17.14", "取消する", "Thực hiện hủy", "[data-m=DeliveryCancel] .es-dialog__foot button::取消する", "button", "click", err=["S133", "E169", "E30", "E31", "E32"],
      detail=["赤いボタン。理由・理由の詳細をチェックし、通れば取消して S133「取消しました。」。取消できない状態なら E169。権限がなければ E32。", "Nút đỏ. Kiểm tra 理由・理由の詳細, hợp lệ thì hủy và hiện S133 「取消しました。」. Trạng thái không hủy được thì E169. Không có quyền thì E32."], demo_ok=H_TOAST),
]
CANCEL_ERR = [
    F("17.10", "理由の詳細（エラー）", "Chi tiết lý do (lỗi)", "[data-m=DeliveryCancel] .es-field::理由の詳細", "textarea", "input", req="○", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空にした", "Đã xóa trống"], ex=["（空）", "Để trống rồi nhấn 「取消する」 thì hiện lỗi bắt buộc"],
      valid=["必須。空なら赤枠と E01 を項目の下に出す。", "Bắt buộc. Trống thì viền đỏ và E01 dưới ô."], detail=["「取消する」を押したときのチェックの結果。ほかの欄はそのまま。", "Kết quả kiểm tra khi nhấn 「取消する」. Các ô khác giữ nguyên."], err=["E01"]),
]

DUP_ITEMS = M("DeliveryDuplicate", "18", "配送データの複製（モーダル）", "Nhân bản dữ liệu giao hàng (modal)", "元の配送データは書き換えず、子（確認中）を作る。", "Không sửa giao hàng gốc, tạo chuyến con (確認中). ", "「新しい配送No：{配送No}-{枝番}（枝番は最大9）」。", "「新しい配送No：{配送No}-{số nhánh}（枝番は最大9）」.")
DUP_ITEMS += [
    F("18.4", "複製の種類", "Loại nhân bản", "[data-m=DeliveryDuplicate] .es-radio::返送", "radio", "click", req="○",
      len=["選択（分納／再配送／代替便／返送／その他）", "Chọn (giao từng phần / giao lại / chuyến thay thế / trả hàng / khác)"], init=["返送（取消から続けたときは代替便）", "返送 (nếu tiếp từ 取消 thì 代替便)"], ex=["分納", "Chọn loại thì mô tả, lý do ban đầu và số lượng ban đầu đổi theo"],
      detail=["分納＝納品できた分で元を確定し残りを子で送る（元は一部納品済）／再配送＝届かなかった分を子で送り直す（元は再配送待）／代替便＝出荷前に元を取消し全量を別の倉庫・配送会社で出す／返送＝中止・一部納品で残った商品を返送先へ送る（請求しない）／その他＝上のどれにも当たらないとき（理由の詳細は必須）。選ぶと下の説明・理由・数量の初期値が変わる。",
              "分納 = chốt phần đã giao rồi gửi phần còn lại bằng chuyến con (gốc thành 一部納品済) / 再配送 = giao lại phần chưa tới bằng chuyến con (gốc thành 再配送待) / 代替便 = hủy gốc trước xuất kho và gửi toàn bộ từ kho・hãng khác / 返送 = gửi hàng còn lại sau 中止・一部納品 về nơi nhận trả (không tính phí) / その他 = khi không thuộc loại nào (bắt buộc ghi chi tiết lý do). Chọn thì mô tả・lý do・số lượng ban đầu bên dưới đổi theo."]),
    F("18.5", "複製の説明", "Mô tả loại nhân bản", "[data-m=DeliveryDuplicate] .mdl-b .note", "label", detail=["選んだ種類の説明文（例：「中止・一部納品で残った商品を本社などの返送先へ送ります。請求はしません。」）。", "Câu mô tả loại đã chọn (ví dụ: 「中止・一部納品で残った商品を本社などの返送先へ送ります。請求はしません。」)."]),
    F("18.6", "理由の詳細", "Chi tiết lý do", "[data-m=DeliveryDuplicate] .es-field::理由の詳細", "textarea", "input", req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["種類ごとの見本の文（例：中止で残った商品を本社へ返送）", "Câu mẫu theo loại (ví dụ: 中止で残った商品を本社へ返送)"], ex=["不在のため全量を再配送", "Lý do nhân bản (nhiều dòng, tối đa 500 ký tự)"],
      valid=["必須。前後の空白を取る。500文字以内・絵文字は不可。", "Bắt buộc. Cắt khoảng trắng đầu cuối. Tối đa 500 ký tự, không emoji."], detail=["子の配送の内部メモに「種類（理由）」として残る。", "Lưu vào ghi chú nội bộ của chuyến con dạng 「loại（lý do）」."], err=["E01", "E04", "E13"], demo_ok=H_MULTI),
    F("18.7", "返送先", "Nơi nhận trả hàng", "[data-m=DeliveryDuplicate] .es-field::返送先", "select", "select", req="○", cond=["種類が「返送」のとき", "Khi loại là 「返送」"],
      len=["選択（倉庫マスタの区分「返送先」。例：本社（東京・港区）／関西事務所（大阪・北区））", "Chọn (nhóm nơi nhận trả của master kho; ví dụ: trụ sở chính Tokyo Minato / văn phòng Kansai Osaka Kita)"], init=["本社（東京・港区）", "Trụ sở chính (Tokyo・Minato)"], ex=["関西事務所（大阪・北区）", "Nơi nhận hàng trả; chỉ 返送 mới đổi được nơi giao"],
      valid=["必須。", "Bắt buộc."], detail=["納品先を替えられるのは返送だけ（配送_04 §8-4）。ほかの種類は納品先が元の配送のコピーで変えられない。", "Chỉ 返送 mới đổi được nơi giao (配送_04 §8-4). Các loại khác lấy nơi giao của giao hàng gốc, không đổi."], err=["E02"],
      demo_ok=["コードの選択肢は2つの固定値。倉庫マスタの「返送先」から作る", "Lựa chọn trong code là 2 giá trị cố định. Lấy từ 「返送先」 của master kho"]),
    F("18.8", "納品先", "Nơi giao", "[data-m=DeliveryDuplicate] .es-field::納品先", "label", cond=["種類が「返送」以外のとき", "Khi loại không phải 「返送」"], detail=["「{拠点名}（元の配送からコピー）」。読むだけ。", "「{tên chi nhánh}（元の配送からコピー）」. Chỉ xem."]),
    F("18.9", "ピッキング倉庫", "Kho picking", "-", "select", "select", req="－", cond=["種類が「代替便」のとき", "Khi loại là 「代替便」"],
      len=["選択（関東倉庫 WH00001／関西倉庫 WH00002）", "Chọn (kho Kanto WH00001 / kho Kansai WH00002)"], init=["関西倉庫 WH00002", "Kho Kansai WH00002"], ex=["関西倉庫 WH00002", "Kho xuất mới cho chuyến thay thế"],
      detail=["移動先の倉庫で扱えない商品は選び直す。", "Sản phẩm kho mới không xử lý được thì chọn lại."],
      demo_ok=["種類が「代替便」のときだけ出る欄。この状態（返送）の画面には出ていないので番号は付けない", "Ô chỉ hiện khi loại là 「代替便」. Màn hình ở trạng thái này (返送) không có ô này nên không gắn số"]),
    F("18.10", "納品日（仮）", "Ngày giao (tạm)", "[data-m=DeliveryDuplicate] .es-field::納品日", "date", "input", req="○",
      len="日付 yyyy-mm-dd", init=["2026-10-08（コードの見本の値）", "2026-10-08 (giá trị mẫu của code)"], ex=["2026-10-20", "Ngày giao dự kiến của chuyến con; chốt sau"],
      valid=["日付の共通部品（yyyy-mm-dd）。必須。", "Ô ngày chung (yyyy-mm-dd). Bắt buộc."], detail=["ラベルは「納品日」。補足に暫定の日付であることを出す。ピッキング日はリードタイムを保って決まる。", "Nhãn là ngày giao ở dạng 「仮」. Ngày picking tính theo lead time."], err=["E01"], demo_ok=H_SAMPLE),
    F("18.11", "商品ごとの数量", "Số lượng theo sản phẩm", "[data-m=DeliveryDuplicate] .es-table", "table", detail=["列：商品名・元の確定数量・元の実績・子の数量（食）。画面に出るのは明細の上から3つまで。注記は種類ごと（例：残数が初期値です）。", "Cột: tên sản phẩm・số lượng chốt gốc・thực tế gốc・số lượng chuyến con (suất). Hiện tối đa 3 dòng đầu của chi tiết. Ghi chú theo loại (ví dụ: 残数が初期値です)."],
      demo_ok=["コードは明細の上から3つだけ・元の実績は固定の見本（10・8・5）。全明細を出して実データにする", "Code chỉ hiện 3 dòng đầu・thực tế gốc là mẫu cố định (10・8・5). Hiện đủ chi tiết và dùng dữ liệu thật"]),
    F("18.12", "子の数量", "Số lượng chuyến con", "[data-m=DeliveryDuplicate] .es-table td .es-input", "text", "input", req="○",
      len=["整数 0〜元の数量（食）", "Số nguyên 0〜số lượng gốc (suất)"], init=["種類ごとの初期値（全量／残数）", "Giá trị ban đầu theo loại (toàn bộ / phần còn lại)"], ex=["12", "Số suất gửi ở chuyến con của sản phẩm này"],
      valid=["全商品の合計が1以上。商品ごとに 0〜元の数量。全角は半角に直す。", "Tổng mọi sản phẩm ≥ 1. Mỗi sản phẩm 0〜số lượng gốc. Số toàn góc được đổi sang nửa góc."], detail=["右端の入力欄（単位 食）。", "Ô nhập ở cột phải nhất (đơn vị 食)."], err=["E171", "E12", "E14"]),
    F("18.13", "キャンセル", "Hủy bỏ", "[data-m=DeliveryDuplicate] .es-dialog__foot button::キャンセル", "button", "click", err=["Q02"], detail=["閉じる。入力済みなら Q02。", "Đóng. Đã nhập thì hiện Q02."], demo_ok=H_Q02),
    F("18.14", "複製する", "Thực hiện nhân bản", "[data-m=DeliveryDuplicate] .es-dialog__foot button::複製する", "button", "click", err=["S134", "E172", "E169", "E30", "E32"],
      detail=["子を確認中で作り、S134「{配送No}を作成しました（確認中）。」。枝番が9を超えるときは E172。権限がなければ E32。日付と数量は確定すると出荷待になる。", "Tạo chuyến con ở trạng thái 確認中, hiện S134 「{配送No}を作成しました（確認中）。」. Số nhánh vượt 9 thì E172. Không có quyền thì E32. Chốt ngày và số lượng thì thành 出荷待."], demo_ok=H_TOAST),
]
DUP_ERR = [
    F("18.6", "理由の詳細（エラー）", "Chi tiết lý do (lỗi)", "[data-m=DeliveryDuplicate] .es-field::理由の詳細", "textarea", "input", req="○", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空にした", "Đã xóa trống"], ex=["（空）", "Để trống rồi nhấn 「複製する」 thì hiện lỗi bắt buộc"],
      valid=["必須。空なら赤枠と E01。", "Bắt buộc. Trống thì viền đỏ và E01."], detail=["「複製する」を押したときのチェックの結果。", "Kết quả kiểm tra khi nhấn 「複製する」."], err=["E01"]),
    F("18.10", "納品日（エラー）", "Ngày giao (lỗi)", "[data-m=DeliveryDuplicate] .es-field::納品日", "date", "input", req="○", len="日付 yyyy-mm-dd", init=["空にした", "Đã xóa trống"], ex=["（空）", "Để trống thì hiện lỗi bắt buộc"],
      valid=["必須。日付は日付の共通部品（カレンダー）で選ぶので、形式エラーの専用メッセージは作らない。選べない日のエラーは E161〜E163 のみ（hong 2026-10-07 D5）。", "Bắt buộc. Ngày chọn bằng ô ngày chung (lịch) nên không tạo thông báo riêng cho lỗi sai dạng. Lỗi ngày không dùng được chỉ có E161〜E163 (hong 2026-10-07 D5)."], detail=["日付が空のときの E01。", "E01 khi ngày trống."], err=["E01"],
      demo_ok=["コードは「日付は yyyy-mm-dd で入力してください」を出す。出さない（カレンダーで選ぶ）", "Code hiện 「日付は yyyy-mm-dd で入力してください」. Bỏ đi (chọn bằng lịch)"]),
]
DUP_CHILD = [
    F("18.15", "すでに子がある帯", "Dải đã có chuyến con", "[data-m=DeliveryDuplicate] .es-inline--info", "label", "show", cond=["すでに子の配送があるとき", "Khi giao hàng đã có chuyến con"], err=["W134"],
      detail=["W134「この配送にはすでに子が{n}件あります。新しい子は枝番 -{m} になります。」＋子の配送No の一覧。未解決のトラブルに子があるときは2件目を作らずその子を使い回す。", "W134 「この配送にはすでに子が{n}件あります。新しい子は枝番 -{m} になります。」 + danh sách 配送No chuyến con. Nếu sự cố chưa giải quyết đã có chuyến con thì dùng lại chuyến đó, không tạo cái thứ 2."]),
]

REPORT_ITEMS = M("TroubleReport", "19", "トラブルの代理登録（モーダル）", "Đăng ký sự cố thay (modal)", "法人・拠点・配送会社からの連絡を運営が代わりに登録する。", "運営 đăng ký thay liên hệ từ công ty・chi nhánh・hãng vận chuyển. ")
REPORT_ITEMS += [
    F("19.4", "連絡元", "Nguồn liên hệ", "[data-m=TroubleReport] .es-field::連絡元", "select", "select", req="○",
      len=["選択（法人・拠点／委託配送会社／運送会社／その他）", "Chọn (công ty, chi nhánh / công ty ủy thác / hãng vận tải / khác)"], init=["法人・拠点", "Công ty・chi nhánh"], ex=["委託配送会社", "Ai đã liên hệ báo sự cố"], valid=["必須。", "Bắt buộc."], detail=["連絡してきた相手。", "Bên đã liên hệ."], err=["E02"]),
    F("19.5", "連絡者", "Người liên hệ", "[data-m=TroubleReport] .es-field::連絡者", "text", "input", req="－",
      len="文字列 60", init=["総務部 森 ・ 06-0000-0000（コードの見本の値）", "総務部 森 ・ 06-0000-0000 (giá trị mẫu của code)"], ex=["総務部 森 ・ 06-1234-5678", "Tên và số điện thoại người liên hệ (một dòng)"], valid=["60文字以内。絵文字は不可。", "Tối đa 60 ký tự. Không emoji."], detail=["連絡してきた人の部署・名前・電話。内容の末尾に残る。", "Bộ phận・tên・điện thoại người liên hệ. Lưu vào cuối nội dung."], err=["E04", "E13"], demo_ok=H_SAMPLE),
    F("19.6", "連絡を受けた日時", "Ngày giờ nhận liên hệ", "[data-m=TroubleReport] .es-field::連絡を受けた日時", "text", "input", req="－",
      len=["日時 yyyy-mm-dd HH:MM", "Ngày giờ yyyy-mm-dd HH:MM"], init=["2026-09-28 09:40（コードの見本の値）", "2026-09-28 09:40 (giá trị mẫu của code)"], ex=["2026-10-07 09:40", "Ngày giờ nhận liên hệ (JST), dạng yyyy-mm-dd HH:MM"],
      valid=["yyyy-mm-dd HH:MM の形。", "Đúng dạng yyyy-mm-dd HH:MM."], detail=["連絡を受けた日時。内容の末尾に残る。", "Ngày giờ nhận liên hệ. Lưu vào cuối nội dung."], err=["E200"],
      demo_ok=["コードは形式を確かめない。日時は yyyy-mm-dd HH:MM（入力の共通基準）で確かめ E200 を出す", "Code không kiểm tra dạng. Kiểm tra theo yyyy-mm-dd HH:MM (chuẩn nhập chung) và hiện E200"]),
    F("19.7", "種別（6区分）", "Loại (6 nhóm)", "[data-m=TroubleReport] .es-field::種別", "select", "select", req="○",
      len=["選択（数量相違（不足・過剰）／誤配送／破損・品質不良／不在・受け取り不可／遅延（渋滞・事故・天候）／その他）", "Chọn (chênh lệch số lượng (thiếu, thừa) / giao nhầm / hư hỏng, chất lượng / vắng mặt, không nhận được / chậm (kẹt xe, tai nạn, thời tiết) / khác)"],
      init=["不在・受け取り不可（コードの見本の値）", "不在・受け取り不可 (giá trị mẫu của code)"], ex=["破損・品質不良", "Loại sự cố theo 6 nhóm của 運営"],
      valid=["必須。", "Bắt buộc."], detail=["誤配送・不在・破損を選ぶと、登録と同時に送り直し用の子（確認中）を1件作る。ほかの種別は子を作らず未解決のトラブル報告として残る。", "Chọn 誤配送・不在・破損 thì khi đăng ký tạo luôn 1 chuyến con (確認中) để giao lại. Các loại khác không tạo chuyến con, lưu lại như báo cáo sự cố chưa giải quyết."], err=["E02"]),
    F("19.8", "内容", "Nội dung", "[data-m=TroubleReport] .es-field::内容", "textarea", "input", req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["9/25 の冷凍便が届いていない。受付にも荷物がない（コードの見本の値）", "9/25 の冷凍便が届いていない。受付にも荷物がない (giá trị mẫu của code)"], ex=["受付に荷物が届いていない。拠点の担当者から電話あり", "Nội dung liên hệ (nhiều dòng, tối đa 500 ký tự)"],
      valid=["必須。前後の空白を取る。500文字以内・絵文字は不可。", "Bắt buộc. Cắt khoảng trắng đầu cuối. Tối đa 500 ký tự, không emoji."], detail=["連絡の内容。「（代理登録：連絡元 連絡者 日時）」を末尾に足して保存する。", "Nội dung liên hệ. Lưu kèm 「（代理登録：nguồn liên hệ người liên hệ ngày giờ）」 ở cuối."], err=["E01", "E04", "E13"], demo_ok=H_MULTI),
    F("19.9", "写真を追加", "Thêm ảnh", "[data-m=TroubleReport] .es-dialog__body button::写真を追加", "file", "upload", req="－",
      len=["ファイル（JPG・PNG・PDF・HEIC・1件5MB・10件まで）", "Tệp (JPG, PNG, PDF, HEIC, 5MB/tệp, tối đa 10 tệp)"], init=["なし", "Chưa có"], ex=["不在票.jpg", "Ảnh phiếu báo vắng mặt"], valid=["形式・サイズ・件数は共通（E11）。", "Định dạng・dung lượng・số lượng theo chuẩn chung (E11)."],
      detail=["写真・資料は「この配送の資料」（添付資料タブ ②）に付く。", "Ảnh・tài liệu gắn vào 「この配送の資料」 (tab 添付資料 ②)."], err=["E11", "S133"], demo_ok=["コードはトーストを出すだけで、ファイルは付かない", "Code chỉ hiện toast, không đính kèm tệp"]),
    F("19.10", "子の作成の帯", "Dải tạo chuyến con", "[data-m=TroubleReport] .es-inline", "label", "show",
      detail=["種別が自動子の区分（誤配送・不在・破損）のとき青：「登録と同時に、送り直し用の子を1件作ります」（子 {配送No}-1・確認中・日付と数量は暫定・確定するまで出荷指示・割当・請求の対象外）。ほかは黄：「この種別では子を作りません」。", "Khi loại thuộc nhóm tạo chuyến con tự động (誤配送・不在・破損) thì xanh: 「登録と同時に、送り直し用の子を1件作ります」 (chuyến con {配送No}-1・確認中・ngày và số lượng tạm・đến khi chốt thì ngoài đối tượng chỉ thị xuất kho・gán・thanh toán). Loại khác thì vàng: 「この種別では子を作りません」."]),
    F("19.11", "種別の決め方（対応表）", "Cách xác định loại (bảng đối chiếu)", "[data-m=TroubleReport] details", "area", "click", detail=["開閉できる説明：ドライバーアプリの選択肢（原文）→ 運営の6区分・自動子の対応表（2026-10-01 決定 A3）。代理登録（電話・メール）も同じ6区分。ドライバーの報告は原文（app_reason_raw）を残す。", "Phần mở/đóng: bảng đối chiếu lựa chọn trên app tài xế (nguyên văn) → 6 nhóm của 運営・chuyến con tự động (quyết định 2026-10-01 A3). Đăng ký thay (điện thoại・email) cũng dùng 6 nhóm này. Báo cáo của tài xế giữ nguyên văn (app_reason_raw)."]),
    F("19.12", "みなし完了の配送", "Giao hàng hoàn tất theo みなし", "[data-m=TroubleReport] .es-check", "check", "check", req="－",
      cond=["運送会社が直接配達して納品済（みなし）になった配送のとき", "Khi giao hàng do hãng vận tải giao trực tiếp và thành 納品済（みなし）"],
      len=["ON／OFF", "ON / OFF"], init=["ON（コードの見本の値）", "ON (giá trị mẫu của code)"], ex=["ON", "ON = đã nhờ ヤマト điều tra"],
      detail=["「ヤマト運輸へ調査を依頼した」。調査で紛失・未配達と分かったら「対応を決める」で 再配送待（送り直す）か 中止 を選べる（みなし完了の納品済だけ）。請求が確定済みなら翌月の調整で直す。", "「ヤマト運輸へ調査を依頼した」. Nếu điều tra ra mất・chưa giao thì ở 「対応を決める」 chọn 再配送待（送り直す）hoặc 中止 (chỉ với 納品済 theo みなし). Nếu đã chốt thanh toán thì chỉnh ở kỳ sau."],
      demo_ok=["コードは常に出し、送り状番号（3512-0923-0031・0032）も固定の見本。みなし完了（納品済のみなし）の配送だけに出し、実際の送り状番号を出す（H15）", "Code luôn hiện và số phiếu gửi (3512-0923-0031・0032) cố định. Chỉ hiện với giao hàng 納品済 theo みなし và hiện số phiếu thật (H15)"]),
    F("19.13", "キャンセル", "Hủy bỏ", "[data-m=TroubleReport] .es-dialog__foot button::キャンセル", "button", "click", err=["Q02"], detail=["閉じる。入力済みなら Q02。", "Đóng. Đã nhập thì hiện Q02."], demo_ok=H_Q02),
    F("19.14", "登録する", "Đăng ký", "[data-m=TroubleReport] .es-dialog__foot button::登録する", "button", "click", err=["S133", "E169", "E30", "E32"],
      detail=["チェックして登録し、S133「トラブルを登録しました。」。登録しても配送データの状態は変えない。出荷済以降でないときは E169。", "Kiểm tra rồi đăng ký, hiện S133 「トラブルを登録しました。」. Đăng ký không đổi trạng thái dữ liệu giao hàng. Chưa tới 出荷済 thì E169."], demo_ok=H_TOAST),
]
REPORT_ERR = [
    F("19.8", "内容（エラー）", "Nội dung (lỗi)", "[data-m=TroubleReport] .es-field::内容", "textarea", "input", req="○", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空にした", "Đã xóa trống"], ex=["（空）", "Để trống rồi nhấn 「登録する」 thì hiện lỗi bắt buộc"],
      valid=["必須。空なら赤枠と E01。", "Bắt buộc. Trống thì viền đỏ và E01."], detail=["「登録する」を押したときのチェックの結果。", "Kết quả kiểm tra khi nhấn 「登録する」."], err=["E01"]),
]


RESOLVE_OPT_JA = ("全量を納品できた（代替品を含む）→ 納品済・自動子は取消／一部を納品し、残りを後日送る → 一部納品済＋子（残数）／一部を納品し、残りは送らない → 一部納品済・自動子は取消・残りは請求しない／"
                  "納品ゼロで送り直す → 再配送待＋子（全量）／当日中に再訪する → 受取済のまま・自動子は取消／納品せずに終了する → 中止（実績0・請求しない）・自動子は取消")
RESOLVE_OPT_VI = ("Giao đủ toàn bộ (gồm hàng thay thế) → 納品済・chuyến con tự động bị hủy / Giao một phần, phần còn lại gửi sau → 一部納品済 + chuyến con (số còn lại) / Giao một phần, phần còn lại không gửi → 一部納品済・chuyến con tự động bị hủy・phần còn lại không tính phí / "
                  "Không giao được gì, gửi lại → 再配送待 + chuyến con (toàn bộ) / Quay lại trong ngày → giữ nguyên 受取済・chuyến con tự động bị hủy / Kết thúc không giao → 中止 (thực tế 0・không tính phí)・chuyến con tự động bị hủy")

RESOLVE_ITEMS = M("TroubleResolve", "20", "トラブルの対応を決める（モーダル）", "Quyết định cách xử lý sự cố (modal)", "未解決のトラブル報告をまとめて解決する（2つの手順：対応を選ぶ → 数量・子・理由）。「中止」の直接のボタンは作らず、納品せずに終了するときもここで選ぶ（Q2＝B）。",
                  "Giải quyết gộp các báo cáo sự cố chưa giải quyết (2 bước: chọn cách xử lý → số lượng・chuyến con・lý do). Không có nút 「中止」 trực tiếp; kết thúc không giao cũng chọn ở đây (Q2 = B). ")
RESOLVE_ITEMS += [
    F("20.4", "手順の表示", "Hiển thị các bước", "[data-m=TroubleResolve] .trs-steps", "label", detail=["「1. 対応を選ぶ ▶ 2. 数量・子・理由を入れる」。いまの手順を強調する。", "「1. 対応を選ぶ ▶ 2. 数量・子・理由を入れる」. Nhấn mạnh bước hiện tại."]),
    F("20.5", "未解決のトラブル報告", "Báo cáo sự cố chưa giải quyết", "[data-m=TroubleResolve] .trs-sum", "label", detail=["「未解決のトラブル報告 n件（まとめて解決します）」。各報告の 種別（アプリの選択肢）・報告者・日時・自動子 を並べる。内容は「トラブル」タブで見られる。", "「未解決のトラブル報告 n件（まとめて解決します）」. Xếp từng báo cáo: loại (lựa chọn trên app)・người báo・ngày giờ・chuyến con tự động. Nội dung xem ở tab 「トラブル」."]),
    F("20.6", "報告の種別", "Loại của báo cáo", "-", "select", "select", req="○", cond=["種別が決まっていない報告（商品不足・誤配送・陳列の差異）があるとき", "Khi có báo cáo chưa rõ loại (thiếu hàng・giao nhầm・chênh lệch trưng bày)"],
      len=["選択（数量相違（不足・過剰）／誤配送）", "Chọn (chênh lệch số lượng (thiếu, thừa) / giao nhầm)"], init=["数量相違（不足・過剰）", "Chênh lệch số lượng (thiếu・thừa)"], ex=["誤配送", "Chọn 6 nhóm cho báo cáo chưa rõ loại"], valid=["必須。", "Bắt buộc."],
      detail=["アプリの選択肢（原文）を補足に出す。解決のときに6区分を付ける。", "Hiện lựa chọn trên app (nguyên văn) ở phần chú thích. Gán 6 nhóm khi giải quyết."], err=["E02"],
      demo_ok=["見本データに「種別が決まっていない報告」（商品不足・誤配送・陳列の差異）がないので、この欄は画面に出せない", "Dữ liệu mẫu không có báo cáo chưa rõ loại (thiếu hàng・giao nhầm・chênh lệch trưng bày) nên không thể hiện ô này trên màn hình"]),
    F("20.7", "対応を選ぶ", "Chọn cách xử lý", "[data-m=TroubleResolve] .trs-opt", "radio", "click", req="○",
      len=["選択（6つ）", "Chọn (6 lựa chọn)"], init=["納品ゼロで送り直す（コードの見本の値）", "納品ゼロで送り直す (giá trị mẫu của code)"], ex=["一部を納品し、残りを後日送る", "Chọn 1 trong 6; trạng thái kết quả quyết định theo lượng đã giao"],
      detail=["状態は納品できた量で決まる。6つ：" + RESOLVE_OPT_JA + "。「中止」は「納品せずに終了する」で行う。", "Trạng thái do lượng đã giao quyết định. 6 lựa chọn: " + RESOLVE_OPT_VI + ". 「中止」 thực hiện bằng 「納品せずに終了する」."]),
    F("20.8", "次へ", "Tiếp", "[data-m=TroubleResolve] .es-dialog__foot button::次へ", "button", "click", detail=["手順2へ。", "Sang bước 2."]),
    F("20.9", "キャンセル", "Hủy bỏ", "[data-m=TroubleResolve] .es-dialog__foot button::キャンセル", "button", "click", err=["Q02"], detail=["閉じる。種別・対応を変えたあとは Q02。", "Đóng. Sau khi đổi loại・cách xử lý thì hiện Q02."], demo_ok=H_Q02),
]
RESOLVE_STEP2 = [
    F("20.10", "選んだ対応", "Cách xử lý đã chọn", "[data-m=TroubleResolve] .trs-pick", "label", detail=["手順1で選んだ対応とその結果の状態。「対応を選び直す」で手順1へ戻る。", "Cách xử lý đã chọn ở bước 1 và trạng thái kết quả. 「対応を選び直す」 quay lại bước 1."]),
    F("20.11", "納品できた数", "Số lượng đã giao", "[data-m=TroubleResolve] .es-table td .es-input", "text", "input", req="○", cond=["全量・一部（残りを送る／送らない）のとき", "Khi chọn giao đủ / giao một phần (gửi / không gửi phần còn lại)"],
      len=["整数 0〜確定数量（食）", "Số nguyên 0〜số lượng chốt (suất)"], init=["全量（一部のときは最後の商品が2食少ない・コードの見本）", "Toàn bộ (giao một phần thì sản phẩm cuối thiếu 2 suất; mẫu của code)"], ex=["34", "Số suất thực tế đã giao của sản phẩm này"],
      valid=["0〜確定数量。全角は半角に直す。", "0〜số lượng chốt. Số toàn góc được đổi sang nửa góc."], detail=["商品ごとの納品できた数。一部納品では、確定 − 納品できた数 が送り直す数になる。", "Số đã giao theo từng sản phẩm. Giao một phần thì (chốt − đã giao) là số gửi lại."], err=["E12", "E14"],
      demo_ok=["コードの入力欄は値を持たないだけで保存に使わない（解決の内容は対応・理由・子の日付だけ）。数量を保存する", "Ô nhập trong code không được dùng khi lưu (chỉ lưu cách xử lý・lý do・ngày chuyến con). Lưu cả số lượng"]),
    F("20.12", "代替元（代替品のとき）", "Hàng gốc (khi là hàng thay thế)", "-", "select", "select", req="－", cond=["「全量を納品できた」のとき", "Khi chọn 「全量を納品できた」"],
      len=["選択（代替元の商品）", "Chọn (sản phẩm gốc)"], init=["代替なし", "Không thay thế"], ex=["冷凍 ドリア（代替）", "Chọn sản phẩm gốc nếu đã giao hàng thay thế"], detail=["代替品は代替元の商品の単価で請求する。", "Hàng thay thế tính theo đơn giá của sản phẩm gốc."],
      demo_ok=["「全量を納品できた」を選んだときだけ出る欄。状態 029・030 は別の対応を選んでいるので、この画面には出ていない", "Ô chỉ hiện khi chọn 「全量を納品できた」. Trạng thái 029・030 chọn cách xử lý khác nên không có ô này trên màn hình"]),
    F("20.13", "送り直す子", "Chuyến con gửi lại", "[data-m=TroubleResolve] .es-dialog__sec::送り直す子", "area", cond=["「一部を納品し、残りを後日送る」「納品ゼロで送り直す」のとき", "Khi chọn 「一部を納品し、残りを後日送る」 hoặc 「納品ゼロで送り直す」"], detail=["自動子を使い回す（1配送に子は1件まで）。子の配送No・子の種類（分納・残り n食／再配送・全量 n食）を読むだけで出す。", "Dùng lại chuyến con tự động (1 giao hàng tối đa 1 chuyến con). Hiện 配送No chuyến con・loại (分納・còn n suất / 再配送・toàn bộ n suất), chỉ xem."]),
    F("20.14", "納品日（仮）", "Ngày giao (tạm)", "[data-m=TroubleResolve] .es-field::納品日", "date", "input", req="○", cond=["送り直す子があるとき", "Khi có chuyến con gửi lại"],
      len="日付 yyyy-mm-dd", init=["2026-10-08（コードの見本の値）", "2026-10-08 (giá trị mẫu của code)"], ex=["2026-10-20", "Ngày giao của chuyến con gửi lại"], valid=["日付の共通部品。必須。", "Ô ngày chung. Bắt buộc."], detail=["解決すると、この日付で子が出荷待になる。", "Khi giải quyết, chuyến con thành 出荷待 theo ngày này."], err=["E01"], demo_ok=H_SAMPLE),
    F("20.15", "運賃", "Cước vận chuyển", "[data-m=TroubleResolve] .es-field::運賃", "select", "select", req="－", cond=["「納品ゼロで送り直す」「納品せずに終了する」のとき", "Khi chọn 「納品ゼロで送り直す」 hoặc 「納品せずに終了する」"],
      len=["選択（請求しない／請求する）", "Chọn (không tính / tính phí)"], init=["請求しない", "Không tính phí"], ex=["請求する", "「請求する」 phải kèm lý do"], valid=["「請求する」は理由が必須（運賃の請求の根拠）。", "「請求する」 bắt buộc có lý do (căn cứ thu cước)."], detail=["補足「「請求する」は理由必須」。「請求する」にしたときは理由の末尾に「・運賃を請求する」を足して保存する。", "Chú thích 「「請求する」は理由必須」. Chọn 「請求する」 thì lưu thêm 「・運賃を請求する」 vào cuối lý do."]),
    F("20.16", "理由", "Lý do", "[data-m=TroubleResolve] .es-field::理由", "textarea", "input", req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["対応ごとの見本の文（例：拠点が不在のため全量を持ち戻り…）", "Câu mẫu theo cách xử lý (ví dụ: 拠点が不在のため全量を持ち戻り…)"], ex=["拠点の担当者が不在のため持ち戻り。10/20 午後に再配送することを拠点と合意", "Lý do giải quyết (nhiều dòng, tối đa 500 ký tự)"],
      valid=["必須。前後の空白を取る。500文字以内・絵文字は不可。", "Bắt buộc. Cắt khoảng trắng đầu cuối. Tối đa 500 ký tự, không emoji."], detail=["解決の理由。変更履歴に残る。", "Lý do giải quyết. Lưu vào 変更履歴."], err=["E01", "E04", "E13"], demo_ok=H_MULTI),
    F("20.17", "結果の説明", "Giải thích kết quả", "[data-m=TroubleResolve] .es-inline--info", "label", detail=["「解決すると：…」（例：親は再配送待、自動子を再配送の子（全量 36食）にします。子の画面で日付と数量を確定すると出荷待になります。）。", "「解決すると：…」 (ví dụ: chuyến cha thành 再配送待, chuyến con tự động thành chuyến con giao lại (toàn bộ 36 suất). Chốt ngày và số lượng ở màn của chuyến con thì thành 出荷待.)."]),
    F("20.18", "戻る", "Quay lại", "[data-m=TroubleResolve] .es-dialog__foot button::戻る", "button", "click", detail=["手順1へ戻る（入力は残す）。", "Về bước 1 (giữ nội dung đã nhập)."]),
    F("20.19", "解決する", "Giải quyết", "[data-m=TroubleResolve] .es-dialog__foot button::解決する", "button", "click", err=["S133", "E169", "E30", "E32"],
      detail=["理由をチェックして解決し、S133「トラブルを解決しました。」。親の状態は選んだ対応で決まり、自動子は出荷待（送り直す対応）か取消になる。未解決のトラブルがなければ E169。", "Kiểm tra lý do rồi giải quyết, hiện S133 「トラブルを解決しました。」. Trạng thái chuyến cha theo cách xử lý đã chọn; chuyến con tự động thành 出荷待 (khi giao lại) hoặc bị hủy. Không còn sự cố chưa giải quyết thì E169."], demo_ok=H_TOAST),
]
RESOLVE_ERR = [
    F("20.16", "理由（エラー）", "Lý do (lỗi)", "[data-m=TroubleResolve] .es-field::理由", "textarea", "input", req="○", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空にした", "Đã xóa trống"], ex=["（空）", "Để trống rồi nhấn 「解決する」 thì hiện lỗi bắt buộc"],
      valid=["必須。空なら赤枠と E01。", "Bắt buộc. Trống thì viền đỏ và E01."], detail=["「解決する」を押したときのチェックの結果。", "Kết quả kiểm tra khi nhấn 「解決する」."], err=["E01"]),
]

CR_ITEMS = M("ChangeRequestProcess", "21", "変更申請の確認（モーダル）", "Xác nhận đơn xin đổi (modal)", "法人のお届け日の変更申請を1件ずつ処理する（承認・別日の提案・否認）。一括承認は AW_SCHD。",
             "Xử lý từng đơn xin đổi ngày giao của công ty (duyệt・đề xuất ngày khác・từ chối). Duyệt hàng loạt ở AW_SCHD. ", "申請番号（DD-…）。", "Số đơn (DD-…).")
CR_ITEMS[3] = F("21.3", "フッターの案内", "Ghi chú chân modal", "[data-m=ChangeRequestProcess] .es-dialog__foot", "label", detail=["左に「否認する」、右に「選択した日で承認」。", "Bên trái 「否認する」, bên phải 「選択した日で承認」."])
CR_ITEMS += [
    F("21.4", "システム判定", "Phán định của hệ thống", "[data-m=ChangeRequestProcess] .es-dialog__head .es-badge", "label", detail=["見出しの横に灰のバッジ（問題なし／希望日なし／要再確認／提案中）。", "Badge xám cạnh tiêu đề (問題なし / 希望日なし / 要再確認 / 提案中)."]),
    F("21.5", "基本情報", "Thông tin cơ bản", "[data-m=ChangeRequestProcess] .es-section-title::基本情報", "area", detail=["配送No（リンク）・温度帯・配送区分・出荷時点／配送会社／到着時点の表（ルートの地点）。右の ▲ で折りたたむ。", "配送No (link)・nhóm nhiệt độ・phân loại giao hàng・bảng điểm xuất / công ty vận chuyển / điểm đến (các địa điểm của tuyến). Nhấn ▲ bên phải để thu gọn."], demo_ok=H_SAMPLE),
    F("21.6", "変更後の納品日を選択", "Chọn ngày giao sau khi đổi", "[data-m=ChangeRequestProcess] .es-section-title::変更後の納品日を選択", "table", detail=["現在納品予定日・出荷予定日・リードタイム・申請日・申請者・申請理由と、希望納品日の表（○ 選択・No・希望納品日・納品日サイクル・出荷日・出荷日サイクル・リードタイム・出荷日の件数）。赤字＝リードタイムを超える・出荷不可・件数の上限（300件）超え。出荷日の件数には営業サンプルの配送も数える（2026-10-08）。出荷不可の日は選べない。", "Ngày giao dự kiến hiện tại・ngày xuất dự kiến・lead time・ngày xin・người xin・lý do xin và bảng ngày mong muốn (○ chọn・No・ngày giao mong muốn・chu kỳ ngày giao・ngày xuất・chu kỳ ngày xuất・lead time・số lượng ngày xuất). Chữ đỏ = vượt lead time・không xuất được・vượt giới hạn số lượng (300). Số lượng của ngày xuất cũng tính cả giao hàng của mẫu kinh doanh (2026-10-08). Ngày không xuất được thì không chọn."], demo_ok=H_SAMPLE),
    F("21.7", "希望日の選択", "Chọn ngày mong muốn", "[data-m=ChangeRequestProcess] .es-table label.es-radio", "radio", "click", req="○",
      len=["選択（第一希望・第二希望・別日のどれか1つ）", "Chọn (1 trong nguyện vọng 1, 2, ngày khác)"], init=["第一希望", "Nguyện vọng 1"], ex=["第一希望（2026-11-12）", "Chọn ngày muốn duyệt hoặc ngày muốn đề xuất"], valid=["必須。出荷不可・納品不可の日は選べない。", "Bắt buộc. Không chọn được ngày không xuất・không giao được."],
      detail=["希望日の選択はラベルごと押せる大きさにする（押す場所は高さ24px以上）。希望日を選べば承認、別日（a…）を選ぶと「別の日のご提案」として法人へ送り、法人の返事を待つ（期限つき）。", "Nút chọn có kích thước nhấn được cả nhãn (vùng nhấn cao từ 24px). Chọn ngày mong muốn là duyệt; chọn ngày khác (a…) là gửi 「別の日のご提案」 cho công ty và chờ trả lời (có hạn)."], err=["E02"]),
    F("21.8", "別日を選択", "Chọn ngày khác", "[data-m=ChangeRequestProcess] .es-section-title::別日を選択", "table", detail=["今の納品日と同じサイクルの同じ前半（A・B週）／後半（C・D週）から出した別日の表。見方は 21.6 と同じ。", "Bảng ngày khác lấy từ cùng nửa đầu (tuần A・B) / nửa sau (tuần C・D) của cùng chu kỳ với ngày giao hiện tại. Cách xem giống 21.6."]),
    F("21.9", "理由（法人に表示）", "Lý do (hiển thị cho công ty)", "[data-m=ChangeRequestProcess] .es-field::理由", "textarea", "input", req="条件付き",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["11/19 は出荷件数が上限を超えるため、11/20 をご提案します", "Lý do hiển thị cho công ty (bắt buộc khi đề xuất ngày khác hoặc từ chối)"],
      valid=["別日の提案・否認では必須。承認では任意。500文字以内・絵文字は不可。", "Bắt buộc khi đề xuất ngày khác・từ chối. Tùy chọn khi duyệt. Tối đa 500 ký tự, không emoji."], cond=["別日の提案・否認のとき必須", "Bắt buộc khi đề xuất ngày khác hoặc từ chối"], detail=["ラベル「理由（別日の提案・否認では必須。法人に表示）」。", "Nhãn 「理由（別日の提案・否認では必須。法人に表示）」."], err=["E01", "E04", "E13"], demo_ok=H_MULTI),
    F("21.10", "否認する", "Từ chối", "[data-m=ChangeRequestProcess] .es-dialog__foot button::否認する", "button", "click", err=["S133", "E01", "E30", "E32"], detail=["理由をチェックして否認し、S133「変更申請 {申請番号} を否認しました。」。理由は法人に表示される。", "Kiểm tra lý do rồi từ chối, hiện S133 「変更申請 {申請番号} を否認しました。」. Lý do được hiển thị cho công ty."], demo_ok=H_TOAST),
    F("21.11", "選択した日で承認", "Duyệt theo ngày đã chọn", "[data-m=ChangeRequestProcess] .es-dialog__foot button::選択した日で承認", "button", "click", err=["S133", "E01", "E30", "E32"],
      detail=["希望日なら承認して S133「変更申請 {申請番号} を承認しました。」、別日なら S133「{日}を法人へ提案しました。」（法人の返事を待つ）。承認したらスケジュールの月表示へ移る。", "Ngày mong muốn thì duyệt và hiện S133 「変更申請 {申請番号} を承認しました。」; ngày khác thì S133 「{日}を法人へ提案しました。」 (chờ công ty trả lời). Duyệt xong sang hiển thị tháng của スケジュール."], demo_ok=H_TOAST),
]
CR_ERR = [
    F("21.9", "理由（エラー）", "Lý do (lỗi)", "[data-m=ChangeRequestProcess] .es-field::理由", "textarea", "input", req="条件付き", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["（空）", "Để trống rồi nhấn 「否認する」 hoặc chọn ngày khác và nhấn 「選択した日で承認」 thì hiện lỗi bắt buộc"],
      valid=["別日・否認で空なら赤枠と E01。", "Chọn ngày khác・từ chối mà trống thì viền đỏ và E01."], detail=["理由が必須の操作で空のときのチェックの結果。", "Kết quả kiểm tra khi thao tác bắt buộc lý do mà để trống."], err=["E01"]),
]
Q02_ITEMS = [
    F("22", "入力中のモーダルを閉じるときの確認", "Xác nhận khi đóng modal đang nhập", ".ops-delivery ~ .ov .modal, .ov .modal", "modal", "show", err=["Q02"], pattern="P-FORM",
      detail=["取消・複製・代理登録・対応を決める・変更申請の確認で、入力したあとに Esc・×・キャンセル・背景のクリックで閉じようとしたとき出す確認（Q02「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」）。何も入力していなければ出さずに閉じる（hong 2026-10-07 Q8＝A）。", "Xác nhận hiện khi đã nhập rồi đóng bằng Esc・×・キャンセル・bấm nền ở các modal 取消・複製・代理登録・対応を決める・確認đơn xin đổi (Q02 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」). Chưa nhập gì thì đóng luôn không hỏi (hong 2026-10-07 Q8 = A)."],
      demo_ok=H_Q02),
    F("22.1", "キャンセル", "Hủy bỏ", ".ov .modal button::キャンセル", "button", "click", detail=["確認を閉じて、モーダルの入力に戻る。", "Đóng xác nhận và quay lại phần nhập của modal."]),
    F("22.2", "破棄", "Hủy bỏ nội dung", ".ov .modal button::破棄", "button", "click", detail=["入力を捨ててモーダルを閉じる。", "Bỏ nội dung đã nhập và đóng modal."]),
]


# ================================================================ AW_DLVR_003 編集
E_HEAD = [
    F("1", "ヘッダー", "Đầu trang", ".es-pagehead", "area", pattern="P-FORM",
      detail=["見出し（パンくず・画面名＋配送No・状態の帯・キャンセル・保存）は画面の上に固定し、スクロールしても保存を押せる（台帳 F）。編集できる状態は 納品済・中止・取消 以外（配送_08 §15-13）。権限（更新）がなければこの画面を開けない（サイドメニューの枠が止める）。", "Phần đầu (breadcrumb・tên màn hình + 配送No・dải trạng thái・キャンセル・保存) cố định ở trên cùng để cuộn vẫn bấm được 保存 (台帳 F). Trạng thái sửa được: trừ 納品済・中止・取消 (配送_08 §15-13). Không có quyền (更新) thì không mở được màn này (khung menu chặn)."],
      demo_ok=["コードの編集は 予定・出荷待 だけ（H14）", "Màn sửa trong code chỉ cho 予定・出荷待 (H14)"]),
    F("1.1", "パンくず", "Breadcrumb", ".es-breadcrumb", "label", detail=["「配送管理 / 出荷・配送管理 / 出荷・配送データ編集」。「出荷・配送管理」は一覧へのリンク。", "「配送管理 / 出荷・配送管理 / 出荷・配送データ編集」. 「出荷・配送管理」 là link về danh sách."]),
    F("1.2", "画面名・配送No", "Tên màn hình・配送No", ".es-pagehead__title", "label", detail=["「出荷・配送データ編集 DL-YYMMDD-NNNN」。", "「出荷・配送データ編集 DL-YYMMDD-NNNN」."]),
    F("1.3", "状態の帯", "Dải trạng thái", ".es-pagehead .stat", "label", pattern="P-STATUS-COLORS", detail=["詳細と同じ（拠点名・温度帯・状態・段階・トラブル・変更申請・親）。", "Giống màn chi tiết (tên chi nhánh・nhóm nhiệt độ・trạng thái・giai đoạn・sự cố・đơn xin đổi・chuyến cha)."]),
    F("1.4", "キャンセル", "Hủy bỏ", ".es-pagehead__actions button::キャンセル", "button", "click", err=["Q02"], pattern="P-FORM",
      detail=["詳細（AW_DLVR_002）へ戻る。入力を変えたあとは Q02（編集中の内容は保存されません）を出す。変えていなければ確認なしで戻る。", "Về màn chi tiết (AW_DLVR_002). Sau khi đã đổi nội dung thì hiện Q02 (nội dung đang sửa sẽ không được lưu). Chưa đổi thì về luôn không hỏi."]),
    F("1.5", "保存", "Lưu", ".es-pagehead__actions button::保存", "button", "click", pattern="P-FORM", err=["S01", "E01", "E30", "E31", "E32", "I02"],
      detail=["すべての項目をまとめてチェックし（変更理由が必須）、通れば保存して S01「保存しました。」。詳細へ戻る。日付を変えたときは出荷日も一緒に動き、変更履歴に残る。出荷指示を送信済なら新しい版（rev＋1）にして、変更した行の CSV を出して THOMAS に登録する手動の連携になる（Q4＝B）。締切後の日付変更は法人へメール（お届け日の変更のお知らせ）。ほかの人が開いていれば I02、あとから保存した方は E31。保存できなければ E30。",
              "Kiểm tra tất cả các mục cùng lúc (bắt buộc lý do thay đổi), hợp lệ thì lưu và hiện S01 「保存しました。」. Quay về màn chi tiết. Khi đổi ngày thì ngày xuất cũng dịch theo và ghi vào 変更履歴. Nếu đã gửi chỉ thị xuất kho thì tạo bản mới (rev+1), xuất CSV các dòng đã đổi và đăng ký vào THOMAS theo cách thủ công (Q4 = B). Đổi ngày sau hạn chốt thì gửi email cho công ty (thông báo đổi ngày giao). Có người khác đang mở thì I02, người lưu sau bị E31. Không lưu được thì E30."],
      demo_ok=["コードの成功のトーストは長い文「配送データを保存しました（日付を変えたときは出荷日も一緒に動き、変更履歴に残ります）」。S01 に揃える（補足は画面の説明に）", "Toast thành công trong code là câu dài 「配送データを保存しました（…）」. Đồng nhất về S01 (phần chú thích đưa vào mô tả màn hình)"]),
]
E_RO = [
    F("2", "配送概要（読むだけの項目）", "Tổng quan (các mục chỉ xem)", ".es-card .es-section-title::配送概要", "area", detail=["詳細と同じ項目。直せるのは 3（日付の変更）と 4（この配送だけ変更する）だけ。", "Các mục giống màn chi tiết. Chỉ sửa được 3 (đổi ngày) và 4 (chỉ đổi giao hàng này)."]),
    F("2.1", "配送No", "Mã giao hàng (配送No)", ".es-field::配送No", "label", detail=["読むだけ。補足「作ったときの出荷予定日で付けた番号（日付を変えても変わらない）」。", "Chỉ xem. Chú thích 「作ったときの出荷予定日で付けた番号（日付を変えても変わらない）」."]),
    F("2.2", "出荷日（実績）", "Ngày xuất kho (thực tế)", ".es-field::出荷日（実績）", "label", detail=["読むだけ。", "Chỉ xem."]),
    F("2.3", "荷物名", "Tên hàng", ".es-field::荷物名", "label", detail=["読むだけ。", "Chỉ xem."]),
    F("2.4", "対象サイクル・納品スロット", "Chu kỳ・khung giao", ".es-field::対象サイクル", "label", detail=["読むだけ。", "Chỉ xem."]),
    F("2.5", "納品日", "Ngày giao", ".es-field::納品日", "label", detail=["グレーの欄（編集中は触れない）。補足「下の「日付の変更」で選びます（出荷日の前日まで）」。日付を変えられるのは 3 の表だけ。", "Ô xám (không chạm vào khi đang sửa). Chú thích 「下の「日付の変更」で選びます（出荷日の前日まで）」. Chỉ đổi ngày được ở bảng mục 3."], demo_ok=["補足の「出荷日の前日まで」は決定の規則（スケジュールの移動と同じ）に合わせて直す", "Chú thích 「出荷日の前日まで」 sửa cho khớp quy tắc đã quyết (giống 移動 ở スケジュール)"]),
    F("2.6", "出荷日（ピッキング日）", "Ngày xuất kho (ngày picking)", ".es-field::出荷日（ピッキング日）", "label", detail=["グレーの欄。補足にリードタイム。日付を変えるとリードタイムを保って一緒に動く。", "Ô xám. Chú thích ghi lead time. Khi đổi ngày thì dịch theo, giữ nguyên lead time."]),
    F("2.7", "配達時間帯", "Khung giờ giao", ".es-field::配達時間帯", "label",
      detail=["読み取りのみ（拠点の受取時間帯のスナップショット）。ここでは直せない。直すときは拠点マスタで直す（hong 2026-10-07 Q7＝B）。", "Chỉ đọc (snapshot khung giờ nhận hàng của chi nhánh). Không sửa được ở đây. Muốn sửa thì sửa ở master 拠点 (hong 2026-10-07 Q7 = B)."],
      demo_ok=["コードは入力欄（1つの文字欄）で、保存すると受取時間帯を書き換える（エラーはトーストだけ）。読み取りのみに直す（Q7＝B）", "Code là ô nhập (1 ô chữ) và lưu thì ghi đè khung giờ nhận hàng (lỗi chỉ ở toast). Sửa thành chỉ đọc (Q7 = B)"]),
    F("2.8", "到着予定（ドライバー共有）", "Dự kiến đến (tài xế chia sẻ)", ".es-field::到着予定", "label", detail=["読むだけ。", "Chỉ xem."]),
    F("2.9", "配送区分・便種別", "Phân loại giao hàng・loại chuyến", ".es-field::配送区分", "label", detail=["読むだけ（配送区分＝温度帯、便種別＝ES配送便／COOL便／資材便／サンプル）。", "Chỉ xem (配送区分 = nhóm nhiệt độ, 便種別 = ES配送便 / COOL便 / 資材便 / サンプル)."]),
    F("2.10", "出荷指示", "Chỉ thị xuất kho", ".es-field::出荷指示", "label", detail=["読むだけ（未送信／送信済 rev n／対象外）。", "Chỉ xem (未送信 / 送信済 rev n / 対象外)."]),
    F("2.11", "契約ID・子契約ID・オーダーID", "ID hợp đồng・ID hợp đồng con・ID đơn", ".es-field::子契約ID", "label", detail=["読むだけ（リンク）。", "Chỉ xem (link)."]),
]
E_DATE = [
    F("3", "日付の変更", "Đổi ngày", ".es-section-title::日付の変更", "area", cond=["出荷の前日までの配送（出荷待・予定）のとき", "Với giao hàng còn trước ngày xuất kho (出荷待・予定)"], pattern="P-FORM", err=["E160", "E161", "E162", "E163", "W130", "W131", "W132"],
      detail=["納品日を変える欄。規則はスケジュールの移動（AW_SCHD）と同じ（hong 2026-10-07 D6）：出荷日の前日まで・資材便は不可（E160）・出荷の前の配送でない／前日を過ぎた（E161）・本発注の決まり（E162）・出荷不可日／休日は選べない（E163）・警告は止めない（W130〜W132）。詳しくは：本発注の前は何便でも・本発注の後は1便だけ（理由必須・同じ半分の中）・出荷指示を送信済なら新しい版 rev＋1・法人へ通知（hong 2026-10-07 Q3＝B）。出荷日はリードタイムを保って一緒に動く。同じ拠点・同じ納品日の冷凍・冷蔵があれば一緒に動く。",
              "Ô đổi ngày giao. Quy tắc giống 移動 ở スケジュール (AW_SCHD) (hong 2026-10-07 D6): tới ngày trước xuất kho・chuyến 資材 không được (E160)・không phải giao hàng trước xuất / quá ngày trước xuất (E161)・quy tắc 本発注 (E162)・ngày không xuất được / ngày nghỉ không chọn (E163)・cảnh báo không chặn (W130〜W132). Chi tiết: trước 本発注 thì được nhiều chuyến; sau 本発注 chỉ 1 chuyến (bắt buộc lý do・trong cùng nửa chu kỳ); nếu đã gửi chỉ thị xuất kho thì bản mới rev+1; thông báo cho công ty (hong 2026-10-07 Q3 = B). Ngày xuất dịch theo, giữ lead time. Nếu cùng chi nhánh・cùng ngày giao có cả đông lạnh và lạnh thì dịch cùng nhau."],
      demo_ok=["コードの境は「オーダー締切」（締切後・出荷日の前日まで・同じ前半／後半・1件ずつ）で、保存しても出荷指示の版（rev）を上げない（H20）。スケジュールの移動と同じ domain.move を使う", "Mốc trong code là 「hạn chốt đơn」 (sau chốt・tới ngày trước xuất・cùng nửa đầu/sau・từng chuyến) và lưu cũng không tăng bản (rev) chỉ thị xuất kho (H20). Dùng cùng domain.move với 移動 ở スケジュール"]),
    F("3.1", "日付の変更の説明", "Giải thích đổi ngày", ".note::出荷日の前日", "label", err=["E163", "W130", "W131", "W132"], detail=["「出荷日の前日（{日}）まで、同じサイクルの同じ前半（A・B週）の日にだけ変えられます。…赤字＝出荷不可・納品不可・件数の上限（300件）超え。出荷不可・納品不可の日は選べません。…」。件数の上限は【仮】全倉庫300件（運営が直せる値。台帳 F）。1日の件数には営業サンプルの配送も数える（種類「サンプル」。hong 2026-10-08・受付簿 #451）。", "「出荷日の前日（{日}）まで、同じサイクルの同じ前半（A・B週）の日にだけ変えられます。…」 Chữ đỏ = không xuất được・không giao được・vượt giới hạn số lượng (300). Ngày không xuất・không giao được thì không chọn. Giới hạn số lượng là 300 cho mọi kho (tạm; 運営 sửa được giá trị; 台帳 F). Số lượng trong ngày cũng tính cả giao hàng của mẫu kinh doanh (loại 「サンプル」; hong 2026-10-08・sổ tiếp nhận #451)."],
      demo_ok=["説明文はスケジュールの移動の規則に合わせて書き直す（Q3＝B）", "Viết lại câu giải thích cho khớp quy tắc 移動 ở スケジュール (Q3 = B)"]),
    F("3.2", "日付の候補の表", "Bảng ngày ứng viên", ".es-table.compact", "table", detail=["列：選択（○）・納品日・納品日の枠（10月サイクル など）・出荷日・出荷日の枠・リードタイム・出荷日の件数（右寄せ）。選んだ行が強調され、出荷不可・納品不可の行は灰で選べない。", "Cột: chọn (○)・ngày giao・khung ngày giao (ví dụ chu kỳ tháng 10)・ngày xuất・khung ngày xuất・lead time・số lượng ngày xuất (căn phải). Dòng đã chọn được nhấn mạnh; dòng không xuất・không giao được thì xám, không chọn."]),
    F("3.3", "新しい納品日", "Ngày giao mới", ".es-table.compact label.es-radio", "radio", "click", req="－",
      len=["選択（候補のどれか1つ）", "Chọn (1 trong các ứng viên)"], init=["いまの納品日（変更なし）", "Ngày giao hiện tại (không đổi)"], ex=["2026-10-14", "Chọn một ngày ứng viên khác ngày hiện tại thì ngày giao đổi"],
      valid=["出荷不可・納品不可の日は選べない。変更したら 4.4 の変更理由が必須。", "Không chọn được ngày không xuất・không giao được. Đã đổi thì 4.4 (lý do thay đổi) bắt buộc."],
      err=["E160", "E161", "E162", "E163", "W130", "W131", "W132"],
      detail=["選ぶと納品日が変わる（保存で確定）。本発注より前の配送（予定）も、編集から1便ずつ同じ規則で日付を変えられる（hong 2026-10-07 D7。何便もまとめて動かすときはスケジュールの移動）。法人へ「お届け日の変更のお知らせ」メールを送る（締切後の変更）。", "Chọn thì ngày giao đổi (xác nhận khi lưu). Giao hàng trước 本発注 (予定) cũng đổi được ngày từ màn sửa, từng chuyến một, cùng quy tắc (hong 2026-10-07 D7; muốn dịch nhiều chuyến cùng lúc thì dùng 移動 ở スケジュール). Gửi email 「お届け日の変更のお知らせ」 cho công ty (đổi sau hạn chốt)."],),
]
E_CHANGE = [
    F("4", "この配送だけ変更する", "Chỉ đổi giao hàng này", ".es-section-title::この配送だけ変更する", "area", pattern="P-FORM",
      detail=["この配送データだけの変更（配送会社・配送スタッフ・納品先の住所）。理由は必須で変更履歴に残る。出荷指示を送信済のあとも、配送会社（2次）と住所は1配送だけ直せる（理由必須。住所は新しい版 rev＋1・送り状は無効にして再発行。配送_08 §15-13・配送_12 §15.13〜15.14）。今月以降すべてを変える場合は、拠点・契約情報の配送設定で変更する。",
              "Chỉ đổi cho dữ liệu giao hàng này (công ty vận chuyển・nhân viên giao hàng・địa chỉ nơi giao). Bắt buộc lý do và lưu vào 変更履歴. Sau khi đã gửi chỉ thị xuất kho vẫn sửa được công ty vận chuyển (chặng 2) và địa chỉ cho 1 giao hàng (bắt buộc lý do; địa chỉ thì bản mới rev+1, phiếu gửi vô hiệu rồi phát hành lại; 配送_08 §15-13・配送_12 §15.13〜15.14). Muốn đổi từ tháng này trở đi thì đổi ở cài đặt giao hàng của 拠点・契約情報."],
      demo_ok=["コードは配送会社・住所を変えて保存するとエラー「配送会社の変更は…子契約で」「納品先の住所は、拠点の情報で」を返す（H14）。決定では1配送だけ直せる", "Code trả lỗi 「配送会社の変更は…子契約で」「納品先の住所は、拠点の情報で」 khi lưu có đổi công ty vận chuyển・địa chỉ (H14). Quyết định: sửa được cho 1 giao hàng"]),
    F("4.1", "配送会社（2次）", "Công ty vận chuyển (chặng 2)", ".es-field::配送会社（2次）", "select", "select", req="－",
      len=["選択（みどり便／栄成ロジ／佐川急便／ヤマト運輸／自社便）", "Chọn (Midori / Eisei Logi / Sagawa / Yamato / tự vận hành)"], init=["いまの配送会社（最終区間）", "Công ty vận chuyển hiện tại (chặng cuối)"], ex=["栄成ロジ", "Công ty vận chuyển của chặng 2 cho riêng giao hàng này"],
      detail=["補足「変更すると出荷指示を再送します」（いまの再送は手動：変更した行の CSV を出し、運営が THOMAS に登録して「送信済にする」。Q4＝B）。変更した理由は 4.4。", "Chú thích 「変更すると出荷指示を再送します」 (hiện gửi lại là thủ công: xuất CSV dòng đã đổi, 運営 đăng ký vào THOMAS rồi bấm 「送信済にする」; Q4 = B). Lý do thay đổi ở 4.4."],
      demo_ok=["選択肢は固定の5社（コード）。委託配送先マスタから作る", "Lựa chọn là 5 công ty cố định (code). Lấy từ master công ty vận chuyển ủy thác"]),
    F("4.2", "配送スタッフ", "Nhân viên giao hàng", ".es-field::配送スタッフ", "select", "select", req="－",
      len=["選択（区間ごとに、その区間の会社のドライバー）", "Chọn (theo từng chặng, tài xế của công ty ở chặng đó)"], init=["いまの配送スタッフ", "Nhân viên giao hàng hiện tại"], ex=["山口 健", "Tài xế gán cho chặng ủy thác・tự vận hành"],
      detail=["区間ごとに割り当てる（配送_08 §15-6・配送_06 §12-1）。補足「委託・自社が運ぶ区間は1次でも割り当てます」。運送会社の区間には割り当てない。", "Gán theo từng chặng (配送_08 §15-6・配送_06 §12-1). Chú thích 「委託・自社が運ぶ区間は1次でも割り当てます」. Không gán cho chặng của hãng vận tải đường dài."],
      demo_ok=["コードは3名の固定の選択肢1つで「最後の区間」にだけ保存する（ラベルは「1次・栄成ロジ」の固定）。区間ごとの割当にする（H13）", "Code có 1 ô với 3 người cố định và chỉ lưu vào 「chặng cuối」 (nhãn 「1次・栄成ロジ」 cố định). Làm gán theo từng chặng (H13)"]),
    F("4.3", "納品先の住所", "Địa chỉ nơi giao", ".es-field::納品先の住所", "text", "input", req="－",
      len="文字列 255", init=["いまの納品先の住所", "Địa chỉ nơi giao hiện tại"], ex=["東京都港区芝公園1-2-3 〇〇ビル5F", "Địa chỉ giao hàng, tối đa 255 ký tự"],
      valid=["255文字以内。前後の空白を取る。全角の数字・英字・ハイフンは半角に直す。絵文字は不可。", "Tối đa 255 ký tự. Cắt khoảng trắng đầu cuối. Số・chữ・gạch nối toàn góc đổi sang nửa góc. Không emoji."],
      detail=["補足「変更すると送り状を取り直します（新しい版で再送）」。この配送だけの変更（拠点マスタは変わらない）。", "Chú thích 「変更すると送り状を取り直します（新しい版で再送）」. Chỉ đổi cho giao hàng này (master chi nhánh không đổi)."], err=["E04", "E13"], demo_ok=H_MAXLEN),
    F("4.4", "変更理由", "Lý do thay đổi", ".es-field::変更理由", "textarea", "input", req="○",
      len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["拠点の依頼で納品日を 10/22 に変更", "Lý do đổi (nhiều dòng, tối đa 500 ký tự); lưu vào 変更履歴"],
      valid=["必須（日付・配送会社・配送スタッフ・住所のどれを変えるときも）。前後の空白を取る。500文字以内・絵文字は不可。", "Bắt buộc (khi đổi ngày・công ty vận chuyển・nhân viên giao hàng・địa chỉ). Cắt khoảng trắng đầu cuối. Tối đa 500 ký tự, không emoji."],
      detail=["プレースホルダー「例）拠点の依頼で納品日を 10/22 に変更／受取担当者の依頼で当日のスタッフを変更」。補足「日付の変更も、この理由で変更履歴に残します」。保存で空なら E01。画面の並びは番号順（概要→日付の変更→この配送だけ変更する→タブ）にし、変更理由は初期表示（高さ900px）で見える位置に置く。保存（1.5）は画面上部に固定して常に押せるようにする。", "Placeholder 「例）拠点の依頼で納品日を 10/22 に変更／受取担当者の依頼で当日のスタッフを変更」. Chú thích 「日付の変更も、この理由で変更履歴に残します」. Lưu mà trống thì E01. Thứ tự hiển thị theo số (tổng quan → đổi ngày → chỉ đổi giao hàng này → tab); lý do thay đổi đặt ở vị trí thấy được ngay khi mở (cao 900px). Nút 保存 (1.5) cố định ở phía trên để luôn bấm được."],
      err=["E01", "E04", "E13"], demo_ok=H_MULTI),
    F("4.5", "説明", "Giải thích", ".note::今月以降すべてを変える", "label", detail=["「今月以降すべてを変える場合は、この画面ではなく拠点・契約情報の配送設定で変更してください。変更前 → 変更後と操作者は変更履歴に残ります。」", "Câu giải thích: muốn đổi từ tháng này trở đi thì đổi ở cài đặt giao hàng của 拠点・契約情報 chứ không phải màn này. Trước → sau và người thao tác được lưu trong 変更履歴."]),
]
E_REST = [
    F("5", "数量・運営メモ・メール見本・タブ", "Số lượng・ghi chú nội bộ・email mẫu・tab", ".es-tabs", "area", pattern="P-TAB",
      detail=["編集画面でも詳細と同じタブ（配送概要・配送ルート・実績・トラブル・添付資料・変更履歴）と、配送概要の数量の表・運営メモ・メール見本が出る（AW_DLVR_002 No.3・5・7・8）。入力中にタブを変えても入力は消さない（保存は画面全体で1回）。運営メモの追加は別操作で即保存する（編集中の内容は巻き込まない）。編集中の未保存の内容があるあいだ、「メモを追加」「送り状番号の追加」「資料を追加」など即保存の操作は非活性にする（P-MODAL-SAVE。hong 2026-10-07 D8）。",
              "Màn sửa cũng hiện các tab giống màn chi tiết (配送概要・配送ルート・実績・トラブル・添付資料・変更履歴) và bảng số lượng・ghi chú nội bộ・email mẫu của 配送概要 (AW_DLVR_002 No.3・5・7・8). Đổi tab khi đang nhập không mất nội dung (lưu một lần cho cả màn hình). Thêm ghi chú nội bộ là thao tác riêng lưu ngay (không kèm nội dung đang sửa). Khi còn nội dung chưa lưu, các thao tác lưu ngay như 「メモを追加」「送り状番号の追加」「資料を追加」 bị vô hiệu (P-MODAL-SAVE; hong 2026-10-07 D8)."],
      demo_ok=["コードは編集中でも即保存の操作を押せる。未保存の内容があるあいだは非活性にする", "Code vẫn bấm được thao tác lưu ngay khi đang sửa. Vô hiệu khi còn nội dung chưa lưu"]),
]
E_ERR = [
    F("4.4", "変更理由（エラー）", "Lý do thay đổi (lỗi)", ".es-field::変更理由", "textarea", "input", req="○", len=["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], init=["空", "Trống"], ex=["（空）", "Để trống rồi nhấn 「保存」 thì hiện lỗi bắt buộc"],
      valid=["必須。空なら赤枠と E01 を項目の下に出す。", "Bắt buộc. Trống thì viền đỏ và E01 dưới ô."], detail=["「保存」を押したときのチェックの結果。見出しの下に「保存できません（1件）。赤い項目を確認してください」を1行出す（P-FORM）。", "Kết quả kiểm tra khi nhấn 「保存」. Dưới phần đầu hiện 1 dòng 「保存できません（1件）。赤い項目を確認してください」 (P-FORM)."], err=["E01"],
      demo_ok=["保存できないときの1行の案内（保存できません（n件）…）が出ない。出す（P-FORM）", "Chưa hiện dòng báo 「保存できません（n件）…」 khi không lưu được. Thêm vào (P-FORM)"]),
]
E_LEAVE = [
    F("6", "離脱の確認（Q02）", "Xác nhận khi rời đi (Q02)", ".ov .modal", "modal", "show", err=["Q02"], pattern="P-FORM",
      detail=["入力を変えたあと キャンセル・ほかの画面への移動・ブラウザを閉じる／再読み込み をしたときの確認（Q02「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」）。ボタンは「キャンセル」「破棄」。破棄すると詳細へ戻る。", "Xác nhận khi đã đổi nội dung rồi bấm キャンセル・chuyển sang màn khác・đóng trình duyệt / tải lại (Q02 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」). Nút 「キャンセル」「破棄」. Hủy bỏ thì về màn chi tiết."]),
    F("6.1", "キャンセル", "Hủy bỏ", ".ov .modal button::キャンセル", "button", "click", detail=["確認を閉じて、編集に戻る。", "Đóng xác nhận và quay lại sửa."]),
    F("6.2", "破棄", "Hủy bỏ nội dung", ".ov .modal button::破棄", "button", "click", detail=["入力を捨てて詳細へ戻る。", "Bỏ nội dung đã nhập và về màn chi tiết."]),
]
E_LOCKED = [
    F("7", "編集できない状態で開いたとき", "Khi mở ở trạng thái không sửa được", ".es-pagehead", "area", "show", err=["I03", "E169"],
      detail=["納品済・中止・取消 の配送の /edit を直接開いたとき：編集画面は開かず、詳細（AW_DLVR_002）へ戻して I03「{理由}（見るだけ）」を出す（例：納品済（見るだけ））。保存の時点で状態が変わっていたときだけ E169（hong 2026-10-07 D9）。", "Khi mở trực tiếp /edit của giao hàng 納品済・中止・取消: không mở màn sửa mà quay về màn chi tiết (AW_DLVR_002) và hiện I03 「{理由}（見るだけ）」 (ví dụ: 納品済（見るだけ）). E169 chỉ khi trạng thái đã đổi vào lúc lưu (hong 2026-10-07 D9)."],
      demo_ok=["コードは編集の画面をそのまま出し、保存で E169。詳細へ戻して I03 を出す", "Code vẫn hiện màn sửa và E169 khi lưu. Chuyển về chi tiết và hiện I03"],),
]


# ================================================================ 状態（VIEWS）
# 見本：A＝DL-261012-0011（大阪支店・出荷待）／B＝DL-260928-0014（大阪支店・納品済）／E＝DL-261207-0001（変更申請 申請中）／G＝DL-261006-0103（資材便）／F＝川崎工場のトラブル未解決の便（一覧のトラブル条件から開く）
A_URL = "/ops/delivery/list/DL-261012-0011"
B_URL = "/ops/delivery/list/DL-260928-0014"
E_URL = "/ops/delivery/list/DL-261207-0001"
LIST_URL = "/ops/delivery/list"
# 一覧のトラブル条件で絞って、先頭の行（F）の詳細を開く
GO_F = ("setv(q('input[placeholder=\"開始日（yyyy-mm-dd）\"]'),'2026-09-01');await sleep(200);setv(q('select[aria-label=\"トラブル\"]'),'トラブル未解決あり');await sleep(200);" + SEARCH +
        "q('.es-table tbody tr a').click();await sleep(1500);")
MOD = lambda code, label: "[...document.querySelectorAll('[data-m=%s] .es-dialog__foot button')].find(b=>b.textContent.includes('%s')).click();await sleep(700);" % (code, label)
RADIO = lambda code, text: "[...document.querySelectorAll('[data-m=%s] label.es-radio')].find(l=>l.textContent.includes('%s')).click();await sleep(300);" % (code, text)

V_DETAIL = [
    V("007", "AW_DLVR_002", "配送概要（出荷待・運営メモ・メール見本）", "Tổng quan (出荷待・ghi chú nội bộ・email mẫu)", A_URL + "?tab=ov", D_OV_ALL,
      "setv(q('textarea[aria-label=運営メモ]'),'次回から、到着の10分前に受付の森様へ電話する');await sleep(200);btn('メモを追加').click();await sleep(800);", wait=1000,
      note=["見本 A（DL-261012-0011・大阪支店・出荷待）。コードは締切済サイクルの出荷待に「ロックの帯」を出す（決定では出荷指示の初回送信成功のあとだけ）。", "Mẫu A (DL-261012-0011・大阪支店・出荷待). Code hiện 「dải khóa」 với 出荷待 của chu kỳ đã chốt (quyết định: chỉ sau khi gửi chỉ thị xuất kho thành công lần đầu)."]),
    V("008", "AW_DLVR_002", "配送概要（変更申請 申請中の帯）", "Tổng quan (khung đơn xin đổi 申請中)", E_URL + "?tab=ov", _hd("1.6") + D_CR_BAND, "", wait=1000,
      note=["見本 E（DL-261207-0001・変更申請 DD-20261005-0096 申請中）。D（DL-261109-0001）は「別の日のご提案」＝提案中（バッジ青）。", "Mẫu E (DL-261207-0001・đơn DD-20261005-0096 申請中). D (DL-261109-0001) là 「別の日のご提案」 = 提案中 (badge xanh dương)."]),
    V("009", "AW_DLVR_002", "配送概要（予定・数量は予定）", "Tổng quan (予定・số lượng dự kiến)", E_URL + "?tab=ov",
      [F("5", "数量の表（予定）", "Bảng số lượng (予定)", ".es-card .es-table", "table", detail=["見出し「数量（予定・オーダー締切で確定）」。確定数量は「—」、確定のしかたは「法人のオーダー（締切前）」。", "Tiêu đề 「数量（予定・オーダー締切で確定）」. Số lượng chốt 「—」, cách chốt 「法人のオーダー（締切前）」."]),
       F("3.1", "トラブルのタブ（出ない）", "Tab sự cố (không hiện)", ".es-tabs", "tab", "view", detail=["予定・出荷待は出荷前なので「トラブル」タブを出さない。出荷済以降で出す。", "予定・出荷待 là trước xuất kho nên không hiện tab 「トラブル」; từ 出荷済 mới hiện."])], "", wait=800,
      note=["E は変更申請の帯と同じ配送。数量・タブだけを見る状態。", "E là giao hàng có khung đơn xin đổi. Trạng thái này chỉ xem số lượng・tab."]),
    V("010", "AW_DLVR_002", "配送概要（資材便：資材の注文）", "Tổng quan (chuyến vật tư: đơn vật tư)", "/ops/delivery/list/DL-261006-0103?tab=ov",
      [F("4.15", "資材の注文", "Đơn vật tư", ".es-field::資材の注文", "label", detail=["資材の便では「オーダーID」の代わりに「資材の注文」（MO-2610-0013 など）を出す。補足は資材の注文の明細。", "Chuyến vật tư hiện 「資材の注文」 (ví dụ MO-2610-0013) thay cho 「オーダーID」. Chú thích là chi tiết đơn vật tư."]),
       F("4.12", "出荷指示（対象外）", "Chỉ thị xuất kho (ngoài đối tượng)", ".es-field::出荷指示", "label", detail=["「対象外」。資材は ES事務所から出荷する（THOMAS 連携なし）。", "「対象外」. Vật tư xuất từ văn phòng ES (không liên kết THOMAS)."]),
       F("5", "数量の表（資材）", "Bảng số lượng (vật tư)", ".es-card .es-table", "table", detail=["資材の注文の明細（資材名・資材ID・数量）。確定のしかた＝「資材の注文」。", "Chi tiết đơn vật tư (tên・ID vật tư・số lượng). Cách chốt = 「資材の注文」."])], "", wait=900,
      note=["見本 G（資材の注文 MO-2610-0013 → DL-261006-0103）。", "Mẫu G (đơn vật tư MO-2610-0013 → DL-261006-0103)."]),
    V("011", "AW_DLVR_002", "配送概要（処理済みの変更申請の表）", "Tổng quan (bảng đơn xin đổi đã xử lý)", "/ops/delivery/list/DL-261221-0001?tab=ov", D_CR_PAST, "", wait=900,
      note=["DL-261221-0001（DD-20260930-0001＝否認・予定）。", "DL-261221-0001 (DD-20260930-0001 = 否認・予定)."]),
    V("012", "AW_DLVR_002", "配送ルート（地点表・ES採番の送り状）", "Tuyến giao hàng (bảng địa điểm・phiếu gửi do ES cấp)", A_URL + "?tab=route", [x for x in D_ROUTE if x["no"] != "9.11"], "", wait=900,
      note=["見本 A。1次が委託・自社の便なので送り状は ES が採番（DL-…-01）。", "Mẫu A. Chặng 1 là ủy thác・tự vận hành nên phiếu gửi do ES cấp (DL-…-01)."]),
    V("013", "AW_DLVR_002", "配送ルート（路線便：送り状番号の追加・訂正・無効）", "Tuyến giao hàng (chuyến đường dài: thêm・sửa・vô hiệu số phiếu gửi)", LIST_URL, D_TRACK + [x for x in D_ROUTE if x["no"] == "9.11"],
      "setv(q('select[aria-label=\"委託配送会社\"]'),'ヤマト運輸');await sleep(200);" + SEARCH + "q('.es-table tbody tr a').click();await sleep(1500);tab('配送ルート');await sleep(500);", wait=900,
      note=["1次が路線（ヤマト運輸）の便。一覧の「委託配送会社＝ヤマト運輸」で絞った先頭の行の「配送ルート」タブ。", "Chuyến có chặng 1 là đường dài (ヤマト運輸). Tab 「配送ルート」 của dòng đầu khi lọc 「委託配送会社＝ヤマト運輸」 ở danh sách."]),
    V("014", "AW_DLVR_002", "実績（納品済：手順・検品差異・在庫・区間受取・駐車料金）", "Kết quả (納品済: các bước・chênh lệch kiểm hàng・tồn kho・nhận theo chặng・phí đỗ xe)", "/ops/delivery/list/DL-260914-0001?tab=res", D_RESULT + _hd("1.10"), "", wait=1000,
      note=["見本 C（DL-260914-0001・大阪支店・一部納品済。差異あり・子 DL-260914-0001-1 あり）。B（DL-260928-0014）には検品の差異と後続の配送がない。", "Mẫu C (DL-260914-0001・大阪支店・一部納品済; có chênh lệch, có chuyến con DL-260914-0001-1). B (DL-260928-0014) không có chênh lệch kiểm hàng và chuyến giao tiếp theo."]),
    V("015", "AW_DLVR_002", "実績（まだ納品実績がない）", "Kết quả (chưa có kết quả giao)", A_URL + "?tab=res", D_RESULT_EMPTY, "", wait=800),
    V("016", "AW_DLVR_002", "トラブル（未解決：一覧＋「対応を決める」＋自動子）", "Sự cố (chưa giải quyết: danh sách + 「対応を決める」 + chuyến con tự động)", LIST_URL, _hd("1.5", "1.11") + D_TROUBLE_BAND + D_TROUBLE,
      GO_F + "tab('トラブル');await sleep(500);", wait=900,
      note=["見本 F（DL-260918-0003・川崎工場・遅延の報告が未解決）。一覧は期間の開始日を 2026-09-01 にして「トラブル未解決あり」で絞った先頭の行。", "Mẫu F (DL-260918-0003・川崎工場・báo cáo trễ chưa giải quyết). Dòng đầu ở danh sách khi đặt ngày bắt đầu kỳ là 2026-09-01 và lọc 「トラブル未解決あり」."]),
    V("017", "AW_DLVR_002", "トラブル（解決済：解決欄＋後続の配送）", "Sự cố (đã giải quyết: ô giải quyết + chuyến giao tiếp theo)", "/ops/delivery/list/DL-260914-0001?tab=trb", D_TROUBLE_DONE, "", wait=900,
      note=["見本 C（DL-260914-0001・大阪支店・TR-260915-0001 解決済）。B（DL-260928-0014）にはトラブルの報告がない。", "Mẫu C (DL-260914-0001・大阪支店・TR-260915-0001 đã giải quyết). B (DL-260928-0014) không có báo cáo sự cố."]),
    V("018", "AW_DLVR_002", "トラブル（報告なし）", "Sự cố (không có báo cáo)", LIST_URL, D_TROUBLE_EMPTY, "setv(q('select[aria-label=\"ステータス\"]'),'出荷済');await sleep(200);" + SEARCH + "q('.es-table tbody tr a').click();await sleep(1500);tab('トラブル');await sleep(500);", wait=900,
      note=["出荷済以降でトラブルのない配送（一覧の状態＝出荷済で絞った先頭の行）。出荷待（A）は「トラブル」タブが出ない。", "Giao hàng từ 出荷済 không có sự cố (dòng đầu khi lọc trạng thái = 出荷済 ở danh sách). 出荷待 (A) không có tab 「トラブル」."]),
    V("019", "AW_DLVR_002", "添付資料（① 地点の資料／② この配送の資料）", "Tài liệu đính kèm (① tài liệu địa điểm / ② tài liệu của giao hàng này)", B_URL + "?tab=doc", D_DOCS, "", wait=900),
    V("020", "AW_DLVR_002", "変更履歴（種類で絞り込み）", "Lịch sử thay đổi (lọc theo loại)", B_URL + "?tab=hist", D_HIST, "", wait=900,
      note=["コードは時系列の文章。決定は P-HIST の表（日時・操作者・操作・項目・変更前・変更後・理由）。", "Code là dòng văn bản theo thời gian. Quyết định: bảng P-HIST (ngày giờ・người thao tác・thao tác・mục・trước・sau・lý do)."]),
    V("021", "AW_DLVR_002", "配送データが見つからない", "Không tìm thấy dữ liệu giao hàng", "/ops/delivery/list/DL-000000-0000", D_NOTFOUND, "", wait=700),
    V("022", "AW_DLVR_002", "取消（モーダル：影響表＋理由）", "Hủy (modal: bảng ảnh hưởng + lý do)", A_URL, CANCEL_ITEMS, "btn('取消').click();await sleep(700);", wait=800,
      note=["見本 A（出荷待）→「取消」。", "Mẫu A (出荷待) → 「取消」."]),
    V("023", "AW_DLVR_002", "取消 入力エラー（理由の詳細が空）", "Hủy: lỗi nhập (chi tiết lý do trống)", A_URL, CANCEL_ERR,
      "btn('取消').click();await sleep(700);setv(q('[data-m=DeliveryCancel] input[type=text]'),'');await sleep(200);" + MOD("DeliveryCancel", "取消する"), wait=800),
    V("024", "AW_DLVR_002", "複製（モーダル：返送の初期表示）", "Nhân bản (modal: hiển thị ban đầu loại 返送)", B_URL, DUP_ITEMS, "btn('複製').click();await sleep(700);", wait=800,
      note=["見本 B（納品済）→「複製」。種類を 分納・再配送・代替便・その他 に切り替えると、説明・理由・数量の初期値が変わる。", "Mẫu B (納品済) → 「複製」. Chuyển loại 分納・再配送・代替便・その他 thì mô tả・lý do・số lượng ban đầu đổi theo."]),
    V("025", "AW_DLVR_002", "複製 入力エラー（理由の詳細・納品日が空）", "Nhân bản: lỗi nhập (chi tiết lý do・ngày giao trống)", B_URL, DUP_ERR,
      "btn('複製').click();await sleep(700);setv(q('[data-m=DeliveryDuplicate] input[type=text]'),'');{const f=[...document.querySelectorAll('[data-m=DeliveryDuplicate] .es-field')].find(x=>x.textContent.includes('納品日'));const i=f&&f.querySelector('input');if(i)setv(i,'');}await sleep(200);" + MOD("DeliveryDuplicate", "複製する"), wait=800),
    V("026", "AW_DLVR_002", "トラブルの代理登録（モーダル）", "Đăng ký sự cố thay (modal)", B_URL, REPORT_ITEMS, "btn('トラブルを代理登録').click();await sleep(700);", wait=800,
      note=["見本 B（納品済）→「トラブルを代理登録」。", "Mẫu B (納品済) → 「トラブルを代理登録」."]),
    V("027", "AW_DLVR_002", "代理登録 入力エラー（内容が空）", "Đăng ký thay: lỗi nhập (nội dung trống)", B_URL, REPORT_ERR,
      "btn('トラブルを代理登録').click();await sleep(700);{const t=[...document.querySelectorAll('[data-m=TroubleReport] input[type=text]')];setv(t[t.length-1],'');}await sleep(200);" + MOD("TroubleReport", "登録する"), wait=800),
    V("028", "AW_DLVR_002", "対応を決める ① 対応を選ぶ（6択）", "Quyết định cách xử lý ① chọn cách xử lý (6 lựa chọn)", LIST_URL, RESOLVE_ITEMS,
      GO_F + "btn('対応を決める').click();await sleep(700);", wait=800,
      note=["見本 F →「対応を決める」。", "Mẫu F → 「対応を決める」."]),
    V("029", "AW_DLVR_002", "対応を決める ② 数量・理由（一部を納品し、残りを後日送る）", "Quyết định cách xử lý ② số lượng・lý do (giao một phần, phần còn lại gửi sau)", LIST_URL, [x for x in RESOLVE_STEP2 if x["no"] != "20.15"],
      GO_F + "btn('対応を決める').click();await sleep(700);" + RADIO("TroubleResolve", "残りを後日送る") + MOD("TroubleResolve", "次へ"), wait=800),
    V("030", "AW_DLVR_002", "対応を決める ② 送り直す子＋運賃（納品ゼロで送り直す）", "Quyết định cách xử lý ② chuyến con gửi lại + cước (không giao được gì, gửi lại)", LIST_URL, [x for x in RESOLVE_STEP2 if x["no"] != "20.11"],
      GO_F + "btn('対応を決める').click();await sleep(700);" + RADIO("TroubleResolve", "納品ゼロで送り直す") + MOD("TroubleResolve", "次へ"), wait=800),
    V("031", "AW_DLVR_002", "対応を決める 入力エラー（理由が空）", "Quyết định cách xử lý: lỗi nhập (lý do trống)", LIST_URL, RESOLVE_ERR,
      GO_F + "btn('対応を決める').click();await sleep(700);" + MOD("TroubleResolve", "次へ") + "setv(fld('理由').querySelector('input,textarea'),'');await sleep(200);" + MOD("TroubleResolve", "解決する"), wait=800),
    V("032", "AW_DLVR_002", "変更申請の確認（希望日／別日／否認）", "Xác nhận đơn xin đổi (ngày mong muốn / ngày khác / từ chối)", E_URL, CR_ITEMS, "btn('承認する').click();await sleep(800);", wait=900,
      note=["見本 E（変更申請 申請中）→「承認する」。", "Mẫu E (đơn xin đổi 申請中) → 「承認する」."]),
    V("033", "AW_DLVR_002", "変更申請の確認 入力エラー（理由が空：否認）", "Xác nhận đơn xin đổi: lỗi nhập (lý do trống: từ chối)", E_URL, CR_ERR,
      "btn('承認する').click();await sleep(800);" + MOD("ChangeRequestProcess", "否認する"), wait=900),
    V("034", "AW_DLVR_002", "入力中のモーダルを閉じるときの確認（Q02）", "Xác nhận (Q02) khi đóng modal đang nhập", A_URL, Q02_ITEMS,
      "btn('取消').click();await sleep(700);setv(q('[data-m=DeliveryCancel] input[type=text]'),'関東倉庫の冷蔵庫故障のため');await sleep(300);", wait=800,
      note=["コードは Esc・×・背景で確認なしに閉じる（宿題）。この状態は入力したあとのモーダルを撮るだけで、Q02 の確認は項目定義で示す（決定：hong 2026-10-07 Q8＝A）。", "Code đóng bằng Esc・×・nền không hỏi (việc cần sửa). Trạng thái này chỉ chụp modal sau khi đã nhập; xác nhận Q02 thể hiện trong định nghĩa mục (quyết định: hong 2026-10-07 Q8 = A)."]),
]
# Q02 の項目はコードにまだない画面なので、画面の位置は取らない
for _it in Q02_ITEMS:
    _it["sel"] = "-"

V_EDIT = [
    V("035", "AW_DLVR_003", "編集 初期表示（この配送だけ変更：配送会社・スタッフ・住所・理由）", "Sửa: hiển thị ban đầu (chỉ đổi giao hàng này: công ty・nhân viên・địa chỉ・lý do)", A_URL + "/edit", E_HEAD + E_RO + E_DATE + E_CHANGE + E_REST, "", wait=1100,
      note=["見本 A（出荷待）の編集。配達時間帯は決定では読み取りのみ（コードは入力欄）。", "Sửa mẫu A (出荷待). Khung giờ giao theo quyết định là chỉ đọc (code là ô nhập)."]),
    V("036", "AW_DLVR_003", "編集（日付の変更表で別日を選択）", "Sửa (chọn ngày khác trong bảng đổi ngày)", A_URL + "/edit", [E_DATE[2], {k: v for k, v in E_DATE[3].items() if k != "chk"}],
      "{const r=[...document.querySelectorAll('.es-table.compact input[type=radio]:not(:disabled)')];if(r[1])r[1].click();}await sleep(400);", wait=900,
      note=["出荷待で、出荷日の前日までの配送。赤字は出荷不可・納品不可・件数の上限超え。", "Giao hàng 出荷待 trước ngày xuất. Chữ đỏ là không xuất・không giao được・vượt giới hạn số lượng."]),
    V("037", "AW_DLVR_003", "編集 入力エラー（変更理由が空）", "Sửa: lỗi nhập (lý do thay đổi trống)", A_URL + "/edit", E_ERR, "btn('保存').click();await sleep(500);", wait=900),
    V("038", "AW_DLVR_003", "離脱確認 Q02（変更後にキャンセル）", "Xác nhận rời đi Q02 (đã đổi rồi bấm キャンセル)", A_URL + "/edit", E_LEAVE,
      "setv(fld('変更理由').querySelector('input,textarea'),'拠点の依頼で変更');await sleep(300);btn('キャンセル').click();await sleep(500);", wait=900),
    V("039", "AW_DLVR_003", "編集できない状態で /edit を開く（納品済）", "Mở /edit ở trạng thái không sửa được (納品済)", B_URL + "/edit", E_LOCKED, "", wait=900,
      note=["見本 B（納品済）。コードは編集画面を出す。コードは編集画面を出す（決定は詳細へ戻して I03）。", "Mẫu B (納品済). Code hiện màn sửa (quyết định: về chi tiết và hiện I03)."]),
]

# ---- 操作で作る状態（データを書き換えるので最後に置く。撮影の順＝この並び）
V_TAIL = [
    V("040", "AW_DLVR_002", "配送概要（確認中の子：親が未解決で確定できない）", "Tổng quan (chuyến con 確認中: cha chưa giải quyết nên chưa chốt được)", B_URL, _hd("1.7") + D_CHILD_BAND + D_CHILD_CONFIRM,
      "btn('トラブルを代理登録').click();await sleep(700);" + MOD("TroubleReport", "登録する") + "await sleep(500);tab('トラブル');await sleep(500);q('a[href$=\"DL-260928-0014-1\"]').click();await sleep(1500);", wait=900,
      note=["B（納品済）にトラブルを代理登録（不在・受け取り不可）して作った子 DL-260928-0014-1（確認中）。親が未解決なので「確定して出荷待へ」は押せない。", "Tạo bằng cách đăng ký sự cố thay (vắng mặt) cho B (納品済): chuyến con DL-260928-0014-1 (確認中). Cha chưa giải quyết nên không bấm được 「確定して出荷待へ」."]),
    V("041", "AW_DLVR_002", "配送概要（確認中の子：確定して出荷待へ）", "Tổng quan (chuyến con 確認中: chốt sang 出荷待)", B_URL, [D_CHILD_CONFIRM[1], D_CHILD_CONFIRM[2]],
      "btn('対応を決める').click();await sleep(700);" + MOD("TroubleResolve", "次へ") + MOD("TroubleResolve", "解決する") + "await sleep(600);btn('複製').click();await sleep(700);" + MOD("DeliveryDuplicate", "複製する") + "await sleep(600);tab('実績');await sleep(500);q('a[href$=\"DL-260928-0014-2\"]').click();await sleep(1500);", wait=900,
      note=["親 B のトラブルを解決してから、複製で作った子 DL-260928-0014-2（確認中）。親が解決済なので「確定して出荷待へ」が押せる。", "Chuyến con DL-260928-0014-2 (確認中) tạo bằng 複製 sau khi đã giải quyết sự cố của B. Cha đã giải quyết nên bấm được 「確定して出荷待へ」."]),
    V("042", "AW_DLVR_002", "取消した配送の詳細（取消）", "Chi tiết giao hàng đã hủy (取消)", A_URL,
      [F("1.3", "状態（取消）", "Trạng thái (取消)", ".es-pagehead .stat .k::状態", "label", pattern="P-STATUS-COLORS", detail=["灰のバッジ「取消」。取消した配送データは消さずに残り、変更履歴に理由と操作者が残る。編集・取消・複製のボタンは出ない（取消は終わった状態）。法人Webには出ない（Q9＝A）。", "Badge xám 「取消」. Dữ liệu giao hàng đã hủy vẫn được giữ, 変更履歴 lưu lý do và người thao tác. Không hiện nút 編集・取消・複製 (取消 là trạng thái kết thúc). Không hiện trên Web công ty (Q9 = A)."]),
       F("1.12", "編集（出ない）", "Sửa (không hiện)", ".es-pagehead", "area", "view", detail=["取消の配送には 編集 が出ない（納品済・中止・取消 以外が編集できる状態）。", "Giao hàng 取消 không có nút 編集 (trạng thái sửa được là trừ 納品済・中止・取消)."])],
      "btn('取消').click();await sleep(700);" + MOD("DeliveryCancel", "取消する") + "await sleep(900);{const c=[...document.querySelectorAll('[data-m=DeliveryDuplicate] .es-dialog__foot button')].find(b=>b.textContent.includes('キャンセル'));if(c){c.click();await sleep(500);}}", wait=900,
      note=["A を取消した結果。取消の続きの「代替便の複製」のモーダルはキャンセルで閉じる。", "Kết quả sau khi hủy A. Modal 複製 (代替便) mở tiếp sau khi hủy thì đóng bằng キャンセル."]),
    V("043", "AW_DLVR_002", "中止（トラブル → 対応を決める → 納品せずに終了する）の詳細", "Chi tiết 中止 (sự cố → 対応を決める → 納品せずに終了する)", B_URL,
      [F("1.3", "状態（中止）", "Trạng thái (中止)", ".es-pagehead .stat .k::状態", "label", pattern="P-STATUS-COLORS", detail=["灰のバッジ「中止」（実績0・運賃は請求しない／請求するは理由必須）。「中止」の直接のボタンはなく、トラブルを代理登録して「対応を決める」で「納品せずに終了する」を選んだ結果（Q2＝B）。残った商品は複製の「返送」で本社へ送れる。", "Badge xám 「中止」 (thực tế 0・không tính cước; 「請求する」 bắt buộc lý do). Không có nút 「中止」 trực tiếp; là kết quả của việc đăng ký sự cố thay rồi chọn 「納品せずに終了する」 ở 「対応を決める」 (Q2 = B). Hàng còn lại gửi về 本社 bằng 複製 loại 「返送」."]),
       F("1.4", "段階", "Giai đoạn", ".es-pagehead .stat .k::段階", "label", detail=["中止の配送の段階表示。", "Hiển thị giai đoạn của giao hàng 中止."])],
      "btn('トラブルを代理登録').click();await sleep(700);" + MOD("TroubleReport", "登録する") + "await sleep(600);btn('対応を決める').click();await sleep(700);" + RADIO("TroubleResolve", "納品せずに終了する") + MOD("TroubleResolve", "次へ") + MOD("TroubleResolve", "解決する") + "await sleep(800);", wait=900,
      note=["B に再びトラブルを代理登録し、「納品せずに終了する」で解決した結果。", "Kết quả sau khi lại đăng ký sự cố thay cho B rồi giải quyết bằng 「納品せずに終了する」."]),
    V("044", "AW_DLVR_002", "再配送待の詳細（納品ゼロで送り直す）", "Chi tiết 再配送待 (không giao được gì, gửi lại)", LIST_URL,
      [F("1.3", "状態（再配送待）", "Trạng thái (再配送待)", ".es-pagehead .stat .k::状態", "label", pattern="P-STATUS-COLORS", detail=["黄のバッジ「再配送待」。「対応を決める」で「納品ゼロで送り直す」を選んだ結果。自動子は再配送の子になり、日付と数量を確定すると出荷待になる。", "Badge vàng 「再配送待」. Kết quả khi chọn 「納品ゼロで送り直す」 ở 「対応を決める」. Chuyến con tự động thành chuyến con giao lại, chốt ngày và số lượng thì thành 出荷待."])],
      GO_F + "btn('対応を決める').click();await sleep(700);" + RADIO("TroubleResolve", "納品ゼロで送り直す") + MOD("TroubleResolve", "次へ") + MOD("TroubleResolve", "解決する") + "await sleep(800);", wait=900,
      note=["見本 F の遅延のトラブルを、納品ゼロで送り直す対応で解決した結果。", "Kết quả sau khi giải quyết sự cố trễ của mẫu F bằng cách xử lý 「納品ゼロで送り直す」."]),
    V("045", "AW_DLVR_002", "複製（すでに子がある配送：情報帯）", "Nhân bản (giao hàng đã có chuyến con: dải thông tin)", B_URL, DUP_CHILD, "btn('複製').click();await sleep(700);", wait=800,
      note=["B はここまでの操作で子が付いている。複製のモーダルに「この配送にはすでに子が n件あります」が出る。", "B đã có chuyến con sau các thao tác ở trên. Modal 複製 hiện 「この配送にはすでに子が n件あります」."]),
]


V_RO = [
    V("046", "AW_DLVR_002", "詳細（参照のみの役割：経理 R）", "Chi tiết (vai trò chỉ xem: 経理 R)", B_URL, [
        F("1.13", "操作ボタン（参照のみ）", "Nút thao tác (chỉ xem)", ".es-pagehead", "area", "view",
          detail=["配送データ詳細には、詳細画面の補助機能（項目の検索・すべて開く／閉じる・カード目次・「編集できる項目だけ」）は出さない（タブの構成。hong 2026-10-07 D10）。経理（R）・閲覧のみ：取消・複製・トラブルを代理登録・対応を決める・編集のボタンが出ない（権限がない操作は出さない）。タブの中の「トラブルを代理登録」「対応を決める」「メモを追加」「資料を追加」「送り状番号の追加」も出ない。", "Chi tiết dữ liệu giao hàng không hiện chức năng phụ (tìm mục・mở/đóng tất cả・mục lục card・「編集できる項目だけ」) vì cấu trúc theo tab (hong 2026-10-07 D10). 経理 (R)・閲覧のみ: không hiện nút 取消・複製・トラブルを代理登録・対応を決める・編集 (thao tác không có quyền thì không hiện). Các nút trong tab 「トラブルを代理登録」「対応を決める」「メモを追加」「資料を追加」「送り状番号の追加」 cũng không hiện."],),
    ], "", login="Ad00012", wait=900,
      note=["経理（Ad00012・R）でログイン。", "Đăng nhập 経理 (Ad00012・R)."]),
]

V_FIX = [
    V("047", "AW_DLVR_002", "実績を直す（実績タブの中：直す→入力→保存）", "Sửa kết quả (trong tab 実績: sửa → nhập → lưu)", "/ops/delivery/list/DL-260914-0001?tab=res", D_RESULT_FIX,
      "", wait=900,
      note=["見本 C（DL-260914-0001）の実績タブ。コードは読み取りだけなので「実績を直す」は宿題（撮らない。hong 2026-10-07 D3）。", "Tab 実績 của mẫu C (DL-260914-0001). Code chỉ đọc nên 「実績を直す」 là việc cần làm (không chụp; hong 2026-10-07 D3)."]),
]


# ================================================================ AW_DLVR_004 特例の配送を追加（hong 回答 2026-10-08）
def SPF(no, ja, vi, kind, req, ln, ex, d, init=None, **kw):
    kw.setdefault("demo_ok", SP_NEW)
    x = F(no, ja, vi, "-", kind, "input", req=req, len=ln, ex=ex, detail=d, **kw)
    if init: x["init"] = init
    return x

SP_ITEMS = [
    F("1", "ヘッダー", "Đầu trang", "-", "area", detail=["パンくず「配送管理 / 出荷・配送管理 / 特例の配送を追加」・画面名・ボタン（キャンセル／追加する）。特例の配送は、何もない状態から運営が作る配送（親の配送を持たない）。", "Breadcrumb 「配送管理 / 出荷・配送管理 / 特例の配送を追加」, tên màn hình, nút (キャンセル / 追加する). Giao hàng đặc biệt là giao hàng do 運営 tạo từ trạng thái trống (không có giao hàng cha)."],
      demo_ok=SP_NEW),
    SPF("2", "契約（子契約）", "Hợp đồng (hợp đồng con)", "select", "－", ["選択（契約ID・法人名で検索）", "Chọn (tìm theo ID hợp đồng hoặc tên công ty)"], ["CT00123（株式会社サンプル 大阪支店）", "Hợp đồng con dùng làm giá trị ban đầu"],
        ["任意。選ぶと、その契約のプランと配送区分を初期値にする（あとから変えられる）。選ばないときは、配送区分（温度帯）を運営が選ぶ（No.7）。契約を選んでも拠点は自動では決まらない（No.3 で選ぶ）。", "Không bắt buộc. Nếu chọn, lấy gói và phân loại giao hàng của hợp đồng đó làm giá trị ban đầu (đổi được sau). Không chọn thì 運営 chọn phân loại giao hàng (nhiệt độ) (No.7). Chọn hợp đồng thì chi nhánh cũng không tự quyết định (chọn ở No.3)."], init=["未選択", "Chưa chọn"]),
    SPF("3", "拠点", "Chi nhánh", "select", "○", ["選択（拠点ID・拠点名で検索）", "Chọn (tìm theo ID hoặc tên chi nhánh)"], ["拠点 B00045（サンプル 大阪支店）", "Chi nhánh nhận giao hàng đặc biệt"],
        ["配送先の拠点。必須。未選択で追加すると E02。", "Chi nhánh nhận hàng. Bắt buộc. Chưa chọn mà thêm thì hiện E02."], init=["未選択", "Chưa chọn"], err=["E02"]),
    SPF("4", "納品日", "Ngày giao", "date", "○", "日付 yyyy-mm-dd", ["2026-10-20", "Ngày giao đặc biệt (yyyy-mm-dd)"],
        ["運営が入力する（リードタイムから自動計算しない）。日付の共通部品（yyyy-mm-dd）。必須。未入力は E01。", "運営 nhập (không tự tính từ lead time). Ô ngày chung (yyyy-mm-dd). Bắt buộc. Để trống hiện E01."], err=["E01"]),
    SPF("5", "出荷日", "Ngày xuất kho", "date", "○", "日付 yyyy-mm-dd", ["2026-10-17", "Ngày xuất kho (yyyy-mm-dd)"],
        ["運営が納品日とは別に入力する。日付の共通部品。必須（未入力は E01）。出荷日は納品日以前（納品日より後は E178）。出荷日が、拠点のピッキング倉庫の出荷不可日にあたるときは警告 W136 を出す（止めない。追加はできる）。", "運営 nhập riêng với ngày giao. Ô ngày chung. Bắt buộc (để trống hiện E01). Ngày xuất kho phải trước hoặc bằng ngày giao (sau ngày giao hiện E178). Nếu ngày xuất kho trùng ngày không xuất của kho picking của chi nhánh thì hiện cảnh báo W136 (không chặn; vẫn thêm được)."], err=["E01", "E178", "W136"]),
    SPF("6", "商品と数量", "Sản phẩm và số lượng", "table", "○", ["1行以上。商品ごとに数量（整数 1〜999,999）", "Từ 1 dòng. Số lượng cho từng sản phẩm (số nguyên 1〜999.999)"], ["おにぎり弁当 48", "Sản phẩm và số lượng cần giao"],
        ["運営が商品と数量を手で選ぶ表。プランの標準・上限は適用しない（上限を超えても止めない・警告も出さない）。「行を追加」で行を足し、不要な行は削除できる。商品が1行もないと追加できない（E02）。同じ商品を2行にしてもよい。", "Bảng 運営 chọn thủ công sản phẩm và số lượng. Không áp dụng mức chuẩn・giới hạn của gói (vượt giới hạn cũng không chặn・không cảnh báo). Bấm 「行を追加」 để thêm dòng, xóa được dòng thừa. Không có dòng sản phẩm nào thì không thêm được (E02). Cùng một sản phẩm ở 2 dòng cũng được."], err=["E02"]),
    SPF("6.1", "商品", "Sản phẩm", "select", "○", ["選択（商品ID・商品名で検索）", "Chọn (tìm theo ID hoặc tên sản phẩm)"], ["おにぎり弁当 PR00012", "Sản phẩm giao"],
        ["商品の追加行の商品。未選択は E02。", "Sản phẩm ở dòng thêm. Chưa chọn hiện E02."], init=["未選択", "Chưa chọn"], err=["E02"]),
    SPF("6.2", "数量", "Số lượng", "text", "○", "整数 1〜999,999", ["48", "Số lượng giao (số nguyên)"],
        ["半角の整数（1〜999,999）。未入力は E01、数字でないときは E14、範囲外は E12。", "Số nguyên bán góc (1〜999.999). Để trống hiện E01, không phải số hiện E14, ngoài khoảng hiện E12."], err=["E01", "E14", "E12"]),
    F("6.3", "行を追加", "Thêm dòng", "-", "button", "click", detail=["商品と数量の行を1つ足す。行の右の削除で、その行を消す。", "Thêm một dòng sản phẩm và số lượng. Nút xóa bên phải dòng để xóa dòng đó."], demo_ok=SP_NEW),
    SPF("7", "温度帯（配送区分）", "Nhiệt độ (phân loại giao hàng)", "select", "○", ["選択（常温／冷蔵／冷凍）", "Chọn (thường / lạnh / đông)"], ["冷凍", "Nhóm nhiệt độ của giao hàng"],
        ["運営が手で選ぶ（商品・拠点・契約から自動では決めない）。契約を選んだときは、その契約の配送区分が初期値。必須。未選択は E02。", "運営 chọn thủ công (không tự quyết định từ sản phẩm・chi nhánh・hợp đồng). Nếu đã chọn hợp đồng thì phân loại giao hàng của hợp đồng đó là giá trị ban đầu. Bắt buộc. Chưa chọn hiện E02."], init=["未選択", "Chưa chọn"], err=["E02"]),
    SPF("8", "配送パターン", "Mẫu giao hàng", "select", "○", ["選択（既存の選択肢：サイクル／個別指定／都度配送）", "Chọn (lựa chọn có sẵn: chu kỳ / chỉ định riêng / giao theo lần)"], ["都度配送", "Mẫu giao hàng lưu cùng giao hàng"],
        ["運営が既存の選択肢から選ぶ。初期値は「都度配送」。", "運営 chọn trong các lựa chọn có sẵn. Giá trị ban đầu là 「都度配送」."], init=["都度配送", "都度配送 (giao theo lần)"]),
    SPF("9", "理由", "Lý do", "textarea", "○", ["複数行 500字（絵文字不可）", "Nhiều dòng 500 ký tự (không emoji)"], ["客先の要望で追加の1回分を手配", "Lý do thêm giao hàng đặc biệt"],
        ["自由記入。必須。未入力は E01、501字以上は E04、絵文字は E13。", "Nhập tự do. Bắt buộc. Để trống hiện E01, từ 501 ký tự hiện E04, emoji hiện E13."], err=["E01", "E04", "E13"], demo_ok=SP_NEW + H_MAXLEN),
    F("10", "特例のラベル・出荷指示・請求", "Nhãn đặc biệt・chỉ thị xuất kho・thanh toán", "-", "label", detail=["追加した配送は通常の配送と同じく「出荷待」になり、出荷指示の対象（版・送り状）に流れる。一覧（No.5）と詳細に「特例」のラベルを出す。特例の配送そのものには料金の欄がなく、配送データは請求を作らない。料金が必要なときは、運営が単発のオプションなどで別に足す。", "Giao hàng đã thêm giống giao hàng thường: thành 「出荷待」 và chảy sang đối tượng chỉ thị xuất kho (phiên bản・phiếu gửi). Hiện nhãn 「特例」 ở danh sách (No.5) và chi tiết. Bản thân giao hàng đặc biệt không có ô phí và dữ liệu giao hàng không tạo thanh toán. Khi cần phí thì 運営 thêm riêng bằng tùy chọn đơn lẻ v.v."],
      demo_ok=SP_NEW),
    F("11", "複製との違い", "Khác với 複製", "-", "label", detail=["複製は親の配送を元にひな形を引き継ぐ（枝番つき）。特例は何もない状態から作り、親の配送を持たない。枝番はなく、配送No は通常の採番。", "複製 kế thừa mẫu từ giao hàng cha (có số nhánh). Giao hàng đặc biệt tạo từ trạng thái trống, không có giao hàng cha. Không có số nhánh; 配送No đánh số như thường."],
      demo_ok=SP_NEW),
    F("12", "キャンセル", "Hủy", "-", "button", "click", err=["Q02"], detail=["何か入力したあとは Q02（破棄の確認）を出し、「破棄する」で一覧へ戻る。入力がなければそのまま戻る。ブラウザの戻る・別画面への移動でも同じ。", "Nếu đã nhập gì thì hiện Q02 (xác nhận bỏ), chọn 「破棄する」 để quay về danh sách. Chưa nhập thì quay về ngay. Bấm quay lại của trình duyệt hay chuyển màn hình khác cũng vậy."], demo_ok=SP_NEW),
    F("13", "追加する", "Thêm", "-", "button", "click", pattern="P-FORM", err=["E01", "E02", "E04", "E12", "E13", "E14", "E178", "S137"], cond=["作成の操作の権限がある役割だけ（No.1.5 と同じ）", "Chỉ vai trò có quyền thao tác 「作成」 (giống No.1.5)"],
      detail=["入力チェック（必須・日付・数量・理由 500字・出荷日≦納品日）を通すと配送データを作る。状態は「出荷待」で、枝番なし・親なし・配送No は通常の採番。作ったあとは詳細（AW_DLVR_002）へ移り、トースト S137「特例の配送{配送No}を追加しました。」を出す。エラーがあれば作らず、先頭のエラーの項目へ移す。", "Qua kiểm tra nhập liệu (bắt buộc・ngày・số lượng・lý do 500 ký tự・ngày xuất ≦ ngày giao) thì tạo dữ liệu giao hàng. Trạng thái 「出荷待」, không số nhánh・không cha, 配送No đánh số như thường. Sau khi tạo chuyển sang chi tiết (AW_DLVR_002) và hiện toast S137 「特例の配送{配送No}を追加しました。」. Có lỗi thì không tạo, chuyển tới mục lỗi đầu tiên."],
      demo_ok=SP_NEW),
]

V_SPECIAL = [
    V("048", "AW_DLVR_004", "特例の配送を追加（入力画面）", "Thêm giao hàng đặc biệt (màn nhập)", LIST_URL + "/new", SP_ITEMS, "", wait=800,
      note=["特例の配送の入力画面。コードにまだない（hong 2026-10-08 の回答どおりに作る）。画像は撮らない。", "Màn nhập giao hàng đặc biệt. Code chưa có (làm đúng theo trả lời của hong 2026-10-08). Không chụp ảnh."]),
]

VIEWS = V_LIST + V_DETAIL + V_EDIT + V_TAIL + V_RO + V_FIX + V_SPECIAL
