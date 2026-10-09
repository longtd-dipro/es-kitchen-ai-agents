# -*- coding: utf-8 -*-
"""
ドライバーアプリ 受取（倉庫・中継先）（DA_RECV）の画面設計書データ。
元：本物の Web（app/driver/receive/page.tsx・app/driver/receive/hub/page.tsx・app/driver/_ui/ReceiveView.tsx・parts.tsx・lib/driver/{logic,area,fromDomain}.ts）。
決定の正：docs/決定台帳.md（B・E ドライバーの動き・F 2026-10-07・M-4「中継先での受取は箱ごと」。R の 2026-10-08：#435 数量の単位・#436 資料・#438 入力の途中・#446 E04）、受付簿 No.290〜292・#435・#436・#438・#446。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-4・§0・§4 open O1・O4・O8・回答）。法人へは受取を通知しない（台帳 B）。
撮影：スマホ幅 390×844。今日 2026/10/06。倉庫＝関東倉庫（WH00001）：佐々木（DR00022・1箱）、高橋 誠（DR00002・2箱）、山口 健（DR00014・委託）。中継先＝栄成ロジ 川崎デポ（HU00301）：栄成ロジ 山口（DR00011）。
画面：001 荷物受取（倉庫）／002 荷物受取（中継先）。
"""

TITLE = ["受取（倉庫・中継先）（DA_RECV）", "Nhận hàng (kho・trung chuyển) (DA_RECV)"]
SHEET = ["受取", "Nhận hàng"]
BASENAME = "画面設計書_DA_RECV_受取"
IMG_PREFIX = "DA_RECV"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_RECV_<画面番号>。001＝倉庫、002＝中継先（同じ部品 ReceiveView で type が違う）",
             "Screen Code theo 台帳 F (2026-10-07): DA_RECV_<số màn>. 001 = kho, 002 = trung chuyển (cùng component ReceiveView, khác type)"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00022"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_RECV 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。受取＝DA_RECV_001（倉庫）・DA_RECV_002（中継先）", "DA. Nhận hàng = DA_RECV_001 (kho)・DA_RECV_002 (trung chuyển)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-05", "target": "DA_RECV_001 No.12・DA_RECV_002", "q": ["足りないまま受取を完了するときの扱い・法人への通知", "Cách xử lý khi hoàn tất nhận hàng mà còn thiếu・thông báo cho pháp nhân"],
     "a": ["「ESキッチンへ連絡済」にチェックして「一部未受取のまま完了」。未受取分は自動でトラブル「箱数不足」として運営に出す（1件にまとめる）。倉庫での荷物受取を法人へ通知しない", "Check 「ESキッチンへ連絡済」 rồi 「一部未受取のまま完了」. Phần chưa nhận tự động báo vận hành thành sự cố 「箱数不足」 (gộp 1 mục). Không thông báo nhận hàng ở kho cho pháp nhân"],
     "src": "台帳 B・E・M-4（確認メモ_DW §6 で一致済み）"},
    {"date": "2026-10-01", "target": "DA_RECV_002 No.8", "q": ["中継先での受取の確かめ方", "Cách xác nhận khi nhận ở trung chuyển"],
     "a": ["箱ごとに確かめる。営業所名・住所・営業所コード・電話を表示し、電話はコピーできる。受取済になるのは ES アプリでの最初の受取（2次の中継先受取は区間の受取時刻だけ入る）", "Xác nhận theo từng thùng. Hiển thị tên văn phòng・địa chỉ・mã văn phòng・số điện thoại, số điện thoại sao chép được. Trạng thái 受取済 là lúc nhận đầu tiên trong app ES (nhận lần 2 ở trung chuyển chỉ ghi giờ nhận của chặng)"],
     "src": "台帳 M-4（改善案 A6）・配送_06 §11-4"},
    {"date": "2026-10-07", "target": "DA_RECV_002 No.4", "q": ["「資料（委託業者向け）」を自社ドライバーにも見せるか", "Có hiển thị tài liệu cho tài xế nội bộ không"],
     "a": ["自社ドライバーにも見せる（見ないと配送先に着けないため）。中継先の画面に出す（営業所止めの手順・駐車場案内など）。欄の名前「資料（委託業者向け）」はそのまま", "Hiển thị cả cho tài xế nội bộ (nếu không xem thì không đến được nơi giao). Hiện ở màn trung chuyển (thủ tục gửi văn phòng, hướng dẫn bãi đỗ...). Tên mục 「資料（委託業者向け）」 giữ nguyên"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #436・確認表 H-23）"},
    {"date": "2026-10-07", "target": "DA_RECV_001 No.9.1", "q": ["受取の一覧の数量の単位", "Đơn vị số lượng ở danh sách nhận hàng"],
     "a": ["箱 n・冷蔵 n個・冷凍 n個（「食」「品」は使わない。コードの「食」は直す）。受取・検品は個数で数える", "箱 n・冷蔵 n個・冷凍 n個 (không dùng 「食」「品」; sửa 「食」 trong code). Nhận・kiểm đếm theo số cái"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #435・確認表 H-22）"},
    {"date": "2026-10-07", "target": "DA_RECV 全体", "q": ["受取の入力途中（チェック）を再読み込み・離脱でどうするか", "Dữ liệu check đang dở khi tải lại・rời đi xử lý thế nào"],
     "a": ["画面を移っても残す。端末に保持し、離脱の確認（Q02）は出さない（未送信と同じ仕組み＝端末のブラウザ。共通パターン P-OFFLINE と同じ）。台帳 M-1「下書きは残さない」の例外。コードはメモリだけで再読み込みで消える", "Giữ khi chuyển màn hình. Giữ trên thiết bị, không hiện xác nhận rời đi (Q02) (cùng cơ chế với mục chưa gửi = trình duyệt của thiết bị; giống mẫu chung P-OFFLINE). Là ngoại lệ của 台帳 M-1 「下書きは残さない」. Code chỉ giữ trong bộ nhớ, tải lại là mất"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #438・確認表 H-26）"},
    {"date": "2026-10-08", "target": "DA_RECV 全体", "q": ["最大文字数を超えたときの動き（E04）", "Hành vi khi vượt số ký tự tối đa (E04)"],
     "a": ["入力欄の上限で止める（それ以上は打てない）。貼り付けのときだけ E04 を出す", "Chặn ở giới hạn của ô nhập (không gõ thêm được). Chỉ hiện E04 khi dán"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #446・確認表 X-5）"},
    {"date": "2026-10-07", "target": "緊急連絡先の番号", "q": ['緊急連絡先の番号は 050-5784-2777 と 050-3784-2771 のどちらか', 'Số liên hệ khẩn cấp là 050-5784-2777 hay 050-3784-2771'], "a": ['050-5784-2777 に統一する（設備不具合の報告先も同じ番号。050-3784-2771 は使わない）。コードの ES_TEL は宿題', 'Thống nhất 050-5784-2777 (số báo sự cố thiết bị cũng dùng số này; không dùng 050-3784-2771). ES_TEL trong code là việc phải sửa'], "src": "hong 回答 2026-10-07（確認メモ O1・B-13）"},
    {"date": "2026-10-07", "target": "資料（委託業者向け）の開き方", "q": ['資料をどう見るか', 'Xem tài liệu như thế nào'], "a": ['ドライバーはその場で見ることも、ファイルをダウンロードして端末に保存することもできる', 'Tài xế có thể xem trực tiếp hoặc tải file về lưu trên thiết bị'], "src": "hong 回答 2026-10-07（確認メモ O8・B-14）"},
    {"date": "2026-10-07", "target": "中継先で箱が足りないとき", "q": ['1次の運送会社（ヤマト）への問い合わせは誰が行うか', 'Ai liên hệ hãng vận chuyển chặng 1 (Yamato)'], "a": ['運営（システム管理）。ドライバーはトラブルの報告まで', 'Vận hành (quản trị hệ thống). Tài xế chỉ báo sự cố'], "src": "hong 回答 2026-10-07（確認メモ O4・B-17）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "DA_RECV_001", "ja": "荷物受取（倉庫）", "vi": "Nhận hàng (kho)"},
    {"code": "DA_RECV_002", "ja": "荷物受取（中継先）", "vi": "Nhận hàng (trung chuyển)"},
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
    "const fresh=async()=>{await fetch('/api/dev/reset',{method:'POST'});await fetch('/api/demo/today',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({date:'2026/10/06'})});await sync()};"
    "const checkAll=async(n)=>{let k=0;for(const e of document.querySelectorAll('.inv.tap')){if(n&&k>=n)break;e.click();k++;await sleep(250)}};"
)

WH = "/driver/receive?id=WH00001"
HUB = "/driver/receive/hub?id=HU00301"


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
    A("1", "上の帯", "Thanh trên", ".topbar", "area", "view", [
        "左に戻るボタン、真ん中に画面名「荷物受取」、右に「この配送のトラブルを報告」のボタン（この受取地点のトラブルの報告へ）。",
        "Trái là nút quay lại, giữa là tên màn hình 「荷物受取」, phải là nút 「この配送のトラブルを報告」 (sang báo sự cố của điểm nhận này)."]),
    A("1.1", "戻る", "Quay lại", ".topbar .rb.l", "button", "click", ["押すと前の画面（ホーム・配送一覧）へ戻る。", "Bấm để về màn trước (trang chủ・danh sách giao hàng)."]),
    A("1.2", "トラブルを報告", "Báo sự cố", ".topbar .rb.r", "button", "click", ["押すとこの受取地点のトラブル報告の内容入力（DA_RPTD_002・荷物受取時のトラブル）へ。送ったら元の画面へ戻る。", "Bấm để sang nhập nội dung báo sự cố của điểm nhận này (DA_RPTD_002・sự cố khi nhận hàng). Gửi xong quay lại màn trước."]),
    A("2", "完了のバナー", "Banner hoàn tất", ".banner", "area", "view", [
        "受取を完了したあと上に出す緑の帯「荷物の受取は完了しました。」と完了時刻（「…に受取済」）。同じ日の2回目以降は「（n回目）」を付ける。オフラインで完了したときは黄色で「端末に保存しました（未送信）。電波が戻ると送ります」（W311）。",
        "Dải xanh phía trên sau khi hoàn tất nhận hàng 「荷物の受取は完了しました。」 kèm giờ (「…に受取済」). Từ lần 2 trong ngày thêm 「（n回目）」. Hoàn tất lúc offline thì màu vàng 「端末に保存しました（未送信）。電波が戻ると送ります」 (W311)."], err=["W311"]),
    A("3", "受取地点の札", "Thẻ điểm nhận", ".dcard", "area", "view", [
        "受取地点（倉庫・中継先）の名前・日付（今日）・状態のバッジ・社数／箱／冷蔵／冷凍の合計・コード・郵便番号・住所・電話。中継先は名前のあとに「中継先」の札。数量の単位は「箱 n・冷蔵 n個・冷凍 n個」（「食」「品」は使わない：hong 2026-10-08・受付簿 #435）。",
        "Tên điểm nhận (kho/trung chuyển), ngày (hôm nay), badge trạng thái, tổng số công ty/thùng/lạnh/đông, mã, mã bưu chính, địa chỉ, điện thoại. Trung chuyển có nhãn 「中継先」 sau tên. Đơn vị số lượng 「箱 n・冷蔵 n個・冷凍 n個」 (không dùng 「食」「品」: hong 2026-10-08, 受付簿 #435)."],
      demo_ok=["コードの合計は「社・箱・食・食」（冷蔵・冷凍の単位が「食」）。「個」に直す（H19・受付簿 #435）", "Tổng trong code là 「社・箱・食・食」 (đơn vị lạnh・đông là 「食」). Sửa thành 「個」 (H19・受付簿 #435)"]),
    A("3.1", "状態のバッジ", "Badge trạng thái", ".dcard .bdg", "label", "view", ["未受取（黄）／受取済（緑）。足りないまま完了して未解決のトラブルがあれば「トラブルあり」、オフラインで送れていなければ「未送信」を並べる。", "未受取 (vàng)/受取済 (xanh lá). Hoàn tất khi còn thiếu và có sự cố chưa giải quyết thì thêm 「トラブルあり」; chưa gửi do offline thì 「未送信」."]),
    A("3.2", "コード", "Mã", ".dcard .meta:nth-child(4)", "label", "view", ["倉庫は「倉庫コード WH…」、中継先は「営業所コード HU…」。マスタの ID。", "Kho: 「倉庫コード WH…」, trung chuyển: 「営業所コード HU…」. Là ID trong master."]),
    A("3.3", "住所", "Địa chỉ", ".dcard .meta:nth-child(6)", "label", "view", ["受取地点の住所（都道府県から）。ない場合は「—」。", "Địa chỉ điểm nhận (từ tỉnh/thành). Không có thì 「—」."]),
    A("3.4", "電話番号・コピー", "Điện thoại・sao chép", ".dcard .mini", "button", "click", [
        "受取地点の電話番号と「コピー」。押すと番号をクリップボードにコピーして「{番号} をコピーしました」とトーストを出す（コピーできない端末では「電話番号：{番号}」）。",
        "Số điện thoại điểm nhận và 「コピー」. Bấm để sao chép số vào clipboard và hiện toast 「{số} をコピーしました」 (thiết bị không sao chép được thì hiện 「電話番号：{số}」)."]),
    A("4", "資料（委託業者向け）", "Tài liệu (dành cho đơn vị ủy thác)", ".info::拠点・中継先マスタ", "area", "view", [
        "中継先の画面だけ、自社ドライバーにも委託ドライバーにも出す（見ないと配送先に着けないため：hong 2026-10-08・受付簿 #436。欄の名前「資料（委託業者向け）」は変えない）。営業所止めの手順・駐車場案内など、中継先マスタの「地点の資料」の名前と「開く」。資料はその場で見ることも、ファイルをダウンロードして端末に保存することもできる（hong 2026-10-07）。資料がなければ「この地点の資料はありません。」（I316）。",
        "Chỉ ở màn trung chuyển, hiện cho cả tài xế nội bộ lẫn tài xế ủy thác (nếu không xem thì không đến được nơi giao: hong 2026-10-08, 受付簿 #436; tên mục 「資料（委託業者向け）」 giữ nguyên). Tên và nút 「開く」 của 「地点の資料」 trong master trung chuyển như thủ tục gửi văn phòng, hướng dẫn bãi đỗ. Xem trực tiếp hoặc tải file về lưu trên thiết bị đều được (hong 2026-10-07). Không có thì 「この地点の資料はありません。」 (I316)."],
      err=["I316"],
      demo_ok=["資料は拠点・中継先マスタにつないでいない（H10）。資料がある状態は撮れない（宿題）。コードは委託ドライバーにだけ欄を出す。決定は自社にも出す（宿題・受付簿 #436）", "Tài liệu chưa nối với master địa điểm・trung chuyển (H10). Không chụp được trạng thái có tài liệu (việc phải sửa). Code chỉ hiện mục cho tài xế ủy thác; quyết định là hiện cả cho nội bộ (việc phải sửa; 受付簿 #436)"]),
    A("5", "同じ日の再受取の注記", "Ghi chú nhận lại trong ngày", ".note2", "label", "view", [
        "同じ日に同じ地点で2回目以降の受取のとき、「同じ日の{n}回目の受取です。追加の荷物をチェックしてください。」（I312）。追加の荷物は「追加」の札を付けて出す。",
        "Khi nhận lần 2 trở đi trong ngày ở cùng điểm: 「同じ日の{n}回目の受取です。追加の荷物をチェックしてください。」 (I312). Hàng bổ sung có nhãn 「追加」."], err=["I312"]),
    A("6", "トラブル報告済みの枠", "Khung sự cố đã báo", ".trbox", "area", "view", [
        "この受取地点で報告したトラブル（時刻・種類）。「一部未受取のまま完了」で自動報告した「箱数不足（自動）」もここに出る。未解決は赤・解決済みは緑。",
        "Các sự cố đã báo ở điểm nhận này (giờ, loại). Mục 「箱数不足（自動）」 tự động báo qua 「一部未受取のまま完了」 cũng hiện ở đây. Chưa giải quyết đỏ・đã giải quyết xanh."]),
    A("7", "荷物受取一覧", "Danh sách nhận hàng", ".h3::荷物受取一覧", "label", "view", ["受取地点から運ぶ配送（納品先）ごとに箱（送り状番号）を並べる。並びは 納品先（配送）→ 送り状番号。", "Xếp thùng (số phiếu gửi) theo từng đơn giao (nơi nhận) chở từ điểm nhận. Thứ tự: nơi nhận (đơn giao) → số phiếu gửi."]),
    A("7.1", "未確認のみ表示", "Chỉ hiện mục chưa xác nhận", ".chk::未確認のみ表示", "check", "check", ["オンにすると、まだチェックしていない箱だけ出す。受取済みのあとは出さない。同日の再受取を始めるとオンになる。", "Bật thì chỉ hiện thùng chưa check. Sau khi nhận xong thì không hiện. Bật tự động khi bắt đầu nhận lại trong ngày."], req="－", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
    A("8", "検索", "Tìm kiếm", ".search input", "text", "input", ["納品先の名前・送り状番号の部分一致で絞る。「検索」キー（キーボード）／Enter を押してから絞る（台帳 M-1。入力のたびには絞らない）。", "Lọc theo khớp một phần tên nơi nhận・số phiếu gửi; lọc sau khi bấm phím 「検索」 (bàn phím)/Enter (台帳 M-1; không lọc mỗi lần gõ)."],
      req="－", len="文字列 60", ex=["DL-261005-0002", "Số phiếu gửi hoặc tên nơi nhận (ví dụ 「ことぶき」)"], valid=["前後の空白を取る。全角の英数は半角にして比べる。60文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Bỏ khoảng trắng đầu/cuối. Đổi chữ/số toàn góc sang nửa góc rồi so sánh. Tối đa 60 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["E04"]),
    A("9", "配送ごとの束", "Nhóm theo đơn giao", ".pk", "area", "view", [
        "納品先の札（ES配送便は青・COOL便は紫）：納品先の名前・住所の先頭・箱／冷蔵／冷凍。その下に箱の行（通し番号・送り状番号・チェック）。",
        "Thẻ nơi nhận (ES配送便 xanh・COOL便 tím): tên nơi nhận・đầu địa chỉ・thùng/lạnh/đông. Dưới là các dòng thùng (số thứ tự・số phiếu gửi・check)."],
      demo_ok=["コードの束の見出しは冷蔵・冷凍を「食」と書く。「個」に直す（H19・受付簿 #435）", "Tiêu đề nhóm trong code ghi lạnh・đông là 「食」. Sửa thành 「個」 (H19・受付簿 #435)"]),
    A("9.1", "荷物の行", "Dòng hàng", ".inv.tap", "area", "click", ["箱ごとの行。行のどこを押してもチェックが入る／外れる（押せる範囲を広くした：RV-DRIVER-20261002）。受取済みのあとは押せない。送り状番号は ES が採番した「配送No-箱番号」か運送会社の送り状番号。", "Dòng theo từng thùng. Bấm chỗ nào trên dòng cũng bật/tắt check (mở rộng vùng bấm: RV-DRIVER-20261002). Sau khi nhận xong không bấm được. Số phiếu gửi là 「配送No-số thùng」 do ES cấp hoặc số phiếu của hãng vận chuyển."]),
    A("9.2", "チェック（受け取った）", "Check (đã nhận)", ".inv .cb", "check", "check", ["受け取った箱にチェック。すべてチェックして「完了」なら確認なしで完了、足りないときは確認のモーダル（No.12）。", "Check thùng đã nhận. Check hết rồi 「完了」 thì hoàn tất không cần xác nhận, còn thiếu thì hiện modal xác nhận (No.12)."], req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
    A("9.3", "追加の札", "Nhãn bổ sung", ".tag::追加", "label", "view", ["同日の再受取で足した箱に付ける。", "Gắn vào thùng thêm ở lần nhận lại trong ngày."]),
    A("10", "追加の荷物を受け取る（同日・再受取）", "Nhận thêm hàng (cùng ngày・nhận lại)", ".btn.sec::追加の荷物を受け取る", "button", "click", [
        "受取済みのあとだけ出す。押すと同じ日の2回目の受取を始める（受取の回数が1つ増え、追加の荷物のチェックを待つ状態に戻る）。トースト「追加の荷物を受け取れる状態にしました。」。",
        "Chỉ hiện sau khi nhận xong. Bấm để bắt đầu lần nhận thứ 2 trong cùng ngày (số lần nhận tăng 1, quay lại trạng thái chờ check hàng bổ sung). Toast 「追加の荷物を受け取れる状態にしました。」."]),
    A("11", "下のボタン", "Nút dưới", ".foot", "area", "view", ["受取前だけ出す「完了」。受取済みのあとは出さない。", "Chỉ hiện 「完了」 trước khi nhận. Sau khi nhận xong không hiện."]),
    A("11.1", "完了", "Hoàn tất", ".foot .btn.pri", "button", "click", [
        "すべての箱にチェックがあれば確認なしで完了する（S312）。足りなければ確認のモーダル（No.12）。完了すると受取地点が「受取済」になり、運営に受取を報告する（法人へは通知しない）。オフラインなら端末に保存して「未送信」（W311）。二度押しで二重に報告しない。",
        "Nếu mọi thùng đã check thì hoàn tất không cần xác nhận (S312). Còn thiếu thì modal xác nhận (No.12). Hoàn tất thì điểm nhận thành 「受取済」 và báo nhận hàng cho vận hành (không thông báo cho pháp nhân). Offline thì lưu trên thiết bị thành 「未送信」 (W311). Bấm 2 lần không báo trùng."], err=["S312", "W311"]),
    A("12", "一部未受取のまま完了（確認モーダル）", "Hoàn tất khi còn thiếu (modal xác nhận)", ".modal", "modal", "view", [
        "「荷物の受取は完了しましたか？」。一部の荷物が未確認であること、未受取分はトラブル（箱数不足）として運営に自動で報告されることを伝える。「未受取分は、ESキッチンへ連絡済みです。」にチェックしないと「一部未受取のまま完了」は押せない。",
        "「荷物の受取は完了しましたか？」. Thông báo còn thùng chưa xác nhận, phần chưa nhận tự động báo vận hành thành sự cố (thiếu thùng). Phải check 「未受取分は、ESキッチンへ連絡済みです。」 mới bấm được 「一部未受取のまま完了」."], err=["Q310"]),
    A("12.1", "連絡済みのチェック", "Check đã liên hệ", ".modal .chk", "check", "check", ["「未受取分は、ESキッチンへ連絡済みです。」。オンにすると完了を押せる（台帳 E「連絡済みが必須」）。", "「未受取分は、ESキッチンへ連絡済みです。」. Bật thì bấm được nút hoàn tất (台帳 E: bắt buộc đã liên hệ)."], req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
    A("12.2", "ESへ電話する", "Gọi ES", ".modal .btn.pri", "button", "click", [
        "押すと端末の電話で緊急連絡先を発信する（tel:）。発信した事実を運営に記録する（REQ-DL-652・配送_06 §12-3）。番号は 050-5784-2777 に統一する（hong 2026-10-07）。",
        "Bấm để gọi số liên hệ khẩn cấp bằng điện thoại (tel:). Ghi lại việc đã gọi cho vận hành (REQ-DL-652・配送_06 §12-3). Số thống nhất 050-5784-2777 (hong 2026-10-07)."],
      demo_ok=["コードはトーストに番号を出すだけで発信しない（H11）", "Code chỉ hiện số trong toast chứ không gọi (H11)"]),
    A("12.3", "一部未受取のまま完了", "Hoàn tất còn thiếu", ".modal .btn.soft", "button", "click", [
        "チェック後に押せる。未受取分を自動でトラブル「箱数不足」として運営に報告し、受取を完了する（S313）。中継先で足りないとき、1次の運送会社（ヤマト）への問い合わせは運営（システム管理）が行う。ドライバーはトラブルの報告まで（hong 2026-10-07）。",
        "Bấm được sau khi check. Tự động báo phần chưa nhận thành sự cố 「箱数不足」 cho vận hành và hoàn tất nhận hàng (S313). Khi thiếu ở trung chuyển, vận hành (quản trị hệ thống) liên hệ hãng vận chuyển chặng 1 (Yamato). Tài xế chỉ báo sự cố (hong 2026-10-07)."],
      err=["S313"]),
    A("12.4", "キャンセル", "Hủy", ".modal .btn.sec", "button", "click", ["モーダルを閉じる。チェックは残る。", "Đóng modal. Check được giữ nguyên."]),
    A("13", "0件の表示", "Hiển thị 0 dòng", ".empty", "label", "view", ["絞り込みで1つも出ないとき「未確認の荷物はありません。」。", "Khi lọc không còn dòng nào hiện 「未確認の荷物はありません。」."], err=["I01"],
      demo_ok=["コードの文は「未確認の荷物はありません。」。I01 に揃えるか、この場面の専用の文にするか phiên gộp で決める", "Câu trong code là 「未確認の荷物はありません。」. Phiên gộp quyết định thống nhất theo I01 hay dùng câu riêng cho tình huống này"]),
])


def pick(*nos):
    return [R[n] for n in nos]


TOP = ("1", "1.1", "1.2")
VIEWS = [
    V("001", "DA_RECV_001", "初期（受取地点・荷物受取一覧・送り状番号のチェック）", "Ban đầu (điểm nhận・danh sách nhận hàng・check số phiếu gửi)", WH,
      pick(*TOP, "3", "3.1", "3.2", "3.3", "3.4", "7", "7.1", "8", "9", "9.1", "9.2", "11", "11.1"), login="DR00022", today="2026/10/06",
      note=["佐々木（DR00022）・今日 2026/10/06・関東倉庫（1箱）。まだ受け取っていない。", "Sasaki (DR00022), hôm nay 2026/10/06, kho Kanto (1 thùng). Chưa nhận."]),
    V("002", "DA_RECV_001", "検索・「未確認のみ表示」", "Tìm kiếm・「未確認のみ表示」", WH,
      pick("7.1", "8", "13"), setup="await click('未確認のみ表示'); await sleep(300); setv(document.querySelector('.search input'),'あああ'); await sleep(400);", login="DR00022", today="2026/10/06",
      note=["一致する荷物がないので 0 件の表示になる。", "Không có hàng khớp nên hiển thị 0 dòng."]),
    V("003", "DA_RECV_001", "一部だけチェック →「一部未受取のまま完了」モーダル（連絡済みチェック＋ESへ電話する）", "Check một phần → modal 「一部未受取のまま完了」 (check đã liên hệ + gọi ES)", WH,
      pick("12", "12.1", "12.2", "12.3", "12.4"), setup="document.querySelector('.inv.tap').click(); await sleep(400); document.querySelector('.foot .btn.pri').click(); await sleep(500);", full=False, login="DR00002", today="2026/10/06",
      note=["高橋 誠（DR00002）・関東倉庫（2箱）。1箱だけチェックして「完了」を押した。", "Takahashi Makoto (DR00002), kho Kanto (2 thùng). Check 1 thùng và bấm 「完了」."]),
    V("004", "DA_RECV_001", "全部チェック → 完了（トースト）", "Check hết → hoàn tất (toast)", WH,
      pick("2", "9.1", "9.2"), setup="holdToast(); await checkAll(); document.querySelector('.foot .btn.pri').click(); await sleep(1500);", login="DR00022", today="2026/10/06",
      note=["すべてチェックして「完了」を押した直後。確認なしで完了し、トースト S312 を出す。", "Ngay sau khi check hết và bấm 「完了」. Hoàn tất không cần xác nhận, hiện toast S312."]),
    V("005", "DA_RECV_001", "受取済（完了バナー・追加の荷物を受け取る）", "Đã nhận (banner hoàn tất・nhận thêm hàng)", WH,
      pick(*TOP, "2", "3", "3.1", "9", "9.1", "10"), login="DR00022", today="2026/10/06",
      note=["完了後の画面。チェックは押せない。「追加の荷物を受け取る（同日・再受取）」が出る。", "Màn sau hoàn tất. Không bấm check được. Hiện 「追加の荷物を受け取る（同日・再受取）」."]),
    V("006", "DA_RECV_001", "同じ日の2回目の受取", "Lần nhận thứ 2 trong cùng ngày", WH,
      pick("5", "7.1", "9", "9.2", "11.1"), setup="holdToast(); await click('追加の荷物を受け取る'); await sleep(600);", login="DR00022", today="2026/10/06",
      note=["「追加の荷物を受け取る」を押した直後。「同じ日の2回目の受取です」と出て、チェックを待つ状態に戻る。", "Ngay sau khi bấm 「追加の荷物を受け取る」. Hiện 「同じ日の2回目の受取です」 và quay lại trạng thái chờ check."]),
    V("007", "DA_RECV_001", "トラブル報告済みの枠（箱数不足を自動で報告）", "Khung sự cố đã báo (tự động báo thiếu thùng)", WH,
      pick("2", "3.1", "6"), setup="await fresh(); await recvAll('WH00001', 1); await sync();", login="DR00002", today="2026/10/06",
      note=["2箱のうち1箱だけ受け取って完了した。未受取分がトラブル「箱数不足（自動）」として運営に出て、この枠に表示される。", "Chỉ nhận 1 trong 2 thùng rồi hoàn tất. Phần chưa nhận được báo vận hành thành sự cố 「箱数不足（自動）」 và hiện trong khung này."]),
    V("008", "DA_RECV_001", "未送信（オフラインで完了）", "Chưa gửi (hoàn tất khi offline)", WH,
      pick("2", "3.1"), setup="await fresh(); holdToast(); await click('オフラインにする',document); await checkAll(); document.querySelector('.foot .btn.pri').click(); await sleep(1500);", login="DR00014", today="2026/10/06",
      note=["山口 健（DR00014）・関東倉庫。オフラインにして受取を完了した。黄色のバナーとバッジ「未送信」。電波が戻ると再送する。再送がサーバーに拒否されたときの理由と、1件ずつの破棄は DA_HOME_001 No.8（P-OFFLINE）のとおり（受付簿 #443）。", "Yamaguchi Ken (DR00014), kho Kanto. Chuyển offline rồi hoàn tất nhận hàng. Banner vàng và badge 「未送信」. Có sóng lại thì gửi lại. Lý do bị server từ chối khi gửi lại và việc hủy bỏ từng mục: theo DA_HOME_001 No.8 (P-OFFLINE) (受付簿 #443)."]),
    V("009", "DA_RECV_002", "初期（営業所コード・電話のコピー・箱ごとのチェック）", "Ban đầu (mã văn phòng・sao chép điện thoại・check từng thùng)", HUB,
      pick(*TOP, "3", "3.1", "3.2", "3.3", "3.4", "7", "8", "9", "9.1", "9.2", "11", "11.1"), setup="await fresh();", login="DR00011", today="2026/10/06",
      note=["栄成ロジ 山口（DR00011）・川崎デポ（中継先）。1次のドライバーが運んでくる荷物を、箱ごとに確かめて受け取る。", "Eisei Logi Yamaguchi (DR00011), kho trung chuyển Kawasaki. Nhận hàng do tài xế chặng 1 chở đến, xác nhận từng thùng."]),
    V("010", "DA_RECV_002", "資料（委託業者向け）", "Tài liệu (dành cho đơn vị ủy thác)", HUB, pick("4"), login="DR00011", today="2026/10/06",
      note=["自社ドライバーにも委託ドライバーにも出る欄（見ないと配送先に着けないため）。資料は中継先マスタにつないでいないので、いまは「資料はありません」。", "Mục hiện cho cả tài xế nội bộ lẫn ủy thác (nếu không xem thì không đến được nơi giao). Chưa nối tài liệu trong master trung chuyển nên hiện 「資料はありません」."]),
    V("011", "DA_RECV_002", "受取済（中継先）", "Đã nhận (trung chuyển)", HUB,
      pick("2", "3", "3.1", "9", "10"), setup="await recvAll('HU00301'); await sync();", login="DR00011", today="2026/10/06",
      note=["中継先で受取を完了した状態。受取済になるのは ES アプリでの最初の受取。2次の中継先受取は区間の受取時刻だけ入る。", "Trạng thái sau khi hoàn tất nhận ở trung chuyển. 受取済 là lúc nhận đầu tiên trong app ES. Nhận lần 2 ở trung chuyển chỉ ghi giờ nhận của chặng."]),
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

_patch("8", "検索", demo=['コードは入力のたびに絞る（Enter・検索キーを待たない）。台帳 M-1 は「検索／Enter を押してから絞る」。モバイルの即時絞り込みを例外にするかは hong に確認（役割レビュー Q10）。決まるまでは台帳どおりに書き、コードは宿題', 'Code lọc ngay mỗi lần gõ (không chờ Enter・phím tìm). 台帳 M-1: lọc sau khi bấm 「検索」/Enter. Có cho phép ngoại lệ lọc tức thời trên mobile không: hỏi hong (役割レビュー Q10). Khi chưa quyết thì viết theo 台帳, code là việc phải sửa'])
_patch("3.4", "電話番号・コピー", demo=tapdemo("「コピー」は約23px", "Nút 「コピー」 khoảng 23px"))
