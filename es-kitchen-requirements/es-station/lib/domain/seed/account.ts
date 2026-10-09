import type { Account, AppVersion, AuditLog, IpRule, LoginRecord, Perm, Role, Site, SiteSetting } from '../types';
import { grantsOf, type Grants, type Level } from '@/lib/ops/permissions';
import { BRANCHES, CONTRACTS, CORPS } from './org';
import { CARRIERS, DRIVERS } from './master';

/*
 * アカウント・役割の見本（全サイト）。運営のアカウント一覧（lib/ops/general/seed.ts の GEN_ACCOUNTS・GEN_PERM・GEN_IP）と同じ ID・名前。
 * 役割と画面の権限：01_仕様/基本設計_全体の定義_提案_20261001.md §4-3（提案）。システム管理（sysadmin）は今回足したサイト。
 * ログインID＝アカウントの ID（拠点アカウントも大文字の CU…）。開発中はパスワードを持たない。
 */

const P = (s: string): Record<string, Perm> =>
  Object.fromEntries(s.split(' ').map((x) => { const [k, v] = x.split(':'); return [k, v as Perm]; }));

/**
 * 運営の権限表（2026-10-03・システム管理が「権限」画面で直せる。これは見本の初期値）。
 * 機能（lib/ops/permissions.ts の PERM_FEATURES）→ 役割ごとの書き方 [フル権限, 経理, 営業, CS, 商品管理, 商品開発, 物流]
 * CRUD＝すべて／R/U＝閲覧・編集（作成・削除・CSV取込なし）／R＝閲覧／×＝なし。2つ以上の役割を持つときは上位の方
 */
const R7 = (...v: Level[]) => v;
const ALL_R = R7('CRUD', 'R', 'R', 'R', 'R', 'R', 'R');
const OPS_TABLE: Record<string, Level[]> = {
  grant: R7('CRUD', 'R', 'R', 'R', 'R', 'R', 'R'),   // 権限付与：フル権限＝CRUD、ほかの6役割＝R（hong 2026-10-06・受付簿 No.173）
  dashboard: R7('R', 'R', 'R', 'R', 'R', 'R', 'R'),
  manual: R7('R', 'R', 'R', 'R', 'R', 'R', 'R'),
  corps: R7('CRUD', 'R', 'R', 'R/U', 'R', 'R', 'R'),
  branches: R7('CRUD', 'R', 'R', 'R', 'R', 'R', 'R/U'),
  contracts: R7('CRUD', 'R', 'R', 'R/U', 'R', 'R', 'R'),
  rental: R7('CRUD', 'R/U', 'R', 'R', 'R', 'R', 'R'),
  collection: R7('CRUD', 'CRUD', 'R', 'R', 'R', 'R', 'R'),   // 物流＝R（集金管理は参照のみ・実績精算／請求の確定・請求書も R。hong 2026-10-08・受付簿 No.382）
  disposal: R7('CRUD', 'R/U', 'R', 'R/U', 'R', 'R', 'R/U'),
  disposalInput: R7('CRUD', 'R', 'R', 'R/U', 'R', 'R', 'R/U'),
  products: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  materials: ALL_R,
  devices: R7('CRUD', 'R', 'CRUD', 'R', 'CRUD', 'CRUD', 'R'),
  plans: ALL_R,
  samples: R7('CRUD', 'R', 'CRUD', 'R', 'R/U', 'R', 'R'),
  stockFood: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  stockMaterial: R7('CRUD', 'R', 'R', 'R', 'CRUD', 'R', 'R'),
  agency: R7('CRUD', 'CRUD', 'CRUD', 'R', 'R', 'R', 'R'),
  suppliers: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  consign: R7('CRUD', 'R', 'R', 'R', 'R', 'R', 'CRUD'),
  relay: R7('CRUD', 'R', 'R', 'R', 'R', 'R', 'CRUD'),
  menu: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  menuPast: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  menuTemplate: R7('CRUD', 'R', 'CRUD', 'CRUD', 'CRUD', 'CRUD', 'R'),
  orders: R7('CRUD', 'R', 'CRUD', 'CRUD', 'R', 'R/U', 'R'),
  purchasing: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  /* 請求照合の変更（台帳 I・2026-10-08：経理も変えられる）。発注管理の編集ができる商品開発とフル権限も */
  purchasingBill: R7('CRUD', 'R/U', 'R', 'R', 'R', 'R/U', 'R'),
  receiving: R7('CRUD', 'R', 'R', 'R', 'R', 'CRUD', 'R'),
  delivery: R7('CRUD', 'R', 'CRUD', 'CRUD', 'CRUD', 'CRUD', 'R/U'),
  notices: R7('CRUD', 'CRUD', 'CRUD', 'CRUD', 'CRUD', 'CRUD', 'CRUD'),
  surveys: ALL_R,
  sales: ALL_R,
  engagement: R7('CRUD', 'R', 'R/U', 'R/U', 'R/U', 'R/U', 'R'),
  points: R7('CRUD', 'CRUD', 'CRUD', 'CRUD', 'R', 'R', 'R'),
  perks: ALL_R,
  referralCampaign: ALL_R,
  hubspot: R7('CRUD', '×', '×', '×', '×', '×', '×'),
};
const col = (i: number) => grantsOf(Object.fromEntries(Object.entries(OPS_TABLE).map(([k, v]) => [k, v[i]])));
const opsRole = (id: string, name: string, note: string, grants: Grants): Role => ({ id, site: 'ops', name, note, perms: {}, grants });
export const OPS_ROLES: Role[] = [
  opsRole('ops.full', 'フル権限', '全ての画面・操作が可能な管理者権限', col(0)),
  opsRole('ops.accounting', '経理', '集金・代理店・ポイントの管理', col(1)),
  opsRole('ops.sales', '営業', '冷蔵庫・冷凍庫マスタ・サンプル・代理店・オーダー・出荷の管理', col(2)),
  opsRole('ops.cs', 'CS', '法人情報・契約・廃棄・オーダー・出荷の対応', col(3)),
  opsRole('ops.master', '商品管理', '資材の管理がメイン（在庫管理（資材）・冷蔵庫・冷凍庫マスタ）', col(4)),
  opsRole('ops.dev', '商品開発', '商品マスタ・月間メニュー・仕入先・発注・入荷の管理', col(5)),
  opsRole('ops.delivery', '物流', '集金・委託配送・中継先の管理と出荷・配送の編集', col(6)),
  /* 権限表にない2つ（そのまま残す・2026-10-03） */
  opsRole('ops.viewer', '閲覧のみ', '全画面の閲覧のみ（権限付与・Hubspot/API連携は見られない）',
    grantsOf(Object.fromEntries(Object.keys(OPS_TABLE).filter((k) => k !== 'grant' && k !== 'hubspot').map((k) => [k, 'R' as Level])))),
  opsRole('ops.warehouse', '倉庫スタッフ', '入荷管理（入荷確認・倉庫）だけ', grantsOf({ dashboard: 'R', receiving: 'R/U' })),
];

export const ROLES: Role[] = [
  /* システム管理：全サイトのアカウント・役割・IP・設定 */
  /* 運営Web で使う権限（grants）も持つ：システム管理者＝フル権限と同じ全操作、監査＝全画面の閲覧（台帳 R・受付簿 #418。/ops/login で入る） */
  { id: 'sysadmin.admin', site: 'sysadmin', name: 'システム管理者', note: '全サイトのアカウント発行・停止、役割、IP、メンテナンス、操作の記録', perms: P('accounts:◎ roles:◎ ip:◎ settings:◎ audit:◎'), grants: col(0) },
  { id: 'sysadmin.auditor', site: 'sysadmin', name: '監査（閲覧のみ）', note: 'すべて見るだけ', perms: P('accounts:△ roles:△ ip:△ settings:△ audit:△'), grants: grantsOf(Object.fromEntries(Object.keys(OPS_TABLE).map((k) => [k, 'R' as Level]))) },
  /* 運営Web：運営の権限表（2026-10-03）の7つ＋閲覧のみ・倉庫スタッフ。権限は grants（OPS_TABLE）。ID は通知の宛先（role）にも使うので変えない */
  ...OPS_ROLES,
  /* 法人Web：法人アカウント＝配下の全拠点、拠点アカウント＝自分の拠点だけ（法人情報の変更は法人アカウントだけ） */
  { id: 'corp.corp', site: 'corp', name: '法人アカウント', note: '配下の全拠点。法人情報の変更の申請は法人アカウントだけ', perms: P('home:◎ branches:◎ applications:◎ corpInfo:◎ orders:◎ stock:◎ billing:△') },
  { id: 'corp.branch', site: 'corp', name: '拠点アカウント', note: '自分の拠点だけ', perms: P('home:◎ branches:△ applications:◎ corpInfo:× orders:◎ stock:◎ billing:△') },
  { id: 'carrier.admin', site: 'carrier', name: '委託配送先管理者', note: '自社の区間・ドライバーの割り当て・見積もりの回答・スタッフの管理', perms: P('deliveries:◎ drivers:◎ quotes:◎ coolers:△') },
  { id: 'driver.driver', site: 'driver', name: 'ドライバー', note: '自分に割り当てられた区間の受取・納品・トラブル報告', perms: P('today:◎ history:△ trouble:◎ parking:◎') },
  { id: 'supplier.staff', site: 'supplier', name: '仕入先担当者', note: '発注への回答・本発注の承認・出荷報告', perms: P('orders:◎ profile:◎ notices:△') },
];

const acc = (a: Omit<Account, 'issuedAt' | 'lastLoginAt' | 'email'> & Partial<Account>): Account => ({
  email: '', issuedAt: '2026/04/01 10:00', lastLoginAt: '', ...a,
});

const OPS: Account[] = [
  acc({ id: 'Ad00001', site: 'ops', loginId: 'Ad00001', name: '田中 健一', email: 'k.tanaka@esstation.example.jp', status: '有効', roleIds: ['ops.sales'], scope: { type: 'all' }, lastLoginAt: '2026/10/05 08:55' }),
  acc({ id: 'Ad00002', site: 'ops', loginId: 'Ad00002', name: '佐々木 桜', email: 's.sasaki@esstation.example.jp', status: '有効', roleIds: ['ops.cs'], scope: { type: 'all' }, lastLoginAt: '2026/10/05 09:02' }),
  acc({ id: 'Ad00003', site: 'ops', loginId: 'Ad00003', name: '井上 悠', email: 'y.inoue@esstation.example.jp', status: '有効', roleIds: ['ops.dev'], scope: { type: 'all' }, lastLoginAt: '2026/10/02 17:40' }),
  acc({ id: 'Ad00006', site: 'ops', loginId: 'Ad00006', name: '山田直美', email: 'naomi.y2@example.jp', status: '有効', roleIds: ['ops.master'], scope: { type: 'all' }, lastLoginAt: '2025/12/08 12:36' }),
  acc({ id: 'Ad00007', site: 'ops', loginId: 'Ad00007', name: '山田直美', email: 'naomi.y@example.jp', status: '削除済', roleIds: ['ops.full'], scope: { type: 'all' }, lastLoginAt: '2025/12/08 12:36' }),
  acc({ id: 'Ad00008', site: 'ops', loginId: 'Ad00008', name: '佐藤太郎', email: 'taro.s@example.jp', status: '有効', roleIds: ['ops.full'], scope: { type: 'all' }, lastLoginAt: '2025/12/08 12:36' }),
  acc({ id: 'Ad00009', site: 'ops', loginId: 'Ad00009', name: '鈴木花子', email: 'hanako.s@example.jp', status: '無効', roleIds: ['ops.full'], scope: { type: 'all' }, lastLoginAt: '2025/12/08 12:36' }),
  acc({ id: 'Ad00010', site: 'ops', loginId: 'Ad00010', name: '中村幸子', email: 'sachiko.n@example.jp', status: '有効', roleIds: ['ops.full', 'ops.master', 'ops.sales'], scope: { type: 'all' }, lastLoginAt: '2026/10/05 08:30' }),
  acc({ id: 'Ad00011', site: 'ops', loginId: 'Ad00011', name: '伊藤 美咲', email: 'm.ito@esstation.example.jp', status: '有効', roleIds: ['ops.delivery'], scope: { type: 'all' }, lastLoginAt: '2026/10/05 07:45' }),
  acc({ id: 'Ad00012', site: 'ops', loginId: 'Ad00012', name: '渡辺 剛', email: 't.watanabe@esstation.example.jp', status: '有効', roleIds: ['ops.accounting'], scope: { type: 'all' }, lastLoginAt: '2026/10/01 10:10' }),
  acc({ id: 'Ad00013', site: 'ops', loginId: 'Ad00013', name: '松本 亮', email: 'r.matsumoto@esstation.example.jp', status: '有効', roleIds: ['ops.viewer'], scope: { type: 'all' }, lastLoginAt: '2026/09/30 15:00' }),
  acc({ id: 'Ad00021', site: 'ops', loginId: 'Ad00021', name: '木村 大輔（関東倉庫）', email: 'kanto-wh@esstation.example.jp', status: '有効', roleIds: ['ops.warehouse'], scope: { type: 'warehouse', warehouseId: 'WH00001' }, lastLoginAt: '2026/10/05 06:40' }),
  acc({ id: 'Ad00022', site: 'ops', loginId: 'Ad00022', name: '森田 修（関西倉庫）', email: 'kansai-wh@esstation.example.jp', status: '有効', roleIds: ['ops.warehouse'], scope: { type: 'warehouse', warehouseId: 'WH00002' }, lastLoginAt: '2026/10/05 06:55' }),
];

const SYS: Account[] = [
  acc({ id: 'SY00001', site: 'sysadmin', loginId: 'SY00001', name: 'システム管理者', email: 'sysadmin@esstation.example.jp', status: '有効', roleIds: ['sysadmin.admin'], scope: { type: 'all' }, issuedAt: '2026/01/05 10:00', lastLoginAt: '2026/10/05 08:10' }),
  acc({ id: 'SY00002', site: 'sysadmin', loginId: 'SY00002', name: '監査担当', email: 'audit@esstation.example.jp', status: '有効', roleIds: ['sysadmin.auditor'], scope: { type: 'all' }, issuedAt: '2026/01/05 10:00', lastLoginAt: '2026/09/30 17:00' }),
];

/** 法人アカウント（法人ごと）と拠点アカウント（拠点ごと）。状態は契約から決める */
const LAST: Record<string, string> = {
  CU00001: '2026/10/05 08:40', CU00643: '2026/10/04 17:20', CU00871: '2026/10/05 09:12', CU00950: '2026/10/01 11:40', CU00975: '2026/10/04 10:05',
  CU00902: '2026/09/30 18:05', CU00003: '2026/10/02 09:30', CU00671: '2026/10/01 16:10', CU00961: '2026/09/24 16:20', CU01310: '2026/09/28 15:22', CU00701: '2026/10/02 10:31',
};
const CORP_ACCOUNTS: Account[] = [
  ...CORPS.map((c) => acc({
    id: c.id, site: 'corp', loginId: c.id, name: c.name, email: `corp-${c.id.toLowerCase()}@example.jp`,
    status: c.status === '仮登録' ? '発行済（ログイン前）' : c.status === '休眠' || c.status === '取消' ? '利用停止' : '有効',
    roleIds: ['corp.corp'], scope: { type: 'corp', corpId: c.id }, issuedAt: c.registeredAt, lastLoginAt: LAST[c.id] ?? '',
  })),
  ...BRANCHES.map((b) => {
    const ct = CONTRACTS.find((x) => x.branchId === b.id);
    const status: Account['status'] = !ct || ct.status === '仮登録' ? '発行済（ログイン前）'
      : ct.status === '取消' ? '利用停止' : ct.status === '終了' ? '利用停止' : ct.status === '解約手続き中' ? '参照のみ' : '有効';
    return acc({
      id: b.id, site: 'corp', loginId: b.id, name: b.name, email: `branch-${b.id.toLowerCase()}@example.jp`, status,
      roleIds: ['corp.branch'], scope: { type: 'branch', branchId: b.id }, issuedAt: b.registeredAt, lastLoginAt: LAST[b.id] ?? '',
    });
  }),
];

const CARRIER_ACCOUNTS: Account[] = CARRIERS.filter((c) => c.kind === '委託・引き取り').map((c) => acc({
  id: c.id, site: 'carrier', loginId: c.id, name: c.name, email: `${c.id.toLowerCase()}@carrier.example.jp`, status: '有効',
  roleIds: ['carrier.admin'], scope: { type: 'carrier', carrierId: c.id }, lastLoginAt: c.id === 'DE00001' ? '2026/10/05 06:10' : '2026/10/04 18:00',
}));

const DRIVER_ACCOUNTS: Account[] = DRIVERS.map((d) => acc({
  id: d.id, site: 'driver', loginId: d.id, name: d.name, email: d.email,
  status: d.status === '有効' ? '有効' : d.status === '免許未登録' ? '未発行' : d.status === '無効' ? '無効' : '利用停止',
  roleIds: ['driver.driver'], scope: { type: 'driver', driverId: d.id, carrierId: d.carrierId }, lastLoginAt: d.status === '有効' ? '2026/10/05 06:00' : '',
}));

/** 仕入先（仕入先サイトの見本 mocks/supplier と同じ4社） */
const SUPPLIER_ACCOUNTS: Account[] = [
  ['SP00001', '株式会社サンプル商事', 'n.sato@sample-shoji.example.jp', '2026/10/05 08:12'],
  ['SP00003', '株式会社青空水産', 'd.murakami@aozora-suisan.example.jp', '2026/10/04 18:02'],
  ['SP00005', '株式会社マルシンフーズ', 'm.ogawa@marushin-foods.example.jp', '2026/10/05 07:30'],
  ['SP00009', 'フジ包装株式会社', 'k.fujii@fuji-houso.example.jp', '2026/10/04 16:55'],
].map(([id, name, email, last]) => acc({ id, site: 'supplier', loginId: id, name, email, status: '有効', roleIds: ['supplier.staff'], scope: { type: 'supplier', supplierId: id }, lastLoginAt: last }));

export const ACCOUNTS: Account[] = [...SYS, ...OPS, ...CORP_ACCOUNTS, ...CARRIER_ACCOUNTS, ...DRIVER_ACCOUNTS, ...SUPPLIER_ACCOUNTS];

/** IP ホワイトリスト（GEN_IP と同じ）。どのサイトに効かせるかは仕様に書かれていない（仮：システム管理・運営） */
export const IP_RULES: IpRule[] = [
  ['本社オフィス', '203.0.113.10'], ['大阪営業所', '203.0.113.45'], ['社内VPN（出口）', '198.51.100.20'], ['検証環境', '198.51.100.30'],
  ['委託先A', '198.51.100.68'], ['委託先B', '192.0.2.146'], ['リモート拠点', '192.0.2.77'], ['監視サーバー', '203.0.113.200'], ['バックアップ', '198.51.100.250'],
].map(([note, ip], i) => ({ id: `IP${String(i + 1).padStart(3, '0')}`, cidr: `${ip}/32`, note, sites: ['sysadmin', 'ops'] as Site[], createdAt: '2026/04/01 10:00', createdBy: 'SY00001' }));

/** サイトの設定。ログインの期限は全サイト1日（1440分）・認証コードは4桁・5分（台帳 K・F 2026-10-07） */
export const SITE_SETTINGS: SiteSetting[] = [
  { id: 'sysadmin', name: 'システム管理', baseUrl: '/sysadmin', sessionMinutes: 1440, resetCode: { digits: 4, minutes: 5 }, maintenance: { on: false, message: '' } },
  { id: 'ops', name: '運営Web', baseUrl: '/ops', sessionMinutes: 1440, resetCode: { digits: 4, minutes: 5 }, maintenance: { on: false, message: '' } },
  { id: 'corp', name: '法人Web', baseUrl: '/corp', sessionMinutes: 1440, resetCode: { digits: 4, minutes: 5 }, maintenance: { on: false, message: '' } },
  { id: 'carrier', name: '委託配送先Web', baseUrl: '/carrier', sessionMinutes: 1440, resetCode: { digits: 4, minutes: 5 }, maintenance: { on: false, message: '' } },
  { id: 'driver', name: 'ドライバー', baseUrl: '/driver', sessionMinutes: 1440, resetCode: { digits: 4, minutes: 5 }, maintenance: { on: false, message: '' } },
  { id: 'supplier', name: '仕入先サイト', baseUrl: '/supplier', sessionMinutes: 1440, resetCode: { digits: 4, minutes: 5 },
    maintenance: { on: false, message: '10月5日（月）23:00〜翌6日（火）2:00 はメンテナンスのためご利用いただけません' } },
];

export const AUDIT: AuditLog[] = [
  { id: 'AU-0001', at: '2026/09/30 16:30', accountId: 'SY00001', site: 'sysadmin', action: 'アカウント発行', target: 'CU01012', detail: '拠点アカウント（仮登録）を発行' },
  { id: 'AU-0002', at: '2026/10/01 09:00', accountId: 'SY00001', site: 'sysadmin', action: '役割の変更', target: 'Ad00010', detail: 'フル権限・マスタ管理者・営業担当' },
  { id: 'AU-0003', at: '2026/10/02 11:20', accountId: 'SY00001', site: 'sysadmin', action: 'アカウント停止', target: 'DR00005', detail: '利用停止（退職予定）' },
  { id: 'AU-0004', at: '2026/10/04 18:00', accountId: 'DE00001', site: 'carrier', action: 'ドライバー割り当て', target: 'DE00001', detail: '10月サイクル前半の区間に 斉藤 健太・山口 健' },
  /* 保冷バッグ台帳の変更履歴（target＝coolers:CB-####。運営の詳細の「変更履歴」タブ） */
  { id: 'AU-0005', at: '2026/04/01 10:00', accountId: 'Ad00011', site: 'ops', action: '登録', target: 'coolers:CB-0001', detail: '保冷バッグ 2・渡した日 2026/04/01' },
  { id: 'AU-0006', at: '2026/04/01 10:05', accountId: 'Ad00011', site: 'ops', action: '登録', target: 'coolers:CB-0002', detail: '保冷剤 10・渡した日 2026/04/01' },
  { id: 'AU-0007', at: '2026/08/20 15:30', accountId: 'Ad00011', site: 'ops', action: '編集', target: 'coolers:CB-0002', detail: '返却日：— → 2026/08/20／返却数：— → 2／メモ：— → 一部返却（傷み）' },
  { id: 'AU-0008', at: '2026/05/12 09:40', accountId: 'Ad00011', site: 'ops', action: '登録', target: 'coolers:CB-0003', detail: '保冷バッグ 1・渡した日 2026/05/12' },
  { id: 'AU-0009', at: '2026/09/18 11:00', accountId: 'Ad00010', site: 'ops', action: '状態の変更', target: 'coolers:CB-0003', detail: '状態：貸与中 → 紛失／メモ：— → 2026/09 紛失の連絡。新しい CB-0007 を渡した' },
  { id: 'AU-0010', at: '2026/06/01 10:00', accountId: 'Ad00011', site: 'ops', action: '登録', target: 'coolers:CB-0009', detail: '保冷剤 6・渡した日 2026/06/01' },
  { id: 'AU-0011', at: '2026/09/30 17:10', accountId: 'Ad00010', site: 'ops', action: '編集', target: 'coolers:CB-0009', detail: 'メモ：— → 夏の増量分。9月に半分返却／返却日：— → 2026/09/30／返却数：— → 3' },
];

/** ログインの記録：各アカウントの最後のログイン（成功）＋失敗の見本 */
export const LOGIN_HISTORY: LoginRecord[] = [
  ...ACCOUNTS.filter((a) => a.lastLoginAt).map((a, i) => ({
    id: `LG-${String(i + 1).padStart(5, '0')}`, at: a.lastLoginAt, site: a.site, loginId: a.loginId, accountId: a.id,
    ip: a.site === 'ops' || a.site === 'sysadmin' ? '203.0.113.10' : `198.51.100.${10 + (i % 200)}`, result: 'success' as const, reason: '',
  })),
  ...([
  { id: 'LG-90001', at: '2026/10/05 09:05', site: 'corp', loginId: 'cu00871', accountId: 'CU00871', ip: '198.51.100.87', result: 'fail', reason: 'パスワードが違う' },
  { id: 'LG-90002', at: '2026/10/05 09:06', site: 'corp', loginId: 'cu00871', accountId: 'CU00871', ip: '198.51.100.87', result: 'fail', reason: 'パスワードが違う' },
  { id: 'LG-90003', at: '2026/10/03 06:10', site: 'driver', loginId: 'DR00005', accountId: 'DR00005', ip: '198.51.100.5', result: 'blocked', reason: '利用停止のアカウント' },
  { id: 'LG-90004', at: '2026/10/04 22:15', site: 'ops', loginId: 'Ad00099', accountId: '', ip: '192.0.2.200', result: 'blocked', reason: 'IP ホワイトリストにない' },
  ] as LoginRecord[]),
].sort((x, y) => x.at.localeCompare(y.at));

/** アプリのバージョン（運営の GEN_VERSION の新しいものから） */
export const APP_VERSIONS: AppVersion[] = [
  { id: 'iOS-2.1.0', os: 'iOS', version: '2.1.0', force: true, note: '最新バージョン アップデート', updatedAt: '2025/12/08 12:36' },
  { id: 'Android-2.0.1', os: 'Android', version: '2.0.1', force: false, note: '最新バージョン アップデート', updatedAt: '2025/12/08 12:36' },
  { id: 'Android-1.8.2', os: 'Android', version: '1.8.2', force: true, note: '最新バージョン アップデート', updatedAt: '2025/10/08 12:36' },
  { id: 'iOS-1.8.2', os: 'iOS', version: '1.8.2', force: true, note: '最新バージョン アップデート', updatedAt: '2025/09/08 12:36' },
];
