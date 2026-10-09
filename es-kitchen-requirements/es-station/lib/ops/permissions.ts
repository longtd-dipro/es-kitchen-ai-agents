/*
 * 運営Web の権限（2026-10-03 決定）。
 *   - 権限の単位＝機能（下の PERM_FEATURES。運営の権限表の行）。機能ごとに、できる操作（閲覧・作成・編集・削除・CSV取込・CSV出力・機能ごとの操作）を持つ
 *   - 役割（dm.account.roles の grants）＝機能ごとに許す操作の一覧。システム管理（「権限付与」の編集ができる人）が運営Web の「権限」画面で作る・直す
 *   - 2つ以上の役割を持つアカウントは足し算（どれかの役割で許していればできる＝上位の権限）
 *   - サーバーは API ごとに「どの機能のどの操作か」（lib/ops/apiPerm.ts）を見て確かめる。画面はメニュー・ボタンを出し分ける
 * 新しい画面・機能を作ったら、ここに機能と操作を足し、MENU_FEATURES と lib/ops/apiPerm.ts の表にも足す。
 */

/** 操作 */
export type PermOp = 'read' | 'create' | 'update' | 'delete' | 'csvImport' | 'csvExport' | 'approve' | 'publish' | 'confirm' | 'issue' | 'receive';
export const OP_LABEL: Record<PermOp, string> = {
  read: '閲覧', create: '作成', update: '編集', delete: '削除', csvImport: 'CSV取込', csvExport: 'CSV出力',
  approve: '承認・却下', publish: '公開', confirm: '確定・発行', issue: '本発注・キャンセル', receive: '入荷',
};
/** 基本の操作（機能ごとの操作は、その機能の ops に足す） */
const CRUD: PermOp[] = ['read', 'create', 'update', 'delete'];
const CSV: PermOp[] = ['csvImport', 'csvExport'];

/** 役割の権限：機能 → 許す操作 */
export type Grants = Record<string, PermOp[]>;

export type PermFeature = {
  key: string;
  group: string;
  label: string;
  /** この機能に入る今の画面（権限画面の説明に出す） */
  screens: string[];
  ops: PermOp[];
};

export const PERM_FEATURES: PermFeature[] = [
  { key: 'grant', group: '基本操作系', label: '権限付与', screens: ['アカウント一覧', '権限', 'メンテナンス管理', 'バージョン&強制アップデート', 'IPホワイトリスト管理'], ops: [...CRUD] },
  { key: 'dashboard', group: '基本操作系', label: 'ダッシュボード', screens: ['ダッシュボード'], ops: ['read'] },
  { key: 'manual', group: '基本操作系', label: '操作マニュアル（社内用）', screens: [], ops: ['read'] },

  { key: 'corps', group: '法人・拠点・契約管理系', label: '法人情報管理', screens: ['法人一覧', '移行の要補完', '移行CSV取込'], ops: [...CRUD, ...CSV] },
  { key: 'branches', group: '法人・拠点・契約管理系', label: '拠点管理', screens: ['拠点一覧'], ops: [...CRUD, ...CSV] },
  { key: 'contracts', group: '法人・拠点・契約管理系', label: 'プラン契約管理', screens: ['子契約一覧', '契約申請管理'], ops: [...CRUD, ...CSV, 'approve'] },
  { key: 'rental', group: '法人・拠点・契約管理系', label: '冷蔵庫・冷凍庫レンタル契約管理', screens: ['保冷バッグ台帳'], ops: [...CRUD, 'csvExport'] },

  { key: 'collection', group: '集金・廃棄管理系', label: '集金管理', screens: ['実績精算', '請求の確定・請求書'], ops: [...CRUD, 'csvExport', 'confirm'] },
  { key: 'disposal', group: '集金・廃棄管理系', label: '廃棄・集金管理', screens: ['在庫管理（請求）'], ops: [...CRUD, ...CSV] },
  { key: 'disposalInput', group: '集金・廃棄管理系', label: '廃棄入力', screens: ['在庫管理（請求）の入力'], ops: [...CRUD] },

  { key: 'products', group: '商品・プランマスタ管理系', label: '商品マスタ管理', screens: ['商品マスタ', '商品カテゴリ管理'], ops: [...CRUD, ...CSV] },
  { key: 'materials', group: '商品・プランマスタ管理系', label: '資材マスタ管理', screens: ['資材マスタ'], ops: [...CRUD, ...CSV] },
  { key: 'devices', group: '商品・プランマスタ管理系', label: '冷蔵庫・冷凍庫マスタ管理', screens: ['機種マスタ'], ops: [...CRUD, ...CSV] },
  { key: 'plans', group: '商品・プランマスタ管理系', label: 'プラン管理', screens: ['プランマスタ', 'オプションマスタ', 'オプション区分マスタ', '値引きマスタ'], ops: [...CRUD, ...CSV] },
  { key: 'samples', group: '商品・プランマスタ管理系', label: '無料キャンペーン・サンプル管理', screens: ['営業サンプル'], ops: [...CRUD, 'csvExport'] },
  { key: 'stockFood', group: '商品・プランマスタ管理系', label: '在庫管理（惣菜）', screens: ['倉庫在庫'], ops: [...CRUD, ...CSV] },
  { key: 'stockMaterial', group: '商品・プランマスタ管理系', label: '在庫管理（資材）', screens: ['倉庫在庫'], ops: [...CRUD, ...CSV] },

  { key: 'agency', group: 'パートナー・配送管理系', label: '代理店・パートナー管理', screens: ['紹介フィーマスタ', '代理店マスタ', '紹介履歴', '支払履歴'], ops: [...CRUD, ...CSV] },
  { key: 'suppliers', group: 'パートナー・配送管理系', label: '仕入先管理', screens: ['仕入先マスタ'], ops: [...CRUD, ...CSV, 'approve'] },
  { key: 'consign', group: 'パートナー・配送管理系', label: '委託配送管理', screens: ['委託配送先', '配送スタッフ'], ops: [...CRUD, ...CSV] },
  { key: 'relay', group: 'パートナー・配送管理系', label: '中継先管理', screens: ['倉庫マスタ'], ops: [...CRUD, ...CSV] },

  { key: 'menu', group: 'メニュー・オーダー管理系', label: '月間メニュー登録・編集（手動）', screens: ['月間メニュー'], ops: [...CRUD, ...CSV, 'publish'] },
  { key: 'menuPast', group: 'メニュー・オーダー管理系', label: '過去メニュー複製 / 閲覧', screens: [], ops: [...CRUD] },
  { key: 'menuTemplate', group: 'メニュー・オーダー管理系', label: '月間メニューテンプレート管理', screens: [], ops: [...CRUD] },
  { key: 'orders', group: 'メニュー・オーダー管理系', label: 'オーダー管理', screens: ['商品注文管理', '資材注文管理'], ops: [...CRUD, 'csvExport'] },
  { key: 'purchasing', group: 'メニュー・オーダー管理系', label: '発注管理', screens: ['発注', '資材発注', '発注・入荷履歴'], ops: [...CRUD, 'csvExport', 'issue'] },
  { key: 'purchasingBill', group: 'メニュー・オーダー管理系', label: '発注管理：請求照合', screens: ['発注・入荷履歴'], ops: ['read', 'update'] },
  { key: 'receiving', group: 'メニュー・オーダー管理系', label: '入荷管理', screens: ['入荷登録'], ops: ['read', 'update', ...CSV, 'receive'] },
  { key: 'delivery', group: 'メニュー・オーダー管理系', label: '出荷・配送管理', screens: ['スケジュール', '出荷・配送管理', '要確認', '配送問い合わせ', '資材の集計'], ops: [...CRUD, ...CSV] },

  { key: 'notices', group: 'その他機能系', label: 'お知らせ管理', screens: ['お知らせ一覧'], ops: [...CRUD, ...CSV] },
  { key: 'surveys', group: 'その他機能系', label: 'アンケート回収・分析', screens: ['アンケート管理'], ops: [...CRUD, ...CSV] },
  { key: 'sales', group: 'その他機能系', label: '売上管理', screens: ['購入管理', 'お気に入り'], ops: ['read', 'update', 'csvExport'] },
  { key: 'engagement', group: 'その他機能系', label: 'ユーザーエンゲージメント', screens: ['レビュー・ご意見'], ops: ['read', 'update', 'csvExport'] },
  { key: 'points', group: 'その他機能系', label: 'ポイント管理 / スタンプ管理', screens: [], ops: [...CRUD] },
  { key: 'perks', group: 'その他機能系', label: '特典管理', screens: [], ops: [...CRUD] },
  { key: 'referralCampaign', group: 'その他機能系', label: '紹介キャンペーン管理', screens: [], ops: [...CRUD] },
  { key: 'hubspot', group: 'その他機能系', label: 'Hubspot/API連携', screens: ['お問い合わせ（HubSpot 送信）'], ops: ['read', 'update'] },
];
export const FEATURE = Object.fromEntries(PERM_FEATURES.map((f) => [f.key, f])) as Record<string, PermFeature>;

/**
 * 権限表の書き方（CRUD・R/U・R・×）→ 許す操作。
 *   CRUD＝その機能の操作すべて／R/U＝閲覧・編集・CSV出力と機能ごとの操作（作成・削除・CSV取込はしない）／R＝閲覧・CSV出力／×＝なし
 */
export type Level = 'CRUD' | 'R/U' | 'R' | '×';
export function opsOfLevel(f: PermFeature, lv: Level): PermOp[] {
  if (lv === 'CRUD') return [...f.ops];
  if (lv === 'R/U') return f.ops.filter((o) => !['create', 'delete', 'csvImport'].includes(o));
  if (lv === 'R') return f.ops.filter((o) => o === 'read' || o === 'csvExport');
  return [];
}
/** 機能ごとの書き方から grants を作る */
export const grantsOf = (levels: Record<string, Level>): Grants =>
  Object.fromEntries(PERM_FEATURES.map((f) => [f.key, opsOfLevel(f, levels[f.key] ?? '×')]).filter(([, v]) => v.length)) as Grants;
/** grants → 機能ごとの書き方（権限画面の一覧。どれにも合わないときは 'カスタム'） */
export function levelOf(f: PermFeature, ops: PermOp[] = []): Level | 'カスタム' {
  const set = new Set(ops);
  /* 同じになるときは下の方（閲覧だけの機能は「R」） */
  for (const lv of ['×', 'R', 'R/U', 'CRUD'] as Level[]) {
    const want = opsOfLevel(f, lv);
    if (want.length === set.size && want.every((o) => set.has(o))) return lv;
  }
  return 'カスタム';
}

/** 2つ以上の役割の足し算 */
export function mergeGrants(list: (Grants | undefined)[]): Grants {
  const out: Record<string, Set<PermOp>> = {};
  for (const g of list) for (const [k, ops] of Object.entries(g ?? {})) for (const o of ops) (out[k] ??= new Set()).add(o);
  return Object.fromEntries(Object.entries(out).map(([k, s]) => [k, [...s]]));
}
export const can = (g: Grants | undefined, feature: string, op: PermOp) => !!g?.[feature]?.includes(op);

/** メニューの画面（lib/ops/menu.ts の key）→ 機能。どれかの機能の閲覧があればメニューに出す */
export const MENU_FEATURES: Record<string, string[]> = {
  dash: ['dashboard'], ap: ['contracts'], corps: ['corps'], branches: ['branches'], contracts: ['contracts'], migrate: ['corps', 'branches', 'contracts'],
  plans: ['plans'], options: ['plans'], optcats: ['plans'], discounts: ['plans'], products: ['products'], materials: ['materials'], categories: ['products'],
  consignees: ['consign'], warehouses: ['relay'], drivers: ['consign'], coolers: ['rental'], suppliers: ['suppliers'], devices: ['devices'],
  monthly: ['menu'], menuorders: ['orders'], menumats: ['orders'],
  schedule: ['delivery'], dlist: ['delivery'], dreview: ['delivery'], dlinq: ['delivery'], matsum: ['delivery'],
  po: ['purchasing'], mpo: ['purchasing'], poh: ['purchasing'], smp: ['samples'], whs: ['stockFood', 'stockMaterial'], whchk: ['receiving'],
  bladjs: ['disposal', 'disposalInput'], blact: ['collection'], blconfirm: ['collection'], blcash: ['collection'],
  fav: ['sales'], sales: ['sales'], accounts: ['grant'], perm: ['grant'],
  feeplan: ['agency'], agency: ['agency'], referral: ['agency'], payment: ['agency'],
  rv: ['engagement'], notices: ['notices'], inquiries: ['hubspot'], survey: ['surveys'],
  maint: ['grant'], version: ['grant'], ip: ['grant'], avgt: ['menu'],
};

/** 一覧だけの画面（運営の general.genList の key）→ 機能 */
export const GEN_FEATURES: Record<string, string> = {
  product: 'products', consign: 'consign', warehouse: 'relay', driver: 'consign', cooler: 'rental',
  supplier: 'suppliers', perm: 'grant', version: 'grant', ip: 'grant', notices: 'notices', accounts: 'grant',
};
