# -*- coding: utf-8 -*-
"""
委託配送先Web「集金管理」（OW_COLL）の画面設計書データ。
元：本物の Web（app/carrier/collect/page.tsx・_ui/csv.tsx・lib/domain/areas/carrier.ts の monthly）。
決定：docs/決定台帳.md F（2026-10-07：集金管理の表は期間で絞れる）、台帳 B（駐車料金は集金と別・法人Webには出さない）、台帳 K・M-1（一覧の標準・CSV出力）、確認メモ_TW_委託配送先 §3（H-1〜H-5・H-36）。
コードがまだ決定に追いついていないところは demo_ok。
"""

TITLE = ["集金管理（OW_COLL）", "Quản lý thu tiền (OW_COLL)"]
SHEET = ["集金管理", "Quản lý thu tiền"]
BASENAME = "画面設計書_OW_COLL_集金管理"
IMG_PREFIX = "OW_COLL"
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
    {"date": "2026-10-07", "target": "OW_COLL 全体",
     "q": ["Screen Code の頭文字", "Tiền tố Screen Code"],
     "a": ["OW（委託配送先Web）", "OW (委託配送先Web)"], "src": "hong 回答 2026-10-07（台帳 F・受付簿 No.290）"},
    {"date": "2026-10-07", "target": "OW_COLL_001 No.3・4・5",
     "q": ["集金管理の表と合計は検索の期間で絞るか", "Bảng và tổng của Quản lý thu tiền có lọc theo khoảng thời gian tìm kiếm không"],
     "a": ["期間で絞る。表・合計・CSV出力のすべてが同じ条件（期間とキーワード）で動く。コードは期間を CSV出力にだけ使い、表と合計には効かせていない", "Có lọc theo khoảng thời gian. Bảng, tổng và xuất CSV đều dùng cùng điều kiện (khoảng thời gian và từ khóa). Code hiện chỉ dùng khoảng thời gian cho xuất CSV, không áp dụng cho bảng và tổng"],
     "src": "hong 回答 2026-10-07（台帳 F「委託配送先の集金管理・お知らせ」・受付簿 No.293）"},
    {"date": "2026-10-07", "target": "OW_COLL_001 No.5.4・5.5",
     "q": ["駐車料金の扱い", "Cách xử lý phí đỗ xe"],
     "a": ["駐車料金は集金とは別の列。ドライバーが立て替え、委託がまとめて運営へ請求する。法人Webには出さない", "Phí đỗ xe là cột riêng, tách khỏi tiền thu. Tài xế ứng trước, đối tác gộp lại yêu cầu 運営. Không hiện ở Web pháp nhân"],
     "src": "台帳 B（確認メモ_TW §6 で合意済み）"},
    {"date": "2026-10-07", "target": "OW_COLL_001 No.3・5",
     "q": ["一覧の初期の並び・ページ送り・検索のしかた", "Thứ tự mặc định, phân trang, cách tìm kiếm"],
     "a": ["配送スタッフIDの昇順（マスタの一覧）。1ページ 10件（10／20／50／100）。全列で並べ替え。es-search・「未適用」の印は出さない", "ID nhân viên giao hàng tăng dần (danh sách master). 10 dòng/trang (10／20／50／100). Sắp xếp mọi cột. es-search, không hiện dấu 「未適用」"],
     "src": "台帳 E「一覧の初期の並び」・台帳 K（確認メモ H-1〜H-4）"},
]
CHANGES = []

HIDE_ALWAYS = [".es-demo-bar", "#es-review"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [{"code": "OW_COLL_001", "ja": "集金管理", "vi": "Quản lý thu tiền"}]

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
SUBMIT = "document.querySelector('.search-row .btn.pri').click();await wait(400);"
NOT_FILTERED = {"demo_ok": ["コードの表と合計は検索の期間を見ない（期間は CSV出力だけに効く）（確認メモ H-36）。表・合計も期間で絞るのは宿題", "Bảng và tổng trong code không xét khoảng thời gian tìm kiếm (chỉ áp dụng cho xuất CSV) (確認メモ H-36). Việc lọc cả bảng và tổng theo khoảng thời gian còn tồn"]}

L1 = [
    I("1", "見出し", "Tiêu đề trang", ".crumb", "area", detail=["パンくず「ホーム ／ 集金管理」。", "Breadcrumb 「ホーム ／ 集金管理」."]),
    I("1.1", "画面名", "Tên màn hình", "h1.ptitle", "label", detail=["画面名は「集金管理」。配送スタッフごとの集金・駐車の合計を見る画面。", "Tên màn hình là 「集金管理」. Màn xem tổng tiền thu và phí đỗ xe theo từng nhân viên giao hàng."]),
    I("2", "支払の明細（月）", "Chi tiết thanh toán (tháng)", ".phead .btn::支払の明細", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["見出しの右。月（検索の開始日の年月）の支払の明細をCSVに出す。列：納品日・配送ID・届け先・配送スタッフID・配送スタッフ名・納品数・支払額（税抜）・集金額（税込）・駐車料金（税込）。支払額は、委託配送先が納品した区間の額。",
              "Bên phải tiêu đề. Xuất chi tiết thanh toán của tháng (năm-tháng của ngày bắt đầu tìm kiếm) ra CSV. Cột: ngày giao, ID giao hàng, nơi giao, ID và tên nhân viên, số lượng giao, tiền thanh toán (chưa thuế), tiền thu (gồm thuế), phí đỗ xe (gồm thuế). Tiền thanh toán là số tiền của chặng đối tác đã giao."]),
    I("2.1", "CSV出力（集金管理）", "Xuất CSV (Quản lý thu tiền)", ".phead .btn.pri", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["検索条件（期間・配送スタッフ）のとおりの全件を、配送ごとに出す。列：配送日・配送ID・配送スタッフID・配送スタッフ名・配送先名・集金金額（税込）・駐車料金（税込）。拠点ごとの内訳つき（REQ-DL-507）。駐車料金は集金と別の列。",
              "Xuất toàn bộ theo điều kiện tìm kiếm (khoảng thời gian, nhân viên), mỗi chuyến một dòng. Cột: ngày giao, ID giao hàng, ID và tên nhân viên, tên nơi giao, tiền thu (gồm thuế), phí đỗ xe (gồm thuế). Có chi tiết theo từng 拠点 (REQ-DL-507). Phí đỗ xe là cột riêng tách khỏi tiền thu."]),
    I("3", "検索条件", "Điều kiện tìm kiếm", ".search-row", "area", pattern="P-LIST",
      detail=["検索条件の枠は es-search。「検索」か Enter で反映する。「未適用」の印は出さない。期間・キーワードは表・合計・CSV出力のすべてに効く。",
              "Khung điều kiện dùng es-search. Áp dụng khi nhấn 「検索」 hoặc Enter. Không hiện dấu 「未適用」. Khoảng thời gian và từ khóa áp dụng cho bảng, tổng và xuất CSV."], **NOT_FILTERED),
    I("3.1", "期間（開始日）", "Khoảng thời gian (từ ngày)", "input[aria-label=\"開始日\"]", "date", "input", req="－", len="日付（yyyy-mm-dd）",
      init=["今日の20日前", "20 ngày trước hôm nay"], ex=["2026-09-15", "Ngày bắt đầu khoảng thời gian (theo ngày giao)"],
      detail=["納品日がこの日以降の配送で数える。空なら下限なし。支払の明細（月）はこの日の年月。", "Đếm các chuyến có ngày giao từ ngày này. Để trống thì không giới hạn dưới. Chi tiết thanh toán (tháng) lấy theo năm-tháng của ngày này."], err=["E08"]),
    I("3.2", "期間（終了日）", "Khoảng thời gian (đến ngày)", "input[aria-label=\"終了日\"]", "date", "input", req="－", len="日付（yyyy-mm-dd）",
      init=["今日の10日後", "10 ngày sau hôm nay"], ex=["2026-10-15", "Ngày kết thúc khoảng thời gian (theo ngày giao)"],
      detail=["納品日がこの日以前の配送で数える。開始日より前の日は E08。", "Đếm các chuyến có ngày giao đến ngày này. Ngày trước ngày bắt đầu: E08."], err=["E08"]),
    I("3.3", "配送スタッフID・名", "ID・tên nhân viên giao hàng", "input[placeholder=\"配送スタッフID・名\"]", "text", "input", req="－", len="文字列 60",
      ex=["山口", "Một phần ID hoặc tên nhân viên giao hàng"],
      detail=["配送スタッフのIDか名前を部分一致で探す。前後の空白は取り、全角の英数字は半角に直す。入力欄は60文字の上限で止まり、それ以上は入らない。貼り付けで上限を超えたときだけ E04 を出す（台帳 S・受付簿 #446）。", "Tìm khớp một phần theo ID hoặc tên nhân viên giao hàng. Bỏ khoảng trắng đầu/cuối, đổi chữ số/chữ cái toàn góc sang nửa góc. Ô nhập bị chặn ở giới hạn 60 ký tự, không nhập thêm được. Chỉ khi dán vượt giới hạn mới hiện E04 (台帳 S・受付簿 #446)."], demo_ok=["入力欄の上限で止める動き（台帳 S・受付簿 #446）は宿題。", "Việc chặn nhập ở giới hạn của ô nhập (台帳 S・受付簿 #446) còn tồn."], err=["E04"]),
    I("3.4", "クリア", "Xóa điều kiện", ".search-row .btn.out", "button", "click", detail=["期間・キーワードを初期値に戻して再検索する。", "Đưa khoảng thời gian và từ khóa về mặc định và tìm lại."]),
    I("3.5", "検索", "Tìm kiếm", ".search-row .btn.pri", "button", "click", detail=["条件を表・合計に反映して1ページ目に戻す。Enter でも同じ。", "Áp dụng điều kiện vào bảng và tổng, quay về trang 1. Nhấn Enter cũng giống vậy."]),
    I("4", "合計", "Tổng", ".stat", "area",
      detail=["表の条件（期間・キーワード）に合う全件の合計（ページに関係なく）。", "Tổng của toàn bộ dòng khớp điều kiện bảng (khoảng thời gian, từ khóa), không phụ thuộc trang."], **NOT_FILTERED),
    I("4.1", "集金合計金額", "Tổng tiền thu", ".stat > div:nth-child(1)", "label", detail=["集金額（税込）の合計。単位は円・3桁区切り。", "Tổng tiền thu (gồm thuế). Đơn vị yên, phân cách hàng nghìn."]),
    I("4.2", "駐車合計料金", "Tổng phí đỗ xe", ".stat > div:nth-child(2)", "label", detail=["駐車料金（税込）の合計。集金とは別に出す。", "Tổng phí đỗ xe (gồm thuế). Hiện tách khỏi tiền thu."]),
    I("5", "配送スタッフごとの一覧", "Danh sách theo nhân viên giao hàng", ".tbl", "table", pattern="P-LIST", err=["I01"],
      detail=["自社の配送スタッフごとに1行。初期の並びは配送スタッフIDの昇順。1ページ 10件（10／20／50／100）。列見出しを押して全列で並べ替える。0件は I01。名前を押すと配送スタッフ詳細の「担当配送情報」タブ（OW_STAF_002）へ。",
              "Mỗi nhân viên giao hàng của công ty là 1 dòng. Mặc định ID nhân viên tăng dần. 10 dòng/trang (10／20／50／100). Bấm tiêu đề cột để sắp xếp mọi cột. 0 dòng: I01. Bấm tên để mở tab 「担当配送情報」 của chi tiết nhân viên (OW_STAF_002)."],
      demo_ok=["コードの表は並べ替え・ページ送りがなく、期間で絞らない（確認メモ H-3・H-4・H-36）。宿題", "Bảng trong code chưa có sắp xếp, phân trang và chưa lọc theo khoảng thời gian (確認メモ H-3・H-4・H-36). Việc còn tồn"]),
    I("5.1", "No", "STT", ".tbl th::No", "label", detail=["通し番号。", "Số thứ tự."]),
    I("5.2", "配送スタッフID", "ID nhân viên giao hàng", ".tbl th::配送スタッフID", "label", detail=["DR＋5桁。", "DR + 5 chữ số."]),
    I("5.3", "配送スタッフ名", "Tên nhân viên giao hàng", ".tbl th::配送スタッフ名", "link", "click", detail=["名前。押すと配送スタッフ詳細の「担当配送情報」タブへ。", "Tên. Bấm để mở tab 「担当配送情報」 của chi tiết nhân viên."]),
    I("5.4", "集金合計金額（税込）", "Tổng tiền thu (gồm thuế)", ".tbl th::集金合計金額", "label", detail=["その人が担当した配送の集金額の合計（円）。右寄せ。担当の配送がなければ「—」。", "Tổng tiền thu của các chuyến người đó phụ trách (yên). Căn phải. Không có chuyến phụ trách thì 「—」."]),
    I("5.5", "駐車合計料金（税込）", "Tổng phí đỗ xe (gồm thuế)", ".tbl th::駐車合計料金", "label", detail=["その人が報告した駐車料金の合計（円）。右寄せ。担当の配送がなければ「—」。集金とは別の列。", "Tổng phí đỗ xe người đó báo cáo (yên). Căn phải. Không có chuyến phụ trách thì 「—」. Là cột riêng tách khỏi tiền thu."]),
    I("6", "ページ送り", "Phân trang", ".pager", "area", pattern="P-LIST", detail=["「n件中 a–b件」・ページ番号・表示件数（10／20／50／100）。", "「n件中 a–b件」, số trang, số dòng hiển thị (10／20／50／100)."],
      demo_ok=["コードは「n件中 1-n件」だけでページ送りと表示件数がない（確認メモ H-3）。宿題", "Code chỉ có 「n件中 1-n件」, chưa có phân trang và số dòng hiển thị (確認メモ H-3). Việc còn tồn"]),
]
L2 = [
    I("7", "絞り込み後の表示", "Hiển thị sau khi lọc", ".tbl", "table", pattern="P-LIST",
      detail=["キーワードに合う配送スタッフだけを出し、合計も同じ条件で数える。", "Chỉ hiện nhân viên khớp từ khóa và tổng cũng tính theo cùng điều kiện."], **NOT_FILTERED),
]
L3 = [
    I("8", "担当の配送がないスタッフ", "Nhân viên không có chuyến phụ trách", ".tbl tbody tr", "label",
      detail=["担当の配送がない配送スタッフ（例：ステータスが無効の人）は、集金・駐車の合計とも「—」。0円とは出さない。", "Nhân viên không có chuyến phụ trách (ví dụ trạng thái 無効) thì tổng tiền thu và phí đỗ xe đều là 「—」. Không hiện 0 yên."]),
]
L4 = [
    I("9", "CSV出力のトースト（集金管理）", "Toast xuất CSV (Quản lý thu tiền)", ".toast", "toast", "show", err=["S12"],
      detail=["出力できたら S12「CSVを出力しました（{n}行・{ファイル名}）。」。ファイル名＝画面名＋条件＋日時。0件のときは出力しない。", "Xuất xong hiện S12 「CSVを出力しました（{n}行・{ファイル名}）。」. Tên tệp = tên màn hình + điều kiện + ngày giờ. 0 dòng thì không xuất."]),
]
L5 = [
    I("10", "CSV出力のトースト（支払の明細）", "Toast xuất CSV (chi tiết thanh toán)", ".toast", "toast", "show", err=["S12"],
      detail=["出力できたら S12。ファイル名は「支払の明細」＋月＋日時。", "Xuất xong hiện S12. Tên tệp là 「支払の明細」 + tháng + ngày giờ."]),
]

VIEWS = [
    V("001", "OW_COLL_001", "初期表示（期間 −20日〜+10日・スタッフ別の集金／駐車の合計）", "Hiển thị ban đầu (khoảng −20〜+10 ngày, tổng tiền thu / đỗ xe theo nhân viên)", "/carrier/collect", L1,
      note=["栄成ロジ（DE00001）。デモの今日（2026-10-05）の20日前〜10日後。見本では集金・駐車の実績が0円。", "栄成ロジ (DE00001). Từ 20 ngày trước đến 10 ngày sau 'hôm nay' (2026-10-05). Dữ liệu mẫu thu tiền / đỗ xe đều 0 yên."]),
    V("002", "OW_COLL_001", "絞り込み（スタッフID・名）", "Lọc (ID・tên nhân viên)", "/carrier/collect", L2,
      setup=H + "setv(document.querySelector('input[placeholder=\"配送スタッフID・名\"]'),'山口');await wait(200);" + SUBMIT, wait=500,
      note=["キーワード「山口」で検索した状態。", "Đã tìm bằng từ khóa 「山口」."]),
    V("003", "OW_COLL_001", "担当の配送がないスタッフ（「—」）", "Nhân viên không có chuyến phụ trách (「—」)", "/carrier/collect", L3,
      setup=H + "setv(document.querySelector('input[placeholder=\"配送スタッフID・名\"]'),'西村');await wait(200);" + SUBMIT, wait=500,
      note=["キーワード「西村」で検索した状態（DR00018 西村 陽介：ステータスが無効で担当の配送がない）。", "Đã tìm bằng 「西村」 (DR00018 西村 陽介: trạng thái 無効, không có chuyến phụ trách)."]),
    V("004", "OW_COLL_001", "CSV出力：集金管理（配送ごと）", "Xuất CSV: Quản lý thu tiền (theo chuyến)", "/carrier/collect", L4,
      setup=H + "document.querySelector('.phead .btn.pri').click();await wait(700);", wait=300,
      note=["「CSV出力」を押した直後。", "Ngay sau khi bấm 「CSV出力」."]),
    V("005", "OW_COLL_001", "CSV出力：支払の明細（月）", "Xuất CSV: Chi tiết thanh toán (tháng)", "/carrier/collect", L5,
      setup=H + "[...document.querySelectorAll('.phead .btn')].find(b=>b.textContent.includes('支払の明細')).click();await wait(900);", wait=300,
      note=["「支払の明細（yyyy-mm）」を押した直後。", "Ngay sau khi bấm 「支払の明細（yyyy-mm）」."]),
]
