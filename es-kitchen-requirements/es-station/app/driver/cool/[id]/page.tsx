'use client';

import { useParams } from 'next/navigation';
import { editUntil, mdW, nrAll, rcvd } from '@/lib/driver/logic';
import { today } from '@/lib/supplier/dates';
import EtaCard from '../../_ui/EtaCard';
import { Icon } from '../../_ui/Icon';
import { useCommit, useDraft, useDriverSignedIn } from '../../_ui/DriverProvider';
import { AckModal, Banner, Cb, DCard, Docs, EarlyModal, Info, Loading, NotFound, NrFoot, TopBar, TrBox, tapProps, useRun } from '../../_ui/parts';
import { driverApi, useDay } from '../../_ui/useDay';

/** COOL便（元の V.cool・DA_COOL_001）：荷物（送り状番号）をチェックして完了。完了後は7日間修正できる */
export default function DriverCool() {
  const { id } = useParams<{ id: string }>();
  const no = decodeURIComponent(id);
  const { staff, offline, openModal, clearDrafts } = useDriverSignedIn();
  const { data, ptOf } = useDay();
  const commit = useCommit();
  const api = driverApi();
  const [busy, run] = useRun();
  const [ckDraft, setCk] = useDraft<Record<string, boolean> | null>('cool.' + no, null);
  const [editing, setEditing] = useDraft('cool.edit.' + no, false);
  if (!data) return <><TopBar title="COOL便" /><Loading /></>;
  const d = data.dels.find((x) => x.no === no && x.type === 'cool');
  if (!d) return <><TopBar title="COOL便" trouble={false} /><NotFound text={`配送 ${no}（COOL便）は今日の担当にありません。`} /></>;
  const pt = ptOf(d.pt);
  const done = d.status === '配送完了', ed = done && editing;
  const ck = ckDraft ?? d.ck;
  const n = d.inv.filter((i) => ck[i.no]).length;
  const toggle = (k: string) => setCk({ ...ck, [k]: !ck[k] });
  const finish = (ack: boolean, early?: string) => api.action('completeCool', { staff, no, ck, ack, offline, early }).then((r) => { clearDrafts('cool.' + no); commit(r); });
  const complete = (early?: string) => {
    /* 納品日より前は、確認して理由を入れたときだけ（課題 4-1） */
    if (d.early && !early) return openModal(<EarlyModal date={d.early} onOk={(why) => { setTimeout(() => complete(why), 0); }} />);
    if (d.inv.every((i) => ck[i.no])) return run(() => finish(false, early));
    openModal(<AckModal title="配送を完了しますか？" text={<>渡せていない荷物があります。<br />未配送分はトラブルとして運営に自動で報告され、運営が再配送を手配します。</>}
      ack="ESキッチンへ連絡済みです。" okLabel="一部未配送のまま完了" onOk={() => finish(true, early)} />);
  };
  const save = () => run(async () => { const r = await api.action('saveCoolEdit', { staff, no, ck, offline }); setEditing(false); clearDrafts('cool.' + no); commit(r); });

  return (
    <>
      <TopBar title={done ? '荷物受取' : 'COOL便'} trouble={'d:' + no} />
      {done && <Banner t="荷物の配送は完了しました。" s={`${d.doneAt ?? ''}に配送済み`} o={d} />}
      <div className="scroll pad stack cool">
        <DCard d={d} date={mdW(today())} />
        <TrBox o={d} />
        <div className="cols">
          <div><Info d={d} /><Docs docs={d.docs} own={data.me.own} />{!done && <EtaCard d={d} />}</div>
          <div>
            <div className="h3">荷物情報</div>
            <div className="pk">
              <div className="hd"><span><Icon name="box" s /> <b>{d.boxes}</b> 箱</span><span><Icon name="fridge" s /> <b>{d.fr ?? '—'}</b> 品</span><span><Icon name="snow" s /> <b>{d.fz ?? '—'}</b> 品</span></div>
              {d.inv.map((i, k) => {
                const nr = !rcvd(pt, d, i.no), dis = nr || (done && !ed);
                return (
                  <div key={i.no} className={`inv tap ${nr ? 'nr' : ''}`} {...tapProps(dis ? null : () => toggle(i.no))}>
                    <span style={{ width: '1rem' }}>{k + 1}</span>
                    <span className="no"><Icon name="box" s />{i.no}{nr && <> <span className="nrtag">未受取</span></>}</span>
                    <Cb on={nr ? false : !!ck[i.no]} dis={dis} onClick={() => toggle(i.no)} />
                  </div>
                );
              })}
            </div>
            {done && <p className="hint muted" style={{ margin: 0 }}>{editUntil(today())} まで内容を修正できます。</p>}
          </div>
        </div>
      </div>
      {!done ? (nrAll(pt, d) ? <NrFoot /> : <div className="foot"><button type="button" className="btn pri" disabled={!n || busy} onClick={() => complete()}>完了</button></div>)
        : ed ? <div className="foot"><button type="button" className="btn sec" onClick={() => { setEditing(false); clearDrafts('cool.' + no); }}>キャンセル</button><button type="button" className="btn pri" disabled={busy} onClick={save}>修正を保存</button></div>
          : <div className="foot"><button type="button" className="btn sec" onClick={() => setEditing(true)}><Icon name="edit" />内容を修正する</button></div>}
    </>
  );
}
