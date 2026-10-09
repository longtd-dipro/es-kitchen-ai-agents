# -*- coding: utf-8 -*-
"""
画面設計書のデータのひな形（1ファイル＝1機能＝Excel の1シート）。
作業フォルダの「データ/<ScreenCode頭>_<機能名>.py」としてコピーして使う（例：AW_PLAN_プランマスタ.py）。
キーの説明の詳細は references/data_format.md。

■ 項目（items の1行）のキー
  no      番号。"8" は大項目（エリア）、"8.1" は小項目。同じ機能の中で通し番号。振り直さない（増えたら末尾）
  ja/vi   項目名（日本語・ベトナム語。両方必須。まず ja だけ書き、vi は "" で置いて最後にまとめて翻訳する）
  sel     デモの中の場所（CSS セレクタ。"セレクタ::文字"（例 "button::検索"）はその文字を含む要素、"input@3" は見えている input の3番目
          （DateInput は input が2つ＝見える文字入力＋カレンダー用の隠し date。隠しものは数えない）、末尾 "^" は1つ上）。"-"＝画面にない項目（CSV の列の定義など。番号は画像に置かず、項目定義にだけ出る）
  kind    種類：area button link text textarea select month date check radio table label tab toast file modal card
  trig    トリガー：click select input view check show upload
  req     必須：○／－／条件付き
  len     型・桁数（"文字列 120" など。訳しきれない日本語があれば [ja, vi]）
  init    初期値 [ja, vi]
  ex      データ例 [例の値, giải thích tiếng Việt]  ← 入力項目（text・select など）は必須
  cond    表示・活性の条件 [ja, vi]
  valid   バリデーション [ja, vi]
  err     メッセージ・メールの ID（データ/_共通_メッセージ.py の鍵）
  detail  詳細 [ja, vi]
  pattern 共通パターンの ID（データ/_共通パターン.py の鍵）。詳細にはパターンと違うところだけ書く
  fid     デモの入力欄の id（あればデモの項目名・必須表示・選択肢・最大文字数を読み取って突き合わせる）
  --- 未確認の扱い（作る前にユーザーに確認する。references/confirm_flow.md）
  chk     まだ決まっていないこと [ja, vi]。残っていると make.py は作らない
  open    ユーザーが「お客様に聞く」と決めたこと [ja, vi]。作れるが OPEN シートに出る。ask に確認先
  ask     open の確認先（例 "お客様（営業）"）
  demo_ok デモと仕様が違うが仕様が正しいと確認済み [ja, vi]（デモを直す宿題）。デモとの自動の差を止めない

■ 状態（VIEWS の1つ）のキー
  id／code／state [ja, vi]／setup（デモをこの状態にする JavaScript）／full（True＝ページ全体）／hide／note [ja, vi]／wait
  url     本物の Web を元にするときだけ：その状態の URL（/ops/masters/plans など。DEMO_FILE の URL に続ける）
  login   本物の Web：この状態だけ別のアカウントで撮る（例 "CU00871"＝拠点アカウント。省略時は LOGIN）
  today   本物の Web：この状態だけデモの「今日」を変えて撮る（例 "2026/10/10"。デモのビルドだけ。撮り終わると日付を戻し、データも見本に戻す）
          機能の撮影の始めにもデータを見本に戻す（RESET_FIRST = False で止められる）。日付を変える状態は、その機能の最後の方に置くと前の状態に影響しない

■ 元にするもの（DEMO_FILE）
  デモ（HTML 1ファイル）  … "02_デモ/部品/XX_XXX.html"。状態は setup で作る
  本物の Web（開発中のコード）… "http://localhost:3000"（npm run dev で動かしておく）。状態ごとに url を書く。
                                ログインは LOGIN = {"site": "ops", "loginId": "Ad00010"}（site の省略時は SITE。パスワードは不要）
                                setup は async で動く（await 可）。例："document.querySelector('button.save').click(); await new Promise(r => setTimeout(r, 300));"
"""

TITLE = ["〇〇（XX_XXX）", "〇〇 (XX_XXX)"]
SHEET = ["〇〇", "〇〇"]                         # Excel のシート名（31文字まで）。省略時は TITLE
BASENAME = "画面設計書_XX_XXX_〇〇"
IMG_PREFIX = "XX_XXX"
OUT_DIR = "XX_XXX_〇〇"
CODE_NOTE = ""                                   # Screen Code の付け方の注記（[ja, vi] も可）
SITE = "ops"                                     # corp（法人・拠点）／ops（運営）／driver／carrier／supplier／warehouse → メッセージの文言が決まる
SYSTEM = {"ja": "運営管理者Web", "vi": "Web quản trị vận hành"}
AUTHOR = "Claude／確認：〇〇"
CREATED = "2026-10-03"
DEMO_FILE = "02_デモ/部品/XX_XXX.html"            # プロジェクトのフォルダから。本物の Web なら "http://localhost:3000"
# LOGIN = {"site": "ops", "loginId": "Ad00010"}  # 本物の Web のときだけ（ログインしてから撮る）
# CODE_PATHS = ["app/ops/masters/plans", "lib/domain/seed"]  # 本物の Web：この機能のコード。ここが変わらない限り撮り直さない（省略時は app・lib・components 全体）

# ユーザーに確認して決めたこと（Excel の「確認ログ」シートに出る）
DECISIONS = [
    # {"date": "2026-10-03", "target": "XX_XXX_001 No.1.1",
    #  "q": ["キーワードは部分一致か前方一致か", "Từ khóa: khớp một phần hay khớp đầu"],
    #  "a": ["部分一致", "Khớp một phần"], "src": "hong 回答 2026-10-03"},
]

# 改訂履歴（開発に渡した後に直したら、版ごとに1行ずつ。make.py --release が前回の版と比べ、書き漏れがあれば止める）
#   no: 項目No（複数ならリスト）。機能ごと追加したときは "*"
#   type: 追加／変更／削除。変更は before・after を書く。impact＝開発への影響（実装済みなら何を直すか）
CHANGES = [
    # {"ver": "1.1", "date": "2026-10-08", "no": "1.1", "type": "変更",
    #  "before": ["100文字", "100 ký tự"], "after": ["60文字", "60 ký tự"],
    #  "reason": ["入力の共通基準（1行は60文字）", "Chuẩn chung: ô 1 dòng tối đa 60"],
    #  "impact": ["最大文字数とメッセージ E04 の数字を変える", "Đổi maxLength và số trong thông báo E04"]},
]

HIDE_ALWAYS = ["#switch"]
STATIC_CSS = ".gnav{position:static!important}#foot{position:relative!important}"
VIEWER_CSS = ".gnav{position:static!important}"

SCREENS = [
    {"code": "XX_XXX_001", "ja": "〇〇一覧", "vi": "Danh sách 〇〇"},
]

VIEWS = [
    {"id": "001", "code": "XX_XXX_001", "state": ["初期表示", "Hiển thị ban đầu"],
     "setup": "", "full": True, "note": ["", ""],        # 本物の Web なら "url": "/ops/masters/plans" を足す
     "items": [
         {"no": "1", "ja": "検索エリア", "vi": "Khu vực tìm kiếm", "sel": ".search", "kind": "area", "trig": "view", "pattern": "P-LIST"},
         {"no": "1.1", "ja": "キーワード", "vi": "Từ khóa", "sel": "#q", "kind": "text", "trig": "input", "req": "－",
          "len": "文字列 100", "ex": ["ESライト", "Tên gói \"ES Light\" (chữ Nhật + Latin)"],
          "detail": ["プラン名を部分一致で探す。", "Tìm tên gói theo khớp một phần."], "err": ["E04"]},
     ]},
]
