# -*- coding: utf-8 -*-
"""
ドライバーアプリ COOL便（DA_COOL）の画面設計書データ。
元：本物の Web（app/driver/cool/[id]/page.tsx・app/driver/_ui/{parts,EtaCard}.tsx・lib/driver/{logic,area,fromDomain}.ts）。
決定の正：docs/決定台帳.md（B 駐車報告・E ドライバーの動き・F 2026-10-07・M-4「COOL便とドライバー」。R の 2026-10-08：#434 完了後のトラブル報告・#435 数量の単位・#436 資料・#446 E04）、受付簿 No.290〜292・#434〜#436・#446。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-3・§0・§3 宿題 H8・§4 open O5・回答）。
撮影の注意：見本データの COOL便は運送会社（ヤマト）が運ぶのでアプリを通らない。この設計書の撮影では、見本の千葉営業所の COOL便の区間を自社ドライバー（高橋 誠・DR00002）に割り当てる
  ローカルだけの変更（lib/domain/seed/org.ts の CP0000006・コミットしない）を入れて撮った（確認メモ「B 段階：自分で決めたこと」B-1）。
撮影：スマホ幅 390×844。今日 2026/10/14（納品日の当日）と 2026/10/27（納品日の前日に受け取り）。
"""

TITLE = ["COOL便（DA_COOL）", "COOL便 (DA_COOL)"]
SHEET = ["COOL便", "COOL便"]
BASENAME = "画面設計書_DA_COOL_COOL便"
IMG_PREFIX = "DA_COOL"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_COOL_<画面番号>。COOL便は詳細の1画面。一覧（COOL便）は配送一覧（DA_HOME_002）の便の種類での絞り込みで、専用の画面はない",
             "Screen Code theo 台帳 F (2026-10-07): DA_COOL_<số màn>. COOL便 chỉ có 1 màn chi tiết. Danh sách COOL便 là bộ lọc loại chuyến của 配送一覧 (DA_HOME_002), không có màn riêng"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00002"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_COOL 全体", "q": ["ドライバーアプリの Screen Code", "Screen Code của ứng dụng tài xế"],
     "a": ["DA。COOL便＝DA_COOL_001（詳細）", "DA. COOL便 = DA_COOL_001 (chi tiết)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_COOL_001 No.5・No.14", "q": ["駐車報告は COOL便にも要るか", "COOL便 có cần báo cáo đỗ xe không"],
     "a": ["要る（ES配送便・COOL便の両方）。COOL便の詳細に「駐車報告」のタブを足す。入れ方は ES配送便と同じ（レシート＋料金・両方必須・完了から7日まで修正可）", "Cần (cả ES配送便 và COOL便). Thêm tab 「駐車報告」 vào chi tiết COOL便. Cách nhập giống ES配送便 (hóa đơn + phí, bắt buộc cả hai, sửa được đến 7 ngày sau hoàn tất)"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW04・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-07", "target": "DA_COOL_001 No.10", "q": ["到着予定の共有（時間帯）を残すか", "Có giữ chia sẻ giờ đến dự kiến không"],
     "a": ["持たない。COOL便の詳細の到着予定カードは削除する（お届け日だけ）", "Không giữ. Xóa thẻ giờ đến dự kiến ở chi tiết COOL便 (chỉ ngày giao)"], "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW05・台帳 F）"},
    {"date": "2026-10-07", "target": "DA_COOL_001 No.11.2・11.3", "q": ["COOL便の完了後の修正（7日・トラブルがあれば不可）", "Sửa COOL便 sau hoàn tất (7 ngày・có sự cố thì không sửa được)"],
     "a": ["ES配送便と同じ：完了から7日まで修正できる。トラブルの報告がある配送は修正できない（台帳 E）。コードの COOL便は期限・トラブルの確認がない（宿題 H8）", "Giống ES配送便: sửa được đến 7 ngày sau hoàn tất. Đơn có báo sự cố thì không sửa được (台帳 E). COOL便 trong code chưa kiểm tra hạn・sự cố (việc phải sửa H8)"],
     "src": "台帳 E（2026-10-02 hong 回答）。COOL への適用は Claude 推奨・hong 確認待ち（確認メモ_DW §3 H8）"},
    {"date": "2026-10-07", "target": "DA_COOL_001 No.13", "q": ["一部未配送のまま完了するときの動き", "Hoạt động khi hoàn tất mà còn kiện chưa giao"],
     "a": ["「ESキッチンへ連絡済みです。」にチェックしないと「一部未配送のまま完了」を押せない。未配送分はトラブルとして運営に自動で報告し、運営が再配送を手配する（仕様修正点 No.8・台帳 M-4）", "Phải check 「ESキッチンへ連絡済みです。」 mới bấm được 「一部未配送のまま完了」. Phần chưa giao tự động báo vận hành thành sự cố và vận hành sắp xếp giao lại (仕様修正点 No.8・台帳 M-4)"],
     "src": "台帳 E・M-4（確認メモ_DW §6 で一致済み）"},
    {"date": "2026-10-07", "target": "DA_COOL_001 No.8.1", "q": ["荷物情報の数量の単位", "Đơn vị số lượng ở thông tin hàng hóa"],
     "a": ["箱 n・冷蔵 n個・冷凍 n個（「食」「品」は使わない。コードの「品」は直す）", "箱 n・冷蔵 n個・冷凍 n個 (không dùng 「食」「品」; sửa 「品」 trong code)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #435・確認表 H-22）"},
    {"date": "2026-10-07", "target": "DA_COOL_001 No.7", "q": ["「資料（委託業者向け）」を自社ドライバーにも見せるか", "Có hiển thị tài liệu cho tài xế nội bộ không"],
     "a": ["自社ドライバーにも見せる（見ないと配送先に着けないため）。欄の名前「資料（委託業者向け）」はそのまま", "Hiển thị cả cho tài xế nội bộ (nếu không xem thì không đến được nơi giao). Tên mục 「資料（委託業者向け）」 giữ nguyên"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #436・確認表 H-23）"},
    {"date": "2026-10-08", "target": "DA_COOL_001 No.1.2", "q": ["配送を完了したあとでもトラブルを報告できるか", "Sau khi hoàn tất giao hàng có báo sự cố được không"],
     "a": ["完了から7日まで報告できる（完了後7日の修正と同じ期限）。7日を過ぎたら ES へ電話 → 運営が代理登録。運営の「要確認」の流れは ES配送便（DA_ESDL_001 No.1.2）と同じ", "Báo được đến 7 ngày sau hoàn tất (cùng hạn với việc sửa sau hoàn tất). Quá 7 ngày thì gọi điện cho ES → vận hành đăng ký thay. Luồng 「要確認」 của vận hành giống ES配送便 (DA_ESDL_001 No.1.2)"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #459・確認表 H-20。#434 の「完了後も報告できる」を置き換え）。置き換えた旧決定：台帳 F「配送できなかったとき（ドライバー）」の「トラブル報告は完了の前だけ」"},
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

SCREENS = [{"code": "DA_COOL_001", "ja": "COOL便 詳細", "vi": "Chi tiết COOL便"}]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const btn=(t,sc)=>[...(sc||document.querySelector('.app')||document).querySelectorAll('button,a,label,.chk,.noti,[role=button]')].find(b=>(b.textContent||'').trim().includes(t));"
    "const click=async(t,sc)=>{const b=btn(t,sc);if(!b)throw new Error('no button '+t);b.click();await sleep(450)};"
    "const holdToast=()=>{if(window.__ht)return;window.__ht=1;const o=window.setTimeout;window.setTimeout=(f,t,...a)=>t===3000?0:o(f,t,...a)};"
    "const api=async(op,args)=>{const r=await fetch('/api/ops/area/driver/'+op,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'driver'},body:JSON.stringify({args:args??null})});const j=r.status===204?null:await r.json().catch(()=>null);if(!r.ok)throw new Error(op+' '+r.status);return j};"
    "const staff=()=>sessionStorage.getItem('driver.session');"
    "const sync=async()=>{document.dispatchEvent(new Event('visibilitychange'));await sleep(900)};"
    "const until=async(fn,ms)=>{const t=Date.now();while(Date.now()-t<(ms||10000)){try{if(await fn())return true}catch(e){}await sleep(300)}return false};"
    "const recvAll=async(pt)=>{await until(async()=>(await api('day',{staff:staff()})).points.some(x=>x.id===pt));const d=await api('day',{staff:staff()});const recv={};d.dels.filter(x=>x.pt===pt).forEach(x=>x.inv.forEach(i=>{recv[x.no+'|'+i.no]=true}));return api('receive',{staff:staff(),pt,recv,ack:false,offline:false})};"
    "const checkAll=async()=>{for(const e of document.querySelectorAll('.inv.tap')){e.click();await sleep(250)}};"
)

NO = "DL-261013-0003"
NO2 = "DL-261027-0003"
URL = "/driver/cool/" + NO
URL2 = "/driver/cool/" + NO2


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
        "左に戻るボタン、真ん中に画面名「COOL便」、右に「この配送のトラブルを報告」のボタン（サイレンの絵）。",
        "Trái là nút quay lại, giữa là tên màn hình 「COOL便」, phải là nút 「この配送のトラブルを報告」 (hình còi báo)."],
      demo_ok=["コードは完了後の画面名が「荷物受取」になる（COOL便のままにする。宿題）", "Code đổi tên màn thành 「荷物受取」 sau hoàn tất (giữ nguyên 「COOL便」; việc phải sửa)"]),
    A("1.1", "戻る", "Quay lại", ".topbar .rb.l", "button", "click", ["押すと前の画面へ戻る（履歴がなければホーム）。", "Bấm để về màn trước (không có lịch sử thì về trang chủ)."]),
    A("1.2", "トラブルを報告", "Báo sự cố", ".topbar .rb.r", "button", "click", [
        "押すとこの配送のトラブル報告の内容入力（DA_RPTD_002）へ。配送を完了したあとも、完了から7日まで報告できる（完了後7日の修正と同じ期限：hong 2026-10-08・受付簿 #459）。7日を過ぎた配送ではこのボタンを出さず、ES へ電話 → 運営が代理登録する。完了後の報告も完了前と同じ流れで運営の「要確認」に載り、運営が解決する（必要なら「配送できなかった」で閉じる：運営Web 側は運営D。DA_ESDL_001 No.1.2 と同じ）。トラブルの報告がある配送は、完了後に修正できなくなる（E440：台帳 E）。アプリを開いたまま、完了から7日を過ぎた配送に報告を送ったときは、トースト E452「完了から7日を過ぎたため報告できません。ESへお電話ください。」を出す（受付簿 #474）。トラブルがあっても、修正できなくなるのは「トラブルに関わる部分だけ」で、ほかの部分は直せる。止めるのは運営がトラブルの解決を登録してから（報告しただけでは止めない：台帳 F・R、受付簿 #471）。",
        "Bấm để sang nhập nội dung báo sự cố của đơn này (DA_RPTD_002). Sau khi hoàn tất giao hàng vẫn báo được đến 7 ngày sau hoàn tất (cùng hạn với việc sửa sau hoàn tất: hong 2026-10-08, 受付簿 #459). Quá 7 ngày thì không hiện nút này mà gọi điện cho ES → vận hành đăng ký thay. Báo sau hoàn tất cũng vào 「要確認」 của vận hành theo cùng luồng như trước hoàn tất, vận hành giải quyết (nếu cần thì đóng thành 「配送できなかった」: phía Web vận hành thuộc 運営D; giống DA_ESDL_001 No.1.2). Đơn đã có báo sự cố thì không sửa được sau hoàn tất (E440: 台帳 E). Nếu mở sẵn app và gửi báo cáo cho đơn đã quá 7 ngày sau hoàn tất thì hiện toast E452 「完了から7日を過ぎたため報告できません。ESへお電話ください。」 (受付簿 #474). Khi có sự cố, chỉ phần liên quan đến sự cố là không sửa được; các phần khác vẫn sửa được. Chỉ khóa sau khi vận hành đăng ký giải quyết sự cố (chỉ báo thì chưa khóa: 台帳 F・R, 受付簿 #471)."],
      err=["E452", "E440"]),
    A("2", "納品先の札", "Thẻ nơi nhận", ".dcard", "area", "view", [
        "納品先の名前・配送No・日付（今日）・状態のバッジ。COOL便は紫の札（ES配送便は青）。バッジは未配送／配送完了・トラブルあり・未送信。",
        "Tên nơi nhận, 配送No, ngày (hôm nay), badge trạng thái. COOL便 dùng thẻ tím (ES配送便 xanh dương). Badge: 未配送/配送完了・トラブルあり・未送信."]),
    A("3", "完了のバナー", "Banner hoàn tất", ".banner", "area", "view", [
        "完了したあと上に出す緑の帯「荷物の配送は完了しました。」と完了時刻（「…に配送済」）。オフラインで完了したときは黄色で「端末に保存しました（未送信）。電波が戻ると送ります」（W311）。",
        "Dải xanh phía trên sau khi hoàn tất 「荷物の配送は完了しました。」 kèm giờ hoàn tất (「…に配送済」). Hoàn tất lúc offline thì màu vàng 「端末に保存しました（未送信）。電波が戻ると送ります」 (W311)."], err=["W311"]),
    A("4", "トラブル報告済みの枠", "Khung sự cố đã báo", ".trbox", "area", "view", [
        "この配送に報告したトラブル（時刻・種類・備考）。未解決は赤い「トラブル報告済み（運営の確認待ち）」、運営が解決を記録すると緑の「トラブル報告（解決済）」。「一部未配送のまま完了」で自動報告したものは「（自動）」を付ける。",
        "Các sự cố đã báo cho đơn này (giờ, loại, ghi chú). Chưa giải quyết: 「トラブル報告済み（運営の確認待ち）」 đỏ; vận hành ghi nhận giải quyết thì 「トラブル報告（解決済）」 xanh. Mục tự động báo qua 「一部未配送のまま完了」 có gắn 「（自動）」."]),
    A("5", "タブ（基本情報・駐車報告）", "Tab (thông tin cơ bản・báo cáo đỗ xe)", "-", "tab", "click", [
        "決定（台帳 F 2026-10-07）：COOL便にも駐車報告を入れる。詳細に「基本情報」「駐車報告」の2つのタブを置く（ES配送便の「陳列情報」はない）。タブは URL（?tab=）に持つ。",
        "Quyết định (台帳 F 2026-10-07): COOL便 cũng có báo cáo đỗ xe. Chi tiết có 2 tab 「基本情報」「駐車報告」 (không có 「陳列情報」 như ES配送便). Tab giữ trong URL (?tab=)."],
      demo_ok=["コードの COOL便の詳細にはタブがなく、駐車報告もない（宿題・Q-DW04）", "Chi tiết COOL便 trong code không có tab và không có báo cáo đỗ xe (việc phải sửa・Q-DW04)"]),
    A("6", "納品先情報", "Thông tin nơi nhận", ".info::郵便番号", "area", "view", [
        "納品先の名前・郵便番号・住所・担当者・電話番号・受取時間帯（複数あればすべて）・納品条件・納品備考（代替品の指示など）。ES配送便の詳細（DA_ESDL_001 No.6）と同じ。",
        "Tên nơi nhận, mã bưu chính, địa chỉ, người phụ trách, số điện thoại, khung giờ nhận (hiện tất cả nếu có nhiều), điều kiện giao, ghi chú giao hàng (chỉ thị hàng thay thế...). Giống chi tiết ES配送便 (DA_ESDL_001 No.6)."]),
    A("7", "資料（委託業者向け）", "Tài liệu (dành cho đơn vị ủy thác)", ".info::拠点・中継先マスタ", "area", "view", [
        "自社ドライバーにも委託ドライバーにも出す（見ないと配送先に着けないため：hong 2026-10-08・受付簿 #436。欄の名前「資料（委託業者向け）」は変えない）。拠点・中継先マスタの資料の名前と「開く」。資料はその場で見ることも、ファイルをダウンロードして端末に保存することもできる（hong 2026-10-07）。資料がなければ「この地点の資料はありません。」（I316）。",
        "Hiện cho cả tài xế nội bộ lẫn tài xế ủy thác (nếu không xem thì không đến được nơi giao: hong 2026-10-08, 受付簿 #436; tên mục 「資料（委託業者向け）」 giữ nguyên). Tên và nút 「開く」 của tài liệu trong master địa điểm・trung chuyển. Xem trực tiếp hoặc tải file về lưu trên thiết bị đều được (hong 2026-10-07). Không có tài liệu thì 「この地点の資料はありません。」 (I316)."], err=["I316"],
      demo_ok=["資料はまだつないでいない（H10）。コードは委託ドライバーにだけ欄を出す。決定は自社にも出す（宿題・受付簿 #436）。この設計書の撮影は自社ドライバーで、コードでは欄が出ない", "Tài liệu chưa được nối (H10). Code chỉ hiện mục cho tài xế ủy thác; quyết định là hiện cả cho nội bộ (việc phải sửa; 受付簿 #436). Ảnh chụp dùng tài xế nội bộ nên trong code không hiện mục này"]),
    A("8", "荷物情報", "Thông tin hàng hóa", ".pk", "area", "view", [
        "この配送の荷物（箱）の一覧。送り状番号は ES が採番した「配送No-箱番号」か運送会社の送り状番号（自社・委託が運ぶ COOL便の送り状番号は ES が採番する「配送No-箱番号」：hong 2026-10-07 確定）。並びは送り状番号の順。",
        "Danh sách hàng (thùng) của đơn này. Số phiếu gửi là 「配送No-số thùng」 do ES cấp hoặc số phiếu của hãng vận chuyển (số phiếu COOL便 do tài xế nội bộ/ủy thác chở do ES cấp dạng 「配送No-số thùng」: hong 2026-10-07 đã chốt). Thứ tự theo số phiếu."]),
    A("8.1", "箱・冷蔵・冷凍の数", "Số thùng・lạnh・đông", ".pk .hd", "label", "view", [
        "箱の数・冷蔵の数・冷凍の数。単位は「箱 n・冷蔵 n個・冷凍 n個」（「食」「品」は使わない：hong 2026-10-08・受付簿 #435）。", "Số thùng・số hàng lạnh・số hàng đông. Đơn vị 「箱 n・冷蔵 n個・冷凍 n個」 (không dùng 「食」「品」: hong 2026-10-08, 受付簿 #435)."],
      demo_ok=["コードは冷蔵・冷凍を「品」と書く（H19）", "Code ghi lạnh・đông là 「品」 (H19)"]),
    A("8.2", "荷物の行（送り状番号）", "Dòng hàng (số phiếu gửi)", ".inv.tap", "area", "click", [
        "箱ごとの行（通し番号・送り状番号・チェック）。行のどこを押してもチェックが入る／外れる。受け取っていない箱は「未受取」の札を付けてチェックできない。完了後は直せるとき（修正中）以外は押せない。",
        "Dòng theo từng thùng (số thứ tự・số phiếu gửi・check). Bấm chỗ nào trên dòng cũng bật/tắt check. Thùng chưa nhận có nhãn 「未受取」 và không check được. Sau hoàn tất chỉ bấm được khi đang sửa."]),
    A("8.3", "チェック（渡した）", "Check (đã giao)", ".inv .cb", "check", "check", [
        "渡した箱にチェック。1つもチェックしないと「完了」を押せない（E444）。全部チェックなら確認なしで完了、一部だけなら確認のモーダル（No.13）。",
        "Check các thùng đã giao. Không check cái nào thì không bấm được 「完了」 (E444). Check hết thì hoàn tất không cần xác nhận, check một phần thì hiện modal xác nhận (No.13)."],
      req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"], err=["E444"]),
    A("8.4", "未受取の札", "Nhãn chưa nhận", ".nrtag", "label", "view", ["荷物受取で受け取っていない箱に付ける。受け取るまで配送でチェックできない。", "Gắn vào thùng chưa nhận ở màn nhận hàng. Chưa nhận thì không check được ở màn giao."]),
    A("9", "修正の案内", "Hướng dẫn sửa", "p.hint::まで内容を修正できます", "label", "view", [
        "完了後に出す「{日付} まで内容を修正できます。」（完了から7日）。トラブルに関わる部分は修正できない（E440。ほかの部分は直せる。止めるのは運営の解決後：受付簿 #471）。7日を過ぎたら E439。",
        "Hiện sau hoàn tất 「{ngày} まで内容を修正できます。」 (7 ngày sau hoàn tất). Phần liên quan đến sự cố không sửa được (E440; phần khác vẫn sửa được; chỉ khóa sau khi vận hành giải quyết: 受付簿 #471). Quá 7 ngày thì E439."], err=["E439", "E440"],
      demo_ok=["コードは期限・トラブルの確認をしない（H8）", "Code chưa kiểm tra hạn・sự cố (H8)"]),
    A("10", "到着予定のカード（削除）", "Thẻ giờ đến dự kiến (đã xóa)", "-", "area", "view", [
        "削除する。到着予定の時間帯は持たない（お届け日だけ）。決定：hong 2026-10-07（台帳 F）。", "Xóa. Không giữ khung giờ dự kiến (chỉ ngày giao). Quyết định: hong 2026-10-07 (台帳 F)."],
      demo_ok=["コードにはまだ到着予定のカードがある（EtaCard。宿題・Q-DW05）", "Code vẫn còn thẻ giờ đến dự kiến (EtaCard; việc phải sửa・Q-DW05)"]),
    A("11", "下のボタン", "Nút dưới", ".foot", "area", "view", [
        "完了前：「完了」。受け取っていないときは I310 の文と押せない「完了」。完了後：「内容を修正する」。修正中は「キャンセル」「修正を保存」（S319）。",
        "Trước hoàn tất: 「完了」. Chưa nhận thì câu I310 và nút 「完了」 không bấm được. Sau hoàn tất: 「内容を修正する」. Khi đang sửa: 「キャンセル」「修正を保存」 (S319)."], err=["I310", "S319"]),
    A("11.1", "完了", "Hoàn tất", ".foot .btn.pri", "button", "click", [
        "1つ以上チェックすると押せる。全部チェック済みなら確認なしで完了を報告（S314）。一部だけならモーダル（No.13）。納品日より前なら先に確認のモーダル（No.12）。オフラインなら端末に保存して「未送信」（W311）。完了後は同じ画面に戻る。",
        "Bấm được khi check ít nhất 1. Check hết thì báo hoàn tất không cần xác nhận (S314). Chỉ một phần thì modal (No.13). Trước ngày giao thì hiện modal xác nhận trước (No.12). Offline thì lưu trên thiết bị thành 「未送信」 (W311). Sau hoàn tất ở lại cùng màn hình."], err=["S314", "W311"]),
    A("11.2", "内容を修正する", "Sửa nội dung", ".foot .btn.sec", "button", "click", ["完了後に出す。押すと荷物のチェックを直せる状態（修正中）にする。", "Hiện sau hoàn tất. Bấm để chuyển sang trạng thái sửa được check hàng (đang sửa)."]),
    A("11.3", "キャンセル／修正を保存", "Hủy / Lưu chỉnh sửa", ".foot", "area", "view", [
        "修正中の下のボタン。「キャンセル」は修正を捨ててサーバーの内容に戻す。「修正を保存」は内容を保存して運営に通知する（S319）。運営が完了後の実績を直していて同時に保存したときは E31（警告・上書きできる）。",
        "Nút dưới khi đang sửa. 「キャンセル」 bỏ chỉnh sửa và quay về nội dung trên server. 「修正を保存」 lưu và thông báo vận hành (S319). Nếu vận hành đang sửa kết quả sau hoàn tất và lưu cùng lúc thì E31 (cảnh báo, ghi đè được)."], err=["S319", "E31"]),
    A("12", "納品日より前の確認", "Xác nhận trước ngày giao", ".modal", "modal", "view", [
        "納品日より前に納品するとき（受け取り済み・納品日が先）、「納品日（{日付}）より前です」。今日納品してよいか納品先とESキッチンに確認し、理由（500文字まで）を入れて「確認して納品する」。理由が空だと押せない。詳細は ES配送便（DA_ESDL_001 No.12）と同じ。",
        "Khi giao trước ngày giao (đã nhận, ngày giao còn xa) hiện 「納品日（{ngày}）より前です」. Xác nhận với nơi nhận và ES Kitchen, nhập lý do (tối đa 500 ký tự) rồi 「確認して納品する」. Lý do trống thì không bấm được. Chi tiết giống ES配送便 (DA_ESDL_001 No.12)."], err=["Q313"]),
    A("12.1", "前に納品する理由", "Lý do giao sớm", ".modal textarea", "textarea", "input", ["納品日より前に納品する理由。運営の記録に残る。", "Lý do giao sớm hơn ngày giao. Được ghi cho vận hành."],
      req="○", len="文字列 500", ex=["納品先から前日の納品を頼まれた", "Nơi nhận nhờ giao trước 1 ngày"], valid=["空は不可。前後の空白を取る。500文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Không được trống. Bỏ khoảng trắng đầu/cuối. Tối đa 500 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."], err=["E01", "E04"],
      demo_ok=["コードの上限は 200 文字（H2）。500 に揃える（宿題）", "Giới hạn trong code là 200 ký tự (H2). Thống nhất 500 (việc phải sửa)"]),
    A("13", "一部未配送のまま完了（確認モーダル）", "Hoàn tất khi còn kiện chưa giao (modal xác nhận)", ".modal", "modal", "view", [
        "「配送を完了しますか？」。渡せていない荷物があること、未配送分はトラブルとして運営に自動で報告され運営が再配送を手配することを伝える。「ESキッチンへ連絡済みです。」にチェックしないと「一部未配送のまま完了」は押せない。",
        "「配送を完了しますか？」. Thông báo còn hàng chưa giao, phần chưa giao tự động báo vận hành thành sự cố và vận hành sắp xếp giao lại. Phải check 「ESキッチンへ連絡済みです。」 mới bấm được 「一部未配送のまま完了」."], err=["Q311"]),
    A("13.1", "連絡済みのチェック", "Check đã liên hệ", ".modal .chk", "check", "check", ["「ESキッチンへ連絡済みです。」。オンにすると完了を押せる。", "「ESキッチンへ連絡済みです。」. Bật thì bấm được nút hoàn tất."], req="○", init=["オフ", "Tắt"], ex=["オン", "Bật"]),
    A("13.2", "ESへ電話する", "Gọi ES", ".modal .btn.pri", "button", "click", [
        "押すと端末の電話で緊急連絡先を発信する（tel:）。発信した事実を運営に記録する（REQ-DL-652・配送_06 §12-3）。番号は 050-5784-2777 に統一する（hong 2026-10-07）。",
        "Bấm để gọi số liên hệ khẩn cấp bằng điện thoại (tel:). Ghi lại việc đã gọi cho vận hành (REQ-DL-652・配送_06 §12-3). Số thống nhất 050-5784-2777 (hong 2026-10-07)."],
      demo_ok=["コードはトーストに番号を出すだけで発信しない（H11）", "Code chỉ hiện số trong toast chứ không gọi (H11)"]),
    A("13.3", "一部未配送のまま完了", "Hoàn tất còn kiện chưa giao", ".modal .btn.soft", "button", "click", ["チェック後に押せる。未配送分を自動でトラブル（種別は運営が解決のときに付ける）として報告し、完了する（S314）。", "Bấm được sau khi check. Tự động báo phần chưa giao thành sự cố (loại do vận hành gắn sau) và hoàn tất (S314)."], err=["S314"]),
    A("14", "駐車報告", "Báo cáo đỗ xe", "-", "area", "view", [
        "COOL便にも置く。入力の項目・チェック・保存・修正の期限は ES配送便の駐車報告（DA_ESDL_001 No.9）と同じ：レシートの写真（必須）・駐車料金（必須・税込・0〜999,999,999円）・保存（S01）。完了から7日まで修正できる。駐車料金は集金とは別（所属先が立て替えを精算）。",
        "Cũng đặt ở COOL便. Mục nhập・kiểm tra・lưu・hạn sửa giống báo cáo đỗ xe của ES配送便 (DA_ESDL_001 No.9): ảnh hóa đơn (bắt buộc)・phí đỗ xe (bắt buộc・đã gồm thuế・0〜999.999.999 yên)・lưu (S01). Sửa được đến 7 ngày sau hoàn tất. Phí đỗ xe tách khỏi thu tiền (đơn vị trực thuộc quyết toán khoản tạm ứng)."], err=["S01", "E442"],
      demo_ok=["コードの COOL便には駐車報告がない（宿題・Q-DW04）。ES配送便の駐車報告（DA_ESDL_001）を COOL便にも置く", "COOL便 trong code chưa có báo cáo đỗ xe (việc phải sửa・Q-DW04). Đặt báo cáo đỗ xe của ES配送便 (DA_ESDL_001) cho cả COOL便"]),
])


def pick(*nos):
    return [R[n] for n in nos]


HEAD = ("1", "1.1", "1.2", "2")
VIEWS = [
    V("001", "DA_COOL_001", "荷物を受け取っていない（完了できない）", "Chưa nhận hàng (không hoàn tất được)", URL,
      pick(*HEAD, "5", "6", "8", "8.1", "8.2", "8.4", "10", "11"), login="DR00002", today="2026/10/14",
      note=["高橋 誠（DR00002）・今日 2026/10/14・千葉営業所の COOL便（見本では運送会社の便だが、撮影用に自社に割り当てた）。関東倉庫でまだ荷物を受け取っていない。",
            "Takahashi Makoto (DR00002), hôm nay 2026/10/14, COOL便 chi nhánh Chiba (dữ liệu mẫu là chuyến của hãng vận chuyển, đã gán cho nội bộ để chụp). Chưa nhận hàng ở kho Kanto."]),
    V("002", "DA_COOL_001", "受取済・チェックなし（完了は押せない）", "Đã nhận・chưa check (không bấm được 「完了」)", URL,
      pick("8.2", "8.3", "11", "11.1", "7"), setup="await recvAll('WH00001'); await sync();", login="DR00002", today="2026/10/14",
      note=["荷物受取を完了したあと。チェックを1つも入れていないので「完了」は押せない。", "Sau khi hoàn tất nhận hàng. Chưa check cái nào nên không bấm được 「完了」."]),
    V("003", "DA_COOL_001", "一部チェック →「一部未配送のまま完了」モーダル（連絡済みチェック）", "Check một phần → modal 「一部未配送のまま完了」 (check đã liên hệ)", URL,
      pick("13", "13.1", "13.2", "13.3"), setup="document.querySelector('.inv.tap').click(); await sleep(400); document.querySelector('.foot .btn.pri').click(); await sleep(500);",
      full=False, login="DR00002", today="2026/10/14"),
    V("004", "DA_COOL_001", "全チェック → 完了（モーダルなし・トースト）", "Check hết → hoàn tất (không modal・toast)", URL,
      pick("3", "8.3", "11", "11.2"), setup="holdToast(); await checkAll(); document.querySelector('.foot .btn.pri').click(); await sleep(1500);", login="DR00002", today="2026/10/14",
      note=["2箱ともチェックして「完了」を押した直後。確認なしで完了し、トースト S314 を出す。", "Ngay sau khi check cả 2 thùng và bấm 「完了」. Hoàn tất không cần xác nhận, hiện toast S314."]),
    V("005", "DA_COOL_001", "完了後（バナー・「内容を修正する」・{日付}まで）", "Sau hoàn tất (banner・「内容を修正する」・đến {ngày})", URL,
      pick(*HEAD, "3", "9", "11", "11.2"), login="DR00002", today="2026/10/14",
      note=["完了後。チェックは押せない。「内容を修正する」で直せる（完了から7日まで・トラブルがなければ）。", "Sau hoàn tất. Không bấm check được. Bấm 「内容を修正する」 để sửa (đến 7 ngày sau hoàn tất, nếu không có sự cố)."]),
    V("006", "DA_COOL_001", "完了後の修正中", "Đang sửa sau hoàn tất", URL,
      pick("8.2", "8.3", "11.3"), setup="await click('内容を修正する'); await sleep(400);", login="DR00002", today="2026/10/14",
      note=["「内容を修正する」を押した直後。荷物のチェックを直し、「修正を保存」で運営に通知する。", "Ngay sau khi bấm 「内容を修正する」. Sửa check hàng và bấm 「修正を保存」 để thông báo vận hành."]),
    V("007", "DA_COOL_001", "駐車報告（決定：COOL便にも置く）", "Báo cáo đỗ xe (quyết định: đặt cả ở COOL便)", URL,
      pick("5", "14"), login="DR00002", today="2026/10/14",
      note=["決定の画面。コードにはまだなく、画面の絵は撮れない（ES配送便の駐車報告 DA_ESDL_001 の絵と同じ形で作る）。", "Màn theo quyết định. Code chưa có nên không chụp được hình (làm cùng dạng với hình báo cáo đỗ xe của ES配送便 DA_ESDL_001)."]),
    V("008", "DA_COOL_001", "納品日より前の確認モーダル（理由必須）", "Modal xác nhận trước ngày giao (bắt buộc lý do)", URL2,
      pick("12", "12.1"), setup="await recvAll('WH00001'); await sync(); document.querySelector('.inv.tap').click(); await sleep(400); document.querySelector('.foot .btn.pri').click(); await sleep(500);",
      full=False, login="DR00002", today="2026/10/27",
      note=["今日 2026/10/27・納品日は翌日（10-28）の COOL便を今日受け取り、1箱チェックして「完了」を押した。", "Hôm nay 2026/10/27, nhận COOL便 có ngày giao là ngày mai (10-28), check 1 thùng và bấm 「完了」."]),
    V("009", "DA_COOL_001", "トラブル報告済みの枠（未解決）", "Khung sự cố đã báo (chưa giải quyết)", URL2,
      pick("4", "2"), setup="await api('reportTrouble',{staff:staff(),target:'d:" + NO2 + "',type:'不在・連絡不可',nos:[],note:'受付が不在で渡せなかった',photos:0,offline:false}); await sync();",
      login="DR00002", today="2026/10/27"),
    V("010", "DA_COOL_001", "未送信（オフラインで完了）", "Chưa gửi (hoàn tất khi offline)", URL2,
      pick("3", "2"), setup=("await click('オフラインにする',document); const d=await api('day',{staff:staff()}); const x=d.dels.find(q=>q.no==='" + NO2 + "'); const ck={}; x.inv.forEach(i=>ck[i.no]=true);"
                             "await api('completeCool',{staff:staff(),no:'" + NO2 + "',ck,ack:true,early:'納品先から前日の納品を依頼された',offline:true}); await sync();"),
      login="DR00002", today="2026/10/27",
      note=["オフラインのまま完了した COOL便。黄色のバナーとバッジ「未送信」。電波が戻ると再送する。再送がサーバーに拒否されたときの理由と、1件ずつの破棄は DA_HOME_001 No.8（P-OFFLINE）のとおり（受付簿 #443）。", "COOL便 hoàn tất khi vẫn offline. Banner vàng và badge 「未送信」. Có sóng lại thì gửi lại. Lý do bị server từ chối khi gửi lại và việc hủy bỏ từng mục: theo DA_HOME_001 No.8 (P-OFFLINE) (受付簿 #443)."]),
]
