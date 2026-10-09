# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「出荷指示・取込」（AW_SHIP）。
元は本物の Web（app/ops/delivery/list/ship-orders）。決定は docs/決定台帳.md「運営D 出荷・配送管理」（確認メモ D-2 Q1・Q4・Q5・Q6）・
「運営D 配送の数値」・「外部連携のデモでの扱い」・受付簿 No.169・175、仕様は 配送_05 §10-1〜10-4・10-8、配送_12 §19.1〜19.6。
Q4＝B：いまの「再送」は手動。変更した行のCSVを出し、運営がTHOMASに登録して「送信済にする」を押す（ESの自動送信はフェーズ3）。
Q5＝C：送信失敗は説明＋demo_ok（撮らない）。取込エラー（IM2）は見本で撮る。
コードとの違い（demo_ok）：再送ボタン（コードは「再送」で即送信済・locked にしない）、倉庫・対象の選択が出力に効かない、倉庫コード・版・ファイル名、
取込が履歴を足すだけ（状態を変えない・エラー0行）、取込の権限（コードは CSV取込権限＝物流が使えない）、タブが URL にない、トーストの文言。
"""

TITLE = ["出荷指示・取込（AW_SHIP）", "Chỉ thị xuất kho・Nhập kết quả (AW_SHIP)"]
SHEET = ["出荷指示・取込", "Chỉ thị xuất kho・Nhập"]
BASENAME = "画面設計書_AW_SHIP_出荷指示"
IMG_PREFIX = "AW_SHIP"
OUT_DIR = "AW_SHIP_出荷指示"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、SHIP＝出荷指示・取込（Shipping Order）。1画面（AW_SHIP_001）に「出荷指示の送信」「出荷実績・送り状の取込」の2つのタブ", "Quy ước mã màn hình: AW = Admin Web, SHIP = Shipping Order (chỉ thị xuất kho・nhập). 1 màn hình (AW_SHIP_001) có 2 tab: 「出荷指示の送信」 và 「出荷実績・送り状の取込」"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}   # フル権限（ops.full・マスタ管理者・営業担当）。参照のみの見本は 経理 Ad00012
CODE_PATHS = ["app/ops/delivery/list/ship-orders", "app/ops/delivery/_components", "lib/ops/areas/delivery.ts", "lib/ops/delivery", "lib/domain/seed"]

SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"
SRC2 = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B）"

SRC3 = "hong 回答 2026-10-08（確認メモ_AW_運営D_配送 Stage B）"
DECISIONS = [
    {"date": "2026-10-08", "target": "AW_SHIP_001 No.3.5・3.6・5.19・5.20",
     "q": ["「範囲指定できるように」は何の範囲か（HTML レビュー H-1）", "「範囲指定できるように」 là khoảng của cái gì (review HTML H-1)"],
     "a": ["出荷指示CSVの出力条件に「出荷日の範囲（開始〜終了）」、送信履歴の絞り込みに「送信日の範囲」を足す。日付は共通の日付入力欄、終了日は開始日以降（E08）", "Thêm 「出荷日の範囲（開始〜終了）」 vào điều kiện xuất CSV chỉ thị xuất kho và 「送信日の範囲」 vào bộ lọc lịch sử gửi. Ngày dùng ô ngày chung, ngày kết thúc từ ngày bắt đầu trở đi (E08)"],
     "src": "hong 回答 2026-10-08（HTML レビュー）"},
    {"date": "2026-10-08", "target": "AW_SHIP_001 No.8.3・8.4（名前）",
     "q": ["「ひな形」とは何か（HTML レビュー H-2）", "「ひな形」 là gì (review HTML H-2)"],
     "a": ["取込ファイルの見本のダウンロード。他の画面と同じ「テンプレート」に名前をそろえる（「テンプレート（出荷実績）」「テンプレート（送り状番号）」）", "Là nút tải file mẫu để nhập. Đổi tên cho giống các màn khác thành 「テンプレート」 (「テンプレート（出荷実績）」「テンプレート（送り状番号）」)"],
     "src": "hong 回答 2026-10-08（HTML レビュー）"},
    {"date": "2026-10-08", "target": "AW_SHIP_001 No.8.15（取込のファイル全体のエラー）",
     "q": ["取込でファイル全体が不正なとき（見出しの列が違う・行数の上限・CSVとして読めない・空）の扱い", "Khi toàn bộ tệp nhập không hợp lệ (sai cột tiêu đề・vượt số dòng・không đọc được CSV・rỗng)"],
     "a": ["ファイル全体を拒否してエラーを出す。ほかの CSV 取込と共通のメッセージ（E51・E107・E113・E106）。行ごとのエラーは P-CSV どおり（エラーの行だけ取り込まない）", "Từ chối cả tệp và báo lỗi bằng message chung của các CSV取込 khác (E51・E107・E113・E106). Lỗi từng dòng theo P-CSV (chỉ dòng lỗi không được nhập)"], "src": "hong 回答 2026-10-08（確認メモ_AW_運営D_配送 Stage B H6b）"},
    {"date": "2026-10-08", "target": "AW_SHIP_001 No.3.1",
     "q": ["倉庫の選択肢の出どころ（H1）", "Nguồn lựa chọn kho (H1)"],
     "a": ["倉庫マスタの「THOMAS 連携あり」の倉庫から出す", "Lấy từ các kho có 「THOMAS 連携あり」 trong master kho"],
     "src": SRC3},
    {"date": "2026-10-08", "target": "AW_SHIP_001 No.5.10・3.3",
     "q": ["「変更した行のCSV」の出し方（H3）", "Cách xuất 「CSV các dòng đã đổi」 (H3)"],
     "a": ["再送待ちの行をまとめて1ファイルで出すボタン（No.3.3 の出力）。行ごとの CSV ボタンは作らない", "Nút xuất gộp các dòng 再送待ち vào 1 file (xuất ở No.3.3). Không làm nút CSV theo từng dòng"],
     "src": SRC3},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5.10・5.11・4.3",
     "q": ["出荷指示の「送信」「再送」は実際に何をするか（D-2 Q4）", "「送信」「再送」 ở 出荷指示 thực chất là gì (D-2 Q4)"],
     "a": ["B（いま）：「再送」＝変更した行のCSVを出し、運営がTHOMASに登録して「送信済にする」を押す（手動）。人が押すことが locked を決める。ESの自動送信（バッチ）はフェーズ3（将来）。設計書はBで書き、Aは将来の注記", "B (hiện tại): 「再送」 = xuất CSV các dòng đã đổi, vận hành đăng ký vào THOMAS rồi bấm 「送信済にする」 (thủ công). Việc người bấm quyết định locked. ES tự gửi (batch) để Giai đoạn 3 (tương lai). Thiết kế viết theo B, A ghi chú là tương lai"], "src": SRC},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5.7・5.8、045 取込タブ",
     "q": ["見本データにない状態の扱い（送信失敗・取込エラー）（D-2 Q5）", "Xử lý trạng thái không có trong dữ liệu mẫu (gửi thất bại・lỗi nhập) (D-2 Q5)"],
     "a": ["C：送信失敗は設計書に説明＋demo_ok（撮らない）。取込エラーは見本（IM2）で撮る", "C: 「送信失敗」 ghi giải thích + demo_ok trong thiết kế (không chụp). Lỗi nhập chụp bằng dữ liệu mẫu (IM2)"], "src": SRC},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5.11・8.1・8.2",
     "q": ["取消・複製・再送・出荷実績／送り状の取込を誰ができるか（D-2 Q1）", "Ai được 取消・複製・再送・nhập kết quả xuất kho/vận đơn (D-2 Q1)"],
     "a": ["B：「機能ごとの操作」＝物流（R/U）もできる。営業・CS・商品系（CRUD）も可。経理（R）は不可（ボタンを出さない）", "B: Là 「thao tác theo chức năng」 nên 物流 (R/U) cũng làm được. 営業・CS・商品系 (CRUD) cũng được. 経理 (R) không được (không hiện nút)"], "src": SRC},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5.7・8.13",
     "q": ["ステータスのバッジの色（D-2 Q6）", "Màu badge trạng thái (D-2 Q6)"],
     "a": ["B：出荷済・受取済＝青／納品済＝緑／再配送待・確認中＝黄／変更申請 申請中＝黄・提案中＝青・調整済＝灰。この画面の出荷指示（再送待ち＝黄・送信済＝緑・送信失敗＝赤）と取込（完了＝緑・一部エラー＝黄）は共通表（P-STATUS-COLORS）のとおりで、コードの色と同じ", "B: 出荷済・受取済 = xanh dương / 納品済 = xanh lá / 再配送待・確認中 = vàng / 変更申請: 申請中 = vàng, 提案中 = xanh dương, 調整済 = xám. Ở màn này chỉ thị xuất kho (再送待ち = vàng, 送信済 = xanh lá, 送信失敗 = đỏ) và nhập (完了 = xanh lá, 一部エラー = vàng) theo bảng chung (P-STATUS-COLORS), trùng màu trong code"], "src": SRC},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5.11",
     "q": ["THOMAS は同じ指示番号の再送（rev＋1・数量0）を受け付けるか（O1・O3・O4）", "THOMAS có nhận gửi lại cùng số chỉ thị (rev+1・số lượng 0) không (O1・O3・O4)"],
     "a": ["受け付ける（hong 回答。客先・THOMAS への書面の確認は未：配送_10 §18-1 No.2 は追う）", "Có nhận (hong trả lời). Chưa có xác nhận bằng văn bản từ khách・THOMAS: theo dõi 配送_10 §18-1 No.2"], "src": SRC},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5・5.13〜5.15（送信履歴）",
     "q": ["送信履歴の並び・絞り込み・表示件数（H2）", "Thứ tự・lọc・số dòng mỗi trang của lịch sử gửi (H2)"],
     "a": ["いまの並び（再送待ちを出荷日の近い順に上・送信済みは新しい順）。絞り込みは倉庫と状態。表示件数 10／20／50／100（既定10）", "Giữ thứ tự hiện tại (再送待ち lên trên theo ngày xuất kho gần nhất, 送信済 theo mới nhất). Lọc theo kho và trạng thái. Số dòng mỗi trang 10 / 20 / 50 / 100 (mặc định 10)"], "src": SRC2 + " H2"},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.5.11・5.16〜5.18（送信済にする）",
     "q": ["「送信済にする」の確認と初回の多数行（H4）", "Xác nhận khi bấm 「送信済にする」 và lần gửi đầu nhiều dòng (H4)"],
     "a": ["確認を出す（新しい確認メッセージ Q134：locked は戻せない旨）。初回の多数行は、行にチェックして「選択した n件を送信済にする」でまとめて押せる", "Hiện xác nhận (thông báo mới Q134: locked không hoàn tác được). Lần gửi đầu nhiều dòng: tích chọn các dòng rồi bấm 「選択した n件を送信済にする」 để làm hàng loạt"], "src": SRC2 + " H4"},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.8.6・8.16（取込履歴）",
     "q": ["取込履歴の保持期間とページ送り（H5）", "Thời gian lưu và phân trang của lịch sử nhập (H5)"],
     "a": ["24か月保持。表示件数 10／20／50／100（既定10）", "Lưu 24 tháng. Số dòng mỗi trang 10 / 20 / 50 / 100 (mặc định 10)"], "src": SRC2 + " H5"},
    {"date": "2026-10-07", "target": "AW_SHIP_001 No.8.1・8.2・8.15（取込のエラーの扱い）",
     "q": ["取込でエラーがあるときの扱い（H6）", "Cách xử lý khi nhập có lỗi (H6)"],
     "a": ["ファイル全体を拒否せず、ほかのCSV取込と同じ P-CSV の決まりで行ごとに検査する（エラーの行だけ取り込まない・エラー一覧CSV）。列の違いなど構造のエラーのメッセージは E51／E52 の範囲で書き、足りないものは確認待ち", "Không từ chối cả file mà kiểm tra từng dòng theo P-CSV như các CSV取込 khác (chỉ dòng lỗi không nhập・エラー一覧CSV). Thông báo cho lỗi cấu trúc như sai cột viết trong phạm vi E51／E52, phần còn thiếu để chờ xác nhận"], "src": SRC2 + " H6"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_SHIP_001", "ja": "出荷指示・取込", "vi": "Chỉ thị xuất kho・Nhập"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const btn=(t,sc)=>[...document.querySelectorAll((sc||'')+' button')].find(b=>b.textContent.trim().startsWith(t));"
    "const tab=async(t)=>{[...document.querySelectorAll('.es-tab')].find(b=>b.textContent.includes(t)).click();await sleep(400);};"
    "const fakeFile=(name,text)=>{const o=HTMLInputElement.prototype.click;HTMLInputElement.prototype.click=function(){if(this.type==='file'){"
    "const dt=new DataTransfer();dt.items.add(new File([text],name,{type:'text/csv'}));this.files=dt.files;this.dispatchEvent(new Event('change'));return;}return o.call(this);};};"
)

# ------------------------------------------------------------------ demo_ok の定型
D_TAB_URL = ["コードのタブは画面の状態だけで URL（?tab=）に持たない。P-TAB に揃える（再読み込み・戻るでも同じタブ）", "Tab trong code chỉ là state của màn hình, không nằm trong URL (?tab=). Đồng nhất theo P-TAB (tải lại / Back vẫn đúng tab)"]
D_RESEND = ["コードのボタンは「再送」で、押すと送信日時を記録して行を送信済にするだけ（locked にしない・確認なし・ES採番の送り状も作らない）。決定（Q4＝B）に合わせて、ボタン名を「送信済にする」に直し、locked と送り状の作成・版（rev）の扱いを足す", "Nút trong code tên 「再送」, bấm chỉ ghi giờ gửi và chuyển dòng sang 送信済 (không locked, không xác nhận, không tạo vận đơn ES). Theo quyết định (Q4 = B): đổi tên nút thành 「送信済にする」 và bổ sung locked, tạo vận đơn, xử lý phiên bản (rev)"]
D_PERM = ["コードは取込の権限を CSV取込（csvImport）にしていて、物流（R/U）は取込ボタンが出ない。決定（Q1＝B）どおり「機能ごとの操作」＝更新（update）にする", "Code gắn quyền nhập là CSV取込 (csvImport) nên 物流 (R/U) không thấy nút nhập. Theo quyết định (Q1 = B) đổi thành 「thao tác theo chức năng」 = cập nhật (update)"]

# ------------------------------------------------------------------ 項目（出荷指示の送信タブ）
I_HEAD = {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".es-pagehead", "kind": "area", "trig": "view",
          "detail": ["パンくず：配送管理 ＞ 出荷・配送管理 ＞ 出荷指示・取込（「出荷・配送管理」は一覧へのリンク）。タイトル「出荷指示・取込」。見られるのは出荷・配送管理の閲覧権限がある役割。「送信済にする」「取込」は更新権限がある役割だけ（経理 R は出ない）。この画面はTHOMAS（倉庫システム）と手動で連携する（CSVを出し、運営が登録し、出荷実績CSVを取り込む）。ESが自動で送るのはフェーズ3。",
                     "Breadcrumb: 配送管理 > 出荷・配送管理 > 出荷指示・取込 (「出荷・配送管理」 là link về danh sách). Tiêu đề 「出荷指示・取込」. Vai trò có quyền xem 出荷・配送管理 đều xem được. 「送信済にする」 và 「取込」 chỉ vai trò có quyền cập nhật (経理 R không thấy). Màn này liên kết thủ công với THOMAS (xuất CSV, vận hành đăng ký, nhập CSV kết quả xuất kho). ES tự gửi là Giai đoạn 3."]}
I_STAT = {"no": "1.1", "ja": "連携先・出力の表示", "vi": "Hiển thị nơi liên kết・xuất", "sel": ".es-pagehead .stat", "kind": "label", "trig": "view",
          "detail": ["「倉庫システム：トーマス（暫定の名前）」「出力 CSV ・ Shift_JIS（出力のときに変換）」。文字コードは出力の層で Shift_JIS に変える（UTF-8 を受けられない場合）。",
                     "「倉庫システム：トーマス（暫定の名前）」 và 「出力 CSV ・ Shift_JIS（出力のときに変換）」. Bảng mã được đổi sang Shift_JIS ở tầng xuất (khi THOMAS không nhận UTF-8)."],
          "open": ["「トーマス／THOMAS」の呼び方と、THOMAS の列の定義・文字コード・同じ指示番号の上書き再送の書面での確認がまだ（配送_10 §18 No.5・#10・#28〜#30）", "Cách gọi 「トーマス／THOMAS」 và việc xác nhận bằng văn bản về định nghĩa cột・bảng mã・ghi đè khi gửi lại cùng số chỉ thị của THOMAS vẫn chưa xong (配送_10 §18 No.5・#10・#28〜#30)"],
          "ask": "お客様・THOMAS ベンダー"}
I_TABS = {"no": "2", "ja": "タブ", "vi": "Tab", "sel": ".es-tabs", "kind": "area", "trig": "view", "pattern": "P-TAB", "demo_ok": D_TAB_URL,
          "detail": ["「出荷指示の送信」「出荷実績・送り状の取込」の2つ。", "2 tab: 「出荷指示の送信」 và 「出荷実績・送り状の取込」."]}
I_TAB1 = {"no": "2.1", "ja": "出荷指示の送信（タブ）", "vi": "Tab 出荷指示の送信", "sel": ".es-tab::出荷指示の送信", "kind": "tab", "trig": "click",
          "detail": ["件数＝送信履歴の「再送待ち」の行の数。", "Số đếm = số dòng 「再送待ち」 trong lịch sử gửi."]}
I_TAB2 = {"no": "2.2", "ja": "出荷実績・送り状の取込（タブ）", "vi": "Tab 出荷実績・送り状の取込", "sel": ".es-tab::出荷実績・送り状の取込", "kind": "tab", "trig": "click",
          "detail": ["件数＝取込履歴のうちエラーの行がある取込の数。", "Số đếm = số lần nhập có dòng lỗi trong lịch sử nhập."]}
I_OUT = {"no": "3", "ja": "出力の条件とボタン", "vi": "Điều kiện xuất và nút", "sel": ".es-card .dnav", "kind": "area", "trig": "view",
         "detail": ["倉庫と対象（と、必要なら出荷日の範囲）を選んでCSVを出す。「検索」はなく、選んだ内容で「出荷指示CSVを出力（THOMAS）」を押すと出す。出力は確認用・手動連携用。",
                    "Chọn kho và đối tượng (và khoảng ngày xuất kho nếu cần) rồi xuất CSV. Không có nút 「検索」; chọn xong bấm 「出荷指示CSVを出力（THOMAS）」 là xuất. Xuất để kiểm tra / liên kết thủ công."]}
I_WH = {"no": "3.1", "ja": "倉庫", "vi": "Kho", "sel": ".es-field::倉庫", "kind": "select", "trig": "select", "req": "－",
        "len": ["選択", "Chọn"], "init": ["関東倉庫 WH00001", "関東倉庫 WH00001 (Kho Kanto)"],
        "ex": ["関東倉庫 WH00001", "Kho Kanto (mã kho WH00001) — kho cần xuất file CSV chỉ thị"],
        "detail": ["出力の単位は倉庫別（1ファイル＝1倉庫）。選んだ倉庫の出荷指示だけを出す。選択肢は倉庫マスタの「THOMAS 連携あり」の倉庫から出す。", "Đơn vị xuất là theo kho (1 file = 1 kho). Chỉ xuất chỉ thị xuất kho của kho đã chọn. Lựa chọn lấy từ các kho có 「THOMAS 連携あり」 trong master kho."],
        "demo_ok": ["コードの選択肢は WH00001／WH00002 の固定。倉庫マスタの「THOMAS 連携あり」の倉庫から出す。また選択が出力に効かない（どの倉庫を選んでも同じ見本）。選んだ倉庫・対象の内容を出す（配送_05 §10-4）", "Lựa chọn trong code cố định WH00001/WH00002; cần lấy từ các kho 「THOMAS 連携あり」 trong master kho. Ngoài ra lựa chọn không ảnh hưởng file xuất (chọn kho nào cũng ra cùng dữ liệu mẫu). Cần xuất đúng nội dung theo kho・đối tượng đã chọn (配送_05 §10-4)"]}
I_TGT = {"no": "3.2", "ja": "対象", "vi": "Đối tượng", "sel": ".es-field::対象", "kind": "select", "trig": "select", "req": "－",
         "len": ["選択（2週間の窓／追加分）", "Chọn (cửa sổ 2 tuần / phần bổ sung)"], "init": ["出荷日 10/12〜10/25（A・B週・10/09 送信予定）", "Ngày xuất kho 12/10〜25/10 (tuần A・B, dự kiến gửi 9/10)"],
         "ex": ["出荷日 10/12〜10/25（A・B週・10/09 送信予定）", "Cửa sổ 2 tuần A・B (xuất kho 12/10〜25/10), dự kiến gửi 9/10 — là đối tượng của file CSV"],
         "detail": ["2週間の窓（A週＋B週／C週＋D週）か、追加分（日次の拾い上げ・未送信）を選ぶ。窓＝次の14日（window_start〜window_end）、送る日＝window_start の3日前。あとからできた分・日付を変えた分は新しい版で個別に出す（配送_05 §10-1）。",
                    "Chọn cửa sổ 2 tuần (tuần A+B / C+D) hoặc phần bổ sung (nhặt hằng ngày, chưa gửi). Cửa sổ = 14 ngày tiếp theo (window_start〜window_end), ngày gửi = 3 ngày trước window_start. Phần tạo sau / đổi ngày được xuất riêng bằng phiên bản mới (配送_05 §10-1)."],
         "demo_ok": ["コードの選択肢は固定の3つ（期間・送信予定日が文字で決め打ち）。窓の期間・送信予定日は配送から計算して出す", "Các lựa chọn trong code là 3 giá trị cố định (khoảng thời gian・ngày dự kiến gửi viết cứng). Cần tính khoảng thời gian・ngày dự kiến gửi từ dữ liệu giao hàng"]}
I_RNG_S = {"no": "3.5", "ja": "出荷日（開始）", "vi": "Ngày xuất kho (bắt đầu)", "sel": "-", "kind": "date", "trig": "input", "req": "－",
           "len": "日付 yyyy-mm-dd", "init": ["未入力", "Chưa nhập"], "ex": ["2026-10-12", "Ngày bắt đầu của khoảng ngày xuất kho cần xuất CSV (yyyy-mm-dd), ví dụ 12/10/2026"],
           "detail": ["出荷指示CSVに含める出荷日の範囲の開始。「対象」（No.3.2）で選んだ中から、この日以降の出荷日の配送だけを出す。片方だけの入力でもよい（開始だけ＝この日以降すべて）。日付の入力は共通の日付入力欄（yyyy-mm-dd・カレンダー付き）。",
                      "Ngày bắt đầu của khoảng ngày xuất kho đưa vào CSV chỉ thị xuất kho. Trong phần đã chọn ở 「対象」 (No.3.2), chỉ xuất các chuyến có ngày xuất kho từ ngày này trở đi. Chỉ nhập một đầu cũng được (chỉ nhập bắt đầu = mọi ngày từ đó trở đi). Dùng ô ngày chung (yyyy-mm-dd, có lịch)."],
           "demo_ok": ["コードにない。足す（hong 2026-10-08）", "Code chưa có. Cần thêm (hong 2026-10-08)"]}
I_RNG_E = {"no": "3.6", "ja": "出荷日（終了）", "vi": "Ngày xuất kho (kết thúc)", "sel": "-", "kind": "date", "trig": "input", "req": "－", "err": ["E08"],
           "len": "日付 yyyy-mm-dd", "init": ["未入力", "Chưa nhập"], "ex": ["2026-10-18", "Ngày kết thúc của khoảng ngày xuất kho cần xuất CSV (yyyy-mm-dd), ví dụ 18/10/2026"],
           "detail": ["出荷日の範囲の終了。この日までの出荷日の配送だけを出す。開始日（No.3.5）より前の日はエラー（E08）で、項目の下に出し、CSVは出さない。",
                      "Ngày kết thúc của khoảng ngày xuất kho. Chỉ xuất các chuyến có ngày xuất kho đến hết ngày này. Ngày trước ngày bắt đầu (No.3.5) là lỗi (E08), hiện dưới ô và không xuất CSV."],
           "demo_ok": ["コードにない。足す（hong 2026-10-08）", "Code chưa có. Cần thêm (hong 2026-10-08)"]}
I_BTN_T = {"no": "3.3", "ja": "出荷指示CSVを出力（THOMAS）", "vi": "Xuất CSV chỉ thị xuất kho (THOMAS)", "sel": ".es-card .dnav button::出荷指示CSVを出力", "kind": "button", "trig": "click", "err": ["S12"],
           "detail": ["選んだ倉庫・対象の、いまの出荷指示をCSVに出す（列の定義は No.9.1）。確認用・手動連携用で、送信ではない：版を作らない・送信済にしない・locked にしない。ファイル名は倉庫コードと business_date と版を入れる。文字コード Shift_JIS。完了は S12。出力は出力の記録に残る。",
                      "Xuất CSV chỉ thị xuất kho hiện tại của kho・đối tượng đã chọn (định nghĩa cột ở No.9.1). Để kiểm tra / liên kết thủ công, không phải gửi: không tạo phiên bản, không chuyển sang đã gửi, không locked. Tên file có mã kho, business_date và phiên bản. Bảng mã Shift_JIS. Xong hiện S12. Lần xuất được ghi vào lịch sử xuất."],
           "demo_ok": ["コードは倉庫コードに倉庫ID（WH00001）を出す・ファイル名は thomas_shiporder_yyyymmdd.csv・版は rev1 固定。決定は「倉庫コード＝倉庫マスタに運営が入れる THOMAS 用コード」「ファイル名に倉庫コード・business_date・版」。トーストも「（見本・n行。実装は Shift_JIS）」を S12 に揃える", "Code đưa ID kho (WH00001) vào mã kho, tên file thomas_shiporder_yyyymmdd.csv, phiên bản cố định rev1. Quyết định: 「mã kho = mã dùng cho THOMAS do vận hành nhập ở master kho」, 「tên file có mã kho・business_date・phiên bản」. Toast 「（見本・n行。実装は Shift_JIS）」 cũng đồng nhất về S12"]}
I_BTN_Y = {"no": "3.4", "ja": "送り状用CSVを出力（ヤマト）", "vi": "Xuất CSV vận đơn (ヤマト)", "sel": ".es-card .dnav button::送り状用CSVを出力", "kind": "button", "trig": "click", "err": ["S12"],
           "detail": ["委託の引き取り便用のヤマト送り状CSV（yamato_pickup_yyyymmdd.csv）を出す（暫定の項目：No.9.2。ヤマトの確認待ち）。資材の直送用は別ファイル（AW_MSUM の yamato_material_yyyymmdd.csv）。THOMAS のCSVにヤマトの送り状に要る欄がないので別に出す。完了は S12。",
                      "Xuất CSV vận đơn ヤマト cho chuyến ủy thác đến nhận (yamato_pickup_yyyymmdd.csv; các cột tạm: No.9.2; chờ ヤマト xác nhận). Vì CSV của THOMAS không có cột cần cho vận đơn ヤマト nên xuất riêng. Xong hiện S12."],
           "open": ["ヤマトの送り状用CSVの項目（宛名・記事欄・お届け予定日・配達時間帯など）はヤマトの確認待ちの暫定（配送_10 #19）", "Các cột CSV vận đơn của ヤマト (tên người nhận・ô ghi chú・ngày giao dự kiến・khung giờ giao...) là tạm, chờ ヤマト xác nhận (配送_10 #19)"], "ask": "お客様・ヤマト運輸"}
I_NOTE = {"no": "4", "ja": "出力・送信の説明", "vi": "Giải thích xuất・gửi", "sel": ".es-card .note", "kind": "label", "trig": "show",
          "detail": ["出力は確認用・手動連携用で、出力しても locked にならないこと、文字コードは Shift_JIS（出力のときに変換）、列の順序・名前は THOMAS から届くまで暫定であることを書く。locked になるのは「送信済にする」を押したとき（初回の送信成功）だけ。",
                     "Ghi rõ: xuất chỉ để kiểm tra / liên kết thủ công, xuất xong không locked; bảng mã Shift_JIS (đổi khi xuất); thứ tự・tên cột là tạm cho tới khi THOMAS gửi định nghĩa. Chỉ locked khi bấm 「送信済にする」 (lần gửi thành công đầu tiên)."],
          "demo_ok": ["コードの文は「locked になるのは送信に成功したときだけ」。手動送信（Q4＝B）に合わせて「送信済にするを押したとき」に直す", "Câu trong code: 「locked になるのは送信に成功したときだけ」. Theo gửi thủ công (Q4 = B) sửa thành 「khi bấm 送信済にする」"]}
I_CANCEL = {"no": "4.1", "ja": "取消の説明", "vi": "Giải thích hủy", "sel": ".es-inline--info", "kind": "label", "trig": "show",
            "detail": ["「取消は数量0の新しい版を再送して打ち消します」。取消の専用の仕組み（THOMAS の取消I/F）は使わない（I/F があっても使わない・決定v2.3 #45）。列の順序・名前は THOMAS から届いたら出力の部分だけ直す。",
                       "「取消は数量0の新しい版を再送して打ち消します」. Không dùng cơ chế hủy riêng (I/F hủy của THOMAS; có I/F cũng không dùng, quyết định v2.3 #45). Khi THOMAS gửi định nghĩa cột thì chỉ sửa phần xuất."]}
I_MANUAL = {"no": "4.2", "ja": "手動の流れの案内", "vi": "Hướng dẫn quy trình thủ công", "sel": "-", "kind": "label", "trig": "show", "err": ["I135"],
            "detail": ["表の上に I135 を出す。いまの再送は手動：変更した行のCSVを出し、運営が THOMAS に登録して、登録できたら行の「送信済にする」を押す。ESが自動で送る（バッチ ship_order_send。成功→locked、失敗→failed）のはフェーズ3（将来）。",
                       "Hiện I135 phía trên bảng. Gửi lại hiện là thủ công: xuất CSV các dòng đã đổi, vận hành đăng ký vào THOMAS, đăng ký xong thì bấm 「送信済にする」 ở dòng đó. ES tự gửi (batch ship_order_send; thành công → locked, thất bại → failed) là Giai đoạn 3 (tương lai)."],
            "demo_ok": ["コードにこの案内はない。足す（hong 2026-10-07 Q4＝B）", "Code chưa có hướng dẫn này. Cần thêm (hong 2026-10-07 Q4 = B)"]}
I_HIST = {"no": "5", "ja": "送信履歴の表", "vi": "Bảng lịch sử gửi", "sel": ".es-table", "kind": "table", "trig": "view", "err": ["I01"],
          "detail": ["配送データ1件＝1行。未送信・再送待ちの行は強調する。0件は I01。列：（選択のチェック）・送信日時・対象・倉庫・件数・版・種類・結果・操作。資材・予定・確認中の配送は出荷指示に出さない（資材は THOMAS に送らない）。並びは、再送待ちを出荷日の近い順に上、送信済みを新しい順（いまの並びのとおり）。絞り込みは倉庫と状態（No.5.13・5.14）、表示件数は 10／20／50／100（既定10。No.5.15）。（hong 2026-10-07 H2）表は画面の幅の中に収め、画面全体の横スクロールは出さない（はみ出すときは表の中だけ横スクロール）。長い拠点名・コース名・倉庫名は列の幅に上限を決めて折り返す（または省略して、触れると全文をツールチップで出す）。",
                     "1 chuyến = 1 dòng. Dòng chưa gửi / 再送待ち được làm nổi bật. 0 dòng hiện I01. Cột: (ô chọn), 送信日時, 対象, 倉庫, 件数, 版, 種類, 結果, 操作. Chuyến vật tư・dự kiến・đang xác nhận không đưa vào chỉ thị xuất kho (vật tư không gửi THOMAS). Thứ tự: 再送待ち lên trên theo ngày xuất kho gần nhất, 送信済 theo mới nhất (giữ nguyên thứ tự hiện tại). Lọc theo kho và trạng thái (No.5.13・5.14), số dòng mỗi trang 10 / 20 / 50 / 100 (mặc định 10; No.5.15). (hong 2026-10-07 H2) Bảng nằm gọn trong chiều rộng màn hình, không có thanh cuộn ngang toàn trang (nếu tràn thì chỉ cuộn ngang trong bảng). Tên chi nhánh・khóa học・kho dài thì đặt giới hạn độ rộng cột và xuống dòng (hoặc rút gọn, chạm vào thì hiện toàn văn bằng tooltip)."],
          "demo_ok": ["コードの送信履歴はページ送りも絞り込みもなく全行を並べる。倉庫・状態の絞り込みと表示件数（10／20／50／100）を足す（H2）", "Lịch sử gửi trong code không có phân trang và không có lọc, liệt kê tất cả. Cần thêm lọc kho・trạng thái và số dòng mỗi trang (10 / 20 / 50 / 100) (H2)"]}
I_H_AT = {"no": "5.1", "ja": "送信日時", "vi": "Ngày giờ gửi", "sel": ".es-table th::送信日時", "kind": "label", "trig": "view",
          "detail": ["「送信済にする」を押した日時（MM/DD HH:MM）。まだなら「未送信」（グレー）。", "Ngày giờ bấm 「送信済にする」 (MM/DD HH:MM). Chưa bấm thì hiện 「未送信」 (xám)."]}
I_H_TG = {"no": "5.2", "ja": "対象", "vi": "Đối tượng", "sel": ".es-table th::対象", "kind": "link", "trig": "click",
          "detail": ["配送No（DL-…・等幅）。押すと配送データ詳細へ。下に拠点名・温度帯・食数・出荷日 → 納品日。", "Mã chuyến (DL-…, font đơn cách). Bấm mở chi tiết dữ liệu giao hàng. Dưới là tên chi nhánh・nhiệt độ・số suất・ngày xuất kho → ngày giao."]}
I_H_WH = {"no": "5.3", "ja": "倉庫", "vi": "Kho", "sel": ".es-table th::倉庫", "kind": "label", "trig": "view",
          "detail": ["倉庫名と THOMAS 用の倉庫コード（倉庫マスタ）。例 関東倉庫（KNT-01）。", "Tên kho và mã kho dùng cho THOMAS (master kho). Ví dụ 関東倉庫（TH-KANTO）."]}
I_H_CNT = {"no": "5.4", "ja": "件数", "vi": "Số lượng", "sel": ".es-table th::件数", "kind": "label", "trig": "view",
           "detail": ["その行の出荷指示の件数（配送1件につき1）。右寄せ。", "Số lượng chỉ thị của dòng (1 cho mỗi chuyến). Căn phải."]}
I_H_REV = {"no": "5.5", "ja": "版", "vi": "Phiên bản", "sel": ".es-table th::版", "kind": "label", "trig": "view",
           "detail": ["rev＋番号（例 rev1）。再送のたびに上げる（指示番号ごとに常に最新の状態を送る）。「送信済にする」を押した時点の版を送信済にする。", "rev + số (ví dụ rev1). Tăng mỗi lần gửi lại (mỗi số chỉ thị luôn gửi trạng thái mới nhất). Bấm 「送信済にする」 thì phiên bản tại thời điểm đó chuyển sang đã gửi."],
           "demo_ok": ["コードは rev1 固定（配送の版 shipRev を見ない）。配送データの版を出す", "Code cố định rev1 (không đọc phiên bản shipRev của chuyến). Cần hiển thị phiên bản của dữ liệu giao hàng"]}
I_H_KIND = {"no": "5.6", "ja": "種類", "vi": "Loại", "sel": ".es-table th::種類", "kind": "label", "trig": "view",
            "detail": ["新規／新規（子）／取消（数量0）。取消は数量0の新しい版で打ち消す。", "Mới / Mới (chuyến con) / Hủy (số lượng 0). Hủy được thực hiện bằng phiên bản mới có số lượng 0."]}
I_H_ST = {"no": "5.7", "ja": "結果", "vi": "Kết quả", "sel": ".es-table th::結果", "kind": "label", "trig": "view",
          "detail": ["バッジ：再送待ち（黄）／送信済（緑）。色は共通表（P-STATUS-COLORS）。送信失敗（赤）は No.5.8。",
                     "Badge: 再送待ち (vàng) / 送信済 (xanh lá). Màu theo bảng chung (P-STATUS-COLORS). 送信失敗 (đỏ) xem No.5.8."]}
I_H_FAIL = {"no": "5.8", "ja": "送信失敗（説明のみ・撮らない）", "vi": "Gửi thất bại (chỉ giải thích・không chụp)", "sel": "-", "kind": "label", "trig": "show",
            "detail": ["結果バッジ「送信失敗」（赤）と原因の文字を行に出す仕組み（コードの型にはある）。ESが自動で送るフェーズ3で使う：失敗しても locked にせず、再送で成功するまで published のまま（配送_05 §10-2）。いま（手動）はTHOMASへの登録をESが見ないので、この結果は出ない。仕様で決まっているエラーの流れ（外部連携_エラーの流れ）はテストの段階で疑似的に再現する（台帳 E #38）。",
                       "Cơ chế hiện badge 「送信失敗」 (đỏ) và nguyên nhân trên dòng (có trong kiểu dữ liệu của code). Dùng ở Giai đoạn 3 khi ES tự gửi: thất bại thì không locked, giữ published cho tới khi gửi lại thành công (配送_05 §10-2). Hiện tại (thủ công) ES không theo dõi việc đăng ký vào THOMAS nên kết quả này không xuất hiện. Luồng lỗi đã quy định (外部連携_エラーの流れ) sẽ được mô phỏng ở giai đoạn kiểm thử (sổ quyết định E #38)."],
            "demo_ok": ["見本データに送信失敗の行がない（コードには状態と原因欄はあるが、見本も生成する処理もない）。決定（Q5＝C）により撮らず、説明だけ書く", "Dữ liệu mẫu không có dòng gửi thất bại (code có trạng thái và cột nguyên nhân nhưng không có dữ liệu mẫu và xử lý tạo). Theo quyết định (Q5 = C) không chụp, chỉ viết giải thích"]}
I_H_CSV = {"no": "5.9", "ja": "行のCSV（送信済）", "vi": "CSV của dòng (đã gửi)", "sel": ".es-table td button::CSV", "kind": "button", "trig": "click", "err": ["S12"], "cond": ["結果が送信済の行", "Dòng có kết quả 送信済"],
           "detail": ["その版で送った内容そのものをもう一度ダウンロードする（送った時のファイル）。完了は S12。", "Tải lại đúng nội dung đã gửi ở phiên bản đó (file tại thời điểm gửi). Xong hiện S12."],
           "demo_ok": ["コードは見本のCSV（thomas_sent）を出す。その版で出したファイルをそのまま出す（配送_12 §19.6）", "Code xuất CSV mẫu (thomas_sent). Cần xuất đúng file đã xuất ở phiên bản đó (配送_12 §19.6)"]}
I_H_CSVW = {"no": "5.10", "ja": "変更した行のCSV（行のボタンはない）", "vi": "CSV các dòng đã đổi (không có nút theo dòng)", "sel": "-", "kind": "label", "trig": "show", "err": ["S12"], "cond": ["結果が再送待ちの行（変更した行）", "Dòng có kết quả 再送待ち (dòng đã đổi)"],
            "detail": ["「変更した行のCSV」は、再送待ちの行をまとめて1ファイルで出すボタン（No.3.3 の出力）で出す。そのCSVを運営がTHOMASに登録する。再送待ちの行に、行ごとの「CSV」ボタンは作らない（再送待ちの行の操作は「送信済にする」だけ・No.5.11）。完了は S12。", "CSV các dòng đã đổi được xuất bằng nút xuất gộp các dòng 再送待ち vào 1 file (No.3.3). Vận hành đăng ký CSV đó vào THOMAS. Dòng 再送待ち không có nút 「CSV」 theo từng dòng (thao tác của dòng 再送待ち chỉ có 「送信済にする」, No.5.11). Xong hiện S12."],
            "demo_ok": ["コードの再送待ちの行にはCSVのボタンがない（「再送」だけ）。決定どおり、行ごとのボタンは作らず、No.3.3 でまとめて出す", "Dòng 再送待ち trong code không có nút CSV (chỉ có 「再送」). Theo quyết định không làm nút theo dòng, xuất gộp ở No.3.3"]}
I_H_SENT = {"no": "5.11", "ja": "送信済にする", "vi": "Đánh dấu đã gửi", "sel": ".es-table td button::再送", "kind": "button", "trig": "click", "err": ["Q134", "S11", "E30", "E32"], "cond": ["結果が再送待ちの行・更新権限がある役割（経理 R は出ない）", "Dòng có kết quả 再送待ち・vai trò có quyền cập nhật (経理 R không thấy)"],
            "detail": ["運営がTHOMASにCSVを登録できたあとに押す（手動の再送・hong 2026-10-07 Q4＝B）。押すとまず確認 Q134（locked は戻せない旨）を出し、「送信済にする」を選んだときだけ次を行う（hong 2026-10-07 H4）。初回の送信（2週間の窓・多数の行）も同じ手動の流れで、行にチェックして「選択した n件を送信済にする」（No.5.17）でまとめて押せる。押すと：その版を「送信済」にして送信日時を記録し、初めてなら locked（plan lifecycle published → locked・locked_at＝押した日時）にして、ES採番の送り状（No.6）を見込みの箱数ぶん作る。2回目以降（再送）は新しい版を送信済にするだけで、locked の起点は動かさない。人が押すことが送信成功の判断になる。THOMAS は同じ指示番号の再送（rev＋1・数量0）を受け付ける（hong 回答。書面の確認は未）。成功は S11（「1件を送信済にしました。」）、失敗は E30、権限なしは E32。再送は出荷実績を受け取るまでできる。ESが自動で送る（バッチ）のはフェーズ3。",
                       "Bấm sau khi vận hành đã đăng ký CSV vào THOMAS (gửi lại thủ công, hong 2026-10-07 Q4 = B). Khi bấm trước hết hiện xác nhận Q134 (locked không hoàn tác được); chỉ khi chọn 「送信済にする」 mới thực hiện phần sau (hong 2026-10-07 H4). Lần gửi đầu (cửa sổ 2 tuần・nhiều dòng) cũng theo quy trình thủ công này; tích chọn các dòng rồi bấm 「選択した n件を送信済にする」 (No.5.17) để làm hàng loạt. Khi bấm:chuyển phiên bản đó sang 「送信済」 và ghi giờ gửi; nếu là lần đầu thì locked (plan lifecycle published → locked, locked_at = giờ bấm) và tạo vận đơn do ES đánh số (No.6) theo số thùng dự kiến. Từ lần thứ 2 (gửi lại) chỉ chuyển phiên bản mới sang đã gửi, không đổi mốc locked. Việc người bấm chính là phán đoán gửi thành công. THOMAS nhận gửi lại cùng số chỉ thị (rev+1・số lượng 0) (hong trả lời; chưa có văn bản xác nhận). Thành công hiện S11 (「1件を送信済にしました。」), thất bại E30, không có quyền E32. Gửi lại được cho tới khi nhận kết quả xuất kho. ES tự gửi (batch) là Giai đoạn 3."],
            "demo_ok": D_RESEND}
I_H_OPCELL = {"no": "5.12", "ja": "操作（再送待ちの行）", "vi": "Thao tác (dòng chờ gửi lại)", "sel": ".es-table tbody tr.att td:last-child", "kind": "label", "trig": "show", "cond": ["更新権限がない役割", "Vai trò không có quyền cập nhật"],
             "detail": ["更新権限がない役割（経理 R）は、再送待ちの行の操作欄に何も出ない（「送信済にする」「CSV」とも）。送信済の行の「CSV」は閲覧できる役割すべてに出る。", "Vai trò không có quyền cập nhật (経理 R) thì cột thao tác của dòng 再送待ち không hiện gì (cả 「送信済にする」 và 「CSV」). Nút 「CSV」 của dòng 送信済 hiện với mọi vai trò xem được."]}
_NEW_IN_CODE = ["コードにない。足す（hong 2026-10-07）", "Code chưa có. Cần thêm (hong 2026-10-07)"]
I_H_FWH = {"no": "5.13", "ja": "絞り込み（倉庫）", "vi": "Lọc (kho)", "sel": "-", "kind": "select", "trig": "select", "req": "－", "len": ["選択", "Chọn"],
           "init": ["未選択（すべて）", "Chưa chọn (tất cả)"], "ex": ["関東倉庫", "Chọn kho để lọc lịch sử gửi"],
           "detail": ["送信履歴の表を倉庫で絞る。選択肢の出どころは No.3.1 と同じ（倉庫マスタの「THOMAS 連携あり」の倉庫）。選ぶとすぐ表に反映し、ページは 1 に戻る。", "Lọc bảng lịch sử gửi theo kho. Nguồn lựa chọn giống No.3.1 (kho có 「THOMAS 連携あり」 trong master kho). Chọn xong áp dụng ngay vào bảng, trang quay về 1."],
           "demo_ok": _NEW_IN_CODE}
I_H_FST = {"no": "5.14", "ja": "絞り込み（状態）", "vi": "Lọc (trạng thái)", "sel": "-", "kind": "select", "trig": "select", "req": "－", "len": ["選択", "Chọn"],
           "init": ["未選択（すべて）", "Chưa chọn (tất cả)"], "ex": ["再送待ち", "Chọn trạng thái (再送待ち / 送信済) để lọc"],
           "detail": ["送信履歴の表を結果の状態（再送待ち／送信済）で絞る。選ぶとすぐ表に反映し、ページは 1 に戻る。", "Lọc bảng lịch sử gửi theo trạng thái kết quả (再送待ち / 送信済). Chọn xong áp dụng ngay, trang quay về 1."],
           "demo_ok": _NEW_IN_CODE}
_NEW_RNG = ["コードにない。足す（hong 2026-10-08）", "Code chưa có. Cần thêm (hong 2026-10-08)"]
I_H_RS = {"no": "5.19", "ja": "絞り込み（送信日・開始）", "vi": "Lọc (ngày gửi - bắt đầu)", "sel": "-", "kind": "date", "trig": "input", "req": "－",
          "len": "日付 yyyy-mm-dd", "init": ["未入力", "Chưa nhập"], "ex": ["2026-10-01", "Ngày bắt đầu của khoảng ngày gửi dùng để lọc lịch sử gửi (yyyy-mm-dd), ví dụ 1/10/2026"],
          "detail": ["送信履歴を送信日で絞る範囲の開始。この日以降に送った行だけを出す。片方だけの入力でもよい。日付の入力は共通の日付入力欄。決まったらすぐ表に反映し、ページは 1 に戻る。",
                     "Ngày bắt đầu của khoảng ngày gửi để lọc lịch sử gửi. Chỉ hiện các dòng gửi từ ngày này trở đi. Chỉ nhập một đầu cũng được. Dùng ô ngày chung. Chọn xong áp dụng ngay vào bảng, trang quay về 1."],
          "demo_ok": _NEW_RNG}
I_H_RE = {"no": "5.20", "ja": "絞り込み（送信日・終了）", "vi": "Lọc (ngày gửi - kết thúc)", "sel": "-", "kind": "date", "trig": "input", "req": "－", "err": ["E08"],
          "len": "日付 yyyy-mm-dd", "init": ["未入力", "Chưa nhập"], "ex": ["2026-10-09", "Ngày kết thúc của khoảng ngày gửi dùng để lọc lịch sử gửi (yyyy-mm-dd), ví dụ 9/10/2026"],
          "detail": ["送信日の範囲の終了。この日までに送った行だけを出す。開始日（No.5.19）より前の日はエラー（E08）で、項目の下に出し、表は変えない。",
                     "Ngày kết thúc của khoảng ngày gửi. Chỉ hiện các dòng gửi đến hết ngày này. Ngày trước ngày bắt đầu (No.5.19) là lỗi (E08), hiện dưới ô và bảng không đổi."],
          "demo_ok": _NEW_RNG}
I_H_PAGE = {"no": "5.15", "ja": "ページ送り・表示件数（送信履歴）", "vi": "Phân trang・số dòng mỗi trang (lịch sử gửi)", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-LIST",
            "detail": ["「n件中 a–b件」・ページ番号・表示件数（10／20／50／100件。既定10）。", "「n件中 a–b件」, số trang, số dòng mỗi trang (10 / 20 / 50 / 100; mặc định 10)."],
            "demo_ok": _NEW_IN_CODE}
I_H_CHK = {"no": "5.16", "ja": "行の選択（チェック）", "vi": "Chọn dòng (checkbox)", "sel": "-", "kind": "check", "trig": "check", "req": "－", "len": ["チェック", "Checkbox"],
           "init": ["OFF", "Tắt"], "ex": ["ON", "Bật = chọn dòng này để 「送信済にする」 hàng loạt"],
           "cond": ["結果が再送待ちの行・更新権限がある役割", "Dòng có kết quả 再送待ち・vai trò có quyền cập nhật"],
           "detail": ["再送待ちの行だけにチェックを付けられる。初回の送信のように行が多いとき、まとめて送信済にするために使う。", "Chỉ dòng 再送待ち mới tích chọn được. Dùng để 「送信済にする」 hàng loạt khi có nhiều dòng như lần gửi đầu."],
           "demo_ok": _NEW_IN_CODE}
I_H_BULK = {"no": "5.17", "ja": "選択した n件を送信済にする", "vi": "Đánh dấu đã gửi n dòng đã chọn", "sel": "-", "kind": "button", "trig": "click", "err": ["Q134", "S11", "E30", "E32"],
            "cond": ["更新権限がある役割・チェックが1件以上のとき（0件は無効）", "Vai trò có quyền cập nhật・có ít nhất 1 dòng được chọn (0 dòng thì vô hiệu)"],
            "detail": ["チェックした再送待ちの行をまとめて送信済にする。押すとまず確認 Q134（locked は戻せない旨）を出し、「送信済にする」を選んだときだけ、No.5.11 と同じ処理を選んだ行ぶん行う。成功は S11（「n件を送信済にしました。」）。（hong 2026-10-07 H4）", "Đánh dấu đã gửi hàng loạt các dòng 再送待ち đã tích. Khi bấm trước hết hiện xác nhận Q134 (locked không hoàn tác được); chỉ khi chọn 「送信済にする」 mới xử lý giống No.5.11 cho các dòng đã chọn. Thành công hiện S11 (「n件を送信済にしました。」). (hong 2026-10-07 H4)"],
            "demo_ok": _NEW_IN_CODE}
I_H_Q134 = {"no": "5.18", "ja": "送信済にする確認の小窓", "vi": "Cửa sổ xác nhận 送信済にする", "sel": "-", "kind": "modal", "trig": "show", "err": ["Q134"],
            "detail": ["No.5.11 と No.5.17 を押すと出る。文は Q134（locked は戻せない旨）。「キャンセル」で閉じるだけ、「送信済にする」で実行する。", "Hiện khi bấm No.5.11 và No.5.17. Nội dung là Q134 (locked không hoàn tác được). 「キャンセル」 chỉ đóng, 「送信済にする」 thì thực hiện."],
            "demo_ok": _NEW_IN_CODE}
I_INV = {"no": "6","ja": "ESで採番する送り状", "vi": "Vận đơn do ES đánh số", "sel": ".grid2 .es-card", "kind": "area", "trig": "view",
         "detail": ["1次が委託の引き取り便の送り状（ES採番：配送No-箱番号）。「送信済にする」を押した時点で、見込みの箱数ぶん作る。出荷実績の箱数が違えば足りない分を足し、余った分は無効にする。追跡ページのリンクは出さない。",
                    "Vận đơn của chuyến thu gom do đơn vị ủy thác ở chặng 1 (ES đánh số: 配送No-số thùng). Khi bấm 「送信済にする」 sẽ tạo theo số thùng dự kiến. Nếu số thùng ở kết quả xuất kho khác thì thêm phần thiếu và vô hiệu hóa phần thừa. Không hiện link trang tra cứu."]}
I_INV_T = {"no": "6.1", "ja": "送り状の表", "vi": "Bảng vận đơn", "sel": ".es-table.compact::作った時", "kind": "table", "trig": "view", "err": ["I01"],
           "detail": ["列：送り状番号（配送No-01・等幅）・箱（例 1 / 1）・作った時（MM/DD 出荷指示の送信）・状態（有効＝緑）。対象は出荷指示の送信済みで、直近2週間の出荷分。0件は I01。",
                      "Cột: 送り状番号 (配送No-01, font đơn cách), 箱 (ví dụ 1 / 1), 作った時 (MM/DD 出荷指示の送信), 状態 (有効 = xanh lá). Đối tượng là chuyến đã gửi chỉ thị, xuất kho trong 2 tuần gần nhất. 0 dòng hiện I01."]}
I_YAM = {"no": "7", "ja": "送り状用CSV（ヤマト）の説明", "vi": "Giải thích CSV vận đơn (ヤマト)", "sel": ".grid2 .es-card:nth-child(2)", "kind": "area", "trig": "view",
         "detail": ["委託の引き取り便用のヤマト送り状CSV（yamato_pickup_yyyymmdd.csv）を別に出す理由と項目の説明（暫定）。THOMAS のCSVに欄がないため別に出す。資材の直送用（AW_MSUM・yamato_material_yyyymmdd.csv・4列）とは別のファイル。", "Giải thích lý do xuất riêng CSV vận đơn của ヤマト và các cột (tạm). Vì CSV của THOMAS không có cột nên xuất riêng."]}
I_YAM_B = {"no": "7.1", "ja": "暫定の印", "vi": "Dấu tạm", "sel": ".es-badge::ヤマトへ確認待ち", "kind": "label", "trig": "show",
           "detail": ["「ヤマトへ確認待ちの暫定」。ヤマトの回答で項目が決まったら外す。", "「ヤマトへ確認待ちの暫定」. Bỏ dấu này khi ヤマト trả lời và chốt cột."]}
I_YAM_T = {"no": "7.2", "ja": "送り状用CSVの項目", "vi": "Các cột CSV vận đơn", "sel": ".es-table.compact::営業所止めの宛名", "kind": "table", "trig": "view",
           "detail": ["8項目（No.9.2 と同じ）：配送No／箱番号／箱数／お届け予定日（営業所に着く日。1次のリードタイムの参考値から）／営業所止め 営業所コード／宛名（受け取りに行く委託配送会社。例 栄成ロジ）／記事（拠点名と配送No）／温度帯。1行＝1箱。",
                      "8 mục (giống No.9.2): 配送No / số thùng / tổng số thùng / ngày giao dự kiến (ngày hàng tới bưu cục, tính từ lead time tham khảo của chặng 1) / mã bưu cục giữ hàng / tên người nhận (đơn vị ủy thác đến nhận, ví dụ 栄成ロジ) / ghi chú (tên chi nhánh và 配送No) / nhiệt độ. 1 dòng = 1 thùng."],
           "open": ["ヤマトの送り状項目はヤマトの確認待ち（決定v2.3 #46 の暫定案）", "Các cột vận đơn của ヤマト đang chờ ヤマト xác nhận (phương án tạm của quyết định v2.3 #46)"], "ask": "お客様・ヤマト運輸"}
I_TOAST = {"no": "10", "ja": "完了のトースト", "vi": "Toast hoàn tất", "sel": ".toast", "kind": "toast", "trig": "show", "detail": ["", ""]}

# ------------------------------------------------------------------ 項目（取込タブ）
I_IMP = {"no": "8", "ja": "取込のボタン", "vi": "Nút nhập", "sel": ".es-card .dnav", "kind": "area", "trig": "view",
         "detail": ["取込の2つのボタンと、テンプレートの2つのボタン。取込は更新権限がある役割だけ（経理 R は出ない）。取込は THOMAS・ヤマトからのファイルを手で取り込む連携（P-CSV の2ステップではない：台帳「変更なし（連携の形）」）。",
                    "2 nút nhập và 2 nút file mẫu. Nhập chỉ vai trò có quyền cập nhật (経理 R không thấy). Nhập là liên kết thủ công file từ THOMAS・ヤマト (không phải 2 bước của P-CSV: sổ quyết định 「変更なし（連携の形）」)."],
         "demo_ok": D_PERM}
I_IMP_R = {"no": "8.1", "ja": "出荷実績CSVを取り込む（THOMAS）", "vi": "Nhập CSV kết quả xuất kho (THOMAS)", "sel": ".es-card .dnav button::出荷実績CSVを取り込む", "kind": "button", "trig": "upload", "err": ["S135", "E02", "E51", "E107", "E113", "E106", "E30"],
           "detail": ["ファイルを選ぶと、その場で取り込む（確認の画面はない）。ファイル全体が不正なとき（CSVとして読めない・UTF-8でない・空・見出しの列が違う・行数の上限）は E51／E107／E113／E106 でファイル全体を拒否する。それ以外の行ごとの誤りは P-CSV どおり行ごとに検査し、エラーの行だけ取り込まない（hong 2026-10-08 H6b）（列の定義と行の処理は No.8.15・9.3〜9.7）。取り込めたら履歴の先頭に1行足し、S135 を出す。取り込めなかった行は「エラー行」で出せ、AW_RVEW の「取込エラー」にも出る。取込は更新権限（Q1＝B：物流 R/U も可）。",
                      "Chọn file thì nhập ngay (không có màn xác nhận). Khi toàn bộ file không hợp lệ (không đọc được CSV・không phải UTF-8・rỗng・sai cột tiêu đề・vượt số dòng) thì từ chối cả file bằng E51／E107／E113／E106. Lỗi từng dòng còn lại kiểm tra theo P-CSV, chỉ dòng lỗi không được nhập (hong 2026-10-08 H6b) (định nghĩa cột và xử lý dòng ở No.8.15・9.3〜9.7). Nhập xong thêm 1 dòng ở đầu lịch sử và hiện S135. Dòng không nhập được xuất bằng 「エラー行」 và cũng hiện ở 「取込エラー」 của AW_RVEW. Quyền nhập là cập nhật (Q1 = B: 物流 R/U cũng được)."],
           "demo_ok": ["コードは取り込んだ記録（履歴の行）を足すだけ：中身は読まず、成功＝行数・エラー0行で、配送の状態も変えない。決定（台帳 E #38・配送_12 §19.4）は、出荷実績 ok の行で 出荷待→出荷済、行ごとのエラーを記録、押すと流れどおりに状態が変わる。トーストの「（デモ）」表示も足す", "Code chỉ thêm 1 dòng lịch sử đã nhập: không đọc nội dung, thành công = số dòng・lỗi 0, và không đổi trạng thái chuyến. Quyết định (sổ quyết định E #38・配送_12 §19.4): dòng kết quả ok thì 出荷待 → 出荷済, ghi lỗi theo từng dòng, bấm là trạng thái thay đổi đúng luồng. Thêm cả hiển thị 「（デモ）」 ở toast"] }
I_IMP_T = {"no": "8.2", "ja": "送り状番号CSVを取り込む", "vi": "Nhập CSV số vận đơn", "sel": ".es-card .dnav button::送り状番号CSVを取り込む", "kind": "button", "trig": "upload", "err": ["S135", "E02", "E51", "E30"],
           "detail": ["No.8.1 と同じ動き。ヤマトなど配送会社の送り状番号のファイル（1箱＝1行）を取り込み、配送データに紐づける。取り込みで配送の状態は変えない。出荷指示の送信成功の記録がない配送に番号が付いたら locked にせず異常（tracking_anomaly）として AW_RVEW に出す。",
                      "Cùng cách hoạt động với No.8.1. Nhập file số vận đơn của đơn vị vận chuyển như ヤマト (1 thùng = 1 dòng) và gắn vào chuyến. Nhập không đổi trạng thái chuyến. Nếu chuyến có số vận đơn mà chưa có ghi nhận gửi chỉ thị thành công thì không locked mà báo bất thường (tracking_anomaly) ở AW_RVEW."],
           "demo_ok": D_PERM}
I_IMP_TPL1 = {"no": "8.3", "ja": "テンプレート（出荷実績）", "vi": "File mẫu (kết quả xuất kho)", "sel": ".es-card .dnav button::ひな形（出荷実績）", "kind": "button", "trig": "click", "err": ["S12"],
              "detail": ["見本ファイル（見出しの行＋例の行）を出す。列は No.9.3〜9.7。完了は S12。閲覧できる役割すべてに出る。", "Xuất file mẫu (dòng tiêu đề + dòng ví dụ). Cột ở No.9.3〜9.7. Xong hiện S12. Mọi vai trò xem được đều thấy."],
              "demo_ok": ["コードのボタン名は「ひな形（出荷実績）」。決定（hong 2026-10-08）は「テンプレート（出荷実績）」で、ほかの画面の呼び方にそろえる", "Tên nút trong code là 「ひな形（出荷実績）」. Quyết định (hong 2026-10-08): 「テンプレート（出荷実績）」, thống nhất cách gọi với các màn khác"]}
I_IMP_TPL2 = {"no": "8.4", "ja": "テンプレート（送り状番号）", "vi": "File mẫu (số vận đơn)", "sel": ".es-card .dnav button::ひな形（送り状番号）", "kind": "button", "trig": "click", "err": ["S12"],
              "detail": ["見本ファイルを出す。列は No.9.8〜9.13。完了は S12。", "Xuất file mẫu. Cột ở No.9.8〜9.13. Xong hiện S12."],
              "demo_ok": ["コードのボタン名は「ひな形（送り状番号）」。決定（hong 2026-10-08）は「テンプレート（送り状番号）」で、ほかの画面の呼び方にそろえる", "Tên nút trong code là 「ひな形（送り状番号）」. Quyết định (hong 2026-10-08): 「テンプレート（送り状番号）」, thống nhất cách gọi với các màn khác"]}
I_IMP_MSG = {"no": "8.5", "ja": "取込の説明", "vi": "Giải thích nhập", "sel": ".es-inline--info", "kind": "label", "trig": "show",
             "detail": ["「出荷実績と送り状番号を取り込みます。取り込めなかった行は…「取込エラー」に出ます。」（出し先は AW_RVEW）", "「出荷実績と送り状番号を取り込みます。…」: giải thích nhập kết quả xuất kho và số vận đơn; dòng không nhập được sẽ hiện ở mục 「取込エラー」 (AW_RVEW)."]}
I_IMP_TBL = {"no": "8.6", "ja": "取込履歴の表", "vi": "Bảng lịch sử nhập", "sel": ".es-table", "kind": "table", "trig": "view", "err": ["I01"],
             "detail": ["取込履歴は24か月保持し、表示件数は 10／20／50／100（既定10。No.8.16）。取り込んだ新しい順（新しく取り込んだ行を上）。列：取込日時・ファイル・種類・行数・成功・エラー・結果・操作。エラーがある行は強調する。0件は I01。",
                        "Sắp theo lần nhập mới nhất (dòng mới nhập ở trên). Cột: 取込日時, ファイル, 種類, 行数, 成功, エラー, 結果, 操作. Dòng có lỗi được làm nổi bật. 0 dòng hiện I01. Lưu lịch sử 24 tháng; số dòng mỗi trang 10 / 20 / 50 / 100 (mặc định 10; No.8.16) (hong 2026-10-07 H5)."],
             "demo_ok": ["コードの取込履歴は全件を並べ、保持期間もない。24か月保持し、表示件数（10／20／50／100）を足す（H5）", "Lịch sử nhập trong code liệt kê tất cả và không có thời hạn lưu. Cần lưu 24 tháng và thêm số dòng mỗi trang (10 / 20 / 50 / 100) (H5)"]}
I_IMP_PAGE = {"no": "8.16", "ja": "ページ送り・表示件数（取込履歴）", "vi": "Phân trang・số dòng mỗi trang (lịch sử nhập)", "sel": "-", "kind": "area", "trig": "view", "pattern": "P-LIST",
              "detail": ["「n件中 a–b件」・ページ番号・表示件数（10／20／50／100件。既定10）。取込履歴は24か月保持する（hong 2026-10-07 H5）。", "「n件中 a–b件」, số trang, số dòng mỗi trang (10 / 20 / 50 / 100; mặc định 10). Lưu lịch sử nhập 24 tháng (hong 2026-10-07 H5)."],
              "demo_ok": _NEW_IN_CODE}
I_IMP_AT = {"no": "8.7", "ja": "取込日時", "vi": "Ngày giờ nhập", "sel": ".es-table th::取込日時", "kind": "label", "trig": "view", "detail": ["取り込んだ日時（yyyy-mm-dd HH:MM）。", "Ngày giờ đã nhập (yyyy-mm-dd HH:MM)."]}
I_IMP_FILE = {"no": "8.8", "ja": "ファイル", "vi": "File", "sel": ".es-table th::ファイル", "kind": "label", "trig": "view", "detail": ["取り込んだファイル名（等幅）。同じファイルをもう一度流しても重複のデータを作らない（import_id）。", "Tên file đã nhập (font đơn cách). Nhập lại cùng file cũng không tạo dữ liệu trùng (import_id)."]}
I_IMP_KIND = {"no": "8.9", "ja": "種類", "vi": "Loại", "sel": ".es-table th::種類", "kind": "label", "trig": "view", "detail": ["出荷実績／送り状番号。", "出荷実績 / 送り状番号."]}
I_IMP_LINES = {"no": "8.10", "ja": "行数", "vi": "Số dòng", "sel": ".es-table th::行数", "kind": "label", "trig": "view", "detail": ["見出しを除いた、データの行の数。右寄せ。", "Số dòng dữ liệu (không tính tiêu đề). Căn phải."]}
I_IMP_OK = {"no": "8.11", "ja": "成功", "vi": "Thành công", "sel": ".es-table th::成功", "kind": "label", "trig": "view", "detail": ["受け取った行（飛ばして成功扱いにした行を含む）の数。右寄せ。", "Số dòng đã tiếp nhận (gồm dòng bỏ qua và coi là thành công). Căn phải."]}
I_IMP_NG = {"no": "8.12", "ja": "エラー", "vi": "Lỗi", "sel": ".es-table th::エラー", "kind": "label", "trig": "view", "detail": ["断った行の数。右寄せ。行ごとの理由は結果欄の下とエラー行CSVに出る。", "Số dòng bị từ chối. Căn phải. Lý do từng dòng hiện dưới cột kết quả và trong CSV dòng lỗi."]}
I_IMP_ST = {"no": "8.13", "ja": "結果", "vi": "Kết quả", "sel": ".es-table th::結果", "kind": "label", "trig": "view",
            "detail": ["バッジ：完了（緑）／一部エラー（黄）。色は共通表（P-STATUS-COLORS）。一部エラーのときは下に理由（例「配送Noが見つからない 2行」）を出す。エラーがあってもファイル全体は止めない（成功の行は取り込む）。",
                       "Badge: 完了 (xanh lá) / 一部エラー (vàng). Màu theo bảng chung (P-STATUS-COLORS). Khi 一部エラー thì hiện lý do bên dưới (ví dụ 「配送Noが見つからない 2行」). Có lỗi cũng không dừng cả file (dòng thành công vẫn được nhập)."]}
I_IMP_ERR = {"no": "8.14", "ja": "エラー行", "vi": "Dòng lỗi", "sel": ".es-table td button::エラー行", "kind": "button", "trig": "click", "err": ["S12", "E100"], "cond": ["エラーの行がある取込の行", "Dòng nhập có dòng lỗi"],
             "detail": ["断った行をCSVで出す（行番号・配送No・送り状番号・エラー）。例の理由：配送Noが見つかりません（E100 の形：{配送No}が見つかりません）。完了は S12。",
                        "Xuất CSV các dòng bị từ chối (số dòng・配送No・số vận đơn・lỗi). Ví dụ lý do: không tìm thấy 配送No (dạng E100: không tìm thấy {配送No}). Xong hiện S12."],
             "demo_ok": ["コードは見本のエラー行CSV（行17・42）を固定で出す。取り込んだファイルの断った行を出す（配送_12 §19.6）", "Code xuất CSV dòng lỗi mẫu cố định (dòng 17・42). Cần xuất đúng các dòng bị từ chối của file đã nhập (配送_12 §19.6)"]}
I_IMP_RULE = {"no": "8.15", "ja": "取込の処理の決まり", "vi": "Quy tắc xử lý nhập", "sel": "-", "kind": "label", "trig": "view", "err": ["E51", "E107", "E113", "E106", "E52"],
              "detail": ["検査のきまりは、ほかのCSV取込と同じ（hong 2026-10-08 H6b）。ファイル全体が不正なとき（CSVとして読めない・UTF-8でない・空・見出しの列が違う・行数の上限）は E51／E107／E113／E106 でファイル全体を拒否して取り込まない。ファイル全体が正しければ、行ごとの誤りは P-CSV どおり行ごとに検査し、エラーの行だけ取り込まない（ほかの行は取り込む）。エラーの行は行番号・列・内容で見せ、エラー一覧CSV（No.8.14「エラー行」）で出せる。取り込める行が1行もないときは E52 を出して止める。この画面は確認の画面を挟まず、ファイルを選ぶとその場で取り込む（連携の形は変えない）。ファイルごとに import_id を持ち、同じファイルをもう一度流しても重複しない。行ごとに処理し、ファイル全体が正しければ、1行の誤りでファイル全体を止めない。結果に受け取った／飛ばした／誤りの行数と行ごとの理由を残す。取込で起きた変更は actor＝system・correlation＝import_id で監査に残す。ファイルが選ばれなかったときは取り込まない（E02 の形：ファイルを選択してください）。",
                         "Quy tắc kiểm tra giống các CSV取込 khác (hong 2026-10-08 H6b). Khi toàn bộ file không hợp lệ (không đọc được CSV・không phải UTF-8・rỗng・sai cột tiêu đề・vượt số dòng) thì từ chối cả file bằng E51／E107／E113／E106, không nhập. Nếu file hợp lệ thì lỗi từng dòng kiểm tra theo P-CSV, chỉ dòng lỗi không được nhập (các dòng khác vẫn nhập). Dòng lỗi hiện kèm số dòng・cột・nội dung và xuất được bằng エラー一覧CSV (No.8.14 「エラー行」). Không có dòng nào nhập được thì E52 và dừng. Màn này không có bước xác nhận, chọn file là nhập ngay (giữ dạng liên kết). Mỗi file có import_id, nhập lại cùng file không bị trùng. Xử lý từng dòng, Nếu file hợp lệ thì 1 dòng lỗi không dừng cả file. Kết quả ghi số dòng tiếp nhận / bỏ qua / lỗi và lý do từng dòng. Thay đổi do nhập được ghi audit với actor = system・correlation = import_id. Không chọn file thì không nhập (dạng E02: hãy chọn file)."]}

# ------------------------------------------------------------------ 項目（CSV の列の定義。画面にない）
I_CSV = {"no": "9", "ja": "CSVの列の定義", "vi": "Định nghĩa cột CSV", "sel": "-", "kind": "area", "trig": "view",
         "detail": ["この画面で出す・取り込むCSVの列。出す：出荷指示CSV（THOMAS）No.9.1、送り状用CSV（ヤマト・委託の引き取り便用）No.9.2。取り込む：出荷実績CSV No.9.3〜9.7、送り状番号CSV No.9.8〜9.13。出力の層（列の順・名前・ヘッダー・文字コード）は分けておき、THOMAS・ヤマトの定義が届いたら出力の部分だけ直す。",
                    "Cột của các CSV xuất / nhập ở màn này. Xuất: CSV chỉ thị xuất kho (THOMAS) No.9.1, CSV vận đơn (ヤマト) No.9.2. Nhập: CSV kết quả xuất kho No.9.3〜9.7, CSV số vận đơn No.9.8〜9.13. Tách riêng tầng xuất (thứ tự・tên cột・tiêu đề・bảng mã); khi THOMAS・ヤマト gửi định nghĩa thì chỉ sửa phần xuất."]}
I_CSV_T = {"no": "9.1", "ja": "【出力】出荷指示CSV（THOMAS）の列", "vi": "[Xuất] Các cột CSV chỉ thị xuất kho (THOMAS)", "sel": "-", "kind": "label", "trig": "view",
           "open": ["列の定義・順序・文字コード（コードの20列は暫定。配送_12 §19.1 の最低限の項目）はTHOMASの定義待ち", "Định nghĩa・thứ tự cột・bảng mã (20 cột trong code là tạm; các mục tối thiểu của 配送_12 §19.1) đang chờ định nghĩa của THOMAS"], "ask": "お客様・THOMAS ベンダー",
           "detail": ["1行＝配送データの商品1行。列（暫定の順）：出荷指示No（配送No由来＋/rev番号）・倉庫コード（THOMAS用）・支店コード・ピッキング日・納品日・配送No・納品先名・住所・電話番号・温度帯（冷凍・冷蔵は別レコード）・便種別・運び手（最終区間）・配送会社コード（1次）・商品コード・数量（取消は0）・受取時間帯・納品条件・取消フラグ（0／1）・同梱資材・出荷時の特殊指示。同梱資材・特殊指示は商品マスタの値（台帳：出荷指示CSVに出す・資材の在庫は引かない）。",
                      "1 dòng = 1 dòng sản phẩm của dữ liệu giao hàng. Cột (thứ tự tạm): 出荷指示No (từ 配送No + /số rev), mã kho (cho THOMAS), mã chi nhánh, ngày lấy hàng, ngày giao, 配送No, tên nơi giao, địa chỉ, điện thoại, nhiệt độ (đông lạnh・lạnh tách bản ghi riêng), loại chuyến, đơn vị chở (chặng cuối), mã đơn vị vận chuyển (chặng 1), mã sản phẩm, số lượng (hủy = 0), khung giờ nhận, điều kiện giao, cờ hủy (0／1), vật tư kèm, chỉ dẫn đặc biệt khi xuất kho. Vật tư kèm・chỉ dẫn đặc biệt lấy từ master sản phẩm (sổ quyết định: đưa vào CSV chỉ thị xuất kho・không trừ tồn vật tư)."]}
I_CSV_Y = {"no": "9.2", "ja": "【出力】送り状用CSV（ヤマト）の列", "vi": "[Xuất] Các cột CSV vận đơn (ヤマト)", "sel": "-", "kind": "label", "trig": "view",
           "open": ["ヤマトの送り状用CSVの項目はヤマトの確認待ちの暫定（配送_10 #19）", "Các cột CSV vận đơn của ヤマト là tạm, chờ ヤマト xác nhận (配送_10 #19)"], "ask": "お客様・ヤマト運輸",
           "detail": ["暫定の8列：配送No・箱番号・箱数・お届け予定日（営業所着）・営業所止め 営業所コード・宛名（受け取る委託配送会社）・記事（拠点名・配送No）・温度帯。1行＝1箱。",
                      "8 cột tạm: 配送No, số thùng, tổng số thùng, ngày giao dự kiến (ngày tới bưu cục), mã bưu cục giữ hàng, tên người nhận (đơn vị ủy thác đến nhận), ghi chú (tên chi nhánh・配送No), nhiệt độ. 1 dòng = 1 thùng."]}
CSV_IN = [
    ("9.3", "【出荷実績】配送No（delivery_id）", "[Kết quả xuất kho] 配送No (delivery_id)", "○", "文字列（DL-yymmdd-nnnn）", ["照合キー。ない・見つからない行は断る（E100 の形）。", "Khóa đối chiếu. Dòng không có / không tìm thấy thì từ chối (dạng E100)."]),
    ("9.4", "【出荷実績】出荷日（shipped_date）", "[Kết quả xuất kho] Ngày xuất kho (shipped_date)", "○", "日付（yyyy-mm-dd）", ["実際に出荷した日。ok の行で配送の状態を 出荷待 → 出荷済 にしてこの日を入れる（出荷待でない配送は飛ばしてログに残す）。", "Ngày thực tế xuất kho. Dòng ok thì chuyển trạng thái chuyến 出荷待 → 出荷済 và ghi ngày này (chuyến không ở 出荷待 thì bỏ qua và ghi log)."]),
    ("9.5", "【出荷実績】結果（result_code）", "[Kết quả xuất kho] Kết quả (result_code)", "○", "文字列（ok／ng）", ["ok か ng。ng は状態を変えず、AW_RVEW に確認項目（shipment_result_ng）を作る。", "ok hoặc ng. ng thì không đổi trạng thái, tạo mục cần xác nhận (shipment_result_ng) ở AW_RVEW."]),
    ("9.6", "【出荷実績】出荷数量（shipped_qty）", "[Kết quả xuất kho] Số lượng xuất (shipped_qty)", "－", "整数 0〜999,999", ["任意。出荷指示の数量と違えば AW_RVEW に確認項目（qty_mismatch）を作る。数量は自動で直さない。", "Tùy chọn. Khác số lượng chỉ thị thì tạo mục cần xác nhận (qty_mismatch) ở AW_RVEW. Không tự sửa số lượng."]),
    ("9.7", "【出荷実績】備考（note）", "[Kết quả xuất kho] Ghi chú (note)", "－", "文字列 500", ["任意。例 欠品のため出荷できず。", "Tùy chọn. Ví dụ: không xuất được do hết hàng."]),
    ("9.8", "【送り状番号】配送No（delivery_id）", "[Số vận đơn] 配送No (delivery_id)", "○", "文字列（DL-yymmdd-nnnn）", ["照合キー。ない行は断る。配送が中止・取消なら断る。", "Khóa đối chiếu. Dòng không có thì từ chối. Chuyến đã 中止・取消 thì từ chối."]),
    ("9.9", "【送り状番号】送り状番号（tracking_no）", "[Số vận đơn] Số vận đơn (tracking_no)", "○", "文字列", ["ほかの配送データのものなら断る（DOMAIN_TRACKING_CONFLICT）。同じ配送データのものなら飛ばして成功扱い（同じものを2回流しても重複しない）。", "Nếu thuộc chuyến khác thì từ chối (DOMAIN_TRACKING_CONFLICT). Nếu thuộc cùng chuyến thì bỏ qua và coi là thành công (nhập 2 lần không bị trùng)."]),
    ("9.10", "【送り状番号】配送会社コード（carrier_code）", "[Số vận đơn] Mã đơn vị vận chuyển (carrier_code)", "○", "文字列", ["その配送のどれかの区間の配送会社と一致すること。合わない行は断る。", "Phải trùng với đơn vị vận chuyển của một chặng nào đó của chuyến. Không khớp thì từ chối."]),
    ("9.11", "【送り状番号】箱番号（box_no）", "[Số vận đơn] Số thứ tự thùng (box_no)", "－", "整数 1〜99", ["任意。箱の数の表示に使う。", "Tùy chọn. Dùng để hiển thị số thùng."]),
    ("9.12", "【送り状番号】箱数（box_total）", "[Số vận đơn] Tổng số thùng (box_total)", "－", "整数 1〜99", ["任意。箱の数の表示に使う。", "Tùy chọn. Dùng để hiển thị số thùng."]),
    ("9.13", "【送り状番号】出荷日時（shipped_at）", "[Số vận đơn] Ngày giờ xuất kho (shipped_at)", "－", ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ (yyyy-mm-dd HH:MM)"], ["任意。出荷の日時。出荷指示の送信成功の記録がない配送に番号が付いた行は、受け取るが locked にせず異常（tracking_anomaly）を作る。", "Tùy chọn. Ngày giờ xuất kho. Dòng của chuyến chưa có ghi nhận gửi chỉ thị thành công thì vẫn tiếp nhận nhưng không locked và tạo bất thường (tracking_anomaly)."]),
]
I_CSV_IN = [{"no": n, "ja": j, "vi": v, "sel": "-", "kind": "label", "trig": "view", "req": r, "len": l, "detail": d} for (n, j, v, r, l, d) in CSV_IN]

TAB_SEND = [I_HEAD, I_STAT, I_TABS, I_TAB1, I_TAB2, I_OUT, I_WH, I_TGT, I_RNG_S, I_RNG_E, I_BTN_T, I_BTN_Y, I_NOTE, I_CANCEL, I_MANUAL,
            I_HIST, I_H_AT, I_H_TG, I_H_WH, I_H_CNT, I_H_REV, I_H_KIND, I_H_ST, I_H_FAIL, I_H_CSV, I_H_CSVW, I_H_SENT,
            I_H_FWH, I_H_FST, I_H_RS, I_H_RE, I_H_PAGE, I_H_CHK, I_H_BULK, I_H_Q134,
            I_INV, I_INV_T, I_YAM, I_YAM_B, I_YAM_T, I_CSV, I_CSV_T, I_CSV_Y]
TAB_IMP = [I_HEAD, I_TABS, I_TAB1, I_TAB2, I_IMP, I_IMP_R, I_IMP_T, I_IMP_TPL1, I_IMP_TPL2, I_IMP_MSG, I_IMP_TBL, I_IMP_AT, I_IMP_FILE, I_IMP_KIND,
           I_IMP_LINES, I_IMP_OK, I_IMP_NG, I_IMP_ST, I_IMP_ERR, I_IMP_RULE, I_IMP_PAGE] + I_CSV_IN

def V(id, ja, vi, items, setup="", note=None, login=None, wait=500):
    v = {"id": id, "code": "AW_SHIP_001", "state": [ja, vi], "url": "/ops/delivery/list/ship-orders", "setup": (H + setup) if setup else "", "full": True, "wait": wait,
         "note": note or ["", ""], "items": items}
    if login: v["login"] = login
    return v

VIEWS = [
    V("042", "出荷指示の送信タブ（初期表示）", "Tab gửi chỉ thị xuất kho (hiển thị ban đầu)", TAB_SEND,
      note=["再送待ち（黄）・送信済（緑）の行、ES採番の送り状、ヤマトの送り状用CSVの説明。送信失敗の行は見本にないので撮らない（No.5.8・説明のみ）。再送は手動（Q4＝B）。", "Các dòng 再送待ち (vàng)・送信済 (xanh lá), vận đơn ES đánh số, giải thích CSV vận đơn ヤマト. Không có dòng gửi thất bại trong dữ liệu mẫu nên không chụp (No.5.8, chỉ giải thích). Gửi lại là thủ công (Q4 = B)."]),
    V("043", "出荷指示CSV（THOMAS）を出力（トースト）", "Xuất CSV chỉ thị xuất kho (THOMAS) (toast)",
      [I_BTN_T, dict(I_TOAST, detail=["完了は S12（「CSVを出力しました（{n}行・{ファイル名}）。」）。", "Hoàn tất hiện S12 (「CSVを出力しました（{n}行・{ファイル名}）。」), dạng toast."], err=["S12"],
                     demo_ok=["コードは「…を出力しました（見本・n行。実装は Shift_JIS）」。S12 に揃える", "Code hiện 「…を出力しました（見本・n行。実装は Shift_JIS）」. Đồng nhất về S12"])],
      setup="btn('出荷指示CSVを出力').click();await sleep(500);"),
    V("044", "送信済にする（トースト・行が送信済に）", "Đánh dấu đã gửi (toast・dòng chuyển sang 送信済)",
      [{k: v for k, v in I_H_SENT.items() if k != "chk"}, I_H_ST, dict(I_TOAST, detail=["成功は S11（「1件を送信済にしました。」）。押した行は結果が「送信済」になり、操作が「CSV」に変わる。", "Thành công hiện S11 (「1件を送信済にしました。」). Dòng vừa bấm có kết quả 「送信済」 và thao tác đổi thành 「CSV」."], err=["S11"],
                                demo_ok=["コードは「出荷指示を再送しました（新しい版）」。S11（{n}件を{操作名}しました。）に揃える", "Code hiện 「出荷指示を再送しました（新しい版）」. Đồng nhất về S11 ({n}件を{操作名}しました。)"])],
      setup="btn('再送','.es-table').click();await sleep(600);",
      note=["撮影はコードの「再送」ボタンを押している（決定の「送信済にする」の見本。ボタン名はコードの宿題）。", "Khi chụp bấm nút 「再送」 của code (mẫu của 「送信済にする」 theo quyết định; đổi tên nút là việc phải sửa trong code)."]),
    V("045", "出荷実績・送り状の取込タブ（取込履歴・一部エラー）", "Tab nhập kết quả xuất kho・vận đơn (lịch sử nhập・một phần lỗi)", TAB_IMP, setup="await tab('取込');",
      note=["取込エラーは見本（IM2：送り状番号 64行・成功62・エラー2・「配送Noが見つからない 2行」）で撮る（Q5＝C）。", "Lỗi nhập chụp bằng dữ liệu mẫu (IM2: số vận đơn 64 dòng・thành công 62・lỗi 2・「配送Noが見つからない 2行」) (Q5 = C)."]),
    V("046", "CSVを選んで取り込む（トースト・履歴の先頭に追加）", "Chọn CSV và nhập (toast・thêm vào đầu lịch sử)",
      [I_IMP_R, {k: v for k, v in I_IMP_TBL.items() if k != "chk"}, dict(I_TOAST, detail=["完了は S135（「{ファイル名}」を取り込みました（成功{m}行・エラー{k}行）。）。履歴の先頭に1行足す。", "Hoàn tất hiện S135 (「{ファイル名}」を取り込みました（成功{m}行・エラー{k}行）。). Thêm 1 dòng ở đầu lịch sử."], err=["S135"],
                                demo_ok=["コードは「取り込みました（種類 n行・エラー 0行）」で、エラーは常に0行。S135 に揃え、行ごとの結果を数える", "Code hiện 「取り込みました（種類 n行・エラー 0行）」, lỗi luôn 0 dòng. Đồng nhất về S135 và đếm kết quả từng dòng"])],
      setup="await tab('取込');fakeFile('thomas_result_20261012.csv','配送No,出荷日,結果（ok／ng）,出荷数量,備考\\nDL-261012-0011,2026-10-12,ok,48,\\nDL-261012-0012,2026-10-12,ok,36,\\n');btn('出荷実績CSVを取り込む').click();await sleep(900);",
      note=["撮影はファイル選択を代わりのファイルで行う（thomas_result_20261012.csv・2行）。", "Khi chụp, thao tác chọn file được thay bằng file giả (thomas_result_20261012.csv・2 dòng)."]),
    V("047", "エラー行CSVを出力（トースト）", "Xuất CSV dòng lỗi (toast)",
      [I_IMP_ERR, I_IMP_TPL1, I_IMP_TPL2, dict(I_TOAST, detail=["完了は S12。", "Hoàn tất hiện S12."], err=["S12"])],
      setup="await tab('取込');btn('エラー行').click();await sleep(500);"),
    V("048", "参照のみの役割（送信タブ）", "Vai trò chỉ xem (tab gửi)", [I_HEAD, I_H_CSV, I_H_OPCELL, I_BTN_T, I_BTN_Y],
      login="Ad00012",
      note=["経理（R）でログイン。再送待ちの行の操作欄に何も出ない。出力のボタンと送信済の行の「CSV」は出る。", "Đăng nhập bằng vai 経理 (R). Cột thao tác của dòng 再送待ち không hiện gì. Các nút xuất và nút 「CSV」 của dòng 送信済 vẫn hiện."]),
    V("049", "参照のみの役割（取込タブ）", "Vai trò chỉ xem (tab nhập)", [I_HEAD, I_IMP, I_IMP_TPL1, I_IMP_TPL2, {k: v for k, v in I_IMP_TBL.items() if k != "chk"}],
      login="Ad00012", setup="await tab('取込');",
      note=["経理（R）でログイン。取込の2つのボタンは出ない。テンプレート・エラー行は出る。", "Đăng nhập bằng vai 経理 (R). 2 nút nhập không hiện. File mẫu・「エラー行」 vẫn hiện."]),
]
