'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { isStale } from '@/lib/api/errors';
import masters from '@/lib/ops/areas/masters';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import { materialErrors, materialInUse, MATERIAL_NAME_MAX, MATERIAL_SPEC_MAX, MATERIAL_UNIT_MAX, PHOTO_ERR, type MaterialInput } from '@/lib/domain/material';
import { TAX_STD } from '@/lib/domain/tax';
import { fmtDateTime } from '@/lib/format/date';
import { yen } from '@/lib/format/money';
import { catImg } from '@/app/ops/menu/_components/photo';
import { PHOTO_TYPES, photoFileOk, readPhoto } from '../../_ui/photo';
import { EditingNotice, useEditingNotice } from '../../_ui/editingNotice';
import { useOpsLeaveGuard } from '../../_ui/leaveGuard';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct } from '../../_ui/perm';
import { TaxRateSelect } from '../../_ui/TaxRateSelect';
import { EsModal } from './parts';
import { BASE } from './routes';

/*
 * 資材マスタの詳細（表示だけ）・登録・編集（画面設計書 AW_MATE_002・003、台帳 F「資材マスタの作り」・受付簿 #358〜#361）。
 *   機種マスタと同じ3画面の作り（一覧 → 詳細 → 登録・編集。モーダルにしない）。項目が少ないので spec 駆動ではなく専用の画面
 *   詳細：基本情報・価格と取扱倉庫・使用状況（プラン数／未納品の資材注文数／在庫のある倉庫数＝E259 と同じ数え方）・変更履歴（P-HIST）。「編集」は作成・更新の権限がある役割だけ
 *   登録・編集：必須チェック（E01・E04・E09・E12・E14・E268）は画面とサーバーで同じ（lib/domain/material.ts の materialErrors）。
 *     単価は必須・初期値は空（0円は入れれば登録できる）。取扱倉庫の選択肢は倉庫区分「ピッキング倉庫（資材）」・初期値 ES事務所。
 *     同時編集：開いたとき I02・保存のとき E31（上書きして保存）。変更して離れるとき Q02。保存 S01
 *   削除は一覧の操作（Q01 → S02。使用中は E259 のモーダル）。詳細には置かない
 */
const api = areaApi(masters);
type Mode = 'detail' | 'edit' | 'new';
const LIST = BASE.materials;

/** 項目1つ（見出し・入力・エラー・注記）。画面の中で作ると描き直すたびに入力欄が作り直されるので、外に置く */
function Fld({ c, k, label, req, note, children }: { c: { errs: Record<string, string>; editing: boolean }; k: string; label: string; req?: boolean; note?: ReactNode; children: ReactNode }) {
  return (
    <div className={`f${c.errs[k] ? ' verr' : ''}${k === 'courses' && c.editing ? ' span2' : k === 'photo' || k === 'courses' || k === 'warehouseIds' ? ' span3' : ''}`}>
      <label>{label}{c.editing && req && <span className="req">*</span>}</label>
      <div className="ctl">{children}</div>
      {c.errs[k] && <div className="ferr" role="alert">{c.errs[k]}</div>}
      {c.editing && note && <div className="mt-note">{note}</div>}
    </div>
  );
}

const blank = (whIds: string[]): MaterialInput => ({
  name: '', courses: [], unit: '', spec: '', photo: '', priceYen: '', taxRateId: TAX_STD, publish: '公開',
  /* 取扱倉庫の初期値は ES事務所（WH00004） */
  warehouseIds: whIds.includes('WH00004') ? ['WH00004'] : [],
});

export default function MaterialScreen({ mode, id }: { mode: Mode; id?: string }) {
  const router = useRouter();
  const { toast, toastError, account } = useOps();
  const canAct = useCanAct();
  const editing = mode !== 'detail';
  const { data, loading } = useQuery(api, 'materialGet', { id: id ?? '' });
  const { data: opts } = useQuery(api, 'materialOpts', { id: id ?? '' });
  /* I02：同じ資材を編集中のほかの人を先に知らせる（ロックしない。新規登録はまだ ID がないので対象外） */
  const editors = useEditingNotice(mode === 'edit' && !!id && !!account, (leave) => api.query('presence', { kind: 'materials', id: id!, accountId: account!.id, name: account!.name, leave }));
  const [input, setInput] = useState<MaterialInput | null>(null);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modal, setModal] = useState<ReactNode>(null);
  /* 同時更新の検知（E31）：フォームを読み込んだときの版。保存で送り、違えば「上書きして保存」を出す（lib/ops/core/concurrency.ts） */
  const baseVer = useRef<string | undefined>(undefined);
  /* 一覧の鉛筆から開いた編集は、キャンセルで一覧へ戻る（?from=list） */
  const [from, setFrom] = useState<string | null>(null);
  useEffect(() => { setFrom(new URLSearchParams(window.location.search).get('from')); }, []);

  /* 編集・新規は最初に1回だけ値を入れる（編集中はほかの画面の書き換えで上書きしない） */
  useEffect(() => {
    if (!editing || input) return;
    if (mode === 'new' && opts) setInput(blank(opts.warehouses.map((w) => w.id)));
    if (mode === 'edit' && data) { baseVer.current = data.version; setInput(data.input); }
  }, [editing, mode, opts, data, input]);
  /* 削除済は編集できない（E36） */
  useEffect(() => {
    if (mode === 'edit' && data && data.m.status === '削除済') { toastError(new Error('削除済みのため編集できません。')); router.replace(`${LIST}/${id}`); }
  }, [mode, data, id, router, toastError]);

  /* 編集中にブラウザを閉じる・再読み込みするときの確認 */
  useOpsLeaveGuard(dirty && editing);
  useEffect(() => {
    if (!dirty || !editing) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty, editing]);

  const detailUrl = id ? `${LIST}/${id}` : LIST;
  /** 離れるときの確認（Q02。入力を変えていれば） */
  const guard = (go: () => void) => {
    if (dirty && editing) {
      setModal(<EsModal title="編集内容を破棄しますか？" body={<>編集中の内容は保存されません。<br />編集内容を破棄してもよろしいですか？</>} ok="破棄" onClose={() => setModal(null)} onOk={() => { setDirty(false); go(); }} />);
    } else go();
  };

  if (mode !== 'new' && !loading && !data) {
    return (
      <div className="wrap"><section className="screen s-mt"><div className="phead"><div className="phl">
        <div className="crumb">マスタ管理 / <a href="#" className="lnk" onClick={(e) => { e.preventDefault(); router.push(LIST); }}>資材マスタ</a></div>
        <h2>資材が見つかりません<span className="pid">{id}</span></h2>
      </div></div></section></div>
    );
  }
  if (mode === 'detail' ? !data : !input || !opts) return <div className="wrap" />;

  const m = data?.m;
  const label = { detail: '資材詳細', edit: '資材編集', new: '資材新規登録' }[mode];
  const v = input;
  const set = (patch: Partial<MaterialInput>) => {
    setInput((cur) => (cur ? { ...cur, ...patch } : cur));
    setDirty(true);
    if (Object.keys(errs).length) setErrs({});
  };
  const toggle = (list: string[], x: string) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

  /* ---------- 写真（PNG・JPEG・WebP・5MB・1枚。商品マスタの商品写真と同じ部品・チェック） ---------- */
  const pickPhoto = async (files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    /* 形式・5MB・長い辺 1200px を外れたファイルは入れない（E268） */
    const url = photoFileOk(f) ? await readPhoto(f).catch(() => null) : null;
    if (!url) { toast(PHOTO_ERR); return; }
    set({ photo: url });
  };

  /* ---------- 保存 ---------- */
  const save = async () => {
    if (!v || !opts || busy) return;
    const e = materialErrors(v, opts.ctx);
    setErrs(e);
    if (Object.keys(e).length) return;
    void doSave(false);
  };
  const doSave = async (force: boolean) => {
    if (!v) return;
    setBusy(true);
    try {
      if (mode === 'new') {
        const out = await api.action('createMaterial', { kind: 'materials', data: v });
        setDirty(false);
        toast('保存しました。');
        router.replace(`${LIST}/${out.id}`);
      } else {
        await api.action('saveMaterial', { kind: 'materials', id: id!, data: v, baseVersion: baseVer.current, ...(force ? { force: true } : {}) });
        setDirty(false);
        toast('保存しました。');
        router.push(detailUrl);
      }
    } catch (e) {
      /* 他のユーザーが先に保存していた（E31）：警告のモーダル。「上書きして保存」は force で送り直す */
      if (isStale(e)) setModal(<EsModal title="内容が更新されています" body="他のユーザーにより内容が更新されています。上書きすると保存されます。" ok="上書きして保存" cancel="キャンセル" onClose={() => setModal(null)} onOk={() => { void doSave(true); }} />);
      else toastError(e);
    } finally { setBusy(false); }
  };
  const cancel = () => guard(() => router.push(mode === 'edit' && from !== 'list' ? detailUrl : LIST));

  /* ---------- 部品 ---------- */
  const c = { errs, editing };
  const dash = (s: string) => s || '—';
  const photoView = (p: string) => (p ? <img src={catImg(p)} alt="資材の写真" /> : <span className="none">—</span>);
  const whName = (wid: string) => opts?.warehouses.find((w) => w.id === wid)?.name ?? wid;
  const errCount = Object.keys(errs).length;

  const fId = (
            <Fld c={c} k="id" label="資材ID" note="登録すると S＋3桁の続き番号が自動で付きます">
              <div className="mt-val">{mode === 'new' ? `${opts?.nextId ?? ''}（登録時に採番）` : id}</div>
            </Fld>
  );
  const fName = (
            <Fld c={c} k="name" label="資材名" req>
              {editing && v ? <input value={v.name} aria-label="資材名" maxLength={MATERIAL_NAME_MAX * 2} onChange={(e) => set({ name: e.target.value })} /> : <div className="mt-val">{m?.name}</div>}
            </Fld>
  );
  const fUnit = (
            <Fld c={c} k="unit" label="単位" req note={`自由入力・${MATERIAL_UNIT_MAX}文字まで。表記は「個」にそろえてください（個／コのゆれを避けます）`}>
              {editing && v ? <input value={v.unit} aria-label="単位" placeholder="個" onChange={(e) => set({ unit: e.target.value })} /> : <div className="mt-val">{m?.unit}</div>}
            </Fld>
  );
  const fSpec = (
            <Fld c={c} k="spec" label="規格" note={`${MATERIAL_SPEC_MAX}文字まで（法人Webの資材注文に出します）`}>
              {editing && v ? <input value={v.spec} aria-label="規格" placeholder="幅30×奥行20cm" onChange={(e) => set({ spec: e.target.value })} /> : <div className="mt-val">{dash(m?.spec ?? '')}</div>}
            </Fld>
  );
  const fCourses = (
            <Fld c={c} k="courses" label="コース" req note="法人Webの資材注文は、お客様のコースを含む資材だけ出します（使用中でも変えられます）">
              {editing && v ? (
                <div className="chk" role="group" aria-label="コース">
                  {opts!.courses.map((c) => <label key={c}><input type="checkbox" checked={v.courses.includes(c)} onChange={() => set({ courses: toggle(v.courses, c) })} />{c}</label>)}
                </div>
              ) : <div className="mt-val">{m?.courses.join('・')}</div>}
            </Fld>
  );
  const fPublish = (
            <Fld c={c} k="publish" label="公開ステータス" req note="非公開にしても運営には見えます（資材発注・資材注文管理・在庫・初期セットの選択肢に出せます）。法人Webの資材注文には出しません。既存の注文・初期備品・在庫は変わりません">
              {editing && v ? (
                <select value={v.publish} aria-label="公開ステータス" onChange={(e) => set({ publish: e.target.value })}><option>公開</option><option>非公開</option></select>
              ) : <div className="mt-val"><span className={`es-badge ${m?.publish === '公開' ? 'es-badge--success' : 'es-badge--neutral'}`}>{m?.publish}</span></div>}
            </Fld>
  );
  const fPhoto = (
            <Fld c={c} k="photo" label="写真" note="PNG・JPEG・WebP／5MBまで・1枚（商品写真と同じ）。法人Webの資材注文に出します">
              <div className="mt-photo">
                {photoView(editing && v ? v.photo : m?.photo ?? '')}
                {editing && v && (
                  <div className="acts">
                    <label className="mini add" style={{ cursor: 'pointer' }}>
                      {v.photo ? '写真を差し替える' : '写真を選ぶ'}
                      <input type="file" accept={PHOTO_TYPES.join(',')} hidden aria-label="写真を選ぶ" onChange={(e) => { void pickPhoto(e.target.files); e.target.value = ''; }} />
                    </label>
                    {v.photo && <button type="button" className="mini" onClick={() => set({ photo: '' })}>写真を削除</button>}
                  </div>
                )}
              </div>
            </Fld>
  );
  const fPrice = (
            <Fld c={c} k="priceYen" label="単価（税抜）" req note="最初は空です（入れ忘れで無料の資材にならないように。0円は入力すれば登録できます）。変えても、受付済みの資材注文の請求額は変わりません（注文時点の値を持ちます）">
              {editing && v ? (
                <div className="num"><input className="r" inputMode="numeric" value={v.priceYen} aria-label="単価（税抜）" onChange={(e) => set({ priceYen: e.target.value.replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[,円\s]/g, '') })} /><span className="unit">円</span></div>
              ) : <div className="mt-val">{m?.priceYen === undefined ? '—' : yen(m.priceYen)}{m?.priceYen === 0 && '（請求されない資材）'}</div>}
            </Fld>
  );
  const fTax = (
            <Fld c={c} k="taxRateId" label="税率" req>
              {editing && v ? <TaxRateSelect value={v.taxRateId} err={!!errs.taxRateId} onChange={(x) => set({ taxRateId: x })} /> : <TaxRateSelect value={m?.taxRateId ?? TAX_STD} disabled />}
            </Fld>
  );
  const fWh = (
            <Fld c={c} k="warehouseIds" label="取扱倉庫" req note="資材発注の納入先の初期値になります（倉庫区分「ピッキング倉庫（資材）」だけ選べます。使用中でも変えられます）">
              {editing && v ? (
                <div className="chk" role="group" aria-label="取扱倉庫">
                  {opts!.warehouses.map((w) => <label key={w.id}><input type="checkbox" checked={v.warehouseIds.includes(w.id)} onChange={() => set({ warehouseIds: toggle(v.warehouseIds, w.id) })} />{w.name}</label>)}
                </div>
              ) : <div className="mt-val">{m?.warehouseIds.map(whName).join('・')}</div>}
            </Fld>
  );

  return (
    <div className="wrap">
      <section className="screen s-mt">
        <div className="phead">
          <div className="phl">
            <div className="crumb">マスタ管理 / <a href="#" className="lnk" onClick={(e) => { e.preventDefault(); guard(() => router.push(LIST)); }}>資材マスタ</a> / {label}</div>
            <h2>{label}<span className="pid">{mode === 'new' ? '' : id}</span></h2>
            {m?.status === '削除済' && <div className="sumbar"><span className="s"><i>状態</i><b>削除済</b></span></div>}
          </div>
          <div className="pbtn">
            {mode === 'detail' ? (
              <>
                {/* 編集は作成・更新の権限がある役割だけ（削除済は編集できない） */}
                {m?.status !== '削除済' && canAct(api, 'saveMaterial', { kind: 'materials' }) && <button type="button" className="save" onClick={() => router.push(`${detailUrl}/edit`)}>編集</button>}
                <button type="button" className="cancel" onClick={() => router.push(LIST)}>一覧へ戻る</button>
              </>
            ) : (
              <>
                <button type="button" className="cancel" onClick={cancel}>キャンセル</button>
                <button type="button" className="save" disabled={busy} onClick={() => void save()}>{mode === 'new' ? '登録' : '保存'}</button>
              </>
            )}
          </div>
        </div>
        <EditingNotice others={editors} className="provbar" />
        {errCount > 0 && <div className="vbox" role="alert"><b>保存できません（{errCount}件）。</b>赤い項目を確認してください。</div>}

        {editing ? (
          <>
            {/* 登録・編集：必須の項目を上にまとめ、任意の項目（規格・写真）は最後のカード（画面設計書 AW_MATE_003 の番号の順） */}
            <div className="card">
              <div className="ch">基本情報</div>
              <div className="cb"><div className="cols">{fId}{fName}{fUnit}{fCourses}{fPublish}</div></div>
            </div>
            <div className="card">
              <div className="ch">価格と取扱倉庫</div>
              <div className="cb"><div className="cols">{fPrice}{fTax}{fWh}</div></div>
            </div>
            <div className="card">
              <div className="ch">任意項目</div>
              <div className="cb"><div className="cols">{fSpec}{fPhoto}</div></div>
            </div>
          </>
        ) : (
          <>
            <div className="card">
              <div className="ch">基本情報</div>
              <div className="cb"><div className="cols">{fId}{fName}{fUnit}{fSpec}{fCourses}{fPublish}{fPhoto}</div></div>
            </div>
            <div className="card">
              <div className="ch">価格と取扱倉庫</div>
              <div className="cb"><div className="cols">{fPrice}{fTax}{fWh}</div></div>
            </div>
          </>
        )}

        {mode === 'detail' && data && (
          <div className="card">
            <div className="ch">使用状況</div>
            <div className="cb">
              <div className="mt-use">
                <div className="u"><i>プラン数（初期備品／月の無料数量）</i><b>{data.use.plans}件</b></div>
                <div className="u"><i>未納品の資材注文数</i><b>{data.use.orders}件</b></div>
                <div className="u"><i>在庫のある倉庫数</i><b>{data.use.warehouses}件</b></div>
              </div>
              <div className="mt-note">{materialInUse(data.use) ? '使用中のため削除できません。新規に選べなくする場合は公開ステータスを「非公開」にしてください。' : '削除できます。'}</div>
            </div>
          </div>
        )}

        {mode !== 'new' && data && (
          <div className="card">
            <div className="ch">変更履歴</div>
            <div className="cb">
              <div className="scroll"><table className="mt-hist">
                <thead><tr><th>日時</th><th>操作した人</th><th>操作</th><th>項目</th><th>変更前</th><th>変更後</th><th>理由</th></tr></thead>
                <tbody>
                  {data.hist.map((h, i) => <tr key={i}><td>{fmtDateTime(h.at)}</td><td>{h.by}</td><td>{h.op}</td><td>{h.items.map((x, j) => <div key={j}>{x.field}</div>)}</td><td>{h.items.map((x, j) => <div key={j}>{x.before}</div>)}</td><td>{h.items.map((x, j) => <div key={j}>{x.after}</div>)}</td><td>{h.reason}</td></tr>)}
                  {!data.hist.length && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--mut)' }}>表示するデータがありません。</td></tr>}
                </tbody>
              </table></div>
            </div>
          </div>
        )}
      </section>
      {modal}
    </div>
  );
}
