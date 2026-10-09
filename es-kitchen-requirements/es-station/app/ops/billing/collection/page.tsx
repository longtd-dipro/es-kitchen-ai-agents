'use client';

import Link from 'next/link';
import billing from '@/lib/ops/areas/billing';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { yen } from '@/lib/format/money';
import { fmtDate } from '@/lib/format/date';
import { ListView, useList, type ListCol, type ListFilter } from '@/app/ops/_general/list';
import { hideRulesOf, searchKeysOf } from '@/app/ops/_general/list/useList';
import { Loading } from '@/app/ops/_general/parts';
import { ListCsv } from '@/app/ops/_ui/csv';
import { PageHead } from '@/app/ops/_ui/ui';
import { R, useBilling } from '../_components/useBilling';

const api = areaApi(billing);

/*
 * 集金管理（簡易版・台帳 F 2026-10-05＝A／2026-10-08「集金管理は参照のみ…」）：アプリの現金支払いの回収予定（注文）と、ドライバーが回収した額（配送の報告）の突き合わせだけ。
 * 参照のみ・編集不可。未請求／請求済／入金済の状態は持たない。差額（回収予定 − 実際の回収。不足がプラス）は実績精算の「現金回収差額」として当月の請求へ繰り入れる（実績精算の画面）
 * 一覧は共通の ListView（検索・並べ替え・ページ送り・CSV出力はほかの一覧と同じ）
 */
type Row = {
  d: string; no: string; br: string; brName: string; co: string; coName: string; drvId: string; drv: string; carrierId: string; carrier: string;
  plan: number; got: number; note: string; month: string; diff: number; coN: string; brN: string; carN: string; drvN: string;
};

/* 長い名前は折り返して、表が枠の幅に収まるようにする */
const WRAP: React.CSSProperties = { maxWidth: '10em', whiteSpace: 'normal' };

export default function CollectionPage() {
  const { L } = useBilling();
  const list = useList('collection');
  const { data, error, reload } = useQuery(api, 'cashAll');
  /* 読み込みに失敗したら W141（{対象}＝集金管理の一覧）と「再読み込み」。読み込み中は Loading */
  if (error && !data) return <div className="card"><div className="empty">集金管理の一覧を読み込めませんでした。時間をおいて、もう一度お試しください。 <button type="button" className="btn" onClick={() => reload()}>再読み込み</button></div></div>;
  if (!L || !data) return <Loading />;
  const rows: Row[] = data.map((x) => ({ ...x, diff: x.plan - x.got, coN: `${x.coName} ${x.co}`, brN: `${x.brName} ${x.br}`, carN: `${x.carrier} ${x.carrierId}`, drvN: `${x.drv} ${x.drvId}` }));
  /* 選べる月は、現金の集金の報告がある月と当月を新しい順に（台帳 F 2026-10-08）。初期＝当月 */
  const months = [...new Set([L.month, ...rows.map((x) => x.month)])].sort().reverse();
  const signed = (v: number) => (v > 0 ? '+' : '') + yen(v);
  const sub = (v: string) => <div className="small">{v}</div>;
  /* 範囲が複数月のときだけ「対象月」の列を足す（台帳 F 2026-10-08「月の選択は…」） */
  const multi = (list.st.f['month@from'] || L.month) !== (list.st.f['month@to'] || L.month);
  const cols: ListCol<Row>[] = [
    ...(multi ? [{ key: 'month', label: '対象月', td: (x: Row) => <td style={{ whiteSpace: 'nowrap' }}>{x.month}</td> }] : []),
    { key: 'd', label: '回収日', td: (x) => <td style={{ whiteSpace: 'nowrap' }}>{fmtDate(x.d)}</td> },
    { key: 'no', label: '配送データ', td: (x) => <td className="mono">{x.no}</td> },
    { key: 'coName', label: '法人名', td: (x) => <td style={WRAP}>{x.coName}{sub(x.co)}</td> },
    { key: 'brName', label: '拠点名', td: (x) => <td style={WRAP}>{x.brName}{sub(x.br)}</td> },
    { key: 'carrier', label: '配送会社', td: (x) => <td style={WRAP}>{x.carrier}{sub(x.carrierId)}</td> },
    { key: 'drv', label: 'ドライバー', td: (x) => <td>{x.drv}{sub(x.drvId)}</td> },
    { key: 'plan', label: '回収予定額（税込）', num: true, td: (x) => <td className="num">{yen(x.plan)}</td> },
    { key: 'got', label: '実際の回収額（税込）', num: true, td: (x) => <td className="num">{yen(x.got)}</td> },
    { key: 'diff', label: '差額（税込）', num: true, td: (x) => <td className={`num${x.diff ? ' txt-ng' : ''}`}>{signed(x.diff)}{x.diff !== 0 && sub(x.diff > 0 ? '不足' : '過多')}</td> },
    { key: 'note', label: 'メモ', td: (x) => <td title={x.note} style={{ maxWidth: '12em', overflow: 'hidden', textOverflow: 'ellipsis' }}>{x.note}</td> },
  ];
  const filters: ListFilter[] = [
    { t: 'search', ph: '法人名・ID、拠点名・ID、配送会社名・ID、ドライバー名・ID', span: 2, keys: ['coN', 'brN', 'carN', 'drvN'] },
    { t: 'monthRange', ph: '対象月', col: 'month', opts: months, init: L.month },
    { t: 'select', ph: '差額', col: 'diffK', opts: ['差額あり', '一致'] },
  ];
  /* 差額の絞り込み用（col の値に opts の文字が含まれる行） */
  const rowsK = rows.map((x) => ({ ...x, diffK: x.diff !== 0 ? '差額あり' : '一致' }));
  const shown = list.apply(rowsK, 'status', searchKeysOf(filters), hideRulesOf(filters));
  const T = shown.reduce((a, x) => ({ plan: a.plan + x.plan, got: a.got + x.got, diff: a.diff + x.diff, n: a.n + (x.diff !== 0 ? 1 : 0) }), { plan: 0, got: 0, diff: 0, n: 0 });
  return (
    <>
      <PageHead crumbs={['請求', '集金管理']} title="集金管理">
        <ListCsv screen="集金管理" list={list} filters={filters} cols={cols} rows={rowsK} source={{ kind: 'dm.report.deliveryReports', id: (x) => x.no }} />
      </PageHead>
      <div className="small" style={{ marginBottom: 'var(--space-8)' }}>
        アプリの現金支払いの<b>回収予定額</b>（注文）と、ドライバーが<b>実際に回収した額</b>（配送の報告）の突き合わせです。差額（回収予定 − 実際の回収。不足はプラス）は実績精算の「現金回収差額」として当月の請求へ繰り入れます（<Link href={R.act}>実績精算</Link>）。
      </div>
      <div className="sumbar" style={{ marginBottom: 'var(--space-12)' }}>
        <div className="kv"><small>件数</small><b>{shown.length} 件</b></div>
        <div className="kv"><small>差額あり</small><b>{T.n} 件</b></div>
        <div className="kv"><small>回収予定額（税込）</small><b>{yen(T.plan)}</b></div>
        <div className="kv"><small>実際の回収額（税込）</small><b>{yen(T.got)}</b></div>
        <div className="kv"><small>差額（税込）</small><b className={T.diff ? 'txt-ng' : ''}>{signed(T.diff)}</b></div>
      </div>
      <div className="card"><ListView list={list} filters={filters} cols={cols} rows={rowsK} rowKey={(x) => x.no} /></div>
    </>
  );
}
