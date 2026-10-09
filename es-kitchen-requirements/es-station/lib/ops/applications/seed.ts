import samples from './data/intake-samples.json';
import type { IntakeCfg } from './types';

/*
 * 受付画面の見本（11_運営_申請受付.html の受付3画面の CFG をそのまま JSON にしたもの）。
 *   data/intake-samples.json … 0＝本導入の新規申込・1＝お試しキャンペーン・2＝お試し→本導入の切替
 * 画面の定義（見本の表・欄）で、申込の中身ではない。申請・申込の中身は共通データ（dm.apply.applications）。
 */

/** 受付画面の見本（id は '0'〜'2'） */
export function seedIntakeSamples(): { id: string; cfg: IntakeCfg }[] {
  return structuredClone(samples as unknown as IntakeCfg[]).map((cfg, i) => ({ id: String(i), cfg }));
}
