(function () {
  'use strict';

  /* ─── Create the overlay ───────────────────────────────────────── */
  const mask = document.createElement('div');
  mask.style.cssText = [
    'position:fixed',
    'inset:0',
    'width:100vw',
    'height:100vh',
    'background:#f47aab',
    'z-index:99999',
    'pointer-events:none',
    'will-change:clip-path',
    'clip-path:circle(150% at 50% 50%)',
  ].join(';');

  const EASING = 'cubic-bezier(0.77, 0, 0.175, 1)';
  const FULL   = 'circle(150% at 50% 50%)';
  const ZERO   = 'circle(0%   at 50% 50%)';

  /* ─── Reveal: circle shrinks → page appears ────────────────────── */
  function reveal() {
    mask.animate(
      [{ clipPath: FULL }, { clipPath: ZERO }],
      { duration: 680, easing: EASING, fill: 'forwards' }
    );
  }

  /* ─── Close: circle grows → pink covers screen ─────────────────── */
  function close(dest) {
    var anim = mask.animate(
      [{ clipPath: ZERO }, { clipPath: FULL }],
      { duration: 520, easing: EASING, fill: 'forwards' }
    );
    anim.onfinish = function () {
      window.location.href = dest;
    };
  }

  /* ─── Init: inject into DOM and reveal ─────────────────────────── */
  function init() {
    document.body.appendChild(mask);
    reveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ─── Intercept internal link clicks ───────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !a.href) return;

    try {
      var url  = new URL(a.href, window.location.href);
      var href = a.getAttribute('href') || '';

      var isInternal  = url.origin === window.location.origin;
      var isHash      = href.charAt(0) === '#' || (url.pathname === window.location.pathname && url.hash);
      var isNewTab    = a.getAttribute('target') === '_blank';

      if (isInternal && !isHash && !isNewTab) {
        e.preventDefault();
        close(a.href);
      }
    } catch (err) { /* ignore */ }
  });

  /* ─── Handle back/forward browser cache ────────────────────────── */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      // Cancel any running animation, reset to full, then reveal
      mask.getAnimations().forEach(function (a) { a.cancel(); });
      mask.style.clipPath = FULL;
      reveal();
    }
  });
})();
