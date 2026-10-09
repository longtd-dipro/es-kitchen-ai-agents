# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「お知らせ一覧」（AW_NOTI。Figma Notification Management と同じ頭）。
元は本物の Web（app/ops/notices・app/ops/_general/gen.ts notices）。決定は docs/決定台帳.md「お知らせの ID・カテゴリ」「お知らせの配信停止」
「お知らせの配信対象の列名・添付・並び」「お知らせのメールの差出人・署名」「お知らせ」（メールだけ）「お客様の休みの日に当たる知らせ」。
洗い出し：docs/05_画面設計書/確認メモ_AW_お客様対応_レビュー・お知らせ・お問い合わせ.md

コードと決定が違うところ（demo_ok）：ID は NT-＋5桁（コードは数字）／状態「予約中」→「予定中」／カテゴリ 4つ／配信停止のボタン／「ESSへお知らせ」→「ES STATION に表示」／
日時は日付部品＋時刻／パンくず「お知らせ・ご意見」／差出人・署名は設定値／メール本文は必須
"""

TITLE = ["お知らせ一覧（AW_NOTI）", "Thông báo (AW_NOTI)"]
SHEET = ["お知らせ一覧", "Thông báo"]
BASENAME = "画面設計書_AW_NOTI_お知らせ"
IMG_PREFIX = "AW_NOTI"
OUT_DIR = "AW_NOTI_お知らせ"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、NOTI＝お知らせ（Figma Notification Management の AW_NOTI と同じ）", "Quy ước mã màn hình: AW = Admin Web, NOTI = Notification (giống AW_NOTI trong Figma)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

DECISIONS = [
    {"date": "2026-10-05", "target": "AW_NOTI 全体", "q": ["お知らせの ID とカテゴリ", "ID và カテゴリ"], "a": ["NT-＋5桁。カテゴリは お知らせ／メニュー／メンテナンス／システム更新 の4つ（固定）", "NT-+5 số. 4 カテゴリ cố định"], "src": "hong 回答 2026/10/05（N1・N2）"},
    {"date": "2026-10-05", "target": "AW_NOTI 全体", "q": ["「予約中」の名前", "Tên trạng thái 予約中"], "a": ["アンケートと同じ「予定中」に統一", "Thống nhất 予定中 như アンケート"], "src": "hong 回答 2026/10/05（C2＝A）"},
    {"date": "2026-10-05", "target": "AW_NOTI_001 No.3.12、AW_NOTI_003 No.1.3", "q": ["配信停止のボタン", "Nút 配信停止"], "a": ["詳細と一覧に置く（公開中・予定中）。配信停止は編集不可・削除可", "Đặt ở 詳細 và 一覧 (公開中・予定中). 配信停止 không sửa, xóa được"], "src": "hong 回答 2026/10/05（N3）"},
    {"date": "2026-10-05", "target": "AW_NOTI_002 No.3.2", "q": ["「ESSへお知らせ」の列名", "Tên cột ESSへお知らせ"], "a": ["「ES STATION に表示」", "ES STATION に表示"], "src": "hong 回答 2026/10/05（N4＝B）"},
    {"date": "2026-10-05", "target": "AW_NOTI_002 No.6.2・6.5", "q": ["差出人・署名欄", "Người gửi và chữ ký mail"], "a": ["設定値（システム管理が設定管理で変える）。初期値はコードの値", "Giá trị cài đặt (システム管理 đổi ở 設定管理). Mặc định = giá trị trong code"], "src": "hong 回答 2026/10/05（N5）"},
    {"date": "2026-10-05", "target": "AW_NOTI_002 No.6.4・4.7・一覧", "q": ["メール本文の必須・添付の決まり・一覧の初期の並び", "メール本文 bắt buộc, quy tắc đính kèm, thứ tự 一覧"], "a": ["メール送信があればメール本文は必須。添付は共通基準（JPG・PNG・PDF・HEIC・5MB・10件、メールに付けない）。一覧は最終更新日の降順", "Bắt buộc khi có mail. Đính kèm theo chuẩn chung. 一覧 sắp theo 最終更新日 giảm dần"], "src": "hong 回答 2026/10/05（N6・N8・N9）"},
    {"date": "2026-10-05", "target": "AW_NOTI_002 No.6.1・6.3・6.4・6.5", "q": ["メールの件名・本文・日時指定・署名欄の既定値と、直せるか", "Giá trị mặc định của 件名・本文・日時指定・署名 và có sửa được không"],
     "a": ["既定値＝お知らせの内容（件名＝タイトル・メール本文＝本文・日時指定＝おすすめの日時）。どれも直せる。署名欄も直せる（既定値＝設定値）。件名は送るとき先頭に【ESステーション】を付ける（Message List と同じ）", "Mặc định = nội dung お知らせ (件名 = タイトル, メール本文 = 本文, 日時指定 = giờ gợi ý). Đều sửa được. 署名 cũng sửa được (mặc định = giá trị cài đặt). Khi gửi tự thêm【ESステーション】ở đầu 件名 (như Message List)"], "src": "hong の HTML 指摘 2026/10/05 夕（受付簿 #136）"},
    {"date": "2026-10-05", "target": "AW_NOTI_002 No.4", "q": ["個別選択のポップアップ", "Popup 個別選択"],
     "a": ["区分ごとに別のポップアップ（候補の列・検索の欄が違う）。設計書には区分ごとの状態を書く", "Mỗi 区分 một popup riêng (cột và ô tìm khác nhau). 設計書 ghi từng 区分"], "src": "hong の HTML 指摘 2026/10/05 夕（受付簿 #137）"},
    {"date": "2026-10-05", "target": "AW_NOTI_002 No.5.6", "q": ["添付の上限と欄の説明文", "Giới hạn đính kèm và câu giải thích"], "a": ["共通基準のまま 10件。説明文は「各サイトのお知らせ詳細で開けます。メールには添付しません（JPG・PNG・PDF・HEIC、1件 5MB、10件まで）」", "Giữ chuẩn chung 10 tệp. Câu giải thích như bên trái (bỏ ESS và mã yêu cầu)"], "src": "hong 回答 2026/10/05 夕（受付簿 #138・#139）"},
    {"date": "2026-10-05", "target": "AW_NOTI_001 No.1", "q": ["検索条件の枠の部品", "Component khung tìm kiếm"], "a": ["ES Kitchen デザインシステムの es-search に統一（マスタ一覧と同じ）。共通の部品を直した", "Thống nhất sang es-search (như マスタ一覧). Đã sửa component chung"], "src": "hong 回答 2026/10/05 夕（受付簿 #140＝A）"},
    {"date": "2026-10-05", "target": "AW_NOTI_001 No.1", "q": ["「未適用」の印", "Dấu 未適用"], "a": ["出さない（全部の一覧）", "Không hiện (mọi 一覧)"], "src": "hong 回答 2026/10/05（受付簿 #127）"},
    {"date": "2026-10-05", "target": "パンくず", "q": ["メニューの組の名前", "Tên nhóm menu"], "a": ["お知らせ・ご意見", "Nhóm「お知らせ・ご意見」(thông báo và ý kiến)"], "src": "hong 回答 2026/10/05（C4＝A）"},
]
CHANGES = []
HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_NOTI_001", "ja": "お知らせ一覧", "vi": "Danh sách thông báo"},
    {"code": "AW_NOTI_002", "ja": "お知らせ新規登録・編集", "vi": "Đăng ký / sửa thông báo"},
    {"code": "AW_NOTI_003", "ja": "お知らせ詳細", "vi": "Chi tiết thông báo"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const row=(id)=>[...document.querySelectorAll('tr')].find(tr=>(tr.textContent||'').includes(id));"
    "const api=async(op,args)=>{const r=await fetch('/api/ops/area/general/'+op,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args})});return r.ok?r.json():null;};"
    "const TG=(c)=>({corp:{ess:!!c,mail:[],mode:'all',picks:[]},app:{ess:false,mail:[],mode:'all',picks:[]},dlv:{ess:false,mail:[],mode:'all',picks:[]},staff:{ess:false,mail:[],mode:'all',picks:[]},sup:{ess:false,mail:[],mode:'all',picks:[]}});"
    "const mk=async(title,start,end)=>{const r=await api('saveNotice',{form:{title,cat:'お知らせ',important:false,start,end,files:0,body:'撮影用の見本です。',subj:'',mailAt:'',mailBody:'',tg:TG(true)}});return r&&r.id;};"
)
MK_FUTURE = "const fid=await mk('冬季の営業時間のご案内（見本）','2026/12/01 08:00','');"
MK_PAST = "const pid=await mk('9月のメニュー公開のお知らせ（見本）','2026/09/01 08:00','2026/09/20 23:59');"

# ---------------------------------------------------------------- 一覧（AW_NOTI_001）
L_SEARCH = [
    {"no": "1", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".filter", "kind": "area", "trig": "view", "pattern": "P-LIST"},
    {"no": "1.1", "ja": "キーワード", "vi": "Từ khóa", "sel": ".filter .search input", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60", "ex": ["年末年始", "お知らせID, タイトル, 本文 (khớp một phần)"]},
    {"no": "1.2", "ja": "カテゴリ", "vi": "Danh mục", "sel": ".filter select[aria-label=カテゴリ]", "kind": "select", "trig": "select", "req": "－", "len": ["選択（お知らせ／メニュー／メンテナンス／システム更新）", "Chọn (thông báo / thực đơn / bảo trì / cập nhật hệ thống)"], "init": ["（すべて）", "(Tất cả)"], "ex": ["メンテナンス", "4 danh mục cố định (hong 2026-10-05)"],
     "demo_ok": ["コードは3つ（メニューがない）。4つに直す", "Code 3 giá trị (thiếu メニュー); sửa thành 4"]},
    {"no": "1.3", "ja": "配信対象", "vi": "Đối tượng nhận", "sel": ".filter select[aria-label=配信対象]", "kind": "select", "trig": "select", "req": "－", "len": ["選択（法人・拠点／アプリユーザー／委託配送先／配送スタッフ／仕入先）", "Chọn (công ty chi nhánh / người dùng app / đối tác giao / nhân viên giao / nhà cung cấp)"], "init": ["（すべて）", "(Tất cả)"], "ex": ["法人・拠点", "Thông báo có 区分 này trong đối tượng"]},
    {"no": "1.4", "ja": "ステータス", "vi": "Trạng thái", "sel": ".filter select[aria-label=ステータス]", "kind": "select", "trig": "select", "req": "－", "len": ["選択（公開中／予定中／配信停止／終了／削除済）", "Chọn (đang hiện / sắp hiện / dừng phát / kết thúc / đã xóa)"], "init": ["（すべて）", "(Tất cả)"], "ex": ["公開中", "Chọn 削除済 thì hiện cả đã xóa"],
     "demo_ok": ["コードの「予約中」を「予定中」に直す（hong 2026-10-05 C2）", "Code ghi 予約中; sửa thành 予定中 (hong 2026-10-05 C2)"]},
    {"no": "1.5", "ja": "配信日（から）", "vi": "Ngày phát (từ)", "sel": "input[aria-label=\"配信日（から）\"]", "kind": "date", "trig": "input", "req": "－", "len": "日付", "ex": ["2026-10-01", "Lọc theo 配信日時 từ"]},
    {"no": "1.6", "ja": "配信日（まで）", "vi": "Ngày phát (đến)", "sel": "input[aria-label=\"配信日（まで）\"]", "kind": "date", "trig": "input", "req": "－", "len": "日付", "ex": ["2026-10-31", "Lọc theo 配信日時 đến"]},
    {"no": "1.7", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".filter .f-act button::クリア", "kind": "button", "trig": "click"},
    {"no": "1.8", "ja": "検索", "vi": "Tìm kiếm", "sel": ".filter .f-act button::検索", "kind": "button", "trig": "click"},
    {"no": "1.9", "ja": "削除済みを表示しない", "vi": "Không hiện đã xóa", "sel": ".filter label::削除済みを表示しない", "kind": "check", "trig": "check", "req": "－", "init": ["チェックあり", "Có tích"], "ex": ["チェックを外す", "Bỏ tích để xem cả đã xóa"]},
    {"no": "1.10", "ja": "並べ替え", "vi": "Sắp xếp", "sel": ".filter .sortbox", "kind": "select", "trig": "select", "req": "－", "len": ["選択（列）＋昇順／降順", "Chọn cột + tăng / giảm"], "init": ["最終更新日の降順", "最終更新日 giảm dần"], "ex": ["ステータス・昇順", "Chọn cột và nhấn nút đổi chiều"]},
]
L_HEAD = [
    {"no": "2", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view", "detail": ["パンくず：お知らせ・ご意見 ＞ お知らせ一覧。", "Breadcrumb: お知らせ・ご意見 > お知らせ一覧."],
     "demo_ok": ["コードのパンくずは「お知らせ設定」。組の名前「お知らせ・ご意見」に直す（hong 2026-10-05）", "Code ghi お知らせ設定; sửa thành お知らせ・ご意見 (hong 2026-10-05)"]},
    {"no": "2.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".ph .btns button::CSV出力", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "detail": ["検索条件のとおりの全件。列：一覧の列＋お知らせの全項目（本文・配信対象の詳細・メールの設定）。", "Toàn bộ theo điều kiện. Cột = cột 一覧 + mọi mục của thông báo (本文, chi tiết 配信対象, cài đặt mail)."]},
    {"no": "2.2", "ja": "新規登録", "vi": "Đăng ký mới", "sel": ".ph .btns button::新規登録", "kind": "button", "trig": "click", "cond": ["お知らせ管理の 作成 の権限", "Quyền 作成"], "detail": ["お知らせ新規登録（AW_NOTI_002）へ。", "Mở AW_NOTI_002."]},
]
L_TABLE = [
    {"no": "3", "ja": "お知らせの一覧", "vi": "Bảng thông báo", "sel": ".card .tbl", "kind": "table", "trig": "view", "pattern": "P-LIST",
     "detail": ["初期の並びは最終更新日の降順。1ページ 10件。", "Sắp theo 最終更新日 giảm dần. 10 dòng/trang."]},
    {"no": "3.1", "ja": "ID", "vi": "ID", "sel": ".tbl th::ID", "kind": "link", "trig": "click", "detail": ["NT-＋5桁（自動採番）。押すと詳細（AW_NOTI_003）。", "NT-+5 số (tự cấp). Nhấn mở chi tiết (AW_NOTI_003)."],
     "demo_ok": ["コードは数字5桁。NT-＋5桁に直す（hong 2026-10-05 N1）", "Code là số 5 chữ số; sửa thành NT-+5 số (hong 2026-10-05 N1)"]},
    {"no": "3.2", "ja": "カテゴリ", "vi": "Danh mục", "sel": ".tbl th::カテゴリ", "kind": "label", "trig": "view", "detail": ["チップで表示。", "Hiện dạng chip."]},
    {"no": "3.3", "ja": "タイトル", "vi": "Tiêu đề", "sel": ".tbl th::タイトル", "kind": "label", "trig": "view", "detail": ["長いときは省略し、マウスで全文。", "Dài thì cắt, rê chuột hiện đủ."]},
    {"no": "3.4", "ja": "配信対象", "vi": "Đối tượng nhận", "sel": ".tbl th::配信対象", "kind": "label", "trig": "view", "detail": ["区分を「・」でつなぐ。個別選択は「（個別 n件）」。", "Các 区分 nối bằng ・. 個別選択 ghi「（個別 n件）」."]},
    {"no": "3.5", "ja": "配信方法", "vi": "Cách phát", "sel": ".tbl th::配信方法", "kind": "label", "trig": "view", "detail": ["ES STATION のみ／ES STATION＋メール／メールのみ。", "Chỉ hiện trên ES STATION / ES STATION + mail / chỉ mail."],
     "demo_ok": ["コードの「ESSのみ」「ESS＋メール」を「ES STATION のみ」「ES STATION＋メール」に直す（hong 2026-10-05 N4）", "Code ghi ESS; sửa thành ES STATION (hong 2026-10-05 N4)"]},
    {"no": "3.6", "ja": "添付", "vi": "Đính kèm", "sel": ".tbl th::添付", "kind": "label", "trig": "view", "detail": ["ファイルの数。右寄せ。", "Số tệp. Căn phải."]},
    {"no": "3.7", "ja": "最終更新日", "vi": "Cập nhật cuối", "sel": ".tbl th::最終更新日", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM。", "yyyy-mm-dd HH:MM."]},
    {"no": "3.8", "ja": "配信日時", "vi": "Ngày giờ phát", "sel": ".tbl th::配信日時", "kind": "label", "trig": "view", "detail": ["メールがあればメールの日時指定、なければ表示開始日時。", "Có mail = 日時指定 của mail, không thì 表示開始日時."]},
    {"no": "3.9", "ja": "表示期間", "vi": "Thời gian hiển thị", "sel": ".tbl th::表示期間", "kind": "label", "trig": "view", "detail": ["表示開始日〜表示終了日（終了なしは「〜」）。配信停止・削除済は止めたときの期間。", "Từ ngày bắt đầu đến ngày kết thúc (không kết thúc thì「〜」). 配信停止・削除済 giữ kỳ lúc dừng."]},
    {"no": "3.10", "ja": "ステータス", "vi": "Trạng thái", "sel": ".tbl th::ステータス", "kind": "label", "trig": "view",
     "detail": ["日時から決める：予定中（開始前・青）→公開中（緑）→終了（灰）。配信停止・削除済（灰）は操作の記録から。", "Tính từ ngày giờ: 予定中 (xanh dương) → 公開中 (xanh lá) → 終了 (xám). 配信停止・削除済 (xám) theo thao tác."]},
    {"no": "3.11", "ja": "編集", "vi": "Sửa", "sel": ".tbl td.act button.e", "kind": "button", "trig": "click", "cond": ["予定中・公開中 で 編集 の権限", "予定中・公開中 và có quyền 編集"], "detail": ["お知らせ編集へ。終了・配信停止・削除済には出さない。", "Mở 編集. Không hiện ở 終了・配信停止・削除済."],
     "demo_ok": ["コードは配信停止でも鉛筆を出す。出さない（hong 2026-10-05 N3）", "Code hiện nút sửa cả khi 配信停止; ẩn đi (hong 2026-10-05 N3)"]},
    {"no": "3.12", "ja": "配信停止", "vi": "Dừng phát", "sel": ".tbl tbody tr:nth-child(1) td.act", "kind": "button", "trig": "click", "err": ["Q153", "S150", "E223"],
     "cond": ["予定中・公開中 で 配信停止 の権限", "予定中・公開中 và có quyền 配信停止"],
     "detail": ["操作の列に編集・削除と並べて出す。押すと Q153 →「配信停止する」で各サイトの一覧から消え、まだ送っていないメールは送らない。S150。元に戻せない。", "Đặt cạnh 編集・削除. Nhấn hiện Q153 → 配信停止する: biến mất khỏi các site, mail chưa gửi không gửi. S150. Không hoàn lại."],
     "demo_ok": ["コードに配信停止のボタンがない。一覧と詳細に足す（hong 2026-10-05 N3）", "Code không có nút 配信停止; thêm ở 一覧 và 詳細 (hong 2026-10-05 N3)"]},
    {"no": "3.13", "ja": "削除", "vi": "Xóa", "sel": ".tbl td.act button.d", "kind": "button", "trig": "click", "err": ["Q152", "S02", "E33"], "pattern": "P-DEL",
     "cond": ["予定中・公開中・配信停止 で 削除 の権限", "予定中・公開中・配信停止 và có quyền 削除"],
     "detail": ["Q152 → 削除済（各サイトの一覧から消える。データは残る）。", "Q152 → 削除済 (biến mất khỏi các site; dữ liệu giữ)."]},
    {"no": "3.14", "ja": "0件の表示", "vi": "Hiển thị 0 dòng", "sel": ".tbl td.empty", "kind": "label", "trig": "show", "err": ["I01"],
     "demo_ok": ["コードの文言を I01 に揃える", "Câu chữ code khác I01; đồng nhất"]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".card .pager", "kind": "area", "trig": "view"},
    {"no": "5", "ja": "削除の確認", "vi": "Xác nhận xóa", "sel": ".ov .modal", "kind": "modal", "trig": "show", "err": ["Q152"],
     "demo_ok": ["コードの本文「各アプリ・サイトのお知らせ一覧から消えます（データは「削除済」として残ります）」を Q152 に揃える", "Câu chữ code khác Q152; đồng nhất"]},
    {"no": "5.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".modal button::キャンセル", "kind": "button", "trig": "click"},
    {"no": "5.2", "ja": "削除する", "vi": "Xóa", "sel": ".modal button::削除", "kind": "button", "trig": "click", "err": ["S02", "E33"]},
]

# ---------------------------------------------------------------- 登録・編集（AW_NOTI_002）
def head(new):
    return [
        {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view",
         "detail": ["パンくず：お知らせ・ご意見 ＞ お知らせ一覧 ＞ " + ("お知らせ新規登録" if new else "お知らせ編集") + "。編集はタイトルに ID とステータス。", "Breadcrumb: お知らせ・ご意見 > お知らせ一覧 > " + ("お知らせ新規登録" if new else "お知らせ編集") + ". Khi sửa có ID và trạng thái."],
         "demo_ok": ["パンくずの「お知らせ設定」を「お知らせ・ご意見」に", "Sửa お知らせ設定 → お知らせ・ご意見"]},
        {"no": "1.1", "ja": "キャンセル", "vi": "Hủy", "sel": ".ph .btns button::キャンセル", "kind": "button", "trig": "click", "err": ["Q02"], "detail": ["編集中なら Q02。" + ("一覧へ。" if new else "詳細へ。"), "Đang sửa thì Q02. " + ("Về danh sách." if new else "Về chi tiết.")]},
        {"no": "1.2", "ja": "登録" if new else "保存", "vi": "Đăng ký" if new else "Lưu", "sel": ".ph .btns button.pri", "kind": "button", "trig": "click", "pattern": "P-FORM",
         "err": ["S151", "E220", "E221", "E30"] if new else ["S01", "E220", "E221", "E222", "E30"],
         "cond": ["お知らせ管理の 作成 の権限", "Quyền 作成"] if new else ["お知らせ管理の 編集 の権限（予定中・公開中だけ）", "Quyền 編集 (chỉ 予定中・公開中)"],
         "detail": [("全項目をチェックして登録。ID は NT-＋5桁で自動採番。登録できたら S151（メールがあれば送る日時も）を出し詳細へ。" if new else "全項目をチェックして保存。変更は送信の記録に「更新」として残す。配信停止・終了・削除済は保存できない（E222）。") + "メールの日時指定が空なら、おすすめの日時（公開開始日の 8:00・法人あては土日祝なら前の営業日）で保存する。",
                    ("Kiểm tra mọi mục rồi đăng ký. ID tự cấp NT-+5. Xong hiện S151 (kèm giờ gửi mail nếu có) và về chi tiết." if new else "Kiểm tra mọi mục rồi lưu. Ghi 更新 vào 送信の記録. 配信停止・終了・削除済 không lưu được (E222).") + " 日時指定 mail trống thì lưu theo おすすめ (8:00 ngày bắt đầu; 法人 gặp ngày nghỉ thì ngày làm việc trước)."]},
    ]
TG_ROWS = [
    {"no": "3", "ja": "配信対象", "vi": "Đối tượng nhận", "sel": ".card > .sec", "kind": "area", "trig": "view", "err": ["E220", "E221"],
     "detail": ["区分ごとに1行：法人・拠点／アプリユーザー／委託配送先／配送スタッフ／仕入先。「ES STATION に表示」か「メール送信」のどちらかを1つ以上（E220）。ゲストモード・ESQR の利用者は対象外。", "Mỗi 区分 1 dòng: 法人・拠点 / アプリユーザー / 委託配送先 / 配送スタッフ / 仕入先. Phải có ít nhất 1 ES STATION に表示 hoặc メール送信 (E220). Guest / ESQR không thuộc đối tượng."]},
    {"no": "3.1", "ja": "対象区分", "vi": "Phân loại", "sel": ".card > .sec .tbl th::対象区分", "kind": "label", "trig": "view"},
    {"no": "3.2", "ja": "ES STATION に表示", "vi": "Hiện trên ES STATION", "sel": ".card > .sec .tbl th::ESSへ", "kind": "check", "trig": "check", "req": "－", "init": ["チェックなし", "Không tích"], "ex": ["チェックあり", "Tích = hiện trong お知らせ一覧 của site/app của 区分 đó"],
     "detail": ["その区分のサイト・アプリのお知らせ一覧に出す。", "Hiện trong お知らせ一覧 của site/app tương ứng."],
     "demo_ok": ["コードの列名「ESSへお知らせ」を「ES STATION に表示」に（hong 2026-10-05 N4＝B）", "Code ghi ESSへお知らせ; sửa thành ES STATION に表示 (hong 2026-10-05 N4)"]},
    {"no": "3.3", "ja": "メール送信", "vi": "Gửi mail", "sel": ".card > .sec .tbl th::メール送信", "kind": "check", "trig": "check", "req": "－", "len": ["チェック（メイン担当者／請求担当者／サブ担当者。アプリユーザー・配送スタッフは本人）", "Checkbox (người phụ trách chính / thanh toán / phụ; người dùng app, nhân viên giao = chính người đó)"], "init": ["チェックなし", "Không tích"],
     "ex": ["メイン担当者・請求担当者", "Chọn vai trò nhận mail; 1 người 1 thư"],
     "detail": ["チェックするとメール設定（No.6）が出る。初めてチェックしたとき件名にタイトルを入れる。", "Tích thì hiện メール設定 (No.6). Lần đầu tích thì 件名 = タイトル."]},
    {"no": "3.4", "ja": "対象指定", "vi": "Chỉ định đối tượng", "sel": ".card > .sec .tbl th::対象指定", "kind": "radio", "trig": "select", "req": "－", "len": ["選択（全員／個別選択）", "Chọn (tất cả / chọn riêng)"], "init": ["全員", "Tất cả"], "ex": ["個別選択", "Chọn riêng thì phải chọn ≥1 (E221)"],
     "detail": ["個別選択に切り替えると、未選択ならダイアログ（No.4）を開く。「選択する」で開き直せる。", "Chuyển sang 個別選択 mà chưa chọn thì mở dialog (No.4). 選択する để mở lại."]},
    {"no": "3.5", "ja": "選択内容", "vi": "Nội dung đã chọn", "sel": ".card > .sec .tbl th::選択内容", "kind": "label", "trig": "show", "detail": ["全員、または選んだ名前（4つまで＋「+n」）。", "全員 hoặc tên đã chọn (tối đa 4 + \"+n\")."]},
    {"no": "3.6", "ja": "説明", "vi": "Giải thích", "sel": ".card > .sec .hint", "kind": "label", "trig": "show", "detail": ["列の意味の説明文。配信停止にしたお知らせは編集しても配信停止のまま。", "Câu giải thích các cột. お知らせ đã 配信停止 có sửa cũng vẫn 配信停止."]},
]
PICK = [
    {"no": "4", "ja": "個別選択（モーダル）", "vi": "Chọn riêng (modal)", "sel": ".ov .mbox", "kind": "modal", "trig": "show",
     "detail": ["区分ごとに候補が違う：法人・拠点（ID・法人名・拠点名）／アプリユーザー（ID・ユーザー・法人・拠点）／委託配送先／配送スタッフ（ID・名前・所属）／仕入先。", "Ứng viên theo 区分: 法人・拠点 (ID, 法人名, 拠点名) / アプリユーザー (ID, ユーザー, 法人, 拠点) / 委託配送先 / 配送スタッフ (ID, tên, đơn vị) / 仕入先."]},
    {"no": "4.1", "ja": "キーワード", "vi": "Từ khóa", "sel": ".mbox input.inp", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60", "ex": ["大阪", "Khớp một phần với mọi cột"]},
    {"no": "4.2", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".mbox button::クリア", "kind": "button", "trig": "click"},
    {"no": "4.3", "ja": "検索", "vi": "Tìm kiếm", "sel": ".mbox-b button::検索", "kind": "button", "trig": "click"},
    {"no": "4.4", "ja": "候補の表", "vi": "Bảng ứng viên", "sel": ".mbox .tbl", "kind": "table", "trig": "view", "err": ["I01"], "detail": ["先頭にチェック（見出しのチェックで絞り込んだ行をまとめて選ぶ）。", "Ô tích ở đầu (tích tiêu đề = chọn tất cả dòng đang lọc)."]},
    {"no": "4.5", "ja": "選択", "vi": "Chọn", "sel": ".mbox td input[type=checkbox]", "kind": "check", "trig": "check", "req": "○", "ex": ["チェック", "Tích đối tượng muốn gửi"]},
    {"no": "4.6", "ja": "選択済", "vi": "Đã chọn", "sel": ".mbox-f span", "kind": "label", "trig": "show", "detail": ["「選択済み：n件」。", "\"選択済み：n件\"."]},
    {"no": "4.7", "ja": "CSV取込", "vi": "Nhập CSV", "sel": ".mbox-f button::CSV取込", "kind": "button", "trig": "click", "pattern": "P-CSV",
     "detail": ["ID の一覧（1行目は見出し：ID・名前（参考））を読み、取り込んだ ID をいまの選択に足す。選べない ID はエラーの行。保存はお知らせの保存で。", "Đọc danh sách ID (dòng 1 tiêu đề: ID, 名前 tham khảo), cộng vào lựa chọn hiện tại. ID không hợp lệ = dòng lỗi. Lưu cùng お知らせ."]},
    {"no": "4.8", "ja": "キャンセル", "vi": "Hủy", "sel": ".mbox-f button::キャンセル", "kind": "button", "trig": "click"},
    {"no": "4.9", "ja": "選択を確定", "vi": "Xác nhận chọn", "sel": ".mbox-f button::選択を確定", "kind": "button", "trig": "click"},
]
def pick_items(k, cols, ph, vi_cols):
    """区分ごとの個別選択のポップアップ（候補の列・検索の欄が違う）"""
    return [
        {"no": "4", "ja": "個別選択（モーダル）：" + k, "vi": "Chọn riêng (modal): " + k, "sel": ".ov .mbox", "kind": "modal", "trig": "show",
         "detail": ["タイトル「" + k + " の個別選択」。候補の列：" + cols + "。検索の欄：" + ph + "。ほかの動きは法人・拠点の個別選択（No.4.1〜4.9）と同じ。", "Tiêu đề「" + k + " の個別選択」. Cột: " + vi_cols + ". Ô tìm: " + ph + ". Thao tác khác như popup của 法人・拠点 (No.4.1〜4.9)."]},
        {"no": "4.4", "ja": "候補の表", "vi": "Bảng ứng viên", "sel": ".mbox .tbl", "kind": "table", "trig": "view", "detail": ["列：" + cols + "。", "Cột: " + vi_cols + "."]},
    ]
PICK_SETUP = "[...document.querySelectorAll('input[name=nt-mode-%s]')][1].click();await sleep(700);"

CONTENT = [
    {"no": "5", "ja": "お知らせ内容", "vi": "Nội dung thông báo", "sel": ".sec-h::お知らせ内容^", "kind": "area", "trig": "view", "pattern": "P-FORM"},
    {"no": "5.1", "ja": "タイトル", "vi": "Tiêu đề", "sel": "#nt-title", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "nt-title", "ex": ["システムメンテナンス実施のお知らせ", "Tiêu đề hiện trong danh sách của site/app"], "err": ["E01", "E04", "E13"],
     "demo_ok": ["コードに最大文字数がない。60 にする", "Code không có maxLength; đặt 60"]},
    {"no": "5.2", "ja": "カテゴリ", "vi": "Danh mục", "sel": "#nt-cat", "kind": "select", "trig": "select", "req": "○", "len": ["選択（お知らせ／メニュー／メンテナンス／システム更新）", "Chọn (thông báo / thực đơn / bảo trì / cập nhật hệ thống)"], "fid": "nt-cat", "ex": ["メンテナンス", "4 giá trị cố định"], "err": ["E02"],
     "demo_ok": ["コードは3つ。「メニュー」を足す（hong 2026-10-05 N2）", "Code 3 giá trị; thêm メニュー (hong 2026-10-05 N2)"]},
    {"no": "5.3", "ja": "重要", "vi": "Quan trọng", "sel": "#nt-important", "kind": "check", "trig": "check", "req": "－", "init": ["チェックなし", "Không tích"], "ex": ["チェックあり", "Hiện lên đầu danh sách và tự gửi mail 8:00 ngày bắt đầu"],
     "detail": ["各サイトのお知らせ一覧の上に出す。メールの宛先を選ばなくても、公開開始日の 8:00（法人あては土日祝なら前の営業日。過ぎていればすぐ）に表示先の全員へメールを自動で送る（hint におすすめの日時）。", "Hiện trên cùng ở danh sách các site. Dù không chọn người nhận mail, tự gửi mail cho mọi đối tượng hiển thị vào 8:00 ngày bắt đầu (法人 gặp ngày nghỉ thì ngày làm việc trước; đã qua thì gửi ngay)."]},
    {"no": "5.4", "ja": "表示開始日時", "vi": "Bắt đầu hiển thị", "sel": "#nt-start", "kind": "date", "trig": "input", "req": "○", "len": ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ (yyyy-mm-dd HH:MM)"], "fid": "nt-start", "ex": ["2026-11-01 08:00", "Ngày + giờ; từ mốc này hiện trên site và tính trạng thái"], "err": ["E01", "E200"],
     "demo_ok": ["コードは文字の欄。日付の部品＋時刻に直す", "Code là ô text; sửa thành ô ngày + giờ"]},
    {"no": "5.5", "ja": "表示終了日時", "vi": "Kết thúc hiển thị", "sel": "#nt-end", "kind": "date", "trig": "input", "req": "－", "len": ["日時（yyyy-mm-dd HH:MM）。空＝終了なし", "Ngày giờ; trống = không kết thúc"], "fid": "nt-end", "ex": ["2026-11-30 23:59", "Trống = hiện mãi; phải sau 表示開始日時"], "err": ["E200", "E201"],
     "demo_ok": ["コードは文字の欄で、開始より後のチェックもない", "Code là ô text, chưa kiểm tra sau 開始"]},
    {"no": "5.6", "ja": "添付ファイル", "vi": "Tệp đính kèm", "sel": "button::ファイルをアップロード", "kind": "file", "trig": "upload", "req": "－", "len": ["JPG・PNG・PDF・HEIC、1件 5MB、10件まで", "JPG/PNG/PDF/HEIC, 5MB/tệp, tối đa 10"], "ex": ["回収の手順.pdf", "Tệp người nhận tải ở màn お知らせ詳細; không đính kèm mail"], "err": ["E11"],
     "detail": ["欄の説明文「各サイトのお知らせ詳細で開けます。メールには添付しません（JPG・PNG・PDF・HEIC、1件 5MB、10件まで）」（hong 2026-10-05）。詳細では No・ファイル名（ダウンロード）・容量の表。", "Câu giải thích「各サイトのお知らせ詳細で開けます。メールには添付しません（JPG・PNG・PDF・HEIC、1件 5MB、10件まで）」(hong 2026-10-05). Ở chi tiết hiện bảng No, tên (tải), dung lượng."],
     "demo_ok": ["コードは件数だけ増える見本。本物のアップロードにする", "Code chỉ đếm số tệp (demo); làm upload thật"]},
    {"no": "5.7", "ja": "本文", "vi": "Nội dung", "sel": "#nt-bodytxt", "kind": "textarea", "trig": "input", "req": "○", "len": ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], "fid": "nt-bodytxt", "ex": ["12/29〜1/3 はお届けがありません。", "Hiện nguyên xuống dòng"], "err": ["E01", "E04", "E13"]},
]
MAIL = [
    {"no": "6", "ja": "メール設定", "vi": "Cài đặt mail", "sel": ".sec-h::メール設定^", "kind": "area", "trig": "view", "cond": ["どれかの区分でメール送信をチェックしたとき", "Khi có 区分 tích メール送信"]},
    {"no": "6.1", "ja": "件名", "vi": "Tiêu đề mail", "sel": "#nt-subj", "kind": "text", "trig": "input", "req": "○", "len": "文字列 60", "fid": "nt-subj", "init": ["タイトルと同じ（直せる）", "= タイトル (sửa được)"], "ex": ["システムメンテナンス実施のお知らせ", "Nhập không có tiền tố; khi gửi tự thêm【ESステーション】ở đầu"], "err": ["E04"],
     "detail": ["送るとき先頭に「【ESステーション】」を付ける（Message List のメールと同じ。重要なお知らせの自動のメールは「【ESステーション】【重要】タイトル」）。", "Khi gửi thêm「【ESステーション】」ở đầu (như mail trong Message List; mail tự động của お知らせ quan trọng là「【ESステーション】【重要】タイトル」)."]},
    {"no": "6.2", "ja": "差出人", "vi": "Người gửi", "sel": ".fld::差出人", "kind": "label", "trig": "view", "detail": ["設定値（システム管理が設定管理で変える）。初期値「ESキッチン運営事務局 <no-reply@es-kitchen.jp>」。", "Giá trị cài đặt (システム管理 đổi ở 設定管理). Mặc định「ESキッチン運営事務局 <no-reply@es-kitchen.jp>」."],
     "demo_ok": ["コードは固定の文字。設定から読む（hong 2026-10-05 N5）", "Code cố định; đọc từ 設定 (hong 2026-10-05 N5)"]},
    {"no": "6.3", "ja": "日時指定", "vi": "Giờ gửi", "sel": "#nt-mailat", "kind": "date", "trig": "input", "req": "○", "len": ["日時（yyyy-mm-dd HH:MM）", "Ngày giờ"], "fid": "nt-mailat", "init": ["おすすめ：公開開始日の 8:00（法人あては土日祝なら前の営業日）", "Gợi ý: 8:00 ngày bắt đầu (法人 gặp ngày nghỉ → ngày làm việc trước)"], "ex": ["2026-11-01 08:00", "Trống thì lưu theo gợi ý; nút おすすめの日時にする để đặt lại"], "err": ["E200"],
     "detail": ["この日時に 9:00 側のバッチでなく、指定の時刻に送る（送信の記録に「メール送信予約」）。", "Gửi đúng giờ này (ghi メール送信予約 vào 送信の記録)."],
     "demo_ok": ["コードは文字の欄。日付の部品＋時刻に", "Code là ô text; sửa thành ngày + giờ"]},
    {"no": "6.4", "ja": "メール本文", "vi": "Nội dung mail", "sel": "#nt-mailbody", "kind": "textarea", "trig": "input", "req": "○", "len": ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], "fid": "nt-mailbody", "init": ["お知らせの本文と同じ（直せる）", "= 本文 của お知らせ (sửa được)"], "ex": ["本メールは送信専用です。", "Bắt buộc khi có メール送信 (hong 2026-10-05 N6); mặc định = 本文"], "err": ["E01", "E04"],
     "demo_ok": ["コードは必須のチェックがない。足す", "Code chưa kiểm tra bắt buộc; thêm"]},
    {"no": "6.5", "ja": "署名欄", "vi": "Chữ ký", "sel": "#nt-sign", "kind": "textarea", "trig": "input", "req": "－", "len": ["文字列 500（複数行）", "Chuỗi 500 (nhiều dòng)"], "fid": "nt-sign", "init": ["設定値（システム管理が設定管理で変える。初期値はコードの文面）", "Giá trị cài đặt (システム管理 đổi ở 設定管理; mặc định = văn bản trong code)"],
     "ex": ["ESキッチンサポート窓口…", "Sửa thì chỉ áp dụng cho お知らせ này"],
     "detail": ["既定値は設定値。このお知らせだけ変えるときは直す（hong 2026-10-05）。", "Mặc định = giá trị cài đặt. Muốn đổi riêng cho お知らせ này thì sửa (hong 2026-10-05)."]},
]
ERRS = [{"no": "7", "ja": "入力エラーの表示", "vi": "Hiển thị lỗi", "sel": ".emsg", "kind": "label", "trig": "show", "pattern": "P-FORM", "err": ["E01", "E02", "E200", "E220"]}]
DISCARD = [{"no": "8", "ja": "編集内容の破棄", "vi": "Bỏ nội dung đang sửa", "sel": ".ov .modal", "kind": "modal", "trig": "show", "err": ["Q02"],
            "demo_ok": ["コードの本文・ボタンを Q02（Message List No.25）に揃える", "Câu chữ code khác Q02; đồng nhất"]}]

# ---------------------------------------------------------------- 詳細（AW_NOTI_003）
V_HEAD = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".ph", "kind": "area", "trig": "view", "detail": ["タイトル「お知らせ詳細（ID）」＋ステータスのバッジ。入力欄はすべて読むだけ。", "Tiêu đề + badge trạng thái. Mọi ô chỉ xem."],
     "demo_ok": ["パンくずの「お知らせ設定」を「お知らせ・ご意見」に", "Sửa お知らせ設定 → お知らせ・ご意見"]},
    {"no": "1.1", "ja": "ステータス", "vi": "Trạng thái", "sel": ".ph h1 .badge", "kind": "label", "trig": "show", "detail": ["公開中・予定中・終了・配信停止・削除済。", "公開中・予定中・終了・配信停止・削除済."]},
    {"no": "1.2", "ja": "削除", "vi": "Xóa", "sel": ".ph .btns button::削除", "kind": "button", "trig": "click", "err": ["Q152", "S02", "E33"], "pattern": "P-DEL", "cond": ["予定中・公開中・配信停止 で 削除 の権限", "予定中・公開中・配信停止 và có quyền 削除"], "detail": ["Q152 → 削除済にして一覧へ。", "Q152 → 削除済, về danh sách."]},
    {"no": "1.3", "ja": "配信停止", "vi": "Dừng phát", "sel": ".ph .btns", "kind": "button", "trig": "click", "err": ["Q153", "S150", "E223"], "cond": ["予定中・公開中 で 配信停止 の権限", "予定中・公開中 và có quyền 配信停止"],
     "detail": ["Q153 → 各サイトの一覧から消し、まだ送っていないメールは送らない。元に戻せない。送信の記録に残す。", "Q153 → biến mất khỏi các site, mail chưa gửi không gửi. Không hoàn lại. Ghi 送信の記録."],
     "demo_ok": ["コードにボタンがない。削除の左に足す（hong 2026-10-05 N3）", "Code không có nút; thêm bên trái 削除 (hong 2026-10-05 N3)"]},
    {"no": "1.4", "ja": "編集", "vi": "Sửa", "sel": ".ph .btns button::編集", "kind": "button", "trig": "click", "cond": ["予定中・公開中 で 編集 の権限", "予定中・公開中 và có quyền 編集"], "detail": ["お知らせ編集へ。終了・配信停止・削除済には出さない。", "Mở 編集. Không hiện ở 終了・配信停止・削除済."],
     "demo_ok": ["コードは配信停止でも「編集」を出す。出さない（hong 2026-10-05 N3）", "Code hiện 編集 cả khi 配信停止; ẩn (hong 2026-10-05 N3)"]},
    {"no": "2", "ja": "配信対象（読むだけ）", "vi": "Đối tượng nhận (chỉ xem)", "sel": ".card > .sec", "kind": "area", "trig": "view", "detail": ["AW_NOTI_002 No.3 と同じ表。チェック・ラジオは無効。", "Bảng như AW_NOTI_002 No.3, ô khóa."]},
    {"no": "3", "ja": "お知らせ内容（読むだけ）", "vi": "Nội dung (chỉ xem)", "sel": ".sec-h::お知らせ内容^", "kind": "area", "trig": "view", "detail": ["AW_NOTI_002 No.5 と同じ。添付は No・ファイル名（押すとダウンロード）・容量の表。", "Như AW_NOTI_002 No.5. Đính kèm hiện bảng No, tên (nhấn tải), dung lượng."]},
    {"no": "3.1", "ja": "添付ファイルの表", "vi": "Bảng tệp đính kèm", "sel": ".tbl::ファイル名", "kind": "table", "trig": "view", "cond": ["添付があるとき", "Khi có đính kèm"], "detail": ["ファイル名を押すとダウンロード。", "Nhấn tên để tải."]},
]
V_MAIL = [{**MAIL[0], "no": "4", "cond": ["メール送信があるとき", "Khi có メール送信"]}]
V_LOG = [
    {"no": "5", "ja": "送信の記録", "vi": "Lịch sử gửi", "sel": ".card > .sec::送信の記録", "kind": "table", "trig": "view", "err": ["I152"],
     "detail": ["列：日時・操作（登録／更新／メール送信予約／メール送信／配信停止／削除）・宛先・表示先・内容。新しい順。メールだけのお知らせは上に I152。", "Cột: 日時, 操作 (登録/更新/メール送信予約/メール送信/配信停止/削除), 宛先・表示先, 内容. Mới nhất trước. Thông báo chỉ mail thì có I152 ở trên."],
     "demo_ok": ["コードの記録は 登録／更新／メール送信予約／メール送信 だけ。配信停止・削除も残す", "Code chỉ ghi 4 loại; thêm 配信停止・削除"]},
]
V_DEL = [{**L_TABLE[16], "no": "6"}, {**L_TABLE[17], "no": "6.1"}, {**L_TABLE[18], "no": "6.2"}]

def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500):
    return {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}

VIEWS = [
    V("001", "AW_NOTI_001", "初期表示", "Hiển thị ban đầu", "/ops/notices", L_SEARCH + L_HEAD + L_TABLE[:14] + [L_TABLE[15]],
      note=["見本の ID は数字（決定は NT-＋5桁）。「予約中」は「予定中」に直す。", "ID mẫu là số (quyết định: NT-+5). 予約中 → 予定中."]),
    V("002", "AW_NOTI_001", "0件", "0 dòng", "/ops/notices", [L_SEARCH[1], L_SEARCH[8], L_TABLE[14]],
      setup="setv(document.querySelector('.filter .search input'),'該当なしのキーワード');btn('検索',document.querySelector('.f-act')).click();await sleep(600);"
      "await fetch('/api/dev/reset',{method:'POST',credentials:'include'});await sleep(800);" + MK_FUTURE + MK_PAST + "const did=await mk('撮影用（削除済の見本）','2026/10/01 08:00','');if(did)await api('deleteNotice',{id:did});await sleep(300);"),
    V("003", "AW_NOTI_001", "削除済みを表示（予定中・終了の見本も）", "Hiện cả đã xóa (kèm mẫu 予定中・終了)", "/ops/notices", [L_SEARCH[9], L_TABLE[10], L_TABLE[11], L_TABLE[13]],
      setup="[...document.querySelectorAll('.filter input[type=checkbox]')][0].click();btn('検索',document.querySelector('.f-act')).click();await sleep(800);",
      note=["撮影用に 予定中（12457）・終了（12458）・削除済（12459）のお知らせを 003 の撮影のあとに API で作ってある（DB を見本に戻してから）。削除済・終了の行には編集・削除・配信停止を出さない。", "Lúc chụp đã tạo thêm お知らせ 予定中・終了・削除済 bằng API. Dòng 削除済・終了 không có nút sửa/xóa/dừng."]),
    V("004", "AW_NOTI_001", "削除の確認（モーダル）", "Xác nhận xóa (modal)", "/ops/notices", L_TABLE[16:19],
      setup="document.querySelector('.tbl td.act button.d').click();await sleep(500);", full=False),
    V("005", "AW_NOTI_002", "新規登録 初期表示", "Đăng ký mới: ban đầu", "/ops/notices/new", head(True) + TG_ROWS + CONTENT),
    V("006", "AW_NOTI_002", "個別選択（モーダル）：法人・拠点", "Chọn riêng (modal): 法人・拠点", "/ops/notices/new", PICK,
      setup=PICK_SETUP % "corp", full=False,
      note=["区分ごとにポップアップが違う（hong 2026-10-05）。法人・拠点＝ID・法人名・拠点名。検索は法人名・拠点名。", "Mỗi 区分 một popup (hong 2026-10-05). 法人・拠点 = ID, 法人名, 拠点名. Tìm theo 法人名・拠点名."]),
    V("007", "AW_NOTI_002", "個別選択（モーダル）：アプリユーザー", "Chọn riêng (modal): アプリユーザー", "/ops/notices/new", pick_items("アプリユーザー", "ID・ユーザー・法人・拠点", "ユーザー名・法人名・拠点名", "ID, ユーザー, 法人, 拠点"),
      setup=PICK_SETUP % "app", full=False),
    V("008", "AW_NOTI_002", "個別選択（モーダル）：委託配送先", "Chọn riêng (modal): 委託配送先", "/ops/notices/new", pick_items("委託配送先", "ID・委託配送先名", "ID・委託配送先名", "ID, 委託配送先名"),
      setup=PICK_SETUP % "dlv", full=False),
    V("009", "AW_NOTI_002", "個別選択（モーダル）：配送スタッフ", "Chọn riêng (modal): 配送スタッフ", "/ops/notices/new", pick_items("配送スタッフ", "ID・配送スタッフ・所属", "配送スタッフ名・委託配送先名", "ID, 配送スタッフ, 所属"),
      setup=PICK_SETUP % "staff", full=False),
    V("010", "AW_NOTI_002", "個別選択（モーダル）：仕入先", "Chọn riêng (modal): 仕入先", "/ops/notices/new", pick_items("仕入先", "ID・仕入先名", "ID・仕入先名", "ID, 仕入先名"),
      setup=PICK_SETUP % "sup", full=False),
    V("011", "AW_NOTI_002", "個別選択の CSV取込（モーダル）", "Nhập CSV cho chọn riêng (modal)", "/ops/notices/new",
      [{"no": "4.10", "ja": "CSV取込のモーダル", "vi": "Modal nhập CSV", "sel": ".ov .mbox", "kind": "modal", "trig": "show", "pattern": "P-CSV",
        "detail": ["タイトル「{区分} の個別選択 CSV取込」。1行目は見出し（ID・名前（参考））。ID の列だけ読み、選べる配信対象にない ID はエラーの行。「登録」で取り込んだ ID をいまの選択に足し、個別選択のモーダルに戻る（保存はお知らせの保存で）。", "Tiêu đề「{区分} の個別選択 CSV取込」. Dòng 1 tiêu đề (ID, 名前 tham khảo). Chỉ đọc cột ID; ID không thuộc đối tượng = dòng lỗi. 登録 thì cộng ID vào lựa chọn và quay lại modal 個別選択 (lưu cùng お知らせ)."]}],
      setup="[...document.querySelectorAll('input[name=nt-mode-corp]')][1].click();await sleep(700);btn('CSV取込',document.querySelector('.mbox-f')).click();await sleep(700);", full=False,
      note=["共通の CSV取込（P-CSV）。列：ID・名前（参考）。取り込んだ ID をいまの選択に足して個別選択へ戻る。", "CSV取込 chung (P-CSV). Cột: ID, 名前 (tham khảo). Cộng ID vào lựa chọn rồi quay lại modal 個別選択."]),
    V("012", "AW_NOTI_002", "メール送信あり（メール設定）", "Có gửi mail (メール設定)", "/ops/notices/new", [TG_ROWS[3]] + MAIL,
      setup="[...document.querySelectorAll('.card > .sec .tbl td label input[type=checkbox]')][0].click();await sleep(500);"),
    V("013", "AW_NOTI_002", "重要にチェック", "Tích 重要", "/ops/notices/new", [CONTENT[3], CONTENT[4]],
      setup="setv(document.querySelector('#nt-start'),'2026-11-01 08:00');document.querySelector('#nt-important').click();await sleep(600);",
      note=["重要にすると、メールの宛先を選ばなくてもおすすめの日時に全員へ送る旨の hint。", "Tích 重要 thì hiện hint: dù không chọn người nhận vẫn tự gửi mail vào おすすめ日時."]),
    V("014", "AW_NOTI_002", "入力エラー", "Lỗi nhập", "/ops/notices/new", ERRS + [TG_ROWS[0], CONTENT[1], CONTENT[2], CONTENT[4], CONTENT[7]],
      setup="btn('登録',document.querySelector('.ph .btns')).click();await sleep(500);"),
    V("015", "AW_NOTI_002", "編集 公開中", "Sửa 公開中", "/ops/notices/12453/edit", head(False) + [TG_ROWS[0], CONTENT[0]],
      note=["重要・メール送信ありの見本（年末年始の配送について）。", "Mẫu có 重要 và メール送信."]),
    V("016", "AW_NOTI_002", "編集内容の破棄（モーダル）", "Bỏ nội dung đang sửa (modal)", "/ops/notices/12453/edit", DISCARD,
      setup="setv(document.querySelector('#nt-title'),'年末年始の配送について（修正）');await sleep(200);btn('キャンセル',document.querySelector('.ph .btns')).click();await sleep(500);", full=False),
    V("017", "AW_NOTI_003", "詳細 公開中（添付・メール送信あり）", "Chi tiết 公開中 (có đính kèm, mail)", "/ops/notices/12448", V_HEAD + V_MAIL,
      note=["添付2件・ES STATION＋メール。", "2 tệp đính kèm, ES STATION + mail."]),
    V("018", "AW_NOTI_003", "詳細 メールだけのお知らせ（送信の記録）", "Chi tiết: chỉ mail (lịch sử gửi)", "/ops/notices/12456", [V_HEAD[1], V_HEAD[5], V_LOG[0]],
      note=["どのサイトにも出さずメールだけ。送信の記録に登録・メール送信予約。", "Không hiện trên site nào, chỉ mail. 送信の記録 có 登録・メール送信予約."]),
    V("019", "AW_NOTI_003", "詳細 配信停止", "Chi tiết 配信停止", "/ops/notices/12444", [V_HEAD[1], V_HEAD[2]],
      note=["ボタンは削除だけ（編集・配信停止は出さない：hong 2026-10-05）。", "Chỉ còn nút 削除 (không 編集・配信停止: hong 2026-10-05)."]),
    V("020", "AW_NOTI_003", "詳細 予定中・終了", "Chi tiết 予定中・終了", "/ops/notices/12457", [V_HEAD[1]],
      note=["撮影用に作った予定中のお知らせ。終了も同じ画面でボタンが出ない（編集・配信停止・削除なし）。", "Thông báo 予定中 tạo để chụp. 終了 cũng màn này nhưng không có nút nào."]),
    V("021", "AW_NOTI_003", "削除確認（モーダル）", "Xác nhận xóa (modal)", "/ops/notices/12448", V_DEL,
      setup="btn('削除',document.querySelector('.ph .btns')).click();await sleep(500);", full=False),
]
