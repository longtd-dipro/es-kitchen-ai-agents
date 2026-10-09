'use client';

import { useOpsLeaveGuard } from '@/app/ops/_ui/leaveGuard';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { sign, yen, type BillingLogic } from '@/lib/ops/billing/logic';
import { ADJMODE, COURSE, SHIP, prodName } from '@/lib/ops/billing/masters';
import type { Br } from '@/lib/ops/billing/types';
import { Btn, Card, Foot, Inline, Inp, Meta, PageHead, Ro, Sel, SumGrid, Table, Tag, TaxYen, useAsk } from '../../_components/ds';

/** 実績精算の金額の税率（軽減8%・販売単価（税込）から出した額。2026/10/03 決定：税込・税抜の両方を出す） */
const R8 = 8;
import { R, pLabel, useBilling } from '../../_components/useBilling';
import { useScreenCan } from '../../../_ui/perm';
import { fmtDate, fmtDatesIn, fmtDateTime } from '@/lib/format/date';
import { taxPair } from '@/lib/format/money';
import { RateTags } from '../../_components/Rates';

const BL = '2px solid var(--divider-low)';
type Draft = Pick<Br, 'adjMode' | 'adjYen' | 'filed' | 'stockDay' | 'by'>;

/** 実績精算詳細・実績精算編集。元の vActD（actParts＋actBody）・vActPast */
export default function ActualDetail({ edit }: { edit: boolean }) {
  const { id } = useParams<{ id: string }>();
  const sp = useSearchParams();
  const { L } = useBilling();
  if (!L) return null;
  const b = L.br(id);
  if (!b) return <Inline tone="warning">拠点が見つかりません。</Inline>;
  const m = (!edit && sp.get('m')) || L.month;
  if (m < L.month) return <ActualPast L={L} b={b} m={m} />;
  return <ActualNow key={b.id + String(edit)} L={L} b={b} edit={edit && !L.actLock(b) && !b.actOK} />;
}

function ActualNow({ L, b: b0, edit }: { L: BillingLogic; b: Br; edit: boolean }) {
  /* 現金回収差額の税率は商品の税率に従う（台帳 F 2026-10-06）：k.cashRate（割合がいちばん大きい率） */
  const router = useRouter();
  const ask = useAsk();
  const { run, can } = useBilling();
  const screenCan = useScreenCan();
  const [d, setD] = useState<Draft>({ adjMode: b0.adjMode, adjYen: b0.adjYen, filed: b0.filed, stockDay: b0.stockDay, by: b0.by });
  /* 編集中は入力した値で計算して見せる（保存するまで請求には効かない） */
  const b: Br = edit ? { ...b0, ...d } : b0;
  const c = L.co(b.co), lock = L.actLock(b), k = L.calc(b), dis = !edit || lock || b.actOK, RC = k.cashRate;
  const nm = edit ? '実績精算編集' : '実績精算詳細';
  const dirty = edit && (d.adjMode !== b0.adjMode || d.adjYen !== b0.adjYen || d.filed !== b0.filed);
  useOpsLeaveGuard(dirty);
  const setFiled = (on: boolean) => setD((x) => ({ ...x, filed: on, stockDay: on ? '2026/10/18' : '—', by: on ? '企業担当者（山田）' : '—' }));
  const save = async () => {
    const ops: { key: 'filed' | 'adjMode' | 'adjYen'; v: boolean | string | number }[] = [];
    if (d.filed !== b0.filed) ops.push({ key: 'filed', v: d.filed });
    if (d.adjMode !== b0.adjMode) ops.push({ key: 'adjMode', v: d.adjMode });
    if (d.adjYen !== b0.adjYen && d.adjMode !== 'none' && d.adjMode !== 'free') ops.push({ key: 'adjYen', v: d.adjYen });
    if (await run('saveActual', { id: b.id, ops })) router.push(R.actD(b.id));
  };
  const cancel = () => (dirty ? ask({ tone: 'negative', title: '編集内容を破棄しますか？', body: '編集中の内容は保存されません。編集内容を破棄してもよろしいですか？', ok: '破棄', onOk: () => router.push(R.actD(b.id)) }) : router.push(R.actD(b.id)));
  const inv = L.invNow(b0);
  const parts = L.partsOf(b);
  const nPart = parts.filter((p) => L.partOK(b0, p.k)).length;

  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '実績精算', href: R.act }, { t: nm }]} title={nm} id={L.subNo(b, L.month)}
        actions={edit ? <><Btn onClick={cancel}>キャンセル</Btn><Btn kind="pri" onClick={save}>保存</Btn></>
          /* 権限がなければ出さない */
          : <>{lock ? null : b.actOK ? (can('unAct') && <Btn kind="red" onClick={() => run('unAct', { id: b.id })}>確定を解除</Btn>) : (can('actAll') && <Btn onClick={() => run('actAll', { id: b.id })}>残りをまとめて確定</Btn>)}
            {!lock && !b.actOK && screenCan('update') && <Btn kind="pri" onClick={() => router.push(R.actE(b.id))}>編集</Btn>}</>} />
      <Meta>
        <Tag>{b.name}</Tag><Tag>{b.co === '' ? '法人なし' : c.name}</Tag><Tag c="info">対象期間 2026-09-21〜10-20</Tag>
        {b.actOK ? <Tag c="ok">② 実績精算 確定済</Tag> : <Tag c="wait">② 実績精算 未確定</Tag>}
        {inv && <Tag c="no">当月分は請求済</Tag>}
        <RateTags L={L} b={b} />
      </Meta>
      {!b.actOK && L.rates(b).alert && <Inline tone="warning"><b>差分率・廃棄率が 10% 以上です。</b>下の「商品別 明細」の赤い行を確かめてから確定してください（この子契約は一覧の「まとめて確定」では確定できません）。</Inline>}
      {b.noCheck && <Inline>この拠点は<b>棚卸なし</b>です。管理ロスは出さず、事務手数料もかかりません。</Inline>}
      {L.firstWait(b) && <Inline>この拠点は<b>最初の棚卸報告がまだ</b>です。最初の棚卸報告までは管理ロスを出しません（始まりの数がないため）。</Inline>}
      {L.penaltyOn(b) && <Inline tone="warning"><b>事務手数料 {yen(L.S.cfg.penalty)}（税抜・{L.S.cfg.penaltyTax ?? 10}%）</b>：{b.filed ? '棚卸の申告が25日より後のため、数は実績精算に使い、事務手数料はかかります' : '25日までに棚卸の申告がありません'}。請求は保留しません（2026-08-25 決定）。</Inline>}
      {inv && (
        <Inline tone="negative">この拠点の <b>{L.month}</b> 分は<b>請求済</b>です（{inv.id}）。
          プラン・コース・配送便・リードタイム・値引き・価格調整・当月の調整・確定解除は<b>できません</b>。
          直したい差額は「③ 調整」で<b>翌月以降の請求月</b>を指定して入れてください（再度請求する方針）。
          費目そのものの変更は <b>{L.nextM()} から適用</b>として登録できます。
          <div style={{ marginTop: '0.571429rem' }}><Btn sm onClick={() => router.push(R.sub(b.id, undefined, 'adj'))}>③ 調整（単発・繰越）へ →</Btn></div>
        </Inline>
      )}
      {b.kind === 'trial' && (
        <Inline><div><b>お試しキャンペーンの請求書（2026-10-01 回答 O5）</b></div>
          <div>前払い（固定額）は「お試しキャンペーン割引」で差し引かれます（この拠点の前払い合計：{yen(L.advTot(b))}）。</div>
          <div>金額が発生するとき（後払い・調整・差額など）は、請求書を発行します。</div>
          <div>金額が0円でも、請求書は出力できます（請求書の画面の「0円の請求書を出力」）。</div>
          <div>発行するかどうかは、運営が判断します。</div></Inline>
      )}

      <Card title="確定する内容" right={`${nPart} / 3 確定${b0.actOK ? '（実績精算 確定済）' : ''}`}>
        <Table>
          <thead><tr><th>内訳</th><th className="r">金額<div className="small">税込／税抜</div></th><th>内容</th><th className="c">状態</th><th className="c">操作</th></tr></thead>
          <tbody>
            {parts.map((p) => {
              const ok = L.partOK(b0, p.k);
              return (
                <tr key={p.k}><td><b>{p.t}</b></td>
                  <td className="r es-num">{p.na ? <span className="dim">—</span> : <TaxYen v={p.a} rate={R8} signed />}</td>
                  <td className="small">{p.na || p.desc}</td>
                  <td className="c">{ok ? <Tag c="ok">確定</Tag> : <Tag c="wait">未確定</Tag>}{p.na && <> <Tag>対象なし</Tag></>}</td>
                  <td className="c" style={{ whiteSpace: 'nowrap' }}>{!lock && can('setPart') && (ok ? <Btn sm kind="red" onClick={() => run('setPart', { id: b.id, k: p.k, v: false })}>解除</Btn> : <Btn sm kind="pri" onClick={() => run('setPart', { id: b.id, k: p.k, v: true })}>確定</Btn>)}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <Foot><div className="small">内訳ごとに確かめて確定します。<b>3つとも必須</b>です。対象のない内訳（現金利用なし・価格調整なし）も、対象がないことを確かめて「確定」を押します。<b>3つとも確定すると実績精算（後払い）が確定</b>し、請求の確定で前払いを確定できるようになります。在庫調整は任意です（必要なときだけ在庫管理で入れる）。</div></Foot>
      </Card>

      <Card title="実績精算の確認" right="対象期間 2026-09-21〜10-20 ・ 25日確定">
        <div className="es-formgrid">
          <Ro label="適用プラン（バージョン）">{L.planOf(b).id}　{L.planOf(b).pub}／{COURSE[b.course]}／{SHIP[b.ship]}</Ro>
          <Ro label="免責金額（プランマスタ）" msg="在庫差額の許容範囲・拠点では変更不可">{yen(k.ded)}</Ro>
          <div className="es-field">
            <label className="es-field__label">価格調整（申請の適用）</label>
            <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}><Sel value={b.adjMode} disabled={dis} onChange={(v) => setD((x) => ({ ...x, adjMode: v as Br['adjMode'], adjYen: v === 'none' || v === 'free' ? 0 : x.adjYen }))} opts={Object.entries(ADJMODE)} /></div>
              <Inp type="number" num width={90} value={String(b.adjYen)} disabled={dis || b.adjMode === 'none' || b.adjMode === 'free'} onChange={(v) => setD((x) => ({ ...x, adjYen: Math.max(0, Math.round(Number(v) / 10) * 10) }))} /><span>円</span>
            </div>
            <p className="es-field__msg">10円単位・値上げ／値下げ／無料提供</p>
          </div>
          <div className="es-field">
            <label className="es-field__label">棚卸の申告（当月の棚卸）</label>
            <label className={`es-check${dis ? ' is-disabled' : ''}`} style={{ minHeight: '2.857143rem' }}>
              <input type="checkbox" checked={b.filed} disabled={dis} onChange={(e) => setFiled(e.target.checked)} /><span className="es-check__box" />
              <span>{b.filed ? `申告済（${fmtDate(b.stockDay)} ／ ${b.by}）` : <span style={{ color: 'var(--negative-500)' }}>未申告（請求は保留しません。25日になっても未報告なら事務手数料）</span>}</span>
            </label>
          </div>
          {!b.filed && !b.noCheck && can('remind') && <div><Btn sm onClick={() => run('remind', { id: b.id })}>督促を送る</Btn></div>}
        </div>
      </Card>
      <SumGrid items={[
        { k: '管理ロス 免責超過分', v: <TaxYen v={k.over} rate={R8} />, s: `管理ロス ${yen(k.T.mgYen)} − 免責 ${yen(k.ded)}（税込）` },
        { k: <>価格調整差額 <Tag c="wait">翌月へ</Tag></>, v: <TaxYen v={k.adjD} rate={R8} signed />, s: <>値下げ・無料 {yen(k.T.down)} ／ 値上げ {yen(k.T.up)} ／ <b>{L.nextM()} の前請求に ± で反映</b></> },
        { k: '当月の請求へ繰入', v: <TaxYen v={k.bill} rate={R8} signed />, s: '免責超過 ＋ 現金回収差額（価格調整差額は翌月）' },
        { k: '現金回収差額', v: b.cash ? <TaxYen v={k.cashDiff} rate={RC} signed /> : '—', s: b.cash ? `回収予定 ${yen(k.cashPlan)} − 実際の回収 ${yen(k.cashGot)}` : 'この拠点は現金利用なし' },
      ]} />

      {b.cash && (
        <Card title="アプリの現金支払い（ドライバーの回収）" right="対象期間 2026-09-21〜10-20">
          <Table>
            <thead><tr><th>回収日</th><th>配送データ</th><th>回収したドライバー</th><th className="r">回収予定額<div className="small">アプリで現金を選んだ注文・税込／税抜</div></th><th className="r">実際の回収額<div className="small">税込／税抜</div></th><th className="r">差額</th></tr></thead>
            <tbody>
              {L.cashOf(b).map((x) => {
                const df = x.plan - x.got;
                return <tr key={x.no}><td>{x.d}</td><td className="es-mono">{x.no}</td><td>{x.drv}</td><td className="r es-num"><TaxYen v={x.plan} rate={RC} /></td><td className="r es-num"><TaxYen v={x.got} rate={RC} /></td>
                  <td className="r es-num">{df ? <Tag c={df > 0 ? 'no' : 'wait'}>{df > 0 ? '不足' : '多い'} {yen(Math.abs(df))}</Tag> : '—'}</td></tr>;
              })}
              {!L.cashOf(b).length && <tr><td colSpan={6} className="c dim">この期間の現金の回収はありません</td></tr>}
            </tbody>
            <tfoot><tr><td colSpan={3}>合計</td><td className="r es-num"><TaxYen v={k.cashPlan} rate={RC} /></td><td className="r es-num"><TaxYen v={k.cashGot} rate={RC} /></td><td className="r es-num"><TaxYen v={k.cashDiff} rate={RC} signed /></td></tr></tfoot>
          </Table>
          <Foot><div className="small">回収予定額と実際の回収額が違うときだけ、<b>差額を実績精算に載せます</b>（不足＝請求、多い＝減額）。一致していれば実績精算には何も載りません</div></Foot>
        </Card>
      )}

      <Card title="商品別 明細" right="計算在庫 ＝ 前回申告 ＋ 納品 − 販売 − 廃棄 ± 承認調整">
        <Table minWidth={1080}>
          <thead>
            <tr><th rowSpan={2}>商品</th><th colSpan={3} className="c" style={{ borderLeft: BL }}>販売単価（税込）</th><th colSpan={6} className="c" style={{ borderLeft: BL }}>数量の内訳</th><th colSpan={2} className="c" style={{ borderLeft: BL }}>管理ロス</th><th rowSpan={2} className="r" style={{ borderLeft: BL }}>価格調整差額<div className="small">税込／税抜</div></th></tr>
            <tr><th className="r" style={{ borderLeft: BL }}>定価</th><th className="c">価格調整</th><th className="r">販売単価<div className="small">利用者が支払う</div></th>
              <th className="r" style={{ borderLeft: BL }}>納品</th><th className="r">販売</th><th className="r">廃棄</th><th className="r">承認調整</th><th className="r">計算在庫</th><th className="r">棚卸報告</th>
              <th className="r" style={{ borderLeft: BL }}>数量</th><th className="r">金額<div className="small">税込／税抜</div></th></tr>
          </thead>
          <tbody>
            {k.rows.map((r) => (
              <tr key={r.id} style={L.rowRates(b, r).alert ? { background: 'var(--negative-50)' } : undefined}>
                <td>{r.n}</td>
                <td className="r es-num" style={{ borderLeft: BL }}>{yen(r.list)}</td>
                <td className="c">{k.free ? <Tag c="no">無料</Tag> : k.d > 0 ? <Tag c="wait">値上げ {sign(k.d)}</Tag> : k.d < 0 ? <Tag c="ok">値下げ {yen(k.d)}</Tag> : '—'}</td>
                <td className="r es-num">{yen(r.sell)}</td>
                <td className="r es-num" style={{ borderLeft: BL }}>{r.deliv}</td><td className="r es-num">{r.sold}</td>
                <td className="r es-num">{r.waste || '—'}</td><td className="r es-num">{r.appr ? (r.appr > 0 ? '+' : '') + r.appr : '—'}</td>
                <td className="r es-num">{r.calcStock}</td><td className="r es-num">{r.realV === null ? <span className="dim">未申告</span> : r.realV}</td>
                <td className="r es-num" style={{ borderLeft: BL, color: r.mgQty > 0 ? 'var(--negative-500)' : r.mgQty < 0 ? 'var(--info-500)' : 'inherit' }}>{r.mgQty > 0 ? '−' + r.mgQty : r.mgQty < 0 ? '+' + -r.mgQty : '0'}</td>
                <td className="r es-num">{r.mgYen ? <TaxYen v={r.mgYen} rate={R8} /> : '—'}</td>
                <td className="r es-num" style={{ borderLeft: BL }}>{r.down ? <span style={{ color: 'var(--negative-500)' }}><TaxYen v={r.down} rate={R8} signed /></span> : r.up ? <span style={{ color: 'var(--success-500)' }}><TaxYen v={-r.up} rate={R8} signed /></span> : '—'}</td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr><td>合計</td><td colSpan={3} style={{ borderLeft: BL }} />
            <td className="r es-num" style={{ borderLeft: BL }}>{k.T.deliv}</td><td className="r es-num">{k.T.sold}</td><td className="r es-num">{k.T.waste}</td>
            <td className="r es-num">{k.T.appr ? (k.T.appr > 0 ? '+' : '') + k.T.appr : '—'}</td><td className="r es-num">{k.T.calcStock}</td><td className="r es-num">{b.filed ? k.T.real : '—'}</td>
            <td className="r es-num" style={{ borderLeft: BL }}>{k.T.mgQty > 0 ? '−' + k.T.mgQty : k.T.mgQty}</td><td className="r es-num"><TaxYen v={k.T.mgYen} rate={R8} /></td>
            <td className="r es-num" style={{ borderLeft: BL }}><TaxYen v={k.adjD} rate={R8} signed /></td></tr></tfoot>
        </Table>
      </Card>

      <Card title="実績精算額と精算差額" right="当期（2026-09-21〜10-20）">
        <Table>
          <tbody>
            <tr><td>管理ロス 免責超過分</td><td className="r es-num"><TaxYen v={k.over} rate={R8} /></td></tr>
            <tr className="dim"><td style={{ paddingLeft: '1.714286rem' }}>└ 管理ロス {yen(k.T.mgYen)} − 免責金額 {yen(k.ded)}</td><td className="r es-num" /></tr>
            <tr className="dim"><td>{k.adjD >= 0 ? '値下げ（無料）価格調整差額' : '値上げ 価格調整差額'} <Tag c="wait">{L.nextM()} の前請求へ</Tag></td><td className="r es-num"><TaxYen v={k.adjD} rate={R8} signed /></td></tr>
            <tr className="dim"><td style={{ paddingLeft: '1.714286rem' }}>└ 計算対象月は実績精算と同じ {L.month}。変動分は<b>翌月分の前請求に ± で反映</b>します（2026-09-11 決定）</td><td /></tr>
            {b.cash && <>
              <tr><td>＋ 現金回収差額（アプリの現金支払い）</td><td className="r es-num"><TaxYen v={k.cashDiff} rate={RC} signed /></td></tr>
              <tr className="dim"><td style={{ paddingLeft: '1.714286rem' }}>└ 回収予定 {yen(k.cashPlan)} − ドライバーの回収 {yen(k.cashGot)}（一致していれば 0）</td><td /></tr>
            </>}
          </tbody>
          <tfoot>
            <tr><td><b>当月の請求書へ繰入（{RC === 8 ? '軽減8%' : `免責超過 8%・現金回収差額 ${RC}%`}）＝ 免責超過 ＋ 現金回収差額</b></td><td className="r es-num"><TaxYen v={k.bill} rate={R8} signed strong /></td></tr>
            {L.penaltyOn(b) && <tr><td>＋ 事務手数料（棚卸の未報告・{L.S.cfg.penaltyTax ?? 10}%）</td><td className="r es-num"><TaxYen v={L.S.cfg.penalty} rate={L.S.cfg.penaltyTax ?? 10} base="ex" /></td></tr>}
            <tr><td><b>この拠点の後払い分</b><div className="small">（請求書の明細の合計。税込／税抜は行ごとの税率で出した合計）</div></td><td className="r es-num"><ArrTot L={L} b={b} /></td></tr>
          </tfoot>
        </Table>
        <Foot><div className="small">{b.filed ? '確定すると計算在庫を棚卸報告値へ書き換え、精算差額が確定します' : L.penaltyOn(b) ? '棚卸が未申告です。請求は保留せず、確定すると事務手数料が載ります' : '棚卸が未申告です（この拠点は事務手数料はかかりません）'}</div></Foot>
      </Card>

      {(b.altRows ?? []).length > 0 && (
        <Card title="代替品（実績精算の行）" right="差替＝元の商品の単価・補償＝0円（お客様に見える行）・除外＝載せない">
          <Table>
            <thead><tr><th>内容</th><th className="r">金額<div className="small">税込／税抜</div></th></tr></thead>
            <tbody>{(b.altRows ?? []).map((x, i) => <tr key={i}><td>{x.n}</td><td className="r es-num"><TaxYen v={x.a} rate={x.t} /></td></tr>)}</tbody>
          </Table>
          <Foot><div className="small">代替品設定の差替・補償の行は、この拠点の後払い分（請求書の実績精算）に載ります。追加配送の配送費は ES の負担です</div></Foot>
        </Card>
      )}

      <Card title="この期間に反映された在庫調整" right="運営が登録した分だけ計算在庫に入ります">
        <Table>
          <thead><tr><th>登録日時</th><th>登録者</th><th>商品</th><th className="r">数量</th><th>理由</th></tr></thead>
          <tbody>
            {L.S.adjs.filter((a) => a.br === b.id).map((a) => (
              <tr key={a.id}><td className="small">{fmtDateTime(a.at)}</td><td>{a.by}</td><td>{prodName(a.prod)}</td>
                <td className="r es-num" style={{ color: a.delta > 0 ? 'var(--info-500)' : 'var(--negative-500)' }}>{a.delta > 0 ? '+' : ''}{a.delta}点</td><td className="small">{a.reason}</td></tr>
            ))}
            {!L.S.adjs.some((a) => a.br === b.id) && <tr><td colSpan={5} className="c dim">この期間の在庫調整はありません</td></tr>}
          </tbody>
        </Table>
        <Foot><div className="small">返品・拠点間移動・カウント訂正などを運営が登録します（理由は監査ログに残ります）</div><Btn onClick={() => router.push(R.stockD(b.id))}>在庫調整詳細へ</Btn></Foot>
      </Card>
    </>
  );
}

/** 過去の締め月の実績精算（確定したときの記録。参照のみ）。元の vActPast */
function ActualPast({ L, b, m }: { L: BillingLogic; b: Br; m: string }) {
  const x = L.pastB(b, m), k = L.calc(x), mo = L.monthOf(b, m), RC = k.cashRate;
  const router = useRouter();
  return (
    <>
      <PageHead crumbs={[{ t: '請求' }, { t: '実績精算', href: R.act }, { t: '実績精算詳細' }]} title="実績精算詳細" id={L.subNo(b, m)}
        actions={<Btn onClick={() => router.push(R.stockD(b.id, m))}>在庫詳細</Btn>} />
      <Meta><Tag>{b.name}</Tag><Tag>{L.co(b.co).name || '法人なし'}</Tag><Tag>{pLabel(m, L.month)}</Tag><Tag c="info">対象期間 {fmtDatesIn(mo?.actPeriod)}</Tag><Tag c="ok">実績精算 確定済</Tag></Meta>
      <Inline>{pLabel(m, L.month)}は確定済みです。確定したときの記録を表示しています（参照のみ）。</Inline>
      <SumGrid items={[
        { k: '現金回収差額', v: <TaxYen v={k.cashDiff} rate={RC} signed />, s: b.cash ? '回収予定 − ドライバーの回収' : '現金利用なし' },
        { k: '管理ロス 免責超過分', v: <TaxYen v={k.over} rate={R8} />, s: `管理ロス ${yen(k.T.mgYen)} − 免責 ${yen(k.ded)}（税込）` },
        { k: '請求へ繰入（後払い分）', v: <TaxYen v={mo?.arr || k.bill} rate={R8} />, s: `請求書 ${mo?.inv || '—'}` },
      ]} />
      <Card title="確定の記録">
        <div className="es-formgrid">
          <Ro label="確定日時">{fmtDateTime(mo?.at) || '—'}</Ro><Ro label="確定者">{mo?.by || '—'}</Ro>
          <Ro label="載った請求書">{mo?.inv && mo.inv !== '—' ? <Link className="es-mono" href={R.grp(mo.inv)}>{mo.inv}</Link> : '—'}</Ro>
        </div>
      </Card>
    </>
  );
}

/**
 * この拠点の後払い分の合計（税込・税抜）。請求書の明細（a）はすべて税抜。販売単価から出した行（実績精算差額・現金回収差額・代替品）は
 * もとの税込の額（incl）、事務手数料・単発のオプション（資材の追加配送）は税抜から税込を出す
 */
function ArrTot({ L, b }: { L: BillingLogic; b: Br }) {
  let incl = 0, net = 0;
  for (const l of L.arrLines(b)) {
    const p = l.incl != null ? { incl: l.incl, ex: l.a } : taxPair(l.a, l.t, 'ex');
    incl += p.incl; net += p.ex;
  }
  return <><b>{yen(incl)}（税込）</b><div className="small">{yen(net)}（税抜）</div></>;
}
