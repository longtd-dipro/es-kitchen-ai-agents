'use client';

import { OpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { actPeriod, checkStockRows } from '@/lib/ops/billing/logic';
import { PROD, prodName } from '@/lib/ops/billing/masters';
import { Btn, Card, Foot, Inline, Inp, Meta, PageHead, Ro, Table, Tag, useAsk } from '../../_components/ds';
import { useOps } from '../../../_ui/OpsProvider';
import { R, pLabel, useBilling } from '../../_components/useBilling';
import { useScreenCan } from '../../../_ui/perm';
import { fmtDate, fmtDatesIn, fmtDateTime } from '@/lib/format/date';
import { pct, RateTags } from '../../_components/Rates';
import { yen } from '@/lib/format/money';

/** 在庫詳細・在庫調整（棚卸の前／後で表示が変わる）。元の vAdjDetail */
export default function StockDetail({ edit }: { edit: boolean }) {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const ask = useAsk();
  const { toast } = useOps();
  const { L, run, can: canOp } = useBilling();
  const screenCan = useScreenCan();
  const [pend, setPend] = useState<Record<string, string>>({});
  const [rm, setRm] = useState<string[]>([]);
  const [bad, setBad] = useState<number[]>([]);
  if (!L) return null;
  const b0 = L.br(id);
  if (!b0) return <Inline tone="warning">拠点が見つかりません。</Inline>;
  const m = (!edit && sp.get('m')) || L.month, past = m < L.month, b = past ? L.pastB(b0, m) : b0;
  const after = !!b.filed, can = !past && L.canAdj(b0), ed = edit && can, c = L.co(b.co);
  const nm = ed ? '在庫調整' : '在庫詳細';
  const adjs = past ? [] : L.S.adjs.filter((a) => a.br === b.id && !rm.includes(a.id));
  const tot = (k: 'prev' | 'deliv' | 'sold' | 'waste' | 'appr' | 'real') => b.rows.reduce((s, r) => s + r[k], 0);
  const dirty = rm.length > 0 || Object.values(pend).some((v) => String(v).trim());
  const rowsIn = () => PROD.map((p) => ({ prod: p.id, q: Number(pend['q' + p.id] || 0), r: String(pend['r' + p.id] || '') }));
  /* 未保存の在庫調整を取り消した分は計算在庫にも戻して見せる */
  const rmDelta = (prod: number) => L.S.adjs.filter((a) => rm.includes(a.id) && a.prod === prod).reduce((s, a) => s + a.delta, 0);
  const rows = b.rows.map((r) => ({ ...r, appr: r.appr - rmDelta(r.id) }));
  const theoR = (r: (typeof rows)[number]) => r.prev + r.deliv - r.sold - r.waste + r.appr;
  const loss = rows.reduce((s, r) => s + (theoR(r) - r.real), 0);

  const save = async () => {
    const ck = checkStockRows(rowsIn());
    if (!ck.ok) { setBad(ck.bad); toast(ck.msg); return; }
    if (await run('saveStock', { id, rows: ck.rows, remove: rm })) router.push(R.stockD(id));
  };
  const cancel = () => (dirty ? ask({ tone: 'negative', title: '編集内容を破棄しますか？', body: '編集中の内容は保存されません。編集内容を破棄してもよろしいですか？', ok: '破棄', onOk: () => router.push(R.stockD(id)) }) : router.push(R.stockD(id)));
  const how = /ドライバー/.test(b.by) ? 'ES配送便ドライバー（ドライバーアプリ）' : '企業担当者（法人Webの棚卸）';

  return (
    <>
      <OpsLeaveGuard dirty={dirty} />
      <PageHead crumbs={[{ t: '請求' }, { t: '在庫管理', href: R.stock }, { t: nm }]} title={nm} id={b.code}
        actions={ed ? <><Btn onClick={cancel}>キャンセル</Btn><Btn kind="pri" onClick={save}>保存</Btn></>
          : <><Btn onClick={() => router.push(R.actD(b.id, m))}>実績精算詳細</Btn>{can && screenCan('update') && <Btn kind="pri" onClick={() => router.push(R.stockE(b.id))}>編集</Btn>}</>} />
      <Meta>
        <Tag>{b.name}</Tag><Tag>{c.name || '法人なし'}</Tag><Tag>{pLabel(m, L.month)}</Tag>
        {!past && (after ? <Tag c="ok">当月の棚卸後（申告 {fmtDate(b.stockDay)}）</Tag> : <Tag c="wait">当月の棚卸前</Tag>)}
        <Tag>対象期間 {fmtDatesIn(actPeriod(m))}</Tag>{b.actOK && <Tag c="ok">実績精算 確定済</Tag>}
        <RateTags L={L} b={b} />
      </Meta>
      {b.noCheck && <Inline>この拠点は<b>棚卸なし</b>です（拠点の設定）。管理ロスは出さず、棚卸の督促・事務手数料もありません。</Inline>}
      {L.firstWait(b) && <Inline tone="warning"><b>最初の棚卸報告がまだです。</b>切り替えのあとの最初の棚卸報告までは、始まりの数がないため管理ロスは出しません（実績精算に管理ロスの行は作りません）。最初の棚卸報告で、理論在庫は実在庫に置き換わります。</Inline>}
      {past ? <Inline>{pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline>
        : after ? <Inline tone="warning"><b>当月の棚卸は済んでいます（申告 {fmtDate(b.stockDay)} ／ {b.by}）。</b>ここで在庫調整を入れると、計算在庫と棚卸報告の差（<b>管理ロス</b>）が変わり、実績精算の金額（免責超過）に効きます。</Inline>
          : <Inline><b>当月の棚卸はまだです。</b>いまの計算在庫（前回の棚卸報告 ＋ 納品 − 販売 − 廃棄 ± 在庫調整）を表示しています。在庫調整を入れると計算在庫が変わり、棚卸のときの基準になります。管理ロスは棚卸のあとに出ます。</Inline>}
      {!past && !can && <Inline tone="negative">実績精算が確定済みのため編集できません。確定後に見つかった誤りは、<b>翌月の実績精算の中の調整</b>（翌月の請求詳細の「③ 調整」）で相殺します。</Inline>}
      {ed && <Inline>調整したい商品の行に、数量（＋増やす／−減らす）と理由を入れて「保存」してください。<b>保存するとすぐ計算在庫に反映</b>されます（申請・承認はありません）。理由は監査ログに残ります。</Inline>}

      <Card title="棚卸報告（棚卸の申告）">
        <div className="es-formgrid">
          <Ro label="状態">{b.filed ? <Tag c="ok">申告済</Tag> : <Tag c="no">未申告</Tag>}</Ro>
          <Ro label="申告日">{b.filed ? fmtDate(b.stockDay) : '—'}</Ro>
          <Ro label="申告者">{b.filed ? b.by : '—'}</Ro>
          <Ro label="申告の方法">{b.filed ? how : '—'}</Ro>
          <Ro label="申告の締め">{m.replace('-', '/') + '/20（対象期間の最終日）'}</Ro>
          <Ro label="商品ごとの実数">{b.filed ? '下の表の「棚卸報告」' : '申告されると下の表に出ます'}</Ro>
        </div>
        {!b.filed && !b.noCheck && <Foot><div className="small">お客様の入力は20日まで。25日までに申告がない（運営の代理入力も含む）と、事務手数料（{yen(L.S.cfg.penalty)}・税抜）がかかります（請求は保留しません）</div>{canOp('remind') && <Btn sm onClick={() => run('remind', { id: b.id })}>督促を送る</Btn>}</Foot>}
      </Card>

      <Card title={after ? '計算在庫と棚卸報告（管理ロス）' : 'いまの計算在庫'}>
        <Table>
          <thead><tr><th>商品</th><th className="r">前回の棚卸報告</th><th className="r">＋ 納品</th><th className="r">− 販売</th><th className="r">− 廃棄</th><th className="r">± 在庫調整</th><th className="r">＝ 計算在庫</th>
            {after && <><th className="r">棚卸報告</th><th className="r">差（管理ロス）</th><th className="r">差分率</th></>}<th className="r">廃棄率</th>{ed && <th className="c">在庫調整を入力（数量・理由）</th>}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const t = theoR(r), d = after ? t - r.real : null, e = bad.includes(r.id);
              /* 差分率・廃棄率が 10% 以上の商品は色を付ける（課題 2-1） */
              const rr = L.rowRates(b, r);
              return (
                <tr key={r.id} style={rr.alert ? { background: 'var(--negative-50)' } : undefined}>
                  <td>{prodName(r.id)}</td><td className="r es-num">{r.prev}</td><td className="r es-num">{r.deliv}</td><td className="r es-num">{r.sold}</td><td className="r es-num">{r.waste || '—'}</td>
                  <td className="r es-num">{r.appr ? (r.appr > 0 ? '+' : '') + r.appr : '—'}</td><td className="r es-num"><b>{t}</b></td>
                  {after && d !== null && <><td className="r es-num">{r.real}</td><td className="r es-num">{d > 0 ? '−' + d : d < 0 ? '+' + -d : '0'}</td>
                    <td className="r es-num" style={rr.diffAlert ? { color: 'var(--negative-500)', fontWeight: 700 } : undefined}>{rr.diff === null ? '—' : pct(rr.diff)}</td></>}
                  <td className="r es-num" style={rr.wasteAlert ? { color: 'var(--negative-500)', fontWeight: 700 } : undefined}>{pct(rr.waste)}</td>
                  {ed && (
                    <td><div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
                      <Inp sm type="number" width={96} ph="±点" value={pend['q' + r.id] ?? ''} err={e && !Number(pend['q' + r.id] || 0)} onChange={(v) => { setPend((p) => ({ ...p, ['q' + r.id]: v })); setBad([]); }} />
                      <Inp sm width={220} ph="理由（例：拠点間移動）" value={pend['r' + r.id] ?? ''} err={e && !String(pend['r' + r.id] || '').trim()} onChange={(v) => { setPend((p) => ({ ...p, ['r' + r.id]: v })); setBad([]); }} />
                    </div></td>
                  )}
                </tr>
              );
            })}
          </tbody>
          <tfoot><tr><td>合計</td><td className="r es-num">{tot('prev')}</td><td className="r es-num">{tot('deliv')}</td><td className="r es-num">{tot('sold')}</td><td className="r es-num">{tot('waste')}</td>
            <td className="r es-num">{rows.reduce((s, r) => s + r.appr, 0) || '—'}</td><td className="r es-num">{rows.reduce((s, r) => s + theoR(r), 0)}</td>
            {after && <><td className="r es-num">{tot('real')}</td><td className="r es-num">{loss > 0 ? '−' + loss : loss < 0 ? '+' + -loss : '0'}</td><td /></>}<td />{ed && <td />}</tr></tfoot>
        </Table>
      </Card>

      <Card title="登録済みの在庫調整">
        <Table>
          <thead><tr><th>ID</th><th>登録日時</th><th>登録者</th><th>商品</th><th className="r">数量</th><th>理由</th>{ed && <th className="c">操作</th>}</tr></thead>
          <tbody>
            {adjs.map((a) => (
              <tr key={a.id}><td className="es-mono">{a.id}</td><td>{fmtDateTime(a.at)}</td><td>{a.by}</td><td>{prodName(a.prod)}</td>
                <td className="r es-num">{a.delta > 0 ? '+' : ''}{a.delta}点</td><td>{a.reason}</td>
                {ed && <td className="c"><Btn sm kind="red" onClick={() => setRm((x) => [...x, a.id])}>取消</Btn></td>}</tr>
            ))}
            {!adjs.length && <tr><td colSpan={ed ? 7 : 6} className="c dim">この期間の在庫調整はありません</td></tr>}
          </tbody>
        </Table>
      </Card>
    </>
  );
}
