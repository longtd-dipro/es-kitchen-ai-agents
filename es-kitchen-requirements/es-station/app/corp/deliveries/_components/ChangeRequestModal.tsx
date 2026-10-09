'use client';

import { useCallback, useState } from 'react';
import { areaApi } from '@/lib/ops/core/client';
import corpDelivery from '@/lib/corp/areas/corp-delivery';
import { checkDates, checkReason, md, mdW, ymdW } from '@/lib/corp/delivery/logic';
import type { CalCell, CorpDelivery } from '@/lib/corp/delivery/types';
import { useCorpSignedIn } from '../../_ui/CorpProvider';
import { useLeaveGuard } from '@/lib/ui/leaveGuard';
import { Button, ConfirmDialog, cx, EsIcon, InlineMessage, useEsc, useWho } from '../../_delivery/kit';

/*
 * お届け日の変更を申請（版1.1・CW_DLV No.22〜22.14・23・23.1）。2ステップ：
 *   ① 日を選ぶ：ご利用月（サイクル）の月のカレンダー（月曜始まり・7列）で日を押す（1つ目＝第一希望・2つ目＝第二希望）か「希望日なし」→「次へ」（日のエラー E02・E300・E301）
 *   ② 理由と確認：選んだ日の確認＋理由（500文字・複数行）→「申請する」（理由のエラー E01・E04・E13）
 * 「戻る」で①に戻っても選んだ日・理由は残る。入力を変えたあとに閉じる・外を押す・Esc は Q02。
 */
const api = areaApi(corpDelivery);
type D = CorpDelivery & { siteName: string; contact: { name: string; tel: string } | null; cal: CalCell[][] };
const WD = ['月', '火', '水', '木', '金', '土', '日'];

export default function ChangeRequestModal({ d, onClose }: { d: D; onClose: () => void }) {
  const { toast, toastError, view } = useCorpSignedIn();
  const who = useWho();
  const [step, setStep] = useState<1 | 2>(1);
  const [any, setAny] = useState(false);
  const [picks, setPicks] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [errDate, setErrDate] = useState<string | undefined>();
  const [errReason, setErrReason] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  const [ask, setAsk] = useState(false);
  const dirty = any || picks.length > 0 || reason !== '';
  /* 入力中にサイドメニュー・ブラウザを閉じる／再読み込みで離れるときも確認する（受付簿 No.89・Q02・全サイト共通） */
  useLeaveGuard(dirty);
  /* 閉じる（22.1・22.9・外・Esc）：入力を変えていれば Q02 */
  const close = useCallback(() => { if (busy) return; if (dirty) setAsk(true); else onClose(); }, [busy, dirty, onClose]);
  useEsc(close, !ask);

  const toggle = (iso: string) => {
    setErrDate(undefined);
    setPicks((p) => (p.includes(iso) ? p.filter((x) => x !== iso) : p.length < 2 ? [...p, iso] : [p[0], iso]));
  };
  const how = any ? 'any' : 'pick';
  const args = { how, first: any ? undefined : picks[0], second: any ? undefined : picks[1] } as const;
  /* ステップ①「次へ」：日の確認（希望日なしなら確認なし） */
  const next = () => {
    const e = checkDates(args, d.cal);
    setErrDate(e);
    if (!e) setStep(2);
  };
  /* ステップ②「申請する」：理由の確認 → 申請 */
  const submit = async () => {
    const e = checkReason(reason);
    setErrReason(e);
    if (e) { document.getElementById('r1')?.focus(); return; }
    setBusy(true);
    try {
      const r = await api.action('requestDateChange', { ...who, ro: view === 'ro', id: d.id, ...args, reason });
      onClose();
      toast(r.msg);
    } catch (x) { toastError(x); } finally { setBusy(false); }
  };

  const deadline = d.deadline ? md(d.deadline.replace(/\//g, '-')) : '';
  const helper = d.contact ? `ESキッチンからお電話で確認することがあります（申請者：${d.contact.name} ・ ${d.contact.tel}）` : 'ESキッチンからお電話で確認することがあります';
  const range = d.cycleRange ? `${d.cycle}（${md(d.cycleRange.from)}〜${md(d.cycleRange.to)}）` : d.cycle;
  const wants = any ? '希望日なし（ESキッチンにおまかせ）' : `第一希望 ${picks[0] ? ymdW(picks[0]) : ''}${picks[1] ? `・第二希望 ${ymdW(picks[1])}` : ''}`;
  return (
    <div className="demo-ov" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="demo-mbox" data-m="CorpChangeRequest">
        <div className="demo-mroot">
          <div className="es-dialog es-dialog--inline" style={{ height: '100%' }}>
            <div className="es-dialog__panel" role="dialog" aria-modal="true" aria-label="お届け日の変更を申請">
              <div className="es-dialog__head">
                <h2>お届け日の変更を申請<span className="es-mono es-dialog__id">{d.id}</span></h2>
                <button type="button" className="es-dialog__close" aria-label="閉じる" onClick={close}><EsIcon name="X" size={22} /></button>
              </div>
              <div className="es-dialog__body es-dialog__body--flush">
                <div className="mdl-b">
                  {/* 22.11 ステップの表示 */}
                  <ol className="steps" aria-label="手順">
                    <li className={cx(step === 1 && 'is-current', step > 1 && 'is-done')}><span className="steps__n">①</span>日を選ぶ</li>
                    <li className="steps__arrow" aria-hidden="true"><EsIcon name="CaretRight" size={16} /></li>
                    <li className={cx(step === 2 && 'is-current')}><span className="steps__n">②</span>理由と確認</li>
                  </ol>

                  {step === 1 ? (
                    <>
                      <InlineMessage tone="info" title={`承認されるまでは、今のお届け日（${md(d.dateIso)}）のままです`}>
                        ESキッチンが確認して、承認・別の日のご提案・お断りのいずれかでお返事します（処理期限：ご注文・変更の締切 {deadline}）。同じ日に冷凍・常温のお届けがある場合は、一緒に動きます。
                      </InlineMessage>
                      {/* 22.3 希望日なし */}
                      <label className="es-check">
                        <input type="checkbox" checked={any} onChange={(e) => { setAny(e.target.checked); setErrDate(undefined); if (e.target.checked) setPicks([]); }} />
                        <span className="es-check__box" aria-hidden="true" /><span>希望日なし（ESキッチンにおまかせ）</span>
                      </label>
                      {/* 22.4 カレンダー */}
                      <div className="es-field">
                        <div className="lbl">変更したい日（1つ目を押すと第一希望、2つ目で第二希望）</div>
                        {/* 選べる日の範囲がないとき（ご利用月の情報がない）は、日の代わりに案内を出す。「希望日なし」では申請できる */}
                        {d.cal.length === 0 && <InlineMessage tone="warning" title="日を選べる範囲がありません。">「希望日なし」で申請するか、ESキッチンへお問い合わせください。</InlineMessage>}
                        <div className={cx('cal', any && 'is-off')} hidden={d.cal.length === 0}>
                          <div className="cal__month">{range}</div>
                          <div className="cal__grid" role="grid" aria-label={range}>
                            {WD.map((w) => <div key={w} className="cal__wd" role="columnheader">{w}</div>)}
                            {d.cal.flat().map((x) => {
                              const n = any ? -1 : picks.indexOf(x.iso);
                              const st = x.dis ? 'dis' : n === 0 ? 'pick' : n === 1 ? 'on' : 'off';
                              const tip = x.tip || (n === 0 ? '第一希望' : n === 1 ? '第二希望' : '');
                              return (
                                <button key={x.iso} type="button" role="gridcell" className={cx('es-slot', 'es-slot--' + st, x.cur && 'es-slot--cur')} disabled={x.dis || any} aria-pressed={n >= 0} aria-label={`${ymdW(x.iso)}${tip ? `（${tip}）` : ''}`} title={tip || undefined} onClick={() => toggle(x.iso)}>
                                  <span>{x.day}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        {errDate && <p className="es-field__msg es-field__msg--error" role="alert">{errDate}</p>}
                      </div>
                      {/* 22.5 凡例・22.6 範囲の説明 */}
                      <div className="legend">
                        <span><i className="sw" style={{ background: 'var(--primary)', borderColor: 'var(--primary)' }} />第一希望{picks[0] ? `（${md(picks[0])}）` : ''}</span>
                        <span><i className="sw" style={{ background: 'var(--neutral-800)', borderColor: 'var(--neutral-800)' }} />第二希望{picks[1] ? `（${md(picks[1])}）` : ''}</span>
                        <span><i className="sw sw--cur" />今のお届け日（{md(d.dateIso)}）</span>
                        <span><i className="sw" style={{ background: 'var(--surface-disabled)' }} />選べない日（灰色：別の半分・休日・お届けできない曜日）</span>
                      </div>
                      {d.window?.note && <div className="note">{d.window.note}</div>}
                    </>
                  ) : (
                    <>
                      {/* 22.14 選んだ日の確認 */}
                      <div className="confirm">
                        <div className="confirm__row"><span className="k">今のお届け日</span><b>{ymdW(d.dateIso)}</b><EsIcon name="CaretRight" size={16} /><b>{wants}</b></div>
                        <div className="note">処理期限：ご注文・変更の締切 {deadline}。日を変えたいときは「戻る」を押してください。</div>
                      </div>
                      {/* 22.7 理由 */}
                      <div className={cx('es-field', errReason && 'es-field--error')}>
                        <label className="es-field__label" htmlFor="r1">理由<span className="es-field__req" aria-hidden="true">*</span></label>
                        <div className="es-input es-input--md es-input--area">
                          <textarea id="r1" rows={4} value={reason} placeholder={`例）${md(d.dateIso)} は全館の設備点検で、荷受けができないため`} aria-required="true" aria-invalid={errReason ? true : undefined}
                            onChange={(e) => { setReason(e.target.value); if (errReason) setErrReason(undefined); }} />
                        </div>
                        <p className="es-field__msg">{helper}</p>
                        {errReason && <p className="es-field__msg es-field__msg--error" role="alert">{errReason}</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="es-dialog__foot">
                {/* 22.8 対象のお届け（①・②の両方） */}
                <b>{d.siteName} ・ {mdW(d.dateIso)}{d.temp} ・ {d.cycle}</b>
                <Button variant="outline" size="lg" onClick={close} disabled={busy}>キャンセル</Button>
                {step === 1 ? (
                  <Button size="lg" onClick={next}>次へ</Button>
                ) : (
                  <>
                    <Button variant="outline" size="lg" onClick={() => setStep(1)} disabled={busy}>戻る</Button>
                    <Button size="lg" onClick={submit} disabled={busy}>申請する</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {ask && (
        <ConfirmDialog title="編集中の内容は保存されません。" body={['編集内容を破棄してもよろしいですか？']} ok="破棄" onOk={onClose} onCancel={() => setAsk(false)} />
      )}
    </div>
  );
}
