(function () {
  'use strict';

  // 1. Inject Styles for the Circular Page Transition
  const style = document.createElement('style');
  style.textContent = `
    .page-transition-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: #f47aab; /* Signature Brand Pink */
      z-index: 99999;
      pointer-events: none;
      clip-path: circle(150% at 50% 50%);
      transition: clip-path 0.65s cubic-bezier(0.76, 0, 0.24, 1);
    }
    .page-transition-overlay.reveal-hidden {
      clip-path: circle(0% at 50% 50%);
    }
  `;
  document.head.appendChild(style);

  // 2. Inject Overlay Div into Body
  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  document.body.appendChild(overlay);

  // 3. Trigger Reveal Animation on Page Load
  // Wait a tiny frame for the browser to register the initial filled circle state
  requestAnimationFrame(() => {
    setTimeout(() => {
      overlay.classList.add('reveal-hidden');
    }, 50);
  });

  // 4. Intercept Internal Link Clicks for Smooth Circle Wipe Transition
  document.addEventListener('click', function (e) {
    const link = e.target.closest('a');
    if (!link || !link.href) return;

    // Parse URL
    try {
      const targetUrl = new URL(link.href, window.location.href);

      // Check if it's an internal link
      const isInternal = targetUrl.origin === window.location.origin;
      const isSamePage = targetUrl.pathname === window.location.pathname;
      const isHash = link.hash || link.getAttribute('href').startsWith('#');
      const targetAttr = link.getAttribute('target');

      if (isInternal && !isHash && (!targetAttr || targetAttr === '_self')) {
        // Prevent default navigation
        e.preventDefault();

        // Remove the reveal class to make the circle close back in
        overlay.classList.remove('reveal-hidden');

        // Navigate to the target page after the transition completes
        setTimeout(() => {
          window.location.href = link.href;
        }, 600);
      }
    } catch (err) {
      // Ignore invalid URLs
    }
  });

  // 5. Handle back-button cache restore (so page is not black on back button press)
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      overlay.classList.add('reveal-hidden');
    }
  });
})();
