# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「委託配送先・中継先の検索」（AW_DINQ）。住所から委託先を探す（AW_DINQ_001）と、中継先・送り状から拠点を引く（AW_DINQ_002）。
元は本物の Web（app/ops/delivery/inquiries）。決定は docs/決定台帳.md「運営D 委託配送先・中継先の検索（確認メモ D-3c Q-IQ1〜5）」・受付簿 No.296、
台帳 E「委託配送会社への見積依頼の項目」。仕様は 配送_01 §3-2・§3-3、配送_11 §14.5。
画面名はメニューどおり「委託配送先・中継先の検索」（権限表・仕様の「配送問い合わせ」は別名）。Screen Code は AW_DINQ（AW_INQU＝お問い合わせと取り違えないため。hong 回答 2026-10-07）。
コードとの違い（demo_ok）：料金表・地域加算が都道府県単位、条件の初期値が空、市区町村・郵便番号・温度帯が効く、対応温度帯・近くの中継先、複数社へ見積依頼、
配送回数・食数、入力エラーの書き方、Q02、タブの URL、中継先の検索式（宿題＝コードを直す）。
"""

TITLE = ["委託配送先・中継先の検索（AW_DINQ）※委託配送先マスタ・倉庫マスタへ統合予定（画面は廃止）", "Tìm hãng vận chuyển ủy thác và điểm trung chuyển (AW_DINQ) *dự kiến gộp vào master hãng ủy thác / master kho (bỏ màn hình)"]
SHEET = ["委託配送先・中継先の検索", "Tìm hãng ủy thác・trung chuyển"]
BASENAME = "画面設計書_AW_DINQ_委託配送先・中継先の検索"
IMG_PREFIX = "AW_DINQ"
OUT_DIR = "AW_DINQ_委託配送先・中継先の検索"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、DINQ＝Delivery INQuiry（配送の問い合わせ。AW_INQU＝お問い合わせ（法人Webから）と1文字違いで紛らわしいため、INQR にしない。hong 回答 2026-10-07）", "Quy ước mã màn hình: AW = Admin Web, DINQ = Delivery INQuiry (tra cứu giao hàng; không dùng INQR vì chỉ khác 1 chữ so với AW_INQU = liên hệ từ Web công ty; hong trả lời 2026-10-07)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-07"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/delivery/inquiries", "lib/ops/delivery", "lib/ops/areas/delivery.ts", "lib/domain/carrierFee.ts", "lib/domain/seed"]

_SRC = "hong 回答 2026-10-07（確認メモ_AW_運営D_配送）"
DECISIONS = [
    {"date": "2026-10-08", "target": "AW_DINQ 全体（タイトル・No.1・パンくず・権限）",
     "q": ["この画面の目的と、別の画面が必要か・マスタに統合するか（HTML レビュー I-1）", "Mục đích màn này, có cần màn riêng hay gộp vào master (review HTML I-1)"],
     "a": ["画面は廃止し、委託配送先マスタ（運営H。タブ「検索」「見積依頼」）と中継先（倉庫マスタ）の住所検索に統合する。権限は委託配送管理（フル権限＝CRUD／物流＝CRUD）。この設計書は残し、運営H のマスタの設計書を作るときに内容を移す", "Bỏ màn hình, gộp vào master hãng ủy thác (運営H; tab 「検索」「見積依頼」) và tìm điểm trung chuyển theo địa chỉ ở master kho. Quyền: 委託配送管理 (フル権限 = CRUD / 物流 = CRUD). Giữ tài liệu này, khi làm thiết kế master của 運営H sẽ chuyển nội dung sang"],
     "src": "hong 回答 2026-10-08（HTML レビュー）"},
    {"date": "2026-10-07", "target": "画面名・Screen Code", "q": ["画面名と Screen Code（Q-IQ1）", "Tên màn hình và Screen Code (Q-IQ1)"],
     "a": ["B：画面名はメニューどおり「委託配送先・中継先の検索」（権限表の「配送問い合わせ」は別名）。Screen Code は AW_DINQ（AW_INQR は使わない）", "B: tên màn hình đúng như menu 「委託配送先・中継先の検索」 (「配送問い合わせ」 trong bảng quyền là tên gọi khác). Screen Code là AW_DINQ (không dùng AW_INQR)"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_DINQ_001 No.6.5・6.8・6.9・8", "q": ["料金表のエリアの単位と地域加算の目安の出どころ（Q-IQ2）", "Đơn vị khu vực của bảng giá và nguồn của mức cộng thêm theo vùng (Q-IQ2)"],
     "a": ["B：料金表・地域加算は都道府県単位（配送_01 §3-3 どおり）。地域加算の欄は料金表に持つ。受付簿 No.59（エリア単位）の実装はやり直し。コードの固定値（地域加算・都道府県13件）はやめる", "B: bảng giá và mức cộng thêm theo vùng theo đơn vị tỉnh/thành (đúng 配送_01 §3-3). Cột mức cộng thêm nằm trong bảng giá. Phần đã làm theo khu vực ở 受付簿 No.59 phải làm lại. Bỏ giá trị cố định của code (mức cộng thêm, 13 tỉnh)"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_DINQ_001 No.11", "q": ["見積依頼の項目（台帳 E81 との差。Q-IQ3）", "Các mục của yêu cầu báo giá (khác với E81 của sổ quyết định; Q-IQ3)"],
     "a": ["A：配送回数（月）・1回の食数も必須として残し、台帳 E「委託配送会社への見積依頼の項目」に追記する。取り扱い商品＝温度帯の1欄のまま（資材を含む）", "A: giữ 「配送回数（月）」 và 「1回の食数」 là bắt buộc và bổ sung vào mục E 「委託配送会社への見積依頼の項目」 của sổ quyết định. 「取り扱い商品」 vẫn là 1 ô theo nhiệt độ (gồm cả vật tư)"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_DINQ_001 No.6.1・7・11", "q": ["見積依頼を出す相手は1社ずつか、複数社まとめてか（Q-IQ4）", "Gửi yêu cầu báo giá cho từng hãng hay nhiều hãng cùng lúc (Q-IQ4)"],
     "a": ["A：各行にチェックを置き、「選んだ n社へ見積依頼」で1つの小窓から出す（入力は1回。依頼1件に複数社の見積回答が付く）。行ごとの「見積依頼」ボタンは廃止", "A: mỗi dòng có ô chọn, nút 「選んだ n社へ見積依頼」 gửi từ 1 cửa sổ (nhập 1 lần; 1 yêu cầu có nhiều phản hồi báo giá của nhiều hãng). Bỏ nút 「見積依頼」 ở từng dòng"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_DINQ_001 No.4・AW_DINQ_002 No.4", "q": ["「中継先から拠点を引く」の中継先の選び方・初期値（Q-IQ5）", "Cách chọn điểm trung chuyển và giá trị ban đầu ở tab tra cứu chi nhánh (Q-IQ5)"],
     "a": ["A：中継先は検索式（名称・営業所コード・都道府県・市区町村で絞る）。初期は未選択（キーワード検索が主）。住所タブの初期値は空（千葉県・船橋市の固定をやめる）", "A: điểm trung chuyển chọn theo kiểu tìm kiếm (lọc theo tên, mã văn phòng, tỉnh/thành, quận/huyện). Ban đầu chưa chọn (chủ yếu tìm bằng từ khóa). Giá trị ban đầu của tab địa chỉ để trống (bỏ giá trị cố định 千葉県・船橋市)"], "src": _SRC},
    {"date": "2026-10-07", "target": "AW_DINQ_001 No.4.1〜4.4・6.12〜6.14・8・8.1〜8.4／AW_DINQ_002 No.7・7.10〜7.12", "q": ["条件の効き方・温度帯の初期値・近くの中継先の列・中継先タブが空のときの見せ方・表示件数（確認メモ_AW_運営D_配送 Stage B）", "Cách các điều kiện tác động, giá trị ban đầu của nhiệt độ, cột của điểm trung chuyển gần đây, cách hiển thị khi tab điểm trung chuyển trống, số dòng hiển thị (Stage B)"],
     "a": ["①都道府県は必須。市区町村・郵便番号は「近くの中継先」にだけ効く（委託配送会社の絞り込みは都道府県単位）。条件が空のときは案内文（I190） ②温度帯の初期値は空（指定なし） ③「近くの中継先」の列＝中継先ID・名称・営業所コード・住所・状態 ④中継先タブで未選択・キーワード空のときは案内文を出し、全拠点は出さない ⑤この画面のすべての一覧は表示件数 10／20／50／100（既定10）のページ送り",
           "(1) Tỉnh/thành là bắt buộc. Quận/huyện và mã bưu điện chỉ tác động vào 「近くの中継先」 (lọc hãng ủy thác theo đơn vị tỉnh/thành). Khi điều kiện trống thì hiện câu hướng dẫn (I190). (2) Giá trị ban đầu của nhiệt độ để trống (không chỉ định). (3) Cột của 「近くの中継先」: ID điểm trung chuyển, tên, mã văn phòng, địa chỉ, trạng thái. (4) Tab điểm trung chuyển: khi chưa chọn và từ khóa trống thì hiện câu hướng dẫn, không hiện mọi chi nhánh. (5) Mọi danh sách của màn hình này phân trang với số dòng 10 / 20 / 50 / 100 (mặc định 10)"], "src": "hong 回答 2026-10-07（確認メモ_AW_運営D_配送 Stage B）"},
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_DINQ_001", "ja": "住所から委託先を探す", "vi": "Tìm hãng ủy thác theo địa chỉ"},
    {"code": "AW_DINQ_002", "ja": "中継先・送り状から拠点を引く", "vi": "Tra chi nhánh từ điểm trung chuyển・vận đơn"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
    "const fld=(l)=>[...document.querySelectorAll('.mbox .fld')].find(x=>((x.querySelector('label')||{}).textContent||'').includes(l));"
)


def I(no, ja, vi, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": vi, "sel": sel, "kind": kind, "trig": trig}
    d.update(kw)
    return d


def pick(items, *nos):
    by = {x["no"]: x for x in items}
    return [by[n] for n in nos]


_HEAD = I("1", "ヘッダー", "Đầu trang", ".ph", "area",
          detail=["委託配送先マスタ（タブ：検索・見積依頼）／倉庫マスタ（中継先の住所検索）へ統合予定（hong 2026-10-08）。運営H のマスタの設計書を作るときにこの内容を移す。パンくず（統合後）：委託配送先マスタ ＞ 検索／見積依頼、倉庫マスタ ＞ 中継先の住所検索（現行の画面は 配送管理 ＞ 委託配送先・中継先の検索。配送のメニューから外す）。権限（統合後）は「委託配送管理」（フル権限＝CRUD、物流＝CRUD）。見積依頼は更新の権限がある役割だけ。",
                  "Dự kiến gộp vào 委託配送先マスタ (tab: 検索・見積依頼) / 倉庫マスタ (tìm điểm trung chuyển theo địa chỉ) (hong 2026-10-08). Khi làm thiết kế master của 運営H sẽ chuyển nội dung này sang. Breadcrumb (sau khi gộp): 委託配送先マスタ > 検索/見積依頼, 倉庫マスタ > tìm điểm trung chuyển theo địa chỉ (màn hiện tại: 配送管理 > 委託配送先・中継先の検索; bỏ khỏi menu 配送). Quyền (sau khi gộp) theo 「委託配送管理」 (フル権限 = CRUD; 物流 = CRUD). Chỉ vai trò có quyền cập nhật mới gửi được yêu cầu báo giá."],
          demo_ok=["コードのクラス名・見出しは旧画面の表示（配送問い合わせ）に準ずる。画面名はメニューどおり「委託配送先・中継先の検索」（Q-IQ1）。コードのファイル・コメントの名前を AW_DINQ に揃える", "Tên/tiêu đề trong code theo màn hình cũ (配送問い合わせ). Tên màn hình đúng menu 「委託配送先・中継先の検索」 (Q-IQ1). Thống nhất tên tệp/ghi chú trong code về AW_DINQ"])

R_HEAD = dict(_HEAD,
    detail=[_HEAD["detail"][0].replace("権限（統合後）は「委託配送管理」（フル権限＝CRUD、物流＝CRUD）。見積依頼は更新の権限がある役割だけ。",
                                     "権限（統合後）は「中継先管理」（倉庫マスタ・中継先の住所検索を含む。フル権限＝CRUD、物流＝CRUD、ほかの役割＝R）。"),
            _HEAD["detail"][1].replace("Quyền (sau khi gộp) theo 「委託配送管理」 (フル権限 = CRUD; 物流 = CRUD). Chỉ vai trò có quyền cập nhật mới gửi được yêu cầu báo giá.",
                                     "Quyền (sau khi gộp) theo 「中継先管理」 (gồm master kho và tìm điểm trung chuyển theo địa chỉ; フル権限 = CRUD, 物流 = CRUD, các vai trò khác = R).")])

_TABS = I("2", "タブ", "Tab", ".tabs", "area", pattern="P-TAB",
          detail=["2つのタブ：「住所から委託先を探す（商談中も）」＝AW_DINQ_001／「中継先・送り状から拠点を引く」＝AW_DINQ_002。タブは URL の ?tab=（addr／relay）に持つ。入力中にタブを変えても入力は消さない。",
                  "2 tab: 「住所から委託先を探す（商談中も）」 = AW_DINQ_001 / 「中継先・送り状から拠点を引く」 = AW_DINQ_002. Tab giữ trong URL ?tab= (addr / relay). Đổi tab khi đang nhập thì không mất nội dung đã nhập."],
          demo_ok=["コードはタブを useState で持ち URL に出さない（H18）。?tab= に持つ", "Code giữ tab bằng useState, không đưa vào URL (H18). Cần giữ trong ?tab="])

# ============================================================ AW_DINQ_001 住所から委託先を探す
L_ITEMS = [
    _HEAD,
    _TABS,
    I("2.1", "住所から委託先を探す（商談中も）", "Tìm hãng ủy thác theo địa chỉ (cả đang đàm phán)", ".tabs button::住所から", "tab", "click",
      detail=["営業・運営が、拠点の登録前（商談中）でも住所から委託先を探す。", "Nhân viên kinh doanh/vận hành tìm hãng ủy thác theo địa chỉ, kể cả khi chi nhánh chưa đăng ký (đang đàm phán)."]),
    I("2.2", "中継先・送り状から拠点を引く", "Tra chi nhánh từ điểm trung chuyển・vận đơn", ".tabs button::中継先", "tab", "click",
      detail=["もう1つのタブ（AW_DINQ_002）へ。", "Chuyển sang tab còn lại (AW_DINQ_002)."]),
    I("3", "説明", "Giải thích", ".notice", "label",
      detail=["商談中でも住所から委託先を探す画面であること、都道府県単位の対応エリアに入る委託配送会社・対応曜日・料金・地域加算の目安を出すこと、見積依頼を出せること、自動のおすすめ・全国マップ・曜日の組合せ検索は作らないこと、地域加算は契約後に子契約のオプション（地域配送料）として運営が付けること。",
              "Giải thích: màn hình để tìm hãng ủy thác theo địa chỉ ngay cả khi đang đàm phán; hiển thị hãng có khu vực (theo tỉnh/thành), ngày phục vụ, giá và mức cộng thêm theo vùng làm tham khảo; có thể gửi yêu cầu báo giá; không làm gợi ý tự động, bản đồ toàn quốc, tìm theo tổ hợp thứ; mức cộng thêm theo vùng do 運営 gắn vào hợp đồng con như tùy chọn (phí giao theo vùng) sau khi ký."],
      demo_ok=["コードの説明は「対応エリア（都道府県）」と書くが、料金表と地域加算の実装はエリア単位（関東・中部…）。都道府県単位に直す（Q-IQ2）", "Mô tả của code ghi 「対応エリア（都道府県）」 nhưng bảng giá và mức cộng thêm lại làm theo khu vực (関東, 中部...). Sửa sang đơn vị tỉnh/thành (Q-IQ2)"]),
    I("4", "検索条件", "Điều kiện tìm kiếm", ".fg", "area", pattern="P-LIST",
      detail=["住所（都道府県・市区町村・郵便番号）と温度帯で探す。拠点が未登録でも住所だけで検索できる。「検索」か Enter で反映する。初期値は空（決定 2026-10-07）。「未適用」の印は出さない。",
              "Tìm theo địa chỉ (tỉnh/thành, quận/huyện, mã bưu điện) và nhiệt độ. Chưa đăng ký chi nhánh vẫn tìm được chỉ bằng địa chỉ. Áp dụng khi nhấn 検索 hoặc Enter. Giá trị ban đầu để trống (quyết định 2026-10-07). Không hiện dấu 「未適用」."],
      demo_ok=["コードの初期値は「千葉県・船橋市・冷蔵・常温」（デモの値）。空にする（Q-IQ5）。コードは「未適用」の印を出す。外す", "Giá trị ban đầu của code là 「千葉県・船橋市・冷蔵・常温」 (giá trị demo); đổi thành trống (Q-IQ5). Code hiện dấu 「未適用」; bỏ"]),
    I("4.1", "都道府県", "Tỉnh/thành", "select[aria-label=都道府県]", "select", "select", req="○", len=["選択（47都道府県）", "Chọn (47 tỉnh/thành)"], init=["（空）", "(Trống)"],
      ex=["愛知県", "Một trong 47 tỉnh/thành; ở đây là Aichi"],
      detail=["47都道府県から選ぶ。必須（決定 2026-10-07）。対応エリア（都道府県単位）に入る委託配送会社を探す（委託配送会社の絞り込みは都道府県単位）。空のままのときは結果を出さず、案内文（No.6.14・I190）を出す。", "Chọn trong 47 tỉnh/thành. Bắt buộc (quyết định 2026-10-07). Tìm hãng ủy thác có khu vực phục vụ (theo tỉnh/thành) bao gồm tỉnh này (lọc hãng ủy thác theo đơn vị tỉnh/thành). Khi để trống thì không hiện kết quả mà hiện câu hướng dẫn (No.6.14・I190)."],
      demo_ok=["コードは13県だけ（エリアの対応表の都道府県）で、福山通運（西日本）が大阪府に当たらない。47都道府県から選び、料金表の都道府県で引く（H20）", "Code chỉ có 13 tỉnh (theo bảng khu vực) và 福山通運 (西日本) không khớp 大阪府. Chọn trong 47 tỉnh/thành và tra theo tỉnh/thành của bảng giá (H20)"]),
    I("4.2", "市区町村", "Quận/huyện/thành phố", "input[placeholder^=例：船橋市]", "text", "input", req="－", len="文字列 255", err=["E04", "E13"],
      ex=["名古屋市中区", "Tên thành phố/quận/huyện (ví dụ Naka-ku, Nagoya)"],
      detail=["市区町村の文字（部分一致）。「近くの中継先」（No.8）にだけ効く。委託配送会社の絞り込みには効かない（都道府県単位。決定 2026-10-07）。住所の最大文字数（255）。前後の空白を取る。欄の幅は下限 280px（全角約17字が見える。はみ出す分は欄の中でスクロール）。", "Chữ của quận/huyện/thành phố (khớp một phần). Chỉ tác động vào 「近くの中継先」 (No.8); không lọc hãng ủy thác (theo đơn vị tỉnh/thành; quyết định 2026-10-07). Tối đa 255 ký tự (độ dài địa chỉ). Bỏ khoảng trắng đầu/cuối. Chiều rộng ô tối thiểu 280px (hiển thị khoảng 17 ký tự toàn góc; phần dài hơn cuộn trong ô)."],
      demo_ok=["コードは入力しても結果に効かない（H19）。決定どおり「近くの中継先」の条件として使う", "Code nhập vào cũng không ảnh hưởng kết quả (H19). Dùng làm điều kiện của 「近くの中継先」 đúng quyết định"]),
    I("4.3", "郵便番号", "Mã bưu điện", "input[placeholder^=例：273-0005]", "text", "input", req="－", len="文字列 8", err=["E05"],
      ex=["460-0008", "Mã bưu điện 7 chữ số, có hoặc không có dấu gạch nối"],
      detail=["数字7桁。ハイフンはあってもなくてもよい。保存の形は 123-4567。「近くの中継先」（No.8）にだけ効く（決定 2026-10-07）。", "7 chữ số; có thể có hoặc không có dấu gạch nối. Dạng lưu: 123-4567. Chỉ tác động vào 「近くの中継先」 (No.8) (quyết định 2026-10-07)."],
      valid=["数字7桁でなければ E05（項目の下）。", "Không phải 7 chữ số thì hiện E05 (dưới ô)."],
      demo_ok=["コードは入力しても結果に効かない（H19）。「近くの中継先」の条件として使う", "Code nhập vào cũng không ảnh hưởng kết quả (H19). Dùng làm điều kiện của 「近くの中継先」"]),
    I("4.4", "温度帯", "Nhiệt độ", "select[aria-label=温度帯]", "select", "select", req="－", len=["選択（指定なし／冷凍／冷蔵・常温／資材）", "Chọn (không chỉ định / đông lạnh / lạnh, thường / vật tư)"], init=["（空）＝指定なし", "(Trống) = không chỉ định"],
      ex=["冷凍", "Nhiệt độ cần giao; 3 giá trị đông lạnh / lạnh・thường / vật tư"],
      detail=["対応温度帯は3値：冷凍／冷蔵・常温／資材（常温は冷蔵と同じ枠）。初期値は空（指定なし。決定 2026-10-07）で、指定なしのときは温度帯で絞らない。選んだときは、その温度帯に対応する委託配送会社を探す。", "Nhiệt độ phục vụ có 3 giá trị: đông lạnh / lạnh・thường / vật tư (thường dùng chung khung với lạnh). Giá trị ban đầu để trống (không chỉ định; quyết định 2026-10-07); khi không chỉ định thì không lọc theo nhiệt độ. Khi đã chọn thì tìm hãng ủy thác phục vụ nhiệt độ đó."],
      demo_ok=["コードの初期値は「冷蔵・常温」で、温度帯の結果への反映もしていない（H19）。初期値は空（指定なし）にし、選んだら対応温度帯で絞る", "Giá trị ban đầu của code là 「冷蔵・常温」 và không phản ánh nhiệt độ vào kết quả (H19). Đổi giá trị ban đầu thành trống (không chỉ định) và lọc theo nhiệt độ phục vụ khi đã chọn"]),
    I("4.5", "クリア", "Xóa điều kiện", ".btn::クリア", "button", "click", detail=["条件を初期値（空）に戻して検索する。選んだ委託配送先のチェックも外す。", "Đưa điều kiện về mặc định (trống) và tìm lại. Bỏ cả các ô đã chọn của hãng ủy thác."]),
    I("4.6", "検索", "Tìm kiếm", ".btn.pri::検索", "button", "click", detail=["条件を反映する（Enter でも同じ）。", "Áp dụng điều kiện (Enter cũng vậy)."]),
    I("5", "CSV出力", "Xuất CSV", "button.btn.out::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["検索条件のとおりの全件。列：委託配送先ID・委託配送先名・区分・対応エリア・対応曜日・対応温度帯・支払料金・地域加算の目安（選んだ都道府県）。閲覧できる役割すべてに出す（CSV入出力_定義：配送の問い合わせは出力あり）。",
              "Toàn bộ dòng theo điều kiện tìm kiếm. Cột: 委託配送先ID, 委託配送先名, 区分, 対応エリア, 対応曜日, 対応温度帯, 支払料金, 地域加算の目安 (tỉnh/thành đã chọn). Hiện với mọi vai trò xem được (CSV入出力_定義: 配送の問い合わせ có xuất)."],
      demo_ok=["コードの列は「料金（税抜）」「地域加算の目安」で対応温度帯がない。列を足す", "Cột của code là 「料金（税抜）」 và 「地域加算の目安」, không có nhiệt độ phục vụ; cần thêm cột"]),
    I("6", "結果の表", "Bảng kết quả", ".tbl", "table", pattern="P-LIST", err=["I01"],
      detail=["委託配送会社マスタ（本登録）の「対応エリア（都道府県）」「対応曜日」「対応温度帯」「料金表」から出す（マスタの値をそのまま）。見積依頼の回答は委託配送先Webで受ける。0件は I01。横スクロールを出さない：画面幅 1440px に収め、委託配送先名・対応エリアなど長い値は折り返す。",
              "Lấy từ master hãng vận chuyển ủy thác (đã đăng ký chính thức): 「対応エリア（都道府県）」, 「対応曜日」, 「対応温度帯」, 「料金表」 (đúng giá trị của master). Phản hồi báo giá nhận ở Web hãng ủy thác. 0 dòng hiện I01. Không có thanh cuộn ngang: vừa trong chiều rộng màn hình 1440px, giá trị dài (tên hãng, khu vực phục vụ) thì xuống dòng."],
      demo_ok=["コードは対応エリア（関東・中部…）だけで引き、温度帯・市区町村・郵便番号は使わない（H19）。「この地域に対応する委託配送先はありません」を I01 に揃える（全国の路線会社は常に当たるので見本では撮れない）", "Code chỉ tra theo khu vực (関東, 中部...), không dùng nhiệt độ, quận/huyện, mã bưu điện (H19). Câu 「この地域に対応する委託配送先はありません」 thống nhất về I01 (hãng tuyến toàn quốc luôn khớp nên không chụp được ở dữ liệu mẫu)"]),
    I("6.1", "選択（チェック）", "Chọn (checkbox)", "-", "check", "check", req="－", len=["チェック（複数選択）", "Checkbox (chọn nhiều)"], init=["外れている", "Bỏ chọn"],
      ex=["ON（栄成ロジ）", "Chọn hãng muốn gửi yêu cầu báo giá (có thể chọn nhiều)"],
      cond=["「委託・引き取り」の行だけ。路線の運送会社の行にはチェックを置かない（「運賃表」の文字を出す。見積依頼は出せない）。更新の権限がない役割には出さない。", "Chỉ ở dòng 「委託・引き取り」. Dòng hãng vận chuyển tuyến không có checkbox (hiện chữ 「運賃表」; không gửi được yêu cầu báo giá). Không hiện với vai trò không có quyền cập nhật."],
      detail=["見積依頼を出す委託配送会社を選ぶ。複数社を選べる（見積は依頼1件に複数社の回答が付く：配送_11 14.5）。", "Chọn hãng ủy thác để gửi yêu cầu báo giá. Chọn được nhiều hãng (1 yêu cầu báo giá có nhiều phản hồi của các hãng: 配送_11 14.5)."],
      demo_ok=["コードは行ごとの「見積依頼」ボタンで1社だけ出し、同じ内容を社数ぶん入れ直す。チェックに変える（Q-IQ4）", "Code gửi từng hãng bằng nút 「見積依頼」 ở mỗi dòng và phải nhập lại cùng nội dung theo số hãng. Đổi thành checkbox (Q-IQ4)"]),
    I("6.2", "委託配送先ID", "ID hãng ủy thác", ".tbl th::委託配送先ID", "label", detail=["DE＋5桁。", "DE + 5 chữ số."]),
    I("6.3", "委託配送先名", "Tên hãng ủy thác", ".tbl th::委託配送先名", "label", detail=["会社名。", "Tên công ty."]),
    I("6.4", "区分", "Loại", ".tbl th::区分", "label", detail=["委託・引き取り／路線（中継あり）。", "委託・引き取り (ủy thác, đến lấy hàng) / 路線 (tuyến, có trung chuyển)."]),
    I("6.5", "対応エリア（都道府県）", "Khu vực phục vụ (tỉnh/thành)", ".tbl th::対応エリア", "label",
      detail=["対応できる都道府県（都道府県単位。2026/09/30 変更。旧：関東・中部・関西・九州）。全国の会社は「全国」。", "Các tỉnh/thành phục vụ được (theo đơn vị tỉnh/thành; thay đổi 2026/09/30, trước đây: 関東・中部・関西・九州). Hãng toàn quốc ghi 「全国」."],
      demo_ok=["コードはエリア名（関東・中部…）で出す。都道府県に直す（Q-IQ2）", "Code hiện tên khu vực (関東, 中部...). Đổi sang tỉnh/thành (Q-IQ2)"]),
    I("6.6", "対応曜日", "Ngày phục vụ", ".tbl th::対応曜日", "label", detail=["委託配送先マスタの対応曜日（月〜土など）。配送会社側ではリードタイムを持たないので、対応曜日で確かめる。", "Ngày phục vụ trong master hãng ủy thác (T2–T7...). Phía hãng không có lead time nên xác nhận bằng ngày phục vụ."]),
    I("6.7", "対応温度帯", "Nhiệt độ phục vụ", "-", "label",
      detail=["冷凍／冷蔵・常温／資材（3値）。複数ある会社は並べて出す。", "Đông lạnh / lạnh・thường / vật tư (3 giá trị). Hãng có nhiều giá trị thì hiện liệt kê."],
      demo_ok=["コードの結果に対応温度帯の列がない。足す（H19・配送_01 §3-3）", "Kết quả của code không có cột nhiệt độ phục vụ; cần thêm (H19, 配送_01 §3-3)"]),
    I("6.8", "支払料金（税抜）", "Phí thanh toán (chưa thuế)", ".tbl th::料金", "label",
      detail=["料金表（都道府県 × 支払料金）の、選んだ都道府県の支払料金。ない都道府県は「—」。路線は「運賃表（送り状ごと）」。",
              "Phí thanh toán của tỉnh/thành đã chọn trong bảng giá (tỉnh/thành × phí thanh toán). Tỉnh không có thì 「—」. Hãng tuyến ghi 「運賃表（送り状ごと）」."],
      open=["支払料金の単位（1回あたりか月額か）と、都道府県より細かいエリアで料金を分けるか", "Đơn vị phí thanh toán (mỗi lần giao hay theo tháng) và có chia giá theo khu vực nhỏ hơn tỉnh/thành hay không"], ask="お客様（営業・物流）",
      demo_ok=["コードの料金は会社ごとの1値（「1件 2,000円」）かエリア別の文字（関東:2,000円・中部:…）。都道府県の料金表から出す（Q-IQ2）", "Giá trong code là 1 giá trị theo hãng (「1件 2,000円」) hoặc chữ theo khu vực (関東:2,000円...). Lấy từ bảng giá theo tỉnh/thành (Q-IQ2)"]),
    I("6.9", "地域加算の目安", "Mức cộng thêm theo vùng (tham khảo)", ".tbl th::地域加算", "label",
      detail=["料金表（都道府県 × 地域加算）の、選んだ都道府県の地域加算。運営が委託配送先マスタに手入力した値をそのまま出す（自動計算しない）。ない都道府県は「—」。目安であり、契約後は子契約のオプション（オプションマスタの地域配送料）として運営が付ける。",
              "Mức cộng thêm theo vùng của tỉnh/thành đã chọn trong bảng giá (tỉnh/thành × mức cộng thêm). Hiển thị đúng giá trị 運営 nhập tay vào master hãng ủy thác (không tự tính). Tỉnh không có thì 「—」. Chỉ mang tính tham khảo; sau khi ký hợp đồng thì 運営 gắn vào hợp đồng con như tùy chọn (phí giao theo vùng trong master tùy chọn)."],
      open=["地域加算を子契約へ入れる方法（自動で立てるか、運営が手で入れるか。地域配送料 OP000004 は拠点ごと）", "Cách đưa mức cộng thêm vào hợp đồng con (tự động hay 運営 nhập tay; phí giao theo vùng OP000004 tính theo từng chi nhánh)"], ask="お客様（営業）",
      demo_ok=["コードの地域加算は画面に固定で書かれた値（DE00001 千葉 +500円 など）。委託配送先マスタの料金表に「地域加算」の列を持ち（CSV の列も）、そこから出す。受付簿 No.59（エリア単位）はやり直し（Q-IQ2）", "Mức cộng thêm trong code là giá trị viết cứng trên màn hình (DE00001 千葉 +500円...). Master hãng ủy thác có cột 「地域加算」 trong bảng giá (cả cột CSV) và lấy từ đó. Phần làm theo khu vực ở 受付簿 No.59 phải làm lại (Q-IQ2)"]),
    I("6.10", "運賃表（路線の行）", "Bảng cước (dòng hãng tuyến)", ".tbl td .muted::運賃表", "label",
      detail=["路線の運送会社の行は、チェックの代わりに「運賃表」と出す。見積依頼は出せない（運賃表で確かめる）。", "Dòng hãng vận chuyển tuyến hiện chữ 「運賃表」 thay cho checkbox. Không gửi được yêu cầu báo giá (xác nhận bằng bảng cước)."]),
    I("6.11", "0件の表示", "Hiển thị khi 0 dòng", ".tbl td.empty", "label", err=["I01"],
      detail=["条件に合う委託配送先がないときは表の中に I01。", "Khi không có hãng ủy thác khớp điều kiện thì hiện I01 trong bảng."]),
    I("6.12", "表示件数（結果の表）", "Số dòng hiển thị (bảng kết quả)", "select[aria-label=表示件数]", "select", "select", req="－", len=["選択（10／20／50／100 件／ページ）", "Chọn (10 / 20 / 50 / 100 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"],
      ex=["20件／ページ", "Số dòng mỗi trang: 10 / 20 / 50 / 100 (ví dụ: 20 dòng/trang)"],
      detail=["結果の表の1ページの件数。10／20／50／100から選ぶ（既定10。決定 2026-10-07）。変えると1ページ目に戻る。", "Số dòng mỗi trang của bảng kết quả. Chọn 10 / 20 / 50 / 100 (mặc định 10; quyết định 2026-10-07). Đổi thì quay về trang 1."],
      demo_ok=["コードはページ送りがなく全件を出す。10／20／50／100のページ送りにする", "Code không phân trang, hiện toàn bộ. Đổi thành phân trang 10 / 20 / 50 / 100"]),
    I("6.13", "ページ送り（結果の表）", "Phân trang (bảng kết quả)", ".pager", "area", "click",
      detail=["表の下に「前のページ」「ページ番号」「次のページ」と全件数を出す。検索し直したら1ページ目に戻る。", "Dưới bảng hiện 「前のページ」, số trang, 「次のページ」 và tổng số dòng. Tìm lại thì quay về trang 1."],
      demo_ok=["コードにない。足す", "Code chưa có; cần thêm"]),
    I("6.14", "条件が空のときの案内", "Câu hướng dẫn khi điều kiện trống", ".tbl td.empty", "label", err=["I190"],
      detail=["都道府県を選んでいないときは、結果の表・「近くの中継先」を出さず、案内文 I190（{条件}＝都道府県）を出す（全件は出さない）。", "Khi chưa chọn tỉnh/thành thì không hiện bảng kết quả và 「近くの中継先」 mà hiện câu hướng dẫn I190 ({điều kiện} = tỉnh/thành) (không hiện toàn bộ)."],
      demo_ok=["コードの初期値は千葉県・船橋市で、空の状態がない。空のとき案内文を出す", "Giá trị ban đầu của code là 千葉県・船橋市 nên không có trạng thái trống. Khi trống cần hiện câu hướng dẫn"]),
    I("7", "選んだ n社へ見積依頼", "Gửi yêu cầu báo giá cho n hãng đã chọn", "-", "button", "click", err=["E02", "E32"],
      cond=["更新の権限がある役割だけに出す。1社以上選んだときだけ押せる。0社のときは非活性にして、理由「委託配送先を選択してください。」（E02）をボタンの近くに常時表示する。", "Chỉ hiện với vai trò có quyền cập nhật. Chỉ bấm được khi đã chọn từ 1 hãng. Khi 0 hãng thì vô hiệu hóa và hiện thường trực lý do 「委託配送先を選択してください。」 (E02) gần nút."],
      detail=["押すと見積依頼の小窓（No.11）を開く。ラベルは「選んだ n社へ見積依頼」（n＝チェックした数）。", "Nhấn để mở cửa sổ yêu cầu báo giá (No.11). Nhãn 「選んだ n社へ見積依頼」 (n = số hãng đã chọn)."],
      demo_ok=["コードにない（行ごとのボタン）。足す（Q-IQ4）", "Code chưa có (nút ở từng dòng). Thêm (Q-IQ4)"]),
    I("8", "近くの中継先", "Điểm trung chuyển gần đây", "-", "table", pattern="P-LIST",
      detail=["結果の下に、同じ住所条件（都道府県・市区町村・郵便番号）で近くの中継先を出す（中継先一覧の住所検索と同じ条件。自動判別はしない）。列＝中継先ID・名称・営業所コード・住所・状態（決定 2026-10-07）。0件は I01。",
              "Dưới kết quả, hiển thị điểm trung chuyển gần đây theo cùng điều kiện địa chỉ (tỉnh/thành, quận/huyện, mã bưu điện; cùng điều kiện với tìm kiếm theo địa chỉ ở danh sách điểm trung chuyển; không tự phán định). Cột: ID điểm trung chuyển, tên, mã văn phòng, địa chỉ, trạng thái (quyết định 2026-10-07). 0 dòng hiện I01."],
      demo_ok=["コードにない（H21）", "Code chưa có (H21)"]),
    I("8.1", "中継先ID・名称・営業所コード（列）", "ID・tên・mã văn phòng (cột)", "-", "label", demo_ok=["コードにはまだない列（近くの中継先の表。台帳 F 2026-10-08 I3）", "Chưa có trên code (cột của bảng điểm trung chuyển gần đó; 台帳 F 2026-10-08 I3)"], detail=["中継先ID（HU＋5桁）、名称、営業所コード。", "ID điểm trung chuyển (HU + 5 chữ số), tên, mã văn phòng."]),
    I("8.2", "住所・状態（列）", "Địa chỉ・trạng thái (cột)", "-", "label", demo_ok=["コードにはまだない列（近くの中継先の表。台帳 F 2026-10-08 I3）", "Chưa có trên code (cột của bảng điểm trung chuyển gần đó; 台帳 F 2026-10-08 I3)"], detail=["中継先の住所と、状態（有効など）。", "Địa chỉ của điểm trung chuyển và trạng thái (有効...)."]),
    I("8.3", "表示件数（近くの中継先）", "Số dòng hiển thị (điểm trung chuyển gần đây)", "select[aria-label=表示件数（近くの中継先）]", "select", "select", req="－", len=["選択（10／20／50／100 件／ページ）", "Chọn (10 / 20 / 50 / 100 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"],
      ex=["50件／ページ", "Số dòng mỗi trang: 10 / 20 / 50 / 100 (ví dụ: 50 dòng/trang)"],
      detail=["「近くの中継先」の1ページの件数。10／20／50／100から選ぶ（既定10。結果の表とは別に持つ）。変えると1ページ目に戻る。", "Số dòng mỗi trang của 「近くの中継先」. Chọn 10 / 20 / 50 / 100 (mặc định 10; riêng với bảng kết quả). Đổi thì quay về trang 1."],
      demo_ok=["コードにない（H21）", "Code chưa có (H21)"]),
    I("8.4", "ページ送り（近くの中継先）", "Phân trang (điểm trung chuyển gần đây)", ".pager", "area", "click",
      detail=["表の下に「前のページ」「ページ番号」「次のページ」と全件数を出す。", "Dưới bảng hiện 「前のページ」, số trang, 「次のページ」 và tổng số dòng."],
      demo_ok=["コードにない（H21）", "Code chưa có (H21)"]),
    I("9", "注記", "Ghi chú", ".card p.muted", "label",
      detail=["結果は委託配送先マスタの「対応エリア（都道府県）」「対応曜日」「料金表」から出すこと、見積依頼の回答は委託配送先Webで受けることの注記。", "Chú thích: kết quả lấy từ 「対応エリア（都道府県）」, 「対応曜日」, 「料金表」 của master hãng ủy thác; phản hồi báo giá nhận ở Web hãng ủy thác."]),
    I("10", "完了のトースト", "Toast hoàn tất", ".toast", "toast", "show", err=["S11", "S12"],
      detail=["見積依頼を送ったとき S11（「n件を見積依頼しました。」）。同時に、選んだ会社へ見積依頼のメールと画面通知（M28。メール一覧_配送）を記録する（No.11.18）。CSV出力のとき S12。", "Khi gửi yêu cầu báo giá hiện S11 (「n件を見積依頼しました。」); đồng thời ghi nhận email và thông báo trên màn hình (M28, メール一覧_配送) gửi tới hãng đã chọn (No.11.18). Khi xuất CSV hiện S12."],
      demo_ok=["コードの文言は「{会社名} へ見積依頼を送りました（委託配送先ポータルの見積依頼に届きます・デモ）」。S11 に揃える", "Câu của code là 「{tên công ty} へ見積依頼を送りました（委託配送先ポータルの見積依頼に届きます・デモ）」. Thống nhất về S11"]),
]

# 見積依頼の小窓（AW_DINQ_001 の No.11〜）
_R = "（コードは見出しの「見積依頼：{会社名}（{ID}）」で1社だけ。決定で複数社へ）"
M_ITEMS = [
    I("11", "見積依頼の小窓", "Cửa sổ yêu cầu báo giá", ".ov .mbox", "modal", "show", pattern="P-FORM",
      detail=["選んだ n社（見出しに社名とID を並べる）へ、同じ内容で見積依頼を出す。入力は1回。送った見積依頼は委託配送先Webの見積依頼に届く。依頼に載せる項目は台帳 E「委託配送会社への見積依頼の項目」（配送回数・食数も必須：決定 2026-10-07）。",
              "Gửi yêu cầu báo giá với cùng nội dung cho n hãng đã chọn (tiêu đề liệt kê tên và ID). Chỉ nhập 1 lần. Yêu cầu đã gửi sẽ đến mục yêu cầu báo giá trên Web hãng ủy thác. Các mục trong yêu cầu theo mục E của sổ quyết định 「委託配送会社への見積依頼の項目」 (bắt buộc cả số lần giao và số suất: quyết định 2026-10-07)."],
      demo_ok=["コードの小窓は1社だけ（見出し「見積依頼：栄成ロジ（DE00001）」）。複数社に直す（Q-IQ4）", "Cửa sổ của code chỉ cho 1 hãng (tiêu đề 「見積依頼：栄成ロジ（DE00001）」). Sửa thành nhiều hãng (Q-IQ4)"]),
    I("11.1", "法人名", "Tên công ty", ".mbox .fld::法人名", "text", "input", req="○", len="文字列 60", err=["E01", "E04", "E13"],
      ex=["株式会社サンプル食品", "Tên công ty khách (tối đa 60 ký tự)"],
      detail=["商談先の法人名。", "Tên công ty đang đàm phán."], valid=["必須。60文字まで。", "Bắt buộc. Tối đa 60 ký tự."],
      demo_ok=["コードは最大文字数がなく、エラーはトーストだけ（項目の下に出さない）。60文字・項目の下に E01（H22・H23）", "Code không giới hạn ký tự và lỗi chỉ hiện ở toast (không hiện dưới ô). Cần 60 ký tự và E01 dưới ô (H22, H23)"]),
    I("11.2", "拠点名", "Tên chi nhánh", ".mbox .fld::拠点名", "text", "input", req="－", len="文字列 60", err=["E04", "E13"],
      ex=["横浜支店", "Tên chi nhánh (tối đa 60 ký tự); để trống = đang đàm phán"],
      detail=["空欄なら商談中（都道府県・市区町村）として送る。", "Để trống thì gửi dưới dạng đang đàm phán (tỉnh/thành, quận/huyện)."], valid=["60文字まで。", "Tối đa 60 ký tự."]),
    I("11.3", "配送エリア（都道府県）", "Khu vực giao (tỉnh/thành)", ".mbox .fg .fld:nth-child(3) input:first-child", "select", "select", req="○", len=["選択（47都道府県）", "Chọn (47 tỉnh/thành)"], err=["E02"],
      init=["検索条件の都道府県", "Tỉnh/thành trong điều kiện tìm kiếm"], ex=["愛知県", "Một trong 47 tỉnh/thành"],
      detail=["配送エリアの都道府県。検索条件の都道府県を初期値にする。", "Tỉnh/thành của khu vực giao. Mặc định lấy tỉnh/thành trong điều kiện tìm kiếm."],
      demo_ok=["コードは文字を自由に入れる欄。47都道府県のプルダウンにする（入力の共通基準）", "Code là ô gõ tự do. Đổi thành dropdown 47 tỉnh/thành (chuẩn nhập liệu chung)"]),
    I("11.4", "配送エリア（市区町村）", "Khu vực giao (quận/huyện)", ".mbox .fg .fld:nth-child(3) input:last-child", "text", "input", req="○", len="文字列 255", err=["E01", "E04", "E13"],
      ex=["名古屋市中区", "Quận/huyện/thành phố (tối đa 255 ký tự)"], detail=["配送エリアの市区町村。小窓でも欄の幅は下限 320px（全角約20字が見える）。", "Quận/huyện/thành phố của khu vực giao. Trong cửa sổ, chiều rộng ô tối thiểu 320px (khoảng 20 ký tự toàn góc)."], valid=["必須。255文字まで。", "Bắt buộc. Tối đa 255 ký tự."]),
    I("11.5", "郵便番号", "Mã bưu điện", "-", "text", "input", req="－", len="文字列 8", err=["E05"],
      ex=["460-0008", "Mã bưu điện 7 chữ số, có hoặc không có dấu gạch nối"],
      detail=["住所の郵便番号（配送_01 §3-3：郵便番号は見積依頼の住所に含める）。検索条件の郵便番号を初期値にする。", "Mã bưu điện của địa chỉ (配送_01 §3-3: mã bưu điện nằm trong địa chỉ của yêu cầu báo giá). Mặc định lấy mã bưu điện trong điều kiện tìm kiếm."],
      valid=["数字7桁（ハイフン可）。", "7 chữ số (có thể có gạch nối)."],
      demo_ok=["コードは内部に郵便番号を持つが、入力欄がない（H25）。足す", "Code có giữ mã bưu điện bên trong nhưng không có ô nhập (H25). Cần thêm ô"]),
    I("11.6", "住所（町名・番地）", "Địa chỉ (tên phố・số nhà)", ".mbox .fld::住所", "text", "input", req="－", len="文字列 255", err=["E04", "E13"],
      ex=["栄3-15-33 ○○ビル5F", "Địa chỉ chi tiết (tối đa 255 ký tự)"], detail=["町名・番地・建物。", "Tên phố, số nhà, tòa nhà."], valid=["255文字まで。", "Tối đa 255 ký tự."]),
    I("11.7", "取り扱い商品（温度帯）", "Sản phẩm xử lý (nhiệt độ)", ".mbox .fld::取り扱い商品", "check", "check", req="○", len=["複数選択（冷蔵／冷凍／資材）", "Chọn nhiều (lạnh / đông lạnh / vật tư)"], err=["E02"],
      init=["検索条件の温度帯", "Nhiệt độ trong điều kiện tìm kiếm"], ex=["冷蔵・冷凍", "Chọn các nhiệt độ cần giao (lạnh và đông lạnh)"],
      detail=["取り扱い商品は温度帯の1欄（資材を含む）。1つ以上選ぶ（決定 2026-10-07：「惣菜」などの商品と温度帯を別の欄に分けない）。", "「取り扱い商品」 là 1 ô theo nhiệt độ (gồm cả vật tư). Chọn ít nhất 1 (quyết định 2026-10-07: không tách thành ô sản phẩm 「惣菜」... và ô nhiệt độ)."],
      valid=["1つも選ばなければ E02（項目の下）。", "Không chọn gì thì hiện E02 (dưới ô)."]),
    I("11.8", "土日対応", "Giao thứ 7・chủ nhật", ".mbox .fld::土日対応", "check", "check", req="－", len=["チェック", "Checkbox"], init=["外れている", "Bỏ chọn"],
      ex=["ON", "Chọn nếu cần giao cả thứ 7 và chủ nhật"], detail=["土日の配送が要るときにチェック。", "Chọn khi cần giao thứ 7 và chủ nhật."]),
    I("11.9", "プラン", "Gói", ".mbox .fld::プラン", "text", "input", req="○", len="文字列 60", err=["E01", "E04", "E13"],
      ex=["100プラン ESライト", "Tên gói dự kiến (tối đa 60 ký tự)"], detail=["プラン名（自販機の有無の判断に使う）。", "Tên gói (dùng để phán định có máy bán hàng hay không)."], valid=["必須。60文字まで。", "Bắt buộc. Tối đa 60 ký tự."]),
    I("11.10", "自販機", "Máy bán hàng", ".mbox .fld::自販機", "check", "check", req="－", len=["チェック", "Checkbox"], init=["外れている", "Bỏ chọn"],
      ex=["OFF", "Chọn nếu có máy bán hàng"], detail=["自販機があるときにチェック。", "Chọn khi có máy bán hàng."]),
    I("11.11", "配送回数（月）", "Số lần giao (mỗi tháng)", ".mbox .fg .fld:nth-child(9) input:first-of-type", "text", "input", req="○", len=["整数 1〜8（回）", "Số nguyên 1–8 (lần)"], err=["E01", "E12"],
      init=["2", "2"], ex=["4", "Số lần giao mỗi tháng (1–8)"],
      detail=["月あたりの配送回数。1〜8（配送_01：配送回数は1〜8）。台帳 E に追記（決定 2026-10-07）。委託側が金額を出すために必要（見積回答の画面と同じ形）。", "Số lần giao mỗi tháng. 1–8 (配送_01: số lần giao là 1–8). Bổ sung vào mục E của sổ quyết định (quyết định 2026-10-07). Cần để hãng ủy thác tính giá (cùng dạng với màn hình phản hồi báo giá)."],
      valid=["必須。1〜8の整数。外れたら E12（項目の下）。", "Bắt buộc. Số nguyên 1–8. Ngoài khoảng thì E12 (dưới ô)."],
      demo_ok=["コードの文言は「配送回数は1〜8回です」。E12 に揃える（H22）", "Câu của code là 「配送回数は1〜8回です」. Thống nhất về E12 (H22)"]),
    I("11.12", "1回の食数", "Số suất mỗi lần giao", ".mbox .fg .fld:nth-child(9) input:last-of-type", "text", "input", req="○", len=["整数 1〜9,999（食）", "Số nguyên 1–9.999 (suất)"], err=["E01", "E12"],
      init=["25", "25"], ex=["30", "Số suất mỗi lần giao (1–9.999)"],
      detail=["1回の配送の食数。1〜9,999（食数の共通基準）。台帳 E に追記（決定 2026-10-07）。", "Số suất mỗi lần giao. 1–9.999 (chuẩn chung về số suất). Bổ sung vào mục E của sổ quyết định (quyết định 2026-10-07)."],
      valid=["必須。1〜9,999の整数。外れたら E12。", "Bắt buộc. Số nguyên 1–9.999. Ngoài khoảng thì E12."],
      demo_ok=["コードは上限がない（H23）。9,999にする", "Code không có giới hạn trên (H23). Đặt 9.999"]),
    I("11.13", "希望の曜日（複数）", "Thứ mong muốn (nhiều)", ".mbox .fld::希望の曜日", "check", "check", req="－", len=["複数選択（月〜日）", "Chọn nhiều (T2–CN)"], init=["すべて外れている", "Bỏ chọn tất cả"],
      ex=["火・木", "Chọn các thứ mong muốn (ví dụ thứ 3 và thứ 5)"], detail=["希望の曜日を複数選べる。", "Chọn được nhiều thứ mong muốn."]),
    I("11.14", "金額条件", "Điều kiện giá", ".mbox .fld::金額条件", "text", "input", req="－", len="文字列 60", err=["E04", "E13"],
      ex=["1件 3,000円以内", "Điều kiện giá (tối đa 60 ký tự), ví dụ trong vòng 3.000 yên mỗi lần giao"], detail=["金額の条件を文字で書く。", "Ghi điều kiện giá bằng chữ."], valid=["60文字まで。", "Tối đa 60 ký tự."]),
    I("11.15", "保有車両", "Xe sở hữu", ".mbox .fld::保有車両", "label",
      detail=["委託配送会社のプロフィールにある保有車両を、見るだけで出す（依頼ごとには入れない）。選んだ会社が複数のときは会社ごとに並べる。プロフィールにない会社は「—（プロフィールに未登録）」。", "Hiển thị chỉ xem xe sở hữu trong hồ sơ của hãng ủy thác (không nhập theo từng yêu cầu). Chọn nhiều hãng thì liệt kê theo hãng. Hãng chưa có trong hồ sơ ghi 「—（プロフィールに未登録）」."]),
    I("11.16", "複数拠点まとめて", "Nhiều chi nhánh gộp", ".mbox textarea", "textarea", "input", req="－", len=["文字列 500（複数行）", "Chuỗi tối đa 500 (nhiều dòng)"], err=["E04", "E13"],
      ex=["横浜支店／神奈川県横浜市西区みなとみらい1-1", "Mỗi dòng 「tên chi nhánh／địa chỉ」 (tối đa 500 ký tự)"], detail=["ほかの拠点もまとめて聞くとき、1行に「拠点名／住所」。", "Khi hỏi gộp cả các chi nhánh khác, mỗi dòng 「tên chi nhánh／địa chỉ」."], valid=["500文字まで。", "Tối đa 500 ký tự."]),
    I("11.17", "キャンセル", "Hủy", ".mbox-f button::キャンセル", "button", "click", err=["Q02"],
      detail=["閉じる。入力済みのときは、Esc・×・キャンセル・背景のクリックのどれでも Q02（キャンセル／破棄）を出す（台帳 F）。", "Đóng cửa sổ. Khi đã nhập thì Esc, ×, キャンセル, hoặc bấm nền đều hiện Q02 (キャンセル／破棄) (sổ quyết định F)."],
      demo_ok=["コードは入力があってもすぐ閉じる（H24）", "Code đóng ngay dù đã nhập (H24)"]),
    I("11.18", "見積依頼を送る", "Gửi yêu cầu báo giá", ".mbox-f button::見積依頼を送る", "button", "click", err=["E01", "E02", "E12", "E30", "E31", "E32", "S11"],
      detail=["全項目をまとめてチェックし、エラーは項目の下に出す。成功したら選んだ会社の数だけ見積依頼を作り（1依頼・会社ごとの回答欄）、各社へ見積依頼の通知 M28（メール＋画面。メール一覧_配送。記録のみ）を出し、小窓を閉じて S11。押したら無効にする（二重送信を防ぐ）。路線の運送会社には出せない。",
              "Kiểm tra mọi mục cùng lúc, lỗi hiện dưới từng ô. Thành công thì tạo yêu cầu báo giá cho số hãng đã chọn (1 yêu cầu, mỗi hãng 1 ô phản hồi), gửi thông báo yêu cầu báo giá M28 (email + màn hình; メール一覧_配送; chỉ ghi nhận) tới từng hãng, đóng cửa sổ và hiện S11. Khóa nút sau khi nhấn (chống gửi 2 lần). Không gửi được cho hãng vận chuyển tuyến."],
      open=["見積の回答期限・有効期限と、一次回答→再回答を残すか（配送_11 L165）。コードは回答期限を「今日の5日後」に固定している", "Hạn trả lời / hiệu lực của báo giá và có giữ quy trình trả lời lần đầu → trả lời lại không (配送_11 L165). Code đặt cứng hạn trả lời là 「5 ngày sau hôm nay」"], ask="お客様（物流）",
      demo_ok=["コードはエラーをトーストだけで出し（項目の下に出さない）、文言も独自（logic.ts）。E01・E02・E12 に揃える（H22）", "Code chỉ hiện lỗi ở toast (không dưới ô) và dùng câu riêng (logic.ts). Thống nhất về E01, E02, E12 (H22)"]),
]

# ============================================================ AW_DINQ_002 中継先・送り状から拠点を引く
R_ITEMS = [
    R_HEAD,
    _TABS,
    I("2.1", "住所から委託先を探す（商談中も）", "Tìm hãng ủy thác theo địa chỉ (cả đang đàm phán)", ".tabs button::住所から", "tab", "click", detail=["もう1つのタブ（AW_DINQ_001）へ。", "Chuyển sang tab còn lại (AW_DINQ_001)."]),
    I("2.2", "中継先・送り状から拠点を引く", "Tra chi nhánh từ điểm trung chuyển・vận đơn", ".tabs button::中継先", "tab", "click",
      detail=["中継先（ヤマトの営業所など）・運送会社・委託配送先から「この荷物はどこの拠点のものか」と連絡があったときに、拠点と直近の配送を引く。", "Dùng khi điểm trung chuyển (văn phòng Yamato...), hãng vận chuyển hoặc hãng ủy thác liên hệ hỏi 「kiện hàng này của chi nhánh nào」: tra ra chi nhánh và lần giao gần nhất."]),
    I("3", "説明", "Giải thích", ".notice", "label",
      detail=["中継先・送り状番号・配送No から利用している拠点と直近の配送を引く画面であること、営業所の閉鎖を自動で知る手段はないので届いた連絡をここで引くこと。",
              "Giải thích: màn hình tra chi nhánh đang dùng và lần giao gần nhất từ điểm trung chuyển, số vận đơn, số giao hàng; không có cách tự động biết văn phòng đóng cửa nên tra tại đây khi nhận liên hệ."]),
    I("4", "検索条件", "Điều kiện tìm kiếm", ".fg", "area", pattern="P-LIST",
      detail=["中継先、または 送り状番号・配送No・拠点名 で探す。「検索」か Enter で反映。初期は中継先が未選択（キーワード検索が主。決定 2026-10-07）。「未適用」の印は出さない。",
              "Tìm theo điểm trung chuyển, hoặc theo số vận đơn・số giao hàng・tên chi nhánh. Áp dụng khi nhấn 検索 hoặc Enter. Ban đầu chưa chọn điểm trung chuyển (chủ yếu tìm bằng từ khóa; quyết định 2026-10-07). Không hiện dấu 「未適用」."],
      demo_ok=["コードの初期値は中継先 HU00124 を固定で選び、その中継先の拠点を出す。未選択にする（Q-IQ5）。「未適用」の印を外す", "Giá trị ban đầu của code chọn cứng điểm trung chuyển HU00124 và hiện chi nhánh của điểm đó. Đổi thành chưa chọn (Q-IQ5). Bỏ dấu 「未適用」"]),
    I("4.1", "中継先", "Điểm trung chuyển", "#dlq-hu", "select", "select", req="－", len=["選択（検索式。約300件）", "Chọn (kiểu tìm kiếm; khoảng 300 điểm)"], init=["（未選択）", "(Chưa chọn)"],
      ex=["ヤマト 品川営業所 HU00124", "Điểm trung chuyển, ví dụ văn phòng Yamato Shinagawa (ID HU00124)"],
      detail=["約300件の中継先から、名称・営業所コード・都道府県・市区町村で絞って選ぶ（プルダウンではなく検索式。配送_01 §3-2）。選ぶと、その中継先を使っている拠点を出す。キーワードを入れたときは使わず、すべての中継先から探す。",
              "Chọn trong khoảng 300 điểm trung chuyển bằng cách lọc theo tên, mã văn phòng, tỉnh/thành, quận/huyện (kiểu tìm kiếm thay vì dropdown; 配送_01 §3-2). Chọn xong hiện các chi nhánh đang dùng điểm đó. Khi đã nhập từ khóa thì không dùng, tìm trong mọi điểm trung chuyển."],
      demo_ok=["コードは全中継先のプルダウン（#dlq-hu）。検索式の入力に変える（Q-IQ5）", "Code là dropdown của mọi điểm trung chuyển (#dlq-hu). Đổi thành ô nhập kiểu tìm kiếm (Q-IQ5)"]),
    I("4.2", "送り状番号・配送No・拠点名で探す", "Tìm theo số vận đơn・số giao hàng・tên chi nhánh", "#dlq-q", "text", "input", req="－", len="文字列 60", err=["E04", "E13"],
      ex=["3512-0928-0021", "Số vận đơn (có hoặc không có gạch nối), số giao hàng DL-… hoặc tên chi nhánh"],
      detail=["送り状番号（ハイフンの有無は問わない）・配送No・拠点名・拠点ID の部分一致。入れると中継先の絞り込みは使わず、すべての中継先から探し、結果に「中継先」の列を足す。",
              "Khớp một phần với số vận đơn (có hoặc không có gạch nối), số giao hàng, tên chi nhánh, ID chi nhánh. Khi nhập thì không dùng lọc điểm trung chuyển mà tìm trong mọi điểm, kết quả thêm cột 「中継先」."]),
    I("4.3", "検索", "Tìm kiếm", ".btn.pri::検索", "button", "click", detail=["条件を反映する（Enter でも同じ）。", "Áp dụng điều kiện (Enter cũng vậy)."]),
    I("4.4", "クリア", "Xóa điều kiện", ".btn::クリア", "button", "click", detail=["条件を初期値（未選択・空）に戻して検索する。", "Đưa điều kiện về mặc định (chưa chọn, trống) và tìm lại."],
      demo_ok=["コードのクリアは中継先を HU00124 に戻す。未選択に戻す（Q-IQ5）", "Nút xóa của code đưa điểm trung chuyển về HU00124. Phải đưa về chưa chọn (Q-IQ5)"]),
    I("5", "中継先の情報", "Thông tin điểm trung chuyển", ".kvgrid", "area",
      cond=["中継先を選んだ（キーワードなしの）ときだけ。", "Chỉ khi đã chọn điểm trung chuyển (không có từ khóa)."],
      detail=["選んだ中継先の ID・名称、住所、この中継先を使う拠点の数（n拠点）、状態（有効など）。営業所が閉鎖されたと分かったとき、影響する拠点をすぐ確かめる。",
              "ID và tên điểm trung chuyển đã chọn, địa chỉ, số chi nhánh đang dùng điểm này (n chi nhánh), trạng thái (有効...). Khi biết văn phòng đã đóng cửa thì xác nhận ngay các chi nhánh bị ảnh hưởng."]),
    I("6", "CSV出力", "Xuất CSV", "button.btn.out::CSV出力", "button", "click", pattern="P-CSV-OUT", err=["S12"],
      detail=["検索条件のとおりの全件。列：拠点ID・拠点名・住所・配送方法・2次の配送会社・直近の配送・送り状番号・納品日・状態・拠点の連絡先・中継先・中継先名。閲覧できる役割すべてに出す。",
              "Toàn bộ dòng theo điều kiện tìm kiếm. Cột: 拠点ID, 拠点名, 住所, 配送方法, 2次の配送会社, 直近の配送, 送り状番号, 納品日, 状態, 拠点の連絡先, 中継先, 中継先名. Hiện với mọi vai trò xem được."]),
    I("7", "結果の表", "Bảng kết quả", ".tbl", "table", pattern="P-LIST", err=["I01", "I137", "I190"],
      detail=["中継先を使っている拠点と、その直近の配送（今日までの最後。なければ次の配送）。中継先の閉鎖・移転のときは、ここで出た拠点の配送ルートを拠点ごとに直す。0件は：中継先を選んだとき I01、キーワードのとき I137。横スクロールを出さない：画面幅 1440px に収め、拠点名・住所・連絡先など長い値は折り返す。中継先が未選択でキーワードも空のときは表を出さず、案内文 I190（{条件}＝中継先かキーワード）を出す（全拠点は出さない。決定 2026-10-07）。",
              "Các chi nhánh đang dùng điểm trung chuyển và lần giao gần nhất (lần cuối tính đến hôm nay; nếu chưa có thì lần giao tiếp theo). Khi điểm trung chuyển đóng cửa/chuyển địa điểm thì sửa tuyến giao của từng chi nhánh trong danh sách này. 0 dòng: chọn điểm trung chuyển thì I01, tìm từ khóa thì I137. Không có thanh cuộn ngang: vừa trong chiều rộng màn hình 1440px, giá trị dài (tên, địa chỉ, liên hệ) thì xuống dòng. Chưa chọn điểm trung chuyển và từ khóa trống thì không hiện bảng mà hiện câu hướng dẫn I190 (không hiện mọi chi nhánh; quyết định 2026-10-07)."],
      demo_ok=["コードの0件の文言「見つかりませんでした。番号の桁・ハイフンを確かめてください」「この中継先を使っている拠点はありません」を I137・I01 に揃える。未選択・キーワード空の案内文 I190 を足す（全拠点は出さない）", "Câu 0 dòng của code (「見つかりませんでした。番号の桁・ハイフンを確かめてください」, 「この中継先を使っている拠点はありません」) thống nhất về I137, I01. Thêm câu hướng dẫn I190 khi chưa chọn và từ khóa trống (không hiện mọi chi nhánh)"]),
    I("7.1", "拠点ID", "ID chi nhánh", ".tbl th::拠点ID", "link", "click", detail=["CU＋5桁。押すと拠点詳細へ。", "CU + 5 chữ số. Nhấn mở chi tiết chi nhánh."],
      demo_ok=["コードは文字だけ。拠点詳細へのリンクにする", "Code chỉ hiện chữ; đổi thành link tới chi tiết chi nhánh"]),
    I("7.2", "拠点名・住所", "Tên chi nhánh・địa chỉ", ".tbl th::拠点名", "label", detail=["拠点名と、その下に住所。", "Tên chi nhánh và địa chỉ bên dưới."]),
    I("7.3", "配送方法", "Phương thức giao", ".tbl th::配送方法", "label", detail=["配送方法と、その下に「2次：{配送会社}」（中継先から納品先までを運ぶ会社）。", "Phương thức giao và bên dưới 「2次：{hãng vận chuyển}」 (hãng chở từ điểm trung chuyển đến nơi nhận)."]),
    I("7.4", "直近の配送・送り状番号", "Lần giao gần nhất・số vận đơn", ".tbl th::直近の配送", "link", "click",
      detail=["配送No（押すと出荷・配送管理の配送データ詳細へ）と、その下に送り状番号（なければ「送り状はまだありません」）。", "Số giao hàng (nhấn mở chi tiết dữ liệu giao hàng của 出荷・配送管理) và bên dưới là số vận đơn (chưa có thì 「送り状はまだありません」)."]),
    I("7.5", "納品日", "Ngày giao", ".tbl th::納品日", "label", detail=["yyyy-mm-dd。", "yyyy-mm-dd."],
      demo_ok=["コードは MM/DD などの短い形で出す。yyyy-mm-dd に揃える（台帳 M 日付の書き方）", "Code hiện dạng ngắn như MM/DD; sửa thành yyyy-mm-dd (sổ quyết định M: cách viết ngày)"]),
    I("7.6", "状態", "Trạng thái", ".tbl th::状態", "label", detail=["その配送の状態（出荷待・出荷済・納品済など）。", "Trạng thái của lần giao đó (出荷待, 出荷済, 納品済...)."]),
    I("7.7", "拠点の連絡先", "Liên hệ của chi nhánh", ".tbl th::拠点の連絡先", "label", detail=["拠点のメイン担当者の連絡先。", "Thông tin liên hệ của người phụ trách chính của chi nhánh."]),
    I("7.8", "中継先（列）", "Điểm trung chuyển (cột)", ".tbl th::中継先", "label", cond=["キーワードで探したときだけ出す列。", "Cột chỉ hiện khi tìm bằng từ khóa."], detail=["中継先IDと名称。", "ID và tên điểm trung chuyển."]),
    I("7.9", "0件の表示", "Hiển thị khi 0 dòng", ".tbl td.empty", "label", err=["I01", "I137"],
      detail=["中継先を選んだのに拠点がないとき I01（この中継先を使っている拠点はない）。キーワードで見つからないとき I137。", "Chọn điểm trung chuyển mà không có chi nhánh thì I01 (không có chi nhánh dùng điểm này). Tìm từ khóa không thấy thì I137."]),
    I("7.10", "表示件数（拠点の表）", "Số dòng hiển thị (bảng chi nhánh)", "select[aria-label=表示件数]", "select", "select", req="－", len=["選択（10／20／50／100 件／ページ）", "Chọn (10 / 20 / 50 / 100 dòng/trang)"], init=["10件／ページ", "10 dòng/trang"],
      ex=["20件／ページ", "Số dòng mỗi trang: 10 / 20 / 50 / 100 (ví dụ: 20 dòng/trang)"],
      detail=["結果の表の1ページの件数。10／20／50／100から選ぶ（既定10。決定 2026-10-07）。変えると1ページ目に戻る。", "Số dòng mỗi trang của bảng kết quả. Chọn 10 / 20 / 50 / 100 (mặc định 10; quyết định 2026-10-07). Đổi thì quay về trang 1."],
      demo_ok=["コードはページ送りがなく全件を出す。10／20／50／100のページ送りにする", "Code không phân trang, hiện toàn bộ. Đổi thành phân trang 10 / 20 / 50 / 100"]),
    I("7.11", "ページ送り（拠点の表）", "Phân trang (bảng chi nhánh)", ".pager", "area", "click",
      detail=["表の下に「前のページ」「ページ番号」「次のページ」と全件数を出す。検索し直したら1ページ目に戻る。", "Dưới bảng hiện 「前のページ」, số trang, 「次のページ」 và tổng số dòng. Tìm lại thì quay về trang 1."],
      demo_ok=["コードにない。足す", "Code chưa có; cần thêm"]),
    I("7.12", "条件が空のときの案内", "Câu hướng dẫn khi điều kiện trống", ".tbl td.empty", "label", err=["I190"],
      detail=["中継先が未選択でキーワードも空のときは、結果の表を出さず案内文 I190 を出す（全拠点は出さない）。", "Khi chưa chọn điểm trung chuyển và từ khóa trống thì không hiện bảng kết quả mà hiện câu hướng dẫn I190 (không hiện mọi chi nhánh)."],
      demo_ok=["コードは中継先 HU00124 を固定で選んだ状態で、空の状態がない。案内文を出す", "Code chọn cứng điểm trung chuyển HU00124 nên không có trạng thái trống. Cần hiện câu hướng dẫn"]),
    I("8", "注記", "Ghi chú", ".card p.muted", "label",
      detail=["拠点の配送ルート（子契約）の「中継先」から引き、配送データの送り状番号でも探せること、中継先の閉鎖・移転のときは出た拠点の配送ルートを拠点ごとに直すことの注記。",
              "Chú thích: tra từ 「中継先」 trong tuyến giao (hợp đồng con) của chi nhánh và cũng tìm được theo số vận đơn của dữ liệu giao hàng; khi điểm trung chuyển đóng cửa/chuyển thì sửa tuyến giao của từng chi nhánh."]),
]


_PJ = "委託配送先マスタ（タブ：検索・見積依頼）／倉庫マスタ（中継先の住所検索）へ統合予定（hong 2026-10-08）。運営H のマスタの設計書を作るときにこの内容を移す。"
_PV = "Dự kiến gộp vào 委託配送先マスタ (tab: 検索・見積依頼) / 倉庫マスタ (tìm điểm trung chuyển theo địa chỉ) (hong 2026-10-08). Khi làm thiết kế master của 運営H sẽ chuyển nội dung này sang. "


def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500):
    return {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": [_PJ + (note or ["", ""])[0], _PV + (note or ["", ""])[1]], "items": items}


_SEARCH_BTN = "[...document.querySelectorAll('.btn.pri')].find(b=>(b.textContent||'').includes('検索'))"
_OPEN_MODAL = "const ob=btn('見積依頼');if(ob){ob.click();await sleep(600);}"
_TAB2 = "const tb=[...document.querySelectorAll('.tabs button')][1];if(tb){tb.click();await sleep(700);}"

VIEWS = [
    V("001", "AW_DINQ_001", "初期表示（条件は空）", "Ban đầu (điều kiện trống)", "/ops/delivery/inquiries",
      [dict(x, sel="-") if x["no"] == "10" else x for x in L_ITEMS if x["no"] not in ("6.11", "6.12", "6.13", "8.3", "8.4")],
      note=["決定（hong 2026-10-07）：住所タブの初期値は空（温度帯も空＝指定なし）・都道府県は必須で空なら案内文 I190・料金表と地域加算は都道府県単位・行にチェックを置き複数社へ見積依頼・対応温度帯と近くの中継先を足す。コードは未対応（宿題。いまのコードの初期値は千葉県・船橋市・冷蔵・常温）。",
            "Quyết định (hong 2026-10-07): giá trị ban đầu của tab địa chỉ để trống (cả nhiệt độ = không chỉ định); tỉnh/thành bắt buộc, trống thì hiện câu hướng dẫn I190; bảng giá và mức cộng thêm theo tỉnh/thành; có checkbox ở dòng để gửi báo giá cho nhiều hãng; thêm nhiệt độ phục vụ và điểm trung chuyển gần đây. Code chưa làm (việc phải sửa; giá trị ban đầu hiện tại của code là 千葉県・船橋市・冷蔵・常温)."]),
    V("002", "AW_DINQ_001", "条件を変えて検索（愛知県）", "Đổi điều kiện rồi tìm (tỉnh Aichi)", "/ops/delivery/inquiries",
      pick(L_ITEMS, "4.1", "4.6", "5", "6", "6.5", "6.8", "6.9", "6.12", "6.13"),
      setup="setsel(document.querySelector('select[aria-label=都道府県]'),'愛知県');await sleep(200);const sb=" + _SEARCH_BTN + ";if(sb){sb.click();await sleep(500);}",
      note=["都道府県を選んで検索。地域加算の目安は選んだ都道府県の値。", "Chọn tỉnh/thành rồi tìm. Mức cộng thêm theo vùng là giá trị của tỉnh/thành đã chọn."]),
    V("003", "AW_DINQ_001", "見積依頼の小窓", "Cửa sổ yêu cầu báo giá", "/ops/delivery/inquiries", M_ITEMS,
      setup=_OPEN_MODAL,
      note=["決定は「選んだ n社へ見積依頼」（複数社を1つの小窓で）。コードは行ごとのボタンで1社だけ開く（宿題）。小窓の外のクリック・Esc・×・キャンセルは、入力済みなら Q02。", "Quyết định là 「選んだ n社へ見積依頼」 (nhiều hãng trong 1 cửa sổ). Code mở cửa sổ cho 1 hãng bằng nút ở từng dòng (việc phải sửa). Bấm ngoài cửa sổ, Esc, ×, キャンセル khi đã nhập thì hiện Q02."]),
    V("004", "AW_DINQ_001", "見積依頼 入力エラー", "Yêu cầu báo giá: lỗi nhập", "/ops/delivery/inquiries",
      pick(M_ITEMS, "11.1", "11.4", "11.7", "11.9", "11.11", "11.12", "11.18"),
      setup=_OPEN_MODAL + "const sb=btn('見積依頼を送る',document.querySelector('.mbox'));if(sb){sb.click();await sleep(500);}",
      note=["空のまま「見積依頼を送る」。決定は項目の下に E01 など。コードはトーストだけ（宿題）。", "Bấm 「見積依頼を送る」 khi để trống. Quyết định là hiện E01... dưới từng ô. Code chỉ hiện toast (việc phải sửa)."]),
    V("005", "AW_DINQ_001", "見積依頼を送った", "Đã gửi yêu cầu báo giá", "/ops/delivery/inquiries", [dict(x, sel="-") for x in pick(M_ITEMS, "11.18")] + pick(L_ITEMS, "10"),
      setup=_OPEN_MODAL + "const q=(l)=>{const f=fld(l);return f&&f.querySelector('input');};setv(q('法人名'),'株式会社サンプル食品');setv(q('プラン'),'100プラン ESライト');"
            "const sb=btn('見積依頼を送る',document.querySelector('.mbox'));if(sb){sb.click();await sleep(800);}",
      note=["必須を入れて送った。小窓が閉じてトースト S11。この状態を撮ると見本データに見積依頼が1件増える。", "Đã nhập các mục bắt buộc rồi gửi. Cửa sổ đóng và hiện toast S11. Chụp trạng thái này sẽ làm dữ liệu mẫu tăng thêm 1 yêu cầu báo giá."]),
    V("006", "AW_DINQ_002", "初期表示（中継先は未選択）", "Ban đầu (chưa chọn điểm trung chuyển)", "/ops/delivery/inquiries",
      [x for x in R_ITEMS if x["no"] not in ("7.8", "7.9", "7.10", "7.11")], setup=_TAB2,
      note=["決定（hong 2026-10-07）：中継先は検索式・初期は未選択。コードは全中継先のプルダウンで HU00124 を選んだ状態（宿題）。いまの見本データで HU00124 を使う拠点は0件。タブは URL（?tab=relay）に持つ（宿題）。", "Quyết định (hong 2026-10-07): điểm trung chuyển chọn kiểu tìm kiếm, ban đầu chưa chọn. Code là dropdown mọi điểm với HU00124 được chọn sẵn (việc phải sửa). Với dữ liệu mẫu hiện tại, HU00124 không có chi nhánh nào. Tab giữ trong URL (?tab=relay) (việc phải sửa)."]),
    V("007", "AW_DINQ_002", "キーワード検索（結果に「中継先」の列）", "Tìm bằng từ khóa (kết quả có cột 「中継先」)", "/ops/delivery/inquiries",
      pick(R_ITEMS, "4.2", "4.3", "7", "7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.10", "7.11"),
      setup=_TAB2 + "setv(document.querySelector('#dlq-q'),'川崎');const sb=" + _SEARCH_BTN + ";if(sb){sb.click();await sleep(500);}",
      note=["拠点名の一部で検索。中継先の絞り込みは使わず、結果に中継先の列が付く。", "Tìm theo một phần tên chi nhánh. Không dùng lọc điểm trung chuyển và kết quả có thêm cột điểm trung chuyển."]),
    V("008", "AW_DINQ_002", "見つかりません", "Không tìm thấy", "/ops/delivery/inquiries", pick(R_ITEMS, "4.2", "4.3", "7", "7.9"),
      setup=_TAB2 + "setv(document.querySelector('#dlq-q'),'ZZZ-9999');const sb=" + _SEARCH_BTN + ";if(sb){sb.click();await sleep(500);}",
      note=["該当のない番号で検索。表の中に I137。", "Tìm bằng số không khớp. Bảng hiện I137."]),
]
