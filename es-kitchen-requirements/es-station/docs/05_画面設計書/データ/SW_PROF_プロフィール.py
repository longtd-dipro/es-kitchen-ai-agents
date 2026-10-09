# -*- coding: utf-8 -*-
"""
仕入先Web プロフィール（SW_PROF）の画面設計書データ。元：本物の Web（app/supplier/(app)/profile/page.tsx・lib/supplier/service.ts・app/api/supplier/suppliers/[id]）。
決定：docs/決定台帳.md F「仕入先のプロフィール」（2026-10-07：口座・インボイスはシステムに持たない／変更できるのは連絡先（電話・メール・担当者・住所）だけ／変更したら運営へ通知・承認なし）、
F「パスワードの扱い」（ログイン中のパスワード変更の画面は置かない）、I「仕入先のアカウント・申込」（1社1アカウント・担当者は複数・メインは削除不可）・「仕入先に見せる金額」、受付簿 No.290〜295。
洗い出し：docs/05_画面設計書/確認メモ_SW_仕入先.md（回答 2026-10-07 つき）。
コードが決定に追いついていないところは demo_ok（宿題）：運営への通知／保存の入力チェック（H16）／同時編集（H18）／名前・文言（H8・H15）。
"""

TITLE = ["プロフィール（SW_PROF）", "Hồ sơ (SW_PROF)"]
SHEET = ["プロフィール", "Hồ sơ"]
BASENAME = "画面設計書_SW_PROF_プロフィール"
IMG_PREFIX = "SW_PROF"
OUT_DIR = "仕入先Web"
CODE_NOTE = ["Screen Code は台帳 F の決まり：SW_<機能略>_<3桁>。表示と編集は1つの画面で切り替える（コードの作り）", "Screen Code theo 台帳 F: SW_<mã chức năng>_<3 chữ số>. Xem và sửa chuyển trong cùng một màn hình (theo cách làm của code)"]
SITE = "supplier"
SYSTEM = {"ja": "仕入先Web", "vi": "Web nhà cung cấp (仕入先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "supplier", "loginId": "SP00001"}
CODE_PATHS = ["app/supplier", "lib/supplier", "lib/domain/seed", "mocks/supplier", "app/api/supplier"]


def X(no, ja, vi, sel, kind, trig="view", req=None, ln=None, init=None, ex=None, cond=None, valid=None, err=None, detail=None, pattern=None, fid=None, demo_ok=None, op=None, ask=None):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    for k, v in (("req", req), ("len", ln), ("pattern", pattern), ("fid", fid), ("ask", ask)):
        if v is not None:
            d[k] = v
    for k, v in (("init", init), ("ex", ex), ("cond", cond), ("valid", valid), ("detail", detail), ("demo_ok", demo_ok), ("open", op)):
        if v is not None:
            d[k] = list(v)
    if err:
        d["err"] = list(err)
    return d


DECISIONS = [
    {"date": "2026-10-08", "target": "SW_PROF_001 No.15（住所検索）", "q": ["住所検索のデータの出どころ", "Nguồn dữ liệu của 「住所検索」"],
     "a": ["日本郵便が公開している郵便番号データ（無料）をシステムに取り込む。全サイト共通（決める人は hong）", "Nhập vào hệ thống dữ liệu mã bưu điện do Japan Post công bố (miễn phí). Dùng chung mọi site (người quyết định là hong)"],
     "src": "hong 回答 2026-10-08（確認表 H-14・台帳 S・受付簿 #429）"},
    {"date": "2026-10-07", "target": "SW_PROF_001 全体", "q": ["プロフィールで仕入先が直せる項目の範囲", "Phạm vi mục nhà cung cấp tự sửa được ở hồ sơ"],
     "a": ["変更できるのは連絡先（電話・メール・担当者・住所）だけ。会社名・仕入先ID・取引条件・単価は見るだけ。口座・インボイスはシステムに持たないので画面に出さない。承認は挟まない", "Chỉ sửa được thông tin liên hệ (điện thoại・email・người phụ trách・địa chỉ). Tên công ty・ID nhà cung cấp・điều kiện giao dịch・đơn giá chỉ xem. Tài khoản ngân hàng・hóa đơn đủ điều kiện không có trong hệ thống nên không hiện. Không qua phê duyệt"],
     "src": "hong 回答 2026-10-07（確認メモ_SW Q3・台帳 F「仕入先のプロフィール」・受付簿 No.294）"},
    {"date": "2026-10-07", "target": "SW_PROF_001 No.2・No.13.2", "q": ["変更したときの運営への知らせ", "Thông báo cho 運営 khi có thay đổi"],
     "a": ["変更したら運営へ通知する（承認なし）。担当者のメールを変えると認証コードの送り先も変わるので、運営が気づけるようにする。通知の出し方（運営Web のどこに出すか）は運営H（仕入先マスタ）で決める", "Khi có thay đổi thì thông báo cho 運営 (không phê duyệt). Đổi email người phụ trách sẽ đổi nơi nhận mã xác thực nên 運営 cần biết. Cách thông báo (hiện ở đâu trong 運営Web) sẽ quyết ở 運営H (master nhà cung cấp)"],
     "src": "hong 回答 2026-10-07（確認メモ_SW Q3・台帳 F）。通知先の画面は運営H の宿題"},
    {"date": "2026-10-07", "target": "SW_PROF_001 No.7.2〜7.5", "q": ["出荷できる曜日・標準の配送方法・標準の運送会社・保有している許可・認証を仕入先が直せるか", "Nhà cung cấp có sửa được ngày giao được・phương thức giao chuẩn・hãng vận chuyển chuẩn・giấy phép chứng nhận không"],
     "a": ["直せない（見るだけ）。連絡先ではなく取引条件・会社情報として扱う。変えたいときは ESキッチンへ連絡する", "Không sửa được (chỉ xem). Coi là điều kiện giao dịch・thông tin công ty chứ không phải thông tin liên hệ. Muốn đổi thì liên hệ ESキッチン"],
     "src": "hong 回答 2026-10-07「ok hết」（台帳 F「仕入先のプロフィールの見るだけの範囲・一括機能」H-6：出荷できる曜日・標準の配送方法・標準の運送会社・保有している許可・認証・法人番号は見るだけ。確認メモ B-2）"},
    {"date": "2026-10-07", "target": "SW_PROF_001 No.1.2", "q": ["パスワードの再設定の入口", "Lối vào đặt lại mật khẩu"],
     "a": ["プロフィールにはパスワードの項目・ボタンを置かない。再設定はログイン画面の「パスワードを忘れた方」から（認証コード4桁・5分）", "Không đặt mục/nút mật khẩu ở hồ sơ. Đặt lại từ 「パスワードを忘れた方」 ở màn hình đăng nhập (mã xác thực 4 chữ số, 5 phút)"],
     "src": "台帳 F「パスワードの扱い」（ログイン中のパスワード変更の画面は置かない・再設定は4桁の認証コード）。確認メモ B-3"},
    {"date": "2026-10-07", "target": "SW_PROF_001 No.6", "q": ["担当者の数と削除", "Số người phụ trách và việc xóa"],
     "a": ["1社1アカウント・担当者は複数。メイン担当者は削除できず、サブ担当者は追加・削除できる。発注メールの宛先はメイン担当者とサブ担当者の全員", "1 công ty 1 tài khoản, nhiều người phụ trách. Người phụ trách chính không xóa được, người phụ trách phụ thêm/xóa được. Email đặt hàng gửi cho cả người chính và phụ"],
     "src": "台帳 I・仕様 55 §5-11（メール一覧 §0「宛先」）"},
]

CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = ".app{height:auto!important;min-height:100vh}.main{overflow:visible!important}"
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "SW_PROF_001", "ja": "プロフィール", "vi": "Hồ sơ"},
]

_J = """const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const lab=f=>((f.querySelector('label')||{}).textContent||'').replace(/必須|任意/g,'').trim();
const fld=l=>[...document.querySelectorAll('.fld')].find(f=>lab(f)===l);
const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};
const fill=(l,v)=>setv(fld(l).querySelector('input,select,textarea'),v);
const cell=(r,c)=>document.querySelectorAll('table.tbl')[0].querySelectorAll('tbody tr')[r].querySelectorAll('input')[c];
const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);
await sleep(700);
"""
_EDIT = _J + "btn('編集する').click(); await sleep(300); "

VIEWS = [
    {"id": "001", "code": "SW_PROF_001", "state": ["表示", "Xem"],
     "url": "/supplier/profile", "full": True, "wait": 700, "setup": "",
     "note": ["SP00001（株式会社サンプル商事）。メイン担当者とサブ担当者がいる。表示のときは全部読み取り専用で、「編集する」を押すと連絡先の欄だけ入力できる。", "SP00001 (株式会社サンプル商事). Có người phụ trách chính và phụ. Khi xem tất cả chỉ đọc, bấm 「編集する」 thì chỉ các ô liên hệ nhập được."],
     "items": [
         X("1", "ページ見出し", "Tiêu đề trang", ".ph", "area"),
         X("1.1", "画面名", "Tên màn hình", ".ph h1", "label", init=("プロフィール", "「プロフィール」")),
         X("1.2", "編集する", "Nút 「編集する」", ".ph button::編集する", "button", "click", detail=("押すと、直せる欄（白い入力欄）が入力できるようになり、下に「キャンセル」「保存する」が出る。パスワードの項目・再設定のボタンはこの画面に置かない（再設定はログイン画面から・台帳 F）。", "Bấm thì các ô sửa được (ô nhập màu trắng) nhập được và phía dưới hiện 「キャンセル」「保存する」. Không đặt mục mật khẩu/nút đặt lại ở màn hình này (đặt lại từ màn hình đăng nhập, 台帳 F).")),
         X("2", "説明の帯", "Dải giải thích", ".notice.pur", "label", detail=("「連絡先（電話・メール・担当者・住所）は変更できます。変更すると ESキッチンに通知されます。そのほかの項目は見るだけです（変更は ESキッチンへお問い合わせください）。」承認は挟まず、保存するとそのまま運営のマスタに入る。", "「連絡先（電話・メール・担当者・住所）は変更できます。変更すると ESキッチンに通知されます。そのほかの項目は見るだけです（変更は ESキッチンへお問い合わせください）。」 Không qua phê duyệt, lưu xong vào master của 運営 ngay."),
           demo_ok=("コード：帯の文言は「運営の「仕入先マスタ」に登録されている内容です。「編集する」で、連絡先（電話・メール・担当者・住所）を更新できます（保存すると運営のマスタに反映されます）。」で、「変更すると ESキッチンに通知されます」「そのほかの項目は見るだけです」の案内がない（profile/page.tsx）。決定：台帳 F 2026-10-07", "Code: câu trên dải là 「運営の「仕入先マスタ」に登録されている内容です。「編集する」で、連絡先（電話・メール・担当者・住所）を更新できます（保存すると運営のマスタに反映されます）。」, không có câu 「変更すると ESキッチンに通知されます」「そのほかの項目は見るだけです」 (profile/page.tsx). Quyết định: 台帳 F 2026-10-07")),
         X("3", "基本情報", "Thông tin cơ bản", "h2::基本情報^", "area", detail=("見るだけ。口座・インボイス登録番号はシステムに持たないので出さない（台帳 F 2026-10-07）。", "Chỉ xem. Không hiện tài khoản ngân hàng・số hóa đơn đủ điều kiện vì hệ thống không giữ (台帳 F 2026-10-07).")),
         X("3.1", "仕入先ID", "ID nhà cung cấp", ".fld::仕入先ID", "label", detail=("SP＋5桁。ログインIDと同じ。変えられない。", "SP + 5 số. Giống ID đăng nhập. Không đổi được.")),
         X("3.2", "会社名（仕入先名）", "Tên công ty (tên nhà cung cấp)", ".fld::会社名（仕入先名）", "label", detail=("見るだけ（変更は ESキッチンへ）。ヘッダーの「{会社名} 様」と同じ。", "Chỉ xem (đổi thì liên hệ ESキッチン). Giống 「{会社名} 様」 ở header.")),
         X("3.3", "会社名フリガナ", "Furigana tên công ty", ".fld::会社名フリガナ", "label", detail=("見るだけ。", "Chỉ xem.")),
         X("3.4", "代表者名", "Tên người đại diện", ".fld::代表者名", "label", detail=("見るだけ。", "Chỉ xem.")),
         X("3.5", "法人番号", "Mã số pháp nhân", ".fld::法人番号", "label", detail=("13桁。見るだけ。", "13 chữ số. Chỉ xem.")),
         X("3.6", "ステータス", "Trạng thái", ".fld::ステータス", "label", detail=("運営の仕入先マスタの状態（本登録など）。見るだけ。", "Trạng thái trong master nhà cung cấp của 運営 (本登録...). Chỉ xem.")),
         X("3.7", "取引開始日", "Ngày bắt đầu giao dịch", ".fld::取引開始日", "label", detail=("yyyy-mm-dd。見るだけ。", "yyyy-mm-dd. Chỉ xem.")),
         X("3.8", "最終ログイン", "Lần đăng nhập gần nhất", ".fld::最終ログイン", "label", detail=("yyyy-mm-dd HH:MM（JST）。見るだけ。", "yyyy-mm-dd HH:MM (JST). Chỉ xem.")),
         X("4", "仕入れ先の区分・取扱", "Loại nhà cung cấp và hàng xử lý", "h2::仕入れ先の区分・取扱^", "area", detail=("見るだけ。区分は商品ごとに決まり、1社で通常商品と短消費期限商品の両方を扱える（台帳 I）。", "Chỉ xem. Loại xác định theo sản phẩm; 1 công ty xử lý được cả hàng thường và hàng hạn ngắn (台帳 I).")),
         X("4.1", "仕入れ先区分", "Loại nhà cung cấp", ".fld::仕入れ先区分", "label", detail=("通常商品・短消費期限商品・資材のうち、扱うもの（複数）。運営が商品マスタで決める。", "Các loại xử lý (nhiều) trong 通常商品・短消費期限商品・資材. 運営 quyết ở master sản phẩm.")),
         X("4.2", "作れる商品", "Hàng sản xuất được", ".fld::作れる商品", "label", detail=("申込のときに選んだ商品のジャンル。見るだけ。", "Thể loại hàng đã chọn lúc đăng ký. Chỉ xem.")),
         X("4.3", "保有している許可・認証", "Giấy phép・chứng nhận đang có", ".fld::保有している許可・認証", "label", detail=("見るだけ（変更は ESキッチンへ・自己決定 B-2）。", "Chỉ xem (đổi thì liên hệ ESキッチン, tự quyết B-2).")),
         X("5", "会社情報", "Thông tin công ty", "h2::会社情報^", "area"),
         X("5.1", "郵便番号", "Mã bưu điện", ".fld::郵便番号", "text", "input", req="○", ln=["文字列 8（数字7桁）", "Chuỗi 8 (7 chữ số)"], ex=("103-0027", "7 chữ số, có thể có dấu gạch ngang"), err=["E01", "E05"], detail=("連絡先なので編集できる。数字7桁・ハイフンは任意。保存は 123-4567 の形。", "Là thông tin liên hệ nên sửa được. 7 chữ số, gạch ngang tùy chọn. Lưu dạng 123-4567."), demo_ok=("コード：郵便番号は必須だけで、数字7桁の形式の確認がない（profile/page.tsx の save。「入力してください」）", "Code: mã bưu điện chỉ kiểm tra bắt buộc, không kiểm tra 7 chữ số (save ở profile/page.tsx, câu 「入力してください」)")),
         X("5.2", "代表電話番号", "Số điện thoại đại diện", ".fld::代表電話番号", "text", "input", req="○", ln=["文字列 20（数字とハイフン）", "Chuỗi 20 (số và gạch ngang)"], ex=("03-1234-5678", "Số và dấu gạch ngang, 10〜11 chữ số"), err=["E01", "E06"], detail=("編集できる。数字とハイフン（ハイフンを除いて10〜11桁）。", "Sửa được. Số và gạch ngang (bỏ gạch còn 10〜11 chữ số).")),
         X("5.3", "本社住所", "Địa chỉ trụ sở", ".fld::本社住所", "text", "input", req="○", ln="文字列 255", ex=("東京都中央区日本橋1-2-3", "Địa chỉ trụ sở (tối đa 255 ký tự)"), err=["E01", "E04"], detail=("編集できる。郵便番号を入れて「住所検索」を押すと住所を入れる（全システム共通のボタン・状態 002 の No.15）。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Sửa được. Nhập mã bưu điện rồi bấm 「住所検索」 để điền địa chỉ (nút chung toàn hệ thống, No.15 ở trạng thái 002). Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("6", "担当者情報", "Thông tin người phụ trách", "h2::担当者情報^2", "area", detail=("1社1アカウント・担当者は複数。メイン担当者は削除できない。発注・本発注・お知らせのメールの宛先は、メイン担当者とサブ担当者の全員（台帳 I・メール一覧 §0）。担当者のメールアドレスを変えると、パスワード再設定の認証コードの送り先も変わる。", "1 công ty 1 tài khoản, nhiều người phụ trách. Người phụ trách chính không xóa được. Email đặt hàng・đặt hàng chính thức・thông báo gửi cho cả người chính và người phụ. Đổi email người phụ trách thì nơi nhận mã xác thực đặt lại mật khẩu cũng đổi (台帳 I・メール一覧 §0)."),
           demo_ok=("コード：注記は「発注・本発注・お知らせのメール通知は、メイン担当者に届きます（サブ担当者にも届けるかは要確認）」（profile/page.tsx）。決定：メイン・サブの全員に届く（台帳 I・メール一覧 §0）", "Code: ghi chú 「発注・本発注・お知らせのメール通知は、メイン担当者に届きます（サブ担当者にも届けるかは要確認）」 (profile/page.tsx). Quyết định: gửi cho cả chính và phụ (台帳 I・メール一覧 §0)")),
         X("6.1", "担当者の表", "Bảng người phụ trách", ".tbl-wrap::担当者名", "table", detail=("1行＝1人。列：区分（メイン担当者／サブ担当者）・担当者名・フリガナ・メールアドレス・電話番号・（編集中だけ）削除。", "1 dòng = 1 người. Cột: loại (メイン担当者／サブ担当者)・tên・furigana・email・điện thoại・(chỉ khi sửa) xóa.")),
         X("6.2", "区分", "Loại", "table.tbl tbody tr:nth-child(1) .badge", "label", detail=("メイン担当者（紫のバッジ）／サブ担当者（灰色のバッジ）。メインは1人だけ。", "メイン担当者 (badge tím) / サブ担当者 (badge xám). Chỉ có 1 người chính.")),
         X("6.3", "担当者名", "Tên người phụ trách", "table.tbl tbody tr:nth-child(1) td:nth-child(2)", "text", "input", req="○", ln="文字列 60", ex=("佐藤 直樹", "Họ tên (tối đa 60 ký tự)"), err=["E01", "E04", "E13"], detail=("編集できる（担当者のすべての欄が連絡先）。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Sửa được (mọi ô người phụ trách đều là thông tin liên hệ). Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("6.4", "フリガナ", "Furigana", "table.tbl tbody tr:nth-child(1) td:nth-child(3)", "text", "input", req="○", ln=["文字列 60（全角カタカナ）", "Chuỗi 60 (katakana toàn góc)"], ex=("サトウ ナオキ", "Katakana toàn góc (tối đa 60 ký tự)"), err=["E01", "E03"]),
         X("6.5", "メールアドレス", "Email", "table.tbl tbody tr:nth-child(1) td:nth-child(4)", "text", "input", req="○", ln="文字列 60", ex=("n.sato@sample-shoji.co.jp", "Email (tối đa 60 ký tự)"), err=["E01", "E07"], detail=("編集できる。メール形式でなければ E07。変えると運営へ通知する（担当者のメール変更は認証コードの宛先が変わるため）。", "Sửa được. Sai định dạng email thì E07. Đổi thì thông báo cho 運営 (đổi email người phụ trách làm đổi nơi nhận mã xác thực)."), demo_ok=("コード：メールに長さの上限がなく、形式（MAIL_RE）だけを見る。変更しても運営へ通知しない（profile/page.tsx）。決定：60文字（台帳 B）・変更したら運営へ通知（台帳 F）", "Code: email không có giới hạn độ dài, chỉ kiểm tra định dạng (MAIL_RE). Đổi email cũng không thông báo cho 運営 (profile/page.tsx). Quyết định: 60 ký tự (台帳 B), đổi thì thông báo 運営 (台帳 F)")),
         X("6.6", "電話番号", "Số điện thoại", "table.tbl tbody tr:nth-child(1) td:nth-child(5)", "text", "input", req="○", ln=["文字列 20（数字とハイフン）", "Chuỗi 20 (số và gạch ngang)"], ex=("090-1234-5678", "Số và dấu gạch ngang, 10〜11 chữ số"), err=["E01", "E06"]),
         X("7", "出荷・納品の条件", "Điều kiện giao hàng・nhập kho", "h2::出荷・納品の条件^", "area"),
         X("7.1", "出荷元（製造所・倉庫）の住所", "Địa chỉ nơi xuất hàng (xưởng・kho)", ".fld::出荷元（製造所・倉庫）の住所", "text", "input", req="○", ln="文字列 255", ex=("埼玉県川口市本町1-2-3 サンプル第二工場", "Địa chỉ nơi xuất hàng (tối đa 255 ký tự)"), err=["E01", "E04"], detail=("住所なので編集できる。「住所検索」は使わない（郵便番号の欄が出荷元にないため）。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Là địa chỉ nên sửa được. Không dùng 「住所検索」 (vì không có ô mã bưu điện cho nơi xuất hàng). Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("7.2", "出荷できる曜日", "Ngày có thể xuất hàng", ".fld::出荷できる曜日", "label", detail=("見るだけ（取引条件・自己決定 B-2）。変更は ESキッチンへ。", "Chỉ xem (điều kiện giao dịch, tự quyết B-2). Đổi thì liên hệ ESキッチン.")),
         X("7.3", "納品できる倉庫", "Kho có thể giao tới", ".fld::納品できる倉庫", "label", detail=("見るだけ。", "Chỉ xem.")),
         X("7.4", "標準の配送方法", "Phương thức giao hàng chuẩn", ".fld::標準の配送方法", "label", detail=("見るだけ（取引条件・自己決定 B-2）。出荷報告の配送方法の初期値は「前回の出荷報告の値 → ここの値」の順。選択肢：直送（運送会社利用）／自社配送／倉庫へ持込。", "Chỉ xem (điều kiện giao dịch, tự quyết B-2). Giá trị ban đầu của phương thức giao khi báo cáo giao hàng theo thứ tự 「giá trị lần báo cáo trước → giá trị ở đây」. Lựa chọn: 直送（運送会社利用）／自社配送／倉庫へ持込.")),
         X("7.5", "標準の運送会社", "Hãng vận chuyển chuẩn", ".fld::標準の運送会社", "label", detail=("見るだけ（取引条件・自己決定 B-2）。選択肢：ヤマト運輸／佐川急便／福山通運（最初からある3社）＋運営のマスタに登録した委託配送先（hong 2026-10-07）。", "Chỉ xem (điều kiện giao dịch, tự quyết B-2). Lựa chọn: ヤマト運輸／佐川急便／福山通運 (3 hãng có sẵn) + 委託配送先 đã đăng ký ở master của 運営 (hong 2026-10-07).")),
         X("7.6", "土日祝を営業日とするか", "Có tính thứ bảy/chủ nhật/lễ là ngày làm việc không", ".fld::土日祝を営業日とするか", "label", detail=("はい／いいえ。見るだけ。本発注の未処理アラート（営業日24時間ごと）の数え方に使う。", "はい／いいえ. Chỉ xem. Dùng để đếm cảnh báo chưa xử lý đặt hàng chính thức (mỗi 24 giờ làm việc).")),
         X("8", "取引・支払条件", "Điều kiện giao dịch・thanh toán", "h2::取引・支払条件^", "area", detail=("見るだけ。口座（銀行・支店・口座番号・名義）はシステムに持たないので出さない（台帳 F 2026-10-07）。", "Chỉ xem. Không hiện tài khoản ngân hàng (ngân hàng・chi nhánh・số tài khoản・chủ tài khoản) vì hệ thống không giữ (台帳 F 2026-10-07).")),
         X("8.1", "締め日", "Ngày chốt", ".fld::締め日", "label", detail=("見るだけ。", "Chỉ xem.")),
         X("8.2", "支払条件", "Điều kiện thanh toán", ".fld::支払条件", "label", detail=("見るだけ。金額（仕入単価・支払額）は仕入先に見せない（台帳 I）。", "Chỉ xem. Không cho nhà cung cấp xem số tiền (đơn giá nhập・số tiền thanh toán) (台帳 I).")),
         X("9", "取扱商品（商品マスタ）", "Hàng xử lý (master sản phẩm)", ".tbl-wrap::品番", "table", detail=("見るだけ。列：品番・商品名・保管方法・区分・入り数（ロット）。仕入単価は出さない（台帳 I）。商品の追加・変更は運営が行う。0件のときは I01。", "Chỉ xem. Cột: mã hàng・tên hàng・cách bảo quản・loại・số lượng/thùng (lô). Không hiện đơn giá nhập (台帳 I). Thêm/sửa sản phẩm do 運営 thực hiện. 0 dòng: I01."), err=["I01"]),
     ]},
    {"id": "002", "code": "SW_PROF_001", "state": ["編集中", "Đang sửa"],
     "url": "/supplier/profile", "full": True, "wait": 500, "setup": _EDIT,
     "note": ["「編集する」を押した状態。直せる欄（連絡先）は白い入力欄、直せない欄は灰色（見るだけ）。下に「キャンセル」「保存する」。", "Trạng thái sau khi bấm 「編集する」. Ô sửa được (thông tin liên hệ) là ô trắng, ô không sửa được màu xám (chỉ xem). Phía dưới có 「キャンセル」「保存する」."],
     "items": [
         X("10", "直せる欄・直せない欄の見分け", "Phân biệt ô sửa được và không sửa được", ".card .fld", "area", detail=("直せる欄＝連絡先（電話・メール・担当者・住所）だけ白い入力欄。ほかは灰色の読み取り専用で、欄の下に「運営で管理している項目です（変更は ESキッチンへお問い合わせください）」と出す。", "Ô sửa được = chỉ thông tin liên hệ (điện thoại・email・người phụ trách・địa chỉ), ô trắng. Các ô khác xám chỉ đọc, dưới ô hiện 「運営で管理している項目です（変更は ESキッチンへお問い合わせください）」."),
           demo_ok=("コード：ヒントの文言は「運営で管理している項目です（変更は運営へご連絡ください）」（profile/page.tsx lockHint）。決定：「ESキッチンへお問い合わせください」（台帳 F 2026-10-05）。項目の固定そのもの（連絡先以外は読み取り専用）は決定どおり", "Code: câu gợi ý 「運営で管理している項目です（変更は運営へご連絡ください）」 (lockHint ở profile/page.tsx). Quyết định: 「ESキッチンへお問い合わせください」 (台帳 F 2026-10-05). Việc khóa ô (ngoài thông tin liên hệ chỉ đọc) đúng theo quyết định")),
         X("10.1", "キャンセル", "Nút 「キャンセル」", "button::キャンセル", "button", "click", err=["Q02"], pattern="P-FORM", detail=("編集を終わる。入力を変えていれば Q02 を出す。変えていなければそのまま表示に戻る。", "Kết thúc chỉnh sửa. Nếu đã sửa nội dung thì hiện Q02. Chưa sửa thì quay lại chế độ xem ngay.")),
         X("15", "住所検索", "Nút 「住所検索」", "-", "button", "click", cond=("編集中だけ出す。郵便番号（5.1）の横", "Chỉ hiện khi đang sửa. Cạnh mã bưu điện (5.1)"), detail=("郵便番号（数字7桁）から本社住所を引いて、住所の欄に入れる（都道府県・市区町村・町域まで。番地・建物は自分で入れる）。見つからないときは何も変えない。全システム共通のボタン（hong 2026-10-07）で、住所を入力する画面（申込・プロフィール）にはすべて置く。住所のデータは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込んで使う（全サイト共通・台帳 S 2026-10-08）。", "Tra địa chỉ trụ sở từ mã bưu điện (7 chữ số) và điền vào ô địa chỉ (đến tỉnh・quận/huyện・khu vực; số nhà・tòa nhà tự nhập). Không tìm thấy thì không đổi gì. Nút chung toàn hệ thống (hong 2026-10-07), đặt ở mọi màn hình nhập địa chỉ (đăng ký・hồ sơ). Dữ liệu địa chỉ dùng dữ liệu mã bưu điện do Japan Post công bố (miễn phí) được nhập vào hệ thống, chung mọi site (台帳 S 2026-10-08)."),
           demo_ok=("コード：「住所検索」のボタンがない（profile/page.tsx）。決定：全システム共通で住所を入れる画面に置く（台帳 F 2026-10-07）。データは日本郵便の郵便番号データを取り込む（台帳 S 2026-10-08）。コードを直す宿題", "Code: không có nút 「住所検索」 (profile/page.tsx). Quyết định: nút dùng chung toàn hệ thống ở mọi màn nhập địa chỉ (台帳 F 2026-10-07). Dữ liệu nhập từ dữ liệu mã bưu điện của Japan Post (台帳 S 2026-10-08). Bài tập sửa code")),
         X("10.2", "保存する", "Nút 「保存する」", "button::保存する", "button", "click", err=["S01", "E30", "E31", "I02"], pattern="P-FORM", detail=("全項目をまとめて確かめ、通れば保存して表示に戻り S01 のトーストを出す。承認は挟まず、保存するとそのまま運営のマスタに入り、運営へ通知する（台帳 F 2026-10-07）。ほかの人が編集中なら I02、あとから保存した方は E31。押したら無効にする。通信できなかったときは E30。会社名・口座・状態などの運営管理の項目は送られても受け付けない（サーバーで編集できる項目だけ受ける）。", "Kiểm tra cùng lúc mọi mục, đạt thì lưu và về chế độ xem, hiện toast S01. Không qua phê duyệt, lưu xong vào master của 運営 ngay và thông báo cho 運営 (台帳 F 2026-10-07). Người khác đang sửa thì I02, người lưu sau bị E31. Khóa nút khi bấm. Lỗi kết nối thì E30. Các mục do 運営 quản lý (tên công ty・tài khoản・trạng thái…) dù được gửi lên cũng không nhận (server chỉ nhận các mục sửa được)."),
           demo_ok=("コード：保存はサーバーが連絡先だけを反映する（PUT /suppliers/[id] → updateSupplierContact）。残る差：同時編集の検出（E31・I02）なし、入力チェックは必須とメール形式だけ、運営への通知（画面の通知）なし（profile/page.tsx・app/api/supplier/suppliers/[id]/route.ts）", "Code: khi lưu, server chỉ phản ánh thông tin liên hệ (PUT /suppliers/[id] → updateSupplierContact). Còn lệch: không phát hiện sửa đồng thời (E31・I02), kiểm tra chỉ gồm bắt buộc và định dạng email, không có thông báo cho 運営 (profile/page.tsx・app/api/supplier/suppliers/[id]/route.ts)")),
     ]},
    {"id": "003", "code": "SW_PROF_001", "state": ["入力エラー", "Lỗi nhập"],
     "url": "/supplier/profile", "full": True, "wait": 500, "setup": _EDIT + "fill('郵便番号',''); setv(cell(0,2),'abc'); btn('保存する').click(); await sleep(400);",
     "note": ["郵便番号を空にして、担当者のメールを abc にして「保存する」を押した状態。", "Trạng thái xóa trống mã bưu điện, đặt email người phụ trách là abc rồi bấm 「保存する」."],
     "items": [
         X("11", "必須のエラー", "Lỗi bắt buộc", ".fld::郵便番号", "label", err=["E01"], pattern="P-FORM", detail=("必須が空のとき E01（項目の下）。赤枠にする。まとめて確かめ、保存しない。", "Mục bắt buộc để trống thì E01 (dưới ô), viền đỏ. Kiểm tra cùng lúc và không lưu.")),
         X("11.1", "メール形式のエラー", "Lỗi định dạng email", "table.tbl tbody tr:nth-child(1) td:nth-child(4)", "label", err=["E07"], detail=("メールの形式が違うとき E07（欄の下）。", "Sai định dạng email thì E07 (dưới ô)."), demo_ok=("コード：メール形式のエラーは「形式が正しくありません」（profile/page.tsx）。決定：E07「正しいメールアドレスの形式で入力してください。」", "Code: lỗi định dạng email 「形式が正しくありません」 (profile/page.tsx). Quyết định: E07 「正しいメールアドレスの形式で入力してください。」")),
     ]},
    {"id": "004", "code": "SW_PROF_001", "state": ["サブ担当者を追加", "Thêm người phụ trách phụ"],
     "url": "/supplier/profile", "full": True, "wait": 500, "setup": _EDIT + "btn('+ サブ担当者を追加').click(); await sleep(300);",
     "note": ["編集中に「＋サブ担当者を追加」を押した状態。空の行が1行増え、その行だけ削除のボタンが出る。", "Trạng thái bấm 「＋サブ担当者を追加」 khi đang sửa. Thêm 1 dòng trống, chỉ dòng đó có nút xóa."],
     "items": [
         X("12", "追加したサブ担当者の行", "Dòng người phụ trách phụ mới thêm", "table.tbl tbody tr:last-child", "area", detail=("区分はサブ担当者。4つの欄はすべて必須（担当者名・フリガナ・メール・電話）。空のまま保存すると、各欄に E01。右端の「×」で行を消せる（メイン担当者の行には出ない）。", "Loại là người phụ trách phụ. Cả 4 ô đều bắt buộc (tên・furigana・email・điện thoại). Lưu khi để trống thì mỗi ô báo E01. Nút 「×」 bên phải để xóa dòng (không hiện ở dòng người chính)."), err=["E01"]),
         X("12.1", "サブ担当者を追加", "Nút 「＋サブ担当者を追加」", ".card button::サブ担当者を追加", "button", "click", cond=("編集中だけ出す", "Chỉ hiện khi đang sửa"), detail=("サブ担当者の空の行を1行足す。人数の上限は決まっていない。", "Thêm 1 dòng trống cho người phụ trách phụ. Chưa quy định giới hạn số người."),
           op=("サブ担当者の人数の上限", "Giới hạn số người phụ trách phụ"), ask="お客様（営業）"),
         X("12.2", "サブ担当者の削除", "Nút xóa người phụ trách phụ", "table.tbl tbody tr:last-child button.icon-btn", "button", "click", cond=("編集中のサブ担当者の行だけ（メイン担当者の行には出さない）", "Chỉ ở dòng người phụ trách phụ khi đang sửa (không hiện ở dòng người chính)"), detail=("行を消す（保存するまで確定しない）。", "Xóa dòng (chưa xác nhận cho đến khi lưu).")),
     ]},
    {"id": "005", "code": "SW_PROF_001", "state": ["編集内容の破棄の確認", "Xác nhận hủy nội dung đã sửa"],
     "url": "/supplier/profile", "full": True, "wait": 500, "setup": _EDIT + "fill('代表電話番号','03-9999-0000'); btn('キャンセル').click(); await sleep(400);",
     "note": ["電話番号を変えたあとに「キャンセル」を押した状態。", "Trạng thái bấm 「キャンセル」 sau khi đã đổi số điện thoại."],
     "items": [
         X("13", "編集内容の破棄の確認", "Hộp xác nhận hủy nội dung đã sửa", ".mbox", "modal", err=["Q02"], pattern="P-FORM", detail=("タイトル「編集内容を破棄しますか？」、本文「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」。ボタンは「キャンセル」「破棄」。破棄すると変更前の表示に戻る。サイドメニュー・ユーザーメニューで離れるときも同じ。", "Tiêu đề 「編集内容を破棄しますか？」, nội dung 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」. Nút 「キャンセル」「破棄」. Hủy thì quay về chế độ xem như trước khi sửa. Rời bằng menu bên/menu người dùng cũng như vậy.")),
     ]},
    {"id": "006", "code": "SW_PROF_001", "state": ["保存完了", "Lưu xong"],
     "url": "/supplier/profile", "full": True, "wait": 300, "setup": _EDIT + "fill('代表電話番号','03-1234-9999'); btn('保存する').click(); await sleep(500);",
     "note": ["電話番号を変えて「保存する」を押した直後。表示に戻り、トーストを出す。運営の仕入先マスタにはそのまま反映され、運営へ通知する。", "Ngay sau khi đổi số điện thoại và bấm 「保存する」. Quay về chế độ xem và hiện toast. Phản ánh ngay vào master nhà cung cấp của 運営 và thông báo cho 運営."],
     "items": [
         X("14", "保存完了のトースト", "Toast lưu xong", ".toast", "toast", err=["S01"], detail=("S01「保存しました。」。「運営のマスタに反映」は画面の説明の帯（No.2）で伝える。", "S01 「保存しました。」. Việc 「phản ánh vào master của 運営」 được nói ở dải giải thích (No.2)."),
           demo_ok=("コード：トーストは「プロフィールを保存しました（運営の仕入先マスタに反映）」（profile/page.tsx）。決定：S01「保存しました。」", "Code: toast 「プロフィールを保存しました（運営の仕入先マスタに反映）」 (profile/page.tsx). Quyết định: S01 「保存しました。」")),
     ]},
]
