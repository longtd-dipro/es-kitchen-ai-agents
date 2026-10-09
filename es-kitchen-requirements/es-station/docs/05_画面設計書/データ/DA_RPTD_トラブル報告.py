# -*- coding: utf-8 -*-
"""
ドライバーアプリ トラブル報告（DA_RPTD）の画面設計書データ。
元：本物の Web（app/driver/trouble/page.tsx・app/driver/_ui/parts.tsx・lib/driver/{logic,area,seed}.ts）。
決定の正：docs/決定台帳.md（E 不足のトラブルは1件・M-4 配送中のトラブル報告／アプリの選択肢と運営の6区分・K 写真20枚・F Q02。R の 2026-10-08：#434 完了後のトラブル報告・#437 一覧は全件・#446 E04・#453 写真）、受付簿 No.290〜292・#434・#437・#446・#453。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-6・§3 宿題 H1・H2・H13・H17・Q-DW09）。報告は運営宛てで状態は変えない。法人へは通知しない。
撮影：スマホ幅 390×844。今日 2026/10/06・高橋 誠（DR00002）。
"""

TITLE = ["トラブル報告（DA_RPTD）", "Báo sự cố (DA_RPTD)"]
SHEET = ["トラブル報告", "Báo sự cố"]
BASENAME = "画面設計書_DA_RPTD_トラブル報告"
IMG_PREFIX = "DA_RPTD"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_RPTD_001（対象選択）・002（内容入力）", "Screen Code theo 台帳 F (2026-10-07): DA_RPTD_001 (chọn đối tượng)・002 (nhập nội dung)"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00002"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-08", "target": "DA_RPTD_002 No.4〜8（種類の読み替え）", "q": ["「商品不足・誤配送」を運営へどの種類で渡すか・報告のあとの配送の扱い", "Gửi 「商品不足・誤配送」 cho vận hành với loại nào・xử lý đơn giao sau báo cáo"],
     "a": ["「商品不足・誤配送」は運営の「種別未定」（独自の値）で入り、運営が解決のときに区分を付ける。誤配送・不在・破損の報告は運営側で子の配送が自動で作られる（1段・枝番は最大9）。部分解決は残りの数で子の配送を作る。ドライバーアプリの選択肢・画面は変えない（運営の処理）", "「商品不足・誤配送」 vào vận hành với giá trị riêng 「種別未定」, vận hành gán phân loại khi giải quyết. Báo cáo 誤配送・不在・破損 thì phía vận hành tự tạo đơn giao con (1 tầng・hậu tố tối đa 9). Giải quyết một phần thì tạo đơn con theo số còn lại. Lựa chọn・màn hình app tài xế không đổi (xử lý ở vận hành)"],
     "src": "台帳「アプリの選択肢と運営の6区分」（種別未定）／コード lib/driver/logic.ts TYPE_OF・運営側の処理（子の配送の自動作成は台帳に行が見当たらない：要確認）"},
    {"date": "2026-10-07", "target": "DA_RPTD 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。トラブル報告＝DA_RPTD_001・002", "DA. Báo sự cố = DA_RPTD_001・002"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-09-30", "target": "DA_RPTD_002 No.4〜8", "q": ["トラブル報告の種類と運営への届き方", "Các loại sự cố và cách gửi đến vận hành"],
     "a": ["選択肢は固定（受取：箱数不足／誤配送／荷物破損／その他、配達：商品不足・誤配送／交通渋滞・事故／不在・連絡不可／その他）。運営の6区分へは固定表で読み替える。報告は運営宛てで、ドライバーは報告まで（取消・再配送は運営）。法人へは通知しない。不足のトラブルは1件にまとめる", "Lựa chọn cố định (nhận: 箱数不足/誤配送/荷物破損/その他; giao: 商品不足・誤配送/交通渋滞・事故/不在・連絡不可/その他). Đổi sang 6 phân loại của vận hành bằng bảng cố định. Báo cho vận hành, tài xế chỉ báo (hủy・giao lại do vận hành). Không thông báo cho pháp nhân. Sự cố thiếu hàng gộp thành 1 mục"],
     "src": "台帳 M-4・E（確認メモ_DW §6 で一致済み）"},
    {"date": "2026-10-07", "target": "DA_RPTD_002 No.9", "q": ["写真の枚数・形式・容量", "Số lượng・định dạng・dung lượng ảnh"],
     "a": ["最低は不要・最大20枚（トラブル報告も同じ）、JPG／PNG／HEIC・1枚5MB（アプリで縮小）。運営の配送詳細で見られ、12ヶ月保存", "Không bắt buộc, tối đa 20 ảnh (sự cố cũng vậy), JPG/PNG/HEIC・5MB/ảnh (app thu nhỏ). Xem được ở chi tiết giao hàng của vận hành, lưu 12 tháng"],
     "src": "20枚は hong 2026-09-30（K-30）。形式・容量は hong 回答 2026-10-08（台帳 S・受付簿 #453・確認表 H-21）"},
    {"date": "2026-10-08", "target": "DA_RPTD_001 No.5・DA_RPTD_002 No.1.2", "q": ["配送完了後にもトラブルを報告できるか", "Sau khi hoàn tất giao hàng có báo sự cố được không"],
     "a": ['完了から7日まで報告できる（完了後7日の修正と同じ期限）。対象の一覧には、今日の配送に加えて完了から7日以内の配送を出す。7日を過ぎたら ES へ電話 → 運営が代理登録（一覧には出さない）。報告のあと、運営は完了前と同じ流れで「要確認」に載せて解決し、必要なら配送を「配送できなかった」で閉じる（ドライバーは完了の操作をしない。運営Web 側は運営D の実装待ち：受付簿 No.302）', 'Báo được đến 7 ngày sau hoàn tất (cùng hạn với việc sửa sau hoàn tất). Danh sách đối tượng hiện thêm các đơn trong vòng 7 ngày sau hoàn tất ngoài đơn hôm nay. Quá 7 ngày thì gọi điện cho ES → vận hành đăng ký thay (không hiện trong danh sách). Sau báo cáo, vận hành đưa vào 「要確認」 theo cùng luồng như trước hoàn tất rồi giải quyết, nếu cần thì đóng đơn thành 「配送できなかった」 (tài xế không thao tác hoàn tất; phía Web vận hành chờ 運営D: 受付簿 No.302)'],
     "src": 'hong 回答 2026-10-08（台帳 S・受付簿 #459・確認表 H-20。#434 の「完了後も報告できる」を置き換え）。置き換えた旧決定：台帳 F「配送できなかったとき（ドライバー）」の「トラブル報告は完了の前だけ」（受付簿 No.302）'},
    {"date": "2026-10-08", "target": "DA_RPTD_001 No.4・5", "q": ["トラブル対象の一覧（1日分）のページ送り", "Phân trang danh sách đối tượng sự cố (1 ngày)"],
     "a": ["全件表示（ページ送りなし）。スマホ幅だけを書く", "Hiện toàn bộ (không phân trang). Chỉ viết cho chiều rộng điện thoại"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #437・確認表 H-24・H-27）"},
    {"date": "2026-10-08", "target": "DA_RPTD_002 No.10", "q": ["最大文字数を超えたときの動き（E04）", "Hành vi khi vượt số ký tự tối đa (E04)"],
     "a": ["入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す", "Chặn ở giới hạn của ô nhập (không gõ thêm được). Chỉ hiện E04 khi dán"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #446・確認表 X-5）"},
    {"date": "2026-10-07", "target": "DA_RPTD_002 No.10", "q": ["備考の最大文字数", "Số ký tự tối đa của ghi chú"],
     "a": ["500文字（備考・メモの共通基準）。コードは 1000", "500 ký tự (chuẩn chung ghi chú・memo). Code là 1000"], "src": "台帳 M-1・入力の共通基準（確認メモ_DW H2）"},
    {"date": "2026-10-07", "target": "DA_RPTD_001〜002 全体", "q": ["入力途中の離脱", "Rời đi khi đang nhập"],
     "a": ["入力を変えたあと戻る・移動・再読み込みで Q02 を出す（台帳 F 全サイト共通）", "Sau khi đã sửa mà quay lại・chuyển màn・tải lại thì hiện Q02 (台帳 F, chung mọi site)"], "src": "台帳 F（受付簿 No.89）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "DA_RPTD_001", "ja": "トラブル報告（対象選択）", "vi": "Báo sự cố (chọn đối tượng)"},
    {"code": "DA_RPTD_002", "ja": "トラブル報告（内容入力）", "vi": "Báo sự cố (nhập nội dung)"},
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
    "const opt=async(t)=>{const b=[...document.querySelectorAll('.opts button')].find(x=>x.textContent.includes(t));b.click();await sleep(400)};"
    "const inv1=async()=>{document.querySelector('.pk .inv.tap').click();await sleep(400)};"
)

SEL1 = "/driver/trouble"
PT = "/driver/trouble?target=pt%3AWH00001"
DL = "/driver/trouble?target=d%3ADL-261005-0001"


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
    A("1", "上の帯", "Thanh trên", ".topbar", "area", "view", ["左に戻るボタン、真ん中に画面名「トラブル報告」。右上のトラブルのボタンは出さない（この画面そのものが報告の画面）。", "Trái là nút quay lại, giữa là tên màn 「トラブル報告」. Không hiện nút báo sự cố ở góc phải (chính màn này là màn báo cáo)."]),
    A("1.1", "戻る", "Quay lại", ".topbar .rb.l", "button", "click", ["押すと前の画面へ戻る。", "Bấm để về màn trước."]),
    A("2", "検索", "Tìm kiếm", ".search input", "text", "input", ["倉庫名・拠点名・送り状番号の部分一致で、受取地点と配送のカードを絞る。「検索」キー（キーボード）／Enter を押してから絞る（台帳 M-1。入力のたびには絞らない）。0件のときは各欄に「該当なし」（I01）。", "Lọc thẻ điểm nhận và đơn giao theo khớp một phần tên kho・tên địa điểm・số phiếu gửi ; lọc sau khi bấm phím 「検索」 (bàn phím)/Enter (台帳 M-1; không lọc mỗi lần gõ). 0 dòng thì mỗi mục hiện 「該当なし」 (I01)."],
      req="－", len="文字列 60", ex=["DL-261005-0001", "Số phiếu gửi hoặc tên kho/địa điểm"], valid=["前後の空白を取る。60文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Bỏ khoảng trắng đầu/cuối. Tối đa 60 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["I01", "E04"],
      demo_ok=["コードの0件の文は「該当なし」。I01 に揃える（宿題）", "Câu 0 dòng trong code là 「該当なし」. Thống nhất theo I01 (việc phải sửa)"]),
    A("3", "説明", "Hướng dẫn", ".hint.muted", "label", "view", ["「※影響を受けた受取地点または納品先を選択してください。※複数の拠点でトラブルが発生している場合は、拠点ごとに登録してください。※報告は運営（ESキッチン）に届きます。」。", "「※影響を受けた受取地点または納品先を選択してください。※複数の拠点でトラブルが発生している場合は、拠点ごとに登録してください。※報告は運営（ESキッチン）に届きます。」."]),
    A("4", "荷物受取（受取地点）", "Nhận hàng (điểm nhận)", ".h3::荷物受取", "label", "view", ["今日の受取地点（倉庫・中継先）のカード。選ぶと「荷物受取時のトラブル」の入力へ。並びは今日の分の順。1日分なので全件表示（ページ送りなし：hong 2026-10-08・受付簿 #437）。", "Thẻ điểm nhận (kho/trung chuyển) hôm nay. Chọn thì sang nhập 「荷物受取時のトラブル」. Thứ tự theo phần hôm nay. Là 1 ngày nên hiện toàn bộ (không phân trang: hong 2026-10-08, 受付簿 #437)."]),
    A("4.1", "受取地点のカード", "Thẻ điểm nhận", ".grid2 .card", "button", "click", ["受取地点の名前・状態・住所・コード・合計。押すと選択（右上の丸が青くなる）。もう一度別のカードを押すと選び直し。", "Tên điểm nhận・trạng thái・địa chỉ・mã・tổng. Bấm để chọn (vòng tròn góc phải thành xanh). Bấm thẻ khác để chọn lại."]),
    A("5", "配送（納品先）", "Giao hàng (nơi nhận)", ".h3::配送", "label", "view", ["今日の配送のカードと、完了から7日以内の配送のカード（完了後も7日まで報告できる：hong 2026-10-08・受付簿 #459）。並びは今日の配送のあとに、完了から7日以内の配送を完了日の新しい順で、日付を添える（受付簿 #473）。選ぶと「配達時のトラブル」の入力へ。7日を過ぎた配送は出さない（ES へ電話 → 運営が代理登録）。開いたままの画面から7日を過ぎた配送に送ったときは E452（受付簿 #474）。今日の分と完了後7日以内の分はどちらも全件表示（ページ送りなし：受付簿 #437）。報告のあと運営が「要確認」で解決し、必要なら配送を「配送できなかった」で閉じる。", "Thẻ đơn giao hôm nay và thẻ các đơn trong vòng 7 ngày sau hoàn tất (sau hoàn tất vẫn báo được đến 7 ngày: hong 2026-10-08, 受付簿 #459). Thứ tự: sau phần hôm nay là các đơn trong vòng 7 ngày sau hoàn tất, theo ngày hoàn tất mới nhất trước, kèm ngày (受付簿 #473). Chọn thì sang nhập 「配達時のトラブル」. Đơn quá 7 ngày không hiện (gọi điện cho ES → vận hành đăng ký thay). Nếu gửi từ màn đang mở cho đơn quá 7 ngày thì hiện E452 (受付簿 #474). Cả phần hôm nay và phần trong 7 ngày sau hoàn tất đều hiện toàn bộ (không phân trang: 受付簿 #437). Sau báo cáo, vận hành giải quyết ở 「要確認」, nếu cần thì đóng đơn thành 「配送できなかった」."], err=["E452"]),
    A("6", "戻る・次へ", "Quay lại・Tiếp", ".foot", "area", "view", ["左に「戻る」、右に「次へ」。対象を選ぶまで「次へ」は押せない。押すと内容入力（DA_RPTD_002）へ。", "Trái 「戻る」, phải 「次へ」. Chưa chọn đối tượng thì không bấm được 「次へ」. Bấm để sang nhập nội dung (DA_RPTD_002)."]),
])
R2 = reg([
    A("1", "上の帯", "Thanh trên", ".topbar", "area", "view", ["画面名「トラブル報告」。戻るボタン。", "Tên màn 「トラブル報告」. Nút quay lại."]),
    A("2", "種類の見出し", "Tiêu đề loại", ".kind", "label", "view", ["受取地点を選んだときは「荷物受取時のトラブル」、配送を選んだときは「配達時のトラブル」。", "Chọn điểm nhận thì 「荷物受取時のトラブル」, chọn đơn giao thì 「配達時のトラブル」."]),
    A("3", "対象の荷物", "Hàng đối tượng", ".pk", "area", "view", ["選んだ受取地点（または配送）の名前・箱／冷蔵／冷凍と、箱（送り状番号）の一覧。受取地点は納品先の名前の先頭も出す。", "Tên điểm nhận (hoặc đơn giao)・thùng/lạnh/đông và danh sách thùng (số phiếu gửi). Điểm nhận hiện thêm đầu tên nơi nhận."]),
    A("3.1", "すべて選ぶ", "Chọn tất cả", ".pk .hd .cb", "check", "check", ["見出しのチェックで全部の箱を選ぶ／外す。", "Check ở tiêu đề để chọn/bỏ tất cả thùng."], req="－", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
    A("3.2", "影響を受けた送り状番号", "Số phiếu gửi bị ảnh hưởng", ".pk .inv .cb", "check", "check", ["影響を受けた箱にチェック。箱数不足・誤配送・荷物破損・商品不足・誤配送のときは1つ以上必須（「（必須）」と出す）。行のどこを押してもよい。", "Check các thùng bị ảnh hưởng. Với 箱数不足・誤配送・荷物破損・商品不足・誤配送 bắt buộc từ 1 trở lên (hiện 「（必須）」). Bấm chỗ nào trên dòng cũng được."],
      req="条件付き", cond=["種類が箱数不足・誤配送・荷物破損・商品不足・誤配送のとき必須", "Bắt buộc khi loại là 箱数不足・誤配送・荷物破損・商品不足・誤配送"], init=["オフ", "Tắt"], ex=["オン", "Bật"], valid=["必須の種類で0件なら不可（E02）。", "Loại bắt buộc mà 0 mục thì không được (E02)."], err=["E02"],
      demo_ok=["コードは満たさないと「送信」を押せなくするだけでエラー文を出さない（H17）。決定は項目の下に E02 を出す（宿題）", "Code chỉ khóa nút 「送信」 khi chưa đủ, không hiện câu lỗi (H17). Quyết định: hiện E02 dưới mục (việc phải sửa)"]),
    A("4", "トラブル内容", "Nội dung sự cố", ".opts", "radio", "select", [
        "受取地点：箱数不足／誤配送／荷物破損／その他。配送：商品不足・誤配送／交通渋滞・事故／不在・連絡不可／その他。1つだけ選ぶ。運営の6区分へは固定表で読み替える（商品不足・誤配送は運営が区分を付ける）。配達で「交通渋滞・事故」を選んだ時点で、「ESへ電話する（tel: 050-5784-2777）」のボタンを出す（事故・渋滞のとき運転中でも1タップで電話できるようにする：役割レビュー #15）。",
        "Điểm nhận: 箱数不足/誤配送/荷物破損/その他. Đơn giao: 商品不足・誤配送/交通渋滞・事故/不在・連絡不可/その他. Chọn đúng 1. Đổi sang 6 phân loại của vận hành bằng bảng cố định (商品不足・誤配送 do vận hành gắn phân loại). Khi tài xế chọn 「交通渋滞・事故」 ở đơn giao thì hiện ngay nút 「ESへ電話する」 (tel: 050-5784-2777) để gọi bằng 1 chạm khi tai nạn・kẹt xe (役割レビュー #15)."],
      req="○", len="選択（4つ）" if False else ["選択（4つ）", "Chọn (4 lựa chọn)"], init=["未選択", "Chưa chọn"], ex=["箱数不足", "箱数不足 (thiếu thùng)"], valid=["必須。4つのどれか。", "Bắt buộc. Một trong 4 lựa chọn."], err=["E02"]),
    A("5", "画像", "Ảnh", ".drop", "file", "upload", [
        "状況の写真（任意）。端末のカメラかギャラリーから入れる。最大20枚・JPG／PNG／HEIC・1枚5MB（アプリで縮小）。×で消せる。運営の配送詳細で見られ、12ヶ月保存する。",
        "Ảnh tình huống (tùy chọn). Đưa vào từ camera hoặc thư viện. Tối đa 20 ảnh・JPG/PNG/HEIC・5MB/ảnh (app thu nhỏ). Xóa bằng ×. Xem được ở chi tiết giao hàng của vận hành, lưu 12 tháng."],
      req="－", len=["JPG・PNG・HEIC 1枚5MB 最大20枚", "JPG/PNG/HEIC, mỗi ảnh tối đa 5MB, tối đa 20 ảnh"], ex=["IMG_0456.jpg", "Ảnh chụp bằng điện thoại"], err=["E441"],
      demo_ok=["コードは最大6枚で、画像は枚数だけ数えて中身を保存しない（H1・H13）。「サンプル写真を追加」はデモ専用", "Code tối đa 6 ảnh và chỉ đếm số ảnh, không lưu nội dung (H1・H13). 「サンプル写真を追加」 chỉ dành cho demo"]),
    A("10", "備考", "Ghi chú", "textarea[aria-label=備考]", "textarea", "input", ["状況の説明。「その他」のときは必須（見出しに「（必須）」）。500文字まで。", "Mô tả tình huống. Bắt buộc khi chọn 「その他」 (tiêu đề có 「（必須）」). Tối đa 500 ký tự."],
      req="条件付き", cond=["種類が「その他」のとき必須", "Bắt buộc khi loại là 「その他」"], len="文字列 500", init=["空", "Trống"], ex=["受付が不在で渡せなかった", "Không có người ở quầy nên không giao được"],
      valid=["「その他」で空は不可（E01）。前後の空白を取る。500文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Chọn 「その他」 mà trống thì không được (E01). Bỏ khoảng trắng đầu/cuối. Tối đa 500 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["E01", "E04"],
      demo_ok=["コードの上限は 1000 文字（H2）。500 に直す。空のときはエラー文を出さず送信を押せなくするだけ（H17）", "Giới hạn trong code là 1000 ký tự (H2). Sửa thành 500. Khi trống không hiện câu lỗi mà chỉ khóa nút gửi (H17)"]),
    A("11", "戻る・送信", "Quay lại・Gửi", ".foot", "area", "view", ["左に「戻る」、右に「送信」。条件を満たすまで「送信」は押せない。押すと確認のモーダル（No.12）。同じ種類の未解決の報告があれば追記のモーダル（No.13）。", "Trái 「戻る」, phải 「送信」. Chưa đủ điều kiện thì không bấm được 「送信」. Bấm để hiện modal xác nhận (No.12). Nếu đã có báo cáo chưa giải quyết cùng loại thì modal bổ sung (No.13)."], err=["Q02"]),
    A("12", "送信の確認", "Xác nhận gửi", ".modal", "modal", "view", ["「この内容で報告を送信しますか？」。報告は運営（ESキッチン）に届き、取消・再配送などの対応は運営が行う。「報告する」「キャンセル」。二度押しで二重に送らない。", "「この内容で報告を送信しますか？」. Báo cáo gửi đến vận hành (ES Kitchen), việc hủy・giao lại do vận hành xử lý. 「報告する」「キャンセル」. Bấm 2 lần không gửi trùng."], err=["Q315", "S315", "W311"]),
    A("13", "報告済みへの追記", "Bổ sung vào báo cáo đã gửi", ".modal", "modal", "view", ["同じ対象・同じ種類の未解決の報告があるとき、「報告済みです。追記しますか？」。追記すると報告は増えず、既存のトラブルに内容を足して運営に送る（不足のトラブルは1件：台帳 E）。「追記して送信」「キャンセル」。", "Khi có báo cáo chưa giải quyết cùng đối tượng・cùng loại thì 「報告済みです。追記しますか？」. Bổ sung thì không tăng số báo cáo, thêm nội dung vào sự cố hiện có rồi gửi vận hành (sự cố thiếu hàng chỉ 1 mục: 台帳 E). 「追記して送信」「キャンセル」."], err=["Q316", "S316"]),
    A("14", "離脱の確認", "Xác nhận rời đi", ".modal", "modal", "view", ["種類・送り状番号・画像・備考のどれかを入れたあと、戻る・移動・再読み込みで「編集内容を破棄しますか？」（Q02）。「破棄」「キャンセル」。", "Sau khi đã nhập loại・số phiếu・ảnh・ghi chú, quay lại・chuyển màn・tải lại thì hiện 「編集内容を破棄しますか？」 (Q02). 「破棄」「キャンセル」."], err=["Q02"]),
    A("15", "送信後", "Sau khi gửi", ".toast", "toast", "view", ["送ったら入力を空にし、元の画面（受取・配送）から来たときはそこへ、下のタブから来たときはホームへ戻る。トースト S315（追記は S316、オフラインは W311）。", "Gửi xong xóa trống nội dung nhập, về màn gốc (nhận/giao) nếu đến từ đó, đến từ tab dưới thì về trang chủ. Toast S315 (bổ sung S316, offline W311)."], err=["S315", "S316", "W311"]),
])


def pick(R, *nos):
    return [R[n] for n in nos]


VIEWS = [
    V("001", "DA_RPTD_001", "初期（荷物受取・配送のカード）", "Ban đầu (thẻ nhận hàng・giao hàng)", SEL1,
      pick(R1, "1", "1.1", "2", "3", "4", "4.1", "5", "6"), login="DR00002", today="2026/10/06",
      note=["高橋 誠（DR00002）・今日 2026/10/06。受取地点1・配送1。", "Takahashi Makoto (DR00002), hôm nay 2026/10/06. 1 điểm nhận・1 đơn giao."]),
    V("002", "DA_RPTD_001", "検索で0件", "Tìm kiếm 0 kết quả", SEL1, pick(R1, "2", "4", "5"),
      setup="setv(document.querySelector('.search input'),'あああ'); await sleep(400);", login="DR00002", today="2026/10/06"),
    V("003", "DA_RPTD_001", "対象を選択（「次へ」が押せる）", "Đã chọn đối tượng (bấm được 「次へ」)", SEL1, pick(R1, "4.1", "6"),
      setup="document.querySelector('.grid2 .card').click(); await sleep(400);", login="DR00002", today="2026/10/06"),
    V("004", "DA_RPTD_002", "荷物受取時のトラブル（箱数不足／誤配送／荷物破損／その他）", "Sự cố khi nhận hàng (thiếu thùng/giao nhầm/hư hỏng/khác)", PT,
      pick(R2, "1", "2", "3", "3.1", "3.2", "4", "5", "10", "11"), login="DR00002", today="2026/10/06"),
    V("005", "DA_RPTD_002", "配達時のトラブル（商品不足・誤配送／交通渋滞・事故／不在・連絡不可／その他）", "Sự cố khi giao hàng (thiếu hàng・giao nhầm/kẹt xe・tai nạn/vắng mặt・không liên lạc được/khác)", DL,
      pick(R2, "2", "3", "4"), login="DR00002", today="2026/10/06"),
    V("006", "DA_RPTD_002", "送り状番号を選んでいない（必須の種類）", "Chưa chọn số phiếu gửi (loại bắt buộc)", PT,
      pick(R2, "3.2", "4", "11"), setup="await opt('箱数不足');", login="DR00002", today="2026/10/06",
      note=["「箱数不足」を選んだが箱を選んでいない。「送信」は押せない。決定は箱の下に E02 を出す。", "Đã chọn 「箱数不足」 nhưng chưa chọn thùng. Không bấm được 「送信」. Quyết định: hiện E02 dưới thùng."]),
    V("007", "DA_RPTD_002", "「その他」で備考が空（備考必須）", "Chọn 「その他」 mà ghi chú trống (bắt buộc ghi chú)", PT,
      pick(R2, "4", "10", "11"), setup="await opt('その他');", login="DR00002", today="2026/10/06"),
    V("008", "DA_RPTD_002", "画像を追加（枚数・削除）", "Thêm ảnh (số lượng・xóa)", PT, pick(R2, "5"),
      setup="await click('サンプル写真を追加'); await click('サンプル写真を追加');", login="DR00002", today="2026/10/06"),
    V("009", "DA_RPTD_002", "送信の確認モーダル", "Modal xác nhận gửi", PT, pick(R2, "12"),
      setup="await opt('箱数不足'); await inv1(); document.querySelector('.foot .btn.pri').click(); await sleep(500);", full=False, login="DR00002", today="2026/10/06"),
    V("010", "DA_RPTD_002", "報告済み・追記の確認モーダル", "Modal bổ sung vào báo cáo đã gửi", PT, pick(R2, "13"),
      setup=("await api('reportTrouble',{staff:staff(),target:'pt:WH00001',type:'箱数不足',nos:['DL-261005-0001-01'],note:'',photos:0,offline:false}); await sync();"
             "await opt('箱数不足'); await inv1(); document.querySelector('.foot .btn.pri').click(); await sleep(500);"),
      full=False, login="DR00002", today="2026/10/06",
      note=["同じ受取地点・同じ種類（箱数不足）の未解決の報告がすでにある。", "Đã có báo cáo chưa giải quyết cùng điểm nhận・cùng loại (箱数不足)."]),
    V("011", "DA_RPTD_002", "送信後（トースト・元の画面へ戻る）", "Sau khi gửi (toast・quay lại màn gốc)", DL, pick(R2, "15"),
      setup=("holdToast(); await opt('その他'); setv(document.querySelector('textarea[aria-label=備考]'),'受付が不在で渡せなかった'); await sleep(300);"
             "document.querySelector('.foot .btn.pri').click(); await sleep(500); await click('報告する', document.querySelector('.modal')); await sleep(1500);"),
      login="DR00002", today="2026/10/06"),
    V("012", "DA_RPTD_002", "離脱確認（Q02）", "Xác nhận rời đi (Q02)", PT, pick(R2, "14"),
      setup="setv(document.querySelector('textarea[aria-label=備考]'),'入力途中'); await sleep(300); document.querySelector('.foot .btn.sec').click(); await sleep(600);",
      full=False, login="DR00002", today="2026/10/06"),
    V("013", "DA_RPTD_002", "未送信（オフライン）", "Chưa gửi (offline)", PT, pick(R2, "15"),
      setup=("holdToast(); await click('オフラインにする',document); await opt('荷物破損'); await inv1();"
             "document.querySelector('.foot .btn.pri').click(); await sleep(500); await click('報告する', document.querySelector('.modal')); await sleep(1500);"),
      login="DR00014", today="2026/10/06",
      note=["オフラインのまま報告を送った。W311 のトースト。画面上部に「オフライン・未送信 1件」。再送がサーバーに拒否されたときの理由と、1件ずつの破棄は DA_HOME_001 No.8（P-OFFLINE）のとおり（受付簿 #443）。", "Gửi báo cáo khi vẫn offline. Toast W311. Trên đầu màn hình 「オフライン・未送信 1件」. Lý do bị server từ chối khi gửi lại và việc hủy bỏ từng mục: theo DA_HOME_001 No.8 (P-OFFLINE) (受付簿 #443)."]),
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

_patch("2", "検索", demo=['コードは入力のたびに絞る（Enter・検索キーを待たない）。台帳 M-1 は「検索／Enter を押してから絞る」。モバイルの即時絞り込みを例外にするかは hong に確認（役割レビュー Q10）。決まるまでは台帳どおりに書き、コードは宿題', 'Code lọc ngay mỗi lần gõ (không chờ Enter・phím tìm). 台帳 M-1: lọc sau khi bấm 「検索」/Enter. Có cho phép ngoại lệ lọc tức thời trên mobile không: hỏi hong (役割レビュー Q10). Khi chưa quyết thì viết theo 台帳, code là việc phải sửa'])
_patch("4", "トラブル内容", demo=["コードは「交通渋滞・事故」を選んでも電話の案内（ESへ電話する）を出さない（宿題：役割レビュー #15）", "Code không hiện hướng dẫn gọi ES khi chọn 「交通渋滞・事故」 (việc phải sửa; 役割レビュー #15)"])
_patch("5", "画像", demo=tapdemo("写真の×は約14pxで、確認も取り消し（元に戻す）もない", "Nút × của ảnh khoảng 14px, không có xác nhận hay hoàn tác"))
