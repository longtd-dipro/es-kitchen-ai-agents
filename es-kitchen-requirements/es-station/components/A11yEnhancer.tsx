'use client';

import { useEffect } from 'react';

/*
 * 全ダイアログ共通のキーボード・焦点の動き（UI/UX レビュー #1）。role="dialog" aria-modal="true" の要素が出たら：
 *  開いたとき 焦点がダイアログの外なら、最初の入力欄（なければ最初の操作できる要素、なければダイアログ自身）へ移す
 *  Esc       一番上のダイアログの「キャンセル／閉じる」を押す（確認ダイアログは Esc＝キャンセル。押せるものが無ければ何もしない）
 *  Tab       ダイアログの中で循環（背後の画面へ抜けない）
 *  閉じたとき 開く前に焦点があった要素（開いたボタン）へ戻す
 * ダイアログの部品が画面ごとに別々なので、1か所（app/layout.tsx）でまとめて扱う。名前（aria-label）が無いときは見出しを aria-labelledby にする
 */
const SEL = 'a[href],button,input,select,textarea,[tabindex]';
const DLG = '[role="dialog"][aria-modal="true"]';
const CANCEL = /^(キャンセル|閉じる|やめる|戻る|OK|閉じる（Esc）)$/;

function focusables(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(SEL)).filter((el) => {
    if ((el as HTMLButtonElement).disabled || el.getAttribute('tabindex') === '-1' || el.getAttribute('type') === 'hidden') return false;
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  });
}

/*
 * 名前（label・aria-label）のない入力欄に、見えている文言から aria-label を付ける（UI/UX レビュー #12）。
 * 順に：欄の見出し（.es-field__label）→ 直前の見出しの文字（「請求月：」など）→ placeholder → 表の行の最初のセル（行のチェック）
 */
const CTRL = 'input:not([type="hidden"]),select,textarea';
const clean = (t: string | null | undefined) => (t ?? '').replace(/[*＊]/g, '').replace(/\s+/g, ' ').trim();
const unnamed = (c: HTMLInputElement) => !c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby') && !c.getAttribute('title') && !(c.labels && Array.from(c.labels).some((l) => clean(l.textContent)))
  && c.getAttribute('aria-hidden') !== 'true' && c.getAttribute('tabindex') !== '-1';
function nameOf(c: HTMLInputElement): string {
  const field = c.closest('.es-field');
  const fl = field?.querySelector(':scope > .es-field__label');
  if (fl) {
    const same = Array.from(field!.querySelectorAll<HTMLInputElement>(CTRL)).filter((x) => x.getAttribute('aria-hidden') !== 'true' && x.getAttribute('tabindex') !== '-1');
    const n = same.indexOf(c);
    return clean(fl.textContent) + (same.length > 1 && n >= 0 ? ` ${n + 1}` : '');
  }
  for (let p: HTMLElement | null = c.parentElement, i = 0; p && i < 4; p = p.parentElement, i++) {
    const lab = Array.from(p.children).find((e) => e !== c && !e.contains(c) && /^(LABEL|SPAN|B|STRONG|P|DT)$/.test(e.tagName) && !e.querySelector(CTRL) && clean(e.textContent).length > 0 && clean(e.textContent).length <= 24
      && (p!.firstElementChild === e || e.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING));
    if (lab) return clean(lab.textContent).replace(/[:：]$/, '');
  }
  if (c.placeholder) return c.placeholder;
  if (c.tagName === 'SELECT') { const o = clean((c as unknown as HTMLSelectElement).options[0]?.textContent); if (o.includes('：')) return o.split('：')[0]; }
  if (c.type === 'checkbox') {
    const tr = c.closest('tr');
    const cell = tr && Array.from(tr.children).find((e) => !e.contains(c) && clean(e.textContent) && !/^[0-9]+$/.test(clean(e.textContent)));
    if (cell) return clean(cell.textContent).slice(0, 40) + ' を選ぶ';
    return '選択';
  }
  return '';
}
function nameControls() {
  document.querySelectorAll<HTMLInputElement>(CTRL).forEach((c) => {
    if (!unnamed(c)) return;
    const t = nameOf(c);
    if (t) c.setAttribute('aria-label', t);
  });
}

export default function A11yEnhancer() {
  useEffect(() => {
    const stack: { el: HTMLElement; back: HTMLElement | null }[] = [];
    let last: HTMLElement | null = null;
    const inDlg = (n: EventTarget | null) => n instanceof Element && !!n.closest(DLG);

    const onFocusIn = (e: FocusEvent) => { if (e.target instanceof HTMLElement && !inDlg(e.target)) last = e.target; };
    const onClick = (e: MouseEvent) => {
      const b = e.target instanceof Element ? (e.target.closest('button,a,[role="button"],[tabindex]') as HTMLElement | null) : null;
      if (b && !inDlg(b)) last = b;
    };

    const sync = () => {
      // 閉じたもの：焦点を戻す
      for (let i = stack.length - 1; i >= 0; i--) {
        const s = stack[i];
        if (s.el.isConnected) continue;
        stack.splice(i, 1);
        if (!stack.length || !stack[stack.length - 1].el.contains(document.activeElement)) {
          const b = s.back;
          if (b && b.isConnected) b.focus({ preventScroll: true });
          else if (stack.length) focusables(stack[stack.length - 1].el)[0]?.focus();
        }
      }
      // 開いたもの
      document.querySelectorAll<HTMLElement>(DLG).forEach((el) => {
        if (stack.some((s) => s.el === el)) return;
        const ae = document.activeElement as HTMLElement | null;
        const back = (ae && ae !== document.body && !el.contains(ae) ? ae : last) ?? null;
        stack.push({ el, back });
        if (!el.hasAttribute('aria-label') && !el.hasAttribute('aria-labelledby')) {
          const h = el.querySelector<HTMLElement>('h1,h2,h3');
          if (h) { if (!h.id) h.id = 'dlg-t-' + Math.random().toString(36).slice(2, 8); el.setAttribute('aria-labelledby', h.id); }
        }
        if (!el.contains(document.activeElement)) {
          const fs = focusables(el);
          const target = fs.find((f) => /^(INPUT|SELECT|TEXTAREA)$/.test(f.tagName) && f.getAttribute('type') !== 'checkbox' && f.getAttribute('type') !== 'radio')
            ?? fs.find((f) => !f.matches('[aria-label="閉じる"],.es-dialog__close,.es-modal__close,.icon-btn'))
            ?? fs[0];
          if (target) target.focus({ preventScroll: true });
          else { if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1'); el.focus({ preventScroll: true }); }
        }
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || !stack.length) return;
      const top = stack[stack.length - 1].el;
      if (!top.isConnected) return;
      if (e.key === 'Escape') {
        const btns = Array.from(top.querySelectorAll<HTMLElement>('button')).filter((b) => !(b as HTMLButtonElement).disabled);
        const txt = (b: HTMLElement) => (b.textContent ?? '').trim();
        const target = btns.find((b) => txt(b) === 'キャンセル') ?? btns.find((b) => b.getAttribute('aria-label') === '閉じる' || /(^|\s)(es-dialog__close|es-modal__close)(\s|$)/.test(b.className))
          ?? btns.find((b) => CANCEL.test(txt(b)));
        if (!target) return;
        e.preventDefault(); e.stopPropagation();
        target.click();
        return;
      }
      if (e.key === 'Tab') {
        const fs = focusables(top);
        if (!fs.length) { e.preventDefault(); top.focus(); return; }
        const a = document.activeElement as HTMLElement | null;
        const i = a ? fs.indexOf(a) : -1;
        if (!top.contains(a)) { e.preventDefault(); fs[e.shiftKey ? fs.length - 1 : 0].focus(); }
        else if (e.shiftKey && (i <= 0)) { e.preventDefault(); fs[fs.length - 1].focus(); }
        else if (!e.shiftKey && i === fs.length - 1) { e.preventDefault(); fs[0].focus(); }
      }
    };

    let raf = 0;
    const mo = new MutationObserver(() => { sync(); if (!raf) raf = requestAnimationFrame(() => { raf = 0; nameControls(); }); });
    mo.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('focusin', onFocusIn, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKey, true);
    sync(); nameControls();
    return () => {
      mo.disconnect(); if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('focusin', onFocusIn, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('keydown', onKey, true);
    };
  }, []);
  return null;
}
