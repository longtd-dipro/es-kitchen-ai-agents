'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { addM, yen, type BillingLogic } from '@/lib/ops/billing/logic';
import type { Invoice } from '@/lib/ops/billing/types';
import { Btn, Card, Inline, Inp, Meta, PageHead, SumGrid, Table, Tag, useAsk } from '../../../_components/ds';
import { R, useBilling } from '../../../_components/useBilling';
import { fmtDate, fmtDateTime } from '@/lib/format/date';

/** 請求書編集（品名・備考。登録済み＝Bill One で未発行の間だけ）。元の vInvDetail の編集 */
export default function InvoiceEditPage() {
  return <Suspense><InvoiceEditLoader /></Suspense>;
}

function InvoiceEditLoader() {
  const { id } = useParams<{ id: string }>();
  const { L } = useBilling();
  if (!L) return null;
  const i = L.S.invoices.find((x) => x.id === decodeURIComponent(id));
  if (!i) return <Inline tone="warning">請求書が見つかりません。</Inline>;
  return <InvoiceEdit key={i.id} L={L} i={i} />;
}

const lineTone = (k: string) => (k === '前払い' ? 'info' : k === '後払い' ? 'wait' : k === '繰越' ? 'no' : 'pur');

function InvoiceEdit({ L, i }: { L: BillingLogic; i: Invoice }) {
  const router = useRouter();
  const ask = useAsk();
  const { run } = useBilling();
  const [names, setNames] = useState<Record<number, string>>({});
  const [note, setNote] = useState(i.note ?? '');
  const ed = i.status === 'REGISTERED';
  const c = L.co(i.co), ps = L.payStatus(i);
  const back = () => router.push(R.grp(i.id));
  const dirty = Object.keys(names).length > 0 || note !== (i.note ?? '');
  useOpsLeaveGuard(dirty);
  const save = async () => { if (await run('saveInvoice', { id: i.id, names, note })) back(); };
  const cancel = () => (dirty ? ask({ tone: 'negative', title: '編集内容を破棄しますか？', body: '編集中の内容は保存されません。編集内容を破棄してもよろしいですか？', ok: '破棄', onOk: back }) : back());
  const brNames = [...new Set(i.lines.filter((l) => l.k !== '繰越').map((l) => l.br))];
  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '請求の確定・請求書', href: R.cfm }, { t: '請求書詳細', href: R.grp(i.id) }, { t: '請求書編集' }]} title="請求書編集" id={i.id}
        actions={ed ? <><Btn onClick={cancel}>キャンセル</Btn><Btn kind="pri" onClick={save}>保存</Btn></> : undefined} />
      <Meta>
        <Tag>{c.name}{i.br ? ` ／ ${L.br(i.br)?.name ?? ''}` : '（まとめて1通）'}</Tag><Tag c={i.status === 'DISPATCHED' ? 'ok' : i.status === 'WITHDRAWN' ? 'no' : i.status === 'CARRIED' ? 'pur' : 'info'}>{i.status}</Tag>
        {ps[1] !== '—' && <Tag c={ps[0]}>{ps[1]}</Tag>}
        <Tag>締め月 {i.m}</Tag><Tag>発行日 {addM(i.m, 1)}-01</Tag><Tag>入金期限 {fmtDate(i.due)}</Tag>
      </Meta>
      <div className="small" style={{ marginTop: '-0.428571rem' }}>入金期限の決め方：{i.dueRule || '—'}（1通に期限は1つ）</div>
      {i.lines.some((l) => l.k === '繰越') && (
        <Inline><b>この請求書には前月以前の未入金分（再請求）が含まれています。</b>
          {i.lines.filter((l) => l.k === '繰越').map((l) => `${l.from}（${yen(l.a)}）`).join('・')} ／ 繰越分はすでに課税済みのため<b>税率なし</b>で載せています。</Inline>
      )}
      <SumGrid items={[
        { k: '請求金額（税込）', v: yen(i.total), s: `税抜 ${yen(i.net)}・消費税 ${yen(i.tax)}${i.t0 ? `・繰越 ${yen(i.t0)}` : ''}` },
        /* 税率ごとの欄（税率マスタのどの率でも・2026-10-05） */
        ...(i.by ?? []).map((b) => ({ k: `${b.r}%対象（税抜）`, v: yen(b.t), s: `消費税 ${yen(b.x)}` })),
        ...(i.t0 ? [{ k: '繰越（税込・再課税なし）', v: yen(i.t0), s: '前月以前の未入金分' }] : []),
        { k: '未入金の記録', v: i.carriedTo ? '繰越済' : i.unpaid ? 'あり' : 'なし', s: i.unpaid ? fmtDateTime(i.unpaidAt) : '入金状況は Bill One で確認' },
      ]} />
      <Card title="この請求書に載っている子契約">
        <Table>
          <thead><tr><th>子契約番号</th><th>拠点</th><th className="r">金額（税抜）</th></tr></thead>
          <tbody>{brNames.map((n) => {
            const b = L.S.brs.find((x) => x.name === n), a = i.lines.filter((l) => l.br === n && l.k !== '繰越').reduce((s, l) => s + l.a, 0);
            return <tr key={n}><td>{b ? <span className="es-mono">{L.subNo(b, i.m || L.month)}</span> : '—'}</td><td>{n}</td><td className="r es-num">{yen(a)}</td></tr>;
          })}</tbody>
        </Table>
      </Card>
      <Card title="明細" right="品名は日本語必須・PDFに印字">
        <Table>
          <thead><tr><th className="c">#</th><th>拠点</th><th>品名</th><th>区分</th><th className="c">税率</th><th className="r">金額（税抜）</th></tr></thead>
          <tbody>{i.lines.map((l, n) => (
            <tr key={n}><td className="c">{n + 1}</td><td>{l.br}</td>
              <td>{ed ? <Inp sm width={420} value={names[n] ?? l.n} onChange={(v) => setNames((x) => ({ ...x, [n]: v }))} /> : l.n}</td>
              <td><Tag c={lineTone(l.k)}>{l.k}</Tag></td><td className="c">{l.t ? l.t + '%' : <span className="dim">—</span>}</td><td className="r es-num">{yen(l.a)}</td></tr>
          ))}</tbody>
          <tfoot>
            <tr><td colSpan={5} style={{ fontWeight: 400 }}>小計（税抜）</td><td className="r es-num">{yen(i.net)}</td></tr>
            {(i.by ?? []).map((b) => <tr key={b.r}><td colSpan={5} style={{ fontWeight: 400 }}>消費税 {b.r}%（対象 {yen(b.t)}・四捨五入）</td><td className="r es-num">{yen(b.x)}</td></tr>)}
            {i.t0 !== 0 && <tr><td colSpan={5} style={{ fontWeight: 400 }}>繰越（税込・再課税なし）</td><td className="r es-num">{yen(i.t0)}</td></tr>}
            <tr><td colSpan={5}>合計（税込）</td><td className="r es-num">{yen(i.total)}</td></tr>
          </tfoot>
        </Table>
        <div className="foot"><div className="small">{i.status === 'REGISTERED' ? 'Bill One に登録済み。発行すると法人へ送付されます' : i.status === 'DISPATCHED' ? '発行済み。修正は取消（WITHDRAWN）→再作成' : '取消済'}</div></div>
      </Card>
      <Card title="請求書の備考（PDFに印字）">
        {ed ? <textarea className="es-textarea" rows={3} value={note} onChange={(e) => setNote(e.target.value)} /> : <div className="small">{i.note || '—'}</div>}
      </Card>
      {!ed && <Inline>発行済み（または取消済み）の請求書は編集できません。直すときは取消（WITHDRAWN）してから作り直します。</Inline>}
    </>
  );
}
