'use client';

import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import type { DeliveryNoteData } from './note';
import DeliveryNote from '@/app/corp/deliveries/_components/DeliveryNote';

/*
 * 納品書（便ごと）を PDF ファイルとして直接ダウンロードする（台帳 F「法人Web 版 1.1 のレビュー」①。ブラウザの印刷画面は経由しない）。
 * 画面と同じ DeliveryNote を画面の外に A4 幅で描き、画像にして A4 縦の PDF に並べる（ファイル名＝納品書_{納品書番号}.pdf）。
 * 明細が1ページに収まらないときは、表の行・ブロックの切れ目で改ページし（行の途中では切らない）、見出しの行（thead）を各ページの上に繰り返す。
 * ページ番号「n / 全ページ数」を下に入れる。文字は画像のため選択・検索はできない。
 */
const TOP_MM = 10;      // 2ページ目以降の上の余白
const BOTTOM_MM = 12;   // 下の余白（ページ番号の場所）

export async function downloadNotePdf(n: DeliveryNoteData): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
  const host = document.createElement('div');
  host.className = 'corp-delivery';
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:210mm;background:#fff;z-index:-1';
  const sheet = document.createElement('div');
  sheet.className = 'dn-sheet';
  sheet.style.boxShadow = 'none';
  host.appendChild(sheet);
  document.body.appendChild(host);
  const root = createRoot(sheet);
  try {
    root.render(createElement(DeliveryNote, { n }));
    await new Promise((r) => setTimeout(r, 300));
    const scale = 2;
    const canvas = await html2canvas(sheet, { scale, backgroundColor: '#ffffff', useCORS: true });
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
    const pxPerMm = canvas.width / pw;                // キャンバスの画素 / mm
    const cssPerPx = sheet.getBoundingClientRect().width / canvas.width; // キャンバス画素 → CSS px
    const box = sheet.getBoundingClientRect();
    const toCanvas = (cssY: number) => Math.round((cssY - box.top) / cssPerPx);

    // 改ページしてよい位置（キャンバスの y）：表の行の下・見出しなど主なブロックの下
    const cuts = new Set<number>();
    sheet.querySelectorAll('tbody tr, article > *, .dn-sheet > article > *').forEach((el) => cuts.add(toCanvas(el.getBoundingClientRect().bottom)));
    const sortedCuts = [...cuts].filter((y) => y > 0 && y < canvas.height).sort((a, b) => a - b);
    // 見出しの行（thead）：2ページ目以降の上に繰り返す
    const thead = sheet.querySelector('thead');
    const head = thead ? { y: toCanvas(thead.getBoundingClientRect().top), h: Math.round(thead.getBoundingClientRect().height / cssPerPx) } : null;

    // 内容の終わり：A4 の最低の高さ（min-height）の余白はページにしない
    const article = sheet.querySelector('article');
    const endY = Math.min(canvas.height, (article ? toCanvas(article.getBoundingClientRect().bottom) : canvas.height) + Math.round(8 * pxPerMm));
    const firstH = Math.floor((ph - BOTTOM_MM) * pxPerMm);
    const nextH = Math.floor((ph - TOP_MM - BOTTOM_MM) * pxPerMm) - (head ? head.h : 0);
    const pages: { from: number; to: number }[] = [];
    for (let from = 0; from < endY;) {
      const room = pages.length === 0 ? firstH : nextH;
      let to = Math.min(endY, from + room);
      if (to < endY) {
        const safe = [...sortedCuts].reverse().find((y) => y <= to && y > from + room * 0.3);
        if (safe) to = safe;
      }
      pages.push({ from, to });
      from = to;
    }

    const total = pages.length;
    pages.forEach((p, i) => {
      if (i > 0) pdf.addPage();
      const parts: { sy: number; sh: number }[] = [];
      if (i > 0 && head && p.from > head.y + head.h) parts.push({ sy: head.y, sh: head.h });
      parts.push({ sy: p.from, sh: p.to - p.from });
      let y = i === 0 ? 0 : TOP_MM;
      for (const part of parts) {
        const c = document.createElement('canvas');
        c.width = canvas.width; c.height = part.sh;
        c.getContext('2d')!.drawImage(canvas, 0, part.sy, canvas.width, part.sh, 0, 0, canvas.width, part.sh);
        const hMm = part.sh / pxPerMm;
        pdf.addImage(c.toDataURL('image/jpeg', 0.9), 'JPEG', 0, y, pw, hMm);
        y += hMm;
      }
      pdf.setFontSize(9); pdf.setTextColor(120);
      pdf.text(`${i + 1} / ${total}`, pw / 2, ph - 6, { align: 'center' });
    });
    pdf.save(`納品書_${n.id}.pdf`);
  } finally {
    root.unmount();
    host.remove();
  }
}
