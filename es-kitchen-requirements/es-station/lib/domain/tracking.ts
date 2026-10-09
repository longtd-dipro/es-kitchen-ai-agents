import type { Carrier } from './types';

/*
 * 送り状番号と運送会社の追跡ページ（課題 0-2 の決定：ヤマトの API は使わない。送り状番号（コピー）＋ヤマトの追跡ページへのリンク）。
 * ヤマトの追跡ページ（クロネコヤマト 荷物問い合わせ）は送り状番号（12桁の数字）をクエリで渡すと結果を開く。
 * 形が違う番号は追跡ページだけを開く（画面で番号をコピーして貼ってもらう）。
 */

export const YAMATO_TRACK_URL = 'https://toi.kuronekoyamato.co.jp/cgi-bin/tneko';

/** ハイフン・空白を除いた数字だけ */
export const trackingDigits = (no: string) => no.replace(/[\s-]/g, '');
/** ヤマトの送り状番号の形（12桁の数字。ハイフン区切りでもよい） */
export const isYamatoNo = (no: string) => /^\d{12}$/.test(trackingDigits(no));
/** ヤマト運輸か（委託配送会社のマスタ。DE00002） */
export const isYamato = (c?: Pick<Carrier, 'id' | 'name'>) => !!c && (c.id === 'DE00002' || c.name.includes('ヤマト'));

/**
 * 追跡ページの URL。ヤマトは番号をクエリにした URL（形が違えば追跡ページだけ）。
 * ほかの会社はマスタの trackingUrl（{送り状番号} を差し込む）。なければ ''
 */
export function trackingUrlOf(c: Pick<Carrier, 'id' | 'name' | 'trackingUrl'> | undefined, no: string): string {
  if (!c) return '';
  if (isYamato(c)) return isYamatoNo(no) ? `${YAMATO_TRACK_URL}?number00=1&number01=${trackingDigits(no)}` : YAMATO_TRACK_URL;
  return c.trackingUrl ? c.trackingUrl.replace('{送り状番号}', trackingDigits(no)) : '';
}
