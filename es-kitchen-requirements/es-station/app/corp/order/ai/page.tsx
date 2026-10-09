'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { aiSuggest, CHAT_ALIAS, checks, clone, isStd, prods, sumBy, yen, type AiState } from '@/lib/corp/order/logic';
import type { Qty } from '@/lib/corp/order/types';
import { Button, Card, Checkbox, ConfirmDiscard, EmptyState, Field, Head, InlineMessage, SegmentedControl, Switch, Table, Td, type Col } from '../_components/es';
import { api, useOrder } from '../_components/OrderProvider';
import { DlLabel, Loading, Thumb } from '../_components/parts';
import { prodImg } from '../_components/photo';

type Mode = AiState['mode'];
const TITLE: Record<Mode, string> = { even: '均等配分', past: '過去データを参照', chat: 'チャットで AI に指示' };

/** 入力チェックのメッセージ（_共通_メッセージ：E01・E313・E312・W204・S204） */
const E01 = (name: string) => name + 'をご入力ください。';
const E312 = '先に提案をお作りください。';
const E313 = '上限は下限以上の金額をご入力ください。';
const W204 = 'この提案のままでは登録できません。条件を変えて再度お試しください。';
const S204 = 'AI（自動提案）を反映しました。ご確認のうえ「登録」を押してください。';
type CondErr = { cats?: string; min?: string; max?: string };
/** 条件の入力チェック：カテゴリ（カテゴリ別のとき1つ以上）・金額の上限（上限のみ／範囲指定）・下限（範囲指定）は必須 E01、下限＞上限は E313 */
function condErrors(c: AiState['cond']): CondErr {
  const e: CondErr = {};
  if (c.byCat && !c.cats.length) e.cats = E01('商品カテゴリ');
  if (c.money !== 'none') {
    if (!c.max.trim()) e.max = E01('上限');
    if (c.money === 'range' && !c.min.trim()) e.min = E01('下限');
    if (c.money === 'range' && !e.min && !e.max && Number(c.min) > Number(c.max)) e.max = E313;
  }
  return e;
}

/** 月次注文 ＞ 商品注文 ＞ AI の提案（元：部品/23 の Ai・Preview）。?mode=even|past|chat */
export default function AiPage() {
  return <Suspense fallback={<Loading />}><Ai /></Suspense>;
}

function Ai() {
  const router = useRouter();
  const sp = useSearchParams();
  const mode = (['even', 'past', 'chat'].includes(sp.get('mode') || '') ? sp.get('mode') : 'even') as Mode;
  const { view } = useCorpSignedIn();
  const { data, s, S, set, acc, toast, toastError } = useOrder();
  const [discard, setDiscard] = useState(false);
  /** 条件の入力チェックの結果（「提案を作る」を押したあとだけ出す。条件を直したら消す） */
  const [cerr, setCerr] = useState<CondErr>({});
  const [busy, setBusy] = useState(false);
  /* 解約後（参照のみ）・受付が終わった月・休止中・お試しは AI の提案を使えない → 商品注文へ */
  const blocked = !!data && !!s && (view === 'ro' || !data.cycle.open || s.paused || s.trial);
  useEffect(() => { if (blocked) router.replace('/corp/order'); }, [blocked, router]);
  const started = useRef('');

  /* 開いたとき（元の startAi）。毎回はじめから */
  useEffect(() => {
    if (!data || !s || blocked || started.current === mode) return;
    started.current = mode;
    const ai: AiState = { mode, cond: { byCat: true, cats: data.cats.slice(), short: true, init: 'base', money: 'none', min: '', max: '' }, prev: null, showPrev: true, msgs: [], input: '' };
    if (mode === 'past') { ai.prev = aiSuggest(s, data.products, ai); ai.fail = !ai.prev; }
    if (mode === 'chat') ai.msgs = [{ me: false, t: 'こんにちは。' + s.short + 'の' + data.cycle.label + 'の注文を一緒に考えます。\n「サラダはなしで、肉を多めに」のように、ご希望を書いてください。', at: '10:02' }];
    set({ ai });
    window.scrollTo(0, 0);
  }, [data, s, mode, set, blocked]);

  if (!data || !s || blocked || !S.ai || S.ai.mode !== mode || started.current !== mode) return <Loading />;
  const ai = S.ai, P = data.products, title = TITLE[mode];
  const upd = (p: Partial<AiState> | ((a: AiState) => Partial<AiState>)) => set((o) => (o.ai ? { ai: { ...o.ai, ...(typeof p === 'function' ? p(o.ai) : p) } } : {}));
  const cond = <K extends keyof AiState['cond']>(k: K, v: AiState['cond'][K]) => { setCerr({}); upd((a) => ({ cond: { ...a.cond, [k]: v } })); };
  /** 「提案を作る」：入力チェック（E01・E313）に通らないときは作らない */
  const make = () => {
    const e = condErrors(ai.cond); setCerr(e);
    if (e.cats || e.min || e.max) return;
    upd((a) => { const prev = aiSuggest(s, P, a); return { prev, fail: !prev }; });
  };
  const toOrder = () => { set({ ai: null }); router.push('/corp/order'); };

  const apply = async () => {
    if (!ai.prev) { toast(E312, 'negative'); return; }
    if (busy) return;
    const prev: Qty = clone(ai.prev);
    setBusy(true);
    try {
      if (ai.next != null && ai.next !== !!data.next[s.id]) await api.action('setNext', { acc, site: s.id, next: ai.next });
    } catch (e) { toastError(e); setBusy(false); return; }
    set((o) => ({ qty: { ...o.qty, [s.id]: prev }, ai: null }));
    router.push('/corp/order');
    toast(S204);
  };
  const actions = [
    <Button key="c" variant="outline" tone="neutral" onClick={() => setDiscard(true)}>キャンセル</Button>,
    <Button key="o" disabled={!ai.prev || busy} onClick={apply}>確定（注文画面に反映）</Button>,
  ];
  const crumbs: (string | [string, (() => void) | null])[] = [['月次注文', null], ['商品注文', () => setDiscard(true)], 'AI（自動提案）：' + title];
  const dlg = discard ? <ConfirmDiscard onCancel={() => setDiscard(false)} onConfirm={() => { setDiscard(false); toOrder(); }} /> : null;

  /* 提案プレビュー */
  const preview = (() => {
    const q = ai.prev, onHide = mode === 'chat' ? () => upd({ showPrev: false }) : null;
    if (!q) return (
      <div className="od-prev"><div className="od-prev__h"><h3>AI 提案プレビュー</h3></div>
        {ai.fail ? <InlineMessage tone="warning" title={W204} /> : null}
        <EmptyState title="提案はまだありません" icon="CircleNotch">{mode === 'chat' ? '左のチャットでご希望を送ってください。' : '左の条件を選んで「この条件で提案を作る」を押してください。'}</EmptyState>
      </div>
    );
    const t = sumBy(s, P, q), rows: [typeof P[number], Record<string, number>, number][] = []; let amt = 0;
    prods(s, P).forEach((p) => { const r = q[p.id] || {}; let n = 0; Object.keys(r).forEach((k) => { n += r[k]; }); if (n) { amt += n * p.price; rows.push([p, r, n]); } });
    const cs = checks(s, P, q).filter((c) => c.state === 'ng');
    const cols: Col[] = [{ label: 'No', w: 44 }, { label: '写真', w: 56 }, { label: '商品名' }, { label: 'カテゴリ' }];
    if (mode !== 'even') cols.push({ label: '前月', cls: 'r' });
    s.dl.forEach((d) => cols.push({ label: <DlLabel d={d} />, cls: 'r' }));
    cols.push({ label: '合計数', cls: 'r' });
    return (
      <div className="od-prev">
        <div className="od-prev__h"><h3>{'AI 提案プレビュー（合計 ' + t.total + '食・' + yen(amt) + '）'}</h3>{onHide ? <Button variant="ghost" tone="neutral" size="sm" onClick={onHide}>プレビューを隠す</Button> : null}</div>
        {cs.length ? <InlineMessage tone="warning" title={W204}>{cs.map((c) => c.label + '：' + c.reason).join('／')}</InlineMessage> : null}
        <Table cls="od-tbl" cols={cols} rows={rows.map((x, i) => (
          <tr key={x[0].id}><Td v={i + 1} /><td><Thumb src={prodImg(x[0])} name={x[0].name} /></td><td className="w">{x[0].name}</td><Td v={x[0].cat} />
            {mode !== 'even' ? <Td v={x[0].past ? x[0].past * 2 + '個' : '新商品'} cls="r" /> : null}
            {s.dl.map((d) => <Td key={d.k} v={x[1][d.k] == null ? '—' : x[1][d.k]} cls="r" />)}<Td v={x[2] + '個'} cls="r" /></tr>
        ))} />
        <p className="note">「確定」で注文画面に反映します（まだ登録されません）。「キャンセル」「×」では反映しません。</p>
      </div>
    );
  })();

  if (mode === 'chat') {
    const send = (txt0?: string) => {
      const txt = (txt0 || ai.input || '').trim(); if (!txt) return;
      const boost = { ...(ai.boost || {}) }, notes: string[] = []; let noFrozen = ai.noFrozen, short = ai.cond.short;
      Object.keys(CHAT_ALIAS).forEach((k) => {
        const i = txt.indexOf(k); if (i < 0) return; const tail = txt.slice(i, i + k.length + 8), cat = CHAT_ALIAS[k];
        if (/なし|なく|抜き|いらない|不要|ゼロ|0/.test(tail)) { boost[cat] = 0; notes.push(cat + 'を入れない'); }
        else if (/多め|多く|増や|たくさん/.test(tail)) { boost[cat] = 2.5; notes.push(cat + 'を多めに'); }
        else if (/少なめ|減ら|控え/.test(tail)) { boost[cat] = 0.4; notes.push(cat + 'を少なめに'); }
      });
      if (/冷凍.{0,4}(なし|なく|いらない|不要)/.test(txt)) { noFrozen = true; notes.push(isStd(s) ? '冷凍をいちばん少なく（ご契約の範囲で、冷凍 ' + s.cap.frozen![0] + '個以上）' : '冷凍なし（このコースは冷凍がありません）'); }
      if (/短消費期限.{0,4}(なし|なく|いらない|不要|避け)/.test(txt)) { short = false; notes.push('短消費期限の商品を入れない'); }
      const na: AiState = { ...ai, boost, noFrozen, cond: { ...ai.cond, short }, showPrev: true };
      const prev = aiSuggest(s, P, na);
      if (!prev) {
        /* 条件に合う提案が作れない（W204。「確定」は押せない） */
        upd({ msgs: ai.msgs.concat([{ me: true, t: txt, at: '10:' + (10 + ai.msgs.length * 2) }, { me: false, t: 'ご希望の条件では、登録できる提案を作れませんでした。条件を変えてもう一度お伝えください。', at: '10:' + (11 + ai.msgs.length * 2) }]), input: '', prev: null, fail: true, boost, noFrozen, cond: na.cond, showPrev: true });
        return;
      }
      const tt = sumBy(s, P, prev);
      const reply = notes.length ? '承知しました。' + notes.join('・') + 'で、過去の注文実績（廃棄率＝捨てた数 ÷（前回の在庫 ＋ 届いた数）を考慮）をもとに提案を作り直しました。\n合計 ' + tt.total + '食（' + s.dl.map((d) => d.l + ' ' + tt.byDl[d.k]).join('／') + '）。右の提案プレビューで確認し、よければ「確定」を押してください。'
        : '過去の注文実績（廃棄率＝捨てた数 ÷（前回の在庫 ＋ 届いた数）を考慮）をもとに提案を作りました。合計 ' + tt.total + '食です。\nカテゴリを「なしで」「多めに」「少なめに」と書くと、その条件で作り直します。';
      upd({ msgs: ai.msgs.concat([{ me: true, t: txt, at: '10:' + (10 + ai.msgs.length * 2) }, { me: false, t: reply, at: '10:' + (11 + ai.msgs.length * 2) }]), input: '', prev, fail: false, boost, noFrozen, cond: na.cond, showPrev: true });
    };
    return (
      <div className="od-stack">
        <Head crumb={crumbs} title={'AI（自動提案）：' + title} actions={actions} />
        <Card>
          <div className={'od-ai chat' + (ai.showPrev ? '' : ' noprev')}>
            <div className="od-chat">
              <div className="od-chat__log">{ai.msgs.map((m, i) => <div key={i} className={'od-msg' + (m.me ? ' me' : '')}><div>{m.t}</div><small>{'10-05 ' + m.at}</small></div>)}</div>
              <div className="od-chat__sug">
                {['サラダはなしで、肉を多めに', '冷凍はなしで', '短消費期限の商品はなしで', '魚を多めに、甘いものは少なめに'].map((x) => <button key={x} type="button" onClick={() => send(x)}>{x}</button>)}
                {!ai.showPrev && ai.prev ? <button type="button" onClick={() => upd({ showPrev: true })}>提案プレビューを表示</button> : null}
              </div>
              <form className="od-chat__in" onSubmit={(e) => { e.preventDefault(); send(); }}>
                <div className="es-input es-input--md"><input value={ai.input} placeholder="ご希望を入力してください（例：サラダはなしで、肉を多めに）" onChange={(e) => upd({ input: e.target.value })} /></div>
                <Button type="submit" icon="EnvelopeSimple">送信</Button>
              </form>
            </div>
            {ai.showPrev ? preview : null}
          </div>
        </Card>
        {dlg}
      </div>
    );
  }

  const left = (
    <div className="od-stack">
      <div className="od-sec">
        <div className="od-step-h"><i>1</i><div><b>商品カテゴリ</b><small>提案に入れるカテゴリを選んでください。</small></div></div>
        <div className="od-togrow">カテゴリ別に設定する<Switch checked={ai.cond.byCat} onChange={(v) => cond('byCat', v)} /></div>
        {ai.cond.byCat ? (
          <div className="od-catchk">{data.cats.map((c) => {
            const on = ai.cond.cats.indexOf(c) >= 0;
            return <label key={c} className={on ? 'on' : ''}><Checkbox label={c} checked={on} onChange={(v) => cond('cats', v ? ai.cond.cats.concat([c]) : ai.cond.cats.filter((x) => x !== c))} /></label>;
          })}</div>
        ) : null}
        {cerr.cats ? <p className="es-field__msg es-field__msg--error" role="alert">{cerr.cats}</p> : null}
      </div>
      <div className="od-sec">
        <div className="od-step-h"><i>2</i><div><b>消費期限</b></div></div>
        <div className="od-togrow"><span>短消費期限の商品を含める<small>ON のとき、消費期限が短い商品も提案に入れます。</small></span><Switch checked={ai.cond.short} onChange={(v) => cond('short', v)} /></div>
      </div>
      <div className="od-sec">
        <div className="od-step-h"><i>3</i><div><b>金額（税込）</b><small>1品の定価で絞り込みます。</small></div></div>
        <SegmentedControl size="sm" value={ai.cond.money} items={[{ value: 'none', label: '制限なし' }, { value: 'max', label: '上限のみ' }, { value: 'range', label: '範囲指定' }]} onChange={(v) => cond('money', v)} />
        {ai.cond.money !== 'none' ? (
          <div className="od-money">
            {ai.cond.money === 'range' ? <Field label="下限（円）" required error={cerr.min}><div className="es-input es-input--md es-input--num"><input type="text" inputMode="numeric" placeholder="例）100" value={ai.cond.min} onChange={(e) => cond('min', e.target.value.replace(/\D/g, ''))} /></div></Field> : null}
            <Field label="上限（円）" required error={cerr.max}><div className="es-input es-input--md es-input--num"><input type="text" inputMode="numeric" placeholder="例）200" value={ai.cond.max} onChange={(e) => cond('max', e.target.value.replace(/\D/g, ''))} /></div></Field>
          </div>
        ) : null}
      </div>
      {mode === 'past' ? <InlineMessage tone="info" title="過去データの使い方">{'直近3ヶ月の注文数と廃棄率（捨てた数 ÷（前回の在庫 ＋ 届いた数））から、商品ごとに数を提案します。新商品は同じカテゴリの傾向から予測します。上限はプラン数（' + s.plan + '個）です。'}</InlineMessage> : null}
      <div className="od-sec">
        <div className="od-togrow">
          <span>次回以降も適用<small>ON にして「確定」すると、翌月からはご注文の受付開始日に、新しいメニューで AI（自動提案）を「過去データを参照」の標準の条件（カテゴリ・短消費期限・金額は拠点の設定どおり）で作って下書きに入れます（締切までに登録がなければその数で確定）。OFF の拠点はESキッチンの標準数に拠点の設定をかけた数です。</small></span>
          <Switch checked={ai.next == null ? !!data.next[s.id] : ai.next} onChange={(v) => upd({ next: v })} />
        </div>
      </div>
      <Button variant="outline" block onClick={make}>{ai.prev ? 'この条件で作り直す' : 'この条件で提案を作る'}</Button>
    </div>
  );
  return (
    <div className="od-stack">
      <Head crumb={crumbs} title={'AI（自動提案）：' + title} actions={actions} />
      <div className="od-ai"><Card>{left}</Card><Card>{preview}</Card></div>
      {dlg}
    </div>
  );
}
