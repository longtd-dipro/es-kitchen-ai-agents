import type { DocRepo } from '@/lib/ops/core/area';
import { closeOf, cycleStart, effectiveStart } from '@/lib/domain/lifecycle';
import { addYm } from '@/lib/domain/menu';
import { TRIAL_DISCOUNT } from '@/lib/domain/charges';
import { addDays, today } from '@/lib/supplier/dates';
import type { Application, Branch, Channel, Contract, Corp, Discount, Model, NewSetup, Plan, SetupBranch } from '@/lib/domain/types';
import type { Block, FieldDef, IntakeCfg, Logistics, TabDef, TableRow, TargetDef } from './types';
import { channelsToRdef } from './intake';
import type { IntakeRow } from './types';
import type { OpsState } from './fromDomain';

/*
 * 受付画面（申込内容確認〜詳細情報設定）の中身を、申込の実データから作る（台帳 運営A 2026-10-06 (2)・Q13：見本テンプレートの固定データをやめる）。
 * 画面の「形」（タブ・欄・ダイアログの文言）はテンプレート（intake-samples.json。種別ごと）を使うが、
 * 法人・拠点・担当者・住所・プラン・配送・設備・料金・ID は申込の受付の中身（setupOf）と共通データから入れる。
 * 申込にないテンプレートの固定の値（みらい商事・東京本社・CU00681…）は scrub で消す。
 */

const esc = (x: unknown) => String(x ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const idc = (id: string) => `<span class="idc">${esc(id)}</span>`;
const bg = (c: string, t: string) => `<span class="bg ${c}">${esc(t)}</span>`;
const ymJa = (ym: string) => (ym ? `${+ym.slice(0, 4)}年${+ym.slice(5, 7)}月` : '');
/** 法人名を頭に付けた拠点名から、法人名を外す */
const shortName = (name: string, company: string) => (company && name.startsWith(company + ' ') ? name.slice(company.length + 1) : name);

/** テンプレートに残る見本の固定の値（これを含む欄・行は消す） */
const CANNED = /CU\d{5}|CP\d{7}|¥\d|\d{4}[/年]\d{1,2}[/月]|サンプル|みらい商事|東京本社|大阪支店|福岡営業所|名古屋本社|京都支店|山田 太郎|木村 誠|鈴木 花子|田村 健|BO-20|日本橋|@example\.|mirai-sample|ES0000\d\d|佐々木 桜/;
const canned = (x: unknown) => typeof x === 'string' && CANNED.test(x);
const cellStr = (c: unknown) => (c && typeof c === 'object' ? String((c as { t?: unknown }).t ?? '') : String(c ?? ''));

/** 共通データの値の入れ先（key → 値）。sel の値が選択肢にないときは選択肢に足す */
type Patch = Record<string, string>;
function patchTab(tb: TabDef, p: Patch, lockKeys: string[] = []) {
  tb.blocks.forEach((b) => {
    if (b.b !== 'fields') return;
    b.items.forEach((f) => {
      if (f.key in p) {
        const v = p[f.key];
        f.value = v;
        if (f.type === 'sel' && v && !(f.opts ?? []).some((o) => (typeof o === 'object' ? o.v : o) === v)) f.opts = [...(f.opts ?? []), v];
      }
      if (lockKeys.includes(f.key)) { f.type = 'ro'; f.lock = true; }
    });
  });
}
/** テンプレートの見本の固定の値を消す（欄の値・説明・表の行・合計の説明） */
function scrubBlocks(blocks: Block[]) {
  blocks.forEach((b) => {
    if (b.b === 'fields') {
      b.items.forEach((f: FieldDef) => {
        if (canned(f.value)) f.value = f.type === 'ro' ? '' : '';
        if (canned(f.hint)) f.hint = undefined;
        if (f.type === 'sel' && Array.isArray(f.opts) && f.value && !f.opts.some((o) => (typeof o === 'object' ? o.v : o) === f.value)) f.value = '';
      });
    } else if (b.b === 'table') {
      b.rows = (b.rows ?? []).filter((r) => !(Array.isArray(r) ? r : r.cells).some((c) => canned(cellStr(c))));
    } else if (b.b === 'kv') {
      b.items = b.items.filter((x) => !canned(x[1]));
    } else if (b.b === 'files') {
      b.rows = [];
    } else if (b.b === 'tot') {
      b.value = '¥0'; b.unit = '';
    }
  });
}

type Ctx = {
  r: DocRepo; app: Application; setup: NewSetup; view: { branches: { missing: string[]; ready: boolean; trial: boolean }[] };
  corp?: Corp; plans: Plan[]; models: Model[]; lg: Logistics; kubun: string; trial: boolean; cycStart: string;
};

const courseShort = (c: string) => c;
const planLabel = (cx: Ctx, b: SetupBranch) => {
  const p = cx.plans.find((x) => x.id === b.planId);
  return b.planId ? `${b.planId} ${p?.name ?? ''}${b.course ? `（${courseShort(b.course)}）` : ''}`.trim() : '—';
};
const ship = (b: SetupBranch, cx: Ctx) => b.channels[0]?.serviceForm ?? (cx.app.request.find((x) => x[0] === '配送')?.[1].split('・')[0] ?? '');
const addrText = (a: { zip?: string; pref: string; city: string; addr1: string; addr2: string }) => `${a.pref}${a.city}${a.addr1}${a.addr2 ? ` ${a.addr2}` : ''}`.trim();
const reqOf = (app: Application, k: string) => app.request.find((x) => x[0] === k)?.[1] ?? '';
const modelName = (cx: Ctx, id: string) => cx.models.find((m) => m.id === id)?.name ?? id;
const equipHtml = (cx: Ctx, b: SetupBranch) => (b.equipment.length ? b.equipment.map((e) => `${idc(e.modelId)} ${esc(modelName(cx, e.modelId))}${e.qty > 1 ? ` × ${e.qty}` : ''}`).join('<br>') : '—');
const stageBadge = (st: string) => bg(st === '本登録' || st === '正式登録' ? 'grn' : st === '取消' ? 'mut' : 'amb', st || '未登録');

function staffRows(c: { name: string; email: string; tel: string }): string[][] {
  if (!c.name.trim()) return [['メイン担当者', '', '', '', '']];
  return [['メイン担当者', c.name, '', c.email, c.tel], ['請求担当者', c.name, '', c.email, c.tel]];
}

/** 料金・請求タブの①固定額の表の行（プランの基本料金。お試しはお試しキャンペーン割引を引く） */
function feeRows(cx: Ctx, b: SetupBranch, period: string): TableRow[] {
  const plan = cx.plans.find((x) => x.id === b.planId);
  const base = plan?.prices.find((x) => x.course === b.course)?.monthlyYen ?? 0;
  const rows: TableRow[] = [];
  if (base) rows.push([1, `${plan?.name ?? ''}（${b.course}） 基本料金`, '月額料金', period, { t: `¥${base.toLocaleString('ja-JP')}`, c: 'r' }, '10%', 'plan']);
  if (cx.trial && base) {
    const d = cx.r.get<Discount>('dm.master.discounts', TRIAL_DISCOUNT);
    const v = d?.calcKind === 'rate' ? Math.round(base * (d.ratePct ?? 0) / 100) : Math.min(base, d?.amountYen ?? base);
    rows.push([2, `${d?.name ?? 'お試しキャンペーン割引'}（${TRIAL_DISCOUNT}）`, '値引き', period, { t: `−¥${v.toLocaleString('ja-JP')}`, c: 'r' }, '—', 'discount']);
  }
  return rows;
}

/** 拠点1つ分の受付の対象（詳細情報設定のタブ・申込内容の表）を、申込の中身で作る */
function targetFor(cx: Ctx, tpl: TargetDef, j: number): TargetDef {
  const t = structuredClone(tpl) as TargetDef;
  const b = cx.setup.branches[j], v = cx.view.branches[j];
  const company = cx.app.companyName;
  const name = shortName(b.name, company) || b.name;
  const kubunLabel = cx.kubun === 'お試し' ? 'お試しキャンペーン' : cx.kubun === '切替' ? '切替' : '本導入';
  const st = cx.setup.startCycle;
  const a1 = cycleStart(cx.r, st), end = addDays(cycleStart(cx.r, addYm(st, 1)), -1);
  const period = `${a1}〜${end.slice(5)}`;
  const br = b.branchId ? cx.r.get<Branch>('dm.org.branches', b.branchId) : undefined;
  const ct = b.contractId ? cx.r.get<Contract>('dm.org.contracts', b.contractId) : undefined;
  const corpName = cx.corp?.name ?? cx.setup.corp?.name ?? company;
  t.no = `拠点${j + 1}`; t.name = name; t.sub = planLabel(cx, b); t.applyDate = ymJa(st);
  t.line = [planLabel(cx, b), `${ymJa(st)}サイクル`, ship(b, cx)];
  t.badges = [{ t: kubunLabel, c: cx.kubun === 'お試し' ? 'pur' : 'blue' }, { t: b.billTo === 'この拠点' ? '請求先＝この拠点' : '請求先＝法人', c: 'mut' }];
  t.confirmNote = '';
  t.planStd = undefined;
  t.reg = { stage: b.stage, done: b.stage === '本登録', missing: v?.missing ?? [], ready: !(v?.missing ?? []).length, branchId: b.branchId, contractId: b.contractId };
  /* 本登録の確認のダイアログに出す：確定前 → 確定後 */
  t.confirmRows = [
    ['法人情報', corpName, cx.corp?.status ?? '（仮登録で作成）', cx.corp?.status === '正式登録' ? '正式登録' : '正式登録（最初の拠点の本登録で）'],
    ['拠点情報', name, '仮登録', '本登録'],
    ['親契約', ct ? `${ct.id}（${kubunLabel}）` : kubunLabel, '仮登録', '有効'],
    ['子契約', cx.trial ? `お試し ${1}か月分` : `${ymJa(st)}サイクル〜`, '（本登録で作成）', '請求ステータス 未確定'],
  ];
  t.sections = [
    { title: '契約・プラン（申込内容）', kv: [['契約種別', kubunLabel], ['プラン', b.planId ? `${idc(b.planId)} ${esc(cx.plans.find((x) => x.id === b.planId)?.name ?? '')}` : ''], ['コース', b.course], ['開始サイクル月（希望）', ymJa(st)]] },
    { title: '配送（申込内容）', kv: [['配送区分', ship(b, cx)], ['納品回数（合計）', b.channels.length ? `月${b.channels.reduce((n, c) => n + c.slots.length, 0)}回` : ''], ['納品不可曜日', reqOf(cx.app, `納品不可曜日（拠点${j + 1}）`)], ['配送備考', esc(b.deliveryNote)]] },
    { title: '設備（申込時の希望）', kv: [['設備', equipHtml(cx, b)]] },
    { title: '拠点・納品先', kv: [['拠点名', esc(b.name)], ['郵便番号', b.address.zip], ['住所', esc(addrText(b.address))], ['電話番号', b.tel], ['メイン担当者', b.contact.name ? `${esc(b.contact.name)}${b.contact.email ? `<br>${esc(b.contact.email)}` : ''}` : ''], ['設置フロア', esc(b.floor ?? '')]] },
  ];

  /* 配送ルート（配送回数の標準はプランのコース・便があれば便から）。画面の入力は共通データの便と同じもの */
  const plan = cx.plans.find((x) => x.id === b.planId);
  const lim = (temp: '冷蔵' | '冷凍') => plan?.limits?.find((x) => x.course === b.course && x.temp === temp)?.deliveries;
  const std = lim('冷蔵') != null ? { c: lim('冷蔵')!, f: lim('冷凍') } : null;
  t._rdef = channelsToRdef(b.channels, std, cx.lg);
  t.planStd = std ?? undefined;

  const stateOf = br?.status ?? '（仮登録で作成）';
  const corpStatus = cx.corp?.status ?? '（仮登録で作成）';
  const ch0: Channel | undefined = b.channels[0];
  void ch0;
  const planOpts = cx.plans.filter((x) => x.status === '有効').map((x) => ({ v: x.id, t: `${x.id}　${x.name}` }));
  const courseOpts = (plan?.prices ?? []).map((x) => x.course);
  const corpSrc = cx.corp ?? (cx.setup.corp ? { name: cx.setup.corp.name, kana: cx.setup.corp.kana, address: cx.setup.corp.address, tel: cx.setup.corp.tel, billing: undefined } : undefined);
  const salesName = cx.corp ? cx.r.get<{ name: string }>('dm.account.accounts', cx.corp.salesRepId)?.name ?? '' : reqOf(cx.app, 'ES営業担当');
  const bl = cx.corp?.billing;
  const leadLabel = (n: number) => ({ '-3': '3ヶ月前（−3）', '-2': '2ヶ月前（−2）', '-1': '1ヶ月前（−1）', '0': '当月（0）', '1': '翌月（+1・後払い）' } as Record<string, string>)[String(n)] ?? '';

  t.tabs.forEach((tb) => {
    scrubBlocks(tb.blocks);
    switch (tb.key) {
      case 'corp':
        patchTab(tb, {
          cn: corpSrc?.name ?? corpName, ckana: corpSrc?.kana ?? '', ccn: cx.corp?.contractName ?? corpName, cbill: cx.corp?.billToName ?? reqOf(cx.app, '請求先法人名') ?? corpName, ces: salesName,
          cst: stageBadge(corpStatus), cid: cx.corp ? idc(cx.corp.id) : '（仮登録で採番）',
          czip: corpSrc?.address.zip ?? '', cpref: corpSrc?.address.pref ?? '', ccity: corpSrc?.address.city ?? '', cad1: corpSrc?.address.addr1 ?? '', cad2: corpSrc?.address.addr2 ?? '', ctel: corpSrc?.tel ?? '',
          ...(bl ? { cunit: bl.invoiceUnit, clead: leadLabel(bl.lead), cdue: bl.dueRule, cpay: bl.payMethod, cdebit: bl.debitStatus, ccyc: bl.payCycle } : {}), cbo: '',
        }, ['ces']);
        break;
      case 'br':
        patchTab(tb, {
          bn: b.name, bkana: b.kana, co: cx.corp ? `${idc(cx.corp.id)} ${esc(cx.corp.name)}` : esc(corpName), emp: b.employees ? String(b.employees) : '', bst: stageBadge(stateOf),
          bid: br ? idc(br.id) : '（仮登録で採番）', zip: b.address.zip, pref: b.address.pref, city: b.address.city, ad1: b.address.addr1, ad2: b.address.addr2, tel: b.tel,
        });
        break;
      case 'bill':
        patchTab(tb, { billto: b.billTo, bbo: '' });
        break;
      case 'ct':
        patchTab(tb, {
          cno: ct ? idc(ct.id) : '（仮登録で採番）', kind: kubunLabel, cst: stageBadge(ct?.status ?? '（仮登録で作成）'),
          start: ymJa(st), startd: `${ymJa(st)}（開始サイクル月）`, trial: cx.trial ? 'お試し 1ヶ月（延長は運営だけ）' : '—', pen: '—', nextgen: '—', stat: '—', agent: '（紹介なし）',
        }, ['start']);
        break;
      case 'mc':
        patchTab(tb, {
          mno: ct ? `${idc(`${ct.id}-${st.replace('-', '')}`)}` : '（本登録で採番）', cyc: `<b>${ymJa(st)}</b>`, gen: `A1 <b>${a1}</b>`,
          plan: b.planId, course: b.course, tfrom: a1, tto: end, inherit: '—', ship: ship(b, cx), dnote: b.deliveryNote, ng: reqOf(cx.app, `納品不可曜日（拠点${j + 1}）`), memo: '', anote: '—',
        });
        tb.blocks.forEach((x) => {
          /* 配送ルートの表は、共通データの便から作った行に置き換える（prepareCfg がこの表の行を配送ルートの元にする） */
          if (x.b === 'table' && /配送ルート/.test(x.title ?? '')) x.rows = t._rdef ?? [];
          if (x.b !== 'fields') return;
          x.items.forEach((f) => {
            if (f.key === 'plan') f.opts = planOpts;
            if (f.key === 'course') f.opts = courseOpts;
          });
        });
        break;
      case 'fee': {
        const rows = feeRows(cx, b, period);
        patchTab(tb, { pm: cx.corp?.billing.payMethod ?? '—', pc: cx.corp?.billing.payCycle ?? '—', st1: period, bm1: `<b>${ymJa(addYm(st, -1))}</b>` });
        tb.blocks.forEach((x) => {
          if (x.b === 'table' && (x.head ?? []).map((h) => (typeof h === 'object' ? h.t : h)).join().includes('料金項目')) x.rows = rows;
          if (x.b === 'tot') { x.value = `¥${rows.reduce((n, r) => n + (parseInt(cellStr((Array.isArray(r) ? r : r.cells)[4]).replace(/[^\d]/g, ''), 10) || 0) * (/−/.test(cellStr((Array.isArray(r) ? r : r.cells)[4])) ? -1 : 1), 0).toLocaleString('ja-JP')}`; x.unit = ''; }
        });
        break;
      }
      case 'eq':
        patchTab(tb, {
          comp: b.equipment.map((e) => `${esc(modelName(cx, e.modelId))}${e.qty > 1 ? ` × ${e.qty}` : ''}`).join('・') || '—', auto: '—',
          eff: [...b.optionIds, ...b.discountIds].join('・') || 'なし',
        });
        tb.blocks.forEach((x) => {
          if (x.b === 'table' && x.edit && (x.head ?? []).join().includes('機種')) {
            x.rows = b.equipment.map((e): TableRow => {
              const m = cx.models.find((y) => y.id === e.modelId);
              return ['新規貸出', '（新規）', m?.category ?? '', `${idc(e.modelId)} ${esc(m?.name ?? e.modelId)}`, e.qty, '', '—'];
            });
          }
        });
        break;
      case 'sw': {
        /* お試し→本導入の切替：親契約の契約種別の期間は共通データの履歴から */
        tb.blocks = tb.blocks.filter((x) => x.b !== 'table' || !(x.head ?? []).includes('開始'));
        tb.blocks.forEach((x) => {
          if (x.b === 'fields') x.items.forEach((f) => { if (f.key === 'endst') f.value = ct ? `親契約 ${idc(ct.id)} は<b>そのまま</b>（契約種別が本導入になる）。お試しの子契約はそのまま履歴に残す（削除しない）` : '親契約はそのまま（契約種別が本導入になる）'; });
        });
        if (ct) {
          tb.blocks.splice(1, 0, { b: 'h', text: `契約種別の期間（親契約 ${ct.id}）` }, {
            b: 'table', head: ['契約種別', '親契約番号', '開始', '終了'],
            rows: ct.kindHistory.map((h, k, a): TableRow => [h.kind, { t: idc(ct.id), c: '' }, h.from, a[k + 1] ? addYm(a[k + 1].from, -1) : '—（自動更新）']),
          });
        }
        break;
      }
      default:
    }
    /* 担当者の表（法人・拠点） */
    tb.blocks.forEach((x) => {
      if (x.b === 'table' && (x.head ?? [])[0] === '区分' && (x.head ?? [])[1] === '担当者名') {
        x.rows = staffRows(tb.key === 'corp' ? (corpSrc && cx.setup.corp ? cx.setup.corp.contact : cx.corp ? contactOfCorp(cx) : { name: '', email: '', tel: '' }) : b.contact);
      }
    });
  });
  /* 法人のタブは最初の拠点だけ（見本も同じ） */
  if (j > 0) t.tabs = t.tabs.filter((x) => x.key !== 'corp');
  /* 詳細情報設定のタブは6つ：法人／拠点／親契約／子契約／設備・オプション／料金・請求。契約種別の切替は親契約のタブの先頭（台帳 運営A Q2） */
  const sw = t.tabs.find((x) => x.key === 'sw'), ctab = t.tabs.find((x) => x.key === 'ct');
  if (sw && ctab) { ctab.blocks = [...sw.blocks, ...ctab.blocks]; t.tabs = t.tabs.filter((x) => x !== sw); }
  const order = ['corp', 'br', 'ct', 'mc', 'eq', 'fee', 'at'];
  t.tabs.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return t;
}
const contactOfCorp = (cx: Ctx) => {
  const c = cx.r.list<{ owner: { type: string; id: string }; kind: string; name: string; email: string; tel: string }>('dm.org.contacts').find((x) => x.owner.type === 'corp' && x.owner.id === cx.corp?.id && x.kind === 'メイン担当者');
  return { name: c?.name ?? '', email: c?.email ?? '', tel: c?.tel ?? '' };
};

export type RealInput = {
  r: DocRepo; app: Application; row: IntakeRow; tpl: IntakeCfg; st?: OpsState; opsName: string;
  view: { setup: NewSetup; status: string; branches: { missing: string[]; ready: boolean; trial: boolean }[] };
  lg: Logistics; plans: Plan[]; models: Model[];
};

/** 締切後の開始月の扱い：受付中で開始サイクルのオーダー締切を過ぎているときだけ、運営が2択から選ぶ（選んでいなければ繰り下げ）。仮登録のあとは「申請情報」に選んだ内容を出す */
function lateOf(r: DocRepo, app: Application, setup: NewSetup): IntakeCfg['late'] {
  if (app.status !== '受付中') return undefined;
  const start = setup.startCycle || app.startCycle, close = closeOf(r, start);
  if (today() <= close) return undefined;
  return { value: setup.late ?? '繰り下げ', choose: true, close, shift: effectiveStart(r, start), start };
}

/** 申込の実データから受付画面の定義（IntakeCfg）を作る */
export function realCfg(x: RealInput): IntakeCfg {
  const { r, app, row, view } = x;
  const setup = view.setup;
  const corp = app.corpId ? r.get<Corp>('dm.org.corps', app.corpId) : undefined;
  const kubun = app.kubun || '本導入';
  const cx: Ctx = { r, app, setup, view, corp, plans: x.plans, models: x.models, lg: x.lg, kubun, trial: kubun === 'お試し', cycStart: cycleStart(r, setup.startCycle) };
  const tpl = structuredClone(x.tpl) as IntakeCfg;
  const tplT = (j: number) => tpl.targets[Math.min(j, tpl.targets.length - 1)];
  const targets = setup.branches.map((_, j) => targetFor(cx, tplT(j), j));
  const n = targets.length;
  const names = targets.map((t) => t.name);
  const corpName = corp?.name ?? setup.corp?.name ?? app.companyName;
  const applicantName = reqOf(app, '申込者') || app.requestedBy.name;
  const via = app.proxy ? bg('mut', `運営の代理入力（${x.st?.route ?? app.requestedBy.name}）`) : app.requestedBy.site === 'public' ? bg('mut', 'ログインなしで申込') : bg('mut', 'ログイン中のアカウント');
  const cps = setup.branches.map((b) => b.contractId).filter(Boolean);
  const kubunBadge = kubun === 'お試し' ? bg('pur', 'お試しキャンペーン') : kubun === '切替' ? bg('blue', 'お試し → 本導入の切替') : bg('blue', '本導入の新規申込');

  const out: IntakeCfg = {
    ...tpl,
    apNo: row.no, apDate: row.date.replace(/\//g, '-'), companyName: app.companyName, opUser: x.opsName,
    routeCarry: true, acctIssued: setup.branches.some((b) => b.stage !== ''),
    done: app.status === '完了',
    mainHeading: `拠点別の申込内容（${n}拠点）`,
    summary: [
      { l: '申込区分', v: kubunBadge },
      { l: '法人', v: `${esc(corpName)} ${corp ? idc(corp.id) : bg('mut', '新しい法人')}` },
      { l: '申込者', v: `${esc(applicantName)} ${via}` },
      { l: kubun === '切替' ? '対象拠点' : '拠点数', v: `${n}拠点` },
      { l: '親契約', v: cps.length ? esc(cps.join('・')) : '仮登録で採番' },
      { l: '子契約', v: kubun === 'お試し' ? '本登録でお試し期間（1ヶ月）ぶんを作成' : '本登録で作成' },
      ...(row.es ? [{ l: 'ES営業担当', v: esc(row.es) }] : []),
      ...(setup.late && app.status !== '受付中' ? [{ l: '締切後の開始月の扱い', v: `${setup.late === '代理' ? '運営が代理でオーダーする' : '開始月を翌サイクルへ繰り下げる'}（${ymJa(setup.startCycle)}サイクルから開始）` }] : []),
    ],
    targets,
    orderClose: app.status === '受付中' ? closeOf(r, setup.startCycle) : undefined,
    late: lateOf(r, app, setup),
    preBlocks: [{
      b: 'html',
      html: `<div class="card acc"><h2>拠点別の開始スケジュール</h2><div class="pad"><div class="scrollx"><table class="t"><thead><tr><th>拠点</th><th>契約開始年月（開始サイクル月）</th><th>サイクル初日（A1・月曜）</th><th>親契約</th></tr></thead><tbody>${
        setup.branches.map((b, j) => `<tr><td><b>${esc(names[j])}</b>${b.branchId ? `<br>${idc(b.branchId)}` : ''}</td><td><b>${ymJa(setup.startCycle)}</b></td><td>${cx.cycStart}</td><td>${b.contractId ? idc(b.contractId) : '仮登録で採番'}</td></tr>`).join('')
      }</tbody></table></div></div></div>`,
    }],
    side: {
      contacts: [
        ...(corp || setup.corp ? [{ ...(setup.corp?.contact ?? contactOfCorp(cx)) }].map((c) => ({ name: c.name, kana: '', at: '法人', appl: true, mail: c.email, tel: c.tel, role: 'メイン担当者' })) : []),
        ...setup.branches.map((b, j) => ({ name: b.contact.name, kana: '', at: names[j], same: !!b.contact.name && b.contact.name === (setup.corp?.contact.name ?? ''), mail: b.contact.email, tel: b.contact.tel, role: 'メイン担当者' })),
      ].filter((c) => c.name),
      company: {
        existing: !!corp,
        rows: corp
          ? [['法人名', esc(corp.name)], ['法人ID', idc(corp.id)], ['法人名フリガナ', esc(corp.kana)], ['請求先法人名', esc(corp.billToName)], ['請求書に載る住所', esc(addrText(corp.address))], ['電話番号', esc(corp.tel)], ['法人ステータス', stageBadge(corp.status)]]
          : [['法人名', esc(setup.corp?.name ?? corpName)], ['法人名フリガナ', esc(setup.corp?.kana ?? '')], ['請求先法人名', esc(reqOf(app, '請求先法人名') || corpName)], ['請求書に載る住所', esc(setup.corp ? addrText(setup.corp.address) : '')], ['電話番号', esc(setup.corp?.tel ?? '')], ['法人ステータス', stageBadge('仮登録')]],
      },
      billing: corp ? [['請求書の発行単位', corp.billing.invoiceUnit], ['支払方法', corp.billing.payMethod], ['支払サイクル', corp.billing.payCycle], ['入金期限', corp.billing.dueRule]] : undefined,
      extra: undefined,
    },
    modalB: {
      ...tpl.modalB,
      desc: `申込内容から ${corp ? '' : '法人・'}拠点・親契約 を仮登録します。`,
      notes: ['子契約・配送データは<b>本登録</b>（拠点ごと）で作ります。仮登録では、拠点・親契約・アカウント・最初のオーダー・資材の初期セットを作ります。', 'この時点では<b>正式な契約にはなりません</b>。法人・拠点・親契約は「仮登録」のままです。'],
      countsTitle: '仮登録の対象',
      counts: [...(corp ? [] : [{ l: '法人情報', v: '1' }]), { l: '拠点情報', v: String(n) }, { l: '親契約', v: String(n), cls: 'acc2' }],
      check: tpl.modalB.check && { ...tpl.modalB.check, to: mailTo(cx, names), toNote: '' },
    },
    modalC: {
      ...tpl.modalC,
      desc: `${kubun === 'お試し' ? 'お試しキャンペーンの契約' : '契約'}を仮登録し、最初のオーダーと資材のオーダー（初期セット）を作りました。<b>1行が1拠点</b>です。続けて詳細情報を設定してください。`,
      corp: { name: corpName, id: corp?.id ?? '（仮登録で採番）', st: corp?.status ?? '仮登録' },
      corpAcct: { id: corp?.id ?? '', to: setup.corp?.contact.name ?? '', existing: !!corp },
      branches: setup.branches.map((b, j) => ({
        no: `拠点${j + 1}`, name: names[j], id: b.branchId, cpKind: kubun === 'お試し' ? 'お試しキャンペーン' : '本導入', cp: b.contractId,
        cyc: `${ymJa(setup.startCycle)}サイクル`, ch: `${b.contractId}-${setup.startCycle.replace('-', '')}`, acct: b.branchId, acctTo: b.contact.name ? `${b.contact.name}（1通）` : '',
      })),
      after: '次の画面では、拠点ごとに 親契約・子契約・設備・オプション を保存して、<b>この拠点を本登録</b>します（本登録は拠点ごと）。',
    },
    confirm: { title: '{name} を本登録しますか？', desc: '{no}｜{name} の拠点・親契約を本登録し、子契約・配送データ・資材便・貸出を作ります。{label}は {date} です。', btn: 'この拠点を本登録', btnCls: 'pri' },
    modalF: {
      title: kubun === '切替' ? '本導入への切替が完了しました' : '申込の受付が完了しました',
      desc: `${n}拠点すべてを本登録しました。`,
      rows: [
        ['法人', corpName, '仮登録', '正式登録'],
        ...setup.branches.map((b, j): string[] => ['親契約', `${b.contractId} ${names[j]}`, '仮登録', '有効']),
        ['子契約', kubun === 'お試し' ? 'お試し期間ぶん' : `${ymJa(setup.startCycle)}サイクル〜`, '—', '請求ステータス 未確定'],
      ],
      after: '以降の子契約は日次バッチが自動生成します。',
    },
    draft: x.st?.detail,
  };
  return out;
}

/** ログイン案内メールの宛先（法人・拠点のメイン担当者） */
function mailTo(cx: Ctx, names: string[]): string[][] {
  const rows: string[][] = [];
  const cc = cx.setup.corp?.contact;
  if (cc?.name) rows.push(['<b>法人アカウント</b>', bg('blue', 'メイン担当者'), cc.name, cc.email]);
  cx.setup.branches.forEach((b, j) => { if (b.contact.name) rows.push([`<b>${esc(names[j])}</b>`, bg('blue', 'メイン担当者'), b.contact.name, b.contact.email]); });
  return rows;
}
