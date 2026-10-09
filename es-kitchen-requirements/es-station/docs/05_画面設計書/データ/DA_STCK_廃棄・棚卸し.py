# -*- coding: utf-8 -*-
"""
ドライバーアプリ 棚卸し（DA_STCK）の画面設計書データ。
2026-10-08：廃棄の入力は ES配送便のステップ②だけにし、この画面から廃棄の登録をなくした（台帳 S・受付簿 #455）。残るのは棚卸しだけ。画面名・下のタブ・ホームのボタン・サイドメニューは「廃棄・棚卸し」から「棚卸し」に変えた（台帳 S・受付簿 #460）。ファイル名・画面コード DA_STCK は変えない。
元：本物の Web（app/driver/stock/page.tsx・app/driver/_ui/parts.tsx・lib/driver/{area,fromDomain,seed}.ts）。
決定の正：docs/決定台帳.md（F 2026-10-07「ドライバーの棚卸しで理論在庫を見せるか」・L 在庫・F「入力中に画面を離れるときの確認（Q02）」・F「棚卸」の用語・M-3 下のタブ）、受付簿 No.290〜292。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-5・§0・§3 宿題 H3・H5・H14・H17・§4 O1・回答）。廃棄に関する記述は 2026-10-08 に削除（廃棄は DA_ESDL_003 へ）。
撮影：スマホ幅 390×844。今日 2026/10/06（納品先がある高橋 誠 DR00002）と 2026/10/05（納品先がない小林 翔 DR00001）。
"""

TITLE = ["棚卸し（DA_STCK）", "Kiểm kê (DA_STCK)"]
SHEET = ["棚卸し", "Kiểm kê"]
BASENAME = "画面設計書_DA_STCK_廃棄・棚卸し"
IMG_PREFIX = "DA_STCK"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_STCK_001（棚卸しの1画面。以前は廃棄登録と棚卸しの2つのタブだったが、廃棄の入力は ES配送便②に一本化した：台帳 S・受付簿 #455）。Figma にはなく、アプリで追加した画面",
             "Screen Code theo 台帳 F (2026-10-07): DA_STCK_001 (1 màn kiểm kê. Trước đây có 2 tab đăng ký hủy và kiểm kê, nay nhập hủy chỉ ở bước ② của ES配送便: 台帳 S・受付簿 #455). Không có trong Figma, là màn thêm trong app"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00002"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_STCK 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。棚卸し＝DA_STCK_001", "DA. 棚卸し = DA_STCK_001"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_STCK_001 No.10〜12", "q": ["棚卸しでドライバーに理論在庫を見せるか。実在庫の初期値は", "Có hiển thị tồn lý thuyết cho tài xế khi kiểm kê không. Giá trị ban đầu của tồn thực là gì"],
     "a": ["ドライバーには理論在庫を見せ、実在庫の初期値も理論在庫にする（ステップを減らす）。法人・拠点（法人Web）には見せない。コードの動き（理論在庫・実在庫・差異の列）は決定どおり", "Hiển thị tồn lý thuyết cho tài xế, giá trị ban đầu của tồn thực cũng là tồn lý thuyết (giảm bước). Không hiển thị cho pháp nhân・địa điểm (Web pháp nhân). Hoạt động trong code (cột tồn lý thuyết・tồn thực・chênh lệch) đúng như quyết định"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW03・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-05", "target": "DA_STCK_001 No.5・No.13", "q": ["在庫の用語（点検／棚卸）", "Thuật ngữ tồn kho (点検/棚卸)"],
     "a": ["「棚卸」に統一（「点検」は使わない）。棚卸なしの拠点は棚卸しを出さない", "Thống nhất 「棚卸」 (không dùng 「点検」). Địa điểm 棚卸なし thì không hiện kiểm kê"], "src": "台帳 F 2026-10-05（受付簿 No.159）"},
    {"date": "2026-10-02", "target": "DA_STCK_001 No.9", "q": ["一覧にない商品の扱い", "Cách xử lý sản phẩm không có trong danh sách"],
     "a": ["バーコードをスキャンして足す。全部の商品に数を入れて送る（ない商品は 0）", "Quét mã vạch để thêm. Nhập số cho tất cả sản phẩm rồi gửi (sản phẩm không có thì 0)"], "src": "台帳 L・課題一覧 4-8（hong 2026-10-02）"},
    {"date": "2026-10-07", "target": "DA_STCK_001 No.10.2", "q": ["実在庫が理論在庫より多いときに送信を止めるか", "Có chặn gửi khi tồn thực nhiều hơn tồn lý thuyết không"],
     "a": ["止めない。最初は在庫を管理していないので、数えた昔の数は理論在庫より大きくなるのが普通。数の制限は共通の 0〜999,999 だけ", "Không chặn. Lúc đầu chưa quản lý tồn kho nên số đếm thực tế thường lớn hơn tồn lý thuyết. Chỉ giới hạn chung 0〜999.999"], "src": "hong 回答 2026-10-07（確認メモ B-11）"},
    {"date": "2026-10-07", "target": "DA_STCK_001 全体", "q": ["棚卸しの画面に下のタブを足すか", "Có thêm tab dưới cho màn 棚卸し không"],
     "a": ["足さない。メニュー（台帳 M-3 の5項目＝コードの TABS）にすでに「棚卸し」があるので、この画面の絵はコードのまま（戻るボタンだけ）", "Không thêm. Menu (5 mục 台帳 M-3 = TABS trong code) đã có 「棚卸し」 nên hình màn này giữ như code (chỉ có nút quay lại)"], "src": "hong 回答 2026-10-07（確認メモ B-3）"},
    {"date": "2026-10-08", "target": "DA_STCK_001 全体", "q": ["廃棄の入力元（廃棄登録の画面を残すか）", "Nguồn nhập hủy (có giữ màn đăng ký hủy không)"],
     "a": ["廃棄の入力は ES配送便のステップ②（DA_ESDL_003）だけにする。この画面から廃棄の登録（廃棄登録のタブ・商品の表・廃棄数・理由・「廃棄を登録」・廃棄のスキャン）をなくし、棚卸しだけを残す。以前この画面にあった廃棄の理由の選択肢（賞味期限切れ・破損・品質不良・代替品の回収〈不良品〉・その他）の行き先は DA_ESDL_003 No.9.3 の open", "Nhập hủy chỉ ở bước ② của ES配送便 (DA_ESDL_003). Bỏ đăng ký hủy khỏi màn này (tab đăng ký hủy・bảng sản phẩm・số hủy・lý do・nút 「廃棄を登録」・quét mã để hủy), chỉ giữ kiểm kê. Các lựa chọn lý do hủy từng có ở màn này (賞味期限切れ・破損・品質不良・代替品の回収〈不良品〉・その他) sẽ đi đâu: xem open ở DA_ESDL_003 No.9.3"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #455・確認表 X-4。置き換えた旧決定：廃棄は ES配送便②と廃棄登録の2か所から入る）"},
    {"date": "2026-10-08", "target": "画面名・DA_STCK_001 No.1", "q": ["廃棄の登録をなくしたあとの画面名・下のタブ・ホームのボタン・サイドメニューの名前", "Tên màn hình・tab dưới・nút ở trang chủ・menu bên sau khi bỏ đăng ký hủy"],
     "a": ["「廃棄・棚卸し」から「棚卸し」に変える（DA_HOME・DA_MANU・DA_AUTH ほか全ファイルの該当箇所も）", "Đổi từ 「廃棄・棚卸し」 thành 「棚卸し」 (cả các chỗ liên quan ở DA_HOME・DA_MANU・DA_AUTH và các file khác)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #460・確認表 X-4。置き換えた旧決定：台帳 F「サイドメニュー」の「廃棄・棚卸し」）"},
    {"date": "2026-10-08", "target": "DA_STCK_001 No.2・No.13", "q": ["棚卸しのない拠点を納品先の選択肢に出すか", "Có hiện địa điểm không kiểm kê trong lựa chọn nơi nhận không"],
     "a": ["出さない（棚卸しの画面の納品先の選択肢から外す）", "Không hiện (loại khỏi lựa chọn nơi nhận của màn kiểm kê)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #462 ②・確認表 X-1）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [{"code": "DA_STCK_001", "ja": "棚卸し", "vi": "Kiểm kê"}]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const btn=(t,sc)=>[...(sc||document.querySelector('.app')||document).querySelectorAll('button,a,label,.chk,.noti,[role=button]')].find(b=>(b.textContent||'').trim().includes(t));"
    "const click=async(t,sc)=>{const b=btn(t,sc);if(!b)throw new Error('no button '+t);b.click();await sleep(450)};"
    "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};"
    "const holdToast=()=>{if(window.__ht)return;window.__ht=1;const o=window.setTimeout;window.setTimeout=(f,t,...a)=>t===3000?0:o(f,t,...a)};"
    "const tab=async(i)=>{document.querySelectorAll('.segs button')[i].click();await sleep(500)};"
    "const plus=async(row,n)=>{for(let k=0;k<(n||1);k++){document.querySelectorAll('.tbl tr')[row].querySelector('button[aria-label=増やす]').click();await sleep(300)}};"
    "const minus=async(row,n)=>{for(let k=0;k<(n||1);k++){document.querySelectorAll('.tbl tr')[row].querySelector('button[aria-label=減らす]').click();await sleep(300)}};"
)

URL = "/driver/stock"


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


R = reg([
    A("1", "上の帯", "Thanh trên", ".topbar", "area", "view", ["左に戻るボタン、真ん中に画面名「棚卸し」。トラブル報告のボタンは出さない（配送に紐づかない画面）。", "Trái là nút quay lại, giữa là tên màn hình 「棚卸し」. Không hiện nút báo sự cố (màn không gắn với đơn giao)."]),
    A("1.1", "戻る", "Quay lại", ".topbar .rb.l", "button", "click", ["押すと前の画面へ戻る。入力が残っているときは破棄の確認（Q02）を出す。", "Bấm để về màn trước. Còn dữ liệu nhập thì hiện xác nhận hủy bỏ (Q02)."], err=["Q02"]),
    A("2", "納品先（ES配送便）", "Nơi nhận (ES配送便)", "select[aria-label=納品先]", "select", "select", [
        "今日の担当の ES配送便の納品先から1つ選ぶ。棚卸しはこの納品先（拠点）ごとに送る。COOL便の納品先と、棚卸なしの拠点（台帳 F）の納品先は出さない（受付簿 #462）。納品先がなければ I315 を出す。初期は先頭の納品先。納品先を変えると棚卸しの表も切り替わる。",
        "Chọn 1 trong các nơi nhận ES配送便 phụ trách hôm nay. Kiểm kê được gửi theo từng nơi nhận (địa điểm). Không hiện nơi nhận COOL便 và địa điểm 棚卸なし (台帳 F) (受付簿 #462). Không có nơi nhận thì hiện I315. Mặc định là nơi nhận đầu tiên. Đổi nơi nhận thì bảng kiểm kê cũng đổi."],
      req="○", len=["選択（納品先）", "Chọn (nơi nhận)"], init=["先頭の納品先", "Nơi nhận đầu tiên"], ex=["株式会社ひかり物産 本社", "Tên nơi nhận (ví dụ 「株式会社ひかり物産 本社」)"], err=["I315", "E02"],
      demo_ok=["コードはこの画面に「廃棄登録」「棚卸し」の2つのタブと廃棄登録の表（廃棄数・理由・「廃棄を登録」・廃棄のスキャン）をまだ持つ。決定（受付簿 #455）に合わせて、タブと廃棄登録を外し棚卸しだけにする（宿題）。この設計書の画像は棚卸しのタブで撮る", "Code vẫn còn 2 tab 「廃棄登録」「棚卸し」 và bảng đăng ký hủy (số hủy・lý do・「廃棄を登録」・quét mã để hủy) ở màn này. Sẽ bỏ tab và đăng ký hủy, chỉ giữ kiểm kê theo quyết định (受付簿 #455) (việc phải sửa). Ảnh trong thiết kế này chụp ở tab kiểm kê"]),
    A("4", "商品の検索", "Tìm sản phẩm", ".search input", "text", "input", ["名前またはコードの部分一致で棚卸しの表を絞る。「検索」キー（キーボード）／Enter を押してから絞る（台帳 M-1。入力のたびには絞らない）。0件のときは表の下に I01 を出す。", "Lọc bảng kiểm kê theo khớp một phần tên hoặc mã; lọc sau khi bấm phím 「検索」 (bàn phím)/Enter (台帳 M-1; không lọc mỗi lần gõ). 0 dòng thì hiện I01 dưới bảng."],
      req="－", len="文字列 60", ex=["カレー", "Một phần tên sản phẩm (ví dụ 「カレー」)"], valid=["前後の空白を取る。60文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Bỏ khoảng trắng đầu/cuối. Tối đa 60 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["I01", "E04"],
      demo_ok=["コードは0件のとき表を空にするだけで文を出さない（宿題）。商品はコードの検索に対応していない（名前だけ）", "Code khi 0 dòng chỉ để bảng trống, không hiện câu (việc phải sửa). Tìm kiếm trong code chỉ theo tên, chưa theo mã"]),
    A("8", "棚卸しの説明", "Hướng dẫn kiểm kê", ".hint", "label", "view", [
        "「実際の在庫数を入力するか、バーコードをスキャンしてください。理論在庫と差がある商品は送信時に運営管理者へ通知されます。」。納品先（拠点）の月次の棚卸し。同じ月度に法人Web の報告もあれば、最後の報告が有効（台帳 F）。廃棄はこの画面では入れない（ES配送便のステップ②だけ：受付簿 #455）。",
        "「実際の在庫数を入力するか、バーコードをスキャンしてください。理論在庫と差がある商品は送信時に運営管理者へ通知されます。」. Kiểm kê hằng tháng của nơi nhận (địa điểm). Nếu cùng tháng cũng có báo cáo ở Web pháp nhân thì báo cáo cuối cùng có hiệu lực (台帳 F). Không nhập hủy ở màn này (chỉ ở bước ② của ES配送便: 受付簿 #455)."]),
    A("9", "スキャンで数える", "Đếm bằng quét", ".chip", "button", "click", [
        "押すとバーコードを読み取り、その商品の実在庫を1増やして「「{商品名}」を1点数えました。」（S406）。一覧にない商品はスキャンで足せる（台帳 L）。",
        "Bấm để đọc mã vạch, tăng tồn thực của sản phẩm đó thêm 1 và hiện 「「{tên sản phẩm}」を1点数えました。」 (S406). Sản phẩm không có trong danh sách thì quét để thêm (台帳 L)."], err=["S406", "E329"],
      demo_ok=["コードはランダムに既存の行を選ぶ模擬（H14）。一覧にない商品を足す動きはない（宿題）", "Code mô phỏng chọn ngẫu nhiên một dòng có sẵn (H14). Chưa có hoạt động thêm sản phẩm không có trong danh sách (việc phải sửa)"]),
    A("10", "商品の表（棚卸し）", "Bảng sản phẩm (kiểm kê)", ".tbl", "table", "view", [
        "棚卸の下書きの商品（その拠点に関係する商品）。列：商品名・理論在庫・実在庫・差異。",
        "Các sản phẩm của bản nháp kiểm kê (sản phẩm liên quan đến địa điểm đó). Cột: tên sản phẩm・tồn lý thuyết・tồn thực・chênh lệch."]),
    A("10.1", "理論在庫", "Tồn lý thuyết", ".tbl td.num", "label", "view", [
        "前回の棚卸の数＋届けた数−この締めの報告で捨てた数。ドライバーには見せる（hong 2026-10-07。法人Web には見せない）。読み取り専用。",
        "Số kiểm kê lần trước + số đã giao − số đã hủy trong báo cáo kỳ này. Hiển thị cho tài xế (hong 2026-10-07; không hiển thị ở Web pháp nhân). Chỉ đọc."]),
    A("10.2", "実在庫", "Tồn thực", ".tbl tr:nth-child(2) td:nth-child(3) .stp", "text", "click", [
        "いま数えた実際の在庫。初期値は理論在庫（ステップを減らす：hong 2026-10-07）。＋／−で直す。0〜999,999 の整数。",
        "Tồn kho thực đếm được. Giá trị ban đầu là tồn lý thuyết (giảm bước: hong 2026-10-07). Chỉnh bằng ＋/−. Số nguyên 0〜999.999."],
      req="○", len="整数 0〜999,999", init=["理論在庫", "Tồn lý thuyết"], ex=["3", "Tồn thực 3"], valid=["0 以上 999,999 以下の整数。理論在庫より大きくてもよい（止めない）。", "Số nguyên từ 0 đến 9.999. Lớn hơn tồn lý thuyết cũng được (không chặn)."], err=["E12", "E14"],
      demo_ok=["コードのサーバーは実在庫が理論在庫より多いと送信を止める（宿題）。決定は止めない：最初は在庫を管理していないので、入力する昔の数が理論在庫より大きくなるのが普通（hong 2026-10-07）", "Server trong code chặn gửi khi tồn thực nhiều hơn tồn lý thuyết (việc phải sửa). Quyết định là không chặn: lúc đầu chưa quản lý tồn kho nên số cũ nhập vào thường lớn hơn tồn lý thuyết (hong 2026-10-07)"]),
    A("10.3", "差異", "Chênh lệch", ".tbl tr:nth-child(3) td:nth-child(4)", "label", "view", ["実在庫 − 理論在庫。0 でないときは赤く出す。", "Tồn thực − tồn lý thuyết. Khác 0 thì hiện chữ đỏ."]),
    A("11", "棚卸しを送信", "Gửi kiểm kê", ".foot .btn.pri", "button", "click", [
        "下に固定。「棚卸しを送信」（差異があれば「（差異 n件）」を付ける）。押すと棚卸の申告として送る（法人Web の棚卸報告と同じ記録。最後の報告が有効）。差異なしは S208、差異ありは S318（差異は運営が確認する）。オフラインなら端末に保存して「未送信」（W311）。",
        "Cố định ở dưới. 「棚卸しを送信」 (có chênh lệch thì thêm 「（差異 n件）」). Bấm để gửi dưới dạng khai báo kiểm kê (cùng bản ghi với 棚卸報告 ở Web pháp nhân; báo cáo cuối cùng có hiệu lực). Không chênh lệch: S208, có chênh lệch: S318 (vận hành xác nhận). Offline thì lưu trên thiết bị thành 「未送信」 (W311)."],
      err=["S208", "S318", "W311"]),
    A("12", "納品先がないときの表示", "Hiển thị khi không có nơi nhận", ".empty", "label", "view", ["今日の担当に ES配送便の納品先がないとき「今日の担当に ES配送便の納品先はありません。」（I315）。選択欄は空、表は出ても送信できない。", "Khi hôm nay không có nơi nhận ES配送便 phụ trách thì 「今日の担当に ES配送便の納品先はありません。」 (I315). Ô chọn trống, bảng hiện nhưng không gửi được."], err=["I315"]),
    A("13", "棚卸なしの拠点", "Địa điểm không kiểm kê", ".hint", "label", "view", ["棚卸なしの拠点（台帳 F「棚卸なし」）は、この画面の納品先の選択肢（No.2）から外す（hong 2026-10-08・受付簿 #462）。そのため通常は選べず、I318 は出ない。万一（拠点の設定が画面を開いたあとに「棚卸なし」へ変わったときなど）その拠点が選ばれたままなら、棚卸しの欄に「この納品先は棚卸しが要りません。」（I318）を出し、表と送信ボタンは出さない。", "Địa điểm 棚卸なし (台帳 F 「棚卸なし」) bị loại khỏi lựa chọn nơi nhận (No.2) của màn này (hong 2026-10-08, 受付簿 #462), nên thường không chọn được và không hiện I318. Chỉ khi địa điểm đó vẫn đang được chọn (ví dụ cài đặt địa điểm đổi thành 「棚卸なし」 sau khi mở màn) thì phần kiểm kê hiện 「この納品先は棚卸しが要りません。」 (I318), không hiện bảng và nút gửi."], err=["I318"],
      demo_ok=["見本データに「棚卸なし」の拠点がなく、画面の絵は撮れない。コードは棚卸なしの拠点も納品先の選択肢に出し、見出しだけの空の表と有効な送信ボタンを出し、I318 の文は出ない。送信すると「この納品先は棚卸なしの拠点です（棚卸しはいりません）」（409）をトーストで出す（宿題）", "Dữ liệu mẫu không có địa điểm 「棚卸なし」 nên không chụp được hình. Code hiện bảng rỗng chỉ có tiêu đề và nút gửi vẫn bấm được, không hiện câu I318; khi gửi thì toast 「この納品先は棚卸なしの拠点です（棚卸しはいりません）」 (409) (việc phải sửa)"]),
    A("14", "離脱の確認", "Xác nhận rời đi", ".modal", "modal", "view", [
        "実在庫を入力して送信していないとき、戻る・ほかの画面への移動・ブラウザを閉じる／再読み込みで「編集内容を破棄しますか？」（Q02）。「破棄」で離れる、「キャンセル」で残る。",
        "Khi đã nhập tồn thực mà chưa gửi, bấm quay lại・chuyển màn・đóng/tải lại trình duyệt thì hiện 「編集内容を破棄しますか？」 (Q02). 「破棄」 để rời đi, 「キャンセル」 để ở lại."], err=["Q02"]),
    A("14.1", "破棄", "Hủy bỏ", ".modal .btn.pri", "button", "click", ["入力を捨てて移動する。", "Bỏ dữ liệu nhập và chuyển đi."]),
    A("14.2", "キャンセル", "Hủy", ".modal .btn.sec", "button", "click", ["モーダルを閉じて入力に戻る。", "Đóng modal và quay lại nhập."]),
])


def pick(*nos):
    return [R[n] for n in nos]


VIEWS = [
    V("003", "DA_STCK_001", "検索で0件", "Tìm kiếm 0 kết quả", URL, pick("4", "10"),
      setup="await tab(1); setv(document.querySelector('.search input'),'あああ'); await sleep(400);", login="DR00002", today="2026/10/06",
      note=["棚卸しのタブ。一致する商品がないので表は空になる。決定は表の下に I01「表示するデータがありません。」を出す。", "Tab kiểm kê. Không có sản phẩm khớp nên bảng trống. Quyết định: hiện I01 「表示するデータがありません。」 dưới bảng."]),
    V("004", "DA_STCK_001", "納品先なし（「今日の担当に ES配送便の納品先はありません。」）", "Không có nơi nhận (「今日の担当に ES配送便の納品先はありません。」)", URL,
      pick("2", "12"), setup="await tab(1);", login="DR00001", today="",
      note=["小林 翔（DR00001）・今日 2026/10/05。今日の担当がない。決定は I315 を納品先の欄に出し、コードは文を出す（選択欄は空）。", "Kobayashi Sho (DR00001), hôm nay 2026/10/05. Hôm nay không có phần phụ trách. Quyết định: hiện I315 ở mục nơi nhận, code hiện câu (ô chọn trống)."]),
    V("005", "DA_STCK_001", "棚卸し・初期（納品先の選択・理論在庫・実在庫・差異）", "Kiểm kê・ban đầu (chọn nơi nhận・tồn lý thuyết・tồn thực・chênh lệch)", URL,
      pick("1", "1.1", "2", "4", "8", "9", "10", "10.1", "10.2", "10.3", "11"), setup="await tab(1);", login="DR00002", today="2026/10/06",
      note=["高橋 誠（DR00002）・今日 2026/10/06・納品先はひかり物産 本社（ES配送便）。初期値は理論在庫なので差異はすべて 0。ドライバーには理論在庫を見せる（hong 2026-10-07）。", "Takahashi Makoto (DR00002), hôm nay 2026/10/06, nơi nhận là Hikari Bussan trụ sở (ES配送便). Giá trị ban đầu là tồn lý thuyết nên chênh lệch đều bằng 0. Hiển thị tồn lý thuyết cho tài xế (hong 2026-10-07)."]),
    V("006", "DA_STCK_001", "棚卸し・入力中（差異あり）", "Kiểm kê・đang nhập (có chênh lệch)", URL,
      pick("10.2", "10.3", "11"), setup="await tab(1); await minus(2, 1); await minus(3, 1);", login="DR00002", today="2026/10/06",
      note=["2つの商品の実在庫を1ずつ減らした。差異が赤く出て、ボタンに「差異 2件」が付く。", "Giảm tồn thực của 2 sản phẩm mỗi cái 1. Chênh lệch hiện đỏ, nút có thêm 「差異 2件」."]),
    V("007", "DA_STCK_001", "棚卸なしの拠点（「棚卸しは要りません」）", "Địa điểm không kiểm kê (「棚卸しは要りません」)", URL,
      pick("13"), setup="await tab(1);", login="DR00002", today="2026/10/06",
      note=["見本データに棚卸なしの拠点がないので、画面の絵は通常の棚卸し。決定の動きは項目の説明のとおり。", "Dữ liệu mẫu không có địa điểm 棚卸なし nên hình là kiểm kê thông thường. Hoạt động theo quyết định như mô tả trong mục."]),
    V("008", "DA_STCK_001", "離脱確認（Q02）", "Xác nhận rời đi (Q02)", URL,
      pick("14", "14.1", "14.2"), setup="await tab(1); await minus(2, 1); document.querySelector('.topbar .rb.l').click(); await sleep(600);", full=False, login="DR00002", today="2026/10/06",
      note=["棚卸しの実在庫を変えたまま戻るボタンを押した。", "Bấm quay lại khi đã đổi tồn thực trong kiểm kê."]),
    V("009", "DA_STCK_001", "送信完了（トースト：棚卸しを送信）", "Hoàn tất gửi (toast: đã gửi kiểm kê)", URL,
      pick("11"), setup="holdToast(); await tab(1); await minus(2, 1); document.querySelector('.foot .btn.pri').click(); await sleep(1500);", login="DR00002", today="2026/10/06",
      note=["実在庫を1減らして「棚卸しを送信」を押した直後。差異ありなのでトースト S318（差異なしは S208）。", "Ngay sau khi giảm tồn thực 1 và bấm 「棚卸しを送信」. Có chênh lệch nên toast S318 (không chênh lệch: S208)."]),
    V("010", "DA_STCK_001", "未送信（オフライン）", "Chưa gửi (offline)", URL,
      pick("11"), setup="holdToast(); await click('オフラインにする',document); await tab(1); await minus(2, 1); document.querySelector('.foot .btn.pri').click(); await sleep(1500);", login="DR00002", today="2026/10/06",
      note=["オフラインにして棚卸しを送信した。トースト W311「端末に保存しました（未送信）」。画面上部に「オフライン・未送信 1件」が出る（DA_HOME_001 007）。再送がサーバーに拒否されたときの理由と、1件ずつの破棄は DA_HOME_001 No.8（P-OFFLINE）のとおり（受付簿 #443）。", "Chuyển offline rồi gửi kiểm kê. Toast W311 「端末に保存しました（未送信）」. Trên đầu màn hình hiện 「オフライン・未送信 1件」 (DA_HOME_001 007). Lý do bị server từ chối khi gửi lại và việc hủy bỏ từng mục: theo DA_HOME_001 No.8 (P-OFFLINE) (受付簿 #443)."]),
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

_patch("4", "商品の検索", demo=['コードは入力のたびに絞る（Enter・検索キーを待たない）。台帳 M-1 は「検索／Enter を押してから絞る」。モバイルの即時絞り込みを例外にするかは hong に確認（役割レビュー Q10）。決まるまでは台帳どおりに書き、コードは宿題', 'Code lọc ngay mỗi lần gõ (không chờ Enter・phím tìm). 台帳 M-1: lọc sau khi bấm 「検索」/Enter. Có cho phép ngoại lệ lọc tức thời trên mobile không: hỏi hong (役割レビュー Q10). Khi chưa quyết thì viết theo 台帳, code là việc phải sửa'])
