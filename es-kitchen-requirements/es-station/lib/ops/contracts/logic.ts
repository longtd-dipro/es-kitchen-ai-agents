/*
 * 法人・拠点・子契約の計算と入力チェック（画面と actions の両方で使う）。
 * 元：12_運営_法人拠点契約.html の mlFill・depApply・scopeDialog・genDialog・pendLock・自販機の配送区分（決定 28-19）
 *     と、main_script2.js の配送ルートの一括変更（rbHit・rbAfter）。
 */
import { BRANCH_FORM, CHILD_FORM, CORP_FORM } from './forms';
import type {
  Branch, Cell, ChildContract, Corp, Entity, FieldDef, FormDef, FormFill, FormVal, RouteFilter, RouteSite, RouteTo, SelOpt, TableRow,
} from './types';

export const FORMS: Record<Entity, FormDef> = { corp: CORP_FORM, branch: BRANCH_FORM, child: CHILD_FORM };
/** 拠点の別操作（所属法人の付け替え・本導入への切替）と、取消・閉鎖の編集の制限のメッセージ（画面設計書 _共通_メッセージ の I102・I105〜I108・S107・S108） */
export const BR_MSG = {
  I102: (no: string) => `承認待ちの申請（${no}）があるため変更できません。`,
  I105: '発行済み・確定済みの請求書があるため、付け替えできません。',
  I106: 'お試しキャンペーンの契約だけ、本導入に切り替えられます。',
  I107: '取消の拠点は編集できません（参照のみ）。',
  I108: '閉鎖の拠点は、担当者と請求書の送り先メールだけ編集できます。',
  /** I02：ほかの人が同じ画面を編集中（ロックしない）。since＝その人が開いた時刻（HH:mm） */
  I02: (name: string, since: string) => `${name}さんが編集中です（${since}〜）。保存すると、あとから保存した内容で上書きされることがあります。`,
  /** E31：読み込んだあとに、ほかの人が先に保存した（警告のモーダル。「上書きして保存」で保存できる） */
  E31: '他のユーザーにより内容が更新されています。上書きすると保存されます。',
  I109: 'お試しキャンペーンの契約だけ、お試しを延長できます。',
  /** E118：拠点ステータスは先の状態にだけ変えられる */
  E118: (from: string, to: string) => `「${from}」から「${to}」へは変更できません。`,
  /** E53：契約終了日を、確定済み・発行済みの子契約の月より前にした（月＝その子契約のサイクル月 YYYY-MM） */
  E53: (ym: string) => `${+ym.slice(0, 4)}年${+ym.slice(5)}月の請求が確定済みのため、それより前にはできません。`,
  /** W105：契約終了日より後の未確定の子契約が残る（警告だけ） */
  W105: (n: number) => `未確定の子契約が${n}件残っています。自動では取り消されません。`,
  /* ---- 共通メッセージにまだ ID がないもの（要：ID の割り当て。I105〜I109 の帯は埋まっている） ---- */
  /** 切替・延長：本登録の拠点・有効の契約だけ（仮登録・閉鎖予定・利用休止・解約手続き中・終了） */
  NEW_OP_STATE: '本登録の拠点で契約が有効のときだけ、本導入への切替・お試しの延長ができます。',
  /** 取消の法人は参照のみ（拠点は I107） */
  NEW_CORP_CANCEL: '取消の法人は編集できません（参照のみ）。',
  /** 取消の子契約（休止・解約で取り消した月）は参照のみ */
  NEW_CHILD_CANCEL: '取消の子契約は編集できません（参照のみ）。',
  /** 付け替え：閉鎖の拠点は付け替えできない（I108 は編集の文言なので、付け替え専用。取消は I107 でそのまま読める） */
  NEW_REASSIGN_TARGET: '付け替え先にできるのは、正式登録・休眠の法人だけです（仮登録・取消の法人へは付け替えできません）。',
  NEW_REASSIGN_CLOSED: '閉鎖の拠点は、所属法人を付け替えできません。',
  /** お試し割引（DC000013）は1法人1回：付け替え先の法人がもう使っている */
  NEW_TRIAL_USED: (corp: string) => `${corp}は、お試しキャンペーン割引（DC000013）をすでに使っています（1法人1回）。お試しの拠点は付け替えできません。`,
  /** 契約終了日の入力（2026-10-31 の形） */
  NEW_END_DATE: '契約終了日は 2026-10-31 の形（年-月-日）の日付で入力してください。',
  /** 本導入の開始年月 */
  NEW_SWITCH_YM: '本導入の開始年月は 2026-11 の形（年-月）で入力してください。',
  NEW_SWITCH_BEFORE: (ym: string) => `本導入の開始は、お試しの開始（${ym}）より後の月にしてください。`,
  NEW_SWITCH_LOCKED: (ym: string) => `${+ym.slice(0, 4)}年${+ym.slice(5)}月の請求が確定済みのため、それ以前の月からは切り替えられません。`,
  /** W104：アカウント操作のメールの送信に失敗した（法人・拠点とも） */
  W104: 'メールを送れませんでした。時間をおいて、もう一度お試しください。',
  S100: 'パスワード再設定の案内を送りました。',
  S101: 'ログイン案内を再送しました。',
  S102: (who: string) => `${who}アカウントを停止しました（変更履歴に残ります）。`,
  S103: (who: string) => `${who}アカウントを再開しました。`,
  /** 拠点アカウントの確認（Q105〜Q107。法人は Q101〜Q103 で DetailScreen の文面） */
  Q105: (id: string) => `拠点アカウント（${id}）のログイン案内を、拠点のメイン・サブ・請求担当者に送ります（同じ人は1通）。`,
  Q106: (id: string) => `拠点アカウント（${id}）でログインできなくなります。再開するまで、この拠点は法人Webを使えません。`,
  Q107: (id: string) => `拠点アカウント（${id}）で、またログインできるようになります。`,
  /** 休止予定の表示（契約ステータスの値は有効のまま） */
  NEW_PAUSE_SOON: (ym: string) => `${ym} から利用休止になります（それまでの値は有効）`,
  S107: (corp: string) => `所属法人を${corp}に付け替えました。`,
  S108: '契約種別を本導入に切り替えました。',
};
/** 半角の数字だけの項目（CSV の「-」＝消す は使えない：消すと 0 になるため） */
export const NUM_FIELDS = ['従業員数', '1日上限数（1人あたり）', '1ヶ月上限金額（1人あたり）'];
/** 担当者のメールアドレスの形（画面の保存・CSV取込で同じ。E07） */
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
export const EMAIL_MSG = '正しいメールアドレスの形式で入力してください。';
/**
 * 拠点ステータスの変え方（台帳 F 2026-10-05「戻せない」・E118）：先の状態にだけ。休止中は持たない（休止は契約の利用休止）。
 * 仮登録→本登録（申請の本登録）→閉鎖予定→閉鎖。閉鎖予定→本登録（解約の取り消し）だけ戻せる。取消・閉鎖からは動かない
 */
export const BRANCH_NEXT: Record<string, string[]> = { 仮登録: ['本登録'], 本登録: ['閉鎖予定'], 閉鎖予定: ['閉鎖', '本登録'], 閉鎖: [], 取消: [] };
/**
 * アカウントの状態（5値）ごとに出すボタン（台帳 F 運営A 最後の open (5)。法人・拠点とも）。優先順位：停止中＞参照のみ＞ログイン済＞発行済＞未発行。
 * 停止中の「stop」は「アカウントの再開」の名前で出す
 */
export const ACCOUNT_OPS: Record<string, ('pw' | 'resend' | 'stop')[]> = {
  '未発行': ['resend'], '発行済（ログイン前）': ['pw', 'resend', 'stop'], 'ログイン済': ['pw', 'stop'], '参照のみ': ['pw', 'stop'], '停止中': ['stop'],
};
/** 契約ステータスの選べる値（停止・取消は選ばない） */
export const CONTRACT_STATUS_OPTS = ['仮登録', '有効', '解約手続き中', '利用休止', '終了'];
/**
 * 金額に効く項目を、契約変更の受付の締切（そのサイクル月のオーダー締切。既定 前月15日）のあとに直したか（E54：画面の保存・サーバーの保存・CSV取込で同じ決まり。
 * 契約_05 の 項目の「金額に効く」）。請求済・確定の子契約でも、締切までは直せる（年払い・3ヶ月前の請求書など、先に請求するお客様のため。台帳 F 運営A QC3・2026-10-08）。
 * 締切を過ぎた請求済・確定の子契約だけ止める。見つかった最初の項目名とメッセージを返す（なければ null）。before／after＝保存前・後の値、tBefore／tAfter＝表の行
 */
export const AMOUNT_FIELDS = ['プランID', 'メニュー種別（コース）', '適用された価格プラン', '価格調整の適用', '価格調整の適用/n', '福利厚生の適用', '配送区分'];
export const AMOUNT_TABLES = ['オプション・割引（このサイクル月）', '配送ルート設定（テーブル）'];
/** 契約変更の受付の締切：ym＝子契約のサイクル月、closeOn＝締切日（YYYY/MM/DD）、passed＝今日が締切より後 */
export type AmountDeadline = { ym: string; closeOn: string; passed: boolean };
/** E54：締切のあとは金額に効く変更ができない（締切の日まではできる） */
export const E54 = (d: Pick<AmountDeadline, 'ym' | 'closeOn'>) =>
  `${+d.ym.slice(0, 4)}年${+d.ym.slice(5)}月サイクルの契約変更の受付は${d.closeOn.replace(/^(\d{4})\/(\d{2})\/(\d{2})$/, (_, y, m, dd) => `${y}年${+m}月${+dd}日`)}で締め切りました。金額に効く変更はできません。`;
export function amountBlock(billStatus: string, before: Record<string, FormVal>, after: Record<string, FormVal>, tBefore: Record<string, TableRow[]>, tAfter: Record<string, TableRow[]>, dl: AmountDeadline): { name: string; msg: string } | null {
  if (billStatus !== '請求済' && billStatus !== '確定') return null;
  if (!dl.passed) return null;
  const msg = E54(dl);
  for (const n of AMOUNT_FIELDS) if (n in after && JSON.stringify(before[n]) !== JSON.stringify(after[n])) return { name: n, msg };
  for (const t of AMOUNT_TABLES) if (t in tAfter && JSON.stringify(tBefore[t]) !== JSON.stringify(tAfter[t])) return { name: t, msg };
  return null;
}
/** 閉鎖の拠点で編集できる表（担当者と請求書の送り先メール＝請求担当者のメールアドレス） */
export const CLOSED_EDITABLE_TABLE = '担当者（テーブル）';
/** 拠点の詳細に出す別操作の状態（空の文字＝できる。それ以外＝できない理由） */
export type BranchOps = {
  reassign: string; switch: string; extend: string; corps: { id: string; name: string; /** 付け替えられない理由（空＝できる） */ block?: string }[];
  /** 切替：本導入の開始年月の最小・既定（できるとき） */
  switchMin?: string; switchFrom?: string;
  /** 休止予定の開始月（契約が有効で休止がまだ始まっていないとき。表示だけ『休止予定』） */
  pauseSoon?: string;
};

/** 一覧の名前（元の data-noun）と、一覧の URL */
export const NOUN: Record<Entity, string> = { corp: '法人', branch: '拠点', child: '子契約' };
export const LIST_TITLE: Record<Entity, string> = { corp: '法人一覧', branch: '拠点一覧', child: '子契約一覧' };
export const LIST_HREF: Record<Entity, string> = { corp: '/ops/corps', branch: '/ops/branches', child: '/ops/contracts' };

/* ---------- 画面の定義を読む ---------- */

/** 定義のすべての項目 */
export function fieldsOf(def: FormDef): FieldDef[] {
  return def.tabs.flatMap((t) => t.cards.flatMap((c) => c.body.flatMap((b) => (b.t === 'fields' ? b.fields : []))));
}
/** 表のあるカード（見出し → 表の定義） */
export function tablesOf(def: FormDef) {
  return def.tabs.flatMap((t) => t.cards.flatMap((c) => c.body.flatMap((b) => (b.t === 'table' ? [{ title: c.title, table: b }] : []))));
}
const fieldCache = new Map<FormDef, Map<string, FieldDef>>();
export function fieldOf(def: FormDef, name: string): FieldDef | undefined {
  let m = fieldCache.get(def);
  if (!m) { m = new Map(fieldsOf(def).map((f) => [f.name, f])); fieldCache.set(def, m); }
  return m.get(name);
}

/** 選択肢を平らにする（optgroup の中も） */
export const flatOpts = (opts: SelOpt[]): string[] => opts.flatMap((o) => (typeof o === 'string' ? [o] : o.opts));
/** 値に合う選択肢（同じ文字か、その文字で始まるもの。元の mlFill と同じ）。なければ値のまま */
export function matchOpt(opts: SelOpt[], v: string): string {
  const all = flatOpts(opts);
  return all.find((x) => x === v) ?? all.find((x) => x.startsWith(v)) ?? v;
}

/** 項目の初期値（見本の値） */
function defaultOf(f: FieldDef): FormVal | undefined {
  const c = f.ctl;
  if (c.t === 'input' || c.t === 'textarea' || c.t === 'select' || c.t === 'zip' || c.t === 'adjust') return c.v;
  if (c.t === 'chk') return c.v;
  return undefined;
}

/** 見本の値に、行の上書き（form）を重ねた値 */
export function valuesOf(def: FormDef, fill: FormFill): Record<string, FormVal> {
  const out: Record<string, FormVal> = {};
  for (const f of fieldsOf(def)) {
    const d = defaultOf(f);
    if (d === undefined) continue;
    const v = fill[f.name];
    let val: FormVal = v !== undefined && !isRows(v) ? (v as FormVal) : d;
    if (f.ctl.t === 'select' || f.ctl.t === 'adjust') val = matchOpt(f.ctl.opts, String(val));
    out[f.name] = val;
    if (f.ctl.t === 'adjust') out[f.name + '/n'] = typeof fill[f.name + '/n'] === 'string' ? (fill[f.name + '/n'] as string) : f.ctl.n;
  }
  return out;
}
const isRows = (v: unknown): v is unknown[][] | TableRow[] => Array.isArray(v) && v.length > 0 && typeof v[0] !== 'string';

/** 表のセルの値（文字） */
export function cellText(c: Cell): string {
  if (typeof c === 'string') return c;
  if (c.t === 'in' || c.t === 'sel') return c.v;
  if (c.t === 'cyc') return c.v.join(' ');
  if (c.t === 'html') return c.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return '';
}
/** 元のデモの形（string[][]）の行を、見本の1行目の形（入力欄・ドロップダウン）に合わせる */
export function toRow(tpl: Cell[] | undefined, r: string[]): TableRow {
  return {
    c: r.map((v, i) => {
      const t = tpl?.[i];
      if (!t || typeof t === 'string') return v;
      if (t.t === 'in') return { ...t, v };
      if (t.t === 'sel') return { ...t, v: matchOpt(t.opts, v) };
      if (t.t === 'del') return { t: 'del' };
      return v;
    }),
  };
}
const firstRow = (rows: TableRow[]) => (rows.find((r) => 'c' in r) as { c: Cell[] } | undefined)?.c;

/** 見本の表に、行の上書き（'#見出し'）を重ねた表 */
export function tablesFor(def: FormDef, fill: FormFill): Record<string, TableRow[]> {
  const out: Record<string, TableRow[]> = {};
  for (const { title, table } of tablesOf(def)) {
    const v = fill['#' + title];
    if (!Array.isArray(v)) { out[title] = table.rows; continue; }
    const tpl = firstRow(table.rows);
    out[title] = (v as unknown[]).map((r) => (Array.isArray(r) ? toRow(tpl, r as string[]) : (r as TableRow)));
  }
  return out;
}
/** 表に足す空の行（見本の1行目の形） */
export function blankRow(def: FormDef, title: string): TableRow {
  const t = tablesOf(def).find((x) => x.title === title)?.table;
  const tpl = t ? firstRow(t.rows) : undefined;
  return {
    c: (tpl ?? []).map((c): Cell => {
      if (typeof c === 'string') return '';
      if (c.t === 'in') return { ...c, v: '' };
      if (c.t === 'sel') return { ...c, v: flatOpts(c.opts)[0] ?? '' };
      if (c.t === 'cyc') return { ...c, v: c.v.map(() => flatOpts(c.opts)[0] ?? '') };
      if (c.t === 'html') return '';
      return c;
    }),
  };
}

/* ---------- 画面上部の要約（sumbar） ---------- */

/** 要約の見出し → その値を持つ項目（項目を直したら要約も変わる） */
const SUM_FIELD: Record<Entity, Record<string, string>> = {
  corp: { 法人ID: '法人ID', 法人名: '法人名', ステータス: '法人ステータス' },
  branch: { 拠点ID: '拠点ID', 拠点名: '拠点名', 所属法人: '所属法人', 請求先: '請求先', 拠点ステータス: '拠点ステータス' },
  child: { 子契約ID: '子契約ID', '契約・サイクル月': '契約・サイクル月' },
};
export function sumOf(entity: Entity, values: Record<string, FormVal>, fill: FormFill) {
  return FORMS[entity].sum.map((s) => {
    const f = SUM_FIELD[entity][s.k];
    const fv = f ? values[f] : undefined;
    const v = typeof fv === 'string' && fill[f!] !== undefined ? fv : typeof fill['@' + s.k] === 'string' ? (fill['@' + s.k] as string) : typeof fv === 'string' ? fv : s.v;
    return { k: s.k, v };
  });
}

/* ---------- 一覧の行 → 詳細の上書き ---------- */

/**
 * 元のデモは、data-fill のない行を開くと中身はすべて見本（CU00001 など）のままだった。
 * 開発用では、一覧の列でわかる項目（ID・名前・状態など）だけは行の値にする。
 */
export function baseFill(entity: Entity, row: Corp | Branch | ChildContract): FormFill {
  if (entity === 'corp') {
    const r = row as Corp;
    return { 法人ID: r.id, 'ログインID（法人ID）': r.id, 法人名: r.name, 法人ステータス: r.status, ES営業担当: r.salesRep, 請求書の発行単位: r.invoiceUnit, '@配下の拠点': r.branchLabel, ...r.form };
  }
  if (entity === 'branch') {
    const r = row as Branch;
    return { 拠点ID: r.id, 拠点名: r.name, 拠点ステータス: r.status, 請求先: r.billTo, 契約種別: r.contractKind, 契約ステータス: r.contractStatus, '親契約番号（契約ID）': r.parentNo, ...r.form };
  }
  const r = row as ChildContract;
  return { 子契約ID: r.id, '契約・サイクル月': r.month, '親契約番号（契約ID）': r.parentNo, ...r.form };
}

/* ---------- 請求タブの活性（請求先・支払方法しだい。2026/09/28） ---------- */

type Dep = { e: Entity; c: string; ok: (v: string, vals: Record<string, FormVal>) => boolean; t: string[]; why: string; /** CSV取込の E109 に出す条件 */ need: string };
const DEPS: Dep[] = [
  { e: 'branch', c: '請求先', ok: (v) => v === 'この拠点', t: ['請求書発行リードタイムの上書き', '支払方法', '支払サイクル', 'Bill One 発行先ID', '入金期限'], why: '請求先が法人のため非活性', need: '請求先が「この拠点」' },
  { e: 'branch', c: '支払サイクル', ok: (v, s) => v === '年払い' && s['請求先'] === 'この拠点', t: ['起算月（年払いのとき）'], why: '支払サイクルが年払いではないため非活性', need: '請求先が「この拠点」で、支払サイクルが年払い' },
  { e: 'corp', c: '支払サイクル', ok: (v) => v === '年払い', t: ['起算月（年払いのとき）'], why: '支払サイクルが年払いではないため非活性', need: '支払サイクルが年払い' },
  { e: 'branch', c: '支払方法', ok: (v, s) => v === '口座振替' && s['請求先'] === 'この拠点', t: ['口座振替の手続きステータス'], why: '支払方法が口座振替ではないため非活性', need: '請求先が「この拠点」で、支払方法が口座振替' },
  { e: 'corp', c: '支払方法', ok: (v) => v === '口座振替', t: ['口座振替の手続きステータス'], why: '支払方法が口座振替ではないため非活性', need: '支払方法が口座振替' },
];
const isDash = (s: string) => /^—/.test(s);

/**
 * 条件で非活性になる項目と、その値を直した値。
 * 非活性：ドロップダウンは「—（理由）」、入力欄は「—」。活性に戻ったら「—」を外す（ドロップダウンは最初の選択肢、リードタイムは 1）。
 */
export function applyDeps(entity: Entity, values: Record<string, FormVal>): { values: Record<string, FormVal>; off: Record<string, string> } {
  const def = FORMS[entity];
  const out = { ...values };
  const off: Record<string, string> = {};
  for (const d of DEPS) {
    if (d.e !== entity) continue;
    const on = d.ok(String(out[d.c] ?? ''), out);
    for (const n of d.t) {
      const f = fieldOf(def, n);
      if (!f) continue;
      const cur = String(out[n] ?? '');
      if (!on) {
        off[n] = d.why;
        out[n] = f.ctl.t === 'select' ? `—（${d.why}）` : '—';
      } else if (isDash(cur)) {
        if (f.ctl.t === 'select') out[n] = flatOpts(f.ctl.opts).find((o) => !isDash(o)) ?? '';
        else out[n] = n === '請求書発行リードタイムの上書き' ? '1' : '';
      }
    }
  }
  return { values: out, off };
}
/** 条件で活性・非活性が変わる項目（条件に当てはまるときは入力できる） */
export const depTargets = (entity: Entity) => new Set(DEPS.filter((d) => d.e === entity).flatMap((d) => d.t));
/** 値を入れられない項目（条件に当てはまらないもの）→ その条件の文（CSV取込の E109） */
export function offNeed(entity: Entity, values: Record<string, FormVal>): Record<string, string> {
  const out: Record<string, string> = {};
  const v = applyDeps(entity, values).values;
  for (const d of DEPS) if (d.e === entity && !d.ok(String(v[d.c] ?? ''), v)) for (const n of d.t) out[n] = d.need;
  return out;
}
/** 非活性のときに出す選択肢（元の dash） */
export const dashOpt = (why: string) => `—（${why}）`;

/* ---------- 子契約 ---------- */

/** 子契約ID → サイクル月（YYYY-MM） */
export const cycOf = (id: string) => { const m = /-(\d{4})(\d{2})$/.exec(id); return m ? `${m[1]}-${m[2]}` : ''; };
/** YYYY-MM に n か月足す */
export function addM(ym: string, n: number) {
  let y = +ym.slice(0, 4); let m = +ym.slice(5, 7) - 1 + n;
  y += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
  return `${y}-${String(m + 1).padStart(2, '0')}`;
}
export const jpM = (ym: string) => `${ym.slice(0, 4)}年${+ym.slice(5, 7)}月`;

/** 拠点の「一覧（子契約）」の列 */
const CHILD_COLS = ['契約・サイクル月', '契約終了予定月', '子契約ID', 'プラン名', '契約ステータス（親契約より）', '配送区分', '納品回数', '請求月（前払い）', '当月請求額', '請求ステータス（前払い／後払い）', '生成方法'];
export const childCol = (n: string) => CHILD_COLS.indexOf(n);
export const CHILD_TABLE = '一覧（子契約）';
type ChildLine = { id: string; cyc: string; st: string };
/** 拠点の一覧（子契約）の行（休止の帯は数えない） */
export function childLines(rows: TableRow[]): ChildLine[] {
  return rows.flatMap((r) => ('c' in r ? [{ id: cellText(r.c[childCol('子契約ID')]), cyc: cellText(r.c[childCol('契約・サイクル月')]), st: cellText(r.c[childCol('請求ステータス（前払い／後払い）')]) }] : []));
}
/** 確定・請求済の子契約（あとから直さない） */
export const isFixed = (st: string) => /(^|[^未])確定|請求済/.test(st);

/** この子契約より後ろのサイクルの、生成済みの子契約（保存のときに適用範囲を聞く） */
export function laterOf(childId: string, rows: TableRow[]) {
  const cyc = cycOf(childId) || '2026-07';
  const later = childLines(rows).filter((x) => x.cyc > cyc).sort((a, b) => (a.cyc < b.cyc ? -1 : 1));
  const fixed = later.filter((x) => isFixed(x.st)).length;
  const span = later.length ? later[0].cyc + (later.length > 1 ? '〜' + later[later.length - 1].cyc : '') : '';
  return { cyc, later, fixed, open: later.length - fixed, span };
}

/* 子契約を先まで作る：日次バッチは次のサイクルを前月1日に作る。手で作れるのは今月から12ヶ月先まで */
export const GEN_LIMIT_MONTHS = 12;
export const LEAD_MONTHS = 1;
/** 休止の帯の期間 */
export const bandsOf = (rows: TableRow[]) => rows.flatMap((r) => ('band' in r ? [r.band] : []));
const inPause = (rows: TableRow[], m: string) => bandsOf(rows).some((b) => m >= b.from && m <= b.to);
/** 作れる月の範囲（最初・上限）と、選んだ月までに作る月 */
export function genPlan(rows: TableRow[], thisMonth: string, until?: string) {
  const kids = rows.filter((r): r is { c: Cell[]; cls?: string } => 'c' in r);
  const top = kids[0];
  const last = top ? cellText(top.c[childCol('契約・サイクル月')]) : thisMonth;
  const cid = top ? cellText(top.c[childCol('子契約ID')]).split('-')[0] : '';
  let first = addM(last, 1);
  while (inPause(rows, first)) first = addM(first, 1);   /* STEP2（2026/10/01）：休止期間のサイクル月は飛ばす */
  const limit = addM(thisMonth, GEN_LIMIT_MONTHS);
  const choices: string[] = [];
  for (let m = first; m <= limit; m = addM(m, 1)) choices.push(m);
  const to = until ?? choices[0] ?? first;
  const months: string[] = [];
  for (let m = first; m <= to; m = addM(m, 1)) if (!inPause(rows, m)) months.push(m);
  return { top, last, cid, first, limit, choices, months, count: kids.length };
}
/** 作る子契約の行（最新の子契約と同じプラン・配送） */
export function genRow(top: { c: Cell[] }, cid: string, m: string): TableRow {
  const c = top.c.map((x) => (typeof x === 'string' ? x : { ...x })) as Cell[];
  const set = (n: string, v: string) => { const i = childCol(n); if (i >= 0) c[i] = v; };
  set('契約・サイクル月', m);
  set('子契約ID', `${cid}-${m.replace('-', '')}`);
  set('請求月（前払い）', jpM(addM(m, -1)));
  set('請求ステータス（前払い／後払い）', '未確定 ／ 未確定');
  set('生成方法', '手動生成');
  return { c, cls: 'gen' };
}

/** 設備が自販機の拠点（コース＝ESライト（自販機））は、配送区分を ES配送便に固定（決定 28-19） */
export const vmFixed = (values: Record<string, FormVal>) => /自販機/.test(String(values['メニュー種別（コース）'] ?? ''));
export const VM_NOTE = '設備が自販機の拠点のため、配送区分は ES配送便に固定です。';
/** 価格調整の適用：なし・無料のときは金額を入れない */
export const adjustNoAmount = (v: string) => /なし|無料/.test(v);

/* ---------- 入力チェック ---------- */

/** 保存の前のチェック。返り値：項目名 → エラーの文言 */
export function validate(entity: Entity, values: Record<string, FormVal>, locked: string[] = []): Record<string, string> {
  const def = FORMS[entity];
  const { off } = applyDeps(entity, values);
  const errs: Record<string, string> = {};
  for (const f of fieldsOf(def)) {
    if (f.rop || off[f.name] || locked.includes(f.name)) continue;
    const v = values[f.name];
    if (typeof v !== 'string') continue;
    const s = v.trim();
    if (f.mark === 'req' && (f.ctl.t === 'input' || f.ctl.t === 'textarea' || f.ctl.t === 'zip') && !s) { errs[f.name] = `${f.label ?? f.name}を入力してください`; continue; }
    /* 文字数の上限（E04）：項目の型 varchar(n) があればその数、複数行の入力は 500（input_standard） */
    const lim = f.ctl.t === 'textarea' ? 500 : f.ctl.t === 'input' ? Number(/^varchar\((\d+)\)$/.exec(f.meta?.type ?? '')?.[1]) || 0 : 0;
    if (lim && [...s].length > lim) { errs[f.name] = `${f.label ?? f.name}は${lim}文字以内で入力してください`; continue; }
    if (f.ctl.t === 'zip' && s && !/^\d{3}-?\d{4}$/.test(s)) errs[f.name] = '郵便番号は 123-4567 の形で入力してください';
    if (NUM_FIELDS.includes(f.name) && s && !/^\d+$/.test(s)) errs[f.name] = '半角の数字で入力してください';
    if (/^(電話番号|FAX番号)/.test(f.name) && s && !/^[\d-]+$/.test(s)) errs[f.name] = '半角の数字とハイフンで入力してください';
  }
  if (entity === 'child' && !adjustNoAmount(String(values['価格調整の適用'] ?? 'なし'))) {
    const n = String(values['価格調整の適用/n'] ?? '').trim();
    if (!/^\d+$/.test(n) || +n % 10 !== 0) errs['価格調整の適用'] = '金額は10円単位の半角数字で入力してください';
  }
  return errs;
}

/* ---------- 保存したら一覧の列も合わせる ---------- */

const leadLabel = (v: string) => {
  const m = /^(\d)ヶ月前/.exec(v);
  if (m) return `${m[1]}ヶ月前請求`;
  if (/^当月/.test(v)) return '0ヶ月前請求';
  if (/^翌月/.test(v)) return '翌月請求';
  return v;
};
/** 直した項目のうち、一覧の列に出るものを行に写す（直していない列は元のまま） */
export function syncRow(entity: Entity, row: Corp | Branch | ChildContract, changed: Record<string, FormVal>) {
  const s = (n: string) => (typeof changed[n] === 'string' ? (changed[n] as string) : undefined);
  if (entity === 'corp') {
    const r = row as Corp;
    if (s('法人名') !== undefined) r.name = s('法人名')!;
    if (s('ES営業担当') !== undefined) r.salesRep = s('ES営業担当')!;
    if (s('請求書の発行単位') !== undefined) r.invoiceUnit = s('請求書の発行単位')!;
    if (s('請求書発行リードタイム') !== undefined) r.invoiceLead = leadLabel(s('請求書発行リードタイム')!);
  } else if (entity === 'branch') {
    const r = row as Branch;
    if (s('拠点名') !== undefined) r.name = s('拠点名')!;
    if (s('拠点ステータス') !== undefined) r.status = s('拠点ステータス') as Branch['status'];
    if (s('請求先') !== undefined) r.billTo = s('請求先') as Branch['billTo'];
    if (s('契約種別') !== undefined) r.contractKind = s('契約種別')!;
    if (s('契約ステータス') !== undefined) r.contractStatus = s('契約ステータス')!;
    if (s('都道府県') !== undefined || s('市区町村') !== undefined) r.addr = (s('都道府県') ?? r.addr.slice(0, 3)) + (s('市区町村') ?? '');
  } else {
    const r = row as ChildContract;
    if (s('プランID') !== undefined) r.plan = s('プランID')!.replace(/\s+/g, ' ');
  }
}

/* ---------- 一覧 ---------- */

/** 一覧の状態の色（ES Kitchen の es-badge） */
export function tone(v: string): 'success' | 'info' | 'warning' | 'neutral' {
  if (['正式登録', '本登録', '有効'].includes(v)) return 'success';
  if (v === '仮登録') return 'info';
  if (['休止中', '閉鎖予定', '利用休止', '解約手続き中'].includes(v)) return 'warning';
  return 'neutral';
}

/* ---------- 配送ルートの一括変更（STEP4H-20261001） ---------- */

export const RB_CARS = ['ヤマト運輸', '佐川急便', '福山通運', '栄成ロジ（委託）', 'みどり便（委託）', '山本配送（個人・委託）', 'ES配送便（自社）'];
export const RB_CYCLES = ['2026年11月', '2026年12月', '2027年1月'];
/** 適用開始サイクルより前に作成済みの配送データがあるサイクルの数（要確認になる配送データの見込み） */
export const RB_CYC_N: Record<string, number> = { '2026年11月': 2, '2026年12月': 1, '2027年1月': 0 };
export const rbHit = (f: RouteFilter) => (r: RouteSite) => (!f.wh || r.wh === f.wh) && (!f.c || r.c1 === f.c || r.c2 === f.c) && (!f.hub || r.hub === f.hub) && (!f.pref || r.pref === f.pref);
export const rbIsCon = (c: string) => /委託/.test(c || '');
export function rbAfter(r: RouteSite, t: RouteTo) {
  return { wh: t.wh || r.wh, c1: t.c1 || r.c1, hub: t.hub || r.hub, c2: t.c2 && r.c2 !== '—' ? t.c2 : r.c2 };
}
const RB_KEYS = ['wh', 'c1', 'hub', 'c2'] as const;
export const rbChanged = (r: RouteSite, t: RouteTo) => { const a = rbAfter(r, t); return RB_KEYS.some((k) => a[k] !== r[k]); };
/** 委託先ごとに、外れる拠点・新しく担当する拠点 */
export function rbConsignees(rows: RouteSite[], t: RouteTo) {
  const off: Record<string, string[]> = {}; const on: Record<string, string[]> = {};
  rows.forEach((r) => {
    const a = rbAfter(r, t);
    (['c1', 'c2'] as const).forEach((k) => {
      if (a[k] === r[k]) return;
      if (rbIsCon(r[k])) (off[r[k]] ||= []).push(r.name);
      if (rbIsCon(a[k])) (on[a[k]] ||= []).push(r.name);
    });
  });
  return { off, on };
}
/** 一括変更の内容（履歴の「内容」） */
export const rbWhat = (t: RouteTo) => [t.wh && '倉庫 → ' + t.wh, t.c1 && '1次 → ' + t.c1, t.hub && '中継先 → ' + t.hub, t.c2 && '2次 → ' + t.c2].filter(Boolean).join('、');

/**
 * 配送ルートの CSV（拠点ID,配送区分,倉庫ID,1次の配送会社,中継先ID,2次の配送会社,適用開始サイクル）を読む。
 * 空欄の列は変えない。1つの取込で変更後のルートは1通り（最初の行）にそろえる。エラーの行は取り込まない。
 */
export function parseRouteCsv(text: string, sites: RouteSite[], whs: string[], hubs: string[]) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors: string[] = [];
  const ids: string[] = [];
  let to: RouteTo | null = null;
  let cyc = '';
  const byId = (list: string[], v: string) => (v ? list.find((x) => x.startsWith(v + ' ')) : '');
  lines.forEach((l, i) => {
    if (i === 0 && /^拠点ID/.test(l)) return;
    const [id, , wh, c1, hub, c2, ym] = l.split(',').map((x) => (x ?? '').trim());
    const n = i + 1;
    if (!sites.some((s) => s.id === id)) { errors.push(`${n}行目：拠点ID ${id || '（空）'} がありません`); return; }
    const w = byId(whs, wh); const h = byId(hubs, hub);
    if (wh && !w) { errors.push(`${n}行目：倉庫ID ${wh} がありません`); return; }
    if (hub && !h) { errors.push(`${n}行目：中継先ID ${hub} がありません`); return; }
    if ((c1 && !RB_CARS.includes(c1)) || (c2 && !RB_CARS.includes(c2))) { errors.push(`${n}行目：配送会社が配送会社の一覧にありません`); return; }
    const cy = /^(\d{4})-(\d{2})$/.exec(ym ?? '');
    const cName = cy ? `${cy[1]}年${+cy[2]}月` : '';
    if (!RB_CYCLES.includes(cName)) { errors.push(`${n}行目：適用開始サイクル ${ym || '（空）'} は選べません`); return; }
    to ??= { wh: w || '', c1: c1 || '', hub: h || '', c2: c2 || '' };
    cyc ||= cName;
    ids.push(id);
  });
  return { ids, to, cyc, errors, n: lines.length - (lines[0] && /^拠点ID/.test(lines[0]) ? 1 : 0) };
}
