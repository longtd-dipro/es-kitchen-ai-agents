# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web「レビュー・ご意見」（AW_REVI）。閲覧・検索・CSV出力だけ（hong 2026-09-28）。
元は本物の Web（app/ops/reviews）。決定は docs/決定台帳.md「レビュー・ご意見（運営Web）の決まり」「レビューの評価タグの変更」「運営Web のメニューの組」。
洗い出し：docs/05_画面設計書/確認メモ_AW_お客様対応_レビュー・お知らせ・お問い合わせ.md
"""

TITLE = ["レビュー・ご意見（AW_REVI）", "Đánh giá và ý kiến (AW_REVI)"]
SHEET = ["レビュー・ご意見", "Đánh giá và ý kiến"]
BASENAME = "画面設計書_AW_REVI_レビュー・ご意見"
IMG_PREFIX = "AW_REVI"
OUT_DIR = "AW_REVI_レビュー・ご意見"
CODE_NOTE = ["画面コード規約：AW＝Admin Web、REVI＝レビュー（hong 2026-10-05 C1）", "Quy ước mã màn hình: AW = Admin Web, REVI = Review (hong 2026-10-05 C1)"]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-05"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}

DECISIONS = [
    {"date": "2026-10-05", "target": "AW_REVI 全体", "q": ["ID の形（レビュー・ユーザー・注文番号）と CSV の形", "Dạng ID và CSV"],
     "a": ["レビューIDは持たない（1回の注文に1回の投稿。一覧・詳細・CSV・検索・URL は注文番号 OD＋7桁で特定）・ユーザー U＋8桁。CSV は 1行＝1商品、メールアドレスは出さない", "Không có レビューID (1 đơn = 1 bài; 一覧・詳細・CSV・検索・URL dùng 注文番号 OD+7). ユーザー U+8. CSV 1 dòng = 1 sản phẩm, không có email"], "src": "hong 回答 2026/10/05（R1・R2）、hong の HTML 指摘 2026/10/05 夕（レビューIDなし）"},
    {"date": "2026-10-05", "target": "AW_REVI_001 No.1.13・3", "q": ["一覧の列と並べ替え", "Cột của 一覧 và sắp xếp"],
     "a": ["法人・拠点は別々の列。並べ替えは一覧の全列（項目＋昇順／降順）。「未適用」の印は出さない", "法人・拠点 tách 2 cột. Sắp xếp theo mọi cột (cột + tăng/giảm). Không hiện dấu 未適用"], "src": "hong の HTML 指摘 2026/10/05 夕、受付簿 #127・#135"},
    {"date": "2026-10-05", "target": "AW_REVI_002 No.2", "q": ["詳細のリンク先", "Đích của các link ở chi tiết"],
     "a": ["法人→法人詳細、拠点→拠点詳細、商品ID→商品マスタ詳細、ユーザーID→アカウント一覧（ユーザー）。注文番号は文字", "法人→法人詳細, 拠点→拠点詳細, 商品ID→商品マスタ詳細, ユーザーID→アカウント一覧; 注文番号 là chữ"], "src": "hong 回答 2026/10/05（R3＝A）"},
    {"date": "2026-10-05", "target": "AW_REVI_001 No.5", "q": ["1ページの件数", "Số dòng / trang"], "a": ["10件（10／20／50／100）", "10 (10/20/50/100)"], "src": "hong 回答 2026/10/05（R4）"},
    {"date": "2026-10-05", "target": "AW_REVI 全体", "q": ["評価タグを運営で直せるようにするか", "Có màn sửa 評価タグ không"], "a": ["作らない（固定。変えるときは開発がデータを直す）", "Không (cố định; dev sửa dữ liệu)"], "src": "hong 回答 2026/10/05（R5＝B）"},
    {"date": "2026-10-05", "target": "パンくず", "q": ["メニューの組の名前", "Tên nhóm menu"], "a": ["お知らせ・ご意見", "Nhóm「お知らせ・ご意見」(thông báo và ý kiến)"], "src": "hong 回答 2026/10/05（C4＝A）"},
]
CHANGES = []
HIDE_ALWAYS = [".demo-note"]
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_REVI_001", "ja": "レビュー一覧", "vi": "Danh sách đánh giá"},
    {"code": "AW_REVI_002", "ja": "レビュー詳細", "vi": "Chi tiết đánh giá"},
]

H = (
    "const sleep=(ms)=>new Promise(r=>setTimeout(r,ms));"
    "const setv=(el,v)=>{if(!el)return;const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
    "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
    "const setsel=(el,v)=>{if(!el)return;Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value').set.call(el,v);el.dispatchEvent(new Event('change',{bubbles:true}));};"
    "const btn=(t,root)=>[...(root||document).querySelectorAll('button')].find(b=>(b.textContent||'').trim().includes(t));"
)

L_SEARCH = [
    {"no": "1", "ja": "検索条件", "vi": "Điều kiện tìm kiếm", "sel": ".es-search", "kind": "area", "trig": "view", "pattern": "P-LIST",
     "detail": ["「検索」か Enter で反映。条件が2行以上に折り返すときだけ開閉のボタンを出す。詳細から戻ると条件・並び・ページを戻す。", "Áp dụng khi nhấn 検索 hoặc Enter. Chỉ hiện nút đóng/mở khi điều kiện xuống ≥2 dòng. Từ chi tiết quay lại thì khôi phục điều kiện, thứ tự, trang."]},
    {"no": "1.1", "ja": "キーワード（商品）", "vi": "Từ khóa (sản phẩm)", "sel": ".es-search__fields input[placeholder^=注文番号]", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60",
     "ex": ["OD0058000", "注文番号, 商品名 hoặc 商品ID (khớp một phần)"], "detail": ["注文番号・商品名・商品ID の部分一致。", "Khớp một phần với 注文番号, 商品名, 商品ID."]},
    {"no": "1.2", "ja": "評価", "vi": "Đánh giá", "sel": ".es-search__fields select::★2以下", "kind": "select", "trig": "select", "req": "－", "len": ["選択（★1〜★5／★2以下）", "Chọn (★1〜★5 / ★2 trở xuống)"], "init": ["（すべて）", "(Tất cả)"],
     "ex": ["★2以下", "★n = có sản phẩm được n sao; ★2以下 = đánh giá thấp nhất ≤2"],
     "detail": ["★n＝その★の商品を含む投稿。★2以下＝最低評価が★2以下の投稿。", "★n = bài có sản phẩm n sao. ★2以下 = bài có đánh giá thấp nhất ≤ 2."]},
    {"no": "1.3", "ja": "投稿日（から）", "vi": "Ngày đăng (từ)", "sel": "input[aria-label=\"投稿日（から）\"]", "kind": "date", "trig": "input", "req": "－", "len": "日付", "ex": ["2026-09-01", "Ngày đăng từ"]},
    {"no": "1.4", "ja": "投稿日（まで）", "vi": "Ngày đăng (đến)", "sel": "input[aria-label=\"投稿日（まで）\"]", "kind": "date", "trig": "input", "req": "－", "len": "日付", "ex": ["2026-09-30", "Ngày đăng đến"]},
    {"no": "1.5", "ja": "法人", "vi": "Công ty", "sel": ".es-search__fields select::法人", "kind": "select", "trig": "select", "req": "－", "len": "選択", "init": ["（すべて）", "(Tất cả)"], "ex": ["株式会社サンプル", "Chỉ 法人 có người dùng đã đăng bài. Đổi thì 拠点 về (すべて)"]},
    {"no": "1.6", "ja": "拠点", "vi": "Chi nhánh", "sel": ".es-search__fields select::拠点", "kind": "select", "trig": "select", "req": "－", "len": "選択", "init": ["（すべて）", "(Tất cả)"], "ex": ["大阪支店", "Chỉ 拠点 của 法人 đã chọn"]},
    {"no": "1.7", "ja": "評価タグ", "vi": "Thẻ đánh giá", "sel": ".es-search__fields select::評価タグ", "kind": "select", "trig": "select", "req": "－", "len": ["選択（不満 6／満足 6）", "Chọn (6 thẻ không hài lòng / 6 thẻ hài lòng)"], "init": ["（すべて）", "(Tất cả)"],
     "ex": ["味が合わない", "Thẻ cố định: ★1〜2 = 不満タグ, ★3〜5 = 満足タグ (không có master)"],
     "detail": ["グループ「不満（★1〜2）」「満足（★3〜5）」。タグは固定（運営の画面では直さない：hong 2026-10-05）。", "Nhóm 不満 (★1〜2) và 満足 (★3〜5). Thẻ cố định (không có màn sửa: hong 2026-10-05)."]},
    {"no": "1.8", "ja": "ユーザー", "vi": "Người dùng", "sel": "input[placeholder^=ユーザーID]", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60", "ex": ["やまちゃん", "ユーザーID hoặc ニックネーム; chưa đặt tên thì tìm bằng「匿名ユーザー」"]},
    {"no": "1.9", "ja": "コメントのキーワード", "vi": "Từ khóa trong bình luận", "sel": "input[placeholder^=コメントのキーワード]", "kind": "text", "trig": "input", "req": "－", "len": "文字列 60", "ex": ["量", "Khớp một phần trong コメント"]},
    {"no": "1.10", "ja": "コメント有無", "vi": "Có bình luận", "sel": ".es-search__fields select::コメント有無", "kind": "select", "trig": "select", "req": "－", "len": ["選択（あり／なし）", "Chọn (có / không)"], "init": ["（すべて）", "(Tất cả)"], "ex": ["コメントあり", "Lọc bài có / không có コメント"]},
    {"no": "1.11", "ja": "クリア", "vi": "Xóa điều kiện", "sel": ".es-search__main button::クリア", "kind": "button", "trig": "click", "detail": ["条件と並べ替えを初期に戻し、一覧も戻す。", "Đưa điều kiện và sắp xếp về ban đầu, danh sách cũng về ban đầu."]},
    {"no": "1.12", "ja": "検索", "vi": "Tìm kiếm", "sel": ".es-search__main button[type=submit]", "kind": "button", "trig": "click", "detail": ["条件を反映し、1ページ目へ。", "Áp dụng và về trang 1."]},
    {"no": "1.13", "ja": "並べ替え（項目）", "vi": "Sắp xếp (cột)", "sel": "select[aria-label=並べ替えの項目]", "kind": "select", "trig": "select", "req": "－", "len": ["選択（注文番号／投稿日時／投稿者／法人／拠点／品数／最低評価／コメント＝一覧の全列）", "Chọn (số đơn / ngày đăng / người đăng / công ty / chi nhánh / số món / đánh giá thấp nhất / bình luận = mọi cột)"], "init": ["投稿日時", "Ngày giờ đăng"],
     "ex": ["法人", "Chọn cột là sắp xếp ngay, giữ điều kiện đang có"],
     "detail": ["選ぶとすぐ並び替える（条件はそのまま）。同じ値なら投稿日時の新しい順。見出しの右に「並べ替え：項目（昇順／降順）」を出す。", "Chọn là sắp xếp ngay (giữ điều kiện). Cùng giá trị thì 投稿日時 mới trước. Bên phải tiêu đề hiện \"並べ替え：cột（昇順／降順）\"."]},
    {"no": "1.14", "ja": "昇順／降順", "vi": "Tăng / giảm", "sel": ".es-sortbtn", "kind": "button", "trig": "click", "init": ["降順", "Giảm dần"], "detail": ["押すたびに昇順↔降順。初期は投稿日時の降順（新しい順）。", "Mỗi lần nhấn đổi tăng↔giảm. Ban đầu 投稿日時 giảm dần (mới nhất trước)."]},
]
L_HEAD = [
    {"no": "2", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".es-pagehead", "kind": "area", "trig": "view",
     "detail": ["パンくず：お知らせ・ご意見 ＞ レビュー・ご意見。", "Breadcrumb: お知らせ・ご意見 > レビュー・ご意見."],
     "demo_ok": ["コードのパンくずは「レビュー・ご意見 / レビュー・ご意見」。組の名前「お知らせ・ご意見」に直す（hong 2026-10-05）", "Code ghi \"レビュー・ご意見 / レビュー・ご意見\"; sửa thành tên nhóm お知らせ・ご意見 (hong 2026-10-05)"]},
    {"no": "2.1", "ja": "CSV出力", "vi": "Xuất CSV", "sel": ".es-pagehead__actions button::CSV出力", "kind": "button", "trig": "click", "pattern": "P-CSV-OUT",
     "cond": ["ユーザーエンゲージメントの CSV出力 の権限（R 以上）", "Quyền CSV出力 (từ R)"],
     "detail": ["検索条件のとおりの全件。1行＝1商品（レビューの項目をくり返す）。列：注文番号・投稿日時・ユーザーID・ニックネーム・退会・法人ID・法人・拠点ID・拠点・商品ID・商品名・評価・評価タグ・コメント。メールアドレスは出さない。", "Toàn bộ theo điều kiện. 1 dòng = 1 sản phẩm (lặp cột review). Cột: 注文番号, 投稿日時, ユーザーID, ニックネーム, 退会, 法人ID, 法人, 拠点ID, 拠点, 商品ID, 商品名, 評価, 評価タグ, コメント. Không có email."]},
]
L_TABLE = [
    {"no": "3", "ja": "一覧の表", "vi": "Bảng", "sel": ".rv-table", "kind": "table", "trig": "view", "pattern": "P-LIST",
     "detail": ["1行＝1回の投稿（1回の注文に1回）。行を押すと詳細へ。初期の並びは投稿日時の降順。1ページ 10件（10／20／50／100）。見出しの右に件数と並べ替え。", "1 dòng = 1 lần đăng (1 đơn 1 bài). Nhấn dòng mở chi tiết. Ban đầu sắp theo 投稿日時 giảm dần. 10 dòng/trang (10/20/50/100). Bên phải tiêu đề hiện số dòng và cách sắp xếp."]},
    {"no": "3.1", "ja": "注文番号", "vi": "Số đơn hàng", "sel": ".rv-table th::注文番号", "kind": "link", "trig": "click", "detail": ["OD＋7桁（アプリの注文）。レビューIDは持たないので、この番号で投稿を特定する。押すと詳細（AW_REVI_002）。", "OD + 7 số (đơn trên app). Không có レビューID nên dùng số này. Nhấn mở chi tiết (AW_REVI_002)."]},
    {"no": "3.2", "ja": "投稿日時", "vi": "Ngày giờ đăng", "sel": ".rv-table th::投稿日時", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd と時刻（2行）。", "yyyy-mm-dd và giờ (2 dòng)."]},
    {"no": "3.3", "ja": "投稿者", "vi": "Người đăng", "sel": ".rv-table th::投稿者", "kind": "label", "trig": "view",
     "detail": ["ニックネーム（未設定は「匿名ユーザー」）＋ユーザーID（U＋8桁）＋退会していれば「退会済」バッジ。メールアドレスは出さない。", "ニックネーム (chưa đặt = 匿名ユーザー) + ユーザーID (U+8) + badge 退会済 nếu đã rút. Không hiện email."]},
    {"no": "3.4", "ja": "法人", "vi": "Công ty", "sel": ".rv-table th::法人", "kind": "label", "trig": "view", "detail": ["投稿した利用者の拠点の法人名。", "Tên công ty của chi nhánh người đăng."]},
    {"no": "3.5", "ja": "拠点", "vi": "Chi nhánh", "sel": ".rv-table th::拠点", "kind": "label", "trig": "view", "detail": ["投稿した利用者の拠点名。", "Tên chi nhánh của người đăng."]},
    {"no": "3.6", "ja": "品数", "vi": "Số món", "sel": ".rv-table th::品数", "kind": "label", "trig": "view", "detail": ["評価した商品の数。右寄せ。", "Số sản phẩm được đánh giá. Căn phải."]},
    {"no": "3.7", "ja": "商品と評価・評価タグ", "vi": "Sản phẩm, sao, thẻ", "sel": ".rv-table th::商品と評価", "kind": "label", "trig": "view",
     "detail": ["★の低い順に先頭2品（商品名・★・タグ）。3品以上は「他N品を表示」で開く。★2以下の品数を赤いバッジで常に出す。", "2 món sao thấp nhất (tên, ★, thẻ). ≥3 món thì \"他N品を表示\" để mở. Luôn hiện badge đỏ số món ★2以下."]},
    {"no": "3.8", "ja": "他N品を表示", "vi": "Hiện N món còn lại", "sel": ".rv-more", "kind": "button", "trig": "click", "cond": ["3品以上の投稿", "Bài có ≥3 món"], "detail": ["その行の商品を全部出す／閉じる（行の詳細へは移らない）。", "Mở/đóng toàn bộ món của dòng (không mở chi tiết)."]},
    {"no": "3.9", "ja": "★2以下の品数", "vi": "Số món ★2 trở xuống", "sel": ".es-badge--negative", "kind": "label", "trig": "show", "cond": ["★2以下の商品があるとき", "Khi có món ★2 trở xuống"]},
    {"no": "3.10", "ja": "コメント", "vi": "Bình luận", "sel": ".rv-table th::コメント", "kind": "label", "trig": "view", "detail": ["投稿全体に1つ。なければ「—」。", "1 bình luận cho cả bài. Không có thì \"—\"."]},
    {"no": "3.11", "ja": "0件の表示", "vi": "Hiển thị 0 dòng", "sel": ".rv-empty", "kind": "label", "trig": "show", "err": ["I01"],
     "demo_ok": ["コードの文言「条件に一致するレビューはありません」を I01 に揃える", "Câu chữ code khác I01; đồng nhất về I01"]},
    {"no": "4", "ja": "ページ送り", "vi": "Phân trang", "sel": ".es-pagination", "kind": "area", "trig": "view", "detail": ["「n件中 a–b件」・前へ・番号・次へ・表示件数（10／20／50／100）。", "\"n件中 a–b件\", trước, số trang, sau, số dòng/trang (10/20/50/100)."]},
]
D_ITEMS = [
    {"no": "1", "ja": "ヘッダー", "vi": "Đầu trang", "sel": ".es-pagehead", "kind": "area", "trig": "view",
     "detail": ["パンくず：お知らせ・ご意見 ＞ レビュー一覧 ＞ レビュー詳細。タイトルに注文番号。", "Breadcrumb: お知らせ・ご意見 > レビュー一覧 > レビュー詳細. Tiêu đề có 注文番号."],
     "demo_ok": ["パンくずの先頭を組の名前「お知らせ・ご意見」に直す", "Sửa phần đầu breadcrumb thành tên nhóm お知らせ・ご意見"]},
    {"no": "1.1", "ja": "一覧へ戻る", "vi": "Về danh sách", "sel": ".es-pagehead__actions button::一覧へ戻る", "kind": "button", "trig": "click", "detail": ["一覧へ（検索条件・ページを戻す）。", "Về danh sách (khôi phục điều kiện, trang)."]},
    {"no": "2", "ja": "投稿情報", "vi": "Thông tin bài đăng", "sel": ".es-card", "kind": "area", "trig": "view", "detail": ["読むだけ。", "Chỉ xem."]},
    {"no": "2.1", "ja": "注文番号", "vi": "Số đơn hàng", "sel": ".es-field::注文番号", "kind": "label", "trig": "view", "detail": ["OD＋7桁（アプリの注文）。文字だけ（リンクしない）。レビューIDは持たない。", "OD+7 (đơn trên app). Chỉ là chữ (không link). Không có レビューID."]},
    {"no": "2.2", "ja": "投稿日時", "vi": "Ngày giờ đăng", "sel": ".es-field::投稿日時", "kind": "label", "trig": "view", "detail": ["yyyy-mm-dd HH:MM。", "yyyy-mm-dd HH:MM."]},
    {"no": "2.3", "ja": "評価した商品数", "vi": "Số món đánh giá", "sel": ".es-field::評価した商品数", "kind": "label", "trig": "view"},
    {"no": "2.4", "ja": "ユーザーID", "vi": "ID người dùng", "sel": ".es-field::ユーザーID", "kind": "link", "trig": "click",
     "detail": ["U＋8桁。押すとアカウント一覧（ユーザーのタブ・その人で絞る）。", "U+8. Nhấn mở アカウント一覧 (tab ユーザー, lọc người đó)."],
     "demo_ok": ["コードは見た目だけのリンク。アカウント一覧へ飛ぶようにする（hong 2026-10-05 R3）", "Code là link giả; sửa để mở アカウント一覧 (hong 2026-10-05 R3)"]},
    {"no": "2.5", "ja": "ニックネーム", "vi": "Biệt danh", "sel": ".es-field::ニックネーム", "kind": "label", "trig": "view", "detail": ["未設定は「匿名ユーザー」。退会したユーザーは「退会済」バッジ（投稿は残す）。", "Chưa đặt = 匿名ユーザー. Đã rút = badge 退会済 (bài vẫn giữ)."]},
    {"no": "2.6", "ja": "法人", "vi": "Công ty", "sel": ".es-field::法人", "kind": "link", "trig": "click", "detail": ["法人ID＋法人名。押すと法人詳細。", "ID + tên. Nhấn mở 法人詳細."],
     "demo_ok": ["コードは見た目だけのリンク。法人詳細へ（hong 2026-10-05 R3）", "Code là link giả; mở 法人詳細 (hong 2026-10-05 R3)"]},
    {"no": "2.7", "ja": "拠点", "vi": "Chi nhánh", "sel": ".es-field::拠点", "kind": "link", "trig": "click", "detail": ["拠点ID＋拠点名。押すと拠点詳細。", "ID + tên. Nhấn mở 拠点詳細."],
     "demo_ok": ["コードは見た目だけのリンク。拠点詳細へ（hong 2026-10-05 R3）", "Code là link giả; mở 拠点詳細 (hong 2026-10-05 R3)"]},
    {"no": "2.8", "ja": "最低評価", "vi": "Đánh giá thấp nhất", "sel": ".es-field::最低評価", "kind": "label", "trig": "view", "detail": ["この投稿の中でいちばん低い★。", "Số sao thấp nhất trong bài."]},
    {"no": "3", "ja": "評価した商品", "vi": "Sản phẩm đã đánh giá", "sel": ".rv-table", "kind": "table", "trig": "view",
     "detail": ["列：No・商品（写真）・商品ID・商品名・評価（★と数字）・評価タグ。投稿の並びのまま。", "Cột: No, ảnh, 商品ID, 商品名, 評価 (★ + số), 評価タグ. Giữ thứ tự bài đăng."]},
    {"no": "3.1", "ja": "商品ID", "vi": "ID sản phẩm", "sel": ".rv-table th::商品ID", "kind": "link", "trig": "click", "detail": ["押すと商品マスタ詳細。", "Nhấn mở 商品マスタ詳細."],
     "demo_ok": ["コードは見た目だけのリンク。商品マスタ詳細へ（hong 2026-10-05 R3）", "Code là link giả; mở 商品マスタ詳細 (hong 2026-10-05 R3)"]},
    {"no": "4", "ja": "コメント（ご意見・ご要望）", "vi": "Bình luận", "sel": ".es-field.full", "kind": "label", "trig": "view", "detail": ["投稿全体のコメント。なければ「（コメントなし）」。", "Bình luận của cả bài. Không có thì \"（コメントなし）\"."]},
]

def V(id, code, ja, vi, url, items, setup="", note=None, full=True, wait=500):
    return {"id": id, "code": code, "state": [ja, vi], "url": url, "setup": (H + setup) if setup else "", "full": full, "wait": wait, "note": note or ["", ""], "items": items}

VIEWS = [
    V("001", "AW_REVI_001", "初期表示", "Hiển thị ban đầu", "/ops/reviews", L_SEARCH + L_HEAD + L_TABLE[:11] + [L_TABLE[12]],
      note=["投稿日時の降順。並べ替えは見出しの右に表示。法人・拠点は別々の列。", "Sắp theo 投稿日時 giảm dần. Cách sắp xếp hiện bên phải tiêu đề. 法人・拠点 là 2 cột riêng."]),
    V("002", "AW_REVI_001", "0件", "0 dòng", "/ops/reviews", [L_SEARCH[1], L_SEARCH[12], L_TABLE[11]],
      setup="setv(document.querySelector('.es-search__fields input[placeholder^=注文番号]'),'該当なし');document.querySelector('.es-search__main button[type=submit]').click();await sleep(600);"),
    V("003", "AW_REVI_001", "並べ替えを変えた（法人・昇順）", "Đổi sắp xếp (法人, tăng dần)", "/ops/reviews", [L_SEARCH[13], L_SEARCH[14], L_TABLE[0]],
      setup="const cb=btn('クリア');if(cb){cb.click();await sleep(600);}setsel(document.querySelector('select[aria-label=並べ替えの項目]'),'co');await sleep(400);document.querySelector('.es-sortbtn').click();await sleep(600);",
      note=["項目を選ぶとすぐ並び替え、ボタンで昇順↔降順。", "Chọn cột là sắp xếp ngay; nút đổi tăng↔giảm."]),
    V("004", "AW_REVI_001", "「他N品を表示」を開いた", "Đã mở \"他N品を表示\"", "/ops/reviews", [L_TABLE[7], L_TABLE[8], L_TABLE[9]],
      setup="const cb=btn('クリア');if(cb){cb.click();await sleep(600);}const b=document.querySelector('.rv-more');if(b){b.click();await sleep(500);}"),
    V("005", "AW_REVI_001", "★2以下で絞り込み", "Lọc ★2 trở xuống", "/ops/reviews", [L_SEARCH[2], L_SEARCH[12], L_TABLE[9]],
      setup="const cb=btn('クリア');if(cb){cb.click();await sleep(600);}setsel([...document.querySelectorAll('.es-search__fields select')].find(s=>[...s.options].some(o=>o.textContent==='★2以下')),'low');await sleep(300);document.querySelector('.es-search__main button[type=submit]').click();await sleep(600);"),
    V("006", "AW_REVI_002", "詳細 初期表示", "Chi tiết: ban đầu", "/ops/reviews/OD0058000", D_ITEMS,
      note=["コメントあり。ニックネーム未設定（匿名ユーザー）。URL は注文番号。", "Có コメント. Chưa đặt ニックネーム (匿名ユーザー). URL là 注文番号."]),
    V("007", "AW_REVI_002", "詳細 コメントなし・退会済", "Chi tiết: không bình luận, đã rút", "/ops/reviews/OD0057937", [D_ITEMS[7], D_ITEMS[13]],
      note=["ニックネームの横に「退会済」。コメントは「（コメントなし）」。", "Cạnh ニックネーム có 退会済. Bình luận hiện「（コメントなし）」."]),
]
