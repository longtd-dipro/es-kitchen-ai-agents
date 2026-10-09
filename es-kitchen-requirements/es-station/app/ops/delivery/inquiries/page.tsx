'use client';

import Link from 'next/link';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { sameConds, UnappliedMark } from '../../_general/list';
import { Icon } from '../../_ui/Icon';
import { OpsCsvExport } from '../../_ui/csv';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { Badge, Field, Modal, PageHead } from '../../_ui/ui';
import type { QuoteForm } from '@/lib/ops/delivery/logic';
import type { Consignee } from '@/lib/ops/delivery/types';
import { api } from '../_components/api';

/*
 * 配送問い合わせ（本体 main_script2.js の renderDlInq。STEP4C・4E）。本体（運営Web）の見た目のまま。
 *  - 住所から委託先を探す（商談中も）＝統合 3-3
 *  - 中継先・送り状から拠点を引く＝統合 3-2 の逆引き
 * 委託配送先・中継倉庫は、委託配送先マスタ・倉庫マスタの写し（lib/ops/delivery/seed.ts）を使う。
 */

const REG: Record<string, string> = { '東京都': '関東', '神奈川県': '関東', '千葉県': '関東', '埼玉県': '関東', '群馬県': '関東', '愛知県': '中部', '静岡県': '中部', '岐阜県': '中部', '大阪府': '関西', '京都府': '関西', '兵庫県': '関西', '福岡県': '西日本', '広島県': '西日本' };
const ADD: Record<string, Record<string, string>> = { DE00001: { '神奈川県': '+300円', '千葉県': '+500円' }, DE00006: { '京都府': '+400円' }, DE00007: { '千葉県': '—' } };

export default function Page() {
  const [tab, setTab] = useState<'addr' | 'rev'>('addr');
  return (
    <>
      <PageHead crumbs={['配送管理', '委託配送先・中継先の検索']} title="委託配送先・中継先の検索" />
      <div className="card">
        <div className="tabs">
          {([['addr', '住所から委託先を探す（商談中も）'], ['rev', '中継先・送り状から拠点を引く']] as const).map(([k, l]) => <button key={k} className={k === tab ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        {tab === 'addr' ? <ByAddress /> : <Reverse />}
      </div>
    </>
  );
}

function ByAddress() {
  const { toast, openModal } = useOps();
  const canAct = useCanAct();
  const { data } = useQuery(api, 'consignees');
  /* 条件は手元（draft）に持ち、「検索」か Enter で効かせる（2026/10/03 決定） */
  const INIT = { pref: '千葉県', city: '船橋市', zip: '', temp: '冷蔵・常温' };
  const [draft, setDraft] = useState(INIT);
  const [{ pref, city, zip, temp }, setApplied] = useState(INIT);
  const setD = (k: keyof typeof INIT) => (v: string) => setDraft((x) => ({ ...x, [k]: v }));
  const reg = REG[pref] || '';
  const hits = (data ?? []).filter((r) => r.status === '本登録' && (r.area === '全国' || (reg && r.area.includes(reg))));
  const quote = (c: Consignee) => openModal(<QuoteModal c={c} pref={pref} city={city} zip={zip} temp={temp} onSent={(name) => toast(`${name} へ見積依頼を送りました（委託配送先ポータルの見積依頼に届きます${DEMO ? '・デモ' : ''}）`)} />);
  return (
    <>
      <div className="notice"><Icon name="bell" /><span>営業・運営が、<b>商談中（拠点の登録前）でも住所から委託先を探す</b>画面です（統合 3-3・要件シート 行53）。対応エリア（都道府県）に入る委託配送会社・対応曜日・料金・地域加算の目安を出し、見積依頼を出せます。<b>自動のおすすめ・全国マップ・曜日の組合せ検索は作りません</b>。地域加算は契約後に子契約のオプション（地域配送料）として運営が手で付けます。</span></div>
      <div className="fg" style={{ gridTemplateColumns: 'repeat(4,minmax(0,1fr))', marginBottom: '0.857143rem' }} onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') setApplied(draft); }}>
        <Field label="都道府県"><select className="sel" aria-label="都道府県" value={draft.pref} onChange={(e) => setD('pref')(e.target.value)}>{Object.keys(REG).map((p) => <option key={p}>{p}</option>)}</select></Field>
        <Field label="市区町村"><input className="inp" placeholder="例：船橋市" value={draft.city} onChange={(e) => setD('city')(e.target.value)} /></Field>
        <Field label="郵便番号"><input className="inp" placeholder="例：273-0005" value={draft.zip} onChange={(e) => setD('zip')(e.target.value)} /></Field>
        <Field label="温度帯"><select className="sel" aria-label="温度帯" value={draft.temp} onChange={(e) => setD('temp')(e.target.value)}>{['冷凍', '冷蔵・常温', '資材'].map((t) => <option key={t}>{t}</option>)}</select></Field>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.571429rem', marginBottom: '0.571429rem' }}>
        <UnappliedMark show={!sameConds(draft, { pref, city, zip, temp })} />
        <button className="btn out" onClick={() => { setDraft(INIT); setApplied(INIT); }}>クリア</button>
        <button className="btn pri" onClick={() => setApplied(draft)}>検索</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.571429rem' }}>
        <OpsCsvExport<(typeof hits)[number]> className="btn out" screen="配送問い合わせ（住所から探す）" rows={hits}
          filters={[{ label: '都道府県', value: pref }, { label: '市区町村', value: city }, { label: '郵便番号', value: zip }, { label: '温度帯', value: temp }]}
          columns={[{ label: '委託配送先ID', get: (r) => r.id }, { label: '委託配送先名', get: (r) => r.name }, { label: '区分', get: (r) => r.kind }, { label: '対応エリア', get: (r) => r.area },
            { label: '対応曜日', get: (r) => r.days }, { label: '料金（税抜）', get: (r) => r.fee }, { label: `地域加算の目安（${pref}）`, get: (r) => ADD[r.id]?.[pref] ?? '' }]}
          source={{ kind: 'dm.master.carriers', id: (r) => r.id }} />
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>委託配送先ID</th><th>委託配送先名</th><th>区分</th><th>対応エリア</th><th>対応曜日</th><th>料金（税抜）</th><th>地域加算の目安（{pref}）</th><th></th></tr></thead>
          <tbody>
            {hits.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td><td>{r.name}</td><td>{r.kind}</td><td>{r.area}</td><td>{r.days || '—'}</td><td>{r.fee || '—'}</td><td>{ADD[r.id]?.[pref] || '—'}</td>
                <td>{r.kind === '委託・引き取り' ? canAct(api, 'requestQuote') && <button className="btn sm out" onClick={() => quote(r)}>見積依頼</button> : <span className="muted" style={{ fontSize: '0.857143rem' }}>運賃表</span>}</td>
              </tr>
            ))}
            {!hits.length && <tr><td colSpan={8} className="empty">この地域に対応する委託配送先はありません</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.571429rem 0 0' }}>{DEMO ? '見本のデータです。' : ''}結果は委託配送先マスタの「対応エリア（都道府県）」「対応曜日」「料金表」から出します。見積依頼の回答は委託配送先ポータルで受けます。</p>
    </>
  );
}

function Reverse() {
  const { data: hubs } = useQuery(api, 'hubs');
  const { data: inq } = useQuery(api, 'inquiries');
  /* 中継先・キーワードは手元（huD・input）に持ち、「検索」か Enter で効かせる */
  const [huA, setHu] = useState('');
  const [huDraft, setHuD] = useState('');
  const [input, setInput] = useState('');
  const [q, setQ] = useState('');
  const applyQ = () => { setHu(huDraft || huA); setQ(input.trim()); };
  const huList = hubs ?? [];
  const hu = huA || huList[0]?.id || '';
  const huD = huDraft || hu;
  const cur = huList.find((w) => w.id === hu);
  const huOf = (id: string) => huList.find((w) => w.id === id) ?? { id, name: '（中継先マスタにない）', addr: '' };
  const list = (inq ?? []).filter((r) => (q ? (r.dl.includes(q) || r.inv.some((x) => x.replace(/-/g, '').includes(q.replace(/-/g, ''))) || r.name.includes(q) || r.site.includes(q)) : r.hu === hu));
  return (
    <>
      <div className="notice"><Icon name="bell" /><span>中継先（ヤマトの営業所など）・運送会社・委託配送先から「この荷物はどこの拠点のものか」と連絡があったときに、<b>中継先・送り状番号・配送No から利用している拠点と直近の配送を引きます</b>（統合 3-2・2026-10-01 B1。営業所の閉鎖を自動で知る手段はないため、届いた連絡をここで引く）。</span></div>
      <div className="fg c2" style={{ marginBottom: '0.857143rem' }}>
        <Field label="中継先"><select className="sel" id="dlq-hu" aria-label="中継先" value={huD} onChange={(e) => setHuD(e.target.value)}>{huList.map((w) => <option key={w.id} value={w.id}>{w.id} {w.name}</option>)}</select></Field>
        <Field label="送り状番号・配送No・拠点名で探す" hint="入れると中継先の絞り込みは使わず、すべての中継先から探します">
          <div style={{ display: 'flex', gap: '0.571429rem' }}>
            <input className="inp" id="dlq-q" value={input} placeholder="例：3512-0928-0021 ／ DL-261005-0007 ／ 夢の扉" onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') applyQ(); }} />
            <UnappliedMark show={huD !== hu || input.trim() !== q} />
            <button className="btn pri" onClick={applyQ}>検索</button>
            <button className="btn out" onClick={() => { setQ(''); setInput(''); setHu(''); setHuD(''); }}>クリア</button>
          </div>
        </Field>
      </div>
      {!q && (
        <div className="kvgrid" style={{ marginBottom: '0.571429rem' }}>
          <div className="kv"><small>中継先</small><b>{cur ? `${cur.id} ${cur.name}` : '—'}</b></div>
          <div className="kv"><small>住所</small><b>{cur ? cur.addr : '—'}</b></div>
          <div className="kv"><small>この中継先を使う拠点</small><b>{list.length}拠点</b></div>
          <div className="kv"><small>状態</small><b>{cur ? <Badge v={cur.status} /> : '—'}</b></div>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.571429rem' }}>
        <OpsCsvExport<(typeof list)[number]> className="btn out" screen="配送問い合わせ（中継先から探す）" rows={list}
          filters={q ? [{ label: '検索', value: q }] : [{ label: '中継先', value: hu }]}
          columns={[{ label: '拠点ID', get: (r) => r.site }, { label: '拠点名', get: (r) => r.name }, { label: '住所', get: (r) => r.addr }, { label: '配送方法', get: (r) => r.method },
            { label: '2次の配送会社', get: (r) => r.c2 }, { label: '直近の配送', get: (r) => r.dl }, { label: '送り状番号', get: (r) => r.inv }, { label: '納品日', get: (r) => r.date },
            { label: '状態', get: (r) => r.st }, { label: '拠点の連絡先', get: (r) => r.pic }, { label: '中継先', get: (r) => r.hu }, { label: '中継先名', get: (r) => huOf(r.hu).name }]}
          source={{ kind: 'dm.delivery.deliveries', id: (r) => r.dl }} />
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>拠点ID</th><th>拠点名・住所</th><th>配送方法</th><th>直近の配送・送り状番号</th><th>納品日</th><th>状態</th><th>拠点の連絡先</th>{q && <th>中継先</th>}</tr></thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.dl}>
                <td className="mono">{r.site}</td>
                <td>{r.name}<br /><span className="muted" style={{ fontSize: '0.857143rem' }}>{r.addr}</span></td>
                <td>{r.method}<br /><span className="muted" style={{ fontSize: '0.857143rem' }}>2次：{r.c2}</span></td>
                <td className="mono"><Link href={`/ops/delivery/list/${r.dl}`}>{r.dl}</Link><br /><span className="muted" style={{ fontSize: '0.857143rem' }}>{r.inv.length ? r.inv.join('・') : '送り状はまだありません'}</span></td>
                <td>{r.date}</td><td>{r.st}</td><td style={{ fontSize: '0.928571rem' }}>{r.pic}</td>
                {q && <td><span className="mono">{r.hu}</span><br /><span className="muted" style={{ fontSize: '0.857143rem' }}>{huOf(r.hu).name}</span></td>}
              </tr>
            ))}
            {!list.length && <tr><td colSpan={q ? 8 : 7} className="empty">{q ? '見つかりませんでした。番号の桁・ハイフンを確かめてください' : 'この中継先を使っている拠点はありません'}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="muted" style={{ fontSize: '0.857143rem', margin: '0.571429rem 0 0' }}>{DEMO ? '見本のデータです。' : ''}拠点の配送ルート（子契約）の「中継先」から引き、配送データの送り状番号でも探せます。中継先の閉鎖・移転のときは、ここで出た拠点の配送ルートを拠点ごとに直します。</p>
    </>
  );
}

const WDS = ['月', '火', '水', '木', '金', '土', '日'];
/**
 * 委託配送会社への見積依頼（台帳 B「委託配送会社への見積依頼の項目」2026/10/03）。
 * 法人名・住所・取り扱い商品・配送エリア・土日対応・プラン（自販機の有無）＋複数曜日・金額条件・冷蔵／冷凍・複数拠点まとめて。
 * 保有車両は委託配送会社のプロフィールのもの（ここでは見るだけ）
 */
function QuoteModal({ c, pref, city, zip, temp, onSent }: { c: Consignee; pref: string; city: string; zip: string; temp: string; onSent: (name: string) => void }) {
  const { closeModal, toastError } = useOps();
  const [f, setF] = useState<QuoteForm>({
    corpName: '', siteName: '', zip, pref, city, addr1: '', temps: [temp === '冷凍' ? '冷凍' : temp === '資材' ? '資材' : '冷蔵'],
    weekend: false, planName: '', vending: false, perMonth: 2, meals: 25, weekdays: [], priceCond: '', moreSites: '',
  });
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof QuoteForm>(k: K, v: QuoteForm[K]) => setF((x) => ({ ...x, [k]: v }));
  const tog = (k: 'temps' | 'weekdays', v: string) => set(k, f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v]);
  const send = async () => {
    setBusy(true);
    try { const r = await api.action('requestQuote', { id: c.id, ...f }); closeModal(); onSent(r.name); } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  return (
    <Modal title={`見積依頼：${c.name}（${c.id}）`} width={760}
      footer={<><button className="btn lg" onClick={closeModal}>キャンセル</button><button className="btn pri lg" disabled={busy} onClick={send}>見積依頼を送る</button></>}>
      <div className="fg c2">
        <Field label="法人名" req><input className="inp" value={f.corpName} onChange={(e) => set('corpName', e.target.value)} /></Field>
        <Field label="拠点名"><input className="inp" placeholder="空欄＝商談中（都道府県・市区町村）" value={f.siteName} onChange={(e) => set('siteName', e.target.value)} /></Field>
        <Field label="配送エリア（都道府県・市区町村）" req><div style={{ display: 'flex', gap: '0.571429rem' }}><input className="inp" value={f.pref} onChange={(e) => set('pref', e.target.value)} /><input className="inp" value={f.city} onChange={(e) => set('city', e.target.value)} /></div></Field>
        <Field label="住所（町名・番地）"><input className="inp" value={f.addr1} onChange={(e) => set('addr1', e.target.value)} /></Field>
        <Field label="取り扱い商品（冷蔵／冷凍）" req><div style={{ display: 'flex', gap: '1rem' }}>{['冷蔵', '冷凍', '資材'].map((t) => <label key={t}><input type="checkbox" checked={f.temps.includes(t)} onChange={() => tog('temps', t)} /> {t}</label>)}</div></Field>
        <Field label="土日対応"><label><input type="checkbox" checked={f.weekend} onChange={(e) => set('weekend', e.target.checked)} /> 土日の配送が要る</label></Field>
        <Field label="プラン" req><input className="inp" placeholder="例：100プラン ESライト" value={f.planName} onChange={(e) => set('planName', e.target.value)} /></Field>
        <Field label="自販機"><label><input type="checkbox" checked={f.vending} onChange={(e) => set('vending', e.target.checked)} /> 自販機あり</label></Field>
        <Field label="配送回数（月）・1回の食数" req><div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}><input className="inp" type="number" min={1} max={8} value={f.perMonth} onChange={(e) => set('perMonth', Number(e.target.value))} />回<input className="inp" type="number" min={1} value={f.meals} onChange={(e) => set('meals', Number(e.target.value))} />食</div></Field>
        <Field label="希望の曜日（複数）"><div style={{ display: 'flex', gap: '0.714286rem', flexWrap: 'wrap' }}>{WDS.map((w) => <label key={w}><input type="checkbox" checked={f.weekdays.includes(w)} onChange={() => tog('weekdays', w)} /> {w}</label>)}</div></Field>
        <Field label="金額条件"><input className="inp" placeholder="例：1件 3,000円以内" value={f.priceCond} onChange={(e) => set('priceCond', e.target.value)} /></Field>
        <Field label="保有車両（委託配送会社のプロフィール）"><div className="inp" style={{ background: 'var(--surface-subtle)' }}>{c.cars.join('・') || '—（プロフィールに未登録）'}</div></Field>
      </div>
      <Field label="複数拠点まとめて（1行に「拠点名／住所」）"><textarea className="inp" rows={3} placeholder={'例：横浜支店／神奈川県横浜市西区…'} value={f.moreSites} onChange={(e) => set('moreSites', e.target.value)} /></Field>
    </Modal>
  );
}
