'use client';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { crOpen, md, ymdW } from '@/lib/corp/delivery/logic';
import { buildDeliveryNote } from '@/lib/corp/delivery/note';
import { downloadNotePdf } from '@/lib/corp/delivery/notePdf';
import { today } from '@/lib/supplier/dates';
import { deliveryFrom, type DeliveryFrom } from '@/lib/corp/menu';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, ConfirmDialog, EmptyState, EsIcon, InlineMessage, Loading, NotFound, Page, PageHead, ReadField, SectionTitle, useWho } from '../../_delivery/kit';
import ChangeRequestModal from '../_components/ChangeRequestModal';
import LoadError from '../_components/LoadError';
import RoBanner from '../_components/RoBanner';
import { fmtDate, fmtDateTime } from '@/lib/format/date';
import TrackingNo from '@/components/TrackingNo';

/*
 * お届け詳細（CW_DLV・版1.1）。一部お届け済み・お届け済み・出荷待・予定・別の日のご提案あり。
 * 予定のお届けは、ご注文・変更の締切までお届け日の変更を申請できる（解約後（参照のみ）は申請できない：Q-C2）。別の日のご提案には「受ける」「お断りする」で返事する。
 * 確定（出荷待）以降の便（資材便を除く）は「納品書（PDF）」を便ごとに出せる（No.17・新しいタブ）。申請の履歴は表（No.8）で、申請中の行は「取り下げる」（No.8.1）。
 */
const api = areaApi(corpDelivery);

/** 開いた元（?from=。台帳 2026-10-05・受付簿 No.157）：パンくず・戻るボタン。サイドメニューは lib/corp/menu.ts の corpActive。なし・不明は ホーム */
const ORIGIN: Record<DeliveryFrom, { crumbs: string[]; links: Record<number, string>; back: string; backLabel: string }> = {
  home: { crumbs: ['ホーム', 'お届け詳細'], links: { 0: '/corp' }, back: '/corp', backLabel: 'カレンダーへ戻る' },
  requests: { crumbs: ['申請', 'お届け日の変更申請', 'お届け詳細'], links: { 1: '/corp/requests' }, back: '/corp/requests', backLabel: '申請の一覧へ戻る' },
  news: { crumbs: ['ホーム', 'お知らせ一覧', 'お届け詳細'], links: { 0: '/corp', 1: '/corp/news' }, back: '/corp/news', backLabel: 'お知らせ一覧へ戻る' },
};
/** URL の ID（壊れた % があっても落ちない） */
const idOf = (raw: string) => { try { return decodeURIComponent(raw); } catch { return raw; } };

export default function DeliveryDetailPage() {
  /* useSearchParams は Suspense の中で使う */
  return <Suspense fallback={<Page><Loading /></Page>}><DeliveryDetail /></Suspense>;
}

function DeliveryDetail() {
  const { id } = useParams<{ id: string }>();
  const org = ORIGIN[deliveryFrom(useSearchParams().get('from'))];
  const { toast, toastError, view } = useCorpSignedIn();
  const who = useWho();
  const router = useRouter();
  /* 解約後（参照のみ）：書き込みはサーバーも断る（ro を渡す） */
  const ro = view === 'ro';
  const { data, loading, error, reload } = useQuery(api, 'delivery', { ...who, id: idOf(id) });
  const [pdfBusy, setPdfBusy] = useState(false);
  const [modal, setModal] = useState(false);
  const [decline, setDecline] = useState(false);
  const [withdraw, setWithdraw] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const head = <PageHead crumbs={org.crumbs} links={org.links} title="お届け詳細" />;
  if (loading) return <Page>{head}<Loading /></Page>;
  /* 通信の失敗は「見つかりません」（I204）と別に出す（E346）。ない番号・見られないお届けだけ I204 */
  if (error && !data) return <Page>{head}<RoBanner /><LoadError onRetry={reload} /></Page>;
  if (!data) return <Page>{head}<RoBanner /><NotFound title="お届けが見つかりません。" back={org.back} backLabel={org.backLabel} /></Page>;

  const r = data;
  const canApply = r.canApply && !ro;
  const cr = r.active;
  const crDecl = cr?.status === 'お断り済（ESキッチンで調整中）';
  const crDue = cr?.proposal?.deadline.split('（')[0] ?? '';
  const accept = async () => {
    if (!cr || busy) return;
    setBusy(true);
    try {
      const out = await api.action('acceptProposal', { ...who, ro, id: cr.id });
      router.push('/corp/requests');
      toast(out.msg);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  const doDecline = async () => {
    if (!cr || busy) return;
    setDecline(false);
    setBusy(true);
    try {
      const out = await api.action('declineProposal', { ...who, ro, id: cr.id });
      window.scrollTo(0, 0);
      toast(out.msg);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  /* 8.1 取り下げる（Q201 で確認 → S211） */
  const doWithdraw = async () => {
    if (!withdraw || busy) return;
    const crId = withdraw;
    setWithdraw(null);
    setBusy(true);   /* 二重に取り下げない */
    try {
      const out = await api.action('withdrawDateChange', { ...who, ro, id: crId });
      toast(out.msg);
    } catch (e) { toastError(e); } finally { setBusy(false); }
  };
  /* 17 納品書（PDF）：便ごとの納品書を PDF ファイルとして直接ダウンロードする（ブラウザの印刷画面は経由しない・台帳 F 版 1.1 レビュー①）。できなければ E306 */
  const openNote = async () => {
    if (pdfBusy) return;
    setPdfBusy(true);
    try {
      await downloadNotePdf(buildDeliveryNote(r, today().replace(/\//g, '-')));
      toast('納品書（PDF）を出力しました。');
    } catch {
      toast('納品書を出力できませんでした。時間をおいて再度お試しください。');
    } finally { setPdfBusy(false); }
  };
  const applyBtn = (style?: React.CSSProperties) => (
    <a className="es-btn es-btn--solid es-btn--primary es-btn--md" href="#" style={style} onClick={(e) => { e.preventDefault(); setModal(true); }}>お届け日の変更を申請</a>
  );
  const carrier = r.track[0]?.carrier || '運送会社';

  return (
    <Page>
      <PageHead
        crumbs={org.crumbs} links={org.links}
        title={<>お届け詳細 <span className="es-mono">{r.id}</span></>}
        stat={<>
          <span>{r.siteName} ・ {r.cycle}</span>
          <span className="k">状態</span><Badge tone={r.tone}>{r.st}</Badge>
          {cr && !crDecl && <Badge tone="warning">別の日のご提案</Badge>}
        </>}
        actions={<>
          <Link className="es-btn es-btn--outline es-btn--primary es-btn--md" href={org.back}>{org.backLabel}</Link>
          {r.canPdf && (
            <a className="es-btn es-btn--outline es-btn--primary es-btn--md" href="#"
              title="この便の納品書（A4・PDF・金額なし）をファイルとして保存します。資材のお届けには出しません"
              onClick={(e) => { e.preventDefault(); openNote(); }}>納品書（PDF）</a>
          )}
          {canApply && applyBtn()}
        </>}
      />

      <RoBanner />
      {r.msg && <InlineMessage tone={r.msg.tone} title={r.msg.title}>{r.msg.text}</InlineMessage>}

      {cr?.proposal && (
        <section className="crb" aria-label="お届け日の変更申請">
          <div className="crb__h">
            <EsIcon name="ClockCountdown" size={22} />
            <h3>お届け日の変更申請 <span className="es-mono">{cr.id}</span></h3>
            <Badge tone={crDecl ? 'neutral' : 'warning'}>{cr.status}</Badge>
            <span className="crb__meta">申請日 {ymdW(cr.at.replace(/\//g, '-'))} ・ ご返事の期限 <b>{fmtDate(cr.proposal.deadline)}</b></span>
          </div>
          <div className="crb__dates">
            <div className="crb__box"><small>今のお届け日</small><b>{ymdW(cr.cur)}</b><span>ご返事までは、この日のままです</span></div>
            <div className="crb__arrow"><EsIcon name="CaretRight" /></div>
            <div className="crb__box"><small>ご希望の日</small><b>{cr.wants[0] ? ymdW(cr.wants[0]) : '希望日なし'}</b><span>お受けできませんでした</span></div>
            <div className="crb__box is-new"><small>ESキッチンからのご提案</small><b>{ymdW(cr.proposal.date)}</b><span>{cr.proposal.note}</span></div>
          </div>
          <div className="crb__row"><span className="k">ESキッチンから</span><span>{cr.proposal.msg}</span></div>
          {ro ? (
            <div className="crb__f"><span className="note">ご契約が終了しているため、この画面からはご返事できません。ESキッチンへお問い合わせください。</span></div>
          ) : !crDecl ? (
            <div className="crb__f">
              <span className="note">ご返事がない場合は、期限の後にESキッチンが決めてご連絡します。お断りの場合も、ESキッチンからご連絡します。</span>
              <Button variant="outline" tone="negative" onClick={() => setDecline(true)}>お断りする</Button>
              <Button onClick={accept} disabled={busy}>{md(cr.proposal.date)} で受ける</Button>
            </div>
          ) : (
            <div className="crb__f">
              <span className="note">ご提案をお断りしました（{fmtDateTime(cr.declinedAt)}）。ESキッチンが別の日を調整して、ご返事の期限（{fmtDate(crDue)}）までにご連絡します。それまでのお届け日は {ymdW(cr.cur)} のままです。</span>
            </div>
          )}
        </section>
      )}

      <div className="split wide">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem', minWidth: 0 }}>
          <Card>
            <SectionTitle>お届けの予定</SectionTitle>
            <div className="es-formgrid">
              <ReadField label="お届け日（着予定日）" value={r.date} helper={r.dateHelper} />
              <ReadField label="温度帯・お届け方法" value={r.kindText} />
            </div>
          </Card>

          <Card>
            <SectionTitle>{r.itemsTitle}</SectionTitle>
            {r.temp === '資材' ? (
              <div className="note">{r.noItemsText}</div>
            ) : r.plan ? (
              <EmptyState compact title="数量はまだ決まっていません" icon="ClockCountdown">{r.noItemsText}</EmptyState>
            ) : (
              <div className="es-table-wrap">
                <table className="es-table dl-items">
                  <thead><tr><th>商品名</th><th className="r">ご注文数</th><th className="r">お届け数</th><th className="r">差</th><th>備考</th></tr></thead>
                  <tbody>
                    {r.items.map((q, i) => (
                      <tr key={i}><td>{q.n}{q.nEn ? <div className="dl-en">{q.nEn}</div> : null}</td><td className="r es-num">{q.o}</td><td className="r es-num">{q.f}</td><td className={`r es-num ${q.dCls}`}>{q.diff}</td><td className="w">{q.note}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle>お届けの状況</SectionTitle>
            {r.doneAt ? (
              <div className="es-formgrid">
                <ReadField label="お届け完了" value={r.doneAt} />
                <ReadField label="受け取った方" value={r.receiver ?? ''} />
                <ReadField label="集金" value={r.collected ?? ''} />
              </div>
            ) : (
              <EmptyState compact title={r.noResultTitle ?? 'まだお届けしていません'} icon="ClockCountdown">{r.noResultText}</EmptyState>
            )}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.142857rem', minWidth: 0 }}>
          <Card>
            <SectionTitle>送り状番号</SectionTitle>
            {r.track.length ? (
              <>
                {r.track.map((tk) => (
                  <div key={tk.no} className="rv" style={{ flexWrap: 'wrap', gap: '0.571429rem' }}>
                    <TrackingNo no={tk.no} url={tk.url} carrier={tk.carrier || '運送会社'} /><span className="c" style={{ fontWeight: 400 }}>{tk.box}</span>
                  </div>
                ))}
                <div className="note">配送の途中の状況は、運送会社（{carrier}）の追跡ページで確認できます。追跡ページに番号が入っていないときは、コピーした送り状番号を貼り付けてください。</div>
              </>
            ) : <div className="note">{r.noTrackText}</div>}
          </Card>

          {r.related.length > 0 && (
            <Card>
              <SectionTitle>関連するお届け</SectionTitle>
              {r.related.map((x) => (
                <div key={x.id} className="rv" style={{ flexWrap: 'wrap', rowGap: '0.285714rem' }}><span className="es-mono">{x.id}</span><Badge tone={x.tone}>{x.st}</Badge><span style={{ flex: '1 1 100%', color: 'var(--text-middle)' }}>{x.text}</span></div>
              ))}
            </Card>
          )}
        </div>
      </div>

      <Card>
        <SectionTitle>お届け日の変更申請</SectionTitle>
        {canApply ? (
          <>
            <div className="note">このお届けは予定です。ご注文・変更の締切（{md(r.deadline!.replace(/\//g, '-'))}）まで、お届け日の変更を申請できます。ESキッチンが確認して、承認・別の日のご提案・お断りのいずれかでお返事します。</div>
            {applyBtn({ alignSelf: 'flex-start' })}
          </>
        ) : <div className="note">{r.canApply && ro ? 'ご契約が終了しているため、お届け日の変更は申請できません。' : r.noApplyText}</div>}
        {/* 8 申請の履歴（表）：申請番号・申請日・第一希望・第二希望・理由・状態・ご返事の期限。申請中の行は「取り下げる」 */}
        {r.hist.length ? (
          <div className="es-table-wrap">
            <table className="es-table crt">
              <thead><tr><th>申請番号</th><th>申請日</th><th>第一希望</th><th>第二希望</th><th>理由</th><th>状態</th><th>ご返事の期限</th><th aria-label="操作" /></tr></thead>
              <tbody>
                {r.hist.map((c) => (
                  <tr key={c.id}>
                    <td className="es-mono">{c.id}</td>
                    <td className="es-num">{c.at.replace(/\//g, '-')}</td>
                    <td>{c.wants[0] ? ymdW(c.wants[0]) : '希望日なし'}</td>
                    <td>{c.wants[1] ? ymdW(c.wants[1]) : '—'}</td>
                    <td className="crt__reason">
                      <span className="clamp2" title={c.reason}>{c.reason}</span>
                      {c.status === '否認' && c.reply && c.reply !== '—' && <span className="note">お断りの理由：{c.reply}です。</span>}
                    </td>
                    <td><Badge tone={c.tone}>{c.status}</Badge></td>
                    <td className="es-num">{crOpen(c.status) && c.limit ? c.limit : '—'}</td>
                    <td className="r">{c.canWithdraw && !ro && <Button variant="outline" tone="neutral" size="sm" onClick={() => setWithdraw(c.id)}>取り下げる</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="note">申請はありません</div>}
      </Card>

      {modal && <ChangeRequestModal d={r} onClose={() => setModal(false)} />}
      {withdraw && (
        <ConfirmDialog title="申請を取り下げますか？" body={['取り下げると元に戻せません。', `取り下げたあとは、ご注文・変更の締切まで、もう一度お届け日の変更を申請できます（申請番号 ${withdraw}）。`]}
          ok="取り下げる" onOk={doWithdraw} onCancel={() => setWithdraw(null)} />
      )}
      {decline && cr?.proposal && (
        <ConfirmDialog
          title="ご提案をお断りしますか？"
          body={[
            `ESキッチンからのご提案（${ymdW(cr.proposal.date)}）をお断りします。お断りした後は取り消せません。`,
            `ESキッチンが別の日を調整して、ご返事の期限（${fmtDate(crDue)}）までにご連絡します。それまでのお届け日は ${ymdW(cr.cur)} のままです。`,
          ]}
          ok="お断りする" onOk={doDecline} onCancel={() => setDecline(false)}
        />
      )}
    </Page>
  );
}
