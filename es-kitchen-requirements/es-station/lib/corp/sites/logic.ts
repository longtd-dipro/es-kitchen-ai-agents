/*
 * 拠点管理・法人情報・契約の申請の決まりと入力チェック（画面と actions の両方で使う）。
 * 元：部品/22_法人_拠点管理.html の PROCS・FIELDS・CFIELDS・RV_*（RV-CORP-20261002 C-a）・procs・whoCands。
 */
import { CXL_STOCK } from '@/lib/domain/cxlStock';
import { PREFS } from '@/lib/ops/contracts/forms';
import type { ChangeItem, SiteView, StaffRow, WhoCand } from './types';
import { fmtDatesIn, fmtYm } from '@/lib/format/date';
import { yen } from '@/lib/format/money';

export { PREFS };

/* デモの今日（2026/10/05）で決まる、いちばん早いサイクル（締切 前月15日） */
export const EARLIEST = '2026年11月分';
export const EARLIEST_CYC = '2026-11';
export const EARLIEST_DUE = '2026/10/15';
/** 今のサイクル（料金のない設定はここから反映する） */
export const NOW_CYC = '2026-10';

/* ---------------- 手続き（申込フォームへ回すもの） ---------------- */
export type ProcKey = 'plan' | 'dlv' | 'eq' | 'info' | 'corp' | 'pause' | 'resume' | 'cancel';
export const PROCS: Record<ProcKey, { label: string; desc: string; note: string }> = {
  plan: { label: 'プランの変更', desc: 'ご利用人数が変わったときに、プランとお届けの内容を変えます。設備も一緒に変わることがあります。', note: '料金が変わります' },
  dlv: { label: '配送の変更', desc: '配送方法（ES配送便／クール便（宅配便））・お届け回数・お届けのしかたを変えます。プランはそのままです。', note: '月額料金が変わることがあります' },
  eq: { label: '設備の変更', desc: '冷蔵庫・冷凍庫などの追加、サイズの変更、返却です。', note: '差額のご請求や最低利用期間の数え直しがあります' },
  /* STEP1H_20261001 C3：お手続きは8種類。運営デモ AP_TAB と同じ名前 */
  info: { label: '拠点情報の変更', desc: 'お届け先名・住所・電話番号・請求書の宛先・ゲストモード・お届けできない曜日・設備の希望日など、ESキッチンの承認が必要な拠点の情報を変えます。ES-QR の利用設定はESキッチンだけが変更できます（参照のみ）。', note: 'ご契約の内容（プラン・料金）は変わりません' },
  corp: { label: '法人情報の変更', desc: '請求書に載る法人の住所・電話番号・FAX番号を変えます。法人名・フリガナ・請求先法人名は「法人情報」の編集ですぐ直せます。', note: '承認後、未発行の請求書から新しい内容になります' },
  pause: { label: '休止', desc: '改装・長期休業などで一時的に止めます。設備は引き揚げるか、置いたままにするかを選べます。', note: '休止できるのは通算1年までです' },
  resume: { label: '再開', desc: '休止していた拠点のお届けを再開します。', note: 'ご契約番号は変わりません' },
  cancel: { label: '解約', desc: 'ご利用を終了します。最低利用期間の残りがある設備は違約金がかかります。', note: '元に戻せません' },
};
export const PROC_ORDER: ProcKey[] = ['plan', 'dlv', 'eq', 'info', 'corp', 'pause', 'resume', 'cancel'];

export type Tone = 'success' | 'info' | 'warning' | 'neutral' | 'negative';
/** 状態のお客様向けの言い方（データの値は変えない）。拠点：仮登録→ご契約手続き中・本登録→ご利用中・閉鎖→閉鎖済み。契約：仮登録→ご契約手続き中・有効→ご利用中・利用休止→休止中 */
export const siteSt = (st: string) => ({ 仮登録: 'ご契約手続き中', 本登録: 'ご利用中', 閉鎖: '閉鎖済' } as Record<string, string>)[st] ?? st;
export const ctSt = (st: string) => ({ 仮登録: 'ご契約手続き中', 有効: 'ご利用中', 利用休止: '休止中' } as Record<string, string>)[st] ?? st;
export const TONE_SITE: Record<string, Tone> = { 本登録: 'success', 仮登録: 'info', 休止中: 'warning', 閉鎖予定: 'neutral', 閉鎖: 'neutral' };
export const TONE_CT: Record<string, Tone> = { 有効: 'success', 仮登録: 'info', 利用休止: 'warning', 解約手続き中: 'warning', 停止: 'neutral', 終了: 'neutral' };
export const TONE_AP: Record<string, Tone> = { ESキッチンが確認中: 'info', 承認: 'success', お受けできませんでした: 'neutral', 取り下げ: 'neutral', ご契約開始済: 'success' };
export const TONE_BILL: Record<string, Tone> = { 未確定: 'neutral', 確定: 'info', 請求済: 'success' };
export const TONE_LOAN: Record<string, Tone> = { 貸出中: 'success', 配送中: 'info', 未返却: 'warning', 回収済: 'neutral' };
export const WD = ['月', '火', '水', '木', '金', '土', '日', '祝日'];
export const STAFF_KINDS = ['メイン担当者', '請求担当者', 'サブ担当者'];

/** 申請の種類（一覧の絞り込み） */
export const REQ_KINDS = ['新規のお申し込み', '拠点を追加', 'プランの変更', '配送の変更', '設備の変更', '休止', '再開', '解約', '拠点情報の変更', '法人情報の変更'];
export const REQ_STATES = ['ESキッチンが確認中', '承認', 'お受けできませんでした', '取り下げ', 'ご契約開始済'];

/* ---------------- 直せる欄（items.py の 変更申請・ESキッチン承認・通知） ----------------
   appr: 1 ＝ ESキッチン承認が必須（承認待ちになる）／0 ＝ 承認不要（すぐ反映）
   ap：反映方法のラベル（imm 即反映／imn 即反映・通知／req 承認が必要／ref 参照のみ） */
export type FieldDef = { label: string; appr: 0 | 1; req?: 1; ap?: 'imm' | 'imn' | 'req' | 'ntf' | 'ref'; opts?: string[]; suffix?: string; help?: string; ref?: 1 };
export const FIELDS: Record<string, FieldDef> = {
  name: { label: '拠点名', appr: 1, req: 1, ap: 'req' },
  kana: { label: '拠点名フリガナ', appr: 1, req: 1, ap: 'req', help: 'カタカナで入力してください' },
  emp: { label: '従業員数', appr: 0, ap: 'imm', suffix: '名' },
  note: { label: '備考', appr: 0, ap: 'imm' },
  day: { label: '1日上限数（1人あたり）', appr: 0, ap: 'imm', suffix: '食／日', help: '0＝制限なし。今のご利用月（2026年10月分）以降のご契約に反映します' },
  month: { label: '1ヶ月上限金額（1人あたり）', appr: 0, ap: 'imm', suffix: '円／月', help: '0＝制限なし。今のご利用月（2026年10月分）以降のご契約に反映します' },
  guest: { label: 'ゲストモード', appr: 0, ap: 'imm', opts: ['利用しない', '利用する'], help: '社員登録のない来訪者も購入できます（食事補助の対象外）。保存した時点で使えます（止めるときも保存した時点で止まります）。料金はご注文・変更の締切（前月15日）までなら翌月分から、過ぎたら翌々月分から（止めるときも同じ月まで）' },
  qr: { label: 'ES-QR の利用設定', appr: 0, ap: 'ref', ref: 1 },   /* 2026/10/01 N4：ESキッチンだけが変更できる。法人Webは参照表示（入力欄なし） */
  zip: { label: '郵便番号', appr: 1, req: 1, ap: 'req' },
  pref: { label: '都道府県', appr: 1, req: 1, ap: 'req', opts: PREFS },
  city: { label: '市区町村', appr: 1, req: 1, ap: 'req' },
  a1: { label: '町名・番地', appr: 1, req: 1, ap: 'req' },
  a2: { label: '建物等', appr: 1, ap: 'req' },
  tel: { label: '電話番号', appr: 1, req: 1, ap: 'req' },
  fax: { label: 'FAX番号', appr: 0, ap: 'imm' },
  billTo: { label: '請求書のあて先', appr: 1, ap: 'req', opts: ['法人', 'この拠点'], help: '請求書のあて先を変えると、まだ発行していない請求書から新しい宛先になります' },
};
export type SiteKey = keyof typeof FIELDS;
/** 法人で直せる欄（法人名など＝承認不要・通知のみ／請求書に載る住所＝承認必須） */
export const CFIELDS: Record<string, FieldDef> = {
  name: { label: '法人名', appr: 0, req: 1, ap: 'imn' }, cname: { label: '法人名（契約）', appr: 0, req: 1, ap: 'imn' }, kana: { label: '法人名フリガナ', appr: 0, req: 1, ap: 'imn' }, bname: { label: '請求先法人名', appr: 0, req: 1, ap: 'imn' },
  zip: { label: '郵便番号', appr: 1, req: 1, ap: 'req' }, pref: { label: '都道府県', appr: 1, req: 1, ap: 'req', opts: PREFS }, city: { label: '市区町村', appr: 1, req: 1, ap: 'req' }, a1: { label: '町名・番地', appr: 1, req: 1, ap: 'req' }, a2: { label: '建物等', appr: 1, ap: 'req' },
  tel: { label: '電話番号', appr: 1, req: 1, ap: 'req' }, fax: { label: 'FAX番号', appr: 1, ap: 'req' },
};
/** 反映方法のラベル（2026/10/01 N4） */
export const AP_FC: Record<string, [string, string]> = { imm: ['即反映', ' imm'], imn: ['即反映・ESキッチンへ通知', ' imm'], req: ['ESキッチンの承認が必要', ''], ntf: ['ESキッチンへ通知のみ', ' ntf'], ref: ['参照のみ・変更はESキッチンへ依頼', ' ref'] };

/* ---------------- 入力チェック（RV-CORP-20261002 C-a） ----------------
   申込フォームの入力チェック仕様と同じ規則・文言。保存を押したときにまとめてチェックし、エラーは項目の下に赤字＋上部にまとめ。
   前後の空白は取り除き、郵便番号・電話・FAX・メール・数は全角を半角に直す */
const RV_VT = {
  zip: { re: /^[0-9]{3}-?[0-9]{4}$/, msg: '郵便番号は数字7桁でご入力ください（ハイフンはあってもなくても構いません）。' },
  tel: { re: /^[0-9][0-9-]*$/, msg: '電話番号は数字とハイフンだけでご入力ください。' },
  mail: { re: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, msg: 'メールアドレスの形式が正しくありません。' },
};
/** 電話・FAX は数字10〜11桁（ハイフンを除く。入力チェック仕様 §2・E06） */
const TEL_DIGITS = /^[0-9]{10,11}$/;
const TEL_DIGITS_MSG = (label: string) => label + 'は10〜11桁の数字でご入力ください（ハイフン可）。';
const RV_RULE: Record<string, 'zip' | 'tel' | 'kana' | 'int'> = { zip: 'zip', tel: 'tel', fax: 'tel', kana: 'kana', emp: 'int', day: 'int', month: 'int' };
const RV_MAX: Record<string, number> = { name: 120, kana: 120, cname: 120, bname: 120, city: 60, a1: 120, a2: 120, note: 1000, zip: 8, tel: 20, fax: 20 };
const RV_Z2H = /^(zip|tel|fax|emp|day|month)$/;
export const rvTrim = (v: unknown) => String(v ?? '').replace(/^[\s　]+|[\s　]+$/g, '');
export const rvZ2h = (v: unknown) => rvTrim(String(v ?? '').replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[‐-―−ーｰ]/g, '-').replace(/　/g, ' '));
function rvOne(k: string, label: string, v: string, req?: 1) {
  if (req && !v) return label + 'をご入力ください。';
  if (!v) return '';
  if (RV_MAX[k] && v.length > RV_MAX[k]) return label + 'は' + RV_MAX[k] + '文字以内でご入力ください。';
  if (RV_RULE[k] === 'kana' && !/^[ァ-ヶー　 ]+$/.test(v)) return label + 'は全角カタカナでご入力ください。';
  if (RV_RULE[k] === 'int' && !/^[0-9]+$/.test(v)) return label + 'は0以上の整数でご入力ください。';
  const r = RV_RULE[k] === 'zip' || RV_RULE[k] === 'tel' ? RV_VT[RV_RULE[k] as 'zip' | 'tel'] : null;
  if (r && !r.re.test(v)) return r.msg;
  if (RV_RULE[k] === 'tel' && !TEL_DIGITS.test(v.replace(/-/g, ''))) return TEL_DIGITS_MSG(label);
  return '';
}
export type RvResult = {
  d: Record<string, string>; staff: StaffRow[]; errs: Record<string, string>; serr: Record<string, string>; smsg: string;
  list: { label: string; msg: string }[];
};
/** 欄とご担当者をまとめてチェックする（直した値も返す） */
export function rvCheck(defs: Record<string, FieldDef>, d: Record<string, string>, staff: StaffRow[]): RvResult {
  const nd = { ...d }, errs: Record<string, string> = {}, list: { label: string; msg: string }[] = [], serr: Record<string, string> = {}, smsg: string[] = [];
  Object.keys(defs).forEach((k) => {
    const F = defs[k];
    if (F.ref || F.opts) return;
    const v1 = RV_Z2H.test(k) ? rvZ2h(d[k]) : rvTrim(d[k]);
    nd[k] = v1;
    const e = rvOne(k, F.label, v1, F.req);
    if (e) { errs[k] = e; list.push({ label: F.label, msg: e }); }
  });
  const ns = (staff || []).map((r, i) => {
    const x = r.slice() as StaffRow;
    x[1] = rvTrim(x[1]); x[2] = rvTrim(x[2]); x[3] = rvZ2h(x[3]); x[4] = rvZ2h(x[4]);
    ([[1, '担当者名', 'name', 1], [2, 'フリガナ', 'kana', 1], [3, 'メールアドレス', 'mail', 1], [4, '電話番号', 'tel', 0]] as const).forEach(([j, label, kind, need]) => {
      const v = x[j];
      let e = '';
      if (need && !v) e = label + 'をご入力ください。';
      else if (v && kind === 'kana' && !/^[ァ-ヶー　 ]+$/.test(v)) e = label + 'は全角カタカナでご入力ください。';
      else if (v && kind === 'mail' && !RV_VT.mail.re.test(v)) e = RV_VT.mail.msg;
      else if (v && kind === 'tel' && !RV_VT.tel.re.test(v)) e = RV_VT.tel.msg;
      else if (v && kind === 'name' && v.length > 60) e = label + 'は60文字以内でご入力ください。';
      if (e) { serr[i + '|' + j] = e; smsg.push(i + 1 + '行目：' + e); }
    });
    return x;
  });
  if (smsg.length) list.push({ label: 'ご担当者', msg: smsg.join('　') });
  return { d: nd, staff: ns, errs, serr, smsg: smsg.join('　'), list };
}
/**
 * ご担当者の数のチェック。メイン担当者は必ず1名。請求担当者は needBill のときだけ必須（法人＝必須、拠点＝請求書のあて先がこの拠点のときだけ：
 * 入力チェック仕様 行67・受付簿 No.45）。どちらも2名以上は不可
 */
export function staffError(staff: StaffRow[], needBill = true): string {
  const kinds = staff.map((r) => r[0]);
  const n = (k: string) => kinds.filter((x) => x === k).length;
  if (n('メイン担当者') !== 1) return 'メイン担当者は1名必要です';
  if (needBill && n('請求担当者') !== 1) return '請求担当者は1名必要です（請求書のあて先のご担当者）';
  if (n('請求担当者') > 1) return '請求担当者は1名までです';
  if (staff.some((r) => !r[1] || !r[2] || !r[3])) return '担当者名・フリガナ・メールアドレスを入力してください';
  return '';
}
/** 直した欄を、承認が必要なもの（ch）とすぐ反映するもの（now）に分ける */
export function splitChanges(defs: Record<string, FieldDef>, d: Record<string, string>, cur: (k: string) => string) {
  const ch: ChangeItem[] = [], now: ChangeItem[] = [];
  Object.keys(defs).forEach((k) => {
    if (defs[k].ref) return;
    if (d[k] !== undefined && d[k] !== cur(k)) (defs[k].appr ? ch : now).push({ k, label: defs[k].label, from: cur(k), to: d[k] });
  });
  return { ch, now };
}

/* ---------------- 表示 ---------------- */
/** 年月の表示 'YYYY-MM'（共通の表示ルール・決定 8-1） */
export function ym(v: string) {
  if (!v || v === '—') return '—';
  return fmtYm(v);
}
export function fmtNum(k: string, v: string) {
  if (k === 'emp') return v ? v + '名' : '—';
  if (k === 'day') return v === '0' ? '制限なし' : v + '食／日';
  if (k === 'month') return v === '0' ? '制限なし' : yen(Number(v)) + '／月';
  return v;
}
/** 2026/10/01 決定 H5：機種コードを機種名と一緒に出す */
export const MCODE: [string, string][] = [['冷蔵ショーケース 48L', 'RF000001'], ['冷蔵ショーケース 84L', 'RF000002'], ['冷蔵ショーケース 105L', 'RF000003'], ['冷蔵ショーケース 142L', 'RF000004'],
  ['業務用冷凍庫 FZ-600', 'FZ000001'], ['カップ式自販機 VM-6010', 'VM000001'], ['業務用電子レンジ MRO-1200', 'MW000001'],
  ['ボックス《仕切り皿》', 'BX000001'], ['ボックス《深皿》', 'BX000002'], ['ボックス《フード類》', 'BX000003'], ['タンス型ボックス（大）', 'BX000004'], ['カゴ', 'BX000005']];
export const modelCode = (n: string) => MCODE.find((x) => n.startsWith(x[0]))?.[1] ?? null;
/** 運営Web の「2026年9月29日 08:12:00」→「2026/09/29 08:12」 */
export function shortStamp(s: string) {
  const m = /^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{2})/.exec(s || '');
  return m ? `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')} ${m[4].padStart(2, '0')}:${m[5]}` : fmtDatesIn(s);
}

/* ---------------- 申し込める手続き ---------------- */
export const blocked = (s: Pick<SiteView, 'pend' | 'pinfo'>) => !!(s.pend || s.pinfo);
export function procsOf(s: SiteView): ProcKey[] {
  if (blocked(s)) return [];
  if (s.status === '休止中') return ['resume', 'cancel'];
  if (s.band && s.band.at) return ['dlv', 'eq', 'info', 'cancel'];
  return ['plan', 'dlv', 'eq', 'info', 'pause', 'cancel'];
}
/** 2026/10/01 決定 H2：取り下げられるのは、申請を出したアカウントと法人アカウントだけ */
export const canWithdraw = (role: string, acct?: string) => role !== 'branch' || !acct || acct !== '法人アカウント';
export const acctName = (role: string) => (role === 'branch' ? '拠点アカウント' : '法人アカウント');

/** 申請者の候補：法人アカウント＝法人＋対象拠点のご担当者／拠点アカウント＝その拠点のご担当者 */
export function whoCands(role: string, corpStaff: StaffRow[], sites: { name: string; staff: StaffRow[] }[]): WhoCand[] {
  const out: WhoCand[] = [], seen = new Set<string>();
  const push = (st: StaffRow[], where: string) => st.forEach((r) => {
    const k = r[3] || r[1];
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push({ value: k, name: r[1], where, kind: r[0], mail: r[3] });
  });
  if (role !== 'branch') push(corpStaff, '法人');
  sites.forEach((x) => push(x.staff, x.name));
  return out;
}

/* ---------------- 変更のお申し込み（部品21 の変更のお申し込み） ---------------- */
export type ChKind = 'chg' | 'opt' | 'eqp' | 'inf' | 'cop' | 'sus' | 'rsm' | 'cxl';
export const KIND_OF_PROC: Record<ProcKey, ChKind> = { plan: 'chg', dlv: 'opt', eq: 'eqp', info: 'inf', corp: 'cop', pause: 'sus', resume: 'rsm', cancel: 'cxl' };
export type KindDef = { k: ChKind; t: string; c: string; d: string; f: string; need: 'active'; also?: 'suspended' } | { k: ChKind; t: string; c: string; d: string; f: string; need: 'suspended'; also?: undefined };
export const KINDS: (KindDef & { corp?: boolean })[] = [
  { k: 'chg', t: 'プランの変更', c: 'blue', d: 'ご利用人数が変わったときに、プランと配送の内容を変えます。設備も一緒に変わることがあります。', f: '料金が変わります', need: 'active' },
  { k: 'opt', t: '配送の変更', c: 'ind', d: '配送方法・お届け回数の変更です。お届けできない曜日は「拠点情報の変更」からお申し込みください。プランはそのままです。その他オプションの追加・おやめはご要望欄にお書きください（ESキッチンが承ります）。', f: '月額料金が変わることがあります', need: 'active' },
  { k: 'eqp', t: '設備の変更', c: 'pur', d: '冷蔵庫・冷凍庫などの追加、サイズの変更、返却です。プランに含まれる設備のサイズも変えられます。', f: '差額のご請求や最低利用期間の数え直しがあります', need: 'active' },
  { k: 'inf', t: '拠点情報の変更', c: 'teal', d: 'お届け先名・住所・電話番号・請求書の宛先・ゲストモード・お届けできない曜日・設備の希望日など、ESキッチンの承認が必要な拠点の情報を変えます。従業員数・備考・FAX番号・ご担当者などは拠点管理の「編集」ですぐ変更できます（承認は不要。ご担当者の変更はESキッチンへお知らせします）。ES-QR の利用設定はESキッチンだけが変更できます（参照のみ）。', f: 'ご契約の内容（プラン・料金）は変わりません', need: 'active' },
  { k: 'cop', t: '法人情報の変更', c: 'teal', d: '請求書に載る法人の住所・電話番号・FAX番号を変えます。法人名・フリガナ・請求先法人名は、拠点管理の「編集」ですぐ変更できます（承認は不要）。', f: '承認後、未発行の請求書から新しい内容になります', need: 'active', corp: true },
  { k: 'sus', t: '休止', c: 'amb', d: '改装・長期休業などで一時的に止めます。設備は引き揚げるか、置いたままにするかを選べます。ご契約は残ります。', f: '休止できるのは通算1年までです', need: 'active' },
  { k: 'rsm', t: '再開', c: 'grn', d: '休止していた拠点のお届けを再開します。引き揚げた設備は設置し直します。', f: 'ご契約番号は変わりません', need: 'suspended' },
  { k: 'cxl', t: '解約', c: 'red', d: 'ご利用を終了します。最低利用期間の残りがある場合は違約金がかかります。', f: '元に戻せません', need: 'active', also: 'suspended' },
];
export const kindOf = (k: string) => KINDS.find((x) => x.k === k) ?? null;

/**
 * 申し込めるサイクル：today（受付日。yyyy/mm/dd・yyyy-mm-dd のどちらでも）の月から4つのご利用月。
 * 締切（既定 前月15日）までなら翌月のご利用月から、過ぎたら翌々月から選べる（申込フォーム §10-5・台帳 運営A H10）。
 * 運営の代理入力は、今日ではなく受付日を渡す
 */
export function cycles(today: string) {
  const t = today.replace(/-/g, '/');
  const m = /^(\d{4})\/(\d{1,2})/.exec(t);
  const y0 = m ? +m[1] : 2026, m0 = m ? +m[2] : 10;
  const p2 = (n: number) => String(n).padStart(2, '0');
  return [0, 1, 2, 3].map((n) => {
    const mi = m0 - 1 + n, y = y0 + Math.floor(mi / 12), mo = (mi % 12) + 1;
    const pi = mi - 1, py = y0 + Math.floor(pi / 12), pm = ((pi % 12) + 12) % 12 + 1;
    const close = `${py}/${p2(pm)}/15`;
    return { v: `${y}年${mo}月`, close, ok: close >= t, t: `${y}年${mo}月分（申込締切 ${close}）` };
  });
}
export const firstCycle = (today: string) => cycles(today).find((c) => c.ok) ?? cycles(today)[3];

/** 解約日（2026/10/05 F1・決定 D4＝A）：適用月の前のサイクルの末日。サイクルの期間（サイクル暦 lib/domain/seed/delivery.ts の a1〜d7 と同じ。末日が解約日になる）。受付日が先の月になっても選べるよう、暦の最後（2027年4月サイクルの前）まで */
const CYC_SPAN: Record<string, [string, string]> = {
  '2026年9月': ['2026/09/07', '2026/10/11'], '2026年10月': ['2026/10/12', '2026/11/08'], '2026年11月': ['2026/11/09', '2026/12/06'], '2026年12月': ['2026/12/07', '2027/01/03'],
  '2027年1月': ['2027/01/04', '2027/01/31'], '2027年2月': ['2027/02/01', '2027/02/28'], '2027年3月': ['2027/03/01', '2027/03/28'],
};
function prevCycV(v: string) { const m = /^(\d{4})年(\d{1,2})月/.exec(v); if (!m) return ''; let y = +m[1], mo = +m[2] - 1; if (mo < 1) { mo = 12; y--; } return y + '年' + mo + '月'; }
export function cxlOpts(today: string) {
  return cycles(today).map((c) => { const pv = prevCycV(c.v), sp = CYC_SPAN[pv]; return sp ? { v: sp[1], last: pv, apply: c.v, close: c.close, ok: c.ok } : null; }).filter((o): o is NonNullable<typeof o> => !!o);
}

/** プランの変更で選べるプラン。（ESライト（自販機））＝冷蔵庫→自販機の切替（現場調査のあと運営が承認・開始月を決める：台帳 2026/10/03） */
export const PLANS = ['50プラン（ESライト）', '50プラン（ESスタンダード）', '50プラン（ESライト（自販機））', '100プラン（ESライト）', '100プラン（ESスタンダード）', '100プラン（ESライト（自販機））', '150プラン（ESライト）', '150プラン（ESスタンダード）', '150プラン（ESライト（自販機））'];
export const INF_WHAT = ['お届け先名・フリガナ', 'お届け先の住所', '電話番号', '請求書の宛先', 'ゲストモード', 'お届けできない曜日', '設備の希望日'];
export const COP_WHAT = ['住所', '電話番号・FAX番号'];
export const SUS_REASONS = ['オフィスの改装・移転', '長期休業・繁忙期の変動', 'ご利用人数の一時的な減少', '費用の見直し', 'その他'];
export const SUS_LENS = ['1ヶ月', '2ヶ月', '3ヶ月', '6ヶ月'];
export const SUS_MAX = 12;
export const CXL_REASONS = ['価格が高い', '廃棄が多い', 'メニューが合わない・使いにくい', '利用者が少ない・従業員数が減った', '一時的に利用しない', '移転・組織変更', 'その他'];
/** 解約の引き止めシナリオ（案・台帳 F 2026-10-08）：理由に応じた案内。plan＝『プラン変更を申請』ボタンを出す。文面は青山様のベースをもとに調整する */
export const CXL_GUIDE: Record<string, { title: string; lines: string[]; plan?: boolean }> = {
  '価格が高い': { title: 'プランや割引・オプションを見直すと、お支払いが下がることがあります', lines: ['廃棄率・ご利用状況を踏まえて、プランを下げる（プラン数の見直し）ことをおすすめします。', '割引・オプションの見直しもご案内できます。'], plan: true },
  '廃棄が多い': { title: 'プラン数やご注文内容を見直すと、廃棄を減らせることがあります', lines: ['プラン数の見直しをおすすめします。', 'AIおすすめによるご注文内容の見直しもできます。'], plan: true },
  'メニューが合わない・使いにくい': { title: 'ご希望をお聞かせください', lines: ['オーダー希望アンケートで、メニューのご希望をお伝えいただけます。', '担当者との面談（相談）もご予約いただけます。'] },
  '利用者が少ない・従業員数が減った': { title: 'プランを下げたり、ご利用を増やしたりできます', lines: ['ご利用人数に合わせてプランを下げることができます。', 'ご利用を増やすための案内（アンケート・告知）もご用意しています。'], plan: true },
  '一時的に利用しない': { title: '解約ではなく、休止にすることもできます', lines: ['改装や長期休業の間だけ止める「休止」をご利用いただけます（通算12ヶ月まで。休止の期間と再開予定月を選びます）。'] },
  '移転・組織変更': { title: '住所やご担当者の変更だけで続けられます', lines: ['お届け先の住所・ご担当者の変更は、「変更のお申し込み」（拠点情報の変更）や拠点の「編集」からお手続きできます。'] },
  'その他': { title: 'ご事情をお聞かせください', lines: ['下の「詳しくお聞かせください」にご記入ください。担当者からご連絡します。'] },
};
export const CXL_RETAIN = ['プラン変更を申請', '担当者に相談', 'そのまま解約を続ける'];
export const EQ_ACTS = ['設備を追加したい', '設備を回収してほしい', '機種を変えたい（サイズアップ）'];
export const EQ_INST = '設置代行を希望する（費用はESキッチンが見積もります）';
/** 対象の設備の選択肢の台数（「…（2台）」の末尾） */
export const eqQty = (s: string) => { const m = /（(\d+)台）$/.exec(s || ''); return m ? parseInt(m[1], 10) : 0; };
export const EQ_MODELS = ['RF000001　冷蔵ショーケース 48L　無料', 'RF000002　冷蔵ショーケース 84L', 'RF000003　冷蔵ショーケース 105L', 'RF000004　冷蔵ショーケース 142L', 'FZ000001　業務用冷凍庫 FZ-600', 'MW000001　業務用電子レンジ MRO-1200', 'BX000001　ボックス《仕切り皿》', 'BX000002　ボックス《深皿》'];
export const lenMonths = (s: string) => { const m = /^(\d+)ヶ月/.exec(s || ''); return m ? parseInt(m[1], 10) : 0; };
export function addCycMonths(v: string, n: number) {
  const m = /^(\d{4})年(\d{1,2})月/.exec(v || ''); if (!m || !n) return '';
  let y = +m[1], mo = +m[2] + n - 1; y += Math.floor(mo / 12); mo = (mo % 12) + 1;
  return y + '年' + mo + '月';
}
/** 配送回数の選択肢（標準／＋1回／＋2回） */
/* 1回の金額はオプションマスタの配送回数追加（OP000001）。サーバーが拠点の apply.dlvFee に入れる */
export const dChoices = (n: number, fee: number) => [...Array.from({ length: Math.max(0, n - 1) }, (_, i) => i + 1).map((k) => k + '回（標準より少なく・料金は変わりません）'), n + '回（プラン標準）', n + 1 + `回（標準＋1回・＋${yen(fee)}／月）`, n + 2 + `回（標準＋2回・＋${yen(fee * 2)}／月）`];

/** ご希望の内容の1欄 */
export type ChField = { key: string; label: string; req?: boolean; type: 'sel' | 'text' | 'ta' | 'chk' | 'date' | 'ro'; opts?: string[]; value?: string; ap?: string; hint?: string; wide?: boolean; ph?: string };
/** 設備の1行（いまお使いのもの）と、解約日ごとの違約金の目安（設備ごと） */
export type ChEquip = { name: string; qty: number };
export type ChPen = { total: number; rows: { name: string; qty: number; remaining: number; min: number; yen: number }[] };
export type ChSite = { equip?: ChEquip[]; pen?: Record<string, ChPen>; id: string; name: string; cp: string; plan: string; state: 'active' | 'suspended'; start: string; term: string; qr: string; trial: string; apply: { vend?: boolean; dstd: number; dlvFee?: number; cur: { ship: string; dcount: string; ng: string }; susUsed?: number; prev?: Record<string, string> } };

/** 手続きごとの欄（元の chFields を、この画面で使うものにしたもの） */
export function chFields(k: ChKind, b: ChSite | null, v: Record<string, string>, today: string): ChField[] {
  const cyc: ChField = { key: 'cyc', label: '開始したいご利用月', req: true, type: 'sel', opts: cycles(today).filter((c) => c.ok).map((c) => c.v), hint: '締切までのお申し込みは翌月のご利用月から、締切を過ぎると翌々月からの反映です。いちばん早くて ' + firstCycle(today).v + 'です。' };
  const why = (label: string, ph?: string): ChField => ({ key: 'why', label, type: 'ta', wide: true, ph });
  if (k === 'chg') return [cyc, { key: 'plan', label: '変更後のプラン', req: true, type: 'sel', opts: PLANS.filter((x) => x !== b?.plan), hint: 'いまのプラン（' + (b?.plan || '—') + '）は選べません。' }, why('変更の理由', '例）1月の増員で提供数が足りないため')];
  if (k === 'inf') {
    const what = (v.what || '').split('／').filter(Boolean), has = (x: string) => what.includes(x);
    const f: ChField[] = [cyc,
      { key: '_qr', label: 'ES-QR の利用設定', type: 'ro', ap: 'ref', value: b?.qr || '—' },
      { key: '_trial', label: 'お試し期間月数', type: 'ro', ap: 'ref', value: b?.trial || '—' },
      { key: 'what', label: '変更したいもの', req: true, type: 'chk', wide: true, opts: INF_WHAT, hint: '変更したいものだけチェックしてください。チェックしたものの欄だけが下に出ます。' }];
    if (has('お届け先名・フリガナ')) f.push({ key: 'name', label: 'お届け先名（変更後）', req: true, ap: 'req', type: 'text', ph: '例）大阪支店（北浜オフィス）' }, { key: 'kana', label: '拠点名フリガナ（変更後）', req: true, ap: 'req', type: 'text', ph: '例）オオサカシテン キタハマ' });
    if (has('お届け先の住所')) f.push(
      { key: 'zip', label: '郵便番号（変更後）', req: true, ap: 'req', type: 'text', ph: '例）541-0041' },
      { key: 'pref', label: '都道府県（変更後）', req: true, ap: 'req', type: 'sel', opts: PREFS },
      { key: 'city', label: '市区町村（変更後）', req: true, ap: 'req', type: 'text' },
      { key: 'addr1', label: '町域・番地（変更後）', req: true, ap: 'req', type: 'text' },
      { key: 'addr2', label: '建物・部屋番号（変更後）', ap: 'req', type: 'text', wide: true });
    if (has('電話番号')) f.push({ key: 'tel', label: '電話番号（変更後）', req: true, ap: 'req', type: 'text' });
    if (has('請求書の宛先')) f.push({ key: 'bill', label: '請求書（変更後）', req: true, ap: 'req', type: 'sel', opts: ['この拠点に請求', '法人に請求'], hint: 'お支払い方法は、請求書の宛先（法人または納品先）の設定に従います。お支払い方法そのものを変えたい場合は、お問い合わせください（このお申し込みでは変えられません）。' });
    if (has('ゲストモード')) f.push({ key: 'guest', label: 'ゲストモード（変更後）', req: true, ap: 'req', type: 'sel', opts: ['利用する', '利用しない'] });
    if (has('お届けできない曜日')) f.push({ key: 'ng', label: 'お届けできない曜日（変更後）', req: true, ap: 'req', type: 'chk', wide: true, opts: WD });
    if (has('設備の希望日')) f.push({ key: 'eqdate', label: '設備の希望日（変更後）', req: true, ap: 'req', type: 'date', hint: '設備の入替・再設置・引揚のご希望日です（拠点詳細の「設置・引揚の予定」の引揚希望日・搬入希望日・設置予定日）。ESキッチンが調整してご連絡します。' });
    f.push(why('ご事情・ご要望', '例）オフィスを移転したため、お届け先と電話番号が変わります'));
    return f;
  }
  if (k === 'cop') {
    const wc = (v.what || '').split('／').filter(Boolean), hc = (x: string) => wc.includes(x);
    const g: ChField[] = [{ key: 'what', label: '変更したいもの', req: true, type: 'chk', wide: true, opts: COP_WHAT, hint: '請求書に載る内容です。変更したいものだけチェックしてください。承認のあと、未発行の請求書から新しい内容になります（発行済みの請求書はそのまま）。' }];
    if (hc('住所')) g.push(
      { key: 'zip', label: '郵便番号（変更後）', req: true, ap: 'req', type: 'text', ph: '例）105-0011' },
      { key: 'pref', label: '都道府県（変更後）', req: true, ap: 'req', type: 'sel', opts: PREFS },
      { key: 'city', label: '市区町村（変更後）', req: true, ap: 'req', type: 'text' },
      { key: 'addr1', label: '町域・番地（変更後）', req: true, ap: 'req', type: 'text' },
      { key: 'addr2', label: '建物・部屋番号（変更後）', ap: 'req', type: 'text', wide: true });
    if (hc('電話番号・FAX番号')) g.push({ key: 'tel', label: '電話番号（変更後）', req: true, ap: 'req', type: 'text' }, { key: 'fax', label: 'FAX番号（変更後）', ap: 'req', type: 'text' });
    g.push(why('理由', '例）代表番号の変更のため'));
    return g;
  }
  if (k === 'opt') return [cyc,
    b?.apply.vend
      ? { key: '_shipfix', label: '配送方法', type: 'ro', value: 'ES配送便（自動販売機のある拠点は固定です）' }
      : { key: 'ship', label: '配送方法', req: true, type: 'sel', opts: ['変更しない', 'ES配送便', 'COOL便'], hint: 'ES配送便＝ESキッチンの便、クール便＝宅配便でのお届けです。※ES配送便に変えるときは、お届けエリアごとに料金が異なります。' },
    { key: 'dcount', label: 'お届け回数', req: true, type: 'sel', opts: ['変更しない', ...dChoices(b?.apply.dstd ?? 1, b?.apply.dlvFee ?? 0)], hint: '標準の回数はプランで決まります（' + (b?.apply.dstd ?? 1) + '回）。標準を超えた分は、お届け回数追加（1回あたり月額 ' + yen(b?.apply.dlvFee ?? 0) + '）がかかります。標準より減らすこともできますが、料金は下がりません。' },
    { key: '_ngro', label: 'お届けできない曜日', type: 'ro', ap: 'req', wide: true, value: (b?.apply.cur.ng || 'なし') + '（いまの設定）。お届けできない曜日の変更は「拠点情報の変更」からお申し込みください（ESキッチンの承認が必要です）。' },
    why('ご要望・ご事情', '例）水曜の午前は会議で受け取れないため、配送時間帯を午後にしてください')];
  if (k === 'eqp') {
    const act = v.act || '', needTarget = act === '設備を回収してほしい' || act === '機種を変えたい（サイズアップ）';
    const own = (b?.equip ?? []).map((x) => x.name + '（' + x.qty + '台）');
    const cap = needTarget ? eqQty(v.target) || 0 : 3;
    const g: ChField[] = [cyc, { key: 'act', label: 'ご希望の内容', req: true, type: 'sel', opts: EQ_ACTS, hint: '回収・機種変更は、いまお使いの設備の中からお選びいただきます。' }];
    if (needTarget) g.push({ key: 'target', label: '対象の設備（いまお使いのもの）', req: true, type: 'sel', wide: true, opts: own, hint: own.length ? '' : 'いまお使いの設備がありません。' });
    if (act !== '設備を回収してほしい') g.push({ key: 'model', label: act === '設備を追加したい' ? '追加したい設備' : '変更後の設備', req: true, type: 'sel', wide: true, opts: EQ_MODELS, hint: '在庫の都合で、より近いサイズをご提案する場合があります。' });
    g.push(
      { key: 'qty', label: '台数', req: true, type: 'sel', opts: Array.from({ length: Math.max(1, cap) }, (_, i) => (i + 1) + '台'), hint: act === '設備を追加したい' ? '増やす台数をお選びください。' : needTarget ? '対象の設備の台数まで選べます。先に対象の設備をお選びください。' : '' },
      { key: 'wish', label: '希望日', type: 'date', hint: '設置・回収・入れ替えのご希望日です。ESキッチンが調整してご連絡します。' },
      { key: 'inst', label: '設置代行', type: 'chk', wide: true, opts: [EQ_INST], hint: '設置代行は費用がかかります。金額はESキッチンが承認のときにお知らせします。' },
      why('ご要望・ご事情', '例）増員で入りきらないため、冷蔵庫を1台増やしたいです'));
    return g;
  }
  if (k === 'sus') {
    const used = b?.apply.susUsed ?? 0, rem = Math.max(0, SUS_MAX - used), n = lenMonths(v.len);
    return [
      { key: 'why', label: '休止の理由', req: true, type: 'sel', opts: SUS_REASONS, wide: true },
      cyc,
      { key: 'eqkeep', label: '休止中の設備', req: true, type: 'sel', opts: ['引き揚げる', '置いたままにしたい（保管料はかかりません）'], hint: '置いたままにしても保管料はかかりません。置いたままの設備は、休止中の最低利用期間のカウントが止まります（引き揚げた設備も、設置し直したときに休止前の残りを引き継ぎます）。設備を置いたままなら、休止中も社員の方はアプリで購入できます。休止が通算1年を超えそうなときは、解約をご案内して設備を引き揚げます。' },
      { key: '_used', label: '通算の休止月数（過去の休止の累計）', type: 'ro', value: used + 'ヶ月　過去に休止した月数の合計（通算）' },
      { key: '_rem', label: '残り月数', type: 'ro', value: rem > 0 ? rem + 'ヶ月　通算' + SUS_MAX + 'ヶ月まで' : '0ヶ月　通算' + SUS_MAX + 'ヶ月に達しているため、休止はお申し込みできません（解約をご案内します）' },
      { key: 'len', label: '休止したい期間', req: true, type: 'sel', opts: SUS_LENS.filter((s) => lenMonths(s) <= rem), hint: '休止できるのは通算1年（12ヶ月）までです。過去の休止の累計を引いた「残り月数」を超える期間は選べません。再開予定月は、開始したいご利用月と期間から決まります。再開はあらためてお申し込みください。' },
      { key: '_resume', label: '再開予定月', type: 'ro', value: v.cyc && n ? addCycMonths(v.cyc, n) + '分　今回の休止後の通算 ' + (used + n) + 'ヶ月・残り ' + Math.max(0, SUS_MAX - used - n) + 'ヶ月' : '開始したいご利用月と休止したい期間をお選びください（再開予定月が決まります）' },
      { key: 'memo', label: '差し支えなければ詳しくお聞かせください', type: 'ta', wide: true, ph: '例）2月から4月までオフィスを改装するため、在席者がほとんどいません' }];
  }
  if (k === 'rsm') return [
    { key: 'cyc', label: '再開するご利用月', req: true, type: 'sel', opts: cycles(today).filter((c) => c.ok).map((c) => c.v), hint: '締切までのお申し込みは翌月のご利用月から、締切を過ぎると翌々月からの反映です。' },
    { key: 'plan', label: '再開後のプラン', req: true, type: 'sel', opts: PLANS, hint: '休止前は ' + (b?.plan || '—') + ' でした。同じでも、変えてもかまいません。' },
    { key: 'chg', label: '休止前のご契約内容（コース・配送・設備・お届け先・ご担当者・請求書）', req: true, type: 'sel', opts: ['変更なし', '変更あり'], wide: true, hint: '休止前：' + Object.values(b?.apply.prev ?? {}).join('／') },
    why('ご要望', '例）冷蔵庫は休止前と同じ場所に設置してください')];
  return [
    { key: 'end', label: '解約日', req: true, type: 'sel', wide: true, opts: cxlOpts(today).filter((o) => o.ok).map((o) => o.v + '（' + o.last + '分の末日）　適用月 ' + o.apply + '分（申込締切 ' + o.close + '）'), hint: '解約の受付は、ご注文・変更の締切（前月15日）で判定します。締切までのお申し込みは翌月のご利用月から、締切を過ぎると翌々月のご利用月から適用します（REQ-CT-257）。適用月＝ご利用がなくなる最初のご利用月、解約日＝適用月の前のご利用月の末日です（デモでの仮置きの解釈）。' },
    { key: 'why', label: '解約の理由', req: true, type: 'sel', opts: CXL_REASONS },
    { key: 'stock', label: '残った商品（在庫）の扱い', req: true, type: 'sel', opts: CXL_STOCK, wide: true, hint: 'どちらを選んでも、最後の棚卸報告は必要です。「返却」を選んだ場合は買取のご請求はなく、ESキッチンが確認・承認したあとに、返却のご案内をメールでお送りします。' },
    { key: 'memo', label: '差し支えなければ詳しくお聞かせください', type: 'ta', wide: true }];
}

/** 入力チェック（未入力の欄のキー。休止は残り月数も） */
/** ご事情・ご要望・詳しく：最大500文字（仕様 3-1・E04） */
const TA_MAX = 500;
export function chErrors(k: ChKind, b: ChSite | null, v: Record<string, string>, today: string): Record<string, string> {
  const e: Record<string, string> = {};
  chFields(k, b, v, today).forEach((f) => {
    if (f.req && f.type !== 'ro' && !String(v[f.key] ?? '').trim()) e[f.key] = f.type === 'sel' ? f.label + 'を選択してください。' : f.label + 'をご入力ください。';
  });
  if (e.what) e.what = '変更する項目を1つ以上選んでください。';
  chFields(k, b, v, today).filter((f) => f.type === 'ta' && String(v[f.key] ?? '').length > TA_MAX).forEach((f) => { e[f.key] = f.label + 'は' + TA_MAX + '文字以内でご入力ください。'; });
  if (k === 'eqp' && v.qty && v.target && !e.qty && parseInt(v.qty, 10) > eqQty(v.target)) e.qty = '台数は対象の設備の台数（' + eqQty(v.target) + '台）までです。';
  /* 配送の変更：配送方法もお届け回数も「変更しない」のままで、ご要望も空なら送れない（仕様 §6-2・Message List。ご要望に書けばオプションの追加・おやめを受けられる） */
  if (k === 'opt' && !e.dcount && (b?.apply.vend || v.ship === '変更しない') && v.dcount === '変更しない' && !String(v.why ?? '').trim()) e.dcount = '変更する項目を1つ以上選んでください。';
  if (k === 'cxl' && !e.retain && !v.retain) e.retain = 'ご案内を確認して、お進みの方法をお選びください。';
  if (v.zip && !e.zip && !RV_VT.zip.re.test(rvZ2h(v.zip))) e.zip = RV_VT.zip.msg;
  for (const [key, label] of [['tel', '電話番号'], ['fax', 'FAX番号']] as const) {
    const x = v[key] ? rvZ2h(v[key]) : '';
    if (x && !e[key]) e[key] = !RV_VT.tel.re.test(x) ? RV_VT.tel.msg : !TEL_DIGITS.test(x.replace(/-/g, '')) ? TEL_DIGITS_MSG(label) : '';
    if (!e[key]) delete e[key];
  }
  if (k === 'sus') {
    const rem = Math.max(0, SUS_MAX - (b?.apply.susUsed ?? 0)), n = lenMonths(v.len);
    if (rem <= 0) e.len = '通算の休止が12ヶ月に達しているため、休止はお申し込みできません。解約をご案内します。';
    else if (n > rem) e.len = '休止の期間が残り月数を超えているため申し込めません。通算の休止は12ヶ月までです。';
  }
  return e;
}

/** 確認の画面・申請に載せる、手続きごとの中身（[項目, 値]） */
export function chSummary(k: ChKind, b: ChSite | null, v: Record<string, string>): [string, string][] {
  const out: [string, string][] = [];
  const add = (l: string, x?: string) => { if (x) out.push([l, x]); };
  if (k === 'cxl') add('解約日', v.end);
  else if (k !== 'cop') add(k === 'rsm' ? '再開するご利用月' : '開始したいご利用月', v.cyc ? v.cyc + '分' : '');
  if (k === 'chg') { add('いまのプラン', b?.plan); add('変更後のプラン', v.plan); }
  if (k === 'opt') { add('配送方法', b?.apply.vend ? 'ES配送便（固定）' : v.ship); add('配送回数', v.dcount); }
  if (k === 'eqp') { add('ご希望の内容', v.act); add('対象の設備', v.target); add(v.act === '設備を追加したい' ? '追加したい設備' : '変更後の設備', v.model); add('台数', v.qty); add('希望日', v.wish); add('設置代行', v.inst ? '希望する' : ''); }
  if (k === 'inf' || k === 'cop') {
    add('変更したいもの', v.what);
    add('お届け先名・フリガナ', [v.name, v.kana].filter(Boolean).join('　'));
    add('住所', [v.zip ? '〒' + v.zip : '', v.pref, v.city, v.addr1, v.addr2].filter(Boolean).join(' '));
    add('電話番号', v.tel); add('FAX番号', v.fax); add('請求書の宛先', v.bill); add('ゲストモード', v.guest); add('お届けできない曜日', v.ng); add('設備の希望日', v.eqdate);
  }
  if (k === 'sus') { add('休止の理由', v.why); add('休止中の設備', v.eqkeep); add('休止したい期間', v.len); add('再開予定月', v.cyc && lenMonths(v.len) ? addCycMonths(v.cyc, lenMonths(v.len)) + '分' : ''); add('詳しく', v.memo); }
  if (k === 'rsm') { add('再開後のプラン', v.plan); add('休止前の内容', v.chg); }
  if (k === 'cxl') { add('解約の理由', v.why); add('ご案内へのお返事', v.retain); add('残った商品（在庫）の扱い', v.stock); add('詳しく', v.memo); }
  if (k !== 'sus' && k !== 'cxl') add(k === 'chg' ? '変更の理由' : k === 'cop' ? '理由' : 'ご事情・ご要望', v.why);
  return out;
}
/** 一覧に出す申請内容（短く） */
export function chWhat(k: ChKind, b: ChSite | null, v: Record<string, string>): string {
  if (k === 'chg') return (b?.plan || '') + ' → ' + (v.plan || '');
  if (k === 'opt') return [v.ship && v.ship !== '変更しない' ? '配送方法 ' + v.ship : '', v.dcount && v.dcount !== '変更しない' ? 'お届け回数 ' + v.dcount : ''].filter(Boolean).join('・') || '配送の変更';
  if (k === 'eqp') return [v.act, v.model || v.target, v.qty].filter(Boolean).join('・');
  if (k === 'inf' || k === 'cop') return v.what || '';
  if (k === 'sus') return lenMonths(v.len) + 'ヶ月休止（' + (/^置いたまま/.test(v.eqkeep || '') ? '設備は置いたまま' : '設備は引き揚げる') + '）';
  if (k === 'rsm') return '再開（' + (v.plan || '') + '）';
  return '解約（解約日 ' + (v.end || '').split('（')[0] + '）';
}
