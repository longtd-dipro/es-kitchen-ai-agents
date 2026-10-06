# 配送仕様：API の guard・バッチ・トランザクション・エラーコード・外部連携 — 正

〔原典：DEV仕様書 §15〜§19（2026-10-03 日本語化）〕

<!-- 元：DEV仕様書_サイクル・出荷・ピッキング・配送_VI_v2.3.md §15〜§19（ベトナム語）。節番号は DEV のまま（DEV §15.x ＝ 本書 15.x）。 -->

**API の guard・バッチ・トランザクション・監査・エラーコード・外部連携（THOMAS・ヤマト・CSV）の正はこのファイル。** テーブル・列は `配送_11_データモデル.md`（DEV §14）を見ること。

- テーブル名・列名・enum・バッチ名・エラーコードは**英語のまま**。
- 状態名（出荷待／出荷済／受取済／納品済／一部納品済／再配達待／確認中／中止／取消）は DEV でも日本語の値のまま。
- 台帳（`docs/決定台帳.md`）に合わせて直したところは **【台帳に合わせて修正】**、台帳の決定から足した API は **【追加・2026-10-03】**、決めきれないところ・訳語に自信がないところは **【要確認】**。
- `配送仕様/` の他の章と食い違うところは【要確認】として残した（どちらが新しいかを書いた）。

---

## 15. API の guard

### 15.1 共通の guard

更新系（mutation）の API はすべて、次の順に行う。

| # | 内容 |
|---|---|
| 1 | 操作者（actor）を認証する |
| 2 | ロールとデータの範囲で認可する |
| 3 | トランザクションの中で、今のレコードをロックして読む |
| 4 | `plan lifecycle` を検証する |
| 5 | `delivery status` を検証する |
| 6 | 業務日・時刻（節目）を検証する |
| 7 | 関係するマスタが有効かを検証する |
| 8 | 冪等に実行する |
| 9 | 監査ログを書く |

### 15.2 権限の表

| 操作 | 運営（物流） | 運営（CS） | 営業 | 法人 | 委託配送会社 | ドライバー |
|---|---|---|---|---|---|---|
| サイクル・マスタの保存 | ○ | × | × | × | × | × |
| 契約の配送設定の編集 | ○ | × | ○ | × | × | × |
| 締切前の日付変更 | ○ | × | × | 申請 | × | × |
| 申請の承認・却下 | ○ | ○ | × | × | × | × |
| 取消・中止・複製 | ○ | × | × | × | × | × |
| 割当・割当の変更 | ○ | × | × | × | 自社の区間 | × |
| 配送データの参照（見える範囲） | すべて | すべて | すべて | `corp_admin`：自社の全拠点／`site_staff`：割り当てた拠点（#55） | 自社の区間がある配送だけ（15.15） | 割り当てられた分 |
| 納品・トラブルの報告 | 代理登録 | 代理登録 | × | × | 自社の中 | 割り当てられた分 |
| 駐車報告の登録【追加・2026-10-03】 | 代理登録・修正（理由必須） | × | × | × | ×（立て替え分をまとめて運営へ請求する側）〔hong 回答 2026-10-03〕 | 割り当てられた分 |

### 15.3 配送サイクル設定の保存

| guard | 内容 |
|---|---|
| 操作者 | 運営（物流） |
| A1 | 月曜へ丸める（normalize） |
| 確定済みの月 | 直さない（`fixed_through` まで） |
| 期間 | 範囲が正しいこと |
| 休止 | 正しいこと。**1つの休止の止める日数（`normal` ＋ それに紐づく `adjust`）の合計が7で割り切れること**。割り切れなければ保存を断り、**足りない `adjust` の日数**を返す |
| 倉庫 | 参照している倉庫が存在すること |

結果：設定を保存し、サイクル暦（cycle days）を作り、`plan_rollout`／`plan_recheck` を起動し、監査に残す。

### 15.4 納品日の変更

**オーダー締切前**だけ通常どおり許す：

- 操作者に権限がある。
- まだ `order_close_date` になっていない。
- 新しい日付が日付の検証を通る。

**オーダー締切後**は、次の4つを全部満たすときだけ通す（#63・2026-09-29。`配送_04` §8-3 と同じ）：

| # | 条件 | 外れたときのエラー |
|---|---|---|
| 1 | 今日 ＜ 今の出荷日（`shipped_date`）。つまり**出荷日の前日まで**。かつ新しい出荷日 ≥ 明日 | `DOMAIN_ORDER_CLOSED` |
| 2 | 新しい納品日が**同じ `cycle_id`**、かつ**同じ半分**（A・B週 または C・D週） | `DOMAIN_DATE_OUT_OF_RANGE`（【案】） |
| 3 | 1件ずつの依頼 | — |
| 4 | `reason` がある | `DOMAIN_REASON_REQUIRED` |

- `warehouse_id` は変えない（倉庫を変えるなら取消＋複製）。
- 出荷指示を送信済みなら `ship_order_diff` を作り、新しい版で再送する。
- `fix` のオーバーライドとして保存する。【要確認】DEV §14.11 の `override_type` は `absolute_date｜skip` で `fix` が無い（`配送_11` 14.11）。
- （旧：締切後は常に `DOMAIN_ORDER_CLOSED`。運営向けの例外の分岐は無かった）
- 【要確認】条件1の「出荷日」に `deliveries.shipped_date` を使うと、出荷実績の取込前は値が無い。予定の出荷日（`shipping_plans.picking_date`）と読むのが正しいか。

### 15.5 申請の承認・オーバーライドの取消

**承認の guard**

- 操作者は運営（物流）または運営（CS）。
- 申請が `pending`／`proposed`。
- 対象がまだ `locked` でない。
- 提案した日付が正しい。

**オーバーライドの取消の guard**

- 運営（物流）。
- 理由必須。
- 対象がまだ `locked` でない。

オーバーライドは状態で取り消す。物理削除しない。

### 15.6 確定生成（materialize）・数量確定（finalize）

| 処理 | guard |
|---|---|
| 確定生成 | 予定が `draft`／`order_start_date` を過ぎた／予定が「生成不可」でない／まだ配送データが無い |
| 数量確定 | `order_close_date` を過ぎた／節目が `menu`（仮でない）／数量が正しい |

### 15.7 出荷指示の送信

| guard | 内容 |
|---|---|
| 対象 | 配送データが送信の条件（DEV §10.2）を満たす |
| 版 | 版（`rev`）が正しい |
| 期限 | **その配送の出荷実績をまだ受け取っていない** |
| ハッシュ | `payload_hash` は正規化した内容（canonical payload・19.1）から作る |

成功：成功を記録し、初回なら `locked` にする。失敗：失敗を記録し、`locked` にしない。

### 15.8 送り状番号・出荷実績の取込

- 配送データが存在する。
- 送り状番号がほかの配送データのものでない。
- 配送会社が、その配送の `delivery_legs` のどれかの区間の配送会社と一致する。
- 配送データが `中止`／`取消` でない。
- 出荷指示の送信成功より先に送り状番号が来たら anomaly（要確認）を作る。`locked` にはしない。

### 15.9 ドライバーの割当

- 操作者は運営、または範囲が合う委託配送会社。
- 区間の `delivery_regime` が `self`／`partner_driver`（`parcel_carrier` の区間は割り当てない・DEV §13.1）。
- ドライバーが有効で、合う配送会社に属している。
- 区間がその配送データのもの（`delivery_legs.delivery_id`）。
- 配送データが終わっていない。
- `locked` のあとでも許す。

### 15.10 状態の遷移

- 遷移が DEV §12.2 の表（`配送_04` §7-7 ②）にあること。
- 操作者がそのイベントを実行してよいこと。
- 必要な実績・トラブルの項目がそろっていること。
- `取消`・`中止`、および例外の解決には理由必須。

### 15.11 複製

- 手動の複製 API の操作者は運営（物流）。トラブルの登録・種別の付け直しでシステムが作る自動子（DEV §13.2.1）は `actor_type = system`。
- 元は `published`／`locked` の配送データ。
- 深さは0（子からさらに複製しない）。**子でトラブルが起きたときの例外**（DEV §9.4）：中身は子から取るが、新しいレコードの `parent_delivery_id` は**その子の親**にする。
- 次の枝番が9を超えない。
- `duplicate_type` が正しい。
- トラブルが起きた配送に生きている自動子が既にあれば（`source_trouble_delivery_id` で判定）、その子を使い回し、2件目を作る依頼は断る（`DOMAIN_TROUBLE_CHILD_EXISTS`）。

子の作成と監査は同じトランザクションで行う。

### 15.12 トラブルの解決

- 操作者は運営（物流）。
- 未解決のトラブル報告が1件以上ある。配送データは `出荷済`／`受取済`／`納品済`。自動子があれば `確認中`。
- **配送の単位でまとめて解決する**：その配送の未解決の報告を同じトランザクションで全部閉じる（DEV §13.2）。
- `納品済` からは全量納品の解決だけ。ただし `completion_source = presumed` なら「全量を送り直す」「もう送らない」も可（DEV §13.2.2）。
- `partial_no_resend`：子を作らない。自動子があれば `取消`。
- 解決の値が正しい。実績の数量が正しい。理由必須。
- 配送データ・未解決のトラブル報告・自動子（あれば）を同じトランザクションでロックする。
- 一部納品・再配達の解決は自動子を使い回し、数量・`delivery_lines`・候補日・`duplicate_type` を更新する。
- 送り直しが要らない解決では、自動子を理由付きで `取消` にする。
- 自動子を `出荷待` にできるのは `schedule_confirmed = true` かつ `quantity_confirmed = true` のときだけ。
- 要確認 `trouble_open`・`trouble_auto_child_pending` を同じトランザクションで閉じる。
- **解決ごとの必須項目**（2026-09-29・#65。画面は2段階：解決を選ぶ → 要る項目だけ出す）。その配送の `type_code = NULL` の報告は、解決の前に全部種別を付けること（無ければ `VALIDATION_REQUIRED`）。

| `resolution` | 数量（`delivery_lines.delivered_qty`） | 子（自動子を使い回す） | `freight_billable` | `resolution_reason` |
|---|---|---|---|---|
| `full` | 必須（既定＝確定数量）。`substituted_from_product_id` は任意 | — | — | 必須 |
| `partial` | 必須。残り＝差分 → 子の数量 | `candidate_date` 必須 | — | 必須 |
| `partial_no_resend` | 必須 | —（自動子 → `取消`） | — | 必須 |
| `redelivery` | —（すべて 0） | `candidate_date` 必須 | 必須（既定 false） | 必須 |
| `same_day_revisit` | — | —（自動子 → `取消`） | — | 必須 |
| `stop` | —（すべて 0） | —（自動子 → `取消`） | 必須（既定 false） | 必須 |

選んだ解決に関係ない項目は無視する（保存しない）。

### 15.12.1 トラブルの登録・種別の付け直し（2026-09-29）

- 操作者：割り当てられたドライバー、自社の中の委託配送会社、または運営（代理登録）。
- 配送データが `出荷済`／`受取済`／`納品済`。
- 画面（#64・2026-09-29）：配送データ詳細の「トラブル」タブと「トラブルを代理登録」ボタンは、`予定`・`出荷待` のときは**出さない**（子の `確認中` では出す）。API の guard は上のまま。
- `type_code` はドライバーなら `trouble_app_reasons` から、代理登録なら運営が選ぶ。NULL もありうる。
- 同じトランザクションで：報告を作る ＋ 要確認 `trouble_open` を UPSERT ＋（`trouble_types.auto_child = true` で、生きている自動子が無ければ）自動子を作る（DEV §13.2.1） ＋ 要確認 `trouble_auto_child_pending` を UPSERT ＋ 監査。
- 運営が種別を付け直して（NULL・別の種別 → `auto_child = true` の種別）、自動子がまだ無ければ、その時点で作る。`auto_child = false` の種別へ付け直しても、作った子は**自動では取り消さない**（運営が解決のときに処理する）。

### 15.13 配送データのルートの変更

上書き用の列は持たない。その配送の `delivery_legs` を直接直す。

| guard | 内容 |
|---|---|
| 操作者 | 運営（物流） |
| 状態 | `納品済`／`中止`／`取消` でない |
| 理由 | 必須 |
| 区間の規則 | 直したあとも `delivery_legs` が `配送_11` 14.4 の規則（連番・最終区間がちょうど1本・最終区間の `to_type = destination`）を満たす |
| 倉庫 | 出荷指示を送信成功したあとは `warehouse_id` を変えない。出荷倉庫を変えるなら取消＋複製 |

`locked` のあとでも区間の配送会社・ドライバーは変えられるが、再送のために要確認 `ship_order_diff` を作る（16.12）。変えた区間ごとに `before_json`／`after_json` で監査に残す。

### 15.14 配送データ1件の納品先住所の変更

その配送1件だけ `address_snapshot`／`destination_name` を変えられる（2026-09-22）。

| guard | 内容 |
|---|---|
| 操作者 | 運営（物流） |
| 状態 | `納品済`／`中止`／`取消` でない |
| 理由 | 必須 |

**出荷指示を送信成功した後**なら：

1. 新しい住所で出荷指示の新しい版を作る（19.2）。
2. 今ある送り状番号を全部 `voided` にする（古い伝票は住所が違うまま印刷されている）。
3. 新しい版の送信が成功したら送り状番号を出し直す。
4. `locked_at` は変えない。

出荷指示の送信成功の後は `warehouse_id` の変更は禁止のまま。その場合は取消＋複製（15.13）。

### 15.15 委託配送会社Web のデータの範囲（2026-09-29）

- 委託配送会社に見えるのは、`carrier_id` が自社の区間が**1本以上ある**配送データだけ。操作できるのも自社の区間だけ（1次区間＝倉庫での受取まで／2次区間＝中継先での受取から納品まで）。
- 確定生成済みで `order_close_date` を過ぎた配送データ：全項目を返す（拠点名・住所・納品日・温度帯・数量・納品条件・送り状）。
- 予定（`draft`）と `order_close_date` 前の配送データ：**翌月のサイクルまで**、`delivery_date`・拠点名・`temp_type`・件数だけ。**数量は返さない**。

### 15.16 拠点の確定（本登録） → 生成の開始（2026-09-29・#52）

| guard | 内容 |
|---|---|
| 操作者 | 運営 |
| 入力済み | 拠点の必須タブがすべて保存済み。配送区分ごとのルートがそろっている（倉庫・1次の配送会社・リードタイム・配送パターン・納品スロット。2次の配送会社〈常に必須。中継なしなら1次と同じ会社〉・途中経由〈「なし」も明示〉〔hong 回答 2026-10-03・REQ-DL-710〕） |
| 申込内容確認（追補6） | ピッキング倉庫と配送回数が「申込内容確認」（仮登録の前）で入っている。仮登録で作ったオーダー・資材の初期セットを、ここで予定・配送データに結び付ける（DEV §4.8） |
| 配送回数の範囲 | 配送区分ごとの `delivery_count` が **1〜8**（資材は NULL）。冷蔵は1以上、ESスタンダードは冷凍も1以上【台帳に合わせて修正】（台帳 B「配送回数 1〜8回」。DEV は「入っている」ことだけを見ていた） |
| 状態 | 契約が `provisional` |

結果（`contracts.status → active`、`confirmed_at`／`confirmed_by` を入れるのと同じトランザクションで）：

1. 開始サイクル月（`start_cycle_month`）の `order_close_date` を過ぎていたら、`start_cycle_month` を次のサイクルへずらし、監査に残す。
2. この契約だけのために、すぐ実行を積む：`contract_monthly_generate` → `plan_rollout` → `delivery_materialize`（16.1〜16.3）。
3. 生成で失敗しても確定（本登録）は戻さない。運営がやり直せるように要確認 `plan_recheck` を作る。

### 15.17 ドライバーのログイン・パスワード再設定【追加・2026-10-03】

台帳 B「ドライバーのログイン」：**ログインID＋パスワード。再設定は4桁の認証コード**（Figma が正。ドライバーアプリ_仕様修正点 No.1）。旧：メールアドレス＋メールリンク（統合 §12-2・納品サイクル設定 §4B・REQ-DL-142）は使わない。テーブルは `配送_11` 14.10。

| API | guard・処理 |
|---|---|
| ログイン | `login_id`＋パスワード。`drivers.status` が有効であること。合わなければ `AUTH_INVALID_CREDENTIALS`（ID とパスワードのどちらが違うかは返さない）。続けて失敗したら `locked_until` まで止める（回数・時間は【要確認】） |
| 再設定コードの発行 | `login_id` を受け取り、4桁のコードを作って送る。コードはハッシュだけを `driver_password_reset_codes` に持つ。前に出した未使用のコードは無効にする。送り先は登録メールアドレス（`drivers.email`）〔hong 回答 2026-10-03・台帳〕 |
| 再設定コードの確認・新しいパスワード | コードが合う・期限内・試行回数の上限内・未使用。合えば `password_hash` を更新し `used_at` を入れる。違えば `AUTH_RESET_CODE_INVALID`、期限切れは `AUTH_RESET_CODE_EXPIRED` |
| 運営による再設定の代行 | 運営、および**委託配送会社（自社のドライバーだけ）**〔hong 回答 2026-10-03〕。`issued_by` に操作者を入れ、監査に残す |

- 監査：ログインの成功・失敗、コードの発行・使用、代行を残す（パスワード・コードの値は残さない）。

### 15.18 駐車報告の登録【追加・2026-10-03】

台帳 B「駐車報告」：**必要。レシート画像＋駐車料金をドライバーが入力。集金の欄には駐車料金を出さない**（ドライバーアプリ_仕様修正点 No.5）。テーブルは `配送_11` 14.7。

| guard | 内容 |
|---|---|
| 操作者 | 割り当てられたドライバー（その区間）。運営は代理登録・修正（理由必須） |
| 状態・期限 | 納品までに入力できる。納品後 **7日間**は修正できる（ほかの報告と同じ）〔hong 回答 2026-10-03〕。【要確認】`出荷済`（受取前）でも登録を許すか |
| 必須 | `parking_fee`（0 以上の整数・円）とレシート画像の**両方**。画像が無ければ `VALIDATION_REQUIRED` |
| 写真の送り方 | 写真は本体と別に送る（`配送_06` §12-4 の方式）。画像が後から届くまで「未完了」として扱うか【要確認】 |
| 集金との分離 | `cash_expected_amount`／`cash_collected_amount` を変えない。集金の画面・現金回収差額に出さない |
| 精算・見せ方 | ドライバーが立て替え → 委託配送会社がまとめて運営（システム管理）へ請求。**法人には請求せず、法人Webにも出さない**〔hong 回答 2026-10-03〕 |
| 冪等 | ほかの完了系 API と同じく、冪等キー（配送ID＋ステップ＋端末の UUID）を必須にする（`配送_06` §12-4） |

---

## 16. バッチ

バッチは毎日の catch-up で動かす：節目を過ぎていて、まだ処理していないものを全部拾う。

### 16.1 `contract_monthly_generate`

- 対象は DEV §4.7 の状態の契約だけ（`provisional`・`suspended`・`ended` は対象外）。`start_cycle_month` から。
- 毎日の実行に加え、拠点を確定（本登録）した契約だけのためにすぐ実行する（15.16）。
- 子契約を作る。
- `contract_month_delivery_channels` と `contract_month_routes` をスナップショットする。
- 料金の世代（price revision generation）をスナップショットする。
- 冪等キー：`contract_id + cycle_month`。

### 16.2 `plan_rollout`

起動：毎日、`draft` に影響するサイクル・契約の変更のあと、**拠点の確定（本登録）の直後**（15.16）。

対象：DEV §4.7 の状態の契約、`start_cycle_month` から。`provisional` の契約には予定を作らない。

| # | 処理 |
|---|---|
| 1 | サイクルの範囲を選ぶ |
| 2 | `draft` を作る／作り直す |
| 3 | 予定数量（`estimated_qty`）を計算する |
| 4 | 子契約のスナップショットがあればそれを使う |
| 5 | オーバーライドを当てる |
| 6 | 一意キーで UPSERT する |

`published`／`locked` は直さない。

### 16.3 `delivery_materialize`

```text
lifecycle = draft
AND order_start_date <= business_date
AND delivery_id IS NULL
AND ungeneratable_reason IS NULL
AND contracts.status が DEV §4.7 の対象
```

予定1件ごとに別のトランザクションで処理する。配送データと `delivery_legs` は同じトランザクションで作る。

- 【追加・2026-10-03】配送データを作るとき `delivery_no`（`DL-yymmdd-nnnn`・日付＝その時点の予定の出荷日）を採番する。**一度付けた番号は変えない**（締切後の日付変更〈15.4〉でも振り直さない）。実際に出た日は `shipped_date`（出荷日〈実績〉）に入れる〔hong 回答 2026-10-03〕。連番の範囲は `配送_11` 14.6 の【要確認】

### 16.4 `order_finalize`

```text
order_close_date <= business_date
AND marker_source = menu
AND quantity_not_finalized
AND 予定の一意キーに合う order_quantities がある
```

今ある配送データを更新する。`order_close_date` を過ぎたのに `order_quantities` が無い予定は、要確認 `qty_missing` を作り、配送データはそのままにする。

【要確認】`配送_08` §14-5・`配送_09` §17-1 は「注文が無いときは標準数量（AIモード OFF）／AI が決めた数量（ON）で確定する」と書き、`配送_04` §7-3 は「確定生成のときにオーダー枠を標準数量で作る」と書く。オーダー枠が必ずあるなら DEV と矛盾しないが、`qty_missing` になるのは「オーダー枠そのものが無い」ときだけ、と読んでよいか確認が要る。

### 16.5 `plan_recheck`

オーバーライド・リードタイム・出荷不可・倉庫と配送会社が有効か・影響を受けた `published` の配送データ・生成不可の予定を検査する。要確認を作るだけで、`published`／`locked` は直さない。

2026-09-29 追加：`shelf_life_warning`（DEV §3.3）、`change_request_due`（DEV §9.1.1）、`assignment_missing` を UPSERT する。`assignment_missing` は割り当てる区間にドライバーが無く、`delivery_date − 3 ≤ business_date` のとき（DEV §13.1。2026-09-30 変更。旧：`delivery_date − 1 ≤ business_date`）〔要件シート 行142・決定_要件シート一部反映_回答_20260930〕。委託配送会社へのメールは2回だけ：`delivery_date − 3` の日と `delivery_date − 1` の日。

### 16.6 `ship_order_send`

```text
配送データが送信の条件（DEV §10.2）を満たす
AND (まだ版が無い OR business_date >= send_target_date)
AND send_status = ok の版が無い
```

| # | 処理 |
|---|---|
| 1 | `window_start`／`window_end`／`send_target_date` を DEV §10.4 で計算する |
| 2 | `warehouse_id` ＋ `warehouses.thomas_csv_unit` でまとめる |
| 3 | `pending` の版を作り、正規化した内容と `payload_hash` を作る（19.1） |
| 4 | `(delivery_id, rev)` で冪等に送る |
| 5 | 初回の成功 → 同じトランザクションで `locked_at`・`locked_source = ship_order_sent`・予定の `lifecycle = locked` を入れる（DEV §10.3） |
| 6 | 失敗 → `send_status = failed`、**`locked` にしない**。16.14 で再試行。再試行の上限を超えたら要確認 `ship_order_failed` |

`marker_source = provisional` のサイクルの配送データには実行しない（DEV §8.3）。

【要確認】`配送_05` §10-9（2026/10/01・お客様確認 A2）は「資材は THOMAS に送らない（ES事務所の倉庫は THOMAS 連携＝なし）。資材ピッキングリストとヤマトの送り状 CSV で作業する」。DEV は「資材も毎日の catch-up で出荷指示を送る」（DEV §4.1）。THOMAS 連携なしの倉庫を対象から外す条件（`配送_11` 14.5 の【要確認】の列）を足すか、確認が要る。そのとき `locked`（出荷指示の初回送信成功が唯一のきっかけ）を資材でどう扱うかも決める必要がある。

### 16.7 `billing_issue`

- 請求の節目を過ぎた子契約を選ぶ。
- 請求区分（`billing_type`）＋ 支払期限（`payment_due_date`）でまとめる。
- 請求書を冪等に作る。
- 請求の行（charge）と調整の行（adjustment）を作る。

【台帳に合わせて修正】請求の節目は台帳 B「請求書の発行日」：**20日締め → 25日確定 → 翌月1日に Bill One で発行**（2026-10-01・請求ルール §1-1）。DEV は節目の日付を書いていない。`配送_05` §10-7 #11・`配送_08` §14-4 の「25日確定 → 月末発行」は旧決定（台帳で置き換え済み）。

### 16.8 `billing_gap_detect`

有効な契約に子契約が無いもの、または請求月に請求書・請求の行が無いものを見つける。要確認を作るだけ。

### 16.8.1 ~~`trouble_auto_duplicate`~~（2026-09-29 に廃止）

このバッチは**もう無い**。自動子はトラブルの登録・種別の付け直しのトランザクションの中ですぐ作る（DEV §13.2.1・15.12.1）。期限（SLA）も `auto_duplicate_due_at` も無い。

### 16.9 `delivery_presume_complete`

```text
delivery_date < business_date
AND delivery_legs(is_final_leg).delivery_regime = parcel_carrier
AND status = 出荷済
AND NOT EXISTS 未解決の trouble_report
```

`status = 納品済`、`completion_source = presumed` にする。

### 16.10 `delivery_detect_missing`

```text
delivery_date < business_date
AND delivery_legs(is_final_leg).delivery_regime IN (self, partner_driver)
AND status IN (出荷済, 受取済)
AND NOT EXISTS 未解決の trouble_report
```

状態は変えない。欠配の要確認（`missing`）を UPSERT する。`delivery_presume_complete` の後に流す。

### 16.11 `tracking_anomaly_detect`

送り状番号があるのに、出荷指示の送信成功が無い配送データを選ぶ。anomaly の要確認（`tracking_anomaly`）を作り、`locked` にはしない。

### 16.12 `ship_order_diff`

今の正規化した内容と、最後に送信成功した版の `payload_hash` を比べる。違えば「再送が必要」の要確認（`ship_order_diff`）を作る。

### 16.13 ジョブチェーン

```text
contract_monthly_generate
→ plan_rollout
→ delivery_materialize
→ order_finalize
→ ship_order_send
→ plan_recheck
```

- 前のジョブが全体として失敗したら、後のジョブは動かさない。
- 1つの契約の失敗はトランザクションで切り離す（他の契約は続ける）。
- 請求と納品実績系のジョブは独立して動く。（`trouble_auto_duplicate` は 2026-09-29 に廃止）

【要確認】`配送_04` §7-3・`配送_09` §17-1 のチェーンは「子契約 → 予定 → 確定生成 → 数量確定 → 再検証」の**5本**で、`ship_order_send` が入っていない。DEV は6本。どちらに合わせるか。

### 16.14 再試行・ロック・ログ

- 一時的な失敗は、間隔を延ばしながら最大3回まで再試行する。
- ジョブ単位のロックで二重実行を防ぐ。
- バッチはすべて冪等。
- ログに残すもの：ジョブ名・開始／終了・業務日・対象／成功／失敗／スキップの件数・所要時間・エラーの要約。

---

## 17. トランザクション・同時更新・監査

### 17.1 トランザクションの範囲

| 処理 | 1つのトランザクションに入れるもの |
|---|---|
| 確定生成 | 予定 ＋ 配送データ（＋ `delivery_legs`） |
| 出荷指示の送信成功 | 出荷指示 ＋ 配送データの `locked` ＋ 予定の `lifecycle` |
| 状態の遷移 | 配送データ ＋ 実績・トラブル ＋ 監査 |
| 複製 | 親とのリンク ＋ 子 ＋ 監査 |
| トラブルの登録・種別の付け直し | トラブル報告 ＋ 配送データのロック ＋ 自動子（`auto_child = true` の種別なら） ＋ 要確認（`trouble_open`・`trouble_auto_child_pending`） ＋ 監査 |
| 遅延だけの配送でドライバーが全量納品を報告 | `→ 納品済` の遷移 ＋ `delay` の報告の解決 ＋ 要確認 `trouble_open` を閉じる ＋ 監査（DEV §13.2.3） |
| トラブルの解決（配送の単位） | 未解決の報告すべての解決 ＋ 配送データの状態 ＋ 子の更新・取消 ＋ 要確認の解決 ＋ 監査 |
| 請求書の発行 | 請求書 ＋ 請求の行 |
| 駐車報告の登録【追加・2026-10-03】 | 駐車報告 ＋ レシートの添付の紐付け ＋ 監査 |
| パスワード再設定【追加・2026-10-03】 | パスワードの更新 ＋ 認証コードの使用済み ＋ 監査 |

### 17.2 同時更新

- 重要な更新はレコードをロックするか、版（version）を確かめる。
- 読んでから書くまでの間に `lifecycle`／`status` が変わったら conflict を返す（`DOMAIN_CONCURRENT_MODIFICATION`）。
- 一意制約が冪等の最後の守り。

### 17.3 監査ログ

```text
id
target_type
target_id
action
before_json
after_json
reason NULL
actor_type
actor_id
created_at
correlation_id
```

監査が必須のもの：サイクル・マスタ・契約の変更、日付の変更、オーバーライド、出荷指示、`locked`、状態、割当、取消・中止・複製、実績の修正、請求の調整。【追加・2026-10-03】駐車報告の登録・修正、ドライバーのログイン・パスワード再設定（値そのものは残さない）。

---

## 18. エラーコード

| コード | 意味 |
|---|---|
| `DOMAIN_INVALID_TRANSITION` | `lifecycle`／`status` の遷移が正しくない |
| `DOMAIN_DELIVERY_LOCKED` | 配送データが `locked` |
| `DOMAIN_ORDER_CLOSED` | オーダー締切の後は禁止の操作 |
| `DOMAIN_DATE_OUT_OF_RANGE` | 【案】締切後の新しい日付が許される範囲の外（別のサイクル／別の半分 A・B–C・D）（#63） |
| `DOMAIN_REASON_REQUIRED` | 必須の理由が無い |
| `DOMAIN_PLAN_UNGENERATABLE` | 予定を作れない |
| `DOMAIN_PROVISIONAL_MARKER` | 仮の節目のため止めた |
| `DOMAIN_DUPLICATE_NOT_ALLOWED` | 元が複製の条件を満たさない |
| `DOMAIN_TROUBLE_CHILD_EXISTS` | トラブルが起きた配送に生きている自動子が既にある。新しく作らず使い回すこと |
| `DOMAIN_TROUBLE_CHILD_UNCONFIRMED` | 自動子の日付・数量が未確定なので `出荷待` にできない |
| `DOMAIN_BRANCH_LIMIT` | 枝番の上限（9）を超えた |
| `DOMAIN_TRACKING_CONFLICT` | 送り状番号がほかの配送データのもの |
| `DOMAIN_DRIVER_SCOPE` | 操作者・ドライバーが範囲の外 |
| `DOMAIN_ROUTE_INVALID` | ルート・最終区間が正しくない |
| `DOMAIN_MASTER_INACTIVE` | 関係するマスタが有効でない |
| `DOMAIN_CONCURRENT_MODIFICATION` | 同時更新の衝突 |
| `VALIDATION_REQUIRED` | 【要確認】必須の項目が無い。DEV §15.12 で使っているが §18 の表に無かったので足した |
| `AUTH_INVALID_CREDENTIALS` | 【追加・2026-10-03】ログインID・パスワードが違う（どちらかは返さない） |
| `AUTH_RESET_CODE_INVALID` | 【追加・2026-10-03】4桁の認証コードが違う／使用済み／試行回数の上限を超えた |
| `AUTH_RESET_CODE_EXPIRED` | 【追加・2026-10-03】4桁の認証コードの期限切れ |

---

## 19. 外部連携

### 19.1 THOMAS への出荷指示

配送データ1件の正規化した内容（canonical payload）。**項目の順は固定**で、`payload_hash` の計算に使う。

| 項目 | 元 |
|---|---|
| `ship_order_no` | `ship_orders.id` ＋ `rev` |
| `warehouse_code` | `warehouses.warehouse_code` |
| `branch_code` | `warehouses.branch_code` |
| `picking_date` | `shipping_plans.picking_date` |
| `delivery_date` | `deliveries.delivery_date` |
| `delivery_id` | `deliveries.id` — 出荷実績を受け取るときの照合キー |
| `destination_name`／`address_snapshot`／`tel` | `deliveries` のスナップショット |
| `temp_type` | `deliveries.temp_type` |
| `service_form`／`delivery_regime` | `deliveries.service_form` と、`is_final_leg` の `delivery_legs` |
| `carrier_code` | `leg_no = 1` の `delivery_legs.carrier_id` |
| `product_code`／`qty` | 配送データの商品の行 |
| `receive_windows` | `sort_order` 順の `delivery_receive_windows` |
| `delivery_condition` | `delivery_condition_snapshot` |
| `is_zeroed` | 取消の印（19.2） |

ハッシュの前の正規化：前後の空白を取る、日付は `YYYY-MM-DD`、数字に区切りを入れない、空の項目は空文字。

- ファイルは `warehouse_id` ＋ `warehouses.thomas_csv_unit` ごとに1つ。ファイル名に `business_date` と `rev` を入れる。
- `warehouse_code` は倉庫ID（`WH00001` 形式）をそのまま使う。【要確認】`配送_01` §3-1 #8（2026/10/01・運営確認 D3-2）は「THOMAS 用の倉庫コードは固定ではないので運営が入力する（倉庫ID とは別）」に変えている。`配送_01` の方が新しい。`配送_01` 要確認 #6・`配送_05` §10-4 も 2026-10-03 に「運営が入力」へそろえた。残るのは開発側の確認（`warehouse_code` を運営入力の値として扱う）だけ。
- 【要確認】`ship_order_no`：DEV は `ship_orders.id` ＋ `rev`、`配送_05` §10-4 は「指示番号＝配送データの番号（複製は枝番付き）」（例 `DL-260820-0012 / rev2`）。台帳の配送No（`DL-yymmdd-nnnn`・日付＝出荷日）を `deliveries.delivery_no` に持つなら（`配送_11` 14.6）、`ship_order_no` ＝ `delivery_no` ＋ `rev` にそろえるのが自然。
- **物理レイアウト（列の順・文字コード・区切り文字・ヘッダー）は THOMAS の定義に従う。実装の前にベンダーに確認すること。** 上の表は、最低限必ず持つ項目。
- **ベンダーを待つ間のやり方（2026-09-29）**：上の最低限の項目で実装し、**ファイル出力の層（列の順・列名・ヘッダー・文字コード）を分けて**おき、THOMAS のレイアウトが届いたらこの層だけを差し替える。THOMAS が UTF-8 を受けられなければ**出力の層で Shift_JIS に変える**。取消は THOMAS に取消 I/F があっても `qty = 0` の版で行う。

### 19.1.1 ヤマトへ渡す情報（暫定 — ヤマトの確認待ち・2026-09-29）

- 営業所止め：受取人＝**受け取りに行く委託配送会社**。記事欄に拠点名と配送No を書く。
- お届け予定日＝**ヤマトの営業所に着く日**（1次区間のリードタイムの参考値から出す）。
- THOMAS の CSV にヤマトの送り状に要る列が無い → **送り状用の CSV を別に出す**。

### 19.2 送信後の取消と修正

- 取消の I/F は使わない。取消も修正も**新しい版**で行う。
- 取消 → `qty = 0`、`is_zeroed = true` の新しい版。
- 数量・中身の修正 → 新しい値の新しい版。
- **納品先の住所の変更 → 新しい版。古い送り状番号は `voided` にして出し直す**（15.14）。
- 再送できるのは、その配送の出荷実績を受け取るまで。
- 新しい版で `locked_at` は**変えない**（DEV §10.3）。
- `ship_order_diff`（16.12）は、今の正規化した内容と最後の `ok` の版の内容を比べ、違えば再送が必要の要確認を作る。

### 19.3 送り状番号の取込

元：配送会社からのファイル。1箱＝1行。

| 項目 | 必須 | 備考 |
|---|---|---|
| `delivery_id` | ○ | 照合キー。送った内容から取る |
| `tracking_no` | ○ | |
| `carrier_code` | ○ | その配送のどれかの区間の配送会社と一致すること |
| `box_no`／`box_total` | — | 箱の数の表示に使う |
| `shipped_at` | — | |

行ごとの処理：

| 条件 | 結果 |
|---|---|
| `delivery_id` が無い | その行を断る |
| `tracking_no` がほかの配送データのもの | その行を断る（`DOMAIN_TRACKING_CONFLICT`） |
| `tracking_no` が同じ配送データのもの | 飛ばし、成功として扱う（冪等） |
| `carrier_code` がどの区間とも合わない | その行を断る |
| 配送データが `中止`／`取消` | その行を断る |
| 出荷指示の送信成功がまだ無い | 行は受け取り、**`locked` にしない**。`tracking_anomaly` を作る（16.11） |

送り状番号の取込では `delivery status` を変えない。

### 19.4 出荷実績の取込

| 項目 | 必須 |
|---|---|
| `delivery_id` | ○ |
| `shipped_date` | ○ |
| `result_code(ok｜ng)` | ○ |
| `shipped_qty` | — |
| `note` | — |

| 条件 | 結果 |
|---|---|
| `ok` で配送データが `出荷待` | `出荷済` にし、`shipped_date` を入れる |
| `ok` で配送データが `出荷待` でない | 飛ばしてログに残す（冪等） |
| `ng` | 状態を変えず、要確認 `shipment_result_ng` を作る |
| `shipped_qty` が `planned_qty` と違う | 要確認 `qty_mismatch` を作る。数量は自動で直さない |

### 19.5 取込の共通ルール

- ファイルごとに `import_id` を持つ。同じファイルをもう一度流しても重複のデータを作らない。
- 行ごとに処理する。1行の誤りでファイル全体を止めない。
- 取込の結果に、受け取った／飛ばした／誤りの行数と、行ごとの理由を残す。誤りは要確認 `import_error` を作る。
- 取込で起きた変更はすべて `actor_type = system`、`correlation_id = import_id` で監査に残す。

### 19.6 画面の CSV 出力・取込ボタン（2026-09-29・#53）

画面「出荷指示・取込」（運営〈物流〉だけ）：

| ボタン | 処理 |
|---|---|
| 出荷指示 CSV を出力（THOMAS） | 倉庫と範囲（2週間の窓／追加分）を選ぶ。今の正規化した内容（19.1）をファイル出力の層で出す。**送信ではない**：版を作らない・`send_status` を変えない・**`locked` にしない**（DEV §9.3）。`ship_order_exports` と監査に残す |
| 送信履歴の行の CSV | その版のファイル（`ship_orders.export_file_ref`）をそのままもう一度ダウンロード |
| 送り状用 CSV を出力（ヤマト） | 19.1.1 のとおり（暫定） |
| 出荷実績 CSV を取り込む（THOMAS） | 19.4 ＋ 19.5 のとおり |
| 送り状番号 CSV を取り込む | 19.3 ＋ 19.5 のとおり |
| ひな形（出荷実績／送り状番号） | 見本ファイル：ヘッダー行＋例の行 |
| 誤りの行（取込履歴） | 断った行を出す：行番号・配送No・理由 |

- 文字コードは出力の層で Shift_JIS（19.1）。列の順・名前は THOMAS のレイアウトが届くまで仮。

---

## 訳語の【要確認】

| DEV（ベトナム語・英語） | この訳 | 迷ったところ |
|---|---|---|
| canonical payload | 正規化した内容 | 「正規化ペイロード」とする案もある |
| business date | 業務日 | — |
| mutation API | 更新系の API | — |
| idempotent | 冪等 | — |
| depth bằng 0 | 深さは0（子からさらに複製しない） | — |
| job chain | ジョブチェーン | `配送_09` に合わせた |
| catch-up | catch-up（基準日を過ぎた未処理分を毎日拾う） | `配送_04` §7-3 の言い方に合わせた |
| layout vật lý | 物理レイアウト | — |
| 記事（Yamato） | 記事欄 | ヤマトの伝票の欄名のまま |
