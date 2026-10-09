import { ApiError } from '@/lib/api/errors';
import { defineArea, type DocRepo } from '@/lib/ops/core/area';
import { nowStamp } from '@/lib/supplier/dates';
import { CSV_ENTITIES } from '@/lib/csv';
import { fileStamp, type CsvFilter } from '@/lib/csv/core';
import { flattenDocs } from '@/lib/csv/flatten';
import { knownOrders } from '../stock';
import {
  exportEntity, importCommit, importPreview, jobStep, K, logExport, templateOf,
  type ChangeLog, type CsvScope, type ExportLog, type ImportLog,
} from '../csv';

/*
 * CSV の入出力（area: csv）。仕組みは lib/domain/csv.ts、エンティティ（列・保存）は lib/csv/*.ts。
 *   query  template（テンプレート）・export（エンティティの全件／画面で絞ったキー）・records（出力だけの一覧：dm.* の全部の項目）・
 *          imports（取込の記録）・exports（出力の記録）・changes（レコードの変更履歴「CSV取込で更新」）・job（裏の取込の進み具合）
 *   action importPreview（確かめるだけ）・importCommit（登録）・jobStep（裏の取込を進める）・logExport（出力の記録）
 */

const ent = (id: string) => {
  const e = CSV_ENTITIES[id];
  if (!e) throw new ApiError(`CSV の種類 ${id} はありません`, 404);
  return e;
};
const ctx = (r: DocRepo, scope?: CsvScope, by?: string) => ({ r, scope: scope ?? { site: 'ops' as const }, by: by ?? 'CSV', at: nowStamp() });
/** records で読んでよい文書（業務データと運営の一覧の行） */
const readable = (kind: string) => /^(dm|general|purchasing|contracts|masters|carrier|menu)\./.test(kind);

export default defineArea({
  name: 'csv',
  seed: () => ({}),
  queries: {
    /** テンプレート（見出し＋記入例）。fileName は <画面名>_テンプレート_<日時>.csv */
    template: (r, a: { entity: string; scope?: CsvScope }) => {
      const e = ent(a.entity);
      return { ...templateOf(e, ctx(r, a.scope)), fileName: `${e.screen}_テンプレート${a.scope?.target ? `-${a.scope.target}` : ''}_${fileStamp()}.csv` };
    },
    /** 列の定義（CSV取込の画面の「CSVの列」の表・画面設計書のテンプレートの定義。2026/10/05） */
    columns: (r, a: { entity: string; scope?: CsvScope }) => {
      const e = ent(a.entity);
      const x = ctx(r, a.scope);
      if (e.custom) {
        const head = e.custom.head();
        const req = (e.custom.required ?? []).map((l) => l.replace(/【[^】]*】/g, ''));
        return { screen: e.screen, key: e.key, custom: true, cols: head.map((h) => ({ label: h.replace(/【[^】]*】/g, ''), hint: (h.match(/【([^】]*)】/) ?? [])[1] ?? '', type: 'text', req: req.includes(h.replace(/【[^】]*】/g, '')) })) };
      }
      return {
        screen: e.screen, key: e.key, custom: false,
        cols: e.cols.map((c) => ({
          label: c.label, hint: c.hint ?? '', type: c.type ?? 'text', ro: !!c.ro, req: !!c.reqNew || !!c.reqAlways, reqAlways: !!c.reqAlways,
          clear: !!c.clear, unique: !!c.unique, opts: c.opts ? [...c.opts] : c.optsOf ? [...c.optsOf(x)] : undefined, max: c.max, min: c.min, maxNum: c.maxNum, child: !!c.child,
        })),
      };
    },
    /** エンティティの出力（取込と同じ列）。keys＝画面で絞った行のキー（省くと全件） */
    export: (r, a: { entity: string; keys?: string[]; scope?: CsvScope }) => {
      const e = ent(a.entity);
      return { screen: e.screen, ...exportEntity(e, ctx(r, a.scope), a.keys) };
    },
    /**
     * 出力だけの一覧の「全部の項目」：文書（ids の順）を平らにして見出しを日本語に（ID には名前の列）。childKey＝子の表にする配列の項目。
     * groups[i]＝ids[i] の行（ないときは空の配列）
     */
    records: (r, a: { kind: string; ids: string[]; childKey?: string | null; onlyBranch?: Record<string, string> }) => {
      if (a.kind !== 'orders' && !readable(a.kind)) throw new ApiError(`${a.kind} は読めません`, 400);
      /* 'orders'＝発注（仕入先サイトの共通 DB の発注・運営の発注・代替品の追加発注。lib/domain/stock.ts の knownOrders） */
      const po = a.kind === 'orders' ? new Map(knownOrders(r).map((o) => [o.no, o as unknown as Record<string, unknown>])) : null;
      const recs = a.ids.map((id) => {
        const d = po ? po.get(id) : r.get<Record<string, unknown>>(a.kind, id);
        /* onlyBranch（lib/server/access.ts：拠点アカウントが法人あての請求書を出すとき）＝その拠点の明細だけ。ほかの拠点の明細は出さない */
        const b = a.onlyBranch?.[id];
        return d && b && Array.isArray(d.lines) ? { ...d, lines: (d.lines as { branchId?: string }[]).filter((l) => l.branchId === b) } : d;
      });
      const f = flattenDocs(r, recs.filter((x): x is Record<string, unknown> => !!x), a.childKey);
      let k = 0;
      return { head: f.head, groups: recs.map((x) => (x ? f.groups[k++] : [])) };
    },
    imports: (r, a?: { entity?: string }) => r.list<ImportLog>(K.imports).filter((x) => !a?.entity || x.entity === a.entity).reverse(),
    exports: (r, a?: { screen?: string }) => r.list<ExportLog>(K.exports).filter((x) => !a?.screen || x.screen === a.screen).reverse(),
    /** レコードの変更履歴（CSV取込で更新・登録） */
    changes: (r, a: { entity: string; key: string }) => r.list<ChangeLog>(K.changes).filter((x) => x.entity === a.entity && x.key === a.key).reverse(),
    job: (r, a: { id: string }) => {
      const j = r.get<{ id: string; done: number; total: number; status: string }>(K.jobs, a.id);
      return j ? { id: j.id, done: j.done, total: j.total, status: j.status } : null;
    },
  },
  actions: {
    /** 取込の確認（保存しない）。text＝ファイルの中身（UTF-8 で読んだ文字） */
    importPreview: (r, a: { entity: string; text: string; fileName: string; scope?: CsvScope; by: string }) =>
      importPreview(r, ent(a.entity), { text: a.text, fileName: a.fileName, scope: a.scope ?? { site: 'ops' }, by: a.by }),
    /** 取込の登録（もう一度確かめる。エラーがあれば何も保存しない）。ack＝警告を確認した */
    importCommit: (r, a: { entity: string; token: string; ack?: boolean }) => importCommit(r, ent(a.entity), a),
    jobStep: (r, a: { id: string }) => jobStep(r, a),
    /** 出力の記録（だれが・いつ・どの画面・条件・件数） */
    logExport: (r, a: { screen: string; filters: CsvFilter[]; count: number; fileName: string; site: string; by: string }) => logExport(r, a),
  },
});
