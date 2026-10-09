'use client';

import { useState, type ReactNode } from 'react';
import { useOps } from '../../_ui/OpsProvider';
import { badgeCls } from '../../_ui/ui';
import { Icon } from '../../_ui/Icon';
import { fmtAutoNode } from '@/lib/format/date';
import { opsCls, statusGroup } from '@/lib/format/status';
import { rem } from '@/lib/ui/rem';
import { disp } from '@/lib/ops/purchasing/labels';

/* 発注・入荷の画面で共通の小さい部品 */

/** 状態の色（全サイト共通の表 lib/format/status.ts。表にない文字は元の色） */
export function cls(v: string) {
  if (statusGroup(v)) return opsCls(v);
  if (['記載通り', '照合済', '承認済'].includes(v)) return 'b-ok';
  if (['到着済（未処理）', '追加発注', '代理入力'].includes(v)) return 'b-info';
  if (['NG／ES要確認', 'キャンセル', '取消済', '差異あり', '受注不可'].includes(v)) return 'b-ng';
  if (['ES対応済', '未照合', '分納'].includes(v)) return 'b-warn';
  if (['未入庫', '未着（予定）'].includes(v)) return 'b-mute';
  return badgeCls(v);
}
export function B({ v, c, title }: { v: ReactNode; c?: string; title?: string }) {
  if (v === '' || v === null || v === undefined) return null;
  return <span className={`badge ${c ?? cls(String(v))}`} title={title}>{typeof v === 'string' ? disp(v) : v}</span>;
}
/** 「—」なら薄い字、それ以外はバッジ */
export const BD = ({ v }: { v: string }) => (v === '—' ? <span className="muted">—</span> : <B v={v} />);

export function Kv({ l, v, c = '' }: { l: ReactNode; v: ReactNode; c?: string }) {
  return <div className="kv"><small>{l}</small><b className={c}>{v === '' || v === undefined || v === null ? '—' : fmtAutoNode(v)}</b></div>;
}

/** 開け閉めできる区切り（元の sec） */
export function Sec({ title, children }: { title: ReactNode; children: ReactNode }) {
  const [closed, setClosed] = useState(false);
  return (
    <section className={`sec${closed ? ' closed' : ''}`}>
      <div className="sec-h">
        <h2>{title}</h2>
        <button className="tog" onClick={() => setClosed(!closed)} aria-label="開閉"><Icon name="up" /></button>
      </div>
      <div className="sec-b">{children}</div>
    </section>
  );
}

export function Sel({ value, opts, onChange, ph, id, disabled, err, className = 'sel', ariaLabel }: {
  value: string | number; opts: (string | [string | number, string])[]; onChange: (v: string) => void; ph?: string | null; id?: string; disabled?: boolean; err?: boolean; className?: string; ariaLabel?: string;
}) {
  return (
    <select className={`${className}${err ? ' err' : ''}`} id={id} value={String(value)} disabled={disabled} aria-label={ariaLabel} onChange={(e) => onChange(e.target.value)}>
      {ph !== null && ph !== undefined && <option value="">{ph}</option>}
      {opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return <option key={String(v)} value={String(v)}>{l}</option>; })}
    </select>
  );
}

/** 案内（ベル）。元の notice に ic('bell') のもの */
export function Info({ children, kind = '', style, icon }: { children: ReactNode; kind?: '' | 'warn' | 'ng'; style?: React.CSSProperties; icon?: string }) {
  return <div className={`notice ${kind}`} style={style}><Icon name={icon ?? (kind ? 'warn' : 'bell')} /><span>{children}</span></div>;
}

export { yen } from '../../_ui/ui';

/** モーダルの枠（見出しの右にボタンを足せる。元の mbox） */
export function Box({ title, width, head, children, footer, closable = true }: { title: ReactNode; width?: number; head?: ReactNode; children: ReactNode; footer?: ReactNode; closable?: boolean }) {
  const { closeModal } = useOps();
  return (
    <div className="ov" onClick={(e) => closable && e.target === e.currentTarget && closeModal()}>
      <div className="mbox" style={width ? { width: `min(${rem(width)},100%)` } : undefined} role="dialog" aria-modal="true">
        <div className="mbox-h">
          <h3>{title}</h3>
          {(head || closable) && (
            <div style={{ display: 'flex', gap: '0.571429rem' }}>
              {head}
              {closable && <button className="icon-btn" onClick={closeModal} aria-label="閉じる"><Icon name="x" /></button>}
            </div>
          )}
        </div>
        <div className="mbox-b">{children}</div>
        {footer && <div className="mbox-f">{footer}</div>}
      </div>
    </div>
  );
}
