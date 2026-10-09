'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { DEMO } from '@/lib/demo';
import { altCondErrors, newAltCond, TEMP_L, toIso, fromIso, ymJa } from '@/lib/ops/menu/logic';
import type { AltCond, AltInput, AltMethod, Product, RowWhen } from '@/lib/ops/menu/types';
import { Area, Badge, Button, Card, Chk, Field, Head, InlineMessage, DInp, Inp, Kpi, Modal, Radios, SearchPanel, SectionTitle, Sel, Table, TextField, Td } from '../../_components/es';
import { useDirty, useKeep, useMenu } from '../../_components/MenuProvider';
import { api, Loading, useMaster } from '../../_components/parts';
import { useCanAct } from '../../../_ui/perm';
import { fmtDate } from '@/lib/format/date';

type AltState = { step: 1 | 2 | 3; cond: AltCond; err: Record<string, string>; m: AltMethod; off: Record<string, boolean>; rowWhen: Record<string, RowWhen>; kw: string; kwd: string; notify: boolean; createPo: boolean };
const newAlt = (): AltState => ({ step: 1, cond: newAltCond(), err: {}, m: { comp: 'order', when: 'next', whenDate: '', swap: 'swap', lotAct: 'return' }, off: {}, rowWhen: {}, kw: '', kwd: '', notify: false, createPo: true });

/** 代替商品の候補（共通データの order.altSuggest と同じ決まり）：同じ温度帯・コース・倉庫は候補（◎）、ほかは警告つき（⚠）で後ろに */
function altOpts(ps: Product[], dp: Product | null) {
  return ps.filter((p) => !p.off && (!dp || p.id !== dp.id)).map((p) => {
    const warn: string[] = [];
    if (dp) {
      if (p.st !== dp.st) warn.push('温度帯が違う');
      if ((dp.courses ?? []).some((x) => !(p.courses ?? []).includes(x))) warn.push('コースが違う');
      if ((dp.wh ?? []).some((x) => !(p.wh ?? []).includes(x))) warn.push('倉庫にない');
      if (dp.vm && !p.vm) warn.push('自販機に入らない');
    }
    return { p, warn };
  }).sort((a, b) => a.warn.length - b.warn.length || a.p.id.localeCompare(b.p.id));
}

/** 代替品設定（① 条件 → ② 対応方法 → ③ 対象の確認 → 保存） */
export default function AltPage() {
  const { toastError, leave, nav } = useMenu();
  const router = useRouter();
  const canAct = useCanAct();
  const mm = useMaster();
  const { data: menus } = useQuery(api, 'menus');
  const { data: allOrders } = useQuery(api, 'orders');
  const [A, setA] = useState<AltState>(newAlt);
  const [saving, setSaving] = useState(false);
  const [, setOrdQ] = useKeep('ord.q', { m: '' });
  const [, setOrdQd] = useKeep('ord.qd', { m: '' });
  const [, setOrdPg] = useKeep('ord.pg', 1);
  const [, setDone] = useKeep<unknown>('ord.done', null);
  useDirty(!!A.cond.def);
  /* 入荷の差異（発注・入荷 ＞ 入荷登録の「代替品で対応」）から来たとき：不良商品・対象期間・理由を入れておく（?def=&from=&to=&reason=・日付は yyyy-mm-dd） */
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const def = q.get('def');
    if (!def) return;
    setA((x) => ({ ...x, cond: { ...x.cond, def, found: q.get('found') ?? x.cond.found, from: q.get('from') ?? x.cond.from, to: q.get('to') ?? x.cond.to, reason: q.get('reason') ?? x.cond.reason } }));
  }, []);
  const locked = A.step > 1;
  /* 便ごとの結果・在庫の見込みは共通データの order.altPreview（保存と同じ計算。不足の表と同じ結果） */
  const altIn: AltInput | null = locked ? { cond: A.cond, m: A.m, off: A.off, rowWhen: A.rowWhen, createPo: A.createPo } : null;
  const { data: pv, error: pvErr } = useQuery(api, 'altPreview', { alt: altIn });
  if (!mm || !menus || !allOrders) return <Loading />;
  const { M, C } = mm;
  const c = A.cond;
  const up = (p: Partial<AltState>) => setA((x) => ({ ...x, ...p }));
  const upC = (k: keyof AltCond) => (e: { target: { value: string } }) => up({ cond: { ...c, [k]: e.target.value } });
  const upM = (p: Partial<AltMethod>) => up({ m: { ...A.m, ...p } });
  /* 不良商品の選択肢＝直近3ヶ月のメニューの商品＋その期間の注文に残っている商品（メニューから外した商品も出す：受付簿 #266） */
  const recent = menus.map((m) => m.ym).sort().reverse().slice(0, 3);
  const menuP = new Set<string>();
  recent.forEach((m) => menus.filter((x) => x.ym === m)[0]?.items.forEach((id) => menuP.add(id)));
  allOrders.filter((o) => recent.includes(o.ym)).forEach((o) => Object.keys(o.q).forEach((id) => { if (Object.values(o.q[id]).some((n) => n > 0)) menuP.add(id); }));
  /** 選択肢の名前：商品ID 商品名（温度帯）／管理名／仕入先名（英語名は出さない：受付簿 #245） */
  const nameOf = (p: Product) => p.id + ' ' + p.name + '（' + TEMP_L[p.keep] + '）' + (p.mgmt ? '／管理名：' + p.mgmt : '') + '／仕入先：' + (p.sup || '—');
  const defs = [...menuP].map(C.prod).filter(Boolean), dp = c.def ? C.prod(c.def) : null, ap = c.alt ? C.prod(c.alt) : null;
  const rows = (locked && pv?.rows) || [];
  const on = rows.filter((r) => !r.off);
  const corps = new Set(on.map((r) => r.corpName)), sites = new Set(on.map((r) => r.branchId));
  const comp = (r: { pattern: string }) => r.pattern === '② 補償';
  const dq = on.filter(comp).reduce((a, r) => a + r.qty, 0), uq = on.filter((r) => !comp(r)).reduce((a, r) => a + r.qty, 0), aq = on.reduce((a, r) => a + r.altQty, 0);
  const toOrd = () => leave(() => nav('/ops/menu/orders'));

  function saveCond() {
    const err = altCondErrors(c);
    if (Object.keys(err).length) { up({ err }); return; }
    up({ cond: { ...c, found: fromIso(c.found), from: fromIso(c.from), to: fromIso(c.to) }, err: {}, step: 2 });
  }
  async function save() {
    setSaving(true);
    try {
      const done = await api.action('applyAlt', { alt: { cond: c, m: A.m, off: A.off, rowWhen: A.rowWhen, createPo: A.createPo }, notify: A.notify });
      /* 対象年月は保存した月（不良発覚日の月）に切り替わる */
      const ym = c.found.slice(0, 7).replace('/', '-');
      setDone(done); setOrdQ({ m: ym }); setOrdQd({ m: ym }); setOrdPg(1);
      setA(newAlt());
      router.push('/ops/menu/orders');
      window.scrollTo(0, 0);
    } catch (e) { toastError(e); setSaving(false); }
  }

  const steps: [string, string][] = [['1', '条件'], ['2', '対応方法'], ['3', '対象の確認']];
  const acts = A.step === 1 ? <Button variant="outline" size="lg" onClick={toOrd}>キャンセル</Button>
    : A.step === 2 ? <><Button variant="outline" size="lg" onClick={toOrd}>キャンセル</Button><Button size="lg" onClick={() => up({ step: 3 })}>次へ</Button></>
      : <><Button variant="outline" tone="neutral" size="lg" onClick={() => up({ step: 2 })}>戻る</Button><Button variant="outline" size="lg" onClick={toOrd}>キャンセル</Button>{canAct(api, 'applyAlt') && <Button size="lg" disabled={!on.length} onClick={() => setSaving(true)}>保存</Button>}</>;

  return (
    <>
      <Head crumb={['メニュー管理', ['商品注文管理', toOrd], '代替品設定']} title="代替品設定" actions={acts} />
      <ol className="mo-steps">{steps.map((x, i) => { const n = i + 1; return <li key={n} className={n < A.step ? 'done' : n === A.step ? 'cur' : ''}><i>{n < A.step ? '✓' : x[0]}</i>{x[1]}</li>; })}</ol>
      <Card>
        <SectionTitle action={locked ? <Button variant="outline" icon="PencilSimple" onClick={() => up({ step: 1, cond: { ...c, found: toIso(c.found), from: toIso(c.from), to: toIso(c.to) } })}>条件を設定し直す</Button> : null}>代替品の条件</SectionTitle>
        <div className="mo-g3">
          <Field label="不良商品" required error={A.err.def} className="ord-wide">
            <Sel value={c.def} disabled={locked} onChange={upC('def')} options={[{ value: '', label: '選択してください' }, ...defs.map((p) => ({ value: p.id, label: nameOf(p) }))]} />
          </Field>
          <Field label="代替商品" required error={A.err.alt} className="ord-wide" helper="代替は1商品につき1商品（REQ-ALT-601）。候補＝同じ温度帯・コース・倉庫の商品。ほかの商品も選べます（⚠：温度帯・コース・倉庫・自販機が違う。倉庫にない拠点は在庫のある倉庫から追加配送）">
            <Sel value={c.alt} disabled={locked} onChange={upC('alt')} options={[{ value: '', label: '選択してください' }, ...altOpts(M.products, dp).map((x) => ({ value: x.p.id, label: (x.warn.length ? '⚠ ' : '◎ ') + x.p.id + ' ' + x.p.name + '（' + TEMP_L[x.p.keep] + '・' + x.p.price + '円）' + (x.p.mgmt ? '／管理名：' + x.p.mgmt : '') + '／仕入先：' + (x.p.sup || '—') + (x.warn.length ? '：' + x.warn.join('・') : '') }))]} />
          </Field>
          <Field label="不良発覚日" required error={A.err.found} helper={'出荷日がこの日以前の便＝② 補償、この日より後の便＝① 差し替え／③ 除外のみ（出荷指示を送っていれば再送 rev+1' + (DEMO ? '。デモは 9/25 に送信した出荷指示（出荷日 9/28〜10/11 分）を送信済とみなす）' : '）')}>
            <DInp value={locked ? toIso(c.found) : c.found} disabled={locked} onChange={upC('found')} />
          </Field>
          <Field label="対象期間（発送日）" required error={A.err.from || A.err.to} helper="開始日〜終了日に発送する分（締切済みの注文を含む）が対象です（要件シート行135）">
            <div className="mo-range">
              <DInp value={locked ? toIso(c.from) : c.from} disabled={locked} onChange={upC('from')} aria-label="開始日" />
              <span>〜</span>
              <DInp value={locked ? toIso(c.to) : c.to} disabled={locked} onChange={upC('to')} aria-label="終了日" />
            </div>
          </Field>
          <Field label="不良の範囲" required error={A.err.lot} helper="ロット単位だけでなく、商品全体（全ロット）が対象になることもある（REQ-ALT-401・402）">
            <div className="mo-inline">
              <Radios name="scope" value={c.scope} opts={[['all', '全ロット'], ['lot', 'ロット単位']]} onChange={(v) => up({ cond: { ...c, scope: v } })} disabled={locked} />
              {c.scope === 'lot' ? <Inp value={c.lot} disabled={locked} placeholder="ロット番号（例：LOT-2609-A1）" onChange={upC('lot')} /> : null}
            </div>
          </Field>
          <Field label="不良理由" required error={A.err.reason}>
            <Area value={c.reason} rows={3} disabled={locked} placeholder="例：パッケージ不備・シール印字エラー" onChange={upC('reason')} />
          </Field>
        </div>
        {!locked ? (
          <div className="mo-right">
            <Button onClick={saveCond}>条件を保存</Button>
            {DEMO ? <Button variant="ghost" tone="neutral" onClick={() => up({ cond: { def: 'M002', alt: 'M003', found: '2026-10-02', from: '2026-09-21', to: '2026-10-31', scope: 'all', lot: '', reason: 'ソースの味の異常（全ロット・製造元の配合ミス）' } })}>デモの例を入れる</Button> : null}
          </div>
        ) : null}
        {locked ? (
          <div className="mo-kpis">
            <Kpi l="対象の法人・拠点" v={corps.size + '法人 / ' + sites.size + '拠点'} sub={pvErr ? '確認できませんでした' : !pv ? '確認しています…' : '契約終了・対象から外した拠点を除く'} />
            <Kpi l="既納品数量" v={dq + '個'} sub="出荷日が発覚日以前（② 補償）" />
            <Kpi l="未納品数量" v={uq + '個'} sub="出荷日が発覚日より後（① 差し替え／③ 除外のみ）" />
            <Kpi l="代替品の合計数" v={aq + '個'} sub={ap ? ap.name : ''} />
          </div>
        ) : null}
      </Card>
      {locked ? (
        <InlineMessage tone="info" title="対応は3パターン（2026-10-01 決定）">
          <div>① 差し替え：出荷日の前日までの便。不良商品を代替商品に替える（請求は元の商品の単価）。出荷指示を送っていれば版番号つきで再送（rev+1）。
            <br />② 補償：出荷日以降の便（既納品）。次の便に代替商品を足す（次の便がない・遠いときは追加配送・配送費は ES 負担）。請求しない（請求書の実績精算に0円の行）。拠点に残る不良品は廃棄として記録し、管理ロスにしない。
            <br />③ 除外のみ：出荷日の前日までの便から不良商品を外すだけ（代替なし）。請求しない（2026-10-01 決定）。</div>
        </InlineMessage>
      ) : null}
      {locked ? (
        <Card>
          <SectionTitle>代替品の設定</SectionTitle>
          <div className="mo-2col">
            <div className="od-sec">
              <b className="mo-sech">既納品分の設定（② 補償）</b>
              <Field label="補償方法" required>
                <Radios name="comp" value={A.m.comp} disabled={A.step > 2} onChange={(v) => upM({ comp: v })}
                  opts={[['order', '注文数量で補償する（初期値）', '不良商品の注文数と同じ数の代替商品を送る（REQ-ALT-201）'], ['stock', '残理論在庫で補償する', '拠点に残っているはずの数（理論在庫）だけ送る（REQ-ALT-202）']]} />
              </Field>
              <Field label="補償品を届ける便" required>
                <div>
                  <Radios name="when" value={A.m.when} disabled={A.step > 2} onChange={(v) => upM({ when: v })}
                    opts={[['next', '次の便に入れる（既定）', '発覚日より後の、その拠点の最初の便。次の便がない・14日より先のときは自動で追加配送'], ['date', '日付を指定する', '指定した日より後の、その拠点の最初の便'], ['extra', '追加配送で届ける', '次の便を待たずに別便で届ける（配送費は ES 負担）']]} />
                  {A.m.when === 'date' ? <DInp value={A.m.whenDate} disabled={A.step > 2} onChange={(e) => upM({ whenDate: e.target.value })} /> : null}
                </div>
              </Field>
              <p className="mo-note">補償の方法は不良ごとに運営が選びます（初期値は注文数量・迷ったら注文数量）。補償分は請求しません（請求書の実績精算に0円の行で残す）。同じ月の後の便にも入れられます（REQ-ALT-501）。拠点に残る不良品は廃棄として記録し、理論在庫から引きます（管理ロスにしない）：ES配送便はドライバーが次の便で回収・廃棄、COOL便は法人が廃棄して棚卸報告で申告。</p>
            </div>
            <div className="od-sec">
              <b className="mo-sech">倉庫の不良ロット</b>
              <Field label="不良ロットの扱い" required>
                <Radios name="lotAct" value={A.m.lotAct || 'return'} disabled={A.step > 2} onChange={(v) => upM({ lotAct: v })}
                  opts={[['return', '仕入先へ返品', '出荷停止にして仕入先へ返品（発注に「不良・返品」を記録）'], ['dispose', '倉庫で廃棄', '出荷停止にして倉庫の在庫から引く']]} />
              </Field>
              <p className="mo-note">どちらも、保存した時点で不良ロット（全ロットのときは不良商品の在庫すべて）を出荷停止にします。</p>
            </div>
            <div className="od-sec">
              <b className="mo-sech">未納品分の設定（① 差し替え／③ 除外のみ）</b>
              <Field label="差し替え方法" required>
                <Radios name="swap" value={A.m.swap} disabled={A.step > 2} onChange={(v) => upM({ swap: v })}
                  opts={[['swap', '代替商品に差し替える（注文数量）', '同じ便で、不良商品の数をそのまま代替商品に替える'], ['exclude', '不良商品を除外のみ', '代替商品は送らず、不良商品だけ発送から外す（REQ-ALT-102）']]} />
              </Field>
              <p className="mo-note">差し替えた代替品は、元の商品（不良商品）の単価で請求します。残理論在庫の補償は、まだ届いていない分には使えないため、ここにはありません。</p>
            </div>
          </div>
        </Card>
      ) : null}
      {A.step === 3 ? (
        <Card>
          <SectionTitle>対象の注文</SectionTitle>
          {/* ALT-OPEN-20261001 OPEN-2＝A：保存前に代替商品の倉庫在庫（見込み）で足りるかを見る。倉庫在庫は 発注・入荷 の領域（まだつないでいない） */}
          <AltStock data={pv} error={pvErr} createPo={A.createPo} onCreatePo={(v) => up({ createPo: v })} />
          <SearchPanel sig={A.kwd} onSearch={() => up({ kw: A.kwd })} onClear={() => up({ kw: '', kwd: '' })}>
            <TextField key="kw" className="es-grow" icon="Search" placeholder="法人・拠点名で絞り込み" value={A.kwd} onChange={(v) => up({ kwd: v })} />
          </SearchPanel>
          <Table cls="ord-wrap"
            cols={[{ label: '対象', w: 56 }, { label: 'No', w: 48 }, { label: 'オーダーNo' }, { label: '法人名・拠点名' }, { label: '便（納品日）' }, { label: '区分' }, { label: '不良商品の数', cls: 'r' }, { label: '代替品の数', cls: 'r' }, { label: '代替品のお届け' }]}
            rows={rows.filter((r) => !A.kw || (r.corpName + r.short).indexOf(A.kw) >= 0).map((r, i) => {
              const delivered = comp(r);
              return (
                <tr key={r.key} className={r.off ? 'is-deleted' : undefined}>
                  <td><Chk checked={!r.off} onChange={(v) => up({ off: { ...A.off, [r.key]: !v } })} /></td>
                  <Td v={i + 1} />
                  <td><span className="es-mono">{r.orderId}</span><div className="od-small">{r.ym ? ymJa(r.ym) + ' サイクル' : ''}</div></td>
                  <td>{r.corpName}<div className="od-small">{r.short}</div></td>
                  <Td v={r.dlLabel} />
                  <td><Badge tone={delivered ? 'warning' : 'info'}>{delivered ? '② 補償（出荷日以降）' : r.pattern}</Badge></td>
                  <Td v={r.qty + '個'} cls="r" />
                  <Td v={r.off ? '—' : r.altQty + '個'} cls="r" />
                  <td>
                    {r.off ? <span className="od-small">対象から外した</span> : <>
                      {r.when}
                      {r.note ? <div className="od-small">{r.note}</div> : null}
                      {delivered ? <div style={{ marginTop: '0.285714rem', maxWidth: '24.285714rem' }}>
                        <Sel value={A.rowWhen[r.key] ?? 'auto'} aria-label={r.short + ' の届ける便'} onChange={(e) => up({ rowWhen: { ...A.rowWhen, [r.key]: e.target.value as RowWhen } })}
                          options={[{ value: 'auto', label: '初期値（次の便・遠ければ追加配送）' }, { value: 'next', label: '次の便' }, { value: 'next2', label: 'その次の便' }, { value: 'extra', label: '追加配送（ES 負担）' }]} />
                      </div> : null}
                      {r.vm && ap && !ap.vm ? <div className="od-small" style={{ color: 'var(--warning-700, #b45309)' }}>⚠ 自販機に入らない商品です（入れるかは法人次第）</div> : null}
                      {delivered ? <div className="od-small">{'不良品：' + (r.dlvKind.includes('COOL便') ? '法人が廃棄して棚卸報告で申告' : 'ドライバーが次の便で回収・廃棄') + '（管理ロスにしない）'}</div> : null}
                    </>}
                  </td>
                </tr>
              );
            })}
          />
          <p className="mo-note">一覧と在庫の見込みは、保存と同じ共通データの計算（order.altPreview）です。契約終了の拠点は自動で対象外にします（一覧に出ません）。ほかの拠点も、チェックを外すと個別に対象から外せます（電話で個別に対応した場合など）。</p>
        </Card>
      ) : null}
      {saving && dp && ap ? (
        <Modal tone="negative" title="代替品の設定を確定しますか？" confirmLabel="確定する" onCancel={() => setSaving(false)} onClose={() => setSaving(false)} onConfirm={save}>
          <div className="mo-modalb">
            <p>{dp.name + ' を ' + ap.name + ' に替える設定を確定します。注文・配送・発注・請求・お客様へのお知らせに反映され、取り消せません。'}</p>
            <p className="mo-note">差し替えた代替品は元の商品の単価で請求します。補償分は請求しません（実績精算に0円の行）。除外のみは請求しません。</p>
            <p className="mo-note">確定すると、注文・配送データ（明細と代替元）・出荷指示（送信済みなら再送 rev+1）・発注（代替品数・追加の発注）・倉庫の不良ロット（出荷停止）・拠点の在庫（廃棄）・請求・お客様へのお知らせ・納品リスト（ドライバー・委託配送先）に反映します。</p>
            <Chk label="お客様へ知らせる（代替品設定の確定と同時に、メール・法人Webのお知らせで知らせます）" checked={A.notify} onChange={(v) => up({ notify: v })} />
          </div>
        </Modal>
      ) : null}
    </>
  );
}

/**
 * 代替商品の在庫の確認（OPEN-2＝A・2026/10/02 決定）：倉庫ごとの 必要数／倉庫在庫／入荷予定／不足。
 * 共通データの order.altPreview（運営の倉庫在庫・発注の入荷予定から）。不足があれば「不足分の追加発注を作成する」（既定 ON）
 */
type Pv = { shortage: { warehouseId: string; need: number; stock: number; incoming: number; short: number }[]; warnings: string[]; pos: { id: string; qty: number; eta: string }[]; rows: { short_: boolean; off: boolean }[] } | null | undefined;
function AltStock({ data, error, createPo, onCreatePo }: { data: Pv; error: unknown; createPo: boolean; onCreatePo: (v: boolean) => void }) {
  if (error) return <InlineMessage tone="negative" title="代替商品の在庫の確認">{error instanceof Error ? error.message : '確認できませんでした'}</InlineMessage>;
  if (!data) return <InlineMessage tone="info" title="代替商品の在庫の確認">確認しています…</InlineMessage>;
  const short = data.shortage.some((x) => x.short > 0);
  const moved = data.rows.filter((x) => x.short_ && !x.off).length;
  return (
    <div style={{ marginBottom: '0.857143rem' }}>
      <InlineMessage tone={short ? 'warning' : 'info'} title="代替商品の在庫の確認">
        <table className="es-table" style={{ marginTop: '0.285714rem' }}>
          <thead><tr><th>倉庫</th><th className="r">必要数</th><th className="r">倉庫在庫</th><th className="r">入荷予定</th><th className="r">不足</th></tr></thead>
          <tbody>{data.shortage.map((x) => <tr key={x.warehouseId}><td>{x.warehouseId}</td><td className="r">{x.need}個</td><td className="r">{x.stock}個</td><td className="r">{x.incoming}個</td><td className="r">{x.short ? <b>{x.short}個</b> : '—'}</td></tr>)}</tbody>
        </table>
        {short ? <div style={{ marginTop: '0.428571rem' }}>
          <Chk label="不足分の追加発注を作成する" checked={createPo} onChange={onCreatePo} />
          <div className="od-small">{createPo
            ? `追加発注 ${data.pos.map((x) => x.id + '（' + x.qty + '個・入荷予定 ' + fmtDate(x.eta) + '）').join('・')}。入荷予定日より前の便（${moved}便）は入荷のあとの最初の便に回し、法人へ知らせます（その便では元の商品は請求しません）。`
            : '追加発注をしないと、足りない便は在庫が足りないまま残ります。'}</div>
        </div> : null}
        {data.warnings.length ? <div className="od-small" style={{ color: 'var(--warning-700, #b45309)', marginTop: '0.285714rem' }}>{data.warnings.map((w) => '⚠ ' + w).join('　')}</div> : null}
        <div className="od-small" style={{ marginTop: '0.285714rem' }}>倉庫在庫は運営の倉庫在庫（THOMAS の取込＋ES の記録）、入荷予定はこの画面の発注（仕入先サイトの発注は含まない）の見込みです。</div>
      </InlineMessage>
    </div>
  );
}
