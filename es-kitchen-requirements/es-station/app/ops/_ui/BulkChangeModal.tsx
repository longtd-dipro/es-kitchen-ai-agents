'use client';

import { useMemo, useState } from 'react';
import bulk from '@/lib/domain/areas/bulk';
import master from '@/lib/domain/areas/master';
import org from '@/lib/domain/areas/org';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { BulkFilter, BulkTo, Carrier, Plan, Warehouse } from '@/lib/domain/types';
import { fmtDateTime, fmtYm } from '@/lib/format/date';
import { useOps } from './OpsProvider';
import { useCanAct } from './perm';
import { Field, Modal } from './ui';
import { yenSigned as yen } from '@/lib/format/money';

/*
 * 契約の一括変更のモーダル（課題 7-2。別の画面は作らない＝旧「配送ルートの一括変更」は廃止）。
 *   倉庫マスタ「この倉庫の契約を一括変更」・委託配送先マスタ「この配送先の契約を一括変更」・プランマスタ「価格世代を一括切替」から開く。
 *   ① 条件と変更後（変えられるのはピッキング倉庫・中継・委託配送先／路線便・価格世代だけ）→ ② 対象（比較の列・既定で全部選ぶ）
 *   → ③ 確認（後ろの流れへの影響・法人への通知・100件を超えたら件数の打ち直し・新しい倉庫の出荷禁止日／リードタイムの注意を SA が確かめる＝課題 4b-6）
 *   → ④ 実行（分けて進める・進み具合）→ 結果（変えなかった月とその理由＝課題 4b-8）。元に戻す操作はない
 *   中継を選んだときは、区間1（倉庫→中継）の運び手を中継を運営する会社か委託配送会社から選べる（課題 4b-7）
 * 決まりは共通データ（lib/domain/bulk.ts）。
 */

const bulkApi = domainApi(bulk);
const masterApi = domainApi(master);
const orgApi = domainApi(org);
/** 子契約一覧＝価格世代の一括切替（プラン・いま使っている価格の世代を条件に選ぶ。台帳 F「価格世代を一括切替の置き場所」・受付簿 #96） */
type Source = '倉庫マスタ' | '委託配送先マスタ' | 'プランマスタ' | '子契約一覧';
type Step = 'cond' | 'rows' | 'confirm' | 'run';
const COURSES = ['ESスタンダード', 'ESライト（冷蔵庫）', 'ESライト（自販機）'];

export function BulkChangeModal({ source, sourceId, sourceName }: { source: Source; sourceId: string; sourceName: string }) {
  const { toast, toastError, closeModal, account } = useOps();
  const canAct = useCanAct();
  const mode = source === 'プランマスタ' || source === '子契約一覧' ? '価格世代' as const : 'ルート' as const;
  const [step, setStep] = useState<Step>('cond');
  const [filter, setFilter] = useState<BulkFilter>(source === '倉庫マスタ' ? { warehouseId: sourceId } : source === '委託配送先マスタ' ? { carrierId: sourceId } : {});
  const [to, setTo] = useState<BulkTo>({});
  const [fromCycle, setFromCycle] = useState('');
  const [off, setOff] = useState<Set<string>>(new Set());
  const [notifyCorp, setNotifyCorp] = useState(false);
  const [retype, setRetype] = useState('');
  const [ack, setAck] = useState(false);
  const [job, setJob] = useState<Awaited<ReturnType<typeof bulkApi.action<'start'>>> | null>(null);
  const [tab, setTab] = useState<'new' | 'hist'>('new');

  const { data: cycles } = useDomainQuery(bulkApi, 'cycles');
  const { data: whs } = useDomainQuery(masterApi, 'list', { kind: 'warehouses' });
  const { data: cars } = useDomainQuery(masterApi, 'list', { kind: 'carriers' });
  const { data: corps } = useDomainQuery(orgApi, 'corps');
  const { data: brs } = useDomainQuery(orgApi, 'branches', {});
  const { data: hist } = useDomainQuery(bulkApi, 'history', { source, sourceId });
  const { data: leg1 } = useDomainQuery(bulkApi, 'leg1Carriers', { hubId: to.hubId ?? '' });
  /* 子契約一覧から：プランと価格の世代の選択肢（プランマスタからはそのプラン） */
  const { data: plans } = useDomainQuery(masterApi, 'list', { kind: source === '子契約一覧' ? 'plans' : 'taxRates' });
  const planId = source === 'プランマスタ' ? sourceId : filter.planId ?? '';
  const { data: gens } = useDomainQuery(bulkApi, 'priceGens', planId ? { planId } : null);
  const cyc = fromCycle || cycles?.[0]?.id || '';
  const args = { mode, filter, to, planId: mode === '価格世代' ? planId : undefined, fromCycle: cyc };
  const ready = !!cyc && (mode === '価格世代' ? !!planId && !!to.priceGenId : to.warehouseId !== undefined || to.hubId !== undefined || to.carrierId !== undefined);
  const { data: all, error } = useDomainQuery(bulkApi, 'preview', ready && step !== 'cond' ? args : null);
  const rows = ready && step !== 'cond' ? all?.rows ?? [] : [];
  const ids = rows.filter((x) => !off.has(x.contractId)).map((x) => x.contractId);
  const { data: sel } = useDomainQuery(bulkApi, 'preview', step === 'confirm' ? { ...args, contractIds: ids } : null);

  const W = (whs ?? []) as Warehouse[], C = (cars ?? []) as Carrier[];
  const picks = W.filter((w) => w.type === 'picking' && w.status === '有効'), hubs = W.filter((w) => w.type === 'relay' && w.status === '有効');
  const prefs = useMemo(() => [...new Set((brs ?? []).map((b) => b.branch.address.pref))].sort(), [brs]);
  const opt = (v: string, list: { id: string; name: string }[], ph: string, onChange: (v: string) => void, extra?: [string, string][]) => (
    <select className="sel" value={v} onChange={(e) => onChange(e.target.value)}>
      <option value="">{ph}</option>{extra?.map(([k, l]) => <option key={k} value={k}>{l}</option>)}{list.map((x) => <option key={x.id} value={x.id}>{x.id} {x.name}</option>)}
    </select>
  );
  const kv = (l: string, v: React.ReactNode) => <div className="kv"><small>{l}</small><b>{v}</b></div>;

  const start = async () => {
    try {
      let j = await bulkApi.action('start', { ...args, contractIds: ids, source, sourceId, notifyCorp, confirmCount: Number(retype) || undefined, by: account?.id ?? '運営', ackAlerts: ack });
      setJob(j); setStep('run');
      /* 分けて進める（進み具合のバー） */
      while (j.status === '実行中') { j = await bulkApi.action('step', { id: j.id }); setJob(j); }
      toast(`一括変更 ${j.id} が終わりました（変更 ${j.summary.changed}件・スキップ ${j.summary.skipped}件・失敗 ${j.summary.failed}件）`);
    } catch (e) { toastError(e); }
  };

  const title = source === '子契約一覧' ? '価格世代を一括切替' : mode === '価格世代' ? `価格世代を一括切替（${sourceName}）` : source === '倉庫マスタ' ? `この倉庫の契約を一括変更（${sourceName}）` : `この配送先の契約を一括変更（${sourceName}）`;
  const foot = step === 'run' ? <button className="btn pri lg" disabled={job?.status !== '完了'} onClick={closeModal}>閉じる</button>
    : step === 'cond' ? <><button className="btn lg ghost" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={!ready} onClick={() => setStep('rows')}>対象を見る</button></>
      : step === 'rows' ? <><button className="btn lg ghost" onClick={() => setStep('cond')}>戻る</button><button className="btn pri lg" disabled={!ids.length} onClick={() => { setRetype(''); setAck(false); setStep('confirm'); }}>確認へ（{ids.length}件）</button></>
        : <><button className="btn lg ghost" onClick={() => setStep('rows')}>戻る</button>{canAct(bulkApi, 'start') && <button className="btn pri lg" disabled={!sel || (sel.needRetype && Number(retype) !== ids.length) || (!!sel.impact.alerts.length && !ack)} onClick={start}>一括変更を実行（{ids.length}件）</button>}</>;

  return (
    <Modal title={title} width={1100} footer={tab === 'new' ? foot : <button className="btn lg ghost" onClick={closeModal}>閉じる</button>}>
      <div className="tabs" style={{ marginBottom: '0.857143rem' }}>
        <button className={tab === 'new' ? 'on' : ''} onClick={() => setTab('new')}>一括変更</button>
        <button className={tab === 'hist' ? 'on' : ''} onClick={() => setTab('hist')}>履歴（{hist?.length ?? 0}）</button>
      </div>
      {tab === 'hist' && <History rows={hist ?? []} />}
      {tab === 'new' && step === 'cond' && (
        <>
          <div className="notice"><span>{mode === '価格世代'
            ? '適用開始のサイクル月から、未確定の子契約の ① 費目をプランの価格世代（その月の価格）で作り直します。確定・請求済の子契約は変えません（請求調整）。'
            : '変えられるのはピッキング倉庫・中継・委託配送先（路線便）だけです。倉庫には担当エリアがないので、条件で対象を選んでください。確定・請求済の子契約・出荷した配送は変えません。'}</span></div>
          <div className="sec-h" style={{ margin: '0.857143rem 0 0.571429rem' }}><h2>① 対象の条件</h2></div>
          <div className="fg" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
            {source === '子契約一覧' && <>
              <Field label="プラン" req>{opt(filter.planId ?? '', ((plans ?? []) as Plan[]).filter((p) => p.status !== '削除済').map((p) => ({ id: p.id, name: p.name })), '選んでください', (v) => { setFilter({ ...filter, planId: v || undefined, genId: undefined }); setTo({ ...to, priceGenId: undefined }); })}</Field>
              <Field label="いま使っている価格の世代" hint="空＝そのプランの子契約すべて">
                <select className="sel" value={filter.genId ?? ''} disabled={!planId} onChange={(e) => setFilter({ ...filter, genId: e.target.value || undefined })}>
                  <option value="">すべて</option>
                  {(gens?.gens ?? []).map((g) => <option key={g.id} value={g.id}>{g.id} {g.note || ''}（{fmtYm(g.fromCycle)}〜・{g.used}件）</option>)}
                </select>
              </Field>
            </>}
            {mode === 'ルート' && <>
              <Field label="今のピッキング倉庫">{opt(filter.warehouseId ?? '', picks, 'すべて', (v) => setFilter({ ...filter, warehouseId: v || undefined }))}</Field>
              <Field label="今の中継">{opt(filter.hubId ?? '', hubs, 'すべて', (v) => setFilter({ ...filter, hubId: v || undefined }))}</Field>
              <Field label="今の委託配送先・路線便">{opt(filter.carrierId ?? '', C, 'すべて', (v) => setFilter({ ...filter, carrierId: v || undefined }))}</Field>
              <Field label="配送方法"><select className="sel" value={filter.method ?? ''} onChange={(e) => setFilter({ ...filter, method: e.target.value as BulkFilter['method'] })}><option value="">すべて</option>{['自社便', '委託', '路線便'].map((x) => <option key={x}>{x}</option>)}</select></Field>
            </>}
            <Field label="法人">{opt(filter.corpId ?? '', (corps ?? []).map((c) => ({ id: c.id, name: c.name })), 'すべて', (v) => setFilter({ ...filter, corpId: v || undefined, branchId: undefined }))}</Field>
            <Field label="拠点">{opt(filter.branchId ?? '', (brs ?? []).filter((b) => !filter.corpId || b.branch.corpId === filter.corpId).map((b) => ({ id: b.branch.id, name: b.branch.name })), 'すべて', (v) => setFilter({ ...filter, branchId: v || undefined }))}</Field>
            <Field label="コース"><select className="sel" value={filter.course ?? ''} onChange={(e) => setFilter({ ...filter, course: e.target.value || undefined })}><option value="">すべて</option>{COURSES.map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field label="温度帯"><select className="sel" value={filter.temp ?? ''} onChange={(e) => setFilter({ ...filter, temp: e.target.value as BulkFilter['temp'] })}><option value="">すべて</option><option>冷蔵</option><option>冷凍</option></select></Field>
            <Field label="市区町村"><input className="inp" value={filter.city ?? ''} placeholder="例）港区" onChange={(e) => setFilter({ ...filter, city: e.target.value || undefined })} /></Field>
            <Field label="郵便番号（頭）"><input className="inp" value={filter.zip ?? ''} placeholder="例）105" onChange={(e) => setFilter({ ...filter, zip: e.target.value || undefined })} /></Field>
            <Field label="都道府県（複数）" className="full">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.285714rem 1.142857rem' }}>
                {prefs.map((p) => (
                  <label key={p} style={{ display: 'inline-flex', gap: '0.428571rem', alignItems: 'center', fontSize: '1rem' }}>
                    <input type="checkbox" checked={!!filter.prefs?.includes(p)} onChange={(e) => setFilter({ ...filter, prefs: e.target.checked ? [...(filter.prefs ?? []), p] : (filter.prefs ?? []).filter((x) => x !== p) })} />{p}
                  </label>
                ))}
              </div>
            </Field>
          </div>
          <div className="sec-h" style={{ margin: '1.142857rem 0 0.571429rem' }}><h2>② {mode === '価格世代' ? '適用開始' : '変更後と適用開始'}</h2></div>
          <div className="fg" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))' }}>
            {mode === 'ルート' && <>
              <Field label="ピッキング倉庫">{opt(to.warehouseId ?? '', picks, '変えない', (v) => setTo({ ...to, warehouseId: v || undefined }))}</Field>
              <Field label="中継">{opt(to.hubId === undefined ? '' : to.hubId || '__none__', hubs, '変えない', (v) => setTo({ ...to, hubId: v === '' ? undefined : v === '__none__' ? '' : v, leg1CarrierId: undefined }), [['__none__', '中継なし']])}</Field>
              {!!to.hubId && <Field label="区間1（倉庫→中継）の運び手" hint="中継を運営する会社か委託配送会社">{opt(to.leg1CarrierId ?? '', (leg1 ?? []).map((c) => ({ id: c.id, name: `${c.name}（${c.kind}）` })), '中継を運営する会社（既定）', (v) => setTo({ ...to, leg1CarrierId: v || undefined }))}</Field>}
              <Field label="委託配送先・路線便（お届けする会社）">{opt(to.carrierId ?? '', C.filter((c) => c.status === '有効'), '変えない', (v) => setTo({ ...to, carrierId: v || undefined }))}</Field>
            </>}
            {mode === '価格世代' && (
              <Field label="変更後の価格世代" req hint="子契約の「適用された価格プラン」に書きます。そのプラン・コースの全世代から選べます">
                <select className="sel" value={to.priceGenId ?? ''} disabled={!planId} onChange={(e) => setTo({ ...to, priceGenId: e.target.value || undefined })}>
                  <option value="">選んでください</option>
                  {(gens?.gens ?? []).map((g) => <option key={g.id} value={g.id}>{g.id} {g.note || ''}（{fmtYm(g.fromCycle)}〜{g.public ? '・公開用' : ''}）</option>)}
                </select>
              </Field>
            )}
            <Field label="適用開始のサイクル" hint="子契約が未確定のサイクル月だけ">
              <select className="sel" value={cyc} onChange={(e) => setFromCycle(e.target.value)}>
                {(cycles ?? []).map((c) => <option key={c.id} value={c.id}>{fmtYm(c.id)}（未確定 {c.open}件{c.locked ? `・確定/請求済 ${c.locked}件は変えない` : ''}）</option>)}
              </select>
            </Field>
          </div>
        </>
      )}
      {tab === 'new' && step === 'rows' && (
        <>
          {!!error && <div className="notice warn"><span>{String((error as Error).message ?? error)}</span></div>}
          <div className="sec-h" style={{ margin: '0 0 0.571429rem' }}><h2>対象（{rows.length}件・選択 {ids.length}件）</h2></div>
          <div className="tbl-wrap" style={{ maxHeight: '32.857143rem', overflow: 'auto' }}>
            <table className="tbl">
              <thead><tr>
                <th><input type="checkbox" checked={!!rows.length && !off.size} onChange={(e) => setOff(e.target.checked ? new Set() : new Set(rows.map((x) => x.contractId)))} aria-label="全て選ぶ" /></th>
                <th>契約</th><th>拠点</th>{mode === 'ルート' ? <><th>倉庫</th><th>中継</th><th>委託配送先</th><th>配送方法</th><th>リードタイム</th></> : <><th>コース</th><th className="num">請求の差（月額・税抜）</th></>}<th>子契約</th><th>注意</th>
              </tr></thead>
              <tbody>
                {rows.map((x) => {
                  const on = !off.has(x.contractId);
                  const cmp = (a?: string | number, b?: string | number) => (a !== b ? <><span className="muted" style={{ textDecoration: 'line-through' }}>{a}</span><br /><b className="txt-ac">{b}</b></> : a);
                  return (
                    <tr key={x.contractId} className={on ? 'rsel' : ''}>
                      <td><input type="checkbox" checked={on} onChange={(e) => { const n = new Set(off); if (e.target.checked) n.delete(x.contractId); else n.add(x.contractId); setOff(n); }} aria-label={x.branchName} /></td>
                      <td className="mono">{x.contractId}</td>
                      <td>{x.branchName}<br /><span className="muted">{x.corpName}・{x.pref}{x.city}・{x.course}{x.temps ? `・${x.temps}` : ''}</span></td>
                      {mode === 'ルート' ? <>
                        <td>{cmp(x.cur?.warehouse, x.next?.warehouse)}</td><td>{cmp(x.cur?.hub, x.next?.hub)}</td><td>{cmp(x.cur?.carrier, x.next?.carrier)}</td>
                        <td>{cmp(x.cur?.method, x.next?.method)}</td><td>{cmp(`${x.cur?.lead ?? '—'}日`, `${x.leadNext}日`)}</td>
                      </> : <><td>{x.course}</td><td className="num">{yen(x.feeDiff)}</td></>}
                      <td style={{ fontSize: '0.928571rem' }}>{x.children.map((c) => <div key={c.id}>{fmtYm(c.cycleMonth)}：{c.action === '変更' ? '変更' : <span className="txt-warn">スキップ（{c.why}）</span>}</div>)}</td>
                      <td style={{ fontSize: '0.928571rem', whiteSpace: 'normal', minWidth: '15.714286rem' }}>{x.warnings.map((w) => <div key={w} className="txt-warn">⚠ {w}</div>)}</td>
                    </tr>
                  );
                })}
                {!rows.length && <tr><td colSpan={11} className="empty">条件に合う契約はありません</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
      {tab === 'new' && step === 'confirm' && sel && (
        <>
          <div className="sec-h" style={{ margin: '0 0 0.571429rem' }}><h2>後ろの流れへの影響（{fmtYm(cyc)} サイクルから・{ids.length}件）</h2></div>
          <div className="kvgrid">
            {kv('変える契約', `${sel.impact.contracts}件`)}
            {kv('子契約（変える）', `${sel.impact.children.change}件`)}
            {kv('子契約（変えない：確定・請求済）', `${sel.impact.children.skipLocked}件`)}
            {kv('子契約（変えない：オーダー締切後で新しい倉庫にない商品の注文あり）', `${sel.impact.children.skipOrder}件`)}
            {mode === 'ルート' && <>
              {kv('配送データ（直す）', `${sel.impact.deliveries.change}件`)}
              {kv('出荷指示の再送（rev+1）', `${sel.impact.deliveries.resend}件`)}
              {kv('出荷済（変えない）', `${sel.impact.deliveries.shipped}件`)}
              {kv('注文をデフォルトに戻す', `${sel.impact.orders.reset}件`)}
            </>}
          </div>
          {mode === 'ルート' && (
            <div className="tbl-wrap" style={{ marginTop: '0.571429rem' }}>
              <table className="tbl">
                <tbody>
                  <tr><td>注文・メニュー</td><td style={{ whiteSpace: 'normal' }}>{sel.impact.orders.unstockedBranches ? `新しい倉庫にない商品を頼んでいる拠点 ${sel.impact.orders.unstockedBranches}件（登録済の注文はデフォルトに戻して再注文のお願い・締切後の月は変えない）。` : '新しい倉庫にない商品の注文はありません。'}{sel.impact.menu}</td></tr>
                  <tr><td>発注</td><td style={{ whiteSpace: 'normal' }}>{sel.impact.hon.length ? sel.impact.hon.map((h) => `${h.name} ${h.qty > 0 ? '＋' : ''}${h.qty}個`).join('・') + '（本発注の前の月は倉庫ごとの発注の数が移ります）' : '倉庫ごとの発注の数は変わりません'}</td></tr>
                  <tr><td>委託配送先へ通知</td><td style={{ whiteSpace: 'normal' }}>{[...sel.impact.carriers.off.map((c) => `${c.name}（担当の終了）`), ...sel.impact.carriers.on.map((c) => `${c.name}（担当の追加）`)].join('・') || '委託配送先は変わりません'}</td></tr>
                </tbody>
              </table>
            </div>
          )}
          {mode === '価格世代' && sel.impact.billing && (
            <div className="kvgrid">{kv('請求の差（月額・税抜の合計）', yen(sel.impact.billing.diffYen))}{kv('金額が変わる子契約', `${sel.impact.billing.children}件`)}</div>
          )}
          {sel.impact.alerts.length > 0 && (
            <div className="notice warn" style={{ marginTop: '0.571429rem', display: 'block' }}>
              <b>確かめてください（{sel.impact.alerts.length}件）</b>
              <ul style={{ margin: '0.285714rem 0 0.571429rem', paddingLeft: '1.285714rem' }}>{sel.impact.alerts.map((m) => <li key={m}>{m}</li>)}</ul>
              <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />注意を確かめたうえで実行する（日付・リードタイムは変えません。確かめた記録を一括変更の履歴に残します）</label>
            </div>
          )}
          <label style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center', margin: '0.857143rem 0' }}><input type="checkbox" checked={notifyCorp} onChange={(e) => setNotifyCorp(e.target.checked)} />法人に通知する（変わる拠点の法人・拠点アカウントへ）</label>
          {sel.needRetype && (
            <Field label={`対象が ${ids.length}件あります。確認のため件数を入れてください`} req>
              <input className="inp" style={{ width: '11.428571rem' }} value={retype} onChange={(e) => setRetype(e.target.value.replace(/\D/g, ''))} placeholder={String(ids.length)} />
            </Field>
          )}
          <div className="notice warn" style={{ marginTop: '0.571429rem' }}><span>実行すると元に戻せません（履歴は残ります）。件数に上限はありません。分けて進めます。</span></div>
        </>
      )}
      {tab === 'new' && step === 'run' && job && (
        <>
          <div className="sec-h" style={{ margin: '0 0 0.571429rem' }}><h2>{job.status === '完了' ? '結果' : '実行中…'}（{job.id}）</h2></div>
          <div className="meter"><span style={{ width: `${Math.round((job.processed / Math.max(1, job.total)) * 100)}%` }} /></div>
          <div className="kvgrid">
            {kv('進み具合', `${job.processed} / ${job.total}`)}{kv('変更', `${job.summary.changed}件`)}{kv('スキップ', `${job.summary.skipped}件`)}{kv('失敗', `${job.summary.failed}件`)}
            {kv('子契約', `${job.summary.children}件`)}{kv('配送データ', `${job.summary.deliveries}件`)}{kv('出荷指示の再送', `${job.summary.resent}件`)}{kv('注文をデフォルトに', `${job.summary.ordersReset}件`)}
          </div>
          <Results job={job} />
        </>
      )}
    </Modal>
  );
}

type Job = Awaited<ReturnType<typeof bulkApi.action<'step'>>>;
function Results({ job }: { job: Job }) {
  const rows = job.results.filter((x) => x.result !== '変更' || x.reason);
  return (
    <div className="tbl-wrap" style={{ maxHeight: '21.428571rem', overflow: 'auto' }}>
      <table className="tbl">
        <thead><tr><th>契約</th><th>結果</th><th>理由</th><th>スキップした子契約</th></tr></thead>
        <tbody>
          {rows.map((x) => <tr key={x.contractId}><td className="mono">{x.contractId}</td><td>{x.result}</td><td style={{ whiteSpace: 'normal' }}>{x.reason || '—'}</td><td style={{ fontSize: '0.928571rem', whiteSpace: 'normal' }}>{x.skipped.map((s) => `${s.id}：${s.why}`).join('、') || '—'}</td></tr>)}
          {!rows.length && <tr><td colSpan={4} className="empty">スキップ・失敗はありません</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function History({ rows }: { rows: Job[] }) {
  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead><tr><th>番号</th><th>実行日時</th><th>種類</th><th>適用開始</th><th>件数</th><th>結果</th><th>状態</th></tr></thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id}>
              <td className="mono">{h.id}</td><td>{fmtDateTime(h.at)}</td><td>{h.mode}{h.to.priceGenId ? `・世代→${h.to.priceGenId}` : ''}{h.to.warehouseId ? `・倉庫→${h.to.warehouseId}` : ''}{h.to.hubId !== undefined ? `・中継→${h.to.hubId || 'なし'}` : ''}{h.to.leg1CarrierId ? `・区間1→${h.to.leg1CarrierId}` : ''}{h.acks ? `・注意 ${h.acks.alerts.length}件を確認済` : ''}{h.to.carrierId ? `・配送先→${h.to.carrierId}` : ''}</td>
              <td>{fmtYm(h.fromCycle)}</td><td>{h.total}件</td><td>変更 {h.summary.changed}・スキップ {h.summary.skipped}・失敗 {h.summary.failed}</td><td>{h.status}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7} className="empty">まだありません</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
