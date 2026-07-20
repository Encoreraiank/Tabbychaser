(function () {
  'use strict';

  /* ─── Inject styles ─────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = `
    .tc-fade-overlay {
      position: fixed;
      inset: 0;
      background: #f47aab;
      z-index: 99999;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.38s ease;
    }
    .tc-fade-overlay.visible {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  /* ─── Create overlay ────────────────────────────────────────────── */
  var overlay = document.createElement('div');
  overlay.className = 'tc-fade-overlay';

  /* ─── Init: inject and fade out (reveal current page) ───────────── */
  function init() {
    document.body.appendChild(overlay);
    // Start visible (pink), then fade out to reveal the page
    overlay.classList.add('visible');
    // Force reflow so browser sees the "visible" state
    overlay.getBoundingClientRect();
    requestAnimationFrame(function () {
      overlay.classList.remove('visible');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ─── Intercept link clicks ─────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !a.href) return;

    try {
      var url  = new URL(a.href, window.location.href);
      var href = a.getAttribute('href') || '';
      var isInternal = url.origin === window.location.origin;
      var isHash     = href.charAt(0) === '#' || (url.pathname === window.location.pathname && url.hash);
      var isNewTab   = a.getAttribute('target') === '_blank';

      if (isInternal && !isHash && !isNewTab) {
        e.preventDefault();
        var dest = a.href;

        // Fade IN the pink overlay, then navigate
        overlay.classList.add('visible');
        setTimeout(function () {
          window.location.href = dest;
        }, 400);
      }
    } catch (err) { /* ignore */ }
  });

  /* ─── Handle back/forward browser cache ─────────────────────────── */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      overlay.classList.add('visible');
      overlay.getBoundingClientRect();
      requestAnimationFrame(function () {
        overlay.classList.remove('visible');
      });
    }
  });

})();
