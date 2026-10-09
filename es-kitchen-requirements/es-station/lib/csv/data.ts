import { ApiError } from '@/lib/api/errors';
import org from '@/lib/domain/areas/org';
import { today } from '@/lib/supplier/dates';
import { CsvColError, rowResult, type CsvEntity, type Ctx, type EntityCol, type RowResult } from '@/lib/domain/csv';
import { avgCostOf, baseEligible, MENU_CSV_HEADER, unitPrice } from '@/lib/domain/menu';
import { costOn, mgmtNameOf, selectedSupplier, shelfText } from '@/lib/domain/product';
import { childLocked } from '@/lib/domain/snapshot';
import { defaultBb, itemKind, knownOrders, poReceiving, receive, SPLIT_MAX, supplierBb, type PoLike } from '@/lib/domain/stock';
import type { Account, ChildContract as DChild, Contact, MonthlyMenu, Product, StockMove, Warehouse } from '@/lib/domain/types';
import contracts, { endOnWarnings } from '@/lib/ops/areas/contracts';
import opsMenu from '@/lib/ops/areas/menu';
import purchasing from '@/lib/ops/areas/purchasing';
import { applyDeps, baseFill, blankRow, cellText as cellOf, depTargets, E54, EMAIL_MSG, EMAIL_RE, FORMS, NUM_FIELDS, fieldsOf, flatOpts, offNeed, tablesFor, valuesOf } from '@/lib/ops/contracts/logic';
import type { Branch, Cell, ChildContract, Corp, Entity, FormVal, TableRow } from '@/lib/ops/contracts/types';
import { branchRow, childRow, corpRow, deadlineOf, load as loadOrg } from '@/lib/ops/contracts/fromDomain';
import { WS_KINDS } from '@/lib/ops/purchasing/stock';
import { cellText } from './core';

/*
 * 運営Web のデータの CSV（出力の列・取込）。保存は画面と同じ関数：
 *   法人・拠点（contracts.save。新しい法人・拠点は申込から＝CSV では更新だけ）・契約（子契約。更新だけ・キー＝子契約ID。その月から後ろの未確定の月に当てる。確定・請求済の月はエラー）・
 *   月間メニュー（Phase 2 テンプレート・menu.importCsv）・入荷登録（stock.receive）・在庫の記録（purchasing.addStockRec）
 */

const strOf = (v: unknown) => (v === undefined ? '' : String(v));
const bad = (m: string): never => { throw new ApiError(m, 400); };

/* ===================================================================== */
/* 法人・拠点・契約（画面の項目そのもの。lib/ops/contracts）                  */
/* ===================================================================== */

type Row = Corp | Branch | ChildContract;
/** 取込の下書き。set＝CSV で値を入れた項目（E109 の確かめ用）、remind・floor＝画面の項目にない値（法人のご注文のリマインド・拠点の設置フロア） */
type FD = { values: Record<string, FormVal>; tables: Record<string, TableRow[]>; set: string[]; remind?: boolean; floor?: string };
const vcache = new WeakMap<object, Record<string, FormVal>>();
const valsOf = (e: Entity, row: Row) => {
  let v = vcache.get(row);
  if (!v) { v = applyDeps(e, valuesOf(FORMS[e], baseFill(e, row))).values; vcache.set(row, v); }
  return v;
};
/** 画面の項目の列（項目名が見出し）。skip＝別に持つ列 */
function formCols<R extends Row>(e: Entity, skip: string[]): EntityCol<R, FD>[] {
  const seen = new Set(skip);
  const out: EntityCol<R, FD>[] = [];
  /* 条件で入力できる項目（請求の欄）は、非活性の状態のまま参照だけの印が付いているので、取込では入力できる列にする */
  const cond = depTargets(e);
  for (const f of fieldsOf(FORMS[e])) {
    if (seen.has(f.name)) continue;
    seen.add(f.name);
    const c = f.ctl;
    if (c.t === 'buttons' || c.t === 'file') continue;
    const isList = c.t === 'chk';
    /* 非活性のときの「—（理由）」は選べる値ではない（条件に合わない値は E109 の文言で返す） */
    const opts = c.t === 'select' || c.t === 'adjust' ? (cond.has(f.name) ? flatOpts(c.opts).filter((o) => !/^—/.test(o)) : flatOpts(c.opts)) : c.t === 'chk' ? c.items : undefined;
    out.push({
      label: f.name, type: isList ? 'list' : 'text', opts, ro: f.rop && !(f.na && cond.has(f.name)), clear: !opts && f.mark !== 'req' && !NUM_FIELDS.includes(f.name),
      get: (r) => valsOf(e, r)[f.name],
      put: (d, v) => { d.values[f.name] = isList ? (Array.isArray(v) ? (v as string[]) : []) : strOf(v); if (v !== undefined) d.set.push(f.name); },
    });
  }
  return out;
}
/** 列は使うときに作る（画面の定義を読むので、読み込みのときには作らない） */
const colMemo: Partial<Record<Entity, unknown>> = {};
const lazy = <T,>(e: Entity, f: () => T): T => (colMemo[e] ??= f()) as T;
const draftOf = (e: Entity) => (r: Row): FD => ({ values: { ...valsOf(e, r) }, tables: structuredClone(tablesFor(FORMS[e], baseFill(e, r))), set: [] });
/* E101・E102（docs/05_画面設計書/データ/_共通_メッセージ.py） */
const NEW_VIA_APPLY = '新しい法人・拠点は CSV では登録できません。「契約申請管理 ＞ 代理入力」から登録してください。';
const provisional = (r: Row) => (r.apNo ? `仮登録の間は、契約申請管理の申請詳細（${r.apNo}）で編集してください。` : null);

/* ---- 列の並べ替え（docs/05_画面設計書/CSVテンプレート/corps.csv・branches.csv の見出しと並び）---- */
type Col<R extends Row> = EntityCol<R, FD>;
/** 画面の項目の列を、テンプレートの並びにする（[新しい見出し, 項目の見出し]＝見出しだけ変える。列そのもの＝そのまま） */
function arrange<R extends Row>(cols: Col<R>[], spec: (string | [string, string] | Col<R>)[]): Col<R>[] {
  const by = new Map(cols.map((c) => [c.label, c]));
  return spec.map((x) => {
    if (typeof x !== 'string' && !Array.isArray(x)) return x;
    const [to, from] = typeof x === 'string' ? [x, x] : x;
    const c = by.get(from);
    if (!c) throw new Error(`CSV の列がありません：${from}`);
    return { ...c, label: to };
  });
}
/** 項目の名前 → 列の見出し（E109 に出す） */
const labelsOf = (cols: Col<Row>[], names: Record<string, string>) => (n: string) => names[n] ?? cols.find((c) => c.label === n)?.label ?? n;

/* 担当者：同じ法人ID／拠点IDの行を並べる（1行＝1人）。「区分＋メールアドレス」で突き合わせ、あれば更新・なければ追加（CSV では削除しない） */
const CONTACT_TABLE = '担当者（テーブル）';
const CONTACT_KINDS = ['メイン担当者', '請求担当者', 'サブ担当者'];
const CONTACT_LABELS = ['区分', '担当者名', 'フリガナ', 'メールアドレス', '電話番号（担当者）'];
const contactCols = <R extends Row>(): Col<R>[] => CONTACT_LABELS.map((label, i) => ({
  label, child: true, opts: i === 0 ? CONTACT_KINDS : undefined,
  cget: ((c: Contact) => [c.kind, c.name, c.kana, c.email, c.tel][i]) as never,
}));
const contactsOf = (type: 'corp' | 'branch') => (rec: Row, x: Ctx) => x.r.list<Contact>('dm.org.contacts').filter((c) => c.owner.type === type && c.owner.id === rec.id);
const withCell = (c: Cell, v: string): Cell => (typeof c === 'string' ? v : c.t === 'in' || c.t === 'sel' ? { ...c, v } : c);
function putContacts(e: Entity) {
  return (d: FD, items: Map<string, { k: string; v?: unknown }>[]) => {
    const rows = d.tables[CONTACT_TABLE] ?? [];
    /* 区分＋メールアドレスで探す：全角・半角、大文字・小文字、前後の空白の違いは同じとみなす */
    const norm = (t: string) => t.normalize('NFKC').trim().toLowerCase();
    const seen = new Set<string>();
    for (const it of items) {
      const val = (l: string) => { const p = it.get(l); return p?.k === 'set' ? String(p.v) : ''; };
      const kind = val('区分'), email = val('メールアドレス').normalize('NFKC').trim();
      if (!kind || !email) throw new CsvColError(!kind ? '区分' : 'メールアドレス', '担当者の行には「区分」と「メールアドレス」を入れてください（この2つで担当者を探します）。');
      /* E07：メールアドレスの形（担当者の画面の保存と同じ決まり：contracts.save） */
      if (!EMAIL_RE.test(email)) throw new CsvColError('メールアドレス', EMAIL_MSG);
      const sk = `${kind}\u0001${norm(email)}`;
      if (seen.has(sk)) throw new CsvColError('メールアドレス', `同じ区分・同じメールアドレスの担当者の行が、ファイルの中に2つあります（${kind}・${email}）。1行にしてください。`);
      seen.add(sk);
      const hit = rows.find((r) => 'c' in r && cellOf(r.c[0]) === kind && norm(cellOf(r.c[3])) === norm(email)) as { c: Cell[] } | undefined;
      const row = hit ?? (blankRow(FORMS[e], CONTACT_TABLE) as { c: Cell[] });
      if (!hit) rows.push(row);
      /* メールの違いが大文字・小文字・全角だけなら、今のメールはそのまま */
      CONTACT_LABELS.forEach((l, i) => { const v = i === 3 ? email : val(l); if (hit && i === 3) return; if (v !== '' || !hit) row.c[i] = withCell(row.c[i], v); });
    }
    d.tables[CONTACT_TABLE] = rows;
    /* E103（0名）・E108（2名以上）：メイン担当者・請求担当者は1名ずつ */
    for (const k of ['メイン担当者', '請求担当者']) {
      const n = rows.filter((r) => 'c' in r && cellOf(r.c[0]) === k).length;
      if (n === 0) throw new CsvColError('区分', `${k}がいません。1名登録してください。`);
      if (n > 1) throw new CsvColError('区分', `${k}は2名以上登録できません。1名にしてください。`);
    }
  };
}
/** E109：条件に当てはまらない列に値を入れた行はエラー */
function checkOff(e: Entity, d: FD, label: (n: string) => string) {
  const need = offNeed(e, d.values);
  for (const n of d.set) if (need[n]) throw new CsvColError(label(n), `${label(n)}は、${need[n]}のときだけ入力できます。`);
}
/** 年月（yyyy-mm）の列：画面の値（日付・「2026年3月（A1 …）」）から年月を取り、書くときは画面の値に戻す */
function ymCol<R extends Row>(c: Col<R>, to: (ym: string, c: Col<R>) => string): Col<R> {
  return {
    ...c, type: 'ym', opts: undefined,
    get: (r, x) => { const v = String(c.get?.(r, x) ?? ''); const m = /(\d{4})[-/年](\d{1,2})/.exec(v); return m ? `${m[1]}-${m[2].padStart(2, '0')}` : ''; },
    put: (d, v, x) => c.put?.(d, v === undefined ? v : to(String(v), c), x),
  };
}
const ownerOf = (r: Ctx['r'], id: string) => r.get<{ floor?: string; receiveWindows: never; deliveryNote: string }>('dm.org.branches', id);

const NAMES_CORP: Record<string, string> = {};
for (const n of ['郵便番号', '都道府県', '市区町村', '町名・番地', '建物等', '電話番号', 'FAX番号']) NAMES_CORP[`${n}（請求書に載る住所）`] = n;
NAMES_CORP['起算月（年払いのとき）'] = '起算月';

export const corps: CsvEntity<Corp, FD> = {
  id: 'corps', screen: '法人一覧', key: '法人ID', create: NEW_VIA_APPLY, listCsv: { subject: '法人' },
  list: (x) => contracts.queries.corps(x.r) as Corp[],
  /* 保存のあとの読み直し：全件の行を作り直さず、この1件だけ作る */
  independent: true,
  refind: (x, k) => { const cx = loadOrg(x.r); const c = cx.corps.find((y) => y.id === k); return c ? corpRow(x.r, cx, c) : undefined; },
  keyOf: (c) => c.id, nameOf: (c) => c.name,
  locked: provisional,
  children: contactsOf('corp'),
  childPut: putContacts('corp') as never,
  get cols() {
    return lazy('corp', () => {
      const f = formCols<Corp>('corp', ['法人ID']);
      const addr = ['郵便番号', '都道府県', '市区町村', '町名・番地', '建物等', '電話番号', 'FAX番号'].map((n): [string, string] => [n, `${n}（請求書に載る住所）`]);
      const remind: Col<Corp> = {
        label: 'ご注文のリマインド', opts: ['ON', 'OFF'],
        get: (c, x) => (x.r.get<{ orderReminder?: boolean }>('dm.org.corps', c.id)?.orderReminder === false ? 'OFF' : 'ON'),
        put: (d, v) => { d.remind = v === 'ON'; },
      };
      return arrange<Corp>(f, [
        { label: '法人ID', get: (c: Corp) => c.id },
        '法人名', '法人名（契約）', '法人名フリガナ', '請求先法人名', 'ES営業担当', '社内備考', remind, ...addr,
        '請求書発行リードタイム', '請求書の発行単位', '支払方法', '口座振替の手続きステータス', '支払サイクル', ['起算月', '起算月（年払いのとき）'], '入金期限', 'Bill One 発行先ID',
        ...contactCols<Corp>(),
        { label: '配下の拠点', ro: true, get: (c: Corp) => c.branchLabel },
        { label: '登録日時', ro: true, type: 'datetime' as const, get: (c: Corp) => c.registeredAt },
      ]);
    });
  },
  draftOf: draftOf('corp'),
  save: (x, d, cur) => {
    checkOff('corp', d, labelsOf(corps.cols as Col<Row>[], NAMES_CORP));
    /* 支払方法・支払サイクル・入金期限・Bill One 発行先ID は、請求先＝法人 の拠点があるときだけ（全拠点が「この拠点」なら入れられない） */
    const bill = ['支払方法', '支払サイクル', '入金期限', 'Bill One 発行先ID'].filter((n) => d.set.includes(n));
    if (bill.length && !(contracts.queries.branches(x.r, { corpId: cur!.id }) as Branch[]).some((b) => b.billTo === '法人')) {
      throw new CsvColError(bill[0], `${bill[0]}は、いずれかの拠点の請求先が「法人」のときだけ入力できます。`);
    }
    contracts.actions.save(x.r, { entity: 'corp', id: cur!.id, values: d.values, tables: d.tables });
    if (d.remind !== undefined) org.actions.setOrderReminder(x.r, { id: cur!.id, on: d.remind });
    return cur!.id;
  },
};

const BR_YM_START = (ym: string, c: Col<Branch>) => {
  const [y, m] = ym.split('-');
  const o = (c.opts ?? []).find((t) => t.startsWith(`${y}年${+m}月`));
  if (!o) throw new CsvColError(c.label, `${c.label}は選べる月ではありません（${ym}）。`);
  return o;
};

export const branches: CsvEntity<Branch, FD> = {
  id: 'branches', screen: '拠点一覧', key: '拠点ID', create: NEW_VIA_APPLY, listCsv: { subject: '拠点' },
  list: (x) => contracts.queries.branches(x.r) as Branch[],
  independent: true,
  refind: (x, k) => { const cx = loadOrg(x.r); const b = cx.branches.find((y) => y.id === k); return b ? branchRow(x.r, cx, b) : undefined; },
  keyOf: (b) => b.id, nameOf: (b) => b.name,
  locked: provisional,
  children: contactsOf('branch'),
  childPut: putContacts('branch') as never,
  impact: ['住所・受取の時間帯などは、これから作る配送に写ります（作った配送の届け先はそのまま）'],
  get cols() {
    return lazy('branch', () => {
      const f = formCols<Branch>('branch', ['拠点ID']);
      const startCycle = f.find((c) => c.label === '開始サイクル月');
      const floor: Col<Branch> = {
        label: '設置フロア', clear: true,
        get: (b, x) => ownerOf(x.r, b.id)?.floor ?? '',
        put: (d, v) => { d.floor = strOf(v); },
      };
      return arrange<Branch>(f, [
        { label: '拠点ID', get: (b: Branch) => b.id },
        { label: '所属法人ID', ro: true, get: (b: Branch) => b.corpId },
        { label: '所属法人名', ro: true, get: (b: Branch) => b.corpName },
        '旧ES ユーザーID', ['親契約番号', '親契約番号（契約ID）'], 'ログインID',
        { label: '登録日時', ro: true, type: 'datetime' as const, get: (b: Branch) => b.registeredAt },
        '拠点名', '拠点名フリガナ', '従業員数',
        ymCol(f.find((c) => c.label === '当初契約開始年月')!, (ym) => `${ym}-01`),
        '拠点ステータス', '棚卸報告', '基準数のパターン', '備考',
        '郵便番号', '都道府県', '市区町村', '町名・番地', '建物等', floor, '電話番号', 'FAX番号',
        '契約ステータス', ymCol(startCycle!, BR_YM_START),
        '契約終了日', 'お試し期間（月数）', '代理店コード（紹介有無）', '請求時備考（社内）',
        '請求先', '請求書発行リードタイムの上書き', '支払方法', '口座振替の手続きステータス', '支払サイクル', '起算月（年払いのとき）', '入金期限', 'Bill One 発行先ID',
        ...contactCols<Branch>(),
      ]);
    });
  },
  draftOf: draftOf('branch'),
  /* 契約終了日を直して、それより後の未確定の子契約が残るとき（W105）。E118・E53 は contracts.save が行エラーにする */
  warn: (b, a, x) => (a && b?.form?.['契約終了日'] !== a.form?.['契約終了日'] ? endOnWarnings(x.r, a.id) : []),
  save: (x, d, cur) => {
    checkOff('branch', d, labelsOf(branches.cols as Col<Row>[], { '親契約番号（契約ID）': '親契約番号' }));
    contracts.actions.save(x.r, { entity: 'branch', id: cur!.id, values: d.values, tables: d.tables });
    if (d.floor !== undefined) {
      const b = ownerOf(x.r, cur!.id);
      if (b) org.actions.updateReceive(x.r, { id: cur!.id, receiveWindows: b.receiveWindows, deliveryNote: b.deliveryNote, floor: d.floor });
    }
    return cur!.id;
  },
};

const CP = '親契約番号（契約ID）';
const START = '適用開始';
const NEW_CHILD = '新しい子契約は CSV では登録できません。拠点の「子契約を先まで作る」から作ってください。';
export const contractsEntity: CsvEntity<ChildContract, FD> = {
  /* 更新だけの取込（子契約CSV取込・台帳 F）：キー＝子契約ID。親契約番号・適用開始は参照の列（変えると E115）。保存は、その月から後ろの未確定の子契約にも当てる */
  id: 'contracts', screen: '子契約一覧', key: '子契約ID', create: NEW_CHILD, listCsv: { subject: '子契約' },
  list: (x) => contracts.queries.children(x.r) as ChildContract[],
  refind: (x, k) => {
    const cx = loadOrg(x.r);
    const kid = cx.children.find((y) => y.id === k);
    return kid ? childRow(x.r, cx, kid) : undefined;
  },
  keyOf: (k) => k.id, nameOf: (k) => `${k.branchName} ${k.month}`,
  /* 確定・請求済の子契約は、契約変更の受付の締切（オーダー締切）までなら画面の保存と同じに直せる。締切のあとは E54（行は取り込まない） */
  locked: (k, x) => {
    const d = x.r.get<DChild>('dm.org.childContracts', k.id);
    if (d && childLocked(d)) { const dl = deadlineOf(x.r, d.cycleMonth); if (dl.passed) return E54(dl); }
    return provisional(k);
  },
  impact: ['適用開始の月から後ろの、未確定の子契約にも同じ変更を当てます（確定・請求済の月は変えません）', '配送の流れ・プランの変更は、出荷の前の配送・注文にも反映します（契約の画面の保存と同じ）'],
  get cols() {
    return lazy('child', () => [
      { label: '子契約ID', get: (k: ChildContract) => k.id },
      { label: CP, ro: true, get: (k: ChildContract) => k.parentNo },
      { label: START, ro: true, type: 'ym' as const, get: (k: ChildContract) => k.month },
      { label: '拠点ID', ro: true, get: (k: ChildContract) => k.branchId },
      { label: '拠点名', ro: true, get: (k: ChildContract) => k.branchName },
      { label: '法人名', ro: true, get: (k: ChildContract) => k.corpName },
      { label: '請求の状態', ro: true, get: (k: ChildContract) => k.billStatus },
      { label: '当月請求額', ro: true, type: 'money' as const, get: (k: ChildContract) => k.amountYen },
      ...formCols<ChildContract>('child', [CP, '子契約ID', '契約・サイクル月']),
    ]);
  },
  draftOf: draftOf('child'),
  save: (x, d, cur) => {
    checkOff('child', d, labelsOf(contractsEntity.cols as Col<Row>[], {}));
    contracts.actions.save(x.r, { entity: 'child', id: cur!.id, values: d.values, tables: d.tables, scope: 'after' });
    return cur!.id;
  },
};

/* ===================================================================== */
/* メニュー作成依頼書（メニューの画面からの出力だけ・一方向。2026-10-05 台帳 F） */
/* ===================================================================== */

/** 列（台帳 F「メニュー作成依頼書」のとおり）。仕入れ値＝仕入価格×標準数（自動計算）、平均単価＝メニューの平均仕入単価（税抜・50プラン。全行に同じ値） */
export const MENU_REQUEST_HEADER = ['商品名', '画像の有無', '賞味期限', 'タグ', '販売価格（税込）', '仕入先', '仕入価格（税抜）', '標準数', '仕入れ値（＝仕入価格×標準数）', '平均単価（平均仕入単価・税抜）'];
const menuRequestRows = (x: Ctx): string[][] => {
  const { id, menu: m } = menuOf(x);
  if (!m) bad(`${id} のメニューがありません`);
  const prod = (pid: string) => x.r.get<Product>('dm.master.products', pid);
  const avg = avgCostOf(m!, prod);
  return m!.items.map((it) => {
    const p = prod(it.productId);
    const sup = p ? selectedSupplier(p) : undefined;
    const cost = costOn(sup), n = it.base.std;
    const supName = sup ? x.r.get<Account>('dm.account.accounts', sup.supplierId)?.name ?? sup.supplierId : '';
    return [
      p?.name ?? it.productId, p?.images.some((i) => i.main) ? 'あり' : 'なし', p ? shelfText(p) : '', it.tags.join(';'),
      String(unitPrice(x.r, id, it.productId)), supName, String(cost), String(n), String(cost * n), String(avg),
    ];
  });
};
export const menuRequest: CsvEntity = {
  id: 'menuRequest', screen: 'メニュー作成依頼書', key: '商品名', cols: [], list: () => [], keyOf: () => '',
  impact: ['メニューの画面からの出力だけです（取込はできません）。直すときはメニューを直して出力し直します'],
  custom: {
    head: () => MENU_REQUEST_HEADER,
    exportRows: menuRequestRows,
    run: () => bad('メニュー作成依頼書は出力だけです（取込はできません）'),
  },
};

/* ===================================================================== */
/* 月間メニュー（Phase 2 テンプレート：1行＝メニューの1商品）               */
/* ===================================================================== */

const menuOf = (x: Ctx) => {
  const id = x.scope.target ?? '';
  if (!/^\d{4}-\d{2}$/.test(id)) bad('取込先のメニュー（年月）がわかりません');
  return { id, menu: x.r.get<MonthlyMenu>('dm.order.menus', id) };
};
const menuRows = (x: Ctx, m: MonthlyMenu | undefined, id: string) => (m?.items ?? []).map((it, i) => {
  const p = x.r.get<Product>('dm.master.products', it.productId);
  return [id, String(i + 1), it.productId, p ? mgmtNameOf(p) : '', it.publishable ? '1' : '', it.tags.join(';'), String(it.base.std), String(it.base.ns), baseEligible('vm', p) ? String(it.base.vm) : '', it.sample ? '1' : ''];
});
export const menu: CsvEntity = {
  id: 'menu', screen: '月間メニュー', key: '品番', cols: [], list: () => [], keyOf: () => '',
  impact: ['ファイルの商品でメニューを入れ替えます（ファイルにない商品はメニューから外れます。エラーの行の商品は、すでにメニューにあればそのまま残ります）。基準注文数は CSV の値を「手で直した値」として持ちます', '公開中のメニューはすぐに反映します（自動注文は作り直し、登録済みの注文は変えません）'],
  custom: {
    head: () => MENU_CSV_HEADER,
    template: (x) => { const { id, menu: m } = menuOf(x); return menuRows(x, m, id); },
    exportRows: (x) => { const { id, menu: m } = menuOf(x); return menuRows(x, m, id); },
    run: (x, text, lines) => {
      const { id, menu: before } = menuOf(x);
      const res = opsMenu.actions.importCsv(x.r, { ym: id, csv: text, overwrite: true, notify: !!x.scope.opts?.notify });
      const fileErrors = res.errors.filter((e) => e.row <= 1).map((e) => e.message);
      const after = x.r.get<MonthlyMenu>('dm.order.menus', id);
      const old = new Map((before?.items ?? []).map((it, i) => [it.productId, { it, i }]));
      const rows: RowResult[] = lines.slice(1).map((l) => {
        const pid = (l.cells[2] ?? '').trim();
        const errs = res.errors.filter((e) => e.row === l.line);
        /* 年月が取込先と違う行は、その行もエラーにする（ファイル全体のエラー E132 とあわせて。「変更なし」とは見せない） */
        const ym = (l.cells[0] ?? '').trim();
        if (/^\d{4}-\d{2}$/.test(ym) && ym !== id) errs.push({ row: l.line, message: `年月は取込先のメニュー（${id}）と同じにしてください。（${ym}）` });
        const was = old.get(pid);
        const now = after?.items.findIndex((it) => it.productId === pid) ?? -1;
        const nowIt = now >= 0 ? after!.items[now] : undefined;
        const show = (it: MonthlyMenu['items'][number] | undefined, i: number) =>
          it ? `表示順 ${i + 1}・公開可能 ${it.publishable ? 1 : 0}・タグ ${it.tags.join(';') || '—'}・基準 ${it.base.std}/${it.base.ns}/${it.base.vm}・サンプル ${it.sample ? 1 : 0}` : '';
        const b = show(was?.it, was?.i ?? 0), a = show(nowIt, now);
        const action: RowResult['action'] = errs.length ? 'エラー' : !was ? '新規' : b === a ? '変更なし' : '更新';
        return rowResult(l.line, pid, x.r.get<Product>('dm.master.products', pid)?.name ?? '', action, {
          errors: errs.map((e) => ({ line: l.line, col: '—', msg: e.message })),
          warnings: res.warnings.filter((w) => w.row === l.line).map((w) => w.message),
          diff: action === '更新' || action === '新規' ? [{ col: 'メニューの商品', before: b, after: a }] : [],
        });
      });
      if (!res.ok && !fileErrors.length && !rows.some((r) => r.action === 'エラー')) fileErrors.push(...res.errors.map((e) => e.message));
      /* ファイル全体の警告・外れる商品は最初の行に */
      const gone = (before?.items ?? []).filter((it) => !lines.some((l) => (l.cells[2] ?? '').trim() === it.productId)).map((it) => it.productId);
      const general = [
        ...(before?.items.length ? [`${id} のメニューはすでにあります。取り込むと上書きします。${before.status === '公開中' ? `（公開中：法人へ再通知${x.scope.opts?.notify ? 'する' : 'しない'}）` : ''}`] : []),
        ...(gone.length ? [`CSVにない商品（${gone.join('・')}）はメニューから外れます。`] : []),
        ...res.warnings.filter((w) => w.row <= 1).map((w) => w.message),
      ];
      if (rows[0]) rows[0].warnings.unshift(...general);
      return { fileErrors, rows };
    },
  },
};

/* ===================================================================== */
/* 入荷登録（発注ごとに入荷した数・箱数。1つのファイルで多くの発注）          */
/* ===================================================================== */

type Rcv = { po: PoLike; st: ReturnType<typeof poReceiving> };
type RcvD = { qty?: number; box?: number; on?: string; bb?: string; note?: string };
const pname = (x: Ctx, id: string) => x.r.get<Product>('dm.master.products', id)?.name ?? x.r.get<{ name: string }>('dm.master.materials', id)?.name ?? id;
const rcvState = (st: Rcv['st']) => (st.open ? '差異あり・対応待ち' : st.closed ? '入荷済' : st.nextOn ? '分納待ち' : '未入荷');
const todayIso = () => today();
export const receiving: CsvEntity<Rcv, RcvD> = {
  id: 'receiving', screen: '入荷登録', key: '発注番号', create: '発注番号を入れてください（入荷は発注ごとに登録します）',
  list: (x) => knownOrders(x.r).filter((o) => o.hon > 0 && !['キャンセル', '受注不可'].includes(o.ans)).map((po) => ({ po, st: poReceiving(x.r, po) })),
  keyOf: (r) => r.po.no, nameOf: (r) => r.po.pid,
  locked: (r) => (r.st.closed ? 'この発注の入荷はもう終わっています' : r.st.open ? '差異の対応が決まっていない入荷があります。入荷登録の画面で対応を選んでください' : r.st.receipts.length >= SPLIT_MAX ? `分納は${SPLIT_MAX}回までです` : null),
  impact: ['発注の数（分納の2回目からは残り）と違う数は「差異あり・対応待ち」で保存します。入荷登録の画面で対応（分納を待つ／代替品で対応／不足を受け入れる）を選んでください', '入荷した数は倉庫在庫・代替品設定の在庫の見込みに入ります'],
  cols: [
    { label: '発注番号', get: (r) => r.po.no },
    { label: '品番', ro: true, get: (r) => r.po.pid },
    { label: '商品名', ro: true, get: (r, x) => pname(x, r.po.pid) },
    { label: '仕入先ID', ro: true, get: (r) => r.po.sup },
    { label: '納入倉庫', ro: true, get: (r) => r.po.wh },
    { label: '予定の数', ro: true, type: 'int', get: (r) => r.st.remain },
    { label: '入荷済みの数', ro: true, type: 'int', get: (r) => r.st.got },
    { label: '回', ro: true, get: (r) => `${r.st.part}/${SPLIT_MAX}` },
    { label: '入荷の状態', ro: true, get: (r) => rcvState(r.st) },
    { label: '入荷した数', type: 'int', reqAlways: true, put: (d, v) => { d.qty = Number(v); } },
    { label: '箱数', type: 'int', reqAlways: true, put: (d, v) => { d.box = Number(v); } },
    { label: '入荷日', type: 'date', put: (d, v) => { d.on = strOf(v); } },
    /* どの商品でも必須（資材は持たない・受付簿 #130）。出力・テンプレートには仕入先が本発注の承認で入れた期限を初期値として出す */
    { label: '賞味期限／消費期限', ro: true, type: 'date', get: (r) => defaultBb(r.po, r.st.receipts.length) },
    { label: 'メモ', max: 200, put: (d, v) => { d.note = strOf(v); } },
  ],
  draftOf: () => ({}),
  save: (x, d, cur) => {
    const o = cur!.po;
    const out = receive(x.r, { po: o, poNo: o.no, qty: d.qty!, box: d.box!, receivedOn: d.on || todayIso(), bb: defaultBb(o, cur!.st.receipts.length), note: d.note, by: x.by });
    return { key: o.no, follow: out.closePo ? { kind: 'closePo', payload: { no: o.no, date: d.on || todayIso() } } : undefined };
  },
  warn: (b, a) => (a?.st.open ? [`予定（${b?.st.remain ?? 0}）と違う数のため「差異あり・対応待ち」で保存します`] : []),
  sample: (x) => receiving.list(x).filter((r) => !r.st.closed && !r.st.open).slice(0, 2).map((r) => ({ 発注番号: r.po.no, 入荷した数: String(r.st.remain), 箱数: '1', 入荷日: '', '賞味期限／消費期限': defaultBb(r.po, r.st.receipts.length) })),
};

/* ===================================================================== */
/* 在庫の記録（足すだけ。直す・消すは画面にもない）                         */
/* ===================================================================== */

type MoveD = { wh: string; pid: string; kind: string; dir: string; qty: number; date: string; reason: string };
export const stockMoves: CsvEntity<StockMove, MoveD> = {
  id: 'stockMoves', screen: '在庫の記録', key: '記録番号', create: true,
  list: (x) => x.r.list<StockMove>('dm.stock.moves').filter((m) => m.item === '商品'),
  keyOf: (m) => m.id, nameOf: (m) => m.itemId,
  locked: () => '登録した在庫の記録は直せません（打ち消す記録を足してください）',
  impact: ['倉庫在庫（見込み）に、その日から反映します'],
  cols: [
    { label: '記録番号', hint: '空欄＝新規（足すだけ）', get: (m) => m.id },
    { label: '日付', type: 'date', reqNew: true, get: (m) => m.on, put: (d, v) => { d.date = strOf(v); } },
    { label: '倉庫ID', reqNew: true, optsOf: (x) => x.r.list<Warehouse>('dm.master.warehouses').filter((w) => w.type === 'picking').map((w) => w.id), get: (m) => m.warehouseId, put: (d, v) => { d.wh = strOf(v); } },
    { label: '倉庫名', ro: true, get: (m, x) => x.r.get<Warehouse>('dm.master.warehouses', m.warehouseId)?.name ?? '' },
    { label: '品番', reqNew: true, optsOf: (x) => x.r.list<Product>('dm.master.products').filter((p) => p.status !== '削除済').map((p) => p.id), get: (m) => m.itemId, put: (d, v) => { d.pid = strOf(v); } },
    { label: '商品名', ro: true, get: (m, x) => pname(x, m.itemId) },
    { label: '区分', reqNew: true, opts: WS_KINDS, get: (m) => m.kind, put: (d, v) => { d.kind = strOf(v); } },
    { label: '増減', reqNew: true, opts: ['増える', '減る'], get: (m) => (m.qty >= 0 ? '増える' : '減る'), put: (d, v) => { d.dir = strOf(v); } },
    { label: '数量', type: 'int', reqNew: true, min: 1, get: (m) => Math.abs(m.qty), put: (d, v) => { d.qty = Number(v); } },
    { label: '理由', reqNew: true, max: 200, get: (m) => m.reason, put: (d, v) => { d.reason = strOf(v); } },
    { label: '登録者', ro: true, get: (m) => m.by },
    { label: '登録日時', ro: true, type: 'datetime', get: (m) => m.at },
  ],
  newDraft: () => ({ wh: '', pid: '', kind: '', dir: '減る', qty: 0, date: '', reason: '' }),
  save: (x, d) => String(purchasing.actions.addStockRec(x.r, { wh: d.wh, pid: d.pid, kind: d.kind, dir: d.dir, qty: d.qty, date: d.date, reason: d.reason })),
  sample: () => [{ 日付: '2026-10-05', 倉庫ID: 'WH00001', 品番: 'M002', 区分: 'NG品ロス', 増減: '減る', 数量: '2', 理由: '（例）検品で容器の破損' }],
};

export const _cellText = cellText;
