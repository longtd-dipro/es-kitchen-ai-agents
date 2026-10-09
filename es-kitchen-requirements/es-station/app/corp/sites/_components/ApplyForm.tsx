'use client';

import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { today } from '@/lib/supplier/dates';
import { CXL_GUIDE, CXL_RETAIN, chErrors, chFields, chSummary, cycles, firstCycle, KIND_OF_PROC, KINDS, kindOf, type ChField, type ChKind, type ProcKey } from '@/lib/corp/sites/logic';
import { useCorp, useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, CardT, Checkbox, ConfirmDiscard, Icon, InlineMessage, PageHead, cx } from './es';
import { api, ApTag, Loading, Ro, Tbl, Td, useAcct, WhoField } from './parts';
import { DateInput } from '@/components/DateInput';
import { fmtDate, fmtDatesIn } from '@/lib/format/date';
import { corpTerm } from '@/lib/domain/terms';
import { yen } from '@/lib/format/money';

/*
 * 変更のお申し込み（新しい申請）。元は申込フォーム（部品21）の「変更のお申し込み」を iframe で入れていたもの。
 * 段階：お手続きを選ぶ → 対象の拠点を選ぶ → ご希望の内容 → ご入力内容の確認 → お申し込み完了。
 * 送ると運営Web の契約申請管理に CH-YYYYMMDD-NNNN の申請が1件でき、拠点ごとに承認される。
 * ?kind=plan|dlv|eq|info|corp|pause|resume|cancel&site=CU… で開くと、その拠点と手続きを選んだ状態で「ご希望の内容」から始まる。
 */
const TONE: Record<string, string> = { blue: 'info', ind: 'info', pur: 'info', teal: 'info', amb: 'warning', grn: 'success', red: 'negative' };
const STEPS = ['お手続きを選ぶ', '対象の拠点を選ぶ', 'ご希望の内容', 'ご入力内容の確認', 'お申し込み完了'];

export default function ApplyForm() {
  /* サイドメニューで離れるときの確認（lib/ui/leaveGuard）。中身は下の dirty を入れる */
  const leaveRef = useRef<() => boolean>(() => false);
  useOpsLeaveGuard(() => leaveRef.current());
  const router = useRouter();
  const sp = useSearchParams();
  const acct = useAcct();
  const { isBranch } = useCorpSignedIn();
  const { toast, toastError } = useCorp();
  const { data } = useQuery(api, 'applyCtx', { acct });
  const d = today();
  const proc0 = sp.get('kind') as ProcKey | null, site0 = sp.get('site');
  const kind0 = proc0 && KIND_OF_PROC[proc0] ? KIND_OF_PROC[proc0] : null;
  const [st, setSt] = useState<{ step: number; kind: ChKind | null; picked: string[]; vals: Record<string, Record<string, string>>; errs: Record<string, Record<string, string>>; who: string; whoErr?: boolean; agree: boolean; agreeErr?: boolean; pen?: boolean; penErr?: boolean; no?: string; whoName?: string; init?: boolean }>(
    { step: 1, kind: null, picked: [], vals: {}, errs: {}, who: '', agree: false },
  );
  const [discard, setDiscard] = useState<null | (() => void)>(null);
  const [confirm, setConfirm] = useState(false);
  if (!data) return <Loading />;

  /* 拠点詳細の「変更を申請」から：その拠点と手続きを選んだ状態で「ご希望の内容」から */
  if (!st.init) {
    const s1 = { ...st, init: true };
    if (kind0) {
      s1.kind = kind0;
      if (kind0 === 'cop') { s1.picked = [data.corpId]; s1.step = 3; }
      else if (site0 && data.sites.some((x) => x.id === site0 && !x.why[kind0])) { s1.picked = [site0]; s1.step = 3; }
      else { s1.picked = data.sites.filter((x) => !x.why[kind0]).map((x) => x.id); s1.step = 2; }
    }
    setSt(s1);
    return <Loading />;
  }
  const C = st, ki = C.kind ? kindOf(C.kind) : null;
  const siteOf = (id: string) => data.sites.find((x) => x.id === id) ?? null;
  const set = (p: Partial<typeof st>) => setSt({ ...st, ...p });
  const kinds = KINDS.filter((k) => !(k.corp && isBranch));
  const nOf = (k: ChKind) => (k === 'cop' ? (data.cpend ? 0 : 1) : data.sites.filter((x) => !x.why[k]).length);
  const dirty = () => !C.no && C.step >= 3;
  leaveRef.current = dirty;
  const leave = (go: () => void) => { if (dirty()) setDiscard(() => go); else go(); };
  const valsOf = (id: string) => C.vals[id] ?? {};
  const fv = (id: string, f: ChField) => valsOf(id)[f.key] ?? (f.key === 'cyc' && C.kind !== 'cop' ? firstCycle(d).v : '');

  function next() {
    if (C.step === 1) {
      if (!C.kind) { toast('お手続きをお選びください'); return; }
      if (C.kind === 'cop') { set({ picked: [data!.corpId], step: 3 }); return; }
      set({ step: 2, picked: C.picked.length ? C.picked : data!.sites.filter((x) => !x.why[C.kind!]).map((x) => x.id) });
      return;
    }
    if (C.step === 2) { if (!C.picked.length) { toast('拠点を1つ以上お選びください'); return; } set({ step: 3 }); return; }
    if (C.step === 3) {
      const vals: typeof C.vals = {}, errs: typeof C.errs = {};
      let bad = 0;
      C.picked.forEach((id) => {
        const v = { ...valsOf(id) };
        if (C.kind !== 'cop' && C.kind !== 'cxl' && !v.cyc) v.cyc = firstCycle(d).v;
        vals[id] = v;
        const e = chErrors(C.kind!, C.kind === 'cop' ? null : siteOf(id), v, d);
        errs[id] = e; bad += Object.keys(e).length;
      });
      if (C.kind === 'cxl' && !C.pen) { set({ vals, errs, penErr: true }); toast('ご確認のチェックをお願いします'); return; }
      if (bad) { set({ vals, errs }); const m = Object.values(errs).flatMap((e) => Object.values(e)).find((x) => /通算|残り月数/.test(x)); toast(m || '未入力の項目があります'); return; }
      set({ vals, errs: {}, step: 4 });
      window.scrollTo(0, 0);
    }
  }
  function back() {
    if (C.step === 1) { leave(() => router.push('/corp/sites')); return; }
    set({ step: C.kind === 'cop' && C.step === 3 ? 1 : C.step - 1 });
  }
  function send() {
    if (!C.who) { set({ whoErr: true }); return; }
    if (!C.agree) { set({ agreeErr: true }); return; }
    setConfirm(true);
  }
  async function doSend() {
    try {
      const r = await api.action('apply', { acct, kind: C.kind!, sites: C.kind === 'cop' ? [] : C.picked, vals: C.vals, who: C.who });
      setConfirm(false);
      set({ no: r.no, whoName: r.who, step: 5 });
      window.scrollTo(0, 0);
    } catch (x) { setConfirm(false); toastError(x); }
  }

  const steps = (
    <div className="cb-steps">
      {STEPS.map((t, i) => {
        const k = i + 1, cls = C.no && k === 5 ? 'done' : k < C.step ? 'done' : k === C.step ? 'now' : 'todo';
        return <div key={t} className={cx('cb-step', cls)}><b>{k}. {t}</b><span>{cls === 'done' ? '完了' : cls === 'now' ? 'ご入力中' : '未入力'}</span></div>;
      })}
    </div>
  );
  const cycleNote = (
    <InlineMessage tone="warning" title="契約に関するお申し込みは、ご注文と同じ締切です。">
      締切までにお申し込みいただくと翌月のご利用月から反映します。締切を過ぎると翌々月からになります。本日は {fmtDate(d)} です。
      {cycles(d).filter((c) => !c.ok).length ? '直近 ' + cycles(d).filter((c) => !c.ok).length + '件のご利用月は締切を過ぎています。' : ''}
      いちばん早くて {fmtDatesIn(firstCycle(d).v)}（申込締切 {fmtDate(firstCycle(d).close)}）からの反映になります。
    </InlineMessage>
  );

  function field(id: string, f: ChField) {
    const v = fv(id, f), err = C.errs[id]?.[f.key];
    const put = (x: string) => {
      const e = { ...(C.errs[id] || {}) }; delete e[f.key];
      set({ vals: { ...C.vals, [id]: { ...valsOf(id), [f.key]: x } }, errs: { ...C.errs, [id]: e } });
    };
    const label = <label className="es-field__label">{f.label}{f.req && f.type !== 'ro' ? <span className="es-field__req">*</span> : null}{f.ap ? <ApTag k={f.ap} /> : null}</label>;
    let ctl;
    if (f.type === 'ro') return <Ro key={f.key} label={<>{f.label}{f.ap ? <ApTag k={f.ap} /> : null}</>} v={f.value} cls={f.wide ? 'es-span-3' : undefined} />;
    if (f.type === 'sel') ctl = <div className="es-input es-select es-input--md"><select value={v} onChange={(e) => put(e.target.value)}><option value="" disabled>選択してください</option>{(f.opts ?? []).map((o) => <option key={o} value={o}>{corpTerm(fmtDatesIn(o))}</option>)}</select><Icon name="CaretDown" size={16} /></div>;
    else if (f.type === 'ta') ctl = <div className="es-input es-input--md es-input--area"><textarea rows={3} value={v} placeholder={f.ph} onChange={(e) => put(e.target.value)} /></div>;
    else if (f.type === 'chk') {
      const cur = v.split('／').filter(Boolean);
      ctl = <div className="cb-checks">{(f.opts ?? []).map((o) => <Checkbox key={o} label={o} checked={cur.includes(o)} onChange={(on) => put((f.opts ?? []).filter((x) => (x === o ? on : cur.includes(x))).join('／'))} />)}</div>;
    } else ctl = <div className="es-input es-input--md">{f.type === 'date' ? <DateInput fill value={v} onChange={(e) => put(e.target.value)} /> : <input type="text" value={v} placeholder={f.ph} onChange={(e) => put(e.target.value)} />}</div>;
    return (
      <div key={f.key} className={cx('es-field', f.wide && 'es-span-3', err && 'es-field--error')}>
        {label}{ctl}
        {err ? <span className="es-field__msg es-field__msg--error" role="alert">{err}</span> : f.hint ? <span className="es-field__msg">{f.hint}</span> : null}
      </div>
    );
  }

  /* 解約：理由に応じた案内（引き止めシナリオ案）と、ご精算の目安（設備ごとの違約金） */
  function cxlExtra(id: string, b: NonNullable<ReturnType<typeof siteOf>>) {
    const v = valsOf(id), g = v.why ? CXL_GUIDE[v.why] : null, err = C.errs[id]?.retain;
    const penKey = Object.keys(b.pen ?? {}).find((k) => v.end?.startsWith(k)), pen = penKey ? b.pen![penKey] : null;
    return (
      <div className="cb-stack" style={{ marginTop: '0.857143rem' }}>
        {g ? (
          <div>
            <InlineMessage tone="info" title={g.title}>{g.lines.map((x, i) => <p key={i} style={{ margin: '0.142857rem 0 0' }}>{x}</p>)}</InlineMessage>
            <div className="cb-retain" role="radiogroup" aria-label="お進みの方法" style={{ display: 'flex', gap: '0.571429rem', flexWrap: 'wrap', marginTop: '0.571429rem' }}>
              {CXL_RETAIN.map((r) => (
                <Button key={r} variant={v.retain === r ? 'solid' : 'outline'} onClick={() => {
                  if (r === 'プラン変更を申請') { leave(() => router.push('/corp/requests/contract/new?kind=plan&site=' + id)); return; }
                  const e = { ...(C.errs[id] || {}) }; delete e.retain;
                  set({ vals: { ...C.vals, [id]: { ...valsOf(id), retain: r } }, errs: { ...C.errs, [id]: e } });
                }}>{r}</Button>
              ))}
            </div>
            {err ? <span className="es-field__msg es-field__msg--error" role="alert">{err}</span> : null}
            <p className="note">「そのまま解約を続ける」場合は、ESキッチンが内容をお聞きしたうえで承認し、確定します。</p>
          </div>
        ) : null}
        {pen ? (
          <div>
            <b className="cb-mh">ご精算の目安（設備ごとの解約時の回収額 × 最低利用期間の残り月数 ÷ 最低利用期間）</b>
            {pen.rows.length ? (
              <Tbl cols={['設備', '台数', '最低利用期間の残り', '違約金の目安（税抜）']}>
                {pen.rows.map((r, i) => <tr key={i}><Td v={r.name} /><Td v={r.qty + '台'} cls="es-num" /><Td v={r.remaining + 'ヶ月 / ' + r.min + 'ヶ月'} cls="es-num" /><Td v={yen(r.yen)} cls="es-num" /></tr>)}
                <tr><Td v={<b>合計</b>} /><Td v="" /><Td v="" /><Td v={<b>{yen(pen.total)}</b>} cls="es-num" /></tr>
              </Tbl>
            ) : <p className="note">違約金がかかる設備はありません（0円）。</p>}
          </div>
        ) : null}
      </div>
    );
  }

  let body;
  if (C.step === 5 && C.no) {
    body = (
      <CardT title={<>お申し込みを受け付けました<span className="sub" style={{ display: 'inline', marginLeft: '0.857143rem' }}>受付番号 {C.no}</span></>}>
        <InlineMessage tone="success" title={(C.whoName || '') + ' さんへ、受付完了のメールをお送りしました。'} />
        <div className="es-formgrid" style={{ marginTop: '0.857143rem' }}>
          <Ro label="受付番号" v={C.no} /><Ro label="お手続き" v={ki?.t} /><Ro label="お申し込みされた方" v={(C.whoName || '') + '（' + (isBranch ? '拠点アカウント' : '法人アカウント') + '）'} />
          <Ro label="対象の拠点" v={C.kind === 'cop' ? data.corpName + '（法人）' : C.picked.map((id) => siteOf(id)?.name).join('・') + '（' + C.picked.length + '拠点）'} cls="es-span-2" />
          <div className="es-field"><label className="es-field__label">状態</label><div className="ro"><Badge tone="info">ESキッチンが確認中</Badge></div></div>
        </div>
        <InlineMessage tone="info" title="ESキッチンが承認すると、ご契約に反映されます。">反映されるとメールでお知らせし、拠点管理の表示も変わります。承認までの間は、同じ拠点に同じお手続きを重ねてお申し込みいただけません。</InlineMessage>
        <div style={{ display: 'flex', gap: '0.642857rem', flexWrap: 'wrap', marginTop: '1rem' }}>
          <Button onClick={() => router.push('/corp/sites')}>拠点一覧へ戻る</Button>
          <Button variant="outline" onClick={() => router.push('/corp/requests/contract')}>申請の一覧へ</Button>
        </div>
      </CardT>
    );
  } else if (C.step === 1) {
    body = (
      <CardT title="どのお手続きをご希望ですか？（1回のお申し込みで1種類です）">
        <div className="cb-procs" role="radiogroup">
          {kinds.map((k) => {
            const n = nOf(k.k), off = n === 0;
            return (
              <button key={k.k} type="button" role="radio" aria-checked={C.kind === k.k} disabled={off} className={cx('cb-proc', C.kind === k.k && 'is-on', off && 'is-off')}
                onClick={() => { if (!off) set({ kind: k.k, picked: C.kind === k.k ? C.picked : [], vals: C.kind === k.k ? C.vals : {} }); }}>
                <span className="es-radio__dot cb-dot" aria-hidden />
                <span className="cb-proc__t"><b>{k.t} <Badge tone={off ? 'neutral' : TONE[k.c]}>{off ? '対象なし' : k.corp ? '法人が対象' : n + '拠点が対象'}</Badge></b><span>{k.d}</span><i>{k.f}</i></span>
              </button>
            );
          })}
        </div>
        <p className="note" style={{ marginTop: '0.857143rem' }}>プランの変更・休止はご利用中の拠点、再開は休止中の拠点、解約はご利用中・休止中どちらの拠点も対象です。法人情報の変更は法人アカウントだけが申し込めます。承認待ちのお申し込みがある拠点は選べません。対象の拠点がない手続きは選べません。</p>
        <div style={{ marginTop: '0.857143rem' }}>{cycleNote}</div>
      </CardT>
    );
  } else if (C.step === 2) {
    const k = C.kind!;
    body = (
      <CardT title={'対象の拠点をお選びください（' + ki!.t + '）'} action={<span style={{ display: 'flex', gap: '0.571429rem' }}>
        <Button variant="outline" size="sm" onClick={() => set({ picked: data.sites.filter((x) => !x.why[k]).map((x) => x.id) })}>すべて選ぶ</Button>
        <Button variant="outline" size="sm" onClick={() => set({ picked: [] })}>選択を外す</Button></span>}>
        <div className="cb-stack" style={{ gap: '0.714286rem' }}>
          <InlineMessage tone="info" title="複数の拠点をまとめてお申し込みいただけます。">開始したいご利用月は、次の画面で拠点ごとに選べます。</InlineMessage>
          {cycleNote}
          {data.sites.map((b) => {
            const why = b.why[k], on = C.picked.includes(b.id);
            return (
              <div key={b.id} className={cx('cb-bsel', on && 'is-on', why && 'is-off')} onClick={() => { if (!why) set({ picked: on ? C.picked.filter((x) => x !== b.id) : [...C.picked, b.id] }); }}>
                <input type="checkbox" readOnly checked={on} disabled={!!why} style={{ pointerEvents: 'none', marginTop: '0.285714rem' }} />
                <div>
                  <div><b>{b.name}</b> <span className="es-mono">{b.cp}</span> {b.state === 'active' ? <Badge tone="success">ご利用中</Badge> : <Badge tone="warning">休止中</Badge>}</div>
                  <div className="t2"><span>{b.plan}</span><span>ご契約開始 {b.start}</span><span>最低利用期間 {b.term}</span></div>
                  {why ? <div className="t3">{why}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardT>
    );
  } else if (C.step === 3) {
    body = (
      <div className="cb-stack">
        {C.kind !== 'cop' ? cycleNote : null}
        {C.picked.map((id) => {
          const b = C.kind === 'cop' ? null : siteOf(id);
          const fs = chFields(C.kind!, b, { ...valsOf(id), cyc: valsOf(id).cyc ?? (C.kind !== 'cop' && C.kind !== 'cxl' ? firstCycle(d).v : '') }, d);
          return (
            <CardT key={id} title={<>{b ? b.name : data.corpName + '（法人）'} <span className="es-mono" style={{ fontWeight: 400, fontSize: '0.928571rem' }}>{b ? b.cp + '　' + b.plan : data.corpId}</span></>} action={<Badge tone={TONE[ki!.c]}>{ki!.t}</Badge>}>
              <div className="es-formgrid">{fs.map((f) => field(id, f))}</div>
              {C.kind === 'cxl' && b ? cxlExtra(id, b) : null}
              {C.kind === 'sus' ? <div style={{ marginTop: '0.857143rem' }}><InlineMessage tone="warning" title="「引き揚げる」を選んだ場合は、休止の開始日から1ヶ月後をめどに設備を引き揚げます。">「置いたまま」を選んだ場合は引き揚げず、保管料もかかりません。最低利用期間は、置いたままの設備だけ休止中のカウントが止まります（引き揚げた設備も、設置し直したときに休止前の残りを引き継ぎます）。棚卸報告は、休止の始め・休止中・再開のときのいずれも任意です。休止の始めに報告いただく場合は、休止の前の最後のお届けの月に<b>お客様が法人Webの「棚卸報告」で報告</b>してください（ES配送便の拠点も）。報告があればその分までを精算し、休止中は精算はありません。ご契約番号は変わりません。</InlineMessage></div> : null}
              {C.kind === 'rsm' ? <div style={{ marginTop: '0.857143rem' }}><InlineMessage tone="info" title="引き揚げた設備は設置し直します。">お届けの開始日の1週間前をめどにお伺いします（置いたままの設備はそのままお使いいただけます）。最低利用期間は、設置し直した設備も休止前の残りを引き継ぎます（数え直しません）。</InlineMessage></div> : null}
            </CardT>
          );
        })}
        {C.kind === 'cxl' ? (
          <CardT title="ご確認のお願い">
            <Checkbox label="ご精算の目安と、解約すると元に戻せないことを確認しました" checked={!!C.pen} onChange={(on) => set({ pen: on, penErr: false })} />
            <p className="note">ご精算が 0円 の場合もこの確認をお願いしています。設備ごとの「解約時の回収額」を、残りの月数に応じて月割りでご精算いただきます。実際の金額は、ESキッチンが解約日を確定したあとに確定します。</p>
            {C.penErr ? <p className="es-field__msg es-field__msg--error">ご確認のチェックをお願いします</p> : null}
          </CardT>
        ) : null}
      </div>
    );
  } else {
    const cands = isBranch ? data.sites.flatMap((s) => s.staff.map((r) => ({ r, where: s.name })))
      : [...data.corpStaff.map((r) => ({ r, where: '法人' })), ...data.sites.filter((s) => C.picked.includes(s.id)).flatMap((s) => s.staff.map((r) => ({ r, where: s.name })))];
    const seen = new Set<string>();
    const who = cands.filter((x) => { const k = x.r[3] || x.r[1]; if (!k || seen.has(k)) return false; seen.add(k); return true; }).map((x) => ({ value: x.r[3] || x.r[1], name: x.r[1], where: x.where, kind: x.r[0], mail: x.r[3] }));
    body = (
      <div className="cb-stack">
        <InlineMessage tone="info" title="ご入力いただいた内容です。">このままでよろしければ、いちばん下で同意にチェックを入れて「この内容でお申し込みする」を押してください。直したいところは「戻る」から戻れます。</InlineMessage>
        <CardT title="1. お手続き"><div className="es-formgrid"><Ro label="ご希望のお手続き" v={ki!.t} /><Ro label="ご注意" v={ki!.f} cls="es-span-2" /></div></CardT>
        <CardT title={'2. 対象の拠点（' + (C.kind === 'cop' ? '法人' : C.picked.length + '拠点') + '）'}>
          {C.kind === 'cop' ? <p className="note">{data.corpName}（法人）</p> : (
            <Tbl cols={['拠点', 'ご契約番号', 'いまのご契約', 'ご契約開始年月', '最低利用期間']}>
              {C.picked.map((id) => { const b = siteOf(id)!; return <tr key={id}><Td v={<b>{b.name}</b>} /><Td v={b.cp} cls="es-mono" /><Td v={b.plan} /><Td v={b.start} /><Td v={b.term} /></tr>; })}
            </Tbl>
          )}
        </CardT>
        <CardT title="3. ご希望の内容">
          {C.picked.map((id) => {
            const b = C.kind === 'cop' ? null : siteOf(id);
            return (
              <div key={id} style={{ marginBottom: '0.857143rem' }}>
                <b className="cb-mh">{b ? b.name : data.corpName + '（法人）'}</b>
                <Tbl cols={[{ label: '項目', w: 220 }, '内容']}>{chSummary(C.kind!, b, valsOf(id)).map(([l, v], i) => <tr key={i}><Td v={corpTerm(l)} /><Td v={corpTerm(v)} /></tr>)}</Tbl>
              </div>
            );
          })}
        </CardT>
        <CardT title="4. お申し込みされる方">
          <WhoField cands={who} value={C.who} err={C.whoErr} word="お申し込み者" onPick={(w) => set({ who: w, whoErr: false })} />
          <p className="note">受付完了メールは、お申し込み者とメイン担当者の両方へお送りします。一覧にいない方は、先に拠点詳細の「編集」でご担当者に追加してください。</p>
        </CardT>
        <CardT title="お申し込みの前に">
          <p className="note">ESキッチンが内容を確認して承認すると、ご契約に反映されます。承認までの間は、同じ拠点に同じお手続きを重ねてお申し込みいただけません。</p>
          <div style={{ marginTop: '0.571429rem' }}><Checkbox label="上記の内容でお申し込みします" checked={C.agree} onChange={(on) => set({ agree: on, agreeErr: false })} /></div>
          {C.agreeErr ? <p className="es-field__msg es-field__msg--error">同意にチェックを入れてください</p> : null}
        </CardT>
      </div>
    );
  }

  return (
    <>
      <PageHead crumbs={[['申請', () => leave(() => router.push('/corp/requests/contract'))], '変更のお申し込み']} title="変更のお申し込み"
        stat={<><span>法人 <b>{data.corpName}</b></span>{ki ? <span className="k">お手続き <b>{ki.t}</b></span> : null}<span className="k">対象 <b>{C.kind === 'cop' ? '法人' : C.picked.length + '拠点'}</b></span></>} />
      {steps}
      {body}
      {!(C.step === 5 && C.no) ? (
        <Card>
          <div className="cb-foot">
            <span className="note">{C.step === 2 ? '同じお手続きなら、複数の拠点をまとめてお申し込みいただけます。開始したいご利用月は拠点ごとに選べます。' : C.step === 4 ? 'ESキッチンが内容を確認して承認すると、ご契約に反映されます。' : 'ご不明な点はお問い合わせください。'}</span>
            <span style={{ display: 'flex', gap: '0.571429rem' }}>
              <Button variant="outline" onClick={back}>{C.step > 1 ? '戻る' : '拠点一覧へ戻る'}</Button>
              {C.step < 4 ? <Button tone={C.kind === 'cxl' ? 'negative' : 'primary'} onClick={next}>次へ進む</Button>
                : <Button tone={C.kind === 'cxl' ? 'negative' : 'primary'} onClick={send}>この内容でお申し込みする</Button>}
            </span>
          </div>
        </Card>
      ) : null}
      {discard ? <ConfirmDiscard onCancel={() => setDiscard(null)} onConfirm={() => { const g = discard; setDiscard(null); g(); }} /> : null}
      {confirm ? (
        <div className="es-modal" role="dialog" aria-modal="true">
          <div className="es-modal__scrim" />
          <div className="es-modal__panel">
            <div className={cx('es-modal__mark', C.kind === 'cxl' ? 'es-modal__mark--negative' : 'es-modal__mark--info')} aria-hidden>{C.kind === 'cxl' ? '!' : '?'}</div>
            <h2 className="es-modal__title">{ki!.t}をお申し込みしますか？</h2>
            <div className="es-modal__body">{C.kind === 'cop' ? '法人情報が対象です' : C.picked.length + '拠点が対象です'}。ESキッチンが確認して承認します。</div>
            <div className="es-modal__actions">
              <Button variant="outline" size="lg" block onClick={() => setConfirm(false)}>戻る</Button>
              <Button tone={C.kind === 'cxl' ? 'negative' : 'primary'} size="lg" block onClick={doSend}>お申し込みする</Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
