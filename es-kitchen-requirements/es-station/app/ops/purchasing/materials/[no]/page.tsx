'use client';

import { useParams, useRouter } from 'next/navigation';
import { MAT_WH, mat, n, supName } from '@/lib/ops/purchasing/master';
import { B, Info, Kv, Sec, yen } from '../../_components/common';
import { usePo } from '../../_components/usePo';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

const LIST = '/ops/purchasing/materials?tab=history';
const NO_MAIL = 'メールは送りません。運営が代理入力';

/** 資材発注の詳細（閲覧だけ・AW_MPO_002）。操作（キャンセル・代理入力）は発注（C1）の決まりに従う */
export default function MaterialOrderDetailPage() {
  const { no: raw } = useParams<{ no: string }>();
  const no = decodeURIComponent(raw);
  const router = useRouter();
  const { recs, supMethod } = usePo();
  const back = () => router.push(LIST);
  const head = (last: string) => (
    <div className="ph">
      <div>
        <div className="crumb"><span>発注・入荷</span><span><button className="lnk u" onClick={back}>資材発注</button></span><span>{last}</span></div>
        <h1>資材発注の詳細 <span className="mono" style={{ fontSize: '1.142857rem' }}>{no}</span></h1>
      </div>
      <div className="btns"><button className="btn out lg" onClick={back}>一覧へ戻る</button></div>
    </div>
  );
  if (!recs) return <>{head('発注詳細')}<div className="card"><div className="empty">読み込み中…</div></div></>;
  const x = recs.find((r) => r.no === no && r.type === '資材');
  if (!x) return <>{head('発注詳細')}<div className="card"><Info kind="ng">資材発注（{no}）が見つかりません。</Info><button className="btn out" onClick={back}>資材発注の一覧へ戻る</button></div></>;
  const o = x.order;
  const m = mat(x.pid);
  const method = supMethod?.[x.sup] || 'ESステーション';
  const recv = o.recv || '未入荷';
  const wish = o.rows[0]?.wish;
  const hist = o.hist ?? [];
  return (
    <>
      {head('発注詳細')}
      <div className="card">
        <Sec title="発注情報">
          <div className="kvgrid">
            <Kv l="発注番号" v={<span className="mono">{x.no}</span>} /><Kv l="発注日時" v={fmtDateTime(String(x.at).slice(0, 16))} /><Kv l="状態（仕入先の回答）" v={<B v={o.ans} />} />
            <Kv l="資材" v={x.name} /><Kv l="資材ID" v={<span className="mono">{x.pid}</span>} /><Kv l="規格" v={m?.spec} />
            <Kv l="数量" v={n(x.qty) + o.unit} /><Kv l="ロット" v={m ? `${n(m.lot)}${m.unit}` : ''} /><Kv l="金額（税抜）" v={yen(x.amt)} />
            <Kv l="納入先" v={o.wh || MAT_WH} /><Kv l="入荷希望日" v={fmtDate(wish)} />
          </div>
        </Sec>
        <Sec title="仕入先">
          <div className="kvgrid"><Kv l="仕入先" v={supName(x.sup)} /><Kv l="発注方法" v={method} /></div>
          {method === '外部' && <div className="hint" style={{ marginTop: '0.571429rem' }}>{NO_MAIL}</div>}
        </Sec>
        <Sec title="仕入先の回答">
          <div className="kvgrid"><Kv l="仕入先の回答" v={<B v={o.ans} />} /><Kv l="出荷予定日" v={fmtDate(o.eta)} /></div>
        </Sec>
        <Sec title={<>入荷状況 <B v={recv} /></>}>
          <div className="kvgrid"><Kv l="入荷状態" v={<B v={recv} />} /><Kv l="入荷日" v={fmtDate(o.recvDate)} /></div>
        </Sec>
        <Sec title="変更履歴">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>日時</th><th>操作者</th><th>内容</th></tr></thead>
              <tbody>
                {hist.length ? hist.map((h, i) => <tr key={i}><td>{fmtDateTime(String(h.at).slice(0, 16))}</td><td>{h.who}</td><td>{h.t}</td></tr>) : <tr><td colSpan={3} className="empty">履歴はありません</td></tr>}
              </tbody>
            </table>
          </div>
        </Sec>
      </div>
    </>
  );
}
