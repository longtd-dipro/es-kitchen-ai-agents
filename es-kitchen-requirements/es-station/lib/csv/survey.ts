import type { CsvEntity } from '@/lib/domain/csv';
import { rowResult } from '@/lib/domain/csv';
import { parseSurveyCsv, SURVEY_CSV_HEAD, SURVEY_CSV_SAMPLE, type Survey } from '@/lib/domain/survey';
import { parseCsv } from './core';

/*
 * アンケートの設問の CSV取込（運営のアンケート管理・2026/10/03 決定：共通の CSV取込のモーダルと取込の記録にのせる）。
 *   1行＝1つの設問（No・設問文・設問タイプ・必須・選択肢「／」区切り）。確かめは lib/domain/survey.ts の parseSurveyCsv（いままでと同じ）。
 *   取込はアンケートを作らない：読んだ設問を画面に返し（value）、画面で基本情報を入れて survey.save（importId）で登録する。
 *   出力は今あるアンケートの設問（1行＝1設問）
 */
const qRow = (s: Survey) => s.questions.slice().sort((a, b) => a.order - b.order).map((q) => [String(q.order), q.text, q.type, q.required ? '必須' : '任意', q.options.join('／')]);

export const surveyQuestions: CsvEntity = {
  id: 'surveyQuestions', screen: 'アンケート設問', key: 'No', cols: [], list: () => [], keyOf: () => '',
  impact: ['取り込むだけではアンケートは登録されません。次の画面で基本情報（アンケート名・回答期間・配信対象）を入れて「登録」してください', '回答が始まったアンケートの設問は、文言の修正だけできます'],
  custom: {
    head: () => SURVEY_CSV_HEAD,
    template: () => parseCsv(SURVEY_CSV_SAMPLE).slice(1).map((l) => l.cells),
    exportRows: (x) => x.r.list<Survey>('dm.survey.surveys').filter((s) => !s.deletedAt).flatMap(qRow),
    run: (_x, text) => {
      const p = parseSurveyCsv(text);
      if (p.fatal) return { fileErrors: [p.fatal], rows: [] };
      const bad = new Map(p.errors.map((e) => [e.line, e.msgs]));
      const lines = [...p.rows.map((r) => r.line), ...p.errors.map((e) => e.line)].sort((a, b) => a - b);
      let n = 0;
      const rows = lines.map((line) => {
        const ok = p.rows.find((r) => r.line === line);
        const msgs = bad.get(line);
        if (msgs) return rowResult(line, `${line}行目`, '', 'エラー', { errors: msgs.map((msg) => ({ line, col: '—', msg })) });
        n++;
        return rowResult(line, `Q${n}`, ok!.text, '新規', { diff: [{ col: '設問', before: '', after: `${ok!.type}${ok!.required ? '・必須' : ''}${ok!.options.length ? `（${ok!.options.join('／')}）` : ''}` }] });
      });
      const questions = p.rows.map((r) => ({ text: r.text, type: r.type, required: r.required, options: r.options }));
      return { rows, value: questions, follow: [{ kind: 'surveyQuestions', payload: { count: questions.length } }] };
    },
  },
};
