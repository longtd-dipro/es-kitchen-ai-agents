'use client';

import { useSearchParams } from 'next/navigation';
import { allRecv, mdW, recvKey } from '@/lib/driver/logic';
import type { PtType } from '@/lib/driver/types';
import { today } from '@/lib/supplier/dates';
import { Icon } from './Icon';
import { useCommit, useDraft, useDriverSignedIn } from './DriverProvider';
import { AckModal, Av, Badges, Banner, Cb, Chk, Docs, Loading, NotFound, PtNums, Nums, TopBar, TrBox, tapProps, useRun } from './parts';
import { driverApi, useDay } from './useDay';

/**
 * 荷物受取（元の V.recv・DA_RECV_001/003。中継先は追加の画面）。?id＝受取地点（なければ担当の最初の倉庫・中継先）。
 * 送り状番号を1件ずつチェックして完了。足りないときは「一部未受取のまま完了」（トラブル「箱数不足」を自動で報告）
 */
export default function ReceiveView({ type }: { type: PtType }) {
  const sp = useSearchParams();
  const { staff, offline, toast, openModal, clearDrafts } = useDriverSignedIn();
  const { data, delsOf } = useDay();
  const commit = useCommit();
  const api = driverApi();
  const [busy, run] = useRun();
  const id = sp.get('id') ?? data?.points.find((p) => p.type === type)?.id ?? '';
  const [draft, setDraft] = useDraft<Record<string, boolean> | null>('recv.' + id, null);
  const [only, setOnly] = useDraft('recvOnly.' + id, false);
  const [q, setQ] = useDraft('recvQ.' + id, '');
  const nav = { title: '荷物受取' };
  if (!data) return <><TopBar title={nav.title} /><Loading /></>;
  const p = data.points.find((x) => x.id === id);
  if (!p) return <><TopBar title={nav.title} trouble={false} /><NotFound text={`今日の担当に${type === 'hub' ? '中継先' : '倉庫'}の受取はありません。`} /></>;
  const done = p.status === '受取済';
  const recv = done || !draft ? p.recv : draft;
  const dels = delsOf(p.id);
  const qq = q.trim();
  const toggle = (k: string) => setDraft({ ...recv, [k]: !recv[k] });

  const finish = (ack: boolean) => api.action('receive', { staff, pt: p.id, recv, ack, offline }).then((r) => {
    clearDrafts('recv.' + p.id); setOnly(false);
    commit(r);
  });
  const complete = () => {
    if (allRecv(recv, dels)) return run(() => finish(false));
    openModal(<AckModal title="荷物の受取は完了しましたか？" text={<>一部の荷物が未確認の状態です。<br />未受取分はトラブル（箱数不足）として運営に自動で報告されます。</>}
      ack="未受取分は、ESキッチンへ連絡済みです。" okLabel="一部未受取のまま完了" onOk={() => finish(true)} />);
  };
  const reReceive = () => run(async () => {
    const r = await api.action('reReceive', { staff, pt: p.id });
    clearDrafts('recv.' + p.id); setOnly(true);
    toast(r.msg);
  });
  const copy = () => {
    try { navigator.clipboard.writeText(p.tel).then(() => toast(`${p.tel} をコピーしました`), () => toast(`電話番号：${p.tel}`)); } catch { toast(`電話番号：${p.tel}`); }
  };

  const groups = dels.filter((d) => !qq || d.name.includes(qq) || d.inv.some((i) => i.no.includes(qq))).map((d) => {
    const rows = d.inv.filter((i) => !only || !recv[recvKey(d.no, i.no)]);
    if (!rows.length) return null;
    return (
      <div key={d.no} className={`pk ${d.type === 'cool' ? 'cool' : ''}`}>
        <div className="hd" style={{ gap: '0.714286rem', alignItems: 'center' }}>
          <Av t={d.type} />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.285714rem' }}>
            <b style={{ color: '#1f2733', fontSize: '1.142857rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</b>
            <span className="meta" style={{ fontSize: '0.857143rem' }}><Icon name="pin" s />{d.addr.slice(0, 16)}…</span>
            <Nums d={d} />
          </div>
        </div>
        {rows.map((i, k) => {
          const key = recvKey(d.no, i.no);
          return (
            <div key={i.no} className="inv tap" {...tapProps(done ? null : () => toggle(key))}>
              <span style={{ width: '1rem' }}>{k + 1}</span>
              <span className="no"><Icon name="box" s />{i.no}{i.late && <> <span className="tag">追加</span></>}</span>
              <Cb on={!!recv[key]} dis={done} onClick={() => toggle(key)} />
            </div>
          );
        })}
      </div>
    );
  }).filter(Boolean);

  return (
    <>
      <TopBar title="荷物受取" trouble={'pt:' + p.id} />
      {done && <Banner t={`荷物の受取は完了しました。${p.round > 1 ? `（${p.round}回目）` : ''}`} s={`${p.doneAt ?? ''}に受取済`} o={p} />}
      <div className="scroll pad stack">
        <div className="dcard wh">
          <div className="row1"><Av t="wh" /><h3>{p.name}{p.type === 'hub' && <> <span className="tag">中継先</span></>}</h3></div>
          <div style={{ fontSize: '0.892857rem' }}><PtNums dels={dels} /></div>
          <div className="row2"><span style={{ display: 'flex', gap: '0.428571rem' }}><Icon name="cal" s />{mdW(today())}</span><Badges o={p} /></div>
          {p.code && <div className="meta"><Icon name="bld" s />{p.type === 'hub' ? '営業所コード' : '倉庫コード'} {p.code}</div>}
          <div className="meta"><Icon name="zip" s />{p.zip || '—'}</div>
          <div className="meta"><Icon name="pin" s />{p.addr || '—'}</div>
          <div className="meta" style={{ alignItems: 'center' }}><Icon name="phone" s /><span className="sel-text">{p.tel || '—'}</span>{p.tel && <button type="button" className="mini" onClick={copy}><Icon name="copy" s />コピー</button>}</div>
        </div>
        {p.type === 'hub' && <Docs docs={p.docs} own={data.me.own} />}
        {p.round > 1 && !done && <div className="note2"><Icon name="refresh" s />同じ日の{p.round}回目の受取です。追加の荷物をチェックしてください。</div>}
        <TrBox o={p} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="h3" style={{ margin: 0 }}>荷物受取一覧</span>
          {!done && <Chk on={only} label="未確認のみ表示" onClick={() => setOnly(!only)} />}
        </div>
        <div className="search"><input placeholder="納品先拠点名・送り状番号" aria-label="検索" value={q} onChange={(e) => setQ(e.target.value)} /><Icon name="search" /></div>
        {groups.length ? groups : <div className="empty">未確認の荷物はありません。</div>}
        {done && <button type="button" className="btn sec" disabled={busy} onClick={reReceive}><Icon name="refresh" />追加の荷物を受け取る（同日・再受取）</button>}
      </div>
      {!done && <div className="foot"><button type="button" className="btn pri" disabled={busy} onClick={complete}>完了</button></div>}
    </>
  );
}
