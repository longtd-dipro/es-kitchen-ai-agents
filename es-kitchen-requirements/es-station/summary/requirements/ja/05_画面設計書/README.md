# 画面設計書（基本設計）の作業フォルダ

本物の Web（このリポジトリのコード）を元に、スキル `screen-design-doc` で画面設計書（Excel JA／VI・HTML）を作る場所。
作り方・決まりは `.claude/skills/screen-design-doc/SKILL.md`。**決定は `docs/決定台帳.md` が正。**

```
データ/
  _共通_メッセージ.py   … システム全体で1つ（メッセージ・メールの文言。ID で各画面から使う）
  _共通パターン.py       … システム全体で1つ（一覧・削除の確認・入力チェックなど共通の動き）
  <ScreenCode頭>_<機能>.py … 1機能1ファイル（例 AW_PLAN_プランマスタ.py）。元は assets/_ひな形.py
出力/                    … make.py が作る（直接直さない）
  <ブック>/画面設計書_…_JA.xlsx・_VI.xlsx・.html、img/（番号つき画像・スナップショット）
  _共通/メッセージ・メール一覧
```

## 使い方（cloud・ローカル共通）

```bash
npm run dev                                                         # 先に本物の Web を動かす（http://localhost:3000）
S=.claude/skills/screen-design-doc/scripts
python3 $S/make.py --check   docs/05_画面設計書/データ/<機能>.py      # データの確認（ブラウザ不要）
python3 $S/make.py --capture docs/05_画面設計書/データ/<機能>.py      # 本物の Web を開いて番号の場所を確認
python3 $S/make.py --draft   docs/05_画面設計書/データ/<機能>.py      # 社内の下見（未確認が残っていても作る）
python3 $S/make.py --book 運営管理者Web_マスタ docs/05_画面設計書/データ/AW_M*.py   # 1サイト（領域）＝1ファイル
```

- データの `DEMO_FILE` は `"http://localhost:3000"`、状態ごとに `url`、ログインは `LOGIN`（見本の ID は `lib/domain/seed/account.ts`）
- git に入れるのは **データ（.py）・`出力/<ブック>/_release/snapshot.json`（開発に渡した版）・HTML（`出力/**/*.html`：日越切替・画像入り。hong 回答 2026-10-05・受付簿 #126）**。xlsx・画像（png）・capture_report.json は入れない（make.py で作り直す。xlsx はチャットか Google ドライブで渡す）
- **Message List（Excel・正）は git に入れない。** 代わりに CSV の写しを `docs/01_仕様/30_申請/` に入れ、cloud でも突き合わせる（hong の決定 2026-10-05）。
  Excel を直したらローカルでもう一度書き出して commit する：
  ```bash
  python3 .claude/skills/screen-design-doc/scripts/ml_export.py "<Message List の xlsx>" --out docs/01_仕様/30_申請
  git add docs/01_仕様/30_申請/MessageList_*.csv && git commit -m "docs: Message List の CSV の写しを更新（<日付>）"
  ```
  make.py は xlsx があればそれを、なければ最新の日付の CSV を読み、どちらを読んだか最初に出す。

## CSVテンプレート（2026-10-05）
`CSVテンプレート/<entity>.csv` … CSV取込のひな形（1行目＝見出し。CSV出力と同じ列。本物の Web の API `csv.template` から書き出したもの）。列の定義（必須・形式・値の決まり）は各画面設計書の「CSV取込」の画面（例 AW_MODL_004 の 3.x）。コードを変えたら書き出し直す（scratchpad の csvpage.js と同じ手順：ログイン → POST /api/domain/csv/template）。
- 追加のシート：データの `SHEETS`（初期データ・CSVテンプレートなど）で Excel に1シート、HTML に「追加のシート」の欄が増える。運営マスタでは AW_OPTN（初期データ）・AW_PLAN（CSVテンプレート）に書いてある。作り直し方は HANDOFF_cloud.md（2026-10-05 版 1.7・1.8）
