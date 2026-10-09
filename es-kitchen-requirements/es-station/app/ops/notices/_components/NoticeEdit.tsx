'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { useQuery } from '@/lib/ops/core/client';
import { blankNoticeCond, blankNoticeForm, ntCondText, validateNotice, type Errs } from '@/lib/ops/general/logic';
import { NT_PICK, NT_TG } from '@/lib/ops/general/seed';
import type { NoticeForm } from '@/lib/ops/general/types';
import { api, demoMsg, Loading, Sec, useDirty } from '@/app/ops/_general/parts';
import { Icon } from '@/app/ops/_ui/Icon';
import { useOps } from '@/app/ops/_ui/OpsProvider';
import { useCanAct, useScreenCan } from '@/app/ops/_ui/perm';
import { Badge, ConfirmModal, Field } from '@/app/ops/_ui/ui';
import { fmtAuto, fmtDatesIn, toSlashIfDate } from '@/lib/format/date';

const LIST = '/ops/notices';
/** 「条件で絞る」が使える区分（注文・自販機の情報をもつお客様側の2つ） */
const COND_KEYS = ['corp', 'app'];
/** メールの差出人・署名欄の設定値（システム管理が設定管理で変える予定。いまはこの値：hong 2026-10-05 N5） */
const SENDER_DEFAULT = 'ESキッチン運営事務局 <no-reply@es-kitchen.jp>';
const SIGN_DEFAULT = '────────────────\nESキッチンサポート窓口\nESキッチン株式会社\nカスタマーサクセスチーム\nE-mail：{info@es-kitchen.co.jp}';
const LBL = (k: string) => NT_TG.find((t) => t[0] === k)?.[1] ?? k;

/**
 * お知らせの新規登録・詳細・編集（元：renderNotice・ntPickModal。Figma Notification Management AW_NOTI_001〜009）。
 * 詳細は入力欄を触れない。配信停止にしたお知らせは、編集しても配信停止のまま。
 * メールの件名・本文・日時指定の既定値はタイトル・本文・おすすめの日時（直せる）。署名欄は設定値が既定値で、お知らせごとに直せる。件名の先頭には送るとき【ESステーション】が付く（hong 2026-10-05）。
 */
export default function NoticeEdit({ mode, id }: { mode: 'new' | 'view' | 'edit'; id?: string }) {
  const router = useRouter();
  const { toast, toastError, openModal } = useOps();
  const canAct = useCanAct();
  const screenCan = useScreenCan();
  const dirty = useDirty(mode !== 'view');
  const { data } = useQuery(api, 'notice', { id: id ?? '' });
  const [d, setD] = useState<NoticeForm | null>(mode === 'new' ? blankNoticeForm() : null);
  const [e, setE] = useState<Errs>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = mode === 'new', dis = mode === 'view';
  const row = data?.row;
  /* メールのおすすめの送信日時（公開開始日の 8:00。法人あては土日祝なら前の営業日・2026-10-03 決定） */
  const corpTo = !!d && (d.tg.corp.ess || d.tg.corp.mail.length > 0);
  const { data: suggest } = useQuery(api, 'noticeMailAt', { start: d?.start ?? '', corp: corpTo });

  useEffect(() => {
    if (!isNew && data && !d) setD(structuredClone({ title: String(data.row.title), cat: String(data.row.cat), important: !!data.important, ...(data.detail ?? blankNoticeForm()) }));
  }, [data, d, isNew]);
  useEffect(() => { if (!isNew && data === null) router.replace(LIST); }, [data, isNew, router]);
  if (!d || (!isNew && !row)) return <Loading />;

  const up = (patch: Partial<NoticeForm>) => { dirty.mark(); setD({ ...d, ...patch }); };
  const upTg = (k: string, patch: Partial<NoticeForm['tg'][string]>) => { const next = { ...d, tg: { ...d.tg, [k]: { ...d.tg[k], ...patch } } }; dirty.mark(); setD(next); return next; };
  const anyMail = NT_TG.some(([k]) => d.tg[k].mail.length);

  const pick = (k: string, cur: NoticeForm) => openModal(<PickModal k={k} init={cur.tg[k].picks} onOk={(picks) => { dirty.mark(); setD((x) => x && { ...x, tg: { ...x.tg, [k]: { ...x.tg[k], picks } } }); }} />);

  const save = async () => {
    /* 件名・日時指定は、空なら画面に出しているタイトル・表示開始日時（元は入力欄の値を読む） */
    const form = anyMail ? { ...d, subj: d.subj || d.title, mailAt: d.mailAt || suggest || d.start } : d;
    const err = validateNotice(form);
    setE(err);
    if (Object.keys(err).length) { toast('入力内容を確認してください'); return; }
    try {
      const r = await api.action('saveNotice', { id: isNew ? undefined : id, form });
      dirty.clear();
      const mailNote = anyMail ? `。メールは ${fmtAuto(form.mailAt)} に送ります` : d.important && suggest ? `。重要なお知らせのメールは ${fmtAuto(suggest)} に自動で送ります` : '';
      toast((isNew ? `お知らせ ${r.id} を登録しました（${r.status}）` : `お知らせ ${r.id} を保存しました`) + mailNote);
      router.push(`${LIST}/${r.id}`);
    } catch (x) { toastError(x); }
  };
  const del = () => openModal(<ConfirmModal title="削除確認" text={<>このお知らせを削除してもよろしいですか？<br />各アプリ・サイトのお知らせ一覧から消えます（データは「削除済」として残ります）。</>} ok="削除" onOk={async () => {
    try { await api.action('deleteNotice', { id: id! }); toast('お知らせを削除しました'); router.push(LIST); } catch (x) { toastError(x); }
  }} />);
  const addFiles = (n: number) => { up({ files: d.files + n }); toast(demoMsg('ファイルを追加しました（デモ）', 'ファイルを追加しました')); };

  const ta = (val: string, ph: string, on: (v: string) => void, idv: string) => (
    <>
      <textarea className="inp" id={idv} rows={4} maxLength={500} placeholder={ph} disabled={dis} value={val} onChange={(x) => on(x.target.value)} style={{ height: 'auto', padding: '0.571429rem 0.857143rem', resize: 'vertical' }} />
      <span className="hint" style={{ textAlign: 'right' }}>{val.length}/500</span>
    </>
  );
  const crumb = isNew ? 'お知らせ新規登録' : dis ? 'お知らせ詳細' : 'お知らせ編集';
  const title = isNew ? 'お知らせ新規登録' : mode === 'edit' ? `お知らせ編集（${row!.id}）` : `お知らせ詳細（${row!.id}）`;
  const btns: ReactNode = dis ? (
    <>
      {/* 権限がなければ出さない */}
      {canAct(api, 'deleteNotice') && <button className="btn out lg" style={{ color: 'var(--ng)', borderColor: 'var(--ng)' }} onClick={del}><Icon name="trash" />削除</button>}
      {screenCan('update') && <button className="btn pri lg" onClick={() => router.push(`${LIST}/${id}/edit`)}><Icon name="edit" />編集</button>}
    </>
  ) : (
    <>
      <button className="btn out lg" onClick={() => dirty.guard(() => router.push(isNew ? LIST : `${LIST}/${id}`))}>キャンセル</button>
      <button className="btn pri lg" onClick={save}>{isNew ? '登録' : '保存'}</button>
    </>
  );

  return (
    <>
      <div className="ph">
        <div>
          <div className="crumb"><span>お知らせ設定</span><span>お知らせ一覧</span><span>{crumb}</span></div>
          <h1>{title}{!isNew && <> <Badge v={String(row!.status)} /></>}</h1>
        </div>
        <div className="btns">{btns}</div>
      </div>
      <div className="card">
        <Sec title="配信対象">
          {e.tg && <div className="notice" style={{ borderColor: 'var(--ng)' }}><Icon name="warn" /><span>{e.tg}</span></div>}
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th style={{ width: '9.285714rem' }}>対象区分</th><th style={{ width: '7.857143rem', textAlign: 'center' }}>ESSへお知らせ</th><th style={{ width: '13.571429rem' }}>メール送信</th><th style={{ width: '21rem' }}>対象指定</th><th>選択内容</th></tr></thead>
              <tbody>
                {NT_TG.map(([k, l, opts]) => {
                  const t = d.tg[k], pk = NT_PICK[k];
                  const chips = t.mode === 'pick'
                    ? <>
                        {t.picks.slice(0, 4).map((pid) => { const r = pk.rows.find((x) => x[0] === pid) || [pid, pid]; return <span key={pid} className="badge b-mute" style={{ margin: '0 0.285714rem 0.285714rem 0' }}>{r[r.length - 1]}</span>; })}
                        {t.picks.length > 4 && <span className="badge b-mute">+{t.picks.length - 4}</span>}
                        {!t.picks.length && <span className="muted">未選択</span>}
                      </>
                    : t.mode === 'cond' ? <span className="badge b-mute">{ntCondText(t.cond) || '条件未指定'}</span> : <span className="muted">全員</span>;
                  return (
                    <tr key={k}>
                      <td><b>{l}</b></td>
                      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={t.ess} disabled={dis} aria-label={`${l}：ESSへお知らせ`} onChange={(x) => upTg(k, { ess: x.target.checked })} /></td>
                      <td>
                        {opts.map((o) => (
                          <label key={o} style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center', fontSize: '0.928571rem' }}>
                            <input type="checkbox" checked={t.mail.includes(o)} disabled={dis} onChange={(x) => {
                              const mail = x.target.checked ? [...t.mail, o] : t.mail.filter((m) => m !== o);
                              const next = upTg(k, { mail });
                              /* 初めてメール送信を選んだとき：件名＝タイトル・メール本文＝本文（既定値。あとで直せる） */
                              if (!next.subj || !next.mailBody) setD({ ...next, subj: next.subj || next.title, mailBody: next.mailBody || next.body });
                            }} />{o}
                          </label>
                        ))}
                      </td>
                      <td>
                        <label style={{ marginRight: '0.857143rem' }}><input type="radio" name={`nt-mode-${k}`} checked={t.mode === 'all'} disabled={dis} onChange={() => upTg(k, { mode: 'all' })} /> 全員</label>
                        <label style={{ marginRight: '0.857143rem' }}><input type="radio" name={`nt-mode-${k}`} checked={t.mode === 'pick'} disabled={dis} onChange={() => { const next = upTg(k, { mode: 'pick' }); if (!next.tg[k].picks.length) pick(k, next); }} /> 個別選択</label>
                        {!dis && t.mode === 'pick' && <> <button className="lnk u" onClick={() => pick(k, d)}>選択する</button></>}
                        {COND_KEYS.includes(k) && <label><input type="radio" name={`nt-mode-${k}`} checked={t.mode === 'cond'} disabled={dis} onChange={() => upTg(k, { mode: 'cond', cond: t.cond ?? blankNoticeCond() })} /> 条件で絞る</label>}
                        {t.mode === 'cond' && (() => {
                          const c = t.cond ?? blankNoticeCond();
                          const upC = (p: Partial<typeof c>) => upTg(k, { cond: { ...c, ...p } });
                          return (
                            <div style={{ display: 'grid', gap: '0.428571rem', marginTop: '0.571429rem' }}>
                              <label style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center', fontSize: '0.928571rem' }}>注文した年月
                                <input className="inp" type="month" aria-label={`${LBL(k)}：注文した年月`} disabled={dis} value={c.ym} onChange={(x) => upC({ ym: x.target.value })} style={{ width: '10rem' }} />
                              </label>
                              <select className="sel" aria-label={`${LBL(k)}：注文の種類`} disabled={dis || !c.ym} value={c.kind} onChange={(x) => upC({ kind: x.target.value as typeof c.kind })}>
                                <option value="menu">その月のメニューを注文</option>
                                <option value="product">その月の商品を注文</option>
                              </select>
                              <select className="sel" aria-label={`${LBL(k)}：自販機`} disabled={dis} value={c.vending} onChange={(x) => upC({ vending: x.target.value as typeof c.vending })}>
                                <option value="any">自販機：指定なし</option>
                                <option value="yes">自販機あり</option>
                                <option value="no">自販機なし</option>
                              </select>
                            </div>
                          );
                        })()}
                      </td>
                      <td>{chips}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="hint" style={{ margin: '0.571429rem 0 0' }}>ESSへお知らせ＝各アプリ・サイトのお知らせ一覧に出す。メール送信＝選んだ担当者（またはご本人）にメールも送る。個別選択は「選択する」で対象を選ぶ。条件で絞る（法人・拠点とアプリユーザー）は、注文した年月・メニュー／商品・自販機のあり／なしで対象を決める。配信停止にしたお知らせは、編集しても配信停止のまま。</p>
        </Sec>
        <Sec title="お知らせ内容">
          <div className="fg c2">
            <Field label="タイトル" req className="full" htmlFor="nt-title" err={e.title as string}>
              <input className={`inp${e.title ? ' err' : ''}`} id="nt-title" placeholder="例）システムメンテナンス実施のお知らせ" disabled={dis} value={d.title} onChange={(x) => up({ title: x.target.value })} />
            </Field>
            <Field label="カテゴリ" req htmlFor="nt-cat" err={e.cat as string}>
              <select className="sel" id="nt-cat" disabled={dis} value={d.cat} onChange={(x) => up({ cat: x.target.value })}>
                <option value="">カテゴリ</option>
                {['お知らせ', 'メンテナンス', 'システム更新'].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="重要" className="full" htmlFor="nt-important"
              hint={d.important && !anyMail && suggest ? `メールの宛先を選ばなくても、${fmtAuto(suggest)} にお知らせの表示先の全員へメールを自動で送ります。` : undefined}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.428571rem' }}>
                <input type="checkbox" id="nt-important" disabled={dis} checked={!!d.important} onChange={(x) => up({ important: x.target.checked })} />
                重要なお知らせにする（各サイトのお知らせ一覧の上に出し、公開開始日の 8:00 にメールを送ります）
              </label>
            </Field>
            <Field label="表示開始日時" req htmlFor="nt-start" err={e.start as string}>
              <input className={`inp${e.start ? ' err' : ''}`} id="nt-start" placeholder="yyyy-mm-dd HH:mm" disabled={dis} value={fmtAuto(d.start)} onChange={(x) => up({ start: toSlashIfDate(x.target.value) })} />
            </Field>
            <Field label="表示終了日時" htmlFor="nt-end">
              <input className="inp" id="nt-end" placeholder="yyyy-mm-dd HH:mm（空欄＝終了なし）" disabled={dis} value={fmtAuto(d.end)} onChange={(x) => up({ end: toSlashIfDate(x.target.value) })} />
            </Field>
            <Field label="添付ファイル" className="full" hint="各サイトのお知らせ詳細で開けます。メールには添付しません（JPG・PNG・PDF・HEIC、1件 5MB、10件まで）">
              {dis ? (d.files ? (
                <div className="tbl-wrap">
                  <table className="tbl">
                    <thead><tr><th>No</th><th>ファイル名</th><th>容量</th></tr></thead>
                    <tbody>{Array.from({ length: d.files }, (_, i) => <tr key={i}><td>{i + 1}</td><td><button className="lnk u" onClick={() => toast(demoMsg('ダウンロードしました（デモ）', 'ダウンロードしました'))}>添付ファイル{i + 1}.pdf</button></td><td>0.33MB</td></tr>)}</tbody>
                  </table>
                </div>
              ) : <span className="muted">なし</span>) : (
                <>
                  <button className="btn out" onClick={() => (DEMO ? addFiles(1) : fileRef.current?.click())}><Icon name="upl" />ファイルをアップロード（{d.files}件）</button>
                  <input ref={fileRef} type="file" multiple hidden onChange={(x) => { const n = x.target.files?.length ?? 0; if (n) addFiles(n); x.target.value = ''; }} />
                </>
              )}
            </Field>
            <Field label="本文" req className="full" htmlFor="nt-bodytxt" err={e.body as string}>
              {ta(d.body, 'お知らせの本文を入力してください。改行はそのまま表示されます。', (v) => up({ body: v }), 'nt-bodytxt')}
            </Field>
          </div>
        </Sec>
        {anyMail && (
          <Sec title="メール設定">
            <div className="fg c2">
              <Field label="件名" req className="full" htmlFor="nt-subj" hint="既定値はタイトルと同じです。必要に応じて変更してください。送るときは先頭に「【ESステーション】」が付きます。">
                <input className="inp" id="nt-subj" placeholder="例）システムメンテナンス実施のお知らせ" disabled={dis} value={d.subj || d.title} onChange={(x) => up({ subj: x.target.value })} />
              </Field>
              <Field label="差出人" className="full" hint="設定値（システム管理が設定管理で変えます）"><input className="inp" disabled value={SENDER_DEFAULT} /></Field>
              <Field label="日時指定" req htmlFor="nt-mailat" err={e.mailAt as string}
                hint={suggest ? <>おすすめ：{fmtAuto(suggest)}（公開開始日の 8:00{corpTo ? '。法人・拠点あては土日祝なら前の営業日' : ''}）{!dis && !!d.mailAt && d.mailAt !== suggest && <> <button type="button" className="lnk u" onClick={() => up({ mailAt: suggest })}>おすすめの日時にする</button></>}</> : undefined}>
                <input className={`inp${e.mailAt ? ' err' : ''}`} id="nt-mailat" placeholder="yyyy-mm-dd HH:mm" disabled={dis} value={fmtAuto(d.mailAt || suggest || d.start)} onChange={(x) => up({ mailAt: toSlashIfDate(x.target.value) })} />
              </Field>
              <Field label="メール本文" req className="full" htmlFor="nt-mailbody" err={e.mailBody as string} hint="既定値はお知らせの本文と同じです。必要に応じて変更してください。">
                {ta(d.mailBody, '例）本メールは送信専用です。ご不明な点は担当者までご連絡ください。', (v) => up({ mailBody: v }), 'nt-mailbody')}
              </Field>
              <Field label="署名欄" className="full" htmlFor="nt-sign" hint="既定値は設定値（システム管理が設定管理で変えます）。このお知らせだけ変えるときは直してください。">
                <textarea className="inp" id="nt-sign" rows={5} maxLength={500} disabled={dis} style={{ height: 'auto', padding: '0.571429rem 0.857143rem', resize: 'vertical' }} value={d.sign ?? SIGN_DEFAULT} onChange={(x) => up({ sign: x.target.value })} />
              </Field>
            </div>
          </Sec>
        )}
        {!isNew && data?.sendLog?.length ? (
          <Sec title="送信の記録">
            {data.mailOnly && <p className="hint" style={{ margin: '0 0 0.571429rem' }}>メールだけのお知らせです（どのサイトにも表示しません。課題 5-4）。</p>}
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>日時</th><th>操作</th><th>宛先・表示先</th><th>内容</th></tr></thead>
                <tbody>{data.sendLog.slice().reverse().map((l, i) => <tr key={i}><td className="es-num">{fmtAuto(l.at)}</td><td>{l.kind}</td><td>{l.to}</td><td>{fmtDatesIn(l.note)}</td></tr>)}</tbody>
              </table>
            </div>
          </Sec>
        ) : null}
      </div>
    </>
  );
}

/** 個別選択（元：ntPickModal） */
function PickModal({ k, init, onOk }: { k: string; init: string[]; onOk: (picks: string[]) => void }) {
  const { closeModal } = useOps();
  const pk = NT_PICK[k];
  const [sel, setSel] = useState(() => new Set(init));
  const [qIn, setQIn] = useState('');
  const [q, setQ] = useState('');
  const rows = pk.rows.filter((r) => !q || r.join(' ').includes(q));
  const toggle = (id: string, on: boolean) => setSel((s) => { const n = new Set(s); if (on) n.add(id); else n.delete(id); return n; });
  return (
    <div className="ov">
      <div className="mbox" role="dialog" aria-modal="true" aria-label={`${LBL(k)} の個別選択`} style={{ width: 'min(61.428571rem,100%)' }}>
        <div className="mbox-h"><h3>{LBL(k)} の個別選択</h3><button className="icon-btn" aria-label="閉じる" onClick={closeModal}><Icon name="x" /></button></div>
        <div className="mbox-b">
          <div style={{ display: 'flex', gap: '0.571429rem', marginBottom: '0.857143rem' }}>
            <input className="inp" placeholder={pk.ph} value={qIn} onChange={(x) => setQIn(x.target.value)} />
            <button className="btn out" onClick={() => { setQIn(''); setQ(''); }}>クリア</button>
            <button className="btn pri" onClick={() => setQ(qIn)}>検索</button>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th style={{ width: '2.857143rem' }}><input type="checkbox" aria-label="すべて選択" checked={!!rows.length && rows.every((r) => sel.has(r[0]))} onChange={(x) => rows.forEach((r) => toggle(r[0], x.target.checked))} /></th>
                  {pk.cols.map((c) => <th key={c}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r[0]}>
                    <td><input type="checkbox" checked={sel.has(r[0])} aria-label={r[r.length - 1]} onChange={(x) => toggle(r[0], x.target.checked)} /></td>
                    {r.map((c, i) => <td key={i} className={i === 0 ? 'mono' : ''}>{c}</td>)}
                  </tr>
                ))}
                {!rows.length && <tr><td colSpan={5} className="empty">該当するデータがありません。</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mbox-f" style={{ justifyContent: 'space-between' }}>
          <span>選択済み：<b>{sel.size}</b>件</span>
          <span style={{ display: 'flex', gap: '0.571429rem' }}>
            <button className="btn out" onClick={closeModal}>キャンセル</button>
            <button className="btn pri" onClick={() => { onOk([...sel]); closeModal(); }}>選択を確定</button>
          </span>
        </div>
      </div>
    </div>
  );
}
