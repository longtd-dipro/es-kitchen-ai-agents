'use client';

import { billTone } from '@/lib/corp/docs/logic';
import { useOpsLeaveGuard } from '@/lib/ui/leaveGuard';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type ReactNode, useRef } from 'react';
import { useQuery } from '@/lib/ops/core/client';
import {
  FIELDS, firstCycle, fmtNum, PROCS, rvCheck, shortStamp, splitChanges, staffError, STAFF_KINDS, TONE_AP, TONE_BILL, TONE_CT, TONE_LOAN, TONE_SITE, siteSt, ctSt, ym, canWithdraw,
  type ProcKey, type RvResult,
} from '@/lib/corp/sites/logic';
import type { ChangeItem, SiteView, StaffRow } from '@/lib/corp/sites/types';
import { today } from '@/lib/supplier/dates';
import { useCorp, useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Card, CardT, ConfirmDiscard, Dialog, EmptyState, FileCard, Icon, InlineMessage, Modal, PageHead, Pagination, Tabs, cx } from './es';
import { api, ApplyDialog, ApTag, ChangeList, ErrSum, Lab, Loading, Lnk, Mc, Ro, RoBadge, RoText, Tbl, Td, useAcct, WhoField, WithdrawModal } from './parts';
import { fmtDatesIn } from '@/lib/format/date';
import { corpTerm } from '@/lib/domain/terms';

/*
 * 拠点詳細／拠点編集（元：22_法人_拠点管理.html の Detail。5タブ：基本情報・契約・設備・オプション・請求・資料・履歴）。
 * 「編集」で直した欄のうち、承認が必要な欄は拠点情報の変更の申請（運営Web の契約申請管理）になり、ほかはすぐ反映する。
 */
type Edit = { d: Record<string, string>; staff: StaffRow[]; errs?: Record<string, string>; serr?: Record<string, string>; elist?: RvResult['list'] | null; err?: string | null };
type ModalState =
  | { type: 'save'; ch: ChangeItem[]; now: ChangeItem[]; st: boolean; who: string; whoErr?: boolean; d: Record<string, string>; staff: StaffRow[] }
  | { type: 'discard'; go: () => void }
  | { type: 'withdraw'; info: boolean }
  | { type: 'pw' }
  | { type: 'apply'; proc: ProcKey | null }
  | null;

const TABS = ['info', 'ct', 'eq', 'bill', 'doc'];

export default function SiteDetail({ id, editing }: { id: string; editing: boolean }) {
  /* サイドメニューで離れるときの確認（lib/ui/leaveGuard）。中身は下の dirty を入れる */
  const leaveRef = useRef<() => boolean>(() => false);
  useOpsLeaveGuard(() => leaveRef.current());
  const router = useRouter();
  const sp = useSearchParams();
  const acct = useAcct();
  const { toast, toastError } = useCorp();
  const { account } = useCorpSignedIn();
  const { data } = useQuery(api, 'site', { acct, id });
  const tab0 = sp.get('tab') ?? 'info';
  const [tab, setTab] = useState(TABS.includes(tab0) ? tab0 : 'info');
  const [ed, setEd] = useState<Edit | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  /* 表の上のドロップダウンで絞り込む（トグル「○○も表示」は使わない：台帳 F 2026-10-05 共通・P-LIST） */
  const [loanState, setLoanState] = useState('回収済を除く');
  const [applyState, setApplyState] = useState('適用中');
  if (!data) return <Loading />;
  const s = data.site, pi = s.pinfo, p = s.pend, ok = data.procs;
  const v = (k: string) => String((s as unknown as Record<string, unknown>)[k] ?? '');
  const start = (): Edit => { const d: Record<string, string> = {}; Object.keys(FIELDS).forEach((k) => { d[k] = v(k); }); return { d, staff: s.staff.map((r) => [...r] as StaffRow) }; };
  const e = editing ? (ed ?? start()) : null;
  const setE = (x: Edit) => setEd(x);
  const dirty = () => !!e && (Object.keys(e.d).some((k) => e.d[k] !== v(k)) || JSON.stringify(e.staff) !== JSON.stringify(s.staff));
  leaveRef.current = dirty;
  const leave = (go: () => void) => { if (dirty()) setModal({ type: 'discard', go }); else go(); };
  const toDetail = () => { setEd(null); router.push(`/corp/sites/${id}${tab !== 'info' ? '?tab=' + tab : ''}`); };
  const can = (k: ProcKey) => ok.includes(k);
  const reqLink = (k: ProcKey) => (!e && can(k) ? <Lnk cls="cb-act" onClick={() => setModal({ type: 'apply', proc: k })}>{PROCS[k].label}を申請 ›</Lnk> : null);
  const noWd = <span style={{ color: 'var(--text-low, #6b7280)' }}>法人アカウントが出した申請のため、取り下げは法人アカウントから行います</span>;

  /* 欄：編集中で直せるなら入力、それ以外は読み取り */
  function f(k: string, cls?: string) {
    const F = FIELDS[k];
    if (F.ref) return <Ro label={F.label} v={v(k)} cls={cls} ap={F.ap} msg={'ES-QR＝拠点に貼る QR コードで、お客様のスマホから購入できる機能です。ES-QR の利用設定はESキッチンだけが変更できます。変更をご希望の場合は、ESキッチンへご依頼ください。' + (s.qrHist ? '（設定の履歴：' + s.qrHist + '）' : '')} />;
    const shown = k === 'emp' || k === 'day' || k === 'month' ? fmtNum(k, v(k)) : v(k);
    if (e && s.status === '休止中') return <Ro label={F.label} v={shown} cls={cls} />;   /* RV-CORP-20261002 C-c：休止中は参照のみ */
    const locked = F.appr && pi;   /* 承認待ちの変更があるあいだ、承認必須の欄は直せない */
    if (!e || locked) {
      if (e && locked) return <div className={cx('es-field', cls)}><Lab label={F.label} ap={F.ap} /><div className="es-input es-input--md es-input--readonly"><input readOnly value={shown || '—'} /></div><span className="es-field__msg">承認待ちの変更があるため、承認後に直せます</span></div>;
      return <Ro label={F.label} v={shown} cls={cls} />;
    }
    const val = e.d[k], changed = val !== v(k), err = e.errs?.[k];
    const onCh = (x: string) => { const errs = { ...(e.errs || {}) }; delete errs[k]; setE({ ...e, d: { ...e.d, [k]: x }, errs }); };
    return (
      <div className={cx('es-field', cls, changed && 'cb-changed', err && 'es-field--error')}>
        <Lab label={F.label} appr={F.appr} req={F.req} ap={F.ap} />
        {F.opts
          ? <div className="es-input es-select es-input--md"><select value={val} onChange={(x) => onCh(x.target.value)}>{F.opts.map((o) => <option key={o} value={o}>{o}</option>)}</select><Icon name="CaretDown" size={16} /></div>
          : <div className="es-input es-input--md"><input type="text" value={val} onChange={(x) => onCh(x.target.value)} />{F.suffix ? <span className="es-input__suffix">{F.suffix}</span> : null}</div>}
        {err ? <span className="es-field__msg es-field__msg--error" role="alert">{err}</span> : null}
        {F.help || changed ? <span className="es-field__msg">{changed ? '変更前：' + (v(k) || '（空欄）') + (F.appr ? '（承認後に反映）' : '（保存するとすぐ反映）') : F.help}</span> : null}
      </div>
    );
  }

  function save() {
    if (!e) return;
    const ck = rvCheck(FIELDS, e.d, e.staff);   /* RV-CORP-20261002 C-a：チェックを通ってから保存の確認へ */
    if (ck.list.length) {
      setE({ ...e, d: ck.d, staff: ck.staff, errs: ck.errs, serr: ck.serr, elist: ck.list, err: ck.smsg || null });
      toast('入力内容に誤りがあります（' + ck.list.length + '件）。赤字の欄を直してください');
      return;
    }
    const e2: Edit = { d: ck.d, staff: ck.staff };
    setE(e2);
    const { ch, now } = splitChanges(FIELDS, e2.d, v);
    const st = JSON.stringify(e2.staff) !== JSON.stringify(s.staff);
    const se = staffError(e2.staff, s.billTo !== '法人');
    if (se) { setE({ ...e2, err: se }); toast(se === '担当者名・フリガナ・メールアドレスを入力してください' ? 'ご担当者の担当者名・フリガナ・メールアドレスを入力してください' : se); return; }
    if (!ch.length && !now.length && !st) { toDetail(); toast('保存しました'); return; }
    setModal({ type: 'save', ch, now, st, who: '', d: e2.d, staff: e2.staff });
  }
  async function doSave(m: Extract<ModalState, { type: 'save' }>) {
    if (!m.who) { setModal({ ...m, whoErr: true }); return; }
    try {
      const r = await api.action('saveSite', { acct, id, d: m.d, staff: m.staff, who: m.who });
      setModal(null);
      toDetail();
      toast(r.ch ? '保存しました。承認が必要な ' + r.ch + '項目はESキッチンの承認後に反映します' : r.st ? '保存しました。ご担当者の変更をESキッチンにお知らせしました' : '保存しました');
    } catch (x) { toastError(x); }
  }

  let msg: ReactNode = null;
  if (pi) msg = (
    <InlineMessage tone="info" title={'変更の承認を待っています（' + pi.no + '）'}>
      <div>{pi.items.map((it) => it.label + '「' + (it.from || '（空欄）') + '」→「' + it.to + '」').join('　')}</div>
      <div style={{ marginTop: '0.428571rem', display: 'flex', gap: '1.142857rem', flexWrap: 'wrap' }}>
        <span>{fmtDatesIn(pi.at)} {pi.who ? pi.who + ' さん（' + pi.acct + '）' : ''}の変更。ESキッチンの承認後に反映します。承認が終わるまで、この拠点の新しいお申し込みはできません。</span>
        {e ? null : canWithdraw(account.role, pi.acct) ? <Lnk onClick={() => setModal({ type: 'withdraw', info: true })}>変更を取り下げる</Lnk> : noWd}
      </div>
    </InlineMessage>
  );
  else if (p) msg = (
    <InlineMessage tone="info" title={'お申し込みを確認しています（' + p.no + '）'}>
      <div>{p.kind}：{p.what}（{fmtDatesIn(p.from)}から）・ {fmtDatesIn(p.at)} {p.who} さん（{p.acct || '—'}）</div>
      <div style={{ marginTop: '0.428571rem', display: 'flex', gap: '1.142857rem', flexWrap: 'wrap' }}>
        <span>確認が終わるまで、この拠点の新しいお申し込みと、承認が必要な欄の変更はできません。</span>
        {e ? null : canWithdraw(account.role, p.acct) ? <Lnk onClick={() => setModal({ type: 'withdraw', info: false })}>お申し込みを取り下げる</Lnk> : noWd}
      </div>
    </InlineMessage>
  );
  else if (s.band && s.band.at) msg = (
    <InlineMessage tone="warning" title={fmtDatesIn(s.band.from) + 'から休止します'}>
      {fmtDatesIn(s.band.from)}〜{fmtDatesIn(s.band.to)}（{s.band.n}）はお届けとご請求が止まります。再開の予定は {fmtDatesIn(s.band.resume)} です。休止中の設備：{s.band.eq}。休止の始めに棚卸報告をして、それまでのご利用実績を精算します。休止中は棚卸報告とご利用実績の精算はありません。
      {/置いたまま/.test(s.band.eq) ? '設備を置いたままにするので、休止中も社員の方はアプリで購入できます（その差は再開のときの棚卸報告で精算します）。最低利用期間は、置いたままの設備だけ休止中のカウントを止めます。' : '引き揚げた設備も、設置し直したときに休止前の残りを引き継ぎます（数え直しません）。'}
    </InlineMessage>
  );
  else if (s.status === '休止中' && s.band) msg = (
    <InlineMessage tone="warning" title={'休止中です（' + fmtDatesIn(s.band.from) + '〜' + fmtDatesIn(s.band.to) + '）'}>
      再開の予定は {fmtDatesIn(s.band.resume)} です。この拠点でお申し込みいただけるのは再開と解約だけです。休止中は参照のみです。ご担当者の変更だけできます。休止の始めに棚卸報告をして、それまでのご利用実績を精算しました。休止中は棚卸報告とご利用実績の精算はありません。
      {/置いたまま/.test(s.band.eq) ? '設備を置いたままなので、休止中も社員の方はアプリで購入できます（その差は再開のときの棚卸報告で精算します）。最低利用期間は、置いたままの設備だけ休止中のカウントを止め、再開後に残りを引き継ぎます。' : '設備は引き揚げたため、休止中はアプリで購入できません。引き揚げた設備も、設置し直したときに休止前の残りを引き継ぎます（数え直しません）。'}
    </InlineMessage>
  );
  const editMsg = e && s.status === '休止中'
    ? <InlineMessage tone="info" title="休止中は参照のみです。ご担当者の変更だけできます">ご担当者の変更・追加・削除はすぐ反映し、ESキッチンへ通知のみです（メイン担当者・請求担当者は1名ずつ必要です）。拠点の情報・アプリの利用設定・住所は、再開の後に直せます。</InlineMessage>
    : e ? <InlineMessage tone="info" title="編集しています">「ESキッチンの承認が必要」の欄はESキッチンの承認後に反映します。「即反映」の欄（従業員数・備考・FAX番号・1日上限数・1ヶ月上限金額・資料・配送備考）は保存するとすぐ反映します。ご担当者の変更はすぐ反映し、ESキッチンへ通知のみです（メイン担当者・請求担当者の変更は必ず通知します）。ES-QR の利用設定は参照のみで、ESキッチンだけが変更できます。</InlineMessage> : null;

  const tabs = [{ value: 'info', label: '基本情報' }, { value: 'ct', label: '契約' }, { value: 'eq', label: '設備・オプション' }, { value: 'bill', label: '請求' }, { value: 'doc', label: '資料・履歴', count: p || pi ? 1 : undefined }];

  /* ---------- 基本情報 ---------- */
  function TabInfo() {
    const staff = e ? e.staff : s.staff;
    const setStaff = (i: number, j: number, val: string) => {
      if (!e) return;
      const a = e.staff.map((r) => [...r] as StaffRow); a[i][j] = val;
      const se = { ...(e.serr || {}) }; delete se[i + '|' + j];
      setE({ ...e, staff: a, err: null, serr: se });
    };
    return (
      <div className="cb-stack">
        <CardT title="基本情報"><div className="es-formgrid">
          {f('name')}{f('kana')}<Ro label="所属法人" v={acct.corpId + ' ' + data!.corpName} />
          {f('emp')}<RoBadge label="拠点状態" text={siteSt(s.status)} tone={TONE_SITE[s.status]} /><Ro label="拠点ID" v={s.id} />
          {f('note', 'es-span-3')}
        </div></CardT>
        <CardT title="アプリの利用設定">
          <div className="es-formgrid cb-g4">{f('day')}{f('month')}{f('guest')}{f('qr')}</div>
          <p className="note">アプリの利用設定はご利用月ごとのご契約に記録します。料金のない設定（1日上限数・1ヶ月上限金額）は、今のご利用月（2026年10月分）以降のすべてのご契約に反映します。料金のある設定（ゲストモードなど）は、ご注文・変更の締切（前月15日）までなら翌月のご利用月から、過ぎたら翌々月から反映します（料金も同じ月から）。ES-QR の利用設定はESキッチンだけが変更できます。</p>
        </CardT>
        <CardT title="住所（お届け先）" action={e && !pi && s.status !== '休止中' ? <Button variant="outline" size="sm" icon="MapPin" onClick={() => toast('郵便番号から住所を入れました')}>住所検索</Button> : null}>
          <div className="es-formgrid">{f('zip')}{f('pref')}{f('city')}{f('a1')}{f('a2')}{f('tel')}{f('fax')}</div>
          <p className="note">住所を変えると、承認後に作られるお届けから新しい住所になります。作成済みのお届けはESキッチンが確認します。</p>
        </CardT>
        <CardT title={<>ご担当者<ApTag k="ntf" /></>} action={e ? <Button variant="outline" size="sm" icon="Plus" onClick={() => setE({ ...e, staff: [...e.staff, ['サブ担当者', '', '', '', '']] })}>行を追加</Button> : null}>
          <Tbl compact={false} cols={[...['区分', '担当者名', 'フリガナ', 'メールアドレス', '電話番号'], ...(e ? [{ label: '', w: 48 }] : [])]}>
            {staff.map((r, i) => {
              if (!e) return <tr key={i}><Td v={r[0]} /><Td v={r[1]} /><Td v={r[2]} /><Td v={r[3]} cls="es-mono" /><Td v={r[4]} cls="es-num" /></tr>;
              const inp = (j: number, ph: string) => { const se = e.serr?.[i + '|' + j]; return <td key={j}><div className={cx('es-input es-input--sm', se && 'es-input--error')} title={se}><input value={r[j]} placeholder={ph} aria-invalid={se ? true : undefined} onChange={(x) => setStaff(i, j, x.target.value)} /></div></td>; };
              return (
                <tr key={i}>
                  <td><div className="es-input es-select es-input--sm"><select value={r[0]} onChange={(x) => setStaff(i, 0, x.target.value)}>{STAFF_KINDS.map((o) => <option key={o}>{o}</option>)}</select><Icon name="CaretDown" size={14} /></div></td>
                  {inp(1, '担当者名')}{inp(2, 'フリガナ')}{inp(3, 'メールアドレス')}{inp(4, '電話番号')}
                  <td className="c"><Button variant="ghost" tone="negative" size="sm" icon="Trash" aria-label="行を削除" onClick={() => { const a = e.staff.slice(); a.splice(i, 1); setE({ ...e, staff: a, serr: {} }); }} /></td>
                </tr>
              );
            })}
          </Tbl>
          {e?.err ? <span className="es-field__msg es-field__msg--error">{e.err}</span> : null}
          <p className="note">メイン担当者と請求担当者は1名ずつ必要です。請求担当者のメールアドレスに請求書とご請求のお知らせが届きます。ご担当者の変更は承認なしですぐ反映し、ESキッチンにお知らせします。</p>
        </CardT>
        <CardT title="アカウント" action={!e ? <Button variant="outline" size="sm" onClick={() => setModal({ type: 'pw' })}>パスワード再設定</Button> : null}>
          <div className="es-formgrid"><Ro label="ログインID" v={s.acct.login} /><Ro label="最終ログイン日時" v={shortStamp(s.acct.last)} /></div>
        </CardT>
      </div>
    );
  }

  /* ---------- 契約 ---------- */
  function TabCt() {
    return (
      <div className="cb-stack">
        <CardT title="契約（ご契約）" action={reqLink('plan')}><div className="es-formgrid">
          <Ro label="契約番号" v={s.ct.no} /><Ro label="契約種別" v={corpTerm(s.ct.kind)} /><RoBadge label="契約状態" text={ctSt(s.ct.status)} tone={TONE_CT[s.ct.status]} />
          <Ro label="契約開始年月" v={s.ct.startCyc.replace(/分$/, '')} /><Ro label="当初契約開始年月・継続年月" v={s.ct.orig} /><Ro label="契約終了日" v={s.ct.endOn} />
          <Ro label="お試し期間（月数）" v={s.ct.trial} /><Ro label="お試しから本導入への切替" v={s.ct.switch} /><Ro label="現在の適用プラン" v={s.ct.plan} />
          <RoText label="最低ご利用期間・違約金のご確認" cls="es-span-3">{s.ct.term}</RoText>
          <RoText label="ご契約の作成状況・次回の自動作成" cls="es-span-3">{s.ct.next}</RoText>
        </div>
          <p className="note">「最低ご利用期間・違約金のご確認」は、最低ご利用期間の満了日と、期間内に解約した場合の違約金についての案内です。ご利用月は暦の月と少しずれることがあります（例：10月分は 10/12〜11/08）。</p>
        </CardT>
        {s.trialInfo ? (
          /* STEP5-MORE-20261001 T3：お試し期間と延長を法人Webに出す */
          <CardT title="お試し期間">
            <div className="es-formgrid"><Ro label="お試しの開始" v={s.trialInfo.from} /><Ro label="お試しの終了" v={s.trialInfo.to + '（延長を含む）'} /><Ro label="本導入へ切り替えるお申し込みの期限" v={s.trialInfo.decide} />
              <RoText label="最初のお届け" cls="es-span-3">{s.trialInfo.first}</RoText></div>
            <Tbl cols={[{ label: '日付', w: 110 }, '内容', '状態', 'ご請求']}>
              {s.trialInfo.ext.map((r, i) => <tr key={i}><Td v={r[0]} cls="es-num" /><Td v={r[1]} /><td><Badge tone="success">{r[2]}</Badge></td><Td v={r[3]} /></tr>)}
              {!s.trialInfo.ext.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-low)' }}>延長はありません</td></tr>}
            </Tbl>
            <p className="note">本導入に切り替えても、ご契約番号（{s.ct.no}）は同じです（新しい番号にはなりません）。同じご契約のまま契約種別が「正式なご契約」になり、最低利用期間・違約金・自動更新は本導入の開始日から数えます。お試しのご注文はシステムが全部の商品を少しずつ入れて自動で作ります。月次注文で数と商品を見られます（編集はできません）。延長はESキッチンへご相談ください。</p>
          </CardT>
        ) : null}
        <CardT title="一覧（月ごとのご契約）">
          <p className="note">月ごとのご契約はご利用月ごとに1件ずつ自動で作られ、プラン・お届け・設備はそこに記録されます。ご契約番号を押すと、そのご利用月のご契約内容を開きます。</p>
          <Tbl cols={['契約・ご利用月', '契約終了予定月', 'ご契約番号', 'プラン名', '契約状態', '配送区分', { label: 'お届け回数（月）', cls: 'r' }, 'ご請求月', { label: '当月請求額（税抜）', cls: 'r' }, '請求書状態']}>
            {s.band ? (
              <tr className="att"><td colSpan={10} className="cb-band">
                <Badge tone="warning">{s.band.kind}</Badge> <b>{fmtDatesIn(s.band.from)}〜{fmtDatesIn(s.band.to)}（{s.band.n}）</b>
                <span>再開予定 {fmtDatesIn(s.band.resume)} ・ 休止理由 {s.band.reason} ・ 休止中の設備 {s.band.eq} ・ この期間は月ごとのご契約を作りません</span>
              </td></tr>
            ) : null}
            {s.kids.map((k) => (
              <tr key={k.id}>
                <Td v={ym(k.cyc)} cls="es-num" /><Td v={s.ct.endOn} />
                <td className="es-mono"><Lnk onClick={() => router.push(`/corp/sites/${s.id}/contracts/${k.id}`)}>{k.id}</Lnk></td>
                <Td v={k.plan} /><td><Badge tone={TONE_CT[s.ct.status]}>{ctSt(s.ct.status)}</Badge></td><Td v={k.dlv} /><Td v={k.n} cls="r es-num" /><Td v={k.billFor} /><Td v={k.amt} cls="r es-num" />
                <td><span className="cb-badges"><Badge tone={TONE_BILL[k.pre]}>{'前 ' + k.pre}</Badge><Badge tone={TONE_BILL[k.post]}>{'後 ' + k.post}</Badge></span></td>
              </tr>
            ))}
          </Tbl>
          <Pagination total={s.kids.length} perPage={10} />
        </CardT>
      </div>
    );
  }

  /* ---------- 設備・オプション ---------- */
  function TabEq() {
    const loans = s.loans.filter((r) => (loanState === 'すべて' ? true : loanState === '回収済を除く' ? r[10] !== '回収済' : r[10] === loanState));
    const opts = s.opts.filter((r) => (applyState === 'すべて' ? true : applyState === '終了' ? r[10] === '終了' : r[10] !== '終了'));
    const sum = (kind: string) => { let t = 0; s.opts.forEach((r) => { if (r[10] === '適用中' && r[1] === kind && !r[7].includes('%')) t += parseInt(r[7].replace('−', '-').replace(/[^\d-]/g, ''), 10) || 0; }); return (t < 0 ? '−¥' : '¥') + Math.abs(t).toLocaleString(); };
    const active = s.loans.filter((r) => r[10] !== '回収済').reduce((a, r) => a + Number(r[6]), 0);
    return (
      <div className="cb-stack">
        <CardT title="貸出一覧" action={reqLink('eq')}>
          <div className="tools">
            <span>貸出中 合計 <b className="es-num" style={{ color: 'var(--text-high)' }}>{active}点</b></span>
            <label className="tfilter">貸出ステータス<select aria-label="貸出ステータス" value={loanState} onChange={(e) => setLoanState(e.target.value)}>{['回収済を除く', 'すべて', '配送中', '貸出中', '回収依頼中', '未返却', '回収済'].map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          <Tbl cols={['貸出ID', '設備区分', '機種', '個体番号', { label: '貸出数', cls: 'r' }, { label: '返却済数', cls: 'r' }, { label: '未返却数', cls: 'r' }, '貸出日', '返却予定日', '返却日', '貸出状態', '回収理由', '最低利用期間の満了日', '違約金のご確認', '備考', '最終更新']}>
            {loans.map((r, i) => (
              <tr key={i} className={r[10] === '回収済' ? 'dis' : undefined}>
                <Td v={String(r[0])} cls="es-mono" /><Td v={String(r[1])} /><Td v={<Mc n={String(r[2])} />} /><Td v={String(r[3])} cls="es-mono" />
                <Td v={String(r[4])} cls="r es-num" /><Td v={String(r[5])} cls="r es-num" /><Td v={String(r[6])} cls="r es-num" />
                <Td v={String(r[7])} cls="es-num" /><Td v={String(r[8])} cls="es-num" /><Td v={String(r[9])} cls="es-num" /><td><Badge tone={TONE_LOAN[String(r[10])]}>{r[10]}</Badge></td>
                <Td v={String(r[11])} /><Td v={String(r[12])} cls="es-num" /><Td v={String(r[13])} /><Td v={String(r[14])} /><Td v={String(r[15])} cls="es-num" />
              </tr>
            ))}
          </Tbl>
          <p className="note">最低利用期間は設備ごとに、貸出日から数えます。</p>
        </CardT>
        <CardT title="適用一覧（オプション・値引き）">
          <div className="tools">
            <span>オプション 合計（月額） <b className="es-num" style={{ color: 'var(--text-high)' }}>{sum('オプション')}</b>　値引き 合計（月額） <b className="es-num" style={{ color: 'var(--text-high)' }}>{sum('値引き')}</b>（税抜）</span>
            <label className="tfilter">適用の状態<select aria-label="適用の状態" value={applyState} onChange={(e) => setApplyState(e.target.value)}>{['適用中', '終了', 'すべて'].map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>
          {opts.length ? (
            <Tbl cols={['子契約ID', '区分', 'コード', '請求書表示名', '連動タイプ', '持ち主', { label: '数量', cls: 'r' }, { label: '金額・率（税抜）', cls: 'r' }, '適用開始月', '適用終了月', '状態', '根拠', '最終更新']}>
              {opts.map((r, i) => (
                <tr key={i} className={r[10] === '終了' ? 'dis' : undefined}>
                  <Td v={r[0]} cls="es-mono" /><Td v={r[1]} /><Td v={r[2]} cls="es-mono" /><Td v={r[3]} /><Td v={r[4]} /><Td v={r[5]} /><Td v={r[6]} cls="r es-num" /><Td v={r[7]} cls="r es-num" />
                  <Td v={ym(r[8])} cls="es-num" /><Td v={ym(r[9])} cls="es-num" /><td><Badge tone={r[10] === '適用中' ? 'success' : 'neutral'}>{r[10]}</Badge></td><Td v={r[11]} /><Td v={r[12]} cls="es-num" />
                </tr>
              ))}
            </Tbl>
          ) : <EmptyState title="適用中のオプション・値引きはありません" icon={false} compact />}
          <p className="note">見るだけの一覧です。オプションの追加・おやめは「配送の変更」のご要望欄か、お問い合わせで承ります。</p>
        </CardT>
      </div>
    );
  }

  /* ---------- 請求 ---------- */
  function TabBill() {
    const toCorp = s.billTo === '法人';
    return (
      <div className="cb-stack">
        <CardT title="請求書のあて先と請求条件">
          <div className="es-formgrid">
            {f('billTo')}<Ro label="請求書を発行する時期の上書き" v={s.bill.lead} /><Ro label="支払方法" v={s.bill.pay} />
            <Ro label="口座振替のお手続き状況" v={s.bill.debit || '—（口座振替ではありません）'} /><Ro label="お支払いの周期（月払い・年払い）" v={s.bill.cycle} /><Ro label="年払いの開始月" v={s.bill.start} />
            <Ro label="入金期限" v={s.bill.due} /><Ro label="請求書の発行単位" v={s.bill.unit} />
          </div>
          <p className="note">請求書のあて先は「編集」で変えられます（ESキッチンの承認後に反映）。支払方法・請求書の発行単位・リードタイムの変更はお問い合わせください。</p>
        </CardT>
        <CardT title={toCorp ? '法人の請求書の内訳（参考）' : '請求書一覧'} action={<Lnk cls="cb-act" onClick={() => router.push('/corp/bills')}>請求書の一覧へ ›</Lnk>}>
          {toCorp ? <p className="note">この拠点の分は、法人あての請求書にまとめて入ります。金額は法人の請求書の内訳（参考）で、消費税は法人の請求書と同じ規則（税率ごとに合計して1円未満を四捨五入）でこの拠点の分を求めています。</p> : null}
          <Tbl cols={['請求書番号', '発行日', 'ご請求月', { label: '固定額', cls: 'r' }, '固定額の対象', { label: 'ご利用実績の精算', cls: 'r' }, 'ご利用実績の精算の対象', { label: '消費税', cls: 'r' }, { label: toCorp ? 'この拠点の分（税込・参考）' : 'この拠点の請求金額（税込）', cls: 'r' }, '入金期限', '請求書状態']}>
            {s.inv.map((r, i) => (
              <tr key={i}>
                <td className="es-mono"><Lnk onClick={() => router.push(`/corp/bills/${r[0]}?site=${s.id}&from=site`)}>{r[0]}</Lnk></td>
                <Td v={r[1]} cls="es-num" /><Td v={r[2]} /><Td v={r[3]} cls="r es-num" /><Td v={r[4]} /><Td v={r[5]} cls="r es-num" /><Td v={r[6]} cls="es-num" /><Td v={r[7]} cls="r es-num" /><Td v={r[8]} cls="r es-num" /><Td v={r[9]} cls="es-num" />
                <td>{r[10].split('／').map((x, j) => <Badge key={j} tone={billTone(x)}>{x}</Badge>)}</td>
              </tr>
            ))}
          </Tbl>
          <p className="note">請求書は、毎月20日までのご利用分を集計し、25日に確定、翌月1日にお送りします。請求書番号を押すと内容（明細）を確認できます。請求書（PDF）は Bill One（請求書のオンライン受け取りサービス）からメールでお届けします。固定額＝ご利用月の前にお支払いいただく月額です。ご利用実績の精算＝在庫の差額などを、あとからご精算いただくものです。</p>
        </CardT>
      </div>
    );
  }

  /* ---------- 資料・履歴 ---------- */
  function TabDoc() {
    return (
      <div className="cb-stack">
        <CardT title={<>添付資料<ApTag k="imm" /></>} action={<Button variant="outline" size="sm" icon="Plus" onClick={() => toast('資料を追加しました')}>資料を追加</Button>}>
          <div className="files">{s.files.map((x, i) => <FileCard key={i} name={x.name} meta={x.meta} placeholder={x.ph} missing={!!x.missing} src={x.src} badge={x.ro ? <Badge tone="neutral">参照のみ</Badge> : null} />)}</div>
          <p className="note" style={{ marginTop: '0.857143rem' }}>搬入経路資料（顧客向け）と設置場所写真は、承認なしで追加できます。申込時の添付資料は見るだけです。</p>
        </CardT>
        <CardT title="申請履歴（法人Webからの変更申請）" action={<Lnk cls="cb-act" onClick={() => leave(() => router.push('/corp/requests/contract'))}>申請の一覧へ ›</Lnk>}>
          <Tbl cols={['受付番号', '申請の種類', '申請日', '申請者', '開始ご利用月', '申請内容', '承認状態', '却下理由', '取り下げ日時']}>
            {data!.reqs.map((x, i) => (
              <tr key={i} className={x.st === 'ESキッチンが確認中' ? 'att' : undefined}>
                <Td v={x.r[0]} cls="es-mono" /><Td v={x.r[1]} /><Td v={x.r[2]} cls="es-num" /><Td v={x.r[3]} /><Td v={x.r[4]} /><Td v={x.r[5]} />
                <td><Badge tone={TONE_AP[x.st]}>{x.st}</Badge></td><Td v={x.r[7]} /><Td v={x.r[8]} cls="es-num" />
              </tr>
            ))}
          </Tbl>
          <p className="note">変更履歴（いつ誰が何を直したか）はESキッチンの担当者名が出るため、法人Webには出しません。ここにはお客様の申請だけを出します。</p>
        </CardT>
      </div>
    );
  }

  const body = tab === 'ct' ? TabCt() : tab === 'eq' ? TabEq() : tab === 'bill' ? TabBill() : tab === 'doc' ? TabDoc() : TabInfo();
  return (
    <>
      <PageHead crumbs={[['拠点管理', () => leave(() => router.push('/corp/sites'))], e ? '拠点編集' : '拠点詳細']}
        title={<>{e ? '拠点編集 ' : '拠点詳細 '}<span className="es-mono">{s.id}</span></>}
        stat={<>
          <span>{s.name}</span><span className="k">拠点</span><Badge tone={TONE_SITE[s.status]}>{siteSt(s.status)}</Badge>
          <span className="k">契約</span><span className="es-mono">{s.ct.no}</span><Badge tone={TONE_CT[s.ct.status]}>{ctSt(s.ct.status)}</Badge>
          <span className="k">請求書のあて先</span><span>{s.billTo}</span>
        </>}
        actions={e
          ? <><Button variant="outline" onClick={() => leave(toDetail)}>キャンセル</Button><Button onClick={save}>保存</Button></>
          : <>
            <Button variant="outline" icon="CalendarBlank" onClick={() => router.push('/corp')}>お届けを見る</Button>
            {ok.length ? <Button variant="outline" onClick={() => setModal({ type: 'apply', proc: null })}>変更を申請</Button> : null}
            <Button icon="PencilSimple" onClick={() => router.push(`/corp/sites/${s.id}/edit${tab !== 'info' ? '?tab=' + tab : ''}`)}>編集</Button>
          </>} />
      {msg}{editMsg}<ErrSum list={e?.elist} />
      <Card className="cb-tabcard"><Tabs items={tabs} value={tab} onChange={setTab} /></Card>
      {body}
      {Modals()}
    </>
  );

  function Modals() {
    const m = modal;
    if (!m) return null;
    const close = () => setModal(null);
    if (m.type === 'discard') return <ConfirmDiscard onCancel={close} onConfirm={() => { setModal(null); setEd(null); m.go(); }} />;
    if (m.type === 'apply') return <ApplyDialog site={{ id: s.id, name: s.name }} procs={ok} onClose={close} initial={m.proc} />;
    if (m.type === 'pw') return (
      <Modal tone="info" title="パスワードを再設定しますか？" confirmLabel="認証コードの案内を送る" onCancel={close}
        onConfirm={async () => { try { await api.action('pwReset', { acct, id }); close(); toast('認証コード（有効期限5分）の案内を送りました'); } catch (x) { toastError(x); } }}>
        ログインID {s.acct.login} のメイン担当者（{s.staff[0]?.[3]}）に、パスワード再設定の認証コード（有効期限5分）をお送りします。
      </Modal>
    );
    if (m.type === 'withdraw') {
      const t = m.info ? pi! : p!;
      return (
        <WithdrawModal title={m.info ? '変更を取り下げますか？' : 'お申し込みを取り下げますか？'}
          body={m.info ? '承認待ちの変更（' + t.items.map((it) => it.label).join('・') + '）を取り下げます。今の内容のままになります。' : t.no + '（' + t.kind + '：' + t.what + '）を取り下げます。取り下げると、この拠点の新しいお申し込みができるようになります。'}
          onCancel={close}
          onConfirm={async () => { try { await api.action('withdraw', { acct, no: t.no, site: s.id }); close(); toast(m.info ? '変更を取り下げました' : 'お申し込みを取り下げました'); } catch (x) { toastError(x); } }} />
      );
    }
    return (
      <Dialog title="保存しますか？" width={800} onClose={close}
        footer={<div style={{ display: 'flex', gap: '0.857143rem' }}><Button variant="outline" onClick={close}>キャンセル</Button><Button onClick={() => doSave(m)}>保存</Button></div>}>
        <div className="cb-dlg">
          <ChangeList title="すぐ反映します" items={m.now} />
          {/* ゲストモード：保存した時点で使える／止まる。料金は締切ルール（台帳 2026/10/03） */}
          {m.now.some((it) => it.k === 'guest') && (() => {
            const on = m.d.guest === '利用する', fee = firstCycle(today()).v;
            return <InlineMessage tone="info" title="ゲストモード">{on ? `保存するとすぐ使えます。料金は ${fee}分からです。` : `保存するとすぐ止まります。料金は ${fee}分から止まります。`}</InlineMessage>;
          })()}
          {m.st ? <div><b className="cb-mh">すぐ反映します（ESキッチンにお知らせします）</b><ul className="cb-ul"><li>ご担当者の変更</li></ul></div> : null}
          <ChangeList title="ESキッチンの承認後に反映します" items={m.ch} />
          {m.ch.length ? <InlineMessage tone="info" title="承認までの間">承認が終わるまで、この拠点の新しいお申し込み（プラン・配送・設備・休止・解約）と、承認が必要な欄の変更はできません。</InlineMessage> : null}
          <WhoField cands={data!.who} value={m.who} err={m.whoErr} onPick={(w) => setModal({ ...m, who: w, whoErr: false })} />
        </div>
      </Dialog>
    );
  }
}

export type { SiteView };
