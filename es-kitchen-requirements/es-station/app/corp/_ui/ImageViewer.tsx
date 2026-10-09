'use client';

import { useEffect } from 'react';
import { useCorp } from './CorpProvider';

/*
 * 法人Web 共通の画像ビューア（拡大表示のモーダル。台帳 E 2026-10-05「画像の拡大」・受付簿 No.56）。
 * 商品・資材の写真（月次注文）や、拠点の搬入経路・設置場所の写真（画像だけ）から開く。外を押すか Esc で閉じる。
 */
export function ImageViewerDialog({ src, alt, title }: { src: string; alt: string; title?: string }) {
  const { closeModal } = useCorp();
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [closeModal]);
  return (
    <div className="hd-ov" onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}>
      <figure className="hd-imgview" role="dialog" aria-modal="true" aria-label={title ?? alt}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} />
        <figcaption>
          <span>{title ?? alt}</span>
          <button type="button" className="es-btn es-btn--outline es-btn--neutral es-btn--md" onClick={closeModal}>閉じる</button>
        </figcaption>
      </figure>
    </div>
  );
}

/** 画像を押したときに拡大表示を開く関数を返す */
export function useImageViewer() {
  const { openModal } = useCorp();
  return (src: string, alt: string, title?: string) => openModal(<ImageViewerDialog src={src} alt={alt} title={title} />);
}

/** 押すと拡大するサムネイル（img の見た目は呼ぶ側の className。キーボードでも開ける） */
export function ZoomImage({ src, alt, title, className }: { src: string; alt: string; title?: string; className?: string }) {
  const open = useImageViewer();
  const go = () => open(src, alt, title);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} alt={alt} role="button" tabIndex={0} title="押すと拡大します" onClick={go} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }} />
  );
}
