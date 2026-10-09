# -*- coding: utf-8 -*-
"""
委託配送先Web「配送スタッフ（一覧・詳細・登録・CSV取込）」（OW_STAF）の画面設計書データ。
元：本物の Web（app/carrier/staff/page.tsx・[id]/page.tsx・new/page.tsx・import/page.tsx・_parts.tsx・_ui/csv.tsx・lib/carrier/{logic,area}.ts・lib/csv/sites.ts の carrierStaff・components/csv/CsvImportModal.tsx）。
決定：docs/決定台帳.md F（2026-10-07：パスワードの扱い＝初期パスワードはシステムが作ってメールで送る・認証コード4桁5分・パスワード形式／免許証が未登録のときはアカウントを発行できない）、
      台帳 B（スタッフ登録・ID 自動採番・パスワード再設定の代行）、台帳 M-1・M-3（削除は論理削除・CSV の登録・免許がないスタッフにはアカウントを出さない）、台帳 K（一覧の標準）、
      確認メモ_TW_委託配送先 §3（H-1〜H-7・H-37〜H-39）。
コードがまだ決定に追いついていないところは demo_ok。決定済み（台帳 F 2026-10-07）：Q-6 の画面の登録（写真なしでも登録でき自動で「免許未登録」）・Q-8（既存アカウントは触らない）。決定（台帳 S・2026-10-08）：#432 雇用形態（社員／個人事業主）・所属先は残す・#452 削除できない条件（担当中の配送、または保冷バッグ・保冷剤の未返却）・#475 配送スタッフの「区分」は持たない（#466 は取り消し）・#467 未返却の数え方（紛失・廃棄は数えない）。
見本データで撮れない状態（アカウント未発行・免許未登録・削除済みの初期状態）は、操作で作るか demo_ok に理由を書く。
"""

TITLE = ["配送スタッフ（OW_STAF）", "Nhân viên giao hàng (OW_STAF)"]
SHEET = ["配送スタッフ", "Nhân viên giao hàng"]
BASENAME = "画面設計書_OW_STAF_配送スタッフ"
IMG_PREFIX = "OW_STAF"
OUT_DIR = "委託配送先Web"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：OW_<機能略>_<3桁>。委託配送先＝OW", "Screen Code theo 台帳 F (2026-10-07): OW_<機能略>_<3 chữ số>. 委託配送先 = OW"]
SITE = "carrier"
SYSTEM = {"ja": "委託配送先Web", "vi": "Web đối tác giao hàng (委託配送先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "carrier", "loginId": "DE00001"}
CODE_PATHS = ["app/carrier", "lib/carrier", "lib/csv", "components/csv", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-08", "target": "OW_STAF_002 No.19.2・OW_STAF_004 No.34.5",
     "q": ["配送スタッフのメールアドレスの重複（E09）と、本人のメールがないとき管理者のメールを入れる件", "Email của nhân viên giao hàng có được trùng không (E09), và việc nhập email quản trị khi nhân viên không có email"],
     "a": ["重複してよい（E09 のメール重複の禁止はやめる）。ログインID は DR＋5桁。管理者のメールを入れてもほかの人と重なって構わない", "Được phép trùng (bỏ E09 cấm trùng email). ID đăng nhập là DR + 5 chữ số. Nhập email quản trị trùng với người khác cũng được"],
     "src": "台帳 F 2026-10-08「配送スタッフのメールアドレス」（hong 回答：役割レビュー 委託配送先Web #2）"},
    {"date": "2026-10-07", "target": "OW_STAF 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_STAF_001 No.4・OW_STAF_002 No.15",
     "q": ["アカウント一括発行の送り方（Q-8）", "Cách gửi khi cấp tài khoản hàng loạt (Q-8)"],
     "a": ["初期パスワードはシステムが作り、ログインIDとあわせてメールで送る（CSV は作らない）。ログイン中のパスワード変更の画面は置かず、変えたいときは認証コード（4桁・5分）で再設定する", "Hệ thống tạo mật khẩu ban đầu và gửi qua email cùng ID đăng nhập (không tạo CSV). Không có màn đổi mật khẩu khi đang đăng nhập; muốn đổi thì đặt lại bằng mã xác thực (4 chữ số, 5 phút)"],
     "src": "hong 回答 2026-10-07（台帳 F「パスワードの扱い」・受付簿 No.291）"},
    {"date": "2026-10-07", "target": "OW_STAF_001 No.4.1・5.1",
     "q": ["免許証が未登録の配送スタッフにアカウントを発行できるか（Q-6）", "Có cấp được tài khoản cho nhân viên chưa đăng ký bằng lái không (Q-6)"],
     "a": ["発行できない。一括発行の確認の表で「発行できません：免許証が未登録です」と出し、メールも送らない", "Không cấp được. Bảng xác nhận cấp hàng loạt hiện 「発行できません：免許証が未登録です」 và không gửi email"],
     "src": "hong 回答 2026-10-07（台帳 F「配送スタッフの免許証」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_STAF_003 No.19.5",
     "q": ["画面の登録で免許証の写真がなくても登録できるか（Q-6 の後半）", "Đăng ký trên màn hình khi chưa có ảnh bằng lái có được không (nửa sau Q-6)"],
     "a": ["写真なしでも登録でき、自動で「免許未登録」になる（CSV と同じ規則）。写真を追加すると「有効」などを選べる。ステータスの「免許未登録」は手で選べない", "Đăng ký được dù chưa có ảnh và tự động thành 「免許未登録」 (cùng quy tắc với CSV). Thêm ảnh thì chọn được 「有効」 v.v. Không chọn tay được trạng thái 「免許未登録」"],
     "src": "hong 決定（台帳 F 2026-10-07「配送スタッフの免許証・プロフィール変更の運営への知らせ方」。確認メモ_TW Q-6）"},
    {"date": "2026-10-08", "target": "OW_STAF_001 No.12・13・13.1・OW_STAF_002 No.16.1・18.6",
     "q": ["配送スタッフを削除できない条件（確認表 H-17）", "Điều kiện không xóa được nhân viên giao hàng (bảng xác nhận H-17)"],
     "a": ["担当中の配送（予定〜再配送待）がある、または保冷バッグ・保冷剤の貸与で未返却（返却数＜貸与数）がある、のどちらでも削除できない。無効にする操作はいつでもできる", "Không xóa được nếu còn chuyến đang phụ trách (予定〜再配送待) hoặc còn túi/đá giữ lạnh chưa trả (số trả < số mượn). Việc đặt trạng thái 無効 luôn làm được"],
     "src": "hong 回答 2026-10-08（台帳 S「配送スタッフを削除できない条件（OW）」・受付簿 #452）。置き換えた旧案：担当中の配送だけ・保冷バッグの貸与は止めない・無効にするときも同じ条件で止める（Claude 推奨 Q-11）"},
    {"date": "2026-10-08", "target": "OW_STAF_001 No.13・13.1",
     "q": ["未返却の保冷バッグ・保冷剤の数え方（確認表 H-17）", "Cách đếm túi/đá giữ lạnh chưa trả (bảng xác nhận H-17)"],
     "a": ["状態が「紛失」「廃棄」の貸与は未返却に数えない（運営が記録した時点で処理済みとみなす）。数えるのは返却数＜貸与数で、紛失・廃棄ではないもの。削除できないモーダルは共通メッセージ E451", "Bản ghi cho mượn có trạng thái 「紛失」「廃棄」 không tính là chưa trả (coi như 運営 đã xử lý khi ghi nhận). Chỉ tính bản ghi số trả < số mượn mà không phải 紛失・廃棄. Modal không xóa được dùng thông điệp chung E451"],
     "src": "hong 回答 2026-10-08（台帳 S「未返却の保冷バッグ・保冷剤の数え方」・受付簿 #467）"},
    {"date": "2026-10-09", "target": "OW_STAF 一覧 No.4.6b・詳細 No.18.4・登録編集 No.29.4・CSV 列",
     "q": ["配送スタッフの「区分」（個人／会社所属）を持つか", "Có giữ 「区分」 (cá nhân／thuộc công ty) của nhân viên giao hàng không"],
     "a": ["持たない。画面（一覧・詳細・登録編集）・検索条件・CSV の列から外す。「雇用形態」（社員／個人事業主）と「所属先」は残す", "Không giữ. Bỏ khỏi màn hình (danh sách・chi tiết・đăng ký/sửa), điều kiện tìm kiếm và cột CSV. Giữ 「雇用形態」 (社員／個人事業主) và 「所属先」"],
     "src": "hong 回答 2026-10-09（台帳 S「配送スタッフの区分を持たない」・受付簿 #475）。置き換えた旧案：区分は所属先から自動で決まり OW は表示だけ（#466・取り消し）"},
    {"date": "2026-10-08", "target": "OW_STAF 項目（雇用形態・所属先）",
     "q": ["配送スタッフの雇用形態（社員／個人事業主）と所属先を残すか（確認表 H-18）", "Có giữ hình thức tuyển dụng (nhân viên／cá nhân kinh doanh) và nơi trực thuộc không (bảng xác nhận H-18)"],
     "a": ["残す。雇用形態（社員／個人事業主）・所属先を、画面（一覧・詳細・登録編集）と CSV に置く（区分は #475 で廃止）。運営の配送スタッフ（AW_DRVR）にも置く", "Giữ lại. Đặt hình thức tuyển dụng (社員／個人事業主), nơi trực thuộc trên màn hình (danh sách・chi tiết・đăng ký/sửa) và CSV. Cũng đặt ở nhân viên giao hàng của 運営 (AW_DRVR) (phân loại đã bỏ ở #475)"],
     "src": "hong 回答 2026-10-08（台帳 S「配送スタッフの雇用形態・所属先（OW・運営）」・受付簿 #432）。置き換えた旧案：雇用形態と所属先を削除（Claude 推奨 Q-18。配送_06 §12-3・REQ-DL-413 の削除は台帳 S で置き換え）"},
    {"date": "2026-10-08", "target": "OW_STAF の文字入力欄（名前・カナ・メール・検索条件）", "q": ["最大文字数を超えたとき（E04）（確認表 X-5）", "Khi vượt số ký tự tối đa (E04) (bảng xác nhận X-5)"], "a": ["入力欄の上限で入力を止める。貼り付け・CSV のときだけ E04 を出す", "Chặn nhập ở giới hạn của ô nhập. Chỉ khi dán hoặc CSV mới hiện E04"], "src": "hong 回答 2026-10-08（台帳 S「最大文字数を超えたとき（E04）」・受付簿 #446）"},
    {"date": "2026-10-07", "target": "OW_STAF_001 No.3.4",
     "q": ["削除済みの配送スタッフの扱い", "Cách xử lý nhân viên giao hàng đã xóa"],
     "a": ["検索条件の既定では出さない。条件「削除済」を「表示する」にすると、灰色の「削除済」バッジつきで出る", "Mặc định điều kiện tìm kiếm không hiện. Đặt điều kiện 「削除済」 là 「表示する」 thì hiện kèm badge xám 「削除済」"],
     "src": "台帳 K・M-1（確認メモ H-6）"},
    {"date": "2026-10-07", "target": "OW_STAF_002 No.16.2",
     "q": ["パスワード再設定の代行のしかた", "Cách đặt lại mật khẩu hộ"],
     "a": ["委託配送先が自社のスタッフにだけ行える。押すと確認（Q302）を出し、登録のメールアドレスへ認証コード（4桁・5分）を送る。コードは画面に出さない", "Đối tác chỉ làm hộ nhân viên của công ty mình. Bấm thì hiện xác nhận (Q302) và gửi mã xác thực (4 chữ số, 5 phút) tới email đã đăng ký. Không hiện mã trên màn hình"],
     "src": "台帳 B・K・F（確認メモ H-12・H-39。確認の画面は基本設計 §1-1 の案で Claude 推奨・hong 確認待ち）"},
    {"date": "2026-10-07", "target": "OW_STAF_002 No.18.8", "q": ["免許証の写真を運営にも見せるか（O-6）", "Có cho 運営 xem ảnh bằng lái không (O-6)"], "a": ["見せる。保存期間は客先に確認する", "Có. Thời gian lưu hỏi khách"], "src": "Claude 推奨・hong 確認待ち（確認メモ_TW §4 の推奨。hong 2026-10-07 の open 回答のうち個別の答えがないもの）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "OW_STAF_001", "ja": "配送スタッフ一覧", "vi": "Danh sách nhân viên giao hàng"},
    {"code": "OW_STAF_002", "ja": "配送スタッフ詳細", "vi": "Chi tiết nhân viên giao hàng"},
    {"code": "OW_STAF_003", "ja": "配送スタッフ登録", "vi": "Đăng ký nhân viên giao hàng"},
    {"code": "OW_STAF_004", "ja": "配送スタッフ CSV取込", "vi": "Nhập CSV nhân viên giao hàng"},
]

def I(no, ja, vi, sel, kind="label", trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d

def V(id, code, ja, vi, url, items, note=None, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": "", "full": True, "wait": 600, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d

H = ("const wait=(ms)=>new Promise(r=>setTimeout(r,ms));"
     "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};"
     "const btn=(sel,t)=>[...document.querySelectorAll(sel)].find(b=>b.textContent.includes(t));"
     "const tick=(n)=>document.querySelector('input[aria-label=\"'+n+'を選択\"]').click();"
     "const readyList=async()=>{for(let i=0;i<40&&!document.querySelector('.tbl tbody tr');i++){await wait(250);}await wait(200);};"
     "const readyDetail=async()=>{for(let i=0;i<40&&!document.querySelector('.tabs');i++){await wait(250);}await wait(300);};"
     "const csv=(name,text)=>{const inp=document.querySelector('input[type=file][accept*=csv]');const dt=new DataTransfer();dt.items.add(new File([text],name,{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));};")
HEAD = "配送スタッフID【空欄＝新規（採番）】,配送スタッフ名,カナ,電話番号,メールアドレス"
CSV_OK = "\\n".join([HEAD, ",山田 花子,ヤマダ ハナコ,090-1111-2222,hanako.yamada@example.jp", ",佐藤 次郎,サトウ ジロウ,090-3333-4444,", ",鈴木 三郎,スズキ サブロウ,090-5555-6666,saburo.suzuki@example.jp"])
CSV_BAD = "名前,年齢,部署\\n山田,30,配送"

CODE_ORG = {"demo_ok": ["コードの一覧・CSV に「所属先」の列がない（詳細・登録の「所属先」は表示がある）。足すのは宿題。コードには「区分」（staffKind。値は「…・委託」など）が残っている。コードを直す宿題：staffKind を外し、画面・CSV の区分の表示と列をなくす（受付簿 #475）", "Danh sách và CSV trong code chưa có cột 「所属先」 (chi tiết・đăng ký có hiển thị). Việc thêm còn tồn. Code vẫn còn 「区分」 (staffKind, giá trị dạng 「…・委託」). Việc sửa code còn tồn: bỏ staffKind, bỏ hiển thị và cột phân loại trên màn hình・CSV (受付簿 #475)"]}
CODE_PAGE = {"demo_ok": ["コードの一覧は並べ替え・ページ送りが実際には動かない（「n件中 1-n件」の見本）（確認メモ H-3・H-4）。宿題", "Danh sách trong code chưa có sắp xếp và phân trang hoạt động (mẫu 「n件中 1-n件」) (確認メモ H-3・H-4). Việc còn tồn"]}

# ------------------------------------------------------------------ 一覧
L1 = [
    I("1", "見出し", "Tiêu đề trang", ".crumb", "area", detail=["パンくず「ホーム ／ 配送スタッフ」。", "Breadcrumb 「ホーム ／ 配送スタッフ」."]),
    I("1.1", "画面名", "Tên màn hình", "h1.ptitle", "label", detail=["画面名は「配送スタッフ」。自社の配送スタッフだけを出す（他社のスタッフは見えない）。", "Tên màn hình là 「配送スタッフ」. Chỉ hiện nhân viên giao hàng của công ty mình (không thấy nhân viên công ty khác)."]),
    I("2", "CSV取込", "Nhập CSV", ".phead button::CSV取込", "button", "click", pattern="P-CSV",
      detail=["見出しの右。配送スタッフの CSV取込の画面（OW_STAF_004）を開く。新しい配送スタッフを登録するだけで、登録済みの人は直せない（詳細で直す）。", "Bên phải tiêu đề. Mở màn nhập CSV nhân viên giao hàng (OW_STAF_004). Chỉ đăng ký nhân viên mới, không sửa được người đã đăng ký (sửa ở chi tiết)."]),
    I("2.1", "CSV出力", "Xuất CSV", ".phead button::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["検索条件のとおりの全件（ページに関係なく）を出す。列：配送スタッフID・配送スタッフ名・カナ・雇用形態・電話番号・メールアドレス・ステータス・アカウント・最終ログイン・所属先。0件のときは押せない。",
              "Xuất toàn bộ dòng theo điều kiện tìm kiếm (không phụ thuộc trang). Cột: ID, tên, tên katakana, hình thức tuyển dụng, điện thoại, email, trạng thái, tài khoản, đăng nhập lần cuối, nơi trực thuộc. 0 dòng thì không bấm được."], **CODE_ORG),
    I("2.2", "アカウント一括発行", "Cấp tài khoản hàng loạt", ".phead button::アカウント一括発行", "button", "click", err=["Q301"],
      detail=["選んだ配送スタッフのアカウントをまとめて発行する（確認 No.5 を開く）。1人も選んでいないときは押せない。ボタンに選んだ人数（n名）を出す。", "Cấp tài khoản hàng loạt cho nhân viên đã chọn (mở xác nhận No.5). Chưa chọn ai thì không bấm được. Nút hiện số người đã chọn (n名)."]),
    I("2.3", "新規登録", "Đăng ký mới", ".phead .btn.pri", "button", "click", detail=["配送スタッフ登録（OW_STAF_003）を開く。", "Mở màn đăng ký nhân viên giao hàng (OW_STAF_003)."]),
    I("3", "検索条件", "Điều kiện tìm kiếm", ".search-row", "area", pattern="P-LIST",
      detail=["検索条件の枠は es-search。「検索」か Enter で反映する。「未適用」の印は出さない。条件は一覧・CSV出力に効く。",
              "Khung điều kiện dùng es-search. Áp dụng khi nhấn 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Điều kiện áp dụng cho danh sách và xuất CSV."],
      demo_ok=["コードは独自の検索行（es-search の部品ではない）で、「未適用」の印は出さない（確認メモ H-1・H-2）。部品を es-search にそろえるのは宿題", "Code dùng hàng tìm kiếm riêng (không phải thành phần es-search), không hiện dấu 「未適用」 (確認メモ H-1・H-2). Việc đưa về es-search còn tồn"]),
    I("3.1", "配送スタッフ名", "Tên nhân viên giao hàng", "input[placeholder=\"配送スタッフ名\"]", "text", "input", req="－", len="文字列 60",
      ex=["山口", "Một phần tên, tên katakana hoặc ID nhân viên"],
      detail=["名前・カナ・配送スタッフIDを部分一致で探す。前後の空白は取り、全角の英数字は半角に直す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo tên, katakana hoặc ID nhân viên. Bỏ khoảng trắng đầu/cuối, đổi chữ số/chữ cái toàn góc sang nửa góc. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("3.2", "ステータス", "Trạng thái", "select[aria-label=\"ステータス\"]", "select", "select", req="－", len="選択", init=["指定なし", "Không chỉ định"], ex=["有効", "Chọn trạng thái"],
      detail=["選択肢：有効・無効・利用停止・免許未登録。", "Lựa chọn: 有効・無効・利用停止・免許未登録."]),
    I("3.3", "雇用形態", "Hình thức tuyển dụng", "select[aria-label=\"雇用形態\"]", "select", "select", req="－", len="選択", init=["指定なし", "Không chỉ định"], ex=["社員", "Chọn 社員 hoặc 個人事業主"],
      detail=["選択肢：社員・個人事業主。", "Lựa chọn: 社員・個人事業主."]),
    I("3.4", "削除済", "Đã xóa", "-", "select", "select", req="－", len="選択", init=["表示しない", "Không hiện"], ex=["表示する", "Chọn hiện hoặc không hiện nhân viên đã xóa"],
      detail=["「表示しない」（既定）か「表示する」。「表示する」にすると、削除した配送スタッフを灰色の「削除済」バッジつきで出す。", "「表示しない」 (mặc định) hoặc 「表示する」. Chọn 「表示する」 thì hiện nhân viên đã xóa kèm badge xám 「削除済」."],
      demo_ok=["コードは削除済みの人を常に表示し、この条件がない（確認メモ H-6）。宿題", "Code luôn hiện người đã xóa và chưa có điều kiện này (確認メモ H-6). Việc còn tồn"]),
    I("3.5", "クリア", "Xóa điều kiện", ".search-row .btn.out", "button", "click", detail=["条件を初期値に戻して再検索する。", "Đưa điều kiện về mặc định và tìm lại."]),
    I("3.6", "検索", "Tìm kiếm", ".search-row .btn.pri", "button", "click", detail=["条件を一覧に反映して1ページ目に戻す。Enter でも同じ。", "Áp dụng điều kiện vào danh sách và quay về trang 1. Nhấn Enter cũng giống vậy."]),
    I("4", "配送スタッフの一覧", "Danh sách nhân viên giao hàng", ".tbl", "table", pattern="P-LIST", err=["I01"],
      detail=["初期の並びは配送スタッフIDの昇順。1ページ 10件（10／20／50）。列見出しを押して全列で並べ替える。名前を押すと詳細（OW_STAF_002）へ。詳細から戻ると条件・ページ・件数を戻す。0件は I01。削除済みの行は薄く出し、チェックと操作は出さない。",
              "Mặc định ID nhân viên tăng dần. 10 dòng/trang (10／20／50). Bấm tiêu đề cột để sắp xếp mọi cột. Bấm tên để mở chi tiết (OW_STAF_002). Quay lại từ chi tiết thì khôi phục điều kiện, trang, số dòng. 0 dòng: I01. Dòng đã xóa hiện nhạt, không có ô chọn và thao tác."], **CODE_PAGE),
    I("4.1", "すべて選択", "Chọn tất cả", ".tbl th input", "check", "check", req="－", len="選択", init=["未選択", "Chưa chọn"], ex=["オン", "Bật/tắt chọn tất cả dòng trong danh sách đang hiện"], detail=["いま表示している人（削除済み以外）をすべて選ぶ／外す。", "Chọn/bỏ chọn mọi người đang hiện (trừ người đã xóa)."]),
    I("4.2", "行の選択", "Chọn dòng", ".tbl tbody input[type=checkbox]", "check", "check", req="－", len="選択", init=["未選択", "Chưa chọn"], ex=["オン", "Chọn dòng để cấp tài khoản hàng loạt"], detail=["アカウント一括発行の対象に選ぶ。削除済みの人は選べない。", "Chọn làm đối tượng cấp tài khoản hàng loạt. Người đã xóa không chọn được."]),
    I("4.3", "免許", "Bằng lái", ".tbl th::免許", "label", detail=["免許証の絵。写真があれば免許証の絵、なければ人の絵（免許未登録）。", "Biểu tượng bằng lái. Có ảnh thì hiện hình bằng lái, chưa có thì hình người (chưa đăng ký bằng lái)."]),
    I("4.4", "配送スタッフID", "ID nhân viên giao hàng", ".tbl th::配送スタッフID", "label", detail=["DR＋5桁。システムが採番する（手で入れない）。ログインIDと同じ。", "DR + 5 chữ số. Hệ thống cấp (không nhập tay). Trùng ID đăng nhập."]),
    I("4.5", "配送スタッフ名", "Tên nhân viên giao hàng", ".tbl th::配送スタッフ名", "link", "click", detail=["名前。押すと詳細へ。", "Tên. Bấm để mở chi tiết."]),
    I("4.6", "雇用形態", "Hình thức tuyển dụng", ".tbl th::雇用形態", "label", detail=["社員／個人事業主（台帳 S・受付簿 #432 で残すと決定）。", "社員／個人事業主 (giữ lại theo quyết định ở 台帳 S・受付簿 #432)."]),
    I("4.6b", "所属先", "Nơi trực thuộc", ".tbl th::所属先", "label", detail=["「{委託配送先名}」。所属先はログイン中の委託配送先（どの行も同じ）。「区分」（個人／会社所属）は持たない（台帳 S・受付簿 #475）。", "「{委託配送先名}」. Nơi trực thuộc là đối tác đang đăng nhập (mọi dòng giống nhau). Không có 「区分」 (cá nhân／thuộc công ty) (台帳 S・受付簿 #475)."], **CODE_ORG),
    I("4.7", "電話番号", "Số điện thoại", ".tbl th::電話番号", "label", detail=["数字とハイフン。", "Chữ số và gạch nối."]),
    I("4.8", "ステータス", "Trạng thái", ".tbl th::ステータス", "label", detail=["有効（緑）・無効（灰）・利用停止（赤）・免許未登録（黄）。削除済みの人には灰色の「削除済」も重ねる。免許証の写真がなければ自動で「免許未登録」になる。", "有効 (xanh lá)・無効 (xám)・利用停止 (đỏ)・免許未登録 (vàng). Người đã xóa có thêm badge xám 「削除済」. Chưa có ảnh bằng lái thì tự động là 「免許未登録」."]),
    I("4.9", "アカウント状態", "Tình trạng tài khoản", ".tbl th::アカウント状態", "label", detail=["「発行済」（緑）か「未発行」。ログイン前の発行済みも「発行済」。", "「発行済」 (xanh lá) hoặc 「未発行」. Đã cấp nhưng chưa đăng nhập cũng là 「発行済」."]),
    I("4.10", "操作", "Thao tác", ".tbl th::操作", "button", "click", detail=["鉛筆＝編集（詳細を編集の状態で開く）、ゴミ箱＝削除（確認 No.8）。削除済みの行には出さない。", "Bút chì = sửa (mở chi tiết ở trạng thái sửa), thùng rác = xóa (xác nhận No.8). Dòng đã xóa không hiện."]),
    I("5", "ページ送り", "Phân trang", ".pager", "area", pattern="P-LIST", detail=["「n件中 a–b件」・ページ番号・表示件数（10／20／50）。", "「n件中 a–b件」, số trang, số dòng hiển thị (10／20／50)."], **CODE_PAGE),
]
L2 = [
    I("6", "絞り込み後の一覧", "Danh sách sau khi lọc", ".tbl", "table", pattern="P-LIST", detail=["名前・ステータス・削除済みの条件のすべてに合う人だけを出す。", "Chỉ hiện người khớp với cả tên, trạng thái và điều kiện đã xóa."]),
]
L3 = [
    I("7", "0件のとき", "Khi 0 dòng", ".tbl tbody", "label", err=["I01"], detail=["I01「表示するデータがありません。」を一覧の中に出す。CSV出力は押せない。", "Hiện I01 「表示するデータがありません。」 trong danh sách. Không bấm được xuất CSV."],
      demo_ok=["コードは0件のとき行を出さず文言もない（確認メモ H-15）。I01 を出すのは宿題", "Code khi 0 dòng không hiện câu nào (確認メモ H-15). Việc hiện I01 còn tồn"]),
]
L4 = [
    I("8", "選択中の表示", "Hiển thị khi đang chọn", ".phead button::アカウント一括発行", "button", "click",
      detail=["1人以上選ぶと「アカウント一括発行（n名）」が押せる。", "Chọn từ 1 người trở lên thì bấm được 「アカウント一括発行（n名）」."]),
]
BULK = [
    I("9", "アカウント一括発行の確認", "Xác nhận cấp tài khoản hàng loạt", ".modal", "modal", err=["Q301", "Q11"],
      detail=["選んだ配送スタッフにログインIDと初期パスワードをメールで送るかを確かめる画面。初期パスワードはシステムが作る。すでにアカウントがある人には何も送らず、パスワードもリセットしない（Claude 推奨・hong 確認待ち）。表に選んだ人と、発行できない理由を出す。背景・Esc・キャンセルで閉じる。",
              "Màn xác nhận có gửi email ID đăng nhập và mật khẩu ban đầu cho nhân viên đã chọn hay không. Mật khẩu ban đầu do hệ thống tạo. Với người đã có tài khoản thì không gửi gì và không đặt lại mật khẩu (Claude đề xuất, chờ hong xác nhận). Bảng hiện người đã chọn và lý do không cấp được. Đóng bằng nền, Esc, キャンセル."],
      demo_ok=["コードの文言は「ログイン情報（ID・パスワード）をメールで送信します。…既存アカウントがある場合、パスワードはリセットされ、再ログインが必要になります」で Q301 と違う（台帳 F 2026-10-07：既存アカウントには何も送らず、リセットしない）。処理は「未発行」のアカウントだけを発行済にして既存アカウントは触らない（決定どおり）が、初期パスワードの生成とメール送信はなく、メールも仮。文言・初期パスワード・メールは宿題", "Câu trong code là 「ログイン情報（ID・パスワード）をメールで送信します。…既存アカウントがある場合、パスワードはリセットされ…」, khác Q301 (台帳 F 2026-10-07: không gửi gì cho tài khoản đã có và không đặt lại mật khẩu). Về xử lý, code chỉ chuyển tài khoản 「未発行」 thành đã phát hành và không đụng tài khoản đã có (đúng quyết định), nhưng chưa tạo mật khẩu ban đầu và chưa gửi email (email giả lập). Việc sửa câu chữ, mật khẩu ban đầu và email còn tồn"]),
    I("9.1", "選んだ配送スタッフの表", "Bảng nhân viên đã chọn", ".modal .tbl", "table",
      detail=["列：No・配送スタッフID・配送スタッフ名・ステータス・メールアドレス。発行できない行は灰色にして、理由を赤い小さな字で添える：I303「発行できません：ステータスが「{状態}」です」・I304「発行できません：メールアドレスが未登録です」・I305「発行できません：免許証が未登録です」。",
              "Cột: STT, ID, tên, trạng thái, email. Dòng không cấp được tô xám và kèm lý do chữ đỏ nhỏ: I303 「発行できません：ステータスが「{状態}」です」・I304 「発行できません：メールアドレスが未登録です」・I305 「発行できません：免許証が未登録です」."], err=["I303", "I304", "I305"]),
    I("9.2", "エラー件数", "Số dòng lỗi", ".modal p.err", "label", err=["W10"],
      detail=["発行できない人がいるとき、表の上に「エラー：n件発生しています。エラーが発生した行は、メール送信の対象外となります。」を出す。", "Khi có người không cấp được thì phía trên bảng hiện 「エラー：n件発生しています。エラーが発生した行は、メール送信の対象外となります。」."]),
    I("9.3", "キャンセル", "Hủy", ".modal footer .btn.out", "button", "click", detail=["画面を閉じる（何も送らない）。", "Đóng màn (không gửi gì)."]),
    I("9.4", "発行する", "Cấp", ".modal footer .btn.pri", "button", "click", err=["S11", "W10"],
      detail=["発行できる人（ステータスが有効・メールあり・免許証あり）だけに発行して、ログインIDと初期パスワードをメールで送る。押したら二重に押せなくする。全員が発行できないときは押せない。", "Chỉ cấp cho người cấp được (trạng thái 有効, có email, có bằng lái) và gửi email ID đăng nhập và mật khẩu ban đầu. Khóa nút sau khi bấm. Không ai cấp được thì không bấm được."]),
]
BULK_OK = [
    I("10", "発行の結果（成功）", "Kết quả cấp (thành công)", ".modal.sm", "modal", err=["S11"],
      detail=["「アカウント発行が完了しました」と、選んだ配送スタッフへの発行とメール送信が終わったことを出す。S11（{n}件のアカウントを発行しました）。ボタンは「完了」。", "Hiện 「アカウント発行が完了しました」 và việc cấp và gửi email cho nhân viên đã chọn đã xong. S11 (đã cấp tài khoản cho {n} người). Nút 「完了」."]),
]
BULK_PART = [
    I("11", "発行の結果（一部エラー）", "Kết quả cấp (có lỗi một phần)", ".modal.sm .hint", "label", err=["W10"],
      detail=["一部が発行できなかったときは「（一部エラーあり）」と、成功の件数・失敗の件数・失敗した人にはメールを送っていないことを出す（W10：n件のうちm件は処理できませんでした）。ボタンは「完了」「再度実行」。", "Khi có người không cấp được hiện 「（一部エラーあり）」 cùng số thành công, số thất bại, và việc người thất bại chưa được gửi email (W10: m trong n mục không xử lý được). Nút 「完了」「再度実行」."],
      demo_ok=["コードの結果の画面は共通メッセージ W10 を使わず、直書きの文言（確認メモ H-17）。宿題", "Màn kết quả trong code không dùng thông điệp chung W10 mà viết trực tiếp (確認メモ H-17). Việc còn tồn"]),
]
DEL = [
    I("12", "削除の確認", "Xác nhận xóa", ".modal.sm", "modal", err=["Q01"], pattern="P-DEL",
      detail=["Q01「{名前}（{ID}）を削除しますか？」。削除すると無効になり、このスタッフには配送を割り当てられなくなる（論理削除。一覧には「削除済」で残る）。ボタンは「キャンセル」「削除する」。削除できたら S02。失敗は E33。", "Q01 「{名前}（{ID}）を削除しますか？」. Xóa thì thành vô hiệu và không gán chuyến cho người này được nữa (xóa logic; vẫn còn ở danh sách với 「削除済」). Nút 「キャンセル」「削除する」. Xóa xong hiện S02. Thất bại: E33."]),
    I("12.1", "削除する", "Xóa", ".modal.sm .btn.pri", "button", "click", err=["S02", "E33"], detail=["配送スタッフを削除して S02。ログインのアカウントも削除済みにする。", "Xóa nhân viên giao hàng và hiện S02. Tài khoản đăng nhập cũng chuyển sang đã xóa."]),
]
DELBLOCK = [
    I("13", "削除できません", "Không xóa được", ".modal.sm", "modal", err=["E412", "E451"],
      detail=["次のどちらかのときは削除できない：①担当中の配送（予定〜再配送待）がある②保冷バッグ・保冷剤の貸与で未返却がある（返却数＜貸与数で、状態が「紛失」「廃棄」ではないもの。紛失・廃棄は運営が記録した時点で処理済みなので数えない：受付簿 #467）。削除できないときは理由を出し、「閉じる」だけを置く。①は E412「{名前}（{ID}）は削除できません。担当中の配送 n件があるため、先に付け替えてください。」。②は E451（No.13.1）。両方あるときは両方の理由を並べる。ステータスを「無効」にする操作はいつでもできる（台帳 S・受付簿 #452）。",
              "Không xóa được nếu thuộc một trong hai: ① còn chuyến đang phụ trách (予定〜再配送待) ② còn túi/đá giữ lạnh chưa trả (số trả < số mượn, trạng thái không phải 「紛失」「廃棄」; 紛失・廃棄 do 運営 ghi nhận là đã xử lý nên không tính: 受付簿 #467). Không xóa được thì hiện lý do và chỉ có nút 「閉じる」. ① là E412 「{名前}（{ID}）は削除できません。担当中の配送 n件があるため、先に付け替えてください。」. ② là E451 (No.13.1). Có cả hai thì xếp cả hai lý do. Việc đặt trạng thái 「無効」 luôn làm được (台帳 S・受付簿 #452)."],
      demo_ok=["コードは種類が「保冷バッグ」・状態が「貸与中」の個数だけを数える（保冷剤を数えず、返却数も見ない）（確認メモ Q-11）。保冷バッグ・保冷剤の未返却（返却数＜貸与数。紛失・廃棄は数えない）にそろえるのは宿題", "Code chỉ đếm số lượng loại 「保冷バッグ」 có trạng thái 「貸与中」 (không đếm đá giữ lạnh và không xét số trả) (確認メモ Q-11). Việc đồng nhất với túi/đá giữ lạnh chưa trả (số trả < số mượn, trừ 紛失・廃棄) còn tồn"]),
    I("13.1", "未返却の保冷バッグ・保冷剤", "Túi/đá giữ lạnh chưa trả", "-", "label", err=["E451"],
      detail=["削除を止める理由の②。保冷バッグ台帳（運営Web：AW_COOL）の、この配送スタッフに渡した貸与の記録のうち、返却数が貸与数より少なく、状態が「紛失」「廃棄」ではないもの（種類は保冷バッグ・保冷剤の両方。紛失・廃棄は運営が記録した時点で処理済みとみなし、数えない：受付簿 #467）。理由には未返却の個数を出す（例：未返却の保冷バッグ 3個・保冷剤 2個）。返却は運営が台帳に返却日・返却数を入れる（この画面では返却を記録しない）。文言は共通メッセージ E451「{名前}（{ID}）は削除できません。未返却の{種類}（{n}個）があるため、先に返却を記録してください。」（「先に付け替えてください」は未返却には合わないため別）。",
              "Lý do chặn xóa ②. Trong các bản ghi cho mượn của sổ túi giữ lạnh (Web 運営: AW_COOL) đã giao cho nhân viên này, những bản ghi có số trả ít hơn số mượn và trạng thái không phải 「紛失」「廃棄」 (cả túi giữ lạnh và đá giữ lạnh; 紛失・廃棄 do 運営 ghi nhận là đã xử lý nên không tính: 受付簿 #467). Lý do hiện số lượng chưa trả (ví dụ: túi giữ lạnh chưa trả 3 cái・đá giữ lạnh 2 cái). 運営 nhập ngày trả và số trả vào sổ (màn này không ghi nhận việc trả). Câu chữ dùng thông điệp chung E451 「{名前}（{ID}）は削除できません。未返却の{種類}（{n}個）があるため、先に返却を記録してください。」 (câu 「先に付け替えてください」 không hợp với hàng chưa trả nên dùng câu riêng)."]),
]
CSVOUT = [
    I("14", "CSV出力のトースト", "Toast xuất CSV", ".toast", "toast", "show", err=["S12"], detail=["出力できたら S12「CSVを出力しました（{n}行・{ファイル名}）。」。", "Xuất xong hiện S12 「CSVを出力しました（{n}行・{ファイル名}）。」."]),
]
SHOWDEL = [
    I("15", "削除済みの行", "Dòng đã xóa", ".tbl tr.muted", "label", detail=["削除済みの配送スタッフ。薄く出し、灰色の「削除済」バッジを添える。選べず、編集・削除の操作も出ない。", "Nhân viên giao hàng đã xóa. Hiện nhạt, kèm badge xám 「削除済」. Không chọn được, không có thao tác sửa / xóa."]),
]

# ------------------------------------------------------------------ 詳細
FORM_DETAIL = [
    I("16", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ 配送スタッフ ／ 配送スタッフ詳細」。画面名に配送スタッフID（削除済みは「削除済」バッジ）。他社のスタッフIDは「見つかりません」（No.30）。", "Breadcrumb 「ホーム ／ 配送スタッフ ／ 配送スタッフ詳細」. Tên màn kèm ID nhân viên (người đã xóa có badge 「削除済」). ID nhân viên công ty khác: 「見つかりません」 (No.30)."]),
    I("16.1", "削除", "Xóa", ".phead .btn::削除", "button", "click", err=["Q01", "E412"],
      detail=["削除の確認（Q01）を出す。担当中の配送、または未返却の保冷バッグ・保冷剤があれば削除できない（E412・No.13）。削除済みの人・編集中は出さない。", "Hiện xác nhận xóa (Q01). Còn chuyến đang phụ trách hoặc túi/đá giữ lạnh chưa trả thì không xóa được (E412・No.13). Không hiện với người đã xóa và khi đang sửa."]),
    I("16.2", "パスワード再設定", "Đặt lại mật khẩu", ".phead .btn::パスワード再設定", "button", "click", err=["Q302", "S306"],
      detail=["配送スタッフの代わりに再設定を始める（自社のスタッフだけ）。押すと確認（Q302）を出し、登録のメールアドレスへ認証コード（4桁・有効期限5分）を送る。コードは画面に出さない。送れたら S306。削除済み・編集中は出さない。",
              "Bắt đầu đặt lại mật khẩu thay nhân viên (chỉ nhân viên của công ty mình). Bấm thì hiện xác nhận (Q302) và gửi mã xác thực (4 chữ số, hiệu lực 5 phút) tới email đã đăng ký. Không hiện mã trên màn hình. Gửi xong hiện S306. Không hiện với người đã xóa và khi đang sửa."],
      demo_ok=["コードは確認を出さずすぐ送り、トーストに認証コードと「開発中：メールは仮」を出す・コードは4桁・有効期限は5分で決定どおり（確認メモ H-11・H-12・H-39）。宿題", "Code gửi ngay không xác nhận, toast hiện mã xác thực và 「開発中：メールは仮」, mã 4 chữ số và hiệu lực 5 phút đúng quyết định (確認メモ H-11・H-12・H-39). Việc còn tồn"]),
    I("16.3", "編集", "Sửa", ".phead .btn.pri", "button", "click", detail=["基本情報を編集の状態にする。編集中は他のタブへ移れない。削除済みの人には出さない。", "Chuyển thông tin cơ bản sang trạng thái sửa. Đang sửa thì không sang tab khác được. Không hiện với người đã xóa."]),
    I("17", "タブ", "Tab", ".tabs", "area", pattern="P-TAB", detail=["基本情報・担当配送情報・変更履歴。選んだタブは URL（?tab=）に持つ。", "基本情報・担当配送情報・変更履歴. Tab đang chọn giữ trong URL (?tab=)."],
      demo_ok=["コードのタブは URL ではなく画面の状態（再読み込みで基本情報に戻る）。ただし ?tab= の指定は初めに読む（確認メモ P-TAB）。宿題", "Tab trong code là trạng thái màn hình, không nằm trong URL (tải lại về 基本情報), chỉ đọc ?tab= lúc đầu (確認メモ P-TAB). Việc còn tồn"]),
    I("18", "基本情報", "Thông tin cơ bản", ".collap:nth-of-type(1)", "area", detail=["配送スタッフの基本情報。参照のときは読むだけ、編集のときは入力できる。", "Thông tin cơ bản của nhân viên giao hàng. Xem thì chỉ đọc, sửa thì nhập được."]),
    I("18.1", "配送スタッフID", "ID nhân viên giao hàng", ".collap:nth-of-type(1) .grid3 > .fld:nth-child(1)", "label", detail=["DR＋5桁。変えられない（自動採番）。", "DR + 5 chữ số. Không đổi được (tự động cấp)."]),
    I("18.2", "配送スタッフ名", "Tên nhân viên giao hàng", "#sf_name", "text", "input", req="○", len="文字列 60", ex=["斉藤 健太", "Họ tên nhân viên giao hàng (tối đa 60 ký tự)"], err=["E01", "E04", "E13"],
      detail=["姓名。前後の空白を取る。絵文字は不可（E13）。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Họ tên. Bỏ khoảng trắng đầu/cuối. Không nhận emoji (E13). Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."],
      demo_ok=["コードは最大文字数の制限がなく、未入力の文言は「配送スタッフ名を入力してください。」（確認メモ H-7・H-9）。宿題。入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題", "Code chưa giới hạn số ký tự và câu khi để trống là 「配送スタッフ名を入力してください。」 (確認メモ H-7・H-9). Việc còn tồn。Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn"]),
    I("18.3", "配送スタッフ名カナ", "Tên katakana", "#sf_kana", "text", "input", req="○", len="文字列 60", ex=["サイトウ ケンタ", "Katakana toàn góc, dài tối đa 60 ký tự"], err=["E01", "E03", "E04"],
      detail=["全角カタカナ・長音・スペース。全角でないカタカナは E03。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Katakana toàn góc, trường âm, khoảng trắng. Katakana không toàn góc: E03. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("18.4", "所属先", "Nơi trực thuộc", ".collap:nth-of-type(1) .grid3 > .fld:nth-child(4)", "label",
      detail=["「{委託配送先名}（{ID}）」。所属先はログイン中の委託配送先で、変えられない。参照のときも編集のときも読むだけ（台帳 S・受付簿 #432）。「区分」（個人／会社所属）は持たない（受付簿 #475）。",
              "「{委託配送先名}（{ID}）」. Nơi trực thuộc là đối tác đang đăng nhập, không đổi được. Chỉ đọc cả khi xem lẫn khi sửa (台帳 S・受付簿 #432). Không có 「区分」 (cá nhân／thuộc công ty) (受付簿 #475).",],
      demo_ok=["コードの値は「委託配送先名（ID）・委託」で、「区分」（staffKind）の表示が付いている。コードを直す宿題：staffKind と区分の表示を外す（受付簿 #475）", "Giá trị trong code là 「委託配送先名（ID）・委託」, có kèm hiển thị 「区分」 (staffKind). Việc sửa code còn tồn: bỏ staffKind và hiển thị phân loại (受付簿 #475)"]),
    I("18.5", "雇用形態", "Hình thức tuyển dụng", "#sf_kbn", "select", "select", req="○", len="選択", init=["社員", "Nhân viên"], ex=["社員", "Chọn 社員 hoặc 個人事業主"],
      detail=["「社員」か「個人事業主」を選ぶ。登録のときの初期値は「社員」。台帳 S・受付簿 #432 で残すと決定。利用者が選ぶ。", "Chọn 「社員」 hoặc 「個人事業主」. Giá trị ban đầu khi đăng ký là 「社員」. Giữ lại theo 台帳 S・受付簿 #432.  Do người dùng chọn."],
      ),
    I("18.6", "ステータス", "Trạng thái", "#sf_st", "select", "select", req="○", len="選択", init=["有効", "有効 (hiệu lực)"], ex=["有効", "Chọn trạng thái; 免許未登録 do hệ thống tự đặt"],
      detail=["選択肢：有効・無効・利用停止。「免許未登録」は手で選べない（免許証の写真がなければ自動でこの状態。写真を追加したら有効などを選べる）。「無効」にすると配送を割り当てられなくなる（即時無効化）。「無効」「利用停止」にする操作は、担当中の配送や未返却の保冷バッグ・保冷剤があってもいつでもできる（削除だけが止まる：台帳 S・受付簿 #452）。無効と利用停止の違い（誰が設定するか）は台帳に未記載。",
              "Lựa chọn: 有効・無効・利用停止. Không chọn tay 「免許未登録」 (chưa có ảnh bằng lái thì tự động là trạng thái này; thêm ảnh thì chọn 有効 v.v.). Đặt 「無効」 thì không gán chuyến được nữa (vô hiệu ngay). Việc đặt 「無効」「利用停止」 luôn làm được, kể cả khi còn chuyến đang phụ trách hoặc túi/đá giữ lạnh chưa trả (chỉ việc xóa bị chặn: 台帳 S・受付簿 #452). Khác biệt giữa 無効 và 利用停止 (ai được đặt) chưa có trong 台帳."],
      demo_ok=["コードは「免許未登録」を手で選べる（確認メモ Q-6・C 案）。。宿題", "Code cho chọn tay 「免許未登録」 (確認メモ Q-6, phương án C). Việc còn tồn"]),
    I("18.7", "電話番号", "Số điện thoại", "#sf_tel", "text", "input", req="－", len="文字列 20", ex=["090-1234-5678", "Chữ số và gạch nối, 10〜11 chữ số"], err=["E06"],
      detail=["数字とハイフン。ハイフンを除いて10〜11桁。", "Chữ số và gạch nối. Bỏ gạch nối còn 10〜11 chữ số."]),
    I("18.8", "免許証", "Bằng lái", ".licup, .collap:nth-of-type(1) .lic", "file", "upload", req="－", len=["JPG・PNG・PDF・HEIC・1件5MB", "JPG, PNG, PDF, HEIC, 5MB/tệp"], ex=["（免許証の写真）", "Ảnh bằng lái (mặt trước)"], err=["E11", "E411"],
      detail=["免許証の写真。写真があれば免許証の絵、なければ人の絵。編集のときは「写真を追加」で追加・差し替え。写真がなくても保存でき、その場合はステータスが自動で「免許未登録」になる（Q-6：台帳 F 2026-10-07 で決定済み）。運営は免許証の写真を見られる（台帳 F 2026-10-07 で決定済み）。保存期間は客先に確認する。",
              "Ảnh bằng lái. Có ảnh thì hiện hình bằng lái, chưa có thì hình người. Khi sửa thì thêm / thay bằng 「写真を追加」. Không có ảnh vẫn lưu được, khi đó trạng thái tự động là 「免許未登録」 (Q-6: Claude đề xuất). 運営 xem được ảnh bằng lái (Claude đề xuất, chờ hong xác nhận). Thời gian lưu cần hỏi khách."],
      open=["免許証の写真の保存期間が決まっていない。客先に確認する", "Chưa quyết thời gian lưu ảnh bằng lái. Cần hỏi khách"], ask="お客様（ESキッチン）",
      demo_ok=["コードは写真が必須で、形式・大きさのチェックがない（確認メモ Q-6・H-19）。宿題", "Code bắt buộc có ảnh và không kiểm tra định dạng / dung lượng (確認メモ Q-6・H-19). Việc còn tồn"]),
    I("19", "ログイン情報", "Thông tin đăng nhập", ".collap:nth-of-type(2)", "area", detail=["ログインに使う情報。ログイン中のパスワード変更はここに置かない（再設定のみ）。", "Thông tin dùng để đăng nhập. Không đặt đổi mật khẩu khi đang đăng nhập ở đây (chỉ đặt lại)."]),
    I("19.1", "ログインID", "ID đăng nhập", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(1)", "label", detail=["配送スタッフIDと同じ。変えられない。", "Giống ID nhân viên giao hàng. Không đổi được."]),
    I("19.2", "メールアドレス", "Địa chỉ email", "#sf_email", "text", "input", req="○", len="文字列 160", ex=["dr00011@driver.example.jp", "Email để nhận thông tin đăng nhập (tối đa 160 ký tự)"], err=["E01", "E07", "E04"],
      detail=["ログイン情報・認証コードを送るメールアドレス（必須）。本人のメールがなければ管理者のメールを入れる。ほかの配送スタッフと同じメールアドレスでもよい（重複してよい：台帳 F 2026-10-08）。形式が違えば E07。入力欄は160文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Email nhận thông tin đăng nhập và mã xác thực (bắt buộc). Không có email cá nhân thì nhập email của quản trị viên. Được phép trùng với email của nhân viên khác (台帳 F 2026-10-08). Sai định dạng: E07. Ô nhập bị chặn ở giới hạn 160 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("19.3", "最終ログイン日時", "Thời điểm đăng nhập lần cuối", ".collap:nth-of-type(2) .grid3 > .fld:nth-child(3)", "label", detail=["yyyy-mm-dd HH:MM。まだログインしていなければ「—」。", "yyyy-mm-dd HH:MM. Chưa đăng nhập thì 「—」."]),
]
EDITING = [
    I("20", "編集の状態", "Trạng thái đang sửa", ".phead .btn.pri", "button", "click", pattern="P-FORM", err=["S01", "E31", "I02", "Q02"],
      detail=["「編集」で基本情報が入力できる状態になり、見出しの右が「キャンセル」「保存」に替わる。保存でまとめてチェックし、できたら S01。ほかの人が開いていれば I02、あとから保存した方は E31。変更したままの離脱・キャンセルは Q02。編集中は他のタブへ移れない。保存は見出しの「保存」1つ。",
              "「編集」 chuyển thông tin cơ bản sang trạng thái nhập được, bên phải tiêu đề đổi thành 「キャンセル」「保存」. 「保存」 kiểm tra gộp, xong hiện S01. Người khác đang mở thì I02, người lưu sau bị E31. Rời / hủy khi đã thay đổi: Q02. Đang sửa thì không sang tab khác được. Lưu bằng 1 nút 「保存」 ở tiêu đề."],
      demo_ok=["コードのトーストは「配送スタッフ情報を保存しました」（共通メッセージを使っていない・確認メモ H-17）。宿題", "Toast trong code là 「配送スタッフ情報を保存しました」 (chưa dùng thông điệp chung, 確認メモ H-17). Việc còn tồn"]),
]
ERRS = [
    I("21", "入力エラー", "Lỗi nhập", ".collap .err", "label", err=["E01", "E03", "E07"],
      detail=["「保存」で、配送スタッフ名・カナ・メールアドレスが空なら E01、カナが全角カタカナでなければ E03、メールの形式が違えば E07 を項目の下に出して赤枠にする（P-FORM）。免許証の写真がなくてもエラーにしない（自動で免許未登録）。",
              "Khi 「保存」 mà tên, katakana, email để trống thì E01, katakana không toàn góc thì E03, sai định dạng email thì E07 — hiện dưới mục và viền đỏ (P-FORM). Không có ảnh bằng lái cũng không lỗi (tự động là 免許未登録)."],
      demo_ok=["コードの文言は「配送スタッフ名を入力してください。」ほか（共通メッセージ未使用）で、免許証の写真がないと「免許証の写真を追加してください。」になる（確認メモ Q-6・H-9）。宿題", "Câu trong code là 「配送スタッフ名を入力してください。」 v.v. (chưa dùng thông điệp chung) và thiếu ảnh bằng lái thì lỗi 「免許証の写真を追加してください。」 (確認メモ Q-6・H-9). Việc còn tồn"]),
]
DELIV = [
    I("22", "担当配送情報", "Thông tin chuyến phụ trách", ".tabs button.on", "tab", "click", detail=["この配送スタッフが担当する配送の一覧。期間・状態で絞り、集金・駐車の合計を出す。", "Danh sách chuyến nhân viên này phụ trách. Lọc theo khoảng thời gian, trạng thái và hiện tổng thu tiền / đỗ xe."]),
    I("22.1", "期間・状態の条件", "Điều kiện khoảng thời gian, trạng thái", ".search-row", "area", pattern="P-LIST",
      detail=["期間（開始日・終了日。初期は今日の20日前〜10日後）と状態で絞る。表と合計は絞った結果の全件から出す。「検索」か Enter で反映。", "Lọc theo khoảng thời gian (từ ngày, đến ngày; mặc định 20 ngày trước đến 10 ngày sau hôm nay) và trạng thái. Bảng và tổng tính trên toàn bộ kết quả đã lọc. Áp dụng khi 「検索」 hoặc Enter."],
      demo_ok=["コードの期間・状態の入力は動かない（未接続）（確認メモ H-38）。宿題", "Ô khoảng thời gian / trạng thái trong code chưa hoạt động (chưa nối) (確認メモ H-38). Việc còn tồn"]),
    I("22.2", "集金・駐車の合計", "Tổng thu tiền / đỗ xe", ".stat", "label", detail=["集金合計金額（税込）・駐車合計料金（税込）。絞り込んだ全件の合計（ページに関係なく）。", "Tổng tiền thu (gồm thuế) và tổng phí đỗ xe (gồm thuế). Tổng của toàn bộ kết quả đã lọc (không phụ thuộc trang)."]),
    I("22.3", "担当配送の表", "Bảng chuyến phụ trách", ".tbl", "table", pattern="P-LIST", err=["I01"],
      detail=["列：納品日・温度帯・配送No・引取先・届け先拠点名・届け先住所・配送状況・配送区分・集金合計金額（税込）・駐車合計料金（税込）。初期の並びは納品日の降順。1ページ 10件（10／20／50）・全列で並べ替え。配送Noを押すと配送詳細（OW_DELV_002）へ。0件は I01。",
              "Cột: ngày giao, vùng nhiệt, số giao hàng, nơi lấy hàng, tên 拠点 nơi giao, địa chỉ nơi giao, tình trạng giao, loại giao hàng, tổng thu (gồm thuế), tổng đỗ xe (gồm thuế). Mặc định ngày giao giảm dần. 10 dòng/trang (10／20／50), sắp xếp mọi cột. Bấm số giao hàng để mở chi tiết giao hàng (OW_DELV_002). 0 dòng: I01."],
      demo_ok=["コードの表は全件で、ページ送り・並べ替えがない（確認メモ H-3・H-4）。宿題", "Bảng trong code hiện toàn bộ, không có phân trang và sắp xếp (確認メモ H-3・H-4). Việc còn tồn"]),
]
HIST = [
    I("23", "変更履歴", "Lịch sử thay đổi", ".tbl", "table", pattern="P-HIST",
      detail=["この配送スタッフへの操作の記録。列：変更日時・変更内容・変更者。新しいものが上。直せない・消せない。1回の保存で変わった項目は1つの操作にまとめる。", "Nhật ký thao tác đối với nhân viên này. Cột: ngày giờ thay đổi, nội dung thay đổi, người thay đổi. Mới nhất ở trên. Không sửa, không xóa được. Các mục đổi trong 1 lần lưu gộp thành 1 thao tác."]),
]
DELSTAFF = [
    I("24", "削除済みのスタッフ", "Nhân viên đã xóa", ".ptitle .badge", "label",
      detail=["削除済みの人は詳細を開くと、見出しに灰色の「削除済」バッジを出し、編集・削除・パスワード再設定のボタンを出さない（編集できない）。変更履歴・担当配送情報は見られる。", "Mở chi tiết người đã xóa thì tiêu đề có badge xám 「削除済」 và không hiện nút sửa, xóa, đặt lại mật khẩu (không sửa được). Vẫn xem được lịch sử thay đổi và chuyến phụ trách."]),
]
RESETCONF = [
    I("25", "パスワード再設定の確認", "Xác nhận đặt lại mật khẩu", "-", "modal", err=["Q302"],
      detail=["「パスワード再設定」を押すと Q302「パスワードを再設定しますか？／登録のメールアドレスへ認証コードを送ります。」を出す。ボタンは「キャンセル」「再設定する」。", "Bấm 「パスワード再設定」 thì hiện Q302 「パスワードを再設定しますか？／登録のメールアドレスへ認証コードを送ります。」. Nút 「キャンセル」「再設定する」."],
      demo_ok=["コードはパスワード再設定の代行を確認なしですぐ送る。台帳に確認の有無の決定はない（基本設計 §1-1「送信は確認」の案・hong 確認待ち）", "Code gửi ngay việc đặt lại mật khẩu hộ mà không xác nhận. Trong 台帳 chưa có quyết định về việc có xác nhận hay không (đề xuất 基本設計 §1-1 「送信は確認」, chờ hong xác nhận)"]),
]
RESETDONE = [
    I("26", "再設定の送信結果", "Kết quả gửi đặt lại mật khẩu", ".toast", "toast", "show", err=["S306"],
      detail=["送れたら S306「パスワード再設定の認証コードを{メールアドレス}に送りました（有効期限{n}分）。」（n＝5）。認証コードそのものは画面に出さない。本人はログイン画面の「パスワードを忘れた方」でコードを入れて新しいパスワードを決める。", "Gửi xong hiện S306 「パスワード再設定の認証コードを{メールアドレス}に送りました（有効期限{n}分）。」 (n = 5). Không hiện bản thân mã xác thực trên màn hình. Nhân viên nhập mã ở 「パスワードを忘れた方」 của màn đăng nhập để đặt mật khẩu mới."],
      demo_ok=["コードのトーストは認証コードと「開発中：メールは仮」を出し、有効期限は5分（決定どおり）と表示する（確認メモ H-12・H-39）。宿題", "Toast trong code hiện mã xác thực và 「開発中：メールは仮」, hiển thị hiệu lực 5 phút (đúng quyết định) (確認メモ H-12・H-39). Việc còn tồn"]),
]
LEAVE = [
    I("27", "編集中に離れる確認", "Xác nhận khi rời lúc đang sửa", ".modal.sm", "modal", err=["Q02"], pattern="P-FORM",
      detail=["変更したまま、サイドメニュー・ヘッダーなどで別の画面へ移ろうとしたら Q02（キャンセル／破棄）を出す。ブラウザを閉じる・再読み込みでも同じ。", "Đã đổi mà định chuyển sang màn khác bằng menu bên, header v.v. thì hiện Q02 (キャンセル／破棄). Đóng trình duyệt hoặc tải lại cũng giống vậy."]),
]
NOTFOUND = [
    I("28", "見つからないときの表示", "Hiển thị khi không tìm thấy", ".placeholder", "area", err=["I400"],
      detail=["他社のスタッフID・存在しないIDは I400「配送スタッフが見つかりません。」と「配送スタッフ一覧に戻る」を出す。他社のデータの有無は分からないようにする。", "ID nhân viên của công ty khác hoặc không tồn tại: hiện I400 「配送スタッフが見つかりません。」 và nút 「配送スタッフ一覧に戻る」. Không để lộ việc dữ liệu của công ty khác có tồn tại hay không."],
      demo_ok=["コードの文言は「配送スタッフ {ID} は見つかりません。」（確認メモ H-15・I400）。宿題", "Câu trong code là 「配送スタッフ {ID} は見つかりません。」 (確認メモ H-15・I400). Việc còn tồn"]),
]

# ------------------------------------------------------------------ 登録
NEW1 = [
    I("29", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ 配送スタッフ ／ 配送スタッフ登録」。見出しの右に「キャンセル」「登録」。", "Breadcrumb 「ホーム ／ 配送スタッフ ／ 配送スタッフ登録」. Bên phải tiêu đề có 「キャンセル」「登録」."]),
    I("29.1", "キャンセル", "Hủy", ".phead .btn:not(.pri)", "button", "click", err=["Q02"], detail=["一覧へ戻る。入力を変えていたら Q02。", "Về danh sách. Đã sửa thì hiện Q02."]),
    I("29.2", "登録", "Đăng ký", ".phead .btn.pri", "button", "click", pattern="P-FORM", err=["S151", "E30"],
      detail=["まとめてチェックして登録する。ID は DR＋5桁の続き番号で自動採番（手で入れない）。登録できたら S151「登録しました。」を出し、詳細（OW_STAF_002）へ移る。免許証の写真がなくても登録でき、ステータスは自動で「免許未登録」（アカウントは発行しない）。押したら二重に押せなくする。失敗は E30。",
              "Kiểm tra gộp rồi đăng ký. ID được cấp tự động dạng DR + 5 chữ số kế tiếp (không nhập tay). Đăng ký xong hiện S151 「登録しました。」 và chuyển sang chi tiết (OW_STAF_002). Không có ảnh bằng lái vẫn đăng ký được, trạng thái tự động là 「免許未登録」 (không cấp tài khoản). Khóa nút sau khi bấm. Thất bại: E30."],
      demo_ok=["コードは免許証の写真が必須で、トーストは「配送スタッフを登録しました」（確認メモ Q-6・H-17）。宿題", "Code bắt buộc có ảnh bằng lái và toast là 「配送スタッフを登録しました」 (確認メモ Q-6・H-17). Việc còn tồn"]),
    I("29.3", "配送スタッフID", "ID nhân viên giao hàng", ".collap:nth-of-type(1) .grid3 > .fld:nth-child(1)", "label", detail=["「配送スタッフID（自動採番）」。入力させない。", "「配送スタッフID（自動採番）」. Không cho nhập."]),
    I("29.4", "基本情報の入力欄", "Các ô nhập thông tin cơ bản", ".collap:nth-of-type(1)", "area", detail=["配送スタッフ名・カナ・雇用形態・電話番号・ステータス・免許証（No.18.2〜18.8 と同じ）。所属先は表示だけ（No.18.4）。区分の欄は置かない（受付簿 #475）。ステータスの初期値は「有効」で、写真がなければ登録のとき「免許未登録」になる。", "Tên, katakana, hình thức tuyển dụng, điện thoại, trạng thái, bằng lái (giống No.18.2〜18.8). Nơi trực thuộc chỉ hiển thị (No.18.4). Giá trị ban đầu của trạng thái là 「有効」 và nếu chưa có ảnh thì khi đăng ký thành 「免許未登録」."]),
    I("29.5", "ログイン情報の入力欄", "Các ô nhập thông tin đăng nhập", ".collap:nth-of-type(2)", "area", detail=["メールアドレス（必須。No.19.2 と同じ）。ログインIDと最終ログインは出さない。", "Email (bắt buộc; giống No.19.2). Không hiện ID đăng nhập và đăng nhập lần cuối."]),
]
NEW2 = [
    I("30", "登録の入力エラー", "Lỗi nhập khi đăng ký", ".collap .err", "label", err=["E01", "E03", "E07"],
      detail=["空のまま「登録」を押したら、配送スタッフ名・カナ・メールアドレスに E01（形式違いは E03・E07）を項目の下に出す。免許証の写真がなくてもエラーにしない。", "Bấm 「登録」 khi để trống thì tên, katakana, email hiện E01 (sai định dạng: E03・E07) dưới mục. Không có ảnh bằng lái cũng không lỗi."],
      demo_ok=["コードは免許証の写真がないと「免許証の写真を追加してください。」を出す（確認メモ Q-6）。宿題", "Code hiện 「免許証の写真を追加してください。」 khi chưa có ảnh bằng lái (確認メモ Q-6). Việc còn tồn"]),
]
NEW3 = [
    I("31", "登録完了", "Đăng ký hoàn tất", ".toast", "toast", "show", err=["S151"],
      detail=["S151「登録しました。」のトーストを出して、登録した配送スタッフの詳細（OW_STAF_002）へ移る。", "Hiện toast S151 「登録しました。」 và chuyển sang chi tiết nhân viên vừa đăng ký (OW_STAF_002)."]),
]

# ------------------------------------------------------------------ CSV取込
CSV1 = [
    I("32", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ 配送スタッフ ／ 配送スタッフ CSV取込」。見出しの右に「ファイルを選び直す／キャンセル」「登録」。", "Breadcrumb 「ホーム ／ 配送スタッフ ／ 配送スタッフ CSV取込」. Bên phải tiêu đề có 「ファイルを選び直す／キャンセル」「登録」."]),
    I("32.1", "キャンセル", "Hủy", ".phead .btn.out", "button", "click", detail=["一覧へ戻る（確認のステップでは「ファイルを選び直す」）。", "Về danh sách (ở bước xác nhận là 「ファイルを選び直す」)."]),
    I("33", "取込の手順", "Các bước nhập", "ol[aria-label=\"取込の手順\"]", "label", pattern="P-CSV", detail=["「1 ファイルを選ぶ」→「2 確認・登録」。いまの手順を太字にする。", "「1 ファイルを選ぶ」→「2 確認・登録」. Bước hiện tại in đậm."]),
    I("33.1", "説明", "Giải thích", ".hint", "label", detail=["1行＝1人（配送スタッフIDは空欄）。配送スタッフ名・カナ（全角カタカナ）・メールアドレスは必須。雇用形態（社員／個人事業主）も入れる。免許証の写真は CSV で送れないため「免許未登録」で登録する（スタッフ詳細で写真を追加する）。新しい配送スタッフの登録だけで、登録済みの人は変えられない。UTF-8 の CSV・5,000行まで。エラーの行は取り込まず、ほかの行を登録する。", "1 dòng = 1 người (ID để trống). Tên, katakana (toàn góc), email là bắt buộc. Cũng nhập hình thức tuyển dụng (社員／個人事業主). Ảnh bằng lái không gửi được qua CSV nên đăng ký ở trạng thái 「免許未登録」 (thêm ảnh ở chi tiết nhân viên). Chỉ đăng ký nhân viên mới, không đổi được người đã đăng ký. CSV UTF-8, tối đa 5.000 dòng. Dòng lỗi không nhập, các dòng khác vẫn đăng ký."]),
    I("33.2", "ファイルを選ぶ", "Chọn tệp", ".ph-none, button::ファイルを選ぶ", "file", "upload", req="○", len=["CSV（UTF-8）・5,000行まで", "CSV (UTF-8), tối đa 5.000 dòng"], ex=["staff.csv", "Tệp CSV UTF-8 theo mẫu CSV出力 (xem sheet CSVテンプレート)"], err=["E51"],
      detail=["ボタンを押して選ぶか、枠にドラッグ＆ドロップ。拡張子 .csv の UTF-8 だけ。選ぶとすぐ内容を確かめる（何も登録しない）。テンプレート・いまのデータのボタンは置かない（ひな形は CSV出力を使う）。", "Bấm nút để chọn hoặc kéo-thả vào khung. Chỉ nhận .csv UTF-8. Chọn xong kiểm tra nội dung ngay (chưa đăng ký gì). Không đặt nút mẫu / dữ liệu hiện tại (dùng CSV出力 làm mẫu)."]),
]
CSV_COLS = [
    I("34", "CSVの列の定義", "Định nghĩa cột CSV", "-", "area", pattern="P-CSV",
      detail=["列は CSV出力と同じ（ひな形：docs/05_画面設計書/CSVテンプレート/carrierStaff.csv）。1行目＝見出し。下の 34.1〜34.8 は画面にはなく、定義だけを書く（P-CSV）。雇用形態の列を置く。所属先は読み取りだけの列（台帳 S・受付簿 #432）。区分の列は置かない（受付簿 #475）。", "Cột giống CSV出力 (mẫu: docs/05_画面設計書/CSVテンプレート/carrierStaff.csv). Dòng 1 = tiêu đề. Các mục 34.1〜34.8 dưới đây không có trên màn hình, chỉ ghi định nghĩa (P-CSV). Có cột hình thức tuyển dụng; nơi trực thuộc là cột chỉ đọc (台帳 S・受付簿 #432). Không có cột 「区分」 (受付簿 #475)."],
      demo_ok=["コードの CSV に「所属先」の列がない（雇用形態の列はある）。足すのは宿題。コードの CSV には「区分」の列がある。コードを直す宿題：区分の列を外す（受付簿 #475）", "CSV trong code chưa có cột 「所属先」 (đã có cột 雇用形態). Việc thêm còn tồn. CSV trong code có cột 「区分」. Việc sửa code còn tồn: bỏ cột 区分 (受付簿 #475)"]),
    I("34.1", "配送スタッフID【空欄＝新規（採番）】", "ID nhân viên giao hàng【trống = mới (cấp số)】", "-", "text", "input", req="－", len="DR＋5桁", ex=["（空欄）", "Để trống khi đăng ký mới (hệ thống cấp DRnnnnn)"],
      detail=["空欄＝新規（採番）。入っていれば登録済みの人で、CSV では直せないので「対象外」になる。", "Trống = mới (cấp số). Có giá trị = người đã đăng ký, CSV không sửa được nên là 「対象外」."]),
    I("34.2", "配送スタッフ名", "Tên nhân viên giao hàng", "-", "text", "input", req="○", len="文字列 60", ex=["山田 花子", "Họ tên (tối đa 60 ký tự)"], err=["E01", "E04"], detail=["必須（新規）。60文字まで。CSV では、60文字を超える行に E04 を出す（入力欄はない。台帳 S・受付簿 #446）。", "Bắt buộc (mới). Tối đa 60 ký tự. Với CSV, dòng vượt quá 60 ký tự thì hiện E04 (không có ô nhập. 台帳 S・受付簿 #446)."],
      demo_ok=["コードの CSV の最大文字数は 50（確認メモ H-7）。60にするのは宿題。入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題", "Số ký tự tối đa của CSV trong code là 50 (確認メモ H-7). Việc nâng lên 60 còn tồn。Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn"]),
    I("34.3", "カナ", "Katakana", "-", "text", "input", req="○", len="文字列 60", ex=["ヤマダ ハナコ", "Katakana toàn góc (tối đa 60 ký tự)"], err=["E01", "E03", "E04"], detail=["必須（新規）。全角カタカナ・長音・スペース。60文字まで。CSV では、60文字を超える行に E04 を出す（入力欄はない。台帳 S・受付簿 #446）。", "Bắt buộc (mới). Katakana toàn góc, trường âm, khoảng trắng. Tối đa 60 ký tự. Với CSV, dòng vượt quá 60 ký tự thì hiện E04 (không có ô nhập. 台帳 S・受付簿 #446)."],
      demo_ok=["コードの CSV の最大文字数は 50（確認メモ H-7）。60にするのは宿題。入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題", "Số ký tự tối đa của CSV trong code là 50 (確認メモ H-7). Việc nâng lên 60 còn tồn。Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn"]),
    I("34.3b", "雇用形態", "Hình thức tuyển dụng", "-", "text", "input", req="○", len="文字列 10", ex=["社員", "社員 hoặc 個人事業主"], err=["E02"],
      detail=["必須（新規）。「社員」か「個人事業主」。どちらでもなければその行はエラー（E02）。", "Bắt buộc (mới). 「社員」 hoặc 「個人事業主」. Giá trị khác thì dòng đó bị lỗi (E02)."]),
    I("34.4", "電話番号", "Số điện thoại", "-", "text", "input", req="－", len="文字列 20", ex=["090-1111-2222", "Chữ số và gạch nối, 10〜11 chữ số"], err=["E06"], detail=["任意。数字とハイフン。ハイフンを除いて10〜11桁。", "Tùy chọn. Chữ số và gạch nối. Bỏ gạch nối còn 10〜11 chữ số."]),
    I("34.5", "メールアドレス", "Địa chỉ email", "-", "text", "input", req="○", len="文字列 160", ex=["hanako.yamada@example.jp", "Email nhận thông tin đăng nhập"], err=["E01", "E07"], detail=["必須（新規）。形式が違えば E07。同じファイルの中・登録済みと同じメールアドレスでもよい（重複してよい：台帳 F 2026-10-08）。160文字まで。", "Bắt buộc (mới). Sai định dạng: E07. Được phép trùng trong cùng tệp hoặc trùng với email đã đăng ký (台帳 F 2026-10-08). Tối đa 160 ký tự."],
      demo_ok=["コードの CSV はメールアドレスの重複を禁止している（同じファイルの中・登録済みと同じなら取り込まない）。台帳 F 2026-10-08：重複してよい。外すのは宿題", "CSV trong code cấm trùng email (trùng trong cùng tệp hoặc đã đăng ký thì không nhập). 台帳 F 2026-10-08: được phép trùng. Việc bỏ còn tồn"]),
    I("34.6", "ステータス・アカウント・最終ログイン・所属先", "Trạng thái・Tài khoản・Đăng nhập lần cuối・Nơi trực thuộc", "-", "label", detail=["CSV出力と同じ形にするための読み取りだけの列（所属先もここ）。取込では無視する。新しい人のステータスは、写真がないので自動で「免許未登録」になる。", "Các cột chỉ đọc để cùng dạng với CSV出力 (cả nơi trực thuộc). Khi nhập thì bỏ qua. Trạng thái của người mới tự động là 「免許未登録」 vì chưa có ảnh."]),
]
CSV2 = [
    I("35", "確認（件数）", "Xác nhận (số lượng)", ".page b, .page span.badge", "label", pattern="P-CSV", err=["Q10"],
      detail=["ファイル名・件数と、新規・更新・変更なし・エラーの件数のバッジ。この画面では更新・変更なしは出ない（新規だけ）。「登録」で Q10（CSVを取り込みますか？／新規n件を登録します）を出す。", "Tên tệp, số dòng và badge số lượng mới・cập nhật・không đổi・lỗi. Ở màn này không có cập nhật / không đổi (chỉ mới). Bấm 「登録」 thì hiện Q10 (CSVを取り込みますか？／新規n件を登録します)."],
      demo_ok=["コードのCSV取込は ① ファイルを選ぶ → ② 確認・登録（件数・エラー行・警告を出す画面）の2手順で、「登録」を押すとすぐ登録する。登録前の確認のダイアログ（Q10）は出さない（確認メモ §5-1）。宿題", "Nhập CSV trong code gồm 2 bước ① chọn tệp → ② xác nhận・đăng ký (màn hình hiện số dòng, dòng lỗi, cảnh báo); bấm 「登録」 là đăng ký ngay. Không hiện hộp thoại xác nhận (Q10) trước khi đăng ký (確認メモ §5-1). Việc còn tồn"]),
    I("35.1", "エラーの行", "Dòng lỗi", ".tbl", "table", err=["E52"],
      detail=["「エラーの行 n件は取り込みません」と、行番号・キー・列名・内容の表。ほかの行は「登録」で登録する。「エラー一覧CSV」でエラーの行をファイルに出せる。", "Hiện 「エラーの行 n件は取り込みません」 và bảng số dòng, khóa, tên cột, nội dung. Các dòng khác vẫn đăng ký bằng 「登録」. 「エラー一覧CSV」 xuất các dòng lỗi ra tệp."]),
    I("35.2", "登録する内容", "Nội dung sẽ đăng ký", ".tbl-wrap::変わる項目", "table", detail=["「登録する内容（前 → 後）」の表。新規は後の値だけ。", "Bảng 「登録する内容（前 → 後）」. Dòng mới chỉ hiện giá trị sau."]),
    I("35.3", "免許未登録の説明", "Giải thích 免許未登録", "div::アカウントは発行しません", "label", err=["I306"],
      detail=["I306「免許証の写真がないため「免許未登録」で登録します（アカウントは発行しません）。」を確認の画面に出す。免許未登録の人にはアカウントを発行しない（ログイン情報のメールも送らない）。免許証を登録して有効にしてから、一覧の「アカウント一括発行」で発行する。", "Hiện I306 「免許証の写真がないため「免許未登録」で登録します（アカウントは発行しません）。」 ở màn xác nhận. Không cấp tài khoản cho người 免許未登録 (cũng không gửi email thông tin đăng nhập). Sau khi đăng ký bằng lái và đặt 有効 thì cấp bằng 「アカウント一括発行」 ở danh sách."]),
    I("35.4", "警告の確認", "Xác nhận cảnh báo", ".page input[type=checkbox]", "check", "check", req="条件付き", len="選択", init=["未選択", "Chưa chọn"], ex=["オン", "Tick 「警告を確認しました」"],
      cond=["警告があるときだけ出す。オンにしないと「登録」を押せない", "Chỉ hiện khi có cảnh báo. Không tick thì không bấm được 「登録」"],
      detail=["「警告を確認しました」。免許未登録で登録する警告があるとき、チェックを入れてから「登録」を押せる。", "「警告を確認しました」. Khi có cảnh báo đăng ký 免許未登録 thì phải tick rồi mới bấm được 「登録」."]),
]
CSV3 = [
    I("36", "取込完了のトースト", "Toast nhập hoàn tất", ".toast", "toast", "show", err=["S10"],
      detail=["登録できたら S10「CSVを取り込みました（新規{n}件・更新{m}件）。」を出して一覧へ戻る。できなければ E34「CSVインポートが失敗しました。」。", "Đăng ký xong hiện S10 「CSVを取り込みました（新規{n}件・更新{m}件）。」 và về danh sách. Không được thì E34 「CSVインポートが失敗しました。」."],
      demo_ok=["コードのトーストは「CSV取込：新規 n件・更新 m件を登録しました（変更なし …）」で S10 の文言と違う（共通メッセージ未使用・確認メモ H-17）。宿題", "Toast trong code là 「CSV取込：新規 n件・更新 m件を登録しました（変更なし …）」 khác câu S10 (chưa dùng thông điệp chung, 確認メモ H-17). Việc còn tồn"]),
]
CSV4 = [
    I("37", "ファイル全体のエラー", "Lỗi toàn tệp", ".page [role=alert]", "label", err=["E51", "E52"],
      detail=["列が違う・文字コードが UTF-8 でない・拡張子が .csv でないときは、ファイル全体のエラーとして E51「CSVファイルとして読み込めません。UTF-8のCSVファイルを選択してください。」を出し、登録できない。行にエラーがあるときは E52（n件のエラーがあるため…）。",
              "Khi sai cột, mã ký tự không phải UTF-8 hoặc đuôi không phải .csv thì hiện lỗi toàn tệp E51 「CSVファイルとして読み込めません。UTF-8のCSVファイルを選択してください。」 và không đăng ký được. Khi có lỗi theo dòng thì E52 (có n lỗi nên …)."],
      demo_ok=["コードの文言は列のエラーの日本語（共通メッセージ E51・E52 を使っていない・確認メモ H-17）。宿題", "Câu trong code là tiếng Nhật mô tả lỗi cột (chưa dùng thông điệp chung E51・E52, 確認メモ H-17). Việc còn tồn"]),
]

VIEWS = [
    V("001", "OW_STAF_001", "初期表示", "Hiển thị ban đầu", "/carrier/staff", L1, setup=H + "await readyList();", wait=400,
      note=["栄成ロジ（DE00001）の配送スタッフ4人。デモの今日は 2026-10-05。", "4 nhân viên giao hàng của 栄成ロジ (DE00001). 'Hôm nay' của demo là 2026-10-05."]),
    V("002", "OW_STAF_001", "絞り込み（名前・ステータス）", "Lọc (tên, trạng thái)", "/carrier/staff", L2,
      setup=H + "await readyList();setv(document.querySelector('input[placeholder=\"配送スタッフ名\"]'),'山口');await wait(200);document.querySelector('.search-row .btn.pri').click();await wait(400);", wait=500,
      note=["名前に「山口」を入れて検索した状態。", "Đã nhập 「山口」 vào tên và tìm."]),
    V("003", "OW_STAF_001", "0件（I01）", "0 dòng (I01)", "/carrier/staff", L3,
      setup=H + "await readyList();setv(document.querySelector('input[placeholder=\"配送スタッフ名\"]'),'ZZZ');await wait(200);document.querySelector('.search-row .btn.pri').click();await wait(400);", wait=500,
      note=["該当のない名前で検索した状態。", "Đã tìm bằng tên không khớp."]),
    V("004", "OW_STAF_001", "行を選択（「アカウント一括発行（n名）」が有効）", "Chọn dòng (「アカウント一括発行（n名）」 bấm được)", "/carrier/staff", L4,
      setup=H + "await readyList();tick('山口 健');tick('斉藤 健太');await wait(300);", wait=500,
      note=["2人にチェックを入れた状態。", "Đã tick 2 người."]),
    V("005", "OW_STAF_001", "アカウント一括発行の確認（発行できない行つき）", "Xác nhận cấp tài khoản hàng loạt (có dòng không cấp được)", "/carrier/staff", BULK,
      setup=H + "await readyList();tick('山口 健');tick('西村 陽介');await wait(200);btn('.phead button','アカウント一括発行').click();await wait(500);", wait=500,
      note=["山口 健（有効）と西村 陽介（無効）を選んで「アカウント一括発行」を押した状態。西村は「ステータスが無効」で発行できない。", "Đã chọn 山口 健 (有効) và 西村 陽介 (無効) rồi bấm 「アカウント一括発行」. 西村 không cấp được vì trạng thái 「無効」."]),
    V("006", "OW_STAF_001", "発行の結果（成功）", "Kết quả cấp (thành công)", "/carrier/staff", BULK_OK,
      setup=H + "await readyList();tick('山口 健');tick('斉藤 健太');await wait(200);btn('.phead button','アカウント一括発行').click();await wait(500);btn('.modal footer .btn','発行する').click();await wait(2600);", wait=500,
      note=["有効な2人を発行した直後。見本の2人はすでにアカウントがあるので、実際には何も変わらない。", "Ngay sau khi cấp cho 2 người có trạng thái 有効. 2 người mẫu đã có tài khoản nên thực tế không có gì thay đổi."]),
    V("007", "OW_STAF_001", "発行の結果（一部エラー・W10）", "Kết quả cấp (có lỗi một phần, W10)", "/carrier/staff", BULK_PART,
      setup=H + "await readyList();tick('山口 健');tick('西村 陽介');await wait(200);btn('.phead button','アカウント一括発行').click();await wait(500);btn('.modal footer .btn','発行する').click();await wait(2600);", wait=500,
      note=["山口 健と西村 陽介（無効）を発行した直後。1件成功・1件失敗。免許未登録・メール未登録の人は見本データにいないので、無効の人で代表させる。", "Ngay sau khi cấp cho 山口 健 và 西村 陽介 (無効). 1 thành công, 1 thất bại. Dữ liệu mẫu không có người chưa đăng ký bằng lái / email nên dùng người 無効 làm đại diện."]),
    V("008", "OW_STAF_001", "削除の確認（Q01）", "Xác nhận xóa (Q01)", "/carrier/staff", DEL,
      setup=H + "await readyList();document.querySelector('button[aria-label=\"西村 陽介を削除\"]').click();await wait(500);", wait=500,
      note=["西村 陽介（担当の配送がない）のゴミ箱を押した状態。", "Đã bấm thùng rác của 西村 陽介 (không có chuyến phụ trách)."]),
    V("009", "OW_STAF_001", "削除できません（担当中の配送・未返却の保冷バッグ）", "Không xóa được (còn chuyến đang phụ trách・túi giữ lạnh chưa trả)", "/carrier/staff", DELBLOCK,
      setup=H + "await readyList();document.querySelector('button[aria-label=\"山口 健を削除\"]').click();await wait(500);", wait=500,
      note=["山口 健（担当中の配送あり）のゴミ箱を押した状態。コードは貸与中の保冷バッグ（個数）も理由に出す。未返却（返却数＜貸与数）の保冷バッグ・保冷剤の理由は No.13.1。", "Đã bấm thùng rác của 山口 健 (còn chuyến phụ trách). Code còn hiện cả túi giữ lạnh đang mượn (số lượng) làm lý do. Lý do túi/đá giữ lạnh chưa trả (số trả < số mượn) xem No.13.1."]),
    V("010", "OW_STAF_001", "CSV出力（S12）", "Xuất CSV (S12)", "/carrier/staff", CSVOUT,
      setup=H + "await readyList();btn('.phead button','CSV出力').click();await wait(700);", wait=300,
      note=["「CSV出力」を押した直後。", "Ngay sau khi bấm 「CSV出力」."]),
    V("011", "OW_STAF_001", "削除済みを表示（既定は表示しない）", "Hiện người đã xóa (mặc định không hiện)", "/carrier/staff", SHOWDEL,
      setup=H + "await readyList();document.querySelector('button[aria-label=\"西村 陽介を削除\"]').click();await wait(500);btn('.modal footer .btn','削除する').click();await wait(900);", wait=500,
      note=["西村 陽介を削除したあとの一覧（削除済の行）。コードは常に表示する。設計は検索条件「削除済」＝表示するのときだけ出す。", "Danh sách sau khi xóa 西村 陽介 (dòng đã xóa). Code luôn hiển thị. Thiết kế chỉ hiện khi điều kiện 「削除済」 = hiện."]),
    V("012", "OW_STAF_002", "基本情報（参照）", "Thông tin cơ bản (xem)", "/carrier/staff/DR00014", FORM_DETAIL, setup=H + "await readyDetail();", wait=400,
      note=["山口 健（DR00014）の詳細。", "Chi tiết 山口 健 (DR00014)."]),
    V("013", "OW_STAF_002", "編集中", "Đang sửa", "/carrier/staff/DR00014", EDITING, setup=H + "await readyDetail();btn('.phead .btn','編集').click();await wait(400);", wait=500,
      note=["「編集」を押した状態。", "Đã bấm 「編集」."]),
    V("014", "OW_STAF_002", "入力エラー", "Lỗi nhập", "/carrier/staff/DR00014", ERRS,
      setup=H + "await readyDetail();btn('.phead .btn','編集').click();await wait(400);setv(document.querySelector('#sf_name'),'');setv(document.querySelector('#sf_kana'),'やまぐち');setv(document.querySelector('#sf_email'),'abc');await wait(200);btn('.phead .btn','保存').click();await wait(500);", wait=500,
      note=["名前を空・カナをひらがな・メールを不正な形にして「保存」を押した状態。", "Đã để trống tên, katakana nhập bằng hiragana, email sai định dạng và bấm 「保存」."]),
    V("015", "OW_STAF_002", "担当配送情報タブ（期間・状態・合計）", "Tab chuyến phụ trách (khoảng thời gian, trạng thái, tổng)", "/carrier/staff/DR00014?tab=deliv", DELIV, setup=H + "await readyDetail();", wait=400,
      note=["?tab=deliv。山口 健が担当する配送の一覧と合計。", "?tab=deliv. Danh sách chuyến 山口 健 phụ trách và tổng."]),
    V("016", "OW_STAF_002", "変更履歴タブ", "Tab lịch sử thay đổi", "/carrier/staff/DR00014?tab=hist", HIST, setup=H + "await readyDetail();", wait=400,
      note=["?tab=hist。", "?tab=hist."]),
    V("017", "OW_STAF_002", "削除済みのスタッフ（編集不可）", "Nhân viên đã xóa (không sửa được)", "/carrier/staff/DR00018", DELSTAFF, setup=H + "await readyDetail();", wait=400,
      note=["状態 011 で削除した西村 陽介（DR00018）の詳細。", "Chi tiết 西村 陽介 (DR00018) đã xóa ở trạng thái 011."]),
    V("018", "OW_STAF_002", "パスワード再設定の確認（代行）", "Xác nhận đặt lại mật khẩu (làm hộ)", "/carrier/staff/DR00014", RESETCONF, setup=H + "await readyDetail();", wait=400,
      note=["コードは確認を出さないので撮れない（Claude 推奨・hong 確認待ち）。画面は No.16 と同じ。", "Code không hiện xác nhận nên không chụp được (Claude đề xuất, chờ hong xác nhận). Màn hình giống No.16."]),
    V("019", "OW_STAF_002", "パスワード再設定：送信結果", "Đặt lại mật khẩu: kết quả gửi", "/carrier/staff/DR00014", RESETDONE,
      setup=H + "await readyDetail();btn('.phead .btn','パスワード再設定').click();await wait(900);", wait=300,
      note=["「パスワード再設定」を押した直後。コードのトーストは認証コードを出す（開発中の仮）。", "Ngay sau khi bấm 「パスワード再設定」. Toast trong code hiện mã xác thực (giả lập khi phát triển)."]),
    V("020", "OW_STAF_002", "編集中に離れる（Q02）", "Rời khi đang sửa (Q02)", "/carrier/staff/DR00014", LEAVE,
      setup=H + "await readyDetail();btn('.phead .btn','編集').click();await wait(400);setv(document.querySelector('#sf_name'),'山口 健二');await wait(300);document.querySelector('.menu a[href=\"/carrier/schedule\"]').click();await wait(500);", wait=500,
      note=["名前を変えてサイドメニューの「スケジュール」を押した直後。", "Ngay sau khi đổi tên và bấm 「スケジュール」 ở menu bên."]),
    V("021", "OW_STAF_002", "見つからない（他社のスタッフID）", "Không tìm thấy (ID nhân viên của công ty khác)", "/carrier/staff/DR00014", NOTFOUND, login="DE00006",
      note=["みどり便（DE00006）が栄成ロジのスタッフIDを開いた状態。", "みどり便 (DE00006) mở ID nhân viên của 栄成ロジ."]),
    V("022", "OW_STAF_003", "初期（ID は自動採番）", "Ban đầu (ID tự động cấp)", "/carrier/staff/new", NEW1, setup=H + "await wait(500);", wait=400,
      note=["「新規登録」を開いた状態。", "Đã mở 「新規登録」."]),
    V("023", "OW_STAF_003", "入力エラー（名・カナ・メール・免許証）", "Lỗi nhập (tên, katakana, email, bằng lái)", "/carrier/staff/new", NEW2,
      setup=H + "await wait(500);btn('.phead .btn','登録').click();await wait(500);", wait=500,
      note=["空のまま「登録」を押した状態。", "Đã bấm 「登録」 khi để trống."]),
    V("024", "OW_STAF_003", "登録完了 → 詳細へ（S151）", "Đăng ký xong → sang chi tiết (S151)", "/carrier/staff/new", NEW3,
      setup=H + "await wait(500);setv(document.querySelector('#sf_name'),'山田 花子');setv(document.querySelector('#sf_kana'),'ヤマダ ハナコ');setv(document.querySelector('#sf_email'),'hanako.yamada@example.jp');"
      "{const inp=document.querySelector('#sf_lic');const dt=new DataTransfer();dt.items.add(new File(['x'],'license.png',{type:'image/png'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));}await wait(300);btn('.phead .btn','登録').click();await wait(900);", wait=300,
      note=["必要な項目を入れて「登録」を押した直後（見本では免許証の写真も必要）。配送スタッフ詳細へ移りトーストが出る。", "Ngay sau khi nhập các mục cần thiết và bấm 「登録」 (dữ liệu mẫu cần cả ảnh bằng lái). Chuyển sang chi tiết nhân viên và hiện toast."]),
    V("025", "OW_STAF_004", "① ファイル選択", "① Chọn tệp", "/carrier/staff/import", CSV1 + CSV_COLS, setup=H + "await wait(500);", wait=400,
      note=["「CSV取込」を開いた状態。列の定義（No.34）は画面にはなく、設計書の項目定義にだけ書く。", "Đã mở 「CSV取込」. Định nghĩa cột (No.34) không có trên màn hình, chỉ ghi trong định nghĩa mục của tài liệu."]),
    V("026", "OW_STAF_004", "② 確認（エラー行つき：エラー行は取り込まない）", "② Xác nhận (có dòng lỗi: dòng lỗi không nhập)", "/carrier/staff/import", CSV2,
      setup=H + "await wait(500);csv('staff.csv','" + CSV_OK + "');await wait(1500);", wait=500,
      note=["3行のファイル（1行はメールが空でエラー）を選んだ状態。", "Đã chọn tệp 3 dòng (1 dòng lỗi vì email trống)."]),
    V("027", "OW_STAF_004", "取込完了（S10）", "Nhập hoàn tất (S10)", "/carrier/staff/import", CSV3,
      setup=H + "await wait(500);csv('staff.csv','" + CSV_OK + "');await wait(1500);{const c=document.querySelector('.page input[type=checkbox]');if(c)c.click();}await wait(200);btn('.phead .btn','登録').click();await wait(1200);", wait=300,
      note=["「登録」を押した直後。一覧に戻りトーストが出る。", "Ngay sau khi bấm 「登録」. Quay về danh sách và hiện toast."]),
    V("028", "OW_STAF_004", "ファイル全体のエラー（E51・E52）", "Lỗi toàn tệp (E51・E52)", "/carrier/staff/import", CSV4,
      setup=H + "await wait(500);csv('bad.csv','" + CSV_BAD + "');await wait(1500);", wait=500,
      note=["列がまったく違うファイルを選んだ状態。", "Đã chọn tệp có cột hoàn toàn khác."]),
]

# 追加のシート：CSV取込のひな形（docs/05_画面設計書/CSVテンプレート/carrierStaff.csv。雇用形態の列を置く。所属先は読み取りだけの列を最後に足す）
SHEETS = [{
    "name": ["CSVテンプレート（配送スタッフ）", "CSV template (nhân viên giao hàng)"],
    "note": ["配送スタッフの CSV取込のひな形（CSV出力と同じ列）。本物の Web の API（csv.template）から書き出したもの（2026-10-07）。設計では「雇用形態」の列を置き、「所属先」は読み取りだけの列を最後に足す（台帳 S・受付簿 #432。ファイルのひな形に所属先の列はまだない）。ステータス・アカウント・最終ログイン・所属先は読み取りだけで、取込では無視する。",
             "Mẫu CSV nhập nhân viên giao hàng (cột giống CSV出力). Xuất từ API của Web thật (csv.template) (2026-10-07). Trong thiết kế giữ cột 「雇用形態」 và thêm cột chỉ đọc 「所属先」 ở cuối (台帳 S・受付簿 #432; tệp mẫu chưa có cột nơi trực thuộc; không có cột 「区分」: 受付簿 #475). Trạng thái・tài khoản・đăng nhập lần cuối・nơi trực thuộc chỉ đọc, bỏ qua khi nhập."],
    "tables": [{
        "title": ["配送スタッフ CSV取込のひな形", "Mẫu CSV nhập nhân viên giao hàng"],
        "head": [[["配送スタッフID【空欄＝新規（採番）】", "ID nhân viên【trống = mới】"], 30], [["配送スタッフ名", "Tên"], 20], [["カナ", "Katakana"], 22], [["雇用形態", "Hình thức tuyển dụng"], 18], [["電話番号", "Điện thoại"], 16], [["メールアドレス", "Email"], 30], [["ステータス", "Trạng thái"], 14], [["アカウント", "Tài khoản"], 12], [["最終ログイン", "Đăng nhập cuối"], 14], [["所属先（読取専用）", "Nơi trực thuộc (chỉ đọc)"], 26]],
        "rows": [["", "（例）山田 太郎", "ヤマダ タロウ", "社員", "090-0000-0000", "taro.yamada@example.jp", "", "", "", ""]],
    }],
}]
