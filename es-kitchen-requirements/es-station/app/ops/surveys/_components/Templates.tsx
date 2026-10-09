'use client';

import { useState } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import type { SurveyForm, SurveyTemplate } from '@/lib/domain/survey';
import { fmtDateTime } from '@/lib/format/date';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Field, Modal } from '../../_ui/ui';
import { ME, svApi } from './parts';

/*
 * アンケートのテンプレート（2026/10/03 決定）：「テンプレートから作成」（案内文・設問を写して新規登録）と「テンプレートとして保存」。
 * データは共通データ dm.survey.templates（最初からある 満足度調査・メニュー評価・アプリ使い勝手 は消せない）
 */

/** テンプレートを選ぶ（選んだら onPick。一覧の画面からは新規登録の画面へ） */
export function TemplatePick({ onPick }: { onPick: (t: SurveyTemplate) => void }) {
  const { closeModal, toast, toastError, account } = useOps();
  const me = account?.name ?? ME;
  const canAct = useCanAct();
  const { data } = useDomainQuery(svApi, 'templates');
  const [sel, setSel] = useState('');
  const rows = data ?? [];
  const t = rows.find((x) => x.id === sel);
  const del = async (id: string) => {
    try { await svApi.action('removeTemplate', { id, by: me }); toast('テンプレートを消しました'); if (sel === id) setSel(''); } catch (e) { toastError(e); }
  };
  return (
    <Modal title="テンプレートから作成" width={860} footer={<>
      <button className="btn out" onClick={closeModal}>キャンセル</button>
      <button className="btn pri" disabled={!t} onClick={() => { if (t) { onPick(t); closeModal(); } }}>このテンプレートで作成</button>
    </>}>
      <p className="hint" style={{ margin: '0 0 0.857143rem' }}>案内文と設問を写して、新しいアンケートを作ります。回答期間・配信対象は次の画面で入れてください。</p>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th style={{ width: '3.142857rem' }} /><th>テンプレート名</th><th className="num" style={{ width: '5.714286rem' }}>設問数</th><th style={{ width: '14.285714rem' }}>作成</th><th className="act" style={{ width: '5rem' }}>操作</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id} className={sel === x.id ? 'is-selected' : undefined} onClick={() => setSel(x.id)} style={{ cursor: 'pointer' }}>
                <td><input type="radio" name="sv-tpl" aria-label={x.name} checked={sel === x.id} onChange={() => setSel(x.id)} /></td>
                <td>{x.name}{x.builtin && <span className="badge b-mute" style={{ marginLeft: '0.571429rem' }}>標準</span>}</td>
                <td className="num">{x.questions.length}問</td>
                <td>{x.builtin ? '—' : `${fmtDateTime(x.createdAt)}（${x.createdBy}）`}</td>
                <td className="act">{!x.builtin && canAct(svApi, 'removeTemplate') && <button className="d" aria-label={`${x.name} を消す`} onClick={(e) => { e.stopPropagation(); del(x.id); }}><Icon name="trash" /></button>}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="empty">{data ? 'テンプレートがありません' : '読み込み中…'}</td></tr>}
          </tbody>
        </table>
      </div>
      {t && (
        <div style={{ marginTop: '0.857143rem' }}>
          <b>設問</b>
          <ol style={{ margin: '0.285714rem 0 0', paddingLeft: '1.428571rem' }}>{t.questions.map((q, i) => <li key={i}>{q.text}<span className="muted">（{q.type}{q.required ? '・必須' : ''}{q.options.length ? `：${q.options.join('／')}` : ''}）</span></li>)}</ol>
        </div>
      )}
    </Modal>
  );
}

/** いまのアンケートの案内文・設問をテンプレートとして保存する */
export function TemplateSave({ form, surveyId, defName }: { form: Pick<SurveyForm, 'intro' | 'questions'>; surveyId?: string; defName: string }) {
  const { closeModal, toast, toastError, account } = useOps();
  const me = account?.name ?? ME;
  const [name, setName] = useState(defName);
  const [err, setErr] = useState('');
  const save = async () => {
    if (!name.trim()) { setErr('テンプレート名を入力してください'); return; }
    try {
      const t = await svApi.action('saveTemplate', { name, form, surveyId, by: me });
      toast(`テンプレート「${t.name}」を保存しました（設問 ${t.questions.length}問）`);
      closeModal();
    } catch (e) { toastError(e); }
  };
  return (
    <Modal title="テンプレートとして保存" width={560} footer={<><button className="btn out" onClick={closeModal}>キャンセル</button><button className="btn pri" onClick={save}>保存</button></>}>
      <p className="hint" style={{ margin: '0 0 0.857143rem' }}>案内文と設問（{form.questions.length}問）をテンプレートにします。回答期間・配信対象は写しません。</p>
      <Field label="テンプレート名" req htmlFor="sv-tpl-name" err={err}>
        <input className={`inp${err ? ' err' : ''}`} id="sv-tpl-name" maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
    </Modal>
  );
}
