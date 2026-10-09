# -*- coding: utf-8 -*-
"""
委託配送先Web「ログイン・パスワード再設定・申し込みフォーム 1/2・2/2」（OW_AUTH）の画面設計書データ。
元：本物の Web（app/carrier/login/page.tsx・password/page.tsx・apply/page.tsx・apply/2/page.tsx・apply/_parts.tsx・_ui/CarrierProvider.tsx・lib/carrier/{logic,area}.ts）。
決定：docs/決定台帳.md F（2026-10-07：パスワードの扱い＝初期パスワードはシステムが作ってメイン担当者へ・認証コード4桁5分・ロックなし・パスワードは8文字以上で英字と数字を含む・ログイン期限は全サイト1日）、
      台帳 K（パスワードの再設定・ログイン期限）、台帳 I（申込は申込の確認の画面で承認）、確認メモ_TW_委託配送先 §3（H-9〜H-14・H-42〜H-44）。
ログイン前の画面なので LOGIN なしで撮る。コードがまだ決定に追いついていないところは demo_ok。決定済み（台帳 F 2026-10-07）：申込の受付後の流れ（公開フォーム → 受付番号の画面 → 受付メール → 運営H「申込の確認」で承認。受付番号は CA-YYYYMMDD-NNNN）。Claude 推奨（hong 確認待ち）：Q-14 の項目（電話番号を任意）。
見本データで撮れない状態（停止したアカウント・認証コードのエラー・申し込みの入力エラー・受付完了の画面）は demo_ok に理由を書く。
"""

TITLE = ["ログイン・パスワード再設定・申し込み（OW_AUTH）", "Đăng nhập・Đặt lại mật khẩu・Đăng ký (OW_AUTH)"]
SHEET = ["ログイン・申し込み", "Đăng nhập・Đăng ký"]
BASENAME = "画面設計書_OW_AUTH_ログイン・申し込み"
IMG_PREFIX = "OW_AUTH"
OUT_DIR = "委託配送先Web"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：OW_<機能略>_<3桁>。委託配送先＝OW", "Screen Code theo 台帳 F (2026-10-07): OW_<機能略>_<3 chữ số>. 委託配送先 = OW"]
SITE = "carrier"
SYSTEM = {"ja": "委託配送先Web", "vi": "Web đối tác giao hàng (委託配送先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
CODE_PATHS = ["app/carrier", "lib/carrier", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "OW_AUTH 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_AUTH_001 No.2",
     "q": ["ログイン失敗が続いたときのロック（Q-7）", "Khóa khi đăng nhập sai liên tiếp (Q-7)"],
     "a": ["ロックはかけない（誤入力が続いても、ログインIDまたはパスワードが正しくありませんと出すだけ）。ロックの状態の画面は作らない", "Không khóa (dù nhập sai liên tiếp vẫn chỉ hiện 「ログインIDまたはパスワードが正しくありません」). Không làm màn trạng thái khóa"],
     "src": "hong 回答 2026-10-07（台帳 F「パスワードの扱い」・受付簿 No.291）"},
    {"date": "2026-10-07", "target": "OW_AUTH_002",
     "q": ["パスワード再設定の認証コード・パスワードの形式", "Mã xác thực đặt lại mật khẩu và định dạng mật khẩu"],
     "a": ["認証コードは4桁・有効期限5分（ロックなし。入力回数の上限・再送の間隔は決めない）。新しいパスワードは8文字以上で英字と数字を含める。初期パスワードはシステムが作って送るので、ログイン中のパスワード変更の画面はなく、変えたいときはこの再設定で行う。コードの再設定コードは6桁・10分（宿題）", "Mã xác thực 4 chữ số, hiệu lực 5 phút (không khóa; không định nghĩa giới hạn số lần nhập và khoảng cách gửi lại). Mật khẩu mới từ 8 ký tự trở lên, gồm chữ cái và chữ số. Mật khẩu ban đầu do hệ thống tạo và gửi nên không có màn đổi mật khẩu khi đang đăng nhập; muốn đổi thì dùng màn đặt lại này. Mã đặt lại trong code là 6 chữ số・10 phút (việc còn tồn)"],
     "src": "hong 回答 2026-10-07（台帳 F「パスワードの扱い」「認証コード」・受付簿 No.291）"},
    {"date": "2026-10-07", "target": "OW_AUTH_001 No.1",
     "q": ["ログインの有効期間", "Thời hạn đăng nhập"],
     "a": ["全サイト 1日（台帳 K のまま）。切れたら次の操作でこのログイン画面へ戻る。保存のときに切れていたら、その場でログインの小窓を出して保存を続ける", "Mọi site đều 1 ngày (giữ nguyên 台帳 K). Hết hạn thì thao tác tiếp theo quay về màn đăng nhập này. Nếu hết hạn lúc lưu thì hiện cửa sổ đăng nhập ngay tại chỗ và tiếp tục lưu"],
     "src": "hong 回答 2026-10-07（確認メモ_TW 発見事項・台帳 K・M-1）"},
    {"date": "2026-10-07", "target": "OW_AUTH_003・004 全体",
     "q": ["お申し込みフォームの受付後の流れと項目（Q-14）", "Luồng sau khi tiếp nhận và các mục của form đăng ký (Q-14)"],
     "a": ["公開フォーム → 完了の画面に受付番号（CA-YYYYMMDD-NNNN）→ 受付のメール → 運営の「委託配送先」の「申込の確認」で承認 → 委託配送先マスタを作って ID を発行（仕入先と同じ形）。項目は会社名・住所・担当者・対応エリア・車両・設備・同意。電話・FAX・カナは任意", "Form công khai → màn hoàn tất hiện số tiếp nhận (CA + 5 chữ số) → email tiếp nhận → 運営 duyệt ở 「申込の確認」 của 「委託配送先」 → tạo master đối tác và cấp ID (giống nhà cung cấp). Mục gồm tên công ty, địa chỉ, người phụ trách, khu vực phục vụ, xe, thiết bị, đồng ý. Điện thoại・FAX・katakana là tùy chọn"],
     "src": "hong 決定（台帳 F 2026-10-07「配送スタッフの一括発行・停止の文言・委託の申込」。確認メモ_TW Q-14）"},
    {"date": "2026-10-07", "target": "OW_AUTH_004 No.20.3・20.4",
     "q": ["対応エリア・温度帯・保有車両の選び方", "Cách chọn khu vực phục vụ, vùng nhiệt, xe sở hữu"],
     "a": ["対応エリアは都道府県単位で地域グループの一括選択つき、対応温度帯は 冷凍／冷蔵・常温／資材 の3つ、保有車両は複数選べる。コードは対応エリア・保有車両が単一選択で温度帯の欄がない", "Khu vực phục vụ theo tỉnh/thành có chọn gộp theo nhóm khu vực, vùng nhiệt đáp ứng 3 loại (lạnh đông／lạnh・thường／vật tư), xe sở hữu chọn nhiều được. Code còn chọn 1 cho khu vực và xe, chưa có ô vùng nhiệt"],
     "src": "確認メモ_TW H-42・H-43（配送_06 §12-6・REQ-DL-402）"},
    {"date": "2026-10-07", "target": "配送不可曜日（祝日含む）", "q": ["配送不可曜日の形（O-7）", "Dạng thứ không giao được (O-7)"], "a": ["現在の形（配送不可曜日・祝日含む）のまま。運営のマスタへは「対応曜日」＝配送不可曜日以外の曜日に変換して保存する。祝日と委託配送不可日（日付）の対応づけは開発に確認する", "Giữ nguyên dạng hiện tại (thứ không giao được, gồm ngày lễ). Khi lưu vào master của 運営 đổi thành 「対応曜日」 = thứ khác thứ không giao được. Việc đối ứng ngày lễ với 委託配送不可日 (ngày cụ thể) hỏi dev"], "src": "hong 回答 2026-10-07（確認メモ_TW O-7）"},
    {"date": "2026-10-07", "target": "住所検索", "q": ["郵便番号から住所を入れる「住所検索」ボタン（O-8）", "Nút 「住所検索」 (mã bưu chính → địa chỉ) (O-8)"], "a": ["ボタンは出す（全システム共通・隠さない・あとの段階にもしない）。データの出どころは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込む（全サイト共通・決める人は hong）。つなぐ時期は決まっていない", "Hiển thị nút (chung toàn hệ thống, không ẩn, không để phase sau). Nguồn dữ liệu: nhập vào hệ thống dữ liệu mã bưu chính do Japan Post công bố (miễn phí) (chung mọi site, người quyết định là hong). Thời điểm nối chưa quyết"], "src": "hong 回答 2026-10-07（確認メモ_TW O-8）・2026-10-08（台帳 S「住所検索のデータの出どころ」・受付簿 #429）"},
    {"date": "2026-10-07", "target": "OW_AUTH_004 No.21", "q": ["同意する書面のリンク（O-1）", "Liên kết văn bản đồng ý (O-1)"], "a": ["環境変数から取り、空のときは出さない。あとで運営Web の設定画面へ移す（仕入先と同じ）", "Lấy từ biến môi trường, rỗng thì không hiện. Sau này chuyển sang màn cài đặt của 運営 (giống nhà cung cấp)"], "src": "Claude 推奨・hong 確認待ち（確認メモ_TW §4 の推奨。hong 2026-10-07 の open 回答のうち個別の答えがないもの）"},
    {"date": "2026-10-07", "target": "OW_AUTH_002 No.9.1", "q": ["パスワードの最大桁数・使える文字（O-3）", "Số ký tự tối đa và ký tự dùng được của mật khẩu (O-3)"], "a": ["8〜64文字・半角の英字と数字（英字と数字を両方含む）", "8〜64 ký tự, chữ cái và chữ số nửa góc (gồm cả hai)"], "src": "Claude 推奨・hong 確認待ち（確認メモ_TW §4 の推奨。hong 2026-10-07 の open 回答のうち個別の答えがないもの）"},
    {"date": "2026-10-07", "target": "OW_AUTH_002 No.7", "q": ["認証コードの入力回数・再送の間隔", "Số lần nhập mã xác thực và khoảng cách gửi lại"], "a": ["定義しない（4桁・5分・ロックなしだけ）", "Không định nghĩa (chỉ 4 chữ số, 5 phút, không khóa)"], "src": "hong 回答 2026-10-07"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "OW_AUTH_001", "ja": "ログイン", "vi": "Đăng nhập"},
    {"code": "OW_AUTH_002", "ja": "パスワード再設定", "vi": "Đặt lại mật khẩu"},
    {"code": "OW_AUTH_003", "ja": "申し込みフォーム 1/2", "vi": "Form đăng ký 1/2"},
    {"code": "OW_AUTH_004", "ja": "申し込みフォーム 2/2", "vi": "Form đăng ký 2/2"},
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
     "const q=(s)=>document.querySelector(s);"
     "const btn=(sel,t)=>[...document.querySelectorAll(sel)].find(b=>b.textContent.includes(t));"
     "const fill1=async()=>{setv(q('#r_name'),'株式会社テスト配送');setv(q('#r_zip'),'220-0012');setv(q('#r_pref'),'神奈川県');setv(q('#r_city'),'横浜市西区');setv(q('#r_addr'),'みなとみらい2-2-1');setv(q('#r_tel'),'045-000-0001');setv(q('input[aria-label=\"担当者名\"]'),'加藤 真由美');setv(q('input[aria-label=\"メールアドレス\"]'),'m.kato@example.jp');setv(q('input[aria-label=\"電話番号\"]'),'045-000-0001');await wait(300);};"
     "const otp=async(c)=>{[...document.querySelectorAll('.otp input')].forEach((e,i)=>setv(e,c[i]));await wait(200);};"
     "const toStep2=async()=>{setv(q('#rid'),'DE00001');setv(q('#rmail'),'m.kato@eisei-logi.example');await wait(200);q('.cta').click();await wait(500);};"
     "const toStep3=async()=>{await toStep2();await otp('1234');q('.cta').click();await wait(400);};")
NOLOCK = "ロックはかけない（hong 2026-10-07）"
CODE_TOAST = lambda where: {"demo_ok": ["コードは %s をトーストで出す（直書きの文言・確認メモ H-9・H-17）。項目の下に共通メッセージで出すのは宿題" % where, "Code hiện %s bằng toast (câu viết trực tiếp, 確認メモ H-9・H-17). Việc hiện dưới mục bằng thông điệp chung còn tồn" % where]}

A1 = [
    I("1", "ログイン", "Đăng nhập", ".auth-card", "area", err=["E525"],
      detail=["委託配送先Web の入口。ログインしていなければ、ログイン後の画面からここへ戻る。1つの会社に1つのアカウントを担当者で共有する。ログインの有効期間は1日で、切れたら次の操作でここへ戻る（保存のときに切れていたら、その場でログインの小窓を出し E525 を添えて、ログイン後に保存を続ける）。ログイン中のパスワード変更の画面はない（変えたいときは「パスワードを忘れた方はこちら」から再設定）。",
              "Cửa vào của Web đối tác giao hàng. Chưa đăng nhập thì các màn sau đăng nhập đưa về đây. Mỗi công ty 1 tài khoản dùng chung giữa các người phụ trách. Thời hạn đăng nhập 1 ngày; hết hạn thì thao tác tiếp theo quay về đây (nếu hết hạn lúc lưu thì hiện cửa sổ đăng nhập ngay tại chỗ kèm E525 và lưu tiếp sau khi đăng nhập). Không có màn đổi mật khẩu khi đang đăng nhập (muốn đổi thì đặt lại từ 「パスワードを忘れた方はこちら」)."]),
    I("1.1", "ロゴ・画面名", "Logo・tên màn hình", ".brand", "label", detail=["ES STATION のロゴと「ログイン」。", "Logo ES STATION và 「ログイン」."]),
    I("1.2", "ログインID", "ID đăng nhập", "#lid", "text", "input", req="○", len="文字列 20", ex=["DE00001", "ID đối tác giao hàng (DE + 5 chữ số)"], err=["E01"],
      detail=["委託配送先ID（DE＋5桁）。前後の空白を取り、全角の英数字は半角に直す。空のままログインしたら E01（項目名＝ログインID）。デモのときだけ、見本のIDが最初から入っている。", "ID đối tác giao hàng (DE + 5 chữ số). Bỏ khoảng trắng đầu/cuối, đổi chữ số/chữ cái toàn góc sang nửa góc. Đăng nhập khi để trống: E01 (tên mục = ログインID). Chỉ khi demo, ID mẫu được điền sẵn."]),
    I("1.3", "パスワード", "Mật khẩu", "#lpw", "text", "input", req="○", len="文字列 20", ex=["Passw0rd1", "Mật khẩu (từ 8 ký tự, gồm chữ cái và chữ số)"], err=["E01"],
      detail=["パスワード。入力中は伏せ字。空のままログインしたら E01（項目名＝パスワード）。デモのときだけ、見本のパスワードが最初から入っている（開発中はパスワードを確かめない・確認メモ H-13）。", "Mật khẩu. Hiện dấu * khi nhập. Đăng nhập khi để trống: E01 (tên mục = パスワード). Chỉ khi demo, mật khẩu mẫu được điền sẵn (khi phát triển chưa kiểm tra mật khẩu, 確認メモ H-13)."],
      demo_ok=["コードはパスワードを確かめない（見本の3アカウント〔DE00001・DE00006・DE00007〕のログインIDだけを見て、サーバーの account.signIn でアカウントの状態を確かめる）。本番のログインは Cognito（台帳 F 2026-10-07）。宿題", "Code không kiểm tra mật khẩu (chỉ xem ID đăng nhập của 3 tài khoản mẫu DE00001・DE00006・DE00007, rồi gọi account.signIn ở server để kiểm tra trạng thái tài khoản). Bản thật dùng Cognito (台帳 F 2026-10-07). Việc còn tồn"]),
    I("1.4", "パスワードを表示", "Hiện mật khẩu", "button[aria-label=\"パスワードを表示\"]", "button", "click", detail=["押すとパスワードを文字で出す／伏せ字に戻す。", "Bấm để hiện mật khẩu dạng chữ / quay về dấu *."]),
    I("1.5", "ログイン", "Đăng nhập", ".cta", "button", "click", err=["E01", "E520", "E401"],
      detail=["ログインID・パスワードを確かめ、合えばホーム（OW_HOME_001）へ移る。合わなければ E520「ログインIDまたはパスワードが正しくありません。」をフォームの上（ページ内）に出す。誤入力が続いてもロックはかけない。止めたアカウントは E401。ログインの有効期間は1日。",
              "Kiểm tra ID đăng nhập và mật khẩu, đúng thì chuyển sang Trang chủ (OW_HOME_001). Sai thì hiện E520 「ログインIDまたはパスワードが正しくありません。」 phía trên form (trong trang). Nhập sai liên tiếp cũng không khóa. Tài khoản đã dừng: E401. Thời hạn đăng nhập 1 ngày."]),
    I("1.6", "新規登録", "Đăng ký mới", ".cta-sub", "button", "click", detail=["お申し込みフォーム 1/2（OW_AUTH_003）を開く。", "Mở form đăng ký 1/2 (OW_AUTH_003)."]),
    I("1.7", "パスワードを忘れた方はこちら", "Quên mật khẩu", "a.linkbtn", "link", "click", detail=["パスワード再設定（OW_AUTH_002）を開く。", "Mở màn đặt lại mật khẩu (OW_AUTH_002)."]),
]
A2 = [
    I("2", "入力エラー（未入力）", "Lỗi nhập (để trống)", ".toast", "toast", "show", err=["E01"],
      detail=["ログインIDかパスワードが空のまま「ログイン」を押したら、空の項目の下に E01 を出して赤枠にする（P-FORM）。", "Bấm 「ログイン」 khi ID hoặc mật khẩu để trống thì hiện E01 dưới ô trống và viền đỏ (P-FORM)."], **CODE_TOAST("「ログインIDとパスワードを入力してください」")),
]
A3 = [
    I("3", "認証失敗", "Xác thực thất bại", ".toast", "toast", "show", err=["E520"],
      detail=["ログインIDかパスワードが違うとき、E520「ログインIDまたはパスワードが正しくありません。」をフォームの上に出す（ページ内メッセージエリア）。IDとパスワードのどちらが違うかは言わない。何度続いてもロックはかけない（Q-7：ロックなし）。入力した内容は残す。", "Khi ID hoặc mật khẩu sai hiện E520 「ログインIDまたはパスワードが正しくありません。」 phía trên form (vùng thông báo trong trang). Không nói rõ cái nào sai. Dù liên tiếp bao nhiêu lần cũng không khóa (Q-7: không khóa). Giữ nguyên nội dung đã nhập."], demo_ok=["コードは文言「ログインIDまたはパスワードが正しくありません」（E520 と同じ）を、フォームの上ではなくトーストで出す（直書きの文言・確認メモ H-9・H-17）。ページ内に出すのは宿題", "Code hiện câu 「ログインIDまたはパスワードが正しくありません」 (giống E520) bằng toast thay vì phía trên form (câu viết trực tiếp, 確認メモ H-9・H-17). Việc hiện trong trang còn tồn"]),
]
A4 = [
    I("4", "停止したアカウント", "Tài khoản đã dừng", "-", "area", err=["E401"],
      detail=["運営が止めたアカウント（委託配送先の契約終了など）でログインしようとしたら、E401「このアカウントは停止されています。ESキッチンへお問い合わせください。」をフォームの上に出す。", "Khi đăng nhập bằng tài khoản 運営 đã dừng (ví dụ kết thúc hợp đồng với đối tác) thì hiện E401 「このアカウントは停止されています。ESキッチンへお問い合わせください。」 phía trên form."],
      demo_ok=["見本の3アカウントはすべて有効で、停止（利用停止）のアカウントがないため撮れない。コードはサーバーの signIn が「停止」を返しても画面では見ず、失敗は常に同じ文言「ログインIDまたはパスワードが正しくありません」をトーストで出す（E401 は出ない。台帳 F 2026-10-07：停止の文言は E401 のまま）。宿題。撮るには利用停止の委託配送先アカウントの見本が要る", "Cả 3 tài khoản mẫu đều đang hoạt động, không có tài khoản bị dừng (利用停止) nên không chụp được. Dù signIn ở server trả về 「dừng」, màn hình không xét mà luôn hiện cùng câu 「ログインIDまたはパスワードが正しくありません」 bằng toast (không hiện E401. 台帳 F 2026-10-07: câu khi dừng giữ E401). Việc còn tồn. Để chụp cần tài khoản đối tác bị 利用停止 trong seed"]),
]
P1 = [
    I("5", "パスワード再設定", "Đặt lại mật khẩu", ".auth-card", "area",
      detail=["4つの手順：① ログインID・メールアドレス → ② 認証コード（4桁）→ ③ 新しいパスワード → ④ 完了。本人がログインできないときに使う。パスワードは認証コード（4桁・有効期限5分）で決め直す。全アプリで同じ仕組み（台帳 K）。",
              "4 bước: ① ID đăng nhập・email → ② mã xác thực (4 chữ số) → ③ mật khẩu mới → ④ hoàn tất. Dùng khi không đăng nhập được. Đặt lại mật khẩu bằng mã xác thực (4 chữ số, hiệu lực 5 phút). Cùng cơ chế ở mọi ứng dụng (台帳 K)."],
      demo_ok=["コードの再設定は画面だけでサーバーにつながっていない（コードは確かめず・メールは固定表示・通知メールも未接続）（確認メモ H-11）。宿題", "Màn đặt lại trong code chỉ là giao diện, chưa nối máy chủ (không kiểm tra mã, email hiện cố định, email thông báo cũng chưa nối) (確認メモ H-11). Việc còn tồn"]),
    I("5.1", "ログインID", "ID đăng nhập", "#rid", "text", "input", req="○", len="文字列 20", ex=["DE00001", "ID đối tác giao hàng"], err=["E01"], detail=["再設定するアカウントのログインID。", "ID đăng nhập của tài khoản cần đặt lại."]),
    I("5.2", "メールアドレス", "Địa chỉ email", "#rmail", "text", "input", req="○", len="文字列 160", ex=["m.kato@eisei-logi.example", "Email của người phụ trách đã đăng ký"], err=["E01", "E07", "E526"],
      detail=["登録している担当者のメールアドレス（担当者のメールアドレスと一致するもの）。空なら E01、形式が違えば E07、ログインIDとの組み合わせが登録にないとき E526（どちらが違うかは言わない）。", "Email của người phụ trách đã đăng ký (khớp với email người phụ trách). Để trống: E01, sai định dạng: E07, tổ hợp với ID đăng nhập không có trong dữ liệu: E526 (không nói cái nào sai)."]),
    I("5.3", "認証コードを送信", "Gửi mã xác thực", ".cta", "button", "click", detail=["登録のメールアドレスへ認証コード（4桁・有効期限5分）を送り、手順 ② へ進む。通知は担当者全員へ届く。", "Gửi mã xác thực (4 chữ số, hiệu lực 5 phút) tới email đã đăng ký và sang bước ②. Thông báo gửi tới tất cả người phụ trách."]),
    I("5.4", "ログイン画面に戻る", "Về màn đăng nhập", "a.linkbtn::ログイン画面に戻る", "link", "click", detail=["ログイン（OW_AUTH_001）へ戻る。手順 ④ では出さない。", "Quay về Đăng nhập (OW_AUTH_001). Bước ④ không hiện."]),
]
P1E = [
    I("6", "① 入力エラー", "① Lỗi nhập", ".toast", "toast", "show", err=["E01", "E07", "E526"],
      detail=["ログインID・メールアドレスが空なら E01、形式が違えば E07、ログインIDとメールアドレスの組み合わせが登録にないとき E526 を項目の下に出す（認証コードは送らない）。", "ID / email để trống: E01, sai định dạng: E07, tổ hợp ID/email không có trong dữ liệu: E526 — hiện dưới mục (không gửi mã xác thực)."], **CODE_TOAST("「ログインIDとメールアドレスを入力してください」")),
]
P2 = [
    I("7", "② 認証コード入力", "② Nhập mã xác thực", ".otp", "area",
      detail=["4桁の認証コードを1桁ずつの欄に入れる（入れると次の欄へ進む・Backspace で前の欄へ）。全部入るまで「確認」は押せない。有効期限は5分。コードは4桁（コードの6桁は宿題）。", "Nhập mã xác thực 4 chữ số vào từng ô (nhập xong chuyển ô sau, Backspace về ô trước). Chưa nhập đủ thì không bấm được 「確認」. Hiệu lực 5 phút. Mã 4 chữ số (6 chữ số trong code là việc còn tồn)."],
      demo_ok=["コードの再設定は認証コードを確かめない（確認メモ H-11）。宿題", "Màn đặt lại trong code không kiểm tra mã xác thực (確認メモ H-11). Việc còn tồn"]),
    I("7.1", "送信先のメールアドレス", "Email nơi gửi", ".mail", "label", detail=["認証コードを送ったメールアドレスを出す。", "Hiện email đã gửi mã xác thực."],
      demo_ok=["コードは固定の表示（eskitchen@sample.com）で、入力したメールを出さない（確認メモ H-11）。宿題", "Code hiện cố định (eskitchen@sample.com), không hiện email đã nhập (確認メモ H-11). Việc còn tồn"]),
    I("7.2", "認証コード（4桁）", "Mã xác thực (4 chữ số)", ".otp input:first-child", "text", "input", req="○", len=["数字4桁", "4 chữ số"], ex=["1234", "Mã 4 chữ số trong email"], err=["E01", "E521", "E522"],
      detail=["数字だけ。全角は半角に直す。違えば E521、有効期限（5分）を過ぎていれば E522。", "Chỉ chữ số. Đổi toàn góc sang nửa góc. Sai: E521; quá hiệu lực (5 phút): E522."]),
    I("7.3", "再送信", "Gửi lại", ".lead button.linkbtn", "button", "click", err=["S400"],
      detail=["押すと認証コードをもう一度送る（S400「認証コードを再送しました。」）。再送の間隔・入力回数の上限は決めない（hong 2026-10-07）。", "Bấm để gửi lại mã xác thực (S400 「認証コードを再送しました。」). Không định nghĩa khoảng cách gửi lại và giới hạn số lần nhập (hong 2026-10-07)."],
      demo_ok=["コードの再送信はトーストだけ（実際には送らない。再送のカウントダウンはなく、いつでも押せる）（確認メモ H-11）。宿題", "Gửi lại trong code chỉ hiện toast (thực tế không gửi; không có đếm ngược gửi lại, bấm được bất cứ lúc nào) (確認メモ H-11). Việc còn tồn"]),
    I("7.4", "確認", "Xác nhận", ".cta", "button", "click", detail=["コードを確かめて手順 ③ へ進む。4桁そろうまで押せない。", "Kiểm tra mã rồi sang bước ③. Chưa đủ 4 chữ số thì không bấm được."]),
]
P2E = [
    I("8", "② コードエラー", "② Lỗi mã", "-", "label", err=["E521", "E522"],
      detail=["コードが違えば E521「認証コードが正しくありません。」、有効期限を過ぎていれば E522「認証コードの有効期限が切れています。」を欄の下に出す。入力は残し、「再送信」で新しいコードを送れる。", "Mã sai: E521 「認証コードが正しくありません。」, quá hiệu lực: E522 「認証コードの有効期限が切れています。」 — hiện dưới ô. Giữ nội dung đã nhập, có thể gửi mã mới bằng 「再送信」."],
      demo_ok=["コードは認証コードを確かめないので、エラーが出ない（確認メモ H-11）。宿題", "Code không kiểm tra mã xác thực nên không hiện lỗi (確認メモ H-11). Việc còn tồn"]),
]
P3 = [
    I("9", "③ 新しいパスワード", "③ Mật khẩu mới", ".auth-card", "area", detail=["新しいパスワードを2回入れる。", "Nhập mật khẩu mới 2 lần."]),
    I("9.1", "新しいパスワード", "Mật khẩu mới", "#np1", "text", "input", req="○", len=["文字列 8字以上", "Chuỗi từ 8 ký tự trở lên"], ex=["Passw0rd1", "Từ 8 ký tự trở lên, gồm chữ cái và chữ số"], err=["E01", "E523"],
      detail=["8〜64文字で、半角の英字と数字を含める。伏せ字（右のボタンで表示）。条件に合わなければ E523「パスワードは8文字以上で、英字と数字を含めてください。」。最大は64文字・使える文字は半角の英字と数字（台帳 F 2026-10-07 で決定済み）。", "Từ 8 đến 64 ký tự, gồm chữ cái và chữ số. Hiện dấu * (nút bên phải để hiện). Không đạt điều kiện: E523 「パスワードは8文字以上で、英字と数字を含めてください。」. Tối đa 64 ký tự, ký tự dùng được là chữ cái và chữ số nửa góc (đã quyết định ở 台帳 F 2026-10-07)."],
      
      demo_ok=["コードの検査は8〜64文字・半角・英字と数字を含む（台帳 F 2026-10-07）で決定どおり。エラーの文言だけ「・8〜64文字の半角で、英字と数字を含めてください」で E523 と違う（共通メッセージ未使用）。宿題", "Kiểm tra trong code là 8〜64 ký tự・nửa góc・có chữ cái và chữ số (台帳 F 2026-10-07), đúng quyết định. Chỉ câu lỗi là 「・8〜64文字の半角で、英字と数字を含めてください」, khác E523 (chưa dùng thông điệp chung). Việc còn tồn"]),
    I("9.2", "パスワード（確認用）", "Mật khẩu (xác nhận)", "#np2", "text", "input", req="○", len=["文字列 8字以上", "Chuỗi từ 8 ký tự trở lên"], ex=["Passw0rd1", "Nhập lại đúng mật khẩu mới"], err=["E01", "E524"],
      detail=["同じパスワードをもう一度。違えば E524「パスワードが一致しません。」。", "Nhập lại cùng mật khẩu. Khác nhau: E524 「パスワードが一致しません。」."]),
    I("9.3", "確認", "Xác nhận", ".cta", "button", "click", detail=["チェックして新しいパスワードに変え、手順 ④ へ進む。", "Kiểm tra rồi đổi sang mật khẩu mới và sang bước ④."]),
    I("9.4", "パスワードの条件", "Điều kiện mật khẩu", ".hint", "label", detail=["入力欄の下に条件を出す（エラーのときは赤で E523・E524）。", "Hiện điều kiện dưới ô nhập (khi lỗi chuyển đỏ E523・E524)."]),
]
P3E = [
    I("10", "③ パスワードエラー", "③ Lỗi mật khẩu", ".hint", "label", err=["E523", "E524"],
      detail=["形式が合わなければ E523、確認用と違えば E524 を項目の下に赤で出す（P-FORM）。", "Sai định dạng: E523, khác ô xác nhận: E524 — hiện dưới mục bằng chữ đỏ (P-FORM)."],
      demo_ok=["コードの文言は「・8〜64文字の半角で、英字と数字を含めてください」「・確認用パスワードが一致しません」（共通メッセージ E523・E524 は未使用・確認メモ H-14・H-17）。宿題", "Câu trong code là 「・8〜64文字の半角で、英字と数字を含めてください」「・確認用パスワードが一致しません」 (chưa dùng thông điệp chung E523・E524, 確認メモ H-14・H-17). Việc còn tồn"]),
]
P4 = [
    I("11", "④ 完了", "④ Hoàn tất", ".done-mark", "label",
      detail=["「パスワードの再設定が完了し、ログインしました。そのままご利用いただけます。」と「ホーム画面へ」。新しいパスワードで自動ログインしてホームへ移る。", "Hiện 「パスワードの再設定が完了し、ログインしました。そのままご利用いただけます。」 và 「ホーム画面へ」. Tự động đăng nhập bằng mật khẩu mới và chuyển sang Trang chủ."]),
    I("11.1", "ホーム画面へ", "Về Trang chủ", ".cta", "button", "click", detail=["ホーム（OW_HOME_001）へ移る。ログインできなければログイン画面へ。", "Chuyển sang Trang chủ (OW_HOME_001). Không đăng nhập được thì về màn đăng nhập."]),
]
R1 = [
    I("12", "お申し込みフォーム（公開）", "Form đăng ký (công khai)", ".reg", "area",
      detail=["委託配送先になりたい会社が、ログインなしで使う公開のフォーム（専用リンクは使わない）。ステップ 1/2：基本情報・担当者、ステップ 2/2：対応エリア・車両・設備・同意。上のバーに ES STATION のロゴ・「ESキッチンホームページ」のリンク・「ログイン」ボタン、下に©表示。",
              "Form công khai dùng không cần đăng nhập, cho công ty muốn trở thành đối tác giao hàng (không dùng link riêng). Bước 1/2: thông tin cơ bản・người phụ trách; bước 2/2: khu vực phục vụ・xe・thiết bị・đồng ý. Thanh trên có logo ES STATION, link 「ESキッチンホームページ」 và nút 「ログイン」, bên dưới có dòng ©."]),
    I("12.1", "ステップの表示", "Hiển thị bước", ".stepper", "label", detail=["「ステップ 1 / 2」と、基本情報・配送対応情報の進み具合。", "「ステップ 1 / 2」 và tiến độ thông tin cơ bản・thông tin giao hàng."]),
    I("12.2", "委託配送先名", "Tên đối tác giao hàng", "#r_name", "text", "input", req="○", len="文字列 60", ex=["栄成ロジ株式会社", "Tên công ty (tối đa 60 ký tự)"], err=["E01", "E04", "E13"], detail=["会社名。前後の空白を取る。絵文字は不可。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tên công ty. Bỏ khoảng trắng đầu/cuối. Không nhận emoji. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("12.3", "カナ", "Katakana", "#r_kana", "text", "input", req="－", len="文字列 60", ex=["エイセイロジカブシキガイシャ", "Katakana toàn góc (tối đa 60 ký tự)"], err=["E03", "E04"], detail=["任意。全角カタカナ・長音・スペース。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tùy chọn. Katakana toàn góc, trường âm, khoảng trắng. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("12.4", "郵便番号", "Mã bưu chính", "#r_zip", "text", "input", req="○", len=["数字7桁（ハイフンは任意）", "7 chữ số (gạch nối tùy chọn)"], ex=["220-0012", "7 chữ số; lưu dạng 123-4567"], err=["E01", "E05"],
      detail=["数字7桁。形式が違えば E05。右の「住所検索」は常に出す（全システム共通・隠さない）。住所のデータは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込んで使う（台帳 S・受付簿 #429）。つなぐ時期は決まっていない。", "7 chữ số. Sai định dạng: E05. Nút 「住所検索」 bên phải luôn hiển thị (chung toàn hệ thống, không ẩn). Dữ liệu địa chỉ dùng dữ liệu mã bưu chính do Japan Post công bố (miễn phí), nhập vào hệ thống (台帳 S・受付簿 #429). Thời điểm nối chưa quyết."],
      open=["「住所検索」のデータを、いつの段階でつなぐか（取り込む時期）が決まっていない。hong に確認する", "Chưa quyết thời điểm nối dữ liệu cho 「住所検索」 (khi nào nhập dữ liệu). Cần hỏi hong"], ask="hong",
      demo_ok=["コードは形式のチェックがない（確認メモ H-8）。宿題", "Code chưa kiểm tra định dạng (確認メモ H-8). Việc còn tồn"]),
    I("12.5", "都道府県", "Tỉnh/thành", "#r_pref", "select", "select", req="○", len="選択", ex=["神奈川県", "Chọn 1 trong 47 tỉnh/thành"], err=["E02"],
      detail=["47都道府県から選ぶ。", "Chọn trong 47 tỉnh/thành."],
      demo_ok=["コードは文字を入れる欄（選択ではない）（確認メモ H-8）。選択にするのは宿題", "Code là ô nhập chữ (không phải chọn) (確認メモ H-8). Việc đổi sang chọn còn tồn"]),
    I("12.6", "市区町村", "Quận/huyện", "#r_city", "text", "input", req="○", len="文字列 255", ex=["横浜市西区", "Quận/huyện, thành phố"], err=["E01", "E04"], detail=["住所の市区町村。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Quận/huyện, thành phố của địa chỉ. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("12.7", "町域・番地", "Khu vực・số nhà", "#r_addr", "text", "input", req="○", len="文字列 255", ex=["みなとみらい2-2-1", "Khu vực và số nhà"], err=["E01", "E04"], detail=["住所の町域・番地。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Khu vực và số nhà của địa chỉ. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("12.8", "建物・部屋番号", "Tòa nhà・số phòng", "#r_bld", "text", "input", req="－", len="文字列 255", ex=["〇〇ビル5F", "Tên tòa nhà, số phòng"], err=["E04"], detail=["任意。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tùy chọn. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("12.9", "電話番号", "Số điện thoại", "#r_tel", "text", "input", req="－", len="文字列 20", ex=["045-000-0001", "Chữ số và gạch nối, 10〜11 chữ số"], err=["E06"],
      detail=["任意（Q-14：電話・FAX・カナは任意）。数字とハイフン。ハイフンを除いて10〜11桁。", "Tùy chọn (Q-14: điện thoại・FAX・katakana là tùy chọn). Chữ số và gạch nối. Bỏ gạch nối còn 10〜11 chữ số."],
      demo_ok=["コードは電話番号が必須（確認メモ Q-14・H-8）。任意にするのは宿題（Claude 推奨・hong 確認待ち）", "Code bắt buộc nhập điện thoại (確認メモ Q-14・H-8). Việc đổi sang tùy chọn còn tồn (Claude đề xuất, chờ hong xác nhận)"]),
    I("12.10", "FAX番号", "Số FAX", "#r_fax", "text", "input", req="－", len="文字列 20", ex=["045-000-0002", "Chữ số và gạch nối"], err=["E06"], detail=["任意。数字とハイフン。", "Tùy chọn. Chữ số và gạch nối."]),
    I("13", "担当者", "Người phụ trách", ".collap:nth-of-type(2)", "area", err=["E413"],
      detail=["担当者の表。メイン担当者を1名必須（E413）。区分・担当者名・フリガナ・メールアドレス・TEL。メイン担当者のメールアドレスが、ログイン情報（初期パスワード）と認証コードの送り先になる。行を追加・削除できる（1行は残す）。",
              "Bảng người phụ trách. Bắt buộc có 1 người phụ trách chính (E413). Gồm phân loại, tên, furigana, email, TEL. Email của người phụ trách chính là nơi nhận thông tin đăng nhập (mật khẩu ban đầu) và mã xác thực. Thêm / xóa dòng được (giữ lại ít nhất 1 dòng)."]),
    I("13.1", "区分", "Phân loại", "select[aria-label=\"区分\"]", "select", "select", req="○", len="選択", init=["メイン担当者", "Người phụ trách chính"], ex=["メイン担当者", "Chọn người phụ trách chính hoặc phụ"], detail=["「メイン担当者」「サブ担当者」。", "「メイン担当者」「サブ担当者」."]),
    I("13.2", "担当者名", "Tên người phụ trách", "input[aria-label=\"担当者名\"]", "text", "input", req="○", len="文字列 60", ex=["加藤 真由美", "Họ tên người phụ trách"], err=["E01", "E04"], detail=["必須。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Bắt buộc. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("13.3", "フリガナ", "Furigana", "input[aria-label=\"フリガナ\"]", "text", "input", req="－", len="文字列 60", ex=["カトウ マユミ", "Katakana toàn góc"], err=["E03", "E04"], detail=["任意。全角カタカナ。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tùy chọn. Katakana toàn góc. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("13.4", "メールアドレス", "Địa chỉ email", "input[aria-label=\"メールアドレス\"]", "text", "input", req="○", len="文字列 160", ex=["m.kato@example.jp", "Email nhận thông tin đăng nhập"], err=["E01", "E07"], detail=["必須。形式が違えば E07。", "Bắt buộc. Sai định dạng: E07."]),
    I("13.5", "TEL", "TEL", ".collap:nth-of-type(2) input[aria-label=\"電話番号\"]", "text", "input", req="○", len="文字列 20", ex=["045-000-0001", "Chữ số và gạch nối"], err=["E01", "E06"], detail=["必須。数字とハイフン。", "Bắt buộc. Chữ số và gạch nối."]),
    I("13.6", "行を追加", "Thêm dòng", ".collap:nth-of-type(2) .btn.out", "button", "click", detail=["サブ担当者の行を足す。", "Thêm một dòng người phụ trách phụ."]),
    I("13.7", "行を削除", "Xóa dòng", ".collap:nth-of-type(2) button[aria-label=\"行を削除\"]", "button", "click", detail=["その行を消す。残り1行のときは押せない。", "Xóa dòng đó. Còn 1 dòng thì không bấm được."]),
    I("14", "キャンセル", "Hủy", ".reg-body .btn.lg:not(.pri)", "button", "click", err=["Q02"], pattern="P-FORM",
      detail=["入力を捨ててログイン画面へ戻る。入力があれば Q02（キャンセル／破棄）を出す。ブラウザを閉じる・再読み込みでも同じ。", "Bỏ nhập và quay về màn đăng nhập. Có nhập thì hiện Q02 (キャンセル／破棄). Đóng trình duyệt hoặc tải lại cũng giống vậy."]),
    I("14.1", "次へ", "Tiếp", ".reg-body .btn.lg.pri", "button", "click", pattern="P-FORM", err=["E01"],
      detail=["必須を保存と同じにまとめてチェックし、エラーの項目の下に文言を出す。エラーがなければステップ 2/2（OW_AUTH_004）へ進む（入力は残る）。", "Kiểm tra gộp các ô bắt buộc như khi lưu và hiện câu dưới mục lỗi. Không lỗi thì sang bước 2/2 (OW_AUTH_004) (giữ nội dung đã nhập)."],
      demo_ok=["コードは必須が揃うまで「次へ」を押せなくする（エラーの文言は出ない）（確認メモ H-9）。宿題", "Code vô hiệu nút 「次へ」 cho đến khi đủ mục bắt buộc (không hiện câu lỗi) (確認メモ H-9). Việc còn tồn"]),
]
R1E = [
    I("15", "入力エラー（必須・形式）", "Lỗi nhập (bắt buộc, định dạng)", "-", "label", err=["E01", "E05", "E06", "E07", "E413"],
      detail=["「次へ」で、必須が空なら E01、郵便番号が違えば E05、電話が違えば E06、メールが違えば E07、メイン担当者がいなければ E413 を項目の下に出して赤枠にする（P-FORM）。", "Bấm 「次へ」: ô bắt buộc để trống: E01, mã bưu chính sai: E05, điện thoại sai: E06, email sai: E07, không có người phụ trách chính: E413 — hiện dưới mục và viền đỏ (P-FORM)."],
      demo_ok=["コードは必須が揃うまで「次へ」が押せず、エラーが出ない（確認メモ H-9）。宿題。撮影では名前だけ入れた状態", "Code không bấm được 「次へ」 cho đến khi đủ mục bắt buộc và không hiện lỗi (確認メモ H-9). Việc còn tồn. Khi chụp chỉ nhập tên"]),
]
R1ROW = [
    I("16", "担当者の行の追加", "Thêm dòng người phụ trách", ".collap:nth-of-type(2) .tbl tbody tr:nth-child(2)", "label",
      detail=["「行を追加」で2行目（サブ担当者）が増える。行の右のゴミ箱で消せる（1行は残る）。", "Bấm 「行を追加」 thì thêm dòng thứ 2 (người phụ trách phụ). Thùng rác bên phải xóa dòng (giữ lại ít nhất 1 dòng)."]),
]
R1Q = [
    I("17", "破棄の確認", "Xác nhận hủy", ".modal.sm", "modal", err=["Q02"], pattern="P-FORM",
      detail=["入力したままキャンセルを押したら、Q02「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」を出す。ボタンは「キャンセル」「破棄」。破棄するとログイン画面へ戻り、入力は消える。", "Bấm hủy khi đã nhập thì hiện Q02 「編集中の内容は保存されません。編集内容を破棄してもよろしいですか？」. Nút 「キャンセル」「破棄」. Hủy thì quay về màn đăng nhập và nội dung nhập bị xóa."]),
]
R2 = [
    I("18", "お申し込みフォーム 2/2", "Form đăng ký 2/2", ".reg", "area", detail=["ステップ 2/2：対応エリア・車両・設備情報・契約内容への同意。「戻る」で 1/2 へ（入力は残る）、「登録」で申し込む。", "Bước 2/2: khu vực phục vụ・xe・thiết bị・đồng ý nội dung hợp đồng. 「戻る」 về 1/2 (giữ nội dung), 「登録」 để đăng ký."]),
    I("19", "対応エリア", "Khu vực phục vụ", ".collap:nth-of-type(1)", "area", detail=["配送できる地域。都道府県単位で選ぶ。", "Khu vực có thể giao hàng. Chọn theo tỉnh/thành."]),
    I("19.1", "対応エリア（都道府県）", "Khu vực phục vụ (tỉnh/thành)", "#area", "select", "select", req="○", len=["複数選択（都道府県）", "Chọn nhiều (tỉnh/thành)"], ex=["東京・神奈川・埼玉", "Chọn nhiều tỉnh/thành; có thể chọn gộp theo nhóm khu vực"], err=["E02"],
      detail=["一部でも対応できる都道府県を複数選ぶ。「関東」「中部」などの地域グループで一括選択もできる。1つも選ばなければ E02。", "Chọn nhiều tỉnh/thành có thể phục vụ dù chỉ một phần. Cũng chọn gộp theo nhóm khu vực như 「関東」「中部」. Không chọn gì: E02."],
      demo_ok=["コードは東京・千葉・神奈川・大阪・北海道の5択の単一選択で、地域グループの一括選択がない（確認メモ H-42）。宿題", "Code chọn 1 trong 5 (Tokyo, Chiba, Kanagawa, Osaka, Hokkaido) và chưa có chọn gộp theo nhóm khu vực (確認メモ H-42). Việc còn tồn"]),
    I("19.2", "対応温度帯", "Vùng nhiệt đáp ứng", "-", "check", "check", req="○", len=["複数選択（冷凍／冷蔵・常温／資材）", "Chọn nhiều (lạnh đông / lạnh, thường / vật tư)"], ex=["冷凍・冷蔵・常温", "Chọn nhiều trong 3 vùng nhiệt"], err=["E02"],
      detail=["対応できる温度帯（冷凍／冷蔵・常温／資材の3つ・複数可）。1つも選ばなければ E02。", "Vùng nhiệt đáp ứng được (3 loại: lạnh đông／lạnh・thường／vật tư; chọn nhiều được). Không chọn gì: E02."],
      demo_ok=["コードの画面に温度帯の欄がない（確認メモ H-42・REQ-DL-402）。宿題", "Màn hình trong code chưa có ô vùng nhiệt (確認メモ H-42・REQ-DL-402). Việc còn tồn"]),
    I("19.3", "配送不可曜日", "Thứ không giao được", ".checks", "check", "check", req="－", len=["複数選択（月〜日・祝日）", "Chọn nhiều (thứ Hai〜Chủ nhật, ngày lễ)"], ex=["日", "Chọn các thứ không giao được (gồm cả ngày lễ)"],
      detail=["月〜日と祝日から複数選ぶ（配送不可曜日・祝日を含む。この形のまま）。運営のマスタへ保存するときは、「対応曜日」＝配送不可曜日に入っていない曜日に変換する。「祝日」は委託配送不可日（日付）と直接は対応しないので、その対応づけは開発に確認する（確認メモ O-7）。", "Chọn nhiều trong thứ Hai〜Chủ nhật và ngày lễ (thứ không giao được, gồm ngày lễ; giữ nguyên dạng này). Khi lưu vào master của 運営 thì đổi thành 「対応曜日」 = các thứ không nằm trong thứ không giao được. 「祝日」 không đối ứng trực tiếp với 委託配送不可日 (ngày cụ thể) nên chi tiết đối ứng cần hỏi dev (確認メモ O-7)."],
      open=["配送不可曜日（祝日含む）と運営のマスタの「対応曜日」「委託配送不可日」の対応づけが決まっていない。客先に確認する", "Chưa quyết việc đối chiếu thứ không giao được (gồm ngày lễ) với 「対応曜日」「委託配送不可日」 trong master của 運営. Cần hỏi khách"], ask="お客様（ESキッチン）"),
    I("19.4", "対応エリアに関する備考", "Ghi chú về khu vực phục vụ", "#areaNote", "textarea", "input", req="－", len="文字列 500", ex=["小回り、配送の融通が利く", "Ghi chú về khu vực phục vụ (tối đa 500 ký tự)"], err=["E04"], detail=["複数行・500文字まで。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Nhiều dòng, tối đa 500 ký tự. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("20", "車両・設備情報", "Thông tin xe・thiết bị", ".collap:nth-of-type(2)", "area", detail=["保有車両・設備の情報。", "Thông tin xe sở hữu và thiết bị."]),
    I("20.1", "保有車両", "Xe sở hữu", "#car", "select", "select", req="○", len=["複数選択（軽四車両・保冷車あり・冷凍車あり）", "Chọn nhiều (xe tải nhẹ, có xe lạnh, có xe đông lạnh)"], ex=["軽四車両・保冷車あり", "Chọn nhiều loại xe đang sở hữu"], err=["E02"],
      detail=["保有している車両を複数選べる（軽四車両・保冷車あり・冷凍車あり）。1つも選ばなければ E02。", "Chọn nhiều loại xe đang sở hữu (xe tải nhẹ・có xe lạnh・có xe đông lạnh). Không chọn gì: E02."],
      demo_ok=["コードは単一選択（確認メモ H-43）。宿題", "Code là chọn 1 (確認メモ H-43). Việc còn tồn"]),
    I("20.2", "冷凍ボックスのレンタル希望", "Muốn thuê hộp lạnh đông", "input[name=\"frz\"]", "radio", "select", req="○", len="選択", ex=["不要", "Chọn 不要 hoặc 要"], err=["E02"], detail=["「不要」「要」。", "「不要」「要」."]),
    I("20.3", "冷蔵ボックスのレンタル希望", "Muốn thuê hộp lạnh", "input[name=\"ref\"]", "radio", "select", req="○", len="選択", ex=["不要", "Chọn 不要 hoặc 要"], err=["E02"], detail=["「不要」「要」。", "「不要」「要」."]),
    I("20.4", "冷蔵保管スペース", "Có chỗ bảo quản lạnh", "input[name=\"sp\"]", "radio", "select", req="○", len="選択", ex=["あり", "Chọn あり hoặc なし"], err=["E02"], detail=["「あり」「なし」。", "「あり」「なし」."]),
    I("20.5", "車両・設備情報に関する備考", "Ghi chú về xe・thiết bị", "#carNote", "textarea", "input", req="－", len="文字列 500", ex=["小回り、配送の融通が利く", "Ghi chú về xe, thiết bị (tối đa 500 ký tự)"], err=["E04"], detail=["複数行・500文字まで。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Nhiều dòng, tối đa 500 ký tự. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("21", "契約書への同意", "Đồng ý hợp đồng", ".reg-body > label", "check", "check", req="○", len="選択", init=["未選択", "Chưa chọn"], ex=["オン", "Tick 「契約書に同意します。」"], err=["E527"],
      detail=["「契約書に同意します。」にチェックを入れる（必須）。入れないで「登録」を押したら E527「同意にチェックを入れてください。」。同意する書面のリンクは環境変数から取り、空のときは出さない（あとで運営Web の設定画面へ移す。仕入先と同じ。Claude 推奨・hong 確認待ち）。",
              "Tick 「契約書に同意します。」 (bắt buộc). Bấm 「登録」 mà chưa tick: E527 「同意にチェックを入れてください。」. Liên kết văn bản đồng ý lấy từ biến môi trường, rỗng thì không hiện (sau này chuyển sang màn cài đặt của 運営, giống nhà cung cấp; Claude đề xuất, chờ hong xác nhận)."],
      ),
    I("22", "戻る", "Quay lại", ".reg-body .btn.lg:not(.pri)", "button", "click", detail=["ステップ 1/2 へ戻る。入力は残る。", "Quay về bước 1/2. Giữ nội dung đã nhập."]),
    I("22.1", "登録", "Đăng ký", ".reg-body .btn.lg.pri", "button", "click", pattern="P-FORM", err=["E01", "E02", "E527", "E30"],
      detail=["必須と同意をまとめてチェックし、エラーの項目の下に文言を出す。エラーがなければ申し込みを受け付け、受付番号（CA-YYYYMMDD-NNNN）を作る。押したら二重に押せなくする。失敗は E30。",
              "Kiểm tra gộp các ô bắt buộc và đồng ý, hiện câu dưới mục lỗi. Không lỗi thì tiếp nhận đăng ký và tạo số tiếp nhận (CA + 5 chữ số). Khóa nút sau khi bấm. Thất bại: E30."],
      demo_ok=["コードは必須と同意が揃うまで「登録」が押せず、エラーの文言は出ない（確認メモ H-9）。宿題", "Code vô hiệu nút 「登録」 cho đến khi đủ mục bắt buộc và đồng ý, không hiện câu lỗi (確認メモ H-9). Việc còn tồn"]),
]
R2E = [
    I("23", "入力エラー（必須・同意）", "Lỗi nhập (bắt buộc, đồng ý)", "-", "label", err=["E02", "E527"],
      detail=["「登録」で、対応エリア・車両・レンタル希望・冷蔵保管スペースが未選択なら E02、同意がなければ E527 を項目の下に出す（P-FORM）。", "Bấm 「登録」: khu vực, xe, nhu cầu thuê, chỗ bảo quản lạnh chưa chọn: E02; chưa đồng ý: E527 — hiện dưới mục (P-FORM)."],
      demo_ok=["コードは必須と同意が揃うまで「登録」が押せず、エラーが出ない（確認メモ H-9）。宿題。撮影は初期の入力前の状態", "Code không bấm được 「登録」 cho đến khi đủ mục bắt buộc và đồng ý, không hiện lỗi (確認メモ H-9). Việc còn tồn. Khi chụp là trạng thái ban đầu chưa nhập"]),
]
R2D = [
    I("24", "受付完了", "Tiếp nhận hoàn tất", "-", "area", err=["S402"],
      detail=["登録できたら、受付完了の画面（ログインなしのまま）に S402「申込を受け付けました（受付番号：{受付番号}）。／ESキッチンが内容を確認します。結果は担当者のメールアドレスに連絡します。」を出し、受付番号（CA-YYYYMMDD-NNNN）を見せる。申し込みの受付メールも送る。運営が運営Web の委託配送先の「申込の確認」で承認すると、委託配送先マスタが作られ、ログインID（DE＋5桁）と初期パスワードがメイン担当者へメールで届く。",
              "Đăng ký xong hiện màn tiếp nhận hoàn tất (vẫn chưa đăng nhập) với S402 「申込を受け付けました（受付番号：{受付番号}）。／ESキッチンが内容を確認します。結果は担当者のメールアドレスに連絡します。」 và số tiếp nhận (CA + 5 chữ số). Đồng thời gửi email tiếp nhận. Khi 運営 duyệt ở 「申込の確認」 của 委託配送先 trên Web 運営 thì master đối tác được tạo và ID đăng nhập (DE + 5 chữ số) cùng mật khẩu ban đầu được gửi qua email tới người phụ trách chính."],
      demo_ok=["コードは受付後にトースト「お申し込みを受け付けました」だけを出してログイン画面へ戻り、受付番号は画面に出ない（確認メモ H-44・Q-14）。完了の画面は宿題。運営Web に申込の確認の画面はない（運営H の宿題）。受付メールの文面は Message List に未収載", "Code sau khi tiếp nhận chỉ hiện toast 「お申し込みを受け付けました」 rồi về màn đăng nhập, số tiếp nhận không hiện trên màn hình (確認メモ H-44・Q-14). Màn hoàn tất là việc còn tồn. Web 運営 chưa có màn 申込の確認 (việc còn tồn của 運営H). Nội dung email tiếp nhận chưa có trong Message List"],
      ),
    I("24.1", "受付のトースト（コード）", "Toast tiếp nhận (code)", ".toast", "toast", "show", detail=["コードは受付後、ログイン画面へ戻って「お申し込みを受け付けました」を出す。設計では完了の画面（No.24）に替える。", "Sau khi tiếp nhận, code quay về màn đăng nhập và hiện 「お申し込みを受け付けました」. Trong thiết kế đổi sang màn hoàn tất (No.24)."],
      demo_ok=["コードは受付後にトースト「お申し込みを受け付けました」を出してログイン画面へ戻る。台帳 F 2026-10-07：受付番号（CA-YYYYMMDD-NNNN）の画面に置き換える", "Code hiện toast 「お申し込みを受け付けました」 rồi quay về màn đăng nhập. 台帳 F 2026-10-07: sẽ thay bằng màn hình số tiếp nhận (CA-YYYYMMDD-NNNN)"]),
]
R1BACK = [
    I("25", "戻る（1/2 の入力を保持）", "Quay lại (giữ nội dung 1/2)", ".reg-body", "area",
      detail=["2/2 の「戻る」で 1/2 に戻ったとき、入れた内容（会社名・住所・担当者）はそのまま残っている。2/2 の入力も残る。", "Khi từ 2/2 bấm 「戻る」 về 1/2, nội dung đã nhập (tên công ty, địa chỉ, người phụ trách) vẫn còn. Nội dung của 2/2 cũng được giữ."]),
]

VIEWS = [
    V("001", "OW_AUTH_001", "初期表示", "Hiển thị ban đầu", "/carrier/login", A1, setup=H + "setv(q('#lid'),'');setv(q('#lpw'),'');await wait(300);", wait=500,
      note=["ログイン前の画面。デモでは見本のIDが最初から入っているので、空にして撮った。", "Màn trước đăng nhập. Khi demo ID mẫu được điền sẵn nên đã xóa trống rồi chụp."]),
    V("002", "OW_AUTH_001", "入力エラー（未入力：インライン E01）", "Lỗi nhập (để trống: inline E01)", "/carrier/login", A2,
      setup=H + "setv(q('#lid'),'');setv(q('#lpw'),'');await wait(200);q('.cta').click();await wait(400);", wait=300,
      note=["何も入れずに「ログイン」を押した直後。コードはトーストを出す。", "Ngay sau khi bấm 「ログイン」 khi chưa nhập gì. Code hiện toast."]),
    V("003", "OW_AUTH_001", "認証失敗（ログインIDまたはパスワードが違う）", "Xác thực thất bại (ID hoặc mật khẩu sai)", "/carrier/login", A3,
      setup=H + "setv(q('#lid'),'XX99999');setv(q('#lpw'),'wrong');await wait(200);q('.cta').click();await wait(500);", wait=300,
      note=["存在しないIDでログインした直後。コードはトーストを出す。", "Ngay sau khi đăng nhập bằng ID không tồn tại. Code hiện toast."]),
    V("004", "OW_AUTH_001", "停止したアカウント", "Tài khoản đã dừng", "/carrier/login", A4,
      note=["停止の状態は見本データで撮れない。画面は初期表示と同じ。", "Trạng thái dừng không chụp được bằng dữ liệu mẫu. Màn hình giống ban đầu."]),
    V("005", "OW_AUTH_002", "① ログインID・メールアドレス", "① ID đăng nhập・email", "/carrier/password", P1,
      note=["「パスワードを忘れた方はこちら」を開いた状態。", "Đã mở 「パスワードを忘れた方はこちら」."]),
    V("006", "OW_AUTH_002", "① 入力エラー（未入力・登録外のメール）", "① Lỗi nhập (để trống・email không đăng ký)", "/carrier/password", P1E,
      setup=H + "q('.cta').click();await wait(400);", wait=300,
      note=["何も入れずに「認証コードを送信」を押した直後。コードはトーストを出す。", "Ngay sau khi bấm 「認証コードを送信」 khi chưa nhập gì. Code hiện toast."]),
    V("007", "OW_AUTH_002", "② 認証コード入力（4桁・有効5分）", "② Nhập mã xác thực (4 chữ số・hiệu lực 5 phút)", "/carrier/password", P2,
      setup=H + "await toStep2();", wait=500,
      note=["ID・メールを入れて「認証コードを送信」を押した状態。", "Đã nhập ID・email và bấm 「認証コードを送信」."]),
    V("008", "OW_AUTH_002", "② コードエラー（不一致・期限切れ）", "② Lỗi mã (không khớp・quá hạn)", "/carrier/password", P2E,
      setup=H + "await toStep2();await otp('0000');", wait=500,
      note=["違うコード（0000）を入れた状態。コードは確かめないのでエラーは出ない。", "Đã nhập mã sai (0000). Code không kiểm tra nên không hiện lỗi."]),
    V("009", "OW_AUTH_002", "③ 新しいパスワード", "③ Mật khẩu mới", "/carrier/password", P3,
      setup=H + "await toStep3();", wait=500,
      note=["コードを入れて「確認」を押した状態。", "Đã nhập mã và bấm 「確認」."]),
    V("010", "OW_AUTH_002", "③ パスワードエラー（形式・不一致）", "③ Lỗi mật khẩu (định dạng・không khớp)", "/carrier/password", P3E,
      setup=H + "await toStep3();setv(q('#np1'),'abc');setv(q('#np2'),'abd');await wait(200);q('.cta').click();await wait(400);", wait=500,
      note=["短いパスワードと違う確認用を入れて「確認」を押した直後。", "Ngay sau khi nhập mật khẩu ngắn và ô xác nhận khác rồi bấm 「確認」."]),
    V("011", "OW_AUTH_002", "④ 完了（自動ログイン→ホームへ）", "④ Hoàn tất (tự đăng nhập → về Trang chủ)", "/carrier/password", P4,
      setup=H + "await toStep3();setv(q('#np1'),'Passw0rd1');setv(q('#np2'),'Passw0rd1');await wait(200);q('.cta').click();await wait(500);", wait=500,
      note=["正しいパスワードを2回入れて「確認」を押した直後。", "Ngay sau khi nhập đúng mật khẩu 2 lần và bấm 「確認」."]),
    V("012", "OW_AUTH_003", "申し込み 1/2：初期（基本情報・担当者）", "Đăng ký 1/2: ban đầu (thông tin cơ bản・người phụ trách)", "/carrier/apply", R1,
      note=["「新規登録」を開いた状態。", "Đã mở 「新規登録」."]),
    V("013", "OW_AUTH_003", "申し込み 1/2：入力エラー（必須・形式）", "Đăng ký 1/2: lỗi nhập (bắt buộc・định dạng)", "/carrier/apply", R1E,
      setup=H + "setv(q('#r_name'),'株式会社テスト配送');await wait(300);", wait=500,
      note=["名前だけ入れた状態。コードは「次へ」を押せないのでエラーは出ない。", "Chỉ nhập tên. Code không bấm được 「次へ」 nên không hiện lỗi."]),
    V("014", "OW_AUTH_003", "申し込み 1/2：担当者の行を追加・削除", "Đăng ký 1/2: thêm・xóa dòng người phụ trách", "/carrier/apply", R1ROW,
      setup=H + "btn('.collap .btn','行を追加').click();await wait(400);", wait=500,
      note=["「行を追加」を押した状態（2行になる）。", "Đã bấm 「行を追加」 (thành 2 dòng)."]),
    V("015", "OW_AUTH_003", "申し込み 1/2：キャンセル → 破棄の確認（Q02）", "Đăng ký 1/2: hủy → xác nhận hủy (Q02)", "/carrier/apply", R1Q,
      setup=H + "setv(q('#r_name'),'株式会社テスト配送');await wait(300);q('.reg-body .btn.lg:not(.pri)').click();await wait(500);", wait=500,
      note=["名前を入れて「キャンセル」を押した直後。", "Ngay sau khi nhập tên và bấm 「キャンセル」."]),
    V("016", "OW_AUTH_004", "申し込み 2/2：初期（対応エリア・車両・設備・同意）", "Đăng ký 2/2: ban đầu (khu vực・xe・thiết bị・đồng ý)", "/carrier/apply/2", R2,
      note=["ステップ 2/2 を直接開いた状態（1/2 の入力はない）。", "Mở thẳng bước 2/2 (chưa có nội dung 1/2)."]),
    V("017", "OW_AUTH_004", "申し込み 2/2：入力エラー（必須・同意）", "Đăng ký 2/2: lỗi nhập (bắt buộc・đồng ý)", "/carrier/apply/2", R2E,
      note=["コードは必須が揃うまで「登録」を押せないので、初期と同じ画面。", "Code không bấm được 「登録」 cho đến khi đủ nên màn hình giống ban đầu."]),
    V("018", "OW_AUTH_004", "申し込み 2/2：受付完了（Q-14 の答え次第）", "Đăng ký 2/2: tiếp nhận hoàn tất (tùy theo câu trả lời Q-14)", "/carrier/apply", R2D,
      setup=H + "await fill1();q('.reg-body .btn.lg.pri').click();await wait(700);setv(q('#area'),'神奈川');setv(q('#car'),'軽四車両');q('input[name=frz][value=不要]').click();q('input[name=ref][value=不要]').click();q('input[name=sp][value=あり]').click();q('.reg-body > label input').click();await wait(300);q('.reg-body .btn.lg.pri').click();await wait(900);", wait=300,
      note=["1/2・2/2 に入力して「登録」を押した直後。コードはログイン画面へ戻りトーストを出す（設計は受付番号つきの完了の画面）。", "Ngay sau khi nhập 1/2・2/2 và bấm 「登録」. Code quay về màn đăng nhập và hiện toast (thiết kế là màn hoàn tất có số tiếp nhận)."]),
    V("019", "OW_AUTH_003", "申し込み 2/2 から戻る（1/2 の入力を保持）", "Quay lại từ 2/2 (giữ nội dung 1/2)", "/carrier/apply", R1BACK,
      setup=H + "await fill1();q('.reg-body .btn.lg.pri').click();await wait(700);q('.reg-body .btn.lg:not(.pri)').click();await wait(700);", wait=500,
      note=["1/2 を入れて次へ進み、「戻る」を押した直後。", "Ngay sau khi nhập 1/2, bấm tiếp rồi bấm 「戻る」."]),
]
