# -*- coding: utf-8 -*-
"""
ドライバーアプリ ホーム・配送一覧（DA_HOME）の画面設計書データ。
元：本物の Web（app/driver/page.tsx・app/driver/list/page.tsx・app/driver/_ui/{parts,DriverShell,DriverProvider}.tsx・lib/driver/{fromDomain,logic,area}.ts）。
決定の正：docs/決定台帳.md（B・E・F・K・L・M-3・M-4。特に F の 2026-10-07：Screen Code＝DA、配送一覧は期間を選べる、到着予定の時間帯は持たない、未送信は端末（IndexedDB）に保持。R の 2026-10-08：#428 お知らせ・#435 数量の単位・#437 スマホ幅だけ・#443 再送の拒否・#444 配送できなかった・#455 廃棄の入力元）、受付簿 No.290〜292・#428・#435・#437・#443・#444・#455・#456。
確認メモ：docs/05_画面設計書/確認メモ_DW_ドライバー.md（1-1・§0・§2・§3 宿題・§4 open・回答）。コードがまだ決定に追いついていないところは demo_ok（宿題）に理由を書いた。
撮影：スマホ幅 390×844（VIEWPORT）。デモの「今日」は 2026/10/05 が既定。納品がある状態は today 2026/10/06 の高橋 誠（DR00002）で撮る。
"""

TITLE = ["ホーム・配送一覧（DA_HOME）", "Trang chủ・Danh sách giao hàng (DA_HOME)"]
SHEET = ["ホーム・配送一覧", "Trang chủ・Danh sách"]
BASENAME = "画面設計書_DA_HOME_ホーム・配送一覧"
IMG_PREFIX = "DA_HOME"
OUT_DIR = "ドライバーアプリ"
CODE_NOTE = ["Screen Code は台帳 F（2026-10-07）の決まり：DA_<機能の略>_<3桁>（DA＝ドライバーアプリ）。ES配送便・COOL便の一覧は配送一覧（DA_HOME_002）を便の種類で絞る形で、専用の画面はない",
             "Screen Code theo 台帳 F (2026-10-07): DA_<viết tắt chức năng>_<3 chữ số> (DA = ứng dụng tài xế). Danh sách ES配送便・COOL便 là 配送一覧 (DA_HOME_002) lọc theo loại chuyến, không có màn riêng"]
SITE = "driver"
SYSTEM = {"ja": "ドライバーアプリ", "vi": "Ứng dụng tài xế (ドライバーアプリ)"}
AUTHOR = "Claude／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "driver", "loginId": "DR00002"}
VIEWPORT = (390, 844)
CODE_PATHS = ["app/driver", "lib/driver", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "DA_HOME_001〜002 全体", "q": ["ドライバーアプリの Screen Code は DW か DA か", "Screen Code của ứng dụng tài xế là DW hay DA"],
     "a": ["DA（ドライバーアプリ）。機能の略は HOME・ESDL・COOL・RECV・STCK・RPTD・MANU・NOTI・AUTH", "DA (ứng dụng tài xế). Viết tắt chức năng: HOME, ESDL, COOL, RECV, STCK, RPTD, MANU, NOTI, AUTH"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW01・台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "DA_HOME_002 No.2.2・No.6・No.8", "q": ["配送一覧に期間の指定を足すか。並べ替え・ページ送りはどうするか", "Có thêm chọn khoảng thời gian cho 配送一覧 không; sắp xếp・phân trang thế nào"],
     "a": ["期間を選べる（初期は今日・参照は90日前まで・完了後7日は修正できる）。並べ替え・ページ送りは台帳 F の標準（1ページ10件・10／20／50／100）", "Chọn được khoảng thời gian (mặc định hôm nay, xem được đến 90 ngày trước, sửa được trong 7 ngày sau khi hoàn tất). Sắp xếp・phân trang theo chuẩn 台帳 F (10 dòng/trang; 10/20/50/100)"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW02・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-07", "target": "DA_HOME_001 No.4.3・DA_HOME_002 No.7.2", "q": ["到着予定の時間帯を持つか", "Có giữ khung giờ dự kiến đến không"],
     "a": ["持たない（お届け日だけ）。カードの「到着予定 …（共有済み）」の行は出さない", "Không giữ (chỉ ngày giao). Không hiện dòng 「到着予定 …（共有済み）」 trên thẻ"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW05・台帳 F）"},
    {"date": "2026-10-07", "target": "DA_HOME_001 No.2.6", "q": ["マニュアルはアプリの中の文章か、リンクか", "Manual là văn bản trong app hay là link"],
     "a": ["リンク（URL）。運営Web の設定画面に置き、システム管理が変える。ホームの「マニュアル」ボタンはそのリンクを開く（DA_MANU）", "Link (URL). Đặt ở màn cài đặt của Web vận hành, quản trị hệ thống thay đổi. Nút 「マニュアル」 ở trang chủ mở link đó (DA_MANU)"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW06・台帳 F）"},
    {"date": "2026-10-07", "target": "DA_HOME_001 No.7・DA_HOME_002 No.10", "q": ["オフラインで送れなかった報告はどこに持つか", "Báo cáo không gửi được khi offline giữ ở đâu"],
     "a": ["端末のブラウザ（IndexedDB）に保持し、ログインし直したら再送する。画面の上に「オフライン・未送信 N件」と「再送する」を出す", "Giữ trong trình duyệt trên thiết bị (IndexedDB), gửi lại sau khi đăng nhập lại. Trên đầu màn hình hiện 「オフライン・未送信 N件」 và nút 「再送する」"],
     "src": "hong 回答 2026-10-07（確認メモ_DW Q-DW08・台帳 F・受付簿 No.292）"},
    {"date": "2026-10-07", "target": "DA_HOME_001〜002 全体", "q": ["PC 幅（900px 以上）の左メニューを設計書に含めるか（Q-DW15）", "Có đưa menu trái cho màn PC (≥900px) vào thiết kế không (Q-DW15)"],
     "a": ["含めない。設計書はスマホ幅だけ（PC 幅の左メニューは参考で書かない）", "Không. Thiết kế chỉ cho chiều rộng điện thoại (menu trái PC chỉ tham khảo, không viết)"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #437・確認表 H-24）"},
    {"date": "2026-10-07", "target": "DA_HOME_001 No.4.1・4.3・5.1", "q": ["カードの数量の単位（食／個／品）", "Đơn vị số lượng trên thẻ (食/個/品)"],
     "a": ["箱 n・冷蔵 n個・冷凍 n個（商品の数の合計＝現場で数える単位）。「食」「品」は使わない。コードのカードは「食」", "箱 n・冷蔵 n個・冷凍 n個 (tổng số sản phẩm = đơn vị đếm thực tế). Không dùng 「食」「品」. Thẻ trong code đang ghi 「食」"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #435・確認表 H-22。台帳 M-1 の単位の定義どおり）"},
    {"date": "2026-10-07", "target": "DA_HOME_001 No.3・DA_HOME_002 No.7", "q": ["ホームの一覧の件数・並び（Q-DW14）", "Số dòng・thứ tự danh sách trang chủ (Q-DW14)"],
     "a": ["ホームは1日分を全件表示（ページ送りなし）。並びは受取地点 → お届け日 → 配送No。配送一覧の初期の並びは受取時間帯の早い順", "Trang chủ hiện toàn bộ trong ngày (không phân trang). Thứ tự: điểm nhận → ngày giao → 配送No. Thứ tự mặc định của 配送一覧 là giờ nhận sớm trước"],
     "src": "Claude 推奨・hong 確認待ち（確認メモ_DW Q-DW14）。トラブル対象の一覧（1日分）が全件表示なのは hong 確定（2026-10-08・受付簿 #437）"},
    {"date": "2026-10-08", "target": "DA_HOME_001 No.8", "q": ["未送信の再送がサーバーに拒否されたとき、どう見せるか。破棄できるか", "Khi gửi lại mục chưa gửi bị server từ chối thì hiển thị thế nào. Có hủy bỏ được không"],
     "a": ["理由を種類ごとに出す（割当の解除・配送の取消・完了から7日の超過・トラブルで修正不可・ログイン切れ）。「未送信 N件」は1件ずつ破棄できる（確認つき）。別のドライバーが同じ端末に入ったときの名義は #462 ① で確定（下）", "Hiển thị lý do theo từng loại (bị gỡ phân công・đơn bị hủy・quá 7 ngày sau hoàn tất・có sự cố nên không sửa được・hết phiên đăng nhập). Cho hủy bỏ từng mục trong 「未送信 N件」 (có xác nhận). Tên người dùng khi tài xế khác đăng nhập cùng máy đã quyết ở #462 ① (bên dưới)"],
     "src": "hong 回答 2026-10-08（台帳 S・受付簿 #443・確認表 X-1）"},
    {"date": "2026-10-08", "target": "DA_HOME_001 No.4.3・DA_HOME_002 No.7.1", "q": ["運営が閉じた配送（配送できなかった）の見せ方", "Cách hiển thị đơn do vận hành đóng (配送できなかった)"],
     "a": ["専用の状態「配送できなかった」とし、完了済みのタブ（配送完了）に入れる", "Dùng trạng thái riêng 「配送できなかった」 và xếp vào tab đã xong (配送完了)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #444・確認表 X-2）"},
    {"date": "2026-10-08", "target": "DA_HOME_001 No.1.2", "q": ["ドライバーへの自動通知（割当・お届け日の変更）を置く場所", "Nơi đặt thông báo tự động cho tài xế (phân công・đổi ngày giao)"],
     "a": ["設計のまま：お知らせ一覧に自動通知を混ぜる。別の枠は足さない。既読を持つのは DA だけ", "Giữ nguyên thiết kế: trộn thông báo tự động vào danh sách thông báo. Không thêm khung riêng. Chỉ DA giữ trạng thái đã đọc"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #428・#456・確認表 H-13）"},
    {"date": "2026-10-08", "target": "DA_HOME_001 7（下のタブ）・No.2.5（棚卸し）", "q": ["廃棄の入力元を ES配送便②だけにしたとき、タブ・ボタンの名前は", "Khi chỉ nhập hủy ở bước ② của ES配送便, tên tab・nút là gì"],
     "a": ["廃棄の入力は ES配送便のステップ②だけ。棚卸しの画面（DA_STCK）は棚卸しだけになる。タブ・ボタンの名前は「廃棄・棚卸し」から「棚卸し」に変える（サイドメニューも）", "Nhập hủy chỉ ở bước ② của ES配送便. Màn kiểm kê (DA_STCK) chỉ còn kiểm kê. Tên tab・nút đổi từ 「廃棄・棚卸し」 thành 「棚卸し」 (cả menu bên)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #455・#460・確認表 X-4。置き換えた旧決定：台帳 F「サイドメニュー」の「廃棄・棚卸し」）"},
    {"date": "2026-10-08", "target": "DA_HOME_001 No.8・DA_AUTH_003 No.6", "q": ["別のドライバーが同じ端末に入ったときの未送信の名義", "Mục chưa gửi theo tên ai khi tài xế khác đăng nhập cùng máy"],
     "a": ["未送信は作ったアカウントのもの。別のドライバーが同じ端末に入ったら見えず、送れない（作ったドライバーがログインし直すと再送する）", "Mục chưa gửi thuộc tài khoản đã tạo ra nó. Tài xế khác đăng nhập cùng máy thì không thấy và không gửi được (tài xế đã tạo đăng nhập lại thì gửi lại)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #462 ①・確認表 X-1）"},
    {"date": "2026-10-08", "target": "DA_HOME_001 No.4.1", "q": ["「配送できなかった」のバッジの色", "Màu badge 「配送できなかった」"],
     "a": ["グレー（「取消」と同じ）", "Màu xám (giống 「取消」)"], "src": "hong 回答 2026-10-08（台帳 S・受付簿 #462 ④・確認表 X-1）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", ".es-chatbot", ".es-chatbot__fab", "#es-review"]
STATIC_CSS = (".driver{position:static!important;height:auto!important;min-height:100vh}.driver .app{min-height:0!important}"
              ".driver .scroll{overflow:visible!important;flex:none!important}.driver .hbody{min-height:0!important}")
VIEWER_CSS = STATIC_CSS

SCREENS = [
    {"code": "DA_HOME_001", "ja": "ホーム", "vi": "Trang chủ"},
    {"code": "DA_HOME_002", "ja": "配送一覧", "vi": "Danh sách giao hàng"},
]

# 撮影の道具（JavaScript）：タップ・API で状態を作る（画面の仕様ではない）
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const btn=(t,sc)=>[...(sc||document.querySelector('.app')||document).querySelectorAll('button,a,label,.chk,.noti,[role=button]')].find(b=>(b.textContent||'').trim().includes(t));"
    "const click=async(t,sc)=>{const b=btn(t,sc);if(!b)throw new Error('no button '+t);b.click();await sleep(450)};"
    "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}))};"
    "const holdToast=()=>{if(window.__ht)return;window.__ht=1;const o=window.setTimeout;window.setTimeout=(f,t,...a)=>t===3000?0:o(f,t,...a)};"
    "const api=async(op,args)=>{const r=await fetch('/api/ops/area/driver/'+op,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'driver'},body:JSON.stringify({args:args??null})});const j=r.status===204?null:await r.json().catch(()=>null);if(!r.ok)throw new Error(op+' '+r.status);return j};"
    "const staff=()=>sessionStorage.getItem('driver.session');"
    "const recvAll=async(pt,skip)=>{const d=await api('day',{staff:staff()});const recv={};d.dels.filter(x=>x.pt===pt).forEach(x=>x.inv.forEach((i,k)=>{if(!(skip&&k>=skip))recv[x.no+'|'+i.no]=true}));return api('receive',{staff:staff(),pt,recv,ack:!!skip,offline:false})};"
    "const finishEs=async(no,o)=>{o=o||{};const f=await api('flow',{staff:staff(),no});f.before=['/driver/photo.jpg'];f.stock.forEach(r=>r.ck=true);f.stockDone=true;f.stockAt='10-06（火） 9:30';"
    "f.disp.forEach(r=>{r.ck=true});const r1=await api('finishDisp',{staff:staff(),no,flow:f,ack:false,offline:false});const g=r1.flow;g.after=['/driver/photo2.jpg'];"
    "if(g.plan>0)g.cash=String(g.plan);g.before=f.before;g.stockDone=true;g.stockAt=f.stockAt;return api('completeEs',{staff:staff(),no,flow:g,offline:false})};"
    "const refresh=async()=>{await click('アカウント');await sleep(400);await click('ホーム');await sleep(700)};"
)


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


NO_ETA = ["コードのカードにある「到着予定 …（共有済み）」の行は出さない（到着予定の時間帯は持たない：台帳 F 2026-10-07）。カードの数量は「箱 n・冷蔵 n個・冷凍 n個」にする（コードは「食」。hong 2026-10-08・受付簿 #435）。ES配送便・COOL便の完了のあとも同じ。",
          "Không hiện dòng 「到着予定 …（共有済み）」 trên thẻ trong code (không giữ khung giờ dự kiến: 台帳 F 2026-10-07). Số lượng trên thẻ ghi 「箱 n・冷蔵 n個・冷凍 n個」 (code ghi 「食」; hong 2026-10-08, 受付簿 #435). Sau khi hoàn tất ES配送便・COOL便 cũng vậy."]

# ---------------------------------------------------------------- 共通の部品
def tab_bar(no="7"):
    return A(no, "下のタブ", "Tab dưới", ".tabbar", "area", "view", [
        "スマホの画面の下に固定。ホーム／配送一覧／棚卸し／トラブル／アカウントの5つ（台帳 M-3 の「廃棄・棚卸し」から名前を変えた：廃棄の入力は ES配送便②だけになったため。受付簿 #455・#460）。いまの画面のタブを青くする。押すと入力の途中でも画面を移る（入力中の画面は離脱の確認 Q02 を出す。ただし ES配送便・受取の入力は端末に保持するので出さない：受付簿 #438）。この枠は配送の詳細・受取・トラブルの入力などでは出さない。",
        "Cố định ở cuối màn hình điện thoại. 5 tab: ホーム/配送一覧/棚卸し/トラブル/アカウント (đổi tên từ 「廃棄・棚卸し」 của 台帳 M-3 vì nhập hủy chỉ còn ở bước ② của ES配送便: 受付簿 #455・#460). Tab của màn hiện tại được tô xanh. Bấm để chuyển màn hình ngay cả khi đang nhập (màn đang nhập sẽ hiện xác nhận rời đi Q02; riêng nhập của ES配送便・nhận hàng được giữ trên thiết bị nên không hiện: 受付簿 #438). Khung này không hiện ở chi tiết giao hàng, nhận hàng, nhập sự cố."],
        err=["Q02"])
OFFBAR = A("8", "オフライン・未送信の帯", "Dải offline・chưa gửi", ".offbar", "area", "view", [
    "全画面の上に出す帯（ここで1回だけ撮る。ほかの機能は書かない）。「オフライン・未送信 N件」（電波が戻ったら「オンライン・未送信 N件」）と、未送信があるときの「再送する」ボタン。送れなかった完了・報告は端末のブラウザ（IndexedDB・写真も）に保持し、ログインし直したあとも消さない。押すと再送し、成功は S403、失敗（まだ通信できない）は E445。サーバーに拒否されたときは、その1件に理由を出す（種類ごと）：割当の解除（担当が変わった：E449）／配送の取消（E450）／完了から7日の超過（E439）／トラブルに関わる部分は修正不可（E440）；完了から7日を過ぎた配送への報告は E452／ログイン切れ（E525。捨てずに残し、ログインし直すと再送する）。拒否された分も「未送信」のまま残り、1件ずつ「破棄」できる（確認 Q01 をはさむ。破棄すると元に戻せず、「未送信 N件」が減り、トースト S410「未送信の報告を破棄しました。」を出す）。未送信は作ったアカウントのもの：別のドライバーが同じ端末にログインしても見えず、送れない（作ったドライバーがログインし直すと再送する：受付簿 #462）。ブラウザのデータ削除・プライベートモードでは消え、iPhone は約7日使わないと消え、裏での自動再送はできない（hong 2026-10-07・受け入れ済み）。再送の拒否と破棄：hong 2026-10-08・受付簿 #443。",
    "Dải hiện trên đầu mọi màn hình (chỉ chụp 1 lần ở đây). 「オフライン・未送信 N件」 (khi có sóng lại: 「オンライン・未送信 N件」) và nút 「再送する」 khi có mục chưa gửi. Hoàn tất・báo cáo không gửi được sẽ giữ trong trình duyệt của thiết bị (IndexedDB, cả ảnh), không xóa kể cả sau khi đăng nhập lại. Bấm để gửi lại: thành công S403, thất bại (chưa có kết nối) E445. Khi bị server từ chối thì hiện lý do cho mục đó (theo từng loại): bị gỡ phân công (đổi người phụ trách: E449)/đơn bị hủy (E450)/quá 7 ngày sau hoàn tất (E439)/có sự cố nên không sửa được (E440)/hết phiên đăng nhập (E525; giữ lại, đăng nhập lại thì gửi lại). Mục bị từ chối vẫn ở trạng thái 「未送信」 và hủy bỏ được từng mục bằng 「破棄」 (có xác nhận Q01; hủy là không hoàn lại được, 「未送信 N件」 giảm đi và hiện toast S410 「未送信の報告を破棄しました。」). Mục chưa gửi thuộc tài khoản đã tạo ra nó: tài xế khác đăng nhập cùng máy thì không thấy và không gửi được (tài xế đã tạo đăng nhập lại thì gửi lại: 受付簿 #462). Xóa dữ liệu trình duyệt/chế độ riêng tư sẽ mất, iPhone mất sau khoảng 7 ngày không dùng, không tự gửi lại ngầm được (hong 2026-10-07, đã chấp nhận). Từ chối khi gửi lại và hủy bỏ: hong 2026-10-08, 受付簿 #443."],
    err=["W311", "S403", "E445", "E439", "E440", "E449", "E450", "E525", "Q01", "S410"],
    demo_ok=["コードはサーバー側の模擬（driver.outbox）で、ブラウザの IndexedDB には持たない。決定（台帳 F 2026-10-07・受付簿 No.292）に合わせて直す（宿題）",
             "Code đang mô phỏng phía server (driver.outbox), chưa giữ trong IndexedDB của trình duyệt. Sẽ sửa theo quyết định (台帳 F 2026-10-07, 受付簿 No.292) (việc phải sửa)"])


def head_items(prefix="1"):
    return [
        A(prefix, "ヘッダー", "Đầu trang", ".hhead", "area", "view", [
            "ホームと配送一覧・アカウントの上に出す帯。ロゴ・トラック・あいさつ・お知らせのベル。",
            "Dải trên cùng của trang chủ, 配送一覧 và アカウント: logo, xe tải, lời chào, chuông thông báo."]),
        A(prefix + ".1", "あいさつ", "Lời chào", ".hhead .bubble", "label", "view", [
            "「{配送スタッフ名} さん、安全運転でいってらっしゃいませ。」。名前はログイン中のドライバー（配送スタッフマスタの名前）。",
            "「{tên tài xế} さん、安全運転でいってらっしゃいませ。」. Tên là tài xế đang đăng nhập (tên trong master 配送スタッフ)."]),
        A(prefix + ".2", "お知らせ（ベル）", "Chuông thông báo", ".hhead .bell", "button", "click", [
            "押すとお知らせ一覧（DA_NOTI_001）へ。未読があれば右上に赤い丸を出す。自分あての通知（割当・お届け日の変更）と運営のお知らせの両方が対象（設計のまま：hong 2026-10-08・受付簿 #428。別の枠は足さない）。既読を持つのは DA だけ（受付簿 #456）。",
            "Bấm để sang danh sách thông báo (DA_NOTI_001). Có thông báo chưa đọc thì hiện chấm đỏ góc trên phải. Gồm cả thông báo gửi riêng (phân công, đổi ngày giao) và thông báo của vận hành (giữ nguyên thiết kế: hong 2026-10-08, 受付簿 #428; không thêm khung riêng). Chỉ DA giữ trạng thái đã đọc (受付簿 #456)."]),
    ]


def stat_items(prefix="2", with_qa=True):
    r = [
        A(prefix, "今日の進み具合", "Tiến độ hôm nay", ".hstat .stats", "area", "view", [
            "今日お届けする配送（納品日が今日のもの）の件数・完了・残り・進捗。受取だけの配送（納品日が先）は数えない。",
            "Số đơn giao hôm nay (ngày giao là hôm nay), đã hoàn tất, còn lại, tiến độ. Đơn chỉ nhận hàng (ngày giao còn xa) không tính."]),
        A(prefix + ".1", "本日の配送件数", "Số đơn giao hôm nay", ".stats .c:nth-child(1)", "label", "view", ["納品日が今日の配送の数。", "Số đơn có ngày giao là hôm nay."]),
        A(prefix + ".2", "完了件数", "Số đơn hoàn tất", ".stats .c:nth-child(2)", "label", "view", ["配送完了（アプリで完了を報告した）の数。", "Số đơn đã hoàn tất (đã báo hoàn tất trong app)."]),
        A(prefix + ".3", "残り件数", "Số đơn còn lại", ".stats .c:nth-child(3)", "label", "view", ["配送件数 − 完了件数。", "Số đơn giao − số đơn hoàn tất."]),
        A(prefix + ".4", "本日の進捗", "Tiến độ hôm nay", ".prog", "label", "view", ["完了件数 ÷ 配送件数 の割合（%）。0件のときは 0%。バーは最小幅を持たせる。", "Tỷ lệ số đơn hoàn tất ÷ số đơn giao (%). 0 đơn thì 0%. Thanh có độ rộng tối thiểu."]),
    ]
    if with_qa:
        r += [
            A(prefix + ".5", "棚卸し", "Kiểm kê", ".qa button::棚卸し", "button", "click", ["押すと棚卸し（DA_STCK_001）へ。下のタブの「棚卸し」と同じ。この画面は棚卸しだけになった（廃棄の入力は ES配送便のステップ②だけ：受付簿 #455）ので、名前を「廃棄・棚卸し」から「棚卸し」に変えた（受付簿 #460）。", "Bấm để sang 棚卸し (DA_STCK_001). Giống tab 「棚卸し」 ở dưới. Màn này chỉ còn kiểm kê (nhập hủy chỉ ở bước ② của ES配送便: 受付簿 #455). Tên đổi từ 「廃棄・棚卸し」 thành 「棚卸し」 (受付簿 #460)."],
          demo_ok=["コードのボタン名は「廃棄・棚卸し」のまま。「棚卸し」に変える（宿題）", "Tên nút trong code vẫn là 「廃棄・棚卸し」. Sẽ đổi thành 「棚卸し」 (việc phải sửa)"]),
            A(prefix + ".6", "マニュアル", "Hướng dẫn", ".qa button::マニュアル", "link", "click", [
                "押すとマニュアルのリンク（URL）を開く（DA_MANU_001）。URL は運営Web の設定画面にシステム管理が置く（台帳 F 2026-10-07）。URL が空のときはボタンを出さない。",
                "Bấm để mở link (URL) hướng dẫn (DA_MANU_001). URL do quản trị hệ thống đặt ở màn cài đặt Web vận hành (台帳 F 2026-10-07). URL trống thì không hiện nút."],
              demo_ok=["コードは固定の文章の一覧（/driver/manuals）を開く。リンクを開く形に直す（宿題。DA_MANU）", "Code mở danh sách văn bản cố định (/driver/manuals). Sẽ sửa thành mở link (việc phải sửa; DA_MANU)"]),
        ]
    return r


def card_items(p):
    """ホーム・配送一覧のカード（受取地点・配送）"""
    return [
        A(p + ".1", "バッジ", "Badge trạng thái", ".group .bdg", "label", "view", [
            "状態のバッジ。受取地点＝未受取（黄）／受取済（緑）、配送＝未配送（青）／配送完了（緑）／配送できなかった（グレー。運営が閉じた配送の専用の状態：hong 2026-10-08・受付簿 #444）。未解決のトラブルがあれば「トラブルあり」（赤）、解決済みなら「トラブル解決済」、オフラインで送れていなければ「未送信」を並べる。色は全サイト共通の表（lib/format/status）。「配送できなかった」はグレー（「取消」と同じ：hong 2026-10-08・受付簿 #462）。",
            "Badge trạng thái. Điểm nhận = 未受取 (vàng)/受取済 (xanh lá); giao hàng = 未配送 (xanh dương)/配送完了 (xanh lá)/配送できなかった (xám; trạng thái riêng cho đơn do vận hành đóng: hong 2026-10-08, 受付簿 #444). Có sự cố chưa giải quyết thì thêm 「トラブルあり」 (đỏ), đã giải quyết thì 「トラブル解決済」, chưa gửi do offline thì 「未送信」. Màu theo bảng chung toàn site (lib/format/status). 「配送できなかった」 màu xám (giống 「取消」: hong 2026-10-08, 受付簿 #462)."],
          demo_ok=["コードのバッジ表（lib/format/status）に「配送できなかった」の色はまだない。グレー（「取消」と同じ）で足す（宿題）", "Bảng badge trong code (lib/format/status) chưa có màu của 「配送できなかった」. Sẽ thêm màu xám (giống 「取消」) (việc phải sửa)"]),
    ]


# ---------------------------------------------------------------- DA_HOME_001 ホーム
def home_items(delivery=True, receive=True, toggle=True, bell=False):
    r = head_items("1") + stat_items("2") + [
        A("3", "配送予定一覧", "Danh sách lịch giao hàng", ".hbody", "area", "view", [
            "今日の分を全件出す（1日分なのでページ送りはしない：Q-DW14 推奨）。納品（今日お届けする分）と受取（今日受け取り、明日以降に納品）の2つの欄。自分に割り当てられた区間のある配送だけ（ほかのドライバー・ほかの会社の分は出ない）。並びは受取地点の ID → お届け日 → 配送No。",
            "Hiện toàn bộ phần của hôm nay (1 ngày nên không phân trang: Q-DW14 đề xuất). Hai mục: 納品 (giao hôm nay) và 受取 (nhận hôm nay, giao từ ngày mai). Chỉ đơn có chặng được giao cho mình (đơn của tài xế/công ty khác không hiện). Thứ tự: ID điểm nhận → ngày giao → 配送No."]),
        A("3.1", "本日の日付", "Ngày hôm nay", ".date", "label", "view", ["「■本日（MM-DD（曜））」。デモの「今日」に合わせる。", "「■本日（MM-DD（曜））」. Theo ngày 「今日」 của demo."]),
    ]
    if delivery:
        r += [
            A("4", "納品（今日お届けする分）", "Giao hôm nay", ".sech::納品（今日", "label", "view", ["納品日が今日の配送を、受取地点ごとに束ねて出す。受取地点（倉庫・中継先）のカードの下に、その地点から運ぶ配送のカードが続く。", "Các đơn có ngày giao là hôm nay, gom theo điểm nhận. Dưới thẻ điểm nhận (kho/trung chuyển) là các thẻ đơn giao chở từ điểm đó."]),
            A("4.1", "受取地点のカード", "Thẻ điểm nhận", ".group > .card", "button", "click", [
                "受取地点（倉庫・中継先）の名前・状態・住所・倉庫コード（中継先は営業所コード）・社数／箱／冷蔵／冷凍の合計（単位は「箱 n・冷蔵 n個・冷凍 n個」。「食」「品」は使わない）。中継先は「中継先」の札を付ける。押すと荷物受取（倉庫＝DA_RECV_001・中継先＝DA_RECV_002）へ。",
                "Tên điểm nhận (kho/trung chuyển), trạng thái, địa chỉ, mã kho (trung chuyển là mã văn phòng), tổng số công ty/thùng/lạnh/đông (đơn vị 「箱 n・冷蔵 n個・冷凍 n個」; không dùng 「食」「品」). Trung chuyển gắn nhãn 「中継先」. Bấm để sang nhận hàng (kho = DA_RECV_001, trung chuyển = DA_RECV_002)."],
              ),
        ]
        if toggle:
            r += [A("4.2", "表示／非表示", "Hiện/ẩn", ".toggle", "button", "click", [
                "押すとその受取地点の配送カードを隠す／出す（初期は出す）。隠した状態は画面を移っても残す（ログインし直すと戻る）。",
                "Bấm để ẩn/hiện thẻ đơn giao của điểm nhận đó (mặc định hiện). Trạng thái ẩn được giữ khi chuyển màn hình (đăng nhập lại thì trở về mặc định)."])]
        r += [
            A("4.3", "配送のカード", "Thẻ đơn giao", ".group .card::配送No", "button", "click", [
                "納品先の名前（COOL便は紫の枠）・状態・配送No・受取地点・住所・受取時間帯（複数あればすべて）・納品条件・代替品のお知らせ・箱／冷蔵／冷凍（単位は「箱 n・冷蔵 n個・冷凍 n個」）。運営がトラブルの報告を受けて閉じた配送は状態「配送できなかった」で出す（専用の状態。一覧では配送完了のタブに入る：受付簿 #444）。押すと ES配送便（DA_ESDL_001）または COOL便（DA_COOL_001）の詳細へ。受け取っていなくても開ける（開始・完了はできない）。",
                "Tên nơi nhận (COOL便 viền tím), trạng thái, 配送No, điểm nhận, địa chỉ, khung giờ nhận (hiện tất cả nếu có nhiều), điều kiện giao, thông báo hàng thay thế, thùng/lạnh/đông (đơn vị 「箱 n・冷蔵 n個・冷凍 n個」). Đơn do vận hành đóng sau khi nhận báo sự cố hiện trạng thái 「配送できなかった」 (trạng thái riêng; trong danh sách nằm ở tab 配送完了: 受付簿 #444). Bấm để sang chi tiết ES配送便 (DA_ESDL_001) hoặc COOL便 (DA_COOL_001). Chưa nhận hàng vẫn mở được (không bắt đầu・hoàn tất được)."],
              demo_ok=NO_ETA),
        ]
    if receive:
        r += [
            A("5", "受取（今日受け取り、明日以降に納品）", "Nhận hàng (nhận hôm nay, giao từ ngày mai)", ".sech::受取（今日", "label", "view", ["今日受け取り、納品日が明日以降の配送。受け取ったその日に届けるとは限らない（中継先まで運び、別のドライバーが届けることもある）。", "Đơn nhận hôm nay, ngày giao từ ngày mai. Không nhất thiết giao ngay hôm đó (có thể chở đến điểm trung chuyển, tài xế khác giao)."]),
            A("5.1", "受取地点のカード（受取だけ）", "Thẻ điểm nhận (chỉ nhận)", ".group:last-of-type > .card:first-child", "button", "click", ["納品の欄と同じ形。押すと荷物受取へ。", "Cùng dạng với mục 納品. Bấm để sang nhận hàng."]),
            A("5.2", "納品日が先の配送のカード", "Thẻ đơn có ngày giao còn xa", ".group:last-of-type .card::今日は受取だけ", "button", "click", [
                "「納品 MM-DD（曜）（今日は受取だけ）」を橙色で出す。押すとトースト I311（開かない）。",
                "Hiện chữ cam 「納品 MM-DD（曜）（今日は受取だけ）」. Bấm hiện toast I311 (không mở)."], err=["I311"]),
        ]
    r += [A("6", "注意書き", "Ghi chú", ".hbody p.muted", "label", "view", [
        "「受け取ったその日に届けるとは限りません。中継先まで運び、別のドライバーが届けることもあります（区間ごとの割当）。」固定の文。",
        "Câu cố định 「受け取ったその日に届けるとは限りません。中継先まで運び、別のドライバーが届けることもあります（区間ごとの割当）。」."])]
    r += [tab_bar("7")]
    return r


VIEWS = [
    V("001", "DA_HOME_001", "初期表示（納品あり）", "Hiển thị ban đầu (có đơn giao)", "/driver", home_items(delivery=True, receive=False, toggle=True), login="DR00002", today="2026/10/06",
      note=["高橋 誠（DR00002）・今日 2026/10/06。納品（ひかり物産 本社・ES配送便）と受取地点（関東倉庫）がある。受取（明日以降に納品）の欄は出ない（見出しだけ）。",
            "Takahashi Makoto (DR00002), hôm nay 2026/10/06. Có đơn giao (Hikari Bussan, ES配送便) và điểm nhận (Kanto). Mục 受取 (giao từ ngày mai) không có dòng nào (chỉ tiêu đề)."]),
    V("002", "DA_HOME_001", "納品先の一覧を「非表示」にする", "Ẩn danh sách điểm giao", "/driver",
      [A("4.2", "表示／非表示", "Hiện/ẩn", ".toggle", "button", "click", [
          "「非表示」を押すと、その受取地点の配送カードを隠し、ボタンが「表示」に変わる。もう一度押すと出す。",
          "Bấm 「非表示」 thì ẩn thẻ đơn giao của điểm nhận, nút đổi thành 「表示」. Bấm lần nữa để hiện."]),
       A("4.1", "受取地点のカード", "Thẻ điểm nhận", ".group > .card", "button", "click", ["配送カードを隠しても受取地点のカードは残る。", "Ẩn thẻ đơn giao thì thẻ điểm nhận vẫn còn."])],
      setup="await click('非表示');", login="DR00002", today="2026/10/06"),
    V("003", "DA_HOME_001", "納品日が先の配送を押す（トースト）", "Bấm đơn có ngày giao còn xa (toast)", "/driver",
      [A("5.2", "納品日が先の配送のカード", "Thẻ đơn có ngày giao còn xa", ".group .card::今日は受取だけ", "button", "click", [
          "押してもトースト I311「この配送の納品日は {日付} です。今日は受取だけです。」を出し、詳細は開かない。今日は受取地点で荷物を受け取るだけ。",
          "Bấm vẫn hiện toast I311 và không mở chi tiết. Hôm nay chỉ nhận hàng tại điểm nhận."], err=["I311"]),
       A("5", "受取（今日受け取り、明日以降に納品）", "Nhận hàng", ".sech::受取（今日", "label", "view", ["この配送は納品の欄ではなく受取の欄に出る。", "Đơn này nằm ở mục 受取 chứ không phải 納品."])],
      setup="holdToast(); await click('配送No');", login="DR00011", today="2026/10/06",
      note=["栄成ロジ 山口（DR00011）。川崎デポ（中継先）で受け取り、納品は 10-07。", "Eisei Logi Yamaguchi (DR00011). Nhận tại kho trung chuyển Kawasaki, giao ngày 10-07."]),
    V("004", "DA_HOME_001", "バッジ：トラブルあり（未解決）", "Badge: có sự cố (chưa giải quyết)", "/driver",
      card_items("4") + [A("4.4", "トラブルの印", "Dấu sự cố", ".group .bdg::トラブルあり", "label", "view", [
          "未解決のトラブルがあるとき赤い「トラブルあり」。解決済みは「トラブル解決済」（緑）に変わり、運営が解決を記録したあとに出る。この状態は箱数不足で自動報告した受取地点の例。",
          "Khi có sự cố chưa giải quyết hiện 「トラブルあり」 màu đỏ. Khi đã giải quyết đổi thành 「トラブル解決済」 (xanh lá), hiện sau khi vận hành ghi nhận giải quyết. Đây là ví dụ điểm nhận tự động báo do thiếu thùng."],
        demo_ok=["「トラブル解決済」は運営が解決を記録したあとの状態で、見本データでは今日の配送に解決済みがない。コードの動きは確認済み（trOpen・Badges）", "「トラブル解決済」 là trạng thái sau khi vận hành ghi nhận giải quyết; dữ liệu mẫu không có đơn hôm nay đã giải quyết. Đã xác nhận hoạt động của code (trOpen, Badges)"])],
      setup="await recvAll('WH00001', 1); await refresh();", login="DR00002", today="2026/10/06",
      note=["2箱のうち1箱だけ受け取って「一部未受取のまま完了」にした直後（トラブル「箱数不足」を自動で報告）。", "Ngay sau khi chỉ nhận 1 trong 2 thùng và bấm 「一部未受取のまま完了」 (tự động báo sự cố 「箱数不足」)."]),
    V("005", "DA_HOME_001", "担当なし（今日の配送が0件）", "Không có phần phụ trách", "/driver",
      head_items("1") + stat_items("2") + [A("3", "配送予定一覧", "Danh sách lịch giao hàng", ".hbody", "area", "view", [
          "今日の受取・配送が1件もないとき、2つの欄の見出しだけを出し、カードは出さない。「今日の担当の配送はありません。」（I313）を欄の中に出す。",
          "Khi hôm nay không có đơn nhận/giao nào, chỉ hiện tiêu đề hai mục, không có thẻ. Hiện 「今日の担当の配送はありません。」 (I313) trong mục."], err=["I313"],
        demo_ok=["コードは見出しだけで I313 の文を出さない（宿題）", "Code chỉ hiện tiêu đề, chưa hiện câu I313 (việc phải sửa)"]), tab_bar("7")],
      login="DR00001", today="",
      note=["高橋 誠以外の自社ドライバー 田中（DR00001）。今日の区間なし。", "Tài xế nội bộ khác (DR00001). Hôm nay không có chặng."]),
    V("006", "DA_HOME_001", "未読のお知らせ（ベルの印）", "Có thông báo chưa đọc (chấm chuông)", "/driver",
      head_items("1") + [A("1.3", "未読の印", "Dấu chưa đọc", ".hhead .bell i", "label", "view", [
          "未読のお知らせ・通知が1件でもあれば、ベルの右上に赤い丸を出す。すべて読む（詳細を開く）と消える。",
          "Có ít nhất 1 thông báo chưa đọc thì hiện chấm đỏ góc trên phải chuông. Đọc hết (mở chi tiết) thì biến mất."]),
       A("5", "受取（今日受け取り、明日以降に納品）", "Nhận hàng", ".sech::受取（今日", "label", "view", ["今日は受取だけの配送がある日の例（納品の欄は見出しだけ）。", "Ví dụ ngày chỉ có đơn nhận (mục 納品 chỉ có tiêu đề)."]),
       A("5.1", "受取地点のカード（受取だけ）", "Thẻ điểm nhận (chỉ nhận)", ".group:last-of-type > .card:first-child", "button", "click", ["納品日が先の配送だけを受け取る地点。", "Điểm nhận chỉ có đơn giao ở ngày sau."])],
      login="DR00002", today=""),
    V("007", "DA_HOME_001", "オフライン・未送信の帯（全画面共通）", "Dải offline・chưa gửi (chung mọi màn hình)", "/driver",
      [OFFBAR] + [A("1", "ヘッダー", "Đầu trang", ".hhead", "area", "view", ["帯はヘッダーの上に出る。", "Dải hiện phía trên header."])],
      setup=("holdToast(); await click('オフラインにする',document); await click('関東倉庫'); await sleep(900);"
             "for(const e of document.querySelectorAll('.inv.tap')){e.click();await sleep(250)}"
             "document.querySelector('.foot .btn.pri').click();await sleep(1200);document.querySelector('.topbar .rb.l').click();await sleep(1000);"),
      login="DR00002", today="",
      note=["DEMO 帯の「オフラインにする」を押したあと、荷物受取を完了した状態（端末に保存・未送信 1件）。この帯は全画面に出るので、ここで1回だけ撮る。",
            "Sau khi bấm 「オフラインにする」 trên dải DEMO rồi hoàn tất nhận hàng (lưu trên thiết bị, chưa gửi 1 mục). Dải này hiện ở mọi màn hình nên chỉ chụp 1 lần ở đây."]),
]


# ---------------------------------------------------------------- DA_HOME_002 配送一覧
def list_items(tab, extra=None):
    r = head_items("1") + [
        A("2", "見出しと期間", "Tiêu đề và khoảng thời gian", ".lhead", "area", "view", [
            "「配送一覧」の見出しと、期間の指定。",
            "Tiêu đề 「配送一覧」 và chọn khoảng thời gian."]),
        A("2.1", "期間", "Khoảng thời gian", ".drange", "date", "click", [
            "表示する期間（開始日〜終了日）を選ぶ。初期は今日だけ。参照は90日前まで（完了から90日を過ぎた配送は見えない。運営には残る）。完了から7日までは過去の日の配送も開いて修正できる（台帳 E）。日付の入力は共通の日付の部品（yyyy-mm-dd）。開始が終了より後・90日より前は選べない（E08・E446）。",
            "Chọn khoảng thời gian hiển thị (ngày bắt đầu〜kết thúc). Mặc định chỉ hôm nay. Xem được đến 90 ngày trước (đơn hoàn tất quá 90 ngày thì không thấy; bên vận hành vẫn còn). Trong 7 ngày sau khi hoàn tất vẫn mở và sửa được đơn của ngày trước (台帳 E). Nhập ngày bằng component ngày chung (yyyy-mm-dd). Không chọn được bắt đầu sau kết thúc, hoặc trước 90 ngày (E08・E446)."],
          req="－", len="年月日（yyyy-mm-dd）〜年月日", init=["今日〜今日", "Hôm nay〜hôm nay"], ex=["2026-10-05〜2026-10-06", "Từ 05/10/2026 đến 06/10/2026"],
          valid=["開始日 ≦ 終了日。開始日は今日から90日前以降。", "Ngày bắt đầu ≦ ngày kết thúc. Ngày bắt đầu không sớm hơn 90 ngày trước hôm nay."], err=["E08", "E446"],
          demo_ok=["コードの見出しは「今日から1週間」の範囲（例：10-05〜10-11）を出すだけで、押せず、今日の分しか読まない。決定（hong 2026-10-07・受付簿 No.292）に合わせて期間を選べるようにする（宿題）",
                   "Tiêu đề trong code chỉ hiện khoảng 「1 tuần từ hôm nay」 (ví dụ 10-05〜10-11), không bấm được, và chỉ đọc dữ liệu hôm nay. Sẽ làm chọn được khoảng theo quyết định (hong 2026-10-07, 受付簿 No.292) (việc phải sửa)"]),
        A("3", "タブ", "Tab", ".tabs", "tab", "click", [
            "倉庫受取／未配送／配送完了の3つ。名前の後ろに件数を出す。タブを切り替えると検索の文字は空に戻す。",
            "3 tab: 倉庫受取/未配送/配送完了. Sau tên có số đếm. Chuyển tab thì ô tìm kiếm được xóa trống."]),
        A("3.1", "倉庫受取", "Nhận tại kho", ".tabs button::倉庫受取", "tab", "click", ["今日受け取る受取地点（倉庫・中継先）のカード。", "Thẻ điểm nhận (kho/trung chuyển) cần nhận hôm nay."]),
        A("3.2", "未配送", "Chưa giao", ".tabs button::未配送", "tab", "click", ["納品日が今日で、完了していない配送。受取だけの配送（納品日が先）は出さない。", "Đơn có ngày giao hôm nay, chưa hoàn tất. Đơn chỉ nhận (ngày giao còn xa) không hiện."]),
        A("3.3", "配送完了", "Đã hoàn tất", ".tabs button::配送完了", "tab", "click", ["完了を報告した配送。運営がトラブルの報告を受けて閉じた配送（状態「配送できなかった」）もここに入れる（受付簿 #444）。完了から7日までは開いて内容を修正できる（トラブルがあれば不可）。", "Đơn đã báo hoàn tất. Đơn do vận hành đóng sau khi nhận báo sự cố (trạng thái 「配送できなかった」) cũng nằm ở đây (受付簿 #444). Trong 7 ngày sau khi hoàn tất mở được và sửa nội dung (có sự cố thì không sửa được)."],
          demo_ok=["コードに「配送できなかった」の状態はまだない（運営が閉じる操作は運営D の実装待ち：受付簿 #370）。バッジと、完了済みのタブへの振り分けを足す（宿題）", "Code chưa có trạng thái 「配送できなかった」 (thao tác đóng của vận hành chờ 運営D triển khai: 受付簿 #370). Sẽ thêm badge và việc xếp vào tab đã xong (việc phải sửa)"]),
    ]
    r += extra or []
    return r


def list_filter_search(tab):
    a = tab == "A"
    return [
        A("4", "絞り込み", "Bộ lọc", ".frow .chip", "button", "click", [
            ("倉庫受取のタブ：「ステータス：すべて／未受取／受取済／トラブル」。" if a else "未配送・配送完了のタブ：倉庫・中継、便の種類（ES配送便・COOL便）、トラブルのみ。") + "押すと下から出る絞り込みシート（DA_HOME_002 011・012）。選んだ内容をボタンの文字に出す。",
            ("Tab nhận tại kho: 「ステータス：すべて/未受取/受取済/トラブル」." if a else "Tab chưa giao・đã hoàn tất: kho・trung chuyển, loại chuyến (ES配送便・COOL便), chỉ sự cố.") + " Bấm để mở sheet lọc trượt từ dưới lên (DA_HOME_002 011・012). Nội dung đã chọn hiện trên chữ của nút."]),
        A("5", "検索", "Tìm kiếm", ".search input", "text", "input", [
            ("受取地点の名前・住所・倉庫コード・納品先の名前・送り状番号の部分一致。" if a else "納品先の名前・住所・倉庫名・送り状番号の部分一致。") + "「検索」キー（キーボード）／Enter を押してから絞る（台帳 M-1。入力のたびには絞らない）。",
            ("Khớp một phần với tên điểm nhận, địa chỉ, mã kho, tên nơi nhận, số phiếu gửi." if a else "Khớp một phần với tên nơi nhận, địa chỉ, tên kho, số phiếu gửi.") + " Lọc sau khi bấm phím 「検索」 (bàn phím)/enter (台帳 m-1; không lọc mỗi lần gõ)."],
          req="－", len="文字列 60", ex=["DL-261005-0001", "Số 配送No hoặc số phiếu gửi, tên nơi nhận (ví dụ: 「ひかり物産」)"], valid=["前後の空白を取る。全角の英数は半角にして比べる。60文字は入力欄の上限で止める（それ以上は打てない）。貼り付けで超えたときだけ E04（受付簿 #446）。", "Bỏ khoảng trắng đầu/cuối. Đổi chữ/số toàn góc sang nửa góc rồi so sánh. Tối đa 60 ký tự: ô nhập chặn ở giới hạn (không gõ thêm được). Chỉ khi dán vượt quá mới hiện E04 (受付簿 #446)."],
          err=["E04"]),
        A("6", "並べ替え", "Sắp xếp", "-", "select", "select", [
            "台帳 F の標準：並べ替える項目を選ぶ。初期の並びは受取時間帯の早い順（当日の回り順を決める情報：配送_06 §12-2）。コードは受取地点 ID → お届け日 → 配送No の固定。",
            "Chuẩn 台帳 F: chọn mục để sắp xếp. Thứ tự mặc định: giờ nhận sớm trước (thông tin để quyết định lộ trình trong ngày: 配送_06 §12-2). Code cố định theo ID điểm nhận → ngày giao → 配送No."],
          req="－", init=["受取時間帯の早い順", "Giờ nhận sớm trước"], ex=["受取時間帯の早い順", "Giờ nhận sớm trước"],
          demo_ok=["コードに並べ替えの操作はない（宿題）。受取時間帯の早い順は確認メモ Q-DW14 の推奨で hong 確認待ち", "Code chưa có thao tác sắp xếp (việc phải sửa). Giờ nhận sớm trước là đề xuất ở Q-DW14, chờ hong xác nhận"]),
    ]


def list_cards(tab):
    a = tab == "A"
    return [
        A("7", "カードの一覧", "Danh sách thẻ", ".grid2", "area", "view", [
            "絞り込み・検索に合うカードを並べる（スマホは1列）。期間の範囲の配送だけ。0件のときは I01 を一覧の中に出す。",
            "Xếp các thẻ khớp bộ lọc・tìm kiếm (điện thoại 1 cột). Chỉ đơn trong khoảng thời gian. 0 dòng thì hiện I01 trong danh sách."], err=["I01"]),
        A("7.1", "受取地点のカード" if a else "配送のカード", "Thẻ điểm nhận" if a else "Thẻ đơn giao", ".grid2 .card", "button", "click", [
            ("受取地点の名前・状態・日付・住所・倉庫コード・社数／箱／冷蔵／冷凍（単位は「箱 n・冷蔵 n個・冷凍 n個」）。押すと荷物受取へ。" if a else "納品先の名前・状態・日付・配送No・受取地点・住所・受取時間帯・納品条件・箱／冷蔵／冷凍（単位は「箱 n・冷蔵 n個・冷凍 n個」）。運営が閉じた配送は状態「配送できなかった」で、配送完了のタブに出る（受付簿 #444）。押すと ES配送便／COOL便の詳細へ（納品日が先の配送は I311）。"),
            ("Tên điểm nhận, trạng thái, ngày, địa chỉ, mã kho, số công ty/thùng/lạnh/đông (đơn vị 「箱 n・冷蔵 n個・冷凍 n個」). Bấm để sang nhận hàng." if a else "Tên nơi nhận, trạng thái, ngày, 配送No, điểm nhận, địa chỉ, khung giờ nhận, điều kiện giao, thùng/lạnh/đông (đơn vị 「箱 n・冷蔵 n個・冷凍 n個」). Đơn do vận hành đóng có trạng thái 「配送できなかった」 và nằm ở tab 配送完了 (受付簿 #444). Bấm để sang chi tiết ES配送便/COOL便 (đơn có ngày giao còn xa: I311).")],
          demo_ok=NO_ETA, err=["I311"] if not a else []),
        A("8", "ページ送り", "Phân trang", "-", "area", "view", [
            "台帳 F の標準：1ページ10件（10／20／50／100から選べる）。件数が10件を超えるとき一覧の下に出す。期間を広げると増える。",
            "Chuẩn 台帳 F: 10 dòng/trang (chọn 10/20/50/100). Hiện dưới danh sách khi quá 10 dòng. Mở rộng khoảng thời gian thì tăng."],
          demo_ok=["コードは全件を並べる（ページ送りなし）。期間を選べるようにするときに足す（宿題）", "Code xếp toàn bộ (không phân trang). Sẽ thêm khi làm chọn khoảng thời gian (việc phải sửa)"]),
    ]


VIEWS += [
    V("008", "DA_HOME_002", "倉庫受取タブ（初期表示）", "Tab nhận tại kho (ban đầu)", "/driver/list", list_items("A", list_filter_search("A") + list_cards("A") + [tab_bar("9")]), login="DR00022", today="2026/10/06",
      note=["佐々木（DR00022）・今日 2026/10/06。", "Sasaki (DR00022), hôm nay 2026/10/06."]),
    V("009", "DA_HOME_002", "未配送タブ", "Tab chưa giao", "/driver/list", list_items("B", list_filter_search("B") + list_cards("B")), setup="await click('未配送');", login="DR00022", today="2026/10/06"),
    V("010", "DA_HOME_002", "配送完了タブ", "Tab đã hoàn tất", "/driver/list", list_items("C", list_filter_search("C") + list_cards("C")),
      setup="await recvAll('WH00001'); await finishEs('DL-261005-0002'); await click('配送一覧'); await sleep(500); await click('配送完了');", login="DR00022", today="2026/10/06",
      note=["配送を1件完了した直後の例。完了から7日までは開いて修正できる。", "Ví dụ ngay sau khi hoàn tất 1 đơn. Trong 7 ngày sau hoàn tất mở và sửa được."]),
    V("011", "DA_HOME_002", "絞り込みシート（倉庫受取：ステータス）", "Sheet lọc (nhận tại kho: trạng thái)", "/driver/list",
      [A("1", "絞り込みシート", "Sheet lọc", ".fsheet", "modal", "view", [
          "下から出るシート。タイトル「絞り込み」・ステータスの選択肢（すべて／未受取／受取済／トラブル）・「閉じる」。背景を押しても閉じる。選ぶとすぐ一覧に反映する。",
          "Sheet trượt từ dưới lên. Tiêu đề 「絞り込み」, các lựa chọn trạng thái (すべて/未受取/受取済/トラブル), 「閉じる」. Bấm nền cũng đóng. Chọn là áp dụng ngay vào danh sách."]),
       A("1.1", "ステータス", "Trạng thái", ".fsheet .fopts", "radio", "select", [
           "1つだけ選ぶ。「トラブル」は未解決のトラブルがある受取地点。初期は「すべて」。",
           "Chọn đúng 1. 「トラブル」 là điểm nhận có sự cố chưa giải quyết. Mặc định 「すべて」."], req="－", init=["すべて", "Tất cả"], ex=["未受取", "未受取 (chưa nhận) — các lựa chọn: すべて/未受取/受取済/トラブル"]),
       A("1.2", "閉じる", "Đóng", ".fsheet .btn", "button", "click", ["シートを閉じる。選んだ内容は残る。", "Đóng sheet. Nội dung đã chọn được giữ."])],
      setup="await click('ステータス：');", full=False, login="DR00022", today="2026/10/06"),
    V("012", "DA_HOME_002", "絞り込みシート（未配送・配送完了）", "Sheet lọc (chưa giao・đã hoàn tất)", "/driver/list",
      [A("1", "絞り込みシート", "Sheet lọc", ".fsheet", "modal", "view", [
          "未配送・配送完了のタブのシート。倉庫・中継（すべて／各受取地点）、便の種類（すべて／ES配送便／COOL便）、トラブルのみ（オン・オフ）。",
          "Sheet của tab chưa giao・đã hoàn tất. Kho・trung chuyển (すべて/từng điểm nhận), loại chuyến (すべて/ES配送便/COOL便), chỉ sự cố (bật/tắt)."]),
       A("1.1", "倉庫・中継", "Kho・trung chuyển", ".fsheet .fopts:nth-of-type(2)", "radio", "select", ["その日の受取地点から1つ選ぶ。初期は「すべて」。", "Chọn 1 từ các điểm nhận trong ngày. Mặc định 「すべて」."], req="－", init=["すべて", "Tất cả"], ex=["関東倉庫", "Tên điểm nhận (ví dụ 「関東倉庫」)"]),
       A("1.2", "便の種類", "Loại chuyến", ".fsheet .fopts:nth-of-type(4)", "radio", "select", ["すべて／ES配送便／COOL便から1つ。ES配送便・COOL便の一覧はここで絞る（専用の画面はない）。", "Chọn 1 trong すべて/ES配送便/COOL便. Danh sách ES配送便・COOL便 lọc tại đây (không có màn riêng)."], req="－", init=["すべて", "Tất cả"], ex=["ES配送便", "ES配送便 hoặc COOL便"]),
       A("1.3", "トラブルのみ", "Chỉ sự cố", ".fsheet .fopt::トラブルのみ", "check", "check", ["オンにすると未解決のトラブルがある配送だけ。", "Bật thì chỉ hiện đơn có sự cố chưa giải quyết."], req="－", init=["オフ", "Tắt"], ex=["オン", "Bật"])],
      setup="await click('未配送'); await click('倉庫・中継');", full=False, login="DR00022", today="2026/10/06"),
    V("013", "DA_HOME_002", "検索で0件", "Tìm kiếm 0 kết quả", "/driver/list",
      [A("5", "検索", "Tìm kiếm", ".search input", "text", "input", ["一致するものがないとき一覧の中に「該当する配送はありません。」を出す（I01）。", "Khi không có kết quả hiện 「該当する配送はありません。」 trong danh sách (I01)."],
         req="－", len="文字列 60", ex=["あああ", "Chuỗi không khớp để thử trường hợp 0 kết quả"], err=["I01"]),
       A("7", "0件の表示", "Hiển thị 0 dòng", ".empty", "label", "view", ["I01 を一覧の中に出す。コードの文は「該当する受取地点／配送はありません。」で、I01（表示するデータがありません。）に揃える（宿題）。", "Hiện I01 trong danh sách. Câu trong code là 「該当する受取地点／配送はありません。」, cần thống nhất theo I01 (việc phải sửa)."], err=["I01"],
         demo_ok=["コードの文言を I01 に揃える（宿題）", "Thống nhất câu chữ trong code theo I01 (việc phải sửa)"])],
      setup="await click('未配送'); setv(document.querySelector('.search input'),'あああ'); await sleep(500);", login="DR00022", today="2026/10/06"),
    V("014", "DA_HOME_002", "期間の指定", "Chọn khoảng thời gian", "/driver/list",
      [A("2.1", "期間", "Khoảng thời gian", ".drange", "date", "click", [
          "押すと日付の範囲を選ぶ画面を出す（開始日・終了日）。決めたら閉じて一覧を読み直す。初期は今日〜今日、選べるのは90日前から。",
          "Bấm để mở màn chọn khoảng ngày (bắt đầu・kết thúc). Chọn xong thì đóng và nạp lại danh sách. Mặc định hôm nay〜hôm nay, chọn được từ 90 ngày trước."],
         req="－", len="年月日（yyyy-mm-dd）〜年月日", init=["今日〜今日", "Hôm nay〜hôm nay"], ex=["2026-09-28〜2026-10-06", "Từ 28/09/2026 đến 06/10/2026"], err=["E08", "E446"],
         demo_ok=["コードは表示だけで操作できない（宿題）。この状態は決定の画面で、選ぶ画面はまだ作っていない（Figma・台帳に画面の絵がない）", "Code chỉ hiển thị, không thao tác được (việc phải sửa). Trạng thái này là màn theo quyết định, chưa làm màn chọn (Figma・台帳 chưa có hình)"])],
      login="DR00022", today="2026/10/06",
      note=["決定のとおりの動き（期間を選べる）を、いまの画面の見出しの位置で示す。選ぶ画面の絵はコードにまだない。", "Thể hiện hoạt động theo quyết định (chọn được khoảng thời gian) tại vị trí tiêu đề của màn hiện tại. Màn chọn chưa có trong code."]),
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

_patch("5", "検索", demo=['コードは入力のたびに絞る（Enter・検索キーを待たない）。台帳 M-1 は「検索／Enter を押してから絞る」。モバイルの即時絞り込みを例外にするかは hong に確認（役割レビュー Q10）。決まるまでは台帳どおりに書き、コードは宿題', 'Code lọc ngay mỗi lần gõ (không chờ Enter・phím tìm). 台帳 M-1: lọc sau khi bấm 「検索」/Enter. Có cho phép ngoại lệ lọc tức thời trên mobile không: hỏi hong (役割レビュー Q10). Khi chưa quyết thì viết theo 台帳, code là việc phải sửa'])
_patch(None, "下のタブ", demo=["コードの下のタブ名は「廃棄・棚卸し」のまま（2行に折れて文字が落ちる：画面の宿題 UI・役割レビュー #14）。「棚卸し」に変える（受付簿 #460）と短くなり折れも解消する見込み", "Tên tab dưới trong code vẫn là 「廃棄・棚卸し」 (xuống 2 dòng và rớt chữ: việc phải sửa về UI; 役割レビュー #14). Đổi thành 「棚卸し」 (受付簿 #460) sẽ ngắn hơn và dự kiến hết xuống dòng"])
