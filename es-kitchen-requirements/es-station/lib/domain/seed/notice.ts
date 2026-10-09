import { MOCK_NOTICES } from '@/mocks/supplier/notices';
import type { Announcement, Inquiry, MailTemplate, Notification, Site } from '../types';

/*
 * お知らせ・通知・メールの文面の見本。
 * 仕入先向けのお知らせは仕入先サイトの見本（mocks/supplier/notices.ts）と同じ ID・中身。
 * 通知はほかの見本（申請・トラブル・請求書・お届け日の変更）と合わせてある。
 */

export const ANNOUNCEMENTS: Announcement[] = [
  ...MOCK_NOTICES.map((n) => ({
    id: String(n.id), sites: ['supplier'] as Site[], category: n.cat, important: n.imp, title: n.title, body: n.body, publishFrom: n.date, publishTo: '', files: n.files,
  })),
  { id: '12444', sites: ['carrier', 'driver'], category: 'お知らせ', important: false, title: '保冷バッグ・保冷剤の回収にご協力のお願い', body: '使わなくなった保冷バッグ・保冷剤は、次の配送のときに倉庫へお戻しください。', publishFrom: '2026/09/18', publishTo: '2026/10/04', files: ['回収の手順.pdf'] }, /* 運営の見本どおり配信停止（10/04 まで） */
  { id: '12453', sites: ['corp', 'carrier', 'driver'], category: 'お知らせ', important: true, title: '年末年始の配送について', body: '12/29〜1/3 はお届けがありません。2027年1月サイクルは 1/4（月）から始まります。', publishFrom: '2026/10/01', publishTo: '2027/01/04', files: [],
    mail: { subject: '【ESステーション】【重要】年末年始の配送について', sendAt: '2026/10/01 08:00', to: ['法人・拠点：全員', '委託配送先：全員', 'ドライバー：全員'], auto: true } }, /* 重要なお知らせは公開開始日の 8:00 にメール */
  { id: '12454', sites: ['corp'], category: 'メニュー', important: false, title: '11月のメニューを公開しました（ご注文は 10/15 まで）', body: '新しい商品が6品増えました。10月15日までにご注文ください。ご注文がない拠点は、基準数でお届けします。', publishFrom: '2026/10/01', publishTo: '2026/10/15', files: [] },
  /* 課題 5-4：メールだけのお知らせ（どのサイトにも出さない。運営・システム管理の一覧と送信の記録にだけ出る） */
  { id: '12456', sites: [], category: 'お知らせ', important: false, title: '請求書の送付方法の変更（Bill One）のご案内', body: '11月発行分から、請求書は Bill One からメールでお送りします。',
    publishFrom: '2026/10/03', publishTo: '', files: [],
    mail: { subject: '【ESステーション】請求書の送付方法の変更のご案内', sendAt: '2026/10/03 10:00', to: ['法人・拠点：メイン担当者・請求担当者'] },
    sendLog: [
      { at: '2026/10/02 17:30', kind: '登録', to: 'サイトには出さない（メールのみ）', note: '公開 2026/10/03〜' },
      { at: '2026/10/02 17:30', kind: 'メール送信予約', to: '法人・拠点：メイン担当者・請求担当者', note: '2026/10/03 10:00 に送信（件名：【ESステーション】請求書の送付方法の変更のご案内）' },
    ] },
  { id: '12455', sites: ['ops', 'sysadmin'], category: 'メンテナンス', important: true, title: 'システムメンテナンス（10/5 23:00〜翌2:00）', body: '仕入先サイト・法人Web・委託配送先Web・ドライバーアプリが使えません。運営Web・システム管理は使えます。', publishFrom: '2026/09/28', publishTo: '2026/10/06', files: [],
    mail: { subject: '【ESステーション】【重要】システムメンテナンス（10/5 23:00〜翌2:00）', sendAt: '2026/09/28 08:00', to: ['運営：全員', 'システム管理：全員'], auto: true } },
];

const S = (...s: Site[]) => s;
export const TEMPLATES: MailTemplate[] = [
  { id: 'account_issued', name: 'アカウントの発行', sites: S('corp', 'carrier', 'driver', 'supplier', 'ops'), subject: '【ESステーション】ログインのご案内', body: '{name} 様\nアカウントを発行しました。ログインID：{loginId}\n初回ログインのときにパスワードを決めてください。', updatedAt: '2026/09/01 10:00' },
  /* 運営Web：IP ホワイトリスト外からのログインの認証コード（4桁・5分。台帳 E・受付簿 #61） */
  { id: 'ops_login_otp', name: '運営Web ログインの認証コード（IP ホワイトリスト外）', sites: S('ops'), subject: '【ESステーション】運営Web ログインの認証コード', body: '{name} 様\n登録されていない接続元から運営Web へのログインがありました。本人の操作であれば、次の認証コードをログイン画面に入れてください。\n認証コード：{code}（{minutes}分間有効）\n心当たりがない場合は、このメールを破棄し、システム管理にご連絡ください。', updatedAt: '2026/10/05 10:00' },
  { id: 'password_reset', name: 'パスワード再設定の認証コード', sites: S('corp', 'carrier', 'driver', 'supplier', 'ops', 'sysadmin'), subject: '【ESステーション】パスワード再設定の認証コード', body: '認証コード：{code}（{minutes}分間有効）', updatedAt: '2026/09/01 10:00' },
  { id: 'application_received', name: '申請を受け付けました', sites: S('corp', 'ops'), subject: '【ESステーション】{kind}を受け付けました（{id}）', body: '{company} 様\n{kind}を受け付けました。結果はあらためてお知らせします。', updatedAt: '2026/09/20 10:00' },
  { id: 'application_decided', name: '申請の結果', sites: S('corp'), subject: '【ESステーション】{kind}の結果（{id}）', body: '{branch}：{result}\n{reason}', updatedAt: '2026/09/20 10:00' },
  { id: 'date_change', name: 'お届け日の変更', sites: S('corp', 'ops'), subject: '【ESステーション】お届け日の変更（{id}）', body: '{branch} の {date} の便：{result}', updatedAt: '2026/09/25 10:00' },
  { id: 'trouble', name: '配送状況の確認', sites: S('corp', 'ops', 'carrier'), subject: '【ESステーション】配送状況を確認しています（{deliveryId}）', body: '{branch} の {date} の便で、確認が必要なことがありました。運営から連絡します。', updatedAt: '2026/09/30 10:00' },
  { id: 'invoice_unpaid', name: '入金の確認ができません', sites: S('corp'), subject: '【ESステーション】ご入金の確認ができませんでした（{id}）', body: 'お支払い期日 {due} までにご入金を確認できませんでした。次回の請求書で再請求します。', updatedAt: '2026/09/01 10:00' },
  { id: 'order_reminder', name: 'オーダーが入力されていません（締切の7日前・3日前・未入力の拠点だけ。法人が切ったら送らない）', sites: S('corp'), subject: '【ESステーション】{cycle} のご注文は {close} までです（まだ入力されていません）', body: '{branch} の {cycle} のご注文がまだ入力されていません。ご注文がない場合は基準数でお届けします。', updatedAt: '2026/10/03 18:00' },
  { id: 'assignment_missing', name: 'ドライバーが決まっていない区間', sites: S('carrier', 'ops'), subject: '【ESステーション】ドライバーが決まっていない配送があります（{count}件）', body: '{date} までの配送で、ドライバーが決まっていない区間があります。割り当ててください。', updatedAt: '2026/09/30 10:00' },
  { id: 'quote_request', name: '見積のお願い', sites: S('carrier'), subject: '【ESステーション】見積のお願い（{id}）', body: '{branch}（{address}）の配送の見積をお願いします。回答期限：{answerBy}', updatedAt: '2026/09/30 10:00' },
  /* 月間メニュー（フェーズ2：公開したら法人だけに知らせる。アプリの利用者には出さない） */
  { id: 'menu_published', name: '月間メニューの公開（注文の受付開始）', sites: S('corp'), subject: '【ESステーション】{cycle} のメニューを公開しました（ご注文は {close} まで）', body: 'ご注文の受付：{from}〜{close}\nご注文の方法：法人Web の「月次注文」で便ごとに商品と個数を選んでください（ご注文がない拠点は基準数でお届けします）。\nお届け日の変更：法人Web の「お届け予定」から申請できます。', updatedAt: '2026/10/02 18:00' },
  { id: 'menu_updated', name: '月間メニューの更新', sites: S('corp'), subject: '【ESステーション】{cycle} のメニューを更新しました', body: 'ご注文の内容をご確認ください（締切 {close}）。', updatedAt: '2026/10/02 18:00' },
  { id: 'alt_notice', name: '代替品のお知らせ（法人）', sites: S('corp'), subject: '【ESステーション】代替品のお知らせ（{product}）', body: '{product} に不良が見つかったため、次のとおり対応します。\n{rows}\n代替品は「代替品（元：{product}）」としてお届け詳細・納品書・月次注文に表示します。', updatedAt: '2026/10/02 23:00' },
  /* お試しの延長（運営だけ・2026/10/03 決定。lib/domain/trial.ts） */
  { id: 'trial_extended', name: 'お試し期間の延長', sites: S('corp'), subject: '【ESステーション】お試し期間を延長しました（{branch}）', body: '{branch} 様\nお試し期間を {from}〜{to} サイクルの{months}ヶ月延長しました。延長の期間の料金はかかりません。\nお試し期間：{start}〜{to} サイクル\n正式なご契約へ切り替えるお申し込みの期限：{decide}', updatedAt: '2026/10/03 10:00' },
  { id: 'meal_arrived', name: 'お食事が届きました（アプリの利用者）', sites: [], subject: 'お食事が届きました', body: '{date} の便が届きました。', updatedAt: '2026/10/02 18:00' },
  /* 旧システムのメールとの突き合わせで足したもの（2026/10/03 決定・lib/domain/mails.ts の OLD_MAILS）。予定のお知らせはお客様の休み（土日祝）なら前の営業日に送る */
  { id: 'order_open', name: 'オーダー受付開始', sites: S('corp'), subject: '【ESステーション】{cycle} のご注文の受付を開始しました（{close} まで）', body: 'ご注文の受付：{from}〜{close}\n法人Web の「月次注文」で便ごとに商品と個数を選んでください（ご注文がない拠点は基準数でお届けします）。', updatedAt: '2026/10/03 18:00' },
  { id: 'delivery_schedule', name: '次月の発送・納品予定日のお知らせ', sites: S('corp'), subject: '【ESステーション】{cycle} のお届け予定日のお知らせ', body: '{branch} 様\n{cycle} のお届け予定日は次のとおりです。\n{rows}\nお届け日の変更：法人Web の「お届け予定」から申請できます。', updatedAt: '2026/10/03 18:00' },
  { id: 'order_registered', name: 'オーダー登録', sites: S('corp'), subject: '【ESステーション】{cycle} の商品注文を{action}しました（{branch}）', body: '{branch} の {cycle} の商品注文を{action}しました（合計 {total}個）。\n締切 {close} までは法人Web の「月次注文」で直せます。', updatedAt: '2026/10/03 18:00' },
  { id: 'contact_changed', name: 'ご担当者の変更のお知らせ', sites: S('corp'), subject: '【ESステーション】ご担当者の変更を受け付けました（{owner}）', body: '{owner} のご担当者を次のとおり変更しました。\n{rows}\nこのお知らせはメイン担当者・請求担当者（変更前・変更後）にお送りしています。お心当たりがない場合はお問い合わせください。', updatedAt: '2026/10/03 18:00' },
  { id: 'apply_received', name: '新規のお申し込みの受付完了（M1）', sites: S('corp'), subject: 'お申し込みを受け付けました（受付番号 {id}）', body: '{company}\n{name} 様\n\nES STATION へのお申し込みをありがとうございます。\n下記の内容で受け付けました。運営で内容を確認し、2〜3営業日でご連絡します。\n\n■ 受付番号　：{id}\n■ お申し込み日：{date}\n■ 契約の種類：{kubun}\n■ 納品先　　：{branches}\n■ 開始希望　：{start}サイクルから\n\n■ キックオフ面談のご予約：{url}\n　 ご利用開始に向けたキックオフ面談（1時間）のご予約をお願いします。\n\nお問い合わせの際は、受付番号をお知らせください。', updatedAt: '2026/10/05 10:00' },
  { id: 'apply_rejected', name: '新規のお申し込みの結果（却下・Mail List No.28）', sites: S('corp'), subject: '【ESステーション】新規のお申し込みについて（受付番号：{id}）', body: 'ESステーションをご利用いただきありがとうございます。\n誠に恐れ入りますが、以下のお申し込みは今回はお受けできませんでした。\n\n■ 受付番号：{id}\n■ お申し込み日：{date}\n■ 契約の種類：{kubun}\n■ 法人名：{company}\n■ 納品先：{branches}\n■ 理由：{reason}\n\n内容をご確認のうえ、あらためてお申し込みいただくこともできます。ご不明な点はサポート窓口までお問い合わせください。', updatedAt: '2026/10/09 10:00' },
  { id: 'order_default_fixed', name: '自動注文で確定したお知らせ', sites: S('corp'), subject: '【ESステーション】{cycle} のご注文は基準注文数で確定しました（{branch}）', body: '{name} 様\nオーダー締切（{close}）までにご注文がなかったため、基準注文数（自動注文）のまま確定しました（合計 {total}個）。\nお届けの内容は法人Web の「月次注文」で見られます。', updatedAt: '2026/10/05 12:00' },
  { id: 'contact_manual', name: '新しいご担当者へのご案内（マニュアル・M13）', sites: S('corp'), subject: '【ESステーション】ご担当者のご登録とご利用マニュアルのご案内', body: '{name} 様\n{owner} のご担当者としてご登録いただきました。\nご利用マニュアル（動画・資料）：{url}', updatedAt: '2026/10/03 18:00' },
  { id: 'kari_order', name: '仮発注のお知らせ（仕入先）', sites: S('supplier'), subject: '【ESステーション】仮発注のお知らせ（{count}件）', body: '{company} 御中\n次の仮発注をお送りしました。仕入先サイトの「発注一覧」で納期をご回答ください。\n{rows}', updatedAt: '2026/10/03 18:00' },
  { id: 'hon_order', name: '発注確定のお知らせ（仕入先）', sites: S('supplier'), subject: '【ESステーション】発注確定（本発注）のお知らせ（{count}件）', body: '{company} 御中\n次の発注が確定しました（本発注）。仕入先サイトの「本発注の承認待ち」で承認してください。\n{rows}', updatedAt: '2026/10/03 18:00' },
  { id: 'delivery_request', name: '配送依頼（委託配送先）', sites: S('carrier'), subject: '【ESステーション】配送のご依頼（{date} 出荷・{count}件）', body: '{carrier} ご担当者様\n{date} 出荷の配送をご依頼します（送り状・出荷指示がそろいました）。\n{rows}\n委託配送先Web の「配送一覧」でドライバーを割り当ててください。', updatedAt: '2026/10/03 18:00' },
  { id: 'es_plan_added', name: '新規ES配送プラン追加のお知らせ（委託配送先）', sites: S('carrier'), subject: '【ESステーション】新しいお届け先が追加されます（{branch}）', body: '{carrier} ご担当者様\n新しいお届け先（ES配送便）が仮登録されました。\n{rows}\nお届けの開始・枠は本登録のあとに配送一覧に出ます。', updatedAt: '2026/10/03 18:00' },
  { id: 'important_notice', name: '重要なお知らせ（メール）', sites: S('corp', 'carrier', 'driver', 'supplier'), subject: '【ESステーション】【重要】{title}', body: '{body}\n（公開開始日の 8:00 にお送りします。法人あては土日祝なら前の営業日）', updatedAt: '2026/10/03 18:00' },
  /* すでに送っていて文面がなかったもの */
  { id: 'account_stopped', name: 'アカウント停止のお知らせ', sites: S('corp'), subject: '【ESステーション】アカウント停止のお知らせ（{branch}）', body: 'ご解約にともない、{branch} のアカウントを停止いたしました。\n解約日：{endOn}\n停止日：{stopOn}（最後のご請求の入金期限の翌日）', updatedAt: '2026/10/03 18:00' },
  { id: 'contract_registered', name: 'ご契約の登録完了', sites: S('corp'), subject: '【ESステーション】ご契約の登録が完了しました（{branch}）', body: '{start} サイクルからお届けします。', updatedAt: '2026/10/03 18:00' },
  { id: 'M3', name: '本導入への切り替え', sites: S('corp'), subject: '【ESステーション】正式なご契約への切り替えのご案内（{branch}）', body: '正式なご契約の開始：{start} サイクル\nログインID・パスワードはお試しのときと同じです。', updatedAt: '2026/10/03 18:00' },
  { id: 'order_reset', name: '商品注文をデフォルトに戻しました', sites: S('corp'), subject: '【ESステーション】商品注文をデフォルトに戻しました（{branch}）', body: '{reason}\n締切 {close} までにご注文を入れ直してください。', updatedAt: '2026/10/03 18:00' },
  { id: 'stock_short', name: 'お届けする商品の変更（入荷の不足）', sites: S('corp'), subject: '【ESステーション】お届けする商品の変更のお知らせ（{product}）', body: '{rows}\n納品分に含まれない商品はご請求しません。', updatedAt: '2026/10/03 18:00' },
  { id: 'inquiry_new', name: '新しいお問い合わせ（運営の通知先メール）', sites: S('ops'), subject: '【ESステーション】新しいお問い合わせ（{category}）：{subject}', body: '{name}（{corp}）からお問い合わせがありました。受付番号 {hubspotId}\n返事・対応は HubSpot で行ってください。（通知先メールが設定されていなければ送りません）', updatedAt: '2026/10/03 18:00' },
  { id: 'survey_open', name: 'アンケートのお願い（アプリの利用者）', sites: [], subject: '【ESステーション】アンケートのお願い：{name}', body: '{endAt} までにご回答ください。', updatedAt: '2026/10/03 18:00' },
  { id: 'survey_remind', name: 'アンケートのリマインド（アプリの利用者）', sites: [], subject: '【ESステーション】【リマインド】アンケートのお願い：{name}', body: '回答期限は {endAt} です。まだの方はご回答ください。（土日祝にあたるときは前の営業日にお送りします）', updatedAt: '2026/10/03 18:00' },
];

const n = (id: string, at: string, to: Notification['to'], templateId: string, title: string, body: string, link: Notification['link'], readAt = ''): Notification =>
  ({ id, at, to, channels: ['site', 'mail'], templateId, title, body, link, readAt });

export const NOTIFICATIONS: Notification[] = [
  n('NT-260915-0001', '2026/09/15 15:30', { site: 'corp', accountId: 'CU00871', role: '' }, 'trouble', '配送状況を確認しています', '9/15 の便で5食足りませんでした。9/17 にお届けします。', { type: 'delivery', id: 'DL-260914-0001' }, '2026/09/15 16:00'),
  n('NT-260925-0001', '2026/09/25 10:30', { site: 'ops', accountId: '', role: 'ops.sales' }, 'application_received', 'プランの変更の申請（CH-20260925-0001）', '株式会社サンプル 大阪支店：50プラン → 100プラン（ESスタンダード）・2026年11月サイクルから', { type: 'application', id: 'CH-20260925-0001' }),
  n('NT-260925-0002', '2026/09/25 10:30', { site: 'corp', accountId: 'CU00871', role: '' }, 'application_received', 'プランの変更を受け付けました（CH-20260925-0001）', '結果はあらためてお知らせします。', { type: 'application', id: 'CH-20260925-0001' }, '2026/09/25 11:00'),
  n('NT-260928-0001', '2026/09/28 10:00', { site: 'corp', accountId: 'CU01310', role: '' }, 'application_decided', '解約の申請が承認されました（CH-20260927-0002）', '2026年10月サイクルが最後のお届けです。', { type: 'application', id: 'CH-20260927-0002' }, '2026/09/28 12:00'),
  n('NT-260930-0001', '2026/09/30 10:00', { site: 'ops', accountId: '', role: 'ops.delivery' }, 'trouble', '遅延の報告（未解決）', 'ひかり物産 川崎工場の便で遅延の報告があります。', { type: 'trouble', id: 'TR-260919-0001' }),
  n('NT-261001-0001', '2026/10/01 02:00', { site: 'corp', accountId: 'CU00001', role: '' }, 'invoice_unpaid', 'ご入金の確認ができませんでした（INV-2026080001）', 'お支払い期日 2026/08/27 までにご入金を確認できませんでした。INV-2026100001 で再請求しています。', { type: 'invoice', id: 'INV-2026080001' }),
  n('NT-261005-0001', '2026/10/05 09:12', { site: 'ops', accountId: '', role: 'ops.delivery' }, 'date_change', 'お届け日の変更の申請（DD-20261005-0095）', '株式会社サンプル 大阪支店：11/10 → 第1希望 11/12・第2希望 11/17', { type: 'delivery', id: 'DL-261109-0001' }),
  n('NT-261005-0002', '2026/10/05 08:00', { site: 'carrier', accountId: 'DE00007', role: '' }, 'quote_request', '見積のお願い（QT-2026-1002-019）', 'ひかり物産 横浜オフィスの配送の見積をお願いします。回答期限：2026/10/07', { type: 'quote', id: 'QT-2026-1002-019' }),
  n('NT-261005-0003', '2026/10/05 07:00', { site: 'corp', accountId: 'CU00643', role: '' }, 'order_reminder', '2026年11月サイクルのご注文は 10/15 までです', 'ご注文がない場合は基準数でお届けします。', { type: 'order', id: 'O-202611-CU00643' }, '2026/10/05 08:30'),
];

/** お問い合わせ（法人Web → HubSpot。Phase 2 のデモ。送ったことにして記録だけ） */
export const INQUIRIES: Inquiry[] = [
  { id: 'IQ-261001-0001', at: '2026/10/01 14:20', corpId: 'CU00001', branchId: '', accountId: 'CU00001', name: '山田 花子', email: 'hanako.yamada@sample.co.jp', tel: '03-1234-5678',
    category: '請求・お支払い', subject: '請求書の宛名の変更について', body: '11月発行分から請求書の宛名を「株式会社サンプル 経理部」に変えたいです。手続きを教えてください。', status: '送信済（HubSpot）', hubspotId: 'HS-2610010001', readAt: '2026/10/01 15:02' },
  { id: 'IQ-261003-0001', at: '2026/10/03 09:05', corpId: 'CU00001', branchId: 'CU00871', accountId: 'CU00871', name: '佐藤 一郎', email: 'ichiro.sato@sample.co.jp', tel: '06-1234-5678',
    category: '商品・メニュー', subject: 'アレルギー表示の資料', body: '11月メニューのアレルギー表示の一覧（PDF）はありますか。', status: '送信済（HubSpot）', hubspotId: 'HS-2610030001' },
];
