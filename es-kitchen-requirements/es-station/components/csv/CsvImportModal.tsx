'use client';

import { useRef, useState, type ReactNode } from 'react';
import { errorMessage } from '@/lib/api/errors';
import { CSV_BG_UPDATES, CSV_MAX_ROWS, decodeUtf8 } from '@/lib/csv/core';
import { errorCsvRows, type CsvScope, type FollowUp, type PreviewOut, type RowResult } from '@/lib/domain/csv';
import { csvApi, saveCsv, type CommitOut } from './api';

/*
 * CSV取込（全サイト同じ流れ・00_確認してほしい/CSV入出力_定義_20261003.md 2-1・2-3）：
 *   ① ファイルを選ぶ（ドラッグ＆ドロップ・UTF-8 だけ）→ 確かめる（何も保存しない）
 *   ② 結果：新規／更新／変更なし／対象外（取り込まない行・あれば）／エラーの件数、行ごとのエラー、更新の前 → 後、警告（「警告を確認しました」が要る）→「登録」
 *   1行でもエラーがあれば登録できない（エラー一覧CSV を出せる）。更新が 100件を超えたら裏で進めて進み具合を出す
 * 見た目は各サイトのモーダル・ボタン・表（ui）。サイトごとの ui は app/<サイト>/_ui などの csv.tsx
 */

export type CsvTone = 'ok' | 'info' | 'warn' | 'ng' | 'mute';
export type CsvUi = {
  /** モーダルの枠（サイトのモーダル） */
  Frame: (p: { title: string; onClose: () => void; busy: boolean; footer: ReactNode; children: ReactNode; /** 今の手順（1＝ファイルを選ぶ、2＝確認・登録） */ step: 1 | 2 }) => ReactNode;
  /** 手順（1 ファイルを選ぶ → 2 確認・登録）を Frame 側で出す（画面のときはカードの外に置く・hong 2026/10/05） */
  stepsInFrame?: boolean;
  /** ボタン（主・枠線） */
  pri: string;
  out: string;
  /** 表・表の枠・数の列（右寄せ） */
  table: string;
  wrap: string;
  num: string;
  /** バッジ・お知らせの帯・小さい説明の文字 */
  badge: (t: CsvTone) => string;
  notice: (t: 'ng' | 'warn' | '') => string;
  hint: string;
  /** 手順の表示（運営の .steps）。なければ文字だけ */
  steps?: string;
};

/* 表に出す行数（設計 5.5：先頭50件だけ表に出して、全件の数を添える） */
const SHOW = 50;
const TONE: Record<RowResult['action'], CsvTone> = { 新規: 'info', 更新: 'ok', 変更なし: 'mute', 対象外: 'mute', エラー: 'ng' };

export function CsvImportModal({ ui, entity, title, scope, by, desc, descMore, options, updateOnly, onClose, onDone, onFollow, notify, doneMessage, noNew, newOnly }: {
  ui: CsvUi;
  /** lib/csv の id（products など） */
  entity: string;
  title?: string;
  scope?: CsvScope;
  /** 操作した人（アカウントID） */
  by: string;
  /** ファイルを選ぶ画面の説明（キー・列の決まり） */
  desc?: ReactNode;
  /** 更新だけの取込：箇条書きの2つ目以降の説明（担当者の行など） */
  descMore?: ReactNode;
  /** 取込のオプション（月間メニューの「法人へ再通知する」など） */
  options?: { key: string; label: string; def?: boolean }[];
  /** 更新だけの取込（法人一覧・拠点一覧。「新規」は出さず、共通メッセージ E51・E114・S104・I104 の文言にする） */
  updateOnly?: boolean;
  /** 新しい行を作れない取込（子契約。台帳 F：更新だけ）：キーが空欄・見つからない行は行エラー。「新規」の件数は出さない */
  noNew?: boolean;
  /** 新規だけの取込（契約申請管理の新規申込CSV取込：1行＝1拠点・同じ法人キーの行が1申込）。エラーを含む法人キーの申込は取り込まず、ほかを登録する。メッセージは更新だけの取込（E106・E107・E113・E51）と同じ */
  newOnly?: boolean;
  onClose: () => void;
  /** 登録したあと（value＝お知らせの配信対象など、画面に返す値） */
  onDone?: (r: CommitOut) => void | Promise<void>;
  /** 登録のあと画面がすること（仕入先サイトの回答の API・発注を入荷済にするなど） */
  onFollow?: (f: FollowUp[]) => Promise<void>;
  notify?: (msg: string) => void;
  /** 登録のあとのお知らせの文（省略＝「CSV取込：新規 n件・更新 n件を登録しました…」）。引数＝登録した件数・エラーで取り込まなかった行の数 */
  doneMessage?: (c: { 新規: number; 更新: number; 変更なし: number; 対象外: number; 成功: number; 失敗: number }) => string;
}) {
  const [file, setFile] = useState<{ name: string; text: string } | null>(null);
  const [ferr, setFerr] = useState('');
  const [pv, setPv] = useState<PreviewOut | null>(null);
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [job, setJob] = useState<{ done: number; total: number } | null>(null);
  const [opts, setOpts] = useState<Record<string, boolean>>(() => Object.fromEntries((options ?? []).map((o) => [o.key, !!o.def])));
  const ref = useRef<HTMLInputElement>(null);
  const sc: CsvScope = { site: 'ops', ...scope, opts };

  const check = async (name: string, text: string) => {
    setBusy(true); setFerr(''); setPv(null); setAck(false);
    try {
      setFile({ name, text });
      const res = await csvApi.preview({ entity, text, fileName: name, scope: sc, by });
      /* 更新だけの取込：ファイル全体のエラー（E106・E107・E113）はステップ2へ進まず、ステップ1のまま帯を出す */
      if ((updateOnly || newOnly) && res.fileErrors.length) setFerr(res.fileErrors.join(' ／ ')); else setPv(res);
    } catch (e) { setFerr(errorMessage(e)); } finally { setBusy(false); }
  };
  const choose = async (f?: File | null) => {
    if (!f) return;
    const strict = updateOnly || newOnly;
    const E51 = 'CSVファイルとして読み込めません。UTF-8のCSVファイルを選択してください。';
    if (!/\.csv$/i.test(f.name)) { setFerr(strict ? E51 : 'CSVファイル（拡張子 .csv）を選んでください'); return; }
    let buf: ArrayBuffer;
    try { buf = await f.arrayBuffer(); } catch { setFerr(strict ? E51 : 'ファイルを読み込めませんでした。ファイルが壊れていないか確かめてください'); return; }
    const text = decodeUtf8(buf);
    if (text === null) { setFerr(strict ? E51 : '文字コードが UTF-8 ではありません。Excel では「CSV UTF-8（コンマ区切り）」で保存してください'); return; }
    await check(f.name, text);
  };
  const commit = async () => {
    if (!pv) return;
    setBusy(true);
    try {
      const r = await csvApi.commit({ entity, token: pv.token, ack });
      if (r.jobId) {
        /* 裏で進める取込：終わるまで少しずつ進める（進み具合を出す） */
        let st = { done: 0, total: 1, status: '実行中' as string };
        setJob({ done: 0, total: 1 });
        while (st.status !== '完了') { st = await csvApi.jobStep(r.jobId); setJob({ done: st.done, total: st.total }); }
      }
      if (r.follow.length && onFollow) await onFollow(r.follow);
      const ng = pv.counts.エラー;
      /* 取り込まなかった行は、ファイルの行の数（1つの法人・拠点が複数行にまたがるときは行ごとに数える） */
      const skipped = pv.rows.filter((x) => x.action === 'エラー').reduce((n, x) => n + x.lines.length, 0);
      notify?.(doneMessage ? doneMessage({ ...r.counts, 成功: pv.total - ng - r.counts.対象外, 失敗: ng }) : newOnly ? `CSVを取り込みました（受付中の申込${r.counts.新規}件・取り込まなかった行${skipped}件）。` : updateOnly || noNew ? `CSVを取り込みました（更新${r.counts.更新}件・取り込まなかった行${skipped}件）。` : `CSV取込：新規 ${r.counts.新規}件・更新 ${r.counts.更新}件を登録しました（変更なし ${r.counts.変更なし}件${r.counts.対象外 ? `・対象外 ${r.counts.対象外}件` : ''}）`);
      /* 先に閉じる（onDone で別のモーダルを開けるように） */
      onClose();
      await onDone?.(r);
    } catch (e) {
      setFerr(errorMessage(e));
      setJob(null);
    } finally { setBusy(false); }
  };

  const errs = pv ? pv.rows.flatMap((r) => r.errors.map((e) => ({ ...e, key: r.key }))) : [];
  const warns = pv ? pv.rows.flatMap((r) => r.warnings.map((w) => ({ line: r.line, key: r.key, w }))) : [];
  const changed = pv ? pv.rows.filter((r) => r.action === '新規' || r.action === '更新') : [];
  /* エラーの行は取り込まず、ほかの行を登録する（hong 2026/10/05・マスタ項目一覧 一覧画面 #8）。ファイル全体のエラー・登録する行がないときだけ止める */
  const blocked = !pv || !!pv.fileErrors.length || (!pv.counts.新規 && !pv.counts.更新);
  /* 影響の帯は、登録する行があるときだけ。拠点の「住所・受取の時間帯…」は、それらを変える行があるときだけ */
  const impactOn = !!pv && pv.impact.length > 0 && changed.length > 0
    && (entity !== 'branches' || changed.some((r) => r.diff.some((d) => /住所|郵便番号|都道府県|市区町村|町名|建物|受取|時間帯/.test(d.col))));
  /* 更新だけの取込で、更新する行が1つもない（全行が変更なし）：登録できない理由を出す */
  const noUpdate = updateOnly && !!pv && !pv.fileErrors.length && !pv.counts.新規 && !pv.counts.更新 && pv.counts.エラー === 0;
  const step = pv ? 2 : 1;
  const stepLabel = (n: number, t: string) => (ui.steps ? <li className={step === n ? 'cur' : step > n ? 'done' : ''}><i>{n}</i>{t}</li> : <li>{n === step ? <b>{n}. {t}</b> : `${n}. ${t}`}</li>);

  const Frame = ui.Frame;
  const footer = (
      <>
        <button type="button" className={ui.out} disabled={busy} onClick={pv ? () => { setPv(null); setFile(null); setAck(false); } : onClose}>{pv ? 'ファイルを選び直す' : 'キャンセル'}</button>
        {pv && <button type="button" className={ui.pri} disabled={busy || blocked || (pv.warnings > 0 && !ack)} onClick={commit}>{newOnly ? `登録する（新規 ${pv.counts.新規}件）` : updateOnly ? `登録する（更新 ${pv.counts.更新}件）` : '登録'}</button>}
      </>
  );
  return (
    <Frame title={title ?? 'CSV取込'} onClose={onClose} busy={busy} footer={footer} step={pv ? 2 : 1}>
      <div style={{ display: 'grid', gap: '0.857143rem' }}>
        {!ui.stepsInFrame && (
          <ol className={ui.steps} style={ui.steps ? { margin: 0 } : { display: 'flex', gap: '1.142857rem', listStyle: 'none', padding: 0, margin: 0 }} aria-label="取込の手順">
            {stepLabel(1, 'ファイルを選ぶ')}{stepLabel(2, '確認・登録')}
          </ol>
        )}
        {!pv ? (
          <>
            <div className={ui.hint} style={{ lineHeight: 1.7 }}>
              {newOnly ? (
                <ul style={{ margin: 0, paddingLeft: '1.285714rem' }}>
                  <li>{desc}</li>
                  {descMore && <li>{descMore}</li>}
                  <li>UTF-8 の CSV・{CSV_MAX_ROWS.toLocaleString()}行まで。エラーを含む法人キーの申込は取り込まず、ほかの申込を登録します（エラーの行は確認の画面に出ます）。</li>
                </ul>
              ) : updateOnly ? (
                <ul style={{ margin: 0, paddingLeft: '1.285714rem' }}>
                  <li>{desc}</li>
                  <li>空欄のセルは今の値のまま。項目を消すときは「-」を書きます（行の削除はこの取込ではできません）。</li>
                  {descMore && <li>{descMore}</li>}
                  <li>UTF-8 の CSV・{CSV_MAX_ROWS.toLocaleString()}行まで。エラーの行は取り込まず、ほかの行を登録します（エラーの行は確認の画面に出ます）。</li>
                </ul>
              ) : (
                <>
                  {desc}
                  <div>{noNew ? 'キーが一致する行を上書きします（新しい行は作れません。キーが空欄の行・見つからないキーの行は、その行のエラーになります）。' : 'キーが一致する行は上書き、キーが空欄の行は新規です。'}空欄のセルは今の値のまま、項目を消すときは「-」を書きます（行の削除はこの取込ではできません）。
                    UTF-8 の CSV・{CSV_MAX_ROWS.toLocaleString()}行まで。エラーの行は取り込まず、ほかの行を登録します（エラーの行は確認の画面に出ます）。</div>
                </>
              )}
            </div>
            {options?.length ? (
              <div style={{ display: 'flex', gap: '1.142857rem', flexWrap: 'wrap' }}>
                {options.map((o) => <label key={o.key} style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center' }}><input type="checkbox" checked={!!opts[o.key]} onChange={(e) => setOpts({ ...opts, [o.key]: e.target.checked })} />{o.label}</label>)}
              </div>
            ) : null}
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); choose(e.dataTransfer.files?.[0]); }}
              style={{ border: `1px dashed ${drag ? 'var(--accent, #2563eb)' : 'var(--line-strong, #c9ced6)'}`, background: drag ? 'var(--accent-soft, #eef4ff)' : 'var(--surface-2, #f6f7f9)', borderRadius: 4, padding: '2.285714rem 1.142857rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.571429rem', textAlign: 'center' }}>
              <span><button type="button" className={ui.out} disabled={busy} onClick={() => ref.current?.click()}>ファイルを選ぶ</button>　またはファイルをここにドラッグ＆ドロップ</span>
              <span className={ui.hint}>{busy ? '確かめています…' : file ? file.name : 'CSV（UTF-8）'}</span>
              <input ref={ref} type="file" accept=".csv,text/csv" hidden onChange={(e) => { choose(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
            <div style={{ display: 'flex', gap: '0.571429rem', flexWrap: 'wrap' }}>
{/* テンプレート・いまのデータ のボタンは置かない（hong 2026/10/05：CSV出力の形をそのまま使う） */}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '0.571429rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <b>{pv.fileName}</b><span className={ui.hint}>{newOnly ? `${pv.total.toLocaleString()}申込` : `${pv.total.toLocaleString()}件`}</span>
              {(['新規', '更新', '変更なし', '対象外', 'エラー'] as const).filter((k) => (k !== '対象外' || pv.counts.対象外 > 0) && (newOnly ? (k === '新規' || k === '対象外' || k === 'エラー') : !(updateOnly || noNew) || k !== '新規')).map((k) => <span key={k} className={ui.badge(TONE[k])}>{k} {pv.counts[k].toLocaleString()}</span>)}
            </div>
            {pv.fileErrors.length > 0 && <div className={ui.notice('ng')} role="alert"><span>{pv.fileErrors.join(' ／ ')}</span></div>}
            {(updateOnly || newOnly) && blocked && !pv.fileErrors.length && pv.counts.エラー > 0 && <div className={ui.notice('ng')} role="alert"><span>登録できる行がありません。エラーの行を直して、もう一度ファイルを選んでください。</span></div>}
            {noUpdate && <div className={ui.notice('warn')} role="alert"><span>更新する行がありません。変更したファイルを選び直してください。</span></div>}
            {errs.length > 0 && (
              <>
                <div className={ui.notice('ng')} role="alert" style={{ display: 'flex', justifyContent: 'space-between', gap: '0.571429rem', alignItems: 'center' }}>
                  <span>{newOnly ? `エラーを含む法人キー ${pv.counts.エラー}件の申込は取り込みません。${blocked ? '' : `ほかの申込（${pv.counts.新規}件）は登録できます。`}` : updateOnly ? `エラーの行 ${pv.counts.エラー}件は取り込みません。${blocked ? '' : 'ほかの行は登録できます。'}` : `エラーの行 ${pv.counts.エラー}件は取り込みません（行番号と内容は下の表）。ほかの行（${noNew ? '' : `新規 ${pv.counts.新規}件・`}更新 ${pv.counts.更新}件）は「登録」で登録します。`}</span>
                  <button type="button" className={ui.out} onClick={() => saveCsv(`${pv.fileName.replace(/\.csv$/i, '')}_エラー一覧.csv`, errorCsvRows(file?.text ?? '', pv.rows, pv.fileErrors))}>エラー一覧CSV</button>
                </div>
                <div className={ui.wrap} style={{ maxHeight: '21.428571rem', overflow: 'auto', marginBottom: '0.285714rem' }}>
                  <table className={ui.table}>
                    <thead><tr><th className={ui.num}>行番号</th><th>キー</th><th>列名</th><th>内容</th></tr></thead>
                    <tbody>{errs.slice(0, SHOW).map((e, i) => <tr key={i}><td className={ui.num}>{e.line}</td><td>{e.key}</td><td>{e.col}</td><td style={{ whiteSpace: 'normal', overflowWrap: 'anywhere', minWidth: '16rem' }}>{e.msg}</td></tr>)}</tbody>
                  </table>
                </div>
                {errs.length > SHOW && <span className={ui.hint}>エラーは全 {errs.length.toLocaleString()}件です。表には先頭 {SHOW}件を出しています（全部はエラー一覧CSV にあります）。</span>}
              </>
            )}
            {changed.length > 0 && (
              <>
                <b style={{ marginTop: '0.571429rem' }}>登録する内容（前 → 後）</b>
                <div className={ui.wrap} style={{ maxHeight: '21.428571rem', overflow: 'auto', marginBottom: '0.285714rem' }}>
                  <table className={ui.table}>
                    <thead><tr><th className={ui.num}>行番号</th><th>区分</th><th>キー</th><th>名前</th><th>変わる項目（前 → 後）</th></tr></thead>
                    <tbody>{changed.slice(0, SHOW).map((r) => (
                      <tr key={r.line}>
                        <td className={ui.num}>{r.lines.join('・')}</td>
                        <td><span className={ui.badge(TONE[r.action])}>{r.action}</span></td>
                        <td>{r.key}</td><td>{r.name}</td>
                        <td style={{ whiteSpace: 'normal', overflowWrap: 'anywhere' }}>{r.diff.slice(0, 12).map((d, i) => <div key={i}><b>{d.col}</b>：{r.action === '新規' ? (d.after || '—') : <>{d.before || '（空）'} → {d.after || '（空）'}</>}</div>)}
                          {r.diff.length > 12 && <span className={ui.hint}>ほか {r.diff.length - 12}項目</span>}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                {changed.length > SHOW && <span className={ui.hint}>登録する行は全 {changed.length.toLocaleString()}件です。表には先頭 {SHOW}件を出しています。</span>}
              </>
            )}
            {pv.counts.対象外 > 0 && (
              <div className={ui.notice('')}>
                <span>
                  <b>対象外（取り込まない）{pv.counts.対象外}件</b>（エラーではありません）
                  {pv.rows.filter((r) => r.action === '対象外').slice(0, 20).map((r) => <div key={r.line}>{r.lines.join('・')}行目（{r.key}{r.name ? ` ${r.name}` : ''}）：{r.reason}</div>)}
                  {pv.counts.対象外 > 20 && <div>ほか {pv.counts.対象外 - 20}件</div>}
                </span>
              </div>
            )}
            {impactOn && <div className={ui.notice('')}><span><b>影響</b>{pv.impact.map((t, i) => <div key={i}>・{t}</div>)}</span></div>}
            {warns.length > 0 && (
              <div className={ui.notice('warn')}>
                <span>
                  <b>警告（{warns.length}件・登録はできます）</b>
                  {warns.slice(0, 50).map((w, i) => <div key={i}>{w.line}行目{w.key ? `（${w.key}）` : ''}：{w.w}</div>)}
                  {warns.length > 50 && <div>ほか {warns.length - 50}件</div>}
                  {!blocked && <label style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center', marginTop: '0.428571rem' }}><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />警告を確認しました</label>}
                </span>
              </div>
            )}
            {pv.background && !blocked && <span className={ui.hint}>登録が {CSV_BG_UPDATES}件を超えるため、少しずつ登録します（終わるまでこの画面を閉じないでください）。</span>}
            {job && <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}><progress value={job.done} max={job.total} style={{ flex: 1 }} /><span className={ui.hint}>{updateOnly ? `${job.total.toLocaleString()}件中${job.done.toLocaleString()}件を取り込みました。終わるまでこの画面を閉じないでください。` : `${job.done.toLocaleString()} / ${job.total.toLocaleString()}`}</span></div>}
            {!blocked && !errs.length && !changed.length && <span className={ui.hint}>変わる行はありません。</span>}
          </>
        )}
        {ferr && <div className={ui.notice('ng')} role="alert"><span>{ferr}</span></div>}
      </div>
    </Frame>
  );
}
