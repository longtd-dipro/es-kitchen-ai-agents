# -*- coding: utf-8 -*-
"""
ドライバーアプリ ES配送便（DA_ESDL）の画面設計書データ。
元：本物の Web（app/driver/es/[id]/page.tsx・app/driver/_ui/{parts,EtaCard}.tsx・lib/driver/{logic,area,fromDomain}.ts）。
決定の正：docs/決定台帳.md（B 駐車報告・E ドライバーの動き・F 2026-10-07・K 写真20枚・L 在庫・M-4。R の 2026-10-08：#434 完了後のトラブル報告・#435 数量の単位・#436 資料・#438 入力の途中・#446 E04・#453 写真・#454 賞味期限の警告・#455 廃棄の入力元）、受付簿 No.290〜292・#434〜#438・#446・#453〜#455。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-2・§0・§3 宿題 H1〜H19・§4 open O6〜O8・回答）。コードが決定に追いついていないところは demo_ok に理由を書いた（コードは直さない）。
撮影：スマホ幅 390×844。今日 2026/10/13：委託ドライバー（DR00041）の大阪支店（集金あり）＋淀屋橋（納品日が翌日）、自社の DR00001（集金なし）。
画面：001 詳細（基本情報・駐車報告・陳列情報）／002 ① 陳列前／003 ② 在庫/廃棄／004 バーコードスキャン／005 ③ 陳列（検品）／006 ④ 陳列後／007 ⑤ 集金登録・完了。
"""

TITLE = ["ES配送便（DA_ESDL）", "ES配送便 (DA_ESDL)"]
SHEET = ["ES配送便", "ES配送便"]
BASENAME = "画面設計書_DA_ESDL_ES配送便"
IMG_PREFIX = "DA_ESDL"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_ESDL_<画面番号>。画面番号は機能の中の画面（状態ではない）。一覧（ES配送便）は配送一覧（DA_HOME_002）の便の種類での絞り込みで、専用の画面はない",
             "Screen Code theo 台帳 F (2026-10-07): DA_ESDL_<số màn>. Số màn là màn trong chức năng (không phải trạng thái). Danh sách ES配送便 là bộ lọc loại chuyến của 配送一覧 (DA_HOME_002), không có màn riêng"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00041"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_ESDL 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。ES配送便＝DA_ESDL_001〜007（詳細・①〜⑤・スキャン）", "DA. ES配送便 = DA_ESDL_001〜007 (chi tiết, ①〜⑤, quét mã)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_ESDL_001 No.13", "q": ["到着予定の共有（時間帯）を残すか", "Có giữ chia sẻ giờ đến dự kiến không"],
     "a": ["持たない。到着予定のカードは削除する（お届け日だけ。運営・法人へは出さない）", "Không giữ. Xóa thẻ giờ đến dự kiến (chỉ ngày giao; không hiển thị cho vận hành・pháp nhân)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW05・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-07", "target": "DA_ESDL_001 No.9", "q": ["駐車報告は ES配送便だけか、COOL便にも要るか", "Báo cáo đỗ xe chỉ cho ES配送便 hay cả COOL便"],
     "a": ["ES配送便・COOL便の両方。入れ方は台帳 B のまま（レシート画像＋駐車料金・両方必須・承認なし）", "Cả ES配送便 và COOL便. Cách nhập giữ như 台帳 B (ảnh hóa đơn + phí đỗ xe, bắt buộc cả hai, không duyệt)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW04・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-07", "target": "DA_ESDL_003 No.5〜9", "q": ["棚卸し（在庫）でドライバーに理論在庫を見せるか", "Có hiển thị tồn kho lý thuyết cho tài xế không"],
     "a": ["ドライバーには見せ、実在庫の初期値も理論在庫（廃棄後）にする（ステップを減らす）。法人Web には見せない", "Hiển thị cho tài xế, giá trị ban đầu của tồn thực cũng là tồn lý thuyết (sau hủy) để giảm bước. Không hiển thị ở Web pháp nhân"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW03・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-07", "target": "DA_ESDL_002・006 No.5", "q": ["写真の枚数・形式・容量", "Số lượng・định dạng・dung lượng ảnh"],
     "a": ["最低1枚・最大20枚（陳列前・陳列後・トラブル）。形式 JPG／PNG／HEIC、1枚 5MB（スマホの写真は大きいのでアプリで縮小して送る）", "Tối thiểu 1, tối đa 20 ảnh (trước/sau trưng bày, sự cố). Định dạng JPG/PNG/HEIC, mỗi ảnh 5MB (ảnh điện thoại lớn nên app thu nhỏ rồi gửi)"],
     "src": "枚数は hong 回答 2026-09-30（K-30）。形式・容量は hong 回答 2026-10-08（台帳 S・受付簿 #453・確認表 H-21）"},
    {"date": "2026-10-07", "target": "DA_ESDL_001 No.7", "q": ["「資料（委託業者向け）」を自社ドライバーにも見せるか", "Có hiển thị 「資料（委託業者向け）」 cho tài xế nội bộ không"],
     "a": ["自社ドライバーにも見せる（見ないと配送先に着けないため）。欄の名前「資料（委託業者向け）」はそのまま", "Hiển thị cả cho tài xế nội bộ (nếu không xem thì không đến được nơi giao). Tên mục 「資料（委託業者向け）」 giữ nguyên"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #436・確認表 H-23）"},
    {"date": "2026-10-08", "target": "DA_ESDL_001 No.1.2", "q": ["配送を完了したあとでもトラブルを報告できるか", "Sau khi hoàn tất giao hàng có báo sự cố được không"],
     "a": ['完了から7日まで報告できる（完了後7日の修正と同じ期限）。7日を過ぎたら ES へ電話 → 運営が代理登録。完了後の報告も完了前と同じ流れで運営の「要確認」に載る（配送の状態は変えない。運営が解決し、必要なら「配送できなかった」で閉じる）。運営Web 側の画面は運営D の実装待ち：受付簿 No.302。ドライバーは完了の操作をしない', 'Báo được đến 7 ngày sau hoàn tất (cùng hạn với việc sửa sau hoàn tất). Quá 7 ngày thì gọi điện cho ES → vận hành đăng ký thay. Báo sau hoàn tất cũng vào 「要確認」 của vận hành theo cùng luồng như trước hoàn tất (không đổi trạng thái đơn; vận hành giải quyết, nếu cần thì đóng thành 「配送できなかった」). Màn phía Web vận hành chờ 運営D triển khai: 受付簿 No.302. Tài xế không thao tác hoàn tất'],
     "src": 'hong 回答 2026-10-08（台帳 S・受付簿 #459・確認表 H-20。#434 の「完了後も報告できる」を置き換え）。置き換えた旧決定：台帳 F「配送できなかったとき（ドライバー）」の「トラブル報告は完了の前だけ」（受付簿 No.302）'},
    {"date": "2026-10-08", "target": "DA_ESDL_003 No.9.5", "q": ["廃棄の理由を選ぶ欄をステップ②に置くか・選択肢", "Có đặt ô chọn lý do hủy ở bước ② không・các lựa chọn"],
     "a": ["置く（任意・商品ごとではなく廃棄の入力全体で1つ：#472）。選択肢は減らして「賞味期限切れ／破損・品質不良／その他」の3つ（以前の廃棄登録の「破損」「品質不良」は1つにまとめ、「代替品の回収〈不良品〉」は選ばせず No.9.3 の表示に残す）", "Có (không bắt buộc, chọn 1 cho toàn bộ phần nhập hủy, không theo từng sản phẩm: #472). Giảm lựa chọn còn 3: 「賞味期限切れ／破損・品質不良／その他」 (gộp 「破損」 và 「品質不良」 của đăng ký hủy trước đây; 「代替品の回収〈不良品〉」 không cho chọn mà giữ phần hiển thị ở No.9.3)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #461・#472・確認表 X-4。選択肢の3つは設計の案で hong が採用済み）"},
    {"date": "2026-10-08", "target": "DA_ESDL_003 No.7.1", "q": ["賞味期限の判定（同じ商品に期限の違う在庫が混ざるとき）と警告の扱い", "Cách xác định hạn dùng (cùng sản phẩm có tồn kho nhiều hạn khác nhau) và cách xử lý cảnh báo"],
     "a": ["同じ商品の中でいちばん近い期限で判定する。警告は「確認」（チェック）を止めない", "Xác định theo hạn gần nhất trong cùng một sản phẩm. Cảnh báo không chặn việc 「確認」 (check)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #462 ③・確認表 X-1）"},
    {"date": "2026-10-07", "target": "DA_ESDL_001 No.8.1", "q": ["荷物情報の数量の単位", "Đơn vị số lượng ở thông tin hàng hóa"],
     "a": ["箱 n・冷蔵 n個・冷凍 n個（「食」「品」は使わない。コードの「品」は直す）", "箱 n・冷蔵 n個・冷凍 n個 (không dùng 「食」「品」; sửa 「品」 trong code)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #435・確認表 H-22）"},
    {"date": "2026-10-07", "target": "DA_ESDL_003 No.5〜10・DA_ESDL_005", "q": ["ES配送便の途中入力（保存前）を再読み込み・離脱でどうするか", "Dữ liệu đang nhập dở (chưa lưu) của ES配送便 xử lý thế nào khi tải lại・rời đi"],
     "a": ["端末に保持し、離脱の確認（Q02）は出さない（未送信と同じ仕組み＝端末のブラウザ。共通パターン P-OFFLINE と同じ）。台帳 M-1「下書きは残さない」の例外。コードはメモリだけで再読み込みで消える", "Giữ trên thiết bị, không hiện xác nhận rời đi (Q02) (cùng cơ chế với mục chưa gửi = trình duyệt của thiết bị; giống mẫu chung P-OFFLINE). Là ngoại lệ của 台帳 M-1 「下書きは残さない」. Code chỉ giữ trong bộ nhớ, tải lại là mất"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #438・確認表 H-26）"},
    {"date": "2026-10-08", "target": "DA_ESDL_003 No.7・7.1", "q": ["賞味期限が次回納品日より前に切れる商品を自動で警告するか", "Có tự động cảnh báo sản phẩm có hạn dùng hết trước ngày giao kế tiếp không"],
     "a": ["自動で警告する。賞味期限は仕入先が本発注の承認で入力した値と在庫から出す（DA に入力欄は足さない）。毎月メニューに載る商品は対象から外し、それ以外は計算して警告する。警告は商品ごとに、ステップ②で出す", "Tự động cảnh báo. Hạn dùng lấy từ giá trị nhà cung cấp nhập khi duyệt đặt hàng chính thức và từ tồn kho (không thêm ô nhập vào DA). Sản phẩm có trong menu hằng tháng thì loại khỏi đối tượng, còn lại thì tính và cảnh báo. Cảnh báo theo từng sản phẩm, hiện ở bước ②"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #454・確認表 H-25）。置き換えた旧決定：台帳 B「賞味期限を追跡しない」・台帳 F「次回納品日」の「自動で警告するかは要確認」"},
    {"date": "2026-10-08", "target": "DA_ESDL_003 No.9.3", "q": ["廃棄の入力元（ES配送便②と廃棄登録の2か所）", "Nguồn nhập hủy (2 nơi: bước ② của ES配送便 và đăng ký hủy)"],
     "a": ["廃棄の入力は ES配送便のステップ②だけ。棚卸しの画面（DA_STCK_001）から廃棄の登録をなくす", "Nhập hủy chỉ ở bước ② của ES配送便. Bỏ đăng ký hủy khỏi màn 棚卸し (DA_STCK_001)"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #455・確認表 X-4）"},
    {"date": "2026-10-08", "target": "DA_ESDL_001 No.12.1", "q": ["最大文字数を超えたときの動き（E04）", "Hành vi khi vượt số ký tự tối đa (E04)"],
     "a": ["入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す", "Chặn ở giới hạn của ô nhập (không gõ thêm được). Chỉ hiện E04 khi dán"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #446・確認表 X-5）"},
    {"date": "2026-10-07", "target": "緊急連絡先の番号", "q": ['緊急連絡先の番号は 050-5784-2777 と 050-3784-2771 のどちらか', 'Số liên hệ khẩn cấp là 050-5784-2777 hay 050-3784-2771'], "a": ['050-5784-2777 に統一する（設備不具合の報告先も同じ番号。050-3784-2771 は使わない）。コードの ES_TEL は宿題', 'Thống nhất 050-5784-2777 (số báo sự cố thiết bị cũng dùng số này; không dùng 050-3784-2771). ES_TEL trong code là việc phải sửa'], "src": "hong 回答 2026-10-07（確認メモ O1・B-13）"},
    {"date": "2026-10-07", "target": "資料（委託業者向け）の開き方", "q": ['資料をどう見るか', 'Xem tài liệu như thế nào'], "a": ['ドライバーはその場で見ることも、ファイルをダウンロードして端末に保存することもできる', 'Tài xế có thể xem trực tiếp hoặc tải file về lưu trên thiết bị'], "src": "hong 回答 2026-10-07（確認メモ O8・B-14）"},
    {"date": "2026-10-07", "target": "完了後の修正の同時編集", "q": ['運営が完了後の実績を直していて、ドライバーが同時に修正したとき', 'Khi vận hành đang sửa kết quả sau hoàn tất và tài xế sửa cùng lúc'], "a": ['全サイト共通の E31（他のユーザーにより更新されている。警告・上書きできる）を使う。ドライバー専用の決まりは作らない', 'Dùng E31 chung toàn site (đã bị người khác cập nhật; cảnh báo, ghi đè được). Không tạo quy tắc riêng cho tài xế'], "src": "hong 回答 2026-10-07（確認メモ O6・B-15）"},
    {"date": "2026-10-07", "target": "完了後の修正の期限", "q": ['COOL便・トラブル報告・駐車報告の完了後の修正期限', 'Hạn sửa sau hoàn tất của COOL便・báo sự cố・báo cáo đỗ xe'], "a": ['ES配送便と同じ：完了から7日まで', 'Giống ES配送便: đến 7 ngày sau hoàn tất'], "src": "hong 回答 2026-10-07（確認メモ H8・H9・B-16）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "DA_ESDL_001", "ja": "ES配送便 詳細", "vi": "Chi tiết ES配送便"},
    {"code": "DA_ESDL_002", "ja": "① 陳列前", "vi": "① Trước trưng bày"},
    {"code": "DA_ESDL_003", "ja": "② 在庫/廃棄", "vi": "② Tồn kho/hủy"},
    {"code": "DA_ESDL_004", "ja": "バーコードスキャン", "vi": "Quét mã vạch"},
    {"code": "DA_ESDL_005", "ja": "③ 陳列（検品）", "vi": "③ Trưng bày (kiểm hàng)"},
    {"code": "DA_ESDL_006", "ja": "④ 陳列後", "vi": "④ Sau trưng bày"},
    {"code": "DA_ESDL_007", "ja": "⑤ 集金登録・完了", "vi": "⑤ Đăng ký thu tiền・hoàn tất"},
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
    "const until=async(fn,ms)=>{const t=Date.now();while(Date.now()-t<(ms||10000)){try{if(await fn())return true}catch(e){}await sleep(300)}return false};"
    "const recvAll=async(pt,skip)=>{await until(async()=>(await api('day',{staff:staff()})).points.some(x=>x.id===pt));const d=await api('day',{staff:staff()});const recv={};d.dels.filter(x=>x.pt===pt).forEach(x=>x.inv.forEach((i,k)=>{if(!(skip&&k>=skip))recv[x.no+'|'+i.no]=true}));return api('receive',{staff:staff(),pt,recv,ack:!!skip,offline:false})};"
    "const finishEs=async(no,o)=>{o=o||{};await until(async()=>{await api('flow',{staff:staff(),no});return true});const f=await api('flow',{staff:staff(),no});f.before=['/driver/photo.jpg'];f.stock.forEach(r=>r.ck=true);f.stockDone=true;f.stockAt='10-13（火） 9:30';"
    "f.disp.forEach(r=>{r.ck=true});if(o.early)f.early=o.early;const r1=await api('finishDisp',{staff:staff(),no,flow:f,ack:false,offline:false});const g=r1.flow;g.after=['/driver/photo2.jpg'];"
    "if(g.plan>0)g.cash=String(g.plan);g.before=f.before;g.stockDone=true;g.stockAt=f.stockAt;if(o.early)g.early=o.early;return api('completeEs',{staff:staff(),no,flow:g,offline:!!o.offline})};"
)

D1 = "-261012-0011"
ES = "/driver/es/DL-261012-0011"
ES2 = "/driver/es/DL-261013-0002"


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


def part(items, *nos):
    """番号つきの項目の一覧（registry）から必要な番号を取り出す（同じ画面の項目は、状態が違っても同じ番号・同じ文章）"""
    return [items[n] for n in nos]


def reg(lst):
    return {i["no"]: i for i in lst}


# ---------------------------------------------------------------- 共通：上の帯・納品先の札・ステップ
def top(title_ja, title_vi, trouble=True):
    r = [
        A("1", "上の帯", "Thanh trên", ".topbar", "area", "view", [
            "画面の上。左に戻るボタン、真ん中に画面名（「" + title_ja + "」）、右に「この配送のトラブルを報告」のボタン（サイレンの絵）。",
            "Phía trên màn hình. Trái là nút quay lại, giữa là tên màn hình (「" + title_ja + "」), phải là nút 「この配送のトラブルを報告」 (hình còi báo)."]),
        A("1.1", "戻る", "Quay lại", ".topbar .rb.l", "button", "click", [
            "押すと前の画面へ戻る（履歴がなければホーム）。入力中でも戻れる（ES配送便の入力は端末に保持するので離脱の確認は出さない：P-OFFLINE と同じ仕組み・受付簿 #438）。",
            "Bấm để về màn trước (không có lịch sử thì về trang chủ). Đang nhập vẫn quay lại được (dữ liệu nhập của ES配送便 được giữ trên thiết bị nên không hiện xác nhận rời đi: cùng cơ chế P-OFFLINE, 受付簿 #438)."]),
    ]
    if trouble:
        r.append(A("1.2", "トラブルを報告", "Báo sự cố", ".topbar .rb.r", "button", "click", [
            "押すとこの配送のトラブル報告の内容入力（DA_RPTD_002）へ。送ったら元の画面へ戻る。配送を完了したあとも、完了から7日まで報告できる（完了後7日の修正と同じ期限：hong 2026-10-08・受付簿 #459）。7日を過ぎた配送ではこのボタンを出さず、ES へ電話する（資料の欄の「ご不明な点」の電話）→ 運営が代理登録する。完了後の報告も完了前と同じ流れ：配送の状態は変えず、トラブル報告を記録して運営の「要確認」に載せ、運営が解決する（必要なら「配送できなかった」で閉じる：台帳 F 2026-10-08。運営Web 側は運営D）。トラブルの報告がある配送は、完了後に修正できなくなる（E440：台帳 E）。アプリを開いたまま、完了から7日を過ぎた配送に報告を送ったときは、トースト E452「完了から7日を過ぎたため報告できません。ESへお電話ください。」を出す（受付簿 #474）。トラブルがあっても、修正できなくなるのは「トラブルに関わる部分だけ」で、ほかの部分は直せる。止めるのは運営がトラブルの解決を登録してから（報告しただけでは止めない：台帳 F・R、受付簿 #471）。",
            "Bấm để sang nhập nội dung báo sự cố của đơn này (DA_RPTD_002). Gửi xong quay lại màn trước. Sau khi hoàn tất giao hàng vẫn báo được đến 7 ngày sau hoàn tất (cùng hạn với việc sửa sau hoàn tất: hong 2026-10-08, 受付簿 #459). Quá 7 ngày thì không hiện nút này mà gọi điện cho ES (số điện thoại ở mục 「ご不明な点」) → vận hành đăng ký thay. Báo sau hoàn tất cũng theo cùng luồng như trước hoàn tất: không đổi trạng thái đơn, ghi báo cáo và đưa vào 「要確認」 của vận hành, vận hành giải quyết (nếu cần thì đóng thành 「配送できなかった」: 台帳 F 2026-10-08; phía Web vận hành thuộc 運営D). Đơn đã có báo sự cố thì không sửa được sau hoàn tất (E440: 台帳 E). Nếu mở sẵn app và gửi báo cáo cho đơn đã quá 7 ngày sau hoàn tất thì hiện toast E452 「完了から7日を過ぎたため報告できません。ESへお電話ください。」 (受付簿 #474). Khi có sự cố, chỉ phần liên quan đến sự cố là không sửa được; các phần khác vẫn sửa được. Chỉ khóa sau khi vận hành đăng ký giải quyết sự cố (chỉ báo thì chưa khóa: 台帳 F・R, 受付簿 #471)."],
            err=["E452", "E440"]))
    return r


DCARD = A("2", "納品先の札", "Thẻ nơi nhận", ".dcard", "area", "view", [
    "納品先の名前・配送No・日付（今日）・状態のバッジ。ES配送便は青の札。バッジは未配送／配送完了、未解決のトラブルがあれば「トラブルあり」、オフラインで送れていなければ「未送信」。",
    "Tên nơi nhận, 配送No, ngày (hôm nay), badge trạng thái. ES配送便 dùng thẻ xanh. Badge: 未配送/配送完了; có sự cố chưa giải quyết thì 「トラブルあり」; chưa gửi do offline thì 「未送信」."])
STEPS = A("3", "ステップの帯", "Thanh các bước", ".steps", "area", "view", [
    "5つのステップ：① 陳列前 ② 在庫/廃棄 ③ 陳列 ④ 陳列後 ⑤ 集金登録（集金がない納品先は「完了」）。済んだステップは緑のチェック、いまのステップは青。完了後の修正中は全部済みにする。",
    "5 bước: ① 陳列前 ② 在庫/廃棄 ③ 陳列 ④ 陳列後 ⑤ 集金登録 (nơi nhận không có thu tiền thì 「完了」). Bước đã xong có dấu check xanh, bước hiện tại màu xanh dương. Khi đang sửa sau hoàn tất thì tất cả coi như đã xong."])
EDITNOTE = A("3.1", "完了後の修正中の注記", "Ghi chú đang sửa sau hoàn tất", ".note2", "label", "view", [
    "「完了後の修正中です（{日付} まで）。」。完了から7日まで修正できる（台帳 E）。7日を過ぎたら E439、トラブルに関わる部分は E440（ほかの部分は直せる：受付簿 #471）。",
    "「完了後の修正中です（đến {ngày}）。」. Sửa được đến 7 ngày sau khi hoàn tất (台帳 E). Quá 7 ngày: E439; phần liên quan đến sự cố: E440 (phần khác vẫn sửa được: 受付簿 #471)."], err=["E439", "E440"])


def foot2(no, back_ja="戻る", next_ja="続ける", sel_next=".foot .btn.pri", note_ja=""):
    return A(no, "下のボタン", "Nút dưới", ".foot", "area", "view", [
        "画面の下に固定。左に「" + back_ja + "」、右に「" + next_ja + "」。" + note_ja + "完了後の修正中は「キャンセル」「修正を保存」に変わる（保存は S319）。",
        "Cố định ở cuối màn hình. Trái 「" + back_ja + "」, phải 「" + next_ja + "」. Khi đang sửa sau hoàn tất đổi thành 「キャンセル」「修正を保存」 (lưu: S319)."], err=["S319"])


PHOTO_RULE = ["最低1枚（0枚だと「続ける」を押せない）・最大20枚。形式は JPG／PNG／HEIC（PDF は不可）、1枚 5MB まで（超える写真はアプリで縮小して送る）。守れないときは E441。位置情報は取得しない（hong 2026-10-08・受付簿 #453）。",
              "Tối thiểu 1 ảnh (0 ảnh thì không bấm được 「続ける」), tối đa 20 ảnh. Định dạng JPG/PNG/HEIC (không nhận PDF), mỗi ảnh tối đa 5MB (ảnh lớn hơn được app thu nhỏ rồi gửi). Vi phạm thì E441. Không lấy vị trí (hong 2026-10-08, 受付簿 #453)."]
PHOTO_DEMO = ["コードは最大6枚・形式（accept）だけで容量の確認がない（H1。宿題）。決定は最大20枚・JPG／PNG／HEIC・1枚5MB（超える写真はアプリで縮小：受付簿 #453）。「サンプル写真を追加」はデモの帯のときだけの部品で、本番にはない",
              "Code tối đa 6 ảnh, chỉ giới hạn định dạng (accept), không kiểm tra dung lượng (H1; việc phải sửa). Quyết định: tối đa 20 ảnh・JPG/PNG/HEIC・5MB/ảnh (ảnh vượt thì app thu nhỏ: 受付簿 #453). 「サンプル写真を追加」 chỉ là bộ phận dành cho dải demo, bản chính thức không có"]


def drop_items(prefix, with_photo):
    r = [
        A(prefix, "写真の追加", "Thêm ảnh", ".drop", "area", "view", [
            "写真を入れる枠。写真がなければ「写真はまだありません」の絵、あれば縮小した写真（サムネイル）を並べる。", "Khung đưa ảnh vào. Chưa có ảnh thì hiện hình 「写真はまだありません」, có ảnh thì xếp ảnh thu nhỏ (thumbnail)."],
          err=["E441"]),
    ]
    if with_photo:
        r.append(A(prefix + ".1", "写真の削除", "Xóa ảnh", ".drop .thumbs button", "button", "click", ["写真の右上の×で1枚ずつ消す。確認は出さない。", "Dấu × ở góc phải trên ảnh để xóa từng ảnh. Không hiện xác nhận."]))
    r += [
        A(prefix + ".2", "ファイル選択", "Chọn tệp", ".drop label.btn", "file", "upload", [
            "端末のカメラ（撮影）かギャラリー（選択）から写真を入れる。複数枚をまとめて選べる。" + PHOTO_RULE[0], "Đưa ảnh vào từ camera (chụp) hoặc thư viện (chọn) của thiết bị. Chọn được nhiều ảnh cùng lúc. " + PHOTO_RULE[1]],
          req="○", len=["JPG・PNG・HEIC 1枚5MB 最大20枚", "JPG/PNG/HEIC, mỗi ảnh tối đa 5MB, tối đa 20 ảnh"], ex=["IMG_0123.jpg", "Ảnh chụp bằng điện thoại (ví dụ IMG_0123.jpg)"], demo_ok=PHOTO_DEMO, err=["E441"]),
        A(prefix + ".3", "サンプル写真を追加", "Thêm ảnh mẫu", ".drop .samp", "button", "click", ["デモの帯のときだけ出す（サンプル写真を足す）。本番の画面にはない。", "Chỉ hiện khi có dải demo (thêm ảnh mẫu). Màn hình chính thức không có."],
          demo_ok=["デモ専用の部品。設計書の対象外（開発は作らない）", "Bộ phận chỉ dành cho demo. Ngoài phạm vi thiết kế (dev không làm)"]),
    ]
    return r


HELP = A("6", "ご不明な点の案内", "Hướng dẫn khi cần hỏi", ".hint::ご不明な点", "label", "view", [
    "「※ご不明な点は弊社代表番号で、緊急連絡先の「{番号}」までお願いします。」。番号は 050-5784-2777 に統一する（設備不具合の報告先も同じ番号。050-3784-2771 は使わない：hong 2026-10-07）。番号は電話リンク（tel:）にして、押すとそのまま発信できる。数字の途中では改行しない（事故・渋滞のとき運転中でも1タップで電話できるようにする：役割レビュー #15）。",
    "「※ご不明な点は弊社代表番号で、緊急連絡先の「{số}」までお願いします。」. Thống nhất dùng số 050-5784-2777 (số báo sự cố thiết bị cũng dùng số này; không dùng 050-3784-2771; hong 2026-10-07). Số là liên kết điện thoại (tel:), bấm để gọi ngay; không xuống dòng giữa dãy số (khi tai nạn・kẹt xe gọi được bằng 1 chạm: 役割レビュー #15)."])

# ---------------------------------------------------------------- DA_ESDL_001 詳細
R1 = reg(
    top("ES配送便", "ES配送便") + [DCARD] + [
        A("3", "完了のバナー", "Banner hoàn tất", ".banner", "area", "view", [
            "完了したあと上に出す緑の帯「荷物の配送は完了しました。」と完了時刻。オフラインで完了したときは黄色で「端末に保存しました（未送信）。電波が戻ると送ります」（W311・オンラインに戻ると送って緑にする）。",
            "Dải xanh phía trên sau khi hoàn tất 「荷物の配送は完了しました。」 kèm giờ hoàn tất. Khi hoàn tất lúc offline thì màu vàng 「端末に保存しました（未送信）。電波が戻ると送ります」 (W311; có mạng lại thì gửi và chuyển xanh)."], err=["W311"]),
        A("4", "トラブル報告済みの枠", "Khung sự cố đã báo", ".trbox", "area", "view", [
            "この配送に報告したトラブル（時刻・種類・備考）。未解決は「トラブル報告済み（運営の確認待ち）」の赤い枠、運営が解決を記録すると「トラブル報告（解決済）」の緑の枠になる。自動で報告したもの（箱数不足・検品の差異）は「（自動）」を付ける。",
            "Các sự cố đã báo cho đơn này (giờ, loại, ghi chú). Chưa giải quyết: khung đỏ 「トラブル報告済み（運営の確認待ち）」; khi vận hành ghi nhận giải quyết thì thành khung xanh 「トラブル報告（解決済）」. Mục tự động báo (thiếu thùng・chênh lệch kiểm hàng) có gắn 「（自動）」."]),
        A("5", "タブ", "Tab", ".segs", "tab", "click", [
            "基本情報／駐車報告／陳列情報の3つ。タブは URL（?tab=）に持ち、再読み込みしても同じタブを開く。「陳列情報」は完了してから押せる。",
            "3 tab: 基本情報/駐車報告/陳列情報. Tab giữ trong URL (?tab=), tải lại vẫn mở đúng tab. 「陳列情報」 bấm được sau khi hoàn tất."]),
        A("5.1", "基本情報", "Thông tin cơ bản", ".segs button::基本情報", "tab", "click", ["納品先情報・資料・荷物情報を出す（初期）。", "Hiển thị thông tin nơi nhận・tài liệu・thông tin hàng (mặc định)."]),
        A("5.2", "駐車報告", "Báo cáo đỗ xe", ".segs button::駐車報告", "tab", "click", ["駐車場代のレシートと料金を入れる（ES配送便・COOL便の両方：台帳 F 2026-10-07）。", "Nhập hóa đơn và phí đỗ xe (cả ES配送便 và COOL便: 台帳 F 2026-10-07)."]),
        A("5.3", "陳列情報", "Thông tin trưng bày", ".segs button::陳列情報", "tab", "click", ["完了後に、5ステップで入れた内容（写真・在庫・陳列・集金）を見る・修正する。", "Sau khi hoàn tất, xem・sửa nội dung đã nhập ở 5 bước (ảnh・tồn kho・trưng bày・thu tiền)."]),
        A("6", "納品先情報", "Thông tin nơi nhận", ".info::郵便番号", "area", "view", [
            "納品先の名前・郵便番号・住所・担当者・電話番号・受取時間帯（複数あればすべて）・納品条件・納品備考。値は共通データ（拠点・配送）から出す。",
            "Tên nơi nhận, mã bưu chính, địa chỉ, người phụ trách, số điện thoại, khung giờ nhận (hiện tất cả nếu có nhiều), điều kiện giao, ghi chú giao hàng. Giá trị lấy từ dữ liệu chung (địa điểm・giao hàng)."]),
        A("6.1", "納品先・郵便番号", "Nơi nhận・mã bưu chính", ".info .r::納品先:", "label", "view", ["納品先の名前（納品済みのあとは納品時点の名前）。郵便番号も同じ行の下に出す。", "Tên nơi nhận (sau khi giao là tên tại thời điểm giao). Mã bưu chính hiện ở dòng kế."]),
        A("6.2", "住所", "Địa chỉ", ".info .r::住所:", "label", "view", ["都道府県から建物名まで。", "Từ tỉnh/thành đến tên tòa nhà."]),
        A("6.3", "担当者", "Người phụ trách", ".info .r::担当者:", "label", "view", ["拠点のメイン担当者。いなければ「—」。", "Người phụ trách chính của địa điểm. Không có thì 「—」."]),
        A("6.4", "電話番号", "Số điện thoại", ".info .r::電話番号:", "label", "view", ["納品先の電話番号。", "Số điện thoại nơi nhận."]),
        A("6.5", "受取時間帯", "Khung giờ nhận", ".info .r::受取時間帯:", "label", "view", ["納品先が受け取れる時間。複数あればすべて出す（配送_06 §12-2）。", "Khung giờ nơi nhận có thể nhận hàng. Có nhiều thì hiện tất cả (配送_06 §12-2)."]),
        A("6.6", "納品条件", "Điều kiện giao", ".info .r::納品条件:", "label", "view", ["入館方法・置き場所など（拠点マスタ）。", "Cách vào tòa nhà, nơi đặt hàng, v.v. (master địa điểm)."]),
        A("6.7", "納品備考", "Ghi chú giao hàng", ".info .memo", "label", "view", [
            "代替品があるときの指示（代替品（元：〇〇））・届けない不良商品・回収／廃棄の指示（代替品設定。台帳 J）。なければ欄ごと出さない。",
            "Hướng dẫn khi có hàng thay thế (hàng thay thế (gốc: 〇〇)), hàng lỗi không giao, chỉ thị thu hồi/hủy (thiết lập hàng thay thế; 台帳 J). Không có thì không hiện cả khung."]),
        A("7", "資料（委託業者向け）", "Tài liệu (dành cho đơn vị ủy thác)", ".info::拠点・中継先マスタ", "area", "view", [
            "拠点・中継先マスタの「地点の資料」（搬入経路図・駐車場案内など）の名前と「開く」ボタン。自社ドライバーにも委託ドライバーにも出す（見ないと配送先に着けないため：hong 2026-10-08・受付簿 #436。欄の名前「資料（委託業者向け）」は変えない）。資料はその場で見ることも、ファイルをダウンロードして端末に保存することもできる（hong 2026-10-07）。資料がなければ「この地点の資料はありません。」（I316）。",
            "Tên và nút 「開く」 của 「地点の資料」 trong master địa điểm・trung chuyển (sơ đồ lối vào, hướng dẫn bãi đỗ...). Hiện cho cả tài xế nội bộ lẫn tài xế ủy thác (nếu không xem thì không đến được nơi giao: hong 2026-10-08, 受付簿 #436; tên mục 「資料（委託業者向け）」 giữ nguyên). Xem trực tiếp hoặc tải file về lưu trên thiết bị đều được (hong 2026-10-07). Không có tài liệu thì 「この地点の資料はありません。」 (I316)."],
          err=["I316"],
          demo_ok=["コードは資料を常に空で返す（拠点・中継先マスタの資料につないでいない：H10）。資料がある状態は撮れない（宿題）。コードは委託ドライバーにだけ欄を出す。決定は自社にも出す（宿題・受付簿 #436）", "Code luôn trả tài liệu rỗng (chưa nối với tài liệu trong master địa điểm・trung chuyển: H10). Không chụp được trạng thái có tài liệu (việc phải sửa). Code chỉ hiện mục cho tài xế ủy thác; quyết định là hiện cả cho nội bộ (việc phải sửa; 受付簿 #436)"]),
        A("7.1", "資料を開く", "Mở tài liệu", "-", "button", "click", ["資料の名前の右の「開く」。その場で見る（PDF・画像を端末で開く）か、ファイルをダウンロードして端末に保存するかを選べる（hong 2026-10-07）。", "Nút 「開く」 bên phải tên tài liệu. Chọn xem trực tiếp (mở PDF/ảnh trên thiết bị) hoặc tải file về lưu trên thiết bị (hong 2026-10-07)."],
          demo_ok=["資料がないので撮れない（H10）。デモの帯のときは「開きました（デモ）」と出すだけ", "Không chụp được vì chưa có tài liệu (H10). Khi có dải demo chỉ hiện 「開きました（デモ）」"]),
        A("8", "荷物情報", "Thông tin hàng hóa", ".pk", "area", "view", [
            "この配送の荷物（箱）の一覧。送り状番号は ES が採番した「配送No-箱番号」（例 DL-261012-0011-01）か、運送会社の送り状番号。受け取っていない箱は「未受取」の札を付ける。",
            "Danh sách hàng (thùng) của đơn này. Số phiếu gửi là 「配送No-số thùng」 do ES cấp (ví dụ DL-261012-0011-01) hoặc số phiếu của hãng vận chuyển. Thùng chưa nhận có nhãn 「未受取」."]),
        A("8.1", "箱・冷蔵・冷凍の数", "Số thùng・lạnh・đông", ".pk .hd", "label", "view", [
            "箱の数・冷蔵の数・冷凍の数（商品の数の合計）。単位は「箱 n・冷蔵 n個・冷凍 n個」（「食」「品」は使わない：hong 2026-10-08・受付簿 #435）。わからないときは「—」。",
            "Số thùng・số hàng lạnh・số hàng đông (tổng số sản phẩm). Đơn vị 「箱 n・冷蔵 n個・冷凍 n個」 (không dùng 「食」「品」: hong 2026-10-08, 受付簿 #435). Không rõ thì 「—」."],
          demo_ok=["コードは冷蔵・冷凍を「品」と書く（H19）。設計は「個」に直す", "Code ghi lạnh・đông là 「品」 (H19). Thiết kế sửa thành 「個」"]),
        A("8.2", "送り状番号の行", "Dòng số phiếu gửi", ".pk .inv", "label", "view", ["箱ごとの番号。受取済みの箱は番号だけ、未受取は「未受取」を付ける。この画面ではチェックしない（受取は荷物受取の画面）。", "Số từng thùng. Thùng đã nhận chỉ hiện số, chưa nhận có 「未受取」. Màn này không check (nhận hàng làm ở màn nhận hàng)."]),
        A("13", "到着予定のカード（削除）", "Thẻ giờ đến dự kiến (đã xóa)", "-", "area", "view", [
            "削除する。到着予定の時間帯は持たない（お届け日だけ）ので、納品先・運営と共有するカード（時刻を選んで「共有する」）は置かない。決定：hong 2026-10-07（台帳 F）。",
            "Xóa. Không giữ khung giờ dự kiến (chỉ ngày giao) nên không đặt thẻ chia sẻ với nơi nhận・vận hành (chọn giờ rồi bấm 「共有する」). Quyết định: hong 2026-10-07 (台帳 F)."],
          demo_ok=["コードにはまだ「到着予定（納品先・運営と共有）」のカードがある（EtaCard・shareEta・運営の配送詳細の固定文）。削除する（宿題・Q-DW05）", "Code vẫn còn thẻ 「到着予定（納品先・運営と共有）」 (EtaCard・shareEta・câu cố định trong chi tiết giao hàng ở Web vận hành). Sẽ xóa (việc phải sửa・Q-DW05)"]),
        A("11", "下のボタン", "Nút dưới", ".foot", "area", "view", [
            "完了前だけ出す。受け取り済みなら「陳列を開始する」（途中なら「陳列を再開する」。押すと次のステップの画面へ）。受け取っていないときは「荷物を受け取っていません。受取地点で受け取ってから配送してください。」（I310）と、押せない「完了」。納品日が先の配送は押すとトースト I311。納品日より前に納品するときは確認のモーダルが出る（No.12）。",
            "Chỉ hiện trước khi hoàn tất. Đã nhận hàng thì 「陳列を開始する」 (đang dở thì 「陳列を再開する」; bấm sang màn của bước tiếp theo). Chưa nhận thì 「荷物を受け取っていません。受取地点で受け取ってから配送してください。」 (I310) và nút 「完了」 không bấm được. Đơn có ngày giao còn xa: bấm hiện toast I311. Giao sớm hơn ngày giao thì hiện modal xác nhận (No.12)."],
          err=["I310", "I311"]),
        A("11.1", "陳列を開始する", "Bắt đầu trưng bày", ".foot .btn.pri", "button", "click", ["押すと再開できるステップの画面（初めは ① 陳列前）。", "Bấm để sang màn của bước có thể tiếp tục (lần đầu là ① 陳列前)."]),
        A("12", "納品日より前の確認", "Xác nhận trước ngày giao", ".modal", "modal", "view", [
            "納品日より前に納品するとき（受け取り済み・納品日が先）、「納品日（{日付}）より前です」のモーダル。今日納品してよいか納品先とESキッチンに確認してもらい、理由を入れて「確認して納品する」を押す。理由が空だと押せない。理由は運営に記録する。",
            "Khi giao trước ngày giao (đã nhận hàng, ngày giao còn xa) hiện modal 「納品日（{ngày}）より前です」. Yêu cầu xác nhận với nơi nhận và ES Kitchen, nhập lý do rồi bấm 「確認して納品する」. Lý do trống thì không bấm được. Lý do được ghi cho vận hành."], err=["Q313"]),
        A("12.1", "前に納品する理由", "Lý do giao sớm", ".modal textarea", "textarea", "input", [
            "納品日より前に納品する理由。運営の配送の記録に残る。", "Lý do giao sớm hơn ngày giao. Được lưu trong lịch sử giao hàng của vận hành."],
          req="○", len="文字列 500", ex=["納品先から前日の納品を頼まれた", "Nơi nhận nhờ giao trước 1 ngày"], valid=["空は不可。前後の空白を取る。500文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Không được trống. Bỏ khoảng trắng đầu/cuối. Tối đa 500 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["E01", "E04"],
          demo_ok=["コードの上限は 200 文字（H2）。備考・メモの基準 500 に揃える（宿題）", "Giới hạn trong code là 200 ký tự (H2). Thống nhất theo chuẩn ghi chú・memo 500 (việc phải sửa)"]),
        A("12.2", "確認して納品する", "Xác nhận và giao", ".modal .btn.pri", "button", "click", ["理由が入っていれば押せる。押すと ① 陳列前（または再開するステップ）へ。", "Bấm được khi đã có lý do. Bấm sang ① 陳列前 (hoặc bước đang tiếp tục)."]),
        A("12.3", "キャンセル", "Hủy", ".modal .btn.sec", "button", "click", ["モーダルを閉じる。", "Đóng modal."]),
    ])

PK = reg([
    A("9", "駐車報告", "Báo cáo đỗ xe", ".bar-h::駐車報告^", "area", "view", [
        "駐車場代の報告。レシートの写真と駐車料金の両方が必須（承認・否認の手順はない。入力したら確定。委託配送会社・運営は見るだけ：台帳 B）。入力は納品まで、完了から7日まで修正できる。駐車料金は集金とは別で、ドライバーが立て替え、委託配送会社がまとめて運営へ請求する（法人には請求しない・集金の欄に出さない）。",
        "Báo cáo phí đỗ xe. Bắt buộc cả ảnh hóa đơn và phí đỗ xe (không có bước duyệt/từ chối. Nhập xong là chốt. Công ty vận chuyển ủy thác・vận hành chỉ xem: 台帳 B). Nhập đến khi giao, sửa được đến 7 ngày sau hoàn tất. Phí đỗ xe tách khỏi thu tiền, tài xế ứng trước, công ty vận chuyển ủy thác gom lại yêu cầu vận hành (không tính cho pháp nhân・không hiện ở mục thu tiền)."],
      demo_ok=["コードは納品日＋7日で修正を判定し、上限 999,999 円（H9）。決定は完了から7日・金額の上限 999,999,999（入力の共通基準）。宿題", "Code tính hạn sửa là ngày giao + 7 ngày, trần 999,999 yên (H9). Quyết định là 7 ngày sau hoàn tất và trần 999,999,999 (chuẩn nhập chung). Việc phải sửa"]),
    A("9.1", "編集", "Sửa", "button.scanbtn[aria-label=編集]", "button", "click", ["保存したあとに出す鉛筆のボタン。押すと入力できる状態に戻る（完了から7日まで。過ぎたら E439）。", "Nút bút chì hiện sau khi lưu. Bấm để quay lại trạng thái nhập được (đến 7 ngày sau hoàn tất; quá hạn thì E439)."], err=["E439"],
      demo_ok=["コードは配送完了後だけ編集アイコンを出す（完了前は保存しても入力欄と「保存」ボタンのまま。アイコンは出ない）。この絵は完了後の状態（DL-261013-0002 を完了させて撮影）。決定は保存したあとに編集アイコンを出し、納品日から7日まで修正できる（H9）", "Code chỉ hiện icon sửa sau khi đơn hoàn tất (trước hoàn tất dù đã lưu vẫn là ô nhập và nút 「保存」, không có icon). Hình này ở trạng thái sau hoàn tất (hoàn tất DL-261013-0002 rồi chụp). Quyết định: hiện icon sửa sau khi lưu, sửa được đến 7 ngày kể từ ngày giao (H9)"]),
    A("9.2", "レシート画像", "Ảnh hóa đơn", "label[aria-label=領収書をアップロード], .thumbs", "file", "upload", [
        "領収書（レシート）の写真を1枚。「領収書をアップロード」のアイコンから、端末のカメラかギャラリーで入れる。入れたあとは縮小した写真を出し、×で消せる。必須。写真の形式・容量は共通（JPG／PNG／HEIC・1枚 5MB）。",
        "1 ảnh hóa đơn (biên lai). Đưa vào bằng icon 「領収書をアップロード」 từ camera hoặc thư viện của thiết bị. Sau khi đưa vào hiện ảnh thu nhỏ, xóa bằng ×. Bắt buộc. Định dạng・dung lượng ảnh chung (JPG/PNG/HEIC・5MB/ảnh)."],
      req="○", len=["JPG・PNG・HEIC 1枚5MB", "JPG/PNG/HEIC, mỗi ảnh tối đa 5MB"], ex=["receipt_1012.jpg", "Ảnh hóa đơn đỗ xe (ví dụ receipt_1012.jpg)"], err=["E442", "E441"]),
    A("9.3", "駐車料金（税込）", "Phí đỗ xe (đã gồm thuế)", "input[aria-label^=駐車料金]", "text", "input", [
        "駐車場の料金（円）。必須。数字だけ入れる（全角は半角に直す）。0 円も入れられる。右寄せ。税込。",
        "Phí đỗ xe (yên). Bắt buộc. Chỉ nhập số (đổi toàn góc sang nửa góc). Nhập được 0 yên. Căn phải. Đã gồm thuế."],
      req="○", len="整数 0〜999,999,999", init=["空（0 を薄く表示）", "Trống (hiện mờ số 0)"], ex=["600", "Phí đỗ xe 600 yên"], valid=["数字だけ。0 以上 999,999,999 以下。空は不可。", "Chỉ số. Từ 0 đến 999,999,999. Không được trống."], err=["E01", "E12", "E14"],
      demo_ok=["コードは入力欄が9桁で、サーバーの上限は 999,999（H9）。入力エラーは項目の下ではなくサーバーのエラーをトーストで出す（H17）。宿題", "Ô nhập trong code là 9 chữ số, trần phía server là 999,999 (H9). Lỗi nhập không hiện dưới ô mà hiện lỗi của server bằng toast (H17). Việc phải sửa"]),
    A("9.4", "保存", "Lưu", ".bar-h ~ .btn.pri", "button", "click", [
        "レシートと料金の両方が入っていれば保存する（S01）。足りないときはその項目の下にエラー（E442・E01）を出して保存しない。保存したら入力欄を読み取り専用にし、編集ボタンを出す。修正の保存は S319。オフラインなら端末に保存（W311）。",
        "Lưu khi đã có cả hóa đơn và phí (S01). Thiếu thì hiện lỗi (E442・E01) dưới mục đó và không lưu. Lưu xong ô nhập chuyển chỉ đọc và hiện nút sửa. Lưu chỉnh sửa: S319. Offline thì lưu trên thiết bị (W311)."],
      err=["S01", "S319", "E442", "E01", "W311"]),
    A("9.5", "注意書き", "Ghi chú", "div::レシートの写真と駐車料金の両方を入れます", "label", "view", ["「レシートの写真と駐車料金の両方を入れます。納品日から7日まで直せます。駐車料金は集金とは別に所属先が精算します。」。修正の期限は完了から7日に直す（H9）。", "Câu 「レシートの写真と駐車料金の両方を入れます。納品日から7日まで直せます。駐車料金は集金とは別に所属先が精算します。」. Sửa thời hạn thành 7 ngày sau hoàn tất (H9)."]),
])

DP = reg([
    A("10", "修正の案内", "Hướng dẫn sửa", ".editbox", "area", "view", [
        "完了から7日までは「{日付} まで修正できます」。検品（陳列）の数も直せる。修正内容は運営に通知する。運営が完了後の実績を直していて同時に保存したときは E31（警告・上書きできる）。この配送にトラブル報告があるときは「トラブルがあるため修正できません」（E440）。直すときは運営に連絡してもらう。",
        "Trong 7 ngày sau hoàn tất: 「{ngày} まで修正できます」. Sửa được cả số lượng kiểm hàng (trưng bày). Nội dung sửa được thông báo cho vận hành. Nếu vận hành đang sửa kết quả sau hoàn tất và lưu cùng lúc thì E31 (cảnh báo, ghi đè được). Đơn có báo sự cố thì 「トラブルがあるため修正できません」 (E440). Cần sửa thì liên hệ vận hành."], err=["E440", "E439", "E31"]),
    A("10.1", "ステップごとの修正ボタン", "Nút sửa theo bước", ".editbtns", "area", "view", ["「① 陳列前写真」「② 在庫/廃棄」「③ 陳列」「④ 陳列後写真」「⑤ 集金」（集金がある納品先だけ）。押すとそのステップの画面を「完了後の修正中」で開く。", "「① 陳列前写真」「② 在庫/廃棄」「③ 陳列」「④ 陳列後写真」「⑤ 集金」 (chỉ nơi nhận có thu tiền). Bấm để mở màn của bước đó ở chế độ 「完了後の修正中」."]),
    A("10.2", "陳列前写真", "Ảnh trước trưng bày", ".bar-h::陳列前写真", "label", "view", ["① で入れた写真（縮小して並べる）。", "Ảnh đã nhập ở ① (xếp thu nhỏ)."]),
    A("10.3", "廃棄登録と実在庫", "Đăng ký hủy và tồn thực", ".bar-h::廃棄登録と実在庫", "label", "view", ["② の商品ごとの廃棄数と実在庫の表（商品名・廃棄数(△)・実在庫）。", "Bảng số hủy và tồn thực theo sản phẩm ở ② (tên sản phẩm・số hủy (△)・tồn thực)."]),
    A("10.4", "陳列", "Trưng bày", ".bar-h::陳列", "label", "view", ["③ の表（商品名・予定数・実際数・差異）。差異があるものは赤で出す。", "Bảng ở ③ (tên sản phẩm・số dự kiến・số thực tế・chênh lệch). Chỗ có chênh lệch hiện chữ đỏ."]),
    A("10.5", "陳列後写真", "Ảnh sau trưng bày", ".bar-h::陳列後写真", "label", "view", ["④ で入れた写真。", "Ảnh đã nhập ở ④."]),
])

# 状態ごとに必要な番号だけを使う
HEAD = lambda: [R1["1"], R1["1.1"], R1["1.2"], R1["2"]]
TABS = lambda: [R1["5"], R1["5.1"], R1["5.2"], R1["5.3"]]

VIEWS = [
    V("001", "DA_ESDL_001", "基本情報・荷物を受け取っていない（開始できない）", "Thông tin cơ bản・chưa nhận hàng (không bắt đầu được)", ES,
      HEAD() + TABS() + [R1["6"], R1["6.1"], R1["6.2"], R1["6.3"], R1["6.4"], R1["6.5"], R1["6.6"], R1["6.7"], R1["7"], R1["8"], R1["8.1"], R1["8.2"], R1["13"], R1["11"]],
      login="DR00041", today="2026/10/13",
      note=["委託ドライバー 西村（DR00041）・今日 2026/10/13・大阪支店（集金あり・代替品の指示あり）。関西倉庫でまだ荷物を受け取っていない。",
            "Tài xế ủy thác Nishimura (DR00041), hôm nay 2026/10/13, chi nhánh Osaka (có thu tiền・có chỉ thị hàng thay thế). Chưa nhận hàng ở kho Kansai."]),
    V("002", "DA_ESDL_001", "基本情報・受取済（陳列を開始できる）", "Thông tin cơ bản・đã nhận (bắt đầu trưng bày được)", ES,
      HEAD() + TABS() + [R1["8"], R1["8.2"], R1["11"], R1["11.1"]], setup="await recvAll('WH00002'); await sync();", login="DR00041", today="2026/10/13",
      note=["荷物受取を完了したあと。下のボタンが「陳列を開始する」になる。", "Sau khi hoàn tất nhận hàng. Nút dưới thành 「陳列を開始する」."]),
    V("003", "DA_ESDL_001", "納品日より前の確認モーダル（理由必須）", "Modal xác nhận giao trước ngày giao (bắt buộc lý do)", ES2,
      [R1["12"], R1["12.1"], R1["12.2"], R1["12.3"]], setup="await click('陳列を開始');", full=False, login="DR00041", today="2026/10/13",
      note=["淀屋橋ES（納品日 10-14）を今日受け取り済みの状態で「陳列を開始する」を押した。", "Nhấn 「陳列を開始する」 khi đơn Yodoyabashi (ngày giao 10-14) đã nhận hôm nay."]),
    V("004", "DA_ESDL_001", "資料（委託業者向け）", "Tài liệu (dành cho đơn vị ủy thác)", ES, [R1["7"], R1["7.1"]], login="DR00041", today="2026/10/13",
      note=["自社ドライバーにも委託ドライバーにも出る欄（見ないと配送先に着けないため）。資料は拠点・中継先マスタにつないでいないので、いまは「資料はありません」。この画像は委託ドライバー（DR00041）。", "Mục hiện cho cả tài xế nội bộ lẫn ủy thác (nếu không xem thì không đến được nơi giao). Chưa nối tài liệu của master nên hiện 「資料はありません」. Ảnh này là tài xế ủy thác (DR00041)."]),
    V("005", "DA_ESDL_001", "駐車報告タブ（入力前）", "Tab báo cáo đỗ xe (trước khi nhập)", ES + "?tab=park",
      HEAD() + TABS() + [PK["9"], PK["9.2"], PK["9.3"], PK["9.4"], PK["9.5"]], login="DR00041", today="2026/10/13"),
    V("006", "DA_ESDL_001", "駐車報告・入力エラー（レシートなし・料金なし）", "Báo cáo đỗ xe・lỗi nhập (thiếu hóa đơn・phí)", ES + "?tab=park",
      [PK["9.2"], PK["9.3"], PK["9.4"]], setup="holdToast(); await click('保存');", login="DR00041", today="2026/10/13",
      note=["決定：項目の下にインラインで E442（レシート）・E01（料金）を出す（台帳 E「保存エラーの出し方」）。コードは保存ボタンを押すとサーバーのエラーをトーストで出す（宿題 H17）。",
            "Quyết định: hiện lỗi inline dưới mục E442 (hóa đơn)・E01 (phí) (台帳 E). Code khi bấm lưu hiện lỗi của server bằng toast (việc phải sửa H17)."]),
    V("007", "DA_ESDL_001", "駐車報告・保存済み（編集アイコン）", "Báo cáo đỗ xe・đã lưu (icon sửa)", ES2 + "?tab=park",
      [PK["9"], PK["9.1"], PK["9.2"], PK["9.3"]],
      setup="const f=await api('flow',{staff:staff(),no:'DL-261013-0002'}); f.park={fee:'600',rc:'/driver/photo.jpg'}; await api('savePark',{staff:staff(),no:'DL-261013-0002',flow:f,offline:false}); await finishEs('DL-261013-0002',{early:'納品先から前日の納品を依頼された'}); await sync();",
      login="DR00041", today="2026/10/13",
      note=["配送が完了すると編集アイコンが出る（コードは完了済みだけ）。決定は完了してから7日まで修正できる。", "Icon sửa hiện sau khi hoàn tất (code chỉ với đơn đã hoàn tất). Quyết định: sửa được đến 7 ngày sau hoàn tất."]),
    V("008", "DA_ESDL_001", "完了バナー（荷物の配送は完了しました）", "Banner hoàn tất (荷物の配送は完了しました)", ES2,
      HEAD() + [R1["3"], R1["5"], R1["8"]],
      setup="await sync();", login="DR00041", today="2026/10/13",
      note=["淀屋橋ES を5ステップで完了した直後。完了後は下のボタンを出さない。", "Ngay sau khi hoàn tất đơn Yodoyabashi qua 5 bước. Sau hoàn tất không hiện nút dưới."]),
    V("009", "DA_ESDL_001", "陳列情報タブ・完了後（{日付}まで修正できる）", "Tab thông tin trưng bày・sau hoàn tất (sửa được đến {ngày})", ES2 + "?tab=disp",
      TABS() + [DP["10"], DP["10.1"], DP["10.2"], DP["10.3"], DP["10.4"], DP["10.5"]], login="DR00041", today="2026/10/13"),
    V("010", "DA_ESDL_001", "陳列情報タブ・トラブルがあり修正できない／トラブル報告済みの枠", "Tab trưng bày・có sự cố nên không sửa được / khung sự cố đã báo", ES2 + "?tab=disp",
      [R1["4"], DP["10"]],
      setup="await api('reportTrouble',{staff:staff(),target:'d:DL-261013-0002',type:'不在・連絡不可',nos:[],note:'受付が不在で渡せなかった',photos:0,offline:false}); await sync();", login="DR00041", today="2026/10/13",
      note=["トラブル報告のある配送は、完了後に修正できない（台帳 E）。ここでは報告を完了のあとに足して見せている（完了後も報告できる：hong 2026-10-08・受付簿 #434。完了後7日の修正との関係は DA_ESDL_001 No.1.2 の open）。", "Đơn có báo sự cố thì không sửa được sau hoàn tất (台帳 E). Ở đây thêm báo cáo sau hoàn tất để minh họa (sau hoàn tất vẫn báo được: hong 2026-10-08, 受付簿 #434. Quan hệ với việc sửa trong 7 ngày xem open ở DA_ESDL_001 No.1.2)."]),
]

# ---------------------------------------------------------------- DA_ESDL_002 ① 陳列前 / 006 ④ 陳列後（写真）
def photo_screen(code, ttl, ttl_vi, sub_ja, sub_vi):
    return top(ttl, ttl_vi) + [DCARD, STEPS,
        A("4", sub_ja, sub_vi, ".bar-h::" + sub_ja, "label", "view", [
            ("冷蔵庫・ボックス内の陳列前写真をアップロードしてください。" if code == "002" else "陳列後の冷蔵庫・ボックスの写真をアップロードしてください。") + "（説明の文は画面に出す）",
            ("Hãy tải lên ảnh tủ lạnh・hộp trước khi trưng bày." if code == "002" else "Hãy tải lên ảnh tủ lạnh・hộp sau khi trưng bày.") + " (câu hướng dẫn hiện trên màn hình)"])] + drop_items("5", True) + [HELP,
        foot2("7", "戻る", "続ける", note_ja="写真が0枚のときは「続ける」を押せない。押すと内容を保存して次のステップへ。")]

STEP_NOTE = ["途中の入力（写真・チェック・数）は画面を移っても残し、ステップを進めたときにサーバーにも保存する。再読み込み・離脱でも端末に保持する（離脱の確認は出さない。未送信と同じ仕組み＝P-OFFLINE：hong 2026-10-08・受付簿 #438。台帳 M-1「下書きは残さない」の例外）。コードはメモリだけで再読み込みで消える（宿題）。", "Dữ liệu đang nhập (ảnh・check・số lượng) được giữ khi chuyển màn hình và lưu lên server khi sang bước tiếp. Tải lại・rời đi vẫn giữ trên thiết bị (không hiện xác nhận rời đi. Cùng cơ chế với mục chưa gửi = P-OFFLINE: hong 2026-10-08, 受付簿 #438. Ngoại lệ của 台帳 M-1 「下書きは残さない」). Code chỉ giữ trong bộ nhớ, tải lại là mất (việc phải sửa)."]

VIEWS += [
    V("011", "DA_ESDL_002", "① 陳列前・写真なし（続けるは押せない）", "① Trước trưng bày・chưa có ảnh (không bấm được 「続ける」)", ES + "?step=s1",
      [x for x in photo_screen("002", "陳列前", "Trước trưng bày", "陳列前", "Trước trưng bày") if x["no"] not in ("5.1",)], login="DR00041", today="2026/10/13", note=STEP_NOTE),
    V("012", "DA_ESDL_002", "① 陳列前・写真あり", "① Trước trưng bày・đã có ảnh", ES + "?step=s1",
      [x for x in photo_screen("002", "陳列前", "Trước trưng bày", "陳列前", "Trước trưng bày") if x["no"] in ("5", "5.1", "5.2", "7")],
      setup="await click('サンプル写真を追加'); await click('サンプル写真を追加');", login="DR00041", today="2026/10/13"),
]

# ---------------------------------------------------------------- DA_ESDL_003 ② 在庫/廃棄
def stock_items(done=False):
    r = top("在庫/廃棄", "Tồn kho/hủy") + [DCARD, STEPS]
    if done:
        r += [A("4.1", "成功のバナー", "Banner thành công", ".banner", "area", "view", [
            "「在庫/廃棄が成功しました。」と確認した時刻。確認したあとの表は読み取り専用（商品名・廃棄数・実在庫）。「戻る」で入力に戻れる。",
            "「在庫/廃棄が成功しました。」 và giờ xác nhận. Bảng sau khi xác nhận ở chế độ chỉ đọc (tên sản phẩm・số hủy・tồn thực). Bấm 「戻る」 để quay lại nhập."])]
    r += [
        A("4", "廃棄登録と実在庫の確認", "Đăng ký hủy và xác nhận tồn thực", ".bar-h::廃棄登録と実在庫の確認", "label", "view", [
            "「廃棄数を確認し、実在庫をチェックしてください。在庫数が一致しない場合は、実在庫数に修正してからチェックしてください。※検索または商品のバーコードスキャンからも廃棄登録できます。」。",
            "「廃棄数を確認し、実在庫をチェックしてください。在庫数が一致しない場合は、実在庫数に修正してからチェックしてください。※検索または商品のバーコードスキャンからも廃棄登録できます。」."]),
        A("5", "商品の検索", "Tìm sản phẩm", ".search input", "text", "input", ["名前またはコードの部分一致で表を絞る。「検索」キー（キーボード）／Enter を押してから絞る（台帳 M-1。入力のたびには絞らない）。", "Lọc bảng theo khớp một phần tên hoặc mã; lọc sau khi bấm phím 「検索」 (bàn phím)/Enter (台帳 M-1; không lọc mỗi lần gõ)."],
          req="－", len="文字列 60", ex=["カレー", "Một phần tên sản phẩm (ví dụ 「カレー」)"], valid=["前後の空白を取る。60文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Bỏ khoảng trắng đầu/cuối. Tối đa 60 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["E04"]),
        A("6", "バーコードスキャン", "Quét mã vạch", ".scanbtn", "button", "click", ["押すとバーコードスキャン（DA_ESDL_004）へ。一覧にない商品もスキャンして廃棄に足せる（台帳 L）。", "Bấm để sang quét mã vạch (DA_ESDL_004). Sản phẩm không có trong danh sách cũng quét thêm vào hủy được (台帳 L)."]),
        A("7", "次回納品日", "Ngày giao kế tiếp", ".muted::次回納品日", "label", "view", [
            "「※次回納品日 {日付}」。目的は賞味期限の確認：商品の賞味期限が次回納品日より前に切れるときは、その商品を回収・廃棄する必要がある（hong 2026-10-07）。日付は納品先の次回の納品日をデータから出す。賞味期限が次回納品日より前に切れる商品は自動で警告する（下の No.7.1：hong 2026-10-08・受付簿 #454）。",
            "「※次回納品日 {ngày}」. Mục đích là kiểm tra hạn dùng: nếu hạn dùng của sản phẩm hết trước ngày giao kế tiếp thì phải thu hồi/hủy sản phẩm đó (hong 2026-10-07). Ngày lấy từ dữ liệu ngày giao kế tiếp của nơi nhận. Sản phẩm có hạn dùng hết trước ngày giao kế tiếp được cảnh báo tự động (No.7.1 bên dưới: hong 2026-10-08, 受付簿 #454)."],
          demo_ok=["コードは固定の見本文（H15）。値はデータから出す（宿題）", "Code là câu mẫu cố định (H15). Cần lấy giá trị từ dữ liệu (việc phải sửa)"]),
        A("7.1", "賞味期限の警告", "Cảnh báo hạn dùng", "-", "label", "view", [
            "賞味期限が次回納品日より前に切れる商品を、自動で警告する。警告は商品ごとに、この表の該当商品の行に W313「賞味期限（{日付}）が次回納品日（{日付}）より前です。回収・廃棄してください。」を出す。同じ商品に賞味期限の違う在庫が混ざるときは、いちばん近い期限で判定する。警告は「確認」（No.9.1 のチェック・「確認」ボタン）を止めない（回収・廃棄は廃棄数〈No.9.3〉で入れる：hong 2026-10-08・受付簿 #462 ③）。賞味期限の元データは、仕入先が本発注の承認で入力した値と在庫から出す（DA に賞味期限の入力欄は足さない）。毎月メニューに載る商品は警告の対象から外し、それ以外は計算して警告する。台帳 B「賞味期限を追跡しない」はこの決定（受付簿 #454）で置き換わった。",
            "Tự động cảnh báo sản phẩm có hạn dùng hết trước ngày giao kế tiếp. Cảnh báo theo từng sản phẩm, hiện W313 「賞味期限（{ngày}）が次回納品日（{ngày}）より前です。回収・廃棄してください。」 ở dòng sản phẩm tương ứng trong bảng này. Khi cùng một sản phẩm có tồn kho nhiều hạn dùng khác nhau thì xác định theo hạn gần nhất. Cảnh báo không chặn việc 「確認」 (check ở No.9.1・nút 「確認」); thu hồi・hủy thì nhập ở số hủy 〈No.9.3〉 (hong 2026-10-08, 受付簿 #462 ③). Dữ liệu hạn dùng lấy từ giá trị nhà cung cấp nhập khi duyệt đặt hàng chính thức và từ tồn kho (không thêm ô nhập hạn dùng vào DA). Sản phẩm có trong menu hằng tháng thì loại khỏi đối tượng, còn lại thì tính và cảnh báo. 台帳 B 「賞味期限を追跡しない」 đã được quyết định này (受付簿 #454) thay thế."],
          demo_ok=["コードに賞味期限の警告はない（賞味期限の元データも、DA 側にはない）。仕入先の本発注の承認で入力した賞味期限と在庫から計算して出す（宿題・受付簿 #454）", "Code chưa có cảnh báo hạn dùng (phía DA cũng chưa có dữ liệu hạn dùng gốc). Cần tính từ hạn dùng nhà cung cấp nhập khi duyệt đặt hàng chính thức và từ tồn kho (việc phải sửa; 受付簿 #454)"]),
        A("8", "未確認のみ表示", "Chỉ hiện mục chưa xác nhận", ".chk::未確認のみ表示", "check", "check", ["オンにすると、確認のチェックがまだの商品だけ表に出す。", "Bật thì chỉ hiện sản phẩm chưa check xác nhận."], req="－", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
        A("9", "商品の表", "Bảng sản phẩm", ".tbl", "table", "view", [
            "商品ごとに2行：1行目に商品名、2行目に理論在庫・廃棄数・実在庫。表は商品の並び（報告の行の順）。ほかの商品はスキャンで足す。0件のときは「該当する商品はありません。」（I01）。",
            "Mỗi sản phẩm 2 dòng: dòng 1 tên sản phẩm, dòng 2 tồn lý thuyết・số hủy・tồn thực. Thứ tự theo sản phẩm (thứ tự dòng báo cáo). Sản phẩm khác thêm bằng quét. 0 dòng thì 「該当する商品はありません。」 (I01)."], err=["I01"]),
        A("9.1", "確認（チェック）", "Xác nhận (check)", ".tbl .cb", "check", "check", [
            "商品ごとの確認。廃棄数と実在庫を見て押す。すべてチェックしないと「確認」を押せない。完了後の修正では全部チェック済みで始まる。",
            "Xác nhận theo từng sản phẩm. Xem số hủy và tồn thực rồi bấm. Phải check hết mới bấm được 「確認」. Khi sửa sau hoàn tất thì bắt đầu với tất cả đã check."], req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
        A("9.2", "理論在庫", "Tồn lý thuyết", ".tbl th::理論在庫", "label", "view", [
            "この配送の前の在庫の数（棚卸の下書きの数。この配送の納品・廃棄は入れない）。ドライバーには見せる（hong 2026-10-07・法人Web には見せない）。読み取り専用。",
            "Số tồn kho trước đơn giao này (số trong bản nháp kiểm kê; không gồm giao・hủy của đơn này). Hiển thị cho tài xế (hong 2026-10-07・không hiển thị ở Web pháp nhân). Chỉ đọc."]),
        A("9.3", "廃棄数（△）", "Số hủy (△)", ".tbl tr:nth-child(3) td:nth-child(2) .stp", "text", "click", [
            "捨てる数。＋／−で1ずつ増減する。0〜9,999 の整数（廃棄の入力はこのステップ②だけ：hong 2026-10-08・受付簿 #455。理論在庫より多くても止めない：台帳 F 2026-10-07「実在庫が理論在庫より多くても止めない」）。増減すると実在庫（廃棄後）が 理論在庫 − 廃棄数 に変わる（0 未満になるときは 0）。廃棄の理由は下の No.9.5 で選ぶ（任意）。代替品の回収（不良品）なら「理由：代替品の回収（不良品）・管理ロスにしない」を商品名の下に出す（選ぶ欄ではなく表示：台帳 J）。",
            "Số lượng bỏ. Tăng giảm 1 bằng ＋/−. Số nguyên 0〜9.999 (nhập hủy chỉ ở bước ② này: hong 2026-10-08, 受付簿 #455; không chặn dù lớn hơn tồn lý thuyết: 台帳 F 2026-10-07). Khi tăng giảm, tồn thực (sau hủy) đổi thành tồn lý thuyết − số hủy (nhỏ hơn 0 thì lấy 0). Lý do hủy chọn ở No.9.5 bên dưới (không bắt buộc). Nếu là thu hồi hàng thay thế (hàng lỗi) thì dưới tên sản phẩm hiện 「理由：代替品の回収（不良品）・管理ロスにしない」 (chỉ hiển thị, không phải ô chọn: 台帳 J)."],
          req="○", len=["整数 0〜9,999", "Số nguyên 0〜9.999"], init=["0", "0"], ex=["1", "Hủy 1 sản phẩm"], valid=["0 以上 9,999 以下の整数。", "Số nguyên từ 0 đến 9.999."], err=["E12"]),
        A("9.4", "実在庫（廃棄後）", "Tồn thực (sau hủy)", ".tbl tr:nth-child(3) td:nth-child(3) .stp", "text", "click", [
            "いま数えた実際の在庫。初期値は 理論在庫 − 廃棄数（ステップを減らすため：台帳 F 2026-10-07）。数が違えば＋／−で直してからチェックする。0〜9999 の整数（全角は半角に直す）。",
            "Tồn thực tế đếm được. Giá trị ban đầu là tồn lý thuyết − số hủy (giảm bước: 台帳 F 2026-10-07). Nếu số khác thì chỉnh bằng ＋/− rồi check. Số nguyên 0〜9999 (đổi toàn góc sang nửa góc)."],
          req="○", len="整数 0〜9,999", init=["理論在庫 − 廃棄数", "Tồn lý thuyết − số hủy"], ex=["3", "Tồn thực 3"], valid=["0 以上 9,999 以下の整数。", "Số nguyên từ 0 đến 9.999."], err=["E12", "E14"]),
        A("9.5", "廃棄の理由", "Lý do hủy", "-", "select", "select", [
            "ES配送便②の廃棄の入力全体で、任意の1つを選ぶ選択欄（商品ごとには選ばない：hong 2026-10-09・受付簿 #472）。選択肢は「賞味期限切れ」「破損・品質不良」「その他」の3つ（hong 2026-10-08・受付簿 #461。以前の廃棄登録の選択肢から減らした）。選ばなくても確認できる。「その他」を選んでも補足の入力欄は置かない。確認したあとは読み取り専用で、完了後の修正では直せる。",
            "Ô chọn một lý do (không bắt buộc) cho toàn bộ phần nhập hủy ở bước ② của ES配送便 (không chọn theo từng sản phẩm: hong 2026-10-09, 受付簿 #472). Có 3 lựa chọn: 「賞味期限切れ」「破損・品質不良」「その他」 (hong 2026-10-08, 受付簿 #461; giảm so với lựa chọn của đăng ký hủy trước đây). Không chọn vẫn xác nhận được. Chọn 「その他」 cũng không có ô nhập bổ sung. Sau khi xác nhận ở chế độ chỉ đọc, khi sửa sau hoàn tất thì sửa được."],
          req="－", len=["選択（3つ）", "Chọn (3 lựa chọn)"], init=["未選択", "Chưa chọn"], ex=["賞味期限切れ", "賞味期限切れ (hết hạn dùng)"],
          demo_ok=["コードの②に廃棄の理由を選ぶ欄はまだない。足す（宿題・受付簿 #461）", "Bước ② trong code chưa có ô chọn lý do hủy. Sẽ thêm (việc phải sửa; 受付簿 #461)"]),
        foot2("10", "戻る", "確認", note_ja="すべての商品をチェックしたら「確認」が押せる。押すと成功のバナーの画面（読み取り専用）になり、「続ける」で ③ 陳列へ。"),
    ]
    return r


R3 = reg(stock_items(False))
VIEWS += [
    V("013", "DA_ESDL_003", "② 在庫/廃棄・一覧（理論在庫・廃棄数・実在庫・確認）", "② Tồn kho/hủy・danh sách (tồn lý thuyết・số hủy・tồn thực・xác nhận)", ES + "?step=s2",
      [x for x in stock_items(False)], login="DR00041", today="2026/10/13", note=STEP_NOTE),
    V("014", "DA_ESDL_003", "② 検索・「未確認のみ表示」", "② Tìm kiếm・「未確認のみ表示」", ES + "?step=s2",
      [R3["5"], R3["8"], R3["9"], R3["9.1"]],
      setup="const nm=document.querySelector('.pname').textContent.slice(0,2); setv(document.querySelector('.search input'),nm); await sleep(300); await click('未確認のみ表示');", login="DR00041", today="2026/10/13"),
    V("015", "DA_ESDL_003", "② 確認済み（成功バナー）", "② Đã xác nhận (banner thành công)", ES + "?step=s2",
      [x for x in stock_items(True) if x["no"] in ("1", "2", "3", "4.1", "4", "9", "10")],
      setup="const f=await api('flow',{staff:staff(),no:'DL-261012-0011'}); f.stock.forEach(r=>r.ck=true); f.stockDone=true; f.stockAt='10-13（火） 9:30'; await api('saveFlow',{staff:staff(),no:'DL-261012-0011',flow:f}); await sync();", login="DR00041", today="2026/10/13"),
]

# ---------------------------------------------------------------- DA_ESDL_004 バーコードスキャン
SC = top("在庫/廃棄", "Tồn kho/hủy") + [DCARD,
    A("4", "説明", "Hướng dẫn", ".hint", "label", "view", [
        "「商品のバーコードをスキャンして廃棄登録できます。※一覧に表示されていない商品もスキャン可能です。」。",
        "「商品のバーコードをスキャンして廃棄登録できます。※一覧に表示されていない商品もスキャン可能です。」."]),
    A("5", "カメラ", "Camera", ".cam", "area", "click", [
        "端末のカメラでバーコード（JAN）を読み取る。読み取れたら ② の一覧に戻り、その商品の廃棄数を1増やして S404 を出す。一覧にない商品は行を足して廃棄 1 にする。読み取れない・商品が見つからないときは E329（トースト）。カメラの許可がないときは I226。位置情報・写真は保存しない。",
        "Đọc mã vạch (JAN) bằng camera thiết bị. Đọc được thì quay lại danh sách ② và tăng số hủy của sản phẩm đó thêm 1, hiện S404. Sản phẩm không có trong danh sách thì thêm dòng với số hủy 1. Không đọc được・không tìm thấy sản phẩm thì E329 (toast). Chưa cấp quyền camera thì I226. Không lưu vị trí・ảnh."],
      err=["S404", "E329", "I226"],
      demo_ok=["カメラ・バーコードはまだつないでいない。画像をタップすると既存の行をランダムに選んで1増やす模擬（H14）。一覧にない商品の追加・商品が見つからない場合はコードにない（宿題）", "Camera・mã vạch chưa nối. Bấm vào ảnh thì mô phỏng chọn ngẫu nhiên một dòng có sẵn và tăng 1 (H14). Thêm sản phẩm không có trong danh sách・trường hợp không tìm thấy sản phẩm chưa có trong code (việc phải sửa)"]),
    A("6", "一覧に戻る", "Về danh sách", ".foot .btn.sec", "button", "click", ["② 在庫/廃棄の一覧へ戻る（入力は残す）。", "Về danh sách ② 在庫/廃棄 (giữ nội dung nhập)."]),
]
VIEWS += [
    V("016", "DA_ESDL_004", "スキャン画面（カメラ）", "Màn quét (camera)", ES + "?step=scan", SC, login="DR00041", today="2026/10/13"),
    V("017", "DA_ESDL_004", "スキャン・商品が見つからない", "Quét・không tìm thấy sản phẩm", ES + "?step=scan",
      [SC[0]] if False else [x for x in SC if x["no"] in ("5",)], setup="", login="DR00041", today="2026/10/13",
      note=["商品が見つからないときは E329「商品が見つかりません。JANコードか商品名を確認してください。」をトーストで出す。コードにはまだこの動きがない（模擬）ので、画面は同じ。", "Khi không tìm thấy sản phẩm hiện toast E329. Code chưa có hoạt động này (mô phỏng) nên màn hình giống nhau."]),
]

# ---------------------------------------------------------------- DA_ESDL_005 ③ 陳列（検品）
def disp_items():
    return top("陳列", "Trưng bày") + [DCARD, STEPS,
        A("4", "検品・陳列", "Kiểm hàng・trưng bày", ".bar-h::検品・陳列", "label", "view", ["実際に並べた数を入れて確認する。予定数と違う場合や未確認の商品がある場合は、自動でトラブル（商品不足・誤配送）として運営に報告される。", "Nhập số thực tế đã xếp rồi xác nhận. Nếu khác số dự kiến hoặc có sản phẩm chưa xác nhận thì tự động báo vận hành thành sự cố (thiếu hàng・giao nhầm)."]),
        A("5", "商品の検索", "Tìm sản phẩm", ".search input", "text", "input", ["名前またはコードの部分一致で表を絞る。「検索」キー（キーボード）／Enter を押してから絞る（台帳 M-1。入力のたびには絞らない）。", "Lọc bảng theo khớp một phần tên hoặc mã; lọc sau khi bấm phím 「検索」 (bàn phím)/Enter (台帳 M-1; không lọc mỗi lần gõ)."], req="－", len="文字列 60", ex=["カレー", "Một phần tên sản phẩm"], valid=["前後の空白を取る。60文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Bỏ khoảng trắng đầu/cuối. Tối đa 60 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["E04"]),
        A("6", "バーコードスキャン", "Quét mã vạch", ".scanbtn", "button", "click", ["押すとバーコードを読み取り、その商品を確認済みにして S405 を出す。", "Bấm để đọc mã vạch, đánh dấu sản phẩm đó đã xác nhận và hiện S405."], err=["S405"],
          demo_ok=["コードは未確認の行を順に確認済みにする模擬（H14）", "Code mô phỏng đánh dấu lần lượt các dòng chưa xác nhận (H14)"]),
        A("7", "未確認のみ表示", "Chỉ hiện mục chưa xác nhận", ".chk::未確認のみ表示", "check", "check", ["オンにすると、確認がまだの商品だけ表に出す。", "Bật thì chỉ hiện sản phẩm chưa xác nhận."], req="－", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
        A("8", "検品の表", "Bảng kiểm hàng", ".tbl", "table", "view", ["商品ごとに：確認のチェック・商品名と予定数・実際数。代替品は「商品名（代替品（元：〇〇））」と出す。予定数と違う行には赤く「差異 n」を出す。", "Theo từng sản phẩm: check xác nhận・tên và số dự kiến・số thực tế. Hàng thay thế hiện 「tên sản phẩm（hàng thay thế (gốc: 〇〇))」. Dòng khác số dự kiến hiện chữ đỏ 「差異 n」."]),
        A("8.1", "確認（チェック）", "Xác nhận (check)", ".tbl .cb", "check", "check", ["商品ごとの確認。1つ以上チェックすると「確認」を押せる。", "Xác nhận theo sản phẩm. Check ít nhất 1 thì bấm được 「確認」."], req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
        A("8.2", "予定数", "Số dự kiến", ".sub2", "label", "view", ["配送の明細の予定数（個）。読み取り専用。", "Số dự kiến trong chi tiết giao hàng (cái). Chỉ đọc."]),
        A("8.3", "実際数", "Số thực tế", ".tbl .stp", "text", "click", ["実際に並べた数。＋／−で増減する。初期値は予定数。0〜9,999 の整数。", "Số thực tế đã xếp. Tăng giảm bằng ＋/−. Mặc định là số dự kiến. Số nguyên 0〜9.999."],
          req="○", len="整数 0〜9,999", init=["予定数", "Số dự kiến"], ex=["12", "Xếp thực tế 12 cái"], valid=["0 以上 9,999 以下の整数。", "Số nguyên từ 0 đến 9.999."], err=["E12"]),
        A("9", "注意書き", "Ghi chú", ".hint.muted", "label", "view", ["「※予定数と違う場合や未確認の商品がある場合は、自動でトラブル（商品不足・誤配送）として運営に報告されます。」固定の文。", "Câu cố định: nếu khác số dự kiến hoặc có sản phẩm chưa xác nhận thì tự động báo vận hành thành sự cố (thiếu hàng・giao nhầm)."]),
        foot2("10", "戻る", "確認", note_ja="押したとき、すべて確認済みで差異なしならそのまま報告して ④ へ。差異または未確認があれば確認のモーダル（No.11）。"),
        A("11", "確認のモーダル（差異・未確認あり）", "Modal xác nhận (có chênh lệch・chưa xác nhận)", ".modal", "modal", "view", [
            "「荷物の陳列は完了しましたか？」。内容はトラブル（商品不足・誤配送）として運営に自動で報告される。「ESキッチンへ連絡済みです。」にチェックしないと「報告完了」は押せない。「ESへ電話する」は端末の電話を発信する（発信した事実を記録）。",
            "「荷物の陳列は完了しましたか？」. Nội dung tự động báo vận hành thành sự cố (thiếu hàng・giao nhầm). Phải check 「ESキッチンへ連絡済みです。」 mới bấm được 「報告完了」. 「ESへ電話する」 gọi điện từ thiết bị (ghi lại việc đã gọi)."], err=["Q312"],
          demo_ok=["「ESへ電話する」はトースト「050-5784-2777 へお電話ください…」を出すだけで発信しない（H11）。番号は 050-5784-2777 に統一済み（コードの ES_TEL）", "「ESへ電話する」 chỉ hiện toast 「050-5784-2777 へお電話ください…」 chứ không gọi (H11). Số đã thống nhất 050-5784-2777 (ES_TEL trong code)"]),
        A("11.1", "連絡済みのチェック", "Check đã liên hệ", ".modal .chk", "check", "check", ["「ESキッチンへ連絡済みです。」。オンにすると報告完了を押せる。", "「ESキッチンへ連絡済みです。」. Bật thì bấm được 「報告完了」."], req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
        A("11.2", "報告完了", "Báo cáo hoàn tất", ".modal .btn.soft", "button", "click", ["押すと差異をトラブルとして自動で報告し、④ 陳列後へ進む。トーストは S314 ではなく陳列の完了の文（報告の結果）。", "Bấm để tự động báo chênh lệch thành sự cố và sang ④. Toast là câu hoàn tất trưng bày (kết quả báo cáo)."]),
    ]


R5 = reg(disp_items())
VIEWS += [
    V("018", "DA_ESDL_005", "③ 陳列・初期（予定数・実際数）", "③ Trưng bày・ban đầu (số dự kiến・số thực tế)", ES + "?step=s3",
      [R5[k] for k in ("1", "1.1", "1.2", "2", "3", "4", "5", "6", "7", "8", "8.1", "8.2", "8.3", "9", "10")], login="DR00041", today="2026/10/13", note=STEP_NOTE),
    V("019", "DA_ESDL_005", "③ 差異あり・確認モーダル（連絡済みチェック＋ESへ電話）", "③ Có chênh lệch・modal xác nhận (check đã liên hệ + gọi ES)", ES + "?step=s3",
      [R5["11"], R5["11.1"], R5["11.2"]],
      setup="document.querySelector('.tbl .cb').click(); await sleep(400); document.querySelector('.tbl .stp button[aria-label=減らす]').click(); await sleep(400); document.querySelector('.foot .btn.pri').click(); await sleep(500);", full=False, login="DR00041", today="2026/10/13"),
    V("020", "DA_ESDL_005", "③ 陳列完了バナー", "③ Banner hoàn tất trưng bày", ES + "?step=s3",
      [R5["1"], R5["4"], R5["8"], A("3.1", "陳列完了のバナー", "Banner hoàn tất trưng bày", ".banner", "area", "view", ["「商品の陳列が完了しました。」と完了時刻。差異・未確認があったときの自動の報告はトースト（報告の結果）で知らせる。", "「商品の陳列が完了しました。」 và giờ hoàn tất. Việc tự động báo khi có chênh lệch・chưa xác nhận được thông báo bằng toast (kết quả báo cáo)."])],
      setup=("const f=await api('flow',{staff:staff(),no:'DL-261012-0011'}); f.before=['/driver/photo.jpg']; f.stock.forEach(r=>r.ck=true); f.stockDone=true; f.stockAt='10-13（火） 9:30'; f.disp.forEach(r=>{r.ck=true});"
             "await api('finishDisp',{staff:staff(),no:'DL-261012-0011',flow:f,ack:false,offline:false}); await sync();"),
      login="DR00041", today="2026/10/13"),
]

# ---------------------------------------------------------------- DA_ESDL_006 ④ 陳列後
P4 = photo_screen("006", "陳列後", "Sau trưng bày", "アップロード（陳列後）", "Tải lên (sau trưng bày)")
VIEWS += [
    V("021", "DA_ESDL_006", "④ 陳列後・写真なし", "④ Sau trưng bày・chưa có ảnh", ES + "?step=s4", [x for x in P4 if x["no"] != "5.1"], login="DR00041", today="2026/10/13"),
    V("022", "DA_ESDL_006", "④ 陳列後・写真あり", "④ Sau trưng bày・đã có ảnh", ES + "?step=s4", [x for x in P4 if x["no"] in ("5", "5.1", "5.2", "7")],
      setup="await click('サンプル写真を追加');", login="DR00041", today="2026/10/13"),
]

# ---------------------------------------------------------------- DA_ESDL_007 ⑤ 集金登録・完了
def cash_items(has_cash=True, err_state=False):
    r = top("完了", "Hoàn tất") + [DCARD, STEPS]
    if has_cash:
        r += [
            A("4", "集金予定額", "Số tiền thu dự kiến", "input[aria-label=集金予定額]", "text", "view", ["この納品先の集金予定額（円）。読み取り専用。集金がある拠点（現金利用の契約）だけ出す。右寄せ・税込。", "Số tiền dự kiến thu của nơi nhận (yên). Chỉ đọc. Chỉ hiện với địa điểm có thu tiền (hợp đồng dùng tiền mặt). Căn phải・đã gồm thuế."],
              req="－", len="整数（円）", init=["集金予定額", "Số tiền thu dự kiến"], ex=["1,200", "Dự kiến thu 1.200 yên"]),
            A("5", "実集金額", "Số tiền thực thu", "input[aria-label^=実集金額]", "text", "input", [
                "実際に集金した額（円）。集金がある納品先は必須（台帳 E「集金は集金がある拠点だけ必須」）。集金できなかったときは 0 を入れる。数字だけ（全角は半角に直す）。右寄せ・税込。予定額と違えば差額の警告 W310（登録はできる）。",
                "Số tiền thực thu (yên). Bắt buộc với nơi nhận có thu tiền (台帳 E). Không thu được thì nhập 0. Chỉ số (đổi toàn góc sang nửa góc). Căn phải・đã gồm thuế. Khác số dự kiến thì cảnh báo chênh lệch W310 (vẫn đăng ký được)."],
              req="条件付き", cond=["集金予定額が 1 円以上のとき必須", "Bắt buộc khi số tiền thu dự kiến từ 1 yên"], len="整数 0〜999,999,999", init=["空（0 を薄く表示）", "Trống (hiện mờ số 0)"], ex=["1200", "Thu thực tế 1.200 yên"],
              valid=["数字だけ。0 以上 999,999,999 以下。集金ありで空は不可（E01）。", "Chỉ số. Từ 0 đến 999,999,999. Có thu tiền mà trống thì không được (E01)."], err=["E01", "E14", "E12"],
              demo_ok=["コードは「完了」を常に押せ、空だとサーバーが拒否してトーストで出す（H18・H17）。決定は完了の前にこの欄の下にインラインで E01 を出す（宿題）", "Code cho bấm 「完了」 bất cứ lúc nào và nếu trống thì server từ chối, hiện toast (H18・H17). Quyết định: hiện inline E01 dưới ô này trước khi hoàn tất (việc phải sửa)"]),
            A("5.1", "差額の警告", "Cảnh báo chênh lệch", ".err", "label", "view", ["実集金額が予定額と違うとき、欄の下に W310「集金予定額と実集金額が一致しません。差額は後日の精算で調整されます。」。", "Khi số tiền thực thu khác dự kiến, dưới ô hiện W310 「集金予定額と実集金額が一致しません。差額は後日の精算で調整されます。」."], err=["W310"],
              demo_ok=["コードは赤い文字で出す（エラーの形）。決定は警告（黄）で、登録はできる。色を警告に直す（宿題）", "Code hiện chữ đỏ (dạng lỗi). Quyết định là cảnh báo (vàng), vẫn đăng ký được. Sửa màu thành cảnh báo (việc phải sửa)"]),
        ]
    else:
        r += [A("4", "集金なしの案内", "Hướng dẫn không thu tiền", ".info.muted", "label", "view", ["集金がない納品先では集金の欄を出さず、「この納品先は集金がありません。「完了」を押して報告を終えてください。」と出す。ステップの帯の5つ目は「完了」。", "Nơi nhận không thu tiền thì không hiện mục thu tiền mà hiện 「この納品先は集金がありません。「完了」を押して報告を終えてください。」. Bước thứ 5 trên thanh các bước là 「完了」."])]
    r += [foot2("6", "戻る", "完了", note_ja="押すと完了の確認モーダル（No.7）。")]
    r += [
        A("7", "完了の確認モーダル", "Modal xác nhận hoàn tất", ".modal", "modal", "view", ["「配送を完了しますか？」。完了すると運営に配送完了を報告し、{日付}（完了から7日）まで内容を修正できる（Q314）。「完了する」「キャンセル」。二度押しで二重に報告しない。", "「配送を完了しますか？」. Hoàn tất thì báo cho vận hành và sửa được nội dung đến {ngày} (7 ngày sau hoàn tất) (Q314). 「完了する」「キャンセル」. Bấm 2 lần không báo trùng."], err=["Q314"]),
        A("7.1", "完了する", "Hoàn tất", ".modal .btn.pri", "button", "click", [
            "押すと完了を報告する（S314）。納品日より前でなければそのまま。前のステップが済んでいないときは E443（実際はステップ順にしか来られない）。オフラインなら端末に保存して「未送信」（W311）。完了後は詳細（陳列情報のタブ）へ戻る。",
            "Bấm để báo hoàn tất (S314). Nếu không phải trước ngày giao thì đi tiếp. Nếu các bước trước chưa xong thì E443 (thực tế chỉ đến được theo thứ tự bước). Offline thì lưu trên thiết bị thành 「未送信」 (W311). Sau hoàn tất quay về chi tiết (tab thông tin trưng bày)."], err=["S314", "E443", "W311"]),
        A("7.2", "キャンセル", "Hủy", ".modal .btn.sec", "button", "click", ["モーダルを閉じる。", "Đóng modal."]),
    ]
    return r


C1 = cash_items(True)
RC = reg(C1)
VIEWS += [
    V("023", "DA_ESDL_007", "⑤ 集金あり（予定額・実集金額・差額の警告）", "⑤ Có thu tiền (dự kiến・thực thu・cảnh báo chênh lệch)", ES + "?step=s5",
      [x for x in C1 if x["no"] not in ("7", "7.1", "7.2")], setup="setv(document.querySelector('input[aria-label^=実集金額]'),'1000'); await sleep(300);", login="DR00041", today="2026/10/13", note=STEP_NOTE),
    V("024", "DA_ESDL_007", "⑤ 集金なし（完了だけ）", "⑤ Không thu tiền (chỉ hoàn tất)", "/driver/es/DL-261013-0001?step=s5",
      [x for x in cash_items(False) if x["no"] not in ("7", "7.1", "7.2")], setup="await recvAll('WH00001'); await sync();", login="DR00001", today="2026/10/13",
      note=["自社ドライバー 田中（DR00001）・本社（集金なし）。ステップの帯の5つ目は「完了」。", "Tài xế nội bộ (DR00001), trụ sở chính (không thu tiền). Bước thứ 5 là 「完了」."]),
    V("025", "DA_ESDL_007", "⑤ 実集金額 未入力のエラー", "⑤ Lỗi chưa nhập số tiền thực thu", ES + "?step=s5",
      [RC["5"], RC["6"]], setup="holdToast(); document.querySelector('.foot .btn.pri').click(); await sleep(600); await click('完了する', document.querySelector('.modal')); await sleep(600);", login="DR00041", today="2026/10/13",
      note=["決定：集金ありで空のときは、実集金額の下に E01 を出して完了させない。コードは確認のあとサーバーが断り、トーストで出す（H18）。", "Quyết định: có thu tiền mà trống thì hiện E01 dưới ô số tiền thực thu và không cho hoàn tất. Code để server từ chối sau xác nhận rồi hiện toast (H18)."]),
    V("026", "DA_ESDL_007", "⑤ 完了の確認モーダル", "⑤ Modal xác nhận hoàn tất", ES + "?step=s5",
      [RC["7"], RC["7.1"], RC["7.2"]], setup="setv(document.querySelector('input[aria-label^=実集金額]'),'1200'); await sleep(300); document.querySelector('.foot .btn.pri').click(); await sleep(500);", full=False, login="DR00041", today="2026/10/13"),
    V("027", "DA_ESDL_001", "完了後の修正中（「完了後の修正中です」）", "Đang sửa sau hoàn tất (「完了後の修正中です」)", ES + "?tab=disp",
      [EDITNOTE, STEPS, foot2("7")], setup="await finishEs('DL-261012-0011',{}); await sync(); await click('① 陳列前写真'); await sleep(600);", login="DR00041", today="2026/10/13",
      note=["陳列情報タブの「① 陳列前写真」から修正に入った状態。完了から7日まで・トラブルがあれば不可。保存は S319（運営に通知）。", "Trạng thái vào sửa từ nút 「① 陳列前写真」 ở tab thông tin trưng bày. Đến 7 ngày sau hoàn tất, có sự cố thì không sửa được. Lưu: S319 (thông báo vận hành)."]),
    V("028", "DA_ESDL_001", "未送信（オフラインで完了）", "Chưa gửi (hoàn tất khi offline)", "/driver/es/DL-261013-0001",
      [R1["3"], R1["2"]],
      setup="await click('オフラインにする',document); await finishEs('DL-261013-0001',{early:'納品先から前日の納品を依頼された',offline:true}); await sync();", login="DR00001", today="2026/10/13",
      note=["オフラインのまま完了した配送。黄色のバナー「端末に保存しました（未送信）」と、バッジ「未送信」が付く。電波が戻ると再送する。再送がサーバーに拒否されたときの理由と、1件ずつの破棄は DA_HOME_001 No.8（P-OFFLINE）のとおり（受付簿 #443）。", "Đơn hoàn tất khi vẫn offline. Banner vàng 「端末に保存しました（未送信）」 và badge 「未送信」. Có sóng lại thì gửi lại. Lý do bị server từ chối khi gửi lại và việc hủy bỏ từng mục: theo DA_HOME_001 No.8 (P-OFFLINE) (受付簿 #443)."]),
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

_patch("9.3", "廃棄数（△）",
       demo=["コードの＋は理論在庫まで（`Math.min(r.th, …)`）。決定は 0〜9,999（宿題）", "Nút ＋ trong code chỉ tới tồn lý thuyết (`Math.min(r.th, …)`). Quyết định 0〜9.999 (việc phải sửa)"])
_patch("9.1", "確認（チェック）", demo=tapdemo("確認チェックは約28px で、＋−（約44px）より小さい", "Ô check xác nhận khoảng 28px, nhỏ hơn nút ＋− (khoảng 44px)"))
_patch("8.1", "確認（チェック）", demo=tapdemo("確認チェックは約28px", "Ô check xác nhận khoảng 28px"))
_patch("7", "次回納品日", demo=["次回納品日は小さな灰色の文字で目立たない。目的（賞味期限の確認）を一文で添えて強調する（画面の宿題：UI・役割レビュー #14）", "Ngày giao kế tiếp là chữ xám nhỏ, không nổi bật. Nên nhấn mạnh và thêm một câu về mục đích (kiểm tra hạn sử dụng) (việc phải sửa về UI; 役割レビュー #14)"])
_patch("6", "ご不明な点の案内", demo=["コードは番号を文字で出すだけで電話リンク（tel:）ではなく、数字の途中で改行する（宿題：役割レビュー #15）", "Code chỉ hiện số bằng chữ, không phải liên kết điện thoại (tel:) và xuống dòng giữa dãy số (việc phải sửa; 役割レビュー #15)"])
for _no in ("5.1", "5.1"):
    pass
_patch(None, "写真の削除", demo=tapdemo("写真の×は約14pxで、確認も取り消し（元に戻す）もない", "Nút × của ảnh khoảng 14px, không có xác nhận hay hoàn tác"))
_patch("5", "商品の検索", demo=['コードは入力のたびに絞る（Enter・検索キーを待たない）。台帳 M-1 は「検索／Enter を押してから絞る」。モバイルの即時絞り込みを例外にするかは hong に確認（役割レビュー Q10）。決まるまでは台帳どおりに書き、コードは宿題', 'Code lọc ngay mỗi lần gõ (không chờ Enter・phím tìm). 台帳 M-1: lọc sau khi bấm 「検索」/Enter. Có cho phép ngoại lệ lọc tức thời trên mobile không: hỏi hong (役割レビュー Q10). Khi chưa quyết thì viết theo 台帳, code là việc phải sửa'])
