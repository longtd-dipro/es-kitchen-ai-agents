'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { today } from '@/lib/supplier/dates';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { useCorpSignedIn } from '../../../_ui/CorpProvider';
import { useWho } from '../../../_docs/ds';
import { SalesPage, SBadge, yen } from '../../_components/SalesParts';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

const api = areaApi(corpDocs);

/** ユーザー詳細（元：fsl の vUser）。基本情報と購入履歴。「購入制限」で、このユーザーはアプリで購入できなくなる */
export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const { account, toast, toastError } = useCorpSignedIn();
  const who = useWho();
  const router = useRouter();
  const { data } = useQuery(api, 'sales', { who });
  const u = data?.users.find((x) => x.id === id);
  const multi = (data?.sites.length ?? 0) > 1;
  const head = (
    <header className="es-pagehead">
      <div className="es-pagehead__text">
        <nav className="es-breadcrumb" aria-label="パンくず"><Link href="/corp/sales">購入・ユーザー管理</Link><span className="es-breadcrumb__sep">/</span><span className="es-breadcrumb__cur">ユーザー詳細</span></nav>
        <h1 className="es-pagehead__title">ユーザー詳細 <span className="es-mono">{id}</span></h1>
        <div style={{ fontSize: '0.857143rem', color: 'var(--text-low)' }}>{account.label}・{multi ? '自社のすべての拠点' : 'この拠点だけ'}・今日 {fmtDate(today())}</div>
      </div>
      <div className="es-pagehead__actions"><button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={() => router.back()}>戻る</button></div>
    </header>
  );
  if (!data) return <SalesPage head={head}>{null}</SalesPage>;
  if (!u) return <SalesPage head={head}><div className="es-card">ユーザーが見つかりません</div></SalesPage>;
  const buys = data.buys.filter((r) => r.uid === u.id);
  const site = data.sites.find((x) => x.id === u.site);
  const f = (l: string, v: string) => <div className="es-field"><label className="es-field__label">{l}</label><div className="es-input es-input--md es-input--readonly"><input readOnly value={v} /></div></div>;
  const limit = async () => {
    try {
      const r = await api.action('toggleLimit', { who, id: u.id });
      toast(r.limit === '購入不可' ? '購入制限をかけました（このユーザーはアプリで購入できません）' : '購入制限を解除しました');
    } catch (e) { toastError(e); }
  };
  return (
    <SalesPage head={head}>
      <div className="es-card">
        <div className="es-section-title" style={{ padding: '0.571429rem 0.857143rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.142857rem' }}>基本情報</h2>
          <button type="button" className="es-btn es-btn--outline es-btn--primary es-btn--sm" onClick={limit}>{u.limit === '購入不可' ? '制限解除' : '購入制限'}</button>
        </div>
        <div className="es-formgrid">
          {f('ユーザーID', u.id)}{f('社員ID', u.emp || '—')}{f('拠点', site?.n ?? u.site)}{f('連携状態', u.link)}{f('購入制限', u.limit)}{f('連携日', fmtDate(u.since))}
        </div>
      </div>
      <div className="es-card" style={{ marginTop: '0.857143rem' }}>
        <div className="es-section-title" style={{ padding: '0.571429rem 0.857143rem' }}><h2 style={{ margin: 0, fontSize: '1.142857rem' }}>購入履歴（{buys.length}件）</h2></div>
        <div className="es-table-wrap">
          <table className="es-table s7-tbl">
            <thead><tr><th>購入番号</th><th>商品</th><th className="r">個数</th><th className="r">支払金額（税込）</th><th>決済方法</th><th>状態</th><th>注文日時</th></tr></thead>
            <tbody>
              {buys.length ? buys.map((r) => (
                <tr key={r.id}>
                  <td className="es-mono">{r.no}</td><td>{r.item}</td><td className="es-num r">{r.qty}</td>
                  <td className="es-num r">{yen(r.amt)}</td><td>{r.pay}</td><td><SBadge t={r.st} /></td><td className="es-num">{fmtDateTime(r.at)}</td>
                </tr>
              )) : <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-low)' }}>購入はありません</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </SalesPage>
  );
}
