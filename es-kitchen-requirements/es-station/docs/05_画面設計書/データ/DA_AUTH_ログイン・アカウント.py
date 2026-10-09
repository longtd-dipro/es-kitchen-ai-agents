# -*- coding: utf-8 -*-
"""
ドライバーアプリ アカウント・ログイン・パスワード（DA_AUTH）の画面設計書データ。
元：本物の Web（app/driver/login/page.tsx・app/driver/password/page.tsx・app/driver/account/page.tsx・lib/driver/{logic,area}.ts・lib/domain/driverAuth.ts）。
決定の正：docs/決定台帳.md（B ドライバーのログイン・ログインID・F 2026-10-07 パスワードの扱い・認証コード・ドライバーアプリの未送信の保持・K ログインの期限・M-1）、受付簿 No.290・291・292。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-9・Q-DW07・Q-DW08 の回答・§4 open O2・O3・O10）。
撮影：スマホ幅 390×844。ログイン前の画面（ログイン・パスワード再設定）は枠（下のタブ）なし。アカウント画面だけ高橋 誠（DR00002）でログインして撮る。
"""

TITLE = ["アカウント・ログイン・パスワード（DA_AUTH）", "Tài khoản・Đăng nhập・Mật khẩu (DA_AUTH)"]
SHEET = ["ログイン・アカウント", "Đăng nhập・Tài khoản"]
BASENAME = "画面設計書_DA_AUTH_ログイン・アカウント"
IMG_PREFIX = "DA_AUTH"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_AUTH_001（ログイン）・002（パスワード再設定。4ステップを1画面とする）・003（アカウント）。Figma の AUTHEN（6文字）は規約（英大文字4文字）に合わせて AUTH にした",
             "Screen Code theo 台帳 F (2026-10-07): DA_AUTH_001 (đăng nhập)・002 (đặt lại mật khẩu; 4 bước tính là 1 màn)・003 (tài khoản). AUTHEN (6 ký tự) của Figma đổi thành AUTH theo quy ước (4 chữ in hoa)"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/driverAuth.ts"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_AUTH 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。ログイン＝DA_AUTH_001、パスワード再設定＝DA_AUTH_002、アカウント＝DA_AUTH_003", "DA. Đăng nhập = DA_AUTH_001, đặt lại mật khẩu = DA_AUTH_002, tài khoản = DA_AUTH_003"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_AUTH_002 No.9〜12・DA_AUTH_003", "q": ["パスワードの規則・ログイン失敗の制限・ログイン中の変更・認証コード・初期パスワード", "Quy tắc mật khẩu・giới hạn đăng nhập sai・đổi mật khẩu khi đang đăng nhập・mã xác thực・mật khẩu ban đầu"],
     "a": ["パスワードは8文字以上・英字と数字を含む。ログイン中のパスワード変更の画面は置かない（再設定だけ）。認証コードは4桁・有効期限5分。誤入力が続いてもロックしない。初期パスワードはシステムが作り、メイン担当者（登録メールアドレス）へ送る", "Mật khẩu từ 8 ký tự, gồm chữ và số. Không đặt màn đổi mật khẩu khi đang đăng nhập (chỉ đặt lại). Mã xác thực 4 chữ số, hiệu lực 5 phút. Nhập sai liên tiếp cũng không khóa. Mật khẩu ban đầu do hệ thống tạo và gửi cho người phụ trách chính (email đã đăng ký)"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW07・台帳 F・受付簿 No.291）"},
    {"date": "2026-10-07", "target": "DA_AUTH_002 No.6・8", "q": ["認証コードの入力回数の上限・再送の間隔", "Giới hạn số lần nhập mã・khoảng cách gửi lại"], "a": ["定義しない（上限なし・ロックなし）。再送はいつでも押せる", "Không định nghĩa (không giới hạn・không khóa). Gửi lại bấm được bất cứ lúc nào"], "src": "hong 回答 2026-10-07（確認メモ O2・B-10）"},
    {"date": "2026-10-07", "target": "DA_AUTH 全体", "q": ["初期パスワードの渡し方", "Cách gửi mật khẩu ban đầu"], "a": ["システムが作り、メイン担当者（登録メールアドレス）へ送る", "Hệ thống tạo và gửi cho người phụ trách chính (email đã đăng ký)"], "src": "hong 回答 2026-10-07（確認メモ O10）"},
    {"date": "2026-10-07", "target": "DA_AUTH_001 No.7・DA_AUTH_003 No.5", "q": ["ログインの期限と、未送信が残ったままのログアウト・ログイン切れ", "Hạn đăng nhập và đăng xuất・hết phiên khi còn mục chưa gửi"],
     "a": ["ログインの期限は全サイト1日（ドライバーだけ延ばすかは検討中）。未送信の報告は端末のブラウザ（IndexedDB）に保持し、ログイン切れ・ログアウトでも消さず、ログインし直したら再送する。保存・再送の制限（データ削除・iPhone の約7日・iPhone は裏で再送できない）は受け入れる", "Hạn đăng nhập là 1 ngày ở mọi site (chưa quyết có kéo dài riêng cho tài xế). Báo cáo chưa gửi giữ trong trình duyệt thiết bị (IndexedDB), không xóa khi hết phiên・đăng xuất, gửi lại sau khi đăng nhập lại. Chấp nhận các giới hạn lưu・gửi lại (xóa dữ liệu・iPhone khoảng 7 ngày・iPhone không gửi lại ngầm được)"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW08・台帳 F・K・受付簿 No.292）"},
    {"date": "2026-10-03", "target": "DA_AUTH_001 No.2・DA_AUTH_003 No.2", "q": ["ログインIDの形・採番・再設定の代行", "Dạng ID đăng nhập・cách cấp・đặt lại hộ"],
     "a": ["ログインID＝配送スタッフID（DR＋5桁・システムが自動で採番・手入力で作らない）。運営はCSV取込で登録し、委託配送会社は配送スタッフの画面で登録する。パスワード再設定の代行は運営と、自社のドライバーに限り委託配送会社ができる", "ID đăng nhập = ID 配送スタッフ (DR + 5 chữ số, hệ thống tự cấp, không nhập tay). Vận hành đăng ký bằng nhập CSV, công ty vận chuyển ủy thác đăng ký ở màn 配送スタッフ. Đặt lại mật khẩu hộ: vận hành, và công ty ủy thác chỉ với tài xế của mình"],
     "src": "台帳 B（hong 回答 2026-10-03）"},
    {"date": "2026-10-07", "target": "DA_AUTH_001・002 全体", "q": ["言語・チャット・位置情報", "Ngôn ngữ・chat・vị trí"],
     "a": ["日本語固定（言語切替なし）。チャットはなく電話ボタンで連絡。位置情報は取得しない", "Cố định tiếng Nhật (không chuyển ngôn ngữ). Không có chat, liên hệ bằng nút gọi điện. Không lấy vị trí"], "src": "台帳 K・配送_06（確認メモ_DW §6 で一致済み）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "DA_AUTH_001", "ja": "ログイン", "vi": "Đăng nhập"},
    {"code": "DA_AUTH_002", "ja": "パスワード再設定", "vi": "Đặt lại mật khẩu"},
    {"code": "DA_AUTH_003", "ja": "アカウント", "vi": "Tài khoản"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const btn=(t,sc)=>[...(sc||document.querySelector('.app')||document).querySelectorAll('button,a,label,.chk,.noti,[role=button]')].find(b=>(b.textContent||'').trim().includes(t));"
    "const click=async(t,sc)=>{const b=btn(t,sc);if(!b)throw new Error('no button '+t);b.click();await sleep(450)};"
    "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};"
    "const holdToast=()=>{if(window.__ht)return;window.__ht=1;const o=window.setTimeout;window.setTimeout=(f,t,...a)=>t===3000?0:o(f,t,...a)};"
    "const api=async(op,args)=>{const r=await fetch('/api/ops/area/driver/'+op,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'driver'},body:JSON.stringify({args:args??null})});const j=r.status===204?null:await r.json().catch(()=>null);if(!r.ok)throw new Error(op+' '+r.status);return j};"
    "const staff=()=>sessionStorage.getItem('driver.session');"
    "const sync=async()=>{document.dispatchEvent(new Event('visibilitychange'));await sleep(900)};"
    "const login=async(id,pw)=>{setv(document.querySelector('#lid'),id);setv(document.querySelector('#lpw'),pw);await sleep(200);document.querySelector('button[type=submit]').click();await sleep(1200)};"
    "const toStep2=async(id)=>{setv(document.querySelector('.field input'),id);await sleep(300);document.querySelector('.btn.pri').click();await sleep(1200)};"
    "const code=async(a)=>{const ins=document.querySelectorAll('.codebox input');for(let i=0;i<4;i++){setv(ins[i],a[i]);await sleep(150)}};"
)

LURL = "/driver/login"
PW = "/driver/password"


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, **kw):
    d = {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "note": note or ["", ""], "items": items}
    d.update(kw)
    return d


def A(no, ja, vi, sel, kind, trig="view", detail=None, **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    if detail:
        d["detail"] = detail
    d.update(kw)
    return d


def reg(lst):
    return {i["no"]: i for i in lst}


R1 = reg([
    A("1", "ログイン画面", "Màn đăng nhập", ".auth", "area", "view", ["ログイン前の画面（下のタブなし）。上に写真、下にスローガンと入力欄。日本語固定。ログインの期限は1日（台帳 K）で、期限が切れたらこの画面に戻る（E525）。", "Màn trước đăng nhập (không có tab dưới). Phía trên là ảnh, phía dưới là khẩu hiệu và ô nhập. Cố định tiếng Nhật. Hạn đăng nhập là 1 ngày (台帳 K), hết hạn thì quay lại màn này (E525)."], err=["E525"]),
    A("2", "ログインID", "ID đăng nhập", "#lid", "text", "input", [
        "配送スタッフID（DR＋5桁。システムが自動で採番し、運営のCSV取込・委託配送会社の配送スタッフの画面で登録する。ここでは手入力して使うだけ）。前後の空白を取り、英字は大文字にして調べる。",
        "ID 配送スタッフ (DR + 5 chữ số. Hệ thống tự cấp, đăng ký bằng nhập CSV của vận hành hoặc màn 配送スタッフ của công ty ủy thác. Ở đây chỉ nhập để sử dụng). Bỏ khoảng trắng đầu/cuối, chữ cái đổi thành chữ hoa khi kiểm tra."],
      req="○", len="文字列 7（DR＋5桁）" if False else ["文字列 7（DR＋5桁）", "Chuỗi 7 ký tự (DR + 5 chữ số)"], init=["空（デモのときだけ見本の ID を入れてある）", "Trống (chỉ khi demo mới điền sẵn ID mẫu)"], ex=["DR00002", "ID 配送スタッフ (ví dụ DR00002)"],
      valid=["空は不可（E01）。ID とパスワードの組が違えば E520。", "Không được trống (E01). ID và mật khẩu không khớp thì E520."], err=["E01", "E520"]),
    A("3", "パスワード", "Mật khẩu", "#lpw", "text", "input", ["パスワード。入力中は伏せ字（●）。8〜64文字・半角の英字と数字を含む（初期パスワードはシステムが作ってメイン担当者へ送る：台帳 F）。", "Mật khẩu. Đang nhập hiện dấu ●. Từ 8 đến 64 ký tự nửa góc, gồm chữ và số (mật khẩu ban đầu do hệ thống tạo và gửi cho người phụ trách chính: 台帳 F)."],
      req="○", len=["文字列 8〜64（半角）", "Chuỗi 8〜64 ký tự (nửa góc)"], init=["空", "Trống"], ex=["password1", "Mật khẩu ví dụ (từ 8 ký tự, gồm chữ và số)"], valid=["空は不可（E01）。", "Không được trống (E01)."], err=["E01", "E520"],
      demo_ok=["コードは開発中で、パスワードは空でなければ通す（見本の配送スタッフ。lib/domain/driverAuth.ts）。規則の確認は再設定のときだけ", "Code đang phát triển, mật khẩu chỉ cần không trống là qua (tài xế mẫu; lib/domain/driverAuth.ts). Chỉ kiểm tra quy tắc khi đặt lại"]),
    A("3.1", "表示切替", "Bật/tắt hiển thị", ".eye", "button", "click", ["目のアイコン。押すとパスワードを文字で見せる／伏せ字に戻す。", "Icon con mắt. Bấm để hiện mật khẩu dạng chữ / trở lại dấu ●."]),
    A("4", "エラーの表示", "Hiển thị lỗi", ".err", "label", "view", [
        "ログインの結果のエラーを入力欄の下に赤く出す：空は E01、IDかパスワードが違えば E520、利用停止・無効のアカウントは E431（所属先に問い合わせる）。誤入力が続いてもロックしない（台帳 F）。入力し直すとエラーは消える。",
        "Hiển thị lỗi kết quả đăng nhập màu đỏ dưới ô nhập: trống E01, sai ID/mật khẩu E520, tài khoản bị dừng・vô hiệu E431 (liên hệ đơn vị trực thuộc). Nhập sai liên tiếp cũng không khóa (台帳 F). Nhập lại thì lỗi biến mất."], err=["E01", "E520", "E431"],
      demo_ok=["コードのエラー文は「ログインIDとパスワードを入力してください。」「ログインIDまたはパスワードが正しくありません。」「このアカウントは利用できません（…）。所属先にお問い合わせください。」。設計の文言（E01・E520・E431）に揃える（宿題）", "Câu lỗi trong code là 「ログインIDとパスワードを入力してください。」 v.v. Thống nhất theo câu thiết kế (E01・E520・E431) (việc phải sửa)"],
      open=["ログインの本番は全サイト Cognito（決定済み：台帳 F 2026-10-07）。ロックはかけない（決定）。Cognito の標準の挙動（コードの桁数・有効期限・失敗時の一時ロック）と、この画面の仕様（4桁・5分・ロックなし）をどう両立させるかは開発が確認する", "Production dùng Cognito cho mọi site (đã quyết: 台帳 F 2026-10-07). Không khóa (đã quyết). Việc dev xác nhận: hành vi chuẩn của Cognito (số chữ số・hạn của mã・khóa tạm khi sai) và cách đạt đồng thời quy cách màn này (4 chữ số・5 phút・không khóa)"], ask="開発"),
    A("5", "パスワードを忘れた方", "Quên mật khẩu", "button.link", "link", "click", ["「パスワードを忘れた方はこちら」。押すとパスワード再設定（DA_AUTH_002）の①へ。", "「パスワードを忘れた方はこちら」. Bấm để sang bước ① của đặt lại mật khẩu (DA_AUTH_002)."]),
    A("6", "ログイン", "Đăng nhập", "button[type=submit]", "button", "click", [
        "押すと ID とパスワードを確かめ、通ればホームへ（トースト「ログインしました」）。確認中は押せない。ログインすると端末に残っている未送信の報告を再送する（サーバーに拒否された分の理由と1件ずつの破棄は DA_HOME_001 No.8・受付簿 #443）。未送信は作ったアカウントのもの：別のドライバーが同じ端末にログインしても前のドライバーの未送信は見えず、送れない（受付簿 #462）。",
        "Bấm để kiểm tra ID và mật khẩu, đúng thì sang trang chủ (toast 「ログインしました」). Đang xác nhận thì không bấm được. Khi đăng nhập sẽ gửi lại các báo cáo chưa gửi còn trên thiết bị (lý do mục bị server từ chối và việc hủy bỏ từng mục: DA_HOME_001 No.8, 受付簿 #443). Mục chưa gửi thuộc tài khoản đã tạo ra nó: tài xế khác đăng nhập cùng máy không thấy và không gửi được mục của tài xế trước (受付簿 #462)."]),
    A("7", "未送信が残っているときの案内", "Hướng dẫn khi còn mục chưa gửi", "-", "label", "view", [
        "端末に未送信の報告が残っているとき、ログイン欄の上に W312「未送信の報告が端末に残っています。ログインすると再送します。」を出す（ログイン切れ・ログアウトでも消さない：台帳 F 2026-10-07）。",
        "Khi còn báo cáo chưa gửi trên thiết bị, hiện W312 「未送信の報告が端末に残っています。ログインすると再送します。」 phía trên ô đăng nhập (không xóa khi hết phiên・đăng xuất: 台帳 F 2026-10-07)."], err=["W312"],
      demo_ok=["コードのログイン画面にはこの案内がない（未送信はサーバー側の模擬）。決定に合わせて足す（宿題）", "Màn đăng nhập trong code chưa có hướng dẫn này (mục chưa gửi là mô phỏng phía server). Sẽ thêm theo quyết định (việc phải sửa)"]),
    A("8", "ログインの期限切れ", "Hết hạn đăng nhập", "-", "toast", "view", [
        "ログインの期限（1日）が切れたあとに操作すると、この画面に戻し、トースト E525「ログインの有効期限が切れました。もう一度ログインしてください。」を出す。入力途中・未送信は消さない（未送信は端末に保持）。",
        "Nếu thao tác sau khi hết hạn đăng nhập (1 ngày) thì đưa về màn này và hiện toast E525 「ログインの有効期限が切れました。もう一度ログインしてください。」. Không xóa nội dung đang nhập・mục chưa gửi (mục chưa gửi giữ trên thiết bị)."], err=["E525"],
      demo_ok=["期限（1日）は Cookie と端末の localStorage の両方で切る（コード済み）が、撮影では期限切れを作れない。期限が切れたときの文言は、コードは「ログインし直してください」のトーストだけで E525 の文ではない（H6）", "Hạn 1 ngày được cắt cả ở Cookie lẫn localStorage của thiết bị (code đã làm) nhưng khi chụp không tạo được hết hạn. Câu khi hết hạn trong code chỉ là toast 「ログインし直してください」, không phải câu E525 (H6)"]),
])
R2 = reg([
    A("1", "パスワード再設定", "Đặt lại mật khẩu", ".auth", "area", "view", ["ログイン前の画面。4ステップ：① ログインID → ② 認証コード → ③ 新しいパスワード → ④ 完了。ステップの進みはこの画面の中で切り替える。", "Màn trước đăng nhập. 4 bước: ① ID đăng nhập → ② mã xác thực → ③ mật khẩu mới → ④ hoàn tất. Bước chuyển trong cùng màn này."]),
    A("2", "ログインID", "ID đăng nhập", ".field input", "text", "input", ["① 再設定するログインID（配送スタッフID）。登録のメールアドレスに4桁の認証コードを送る。", "① ID đăng nhập cần đặt lại (ID 配送スタッフ). Gửi mã xác thực 4 chữ số tới email đã đăng ký."],
      req="○", len=["文字列 7（DR＋5桁）", "Chuỗi 7 ký tự (DR + 5 chữ số)"], init=["空", "Trống"], ex=["DR00002", "ID 配送スタッフ (ví dụ DR00002)"], valid=["空なら「認証コードを送信」は押せない。IDがない・使えないアカウントは E433、メール未登録は E434。", "Trống thì không bấm được 「認証コードを送信」. ID không có・tài khoản không dùng được: E433, chưa đăng ký email: E434."], err=["E433", "E434"]),
    A("3", "認証コードを送信", "Gửi mã xác thực", ".btn.pri", "button", "click", ["押すと登録のメールアドレスに4桁の認証コード（有効期限5分）を送り、②へ。メールの送信はいまは仮（コードを画面とサーバーのログに出す：台帳 B）。", "Bấm để gửi mã xác thực 4 chữ số (hiệu lực 5 phút) tới email đã đăng ký và sang ②. Việc gửi email hiện là tạm (hiện mã trên màn hình và log server: 台帳 B)."], err=["E433", "E434"]),
    A("4", "ログイン画面に戻る", "Về màn đăng nhập", "button.link", "link", "click", ["ログイン（DA_AUTH_001）へ戻る。", "Về màn đăng nhập (DA_AUTH_001)."]),
    A("5", "送信先メールアドレス", "Email nhận mã", ".center.muted", "label", "view", ["②③で、認証コードを送ったメールアドレスを一部伏せて出す（例 e***@sample.com）。", "Ở ②③, hiện một phần email đã gửi mã (ví dụ e***@sample.com)."]),
    A("6", "認証コード（4桁）", "Mã xác thực (4 chữ số)", ".codebox", "text", "input", [
        "② メールで届いた4桁の数字を1桁ずつ入れる（入れると次の欄へ移る）。有効期限は5分（コードは5分で無効）。すべて入れると「確認」が押せる。",
        "② Nhập từng chữ số trong mã 4 chữ số nhận qua email (nhập xong tự sang ô kế). Hiệu lực 5 phút (mã vô hiệu sau 5 phút). Nhập đủ thì bấm được 「確認」."],
      req="○", len=["数字 4桁", "Số 4 chữ số"], init=["空", "Trống"], ex=["4827", "Mã 4 chữ số trong email"], valid=["4桁の数字。違えば E521、有効期限切れは E522。", "4 chữ số. Sai thì E521, hết hạn thì E522."], err=["E521", "E522"]),
    A("7", "確認（コード）", "Xác nhận (mã)", ".btn.pri", "button", "click", ["押すとコードを確かめ、合っていれば③へ。違えば E521、期限切れは E522。", "Bấm để kiểm tra mã, đúng thì sang ③. Sai thì E521, hết hạn thì E522."], err=["E521", "E522"]),
    A("8", "再送信", "Gửi lại", "p.center.muted::再送信", "link", "click", [
        "「コードが届かない場合：再送信」。押すとコードを送り直す（S400）。再送の間隔・入力回数の上限は定義しない（hong 2026-10-07）。「※認証コードの有効期限は5分です。」を下に出す。",
        "「コードが届かない場合：再送信」. Bấm để gửi lại mã (S400). Không định nghĩa khoảng cách gửi lại・giới hạn số lần nhập (hong 2026-10-07). Phía dưới hiện 「※認証コードの有効期限は5分です。」."], err=["S400"]),
    A("9", "新しいパスワード", "Mật khẩu mới", ".field input[aria-label=パスワード]", "text", "input", ["③ 新しいパスワード。8〜64文字・半角の英字と数字を含める。目のアイコンで表示を切り替える。", "③ Mật khẩu mới. Từ 8 đến 64 ký tự nửa góc, gồm chữ và số. Bật/tắt hiển thị bằng icon con mắt."],
      req="○", len=["文字列 8〜64（半角）", "Chuỗi 8〜64 ký tự (nửa góc)"], init=["空", "Trống"], ex=["newpass123", "Mật khẩu mới (8〜64 ký tự nửa góc, gồm chữ và số)"], valid=["8〜64文字の半角で、英字と数字を含む（E523）。", "8〜64 ký tự nửa góc, gồm chữ và số (E523)."], err=["E523", "E01"]),
    A("10", "パスワード（確認用）", "Mật khẩu (xác nhận)", ".field input[aria-label^=パスワード（確認用）]", "text", "input", ["③ もう一度同じものを入れる。違えば E524。", "③ Nhập lại đúng giống. Khác thì E524."],
      req="○", len=["文字列 8〜64（半角）", "Chuỗi 8〜64 ký tự (nửa góc)"], init=["空", "Trống"], ex=["newpass123", "Nhập lại mật khẩu mới"], valid=["上のパスワードと同じ。", "Giống mật khẩu ở trên."], err=["E524", "E01"]),
    A("11", "確認（パスワード）", "Xác nhận (mật khẩu)", ".btn.pri", "button", "click", ["押すと新しいパスワードを保存し④へ。規則に合わない・一致しないときは押せない（エラーを入力欄の下に出す）。", "Bấm để lưu mật khẩu mới và sang ④. Không bấm được khi không đúng quy tắc・không khớp (hiện lỗi dưới ô nhập)."], err=["E523", "E524"]),
    A("12", "完了", "Hoàn tất", ".modal", "modal", "view", ["④ 「パスワードリセットに成功しました。」S401「パスワードを再設定しました。新しいパスワードでログインしてください。」。「ホーム画面へ」でログイン画面へ。", "④ 「パスワードリセットに成功しました。」 S401 「パスワードを再設定しました。新しいパスワードでログインしてください。」. Bấm 「ホーム画面へ」 để về màn đăng nhập."], err=["S401"],
      demo_ok=["コードの文は Figma の長文「現在は正常にログイン・ご利用いただけます。引き続きよろしくお願いいたします。」。短い S401 に直す（宿題）", "Câu trong code là đoạn dài của Figma. Sửa thành câu ngắn S401 (việc phải sửa)"]),
])
R3 = reg([
    A("1", "ヘッダー", "Đầu trang", ".hhead", "area", "view", ["ホーム・配送一覧と同じ帯（ロゴ・トラック・あいさつ・お知らせのベル）。", "Dải giống trang chủ・danh sách giao hàng (logo, xe tải, lời chào, chuông thông báo)."]),
    A("2", "基本情報", "Thông tin cơ bản", ".info", "area", "view", [
        "ログイン中のドライバーの情報（表示だけ。ログイン中に変える画面・パスワード変更の画面はない：台帳 F 2026-10-07）。ログインID・メールアドレス・配送スタッフ名・カナ・電話番号・所属先（自社は「ES配送便（自社）」、委託は委託配送会社名）。値は運営Web の配送スタッフマスタ。",
        "Thông tin tài xế đang đăng nhập (chỉ hiển thị. Không có màn sửa khi đang đăng nhập・màn đổi mật khẩu: 台帳 F 2026-10-07). ID đăng nhập・email・tên 配送スタッフ・kana・số điện thoại・đơn vị trực thuộc (nội bộ: 「ES配送便（自社）」, ủy thác: tên công ty vận chuyển). Giá trị lấy từ master 配送スタッフ của Web vận hành."]),
    A("3", "ログインID・メール・名前・カナ・電話・所属先", "ID・email・tên・kana・điện thoại・đơn vị", ".info .r", "label", "view", ["6行。ない値は「—」。", "6 dòng. Giá trị không có hiển thị 「—」."]),
    A("4", "マニュアル", "Hướng dẫn", "button.btn.sec::マニュアル", "link", "click", ["マニュアルのリンク（URL）を別のタブで開く（DA_MANU_001）。URL が空のときは出さない。", "Mở link (URL) hướng dẫn ở tab khác (DA_MANU_001). URL trống thì không hiện."], demo_ok=["コードは固定の文章の画面（/driver/manuals）を開く（宿題。DA_MANU）", "Code mở màn văn bản cố định (/driver/manuals) (việc phải sửa; DA_MANU)"]),
    A("5", "ログアウト", "Đăng xuất", "button.btn.sec::ログアウト", "button", "click", ["押すとログアウトしてログイン画面へ。未送信の報告が残っていれば確認のモーダル（No.6）。未送信は端末に残り、ログインし直すと再送する。入力中なら離脱の確認（Q02）。", "Bấm để đăng xuất và về màn đăng nhập. Còn báo cáo chưa gửi thì hiện modal xác nhận (No.6). Mục chưa gửi còn trên thiết bị và gửi lại sau khi đăng nhập lại. Đang nhập thì xác nhận rời đi (Q02)."], err=["Q317", "Q02"],
      demo_ok=["コードは確認なしでログアウトする（宿題・Q-DW08）", "Code đăng xuất không cần xác nhận (việc phải sửa・Q-DW08)"]),
    A("6", "ログアウトの確認（未送信あり）", "Xác nhận đăng xuất (còn mục chưa gửi)", "-", "modal", "view", ["「ログアウトしますか？／未送信の報告が{n}件あります。端末に残り、ログインし直すと再送します。」。「ログアウトする」「キャンセル」。", "「ログアウトしますか？／未送信の報告が{n}件あります。端末に残り、ログインし直すと再送します。」. 「ログアウトする」「キャンセル」."], err=["Q317"],
      demo_ok=["コードにはまだない（宿題）。画面の絵は撮れない", "Code chưa có (việc phải sửa). Không chụp được hình"]),
    A("7", "下のタブ", "Tab dưới", ".tabbar", "area", "view", ["下に5つのタブ。この画面では「アカウント」を青くする。", "5 tab ở dưới. Màn này tô xanh 「アカウント」."]),
])


def pick(R, *nos):
    return [R[n] for n in nos]


VIEWS = [
    V("001", "DA_AUTH_001", "初期（ログインID・パスワード・「パスワードを忘れた方はこちら」）", "Ban đầu (ID đăng nhập・mật khẩu・「パスワードを忘れた方はこちら」)", LURL, pick(R1, "1", "2", "3", "3.1", "5", "6", "7"),
      note=["デモのときだけ見本の配送スタッフ（DR00014）を入れてある。", "Chỉ khi demo mới điền sẵn tài xế mẫu (DR00014)."]),
    V("002", "DA_AUTH_001", "パスワード表示切替", "Bật/tắt hiển thị mật khẩu", LURL, pick(R1, "3", "3.1"), setup="document.querySelector('.eye').click(); await sleep(400);"),
    V("003", "DA_AUTH_001", "必須エラー（ID・パスワードが空）", "Lỗi bắt buộc (ID・mật khẩu trống)", LURL, pick(R1, "2", "3", "4"), setup="await login('', '');",
      note=["決定の文言は E01。コードは「ログインIDとパスワードを入力してください。」を1行で出す。", "Câu theo quyết định là E01. Code hiện 1 dòng 「ログインIDとパスワードを入力してください。」."]),
    V("004", "DA_AUTH_001", "認証失敗（IDかパスワードが違う）", "Xác thực thất bại (sai ID hoặc mật khẩu)", LURL, pick(R1, "4"), setup="await login('DR99999', 'password1');"),
    V("005", "DA_AUTH_001", "利用できないアカウント（利用停止・無効）", "Tài khoản không dùng được (bị dừng・vô hiệu)", LURL, pick(R1, "4"), setup="await login('DR00005', 'password1');",
      note=["DR00005 は利用停止。DR00018（無効）も同じ画面。", "DR00005 bị dừng sử dụng. DR00018 (vô hiệu) cũng cùng màn."]),
    V("006", "DA_AUTH_001", "ログインの有効期限切れ（「ログインし直してください」）", "Hết hạn đăng nhập (「ログインし直してください」)", LURL, pick(R1, "8"),
      note=["期限切れは撮影で作れないので、画像は通常のログイン画面。決定の動きは項目の説明のとおり。", "Không tạo được hết hạn khi chụp nên hình là màn đăng nhập thông thường. Hoạt động theo quyết định như mô tả trong mục."]),
    V("007", "DA_AUTH_002", "① ログインID入力", "① Nhập ID đăng nhập", PW, pick(R2, "1", "2", "3", "4")),
    V("008", "DA_AUTH_002", "① IDが見つからない／メール未登録", "① Không tìm thấy ID / chưa đăng ký email", PW, pick(R2, "2", "3"),
      setup="setv(document.querySelector('.field input'),'DR99999'); await sleep(300); document.querySelector('.btn.pri').click(); await sleep(1000);",
      note=["決定の文言は E433（IDが見つからない・使えない）と E434（メール未登録）。コードはサーバーの文をそのまま出す。", "Câu theo quyết định là E433 (không tìm thấy ID・không dùng được) và E434 (chưa đăng ký email). Code hiện nguyên câu của server."]),
    V("009", "DA_AUTH_002", "② 認証コード入力（4桁・有効期限5分・再送信）", "② Nhập mã xác thực (4 chữ số・hạn 5 phút・gửi lại)", PW + "?step=2", pick(R2, "1", "5", "6", "7", "8")),
    V("010", "DA_AUTH_002", "② コードが違う", "② Mã sai", PW, pick(R2, "6", "7"),
      setup="await toStep2('DR00002'); await code('0000'); document.querySelector('.btn.pri').click(); await sleep(1000);",
      note=["決定の文言は E521（回数の表示はなし）。", "Câu theo quyết định là E521 (không hiển thị số lần)."]),
    V("011", "DA_AUTH_002", "② コードの有効期限切れ", "② Mã hết hạn", PW + "?step=2", pick(R2, "6"),
      note=["有効期限（5分）切れは撮影で作れないので、画像は通常の②。決定の文言は E522。", "Không tạo được hết hạn (5 phút) khi chụp nên hình là ② thông thường. Câu theo quyết định là E522."]),
    V("012", "DA_AUTH_002", "③ 新しいパスワード", "③ Mật khẩu mới", PW + "?step=3", pick(R2, "5", "9", "10", "11")),
    V("013", "DA_AUTH_002", "③ 一致しない／規則に合わない", "③ Không khớp / không đúng quy tắc", PW + "?step=3", pick(R2, "9", "10", "11"),
      setup="const ins=document.querySelectorAll('.field input'); setv(ins[0],'abcdef12'); setv(ins[1],'abcdef13'); await sleep(400);",
      note=["一致しないとき E524、規則に合わないとき E523（コードも規則を確かめる）。画像は一致しない例。", "Không khớp thì E524, không đúng quy tắc thì E523 (code cũng kiểm tra quy tắc). Hình là ví dụ không khớp."]),
    V("014", "DA_AUTH_002", "④ 完了", "④ Hoàn tất", PW + "?step=4", pick(R2, "12")),
    V("015", "DA_AUTH_003", "初期（基本情報・マニュアル・ログアウト）", "Ban đầu (thông tin cơ bản・hướng dẫn・đăng xuất)", "/driver/account", pick(R3, "1", "2", "3", "4", "5", "7"), login="DR00002", today=""),
    V("016", "DA_AUTH_003", "ログアウト（未送信が残っているとき）", "Đăng xuất (khi còn mục chưa gửi)", "/driver/account", pick(R3, "5", "6"),
      setup=("const d=await api('day',{staff:staff()}); const recv={}; d.dels.filter(x=>x.pt==='WH00001').forEach(x=>x.inv.forEach(i=>{recv[x.no+'|'+i.no]=true}));"
             "await api('receive',{staff:staff(),pt:'WH00001',recv,ack:false,offline:true}); await sync();"),
      login="DR00002", today="",
      note=["未送信が1件残っている。決定は「ログアウト」で確認のモーダル（Q317）を出す。コードにはまだなく、画像は帯「未送信 1件」のあるアカウント画面。", "Còn 1 mục chưa gửi. Quyết định: 「ログアウト」 hiện modal xác nhận (Q317). Code chưa có, hình là màn アカウント có dải 「未送信 1件」."]),
]


# ---- 役割レビュー 2026-10-08 の反映（画面の宿題・要確認。仕様の決定ではなく、コード・画面側の宿題と確認事項）
_seen = set()
def tapdemo(ja, vi):
    return [ja + "。スマホは 44px 以上にする（画面の宿題：UI・役割レビュー #13）", vi + ". Nên ≥44px trên điện thoại (việc phải sửa về UI; 役割レビュー #13)"]
def _patch(no, ja, demo=None, open_=None, ask=None):
    for _v in VIEWS:
        for _it in _v["items"]:
            if (no is None or _it["no"] == no) and _it["ja"] == ja and (id(_it), ja) not in _seen:
                _seen.add((id(_it), ja))
                if demo:
                    _o = _it.get("demo_ok")
                    _it["demo_ok"] = [_o[0] + "／" + demo[0], _o[1] + " / " + demo[1]] if _o else list(demo)
                if open_ and not _it.get("open"):
                    _it["open"] = list(open_); _it["ask"] = ask

_patch("5", "パスワードを忘れた方", demo=tapdemo("「パスワードを忘れた方はこちら」は約21px", "Liên kết 「パスワードを忘れた方はこちら」 khoảng 21px"))
_patch("4", "ログイン画面に戻る", demo=tapdemo("「ログイン画面に戻る」は約21px", "Liên kết 「ログイン画面に戻る」 khoảng 21px"))
