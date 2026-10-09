'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import master from '@/lib/domain/areas/master';
import { domainApi, useDomainQuery } from '@/lib/domain/client';
import type { Carrier, Warehouse } from '@/lib/domain/types';
import { api, useSamples } from '@/lib/ops/purchasing/client';
import {
  SMP_PREFS, smDestKey, smHistRows, smHandles, smMon, smNorm, smOver, smPlan, smSlW, smStats, smToday, smValidate, smWeekLabel, smWhOpts, smYmL, smYmOf, type SmTarget,
} from '@/lib/ops/purchasing/samples';
import type { Sample, SampleForm, WeekClose } from '@/lib/ops/purchasing/types';
import { Icon } from '../../../_ui/Icon';
import { LEAVE_MSG, useLeaveGuard } from '../../../_ui/leaveGuard';
import { useOps } from '../../../_ui/OpsProvider';
import { ConfirmModal, Field, PageHead } from '../../../_ui/ui';
import { Sec, Sel } from '../../_components/common';
import { Basis, HistTable, newForm, SMF } from '../../_components/samples';
import { DateInput } from '@/components/DateInput';
import { fmtDate } from '@/lib/format/date';

const masterApi = domainApi(master);

/* サンプル登録（専用の簡易画面・宛先だけ入力）。元のデモの renderSmpNew */

const Warn = ({ children, id }: { children: React.ReactNode; id?: string }) => <div className="sm-warn" id={id}><Icon name="warn" /><span>{children}</span></div>;
const Ng = ({ children }: { children: React.ReactNode }) => <div className="sm-ng"><Icon name="warn" /><span>{children}</span></div>;

function Quota({ f, rows, quota }: { f: SampleForm; rows: Sample[]; quota: Record<string, number> }) {
  const ym = smYmOf(f.deliv, SMF.ym);
  const s = smStats(rows, ym, quota);
  return (
    <>
      <div className="sum">
        <div><small>対象月（納品日から自動）</small><b>{smYmL(ym)}</b></div>
        <div><small>月の合計枠</small><b>{s.q == null ? '未設定' : s.q + '件'}</b></div>
        <div><small>受付済</small><b>{s.used}件</b></div>
        <div className="hl"><small>残り枠</small><b>{s.rest == null ? '—' : s.rest + '件'}</b></div>
      </div>
      {s.q == null ? <Warn>{smYmL(ym)}の営業サンプル枠が未設定です。メニュー管理 ＞ 月間メニューで月の件数を決めてください（登録はできます）。</Warn>
        : s.used + 1 > s.q ? <Ng><b>月の枠を超えるため、登録できません。</b>{smYmL(ym)}の営業サンプル枠は {s.q}件で、受付済が {s.used}件です。<b>残り枠 {Math.max(0, s.rest!)}件</b>のため、この登録で {s.used + 1}件になる分は受け付けられません。枠を増やすときは、メニュー管理 ＞ 月間メニュー（メニュー作成）で営業サンプル件数を変更してください。</Ng> : null}
    </>
  );
}

function Hist({ f, rows }: { f: SampleForm; rows: Sample[] }) {
  const addr = f.pref + f.city + f.town + (f.bld || '');
  if (!f.company.trim() || !addr.trim()) return <div className="sm-hist-empty">法人名と住所を入れると、同じ宛先（法人名＋住所が同じ）への過去の送付をここに表示します。</div>;
  const key = smNorm(f.company) + '|' + smNorm(addr);
  const rs = smHistRows(rows, key);
  const bases = new Set(rs.map((r) => r.base));
  const other = new Set(rows.filter((r) => smNorm(r.company) === smNorm(f.company) && smDestKey(r) !== key).map(smDestKey)).size;
  return (
    <>
      {rs.length ? <><Warn><b>この宛先には、過去に {bases.size}回（{rs.length}出荷）送付しています。</b>重ねて送るか確認してください（警告だけです。このまま登録できます）。</Warn><HistTable rows={rs} /></>
        : <div className="sm-hist-empty">この宛先（法人名＋住所）への過去の送付はありません。</div>}
      {other > 0 && <p className="muted" style={{ margin: '0.571429rem 0 0' }}>同じ法人名で住所が違う宛先が {other}件あります（住所が違うので別の宛先として数えます）。</p>}
    </>
  );
}

function Ships({ f, closed, targets }: { f: SampleForm; closed: WeekClose[]; targets: SmTarget[] }) {
  const plan = smPlan(f, targets);
  const x = plan.ship;
  if (!plan.items.length) return <Ng>送る商品を1つ以上選んでください（ピッキング倉庫が扱う商品だけ選べます）。</Ng>;
  if (!f.deliv || !x) return <p className="muted">納品日とリードタイム（日）を入れると、発送日を自動で計算します（発送日 ＝ 納品日 − リードタイム。ピッキングできない日は直前のピッキング可能日へ前倒し）。</p>;
  return (
    <div className={`sm-ship${x.moved ? ' moved' : ''}`}>
      <h4>{f.wh}{x.moved && <span className="badge b-warn">前倒し</span>}</h4>
      <div>{plan.items.map((it) => `${targets.find((p) => p.id === it.pid)!.name}×${it.qty}`).join('、')}</div>
      <div className="kvgrid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))', padding: '0.285714rem 0 0' }}>
        <div className="kv"><small>納品日（入力）</small><b>{smSlW(f.deliv)}{x.moved && <> → <span className="txt-warn">{smSlW(x.deliv)}（振替）</span></>}</b></div>
        <div className="kv"><small>リードタイム（入力）</small><b>{x.lead}日</b></div>
        <div className="kv"><small>発送日（自動）</small><b className={x.moved ? 'txt-warn' : ''}>{smSlW(x.ship)}</b></div>
      </div>
      {x.moved && <div className="txt-warn" style={{ fontSize: '0.928571rem' }}>{x.note}</div>}
      {x.ship < smToday() && <div className="sm-ng" style={{ margin: '0.285714rem 0 0' }}><Icon name="warn" /><span>発送日が今日（{fmtDate(smToday())}）より前になります。納品日を後ろにするか、リードタイムを短くしてください。</span></div>}
      {closed.some((w) => w.id === smMon(x.ship)) && <div className="sm-warn" style={{ margin: '0.285714rem 0 0' }}><Icon name="warn" /><span>出荷週 {smWeekLabel(smMon(x.ship))} は受付締め済みです。登録すると「締め後追加」となり、出荷指示は作られません。</span></div>}
    </div>
  );
}

export default function SampleNewPage() {
  const router = useRouter();
  const { toast, toastError, openModal } = useOps();
  const { data } = useSamples();
  /* 配送会社＝委託配送先マスタ、中継先＝倉庫マスタの中継先（有効のもの。2026-10-08 台帳 F） */
  const { data: cars } = useDomainQuery(masterApi, 'list', { kind: 'carriers' });
  const { data: whm } = useDomainQuery(masterApi, 'list', { kind: 'warehouses' });
  const [f, setF] = useState<SampleForm>(() => SMF.form ?? newForm());
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [bulk, setBulk] = useState('2');
  const [bulkErr, setBulkErr] = useState('');
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：サイドメニュー・ブラウザを閉じる／再読み込み。キャンセルは下の cancel */
  useLeaveGuard(dirty);
  if (!data) return <div className="card"><div className="empty">読み込み中…</div></div>;
  const { rows, closed, quota, targets } = data;
  /* 対象の商品（月間メニューの「営業サンプル」）は、はじめは「送る・2個」 */
  const missing = targets.filter((p) => !f.items[p.id]);
  if (missing.length) setF({ ...f, items: { ...f.items, ...Object.fromEntries(missing.map((p) => [p.id, { on: true, qty: 2 }])) } });
  const upd = (patch: Partial<SampleForm>) => { const nx = { ...f, ...patch }; SMF.form = nx; setF(nx); setDirty(true); const e = { ...errs }; Object.keys(patch).forEach((k) => delete e[k]); setErrs(e); };
  const over = smOver(rows, f.deliv, SMF.ym, quota);
  const e = errs;
  const carrierOpts = ((cars ?? []) as Carrier[]).filter((c) => c.status === '有効' && c.kind !== '自社').map((c) => c.name);
  const hubOpts = ((whm ?? []) as Warehouse[]).filter((w) => w.type === 'relay' && w.status === '有効').map((w) => w.name);
  /* 同じ宛先への前回のリードタイム（参考。自動の提案はしない） */
  const prevLead = (() => { const k = smNorm(f.company) + '|' + smNorm(f.pref + f.city + f.town + (f.bld || '')); const p = f.company.trim() ? smHistRows(rows, k)[0] : null; return p ? p.lead : null; })();
  const si = (name: 'company' | 'pic' | 'tel' | 'zip' | 'city' | 'town' | 'bld' | 'memo', ph: string, type = 'text') => (
    <input className={`inp${e[name] ? ' err' : ''}`} id={'sm-' + name} type={type} value={f[name]} placeholder={ph} onChange={(ev) => upd({ [name]: ev.target.value })} />
  );
  const cancel = () => {
    const leave = () => { SMF.form = null; router.push('/ops/purchasing/samples'); };
    if (!dirty) { leave(); return; }
    openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={leave} />);
  };
  const submit = async () => {
    const er = smValidate(f, targets);
    if (Object.keys(er).length) { setErrs(er); toast('入力内容を確認してください'); return; }
    const ym = smYmOf(f.deliv, SMF.ym);
    const s = smStats(rows, ym, quota);
    if (s.q != null && s.used + 1 > s.q) { toast(`${smYmL(ym)}の営業サンプル枠（${s.q}件）を超えるため登録できません（残り枠 0件）。枠を増やすときは メニュー管理 ＞ 月間メニューで件数を変更してください`); return; }
    setBusy(true);
    try {
      const rs = (await api.action('addSample', { form: f, ym: SMF.ym })) as Sample[];
      SMF.form = null;
      SMF.ym = ym;
      const late = rs.filter((r) => r.status === '締め後追加').length;
      router.push('/ops/purchasing/samples');
      toast(`サンプル ${rs.map((r) => r.no).join('・')} を登録しました${late ? `。${late}件は締め後追加のため出荷指示は作りません` : ''}`);
    } catch (err) { toastError(err); } finally { setBusy(false); }
  };
  const setItem = (pid: string, patch: Partial<{ on: boolean; qty: number }>) => upd({ items: { ...f.items, [pid]: { ...f.items[pid], ...patch } } });
  const applyBulk = () => {
    const n = /^\d$/.test(bulk.trim()) ? +bulk : 0;
    if (n < 1) { setBulkErr('1〜9 の数字を入れてください'); return; }
    setBulkErr('');
    upd({ items: Object.fromEntries(Object.entries(f.items).map(([pid, it]) => { const p = targets.find((t) => t.id === pid); const ok = !f.wh || (p ? smHandles(p, f.wh) : false); return [pid, it.on && ok ? { ...it, qty: n } : it]; })) });
  };
  return (
    <>
      <PageHead crumbs={['発注・入荷', '営業サンプル', 'サンプル登録']} title="サンプル登録">
        <button className="btn lg ghost" onClick={cancel}>キャンセル</button>
        <button className="btn pri lg" disabled={over || busy} title={over ? '月の枠を超えるため登録できません（残り枠 0件）' : undefined} onClick={submit}>登録</button>
      </PageHead>
      {DEMO && <Basis>台帳 F 2026-10-08（配送ルートは登録のたびに入力・リードタイムは手入力・倉庫分けの枝番なし）／決定_STEP1回答 2026-10-01（登録は専用の簡易画面・宛先だけ入力・法人／拠点／契約は作らない）／サンプル_仕様まとめ 決定 #10（納品日から発送日を逆算）・2026-10-01 T4-5＝B（前倒しのときは納品日も振り替える）／宛先の履歴は 2026-10-01 承認（法人名＋住所で同一判定）</Basis>}
      {Object.keys(e).length > 0 && <Ng>入力内容を確認してください（赤字の項目）。</Ng>}
      <div className="card"><Quota f={f} rows={rows} quota={quota} /></div>
      <div className="card">
        <Sec title="宛先（見込みのお客様）">
          <div className="fg">
            <Field label="法人名" req htmlFor="sm-company" err={e.company} className="full">{si('company', '株式会社〇〇')}</Field>
            <Field label="担当者名" req htmlFor="sm-pic" err={e.pic}>{si('pic', '担当者名')}</Field>
            <Field label="電話番号" req htmlFor="sm-tel" err={e.tel}>{si('tel', '000-0000-0000', 'tel')}</Field>
            <div className="fld"></div>
            <Field label="郵便番号" req htmlFor="sm-zip" err={e.zip}>{si('zip', '000-0000')}</Field>
            <Field label="都道府県" req htmlFor="sm-pref" err={e.pref}><Sel id="sm-pref" value={f.pref} ph="都道府県" opts={SMP_PREFS} err={!!e.pref} onChange={(v) => upd({ pref: v })} /></Field>
            <Field label="市区町村" req htmlFor="sm-city" err={e.city}>{si('city', '市区町村')}</Field>
            <Field label="町域・番地" req htmlFor="sm-town" err={e.town}>{si('town', '町域・番地')}</Field>
            <Field label="建物・部屋番号" htmlFor="sm-bld">{si('bld', '建物・部屋番号')}</Field>
          </div>
          <div style={{ marginTop: '1rem' }}><Hist f={f} rows={rows} /></div>
        </Sec>
        <Sec title="配送ルート">
          <p className="muted" style={{ margin: '0 0 0.714286rem' }}>登録のたびに、このお客様（宛先）への配送ルートを入れます。1回の登録で1つのルートです（倉庫が分かれる出荷はありません）。</p>
          <div className="fg c2">
            <Field label="ピッキング倉庫" req htmlFor="sm-wh" err={e.wh}><Sel id="sm-wh" value={f.wh} ph="ピッキング倉庫を選んでください" opts={smWhOpts()} err={!!e.wh} ariaLabel="ピッキング倉庫" onChange={(v) => upd({ wh: v })} /></Field>
            <Field label="配送会社" req htmlFor="sm-routeCarrier" err={e.routeCarrier} hint="委託配送先マスタから選びます"><Sel id="sm-routeCarrier" value={f.routeCarrier} ph="配送会社を選んでください" opts={carrierOpts} err={!!e.routeCarrier} ariaLabel="配送会社" onChange={(v) => upd({ routeCarrier: v })} /></Field>
            <Field label="中継先（任意）" htmlFor="sm-routeHub" err={e.routeHub} hint="倉庫マスタの中継先から選びます。中継しないときは空のまま"><Sel id="sm-routeHub" value={f.routeHub} ph="（中継しない）" opts={hubOpts} err={!!e.routeHub} ariaLabel="中継先" onChange={(v) => upd({ routeHub: v })} /></Field>
          </div>
        </Sec>
        <Sec title="サンプルの商品">
          <p className="muted" style={{ margin: '0 0 0.714286rem' }}>営業サンプルの対象は、月間メニューで「営業サンプル」にチェックした商品（{targets.length}品）。1件＝宛先1か所。数量の初期値は各2個（1〜9個）です。ピッキング倉庫が扱わない商品は選べません。{e.items && <span className="emsg" style={{ color: 'var(--ng)' }}> {e.items}</span>}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.571429rem', margin: '0 0 0.714286rem' }}>
            <label htmlFor="sm-bulkqty">選んだ商品の数量を一括で変更</label>
            <input className="inp" id="sm-bulkqty" type="number" min={1} max={9} value={bulk} style={{ width: '5.714286rem' }} onChange={(ev) => setBulk(ev.target.value)} aria-label="一括で変更する数量（1〜9）" />
            <button type="button" className="btn sm out" onClick={applyBulk}>適用</button>
            {bulkErr && <span className="emsg" style={{ color: 'var(--ng)' }}>{bulkErr}</span>}
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th></th><th>品番</th><th>商品名</th><th>保管方法</th><th>数量</th><th>取扱倉庫（商品マスタ）</th></tr></thead>
              <tbody>
                {targets.map((p) => {
                  const it = f.items[p.id] ?? { on: true, qty: 2 };
                  const ok = !f.wh || smHandles(p, f.wh);
                  return (
                    <tr key={p.id}>
                      <td style={{ width: '3.142857rem' }}><input type="checkbox" checked={it.on && ok} disabled={!ok} onChange={(ev) => setItem(p.id, { on: ev.target.checked })} aria-label={`${p.name}を送る`} /></td>
                      <td className="mono">{p.id}</td><td>{p.name}</td><td>{p.keep}</td>
                      <td style={{ width: '7.142857rem' }}><input className="inp" type="number" min={1} max={9} value={it.qty} disabled={!ok} onChange={(ev) => setItem(p.id, { qty: Math.max(1, Math.min(9, parseInt(ev.target.value, 10) || 1)) })} aria-label={`${p.name}の数量`} /></td>
                      <td>{p.wh.join('・')}{!ok && <div className="muted" style={{ lineHeight: '1.285714rem' }}>{f.wh}では扱っていないため選べません</div>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {e.wh && <div className="emsg" style={{ marginTop: '0.428571rem', color: 'var(--ng)' }}>{e.wh}</div>}
        </Sec>
        <Sec title="納品日と発送日">
          <div className="fg c2">
            <Field label="納品日" req htmlFor="sm-deliv" err={e.deliv} hint="発送日は納品日からリードタイムを引いて自動で決まります">
              <DateInput className={`inp${e.deliv ? ' err' : ''}`} id="sm-deliv" min={smToday()} max="2026-12-27" value={f.deliv} onChange={(ev) => upd({ deliv: ev.target.value })} />
            </Field>
            <Field label="リードタイム（日）" req htmlFor="sm-lead" err={e.lead} hint={prevLead != null ? `0〜30の整数。同じ宛先への前回は ${prevLead}日（参考）` : '0〜30の整数。宛先によって違うため、毎回入れてください'}>
              <input className={`inp${e.lead ? ' err' : ''}`} id="sm-lead" type="number" inputMode="numeric" min={0} max={30} step={1} value={f.lead} placeholder="例：2" onChange={(ev) => upd({ lead: ev.target.value })} />
            </Field>
            <Field label="メモ（任意）" htmlFor="sm-memo" err={e.memo} className="full">{si('memo', '商談名・営業担当など（500文字まで）')}</Field>
          </div>
          <div style={{ marginTop: '1rem' }}><Ships f={f} closed={closed} targets={targets} /></div>
        </Sec>
      </div>
    </>
  );
}
