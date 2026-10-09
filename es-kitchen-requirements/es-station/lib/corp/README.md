# 法人Web（/corp）の作り

デモ（`02_デモ/20_法人_まとめ.html`）の画面を React に移したもの。運営Web（`lib/ops/README.md`）と同じやり方で、**コードは1つ**、`npm run dev`（開発）と `npm run dev:demo`（DEMO 帯つき）の2つの出し方をする。

## 土台（共通・領域の担当は触らない）

| ファイル | 中身 |
|---|---|
| `lib/corp/menu.ts` | サイドメニュー（URL と担当の領域）。`PUBLIC_PATHS`＝ログインなしで開ける画面 |
| `lib/corp/session.ts` | アカウント（法人 CU00001／拠点 CU00871 大阪支店／お試しの法人 CU00071 みちのく商事）と画面の状態（in／ro 解約後／stopped 停止後） |
| `app/corp/_ui/CorpProvider.tsx` | `useCorp()`・`useCorpSignedIn()`：アカウント・`isBranch`・`view`・トースト・ダイアログ（`CorpDialog`） |
| `app/corp/_ui/CorpShell.tsx` | 枠（サイドメニュー・ヘッダー・アカウントのメニュー・パスワードの変更・ログアウト）。ログインしていなければ `/corp/login` へ |
| `app/corp/_ui/CorpDemoBar.tsx` | DEMO のときだけ：「デモの表示」「アカウント」の切替 |
| `app/corp/corp.css` | 枠の見た目（ES Kitchen デザインシステム・法人テーマ）。`.corp` の中だけ |
| `app/corp/login/page.tsx` | ログイン |
| 領域の仕組み | 運営Web と同じ（`lib/ops/core/*`・`lib/ops/registry.ts`）。法人Web の領域は `lib/corp/areas/corp-*.ts` |

## 運営Web とのつながり

法人Web は運営Web と**同じデータ**を見る（共通 DB）。

- 法人・拠点・子契約：`contracts.*`（`lib/ops/contracts/types.ts`）
- 請求書：`billing.*`
- 配送データ・お届け日の変更申請：`delivery.*`
- 月間メニュー・商品注文・資材注文：`menu.*`
- 契約の申請：`applications.*`
- レビュー：`reviews.*`

法人Web の領域の queries は、これらを `repo.list('<kind>')` で読んでよい。法人Web から出したもの（申請・注文・棚卸報告・レビューなど）で運営Web が受け付けるものは、**運営Web の領域と同じ kind・同じ形で書く**（運営Web の画面にそのまま出るように）。

画面から領域を呼ぶときは、ログイン中のアカウント（`account.corpId`・`account.branchId`）を args で渡し、拠点アカウントのときはその拠点のデータだけ返す。
