import { ApiError } from '@/lib/api/errors';
import type { AnswerInput, HonInput } from '@/lib/api/supplier';
import carrierArea from '@/lib/carrier/area';
import { staffList } from '@/lib/carrier/fromDomain';
import type { Staff } from '@/lib/carrier/types';
import type { CsvEntity, RowResult } from '@/lib/domain/csv';
import { rowResult } from '@/lib/domain/csv';
import type { AltPo, Product } from '@/lib/domain/types';
import { today } from '@/lib/supplier/dates';
import { nShipped, qtyOf } from '@/lib/supplier/orders';
import { supplierService, type SupplierRepo } from '@/lib/supplier/service';
import type { Order } from '@/lib/supplier/types';
import { cellText, matchHeader, parseCell, type CsvColSpec } from './core';

/*
 * 仕入先サイト・委託配送先Web の CSV取込。
 *   受注の回答（仕入先）：1行＝1つの発注。納期回答待ちの発注は「出荷予定日」で回答（全量を1回で出荷・一括承認と同じ）、
 *     本発注の承認待ちの発注は「納品日」「入荷箱数」で承認（本発注の一括承認と同じ）。確かめは仕入先サイトと同じ lib/supplier/service.ts をメモリで動かす。
 *     書くのは仕入先サイトの API（発注は共通 DB の orders テーブル）＝登録のあと画面が呼ぶ（follow：supplierAnswers）
 *   スタッフ（委託配送先）：新しい配送スタッフをまとめて登録（carrier.createStaff と同じ）。免許証の写真は CSV で送れないので「免許未登録」で登録する
 */

const strOf = (v: unknown) => (v === undefined ? '' : String(v));

/* ===================================================================== */
/* 受注の回答（仕入先サイト）                                             */
/* ===================================================================== */

const ANS_COLS: CsvColSpec[] = [
  { label: '発注番号' }, { label: '品番', ro: true }, { label: '商品名', ro: true }, { label: '種類', ro: true }, { label: '納入倉庫', ro: true },
  { label: '数量', ro: true, type: 'int' }, { label: '入荷希望日', ro: true }, { label: '回答の状態', ro: true }, { label: '本発注の承認', ro: true },
  { label: '出荷予定日', type: 'date', hint: '納期回答待ちの発注' }, { label: '納品日', type: 'date', hint: '本発注の承認待ちの発注' },
  { label: '入荷箱数', type: 'int', min: 1, hint: '本発注の承認待ちの発注' },
  /* 本発注の承認で必須（資材は不要：台帳 E 2026-10-05） */
  { label: '賞味期限（消費期限）', type: 'date', hint: '本発注の承認待ちの発注・資材は不要' },
];
const wish = (o: Order) => { const w = (o.rows ?? []).map((r) => r.wish).filter(Boolean).sort(); return w.length ? `${w[0]}〜${w[w.length - 1]}` : ''; };
const honWait = (o: Order) => o.hon > 0 && !o.honAck && (o.parts ?? []).length <= 1 && !['キャンセル', '受注不可', '出荷済'].includes(o.ans);
const ansWait = (o: Order) => o.ans === '納期回答待ち' || (o.ans === '納期回答済' && nShipped(o) === 0 && !(o.hon > 0));
const ansRow = (o: Order) => [o.no, o.pid, o.name, o.type, o.wh, String(qtyOf(o)), wish(o), o.ans, o.hon > 0 ? (o.honAck ? '承認済' : '承認待ち') : '—',
  o.parts?.[0]?.eta ?? '', o.parts?.[0]?.dlv ?? '', o.parts?.[0]?.box ? String(o.parts[0].box) : '', o.parts?.[0]?.bb ?? ''].map((v) => cellText(v));

/** 仕入先の発注（共通 DB の orders・読むだけ）＋代替品の追加発注 */
const supplierOrders = (r: import('@/lib/ops/core/area').DocRepo, sup?: string) => {
  const own = r.list<Order>('db.orders');
  const alt = r.list<AltPo>('dm.order.altPos').map((x) => x.order as unknown as Order).filter((o) => !own.some((y) => y.no === o.no));
  return [...own, ...alt].filter((o) => !sup || o.sup === sup);
};
/** 確かめるためのメモリの Repo（仕入先サイトと同じ service を動かす。書いた中身は捨てる） */
function memRepo(orders: Order[]): SupplierRepo {
  const m = new Map(orders.map((o) => [o.no, structuredClone(o)]));
  const no = () => { throw new ApiError('使えません', 400); };
  return {
    getSupplier: () => undefined, saveSupplier: no, listOrders: () => [...m.values()], getOrder: (n) => m.get(n), saveOrder: (o) => { m.set(o.no, o); },
    listNotices: () => [], listManuals: () => [], addApplication: no, countApplications: () => 0, version: () => 0, transaction: (fn) => fn(),
  };
}

export const supplierAnswers: CsvEntity = {
  id: 'supplierAnswers', screen: '受注一覧（回答）', key: '発注番号', cols: [], list: () => [], keyOf: () => '',
  impact: ['分納する発注は CSV では回答できません（発注の詳細から個別に回答してください）', '回答・承認は運営の発注・入荷予定にすぐ出ます'],
  custom: {
    head: () => ANS_COLS.map((c) => (c.hint ? `${c.label}【${c.hint}】` : c.label)),
    required: ['発注番号'],
    template: (x) => supplierOrders(x.r, x.scope.supplierId).filter((o) => ansWait(o) || honWait(o)).slice(0, 2).map(ansRow),
    exportRows: (x) => supplierOrders(x.r, x.scope.supplierId).map(ansRow),
    run: (x, _text, lines) => {
      const orders = supplierOrders(x.r, x.scope.supplierId);
      const svc = supplierService(memRepo(orders));
      const m = matchHeader(lines[0].cells, ANS_COLS, ['発注番号']);
      const cell = (cells: string[], l: string) => { const i = m.at.get(l); return i === undefined ? '' : cells[i] ?? ''; };
      const answers: AnswerInput[] = [], hon: HonInput[] = [];
      const seen = new Map<string, number>();
      const rows: RowResult[] = lines.slice(1).map((l) => {
        const no = cell(l.cells, '発注番号').trim();
        const o = orders.find((y) => y.no === no);
        const row = rowResult(l.line, no, o?.name ?? '', 'エラー');
        const bad = (col: string, msg: string) => row.errors.push({ line: l.line, col, msg });
        if (!no) { bad('発注番号', '発注番号を入れてください'); return row; }
        if (seen.has(no)) { bad('発注番号', `${seen.get(no)}行目と同じ発注番号です`); return row; }
        seen.set(no, l.line);
        if (!o) { bad('発注番号', `発注 ${no} が見つかりません（自社の発注だけ回答できます）`); return row; }
        const v = (label: string) => { const c = ANS_COLS.find((y) => y.label === label)!; const p = parseCell(cell(l.cells, label), c); if (p.k === 'err') bad(label, p.msg); return p.k === 'set' ? p.v : undefined; };
        const eta = v('出荷予定日') as string | undefined, dlv = v('納品日') as string | undefined, box = v('入荷箱数') as number | undefined, bb = v('賞味期限（消費期限）') as string | undefined;
        if (row.errors.length) return row;
        const t = today();
        try {
          if (eta !== undefined && eta !== (o.parts?.[0]?.eta ?? '')) {
            if (!ansWait(o)) throw new ApiError(`この発注は回答できません（${o.ans}${o.hon > 0 ? '・本発注済み' : ''}）`, 409);
            if ((o.parts ?? []).length > 1) throw new ApiError('分納の回答は発注の詳細から個別に回答してください', 409);
            if (eta < t) throw new ApiError('出荷予定日は今日以降にしてください', 400);
            const a: AnswerInput = { no, parts: [{ eta, qty: qtyOf(o) }] };
            svc.answerOrders([a]);
            answers.push(a);
            row.diff.push({ col: '出荷予定日', before: cellText(o.parts?.[0]?.eta ?? ''), after: cellText(eta) });
          }
          if (dlv !== undefined || box !== undefined) {
            const cur = orders.find((y) => y.no === no)!;
            if (!honWait(cur)) throw new ApiError(cur.honAck ? 'この本発注はすでに承認済みです' : '本発注の承認待ちの発注ではありません', 409);
            if (dlv === undefined || box === undefined) throw new ApiError('本発注の承認は「納品日」と「入荷箱数」の両方を入れてください', 400);
            const e0 = cur.parts?.[0]?.eta;
            if (dlv < t || (e0 && dlv < e0)) throw new ApiError('納品日は今日以降で、出荷予定日と同じかそれ以降にしてください', 400);
            if (cur.type !== '資材' && !bb) throw new ApiError('本発注の承認は「賞味期限（消費期限）」も入れてください（資材は不要）', 400);
            const h: HonInput = { no, parts: [{ eta: e0 || dlv, dlv, qty: cur.hon, box, ...(cur.type !== '資材' && bb ? { bb } : {}) }] };
            svc.approveHon([h]);
            hon.push(h);
            row.diff.push({ col: '本発注の承認', before: '承認待ち', after: `納品日 ${cellText(dlv)}・${box}箱${cur.type !== '資材' && bb ? `・期限 ${cellText(bb)}` : ''}` });
          }
        } catch (e) { bad('—', e instanceof Error ? e.message : String(e)); return row; }
        row.action = row.diff.length ? '更新' : '変更なし';
        return row;
      });
      return { rows, follow: answers.length || hon.length ? [{ kind: 'supplierAnswers', payload: { answers, hon } }] : [] };
    },
  },
};

/* ===================================================================== */
/* 配送スタッフ（委託配送先Web）：新しいスタッフをまとめて登録               */
/* ===================================================================== */

type SD = { name: string; kana: string; kbn: string; st: string; tel: string; email: string; lic: number };
export const carrierStaff: CsvEntity<Staff, SD> = {
  id: 'carrierStaff', screen: '配送スタッフ一覧', key: '配送スタッフID', create: true,
  list: (x) => staffList(x.r, x.scope.carrierId ?? '').filter((s) => !s.del),
  keyOf: (s) => s.id, nameOf: (s) => s.name,
  locked: () => 'CSV では新しい配送スタッフの登録だけできます（登録済みのスタッフはスタッフ詳細で直してください）',
  impact: ['免許証の写真は CSV で送れないため、「免許未登録」で登録します。スタッフ詳細から写真を追加すると有効にできます', '免許未登録のスタッフにはアカウントを発行しません（ログイン情報のメールも送りません）。免許証を登録して有効にしてから、一覧の「アカウント一括発行」で発行してください（2026/10/03 決定）'],
  cols: [
    { label: '配送スタッフID', hint: '空欄＝新規（採番）', get: (s) => s.id },
    { label: '配送スタッフ名', reqNew: true, max: 50, get: (s) => s.name, put: (d, v) => { d.name = strOf(v); } },
    { label: 'カナ', reqNew: true, max: 50, get: (s) => s.kana, put: (d, v) => { d.kana = strOf(v); } },
    { label: '雇用形態', opts: ['社員', '個人事業主'], get: (s) => s.kbn, put: (d, v) => { d.kbn = strOf(v); } },
    { label: '電話番号', get: (s) => s.tel, put: (d, v) => { d.tel = strOf(v); } },
    { label: 'メールアドレス', reqNew: true, unique: true, get: (s) => s.email, put: (d, v) => { d.email = strOf(v); } },
    { label: 'ステータス', ro: true, get: (s) => s.st },
    { label: 'アカウント', ro: true, get: (s) => s.acct },
    { label: '最終ログイン', ro: true, get: (s) => s.last },
  ],
  newDraft: () => ({ name: '', kana: '', kbn: '社員', st: '免許未登録', tel: '', email: '', lic: 1 }),
  /* 画面の登録と同じ（carrier.createStaff の入力の確かめ）。写真の代わりに状態を「免許未登録」にする */
  save: (x, d) => String(carrierArea.actions.createStaff(x.r, { company: x.scope.carrierId ?? '', draft: { ...d, st: '免許未登録', lic: 1 } }).id),
  warn: () => ['免許証の写真がないため「免許未登録」で登録します（アカウントは発行しません）'],
  sample: () => [{ 配送スタッフ名: '（例）山田 太郎', カナ: 'ヤマダ タロウ', 雇用形態: '社員', 電話番号: '090-0000-0000', メールアドレス: 'taro.yamada@example.jp' }],
};

export type _P = Product;
