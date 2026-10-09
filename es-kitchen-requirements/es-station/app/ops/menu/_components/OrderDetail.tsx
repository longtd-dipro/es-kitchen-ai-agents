'use client';

import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState, type ReactNode } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { isStale } from '@/lib/api/errors';
import { capTxt, clone, isStd, isVm, md, ordLabel, ORD_TONE, split, TEMP_L, ymJa, type Calc } from '@/lib/ops/menu/logic';
import type { Category, Dl, Master, Menu, Order, Site, SitePref } from '@/lib/ops/menu/types';
import {
  Badge, Button, Card, Chk, Dialog, FieldError, Head, InlineMessage, Ro, SaveErrorBar, SearchPanel, SectionTitle, Select, Stepper, Table, Td, TempTag, TextField,
} from './es';
import { Ask } from './menuEdit';
import { useDirty, useKeep, useMenu } from './MenuProvider';
import { api, DlLabel, Loading, NotFound, prodImg, Thumb, useMaster, WhoAt } from './parts';
import { fmtDate } from '@/lib/format/date';
import { useCanAct, useScreenCan } from '../../_ui/perm';

type OQ = { kw?: string; cat?: string; st?: string; tag?: string; noShort?: boolean; only?: boolean };
type Pref = { cats: string[]; short: boolean; price: number[]; ex: string[]; next: boolean; upd: string };

/** 拠点の設定（運営が直した値・なければ初期値） */
function sprefOf(sp: Record<string, SitePref>, x: Site, catNames: string[]): Pref {
  const p = sp[x.id] ?? ({} as Partial<SitePref>);
  return { cats: p.cats || catNames, short: p.short !== false, price: p.price || [100, 200], ex: p.ex || [], next: p.next != null ? p.next : x.ai === 'ON', upd: p.upd || '—（初期値のまま）' };
}

/** 商品注文詳細・編集（edit＝編集。保存すると ES登録済） */
export default function OrderDetail({ no, edit }: { no: string; edit: boolean }) {
  const mm = useMaster();
  const { data: o0 } = useQuery(api, 'order', { no });
  const { data: cats } = useQuery(api, 'cats');
  const { data: menus } = useQuery(api, 'menus');
  const { data: sp } = useQuery(api, 'spref');
  const [draft, setDraft] = useState<Order | null>(null);
  /* 編集を始めたときの版（同時更新の検知 E31）。あとで画面のデータが読み直されても、始めたときの版で保存する */
  const [baseVer, setBaseVer] = useState('');
  useEffect(() => { if (o0) { setDraft((d) => (edit ? d ?? clone(o0) : null)); setBaseVer((v) => (edit ? v || o0.ver : '')); } }, [o0, edit]);
  useDirty(!!(edit && draft && o0 && JSON.stringify(draft) !== JSON.stringify(o0)));
  if (!mm || o0 === undefined || !cats || !menus || !sp) return <Loading />;
  if (o0 === null) return <NotFound what="注文" />;
  if (edit && !draft) return <Loading />;
  const menu = menus.filter((m) => m.ym === o0.ym)[0];
  return <Body M={mm.M} C={mm.C} o0={o0} o={edit ? draft! : o0} edit={edit} setDraft={setDraft} cats={cats} menu={menu} sp={sp} baseVer={baseVer} />;
}

type ModalS = null | { type: 'stats' } | ({ type: 'spref'; site: string } & Omit<Pref, 'upd'>);

function Body({ M, C, o0, o, edit, setDraft, cats, menu, sp, baseVer }: { M: Master; C: Calc; o0: Order; o: Order; edit: boolean; setDraft: (f: (d: Order | null) => Order | null) => void; cats: Category[]; menu: Menu; sp: Record<string, SitePref>; baseVer: string }) {
  const { toast, toastError, leave, nav } = useMenu();
  const router = useRouter();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const [oq, setOq] = useKeep<OQ>('od.oq', { only: true });
  const [oqd, setOqd] = useKeep<OQ>('od.oqd', { only: true });
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [bulkN, setBulkN] = useState(1);
  const [bulkA, setBulkA] = useState(1);
  const [modal, setModal] = useState<ModalS>(null);
  const [stale, setStale] = useState(false);
  /* お客様へ知らせる（初期値はチェックなし＝知らせない：受付簿 #281） */
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(false);
  const catNames = cats.map((c) => c.name);
  const s = C.site(o.site), ds = C.dls(s, o.ym), t = C.sumBy(s, o.ym, o.q), ta = C.sumBy(s, o.ym, o.a), cap = C.adjCap(o), closed = menu.status !== '公開中';
  /*
   * 運営の編集の決まり（台帳 H・受付簿 #263・#264・#266・#270・#272）：
   *   取消した注文は参照のみ。便ごとの発注締め日（前半の便 B7・後半の便 D7）を過ぎた便は直せない（参照のみ・変更は代替品設定）。
   *   調整数はシステム管理だけが入れられる（お試し（自動）には足せない）。メニューから外れた商品は数を減らす・0にするだけ
   */
  const trial = !!s.trial, cancelled = o0.status === '取消';
  const shutD = (d: Dl) => !!o0.shut[d.k];
  const allShut = ds.length > 0 && ds.every(shutD), someShut = ds.some(shutD);
  const readOnly = cancelled || allShut;
  const isAdmin = screenCan('update', 'grant');
  const adjOk = (d: Dl) => isAdmin && !trial && !readOnly && !shutD(d);
  const qOk = (d: Dl) => !readOnly && !shutD(d);
  /** メニューから外れた商品（注文に残っている）：数は減らす・0にするだけ */
  const gone = (id: string) => menu.items.indexOf(id) < 0;
  const orig = (pid: string, k: string) => (o0.q[pid] && o0.q[pid][k]) || 0;
  const maxQ = (pid: string, k: string) => (gone(pid) ? orig(pid, k) : undefined);
  const prods = C.prodsFor(s, menu), prodIds = new Set(prods.map((p) => p.id));
  const ps = prods.concat(Object.keys(o.q).filter((id) => !prodIds.has(id)).map(C.prod).filter(Boolean));
  const f = oq;
  /* 商品タグはメニューの商品ごと（その月のタグ。商品マスタには持たない：台帳 F 2026-10-08） */
  const tagsOf = (pid: string) => menu.dm?.items.find((x) => x.productId === pid)?.tags ?? [];
  const tagNames = [...new Set((menu.dm?.items ?? []).flatMap((x) => x.tags))];
  const list = ps.filter((p) => {
    if (f.kw && (p.name + p.id).indexOf(f.kw) < 0) return false;
    if (f.cat && p.cat !== f.cat) return false;
    if (f.st && p.keep !== f.st) return false;
    if (f.tag && !tagsOf(p.id).includes(f.tag)) return false;
    if (f.noShort && p.exp) return false;
    if (f.only && !Object.keys(o.q[p.id] || {}).some((k) => o.q[p.id][k] > 0 || (o.a[p.id] || {})[k] > 0)) return false;
    return true;
  });
  const setN = (which: 'q' | 'a', pid: string, k: string, n: number) => setDraft((x) => { if (!x) return x; const d = clone(x); d[which][pid][k] = n; return d; });
  const selIds = Object.keys(sel).filter((k) => sel[k]);
  const grp = (fz: boolean) => ds.filter((d) => (d.t === 'frozen') === fz);
  const target = (d: Dl) => { const g = grp(d.t === 'frozen'), tot = d.t === 'frozen' ? t.frozen : s.plan - t.frozen; return split(tot, g.length)[g.indexOf(d)]; };
  const view = `/ops/menu/orders/${o0.no}`;
  const pref = sprefOf(sp, s, catNames);
  /** 調整率＝調整数 ÷ 食数（小数1桁。表示だけ：受付簿 #272） */
  const rateTxt = (s.plan ? (Math.round(ta.total / s.plan * 1000) / 10).toFixed(1) : '0.0') + '%（' + ta.total + '個）';

  /*
   * 保存できない条件（合計・冷蔵／冷凍の上限・便の差・調整数）は合計の下にインラインで出す（台帳 E「保存エラーの出し方」・受付簿 #76。
   * 「保存できません」のダイアログは出さない）。「保存」を押したあとは、直すまで出し続ける（tried）
   */
  const [tried, setTried] = useState(false);
  const ngs = edit && tried ? C.orderChecks(o).filter((c) => c.state === 'ng') : [];
  async function saveOrd(force = false) {
    if (C.orderChecks(o).some((c) => c.state === 'ng')) { setTried(true); window.scrollTo(0, 0); return; }
    setBusy(true);
    try {
      /* 調整数はシステム管理だけ・変えたときだけ送る（数だけ直す保存はオーダー管理の編集の権限） */
      const adj = isAdmin && !trial && JSON.stringify(o.a) !== JSON.stringify(o0.a);
      await api.action('saveOrder', { order: o, ...(adj ? { adjust: true } : {}), ...(notify ? { notify: true } : {}), baseVersion: baseVer, ...(force ? { force: true } : {}) });
      setStale(false);
      toast('保存しました。');
      router.push(view);
    } catch (e) {
      /* ほかの人が先に保存していた・出荷指示に拾い上げられた（E31）：警告。「上書きして保存」は force で送り直す */
      if (isStale(e)) { setStale(true); return; }
      toastError(e);
    } finally { setBusy(false); }
  }

  const sumBar = (
    <div className="od-sum">
      <div className="od-sum__tot">
        <div className={'od-sum__row is-main' + (t.total !== s.plan ? ' ng' : '')}><span>合計</span><b>{t.total}</b>{'/ ' + s.plan + '個'}</div>
        <div className="od-sum__row"><span><TempTag kind="mixed" /></span><b>{t.cold}</b>{'（' + capTxt(s.cap.chilled) + '）'}</div>
        {isStd(s) ? <div className="od-sum__row"><span><TempTag kind="frozen" /></span><b>{t.frozen}</b>{'（' + capTxt(s.cap.frozen!) + '）'}</div> : null}
        <div className={'od-sum__row' + (ta.total > cap ? ' ng' : '')}><span>調整数</span><b>{ta.total}</b>{'/ ' + cap + '個'}</div>
      </div>
      <div className="od-sum__dl">
        {ds.map((d) => {
          const n = t.byDl[d.k], tg = target(d), ok = Math.abs(n - tg) <= 1;
          return (
            <div key={d.k} className={'od-sum__d' + (ok ? '' : ' ng')}>
              <DlLabel d={d} /><span>{md(d.date)}</span>
              <span className="mo-dn">注文数 <b>{n}</b>{' / ' + tg + '個'}</span>
              <span className="mo-dn">調整数 <b>{ta.byDl[d.k] || 0}</b>個</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  /* 一括操作：締めた便・読み取りの調整数・メニューから外れた商品（増やせない）は変えない */
  const dOf = (k: string) => ds.find((d) => d.k === k)!;
  const bulk = edit && !readOnly ? (
    <div className="od-tools">
      <Chk label="全てチェック" checked={!!list.length && list.every((p) => sel[p.id])} onChange={(on) => { const m: Record<string, boolean> = {}; if (on) list.forEach((p) => { m[p.id] = true; }); setSel(m); }} />
      {selIds.length ? (
        <div className="od-bulk">
          <b>{selIds.length}品を選択中</b>
          <Button variant="outline" size="sm" icon="Trash" onClick={() => setDraft((x) => { if (!x) return x; const d = clone(x); selIds.forEach((id) => { if (!d.q[id]) return; Object.keys(d.q[id]).forEach((k) => { if (qOk(dOf(k))) d.q[id][k] = 0; if (d.a[id] && adjOk(dOf(k))) d.a[id][k] = 0; }); }); return d; })}>注文内容をクリア</Button>
          <span className="od-small">配送ごと注文数</span><Stepper value={bulkN} onChange={setBulkN} label="配送ごと注文数" />
          <Button size="sm" onClick={() => setDraft((x) => { if (!x) return x; const d = clone(x); selIds.forEach((id) => { if (!d.q[id]) return; Object.keys(d.q[id]).forEach((k) => { if (qOk(dOf(k))) d.q[id][k] = gone(id) ? Math.min(bulkN, orig(id, k)) : bulkN; }); }); return d; })}>適用</Button>
          {isAdmin && !trial ? <>
            <span className="od-small">配送ごと調整数</span><Stepper value={bulkA} onChange={setBulkA} label="配送ごと調整数" />
            <Button size="sm" onClick={() => setDraft((x) => { if (!x) return x; const d = clone(x); selIds.forEach((id) => { if (!d.a[id]) return; Object.keys(d.a[id]).forEach((k) => { if (adjOk(dOf(k))) d.a[id][k] = bulkA; }); }); return d; })}>適用</Button>
          </> : null}
        </div>
      ) : null}
    </div>
  ) : null;

  const head2 = (
    <>
      <tr>
        {(edit && !readOnly ? ['No', ''] : ['No']).concat(['写真', '商品名', 'カテゴリ', '短消費期限', '販売価格（税込）']).map((l, i) => <th key={i} rowSpan={2} className={l === '販売価格（税込）' ? 'r' : undefined}>{l}</th>)}
        {ds.map((d) => <th key={d.k} colSpan={2} className="dh mo-gh"><DlLabel d={d} /><div className="od-small">{md(d.date)}</div></th>)}
        <th colSpan={2} className="dh mo-gh">合計数</th>
      </tr>
      <tr>
        {ds.map((d) => <Fragment key={d.k}><th className="dh mo-sh">注文数</th><th className="dh mo-sh">調整数</th></Fragment>)}
        <th className="dh mo-sh">注文数</th><th className="dh mo-sh">調整数</th>
      </tr>
    </>
  );
  const rows = list.map((p, i) => {
    let tq = 0, tadj = 0;
    const on = !!sel[p.id], isGone = gone(p.id);
    const cells: ReactNode[] = ds.map((d) => {
      const q = o.q[p.id] && o.q[p.id][d.k], a = o.a[p.id] && o.a[p.id][d.k];
      if (q == null) return <Fragment key={d.k}><td className="dz">—</td><td className="dz">—</td></Fragment>;
      tq += q; tadj += a || 0;
      return (
        <Fragment key={d.k}>
          <td className="c">{edit ? <Stepper value={q} label={p.name + ' ' + d.l + ' 注文数'} disabled={!qOk(d)} max={maxQ(p.id, d.k)} onChange={(n) => setN('q', p.id, d.k, n)} /> : q}</td>
          <td className="c mo-adj">{edit ? <Stepper value={a || 0} label={p.name + ' ' + d.l + ' 調整数'} disabled={!adjOk(d)} onChange={(n) => setN('a', p.id, d.k, n)} /> : (a || 0)}</td>
        </Fragment>
      );
    });
    return (
      <tr key={p.id} className={on ? 'is-sel' : undefined}>
        <Td v={i + 1} />
        {edit && !readOnly ? <td><Chk checked={on} onChange={(v) => setSel({ ...sel, [p.id]: v })} /></td> : null}
        <td><Thumb src={prodImg(p)} /></td>
        <td className="w">
          <b>{p.name}</b>
          <div className="od-small">{p.id + '・' + TEMP_L[p.keep]}</div>
          {p.mgmt ? <div className="od-small od-mgmt">{p.mgmt}</div> : null}
          <div className="od-small od-supplier">{p.sup || '—'}</div>
          {isGone ? <div className="od-small od-removed">メニューから外れました</div> : null}
        </td>
        <Td v={p.cat} /><Td v={p.exp || '—'} /><Td v={p.price + '円'} cls="r" />
        {cells}
        <Td v={<b>{tq}個</b>} cls="c" /><Td v={tadj + '個'} cls="c mo-adj" />
      </tr>
    );
  });

  const acts = edit
    ? <><Button variant="outline" size="lg" onClick={() => leave(() => router.push(view))}>キャンセル</Button>{!readOnly && canAct(api, 'saveOrder') ? <Button size="lg" disabled={busy} onClick={() => saveOrd()}>保存</Button> : null}</>
    /* 権限がなければ・取消した注文と発注締め日を過ぎた注文（参照のみ）には出さない */
    : canAct(api, 'saveOrder') && !readOnly ? <Button size="lg" icon="PencilSimple" onClick={() => router.push(view + '/edit')}>編集</Button> : null;
  const oqdSet = (k: keyof OQ) => (v: string | boolean) => setOqd({ ...oqd, [k]: v });
  const kid = s.kid && s.kid !== '—' ? s.kid.replace(/-\d{6}$/, '-' + o.ym.replace('-', '')) : '—';

  return (
    <>
      <Head crumb={['メニュー管理', ['商品注文管理', () => nav('/ops/menu/orders')], '商品注文詳細']}
        title={<>{'商品注文' + (edit ? '編集' : '詳細') + ' '}<span className="es-mono">{o.no}</span>{' '}{o.status ? <Badge tone={ORD_TONE[o.status]}>{ordLabel(o.status)}</Badge> : null}</>} actions={acts} />
      <SaveErrorBar n={ngs.length} />
      <Card>
        <SectionTitle>基本情報</SectionTitle>
        <div className="od-g4">
          <Ro label="対象年月（サイクル月）" v={ymJa(o.ym)} />
          <Ro label="法人ID" v={<span className="es-mono">{s.corp}</span>} />
          <Ro label="法人名" v={s.corpName} />
          <Ro label="拠点ID" v={<span className="es-mono">{s.id}</span>} />
          <Ro label="拠点名" v={s.short} />
          <Ro label="子契約ID" v={<span className="es-mono">{kid}</span>} />
          <Ro label="プラン" v={s.planId + ' ' + s.plan + 'プラン'} />
          <Ro label="コース" v={s.course} />
          <Ro label="自販機" v={isVm(s) ? 'あり（' + s.eq + '）' : 'なし'} />
          <Ro label="オーダーステータス" v={ordLabel(o.status)} />
          <Ro label="月次提供数" v={'合計 ' + s.plan + '個・冷蔵・常温 ' + capTxt(s.cap.chilled) + (isStd(s) ? '・冷凍 ' + capTxt(s.cap.frozen!) : '')} />
          <Ro label="配送回数" v={'冷蔵 ' + grp(false).length + '回' + (grp(true).length ? '・冷凍 ' + grp(true).length + '回' : '') + '（' + s.dlvKind + '）'} />
          <Ro label="基準数パターン（基本比×倍）" v={s.mult + '倍（基準数 50個あたり × ' + s.mult + '）'} />
          <Ro label="調整率" v={rateTxt} />
          <Ro label="オーダー受付期間" v={s.trial ? '発注締め日まで（B7・D7）' : fmtDate(menu.from) + '〜' + fmtDate(menu.to)} />
          <Ro label="法人の登録" v={<WhoAt o={o} k="corp" />} />
          <Ro label="ES の変更" v={<WhoAt o={o} k="es" />} />
          <Ro label="最終更新" v={o.upd} />
        </div>
      </Card>
      {s.trial ? <InlineMessage tone="info" title="お試しのオーダー（自動生成）">お試しのオーダーは、全部の商品を少しずつ受け取れるよう月次提供数を全商品に按分して自動で作ります（運営の標準数は使いません。便の差は ±1）。法人Webでは参照だけです。運営は発注締め日（B7・D7）まで個数も商品も直せます（「編集」）。そのあとは参照のみです。お試し期間が2ヶ月以上なら、毎月自動で作ります。メニューの商品が増減したときは、外した商品を除いて作り直します（締めの前だけ。標準数の変更では作り直しません）。</InlineMessage> : null}
      <Card>
        <SectionTitle action={canAct(api, 'saveSpref') ? <Button variant="outline" icon="GearSix" onClick={() => setModal({ type: 'spref', site: s.id, cats: pref.cats, short: pref.short, price: pref.price, ex: pref.ex, next: pref.next })}>拠点の設定を直す</Button> : null}>拠点の設定（デフォルト注文・AI の提案に使う）</SectionTitle>
        <div className="od-g4">
          <Ro label="カテゴリ" v={pref.cats.length === catNames.length ? 'すべて（' + catNames.length + '）' : pref.cats.join('・') + '（' + pref.cats.length + '／' + catNames.length + '）'} />
          <Ro label="短消費期限の商品" v={pref.short ? '取る' : '取らない（短消費期限なしの標準数を使う）'} />
          <Ro label="商品の金額（税込）" v={pref.price.map((y) => y + '円').join('・')} />
          <Ro label="次回以降も適用" v={pref.next ? 'ON（AI の提案を下書きに入れる）' : 'OFF（運営の標準数にこの設定をかける）'} />
          <Ro label="対象外の商品（毎月0個）" v={pref.ex.length ? pref.ex.map((id) => { const x = M.products.find((p) => p.id === id); return x ? x.name : id; }).join('・') : 'なし'} cls="span2" />
          <Ro label="最終更新" v={pref.upd} />
        </div>
        <p className="mo-note">法人Webの「商品注文 ＞ 注文の設定」と同じ設定です。運営が直したときは、翌月のメニューから使います（この月の注文は変えません。直すときは上の「編集」）。</p>
      </Card>
      {edit && readOnly ? (
        <InlineMessage tone="warning" title={cancelled ? '取消した注文は参照のみです' : '参照のみです（発注締め日を過ぎています）'}>
          {cancelled ? '休止・解約で取り消した注文は、運営も編集できません。'
            : `発注締め日（前半の便 ${fmtDate(o0.closeOn.front)}・後半の便 ${fmtDate(o0.closeOn.back)}）を過ぎた注文は、運営も編集できません。数の入力欄・調整数は読み取りで、「保存」は出しません。代替品・欠品などで変えるときは代替品設定を使ってください。`}
        </InlineMessage>
      ) : null}
      {edit && !readOnly ? (
        <InlineMessage tone={closed ? 'warning' : 'info'} title={closed ? '締切後の変更' : 'ES が代わりに登録します'}>
          {(closed ? 'オーダー締切を過ぎた注文です。直すと、注文と配送データの明細だけが変わります（出荷指示・発注・請求は自動では変わりません。出荷・配送管理と発注で手当てしてください）。' : '保存すると、この拠点のステータスは「ESキッチン入力済み」になります。')
            + (someShut ? `発注締め日（前半の便 ${fmtDate(o0.closeOn.front)}・後半の便 ${fmtDate(o0.closeOn.back)}）を過ぎた便は直せません（読み取り）。` : '')
            + (trial ? 'お試し（自動）の注文には調整数を足せません。' : isAdmin ? '' : '調整数を入れられるのはシステム管理だけです。')}
        </InlineMessage>
      ) : null}
      <Card>
        <SectionTitle action={<Button variant="outline" onClick={() => setModal({ type: 'stats' })}>統計</Button>}>注文内容</SectionTitle>
        <SearchPanel sig={JSON.stringify(oqd)} onSearch={() => setOq({ ...oqd })} onClear={() => { setOq({}); setOqd({}); }}
          more={[
            <Select key="st" placeholder="保存方法" value={oqd.st ?? ''} options={[{ value: 'chilled', label: '冷蔵' }, { value: 'ambient', label: '常温' }, { value: 'frozen', label: '冷凍' }]} onChange={oqdSet('st')} />,
            <Select key="tag" className="ord-msel" placeholder="商品タグ" value={oqd.tag ?? ''} options={tagNames} onChange={oqdSet('tag')} />,
            <div key="c1" className="mo-chk"><Chk label="短消費期限なし" checked={!!oqd.noShort} onChange={(v) => setOqd({ ...oqd, noShort: v })} /></div>,
            <div key="c2" className="mo-chk"><Chk label="注文している商品のみ表示" checked={!!oqd.only} onChange={(v) => setOqd({ ...oqd, only: v })} /></div>,
          ]}>
          <TextField key="kw" className="es-grow ord-kw" icon="Search" placeholder="商品名、商品ID" value={oqd.kw ?? ''} onChange={oqdSet('kw')} />
          <Select key="cat" placeholder="カテゴリ" value={oqd.cat ?? ''} options={catNames} onChange={oqdSet('cat')} />
        </SearchPanel>
        {sumBar}
        {ngs.map((c, i) => <FieldError key={i}>{c.label}</FieldError>)}
        {bulk}
        <Table rows={rows} cls="mo-ordtbl" head={head2} />
      </Card>
      {o.extra.length ? (
        <Card>
          <SectionTitle>代替品・補償の追加（代替品設定から）</SectionTitle>
          <Table cls="ord-wrap" cols={[{ label: '代替品設定' }, { label: '区分' }, { label: '便（納品日）' }, { label: '商品' }, { label: '数量', cls: 'r' }, { label: '請求' }, { label: '下流への反映' }]}
            rows={o.extra.map((x, i) => <tr key={i}><Td v={x.alt} cls="es-mono" /><Td v={x.kind} /><Td v={x.dl} /><Td v={x.name} /><Td v={x.n + '個'} cls="r" /><Td v={x.bill} /><Td v={x.flow || '—'} /></tr>)} />
        </Card>
      ) : null}
      {edit && !readOnly && canAct(api, 'saveOrder') ? (
        <Card>
          <div className="mo-notify"><Chk label="お客様へ知らせる" checked={notify} onChange={setNotify} /></div>
          <p className="mo-note">保存と同時に、法人・拠点へ「商品注文を ES が変更しました」と知らせます。外したままだと、知らせずに保存します（変更履歴には残ります）。</p>
        </Card>
      ) : null}
      <Card>
        <SectionTitle>変更履歴</SectionTitle>
        <Table cols={[{ label: '日時', w: 150 }, { label: '変更した人' }, { label: '操作' }, { label: '項目' }, { label: '変更前' }, { label: '変更後' }, { label: '理由' }]} cls="od-log"
          rows={o.log.map((r, i) => (
            <tr key={i}>
              <Td v={r.at} cls="es-num" /><Td v={r.who} />
              <td>{r.who.indexOf('運営') >= 0 ? <Badge tone="warning">{r.what}</Badge> : r.what}{r.item ? null : <div className="od-small">{r.detail}</div>}</td>
              <Td v={r.item} /><Td v={r.before} /><Td v={r.after} /><Td v={r.why} />
            </tr>
          ))} />
      </Card>

      {stale ? (
        <Ask mark="!" title="内容が更新されています" onClose={() => setStale(false)}
          buttons={<><Button variant="outline" size="lg" block onClick={() => setStale(false)}>キャンセル</Button><Button size="lg" block disabled={busy} onClick={() => { void saveOrd(true); }}>上書きして保存</Button></>}>
          <p>他のユーザーにより内容が更新されています。上書きすると保存されます。</p>
        </Ask>
      ) : null}
      {modal?.type === 'stats' ? <Stats C={C} o={o} cats={cats} onClose={() => setModal(null)} /> : null}
      {modal?.type === 'spref' ? <SprefDialog M={M} s={s} st={modal} catNames={catNames} set={(p) => setModal({ ...modal, ...p })} onClose={() => setModal(null)}
        onSave={async () => {
          const { cats: c, short, price, ex, next } = modal;
          try {
            await api.action('saveSpref', { site: modal.site, pref: { cats: c, short, price, ex, next } });
            setModal(null);
            toast('拠点の設定を保存しました。翌月のメニューから使います。');
          } catch (e) { toastError(e); }
        }} /> : null}
    </>
  );
}

/** 統計（カテゴリごとの品数・便ごとの数） */
function Stats({ C, o, cats, onClose }: { C: Calc; o: Order; cats: Category[]; onClose: () => void }) {
  const s = C.site(o.site), ds = C.dls(s, o.ym), t = C.sumBy(s, o.ym, o.q);
  const rows = cats.map((c) => {
    const by: Record<string, number> = {}; let n = 0; ds.forEach((d) => { by[d.k] = 0; });
    Object.keys(o.q).forEach((pid) => { if (C.prod(pid).cat !== c.name) return; let any = 0; Object.keys(o.q[pid]).forEach((k) => { by[k] += o.q[pid][k]; any += o.q[pid][k]; }); if (any) n++; });
    return { c: c.name, n, by };
  }).filter((r) => r.n);
  return (
    <Dialog title="統計" id={s.short + '・' + ymJa(o.ym)} width={820} onClose={onClose} footer={<Button variant="outline" onClick={onClose}>閉じる</Button>}>
      <div className="od-dlg">
        <Table cols={[{ label: 'カテゴリ' }, { label: '品数', cls: 'r' }, ...ds.map((d) => ({ label: <DlLabel d={d} />, cls: 'r' })), { label: '計', cls: 'r' }]}
          rows={rows.map((r) => {
            let sm = 0;
            return <tr key={r.c}><Td v={r.c} /><Td v={r.n + '品'} cls="r" />{ds.map((d) => { sm += r.by[d.k]; return <Td key={d.k} v={r.by[d.k] + '個'} cls="r" />; })}<Td v={sm + '個'} cls="r" /></tr>;
          }).concat([<tr key="sum" className="att"><Td v={<b>計</b>} /><Td v={t.items + '品'} cls="r" />{ds.map((d) => <Td key={d.k} v={<b>{t.byDl[d.k]}個</b>} cls="r" />)}<Td v={<b>{t.total}個</b>} cls="r" /></tr>])} />
      </div>
    </Dialog>
  );
}

/** STEP5-MORE-20261001 ③：拠点の設定を運営が直す */
function SprefDialog({ M, s, st, catNames, set, onClose, onSave }: { M: Master; s: Site; st: Omit<Pref, 'upd'>; catNames: string[]; set: (p: Partial<Omit<Pref, 'upd'>>) => void; onClose: () => void; onSave: () => void }) {
  const box = { display: 'flex', flexWrap: 'wrap' as const, gap: '6px 16px', margin: '6px 0 12px' };
  return (
    <Dialog title={'拠点の設定（' + s.short + '）'} width={680} onClose={onClose}
      footer={<div style={{ display: 'flex', gap: '0.857143rem' }}><Button variant="outline" onClick={onClose}>キャンセル</Button><Button onClick={onSave}>保存</Button></div>}>
      <div className="od-dlg ord-spref">
        <p className="mo-note">法人が法人Webで直した設定と同じものです。運営が代わりに直すときに使います（例：お客様から電話で依頼があった）。</p>
        <h4>カテゴリ（OFF のカテゴリは0個にします）</h4>
        <div style={box}>{catNames.map((c) => <span key={c}><Chk label={c} checked={st.cats.indexOf(c) >= 0} onChange={(v) => set({ cats: v ? st.cats.concat([c]) : st.cats.filter((x) => x !== c) })} /></span>)}</div>
        <div className="od-togrow"><span>短消費期限の商品を取る<small>OFF：短消費期限の商品を入れません（短消費期限なしの標準数を使います）</small></span><Chk checked={st.short} onChange={(v) => set({ short: v })} /></div>
        <h4>商品の金額</h4>
        <div style={box}>{[100, 200].map((y) => <span key={y}><Chk label={y + '円の商品'} checked={st.price.indexOf(y) >= 0} onChange={(v) => set({ price: v ? st.price.concat([y]) : st.price.filter((x) => x !== y) })} /></span>)}</div>
        <h4>対象外の商品（毎月0個にします）</h4>
        <div style={{ ...box, maxHeight: '12.857143rem', overflow: 'auto' }}>
          {M.products.filter((p) => isStd(s) || p.st !== 'frozen').map((p) => <span key={p.id}><Chk label={p.name} checked={st.ex.indexOf(p.id) >= 0} onChange={(v) => set({ ex: v ? st.ex.concat([p.id]) : st.ex.filter((x) => x !== p.id) })} /></span>)}
        </div>
        <div className="od-togrow"><span>次回以降も適用（AI の提案を下書きに入れる）<small>ON：オーダー開始日に AI の提案を下書きに入れます。OFF：運営の標準数にこの設定をかけた数です。</small></span><Chk checked={st.next} onChange={(v) => set({ next: v })} /></div>
      </div>
    </Dialog>
  );
}

