# -*- coding: utf-8 -*-
"""
委託配送先Web「見積依頼（一覧・詳細・回答）」（OW_QUOT）の画面設計書データ。
元：本物の Web（app/carrier/quotes/page.tsx・[id]/page.tsx・[id]/answer/page.tsx・_parts.tsx・lib/carrier/{logic,fromDomain,area,seed}.ts）。
決定：docs/決定台帳.md F（2026-10-07：見積回答の料金は月額・ほかの料金も表示／金額の再確認・再回答・有効期限は必要）、台帳 B（見積依頼の項目・回答は見積可能／対応不可）、
      台帳 K・M-1（一覧の標準・添付）、確認メモ_TW_委託配送先 §3（H-1〜H-5・H-7・H-15・H-17・H-19）。
コードがまだ決定に追いついていないところは demo_ok。決定済み（台帳 F 2026-10-07「見積回答の項目と期限」）：回答項目（見積書・最短開始可能日・見積の有効期限は必須、中継先は任意）・送信前の確認（Q300）・回答期限の既定は5日。
見本データで撮れない状態（金額再確認・本日期限・回答済みの修正・送信確認）は demo_ok に理由を書く。
"""

TITLE = ["見積依頼（OW_QUOT）", "Yêu cầu báo giá (OW_QUOT)"]
SHEET = ["見積依頼", "Yêu cầu báo giá"]
BASENAME = "画面設計書_OW_QUOT_見積依頼"
IMG_PREFIX = "OW_QUOT"
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
    {"date": "2026-10-07", "target": "OW_QUOT 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_QUOT_003 No.19.3・19.4",
     "q": ["見積回答の金額は月額か1件あたりか（Q-2）", "Số tiền báo giá là theo tháng hay theo từng chuyến (Q-2)"],
     "a": ["月額。ほかに発生する料金があれば料金内訳の行として出す（合計＝見積金額・月額）。コードは1件あたりとして保存している", "Theo tháng. Phí phát sinh khác nếu có thì hiện thành dòng trong bảng chi tiết phí (tổng = số tiền báo giá theo tháng). Code hiện đang lưu theo từng chuyến"],
     "src": "hong 回答 2026-10-07（台帳 F「委託配送先の見積回答」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_QUOT_003 No.19.6・25",
     "q": ["金額の再確認・再回答・有効期限を持つか（Q-4）", "Có giữ việc xác nhận lại số tiền, trả lời lại, thời hạn hiệu lực không (Q-4)"],
     "a": ["必要。再確認の依頼に再回答できる（金額・条件の変更なし／金額変更／NG）。見積の有効期限を回答に入れる。回答期限を過ぎた依頼は「期限切れ」", "Cần. Có thể trả lời lại khi được yêu cầu xác nhận lại (không đổi／đổi số tiền／NG). Đưa thời hạn hiệu lực của báo giá vào câu trả lời. Yêu cầu quá hạn trả lời là 「期限切れ」"],
     "src": "hong 回答 2026-10-07（台帳 F「委託配送先の見積回答」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_QUOT_003 No.19.5〜19.8",
     "q": ["見積回答の項目（Q-2 の後半）：中継先・最短開始可能日・見積書", "Các mục của câu trả lời báo giá (nửa sau Q-2): điểm trung chuyển, ngày bắt đầu sớm nhất, bản báo giá"],
     "a": ["対応可否・月額と料金内訳・見積書（必須）・最短開始可能日（必須）・見積の有効期限（必須）・中継先（任意）・補足コメント。料金内訳の表は保存する", "Khả năng đáp ứng, số tiền theo tháng và chi tiết phí, bản báo giá (bắt buộc), ngày bắt đầu sớm nhất (bắt buộc), thời hạn hiệu lực báo giá (bắt buộc), điểm trung chuyển (tùy chọn), ghi chú bổ sung. Bảng chi tiết phí được lưu"],
     "src": "hong 決定（台帳 F 2026-10-07「見積回答の項目と期限」。確認メモ_TW Q-2）"},
    {"date": "2026-10-07", "target": "OW_QUOT_003 No.19.9",
     "q": ["回答を送る前に確認を出すか", "Có hiện xác nhận trước khi gửi câu trả lời không"],
     "a": ["出す（Q300：回答期限までは詳細画面から修正できる）。コードにはない", "Có (Q300: đến hạn trả lời vẫn sửa được từ màn chi tiết). Code chưa có"],
     "src": "hong 決定（台帳 F 2026-10-07「見積回答の項目と期限」：送る前に確認のモーダル Q300）"},
    {"date": "2026-10-07", "target": "OW_QUOT_001 No.2・4",
     "q": ["一覧の初期の並び・ページ送り・検索のしかた", "Thứ tự mặc định, phân trang, cách tìm kiếm"],
     "a": ["受信日の降順。1ページ 10件（10／20／50／100）。全列で並べ替え。es-search・「未適用」の印は出さない", "Ngày nhận giảm dần. 10 dòng/trang (10／20／50／100). Sắp xếp mọi cột. es-search, không hiện dấu 「未適用」"],
     "src": "台帳 E「一覧の初期の並び」・台帳 K（確認メモ H-1〜H-4）"},
    {"date": "2026-10-07", "target": "OW_QUOT_003 No.19.4",
     "q": ["見積書の添付の形式・大きさ", "Định dạng và dung lượng bản báo giá đính kèm"],
     "a": ["JPG・PNG・PDF・HEIC、1件 5MB、10件まで。Excel・Word は受け付けない（入力の共通基準）", "JPG・PNG・PDF・HEIC, 5MB/tệp, tối đa 10 tệp. Không nhận Excel・Word (chuẩn nhập liệu chung)"],
     "src": "台帳 M-1・E11（確認メモ H-19）"},
    {"date": "2026-10-07", "target": "OW_QUOT_002 No.11.16", "q": ["見積依頼の回答期限の既定（O-4）", "Hạn trả lời mặc định của yêu cầu báo giá (O-4)"], "a": ["5日（運営が依頼のときに入れる日数の既定）", "5 ngày (số ngày mặc định 運営 nhập khi yêu cầu)"], "src": "Claude 推奨・hong 確認待ち（確認メモ_TW §4 の推奨。hong 2026-10-07 の open 回答のうち個別の答えがないもの）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "OW_QUOT_001", "ja": "見積依頼一覧", "vi": "Danh sách yêu cầu báo giá"},
    {"code": "OW_QUOT_002", "ja": "見積依頼詳細", "vi": "Chi tiết yêu cầu báo giá"},
    {"code": "OW_QUOT_003", "ja": "見積依頼回答", "vi": "Trả lời yêu cầu báo giá"},
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
     "const setv=(el,v)=>{const p=Object.getPrototypeOf(el);Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};")
WAITF = "for(let i=0;i<40&&!document.querySelector('.qgrid');i++){await wait(250);}await wait(300);"
SUBMITF = "document.querySelector('.filters .btn.pri').click();await wait(400);"
NGPICK = "document.querySelector('input[name=mode][value=ng]').click();await wait(300);"

CODE_FILTER = {"demo_ok": ["コードの検索は独自の枠（es-search の部品ではない）で、「未適用」の印は出さない。並べ替えとページ送りがない（確認メモ H-1〜H-4）。宿題", "Khung tìm kiếm trong code riêng (không phải thành phần es-search), không hiện dấu 「未適用」; chưa có sắp xếp, phân trang (確認メモ H-1〜H-4). Việc còn tồn"]}
CODE_AMOUNT = {"demo_ok": ["コードの回答は料金内訳の合計を「1件あたりの配送料」として保存し、内訳の表は保存しない（確認メモ Q-2・H-17）。月額としての保存と内訳の保存は宿題", "Code lưu tổng chi tiết phí là 「1件あたりの配送料」 (phí mỗi chuyến) và không lưu bảng chi tiết (確認メモ Q-2・H-17). Lưu theo tháng và lưu chi tiết là việc còn tồn"]}
REQ_FIELDS = lambda base, nums: [
    I(base + "." + str(i + 2), ja, vi, ".qgrid > section.card:first-child .fld::" + lab, "label", detail=[d_ja, d_vi])
    for i, (ja, vi, lab, d_ja, d_vi) in enumerate(nums)
]
FIELDS = [
    ("案件ID", "ID vụ việc", "案件ID", "見積依頼のID（QT-yyyy-mmdd-nnn）。", "ID yêu cầu báo giá (QT-yyyy-mmdd-nnn)."),
    ("対象法人", "Pháp nhân đối tượng", "対象法人", "見積の対象の法人名（拠点名つき）。", "Tên pháp nhân đối tượng báo giá (kèm tên 拠点)."),
    ("件名", "Tiêu đề", "件名", "【ESキッチン】温度帯_住所_見積依頼。", "【ESキッチン】nhiệt độ_địa chỉ_見積依頼."),
    ("集荷先", "Nơi lấy hàng", "集荷先", "引き取りの場所。決まっていなければ「—」。", "Nơi lấy hàng. Chưa quyết thì 「—」."),
    ("配送エリア", "Khu vực giao hàng", "配送エリア", "都道府県と市区町村。", "Tỉnh/thành và quận/huyện."),
    ("住所", "Địa chỉ", "住所", "届け先の郵便番号と住所。", "Mã bưu chính và địa chỉ nơi giao."),
    ("取扱商品（冷蔵／冷凍）", "Hàng xử lý (lạnh／lạnh đông)", "取扱商品", "運ぶ温度帯。", "Vùng nhiệt vận chuyển."),
    ("自販機", "Máy bán hàng", "自販機", "あり／なし／—。", "Có／không／—."),
    ("土日対応", "Giao thứ Bảy, Chủ nhật", "土日対応", "要（土日も配送）／不要／—。", "Cần (giao cả thứ Bảy, Chủ nhật)／không cần／—."),
    ("プラン（月次個数）", "Gói (số lượng theo tháng)", "プラン（月次個数）", "プラン名・月の配送回数・1回の食数。", "Tên gói, số lần giao trong tháng, số suất mỗi lần."),
    ("コース", "Khóa", "コース", "コース名。決まっていなければ「—」。", "Tên khóa. Chưa quyết thì 「—」."),
    ("配送方法", "Phương thức giao hàng", "配送方法", "ES配送便など。", "ES配送便 v.v."),
    ("納品スケジュールのサイクル（希望の曜日）", "Chu kỳ lịch giao (thứ mong muốn)", "納品スケジュールのサイクル", "月の配送回数と希望の曜日。", "Số lần giao trong tháng và thứ mong muốn."),
    ("希望開始日", "Ngày bắt đầu mong muốn", "希望開始日", "決まっていなければ「—」。", "Chưa quyết thì 「—」."),
    ("回答期限", "Hạn trả lời", "回答期限", "運営が設定した回答期限（yyyy-mm-dd）。期限は運営が依頼のときに入れる日数（既定は5日。台帳 F 2026-10-07 で決定済み：確認メモ O-4）。", "Hạn trả lời do 運営 đặt (yyyy-mm-dd). Số ngày hạn do 運営 nhập khi yêu cầu (mặc định 5 ngày; Claude đề xuất, chờ hong xác nhận: 確認メモ O-4)."),
    ("金額条件", "Điều kiện số tiền", "金額条件", "運営が示す金額の条件。なければ「—」。", "Điều kiện số tiền do 運営 nêu. Không có thì 「—」."),
    ("まとめて見積する拠点", "Các 拠点 báo giá cùng lúc", "まとめて見積する拠点", "同じ会社の別の拠点を含めて聞くとき、その名前と住所。", "Khi hỏi gộp các 拠点 khác của cùng công ty thì hiện tên và địa chỉ."),
    ("詳細・特記事項", "Chi tiết, lưu ý đặc biệt", "詳細・特記事項", "運営が書いた補足。", "Phần bổ sung do 運営 viết."),
]

# ------------------------------------------------------------------ 一覧
L1 = [
    I("1", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ 見積依頼一覧」・画面名「見積依頼一覧」・説明「自社に届いた新規見積と契約前の再確認依頼を確認できます。」。", "Breadcrumb 「ホーム ／ 見積依頼一覧」, tên màn 「見積依頼一覧」, mô tả 「自社に届いた新規見積と契約前の再確認依頼を確認できます。」."]),
    I("2", "検索条件", "Điều kiện tìm kiếm", ".filters", "area", pattern="P-LIST",
      detail=["検索条件の枠は es-search。「絞り込む」か Enter で反映する。「未適用」の印は出さない。", "Khung điều kiện dùng es-search. Áp dụng khi nhấn 「絞り込む」 hoặc Enter. Không hiện dấu 「未適用」."], **CODE_FILTER),
    I("2.1", "キーワード", "Từ khóa", "#qk", "text", "input", req="－", len="文字列 60", ex=["ひかり物産", "Một phần tên pháp nhân / tiêu đề / ID vụ việc"],
      detail=["法人名・件名・案件IDなどを部分一致で探す。前後の空白は取り、全角の英数字は半角に直す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo tên pháp nhân, tiêu đề, ID vụ việc v.v. Bỏ khoảng trắng đầu/cuối, đổi chữ số/chữ cái toàn góc sang nửa góc. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("2.2", "依頼種別", "Loại yêu cầu", "#qt", "select", "select", req="－", len="選択", init=["すべて", "Tất cả"], ex=["新規見積", "Chọn 新規見積 hoặc 金額再確認"],
      detail=["選択肢：すべて・新規見積・金額再確認。金額再確認は、契約前に運営が金額・条件の再確認を依頼するもの（Q-4：必要）。", "Lựa chọn: すべて・新規見積・金額再確認. 金額再確認 là yêu cầu 運営 xác nhận lại số tiền / điều kiện trước khi ký hợp đồng (Q-4: cần)."]),
    I("2.3", "回答状況", "Tình trạng trả lời", "#qs", "select", "select", req="－", len="選択", init=["すべて", "Tất cả"], ex=["未回答", "Chọn tình trạng trả lời"],
      detail=["選択肢：すべて・未回答・再確認待ち・回答済み・対応不可・期限切れ。", "Lựa chọn: すべて・未回答・再確認待ち・回答済み・対応不可・期限切れ."]),
    I("2.4", "回答期限", "Hạn trả lời", "#qd", "date", "input", req="－", len="日付（yyyy-mm-dd）", ex=["2026-10-09", "Ngày hạn trả lời cần tìm"],
      detail=["回答期限がその日の依頼だけを出す。日付の入力欄は共通の部品。", "Chỉ hiện yêu cầu có hạn trả lời đúng ngày đó. Ô ngày dùng component chung."]),
    I("2.5", "クリア", "Xóa điều kiện", ".filters button[type=reset]", "button", "click", detail=["条件を初期値に戻して全件を出す。", "Đưa điều kiện về mặc định và hiện tất cả."]),
    I("2.6", "絞り込む", "Lọc", ".filters .btn.pri", "button", "click", detail=["条件を一覧に反映して1ページ目に戻す。Enter でも同じ。", "Áp dụng điều kiện vào danh sách, quay về trang 1. Nhấn Enter cũng giống vậy."]),
    I("3", "件数のカード", "Thẻ số lượng", ".kpis", "area",
      detail=["未回答・回答済み・金額再確認・すべての依頼の件数（自社に届いた依頼の全件で数える）。押すと、その条件で一覧を絞り込み、検索条件の欄も同じ値にする。", "Số lượng chưa trả lời, đã trả lời, xác nhận lại số tiền, tất cả yêu cầu (đếm trên toàn bộ yêu cầu gửi tới công ty). Bấm sẽ lọc danh sách theo điều kiện đó và đưa ô điều kiện về cùng giá trị."]),
    I("3.1", "未回答", "Chưa trả lời", ".kpis .kpi:nth-child(1)", "button", "click", detail=["回答状況＝未回答で絞る。「要対応」の黄のバッジを添える。", "Lọc theo tình trạng = chưa trả lời. Kèm badge vàng 「要対応」."]),
    I("3.2", "回答済", "Đã trả lời", ".kpis .kpi:nth-child(2)", "button", "click", detail=["回答状況＝回答済みで絞る。", "Lọc theo tình trạng = đã trả lời."]),
    I("3.3", "金額再確認", "Xác nhận lại số tiền", ".kpis .kpi:nth-child(3)", "button", "click", detail=["依頼種別＝金額再確認で絞る。「確認待ち」の紫のバッジを添える。", "Lọc theo loại yêu cầu = xác nhận lại số tiền. Kèm badge tím 「確認待ち」."]),
    I("3.4", "すべての依頼", "Tất cả yêu cầu", ".kpis .kpi:nth-child(4)", "button", "click", detail=["条件をはずして全件を出す。", "Bỏ điều kiện và hiện tất cả."]),
    I("4", "見積依頼の一覧", "Danh sách yêu cầu báo giá", "#qtbl", "table", pattern="P-LIST", err=["I01"],
      detail=["自社に届いた見積依頼。初期の並びは受信日の降順。1ページ 10件（10／20／50／100）。列見出しを押して全列で並べ替える。詳細から戻ると条件・ページ・件数を戻す。0件は I01。未回答・再確認待ちの行は強調する。",
              "Yêu cầu báo giá gửi tới công ty. Mặc định ngày nhận giảm dần. 10 dòng/trang (10／20／50／100). Bấm tiêu đề cột để sắp xếp mọi cột. Quay lại từ chi tiết thì khôi phục điều kiện, trang, số dòng. 0 dòng: I01. Dòng chưa trả lời / chờ xác nhận lại được nhấn mạnh."], **CODE_FILTER),
    I("4.1", "案件ID", "ID vụ việc", "#qtbl th::案件ID", "label", detail=["QT-yyyy-mmdd-nnn。", "QT-yyyy-mmdd-nnn."]),
    I("4.2", "件名", "Tiêu đề", "#qtbl th::件名", "label", detail=["【ESキッチン】温度帯_住所_見積依頼。", "【ESキッチン】nhiệt độ_địa chỉ_見積依頼."]),
    I("4.3", "対象法人", "Pháp nhân đối tượng", "#qtbl th::対象法人", "label", detail=["法人名（拠点名つき）。", "Tên pháp nhân (kèm tên 拠点)."]),
    I("4.4", "依頼種別", "Loại yêu cầu", "#qtbl th::依頼種別", "label", detail=["「新規見積」か「金額再確認」（警告のアイコンつき）のタグ。", "Tag 「新規見積」 hoặc 「金額再確認」 (có biểu tượng cảnh báo)."]),
    I("4.5", "配送方法", "Phương thức giao hàng", "#qtbl th::配送方法", "label", detail=["ES配送便など。", "ES配送便 v.v."]),
    I("4.6", "回答期限", "Hạn trả lời", "#qtbl th::回答期限", "label",
      detail=["yyyy-mm-dd。未回答・再確認待ちで期限まで3日以内は黄の「残りN日」、当日は赤の「本日期限」を添える。期限（その日の23:59）を過ぎたら状態が「期限切れ」になり、札は出ない。",
              "yyyy-mm-dd. Chưa trả lời / chờ xác nhận lại mà còn ≤3 ngày thì kèm badge vàng 「残りN日」, đúng ngày hạn thì badge đỏ 「本日期限」. Qua hạn (23:59 của ngày đó) thì trạng thái thành 「期限切れ」 và không còn badge."]),
    I("4.7", "ステータス", "Trạng thái", "#qtbl th::ステータス", "label", detail=["未回答（黄）・再確認待ち（紫）・回答済（緑）・対応不可（灰）・期限切れ（赤）。色は共通の状態の色の表に従う。", "未回答 (vàng)・再確認待ち (tím)・回答済み (xanh lá)・対応不可 (xám)・期限切れ (đỏ). Màu theo bảng màu trạng thái chung."]),
    I("4.8", "操作", "Thao tác", "#qtbl th::操作", "button", "click",
      detail=["未回答・再確認待ちは「回答する」（回答 OW_QUOT_003 へ）、それ以外は「詳細を見る」（詳細 OW_QUOT_002 へ）。", "Chưa trả lời / chờ xác nhận lại là 「回答する」 (tới OW_QUOT_003), còn lại 「詳細を見る」 (tới OW_QUOT_002)."]),
    I("5", "ページ送り", "Phân trang", ".pager", "area", pattern="P-LIST", detail=["「n件中 a–b件」・ページ番号・表示件数（10／20／50／100）。", "「n件中 a–b件」, số trang, số dòng hiển thị (10／20／50／100)."],
      demo_ok=["コードは「n件中 1-n件を表示」だけでページ送りと表示件数が実際には動かない（確認メモ H-3）。宿題", "Code chỉ có 「n件中 1-n件を表示」, phân trang và số dòng hiển thị chưa hoạt động (確認メモ H-3). Việc còn tồn"]),
    I("6", "凡例", "Chú giải", ".box > .legend", "label", detail=["「残りN日」＝回答期限まで3日以内、「本日期限」＝当日。", "「残りN日」 = còn ≤3 ngày đến hạn, 「本日期限」 = đúng ngày hạn."]),
]
L2 = [
    I("2.7", "絞り込み後の一覧", "Danh sách sau khi lọc", "#qtbl", "table", pattern="P-LIST",
      detail=["キーワード・依頼種別・回答状況・回答期限のすべてに合う依頼だけを出し、件数のカード（No.3）の数は変えない。", "Chỉ hiện yêu cầu khớp với cả từ khóa, loại yêu cầu, tình trạng và hạn trả lời; số ở thẻ số lượng (No.3) không đổi."]),
]
L3 = [
    I("7", "件数のカードで絞った表示", "Hiển thị sau khi lọc bằng thẻ", ".filters", "area", pattern="P-LIST",
      detail=["カードを押すと、検索条件の欄（依頼種別・回答状況）も同じ値になり、一覧がその条件で絞られる。「すべての依頼」で戻す。", "Bấm thẻ thì ô điều kiện (loại yêu cầu, tình trạng) cũng đổi cùng giá trị và danh sách được lọc. Bấm 「すべての依頼」 để quay lại."]),
]
L4 = [
    I("8", "0件のとき", "Khi 0 dòng", ".empty", "label", err=["I01"],
      detail=["I01「表示するデータがありません。」を一覧の中に出す。", "Hiện I01 「表示するデータがありません。」 trong danh sách."],
      demo_ok=["コードの文言は「条件に一致する見積依頼はありません。」で I01 と違う（確認メモ H-15）。I01 に揃えるのは宿題", "Câu trong code là 「条件に一致する見積依頼はありません。」 khác I01 (確認メモ H-15). Việc đồng nhất về I01 còn tồn"]),
]
L5 = [
    I("9", "回答期限の札", "Badge hạn trả lời", ".due .badge", "label",
      detail=["残り3日以内は黄の「残りN日」、当日は赤の「本日期限」。期限を過ぎた依頼は「期限切れ」になり、札は出さない（回答できない）。見積の回答期限は運営が依頼のときに設定する。", "Còn ≤3 ngày: badge vàng 「残りN日」; đúng ngày: badge đỏ 「本日期限」. Qua hạn thì thành 「期限切れ」, không hiện badge (không trả lời được). Hạn trả lời do 運営 đặt khi yêu cầu."],
      demo_ok=["本日期限の札は、デモの今日を依頼の期限の日にしたときに出る（この画面は残りN日）。期限超過の札は状態が先に期限切れになるため出ない", "Badge 「本日期限」 hiện khi đặt 'hôm nay' = ngày hạn. Badge quá hạn không hiện vì trạng thái đã chuyển sang 期限切れ trước"]),
]

# ------------------------------------------------------------------ 詳細
D1 = [
    I("10", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ 見積依頼一覧 ／ 見積依頼詳細」。画面名の横に回答状況のバッジ。説明「依頼内容、自社の回答、見積書、回答履歴を確認できます。」。", "Breadcrumb 「ホーム ／ 見積依頼一覧 ／ 見積依頼詳細」. Cạnh tên màn có badge tình trạng trả lời. Mô tả 「依頼内容、自社の回答、見積書、回答履歴を確認できます。」."]),
    I("10.1", "回答状況のバッジ", "Badge tình trạng trả lời", ".ptitle .badge", "label", detail=["未回答・再確認待ち・回答済み・対応不可・期限切れ。", "未回答・再確認待ち・回答済み・対応不可・期限切れ."]),
    I("11", "依頼内容", "Nội dung yêu cầu", ".qgrid > section.card:first-child", "area",
      detail=["運営が設定した依頼内容。委託配送先は編集できない（「運営が設定した条件のため、編集できません。」を出す）。依頼種別のタグ（新規見積／金額再確認）つき。依頼の項目は台帳 B「委託配送会社への見積依頼の項目」。保有車両は委託配送先のプロフィールから運営が見る。",
              "Nội dung yêu cầu do 運営 đặt. Đối tác không sửa được (hiện 「運営が設定した条件のため、編集できません。」). Có tag loại yêu cầu (báo giá mới／xác nhận lại số tiền). Mục yêu cầu theo 台帳 B 「委託配送会社への見積依頼の項目」. Xe sở hữu do 運営 xem từ hồ sơ của đối tác."]),
    I("11.1", "運営が設定した条件のため編集できない", "Không sửa được vì do 運営 đặt", ".lock", "label", detail=["依頼内容の上に出す注記。", "Ghi chú hiện phía trên nội dung yêu cầu."]),
] + REQ_FIELDS("11", [(f[0], f[1], f[2], f[3], f[4]) for f in FIELDS]) + [
    I("12", "自社の回答", "Câu trả lời của công ty mình", ".qform", "area",
      detail=["自社の回答（回答済み・対応不可・期限切れ）。回答済みは、承認・見積金額（月額・税抜）・料金内訳・見積書・見積の有効期限・最短開始可能日・中継先・補足コメント・回答日時。まだのときは「回答する」（回答 OW_QUOT_003）へ。",
              "Câu trả lời của công ty mình (đã trả lời, không đáp ứng được, quá hạn). Đã trả lời hiện: chấp nhận, số tiền báo giá (theo tháng, chưa thuế), chi tiết phí, bản báo giá, thời hạn hiệu lực báo giá, ngày bắt đầu sớm nhất, điểm trung chuyển, ghi chú bổ sung, ngày giờ trả lời. Chưa trả lời thì sang 「回答する」 (OW_QUOT_003)."]),
    I("12.1", "回答", "Câu trả lời", ".qform .fld:nth-of-type(1)", "label", detail=["「承認」（緑）か「対応不可」（灰）のバッジ。", "Badge 「承認」 (xanh lá) hoặc 「対応不可」 (xám)."]),
    I("12.2", "見積金額（月額・税抜）", "Số tiền báo giá (theo tháng, chưa thuế)", ".qform .total", "label",
      detail=["料金内訳の合計。月額（税抜）。円・3桁区切り・右寄せ。", "Tổng chi tiết phí. Theo tháng (chưa thuế). Yên, phân cách hàng nghìn, căn phải."], **CODE_AMOUNT),
    I("12.3", "料金内訳", "Chi tiết phí", ".qform .tbl", "table",
      detail=["基本配送料（月額）のほか、クール便加算・車両・人員費など発生する料金を、項目名と金額（税抜）の行で出す。", "Ngoài phí giao hàng cơ bản (theo tháng) hiện các khoản phát sinh như phụ phí xe lạnh, xe, nhân sự thành các dòng tên mục và số tiền (chưa thuế)."], **CODE_AMOUNT),
    I("12.4", "見積書", "Bản báo giá", ".qform .inp.ro", "link", "click", detail=["回答に添付した見積書。押すと開く（JPG・PNG・PDF・HEIC）。", "Bản báo giá đã đính kèm. Bấm để mở (JPG・PNG・PDF・HEIC)."]),
    I("12.5", "見積の有効期限", "Thời hạn hiệu lực báo giá", "-", "label", detail=["見積金額が有効な期限（yyyy-mm-dd）。回答のときに入れる。期限を過ぎた見積は、運営が再確認を依頼する（Q-4）。", "Hạn mà số tiền báo giá còn hiệu lực (yyyy-mm-dd). Nhập khi trả lời. Báo giá quá hạn thì 運営 yêu cầu xác nhận lại (Q-4)."],
      demo_ok=["コードの回答フォームには見積の有効期限の項目がない（台帳 F 2026-10-07「見積回答の項目と期限」：見積の有効期限は必須）。足すのは宿題", "Form trả lời trong code chưa có mục thời hạn hiệu lực báo giá (台帳 F 2026-10-07 「見積回答の項目と期限」: bắt buộc). Việc thêm còn tồn"]),
    I("12.6", "最短開始可能日", "Ngày bắt đầu sớm nhất", ".qform .fld::最短開始可能日", "label", detail=["「yyyy年m月 サイクルから」。運営が開始のサイクルとして使う。", "「yyyy年m月 サイクルから」. 運営 dùng làm chu kỳ bắt đầu."]),
    I("12.7", "補足コメント", "Ghi chú bổ sung", ".qform .fld::補足コメント", "label", detail=["回答のときに書いたコメント（500文字まで）と、対応できる曜日。なければ「—」。", "Ghi chú viết khi trả lời (tối đa 500 ký tự) và các thứ có thể giao. Không có thì 「—」."]),
    I("12.8", "回答日時", "Ngày giờ trả lời", ".qform .fld::回答日時", "label", detail=["回答した日時（yyyy-mm-dd HH:MM）。", "Ngày giờ đã trả lời (yyyy-mm-dd HH:MM)."]),
    I("12.9", "回答を修正", "Sửa câu trả lời", ".qform > .btn.out", "button", "click",
      detail=["回答期限までは「回答を修正」で回答の画面を開き、回答済みの内容を直して送り直せる（再回答）。対応不可・期限切れの依頼には出さない。", "Đến hạn trả lời, 「回答を修正」 mở màn trả lời để sửa nội dung đã trả lời và gửi lại (trả lời lại). Không hiện với yêu cầu không đáp ứng được hoặc quá hạn."]),
    I("13", "回答履歴", "Lịch sử trả lời", "section.card:last-child .tl", "area",
      detail=["見積依頼の受信・回答・NG回答・期限切れなどを新しい順ではなく、起きた順に縦に並べる。運営の行と自社の行は色で分ける。列：日時・内容・だれ。", "Xếp dọc các sự kiện nhận yêu cầu, trả lời, trả lời NG, quá hạn … theo thứ tự xảy ra. Dòng của 運営 và của công ty mình phân biệt bằng màu. Gồm: ngày giờ, nội dung, người thực hiện."]),
]
D2 = [
    I("14", "NG理由", "Lý do NG", ".qform .fld::NG理由", "label", detail=["NG回答のときの理由（配送エリア対象外・車両・人員を確保できない・取扱商品に対応できない・希望開始日に間に合わない・その他）。", "Lý do khi trả lời NG (ngoài khu vực giao hàng, không đủ xe / nhân sự, không xử lý được hàng, không kịp ngày bắt đầu mong muốn, khác)."]),
    I("14.1", "NGのコメント", "Ghi chú NG", ".qform .fld::コメント", "label", detail=["NG回答のときのコメント。なければ「—」。", "Ghi chú khi trả lời NG. Không có thì 「—」."]),
]
D3 = [
    I("15", "期限切れの回答", "Câu trả lời khi quá hạn", ".qform .fld:nth-of-type(1)", "label",
      detail=["回答しないまま回答期限が過ぎたとき：「回答しないまま期限が過ぎました」と回答期限（yyyy-mm-dd HH:MM）を出す。履歴にも出す。ほかの会社に決まった依頼も「期限切れ」と同じ表示（Q-4 の細かい決め：既定は現行どおり）。「回答を修正」は出さない。",
              "Khi quá hạn mà chưa trả lời: hiện 「回答しないまま期限が過ぎました」 và hạn trả lời (yyyy-mm-dd HH:MM). Cũng hiện trong lịch sử. Yêu cầu đã chọn công ty khác cũng hiển thị giống 「期限切れ」 (chi tiết nhỏ Q-4: mặc định giữ như hiện tại). Không hiện 「回答を修正」."]),
]
D4 = [
    I("16", "見つからないときの表示", "Hiển thị khi không tìm thấy", ".placeholder", "area", err=["I400"],
      detail=["他社の見積ID・存在しない見積IDは I400「見積依頼が見つかりません。」と「見積依頼一覧に戻る」を出す。", "ID báo giá của công ty khác hoặc không tồn tại: hiện I400 「見積依頼が見つかりません。」 và nút 「見積依頼一覧に戻る」."],
      demo_ok=["コードの文言は「見積依頼 {ID} は見つかりません。」（確認メモ H-15・I400）。宿題", "Câu trong code là 「見積依頼 {ID} は見つかりません。」 (確認メモ H-15・I400). Việc còn tồn"]),
]

# ------------------------------------------------------------------ 回答
A1 = [
    I("17", "見出し", "Tiêu đề trang", ".phead", "area", detail=["パンくず「ホーム ／ 見積依頼一覧 ／ 見積依頼回答」。画面名の横に「未回答」「再確認待ち」のバッジ。説明「運営が設定した依頼内容を確認し、対応可否と見積情報を回答してください。」。", "Breadcrumb 「ホーム ／ 見積依頼一覧 ／ 見積依頼回答」. Cạnh tên màn có badge 「未回答」「再確認待ち」. Mô tả 「運営が設定した依頼内容を確認し、対応可否と見積情報を回答してください。」."]),
    I("18", "案件の概要", "Tóm tắt vụ việc", ".qhead", "area", detail=["依頼種別のタグ・案件ID・件名・対象法人・回答期限（残りN日・本日期限の札つき）。読むだけ。", "Tag loại yêu cầu, ID vụ việc, tiêu đề, pháp nhân đối tượng, hạn trả lời (kèm badge 「残りN日」「本日期限」). Chỉ xem."]),
    I("19", "運営が設定した依頼内容", "Nội dung yêu cầu do 運営 đặt", ".qgrid > section.card:first-child", "area", detail=["詳細（OW_QUOT_002）の依頼内容（No.11）と同じ。読むだけ。", "Giống nội dung yêu cầu (No.11) ở chi tiết (OW_QUOT_002). Chỉ xem."]),
    I("20", "回答フォーム", "Form trả lời", ".qform", "area", pattern="P-FORM",
      detail=["「回答を送信」でまとめてチェックし、エラーの項目は赤枠と文言（項目の下）。送信の前に確認を出す（Q300）。回答期限までは詳細画面から修正できる。入力中に離れたら Q02。回答できない状態（期限切れ・対応不可）は E410 を出し、送信できない。",
              "「回答を送信」 kiểm tra gộp, mục lỗi viền đỏ và câu lỗi dưới mục. Trước khi gửi hiện xác nhận (Q300). Đến hạn trả lời vẫn sửa được từ màn chi tiết. Rời khi đang nhập: Q02. Trạng thái không trả lời được (quá hạn, không đáp ứng được): hiện E410 và không gửi được."],
      err=["Q02"]),
    I("20.1", "対応可否", "Khả năng đáp ứng", ".seg", "radio", "select", req="○", len="選択", init=["承認・見積可能", "Chấp nhận・báo giá được"], ex=["承認・見積可能", "Chọn 承認・見積可能 hoặc 対応不可（NG）"],
      detail=["「承認・見積可能」か「対応不可（NG）」。NG を選ぶと料金などの欄が NG 理由とコメントに替わる。", "Chọn 「承認・見積可能」 hoặc 「対応不可（NG）」. Chọn NG thì các ô phí được thay bằng lý do NG và ghi chú."]),
    I("20.2", "料金内訳（月額・税抜）", "Chi tiết phí (theo tháng, chưa thuế)", ".qform .brk", "table", req="－",
      detail=["基本配送料（月額）・クール便加算・車両・人員費の行が初期で並ぶ。項目名（60文字まで）と金額（税抜・円・整数・0〜999,999,999・右寄せ）を入れる。行を足す・消すができる（1行は残す）。ほかに発生する料金があれば行として入れる。",
              "Mặc định có các dòng phí giao hàng cơ bản (theo tháng), phụ phí xe lạnh, xe・nhân sự. Nhập tên mục (tối đa 60 ký tự) và số tiền (chưa thuế, yên, số nguyên, 0〜999,999,999, căn phải). Thêm / xóa dòng được (giữ lại ít nhất 1 dòng). Có khoản phát sinh khác thì nhập thành dòng."],
      len="金額 0〜999,999,999", ex=["基本配送料（月額）／348,000", "Tên mục và số tiền theo tháng (chưa thuế)"], err=["E04", "E14"], **CODE_AMOUNT),
    I("20.2.1", "行を追加", "Thêm dòng", ".qform .btn.out.sm", "button", "click", detail=["料金内訳に空の行を足す。", "Thêm một dòng trống vào chi tiết phí."]),
    I("20.2.2", "行を削除", "Xóa dòng", ".qform .brk tbody tr:first-child button.x", "button", "click", detail=["その行を消す。残り1行のときは押せない。", "Xóa dòng đó. Còn 1 dòng thì không bấm được."]),
    I("20.3", "見積金額（月額・税抜）", "Số tiền báo giá (theo tháng, chưa thuế)", ".qform .total", "label", req="○", err=["E01"],
      detail=["料金内訳の合計が自動で入る（入力しない）。0円のときに送信したら E01（項目名＝見積金額）。月額の目安の換算は出さない（1件あたりではなく月額を回答するため）。", "Tổng chi tiết phí được điền tự động (không nhập). Gửi mà bằng 0 yên: E01 (tên mục = 見積金額). Không hiện quy đổi ước tính (vì trả lời theo tháng chứ không theo từng chuyến)."], **CODE_AMOUNT),
    I("20.4", "見積書の添付", "Đính kèm bản báo giá", ".drop", "file", "upload", req="○", len=["JPG・PNG・PDF・HEIC・1件5MB", "JPG, PNG, PDF, HEIC, 5MB/tệp"],
      ex=["見積書_DE00006.pdf", "Bản báo giá đính kèm (JPG・PNG・PDF・HEIC, mỗi tệp ≤5MB)"], err=["E02", "E11", "E411"],
      detail=["見積書を1件以上添付する（必須）。JPG・PNG・PDF・HEIC・1件5MB・10件まで。Excel・Word は受け付けない。ドラッグ＆ドロップかクリックで選ぶ。未添付は E02、形式が違えば E411、大きさ・件数の超過は E11。",
              "Phải đính kèm ít nhất 1 bản báo giá (bắt buộc). JPG・PNG・PDF・HEIC, mỗi tệp 5MB, tối đa 10 tệp. Không nhận Excel・Word. Chọn bằng kéo-thả hoặc bấm. Chưa đính kèm: E02, sai định dạng: E411, quá dung lượng / số lượng: E11."],
      demo_ok=["コードは PDF・Excel・10MB・1件で、ほかの形式の文言も「PDFまたはExcel形式のファイルを選択してください。」（確認メモ H-19）。共通の基準にするのは宿題", "Code nhận PDF・Excel・10MB・1 tệp, câu lỗi 「PDFまたはExcel形式のファイルを選択してください。」 (確認メモ H-19). Dùng chuẩn chung là việc còn tồn"]),
    I("20.5", "最短開始可能日", "Ngày bắt đầu sớm nhất", "#sd", "date", "input", req="○", len="日付（yyyy-mm-dd）", ex=["2026-11-09", "Ngày sớm nhất có thể bắt đầu giao (hiện chỉ lưu chu kỳ tháng bắt đầu)"], err=["E02"],
      detail=["最短で開始できる日（必須）。保存されるのは開始のサイクル（年月）で、運営が開始の枠に使う。未入力は E02。", "Ngày sớm nhất có thể bắt đầu (bắt buộc). Chỉ lưu chu kỳ bắt đầu (năm-tháng) để 運営 dùng làm khung bắt đầu. Chưa nhập: E02."]),
    I("20.6", "見積の有効期限", "Thời hạn hiệu lực báo giá", "-", "date", "input", req="○", len="日付（yyyy-mm-dd）", ex=["2026-12-31", "Ngày cuối cùng báo giá còn hiệu lực"], err=["E02", "E08"],
      detail=["見積金額が有効な期限（必須）。回答の日以降の日付を選ぶ。未入力は E02、回答の日より前は E08。期限を過ぎたら運営が金額再確認を依頼できる（Q-4）。", "Hạn mà số tiền báo giá còn hiệu lực (bắt buộc). Chọn ngày từ ngày trả lời trở đi. Chưa nhập: E02, trước ngày trả lời: E08. Quá hạn thì 運営 có thể yêu cầu xác nhận lại số tiền (Q-4)."],
      demo_ok=["コードの回答フォームには見積の有効期限の項目がない（台帳 F 2026-10-07「見積回答の項目と期限」：見積の有効期限は必須）。足すのは宿題", "Form trả lời trong code chưa có mục thời hạn hiệu lực báo giá (台帳 F 2026-10-07 「見積回答の項目と期限」: bắt buộc). Việc thêm còn tồn"]),
    I("20.7", "中継先", "Điểm trung chuyển", "-", "text", "input", req="－", len="文字列 60", ex=["栄成ロジ 川崎デポ", "Tên điểm trung chuyển nếu dùng (tối đa 60 ký tự)"], err=["E04"],
      detail=["中継を使うときの中継先の名前（任意）。運営が中継先として登録するための情報。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tên điểm trung chuyển khi dùng trung chuyển (tùy chọn). Thông tin để 運営 đăng ký làm điểm trung chuyển. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."],
      demo_ok=["コードの回答フォームに中継先の欄がない（配送_06 §12-6）。台帳 F 2026-10-07：中継先は任意。足すのは宿題。入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題", "Form trả lời trong code chưa có ô điểm trung chuyển (配送_06 §12-6). 台帳 F 2026-10-07: điểm trung chuyển là tùy chọn. Việc thêm còn tồn。Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn"]),
    I("20.8", "補足コメント", "Ghi chú bổ sung", "#qcm", "textarea", "input", req="－", len="文字列 500", ex=["土曜も対応できます", "Thông tin bổ sung / điều kiện (tối đa 500 ký tự)"], err=["E04"],
      detail=["補足・特記事項・条件など。複数行・500文字まで。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Thông tin bổ sung, lưu ý, điều kiện v.v. Nhiều dòng, tối đa 500 ký tự. Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."],
      demo_ok=["コードは 1000文字まで（確認メモ H-7）。500文字にするのは宿題", "Code cho tối đa 1000 ký tự (確認メモ H-7). Việc đổi về 500 ký tự còn tồn"]),
    I("20.9", "回答を送信", "Gửi câu trả lời", ".qform .btn.submit", "button", "click", err=["Q300", "S304", "E30"],
      detail=["入力をまとめてチェックし、エラーがなければ送信の確認（Q300）を出す。「送信する」で回答を送り、S304 のトーストを出して詳細（OW_QUOT_002）へ移る。押したら二重に押せなくする。失敗は E30。ほかの人が先に回答していたら E31。",
              "Kiểm tra gộp nội dung nhập; không lỗi thì hiện xác nhận gửi (Q300). Bấm 「送信する」 để gửi, hiện toast S304 và chuyển sang chi tiết (OW_QUOT_002). Khóa nút sau khi bấm. Thất bại: E30. Người khác đã trả lời trước: E31."],
      demo_ok=["コードは確認を出さずすぐ送り、トーストは「回答を送信しました」（共通メッセージ未使用・確認メモ H-17）。宿題", "Code gửi ngay không hiện xác nhận, toast 「回答を送信しました」 (chưa dùng thông điệp chung, 確認メモ H-17). Việc còn tồn"]),
]
A2 = [
    I("21", "入力エラーの表示", "Hiển thị lỗi nhập", ".qform .err", "label", err=["E01", "E02"],
      detail=["「回答を送信」で必須が空のものを、項目の下に赤い文言で出す（見積金額は E01、見積書・最短開始可能日・見積の有効期限は E02）。最初のエラーの項目へスクロールする。",
              "Khi 「回答を送信」 mà ô bắt buộc để trống thì hiện câu đỏ dưới mục (số tiền: E01; bản báo giá, ngày bắt đầu sớm nhất, thời hạn hiệu lực: E02). Cuộn tới mục lỗi đầu tiên."],
      demo_ok=["コードの文言は「料金内訳に金額を入力してください。見積金額は必須です。」「見積書を添付してください。」「最短開始可能日を選択してください。」（共通メッセージ未使用・確認メモ H-9・H-17）。宿題", "Câu trong code là 「料金内訳に金額を入力してください。…」「見積書を添付してください。」「最短開始可能日を選択してください。」 (chưa dùng thông điệp chung, 確認メモ H-9・H-17). Việc còn tồn"]),
]
A3 = [
    I("22", "NG理由", "Lý do NG", ".radios.col", "radio", "select", req="○", len="選択", init=["（未選択）", "(Chưa chọn)"], ex=["配送エリア対象外", "Chọn một lý do NG"], err=["E02"],
      detail=["選択肢：配送エリア対象外・車両・人員を確保できない・取扱商品に対応できない・希望開始日に間に合わない・その他。未選択は E02（項目名＝NG理由）。", "Lựa chọn: ngoài khu vực giao hàng・không đủ xe / nhân sự・không xử lý được hàng・không kịp ngày bắt đầu mong muốn・khác. Chưa chọn: E02 (tên mục = NG理由)."]),
    I("22.1", "コメント", "Ghi chú", "#ngc", "textarea", "input", req="条件付き", len="文字列 500", ex=["年内は車両が空きません", "Ghi chú về lý do NG (tối đa 500 ký tự)"], err=["E01", "E04"],
      cond=["NG理由が「その他」のときは必須。それ以外は任意", "Bắt buộc khi lý do NG là 「その他」; còn lại tùy chọn"],
      detail=["NG理由の補足。複数行・500文字まで。「その他」を選んで空のまま送信したら E01（項目名＝コメント）。入力欄は500文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Bổ sung lý do NG. Nhiều dòng, tối đa 500 ký tự. Chọn 「その他」 mà gửi để trống: E01 (tên mục = コメント). Ô nhập bị chặn ở giới hạn 500 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."]),
    I("22.2", "NG回答を送信", "Gửi câu trả lời NG", ".qform .btn.submit", "button", "click", err=["S305", "E30"],
      detail=["NG理由をチェックして、NG回答を送る（確認 Q300 を出す）。送れたら S305 のトーストを出して詳細へ。状態は「対応不可」になり、運営に通知する。", "Kiểm tra lý do NG rồi gửi câu trả lời NG (hiện xác nhận Q300). Gửi xong hiện toast S305 và sang chi tiết. Trạng thái thành 「対応不可」 và thông báo cho 運営."]),
]
A4 = [
    I("23", "NG回答の入力エラー", "Lỗi nhập khi trả lời NG", ".qform .err", "label", err=["E02", "E01"],
      detail=["NG理由が未選択なら E02、「その他」でコメントが空なら E01 を、項目の下に出す。", "Chưa chọn lý do NG: E02; chọn 「その他」 mà ghi chú để trống: E01 — hiện dưới mục."],
      demo_ok=["コードの文言は「NG理由を選択してください。」「『その他』の場合はコメントを入力してください。」（共通メッセージ未使用・確認メモ H-17）。宿題", "Câu trong code là 「NG理由を選択してください。」「『その他』の場合はコメントを入力してください。」 (chưa dùng thông điệp chung, 確認メモ H-17). Việc còn tồn"]),
]
A5 = [
    I("24", "回答の修正（回答済みの内容を再送）", "Sửa câu trả lời (gửi lại nội dung đã trả lời)", ".qform", "area", err=["E31", "S304"],
      detail=["回答済みの依頼を「回答を修正」で開いたときは、いまの回答（見積金額・料金内訳・見積書・最短開始可能日・見積の有効期限・補足）を入れた状態で開き、直して送り直す（回答期限まで）。送り直すと回答履歴に「回答を修正」の行が増える。",
              "Khi mở yêu cầu đã trả lời bằng 「回答を修正」, form mở với câu trả lời hiện tại (số tiền, chi tiết phí, bản báo giá, ngày bắt đầu sớm nhất, thời hạn hiệu lực, ghi chú) để sửa và gửi lại (đến hạn trả lời). Gửi lại thì lịch sử có thêm dòng 「回答を修正」."],
      demo_ok=["コードの回答画面は回答済みの内容を入れずに空で開く（確認メモ §1-6 状態 014）。内容を入れて開くのは宿題", "Màn trả lời trong code mở trống, không điền nội dung đã trả lời (確認メモ §1-6 trạng thái 014). Việc điền sẵn nội dung còn tồn"]),
]
A6 = [
    I("25", "回答できない（期限切れ・対応不可）", "Không trả lời được (quá hạn / không đáp ứng được)", ".qform p.err", "label", err=["E410"],
      detail=["回答期限が過ぎた依頼・対応不可にした依頼の回答画面を開いたときは、フォームの上に E410「この見積依頼は{状態}のため、回答できません。」を出し、「回答を送信」を押せなくする。", "Khi mở màn trả lời của yêu cầu quá hạn hoặc đã không đáp ứng được thì hiện E410 「この見積依頼は{状態}のため、回答できません。」 phía trên form và vô hiệu nút 「回答を送信」."],
      demo_ok=["コードの文言は「この見積依頼は{状態}のため、回答できません。」（E410 と同じ。共通メッセージを使っていない）", "Câu trong code giống E410 nhưng chưa dùng thông điệp chung"]),
]
A7 = [
    I("26", "添付ファイルのエラー", "Lỗi tệp đính kèm", ".qform .err", "label", err=["E411", "E11"],
      detail=["形式が違うファイルを選んだら項目の下に E411、大きさ・件数を超えたら E11 を出し、ファイルは添付しない。", "Chọn tệp sai định dạng thì hiện E411 dưới mục, vượt dung lượng / số lượng thì E11, và không đính kèm tệp."]),
]
A8 = [
    I("27", "送信の確認", "Xác nhận gửi", "-", "modal", err=["Q300"],
      detail=["「回答を送信」を押して入力にエラーがなければ Q300「回答を送信しますか？／回答期限までは、詳細画面から修正できます。」を出す。ボタンは「キャンセル」「送信する」。", "Nhấn 「回答を送信」 mà không có lỗi thì hiện Q300 「回答を送信しますか？／回答期限までは、詳細画面から修正できます。」. Nút 「キャンセル」「送信する」."],
      demo_ok=["コードは送信の前に確認（Q300）を出さずすぐ送る（台帳 F 2026-10-07：送る前に確認のモーダルを出す）。撮るには送信前の確認の画面が要り、見本データでは送信すると回答の状態が変わるため、撮影では送らない", "Code không hiện xác nhận (Q300) trước khi gửi mà gửi ngay (台帳 F 2026-10-07: phải hiện modal xác nhận trước khi gửi). Gửi sẽ làm đổi trạng thái trả lời của dữ liệu mẫu nên khi chụp không gửi"]),
]
A9 = [
    I("28", "編集中に離れる確認", "Xác nhận khi rời lúc đang nhập", ".modal.sm", "modal", err=["Q02"], pattern="P-FORM",
      detail=["入力を変えたまま、サイドメニュー・ヘッダーなどで別の画面へ移ろうとしたら Q02（キャンセル／破棄）を出す。ブラウザを閉じる・再読み込みでも同じ。", "Đã sửa mà định chuyển sang màn khác bằng menu bên, header v.v. thì hiện Q02 (キャンセル／破棄). Đóng trình duyệt hoặc tải lại cũng giống vậy."]),
]
A10 = [
    I("29", "金額再確認への回答", "Trả lời xác nhận lại số tiền", "-", "area", err=["S308"],
      detail=["依頼種別が「金額再確認」のとき（Q-4：必要）、回答画面を再確認用にする：前回の見積金額（月額・税抜）・前回の見積書・前回回答日・運営からのメッセージを出し、「再確認の回答」を選ぶ（金額・条件とも変更なし／金額変更あり／対応不可（NG））。金額変更ありのときは、新しい見積金額（月額・税抜・必須）・新しい見積書（必須）・変更理由（500文字まで）を入れる。送れたら S308。再確認の回答にも見積の有効期限を入れる。",
              "Khi loại yêu cầu là 「金額再確認」 (Q-4: cần), màn trả lời chuyển sang dạng xác nhận lại: hiện số tiền báo giá trước (theo tháng, chưa thuế), bản báo giá trước, ngày trả lời trước, tin nhắn từ 運営; chọn 「再確認の回答」 (không đổi số tiền / điều kiện／có đổi số tiền／không đáp ứng được (NG)). Nếu đổi số tiền thì nhập số tiền mới (theo tháng, chưa thuế, bắt buộc), bản báo giá mới (bắt buộc), lý do đổi (tối đa 500 ký tự). Gửi xong hiện S308. Câu trả lời xác nhận lại cũng nhập thời hạn hiệu lực báo giá."],
      demo_ok=["見本データの見積依頼はすべて「新規見積」で、金額再確認がない（コードの再確認の画面は前回の見積を固定の見本値で出す・確認メモ H-17）。金額再確認の依頼を運営が出す操作は運営D（配送問い合わせ）の宿題", "Mọi yêu cầu báo giá trong dữ liệu mẫu đều là 「新規見積」, không có 金額再確認 (màn xác nhận lại trong code hiện báo giá trước bằng giá trị mẫu cố định, 確認メモ H-17). Thao tác 運営 gửi yêu cầu xác nhận lại là việc còn tồn của 運営D (hỏi thông tin giao hàng)"]),
]

JS_FILE_BAD = ("const inp=document.querySelector('#qfile');const dt=new DataTransfer();dt.items.add(new File(['x'],'見積書.docx'));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await wait(400);")

VIEWS = [
    V("001", "OW_QUOT_001", "初期表示（件数のカード4つ・一覧）", "Hiển thị ban đầu (4 thẻ số lượng, danh sách)", "/carrier/quotes", L1,
      note=["栄成ロジ（DE00001）。回答済みの見積依頼が2件。デモの今日は 2026-10-05。", "栄成ロジ (DE00001). Có 2 yêu cầu báo giá đã trả lời. 'Hôm nay' của demo là 2026-10-05."]),
    V("002", "OW_QUOT_001", "絞り込み（キーワード・依頼種別・回答状況・回答期限）", "Lọc (từ khóa, loại yêu cầu, tình trạng, hạn trả lời)", "/carrier/quotes", L2,
      setup=H + "setv(document.querySelector('#qk'),'ひかり');await wait(200);" + SUBMITF, wait=500,
      note=["キーワード「ひかり」で絞り込んだ状態。項目は No.2 と同じ。", "Đã lọc bằng từ khóa 「ひかり」. Các mục giống No.2."]),
    V("003", "OW_QUOT_001", "件数のカード「未回答」を押す", "Bấm thẻ 「未回答」", "/carrier/quotes", L3, login="DE00006",
      setup=H + "document.querySelector('.kpis .kpi').click();await wait(400);", wait=500,
      note=["みどり便（DE00006）。「未回答」のカードを押した状態。QT-2026-1005-021 だけが出る。", "みどり便 (DE00006). Đã bấm thẻ 「未回答」. Chỉ hiện QT-2026-1005-021."]),
    V("004", "OW_QUOT_001", "0件（I01）", "0 dòng (I01)", "/carrier/quotes", L4,
      setup=H + "setv(document.querySelector('#qk'),'ZZZ');await wait(200);" + SUBMITF, wait=500,
      note=["該当のないキーワードで絞り込んだ状態。", "Đã lọc bằng từ khóa không khớp."]),
    V("005", "OW_QUOT_001", "期限が近い（残りN日・本日期限）", "Sắp hết hạn (còn N ngày, đúng ngày hạn)", "/carrier/quotes", L5, login="DE00007",
      note=["山本配送（DE00007）。QT-2026-1002-019 は回答期限が 10/07 で、デモの今日（10/05）から「残り2日」。", "山本配送 (DE00007). QT-2026-1002-019 hạn trả lời 10/07 nên 'còn 2 ngày' tính từ 'hôm nay' (10/05)."]),
    V("006", "OW_QUOT_002", "回答済（依頼内容・自社の回答・回答履歴）", "Đã trả lời (nội dung yêu cầu, câu trả lời, lịch sử)", "/carrier/quotes/QT-2026-1002-019", D1,
      setup=H + WAITF, wait=400,
      note=["栄成ロジが回答済みの見積依頼。見本の回答は「1件あたりの配送料 2,200円」で、月額に直すのは宿題。", "Yêu cầu báo giá 栄成ロジ đã trả lời. Câu trả lời mẫu là 「1件あたりの配送料 2,200円」, việc đổi sang theo tháng là việc còn tồn."]),
    V("007", "OW_QUOT_002", "対応不可（NG）", "Không đáp ứng được (NG)", "/carrier/quotes/QT-2026-0929-017", D2, login="DE00007",
      setup=H + WAITF, wait=400,
      note=["山本配送（DE00007）が辞退した見積依頼。", "Yêu cầu báo giá 山本配送 (DE00007) đã từ chối."]),
    V("008", "OW_QUOT_002", "期限切れ（回答しないまま）", "Quá hạn (chưa trả lời)", "/carrier/quotes/QT-2026-1002-019", D3, login="DE00007", today="2026/10/09",
      setup=H + WAITF, wait=400,
      note=["山本配送（DE00007）。デモの今日を 2026/10/09 にして、回答期限（10/07）を過ぎた未回答の依頼を出した状態。", "山本配送 (DE00007). Đặt 'hôm nay' = 2026/10/09 để hiện yêu cầu chưa trả lời đã qua hạn (10/07)."]),
    V("009", "OW_QUOT_002", "見つからない", "Không tìm thấy", "/carrier/quotes/QT-2026-1002-019", D4, login="DE00006",
      note=["みどり便（DE00006）が、自社に来ていない見積ID（栄成ロジ・山本配送あて）を開いた状態。", "みどり便 (DE00006) mở ID báo giá không gửi tới công ty mình (gửi cho 栄成ロジ・山本配送)."]),
    V("010", "OW_QUOT_003", "新規見積：初期（承認・見積可能）", "Báo giá mới: ban đầu (chấp nhận・báo giá được)", "/carrier/quotes/QT-2026-1005-021/answer", A1, login="DE00006",
      setup=H + WAITF, wait=400,
      note=["みどり便（DE00006）の未回答の見積依頼の回答画面。", "Màn trả lời yêu cầu báo giá chưa trả lời của みどり便 (DE00006)."]),
    V("011", "OW_QUOT_003", "入力エラー（金額・見積書・開始可能日）", "Lỗi nhập (số tiền, bản báo giá, ngày bắt đầu)", "/carrier/quotes/QT-2026-1005-021/answer", A2, login="DE00006",
      setup=H + WAITF + "document.querySelector('.qform .btn.submit').click();await wait(400);", wait=500,
      note=["何も入れずに「回答を送信」を押した状態。", "Đã bấm 「回答を送信」 khi chưa nhập gì."]),
    V("012", "OW_QUOT_003", "NG（理由・コメント）", "NG (lý do, ghi chú)", "/carrier/quotes/QT-2026-1005-021/answer", A3, login="DE00006",
      setup=H + WAITF + NGPICK, wait=500,
      note=["「対応不可（NG）」を選んだ状態。", "Đã chọn 「対応不可（NG）」."]),
    V("013", "OW_QUOT_003", "NG 入力エラー（理由なし／「その他」でコメントなし）", "Lỗi nhập khi NG (chưa chọn lý do / 「その他」 không có ghi chú)", "/carrier/quotes/QT-2026-1005-021/answer", A4, login="DE00006",
      setup=H + WAITF + NGPICK + "document.querySelector('.qform .btn.submit').click();await wait(400);", wait=500,
      note=["NG を選んで理由を選ばずに「NG回答を送信」を押した状態。", "Đã chọn NG và bấm 「NG回答を送信」 khi chưa chọn lý do."]),
    V("014", "OW_QUOT_003", "回答の修正（回答済みの内容を再送）", "Sửa câu trả lời (gửi lại nội dung đã trả lời)", "/carrier/quotes/QT-2026-1002-019/answer", A5,
      setup=H + WAITF, wait=400,
      note=["栄成ロジが回答済みの依頼の回答画面。コードは空のフォームで開く（回答済みの内容を入れて開くのは宿題）。", "Màn trả lời của yêu cầu 栄成ロジ đã trả lời. Code mở form trống (điền sẵn nội dung đã trả lời là việc còn tồn)."]),
    V("015", "OW_QUOT_003", "回答できない（期限切れ・対応不可）", "Không trả lời được (quá hạn / không đáp ứng được)", "/carrier/quotes/QT-2026-0929-017/answer", A6, login="DE00007",
      setup=H + WAITF, wait=400,
      note=["山本配送（DE00007）が対応不可にした依頼の回答画面を開いた状態。「回答を送信」は押せない。", "Mở màn trả lời của yêu cầu 山本配送 (DE00007) đã không đáp ứng được. Không bấm được 「回答を送信」."]),
    V("016", "OW_QUOT_003", "添付ファイルのエラー（形式・サイズ）", "Lỗi tệp đính kèm (định dạng, dung lượng)", "/carrier/quotes/QT-2026-1005-021/answer", A7, login="DE00006",
      setup=H + WAITF + JS_FILE_BAD, wait=500,
      note=["見積書に Word のファイル（.docx）を選んだ状態。", "Đã chọn tệp Word (.docx) làm bản báo giá."]),
    V("017", "OW_QUOT_003", "送信確認（Q300）", "Xác nhận gửi (Q300)", "/carrier/quotes/QT-2026-1005-021/answer", A8, login="DE00006",
      setup=H + WAITF, wait=400,
      note=["コードは送信の確認を出さないので、撮れない（台帳 F 2026-10-07：送る前に確認のモーダル Q300 を出す決定。コードに無いため）。画面は No.20 の初期と同じ。", "Code không hiện xác nhận gửi nên không chụp được (đề xuất của Claude, chờ hong xác nhận). Màn hình giống ban đầu của No.20."]),
    V("018", "OW_QUOT_003", "編集中に離れる（Q02）", "Rời khi đang nhập (Q02)", "/carrier/quotes/QT-2026-1005-021/answer", A9, login="DE00006",
      setup=H + WAITF + NGPICK + "document.querySelector('.menu a[href=\"/carrier/profile\"]').click();await wait(500);", wait=500,
      note=["NG を選んでからサイドメニューの「プロフィール」を押した直後。", "Ngay sau khi chọn NG rồi bấm 「プロフィール」 ở menu bên."]),
    V("019", "OW_QUOT_003", "金額再確認への回答（Q-4 で必要）", "Trả lời xác nhận lại số tiền (cần theo Q-4)", "/carrier/quotes/QT-2026-1005-021/answer", A10, login="DE00006",
      setup=H + WAITF, wait=400,
      note=["見本データに金額再確認の依頼がないので撮れない。画面は新規見積の初期と同じ。", "Dữ liệu mẫu không có yêu cầu xác nhận lại số tiền nên không chụp được. Màn hình giống báo giá mới ban đầu."]),
]
