(function () {
  'use strict';

  /* ─── 1. Inject Styles ─────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .tc-page-mask {
      position: fixed;
      inset: 0;
      width: 100vw;
      height: 100vh;
      background: #f47aab;
      z-index: 99999;
      pointer-events: none;
      will-change: clip-path;
    }
    /* State: full screen, no transition — starting point on page load */
    .tc-page-mask.state-enter {
      clip-path: circle(150% at 50% 50%);
      transition: none;
    }
    /* State: shrinking circle — page revealing */
    .tc-page-mask.state-reveal {
      clip-path: circle(0% at 50% 50%);
      transition: clip-path 0.7s cubic-bezier(0.77, 0, 0.175, 1);
    }
    /* State: growing circle — page closing before navigation */
    .tc-page-mask.state-close {
      clip-path: circle(150% at 50% 50%);
      transition: clip-path 0.55s cubic-bezier(0.77, 0, 0.175, 1);
    }
  `;
  document.head.appendChild(style);

  /* ─── 2. Create Mask Element ───────────────────────────────────── */
  const mask = document.createElement('div');
  mask.className = 'tc-page-mask state-enter';

  /* ─── 3. Reveal on Page Load ───────────────────────────────────── */
  function runReveal() {
    document.body.appendChild(mask);
    // Force reflow so the browser registers "state-enter" before we swap classes
    mask.getBoundingClientRect();
    requestAnimationFrame(function () {
      mask.classList.remove('state-enter');
      mask.classList.add('state-reveal');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runReveal);
  } else {
    runReveal();
  }

  /* ─── 4. Intercept Internal Link Clicks ───────────────────────── */
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a || !a.href) return;

    try {
      const url = new URL(a.href, window.location.href);
      const href = a.getAttribute('href') || '';
      const isSameOrigin = url.origin === window.location.origin;
      const isHash = href.startsWith('#') || (url.pathname === window.location.pathname && url.hash);
      const isExternal = a.getAttribute('target') === '_blank';

      if (isSameOrigin && !isHash && !isExternal) {
        e.preventDefault();
        const dest = a.href;

        // Reset to revealed state (no transition), then animate close circle
        mask.className = 'tc-page-mask state-reveal';
        mask.getBoundingClientRect(); // force reflow
        requestAnimationFrame(function () {
          mask.classList.remove('state-reveal');
          mask.classList.add('state-close');
          setTimeout(function () {
            window.location.href = dest;
          }, 580);
        });
      }
    } catch (err) {
      // Ignore malformed URLs
    }
  });

  /* ─── 5. Handle Browser Back/Forward Cache ─────────────────────── */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      mask.className = 'tc-page-mask state-enter';
      mask.getBoundingClientRect();
      requestAnimationFrame(function () {
        mask.classList.remove('state-enter');
        mask.classList.add('state-reveal');
      });
    }
  });
})();
