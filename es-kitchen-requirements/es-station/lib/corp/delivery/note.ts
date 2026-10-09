import type { CorpDelivery, DeliveryItem } from './types';
import { md, ymdW } from './logic';

/*
 * 便ごとの納品書（PDF）の中身（版1.1・CW_DLV No.25〜25.9・台帳 E「納品書のテンプレート（法人Web・PDF）」）。
 * A4 縦・金額は載せない・資材は載せない。画面（app/corp/deliveries/_components/DeliveryNote.tsx）はここで作った形をそのまま出す。
 * 現行の納品書との差はお客様（運営）に確認（OPEN）。
 */

/** 発行元（ESキッチン）の見本。ふだんは会社マスタの値（お届け詳細の issuer）を使い、マスタにないときだけこれを使う */
export const ISSUER = { name: 'ESキッチン', address: '東京都（本社）', tel: '03-0000-0001' };

export type NoteRow = { no: number; name: string; nameEn?: string; ordered: number; delivered: number | null; note: string; short: boolean };
export type DeliveryNoteData = {
  /** 納品書番号（＝配送ID） */
  id: string;
  /** 発行日 YYYY-MM-DD */
  issuedOn: string;
  corpName: string;
  siteName: string;
  address: string;
  /** 「お届け日」か「お届け予定日」（お届け前に出したとき） */
  dateLabel: string;
  date: string;
  kindText: string;
  cycle: string;
  rows: NoteRow[];
  totalOrdered: number;
  totalDelivered: number | null;
  notes: string[];
  issuer: typeof ISSUER;
};

/** 備考：代替品（元：〇〇）・補償（0円）・不足 n個（画面の備考 No.3.5 と同じ内容。金額は補償の「0円」だけ） */
const rowNote = (it: DeliveryItem) => [it.note, it.short ? `不足 ${it.short}個` : ''].filter(Boolean).join('・');

/** 画面のお届け詳細（corp-delivery の delivery）から納品書の中身を作る。todayIso＝発行日（YYYY-MM-DD） */
export function buildDeliveryNote(d: CorpDelivery & { siteName: string }, todayIso: string): DeliveryNoteData {
  const done = !!d.doneAt;
  const rows: NoteRow[] = d.items.map((it, i) => ({ no: i + 1, name: it.n, nameEn: it.nEn, ordered: it.oq, delivered: it.fq, note: rowNote(it), short: !!it.short }));
  const delivered = rows.some((r) => r.delivered !== null) ? rows.reduce((s, r) => s + (r.delivered ?? 0), 0) : null;
  const notes: string[] = [];
  /* 代替品：ご請求は元の商品の料金 */
  for (const it of d.items) if (it.altFrom) notes.push(`※ 商品の不良のため、${it.altFrom} は ${it.n} でお届けしました。ご請求は元の商品の料金です。`);
  /* 不足：残りの再配送の予定（なければ ESキッチンから連絡） */
  if (d.short) {
    const child = d.related.find((x) => x.child);
    notes.push(`※ ${d.short}個が足りませんでした。${child ? `残りは ${md(child.date)} にお届けします。` : 'ESキッチンからご連絡します。'}`);
  }
  /* 再配送の子：元のお届けの残り */
  if (d.parentId) {
    const parent = d.related.find((x) => !x.child);
    if (parent) notes.push(`※ ${md(parent.date)} のお届け（${parent.id}）の残りのお届けです。`);
  }
  return {
    id: d.id, issuedOn: todayIso, corpName: d.corpName, siteName: d.siteName, address: d.address,
    dateLabel: done ? 'お届け日' : 'お届け予定日', date: ymdW(d.dateIso), kindText: d.kindText, cycle: `${d.cycle}`,
    rows, totalOrdered: rows.reduce((s, r) => s + r.ordered, 0), totalDelivered: delivered, notes, issuer: d.issuer ?? ISSUER,
  };
}
