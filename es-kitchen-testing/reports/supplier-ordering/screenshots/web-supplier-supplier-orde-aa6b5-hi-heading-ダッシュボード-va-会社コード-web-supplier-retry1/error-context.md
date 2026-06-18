# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: web-supplier/supplier-ordering/tc-auto-004-top-screen-announcements.spec.ts >> TC_AUTO_004 — Dashboard hien thi heading ダッシュボード va 会社コード
- Location: e2e/web-supplier/supplier-ordering/tc-auto-004-top-screen-announcements.spec.ts:12:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'ダッシュボード' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'ダッシュボード' })

```

```yaml
- complementary:
  - img "ES STATION"
  - navigation:
    - menu:
      - menuitem "TOP":
        - img
        - text: TOP
      - menuitem "受注一覧":
        - img
        - text: 受注一覧
      - menuitem "注文管理":
        - img
        - text: 注文管理
      - menuitem "その他":
        - img
        - text: その他
  - img "sidebar mascot"
  - button "toggle sidebar":
    - img "menu-fold"
- banner:
  - link "Logo お帰りなさい":
    - /url: /dashboard
    - img "Logo"
    - text: お帰りなさい
  - button "アカウントメニューを開く":
    - img "es-supplier@yopmail.com"
    - text: es-supplier@yopmail.com
    - img
- main:
  - text: TOP
  - heading "お知らせを確認する" [level=1]
  - tablist:
    - tab "すべて" [selected]
    - tab "重要"
    - tab "お知らせ"
  - tabpanel "すべて"
  - button "【重要】システムメンテナンスのお知らせ" [expanded]:
    - text: 【重要】システムメンテナンスのお知らせ
    - img
  - paragraph: 下記の日時にシステムメンテナンスを実施いたします。 メンテナンス中はサービスをご利用いただけません。 日時：2026年6月20日（土）22:00〜翌2:00（予定） ご不便をおかけしますが、ご理解のほどよろしくお願いいたします。
  - button "【重要】消費税率変更に伴う対応について" [expanded]:
    - text: 【重要】消費税率変更に伴う対応について
    - img
  - paragraph: 2026年10月1日より消費税率が変更となります。 それに伴い、本システムの請求金額計算ロジックを更新いたします。 詳細については以下のリンクをご確認ください。
  - separator
  - link "実行されようとしている（リンク）":
    - /url: https://example.com/tax-notice.pdf
    - text: 実行されようとしている（リンク）
    - img
  - link "実行サイト（リンク）":
    - /url: https://example.com/faq
    - text: 実行サイト（リンク）
    - img
  - button "【重要】パスワードポリシー変更のお知らせ" [expanded]:
    - text: 【重要】パスワードポリシー変更のお知らせ
    - img
  - paragraph: セキュリティ強化のため、2026年7月1日よりパスワードポリシーを変更いたします。 新しいポリシーでは、8文字以上・英数字混在が必須となります。 期日までにパスワードを変更されない場合、ログインできなくなる場合がございます。
  - button "新機能リリース：注文一括エクスポート機能" [expanded]:
    - text: 新機能リリース：注文一括エクスポート機能
    - img
  - paragraph: 受注一覧ページに注文データを一括でCSVエクスポートできる機能を追加しました。 期間指定・ステータス絞り込みにも対応しています。 ぜひご活用ください。
  - separator
  - link "実行サイト（リンク）":
    - /url: https://example.com/docs/export
    - text: 実行サイト（リンク）
    - img
  - button "メニュー登録方法の変更について" [expanded]:
    - text: メニュー登録方法の変更について
    - img
  - paragraph: メニュー管理画面のUI改善に伴い、商品登録フローが一部変更となりました。 主な変更点は以下のとおりです。 ・カテゴリ選択が必須となりました ・画像アップロードの対応形式にWebPを追加 ・一括インポート機能のテンプレートが更新されました
  - button "GW期間中のサポート受付について" [expanded]:
    - text: GW期間中のサポート受付について
    - img
  - paragraph: 2026年5月3日（日）〜5月6日（水）はゴールデンウィーク休暇のため、 サポート受付をお休みさせていただきます。 緊急の場合はサポートページのチャットよりお問い合わせください。
  - separator
  - link "実行サイト（リンク）":
    - /url: https://example.com/support
    - text: 実行サイト（リンク）
    - img
  - button "アプリバージョンアップのお知らせ（v2.3.0）" [expanded]:
    - text: アプリバージョンアップのお知らせ（v2.3.0）
    - img
  - paragraph: ESKITCHENアプリをバージョン2.3.0にアップデートしました。 今回のアップデートには以下の改善が含まれています。 ・注文受付通知の配信速度を改善 ・一部の端末で発生していたクラッシュを修正 ・画面描画パフォーマンスを最適化
  - button "利用規約改定のお知らせ" [expanded]:
    - text: 利用規約改定のお知らせ
    - img
  - paragraph: 2026年7月1日より利用規約を改定いたします。 改定内容は個人情報の取扱いに関する条項の明確化が主な変更点です。 引き続きご利用いただくことで、改定後の利用規約に同意いただいたものとみなします。
  - separator
  - link "改定後の利用規約（全文）":
    - /url: https://example.com/terms
    - text: 改定後の利用規約（全文）
    - img
- region "Notifications Alt+T"
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | // TC_AUTO_004 — AC-02 / SW_SUPO_004 (Dashboard stub): Sau login, /dashboard hien thi dung
  4  | // Source: src/pages/dashboard/DashboardPage.tsx
  5  | //   - heading: "ダッシュボード" (h1, font-bold)
  6  | //   - user name: "ようこそ、{user.name} さん" (neu user.name co)
  7  | //   - card: label "会社コード", value = user.companyCode
  8  | // Source: src/constants/nav.ts — NAV_ITEMS[0] = { labelJa: "ダッシュボード", href: "/dashboard" }
  9  | // Source: src/components/Common/Nav/index.tsx — sidebar menu item "ダッシュボード"
  10 | test.use({ storageState: '.auth/e04.json' })
  11 | 
  12 | test('TC_AUTO_004 — Dashboard hien thi heading ダッシュボード va 会社コード', async ({ page }) => {
  13 |   // Arrange
  14 |   await page.goto('/dashboard')
  15 |   await page.waitForLoadState('networkidle')
  16 | 
  17 |   // Assert — khong phai login page
  18 |   await expect(page).toHaveURL(/\/dashboard/)
  19 | 
  20 |   // Assert — heading chinh (DashboardPage.tsx: h1 "ダッシュボード")
> 21 |   await expect(page.getByRole('heading', { name: 'ダッシュボード' })).toBeVisible()
     |                                                                ^ Error: expect(locator).toBeVisible() failed
  22 | 
  23 |   // Assert — card hien thi 会社コード (DashboardPage.tsx)
  24 |   await expect(page.getByText('会社コード')).toBeVisible()
  25 | 
  26 |   // Assert — sidebar co menu item ダッシュボード (NAV_ITEMS[0].labelJa)
  27 |   await expect(page.getByText('ダッシュボード').first()).toBeVisible()
  28 | })
  29 | 
```