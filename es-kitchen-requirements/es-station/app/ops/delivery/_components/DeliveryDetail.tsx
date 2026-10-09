'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { checkDeliveryEdit, type Errors } from '@/lib/ops/delivery/logic';
import { RESULT_SAMPLE } from '@/lib/ops/delivery/seed';
import type { DeliveryDetail as Rec } from '@/lib/ops/delivery/types';
import { LEAVE_MSG, useLeaveGuard } from '../../_ui/leaveGuard';
import { useOps } from '../../_ui/OpsProvider';
import { useCanAct, useScreenCan } from '../../_ui/perm';
import { ConfirmModal } from '../../_ui/ui';
import { api } from './api';
import { CancelModal, CrProcessModal, DuplicateModal, TroubleReportModal, TroubleResolveModal } from './DetailModals';
import {
  Badge, Button, Card, CheckList, EmptyState, EsIcon, Field, FileCard, InlineMessage, LinkButton, PageHead, Radio, SectionTitle, Select, Tabs, TextField, Timeline,
} from './kit';
import { fmtDate, fmtDateTime, fmtDatesIn } from '@/lib/format/date';
import TrackingNo from '@/components/TrackingNo';

/*
 * 出荷・配送データ詳細／編集（部品 16 の DeliveryDetail。rec＝pending・done・trouble・child・plan、mode＝view・edit）。
 * タブ：配送概要・配送ルート・実績・トラブル（出荷後だけ）・添付資料・変更履歴。
 */

type Tab = 'ov' | 'route' | 'res' | 'trb' | 'doc' | 'hist';
type Modal = null | 'cancel' | 'dup' | 'dupAlt' | 'report' | 'resolve' | 'cr';
const HIST_KINDS: Record<string, RegExp> = { '申請・承認': /申請|承認|否認/, '日付・数量': /納品日|数量|日付|締切/, 'ルート・担当': /スタッフ|ルート|配送会社|住所/, '状態': /状態/, 'トラブル': /トラブル/, '出荷指示': /出荷指示/ };
/** 地点の名前から開くマスタ（倉庫・中継先は倉庫マスタ、拠点は拠点・契約） */
const pointHref = (id: string) => (/^WH|^HU/.test(id) ? '/ops/masters/warehouses' : /^CU/.test(id) ? '/ops/contracts' : '');

export default function DeliveryDetail({ id, mode }: { id: string; mode: 'view' | 'edit' }) {
  const { data: r, loading } = useQuery(api, 'delivery', { id });
  if (loading) return null;
  if (!r) {
    return (
      <>
        <PageHead crumbs={['配送管理', '出荷・配送管理', '出荷・配送データ詳細']} links={{ 1: '/ops/delivery/list' }} title="出荷・配送データ詳細" />
        <Card><EmptyState title={`配送データ ${id} が見つかりません`}><Link href="/ops/delivery/list">出荷・配送管理へ戻る ›</Link></EmptyState></Card>
      </>
    );
  }
  return <Detail key={r.id + mode} r={r} mode={mode} />;
}

function Detail({ r, mode }: { r: Rec; mode: 'view' | 'edit' }) {
  const sp = useSearchParams(), router = useRouter();
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct(), screenCan = useScreenCan();
  const edit = mode === 'edit', view = !edit;
  const preShip = ['予定', '出荷待'].includes(r.st);
  /* 権限がなければ出さない */
  const canReport = r.canReport && !preShip && canAct(api, 'reportTrouble');
  const canResolve = canAct(api, 'resolveTrouble');
  const [tab, setTab] = useState<Tab>(() => { const t = sp.get('tab') as Tab | null; return t && !(t === 'trb' && preShip) ? t : 'ov'; });
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);

  /* 編集 */
  const [f0] = useState({ alt: 'cur', time: r.time, carrier2: r.carrier2, staff: r.staff, addr: r.addr, reason: '' });
  const [f, setF] = useState(f0);
  const [err, setErr] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const { data: dateAlt } = useQuery(api, 'dateAlt', { id: r.id });
  /* 入力中に画面を離れるときの確認（Q02・全サイト共通）：編集で変えて保存していないとき（キャンセル・サイドメニュー・ブラウザを閉じる） */
  const dirty = edit && !saved && JSON.stringify(f) !== JSON.stringify(f0);
  useLeaveGuard(dirty);
  const cancel = () => {
    const go = () => router.push(`/ops/delivery/list/${r.id}`);
    if (!dirty) { go(); return; }
    openModal(<ConfirmModal kind="warn" title={LEAVE_MSG.title} text={LEAVE_MSG.text} ok={LEAVE_MSG.ok} okCls="warn-solid" cancel={LEAVE_MSG.cancel} onOk={go} />);
  };
  const save = async () => {
    const e = checkDeliveryEdit(f);
    setErr(e);
    if (Object.keys(e).length) return;
    try {
      await api.action('saveDelivery', { id: r.id, ...f });
      setSaved(true);
      toast('配送データを保存しました（日付を変えたときは出荷日も一緒に動き、変更履歴に残ります）');
      router.push(`/ops/delivery/list/${r.id}`);
    } catch (x) { toastError(x); }
  };

  const tabs = [
    { value: 'ov' as Tab, label: '配送概要' }, { value: 'route' as Tab, label: '配送ルート' }, { value: 'res' as Tab, label: '実績' },
    ...(preShip ? [] : [{ value: 'trb' as Tab, label: r.trbOpen ? `トラブル（${r.trbCount}）` : 'トラブル' }]),
    { value: 'doc' as Tab, label: '添付資料' }, { value: 'hist' as Tab, label: '変更履歴' },
  ];
  const title = edit ? '出荷・配送データ編集' : '出荷・配送データ詳細';

  return (
    <>
      <PageHead
        crumbs={['配送管理', '出荷・配送管理', title]} links={{ 1: '/ops/delivery/list' }}
        title={<>{title} <span className="es-mono">{r.id}</span></>}
        stat={<>
          <span>{r.site} ・ {r.temp}</span>
          <span className="k">状態</span><Badge tone={r.stTone}>{r.st}</Badge>
          <span className="k">段階</span><Badge tone="neutral">{r.stage}</Badge>
          {r.trbOpen && <><span className="k">トラブル</span><Badge tone="negative">未解決 {r.trbCount}件</Badge></>}
          {r.crOpen && <><span className="k">変更申請</span><Badge tone="warning">申請中 {r.crOpenId}</Badge></>}
          {r.isChild && r.parent && <><span className="k">親</span><Link className="es-mono" href={`/ops/delivery/list/${r.parent}?tab=trb`}>{r.parent}</Link></>}
        </>}
        actions={view ? <>
          {r.canCancel && canAct(api, 'cancelDelivery') && <Button variant="outline" tone="negative" onClick={() => setModal('cancel')}>取消</Button>}
          {r.canDup && canAct(api, 'duplicateDelivery') && <Button variant="outline" onClick={() => setModal('dup')}>複製</Button>}
          {canReport && <Button variant="outline" onClick={() => setModal('report')}>トラブルを代理登録</Button>}
          {r.trbOpen && canResolve && <Button onClick={() => setModal('resolve')}>対応を決める</Button>}
          {r.canEdit && screenCan('update') && <LinkButton href={`/ops/delivery/list/${r.id}/edit`} icon="PencilSimple">編集</LinkButton>}
        </> : <>
          <Button variant="outline" onClick={cancel}>キャンセル</Button>
          <Button onClick={save}>保存</Button>
        </>}
      />
      {DEMO && r.isSample && <InlineMessage tone="info">この配送データの詳細はデモでは見本（{r.sampleId}）の中身を表示しています（配送No・拠点・日付・状態は押した行の値）</InlineMessage>}
      {r.locked && (
        <InlineMessage tone="warning" title={`オーダー締切（${fmtDate(r.deadline)}）の後です`}>
          日付は{edit ? '下の「日付の変更」で' : '「編集」から'}、出荷日の前日 {r.dateLimit} まで・同じサイクルの同じ前半／後半の日にだけ変えられます（1件ずつ・理由必須）。ピッキング倉庫を変える場合は、取消して複製で作り直してください。配送会社・配送スタッフ・納品先の住所は、出荷指示を再送して変更できます。
        </InlineMessage>
      )}
      {r.trbOpen && (
        <InlineMessage tone="negative" title={`未解決のトラブル報告が ${r.trbCount}件あります`}>
          配送データの状態は{r.st}のままです。「対応を決める」で、この配送のトラブルをまとめて解決してください。{r.autoChild && <>不在の報告と同時に、送り直し用の子 <span className="es-mono">{r.autoChild}</span>（確認中）を作成済みです。</>}
        </InlineMessage>
      )}
      {r.isChild && r.st === '確認中' && (
        <InlineMessage tone="info" title="確認中の子です（トラブルの自動子）">
          親 {r.parent} の不在の報告と同時に作られました。日付と数量は仮で、確定するまで出荷指示・送り状・割当・請求の対象外です。親のトラブルを解決してから、下の「確定」で出荷待にします。
        </InlineMessage>
      )}

      <Card>
        <Tabs items={tabs} value={tab} onChange={setTab} />
        {tab === 'ov' && <Overview r={r} edit={edit} f={f} setF={setF} err={err} dateAlt={dateAlt ?? []} openCr={() => setModal('cr')} />}
        {tab === 'route' && <Route r={r} toDocs={() => setTab('doc')} />}
        {tab === 'res' && <Result r={r} />}
        {tab === 'trb' && <TroubleTab r={r} canReport={canReport} canResolve={canResolve} report={() => setModal('report')} resolve={() => setModal('resolve')} />}
        {tab === 'doc' && <Docs r={r} />}
        {tab === 'hist' && <History r={r} />}
      </Card>

      {modal === 'cancel' && <CancelModal r={r} onClose={close} onAlt={() => setModal(canAct(api, 'duplicateDelivery') ? 'dupAlt' : null)} />}
      {modal === 'dup' && <DuplicateModal r={r} onClose={close} />}
      {modal === 'dupAlt' && <DuplicateModal r={r} onClose={close} initial="alternative" />}
      {modal === 'report' && <TroubleReportModal r={r} onClose={close} />}
      {modal === 'resolve' && <TroubleResolveModal r={r} onClose={close} />}
      {modal === 'cr' && <CrProcessModal r={r} onClose={close} />}
    </>
  );
}

type EditForm = { alt: string; time: string; carrier2: string; staff: string; addr: string; reason: string };
type AltRow = { v: string; d: string; dc: string; s: string; sc: string; lt: string; n: string; dC: string; sC: string; nC: string; dis: boolean };

function Overview({ r, edit, f, setF, err, dateAlt, openCr }: { r: Rec; edit: boolean; f: EditForm; setF: (f: EditForm) => void; err: Errors; dateAlt: AltRow[]; openCr: () => void }) {
  const { toast, toastError } = useOps();
  const canAct = useCanAct();
  const [memo, setMemo] = useState('');
  const [memoErr, setMemoErr] = useState('');
  const [childDate, setChildDate] = useState('');
  const { data: parent } = useQuery(api, 'delivery', { id: r.parent ?? '' });
  const parentOpen = !!r.parent && !!parent?.trbOpen;
  const addMemo = async () => {
    if (!memo.trim()) { setMemoErr('メモを入力してください'); return; }
    try { await api.action('addMemo', { id: r.id, text: memo }); setMemo(''); setMemoErr(''); toast('メモを追加しました'); } catch (x) { toastError(x); }
  };
  const confirmChild = async () => {
    if (!childDate) { toastError(new Error('納品日を入力してください')); return; }
    try { await api.action('confirmChild', { id: r.id, date: childDate }); toast('子を確定して出荷待にしました'); } catch (x) { toastError(x); }
  };
  const crPast = r.crs.filter((c) => c.st !== '申請中');
  return (
    <>
      {r.crOpen && r.crOpenView && (
        /* 変更申請の帯：中身は共通データの変更申請から（受付簿 No.47） */
        <section className="crb" aria-label="配送予定日の変更申請">
          <div className="crb__h">
            <EsIcon name="ClockCountdown" size={22} />
            <h3>配送予定日の変更申請 <span className="es-mono">{r.crOpenId}</span></h3>
            <Badge tone="warning">申請中</Badge>
            <Badge tone="neutral">システム判定：{r.crOpenView.judge}</Badge>
            <span className="crb__meta">処理期限 <b>{r.crOpenView.close}</b></span>
          </div>
          <div className="crb__dates">
            <div className="crb__box"><small>現在の納品日</small><b>{r.crOpenView.cur}</b><span>{r.crOpenView.curPick}</span></div>
            {r.crOpenView.wishes.length > 0 && <div className="crb__arrow"><EsIcon name="CaretRight" /></div>}
            {r.crOpenView.wishes.map((w, i) => (
              <div key={i} className={`crb__box${i === 0 ? ' is-new' : ''}`}><small>{w.label}</small><b>{w.date}</b><span>{w.pick} ・ {w.note}</span></div>
            ))}
          </div>
          <div className="crb__row"><span className="k">申請理由</span><span style={{ flex: 1, minWidth: 0 }}>{r.crOpenView.why}</span><span className="crb__meta">申請者：<b>{r.crOpenView.who}</b> ・ 申請日時 {fmtDateTime(r.crOpenView.at)}</span></div>
          <div className="crb__f">
            <span className="note">{r.crOpenView.also}希望日・別日（リードタイム・出荷不可・件数）は、確認の画面で選びます。</span>
            {canAct(api, 'processChangeRequest') && <>
              <Button variant="outline" tone="negative" onClick={openCr}>否認する</Button>
              <Button variant="outline" onClick={openCr}>代替日を提案する</Button>
              <Button onClick={openCr}>承認する</Button>
            </>}
          </div>
        </section>
      )}
      <SectionTitle>配送概要</SectionTitle>
      <div className="es-formgrid">
        <TextField label="配送No" value={r.id} readOnly helper="作ったときの出荷予定日で付けた番号（日付を変えても変わらない）" />
        <TextField label="出荷日（実績）" value={r.shipped} readOnly />
        <TextField label="荷物名" value={r.pkg} readOnly />
        <TextField label="対象サイクル・納品スロット" value={r.cycle} readOnly />
        <TextField label="納品日" value={r.dlv} readOnly disabled={edit} helper={edit ? '下の「日付の変更」で選びます（出荷日の前日まで）' : ''} />
        <TextField label="出荷日（ピッキング日）" value={r.pick} readOnly disabled={edit} helper={r.leadHelper} />
        <TextField label="配達時間帯" value={edit ? f.time : r.time} readOnly={!edit} onChange={(time) => setF({ ...f, time })} />
        <TextField label="配送区分" value={r.temp} readOnly />
        <TextField label="便種別" value={r.svc} readOnly />
        <TextField label="出荷指示" value={r.so} readOnly helper={r.soHelper} />
        <Field label="契約ID"><div className="es-input es-input--md es-input--readonly"><Link className="es-mono" href="/ops/contracts">{r.cp}</Link></div></Field>
        <Field label="子契約ID"><div className="es-input es-input--md es-input--readonly"><Link className="es-mono" href="/ops/contracts">{r.child}</Link></div></Field>
        {r.kindLabel === 'オーダーID'
          ? <Field label={r.kindLabel} helper={r.kindHelper}><div className="es-input es-input--md es-input--readonly"><Link className="es-mono" href="/ops/menu/orders">{r.kind}</Link></div></Field>
          : <TextField label={r.kindLabel} value={r.kind} readOnly helper={r.kindHelper} />}
      </div>
      {edit && (
        <>
          {r.canDateChange && (
            <>
              <SectionTitle>日付の変更（オーダー締切後）</SectionTitle>
              <div className="note">出荷日の前日（{r.dateLimit}）まで、同じサイクルの同じ前半（A・B週：10/12〜10/25）の日にだけ変えられます。出荷日は契約のリードタイム（1日）を保って一緒に動きます。赤字＝出荷不可・納品不可・件数の上限（300件）超え。出荷不可・納品不可の日は選べません。同じ拠点・同じ納品日の冷凍・冷蔵があれば一緒に動きます。出荷指示を送信済みのときは新しい版で再送します。</div>
              <div className="es-table-wrap">
                <table className="es-table compact">
                  <thead><tr><th style={{ width: '3.428571rem' }}></th><th>納品日</th><th>納品日の枠（10月サイクル）</th><th>出荷日</th><th>出荷日の枠</th><th>リードタイム</th><th>出荷日の件数</th></tr></thead>
                  <tbody>
                    {dateAlt.map((d) => (
                      <tr key={d.v} className={f.alt === d.v ? 'sel' : d.dis ? 'dis' : ''}>
                        <td><Radio name="newdate" checked={f.alt === d.v} disabled={d.dis} onChange={() => setF({ ...f, alt: d.v })} ariaLabel={d.d} /></td>
                        <td className={'es-num ' + d.dC}>{d.d}</td><td>{d.dc}</td>
                        <td className={'es-num ' + d.sC}>{d.s}</td><td>{d.sc}</td><td className="es-num">{d.lt}</td><td className={'es-num ' + d.nC}>{d.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <SectionTitle>この配送だけ変更する</SectionTitle>
          <div className="es-formgrid">
            <Select label="配送会社（2次）" options={[...new Set([r.carrier2, 'みどり便', '栄成ロジ', '佐川急便', 'ヤマト運輸', '自社便'].filter((x) => x && x !== '—'))]} value={f.carrier2} onChange={(carrier2) => setF({ ...f, carrier2 })} helper="変更すると出荷指示を再送します" />
            <Select label="配送スタッフ（1次・栄成ロジ）" options={['山口 健', '佐々木 大地', '中村 亮']} value={f.staff} onChange={(staff) => setF({ ...f, staff })} helper="委託・自社が運ぶ区間は1次でも割り当てます" />
            <TextField label="納品先の住所" value={f.addr} onChange={(addr) => setF({ ...f, addr })} helper="変更すると送り状を取り直します（新しい版で再送）" />
            <TextField label="変更理由" req placeholder="例）拠点の依頼で納品日を 10/22 に変更／受取担当者の依頼で当日のスタッフを変更" value={f.reason} onChange={(reason) => setF({ ...f, reason })} helper="日付の変更も、この理由で変更履歴に残します" error={err.reason} />
          </div>
          <div className="note">今月以降すべてを変える場合は、この画面ではなく拠点・契約情報の配送設定で変更してください。変更前 → 変更後と操作者は変更履歴に残ります。</div>
        </>
      )}
      {r.isChild && r.st === '確認中' && (
        <>
          <SectionTitle>納品日と数量を確定する</SectionTitle>
          <div className="es-formgrid">
            <TextField date label="納品日" req icon="CalendarBlank" value={childDate} onChange={setChildDate} helper="仮の日付。ピッキング日はリードタイムを保って決まります" />
            <TextField label="出荷日（ピッキング日）" value="2026-10-07" readOnly />
            <TextField label="確定の状態" value="日付 未確定 ・ 数量 未確定" readOnly />
          </div>
        </>
      )}
      <SectionTitle>{r.qtyTitle}</SectionTitle>
      <div className="es-table-wrap">
        <table className="es-table">
          <thead><tr><th>商品名</th><th>商品ID</th><th className="r">予定数量</th><th className="r">確定数量</th><th>確定のしかた</th></tr></thead>
          <tbody>{r.qty.map((q) => <tr key={q.n}><td>{q.n}</td><td className="es-mono">{q.id}</td><td className="r es-num">{q.p}</td><td className="r es-num">{q.f}</td><td>{q.how}</td></tr>)}</tbody>
        </table>
      </div>
      {r.isChild && r.st === '確認中' && (
        <div className="row between">
          <span className="note">親のトラブルを解決すると、数量は解決の内容（全量・残数）で入り直します。確定すると出荷待になり、次の出荷指示で倉庫へ送られます。</span>
          <div style={{ display: 'inline-flex', gap: '0.571429rem', alignItems: 'center' }}>
            {parentOpen && <span className="disabled-why">親のトラブルが未解決のため確定できません</span>}
            {canAct(api, 'confirmChild') && <Button disabled={parentOpen} onClick={confirmChild}>確定して出荷待へ</Button>}
          </div>
        </div>
      )}
      {crPast.length > 0 && (
        <>
          <SectionTitle>この配送の変更申請（処理済み）</SectionTitle>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>申請番号</th><th>受付日</th><th>申請者</th><th>内容</th><th>状態</th><th>処理者・理由</th></tr></thead>
              <tbody>
                {crPast.map((c) => (
                  <tr key={c.id}><td className="es-mono">{c.id}</td><td className="es-num">{fmtDate(c.date)}</td><td className="w">{c.who}<span className="sub">{c.whoSub}</span></td><td className="w">{c.what}<span className="sub">{c.why}</span></td><td><Badge tone={c.tone}>{c.st}</Badge></td><td className="w">{c.by}<span className="sub">{c.byWhy}</span></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      <SectionTitle>運営メモ（社内だけ。法人・委託配送先・ドライバーには出しません）</SectionTitle>
      <div className="opm">
        <textarea className="opm__in" aria-label="運営メモ" placeholder="例：次回から、到着の10分前に受付の森様へ電話する" value={memo} onChange={(e) => setMemo(e.target.value)} />
        {memoErr && <p className="es-field__msg es-field__msg--error">{memoErr}</p>}
        <div className="row between"><span className="note">メモはこの配送データに残ります（変更履歴にも残る）。拠点に毎回伝えたいことは拠点マスタの配送メモに書きます。</span>{canAct(api, 'addMemo') && <Button variant="outline" size="sm" icon="Plus" onClick={addMemo}>メモを追加</Button>}</div>
        <ul className="opm__list">{r.memos.map((m, i) => <li key={i}><b>{m.at} {m.who}</b>　{m.text}</li>)}</ul>
      </div>
      <SectionTitle>このお届けで法人へ送るメール（見本）</SectionTitle>
      <div className="note">メイン・サブの担当者あて。出荷実績の取込（発送完了）で1通。オーダー締切の後に運営が納品日・出荷日を変えたときにも送ります（P11・2026-10-01 決定）。締切前の変更は確定のお知らせに最新の日付が載るため送りません。</div>
      <details className="opm__mail"><summary>① 発送完了のお知らせ（出荷実績の取込のとき）</summary><pre>{`件名：【ESステーション】商品を発送しました（10/08（木）お届け予定）
宛先：株式会社サンプル 大阪支店 メイン・サブのご担当者様
いつもESキッチンをご利用いただき、ありがとうございます。
下記のお届けの商品を発送しました。
■ 配送No：DL-260928-0014-1
■ お届け予定日：2026-10-08（木）午前中
■ 配送方法：ES配送便
■ 送り状番号：DL-260928-0014-1-01
  お届けの状況は、法人Webの「お届け詳細」でご確認いただけます。
  （ヤマト運輸でお届けするときは、送り状番号と追跡ページの URL を載せます。
    URL は委託配送先マスタの「追跡URLのひな形」から作ります）
――――――――――
ESステーション（ESキッチン）
※このメールは送信専用です。`}</pre></details>
      <details className="opm__mail"><summary>② お届け日の変更のお知らせ（締切後に運営が日付を変えたとき）</summary><pre>{`件名：【ESステーション】お届け日を変更しました（DL-260928-0014-1）
宛先：株式会社サンプル 大阪支店 メイン・サブのご担当者様
いつもESキッチンをご利用いただき、ありがとうございます。
運営で、次のお届けの日付を変更しました。
■ 配送No：DL-260928-0014-1
■ 変更前：2026-10-07（水）
■ 変更後：2026-10-08（木）
■ 理由：倉庫の出荷日の変更のため
先にお送りした確定のお知らせの日付は古くなっています。
最新のお届け日は法人Webのホームでご確認いただけます。
――――――――――
ESステーション（ESキッチン）
※このメールは送信専用です。`}</pre></details>
    </>
  );
}

function Route({ r, toDocs }: { r: Rec; toDocs: () => void }) {
  const canAct = useCanAct();
  /* 権限がなければ送り状番号の追加・訂正を出さない */
  const canTrack = r.canTrack && canAct(api, 'setTracking');
  return (
    <>
      <SectionTitle>配送ルート</SectionTitle>
      <div className="es-formgrid">
        <TextField label="配送区分" value={r.temp} readOnly />
        <TextField label="便種別" value={r.svc} readOnly />
        <TextField label="リードタイム" value={r.lead} readOnly />
        <TextField label="配送回数（1サイクル）" value="2回" readOnly />
        <TextField label="配送パターン" value="サイクル" readOnly />
        <TextField label="中継" value={r.relay} readOnly helper="ルートの区間から判定（途中の状態は持ちません）" />
      </div>
      <div className="note">子契約 <span className="id">{r.child}</span> の配送ルート設定から引き継ぎ。ドライバーは区間ごとに割り当てます（ES配送便・COOL便とも。運送会社の区間は割り当てない・委託と自社の区間は1次でも割り当てる）。</div>
      <p className="subh">地点と配送会社（ルート順）</p>
      <div className="es-table-wrap">
        <table className="es-table">
          <thead><tr><th style={{ width: '3.428571rem' }}>No</th><th>名称・ID</th><th>住所</th><th>電話・担当者</th><th>納品条件</th><th>次の地点へ運ぶ配送会社</th><th>この地点での受取</th><th>搬入経路</th></tr></thead>
          <tbody>
            {r.points.map((pt) => {
              const h = pointHref(pt.id);
              return (
                <tr key={pt.no}>
                  <td><span className="no">{pt.no}</span></td>
                  <td className="w">{h ? <Link href={h}><b>{pt.nm}</b></Link> : <b>{pt.nm}</b>}<span className="sub">{pt.id}</span></td>
                  <td className="w">{pt.addr}<span className="sub">{pt.addrSub}</span></td>
                  <td className="w">{pt.tel}<span className="sub">{pt.person}</span></td>
                  <td className="w">{pt.cond}<span className="sub">{pt.condSub}</span></td>
                  <td className="w"><b>{pt.next}</b><span className="sub">{pt.nextSub}</span></td>
                  <td className="w">{pt.pick}<span className="sub">{pt.pickSub}</span></td>
                  <td>{pt.docs === '—' ? '—' : <button type="button" className="lnkbtn" onClick={toDocs}>{pt.docs}</button>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SectionTitle>送り状番号</SectionTitle>
      {r.hasInvoice && (
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th>送り状番号</th><th>発行元</th><th>配送会社</th><th>箱</th><th>状態</th>{canTrack && <th>操作</th>}</tr></thead>
            <tbody>{r.invoices.map((iv) => (
              <tr key={iv.tid ?? iv.no}>
                <td>{iv.active !== false && iv.src === '運送会社' ? <TrackingNo no={iv.no} url={iv.url} carrier={iv.c} /> : <span className="es-mono">{iv.no}</span>}</td>
                <td>{iv.src}</td><td>{iv.c}</td><td>{iv.box}</td><td><Badge tone={iv.tone}>{iv.st}</Badge></td>
                {canTrack && <td>{iv.tid && iv.active !== false ? <TrackEdit deliveryId={r.id} id={iv.tid} cur={iv.no} /> : '—'}</td>}
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {canTrack && <TrackEdit deliveryId={r.id} />}
      <div className="note">{r.invNote}</div>
    </>
  );
}

/** 送り状番号の登録・訂正・無効（路線便。課題 0-2：ヤマトの API は使わないので運営が入れる）。id なし＝足す */
function TrackEdit({ deliveryId, id, cur }: { deliveryId: string; id?: string; cur?: string }) {
  const { toast, toastError } = useOps();
  const [open, setOpen] = useState(!id);
  const [no, setNo] = useState(cur ?? '');
  const [busy, setBusy] = useState(false);
  const go = async (fn: () => Promise<{ msg: string }>) => {
    setBusy(true);
    try { const out = await fn(); toast(out.msg); if (!id) setNo(''); else setOpen(false); } catch (x) { toastError(x); } finally { setBusy(false); }
  };
  if (id && !open) {
    return (
      <span style={{ display: 'inline-flex', gap: '0.428571rem' }}>
        <Button size="sm" variant="outline" tone="neutral" onClick={() => setOpen(true)}>訂正</Button>
        <Button size="sm" variant="ghost" tone="negative" disabled={busy} onClick={() => go(() => api.action('voidTracking', { id }))}>無効にする</Button>
      </span>
    );
  }
  return (
    <div style={{ display: 'flex', gap: '0.571429rem', alignItems: 'flex-end', flexWrap: 'wrap', margin: id ? 0 : '0.571429rem 0' }}>
      <TextField label={id ? undefined : '送り状番号を追加（ヤマト：12桁の数字）'} placeholder="例：4471-1006-0012" value={no} onChange={setNo} size="sm" style={{ width: '15.714286rem' }}
        onEnter={() => go(() => api.action('setTracking', { deliveryId, trackingNo: no, ...(id ? { id } : {}) }))} />
      <Button size="sm" disabled={busy || !no.trim()} onClick={() => go(() => api.action('setTracking', { deliveryId, trackingNo: no, ...(id ? { id } : {}) }))}>{id ? '保存' : '追加'}</Button>
      {id && <Button size="sm" variant="ghost" tone="neutral" onClick={() => { setNo(cur ?? ''); setOpen(false); }}>やめる</Button>}
    </div>
  );
}

function Result({ r }: { r: Rec }) {
  if (!r.hasResult || !r.result) return <EmptyState title="まだ納品実績がありません" icon="ClockCountdown">{r.noResultText}</EmptyState>;
  /* 中身は共通データから（受付簿 No.47）。データがない欄・表は出さない。受取者はデータがないので出さない */
  const x = r.result;
  return (
    <>
      <SectionTitle>納品実績</SectionTitle>
      <div className="es-formgrid">
        <TextField label="状態" value={r.st} readOnly />
        <TextField label="納品完了日時" value={x.doneAt} readOnly />
        <TextField label="完了の確定方法" value={x.method} readOnly />
        <TextField label="配送スタッフ" value={x.staff} readOnly />
        <TextField label="駐車料金（税込・ドライバーの駐車報告）" value={r.park} readOnly helper="ドライバーが立て替え → 委託配送会社がまとめて運営へ請求（法人には請求しない）" />
        {x.follow.length > 0 && (
          <Field label="後続の配送"><div className="es-input es-input--md es-input--readonly">{x.follow.map((f, i) => <span key={f.id}>{i > 0 && '・'}<Link className="es-mono" href={`/ops/delivery/list/${f.id}`}>{f.id}</Link>（{f.st}・{f.qty}食）</span>)}</div></Field>
        )}
      </div>
      {(x.steps.length > 0 || x.diffs.length > 0) && (
        <div className="grid2">
          {x.steps.length > 0 && (
            <div>
              <div className="lbl">ES配送便の手順（ドライバーアプリ）</div><div className="note" style={{ margin: '0 0 0.428571rem' }}>アプリの「配送完了」は報告済みという意味です。トラブルが未解決のあいだ、配送データの状態は受取済のままです。</div>
              <CheckList items={x.steps} />
            </div>
          )}
          {x.diffs.length > 0 && (
            <div>
              <div className="lbl">検品の差異・代替品</div>
              <div className="es-table-wrap">
                <table className="es-table compact">
                  <thead><tr><th>商品名</th><th className="r">確定</th><th className="r">実績</th><th className="r">差</th><th>代替元</th><th>理由</th></tr></thead>
                  <tbody>{x.diffs.map((l, i) => <tr key={i}><td>{l.n}</td><td className="r es-num">{l.plan}</td><td className="r es-num">{l.got}</td><td className={`r es-num${l.got < l.plan ? ' ua' : ''}`}>{l.got - l.plan > 0 ? '+' : l.got - l.plan < 0 ? '−' : ''}{Math.abs(l.got - l.plan)}</td><td className={l.sub ? '' : 'muted'}>{l.sub || '—'}</td><td className={l.why ? '' : 'muted'}>{l.why || '—'}</td></tr>)}</tbody>
                </table>
              </div>
              <div className="note" style={{ marginTop: '0.571429rem' }}>実績の確定は運営が行います。代替品は代替元の商品の単価で請求します。</div>
            </div>
          )}
        </div>
      )}
      {x.stock.length > 0 && <>
        <SectionTitle>在庫確認・陳列の結果（商品ごと）</SectionTitle>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th>商品名</th><th className="r">陳列前の在庫<span className="sub">② 在庫/廃棄</span></th><th className="r">廃棄</th><th className="r">今回の納品<span className="sub">③ 陳列（検品）</span></th><th className="r">陳列後の在庫<span className="sub">② − 廃棄 ＋ ③</span></th></tr></thead>
            <tbody>{x.stock.map((k, i) => <tr key={i}><td>{k.n}</td><td className="r es-num">{k.before}食</td><td className={`r es-num${k.disp ? ' ua' : ''}`}>{k.disp ? `${k.disp}食` : '0'}</td><td className="r es-num">{k.dlv ? `${k.dlv}食` : '0（今回なし）'}</td><td className="r es-num"><b>{k.after}食</b></td></tr>)}</tbody>
          </table>
        </div>
        <div className="note">陳列前の在庫・廃棄は ② 在庫/廃棄（バーコード読取可）、今回の納品は ③ 陳列（検品）で並べた数から入ります。陳列後の在庫は ② と ③ から計算します。賞味期限は追跡しません（期限切れはドライバーが現場で確認して廃棄）。陳列前・陳列後の写真は「添付資料」タブで見られます。</div>
      </>}
      {x.legs.length > 0 && <>
        <SectionTitle>区間ごとの受取</SectionTitle>
        <div className="es-table-wrap">
          <table className="es-table">
            <thead><tr><th>区間</th><th>運ぶ会社</th><th>運び手</th><th>受取</th></tr></thead>
            <tbody>{x.legs.map((l, i) => <tr key={i}><td>{l.route}</td><td>{l.carrier}</td><td>{l.regime}</td><td className="es-num">{l.at}</td></tr>)}</tbody>
          </table>
        </div>
      </>}
    </>
  );
}

function TroubleTab({ r, canReport, canResolve, report, resolve }: { r: Rec; canReport: boolean; canResolve: boolean; report: () => void; resolve: () => void }) {
  return (
    <>
      <div className="row between">
        <span className="note">ドライバー・委託配送会社の報告と、運営の代理登録を並べています。報告しても配送データの状態は変えません。解決は配送単位でまとめて行います。</span>
        {canReport && <Button variant="outline" size="sm" onClick={report}>トラブルを代理登録</Button>}
      </div>
      {r.trb.length > 0 ? (
        <>
          <div className="es-table-wrap">
            <table className="es-table">
              <thead><tr><th>No</th><th>種別</th><th>アプリの選択肢（原文）</th><th>報告者・日時</th><th>内容・写真</th><th>自動子</th><th>状態</th></tr></thead>
              <tbody>
                {r.trb.map((t) => (
                  <tr key={t.no}><td>{t.no}</td><td><Badge tone={t.tone}>{t.kind}</Badge></td><td>{t.raw}</td><td className="w">{t.who}<span className="sub">{t.at}</span></td><td className="w">{t.note}<span className="sub">{t.photo}</span></td>
                    <td className="es-mono">{/^DL-/.test(t.child) ? <Link href={`/ops/delivery/list/${t.child}`}>{t.child}</Link> : t.child}</td><td><Badge tone={t.stTone}>{t.st}</Badge></td></tr>
                ))}
              </tbody>
            </table>
          </div>
          {r.trbOpen && (
            <div className="row between">
              <span className="note">アプリの選択肢は次の6区分に入ります。受取時：箱数不足・一部未受取 → 数量相違／誤配送 → 誤配送（自動子）／荷物破損 → 破損・品質不良（自動子）。配達時：商品不足・誤配送・陳列の差異 → 種別未定（解決のときに6区分を付ける）／交通渋滞・事故 → 遅延／不在・連絡不可 → 不在・受け取り不可（自動子）。COOL便の一部未配送 → 数量相違。その他 → その他。</span>
              {canResolve && <Button onClick={resolve}>対応を決める</Button>}
            </div>
          )}
          {r.trbDone && r.resolved && (
            <>
              <SectionTitle>解決</SectionTitle>
              <div className="es-formgrid">
                <TextField label="対応" value={r.resolved.how} readOnly />
                <TextField label="解決者・日時" value={fmtDatesIn(r.resolved.by)} readOnly />
                <TextField label="後続の配送" value={r.resolved.next} readOnly />
              </div>
              <TextField label="理由" value={r.resolved.reason} readOnly />
            </>
          )}
        </>
      ) : <EmptyState title={r.noTrbTitle} icon="Checks">{r.noTrbText}</EmptyState>}
    </>
  );
}

function Docs({ r }: { r: Rec }) {
  /* 資料の追加は配送の編集ができる人だけ */
  const canEdit = useScreenCan()('update');
  const { toast } = useOps();
  const files1 = [
    { name: '搬入経路図.pdf', placeholder: 'PDF', meta: '拠点 ' + r.siteShort, badge: ['primary', '委託業者向け'] },
    { name: '拠点マニュアル.pdf', placeholder: 'PDF', meta: '拠点 ' + r.siteShort, badge: ['primary', '委託業者向け'] },
    { name: '駐車場案内.jpg', placeholder: '画像', meta: '拠点 ' + r.siteShort, badge: ['neutral', '顧客向け'] },
    { name: '中継拠点の受け渡し手順.pdf', placeholder: 'PDF', meta: '中継先', badge: ['primary', '委託業者向け'] },
  ];
  return (
    <>
      <SectionTitle>① 地点の資料（拠点・中継先マスタから参照）</SectionTitle>
      <div className="note">搬入経路図や拠点マニュアルはマスタ側で差し替えます。この配送だけの差し替えはしません。<Link href="/ops/contracts">拠点・契約情報を開く ›</Link></div>
      <div className="files">{files1.map((x) => <FileCard key={x.name} name={x.name} placeholder={x.placeholder} meta={x.meta} badge={<Badge tone={x.badge[0]}>{x.badge[1]}</Badge>} />)}</div>
      <SectionTitle>② この配送の資料</SectionTitle>
      <div className="row between"><span className="note">陳列前後・検品・トラブルの写真と報告です。納品済みでも追加・差し替えでき、変更履歴に残ります。</span>{canEdit && <Button variant="outline" size="sm" icon="Plus" onClick={() => toast('資料を追加しました')}>資料を追加</Button>}</div>
      <div className="files">{RESULT_SAMPLE.files2.map((x) => <FileCard key={x.name} name={x.name} placeholder={x.placeholder} meta={x.meta} badge={<Badge tone={x.badge === '顧客向け' ? 'neutral' : 'primary'}>{x.badge}</Badge>} />)}</div>
    </>
  );
}

function History({ r }: { r: Rec }) {
  const [kind, setKind] = useState('');
  const items = kind ? r.hist.filter((h) => HIST_KINDS[kind].test(h.what)) : r.hist;
  return (
    <>
      <div className="row between">
        <span className="note">申請・承認とシステムの変更を時系列で並べています。変更前 → 変更後と操作者を残します（保持 24ヶ月）。</span>
        <Select placeholder="すべての種類" options={Object.keys(HIST_KINDS)} value={kind} onChange={setKind} style={{ width: '14.285714rem' }} />
      </div>
      <Timeline items={items} />
    </>
  );
}
