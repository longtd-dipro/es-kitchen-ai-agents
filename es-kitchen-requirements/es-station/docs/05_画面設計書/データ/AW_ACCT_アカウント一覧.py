# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ アカウント管理 ＞ アカウント一覧（7つのタブ・権限の割り当て・配送スタッフのパスワード再設定の代行）
元：本物の Web（app/ops/accounts・app/ops/_general/gen.ts の accounts・lib/ops/general/fromDomain.ts）、台帳 F（2026-10-06）・K（アカウントの有効・停止）・運営Web_権限表・CSV入出力_定義（アカウント一覧は CSV出力のみ）・Mail List No.3
番号は画面ごとに通し。タブ・モーダルの状態では、その状態で増える・変わる項目だけ書く。
"""

TITLE = ["アカウント一覧（AW_ACCT）", "Danh sách tài khoản (AW_ACCT)"]
SHEET = ["アカウント一覧", "Danh sách tài khoản"]
BASENAME = "画面設計書_AW_ACCT_アカウント一覧"
IMG_PREFIX = "AW_ACCT"
OUT_DIR = "AW_ACCT_アカウント一覧"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、ACCT＝アカウント一覧",
             "Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, ACCT = Danh sách tài khoản"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/accounts/page.tsx", "app/ops/_general", "lib/ops/general/fromDomain.ts", "lib/domain/areas/account.ts", "lib/domain/seed/account.ts"]

DECISIONS = [
    {"date": "2026-10-06", "target": "一覧は参照のみ",
     "q": ["アカウントの新規登録・削除・状態の変更をこの画面でするか", "Có tạo mới / xóa / đổi trạng thái tài khoản ở màn này không"],
     "a": ["しない。「新規登録」ボタンは置かない。削除はできない。見られるのはアカウント状態だけ（変更もこの画面ではしない）。アカウントの発行・停止は申込・各マスタ・法人詳細で行う", "Không. Không có nút 「新規登録」. Không xóa được. Chỉ xem trạng thái tài khoản (cũng không đổi ở màn này). Cấp phát/dừng tài khoản làm ở 申込, các マスタ, chi tiết doanh nghiệp"],
     "src": "hong 回答 2026-10-06（運営I2 #3・#4）・台帳 F・K・受付簿 No.172"},
    {"date": "2026-10-06", "target": "名前を押したときの動き",
     "q": ["名前のリンクの行き先", "Link ở tên dẫn đi đâu"],
     "a": ["運営・倉庫スタッフ＝権限（役割）を選ぶモーダル。配送スタッフ＝パスワード再設定の代行（モーダル）。拠点（法人・拠点）・委託配送・仕入先＝それぞれのマスタ・詳細の画面へ。ユーザー（アプリの利用者）＝リンクなし", "運営/倉庫スタッフ = modal chọn quyền. 配送スタッフ = modal đặt lại mật khẩu hộ. 拠点 (doanh nghiệp/điểm), 委託配送, 仕入先 = sang màn master/chi tiết tương ứng. ユーザー (người dùng app) = không có link"],
     "src": "hong 回答 2026-10-06（運営I2 #5＝B）・台帳 F・受付簿 No.172"},
    {"date": "2026-10-06", "target": "運営・倉庫スタッフの権限の割り当て",
     "q": ["権限（役割）を選ぶモーダルは残すか", "Có giữ modal chọn quyền không"],
     "a": ["現状のまま残す（コードにある。2つ以上選べる。どれかでできる操作ができる）。（hong 2026-10-06「như bạn suggest」で確認：残す）", "Giữ nguyên như hiện tại (đã có trong code; chọn được nhiều quyền, thao tác được nếu bất kỳ quyền nào cho phép). hong xác nhận 2026-10-06: giữ lại"],
     "src": "コード（RolesModal）・hong 確認 2026-10-06（提案どおり）"},
    {"date": "2026-10-06", "target": "配送スタッフのパスワード再設定の代行",
     "q": ["メールの文面は", "Nội dung email thế nào"],
     "a": ["Mail List No.3（パスワード再設定用認証コードのご案内。4桁・登録メールアドレス宛）をそのまま使う。新しいメールは作らない", "Dùng nguyên Mail List No.3 (hướng dẫn mã xác thực đặt lại mật khẩu; 4 số; gửi tới email đã đăng ký). Không tạo email mới"],
     "src": "hong 回答 2026-10-06（運営I2 #8＝A）・台帳（ドライバーのログイン／再設定の代行）"},
    {"date": "2026-10-06", "target": "権限（この画面を見られる・操作できる役割）",
     "q": ["だれが見られる・操作できるか", "Ai xem/thao tác được"],
     "a": ["フル権限・システム管理＝CRUD（権限の割り当て・再設定の代行・CSV出力）、ほかの6役割＝R（閲覧・CSV出力）", "フル権限・システム管理 = CRUD (gán quyền, đặt lại mật khẩu hộ, xuất CSV); 6 vai trò khác = R (xem, xuất CSV)"],
     "src": "hong 回答 2026-10-06・台帳 F・受付簿 No.173"},
    {"date": "2026-10-06", "target": "画面コード",
     "q": ["画面コード", "Mã màn hình"], "a": ["AW_ACCT_001", "AW_ACCT_001"], "src": "hong 回答 2026-10-06（運営I2 #9）"},
    {"date": "2026-10-07", "target": "運営アカウントの詳細・編集", "q": ["運営アカウントの詳細・編集の画面は", "Màn hình chi tiết/sửa tài khoản vận hành"], "a": ["運営のアカウントだけ詳細・編集の画面を作る（ユーザー名・メール・ロール（複数）・アカウント状態）。倉庫スタッフは運営のロールの1つ（タブをなくす）。運営アカウントは権限画面の「権限付与」で作る", "Chỉ tài khoản vận hành có màn chi tiết/sửa (tên, email, vai trò (nhiều), trạng thái). Nhân viên kho là một vai trò của vận hành (bỏ tab). Tài khoản vận hành tạo ở 「権限付与」 của màn hình quyền"], "src": "hong 回答 2026-10-07・受付簿 No.184"}
]
CHANGES = [
    {"ver": "1.1", "date": "2026-10-06", "no": ["1"], "type": "追加", "reason": ["状態を追加：0件（検索結果なし）・権限モーダルは参照のみ", "Thêm trạng thái: 0 dòng (không có kết quả tìm kiếm), modal quyền ở chế độ chỉ xem"], "impact": ["画面の動きは変更なし（既存の動きを設計書に追記）", "Hành vi màn hình không đổi (bổ sung mô tả hành vi hiện có vào tài liệu)"]},
    {"ver": "1.3", "date": "2026-10-07", "no": ["1", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "2", "4.1", "4.2"], "type": "追加", "reason": ["hong の回答・コメント（2026-10-07）への対応", "Xử lý trả lời・góp ý của hong (2026-10-07)"], "impact": ["運営アカウントの詳細・編集の画面を追加（ロール複数・倉庫スタッフは運営のロール・タブ6つ）。実装済（受付簿 No.184）", "Thêm màn chi tiết/sửa tài khoản vận hành (nhiều vai trò, nhân viên kho là vai trò vận hành, 6 tab). Đã triển khai (受付簿 No.184)"]}
]
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_ACCT_001", "ja": "アカウント一覧", "vi": "Danh sách tài khoản"},
    {"code": "AW_ACCT_002", "ja": "アカウント管理（運営）詳細", "vi": "Chi tiết tài khoản vận hành"},
    {"code": "AW_ACCT_003", "ja": "アカウント管理（運営）編集", "vi": "Sửa tài khoản vận hành"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const clickText=(sel,t,i)=>{const b=[...document.querySelectorAll(sel)].filter(x=>(x.textContent||'').includes(t))[i||0];b&&b.click();};"
    "const tab=(t)=>[...document.querySelectorAll('.tabs button')].find(b=>(b.textContent||'').trim()===t)?.click();"
    "const link=()=>document.querySelector('.tbl tbody tr .lnk')?.click();"
)

L_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：アカウント管理 ＞ アカウント一覧。タイトルは「アカウント管理（タブ名）」。見られるのは運営の全役割（操作ができるのはフル権限・システム管理だけ）。", "Breadcrumb: アカウント管理 > アカウント一覧. Tiêu đề là 「アカウント管理（tên tab）」. Mọi vai trò vận hành xem được (chỉ フル権限・システム管理 mới thao tác được)."]},
    {"no": "1.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["ヘッダーの右。開いているタブの全件（検索条件のとおり）。「新規登録」ボタンは置かない（アカウントの発行は申込・各マスタ・法人詳細から）。", "Bên phải đầu trang. Toàn bộ dòng của tab đang mở (theo điều kiện tìm kiếm). Không có nút 「新規登録」 (tài khoản được cấp từ 申込, các マスタ, chi tiết doanh nghiệp)."]},
    {"no": "2", "ja": "タブ", "vi": "Tab", "sel": ".tabs", "kind": "tab", "trig": "click", "pattern": "P-TAB",
     "detail": ["運営／拠点／ユーザー／委託配送／仕入先／配送スタッフ の6つ（倉庫スタッフは運営のロールの1つなので運営のタブに入る：hong 2026-10-07）。初期は「運営」。画面を移って戻ってもタブを覚えている。タブごとに検索条件・並び・ページを別に持つ。「拠点」は法人アカウントと拠点アカウント、「ユーザー」はアプリの利用者（U＋8桁）。", "6 tab: 運営／拠点／ユーザー／委託配送／仕入先／配送スタッフ (nhân viên kho là một vai trò của vận hành nên nằm trong tab 運営: hong 2026-10-07). Ban đầu là 「運営」. Chuyển màn rồi quay lại vẫn nhớ tab. Mỗi tab có điều kiện tìm kiếm, thứ tự, trang riêng. 「拠点」 gồm tài khoản doanh nghiệp và điểm; 「ユーザー」 là người dùng app (U + 8 số)."]},
    {"no": "3", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".es-search", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["キーワード（ユーザーID・ユーザー名）／ロール／アカウント状態（有効・無効・利用停止・削除済）／最終ログイン（期間）。削除済のアカウントは既定で出さず、状態で選ぶと出る。", "Từ khóa (ID người dùng, tên) / vai trò / trạng thái tài khoản (有効・無効・利用停止・削除済) / lần đăng nhập cuối (khoảng thời gian). Mặc định không hiện tài khoản 削除済, chọn trạng thái thì hiện."]},
    {"no": "4", "ja": "アカウントの一覧", "vi": "Danh sách tài khoản", "sel": ".tbl", "kind": "table", "trig": "view", "pattern": "P-LIST", "err": ["I01"],
     "detail": ["初期の並びはユーザーIDの昇順。1ページ 10件。0件は I01。列：ユーザーID・ユーザー名・メール・ロール・アカウント状態・最終ログイン。行の操作（削除など）は置かない（見られるのは状態だけ）。", "Sắp xếp ban đầu theo ID người dùng tăng dần. 10 dòng/trang. Nếu 0 dòng là I01. Cột: ID người dùng, tên người dùng, email, vai trò, trạng thái tài khoản, lần đăng nhập cuối. Không có thao tác xóa trên hàng (chỉ xem trạng thái)."]},
    {"no": "4.1", "ja": "ユーザー名（リンク）", "vi": "Tên người dùng (liên kết)", "sel": ".tbl .lnk", "kind": "link", "trig": "click",
     "detail": ["タブごとの動き：運営＝運営アカウントの詳細（AW_ACCT_002・状態 003）／配送スタッフ＝パスワード再設定の代行（状態 004）／拠点＝法人アカウントは法人詳細・拠点アカウントは拠点詳細／委託配送・仕入先＝それぞれのマスタの画面／ユーザー＝リンクにしない（文字だけ）。", "Hoạt động theo từng tab: vận hành = chi tiết tài khoản vận hành (AW_ACCT_002, trạng thái 003) / giao hàng = modal đặt lại mật khẩu hộ (trạng thái 004) / điểm = doanh nghiệp đi chi tiết/điểm đi chi tiết / giao hàng được ủy thác/nhà cung cấp = sang màn master tương ứng / người dùng = không liên kết (chỉ text)."]},
    {"no": "4.2", "ja": "ロール", "vi": "Vai trò", "sel": ".tbl th::ロール", "kind": "label", "trig": "view",
     "detail": ["運営はつけた権限名（倉庫スタッフも権限名の1つ）（2つ以上はカンマで並べる）。ユーザータブは「アプリユーザー」。", "Tab 運営: tên các quyền đã gán (từ 2 quyền trở lên cách nhau bằng dấu phẩy). Tab ユーザー: 「アプリユーザー」."]},
    {"no": "4.3", "ja": "アカウント状態", "vi": "Trạng thái tài khoản", "sel": ".tbl th::アカウント状態", "kind": "label", "trig": "view",
     "detail": ["バッジ。有効／無効／利用停止／削除済 など。この画面では変えられない。", "Huy hiệu. Có hiệu lực / vô hiệu / tạm dừng / đã xóa v.v. Không thể thay đổi trên màn hình này."]},
    {"no": "4.4", "ja": "最終ログイン", "vi": "Lần đăng nhập cuối", "sel": ".tbl th::最終ログイン", "kind": "label", "trig": "view",
     "detail": ["yyyy-mm-dd HH:MM。まだログインしていなければ「—」。", "yyyy-mm-dd HH:MM. Nếu chưa đăng nhập thì \"—\"."]},
    {"no": "5", "ja": "ページ送り", "vi": "Phân trang", "sel": ".pager", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["P-LIST のとおり（10／20／50件）。", "Theo P-LIST (10/20/50 dòng)."]},
]

U_ITEMS = [
    {"no": "1", "ja": "ユーザータブ", "vi": "Tab người dùng", "sel": ".tabs button.on", "kind": "tab", "trig": "click", "pattern": "P-TAB",
     "detail": ["アプリの利用者（U＋8桁）の一覧。列は同じ。ロールは「アプリユーザー」。名前はリンクにしない（アプリの利用者の操作は法人Web・アプリ側）。", "Danh sách người dùng app (U+8 chữ số). Cột như nhau. Vai trò là \"Người dùng app\". Tên không phải liên kết (thao tác của người dùng app được làm trên Web doanh nghiệp/app)."]},
]

R_ITEMS = [
    {"no": "1", "ja": "ヘッダー（詳細）", "vi": "Đầu trang (chi tiết)", "sel": ".ph", "kind": "area", "trig": "view",
     "detail": ["パンくず：アカウント管理 ＞ アカウント管理（運営） ＞ アカウント管理（運営）詳細。タイトル「アカウント管理（運営）詳細 {ユーザーID}」。右に「編集」（フル権限・システム管理だけ。ほかの役割には出さない）。運営のアカウントだけにこの画面がある（ほかのタブは今までどおり）。運営のアカウントは権限画面の「権限付与」で作る（この一覧に新規登録は置かない：hong 2026-10-07）。", "Breadcrumb: アカウント管理 > アカウント管理（運営） > chi tiết. Tiêu đề 「アカウント管理（運営）詳細 {ID người dùng}」. Bên phải có 「編集」 (chỉ フル権限・システム管理). Chỉ tài khoản vận hành có màn hình này (các tab khác như cũ). Tài khoản vận hành được tạo ở 「権限付与」 của màn hình quyền (danh sách này không có đăng ký mới: hong 2026-10-07)."]},
    {"no": "2", "ja": "基本情報（表示）", "vi": "Thông tin cơ bản (hiển thị)", "sel": ".card", "kind": "area", "trig": "view",
     "detail": ["ユーザーID・ユーザー名・メール・ロール（チップ。倉庫スタッフもロールの1つ）・アカウント状態・最終ログイン。すべて表示だけ。", "ID người dùng, tên người dùng, email, vai trò (chip; nhân viên kho cũng là một vai trò), trạng thái tài khoản, lần đăng nhập cuối. Tất cả chỉ hiển thị."]},
]

E_ITEMS = [
    {"no": "1", "ja": "運営アカウントの編集", "vi": "Sửa tài khoản vận hành", "sel": ".card", "kind": "area", "trig": "click", "pattern": "P-FORM", "err": ["Q02", "S01", "E30", "E31", "E262"],
     "detail": ["タイトル「アカウント管理（運営）編集 {ユーザーID}」。「キャンセル」「保存」。入力を変えてキャンセルしたら Q02。成功したら S01 を出して詳細へ戻る。ほかの人が先に保存していたら E31。「権限付与」を編集できる運営アカウントが1人もいなくなる保存はできない（E262）。", "Tiêu đề 「アカウント管理（運営）編集 {ID người dùng}」. 「キャンセル」「保存」. Đã sửa mà hủy thì hiện Q02. Thành công hiện S01 rồi quay lại chi tiết. Nếu người khác đã lưu trước thì E31. Không lưu được nếu sẽ không còn tài khoản vận hành nào sửa được 「権限付与」 (E262)."]},
    {"no": "1.1", "ja": "ユーザーID", "vi": "ID người dùng", "sel": "-", "kind": "label", "trig": "view", "detail": ["変えられない（表示だけ）。", "Không thể đổi (chỉ hiển thị)."]},
    {"no": "1.2", "ja": "ユーザー名", "vi": "Tên người dùng", "sel": "-", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "ex": ["中村 幸子", "Nakamura Sachiko"], "err": ["E01", "E04"], "detail": ["運営の担当者の名前。", "Tên người phụ trách vận hành."]},
    {"no": "1.3", "ja": "メール", "vi": "Email", "sel": "-", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "ex": ["sample@sample.com", "sample@sample.com"], "err": ["E01", "E07", "E09"], "detail": ["ログイン案内・認証コードの宛先。ほかのアカウントと同じアドレスは登録できない。", "Địa chỉ nhận hướng dẫn đăng nhập/mã xác thực. Không đăng ký trùng với tài khoản khác."]},
    {"no": "1.4", "ja": "ロール", "vi": "Vai trò", "sel": "-", "kind": "select", "trig": "select", "req": "○", "len": ["選択（複数・権限画面の権限名）", "Chọn (nhiều, tên quyền ở màn hình quyền)"], "ex": ["フル権限・CS・商品管理", "フル権限・CS・商品管理"], "err": ["E02", "E262"], "detail": ["権限画面（AW_PERM）の権限名から複数選ぶ（チップ・×で外す）。倉庫スタッフも権限名の1つ。2つ以上選ぶと、どれかの権限でできる操作ができる。1つ以上必須。", "Chọn nhiều từ tên quyền của màn hình quyền (AW_PERM) (chip, ×để bỏ). Nhân viên kho cũng là một tên quyền. Chọn từ 2 quyền trở lên thì làm được thao tác của bất kỳ quyền nào. Bắt buộc từ 1."]},
    {"no": "1.5", "ja": "アカウント状態", "vi": "Trạng thái tài khoản", "sel": "-", "kind": "select", "trig": "select", "req": "○", "len": ["選択（有効／無効）", "Chọn (có hiệu lực / vô hiệu)"], "ex": ["有効", "Có hiệu lực"], "err": ["E01"], "detail": ["「無効」にするとログインできなくなる。", "Chọn 「無効」 thì không đăng nhập được."]},
    {"no": "1.6", "ja": "最終ログイン", "vi": "Lần đăng nhập cuối", "sel": "-", "kind": "label", "trig": "view", "detail": ["最後にログインした日時（表示だけ）。まだなら「—」。", "Ngày giờ đăng nhập gần nhất (chỉ hiển thị). Chưa có thì \"—\"."]},
]

D_ITEMS = [
    {"no": "1", "ja": "再設定の代行モーダル", "vi": "Modal đặt lại mật khẩu hộ", "sel": ".ov .mbox", "kind": "modal", "trig": "click", "err": ["S185", "E30"],
     "detail": ["タイトル「{名前}（{ログインID}）」。「登録メールアドレスへ4桁の認証コードを送ります。ドライバーはアプリの「パスワードリセット」でコードと新しいパスワードを入れます。」と説明。「閉じる」「パスワード再設定を代行」。代行は運営の「委託配送管理」の権限がある役割だけに出す。", "Tiêu đề 「{tên} ({ID đăng nhập})」. Giải thích: 「Gửi mã xác thực 4 số tới email đã đăng ký. Tài xế nhập mã và mật khẩu mới ở 「パスワードリセット」 trong app」. Nút 「閉じる」「パスワード再設定を代行」. Chỉ hiện với vai trò có quyền 「委託配送管理」."]},
    {"no": "1.1", "ja": "パスワード再設定を代行", "vi": "Đặt lại mật khẩu hộ", "sel": ".mbox-f .btn.pri", "kind": "button", "trig": "click", "err": ["S185", "E30"],
     "detail": ["押すと登録メールアドレスへ認証コード（Mail List No.3。4桁・有効5分）を送り、S185 を出して閉じる。", "Gửi mã xác thực tới email đã đăng ký (Mail List No.3; 4 chữ số; hết hạn 5 phút), hiện S185 rồi đóng."]},
]


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500, login=None):
    v = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}
    if login:
        v["login"] = login
    return v




# >>> review additions（役割レビューの指摘：0件・参照のみ・入力エラーの状態。2026-10-06）
I_005 = [
    {"no": "1", "ja": "0件の表示", "vi": "Hiển thị 0 bản ghi", "sel": ".tbl, .empty", "kind": "area", "trig": "view", "pattern": "P-LIST", "err": ["I01"], "detail": ["検索条件に合うアカウントがないとき、一覧の中に I01「表示するデータがありません。」を出す（P-LIST）。条件は「クリア」で戻せる。", "Khi không có tài khoản nào khớp điều kiện tìm kiếm, hiển thị I01「表示するデータがありません。」trong danh sách (P-LIST). Có thể khôi phục điều kiện bằng 「クリア」."]},
]
I_006 = [
    {"no": "1", "ja": "詳細は参照のみ（編集のボタンなし）", "vi": "Chi tiết chỉ xem (không có nút sửa)", "sel": ".ph", "kind": "area", "trig": "view", "cond": ["権限付与の閲覧だけの役割（経理など）", "Vai trò chỉ được xem 「権限付与」 (ví dụ Kế toán (「経理」))"], "detail": ["運営アカウントの詳細は見られるが、右の「編集」は出さない。", "Xem được chi tiết tài khoản vận hành nhưng không hiện nút 「編集」 bên phải."]},
]
# <<< review additions

I_008 = [
    {"no": "1", "ja": "必須の入力エラー", "vi": "Lỗi nhập bắt buộc", "sel": ".card", "kind": "area", "trig": "view", "err": ["E01", "E07"], "detail": ["ユーザー名を空にして「保存」を押すと、項目の下に E01 を出して赤枠にする。メールの形式が違うときは E07、ほかのアカウントと同じなら E09。保存しない。", "Để trống tên người dùng rồi nhấn 「保存」 thì hiện E01 dưới ô và viền đỏ. Email sai định dạng thì E07, trùng tài khoản khác thì E09. Không lưu."]},
]

VIEWS = [
    V("001", "AW_ACCT_001", "初期表示（運営タブ）", "Ban đầu (tab 運営)", "/ops/accounts", L_ITEMS),
    V("002", "AW_ACCT_001", "ユーザータブ", "Tab ユーザー", "/ops/accounts", U_ITEMS, setup="tab('ユーザー'); await sleep(400);"),
    V("003", "AW_ACCT_002", "運営アカウントの詳細", "Chi tiết tài khoản vận hành", "/ops/accounts", R_ITEMS, setup="link(); await sleep(900);"),
    V("004", "AW_ACCT_001", "再設定の代行（配送スタッフ）", "Đặt lại mật khẩu hộ (配送スタッフ)", "/ops/accounts", D_ITEMS, setup="tab('配送スタッフ'); await sleep(400); link(); await sleep(500);"),
    V("005", "AW_ACCT_001", "0件（検索結果なし）", "0 bản ghi (không có kết quả tìm kiếm)", "/ops/accounts", I_005, setup="const kw=document.querySelector('.es-search input'); if(kw){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(kw,'zzzzzz'); kw.dispatchEvent(new Event('input',{bubbles:true})); await sleep(200); clickText('button','検索'); await sleep(600);}"),
    V("006", "AW_ACCT_002", "詳細は参照のみ（閲覧の権限だけ）", "Chi tiết chỉ xem (chỉ có quyền xem)", "/ops/accounts", I_006, setup="document.querySelector('.tbl tbody tr .lnk')?.click(); await sleep(900);", login="Ad00012"),
    V("007", "AW_ACCT_003", "運営アカウントの編集", "Sửa tài khoản vận hành", "/ops/accounts", E_ITEMS, setup="link(); await sleep(900); clickText('button','編集'); await sleep(900);"),
    V("008", "AW_ACCT_003", "入力エラー", "Lỗi nhập", "/ops/accounts", I_008, setup="link(); await sleep(900); clickText('button','編集'); await sleep(900); const n=document.querySelector('input'); const inputs=[...document.querySelectorAll('input')].filter(i=>!i.disabled&&!i.readOnly); if(inputs[0]){Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(inputs[0],''); inputs[0].dispatchEvent(new Event('input',{bubbles:true}));} clickText('button','保存'); await sleep(500);"),
]
