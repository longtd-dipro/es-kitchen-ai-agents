/* =============================================================
   ESKitchen — User Engagement Phase 2 · Shared Mobile Mockup JS
   - FE注釈 (field-tag) annotation toggle, persisted across pages
   - Slide-out API spec drawer (content declared per page)
   - In-phone navigation: screen switch, bottom sheet, center dialog
   - Reusable widgets: star rating, allergen toggle, choice chip,
     3-tier rank, character counter
   ============================================================= */
(function () {
  'use strict';

  /* ---- FE annotation mode (show field-name tags) ---- */
  function applyApiMode(on) {
    document.body.classList.toggle('api-on', on);
    var t = document.querySelector('.api-fab .toggle');
    if (t) {
      t.classList.toggle('on', on);
      t.innerHTML = on ? '🏷️ FE注釈: ON' : '🏷️ FE注釈: OFF';
    }
  }
  window.toggleApiMode = function () {
    var on = !document.body.classList.contains('api-on');
    try { localStorage.setItem('esk_eng_api_mode', on ? '1' : '0'); } catch (e) {}
    applyApiMode(on);
  };

  /* ---- API spec drawer ---- */
  window.openDrawer = function () {
    var d = document.getElementById('apiDrawer'), m = document.getElementById('drawerMask');
    if (d) d.classList.add('open');
    if (m) m.classList.add('open');
  };
  window.closeDrawer = function () {
    var d = document.getElementById('apiDrawer'), m = document.getElementById('drawerMask');
    if (d) d.classList.remove('open');
    if (m) m.classList.remove('open');
  };

  /* ---- In-phone screen navigation ---- */
  // Switch the active .screen inside the nearest .phone (or whole doc).
  window.goScreen = function (id, scope) {
    var root = scope ? document.getElementById(scope) : document;
    var target = document.getElementById(id);
    if (!target) return;
    var phone = target.closest('.phone') || root;
    phone.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    target.classList.add('active');
    var body = target.querySelector('.app-body');
    if (body) body.scrollTop = 0;
  };

  /* ---- Overlays: bottom sheet & center dialog ---- */
  window.openOverlay = function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  };
  window.closeOverlay = function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('open');
  };

  /* ---- Widgets ---- */
  // Star rating: container has .star children; clicking sets 1..n on.
  window.setStars = function (starEl) {
    var wrap = starEl.parentElement;
    var stars = Array.prototype.slice.call(wrap.querySelectorAll('.star'));
    var idx = stars.indexOf(starEl);
    stars.forEach(function (s, i) { s.classList.toggle('on', i <= idx); });
    var score = wrap.querySelector('.score');
    if (score) score.textContent = '(' + (idx + 1) + '/5)';
    wrap.setAttribute('data-score', idx + 1);
  };

  // Allergen chip toggle; updates an optional counter [data-allergen-count].
  window.toggleAllergen = function (el) {
    el.classList.toggle('on');
    var grid = el.closest('[data-allergen-scope]') || document;
    var n = grid.querySelectorAll('.allergen-chip.on').length;
    grid.querySelectorAll('[data-allergen-count]').forEach(function (c) { c.textContent = n; });
    document.querySelectorAll('[data-allergen-count-global]').forEach(function (c) { c.textContent = n; });
  };

  // Review choice chip toggle (good/bad variant from data-variant).
  window.toggleChoice = function (el) {
    var v = el.getAttribute('data-variant') === 'bad' ? 'on-bad' : 'on-good';
    el.classList.toggle(v);
  };

  // 3-tier rank: clicking one selects it (radio within group), click again clears.
  // Updates a [data-wishlist-count] live counter (distinct products rated).
  window.selectRank = function (btn, tier) {
    var group = btn.parentElement;
    var wasOn = btn.classList.contains('s1') || btn.classList.contains('s2') || btn.classList.contains('s3');
    var hadAny = group.querySelector('.s1,.s2,.s3');
    group.querySelectorAll('.rank-btn').forEach(function (b) { b.classList.remove('s1', 's2', 's3'); });
    if (!wasOn) btn.classList.add('s' + tier);
    var nowAny = group.querySelector('.s1,.s2,.s3');
    var counter = document.querySelector('[data-wishlist-count]');
    if (counter) {
      var n = parseInt(counter.textContent || '0', 10);
      if (!hadAny && nowAny) n++;
      if (hadAny && !nowAny) n--;
      counter.textContent = n;
    }
  };

  // Character counter for textarea [data-counter="#id"].
  window.countChars = function (ta) {
    var id = ta.getAttribute('data-counter');
    var out = id && document.querySelector(id);
    if (out) out.textContent = ta.value.length;
  };

  /* ---- Inject FAB + drawer mask once ---- */
  function injectChrome() {
    if (!document.querySelector('.api-fab') && !document.body.classList.contains('no-fab')) {
      var fab = document.createElement('div');
      fab.className = 'api-fab';
      var hasDrawer = !!document.getElementById('apiDrawer');
      fab.innerHTML =
        (hasDrawer ? '<button class="spec" onclick="openDrawer()">{ } API仕様</button>' : '') +
        '<button class="toggle" onclick="toggleApiMode()">🏷️ FE注釈: OFF</button>';
      document.body.appendChild(fab);
    }
    if (document.getElementById('apiDrawer') && !document.getElementById('drawerMask')) {
      var mask = document.createElement('div');
      mask.id = 'drawerMask';
      mask.className = 'drawer-mask';
      mask.setAttribute('onclick', 'closeDrawer()');
      document.body.appendChild(mask);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    injectChrome();
    var saved = '0';
    try { saved = localStorage.getItem('esk_eng_api_mode') || '0'; } catch (e) {}
    applyApiMode(saved === '1');

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDrawer();
        document.querySelectorAll('.overlay.open').forEach(function (m) { m.classList.remove('open'); });
      }
    });
    // tap on overlay backdrop closes it
    document.querySelectorAll('.overlay').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
    });
  });
})();
