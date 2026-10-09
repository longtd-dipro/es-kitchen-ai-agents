# -*- coding: utf-8 -*-
"""
委託配送先Web「プロフィール」（OW_PROF）の画面設計書データ。
元：本物の Web（app/carrier/profile/page.tsx・lib/carrier/{area,seed,fromDomain}.ts・lib/domain/seed/carrier.ts）。
決定：docs/決定台帳.md F（2026-10-07：委託配送先のプロフィールの変更は運営の承認は要らない・変更したら運営へ通知する）、台帳 B（保有車両は委託または運営が入れる・保冷バッグ台帳は参照のみ）、
      台帳 I（プロフィールの変更に運営の承認は挟まない）、確認メモ_TW_委託配送先 §3（H-7〜H-9・H-40〜H-42）。
コードがまだ決定に追いついていないところは demo_ok。確認メモ §1-8 の状態 006「承認待ちの申請あり」は、Q-5＝承認なしのため作らない（B 段階メモ B-8）。
"""

TITLE = ["プロフィール（OW_PROF）", "Hồ sơ (OW_PROF)"]
SHEET = ["プロフィール", "Hồ sơ"]
BASENAME = "画面設計書_OW_PROF_プロフィール"
IMG_PREFIX = "OW_PROF"
OUT_DIR = "委託配送先Web"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：OW_<機能略>_<3桁>。委託配送先＝OW", "Screen Code theo 台帳 F (2026-10-07): OW_<機能略>_<3 chữ số>. 委託配送先 = OW"]
SITE = "carrier"
SYSTEM = {"ja": "委託配送先Web", "vi": "Web đối tác giao hàng (委託配送先Web)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "carrier", "loginId": "DE00001"}
CODE_PATHS = ["app/carrier", "lib/carrier", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "OW_PROF 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_PROF_001 No.1.5・8",
     "q": ["プロフィールの変更は運営の承認が要るか（Q-5）", "Thay đổi hồ sơ có cần 運営 duyệt không (Q-5)"],
     "a": ["要らない。「保存」で即反映し、変更した内容を運営へ通知する（画面の通知。メールは送らない）。「変更を申請」「承認待ち」「申請を取り下げる」は置かない", "Không cần. 「保存」 áp dụng ngay và thông báo nội dung đã đổi cho 運営 (thông báo trên màn hình, không gửi email). Không đặt 「変更を申請」「承認待ち」「申請を取り下げる」"],
     "src": "hong 回答 2026-10-07（台帳 F「委託配送先のプロフィールの変更」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_PROF_001 No.6.1・5.1〜5.3",
     "q": ["保有車両・対応エリア・対応温度帯を委託配送先が入れるか", "Đối tác có nhập xe sở hữu, khu vực phục vụ, vùng nhiệt đáp ứng không"],
     "a": ["委託配送先が入れる（保有車両は複数・対応エリアは都道府県単位で地域グループの一括選択つき・対応温度帯は 冷凍／冷蔵・常温／資材 の3つ）。コードは運営のマスタの値の読み取りだけ", "Đối tác nhập (xe sở hữu nhiều loại, khu vực theo tỉnh/thành có chọn gộp theo nhóm khu vực, vùng nhiệt đáp ứng 3 loại: lạnh đông／lạnh・thường／vật tư). Code chỉ đọc giá trị master của 運営"],
     "src": "台帳 B「委託配送会社への見積依頼の項目」・確認メモ_TW H-40・H-42・H-43（配送_06 §12-6・REQ-DL-402）"},
    {"date": "2026-10-07", "target": "OW_PROF_001 No.4",
     "q": ["担当者の表を編集できるか・メイン担当者は必須か", "Có sửa được bảng người phụ trách không, người phụ trách chính có bắt buộc không"],
     "a": ["編集できる（行の追加・削除）。メイン担当者を1名必須（E413）。申し込みフォーム 1/2 と同じ表", "Sửa được (thêm / xóa dòng). Bắt buộc có 1 người phụ trách chính (E413). Cùng bảng với form đăng ký 1/2"],
     "src": "確認メモ_TW H-41（Message List No.50・申し込み 1/2 と同じ表）"},
    {"date": "2026-10-07", "target": "OW_PROF 全体の入力",
     "q": ["入力のチェックの共通基準", "Chuẩn chung kiểm tra nhập"],
     "a": ["1行の文字 60・住所 255・備考 500・郵便番号は数字7桁（E05）・電話 数字とハイフンで10〜11桁（E06）。保存でまとめてチェックして項目の下に出す（P-FORM）", "Ô 1 dòng 60, địa chỉ 255, ghi chú 500, mã bưu chính 7 chữ số (E05), điện thoại chữ số và gạch nối 10〜11 chữ số (E06). Kiểm tra gộp khi lưu và hiện dưới mục (P-FORM)"],
     "src": "入力の共通基準（台帳 B・確認メモ H-7・H-8・H-9）"},
    {"date": "2026-10-07", "target": "配送不可曜日（祝日含む）", "q": ["配送不可曜日の形（O-7）", "Dạng thứ không giao được (O-7)"], "a": ["現在の形（配送不可曜日・祝日含む）のまま。運営のマスタへは「対応曜日」＝配送不可曜日以外の曜日に変換して保存する。祝日と委託配送不可日（日付）の対応づけは開発に確認する", "Giữ nguyên dạng hiện tại (thứ không giao được, gồm ngày lễ). Khi lưu vào master của 運営 đổi thành 「対応曜日」 = thứ khác thứ không giao được. Việc đối ứng ngày lễ với 委託配送不可日 (ngày cụ thể) hỏi dev"], "src": "hong 回答 2026-10-07（確認メモ_TW O-7）"},
    {"date": "2026-10-07", "target": "住所検索", "q": ["郵便番号から住所を入れる「住所検索」ボタン（O-8）", "Nút 「住所検索」 (mã bưu chính → địa chỉ) (O-8)"], "a": ["ボタンは出す（全システム共通・隠さない・あとの段階にもしない）。データの出どころは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込む（全サイト共通・決める人は hong）。つなぐ時期は決まっていない", "Hiển thị nút (chung toàn hệ thống, không ẩn, không để phase sau). Nguồn dữ liệu: nhập vào hệ thống dữ liệu mã bưu chính do Japan Post công bố (miễn phí) (chung mọi site, người quyết định là hong). Thời điểm nối chưa quyết"], "src": "hong 回答 2026-10-07（確認メモ_TW O-8）・2026-10-08（台帳 S「住所検索のデータの出どころ」・受付簿 #429）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [{"code": "OW_PROF_001", "ja": "プロフィール", "vi": "Hồ sơ"}]

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
     "const ready=async()=>{for(let i=0;i<40&&!document.querySelector('.tabs');i++){await wait(250);}await wait(300);};"
     "const tab=(n)=>document.querySelectorAll('.tabs button')[n].click();")
CODE_APPROVE = {"demo_ok": ["コードは「変更を申請」で運営の承認後に反映する形（確認メモ Q-5・H-17）。「保存」で即反映し運営へ通知する形にするのは宿題。運営Web に承認の画面はない", "Code theo kiểu 「変更を申請」 và áp dụng sau khi 運営 duyệt (確認メモ Q-5・H-17). Việc đổi sang 「保存」 áp dụng ngay và thông báo cho 運営 còn tồn. Web 運営 cũng chưa có màn duyệt"]}
CODE_RO = lambda what: {"demo_ok": ["コードでは編集できない（読み取りだけ・運営のマスタの値）（確認メモ %s）。編集できるようにするのは宿題" % what, "Trong code chưa sửa được (chỉ đọc, giá trị master của 運営) (確認メモ %s). Việc cho sửa còn tồn" % what]}

P1 = [
    I("1", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ プロフィール」。画面名「プロフィール」。右に「編集」（編集中は「キャンセル」「保存」）。", "Breadcrumb 「ホーム ／ プロフィール」. Tên màn 「プロフィール」. Bên phải có 「編集」 (khi đang sửa là 「キャンセル」「保存」)."]),
    I("1.3", "編集", "Sửa", ".phead .btn.pri", "button", "click", detail=["基本情報・配送対応情報の両方を編集の状態にする（保存は1回）。", "Chuyển cả thông tin cơ bản và thông tin giao hàng sang trạng thái sửa (lưu 1 lần)."]),
    I("2", "タブ", "Tab", ".tabs", "area", pattern="P-TAB", detail=["「基本情報」「配送対応情報」。入力中にタブを変えても入力は消さない。保存は画面全体で1回。選んだタブは URL（?tab=）に持つ。", "「基本情報」「配送対応情報」. Đổi tab khi đang nhập không mất nội dung. Lưu 1 lần cho cả màn hình. Tab đang chọn giữ trong URL (?tab=)."],
      demo_ok=["コードのタブは URL に持たない（再読み込みで基本情報に戻る）。宿題", "Tab trong code không nằm trong URL (tải lại về 基本情報). Việc còn tồn"]),
    I("3", "基本情報", "Thông tin cơ bản", ".collap:nth-of-type(1)", "area", detail=["委託配送先の基本情報。参照のときは読むだけ、編集のときは入力できる。", "Thông tin cơ bản của đối tác giao hàng. Xem thì chỉ đọc, sửa thì nhập được."]),
    I("3.1", "委託配送先ID", "ID đối tác giao hàng", "input[aria-label=\"委託配送先ID\"]", "label", detail=["DE＋5桁（ログインIDと同じ）。変えられない。", "DE + 5 chữ số (trùng ID đăng nhập). Không đổi được."]),
    I("3.2", "委託配送先名", "Tên đối tác giao hàng", "input[aria-label=\"委託配送先名\"]", "text", "input", req="○", len="文字列 60", ex=["栄成ロジ", "Tên công ty đối tác giao hàng"], err=["E01", "E04", "E13"],
      detail=["運営の委託配送先マスタの名前。前後の空白を取る。絵文字は不可。変更したら運営へ通知する。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tên trong master đối tác giao hàng của 運営. Bỏ khoảng trắng đầu/cuối. Không nhận emoji. Đổi thì thông báo cho 運営. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("3.3", "カナ", "Katakana", "input[aria-label=\"カナ\"]", "text", "input", req="－", len="文字列 60", ex=["エイセイロジ", "Katakana toàn góc (tối đa 60 ký tự)"], err=["E03", "E04"], detail=["全角カタカナ・長音・スペース。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Katakana toàn góc, trường âm, khoảng trắng. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("3.4", "種別", "Loại hình", "input[aria-label=\"種別\"]", "label", detail=["運営が決めた種別（委託・引き取りなど）。変えられない。", "Loại hình do 運営 quyết định (ủy thác・lấy hàng v.v.). Không đổi được."]),
    I("3.5", "郵便番号", "Mã bưu chính", "input[aria-label=\"郵便番号\"]", "text", "input", req="○", len=["数字7桁（ハイフンは任意）", "7 chữ số (gạch nối tùy chọn)"], ex=["220-0012", "7 chữ số, gạch nối tùy chọn; lưu dạng 123-4567"], err=["E01", "E05"],
      detail=["数字7桁。保存は 123-4567 の形。形式が違えば E05。", "7 chữ số. Lưu dạng 123-4567. Sai định dạng: E05."],
      demo_ok=["コードは形式のチェックがない（確認メモ H-8）。宿題", "Code chưa kiểm tra định dạng (確認メモ H-8). Việc còn tồn"]),
    I("3.6", "都道府県", "Tỉnh/thành", "select[aria-label=\"都道府県\"]", "select", "select", req="○", len="選択", ex=["神奈川県", "Chọn 1 trong 47 tỉnh/thành"], err=["E02"], detail=["47都道府県から選ぶ。", "Chọn trong 47 tỉnh/thành."]),
    I("3.7", "市区町村", "Quận/huyện", "input[aria-label=\"市区町村\"]", "text", "input", req="○", len="文字列 255", ex=["横浜市西区", "Quận/huyện, thành phố"], err=["E01", "E04"], detail=["住所の市区町村。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Quận/huyện, thành phố của địa chỉ. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("3.8", "町域・番地", "Khu vực・số nhà", "input[aria-label=\"町域・番地\"]", "text", "input", req="○", len="文字列 255", ex=["みなとみらい2-2-1", "Khu vực và số nhà"], err=["E01", "E04"], detail=["住所の町域・番地。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Khu vực và số nhà của địa chỉ. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("3.9", "建物・部屋番号", "Tòa nhà・số phòng", "input[aria-label=\"建物・部屋番号\"]", "text", "input", req="－", len="文字列 255", ex=["〇〇ビル5F", "Tên tòa nhà, số phòng"], err=["E04"], detail=["任意。入力欄は255文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tùy chọn. Ô nhập bị chặn ở giới hạn 255 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("3.10", "電話番号", "Số điện thoại", ".collap:nth-of-type(1) input[aria-label=\"電話番号\"]", "text", "input", req="○", len="文字列 20", ex=["045-000-0001", "Chữ số và gạch nối, 10〜11 chữ số"], err=["E01", "E06"], detail=["数字とハイフン。ハイフンを除いて10〜11桁。", "Chữ số và gạch nối. Bỏ gạch nối còn 10〜11 chữ số."],
      demo_ok=["コードは形式のチェックがない（確認メモ H-8）。宿題", "Code chưa kiểm tra định dạng (確認メモ H-8). Việc còn tồn"]),
    I("3.11", "FAX番号", "Số FAX", "input[aria-label=\"FAX番号\"]", "text", "input", req="－", len="文字列 20", ex=["045-000-0002", "Chữ số và gạch nối"], err=["E06"], detail=["任意。数字とハイフン。", "Tùy chọn. Chữ số và gạch nối."]),
    I("4", "担当者", "Người phụ trách", ".collap:nth-of-type(2)", "area", err=["E413"],
      detail=["メイン担当者・サブ担当者の表。メイン担当者を1名必須（E413）。編集のときは行を追加・削除できる（申し込みフォーム 1/2 と同じ表）。列：区分・担当者名・フリガナ・メールアドレス・電話番号。メイン担当者のメールアドレスは、ログイン・パスワード再設定の連絡先になる。",
              "Bảng người phụ trách chính / phụ. Bắt buộc có 1 người phụ trách chính (E413). Khi sửa thì thêm / xóa dòng được (cùng bảng với form đăng ký 1/2). Cột: phân loại, tên, furigana, email, điện thoại. Email của người phụ trách chính là địa chỉ liên lạc cho đăng nhập và đặt lại mật khẩu."],
      demo_ok=["コードの担当者の表は編集モードでも読み取りだけ（確認メモ H-41）。宿題", "Bảng người phụ trách trong code chỉ đọc kể cả khi đang sửa (確認メモ H-41). Việc còn tồn"]),
    I("4.1", "担当者の表", "Bảng người phụ trách", ".collap:nth-of-type(2) .tbl", "table",
      detail=["区分（メイン担当者／サブ担当者・必須）・担当者名（必須・60文字）・フリガナ（全角カタカナ・60文字）・メールアドレス（必須・160文字・形式 E07）・電話番号（10〜11桁）。", "Phân loại (người phụ trách chính／phụ, bắt buộc), tên (bắt buộc, 60 ký tự), furigana (katakana toàn góc, 60 ký tự), email (bắt buộc, 160 ký tự, định dạng E07), điện thoại (10〜11 chữ số)."], err=["E01", "E07"]),
]
P2 = [
    I("5", "対応エリア", "Khu vực phục vụ", ".collap:nth-of-type(1)", "area", detail=["配送できる地域。参照のときは読むだけ、編集のときは入力できる。", "Khu vực có thể giao hàng. Xem thì chỉ đọc, sửa thì nhập được."]),
    I("5.1", "対応エリア（都道府県）", "Khu vực phục vụ (tỉnh/thành)", ".collap:nth-of-type(1) .inp.ro", "check", "check", req="○", len=["複数選択（都道府県）", "Chọn nhiều (tỉnh/thành)"], ex=["東京・神奈川・埼玉", "Chọn nhiều tỉnh/thành"], err=["E02"],
      detail=["対応できる都道府県を複数選ぶ（都道府県の単位）。1つも選ばなければ E02。運営の委託配送先マスタの対応エリア（関東・中部など）と同じ内容で、運営のマスタとの対応づけは客先に確認する。", "Chọn nhiều tỉnh/thành có thể phục vụ (đơn vị tỉnh/thành). Không chọn gì: E02. Cùng nội dung với khu vực phục vụ trong master đối tác của 運営 (Kanto, Chubu v.v.); việc đối chiếu với master của 運営 cần hỏi khách."],
      open=["対応エリアと運営のマスタの「対応曜日・委託配送不可日」「対応エリア」の対応づけ（配送_11 14.5）が決まっていない。客先に確認する", "Chưa quyết việc đối chiếu khu vực phục vụ với 「対応曜日・委託配送不可日」「対応エリア」 trong master của 運営 (配送_11 14.5). Cần hỏi khách"], ask="お客様（ESキッチン）", **CODE_RO("H-42")),
    I("5.2", "地域グループの一括選択", "Chọn gộp theo nhóm khu vực", "-", "check", "check", req="－", len="選択", ex=["関東", "Chọn gộp các tỉnh/thành của một nhóm khu vực (ví dụ Kanto)"],
      detail=["「関東」「中部」などの地域グループを選ぶと、その中の都道府県をまとめて選ぶ。そのあと個別に外す・足すこともできる。", "Chọn nhóm khu vực như 「関東」「中部」 thì chọn gộp các tỉnh/thành trong đó. Sau đó vẫn bỏ / thêm từng tỉnh được."],
      demo_ok=["コードの画面にない（申し込み 2/2 は5択の単一選択）（確認メモ H-42）。宿題", "Màn hình trong code chưa có (đăng ký 2/2 là chọn 1 trong 5) (確認メモ H-42). Việc còn tồn"]),
    I("5.3", "対応温度帯", "Vùng nhiệt đáp ứng", "-", "check", "check", req="○", len=["複数選択（冷凍／冷蔵・常温／資材）", "Chọn nhiều (lạnh đông / lạnh, thường / vật tư)"], ex=["冷凍・冷蔵・常温", "Chọn nhiều trong 3 vùng nhiệt"], err=["E02"],
      detail=["対応できる温度帯を選ぶ（冷凍／冷蔵・常温／資材の3つ・複数可）。1つも選ばなければ E02。", "Chọn vùng nhiệt đáp ứng được (3 loại: lạnh đông／lạnh・thường／vật tư; chọn nhiều được). Không chọn gì: E02."],
      demo_ok=["コードの画面に温度帯の欄がない（確認メモ H-42・REQ-DL-402）。宿題", "Màn hình trong code chưa có ô vùng nhiệt (確認メモ H-42・REQ-DL-402). Việc còn tồn"]),
    I("5.4", "配送不可曜日", "Thứ không giao được", ".checks", "check", "check", req="－", len=["複数選択（月〜日・祝日）", "Chọn nhiều (thứ Hai〜Chủ nhật, ngày lễ)"], ex=["日", "Chọn các thứ không giao được (gồm cả ngày lễ)"],
      detail=["月〜日と祝日から複数選ぶ（配送不可曜日・祝日を含む。この形のまま）。運営のマスタへ保存するときは、「対応曜日」＝配送不可曜日に入っていない曜日に変換する。「祝日」は委託配送不可日（日付）と直接は対応しないので、その対応づけは開発に確認する（確認メモ O-7）。", "Chọn nhiều trong thứ Hai〜Chủ nhật và ngày lễ (thứ không giao được, gồm ngày lễ; giữ nguyên dạng này). Khi lưu vào master của 運営 thì đổi thành 「対応曜日」 = các thứ không nằm trong thứ không giao được. 「祝日」 không đối ứng trực tiếp với 委託配送不可日 (ngày cụ thể) nên chi tiết đối ứng cần hỏi dev (確認メモ O-7)."],
      open=["「祝日」と運営のマスタの「委託配送不可日」（日付）の対応づけが決まっていない。開発に確認する", "Chưa quyết việc đối ứng 「祝日」 với 「委託配送不可日」 (ngày cụ thể) trong master của 運営. Cần hỏi dev"], ask="開発"),
    I("5.5", "対応エリアに関する備考", "Ghi chú về khu vực phục vụ", "textarea[aria-label=\"対応エリアに関する備考\"]", "textarea", "input", req="－", len="文字列 500", ex=["小回り、配送の融通が利く", "Ghi chú về khu vực phục vụ (tối đa 500 ký tự)"], err=["E04"], detail=["複数行・500文字まで。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Nhiều dòng, tối đa 500 ký tự. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("6", "車両・設備情報", "Thông tin xe・thiết bị", ".collap:nth-of-type(2)", "area", detail=["保有車両・設備の情報。", "Thông tin xe sở hữu và thiết bị."]),
    I("6.1", "保有車両", "Xe sở hữu", ".collap:nth-of-type(2) .inp.ro", "check", "check", req="○", len=["複数選択（軽四車両・保冷車あり・冷凍車あり）", "Chọn nhiều (xe tải nhẹ, có xe lạnh, có xe đông lạnh)"], ex=["軽四車両・保冷車あり", "Chọn nhiều loại xe sở hữu"], err=["E02"],
      detail=["保有している車両を複数選べる（軽四車両・保冷車あり・冷凍車あり）。委託配送先が入れる（運営も入れられる：台帳 B）。1つも選ばなければ E02。", "Chọn nhiều loại xe đang sở hữu (xe tải nhẹ・có xe lạnh・có xe đông lạnh). Đối tác nhập (運営 cũng nhập được: 台帳 B). Không chọn gì: E02."], **CODE_RO("H-40・H-43")),
    I("6.2", "冷凍ボックスのレンタル希望", "Muốn thuê hộp lạnh đông", "input[name=\"p_frz\"]", "radio", "select", req="○", len="選択", init=["不要", "Không cần"], ex=["不要", "Chọn 不要 hoặc 要"], detail=["「不要」「要」。", "「不要」「要」."]),
    I("6.3", "冷蔵ボックスのレンタル希望", "Muốn thuê hộp lạnh", "input[name=\"p_ref\"]", "radio", "select", req="○", len="選択", init=["不要", "Không cần"], ex=["不要", "Chọn 不要 hoặc 要"], detail=["「不要」「要」。", "「不要」「要」."]),
    I("6.4", "冷蔵保管スペース", "Có chỗ bảo quản lạnh", "input[name=\"p_sp\"]", "radio", "select", req="○", len="選択", init=["あり", "Có"], ex=["あり", "Chọn あり hoặc なし"], detail=["「あり」「なし」。", "「あり」「なし」."]),
    I("6.5", "車両・設備情報に関する備考", "Ghi chú về xe・thiết bị", "textarea[aria-label=\"車両・設備情報に関する備考\"]", "textarea", "input", req="－", len="文字列 500", ex=["小回り、配送の融通が利く", "Ghi chú về xe, thiết bị (tối đa 500 ký tự)"], err=["E04"], detail=["複数行・500文字まで。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Nhiều dòng, tối đa 500 ký tự. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."]),
    I("7", "保冷バッグ・保冷剤（ESキッチンから貸与）", "Túi giữ lạnh・chất giữ lạnh (ESキッチン cho mượn)", ".collap:nth-of-type(3)", "area",
      detail=["運営の「保冷バッグ台帳」の参照だけ（編集できない）。貸与中の保冷バッグの個数を注記に出す。回収はしない（貸出・回収のワークフローは作らない）。紛失・破損・追加が必要なときは運営へ連絡する。運営が台帳を直す。",
              "Chỉ xem 「保冷バッグ台帳」 của 運営 (không sửa được). Ghi chú hiện số túi giữ lạnh đang mượn. Không thu hồi (không làm quy trình cho mượn / thu hồi). Khi mất, hỏng hoặc cần thêm thì liên hệ 運営. 運営 sửa sổ cái."]),
    I("7.1", "保冷バッグ台帳の表", "Bảng sổ cái túi giữ lạnh", ".collap:nth-of-type(3) .tbl", "table",
      detail=["列：番号・種類・数・渡した配送スタッフ・渡した日・状態・メモ。読むだけ。", "Cột: số, loại, số lượng, nhân viên đã nhận, ngày giao, trạng thái, ghi chú. Chỉ xem."]),
]
P3 = [
    I("1.4", "キャンセル", "Hủy", ".phead .btn:not(.pri)", "button", "click", err=["Q02"], detail=["編集をやめて元の内容に戻す。変更があれば Q02（キャンセル／破棄）を出す。", "Thôi sửa và quay về nội dung cũ. Có thay đổi thì hiện Q02 (キャンセル／破棄)."]),
    I("1.5", "保存", "Lưu", ".phead .btn.pri", "button", "click", pattern="P-FORM", err=["S01", "E30", "E31"],
      detail=["まとめてチェックして保存する。運営の承認は要らず、保存すると即反映し、変更した内容を運営へ通知する（画面の通知・メールは送らない）。できたら S01。押したら二重に押せなくする。失敗は E30、ほかの人が先に保存していたら E31。保存は見出しの「保存」1つ。",
              "Kiểm tra gộp rồi lưu. Không cần 運営 duyệt, lưu xong áp dụng ngay và thông báo nội dung đã đổi cho 運営 (thông báo trên màn hình, không gửi email). Xong hiện S01. Khóa nút sau khi bấm. Thất bại: E30; người khác đã lưu trước: E31. Lưu bằng 1 nút 「保存」 ở tiêu đề."], **CODE_APPROVE),
    I("8", "運営への通知の案内", "Hướng dẫn thông báo tới 運営", ".alert.info", "label", err=["I307"],
      detail=["編集中に、保存すると変更した内容が運営へ通知されることを I307 で出す。", "Khi đang sửa hiện I307 cho biết lưu xong nội dung đã đổi sẽ được thông báo cho 運営."],
      demo_ok=["コードの文言は「変更内容は運営が確認・承認してから反映されます。」（確認メモ Q-5）。I307 に替えるのは宿題", "Câu trong code là 「変更内容は運営が確認・承認してから反映されます。」 (確認メモ Q-5). Việc đổi sang I307 còn tồn"]),
    I("8.1", "住所検索", "Tìm địa chỉ", ".phead ~ .panel .btn::住所検索", "button", "click",
      detail=["郵便番号から住所を入れるボタン（編集中は常に出す。全システム共通・隠さない）。データは、日本郵便が公開している郵便番号データ（無料）をシステムに取り込んで使う（台帳 S・受付簿 #429）。つなぐ時期は決まっていない。", "Nút điền địa chỉ từ mã bưu chính (luôn hiện khi đang sửa; chung toàn hệ thống, không ẩn). Dữ liệu dùng dữ liệu mã bưu chính do Japan Post công bố (miễn phí), nhập vào hệ thống (台帳 S・受付簿 #429). Thời điểm nối chưa quyết."],
      open=["「住所検索」のデータを、いつの段階でつなぐか（取り込む時期）が決まっていない。hong に確認する", "Chưa quyết thời điểm nối dữ liệu cho 「住所検索」 (khi nào nhập dữ liệu). Cần hỏi hong"], ask="hong"),
]
P4 = [
    I("9", "編集中の配送対応情報", "Thông tin giao hàng khi đang sửa", ".collap:nth-of-type(2)", "area",
      detail=["編集のときは、対応エリア・対応温度帯・配送不可曜日・車両・設備・備考を入力できる。保有車両・対応エリア・対応温度帯は委託配送先が入れる（コードはまだ読み取りだけ）。", "Khi sửa thì nhập được khu vực phục vụ, vùng nhiệt đáp ứng, thứ không giao được, xe, thiết bị, ghi chú. Đối tác nhập xe sở hữu, khu vực phục vụ, vùng nhiệt (code còn chỉ đọc)."]),
]
P5 = [
    I("10", "入力エラー", "Lỗi nhập", ".collap .err", "label", err=["E01", "E05", "E06", "E413"],
      detail=["「保存」で必須が空なら E01、郵便番号の形式が違えば E05、電話が違えば E06、メイン担当者がいなければ E413 を項目の下に出して赤枠にする（P-FORM）。保存はされない。",
              "Khi 「保存」 mà ô bắt buộc để trống: E01, mã bưu chính sai định dạng: E05, điện thoại sai: E06, không có người phụ trách chính: E413 — hiện dưới mục và viền đỏ (P-FORM). Không lưu."],
      demo_ok=["コードは保存のときの必須チェック自体がなく、空のまま申請できる（確認メモ H-9）。宿題。撮影では保存を押さず、名前を空にした編集の状態を出す", "Code không có kiểm tra bắt buộc khi lưu, để trống vẫn gửi được (確認メモ H-9). Việc còn tồn. Khi chụp không bấm lưu mà hiện trạng thái sửa với tên để trống"]),
]
P6 = [
    I("11", "編集中に離れる確認", "Xác nhận khi rời lúc đang sửa", ".modal.sm", "modal", err=["Q02"], pattern="P-FORM",
      detail=["変更したまま、サイドメニュー・ヘッダーなどで別の画面へ移ろうとしたら Q02（キャンセル／破棄）を出す。ブラウザを閉じる・再読み込みでも同じ。", "Đã đổi mà định chuyển sang màn khác bằng menu bên, header v.v. thì hiện Q02 (キャンセル／破棄). Đóng trình duyệt hoặc tải lại cũng giống vậy."]),
]
P7 = [
    I("12", "保存完了のトースト", "Toast lưu xong", ".toast", "toast", "show", err=["S01"],
      detail=["保存できたら S01「保存しました。」。表示は新しい内容になり、運営へ通知する。", "Lưu xong hiện S01 「保存しました。」. Màn hình hiển thị nội dung mới và thông báo cho 運営."],
      demo_ok=["コードのトーストは「変更を申請しました（運営の承認後に反映）」で、承認待ちの状態になる（確認メモ Q-5・H-17）。宿題", "Toast trong code là 「変更を申請しました（運営の承認後に反映）」 và chuyển sang trạng thái chờ duyệt (確認メモ Q-5・H-17). Việc còn tồn"]),
]

VIEWS = [
    V("001", "OW_PROF_001", "基本情報タブ（参照）", "Tab thông tin cơ bản (xem)", "/carrier/profile", P1, setup=H + "await ready();", wait=400,
      note=["栄成ロジ（DE00001）。参照の状態。", "栄成ロジ (DE00001). Trạng thái xem."]),
    V("002", "OW_PROF_001", "配送対応情報タブ（参照・保冷バッグ台帳）", "Tab thông tin giao hàng (xem, sổ cái túi giữ lạnh)", "/carrier/profile", P2, setup=H + "await ready();tab(1);await wait(400);", wait=500,
      note=["「配送対応情報」のタブ。", "Tab 「配送対応情報」."]),
    V("003", "OW_PROF_001", "編集中（基本情報）", "Đang sửa (thông tin cơ bản)", "/carrier/profile", P3, setup=H + "await ready();btn('.phead .btn','編集').click();await wait(400);", wait=500,
      note=["「編集」を押した状態。", "Đã bấm 「編集」."]),
    V("004", "OW_PROF_001", "編集中（配送対応情報）", "Đang sửa (thông tin giao hàng)", "/carrier/profile", P4, setup=H + "await ready();btn('.phead .btn','編集').click();await wait(300);tab(1);await wait(400);", wait=500,
      note=["「編集」を押して「配送対応情報」のタブを開いた状態。", "Đã bấm 「編集」 và mở tab 「配送対応情報」."]),
    V("005", "OW_PROF_001", "入力エラー（必須を空）", "Lỗi nhập (bỏ trống bắt buộc)", "/carrier/profile", P5,
      setup=H + "await ready();btn('.phead .btn','編集').click();await wait(300);setv(document.querySelector('input[aria-label=\"委託配送先名\"]'),'');await wait(300);", wait=500,
      note=["名前を空にした編集の状態（保存は押さない。コードには保存時のチェックがない）。", "Trạng thái sửa với tên để trống (không bấm lưu; code không có kiểm tra khi lưu)."]),
    V("006", "OW_PROF_001", "編集中に離れる（Q02）", "Rời khi đang sửa (Q02)", "/carrier/profile", P6,
      setup=H + "await ready();btn('.phead .btn','編集').click();await wait(300);setv(document.querySelector('input[aria-label=\"FAX番号\"]'),'045-000-0002');await wait(300);document.querySelector('.menu a[href=\"/carrier/schedule\"]').click();await wait(500);", wait=500,
      note=["FAX番号を入れてサイドメニューの「スケジュール」を押した直後。", "Ngay sau khi nhập số FAX và bấm 「スケジュール」 ở menu bên."]),
    V("007", "OW_PROF_001", "保存の完了（トースト）", "Lưu xong (toast)", "/carrier/profile", P7,
      setup=H + "await ready();btn('.phead .btn','編集').click();await wait(300);setv(document.querySelector('input[aria-label=\"FAX番号\"]'),'045-000-0002');await wait(300);btn('.phead .btn','変更を申請').click();await wait(700);", wait=300,
      note=["FAX番号を入れて「変更を申請」（設計では「保存」）を押した直後。コードは承認待ちになる。", "Ngay sau khi nhập số FAX và bấm 「変更を申請」 (trong thiết kế là 「保存」). Code chuyển sang chờ duyệt."]),
]
