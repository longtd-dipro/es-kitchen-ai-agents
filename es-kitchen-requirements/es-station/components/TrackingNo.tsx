'use client';

import { useState, type CSSProperties } from 'react';

/*
 * 送り状番号（全サイト共通・課題 0-2）。番号・コピーのボタン・運送会社の追跡ページへのリンク。
 * ヤマトの API は使わないので、配送の状況はヤマトの追跡ページで見てもらう（URL は lib/domain/tracking.ts の trackingUrlOf）。
 * 追跡ページが番号を受け取れないとき（形が違う番号）は、ページを開いてコピーした番号を貼ってもらう。
 */
export default function TrackingNo({ no, url, carrier = 'ヤマト運輸', btnClass = 'es-btn es-btn--outline es-btn--neutral es-btn--sm', style }: {
  no: string;
  url?: string;
  carrier?: string;
  btnClass?: string;
  style?: CSSProperties;
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1600); };
    try { navigator.clipboard.writeText(no).then(done, () => window.prompt('送り状番号をコピーしてください', no)); } catch { window.prompt('送り状番号をコピーしてください', no); }
  };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.571429rem', flexWrap: 'wrap', ...style }}>
      <span className="es-mono" style={{ fontWeight: 600 }}>{no}</span>
      <button type="button" className={btnClass} onClick={copy} aria-label={`送り状番号 ${no} をコピー`}>{copied ? 'コピーしました' : 'コピー'}</button>
      {url ? <a href={url} target="_blank" rel="noopener noreferrer">{carrier}の追跡ページ ↗</a> : null}
    </span>
  );
}
