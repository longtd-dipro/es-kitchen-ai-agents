'use client';

import { useState } from 'react';
import { useDomainQuery } from '@/lib/domain/client';
import { INTRO_MAX, type SurveyForm } from '@/lib/domain/survey';
import { Ro } from '../../_general/parts';
import { useOps } from '../../_ui/OpsProvider';
import { Field } from '../../_ui/ui';
import { PickDialog } from './PickDialog';
import { DateTimeInput, MiniPager, svApi } from './parts';

export type BasicForm = Omit<SurveyForm, 'questions'>;
const PER = 10;

/**
 * 基本情報の欄（Phase 1 画面 23・24。登録・編集・CSV取込 ② で同じ）。
 * ID・アンケート名・案内文（500文字）・回答開始／終了日時・リマインド通知（終了の N 日前に未回答者へ）・対象者数・配信対象（全員／個別選択）。
 * 配信対象はアプリの利用者だけ（2026/10/03 決定）。全員＝有効な拠点の利用中のアプリの利用者、個別選択＝利用者を法人・拠点で絞って選ぶ。
 * 個別選択は「選択する」でダイアログ、選んだ人は下の表（ID・ユーザー・法人・拠点）。answered を渡すと回答の列も出す
 */
export function BasicFields({ f, set, e, id, dis, lockStart, answered }: {
  f: BasicForm; set: (patch: Partial<BasicForm>) => void; e: Record<string, string>;
  id?: string; dis?: boolean; lockStart?: boolean; answered?: Set<string>;
}) {
  const { openModal } = useOps();
  const { data: aud } = useDomainQuery(svApi, 'audience', { target: f.target });
  const [page, setPage] = useState(1);
  const pick = () => openModal(<PickDialog init={f.target.picks} onOk={(picks) => { set({ target: { ...f.target, mode: 'pick', picks } }); setPage(1); }} />);
  const list = f.target.mode === 'pick' ? aud?.list ?? [] : [];

  return (
    <div className="fg c2">
      <Field label="アンケートID" className="full"><Ro v={id ?? ''} ph="登録すると自動で付きます" /></Field>
      <Field label="アンケート名" req className="full" htmlFor="sv-name" err={e.name}>
        <input className={`inp${e.name ? ' err' : ''}`} id="sv-name" placeholder="アンケート名（必須）" maxLength={100} disabled={dis} value={f.name} onChange={(x) => set({ name: x.target.value })} />
      </Field>
      <Field label="案内文（説明）" className="full" htmlFor="sv-intro" err={e.intro}>
        <textarea className="inp" id="sv-intro" rows={3} maxLength={INTRO_MAX} disabled={dis} value={f.intro} placeholder="回答画面の冒頭に表示されます。目的・所要時間・回答期限などを記載します。"
          onChange={(x) => set({ intro: x.target.value })} style={{ height: 'auto', padding: '0.571429rem 0.857143rem', resize: 'vertical' }} />
        <span className="hint" style={{ textAlign: 'right' }}>{f.intro.length}/{INTRO_MAX}</span>
      </Field>
      <Field label="回答開始日時" req htmlFor="sv-start" err={e.startAt} hint={lockStart && !dis ? '回答が始まったので変更できません' : undefined}>
        <DateTimeInput id="sv-start" label="回答開始日時" value={f.startAt} disabled={dis || lockStart} err={!!e.startAt} def="08:00" onChange={(v) => set({ startAt: v })} />
      </Field>
      <Field label="回答終了日時" req htmlFor="sv-end" err={e.endAt}>
        <DateTimeInput id="sv-end" label="回答終了日時" value={f.endAt} disabled={dis} err={!!e.endAt} def="18:00" onChange={(v) => set({ endAt: v })} />
      </Field>
      <Field label="リマインド通知" err={e.remind}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.571429rem', minHeight: '2.857143rem' }}>
          <input type="checkbox" checked={f.remind.on} disabled={dis} onChange={(x) => set({ remind: { ...f.remind, on: x.target.checked } })} />
          終了の
          <input className="inp" type="number" min={1} max={30} aria-label="リマインド通知の日数" style={{ width: '4.571429rem' }} disabled={dis || !f.remind.on} value={f.remind.days}
            onChange={(x) => set({ remind: { ...f.remind, days: Math.floor(Number(x.target.value)) || 0 } })} />
          日前に未回答者へ通知する
        </label>
      </Field>
      <Field label="対象者数"><Ro v={aud ? `${aud.count} 名` : '…'} /></Field>
      <Field label="配信対象" req className="full" err={e.target}>
        <div className="radios">
          <label><input type="radio" name="sv-mode" checked={f.target.mode === 'all'} disabled={dis} onChange={() => set({ target: { ...f.target, mode: 'all' } })} />全員</label>
          <label><input type="radio" name="sv-mode" checked={f.target.mode === 'pick'} disabled={dis} onChange={() => { set({ target: { ...f.target, mode: 'pick' } }); if (!f.target.picks.length) pick(); }} />個別選択</label>
          {!dis && f.target.mode === 'pick' && <button type="button" className="lnk u" onClick={pick}>選択する</button>}
        </div>
        {f.target.mode === 'all' && <span className="hint" style={{ paddingLeft: '0.571429rem' }}>有効な拠点（本登録・閉鎖予定で契約が有効）の、利用中のアプリユーザー全員に配信します（法人・拠点のアカウントには出しません）。</span>}
      </Field>
      {f.target.mode === 'pick' && (
        <div className="full">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th style={{ width: '9.285714rem' }}>ID</th><th>ユーザー</th><th>法人名</th><th>拠点</th>{answered && <th style={{ width: '6.428571rem' }}>回答</th>}</tr></thead>
              <tbody>
                {list.slice((page - 1) * PER, page * PER).map((w) => (
                  <tr key={`${w.type}:${w.id}`}>
                    <td className="mono">{w.id}</td><td>{w.name}</td><td>{w.corpName}</td><td>{w.branchName}</td>
                    {answered && <td>{answered.has(`${w.type}:${w.id}`) ? <span className="badge b-ok">回答済</span> : <span className="muted">未回答</span>}</td>}
                  </tr>
                ))}
                {!list.length && <tr><td colSpan={answered ? 5 : 4} className="empty">{aud ? 'まだ選んでいません。「選択する」から選んでください。' : '読み込み中…'}</td></tr>}
              </tbody>
            </table>
          </div>
          <MiniPager total={list.length} page={Math.min(page, Math.max(1, Math.ceil(list.length / PER)))} per={PER} onPage={setPage} />
        </div>
      )}
    </div>
  );
}
