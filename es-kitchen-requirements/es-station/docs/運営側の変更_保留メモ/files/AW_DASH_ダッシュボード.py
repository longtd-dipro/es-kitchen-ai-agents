# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「ダッシュボード」（AW_DASH）。
元は本物の Web（このリポジトリのコード app/ops/page.tsx・lib/ops/general/top.ts）。決定は docs/決定台帳.md（E・F・K・M-3 の運営 TOP の行）が正。
洗い出し・確認の記録は docs/05_画面設計書/確認メモ_AW_運営A_申請・法人・契約.md（Q4＝行ごとに権限で出し分け／H13・H14＝宿題）。

画面：AW_DASH_001 ダッシュボード（1段目＝警告カード＋お知らせ（アラート一覧）＋スケジュール、2段目＝月次購入額推移、3段目＝お気に入り × 購入分析）
見本のデータ（今日＝2026-10-05）。日付を変える状態（013・014）は後ろに置く（撮り終わると日付を戻す）。

コードと決定が違うところ（demo_ok＝決定が正・コードを直す宿題）：
  ・アラートの行は、その行の開く先の画面を見られる役割だけに出す（コードは全役割に同じ行）
  ・廃棄率 3% 超・配送停止（自社便）の行がない（コードに未実装）
  ・0件の文言が I01 と違う／読み込めなかったときの文言（E346）が出ない

撮れない状態（見本のデータで出せない。demo_ok に理由）：002 アラート0件・011／012 確定済みの月に反映していない変更。
"""

TITLE = ["ダッシュボード（AW_DASH）", "Dashboard (AW_DASH)"]
SHEET = ["ダッシュボード", "Dashboard"]
BASENAME = "画面設計書_AW_DASH_ダッシュボード"
IMG_PREFIX = "AW_DASH"
OUT_DIR = "運営管理者Web_申請・契約"
CODE_NOTE = ["画面コード規約（docs/01_仕様/画面コード規約_20261005.md）：<Module(2)>_<Feature(4)>_<Seq(3)>。AW＝Admin Web、DASH＝ダッシュボード", "Quy ước mã màn hình (画面コード規約_20261005): <Module(2)>_<Feature(4)>_<Seq(3)>. AW = Admin Web, DASH = dashboard"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/page.tsx", "lib/ops/general", "lib/domain/seed"]

DECISIONS = [
    {"date": "2026-10-07", "target": "AW_DASH_001 No.3（アラートの行）",
     "q": ["ダッシュボードのアラート一覧を、役割で出し分けるか", "Có chia hiển thị danh sách cảnh báo theo vai trò không"],
     "a": ["行ごとに、その行の開く先の画面を見られる役割だけに出す（お問い合わせ＝フル権限・システム管理だけ。ほかは全役割 R なので変わらない）。新しい表は作らない", "Mỗi dòng chỉ hiện với vai trò xem được màn hình mà dòng đó mở tới (お問い合わせ = chỉ フル権限・システム管理). Không tạo bảng mới"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営A Q4＝B・台帳 F・受付簿 No.184）"},
    {"date": "2026-10-05", "target": "AW_DASH_001 No.3・4",
     "q": ["入荷の差異・資材不足・追加発注の遅れを別カードにするか。カレンダーは4週間の切替を残すか", "Cảnh báo nhập hàng/vật tư có tách thẻ riêng không; lịch có giữ chế độ 4 tuần không"],
     "a": ["別カードにせず「お知らせ（アラート一覧）」の行に出す。カレンダーは「1ヶ月」だけ（日ごとの A1〜D7 の枠は出す）", "Không tách thẻ, hiện thành dòng trong \"お知らせ（アラート一覧）\". Lịch chỉ \"1ヶ月\" (vẫn hiện khung A1〜D7 mỗi ngày)"], "src": "hong 回答 2026-10-05（台帳 E）"},
    {"date": "2026-10-03", "target": "AW_DASH_001 No.5・6",
     "q": ["グラフの構成（支払い方法別を置くか・絞り込み）", "Cấu trúc biểu đồ (có biểu đồ theo phương thức thanh toán không, bộ lọc)"],
     "a": ["月次購入額推移とお気に入り × 購入分析の2つだけ。支払い方法別は置かない。条件（期間・法人・拠点・カテゴリ）を付ける。「売上」は「購入」と書く", "Chỉ 2 biểu đồ: 月次購入額推移 và お気に入り × 購入分析. Không có theo phương thức thanh toán. Có điều kiện (kỳ, 法人, 拠点, カテゴリ). Ghi \"購入\" thay \"売上\""], "src": "hong 回答 2026-10-03（台帳 M-3・K）"},
    {"date": "2026-10-03", "target": "AW_DASH_001 No.2.1",
     "q": ["請求の確定を25日に自動で行うか", "Có tự động chốt hóa đơn vào ngày 25 không"],
     "a": ["自動では確定しない。21日から確定が済むまで TOP に警告を出す", "Không tự chốt. Từ ngày 21 đến khi chốt xong thì hiện cảnh báo ở TOP"], "src": "hong 回答 2026-10-03（台帳 M-3）"},
    {"date": "2026-10-05", "target": "AW_DASH_001 No.2.2",
     "q": ["月間メニューの自動公開の条件が足りないとき", "Khi thiếu điều kiện tự động công bố menu tháng"],
     "a": ["自動公開日の3日前から、足りない条件を TOP に警告する（通知は送らない）", "Từ 3 ngày trước ngày tự động công bố, cảnh báo điều kiện còn thiếu ở TOP (không gửi thông báo)"], "src": "hong 回答 2026-10-05（台帳 F・RD-MN-032）"},
]

CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_DASH_001", "ja": "ダッシュボード", "vi": "Dashboard"},
]

# ---------------------------------------------------------------- 小さな関数
H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const card=(n)=>document.querySelector('.dgrid > .card:nth-child('+n+')');"
)
TRIG = {"button": "click", "link": "click", "text": "input", "textarea": "input", "select": "select", "month": "input", "date": "input", "check": "check", "radio": "check", "tab": "click", "file": "upload"}

def it(no, ja, vi, sel, kind="label", d=None, **kw):
    r = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": kw.pop("trig", TRIG.get(kind, "view"))}
    if d: r["detail"] = d
    r.update(kw)
    return r

LOCKSEED = "const P=async(u,a)=>{const r=await fetch(u,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:a})});const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}};let ls=await P('/api/domain/billing/lockedSkips',{});if(ls.length<3){const all=await P('/api/domain/org/childContracts',{});const cand=all.filter(x=>x.billStatus==='未確定'&&!x.canceled&&x.planId&&x.cycleMonth>='2026-11').sort((a,b)=>a.id.localeCompare(b.id)).slice(0,3-ls.length);for(const c of cand){await P('/api/domain/org/setBillStatus',{id:c.id,status:'確定'});await P('/api/domain/org/repriceChildren',{fromCycle:c.cycleMonth,planId:c.planId,mode:'誤りの訂正',reason:'プラン料金の入力誤りの訂正',childIds:[c.id],by:'Ad00010'});}ls=await P('/api/domain/billing/lockedSkips',{});}ls.sort((a,b)=>a.id.localeCompare(b.id));for(const x of ls.slice(1))await P('/api/domain/org/setBillStatus',{id:x.childContractId,status:'未確定'});await sleep(4500);"

def V(id, ja, vi, items, setup="", note=None, full=True, wait=None, **kw):
    v = {"id": id, "code": "AW_DASH_001", "state": [ja, vi], "url": "/ops", "setup": (H + setup) if setup else "", "full": full, "note": note or ["", ""], "items": items}
    if wait is not None: v["wait"] = wait
    v.update(kw)
    return v

C_LINE = ".dgrid > .card:nth-child(3)"
C_FAV = ".dgrid > .card:nth-child(4)"
RED = ".card[style*='192, 35, 57']"
AMB = ".card[style*='217, 119, 6']"

# ---------------------------------------------------------------- 項目
HEAD = [
    it("1", "ページ見出し", "Tiêu đề trang", ".ph", "area", ["パンくず「ダッシュボード」と見出し「ダッシュボード」。運営にログインして最初に開く画面（台帳 K）。ボタンは置かない。", "Breadcrumb \"ダッシュボード\" và tiêu đề. Màn hình đầu tiên sau khi đăng nhập vận hành (台帳 K). Không đặt nút."]),
]
WARN_ALL = [
    it("2", "警告カード（ページ上部）", "Thẻ cảnh báo (đầu trang)", ".card[style*='border-left']", "area",
       ["該当するときだけ、お知らせの上に出す。複数あれば 請求の確定／メニューの自動公開／確定済みの月の順に縦に並ぶ。該当がなければ何も出さない。", "Chỉ hiện khi có việc cần xử lý, nằm trên お知らせ. Nếu nhiều thì xếp dọc: chốt hóa đơn / tự động công bố menu / tháng đã chốt. Không có thì không hiện gì."]),
]
W_BILL = [
    it("2.1", "請求の確定がまだです（赤）", "Chưa chốt hóa đơn (đỏ)", RED, "area",
       ["20日締めのあと（21日〜）、実績精算・前払いの確定が済むまで出す。25日に自動では確定しない（台帳 M-3）。見出しは「請求の確定がまだです（締め yyyy-mm・未確定 実績精算 n件・前払い n件）」。確定が済むと消える。", "Sau kỳ chốt ngày 20 (từ ngày 21), hiện đến khi chốt xong 実績精算・前払い. Không tự chốt vào ngày 25 (台帳 M-3). Tiêu đề: \"請求の確定がまだです（締め yyyy-mm・未確定 実績精算 n件・前払い n件）\". Chốt xong thì biến mất."]),
    it("2.1.1", "請求の確定を開く", "Mở màn chốt hóa đơn", RED + " a.lnk.u", "link", ["請求の確定（/ops/billing/confirm?m=締め月）へ。", "Mở màn 請求の確定 (/ops/billing/confirm?m=tháng chốt)."], cond=["請求の確定の閲覧権限", "Quyền xem 請求の確定"]),
    it("2.1.2", "未確定の法人・拠点の一覧", "Danh sách pháp nhân / cơ sở chưa chốt", RED + " ul", "table", ["法人ごとに1行。「実績精算 未確定 拠点名」「前払い 未確定 拠点名」を「／」でつなぐ。法人名のリンクはその法人の請求の画面へ。", "Mỗi 法人 một dòng. Nối \"実績精算 未確定 tên cơ sở\" và \"前払い 未確定 tên cơ sở\" bằng \"／\". Liên kết tên 法人 mở màn hóa đơn của 法人 đó."]),
]
W_MENU = [
    it("2.2", "メニューの自動公開の警告（黄）", "Cảnh báo tự động công bố menu (vàng)", AMB + "::自動公開", "area",
       ["自動公開日の3日前から、自動公開の条件（全商品が公開可能・メニューPDFあり・その月の仮発注が承認済み）が足りないメニューを出す。自動公開日を過ぎても条件が足りなければ「自動公開できませんでした」に変わり、条件がそろうまで公開しない。通知は送らない（台帳 F）。メニューごとに1ブロック。", "Từ 3 ngày trước ngày tự động công bố, hiện menu còn thiếu điều kiện (mọi sản phẩm có thể công bố, có PDF menu, đơn nháp tháng đó đã duyệt). Quá ngày mà vẫn thiếu thì đổi thành \"自動公開できませんでした\" và không công bố đến khi đủ. Không gửi thông báo (台帳 F). Mỗi menu một khối."]),
    it("2.2.1", "メニューを開く", "Mở menu", AMB + " a.lnk.u", "link", ["月間メニューの詳細（/ops/menu/monthly/年月）へ。", "Mở chi tiết menu tháng (/ops/menu/monthly/năm-tháng)."], cond=["月間メニューの閲覧権限", "Quyền xem 月間メニュー"]),
    it("2.2.2", "足りない条件の一覧", "Danh sách điều kiện còn thiếu", AMB + " ul", "label", ["足りない条件を1行ずつ。", "Mỗi điều kiện còn thiếu một dòng."]),
]
W_LOCK = [
    it("2.3", "確定済みの月に反映していない変更（黄）", "Thay đổi chưa phản ánh vào tháng đã chốt (vàng)", AMB + "::確定済みの月", "area",
       ["プラン変更・誤りの訂正を承認したとき、請求が確定済み（まだ発行していない）の月は変えずに記録し、ここに出す。請求の画面で確定解除してから「反映」する（反映しないときは請求調整で対応）。見出し「確定済みの月に反映していない変更 n件」。", "Khi duyệt đổi gói / sửa sai, tháng có hóa đơn đã chốt (chưa phát hành) không bị đổi mà được ghi lại và hiện ở đây. Hủy chốt ở màn hóa đơn rồi bấm \"反映\" (nếu không phản ánh thì xử lý bằng điều chỉnh hóa đơn). Tiêu đề \"確定済みの月に反映していない変更 n件\"."]),
    it("2.3.1", "変更の行", "Dòng thay đổi", AMB + " li", "label", ["「拠点名 yyyy年m月 サイクル：理由（申請番号）・請求の状態 …」。", "\"tên cơ sở yyyy年m月 サイクル：lý do (số đơn)・請求の状態 …\"."]),
    it("2.3.2", "反映", "Phản ánh", AMB + " button.pri", "button", ["確定解除済みの月だけ押せる。押すと請求に反映し、結果をトーストで出す（No.2.3.5）。", "Chỉ bấm được với tháng đã hủy chốt. Bấm thì phản ánh vào hóa đơn và hiện kết quả bằng toast (No.2.3.5)."],
       cond=["請求の「反映」の権限。参照のみの役割には出さない", "Quyền \"反映\" của hóa đơn. Không hiện với vai trò chỉ xem"], err=["E30"]),
    it("2.3.3", "反映しない", "Không phản ánh", AMB + " button.out", "button", ["この変更を反映しないことにして、一覧から外す（請求調整で対応）。", "Quyết định không phản ánh thay đổi này và bỏ khỏi danh sách (xử lý bằng điều chỉnh hóa đơn)."],
       cond=["請求の「反映しない」の権限。参照のみの役割には出さない", "Quyền \"反映しない\" của hóa đơn. Không hiện với vai trò chỉ xem"], err=["E30"]),
    it("2.3.4", "確定解除へ", "Đến hủy chốt", AMB + " a.lnk.u", "link", ["まだ確定解除していない月は「反映」の代わりにこのリンクを出し、拠点の請求の画面（/ops/billing/confirm/sub/拠点ID）へ移る。", "Với tháng chưa hủy chốt, hiện liên kết này thay cho \"反映\" và mở màn hóa đơn của cơ sở (/ops/billing/confirm/sub/ID cơ sở)."]),
    it("2.3.5", "反映の結果（トースト）", "Kết quả phản ánh (toast)", ".toast", "toast", ["反映したら結果の文（何拠点・何月に反映したか）、反映しないなら「反映しないにしました」を出す。失敗は E30。", "Phản ánh xong thì hiện câu kết quả (phản ánh vào cơ sở/tháng nào), không phản ánh thì hiện \"反映しないにしました\". Lỗi là E30."], err=["E30"]),
]
ALERT = [
    it("3", "お知らせ（アラート一覧）", "お知らせ (danh sách cảnh báo)", ".dgrid > .card:nth-child(1)", "area",
       ["1段目の左。対応が必要な件数がある行だけを出す（0件の行は出さない。固定の文言・件数は持たず、共通データから数える：REQ-UI-001）。行の色＝赤（ng）・黄（warn）・青（info）。行は「分類・内容・開く」。入荷の差異・資材の在庫不足・追加発注の遅れも別カードにせずここに出す（台帳 E 2026-10-05）。", "Bên trái hàng 1. Chỉ hiện dòng có số lượng cần xử lý (dòng 0 thì không hiện; không giữ câu/số cố định, đếm từ dữ liệu chung: REQ-UI-001). Màu dòng: đỏ (ng), vàng (warn), xanh (info). Dòng gồm \"phân loại・nội dung・開く\". Chênh lệch nhập hàng, thiếu vật tư, chậm đặt bổ sung cũng hiện ở đây thay vì thẻ riêng (台帳 E 2026-10-05)."]),
    it("3.1", "今日の日付", "Ngày hôm nay", ".dgrid > .card:nth-child(1) .dhd .muted", "label", ["「今日 yyyy-mm-dd」。", "\"今日 yyyy-mm-dd\"."]),
    it("3.2", "アラートの行", "Dòng cảnh báo", ".dalert", "table",
       ["行ごとに、その行の開く先の画面を見られる役割だけに出す（台帳 F 2026-10-07・受付簿 No.184。お問い合わせの行＝フル権限・システム管理だけ。ほかの行の開く先は全役割 R なので全員に出る）。行の順は固定：配送→発注→入荷→追加発注→資材→契約申請→請求→棚卸→営業サンプル→廃棄率→配送停止（自社便）→お知らせ→お問い合わせ。", "Mỗi dòng chỉ hiện với vai trò xem được màn hình mà dòng đó mở tới (台帳 F 2026-10-07・受付簿 No.184. Dòng お問い合わせ = chỉ フル権限・システム管理; các dòng khác mở tới màn hình mà mọi vai trò đều R nên ai cũng thấy). Thứ tự cố định: 配送→発注→入荷→追加発注→資材→契約申請→請求→棚卸→営業サンプル→廃棄率→配送停止（自社便）→お知らせ→お問い合わせ."],
       demo_ok=["コードは13行のうち11行を全役割に同じく出す（お問い合わせの行を営業が「開く」と 403）。行ごとに出し分ける（宿題）", "Code hiện 11 dòng cho mọi vai trò (営業 bấm 開く ở dòng お問い合わせ sẽ bị 403). Sửa để ẩn theo từng dòng (việc phải sửa)"]),
    it("3.2.1", "配送（確認待ち）", "配送 (chờ xác nhận)", ".dalert li::配送", "label", ["「確認待ちの配送 n件（ドライバー未設定・変更の締切・短消費期限など）」の形で出す。配送管理のメニューのバッジと同じ件数。「開く」は配送管理の確認待ちの画面（/ops/delivery/review）へ。赤。", "Hiện dạng \"chờ xác nhận n件（chưa gán tài xế・hạn chót thay đổi・hạn dùng ngắn...）\". Cùng số với badge menu quản lý giao hàng. \"開く\" mở màn chờ xác nhận của quản lý giao hàng (/ops/delivery/review). Đỏ."]),
    it("3.2.2", "発注", "発注 (đặt hàng)", ".dalert li::本発注の未承認", "label", ["「本発注の未承認（24時間超）n件」「仕入先の受注不可 n件」。本発注から24時間を過ぎても仕入先が承認していない／仕入先が受注不可と回答した発注の数。「開く」は発注（/ops/purchasing/orders）へ。赤。", "\"本発注の未承認（24時間超）n件\" và \"仕入先の受注不可 n件\". Số đơn đặt hàng quá 24 giờ NCC chưa duyệt / NCC trả lời không nhận. \"開く\" mở 発注 (/ops/purchasing/orders). Đỏ."]),
    it("3.2.3", "入荷（差異・分納）", "入荷 (chênh lệch・giao nhiều đợt)", ".dalert li::入荷の差異", "label", ["「入荷の差異の対応待ち n件（発注番号：予定 n個 → 入荷 n個）」「分納の入荷予定日を過ぎた n件」。差異は対応するまで出し続ける（台帳 H）。「開く」は入荷登録へ。赤。", "\"入荷の差異の対応待ち n件（mã đặt hàng：dự kiến n → nhập n）\" và \"分納の入荷予定日を過ぎた n件\". Chênh lệch hiện đến khi được xử lý (台帳 H). \"開く\" mở 入荷登録. Đỏ."]),
    it("3.2.4", "追加発注の入荷遅れ", "Chậm nhập đặt bổ sung", "-", "label", ["「入荷予定日が便に間に合わない追加発注 n件（便は自動で動かしません。スケジュールで直してください）」。「開く」は配送スケジュールへ。赤。", "\"入荷予定日が便に間に合わない追加発注 n件（…）\". \"開く\" mở lịch giao hàng. Đỏ."], demo_ok=["見本のデータでは該当がなく撮れない", "Dữ liệu mẫu không có nên không chụp được"]),
    it("3.2.5", "資材（在庫不足）", "資材 (thiếu tồn kho)", ".dalert li::資材の在庫不足", "label", ["「資材の在庫不足 n件（倉庫 資材名 在庫（しきい値 n））」。資材の在庫がしきい値を下回っているもの。別カードにはしない（台帳 E 2026-10-05）。「開く」は資材発注へ。赤。", "\"資材の在庫不足 n件（kho tên vật tư tồn (ngưỡng n)）\". Vật tư có tồn thấp hơn ngưỡng. Không tách thẻ riêng (台帳 E 2026-10-05). \"開く\" mở 資材発注. Đỏ."]),
    it("3.2.6", "契約申請", "契約申請 (đơn hợp đồng)", ".dalert li::契約申請", "label", ["「対応が必要な申請 n件」。契約申請管理のメニューのバッジと同じ件数。「開く」は契約申請管理（/ops/applications）へ。黄。", "\"対応が必要な申請 n件\". Cùng số với badge menu 契約申請管理. \"開く\" mở 契約申請管理 (/ops/applications). Vàng."]),
    it("3.2.7", "請求（Bill One の送付エラー）", "請求 (lỗi gửi Bill One)", ".dalert li::Bill One", "label", ["「Bill One の送付エラー n件」。請求書の確定のお知らせは上の「請求の確定がまだです」に出す。「開く」は請求の確定へ。黄。", "\"Bill One の送付エラー n件\". Thông báo chốt hóa đơn hiện ở thẻ \"請求の確定がまだです\" phía trên. \"開く\" mở 請求の確定. Vàng."]),
    it("3.2.8", "棚卸（未申告）", "棚卸 (chưa khai báo)", ".dalert li::未申告の拠点", "label", ["「未申告の拠点 n件（締め mm-dd）」。この締め（20日）までにまだ棚卸を申告していない拠点（棚卸なしの拠点は除く）。「開く」は棚卸し（拠点在庫）へ。黄。", "\"未申告の拠点 n件（締め mm-dd）\". Cơ sở chưa khai báo kiểm kê đến kỳ chốt (ngày 20) (trừ cơ sở 棚卸なし). \"開く\" mở 棚卸し. Vàng."]),
    it("3.2.9", "営業サンプル", "営業サンプル (mẫu kinh doanh)", ".dalert li::営業サンプル", "label", ["「n月分の受付 使用／枠件（残り n件）」（今月・来月）と「出荷週の締めがまだ n件」。営業サンプルの警告は残す（台帳 E 2026-10-05）。「開く」は営業サンプルへ。青。", "\"n月分の受付 đã dùng／hạn mức件（còn n件）\" (tháng này, tháng sau) và \"出荷週の締めがまだ n件\". Giữ cảnh báo mẫu kinh doanh (台帳 E 2026-10-05). \"開く\" mở 営業サンプル. Xanh."]),
    it("3.2.10", "廃棄率が3%を超えた", "Tỷ lệ hủy vượt 3%", "-", "label", ["廃棄率＝廃棄 ÷（前回の在庫 ＋ 納品）。3% を超えたとき1行出す（台帳 H「廃棄率」。式はどの画面でもこの1つ）。単位（拠点ごと／月度）と消える条件は未決（確認メモ O5）。", "Tỷ lệ hủy = hủy ÷ (tồn lần trước + giao hàng). Vượt 3% thì hiện 1 dòng (台帳 H \"廃棄率\"; công thức dùng chung mọi màn hình). Đơn vị (theo cơ sở／tháng) và điều kiện biến mất chưa quyết (確認メモ O5)."],
       open=["廃棄率 3% 超のアラートの単位（拠点ごとか・どの月度か）と、いつ消えるか", "Đơn vị cảnh báo hủy >3% (theo cơ sở hay tháng nào) và khi nào biến mất"], ask="お客様（在庫・運営）",
       demo_ok=["コードにこの行がない（受付簿 #122 は「対象なし」と記録したが台帳 H は用途に含める。足す宿題）", "Code chưa có dòng này (受付簿 #122 ghi \"không có đối tượng\" nhưng 台帳 H có bao gồm. Việc phải thêm)"]),
    it("3.2.11", "配送停止（自社便）", "Dừng giao (xe công ty)", "-", "label", ["自社便だけの拠点の解約を承認したら1行出す。内容は I101。「開く」はその拠点の詳細へ。黄。", "Hiện 1 dòng khi duyệt hủy hợp đồng của cơ sở chỉ dùng xe công ty. Nội dung là I101. \"開く\" mở chi tiết cơ sở đó. Vàng."], err=["I101"],
       demo_ok=["コードは承認画面の注記だけで、この行がない（H14：足す宿題）", "Code chỉ có chú thích ở màn duyệt, chưa có dòng này (H14: việc phải thêm)"]),
    it("3.2.12", "お知らせの配信予約", "お知らせ (hẹn giờ gửi)", ".dalert li::配信予約", "label", ["「配信予約 n件」。公開開始が先のお知らせの数。「開く」はお知らせ一覧へ。青。", "\"配信予約 n件\". Số お知らせ có ngày bắt đầu công bố ở tương lai. \"開く\" mở danh sách お知らせ. Xanh."]),
    it("3.2.13", "お問い合わせ（新着）", "お問い合わせ (mới)", ".dalert li::新しいお問い合わせ", "label", ["「新しいお問い合わせ n件」。まだ開いていないもの。フル権限・システム管理だけに出す（Q4＝B）。「開く」はお問い合わせへ。黄。HubSpot に送れなかった問い合わせは ES に残さないので、送信エラーの行は作らない（台帳 F）。", "\"新しいお問い合わせ n件\". Số chưa mở. Chỉ hiện với フル権限・システム管理 (Q4=B). \"開く\" mở お問い合わせ. Vàng. Yêu cầu không gửi được tới HubSpot không lưu ở ES nên không có dòng lỗi gửi (台帳 F)."],
       demo_ok=["コードは文末に「（HubSpot 送信）」を付け、全役割に出す。付けない・権限で出し分ける（宿題）", "Code thêm \"（HubSpot 送信）\" cuối câu và hiện cho mọi vai trò. Bỏ đi và ẩn theo quyền (việc phải sửa)"]),
    it("3.2.14", "「開く」", "\"開く\"", ".dalert li a.lnk.u", "link", ["その行の開く先の画面へ移る（同じ画面。別のタブは開かない）。", "Mở màn hình tương ứng của dòng (cùng tab, không mở tab mới)."]),
    it("3.3", "アラートが0件のとき", "Khi không có cảnh báo", ".dgrid > .card:nth-child(1) p.muted::対応が必要なものはありません", "label", ["全部の行が0件のとき、行の代わりに I103 を出す（I01「表示するデータがありません。」とは意味が違う＝良い状態のため別の ID）。", "Khi mọi dòng là 0, hiện I103 thay cho các dòng (khác ý nghĩa với I01 \"表示するデータがありません。\" vì đây là trạng thái tốt nên dùng ID riêng)."], err=["I103"],
       demo_ok=["見本のデータでは何かしらアラートが出るので撮れない（全部が0件になるデータが必要）", "Dữ liệu mẫu luôn có cảnh báo nên không chụp được (cần dữ liệu mà mọi dòng đều 0)"]),
]
SCHED = [
    it("4", "スケジュール", "Lịch", ".dgrid > .card:nth-child(2)", "area", ["1段目の右。表示は1ヶ月だけ（4週間の ES サイクル表示はない・台帳 E 2026-10-05）。月曜始まりの週で並べ、日ごとに ES サイクルの枠（A1〜D7）を出す。予定は共通データ（配送・サイクル・メニュー）から作る（REQ-UI-002）。", "Bên phải hàng 1. Chỉ hiển thị 1 tháng (không có chế độ 4 tuần ES サイクル; 台帳 E 2026-10-05). Tuần bắt đầu từ thứ Hai, mỗi ngày hiện khung ES サイクル (A1〜D7). Lịch tạo từ dữ liệu chung (giao hàng・chu kỳ・menu) (REQ-UI-002)."]),
    it("4.1", "見出し（表示中の月）", "Tiêu đề (tháng đang hiện)", ".dgrid > .card:nth-child(2) h3", "label", ["「スケジュール｜yyyy-mm」。", "\"スケジュール｜yyyy-mm\"."]),
    it("4.2", "前へ", "Trước", ".dgrid > .card:nth-child(2) button::前へ", "button", ["前の月へ移る。", "Chuyển sang tháng trước."]),
    it("4.3", "今日", "Hôm nay", ".dgrid > .card:nth-child(2) button::今日", "button", ["今日の月へ戻る。今日の月を見ているときは押せない。", "Quay về tháng hiện tại. Không bấm được khi đang xem tháng hiện tại."]),
    it("4.4", "次へ", "Sau", ".dgrid > .card:nth-child(2) button::次へ", "button", ["次の月へ移る。", "Chuyển sang tháng sau."]),
    it("4.5", "配送管理のスケジュールへ", "Đến lịch của quản lý giao hàng", ".dgrid > .card:nth-child(2) a.lnk.u", "link", ["配送管理のスケジュール（/ops/delivery/schedule）へ。", "Mở lịch của quản lý giao hàng (/ops/delivery/schedule)."]),
    it("4.6", "カレンダー", "Lịch tháng", ".dcal", "table", ["曜日の見出し（月〜日）と日付のセル。月の外の日は薄く、今日は強調、土日は色を変える。", "Tiêu đề thứ (Hai〜CN) và ô ngày. Ngày ngoài tháng mờ, hôm nay nổi bật, thứ Bảy/CN đổi màu."]),
    it("4.7", "今日のセル", "Ô hôm nay", ".dcell.today", "label", ["今日の日付のセル（見本は 2026-10-05＝サイクル D1）。", "Ô của ngày hôm nay (mẫu là 2026-10-05 = chu kỳ D1)."]),
    it("4.8", "ES サイクルの枠", "Khung ES サイクル", ".dcell .slot", "label", ["A1〜D7。ES サイクル（4週間・A〜D の4つ×7日）のどの日にあたるか。サイクルの外の日は出さない。", "A1〜D7. Cho biết ngày thuộc ngày nào trong ES サイクル (4 tuần = 4 nhóm A〜D × 7 ngày). Ngày ngoài chu kỳ không hiện."]),
    it("4.9", "予定のバッジ", "Nhãn lịch", ".dcell span.info", "label", ["日ごとの予定（固定の7種）：サイクル開始（青）／オーダー締切（黄）／メニュー公開・自動公開（青）／出荷 n件／資材便 n件／棚卸・実績精算の締め（20日・黄）／請求の確定（21日から・黄）。取消・中止の便は数えない。", "Lịch từng ngày (cố định 7 loại): サイクル開始 (xanh) / オーダー締切 (vàng) / メニュー公開・自動公開 (xanh) / 出荷 n件 / 資材便 n件 / 棚卸・実績精算の締め (ngày 20, vàng) / 請求の確定 (từ ngày 21, vàng). Không tính chuyến đã hủy/dừng."]),
]
LINE = [
    it("5", "月次購入額推移", "Biến động tổng tiền mua theo tháng", C_LINE, "area", ["2段目（横いっぱい）。折れ線＝月ごとの購入額（税抜）。「売上」ではなく「購入」と書く（台帳 M-3）。数はデモの値。", "Hàng 2 (full chiều ngang). Đường gấp khúc = số tiền mua từng tháng (chưa thuế). Ghi \"購入\" không phải \"売上\" (台帳 M-3). Số liệu là giá trị demo."]),
    it("5.1", "見出し（期間）", "Tiêu đề (kỳ)", C_LINE + " .dhd", "label", ["「月次購入額推移」と、表示中の期間「yyyy-mm〜yyyy-mm」。", "\"月次購入額推移\" và kỳ đang hiện \"yyyy-mm〜yyyy-mm\"."]),
    it("5.2", "条件", "Điều kiện", C_LINE + " .filter", "area", ["一覧の検索条件と同じ見た目・同じ動き（es-search）。「検索」か Enter で反映し、入力中にグラフは変わらない。「未適用」の印は出さない（台帳 F・受付簿 #127）。", "Giao diện và cách hoạt động giống điều kiện tìm kiếm của danh sách (es-search). Áp dụng khi bấm \"検索\" hoặc Enter, biểu đồ không đổi khi đang nhập. Không hiện dấu \"未適用\" (台帳 F・受付簿 #127)."], pattern="P-LIST",
       ),
    it("5.2.1", "期間（から）", "Kỳ (từ)", C_LINE + " [aria-label='期間（から）']", "month", req="－", len="年月", init=["12ヶ月前の月", "Tháng cách 12 tháng"], ex=["2026-04", "Năm-tháng bắt đầu của kỳ"],
       d=["年月で入れる（月を選ぶボタンもある）。初期値は当月の前月から数えて12ヶ月前。", "Nhập năm-tháng (có nút chọn tháng). Mặc định là tháng cách 12 tháng tính từ tháng trước."]),
    it("5.2.2", "期間（まで）", "Kỳ (đến)", C_LINE + " [aria-label='期間（まで）']", "month", req="－", len="年月", init=["前月", "Tháng trước"], ex=["2026-09", "Năm-tháng kết thúc của kỳ"],
       d=["年月で入れる。初期値は前月（月末まで確定した月）。", "Nhập năm-tháng. Mặc định là tháng trước (tháng đã kết thúc)."]),
    it("5.2.3", "法人", "Pháp nhân (法人)", C_LINE + " select[aria-label='法人']", "select", req="－", len=["選択", "Chọn"], init=["法人（すべて）", "Tất cả pháp nhân"], ex=["株式会社サンプル", "Chọn 1 pháp nhân; không chọn là tất cả"],
       d=["月ごとの購入の集計に出てくる法人。法人を変えたら拠点は選び直し。", "Các 法人 xuất hiện trong tổng hợp mua theo tháng. Đổi 法人 thì chọn lại 拠点."]),
    it("5.2.4", "拠点", "Cơ sở (拠点)", C_LINE + " select[aria-label='拠点']", "select", req="－", len=["選択", "Chọn"], init=["拠点（すべて）", "Tất cả cơ sở"], ex=["株式会社サンプル 大阪支店", "Chọn 1 cơ sở; chỉ hiện cơ sở của 法人 đã chọn"],
       d=["選んだ法人の拠点だけが選択肢に出る（法人を選ばないときは全部）。", "Chỉ hiện cơ sở của 法人 đã chọn (không chọn 法人 thì hiện tất cả)."]),
    it("5.2.5", "クリア", "Xóa điều kiện", C_LINE + " .f-act button::クリア", "button", ["条件を初期値に戻し、グラフも初期の表示に戻す。", "Đưa điều kiện về ban đầu và biểu đồ về hiển thị ban đầu."]),
    it("5.2.6", "検索", "Tìm kiếm", C_LINE + " .f-act button::検索", "button", ["条件をグラフに反映する。", "Áp dụng điều kiện vào biểu đồ."]),
    it("5.3", "折れ線グラフ", "Biểu đồ đường", C_LINE + " svg.dsvg", "area", ["縦軸＝購入額（万円）、横軸＝年月。点にマウスを乗せると「yyyy-mm：金額（円）」。購入のない月は0。", "Trục dọc = số tiền mua (vạn yên), trục ngang = năm-tháng. Rê chuột lên điểm hiện \"yyyy-mm：số tiền (yên)\". Tháng không mua = 0."]),
    it("5.4", "0件のとき", "Khi 0 kết quả", C_LINE + " p.muted", "label", ["該当する月がないとき I01 を出す。", "Khi không có tháng phù hợp thì hiện I01."], err=["I01"],
       demo_ok=["コードの文言は「条件に一致するデータがありません。条件を変えるか「クリア」を押してください。」。I01 に揃える（宿題）", "Câu trong code là \"条件に一致するデータがありません。条件を変えるか「クリア」を押してください。\". Đồng nhất với I01 (việc phải sửa)"]),
]
FAV = [
    it("6", "お気に入り × 購入分析", "Phân tích yêu thích × mua hàng", C_FAV, "area", ["3段目（横いっぱい）。棒＝商品ごとの購入金額（左軸）、線＝お気に入り件数（右軸）。お気に入り件数は商品ごとで、法人・拠点では分けない。", "Hàng 3 (full chiều ngang). Cột = số tiền mua từng sản phẩm (trục trái), đường = số lượt yêu thích (trục phải). Lượt yêu thích tính theo sản phẩm, không chia theo 法人・拠点."]),
    it("6.1", "見出し（期間・商品数）", "Tiêu đề (kỳ・số sản phẩm)", C_FAV + " .dhd", "label", ["「お気に入り × 購入分析」と「yyyy-mm・n商品」。", "\"お気に入り × 購入分析\" và \"yyyy-mm・n sản phẩm\"."]),
    it("6.2", "条件", "Điều kiện", C_FAV + " .filter", "area", ["No.5.2 と同じ動き。条件は 期間・法人・拠点・カテゴリ。", "Cùng cách hoạt động với No.5.2. Điều kiện: kỳ・法人・拠点・カテゴリ."], pattern="P-LIST"),
    it("6.2.1", "期間（から）", "Kỳ (từ)", C_FAV + " [aria-label='期間（から）']", "month", req="－", len="年月", init=["当月", "Tháng này"], ex=["2026-09", "Năm-tháng bắt đầu của kỳ"], d=["初期値は当月。", "Mặc định là tháng này."]),
    it("6.2.2", "期間（まで）", "Kỳ (đến)", C_FAV + " [aria-label='期間（まで）']", "month", req="－", len="年月", init=["当月", "Tháng này"], ex=["2026-10", "Năm-tháng kết thúc của kỳ"], d=["初期値は当月。", "Mặc định là tháng này."]),
    it("6.2.3", "法人", "Pháp nhân (法人)", C_FAV + " select[aria-label='法人']", "select", req="－", len=["選択", "Chọn"], init=["法人（すべて）", "Tất cả pháp nhân"], ex=["株式会社サンプル", "Chọn 1 pháp nhân; không chọn là tất cả"], d=["No.5.2.3 と同じ。", "Giống No.5.2.3."]),
    it("6.2.4", "拠点", "Cơ sở (拠点)", C_FAV + " select[aria-label='拠点']", "select", req="－", len=["選択", "Chọn"], init=["拠点（すべて）", "Tất cả cơ sở"], ex=["株式会社サンプル 本社", "Chọn 1 cơ sở"], d=["No.5.2.4 と同じ。", "Giống No.5.2.4."]),
    it("6.2.5", "カテゴリ（複数）", "Danh mục (nhiều)", C_FAV + " [role=group][aria-label='カテゴリ']", "check", req="－", len=["複数選択（商品カテゴリ）", "Chọn nhiều (danh mục sản phẩm)"], init=["チェックなし（すべてのカテゴリ）", "Không tích (tất cả danh mục)"], ex=["サラダ・主食", "Tích nhiều danh mục; không tích là tất cả"],
       d=["商品カテゴリをチェックで複数選ぶ。選ばないときは全カテゴリ。選択肢は商品カテゴリ管理の名前から作る。", "Tích chọn nhiều danh mục sản phẩm. Không chọn là tất cả. Lựa chọn lấy từ tên ở 商品カテゴリ管理."]),
    it("6.2.6", "クリア", "Xóa điều kiện", C_FAV + " .f-act button::クリア", "button", ["条件を初期値に戻す。", "Đưa điều kiện về ban đầu."]),
    it("6.2.7", "検索", "Tìm kiếm", C_FAV + " .f-act button::検索", "button", ["条件をグラフに反映する。", "Áp dụng điều kiện vào biểu đồ."]),
    it("6.3", "棒・折れ線グラフ", "Biểu đồ cột và đường", C_FAV + " svg.dsvg", "area", ["商品名は先頭8文字で省略（全文は点・棒にマウスを乗せると出る：「商品名：金額・お気に入り n件」）。購入金額の多い順に並ぶ。", "Tên sản phẩm cắt 8 ký tự đầu (rê chuột lên cột/điểm để xem đủ: \"tên sản phẩm：số tiền・yêu thích n件\"). Sắp theo số tiền mua giảm dần."]),
    it("6.4", "凡例", "Chú thích", C_FAV + " .dleg", "label", ["「購入金額（左）」「お気に入り件数（右）」。", "\"購入金額（左）\" và \"お気に入り件数（右）\"."]),
    it("6.5", "0件のとき", "Khi 0 kết quả", C_FAV + " p.muted", "label", ["該当する商品がないとき I01 を出す。", "Khi không có sản phẩm phù hợp thì hiện I01."], err=["I01"],
       demo_ok=["コードの文言は No.5.4 と同じ（I01 に揃える宿題）", "Câu trong code giống No.5.4 (đồng nhất với I01 là việc phải sửa)"]),
]
LOADERR = [
    it("7", "読み込めなかったとき", "Khi không tải được", C_LINE + " p.muted", "label", ["アラート・スケジュール・グラフの取得に失敗したら、そのカードの中に E346 を出す。ほかのカードは普通に出す。", "Khi lấy dữ liệu cảnh báo/lịch/biểu đồ thất bại thì hiện E346 trong thẻ đó. Các thẻ khác vẫn hiện bình thường."], err=["E346"],
       demo_ok=["コードは失敗しても「読み込み中…」のまま止まる（E346 を出す宿題）。撮影は通信を止めて「読み込み中…」を撮る", "Code khi lỗi vẫn dừng ở \"読み込み中…\" (việc phải sửa: hiện E346). Khi chụp, chặn mạng và chụp \"読み込み中…\""]),
]
ROLE = [
    it("8", "参照のみの役割", "Vai trò chỉ xem", ".dgrid > .card:nth-child(1)", "area", ["全役割がダッシュボードを見られる（R）。参照のみの役割（閲覧のみ・営業・CS など）には、書き換えのボタン（「反映」「反映しない」）を出さない。アラートの行は No.3.2 のとおり、開く先の画面を見られる役割だけに出す。", "Mọi vai trò đều xem được dashboard (R). Vai trò chỉ xem (閲覧のみ・営業・CS...) không hiện nút ghi (\"反映\", \"反映しない\"). Dòng cảnh báo theo No.3.2: chỉ hiện với vai trò xem được màn hình đích."],
       demo_ok=["閲覧のみ（Ad00013）でもお問い合わせの行が出る（行ごとの出し分けは宿題）。「反映」は見本に該当がなく撮れない", "Ngay cả 閲覧のみ (Ad00013) vẫn thấy dòng お問い合わせ (ẩn theo dòng là việc phải sửa). \"反映\" không có dữ liệu nên không chụp được"]),
]

# ---------------------------------------------------------------- 状態
ALL = {x["no"]: x for g in (HEAD, WARN_ALL, W_BILL, W_MENU, W_LOCK, ALERT, SCHED, LINE, FAV, LOADERR, ROLE) for x in g}

def P(*nos):
    return [ALL[n] for n in nos]

FAILJS = (
    "window.fetch=()=>Promise.reject(new Error('offline'));"
    "const c=card(3);setv(c.querySelector('[aria-label=\"期間（から）\"]'),'2026-03');btn('検索',c).click();await sleep(800);"
)
VIEWS = [
    V("001", "初期表示", "Hiển thị ban đầu",
      P("1", "3", "3.1", "3.2", "3.2.1", "3.2.3", "3.2.5", "3.2.6", "3.2.7", "3.2.8", "3.2.9", "3.2.13", "3.2.14",
        "4", "4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8", "4.9",
        "5", "5.1", "5.2", "5.2.1", "5.2.2", "5.2.3", "5.2.4", "5.2.5", "5.2.6", "5.3",
        "6", "6.1", "6.2", "6.3", "6.4"),
      note=["今日＝2026-10-05。警告カードは出ない（請求の確定は21日から・メニューは自動公開日の3日前から）。", "Hôm nay = 2026-10-05. Không có thẻ cảnh báo (chốt hóa đơn từ ngày 21, menu từ 3 ngày trước ngày tự động công bố)."]),
    V("002", "アラート 0件", "Không có cảnh báo", P("3", "3.3", "3.2.4", "3.2.10", "3.2.11"),
      note=["全部の行が0件のとき（見本のデータでは撮れない）。", "Khi mọi dòng là 0 (dữ liệu mẫu không chụp được)."]),
    V("003", "スケジュール：前の月・次の月", "Lịch: tháng trước・tháng sau", P("4", "4.1", "4.2", "4.3", "4.4", "4.6"),
      setup="btn('次へ',card(2)).click();await sleep(600);", note=["「次へ ›」を押した状態（翌月）。「‹ 前へ」も同じ動きで前の月へ移る。", "Trạng thái sau khi bấm \"次へ ›\" (tháng sau). \"‹ 前へ\" cũng hoạt động tương tự để sang tháng trước."]),
    V("004", "スケジュール：今日へ戻る", "Lịch: quay về hôm nay", P("4.1", "4.3", "4.7"),
      setup="btn('次へ',card(2)).click();await sleep(500);btn('今日',card(2)).click();await sleep(600);", note=["翌月を見たあとに「今日」を押すと今日の月に戻り、「今日」は押せなくなる。", "Sau khi xem tháng sau, bấm \"今日\" thì quay về tháng hiện tại và nút \"今日\" bị khóa."]),
    V("005", "月次購入額推移：条件を変えて検索", "Biến động mua theo tháng: đổi điều kiện và tìm", P("5.1", "5.2", "5.2.1", "5.2.2", "5.2.3", "5.2.4", "5.2.5", "5.2.6", "5.3"),
      setup="const c=card(3);setv(c.querySelector('[aria-label=\"期間（から）\"]'),'2026-04');setv(c.querySelector('[aria-label=\"期間（まで）\"]'),'2026-09');const s=c.querySelector('select[aria-label=\"拠点\"]');setsel(s,s.options[2].value);btn('検索',c).click();await sleep(800);",
      note=["期間 2026-04〜2026-09・拠点＝大阪支店で検索した状態。「未適用」の印は出さない（H2）。", "Trạng thái tìm với kỳ 2026-04〜2026-09 và cơ sở = 大阪支店. Không hiện dấu \"未適用\" (H2)."]),
    V("006", "月次購入額推移：0件", "Biến động mua theo tháng: 0 kết quả", P("5.1", "5.4"),
      setup="const c=card(3);setv(c.querySelector('[aria-label=\"期間（から）\"]'),'2020-01');setv(c.querySelector('[aria-label=\"期間（まで）\"]'),'2020-03');btn('検索',c).click();await sleep(800);",
      note=["購入のない期間（2020-01〜2020-03）を指定した状態。", "Trạng thái chọn kỳ không có mua hàng (2020-01〜2020-03)."]),
    V("007", "お気に入り × 購入分析：初期表示", "Phân tích yêu thích × mua: ban đầu", P("6", "6.1", "6.3", "6.4"),
      note=["当月（2026-10）の商品ごとの購入金額（棒）とお気に入り件数（線）。", "Số tiền mua (cột) và lượt yêu thích (đường) theo sản phẩm của tháng này (2026-10)."]),
    V("008", "お気に入り × 購入分析：期間・カテゴリで検索", "Phân tích yêu thích × mua: tìm theo kỳ・danh mục", P("6.2", "6.2.1", "6.2.2", "6.2.5", "6.2.7", "6.3"),
      setup="const c=card(4);setv(c.querySelector('[aria-label=\"期間（から）\"]'),'2026-08');const cb=[...c.querySelectorAll('[role=group] input[type=checkbox]')];cb[0].click();cb[1].click();await sleep(200);btn('検索',c).click();await sleep(800);",
      note=["期間 2026-08〜2026-10・カテゴリ「サラダ」「主食」を選んで検索した状態。", "Trạng thái tìm với kỳ 2026-08〜2026-10 và chọn danh mục \"サラダ\", \"主食\"."]),
    V("009", "お気に入り × 購入分析：0件", "Phân tích yêu thích × mua: 0 kết quả", P("6.1", "6.5"),
      setup="const c=card(4);setv(c.querySelector('[aria-label=\"期間（から）\"]'),'2020-01');setv(c.querySelector('[aria-label=\"期間（まで）\"]'),'2020-03');btn('検索',c).click();await sleep(800);",
      note=["購入のない期間を指定した状態。", "Trạng thái chọn kỳ không có mua hàng."]),
    V("010", "読み込めなかったとき", "Khi không tải được", P("7"), setup=FAILJS, wait=300,
      note=["通信を止めて「検索」を押した状態（コードは「読み込み中…」のまま）。", "Trạng thái chặn mạng rồi bấm \"検索\" (code vẫn dừng ở \"読み込み中…\")."]),
    V("011", "確定済みの月に反映していない変更", "Thay đổi chưa phản ánh vào tháng đã chốt", P("2", "2.3", "2.3.1", "2.3.2", "2.3.3", "2.3.4"),
      setup=LOCKSEED, note=["誤りの訂正を、確定した子契約3件に当てた状態（1件は確定のまま＝「確定解除へ」、2件は請求の画面で確定解除した＝「反映」を押せる）。", "Trạng thái áp dụng 誤りの訂正 cho 3 hợp đồng con đã chốt (1 cái vẫn chốt = \"確定解除へ\", 2 cái đã hủy chốt ở màn hóa đơn = bấm được \"反映\")."]),
    V("012", "反映・反映しない（トースト）", "Phản ánh・không phản ánh (toast)", P("2.3.2", "2.3.3", "2.3.5"),
      setup=LOCKSEED + "[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='反映').click();await sleep(700);", note=["「反映」を1件押した直後（結果のトースト）。残りの行には「反映」「反映しない」「確定解除へ」が残る。「反映しない」の結果は「反映しないにしました」。", "Ngay sau khi bấm 1 \"反映\" (toast kết quả). Các dòng còn lại vẫn có \"反映\", \"反映しない\", \"確定解除へ\". Kết quả của \"反映しない\" là \"反映しないにしました\"."]),
    V("013", "請求の確定がまだです（21日〜）", "Chưa chốt hóa đơn (từ ngày 21)", P("2", "2.1", "2.1.1", "2.1.2", "3.2.2"),
      today="2026/10/22", note=["今日を 2026-10-22 にした状態。発注の行（本発注の未承認 24時間超）も出る。", "Trạng thái đổi hôm nay thành 2026-10-22. Dòng 発注 (本発注の未承認 24時間超) cũng hiện."]),
    V("014", "メニューの自動公開の警告", "Cảnh báo tự động công bố menu", P("2.2", "2.2.1", "2.2.2"),
      today="2026/10/29", note=["今日を 2026-10-29 にした状態（自動公開日 2026-11-01 の3日前）。自動公開日を過ぎると「自動公開できませんでした」に変わる（2026-11-02 以降）。", "Trạng thái đổi hôm nay thành 2026-10-29 (3 ngày trước ngày tự động công bố 2026-11-01). Quá ngày thì đổi thành \"自動公開できませんでした\" (từ 2026-11-02)."]),
    V("015", "参照のみの役割", "Vai trò chỉ xem", P("8", "3.2.1", "3.2.13"),
      login="Ad00013", today="", note=["閲覧のみ（Ad00013）でログインした状態。", "Trạng thái đăng nhập bằng 閲覧のみ (Ad00013)."]),
    V("016", "お知らせの配信予約（アラートの行）", "Hẹn giờ gửi お知らせ (dòng cảnh báo)", P("3.2", "3.2.12"),
      setup="await fetch('/api/domain/notice/saveAnnouncement',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{sites:['corp'],category:'お知らせ',important:false,title:'11月のメンテナンスのお知らせ',body:'見本の配信予約です。',publishFrom:'2026/11/01',publishTo:'',files:[]}})});await sleep(4500);",
      note=["公開開始が先（2026-11-01）のお知らせを1件登録した状態。アラートの行に「配信予約 1件」（青）が出る。", "Trạng thái đã đăng ký 1 お知らせ có ngày bắt đầu công bố ở tương lai (2026-11-01). Dòng cảnh báo hiện \"配信予約 1件\" (xanh)."]),
]
