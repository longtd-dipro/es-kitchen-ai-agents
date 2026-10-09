# 全サイト共通の業務データ（lib/domain）

法人Web・委託配送先Web・ドライバー・システム管理（と、あとから運営Web）が**同じデータ**を読み書きするための土台。
データは共通 DB（SQLite・`data/es.db` の `docs` テーブル）に1つだけ持ち、どのサイトで書き換えても、開いている全サイトの画面が数秒で読み直す。

- 正の元データ：`01_仕様/90_デモ確認/共通サンプルデータ_20261002.md`（今日＝2026/10/05、サイクル暦、株式会社サンプルの5拠点、番号の形、請求書の金額）
- ID・項目：`01_仕様/基本設計_全体の定義_提案_20261001.md` §6-3、配送は `01_仕様/10_配送/` の v2.3 と `00_決定`
- 運営Web の見本（`lib/ops/**`）の値をもとにしている（ただし下の「運営の見本との食い違い」を参照）
- docs の kind はすべて `dm.<領域>.<種類>`（運営Web の領域 `delivery.*`・`billing.*` などと混ざらないように）

## 使い方（画面から）

```tsx
import delivery from '@/lib/domain/areas/delivery';
import { domainApi, useDomainQuery } from '@/lib/domain/client';

const api = domainApi(delivery);
const { data } = useDomainQuery(api, 'driverDay', { driverId: 'DR00041', date: '2026/10/12' });
await api.action('pickup', { legId, driverId: 'DR00041' });   // ほかのタブ・サイトの画面も読み直す
```

API で直接：`POST /api/domain/<領域>/<名前>`、body `{ "args": { … } }`。

## 領域

| 領域 | 中身 | 主な query | 主な action |
|---|---|---|---|
| `org` | 法人・拠点・担当者・親契約・子契約（サイクル月ごと）・休止・代理店・貸出。お試しの延長（運営だけ・親契約の `trialExt`・`lib/domain/trial.ts`） | `corp` `branch` `branches` `childContracts` `trial` | `updateReceive` `extendTrial` |
| `master` | プラン・機種・オプション・値引き・倉庫／ハブ／返送先・委託配送会社・ドライバー・商品（M001〜M032）・資材・トラブルの種類・税率・商品タグ・商品カテゴリ・商品の変更履歴 | `list({kind})` `drivers({carrierId})` `productHistory({productId})` `supplierProducts({supplierId})` `productImpact` | `addDriver` `setDriverStatus` `update`（商品は変更履歴を残す） `addProductTag` `removeProductTag` `addTaxRate` `removeTaxRate` |
| `delivery` | サイクル・祝日（倉庫ごとの出荷禁止日 `warehouseIds`）・配送・明細・区間・送り状・トラブル・お届け日の変更・資材の注文・スケジュールの移動（`dm.delivery.moves`） | `calendar` `forCorp` `forCarrier` `driverDay` `detail` `movePlan` `moveCalendar` `moves` | `requestDateChange` `decideDateChange` `assignDriver` `pickup` `complete`（お届け日より前は `earlyReason`） `reportTrouble` `resolveTrouble` `setTracking`（送り状番号・ヤマトは12桁） `voidTracking` `move` `setCycleA1` |
| `order` | 月間メニュー（`dm.order.menus`）・商品注文（拠点×サイクル月）・注文の設定・代替品設定（`dm.order.alts`）・代替品の追加発注（`dm.order.altPos`）・仕入先への請求（不良控除 `dm.order.supplierClaims`） | `forBranch`（`limit`＝月の上限） `menu` `menus` `list` `alts` `altSuggest` `altPreview` `altPos` `supplierClaims` `altBill` | `saveOrder`（月の合計≦上限・代替品の行は残す） `savePref` `applyAlt` |
| `menu` | 月間メニューの作成・公開（販売価格の写し）・基準注文数（種類ごとの合計＝50）・公開の条件・CSV取込・毎日の処理、仮発注の承認（`dm.menu.kariApprovals`） | `get` `readiness` `alerts`（運営の TOP） `prevInfo` `kari` | `save` `recalcBase` `resetManual` `publish` `delete` `approveKari` `tick` `importCsv` |
| `apply` | 新規申込（AP）・変更申請（CH、拠点ごとに承認）。承認で変えるデータは `lifecycle.ts` | `forCorp` `list` `get` `setup`（受付の中身・本登録に足りない情報） `equipment`（設備の異動の案） | `submitChange` `withdraw` `decide`（`late`） `submitNew` `advanceNew` `provisional`（仮登録） `register`（本登録） `saveSetup` `saveEquipment` `resetEquipment` `tick`（毎日の処理） |
| `billing` | 請求書（INV）・Bill One の送付の状態（`send`：送付待ち→送付済→開封済／エラー。デモは状態だけ）・確定の月の反映待ち（`dm.billing.lockedSkips`・`lib/domain/locked.ts`） | `forCorp` `list` `get` `buyout({childContractId})` `altLines`（代替品の実績精算の行） `lockedSkips` | `setPayment` `issue` `advanceSend`（デモ：送付の状態を進める） `reapplyLocked`（確定解除のあと反映） `dismissLocked` `editAdjustment`（設備引揚費の金額・0円で外す） |
| `report` | 配送の報告（5ステップ）・駐車場代・棚卸 | `forDelivery` `driverReports` `stockSheet` `stockDue` `parking` | `start` `saveStep` `finish` `reportParking` `decideParking` `fileStock` `confirmStock` |
| `carrier` | 保冷バッグの台帳・見積 | `coolers` `quotes` `monthly`（CSV の元） `alerts`（D-3・D-1） | `setCooler` `requestQuote` `answerQuote` `decideQuote` |
| `notice` | お知らせ（メールだけも可・送信の記録 `sendLog`）・通知（ベル・メール）・メールの文面・お問い合わせ（HubSpot へ送った記録 `dm.notice.inquiries`・運営が開いた `readAt`） | `announcements({site})` `adminList` `inbox({accountId})` `templates` `inquiries` `inquiryNew`（運営の TOP） | `markRead` `saveAnnouncement` `saveTemplate` `sendInquiry`（環境変数 INQUIRY_NOTIFY_MAIL があれば `inquiry_new` のメール） `markInquiryRead` |
| `account` | 全サイトのアカウント・役割と権限・IP・サイトの設定・操作の記録・ログインの記録・アプリのバージョン | `login` `list` `roles` `loginHistory` `appVersions` `summary` | `signIn` `create` `setStatus` `setRoles` `addIp` `setMaintenance` `setAppVersion` |
| `app` | アプリの利用者（U＋8桁）・購入・レビュー・評価タグ・お気に入りの集計・月ごとの売上の集計（`dm.app.*`） | `users` `purchases` `reviews` `sales`（拠点別・商品別） `favoriteStats` `monthlySales` `menuHistory` | `refund` `setLimit` `setStatus` |
| `referral` | 紹介フィーマスタ・紹介（親契約ごと。紹介元＝親契約の `agencyId` か `srcCorpId`）・紹介フィーの支払（`dm.referral.*`）。代理店は `dm.org.agencies` | `feePlans` `agencies` `referrals` `payments` | `saveAgency` `deleteAgency` `saveFeePlan` `deleteFeePlan` `saveReferral` `savePayment` |
| `sample` | 営業サンプル・出荷週の締め・月の件数（`dm.sample.*`。運営の発注・入荷とメニュー管理が読む） | `list` `weekCloses` `quotas` `quota` | `add` `closeWeek` `setQuota` |
| `survey` | アンケート（`dm.survey.surveys`）・回答（`dm.survey.responses`）・テンプレート（`dm.survey.templates`）。回答者＝**アプリの利用者だけ**（2026/10/03：法人・拠点は利用者を絞る条件。法人Web の回答の画面はない）。全員＝有効な拠点（本登録・閉鎖予定で契約が有効・解約手続き中）の利用中の利用者。状態は日時から（予定中／公開中／終了）＋配信停止・削除済。型・入力の確認は `lib/domain/survey.ts`、設問の CSV取込は共通の取込（`lib/csv/survey.ts`）、check は `lib/domain/checkSurvey.ts` | `list` `get` `candidates`（法人・拠点で絞る） `audience` `results`（集計） `answersTable`（回答の CSV：1行＝1人） `templates` | `save`（始まったあとは開始日時・設問の形を変えられない＝文言の修正だけ。`importId`・`template` を履歴に） `saveTemplate` `removeTemplate` `remove`（削除済） `stop`（配信停止） `answer`（利用者だけ） `tick` |
| `stock` | 倉庫在庫の起点（`dm.stock.bases`・THOMAS／ES事務所の棚卸し・資材のしきい値）・入荷の記録（`dm.stock.receipts`・運営が手で入れる）・在庫の記録（`dm.stock.moves`）。計算は `lib/domain/stock.ts` | `receiving({orders})` `alerts` `impact` `levels` `level` `altStock` `materials` `honSchedule` `ledger`（倉庫在庫の見込み・運営の倉庫在庫と発注一覧） | `receive` `resolve`（分納を待つ／代替品で対応／不足を受け入れる／多い分を受け入れる） `addMove` `setBase` |
| `bulk` | 契約の一括変更（`dm.bulk.changes`：倉庫・中継・委託配送先／路線便・価格世代。履歴・進み具合）。プランの価格世代（`Plan.priceGens`） | `cycles` `preview` `history` `get` `priceGens` | `start` `step` `addPriceGen` |
| `csv` | CSV取込・CSV出力の仕組み（`lib/domain/csv.ts`・エンティティの列と保存は `lib/csv/*.ts`・部品は `components/csv/*`。決まり：`00_確認してほしい/CSV入出力_定義_20261003.md`）。取込の確認（`dm.csv.previews`）・裏の取込（`dm.csv.jobs`）・取込の記録（`dm.csv.imports`）・出力の記録（`dm.csv.exports`）・レコードの変更履歴「CSV取込で更新」（`dm.csv.changes`） | `template` `export` `records`（出力だけの一覧：文書の全部の項目） `imports` `exports` `changes` `job` | `importPreview` `importCommit` `jobStep` `logExport` |
| `batch` | 日次バッチ（`lib/domain/batch.ts`・画面なし）：メニューの自動公開・9:00 の通知・受付開始・オーダー締切（デフォルト注文の確定）・配送中・休止／解約・アンケート・本発注のお知らせ・確定アラート・入荷予定日の注意を決まった順に1日1回。サーバーが日付の変わった最初の API で前回の翌日〜今日を動かす（`lib/server/daily.ts`）。本番（`BATCH_SCHEDULER=1`）はスケジューラが 0:00（midnight）・9:00（morning）に `POST /api/batch/run`（ヘッダー `x-batch-token`＝`BATCH_TOKEN`）を呼ぶ。失敗した処理はシステム管理へ通知。実行の記録 `dm.batch.runs`・状態 `dm.batch.state`。デモの「今日」`dm.demo.settings`（DEMO 帯・`/api/demo/today`） | `state` `runs` | `daily` `catchUp` |
| `check` | （データなし）全部のつながり・計算を確かめる | `run` | — |

- 自販機の列の構成は `dm.master.vmLayouts`（`master.vmLayouts`・`setVmLayout`）、平均単価の目標は `dm.menu.avgTarget`（`menu.avgTarget`・`saveAvgTarget`）
- `check.run` の続き（アプリ・紹介フィー・営業サンプル・自販機の列・平均単価）は `lib/domain/checkMore.ts`、（移動・サイクル暦・ドライバーの報告・価格世代・一括変更）は `lib/domain/checkMove.ts`
- **倉庫在庫・入荷（課題 2-1・2-3・2-5・2c の残り・2026/10/02 決定）**（`lib/domain/stock.ts`・確かめは `lib/domain/checkStock.ts`）：
  - 在庫＝起点（棚卸し）＋入荷（入荷の記録）−出荷（便の明細の予定数・資材は資材便だけ。資材は食品の便では送らない）±在庫の記録。資材はすべてのピッキング倉庫（ES事務所も）で持ち、しきい値を下回ると運営の TOP に出す
  - 入荷：倉庫にアカウントがないので運営が発注・分納の回ごとに商品の数・箱数を入れる（入荷実績 CSV は使わない・入荷指示 CSV は出す）。発注の数と違えば「差異あり・対応待ち」（運営の TOP・発注の一覧にアラート）→
    分納を待つ（3回まで）／代替品で対応（代替品設定をつなぐ）／不足を受け入れる（影響する便のその商品を ③ 除外＝注文の行 `kind:'除外'`・`shortId`、請求しない・法人へ通知・出荷指示を送った便は rev+1）。発注（仕入先サイトと同じ共通 DB の orders）は呼ぶ側が渡し、入荷済にする（追加発注はここで入荷済）
  - 入荷予定に数える発注＝共通 DB の発注（仕入先サイトと同じ orders テーブル。領域からは読むだけの kind `db.orders`・`lib/server/docs.ts`）＋運営の発注（`purchasing.orders`）＋代替品の追加発注。同じ番号は1つ（`knownOrders`）。運営の倉庫在庫・発注一覧の「倉庫（見込み）」・入荷登録・代替品設定・資材の在庫は同じ計算（`stockLedgers`・`check.run` で突き合わせ。マイナスになるなら必ず不足見込み）
  - 本発注は月2回（前半 A・B＝前のサイクルの B5〜C1、後半 C・D＝D5〜A1。`honSchedule`）。仮発注はメニューの公開の前（公開の条件）
  - 代替品の追加発注（`dm.order.altPos`）は仕入先サイトの発注一覧にも出る（`lib/ops/purchasing/docRepo.ts` の `withAltPos`。共通 DB の orders と同じ Repo）。仕入先の回答で入荷予定日を直す（`etaFrom`：仮＝発注日＋3日／仕入先の回答）。代替品設定の在庫の見込みは `stock.altStock`
- **棚卸**：拠点の `noStockCheck`（棚卸なし）＝管理ロスなし・督促なし（`report.stockDue` に出さない・申告できない）。点検する商品はその拠点に関係する商品だけ（前回の点検・届けた・お届け中・廃棄する。`report.stockSheet` の rows に `inTransit`・`toDispose`・`appSold`）。
  申告の `arrived`＝お届け中で届いて数に入れた数。理論在庫＝前回＋届けた＋arrived−アプリの販売−廃棄、差分率＝(理論−申告)÷理論・廃棄率＝廃棄÷(前回＋納品)、10% 以上は運営の在庫管理・実績精算で赤（アラートの子契約はまとめて確定できない）

## データのつながり（1つ直すと、ほかもそろう）

- **仕入先 ↔ 商品 ↔ ピッキング倉庫 ↔ メニュー**：商品（`dm.master.products`）は仕入先（`suppliers`、選択中の1社＝`supplierId`）とピッキング倉庫（`pickWarehouseIds`）を持つ。
  拠点が月間メニューで選べる商品は、子契約の便の倉庫（`channel.warehouseId`）が商品のピッキング倉庫にあり、子契約のコース（ESスタンダード＝スタンダード、ESライト＝ライト）が商品の `courses` にあり、
  ESライト（自販機）は拠点の自販機（貸出中の機種）が商品の対応機種（`vending.models`）にあるものだけ（`lib/domain/product.ts` の `sellable`、`seed/order.ts` の `eligible`）。運営のメニュー（`lib/ops/menu/logic.ts` の `prodsFor`）も同じ決まり
- **商品 → 仕入先サイト**：仕入先のプロフィールの取扱商品＝商品の仕入先にその会社がある商品（`lib/supplier/fromDomain.ts`。共通 DB では読むたびに作る）
- **販売価格は税込**。税率は `dm.master.taxRates`（商品マスタのドロップダウンからその場で足す・使っていなければ消せる）。商品タグ `dm.master.productTags` は商品マスタに持たず、メニューの画面で名前を足す・消す（月間メニューで使っていれば消せない。台帳 F 2026-10-08）。商品カテゴリは `dm.master.productCategories`（運営の商品カテゴリ管理・法人Web も読む）
- **買取**：子契約の `pricing`＝通常価格・従量（売れた数×販売価格）／企業独自価格・買取（届けた数×企業の価格、売れ残りは企業の負担）。見本はことぶき商会 本店（CP0000093）。金額は `billing.buyout`（`product.ts` の `buyoutOf`）。請求書の行にはまだ入れていない

- **マスタを変えても古いデータは変わらない**（`lib/domain/snapshot.ts`・課題 7-1）：子契約の ① 費目は作ったときの金額（`fees`。価格の切り替え・訂正は未確定の子契約だけ `org.repriceChildren`）。
  子契約の請求の状態 確定（請求の画面の「確定」）・請求済（請求書の発行）は変えられない（`org.updateChild` が 409。アプリの設定だけ可）。請求の画面は確定したときの金額を写して固める（運営の `billing.br` の `frozen`）。
  実績精算の単価は月間メニューの写し、委託の支払額は納品したときの区間の `feeYen`、仕入の金額は本発注したときの発注の `unitCostYen`、納品した明細の商品名・拠点名は納品したときの名前（画面は「旧名（現：新名）」）
- **月間メニュー**（`lib/domain/menu.ts`）：商品ごとに表示順（法人が見る順）・公開可能・この月のタグ・営業サンプル・基準注文数（50プランの代表値。std＝ライト・スタンダード／ns＝短消費期限なし／vm＝ライト（自販機））。
  基準注文数は前の2〜3サイクル月の注文の割合で 50 を按分（新しい商品は同じカテゴリの平均・1商品1以上）。手で直した値（`manual`）は再計算で上書きしない。ほかのプランは食数に合わせて按分（`scaleBase`）。デフォルト注文はこの値から作る
- **公開**：条件＝全商品が公開可能・メイン画像あり・メニューPDF あり・その月の仮発注が承認済（`menu.readiness`）。条件を見ない公開（force）はない。公開したら法人（契約のある拠点・その法人）だけに通知（アプリの利用者には出さない）。
  自動公開（`corpPublish:'自動公開'`）は `menu.tick` が自動公開日に公開（条件がそろっているときだけ）。3日前から条件が足りなければ運営の TOP（ダッシュボード）にアラート（`menu.alerts`。通知は出さない）
- **基準注文数**：種類ごとの合計＝50（対象の商品があるとき）。保存・CSV取込のときに、手で直していない値を入れ直して 50 にする。手で直した値だけで 50 にならなければ 400
- **公開中の変更**（オーダー締切日まで）：商品の追加・並び・タグ・公開可能・基準注文数・PDF。注文（登録済・ES登録済）にある商品は外せない（409・代替品設定へ）。デフォルト注文は作り直す。変更履歴（`log`）・`notify:true` で法人に再通知。締切後（締切済・配送中）はロック
- **販売価格の写し**：公開したとき各商品の税込価格・税率を `menu.prices` に写す（公開中に足した商品は足したとき）。その月の注文・請求・代替品の単価はこの値（`unitPrice`）。
  公開したメニューにある商品の価格・税率を商品マスタで変えるときは `priceMode`：価格改定（写しはそのまま・次のメニューから）／誤りの訂正（理由が要る・写しと差替の単価を直す・確定済みの請求書の一覧を返す）。`notify` で法人へ。
  ピッキング倉庫・コース・自販機の変更で注文している便に出せなくなる拠点があるときは `confirm`（先に `master.productImpact`）
- **代替品設定**（`lib/domain/alt.ts`・`order.applyAlt`）：注文の行の `kind`＝通常／差替（① 元の商品のメニューの単価で請求）／補償（② 0円の行）／除外（③ 届けない・請求しない）、`altOf`＝元の商品、`billPrice`、`altId`。
  配送の明細も同じ（`substitutedFrom`）。出荷指示を送ったあと（前半・後半の最初のお届け日の3日前から）なら版番号つきで再送（`shipRev`）。② は次の便（ない・14日より先なら追加配送＝子の配送・`feeBy:'ES'`）。
  保存前に倉庫ごとの 必要数／倉庫在庫／入荷予定／不足（`altPreview`。倉庫在庫は呼ぶ側が渡す）。不足は追加発注（`dm.order.altPos`・運営の発注一覧に出る）、入荷前の便は入荷のあとの便へ。
  代替商品が便の倉庫にない拠点は在庫のある倉庫から追加配送。仕入先への請求＝不良の数 × 仕入単価（`dm.order.supplierClaims`・不良控除）。拠点の不良品は廃棄（ES配送便＝ドライバーが回収、COOL便＝棚卸で申告。`report.stockSheet` の `altDisposals`）。
  代替品設定の不良商品は、対象期間（出荷日）の便に法人・運営の注文で入れ直せない（`order.forBranch` の `slots[].blocked`・`saveOrder` は 409。対象から外した便の今の数まではそのまま。デフォルト注文にも入れない）。
  法人へメール＋お知らせ（`alt_notice`）。お届け詳細・ドライバー・委託配送先の明細に「代替品（元：〇〇）」、除外は「納品分に含まれません」
- **月の注文の上限**（拠点ごと）＝1回の食数 × 配送の回数（子契約）。便ごとの数はばらついてよい。商品ごとの最大注文数はない
- **アプリの利用者への通知**（`to.site:'app'`・`accountId`＝拠点ID）：ドライバーが納品を完了したとき「お食事が届きました」。路線便はお届け日の 9:00 に出す予約（`scheduledAt`。`menu.tick` が出す）
- **注文 → 配送の明細**：法人が商品注文を保存すると、その便の配送（予定・出荷待）の明細と予定数も同じ中身になる（倉庫・ドライバー・運営が見る品目＝法人が頼んだ品目）
- **報告 → 配送 → 法人**：ドライバーが5ステップの報告を終えると配送が納品済（検品の数が足りなければ一部納品済＋数量相違のトラブル）。法人Web には「お届け済み／一部お届け済み」と出る
- **申請の承認 → 契約**（`lib/domain/lifecycle.ts`・課題 3-2〜3-7・3-12）：
  - 新規申込：仮登録（`apply.provisional`）＝法人（新しいとき）・拠点・親契約（仮登録）・担当者・アカウント（ログイン前・案内）・最初の注文（デフォルト・行は本登録のあと）・資材の初期セット。
    本登録（`apply.register`・拠点ごと）は `missingOf` が空で運営が「すべて入れた」（`setup.branches[].checked`）を確かめてから＝子契約・配送・資材便・貸出（標準貸出設備）。全拠点で申込は完了。締切後は翌サイクルから（28-27・お知らせに書く）
  - お試し→本導入：同じ親契約のまま `kind`＝本導入・`kindHistory` に足す。間は休止と同じ（休止を登録）・1年を超えるなら 409（新規申込）。置いたままの設備は本導入の開始日から数える（`Loan.countFrom`）。多い・大きい分は最初の本導入の子契約の `extras`（単発）。メール M3
  - プランの変更：締切前・未確定の最初のサイクルから。1回の納品数＝温度帯の月次提供上限 ÷ 便の回数（`Plan.limits`）、冷凍の便を足す・外す、配送回数追加・移行割（`DC000021`）、月額・① 費目。配送を作る・取り消す、デフォルトの注文を作り直し、上限を超える登録済の注文はデフォルトに戻して法人へ再注文のお願い。
    設備の異動の案（`Plan.stdEquipment` と貸出の比較：入替・追加・回収、費用の案＝入れ替えの配送・標準を超える月額・サイズ差額・移行割の冷凍庫の賃料）を運営が直して（`saveEquipment`）承認 → 貸出と子契約の `extras`
  - 休止：締切前のサイクルから子契約を取消（`canceled`・一覧に出さない）・配送・注文を取り消し・委託配送先へ通知。確定・請求済の月は子契約は残して配送・注文だけ取り消す（返金は請求調整）。通算12サイクルまで。設備を引き揚げるなら貸出を回収予定
  - 解約：親契約＝解約手続き中（`endOn`＝最後のサイクルの D7）・拠点＝閉鎖予定・解約日のあとの子契約・配送・注文を取消・委託配送先へ通知・貸出＝回収予定（回収の配送は作らない。回収したら `org.returnLoan`）・違約金（設備ごと・休止中は数えない）を最後の子契約の `extras`・アカウント＝参照のみ
  - 毎日の処理 `apply.tick`：休止の始まり・終わりで親契約（利用休止／有効）、解約日を過ぎたら終了・閉鎖、最後の請求書（解約日のあとに発行したもの）の入金期限を過ぎたら参照のみのアカウントを利用停止・メール
  - やり直し（`undoDecision`）：休止・解約は承認で変えたデータの元（`Application.undo`）に戻す
- **お届け日の変更の承認 → 配送の日付**、**区間の割り当て → ドライバーのその日の一覧**
- **スケジュールの移動**（`lib/domain/move.ts`・課題 2-4）：ドラッグはしない。チェックで選んだ配送 → お届け日。本発注（前半＝前のサイクルの B5〜C1、後半＝D5〜A1。`stock.ts` の `honSchedule`）の時期の終わりより前は複数・同じサイクルの中、後は1便（同じ拠点・同じ日の冷凍・冷蔵は一緒）・理由・A↔B／C↔D。
  お届けしない日（祝日・日曜）は確かめて動かす（`confirmHoliday`）、別のサイクルはトラブルの対応だけ（`trouble`＋`confirmCross`）。便（`slot`）は変えない（注文の行のキー）。出荷指示を送ったあとは `shipRev`+1。委託配送先・ドライバーへ通知、法人は `notifyCorp`。配送の `moveId` に最後の移動
- **サイクル暦の A1**（課題 4-10）：配送データ（ほかのサイクルから動かして来た配送も）がないサイクル月だけ `delivery.setCycleA1`。重なる後ろの月は同じ日数だけ動く（間はサイクルなし）
- **契約の一括変更**（`lib/domain/bulk.ts`・課題 7-2）：運営の倉庫マスタ・委託配送先マスタ・プランマスタのモーダル。変えるのは倉庫・中継・お届けする運び手・価格世代だけ。適用開始＝未確定の子契約があるサイクル月。
  確定・請求済の子契約は変えない。出荷の前の配送の倉庫・区間を直す（出荷指示を送ったあとは `shipRev`+1）、新しい倉庫にない商品の登録済の注文はデフォルトに戻す（締切後の月はその子契約をスキップ）。価格世代は `org.repriceChildren`（`contractIds`）。100件を超えたら件数の打ち直し、`start` → `step` で分けて進める。元に戻す操作はない
- **ドライバー**（課題 4-1〜4-4）：納品はお届け日だけ（前は確認＋理由＝`earlyReason`）。集金のステップは集金ありの拠点だけ。数量相違のトラブルは配送に1つ（ドライバーの報告と自動を1つにまとめる）。完了から7日まで検品も直せる（`delivery.ts` の `reinspect`）・トラブルがある配送は直せない。検品・納品の数は明細の行ごと（`lineId`。同じ商品の通常＋代替品の差替の行を別に持つ。`lineId` のない行は商品ごとの合計として上の行から埋める＝`delivery.ts` の `lineQtys`）。トラブル・複製の子の明細 ID は親の行の ID を引き継ぐ
- **オプション・値引きの削除**（課題 4-9）：状態＝削除済（データは残す）。`master.list` と運営の一覧・選択肢には既定で出さない。子契約に新しく付けられない
- **操作 → 通知**：申請・承認、トラブル、お届け日の変更、割り当て、駐車場代、未入金、運営の代理注文で、相手のサイトに通知（`lib/domain/notify.ts`）
- **旧システムのメール・お客様の休みの日**（2026/10/03 決定・`lib/domain/mails.ts` の `OLD_MAILS`・日次バッチ `customerNotice`＝`lib/domain/customerNotices.ts`）：お客様（法人・拠点・アプリの利用者）への予定のお知らせ（自動公開・受付開始・締切3日前の未入力・前月21日のお届け予定日・路線便の 9:00・アンケートのリマインド・重要なお知らせの 8:00）は、土日・全社の祝日なら前の営業日に送る（`customerSendDay`・拠点ごとの休日は見ない）。すぐ送るもの（パスワード再設定・申請など）はそのまま。
  足したメール：オーダー登録・担当者変更・仮発注／発注確定（仕入先）・配送依頼（同じ出荷日・会社の送り状／出荷指示がそろったら・子の配送は数えない）・新規ES配送プラン（委託配送先）。お問い合わせの新着を運営へは送らない

## 機能パック1（2026/10/03「Chức năng chưa làm – chốt」）
- **調整明細**（`dm.billing.adjustments`・`lib/domain/adjust.ts`・決定 TL-7 A）：請求済みの月にかかるプランの変更・休止・再開・解約・誤りの訂正（`org.repriceChildren`）・設備の費用を承認すると、サイクル月ごとの差額（税率ごと・日割りなし）を自動で作る。
  請求済みの子契約は契約（プラン・便）を新しい値にし、① 費目は請求したときの値のまま。価格改定（価格世代の切り替え）では作らない。承認の前の試算は `apply.billedPreview`（データを変えない `dryRun`）。
  運営の請求は ③ 調整に「調整明細（自動）」として出し、次の請求書に1行ずつ載せる（`InvoiceLine.adjId`。発行で `invoiceId`、取消で外す）。25日の確定のあとにできたものは翌月へ
- **年払い**（S3-1・S3-2）：請求先の支払サイクル＝年払いは、起算月（契約開始のサイクル月から12ヶ月ごと）の請求書に12サイクル分（`InvoiceLine.cycleTo`）。実績精算は毎月。見本は淀屋橋ES（CP0000051・2026-04 起算・`INV-2026040001`）
- **最終請求書**（解約）：解約日を含む実績精算の締め月に、その拠点だけの1通（`Invoice.final`）。最後の実績精算・違約金（調整明細）・調整明細。入金期限のあとアカウント停止（`finalDue`）
- **事務手数料**（棚卸の未報告・¥3,000）：20日の締めまでに申告がない拠点（休止中・棚卸なし・お試しを除く）。21日以降の申告は実績精算に使い、事務手数料はかかる
- **設備の変更**（申請）：承認の画面の設備の異動の案（`equip`：今の貸出から入替・追加・回収、費用の案＝配送・サイズ差額・追加の月額）で貸出と子契約の費用を変える。やり直しで戻せる
- **在庫戻し**（REQ-PO-603・W6）：初期値は次の注文を受けるメニュー（公開中・編集中）で使わない商品だけ余り全部。戻す数は余りまで（運営の `purchasing.createReturn`）
- 確かめ：`check.run` の続き `lib/domain/checkBilling.ts`

## 2026/10/03 朝の決定（グループ A）
- **アンケート**：アプリの利用者だけ。設問は回答が始まったら文言の修正だけ。回答の CSV（1行＝1人）。テンプレート（ST-001 満足度調査・ST-002 メニュー評価・ST-003 アプリ使い勝手は消せない）。設問の CSV取込は共通の CSV取込（取込の記録）
- **新規申込の CSV一括登録**（`lib/csv/apply.ts`・`newApplications`）：代理入力の画面と同じ確かめ・`applications.createIntake`。1行＝1拠点、申込キーが同じ行＝1つの申込
- **委託配送先のスタッフ**：免許未登録のドライバーにはアカウントを発行しない（`account.create`・`setStatus` が 409。CSV の新規は免許未登録）
- **オプションの管理名**（`Option.mgmtName`。`name`＝請求書表示名）：OP000016 は請求書では「事務手数料」・管理名「棚卸し未実施」。OP000008 は請求書でも「初期費用」（2026/10/03 回答）。運営の一覧・選択肢・CSV は管理名
- **オプション・値引き＝1つの費目のマスタ**（2026/10/03 決定・`00_確認してほしい/オプション・値引き_定義_20261003.md` §4・`lib/domain/charges.ts`）：
  - ID は変えない（OP／DC。廃止は 終了・削除済で残す）。項目：請求書の表示名（`name`）・管理名（`mgmtName`）・連動タイプ（`linkType` A／none・`linkedItem`）・金額の種類（`amountKind`）・単位・いつ発生するか（`trigger`）・自動／手（`auto`）・対象のコース／機種区分。値引きは `calcKind`（fixed／rate／liteBase／refPlan）・`refPlanId`・`maxPerCorp`・`months`・`autoCondition`・受付期間
  - コードが使う ID は `CHARGE_IDS`（trigger → ID）だけ。金額・税率・名前はマスタから読む（設備配送料 OP000019／020・階段 OP000021・サイズ差額 OP000023・事務手数料 OP000016・資材の追加配送 OP000036・初期費用 OP000008）。運営の一覧・受付の選択肢（`intake.ts` MD_OPTS／MD_DISC）・法人の申込（OPT_MASTER・DLV_ADD）・請求の見本の値引きはマスタから作る
  - A型（ES-QR OP000002・ゲスト OP000003・ユーザー現金利用 OP000035・配送回数追加 OP000001）は契約項目と1つのデータ（`syncLinked`：フラグを変えるとオプション、オプションを付け外しするとフラグ）。配送回数追加は温度帯ごとに標準を超えた回数（子契約 `deliveryExtra`）× 金額
  - 子契約の金額の上書き（`ChildContract.amounts`・REQ-CT-304：ES-QR の既存のお客様 0円・自販機リース OP000037 など）。単発料金のオプションは `org.addChild` で引き継がない
  - お試しキャンペーン割引 DC000013＝50プラン ESライト（冷蔵庫）のその月の料金（請求額を超えない・法人ごとに1回＝同じ月は拠点ID の小さい拠点だけ）。DC000003 は DC000021 に統合（終了）。決定のない値引き DC000001・002・004・007〜012 は入れていない（案は定義の §9）
  - 初期費用（OP000008）：本導入の本登録で1回だけ調整明細（当月の請求書）。金額は受付の `initFeeYen`、なければプランマスタの `initFees`（自販機 50,000円）・なければ OP000008。③ 調整で直せる
- **プランマスタの設定が効く**（2026/10/03 回答）：企業負担額（`welfareYenPerMeal`・企業負担分＝額 × 食数 ÷（1＋税率）の切り捨て）・免責金額（`deductibleYen`・運営の実績精算）・基本比×倍（`baseRatio`・デフォルト注文の倍）・初期費用（`initFees`）・初期備品（`initialItems`・仮登録の資材の初期セット）・プランに含む資材（`includedMaterials`）。残りわずか率・利用人数目安は持つだけ
- **画面の入力と元の1本化**（2026/10/03）：子契約の金額の上書き（`ChildContract.amounts`）は運営の契約画面の「オプション・割引」表の金額（金額の種類＝契約ごと・ES-QR のみ入力できる・`org.updateChild`・履歴に残る）、初期費用（`initFeeYen`）は受付画面の「共通データの登録」、初期備品・プランに含む資材は運営のプランマスタ詳細（`master.setPlanMaterials`）、資材の単価・税率は資材マスタ（`master.setMaterialPrice`）。プラン・資材・オプション・値引きの変更は操作の記録（`dm.account.audit`・target＝`<種類>:<ID>`）に残り `master.history` で読む。運営の受付の選択肢・法人Webの申込フォームのプラン表・機種・オプションは `master.formMaster`（`lib/domain/formMaster.ts`）＝共通データのマスタから作る（画面に価格表のコピー・見本の seed を持たない）
- **資材の請求**：同じサイクル月の2回目からの資材便は OP000036（`MaterialOrder.cycleMonth`）。プランの数量を超えた資材は 資材の単価（`Material.priceYen`・既定 0円）× 超えた数（`MaterialOrder.excess`・注文したときの写し）。どちらも締めの期間の後払い
- **実績精算が未確定でも請求書を発行**（REQ-CT-301）：運営の請求は前払いの確定だけで請求書を作れる。未確定の実績精算はその請求書に入れず（`billing.br` の `actLater`）、確定したら後払いの行を翌月の ③ 調整（「【締め月 締めの実績精算】…」）にする。実績精算の行の税率は商品マスタの税率
- **商品の ES の期限**（`product.ts` の `esExpiryOn`）：法人の商品の詳細に表示・運営の発注（短消費期限の保証日数）・棚卸の「期限切れの見込み」（`report.stockSheet` の rows の `expired`・廃棄の提案）。同梱資材・出荷時の特殊指示は出荷指示 CSV（THOMAS・運営の `delivery.shipOrders` の `thomasCsv`）に出す（資材の在庫は引かない）
- 確かめ：`check.run` の続き `lib/domain/checkCharges.ts`
- **確定の月**：プランの変更・誤りの訂正の承認では確定（未発行）の月を変えずに反映待ち（承認の画面・運営の TOP にアラート。確定解除してから「反映」）
- **設備引揚費**（OP000022）：0円（2026/10/03 回答）。解約では自動で載せない。必要なときは運営が ③ 調整で入れる
- 状態の色：一部納品済・一部お届け済み＝黄（対応待ち）。確かめ：`check.run` の続き `lib/domain/checkPackA.ts`

## 4a・4b の答え（2026/10/03）と仕入先の置き場
- **4a-10** 仕入先の回答の入荷予定日が、入荷を当てにした便の出荷に間に合わない → 便は動かさず `stock.alerts` の `altLate`（運営の TOP・発注の一覧）
- **4a-11** 棚卸は前回の点検で数えていない届けた配送を数える（`StockCheck.deliveryIds`・`transitIds`）。販売・廃棄は前回の点検日の翌日から
- **4b-2** 移動先は倉庫の出荷できない日だけ止める（月曜はお届けしない日として確認）。**4b-4** トラブルの対応は `troubleId`（記録したトラブル）が要る
- **4b-6** 一括変更の注意（新しい倉庫の出荷禁止日・リードタイム）は `ackAlerts` で実行・`BulkChange.acks` に残す。**4b-7** 中継の区間1は `leg1CarrierId`（中継の運営会社か委託）。**4b-8** 締切後の月はスキップ・理由を結果に出す
- **4b-9** 料金の元は価格世代だけ（`bulk.updatePriceGen`・`deletePriceGen`・`correctPriceGen`。使っている世代は見るだけ・誤りの訂正）。**4b-10** A1 を動かしてもオーダー締切は動かさない（合わなくなったら warnings）
- **仕入先**：運営の仕入先マスタ・申込・承認・仕入先サイトのログインは共通 DB の suppliers（kind `db.suppliers`・`lib/ops/general/suppliers.ts`）

## 月間メニュー・商品マスタ（MM の決定との突合・2026/10/03。`00_確認してほしい/メニュー・商品マスタ_MM要件との突合_20261003.md`）
- **商品名は4種類**（2026/10/03 決定）：`name`＝公開名（日本語・法人Web・アプリ・請求書）、`nameEn`＝公開名（英語・CSV に出す。RD-MN-073）、`mgmtName`＝管理名（運営の一覧は品番と並べる）、`supplierItemName`＝仕入先向けの名前（仕入先サイトの取扱商品・代替品の追加発注）。空なら公開名（`product.ts` の `mgmtNameOf`・`supplierNameOf`）
- 新規登録のメニューは前月を複製しない（RD-MN-012・022）。定番（`Product.regular`・RD-MN-014 暫定）の商品だけ入れる。営業サンプル件数は月60件（RD-MN-045）
- 「おすすめ」タグは使わない（RD-MN-106）。短消費期限はタグではなく `shelfLife.shortClass`（RD-MN-099）。ES の期限の日数から区分を自動で選ぶ（`shortClassOf`・【仮】7日以内＝ショート／30日以内＝セミショート。変換ルールは要確認）
- 商品タグはメニューの商品ごと（`MenuItem.tags`）に月ごとに付ける1種類だけ。NEW も特別扱いしない（台帳 F 2026-10-08。旧 `withFixedTag`・RD-MN-103 は廃止）。メニューPDF は 5MB 以下（RD-MN-030）。公開ステータスは編集の画面でだけ変える（RD-MN-035）
- 商品：必須は基本情報だけ（RD-MN-065）・写真5枚まで（RD-MN-068）・JAN 8〜13桁（RD-MN-069）・シングルとダブルをまたがない（RD-MN-129）・1食当たりの栄養成分は 100g当たり × 内容量（RD-MN-118）・商品タグは20個まで（RD-MN-102）
- 仕入単価の改定（RD-MN-076）：`ProductSupplier.nextCost`（新しい単価・適用開始日）。読むときは `costOn`（発注の写し・追加発注・一覧の粗利率）。適用開始日のあとに商品を保存すると `unitCostYen` に入れ替える
- **請求の後払いの税**：販売価格（税込）から出した行（実績精算差額・現金回収差額・代替品）は請求書の明細では税抜（`exTax`）。事務手数料はオプションマスタ OP000016 の金額・税率（`lib/ops/areas/billing.ts` の `penaltyCfg`）
- 確かめ：`check.run` の続き `lib/domain/checkMenuMaster.ts`・`lib/ops/areas/billing.ts` の `arrTaxProblems`

## サイトごとのログイン（見本）

| サイト | ログインID | 主に読むもの |
|---|---|---|
| システム管理 | `SY00001`（管理者）／`SY00002`（監査） | `account.*`・`notice.templates`・`account.loginHistory` |
| 法人Web | 法人 `CU00001`／拠点 `CU00871` など | `org.corp`・`delivery.forCorp`・`order.forBranch`・`apply.forCorp`・`billing.forCorp`・`report.stockSheet`（COOL便の拠点） |
| 委託配送先Web | `DE00001` 栄成ロジ／`DE00006` みどり便／`DE00007` 山本配送 | `delivery.forCarrier`・`carrier.*`・`report.parking({carrierId})` |
| ドライバー | `DR00041` など（`DR00008` は未発行） | `delivery.driverDay`・`report.forDelivery` |
| 仕入先 | `SP00001` など | 発注はいままでどおり `/api/supplier/**` |

- `account.signIn({ site, loginId, ip })` でログインする（記録が残る・IP ホワイトリストを確かめる）。返る `scope` で読むデータを絞る
- **API はまだ scope を確かめていない**（本番の認証を作るときに足す）

## 見本の見どころ（今日＝2026/10/05・9月サイクル D1）

- **株式会社サンプル**：本社（自社ドライバー 小林・A3/C3）、大阪支店（関西倉庫→みどり便 西村・A2/C2 25食・現金利用あり）、千葉（COOL便・A3/C3）、横浜（COOL便・冷蔵 A2/C2 各40＋冷凍 A2/C2 各10）、
  名古屋（中部倉庫→栄成ロジ・A3。2026年10月〜12月サイクルは休止・設備は置いたまま・再開 2027年1月＝シナリオ説明書 ⑤。今日は利用休止）。代理店は法人に1つ（AG00021・本社 ¥53,000）
- **大阪キッチン株式会社**（CU00003・淀屋橋ES CU00671・CP0000051）：運営の請求の見本（C3）と同じ法人。当月請求（リードタイム 0）・拠点ごと発行。11/01 発行の請求書を Bill One に送ると1回目がタイムアウト（運営 `lib/ops/billing/masters.ts` の `BO_FAIL_ONCE`・シナリオ説明書 ⑩）
- **配送**：大阪 9/15 の便が5食不足→一部納品済→子の配送 `DL-260914-0001-1` で 9/17 に届けた。10/13＝`DL-261012-0011`、11/10 に変更申請 `DD-20261005-0095`（運営が「別の日のご提案」11/13）・12/08 に `DD-20261005-0096`（申請中）・12/22 に `DD-20260930-0001`（否認）。資材の配送 `DL-261006-0103`（`MO-2610-0013`）
- **今日のドライバー**：高橋（ひかり物産 本社）・佐々木（ことぶき商会 本店）が 10/06 の便を受け取る → 5ステップの報告 → 完了まで動かせる
- **月次注文**：11月メニュー公開中（10/01〜10/15・PDF あり・仮発注 承認済）。本社＝登録済、大阪・横浜＝デフォルト（基準注文数から）、仙台（お試し）＝参照のみ。
  12月メニュー＝編集中・自動公開 2026/11/01（M025〜M027 が公開可能でない・PDF なし・仮発注 未承認 → `menu.readiness` に3つ出る。`menu.alerts({today:'2026/10/29'})` で運営の TOP に出る）
- **代替品設定**：`ALT-2610-0001`（シナリオ説明書 ⑦：M002 デミグラスハンバーグ → M003 チキンのチーズソテー、全ロット・10/02 発覚・返品）。大阪支店 9/29 の便 `DL-260928-0014` は ② 補償 2食（10/13 の便 `DL-261012-0011` で届け、ドライバーが不良品を回収）、10/13 の便は ① 差し替え 2食。
  ほかの拠点の同じ期間の便も同じ決まり。関東倉庫の M003 が足りず追加発注 `PO-202609-M003-ALT01`（入荷予定 10/08）→ 10/06・10/07 出荷の便（出荷指示 rev2）は入荷のあとの便へ。不良控除 `SC-ALT-2610-0001`（`lib/domain/seed/alt.ts`。見本は `registry.ts` で action を動かして作る）
- **申請**：大阪のプラン変更（承認待ち）、法人情報の変更（法人アカウントから）、休止・再開・解約・新規申込（受付中〜完了・却下・取り下げ）
- **請求書**：`INV-2026080001` ¥90,000（未入金→繰越）、`INV-2026100001` ¥181,080（再請求込み）、千葉 `INV-2026100015`・横浜 `INV-2026100016`
- **棚卸**：2026-09 の締めは申告・確認済み、2026-10 の締め（〜10/20）はまだ（`report.stockDue`）
- **委託配送先**：見積 3件（決定・回答中・依頼中）、保冷バッグ 8件、12月初めにドライバーが決まっていない区間（`carrier.alerts`）
- **システム管理**：ログインの記録（失敗・IP で止めた記録あり）、アプリのバージョン、メールの文面 15種類

## 運営の見本との食い違い（共通データでの決め方）

運営Web の見本は、元のデモ HTML ごとに別々に作られていて、**同じ ID が別の会社・拠点**になっている（例：CU00002＝申請では東京フードサービス、メニューではミドリ商事／CP0000012＝契約では仙台本社、メニューでは横浜支店／CU01101＝メニューでは別の拠点）。共通データでは：

- 株式会社サンプルとその拠点・ほかの法人（みらい・みちのく・あおば・ひかり物産・ことぶき・さくら建設・カフェ花）だけを持つ
- 運営の見本の申請（東京フードサービス・大阪キッチンの分）は、**中身はそのまま**で共通データの拠点に付け替えた（`seed/apply.ts` の先頭に対応表）
- みらい商事のお試しの申込は、契約（9月サイクルから）に合わせて `AP-20260812-0044`（運営の見本は AP-20260912-0044）
- ★ ドライバー・委託配送先の画面用に足した拠点は `CU01901〜CU01904`／親契約 `CP0000091〜94`（運営の見本のどの ID とも重ならない）
- 商品は運営のメニューの M001〜M032（仕入先サイトの品番と同じ）。請求の見本の商品（牛カルビ弁当など・数字の ID）は使わない
- 運営の画面を共通データにつなぐときは、`lib/ops/**` の見本ではなくこの ID に合わせる

## 決めて入れた値（仕様にない・食い違っていたもの）

- 拠点の状態は 仮登録／本登録／閉鎖予定／閉鎖 だけ。休止は契約（利用休止）から出す（仕様整理 §6-2）
- 拠点アカウントのログインID は大文字の `CU00871`（小文字でも通す）
- 祝日はお届けしない・倉庫は動く。お届けできない日は同じサイクルの同じ半分の中で前へ（なければ後ろへ）
- 自社ドライバーの所属先を `DE00000 ES配送便（自社）` として置いた
- 仙台 C4、★拠点の枠は仮。集金の予定額は仮（1,200円〜。本番はアプリの現金利用の合計）
- プランの温度帯ごとの上限（冷凍＝月次提供数の2割）・標準の配送回数・標準貸出設備（資材ボックス BX000001×3）・機種の回収額は【仮】（`seed/master.ts`）
- サイクル暦は 2026-09〜2027-04（課題 3-13）。子契約・配送は 2027-03 まで（2026-12 から先は先行生成・請求は未確定。プランの変更・一括変更・価格世代を当てられる）。
  注文は 2026-12 まで（12月＝編集中のメニューの基準注文数からデフォルト。2027-01 から先はメニューがないので注文なし・配送の予定数 0）。承認済みの休止の月の子契約は取消（canceled）で残す。
  子契約の請求の状態は前払いの請求月（サイクル月＋リードタイム）で決める：10/01 までに発行した月＝請求済、11/01 から先＝未確定
- 倉庫在庫の起点（9/30 棚卸し・`areas/stock.ts`）は、見本の便の予定（12月サイクルまで）と入荷予定でマイナスにならない数＋余り。M003 は代替品設定の分が足りない（追加発注の見本）
- プランの価格世代は「改訂第三回目（2026/04〜・いまの世代）」だけ持つ。改訂第四回目（ESライト ¥25,000）はシナリオ ⑲ の中で足す
- OP000036 資材の追加配送＝¥2,000（追補5 Q13・仮）
- システム管理の ID は `SY`＋5桁。セッション時間・IP をどのサイトに効かせるか・ドライバーのセッション（12時間）は仮
- 請求書の実績精算の金額は、共通サンプルにあるもの以外は仮（500〜900円）。お試しの拠点だけの請求書は実績精算なし（0円）
- 法人Web のログインは共通データのアカウント（`account.signIn`・site＝corp）。どの法人・拠点のアカウントでもログインできる（Cognito はフェイク・パスワードは空でなければよい）。
  参照のみ・停止の帯はアカウントの状態から（DEMO 帯の「デモの表示」は上書き）

## 直したら

- 見本を変えたら `curl -X POST http://localhost:3200/api/dev/reset`（共通 DB 全体を見本に戻す。運営・仕入先の見本も戻る）
- `curl -X POST http://localhost:3200/api/domain/check/run -H 'Content-Type: application/json' -d '{}'` で `"ok": true` を確かめる

## 外部とのつながり（課題 0-2・5-4・HubSpot Phase 2。2026/10/02 決定）

- **Bill One**：つながない。請求書の `send`（送付待ち → 送付済 → 開封済／エラー → 再送）を共通データに持ち、運営の請求書詳細の「（デモ）」ボタン（`billing.advanceSend`）で進める。運営・法人Web の請求書に状態と記録が出る
- **ヤマト**：API は使わない。路線便の送り状番号（`dm.delivery.tracking`）を運営が入れる（`delivery.setTracking`）。画面は番号・コピー・ヤマトの追跡ページ（`lib/domain/tracking.ts`、12桁なら番号入りの URL）。部品は `components/TrackingNo.tsx`
- **HubSpot**：法人Web の AI チャットボット（決まった質問と答えだけ・`app/corp/_ui/CorpChatbot.tsx`）と「お問い合わせ」（`notice.sendInquiry` → 送信済（HubSpot））。運営の「お問い合わせ（HubSpot 送信）」で一覧。CRM の同期は Phase 3
- **メールだけのお知らせ**：`sites` が空でも `mail` があれば置ける（どのサイトにも出さない）。運営のお知らせ一覧は「メールのみ」、詳細に送信の記録
- 確かめ：`check.run` の続き `lib/domain/checkIntegrations.ts`
