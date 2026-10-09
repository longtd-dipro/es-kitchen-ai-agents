/*
 * 画面ごとのコメント（レビュー用・2026/10/02）。画面右下の「コメント」から、いま開いている画面にコメントを残す。
 * - 保存先：07_開発 の API（/api/review/comments → data/review.db）。データリセットでは消えない
 * - 07_開発：npm run dev:demo のときだけ app/layout.tsx が読み込む
 * - 02_デモ の HTML：項目一覧_生成スクリプト/inject_review.py が中に差し込む（API は http://localhost:3200）。
 *   07_開発 が動いていないときは、このブラウザに一時保存して、つながったときに送る
 * 画面名は「サイドメニューの選択中（またはパンくず）＋見出し（h1）」から取る。違っていたら書く前に直せる。
 */
(function () {
  'use strict';
  if (window.__esReview) return;
  try { if (window.parent !== window && window.parent.__esReview) return; } catch (e) { /* 別オリジンの親 */ }
  window.__esReview = true;

  var script = document.currentScript;
  var API = (window.ES_REVIEW_API != null ? window.ES_REVIEW_API : (script && script.dataset.api) || '').replace(/\/$/, '');
  var LS_PENDING = 'esReview.pending';
  var LS_AUTHOR = 'esReview.author';

  /* ===== 画面の判定 ===== */
  var SITES = [
    [/^\/ops|\/legacy\/ops|10_運営/, '運営Web'],
    [/^\/corp|\/legacy\/corp|20_法人/, '法人Web'],
    [/^\/carrier|\/legacy\/carrier|30_委託/, '委託配送先Web'],
    [/^\/driver|\/legacy\/driver|40_ドライバー/, 'ドライバー'],
    [/^\/supplier|\/legacy\/supplier|50_仕入先/, '仕入先サイト'],
  ];
  function siteName() {
    if (window.ES_REVIEW_SITE) return window.ES_REVIEW_SITE;
    var p = decodeURIComponent(location.pathname);
    for (var i = 0; i < SITES.length; i++) if (SITES[i][0].test(p)) return SITES[i][1];
    return document.title || 'デモ';
  }
  function visible(el) {
    if (!el || !el.getClientRects().length) return false;
    var s = getComputedStyle(el);
    return s.visibility !== 'hidden' && s.display !== 'none';
  }
  function label(el) {
    var t = (el.innerText || el.textContent || '').trim().split('\n')[0].replace(/\s+/g, ' ');
    return t.replace(/\s*\(?\d+件?\)?$/, '').slice(0, 40);
  }
  /* 見えている同じオリジンの iframe（部品を iframe で入れているデモ）も見る */
  function docs() {
    var out = [document];
    var fs = document.querySelectorAll('iframe');
    for (var i = 0; i < fs.length; i++) {
      try { if (visible(fs[i]) && fs[i].contentDocument) out.push(fs[i].contentDocument); } catch (e) { /* 別オリジン */ }
    }
    return out;
  }
  var NAV_SEL = '.nav-g.on, .nav-i.on, .es-navitem.is-active, nav a.active, aside a.active, nav .is-active, aside .is-active, nav [aria-current="page"], aside [aria-current="page"], .side .on, .sidebar .on';
  var CRUMB_SEL = '.es-breadcrumb, nav[aria-label*="breadcrumb" i], .breadcrumb';
  function screenName() {
    if (typeof window.ES_REVIEW_SCREEN === 'function') { try { var s = window.ES_REVIEW_SCREEN(); if (s) return s; } catch (e) { /* 無視 */ } }
    var parts = [];
    var crumb = Array.prototype.find.call(document.querySelectorAll(CRUMB_SEL), visible);
    if (crumb) {
      var items = crumb.querySelectorAll('a, span, li');
      for (var i = 0; i < items.length; i++) { var t = label(items[i]); if (t && t !== '>' && t !== '＞' && t !== '/' && parts.indexOf(t) < 0 && items[i].children.length === 0) parts.push(t); }
    }
    if (!parts.length) {
      var navs = document.querySelectorAll(NAV_SEL);
      for (var j = 0; j < navs.length; j++) {
        if (!visible(navs[j]) || host.contains(navs[j])) continue;
        var n = label(navs[j]);
        if (n && parts.indexOf(n) < 0) parts.push(n);
        if (parts.length >= 3) break;
      }
    }
    var ds = docs(), h = '';
    for (var k = 0; k < ds.length && !h; k++) {
      var hs = ds[k].querySelectorAll('h1');
      for (var m = 0; m < hs.length; m++) if (visible(hs[m])) { h = label(hs[m]); break; }
    }
    /* 見出しがメニュー名で始まる（「請求の確定・請求書（締め 10月）」など）ときは足さない。データで変わる部分を画面名に入れないため */
    var last = parts[parts.length - 1];
    if (h && !(last && h.indexOf(last) === 0)) parts.push(h);
    return parts.join(' ＞ ') || document.title || location.pathname;
  }
  function pageUrl() { return location.protocol === 'file:' ? decodeURIComponent(location.pathname.split('/').pop()) + location.hash : location.pathname + location.search + location.hash; }

  /* ===== API（つながらなければ、このブラウザに一時保存） ===== */
  function call(method, path, data) {
    return fetch(API + path, {
      method: method,
      headers: data ? { 'Content-Type': 'application/json' } : undefined,
      body: data ? JSON.stringify(data) : undefined,
    }).then(function (r) {
      if (r.status === 204) return null;
      return r.json().then(function (j) { if (!r.ok) throw Object.assign(new Error(j.message || 'エラー'), { api: true }); return j; });
    });
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* 使えないブラウザ */ } }

  var state = { list: [], online: null, open: false, tab: 'here', onlyOpen: true, target: '', editing: 0, screen: '', site: siteName() };

  function flushPending() {
    var pend = lsGet(LS_PENDING, []);
    if (!pend.length) return Promise.resolve();
    var rest = pend.slice();
    return pend.reduce(function (p, c) {
      return p.then(function () { return call('POST', '/api/review/comments', c).then(function () { rest.shift(); }); });
    }, Promise.resolve()).then(function () { lsSet(LS_PENDING, []); }, function (e) { lsSet(LS_PENDING, rest); throw e; });
  }
  function load() {
    return flushPending().then(function () { return call('GET', '/api/review/comments'); }).then(function (list) {
      state.online = true; state.list = list || [];
    }, function () { state.online = false; }).then(render);
  }
  function pendingList() {
    return lsGet(LS_PENDING, []).map(function (c, i) { return Object.assign({ id: -(i + 1), status: 'open', createdAt: '（未送信）', pending: true }, c); });
  }
  function allComments() { return state.list.concat(pendingList()); }

  /* ===== 画面 ===== */
  var host = document.createElement('div');
  host.id = 'es-review';
  host.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483000;';
  var root = host.attachShadow({ mode: 'open' });
  var CSS = '\
:host{all:initial}\
*{box-sizing:border-box;font-family:"Noto Sans JP",system-ui,sans-serif}\
.fab{display:flex;align-items:center;gap:6px;border:0;border-radius:999px;padding:10px 16px;background:#1f2937;color:#fff;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}\
.fab:hover{background:#111827}\
.badge{min-width:20px;padding:1px 6px;border-radius:999px;background:#f59e0b;color:#111;font-size:11px;text-align:center}\
.panel{position:fixed;right:16px;bottom:68px;width:400px;max-width:calc(100vw - 32px);max-height:calc(100vh - 100px);display:flex;flex-direction:column;background:#fff;color:#1f2937;border:1px solid #d1d5db;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.22);font-size:13px;overflow:hidden}\
.hd{padding:10px 12px;border-bottom:1px solid #e5e7eb;background:#f9fafb}\
.hd b{font-size:14px}\
.tabs{display:flex;gap:4px;margin-top:8px}\
.tabs button{flex:1;border:1px solid #d1d5db;background:#fff;border-radius:6px;padding:5px;font-size:12px;cursor:pointer}\
.tabs button.on{background:#1f2937;color:#fff;border-color:#1f2937}\
.bd{overflow:auto;padding:10px 12px;flex:1}\
.warn{background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:6px 8px;margin-bottom:8px;font-size:12px}\
label.f{display:block;font-size:11px;color:#6b7280;margin:6px 0 2px}\
input,textarea{width:100%;border:1px solid #d1d5db;border-radius:6px;padding:6px 8px;font-size:13px;color:#111}\
textarea{min-height:72px;resize:vertical}\
.row{display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap}\
.btn{border:1px solid #d1d5db;background:#fff;border-radius:6px;padding:5px 10px;font-size:12px;cursor:pointer;color:#1f2937}\
.btn.pri{background:#2563eb;border-color:#2563eb;color:#fff;font-weight:700}\
.btn.on{background:#fde68a;border-color:#f59e0b}\
.btn:disabled{opacity:.5;cursor:default}\
.sp{flex:1}\
.c{border:1px solid #e5e7eb;border-radius:8px;padding:8px;margin-bottom:6px;background:#fff}\
.c.done{background:#f3f4f6;color:#6b7280}\
.c.done .tx{text-decoration:line-through}\
.c .tx{white-space:pre-wrap;word-break:break-word}\
.c .mt{font-size:11px;color:#9ca3af;margin-top:4px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}\
.c .mt a{color:#2563eb;cursor:pointer;text-decoration:underline}\
.tg{display:inline-block;font-size:11px;background:#eef2ff;color:#3730a3;border-radius:4px;padding:1px 6px;margin-bottom:4px;cursor:pointer}\
.grp{margin:10px 0 4px;font-weight:700;font-size:12px}\
.grp a{color:#2563eb;cursor:pointer}\
.site{margin-top:12px;font-size:13px;font-weight:700;border-bottom:1px solid #e5e7eb;padding-bottom:2px}\
.empty{color:#9ca3af;text-align:center;padding:14px 0}\
.hint{font-size:11px;color:#6b7280}\
';
  root.innerHTML = '<style>' + CSS + '</style><div class="wrap"></div>';
  var wrap = root.querySelector('.wrap');

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function sameScreen(c) { return c.site === state.site && c.screen === state.screen; }

  function commentHtml(c) {
    return '<div class="c' + (c.status === 'done' ? ' done' : '') + '" data-id="' + c.id + '">'
      + (c.target ? '<span class="tg" data-act="show" title="画面の中で光らせる">📍 ' + esc(c.target) + '</span><br>' : '')
      + (state.editing === c.id
        ? '<textarea data-edit>' + esc(c.body) + '</textarea><div class="row"><span class="sp"></span><button class="btn" data-act="cancel">やめる</button><button class="btn pri" data-act="save">保存</button></div>'
        : '<div class="tx">' + esc(c.body) + '</div>')
      + '<div class="mt">'
      + (c.pending ? '<span>未送信（このブラウザだけ）</span>' : '<label><input type="checkbox" data-act="done"' + (c.status === 'done' ? ' checked' : '') + ' style="width:auto"> 対応済み</label>')
      + '<span>#' + (c.pending ? '-' : c.id) + '・' + esc(String(c.createdAt).slice(0, 16)) + (c.author ? '・' + esc(c.author) : '') + '</span>'
      + '<span class="sp"></span>'
      + (c.pending ? '' : '<a data-act="edit">直す</a><a data-act="del">消す</a>')
      + '</div></div>';
  }

  function render() {
    var all = allComments();
    var here = all.filter(sameScreen);
    var hereOpen = here.filter(function (c) { return c.status === 'open'; }).length;
    var totalOpen = all.filter(function (c) { return c.status === 'open'; }).length;
    var h = '<button class="fab" data-act="toggle" title="この画面にコメントを残す">💬 コメント'
      + (hereOpen ? '<span class="badge" title="この画面の未対応">' + hereOpen + '</span>' : '') + '</button>';
    if (state.open) {
      h += '<div class="panel"><div class="hd"><b>画面ごとのコメント</b>'
        + '<div class="tabs"><button data-act="tab" data-tab="here" class="' + (state.tab === 'here' ? 'on' : '') + '">この画面（' + here.length + '）</button>'
        + '<button data-act="tab" data-tab="all" class="' + (state.tab === 'all' ? 'on' : '') + '">すべて（未対応 ' + totalOpen + '）</button></div></div><div class="bd">';
      if (state.online === false) h += '<div class="warn">07_開発 のサーバー（' + esc(API || location.origin) + '）につながっていません。書いたコメントはこのブラウザに一時保存し、つながったときに送ります。<br><span class="hint">起動：07_開発 で npm run dev:demo -- --port 3200</span></div>';
      h += state.tab === 'here' ? renderHere(here) : renderAll(all);
      h += '</div></div>';
    }
    var b = field('body'), sc = field('screen'), au = field('author');
    var keep = { body: b ? b.value : '', screen: sc && sc.dataset.base === state.site + '｜' + state.screen ? sc.value : null, author: au ? au.value : null };
    wrap.innerHTML = h;
    if (field('body')) {
      field('body').value = keep.body;
      if (keep.screen != null) field('screen').value = keep.screen;
      if (keep.author != null) field('author').value = keep.author;
    }
  }

  function renderHere(here) {
    var h = '<label class="f">サイト・画面（違っていたら直してから書く）</label>'
      + '<input data-f="screen" data-base="' + esc(state.site + '｜' + state.screen) + '" value="' + esc(state.site + '｜' + state.screen) + '">'
      + '<label class="f">コメント</label><textarea data-f="body" placeholder="気づいたこと・直してほしいこと（Ctrl＋Enter で送る）"></textarea>'
      + '<div class="row"><button class="btn' + (state.target ? ' on' : '') + '" data-act="pick" title="画面の中の場所をクリックして指す">📍 ' + (state.target ? esc(state.target) : '場所を指す（任意）') + '</button>'
      + (state.target ? '<button class="btn" data-act="unpick">×</button>' : '')
      + '<span class="sp"></span><input data-f="author" placeholder="名前（任意）" style="width:100px" value="' + esc(lsGet(LS_AUTHOR, '')) + '">'
      + '<button class="btn pri" data-act="add">送る</button></div>';
    h += '<div style="margin-top:12px">';
    if (!here.length) h += '<div class="empty">この画面のコメントはまだありません</div>';
    var sorted = here.slice().sort(function (a, b) { return a.status === b.status ? a.id - b.id : a.status === 'open' ? -1 : 1; });
    for (var i = 0; i < sorted.length; i++) h += commentHtml(sorted[i]);
    return h + '</div>';
  }

  function renderAll(all) {
    var list = state.onlyOpen ? all.filter(function (c) { return c.status === 'open'; }) : all;
    var h = '<div class="row" style="margin-top:0"><label><input type="checkbox" data-act="onlyOpen" style="width:auto"' + (state.onlyOpen ? ' checked' : '') + '> 未対応だけ</label><span class="sp"></span>'
      + '<button class="btn" data-act="dl" title="Markdown をダウンロード">⬇ Markdown</button>'
      + '<button class="btn" data-act="save-md" title="プロジェクトの 00_確認してほしい/ に置く"' + (state.online ? '' : ' disabled') + '>📁 00_確認してほしい に置く</button></div>';
    if (!list.length) return h + '<div class="empty">' + (state.onlyOpen ? '未対応のコメントはありません' : 'コメントはまだありません') + '</div>';
    var sites = {};
    list.forEach(function (c) { ((sites[c.site] = sites[c.site] || {})[c.screen] = sites[c.site][c.screen] || []).push(c); });
    Object.keys(sites).forEach(function (s) {
      h += '<div class="site">' + esc(s) + '</div>';
      Object.keys(sites[s]).forEach(function (sc) {
        var cs = sites[s][sc];
        var url = (cs.find(function (c) { return c.url; }) || {}).url || '';
        h += '<div class="grp">' + esc(sc) + (url && canGo(url) ? '　<a data-act="go" data-url="' + esc(url) + '">この画面へ</a>' : '') + '</div>';
        cs.forEach(function (c) { h += commentHtml(c); });
      });
    });
    return h;
  }
  function canGo(url) { return location.protocol !== 'file:' && url.charAt(0) === '/' && url !== pageUrl(); }

  function markdownLocal() {
    var all = allComments(), out = ['# 画面ごとのコメント', '', '書き出し：' + new Date().toLocaleString('ja-JP') + '（このブラウザの分）', ''];
    var sites = {};
    all.forEach(function (c) { ((sites[c.site] = sites[c.site] || {})[c.screen] = sites[c.site][c.screen] || []).push(c); });
    Object.keys(sites).forEach(function (s) {
      out.push('## ' + s, '');
      Object.keys(sites[s]).forEach(function (sc) {
        out.push('### ' + sc, '');
        sites[s][sc].forEach(function (c) { out.push('- [' + (c.status === 'done' ? 'x' : ' ') + '] ' + c.body.replace(/\n/g, '\n  ') + (c.target ? '（場所：' + c.target + '）' : '')); });
        out.push('');
      });
    });
    return out.join('\n');
  }
  function download(name, text) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  /* ===== 場所を指す ===== */
  var picking = false, hoverBox = null;
  function describe(el) {
    var tag = { BUTTON: 'ボタン', A: 'リンク', INPUT: '入力欄', SELECT: '選択', TEXTAREA: '入力欄', TH: '表の見出し', TD: '表のセル', LABEL: '項目名', IMG: '画像' }[el.tagName] || '';
    var t = label(el) || el.getAttribute('placeholder') || el.getAttribute('aria-label') || el.getAttribute('title') || '';
    if (!t && el.closest) { var lb = el.closest('label, td, th, li, div'); if (lb) t = label(lb); }
    return (tag ? tag + '「' : '「') + (t || el.tagName.toLowerCase()) + '」';
  }
  function box(el, color) {
    var r = el.getBoundingClientRect();
    var b = document.createElement('div');
    b.style.cssText = 'position:fixed;pointer-events:none;z-index:2147482999;border:2px solid ' + color + ';background:' + color + '22;border-radius:4px;left:' + (r.left - 2) + 'px;top:' + (r.top - 2) + 'px;width:' + (r.width + 4) + 'px;height:' + (r.height + 4) + 'px;transition:opacity .4s';
    document.body.appendChild(b);
    return b;
  }
  function onMove(e) {
    if (host.contains(e.target)) return;
    if (hoverBox) hoverBox.remove();
    hoverBox = box(e.target, '#f59e0b');
  }
  function onPick(e) {
    if (host.contains(e.target)) return;
    e.preventDefault(); e.stopPropagation();
    state.target = describe(e.target).slice(0, 80);
    stopPick();
  }
  function onKey(e) { if (e.key === 'Escape') stopPick(); }
  function startPick() {
    picking = true; state.open = false; render();
    document.addEventListener('mousemove', onMove, true);
    document.addEventListener('click', onPick, true);
    document.addEventListener('keydown', onKey, true);
    document.documentElement.style.cursor = 'crosshair';
  }
  function stopPick() {
    picking = false;
    document.removeEventListener('mousemove', onMove, true);
    document.removeEventListener('click', onPick, true);
    document.removeEventListener('keydown', onKey, true);
    document.documentElement.style.cursor = '';
    if (hoverBox) { hoverBox.remove(); hoverBox = null; }
    state.open = true; render();
  }
  function showTarget(text) {
    var m = /「(.*)」$/.exec(text), want = m ? m[1] : text;
    var ds = docs();
    for (var d = 0; d < ds.length; d++) {
      var els = ds[d].querySelectorAll('button, a, th, td, label, h1, h2, h3, input, select, textarea, li, span, div');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (!visible(el) || host.contains(el)) continue;
        var t = label(el) || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '';
        if (t === want) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
          if (ds[d] === document) setTimeout(function () { var b = box(el, '#ef4444'); setTimeout(function () { b.style.opacity = '0'; setTimeout(function () { b.remove(); }, 400); }, 1600); }, 350);
          return;
        }
      }
    }
    alert('この画面では「' + want + '」が見つかりませんでした');
  }

  /* ===== 操作 ===== */
  function field(name) { return root.querySelector('[data-f="' + name + '"]'); }
  function add() {
    var body = field('body').value.trim();
    if (!body) { field('body').focus(); return; }
    var sv = field('screen').value, k = sv.indexOf('｜');
    var site = k > 0 ? sv.slice(0, k).trim() : state.site, screen = k > 0 ? sv.slice(k + 1).trim() : sv.trim();
    var author = field('author').value.trim();
    lsSet(LS_AUTHOR, author);
    var c = { site: site, screen: screen, url: pageUrl(), target: state.target, body: body, author: author };
    state.target = '';
    call('POST', '/api/review/comments', c).then(function () { return load(); }, function (e) {
      if (e.api) { alert(e.message); return; }
      var p = lsGet(LS_PENDING, []); p.push(c); lsSet(LS_PENDING, p); state.online = false; render();
    });
    field('body').value = '';
  }
  function act(a, el) {
    var cEl = el.closest('[data-id]'), id = cEl ? Number(cEl.dataset.id) : 0;
    var c = id ? allComments().find(function (x) { return x.id === id; }) : null;
    switch (a) {
      case 'toggle': state.open = !state.open; if (state.open) { refreshScreen(); load(); } else render(); break;
      case 'tab': state.tab = el.dataset.tab; render(); break;
      case 'pick': startPick(); break;
      case 'unpick': state.target = ''; render(); break;
      case 'add': add(); break;
      case 'onlyOpen': state.onlyOpen = el.checked; render(); break;
      case 'done': call('PATCH', '/api/review/comments/' + id, { status: el.checked ? 'done' : 'open' }).then(load, function (e) { alert(e.message); load(); }); break;
      case 'edit': state.editing = id; render(); break;
      case 'cancel': state.editing = 0; render(); break;
      case 'save': call('PATCH', '/api/review/comments/' + id, { body: root.querySelector('[data-edit]').value }).then(function () { state.editing = 0; return load(); }, function (e) { alert(e.message); }); break;
      case 'del': if (confirm('このコメントを消します。よろしいですか？')) call('DELETE', '/api/review/comments/' + id).then(load, function (e) { alert(e.message); }); break;
      case 'show': if (c) showTarget(c.target); break;
      case 'go': location.href = el.dataset.url; break;
      case 'dl':
        if (state.online) fetch(API + '/api/review/export' + (state.onlyOpen ? '?open=1' : '')).then(function (r) { return r.text(); }).then(function (t) { download('画面コメント.md', t); });
        else download('画面コメント.md', markdownLocal());
        break;
      case 'save-md': call('POST', '/api/review/export').then(function (r) { alert('置きました：' + r.path); }, function (e) { alert(e.message); }); break;
    }
  }
  root.addEventListener('click', function (e) {
    var el = e.target.closest('[data-act]');
    if (!el || el.tagName === 'INPUT') return;
    act(el.dataset.act, el);
  });
  root.addEventListener('change', function (e) {
    var el = e.target.closest('input[data-act]');
    if (el) act(el.dataset.act, el);
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.dataset.f === 'body') add();
    e.stopPropagation(); /* デモ側のショートカットに渡さない */
  });

  /* 画面が変わったら（メニュー移動・#・ページ遷移）バッジと画面名を直す */
  function refreshScreen() {
    var s = screenName(), site = siteName();
    if (s === state.screen && site === state.site) return false;
    state.screen = s; state.site = site;
    return true;
  }
  setInterval(function () {
    if (picking) return;
    var typing = state.open && root.activeElement && /TEXTAREA|INPUT/.test(root.activeElement.tagName);
    if (refreshScreen() && !typing) render();
  }, 1200);
  setInterval(function () { if (state.open && !state.editing && !(root.activeElement && /TEXTAREA|INPUT/.test(root.activeElement.tagName))) load(); }, 15000);

  function mount() {
    document.body.appendChild(host);
    refreshScreen();
    load();
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
})();
