# 運営Web（/ops）の作り

デモ（`02_デモ/10_運営_まとめ.html`）の画面を React に移したもの。**コードは1つ**で、`npm run dev`（開発）と `npm run dev:demo`（デモ：DEMO 帯が出る）の2つの出し方をする。

## 土台（共通・領域の担当は触らない）

| ファイル | 中身 |
|---|---|
| `lib/ops/menu.ts` | サイドメニュー。画面の URL（href）と、その画面のデータを持つ領域（area） |
| `lib/ops/registry.ts` | 全領域の一覧 |
| `lib/ops/core/area.ts` | 領域の決まり（DocRepo・defineArea・toDocs） |
| `lib/ops/core/client.ts` | 画面から領域を呼ぶ口（`areaApi`・`useQuery`） |
| `lib/ops/core/sync.ts` | データの版を見て読み直す |
| `app/api/ops/area/[area]/[op]/route.ts` | 領域の API（http のとき） |
| `lib/server/docs.ts` | 共通 DB（SQLite）の文書テーブル |
| `app/ops/layout.tsx`・`app/ops/_ui/*` | 枠（サイドメニュー・ヘッダー）と共通部品（Icon・Badge・PageHead・Field・Modal・ConfirmModal・useOps のトースト／モーダル） |
| `app/ops/ops.css` | 枠と共通の見た目（10_運営_まとめ.html の CSS） |
| `components/DemoBar.tsx`・`lib/demo.ts` | デモのときだけ出すもの |
| `app/ops/[...slug]/page.tsx` | まだ作っていない画面（「準備中」） |

## 領域（area）

1つの領域 ＝ `lib/ops/areas/<area>.ts` の `defineArea({ name, seed, queries, actions })`。

- **seed**：見本データ。`{ '<area>.<kind>': [{ id, data }] }`。kind は必ず `<area>.` で始める（ほかの領域と混ざらないように）
- **queries**：読み取り。`(repo, args) => 値`
- **actions**：書き換え。`(repo, args) => 値`。http のときはトランザクションの中で動き、終わるとデータの版が上がる（開いている画面が読み直す）
- queries / actions は **DocRepo だけを使う純粋な関数**にする（画面の state・window・Date の直書きを使わない。今日は `today()`・`nowStamp()`）
- ほかの領域のデータは `repo.list('<その領域>.<kind>')` で**読むだけ**ならよい
- 型・見本データ・計算は `lib/ops/<area>/` に分けて置く（例 `types.ts`・`seed.ts`・`logic.ts`）
- メニューにバッジがある画面（申請・要確認）は、query `navBadge` が `{ count, tip? }` を返す

画面から：

```tsx
const api = areaApi(applications);              // lib/ops/areas/applications.ts の default
const { data, loading } = useQuery(api, 'list', { status });
await api.action('approve', { id });           // 終わると data が読み直される
```

## 画面

- `app/ops/<menu.ts の href>/page.tsx`（`'use client'`）。詳細は `[id]/page.tsx` など
- その領域だけの部品は `app/ops/<区切り>/_components/`
- 元の部品（11〜18）の CSS は `app/ops/<区切り>/<area>.css` に移し、**`.ops-<area>` の中だけに効くように**する（`<div className="ops-<area>">` で包む。`:root`・`body` は使わない）。その区切りの `layout.tsx` で読み込む
- 見た目・文言・並び・入力チェック・ボタンの動きは**元のデモと同じ**にする
- デモにしかないもの（作り手向けの注記・「デモのため〜」・見本の切替）は `DEMO`（`lib/demo.ts`）のときだけ出す

## 見本データを入れ直す

seed を変えたら `curl -X POST http://localhost:3200/api/dev/reset`（共通 DB を見本に戻す）。
