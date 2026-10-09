/*
 * 状態のバッジの色（全サイト共通・決定 2026/10/03「1つのバッジ・色は状態のグループ」）。
 *   active  緑  ＝有効・適用中（いま効いている／うまく終わって効いている）
 *   planned 青  ＝予定・これから（予約・出荷の前後など、決まった流れで進む途中）
 *   pending 黄  ＝対応待ち（承認・回答・入力など、だれかの対応が要る）
 *   error   赤  ＝エラー・警告（否認・却下・不足・停止）
 *   ended   灰  ＝終わった・削除済（無効・取消・締切）
 * 状態の文字 → グループは下の1つの表（STATUS_GROUPS）。同じ文字で意味が違う領域だけ SCOPED で上書きする。
 * 各サイトのバッジ部品は、このグループからサイトの色のクラスを選ぶ（ES_TONE・OPS_CLS・CARRIER_CLS・DRIVER_CLS）。
 */

export type StatusGroup = 'active' | 'planned' | 'pending' | 'error' | 'ended';

/** 状態の文字の表（領域：契約・拠点・申請・配送・注文・メニュー・請求・アンケート・発注・入荷・アカウント・マスタ…） */
export const STATUS_GROUPS: Record<StatusGroup, readonly string[]> = {
  active: [
    /* 共通・マスタ・アカウント */ '有効', '公開', '公開中', '使用中', '適用中', '本登録', '正式登録', '稼働中', 'ON', '利用中',
    /* 申請・承認 */ '承認', '承認済', '完了', '決定', '回答済',
    /* 配送 */ '納品済', 'お届け済', '配送完了',
    /* 注文 */ '登録済', 'ES登録済', '受付済',
    /* 発注・入荷 */ '本発注済', '入荷済', '一致', '対応済', '出荷済', '締め済',
    /* 請求（確定＝発行前なので planned。請求済み・送付済み＝緑：hong 2026-10-05 受付簿 No.157） */ '請求済', '入金済', '支払済', '送付済', '開封済',
    /* 貸出・台帳 */ '貸出中', '貸与中',
    /* 棚卸報告・お知らせ */ '申告済', '報告済', '確認済', '送信済（HubSpot）', '送信済', 'メール送信',
    /* 運営の発注・入荷の照合 */ '記載通り', '照合済', 'ES対応済',
    /* 法人Web・アプリ・申請の表示 */ 'ご契約開始済', '送信しました', '連携中', 'ログイン済', '確定済', '確認済',
  ],
  planned: [
    '予定', '予定中', '予約中', '自動公開', '受付前', 'お届け予定', '準備中',
    '出荷待', '出荷指示済', '出荷済', '受取済', '配送中', '未配送', '一部出荷済', '出荷可',
    '仮発注済', '納期回答済', '本発注待ち', '未入荷', '未出荷',
    '未着（予定）', '未入庫', '再配送予定',
    '回収予定', '閉鎖予定', '確定', '発行済', '発行済（ログイン前）', '送付待ち', '実行中', 'メール送信予約',
  ],
  pending: [
    '申請中', '申込中', '受付中', '承認待ち', '本発注の承認待ち', '未承認', '回答待ち', '未回答', '再確認待ち', '依頼中', '提案中', '別の日のご提案',
    '確認中', '再配達待', '未受取', '未送信', '差異あり・対応待ち', '分納待ち', '納期回答待ち', '一部仮発注',
    '未確定', '未払い', '未発行', '免許未登録', '仮登録', '未手続き', '手続き中', '入力中', '編集中', '契約設定中', '対応中', '一部承認',
    '到着済（未処理）', '未照合', 'ESキッチンが確認中', '配送日調整中', '未返却', '再送待ち', '対応中', '要確認', '未保存', '設定中',
    '解約手続き中', 'デフォルト', '返金中', '締め後追加', 'メンテナンス中', '契約前', '利用休止', '休止中',
    /* 一部だけ届いた配送（残りの対応が要る・2026/10/03 決定） */ '一部納品済', '一部お届け済',
  ],
  error: [
    'エラー', '送信エラー', '否認', '却下', '受注不可', '期限切れ', 'NG／ES要確認', '差異あり', '送信失敗', 'お受けできませんでした', '購入不可', '未入金', '紛失',
    '利用停止', '停止', '途中解約', 'トラブル', 'トラブルあり',
  ],
  ended: [
    '終了', '削除済', '無効', '取消', '中止', '取り下げ', '取り下げ済', '辞退', '回収済', '閉鎖', '満了', '退会', '退会済',
    '廃棄', '返却', '締切済', '繰越済', '返金済', '停止中', '非公開', '休眠', '配信停止', '変更不可', '参照のみ', 'お試し（自動）', '解決済', '対応不可', 'キャンセル', '取消済', 'お届け中止', '解除済', '解約済', '対象外',
  ],
};

/** 同じ文字で意味が違う領域（scope）だけの上書き */
export const SCOPED: Record<string, Record<string, StatusGroup>> = {
  /* 注文の受付（サイクルの orderState）：受付中＝注文できる（効いている） */
  order: { 受付中: 'active' },
  /* 仕入先サイト：出荷済＝仕入先の作業は終わった */
  supplier: { 出荷済: 'active' },
};

const INDEX = new Map<string, StatusGroup>();
for (const [g, labels] of Object.entries(STATUS_GROUPS) as [StatusGroup, readonly string[]][]) for (const l of labels) if (!INDEX.has(l)) INDEX.set(l, g);

/** 状態の文字 → グループ（表にない文字は undefined） */
export function statusGroup(label: unknown, scope?: string): StatusGroup | undefined {
  if (typeof label !== 'string') return undefined;
  const s = label.trim();
  return (scope ? SCOPED[scope]?.[s] : undefined) ?? INDEX.get(s);
}

/* ---------- サイトの色のクラス ---------- */

/** es-design（運営の請求・申請・メニュー・配送・契約、法人Web）の es-badge--* */
export const ES_TONE: Record<StatusGroup, string> = { active: 'success', planned: 'info', pending: 'warning', error: 'negative', ended: 'neutral' };
/** 運営 ops.css・仕入先 supplier.css の .badge.b-* */
export const OPS_CLS: Record<StatusGroup, string> = { active: 'b-ok', planned: 'b-info', pending: 'b-warn', error: 'b-ng', ended: 'b-mute' };
/** 委託配送先 carrier.css の .badge.b-* */
export const CARRIER_CLS: Record<StatusGroup, string> = { active: 'b-green', planned: 'b-blue', pending: 'b-amber', error: 'b-red', ended: 'b-gray' };
/** ドライバー driver.css の .badge.b-*（グループのクラス） */
export const DRIVER_CLS: Record<StatusGroup, string> = { active: 'b-active', planned: 'b-planned', pending: 'b-pending', error: 'b-error', ended: 'b-ended' };

/** es-badge の色。状態でなければ fallback */
export const esTone = (label: unknown, fallback = 'neutral', scope?: string) => {
  const g = statusGroup(label, scope);
  return g ? ES_TONE[g] : fallback;
};
/** ops.css・supplier.css の色のクラス。状態でなければ fallback */
export const opsCls = (label: unknown, fallback = 'b-mute', scope?: string) => {
  const g = statusGroup(label, scope);
  return g ? OPS_CLS[g] : fallback;
};
/** carrier.css の色のクラス。状態でなければ fallback */
export const carrierCls = (label: unknown, fallback = 'b-gray', scope?: string) => {
  const g = statusGroup(label, scope);
  return g ? CARRIER_CLS[g] : fallback;
};
/** driver.css の色のクラス。状態でなければ fallback（灰） */
export const driverCls = (label: unknown, fallback = DRIVER_CLS.ended, scope?: string) => {
  const g = statusGroup(label, scope);
  return g ? DRIVER_CLS[g] : fallback;
};
