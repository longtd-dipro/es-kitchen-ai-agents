'use client';

import { PRODUCTS, WASTE_REASONS } from '@/lib/driver/seed';
import type { InvRow, WasteRow } from '@/lib/driver/types';
import { useQuery } from '@/lib/ops/core/client';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { Icon } from '../_ui/Icon';
import { useCommit, useDraft, useDriverSignedIn } from '../_ui/DriverProvider';
import { Loading, Stepper, TopBar, useBeforeUnload, useRun } from '../_ui/parts';
import { driverApi } from '../_ui/useDay';

type K = { site: string; tab: 'waste' | 'inv'; q: string; waste: WasteRow[] };
const WASTE0 = () => PRODUCTS.map((n) => ({ n, qty: 0, reason: '賞味期限切れ' }));

/**
 * 廃棄・棚卸し（元の V.stock・追加の画面）：ES配送便の納品先ごとの廃棄登録と棚卸し。
 * 運営Web の請求の在庫（billing.*）は法人の拠点・商品の形でドライバーの納品先・商品と合わないため、driver.stockReports に持つ
 */
export default function DriverStock() {
  const { staff, offline, toast } = useDriverSignedIn();
  const api = driverApi();
  const { data } = useQuery(api, 'stock', { staff });
  const commit = useCommit();
  const [busy, run] = useRun();
  const [K, setK] = useDraft<K>('stock', () => ({ site: '', tab: 'waste', q: '', waste: WASTE0() }));
  const site = K.site && data?.sites.some((s) => s.no === K.site) ? K.site : data?.sites[0]?.no ?? '';
  const [invDraft, setInv] = useDraft<InvRow[] | null>('stockInv.' + site, null);
  const inv = invDraft ?? data?.inv[site] ?? [];
  const dirty = K.waste.some((r) => r.qty > 0) || (!!invDraft && invDraft.some((r, i) => r.ac !== data?.inv[site]?.[i]?.ac));
  useOpsLeaveGuard(dirty);
  useBeforeUnload(dirty);
  if (!data) return <><TopBar title="廃棄・棚卸し" trouble={false} /><Loading /></>;
  const q = K.q.trim();
  const setWaste = (i: number, x: Partial<WasteRow>) => setK({ ...K, waste: K.waste.map((r, k) => (k === i ? { ...r, ...x } : r)) });
  let body;
  if (K.tab === 'waste') {
    const rows = K.waste.map((r, i) => ({ r, i })).filter(({ r }) => !q || r.n.includes(q));
    const n = K.waste.reduce((a, r) => a + r.qty, 0);
    const kscan = () => { const i = Math.floor(Math.random() * K.waste.length); setWaste(i, { qty: K.waste[i].qty + 1 }); toast(`「${K.waste[i].n}」を読み取り、廃棄数を1追加しました`); };
    body = (
      <>
        <div style={{ display: 'flex', gap: '0.857143rem' }}>
          <div className="search" style={{ flex: 1 }}><input placeholder="名前またはコードで商品を検索" aria-label="商品を検索" value={K.q} onChange={(e) => setK({ ...K, q: e.target.value })} /><Icon name="search" /></div>
          <button type="button" className="scanbtn" aria-label="バーコードスキャン" onClick={kscan}><Icon name="scan" /></button>
        </div>
        <div style={{ overflowX: 'auto', margin: '0 -1.142857rem' }}>
          <table className="tbl"><tbody>
            <tr><th>商品名</th><th>廃棄数</th><th>理由</th></tr>
            {rows.map(({ r, i }) => (
              <tr key={r.n}>
                <td className="pname">{r.n}</td>
                <td><Stepper val={r.qty} onStep={(dv) => setWaste(i, { qty: Math.max(0, r.qty + dv) })} /></td>
                <td><select className="mini-sel" aria-label="廃棄理由" value={r.reason} onChange={(e) => setWaste(i, { reason: e.target.value })}>{WASTE_REASONS.map((o) => <option key={o}>{o}</option>)}</select></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </>
    );
    return (
      <Frame K={K} setK={setK} sites={data.sites} site={site} foot={
        <div className="foot">
          <button type="button" className="btn pri" disabled={!n || busy || !site} onClick={() => run(async () => {
            const r = await api.action('saveWaste', { staff, site, rows: K.waste, offline });
            setK({ ...K, site, waste: WASTE0() });
            commit(r);
          })}>廃棄を登録（{n}点）</button>
        </div>}>
        {body}
      </Frame>
    );
  }
  const diff = inv.filter((r) => r.ac !== r.th).length;
  const iscan = () => { const i = Math.floor(Math.random() * inv.length); setInv(inv.map((r, k) => (k === i ? { ...r, ac: r.ac + 1 } : r))); toast(`「${inv[i].n}」を1点数えました`); };
  return (
    <Frame K={K} setK={setK} sites={data.sites} site={site} foot={
      <div className="foot">
        <button type="button" className="btn pri" disabled={busy || !site} onClick={() => run(async () => {
          const r = await api.action('sendInventory', { staff, site, rows: inv, offline });
          setInv(null);
          commit(r);
        })}>棚卸しを送信{diff ? `（差異 ${diff}件）` : ''}</button>
      </div>}>
      <p className="hint" style={{ margin: 0 }}>実際の在庫数を入力するか、バーコードをスキャンしてください。理論在庫と差がある商品は送信時に運営管理者へ通知されます。</p>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button type="button" className="chip" onClick={iscan}><Icon name="scan" s />スキャンで数える</button></div>
      <div style={{ overflowX: 'auto', margin: '0 -1.142857rem' }}>
        <table className="tbl"><tbody>
          <tr><th>商品名</th><th style={{ textAlign: 'center' }}>理論在庫</th><th>実在庫</th><th style={{ textAlign: 'center' }}>差異</th></tr>
          {inv.map((r, i) => (
            <tr key={r.n}>
              <td className="pname">{r.n}</td><td className="num">{r.th}</td>
              <td><Stepper val={r.ac} onStep={(dv) => setInv(inv.map((x, k) => (k === i ? { ...x, ac: Math.max(0, x.ac + dv) } : x)))} /></td>
              <td className={`num ${r.ac !== r.th ? 'diff' : ''}`}>{r.ac - r.th}</td>
            </tr>
          ))}
        </tbody></table>
      </div>
    </Frame>
  );
}

/** 納品先の選択・廃棄登録と棚卸しの切替・下のボタン */
function Frame({ K, setK, sites, site, children, foot }: { K: K; setK: (k: K) => void; sites: { no: string; name: string }[]; site: string; children: React.ReactNode; foot: React.ReactNode }) {
  return (
    <>
      <TopBar title="廃棄・棚卸し" trouble={false} />
      <div className="scroll pad stack">
        <div className="h3" style={{ margin: 0 }}>納品先（ES配送便）</div>
        <div className="money" style={{ padding: 0 }}>
          <select className="full-sel" aria-label="納品先" value={site} onChange={(e) => setK({ ...K, site: e.target.value })}>
            {sites.map((s) => <option key={s.no} value={s.no}>{s.name}</option>)}
          </select>
        </div>
        {!sites.length && <div className="empty">今日の担当に ES配送便の納品先はありません。</div>}
        <div className="segs">{([['waste', '廃棄登録'], ['inv', '棚卸し']] as const).map(([k, l]) => <button type="button" key={k} className={K.tab === k ? 'on' : ''} onClick={() => setK({ ...K, tab: k, q: '' })}>{l}</button>)}</div>
        {children}
      </div>
      {foot}
    </>
  );
}
