'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { blankSurveyForm, validateSurvey, type SurveyQType } from '@/lib/domain/survey';
import { Sec, useDirty } from '../../_general/parts';
import { OpsCsvImportCard } from '../../_ui/CsvImportPage';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { BasicFields, type BasicForm } from '../_components/BasicFields';
import { LIST, ME, MiniPager, svApi } from '../_components/parts';

const PER = 10;
type Q = { text: string; type: SurveyQType; required: boolean; options: string[] };

/**
 * アンケートの CSV取込（Phase 1 画面 26）。① CSV取込＝共通の CSV取込を画面の中に（lib/csv/survey.ts の surveyQuestions：読み取り・エラーの確認・取込の記録。モーダルではなく画面・hong 2026/10/05）
 * → ② 確認・保存（基本情報を入れる・設問一覧から外す）→ 登録（survey.save に importId を渡して変更履歴に残す）。
 * CSV は設問の一覧（No・設問文・設問タイプ・必須・選択肢「／」区切り）。エラーの行は取り込まない（エラー一覧CSV は確認の画面から）
 */
export default function Page() {
  const router = useRouter();
  const { toast, toastError, account } = useOps();
  const canAct = useCanAct();
  const dirty = useDirty();
  const [src, setSrc] = useState<{ importId: string; questions: Q[] } | null>(null);
  const [skip, setSkip] = useState<number[]>([]);
  const [f, setF] = useState<BasicForm>(() => { const { questions: _q, ...b } = blankSurveyForm(); return b; });
  const [e, setE] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  /* ① CSV取込はモーダルではなく画面の中（hong 2026/10/05・台帳 F「CSV取込の画面」）。読んだ設問を ② で確かめる */
  const onDone = (r: { importId: string; value?: unknown }) => {
    const qs = (r.value ?? []) as Q[];
    setSrc({ importId: r.importId, questions: qs }); setSkip([]); setPage(1); dirty.mark();
  };
  const pick = () => { setSrc(null); setSkip([]); };
  const rows = src ? src.questions.map((q, i) => ({ ...q, i })).filter((q) => !skip.includes(q.i)) : [];
  const save = async () => {
    const form = { ...f, questions: rows.map((x) => ({ text: x.text, type: x.type, required: x.required, options: x.options })) };
    const err = validateSurvey(form);
    setE(err);
    if (Object.keys(err).length) { toast(err.questions ?? '入力内容を確認してください'); return; }
    try {
      const s = await svApi.action('save', { form, by: account?.name ?? ME, importId: src!.importId });
      dirty.clear();
      toast(`アンケート ${s.id} を登録しました（設問 ${s.questions.length}問）`);
      router.push(`${LIST}/${s.id}`);
    } catch (x) { toastError(x); }
  };

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb"><span>アンケート管理</span><span>アンケート一覧</span><span>アンケートCSV取込</span></div>
          <h1>アンケートCSV取込</h1>
        </div>
        {src && <div className="btns">
          <button className="btn out lg" onClick={() => dirty.guard(() => router.push(LIST))}>キャンセル</button>
          <button className="btn out lg" onClick={pick}>CSVを選び直す</button>
          {canAct(svApi, 'save') && <button className="btn pri lg" disabled={!rows.length} onClick={save}>登録</button>}
        </div>}
      </div>
      <ol className="steps" aria-label="取込の手順" style={{ justifyContent: 'center' }}>
        <li className={src ? 'done' : 'cur'}><i>1</i>CSV取込</li>
        <li className={src ? 'cur' : ''}><i>2</i>確認・保存</li>
      </ol>

      {!src ? (
        <OpsCsvImportCard entity="surveyQuestions" title="アンケート設問のCSV取込"
          desc={<>1行に1つの設問を入れてください（選択肢は「／」区切り）。取り込んだ設問は次の画面で確かめ、基本情報を入れてから登録します。</>}
          onClose={() => router.push(LIST)} onDone={onDone} />
      ) : (
        <div className="card">
          <p className="hint" style={{ margin: '0 0 0.857143rem' }}>取込 {src.importId}：設問 {src.questions.length}問を読みました。</p>
          <Sec title="基本情報">
            <BasicFields f={f} set={(p) => { dirty.mark(); setF({ ...f, ...p }); }} e={e} />
          </Sec>
          <Sec title="設問一覧">
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th style={{ width: '3.571429rem' }}>No</th><th>設問文</th><th style={{ width: '7.857143rem' }}>設問タイプ</th><th style={{ width: '5rem' }}>必須</th><th>選択肢</th><th className="act" style={{ width: '5rem' }}>操作</th></tr></thead>
                <tbody>
                  {rows.slice((page - 1) * PER, page * PER).map((x, k) => (
                    <tr key={x.i}>
                      <td>{(page - 1) * PER + k + 1}</td><td>{x.text}</td><td>{x.type}</td>
                      <td>{x.required ? <span className="badge b-ng">必須</span> : <span className="badge b-mute">任意</span>}</td>
                      <td>{x.options.join('／')}</td>
                      <td className="act"><button className="d" aria-label={`設問 ${(page - 1) * PER + k + 1} を外す`} onClick={() => { setSkip([...skip, x.i]); dirty.mark(); }}><Icon name="trash" /></button></td>
                    </tr>
                  ))}
                  {!rows.length && <tr><td colSpan={6} className="empty">取り込む設問がありません。「CSVを選び直す」から選んでください。</td></tr>}
                </tbody>
              </table>
            </div>
            <MiniPager total={rows.length} page={Math.min(page, Math.max(1, Math.ceil(rows.length / PER)))} per={PER} onPage={setPage} />
            {skip.length > 0 && <p className="hint" style={{ margin: '0.571429rem 0 0' }}>外した設問 {skip.length}件 <button className="lnk u" onClick={() => setSkip([])}>元に戻す</button></p>}
          </Sec>
        </div>
      )}
    </>
  );
}
