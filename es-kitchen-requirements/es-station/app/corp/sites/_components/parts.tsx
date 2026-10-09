'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { areaApi, useQuery } from '@/lib/ops/core/client';
import corpSites from '@/lib/corp/areas/corp-sites';
import { AP_FC, EARLIEST, EARLIEST_DUE, MCODE, PROCS, TONE_AP, type ProcKey } from '@/lib/corp/sites/logic';
import type { Acct, ReqRow, WhoCand } from '@/lib/corp/sites/types';
import { useCorp, useCorpSignedIn } from '../../_ui/CorpProvider';
import { Badge, Button, Dialog, InlineMessage, Radio, cx } from './es';
import { fmtDatesIn, fmtTextNode } from '@/lib/format/date';
import { rem } from '@/lib/ui/rem';

/*
 * 拠点管理・申請・法人情報で共通の小さな部品（元の lab・ro・roAp・roBadge・roText・table・td・mc・whoField と、
 * 解約後（参照のみ）・停止後（ログインできない）の表示）。
 */
export const api = areaApi(corpSites);

/** ログイン中のアカウント（領域に渡す形） */
export function useAcct(): Acct {
  const { account } = useCorpSignedIn();
  return useMemo(() => ({ corpId: account.corpId, branchId: account.branchId, role: account.role }), [account.corpId, account.branchId, account.role]);
}

export function ApTag({ k }: { k?: string }) {
  const a = k ? AP_FC[k] : null;
  return a ? <span className={'cb-appr' + a[1]}>{a[0]}</span> : null;
}
export function Lab({ label, appr, req, ap }: { label: ReactNode; appr?: number; req?: number; ap?: string }) {
  return (
    <label className="es-field__label">{label}{req ? <span className="es-field__req">*</span> : null}
      {ap ? <ApTag k={ap} /> : appr ? <span className="cb-appr">承認が必要</span> : null}
    </label>
  );
}
const dash = (v: unknown) => (v == null || v === '' ? '—' : String(v));
export function Ro({ label, v, cls, ap, msg }: { label: ReactNode; v?: string; cls?: string; ap?: string; msg?: ReactNode }) {
  return (
    <div className={cx('es-field', cls)}>
      <label className="es-field__label">{label}{ap ? <ApTag k={ap} /> : null}</label>
      <div className="es-input es-input--md es-input--readonly"><input type="text" readOnly value={dash(v == null ? v : fmtDatesIn(v))} title={v} /></div>
      {msg ? <span className="es-field__msg">{msg}</span> : null}
    </div>
  );
}
export function RoBadge({ label, text, tone }: { label: string; text: string; tone?: string }) {
  return (
    <div className="es-field">
      <label className="es-field__label">{label}</label>
      <div className="ro" style={{ height: '2.857143rem', boxSizing: 'border-box', padding: '0 0.857143rem', display: 'flex', alignItems: 'center', gap: '0.571429rem' }}><Badge tone={tone}>{text}</Badge></div>
    </div>
  );
}
export function RoText({ label, children, cls }: { label: string; children: ReactNode; cls?: string }) {
  return <div className={cx('es-field', cls)}><label className="es-field__label">{label}</label><div className="ro">{fmtTextNode(children)}</div></div>;
}
export type Col = string | { label: string; cls?: string; w?: number };
export function Tbl({ cols, children, compact = true, cls }: { cols: Col[]; children: ReactNode; compact?: boolean; cls?: string }) {
  return (
    <div className="es-table-wrap">
      <table className={cx('es-table', compact && 'compact', cls)}>
        <thead><tr>{cols.map((c, i) => { const o = typeof c === 'string' ? { label: c } : c; return <th key={i} className={o.cls} style={o.w ? { width: rem(o.w) } : undefined}>{o.label}</th>; })}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
export function Td({ v, cls }: { v?: ReactNode; cls?: string }) {
  return <td className={cls} title={typeof v === 'string' ? v : undefined}>{v === '' || v == null ? '—' : fmtTextNode(v)}</td>;
}
export function Lnk({ children, onClick, cls }: { children: ReactNode; onClick: () => void; cls?: string }) {
  return <a href="#" className={cls} onClick={(e) => { e.preventDefault(); onClick(); }}>{children}</a>;
}
/** 機種コードつきの機種名（2026/10/01 決定 H5） */
export function Mc({ n }: { n: string }) {
  const c = MCODE.find((x) => n.startsWith(x[0]))?.[1];
  return c ? <span title={c + ' ' + n}><span className="mcode">{c}</span>{n}</span> : <>{n}</>;
}
/** 反映方法のついた変更の一覧（保存の確認） */
export function ChangeList({ title, items }: { title: string; items: { label: string; from: string; to: string }[] }) {
  if (!items.length) return null;
  return (
    <div>
      <b className="cb-mh">{title}</b>
      <ul className="cb-ul">{items.map((it, i) => <li key={i}>{it.label}：「{it.from || '（空欄）'}」→「{it.to || '（空欄）'}」</li>)}</ul>
    </div>
  );
}

/** 変更した方（申告した方）を選ぶ表（2026/09/29 hong：ご担当者の表にラジオボタン） */
export function WhoField({ cands, value, onPick, err, word = '変更した方' }: { cands: WhoCand[]; value: string; onPick: (v: string) => void; err?: boolean; word?: string }) {
  const { account } = useCorpSignedIn();
  const acct = account.role === 'branch' ? '拠点アカウント' : '法人アカウント';
  return (
    <div>
      <b className="cb-mh">{word === '変更した方' ? 'ご担当者（変更した方を選ぶ）' : word}<span className="es-field__req" aria-hidden>*</span></b>
      <Tbl cols={[{ label: word, w: 96, cls: 'c' }, '所属', '区分', '担当者名', 'メールアドレス']}>
        {cands.map((x, i) => {
          const on = value === x.value;
          return (
            <tr key={i} className={cx('cb-whorow', on && 'is-on')} onClick={() => { if (!on) onPick(x.value); }}>
              <td className="c"><Radio name="who" label="" checked={on} onChange={() => onPick(x.value)} /></td>
              <Td v={x.where} /><Td v={x.kind} /><Td v={<b>{x.name}</b>} /><Td v={x.mail} />
            </tr>
          );
        })}
      </Tbl>
      {err ? <p className="es-field__msg es-field__msg--error">{word}を選んでください</p> : null}
      <p className="note" style={{ marginTop: '0.428571rem' }}>ログインは{acct}（共有）なので、{word}を選んでください。変更の記録に残り、ESキッチンからのご連絡はこの方へお送りします。</p>
    </div>
  );
}

/** 変更を申請（手続きを選ぶ → 申込フォームへ進む）。元の modal type 'apply' */
export function ApplyDialog({ site, procs, onClose, initial }: { site: { id: string; name: string } | null; procs: ProcKey[]; onClose: () => void; initial?: ProcKey | null }) {
  const router = useRouter();
  const [cur, setCur] = useState<ProcKey | null>(initial ?? null);
  return (
    <Dialog title="変更を申請" id={site ? site.id + ' ' + site.name : '複数の拠点をまとめて'} width={720} onClose={onClose}
      footerNote={cur ? PROCS[cur].label : '手続きを選んでください'}
      footer={<div style={{ display: 'flex', gap: '0.857143rem' }}>
        <Button variant="outline" onClick={onClose}>キャンセル</Button>
        {cur ? <Button onClick={() => router.push(`/corp/requests/contract/new?kind=${cur}${site ? '&site=' + site.id : ''}`)}>申込フォームへ進む</Button> : null}
      </div>}>
      <div className="cb-dlg">
        <p className="note">{site ? 'この拠点でお申し込みいただける手続きです。「申込フォームへ進む」で、この拠点と手続きを選んだ状態の申込フォームが開きます。ご担当者・従業員数・備考など承認が要らない変更は、各画面の「編集」ですぐ直せます。拠点名・住所・電話番号・請求先などの承認が必要な変更は「拠点情報の変更」で申請します。'
          : '同じ内容なら、次の画面で複数の拠点をまとめてお申し込みいただけます。'}</p>
        <div className="cb-procs" role="radiogroup">
          {procs.map((k) => (
            <button key={k} type="button" role="radio" aria-checked={cur === k} className={cx('cb-proc', cur === k && 'is-on')} onClick={() => setCur(k)}>
              <span className="es-radio__dot cb-dot" aria-hidden />
              <span className="cb-proc__t"><b>{PROCS[k].label}</b><span>{PROCS[k].desc}</span><i>{PROCS[k].note}</i></span>
            </button>
          ))}
        </div>
        <InlineMessage tone="info" title={'いちばん早い反映は ' + EARLIEST + ' です'}>
          ご契約のお申し込みはご注文と同じ締切です。{EARLIEST_DUE} までのお申し込みは {EARLIEST}から、過ぎると翌月のご利用月からになります。
        </InlineMessage>
      </div>
    </Dialog>
  );
}

/** 申請の詳細（元の modal type 'reqd'） */
/** 申請に付ける資料。お客様がいつでも追加・差し替え・削除できる。運営には画面のお知らせだけ（台帳 F 2026-10-08）。ファイルは1つ5MBまで・10件まで */
function AttachBox({ no, readOnly }: { no: string; readOnly: boolean }) {
  const acct = useAcct();
  const { toast, toastError } = useCorp();
  const { data, reload } = useQuery(api, 'attachments', { acct, no });
  const ref = useRef<HTMLInputElement>(null);
  const files = data ?? [];
  const put = async (list: FileList | null) => {
    if (!list?.length) return;
    try {
      for (const f of Array.from(list)) await api.action('addAttachment', { acct, no, name: f.name, size: f.size });
      toast('ファイルを追加しました。');
    } catch (e) { toastError(e); }
    reload();
  };
  return (
    <div className="cb-attach">
      <b className="cb-mh">添付ファイル</b>
      {files.length ? (
        <ul className="cb-ul" style={{ margin: '0.285714rem 0' }}>
          {files.map((f) => (
            <li key={f.name} style={{ display: 'flex', gap: '0.857143rem', alignItems: 'center' }}>
              <span>{f.name}</span><span className="note">{f.size >= 1024 * 1024 ? (f.size / 1024 / 1024).toFixed(1) + 'MB' : Math.max(1, Math.round(f.size / 1024)) + 'KB'}・{f.by}・{f.at}</span>
              {readOnly ? null : <Button variant="outline" size="sm" onClick={async () => { try { await api.action('removeAttachment', { acct, no, name: f.name }); toast('ファイルを削除しました。'); } catch (e) { toastError(e); } reload(); }}>削除</Button>}
            </li>
          ))}
        </ul>
      ) : <p className="note">添付はありません。</p>}
      {readOnly ? null : (
        <>
          <input ref={ref} type="file" multiple hidden onChange={(e) => { void put(e.target.files); e.target.value = ''; }} />
          <Button variant="outline" size="sm" onClick={() => ref.current?.click()}>ファイルを追加</Button>
          <p className="note">ファイルは1つ5MBまで、10件までです。追加・削除はいつでもできます。ESキッチンには画面のお知らせでお伝えします（承認は不要です）。</p>
        </>
      )}
    </div>
  );
}

export function ReqDialog({ row, role, onClose }: { row: ReqRow; role: string; onClose: () => void }) {
  const router = useRouter();
  const { toast, toastError } = useCorp();
  const { view } = useCorpSignedIn();
  const acct = useAcct();
  const [confirm, setConfirm] = useState(false);
  const r = row.r, canW = view !== 'ro' && row.st === 'ESキッチンが確認中' && /^CH-/.test(r[0]);
  const wOk = row.site.corp || role !== 'branch' || row.acct !== '法人アカウント';   /* H2 */
  if (confirm) {
    return (
      <WithdrawModal title={row.info || row.site.corp ? '変更を取り下げますか？' : 'お申し込みを取り下げますか？'}
        body={row.info || row.site.corp ? `承認待ちの変更（${r[5]}）を取り下げます。今の内容のままになります。` : `${r[0]}（${r[1]}：${r[5]}）を取り下げます。取り下げると、この拠点の新しいお申し込みができるようになります。`}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          try {
            await api.action('withdraw', { acct, no: r[0], site: row.site.corp ? undefined : row.site.id });
            toast(row.info || row.site.corp ? '変更を取り下げました' : 'お申し込みを取り下げました');
            onClose();
          } catch (e) { toastError(e); }
        }} />
    );
  }
  return (
    <Dialog title="申請の詳細" id={r[0]} width={640} onClose={onClose}
      footer={<div style={{ display: 'flex', gap: '0.857143rem' }}>
        {row.site.corp ? <Button variant="outline" onClick={() => router.push('/corp/corp-info')}>法人情報を開く</Button>
          : row.site.id !== '—' ? <Button variant="outline" onClick={() => router.push(`/corp/sites/${row.site.id}?tab=doc`)}>拠点詳細を開く</Button> : null}
        {canW && wOk ? <Button tone="negative" variant="outline" onClick={() => setConfirm(true)}>取り下げる</Button> : null}
      </div>}>
      <div className="cb-dlg">
        <div className="es-formgrid cb-g2">
          <Ro label="受付番号" v={r[0]} /><Ro label="申請の種類" v={r[1]} /><Ro label="対象の拠点" v={(row.site.corp ? row.site.id + ' ' : row.site.id !== '—' ? row.site.id + ' ' : '') + row.site.name} /><Ro label="申請日" v={r[2]} />
          <Ro label="申請者" v={r[3]} /><Ro label="開始ご利用月" v={r[4]} /><RoText label="申請内容" cls="es-span-3">{r[5]}</RoText>
          <RoBadge label="承認状態" text={row.st} tone={TONE_AP[row.st]} /><Ro label="却下理由" v={r[7]} /><Ro label="取り下げ日時" v={r[8]} />
        </div>
        {/ESキッチンが代わりに/.test(r[3]) ? <InlineMessage tone="info" title="ESキッチンが代わりに受け付けました">お電話などでお受けしたお申し込みを、ESキッチンが代わりに入力しました。内容は法人Webからのお申し込みと同じように確認・反映します（2026-09-30）。</InlineMessage> : null}
        {canW && !wOk ? <InlineMessage tone="info" title="取り下げは法人アカウントから">法人アカウントが出した申請は、拠点アカウントからは取り下げられません。取り下げたいときは法人アカウントで行ってください。</InlineMessage> : null}
        <AttachBox no={r[0]} readOnly={view === 'ro'} />
        {canW ? <InlineMessage tone="info" title="ESキッチンが確認しています">承認されると、ご契約に反映してメールでお知らせします。確認が終わるまで、この拠点の新しいお申し込みはできません。</InlineMessage> : null}
      </div>
    </Dialog>
  );
}
/** 取り下げの確認（warning のモーダル） */
export function WithdrawModal({ title, body, onConfirm, onCancel }: { title: string; body: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="es-modal" role="dialog" aria-modal="true">
      <div className="es-modal__scrim" />
      <div className="es-modal__panel">
        <div className="es-modal__mark es-modal__mark--warning" aria-hidden>!</div>
        <h2 className="es-modal__title">{title}</h2>
        <div className="es-modal__body">{body}</div>
        <div className="es-modal__actions">
          <Button variant="outline" size="lg" block onClick={onCancel}>キャンセル</Button>
          <Button size="lg" block onClick={onConfirm}>取り下げる</Button>
        </div>
      </div>
    </div>
  );
}

/** 入力チェックのまとめ（RV-CORP-20261002 C-a） */
export function ErrSum({ list }: { list?: { label: string; msg: string }[] | null }) {
  if (!list || !list.length) return null;
  return (
    <div className="rv-errsum">
      <InlineMessage tone="negative" title={'入力内容に誤りがあります（' + list.length + '件）。赤字の欄を直してから、もう一度「保存」を押してください'}>
        <ul className="cb-ul" style={{ margin: '0.285714rem 0 0' }}>{list.map((x, i) => <li key={i}><b>{x.label}</b>：{x.msg}</li>)}</ul>
      </InlineMessage>
    </div>
  );
}

/**
 * 画面の外側：停止後（ログインできない）は停止のログイン画面だけ、解約後（参照のみ）は上にお知らせを出す。
 * DEMO のときは右下に「停止後／解約後の画面を見る」ボタン（元の外枠の #roStop・#roBack）
 */
export function SitesFrame({ children }: { children: ReactNode }) {
  const { view, roTitle, setView, toast } = useCorp();
  const demoBtns = DEMO ? (
    <>
      <button type="button" id="roStop" className="es-btn es-btn--outline es-btn--neutral es-btn--md ro-btn" onClick={() => setView('stopped')}>停止後（ログインできない）の画面を見る（デモ）</button>
      <button type="button" id="roBack" className="es-btn es-btn--outline es-btn--neutral es-btn--md ro-btn" onClick={() => setView('ro')}>解約後（参照のみ）の画面に戻る（デモ）</button>
    </>
  ) : null;
  if (view === 'stopped') {
    /* 2026/10/01 解約した拠点：停止後のログイン（Message List WEB No.76） */
    return (
      <div className="corp-sites cb-public">
        <header className="cb-pubhead">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/corp/logo.png" alt="ES STATION" />
          <span className="cb-pubname">法人Web</span>
        </header>
        <div style={{ maxWidth: '32.857143rem', margin: '3.428571rem auto', padding: '0 1.142857rem', width: '100%', boxSizing: 'border-box' }}>
          <section className="es-card">
            <h2 style={{ margin: '0 0 1.142857rem', fontSize: '1.428571rem' }}>ログイン</h2>
            <div style={{ marginBottom: '1.142857rem' }}><InlineMessage tone="negative" title="このアカウントはご解約により停止しています。お問い合わせは ESキッチンサポート窓口までご連絡ください。" /></div>
            <div className="es-field"><label className="es-field__label">ログインID</label><div className="es-input es-input--md"><input defaultValue="cu00871" aria-label="ログインID" /></div></div>
            <div className="es-field" style={{ marginTop: '0.857143rem' }}><label className="es-field__label">パスワード</label><div className="es-input es-input--md"><input type="password" defaultValue="password" aria-label="パスワード" /></div></div>
            <div style={{ marginTop: '1.142857rem' }}><Button onClick={() => toast('このアカウントは停止しています')}>ログイン</Button></div>
            {DEMO ? <p className="note" style={{ marginTop: '1.142857rem' }}>デモ：解約した拠点のアカウントは、最後のご請求の入金期限の翌日に停止します。停止したときにメール「アカウント停止のお知らせ」（Message List メール No.16）を拠点の担当者全員に送ります。</p> : null}
          </section>
        </div>
        {demoBtns}
      </div>
    );
  }
  return (
    <div className="corp-sites">
      {view === 'ro' ? (
        /* 2026/10/01 S4-3：解約した拠点は、最後のご請求の入金期限まで参照のみ（Message List WEB No.75） */
        <div style={{ marginTop: '1.142857rem' }}>
          <InlineMessage tone="warning" title={roTitle}>
            入金期限の翌日にアカウントを停止し、メールでお知らせします。参照のみの期間は、編集・お申し込みはできません。請求担当者だけは最終請求まで変更できます（拠点詳細の「編集」から）。{DEMO ? '（デモ：大阪支店を解約後の拠点として表示。ボタンは押せるままです）' : ''}
          </InlineMessage>
        </div>
      ) : null}
      {children}
      {demoBtns}
    </div>
  );
}

/** 読み込み中 */
export function Loading() {
  return <div className="es-card" style={{ marginTop: '1.428571rem', textAlign: 'center', color: 'var(--text-middle)' }}>読み込み中…</div>;
}
