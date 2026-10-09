/* 画面設計書：デモ画面の上に番号を重ねる（HTML ビューアと画像作成で共通） */
(function () {
  if (window.__KD) return;
  var LAYER_ID = '__kd_layer';
  function vis(e) {
    if (!e) return false;
    var r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return false;
    var s = getComputedStyle(e);
    if (e.closest && e.closest('[aria-hidden="true"]')) return false;   /* DateInput のカレンダー用の隠し input など */
    return s.visibility !== 'hidden' && s.display !== 'none' && s.opacity !== '0';
  }
  /* "css" / "css::文字" / 末尾 "@N"（見えているものの N 番目。DateInput のように input が2つあっても、見えるものだけ数える）/ 末尾 "^"（1つ上）・"^2" */
  function find(spec) {
    var up = 0, m = spec.match(/\^(\d*)$/);
    if (m) { up = m[1] ? +m[1] : 1; spec = spec.slice(0, m.index); }
    var nth = 0, mn = spec.match(/@(\d+)$/);
    if (mn) { nth = +mn[1]; spec = spec.slice(0, mn.index); }
    var css = spec, txt = null, k = spec.indexOf('::');
    if (k >= 0) { css = spec.slice(0, k) || '*'; txt = spec.slice(k + 2); }
    var els;
    try { els = Array.prototype.slice.call(document.querySelectorAll(css)); } catch (e) { return null; }
    els = els.filter(vis);
    if (txt) {
      els = els.filter(function (e) { return (e.textContent || '').indexOf(txt) >= 0; });
      els.sort(function (a, b) { return a.textContent.length - b.textContent.length; });
    }
    var e = (nth ? els[nth - 1] : els[0]) || null;
    while (e && up-- > 0) e = e.parentElement;
    return e;
  }
  function layer() {
    var L = document.getElementById(LAYER_ID);
    if (!L) {
      L = document.createElement('div'); L.id = LAYER_ID;
      L.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;z-index:2147483000;pointer-events:none';
      document.body.appendChild(L);
      var st = document.createElement('style');
      st.textContent =
        '#' + LAYER_ID + ' .kdb{position:absolute;min-width:22px;height:22px;padding:0 6px;border-radius:11px;' +
        'font:700 12px/22px system-ui,sans-serif;color:#fff;text-align:center;box-shadow:0 0 0 2px #fff,0 2px 6px rgba(0,0,0,.35);' +
        'pointer-events:auto;cursor:pointer;white-space:nowrap;letter-spacing:0}' +
        '#' + LAYER_ID + ' .kdb.leaf{background:#D6246E}' +
        '#' + LAYER_ID + ' .kdb.area{background:#1D4ED8}' +
        '#' + LAYER_ID + ' .kdbox{position:absolute;border:2px dashed #1D4ED8;border-radius:6px;pointer-events:none}' +
        '#' + LAYER_ID + ' .kdbox.leaf{border:1.5px solid rgba(214,36,110,.55);border-radius:4px}' +
        '#' + LAYER_ID + ' .kdbox.sel{border:3px solid #F59E0B!important;background:rgba(245,158,11,.12);box-shadow:0 0 0 4px rgba(245,158,11,.25)}' +
        '#' + LAYER_ID + ' .kdb.sel{background:#F59E0B!important;color:#111;transform:scale(1.25)}' +
        '#' + LAYER_ID + '.hidebox .kdbox:not(.sel){display:none}';
      document.head.appendChild(st);
    }
    return L;
  }
  var ITEMS = [], SEL = null, onPick = null, showBox = true;
  function isArea(it) { return it.kind === 'area' || it.kind === 'modal' || it.kind === 'table'; }
  function draw() {
    var L = layer(); L.innerHTML = '';
    L.classList.toggle('hidebox', !showBox);
    var sx = window.scrollX, sy = window.scrollY, res = [];
    ITEMS.forEach(function (it) {
      var el = find(it.sel); res.push({ no: it.no, found: !!el });
      if (!el) return;
      var r = el.getBoundingClientRect(), area = isArea(it);
      var x = r.left + sx, y = r.top + sy;
      var box = document.createElement('div');
      box.className = 'kdbox ' + (area ? 'area' : 'leaf') + (SEL === it.no ? ' sel' : '');
      box.style.cssText += ';left:' + (x - 2) + 'px;top:' + (y - 2) + 'px;width:' + (r.width + 4) + 'px;height:' + (r.height + 4) + 'px';
      L.appendChild(box);
      var b = document.createElement('div');
      b.className = 'kdb ' + (area ? 'area' : 'leaf') + (SEL === it.no ? ' sel' : '');
      b.textContent = it.no;
      b.title = it.no + ' ' + (it.ja || '');
      var bx = area ? x - 4 : x - 9, by = area ? y - 13 : y - 11;
      b.style.left = Math.max(0, bx) + 'px'; b.style.top = Math.max(0, by) + 'px';
      b.onclick = function (ev) { ev.stopPropagation(); ev.preventDefault(); if (onPick) onPick(it.no); };
      L.appendChild(b);
    });
    return res;
  }
  var raf = 0;
  function sched() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; draw(); }); }
  window.__KD = {
    find: find,
    set: function (items, pick) { ITEMS = items || []; onPick = pick || null; SEL = null; return draw(); },
    draw: draw,
    box: function (on) { showBox = on; draw(); },
    select: function (no, scroll) {
      SEL = no; draw();
      if (!scroll) return;
      var it = ITEMS.filter(function (i) { return i.no === no; })[0];
      var el = it && find(it.sel);
      if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    },
    live: function () {
      window.addEventListener('scroll', sched, true);
      window.addEventListener('resize', sched);
      new MutationObserver(function (ms) {
        for (var i = 0; i < ms.length; i++) { if (!ms[i].target.closest || !ms[i].target.closest('#' + LAYER_ID)) { sched(); return; } }
      }).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class', 'style'] });
      setInterval(sched, 800);
    }
  };
})();
