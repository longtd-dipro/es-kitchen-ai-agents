/* =============================================================
   ESKitchen — Company-Contract Phase 2 · Shared Mockup JS
   - API annotation toggle (show field tags + notes)
   - Slide-out API spec drawer (content declared per page)
   - Modal open/close
   ============================================================= */
(function () {
  'use strict';

  // ---- API annotation mode (persisted across pages) ----
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
    try { localStorage.setItem('esk_api_mode', on ? '1' : '0'); } catch (e) {}
    applyApiMode(on);
  };

  // ---- Drawer ----
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

  // ---- Modal ----
  window.openModal = function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('open');
  };
  window.closeModal = function (id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('open');
  };

  // ---- Inject the floating action button + drawer mask once ----
  function injectChrome() {
    if (!document.querySelector('.api-fab')) {
      var fab = document.createElement('div');
      fab.className = 'api-fab';
      var hasDrawer = !!document.getElementById('apiDrawer');
      fab.innerHTML =
        (hasDrawer ? '<button class="spec btn" onclick="openDrawer()">{ } API仕様</button>' : '') +
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
    try { saved = localStorage.getItem('esk_api_mode') || '0'; } catch (e) {}
    applyApiMode(saved === '1');

    // Close modals/drawer on Esc
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        closeDrawer();
        document.querySelectorAll('.modal-mask.open').forEach(function (m) { m.classList.remove('open'); });
      }
    });
    // Click on mask closes modal
    document.querySelectorAll('.modal-mask').forEach(function (m) {
      m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
    });
  });
})();
