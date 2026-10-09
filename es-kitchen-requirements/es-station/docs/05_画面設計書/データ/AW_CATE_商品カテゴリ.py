# -*- coding: utf-8 -*-
"""
画面設計書のデータ：運営管理者Web ＞ マスタ管理 ＞ 商品カテゴリ管理（一覧・登録／編集（ダイアログ）・CSV取込）
元：本物の Web（このリポジトリ app/ops/masters/categories、lib/ops/menu/logic.ts の catErrors・placeCat、lib/ops/areas/menu.ts の saveCat・deleteCat、lib/csv/master.ts の categories、
    lib/domain/seed/products.ts の PRODUCT_CATEGORIES）、決定台帳 F・K・N、docs/01_仕様/45_メニュー・商品/メニュー・商品マスタ.md（8-15・U1）、運営Web_権限表_20261003、確認メモ_AW_PROD_商品マスタ.md
状態：確認メモ Q-H5・Q-H7 の hong 回答（2026-10-06・受付簿 #233・#236）を反映済み。ブラウザでの撮影（--capture）はまだしていない（sel はコードの aria-label・クラスから書いた。撮影で見つからないものを直す）。
番号は画面ごとに通し。商品マスタ（AW_PROD）と同じ「マスタ管理」の機能で、権限も同じ（商品マスタ管理）。
"""

TITLE = ["商品カテゴリ管理（AW_CATE）", ""]
SHEET = ["商品カテゴリ管理", ""]
BASENAME = "画面設計書_AW_CATE_商品カテゴリ"
IMG_PREFIX = "AW_CATE"
OUT_DIR = "AW_CATE_商品カテゴリ"
CODE_NOTE = ["画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、CATE＝商品カテゴリ管理（Feature は Claude 案・hong の確認待ち）", ""]
SITE = "ops"
SYSTEM = {"ja": "運営管理者Web", "vi": ""}
AUTHOR = "Claude（cloud）／確認：hong"
CREATED = "2026-10-06"
DEMO_FILE = "http://localhost:3000"
LOGIN = {"site": "ops", "loginId": "Ad00010"}
CODE_PATHS = ["app/ops/masters/categories", "app/ops/menu/_components", "app/ops/_ui/OpsShell.tsx", "lib/ops/menu", "lib/ops/areas/menu.ts", "lib/csv", "lib/domain/seed/products.ts"]


def _p(x):
    return x if isinstance(x, (list, tuple)) else [x, ""]


_PAIRS = ("detail", "init", "cond", "valid", "ex", "demo_ok", "chk", "open", "len")


def F(no, ja, sel, kind, trig="view", **kw):
    d = {"no": no, "ja": ja, "vi": "", "sel": sel, "kind": kind, "trig": trig}
    for k, v in kw.items():
        d[k] = _p(v) if k in _PAIRS else v
    return d


def D(date, target, q, a, src):
    return {"date": date, "target": target, "q": [q, ""], "a": [a, ""], "src": src}


DECISIONS = [
    D("2026-10-05", "権限", "だれが作成・編集・削除・CSV取込できるか",
      "商品マスタ管理が CRUD の役割（フル権限・商品開発・システム管理）。ほかの役割（経理・営業・CS・商品管理・物流）は R（閲覧・CSV出力）。新規登録・編集・削除・CSV取込のボタンは CRUD の役割だけに出す",
      "運営Web_権限表_20261003「商品マスタ管理」（商品マスタ・商品カテゴリ管理）・台帳 E「運営の権限の読み方」"),
    D("2026-10-05", "初期データ", "カテゴリの初期データ", "7つ：肉・魚・惣菜（上段）／主食・汁物・「サラダ・果物」・「飲料・甘味」（下段）。最終の名前は「サラダ・果物」「飲料・甘味」に決まった（客先確認・hong 回答。名前はマスタで運営が変えられる）", "台帳 F「商品カテゴリーの初期データ」・受付簿 #69・#257"),
    D("2026-10-05", "コース", "カテゴリにコースを持たせるか", "持たせない。お客様に見える商品は商品ごとのコースで決まり、見せる商品がないカテゴリは自動で出ない", "台帳 F「カテゴリーとコース」"),
    D("2026-10-05", "項目", "カテゴリのマスタが持つ項目", "名前・ID・表示順・画像・登録商品数（+ 備考）。取込でマスタにないカテゴリはエラー", "商品マスタ 8-15"),
    D("2026-10-06", "商品との関係（Q-H5）", "カテゴリ名を変えたとき、商品はどうなるか", "商品はカテゴリを ID で持つ。名前を変えても商品は外れず、登録商品数も変わらない（名前を変えたときの警告・商品の書き換えは要らない）", "hong 回答 2026-10-06（確認メモ Q-H5＝B）・台帳 F・受付簿 #233"),
    D("2026-10-06", "カテゴリ画像（Q-H7）", "画像の形式と縮小", "PNG・JPEG・WebP（5MB・1枚）。縮小せずに保存し、長い辺 1200px 以内に制限する（商品写真と同じ）", "hong 回答 2026-10-06（確認メモ Q-H7＝C）・受付簿 #236"),
    D("2026-10-05", "画面コード", "画面コード", "AW_CATE_001〜003（一覧・登録／編集・CSV取込）", "画面コード規約_20261005（Feature の CATE は Claude 案・確認メモ R-H2）"),
    D("2026-10-06", "カテゴリ画像・削除（受付簿 #274）", "カテゴリ画像は必須か。削除できる条件は", "画像は必須（法人Web・アプリの表示に使うため）。CSV の新規行も画像が要る（画面で先に上げた画像を使う）。削除は登録商品が0件のカテゴリだけ。削除済の商品が持つカテゴリはそのまま残す", "hong 回答 2026-10-06（レビュー A13・A14）・受付簿 #274・台帳 F"),
]
CHANGES = []

HIDE_ALWAYS = []
STATIC_CSS = ""
VIEWER_CSS = ""

SCREENS = [
    {"code": "AW_CATE_001", "ja": "商品カテゴリ一覧", "vi": ""},
    {"code": "AW_CATE_002", "ja": "商品カテゴリ登録・編集", "vi": ""},
    {"code": "AW_CATE_003", "ja": "商品カテゴリ CSV取込", "vi": ""},
]

CAN = "商品マスタ管理が CRUD の役割（フル権限・商品開発・システム管理）だけに表示"

JS = ("const sleep=ms=>new Promise(r=>setTimeout(r,ms));"
      "const setv=(el,v)=>{const p=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;"
      "Object.getOwnPropertyDescriptor(p,'value').set.call(el,v);el.dispatchEvent(new Event('input',{bubbles:true}));};"
      "const btn=t=>[...document.querySelectorAll('button')].find(b=>b.textContent.replace(/\\s+/g,'').includes(t));"
      "const q=s=>document.querySelector(s);")

# ================================================================ AW_CATE_001 一覧
L_HEAD = [
    F("1", "ヘッダー", ".es-pagehead", "area", detail="パンくず・画面名・操作ボタン。"),
    F("1.1", "パンくず", ".es-breadcrumb", "label", detail="「マスタ管理 / 商品カテゴリ管理」。"),
    F("1.2", "画面名", ".es-pagehead__title", "label", detail="「商品カテゴリ管理」。"),
    F("1.3", "CSV取込", "button::CSV取込", "button", "click", cond=CAN, pattern="P-CSV",
      detail="AW_CATE_003（CSV取込）へ。キーは商品カテゴリID（空欄＝新規・採番）。保存は画面と同じ決まり（表示順の入れ替えも同じ）。"),
    F("1.4", "CSV出力", "button::CSV出力", "button", "click", pattern="P-CSV-OUT", detail="全件を表示順で、取込と同じ列（登録商品数を含む）で出力する。閲覧できる役割すべてに出す。"),
    F("1.5", "新規登録", "button::新規登録", "button", "click", cond=CAN, detail="AW_CATE_002（登録のダイアログ）を開く。"),
]
L_TABLE = [
    F("2", "一覧", ".es-table-wrap", "table", pattern="P-LIST",
      detail="並び：表示順（法人Web・アプリで商品を絞り込むときの並びと同じ）。1ページ 10件。検索条件と並べ替えは置かない（件数が7つで、並びは表示順そのものが決めるため：確認メモ R-H15。P-LIST の検索・並べ替えとは違う）。"),
    F("2.1", "No", "th::No", "label", detail="表示中の通し番号（表示順とは別）。"),
    F("2.2", "カテゴリ画像", "th::カテゴリ画像", "label", detail="サムネイル。画像がないときは「—」。"),
    F("2.3", "商品カテゴリID", "th::商品カテゴリID", "label", len="文字列 CAT＋5桁", detail="システムが採番した ID（等幅）。"),
    F("2.4", "商品カテゴリ名", "th::商品カテゴリ名", "label", detail="太字。"),
    F("2.5", "登録商品数", "th::登録商品数", "label", len="整数・右寄せ", detail="このカテゴリを付けている商品の数（商品マスタ AW_PROD。無効の商品を含み、削除済を除く）。"),
    F("2.6", "表示順", "th::表示順", "label", len="整数・右寄せ", detail="1から続く番号。登録・編集・削除のたびに1から振り直す。"),
    F("2.7", "備考", "th::備考", "label", detail="未入力は「—」。"),
    F("2.8", "操作", "th::操作", "label", detail="編集（鉛筆）・削除（ごみ箱）。権限がなければ出さない。"),
    F("2.9", "編集", 'button[aria-label$="編集"]', "button", "click", cond=CAN, detail="AW_CATE_002（編集のダイアログ）を開く。"),
    F("2.10", "削除", 'button[aria-label$="削除"]', "button", "click", cond=CAN, pattern="P-DEL", err=["Q01", "S02", "E33"],
      detail="削除できるのは登録商品が0件のカテゴリだけ（受付簿 #274。削除済の商品が持つカテゴリはそのまま残す＝削除済の商品のカテゴリは変えない）。0件のときは確認（状態 002）のあと削除して、残りの表示順を1から振り直す。登録商品があるときは確認を出さずに、削除できない旨のモーダル（状態 003・E271）。サーバーでも同じ決まりで止める。"),
]
L_PAGER = [
    F("3", "ページ送り", ".es-pagination", "area", pattern="P-LIST"),
    F("3.1", "件数", ".es-pagination__meta", "label", detail="「n件中 a–b件」。"),
    F("3.2", "前のページ", 'button[aria-label="前へ"]', "button", "click", cond="1ページ目では非活性"),
    F("3.3", "ページ番号", ".es-page.is-current", "button", "click", detail="今のページは塗りつぶし。"),
    F("3.4", "次のページ", 'button[aria-label="次へ"]', "button", "click", cond="最後のページでは非活性"),
    F("3.5", "表示件数", 'select[aria-label="表示件数"]', "select", "select", req="－", len="選択（10／20／50 件／ページ）", init="10件／ページ", ex="20件／ページ", detail="変えると1ページ目に戻る。"),
]
V_LIST = [
    {"id": "001", "code": "AW_CATE_001", "state": ["初期表示", ""], "url": "/ops/masters/categories", "setup": "", "full": True, "wait": 700,
     "note": ["フル権限（Ad00010）で表示。ほかの役割では 1.3・1.5・2.9・2.10 が出ない。デモのビルドには、カテゴリ名の注記（【要確認】の段落）が表の下に出るが、設計の対象ではない。", ""],
     "items": L_HEAD + L_TABLE + L_PAGER},
    {"id": "002", "code": "AW_CATE_001", "state": ["削除の確認", ""], "url": "/ops/masters/categories", "setup": JS + ("btn('新規登録').click();await sleep(500);setv(q('.es-dialog input[placeholder=\"商品カテゴリ名\"]'),'撮影用カテゴリ');"
                    "const cv=document.createElement('canvas');cv.width=cv.height=16;const bl=await new Promise(r=>cv.toBlob(r,'image/png'));const dt=new DataTransfer();dt.items.add(new File([bl],'a.png',{type:'image/png'}));"
                    "const fi=q('.es-dialog input[type=file]');fi.files=dt.files;fi.dispatchEvent(new Event('change',{bubbles:true}));await sleep(600);"
                    "btn('登録する').click();await sleep(1200);q('button[aria-label=\"撮影用カテゴリ削除\"]').click();await sleep(400);"), "full": False, "wait": 400,
     "note": ["登録商品が0件のカテゴリのごみ箱を押したとき（見本ではサラダ・果物、飲料・甘味などに商品がなければ。撮影で対象を確かめる）。", ""],
     "items": [
         F("4", "削除の確認モーダル", '.es-modal', "modal", "show", pattern="P-DEL", err=["Q01"], detail="Q01（ボタン名＝削除）。コードの文言は Q01 と同じ。"),
         F("4.1", "本文", ".es-modal__body", "label", detail="Q01。"),
         F("4.2", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail="閉じる。何もしない。"),
         F("4.3", "削除", ".es-modal__actions button::削除", "button", "click", err=["S02", "E33"], detail="削除して S02 のトースト。残りの表示順を1から振り直す。"),
     ]},
    {"id": "003", "code": "AW_CATE_001", "state": ["削除できません（登録商品あり）", ""], "url": "/ops/masters/categories", "setup": JS + "q('button[aria-label=\"肉削除\"]').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["登録商品があるカテゴリ（見本の「肉」）のごみ箱を押したとき。確認は出さず、理由のモーダルだけ（商品の AW_PROD_001 状態 023 と同じ形）。", ""],
     "items": [
         F("5", "削除できないモーダル", '.es-dialog__panel[aria-label="削除できません"]', "modal", "show", detail="E271「登録商品が{n}件あるため削除できません。」（確認メモ §4）を、商品の削除できないモーダルと同じ形で出す。「閉じる」だけ。"),
         F("5.1", "閉じる", ".es-dialog button::閉じる", "button", "click", detail="モーダルを閉じる。何も変えない。"),
     ]},
]

# ================================================================ AW_CATE_002 登録・編集（ダイアログ）
DLG = [
    F("1", "ダイアログ", '.es-dialog__panel[aria-label^="商品カテゴリ"]', "modal", pattern="P-FORMBOX",
      detail="タイトルは新規「商品カテゴリ登録」・編集「商品カテゴリ編集」。ダイアログ（画面ではない）。下に キャンセル・登録する（編集は「保存」）。ダイアログの外側・×を押したときも、入力を変えていればキャンセルと同じ（Q02）。"),
    F("1.1", "商品カテゴリID", '.es-dialog input[placeholder="登録時に自動で採番します"]', "label", len="文字列 CAT＋5桁", init="新規：空（登録時に自動で採番します）／編集：採番済みの ID",
      detail="システムが採番する（CAT＋5桁・続き番号）。入力させない・採番後は変えない。"),
    F("1.2", "商品カテゴリ名", '.es-dialog input[placeholder="商品カテゴリ名"]', "text", "input", req="○", len="文字列 60", init="空", ex="主食",
      valid="前後の空白を取る。同じ名前のカテゴリがあればエラー（編集中の自分を除く）。絵文字は不可。", err=["E01", "E04", "E09", "E13"],
      detail="商品マスタのカテゴリの選択肢・法人Web の絞り込みに出す名前。商品はカテゴリを ID で持つので、名前を変えても商品は外れない・登録商品数も変わらない（台帳 F・受付簿 #233）。初期データの最終の名前は「サラダ・果物」「飲料・甘味」（受付簿 #257）。"),
    F("1.3", "表示順", '.es-dialog input[type="number"]', "text", "input", req="○", len="整数（1〜登録数＋1。編集は 1〜登録数）", init="新規：末尾の番号（登録数＋1）／編集：今の表示順", ex="4",
      valid="1以上、範囲内の整数。", err=["E01", "E12"],
      detail="入れた番号に差し込み、以降のカテゴリは自動で1つずつ繰り下がる。欄の下の注記「※現在の末尾：n番　※途中に追加すると、以降のカテゴリは自動的に繰り下がります。」。法人Web・アプリのカテゴリの並びもこの順。"),
    F("1.4", "カテゴリ画像", ".es-dialog .mo-up", "file", "upload", req="○", len="画像（PNG・JPEG・WebP）1枚 5MB まで・長い辺 1200px 以内", init="なし", ex="shushoku.png",
      valid="形式・サイズ・長い辺（1200px 以内）を外れたファイルは追加しない。縮小せず、選んだ画像のまま保存する。画像は必須（法人Web・アプリの表示に使うため：受付簿 #274）。画像がなければエラー。", err=["E01"],
      detail="欄の見出しに「アップロード可能形式：PNG・JPEG・WebP（最大5MB・長い辺 1200px 以内・1枚まで）」。形式・サイズの誤りは E268。入れた画像の上に 拡大（1.5）と削除（1.6）が出る。"),
    F("1.5", "画像を拡大", '.es-dialog .mo-img__ov button[aria-label="拡大して見る"]', "button", "click", detail="画像の拡大のダイアログ（状態 008）を開く。", demo_ok="画像を追加したあとにだけ出る（新規の初期表示には出ない）。編集の状態 006・拡大の状態 008 で確かめる"),
    F("1.6", "画像を削除", '.es-dialog .mo-img__ov button[aria-label="画像を削除"]', "button", "click", detail="画像を外す（保存するまで確定しない）。外すと再び「追加」が出る。", demo_ok="画像を追加したあとにだけ出る（新規の初期表示には出ない）。編集の状態 006 で確かめる"),
    F("1.7", "備考", '.es-dialog textarea[placeholder="備考"]', "textarea", "input", req="－", len="文字列 500（複数行）", init="空", ex="ごはん、丼、カレー、パンなどの主食を分類します。",
      valid="絵文字は不可。", err=["E04", "E13"], detail="社内メモ（カテゴリの説明）。3列分の幅でダイアログの最後に置く（台帳 F）。"),
    F("1.8", "キャンセル", ".es-dialog button::キャンセル", "button", "click", pattern="P-FORM", err=["Q02"], detail="入力を変えていれば Q02（キャンセル／破棄。状態 007）。変えていなければそのまま閉じる。"),
    F("1.9", "登録する／保存", ".es-dialog button::登録する", "button", "click", pattern="P-FORMBOX", err=["S151", "S01", "E30", "E31"],
      detail="全項目をまとめてチェックし、エラーがなければ保存してダイアログを閉じる（新規は「登録する」・S151、編集は「保存」・S01）。一覧は表示順を1から振り直して出す。エラーのときはダイアログを閉じず、項目の下に文言（状態 005）。"),
]
V_DLG = [
    {"id": "004", "code": "AW_CATE_002", "state": ["新規登録 初期表示", ""], "url": "/ops/masters/categories", "setup": JS + "btn('新規登録').click();await sleep(500);", "full": False, "wait": 500,
     "note": ["一覧の「新規登録」を押したとき。ID は空（登録時に採番）、表示順は末尾の番号。", ""],
     "items": DLG},
    {"id": "005", "code": "AW_CATE_002", "state": ["新規登録 入力エラー", ""], "url": "/ops/masters/categories",
     "setup": JS + "btn('新規登録').click();await sleep(500);setv(q('.es-dialog input[type=\"number\"]'),'99');btn('登録する').click();await sleep(500);", "full": False, "wait": 400,
     "note": ["商品カテゴリ名を空のまま、表示順を範囲外（99）にして「登録する」を押したとき。", ""],
     "items": [
         F("2.1", "エラーの枠", ".es-dialog .es-inline--negative", "label", "show", pattern="P-FORMBOX", detail="ダイアログの上部に「保存できません（n件）。赤い項目を確認してください。」の1行だけ（P-FORMBOX。ダイアログの場合の置き場：確認メモ R-H14）。"),
         F("2", "項目の下のエラー", ".es-dialog .es-field__msg--error", "label", "show", pattern="P-FORMBOX", err=["E01", "E12"],
           detail="エラーの項目に赤枠＋項目の下に文言（商品カテゴリ名＝E01、表示順＝E12「1〜{max}」、画像＝E01）。ダイアログは閉じない。"),
     ]},
    {"id": "006", "code": "AW_CATE_002", "state": ["編集 初期表示", ""], "url": "/ops/masters/categories", "setup": JS + "q('button[aria-label=\"肉編集\"]').click();await sleep(500);", "full": False, "wait": 500,
     "note": ["見本「肉」の鉛筆を押したとき。保存済みの値が入る。違い：タイトル「商品カテゴリ編集」・ID は採番済み・ボタン「保存」・表示順の範囲は 1〜登録数。", ""],
     "items": [
         F("3", "ダイアログ（編集）", '.es-dialog__panel[aria-label="商品カテゴリ編集"]', "modal", "show", detail="1 と同じ項目に保存済みの値が入る。ID（1.1）は変えられない。"),
     ]},
    {"id": "007", "code": "AW_CATE_002", "state": ["編集内容を破棄しますか（モーダル）", ""], "url": "/ops/masters/categories",
     "setup": JS + "q('button[aria-label=\"肉編集\"]').click();await sleep(500);setv(q('.es-dialog input[placeholder=\"商品カテゴリ名\"]'),'肉X');await sleep(200);btn('キャンセル').click();await sleep(400);", "full": False, "wait": 400,
     "note": ["入力を変えたあとに キャンセル（またはダイアログの外側・×）。全サイト共通（台帳 F）。", ""],
     "items": [
         F("4", "破棄の確認モーダル", '.es-modal', "modal", "show", pattern="P-FORM", err=["Q02"], detail="Q02（Message List No.25）。コードの文言は Q02 と同じ。"),
         F("4.1", "キャンセル", ".es-modal__actions button::キャンセル", "button", "click", detail="閉じてダイアログに戻る（入力はそのまま）。"),
         F("4.2", "破棄", ".es-modal__actions button::破棄", "button", "click", detail="入力を捨ててダイアログも閉じる。"),
     ]},
    {"id": "008", "code": "AW_CATE_002", "state": ["カテゴリ画像の拡大", ""], "url": "/ops/masters/categories",
     "setup": JS + "q('button[aria-label=\"肉編集\"]').click();await sleep(500);q('.es-dialog .mo-img__ov button[aria-label=\"拡大して見る\"]').click();await sleep(400);", "full": False, "wait": 400,
     "items": [
         F("5", "カテゴリ画像ダイアログ", '.es-dialog__panel[aria-label="カテゴリ画像"]', "modal", "show", detail="画像を大きく出す（幅 560）。「閉じる」で登録・編集のダイアログに戻る（入力はそのまま）。"),
         F("5.1", "閉じる", ".es-dialog button::閉じる", "button", "click"),
     ]},
]

# ================================================================ AW_CATE_003 CSV取込（画面）
S = lambda ref: "画面の項目 %s と同じ。" % ref
def CSVCOL(no, ja, req, ln, ex, same, valid="", err=None, kind="text"):
    d = F(no, ja, "-", kind, "input", req=req, len=ln, init="空欄（更新の行は今の値のまま）", ex=ex,
          valid=valid or ("新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。" if req == "○" else "空欄＝今の値のまま。「-」で消せる。"), detail=same)
    if err:
        d["err"] = err
    return d
CSV_COLS = [
    F("1", "ヘッダー", ".es-pagehead", "area"),
    F("1.1", "パンくず", ".es-breadcrumb", "label", detail="「マスタ管理 / 商品カテゴリ管理 / 商品カテゴリ CSV取込」。商品カテゴリ管理はリンク。"),
    F("1.2", "画面名", ".es-pagehead__title", "label", detail="「商品カテゴリ CSV取込」"),
    F("1.3", "キャンセル", ".es-pagehead__actions button::キャンセル", "button", "click", detail="一覧へ戻る（何も登録しない）。"),
    F("2", "CSVテンプレートの列（定義。画面には出さない）", "-", "area", "view",
      detail="取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/categories.csv（まだない。コードの API csv.template から書き出す宿題）。キー＝商品カテゴリID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消せる。画面の説明に「カテゴリ画像は画面で登録した画像の名前（photo:…）を入れます（CSV で画像は送れません）」と出る。画面には出さない（hong 2026-10-05）。"),
    CSVCOL("2.1", "商品カテゴリID", "－", "文字列 CAT＋5桁", "CAT00004", "空欄＝新規（採番）。" + S("1.1"), valid="該当の ID がなければ行のエラー。"),
    CSVCOL("2.2", "商品カテゴリ名", "○", "文字列 60", "主食", S("1.2") + "同じ名前がすでにあればエラー。商品は ID でカテゴリを持つので、名前を変えても商品は外れない（警告は出さない：確認メモ Q-H5＝B・受付簿 #233）。",
           err=["E01", "E04", "E09"]),
    CSVCOL("2.3", "表示順", "－", "整数（1以上）", "4", S("1.3") + "空欄の新規は末尾。入れた番号に差し込み、以降を繰り下げる。", err=["E12"]),
    CSVCOL("2.4", "備考", "－", "文字列 500", "ごはん、丼、カレー、パンなどの主食を分類します。", S("1.7"), err=["E04"], kind="textarea"),
    CSVCOL("2.5", "カテゴリ画像", "○", "文字列（画像の名前 photo:…）", "photo:主食:83", "新規の行で必須。画面で登録した画像の名前（photo:…）を書く。画面で上げた画像は「（アップロードした画像）」と出力され、その値のまま取り込むと画像は変わらない。CSV で画像は送れない（新規の行も、画面で先に上げた画像を使う：受付簿 #274）。", err=["E01"]),
    F("2.6", "登録商品数", "-", "label", "view", len="整数", ex="9", detail="出力だけの列（取込では読まない）。このカテゴリを付けた商品（削除済を除く）の数。"),
]
CSV_BODY = [
    F("3", "ファイルを選ぶ（ステップ1）", ".es-card", "area", pattern="P-CSV"),
    F("3.1", "手順", 'ol[aria-label="取込の手順"]', "label", detail="1 ファイルを選ぶ → 2 確認・登録。今の手順を濃く、済んだ手順を緑に。"),
    F("3.2", "説明", ".es-card .hint", "label", detail="取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）と、画像の注記。"),
    F("3.3", "ファイルを選ぶ", ".es-card button::ファイルを選ぶ", "file", "upload", req="○", len="CSV（UTF-8・.csv）1ファイル", init="なし", ex="商品カテゴリ管理_20261006.csv",
      err=["E51", "E34"], detail="ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が違うファイルはその場でエラーの帯。"),
]
CSV_STEP2 = [
    F("4", "確認・登録（ステップ2）", ".es-card", "area", "show", pattern="P-CSV", err=["S03", "E34", "E52"], detail="AW_PROD_004 の 4 と同じ形（ファイル名・件数・エラーの行・登録する内容・警告）。「登録」でエラー以外の行を登録する。カテゴリ名を変える行に警告は出ない（商品は ID で持つ）。"),
    F("4.1", "件数", ".es-card .badge", "label", detail="新規／更新／変更なし／エラー の件数（バッジ）。"),
    F("4.2", "エラーの行", ".es-card [role=alert]", "label", "show", cond="エラーの行があるとき", detail="行番号・キー・列名・内容。内容は 2.x のチェックの文言。"),
    F("4.3", "エラー一覧CSV", ".es-card button::エラー一覧CSV", "button", "click", detail="エラーの行だけを、元の列＋エラーの内容で書き出す。"),
    F("4.5", "ファイルを選び直す", ".es-pagehead__actions button::ファイルを選び直す", "button", "click", detail="ステップ1に戻る。何も登録しない。"),
    F("4.6", "登録", ".es-pagehead__actions button::登録", "button", "click", err=["S03", "E34", "Q10"], detail="エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。表示順は1から振り直す。"),
]
V_CSV = [
    {"id": "009", "code": "AW_CATE_003", "state": ["初期表示（ステップ1 ファイルを選ぶ）", ""], "url": "/ops/masters/categories/import", "setup": "", "full": True, "wait": 1200,
     "note": ["商品マスタ管理が CRUD の役割（フル権限・商品開発・システム管理）だけが開ける（ほかの役割は「この画面を見る権限がありません」：受付簿 #273）。列の定義（2.x）は画面には出さない（hong 2026-10-05）。", ""],
     "items": CSV_COLS + CSV_BODY},
    {"id": "010", "code": "AW_CATE_003", "state": ["確認・登録（ステップ2）", ""], "url": "/ops/masters/categories/import",
     "setup": JS + ("const res=await fetch('/api/domain/csv/export',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json','x-es-site':'ops'},body:JSON.stringify({args:{entity:'categories',scope:{site:'ops'}}})});"
                    "const t=await res.json();const esc=v=>'\"'+String(v??'').replace(/\"/g,'\"\"')+'\"';const rows=[t.head,...t.rows.slice(0,3)];"
                    "const ni=t.head.findIndex(h=>h==='商品カテゴリ名');if(ni>=0)rows[1][ni]=rows[1][ni]+'X';const bad=t.rows[0].slice();bad[0]='CAT99999';rows.push(bad);"
                    "const text='\\ufeff'+rows.map(r=>r.map(esc).join(',')).join('\\r\\n');const inp=q('input[type=file]');const dt=new DataTransfer();dt.items.add(new File([text],'取込テスト.csv',{type:'text/csv'}));inp.files=dt.files;inp.dispatchEvent(new Event('change',{bubbles:true}));await sleep(2500);"),
     "full": True, "wait": 600,
     "note": ["ファイルを選んだ直後。見本は CSV出力の先頭3行に、1行目の名前を変え（更新の見本）、存在しない ID の行を1つ足したもの（エラーの行の見本）。", ""],
     "items": CSV_STEP2},
]

VIEWS = V_LIST + V_DLG + V_CSV

# ================================================================ 初期データのシート（商品カテゴリ 7つ。lib/domain/seed/products.ts の PRODUCT_CATEGORIES・台帳 F）
SHEETS = [{
    "name": ["初期データ（商品カテゴリ）", ""],
    "note": ["システムに最初から入っている商品カテゴリ（台帳 F・2026-10-05：7つ。最終の名前は「サラダ・果物」「飲料・甘味」に決まった＝受付簿 #257。名前はマスタで運営が変えられる）。画像は見本の絵（photo:…）。", ""],
    "tables": [{
        "title": ["商品カテゴリ（7件）", ""],
        "head": [[["商品カテゴリID", ""], 16], [["商品カテゴリ名", ""], 18], [["表示順", ""], 10], [["備考", ""], 60]],
        "rows": [
            ["CAT00001", "肉", "1", "鶏肉、豚肉、牛肉を使用した商品を分類します。"],
            ["CAT00002", "魚", "2", "魚介類を主な食材とする商品を分類します。"],
            ["CAT00003", "惣菜", "3", "主菜や副菜として提供される調理済み商品を分類します。"],
            ["CAT00004", "主食", "4", "ごはん、丼、カレー、パン、おにぎり、サンドイッチなどの主食を分類します。"],
            ["CAT00005", "汁物", "5", "スープや味噌汁などの汁物商品を分類します。"],
            ["CAT00006", "サラダ・果物", "6", "野菜を中心としたサラダ商品と、果物の商品を分類します。"],
            ["CAT00007", "飲料・甘味", "7", "水、お茶、ジュースなどの飲料と、デザートなどの甘味商品を分類します。"],
        ],
    }],
}]

# ==== ベトナム語（vi）：日本語の文をキーにした対訳表。末尾の _fill_vi() が読み込み時に vi と ex の説明へ入れる ====
_VI_T = {
    "コードの選択肢は 10／50／100 件（宿題。台帳 K「一覧の決まり」の 10／20／50 が正：hong 回答 2026-10-06）": "Các lựa chọn trong code là 10／50／100 mục (việc cần làm. 10／20／50 trong 台帳 K \"Quy tắc danh sách\" mới đúng: hong trả lời 2026-10-06)",
 '画像を追加したあとにだけ出る（新規の初期表示には出ない）。編集の状態 006・拡大の状態 008 で確かめる': 'Chỉ hiện sau khi thêm ảnh (không hiện ở trạng thái mở đầu của đăng ký mới). Xác nhận ở trạng thái 006 (sửa) và 008 (phóng to).',
 '画像を追加したあとにだけ出る（新規の初期表示には出ない）。編集の状態 006 で確かめる': 'Chỉ hiện sau khi thêm ảnh (không hiện ở trạng thái mở đầu của đăng ký mới). Xác nhận ở trạng thái 006 (sửa).','運営管理者Web': 'Web quản trị vận hành',
 'だれが作成・編集・削除・CSV取込できるか': 'Ai được tạo, sửa, xóa, nhập CSV',
 '画面コード': 'Mã màn hình',
 'カテゴリ名を変えたとき、商品はどうなるか': 'Khi đổi tên danh mục thì sản phẩm thế nào',
 '初期表示': 'Hiển thị ban đầu',
 'パンくず・画面名・操作ボタン。': 'Breadcrumb, tên màn hình, các nút thao tác.',
 '商品マスタ管理が CRUD の役割（フル権限・商品開発・システム管理）だけに表示': 'Chỉ hiện với vai trò có quyền CRUD ở quản lý master sản phẩm (Toàn quyền, Phát triển sản phẩm, Quản trị hệ thống)',
 '空': 'Trống',
 '1ページ目では非活性': 'Trang 1 thì vô hiệu',
 '今のページは塗りつぶし。': 'Trang hiện tại tô đậm.',
 '最後のページでは非活性': 'Trang cuối thì vô hiệu',
 '変えると1ページ目に戻る。': 'Đổi thì về trang 1.',
 '10件／ページ': '10 dòng/trang',
 '削除の確認': 'Xác nhận xóa',
 '閉じる。何もしない。': 'Đóng, không làm gì.',
 'なし': 'Không',
 'コードは長い辺 320px の JPEG に縮小して保存する（宿題）。確認メモ Q-H7＝C・受付簿 #236 が正': 'Code thu nhỏ về JPEG cạnh dài 320px rồi lưu (việc cần sửa). Ghi chú xác nhận Q-H7 = C, 受付簿 #236 là chuẩn',
 '絵文字は不可。': 'Không dùng emoji.',
 '新規登録 入力エラー': 'Đăng ký mới, lỗi nhập',
 '編集内容を破棄しますか（モーダル）': 'Hủy nội dung đã sửa (modal)',
 '初期表示（ステップ1 ファイルを選ぶ）': 'Hiển thị ban đầu (bước 1 chọn tệp)',
 '一覧へ戻る（何も登録しない）。': 'Quay về danh sách (không đăng ký gì).',
 '空欄（更新の行は今の値のまま）': 'Trống (dòng cập nhật giữ giá trị cũ)',
 '新規の行で必須。更新の行は空欄＝今の値のまま。「-」で消せる。': 'bắt buộc ở dòng mới; dòng cập nhật để trống = giữ giá trị cũ; ghi "-" để xóa giá trị.',
 '空欄＝今の値のまま。「-」で消せる。': 'Để trống = giữ giá trị hiện tại. Ghi "-" để xóa.',
 '1 ファイルを選ぶ → 2 確認・登録。今の手順を濃く、済んだ手順を緑に。': '1 Chọn tệp → 2 Xác nhận, đăng ký. Bước hiện tại đậm, bước đã xong màu xanh lá.',
 'ファイルを選ぶか、枠にドラッグ＆ドロップ。選ぶとすぐに確かめて（何も保存しない）ステップ2へ。.csv 以外・UTF-8 以外・読めないファイル・見出しの列が違うファイルはその場でエラーの帯。': 'Chọn tệp hoặc kéo thả vào khung. Khi chọn sẽ kiểm tra ngay (chưa lưu gì) rồi sang bước 2. Tệp không phải .csv, không phải UTF-8, không đọc được, hoặc cột tiêu đề khác thì hiện dải lỗi ngay.',
 '確認・登録（ステップ2）': 'Xác nhận, đăng ký (bước 2)',
 '新規／更新／変更なし／エラー の件数（バッジ）。': 'Số dòng 新規 / 更新 / 変更なし / エラー (badge).',
 'エラーの行があるとき': 'Khi có dòng lỗi',
 'エラーの行だけを、元の列＋エラーの内容で書き出す。': 'Xuất riêng các dòng lỗi, gồm các cột gốc + nội dung lỗi.',
 'ステップ1に戻る。何も登録しない。': 'Về bước 1. Không đăng ký gì.',
 '商品カテゴリ管理（AW_CATE）': 'Quản lý danh mục sản phẩm (AW_CATE)',
 '商品カテゴリ管理': 'Quản lý danh mục sản phẩm',
 '画面コードは規約 <Module(2)>_<Feature(4)>_<Seq(3)>（docs/01_仕様/画面コード規約_20261005.md）。AW＝運営管理者Web、CATE＝商品カテゴリ管理（Feature は Claude 案・hong の確認待ち）': 'Mã màn hình theo quy ước <Module(2)>_<Feature(4)>_<Seq(3)> (docs/01_仕様/画面コード規約_20261005.md). AW = Web quản trị vận hành, CATE = quản lý danh mục sản phẩm (Feature là đề xuất của Claude, chờ hong xác nhận)',
 '商品マスタ管理が CRUD の役割（フル権限・商品開発・システム管理）。ほかの役割（経理・営業・CS・商品管理・物流）は R（閲覧・CSV出力）。新規登録・編集・削除・CSV取込のボタンは CRUD の役割だけに出す': 'Vai trò có quyền CRUD ở quản lý master sản phẩm (Toàn quyền, Phát triển sản phẩm, Quản trị hệ thống). Các vai trò khác (Kế toán, Kinh doanh, CS, Quản lý sản phẩm, Logistics) là R (xem, xuất CSV). Các nút Đăng ký mới, Sửa, Xóa, Nhập CSV chỉ hiện với vai trò CRUD',
 'カテゴリの初期データ': 'Dữ liệu ban đầu của danh mục',
 '7つ：肉・魚・惣菜（上段）／主食・汁物・「サラダ・果物」・「飲料・甘味」（下段）。最終の名前は「サラダ・果物」「飲料・甘味」に決まった（客先確認・hong 回答。名前はマスタで運営が変えられる）': '7 danh mục: 肉, 魚, 惣菜 (hàng trên) / 主食, 汁物, サラダ・果物, 飲料・甘味 (hàng dưới). Tên cuối cùng đã chốt là "サラダ・果物" và "飲料・甘味" (khách xác nhận, hong trả lời; vận hành có thể đổi tên ở master)',
 'カテゴリにコースを持たせるか': 'Có gắn course vào danh mục không',
 '持たせない。お客様に見える商品は商品ごとのコースで決まり、見せる商品がないカテゴリは自動で出ない': 'Không gắn. Sản phẩm khách nhìn thấy được quyết định theo course của từng sản phẩm, danh mục không có sản phẩm nào để hiện thì tự động không hiện',
 'カテゴリのマスタが持つ項目': 'Các mục của master danh mục',
 '名前・ID・表示順・画像・登録商品数（+ 備考）。取込でマスタにないカテゴリはエラー': 'Tên, ID, thứ tự hiển thị, ảnh, số sản phẩm đã đăng ký (+ ghi chú). Khi nhập, danh mục không có trong master là lỗi',
 '商品はカテゴリを ID で持つ。名前を変えても商品は外れず、登録商品数も変わらない（名前を変えたときの警告・商品の書き換えは要らない）': 'Sản phẩm giữ danh mục bằng ID. Đổi tên thì sản phẩm không bị tách ra và số sản phẩm đã đăng ký không đổi (không cần cảnh báo hay ghi lại sản phẩm khi đổi tên)',
 '画像の形式と縮小': 'Định dạng ảnh và việc thu nhỏ',
 'PNG・JPEG・WebP（5MB・1枚）。縮小せずに保存し、長い辺 1200px 以内に制限する（商品写真と同じ）': 'PNG, JPEG, WebP (5MB, 1 ảnh). Lưu nguyên không thu nhỏ, giới hạn cạnh dài tối đa 1200px (giống ảnh sản phẩm)',
 'AW_CATE_001〜003（一覧・登録／編集・CSV取込）': 'AW_CATE_001 đến 003 (danh sách, đăng ký/sửa, nhập CSV)',
 'フル権限（Ad00010）で表示。ほかの役割では 1.3・1.5・2.9・2.10 が出ない。デモのビルドには、カテゴリ名の注記（【要確認】の段落）が表の下に出るが、設計の対象ではない。': 'Hiển thị với toàn quyền (Ad00010). Với các vai trò khác thì không hiện 1.3, 1.5, 2.9, 2.10. Bản build demo có ghi chú tên danh mục (đoạn 【要確認】) dưới bảng nhưng không thuộc đối tượng thiết kế.',
 '「マスタ管理 / 商品カテゴリ管理」。': '"マスタ管理 / 商品カテゴリ管理".',
 '「商品カテゴリ管理」。': '"商品カテゴリ管理".',
 'AW_CATE_003（CSV取込）へ。キーは商品カテゴリID（空欄＝新規・採番）。保存は画面と同じ決まり（表示順の入れ替えも同じ）。': 'Chuyển đến AW_CATE_003 (nhập CSV). Khóa là ID danh mục sản phẩm (để trống = đăng ký mới, cấp số). Việc lưu theo cùng quy tắc với màn hình (hoán đổi thứ tự hiển thị cũng vậy).',
 '全件を表示順で、取込と同じ列（登録商品数を含む）で出力する。閲覧できる役割すべてに出す。': 'Xuất toàn bộ theo thứ tự hiển thị, với các cột giống nhập (gồm số sản phẩm đã đăng ký). Hiện cho mọi vai trò xem được.',
 'AW_CATE_002（登録のダイアログ）を開く。': 'Mở AW_CATE_002 (hộp thoại đăng ký).',
 '並び：表示順（法人Web・アプリで商品を絞り込むときの並びと同じ）。1ページ 10件。検索条件と並べ替えは置かない（件数が7つで、並びは表示順そのものが決めるため：確認メモ R-H15。P-LIST の検索・並べ替えとは違う）。': 'Thứ tự: theo thứ tự hiển thị (giống thứ tự khi lọc sản phẩm trên Web doanh nghiệp / app). 10 dòng mỗi trang. Không đặt điều kiện tìm kiếm và sắp xếp (vì chỉ có 7 danh mục và thứ tự do chính thứ tự hiển thị quyết định: ghi chú xác nhận R-H15. Khác với tìm kiếm / sắp xếp của P-LIST).',
 '表示中の通し番号（表示順とは別）。': 'Số thứ tự hiển thị (khác với thứ tự hiển thị của danh mục).',
 'サムネイル。画像がないときは「—」。': 'Ảnh thu nhỏ. Nếu không có ảnh thì "—".',
 'システムが採番した ID（等幅）。': 'ID do hệ thống cấp số (font đơn cách).',
 '太字。': 'Chữ đậm.',
 'このカテゴリを付けている商品の数（商品マスタ AW_PROD。無効の商品を含み、削除済を除く）。': 'Số sản phẩm gắn danh mục này (master sản phẩm AW_PROD. Gồm sản phẩm vô hiệu, không tính đã xóa).',
 '1から続く番号。登録・編集・削除のたびに1から振り直す。': 'Số liên tiếp từ 1. Đánh lại từ 1 mỗi lần đăng ký, sửa, xóa.',
 '未入力は「—」。': 'Chưa nhập thì "—".',
 '編集（鉛筆）・削除（ごみ箱）。権限がなければ出さない。': 'Sửa (biểu tượng bút), xóa (thùng rác). Không hiện nếu không có quyền.',
 'AW_CATE_002（編集のダイアログ）を開く。': 'Mở AW_CATE_002 (hộp thoại sửa).',
 '削除できるのは登録商品が0件のカテゴリだけ（受付簿 #274。削除済の商品が持つカテゴリはそのまま残す＝削除済の商品のカテゴリは変えない）。0件のときは確認（状態 002）のあと削除して、残りの表示順を1から振り直す。登録商品があるときは確認を出さずに、削除できない旨のモーダル（状態 003・E271）。サーバーでも同じ決まりで止める。': 'Khi số sản phẩm đã đăng ký là 0 thì xóa sau khi xác nhận (trạng thái 002) và đánh lại thứ tự hiển thị của phần còn lại từ 1. Khi có sản phẩm đã đăng ký thì không hiện xác nhận mà hiện toast cho biết không xóa được (trạng thái 003, E271). Phía server cũng chặn theo cùng quy tắc.',
 'コードのトーストは「データの保存が正常に完了しました。」「データの削除が完了しました。」。S01（保存しました。）・S151（登録しました。）・S02（削除が完了しました。）に合わせる（宿題・確認メモ R-H5）': 'Toast trong code là "データの保存が正常に完了しました。" và "データの削除が完了しました。". Điều chỉnh theo S01 (保存しました。), S151 (登録しました。), S02 (削除が完了しました。) (việc cần sửa; ghi chú xác nhận R-H5)',
 '「n件中 a–b件」。': '"a–b trong n dòng".',
 '登録商品が0件のカテゴリのごみ箱を押したとき（見本ではサラダ・果物、飲料・甘味などに商品がなければ。撮影で対象を確かめる）。': 'Khi nhấn thùng rác của danh mục có 0 sản phẩm đã đăng ký (trong mẫu nếu サラダ・果物, 飲料・甘味 v.v. không có sản phẩm. Kiểm tra đối tượng khi chụp).',
 'Q01（ボタン名＝削除）。コードの文言は Q01 と同じ。': 'Q01 (tên nút = 削除). Câu chữ trong code giống Q01.',
 'Q01。': 'Q01.',
 '削除して S02 のトースト。残りの表示順を1から振り直す。': 'Xóa và hiện toast S02. Đánh lại thứ tự hiển thị của phần còn lại từ 1.',
 '削除できません（登録商品あり）': 'Không xóa được (có sản phẩm đã đăng ký)',
 '登録商品があるカテゴリ（見本の「肉」）のごみ箱を押したとき。確認は出さず、赤いトーストだけ。': 'Khi nhấn thùng rác của danh mục có sản phẩm đã đăng ký ("肉" trong mẫu). Không hiện xác nhận, chỉ có toast đỏ.',
 'E271「登録商品が{n}件あるため削除できません。」（確認メモ §4）。': 'E271 "登録商品が{n}件あるため削除できません。" (ghi chú xác nhận §4).',
 '新規登録 初期表示': 'Đăng ký mới: ban đầu',
 '一覧の「新規登録」を押したとき。ID は空（登録時に採番）、表示順は末尾の番号。': 'Khi nhấn "新規登録" ở danh sách. ID để trống (cấp số khi đăng ký), thứ tự hiển thị là số cuối.',
 'タイトルは新規「商品カテゴリ登録」・編集「商品カテゴリ編集」。ダイアログ（画面ではない）。下に キャンセル・登録する（編集は「保存」）。ダイアログの外側・×を押したときも、入力を変えていればキャンセルと同じ（Q02）。': 'Tiêu đề: đăng ký mới "商品カテゴリ登録", sửa "商品カテゴリ編集". Là hộp thoại (không phải màn hình). Bên dưới có キャンセル và 登録する (sửa thì "保存"). Khi nhấn vùng ngoài hộp thoại hoặc ×, nếu đã đổi nội dung nhập thì giống キャンセル (Q02).',
 'システムが採番する（CAT＋5桁・続き番号）。入力させない・採番後は変えない。': 'Hệ thống cấp số (CAT + 5 chữ số, liên tiếp). Không cho nhập, không đổi sau khi cấp.',
 '新規：空（登録時に自動で採番します）／編集：採番済みの ID': 'Đăng ký mới: trống (tự cấp số khi đăng ký) / Sửa: ID đã cấp',
 '商品マスタのカテゴリの選択肢・法人Web の絞り込みに出す名前。商品はカテゴリを ID で持つので、名前を変えても商品は外れない・登録商品数も変わらない（台帳 F・受付簿 #233）。初期データの最終の名前は「サラダ・果物」「飲料・甘味」（受付簿 #257）。': 'Tên hiện trong lựa chọn danh mục của master sản phẩm và bộ lọc Web doanh nghiệp. Sản phẩm giữ danh mục bằng ID nên đổi tên thì sản phẩm không bị tách ra và số sản phẩm đã đăng ký không đổi (台帳 F, 受付簿 #233). Tên cuối cùng của dữ liệu ban đầu là "サラダ・果物" và "飲料・甘味" (受付簿 #257).',
 '前後の空白を取る。同じ名前のカテゴリがあればエラー（編集中の自分を除く）。絵文字は不可。': 'Bỏ khoảng trắng đầu cuối. Có danh mục cùng tên thì lỗi (trừ chính mục đang sửa). Không dùng emoji.',
 '入力欄に最大文字数の制御がない（宿題）。入力の共通基準（60文字）が正。CSV の列は 50 文字まで（確認メモ R-H3・R-H13）。コードは商品がカテゴリを名前で持ち、名前を変えると商品が外れる（宿題。受付簿 #233 が正）': 'Ô nhập không giới hạn số ký tự tối đa (việc cần sửa). Quy tắc nhập chung (60 ký tự) là chuẩn. Cột CSV tối đa 50 ký tự (ghi chú xác nhận R-H3, R-H13). Code giữ danh mục bằng tên và khi đổi tên thì sản phẩm bị tách (việc cần sửa. 受付簿 #233 là chuẩn)',
 '入れた番号に差し込み、以降のカテゴリは自動で1つずつ繰り下がる。欄の下の注記「※現在の末尾：n番\u3000※途中に追加すると、以降のカテゴリは自動的に繰り下がります。」。法人Web・アプリのカテゴリの並びもこの順。': 'Chèn vào số đã nhập, các danh mục sau đó tự lùi 1 vị trí. Ghi chú dưới ô "※現在の末尾：n番 ※途中に追加すると、以降のカテゴリは自動的に繰り下がります。". Thứ tự danh mục trên Web doanh nghiệp / app cũng theo đây.',
 '新規：末尾の番号（登録数＋1）／編集：今の表示順': 'Đăng ký mới: số cuối (số danh mục + 1) / Sửa: thứ tự hiển thị hiện tại',
 '1以上、範囲内の整数。': 'Số nguyên từ 1 trở lên và trong phạm vi.',
 '欄の見出しに「アップロード可能形式：PNG・JPEG・WebP（最大5MB・長い辺 1200px 以内・1枚まで）」。形式・サイズの誤りは E268。入れた画像の上に 拡大（1.5）と削除（1.6）が出る。': 'Tiêu đề ô ghi "アップロード可能形式：PNG・JPEG・WebP（最大5MB・長い辺 1200px 以内・1枚まで）". Sai định dạng / dung lượng thì E268. Phía trên ảnh đã nhập hiện phóng to (1.5) và xóa (1.6).',
 '形式・サイズ・長い辺（1200px 以内）を外れたファイルは追加しない。縮小せず、選んだ画像のまま保存する。画像がなければエラー。': 'Tệp ngoài định dạng, dung lượng, cạnh dài (trong 1200px) thì không thêm. Không thu nhỏ, lưu nguyên ảnh đã chọn. Không có ảnh thì lỗi.',
 '画像の拡大のダイアログ（状態 008）を開く。': 'Mở hộp thoại phóng to ảnh (trạng thái 008).',
 '画像を外す（保存するまで確定しない）。外すと再び「追加」が出る。': 'Gỡ ảnh (chưa xác định cho đến khi lưu). Gỡ xong thì hiện lại "追加".',
 '社内メモ（カテゴリの説明）。3列分の幅でダイアログの最後に置く（台帳 F）。': 'Ghi chú nội bộ (mô tả danh mục). Đặt ở cuối hộp thoại, rộng 3 cột (台帳 F).',
 'コードの備考は1行の入力欄。複数行（500文字・3列分の幅）にしてセクションの最後へ（台帳 F・入力の共通基準。宿題）': 'Ghi chú trong code là ô nhập 1 dòng. Cần chuyển thành nhiều dòng (500 ký tự, rộng 3 cột) và đặt ở cuối mục (台帳 F, quy tắc nhập chung. Việc cần sửa)',
 '入力を変えていれば Q02（キャンセル／破棄。状態 007）。変えていなければそのまま閉じる。': 'Nếu đã đổi nội dung nhập thì hiện Q02 (hủy / bỏ, trạng thái 007). Nếu chưa đổi thì đóng luôn.',
 '全項目をまとめてチェックし、エラーがなければ保存してダイアログを閉じる（新規は「登録する」・S151、編集は「保存」・S01）。一覧は表示順を1から振り直して出す。エラーのときはダイアログを閉じず、項目の下に文言（状態 005）。': 'Kiểm tra toàn bộ mục một lượt, nếu không có lỗi thì lưu và đóng hộp thoại (đăng ký mới là "登録する", S151; sửa là "保存", S01). Danh sách đánh lại thứ tự hiển thị từ 1. Khi có lỗi thì không đóng hộp thoại và hiện câu chữ dưới mục (trạng thái 005).',
 'コードのトーストは「データの保存が正常に完了しました。」「データの削除が完了しました。」。S01（保存しました。）・S151（登録しました。）・S02（削除が完了しました。）に合わせる（宿題・確認メモ R-H5）。コードのカテゴリの保存は同時更新を検出しない（E31・I02 が出ない。宿題）。P-FORM が正（確認メモ R-H4）': 'Toast trong code là "データの保存が正常に完了しました。" và "データの削除が完了しました。". Điều chỉnh theo S01 (保存しました。), S151 (登録しました。), S02 (削除が完了しました。) (việc cần sửa; ghi chú xác nhận R-H5). Việc lưu danh mục trong code không phát hiện cập nhật đồng thời (E31 và I02 không hiện. Việc cần sửa). P-FORM là chuẩn (ghi chú xác nhận R-H4)',
 '商品カテゴリ名を空のまま、表示順を範囲外（99）にして「登録する」を押したとき。': 'Khi để trống tên danh mục sản phẩm, đặt thứ tự hiển thị ngoài phạm vi (99) rồi nhấn "登録する".',
 'エラーの項目に赤枠＋項目の下に文言（商品カテゴリ名＝E01、表示順＝E12「1〜{max}」、画像＝E01）。ダイアログは閉じない。': 'Mục lỗi có viền đỏ + câu chữ dưới mục (tên danh mục sản phẩm = E01, thứ tự hiển thị = E12 "1〜{max}", ảnh = E01). Không đóng hộp thoại.',
 'コードは項目の下の文言だけで、見出しの下の「保存できません（n件）」の枠がない。文言も E01 等と違う（宿題）。P-FORMBOX が正（確認メモ R-H4）。ダイアログの場合の枠の置き場は確認メモ R-H14': 'Code chỉ có câu chữ dưới mục, không có khung "保存できません（n件）" dưới tiêu đề. Câu chữ cũng khác E01 v.v. (việc cần sửa). P-FORMBOX là chuẩn (ghi chú xác nhận R-H4). Vị trí khung trong trường hợp hộp thoại xem ghi chú xác nhận R-H14',
 '編集 初期表示': 'Sửa, hiển thị ban đầu',
 '見本「肉」の鉛筆を押したとき。保存済みの値が入る。違い：タイトル「商品カテゴリ編集」・ID は採番済み・ボタン「保存」・表示順の範囲は 1〜登録数。': 'Khi nhấn biểu tượng bút của mẫu "肉". Điền giá trị đã lưu. Khác biệt: tiêu đề "商品カテゴリ編集", ID đã cấp, nút "保存", phạm vi thứ tự hiển thị là 1 đến số danh mục.',
 '1 と同じ項目に保存済みの値が入る。ID（1.1）は変えられない。': 'Các mục giống 1, điền giá trị đã lưu. Không đổi được ID (1.1).',
 '入力を変えたあとに キャンセル（またはダイアログの外側・×）。全サイト共通（台帳 F）。': 'Sau khi đổi nội dung nhập rồi nhấn キャンセル (hoặc vùng ngoài hộp thoại, ×). Chung cho toàn hệ thống (台帳 F).',
 'Q02（Message List No.25）。コードの文言は Q02 と同じ。': 'Q02 (Message List No.25). Câu chữ trong code giống Q02.',
 '閉じてダイアログに戻る（入力はそのまま）。': 'Đóng và quay lại hộp thoại (nội dung nhập giữ nguyên).',
 '入力を捨ててダイアログも閉じる。': 'Bỏ nội dung nhập và đóng cả hộp thoại.',
 'カテゴリ画像の拡大': 'Phóng to ảnh danh mục',
 '画像を大きく出す（幅 560）。「閉じる」で登録・編集のダイアログに戻る（入力はそのまま）。': 'Hiện ảnh lớn (rộng 560). Nhấn "閉じる" để quay lại hộp thoại đăng ký / sửa (nội dung nhập giữ nguyên).',
 'CSV取込の権限（フル権限・商品開発）だけが開ける（ほかの役割は一覧へ）。列の定義（2.x）は画面には出さない（hong 2026-10-05）。': 'Chỉ vai trò có quyền nhập CSV (Toàn quyền, Phát triển sản phẩm) mới mở được (vai trò khác bị đưa về danh sách). Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026-10-05).',
 '「マスタ管理 / 商品カテゴリ管理 / 商品カテゴリ CSV取込」。商品カテゴリ管理はリンク。': '"マスタ管理 / 商品カテゴリ管理 / 商品カテゴリ CSV取込". Quản lý danh mục sản phẩm là liên kết.',
 '「商品カテゴリ CSV取込」': '"商品カテゴリ CSV取込"',
 '取り込むファイルの列の定義（1行目の見出し・この順。CSV出力と同じ列）。テンプレートの写しは docs/05_画面設計書/CSVテンプレート/categories.csv（まだない。コードの API csv.template から書き出す宿題）。キー＝商品カテゴリID（空欄＝新規・採番）。UTF-8（BOM 可）・5,000行まで。空欄のセルは今の値のまま、「-」で消せる。画面の説明に「カテゴリ画像は画面で登録した画像の名前（photo:…）を入れます（CSV で画像は送れません）」と出る。画面には出さない（hong 2026-10-05）。': 'Định nghĩa các cột của tệp nhập (tiêu đề dòng 1, theo thứ tự này, cùng cột với xuất CSV). Bản mẫu là docs/05_画面設計書/CSVテンプレート/categories.csv (chưa có; việc cần làm: xuất từ API csv.template của code). Khóa = ID danh mục sản phẩm (để trống = đăng ký mới, cấp số). UTF-8 (cho phép BOM), tối đa 5,000 dòng. Ô trống = giữ giá trị hiện tại, ghi "-" để xóa. Phần mô tả trên màn hình có dòng "カテゴリ画像は画面で登録した画像の名前（photo:…）を入れます（CSV で画像は送れません）". Không hiện trên màn hình (hong 2026-10-05).',
 '空欄＝新規（採番）。画面の項目 1.1 と同じ。': 'Để trống = đăng ký mới (cấp số). Giống mục 1.1 trên màn hình.',
 '該当の ID がなければ行のエラー。': 'Nếu không có ID tương ứng thì lỗi dòng.',
 '画面の項目 1.2 と同じ。同じ名前がすでにあればエラー。商品は ID でカテゴリを持つので、名前を変えても商品は外れない（警告は出さない：確認メモ Q-H5＝B・受付簿 #233）。': 'Giống mục 1.2 trên màn hình. Tên đã có thì lỗi. Sản phẩm giữ danh mục bằng ID nên đổi tên thì sản phẩm không bị tách ra (không hiện cảnh báo: ghi chú xác nhận Q-H5 = B, 受付簿 #233).',
 '画面の項目 1.3 と同じ。空欄の新規は末尾。入れた番号に差し込み、以降を繰り下げる。': 'Giống mục 1.3 trên màn hình. Dòng mới để trống thì ở cuối. Chèn vào số đã nhập, các mục sau lùi xuống.',
 '画面の項目 1.7 と同じ。': 'Giống mục 1.7 trên màn hình.',
 '新規の行で必須。画面で登録した画像の名前（photo:…）を書く。画面で上げた画像は「（アップロードした画像）」と出力され、その値のまま取り込むと画像は変わらない。CSV で画像は送れない。': 'Bắt buộc ở dòng mới. Ghi tên ảnh đã đăng ký trên màn hình (photo:…). Ảnh đã tải lên từ màn hình được xuất là "（アップロードした画像）", nếu nhập nguyên giá trị đó thì ảnh không đổi. CSV không gửi được ảnh.',
 '出力だけの列（取込では読まない）。このカテゴリを付けた商品（削除済を除く）の数。': 'Cột chỉ để xuất (không đọc khi nhập). Số sản phẩm (không tính đã xóa) gắn danh mục này.',
 '取込の決まり（上書き／新規・UTF-8・5,000行・エラーの行は取り込まずほかの行を登録）と、画像の注記。': 'Quy tắc nhập (ghi đè / đăng ký mới, UTF-8, 5,000 dòng, dòng lỗi không nhập mà đăng ký các dòng khác) và ghi chú về ảnh.',
 'ファイルを選んだ直後。見本は CSV出力の先頭3行に、1行目の名前を変え（更新の見本）、存在しない ID の行を1つ足したもの（エラーの行の見本）。': 'Ngay sau khi chọn tệp. Mẫu là 3 dòng đầu của xuất CSV, đổi tên của dòng 1 (mẫu cập nhật) và thêm 1 dòng có ID không tồn tại (mẫu dòng lỗi).',
 'AW_PROD_004 の 4 と同じ形（ファイル名・件数・エラーの行・登録する内容・警告）。「登録」でエラー以外の行を登録する。カテゴリ名を変える行に警告は出ない（商品は ID で持つ）。': 'Cùng dạng với mục 4 của AW_PROD_004 (tên tệp, số dòng, dòng lỗi, nội dung sẽ đăng ký, cảnh báo). "登録" đăng ký các dòng không lỗi. Dòng đổi tên danh mục không có cảnh báo (sản phẩm giữ bằng ID).',
 '行番号・キー・列名・内容。内容は 2.x のチェックの文言。': 'Số dòng, khóa, tên cột, nội dung. Nội dung là câu chữ kiểm tra của 2.x.',
 'エラー以外の行を登録し、S03 のトースト（新規 n件・更新 n件）、一覧へ戻る。表示順は1から振り直す。': 'Đăng ký các dòng không lỗi, hiện toast S03 (mới n dòng, cập nhật n dòng), quay về danh sách. Đánh lại thứ tự hiển thị từ 1.',
 '初期データ（商品カテゴリ）': 'Dữ liệu ban đầu (danh mục sản phẩm)',
 'システムに最初から入っている商品カテゴリ（台帳 F・2026-10-05：7つ。最終の名前は「サラダ・果物」「飲料・甘味」に決まった＝受付簿 #257。名前はマスタで運営が変えられる）。画像は見本の絵（photo:…）。': 'Danh mục sản phẩm có sẵn trong hệ thống từ đầu (台帳 F, 2026-10-05: 7 danh mục. Tên cuối cùng đã chốt là "サラダ・果物" và "飲料・甘味" = 受付簿 #257; vận hành có thể đổi tên ở master). Ảnh là hình mẫu (photo:…).',
 '商品カテゴリ（7件）': 'Danh mục sản phẩm (7 dòng)',
 '商品カテゴリID': 'ID danh mục sản phẩm',
 '商品カテゴリ名': 'Tên danh mục sản phẩm',
 '表示順': 'Thứ tự hiển thị',
 '備考': 'Ghi chú'}
_VI_L = {'ヘッダー': 'Đầu trang', 'パンくず': 'Breadcrumb', '画面名': 'Tên màn hình', 'CSV取込': 'Nhập CSV', 'CSV出力': 'Xuất CSV', '新規登録': 'Đăng ký mới', '一覧': 'Danh sách', 'No': 'Số thứ tự', '操作': 'Thao tác', '編集': 'Sửa', '削除': 'Xóa', 'ページ送り': 'Phân trang', '件数': 'Số dòng', '前のページ': 'Trang trước', 'ページ番号': 'Số trang', '次のページ': 'Trang sau', '表示件数': 'Số dòng mỗi trang', '削除の確認モーダル': 'Modal xác nhận xóa', '本文': 'Nội dung', 'キャンセル': 'Nút "キャンセル"', '閉じる': 'Nút "閉じる"', '項目の下のエラー': 'Lỗi dưới mục', '破棄の確認モーダル': 'Modal xác nhận hủy', '破棄': 'Bỏ', 'CSVテンプレートの列（定義。画面には出さない）': 'Các cột của CSV template (định nghĩa; không hiện trên màn hình)', 'ファイルを選ぶ（ステップ1）': 'Chọn tệp (bước 1)', '手順': 'Các bước', '説明': 'Mô tả', 'ファイルを選ぶ': 'Chọn tệp', '確認・登録（ステップ2）': 'Xác nhận, đăng ký (bước 2)', 'エラーの行': 'Dòng lỗi', 'エラー一覧CSV': 'Xuất CSV lỗi', 'ファイルを選び直す': 'Chọn lại tệp', '登録': 'Nút "登録"', '商品カテゴリ一覧': 'Danh sách danh mục sản phẩm', '商品カテゴリ登録・編集': 'Đăng ký / sửa danh mục sản phẩm', '商品カテゴリ CSV取込': 'Nhập CSV danh mục sản phẩm', 'カテゴリ画像': 'Ảnh danh mục', '商品カテゴリID': 'ID danh mục sản phẩm', '商品カテゴリ名': 'Tên danh mục sản phẩm', '登録商品数': 'Số sản phẩm đã đăng ký', '表示順': 'Thứ tự hiển thị', '備考': 'Ghi chú', '削除できないトースト': 'Toast không xóa được', 'ダイアログ': 'Hộp thoại', '画像を拡大': 'Phóng to ảnh', '画像を削除': 'Xóa ảnh', '登録する／保存': 'Nút "登録する" / "保存"', 'ダイアログ（編集）': 'Hộp thoại (sửa)', 'カテゴリ画像ダイアログ': 'Hộp thoại ảnh danh mục'}
_VI_E = {'表示件数|||20件／ページ': 'Số dòng mỗi trang (ví dụ 20 dòng/trang)', '商品カテゴリ名|||主食': 'Tên danh mục (ví dụ "主食" = món chính)', '表示順|||4': 'Thứ tự hiển thị, số nguyên từ 1 (ví dụ 4)', 'カテゴリ画像|||shushoku.png': 'Tên tệp ảnh danh mục (ví dụ ảnh của danh mục món chính)', '備考|||ごはん、丼、カレー、パンなどの主食を分類します。': 'Ghi chú nội bộ mô tả danh mục (ví dụ phân loại cơm, cơm tô, cà ri, bánh mì)', '商品カテゴリID|||CAT00004': 'ID danh mục sản phẩm (CAT + 5 chữ số, ví dụ CAT00004)', 'カテゴリ画像|||photo:主食:83': 'Tên ảnh đã đăng ký trên màn hình (photo:…) (ví dụ photo:主食:83)', '登録商品数|||9': 'Số sản phẩm gắn danh mục này (ví dụ 9; chỉ xuất)', 'ファイルを選ぶ|||商品カテゴリ管理_20261006.csv': 'Tên tệp CSV (ví dụ tệp quản lý danh mục sản phẩm xuất ngày 2026-10-06)'}


_VI_T.update({
    'ダイアログの上部に「保存できません（n件）。赤い項目を確認してください。」の1行だけ（P-FORMBOX。ダイアログの場合の置き場：確認メモ R-H14）。': 'Chỉ 1 dòng 「保存できません（n件）。赤い項目を確認してください。」 ở phần trên của hộp thoại (P-FORMBOX; vị trí khi là hộp thoại: Memo xác nhận R-H14).',
    '形式・サイズ・長い辺（1200px 以内）を外れたファイルは追加しない。縮小せず、選んだ画像のまま保存する。画像は必須（法人Web・アプリの表示に使うため：受付簿 #274）。画像がなければエラー。': 'Không thêm tệp sai định dạng, dung lượng, cạnh dài (trong 1200px). Không thu nhỏ, lưu nguyên ảnh đã chọn. Ảnh là bắt buộc (dùng để hiển thị trên Web pháp nhân và ứng dụng: Sổ tiếp nhận #266). Không có ảnh thì báo lỗi.',
    '削除できるのは登録商品が0件のカテゴリだけ（受付簿 #274。削除済の商品が持つカテゴリはそのまま残す＝削除済の商品のカテゴリは変えない）。0件のときは確認（状態 002）のあと削除して、残りの表示順を1から振り直す。登録商品があるときは確認を出さずに、削除できない旨のモーダル（状態 003・E271）。サーバーでも同じ決まりで止める。': 'Chỉ xóa được danh mục có 0 sản phẩm đăng ký (Sổ tiếp nhận #266. Danh mục mà sản phẩm đã xóa đang giữ thì để nguyên = không đổi danh mục của sản phẩm đã xóa). Khi 0 sản phẩm thì xác nhận (trạng thái 002) rồi xóa và đánh lại thứ tự hiển thị từ 1. Khi có sản phẩm thì không xác nhận mà hiện modal báo không xóa được (trạng thái 003・E271). Phía máy chủ cũng chặn theo cùng quy tắc.',
    '新規の行で必須。画面で登録した画像の名前（photo:…）を書く。画面で上げた画像は「（アップロードした画像）」と出力され、その値のまま取り込むと画像は変わらない。CSV で画像は送れない（新規の行も、画面で先に上げた画像を使う：受付簿 #274）。': 'Bắt buộc ở dòng mới. Ghi tên ảnh đã đăng ký trên màn hình (photo:…). Ảnh tải lên từ màn hình được xuất là "（アップロードした画像）", nhập lại nguyên giá trị đó thì ảnh không đổi. Không gửi ảnh bằng CSV được (dòng mới cũng dùng ảnh đã tải lên trên màn hình trước: Sổ tiếp nhận #274).',
    '登録商品があるカテゴリ（見本の「肉」）のごみ箱を押したとき。確認は出さず、理由のモーダルだけ（商品の AW_PROD_001 状態 023 と同じ形）。': 'Khi nhấn thùng rác của danh mục có sản phẩm đăng ký (mẫu "肉"). Không xác nhận, chỉ modal nêu lý do (cùng dạng với trạng thái 023 của AW_PROD_001 cho sản phẩm).',
    'E271「登録商品が{n}件あるため削除できません。」（確認メモ §4）を、商品の削除できないモーダルと同じ形で出す。「閉じる」だけ。': 'Hiện E271 "登録商品が{n}件あるため削除できません。" (xem Ghi chú xác nhận §4) theo cùng dạng với modal không xóa được của sản phẩm. Chỉ có nút "閉じる".',
    'コードは赤いトーストで出す（宿題）。共通メッセージ E271 の表示場所はトースト（確認メモ §4 の案で合わせる）': 'Code hiện bằng toast đỏ (việc cần sửa). Nơi hiển thị của thông báo chung E271 là toast (sẽ thống nhất theo đề xuất trong Ghi chú xác nhận §4)',
    '商品マスタ管理が CRUD の役割（フル権限・商品開発・システム管理）だけが開ける（ほかの役割は「この画面を見る権限がありません」：受付簿 #273）。列の定義（2.x）は画面には出さない（hong 2026-10-05）。': 'Chỉ vai trò có CRUD ở quản lý master sản phẩm (toàn quyền, phát triển sản phẩm, quản trị hệ thống) mới mở được (vai trò khác thấy "この画面を見る権限がありません": Sổ tiếp nhận #273). Định nghĩa cột (2.x) không hiện trên màn hình (hong 2026-10-05).',
    '7つ：肉・魚・惣菜（上段）／主食・汁物・「サラダ・果物」・「飲料・甘味」（下段）。最終の名前は「サラダ・果物」「飲料・甘味」に決まった（客先確認・hong 回答。名前はマスタで運営が変えられる）': '7 danh mục: thịt, cá, món ăn kèm (hàng trên) / món chính, món canh, "サラダ・果物", "飲料・甘味" (hàng dưới). Tên cuối cùng là "サラダ・果物" và "飲料・甘味" (đã xác nhận với khách, hong trả lời). Tên có thể đổi trong master bởi vận hành.',
    'カテゴリ画像は必須か。削除できる条件は': 'Ảnh danh mục có bắt buộc không? Điều kiện xóa là gì',
    '画像は必須（法人Web・アプリの表示に使うため）。CSV の新規行も画像が要る（画面で先に上げた画像を使う）。削除は登録商品が0件のカテゴリだけ。削除済の商品が持つカテゴリはそのまま残す': 'Ảnh là bắt buộc (dùng để hiển thị trên Web pháp nhân và ứng dụng). Dòng mới trong CSV cũng cần ảnh (dùng ảnh đã tải lên trên màn hình trước). Chỉ xóa được danh mục có 0 sản phẩm đăng ký. Danh mục mà sản phẩm đã xóa đang giữ thì để nguyên',
})

_VI_L.update({
    'エラーの枠': 'Khung lỗi',
    '削除できないモーダル': 'Modal không xóa được',
})

_VI_T.update({
    'モーダルを閉じる。何も変えない。': 'Đóng modal. Không thay đổi gì.',
})

import re as _re
_AUTO = [
    (_re.compile(r"^(AW_PROD_\d+) の (\S+) と同じ（表示だけ）。$"), lambda m: "Giống mục %s của %s (chỉ hiển thị)." % (m.group(2), m.group(1))),
    (_re.compile(r"^項目の決まりは (AW_PROD_\d+) の (\S+) を参照（ここは表示だけ）。$"), lambda m: "Quy tắc các mục xem mục %s của %s (ở đây chỉ hiển thị)." % (m.group(2), m.group(1))),
    (_re.compile(r"^画面の項目 (\S+) と同じ。$"), lambda m: "Giống mục %s trên màn hình." % m.group(1)),
]


def _fill_vi():
    def t(ja):
        if ja in _VI_T:
            return _VI_T[ja]
        for rx, fn in _AUTO:
            m = rx.match(ja)
            if m:
                return fn(m)
        return ""

    def pair(p):
        if isinstance(p, (list, tuple)) and len(p) > 1 and p[0] and not p[1]:
            return [p[0], t(p[0])]
        return p
    for k in ("TITLE", "SHEET", "CODE_NOTE"):
        v = globals().get(k)
        if v:
            globals()[k] = pair(v)
    if not SYSTEM.get("vi"):
        SYSTEM["vi"] = _VI_T.get(SYSTEM["ja"], "")
    for s in SCREENS:
        if not s["vi"]:
            s["vi"] = _VI_L.get(s["ja"], "")
    for d in DECISIONS:
        d["q"] = pair(d["q"]); d["a"] = pair(d["a"])
    for v in VIEWS:
        v["state"] = pair(v["state"])
        if v.get("note"):
            v["note"] = pair(v["note"])
        for it in v["items"]:
            if not it["vi"]:
                it["vi"] = _VI_L.get(it["ja"], "")
            for k in ("detail", "init", "cond", "valid", "demo_ok", "open"):
                if it.get(k):
                    it[k] = pair(it[k])
            ex = it.get("ex")
            if ex and ex[0] and not ex[1]:
                it["ex"] = [ex[0], _VI_E.get(it["ja"] + "|||" + ex[0], "")]
    for sh in globals().get("SHEETS", []):
        sh["name"] = pair(sh["name"]); sh["note"] = pair(sh["note"])
        for tb in sh["tables"]:
            tb["title"] = pair(tb["title"])
            for h in tb["head"]:
                h[0] = pair(h[0])


_fill_vi()
