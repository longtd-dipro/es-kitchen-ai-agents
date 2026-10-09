/*
 * 申込フォームのマスタ（元の 21_法人_申込フォーム.html の値そのまま）。
 * プラン表（PLAN_TBL）・機種（MODELS）・オプション（OPT_MASTER）・郵便番号の見本（ZIPS）・デモデータ（SAMPLE_M／SAMPLE_T）。
 */
import { publicPricesOf, yenOf } from '@/lib/domain/snapshot';
import type { ApplyBranch, ApplyCorp, ApplyKind } from './types';
import type { FormMaster } from '@/lib/domain/formMaster';
import { CHARGE_IDS } from '@/lib/domain/charges';
import { yen } from '@/lib/format/money';

/* RV-CORP-20261002 C-i：47都道府県（入力チェック仕様 3-1） */
export const PREF = ['北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県', '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県', '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県', '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'];

/** 担当者テーブルの区分（項目一覧「担当者（テーブル）」に合わせる） */
export const STAFF_KINDS = ['メイン担当者', '請求担当者', 'サブ担当者'];

/** 住所検索の見本（本番は郵便番号APIを呼ぶ。建物等は埋めない） */
export const ZIPS: Record<string, { pref: string; city: string; addr1: string }> = {
  '1000005': { pref: '東京都', city: '千代田区', addr1: '丸の内1-9-2' },
  '1080075': { pref: '東京都', city: '港区', addr1: '港南2-16-1' },
  '5410041': { pref: '大阪府', city: '大阪市中央区', addr1: '北浜2-6-18' },
  '8120011': { pref: '福岡県', city: '福岡市博多区', addr1: '博多駅前3-25-21' },
  '4600008': { pref: '愛知県', city: '名古屋市中区', addr1: '栄3-15-33' },
  '6048005': { pref: '京都府', city: '京都市中京区', addr1: '中京区河原町通三条上る恵比須町' },
  '2200012': { pref: '神奈川県', city: '横浜市西区', addr1: 'みなとみらい2-2-1' },
};

/* ---------- プランと料金（デモ用の仮単価・税抜） ---------- */
export const MEALS = ['50', '100', '150'];
export const COURSES = ['ライト', 'スタンダード'];

export type Plan = {
  /** fee＝価格（ES配送便）・feeCool＝価格（COOL便）。公開用の価格世代の価格（台帳 E 2026-10-05） */
  id: string; name: string; fee: number; feeCool: number; people: string; monthly: number; chill: number; frz: number; dstd: number; dfz: number;
  /** 標準貸出設備（載っている機種・台数が無料・28-182） */
  std: [string, number][];
  /** 標準貸出設備のうち資材ボックス（プランマスタ・28-160。自販機のときの標準にも使う） */
  box: [string, number][];
  /** ESライト（自販機）の価格（ES配送便）と初期料金（28-184・28-186）。null＝このプランでは自販機を選べない */
  /** 自販機：fee＝ESライト（自販機）のプラン料金（リース料を含めない）・init＝初期料金・lease＝自販機月額料金（1台・機種マスタ）・units＝標準の台数 */
  vm: { fee: number; init: number; lease: number; units: number } | null;
};
/*
 * プラン表（PLAN_TBL）は共通データのプランマスタから作る（2026/10/03：コピーを持たない。setApplyMaster）。
 *   fee … 公開中の価格（プランマスタのコースの月額）／people … 利用人数目安／monthly … 月次提供上限の合計（プラン名の数字そのもの）
 *   chill・frz … 冷蔵・常温／冷凍の月次提供数上限／dstd・dfz … 標準の配送回数（冷蔵・冷凍）／std … 標準貸出設備（載っている機種・台数が無料・28-182）
 *   キーは '<食数>|<ライト／スタンダード>'。申込のコースは ライト＝ESライト（冷蔵庫）・スタンダード＝ESスタンダード
 */
export const PLAN_TBL: Record<string, Plan> = {};
const COURSE_OF: Record<string, string> = { ライト: 'ESライト（冷蔵庫）', スタンダード: 'ESスタンダード' };
const LIGHT_VM = 'ESライト（自販機）';

/** 設備タイプ（拠点ごと）。機種マスタの機種区分に呼び方を揃える */
export const DEV_TYPES = [
  { v: 'rf' as const, t: '冷蔵庫・冷凍庫', sub: '標準の設備です' },
  { v: 'vm' as const, t: '自動販売機', sub: 'ESライト（自販機）の料金・現場調査のうえ設置' },
];

/**
 * 機種（共通データの機種マスタから作る）。
 * 機種ID … RF＝冷蔵庫／FZ＝冷凍庫／VM＝自販機／MW＝電子レンジ／BX＝資材ボックス
 * fee … 月額料金（税抜き）。null＝別途見積。0＝無料／cap … 最大収納数／term … 最低利用期間（ヶ月）。null＝期間なし
 * pub … 公開ステータス（申込・変更に出すのは「公開」だけ）／max … 申込での最大台数
 */
export type Model = { k: string; code: string; grp: string; label: string; spec: string; unit?: string; cap: number; fee: number | null; term: number | null; pub: boolean; max: number };
/*
 * 機種の名前・月額・最低利用期間・公開は共通データの機種マスタから作る（2026/10/03：コピーを持たない。setApplyMaster）。
 * ここに持つのは 申込の画面の見せ方（キー・区分・寸法の説明・最大収納数・申込での最大台数）だけ。最大収納数（cap）は 48L＝50 のほかは仮置き
 */
const MODEL_META: { k: string; code: string; grp: string; spec: string; unit?: string; cap: number; max: number }[] = [
  { k: 'rf_s', code: 'RF000001', grp: 'rf', spec: '寸法は機種マスタ（暫定）', cap: 50, max: 3 },
  { k: 'rf_m', code: 'RF000002', grp: 'rf', spec: '寸法は機種マスタ（暫定）', cap: 90, max: 3 },
  { k: 'rf_105', code: 'RF000003', grp: 'rf', spec: '寸法は機種マスタ（暫定）', cap: 115, max: 3 },
  { k: 'rf_l', code: 'RF000004', grp: 'rf', spec: '寸法は機種マスタ（暫定）', cap: 155, max: 3 },
  { k: 'fz_s', code: 'FZ000001', grp: 'fz', spec: '冷凍庫の仕様は準備中です', cap: 40, max: 2 },
  { k: 'vend', code: 'VM000001', grp: 'vm', spec: '6段×10列／キャッシュレス対応', cap: 468, max: 1 },
  { k: 'mw', code: 'MW000001', grp: 'mw', spec: '寸法・容量は機種マスタ（暫定）', cap: 0, max: 2 },
  { k: 'bx1', code: 'BX000001', grp: 'bx', spec: 'W260×D370×H170mm・重ね置きできる', unit: '個', cap: 0, max: 9 },
  { k: 'bx2', code: 'BX000002', grp: 'bx', spec: 'W260×D370×H170mm・重ね置きできる', unit: '個', cap: 0, max: 9 },
  { k: 'box', code: 'BX000003', grp: 'bx', spec: 'W260×D370×H170mm・床に直置きしない', unit: '個', cap: 0, max: 9 },
  { k: 'bx4', code: 'BX000004', grp: 'bx', spec: 'W600×D400×H860mm', unit: '個', cap: 0, max: 2 },
  { k: 'bx5', code: 'BX000005', grp: 'bx', spec: '—', unit: '個', cap: 0, max: 9 },
];
export const MODELS: Model[] = [];
export const MODEL: Record<string, Model> = {};

/** 追加でご希望の設備は種類ごとにまとめる */
export const EQ_GRP = [
  { g: 'rf', t: '冷蔵ショーケース' },
  { g: 'fz', t: '冷凍ストッカー' },
  { g: 'vm', t: '自動販売機' },
  { g: 'mw', t: '電子レンジ' },
  { g: 'bx', t: '資材ボックス' },
];

/**
 * オプションマスタのうち「法人Webの申込に出す」かつ使用中だけ（2026/09/29 hong）。名前・金額・料金種別はマスタのとおり。
 * A型（ES-QR 利用料など）は、選ぶと拠点の連動する項目（ES-QR＝利用する）になる
 */
/* 共通データのオプションマスタから作る（2026/10/03：コピー・見本の seed を持たない。setApplyMaster）。申込に出す＝法人が申込で選ぶ（auto＝apply）と ES-QR（A型） */
const OPT_ORDER: Record<string, number> = { OP000002: 20, OP000014: 45, OP000017: 85 };
const LINK_ITEM: Record<string, string> = { esqr: 'ES-QR', guestMode: 'ゲストモード', userCash: 'ユーザー現金利用' };
export type OptRow = { id: string; name: string; kind: string; ftype: string; fee: number | null; amt: string; a: boolean; link_item: string; order: number };
export const OPT_MASTER: OptRow[] = [];
/** その他オプション（自販機専用は名前に「自販機」を含むもの） */
export const SVC_OPT: { k: string; code: string; label: string; fee: number | null; once: boolean; a: boolean; link: string; dev: string[] }[] = [];
/** 配送回数追加（OP000001・A型）。プラン標準を超えた回数 × この金額が月額に立つ（28-85）。名前・金額はオプションマスタ */
export const DLV_ADD = { id: CHARGE_IDS['item.deliveryOver'] as string, name: 'お届け回数追加', fee: 0 };

/* STEP1_20261001 C1：お試し割引はプランマスタの「50プラン・冷蔵庫・ライト」の月額。適用先の月額合計が上限・1回だけ（setApplyMaster で入れる） */
export let CAMPAIGN_DISCOUNT = 0;

/**
 * 申込フォームのマスタ（プラン表・機種・オプション・配送回数追加・お試し割引の上限）を、共通データのマスタから入れ替える。
 * 申込フォームを開くとき（サーバーの applyMaster）と、マスタを直したとき（読み直し）に呼ぶ。配列・表は中身を入れ替えるので、import した側にも反映される
 */
export function setApplyMaster(m: FormMaster) {
  /* 機種 */
  MODELS.splice(0, MODELS.length, ...MODEL_META.flatMap((x): Model[] => {
    const dm = m.models.find((y) => y.id === x.code);
    return dm ? [{ ...x, label: dm.name, fee: dm.monthlyYen, term: dm.minMonths || null, pub: dm.public }] : [];
  }));
  for (const k of Object.keys(MODEL)) delete MODEL[k];
  for (const x of MODELS) MODEL[x.k] = x;
  const keyOf = (id: string) => MODELS.find((x) => x.code === id)?.k;
  /* 自販機の初期料金（プランの標準の自販機の機種マスタ・なければ OP000008） */
  const op8 = m.options.find((o) => o.id === CHARGE_IDS['event.contractInit'])?.amountYen ?? 0;
  const op37 = m.options.find((o) => o.id === CHARGE_IDS['contract.vmLease'])?.amountYen ?? 0;
  const vmStdOf = (p: (typeof m.plans)[number]) => (p.stdEquipment ?? []).filter((x) => x.course === LIGHT_VM)
    .map((x) => ({ qty: x.qty, md: m.models.find((y) => y.id === x.modelId) })).filter((x) => x.md?.category === '自販機');
  const vmInitOf = (p: (typeof m.plans)[number]) => vmStdOf(p)[0]?.md?.initFeeYen ?? op8;
  /* 自販機月額料金（OP000037 自販機リース）：機種マスタの月額 × 台数（台帳「自販機のリース料」2026/10/03） */
  const vmLeaseOf = (p: (typeof m.plans)[number]) => ({ lease: vmStdOf(p)[0]?.md?.monthlyYen ?? op37, units: vmStdOf(p).reduce((a, x) => a + x.qty, 0) || 1 });
  /* プラン表 */
  for (const k of Object.keys(PLAN_TBL)) delete PLAN_TBL[k];
  for (const p of m.plans) {
    for (const [label, course] of Object.entries(COURSE_OF)) {
      /* 法人Web に出すのは公開用の世代の価格（COOL便／ES配送便の2つ。台帳 E 2026-10-05） */
      const pp = publicPricesOf(p), pr = pp.find((x) => x.course === course);
      if (!pr) continue;
      const price = yenOf(pr, 'ES配送便');
      const lim = (temp: '冷蔵' | '冷凍') => p.limits?.find((x) => x.course === course && x.temp === temp);
      const vm = label === 'ライト' ? pp.find((x) => x.course === LIGHT_VM) : undefined;
      const stdOf = (c: string): [string, number][] => (p.stdEquipment ?? []).filter((x) => x.course === c).flatMap((x): [string, number][] => { const k = keyOf(x.modelId); return k ? [[k, x.qty]] : []; });
      PLAN_TBL[`${p.monthlyMeals}|${label}`] = {
        id: p.id, name: `${p.name}（ES${label}）`, fee: price, feeCool: yenOf(pr, 'COOL便'), people: p.peopleText ?? '', monthly: p.monthlyMeals,
        chill: lim('冷蔵')?.meals ?? 0, frz: lim('冷凍')?.meals ?? 0, dstd: lim('冷蔵')?.deliveries ?? 1, dfz: lim('冷凍')?.deliveries ?? 0,
        /* 標準貸出設備はプランマスタのとおり（資材ボックスも・28-160。ES250・ES600 以上はマスタに行がなく運営が手で入れる） */
        std: stdOf(course),
        box: stdOf(vm ? LIGHT_VM : course).filter(([k]) => MODEL[k]?.grp === 'bx'),
        /* 初期料金＝プランの標準の自販機の機種マスタの初期料金、なければ OP000008 の金額（台帳「自販機の初期費用」2026/10/03） */
        vm: vm ? { fee: yenOf(vm, 'ES配送便'), init: vmInitOf(p), ...vmLeaseOf(p) } : null,
      };
    }
  }
  /* オプション */
  const opts = m.options.filter((o) => o.status === '使用中' && o.auto === 'apply' && o.id !== CHARGE_IDS['item.esqr']).map((o): OptRow => {
    const fee = !o.amountKind || o.amountKind === '固定' ? o.amountYen : null;
    return { id: o.id, name: o.mgmtName || o.name, kind: o.category, ftype: o.feeType, fee, amt: fee === null ? '別途見積' : yen(fee), a: o.linkType === 'A', link_item: o.linkedItem ? LINK_ITEM[o.linkedItem] ?? '' : '', order: OPT_ORDER[o.id] ?? 50 };
  }).sort((a, b) => a.order - b.order);
  OPT_MASTER.splice(0, OPT_MASTER.length, ...opts);
  SVC_OPT.splice(0, SVC_OPT.length, ...opts.map((o) => ({
    k: o.id, code: o.id, label: o.name, fee: o.fee, once: o.ftype === '単発料金', a: !!o.a, link: o.link_item || '',
    dev: /自販機/.test(o.name) ? ['vm'] : ['rf', 'vm'],
  })));
  const dlv = m.options.find((o) => o.id === CHARGE_IDS['item.deliveryOver']);
  DLV_ADD.name = dlv?.name ?? 'お届け回数追加'; DLV_ADD.fee = dlv?.amountYen ?? 0;
  /* お試し割引の上限＝値引き DC000013 が参照するプラン・コースの月額（なければ 50プラン・ESライト） */
  const dc = m.discounts.find((d) => d.id === CHARGE_IDS['event.trialChild']);
  const refP = publicPricesOf(m.plans.find((p) => p.id === dc?.refPlanId)).find((x) => x.course === (dc?.refCourse ?? 'ESライト（冷蔵庫）'));
  const ref = refP ? yenOf(refP, 'ES配送便') : undefined;
  CAMPAIGN_DISCOUNT = ref ?? PLAN_TBL['50|ライト']?.fee ?? 0;
}

export const EMP_RANGE = ['〜30名', '31〜50名', '51〜100名', '101〜200名', '201〜300名', '301名〜'];
export const NG_DAYS = ['月', '火', '水', '木', '金', '土', '日', '祝日'];
export const PAY_METHODS = ['クレジット決済', '口座振替', 'お振込'];
/** 支払サイクル・請求書の発行時期（項目一覧：支払サイクル／請求書を発行する時期 −3〜+1・既定 −1） */
export const PAY_CYCLE = ['月払い', '年払い'];
export const BILL_LEAD = ['ご利用月の1ヶ月前（標準）', 'ご利用月の2ヶ月前', 'ご利用月の3ヶ月前', 'ご利用月の当月', 'ご利用月の翌月'];

/** 1契約あたりに並べる未入力のボタンの数。あふれた分は「ほか N件」 */
export const ERR_MAX = 8;

/** 添付のデモ（「ファイル選択」で順に足す名前） */
export const DEMO_FILES = { names: ['搬入経路_正面入口.jpg', '搬入経路_エレベーター.pdf', '設置場所_写真.jpg', 'ビル管理規約.pdf'], sizes: ['1.2MB', '3.4MB', '2.1MB', '0.8MB'] };

/* デモデータ（本番にはない。フォームの「デモデータを入力」で流し込む） */
type Sample = { corp: ApplyCorp; branches: Omit<ApplyBranch, '_o'>[] };
export const SAMPLE: Record<ApplyKind, Sample> = {
  main: {
    corp: {
      name: '株式会社サンプルフーズ', kana: 'カブシキガイシャサンプルフーズ', billname: '株式会社サンプルフーズ',
      zip: '100-0005', pref: '東京都', city: '千代田区', addr1: '丸の内1-9-2',
      addr2: 'サンプルビル 5F', tel: '03-9876-5432', fax: '03-9876-5433',
      pay: '口座振替',
      _st: [
        { kind: 'メイン担当者', name: '佐藤 康介', kana: 'サトウ コウスケ', mail: 'k-sato@samplefoods.co.jp', tel: '090-1234-5678' },
        { kind: '請求担当者', name: '高橋 由紀', kana: 'タカハシ ユキ', mail: 'takahashi@samplefoods.co.jp', tel: '03-9876-5432' },
      ],
    },
    branches: [
      {
        dev: 'rf', meals: '100', course: 'スタンダード', ship: 'ES配送便', start: '2026-11', note: '',
        name: '東京本社', kana: 'トウキョウホンシャ', zip: '100-0001', pref: '東京都', city: '千代田区',
        addr1: '丸の内1-1-1', addr2: '3F 休憩室・パントリー', tel: '03-9876-5432', fax: '',
        emp: '101〜200名', bill: '法人に請求', pay: '', ngmove: '前倒す',
        _eq: { mw: 1 }, _so: {}, _ng: { '土': 1, '日': 1, '祝日': 1 },
        _files: [{ n: '東京本社_正面入口_周辺図.jpg', s: '1.2MB' }, { n: '東京本社_エレベーター仕様.pdf', s: '3.4MB' }],
        _same: false,
        _st: [{ kind: 'メイン担当者', name: '高橋 由紀', kana: 'タカハシ ユキ', mail: 'takahashi@samplefoods.co.jp', tel: '03-9876-5432' }],
      },
      {
        dev: 'rf', meals: '50', course: 'ライト', ship: 'COOL便', start: '2026-11', note: 'ビル専用裏口荷物搬入口から搬入',
        name: '大阪支店', kana: 'オオサカシテン', zip: '530-0001', pref: '大阪府', city: '大阪市北区',
        addr1: '梅田2-5-10', addr2: '5F 社員ラウンジエリア', tel: '06-6600-2200', fax: '',
        emp: '51〜100名', bill: '法人に請求', pay: '', ngmove: '前倒す',
        _eq: { mw: 1 }, _so: {}, _ng: { '土': 1, '日': 1, '祝日': 1 },
        _files: [{ n: '大阪支店_搬入エレベーター写真.jpg', s: '3.1MB' }],
        _same: false,
        _st: [{ kind: 'メイン担当者', name: '中村 里奈', kana: 'ナカムラ リナ', mail: 'nakamura@samplefoods.co.jp', tel: '06-6600-2201' }],
      },
      {
        dev: 'vm', meals: '100', course: 'スタンダード', ship: 'ES配送便', start: '2026-11',
        floor: '2F 給湯室・リフレッシュスペース', note: '正面入口より手押しカートで搬入',
        name: '福岡営業所', kana: 'フクオカエイギョウショ', zip: '812-0011', pref: '福岡県', city: '福岡市博多区',
        addr1: '博多駅前3-2-1', addr2: '2F', tel: '092-400-3300', fax: '',
        emp: '31〜50名', bill: 'この拠点に請求', pay: 'お振込', ngmove: '後倒す',
        _eq: { mw: 1 }, _so: { OP000017: true }, _ng: { '土': 1, '日': 1, '祝日': 1 },
        _files: [], _same: true, _st: [],
      },
    ],
  },
  trial: {
    corp: {
      name: '株式会社みらい商事', kana: 'カブシキガイシャミライショウジ', billname: '株式会社みらい商事',
      zip: '460-0008', pref: '愛知県', city: '名古屋市中区', addr1: '栄3-15-33',
      addr2: 'みらいビル 6F', tel: '052-200-7700', fax: '', pay: 'お振込',
      _st: [
        { kind: 'メイン担当者', name: '鈴木 花子', kana: 'スズキ ハナコ', mail: 'suzuki@mirai-sample.co.jp', tel: '052-200-7700' },
        { kind: '請求担当者', name: '鈴木 花子', kana: 'スズキ ハナコ', mail: 'suzuki@mirai-sample.co.jp', tel: '052-200-7700' },
      ],
    },
    branches: [
      {
        dev: 'rf', meals: '50', course: 'ライト', ship: 'COOL便', start: '', note: 'まずは1ヶ月お試しさせてください。',
        name: '名古屋本社', kana: 'ナゴヤホンシャ', zip: '460-0008', pref: '愛知県', city: '名古屋市中区',
        addr1: '栄3-15-33', addr2: 'みらいビル 6F', tel: '052-200-7700', fax: '',
        emp: '51〜100名', bill: '法人に請求', pay: '', ngmove: '前倒す',
        _eq: {}, _so: {}, _ng: { '土': 1, '日': 1 },
        _files: [], _same: true, _st: [],
      },
      {
        dev: 'rf', meals: '50', course: 'ライト', ship: 'COOL便', start: '', note: '',
        name: '京都支店', kana: 'キョウトシテン', zip: '604-8005', pref: '京都府', city: '京都市中京区',
        addr1: '中京区河原町通三条上る恵比須町', addr2: '4F', tel: '075-360-1122', fax: '',
        emp: '31〜50名', bill: '法人に請求', pay: '', ngmove: '前倒す',
        _eq: {}, _so: {}, _ng: { '土': 1, '日': 1 },
        _files: [], _same: true, _st: [],
      },
    ],
  },
};

/**
 * キックオフ面談の予約URL（申込の完了画面・受付メール M1。お申し込みの全員に案内する：台帳 2026/10/03）。
 * リンクは変わることがあるので環境変数 NEXT_PUBLIC_KICKOFF_URL で設定する（.env.*）。なければ下の既定値
 */
export { KICKOFF_URL } from '@/lib/domain/urls';
/** 自販機の見積の注記（台帳「申込フォームの自販機の見積」2026/10/03：計算できる金額は目安として出し、必ずこの注記を付ける） */
export const VM_ESTIMATE_NOTE = '※自販機の金額は目安です。現場調査のあと、正式なお見積りをお送りします。';
/**
 * 規約の URL（申込の同意欄。お試しは3つとも：台帳 2026/10/03）。環境変数で設定する。まだ無いものは空（リンクにしない）。
 * キャンペーン規約の文面は客先から（受付簿 No.23）
 */
export const TERMS_URL = { terms: process.env.NEXT_PUBLIC_TERMS_URL || '', privacy: process.env.NEXT_PUBLIC_PRIVACY_URL || '', campaign: process.env.NEXT_PUBLIC_CAMPAIGN_TERMS_URL || '' };
