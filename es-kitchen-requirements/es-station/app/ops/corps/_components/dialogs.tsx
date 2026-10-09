'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { addM, cellText, childCol, GEN_LIMIT_MONTHS, genPlan, LEAD_MONTHS } from '@/lib/ops/contracts/logic';
import type { Branch, TableRow } from '@/lib/ops/contracts/types';
import { fmtDate } from '@/lib/format/date';

/*
 * 法人・契約管理のダイアログ（元の .ovl .dlg と ES Kitchen の .es-modal）。
 * .ops-contracts の CSS で見た目を出すので、画面の中（DetailScreen の layer）に出す。
 */

/** 破棄の確認など（元の mlModal） */
export function EsConfirm({ title, body, ok, onOk, onClose }: { title: string; body: ReactNode; ok: string; onOk: () => void; onClose: () => void }) {
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { okRef.current?.focus(); }, []);
  return (
    <div className="es-modal" role="dialog" aria-modal="true">
      <div className="es-modal__scrim" onClick={onClose} />
      <div className="es-modal__panel">
        <div className="es-modal__mark es-modal__mark--warning">!</div>
        <h2 className="es-modal__title">{title}</h2>
        <div className="es-modal__body">{body}</div>
        <div className="es-modal__actions">
          <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={onClose}>キャンセル</button>
          <button type="button" ref={okRef} className="es-btn es-btn--solid es-btn--negative es-btn--md" onClick={() => { onClose(); onOk(); }}>{ok}</button>
        </div>
      </div>
    </div>
  );
}

/** 法人アカウントの操作の確認（S7C-20261001。元のデモと同じ小さいダイアログ） */
export function AskDialog({ title, text, ok, onOk, onClose }: { title: string; text: string; ok: string; onOk: () => void; onClose: () => void }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.142857rem' }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" style={{ background: '#fff', borderRadius: 12, maxWidth: '31.428571rem', width: '100%', padding: '1.428571rem 1.714286rem', fontSize: '1rem', lineHeight: 1.7 }}>
        <h3 style={{ margin: '0 0 0.571429rem', fontSize: '1.214286rem' }}>{title}</h3>
        <p style={{ margin: '0 0 1.142857rem' }}>{text}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.571429rem' }}>
          <button type="button" className="mini" ref={cancelRef} onClick={onClose}>キャンセル</button>
          <button type="button" className="mini act" onClick={() => { onClose(); onOk(); }}>{ok}</button>
        </div>
      </div>
    </div>
  );
}

/** 子契約の保存：変更の適用範囲（この子契約だけ／この子契約以降すべて） */
export function ScopeDialog({ cyc, n, span, open, fixed, onOk, onClose }: { cyc: string; n: number; span: string; open: number; fixed: number; onOk: (scope: 'only' | 'after') => void; onClose: () => void }) {
  const [v, setV] = useState<'only' | 'after'>('only');
  const okRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { okRef.current?.focus(); }, []);
  return (
    <div className="ovl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlg" role="dialog" aria-modal="true">
        <h3>変更の適用範囲を選んでください</h3>
        <div className="bd">
          <p className="lead">この子契約より後に、生成済みの子契約が <b>{n}件</b> あります（{span}）。</p>
          <label className="op"><input type="radio" name="scope" checked={v === 'only'} onChange={() => setV('only')} /> <b>この子契約だけ（{cyc} のみ）</b>
            <span>この子契約のレコードだけ直します。生成済みの {span} と、翌月以降に生成する分は元の設定のままです。</span></label>
          <label className="op"><input type="radio" name="scope" checked={v === 'after'} onChange={() => setV('after')} /> <b>この子契約以降すべて（{cyc} 以降すべて）</b>
            <span>この子契約を直したうえで、生成元の設定（拠点・親契約・プラン）も同じ値に更新します。生成済みで未確定の子契約 <strong>{open}件</strong> も同時に直します。{fixed ? <>確定・請求済の子契約 <strong>{fixed}件</strong> は直しません。</> : null}</span></label>
        </div>
        <div className="ft"><button className="cx" onClick={onClose}>キャンセル</button><button className="ok" ref={okRef} onClick={() => { onClose(); onOk(v); }}>保存</button></div>
      </div>
    </div>
  );
}

/** 子契約を先まで作る：月を選ぶ → 作られる子契約を見る → N件作成 */
export function GenDialog({ rows, thisMonth, onOk, onClose }: { rows: TableRow[]; thisMonth: string; onOk: (until: string) => void; onClose: () => void }) {
  const base = genPlan(rows, thisMonth);
  const [until, setUntil] = useState(base.choices[0] ?? base.first);
  const plan = genPlan(rows, thisMonth, until);
  const top = plan.top;
  const cell = (n: string) => (top ? cellText(top.c[childCol(n)]) : '');
  const n = plan.months.length;
  const bands = rows.flatMap((r) => ('band' in r ? [r.band] : []));
  return (
    <div className="ovl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlg wide" role="dialog" aria-modal="true">
        <h3>子契約を先まで作る</h3>
        <div className="bd">
          <p className="lead">ふだんは日次バッチが次のサイクルを自動で作ります（次は <b>{plan.first}</b> を {addM(plan.first, -LEAD_MONTHS)}-01 に作成予定）。手で作るのは、先のプラン変更に備えるとき・お試しキャンペーンを複数月にするときだけです。</p>
          <div className="row"><b>作成済</b><span>{plan.last} まで（{plan.count}件）</span></div>
          <div className="row"><b>どの月まで作りますか</b>
            <select className="until" value={until} onChange={(e) => setUntil(e.target.value)} autoFocus>{base.choices.map((m) => <option key={m}>{m}</option>)}</select>
            <span className="memo" style={{ margin: 0 }}>{plan.first} 〜 {plan.limit}（今月から{GEN_LIMIT_MONTHS}ヶ月先まで）</span></div>
          <div className="gpv"><table><thead><tr><th>子契約ID</th><th>サイクル月</th><th>プラン</th><th>配送区分・納品回数</th><th>前払いの請求月</th><th>生成基準日</th></tr></thead>
            <tbody>{plan.months.map((m) => { const bm = addM(m, -LEAD_MONTHS); return <tr key={m}><td>{plan.cid}-{m.replace('-', '')}</td><td>{m}</td><td>{cell('プラン名')}</td><td>{cell('配送区分')} {cell('納品回数')}</td><td>{bm}</td><td>{bm.replace('-', '/')}/01</td></tr>; })}</tbody></table></div>
          <div className="memo">最新の子契約（{cell('子契約ID')}）と同じプラン・配送で作ります。作ったあとは一覧から1件ずつ直せます。すでにある月は作り直しません。{bands.map((b) => <span key={b.from}><br />休止期間（{b.from} 〜 {b.to}）のサイクル月は作りません。</span>)}</div>
        </div>
        <div className="ft"><button className="cx" onClick={onClose}>キャンセル</button><button className="ok" disabled={!n} onClick={() => { onClose(); onOk(until); }}>{n ? `${n}件作成` : `作れる月がありません（上限 ${plan.limit} まで作成済み）`}</button></div>
      </div>
    </div>
  );
}
export const genToast = (n: number, first: string, last: string) =>
  `${n}件の子契約を作成しました（${first}${n > 1 ? ' 〜 ' + last : ''}）。一覧の「手動生成」の行から1件ずつ直せます`;

/** 法人の「拠点の請求先を一括変更」（2026/09/28・運営だけ） */
export function BulkBillToDialog({ branches, onOk, onClose }: { branches: Branch[]; onOk: (changes: { id: string; billTo: '法人' | 'この拠点' }[]) => void; onClose: () => void }) {
  const [sel, setSel] = useState<Record<string, '法人' | 'この拠点'>>(() => Object.fromEntries(branches.map((b) => [b.id, b.billTo])));
  const n = branches.filter((b) => sel[b.id] !== b.billTo).length;
  return (
    <div className="ovl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlg wide" role="dialog" aria-modal="true">
        <h3>拠点の請求先を一括変更</h3>
        <div className="bd">
          <p className="lead">配下の拠点の請求先を選び直して、まとめて保存します。発行済みの請求書はそのままで、まだ発行していない請求書から新しい請求先になります（追補 28-6）。法人なし拠点は出しません。</p>
          <div className="gpv"><table><thead><tr><th>拠点ID</th><th>拠点名</th><th>いまの請求先</th><th>変更後の請求先</th></tr></thead>
            <tbody>{branches.map((b) => (
              <tr key={b.id}><td>{b.id}</td><td>{b.name}</td><td>{b.billTo}</td>
                <td><select value={sel[b.id]} onChange={(e) => setSel((s) => ({ ...s, [b.id]: e.target.value as '法人' | 'この拠点' }))}>{['法人', 'この拠点'].map((x) => <option key={x}>{x}</option>)}</select></td></tr>
            ))}</tbody></table></div>
          <div className="memo">変更する拠点：{n}件</div>
        </div>
        <div className="ft"><button className="cancel" onClick={onClose}>キャンセル</button>
          <button className="ok" onClick={() => { onClose(); onOk(branches.filter((b) => sel[b.id] !== b.billTo).map((b) => ({ id: b.id, billTo: sel[b.id] }))); }}>保存</button></div>
      </div>
    </div>
  );
}

/** お試しの延長（運営だけ・2026/10/03 決定）：延長する月数を選ぶ → 足す子契約を見る → 延長 */
export type TrialInfo = { contractId: string; from: string; to: string; months: number; decideBy: string; block: string; ext: { at: string; by: string; months: number; fromCycle: string; toCycle: string; note: string }[] };
export function TrialExtendDialog({ info, onOk, onClose }: { info: TrialInfo; onOk: (months: number, note: string) => void; onClose: () => void }) {
  const [n, setN] = useState('1');
  const [note, setNote] = useState('');
  const months = /^\d+$/.test(n.trim()) ? Number(n.trim()) : 0;
  const list = months > 0 ? Array.from({ length: months }, (_, i) => addM(info.to, i + 1)) : [];
  return (
    <div className="ovl" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="dlg wide" role="dialog" aria-modal="true">
        <h3>お試しを延長する</h3>
        <div className="bd">
          <p className="lead">お試しの最後の子契約と同じ中身で、次のサイクルから子契約を作ります。延長の月は <b>割引しません（プラン料金を請求）</b>・請求は未確定です。法人へ通知・メールでお知らせし、法人Web の拠点詳細「お試し期間」に延長が出ます。</p>
          <div className="row"><b>いまのお試し期間</b><span>{info.from} 〜 {info.to}（{info.months}ヶ月{info.ext.length ? `・延長 ${info.ext.length}回` : ''}）</span></div>
          <div className="row"><b>延長する月数</b>
            <input className="r" style={{ width: '5rem' }} inputMode="numeric" value={n} onChange={(e) => setN(e.target.value)} autoFocus /><span className="unit">ヶ月</span>
            <span className="memo" style={{ margin: 0 }}>今のところ上限なし（長くなるときは本導入への切替をご案内ください）</span></div>
          <div className="row"><b>メモ（社内）</b><input style={{ flex: 1 }} value={note} placeholder="例）法人のご希望（検討期間の延長）" onChange={(e) => setNote(e.target.value)} /></div>
          {list.length > 0 && (
            <div className="gpv"><table><thead><tr><th>子契約ID</th><th>サイクル月</th><th>種別</th><th>ご請求</th></tr></thead>
              <tbody>{list.map((m) => <tr key={m}><td>{info.contractId}-{m.replace('-', '')}</td><td>{m}</td><td>お試しキャンペーン</td><td>プラン料金（割引なし）</td></tr>)}</tbody></table></div>
          )}
          <div className="memo">延長後のお試し期間：{info.from} 〜 {list.length ? list[list.length - 1] : info.to}。{info.ext.length ? <><br />これまでの延長：{info.ext.map((e) => `${fmtDate(e.at.slice(0, 10))} ${e.fromCycle}〜${e.toCycle}（${e.months}ヶ月）`).join('・')}</> : null}</div>
        </div>
        <div className="ft"><button className="cx" onClick={onClose}>キャンセル</button><button className="ok" disabled={!months} onClick={() => { onClose(); onOk(months, note); }}>{months ? `${months}ヶ月延長する` : '月数を入れてください'}</button></div>
      </div>
    </div>
  );
}

/** 元に戻せない操作の確認（付け替え・切替）：警告マーク・最初のフォーカスはキャンセル・Esc で閉じる・確定は赤いボタン（EsConfirm と同じ） */
function OpConfirm({ title, ok, okDisabled, onOk, onClose, children }: { title: string; ok: string; okDisabled?: boolean; onOk: () => void; onClose: () => void; children: ReactNode }) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);
  return (
    <div className="es-modal" role="dialog" aria-modal="true" aria-label={title} onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="es-modal__scrim" onClick={onClose} />
      <div className="es-modal__panel">
        <div className="es-modal__mark es-modal__mark--warning">!</div>
        <h2 className="es-modal__title">{title}</h2>
        <div className="es-modal__body opdlg">{children}</div>
        <div className="es-modal__actions">
          <button type="button" ref={cancelRef} className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={onClose}>キャンセル</button>
          <button type="button" className="es-btn es-btn--solid es-btn--negative es-btn--md" disabled={okDisabled} onClick={() => { onClose(); onOk(); }}>{ok}</button>
        </div>
      </div>
    </div>
  );
}

/** 所属法人の付け替え（システム管理だけ・Q01：ボタン名＝「付け替える」）。新しい法人を選び、影響を見てから実行（その場で保存） */
export function ReassignDialog({ branch, current, corps, onOk, onClose }: { branch: string; current: string; corps: { id: string; name: string; block?: string }[]; onOk: (corp: { id: string; name: string }) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState('');
  /* いまの所属法人は候補に入れない */
  const cands = corps.filter((c) => !current.startsWith(c.id));
  const list = cands.filter((c) => !q.trim() || `${c.id} ${c.name}`.toLowerCase().includes(q.trim().toLowerCase()));
  const to = cands.find((c) => c.id === sel && !c.block);
  return (
    <OpConfirm title="所属法人を付け替えますか？" ok="付け替える" okDisabled={!to} onClose={onClose} onOk={() => { if (to) onOk(to); }}>
      <p className="lead">本当に付け替えてもよろしいですか？<br />付け替えると元に戻せません。</p>
      <div className="row"><b>拠点</b><span>{branch}</span></div>
      <div className="row"><b>いまの所属法人</b><span>{current}</span></div>
      <div className="row"><b>新しい所属法人</b>
        <input value={q} placeholder="法人ID・法人名で絞り込み" aria-label="法人ID・法人名で絞り込み" onChange={(e) => { setQ(e.target.value); setSel(''); }} />
        <select value={sel} aria-label="新しい所属法人" onChange={(e) => setSel(e.target.value)}>
          <option value="">{list.length ? '選んでください' : '該当なし'}</option>
          {list.map((c) => <option key={c.id} value={c.id} disabled={!!c.block} title={c.block}>{c.id} {c.name}{c.block ? '（お試し割引を使用済み・選べません）' : ''}</option>)}
        </select></div>
      <div className="cnt">{list.length ? `候補 ${list.length}件${q.trim() ? `（全 ${cands.length}件から絞り込み）` : ''}` : '該当なし'}</div>
      <div className="memo">影響：請求先・請求条件は、新しい法人のものに直します（請求先は「法人」）。変更履歴に「付け替え」の行が残ります。この画面の「保存」とは別に、その場でただちに保存されます。</div>
    </OpConfirm>
  );
}

/**
 * お試し→本導入の切替（Q01：ボタン名＝「本導入に切り替える」）。本導入の開始年月を選び（既定＝次のサイクル月）、その場で保存する。
 * 中身は申込の切替と同じ：開始月から本導入の子契約にしてお試し割引（DC000013）を外す・契約種別の履歴に1行足す・最低利用期間／違約金の数え始めを開始日にする・法人へメール
 */
export function SwitchDialog({ min, from, onOk, onClose }: { min: string; from: string; onOk: (startYm: string) => void; onClose: () => void }) {
  const [ym, setYm] = useState(from);
  const ok = /^\d{4}-(0[1-9]|1[0-2])$/.test(ym) && (!min || ym >= min);
  return (
    <OpConfirm title="本導入に切り替えますか？" ok="本導入に切り替える" okDisabled={!ok} onClose={onClose} onOk={() => onOk(ym)}>
      <p className="lead">本当に本導入に切り替えてもよろしいですか？<br />本導入に切り替えると元に戻せません。</p>
      <div className="row"><b>本導入の開始年月</b>
        <input type="month" value={ym} min={min || undefined} aria-label="本導入の開始年月" onChange={(e) => setYm(e.target.value)} />
        <span className="memo" style={{ margin: 0 }}>{min ? `${min.replace('-', '年')}月以降（お試しの開始より後・請求が確定済みの月より後）` : ''}</span></div>
      <div className="memo">影響：{ym ? `${ym} サイクル以降の子契約を本導入にし、` : ''}お試しキャンペーン割引（DC000013）を外します。お試しは開始月の前の月までになり、親契約の「契約種別の履歴」に本導入の開始（{ym || '—'}）を1行足します。最低利用期間・違約金・自動更新は、本導入の開始日から数えます。初期費用（契約にあるとき）は請求に載せ、法人へメールでお知らせします。この画面の「保存」とは別に、その場でただちに保存されます。</div>
    </OpConfirm>
  );
}
