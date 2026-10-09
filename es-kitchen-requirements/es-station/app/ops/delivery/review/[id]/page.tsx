'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { checkReviewResolve, fullDate, type Errors } from '@/lib/ops/delivery/logic';
import type { ReviewItem } from '@/lib/ops/delivery/types';
import { useOps } from '../../../_ui/OpsProvider';
import { useCanAct } from '../../../_ui/perm';
import { api } from '../../_components/api';
import { Badge, Button, Card, Checkbox, EmptyState, Field, InlineMessage, PageHead, Radio, SectionTitle, TextField, Timeline } from '../../_components/kit';

/*
 * 要確認詳細（部品 16 の ReviewDetail・ReviewShelfLife）。
 * 中身があるのは見本 #142（予定生成不可）と #156（消費期限の注意）。ほかの要確認は、見出し（区分・対象・法人・拠点・納品日・検出）を
 * その行の値にして、中身は #142 の見本を出す（RV3-OPS-20261002 #3）。
 */

const STATE_TONE = { '未対応': 'warning', '対応済': 'success', '対象外': 'neutral' } as const;

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { data: r, loading } = useQuery(api, 'review', { id });
  if (loading) return null;
  if (!r) return <><PageHead crumbs={['配送管理', '要確認', '要確認詳細']} links={{ 1: '/ops/delivery/review' }} title="要確認詳細" /><Card><EmptyState title="要確認が見つかりません"><Link href="/ops/delivery/review">要確認へ戻る ›</Link></EmptyState></Card></>;
  return <Detail key={r.id + r.state} r={r} />;
}

function Detail({ r }: { r: ReviewItem }) {
  const router = useRouter();
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const shelf = r.kind === '消費期限の注意';
  const isMain = r.no === '#142';
  const [how, setHow] = useState(shelf ? 'split' : 'date');
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [keep, setKeep] = useState(true);
  const [err, setErr] = useState<Errors>({});
  const open = r.state === '未対応';

  const close = async (state: '対応済' | '対象外') => {
    if (state === '対応済') {
      const e = checkReviewResolve({ how, date, reason });
      setErr(e);
      if (Object.keys(e).length) return;
    }
    try {
      await api.action('resolveReview', { id: r.id, state, memo: state === '対応済' ? `${how}：${date} ${reason}` : undefined });
      toast(state === '対応済' ? '要確認を対応済みにしました' : '要確認を対象外にしました');
      router.push('/ops/delivery/review');
    } catch (x) { toastError(x); }
  };

  const found = shelf ? '2026-09-26 03:00 ・ 最終検出 10-05 03:00（3回）' : isMain ? '2026-09-24 03:00 ・ 最終検出 10-05 03:00（3回）' : `2026-${r.found} ・ 最終検出 ${r.last}`;
  const target = shelf ? '予定 CP0000287・B3（冷蔵）' : isMain ? '予定 CP0000198・B5（冷蔵）' : r.target;
  const dlv = shelf ? '2026-11-18（水）B3' : isMain ? '2026-11-20（金）B5' : (fullDate('', r.dlv) || r.dlv);
  const tl = shelf
    ? [{ time: '09-26 03:00', who: 'システム', what: '検出（冷蔵の倉庫を関西倉庫へ変更したあとの再計算）' }, { time: '09-28 03:00', who: 'システム', what: '再検出（最終検出を更新）' }, { time: '10-05 03:00', who: 'システム', what: '再検出（最終検出を更新）' }]
    : [{ time: '09-24 03:00', who: 'システム', what: '検出（拠点の受取不可日 11/09〜12/10 の登録後の再計算）' }, { time: '09-26 03:00', who: 'システム', what: '再検出（最終検出を更新）' }, { time: '10-05 03:00', who: 'システム', what: '再検出（最終検出を更新）' }, { time: '09-29 10:05', who: '物流 田中', what: 'メモ：法人に移転後の日程を確認中' }];
  if (r.doneBy) tl.push({ time: r.doneBy.replace('運営 ・ ', ''), who: '運営', what: `${r.state}にしました${r.memo ? `（${r.memo}）` : ''}` });

  return (
    <>
      <PageHead crumbs={['配送管理', '要確認', '要確認詳細']} links={{ 1: '/ops/delivery/review' }}
        title={<>要確認詳細 <span className="es-mono">{r.no ?? r.target}</span></>}
        stat={<><Badge tone={r.tone}>{r.kind}</Badge><span className="k">状態</span><Badge tone={STATE_TONE[r.state]}>{r.state}</Badge><span className="k">検出</span><span>{found}</span></>}
        actions={open && canAct(api, 'resolveReview') ? <><Button variant="outline" onClick={() => close('対象外')}>対象外にする</Button><Button icon="Checks" onClick={() => close('対応済')}>対応して閉じる</Button></> : undefined} />
      {DEMO && !shelf && !isMain && <InlineMessage tone="info">この要確認の詳細はデモでは見本（#142 予定生成不可）の中身を表示しています（区分・対象・法人・拠点・納品日・検出は押した行の値）</InlineMessage>}
      <div className="split wide">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem', minWidth: 0 }}>
          <Card>
            <SectionTitle>内容</SectionTitle>
            <div className="es-formgrid">
              <TextField label="対象" value={target} readOnly />
              <TextField label="法人・拠点" value={r.site} readOnly />
              <TextField label={shelf ? '納品日' : '本来の納品日'} value={dlv} readOnly helper={shelf ? '出荷 11/16（関西倉庫・リードタイム 2日）' : undefined} />
            </div>
            {shelf ? (
              <>
                <InlineMessage tone="warning" title="出荷から納品までの日数が、消費期限の余裕を超えています">11月サイクルから冷蔵のピッキング倉庫を関西倉庫へ変更し、リードタイムが 1日 → 2日 になりました。手作りサンドは 消費期限 3日 − 安全日数 2日 ＝ 1日 までです。自動では分割しません。</InlineMessage>
                <SectionTitle>商品ごとの判定</SectionTitle>
                <div className="es-table-wrap">
                  <table className="es-table compact">
                    <thead><tr><th>商品名</th><th className="r">消費期限</th><th className="r">出荷〜納品</th><th className="r">許せる日数（期限−安全日数）</th><th>判定</th></tr></thead>
                    <tbody>
                      <tr className="att"><td>手作りサンド</td><td className="r es-num">3日</td><td className="r es-num">2日</td><td className="r es-num">1日</td><td><Badge tone="negative">× 1日超える</Badge></td></tr>
                      <tr><td>日替わり惣菜 A</td><td className="r es-num">5日</td><td className="r es-num">2日</td><td className="r es-num">3日</td><td><Badge tone="success">✓ OK</Badge></td></tr>
                      <tr><td>シーザーサラダ</td><td className="r es-num">4日</td><td className="r es-num">2日</td><td className="r es-num">2日</td><td><Badge tone="success">✓ OK</Badge></td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="note">判定するとき：予定の生成・再計算（振替でリードタイムが伸びたとき）、ピッキング倉庫の変更、複製。安全日数は全社共通の設定 1つ（いまは 2日）。</div>
              </>
            ) : (
              <>
                <InlineMessage tone="negative" title="20日以内に納品できる日が見つかりません">本来の納品日 11/20 は拠点の受取不可日（11/09〜12/10 倉庫移転）に当たります。後倒しで20日以内（〜12/10）を探しましたが、すべて受取不可日のため、振り替えられる日がありません。自動では日付を決めません。</InlineMessage>
                <SectionTitle>候補日の検討</SectionTitle>
                <div className="es-table-wrap">
                  <table className="es-table compact">
                    <thead><tr><th>候補日</th><th>ピッキング日</th><th>出荷（関東倉庫）</th><th>受取（拠点）</th><th>リードタイム</th><th>判定</th></tr></thead>
                    <tbody>
                      <tr><td className="es-num">11/19（木）B4</td><td className="es-num">11/18（水）</td><td><Badge tone="success">✓ OK</Badge></td><td><Badge tone="negative">× 受取不可日</Badge></td><td>1日</td><td className="ua">不可</td></tr>
                      <tr><td className="es-num">12/08（火）A2</td><td className="es-num">12/07（月）</td><td><Badge tone="success">✓ OK</Badge></td><td><Badge tone="negative">× 受取不可日</Badge></td><td>1日</td><td className="ua">不可</td></tr>
                      <tr><td className="es-num">11/05（木）D4</td><td className="es-num">11/04（水）</td><td><Badge tone="success">✓ OK</Badge></td><td><Badge tone="success">✓ OK</Badge></td><td>1日</td><td className="part">不可（10月サイクル・確定済み）</td></tr>
                      <tr className="sel"><td className="es-num">12/11（金）A5</td><td className="es-num">12/10（木）</td><td><Badge tone="success">✓ OK</Badge></td><td><Badge tone="success">✓ OK</Badge></td><td>1日</td><td className="part">21日後・12月サイクルの日（要合意）</td></tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}
            {open && (
              <>
                <SectionTitle>対応</SectionTitle>
                <Field label="対応の内容" req>
                  <div className="checks">
                    {(shelf
                      ? [['split', '期限の短い商品だけ関東倉庫の別の便に分ける'], ['wh', 'この回だけ関東倉庫から出す（倉庫の変更を戻す）'], ['keep', 'このまま出荷する（法人と合意済み）']]
                      : [['date', '日付を指定して解決'], ['skip', 'この回は納品しない（スキップ）'], ['ign', '対象外にする']]
                    ).map(([v, l]) => <Radio key={v} name="rs" label={l} checked={how === v} onChange={() => setHow(v)} />)}
                  </div>
                </Field>
                <div className="es-formgrid">
                  <TextField date label={shelf ? '別の便（関東倉庫）の納品日' : '納品日'} req icon="CalendarBlank" value={date} onChange={setDate} error={err.date}
                    helper={shelf ? '出荷日は納品日からリードタイムを引いて決まります' : 'ピッキング日はリードタイムを保って決まります'} />
                  <TextField label="理由" req value={reason} onChange={setReason} error={err.reason} />
                  {!shelf && <Field label="法人への連絡"><Checkbox label="申請履歴と配送カレンダーに理由を残す" checked={keep} onChange={setKeep} /></Field>}
                </div>
                <div className="note">「対応して閉じる」で状態を対応済にし、対応者・日時・メモを残します。{!shelf && '条件が変わって同じ問題が再び起きた場合は、新しい要確認として出ます。'}</div>
              </>
            )}
          </Card>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem', minWidth: 0 }}>
          <Card>
            <SectionTitle>検出と対応の履歴</SectionTitle>
            <Timeline compact items={tl} />
          </Card>
          <Card>
            <SectionTitle>関連</SectionTitle>
            {shelf ? (
              <>
                <div className="rv">スケジュール日表示（11/16）<Link href="/ops/delivery/schedule?view=day&d=2026-11-17" style={{ marginLeft: 'auto' }}>開く ›</Link></div>
                <div className="rv">契約配送設定（CP0000287）<Link href="/ops/contracts" style={{ marginLeft: 'auto' }}>開く ›</Link></div>
                <div className="rv">商品マスタ（消費期限日数）<Link href="/ops/masters/products" style={{ marginLeft: 'auto' }}>開く ›</Link></div>
              </>
            ) : (
              <>
                <div className="rv">拠点の受取不可日（倉庫移転）<Link href="/ops/branches" style={{ marginLeft: 'auto' }}>開く ›</Link></div>
                <div className="rv">スケジュール日表示（11/19）<Link href="/ops/delivery/schedule?view=day&d=2026-11-17" style={{ marginLeft: 'auto' }}>開く ›</Link></div>
                <div className="rv">配送サイクル設定<Link href="/ops/delivery/schedule/cycle" style={{ marginLeft: 'auto' }}>開く ›</Link></div>
              </>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
