# -*- coding: utf-8 -*-
"""
仕入先Web ログイン・パスワード再設定・取引のお申し込み（SW_AUTH）の画面設計書データ。
元：本物の Web（app/supplier/(auth)/login・forgot・apply/page.tsx・app/supplier/_components/AuthCard.tsx・lib/supplier/service.ts・app/api/supplier/auth/*）。
決定：docs/決定台帳.md F「パスワードの扱い」「認証コード」（2026-10-07・受付簿 No.291）・I「仕入先のアカウント・申込」「仕入先の区分」・K「パスワードの再設定」・M-1「ログインの期限」、
受付簿 No.290〜295。洗い出し：docs/05_画面設計書/確認メモ_SW_仕入先.md（回答 2026-10-07 つき）。
コードが決定に追いついていないところは demo_ok（宿題）：認証コードの中身の検証・ID とメールの一致確認・メール送信（見本は形だけ。H6）／ログインの期限 1日（H7）／
仕入れ先区分の複数選択（H9）／入力の共通基準（最大文字数・半角への直し・H16）／申込フォームの Q02（H17）／名前（ESキッチン・H8）。
"""

TITLE = ["ログイン・パスワード再設定・取引のお申し込み（SW_AUTH）", "Đăng nhập, đặt lại mật khẩu, đăng ký giao dịch (SW_AUTH)"]
SHEET = ["ログイン・申込", "Đăng nhập・Đăng ký"]
BASENAME = "画面設計書_SW_AUTH_ログイン・申込"
IMG_PREFIX = "SW_AUTH"
OUT_DIR = "仕入先Web"
CODE_NOTE = ["Screen Code は台帳 F の決まり：SW_<機能略>_<3桁>。取引のお申し込みはログインの前の画面なので AUTH にまとめた（分けるなら APLY）", "Screen Code theo 台帳 F: SW_<mã chức năng>_<3 chữ số>. Đăng ký giao dịch là màn hình trước đăng nhập nên gộp vào AUTH (nếu tách thì APLY)"]
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
    {"date": "2026-10-07", "target": "SW_AUTH_001 全体", "q": ["アカウント発行〜初回ログインのパスワード", "Mật khẩu từ lúc cấp tài khoản đến lần đăng nhập đầu tiên"],
     "a": ["初期パスワードはシステムが作ってメイン担当者（登録メールアドレス）へ送る。初回にパスワードを決める画面・ログイン中にパスワードを変える画面は置かない（変えたいときは再設定）", "Hệ thống tạo mật khẩu ban đầu và gửi cho người phụ trách chính (email đã đăng ký). Không có màn hình đặt mật khẩu lần đầu hay đổi mật khẩu khi đang đăng nhập (muốn đổi thì dùng đặt lại)"],
     "src": "hong 回答 2026-10-07（確認メモ_SW Q1・台帳 F「パスワードの扱い」・受付簿 No.291）"},
    {"date": "2026-10-07", "target": "SW_AUTH_002 全体", "q": ["認証コードの桁数・有効期限・入力回数の上限・ログイン失敗の上限", "Số chữ số, thời hạn, giới hạn số lần nhập của mã xác thực và giới hạn đăng nhập sai"],
     "a": ["4桁・有効期限5分・ロックなし（全サイト共通）。パスワードは8文字以上で英字と数字を含む", "4 chữ số, hiệu lực 5 phút, không khóa (chung mọi site). Mật khẩu từ 8 ký tự gồm chữ cái và số"],
     "src": "hong 回答 2026-10-07（確認メモ_SW Q2・台帳 F「認証コード」・受付簿 No.291）"},
    {"date": "2026-10-07", "target": "SW_AUTH_001 全体", "q": ["ログインできない状態（申込中・却下・未発行・削除済み・停止）の文言", "Câu thông báo khi không đăng nhập được (đang đăng ký, bị từ chối, chưa cấp, đã xóa, bị dừng)"],
     "a": ["どの状態でも同じ文言（E520。存在を明かさない）。停止の状態の定義は運営の仕入先マスタで決まってから足す", "Mọi trạng thái dùng cùng một câu (E520, không tiết lộ tài khoản có tồn tại). Định nghĩa trạng thái dừng sẽ bổ sung sau khi master nhà cung cấp bên 運営 được quyết"],
     "src": "hong 回答 2026-10-07「ok hết」（台帳 F「配送スタッフの一括発行・停止の文言・委託の申込」H-4：SW は E520 で存在を明かさない・停止の状態は運営H で決まってから足す。確認メモ_SW Q8）"},
    {"date": "2026-10-07", "target": "SW_AUTH_003 No.14〜", "q": ["仕入れ先区分の選び方", "Cách chọn loại nhà cung cấp"],
     "a": ["区分は商品ごとに決まり、1社で通常商品と短消費期限商品の両方を扱える。申込フォームは複数選択（チェック）", "Loại được xác định theo từng sản phẩm; một công ty có thể xử lý cả hàng thường và hàng hạn ngắn. Form đăng ký cho chọn nhiều (checkbox)"],
     "src": "台帳 I「仕入先の区分」（確認メモ_SW H9）"},
    {"date": "2026-10-07", "target": "SW_AUTH_003 No.12.1", "q": ["同じ会社の再申込・同じメールアドレスの重複を画面で止めるか", "Có chặn đăng ký trùng công ty / trùng email trên màn hình không"],
     "a": ["画面では判定しない（E09 は使わない）。運営が「申込の確認」で確かめる", "Không kiểm tra trên màn hình (không dùng E09). 運営 kiểm tra ở 「申込の確認」"],
     "src": "台帳 B「お試しは1法人1回の確かめ方」と同じ扱い（確認メモ_SW §6-5）"},
    {"date": "2026-10-07", "target": "SW_AUTH_003 全体", "q": ["申込の受付番号・承認までの流れ", "Mã tiếp nhận đăng ký và luồng đến khi duyệt"],
     "a": ["受付番号は SA-YYYYMMDD-NNNN。運営の「申込の確認」で承認（アカウント発行・メール）か却下（理由・メール）。ログイン ID＝仕入先ID（SP＋5桁）", "Mã tiếp nhận SA-YYYYMMDD-NNNN. 運営 duyệt ở 「申込の確認」 (cấp tài khoản, gửi email) hoặc từ chối (lý do, email). ID đăng nhập = ID nhà cung cấp (SP + 5 số)"],
     "src": "台帳 I「仕入先のアカウント・申込」・メール S9〜S11"},
]

DECISIONS += [
    {"date": "2026-10-07", "target": "SW_AUTH_003 No.21・21.1", "q": ["申込の同意の文書（取引条件・個人情報の取り扱い）", "Tài liệu đồng ý khi đăng ký (điều khoản giao dịch・xử lý thông tin cá nhân)"],
     "a": ["リンクは環境変数（例 NEXT_PUBLIC_SUPPLIER_TERMS_URL）から取り、空ならリンクを出さない。あとで運営Web の設定画面に移す（宿題）", "Liên kết lấy từ biến môi trường (ví dụ NEXT_PUBLIC_SUPPLIER_TERMS_URL), trống thì không hiện. Sau này chuyển sang màn hình cài đặt 運営Web (việc sửa sau)"],
     "src": "hong 回答 2026-10-07（確認メモ_SW O1）"},
    {"date": "2026-10-07", "target": "SW_AUTH_003 No.20.2", "q": ["「作れる商品」の9つの選択肢", "9 lựa chọn của 「作れる商品」"],
     "a": ["9つのまま", "Giữ nguyên 9 lựa chọn"], "src": "hong 回答 2026-10-07（確認メモ_SW O4）"},
    {"date": "2026-10-07", "target": "SW_AUTH_001・002 全体", "q": ["ログイン・パスワード再設定の認証基盤（Cognito）", "Hạ tầng xác thực của đăng nhập・đặt lại mật khẩu (Cognito)"],
     "a": ["本番は Cognito を使う。開発（いまのコード）は使わず自前で作っている。設計書の動き（4桁・5分・ロックなし・8文字以上）は本番も同じ", "Production dùng Cognito. Dev (code hiện tại) không dùng mà tự xây. Hành vi trong tài liệu (4 chữ số・5 phút・không khóa・từ 8 ký tự) giống nhau ở production"],
     "src": "hong 回答 2026-10-07（確認メモ_SW O5）。実装は開発の宿題"},
    {"date": "2026-10-07", "target": "SW_AUTH_003 No.18.8", "q": ["郵便番号から住所を入れるボタン", "Nút điền địa chỉ từ mã bưu điện"],
     "a": ["「住所検索」は全システム共通。住所を入力するすべての画面（申込・プロフィール）に置く。データの出どころは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込む（全サイト共通）", "「住所検索」 là chung toàn hệ thống. Đặt ở mọi màn hình nhập địa chỉ (đăng ký・hồ sơ). Nguồn dữ liệu: nhập vào hệ thống dữ liệu mã bưu điện do Japan Post công bố (miễn phí), dùng chung mọi site"],
     "src": "hong 回答 2026-10-07（ボタン）・2026-10-08（出どころ＝日本郵便の郵便番号データ。確認表 H-14・台帳 S・受付簿 #429）"},
]

CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "SW_AUTH_001", "ja": "ログイン", "vi": "Đăng nhập"},
    {"code": "SW_AUTH_002", "ja": "パスワード再設定", "vi": "Đặt lại mật khẩu"},
    {"code": "SW_AUTH_003", "ja": "取引のお申し込み", "vi": "Đăng ký giao dịch"},
]

# 入力の道具（React の入力欄に値を入れる）
_J = """const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const lab=f=>((f.querySelector('label')||{}).textContent||'').replace(/必須|任意/g,'').trim();
const fld=l=>[...document.querySelectorAll('.fld')].find(f=>lab(f)===l);
const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};
const fill=(l,v)=>setv(fld(l).querySelector('input,select,textarea'),v);
const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===t);
"""
_RESET1 = _J + "fill('ログインID','SP00001'); fill('メールアドレス','sato@sample-shoji.co.jp'); btn('認証コードを送る').click(); await sleep(700); "
_RESET2 = _RESET1 + "fill('認証コード','1234'); btn('確認する').click(); await sleep(700); "
_APPLY = (_J + "fill('会社名（法人名）','株式会社サンプルフーズ'); fill('会社名フリガナ','カブシキガイシャ サンプルフーズ'); fill('代表者名','山田 太郎'); fill('郵便番号','103-0027'); "
          "fill('本社住所','東京都中央区日本橋1-2-3'); fill('代表電話番号','03-1234-5678'); fill('土日祝を営業日とするか','いいえ'); fill('担当者名','佐藤 直樹'); fill('担当者フリガナ','サトウ ナオキ'); "
          "fill('担当者メールアドレス','n.sato@sample-foods.co.jp'); fill('担当者電話番号','090-1234-5678'); fill('仕入れ先区分','通常商品'); "
          "[...document.querySelectorAll('label.chk')].filter(l=>['惣菜','弁当'].includes(l.textContent.trim())).forEach(l=>l.querySelector('input').click()); "
          "document.querySelector('#agree').click(); await sleep(200); ")

VIEWS = [
    # ============================================================ SW_AUTH_001 ログイン
    {"id": "001", "code": "SW_AUTH_001", "state": ["初期表示", "Hiển thị ban đầu"],
     "url": "/supplier/login", "full": True, "wait": 500, "setup": "",
     "note": ["ログイン前の画面（紫のグラデーションの背景に中央のカード）。アカウントは運営が発行し、初期パスワードをシステムがメイン担当者へメールで送る。", "Màn hình trước đăng nhập (nền gradient tím, thẻ ở giữa). Tài khoản do 運営 cấp, hệ thống gửi mật khẩu ban đầu qua email cho người phụ trách chính."],
     "items": [
         X("1", "ログインのカード", "Thẻ đăng nhập", ".auth-card", "area", detail=("ログイン前の全画面（ログイン・再設定・申込）で同じ枠。有効期間は1日（台帳 K）。ログインするとホーム（SW_HOME_001）へ。ログイン中のパスワード変更の画面は置かない（台帳 F）。", "Khung chung cho các màn hình trước đăng nhập (đăng nhập, đặt lại, đăng ký). Hiệu lực đăng nhập 1 ngày (台帳 K). Đăng nhập xong vào trang chủ (SW_HOME_001). Không có màn hình đổi mật khẩu khi đang đăng nhập (台帳 F).")),
         X("1.1", "ロゴ・サイト名", "Logo và tên site", ".auth-card .logo", "label", init=("仕入先サイト", "「仕入先サイト」"), demo_ok=("コード：ロゴの alt は「ESSTATION」（AuthCard.tsx・Shell.tsx）。決定：システム名は「ES STATION」で「ESSTATION」の表記は使わない（台帳 F 2026-10-05）", "Code: alt của logo là 「ESSTATION」 (AuthCard.tsx・Shell.tsx). Quyết định: tên hệ thống là 「ES STATION」, không dùng 「ESSTATION」 (台帳 F 2026-10-05)")),
         X("1.2", "見出し", "Tiêu đề", ".auth-card h1", "label", init=("ログイン", "「ログイン」")),
         X("1.3", "説明文", "Câu giải thích", ".auth-card .sub", "label", detail=("「運営から発行されたアカウントでログインしてください。」ログインID（仕入先ID）と初期パスワードは、アカウント発行のメール（メイン担当者あて）に書いてある。", "「運営から発行されたアカウントでログインしてください。」 ID đăng nhập (ID nhà cung cấp) và mật khẩu ban đầu ghi trong email cấp tài khoản (gửi cho người phụ trách chính)."),
           demo_ok=("コード：運営がアカウントを発行すると account_issued を送るが、本文は「初回ログインのときにパスワードを決めてください」で、初期パスワードは作らない（lib/ops/areas/general.ts・lib/domain/seed/notice.ts）。決定：システムが初期パスワードを作り、メイン担当者へ送る（台帳 F 2026-10-07）", "Code: khi 運営 cấp tài khoản thì gửi account_issued nhưng nội dung là 「初回ログインのときにパスワードを決めてください」 và không tạo mật khẩu ban đầu (lib/ops/areas/general.ts・lib/domain/seed/notice.ts). Quyết định: hệ thống tạo mật khẩu ban đầu và gửi cho người phụ trách chính (台帳 F 2026-10-07)")),
         X("2", "ログインID", "ID đăng nhập", ".fld::ログインID", "text", "input", req="○", ln="文字列 7（SP＋5桁）", ex=("SP00001", "ID nhà cung cấp: SP + 5 chữ số"), err=["E01", "E520"],
           detail=("仕入先ID（SP＋5桁）。前後の空白を取り、全角の英数字は半角に直す。ID・パスワードが違うときは E520（どちらが違うかは言わない）。申込中・却下・未発行・削除済みの ID も同じ E520（存在を明かさない・Q8）。", "ID nhà cung cấp (SP + 5 số). Bỏ khoảng trắng đầu/cuối, đổi ký tự chữ/số toàn góc sang nửa góc. ID/mật khẩu sai thì E520 (không nói cái nào sai). ID đang đăng ký, bị từ chối, chưa cấp, đã xóa cũng cùng E520 (không tiết lộ tồn tại, Q8)."),
           demo_ok=("コード：必須エラーは個別の文字列「ログインIDを入力してください」（E01 は「{項目名}は必須項目です。」）。前後の空白は取るが、全角英数字を半角に直す処理はない（login/page.tsx）", "Code: lỗi bắt buộc là chuỗi riêng 「ログインIDを入力してください」 (E01 là 「{項目名}は必須項目です。」). Có bỏ khoảng trắng đầu/cuối nhưng không đổi chữ/số toàn góc sang nửa góc (login/page.tsx)")),
         X("3", "パスワード", "Mật khẩu", ".fld::パスワード", "text", "input", req="○", ln="文字列 8〜64", ex=("Passw0rd1", "Mật khẩu từ 8 ký tự gồm chữ cái và số (hiển thị dạng ●)"), err=["E01"],
           detail=("入力は ● で隠す。形式は 8文字以上・英字と数字を含む（初期パスワードもこの形式）。誤入力が続いてもロックしない（台帳 F）。最大 64 文字（台帳 F 2026-10-07「パスワードの最大文字数」）。", "Nhập được ẩn thành ●. Định dạng từ 8 ký tự gồm chữ cái và số (mật khẩu ban đầu cũng theo định dạng này). Nhập sai liên tiếp cũng không khóa (台帳 F). Tối đa 64 ký tự (台帳 F 2026-10-07)."),
           demo_ok=("コード：ログイン API は仕入先が本登録で、パスワードが空でないことだけを見る（パスワードの中身は確かめない：lib/supplier/service.ts login）。決定：本番は Cognito、開発は自前（台帳 F 2026-10-07）", "Code: API đăng nhập chỉ kiểm tra nhà cung cấp đã 本登録 và mật khẩu không rỗng, không đối chiếu mật khẩu (lib/supplier/service.ts login). Quyết định: bản thật dùng Cognito, môi trường dev tự làm (台帳 F 2026-10-07)")),
         X("4", "ログイン", "Nút 「ログイン」", "button.btn.pri", "button", "click", detail=("必須の2項目を確かめ、通ればログインしてホームへ。押したら無効にする（二重送信を防ぐ）。通信できなかったときは E30。", "Kiểm tra 2 mục bắt buộc, đạt thì đăng nhập và vào trang chủ. Khóa nút sau khi bấm (chống gửi 2 lần). Không kết nối được thì E30."), err=["E30"]),
         X("5", "パスワードを忘れた方", "Liên kết 「パスワードを忘れた方」", ".auth-links a::パスワードを忘れた方", "link", "click", detail=("パスワード再設定（SW_AUTH_002）へ。初めてのログインで初期パスワードがわからないときも、ここから再設定する。", "Đến đặt lại mật khẩu (SW_AUTH_002). Khi lần đầu đăng nhập mà không biết mật khẩu ban đầu cũng đặt lại từ đây.")),
         X("6", "取引の申込はこちら", "Liên kết 「取引の申込はこちら」", ".auth-links a::取引の申込はこちら", "link", "click", detail=("取引のお申し込み（SW_AUTH_003）へ。リンクの名前は画面タイトルと揃えて「取引のお申し込み」にする。", "Đến đăng ký giao dịch (SW_AUTH_003). Tên liên kết thống nhất với tiêu đề màn hình là 「取引のお申し込み」."),
           demo_ok=("コード：リンク名は「取引の申込はこちら」（login/page.tsx）。設計書は画面名に合わせて「取引のお申し込み」", "Code: tên liên kết là 「取引の申込はこちら」 (login/page.tsx). Thiết kế thống nhất theo tên màn hình là 「取引のお申し込み」")),
     ]},
    {"id": "002", "code": "SW_AUTH_001", "state": ["入力エラー（必須）", "Lỗi nhập (bắt buộc)"],
     "url": "/supplier/login", "full": True, "wait": 500, "setup": "const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='ログイン'); b.click(); await new Promise(r=>setTimeout(r,300));",
     "note": ["何も入力せずに「ログイン」を押した状態。", "Trạng thái bấm 「ログイン」 khi chưa nhập gì."],
     "items": [
         X("7", "ログインIDの必須エラー", "Lỗi bắt buộc của ID đăng nhập", ".fld::ログインID", "label", err=["E01"], detail=("E01（{項目名}＝ログインID）を項目の下に出す。赤枠にする。", "Hiện E01 ({項目名} = ログインID) dưới ô, viền đỏ.")),
         X("8", "パスワードの必須エラー", "Lỗi bắt buộc của mật khẩu", ".fld::パスワード", "label", err=["E01"], detail=("E01（{項目名}＝パスワード）。2項目をまとめて確かめる（P-FORM）。", "E01 ({項目名} = パスワード). Kiểm tra cùng lúc 2 mục (P-FORM)."), pattern="P-FORM"),
     ]},
    {"id": "003", "code": "SW_AUTH_001", "state": ["ログインに失敗", "Đăng nhập thất bại"],
     "url": "/supplier/login", "full": True, "wait": 500, "setup": _J + "fill('ログインID','XX99999'); fill('パスワード','Passw0rd1'); btn('ログイン').click(); await sleep(700);",
     "note": ["存在しないログインID（XX99999）で押した状態。申込中・却下・未発行・削除済みの ID でも同じ表示。", "Trạng thái bấm với ID không tồn tại (XX99999). ID đang đăng ký, bị từ chối, chưa cấp, đã xóa cũng hiển thị giống vậy."],
     "items": [
         X("9", "ログイン失敗のエラー", "Lỗi đăng nhập thất bại", ".fld::ログインID", "label", err=["E520"], detail=("E520「ログインIDまたはパスワードが正しくありません。」をログインIDの下に出す。ログインIDは残し、パスワードは空に戻さない。ロックはかけない。", "Hiện E520 「ログインIDまたはパスワードが正しくありません。」 dưới ô ID đăng nhập. Giữ nguyên ID, không xóa mật khẩu. Không khóa tài khoản.")),
     ]},
    # ============================================================ SW_AUTH_002 パスワード再設定
    {"id": "004", "code": "SW_AUTH_002", "state": ["① ログインID・メールアドレス", "① ID đăng nhập và email"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": "",
     "note": ["4つのステップ（①ID・メール入力 → ②認証コード → ③新しいパスワード → ④完了）の1つ目。初期パスワードを受け取れなかったとき・忘れたときの共通の入口。", "Bước 1/4 (① nhập ID・email → ② mã xác thực → ③ mật khẩu mới → ④ hoàn tất). Cửa vào chung khi không nhận được mật khẩu ban đầu hoặc quên mật khẩu."],
     "items": [
         X("10", "パスワード再設定のカード", "Thẻ đặt lại mật khẩu", ".auth-card", "area", detail=("ログイン中にパスワードを変える画面はなく、変えたいときはこの再設定を使う（台帳 F）。認証コードは4桁・有効期限5分・ロックなし（全サイト共通）。", "Không có màn hình đổi mật khẩu khi đang đăng nhập; muốn đổi thì dùng đặt lại này (台帳 F). Mã xác thực 4 chữ số, hiệu lực 5 phút, không khóa (chung mọi site).")),
         X("10.1", "見出し", "Tiêu đề", ".auth-card h1", "label", init=("パスワードの再設定", "「パスワードの再設定」")),
         X("10.2", "ステップの表示", "Hiển thị các bước", ".mini-steps", "label", detail=("1. ID・メール入力／2. 認証コード／3. 新パスワード／4. 完了。いまの手順を強調し、終わった手順は薄く出す。", "1. Nhập ID・email / 2. Mã xác thực / 3. Mật khẩu mới / 4. Hoàn tất. Làm nổi bật bước hiện tại, bước đã xong hiển thị mờ.")),
         X("10.3", "ログインID", "ID đăng nhập", ".fld::ログインID", "text", "input", req="○", ln="文字列 7（SP＋5桁）", ex=("SP00001", "ID nhà cung cấp: SP + 5 chữ số"), err=["E01"]),
         X("10.4", "メールアドレス", "Email", ".fld::メールアドレス", "text", "input", req="○", ln="文字列 60", ex=("sato@sample-shoji.co.jp", "Email của người phụ trách đã đăng ký (tối đa 60 ký tự)"), err=["E01", "E07", "E526"],
           detail=("登録済みのメールアドレス（メイン担当者・サブ担当者のどれか）。メール形式でなければ E07。ログインIDと組み合わせが登録にないとき E526（どちらが違うかは言わない）。認証コードはこのアドレスへ送る。", "Email đã đăng ký (người phụ trách chính hoặc phụ). Sai định dạng email thì E07. Tổ hợp với ID đăng nhập không có trong dữ liệu thì E526 (không nói cái nào sai). Mã xác thực gửi tới địa chỉ này."),
           demo_ok=("コード：パスワード再設定の要求 API は何も確かめず・メールも送らない（app/api/supplier/auth/password-reset/route.ts）。ID とメールの一致確認（E526）がなく、メールの長さの上限（台帳 B：60文字）もない（forgot/page.tsx は形式 MAIL_RE だけ）", "Code: API yêu cầu đặt lại mật khẩu không kiểm tra gì và không gửi email (app/api/supplier/auth/password-reset/route.ts). Không có kiểm tra khớp ID và email (E526), không giới hạn độ dài email (台帳 B: 60 ký tự); forgot/page.tsx chỉ kiểm tra định dạng MAIL_RE")),
         X("10.5", "認証コードを送る", "Nút 「認証コードを送る」", "button::認証コードを送る", "button", "click", detail=("確かめて通ればメールで4桁の認証コード（有効期限5分）を送り、② へ進む。", "Kiểm tra đạt thì gửi mã xác thực 4 chữ số (hiệu lực 5 phút) qua email và chuyển sang ②."), err=["E30"]),
     ]},
    {"id": "005", "code": "SW_AUTH_002", "state": ["① 入力エラー", "① Lỗi nhập"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": _J + "btn('認証コードを送る').click(); await sleep(300);",
     "note": ["何も入力せずに「認証コードを送る」を押した状態。", "Trạng thái bấm 「認証コードを送る」 khi chưa nhập gì."],
     "items": [
         X("11", "ログインIDの必須エラー", "Lỗi bắt buộc của ID đăng nhập", ".fld::ログインID", "label", err=["E01"]),
         X("11.1", "メールアドレスの形式エラー", "Lỗi định dạng email", ".fld::メールアドレス", "label", err=["E07", "E526"], detail=("空のとき E01、形式が違うとき E07。組み合わせの誤りは通信のあとに E526 を同じ場所に出す。", "Để trống thì E01, sai định dạng thì E07. Lỗi tổ hợp ID/email thì sau khi gửi hiện E526 ở cùng vị trí.")),
     ]},
    {"id": "006", "code": "SW_AUTH_002", "state": ["② 認証コード", "② Mã xác thực"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": _RESET1,
     "note": ["①を通したあと。認証コードをメールで送った案内（I401）と入力欄を出す。", "Sau khi qua bước ①. Hiện hướng dẫn đã gửi mã xác thực qua email (I401) và ô nhập."],
     "items": [
         X("12", "認証コード送信の案内", "Hướng dẫn đã gửi mã xác thực", ".notice", "label", err=["I401"], detail=("「認証コード（4桁）をメールで送りました（有効期限：5分）。」宛先は登録メールアドレス。メールの文面は Message List メール No.3。", "「認証コード（4桁）をメールで送りました（有効期限：5分）。」 Gửi tới email đã đăng ký. Nội dung email: Message List mail No.3."),
           demo_ok=("コード：案内の文言は「認証コード（4桁）をメールで送りました（有効期限：5分）」で I401 と同じ趣旨だが、見本では実際にはメールを送らない（password-reset/route.ts）", "Code: câu hướng dẫn 「認証コード（4桁）をメールで送りました（有効期限：5分）」 cùng ý với I401 nhưng bản mẫu thực tế không gửi email (password-reset/route.ts)")),
         X("12.1", "認証コード", "Mã xác thực", ".fld::認証コード", "text", "input", req="○", ln=["数字 4桁","Số 4 chữ số"], ex=("4829", "Mã 4 chữ số trong email"), err=["E01", "E521", "E522"],
           detail=("数字4桁（全角は半角に直す）。違えば E521、5分を過ぎたら E522。入力を間違え続けてもロックしない（台帳 F）。5分を過ぎたら「認証コードを送り直す」からやり直す。", "4 chữ số (đổi toàn góc sang nửa góc). Sai thì E521, quá 5 phút thì E522. Nhập sai liên tiếp cũng không khóa (台帳 F). Quá 5 phút thì làm lại bằng 「認証コードを送り直す」."),
           demo_ok=("コード：maxLength 4・4桁の数字かどうか（isCode）だけを見る。どの4桁でも通り、コードの中身・5分の期限・E521・E522 は確かめない（lib/supplier/service.ts verifyResetCode）。決定：4桁・5分・ロックなし（台帳 F）", "Code: maxLength 4, chỉ kiểm tra có phải 4 chữ số (isCode). Số 4 chữ số nào cũng qua, không đối chiếu nội dung mã, hạn 5 phút, E521・E522 (lib/supplier/service.ts verifyResetCode). Quyết định: 4 số・5 phút・không khóa (台帳 F)")),
         X("12.2", "確認する", "Nút 「確認する」", "button::確認する", "button", "click", detail=("コードが合えば ③ へ進む。", "Mã đúng thì sang ③.")),
         X("12.3", "認証コードを送り直す", "Nút 「認証コードを送り直す」", "button::認証コードを送り直す", "button", "click", detail=("① に戻る（ID・メールを入れ直して再送）。", "Quay lại ① (nhập lại ID・email rồi gửi lại).")),
     ]},
    {"id": "007", "code": "SW_AUTH_002", "state": ["② 認証コードのエラー", "② Lỗi mã xác thực"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": _RESET1 + "fill('認証コード','12'); btn('確認する').click(); await sleep(300);",
     "note": ["4桁でないコード（12）を入れて押した状態。コードの違い（E521）・期限切れ（E522）も同じ場所に出す。", "Trạng thái nhập mã không đủ 4 chữ số (12) và bấm. Mã sai (E521) và hết hạn (E522) cũng hiện ở cùng vị trí."],
     "items": [
         X("13", "認証コードのエラー", "Lỗi mã xác thực", ".fld::認証コード", "label", err=["E521", "E522"], detail=("空は E01、違いは E521、期限切れは E522。エラーのときも入力は残す。", "Để trống E01, sai E521, hết hạn E522. Khi lỗi vẫn giữ nội dung đã nhập.")),
     ]},
    {"id": "008", "code": "SW_AUTH_002", "state": ["③ 新しいパスワード", "③ Mật khẩu mới"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": _RESET2,
     "note": ["② を通したあと。新しいパスワードを2回入れる。", "Sau khi qua ②. Nhập mật khẩu mới 2 lần."],
     "items": [
         X("14", "新しいパスワード", "Mật khẩu mới", ".stack > .fld:nth-child(1)", "text", "input", req="○", ln="文字列 8〜64", ex=("Sample2026", "Từ 8 ký tự gồm chữ cái và số"), err=["E01", "E523"],
           detail=("8文字以上・英字と数字を含む（ヒントを欄の下に出す）。形式が違えば E523。ログイン中の変更はなく、この再設定だけで変える。", "Từ 8 ký tự gồm chữ cái và số (hiện gợi ý dưới ô). Sai định dạng thì E523. Không có đổi khi đang đăng nhập, chỉ đổi bằng đặt lại này.")),
         X("14.1", "新しいパスワード（確認）", "Mật khẩu mới (xác nhận)", ".stack > .fld:nth-child(2)", "text", "input", req="○", ln="文字列 8〜64", ex=("Sample2026", "Nhập lại đúng mật khẩu ở trên"), err=["E01", "E524"], detail=("上と同じ値。違えば E524。", "Cùng giá trị với ô trên. Khác thì E524.")),
         X("14.2", "パスワードを設定する", "Nút 「パスワードを設定する」", "button::パスワードを設定する", "button", "click", detail=("通れば新しいパスワードを保存して ④ へ。保存できなかったときは E30。", "Đạt thì lưu mật khẩu mới và sang ④. Không lưu được thì E30."), err=["E30"]),
     ]},
    {"id": "009", "code": "SW_AUTH_002", "state": ["③ 入力エラー", "③ Lỗi nhập"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": _RESET2 + "setv(document.querySelectorAll('.stack input')[0],'abc'); setv(document.querySelectorAll('.stack input')[1],'abd'); btn('パスワードを設定する').click(); await sleep(300);",
     "note": ["形式に合わない（abc）・確認と違う（abd）パスワードで押した状態。", "Trạng thái bấm với mật khẩu sai định dạng (abc) và khác ô xác nhận (abd)."],
     "items": [
         X("15", "形式のエラー", "Lỗi định dạng", ".stack > .fld:nth-child(1)", "label", err=["E523"], detail=("E523 を新しいパスワードの下に出す。", "Hiện E523 dưới ô mật khẩu mới.")),
         X("15.1", "確認の不一致エラー", "Lỗi xác nhận không khớp", ".stack > .fld:nth-child(2)", "label", err=["E524"], detail=("E524 を確認の下に出す。2項目をまとめて確かめる（P-FORM）。", "Hiện E524 dưới ô xác nhận. Kiểm tra cùng lúc 2 mục (P-FORM)."), pattern="P-FORM"),
     ]},
    {"id": "010", "code": "SW_AUTH_002", "state": ["④ 完了", "④ Hoàn tất"],
     "url": "/supplier/forgot", "full": True, "wait": 500, "setup": _RESET2 + "setv(document.querySelectorAll('.stack input')[0],'Passw0rd1'); setv(document.querySelectorAll('.stack input')[1],'Passw0rd1'); btn('パスワードを設定する').click(); await sleep(700);",
     "note": ["パスワードを保存したあと。完了の案内とログインへの導線だけを出す。", "Sau khi lưu mật khẩu. Chỉ hiện thông báo hoàn tất và đường về đăng nhập."],
     "items": [
         X("16", "完了の案内", "Thông báo hoàn tất", ".notice", "label", err=["S401"], detail=("「パスワードを再設定しました。新しいパスワードでログインしてください。」完了の通知メールは担当者全員あて（メール No.4）。", "「パスワードを再設定しました。新しいパスワードでログインしてください。」 Email thông báo hoàn tất gửi cho toàn bộ người phụ trách (mail No.4).")),
         X("16.1", "ログイン画面へ", "Nút 「ログイン画面へ」", "a.btn.pri", "link", "click", detail=("ログイン（SW_AUTH_001）へ。", "Đến đăng nhập (SW_AUTH_001).")),
     ]},
    # ============================================================ SW_AUTH_003 取引のお申し込み
    {"id": "011", "code": "SW_AUTH_003", "state": ["① 入力（初期）", "① Nhập (ban đầu)"],
     "url": "/supplier/apply", "full": True, "wait": 500, "setup": "",
     "note": ["ログインの前に誰でも開ける申込フォーム（入力 → 確認 → 完了の3ステップ）。受付すると、運営の仕入先マスタ「申込の確認」に「申込中」で入る。", "Form đăng ký ai cũng mở được trước khi đăng nhập (3 bước nhập → xác nhận → hoàn tất). Khi tiếp nhận sẽ vào 「申込の確認」 của master nhà cung cấp bên 運営 với trạng thái 「申込中」."],
     "items": [
         X("17", "申込フォームのカード", "Thẻ form đăng ký", ".auth-card", "area", detail=("ログインのカードより広い。入力を変えたあと、「ログインに戻る」・ブラウザを閉じる／再読み込みをしたら Q02 を出す（台帳 F）。", "Rộng hơn thẻ đăng nhập. Sau khi đã sửa, nếu bấm 「ログインに戻る」 hoặc đóng/tải lại trình duyệt thì hiện Q02 (台帳 F)."), err=["Q02"], pattern="P-FORM",
           demo_ok=("コード：入力中の確認はブラウザを閉じる・再読み込み（beforeunload）だけ。「ログインに戻る」のリンクは確認なしで戻る（AuthCard.tsx・apply/page.tsx）。決定：Q02 は全サイト共通（台帳 F 2026-10-05）", "Code: chỉ xác nhận khi đóng/tải lại trình duyệt (beforeunload). Liên kết 「ログインに戻る」 quay lại ngay không xác nhận (AuthCard.tsx・apply/page.tsx). Quyết định: Q02 dùng chung mọi site (台帳 F 2026-10-05)")),
         X("17.1", "見出し・ステップ", "Tiêu đề và các bước", ".auth-card .logo", "label", init=("仕入先 取引のお申し込み", "「仕入先 取引のお申し込み」"), detail=("下に 1.入力／2.確認／3.完了 のステップ表示。", "Bên dưới là các bước 1.入力 / 2.確認 / 3.完了.")),
         X("18", "① 会社情報", "① Thông tin công ty", ".formsec::① 会社情報", "area"),
         X("18.1", "会社名（法人名）", "Tên công ty (tên pháp nhân)", ".fld::会社名（法人名）", "text", "input", req="○", ln="文字列 60", ex=("株式会社サンプルフーズ", "Tên pháp nhân (tối đa 60 ký tự)"), err=["E01", "E04", "E13"], detail=("運営の仕入先マスタの「会社名」になる（承認後は仕入先が変えられない・台帳 F）。同じ会社の再申込は画面では止めない（運営が確かめる）。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Trở thành 「会社名」 trong master nhà cung cấp của 運営 (sau khi duyệt nhà cung cấp không tự đổi được, 台帳 F). Đăng ký lại cùng công ty không bị chặn trên màn hình (運営 kiểm tra). Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08)."), demo_ok=("コード：必須だけで、最大文字数・絵文字の確認がない（apply/page.tsx。入力欄に maxLength もない）。決定：入力の共通基準（1行 60文字）", "Code: chỉ kiểm tra bắt buộc, không kiểm tra số ký tự tối đa・emoji (apply/page.tsx; ô nhập cũng không có maxLength). Quyết định: chuẩn nhập chung (1 dòng 60 ký tự)")),
         X("18.2", "会社名フリガナ", "Tên công ty (furigana)", ".fld::会社名フリガナ", "text", "input", req="○", ln=["文字列 60（全角カタカナ）","Chuỗi 60 (katakana toàn góc)"], ex=("カブシキガイシャ サンプルフーズ", "Katakana toàn góc (tối đa 60 ký tự)"), err=["E01", "E03", "E04"], detail=("全角カタカナ・長音・スペース。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Katakana toàn góc, dấu kéo dài và khoảng trắng. Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08)."), demo_ok=("コード：必須だけで、全角カタカナの確認がない（apply/page.tsx）", "Code: chỉ kiểm tra bắt buộc, không kiểm tra katakana toàn góc (apply/page.tsx)")),
         X("18.3", "代表者名", "Tên người đại diện", ".fld::代表者名", "text", "input", req="○", ln="文字列 60", ex=("山田 太郎", "Họ tên người đại diện (tối đa 60 ký tự)"), err=["E01", "E04", "E13"], detail=("最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("18.4", "郵便番号", "Mã bưu điện", ".fld::郵便番号", "text", "input", req="○", ln=["文字列 8（数字7桁）","Chuỗi 8 (7 chữ số)"], ex=("103-0027", "7 chữ số, có thể có dấu gạch ngang"), err=["E01", "E05"], detail=("数字7桁・ハイフンは任意。保存は 123-4567 の形。", "7 chữ số, dấu gạch ngang tùy chọn. Lưu dạng 123-4567."), demo_ok=("コード：必須だけで、数字7桁の形式の確認と 123-4567 への整形がない（apply/page.tsx）", "Code: chỉ kiểm tra bắt buộc, không kiểm tra định dạng 7 chữ số và không chuẩn hóa thành 123-4567 (apply/page.tsx)")),
         X("18.5", "本社住所", "Địa chỉ trụ sở", ".fld::本社住所", "text", "input", req="○", ln="文字列 255", ex=("東京都中央区日本橋1-2-3", "Địa chỉ trụ sở (tối đa 255 ký tự)"), err=["E01", "E04"], detail=("「住所検索」（No.18.8）で入れた住所にも同じ上限を使う。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Địa chỉ điền bằng 「住所検索」 (No.18.8) cũng dùng cùng giới hạn. Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("18.8", "住所検索", "Nút 「住所検索」", "-", "button", "click", detail=("郵便番号（18.4）を入れて押すと、本社住所（18.5）に都道府県・市区町村・町域を入れる。番地・建物は自分で入れる。見つからないときは何も変えない。全システム共通のボタン（hong 2026-10-07）。住所のデータは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込んで使う（全サイト共通・台帳 S 2026-10-08）。", "Nhập mã bưu điện (18.4) rồi bấm sẽ điền tỉnh・quận/huyện・khu vực vào địa chỉ trụ sở (18.5). Số nhà・tòa nhà tự nhập. Không tìm thấy thì không đổi gì. Nút chung toàn hệ thống (hong 2026-10-07). Dữ liệu địa chỉ dùng dữ liệu mã bưu điện do Japan Post công bố (miễn phí) được nhập vào hệ thống, chung mọi site (台帳 S 2026-10-08)."),
           demo_ok=("コード：「住所検索」のボタンがない（apply/page.tsx）。決定：全システム共通で住所を入れる画面に置く（台帳 F 2026-10-07）。データは日本郵便の郵便番号データを取り込む（台帳 S 2026-10-08）。コードを直す宿題", "Code: không có nút 「住所検索」 (apply/page.tsx). Quyết định: nút dùng chung toàn hệ thống ở mọi màn nhập địa chỉ (台帳 F 2026-10-07). Dữ liệu nhập từ dữ liệu mã bưu điện của Japan Post (台帳 S 2026-10-08). Bài tập sửa code")),
         X("18.6", "代表電話番号", "Số điện thoại đại diện", ".fld::代表電話番号", "text", "input", req="○", ln=["文字列 20（数字とハイフン）","Chuỗi 20 (số và gạch ngang)"], ex=("03-1234-5678", "Số và dấu gạch ngang, 10〜11 chữ số"), err=["E01", "E06"], detail=("数字とハイフン。ハイフンを除いて10〜11桁。", "Số và dấu gạch ngang. Bỏ dấu gạch ngang còn 10〜11 chữ số.")),
         X("18.7", "土日祝を営業日とするか", "Có tính thứ bảy/chủ nhật/lễ là ngày làm việc không", ".fld::土日祝を営業日とするか", "select", "select", req="○", ln="選択", ex=("いいえ", "Chọn: はい / いいえ"), err=["E02"], detail=("本発注の未処理アラート（営業日24時間ごと）の営業日の数え方に使う。承認後はプロフィールで見るだけ。", "Dùng để đếm ngày làm việc cho cảnh báo chưa xử lý đặt hàng chính thức (mỗi 24 giờ làm việc). Sau khi duyệt chỉ xem ở プロフィール.")),
         X("19", "② 担当者情報", "② Thông tin người phụ trách", ".formsec::② 担当者情報", "area", detail=("ここで入れた担当者は、承認のときに「メイン担当者」になる（1社1アカウント・担当者は複数。サブ担当者は承認後にプロフィールで足す）。", "Người phụ trách nhập ở đây trở thành 「メイン担当者」 khi duyệt (1 công ty 1 tài khoản, nhiều người phụ trách; người phụ trách phụ thêm ở プロフィール sau khi duyệt)."),
           ),
         X("19.1", "担当者名", "Tên người phụ trách", ".fld::担当者名", "text", "input", req="○", ln="文字列 60", ex=("佐藤 直樹", "Họ tên người phụ trách (tối đa 60 ký tự)"), err=["E01", "E04", "E13"], detail=("最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("19.2", "担当者フリガナ", "Furigana người phụ trách", ".fld::担当者フリガナ", "text", "input", req="○", ln=["文字列 60（全角カタカナ）","Chuỗi 60 (katakana toàn góc)"], ex=("サトウ ナオキ", "Katakana toàn góc (tối đa 60 ký tự)"), err=["E01", "E03"]),
         X("19.3", "担当者メールアドレス", "Email người phụ trách", ".fld::担当者メールアドレス", "text", "input", req="○", ln="文字列 60", ex=("n.sato@sample-foods.co.jp", "Email nhận thông báo (tối đa 60 ký tự)"), err=["E01", "E07"], detail=("アカウント発行のメール（初期パスワード）・発注メール・認証コードの宛先になる。同じメールアドレスの重複は画面では止めない。", "Là nơi nhận email cấp tài khoản (mật khẩu ban đầu), email đặt hàng và mã xác thực. Không chặn trùng email trên màn hình.")),
         X("19.4", "担当者電話番号", "Số điện thoại người phụ trách", ".fld::担当者電話番号", "text", "input", req="○", ln=["文字列 20（数字とハイフン）","Chuỗi 20 (số và gạch ngang)"], ex=("090-1234-5678", "Số và dấu gạch ngang, 10〜11 chữ số"), err=["E01", "E06"]),
         X("20", "③ 取扱商品情報", "③ Thông tin hàng hóa xử lý", ".formsec::③ 取扱商品情報", "area"),
         X("20.1", "仕入れ先区分", "Loại nhà cung cấp", ".fld::仕入れ先区分", "check", "check", req="○", ln=["複数選択（通常商品・短消費期限商品・資材）","Chọn nhiều (hàng thường, hàng hạn ngắn, vật tư)"], ex=("通常商品、短消費期限商品", "Chọn nhiều: 通常商品 / 短消費期限商品 / 資材"), err=["E02"], detail=("区分は商品ごとに決まり、1社で通常商品と短消費期限商品の両方を扱える。複数選択のチェックで、1つ以上選ぶ（台帳 I）。", "Loại xác định theo sản phẩm; một công ty xử lý được cả hàng thường và hàng hạn ngắn. Chọn nhiều bằng checkbox, ít nhất 1 (台帳 I)."),
           demo_ok=("コード：1つだけ選ぶプルダウン（通常商品／短消費期限商品／資材）（apply/page.tsx）。決定：区分は商品ごとに決まり、1社で複数を扱える", "Code: dropdown chỉ chọn 1 (通常商品／短消費期限商品／資材) (apply/page.tsx). Quyết định: loại xác định theo từng sản phẩm, 1 công ty xử lý được nhiều loại")),
         X("20.2", "作れる商品（複数選択可）", "Hàng hóa sản xuất được (chọn nhiều)", ".fld::作れる商品（複数選択可）", "check", "check", req="○", ln=["複数選択（9つ）","Chọn nhiều (9 loại)"], ex=("惣菜、弁当", "Chọn nhiều trong 9 loại"), err=["E02"], detail=("選択肢（9つ）：惣菜／弁当／肉類／魚類／サラダ・スープ／パン・ごはん／おにぎり・サンドイッチ／甘味・ドリンク／資材（箸・容器など）。1つ以上選ぶ。", "Lựa chọn (9 loại): 惣菜／弁当／肉類／魚類／サラダ・スープ／パン・ごはん／おにぎり・サンドイッチ／甘味・ドリンク／資材（箸・容器など）. Chọn ít nhất 1.")),
         X("20.3", "主な取扱商品・得意分野", "Hàng hóa chính và thế mạnh", ".fld::主な取扱商品・得意分野", "textarea", "input", req="－", ln=["文字列 500（複数行）","Chuỗi 500 (nhiều dòng)"], ex=("冷蔵惣菜（煮物・焼き物）の製造。ロット6個単位。", "Mô tả hàng chính, lô tối thiểu... (tối đa 500 ký tự, nhiều dòng)"), err=["E04"], detail=("備考・説明は 500 文字・複数行（入力の共通基準）。セクションの最後に置く。最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Ghi chú/mô tả tối đa 500 ký tự, nhiều dòng (chuẩn nhập chung). Đặt ở cuối section. Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("20.4", "保有している許可・認証", "Giấy phép・chứng nhận đang có", ".fld::保有している許可・認証", "text", "input", req="－", ln="文字列 60", ex=("食品製造業許可、HACCP", "Tên giấy phép/chứng nhận (tối đa 60 ký tự)"), err=["E04"], detail=("最大文字数は入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す（台帳 S・2026-10-08）。", "Ô nhập dừng ở số ký tự tối đa (không gõ thêm được). Chỉ khi dán mới hiện E04 (台帳 S・2026-10-08).")),
         X("21", "同意のチェック", "Ô đồng ý", "label[for=agree]", "check", "check", req="○", ln=["チェック","Checkbox"], ex=("同意する", "Đánh dấu đồng ý"), err=["E527"], detail=("「取引条件・個人情報の取り扱いに同意します」。チェックがなければ E527。同意の文書へのリンクは次の項目（21.1）。", "「取引条件・個人情報の取り扱いに同意します」. Không đánh dấu thì E527. Liên kết tới tài liệu đồng ý ở mục sau (21.1).")),
         X("21.1", "同意の文書のリンク", "Liên kết tài liệu đồng ý", "-", "link", "click", cond=("リンクの URL が登録されているときだけ出す。空なら出さない", "Chỉ hiện khi đã đăng ký URL liên kết. Trống thì không hiện"), detail=("取引条件・個人情報の取り扱いの文書を新しいタブで開く。URL は環境変数（例 NEXT_PUBLIC_SUPPLIER_TERMS_URL）から取り、空ならリンクを出さない。あとで運営Web の設定画面に移す（宿題）。", "Mở tài liệu điều khoản giao dịch・xử lý thông tin cá nhân ở tab mới. URL lấy từ biến môi trường (ví dụ NEXT_PUBLIC_SUPPLIER_TERMS_URL), trống thì không hiện liên kết. Sau này chuyển sang màn hình cài đặt 運営Web (việc sửa sau)."), demo_ok=("コード：同意の文言「取引条件・個人情報の取り扱いに同意します」だけで、文書へのリンクがない（apply/page.tsx）。決定：リンクは環境変数から取り、空なら出さない（台帳 F 2026-10-07。のちに運営設定へ）", "Code: chỉ có câu 「取引条件・個人情報の取り扱いに同意します」, không có liên kết tới tài liệu (apply/page.tsx). Quyết định: lấy liên kết từ biến môi trường, trống thì không hiện (台帳 F 2026-10-07; sau chuyển sang cài đặt 運営)")),
         X("22", "確認画面へ", "Nút 「確認画面へ」", "button::確認画面へ", "button", "click", detail=("全項目をまとめて確かめ（P-FORM）、通れば ② 確認へ。エラーの項目は赤枠と文言（項目の下）。", "Kiểm tra cùng lúc mọi mục (P-FORM), đạt thì sang ② xác nhận. Mục lỗi viền đỏ và câu thông báo dưới ô."), pattern="P-FORM"),
     ]},
    {"id": "012", "code": "SW_AUTH_003", "state": ["① 入力エラー", "① Lỗi nhập"],
     "url": "/supplier/apply", "full": True, "wait": 500, "setup": _J + "btn('確認画面へ').click(); await sleep(400);",
     "note": ["何も入力せずに「確認画面へ」を押した状態。", "Trạng thái bấm 「確認画面へ」 khi chưa nhập gì."],
     "items": [
         X("23", "必須のエラー", "Lỗi bắt buộc", ".fld::会社名（法人名）", "label", err=["E01"], detail=("必須の入力は E01、選択は E02。赤枠にして項目の下に文言を出す。", "Mục nhập bắt buộc dùng E01, mục chọn dùng E02. Viền đỏ và hiện câu dưới ô.")),
         X("23.1", "区分・商品のエラー", "Lỗi loại・hàng hóa", ".fld::作れる商品（複数選択可）", "label", err=["E02"], detail=("1つも選んでいないとき E02。", "Không chọn gì thì E02.")),
         X("23.2", "同意のエラー", "Lỗi đồng ý", ".errmsg::同意", "label", err=["E527"], detail=("同意がなければ E527 を同意の下に出す。", "Chưa đồng ý thì hiện E527 dưới ô đồng ý.")),
     ]},
    {"id": "013", "code": "SW_AUTH_003", "state": ["② 確認", "② Xác nhận"],
     "url": "/supplier/apply", "full": True, "wait": 500, "setup": _APPLY + "btn('確認画面へ').click(); await sleep(500);",
     "note": ["すべて入力して「確認画面へ」を押したあと。入力欄は読み取り専用になる。", "Sau khi nhập đủ và bấm 「確認画面へ」. Các ô nhập chuyển sang chỉ đọc."],
     "items": [
         X("24", "確認の案内", "Hướng dẫn xác nhận", ".notice", "label", detail=("「内容をご確認のうえ、「この内容で申し込む」を押してください。」入力欄は変えられない。", "「内容をご確認のうえ、「この内容で申し込む」を押してください。」 Không sửa được các ô.")),
         X("24.1", "修正する", "Nút 「修正する」", "button::修正する", "button", "click", detail=("① 入力に戻る（入力した内容は残す）。", "Quay lại ① nhập (giữ nội dung đã nhập).")),
         X("24.2", "この内容で申し込む", "Nút 「この内容で申し込む」", "button::この内容で申し込む", "button", "click", err=["E30"], detail=("申込を送り、受付番号（SA-YYYYMMDD-NNNN）を発行して ③ 完了へ。運営の「申込の確認」に「申込中」で入る。押したら無効にする。送れなかったときは E30。", "Gửi đăng ký, cấp mã tiếp nhận (SA-YYYYMMDD-NNNN) và sang ③ hoàn tất. Vào 「申込の確認」 của 運営 ở trạng thái 「申込中」. Khóa nút sau khi bấm. Không gửi được thì E30.")),
     ]},
    {"id": "014", "code": "SW_AUTH_003", "state": ["③ 完了", "③ Hoàn tất"],
     "url": "/supplier/apply", "full": True, "wait": 500, "setup": _APPLY + "btn('確認画面へ').click(); await sleep(500); btn('この内容で申し込む').click(); await sleep(900);",
     "note": ["申込を送ったあと。受付番号つきの完了の案内だけを出す（メール S9 をメイン担当者へ送る）。", "Sau khi gửi đăng ký. Chỉ hiện thông báo hoàn tất kèm mã tiếp nhận (gửi email S9 cho người phụ trách chính)."],
     "items": [
         X("25", "受付完了の案内", "Thông báo tiếp nhận hoàn tất", ".notice", "label", err=["S402"], detail=("受付番号 SA-YYYYMMDD-NNNN を出す。承認すると運営がアカウントを発行し、初期パスワードをメイン担当者へメールで送る（却下のときは理由つきのメール S11）。", "Hiện mã tiếp nhận SA-YYYYMMDD-NNNN. Khi duyệt, 運営 cấp tài khoản và gửi mật khẩu ban đầu qua email cho người phụ trách chính (từ chối thì gửi email S11 kèm lý do).")),
         X("25.1", "ログイン画面へ戻る", "Nút 「ログイン画面へ戻る」", "a.btn.pri", "link", "click", detail=("ログイン（SW_AUTH_001）へ。", "Đến đăng nhập (SW_AUTH_001).")),
     ]},
]
