/*
 * 法人・拠点・子契約の詳細画面の定義（タブ・カード・項目・表と、見本の初期値）。
 * 元：12_運営_法人拠点契約.html の s-co（法人情報編集）・s-br（拠点情報編集）・s-ct（契約情報編集（子契約））を
 *     そのまま写したもの（項目名・選択肢・初期値・説明・物理名を変えない）。
 * 初期値は見本（CU00001・CU00643・CP0000001-202607）の値。ほかの行は Corp.form などで違うところだけ上書きする。
 */
import type { FormDef } from './types';

/** 47都道府県 */
export const PREFS = ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県", "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県", "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"];

export const CORP_FORM: FormDef = {
  title: "法人情報編集", sample: "CU00001",
  sum: [{"k": "法人ID", "v": "CU00001"}, {"k": "法人名", "v": "株式会社サンプル"}, {"k": "ステータス", "v": "正式登録"}, {"k": "請求書発行リードタイム", "v": "1ヶ月前（−1）"}, {"k": "請求書の発行単位", "v": "まとめて発行"}, {"k": "配下の拠点", "v": "5拠点"}],
  tabs: [
    { label: "基本情報", cards: [
      { title: "基本情報", body: [
        { t: 'fields', fields: [
          { name: "法人名", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "ESで管理する法人の名称。画面・一覧の表示に使う。新規登録時の運営承認は不要（通知のみ）", meta: {"code": "name", "type": "varchar(120)"}, ctl: { t: "input", v: "株式会社サンプル" } },
          { name: "法人名（契約）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "契約書に記載する法人名。法人名と違うことがあるため別に持つ。空のときは法人名を使う", meta: {"code": "contract_name", "type": "varchar(120)"}, ctl: { t: "input", v: "株式会社サンプルホールディングス" } },
          { name: "法人名フリガナ", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "カタカナ統一", meta: {"code": "name_kana", "type": "varchar(120)"}, ctl: { t: "input", v: "カブシキガイシャサンプル" } },
          { name: "請求先法人名", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "請求書の宛名に使う法人名。契約の法人名と請求先の法人名が違うことがあるため別に持つ。空のときは法人名（契約）→法人名の順で使う", meta: {"code": "bill_to_name", "type": "varchar(120)"}, ctl: { t: "input", v: "株式会社サンプル 経理部" } },
          { name: "ES営業担当", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "運営のユーザーから選ぶ（一覧で担当者ごとに絞り込むため。2026/09/29 決定で、フリーテキストから変更）。申込管理の代理入力・受付で入れた担当者がここに入る", meta: {"code": "sales_staff_user_id", "type": "bigint"}, ctl: { t: "select", v: "田中 健一", opts: ["田中 健一", "佐々木 桜", "井上 悠"] } },
          { name: "社内備考", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "社内運用のためのフリーテキスト。法人には出さない", meta: {"code": "internal_note", "type": "text"}, ctl: { t: "textarea", v: "パートナーズ経由。決裁は本社経理。", rows: 2 } },
          { name: "法人ID", mark: "req", tags: [{"cls": "pn", "text": "P2新"}], phase: "new", rop: true, note: "CU ＋ 連番（例：CU00001）。桁は固定せず伸びてよい。【2026/09/29：法人Webのログインは担当者ごとではなく、この法人ID（法人アカウント）を法人の担当者で共有する】【2026/09/29 決定 28-145：新規の申込では、受付・仮登録で拠点アカウントといっしょに法人アカウントも発行し、法人のメイン・サブ・請求担当者へログイン案内を送る】", meta: {"code": "company_id / company_code", "type": "bigserial / varchar(20)"}, ctl: { t: "input", v: "CU00001" } },
          { name: "法人ステータス", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "仮登録／正式登録／休眠【2026/09/29 決定 28-146：仮登録の間は、法人・契約の画面では編集できない（参照だけ）。編集は契約申請管理の申請詳細（詳細情報設定）で行い、拠点を確定（本登録）したあとはこの画面で編集する】", meta: {"code": "status", "type": "varchar(20)"}, ctl: { t: "input", v: "正式登録" } },
        ] },
      ] },
      { title: "住所（請求書に載る住所）", body: [
        { t: 'fields', fields: [
          { name: "郵便番号（請求書に載る住所）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, note: "ハイフンあり・なしどちらでも受ける。横の「住所検索」ボタンで以下を自動入力", meta: {"code": "zip", "type": "varchar(8)"}, ctl: { t: "zip", v: "105-0011" } },
          { name: "都道府県（請求書に載る住所）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, note: "47都道府県からドロップダウンで選ぶ（自由入力にしない）。住所検索で入った値もこの選択肢に合わせる", meta: {"code": "pref", "type": "varchar(10)"}, ctl: { t: "select", v: "東京都", opts: PREFS } },
          { name: "市区町村（請求書に載る住所）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, meta: {"code": "city", "type": "varchar(60)"}, ctl: { t: "input", v: "港区" } },
          { name: "町名・番地（請求書に載る住所）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, meta: {"code": "addr1", "type": "varchar(120)"}, ctl: { t: "input", v: "芝公園2-4-1" } },
          { name: "建物等（請求書に載る住所）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, meta: {"code": "addr2", "type": "varchar(120)"}, ctl: { t: "input", v: "芝パークビル8F" } },
          { name: "電話番号（請求書に載る住所）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, meta: {"code": "tel", "type": "varchar(20)"}, ctl: { t: "input", v: "03-5401-2200" } },
          { name: "FAX番号（請求書に載る住所）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, meta: {"code": "fax", "type": "varchar(20)"}, ctl: { t: "input", v: "03-5401-2201" } },
        ] },
      ] },
      { title: "担当者（テーブル）", body: [
        { t: 'table', cols: [{"label": "区分"}, {"label": "担当者名"}, {"label": "フリガナ"}, {"label": "メールアドレス"}, {"label": "電話番号（担当者）"}, {"label": "操作", "ops": true}], rows: [
          {"c": [{"t": "sel", "v": "メイン担当者", "opts": ["メイン担当者", "請求担当者", "サブ担当者"]}, {"t": "in", "v": "佐藤 誠"}, {"t": "in", "v": "サトウ マコト"}, {"t": "in", "v": "sato@sample.co.jp"}, {"t": "in", "v": "03-5401-2200"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "請求担当者", "opts": ["メイン担当者", "請求担当者", "サブ担当者"]}, {"t": "in", "v": "高橋 由紀"}, {"t": "in", "v": "タカハシ ユキ"}, {"t": "in", "v": "takahashi@sample.co.jp"}, {"t": "in", "v": "03-5401-2210"}, {"t": "del"}]},
        ] },
        {"t": "add"},
      ] },
      { title: "アカウント", chip: "法人", body: [
        { t: 'fields', fields: [
          { name: "ログインID（法人ID）", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "法人で1つ（法人アカウント）。ご担当者の皆さまで共有し、担当者ごとには発行しない（2026/09/29）。受付・仮登録でアカウントの発行を選ぶと、拠点アカウントと一緒に発行（28-145）", meta: {"code": "account.login_id", "type": "varchar(40)"}, ctl: { t: "input", v: "CU00001" } },
          { name: "アカウントのステータス", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, note: "未発行／発行済（ログイン前）／ログイン済／参照のみ（全拠点の解約後〜最後の請求書の入金期限）／停止中。参照のみ・停止中は自動（入金期限の翌日に停止：S4-3）。運営が「停止」すると停止中（決定 S7-13・基本設計 §5-1）", meta: {"code": "account.status", "type": "varchar(20)"}, ctl: { t: "input", v: "ログイン済", s7c: "st" } },
          { name: "最終ログイン日時", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], rop: true, meta: {"code": "account.last_login_at", "type": "timestamptz"}, ctl: { t: "input", v: "2026年10月5日 08:40:00" } },
          { name: "アカウントの操作", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "パスワード再設定：法人のメイン担当者に認証コード（有効期限5分）の案内を送る（ふだんは法人Web のログイン画面から本人が行う。運営は依頼を受けたとき）。ログイン案内の再送：メール一覧 M2 と同じ宛先（法人のメイン・サブ・請求担当者。同じ人は1通）。停止：ログインできなくする（確認あり。停止中は「アカウントの再開」）。どれも変更履歴に残す", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "パスワード再設定", "act": "pw"}, {"label": "ログイン案内の再送", "act": "resend"}, {"label": "アカウントの停止", "act": "stop"}] } },
        ] },
      ] },
    ] },
    { label: "請求", cards: [
      { title: "請求条件", body: [
        { t: 'fields', fields: [
          { name: "請求書発行リードタイム", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "サイクル月に対して、どの月に請求書を出すかを選ぶ：3ヶ月前（−3）／2ヶ月前（−2）／1ヶ月前（−1）／当月（0）／翌月（+1・後払い）。既定は 1ヶ月前（−1）。請求月 ＝ サイクル月 ＋ この値（例：サイクル月 2026-09 → −2 なら 2026年7月、0 なら 9月、+1 なら 10月）。【2026/09/29：数字入力（ヶ月前請求）から選択式に変更。当月・翌月（後払い）も選べる】【年一括は支払サイクル＝年払いで表す】【2026/09/29 hong：新規の申込で法人が選ぶ（既定 1ヶ月前）。申込後は法人は参照のみ】", meta: {"code": "billing_lead_months", "type": "smallint (-3〜+1)"}, ctl: { t: "select", v: "1ヶ月前（−1）", opts: ["3ヶ月前（−3）", "2ヶ月前（−2）", "1ヶ月前（−1）", "当月（0）", "翌月（+1・後払い）"] } },
          { name: "請求書の発行単位", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "まとめて発行（法人1通）／拠点ごと発行。【2026/09/28：法人は参照のみ。法人情報の変更申請の入口ができるまでは、お問い合わせで受けて運営が直す（以前は「法人から変更申請でき、運営承認が必須」）。発行単位そのものを廃止するかは未決】", meta: {"code": "invoice_unit", "type": "varchar(10)"}, ctl: { t: "select", v: "まとめて発行（法人1通）", opts: ["まとめて発行（法人1通）", "拠点ごと発行"] } },
          { name: "支払方法", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "口座振替／銀行振込／クレジットカード。【2026/09/28：クレジットカードも残す（9/15 の「口座振替／銀行振込」から変更）】顧客は参照のみ。【請求先＝法人 の拠点にだけ使う】", meta: {"code": "pay_method", "type": "varchar(20)"}, ctl: { t: "select", v: "口座振替", opts: ["口座振替", "銀行振込", "クレジットカード"] } },
          { name: "口座振替の手続きステータス", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "【2026/09/23 決定 6C／2026/09/28 追補で変更】未手続き／手続き中／完了。支払方法は法人から変更申請できない（参照のみ）。運営が支払方法を口座振替に変えたときに使い、完了になるまでは請求書にお振込と印字して振込先を載せる（請求は止めない）。完了になった次の請求書から口座振替の記載になる", meta: {"code": "debit_setup_status", "type": "varchar(12)"}, ctl: { t: "select", v: "完了", opts: ["未手続き", "手続き中", "完了"] } },
          { name: "支払サイクル", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "月払い／年払い。顧客は参照のみ。【請求先＝法人 の拠点にだけ使う】【2026/09/29 hong：新規の申込で法人が選ぶ（既定 月払い・前払い）】", meta: {"code": "pay_cycle", "type": "varchar(20)"}, ctl: { t: "select", v: "月払い", opts: ["月払い", "年払い"] } },
          { name: "起算月（年払いのとき）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "yyyy-mm をドロップダウンで選ぶ。【支払サイクル＝年払い のときだけ活性】12サイクル分をまとめて1通で請求する最初のサイクル月（2026/09/29：子契約の「前払いの単位」「起算月」から移した）", meta: {"code": "anchor_month", "type": "char(7)"}, ctl: { t: "select", v: "—", opts: ["—", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"] } },
          { name: "入金期限", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "請求月（請求書を送付する月）の27日／請求月の翌月27日 から選ぶ。前払い分も実績精算分も、1枚の請求書に入金期限は1つ。口座振替・クレジットの引き落とし日もこの日付。【2026/09/29 決定：2026/09/25 の固定ルール（サイクル月の前月末・送付月の月末）から変更】", meta: {"code": "due_rule", "type": "varchar(12)"}, ctl: { t: "select", v: "請求月の27日", opts: ["請求月の27日", "請求月の翌月27日"] } },
          { name: "Bill One 発行先ID", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "【請求先＝法人 の拠点にだけ使う】", meta: {"code": "billone_payer_id", "type": "varchar(40)"}, ctl: { t: "input", v: "BO-778201" } },
          { name: "拠点の請求先を一括変更", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "【2026/09/28 決定・運営だけ】押すとダイアログで配下の拠点を一覧表示し、拠点ごとに請求先（法人／この拠点）を選び直して一度に保存する。保存すると各拠点の「請求先」が変わる（持ち主は拠点のまま）。法人なし拠点は出さない。発行済みの請求書はそのままで、まだ発行していない請求書から新しい請求先になる（追補 28-6）。法人Webには出さない", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "拠点の請求先を一括変更"}] } },
        ] },
      ] },
      { title: "一覧（発行した請求書）", body: [
        { t: 'table', cols: [{"label": "請求書番号"}, {"label": "発行日"}, {"label": "請求月"}, {"label": "請求先"}, {"label": "対象拠点数"}, {"label": "固定額（前払い）"}, {"label": "前払いの対象"}, {"label": "実績精算（後払い）"}, {"label": "実績精算の対象"}, {"label": "消費税"}, {"label": "請求金額（税込）"}, {"label": "入金期限"}, {"label": "請求書ステータス"}], rows: [
          {"c": ["INV-2026100001", "2026/10/01", "2026-10", "法人", "2拠点", "80,500円", "2026-11 サイクル分", "2,600円", "2026/08/21〜09/20", "7,980円", "181,080円（再請求 90,000円 を含む）", "2026/10/27", "発行済"]},
          {"c": ["INV-2026090001", "2026/09/01", "2026-09", "法人", "2拠点", "80,500円", "2026-10 サイクル分", "4,820円", "2026/07/21〜08/20", "8,158円", "93,478円", "2026/09/27", "発行済"]},
          {"c": ["INV-2026080001", "2026/08/01", "2026-08", "法人", "2拠点", "80,500円", "2026-09 サイクル分", "1,600円", "2026/06/21〜07/20", "7,900円", "90,000円", "2026/08/27", "発行済（未入金・INV-2026100001 で再請求）"]},
        ] },
        { t: 'fields', fields: [
          { name: "請求書詳細を開く", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "請求書番号を押すと請求書詳細の画面を開く（請求書の情報・請求金額・明細＝費目・対象・数量・税抜金額・税率、小計・消費税・請求金額）。拠点の画面から開いたときは、法人あての請求書でもその拠点の分だけを出す。【2026/09/29 hong：請求書の発行・PDF は Bill One で行うため、システムでは PDF の表示・ダウンロードはしない（旧「請求書の表示・ダウンロード」）。原本は Bill One からのメールで受け取る】", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "請求書詳細を開く"}] } },
        ] },
      ] },
    ] },
    { label: "拠点・契約一覧", cards: [
      { title: "一覧", body: [
        { t: 'table', cols: [{"label": "拠点ID"}, {"label": "拠点名"}, {"label": "拠点ステータス"}, {"label": "親契約番号"}, {"label": "契約種別"}, {"label": "契約ステータス"}, {"label": "当月の適用プラン"}, {"label": "請求月（前払い）"}, {"label": "当月請求額"}, {"label": "子契約 件数"}], rows: [
          {"c": ["CU00643", "株式会社サンプル", "本登録", "CP0000001", "本導入", "有効", "100プラン", "2026年9月", "53,000円", "9件"]},
          {"c": ["CU00871", "株式会社サンプル 大阪支店", "本登録", "CP0000002", "本導入", "有効", "50プラン", "2026年9月", "27,500円", "7件"]},
          {"c": ["CU00902", "株式会社サンプル 名古屋営業所", "本登録", "CP0000003", "本導入", "有効", "—（10/12 から休止）", "—", "—", "2件"]},
          {"c": ["CU00961", "株式会社サンプル 千葉営業所", "本登録", "CP0000006", "本導入", "有効", "50プラン", "2026年9月", "24,500円", "6件"]},
          {"c": ["CU00950", "株式会社サンプル 横浜営業所", "本登録", "CP0000004", "本導入", "有効", "100プラン", "2026年9月", "49,500円", "5件"]},
        ] },
      ] },
    ] },
    { label: "変更履歴", ops: true, cards: [
      { title: "履歴（配下の拠点・契約の参照）", ops: true, body: [
        { t: 'table', cols: [{"label": "変更日時", "ops": true}, {"label": "対象", "ops": true}, {"label": "対象名", "ops": true}, {"label": "変更内容", "ops": true}, {"label": "変更者", "ops": true}, {"label": "適用範囲", "ops": true}, {"label": "承認者", "ops": true}, {"label": "通知の有無", "ops": true}], rows: [
          {"c": ["2026/09/19 10:05", "拠点", "CU00643", "休止の予定を登録（2026-12〜2027-02・3サイクル・設備は置いたまま。CH-20260918-0001）", "運営 井上", "2026-12 以降すべて", "井上 悠", "要"]},
          {"c": ["2026/07/10 14:02", "子契約", "CP0000001-202607", "資材ボックス《仕切り皿》を1箱追加貸出（LN-0002 1→2）", "運営 佐藤", "2026-07 のみ", "—", "—"]},
          {"c": ["2026/04/10 11:20", "子契約", "CP0000001-202605", "納品回数「ES配送便 1回」→「ES配送便 2回」", "運営 佐藤", "2026-05 以降すべて", "部長 中村", "要"]},
          {"c": ["2026/02/12 15:02", "親契約", "CP0000001", "契約ステータス「仮登録」→「有効」（本登録）", "システム", "2026-03 以降すべて", "—", "—"]},
        ] },
      ] },
    ] },
  ],
};

export const BRANCH_FORM: FormDef = {
  title: "拠点情報編集", sample: "CU00643",
  sum: [{"k": "拠点ID", "v": "CU00643"}, {"k": "拠点名", "v": "株式会社サンプル"}, {"k": "所属法人", "v": "CU00001 株式会社サンプル"}, {"k": "請求先", "v": "法人"}, {"k": "拠点ステータス", "v": "本登録"}, {"k": "当月請求額", "v": "53,000円", "ops": true}],
  tabs: [
    { label: "基本情報", cards: [
      { title: "基本情報", chip: "拠点", body: [
        { t: 'fields', fields: [
          { name: "拠点名", mark: "req", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}], rop: false, input: true, meta: {"code": "name", "type": "varchar(120)"}, ctl: { t: "input", v: "株式会社サンプル" } },
          { name: "拠点名フリガナ", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ap", "text": "承認必須"}], phase: "chg", rop: false, input: true, note: "カタカナ統一", meta: {"code": "name_kana", "type": "varchar(120)"}, ctl: { t: "input", v: "カブシキガイシャサンプル" } },
          { name: "所属法人", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, note: "法人ID＋法人名（参照のみ）。編集では変えられない。変えられるのはシステム管理だけの別操作「所属法人の付け替え」（詳細のボタン。台帳 F 2026-10-06）。法人なしの拠点は「（法人なし）」", meta: {"code": "company_id", "type": "bigint"}, ctl: { t: "input", v: "CU00001 株式会社サンプル" } },
          { name: "所属法人の付け替え", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "システム管理だけ"}], phase: "new", rop: false, input: true, note: "編集とは別の操作（画面の「保存」には含めない）。押して確認すると、その場で保存される。発行済み・確定済みの請求書がない／承認待ちの申請がない拠点だけ。請求先・請求条件は新しい法人のものに直し、変更履歴に残す", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "所属法人の付け替え", "act": "reassign"}] } },
          { name: "従業員数", mark: "cond", tags: [{"cls": "p1", "text": "P1"}], rop: false, input: true, meta: {"code": "employee_count", "type": "integer"}, ctl: { t: "input", v: "100" } },
          { name: "当初契約開始年月", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "最初に契約した日。【2026/09/30 要件シート行107】データ移行では旧ESの契約開始日を取り込む（移行した日ではない。親契約の契約開始日は移行時点の日付になるため・28-175）。プラン変更・移行でリセットしない。拠点一覧の「契約開始年月」「継続年月」はこの日から計算する。運営だけが直せる", meta: {"code": "original_start_on", "type": "date"}, ctl: { t: "input", v: "2026/02/23" } },
          { name: "拠点ステータス", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: false, input: true, note: "仮登録／本登録／閉鎖予定／閉鎖。休止は拠点に持たず、契約ステータスの「利用休止」で表す。先の状態にだけ変えられる（閉鎖予定→本登録は可・E118）。【申請の承認で動く（2026/09/29 決定）】解約＝承認と同時に「閉鎖予定」、解約日に「閉鎖」【2026/09/29 決定 28-146：仮登録の間は、法人・契約の画面では編集できない（参照だけ）。編集は契約申請管理の申請詳細（詳細情報設定）で行い、拠点を確定（本登録）したあとはこの画面で編集する】", meta: {"code": "status", "type": "varchar(20)"}, ctl: { t: "select", v: "本登録", opts: ["仮登録", "本登録", "閉鎖予定", "閉鎖"] } },
          { name: "備考", mark: "cond", tags: [{"cls": "p1", "text": "P1"}], rop: false, input: true, note: "お客様要望など", meta: {"code": "note", "type": "text"}, ctl: { t: "textarea", v: "8F 社員食堂横に設置", rows: 2 } },
          { name: "棚卸報告", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "棚卸をしない拠点は「なし（棚卸なし）」。管理ロスを出さない・点検の督促（未申告・事務手数料）を出さない。請求の在庫管理・実績精算では差分率の代わりに「棚卸なし」と出る【2026/10/02 決定 課題 2-1：拠点ごと】", meta: {"code": "no_stock_check", "type": "boolean"}, ctl: { t: "select", v: "あり", opts: ["あり", "なし（棚卸なし）"] } },
          { name: "基準数のパターン", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "通常／短消費期限なし。短消費期限なしの拠点は、消費期限の短い商品をデフォルト注文に入れず「短消費期限なし基準注文数」を使う。料金は変わらない。【2026/10/02 決定 REQ-CT-300：契約（申込）の時に決め、変更は運営だけ。法人Web の注文の設定では変えられない】自販機（ESライト（自販機））は自販機の基準数を使うため、この値は使わない", meta: {"code": "order_pref.allow_short_life", "type": "boolean"}, ctl: { t: "select", v: "通常", opts: ["通常", "短消費期限なし"] } },
          { name: "拠点ID", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}], phase: "chg", rop: true, note: "CU ＋ 連番（例：CU00643）。桁は固定せず伸びてよい。QR運用はこの拠点IDから生成する", meta: {"code": "branch_id / branch_code", "type": "bigserial / varchar(20)"}, ctl: { t: "input", v: "CU00643" } },
          { name: "旧ES ユーザーID", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: true, note: "フェーズ1（旧ESステーション）のユーザーID（例：ES000001）。移行時に取り込み、画面では参照のみ。拠点一覧で検索でき、CSV出力に含める。【表示ラベルは必ず「旧ES ユーザーID」とし、新しいプランID（ES＋6桁）と区別する】経理の金額照合に使う。【2026/09/30 要件シート行161】", meta: {"code": "legacy_user_id", "type": "varchar(20)"}, ctl: { t: "input", v: "—（フェーズ2から新規のお客様のため なし）" } },
        ] },
      ] },
      { title: "住所", chip: "拠点", body: [
        { t: 'fields', fields: [
          { name: "郵便番号", mark: "req", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}], rop: false, input: true, note: "ハイフンあり・なしどちらでも受ける。横の「住所検索」ボタンで以下を自動入力", meta: {"code": "zip", "type": "varchar(8)"}, ctl: { t: "zip", v: "105-0011" } },
          { name: "都道府県", mark: "req", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}], rop: false, input: true, note: "47都道府県からドロップダウンで選ぶ（自由入力にしない）。住所検索で入った値もこの選択肢に合わせる", meta: {"code": "pref", "type": "varchar(10)"}, ctl: { t: "select", v: "東京都", opts: PREFS } },
          { name: "市区町村", mark: "req", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}], rop: false, input: true, meta: {"code": "city", "type": "varchar(60)"}, ctl: { t: "input", v: "港区" } },
          { name: "町名・番地", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ap", "text": "承認必須"}], phase: "chg", rop: false, input: true, note: "【住所を変更すると、以後に生成される配送データへ反映される。生成済み・納品済みの配送データは納品日時点の住所を保持する（契約・子契約は住所を持たない）】", meta: {"code": "addr1", "type": "varchar(120)"}, ctl: { t: "input", v: "芝公園2-4-1" } },
          { name: "建物等", mark: "cond", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}], rop: false, input: true, meta: {"code": "addr2", "type": "varchar(120)"}, ctl: { t: "input", v: "芝パークビル8F" } },
          { name: "電話番号", mark: "req", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}], rop: false, input: true, meta: {"code": "tel", "type": "varchar(20)"}, ctl: { t: "input", v: "03-5401-2200" } },
          { name: "FAX番号", mark: "cond", tags: [{"cls": "p1", "text": "P1"}], rop: false, input: true, meta: {"code": "fax", "type": "varchar(20)"}, ctl: { t: "input", v: "03-5401-2201" } },
        ] },
      ] },
      { title: "担当者（テーブル）", chip: "拠点", body: [
        { t: 'table', cols: [{"label": "区分"}, {"label": "担当者名"}, {"label": "フリガナ"}, {"label": "メールアドレス"}, {"label": "電話番号（担当者）"}, {"label": "操作", "ops": true}], rows: [
          {"c": [{"t": "sel", "v": "メイン担当者", "opts": ["メイン担当者", "請求担当者", "サブ担当者"]}, {"t": "in", "v": "田村 直子"}, {"t": "in", "v": "タムラ ナオコ"}, {"t": "in", "v": "tamura@sample.co.jp"}, {"t": "in", "v": "03-5401-2200"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "請求担当者", "opts": ["メイン担当者", "請求担当者", "サブ担当者"]}, {"t": "in", "v": "高橋 由紀"}, {"t": "in", "v": "タカハシ ユキ"}, {"t": "in", "v": "takahashi@sample.co.jp"}, {"t": "in", "v": "03-5401-2210"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "サブ担当者", "opts": ["メイン担当者", "請求担当者", "サブ担当者"]}, {"t": "in", "v": "小川 翔"}, {"t": "in", "v": "オガワ ショウ"}, {"t": "in", "v": "ogawa@sample.co.jp"}, {"t": "in", "v": "03-5401-2211"}, {"t": "del"}]},
        ] },
        {"t": "add"},
      ] },
      { title: "アカウント", chip: "拠点", body: [
        { t: 'fields', fields: [
          { name: "ログインID", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: true, note: "本登録（ステップ1完了）時に自動発行。【2026/09/29：拠点ごとに1つ（拠点アカウント）。その拠点の担当者の皆さまで共有し、担当者ごとには発行しない】【2026/09/29 決定 28-145：受付・仮登録でアカウントの発行を選ぶと、<b>法人アカウント（法人で1つ）と拠点アカウント（拠点ごと）</b>を発行する。ログイン案内メールは、そのアカウントの法人・拠点のメイン担当者・サブ担当者・請求担当者の全員へ送る（お申し込み者が担当者でなければお申し込み者にも。同じアカウントで1人が複数の区分を持つときは1通）。宛先は画面の項目としては持たない】", meta: {"code": "account.login_id", "type": "varchar(40)"}, ctl: { t: "input", v: "cu00643" } },
          { name: "アカウントのステータス", tags: [{"cls": "pn", "text": "P2新"}], phase: "new", rop: false, note: "未発行／発行済（ログイン前）／ログイン済／参照のみ（契約の解約後〜最後の請求書の入金期限）／停止中。持つのは有効・停止（アカウント自身）。優先順位：停止中＞参照のみ＞ログイン済＞発行済＞未発行（法人と同じ。運営A Q9）", meta: {"code": "account.status", "type": "varchar(20)"}, ctl: { t: "input", v: "ログイン済", s7c: "st" } },
          { name: "最終ログイン日時", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ro", "text": "法人は参照のみ"}], rop: true, meta: {"code": "account.last_login_at", "type": "timestamptz"}, ctl: { t: "input", v: "2026年9月29日 08:12:00" } },
          { name: "アカウントの操作", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "状態ごとに出す：未発行＝再送／発行済（ログイン前）＝再設定・再送・停止／ログイン済・参照のみ＝再設定・停止／停止中＝再開。宛先は法人と同じ（その拠点のメイン・サブ・請求担当者）。どれも変更履歴に残す（運営A Q9）", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "パスワード再設定", "act": "pw"}, {"label": "ログイン案内の再送", "act": "resend"}, {"label": "アカウントの停止", "act": "stop"}] } },
        ] },
      ] },
    ] },
    { label: "契約", cards: [
      { title: "親契約", chip: "契約（親契約）", body: [
        { t: 'fields', fields: [
          { name: "契約種別", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: true, input: true, note: "お試しキャンペーン／本導入（参照のみ。編集では変えられない。お試し→本導入は「本導入に切り替える」でだけ変え、下の「契約種別の履歴」に1行足す・契約_01 §6-1）。【お試しキャンペーン】「お試しキャンペーン割引」（プラン50・冷蔵庫・ライトのプラン料金。請求額を超えず、1法人1回まで。請求先が法人ならどの請求でも可、拠点ごとに請求するときは最初の拠点だけ）が付くので、1拠点・50ライトなら無料。既定1ヶ月。デフォルトプランはライト、配送回数はプランに応じて自動調整、契約期間は顧客が編集できない。最低利用期間はなく違約金も発生しない。自動更新せず、指定した月数だけ子契約を作る。本導入との同時申込は想定しない。【本導入】自動更新で、毎月1サイクル分ずつ子契約を生成する（必要なら手動で数ヶ月先まで作れる）", meta: {"code": "kind", "type": "varchar(20)"}, ctl: { t: "input", v: "本導入" } },
          { name: "本導入に切り替える", label: "契約種別の切替", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "運営だけ"}], phase: "new", rop: false, input: true, note: "契約種別の「切替」操作（編集とは別・押して確認するとその場で保存される）。お試しキャンペーン→本導入だけ。同じ親契約のまま契約種別を本導入にし、「契約種別の履歴」に1行足す。最低利用期間・違約金・自動更新は本導入の開始日から数える", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "本導入に切り替える", "act": "switch"}] } },
          { name: "契約ステータス", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "仮登録／有効／解約手続き中／利用休止／終了。【終了＝解約の承認後、解約日を過ぎた親契約（解約の承認で「解約手続き中」、解約日に「終了」。2026/09/29 決定）／お試しキャンペーンの期間が満了し、本導入に切り替えなかった親契約（本導入に切り替えるときは、同じ親契約の契約種別を本導入に切り替える。お試しの期間と本導入の開始日を親契約に残す。2026/10/01 決定 TL-6）】【契約の状態はここだけが正。子契約は参照表示。休止中かどうかもこのステータスだけで表し、拠点側に休止フラグは持たない】【2026/09/29 決定 28-146：仮登録の間は、法人・契約の画面では編集できない（参照だけ）。編集は契約申請管理の申請詳細（詳細情報設定）で行い、拠点を確定（本登録）したあとはこの画面で編集する】", meta: {"code": "status", "type": "varchar(20)"}, ctl: { t: "select", v: "有効", opts: ["仮登録", "有効", "解約手続き中", "利用休止", "終了"] } },
          { name: "開始サイクル月", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "最初のサイクル月を選ぶ（例：2026年10月（A1 2026/10/12））。【2026/09/30 要件シート行159：選べる月はオーダー締切に連動（締切前の申込は翌月以降・締切後は翌々月以降。法人の申込フォームの「契約開始希望年月」も同じ）】子契約・請求・配送はこのサイクル月から始まる。機種変更・追加があっても変えない。【2026/09/29：契約開始日（日付）の入力から変更】", meta: {"code": "start_cycle_month", "type": "char(7)"}, ctl: { t: "select", v: "2026年3月（A1 2026/02/23）", opts: ["2026年2月（A1 2026/01/26）", "2026年3月（A1 2026/02/23）", "2026年4月（A1 2026/03/23）"] } },
          { name: "契約終了日", mark: "cond", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ro", "text": "法人は参照のみ"}], rop: false, input: true, note: "解約が確定したときに入る。納品の最後の月を指す。【解約・休止を承認すると、適用月以降の未請求（未確定）の先行子契約を取り消す。取消件数を承認画面に出す】", meta: {"code": "end_on", "type": "date"}, ctl: { t: "input", v: "—（解約の申し出なし）" } },
          { name: "お試し期間（月数）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "契約種別＝お試しキャンペーンのときだけ活性。既定は1ヶ月。顧客は編集できない（運営のみ）。この月数ぶんだけ子契約を作る", meta: {"code": "trial_months", "type": "smallint"}, ctl: { t: "select", v: "—（本導入のため）", opts: ["—（本導入のため）", "1ヶ月", "2ヶ月", "3ヶ月"] } },
          { name: "お試しの延長", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "運営だけ"}], phase: "new", rop: false, input: true, note: "【2026/10/03 決定】お試しの延長は運営だけ（法人Web からはできない）。お試しキャンペーンの契約のとき、延長する月数（今のところ上限なし）を選んで延長する。お試しの最後の子契約と同じ中身で次のサイクルから子契約を作る（延長分は割引しない＝プラン料金を請求・請求は未確定。台帳 B K1）。延長は履歴に残し、法人へ通知・メール（お試し期間の延長）。法人Web の拠点詳細「お試し期間」に期間と延長が出る（T3）", meta: {"code": "trial_ext", "type": "jsonb（親契約の延長の記録）"}, ctl: { t: "buttons", items: [{"label": "お試しを延長する"}] } },
          { name: "代理店コード（紹介有無）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "代理店マスタからドロップダウンで選ぶ（先頭は「（紹介なし）」）。【紹介は契約単位で発生するため、契約が持つ。法人には持たせない】【法人Webには出さない】", meta: {"code": "agent_code", "type": "varchar(20)"}, ctl: { t: "select", v: "AG00021 株式会社パートナーズ", opts: ["（紹介なし）", "AG00001 株式会社フューチャーブリッジ", "AG00002 株式会社スマートコネクト", "AG00003 株式会社ビジネスリンク", "AG00004 株式会社アーバンネットワーク", "AG00005 グローバルサポート株式会社", "AG00006 ライフデザインパートナーズ株式会社", "AG00008 ネクストパートナーズ株式会社", "AG00010 東和ソリューションズ株式会社", "AG00011 株式会社サンライズエージェント", "AG00012 株式会社ブリッジワークス", "AG00021 株式会社パートナーズ", "AG00034 株式会社リンクアップ", "AG00102 ESパートナー西日本（特別代理店）"] } },
          { name: "請求時備考（社内）", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "請求のときに社内で共有する備考（旧ESのプラン詳細の「請求時備考」）。請求画面でも表示・編集できる。【法人Webには出さない】請求書にも印字しない。【2026/09/30 要件シート行186：行150「請求書に反映されない社内メモ欄」もこの項目で兼ねる】", meta: {"code": "billing_note_internal", "type": "text"}, ctl: { t: "textarea", v: "", rows: 2 } },
          { name: "親契約番号（契約ID）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}], phase: "new", rop: true, note: "CP ＋ 連番（例：CP000001・最小6桁）。契約変更・休止・再開をしても変わらない", meta: {"code": "contract_id / contract_no", "type": "bigserial / varchar(20)"}, ctl: { t: "input", v: "CP0000001" } },
          { name: "契約開始日", label: "契約開始年月", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: true, note: "【2026/10/01 回答 O4】契約開始は「契約開始年月」（開始サイクル月）だけを見せる。日付はサイクル初日（A1・月曜）として自動で決まる（内部項目 start_on はサイクル初日の日付で持つ）。請求の対象期間（暦月）は「契約開始」とは別のもの。【2026/09/30 決定 28-175：フェーズ1から移行した契約は、移行した時点の日付で入るため実際の契約開始日と違う可能性がある。この日付で「リリース前から契約しているか」などを判定しない】【最低利用期間はここからではなく、設備ごとの貸出日から数える（機種マスタ）。お試し中に置いた設備は本導入の開始日から数える（追補 28-17）】【お試し終了から本導入まで間が空くときは、休止と同じ扱い（設備の返却予定日＝満了日＋1ヶ月。間が通算1年を超えるときは新規申込として扱う。2026/10/01 回答 O6）】", meta: {"code": "start_on", "type": "date"}, ctl: { t: "input", v: "2026年3月（開始サイクル月）" } },
        ] },
      ] },
      { title: "契約種別の履歴", chip: "契約（親契約）", body: [
        { t: 'note', text: "親契約の契約種別の履歴（表示だけ・新しいものが上）。お試し→本導入の切替のたびに1行足す。最低利用期間・違約金・自動更新は本導入の開始日から数える（契約_01 §6-1）" },
        { t: 'table', cols: [{"label": "契約種別"}, {"label": "開始"}, {"label": "終了"}], rows: [
          {"c": ["本導入", "2026-03-01", ""]},
        ] },
      ] },
      { title: "一覧（子契約）", chip: "契約（親契約）", body: [
        { t: 'fields', fields: [
          { name: "子契約を先まで作る", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "一覧の上に置くボタン1つ。押すと確認ダイアログを開く。①「どの月まで作りますか」をドロップダウンで選ぶ（選べるのは作成済みの翌月〜今月から12ヶ月先。既定は次の1サイクル。上限値は要確認）→②作られる子契約をその場で一覧表示する（子契約ID・サイクル月・プラン・配送区分と納品回数・前払いの請求月・生成基準日）→③「N件作成」で作る。作った行は一覧に「手動生成」の印つきで入り、次の自動生成・子契約の状況も伸びる。【最新の子契約と同じ内容で作る】【すでにある月は作り直さない】作ったあとは1件ずつ直せる。使うのは、本導入で数ヶ月先のプラン変更に備えるとき、お試しキャンペーンを複数月にするとき。年一括前払いは12サイクル分を自動で作るので使わない", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "子契約を先まで作る"}] } },
        ] },
        { t: 'table', cols: [{"label": "契約・サイクル月"}, {"label": "契約終了予定月"}, {"label": "子契約ID"}, {"label": "プラン名"}, {"label": "契約ステータス（親契約より）"}, {"label": "配送区分"}, {"label": "納品回数"}, {"label": "請求月（前払い）"}, {"label": "当月請求額"}, {"label": "請求ステータス（前払い／後払い）"}, {"label": "生成方法", "ops": true}], rows: [
          {"band": {"from": "2026-12", "to": "2027-02", "html": "<span class=\"bst\">休止予定</span><span class=\"bl\">休止期間</span> <b>2026-12 〜 2027-02（3サイクル）</b><span class=\"bl\">再開予定</span> <b>2027-03</b><span class=\"bl\">休止理由</span> 拠点改装のため<span class=\"bl\">休止中の設備</span> 置いたまま（保管料なし）<span class=\"bn\">この期間は子契約を作りません</span>"}},
          {"c": ["2026-11", "—", "CP0000001-202611", "100プラン", "有効", "ES配送便", "2回", "2026年10月", "53,000円", "請求済 ／ 未集計", "日次バッチ"]},
          {"c": ["2026-10", "—", "CP0000001-202610", "100プラン", "有効", "ES配送便", "2回", "2026年9月", "53,000円", "請求済 ／ 未集計", "日次バッチ"]},
          {"c": ["2026-09", "—", "CP0000001-202609", "100プラン", "有効", "ES配送便", "2回", "2026年8月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
          {"c": ["2026-08", "—", "CP0000001-202608", "100プラン", "有効", "ES配送便", "2回", "2026年7月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
          {"c": ["2026-07", "—", "CP0000001-202607", "100プラン", "有効", "ES配送便", "2回", "2026年6月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
          {"c": ["2026-06", "—", "CP0000001-202606", "100プラン", "有効", "ES配送便", "2回", "2026年5月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
          {"c": ["2026-05", "—", "CP0000001-202605", "100プラン", "有効", "ES配送便", "2回", "2026年4月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
          {"c": ["2026-04", "—", "CP0000001-202604", "100プラン", "有効", "ES配送便", "1回", "2026年3月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
          {"c": ["2026-03", "—", "CP0000001-202603", "100プラン", "有効", "ES配送便", "1回", "2026年2月", "53,000円", "請求済 ／ 請求済", "日次バッチ"]},
        ] },
      ] },
    ] },
    { label: "設備・オプション", cards: [
      { title: "貸出一覧", chip: "拠点", body: [
        { t: 'fields', fields: [
          { name: "回収未完了（アラート）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: true, note: "【返却予定日 < 今日 かつ 未返却数 > 0】を日次バッチで検出し、運営の一覧に出す。回収しても料金が動かず誰も困らないため、回収忘れを防ぐ担保はこの検知だけになる", meta: {"code": "—（算出）", "type": ""}, ctl: { t: "input", v: "0 件" } },
        ] },
        { t: 'table', cols: [{"label": "貸出ID"}, {"label": "設備区分"}, {"label": "機種"}, {"label": "個体番号"}, {"label": "貸出数"}, {"label": "返却済数"}, {"label": "未返却数"}, {"label": "貸出日"}, {"label": "返却予定日"}, {"label": "返却日"}, {"label": "貸出ステータス"}, {"label": "回収理由"}, {"label": "最低利用期間の満了日"}, {"label": "違約金の判定"}, {"label": "備考"}, {"label": "最終更新"}], rows: [
          {"c": ["LN-0002", "資材ボックス", "BX000001 ボックス《仕切り皿》", "—", "2", "0", "2", "2026/03/28", "—", "—", "貸出中", "—", "—（無償・期間なし）", "発生しない", "標準1＋追加1", "2026/07/10（CP0000001-202607）"]},
          {"c": ["LN-0003", "自販機", {"t": "html", "html": "VM000001 カップ式自販機 VM-6010　富士電機\n<details class=\"vml-ovr\" style=\"margin-top:4px;font-size:12px\"><summary style=\"cursor:pointer;color:var(--blue,#2C6FB8)\">列の構成：機種の標準どおり（上書きなし）・上書きする</summary><div style=\"margin-top:6px\">この拠点の自販機だけの列の構成（お客様が列を変えているとき）。空なら機種マスタの標準を使う。法人Webの注文画面の枠・最大格納数と、格納数の警告に使う（2026/10/01 STEP5 §2-8）<table style=\"margin-top:4px\"><thead>\n<tr><th>種類</th><th>格納数</th><th>列数</th></tr></thead><tbody>\n<tr><td>ダブル</td><td><input placeholder=\"10\" style=\"width:56px\"/></td><td><input placeholder=\"5\" style=\"width:56px\"/></td></tr>\n<tr><td>ダブル</td><td><input placeholder=\"8\" style=\"width:56px\"/></td><td><input placeholder=\"6\" style=\"width:56px\"/></td></tr>\n<tr><td>シングル</td><td><input placeholder=\"10\" style=\"width:56px\"/></td><td><input placeholder=\"6\" style=\"width:56px\"/></td></tr>\n<tr><td>ベルト</td><td><input placeholder=\"5\" style=\"width:56px\"/></td><td><input placeholder=\"8\" style=\"width:56px\"/></td></tr></tbody></table></div></details>"}, "SN-VM-00087", "1", "0", "1", "2026/03/28", "—", "—", "貸出中", "—", "2027/03/27", "発生する（12,000円）", "解約時の回収額は契約で上書き 24,000円（別途見積の機種）。24,000円 × 残り6ヶ月 ÷ 12ヶ月", "2026/03/28（CP0000001-202603）"]},
          {"c": ["LN-0004", "電子レンジ", "MW000001 業務用電子レンジ MRO-1200　パナソニック", "—", "1", "1", "0", "2026/01/10", "2026/02/28", "2026/02/20", "回収済", "機種変更", "—", "—", "", "2026/02/20"]},
        ] },
        { t: 'fields', fields: [
          { name: "回収済も表示", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "既定では貸出ステータス＝回収済の行を隠し、いま貸しているものだけを見せる", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "回収済も表示"}] } },
          { name: "貸出中 合計", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "配送中・貸出中・回収依頼中の未返却数の合計。いま何台預けているか", meta: {"code": "—（算出）", "type": ""}, ctl: { t: "input", v: "4 点（冷蔵庫1・資材ボックス2・自販機1）" } },
          { name: "未返却 合計", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: true, note: "返却予定日を過ぎても返ってきていない数の合計", meta: {"code": "—（算出）", "type": ""}, ctl: { t: "input", v: "0 点" } },
        ] },
      ] },
      { title: "オプション・割引（今のサイクル月）", chip: "拠点", ops: true, body: [
        { t: 'table', cols: [{"label": "子契約ID", "ops": true}, {"label": "区分", "ops": true}, {"label": "コード・名称", "ops": true}, {"label": "数量", "ops": true}, {"label": "金額・率", "ops": true}, {"label": "適用開始月", "ops": true}, {"label": "適用終了月", "ops": true}], rows: [
          {"c": ["CP0000001-202610", "オプション", "OP000002 ES-QR 利用料（連動タイプA）", "1", "1,000円", "2026-04", "—"]},
          {"c": ["CP0000001-202610", "オプション", "OP000004 地域配送料", "1", "4,000円", "2026-04", "—"]},
        ] },
        { t: 'fields', fields: [
          { name: "子契約で変更する", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "子契約詳細の「設備・オプション」タブを開く。オプション・割引の追加・変更・終了はそこで登録する", meta: {"code": "—", "type": ""}, ctl: { t: "buttons", items: [{"label": "子契約で変更する"}] } },
        ] },
      ] },
    ] },
    { label: "請求", cards: [
      { title: "請求先と請求条件", chip: "拠点", body: [
        { t: 'fields', fields: [
          { name: "請求先", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}], phase: "new", rop: false, input: true, note: "法人／この拠点。【この項目だけが正。法人側には請求先を持たせない】法人なし拠点は自動的に「この拠点」で変更不可。【2026/09/28：請求タブの先頭に置く。この値で下の支払方法・支払サイクル・Bill One 発行先ID・リードタイムの上書きの活性が切り替わる。法人の「請求先の内訳」から一括変更もできる】", meta: {"code": "bill_to", "type": "varchar(10)"}, ctl: { t: "select", v: "法人", opts: ["法人", "この拠点"] } },
          { name: "請求書発行リードタイムの上書き", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "法人と同じ選択肢（3ヶ月前（−3）／2ヶ月前（−2）／1ヶ月前（−1）／当月（0）／翌月（+1・後払い））。空欄＝法人の設定に従う。【請求先＝この拠点 のときだけ活性】法人なし拠点は必須。【拠点ごとに別のリードタイムを許す（2026/09/25 決定）】【2026/09/29：選択式に変更】", meta: {"code": "billing_lead_override", "type": "smallint (-3〜+1)"}, ctl: { t: "select", v: "—（法人に従う）", opts: ["—（法人に従う）", "3ヶ月前（−3）", "2ヶ月前（−2）", "1ヶ月前（−1）", "当月（0）", "翌月（+1・後払い）"] } },
          { name: "支払方法", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "口座振替／銀行振込／クレジットカード。【2026/09/28：クレジットカードも残す】【請求先＝この拠点 のときだけ活性。法人のときは非活性で保存もしない】", meta: {"code": "bill_pay_method", "type": "varchar(20)"}, ctl: { t: "select", v: "—（請求先が法人のため非活性）", opts: ["—（請求先が法人のため非活性）", "口座振替", "銀行振込", "クレジットカード"] } },
          { name: "口座振替の手続きステータス", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "【2026/09/23 決定 6C／2026/09/28 追補で変更】未手続き／手続き中／完了。支払方法は法人から変更申請できない（参照のみ）。運営が支払方法を口座振替に変えたときに使い、完了になるまでは請求書にお振込と印字して振込先を載せる（請求は止めない）。完了になった次の請求書から口座振替の記載になる。【請求先＝この拠点 のときだけ活性】", meta: {"code": "bill_debit_setup_status", "type": "varchar(12)"}, ctl: { t: "select", v: "—（請求先が法人のため非活性）", opts: ["—（請求先が法人のため非活性）", "未手続き", "手続き中", "完了"] } },
          { name: "支払サイクル", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "月払い／年払い。【請求先＝この拠点 のときだけ活性。法人のときは非活性で保存もしない】【2026/09/29 hong：請求先＝この拠点の拠点は、新規の申込で選ぶ（既定 月払い）】", meta: {"code": "bill_pay_cycle", "type": "varchar(20)"}, ctl: { t: "select", v: "—（請求先が法人のため非活性）", opts: ["—（請求先が法人のため非活性）", "月払い", "年払い"] } },
          { name: "起算月（年払いのとき）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "【請求先＝この拠点 かつ 支払サイクル＝年払い のときだけ活性】法人と同じ", meta: {"code": "bill_anchor_month", "type": "char(7)"}, ctl: { t: "select", v: "—", opts: ["—", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03"] } },
          { name: "入金期限", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, input: true, na: true, note: "請求月（請求書を送付する月）の27日／請求月の翌月27日 から選ぶ。前払い分も実績精算分も、1枚の請求書に入金期限は1つ。口座振替・クレジットの引き落とし日もこの日付。【2026/09/29 決定：2026/09/25 の固定ルール（サイクル月の前月末・送付月の月末）から変更】", meta: {"code": "due_rule", "type": "varchar(12)"}, ctl: { t: "select", v: "請求月の27日", opts: ["請求月の27日", "請求月の翌月27日"] } },
          { name: "Bill One 発行先ID", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: true, input: true, na: true, note: "【請求先＝この拠点 のときだけ活性】", meta: {"code": "bill_billone_payer_id", "type": "varchar(40)"}, ctl: { t: "input", v: "—" } },
        ] },
      ] },
      { title: "一覧（この拠点の請求書）", chip: "拠点", body: [
        { t: 'table', cols: [{"label": "請求書番号"}, {"label": "発行日"}, {"label": "請求月"}, {"label": "固定額（前払い）"}, {"label": "前払いの対象"}, {"label": "実績精算（後払い）"}, {"label": "実績精算の対象"}, {"label": "消費税"}, {"label": "この拠点の請求金額（税込）"}, {"label": "入金期限"}, {"label": "請求書ステータス"}], rows: [
          {"c": ["INV-2026100001", "2026/10/01", "2026-10", "53,000円", "2026-11 サイクル分", "2,600円", "2026/08/21〜09/20", "5,323円", "60,923円", "2026/10/27", "発行済"]},
          {"c": ["INV-2026090001", "2026/09/01", "2026-09", "53,000円", "2026-10 サイクル分", "4,820円", "2026/07/21〜08/20", "5,500円", "63,320円", "2026/09/27", "発行済"]},
          {"c": ["INV-2026080001", "2026/08/01", "2026-08", "53,000円", "2026-09 サイクル分", "1,400円", "2026/06/21〜07/20", "5,227円", "59,627円", "2026/08/27", "発行済（未入金・INV-2026100001 で再請求）"]},
        ] },
        { t: 'fields', fields: [
          { name: "請求書詳細を開く", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "請求書番号を押すと請求書詳細の画面を開く（請求書の情報・請求金額・明細＝費目・対象・数量・税抜金額・税率、小計・消費税・請求金額）。拠点の画面から開いたときは、法人あての請求書でもその拠点の分だけを出す。【2026/09/29 hong：請求書の発行・PDF は Bill One で行うため、システムでは PDF の表示・ダウンロードはしない（旧「請求書の表示・ダウンロード」）。原本は Bill One からのメールで受け取る】", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "請求書詳細を開く"}] } },
        ] },
      ] },
    ] },
    { label: "資料・履歴", cards: [
      { title: "添付資料（法人に公開）", chip: "拠点", body: [
        { t: 'fields', fields: [
          { name: "搬入経路資料（顧客向け）", mark: "cond", tags: [{"cls": "pv", "text": "P1→P2変"}], phase: "chg", rop: false, input: true, note: "顧客・法人に公開する搬入経路図・マニュアル", meta: {"code": "branch_attachment（audience='customer'）", "type": "bytea / path"}, ctl: { t: "file", fn: "搬入経路図_サンプル.pdf", btns: ["表示", "DL"] } },
          { name: "設置場所写真", mark: "cond", tags: [{"cls": "p1", "text": "P1"}], rop: false, input: true, note: "申込時に添付", meta: {"code": "branch_attachment（kind='site_photo'）", "type": "bytea / path"}, ctl: { t: "file", fn: "設置場所_8F.jpg", btns: ["表示", "DL"] } },
          { name: "申込時の添付資料", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "ファイル名／形式／容量／登録日。表示・ダウンロードのみ", meta: {"code": "branch_attachment.file_name / mime / bytes / created_at", "type": "varchar / integer / timestamptz"}, ctl: { t: "input", v: "申込書.pdf／PDF／1.2MB／2026/03/12" } },
        ] },
      ] },
      { title: "添付資料（社内のみ・非公開）", chip: "拠点", ops: true, body: [
        { t: 'fields', fields: [
          { name: "搬入経路資料（委託配送会社向け・非公開）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "委託業者の拠点マニュアル。顧客には公開しない。アップロード経路・管理を分離", meta: {"code": "branch_attachment（audience='carrier'）", "type": "bytea / path"}, ctl: { t: "file", fn: "拠点マニュアル_サンプル_業者用.pdf", btns: ["表示", "DL"] } },
          { name: "運営側の追加資料", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "運営がファイル追加・削除", meta: {"code": "branch_attachment（uploaded_by='ops'）", "type": "bytea / path"}, ctl: { t: "file", fn: "設置報告書_20260401.pdf", btns: ["表示", "DL"] } },
        ] },
      ] },
      { title: "申請履歴（法人Webからの変更申請）", chip: "拠点", body: [
        { t: 'table', cols: [{"label": "受付番号"}, {"label": "申請の種類"}, {"label": "申請日"}, {"label": "申請者"}, {"label": "開始サイクル月"}, {"label": "申請内容"}, {"label": "承認状態"}, {"label": "承認者・承認日時", "ops": true}, {"label": "却下理由"}, {"label": "取り下げ日時"}], rows: [
          {"c": ["CH-20260918-0001", "休止", "2026/09/18", "佐藤 誠（法人アカウント）", "2026-12", "3サイクル休止（2026-12〜2027-02・設備は置いたまま）", "承認済", "井上 悠 2026/09/19", "—", "—"]},
          {"c": ["AP-20260210-0003", "新規のお申し込み", "2026/02/10", "佐藤 誠（法人アカウント）", "2026-03", "100プラン（ESライト（自販機））・ES配送便 月1回", "承認済み（ご契約開始済み）", "田中 健一 2026/02/12", "—", "—"]},
        ] },
      ] },
      { title: "履歴（拠点・親契約）", chip: "契約（親契約）", ops: true, body: [
        { t: 'table', cols: [{"label": "変更日時", "ops": true}, {"label": "変更内容", "ops": true}, {"label": "変更者", "ops": true}, {"label": "適用範囲", "ops": true}, {"label": "承認者", "ops": true}, {"label": "通知の有無", "ops": true}], rows: [
          {"c": ["2026/09/19 10:05", "休止の予定を登録（2026-12〜2027-02・3サイクル・設備は置いたまま。CH-20260918-0001）", "運営 井上", "2026-12 以降すべて", "井上 悠", "要"]},
          {"c": ["2026/04/10 11:20", "納品回数「ES配送便 1回」→「ES配送便 2回」（2026-05 サイクルの子契約から）", "運営 佐藤", "2026-05 以降すべて", "部長 中村", "要"]},
          {"c": ["2026/03/13 10:00", "アプリの利用設定：ES-QR「利用しない」→「利用する」（運営が 2026年4月サイクルから設定）", "運営 佐藤", "2026-04 以降すべて", "—", "要"]},
          {"c": ["2026/02/12 15:02", "契約ステータス「仮登録」→「有効」（本登録）", "システム", "2026-03 以降すべて", "—", "—"]},
          {"c": ["2026/02/12 11:00", "データ登録（AP-20260210-0003 の受付・詳細情報設定）", "運営 田中", "2026-03 以降すべて", "—", "—"]},
        ] },
      ] },
    ] },
  ],
};

export const CHILD_FORM: FormDef = {
  title: "契約情報編集", sample: "CP0000001-202607",
  sum: [{"k": "子契約ID", "v": "CP0000001-202607"}, {"k": "拠点", "v": "CU00643 株式会社サンプル"}, {"k": "契約・サイクル月", "v": "2026-07"}, {"k": "契約種別", "v": "本導入"}, {"k": "契約ステータス", "v": "有効"}, {"k": "① 前払い", "v": "2026年6月請求／請求済", "ops": true}, {"k": "② 実績精算", "v": "2026年8月請求／請求済", "ops": true}, {"k": "合計（参考）", "v": "53,000円", "ops": true}],
  tabs: [
    { label: "契約", cards: [
      { title: "子契約", body: [
        { t: 'fields', fields: [
          { name: "子契約ID", mark: "req", tags: [{"cls": "pn", "text": "P2新"}], phase: "new", rop: true, note: "契約ID ＋ -yyyymm（契約・サイクル月）。例 CP000001-202607", meta: {"code": "monthly_id / monthly_no", "type": "bigserial / varchar(30)"}, ctl: { t: "input", v: "CP0000001-202607" } },
          { name: "契約・サイクル月", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "この子契約が担当する納品サイクルの月（14番目の枠 B7 が属する月。決定_v2.1）。納品サイクルは4週で回るため暦月をまたぐことがあるが、【1サイクル＝1子契約】でサイクル月の子契約に載せる。プラン固定額と月次提供数上限はサイクル月で判定し、分納・再配送・スポットは納品日の暦月で判定する。重複防止キー", meta: {"code": "cycle_month", "type": "char(7)"}, ctl: { t: "input", v: "2026-07" } },
          { name: "親契約番号（契約ID）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "親へのリンク。不変", meta: {"code": "contract_id", "type": "bigint"}, ctl: { t: "input", v: "CP0000001" } },
          { name: "変更の適用範囲（保存時に確認）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "項目としては画面に置かない。保存ボタンを押したとき、【この子契約より後のサイクルの子契約が生成済みのときだけ】ダイアログで「この子契約だけ」「この子契約以降すべて」を選ばせ、選んだ値を変更履歴に残す。ダイアログには後ろにある子契約の件数と、一緒に直る未確定の件数・直らない確定／請求済の件数を出す。【後ろの子契約がまだ生成されていないときは確認を出さずに保存する】（生成元の設定も同じ値に更新し、翌月以降はこの内容で生成する。変更履歴の適用範囲は「2026-07 以降すべて」で残す）。当月の子契約は確定・請求済になると金額に効く変更ができない", meta: {"code": "change_scope", "type": "varchar(20)"}, ctl: { t: "buttons", items: [{"label": "変更の適用範囲（保存時に確認）"}] } },
        ] },
      ] },
      { title: "契約", body: [
        { t: 'fields', fields: [
          { name: "プランID", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: false, input: true, note: "プランマスタからドロップダウンで選ぶ（プランID・プラン名で絞り込み検索できる）。プラン変更はこの子契約（翌月分）で行う。【プラン名も同じ欄に表示する】例：ES000004 100プラン（コースは「メニュー種別（コース）」の欄）", meta: {"code": "plan_id", "type": "bigint"}, ctl: { t: "select", v: "ES000004　100プラン", opts: ["ES000003　50プラン", "ES000004　100プラン", "ES000005　150プラン", "ES000006　200プラン"] } },
          { name: "メニュー種別（コース）", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: false, input: true, note: "ESスタンダード／ESライト（冷蔵庫）／ESライト（自販機）。【2026/09/30 決定 28-184】ESライト（自販機）を足した：自販機の拠点のプラン料金はプランマスタの ESライト（自販機）の価格プラン（ES配送便）で、配送区分は ES配送便に固定。標準の設備はプランマスタの標準貸出設備（自販機＋資材ボックス）", meta: {"code": "course", "type": "varchar(10)"}, ctl: { t: "select", v: "ESライト（自販機）", opts: ["ESスタンダード", "ESライト（冷蔵庫）", "ESライト（自販機）"] } },
          { name: "適用開始月", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: false, input: true, note: "この子契約が担当する期間の開始。契約全体の開始日は親契約が持つ", meta: {"code": "term_from", "type": "date"}, ctl: { t: "input", v: "2026/07" } },
          { name: "適用終了月", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: false, input: true, note: "この子契約が担当する期間の終了", meta: {"code": "term_to", "type": "date"}, ctl: { t: "input", v: "2026/07" } },
          { name: "解約時の回収額（上書き）", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "nt", "text": "通知"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "【2026/09/23 決定 2B】空欄なら機種マスタの「解約時の回収額」（標準額）を使う。入っていればこちらを優先する。自販機のように設置条件で撤去費が変わる機種のために、契約ごとに入れられるようにする。設備（貸出）ごとに持つ。別途見積の機種は契約を作るときに必ず入れる（空欄のまま解約すると違約金が0円になるため）", meta: {"code": "cancel_fee_override", "type": "integer"}, ctl: { t: "input", v: "LN-0003 VM000001 カップ式自販機：24,000円（別途見積の機種）" } },
          { name: "適用された価格プラン", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "プランマスタの価格プラン（元の料金／改訂第一回目／改訂第二回目／改訂第三回目…＝議事録の 丸1〜丸4）から、この子契約のプラン・コースの世代を選ぶ。子契約ごと（毎月）に選べる（2026/09/30 決定 28-181。旧：生成時にシステムが固める参照だけ）。初期値：自動生成の子契約は前の子契約と同じ世代、新規・プラン変更は公開用（＝選択中・28-180）の世代。既存のお客様（データ移行）は移行のときに今の世代を入れる。変えたときは保存のダイアログで「この子契約だけ／この子契約以降すべて」を選ぶ。①の請求が確定したあとは変えられない。プラン料金とスタンダードアップ差額（DC000003・28-174）はこの世代の料金で計算する。選んだ世代の金額は子契約に固める（あとでプランマスタの金額を直しても変わらない）", meta: {"code": "price_revision_id", "type": "bigint"}, ctl: { t: "select", v: "改訂第三回目（2026/04/01〜・公開用）", opts: ["元の料金（2024/01/30〜2024/09/30）", "改訂第一回目（2024/10/01〜2024/12/31）", "改訂第二回目（2025/01/01〜2026/03/31）", "改訂第三回目（2026/04/01〜・公開用）"] } },
          { name: "企業負担額・税率（プランから）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "【2026/09/29 決定 28-147〜153】生成時にプランマスタから固める：企業負担額（既定100円税込・1食）／企業負担分の税率（既定 軽減8%）／基本料金の税率（既定 標準10%）／基本料金（税抜）／企業負担分（税抜＝企業負担額 × 月次提供上限の合計 ÷（1＋税率））。①のプラン料金の2行はこの値から立てる。例：プラン料金 49,500円・上限合計200食 → 企業負担分 18,518円（8%）＋基本料金 30,982円（10%）", meta: {"code": "snapshot.subsidy", "type": "jsonb"}, ctl: { t: "input", v: "企業負担額 100円（税込・1食）× 月次提供上限 100食 → 企業負担分 9,259円（8%）＋ 基本料金 38,741円（10%）（100プラン ESライト（自販機）48,000円）" } },
        ] },
      ] },
      { title: "アプリの利用設定（このサイクル月）", body: [
        {"t": "note", "text": "持ち主は子契約（サイクル月ごと）。法人Webの拠点の「編集」で 1日上限数・1ヶ月上限金額を直すと、今のサイクル（今日が属するサイクル）以降のすべての子契約に効く（運営はここで「この子契約だけ」も選べる）。料金のある設定（ゲストモード・ES-QR など）は、設定も料金もオーダー締切で決まるサイクルから効く（締切＝前月15日までなら翌月のサイクルから、過ぎたら翌々月から。2026/10/01 決定 Q6）。ES-QR・ユーザー現金利用は運営だけが変える（2026/10/01 STEP2 回答 Q2）。"},
        { t: 'fields', fields: [
          { name: "ユーザー現金利用", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "only", "text": "法人に出さない"}], phase: "chg", rop: false, input: true, note: "可／不可。既定は不可。現金分はアプリ決済に載らないため販売実績額に含まれない。既存拠点のみ。【サイクル月ごと（子契約）に持つ。変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ】", meta: {"code": "allow_cash", "type": "boolean"}, ctl: { t: "select", v: "可", opts: ["可", "不可"] } },
          { name: "1日上限数（1人あたり）", mark: "cond", tags: [{"cls": "pv", "text": "P1→P2変"}], phase: "chg", rop: false, input: true, note: "食／日。0＝制限なし。【サイクル月ごと（子契約）に持つ。変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ】", meta: {"code": "daily_cap_meals", "type": "integer"}, ctl: { t: "input", v: "10" } },
          { name: "1ヶ月上限金額（1人あたり）", mark: "cond", tags: [{"cls": "pv", "text": "P1→P2変"}], phase: "chg", rop: false, input: true, note: "円／月。0＝制限なし。【サイクル月ごと（子契約）に持つ。変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ】", meta: {"code": "monthly_cap_yen", "type": "integer"}, ctl: { t: "input", v: "0" } },
          { name: "ゲストモード", mark: "cond", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}], phase: "chg", rop: false, input: true, note: "【2026/09/30 要件シート行157：法人Webから変更できる。運営承認の要否は要確認】利用しない／利用する。既定は利用しない。社員登録のない来訪者でも購入可。食事補助の対象外。【サイクル月ごと（子契約）に持つ。変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ】", meta: {"code": "allow_guest", "type": "boolean"}, ctl: { t: "select", v: "利用しない", opts: ["利用しない", "利用する"] } },
          { name: "ES-QR", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: false, input: true, note: "【2026/09/30 要件シート行157：ES-QRの利用設定は運営のみが変更する。法人Webは表示のみで変更申請できない（旧：法人から変更申請・運営承認必須）】利用しない／利用する（月額料金あり）。既定は利用しない。ES-QRコードによる決済。モバイルウェブ版の名称は ESQR。利用すると月額料金が発生し、オプションとして子契約の請求額へ自動で載せる（実装可否は確認中）。【サイクル月ごと（子契約）に持つ。変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ】", meta: {"code": "allow_esqr", "type": "boolean"}, ctl: { t: "select", v: "利用する（月額料金あり）", opts: ["利用しない", "利用する（月額料金あり）"] } },
        ] },
      ] },
      { title: "配送・納品スケジュール", body: [
        { t: 'fields', fields: [
          { name: "配送区分", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "chg", rop: false, input: true, note: "COOL便／ES配送便。【プランマスタの価格はこの配送区分別。料金に効く軸】【2026/10/01 決定 28-19】設備が自販機の拠点（コース＝ESライト（自販機））は ES配送便に固定して表示し、選択肢は出さない（運営・法人とも変更できない）。", meta: {"code": "ship_type", "type": "varchar(10)"}, ctl: { t: "select", v: "ES配送便", opts: ["COOL便", "ES配送便"] } },
          { name: "配送番号", mark: "cond", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ro", "text": "法人は参照のみ"}], rop: false, input: true, meta: {"code": "delivery_no", "type": "varchar(40)"}, ctl: { t: "input", v: "DN-0643-01" } },
          { name: "納品不可曜日", mark: "cond", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}], rop: false, input: true, note: "月・火・水・木・金・土・日・祝日 から複数選ぶ（チェックボックス）。どれにもチェックしない＝納品不可曜日なし", meta: {"code": "ng_weekdays", "type": "smallint[]"}, ctl: { t: "chk", items: ["月", "火", "水", "木", "金", "土", "日", "祝日"], v: ["土", "日", "祝日"] } },
          { name: "納品予定日になった場合", mark: "req", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ro", "text": "法人は参照のみ"}], rop: false, input: true, note: "前倒す／後ろ倒す", meta: {"code": "holiday_shift", "type": "varchar(10)"}, ctl: { t: "select", v: "前倒す", opts: ["前倒す", "後ろ倒す"] } },
          { name: "配送備考", mark: "cond", tags: [{"cls": "p1", "text": "P1"}], rop: false, input: true, note: "受け渡し・搬入の注意など", meta: {"code": "delivery_note", "type": "text"}, ctl: { t: "textarea", v: "1F 守衛室で受付後、8F 社員食堂へ", rows: 2 } },
          { name: "設置フロア", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}], phase: "new", rop: false, input: true, note: "申込で聞く。自販機は必須・冷蔵庫は任意（台帳 2026/10/03）", meta: {"code": "install_floor", "type": "varchar(100)"}, ctl: { t: "input", v: "2F 給湯室" } },
        ] },
      ] },
      { title: "配送ルート設定（テーブル）", body: [
        { t: 'table', cols: [{"label": "配送種別"}, {"label": "ピッキング倉庫", "ops": true}, {"label": "運送会社", "ops": true}, {"label": "納品会社", "ops": true}, {"label": "途中経由1", "ops": true}, {"label": "リードタイム", "ops": true}, {"label": "配送回数"}, {"label": "配送パターン"}, {"label": "納品サイクル"}, {"label": "問い合わせ確認URL", "ops": true}, {"label": "操作", "ops": true}], rows: [
          {"c": [{"t": "sel", "v": "冷蔵配送", "opts": ["冷蔵配送", "冷凍配送", "資材配送"]}, {"t": "sel", "v": "WH00001 関東倉庫", "opts": ["WH00001 関東倉庫", "WH00002 関西倉庫"]}, {"t": "sel", "v": "栄成ロジ（委託）", "opts": ["ヤマト運輸", "佐川急便", "福山通運", "栄成ロジ（委託）", "みどり便（委託）", "自社便"]}, {"t": "sel", "v": "みどり便（委託）", "opts": ["ヤマト運輸", "佐川急便", "福山通運", "栄成ロジ（委託）", "みどり便（委託）", "自社便"]}, {"t": "sel", "v": "栄成ロジ 越谷デポ（HU00301）", "opts": ["なし（倉庫で受け取ってそのまま配送）", "—", "ヤマト運輸 国分営業所", "ヤマト運輸 三郷営業所", "佐川急便 大阪南営業所", "栄成ロジ 越谷デポ（HU00301）"]}, {"t": "in", "v": "1 日"}, {"t": "in", "v": "2 回"}, {"t": "sel", "v": "ESサイクル", "opts": ["ESサイクル", "スペシャル", "都度配送"]}, {"t": "cyc", "v": ["A3", "C3"], "opts": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "D1", "D2", "D3", "D4", "D5", "D6", "D7"]}, {"t": "in", "v": "—（ES採番の送り状・リンクなし）"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "冷凍配送", "opts": ["冷蔵配送", "冷凍配送", "資材配送"]}, {"t": "sel", "v": "WH00001 関東倉庫", "opts": ["WH00001 関東倉庫", "WH00002 関西倉庫"]}, {"t": "sel", "v": "ヤマト運輸", "opts": ["ヤマト運輸", "佐川急便", "福山通運", "栄成ロジ（委託）", "みどり便（委託）", "自社便"]}, {"t": "sel", "v": "佐川急便", "opts": ["ヤマト運輸", "佐川急便", "福山通運", "栄成ロジ（委託）", "みどり便（委託）", "自社便"]}, {"t": "sel", "v": "ヤマト運輸 国分営業所", "opts": ["なし（倉庫で受け取ってそのまま配送）", "—", "ヤマト運輸 国分営業所", "ヤマト運輸 三郷営業所", "佐川急便 大阪南営業所", "栄成ロジ 越谷デポ（HU00301）"]}, {"t": "in", "v": "2 日"}, {"t": "in", "v": "1 回"}, {"t": "sel", "v": "ESサイクル", "opts": ["ESサイクル", "スペシャル", "都度配送"]}, {"t": "cyc", "v": ["B1"], "opts": ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "B1", "B2", "B3", "B4", "B5", "B6", "B7", "C1", "C2", "C3", "C4", "C5", "C6", "C7", "D1", "D2", "D3", "D4", "D5", "D6", "D7"]}, {"t": "in", "v": "https://track.example.jp/sagawa"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "資材配送", "opts": ["冷蔵配送", "冷凍配送", "資材配送"]}, {"t": "sel", "v": "WH00002 関西倉庫", "opts": ["WH00001 関東倉庫", "WH00002 関西倉庫"]}, {"t": "sel", "v": "福山通運", "opts": ["ヤマト運輸", "佐川急便", "福山通運", "栄成ロジ（委託）", "みどり便（委託）", "自社便"]}, {"t": "sel", "v": "福山通運", "opts": ["ヤマト運輸", "佐川急便", "福山通運", "栄成ロジ（委託）", "みどり便（委託）", "自社便"]}, {"t": "sel", "v": "なし（倉庫で受け取ってそのまま配送）", "opts": ["なし（倉庫で受け取ってそのまま配送）", "—", "ヤマト運輸 国分営業所", "ヤマト運輸 三郷営業所", "佐川急便 大阪南営業所", "栄成ロジ 越谷デポ（HU00301）"]}, {"t": "in", "v": "3 日（出荷日＝納品日−3日）"}, {"t": "in", "v": "—"}, {"t": "sel", "v": "都度配送", "opts": ["ESサイクル", "スペシャル", "都度配送"]}, {"t": "cyc", "v": ["—"], "opts": ["—"]}, {"t": "in", "v": "https://track.example.jp/seino"}, {"t": "del"}]},
        ] },
        {"t": "add"},
      ] },
      { title: "メモ", body: [
        { t: 'fields', fields: [
          { name: "運営メモ（内部メモ）", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "運営だけが見る自由記述。法人画面には出さない", meta: {"code": "internal_memo", "type": "text"}, ctl: { t: "textarea", v: "紹介元パートナーズ経由。初回設置時に搬入口が狭く時間超過。次回入替時は要注意。", rows: 2 } },
          { name: "プラン外の備考（申込時）", mark: "cond", tags: [{"cls": "p1", "text": "P1"}, {"cls": "ro", "text": "法人は参照のみ"}], rop: true, note: "申込フォームの自由記述を引き継いで表示", meta: {"code": "application_snapshot.note", "type": "text"}, ctl: { t: "textarea", v: "社員食堂のリニューアルに合わせて導入したい", rows: 2 } },
        ] },
      ] },
    ] },
    { label: "料金・請求", ops: true, cards: [
      { title: "支払情報", ops: true, body: [
        { t: 'fields', fields: [
          { name: "支払方法（スナップショット）", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "only", "text": "法人に出さない"}], phase: "chg", rop: true, note: "クレジットカード／口座振替／銀行振込。請求先が指す側（法人または拠点）の設定を生成時に引き継いで固める。ここでは編集しない", meta: {"code": "pay_method_snapshot", "type": "varchar(20)"}, ctl: { t: "input", v: "口座振替" } },
          { name: "支払サイクル（スナップショット）", mark: "req", tags: [{"cls": "pv", "text": "P1→P2変"}, {"cls": "only", "text": "法人に出さない"}], phase: "chg", rop: true, note: "月払い／年払い。請求先が指す側の設定を生成時に固める", meta: {"code": "pay_cycle_snapshot", "type": "varchar(20)"}, ctl: { t: "input", v: "月払い" } },
        ] },
      ] },
      { title: "請求", ops: true, body: [
        { t: 'fields', fields: [
          { name: "請求詳細を開く", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "請求 ＞ 請求の確定・請求書 の、この子契約の請求詳細（① 固定額・② 実績精算・③ 調整）を開く。調整（今月だけ・毎月続く費用）の登録もそちら", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "請求詳細を開く"}] } },
        ] },
      ] },
      { title: "値引き・負担額", ops: true, body: [
        { t: 'fields', fields: [
          { name: "福利厚生の適用", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "ON／OFF（既定 OFF）。【2026/09/29 決定 28-150】ON にすると、請求書でプラン料金を 2行（{プラン名} 基本料金＝10%／{プラン名} 福利厚生（企業負担分）＝8%） に分けて出す。OFF のときは1行にまとめて出す。金額と消費税は ON・OFF で変わらない（①の費目行はどちらでも基本料金と企業負担分の2行で持ち、消費税は2つの税率で計算して請求書の税率別の内訳に両方出る）。企業負担額はプランマスタが持つ（既定100円税込・1食 × 月次提供上限の合計。28-147・28-148）ので、ここでは金額を選ばない。（旧：企業負担額（従業員負担額）なし／50／100／150／200／300円・食の選択。2026/09/29 廃止）【サイクル月ごと（子契約）に持つ（暫定・28-144 と同じ）】変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ。追加で請求する行ではない（28-134）", meta: {"code": "welfare_enabled", "type": "boolean"}, ctl: { t: "select", v: "OFF（既定 OFF）", opts: ["ON", "OFF（既定 OFF）"] } },
          { name: "価格調整の適用", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "なし／値上げ／値下げ／無料提供（企業負担）＋金額（10円単位）。【サイクル月ごと（子契約）に持つ（2026/09/29 決定 28-144。親契約の欄はなくした）】変えるときは保存時に「この子契約だけ／この子契約以降すべて」を選ぶ。【値引きマスタには持たせない】拠点ごとの一品ものの調整で、カタログに載る値引きではないため", meta: {"code": "price_adj_mode / price_adj_yen", "type": "varchar(10) / integer"}, ctl: { t: "adjust", v: "値下げ", n: "10", unit: "円（10円単位）", opts: ["なし", "値上げ", "値下げ", "無料提供（企業負担）"] } },
        ] },
      ] },
    ] },
    { label: "設備・オプション", cards: [
      { title: "設備の異動（この子契約で登録）", body: [
        { t: 'fields', fields: [
          { name: "設備の異動（この子契約で登録）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ro", "text": "法人は参照のみ"}], phase: "new", rop: true, note: "【貸出・追加・回収・機種変更の登録はここで行う】ここで登録した行が拠点の「設備・オプション」タブの貸出一覧に反映される（新規貸出＝行を起こす／追加貸出＝貸出数を増やす／回収＝返却済数を増やす／機種変更＝旧を回収して新を起こす）。拠点側の一覧は見るだけ", meta: {"code": "—（説明）", "type": ""}, ctl: { t: "textarea", v: "貸出・追加・回収・機種変更の登録はここ。登録すると拠点の「設備・オプション」タブの貸出一覧に反映される", rows: 2 } },
        ] },
        { t: 'table', cols: [{"label": "異動区分"}, {"label": "対象の貸出ID"}, {"label": "設備区分"}, {"label": "機種"}, {"label": "個体番号"}, {"label": "数量"}, {"label": "予定日"}, {"label": "実施日"}, {"label": "理由"}, {"label": "備考"}, {"label": "操作", "ops": true}], rows: [
          {"c": [{"t": "sel", "v": "追加貸出", "opts": ["新規貸出", "追加貸出", "回収", "機種変更"]}, {"t": "sel", "v": "LN-0002", "opts": ["—", "LN-0001", "LN-0002", "LN-0003", "LN-0004", "LN-0005", "LN-0006", "LN-0007", "LN-0008"]}, {"t": "in", "v": "資材ボックス", "ro": true}, {"t": "sel", "v": "BX000001 ボックス《仕切り皿》", "opts": ["RF000001 冷蔵ショーケース 48L　ホシザキ", "RF000002 冷蔵ショーケース 84L　ホシザキ", "RF000003 冷蔵ショーケース 105L　ホシザキ", "RF000004 冷蔵ショーケース 142L　ホシザキ", "FZ000001 業務用冷凍庫 FZ-600　フクシマガリレイ", "VM000001 カップ式自販機 VM-6010　富士電機", "MW000001 業務用電子レンジ MRO-1200　パナソニック", "HW000001 ホットウォーマー HW-500　アンナカ", "BX000001 ボックス《仕切り皿》", "BX000002 ボックス《深皿》", "BX000003 ボックス《フード類》", "BX000004 タンス型ボックス（大）", "BX000005 カゴ"]}, {"t": "in", "v": "—"}, {"t": "in", "v": "1"}, {"t": "in", "v": "2026/07/10"}, {"t": "in", "v": "2026/07/10"}, {"t": "sel", "v": "—", "opts": ["—", "解約", "休止", "機種変更（プランアップ・プランダウン含む）", "故障交換"]}, {"t": "in", "v": "仕切り皿のボックスを1箱追加（標準1＋追加1・料金の変更なし）"}, {"t": "del"}]},
        ] },
        {"t": "add"},
        { t: 'fields', fields: [
          { name: "拠点の貸出一覧に反映", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "この子契約の異動行を拠点の貸出一覧へ書き込む。回収で未返却数が0になった貸出は【回収済】になり、既定では拠点の一覧から隠れる", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "拠点の貸出一覧に反映"}] } },
        ] },
      ] },
      { title: "オプション・割引（このサイクル月）", ops: true, body: [
        { t: 'fields', fields: [
          { name: "オプション・割引（このサイクル月）", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: true, note: "【このサイクル月にかかるオプション・値引きは子契約が持つ（2026/09/29 決定 28-144。拠点の適用一覧はなくした）】行を追加・変更・終了し、保存時に「この子契約だけ／この子契約以降すべて」を選ぶ。連動タイプAのオプション（配送回数・ES-QR など）は同じ子契約の契約項目から自動で立ち、ここでは直せない。金額は請求詳細の前払いの明細に出る", meta: {"code": "—（説明）", "type": ""}, ctl: { t: "textarea", v: "つける・やめるの登録はここ。連動タイプAのオプション（配送回数・ES-QR など）はここでは登録せず、契約項目を直す", rows: 2 } },
        ] },
        { t: 'table', cols: [{"label": "異動区分", "ops": true}, {"label": "区分", "ops": true}, {"label": "コード・名称", "ops": true}, {"label": "数量", "ops": true}, {"label": "金額・率", "ops": true}, {"label": "適用開始月", "ops": true}, {"label": "適用終了月", "ops": true}, {"label": "理由", "ops": true}, {"label": "備考", "ops": true}, {"label": "操作", "ops": true}], rows: [
          {"c": [{"t": "sel", "v": "—（継続）", "opts": ["—（継続）", "追加", "変更", "終了"]}, {"t": "sel", "v": "オプション", "opts": ["オプション", "値引き"]}, {"t": "sel", "v": "OP000002 ES-QR 利用料（連動タイプA）", "opts": ["OP000002 ES-QR 利用料（連動タイプA）", "OP000003 ゲストモード利用料（連動タイプA）", {"group": "オプション（連動タイプAは出さない）", "opts": ["OP000004 地域配送料", "OP000007 設置代行", "OP000008 初期費用", "OP000009 再配送手数料", "OP000010 冷蔵庫交換（お客様都合）", "OP000012 設備管理費", "OP000014 配送時間帯指定サービス", "OP000015 再設置・移設", "OP000016 棚卸し未実施", "OP000017 自販機ラッピング変更", "OP000019 設備配送料（1台）", "OP000020 設備配送料（2台以上）", "OP000021 階段作業の加算", "OP000022 設備引揚費", "OP000023 サイズ差額（月額）", "OP000024 緊急出動料金", "OP000025 特殊作業費（手上げ）", "OP000026 特殊作業費（クレーン対応）", "OP000027 特殊作業費（その他）", "OP000028 搬入設置個所の下見費用", "OP000029 故障による交換（同型サイズ）", "OP000030 自販機手数料", "OP000031 買取惣菜料金", "OP000032 冷凍庫レンタル（既存のお客様）", "OP000033 冷凍庫 初期費用（既存のお客様）", "OP000034 追加配送（単発・1回）", "OP000036 資材の追加配送（単発・1回）"]}, {"group": "値引き", "opts": ["DC000001 代理店割引（パートナーズ・料率）", "DC000002 初回キャンペーン割引", "DC000003 スタンダードアップ差額", "DC000004 配送回数追加の無料（6ヶ月）", "DC000005 春の新規キャンペーン（2026・20%）", "DC000007 代理店割引（リンクアップ・固定額）", "DC000008 オプション10%引き（開業応援）", "DC000009 紹介割引", "DC000010 ボリュームディスカウント（5拠点以上）", "DC000011 冷蔵庫の月額 半額（12ヶ月）", "DC000012 他社乗り換え割引", "DC000013 お試しキャンペーン割引"]}]}, {"t": "in", "v": "1"}, {"t": "in", "v": "1,000円"}, {"t": "sel", "v": "2026-04", "opts": ["2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12"]}, {"t": "sel", "v": "—", "opts": ["—", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12"]}, {"t": "sel", "v": "—", "opts": ["—", "キャンペーン適用", "代理店紹介", "プラン変更に伴う", "お客様申し出", "料金改定", "キャンペーン期間の満了", "その他（備考に書く）"]}, {"t": "in", "v": "ES-QR を利用する（契約項目から自動）"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "—（継続）", "opts": ["—（継続）", "追加", "変更", "終了"]}, {"t": "sel", "v": "オプション", "opts": ["オプション", "値引き"]}, {"t": "sel", "v": "OP000004 地域配送料", "opts": ["OP000004 地域配送料", "OP000003 ゲストモード利用料（連動タイプA）", {"group": "オプション（連動タイプAは出さない）", "opts": ["OP000004 地域配送料", "OP000007 設置代行", "OP000008 初期費用", "OP000009 再配送手数料", "OP000010 冷蔵庫交換（お客様都合）", "OP000012 設備管理費", "OP000014 配送時間帯指定サービス", "OP000015 再設置・移設", "OP000016 棚卸し未実施", "OP000017 自販機ラッピング変更", "OP000019 設備配送料（1台）", "OP000020 設備配送料（2台以上）", "OP000021 階段作業の加算", "OP000022 設備引揚費", "OP000023 サイズ差額（月額）", "OP000024 緊急出動料金", "OP000025 特殊作業費（手上げ）", "OP000026 特殊作業費（クレーン対応）", "OP000027 特殊作業費（その他）", "OP000028 搬入設置個所の下見費用", "OP000029 故障による交換（同型サイズ）", "OP000030 自販機手数料", "OP000031 買取惣菜料金", "OP000032 冷凍庫レンタル（既存のお客様）", "OP000033 冷凍庫 初期費用（既存のお客様）", "OP000034 追加配送（単発・1回）", "OP000036 資材の追加配送（単発・1回）"]}, {"group": "値引き", "opts": ["DC000001 代理店割引（パートナーズ・料率）", "DC000002 初回キャンペーン割引", "DC000003 スタンダードアップ差額", "DC000004 配送回数追加の無料（6ヶ月）", "DC000005 春の新規キャンペーン（2026・20%）", "DC000007 代理店割引（リンクアップ・固定額）", "DC000008 オプション10%引き（開業応援）", "DC000009 紹介割引", "DC000010 ボリュームディスカウント（5拠点以上）", "DC000011 冷蔵庫の月額 半額（12ヶ月）", "DC000012 他社乗り換え割引", "DC000013 お試しキャンペーン割引"]}]}, {"t": "in", "v": "1"}, {"t": "in", "v": "4,000円"}, {"t": "sel", "v": "2026-04", "opts": ["2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12"]}, {"t": "sel", "v": "—", "opts": ["—", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12"]}, {"t": "sel", "v": "—", "opts": ["—", "キャンペーン適用", "代理店紹介", "プラン変更に伴う", "お客様申し出", "料金改定", "キャンペーン期間の満了", "その他（備考に書く）"]}, {"t": "in", "v": "配送エリアの料金（拠点ごとの金額）"}, {"t": "del"}]},
          {"c": [{"t": "sel", "v": "終了", "opts": ["—（継続）", "追加", "変更", "終了"]}, {"t": "sel", "v": "値引き", "opts": ["オプション", "値引き"]}, {"t": "sel", "v": "DC000005 春の新規キャンペーン（2026・20%）", "opts": [{"group": "オプション（連動タイプAは出さない）", "opts": ["OP000004 地域配送料", "OP000007 設置代行", "OP000008 初期費用", "OP000009 再配送手数料", "OP000010 冷蔵庫交換（お客様都合）", "OP000012 設備管理費", "OP000014 配送時間帯指定サービス", "OP000015 再設置・移設", "OP000016 棚卸し未実施", "OP000017 自販機ラッピング変更", "OP000019 設備配送料（1台）", "OP000020 設備配送料（2台以上）", "OP000021 階段作業の加算", "OP000022 設備引揚費", "OP000023 サイズ差額（月額）", "OP000024 緊急出動料金", "OP000025 特殊作業費（手上げ）", "OP000026 特殊作業費（クレーン対応）", "OP000027 特殊作業費（その他）", "OP000028 搬入設置個所の下見費用", "OP000029 故障による交換（同型サイズ）", "OP000030 自販機手数料", "OP000031 買取惣菜料金", "OP000032 冷凍庫レンタル（既存のお客様）", "OP000033 冷凍庫 初期費用（既存のお客様）", "OP000034 追加配送（単発・1回）", "OP000036 資材の追加配送（単発・1回）"]}, {"group": "値引き", "opts": ["DC000001 代理店割引（パートナーズ・料率）", "DC000002 初回キャンペーン割引", "DC000003 スタンダードアップ差額", "DC000004 配送回数追加の無料（6ヶ月）", "DC000005 春の新規キャンペーン（2026・20%）", "DC000007 代理店割引（リンクアップ・固定額）", "DC000008 オプション10%引き（開業応援）", "DC000009 紹介割引", "DC000010 ボリュームディスカウント（5拠点以上）", "DC000011 冷蔵庫の月額 半額（12ヶ月）", "DC000012 他社乗り換え割引", "DC000013 お試しキャンペーン割引"]}]}, {"t": "in", "v": "1"}, {"t": "in", "v": "−20%"}, {"t": "sel", "v": "2026-04", "opts": ["2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12"]}, {"t": "sel", "v": "2026-06", "opts": ["—", "2025-04", "2025-05", "2025-06", "2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12", "2027-01", "2027-02", "2027-03", "2027-04", "2027-05", "2027-06", "2027-07", "2027-08", "2027-09", "2027-10", "2027-11", "2027-12"]}, {"t": "sel", "v": "キャンペーン期間の満了", "opts": ["—", "キャンペーン適用", "代理店紹介", "プラン変更に伴う", "お客様申し出", "料金改定", "キャンペーン期間の満了", "その他（備考に書く）"]}, {"t": "in", "v": "3ヶ月で終了（この月からかからない）"}, {"t": "del"}]},
        ] },
        {"t": "add"},
      ] },
      { title: "設置・引揚の予定", body: [
        { t: 'fields', fields: [
          { name: "設備の引揚希望日／搬入希望日／設置予定日", mark: "cond", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "ap", "text": "承認必須"}, {"cls": "nt", "text": "通知"}], phase: "new", rop: false, input: true, note: "設備入替・再設置があるときは必須。設備手配のリードタイムは1週間程度", meta: {"code": "equipment_schedule.pickup_on / carry_in_on / setup_on", "type": "date"}, ctl: { t: "input", v: "— ／ — ／ 2026/03/28（設置済み）" } },
          { name: "引き当てを設備の異動に取り込む", mark: "req", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: false, input: true, note: "自動引き当ての結果を上の【設備の異動】に「新規貸出」の行として起こす。すでに貸出中のものは起こさない", meta: {"code": "—（操作）", "type": ""}, ctl: { t: "buttons", items: [{"label": "引き当てを設備の異動に取り込む"}] } },
        ] },
      ] },
    ] },
    { label: "変更履歴", ops: true, cards: [
      { title: "履歴（子契約）", ops: true, body: [
        { t: 'table', cols: [{"label": "変更日時", "ops": true}, {"label": "変更内容", "ops": true}, {"label": "変更者", "ops": true}, {"label": "変更区分", "ops": true}, {"label": "適用範囲", "ops": true}, {"label": "承認者", "ops": true}, {"label": "通知の有無", "ops": true}], rows: [
          {"c": ["2026/07/25 10:22", "請求ステータス（後払い）「未集計」→「② 確定」", "運営 佐藤", "手入力", "2026-07 のみ", "—", "—"]},
          {"c": ["2026/07/10 14:02", "資材ボックス《仕切り皿》を1箱追加貸出（LN-0002 1→2）", "運営 佐藤", "手入力", "2026-07 のみ", "—", "—"]},
          {"c": ["2026/06/01 02:10", "2026-07 サイクルの子契約を生成", "システム", "日次バッチ", "2026-07 のみ", "—", "—"]},
        ] },
      ] },
      { title: "前月からの差分", ops: true, body: [
        { t: 'fields', fields: [
          { name: "前の子契約との差分", tags: [{"cls": "pn", "text": "P2新"}, {"cls": "only", "text": "法人に出さない"}], phase: "new", rop: true, note: "適用プラン／コース／配送便／料金改定／単価／免責／月次提供数上限／リードタイム／費目の増減。なぜ金額が変わったかの説明になる", meta: {"code": "—（snapshot 比較）", "type": ""}, ctl: { t: "input", v: "資材ボックス《仕切り皿》の追加貸出 1箱（料金の変更なし）" } },
        ] },
      ] },
    ] },
  ],
};

/* ---- 配送ルート：中継／直送／委託の説明と、回ごとのルート（2026/10/03・REQ-DL-711・713。案B＝行は温度帯ごとに1つのまま、回ごとに上書き） ---- */
export const ROUTE_TABLE = '配送ルート設定（テーブル）';
export const SLOT_ROUTE_TABLE = '回ごとのルート（この回だけ変える）';
{
  const cards = CHILD_FORM.tabs.find((t) => t.cards.some((c) => c.title === ROUTE_TABLE))!.cards;
  const i = cards.findIndex((c) => c.title === ROUTE_TABLE), route = cards[i];
  route.body.unshift({ t: 'note', text: '直送＝倉庫で受け取って拠点へそのまま届ける（途中経由「なし」・配送会社①②に同じ会社）。中継＝倉庫 →（配送会社①）→ 中継先 →（配送会社②）→ 拠点。委託＝委託配送会社のドライバーが運ぶ（自社便＝ES のドライバー、路線便＝ヤマトなどの送り状）。配送回数追加の回など、ある回だけ倉庫・ルートを変えるときは下の「回ごとのルート」に入れる' });
  const tb = route.body.find((b) => b.t === 'table');
  const tpl = tb && tb.t === 'table' ? tb.rows.find((r) => 'c' in r) : undefined;
  const at = (n: number) => (tpl && 'c' in tpl ? tpl.c[n] : '');
  const slots = ['A', 'B', 'C', 'D'].flatMap((w) => [1, 2, 3, 4, 5, 6, 7].map((d) => `${w}${d}`));
  cards.splice(i + 1, 0, {
    title: SLOT_ROUTE_TABLE, ops: true,
    body: [
      { t: 'note', text: 'その回だけ、上の行（温度帯ごとの標準のルート）と違うピッキング倉庫・配送会社・中継先で運ぶ。回は上の行の納品サイクルから選ぶ。入れない回は上の行のルート。一括変更はこの回を変えない' },
      { t: 'table', cols: [{ label: '配送種別' }, { label: '回（納品サイクル）' }, { label: 'ピッキング倉庫', ops: true }, { label: '運送会社', ops: true }, { label: '納品会社', ops: true }, { label: '途中経由1', ops: true }, { label: '操作', ops: true }],
        rows: [{ c: [{ t: 'sel', v: '冷蔵配送', opts: ['冷蔵配送', '冷凍配送'] }, { t: 'sel', v: 'A1', opts: slots }, at(1), at(2), at(3), at(4), { t: 'del' }] }] },
      { t: 'add' },
    ],
  });
}
