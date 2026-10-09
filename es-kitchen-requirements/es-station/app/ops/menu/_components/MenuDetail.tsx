'use client';

import { OpsCsvExport } from '../../_ui/csv';
import { useRouter } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { DEMO } from '@/lib/demo';
import { errorMessage, isStale } from '@/lib/api/errors';
import { today } from '@/lib/supplier/dates';
import type { CorpPublish, MenuItem } from '@/lib/domain/types';
import { BASE_KINDS, BASE_LABEL } from '@/lib/domain/menu';
import { mgmtNameOf } from '@/lib/domain/product';
import { clone, costOf, FR_L, fromIso, MENU_TONE, menuLabel, toIso, type Calc, type Check } from '@/lib/ops/menu/logic';
import { avgTargetError, inactiveError } from '@/lib/domain/menu';
import type { Base, Frame, Menu } from '@/lib/ops/menu/types';
import { Icon as OpsIcon } from '@/app/ops/_ui/Icon';
import { Badge, Button, Card, CheckList, Chk, Dialog, Field, FieldError, Head, InlineMessage, DInp, Inp, Kari, Ro, SaveErrorBar, SectionTitle, Sel, Stepper, Table, Td } from './es';
import { useDirty, useMenu } from './MenuProvider';
import { api, Loading, NotFound, useMaster } from './parts';
import { useCanAct } from '../../_ui/perm';
import {
  addItems, Ask, asMenu, baseCheck, draftOf, PdfDialog, AddProduct, ProductTable, readiness, ReadyPanel, Stats, useLookup, type Draft, type Lookup, type View,
} from './menuEdit';
import '@/app/ops/masters/products/products.css';
import { fmtDate, fmtDatesIn } from '@/lib/format/date';

/** 公開できないときの条件の一覧（保存エラーは項目の下にインライン・受付簿 #76。これは公開の条件） */
export function NgDialog({ title, cs, onClose, lead = '公開の条件を満たしていないため、公開できません。「非公開」か「自動公開」で保存してください。' }: { title: string; cs: Check[]; onClose: () => void; lead?: string }) {
  return (
    <Dialog title={title} width={640} onClose={onClose} footer={<Button onClick={onClose}>戻る</Button>}>
      <div className="od-dlg"><p>{lead}</p><CheckList items={cs} /></div>
    </Dialog>
  );
}

/**
 * 月間メニュー詳細・登録（編集）。Phase 1 画面 01〜09（月間メニュー登録・商品一覧・商品追加・CSV取込・メニューPDF・保存の確認・トースト・商品タグ・指標一覧）。
 * データは共通データ（運営の領域 menu の menuEdit → lib/ops/menu/edit.ts）。保存は saveMenuEdit（共通データの menu.save・menu.publish）
 */
export default function MenuDetail({ ym, edit }: { ym: string; edit: boolean }) {
  const mm = useMaster();
  const { data: v0 } = useQuery(api, 'menuEdit', { ym });
  const { data: m0 } = useQuery(api, 'menu', { ym });
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  /* 編集を始めたときの版（同時更新の検知 E31）。あとで画面のデータが読み直されても、始めたときの版で保存する */
  const [baseVer, setBaseVer] = useState('');
  const v = v0 as View | null | undefined;
  /** CSV取込のあと（保存済み）、読み直したデータで下書きを作り直す */
  const reinit = async () => { const f = await api.query('menuEdit', { ym }); if (f) { setDraft(draftOf(f as View)); setBaseVer((f as View).ver); } };

  /* 編集は「編集中」「公開中」「締切済」のメニュー（配送中・終了は編集できない：受付簿 #253・#256）。開いたときの値を下書きにする */
  useEffect(() => {
    if (!v) return;
    if (edit && !editable(v.menu.status)) { router.replace(`/ops/menu/monthly/${ym}`); return; }
    if (!edit) { setDraft(null); return; }
    if (!draft) { setDraft(draftOf(v)); setBaseVer(v.ver); }
  }, [v, edit, ym, router, draft]);
  useDirty(!!(edit && draft && v && JSON.stringify(draft) !== JSON.stringify(draftOf(v))));

  if (!mm || v === undefined || m0 === undefined) return <Loading />;
  if (v === null || m0 === null) return <NotFound what="メニュー" />;
  if (edit && !draft) return <Loading />;
  return <Body C={mm.C} v={v} m0={m0} d={edit ? draft! : draftOf(v)} edit={edit} baseVer={baseVer} setDraft={setDraft} onReinit={reinit} />;
}

/** 直せるメニュー：編集中・公開中・締切済（配送中・終了は編集できない）。締切済は商品の追加・外す・基準注文数を変えられない */
const editable = (status: string) => status === '編集中' || status === '公開中' || status === '締切済';

type ImpactRow = { productId: string; keep: string[]; rebuild: string[] };
type Impact = { total: { keep: string[]; rebuild: string[] }; byProduct: ImpactRow[] };
type ModalS = null
  | { type: 'ng'; title: string; cs: Check[]; lead?: string }
  /* ask：保存の確認。update＝公開済み（公開中・締切済）の保存の確認（1枚にまとめる：受付簿 #276）、sum＝合計が50でない（編集中の保存） */
  | { type: 'ask'; kind: 'publish' | 'toAuto' | 'auto' | 'update' | 'sum'; notify: boolean; impact?: Impact | null; early?: boolean }
  | { type: 'add' } | { type: 'pdf' } | { type: 'stats' }
  | { type: 'stale' };

function Body({ C, v, m0, d, edit, baseVer, setDraft, onReinit }: { C: Calc; v: View; m0: Menu; d: Draft; edit: boolean; baseVer: string; setDraft: (f: (d: Draft | null) => Draft | null) => void; onReinit: () => void }) {
  const { toast, toastError, leave, nav, put } = useMenu();
  const router = useRouter();
  const canAct = useCanAct();
  const L = useLookup(v);
  const [modal, setModal] = useState<ModalS>(null);
  const [busy, setBusy] = useState(false);
  const m = v.menu, closed = m.status === '締切済', isPub = m.status === '公開中' || m.status === '締切済', canEdit = editable(m.status);
  const view = `/ops/menu/monthly/${m.id}`;
  const upd = (p: Partial<Draft>) => setDraft((x) => (x ? { ...x, ...p } : x));
  /* 自動計算＝提案（①按分 → ②平均単価の調整。「調整を戻す」のときは ①だけ） */
  const setItems = (items: MenuItem[], recalc?: boolean) => upd({ items: recalc ? L.recalc(items, d.avgTarget, !d.noAdjust).items : items });
  /* 旧来の集計の部品（按分の見本・自販機の標準数）に渡すメニュー（下書きの基準注文数） */
  const menuNow: Menu = { ...m0, items: d.items.map((x) => x.productId), vmN: d.vmN ?? undefined, avgT: d.avgTarget,
    base: Object.fromEntries(d.items.map((x) => [x.productId, { std: x.base.std, lite: x.base.std, ns: x.base.ns, vm: x.base.vm, man: { ...x.manual } } as Base])) };
  const setMenuDraft = (f: (x: Menu | null) => Menu | null) => setDraft((x) => (x ? { ...x, vmN: f(menuNow)?.vmN ?? x.vmN } : x));
  const rd = readiness(v, L, d, isPub ? 'saved' : 'publish'), bc = baseCheck(L, d.items);
  const firstPdf = d.pdfs[0];
  /* 自動公開の日（メニュー公開日）になっても条件が足りない（保存してある内容で判定） */
  const autoFail = m.status === '編集中' && m.corpPublish === '自動公開' && m.publishOn && today() >= m.publishOn ? readiness(v, L, draftOf(v)).missing : [];

  /* ---------- 保存（Phase 1 画面 07 保存の確認） ---------- */
  /*
   * 保存できない条件は項目の下にインラインで出す（台帳 E「保存エラーの出し方」・受付簿 #76。「保存できません」のダイアログは出さない）：
   *   dates＝3つの日付（E01・E120）、avg＝平均仕入単価の目標、items＝商品一覧、合計（bc.msgs＝手で直した値だけで 50 超：E123）は商品一覧の合計の下（menuEdit）。
   * 種類ごとの合計が 50 でないことは保存を止めず、保存の確認（Q115）で確かめる（受付簿 #249・#256）。
   * 「保存」を押したあとは、直すまで出し続ける（tried）
   */
  const [tried, setTried] = useState(false);
  /* 公開後：公開日・開始日は変えられない。締切日は今日以降（元の締切日がまだ来ていないときだけ。受付簿 #266） */
  const dateReq = (k: 'publishOn' | 'orderFrom' | 'orderTo', label: string) => (!d[k] ? `${label}は必須項目です。` : '');
  const errs = {
    pub: dateReq('publishOn', 'メニュー公開日'), from: dateReq('orderFrom', 'オーダー開始日'), to: dateReq('orderTo', 'オーダー締切日'),
    order: d.publishOn && d.orderFrom && d.orderTo && !(d.publishOn <= d.orderFrom && d.orderFrom < d.orderTo) ? 'メニュー公開日はオーダー開始日以前、開始日は締切日より前にしてください。' : '',
    past: isPub && d.orderTo && d.orderTo !== m.orderTo && d.orderTo < today() ? 'オーダー締切日は今日以降の日付にしてください。' : '',
    avg: edit && !isPub ? avgTargetError(d.avgTarget) ?? '' : '',
    items: !d.items.length ? '商品を1つ以上入れてください' : (edit ? inactiveError(d.items, L.prod) : null) ?? '',
  };
  const errN = [errs.pub, errs.from, errs.to, errs.order, errs.past, errs.avg, errs.items].filter(Boolean).length + bc.msgs.length;
  const show = edit && tried;
  /** 保存の確認を出す前に、公開の条件（公開済みの保存：PDF・全商品が公開可能・メイン画像）を確かめる */
  async function onSave() {
    if (errN) { setTried(true); window.scrollTo(0, 0); return; }
    /* 公開済み（公開中・締切済）：公開の条件のうち PDF・全商品が公開可能・メイン画像が足りなければ止める（合計 50 は止めない：受付簿 #265） */
    if (isPub) {
      if (!rd.ready) { setModal({ type: 'ng', title: '公開できません', lead: '公開の条件を満たしていないため、保存できません。足りない条件を直してください。', cs: rd.items }); return; }
      /* 商品を外すとき：その商品を含む注文の件数（残る注文・作り直される注文。受付簿 #255・#266） */
      const removed = m.status === '公開中' ? v.menu.items.filter((x) => !d.items.some((y) => y.productId === x.productId)).map((x) => x.productId) : [];
      let impact: Impact | null = null;
      if (removed.length) {
        try { impact = (await api.query('impact', { ym: m.id, productIds: removed })) as Impact; } catch (e) { toastError(e); return; }
        if (!impact.total.keep.length && !impact.total.rebuild.length) impact = null;
      }
      setModal({ type: 'ask', kind: 'update', notify: false, impact, early: m.status === '公開中' && d.orderTo < v.menu.orderTo });
      return;
    }
    /* 公開（保存して公開）は合計 50 が条件なので、足りなければ「公開できません」で止める（合計の確認は出さない） */
    if (bc.bad.length && d.corpPublish !== '公開') { setModal({ type: 'ask', kind: 'sum', notify: false }); return; }
    afterSum();
  }
  /** 合計の確認のあと（編集中の保存）：公開ステータスごとの確認 */
  function afterSum() {
    if (d.corpPublish === '公開') {
      if (!rd.ready) { setModal({ type: 'ng', title: '公開できません', cs: rd.items }); return; }
      setModal({ type: 'ask', kind: 'publish', notify: false }); return;
    }
    if (d.corpPublish === '自動公開') { setModal({ type: 'ask', kind: 'auto', notify: false }); return; }
    if (rd.ready) { setModal({ type: 'ask', kind: 'toAuto', notify: false }); return; }
    void save(d, false);
  }
  async function save(x: Draft, publish: boolean, notify = false, force = false) {
    setBusy(true);
    try {
      const out = await api.action('saveMenuEdit', { ym: m.id, data: { items: x.items, corpPublish: x.corpPublish, pdfs: x.pdfs, publishOn: x.publishOn, orderFrom: x.orderFrom, orderTo: x.orderTo, avgTarget: x.avgTarget, noAdjust: x.noAdjust }, publish, notify, vmN: x.vmN, baseVersion: baseVer || v.ver, ...(force ? { force: true } : {}) });
      setModal(null);
      setDraft(() => null);
      /* S01・S110（保存して公開）・S111（自動公開）・S112（公開中の再通知） */
      toast(publish ? '保存して公開しました。法人へお知らせしました。'
        : isPub ? (notify ? '保存しました。法人へ再通知しました。' : '保存しました。')
          : out.corpPublish === '自動公開' ? `保存しました。${fmtDate(out.autoPublishOn)}に自動公開します。` : '保存しました。');
      router.push(view);
    } catch (e) {
      /* 他の人が先に保存していた（E31）：警告。「上書きして保存」は force で送り直す */
      if (isStale(e)) { setModal({ type: 'stale' }); return; }
      setModal(null);
      toastError(e);
    } finally { setBusy(false); }
  }

  /* ---------- 商品 ---------- */
  /* 商品を外す：注文に入っていても外せる（登録済・ES登録済の注文には残し、自動注文・お試し（自動）は作り直す。保存のときに件数を確認する：受付簿 #255・#266） */
  function onDelete(pid: string) {
    setItems(d.items.filter((x) => x.productId !== pid), true);
  }
  const addTag = async (name: string) => (await api.action('addTag', { name })).name;
  const removeTag = async (name: string) => { await api.action('removeTag', { name }); toast(`商品タグ「${name}」を削除しました`); };

  /* メニュー作成依頼書（CSV・一方向。保存した内容から出す。2026-10-05 台帳 F） */
  const requestCsv = (
    <OpsCsvExport className="es-btn es-btn--outline es-btn--primary es-btn--lg" screen="メニュー作成依頼書" entity="menuRequest" scope={{ site: 'ops', target: m.id }}
      filters={[{ label: '年月', value: m.id }]}><span className="me-ic"><OpsIcon name="down" size={20} /></span>メニュー作成依頼書を出力</OpsCsvExport>
  );
  const acts = edit
    ? <>
      {requestCsv}
      <Button variant="outline" size="lg" onClick={() => setModal({ type: 'stats' })}><span className="me-ic"><OpsIcon name="chart" size={20} /></span>統計</Button>
      <Button variant="outline" size="lg" onClick={() => leave(() => router.push(view))}>キャンセル</Button>
      <Button size="lg" disabled={busy} onClick={onSave}>保存</Button>
    </>
    : <>
      {requestCsv}
      <Button variant="outline" size="lg" onClick={() => setModal({ type: 'stats' })}><span className="me-ic"><OpsIcon name="chart" size={20} /></span>統計</Button>
      {/* 権限がなければ出さない。自動計算は編集の画面だけ（詳細には置かない：受付簿 No.240）。配送中・終了は編集できない */}
      {canEdit && canAct(api, 'saveMenuEdit') ? <Button size="lg" icon="PencilSimple" onClick={() => router.push(view + '/edit')}>編集</Button> : null}
    </>;
  /* 日付の欄：公開後は公開日・開始日を変えられない（締切日は今日以降・締切済は変えられない） */
  const dateFld = (label: string, k: 'publishOn' | 'orderFrom' | 'orderTo', err: string, helper?: string) => {
    const locked = isPub && (k !== 'orderTo' || closed);
    return edit
      ? <Field label={label} required helper={helper} error={show && (err || (k === 'orderTo' && errs.past) || (k === 'publishOn' && errs.order)) ? (err || (k === 'orderTo' && errs.past) || (k === 'publishOn' && errs.order) || true) : (show && errs.order ? true : undefined)}><DInp value={toIso(d[k])} disabled={locked} min={k === 'orderTo' && isPub ? toIso(today()) : undefined} aria-label={label} onChange={(e) => upd({ [k]: fromIso(e.target.value) })} /></Field>
      : <Ro label={label} v={d[k]} />;
  };
  const mode = edit ? '登録' : '詳細';
  const corpOpts: { value: CorpPublish; label: string; disabled?: boolean }[] = isPub
    ? [{ value: '公開', label: '公開' }]
    : [{ value: '非公開', label: '非公開' }, { value: '公開', label: '公開（保存して公開）' }, { value: '自動公開', label: '自動公開' }];
  const lockMsg = `オーダー締切日（${fmtDate(m.orderTo)}）を過ぎたため、商品の追加・削除と基準注文数の変更はできません。`;

  return (
    <>
      <Head cls="mm-head" crumb={['メニュー管理', ['月間メニュー', () => nav('/ops/menu/monthly')], '月間メニュー' + mode]}
        title={<>{'月間メニュー' + mode + ' '}<span className="es-mono">{m.id.replace('-', '')}</span>{' '}<Badge tone={MENU_TONE[m.status]}>{menuLabel(m.status)}</Badge></>} actions={acts} />
      {m.status !== '編集中' ? <InlineMessage tone="info">{closed
        ? `${lockMsg}表示の項目（公開可能・営業サンプル・タグ・並び）・メニューPDF・説明だけ直せます。配送中に商品の不良が出たときは、商品注文管理の「代替品設定」で差し替えます。`
        : canEdit
          ? `公開中は、商品の追加・外す・並び・タグ・公開可能・基準注文数・PDF を直せます。直したらすぐ法人Web・アプリに反映します（登録済みの注文は変えません。自動注文は作り直します）。商品を外すときは、その商品を含む注文の件数を保存の前に確認します。公開日・オーダー開始日は変えられません。オーダー締切日（${fmtDate(m.orderTo)}）のあとは、商品の追加・外す・基準注文数の変更はできません。商品を替えるときは商品注文管理の「代替品設定」も使えます。`
          : '配送中・終了のメニューは編集できません。配送中に商品の不良が出たときは、商品注文管理の「代替品設定」で差し替えます。'}</InlineMessage> : null}
      {/* 自動公開の日に公開の条件が足りないとき：公開しない。運営へお知らせ＋ダッシュボードの警告・翌日も再判定（受付簿 #276） */}
      {autoFail.length ? <InlineMessage tone="warning" title="自動公開できませんでした">
        自動公開の日（{fmtDate(m.publishOn)}）に公開の条件がそろっていないため、公開していません。条件がそろうまで毎日確かめます（運営へのお知らせとダッシュボードの警告を出しています）。
        <ul className="me-ask__list">{autoFail.map((x) => <li key={x}>{x}</li>)}</ul>
      </InlineMessage> : null}
      {show ? <SaveErrorBar n={errN} /> : null}

      <Card>
        <SectionTitle>月間メニュー</SectionTitle>
        <div className="me-top">
          <div className="me-topf">
            <Field label="年月" required><Inp value={m.id} disabled aria-label="年月" /></Field>
            <Field label="法人向け公開ステータス">
              <Sel value={d.corpPublish} disabled={!edit || isPub} aria-label="法人向け公開ステータス" options={corpOpts}
                onChange={(e) => upd({ corpPublish: e.target.value as CorpPublish })} />
            </Field>
            <Field label="メニューPDF">
              <button type="button" className="es-input es-input--md me-pdfbtn" onClick={() => setModal({ type: 'pdf' })} aria-label="メニューPDF を開く">
                <span className={firstPdf ? 'od-link' : 'me-ph'}>{firstPdf ? `${firstPdf.kind}：${firstPdf.name}` + (d.pdfs.length > 1 ? ` ほか${d.pdfs.length - 1}件` : '') : edit ? 'アップロード' : 'なし'}</span>
                <OpsIcon name="upl" size={18} />
              </button>
            </Field>
          </div>
          <ReadyPanel v={v} L={L} d={d} />
        </div>
        <div className="od-g4">
          {dateFld('メニュー公開日', 'publishOn', errs.pub, d.corpPublish === '自動公開' ? 'この日に公開の条件がそろっていれば公開（3日前から足りない条件を運営の TOP に出す）' : undefined)}
          {dateFld('オーダー開始日', 'orderFrom', errs.from)}
          {dateFld('オーダー締切日', 'orderTo', errs.to, edit ? '締切までに登録がない拠点は、自動注文（基準注文数から）で確定します' : undefined)}
          <Ro label="最終更新" v={m0.upd} />
        </div>
        {/* 平均仕入単価の目標（メニューごと・2026-10-05 台帳 F）：初期値は前月の値。公開したメニューは公開時の値で固定 */}
        <div className="od-g4">
          {(['fr', 'vm'] as const).map((k) => {
            const label = k === 'fr' ? '平均仕入単価の目標（冷蔵庫・税抜）' : '平均仕入単価の目標（自販機・税抜）';
            const t = d.avgTarget[k];
            if (!edit || isPub) return <Ro key={k} label={label + (isPub ? '（公開時の値で固定）' : '')} v={`${t.min}〜${t.max}円`} />;
            const setT = (p: Partial<{ min: number; max: number }>) => upd({ avgTarget: { ...d.avgTarget, [k]: { ...t, ...p } } });
            /* 数字は 999,999,999 まで（入力の共通基準・金額） */
            const num = (x: string) => (x === '' ? NaN : Math.min(999999999, Number(x)));
            return (
              <Field key={k} label={label} required helper={k === 'fr' ? '標準数の提案（基準注文数・短消費期限なし）と統計の確認に使います。初期値は前月のメニューの値' : '自販機基準注文数の提案と統計の確認に使います'}>
                <div className="mo-row">
                  <Inp type="number" min={1} max={999999999} value={Number.isFinite(t.min) ? t.min : ''} aria-label={label + ' 下限'} onChange={(e) => setT({ min: num(e.target.value) })} />
                  <span>〜</span>
                  <Inp type="number" min={1} max={999999999} value={Number.isFinite(t.max) ? t.max : ''} aria-label={label + ' 上限'} onChange={(e) => setT({ max: num(e.target.value) })} />
                  <span>円</span>
                </div>
              </Field>
            );
          })}
        </div>
        {show && errs.avg ? <FieldError>{errs.avg}</FieldError> : null}
        {m.log?.length ? (
          <details className="me-log"><summary>変更履歴（{m.log.length}件）</summary>
            <Table cols={[{ label: '日時', w: 160 }, { label: '内容' }, { label: '変更者', w: 140 }]} rows={m.log.map((x, i) => <tr key={i}><Td v={x.at} /><td className="w">{fmtDatesIn(x.what)}</td><Td v={x.by} /></tr>)} />
          </details>
        ) : null}
      </Card>

      <Card>
        <SectionTitle action={edit ? <div className="mo-row">
          {/* 月間メニューの CSV取込はモーダルではなく画面（…/import。hong 2026/10/05）。編集中の内容があれば破棄の確認（nav）。登録のあとは編集の画面に戻って読み直す。締切済は商品を変えられないので使えない */}
          <Button variant="outline" disabled={closed} onClick={() => nav(`${view}/import`)}><span className="me-ic"><OpsIcon name="upl" size={18} /></span>CSV取込</Button>
          <Button icon="Plus" disabled={closed} onClick={() => setModal({ type: 'add' })}>商品追加</Button>
        </div> : null}>商品一覧</SectionTitle>
        {closed && edit ? <InlineMessage tone="warning">{lockMsg}</InlineMessage> : null}
        {show ? <FieldError>{errs.items}</FieldError> : null}
        <ProductTable v={v} L={L} d={d} edit={edit} lockItems={closed} onItems={setItems} onDelete={onDelete} onAddTag={addTag} onRemoveTag={removeTag}
          toolbar={edit ? <>
            <Button variant="outline" disabled={closed} onClick={() => { setItems(d.items, true); toast('基準注文数を自動で入れ直しました。手で直した値は変えていません。'); }}>自動計算</Button>
            {/* 標準数の提案 ②（平均単価の調整）を戻す／やり直す（2026-10-05 台帳 F） */}
            <Button variant="outline" disabled={closed} onClick={() => { const noAdjust = !d.noAdjust; upd({ noAdjust, items: L.recalc(d.items, d.avgTarget, !noAdjust).items }); toast(noAdjust ? '平均単価の調整を戻しました。注文の割合の配分のままです。' : '平均単価の調整をやり直しました。'); }}>{d.noAdjust ? '調整をやり直す' : '調整を戻す'}</Button>
          </> : null} />
      </Card>

      <SmpCard m={m0} />
      <MixCard C={C} m={menuNow} />
      <VmCard C={C} m={menuNow} L={L} edit={edit && !closed} setDraft={setMenuDraft} />

      {modal?.type === 'ng' ? <NgDialog title={modal.title} cs={modal.cs} lead={modal.lead} onClose={() => setModal(null)} /> : null}
      {modal?.type === 'stats' ? <Stats v={v} L={L} d={d} onClose={() => setModal(null)} /> : null}
      {modal?.type === 'add' ? <AddProduct v={v} L={L} d={d} onClose={() => setModal(null)}
        onAdd={(ids) => { upd({ items: addItems(L, d, ids) }); setModal(null); toast(`${ids.length}品をメニューに追加しました。`); }} /> : null}
      {modal?.type === 'pdf' ? <PdfDialog pdfs={d.pdfs} edit={edit} onClose={() => setModal(null)} onApply={(pdfs) => { upd({ pdfs }); setModal(null); toast('メニューPDFを反映しました。保存すると確定します。'); }} /> : null}
      {modal?.type === 'stale' ? (
        <Ask mark="!" title="内容が更新されています" onClose={() => setModal(null)}
          buttons={<><Button variant="outline" size="lg" block onClick={() => setModal(null)}>キャンセル</Button><Button size="lg" block disabled={busy} onClick={() => { setModal(null); void save(d, false, true, true); }}>上書きして保存</Button></>}>
          <p>他のユーザーにより内容が更新されています。上書きすると保存されます。</p>
        </Ask>
      ) : null}
      {modal?.type === 'ask' ? <SaveAsk s={modal} d={d} v={v} L={L} bc={bc} closed={closed} rdMissing={rd.missing} busy={busy} onClose={() => setModal(null)} set={(p) => setModal({ ...modal, ...p })}
        onShowOrders={(pid) => { put('ord.q', { m: m.id, p: pid }); put('ord.qd', { m: m.id, p: pid }); leave(() => nav('/ops/menu/orders')); }}
        onKeep={() => save({ ...d, corpPublish: '非公開' }, false)}
        onGo={() => {
          if (modal.kind === 'sum') { setModal(null); afterSum(); }
          else if (modal.kind === 'publish') save(d, true);
          else if (modal.kind === 'update') save(d, false, modal.notify);
          else save({ ...d, corpPublish: '自動公開' }, false);
        }} /> : null}
    </>
  );
}

/** 保存の確認（Phase 1 画面 07）：合計が50でない／保存して公開／「自動公開」に変更して保存／保存して自動公開／公開済みの保存（1枚にまとめる：受付簿 #276） */
function SaveAsk({ s, d, v, L, bc, closed, rdMissing, busy, onClose, set, onKeep, onGo, onShowOrders }: {
  s: { kind: 'publish' | 'toAuto' | 'auto' | 'update' | 'sum'; notify: boolean; impact?: Impact | null; early?: boolean }; d: Draft; v: View; L: Lookup; bc: ReturnType<typeof baseCheck>; closed: boolean; rdMissing: string[]; busy: boolean;
  onClose: () => void; set: (p: Partial<{ notify: boolean }>) => void; onKeep: () => void; onGo: () => void; onShowOrders: (pid: string) => void;
}) {
  const cancel = <Button variant="outline" size="lg" block onClick={onClose}>キャンセル</Button>;
  /* 初めて公開するとき・自動公開されたときは、法人へ必ずお知らせする（2026/10/02 決定 #3） */
  const fixedNotify = <div className="me-ask__chk"><Chk label="メニューお知らせを通知する" checked disabled onChange={() => {}} /><small className="od-small">公開したときは法人へ必ずお知らせします（アプリの利用者には出しません）</small></div>;
  /* 合計が50でない種類（Q115）。公開中は自動注文が種類ごとの比で按分して作り直される（受付簿 #266） */
  const sumWarn = (rebuild: boolean) => bc.bad.length ? (
    <div className="me-ask__sec">
      {bc.bad.map((k) => <p key={k}><b>{BASE_LABEL[k]}の合計が50ではありません。</b>現在 {bc.sums[k]}</p>)}
      {rebuild ? <p>自動注文が作り直されます。</p> : null}
    </div>
  ) : null;
  if (s.kind === 'sum') {
    return (
      <Ask mark="!" title={bc.bad.map((k) => `${BASE_LABEL[k]}の合計が50ではありません。`).join('')} onClose={onClose} buttons={<>{cancel}<Button size="lg" block disabled={busy} onClick={onGo}>このまま保存</Button></>}>
        <p>このまま保存してもよろしいですか？</p>
        <p className="mo-note">現在：{bc.bad.map((k) => `${BASE_LABEL[k]} ${bc.sums[k]}`).join('／')}。公開するときは、種類ごとの合計が 50 でないと止まります。</p>
      </Ask>
    );
  }
  if (s.kind === 'update') {
    const im = s.impact, n = im ? new Set([...im.total.keep, ...im.total.rebuild]).size : 0;
    const name = (pid: string) => { const p = L.prod(pid); return p ? mgmtNameOf(p) : pid; };
    return (
      <Ask title="更新して保存しますか？" onClose={onClose} buttons={<>{cancel}<Button size="lg" block disabled={busy} onClick={onGo}>更新して保存</Button></>}>
        <p>このメニューは現在「{v.menu.status === '締切済' ? '公開（締切済）' : '公開'}」ステータスです。<br />保存すると即座に反映されます（{closed ? '' : '自動注文は作り直し、'}登録済みの注文は変えません）。<br />よろしいですか？</p>
        {sumWarn(!closed)}
        {im ? (
          <div className="me-ask__sec">
            <b>この商品を含む注文が{n}件あります。</b>
            <p>残る注文{im.total.keep.length}件・作り直される注文{im.total.rebuild.length}件。</p>
            <ul className="me-ask__list">
              {im.byProduct.filter((x) => x.keep.length || x.rebuild.length).map((x) => (
                <li key={x.productId}>{x.productId} {name(x.productId)}：残る{x.keep.length}件・作り直される{x.rebuild.length}件{' '}
                  <a href="#" className="od-link" onClick={(e) => { e.preventDefault(); onShowOrders(x.productId); }}>該当の注文の一覧へ</a></li>
              ))}
            </ul>
          </div>
        ) : null}
        {s.early ? (
          <div className="me-ask__sec">
            <b>オーダー締切日を早めて保存しますか？</b>
            <p>オーダー締切日を{fmtDate(v.menu.orderTo)}から{fmtDate(d.orderTo)}に早めます。法人Web・アプリのご注文期限が早まります。すでにご案内している場合は、法人へのお知らせもご検討ください。</p>
          </div>
        ) : null}
        <div className="me-ask__chk"><Chk label="お客様へ知らせる" checked={s.notify} onChange={(b) => set({ notify: b })} /><small className="od-small">法人へ再通知します。チェックしないと法人へは知らせません（初期値はチェックなし）</small></div>
      </Ask>
    );
  }
  if (s.kind === 'publish') {
    return (
      <Ask title="保存して公開しますか？" onClose={onClose} buttons={<>{cancel}<Button size="lg" block disabled={busy} onClick={onGo}>公開して保存</Button></>}>
        <p>保存すると、すぐに法人Webに公開され、法人へお知らせが届きます。販売価格は公開したときの価格で固定します。<br />よろしいですか？</p>
        {fixedNotify}
      </Ask>
    );
  }
  if (s.kind === 'toAuto') {
    return (
      <Ask title="公開ステータスを自動公開に更新しますか？" onClose={onClose}
        buttons={<div className="me-ask__col"><div className="me-ask__row"><Button variant="outline" size="lg" block disabled={busy} onClick={onKeep}>そのまま保存</Button><Button size="lg" block disabled={busy} onClick={onGo}>自動公開して保存</Button></div>{cancel}</div>}>
        {/* 文言は MM の決定のとおり（RD-MN-034）。公開する日はメニュー公開日（この確認で日付は入れない） */}
        <p>公開条件を満たしているため、公開ステータスを自動公開に更新してもよろしいですか。</p>
        <p className="mo-note">※「そのまま保存」を選ぶと、非公開のまま保存されます。</p>
        {fixedNotify}
      </Ask>
    );
  }
  return (
    <Ask title="保存して自動公開しますか？" onClose={onClose} buttons={<>{cancel}<Button size="lg" block disabled={busy} onClick={onGo}>自動公開して保存</Button></>}>
      <p>このメニューは現在「自動公開」ステータスです。<br />保存すると、指定日（{fmtDate(d.publishOn)}）にこの内容で公開されます。<br />よろしいですか？</p>
      {rdMissing.length ? <div className="me-err" style={{ textAlign: 'left' }}>いまは公開の条件を満たしていません。自動公開日までにそろわないと公開されません（3日前から運営の TOP に出ます）。<ul>{rdMissing.map((x) => <li key={x}>{x}</li>)}</ul></div> : null}
      {fixedNotify}
    </Ask>
  );
}

/* ================= 営業サンプル（月の件数）：2026/10/01 承認。件数は固定せず月の合計 ================= */
function SmpCard({ m }: { m: Menu }) {
  const { toast, toastError, nav } = useMenu();
  const canAct = useCanAct();
  const { data: q } = useQuery(api, 'smpQuota', { ym: m.ym });
  /* 受付済（宛先の数）は 発注・入荷 ＞ 営業サンプル の登録から数える */
  const { data: used } = useQuery(api, 'smpUsed', { ym: m.ym });
  const [cur, setCur] = useState<string | null>(null);
  const canEdit = m.status === '編集中' || m.status === '公開中';
  const quota = q ?? null;
  const val = cur != null ? cur : quota == null ? '' : String(quota);
  const n = val === '' ? null : parseInt(val, 10), valid = n != null && !isNaN(n) && n >= 0 && n <= 999, same = valid && n === quota;
  /* 範囲を外れたとき・空にしたときは欄の下に出す（E12・E01） */
  const smpErr = cur == null ? '' : val === '' ? '営業サンプル件数（月の合計）は必須項目です。' : !valid ? '営業サンプル件数（月の合計）は0〜999の範囲で入力してください。' : '';
  async function save() {
    if (!valid) return;
    try {
      await api.action('setSmpQuota', { ym: m.ym, n: n! });
      setCur(String(n));
      /* 発注の対象は翌月（発注の最新月）のメニューだけ */
      toast(`${m.ym}の営業サンプル件数を${n}件にしました。`);
    } catch (e) { toastError(e); }
  }
  return (
    <Card>
      <SectionTitle>営業サンプル（月の件数）</SectionTitle>
      {DEMO ? <p className="mo-note">決定の根拠：2026-10-01 承認（件数は固定せず、メニュー作成で月の合計を決める。毎週15件の固定はやめる）／サンプル_仕様まとめ 1-3・1-4／REQ-PO-103（必要数＝注文数＋調整数＋サンプル枠）。</p> : null}
      <div className="od-g4">
        <Field label="営業サンプル件数（月の合計）" error={smpErr || undefined} helper="1件＝宛先1か所に、対象商品を各1個。受付済がこの件数に達すると、それを超えるサンプル登録はできません（枠を増やすときはここで変更）">
          <Inp type="number" min={0} max={999} value={val} disabled={!canEdit} placeholder="例：60" aria-label="営業サンプル件数（月の合計）" onChange={(e) => setCur(e.target.value)} />
        </Field>
        <Ro label="受付済（宛先の数）" v={used == null ? '—' : used + '件'} />
        <Ro label="残り枠" v={used == null || quota == null ? '—' : Math.max(0, quota - used) + '件'} />
        <Ro label={<span>発注の「サンプル枠」<Kari t="4週に均等" /></span>} v={quota == null ? '—' : '対象商品ごとに ' + quota + '個'} />
      </div>
      <div className="mo-row" style={{ marginTop: '0.857143rem' }}>
        {canAct(api, 'setSmpQuota') && <Button disabled={!canEdit || !valid || same} onClick={save}>件数を保存</Button>}
        <Button variant="outline" onClick={() => nav('/ops/purchasing/samples')}>サンプル一覧を開く</Button>
      </div>
      {!canEdit ? <p className="mo-note" style={{ marginTop: '0.571429rem' }}>このメニューは締切後のため、件数は変えられません。</p> : null}
      <p className="mo-note" style={{ marginTop: '0.571429rem' }}>対象商品は、このメニューの商品で「営業サンプル」にチェックした商品です。</p>
    </Card>
  );
}

/** 按分の見本（公開前のプレビュー）：プラン×コースのデフォルト注文と平均仕入単価 */
function MixCard({ C, m }: { C: Calc; m: Menu }) {
  const AVG_T = C.tgtOf(m).fr, AVG_VM = C.tgtOf(m).vm;   /* STEP5-MORE */
  /* 見本は代表の 50プランだけ（2026/10/02 お客様のフィードバック：ライト（冷蔵庫）・スタンダード・ライト（自販機）） */
  const PL: [number, string][] = [[50, 'ES000003']];
  const vm = C.MACHINES[0];
  const CO: [string, string][] = [['lite', 'ESライト（冷蔵庫）'], ['std', 'ESスタンダード'], ...(vm ? [['vm:' + vm.id, 'ESライト（自販機）'] as [string, string]] : [])];
  const rows: React.ReactNode[] = [];
  PL.forEach((pl) => CO.forEach((co) => {
    const c = C.mixOf(m, pl[0], co[0]); let t = 0, fzn = 0, items = 0;
    Object.keys(c).forEach((id) => { t += c[id]; if (C.prod(id).st === 'frozen') fzn += c[id]; if (c[id]) items++; });
    const TG = co[0].indexOf('vm:') === 0 ? AVG_VM : AVG_T, av = C.avgOf(c), ok = t === pl[0] && av >= TG.min && av <= TG.max;
    rows.push(
      <tr key={pl[0] + co[0]}>
        <Td v={pl[1] + ' ' + pl[0] + 'プラン'} /><Td v={co[1]} /><Td v={t + '個'} cls="r" /><Td v={co[0] === 'std' ? fzn + '個' : '—'} cls="r" /><Td v={items + '品'} cls="r" />
        <td className={'r' + (av < TG.min || av > TG.max ? ' mo-ng' : '')}>{av + '円（目標 ' + TG.min + '〜' + TG.max + '）'}</td>
        <td><Badge tone={ok ? 'success' : 'warning'}>{ok ? 'OK' : '要確認'}</Badge></td>
      </tr>,
    );
  }));
  return (
    <Card>
      <SectionTitle>按分の見本（デフォルト注文の目安・公開前の確認）</SectionTitle>
      <p className="mo-note">{'基準数（重み）を各プラン・コースの数にシステムが按分した結果です。平均仕入単価 ＝ Σ（仕入単価 × 数）÷ 合計。目標（' + AVG_T.min + '〜' + AVG_T.max + '円・このメニューの目標）を外れたら赤字。拠点の設定（カテゴリ・短消費期限・金額・対象外）は、拠点ごとにこのあとかけます。' + (DEMO ? '仕入単価はデモの仮の値です。' : '')}</p>
      <Table cols={[{ label: 'プラン' }, { label: 'コース' }, { label: '合計', cls: 'r' }, { label: '冷凍', cls: 'r' }, { label: '品数', cls: 'r' }, { label: '平均仕入単価（税抜）', cls: 'r' }, { label: '判定' }]} rows={rows} />
    </Card>
  );
}

/** STEP5-VM-20261001：自販機の標準数（機種ごと・枠ごと）。100プランの1回あたりの見本 */
function VmCard({ C, m, L, edit, setDraft }: { C: Calc; m: Menu; L: Lookup; edit: boolean; setDraft: (f: (d: Menu | null) => Menu | null) => void }) {
  const AVG_VM = C.tgtOf(m).vm;   /* STEP5-MORE */
  const setN = (mid: string, k: Frame, n: number) => setDraft((d) => { if (!d) return d; const v = clone(d.vmN || {}); v[mid] = { ...(v[mid] || {}), [k]: n }; return { ...d, vmN: v }; });
  return (
    <Card>
      <SectionTitle>自販機の標準数（機種ごと・枠ごと）</SectionTitle>
      <p className="mo-note">{'法人Webの自販機の注文画面と同じ枠（ダブル・シングル・ベルト）ごとに作ります。品数の初期値は機種マスタの列数（メニューに合う商品の数まで）で、運営が直せます。各商品の数はプラン数を重み（基準数・ライト）で按分し（1回 50個まで）、列の格納数を超えたら赤字（格納数は参考・プラン数が優先）。自販機に入らない商品・対象外の商品は入れません。平均仕入単価の目標は自販機だけ別（' + AVG_VM.min + '〜' + AVG_VM.max + '円・このメニューの目標）。機種と列の構成は機種マスタ（自販機・利用状態が有効）から読みます。機種を足すと行が増えます。値は仮です。'}</p>
      {C.MACHINES.map((mc) => {
        const vp = C.vmPlan(m, mc, 100); let tot = 0, cost = 0;
        vp.items.forEach((p) => { tot += vp.c[p.id]; cost += vp.c[p.id] * costOf(p); });
        const av = tot ? Math.round(cost / tot * 100) / 100 : 0;
        return (
          <div key={mc.id} className="mo-vm">
            <h4>{mc.id + ' ' + mc.name}<span className="od-small" style={{ marginLeft: '0.857143rem', fontWeight: 400 }}>{'100プラン・1回 ' + tot + '個（' + vp.D + '回）・平均仕入単価 '}<b className={av < AVG_VM.min || av > AVG_VM.max ? 'mo-ng' : undefined}>{av + '円'}</b></span></h4>
            <Table cols={[{ label: '枠' }, { label: '列（格納数×列数）' }, { label: '品数', cls: 'c' }, { label: '入れる商品（1回あたりの数／列の格納数）' }, { label: '1回の合計', cls: 'r' }]}
              rows={vp.frames.map((f) => {
                let sum = 0;
                const cells = f.pick.map((p) => { const n = vp.c[p.id], cap = C.fitCap(mc, p); sum += n; 
                  /* 入れる商品は管理名と仕入先名で出す（英語名は出さない：受付簿 #245） */
                  const r = L.row(p.id), nm = r ? mgmtNameOf(r.p) : p.name;
                  return <span key={p.id} className={'mo-vmi' + (n > cap ? ' mo-ng' : '')} title={n > cap ? '列の格納数（' + cap + '）を超えています' : ''}>{nm + (r?.supplier ? '（' + r.supplier + '）' : '') + ' ' + n + '／' + cap}</span>; });
                return (
                  <tr key={f.k}>
                    <Td v={FR_L[f.k]} />
                    <Td v={(mc.lanes[f.k] || []).map((l) => FR_L[f.k].replace('枠', '') + l[0] + '×' + l[1]).join('・') || '—（この機種にない）'} />
                    <td className="c">{edit && f.cols ? <Stepper value={f.n} label={mc.id + ' ' + FR_L[f.k] + ' 品数'} onChange={(n) => setN(mc.id, f.k, Math.min(n, f.avail))} /> : f.n + '品' + (f.n !== f.nDef ? '（初期 ' + f.nDef + '）' : '')}</td>
                    <td>{cells.length ? <Fragment>{cells}</Fragment> : '—'}</td>
                    <Td v={sum + '個'} cls="r" />
                  </tr>
                );
              })} />
          </div>
        );
      })}
    </Card>
  );
}
