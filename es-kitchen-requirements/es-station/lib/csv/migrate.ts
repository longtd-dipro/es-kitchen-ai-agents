import { ApiError } from '@/lib/api/errors';
import type { CsvEntity, RowError, RowResult } from '@/lib/domain/csv';
import { overlayRepo, rowResult } from '@/lib/domain/csv';
import {
  isMail, MigIndex, MIGRATE_LEAD, migrateContacts, migrateLoan, migratePrice, migrateSite, parseWindows, PHASE1_ID, type ContactIn, type CorpIn, type SiteIn,
} from '@/lib/domain/migrate';
import { PAUSE_OPEN, type Account, type Billing, type Branch, type ChildContract, type Contact, type Discount, type Option } from '@/lib/domain/types';
import { matchHeader, parseCell, type CsvColSpec, type CsvLine } from './core';

/*
 * 既存のお客様の移行 CSV（受付簿 No.28・移行CSV_列の案_20261003.md）。出力はなし（取込だけ）。キー＝フェーズ1の ID。取込は2段階（検証→登録）で、
 *   A migrationSites    法人・拠点・契約（1行＝1拠点）。法人の列は同じ法人の行で同じ値
 *   B migrationLoans    設備（貸出）（1行＝1拠点 × 1機種）
 *   C migrationContacts 担当者（1行＝1人。法人・拠点ごとにファイルの中身で置き換え）
 *   D migrationPrices   企業独自価格（1行＝1拠点 × 1商品）
 * 切替のサイクル月（A の子契約を作り始める月）は取込の画面で1回だけ選ぶ（scope.target）。書き込みは lib/domain/migrate.ts（共通データ）。
 */

type Col = CsvColSpec & { k: string; req?: boolean };
const YN = ['1', '0'];
const PAY = ['口座振替', '銀行振込', 'クレジットカード'];
const DEBIT = ['未手続き', '手続き中', '完了'];
const CYCLE = ['月払い', '年払い'];
const UNIT = ['まとめて発行（法人1通）', '拠点ごと発行'];
const BILL_TO = ['法人', 'この拠点'];
const DAYS = ['月', '火', '水', '木', '金', '土', '日', '祝日'];
const COURSES = ['ESライト', 'ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'];
/** フェーズ1の状態（法人だけにある・hong 2026-10-05）。休止中・解約済・削除済は ログイン不可・注文不可 */
const P1_LABEL = '法人ステータス（フェーズ1）';
const P1_STATUS = ['本登録', '仮登録', '休止中', '解約済', '削除済'];
const P1_SKIP = ['解約済', '削除済'];
const CONTACT_KINDS = ['メイン担当者', '請求担当者', 'サブ担当者'] as const;

/** A の列（移行CSV_列の案 A-1〜A-5 の順）。req＝見出しに必須の列（必須の列は見出しに【】を付けない） */
const A_COLS: Col[] = [
  { label: '法人ID', k: 'corpId', hint: 'フェーズ1の ID（CU＋5桁）。法人なしの拠点は空', max: 7 },
  { label: '拠点ID', k: 'branchId', req: true, max: 7 },
  { label: '法人名', k: 'cname', max: 60, hint: '法人ありのとき必須' },
  { label: '法人名フリガナ', k: 'ckana', max: 60 },
  { label: '契約名義', k: 'cctn', max: 60, hint: '空欄＝法人名' },
  { label: '請求先法人名', k: 'cbill', max: 60 },
  { label: '法人の郵便番号', k: 'czip', max: 8, hint: '法人ありのとき必須' },
  { label: '法人の都道府県', k: 'cpref', max: 10, hint: '法人ありのとき必須' },
  { label: '法人の市区町村・番地', k: 'ccity', max: 100, hint: '法人ありのとき必須' },
  { label: '法人の建物', k: 'cbld', max: 100 },
  { label: '法人の電話番号', k: 'ctel', max: 20 },
  { label: '法人のFAX番号', k: 'cfax', max: 20 },
  { label: 'ES営業担当', k: 'es', max: 7, hint: '運営アカウント（Ad＋5桁）' },
  { label: '代理店ID', k: 'agency', max: 7, hint: 'AG＋5桁' },
  { label: '法人の支払い方法', k: 'cpay', opts: PAY },
  { label: '口座振替の手続き状況', k: 'cdebit', opts: DEBIT },
  { label: '法人の支払サイクル', k: 'ccycle', opts: CYCLE },
  { label: '請求書の発行時期', k: 'clead', opts: Object.keys(MIGRATE_LEAD) },
  { label: '請求書の発行単位', k: 'cunit', opts: UNIT },
  { label: 'BillOne 支払者ID', k: 'cbo', max: 40 },
  { label: 'ご注文のリマインド', k: 'cremind', type: 'bool', hint: '1／0（空欄＝送る）' },
  { label: P1_LABEL, k: 'p1status', opts: P1_STATUS, hint: '空欄＝本登録。解約済・削除済の行は取り込みません' },
  { label: '拠点名', k: 'name', req: true, max: 60 },
  { label: '拠点名フリガナ', k: 'kana', max: 60 },
  { label: '拠点の郵便番号', k: 'zip', req: true, max: 8 },
  { label: '拠点の都道府県', k: 'pref', req: true, max: 10 },
  { label: '拠点の市区町村・番地', k: 'city', req: true, max: 100 },
  { label: '拠点の建物', k: 'bld', max: 100 },
  { label: '拠点の電話番号', k: 'tel', max: 20 },
  { label: '拠点のFAX番号', k: 'fax', max: 20 },
  { label: '設置フロア', k: 'floor', max: 60 },
  { label: '従業員数概算', k: 'emp', type: 'int', min: 0, maxNum: 99999 },
  { label: '受取できる時間帯', k: 'win', max: 100, hint: '9:00-12:00;13:00-17:00' },
  { label: '設置場所・納品の条件', k: 'dnote', max: 500 },
  { label: '棚卸なし', alias: ['在庫点検なし'], k: 'nocheck', type: 'bool', hint: '1／0（空欄＝棚卸あり）' },
  { label: '拠点メモ', k: 'memo', max: 500 },
  { label: '契約区分', k: 'kind', opts: ['本導入', 'お試し'], hint: '空欄＝本導入' },
  { label: 'お試しの終了月', k: 'trialEnd', type: 'ym', hint: 'お試しのとき必須（yyyy-mm）' },
  { label: '当初契約開始年月', k: 'startYm', type: 'ym', hint: 'yyyy-mm。空欄＝推定（要補完）' },
  { label: '請求先', k: 'billTo', req: true, opts: BILL_TO },
  { label: '拠点の支払い方法', k: 'bpay', opts: PAY, hint: '請求先＝この拠点のとき' },
  { label: '拠点の支払サイクル', k: 'bcycle', opts: CYCLE, hint: '請求先＝この拠点のとき' },
  { label: '拠点の請求書の発行時期', k: 'blead', opts: Object.keys(MIGRATE_LEAD), hint: '請求先＝この拠点のとき' },
  { label: 'プランID', k: 'plan', req: true, max: 8 },
  { label: 'コース', k: 'course', opts: COURSES, hint: '空欄＝ESライト（自販機の貸出があれば自販機）' },
  { label: '適用中の価格世代', k: 'gen', max: 60, hint: '改訂第三回目など。空欄＝いまの世代' },
  { label: '価格', k: 'priceMode', opts: ['通常価格', '企業独自価格'], hint: '空欄＝通常価格' },
  { label: '精算', k: 'settle', opts: ['従量', '買取'], hint: '空欄＝従量（企業独自価格は買取）' },
  { label: 'オプション', k: 'options', max: 300, hint: 'オプションIDを ; でつなぐ' },
  { label: 'オプション金額の上書き', k: 'amounts', max: 300, hint: 'OP000004=0;OP000037=8000' },
  { label: '値引き', k: 'discounts', max: 300, hint: '値引きIDを ; でつなぐ（移行割 DC000021 もここ）' },
  { label: '現金を使う', k: 'cash', type: 'bool', hint: '1／0（空欄＝オプションから決める）' },
  { label: 'ゲストを使う', k: 'guest', type: 'bool', hint: '1／0（空欄＝オプションから決める）' },
  { label: 'ES-QRを使う', k: 'esqr', type: 'bool', hint: '1／0（空欄＝オプションから決める）' },
  { label: '1日の上限食数', k: 'cap', type: 'int', min: 0, maxNum: 999 },
  { label: '納品不可曜日', k: 'ng', max: 50, hint: '月;水 のように' },
  { label: '納品不可になった場合', k: 'shift', opts: ['前倒す', '後ろ倒す'] },
  { label: '消費期限の短い商品の扱い', k: 'short', opts: ['通常', '短消費期限なし'] },
  { label: 'アカウントを発行するか', k: 'issue', type: 'bool', hint: '1／0（空欄＝1）。メールは送らない' },
];
const B_COLS: Col[] = [
  { label: '拠点ID', k: 'branchId', req: true, max: 7 },
  { label: '機種ID', k: 'modelId', req: true, max: 8 },
  { label: '台数', k: 'qty', req: true, type: 'int', min: 1, maxNum: 99 },
  { label: '貸出日', k: 'startOn', type: 'date', hint: 'yyyy-mm-dd。空欄＝貸出日 未入力（最低利用期間は推定）' },
  { label: 'メモ', k: 'memo', max: 200 },
];
const C_COLS: Col[] = [
  { label: '法人ID', k: 'corpId', req: true, max: 7 },
  { label: '拠点ID', k: 'branchId', req: true, max: 7 },
  { label: '種類', k: 'kind', req: true, opts: CONTACT_KINDS },
  { label: '名前', k: 'name', req: true, max: 60 },
  { label: 'フリガナ', k: 'kana', max: 60 },
  { label: 'メール', k: 'mail', max: 200 },
  { label: '電話', k: 'tel', max: 20 },
];
const D_COLS: Col[] = [
  { label: '拠点ID', k: 'branchId', req: true, max: 7 },
  { label: '品番', k: 'productId', req: true, max: 10 },
  { label: '単価（税抜）', k: 'net', req: true, type: 'money' },
];

const headOf = (cols: Col[]) => cols.map((c) => (c.hint ? `${c.label}【${c.hint}】` : c.label));
const reqOf = (cols: Col[]) => cols.filter((c) => c.req).map((c) => c.label);

/** 1行を列の型で読む。値（空欄は入れない）と形のエラー */
function readLine(cols: Col[], m: ReturnType<typeof matchHeader>, l: CsvLine) {
  const v: Record<string, unknown> = {};
  const errs: RowError[] = [];
  for (const c of cols) {
    const i = m.at.get(c.label);
    const p = parseCell(i === undefined ? '' : l.cells[i] ?? '', c);
    if (p.k === 'err') errs.push({ line: l.line, col: c.label, msg: p.msg });
    else if (p.k === 'clear') errs.push({ line: l.line, col: c.label, msg: '「-」は使えません（移行は空欄＝変えない）' });
    else if (p.k === 'set') v[c.k] = p.v;
  }
  return { v, errs };
}
const errRow = (l: CsvLine, key: string, errs: RowError[], name = ''): RowResult => rowResult(l.line, key || `${l.line}行目`, name, 'エラー', { errors: errs });
const msg = (e: unknown) => (e instanceof ApiError || e instanceof Error ? e.message : String(e));
const str = (v: unknown) => (typeof v === 'string' ? v : undefined);
const ids = (v: unknown) => (Array.isArray(v) ? (v as string[]) : typeof v === 'string' ? v.split(/[;；]/).map((x) => x.trim()).filter(Boolean) : undefined);

/* ===================================================================== */
/* A. 法人・拠点・契約                                                      */
/* ===================================================================== */

/** 法人の列：同じ法人の行で同じ値（空欄の行は最初の行の値） */
const CORP_KEYS = ['cname', 'ckana', 'cctn', 'cbill', 'czip', 'cpref', 'ccity', 'cbld', 'ctel', 'cfax', 'es', 'cpay', 'cdebit', 'ccycle', 'clead', 'cunit', 'cbo', 'cremind', 'p1status'] as const;

export const migrationSites: CsvEntity = {
  id: 'migrationSites', screen: '移行（法人・拠点・契約）', key: '拠点ID', cols: [], list: () => [], keyOf: () => '', exportOnly: false,
  impact: [
    '法人・拠点・親契約・子契約を、受付・承認を通さずに利用中で直接作ります（メールは送りません）。IDはフェーズ1の ID のままです',
    '子契約は「切替のサイクル月」から、いま子契約がある最後のサイクル月まで作ります（より前の請求は参照のみ）。確定・請求済の子契約は変えません',
    'フェーズ1の状態（法人ステータス）：本登録＝通常／仮登録＝仮登録のまま取り込み、運営の申込の受付（受付中）に載せます（子契約・注文・ログインはまだありません）／休止中＝利用休止（休止の期間・再開月は未定。要補完に出ます）／解約済・削除済＝取り込みません（対象外）',
    '配送（枠・倉庫・配送会社）は入れません。移行のあとで運営が入れます（要補完の「配送の設定」）。担当者は C、設備は B、企業独自価格の単価は D のファイルで入れます',
  ],
  custom: {
    head: () => headOf(A_COLS),
    required: reqOf(A_COLS),
    template: () => [
      A_COLS.map((c) => ({
        corpId: 'CU00010', branchId: 'CU00011', cname: '株式会社テスト商事', ckana: 'テストショウジ', cbill: '株式会社テスト商事 経理部', czip: '100-0001', cpref: '東京都', ccity: '千代田区千代田1-1',
        ctel: '03-0000-0000', p1status: '本登録', es: 'Ad00003', cpay: '口座振替', cdebit: '完了', ccycle: '月払い', clead: '1ヶ月前', cunit: 'まとめて発行（法人1通）', name: '本社', kana: 'ホンシャ', zip: '100-0001', pref: '東京都',
        city: '千代田区千代田1-1', tel: '03-0000-0001', emp: '120', win: '9:00-12:00;13:00-17:00', dnote: '1F 受付', startYm: '2025-04', billTo: '法人', plan: 'ES000004', gen: '改訂第三回目',
        discounts: 'DC000021', cap: '3', ng: '土;日', shift: '前倒す', short: '通常', issue: '1',
      } as Record<string, string>)[c.k] ?? ''),
      A_COLS.map((c) => ({
        corpId: 'CU00010', branchId: 'CU00012', name: '大阪営業所', zip: '530-0001', pref: '大阪府', city: '大阪市北区梅田1-1', floor: '2F 休憩室', startYm: '2025-10', billTo: '法人', plan: 'ES000004',
        course: 'ESライト', priceMode: '企業独自価格', settle: '買取', options: 'OP000002', amounts: 'OP000002=0', esqr: '1',
      } as Record<string, string>)[c.k] ?? ''),
    ],
    exportRows: () => [],
    run: (x, _text, lines) => {
      const m = matchHeader(lines[0].cells, A_COLS, reqOf(A_COLS));
      const st = x.scope.target ?? '';
      const rows: RowResult[] = [];
      if (!/^\d{4}-\d{2}$/.test(st)) return { fileErrors: ['切替のサイクル月（子契約を作り始める月）を選んでください'], rows };
      const kids = x.r.list<ChildContract>('dm.org.childContracts');
      const lastYm = kids.reduce((a, k) => (k.cycleMonth > a ? k.cycleMonth : a), st);
      const opts = new Set(x.r.list<Option>('dm.master.options').filter((o) => o.status !== '削除済').map((o) => o.id));
      const discs = new Set(x.r.list<Discount>('dm.master.discounts').filter((d) => d.status !== '削除済').map((d) => d.id));
      const opsAccounts = new Set(x.r.list<Account>('dm.account.accounts').filter((a) => a.site === 'ops').map((a) => a.id));
      const agencies = new Set(x.r.list<{ id: string }>('dm.org.agencies').map((a) => a.id));

      /* ---- 行を読む ---- */
      type P = { l: CsvLine; v: Record<string, unknown>; errs: RowError[] };
      const ps: P[] = lines.slice(1).map((l) => ({ l, ...readLine(A_COLS, m, l) }));
      const firstOf = new Map<string, number>();
      const corpIds = new Map<string, number>();
      for (const p of ps) {
        const bid = str(p.v.branchId) ?? '';
        if (!bid) p.errs.push({ line: p.l.line, col: '拠点ID', msg: '拠点IDを入れてください（フェーズ1の ID）' });
        else {
          if (!PHASE1_ID.test(bid)) p.errs.push({ line: p.l.line, col: '拠点ID', msg: `拠点ID は CU＋5桁で入れてください（${bid}）` });
          if (firstOf.has(bid)) p.errs.push({ line: p.l.line, col: '拠点ID', msg: `拠点ID ${bid} が ${firstOf.get(bid)}行目と重複しています` });
          else firstOf.set(bid, p.l.line);
        }
        const cid = str(p.v.corpId);
        if (cid) {
          if (!PHASE1_ID.test(cid)) p.errs.push({ line: p.l.line, col: '法人ID', msg: `法人ID は CU＋5桁で入れてください（${cid}）` });
          if (cid === bid) p.errs.push({ line: p.l.line, col: '法人ID', msg: `法人ID と拠点ID が同じです（${cid}）。フェーズ2は法人と拠点で1つの連番です（移行CSV_列の案 E-1）` });
          if (!corpIds.has(cid)) corpIds.set(cid, p.l.line);
        }
      }
      /* 法人と拠点で同じ番号を使っていない（ファイルの中。使っている両方の行をエラーに） */
      for (const p of ps) {
        const bid = str(p.v.branchId), cid = str(p.v.corpId);
        if (bid && bid !== cid && corpIds.has(bid)) p.errs.push({ line: p.l.line, col: '拠点ID', msg: `拠点ID ${bid} は ${corpIds.get(bid)}行目で法人ID として使われています（フェーズ2は法人と拠点で1つの連番・E-1）` });
        if (cid && cid !== bid && firstOf.has(cid)) p.errs.push({ line: p.l.line, col: '法人ID', msg: `法人ID ${cid} は ${firstOf.get(cid)}行目で拠点ID として使われています（フェーズ2は法人と拠点で1つの連番・E-1）` });
      }
      /* 法人の列：同じ法人の行で同じ値 */
      const corpVals = new Map<string, Map<string, { v: unknown; line: number }>>();
      for (const p of ps) {
        const cid = str(p.v.corpId);
        if (!cid) continue;
        const C = corpVals.get(cid) ?? corpVals.set(cid, new Map()).get(cid)!;
        for (const k of CORP_KEYS) {
          const v = p.v[k];
          if (v === undefined) continue;
          const was = C.get(k);
          if (was && JSON.stringify(was.v) !== JSON.stringify(v)) p.errs.push({ line: p.l.line, col: A_COLS.find((c) => c.k === k)!.label, msg: `${was.line}行目（同じ法人ID）と違う値です。法人の列は同じ法人の行で同じ値にしてください` });
          else if (!was) C.set(k, { v, line: p.l.line });
        }
      }
      const done = new Set<string>();
      const ix = new MigIndex(x.r);

      for (const p of ps) {
        const { l, v, errs } = p;
        const bid = str(v.branchId) ?? '';
        const bad = (col: string, m2: string) => errs.push({ line: l.line, col, msg: m2 });
        const cid = str(v.corpId);
        const C = cid ? corpVals.get(cid) : undefined;
        const cv = (k: string) => C?.get(k)?.v;
        /* フェーズ1の状態（法人の列。法人なしの拠点はその行の値）。空欄＝本登録 */
        const p1 = (str(cid ? cv('p1status') : v.p1status) ?? '本登録') as (typeof P1_STATUS)[number];
        /* 解約済・削除済は取り込まない（エラーではない）。法人の行はすべて同じ状態なので、その法人の行は全部対象外。ほかの列の不備は見ない（状態の列の不備だけエラー） */
        if (P1_SKIP.includes(p1) && !errs.some((e) => e.col === P1_LABEL)) {
          rows.push(rowResult(l.line, bid || `${l.line}行目`, str(v.name) ?? '', '対象外', { reason: '解約済／削除済のお客様は取り込みません' }));
          continue;
        }
        if (cid) for (const [k, label] of [['cname', '法人名'], ['czip', '法人の郵便番号'], ['cpref', '法人の都道府県'], ['ccity', '法人の市区町村・番地']] as const) if (cv(k) === undefined) bad(label, `法人ありの行は「${label}」が必須です`);
        if (!cid && CORP_KEYS.some((k) => k !== 'p1status' && v[k] !== undefined)) bad('法人ID', '法人の列が入っているので法人IDを入れてください（法人なしの拠点は法人の列を空に）');
        for (const [k, label] of [['name', '拠点名'], ['zip', '拠点の郵便番号'], ['pref', '拠点の都道府県'], ['city', '拠点の市区町村・番地'], ['plan', 'プランID'], ['billTo', '請求先']] as const) if (str(v[k]) === undefined) bad(label, `「${label}」が必須です`);
        if (str(v.plan) && !/^ES\d{6}$/.test(str(v.plan)!)) bad('プランID', `プランID は ES＋6桁です（${v.plan}）`);
        if (str(v.es) && !opsAccounts.has(str(v.es)!)) bad('ES営業担当', `運営アカウント ${v.es} がありません`);
        if (str(v.agency) && !agencies.has(str(v.agency)!)) bad('代理店ID', `代理店 ${v.agency} がありません`);
        const win = str(v.win) !== undefined ? parseWindows(str(v.win)!) : undefined;
        if (str(v.win) !== undefined && !win) bad('受取できる時間帯', `9:00-12:00;13:00-17:00 の形で入れてください（${v.win}）`);
        const options = str(v.options) !== undefined ? ids(v.options) : undefined;
        for (const o of options ?? []) if (!opts.has(o)) bad('オプション', `オプションマスタにありません（${o}）`);
        const discounts = str(v.discounts) !== undefined ? ids(v.discounts) : undefined;
        for (const d of discounts ?? []) if (!discs.has(d)) bad('値引き', `値引きマスタにありません（${d}）`);
        let amounts: Record<string, number> | undefined;
        if (str(v.amounts) !== undefined) {
          amounts = {};
          for (const part of ids(v.amounts) ?? []) {
            const mm = /^(OP\d{6})=(\d+)$/.exec(part);
            if (!mm) bad('オプション金額の上書き', `OP000004=0;OP000037=8000 の形で入れてください（${part}）`);
            else if (!opts.has(mm[1])) bad('オプション金額の上書き', `オプションマスタにありません（${mm[1]}）`);
            else amounts[mm[1]] = Number(mm[2]);
          }
        }
        const ngList = str(v.ng) !== undefined ? ids(v.ng)! : undefined;
        for (const d of ngList ?? []) if (!DAYS.includes(d)) bad('納品不可曜日', `月・火・水・木・金・土・日・祝日 から ; でつないでください（${d}）`);
        /* フェーズ1の状態 → フェーズ2：本登録＝通常（有効・本登録）／仮登録＝仮登録のまま／休止中＝利用休止（休止の期間・再開月は未定＝要補完） */
        const tentative = p1 === '仮登録';
        const status: SiteIn['status'] = tentative ? '仮登録' : p1 === '休止中' ? '利用休止' : '有効';
        const pause: SiteIn['pause'] = p1 === '休止中' ? { from: st, to: PAUSE_OPEN, resume: '' } : undefined;
        if (str(v.kind) === 'お試し' && !str(v.trialEnd) && !tentative) bad('お試しの終了月', '契約区分がお試しのときは お試しの終了月 を入れてください');
        if (str(v.priceMode) && str(v.settle) && (str(v.priceMode) === '企業独自価格') !== (str(v.settle) === '買取')) bad('精算', '価格と精算の組み合わせが違います（通常価格＝従量・企業独自価格＝買取）');
        if (str(v.billTo) === '法人' && !cid) bad('請求先', '法人なしの拠点は 請求先＝この拠点 にしてください');
        if (errs.length) { rows.push(errRow(l, bid, errs, str(v.name))); continue; }

        /* ---- 保存（行ごとに重ねて確かめ、成功したら取り込む） ---- */
        const N = overlayRepo(x.r);
        try {
          const corp: CorpIn | null = cid ? {
            id: cid, name: cv('cname') as string, kana: cv('ckana') as string | undefined, contractName: cv('cctn') as string | undefined, billToName: cv('cbill') as string | undefined,
            zip: cv('czip') as string, pref: cv('cpref') as string, city: cv('ccity') as string, bld: cv('cbld') as string | undefined, tel: cv('ctel') as string | undefined, fax: cv('cfax') as string | undefined,
            salesRepId: cv('es') as string | undefined, payMethod: cv('cpay') as Billing['payMethod'] | undefined, debit: cv('cdebit') as Billing['debitStatus'] | undefined,
            payCycle: cv('ccycle') as Billing['payCycle'] | undefined, lead: cv('clead') !== undefined ? MIGRATE_LEAD[cv('clead') as string] : undefined,
            unit: cv('cunit') as Billing['invoiceUnit'] | undefined, billone: cv('cbo') as string | undefined, reminder: cv('cremind') as boolean | undefined,
            status: tentative ? '仮登録' : '正式登録',
          } : null;
          const out = migrateSite(N, {
            corp, branchId: bid, name: str(v.name)!, kana: str(v.kana), zip: str(v.zip)!, pref: str(v.pref)!, city: str(v.city)!, bld: str(v.bld), tel: str(v.tel), fax: str(v.fax),
            floor: str(v.floor), employees: v.emp as number | undefined, windows: win ?? undefined, deliveryNote: str(v.dnote), noStockCheck: v.nocheck as boolean | undefined, memo: str(v.memo),
            ngDays: ngList, shift: str(v.shift) as SiteIn['shift'], short: str(v.short) as SiteIn['short'],
            branchStatus: tentative ? '仮登録' : '本登録', status, pause, kind: str(v.kind) as SiteIn['kind'], trialEnd: str(v.trialEnd),
            startYm: str(v.startYm), agencyId: str(v.agency), billTo: str(v.billTo) as SiteIn['billTo'], bpay: str(v.bpay) as SiteIn['bpay'], bcycle: str(v.bcycle) as SiteIn['bcycle'],
            blead: str(v.blead) !== undefined ? MIGRATE_LEAD[str(v.blead)!] : undefined, planId: str(v.plan)!, course: str(v.course), gen: str(v.gen), priceMode: str(v.priceMode) as SiteIn['priceMode'],
            settle: str(v.settle) as SiteIn['settle'], options, amounts, discounts, cash: v.cash as boolean | undefined, guest: v.guest as boolean | undefined, esqr: v.esqr as boolean | undefined,
            cap: v.cap as number | undefined, issue: v.issue as boolean | undefined,
          }, { st, lastYm, corpDone: !!cid && done.has(cid), ix });
          (x.r as ReturnType<typeof overlayRepo>).merge(N.journal);
          if (cid) done.add(cid);
          const action = out.created ? '新規' : out.changed ? '更新' : '変更なし';
          rows.push(rowResult(l.line, bid, str(v.name) ?? '', action, { diff: out.diff, warnings: out.notes.filter((n) => /変えていません/.test(n)) }));
        } catch (e) {
          rows.push(errRow(l, bid, [{ line: l.line, col: '—', msg: msg(e) }], str(v.name)));
        }
      }
      return { rows, value: { sites: rows.filter((r) => r.action === '新規').length } };
    },
  },
};


/* ===================================================================== */
/* B. 設備（貸出）                                                          */
/* ===================================================================== */

export const migrationLoans: CsvEntity = {
  id: 'migrationLoans', screen: '移行（設備）', key: '拠点ID', cols: [], list: () => [], keyOf: () => '',
  impact: [
    '拠点ID＋機種ID が同じ貸出は上書きします。貸出日が空欄なら「貸出日 未入力」で入れ、最低利用期間・違約金は当初契約開始年月を起算にした仮の値（推定）で計算します',
    '自販機の機種を入れると、コースが空だった契約は ESライト（自販機）に合わせ、自販機リース（OP000037）の台数をそろえます',
  ],
  custom: {
    head: () => headOf(B_COLS),
    required: reqOf(B_COLS),
    template: () => [['CU00011', 'RF000002', '1', '2025-04-10', ''], ['CU00012', 'VM000001', '1', '', '自販機（貸出日不明）']],
    exportRows: () => [],
    run: (x, _text, lines) => {
      const m = matchHeader(lines[0].cells, B_COLS, reqOf(B_COLS));
      const rows: RowResult[] = [];
      const ix = new MigIndex(x.r);
      const seen = new Map<string, number>();
      for (const l of lines.slice(1)) {
        const { v, errs } = readLine(B_COLS, m, l);
        const bid = str(v.branchId) ?? '', mid = str(v.modelId) ?? '';
        for (const [k, label] of [['branchId', '拠点ID'], ['modelId', '機種ID'], ['qty', '台数']] as const) if (v[k] === undefined) errs.push({ line: l.line, col: label, msg: `「${label}」が必須です` });
        const key = `${bid}|${mid}`;
        if (bid && mid) { if (seen.has(key)) errs.push({ line: l.line, col: '機種ID', msg: `拠点ID＋機種ID が ${seen.get(key)}行目と重複しています` }); else seen.set(key, l.line); }
        if (errs.length) { rows.push(errRow(l, bid && mid ? `${bid} ${mid}` : bid, errs)); continue; }
        const N = overlayRepo(x.r);
        try {
          const out = migrateLoan(N, { branchId: bid, modelId: mid, qty: v.qty as number, startOn: str(v.startOn), memo: str(v.memo) }, ix);
          (x.r as ReturnType<typeof overlayRepo>).merge(N.journal);
          rows.push(rowResult(l.line, `${bid} ${mid}`, x.r.get<Branch>('dm.org.branches', bid)?.name ?? '', out.created ? '新規' : out.diff.length ? '更新' : '変更なし', { diff: out.diff }));
        } catch (e) { rows.push(errRow(l, `${bid} ${mid}`, [{ line: l.line, col: '—', msg: msg(e) }])); }
      }
      return { rows };
    },
  },
};

/* ===================================================================== */
/* C. 担当者                                                                */
/* ===================================================================== */

export const migrationContacts: CsvEntity = {
  id: 'migrationContacts', screen: '移行（担当者）', key: '拠点ID', cols: [], list: () => [], keyOf: () => '',
  impact: [
    '取り込み直すときは、その法人・拠点の担当者を「ファイルの中身で置き換え」ます（キーにできる項目がないため）。担当者の数に上限はありません',
    'メイン担当者は法人・拠点ごとに1人。請求担当者がいなければメイン担当者と同じ人を請求担当者にします。マニュアルのご案内（M13）・担当者変更の通知は送りません',
  ],
  custom: {
    head: () => headOf(C_COLS),
    required: reqOf(C_COLS),
    template: () => [['CU00010', '', 'メイン担当者', '山田 太郎', 'ヤマダ タロウ', 'yamada@example.jp', '03-0000-0001'], ['', 'CU00011', 'メイン担当者', '佐藤 花子', 'サトウ ハナコ', 'sato@example.jp', '03-0000-0002'], ['', 'CU00011', 'サブ担当者', '鈴木 一郎', '', '', '']],
    exportRows: () => [],
    run: (x, _text, lines) => {
      const m = matchHeader(lines[0].cells, C_COLS, reqOf(C_COLS));
      const ix = new MigIndex(x.r);
      type P = { l: CsvLine; v: Record<string, unknown>; errs: RowError[]; owner: string };
      const groups = new Map<string, P[]>();
      const rows: RowResult[] = [];
      for (const l of lines.slice(1)) {
        const { v, errs } = readLine(C_COLS, m, l);
        const cid = str(v.corpId), bid = str(v.branchId);
        if (!cid && !bid) errs.push({ line: l.line, col: '法人ID・拠点ID', msg: '法人ID か 拠点ID のどちらかを入れてください' });
        if (cid && bid) errs.push({ line: l.line, col: '法人ID・拠点ID', msg: '法人ID と 拠点ID は どちらか1つだけ入れてください（法人の担当者は法人ID、拠点の担当者は拠点ID）' });
        for (const [k, label] of [['kind', '種類'], ['name', '名前']] as const) if (v[k] === undefined) errs.push({ line: l.line, col: label, msg: `「${label}」が必須です` });
        if (str(v.mail) && !isMail(str(v.mail)!)) errs.push({ line: l.line, col: 'メール', msg: 'メールアドレスの形式が正しくありません' });
        const owner = cid ?? bid ?? '';
        const p: P = { l, v, errs, owner };
        if (owner) groups.set(owner, [...(groups.get(owner) ?? []), p]); else rows.push(errRow(l, '', errs));
      }
      for (const [owner, ps] of groups) {
        const type: 'corp' | 'branch' = str(ps[0].v.corpId) ? 'corp' : 'branch';
        const groupErr = ps.some((p) => p.errs.length);
        if (!groupErr) {
          if (ps.filter((p) => p.v.kind === 'メイン担当者').length > 1) for (const p of ps) p.errs.push({ line: p.l.line, col: '種類', msg: `${owner} のメイン担当者が2人以上います（1人だけ。ほかはサブ担当者に）` });
          if (ps.filter((p) => p.v.kind === '請求担当者').length > 1) for (const p of ps) p.errs.push({ line: p.l.line, col: '種類', msg: `${owner} の請求担当者が2人以上います（1人だけ）` });
          if (ps.some((p) => (str(p.v.corpId) ? 'corp' : 'branch') !== type)) for (const p of ps) p.errs.push({ line: p.l.line, col: '法人ID・拠点ID', msg: `${owner} を法人IDと拠点IDの両方に書いています` });
        }
        const N = overlayRepo(x.r);
        let res: { before: number; after: number; same: boolean } | null = null;
        if (!ps.some((p) => p.errs.length)) {
          try {
            res = migrateContacts(N, { type, id: owner }, ps.map((p): ContactIn => ({ kind: p.v.kind as Contact['kind'], name: str(p.v.name)!, kana: str(p.v.kana), email: str(p.v.mail), tel: str(p.v.tel) })), ix);
            (x.r as ReturnType<typeof overlayRepo>).merge(N.journal);
          } catch (e) { ps[0].errs.push({ line: ps[0].l.line, col: '—', msg: msg(e) }); }
        }
        for (const [i, p] of ps.entries()) {
          if (p.errs.length || !res) {
            const others = !p.errs.length ? [{ line: p.l.line, col: '—', msg: `同じ${type === 'corp' ? '法人' : '拠点'}（${owner}）の別の行にエラーがあるため取り込みません（担当者は法人・拠点ごとにまとめて置き換えます）` }] : p.errs;
            rows.push(errRow(p.l, owner, others, str(p.v.name)));
          } else rows.push(rowResult(p.l.line, owner, str(p.v.name) ?? '', res.same ? '変更なし' : res.before ? '更新' : '新規', { diff: res.same ? [] : i === 0 ? [{ col: '担当者', before: res.before ? `${res.before}人` : '', after: `${res.after}人（置き換え）` }] : [] }));
        }
      }
      rows.sort((a, b) => a.line - b.line);
      return { rows };
    },
  },
};

/* ===================================================================== */
/* D. 企業独自価格                                                          */
/* ===================================================================== */

export const migrationPrices: CsvEntity = {
  id: 'migrationPrices', screen: '移行（企業独自価格）', key: '拠点ID', cols: [], list: () => [], keyOf: () => '',
  impact: [
    '拠点ID＋品番が同じなら上書きします。A ファイルで 価格＝企業独自価格 にした拠点だけです。確定・請求済の子契約は変えません',
    '単価（税抜）は商品マスタの税率で税込にして（1円未満切り捨て）子契約の企業独自価格に入れます',
  ],
  custom: {
    head: () => headOf(D_COLS),
    required: reqOf(D_COLS),
    template: () => [['CU00012', 'M001', '480'], ['CU00012', 'M002', '520']],
    exportRows: () => [],
    run: (x, _text, lines) => {
      const m = matchHeader(lines[0].cells, D_COLS, reqOf(D_COLS));
      const rows: RowResult[] = [];
      const ix = new MigIndex(x.r);
      const seen = new Map<string, number>();
      for (const l of lines.slice(1)) {
        const { v, errs } = readLine(D_COLS, m, l);
        const bid = str(v.branchId) ?? '', pid = str(v.productId) ?? '';
        for (const [k, label] of [['branchId', '拠点ID'], ['productId', '品番'], ['net', '単価（税抜）']] as const) if (v[k] === undefined) errs.push({ line: l.line, col: label, msg: `「${label}」が必須です` });
        const key = `${bid}|${pid}`;
        if (bid && pid) { if (seen.has(key)) errs.push({ line: l.line, col: '品番', msg: `拠点ID＋品番 が ${seen.get(key)}行目と重複しています` }); else seen.set(key, l.line); }
        if (errs.length) { rows.push(errRow(l, bid && pid ? `${bid} ${pid}` : bid, errs)); continue; }
        const N = overlayRepo(x.r);
        try {
          const out = migratePrice(N, { branchId: bid, productId: pid, netYen: v.net as number }, ix);
          (x.r as ReturnType<typeof overlayRepo>).merge(N.journal);
          rows.push(rowResult(l.line, `${bid} ${pid}`, x.r.get<Branch>('dm.org.branches', bid)?.name ?? '', out.before === String(out.gross) ? '変更なし' : out.before ? '更新' : '新規', { diff: out.before === String(out.gross) ? [] : [{ col: `単価（税込）${pid}`, before: out.before, after: String(out.gross) }] }));
        } catch (e) { rows.push(errRow(l, `${bid} ${pid}`, [{ line: l.line, col: '—', msg: msg(e) }])); }
      }
      return { rows };
    },
  },
};

export const MIGRATION_ENTITIES = [migrationSites, migrationLoans, migrationContacts, migrationPrices];
