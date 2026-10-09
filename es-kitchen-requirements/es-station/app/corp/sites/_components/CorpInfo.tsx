'use client';

import { billTone } from '@/lib/corp/docs/logic';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpDocs from '@/lib/corp/areas/corp-docs';
import { DEMO } from '@/lib/demo';
import { CFIELDS, rvCheck, splitChanges, staffError, STAFF_KINDS, TONE_CT, ctSt, type RvResult } from '@/lib/corp/sites/logic';
import type { ChangeItem, StaffRow } from '@/lib/corp/sites/types';
import { useCorp, useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, CardT, Checkbox, ConfirmDiscard, Dialog, Icon, InlineMessage, PageHead, Tabs, cx } from './es';
import { corpTerm } from '@/lib/domain/terms';
import { api, ApTag, ChangeList, ErrSum, Lab, Loading, Lnk, Ro, RoBadge, RoText, Tbl, Td, useAcct, WhoField, WithdrawModal } from './parts';

/*
 * 法人情報（法人アカウントだけ）＝ ENTITY の「法人情報編集」の法人Web表示（元：22_法人_拠点管理.html の Corp）。
 * 法人名・フリガナなどは保存ですぐ反映（運営Web の法人へ）、請求書に載る住所・電話・FAX は法人情報の変更の申請になる。
 */
type Edit = { d: Record<string, string>; staff: StaffRow[]; errs?: Record<string, string>; serr?: Record<string, string>; elist?: RvResult['list'] | null; err?: string | null };
const docsApi = areaApi(corpDocs);
type SaveM = { ch: ChangeItem[]; now: ChangeItem[]; st: boolean; who: string; whoErr?: boolean; d: Record<string, string>; staff: StaffRow[] };

export default function CorpInfo({ editing }: { editing: boolean }) {
  /* サイドメニューで離れるときの確認（lib/ui/leaveGuard）。中身は下の dirty を入れる */
  const leaveRef = useRef<() => boolean>(() => false);
  useOpsLeaveGuard(() => leaveRef.current());
  const router = useRouter();
  const sp = useSearchParams();
  const acct = useAcct();
  const { isBranch } = useCorpSignedIn();
  const { toast, toastError } = useCorp();
  const { data, error } = useQuery(api, 'corp', { acct });
  const [ctab, setCtab] = useState(editing ? 'info' : sp.get('tab') ?? 'info');
  const [ed, setEd] = useState<Edit | null>(null);
  const [modal, setModal] = useState<{ type: 'save'; m: SaveM } | { type: 'discard'; go: () => void } | { type: 'withdraw' } | { type: 'qr' } | null>(null);
  /* QR コード出力の拠点（REQ-UI-009：2026/10/02 に購入・ユーザー管理の画面から法人情報へ移した） */
  const qrSites = useQuery(docsApi, 'qrSites', { who: acct }).data;
  if (isBranch) return <Card><b>法人情報は法人アカウントだけが見られます</b></Card>;
  if (error) return <Card><b>読み込めませんでした</b></Card>;
  if (!data) return <Loading />;
  const cv = (k: string) => data.d[k] ?? '';
  const start = (): Edit => ({ d: Object.fromEntries(Object.keys(CFIELDS).map((k) => [k, cv(k)])), staff: data.staff.map((r) => [...r] as StaffRow) });
  const e = editing ? (ed ?? start()) : null;
  const cp = data.cpend;
  const dirty = () => !!e && (Object.keys(e.d).some((k) => e.d[k] !== cv(k)) || JSON.stringify(e.staff) !== JSON.stringify(data.staff));
  leaveRef.current = dirty;
  const leave = (go: () => void) => { if (dirty()) setModal({ type: 'discard', go }); else go(); };
  const toView = () => { setEd(null); router.push('/corp/corp-info'); };

  function f(k: string, cls?: string) {
    const F = CFIELDS[k], lock = F.appr && cp;
    if (!e || lock) {
      if (e && lock) return <div className={cx('es-field', cls)}><Lab label={F.label} ap={F.ap} /><div className="es-input es-input--md es-input--readonly"><input readOnly value={cv(k) || '—'} /></div><span className="es-field__msg">承認待ちの変更があるため、承認後に直せます</span></div>;
      return <Ro label={F.label} v={cv(k)} cls={cls} />;
    }
    const val = e.d[k], changed = val !== cv(k), err = e.errs?.[k];
    const onCh = (x: string) => { const errs = { ...(e.errs || {}) }; delete errs[k]; setEd({ ...e, d: { ...e.d, [k]: x }, errs }); };
    return (
      <div className={cx('es-field', cls, changed && 'cb-changed', err && 'es-field--error')}>
        <Lab label={F.label} appr={F.appr} req={F.req} ap={F.ap} />
        {F.opts
          ? <div className="es-input es-select es-input--md"><select value={val} onChange={(x) => onCh(x.target.value)}>{F.opts.map((o) => <option key={o} value={o}>{o}</option>)}</select><Icon name="CaretDown" size={16} /></div>
          : <div className="es-input es-input--md"><input type="text" value={val} onChange={(x) => onCh(x.target.value)} /></div>}
        {err ? <span className="es-field__msg es-field__msg--error" role="alert">{err}</span> : null}
        {changed ? <span className="es-field__msg">{'変更前：' + (cv(k) || '（空欄）') + (F.appr ? '（承認後に反映）' : '（保存するとすぐ反映・ESキッチンに通知）')}</span> : null}
      </div>
    );
  }
  function save() {
    if (!e) return;
    const ck = rvCheck(CFIELDS, e.d, e.staff);   /* RV-CORP-20261002 C-a */
    if (ck.list.length) { setEd({ ...e, d: ck.d, staff: ck.staff, errs: ck.errs, serr: ck.serr, elist: ck.list, err: ck.smsg || null }); toast('入力内容に誤りがあります（' + ck.list.length + '件）。赤字の欄を直してください'); return; }
    const e2: Edit = { d: ck.d, staff: ck.staff };
    setEd(e2);
    const { ch, now } = splitChanges(CFIELDS, e2.d, cv);
    const st = JSON.stringify(e2.staff) !== JSON.stringify(data!.staff);
    const se = staffError(e2.staff);
    if (se) { setEd({ ...e2, err: se }); toast(se === '担当者名・フリガナ・メールアドレスを入力してください' ? 'ご担当者の担当者名・フリガナ・メールアドレスを入力してください' : se); return; }
    if (!ch.length && !now.length && !st) { toView(); toast('保存しました'); return; }
    setModal({ type: 'save', m: { ch, now, st, who: '', d: e2.d, staff: e2.staff } });
  }
  async function doSave(m: SaveM) {
    if (!m.who) { setModal({ type: 'save', m: { ...m, whoErr: true } }); return; }
    try {
      const r = await api.action('saveCorp', { acct, d: m.d, staff: m.staff, who: m.who });
      setModal(null); toView();
      toast(r.ch ? '保存しました。請求書に載る住所はESキッチンの承認後に反映します' : '保存しました。ESキッチンにお知らせしました');
    } catch (x) { toastError(x); }
  }
  const staff = e ? e.staff : data.staff;
  const setStaff = (i: number, j: number, val: string) => {
    if (!e) return;
    const a = e.staff.map((r) => [...r] as StaffRow); a[i][j] = val;
    const se = { ...(e.serr || {}) }; delete se[i + '|' + j];
    setEd({ ...e, staff: a, err: null, serr: se });
  };

  let body;
  if (ctab === 'bill') body = (
    <div className="cb-stack">
      <CardT title="請求条件">
        <div className="es-formgrid">
          <Ro label="請求書を発行する時期" v={data.bill.lead} /><Ro label="請求書の発行単位" v={data.bill.unit} ap="ref" /><Ro label="支払方法" v={data.bill.pay} ap="ref" />
          <Ro label="口座振替のお手続き状況" v={data.bill.debit} /><Ro label="お支払いの周期（月払い・年払い）" v={data.bill.cycle} ap="ref" /><Ro label="年払いの開始月" v={data.bill.start} />
          <Ro label="入金期限" v={data.bill.due} /><RoText label="今月の請求書は何月分か" cls="es-span-2">{data.bill.now}</RoText>
          <RoText label="請求先の内訳" cls="es-span-2">{data.bill.split}</RoText><Ro label="請求書の送付先" v={data.bill.to} />
        </div>
        <p className="note">請求条件は見るだけです。変更はお問い合わせください。拠点ごとの請求先は、拠点詳細の「編集」で変えられます（ESキッチンの承認後に反映）。</p>
      </CardT>
      <CardT title="請求書一覧" action={<Lnk cls="cb-act" onClick={() => router.push('/corp/bills')}>請求書の一覧へ ›</Lnk>}>
        <Tbl cols={['請求書番号', '発行日', 'ご請求月', '請求先', { label: '対象拠点数', cls: 'r' }, { label: '固定額', cls: 'r' }, '固定額の対象', { label: 'ご利用実績の精算', cls: 'r' }, 'ご利用実績の精算の対象', { label: '消費税', cls: 'r' }, { label: '再請求（税込）', cls: 'r' }, { label: '請求金額（税込）', cls: 'r' }, '入金期限', '請求書状態']}>
          {data.inv.map((r, i) => (
            <tr key={i}>
              <td className="es-mono"><Lnk onClick={() => router.push(`/corp/bills/${r[0]}?from=corp`)}>{r[0]}</Lnk></td>
              <Td v={r[1]} cls="es-num" /><Td v={r[2]} /><Td v={r[3]} /><Td v={r[4]} cls="r es-num" /><Td v={r[5]} cls="r es-num" /><Td v={r[6]} /><Td v={r[7]} cls="r es-num" /><Td v={r[8]} cls="es-num" /><Td v={r[9]} cls="r es-num" />
              <Td v={r[0] === 'INV-2026100001' ? '90,000円（INV-2026080001）' : '—'} cls="r es-num" /><Td v={r[10]} cls="r es-num" /><Td v={r[11]} cls="es-num" />
              <td>{r[12].split('／').map((x, j) => <Badge key={j} tone={billTone(x)}>{x}</Badge>)}</td>
            </tr>
          ))}
        </Tbl>
        <p className="note">請求書番号を押すと、請求書の内容（明細）を確認できます。請求金額（税込）＝固定額＋ご利用実績の精算＋消費税＋再請求（前月以前の未入金分を税込のまま）です。請求書（PDF）は Bill One（請求書のオンライン受け取りサービス）からメールでお届けします。固定額＝ご利用月の前にお支払いいただく月額です。ご利用実績の精算＝在庫の差額などを、あとからご精算いただくものです。</p>
      </CardT>
    </div>
  );
  else if (ctab === 'sites') body = (
    <div className="cb-stack">
      <CardT title="一覧（拠点・契約）">
        <Tbl cols={['拠点ID', '拠点名', 'ご契約番号', '契約種別', '契約状態', '当月の適用プラン', 'ご請求月', { label: '当月請求額（税抜）', cls: 'r' }, { label: '月ごとのご契約 件数', cls: 'r' }]}>
          {data.sites.map((x) => (
            <tr key={x.id}>
              <td className="es-mono"><Lnk onClick={() => router.push(`/corp/sites/${x.id}?tab=ct`)}>{x.id}</Lnk></td>
              <Td v={x.name} /><Td v={x.ct.no} cls="es-mono" /><Td v={corpTerm(x.ct.kind)} /><td><Badge tone={TONE_CT[x.ct.status]}>{ctSt(x.ct.status)}</Badge></td><Td v={x.ct.plan} />
              <Td v={(x.kids.find((k) => k.cyc === '2026-10') || { billFor: '—' }).billFor} /><Td v={x.ct.amt} cls="r es-num" /><Td v={String(x.kids.length)} cls="r es-num" />
            </tr>
          ))}
        </Tbl>
      </CardT>
    </div>
  );
  else body = (
    <div className="cb-stack">
      <CardT title="基本情報"><div className="es-formgrid">
        <Ro label="法人ID" v={data.id} />{f('name')}{f('cname')}{f('kana')}{f('bname')}<RoBadge label="法人状態" text={data.status} tone="success" />
      </div></CardT>
      <CardT title="住所（請求書に載る住所）" action={e && !cp ? <Button variant="outline" size="sm" icon="MapPin" onClick={() => toast('郵便番号から住所を入れました')}>住所検索</Button> : null}>
        <div className="es-formgrid">{f('zip')}{f('pref')}{f('city')}{f('a1')}{f('a2')}{f('tel')}{f('fax')}</div>
      </CardT>
      <CardT title={<>担当者<ApTag k="ntf" /></>} action={e ? <Button variant="outline" size="sm" icon="Plus" onClick={() => setEd({ ...e, staff: [...e.staff, ['サブ担当者', '', '', '', '']] })}>行を追加</Button> : null}>
        <Tbl compact={false} cols={[...['区分', '担当者名', 'フリガナ', 'メールアドレス', '電話番号'], ...(e ? [{ label: '', w: 48 }] : [])]}>
          {staff.map((r, i) => {
            if (!e) return <tr key={i}><Td v={r[0]} /><Td v={r[1]} /><Td v={r[2]} /><Td v={r[3]} cls="es-mono" /><Td v={r[4]} cls="es-num" /></tr>;
            const inp = (j: number, ph: string) => { const se = e.serr?.[i + '|' + j]; return <td key={j}><div className={cx('es-input es-input--sm', se && 'es-input--error')} title={se}><input value={r[j]} placeholder={ph} aria-invalid={se ? true : undefined} onChange={(x) => setStaff(i, j, x.target.value)} /></div></td>; };
            /* 2026/10/01 STEP2 Q10：法人のご担当者も追加・削除できる（即反映・ESキッチンへ通知） */
            return (
              <tr key={i}>
                <td><div className="es-input es-select es-input--sm"><select value={r[0]} onChange={(x) => setStaff(i, 0, x.target.value)}>{STAFF_KINDS.map((o) => <option key={o}>{o}</option>)}</select><Icon name="CaretDown" size={14} /></div></td>
                {inp(1, '担当者名')}{inp(2, 'フリガナ')}{inp(3, 'メールアドレス')}{inp(4, '電話番号')}
                <td className="c"><Button variant="ghost" tone="negative" size="sm" icon="Trash" aria-label="行を削除" onClick={() => { const a = e.staff.slice(); a.splice(i, 1); setEd({ ...e, staff: a }); }} /></td>
              </tr>
            );
          })}
        </Tbl>
        {e?.err ? <span className="es-field__msg es-field__msg--error">{e.err}</span> : null}
        <p className="note">法人の担当者は、拠点の担当者とは別に持ちます。請求担当者のメールアドレスに、法人あての請求書とお知らせが届きます。担当者の変更・追加・削除は承認なしですぐ反映し、ESキッチンにお知らせします。メイン担当者と請求担当者は1名ずつ必要です。</p>
      </CardT>
      {!e && (
        <CardT title="お知らせの設定">
          <Checkbox label="ご注文のリマインドを受け取る（締切の7日前・3日前。ご注文がまだの拠点だけ）" checked={data.orderReminder}
            onChange={async (on) => { try { await api.action('setOrderReminder', { acct, on }); toast(on ? 'ご注文のリマインドを受け取る設定にしました' : 'ご注文のリマインドを受け取らない設定にしました'); } catch (x) { toastError(x); } }} />
          <p className="note">法人と配下のすべての拠点のアカウントに送るお知らせ（メール）です。受け取らない場合、ご注文がないまま締切を過ぎると基準数でお届けします。</p>
        </CardT>
      )}
    </div>
  );

  return (
    <>
      <PageHead crumbs={['法人情報', e ? '法人情報編集' : '法人情報詳細']} title={<>{e ? '法人情報編集 ' : '法人情報詳細 '}<span className="es-mono">{data.id}</span></>}
        stat={<><span>{cv('name')}</span><span className="k">法人状態</span><Badge tone="success">{data.status}</Badge><span className="k">拠点</span><span>{data.sites.length}拠点</span></>}
        actions={e ? <><Button variant="outline" onClick={() => leave(toView)}>キャンセル</Button><Button onClick={save}>保存</Button></>
          : <><Button variant="outline" onClick={() => setModal({ type: 'qr' })}>QRコード出力</Button><Button icon="PencilSimple" onClick={() => router.push('/corp/corp-info/edit')}>編集</Button></>} />
      {cp ? (
        <InlineMessage tone="info" title={'変更の承認を待っています（' + cp.no + '）'}>
          <div>{cp.items.map((it) => it.label + '「' + (it.from || '（空欄）') + '」→「' + it.to + '」').join('　')}</div>
          {e ? null : <div style={{ marginTop: '0.428571rem' }}><Lnk onClick={() => setModal({ type: 'withdraw' })}>変更を取り下げる</Lnk></div>}
        </InlineMessage>
      ) : null}
      <ErrSum list={e?.elist} />
      {e ? <InlineMessage tone="info" title="編集しています">法人名・法人名（契約）・フリガナ・請求先法人名は保存するとすぐ反映し、ESキッチンにお知らせします。担当者の変更・追加・削除もすぐ反映し、ESキッチンへ通知のみです（メイン担当者・請求担当者は1名ずつ必要）。郵便番号・住所・電話番号・FAX番号はESキッチンの承認後に反映します。請求書の発行単位・支払方法・お支払いの周期（月払い・年払い）は参照のみで、変更はESキッチンへご依頼ください。</InlineMessage> : null}
      <Card className="cb-tabcard"><Tabs items={[{ value: 'info', label: '基本情報' }, { value: 'bill', label: '請求' }, { value: 'sites', label: '拠点・契約一覧' }]} value={ctab} onChange={setCtab} /></Card>
      {body}
      {modal?.type === 'discard' ? <ConfirmDiscard onCancel={() => setModal(null)} onConfirm={() => { const g = modal.go; setModal(null); setEd(null); g(); }} /> : null}
      {modal?.type === 'withdraw' && cp ? (
        <WithdrawModal title="変更を取り下げますか？" body={'承認待ちの変更（' + cp.items.map((it) => it.label).join('・') + '）を取り下げます。'} onCancel={() => setModal(null)}
          onConfirm={async () => { try { await api.action('withdraw', { acct, no: cp.no }); setModal(null); toast('変更を取り下げました'); } catch (x) { toastError(x); } }} />
      ) : null}
      {modal?.type === 'qr' ? <QrDialog sites={qrSites ?? []} onClose={() => setModal(null)} onPdf={(t) => toast(t)} /> : null}
      {modal?.type === 'save' ? (() => {
        const m = modal.m;
        return (
          <Dialog title="保存しますか？" width={800} onClose={() => setModal(null)}
            footer={<div style={{ display: 'flex', gap: '0.857143rem' }}><Button variant="outline" onClick={() => setModal(null)}>キャンセル</Button><Button onClick={() => doSave(m)}>保存</Button></div>}>
            <div className="cb-dlg">
              <ChangeList title="すぐ反映します（ESキッチンにお知らせします）" items={m.now} />
              {m.st ? <div><b className="cb-mh">すぐ反映します（ESキッチンにお知らせします）</b><ul className="cb-ul"><li>ご担当者の変更</li></ul></div> : null}
              <ChangeList title="ESキッチンの承認後に反映します" items={m.ch} />
              {m.ch.length ? <InlineMessage tone="info" title="請求書に載る住所">承認後に発行する請求書から新しい住所になります。発行済みの請求書は変わりません。</InlineMessage> : null}
              <WhoField cands={data.who} value={m.who} err={m.whoErr} onPick={(w) => setModal({ type: 'save', m: { ...m, who: w, whoErr: false } })} />
            </div>
          </Dialog>
        );
      })() : null}
    </>
  );
}

/** QR コードの出力（アプリ用と、ES-QR を利用する拠点だけ ES-QR 専用。出し方は STEP7 資料 S7-35 の案。REQ-UI-009 で法人情報の画面に置く） */
function QrDialog({ sites, onClose, onPdf }: { sites: { id: string; n: string; s: string; esqr: boolean; paused: boolean }[]; onClose: () => void; onPdf: (t: string) => void }) {
  const list = sites.filter((x) => !x.paused);
  const demo = DEMO ? '（デモ）' : '';
  return (
    <Dialog title="QR コードの出力" width={720} onClose={onClose} footer={<Button variant="outline" tone="neutral" onClick={onClose}>閉じる</Button>}>
      <p style={{ margin: '0 0 0.857143rem' }}>拠点に貼る QR コードを、印刷用の PDF（A4サイズ・1枚に1つ。下に拠点名・拠点ID・種類を印字）で出力します。<br />ES-QR 専用の QR は、ES-QR を利用している拠点だけ出せます（下に「WORK EATS」を印字）。</p>
      <Tbl cols={['拠点ID', '拠点名', 'アプリ用', 'ES-QR 専用']}>
        {list.map((s) => (
          <tr key={s.id}>
            <td className="es-mono">{s.id}</td><Td v={s.n} />
            <td><Button variant="outline" size="sm" onClick={() => onPdf(`アプリ用 QR（${s.s}）の PDF を出力しました${demo}`)}>アプリ用 QR（PDF）</Button></td>
            <td>{s.esqr
              ? <Button variant="outline" size="sm" onClick={() => onPdf(`ES-QR 専用 QR（${s.s}）の PDF を出力しました${demo}`)}>ES-QR 専用 QR（PDF）</Button>
              : <span style={{ color: 'var(--text-low)', fontSize: '0.857143rem' }}>ES-QR を利用していません</span>}</td>
          </tr>
        ))}
      </Tbl>
      {DEMO ? <p className="note">出し方は案（STEP7 資料 S7-35）。休止中の拠点は出さない。運営も拠点詳細から同じ QR を出力できる。</p> : null}
    </Dialog>
  );
}
