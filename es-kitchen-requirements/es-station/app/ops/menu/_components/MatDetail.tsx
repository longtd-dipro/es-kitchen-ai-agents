'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import { isStale } from '@/lib/api/errors';
import { DEMO } from '@/lib/demo';
import { addD, cancelReasonError, clone, DLV_STEPS, DLV_TONE, fromIso, histOf, MAT_MAX, matChecks, matShipChecks, matsFor, toIso, ymdW } from '@/lib/ops/menu/logic';
import type { MatOrder } from '@/lib/ops/menu/types';
import { Area, Badge, Button, Card, Chk, DInp, EmptyState, Field, FieldError, Head, InlineMessage, Inp, Modal, Ro, SaveErrorBar, SectionTitle, Sel, Stepper, Table, Td, TLink } from './es';
import { Ask } from './menuEdit';
import { useDirty, useMenu } from './MenuProvider';
import { api, Loading, NotFound, Thumb, useMaster } from './parts';
import { photo } from './photo';
import { useCanAct } from '../../_ui/perm';
import { today } from '@/lib/supplier/dates';
import { fmtDate } from '@/lib/format/date';
import { yen } from '@/lib/format/money';

type Draft = Pick<MatOrder, 'site' | 'q'> & Partial<MatOrder>;
/** 同時更新（E31）：save＝ほかの人が先に保存（上書きできる）／lock＝出荷指示に拾い上げられた（数・日付は直せない・取り消せない）／cancel＝取消の前に内容が変わった */
type Stale = null | { kind: 'save' | 'lock' | 'cancel' };

/**
 * 資材注文 詳細・編集・新規登録（台帳 H「資材の注文」・受付簿 #154・#260〜#262・#277）。
 *   詳細＝表示だけ（保存ボタンなし）。編集＝取消でなければ開く：出荷待のときは数・納品予定日も、出荷指示のあとは 発送日・送り状番号だけ。
 *   発送日・送り状番号を入れられるのはシステム管理だけ。取消済みは参照のみ（編集・取消を出さない）。リードタイム＝契約の配送区分（資材）の値
 */
export default function MatDetail({ no, mode }: { no?: string; mode: 'view' | 'edit' | 'new' }) {
  const { toast, toastError, leave, nav } = useMenu();
  const router = useRouter();
  const mm = useMaster();
  const canAct = useCanAct();
  const { data: x0q, reload } = useQuery(api, 'mat', { no: no ?? '' });
  const isNew = mode === 'new', edit = mode !== 'view';
  const x0 = isNew ? null : x0q;
  const [draft, setDraft] = useState<Draft | null>(isNew ? { site: '', q: {}, memo: '' } : null);
  /* 開いたときの版（同時更新の検知 E31）。あとで画面のデータが読み直されても、開いたときの版で保存する */
  const [baseVer, setBaseVer] = useState('');
  const [ship, setShip] = useState<{ shippedOn: string; trackingNo: string } | null>(null);
  /* お客様へ知らせる（初期値はチェックなし＝知らせない：受付簿 #282 ②。登録・編集の保存のどちらも） */
  const [notify, setNotify] = useState(false);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cancel, setCancel] = useState<{ reason: string; tried?: boolean } | null>(null);
  const [q205, setQ205] = useState(false);
  const [w119, setW119] = useState(false);
  const [siteTo, setSiteTo] = useState<string | null>(null);
  const [stale, setStale] = useState<Stale>(null);
  useEffect(() => { if (x0) { setShip((s) => s ?? { shippedOn: x0.shippedOn ?? '', trackingNo: x0.trackingNo ?? '' }); setBaseVer((v) => v || x0.ver || ''); } }, [x0]);
  useEffect(() => {
    if (isNew || !x0) return;
    /* 取消済みは参照のみ：編集の URL を開いたら、理由を伝えて詳細へ戻す（受付簿 #277） */
    if (mode === 'edit' && x0.st === '取消') { toast('取り消した資材注文は編集できません（参照のみ）。', 'negative'); router.replace(`/ops/menu/materials/${x0.no}`); return; }
    setDraft((d) => (mode === 'edit' ? d ?? clone(x0) : null));
  }, [x0, mode, isNew, router, toast]);
  const siteId = isNew ? draft?.site ?? '' : x0?.site ?? '';
  /* リードタイム・納品予定日の初期値・何回目・お試しか・追加配送料・納品予定日の警告（サーバーが決める） */
  const { data: pre } = useQuery(api, 'matPre', { site: siteId, ...(edit && !isNew && draft?.due ? { due: draft.due } : {}), ...(no ? { no } : {}) });
  const shipDirty = !!(ship && x0 && (ship.shippedOn !== (x0.shippedOn ?? '') || ship.trackingNo !== (x0.trackingNo ?? '')));
  useDirty(!!(edit && draft && (isNew ? !!draft.site : x0 && (JSON.stringify(draft) !== JSON.stringify(x0) || shipDirty))));

  if (!mm || (!isNew && x0 === undefined)) return <Loading />;
  if (!isNew && x0 === null) return <NotFound what="資材注文" />;
  if (edit && !draft) return <Loading />;
  const { M, C } = mm;
  const x = (edit ? draft : x0) as Draft;
  const s = x.site ? C.site(x.site) : null;
  const upd = (p: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...p } : d));
  const mats = s ? matsFor(M.materials, s) : [];
  const lines = edit ? mats : Object.keys(x.q).map((id) => M.materials.find((m) => m.id === id)!);
  const tot = Object.keys(x.q).reduce((a, k) => a + (x.q[k] || 0), 0), n = Object.keys(x.q).filter((k) => x.q[k] > 0).length;
  const stI = x0 ? (x0.st === '取消' ? -1 : DLV_STEPS.indexOf(x0.st)) : 0;
  const view = x0 ? `/ops/menu/materials/${x0.no}` : '/ops/menu/materials';
  const cancelled = x0?.st === '取消';
  /* 編集：出荷待のときだけ 数・納品予定日。発送日・送り状番号はシステム管理だけ（UI は無効・サーバーも 403） */
  const full = isNew || x0?.st === '出荷待';
  const canShip = canAct(api, 'saveMat', { ship: true });
  const lead = (isNew ? pre?.lead : x0?.lead ?? pre?.lead) ?? 2;
  const dueNow = isNew ? pre?.def : x.due;
  const nth = pre?.nth ?? 1, trial = !!pre?.trial, feeYen = pre?.fee ?? 0;
  const extra = !!s && nth >= 2 && !trial;

  /* 保存の前のチェック（台帳 E「保存エラーの出し方」：項目の下に文言・見出しの下に1行） */
  const ce = full ? matChecks({ site: x.site, q: x.q }) : {};
  const shipE = canShip && ship && x0 ? matShipChecks(ship.shippedOn, ship.trackingNo, x0.at) : {};
  const errs = { site: isNew ? ce.site : undefined, q: !isNew || x.site ? ce.q : undefined, due: edit && !isNew && full && !x.due ? '納品予定日は必須項目です。' : undefined, shippedOn: shipE.shippedOn, trackingNo: shipE.trackingNo };
  const nErr = Object.values(errs).filter(Boolean).length;
  const show = tried && edit;

  async function doSave(force = false) {
    setBusy(true);
    try {
      if (isNew) {
        const nno = await api.action('createMat', { site: x.site, q: x.q, ...(notify ? { notify: true } : {}) });
        setDraft(null);
        toast('資材注文を登録しました。配送データ（資材便）を作りました。');
        router.push(`/ops/menu/materials/${nno}`);
      } else {
        await api.action('saveMat', { mat: x as MatOrder, baseVersion: baseVer, ...(force ? { force: true } : {}), ...(notify ? { notify: true } : {}), ...(canShip && shipDirty && ship ? { ship } : {}) });
        setStale(null);
        toast('保存しました。');
        router.push(view);
      }
    } catch (e) {
      /* ほかの人が先に保存していた・出荷指示に拾い上げられた（E31）。拾い上げられたあとは数・日付を直せないので「上書き」は出さない */
      if (isStale(e)) { setStale({ kind: e instanceof Error && e.message.includes('出荷指示') ? 'lock' : 'save' }); reload(); return; }
      toastError(e);
    } finally { setBusy(false); }
  }
  /** 「登録」「保存」：チェック → 2回目以降の確認（Q205）／納品予定日の警告（W119）→ 保存 */
  function submit() {
    if (nErr) { setTried(true); window.scrollTo(0, 0); return; }
    if (isNew && extra) { setQ205(true); return; }
    if (!isNew && full && x0 && x.due !== x0.due && pre?.warn.length) { setW119(true); return; }
    void doSave();
  }
  function pickSite(id: string) {
    const go = () => { setTried(false); upd({ site: id, q: {} }); };
    if (isNew && Object.values(x.q).some((v) => v > 0)) setSiteTo(id); else go();
  }
  async function doCancel() {
    if (!x0 || !cancel) return;
    if (cancelReasonError(cancel.reason)) { setCancel({ ...cancel, tried: true }); return; }
    try {
      await api.action('cancelMat', { no: x0.no, reason: cancel.reason, baseVersion: baseVer });
      setCancel(null);
      toast('資材注文と配送データを取り消しました。');
    } catch (e) {
      if (isStale(e)) { setCancel(null); setBaseVer(''); setStale({ kind: e instanceof Error && e.message.includes('出荷指示') ? 'lock' : 'cancel' }); reload(); return; }
      toastError(e);
    }
  }

  const acts = isNew ? <>
    {s && s.id ? <span className={'mo-count' + (extra ? ' is-warn' : '')} role="status">{extra ? `今月 ${nth}回目の資材注文です。資材の追加配送の料金（${yen(feeYen)}・税抜）がかかります。` : trial ? 'お試しの拠点のため、資材の追加配送の料金はかかりません。' : `今月 ${nth}回目の資材注文です。料金に含みます。`}</span> : null}
    <Button variant="outline" size="lg" onClick={() => leave(() => nav('/ops/menu/materials'))}>キャンセル</Button>
    {canAct(api, 'createMat') ? <Button size="lg" disabled={busy} onClick={submit}>登録</Button> : null}
  </>
    : edit ? <><Button variant="outline" size="lg" onClick={() => leave(() => router.push(view))}>キャンセル</Button>{full || canShip ? <Button size="lg" disabled={busy} onClick={submit}>保存</Button> : null}</>
      /* 権限がなければ出さない。取消済みは参照のみ（編集・取消を出さない）。取消は出荷待だけ、編集は取消以外 */
      : cancelled ? null : <>{x0!.st === '出荷待' && canAct(api, 'cancelMat') && <Button variant="outline" tone="negative" size="lg" onClick={() => setCancel({ reason: '' })}>取消</Button>}{canAct(api, 'saveMat') && <Button size="lg" icon="PencilSimple" onClick={() => router.push(view + '/edit')}>編集</Button>}</>;
  const title = isNew ? '資材注文 新規登録' : <>{'資材注文' + (edit ? '編集' : '詳細') + ' '}<span className="es-mono">{x.no}</span>{' '}<Badge tone={DLV_TONE[x.st!]}>{x.st}</Badge></>;
  const dueTxt = (d: string) => ymdW(d);
  const shipTxt = dueNow ? dueTxt(addD(dueNow, -lead)) + '（リードタイム ' + lead + '日）' : '—';
  const feeLine = x0 ? (x0.kind === '初期セット' ? '無料（初期セット）'
    : (x0.nth ?? 0) >= 2 ? (x0.trial ? `お試しの拠点のため追加配送料なし（今月 ${x0.nth}回目）` : `資材の追加配送（OP000036）${yen(x0.fee ?? 0)}（税抜）・今月 ${x0.nth}回目`)
      : '料金に含む（今月 1回目）') : '';

  return (
    <>
      <Head crumb={['メニュー管理', ['資材注文管理', () => nav('/ops/menu/materials')], isNew ? '新規登録' : '資材注文詳細']} title={title} actions={acts} />
      {show ? <SaveErrorBar n={nErr} /> : null}
      {!isNew ? (
        <ol className="mo-steps mo-steps--s">
          {DLV_STEPS.map((l, i) => <li key={l} className={stI < 0 ? 'x' : i < stI ? 'done' : i === stI ? 'cur' : ''}><i>{stI >= 0 && i < stI ? '✓' : i + 1}</i>{l}</li>)}
          {stI < 0 ? <li className="cur neg"><i>×</i>取消</li> : null}
        </ol>
      ) : null}
      {edit && !isNew && !full ? <InlineMessage tone="info" title="出荷指示を送ったあとです">出荷指示を送ったあとは、数・納品予定日は直せません。直せるのは発送日・送り状番号だけです。</InlineMessage> : null}
      {edit && !isNew && !canShip ? <InlineMessage tone="info" title="発送日・送り状番号はシステム管理だけが入れられます">{full ? '数・納品予定日は直せますが、' : ''}発送日・送り状番号の入力欄は読み取りです。</InlineMessage> : null}
      <Card>
        <SectionTitle>オーダー基本情報</SectionTitle>
        {isNew ? (
          <div className="od-g4">
            <Field label="拠点" required className="mo-span2" error={show ? errs.site : undefined}>
              <Sel value={x.site} onChange={(e) => pickSite(e.target.value)}
                options={[{ value: '', label: '選択してください' }, ...M.sites.filter((y) => !y.paused && !y.ended).map((y) => ({ value: y.id, label: y.corpName + ' ' + y.short + '（' + y.id + '）' }))]} />
            </Field>
            <Ro label="注文区分" v="通常注文（ES が代理で登録）" />
            <Ro label="注文日" v={today()} />
            <Ro label="納品予定日" v={s && pre ? dueTxt(pre.def) + '（自動）' : '拠点を選ぶと決まります'} />
          </div>
        ) : (
          <div className="od-g4">
            <Ro label="資材注文No" v={<span className="es-mono">{x.no}</span>} />
            <Ro label="注文区分" v={x.kind} />
            <Ro label="法人名" v={s!.corpName} />
            <Ro label="法人ID" v={<span className="es-mono">{s!.corp}</span>} />
            <Ro label="拠点名" v={s!.short} />
            <Ro label="拠点ID" v={<span className="es-mono">{s!.id}</span>} />
            <Ro label="納品先住所" v={s!.addr} cls="mo-span2" />
            <Ro label="注文日時" v={x.at} />
            <Ro label="注文者" v={x.by} />
            {edit && full
              ? <Field label="納品予定日" required error={show ? errs.due : undefined} helper="初期値は「注文日の翌日以降で、リードタイムを守れる最初の納品可能日」。選べない日は確認のうえ保存できます"><DInp value={toIso(x.due!)} aria-label="納品予定日" onChange={(e) => upd({ due: fromIso(e.target.value) })} /></Field>
              : <Ro label="納品予定日" v={dueTxt(x.due!)} />}
            <Ro label="出荷予定日" v={shipTxt} />
            <Ro label="ピッキング倉庫" v={s!.wh} />
            <Ro label="配送会社" v="ヤマト運輸（資材便・直送）" />
            <Ro label="料金（税抜）" v={feeLine} />
          </div>
        )}
      </Card>
      <Card>
        <SectionTitle action={<span className="mo-sum">{'Σ ' + n + '種類・合計 ' + tot}</span>}>注文資材明細</SectionTitle>
        {!s ? <EmptyState title="拠点を選んでください" compact>拠点のコースで使う資材が出ます。</EmptyState> : (
          <Table cls="mat-tbl" cols={[{ label: 'No', w: 48 }, { label: '写真', w: 60 }, { label: '資材ID' }, { label: '資材名' }, { label: '規格' }, { label: '使うコース' }, { label: '単位' }, { label: '注文数', cls: edit ? 'c' : 'r' }]}
            rows={lines.map((m, i) => (
              <tr key={m.id}>
                <Td v={i + 1} /><td><Thumb src={m.src || photo('資材', m.img)} /></td><Td v={m.id} cls="es-mono" /><Td v={m.name} /><Td v={m.spec} /><Td v={m.course} cls="mo-sm" /><Td v={m.unit} />
                <td className={edit ? 'c' : 'r'}>{edit ? <Stepper value={x.q[m.id] || 0} label={m.name} disabled={!full} max={MAT_MAX} onChange={(v) => { setTried(false); const q = { ...x.q }; if (v) q[m.id] = v; else delete q[m.id]; upd({ q }); }} /> : x.q[m.id] + m.unit}</td>
              </tr>
            ))} />
        )}
        {show && errs.q ? <FieldError>{errs.q}</FieldError> : null}
      </Card>
      {!isNew ? (
        <Card>
          <SectionTitle>配送データ（資材便）</SectionTitle>
          <div className="od-g4">
            <Ro label="配送データID" v={x.st === '取消' ? x.dlId + '（取消）' : <span className="es-mono">{x.dlId}</span>} />
            <Ro label="配送状態" v={x.st} />
            <Ro label="出荷指示（THOMAS）" v={x.sent ? '送信済み ' + x.sent : x.st === '取消' ? '—' : '未送信（出荷日の前日に日次の拾い上げで送る）'} />
            <Ro label="送り状番号" v={x.inv ? <span><span className="es-mono">{x.inv}</span>{' '}<TLink onClick={() => toast(DEMO ? 'ヤマトの追跡ページを開きます（デモ）' : 'ヤマトの追跡ページを開きます')}>配送状況を調べる</TLink></span> : '—'} />
          </div>
          <p className="mo-note">出荷指示・送り状の出力と取込は「配送管理 ＞ 出荷・配送管理 ＞ 出荷指示・取込」で行います。同じ拠点・同じ納品日で出荷指示前の資材便があれば、1件にまとめます。</p>
          {/* 受付簿 No.154・#277：発送日・送り状番号はシステム管理が編集の画面で入れる。詳細は表示だけ。法人Web の注文履歴に出し、お届け予定日は 発送日＋リードタイム */}
          {x0 && !cancelled && ship ? (
            <div className="mo-ship">
              <SectionTitle>発送日・送り状番号（法人Web の注文履歴に出す）</SectionTitle>
              {edit ? (
                <div className="od-g4 mo-ship__g">
                  <Field label="発送日" error={show ? errs.shippedOn : undefined} helper="資材便を発送した日。注文日以降"><DInp value={toIso(ship.shippedOn)} disabled={!canShip} aria-label="発送日" onChange={(e) => { setTried(false); setShip({ ...ship, shippedOn: e.target.value }); }} /></Field>
                  <Field label="送り状番号" error={show ? errs.trackingNo : undefined} helper="ヤマトの送り状番号（半角の数字・ハイフン）"><Inp value={ship.trackingNo} disabled={!canShip} placeholder="例：4471-8820-0790" aria-label="送り状番号" onChange={(e) => { setTried(false); setShip({ ...ship, trackingNo: e.target.value }); }} /></Field>
                  <Ro label="お届け予定日（法人Web）" v={ship.shippedOn && !shipE.shippedOn ? dueTxt(addD(ship.shippedOn.replace(/-/g, '/'), lead)) + '（発送日 ＋ リードタイム ' + lead + '日）' : '発送日を入れると、発送日＋リードタイムで出します'} />
                </div>
              ) : (
                <div className="od-g4">
                  <Ro label="発送日" v={x0.shippedOn ? fmtDate(x0.shippedOn) : ''} />
                  <Ro label="送り状番号" v={x0.trackingNo ? <span className="es-mono">{x0.trackingNo}</span> : ''} />
                  <Ro label="お届け予定日（法人Web）" v={x0.shippedOn ? dueTxt(addD(x0.shippedOn.replace(/-/g, '/'), lead)) + '（発送日 ＋ リードタイム ' + lead + '日）' : '発送日を入れると、発送日＋リードタイムで出します'} />
                </div>
              )}
            </div>
          ) : null}
        </Card>
      ) : null}
      {edit && (isNew ? canAct(api, 'createMat') : canAct(api, 'saveMat')) ? (
        <Card>
          <div className="mo-notify"><Chk label="お客様へ知らせる" checked={notify} onChange={setNotify} /></div>
          <p className="mo-note">{isNew ? '登録と同時に、法人・拠点へ「資材注文を ES が登録しました」と知らせます。チェックしないと、知らせずに登録します。' : '保存と同時に、法人・拠点へ「資材注文が変わりました」と知らせます。チェックしないと、知らせずに保存します。'}</p>
        </Card>
      ) : null}
      {!isNew ? (
        <Card>
          <SectionTitle>変更履歴</SectionTitle>
          <Table cols={[{ label: '変更日時', w: 150 }, { label: '変更内容' }, { label: '変更者' }]} cls="od-log"
            rows={(x.log || []).concat(histOf(x0 ?? null)).map((r, i) => <tr key={i}><Td v={r[0]} cls="es-num" /><td className="w">{r[1]}</td><Td v={r[2]} /></tr>)} />
        </Card>
      ) : null}
      {cancel ? (
        <Modal tone="negative" title="資材注文を取り消しますか？" confirmLabel="取り消す" onCancel={() => setCancel(null)} onClose={() => setCancel(null)} onConfirm={doCancel}>
          <div className="mo-modalb">
            <p>配送データ（資材便）も取消になります。出荷指示を送る前だけ取り消せます。</p>
            <Field label="取消の理由" required error={cancel.tried ? cancelReasonError(cancel.reason) || undefined : undefined}>
              <Area value={cancel.reason} rows={3} placeholder="例：法人からの依頼" aria-label="取消の理由" onChange={(e) => setCancel({ reason: e.target.value })} />
            </Field>
          </div>
        </Modal>
      ) : null}
      {q205 ? (
        <Modal tone="warning" title="資材を注文しますか？" confirmLabel="注文する" onCancel={() => setQ205(false)} onClose={() => setQ205(false)} onConfirm={() => { setQ205(false); void doSave(); }}>
          {'同じサイクル月の2回目以降の注文のため、資材の追加配送の料金（' + yen(feeYen) + '・税抜）がかかります。'}
        </Modal>
      ) : null}
      {w119 ? (
        <Modal tone="warning" title="納品予定日を確認してください" confirmLabel="このまま保存" onCancel={() => setW119(false)} onClose={() => setW119(false)} onConfirm={() => { setW119(false); void doSave(); }}>
          {'納品予定日が休日・お届けできない曜日・リードタイム未満です。このまま保存しますか？'}
        </Modal>
      ) : null}
      {siteTo !== null ? (
        <Modal tone="warning" title="拠点を変更しますか？" confirmLabel="変更する" onCancel={() => setSiteTo(null)} onClose={() => setSiteTo(null)} onConfirm={() => { const id = siteTo; setSiteTo(null); setTried(false); upd({ site: id, q: {} }); }}>
          拠点を変えると、入力した注文数が消えます。<br />変えてもよろしいですか？
        </Modal>
      ) : null}
      {stale ? (
        <Ask mark="!" title="内容が更新されています" onClose={() => setStale(null)}
          buttons={stale.kind === 'save'
            ? <><Button variant="outline" size="lg" block onClick={() => setStale(null)}>キャンセル</Button><Button size="lg" block disabled={busy} onClick={() => { void doSave(true); }}>上書きして保存</Button></>
            : <Button size="lg" block onClick={() => { setStale(null); setBaseVer(''); reload(); router.push(view); }}>{stale.kind === 'lock' ? '最新の内容を開く' : '閉じる'}</Button>}>
          <p>他のユーザーにより内容が更新されています。{stale.kind === 'save' ? '上書きすると保存されます。' : stale.kind === 'lock' ? '出荷指示を送ったあとは、数・納品予定日を直すことも取り消すこともできません（取り消せるのは出荷指示を送る前だけです）。' : '内容を確かめてから、もう一度取り消してください。'}</p>
        </Ask>
      ) : null}
    </>
  );
}
