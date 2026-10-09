# -*- coding: utf-8 -*-
"""画面を開いて、入力欄・ボタン・リンクの「骨組み」をデータの items の形で出す（LLM に項目を1つずつ書かせないため）。
読み取れること：ラベル・必須・最大文字数・選択肢・種類・セレクタ。読み取れないこと（詳細・条件・メッセージ・ベトナム語・データ例）は空のまま出す。

使い方：
    python3 kd_scaffold.py <URL か デモ HTML> [--login-id Ad00010 --site ops] [--setup "JS"] [--root SEL] > 骨組み.txt
出力は Python の辞書の行（VIEWS の items に貼る）。番号は 1, 2, 3…（大項目を作る場合は人が付け直す）。
vi・ex・detail・err は埋めない。ja のラベルだけ入る → 次に「ja → vi／ex」をまとめて翻訳する（SKILL.md「データを書く」）。
"""
import argparse, json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kd_capture as K

SCAN_JS = """(rootSel) => {
  const root = document.querySelector(rootSel) || document.body;
  /* overlay.js の vis と同じ：aria-hidden の中（DateInput のカレンダー用の隠し input）と透明なものは数えない */
  const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); if (e.closest('[aria-hidden="true"]')) return false;
    return r.width >= 1 && r.height >= 1 && s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0'; };
  const css = e => {
    if (e.id) return '#' + CSS.escape(e.id);
    const n = e.getAttribute('name'); if (n) return e.tagName.toLowerCase() + '[name="' + n + '"]';
    const a = e.getAttribute('aria-label'); if (a) return e.tagName.toLowerCase() + '[aria-label="' + a + '"]';
    const t = (e.textContent || '').trim(); if (t) return e.tagName.toLowerCase() + '::' + t.slice(0, 30);   /* 書き方は「セレクタ::文字」 */
    /* 手がかりがないときは「見えている同じタグの N 番目」（@N）。overlay.js の find と同じ数え方 */
    const tag = e.tagName.toLowerCase(), same = Array.from(document.querySelectorAll(tag)).filter(vis);
    return same.length > 1 ? tag + '@' + (same.indexOf(e) + 1) : tag;
  };
  const label = e => {
    if (e.id) { const l = document.querySelector('label[for="' + CSS.escape(e.id) + '"]'); if (l) return l.textContent; }
    const c = e.closest('label'); if (c) return c.textContent;
    const w = e.closest('[id^=w_], .field, .fld, .form-group, div'); const l = w && w.querySelector('.fl, label, .label, dt');
    return (l && l.textContent) || e.getAttribute('aria-label') || e.placeholder || '';
  };
  const out = [];
  root.querySelectorAll('input, textarea, select, button, a[href], [role=tab], [role=button]').forEach(e => {
    if (!vis(e) || e.type === 'hidden') return;
    const tag = e.tagName.toLowerCase(), type = e.type || '';
    let kind, trig = 'input';
    if (tag === 'select') { kind = 'select'; trig = 'select'; }
    else if (tag === 'textarea') kind = 'textarea';
    else if (tag === 'input') {
      if (type === 'checkbox') { kind = 'check'; trig = 'check'; }
      else if (type === 'radio') { kind = 'radio'; trig = 'check'; }
      else if (type === 'date') kind = 'date';
      else if (type === 'month') kind = 'month';
      else if (type === 'file') { kind = 'file'; trig = 'upload'; }
      else if (type === 'button' || type === 'submit') { kind = 'button'; trig = 'click'; }
      else kind = 'text';
    } else if (tag === 'a') { kind = 'link'; trig = 'click'; }
    else if (e.getAttribute('role') === 'tab') { kind = 'tab'; trig = 'click'; }
    else { kind = 'button'; trig = 'click'; }
    const isInput = !['button', 'link', 'tab'].includes(kind);
    const raw = isInput ? label(e) : (e.textContent || e.value || e.getAttribute('aria-label') || '');
    const text = raw.replace(/\\s+/g, ' ').trim();
    out.push({
      ja: text.replace(/必須|\\*|\\?/g, '').trim().slice(0, 40), sel: css(e), kind, trig,
      req: isInput ? ((e.required || /必須/.test(raw) || e.getAttribute('aria-required') === 'true') ? '○' : '－') : '',
      maxlength: e.maxLength > 0 ? e.maxLength : null,
      opts: tag === 'select' ? Array.from(e.options).map(o => o.text).slice(0, 12) : []
    });
  });
  return out;
}"""

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('target'); ap.add_argument('--login-id'); ap.add_argument('--site', default='ops')
    ap.add_argument('--setup', default=''); ap.add_argument('--root', default='main')
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    web = K.is_url(a.target)
    with sync_playwright() as p:
        b = K.launch(p)
        pg = b.new_page(viewport={'width': 1440, 'height': 900})
        if web:
            base = a.target.split('/', 3)
            origin = '/'.join(base[:3]); path = '/' + (base[3] if len(base) > 3 else '')
            if a.login_id:
                import types
                K.login(pg, origin, types.SimpleNamespace(LOGIN={'site': a.site, 'loginId': a.login_id}, SITE=a.site))
            pg.goto(origin + path); K.settle(pg, 300)
        else:
            pg.goto('file://' + os.path.abspath(a.target)); pg.wait_for_timeout(300)
        if a.setup:
            pg.evaluate("async () => { " + a.setup + " }"); pg.wait_for_timeout(500)
        rows = pg.evaluate(SCAN_JS, a.root)
        b.close()
    for i, r in enumerate(rows, 1):
        d = {'no': str(i), 'ja': r['ja'], 'vi': '', 'sel': r['sel'], 'kind': r['kind'], 'trig': r['trig']}
        if r['req']: d['req'] = r['req']
        if r['maxlength']: d['len'] = '文字列 %d' % r['maxlength']
        if r['opts']: d['detail'] = ['選択肢：' + '／'.join(r['opts']), '']
        if r['kind'] not in ('button', 'link', 'tab', 'check', 'radio', 'file'): d['ex'] = ['', '']
        print('         ' + json.dumps(d, ensure_ascii=False) + ',')

if __name__ == '__main__':
    main()
