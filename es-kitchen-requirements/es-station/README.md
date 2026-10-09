# ESSTATION Web（開発用）

`06_nextjs`（デモ版）からデモ用の部分を除いた、開発の出発点。Next.js 16（App Router）・React 19・TypeScript。

| サイト | URL | 状態 |
|---|---|---|
| 10 運営Web | `/ops` | 画面は実装済み（サイドメニューの全49画面と、その詳細・編集）。作りは `lib/ops/README.md` |
| 20 法人Web | `/corp` | 画面は実装済み（ホーム・拠点管理・申請・法人情報・請求書・月次注文・棚卸・レビュー・売上・申込フォーム）。ログインは `/corp/login`（CU00001 法人／CU00871 拠点）。作りは `lib/corp/README.md` |
| 30 委託配送先Web | `/carrier` | 画面は実装済み（ホーム・スケジュール・配送管理・配送詳細・集金・トラブル・見積依頼・配送スタッフ・プロフィール・ログイン前の申し込み）。ログインは `/carrier/login`（DEMO 帯で DE00001 栄成ロジ など） |
| 40 ドライバー | `/driver` | 画面は実装済み（ホーム・配送一覧・荷物受取（倉庫・中継先）・COOL便・ES配送便の5ステップ・トラブル報告・廃棄・棚卸し・お知らせ・マニュアル・アカウント）。ログインは `/driver/login`（配送スタッフID。DEMO 帯で DR00014 山口 健・DR00001 小林 翔 など） |
| 50 仕入先サイト | `/supplier/login` | 画面は実装済み（S01〜S09）。API は共通 DB（下の「共通 DB」） |

## 動かし方

- `npm run dev`：開発用（DEMO 帯なし）
- `npm run dev:demo`：デモ用。同じコードで、画面の上に DEMO 帯（データリセット・仕入先の切替・画面ジャンプ）が出る（`NEXT_PUBLIC_DEMO=1`）

```bash
npm install
npm run dev
```

`.env.development` で、API の向き先を切り替える。

| 変数 | 値 |
|---|---|
| `NEXT_PUBLIC_API_MODE` | `http`＝API（いまは `/api` の共通 DB）／`mock`＝`mocks/` の見本データ（ブラウザのタブの中だけで動く） |
| `NEXT_PUBLIC_API_BASE_URL` | API の URL。`/api`＝この Next.js の共通 DB。本物のバックエンドができたらその URL にする |
| `NEXT_PUBLIC_FIXED_TODAY` | 「今日」を固定する（モックの見本データは 2026/10/05 を今日として作ってある）。本物の API では消す |

見本でのログイン（共通 DB・モックとも）：ログインID は `mocks/supplier/suppliers.ts` の仕入先 ID（例 `SP00001`）、パスワードは空でなければ通る。

## 共通 DB（全サイトで同じデータ）

> 法人・委託配送先・ドライバー・システム管理が使う**共通の業務データ**（法人・拠点・契約・配送・アカウント）は `lib/domain/`（`POST /api/domain/<領域>/<名前>`）。使い方と見本は [lib/domain/README.md](lib/domain/README.md)。

開発中は、画面が **この Next.js の `app/api`（Route Handler）＋ SQLite（`data/es.db`）** を読み書きする。
どのタブ・どのサイトで書き換えても同じデータになり、再読み込みしても消えない。

```
画面 → lib/api/*.ts（http） → app/api/** → lib/supplier/service.ts（書き換えの中身） → lib/server/（SQLite）
```

- **ほかのタブ・サイトの変更を出す仕組み**：書き換えのたびにデータの版（`meta.version`）が上がる。画面は 3 秒ごと（とタブに戻ったとき）に `GET /api/sync/version` を見て、変わっていたら裏で読み直す
- **書き換えの中身は `lib/supplier/service.ts` の1か所だけ**。`mock` のときも同じものを使うので動きがずれない。本物のバックエンドもここに合わせる
- **見本データに戻す**：`/ops/orders` の「見本データに戻す」、または `npm run db:reset`（`data/es.db` を消す。次に開いたとき `mocks/` から作り直す）
- **中身を見る**：`data/es.db` は SQLite なので DB Browser for SQLite などで開ける。画面の型は `data` 列に JSON で入っている
- `data/` は `.gitignore` に入れてある（人ごとの作業データ）

| API | 中身 |
|---|---|
| `/api/supplier/**` | 仕入先サイト（`lib/api/supplier.http.ts` のとおり）。ログインで Cookie `es_supplier` を入れ、ほかの仕入先のデータは返さない |
| `/api/ops/orders/**` | 運営Web の発注管理（一覧・本発注・仮発注の数量変更・キャンセル・入荷確認） |
| `/api/sync/version` | データの版 |
| `/api/dev/reset` | 見本データに戻す（開発用） |

`/ops/orders` は共通 DB を確かめるための **仮置きの運営画面**。仕入先サイトを別タブで開いて、本発注・数量変更・回答などが数秒で両方に出ることを確かめられる。

### 次のサイトをつなぐとき

1. 法人・拠点・契約などの型を `lib/<site>/types.ts` に書き、`lib/server/db.ts` にテーブルと見本データを足す
2. 書き換えの中身を `lib/<site>/service.ts` に書く（Repo を受け取る形。`lib/supplier/service.ts` と同じ）
3. `app/api/<site>/**` に Route Handler、`lib/api/<site>.ts` に画面から呼ぶ API を作る
4. 画面の状態は `lib/supplier/store.tsx` と同じく、版を見て読み直す

## 作り（仕入先サイト）

```
app/supplier/
  layout.tsx                 状態（SupplierProvider）と CSS
  (auth)/login|forgot|apply  S01〜S03 ログイン前
  (app)/layout.tsx           ログインの確認（してなければ /supplier/login へ）・サイドメニュー
  (app)/home                 S04 ホーム
  (app)/notices/[id]         S05 お知らせ詳細
  (app)/orders               S06 発注一覧
  (app)/orders/[no]          S07 発注詳細（RespondCard 回答／HonCard 本発注の承認／ShipCard 出荷報告／ScheduleCard カレンダー）
  (app)/profile              S08 プロフィール
  (app)/manual               S09 操作マニュアル
  _components/               共通部品（ui・modals・Shell・AuthCard・useDownload）
lib/api/
  supplier.ts                API のインターフェース（画面はここの api だけを呼ぶ）
  supplier.mock.ts           モック（ブラウザのメモリ）。書き換えは lib/supplier/service.ts
  supplier.http.ts           API（fetch）。いまは /api の共通 DB につなぐ
  ops.ts                     運営Web の発注管理の API
  errors.ts                  ApiError（画面に出す文言）
lib/supplier/
  types.ts                   発注・仕入先などの型
  orders.ts                  状態の判定（タブ・本発注・アラート回数）と入力チェック
  constants.ts               分納の上限・運送会社・配送方法・却下の理由
  dates.ts                   日付（YYYY/MM/DD の文字列）と today()
  store.tsx                  ログイン中の仕入先・発注・お知らせ・一覧の表示。版を見てほかのタブ・サイトの変更を読み直す
  service.ts                 発注の書き換え（仕入先・運営）。モックと共通 DB で共通
  seed.ts                    見本の発注データを画面の形にそろえる
lib/server/                  共通 DB（サーバーだけ）：db.ts＝SQLite・テーブル・見本データ／supplierRepo.ts／http.ts＝Route Handler の共通処理
app/api/                     Route Handler（上の表）
mocks/supplier/              見本データ（仕入先4社・発注160件・お知らせ・マニュアル）
```

- 入力チェック（`lib/supplier/orders.ts`）は画面で使っている。**本番では API 側でも同じチェックをする**こと
- ログインは、画面は `sessionStorage` に仕入先 ID、共通 DB は Cookie `es_supplier`（開発用。パスワードは確かめない）。本番は Cookie（セッション）で、`supplier.http.ts` は `credentials: 'include'` にしてある
- モックの見本データを最新のデモに合わせたいときは `npm run mock:extract`（`02_デモ/50_仕入先_まとめ.html` から取り出す）

## 画面ごとのコメント（レビュー用・2026/10/02）

`npm run dev:demo` のとき、画面右下に「💬 コメント」が出る。いま開いている画面（サイドメニュー＋見出しから自動で判定。違えば書く前に直せる）にコメントを残せる。

- 「📍 場所を指す」で画面の中の場所をクリックして記録できる。あとで 📍 を押すとその場所が光る
- 「対応済み」のチェックで消し込み。「すべて」タブで全画面の未対応を一覧、「この画面へ」で移動
- 書き出し：「⬇ Markdown」でダウンロード、「📁 00_確認してほしい に置く」でプロジェクトの `00_確認してほしい/画面コメント_YYYYMMDD.md` に保存（Claude に渡すときはこちら）
- 保存先は `data/review.db`（業務データの `es.db` とは別）。**データリセット・`npm run db:reset` では消えない**
- 02_デモ の HTML（10〜50）にも同じ部品が入っていて、こちらの API（`http://localhost:3200`）に書く。07_開発 を `npm run dev:demo -- --port 3200` で動かしておく（止まっているときはブラウザに一時保存し、つながったときに送る）
- 作り：部品 `public/review/comments.js`（HTML への差し込みは `項目一覧_生成スクリプト/inject_review.py`）、API `app/api/review/**`、`lib/server/review.ts`。本番（DEMO なしの build）では API ごと閉じる

## デモ版から除いたもの

- DEMO 帯（画面ジャンプ・仕入先の切替・データリセット・メール通知の例）
- 申込フォームの「サンプルを入力」、ログインID・パスワードの初期値、固定の受付番号
- 固定の「今日」（`today()` にして、モックのときだけ `.env.development` で固定）
- 「デモのためファイルは作成されません」などの文言（ダウンロードは `api.getFileUrl` から）
- 運営・法人・委託配送先・ドライバーの元の HTML の表示（iframe）→「未実装」の入口だけ

## まだ決まっていない・仮のもの

- API のエンドポイント・認証の方式（`lib/api/supplier.http.ts` は仮置き）
- 画面の中の「仮置き（要確認）」：配送方法・運送会社の選択肢、自社配送・持込の送り状番号、サブ担当者へのメール通知
- 分納の上限（`SPLIT_MAX = 3`）は運営の設定から取る予定
