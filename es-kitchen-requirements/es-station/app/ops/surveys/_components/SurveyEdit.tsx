'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import { blankSurveyForm, formFromTemplate, formOf, SURVEY_QTYPES, validateSurvey, type SurveyForm, type SurveyQType } from '@/lib/domain/survey';
import { HistTable, Loading, Sec, useDirty } from '../../_general/parts';
import { Icon } from '../../_ui/Icon';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../../_ui/perm';
import { ConfirmModal, Field, Notice } from '../../_ui/ui';
import { BasicFields } from './BasicFields';
import { Results } from './Results';
import { LIST, ME, StBadge, svApi } from './parts';
import { TemplateSave } from './Templates';

type Tab = 'basic' | 'q' | 'hist';
const TABS: [Tab, string][] = [['basic', '基本情報'], ['q', '設問'], ['hist', '変更履歴']];

/**
 * アンケートの登録・詳細・編集（Phase 1 画面 23〜25・28）。タブ：基本情報／設問／変更履歴。
 * 詳細（view）は入力欄を触れない。回答が始まったアンケートの 設問 タブは回答の集計（画面 28）。
 * 回答が始まったあとは回答開始日時を変えられない。設問は文言（設問文・選択肢の文字）の修正だけ（2026/10/03 決定。共通データの survey.save が 409）。
 * 新規は一覧の「テンプレートから作成」で選んだテンプレート（tplId）を写して開く（この画面にはボタンを置かない：hong 2026-10-05）。
 * 「テンプレートとして保存」は詳細と登録・編集の両方（登録・編集では入力中の案内文・設問だけ確かめて保存し、アンケートは登録しない：hong 2026-10-05）
 */
export default function SurveyEdit({ mode, id, tplId }: { mode: 'new' | 'view' | 'edit'; id?: string; tplId?: string }) {
  const router = useRouter();
  const { toast, toastError, openModal, account } = useOps();
  const me = account?.name ?? ME;
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const dirty = useDirty(mode !== 'view');
  const { data } = useDomainQuery(svApi, 'get', { id: id ?? '' });
  const [f, setF] = useState<SurveyForm | null>(mode === 'new' ? blankSurveyForm() : null);
  const [e, setE] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>('basic');
  const [tpl, setTpl] = useState('');
  const isNew = mode === 'new', dis = mode === 'view';
  const { data: tpls } = useDomainQuery(svApi, 'templates');
  /* 一覧の「テンプレートから作成」で選んだテンプレートを写す（最初の1回だけ） */
  useEffect(() => {
    const t = isNew && tplId && !tpl ? tpls?.find((x) => x.id === tplId) : undefined;
    if (t) { setF(formFromTemplate(t)); setTpl(t.name); }
  }, [isNew, tplId, tpls, tpl]);

  useEffect(() => { if (!isNew && data && !f) setF(formOf(data)); }, [data, f, isNew]);
  useEffect(() => { if (!isNew && data === null) router.replace(LIST); }, [data, isNew, router]);
  useEffect(() => {
    /* 終了・削除済は編集できない（詳細へ） */
    if (mode === 'edit' && data && ['終了', '削除済'].includes(data.status)) router.replace(`${LIST}/${data.id}`);
  }, [mode, data, router]);
  if (!f || (!isNew && !data)) return <Loading />;

  const started = !!data?.started;
  const up = (patch: Partial<SurveyForm>) => { dirty.mark(); setF({ ...f, ...patch }); };

  const save = async () => {
    const err = validateSurvey(f);
    setE(err);
    if (Object.keys(err).length) {
      setTab(Object.keys(err).some((k) => k.startsWith('q')) && !Object.keys(err).some((k) => !k.startsWith('q')) ? 'q' : 'basic');
      toast('入力内容を確認してください');
      return;
    }
    try {
      const r = await svApi.action('save', { id: isNew ? undefined : id, form: f, by: me, template: isNew && tpl ? tpl : undefined });
      dirty.clear();
      toast(isNew ? `アンケート ${r.id} を登録しました（${r.status}）` : `アンケート ${r.id} を保存しました`);
      router.push(`${LIST}/${r.id}`);
    } catch (x) { toastError(x); }
  };
  const del = () => openModal(<ConfirmModal title="削除確認" text={<>このアンケートを削除してもよろしいですか？<br />回答の受付をやめ、アプリに出なくなります（データと回答は「削除済」として残ります）。</>} ok="削除" onOk={async () => {
    try { await svApi.action('remove', { id: id!, by: me }); toast('アンケートを削除しました'); router.push(LIST); } catch (x) { toastError(x); }
  }} />);
  const stop = () => openModal(<ConfirmModal kind="warn" title="配信停止" text={<>このアンケートの配信を停止しますか？<br />回答の受付をやめます（これまでの回答は残ります）。元に戻せません。</>} ok="配信停止" okCls="warn-solid" onOk={async () => {
    try { await svApi.action('stop', { id: id!, by: me }); toast('配信を停止しました'); } catch (x) { toastError(x); }
  }} />);

  /* 入力中の案内文・設問だけ確かめて、テンプレートとして保存する（アンケートは登録しない。hong 2026-10-05＝A） */
  const saveAsTemplate = () => {
    const all = validateSurvey(f);
    const err = Object.fromEntries(Object.entries(all).filter(([k]) => k === 'intro' || k === 'questions' || k.startsWith('q')));
    setE(err);
    if (Object.keys(err).length) { setTab(err.intro ? 'basic' : 'q'); toast('入力内容を確認してください'); return; }
    openModal(<TemplateSave form={{ intro: f.intro, questions: f.questions }} surveyId={id} defName={f.name} />);
  };
  const st = data?.status ?? '';
  const canEdit = !isNew && !['終了', '削除済'].includes(st);
  const btns: ReactNode = dis ? (
    <>
      {canEdit && canAct(svApi, 'remove') && <button className="btn dan lg" onClick={del}><Icon name="trash" />削除</button>}
      {['公開中', '予定中'].includes(st) && canAct(svApi, 'stop') && <button className="btn out lg" onClick={stop}><Icon name="power" />配信停止</button>}
      {!isNew && data && canAct(svApi, 'saveTemplate') && <button className="btn out lg" onClick={() => openModal(<TemplateSave form={{ intro: data.intro, questions: formOf(data).questions }} surveyId={data.id} defName={data.name} />)}>テンプレートとして保存</button>}
      {canEdit && screenCan('update') && <button className="btn pri lg" onClick={() => router.push(`${LIST}/${id}/edit`)}><Icon name="edit" />編集</button>}
    </>
  ) : (
    <>
      {/* 「テンプレートから作成」は一覧の画面だけ（hong 2026-10-05）。ここには置かない */}
      {canAct(svApi, 'saveTemplate') && <button className="btn out lg" onClick={saveAsTemplate}>テンプレートとして保存</button>}
      <button className="btn out lg" onClick={() => dirty.guard(() => router.push(isNew ? LIST : `${LIST}/${id}`))}>キャンセル</button>
      <button className="btn pri lg" onClick={save}>{isNew ? '登録' : '保存'}</button>
    </>
  );
  const crumb = isNew ? 'アンケート登録' : 'アンケート編集';
  const answered = data ? new Set(data.targets.filter((t) => t.answered).map((t) => `${t.type}:${t.id}`)) : undefined;
  const qErr = Object.keys(e).some((k) => k.startsWith('q'));

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb"><span>アンケート管理</span><span>アンケート一覧</span><span>{crumb}</span></div>
          <h1>{isNew ? 'アンケート登録' : `アンケート編集 ${data!.id}`}{!isNew && <> <StBadge v={st} /></>}</h1>
          {isNew && tpl && <p className="hint" style={{ margin: '0.285714rem 0 0' }}>テンプレート「{tpl}」から作成中（案内文・設問を写しました）</p>}
        </div>
        <div className="btns">{btns}</div>
      </div>
      <div className="card">
        <div className="tabs" role="tablist">
          {TABS.filter(([t]) => !(isNew && t === 'hist')).map(([t, l]) => (
            <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
              {l}{t === 'q' && qErr && <span className="txt-ng"> ●</span>}{t === 'basic' && Object.keys(e).some((k) => !k.startsWith('q')) && <span className="txt-ng"> ●</span>}
            </button>
          ))}
        </div>
        {tab === 'basic' && (
          <Sec title="基本情報">
            {!isNew && data && <p className="hint" style={{ margin: '0 0 0.857143rem' }}>回答 {data.answered}／{data.targetCount} 名（{data.rate}%）{data.remind.sentAt && `・リマインド送信済 ${data.remind.sentAt}`}{data.stoppedAt && `・配信停止 ${data.stoppedAt}`}</p>}
            <BasicFields f={f} set={up} e={e} id={data?.id} dis={dis} lockStart={started} answered={dis ? answered : undefined} />
          </Sec>
        )}
        {tab === 'q' && (
          dis && started ? <Results id={data!.id} /> : (
            <Sec title="設問">
              {started && <Notice kind="warn">回答が始まったため、設問は<b>文言（設問文・選択肢の文字）の修正だけ</b>できます。設問・選択肢の追加・削除、並び、設問タイプ、必須は変えられません（集計は詳細画面の「設問」タブ）。</Notice>}
              <Questions f={f} up={up} e={e} dis={dis} lock={started} />
            </Sec>
          )
        )}
        {tab === 'hist' && data && (
          <Sec title="変更履歴"><HistTable h={data.history.slice().reverse()} /></Sec>
        )}
      </div>
    </>
  );
}

/** 設問の編集（Phase 1 画面 25）：設問文・カテゴリ（単一選択／複数選択／自由記述）・必須回答・選択肢の追加・削除、設問の追加・削除 */
function Questions({ f, up, e, dis, lock }: { f: SurveyForm; up: (p: Partial<SurveyForm>) => void; e: Record<string, string>; dis: boolean; lock?: boolean }) {
  /* lock＝回答が始まった：文言だけ直せる（形の操作は出さない・選べない） */
  const fix = dis || !!lock;
  const [closed, setClosed] = useState<Set<number>>(new Set());
  const setQ = (i: number, patch: Partial<SurveyForm['questions'][number]>) => up({ questions: f.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)) });
  const move = (i: number, d: -1 | 1) => { const qs = [...f.questions]; [qs[i], qs[i + d]] = [qs[i + d], qs[i]]; up({ questions: qs }); };
  return (
    <>
      {e.questions && <Notice kind="ng">{e.questions}</Notice>}
      {f.questions.map((q, i) => {
        const shut = closed.has(i);
        return (
          <section key={i} className={`sec${shut ? ' closed' : ''}`} style={{ marginLeft: 0 }}>
            <div className="sec-h">
              <h2>設問 {i + 1}{e[`q${i}`] || e[`q${i}.opts`] ? <span className="txt-ng" style={{ fontSize: '0.928571rem', marginLeft: '0.571429rem' }}>入力内容を確認してください</span> : null}</h2>
              <span style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center' }}>
                {!fix && i > 0 && <button className="icon-btn" aria-label={`設問 ${i + 1} を上へ`} title="上へ" onClick={() => move(i, -1)}>↑</button>}
                {!fix && i < f.questions.length - 1 && <button className="icon-btn" aria-label={`設問 ${i + 1} を下へ`} title="下へ" onClick={() => move(i, 1)}>↓</button>}
                {!fix && f.questions.length > 1 && (
                  <button className="btn dan" onClick={() => up({ questions: f.questions.filter((_, j) => j !== i) })}><Icon name="trash" />削除</button>
                )}
                <button className="tog" aria-label={`設問 ${i + 1} の開閉`} onClick={() => setClosed((s) => { const n = new Set(s); if (n.has(i)) n.delete(i); else n.add(i); return n; })}><Icon name="up" /></button>
              </span>
            </div>
            <div className="sec-b">
              <div className="fg c2">
                <Field label="設問文" req className="full" htmlFor={`sv-q${i}`} err={e[`q${i}`]}>
                  <input className={`inp${e[`q${i}`] ? ' err' : ''}`} id={`sv-q${i}`} placeholder="設問文" maxLength={200} disabled={dis} value={q.text} onChange={(x) => setQ(i, { text: x.target.value })} />
                </Field>
                <Field label="カテゴリ" req htmlFor={`sv-qt${i}`}>
                  <select className="sel" id={`sv-qt${i}`} disabled={fix} value={q.type} onChange={(x) => {
                    const type = x.target.value as SurveyQType | '';
                    setQ(i, { type, options: type === '自由記述' ? [] : q.options.length >= 2 ? q.options : [...q.options, '', ''].slice(0, Math.max(2, q.options.length)) });
                  }}>
                    <option value="">カテゴリ</option>
                    {SURVEY_QTYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="回答設定">
                  <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', minHeight: '2.857143rem' }}>
                    <input type="checkbox" checked={q.required} disabled={fix} onChange={(x) => setQ(i, { required: x.target.checked })} />必須回答にする
                  </label>
                </Field>
                {q.type !== '自由記述' && (
                  <Field label="選択肢" req={!!q.type} className="full" err={e[`q${i}.opts`]}>
                    {q.options.map((o, j) => (
                      <div key={j} style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
                        <span style={{ width: '1.428571rem', textAlign: 'right' }}>{j + 1}</span>
                        <input className="inp" aria-label={`設問 ${i + 1} の選択肢 ${j + 1}`} placeholder="選択肢" maxLength={100} disabled={dis} value={o}
                          onChange={(x) => setQ(i, { options: q.options.map((y, k) => (k === j ? x.target.value : y)) })} />
                        {!fix && <button className="icon-btn txt-ng" aria-label={`選択肢 ${j + 1} を削除`} onClick={() => setQ(i, { options: q.options.filter((_, k) => k !== j) })}><Icon name="trash" /></button>}
                      </div>
                    ))}
                    {!fix && <div><button className="btn out" onClick={() => setQ(i, { options: [...q.options, ''] })}>選択肢を追加</button></div>}
                  </Field>
                )}
                {q.type === '自由記述' && <p className="hint full" style={{ margin: 0 }}>自由記述は文で答えます（1000文字まで）。選択肢はありません。</p>}
              </div>
            </div>
          </section>
        );
      })}
      {!fix && <button className="btn out lg" onClick={() => up({ questions: [...f.questions, { text: '', type: '', required: false, options: ['', ''] }] })}><Icon name="plus" />設問を追加</button>}
    </>
  );
}
