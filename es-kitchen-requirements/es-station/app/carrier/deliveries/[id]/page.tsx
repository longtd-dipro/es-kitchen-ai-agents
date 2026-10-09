'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import carrier from '@/lib/carrier/area';
import { dAssignable, dLockReason, fmtD, fmtDT, foodActual, foodSum, partItems, TEMP_GOODS } from '@/lib/carrier/logic';
import { WH } from '@/lib/carrier/seed';
import type { AltInfo, CarrierTrouble, DeliveryView, Food, PartInfo, Staff } from '@/lib/carrier/types';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { OpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { AltPatterns, altTask } from '../../_ui/alt';
import { Icon } from '../../_ui/Icon';
import { useCarrierSignedIn } from '../../_ui/CarrierProvider';
import { Collap, Crumb, DstBadge, Fld, Loading, Modal, NotFound, stfName, Tags } from '../../_ui/parts';
import { fmtDate, fmtMd } from '@/lib/format/date';
import TrackingNo from '@/components/TrackingNo';
import { carrierCls } from '@/lib/format/status';

type Tab = 'overview' | 'address' | 'result' | 'trouble' | 'files';
const FILES = ['IMG_0291.jpg', 'sample.pdf', 'IMG_0305.jpg', 'IMG_0291.jpg', 'sample.pdf', 'IMG_0305.jpg'];

export default function Page() {
  return <Suspense><DeliveryDetail /></Suspense>;
}

/** 配送詳細（元の delivery()・OW_SCHED_002）：配送スタッフ選択・配送概要・配送住所・実績・トラブル・添付資料 */
function DeliveryDetail() {
  const { id: rawId } = useParams<{ id: string }>();
  const id = decodeURIComponent(rawId); /* 配送No に「:」（区間 :1・:2）を含むと、URL では %3A になって見つからなくなるため */
  const sp = useSearchParams();
  const router = useRouter();
  const { company, toast, toastError } = useCarrierSignedIn();
  const api = areaApi(carrier);
  const { data } = useQuery(api, 'delivery', { company, no: id });
  const tab = (sp.get('tab') as Tab) || 'overview';
  const setTab = (t: Tab) => router.replace(`/carrier/deliveries/${id}${t === 'overview' ? '' : `?tab=${t}`}`, { scroll: false });
  const [viewer, setViewer] = useState<{ i: number; z: number; menu?: boolean } | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);

  const crumb = <Crumb items={[['ホーム', '/carrier'], ['配送管理', '/carrier/deliveries'], '配送詳細']} />;
  if (data === undefined) return <>{crumb}<Loading /></>;
  if (!data) return <>{crumb}<NotFound text={`配送 ${id} は見つかりません。`} back="配送管理に戻る" href="/carrier/deliveries" /></>;
  const d = data.d, trbs = data.troubles;
  const tabs: [Tab, string][] = [['overview', '配送概要'], ['address', '配送住所'], ['result', '実績'], ['trouble', trbs.length ? `トラブル（${trbs.length}）` : 'トラブル'], ['files', '添付資料']];
  const attach = (extra?: boolean) => (
    <div className="attach">
      <div className="att"><button type="button" className="img" aria-label="IMG_0291.jpgを表示" onClick={() => setViewer({ i: 0, z: 1 })} />IMG_0291.jpg</div>
      <div className="att"><button type="button" className="pdf" aria-label="sample.pdfを表示" onClick={() => setViewer({ i: 1, z: 1 })}>PDF</button>sample.pdf</div>
      <div className="att"><button type="button" className="dark" aria-label="IMG_0305.jpgを表示" onClick={() => setViewer({ i: 2, z: 1 })} />IMG_0305.jpg</div>
      {extra && <div className="att"><label className="add"><Icon name="upload" /><input type="file" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) toast(f.name + ' を追加しました'); }} /></label>ファイルを追加</div>}
    </div>
  );

  let body = null;
  if (tab === 'overview') body = <Overview d={d} part={data.part} foods={data.foods} alt={data.alt} onTab={setTab} />;
  if (tab === 'address') {
    const pref = (d.addr.match(/^(東京都|北海道|(?:大阪|京都)府|.{2,3}県)/) || [''])[0];
    const kanto = d.from === 'WH00001';
    body = (
      <>
        <Collap title="引取先">
          <div className="grid3">
            <Fld label="引取先" value={WH[d.from]} /><Fld label="郵便番号" value={kanto ? '341-0000' : '210-0000'} /><Fld label="住所" value={kanto ? '埼玉県三郷市[番地]' : '神奈川県川崎市川崎区[番地]'} />
            <Fld label="受付時間" value="06:00〜09:00" /><Fld label="電話番号" value={kanto ? '048-000-0001' : '044-000-0301'} />
            <Fld label="受け渡し手順"><div className="inp ro"><a href="#" onClick={(e) => e.preventDefault()}>中継拠点の受け渡し手順.pdf</a></div></Fld>
          </div>
        </Collap>
        <Collap title="届け先住所">
          <div className="grid3">
            <Fld label="郵便番号" value="〒[郵便番号]" /><Fld label="都道府県" value={pref} /><Fld label="市区町村" value={d.addr.replace(/^(東京都|北海道|(?:大阪|京都)府|.{2,3}県)/, '')} />
            <Fld label="町域・番地" value="[番地]" /><Fld label="建物・部屋番号" value="入力内容" /><Fld label="部署名" value="入力内容" />
            <Fld label="電話番号" value="070-1234-5678" /><Fld label="メイン担当者名" value="田中 一郎" /><Fld label="メイン担当者電話番号" value="070-1234-5678" />
          </div>
        </Collap>
        <div className="fld"><span className="lb">搬入経路・添付資料</span>{attach()}</div>
        <div className="fld"><span className="lb">非公開の搬入経路・添付資料</span>{attach(true)}</div>
      </>
    );
  }
  if (tab === 'result') body = <Result d={d} foods={data.foods} />;
  if (tab === 'trouble') body = <TroubleTab d={d} trbs={trbs} staff={data.staff} part={data.part} foods={data.foods} />;
  if (tab === 'files') body = (
    <>
      <Collap title="駐車報告">
        <div className="grid3">
          <Fld label="駐車料金（税込）" value={d.park.toLocaleString('ja-JP') + '円'} />
          <div className="fld"><span className="lb">レシート</span><div className="attach"><div className="att"><button type="button" className="receipt" aria-label="レシート画像を表示" onClick={() => setViewer({ i: 2, z: 1 })}>RECEIPT</button>{d.parkFile ?? '—（駐車報告なし）'}</div></div></div>
        </div>
      </Collap>
      <Collap title="集金報告">
        <div className="grid3"><Fld label="集金予定額" value={d.cash.toLocaleString('ja-JP') + '円'} /><Fld label="集金額（税込）" value={d.cash.toLocaleString('ja-JP') + '円'} /></div>
      </Collap>
    </>
  );

  /* 添付の表示（元の viewer） */
  let viewerEl = null;
  if (viewer) {
    const f = FILES[viewer.i];
    const close = () => setViewer(null);
    const step = (n: number) => setViewer({ i: (viewer.i + n + 6) % 6, z: 1 });
    const stage = f.endsWith('pdf') ? <div className="pdfpage"><b style={{ fontSize: '3rem' }}>PDF</b>sample.pdf（プレビュー）</div>
      : f === 'IMG_0305.jpg' ? <div className="pdfpage" style={{ background: 'linear-gradient(160deg,#3b3f4a,#15171c)', color: '#c9d1d9' }}>IMG_0305.jpg</div>
        // eslint-disable-next-line @next/next/no-img-element
        : <img className="route" src="/carrier/route.jpg" alt="搬入ルート案内図" style={{ transform: `scale(${viewer.z})` }} />;
    viewerEl = (
      <Modal onClose={close} cls="viewer" label={f}>
        <ViewerKeys onStep={step} />
        <header>
          {f}
          <span style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center' }}>
            <button type="button" className="x" aria-label="ダウンロード" onClick={() => toast(DEMO ? 'プロトタイプのためダウンロードは行いません' : 'ダウンロードはまだつないでいません')}><Icon name="dl" /></button>
            <button type="button" className="x" aria-label="縮小" onClick={() => setViewer({ ...viewer, z: Math.max(0.5, viewer.z - 0.25) })}><Icon name="zout" /></button>
            <button type="button" className="x" aria-label="拡大" onClick={() => setViewer({ ...viewer, z: Math.min(3, viewer.z + 0.25) })}><Icon name="zin" /></button>
            <button type="button" className="x" aria-label="その他" onClick={() => setViewer({ ...viewer, menu: !viewer.menu })}><Icon name="more" /></button>
            <button type="button" className="x" aria-label="閉じる" onClick={close}><Icon name="x" /></button>
          </span>
        </header>
        {viewer.menu && <div className="menu-pop"><button type="button" onClick={() => { setViewer(null); setConfirmDel(true); }}><Icon name="trash" />削除</button></div>}
        <div className="stage">{stage}</div>
        <footer style={{ border: 0, fontSize: '0.857143rem', color: 'var(--text-2)' }} className="num">{viewer.i + 1} / 6</footer>
        <button type="button" className="nav prev" aria-label="前の画像" onClick={() => step(-1)}><Icon name="left" /></button>
        <button type="button" className="nav next" aria-label="次の画像" onClick={() => step(1)}><Icon name="right" /></button>
      </Modal>
    );
  }

  return (
    <>
      {crumb}
      <h1 className="ptitle">配送詳細 <span className="id">{d.no}</span></h1>
      <div className="panel">
        <DriverCard
          key={d.no + (d.staff ?? '')} d={d} all={data.all} staff={data.staff}
          onOk={async (sid) => {
            if (!sid) { toast('配送スタッフを選択してください'); return false; }
            const chg = !!d.staff && d.staff !== sid && d.st === '出荷待';
            try {
              await api.action('assignStaff', { company, nos: [d.no], staff: sid });
              toast(chg ? '配送スタッフを変更しました（運営が出荷指示を再送します）' : '配送スタッフを確定しました');
              return true;
            } catch (e) {
              toastError(e);
              return false;
            }
          }}
        />
        <div className="tabs" role="tablist">
          {tabs.map(([k, l]) => <button type="button" key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}
        </div>
        {body}
      </div>
      {viewerEl}
      {confirmDel && (
        <Modal onClose={() => setConfirmDel(false)} cls="sm">
          <div className="mb" style={{ paddingTop: '1.714286rem' }}>
            <div className="big-ic" style={{ background: 'color-mix(in srgb,var(--red) 15%,transparent)', color: 'var(--red)' }}><Icon name="trash" /></div>
            <b>このファイルを削除しますか？</b><p style={{ margin: 0, fontSize: '0.928571rem' }}>削除したファイルは元に戻せません。</p>
          </div>
          <footer style={{ border: 0 }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setConfirmDel(false)}>キャンセル</button>
            <button type="button" className="btn pri" style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => { setConfirmDel(false); toast('ファイルを削除しました'); }}>削除する</button>
          </footer>
        </Modal>
      )}
    </>
  );
}

/** 添付の表示で ← → キーで送る */
function ViewerKeys({ onStep }: { onStep: (n: number) => void }) {
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if (e.key === 'ArrowRight') onStep(1); if (e.key === 'ArrowLeft') onStep(-1); };
    document.addEventListener('keydown', f);
    return () => document.removeEventListener('keydown', f);
  }, [onStep]);
  return null;
}

/** 配送スタッフ選択（元の driverCard） */
function DriverCard({ d, all, staff, onOk }: { d: DeliveryView; all: DeliveryView[]; staff: Staff[]; onOk: (sid: string) => Promise<boolean> }) {
  const s = staff.find((x) => x.id === d.staff);
  const can = dAssignable(d);
  const [editing, setEditing] = useState(!s);
  const [sel, setSel] = useState(d.staff ?? '');
  const edit = (editing || !s) && can;
  const dayCount = (id: string) => all.filter((x) => x.staff === id && x.date === d.date).length;
  const md = fmtMd(d.date);
  return (
    <section className="driver">
      <OpsLeaveGuard dirty={edit && sel !== (d.staff ?? '')} />
      <div className="top">
        <h3><Icon name="truck" />配送スタッフ選択 {!s && <span className="badge b-warn" style={{ fontSize: '1rem' }}><Icon name="warn" />未設定</span>}</h3>
        <div className="acts">
          {edit ? (
            <>
              <button type="button" className="btn" onClick={() => { if (s) setEditing(false); setSel(d.staff ?? ''); }}>キャンセル</button>
              <button type="button" className="btn pri" onClick={async () => { if (await onOk(sel)) setEditing(false); }}><Icon name="plus" />確定</button>
            </>
          ) : <button type="button" className="btn pri" disabled={!can} title={can ? undefined : dLockReason(d)} onClick={() => setEditing(true)}><Icon name="pen" />編集</button>}
        </div>
      </div>
      <p className="hint" style={{ margin: 0 }}>担当区間：<b>{d.leg}</b>（{WH[d.from]} → {d.to}）　割当期間：納品日の7日前〜前日{!can && <>　<span className="err">{dLockReason(d)}</span></>}</p>
      <div className="fld">
        <label htmlFor="drvSel">配送スタッフ</label>
        {edit ? (
          <>
            <select className="inp" id="drvSel" value={sel} onChange={(e) => setSel(e.target.value)}>
              <option value="">配送スタッフ</option>
              {staff.filter((x) => x.st === '有効' && !x.del).map((x) => <option key={x.id} value={x.id}>{x.name}　ID: {x.id}　{md}の担当件数：{dayCount(x.id)}件</option>)}
            </select>
            {s && d.st === '出荷待' && <span className="hint">出荷指示の送信後に変更すると、運営が出荷指示を再送します（「出荷指示の再送待ち」になります）。</span>}
          </>
        ) : s ? <div className="inp staffline"><b>{s.name}</b><small>ID: {s.id}</small><small>{md}の担当件数：{dayCount(s.id)}件</small></div> : <div className="inp ro">未設定</div>}
      </div>
    </section>
  );
}

/** 配送概要 */
function Overview({ d, part, foods, alt, onTab }: { d: DeliveryView; part: PartInfo | null; foods: Food[]; alt: AltInfo | null; onTab: (t: Tab) => void }) {
  const [note, setNote] = useState('');
  const it = partItems(foods);
  return (
    <Collap title="配送情報">
      <div className="grid3">
        <Fld label="出荷予定日" value={fmtDate(d.ship)} /><Fld label="納品日" value={fmtDate(d.date)} />
        <Fld label="状態"><div className="inp ro"><DstBadge d={d} /></div><span className="hint">ドライバーアプリの受取・納品報告で変わります</span></Fld>
        <Fld label="配送No"><div className="inp ro"><a href="#" onClick={(e) => e.preventDefault()}>{d.no}</a></div></Fld>
        <Fld label="出荷日（実績）" value={d.shipped ? fmtDate(d.shipped) : '—'} />
        <Fld label="荷物名" value={TEMP_GOODS[d.temp]} />
        <Fld label="温度帯"><div className="inp ro"><Tags t={{ [d.temp]: 1 }} full /></div></Fld>
        <Fld label="配送区分" value={d.kbn} /><Fld label="担当区間" value={d.leg} /><Fld label="引取先" value={WH[d.from]} />
        {d.trouble && (
          <div className="span3 alert"><Icon name="warn" /><span><b>トラブル報告：{d.trouble}</b>　状態は受取済のまま、運営が解決します（分納・再配送の子データは運営が作成）。</span><button type="button" className="btn sm" onClick={() => onTab('trouble')}>トラブルを見る</button></div>
        )}
        {d.st === '一部納品済' && (
          <div className="span3 alert info"><Icon name="warn" /><span><b>一部納品：{it.map((f) => `${f[1]} ${f[7] - f[8]}個`).join('、')}が不足</b>　理由：{part?.why || '—'}　再配送：{part?.resend || '—'}</span><button type="button" className="btn sm" onClick={() => onTab('trouble')}>トラブルを見る</button></div>
        )}
        <Fld label="備考" cls="span3">
          <textarea className="inp" maxLength={100} placeholder="備考" value={note} onChange={(e) => setNote(e.target.value)} />
          <span className="hint" style={{ textAlign: 'right' }}>{note.length}/100</span>
        </Fld>
      </div>
      <Collap title="送り状番号">
        {d.track?.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.428571rem', marginBottom: '0.571429rem' }}>
            <p className="hint" style={{ margin: 0 }}>路線便（{d.track[0].carrier}）の荷物です。配送の状況は追跡ページで確かめてください。</p>
            {d.track.map((t) => <TrackingNo key={t.no} no={t.no} url={t.url} carrier={t.carrier} btnClass="btn sm" />)}
          </div>
        ) : null}
        <p className="hint" style={{ margin: 0 }}>引き取り便のため、出荷指示の送信時に ES が採番します（配送No＋箱番号）。</p>
        <div className="grid3">{Array.from({ length: d.boxes }, (_, i) => <input key={i} className="inp" readOnly value={`${d.no}-0${i + 1}`} aria-label={`送り状番号 ${i + 1}`} />)}</div>
      </Collap>
      {alt && (
        <Collap title={`荷物の中身の変更（代替品 ${alt.id}）`}>
          <div className="warnbox" style={{ marginBottom: '0.714286rem' }}><Icon name="warn" /><span><b>出荷指示は版番号つきで再送（rev+1）。荷物の中身が変わります</b>　（rev1 → rev2・{fmtDate(alt.found)} 再送）</span></div>
          <p className="hint" style={{ margin: '0 0 0.428571rem' }}>不良商品：{alt.bad}（全ロット・不良発覚 {fmtDate(alt.found)}・理由：{alt.why}）／代替商品：{alt.sub}</p>
          <div className="tbl-wrap"><table className="tbl"><thead><tr><th>荷物の中身（変更分）</th></tr></thead><tbody><tr><td>{alt.sub} ×2　代替品（元：{alt.bad}）</td></tr><tr><td>{alt.sub} ×2　補償（前回お届け分・請求なし）</td></tr></tbody></table></div>
          <div className="alert" style={{ marginTop: '0.714286rem' }}><Icon name="warn" /><span><b>回収・廃棄：</b>{altTask(alt)}（前回お届け：{alt.prev}）</span></div>
          <AltPatterns a={alt} />
        </Collap>
      )}
    </Collap>
  );
}

/** 実績（納品前は空。RV-CARRIER-20261002 K-f） */
function Result({ d, foods }: { d: DeliveryView; foods: Food[] }) {
  if (!['納品済', '一部納品済'].includes(d.st)) {
    return <Collap title="配送実績"><p className="empty" style={{ margin: 0, padding: '1.714286rem 0', textAlign: 'center' }}>納品後に表示されます。（いまの状態：{d.st}）</p></Collap>;
  }
  const F = foodSum(foods, d.st);
  const thumb = <i className="thumb" />;
  const link = (s: string) => <a href="#" onClick={(e) => e.preventDefault()}>{s}</a>;
  return (
    <Collap title="配送実績">
      <div className="grid3"><Fld label="納品日時" value={fmtDate(d.date) + ' ' + (d.doneAt || '10:23')} /></div>
      <Fld label="備考"><textarea className="inp" readOnly placeholder="入力内容" /></Fld>
      <Collap title="廃棄数確認">
        <div className="stat"><div><small>廃棄数</small><b className="num">{F.dc} 個</b></div><div><small>理論在庫</small><b className="num">{F.th} 個</b></div><div><small>実在庫</small><b className="num">{F.ac} 個</b></div><div><small>差異</small><b className="num">{F.df} 個</b></div></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>No</th><th>写真</th><th>品番</th><th>商品名</th><th>カテゴリ</th><th>廃棄数</th><th>賞味期限</th><th>理論在庫</th><th>実在庫</th></tr></thead>
            <tbody>{foods.map((f, i) => (
              <tr key={f[0]}><td className="num">{i + 1}</td><td>{thumb}</td><td>{f[0]}</td><td>{link(f[1])}</td><td>{f[2]}</td><td className={`num ${f[3] ? 'neg' : ''}`}>{f[3]}</td><td className={`num ${f[4] === '2026-10-14' ? 'neg' : ''}`}>{f[4]}</td><td className="num">{f[5]}</td><td className="num">{f[6]}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </Collap>
      <Collap title="陳列結果確認">
        <div className="stat"><div><small>予定合計数</small><b className="num">{F.pl} 個</b></div><div><small>実際合計数</small><b className="num">{F.re} 個</b></div><div><small>差異合計数</small><b className="num">{F.dd} 個</b></div></div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>No</th><th>写真</th><th>品番</th><th>商品名</th><th>カテゴリ</th><th>予定数</th><th>実際数</th><th>誤差</th></tr></thead>
            <tbody>{foods.map((f, i) => {
              const a = foodActual(f, d.st);
              return <tr key={f[0]}><td className="num">{i + 1}</td><td>{thumb}</td><td>{f[0]}</td><td>{link(f[1])}</td><td>{f[2]}</td><td className="num">{f[7]}</td><td className={`num ${a < f[7] ? 'neg' : ''}`}>{a}</td><td className={`num ${f[7] - a ? 'neg' : ''}`}>{f[7] - a}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </Collap>
    </Collap>
  );
}

/** トラブル（RV2-CARRIER-20261002）：ドライバーアプリの報告と、一部納品の内容 */
function TroubleTab({ d, trbs, staff, part, foods }: { d: DeliveryView; trbs: CarrierTrouble[]; staff: Staff[]; part: PartInfo | null; foods: Food[] }) {
  const it = partItems(foods);
  return (
    <>
      <Collap title="トラブル報告">
        {trbs.length ? (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>No</th><th>報告の時刻</th><th>場面</th><th>種類</th><th>内容</th><th>報告者（配送スタッフ）</th><th>写真</th><th>対応状況</th><th>運営の対応</th></tr></thead>
              <tbody>{trbs.map((t, i) => (
                <tr key={t.id}>
                  <td className="num">{i + 1}</td><td className="num" style={{ whiteSpace: 'nowrap' }}>{fmtDT(t.at)}</td><td style={{ whiteSpace: 'nowrap' }}>{t.scene}</td><td style={{ whiteSpace: 'nowrap' }}>{t.kind}</td>
                  <td style={{ whiteSpace: 'normal', minWidth: '15.714286rem' }}>{t.note}</td><td>{stfName(staff, t.staff)}</td><td>{t.photo ? t.photo + '枚' : '—'}</td>
                  <td><span className={`badge ${carrierCls(t.st, 'b-amber')}`}>{t.st}</span></td>
                  <td style={{ whiteSpace: 'normal', minWidth: '15.714286rem' }}>{t.res}{t.resAt && <><br /><small className="hint">{fmtDT(t.resAt)}</small></>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <p className="empty">この配送にトラブル報告はありません。</p>}
        <p className="hint" style={{ margin: '0.571429rem 0 0' }}>※配送スタッフがドライバーアプリから報告したトラブルです（陳列の差異・未配送は自動で報告）。対応（分納・再配送・取消）は運営（ESキッチン）が決め、決まると「解決済み」になります。</p>
      </Collap>
      {d.st === '一部納品済' && (
        <Collap title="一部納品の内容">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>品番</th><th>商品名</th><th>予定数</th><th>納品数</th><th>不足数</th></tr></thead>
              <tbody>{it.map((f) => <tr key={f[0]}><td>{f[0]}</td><td>{f[1]}</td><td className="num">{f[7]}</td><td className="num">{f[8]}</td><td className="num neg">{f[7] - f[8]}</td></tr>)}</tbody>
            </table>
          </div>
          <div className="grid3" style={{ marginTop: '0.857143rem' }}>
            <Fld label="不足の合計" value={it.reduce((a, f) => a + f[7] - f[8], 0) + ' 個'} />
            <Fld label="理由" value={part ? part.why : '—'} cls="span2" />
            <Fld label="再配送" value={part ? part.resend : '—'} cls="span3" />
          </div>
        </Collap>
      )}
    </>
  );
}
