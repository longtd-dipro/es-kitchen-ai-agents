'use client';

import { useRouter } from 'next/navigation';
import { errorMessage, isStale } from '@/lib/api/errors';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import type { NutKey, Nutrition, Product, ProductCourse, ShortClass } from '@/lib/domain/types';
import type { ProductInput, ProductMasters } from '@/lib/ops/general/product';
import { api, Loading, Sec, useDirty } from '@/app/ops/_general/parts';
import { photo } from '@/app/ops/menu/_components/photo';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct } from '@/app/ops/_ui/perm';
import { Badge, ConfirmModal, Field, Modal, PageHead } from '@/app/ops/_ui/ui';
import { MultiDrop, type DropOpt } from './MultiDrop';
import { InvoiceFixList, PriceDialog } from './PriceDialog';
import type { SaveOpts } from '@/lib/ops/general/product';
import { TaxRateSelect } from '@/app/ops/_ui/TaxRateSelect';
import { yen } from '@/lib/format/money';
import { fmtDate, fmtDateTime, fmtDatesIn } from '@/lib/format/date';
import { DateInput } from '@/components/DateInput';
import { ALLERGEN_NONE, JAN_MAX, jansOf, NUT_KEYS, NUT_LABEL, nutRange, nutTo, perServingOf, shortClassOf } from '@/lib/domain/product';
import { checkProductInput, ERR_PHOTO, TAB_OF } from '@/lib/ops/general/productCheck';
import { PHOTO_TYPES, photoFileOk, readPhoto } from '@/app/ops/_ui/photo';
import { BlockedModal, useProductDelete } from './useProductDelete';

/*
 * 商品マスタ 詳細・編集・新規登録（Phase 1 画面 10〜12：基本情報＋タブ 管理用／表示用／変更履歴）。
 *   詳細：削除・編集。入力欄はすべて読むだけ（同じ並び）。無効にするのは編集の「状態」欄（受付簿 #278・#279）
 *   編集・新規登録：キャンセル・保存（登録）。税率はドロップダウンからその場で足す・消す（使っていれば 409 のエラーを出す）
 *   仕入先は複数可（表の行を足す・消す・「選択中」の1社を選ぶ。1社以上必須。受付簿 #286）。カテゴリは ID で持つ（受付簿 #233）
 *   商品タグ・営業サンプルは持たない（メニューの画面で指定する。台帳 F 2026-10-08・受付簿 #228〜#230）
 * 保存は運営の領域 general.saveProduct → 共通データ master.create / update（変更履歴を残す・全サイトが読み直す）
 */
export type Mode = 'detail' | 'edit' | 'new';
type Draft = ProductInput;
type Tab = '管理用' | '表示用' | '変更履歴';

const LIST = '/ops/masters/products';
const STORAGE = ['冷蔵', '冷凍', '常温'] as const;
const COURSES: ProductCourse[] = ['ライト', 'スタンダード'];
const SHIP = ['OPP袋封入', '冷凍便で出荷（解凍しない）', '天地無用', '重ね置き不可'];
/** 特定原材料（8品目）・特定原材料に準ずるもの（20品目） */
const ALG_SPECIFIC = ['えび', 'かに', 'くるみ', '小麦', 'そば', '卵', '乳', '落花生', ALLERGEN_NONE];
const ALG_EQUIV = ['アーモンド', 'あわび', 'いか', 'いくら', 'オレンジ', 'カシューナッツ', 'キウイフルーツ', '牛肉', 'ごま', 'さけ', 'さば', '大豆', '鶏肉', 'バナナ', '豚肉', 'マカダミアナッツ', 'もも', 'やまいも', 'りんご', 'ゼラチン'];
const SHORT: [ShortClass, string][] = [['対象外', '対象外'], ['ショート', 'ショート：1週間以内'], ['セミショート', 'セミショート：1週間〜1ヶ月程度']];
/** 写真の上限（枚。RD-MN-068：5枚まで・1枚 5MB 以下。サーバーの lib/ops/general/product.ts の MAX_PHOTOS と同じ）と、選べるファイル */
const MAX_PHOTOS = 5;

/** 栄養成分の空欄（100g当たり）。5項目は from・to（台帳 F 2026-10-08） */
const zeroNut = (): Nutrition => ({ servingG: 0, kcal: 0, protein: 0, fat: 0, carbs: 0, salt: 0, other: '', to: { kcal: 0, protein: 0, fat: 0, carbs: 0, salt: 0 } });
/** 新規の栄養成分（100g当たり）：空欄から手で入れる（6項目すべて必須：受付簿 #236） */
const emptyNut = (): Nutrition => ({ servingG: NaN, kcal: NaN, protein: NaN, fat: NaN, carbs: NaN, salt: NaN, other: '', to: { kcal: NaN, protein: NaN, fat: NaN, carbs: NaN, salt: NaN } });
function blank(m: ProductMasters): Draft {
  return {
    /* JAN は空の1行から（複数・先頭が主。台帳 F 2026-10-08）。商品タグは画面に出さない（メニューで指定） */
    name: '', kana: '', mgmtName: '', nameEn: '', supplierItemName: '', jan: '', jans: [''], category: '', categoryId: '', priceYen: 0, taxRateId: m.taxRates[0]?.id ?? '', note: '', images: [],
    description: '', nutrition: { per100g: emptyNut(), perServing: zeroNut() }, allergens: { specific: [], equivalent: [] },
    ingredients: '', additives: '', makerUrl: '', courses: [], storage: { admin: '冷蔵', display: '冷蔵' },
    /* 対応機種の初期値は両方（全部の自販機。RD-MN-123） */
    vending: { columns: [], subColumns: [], models: m.models.map((x) => x.id), note: '' }, bundledMaterialIds: [], shipInstructions: [],
    /* ES賞味期限は空を既定にして手で入れる（2026-10-05 決定） */
    shelfLife: { esValue: NaN, esUnit: '日', maker: '', shortClass: '対象外' },
    /* 仕入先は最初に1行だけ出す（「仕入先を追加」で足す）。仕入先・仕入単価は空にして入れる（0を初期値にしない：受付簿 #273）。ロットの初期値は1 */
    suppliers: [{ supplierId: '', unitCostYen: NaN, lot: 1, note: '', selected: true }], pickWarehouseIds: [], status: '有効',
  };
}
/** 商品 → 入力の形（品番・互換の項目を外す。状態は有効／無効）。前の形（JAN 1つ・栄養成分の to なし・サブコラムなし・営業サンプル）もそろえる */
function toDraft(p: Product): Draft {
  const { id: _i, status, temp: _t, vmFrame: _v, supplierId: _sp, ...d } = structuredClone(p);
  const { sampleOn: _smp, ...rest } = d as Draft & { sampleOn?: unknown };
  const jans = jansOf(p);
  const n = rest.nutrition.per100g;
  return {
    ...rest, status: status === '無効' ? '無効' : '有効', jans: jans.length ? jans : [''],
    nutrition: { ...rest.nutrition, per100g: { ...n, to: nutTo(n) } },
    vending: { ...rest.vending, subColumns: rest.vending.subColumns ?? [] },
  };
}

/** JAN の入力：全角の数字は半角に直し、数字だけ・13桁まで */
const janIn = (v: string) => v.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/\D/g, '').slice(0, 13);
/** 保存に送る JAN（空の行は外す） */
const jansFilled = (d: Draft) => (d.jans ?? []).map((j) => j.trim()).filter(Boolean);

/** 写真の表示：data URL・URL はそのまま、見本のパス（products/M001-1.jpg）はカテゴリの絵 */
const seedOf = (s: string) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 97;
const imgSrc = (file: string, cat: string) => (/^(data:|https?:|\/)/.test(file) ? file : photo(cat || '惣菜', seedOf(file)));
/** 数の入力（単位つき）。空欄は NaN（確かめで止める） */
function NumIn({ v, on, unit, ro, err, int, label }: { v: number; on: (n: number) => void; unit?: string; ro: boolean; err?: boolean; int?: boolean; label?: string }) {
  return (
    <div className="pm-u">
      <input className={`inp num${err ? ' err' : ''}`} type="number" min={0} step={int ? 1 : 'any'} inputMode={int ? 'numeric' : 'decimal'} aria-label={label}
        value={Number.isFinite(v) ? v : ''} disabled={ro} onChange={(e) => on(e.target.value === '' ? NaN : Number(e.target.value))} />
      {unit && <span>{unit}</span>}
    </div>
  );
}
const TxtIn = ({ v, on, ro, ph, err, label }: { v: string; on: (s: string) => void; ro: boolean; ph?: string; err?: boolean; label?: string }) => (
  <input className={`inp${err ? ' err' : ''}`} value={v} disabled={ro} placeholder={ph} aria-label={label} onChange={(e) => on(e.target.value)} />
);
/** 選択肢（いまの値がなければ足して出す） */
const withVals = (base: string[], vals: string[]): DropOpt[] => [...base, ...vals.filter((v) => !base.includes(v))].map((x) => ({ value: x, label: x }));

/** from〜to の2つの入力を並べる */
const RANGE_STYLE = { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto minmax(0,1fr)', gap: '0.428571rem', alignItems: 'center' } as const;

/**
 * 栄養成分（100g当たり）：5項目は範囲 from〜to（to の初期値＝from・あとで直せる・両方必須）、内容量は1つの数（台帳 F 2026-10-08）。
 * 入力は管理用タブ。表示用タブは 1食当たり（NutView）。errs＝項目ごとのエラー（キー n.<項目>＝from、n.<項目>.to＝to）
 */
function NutSec({ n, ro, req, errs, on }: { n: Nutrition; ro: boolean; req?: boolean; errs?: Record<string, string>; on: (n: Nutrition) => void }) {
  /* from を入れると、to が空・from より小さい・前の from と同じなら to も同じ値にする */
  const setFrom = (k: NutKey, v: number) => {
    const t = n.to[k];
    const keep = Number.isFinite(t) && t !== n[k] && Number.isFinite(v) && t >= v;
    on({ ...n, [k]: v, to: { ...n.to, [k]: keep ? t : v } });
  };
  return (
    <Sec title="栄養成分（100g当たり）">
      <div className="fg pm-c1">
        <Field label="1食当たり内容量" req={req} err={errs?.['n.servingG']}><NumIn v={n.servingG} unit="g" ro={ro} err={!!errs?.['n.servingG']} label="1食当たり内容量" on={(v) => on({ ...n, servingG: v })} /></Field>
      </div>
      <div className="fg pm-top">
        {NUT_KEYS.map((k) => {
          const [l, u] = NUT_LABEL[k];
          const e = errs?.[`n.${k}`] ?? errs?.[`n.${k}.to`];
          return (
            <Field key={k} label={`${l}/100g`} req={req} err={e}>
              <div style={RANGE_STYLE}>
                <NumIn v={n[k]} unit={u} ro={ro} err={!!errs?.[`n.${k}`]} label={`${l}/100g`} on={(v) => setFrom(k, v)} />
                <span>〜</span>
                <NumIn v={n.to[k]} unit={u} ro={ro} err={!!errs?.[`n.${k}.to`]} label={`${l}/100g（to）`} on={(v) => on({ ...n, to: { ...n.to, [k]: v } })} />
              </div>
            </Field>
          );
        })}
      </div>
      <div className="fg pm-c1">
        <Field label="その他成分" err={errs?.['n.other']}><TxtIn v={n.other} ro={ro} ph="その他成分" err={!!errs?.['n.other']} label="その他成分" on={(v) => on({ ...n, other: v })} /></Field>
      </div>
    </Sec>
  );
}
/** 栄養成分（1食当たり）：100g当たり × 内容量 を from・to それぞれ自動計算して「50〜60」（同じなら1つの数）で出す。入力しない */
function NutView({ n }: { n: Nutrition }) {
  return (
    <Sec title="栄養成分（1食当たり）">
      <div className="fg pm-c1">
        <Field label="1食当たり内容量"><NumIn v={n.servingG} unit="g" ro label="1食当たり内容量" on={() => {}} /></Field>
      </div>
      <div className="fg pm-c5">
        {NUT_KEYS.map((k) => {
          const [l, u] = NUT_LABEL[k];
          return (
            <Field key={k} label={`${l}/食`}>
              <div className="pm-u"><input className="inp num" disabled value={nutRange(n, k)} aria-label={`${l}/食`} /><span>{u}</span></div>
            </Field>
          );
        })}
      </div>
      <div className="fg pm-c1">
        <Field label="その他成分"><TxtIn v={n.other} ro ph="その他成分" label="その他成分" on={() => {}} /></Field>
      </div>
    </Sec>
  );
}

/** 商品写真の拡大（閉じる・ダウンロード・Esc で閉じる） */
function PhotoZoom({ src, name }: { src: string; name: string }) {
  const { closeModal } = useOps();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeModal]);
  return (
    <Modal title="商品写真" width={560}
      footer={<><a className="btn out lg" href={src} download={name} aria-label="写真をダウンロード"><Icon name="down" />ダウンロード</a><button type="button" className="btn pri lg" onClick={closeModal}>閉じる</button></>}>
      <img className="pm-preview" src={src} alt="商品写真" />
    </Modal>
  );
}
/** 写真のファイルを保存する（<a download> を押す） */
function download(src: string, name: string) {
  const a = document.createElement('a');
  a.href = src; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}
/** ダウンロードのファイル名（品番-番号.拡張子。data URL は形式から） */
function photoName(pid: string, i: number, file: string, src: string) {
  const m = /^data:image\/([a-z+]+)/.exec(src);
  const ext = m ? (m[1] === 'svg+xml' ? 'svg' : m[1] === 'jpeg' ? 'jpg' : m[1]) : (/\.([a-z0-9]+)(?:\?|$)/i.exec(file)?.[1] ?? 'jpg');
  return `${pid || '商品写真'}-${i + 1}.${ext}`;
}

export function ProductScreen({ mode, id }: { mode: Mode; id?: string }) {
  const router = useRouter();
  const { toast, toastError, openModal, closeModal } = useOps();
  const delProduct = useProductDelete();
  const canAct = useCanAct();
  const editing = mode !== 'detail';
  const dirty = useDirty(editing);
  const { data: m } = useQuery(api, 'productMasters');
  const { data } = useQuery(api, 'product', { id: id ?? '' });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<Tab>('管理用');
  const [busy, setBusy] = useState(false);
  /* 同時更新の検知（E31）：フォームを読み込んだときの版。保存で送り、違えば「上書きして保存」を出す（lib/ops/core/concurrency.ts） */
  const baseVer = useRef<string | undefined>(undefined);
  /* 一覧の鉛筆から開いた編集は、保存・キャンセルで一覧へ戻る（?from=list） */
  const [fromList, setFromList] = useState(false);
  useEffect(() => { setFromList(new URLSearchParams(window.location.search).get('from') === 'list'); }, []);

  /* 編集・新規は最初に1回だけ値を入れる（編集中はほかの画面の書き換えで上書きしない） */
  useEffect(() => {
    if (!editing || draft) return;
    if (mode === 'new' && m) setDraft(blank(m));
    /* ID のない古い商品（カテゴリが名前だけ）は名前から ID を引く（受付簿 #233） */
    if (mode === 'edit' && data && m) { baseVer.current = data.version; const d = toDraft(data.product); setDraft({ ...d, categoryId: d.categoryId || m.categories.find((c) => c.name === d.category)?.id || '' }); }
  }, [editing, mode, m, data, draft]);

  if (mode !== 'new' && data === null) {
    return (
      <>
        <PageHead crumbs={['マスタ管理', '商品マスタ', '商品マスタ詳細']} title="商品が見つかりません" />
        <div className="card"><div className="ph-empty"><b>品番 {id} の商品は見つかりません（削除済みの可能性があります）</b>
          <button className="btn out" onClick={() => router.push(LIST)}>商品マスタ一覧へ</button></div></div>
      </>
    );
  }
  const p: Draft | null = editing ? draft : data ? toDraft(data.product) : null;
  if (!m || !p) return <Loading />;

  const ro = !editing;
  const pid = mode === 'new' ? m.nextId : id ?? '';
  const detailUrl = `${LIST}/${pid}`;
  const set = (patch: Partial<Draft>) => {
    if (ro) return;
    dirty.mark();
    setDraft((d) => (d ? { ...d, ...patch } : d));
    if (Object.keys(errs).length) setErrs({});
  };
  const er = (k: string) => errs[k];

  /* ---------- 写真 ---------- */
  const setMain = (i: number) => set({ images: p.images.map((x, j) => ({ ...x, main: j === i })) });
  const delPhoto = (i: number) => {
    const rest = p.images.filter((_, j) => j !== i);
    if (rest.length && !rest.some((x) => x.main)) rest[0] = { ...rest[0], main: true };
    set({ images: rest });
  };
  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    /* 形式・5MB・長い辺 1200px を外れたファイルは追加しない（E268）。縮小はしない（受付簿 #236） */
    const ok = [...files].filter(photoFileOk);
    const room = MAX_PHOTOS - p.images.length;
    const got = await Promise.all(ok.slice(0, room).map((f) => readPhoto(f).catch(() => null)));
    const urls = got.filter((u): u is string => !!u);
    if (urls.length < files.length) toast(ERR_PHOTO);
    if (!urls.length) return;
    set({ images: [...p.images, ...urls.map((file, i) => ({ file, main: !p.images.length && i === 0 }))] });
  };
  const preview = (src: string, name: string) => openModal(<PhotoZoom src={src} name={name} />);

  /* ---------- JAN（複数・先頭が主。10件まで） ---------- */
  const jans = p.jans?.length ? p.jans : [''];
  const setJan = (i: number, v: string) => set({ jans: jans.map((x, j) => (j === i ? janIn(v) : x)) });
  const delJan = (i: number) => { const rest = jans.filter((_, j) => j !== i); set({ jans: rest.length ? rest : [''] }); };

  /* ---------- 仕入先 ---------- */
  const supName = (sid: string) => m.suppliers.find((s) => s.id === sid)?.name ?? sid;
  const setSup = (i: number, patch: Partial<Draft['suppliers'][number]>) => set({ suppliers: p.suppliers.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const pickSup = (i: number) => set({ suppliers: p.suppliers.map((s, j) => ({ ...s, selected: j === i })) });
  const delSup = (i: number) => {
    const rest = p.suppliers.filter((_, j) => j !== i);
    if (rest.length && !rest.some((s) => s.selected)) rest[0] = { ...rest[0], selected: true };
    set({ suppliers: rest });
  };

  /* ---------- 保存・削除 ---------- */
  const save = async () => {
    if (!draft || busy) return;
    const e = checkProductInput(draft);
    setErrs(e);
    const keys = Object.keys(e);
    if (keys.length) {
      const t = keys.map((k) => TAB_OF(k)).find(Boolean);
      if (t) setTab(t);
      return;
    }
    /* 有効 → 無効：有効なメニューに入っている商品・在庫がある商品は無効にできない（E273。理由のモーダル） */
    if (mode === 'edit' && id && draft.status === '無効' && data?.product.status !== '無効') {
      try {
        const b = await api.query('productBlockers', { id });
        if (b.blocked) { openModal(<BlockedModal what="無効" b={b} />); return; }
      } catch (err) { toastError(err); return; }
    }
    setBusy(true);
    try {
      /* 公開したメニューにある商品の価格・出せなくなる拠点があるときは、先に確かめる（価格改定／誤りの訂正・法人へ通知・確認） */
      if (mode === 'edit' && id) {
        const imp = await api.query('productImpact', { id, data: { ...draft, jans: jansFilled(draft) } });
        if (imp.needPriceMode || imp.needConfirm) {
          setBusy(false);
          openModal(<PriceDialog imp={imp} onOk={(o) => { closeModal(); doSave(o); }} />);
          return;
        }
      }
      await doSave({});
    } catch (err) { toastError(err); } finally { setBusy(false); }
  };
  const doSave = async (opts: SaveOpts, force = false) => {
    if (!draft) return;
    setBusy(true);
    try {
      const out = await api.action('saveProduct', { id: mode === 'edit' ? id : undefined, data: { ...draft, jans: jansFilled(draft) }, opts, baseVersion: mode === 'edit' ? baseVer.current : undefined, ...(force ? { force: true } : {}) });
      dirty.clear();
      /* S151（登録しました。）・S01（保存しました。）。状態を変えたときは S174・S175 も出す */
      toast(mode === 'new' ? '登録しました。' : '保存しました。');
      if (mode === 'edit' && data && draft.status !== data.product.status) toast(draft.status === '無効' ? `商品 ${out.id} を無効にしました。一覧・メニューの商品選択には出ません。` : `商品 ${out.id} を有効に戻しました。`);
      if (out.priceFix?.confirmedInvoices.length) openModal(<InvoiceFixList list={out.priceFix.confirmedInvoices} />);
      router.push(fromList ? LIST : `${LIST}/${out.id}`);
    } catch (err) {
      /* JAN の重複（E09）は項目の下に出す */
      const msg = errorMessage(err);
      if (isStale(err)) {
        /* 他の人が先に保存していた（E31）：警告のモーダル。「上書きして保存」は force で送り直す */
        openModal(<ConfirmModal kind="warn" title="内容が更新されています" text="他のユーザーにより内容が更新されています。上書きすると保存されます。" ok="上書きして保存" okCls="warn-solid" onOk={() => { void doSave(opts, true); }} />);
      } else if (msg.startsWith('JANコード')) setErrs({ jan: msg }); else toastError(err);
    } finally { setBusy(false); }
  };
  const remove = () => delProduct(pid, data?.product.mgmtName?.trim() || data?.product.name || '', () => router.push(LIST));
  const cancel = () => dirty.guard(() => router.push(mode === 'new' || fromList ? LIST : detailUrl));
  const title = { detail: `商品マスタ詳細 ${pid}`, edit: `商品マスタ編集 ${pid}`, new: '商品マスタ新規登録' }[mode];
  const crumb = { detail: '商品マスタ詳細', edit: '商品マスタ編集', new: '商品マスタ新規登録' }[mode];
  const whOpts: DropOpt[] = [...m.warehouses.map((w) => ({ value: w.id, label: w.name })), ...p.pickWarehouseIds.filter((x) => !m.warehouses.some((w) => w.id === x)).map((x) => ({ value: x, label: x }))];
  const tabs: Tab[] = mode === 'new' ? ['管理用', '表示用'] : ['管理用', '表示用', '変更履歴'];

  return (
    <div className="pm">
      <PageHead crumbs={['マスタ管理', '商品マスタ', crumb]} title={title}>
        {mode === 'detail' ? (
          <>
            {/* 権限がなければ出さない */}
            {data?.product.status === '無効' && <Badge v="無効" />}
            {canAct(api, 'deleteRow', { key: 'product' }) && <button className="btn dan lg" onClick={remove}><Icon name="trash" />削除</button>}
            {canAct(api, 'saveProduct') && <button className="btn pri lg" onClick={() => router.push(`${detailUrl}/edit`)}><Icon name="edit" />編集</button>}
          </>
        ) : (
          <>
            <button className="btn ghost lg" onClick={cancel}>キャンセル</button>
            <button className="btn pri lg" disabled={busy} onClick={save}>{mode === 'new' ? '登録' : '保存'}</button>
          </>
        )}
      </PageHead>
      {/* 保存できないとき：エラーの一覧は出さない（項目の下の文言と二重になる）。1行だけ（P-FORMBOX・hong 2026/10/05） */}
      {Object.keys(errs).length > 0 && (
        <div className="notice err" role="alert"><Icon name="warn" /><div><b>保存できません（{Object.keys(errs).length}件）。</b>赤い項目を確認してください。</div></div>
      )}

      {/* ---------- 基本情報 ---------- */}
      <div className="card pm-card">
        <Sec title="基本情報">
          <div className="fg">
            <Field label="品番" hint={mode === 'new' ? '登録すると自動で付きます' : undefined}><input className="inp" disabled value={pid} aria-label="品番" /></Field>
            {/* JAN は複数（行で並べる・1行目が主 JAN・10件まで。台帳 F 2026-10-08） */}
            <Field label="JANコード" err={er('jan')} hint={editing ? `8〜13桁の数字・${JAN_MAX}件まで（1行目が主JAN）` : undefined}>
              <div style={{ display: 'grid', gap: '0.428571rem' }}>
                {jans.map((j, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center' }}>
                    <TxtIn v={j} ro={ro} ph="8〜13桁の数字" err={!!er('jan')} label={i === 0 ? 'JANコード' : `JANコード（${i + 1}）`} on={(v) => setJan(i, v)} />
                    {editing && (jans.length > 1 || j) && <button type="button" className="icon-btn" aria-label="このJANを削除" onClick={() => delJan(i)}><Icon name="trash" /></button>}
                  </div>
                ))}
                {editing && jans.length < JAN_MAX && <button type="button" className="btn out sm" style={{ justifySelf: 'start' }} onClick={() => set({ jans: [...jans, ''] })}><Icon name="plus" />JANを追加</button>}
              </div>
            </Field>
            {/* 商品名は4種類（2026/10/03 決定）：公開名（日本語）は法人Web・アプリ・請求書、管理名は運営の一覧、仕入先向けの名前は仕入先サイト・発注 */}
            <Field label="商品名（公開名・日本語）" req err={er('name')}><TxtIn v={p.name} ro={ro} ph="法人・アプリに出す名前" err={!!er('name')} label="商品名（公開名・日本語）" on={(v) => set({ name: v })} /></Field>
            <Field label="商品名カナ" err={er('kana')} hint={editing ? '全角カタカナ（任意。検索用）' : undefined}><TxtIn v={p.kana} ro={ro} ph="ショウヒンメイ" err={!!er('kana')} label="商品名カナ" on={(v) => set({ kana: v })} /></Field>
            <Field label="商品名（公開名・英語）" req err={er('nameEn')} hint={editing ? '半角の英語（法人Web・アプリにも表示）' : undefined}><TxtIn v={p.nameEn ?? ''} ro={ro} ph="English name" err={!!er('nameEn')} label="商品名（公開名・英語）" on={(v) => set({ nameEn: v })} /></Field>
            <Field label="管理名（社内）" err={er('mgmtName')} hint={editing ? '運営の一覧・選択肢に品番と並べて出します。空欄は公開名' : undefined}><TxtIn v={p.mgmtName ?? ''} ro={ro} ph={p.name || '管理名'} err={!!er('mgmtName')} label="管理名（社内）" on={(v) => set({ mgmtName: v })} /></Field>
            <Field label="仕入先向けの名前" err={er('supplierItemName')} hint={editing ? '仕入先サイト・発注に出します。空欄は公開名' : undefined}><TxtIn v={p.supplierItemName ?? ''} ro={ro} ph={p.name || '仕入先向けの名前'} err={!!er('supplierItemName')} label="仕入先向けの名前" on={(v) => set({ supplierItemName: v })} /></Field>
            <Field label="カテゴリ" req err={er('category')}>
              <select className={`sel${er('category') ? ' err' : ''}`} aria-label="カテゴリ" disabled={ro} value={p.categoryId ?? ''} onChange={(e) => set({ categoryId: e.target.value, category: m.categories.find((c) => c.id === e.target.value)?.name ?? '' })}>
                <option value="">選択してください</option>
                {m.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <Field label="販売価格（税込）" req err={er('priceYen')}><NumIn v={p.priceYen} unit="円" int ro={ro} err={!!er('priceYen')} label="販売価格（税込）" on={(v) => set({ priceYen: v })} /></Field>
            <Field label="税率" req err={er('taxRateId')} hint={editing ? 'ドロップダウンから税率を追加・削除できます（使っている税率は削除できません）' : undefined}>
              <TaxRateSelect value={p.taxRateId} disabled={ro} err={!!er('taxRateId')} onChange={(v) => set({ taxRateId: v })} />
            </Field>
            {mode !== 'new' && (
              <Field label="状態" req hint={editing ? '無効にすると一覧・メニュー作成の商品選択に既定で出ません（有効なメニューに入っている商品・在庫がある商品は無効にできません）' : undefined}>
                <select className="sel" aria-label="状態" disabled={ro} value={p.status ?? '有効'} onChange={(e) => set({ status: e.target.value as '有効' | '無効' })}>
                  <option>有効</option><option>無効</option>
                </select>
              </Field>
            )}
            <div className="full">
              <Field label="商品写真" hint={editing ? `PNG・JPEG・WebP／最大5MB・${MAX_PHOTOS}枚まで` : undefined}>
                <div className="pm-photos">
                  {p.images.map((x, i) => {
                    const src = imgSrc(x.file, p.category);
                    const fname = photoName(pid, i, x.file, src);
                    return (
                      <div key={i} className={`pm-ph${x.main ? ' main' : ''}`}>
                        <div className="pm-img">
                          <img src={src} alt={`商品写真${i + 1}`} />
                          <div className="pm-ov">
                            <button type="button" aria-label="写真を拡大" onClick={() => preview(src, fname)}><Icon name="search" /></button>
                            <button type="button" aria-label="写真をダウンロード" onClick={() => download(src, fname)}><Icon name="down" /></button>
                            {editing && <button type="button" aria-label="写真を削除" onClick={() => delPhoto(i)}><Icon name="trash" /></button>}
                          </div>
                        </div>
                        <label><input type="radio" name="pm-main" checked={x.main} disabled={ro} onChange={() => setMain(i)} />メイン</label>
                      </div>
                    );
                  })}
                  {editing && p.images.length < MAX_PHOTOS && (
                    <label className="pm-ph pm-addph">
                      <div className="pm-img"><Icon name="plus" /><span>追加</span></div>
                      <input type="file" accept={PHOTO_TYPES.join(',')} multiple hidden onChange={(e) => { addPhotos(e.target.files); e.target.value = ''; }} />
                    </label>
                  )}
                  {!p.images.length && ro && <span className="muted">写真はありません</span>}
                </div>
              </Field>
            </div>
            <div className="full">
              <Field label="商品備考" err={er('note')}><textarea className={`inp${er('note') ? ' err' : ''}`} rows={3} aria-label="商品備考" disabled={ro} placeholder={editing ? '社内メモ' : undefined} value={p.note} onChange={(e) => set({ note: e.target.value })} /></Field>
            </div>
          </div>
        </Sec>
      </div>

      {/* ---------- タブ ---------- */}
      <div className="card pm-card">
        <div className="tabs" role="tablist">
          {tabs.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={[tab === t ? 'on' : '', Object.keys(errs).some((k) => TAB_OF(k) === t) ? 'err' : ''].filter(Boolean).join(' ') || undefined} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {tab === '管理用' && (
          <>
            <NutSec n={p.nutrition.per100g} ro={ro} req={editing} errs={errs} on={(n) => set({ nutrition: { per100g: n, perServing: perServingOf(n) } })} />
            <Sec title="保管情報">
              <div className="fg pm-c4">
                <Field label="ピッキング倉庫" req={editing} err={er('pick')}>
                  <MultiDrop label="ピッキング倉庫" value={p.pickWarehouseIds} opts={whOpts} disabled={ro} err={!!er('pick')} ph="選ばない" onChange={(v) => set({ pickWarehouseIds: v })} />
                </Field>
                <Field label="コース" req={editing} err={er('courses')}>
                  <MultiDrop label="コース" value={p.courses} opts={withVals(COURSES, [])} disabled={ro} err={!!er('courses')} ph="選ばない" onChange={(v) => set({ courses: COURSES.filter((c) => v.includes(c)) })} />
                </Field>
                <Field label="保管方法（管理用）">
                  <select className="sel" aria-label="保管方法（管理用）" disabled={ro} value={p.storage.admin} onChange={(e) => set({ storage: { ...p.storage, admin: e.target.value as Draft['storage']['admin'] } })}>
                    {STORAGE.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="保管方法（表示用）">
                  <select className="sel" aria-label="保管方法（表示用）" disabled={ro} value={p.storage.display} onChange={(e) => set({ storage: { ...p.storage, display: e.target.value as Draft['storage']['display'] } })}>
                    {STORAGE.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
            </Sec>
            {/* 自販機：メインコラム＋サブコラム（メインと重ならない。サブコラムの意味は設計書の open のため保存・表示だけ。台帳 F 2026-10-08 ⑤） */}
            <Sec title="自販機">
              <div className="fg c2">
                <Field label="メインコラム" err={er('vm')} hint={editing ? '自販機に入らない商品は空のままにします。シングルとダブルの両方は選べません' : undefined}>
                  <MultiDrop label="メインコラム" value={p.vending.columns} opts={withVals(m.vmColumns, p.vending.columns)} disabled={ro} err={!!er('vm')}
                    onChange={(v) => set({ vending: { ...p.vending, columns: v, subColumns: (p.vending.subColumns ?? []).filter((c) => !v.includes(c)) } })} />
                </Field>
                <Field label="サブコラム" err={er('vmSub')}>
                  <MultiDrop label="サブコラム" value={p.vending.subColumns ?? []} opts={withVals(m.vmColumns, p.vending.subColumns ?? []).filter((o) => !p.vending.columns.includes(o.value))} disabled={ro} err={!!er('vmSub')}
                    ph={ro ? 'なし' : undefined} onChange={(v) => set({ vending: { ...p.vending, subColumns: v } })} />
                </Field>
                <Field label="対応機種">
                  <MultiDrop label="対応機種" value={p.vending.models} opts={m.models.map((x) => ({ value: x.id, label: x.name }))} disabled={ro} onChange={(v) => set({ vending: { ...p.vending, models: v } })} />
                </Field>
                <Field label="自販機コラム備考" className="full" err={er('vmNote')}><textarea className={`inp${er('vmNote') ? ' err' : ''}`} rows={3} aria-label="自販機コラム備考" disabled={ro} placeholder={editing ? '入力内容' : undefined} value={p.vending.note} onChange={(e) => set({ vending: { ...p.vending, note: e.target.value } })} /></Field>
              </div>
            </Sec>
            <Sec title="出荷指示">
              <div className="fg c2">
                <Field label="出荷指示の同梱資材">
                  <MultiDrop label="出荷指示の同梱資材" value={p.bundledMaterialIds} opts={m.materials.map((x) => ({ value: x.id, label: x.name }))} disabled={ro} onChange={(v) => set({ bundledMaterialIds: v })} />
                </Field>
                <Field label="出荷時の特殊指示" err={er('ship')}>
                  <MultiDrop label="出荷時の特殊指示" value={p.shipInstructions} opts={withVals(SHIP, p.shipInstructions)} disabled={ro} onChange={(v) => set({ shipInstructions: v })} onAdd={(t) => t} addPh="指示を入力（この商品だけ）" />
                </Field>
              </div>
            </Sec>
            <Sec title="賞味期限または消費期限">
              <div className="fg c2">
                <Field label="ESの賞味期限または消費期限" req={editing} err={er('shelf')} hint={editing ? '入れると短消費期限の区分を自動で選びます' : undefined}>
                  <div className="pm-life">
                    <NumIn v={p.shelfLife.esValue} int ro={ro} err={!!er('shelf')} label="ESの賞味期限または消費期限" on={(v) => set({ shelfLife: { ...p.shelfLife, esValue: v, shortClass: shortClassOf(v, p.shelfLife.esUnit) } })} />
                    <select className="sel" aria-label="期限の単位" disabled={ro} value={p.shelfLife.esUnit} onChange={(e) => { const u = e.target.value as '日' | 'ヶ月'; set({ shelfLife: { ...p.shelfLife, esUnit: u, shortClass: shortClassOf(p.shelfLife.esValue, u) } }); }}>
                      <option>日</option><option>ヶ月</option>
                    </select>
                  </div>
                </Field>
                <Field label="メーカーの賞味期限または消費期限" err={er('maker')}><TxtIn v={p.shelfLife.maker} ro={ro} ph="メーカーの賞味期限または消費期限" err={!!er('maker')} label="メーカーの賞味期限または消費期限" on={(v) => set({ shelfLife: { ...p.shelfLife, maker: v } })} /></Field>
                <Field label="短消費期限" className="full">
                  <div className="radios">
                    {SHORT.map(([v, l]) => (
                      <label key={v}><input type="radio" name="pm-short" checked={p.shelfLife.shortClass === v} disabled={ro} onChange={() => set({ shelfLife: { ...p.shelfLife, shortClass: v } })} />{l}</label>
                    ))}
                  </div>
                </Field>
              </div>
            </Sec>
            <Sec title="仕入先">
              {/* 仕入先は複数可（受付簿 #286）：行を足す・消す。「選択中」の1社が発注・粗利・一覧に使われる。1社以上・各行の仕入先・仕入単価・ロットは必須（受付簿 #273） */}
              <div className="tbl-wrap">
                <table className="tbl pm-sup">
                  <thead><tr><th>選択中</th><th>仕入先名{editing && <span className="req">*</span>}</th><th className="num">仕入単価（税抜）{editing && <span className="req">*</span>}</th><th>仕入単価の改定（税抜・適用開始日）</th><th>税率</th><th className="num">ロット{editing && <span className="req">*</span>}</th>{editing && <th className="act" />}</tr></thead>
                  <tbody>
                    {p.suppliers.map((sup, i) => {
                      const k = (x: string) => er(`sup.${i}.${x}`);
                      return (
                        <Fragment key={i}>
                          <tr>
                            <td><input type="radio" name="pm-sup" aria-label="選択中" checked={sup.selected} disabled={ro} onChange={() => pickSup(i)} /></td>
                            <td>{ro ? supName(sup.supplierId) : (
                              <select className={`sel${k('supplierId') ? ' err' : ''}`} aria-label="仕入先名" value={sup.supplierId} onChange={(e) => setSup(i, { supplierId: e.target.value })}>
                                <option value="">選択してください</option>
                                {m.suppliers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
                              </select>
                            )}{k('supplierId') && <span className="emsg">{k('supplierId')}</span>}</td>
                            <td className="num">{ro ? yen(sup.unitCostYen) : <NumIn v={sup.unitCostYen} unit="円" int ro={false} err={!!k('cost')} label="仕入単価（税抜）" on={(v) => setSup(i, { unitCostYen: v })} />}{k('cost') && <span className="emsg">{k('cost')}</span>}</td>
                            {/* 値上げ・値下げは適用開始日を選んで登録（RD-MN-076）。その日から発注・粗利率は新しい単価 */}
                            <td>{ro ? (sup.nextCost ? <span className="num">{yen(sup.nextCost.unitCostYen)}（{fmtDate(sup.nextCost.from)}〜）</span> : '—') : sup.nextCost ? (
                              <div className="pm-life">
                                <NumIn v={sup.nextCost.unitCostYen} unit="円" int ro={false} err={!!k('next')} label="改定後の仕入単価（税抜）" on={(v) => setSup(i, { nextCost: { ...sup.nextCost!, unitCostYen: v } })} />
                                <DateInput className={`inp${k('from') ? ' err' : ''}`} aria-label="仕入単価の適用開始日" value={sup.nextCost.from.replace(/\//g, '-')} onChange={(e) => setSup(i, { nextCost: { ...sup.nextCost!, from: e.target.value.replace(/-/g, '/') } })} />
                                <button type="button" className="icon-btn" aria-label="仕入単価の改定を取り消す" onClick={() => setSup(i, { nextCost: undefined })}><Icon name="trash" /></button>
                              </div>
                            ) : <button type="button" className="btn out sm" onClick={() => setSup(i, { nextCost: { unitCostYen: sup.unitCostYen, from: '' } })}>改定を登録</button>}
                              {(k('next') || k('from')) && <span className="emsg">{k('next') || k('from')}</span>}</td>
                            <td>{ro ? m.taxRates.find((t) => t.id === (sup.taxRateId || p.taxRateId))?.label ?? '—'
                              : <TaxRateSelect label="仕入単価の税率" value={sup.taxRateId || p.taxRateId} onChange={(v) => setSup(i, { taxRateId: v })} />}</td>
                            <td className="num">{ro ? sup.lot : <NumIn v={sup.lot} int ro={false} err={!!k('lot')} label="ロット" on={(v) => setSup(i, { lot: v })} />}{k('lot') && <span className="emsg">{k('lot')}</span>}</td>
                            {editing && <td className="act"><button type="button" className="icon-btn" aria-label="この仕入先を削除" disabled={p.suppliers.length <= 1} onClick={() => delSup(i)}><Icon name="trash" /></button></td>}
                          </tr>
                          {/* 仕入れ備考は仕入先ごとの2行目（幅いっぱい。60文字の1行） */}
                          <tr className="pm-sup-memo">
                            <td colSpan={editing ? 7 : 6}><label className="pm-sup-note"><b>仕入れ備考</b>{ro ? <span>{sup.note || '—'}</span> : <TxtIn v={sup.note} ro={false} ph="仕入れ備考" err={!!k('note')} label="仕入れ備考" on={(v) => setSup(i, { note: v })} />}</label>{k('note') && <span className="emsg">{k('note')}</span>}</td>
                          </tr>
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {editing && <button type="button" className="btn out sm pm-addrow" onClick={() => set({ suppliers: [...p.suppliers, { supplierId: '', unitCostYen: NaN, lot: 1, note: '', selected: !p.suppliers.length }] })}><Icon name="plus" />仕入先を追加</button>}
              <p className="muted pm-note">仕入先は複数入れられます（1社以上）。「選択中」の1社が一覧の仕入先・仕入単価・粗利率と発注、仕入先サイトの取扱商品に使われます。仕入単価は税抜（税率は省くと商品の税率）。仕入単価の改定は適用開始日から発注・一覧の単価に使います（それより前に本発注した発注は発注したときの単価のまま）。</p>
            </Sec>
          </>
        )}

        {tab === '表示用' && (
          <>
            <div className="fg pm-c1 pm-top">
              <Field label="商品解説" req={editing} err={er('description')}>
                <textarea className={`inp${er('description') ? ' err' : ''}`} rows={3} aria-label="商品解説" disabled={ro} placeholder={editing ? '法人・アプリに出す商品の説明' : undefined} value={p.description} onChange={(e) => set({ description: e.target.value })} />
              </Field>
            </div>
            {/* 1食当たりは入力しない：100g当たり × 1食当たり内容量 を from・to それぞれ自動計算（RD-MN-118・台帳 F 2026-10-08） */}
            <NutView n={perServingOf(p.nutrition.per100g)} />
            <Sec title="アレルゲン・原材料情報">
              <div className="fg c2">
                <Field label="特定原材料" req={editing} err={er('alg')} hint={editing ? `ない場合は「${ALLERGEN_NONE}」を選びます` : undefined}>
                  <MultiDrop label="特定原材料" value={p.allergens.specific} opts={withVals(ALG_SPECIFIC, p.allergens.specific)} disabled={ro} err={!!er('alg')} ph={`選択してください（ない場合は「${ALLERGEN_NONE}」）`} onChange={(v) => set({ allergens: { ...p.allergens, specific: v } })} />
                </Field>
                <Field label="特定原材料に準ずるもの">
                  <MultiDrop label="特定原材料に準ずるもの" value={p.allergens.equivalent} opts={withVals(ALG_EQUIV, p.allergens.equivalent)} disabled={ro} ph="なし" onChange={(v) => set({ allergens: { ...p.allergens, equivalent: v } })} />
                </Field>
              </div>
            </Sec>
            <Sec title="成分表示">
              <div className="fg c2">
<Field label="原材料名" err={er('ingredients')}><textarea className={`inp${er('ingredients') ? ' err' : ''}`} rows={6} aria-label="原材料名" disabled={ro} placeholder="入力内容" value={p.ingredients} onChange={(e) => set({ ingredients: e.target.value })} /></Field>
<Field label="添加物" err={er('additives')}><textarea className={`inp${er('additives') ? ' err' : ''}`} rows={6} aria-label="添加物" disabled={ro} placeholder="入力内容" value={p.additives} onChange={(e) => set({ additives: e.target.value })} /></Field>
              </div>
            </Sec>
            <Sec title="製造元">
              <div className="fg pm-c1">
                <Field label="ホームページ" err={er('makerUrl')}><TxtIn v={p.makerUrl} ro={ro} ph="https://sample.com" err={!!er('makerUrl')} label="ホームページ" on={(v) => set({ makerUrl: v.trim() })} /></Field>
              </div>
            </Sec>
          </>
        )}

        {tab === '変更履歴' && data && (
          data.history.length ? (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>日時</th><th>操作した人</th><th>操作</th><th>項目</th><th>変更前</th><th>変更後</th><th>理由</th></tr></thead>
                <tbody>{data.history.map((h, i) => <tr key={i}><td>{fmtDateTime(h.at)}</td><td>{h.by}</td><td>{h.op}</td><td>{fmtDatesIn(h.field)}</td><td>{h.before}</td><td>{h.after}</td><td>{h.reason}</td></tr>)}</tbody>
              </table>
            </div>
          ) : <div className="ph-empty"><span>変更履歴はありません</span></div>
        )}
      </div>
    </div>
  );
}
