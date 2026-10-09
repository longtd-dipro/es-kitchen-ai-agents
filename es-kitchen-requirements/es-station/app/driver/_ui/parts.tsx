'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { DEMO } from '@/lib/demo';
import { ES_TEL } from '@/lib/driver/seed';
import { winTxt } from '@/lib/driver/logic';
import type { DelType, DeliveryView, PointView, Trouble } from '@/lib/driver/types';
import { hasUnsavedChanges, LEAVE_MSG } from '@/lib/ui/leaveGuard';
import { Icon } from './Icon';
import { useDriver } from './DriverProvider';
import { driverCls } from '@/lib/format/status';

/* ドライバーの共通部品（元の topB・tabbar・badges・ptCard・delCard・dcard・banner・trBox・info・docs・cb・steps・drop・stepper・modal） */

export const IMG = (k: string) => `/driver/${k}.jpg`;

/** 入力の途中で離れるときの確認（lib/ui/leaveGuard を見る） */
export function DiscardDialog({ onOk }: { onOk: () => void }) {
  const { closeModal } = useDriver();
  return (
    <Modal>
      <img src={IMG('girl')} alt="" style={{ width: '10.714286rem' }} />
      <h3>{LEAVE_MSG.title}</h3>
      <p>{LEAVE_MSG.text}</p>
      <button type="button" className="btn pri" onClick={() => { closeModal(); onOk(); }}>{LEAVE_MSG.ok}</button>
      <button type="button" className="btn sec" onClick={closeModal}>{LEAVE_MSG.cancel}</button>
    </Modal>
  );
}

/** 画面の移動（保存していない入力があれば確認を出す） */
export function useNav() {
  const router = useRouter();
  const { openModal } = useDriver();
  const guard = useCallback((go: () => void) => (hasUnsavedChanges() ? openModal(<DiscardDialog onOk={go} />) : go()), [openModal]);
  return {
    router,
    guard,
    go: (href: string) => guard(() => router.push(href)),
    replace: (href: string) => guard(() => router.replace(href)),
    /** 元の back()（履歴がなければホーム） */
    back: (fallback = '/driver') => guard(() => (window.history.length > 1 ? router.back() : router.push(fallback))),
  };
}

/** 入力の途中で再読み込み・タブを閉じるときの確認 */
export function useBeforeUnload(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const f = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', f);
    return () => window.removeEventListener('beforeunload', f);
  }, [dirty]);
}

/** 画面の上の帯（元の topB）。trouble＝右上のボタンで報告する対象（'pt:…'・'d:…'。null は対象を選ぶ。false は出さない） */
export function TopBar({ title, noBack, onBack, trouble = null }: { title: string; noBack?: boolean; onBack?: () => void; trouble?: string | null | false }) {
  const nav = useNav();
  return (
    <div className="topbar">
      {!noBack && <button type="button" className="rb l" aria-label="戻る" onClick={onBack ?? (() => nav.back())}><Icon name="back" /></button>}
      <h2>{title}</h2>
      {trouble !== false && (
        <button type="button" className="rb r" aria-label="この配送のトラブルを報告" onClick={() => nav.go(trouble ? `/driver/trouble?target=${encodeURIComponent(trouble)}&ret=1` : '/driver/trouble')}>
          <Icon name="siren" />
        </button>
      )}
    </div>
  );
}

export const TABS: [string, string, string, string][] = [
  ['home', 'home', 'ホーム', '/driver'], ['truck', 'list', '配送一覧', '/driver/list'], ['trash', 'stock', '廃棄・棚卸し', '/driver/stock'],
  ['siren', 'trouble', 'トラブル', '/driver/trouble'], ['user', 'account', 'アカウント', '/driver/account'],
];
/** 下のタブ（スマホ。900px 以上は左のメニュー） */
export function TabBar({ on }: { on: string }) {
  const nav = useNav();
  return (
    <nav className="tabbar">
      {TABS.map(([i, s, l, href]) => (
        <button type="button" key={s} className={on === s ? 'on' : ''} onClick={() => nav.go(href)}><Icon name={i} />{l}</button>
      ))}
    </nav>
  );
}

/** 状態のバッジ（色は全サイト共通の表 lib/format/status.ts） */
export const Badge = ({ s }: { s: string }) => <span className={`badge ${driverCls(s)}`}>{s}</span>;
/** 状態とトラブルの印・未送信（RV-DRIVER-20261002 D-d・D-e） */
export function Badges({ o }: { o: { status: string; tr: Trouble[]; unsent?: boolean } }) {
  const open = o.tr.some((t) => !t.resolved);
  return (
    <span className="bdg">
      <Badge s={o.status} />
      {open ? <Badge s="トラブルあり" /> : o.tr.length ? <span className={`badge ${driverCls('解決済')}`}>トラブル解決済</span> : null}
      {o.unsent && <Badge s="未送信" />}
    </span>
  );
}
export const Av = ({ t }: { t: DelType | 'wh' | 'hub' }) => <div className="av" style={{ backgroundImage: `url(${IMG(t === 'hub' ? 'wh' : t)})` }} />;
const nb = (n: number | null) => (n == null ? '—' : n);
export function Nums({ d }: { d: Pick<DeliveryView, 'boxes' | 'fr' | 'fz'> }) {
  return <div className="nums"><span><Icon name="box" s /><b>{d.boxes}</b>箱</span><span><Icon name="fridge" s /><b>{nb(d.fr)}</b>食</span><span><Icon name="snow" s /><b>{nb(d.fz)}</b>食</span></div>;
}
const sumN = (a: (number | null)[]) => (a.some((x) => x == null) ? null : a.reduce<number>((x, y) => x + (y ?? 0), 0));
export function PtNums({ dels }: { dels: DeliveryView[] }) {
  return (
    <div className="nums">
      <span><Icon name="bld" s /><b>{dels.length}</b>社</span><span><Icon name="box" s /><b>{dels.reduce((x, d) => x + d.boxes, 0)}</b>箱</span>
      <span><Icon name="fridge" s /><b>{nb(sumN(dels.map((d) => d.fr)))}</b>食</span><span><Icon name="snow" s /><b>{nb(sumN(dels.map((d) => d.fz)))}</b>食</span>
    </div>
  );
}
const HubTag = ({ p }: { p: PointView }) => (p.type === 'hub' ? <> <span className="tag">中継先</span></> : null);

/** 受取地点のカード（元の ptCard） */
export function PtCard({ p, dels, extra, onClick, radio }: { p: PointView; dels: DeliveryView[]; extra?: ReactNode; onClick: () => void; radio?: boolean | null }) {
  return (
    <button type="button" className="card" onClick={onClick}>
      <div className="chead"><Av t="wh" /><h4>{p.name}{radio == null && <HubTag p={p} />}</h4><Badges o={p} />{radio != null && <span className={`radio ${radio ? 'on' : ''}`} />}</div>
      {extra}
      <div className="meta"><Icon name="pin" s />{p.addr || '—'}</div>
      {p.code && radio == null && <div className="meta"><Icon name="bld" s />{p.type === 'hub' ? '営業所コード' : '倉庫コード'} {p.code}</div>}
      <PtNums dels={dels} />
    </button>
  );
}

/** 配送のカード（元の delCard） */
export function DelCard({ d, pt, date, radio, onClick }: { d: DeliveryView; pt?: PointView; date?: string; radio?: boolean; onClick: () => void }) {
  return (
    <button type="button" className={`card ${d.type === 'cool' ? 'cool' : ''}`} onClick={onClick}>
      <div className="chead"><Av t={d.type} /><h4>{d.name}</h4><Badges o={d} />{radio != null && <span className={`radio ${radio ? 'on' : ''}`} />}</div>
      {d.later ? <div className="meta" style={{ color: '#b45309' }}><Icon name="cal" s />納品 {d.later}（今日は受取だけ）</div> : date ? <div className="meta"><Icon name="cal" s />{date}</div> : null}
      <div className="meta"><Icon name="list" s />配送No {d.no}</div>
      <div className="meta"><Icon name="wh" s />{pt?.name ?? '—'}</div>
      <div className="meta"><Icon name="pin" s />{d.addr || '—'}</div>
      <div className="meta"><Icon name="clock" s />受取時間帯 {winTxt(d)}</div>
      {d.cond && <div className="meta"><Icon name="info" s />納品条件：{d.cond}</div>}
      {d.eta && <div className="meta eta"><Icon name="truck" s />到着予定 {d.eta.join('〜')}（共有済み）</div>}
      {d.alt && <div className="meta" style={{ color: '#b45309' }}><Icon name="info" s />代替品あり（{d.alt}）・納品備考を確認</div>}
      <Nums d={d} />
    </button>
  );
}

/** 詳細の上の札（元の dcard） */
export function DCard({ d, date }: { d: DeliveryView; date: string }) {
  return (
    <div className={`dcard ${d.type}`}>
      <div className="row1"><Av t={d.type} /><h3>{d.name}</h3></div>
      <div className="meta"><Icon name="list" s />配送No {d.no}</div>
      <div className="row2"><span style={{ display: 'flex', gap: '0.428571rem', alignItems: 'center' }}><Icon name="cal" s />{date}</span><Badges o={d} /></div>
    </div>
  );
}

/** 完了の帯（オフラインで端末に保存したときは黄色。元の banner） */
export function Banner({ t, s, o }: { t: string; s: string; o?: { unsent?: boolean } }) {
  if (o?.unsent) return <div className="banner warn"><b><Icon name="cloud" />端末に保存しました（未送信）。電波が戻ると送ります</b><span>{t}{s ? '　' + s : ''}</span></div>;
  return <div className="banner"><b><Icon name="ok" />{t}</b><span>{s}</span></div>;
}

/** トラブルの報告（未解決・解決済み。元の trBox） */
export function TrBox({ o }: { o: { tr: Trouble[] } }) {
  if (!o.tr.length) return null;
  const open = o.tr.some((t) => !t.resolved);
  return (
    <div className={`trbox ${open ? '' : 'done'}`}>
      <b><Icon name="siren" s />{open ? 'トラブル報告済み（運営の確認待ち）' : 'トラブル報告（解決済み）'}</b>
      {o.tr.map((t) => (
        <span key={t.id}>{t.at}　{t.raw}{t.auto ? '（自動）' : ''}{t.note ? `：${t.note}` : ''}{t.resolved && <> <span className={`badge ${driverCls('解決済')}`}>解決済み{t.resAt ? ' ' + t.resAt : ''}</span></>}</span>
      ))}
    </div>
  );
}

/** 納品先情報（元の info） */
export function Info({ d }: { d: DeliveryView }) {
  const r = (k: string, v: ReactNode) => <div className="r"><span className="k">{k}:</span><span>{v}</span></div>;
  return (
    <>
      <div className="h3">納品先情報</div>
      <div className="info">
        {r('納品先', d.name)}{r('郵便番号', d.zip || '—')}{r('住所', d.addr || '—')}{r('担当者', d.person || '—')}{r('電話番号', d.tel || '—')}
        {r('受取時間帯', d.win.length ? d.win.map((w, i) => <span key={i}>{i > 0 && <br />}{w.join('〜')}</span>) : '—')}
        {r('納品条件', d.cond || '—')}
        {d.note && <div className="r" style={{ gridTemplateColumns: '1fr' }}><span className="k">納品備考:</span><div className="memo"><span className="dot">!</span><span style={{ whiteSpace: 'pre-line' }}>{d.note}</span></div></div>}
      </div>
    </>
  );
}

/** 委託業者向けの資料（自社のスタッフには出さない。RV-DRIVER-20261002 D-h） */
export function Docs({ docs, own }: { docs: string[]; own: boolean }) {
  const { toast } = useDriver();
  if (own) return null;
  return (
    <>
      <div className="h3">資料（委託業者向け）</div>
      <div className="info">
        {docs.length ? docs.map((n) => (
          <div key={n} className="r" style={{ gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
            <span><Icon name="list" s /> {n}</span><button type="button" className="mini" onClick={() => toast(DEMO ? `${n} を開きました（デモ）` : `${n} はまだつないでいません（資料のファイルがありません）`)}>開く</button>
          </div>
        )) : <div className="muted" style={{ padding: '0.285714rem 0' }}>この地点の資料はありません。</div>}
        <div className="muted" style={{ fontSize: '0.857143rem' }}>拠点・中継先マスタの「委託業者向け」資料です。</div>
      </div>
    </>
  );
}

/** チェックボックス（元の cb・cbv） */
export function Cb({ on, onClick, dis }: { on: boolean; onClick?: () => void; dis?: boolean }) {
  return (
    <button type="button" className={`cb ${on ? 'on' : ''} ${dis ? 'dis' : ''}`} disabled={dis} aria-pressed={on} aria-label="確認"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}>
      {on && <Icon name="check" />}
    </button>
  );
}
export const Cbv = ({ on }: { on: boolean }) => <span className={`cb ${on ? 'on' : ''}`}>{on && <Icon name="check" />}</span>;
/** 押せる範囲を広くした行・チェック（RV-DRIVER-20261002：行全体・Enter・Space） */
export const tapProps = (fn: (() => void) | null) => (fn ? {
  role: 'button', tabIndex: 0, onClick: fn,
  onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } },
} : {});
export function Chk({ on, label, onClick, style }: { on: boolean; label: string; onClick: () => void; style?: React.CSSProperties }) {
  return <span className="chk" style={style} {...tapProps(onClick)}><Cbv on={on} />{label}</span>;
}

/** ES配送便のステップ（元の steps）。集金のステップは集金ありの拠点だけ（なければ「完了」。課題 4-2） */
export function Steps({ cur, cash = true }: { cur: number; cash?: boolean }) {
  return (
    <div className="steps">
      {['陳列前', '在庫/廃棄', '陳列', '陳列後', cash ? '集金登録' : '完了'].map((l, i) => (
        <div key={l} className={`st ${i < cur ? 'ok' : i === cur ? 'on' : ''}`}><span className="o">{i < cur ? <Icon name="check" s /> : i + 1}</span>{l}</div>
      ))}
    </div>
  );
}

/** 写真の追加（ファイル選択・サンプル写真。元の drop） */
export function Drop({ photos, onAdd, onRemove }: { photos: string[]; onAdd: (urls: string[]) => void; onRemove: (i: number) => void }) {
  const pick = (files: FileList | null) => {
    if (!files) return;
    [...files].forEach((file) => {
      const r = new FileReader();
      r.onload = () => onAdd([String(r.result)]);
      r.readAsDataURL(file);
    });
  };
  return (
    <div className="drop">
      {photos.length ? (
        <div className="thumbs">{photos.map((p, i) => <div key={i} style={{ backgroundImage: `url(${p})` }}><button type="button" aria-label="削除" onClick={() => onRemove(i)}><Icon name="x" s /></button></div>)}</div>
      ) : (
        <>
          <svg width="150" height="84" viewBox="0 0 150 84" aria-hidden="true"><g fill="#fff" stroke="#9aa3ad" strokeWidth="1.5"><rect x="8" y="10" width="54" height="62" transform="rotate(-8 35 41)" /><rect x="88" y="10" width="54" height="62" transform="rotate(8 115 41)" /><rect x="45" y="6" width="60" height="68" /></g><path d="M75 28v26M62 41h26" stroke="#b5bcc6" strokeWidth="2" /><circle cx="126" cy="26" r="4" fill="#b5bcc6" /></svg>
          <div className="muted">写真はまだありません</div>
        </>
      )}
      <label className="btn dark" style={{ display: 'flex' }}><Icon name="upload" />ファイル選択<input type="file" accept="image/*" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ''; }} /></label>
      <button type="button" className="samp" onClick={() => onAdd([IMG(Math.random() < 0.5 ? 'photo' : 'photo2')])}>サンプル写真を追加</button>
    </div>
  );
}
/** 写真は6枚まで */
export const addPhotos = (arr: string[], urls: string[]) => [...arr, ...urls].slice(0, 6);

export const Help = () => <p className="hint" style={{ margin: 0 }}>※ご不明な点は弊社代表番号で、緊急連絡先の「{ES_TEL}」までお願いします。</p>;

/** 数の増減（元の stepper。押せる範囲 44px） */
export function Stepper({ val, onStep, ro }: { val: number; onStep?: (dv: number) => void; ro?: boolean }) {
  if (ro || !onStep) return <span className="stp"><span className="v ro">{val}</span></span>;
  return (
    <span className="stp">
      <button type="button" aria-label="減らす" onClick={() => onStep(-1)}><Icon name="minus" s /></button>
      <span className="v">{val}</span>
      <button type="button" aria-label="増やす" onClick={() => onStep(1)}><Icon name="plus" s /></button>
    </span>
  );
}

/** モーダル（元の .ov .modal。sheet＝下から出るシート。背景を押すと閉じる） */
export function Modal({ children, sheet, onBack }: { children: ReactNode; sheet?: boolean; onBack?: () => void }) {
  return (
    <div className={`ov ${sheet ? 'sheet-ov' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onBack?.(); }}>
      <div className={`modal ${sheet ? 'fsheet' : ''}`} role="dialog" aria-modal="true">{children}</div>
    </div>
  );
}
export function ModalClose() {
  const { closeModal } = useDriver();
  return <button type="button" className="rb x" aria-label="閉じる" onClick={closeModal}><Icon name="x" /></button>;
}
/** 「ESへ電話する」（発信は端末の電話。デモはお知らせだけ） */
export function TelButton() {
  const { toast } = useDriver();
  return <button type="button" className="btn pri" onClick={() => toast(`${ES_TEL} へお電話ください（発信した記録は運営に残ります）`)}>ESへ電話する（{ES_TEL}）</button>;
}

/** ホームの上（ロゴ・トラック・あいさつ・お知らせのベル。元の hhead） */
export function HHead({ name, unread }: { name: string; unread: boolean }) {
  const nav = useNav();
  return (
    <div className="hhead">
      <img className="logo" src={IMG('logo')} alt="ES STATION" />
      <img className="truck" src={IMG('truck')} alt="" />
      <div className="bubble"><em>{name}</em> さん、<br />安全運転で<br />いってらっしゃいませ。</div>
      <button type="button" className="bell" aria-label="お知らせ" onClick={() => nav.go('/driver/news')}><Icon name="bell" />{unread && <i />}</button>
    </div>
  );
}

/** 読み込み中・見つからない */
export const Loading = () => <div className="scroll pad"><p className="muted center">読み込み中…</p></div>;
export function NotFound({ text }: { text: string }) {
  const nav = useNav();
  return <div className="scroll pad stack"><div className="empty">{text}</div><button type="button" className="btn sec" onClick={() => nav.go('/driver')}>ホームに戻る</button></div>;
}

/** 二度押しで二重に送らない（RV3-DRIVER-20261002 ①）。送っている間は busy */
export function useRun() {
  const { toastError } = useDriver();
  const [busy, setBusy] = useState(false);
  const ref = useRef(false);
  const run = useCallback(async (fn: () => Promise<unknown>) => {
    if (ref.current) return;
    ref.current = true; setBusy(true);
    try { await fn(); } catch (e) { toastError(e); } finally { ref.current = false; setBusy(false); }
  }, [toastError]);
  return [busy, run] as const;
}

/** 「ESキッチンへ連絡済み」にチェックしてから押す確認（元の recv・cool・disp のモーダル） */
/** 納品日より前に納品するときの確認（理由が要る・課題 4-1） */
export function EarlyModal({ date, onOk }: { date: string; onOk: (reason: string) => Promise<unknown> | void }) {
  const { closeModal } = useDriver();
  const [why, setWhy] = useState('');
  const [busy, run] = useRun();
  return (
    <Modal onBack={closeModal}>
      <ModalClose />
      <img src={IMG('boxes')} alt="" />
      <h3>納品日（{date}）より前です</h3>
      <p>今日納品してよいか、納品先・ESキッチンに確認してください。<br />前に納品する理由を入れてください（運営に記録されます）。</p>
      <textarea className="textarea" aria-label="前に納品する理由" placeholder="例）納品先から前日の納品を頼まれた" maxLength={200} value={why} onChange={(e) => setWhy(e.target.value)} />
      <button type="button" className="btn pri" disabled={!why.trim() || busy} onClick={() => run(async () => { await onOk(why.trim()); closeModal(); })}>確認して納品する</button>
      <button type="button" className="btn sec" onClick={closeModal}>キャンセル</button>
    </Modal>
  );
}

export function AckModal({ title, text, ack, okLabel, onOk }: { title: string; text: ReactNode; ack: string; okLabel: string; onOk: () => Promise<unknown> | void }) {
  const { closeModal } = useDriver();
  const [on, setOn] = useState(false);
  const [busy, run] = useRun();
  return (
    <Modal onBack={closeModal}>
      <ModalClose />
      <img src={IMG('boxes')} alt="" />
      <h3>{title}</h3>
      <p>{text}</p>
      <Chk on={on} label={ack} onClick={() => setOn(!on)} />
      <TelButton />
      <button type="button" className="btn soft" disabled={!on || busy} onClick={() => run(async () => { await onOk(); closeModal(); })}>{okLabel}</button>
      <button type="button" className="btn sec" onClick={closeModal}>キャンセル</button>
    </Modal>
  );
}

/** 受け取っていない配送の下の帯（D-a） */
export function NrFoot() {
  return (
    <div className="foot" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.571429rem' }}>
      <p className="nrmsg"><Icon name="info" s />荷物を受け取っていません。受取地点で受け取ってから配送してください。</p>
      <button type="button" className="btn pri" disabled>完了</button>
    </div>
  );
}
