import { ApiError } from '@/lib/api/errors';
import type { CsvEntity, RowError, RowResult } from '@/lib/domain/csv';
import { rowResult } from '@/lib/domain/csv';
import apply from '@/lib/domain/areas/apply';
import { CHARGE_IDS } from '@/lib/domain/charges';
import type { Address, Application, Billing, Corp, Course, NewSetup, Option, Plan } from '@/lib/domain/types';
import applications from '@/lib/ops/areas/applications';
import { NF_ROUTES } from '@/lib/ops/applications/constants';
import { nfBlankBranch, type NfBranch, type NfForm } from '@/lib/ops/applications/logic';
import { today } from '@/lib/supplier/dates';
import { matchHeader, parseCell, type CsvColSpec } from './core';

/*
 * 新規申込の CSV 一括取込（申込フォーム.md §10-8-1・台帳「新規申込の CSV 一括取込」2026/10/03）。
 *   1行＝1拠点（契約）。同じ「法人キー」の行を1つの申込にまとめる（法人・申込の列は最初の行。ほかの行は空欄か同じ値）。
 *   取り込むと申込ごとに「受付中」（代理入力）。あとは画面から来た申込と同じ流れ（申込内容確認 → 仮登録 → 詳細情報設定 → 本登録）。
 *   法人ID を入れた行は今ある法人に拠点を足す申込。切替（お試し→本導入）は CSV では受けない（画面で）。
 *   受付の中身（法人・拠点の住所・担当者・設置フロア・オプション・支払い）は受付の画面と同じもの（apply.saveSetup）に入れる。
 *   受付の中身に欄のない値（お試し期間月数・アカウントを発行するか・請求担当者・お申し込み者・配送回数・納品不可の扱い・配送の希望・備考）は申請の中身（request）に残す
 */

type Col = CsvColSpec & { k: string; corp?: boolean; req?: boolean };
const YN = ['1', '0'];
const PAY = ['口座振替', '銀行振込', 'クレジットカード'];
const CYCLE = ['月払い', '年払い'];
const LEAD: Record<string, Billing['lead']> = { '3ヶ月前': -3, '2ヶ月前': -2, '1ヶ月前': -1, 当月: 0, '翌月（後払い）': 1 };
const EQUIP = ['冷蔵庫・冷凍庫', '自動販売機'];
const COURSE = ['ESライト', 'ESスタンダード'];
const SHIPS = ['ES配送便', 'COOL便'];
const SHORT = ['通常', '短消費期限なし'];
const SHIFT = ['前倒す', '後ろ倒す'];
const BILL = ['法人に請求', 'この拠点に請求'];

/**
 * 列（申込フォーム.md §10-8-1 の順）。corp＝法人・申込の列（申込で1つ）、req＝必須（必須の列は見出しに【】を付けない＝共通の見出しの確かめ）。
 * アカウントを発行するか＝1／0、お申し込み者＝担当者のメールのどれか、プラン＝公開中のプランID、自動販売機の配送方法は ES配送便
 */
const COLS: Col[] = [
  { label: '法人キー', k: 'key', corp: true, req: true },
  { label: '受付経路', k: 'route', corp: true, req: true, opts: NF_ROUTES },
  { label: 'ES営業担当', k: 'es', corp: true, max: 50 },
  { label: '契約区分', k: 'kubun', req: true, opts: ['本導入', 'お試し'] },
  { label: 'お試し期間月数', k: 'trialMonths', type: 'int', min: 1, maxNum: 12, hint: 'お試しのとき必須' },
  { label: 'アカウントを発行するか', k: 'issue', corp: true, req: true, opts: YN },
  { label: '法人ID', k: 'corpId', corp: true, hint: '今ある法人に拠点を足すとき（CU＋5桁）。空欄＝新しい法人' },
  { label: '法人名', k: 'cname', corp: true, max: 60 },
  { label: '法人名フリガナ', k: 'ckana', corp: true, max: 60 },
  { label: '請求先法人名', k: 'cbill', corp: true, max: 60 },
  { label: '法人の郵便番号', k: 'czip', corp: true, max: 8 },
  { label: '法人の都道府県', k: 'cpref', corp: true, max: 10 },
  { label: '法人の市区町村・番地', k: 'ccity', corp: true, max: 100 },
  { label: '法人の建物', k: 'cbld', corp: true, max: 100 },
  { label: '法人の電話番号', k: 'ctel', corp: true, max: 20 },
  { label: '法人のFAX番号', k: 'cfax', corp: true, max: 20 },
  { label: '法人の支払い方法', k: 'cpay', corp: true, opts: PAY },
  { label: '法人の支払サイクル', k: 'ccycle', corp: true, opts: CYCLE },
  { label: '請求書の発行時期', k: 'clead', corp: true, opts: Object.keys(LEAD) },
  { label: '法人メイン担当者名', k: 'm_name', corp: true, max: 60 },
  { label: '法人メイン担当者フリガナ', k: 'm_kana', corp: true, max: 60 },
  { label: '法人メイン担当者メール', k: 'm_mail', corp: true, max: 200 },
  { label: '法人メイン担当者電話', k: 'm_tel', corp: true, max: 20 },
  { label: '法人請求担当者名', k: 'b_name', corp: true, max: 60, hint: '空欄＝メイン担当者と同じ' },
  { label: '法人請求担当者フリガナ', k: 'b_kana', corp: true, max: 60 },
  { label: '法人請求担当者メール', k: 'b_mail', corp: true, max: 200 },
  { label: '法人請求担当者電話', k: 'b_tel', corp: true, max: 20 },
  { label: 'お申し込み者', k: 'applicant', corp: true, req: true, max: 200 },
  { label: '設備タイプ', k: 'equip', req: true, opts: EQUIP },
  { label: 'プラン', k: 'plan', req: true },
  { label: 'コース', k: 'course', req: true, opts: COURSE },
  { label: '配送方法', k: 'ship', req: true, opts: SHIPS },
  { label: '配送回数（月）', k: 'count', req: true, type: 'int', min: 1, maxNum: 8 },
  { label: '契約開始希望年月', k: 'start', type: 'ym', hint: '本導入のとき必須（yyyy-mm）' },
  { label: '設置フロア', k: 'floor', max: 60, hint: '自動販売機は必須' },
  { label: 'オプション', k: 'options', max: 200, hint: 'オプションコードを ; でつなぐ' },
  { label: '消費期限の短い商品の扱い', k: 'short', req: true, opts: SHORT },
  { label: 'プラン外の備考', k: 'note', max: 500 },
  { label: '納品先名', k: 'name', req: true, max: 60 },
  { label: '納品先名フリガナ', k: 'kana', req: true, max: 60 },
  { label: '納品先の郵便番号', k: 'zip', req: true, max: 8 },
  { label: '納品先の都道府県', k: 'pref', req: true, max: 10 },
  { label: '納品先の市区町村・番地', k: 'city', req: true, max: 100 },
  { label: '納品先の建物', k: 'bld', max: 100 },
  { label: '納品先の電話番号', k: 'tel', req: true, max: 20 },
  { label: '納品先のFAX番号', k: 'fax', max: 20 },
  { label: '従業員数概算', k: 'emp', req: true, type: 'int', min: 0, maxNum: 99999 },
  { label: '納品不可曜日', k: 'ng', max: 50, hint: '月;水 のように' },
  { label: '納品不可になった場合', k: 'shift', req: true, opts: SHIFT },
  { label: '配送の希望', k: 'wish', max: 200 },
  { label: '請求書', k: 'billTo', req: true, opts: BILL },
  { label: '拠点の支払方法', k: 'bpay', opts: PAY, hint: 'この拠点に請求のとき必須' },
  { label: '拠点の支払サイクル', k: 'bcycle', opts: CYCLE, hint: 'この拠点に請求のとき必須' },
  { label: '拠点メイン担当者名', k: 's_name', req: true, max: 60 },
  { label: '拠点メイン担当者フリガナ', k: 's_kana', max: 60 },
  { label: '拠点メイン担当者メール', k: 's_mail', req: true, max: 200 },
  { label: '拠点メイン担当者電話', k: 's_tel', max: 20 },
];
const MAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const addr = (zip: string, pref: string, city: string, bld: string): Address => ({ zip, pref, ...splitCity(city), addr2: bld });
/** 「市区町村・番地」を市区町村と番地に（市・区・町・村の最後で切る。切れなければ全部を市区町村） */
function splitCity(v: string): Pick<Address, 'city' | 'addr1'> {
  const m = /^(.+?[市区町村])(.*)$/.exec(v);
  return m && m[2] ? { city: m[1], addr1: m[2] } : { city: v, addr1: '' };
}

export const newApplications: CsvEntity = {
  id: 'newApplications', screen: '契約申込新規登録', key: '法人キー', strictFile: true, cols: [], list: () => [], keyOf: () => '',
  impact: [
    '1つの法人キーごとに「受付中」の新規申込（代理入力）ができます。あとは画面と同じ受付（申込内容確認 → 仮登録 → 本登録）で進めます',
    '添付ファイル（搬入経路など）は CSV で送れません。登録後に申請詳細で添付してください',
  ],
  custom: {
    head: () => COLS.map((c) => (c.hint ? `${c.label}【${c.hint}】` : c.label)),
    required: COLS.filter((c) => c.req).map((c) => c.label),
    template: () => [
      COLS.map((c) => ({
        key: 'A', route: '電話', issue: '1', kubun: '本導入', cname: '（例）株式会社テスト', ckana: 'テスト', cbill: '（例）株式会社テスト 経理部', czip: '100-0001', cpref: '東京都', ccity: '千代田区千代田1-1',
        ctel: '03-0000-0000', cpay: '口座振替', ccycle: '月払い', clead: '1ヶ月前', m_name: '山田 太郎', m_kana: 'ヤマダ タロウ', m_mail: 'yamada@example.jp', m_tel: '03-0000-0001',
        applicant: 'yamada@example.jp', equip: '冷蔵庫・冷凍庫', plan: 'ES000004', course: 'ESスタンダード', ship: 'ES配送便', count: '2', start: '2027-01', short: '通常',
        s_name: '鈴木 一郎', s_kana: 'スズキ イチロウ', s_mail: 'suzuki@example.jp', s_tel: '03-0000-0003', name: '本社', kana: 'ホンシャ', zip: '100-0001', pref: '東京都', city: '千代田区千代田1-1', tel: '03-0000-0002', emp: '120', ng: '土;日', shift: '前倒す', billTo: '法人に請求',
      } as Record<string, string>)[c.k] ?? ''),
      COLS.map((c) => ({
        key: 'A', kubun: '本導入', start: '2027-01', equip: '自動販売機', plan: 'ES000004', course: 'ESライト', ship: 'ES配送便', count: '2', floor: '2F 休憩室', short: '通常',
        s_name: '田中 花子', s_kana: 'タナカ ハナコ', s_mail: 'tanaka@example.jp', name: '大阪営業所', kana: 'オオサカエイギョウショ', zip: '530-0001', pref: '大阪府', city: '大阪市北区梅田1-1', tel: '06-0000-0000', emp: '40', shift: '後ろ倒す', billTo: '法人に請求',
      } as Record<string, string>)[c.k] ?? ''),
    ],
    exportRows: () => [],
    run: (x, _text, lines) => {
      const m = matchHeader(lines[0].cells, COLS, COLS.filter((c) => c.req).map((c) => c.label));
      const cell = (cells: string[], l: string) => { const i = m.at.get(l); return i === undefined ? '' : (cells[i] ?? '').trim(); };
      /* 法人キーごとにまとめる（ファイルの順） */
      const groups = new Map<string, typeof lines>();
      const rows: RowResult[] = [];
      for (const l of lines.slice(1)) {
        const k = cell(l.cells, '法人キー');
        if (!k) { rows.push(rowResult(l.line, `${l.line}行目`, '', 'エラー', { errors: [{ line: l.line, col: '法人キー', msg: '法人キーを入れてください（同じ値の行が1つの申込）' }] })); continue; }
        groups.set(k, [...(groups.get(k) ?? []), l]);
      }
      const plans = x.r.list<Plan>('dm.master.plans').filter((p) => p.public && p.status === '有効');
      const opts = x.r.list<Option>('dm.master.options').filter((o) => o.status === '使用中' && o.auto === 'apply' && o.id !== CHARGE_IDS['item.esqr']);
      let created = 0;
      for (const [key, ls] of groups) {
        const errs: RowError[] = [];
        const bad = (line: number, col: string, msg: string) => errs.push({ line, col, msg });
        const C = new Map<string, { v: string; line: number }>();
        const B: Record<string, string>[] = [];
        for (const l of ls) {
          const b: Record<string, string> = { _line: String(l.line) };
          for (const c of COLS) {
            const p = parseCell(cell(l.cells, c.label), c);
            if (p.k === 'err') { bad(l.line, c.label, p.msg); continue; }
            if (p.k === 'clear') { bad(l.line, c.label, '「-」は使えません'); continue; }
            const v = p.k === 'set' ? String(p.v) : '';
            if (!c.corp) { b[c.k] = v; continue; }
            /* 法人・申込の列：最初の行の値。ほかの行は空欄か同じ値 */
            if (!v) continue;
            const was = C.get(c.k);
            if (was && was.v !== v) bad(l.line, c.label, `${was.line}行目（同じ法人キー）と違う値です。法人・申込の列は申込で1つです`);
            else if (!was) C.set(c.k, { v, line: l.line });
          }
          B.push(b);
        }
        const cv = (k: string) => C.get(k)?.v ?? '';
        const l0 = ls[0].line;
        /* 同じ欄にすでにエラーがあるとき（選べる値ではない等）は「入れてください」を重ねない（結合テスト B10） */
        const need = (line: number, label: string, v: string) => { if (!v && !errs.some((e) => e.line === line && e.col === label)) bad(line, label, `${label}を入れてください`); };
        /* 申込の列 */
        for (const c of COLS.filter((y) => y.corp && y.req && y.k !== 'key')) need(l0, c.label, cv(c.k));
        const corp = cv('corpId') ? x.r.get<Corp>('dm.org.corps', cv('corpId')) : undefined;
        if (cv('corpId') && (!corp || corp.status === '取消')) bad(l0, '法人ID', `法人 ${cv('corpId')} が見つかりません`);
        if (!cv('corpId')) {
          for (const k of ['cname', 'ckana', 'cbill', 'czip', 'cpref', 'ccity', 'ctel', 'cpay', 'ccycle', 'clead', 'm_name', 'm_kana', 'm_mail', 'm_tel'])
            need(l0, COLS.find((c) => c.k === k)!.label, cv(k));
        }
        for (const k of ['m_mail', 'b_mail']) if (cv(k) && !MAIL.test(cv(k))) bad(l0, COLS.find((c) => c.k === k)!.label, 'メールアドレスの形式が正しくありません');
        /* 拠点の列 */
        B.forEach((b) => {
          const line = +b._line;
          for (const c of COLS.filter((y) => !y.corp && y.req)) need(line, c.label, b[c.k]);
          if (b.kubun === 'お試し' && !b.trialMonths) bad(line, 'お試し期間月数', 'お試しはお試し期間月数を入れてください');
          if (b.kubun === '本導入' && !b.start) bad(line, '契約開始希望年月', '本導入は契約開始希望年月を入れてください');
          const vm = b.equip === '自動販売機';
          if (vm && !b.floor) bad(line, '設置フロア', '自動販売機は設置フロアを入れてください');
          if (vm && b.ship && b.ship !== 'ES配送便') bad(line, '配送方法', '自動販売機は ES配送便です');
          const p = plans.find((y) => y.id === b.plan);
          const course = (b.course === 'ESスタンダード' ? 'ESスタンダード' : vm ? 'ESライト（自販機）' : 'ESライト（冷蔵庫）') as Course;
          if (b.plan && !p) bad(line, 'プラン', `公開中のプランではありません（${b.plan}）`);
          else if (p && b.course && !p.prices.some((y) => y.course === course)) bad(line, 'コース', `${p.id} には ${course} がありません`);
          /* お試しはプラン50・ESライト（冷蔵庫）だけ（台帳 R・受付簿 #422） */
          if (b.kubun === 'お試し' && ((p && p.monthlyMeals !== 50) || course !== 'ESライト（冷蔵庫）')) bad(line, 'プラン', 'お試しはプラン50・ESライト（冷蔵庫）だけです');
          for (const o of (b.options || '').split(';').map((y) => y.trim()).filter(Boolean)) if (!opts.some((y) => y.id === o)) bad(line, 'オプション', `申込で選べるオプションではありません（${o}）`);
          if (b.billTo === 'この拠点に請求') { need(line, '拠点の支払方法', b.bpay); need(line, '拠点の支払サイクル', b.bcycle); }
          if (b.s_mail && !MAIL.test(b.s_mail)) bad(line, '拠点メイン担当者メール', 'メールアドレスの形式が正しくありません');
        });
        /* 契約区分は申込で1つ（本導入とお試しは別の法人キーに） */
        if (new Set(B.map((b) => b.kubun).filter(Boolean)).size > 1) bad(l0, '契約区分', '同じ法人キーの行は同じ契約区分にしてください（本導入とお試しは別の申込）');
        /* お申し込み者＝担当者のメールのどれか（A2） */
        const mails = [cv('m_mail'), cv('b_mail'), ...B.map((b) => b.s_mail)].filter(Boolean).map((y) => y.toLowerCase());
        if (cv('applicant') && !mails.includes(cv('applicant').toLowerCase())) bad(l0, 'お申し込み者', 'お申し込み者は担当者（法人・拠点）のメールアドレスのどれかを入れてください');
        const cname = corp ? corp.name : cv('cname');
        const row = rowResult(l0, key, `${cname}（${ls.length}拠点）`, 'エラー', { lines: ls.map((l) => l.line), errors: errs });
        if (!errs.length) {
          try {
            /* 画面の「登録」と同じ：applications.createIntake（受付中・代理入力） */
            const appl = [cv('m_mail') === cv('applicant') ? cv('m_name') : cv('b_mail') === cv('applicant') ? cv('b_name') : B.find((b) => b.s_mail === cv('applicant'))?.s_name ?? '', cv('applicant')];
            const f: NfForm = {
              route: cv('route'), recv: today().replace(/\//g, '-'), es: cv('es'), corpKind: corp ? '既存の法人' : '新しい法人',
              cname: corp ? '' : cv('cname'), ckana: corp ? '' : cv('ckana'), cbill: corp ? '' : cv('cbill'), caddr: corp ? '' : `${cv('cpref')}${cv('ccity')}${cv('cbld')}`, ctel: corp ? '' : cv('ctel'),
              corp: corp ? `${corp.id} ${corp.name}` : '', pname: appl[0] || cv('m_name') || '—', pkana: cv('m_kana') || '—', pmail: appl[1], ptel: cv('m_tel'),
              branches: B.map((b): NfBranch => ({
                ...nfBlankBranch(), kubun: b.kubun === 'お試し' ? 'お試しキャンペーン' : '本導入', name: b.name, zip: b.zip, addr: `${b.pref}${b.city}${b.bld}`,
                plan: b.plan, course: b.course, ship: b.equip === '自動販売機' ? 'ES配送便' : b.ship, ng: b.ng.replace(/;/g, '・'), eq: b.equip === '自動販売機' ? '自販機のみ' : '冷蔵庫',
                start: b.start || today().slice(0, 7).replace('/', '-'), staff: [b.s_name, b.s_kana, b.s_mail].filter(Boolean).join('・'), billTo: b.billTo === 'この拠点に請求' ? 'この拠点' : '法人', note: b.note, pattern: b.short, floor: b.floor,
              })),
              doc: '', photo: '',
            };
            const out = applications.actions.createIntake(x.r, { form: f, mainContact: { name: cv('m_name'), email: cv('m_mail') } });
            /* 受付の中身（受付の画面と同じ）に CSV の値を入れる */
            const cur = apply.queries.setup(x.r, { id: out.no }).setup as NewSetup;
            const setup: NewSetup = {
              ...cur,
              corp: cur.corp && !corp ? {
                ...cur.corp, name: cv('cname'), kana: cv('ckana'), address: addr(cv('czip'), cv('cpref'), cv('ccity'), cv('cbld')), tel: cv('ctel'), fax: cv('cfax'),
                contact: { name: cv('m_name'), email: cv('m_mail'), tel: cv('m_tel') },
                billing: { payMethod: cv('cpay') as Billing['payMethod'], payCycle: cv('ccycle') as Billing['payCycle'], lead: LEAD[cv('clead')] ?? -1 },
              } : cur.corp,
              branches: cur.branches.map((sb, i) => {
                const b = B[i];
                if (!b) return sb;
                const vm = b.equip === '自動販売機';
                return {
                  ...sb, name: b.name, kana: b.kana, address: addr(b.zip, b.pref, b.city, b.bld), tel: b.tel, fax: b.fax, employees: Number(b.emp) || 0, floor: b.floor,
                  contact: { name: b.s_name, email: b.s_mail, tel: b.s_tel },
                  planId: b.plan, course: (b.course === 'ESスタンダード' ? 'ESスタンダード' : vm ? 'ESライト（自販機）' : 'ESライト（冷蔵庫）') as Course,
                  optionIds: (b.options || '').split(';').map((y) => y.trim()).filter(Boolean), noShortLife: b.short === '短消費期限なし',
                  billTo: b.billTo === 'この拠点に請求' ? 'この拠点' : '法人',
                  ...(b.billTo === 'この拠点に請求' ? { billing: { payMethod: b.bpay as Billing['payMethod'], payCycle: b.bcycle as Billing['payCycle'] } } : {}),
                };
              }),
            };
            apply.actions.saveSetup(x.r, { id: out.no, setup });
            /* 受付の中身に欄のない値は申請の中身（運営が受付の画面で見る） */
            const app = x.r.get<Application>('dm.apply.applications', out.no)!;
            const more: [string, string][] = [
              ['アカウントを発行するか', cv('issue') === '1' ? 'する' : 'しない'], ['お申し込み者', `${appl[0]}（${appl[1]}）`],
              ...(cv('b_name') ? [['法人請求担当者', `${cv('b_name')}（${cv('b_kana')}・${cv('b_mail')}・${cv('b_tel')}）`] as [string, string]] : []),
              ...B.flatMap((b, i): [string, string][] => [
                ...(b.kubun === 'お試し' ? [[`お試し期間月数（拠点${i + 1}）`, `${b.trialMonths}ヶ月`] as [string, string]] : []),
                [`配送回数（拠点${i + 1}）`, `月${b.count}回`], [`納品不可になった場合（拠点${i + 1}）`, b.shift],
                ...(b.wish ? [[`配送の希望（拠点${i + 1}）`, b.wish] as [string, string]] : []),
                ...(b.note ? [[`プラン外の備考（拠点${i + 1}）`, b.note] as [string, string]] : []),
              ]),
              ['受付', `CSV 一括取込（法人キー ${key}）`],
            ];
            x.r.put<Application>('dm.apply.applications', out.no, { ...app, request: [...app.request, ...more] });
            created++;
            row.action = '新規';
            row.diff.push({ col: '申込', before: '', after: `${out.no}（受付中・代理入力：${cv('route')}）` });
            row.diff.push({ col: '拠点', before: '', after: B.map((b) => `${b.name}（${b.kubun}・${b.plan}・${b.course}）`).join('／') });
          } catch (e) {
            row.errors.push({ line: l0, col: '—', msg: e instanceof ApiError || e instanceof Error ? e.message : String(e) });
          }
        }
        rows.push(row);
      }
      if (!rows.length) return { fileErrors: ['申込の行がありません'], rows: [] };
      return { rows, value: { created } };
    },
  },
};
