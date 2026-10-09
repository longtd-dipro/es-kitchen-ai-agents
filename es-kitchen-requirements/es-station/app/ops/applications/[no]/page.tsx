'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@/lib/ops/core/client';
import { api } from '../_components/api';
import ChangeDetail from '../_components/ChangeDetail';
import { Bg, PageHead, Ro } from '../_components/ds';
import IntakeScreen from '../_components/intake/IntakeScreen';
import { fmtDatesIn } from '@/lib/format/date';

/*
 * 申請詳細。申請IDで出し分ける：
 *   CH-…（契約変更・休止・解約）＝承認の画面（ChangeDetail）
 *   AP-…（新規契約）＝受付の画面（IntakeScreen：申込内容確認 → 仮登録 → 詳細情報設定 → 拠点ごとに確定）
 * 法人・拠点・契約の画面の「申請で編集」からもこの URL で開く（2026/09/29 決定 28-146。契約設定中なら詳細情報設定から）
 */
export default function ApplicationDetailPage() {
  const { no } = useParams<{ no: string }>();
  const id = decodeURIComponent(no);
  return id.startsWith('CH-') ? <ChangePage no={id} /> : <IntakePage no={id} />;
}

function NotFound({ no }: { no: string }) {
  return (
    <div id="apx"><div className="page" id="apxbody">
      <PageHead crumb={[{ t: '契約申請管理', href: '/ops/applications' }, '申請詳細']} title="申請詳細" id={no} />
      <div className="card"><div className="pad">この申請は見つかりません。<Link href="/ops/applications">契約申請管理へ戻る</Link></div></div>
    </div></div>
  );
}

function ChangePage({ no }: { no: string }) {
  const { data, loading } = useQuery(api, 'change', { no });
  if (loading) return null;
  return data ? <ChangeDetail a={data} /> : <NotFound no={no} />;
}

function IntakePage({ no }: { no: string }) {
  const { data, loading } = useQuery(api, 'intake', { no });
  if (loading) return null;
  if (!data) return <NotFound no={no} />;
  const { row, cfg } = data;
  /* 却下・取り下げ済みの申込は受付画面を開かず、理由と日時だけを出す（2026/09/29） */
  if (!cfg || row.st === '却下' || row.st === '取り下げ済') {
    return (
      <div id="apx"><div className="page" id="apxbody">
        <PageHead crumb={[{ t: '契約申請管理', href: '/ops/applications' }, '申請詳細']} title="申請詳細" id={row.no} badge={<Bg>{row.st}</Bg>} />
        <div className="card"><h2>申請情報</h2><div className="pad"><div className="es-formgrid" style={{ gridTemplateColumns: '1fr' }}>
          <Ro label="法人／拠点">{row.company}／{row.branch}</Ro>
          <Ro label="ステータス"><Bg>{row.st}</Bg></Ro>
          <Ro label={row.st === '却下' ? '却下した人・日時' : '取り下げ日時'}>{fmtDatesIn(row.by) || '—'}</Ro>
          <Ro label={row.st === '却下' ? '却下理由' : '取り下げ理由'}>{row.reason || '—'}{row.memo && <div className="mm">{row.memo}</div>}</Ro>
        </div></div></div>
      </div></div>
    );
  }
  return <IntakeScreen key={row.no} row={row} cfg={cfg} />;
}
