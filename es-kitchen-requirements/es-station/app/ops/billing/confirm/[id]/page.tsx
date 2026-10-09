'use client';

import { DEMO } from '@/lib/demo';
import { mergeByGroup, planLineName } from '@/lib/domain/invoiceTax';

import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { addM, taxSplit, yen, type BillingLogic, type GroupView } from '@/lib/ops/billing/logic';
import { LEADLBL } from '@/lib/ops/billing/masters';
import type { InvLine } from '@/lib/ops/billing/types';
import type { InvoiceSend, InvoiceSendStatus } from '@/lib/domain/types';
import { Btn, Card, Foot, Inline, Meta, PageHead, SumGrid, Table, Tabs, Tag, useAsk } from '../../_components/ds';
import { useInvoiceOps } from '../../_components/useInvoiceOps';
import { R, pLabel, useBilling } from '../../_components/useBilling';
import { useScreenCan } from '../../../_ui/perm';
import { fmtDate, fmtDateTime, fmtYm } from '@/lib/format/date';

/** 請求書詳細（1通の請求書：子契約の確定・先月との比較・請求書の明細）。元の vGrp と nextBox・gTabs */
export default function GroupPage() {
  return <Suspense><GroupDetail /></Suspense>;
}

/** Bill One の送付の状態の色 */
const SEND_TONE: Record<InvoiceSendStatus, string> = { 送付待ち: 'wait', 送付済: 'info', 開封済: 'ok', エラー: 'no' };

/**
 * Bill One の送付の状態と記録（課題 0-2：外部には送らず状態だけ。デモの操作で進める）。
 * 送付待ち → 送付済 → 開封済、届かなければ エラー（再送で 送付待ち）
 */
function SendCard({ id, send }: { id: string; send?: InvoiceSend }) {
  const { run, can } = useBilling();
  /* 送付の記録がない請求書（以前の DB）は送付待ちとして扱う */
  const st = send?.status ?? '送付待ち';
  const next = st === '送付待ち' ? '送付済にする' : st === '送付済' ? '開封済にする' : st === 'エラー' ? '再送する（送付待ちへ）' : '';
  return (
    <Card title="Bill One の送付" right={<Tag c={SEND_TONE[st]}>{st}</Tag>}>
      <Table>
        <thead><tr><th>日時</th><th>状態</th><th>内容</th></tr></thead>
        <tbody>{(send?.log ?? []).slice().reverse().map((l, n) => <tr key={n}><td className="es-num">{fmtDateTime(l.at)}</td><td><Tag c={SEND_TONE[l.status]}>{l.status}</Tag></td><td>{l.note}</td></tr>)}</tbody>
      </Table>
      <Foot>
        <div className="small">デモ：Bill One とはつないでいません。右のボタンで送付の状態を進めます（法人Web の請求書にも同じ状態が出ます）。</div>
        <span style={{ display: 'inline-flex', gap: '0.428571rem' }}>
          {/* 権限がなければ出さない */}
          {can('advanceSend') && (st === '送付待ち' || st === '送付済') && <Btn sm kind="red" onClick={() => run('advanceSend', { id, to: 'エラー' })}>送付エラーにする</Btn>}
          {can('advanceSend') && next && <Btn sm kind="pri" onClick={() => run('advanceSend', { id })}>{next}（デモ）</Btn>}
        </span>
      </Foot>
    </Card>
  );
}

const lineTone = (k: InvLine['k']) => (k === '前払い' ? 'info' : k === '後払い' ? 'wait' : k === '繰越' ? 'no' : 'pur');

function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const { L } = useBilling();
  if (!L) return null;
  const x = L.findGroup(decodeURIComponent(id), sp.get('m') || undefined);
  if (!x) return <Inline tone="warning">請求書が見つかりません。</Inline>;
  return <Group key={x.key} L={L} x={x} />;
}

function Group({ L, x }: { L: BillingLogic; x: GroupView }) {
  const router = useRouter();
  const ask = useAsk();
  const { run, can } = useBilling();
  const screenCan = useScreenCan();
  const ops = useInvoiceOps(L);
  const [tab, setTab] = useState<'sub' | 'cmp' | 'lines'>(x.i ? 'lines' : 'sub');
  const gtab = x.past && tab === 'cmp' ? 'sub' : tab;
  const m = x.m;
  const c = x.g.c, b0 = x.g.bid ? L.br(x.g.bid) ?? null : null, i = x.i, past = x.past;
  const nm = b0 ? `${c.id ? c.name + ' ／ ' : ''}${b0.name}` : c.name;
  const act = x.g.bs.filter((b) => past || b.actOK).length;
  const cur = act < x.n ? 1 : x.ok < x.n ? 2 : !i || i.status === 'WITHDRAWN' ? 3 : i.status === 'REGISTERED' ? 4 : 5;
  const D = Object.fromEntries(past ? [] : x.g.bs.map((b) => [b.id, L.diffRows(b)]));
  const nch = past ? 0 : x.g.bs.reduce((a, b) => a + (D[b.id] ? D[b.id].n : 0), 0);
  const canAll = past ? [] : x.g.bs.filter((b) => b.actOK && !b.fixOK && !L.editLock(b)).map((b) => b.id);

  /* 明細（作成前は、確定済みの子契約から見込み） */
  let lines: InvLine[] = [], isPrev = false;
  if (i) lines = i.lines;
  else if (!past) { isPrev = true; lines = L.invLines(x.g.bs.filter((b) => L.brOK(b) && !L.billedNow(b))); }
  const ts = taxSplit(lines);
  const ps = i ? L.payStatus(i) : null;
  const tgt = i && L.isUnpaid(i) ? L.S.invoices.find((t) => (t.m || L.month) === L.month && t.co === i.co && (!i.br || !t.br || t.br === i.br) && t.status !== 'WITHDRAWN') : null;
  const rq = past ? [] : L.carryFor(x.g), rqSum = rq.reduce((a, u) => a + L.invRest(u), 0);

  const withdraw = (id: string) => ask({
    title: `請求書 ${id} を取消して再発行しますか？`,
    body: `Bill One で請求書 ${id} の取消は済みましたか？ ES では ${id} を「取消」にして、新しい請求書番号で作り直します（Bill One の取消は Bill One の画面で行います）。`,
    onOk: () => { run('withdraw', { id }); },
  });
  /* 権限がなければ出さない */
  const mark = (id: string, v: boolean, pri?: boolean) => !can('markUnpaid') ? null : <Btn kind={pri ? 'pri' : undefined} onClick={() => run('markUnpaid', { id, v })}>{v ? '当月の請求書で再請求する' : '再請求の指定を外す'}</Btn>;
  const acts = past
    ? (i && i.status === 'DISPATCHED' && !i.carriedTo && L.canMark(i) ? mark(i.id, !i.unpaid, !i.unpaid) : null)
    : !i ? (x.st.k === 'ready' && can('makeInvoice') ? <Btn kind="pri" onClick={() => ops.askMake(c.id, x.g.bid)}>{x.amt === 0 ? '0円の請求書を出力' : '請求書を作成'}</Btn> : null)
      : i.status === 'REGISTERED' ? <>{screenCan('update') && <Btn onClick={() => router.push(R.invE(i.id))}>明細を編集</Btn>}{can('dispatch') && <Btn kind="pri" onClick={() => ops.dispatch(i.id)}>Bill One で発行{DEMO ? '（デモ）' : ''}</Btn>}</>
        : i.status === 'DISPATCHED' && !i.carriedTo ? <>{L.canMark(i) && mark(i.id, !i.unpaid)}{can('withdraw') && <Btn kind="red" onClick={() => withdraw(i.id)}>取消して再発行</Btn>}</> : null;

  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '請求の確定・請求書', href: R.cfm }, { t: '請求書詳細' }]} title="請求書詳細" id={i?.id} actions={acts ?? undefined} />
      <Meta>
        <Tag c={x.st.tone}>{x.st.label}</Tag>{ps && ps[1] !== '—' && <Tag c={ps[0]}>{ps[1]}</Tag>}
        {(i?.final || b0?.final) && <Tag c="no">最終請求書（解約）</Tag>}
        <Tag>{nm}</Tag><Tag>{!b0 ? 'まとめて発行（法人1通）' : '拠点で1通'}</Tag>
        {c.id && <Tag>{LEADLBL[c.lead]}</Tag>}<Tag>締め {m}</Tag><Tag>発行 {addM(m, 1)}-01</Tag>
        {i && <Tag>入金期限 {fmtDate(i.due)}</Tag>}
        {i?.send && <Tag c={SEND_TONE[i.send.status]}>Bill One：{i.send.status}</Tag>}
      </Meta>
      {past ? <Inline>{pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline> : <Stage cur={cur} />}
      <NextBox L={L} x={x} />
      {i && (i.send || i.status === 'DISPATCHED') && <SendCard id={i.id} send={i.send} />}
      {i && i.carriedTo && (
        <Inline><b>この請求書の {yen(L.invRest(i))} は {i.carriedTo} で再請求しています。</b>
          <span style={{ display: 'inline-flex', gap: '0.428571rem', marginLeft: '0.571429rem' }}><Btn sm onClick={() => router.push(R.grp(i.carriedTo!))}>再請求した請求書を開く</Btn>{can('unCarry') && <Btn sm kind="red" onClick={() => run('unCarry', { from: i.id })}>再請求を取り下げる</Btn>}</span>
          <div className="small" style={{ marginTop: '0.285714rem' }}>入金が分かったら、再請求を載せた請求書の発行前に取り下げて、必要なら正しい内容で再請求し直します。</div></Inline>
      )}
      {!past && !i && rq.length > 0 && <Inline>再請求を指定した前月以前の請求書（{rq.map((u) => u.id).join('・')}／{yen(rqSum)}）は、<b>この請求書を作成するときに自動で加わります</b>（税込のまま・再課税なし）。</Inline>}
      {!past && i && i.status === 'REGISTERED' && rq.length > 0 && (
        <Inline tone="warning">再請求を指定した請求書 {rq.map((u) => u.id).join('・')}（{yen(rqSum)}）がまだ加わっていません。{can('addCarries') && <Btn sm kind="pri" onClick={() => run('addCarries', { id: i.id })}>この請求書に加える</Btn>}</Inline>
      )}
      {i && L.isUnpaid(i) && (
        <Inline tone="warning"><b>当月の請求書で再請求するよう指定しています（{fmtDateTime(i.unpaidAt)}）。</b>
          {tgt && tgt.status === 'REGISTERED' ? (can('carryOver') && <Btn sm kind="pri" onClick={() => run('carryOver', { from: i.id, to: tgt.id })}>{tgt.id} に加える</Btn>)
            : tgt ? '当月の請求書は発行済みのため、翌月の請求書を作成するときに加わります。' : '当月の請求書を作成するときに自動で加わります。'}</Inline>
      )}
      {i && past && i.status === 'DISPATCHED' && !i.carriedTo && !i.unpaid && L.canMark(i) && (
        <Inline>システムは入金を確認できません。<b>Bill One で入金がないことを確かめたとき</b>だけ、右上の「当月の請求書で再請求する」を押してください。当月の請求書に税込のまま（再課税なし）1行で加わります。</Inline>
      )}
      {!past && i && i.status === 'REGISTERED' && i.lines.some((l) => l.k === '繰越') && (
        <Inline><b>この請求書には前月以前の未入金分の再請求が載っています：</b>
          {i.lines.filter((l) => l.k === '繰越').map((l, n) => <span key={n}>{n > 0 && '・'}{l.from}（{yen(l.a)}）{can('unCarry') && <Btn sm kind="red" onClick={() => run('unCarry', { from: l.from! })}>再請求を取り下げる</Btn>}</span>)}
          <div className="small" style={{ marginTop: '0.285714rem' }}>発行の前なら取り下げられます（取り下げると行が消え、元の請求書は「未入金（再請求なし）」に戻ります）。入金が分かったら取り下げて、必要なら正しい内容で再請求し直してください。</div></Inline>
      )}
      <SumGrid items={[
        { k: '子契約の確定', v: `${x.ok} / ${x.n}件`, s: x.blocked ? `実績精算 未確定 ${x.blocked}件（翌月の請求書で精算）` : ' ' },
        { k: '小計（税抜）', v: yen(i ? i.net : ts.net), s: i ? '請求書の金額' : '確定済みの子契約の見込み' },
        { k: '消費税', v: yen(i ? i.tax : ts.tax), s: '税率ごとに四捨五入' },
        { k: '請求金額（税込）', v: yen(i ? i.total : ts.tot), s: i ? `入金期限 ${fmtDate(i.due)}` : '作成すると確定します' },
      ]} />
      <Tabs cur={gtab} onPick={setTab} items={[
        { k: 'sub' as const, label: `子契約の確定（${x.ok}/${x.n}）` },
        ...(past ? [] : [{ k: 'cmp' as const, label: `先月との比較${nch ? `（変更 ${nch}件）` : ''}` }]),
        { k: 'lines' as const, label: `請求書の明細${i ? '' : '（見込み）'}` },
      ]} />

      {gtab === 'sub' && (
        <Card title="子契約の確定" right={`後払い ${act} / ${x.n}件 ・ 前払い ${x.ok} / ${x.n}件`}>
          <Table>
            <thead><tr><th>子契約番号</th><th>拠点</th><th className="r">後払い（実績精算）</th><th className="c">① 後払い</th><th className="r">前払い（固定額）</th><th className="r">調整</th><th className="r">合計（税抜）</th><th className="c">② 前払い</th><th className="c">操作</th></tr></thead>
            <tbody>
              {x.g.bs.map((b) => {
                if (past) {
                  const mo = L.monthOf(b, m);
                  return (
                    <tr key={b.id}><td><Link className="es-mono" href={R.sub(b.id, m)}>{L.subNo(b, m)}</Link></td><td>{b.name}</td>
                      <td className="r es-num">{yen(mo?.arr || 0)}</td><td className="c"><Tag c="ok">確定</Tag></td>
                      <td className="r es-num">{yen(mo?.adv || 0)}<div className="small">{mo?.tgt ? `${fmtYm(mo.tgt)}分` : ''}</div></td><td className="r es-num">{mo?.adj ? yen(mo.adj) : '—'}</td>
                      <td className="r es-num"><b>{yen((mo?.adv || 0) + (mo?.arr || 0) + (mo?.adj || 0))}</b></td><td className="c"><Tag c="ok">確定</Tag></td><td /></tr>
                  );
                }
                const billed = L.billedNow(b), d = D[b.id];
                return (
                  <tr key={b.id} className={d.n ? 'bl-chg' : undefined}>
                    <td><Link className="es-mono" href={R.sub(b.id)}>{L.subNo(b, L.month)}</Link>{d.n > 0 && <div><Tag c="wait">先月から変更 {d.n}</Tag></div>}</td>
                    <td>{b.name}{d.planCh && <div className="small" style={{ color: 'var(--warning-800,#8a5a00)' }}>{d.planCh}</div>}</td>
                    <td className="r es-num">{yen(L.arrTot(b))}</td>
                    <td className="c">{b.actOK ? <Tag c="ok">確定</Tag> : <Link href={R.actD(b.id)}><Tag c="wait">未確定</Tag></Link>}</td>
                    <td className="r es-num">{yen(L.advTot(b))}<div className="small">{`${fmtYm(L.tgtM(b))}分`}</div></td>
                    <td className="r es-num">{L.adjTot(b) ? yen(L.adjTot(b)) : '—'}</td>
                    <td className="r es-num"><b>{yen(L.brTot(b))}</b></td>
                    <td className="c">{billed ? <Tag c="info">請求書に計上</Tag> : b.fixOK ? <Tag c="ok">確定</Tag> : <Tag>未確定</Tag>}</td>
                    <td className="c" style={{ whiteSpace: 'nowrap' }}>
                      {/* 権限がなければ出さない */}
                      {!billed && (b.fixOK ? (can('setFix') && <Btn sm kind="red" onClick={() => run('setFix', { id: b.id, v: false })}>確定を解除</Btn>)
                        : b.actOK ? (can('confirmFix') && <Btn sm kind="pri" onClick={() => run('confirmFix', { id: b.id })}>前払いを確定</Btn>)
                          : (screenCan('update') && <Btn sm onClick={() => router.push(R.actE(b.id))}>先に後払いを確定</Btn>))}
                      {!billed && !b.fixOK && screenCan('update') && <> <Btn sm onClick={() => router.push(R.subE(b.id))}>調整を追加</Btn></>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          <Foot>
            <div className="small">① 後払い（実績精算・前月21日〜当月20日）は<b>実績精算の画面</b>で確定します。② 前払い（プラン・オプション・設備の対象月分）と調整は、<b>「先月との比較」タブ</b>で確かめて、ここで確定します。
              色の付いた行は先月から変わった子契約です。調整（今月だけの費用・毎月続く費用）は「調整を追加」から子契約の請求詳細「③ 調整」で登録します。</div>
            {canAll.length > 1 && can('confirmAllFix') && <Btn kind="pri" onClick={() => ops.confirmAllFix(canAll)}>前払いを確定できる {canAll.length}件をまとめて確定</Btn>}
          </Foot>
        </Card>
      )}

      {gtab === 'cmp' && !past && (
        <Card title="前払い・調整の内訳（先月との比較）" right={`先月＝締め ${addM(L.month, -1)} に確定した内容`}>
          <Table>
            <thead><tr><th>子契約</th><th>費目</th><th>区分</th><th className="r">先月</th><th className="r">今月</th><th className="r">差</th><th className="c">変化</th></tr></thead>
            <tbody>
              {x.g.bs.flatMap((b) => D[b.id].rows.map((r, k) => (
                <tr key={b.id + k} className={r.ch ? 'bl-chg' : undefined}>
                  {k === 0 && <td rowSpan={D[b.id].rows.length} style={{ verticalAlign: 'top' }}><b>{b.name}</b><div className="small es-mono">{L.subNo(b, L.month)}</div>{D[b.id].planCh && <div className="small" style={{ color: 'var(--warning-800,#8a5a00)' }}>{D[b.id].planCh}</div>}</td>}
                  <td>{r.n}{r.note && <div className="small">{r.note}</div>}</td>
                  <td><Tag c={r.adj ? (r.kind === '今月のみ' ? 'pur' : 'info') : r.kind.startsWith('年一括') ? 'pur' : 'mut'}>{r.kind}</Tag></td>
                  <td className="r es-num">{r.prev === undefined ? <span className="dim">—</span> : yen(r.prev)}</td><td className="r es-num">{yen(r.cur)}</td>
                  <td className="r es-num" style={r.diff ? { fontWeight: 700, color: r.diff > 0 ? '#c02339' : '#0d7a55' } : undefined}>{r.diff ? (r.diff > 0 ? '＋' : '−') + yen(Math.abs(r.diff)) : <span className="dim">0</span>}</td>
                  <td className="c">{r.ch ? <Tag c={r.ch === '追加' ? 'info' : r.ch === '終了' ? 'no' : 'wait'}>{r.ch}</Tag> : <span className="dim">—</span>}</td>
                </tr>
              )))}
            </tbody>
          </Table>
          <Foot><div className="small">区分：<b>毎月</b>＝毎月同じ額で続く／<b>年一括（12ヶ月分）</b>＝12ヶ月に1回だけ請求（その間は「前払い済み」で0円）／<b>今月のみ</b>＝この月だけの調整・スポット費用／<b>毎月（繰越）</b>＝終了月まで毎月続く調整／<b>値引き</b>＝値引きマスタから毎月。
            プラン・オプション・設備そのものを変えるときは法人・契約の子契約で、今月の金額だけを足し引きするときは「③ 調整」で行います。</div></Foot>
        </Card>
      )}

      {gtab === 'lines' && (
        <>
          <Card title="請求書の明細" right={isPrev ? '見込み（作成前）' : i ? i.status : ''}>
            {isPrev && lines.length > 0 && (
              <div><div className="small">「請求書を作成」を押すと、この内容で Bill One に登録します（確定済みの子契約 {x.g.bs.filter((b) => L.brOK(b) && !L.billedNow(b)).length}件分）。品名は PDF に印字されます。</div>
                {x.amt === 0 && <Inline tone="warning" style={{ marginTop: '0.571429rem' }}>請求額が0円です。0円でも請求書を出力できます。発行するかどうかは運営が判断します。</Inline>}</div>
            )}
            {lines.length ? (
              <Table>
                <thead><tr><th className="c">#</th><th>拠点</th><th>品名</th><th>区分</th><th className="c">税率</th><th className="r">金額（税抜）</th></tr></thead>
                <tbody>{/* 福利厚生の適用 OFF のプラン料金の2行は1行にまとめて出す（28-150） */
                  mergeByGroup(lines.map((l) => ({ ...l, rates: l.t ? `${l.t}%` : '' })), (l) => l.mg, (xs) => ({ ...xs[0], n: planLineName(xs[0].n), a: xs.reduce((s, y) => s + y.a, 0), rates: xs.map((y) => `${y.t}%`).join('・') }))
                    .map((l, n) => <tr key={n}><td className="c">{n + 1}</td><td>{l.br}</td><td>{l.n}</td><td><Tag c={lineTone(l.k)}>{l.k}</Tag></td><td className="c">{l.rates || <span className="dim">—</span>}</td><td className="r es-num">{yen(l.a)}</td></tr>)}</tbody>
                <tfoot>
                  <tr><td colSpan={5} style={{ fontWeight: 400 }}>小計（税抜）</td><td className="r es-num">{yen(ts.net)}</td></tr>
                  <tr><td colSpan={5} style={{ fontWeight: 400 }}>消費税 {ts.by.map((b) => `${b.r}%（対象 ${yen(b.t)}）`).join('／') || '—'}・四捨五入</td><td className="r es-num">{yen(ts.tax)}</td></tr>
                  {ts.t0 !== 0 && <tr><td colSpan={5} style={{ fontWeight: 400 }}>繰越（税込・再課税なし）</td><td className="r es-num">{yen(ts.t0)}</td></tr>}
                  <tr><td colSpan={5}>合計（税込）</td><td className="r es-num">{yen(ts.tot)}</td></tr>
                </tfoot>
              </Table>
            ) : <div><span className="dim">{past ? '—' : '前払いを確定した子契約がまだありません。前払いを確定すると、ここに請求書の明細（見込み）が出ます。'}</span></div>}
          </Card>
          {i && <Card title="請求書の備考（PDFに印字）"><div className="small">{i.note || '—'}</div></Card>}
        </>
      )}
    </>
  );
}

/** 進み具合（後払い → 前払い → 作成 → 発行） */
function Stage({ cur }: { cur: number }) {
  const stp = (no: number, t: string) => <span className={`es-stage__step es-stage__step--${no < cur ? 'done' : no === cur ? 'current' : 'future'}`}>{no < cur ? '✓ ' : ''}{no} {t}</span>;
  return (
    <div className="es-stage" style={{ alignSelf: 'flex-start' }}><div className="es-stage__steps">
      {stp(1, '後払いを確定')}<span className="es-stage__arrow">▶</span>{stp(2, '前払いを確定')}<span className="es-stage__arrow">▶</span>{stp(3, '請求書を作成')}<span className="es-stage__arrow">▶</span>{stp(4, 'Bill One で発行')}
    </div></div>
  );
}

/** 次にすること（元の nextBox） */
function NextBox({ L, x }: { L: BillingLogic; x: GroupView }) {
  const router = useRouter();
  const ops = useInvoiceOps(L);
  if (x.past) return null;
  const i = x.i, can = x.g.bs.filter((b) => !b.fixOK && !L.editLock(b)).map((b) => b.id);
  let t: React.ReactNode, btn: React.ReactNode = null;
  if (i && i.status === 'DISPATCHED') t = '発行済みです。入金は Bill One で確認します（システムでは確認できません）。';
  else if (i && i.status === 'REGISTERED' && i.sendErr) { t = <><b>送信エラー：{i.sendErr}。</b>内容を確認して再送してください（Bill One の発行先・宛先に誤りがないか）。</>; btn = ops.can('dispatch') && <Btn sm kind="pri" onClick={() => ops.dispatch(i.id)}>再送する</Btn>; }
  else if (i && i.status === 'REGISTERED') { t = (i.reissueOf ? `${i.reissueOf} の再発行です。` : '') + '「請求書の明細」タブで内容を確かめて、Bill One で発行してください。'; btn = ops.can('dispatch') && <Btn sm kind="pri" onClick={() => ops.dispatch(i.id)}>Bill One で発行{DEMO ? '（デモ）' : ''}</Btn>; }
  else if (x.st.k === 'ready') { t = x.blocked ? <>子契約の前払いがすべて確定しました。<b>実績精算が未確定の子契約 {x.blocked}件</b>は、この請求書に入れず確定後に翌月の請求書で精算します（REQ-CT-301）。請求書を作成してください（Bill One に登録されます）。</> : '子契約がすべて確定しました。請求書を作成してください（Bill One に登録されます）。'; btn = ops.can('makeInvoice') && <Btn sm kind="pri" onClick={() => ops.askMake(x.g.c.id, x.g.bid)}>{x.amt === 0 ? '0円の請求書を出力' : '請求書を作成'}</Btn>; }
  else if (can.length) { t = <><b>前払いを確定してください（{can.length}件）。</b>「先月との比較」タブで変わった費目を確かめてから確定します。</>; btn = ops.can('confirmAllFix') && <Btn sm kind="pri" onClick={() => ops.confirmAllFix(can)}>前払いを確定（{can.length}件）</Btn>; }
  else if (x.blocked) { t = <><b>後払い（実績精算）が未確定の子契約が {x.blocked}件</b>あります。実績精算の画面で内訳ごとに確定してください（未確定のまま発行した請求書の分は、確定後に翌月の請求書で精算します）。</>; btn = <Btn sm onClick={() => router.push(R.act + '?st=no')}>実績精算を開く</Btn>; }
  else return null;
  return (
    <Inline tone={x.st.k === 'sent' ? 'info' : 'warning'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.857143rem' }}><span><b>次にすること：</b>{t}</span>{btn}</div>
    </Inline>
  );
}
