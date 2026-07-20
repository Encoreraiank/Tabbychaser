(function () {
  'use strict';

  /* ─── Cat paw SVG ───────────────────────────────────────────────── */
  var PAW = '<svg viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg">'
    + '<ellipse cx="50" cy="72" rx="26" ry="22" fill="currentColor"/>'     /* main pad  */
    + '<ellipse cx="24" cy="46" rx="12" ry="10" fill="currentColor"/>'     /* toe 1     */
    + '<ellipse cx="44" cy="36" rx="12" ry="10" fill="currentColor"/>'     /* toe 2     */
    + '<ellipse cx="64" cy="37" rx="12" ry="10" fill="currentColor"/>'     /* toe 3     */
    + '<ellipse cx="80" cy="50" rx="11" ry="9"  fill="currentColor"/>'     /* toe 4     */
    + '</svg>';

  /* ─── 5 diagonal paw positions: bottom-left → top-right walk ───── */
  /* Alternating left/right paw offset to mimic real cat gait         */
  var PAWS = [
    { x: 8,  y: 72, rot: -25 },
    { x: 22, y: 56, rot:  20 },
    { x: 37, y: 41, rot: -25 },
    { x: 52, y: 26, rot:  20 },
    { x: 67, y: 12, rot: -25 },
  ];

  /* ─── Inject styles ─────────────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent = [
    '.tc-paw-bg{',
      'position:fixed;inset:0;',
      'background:rgba(254,243,232,0.96);',
      'z-index:99997;pointer-events:none;',
      'opacity:0;transition:opacity 0.18s ease;',
    '}',
    '.tc-paw-bg.on{opacity:1;}',

    '.tc-paw{',
      'position:fixed;width:72px;height:72px;',
      'color:#f47aab;',
      'z-index:99998;pointer-events:none;',
      'opacity:0;',
      'transform:scale(0) rotate(var(--r));',
      'transition:',
        'opacity 0.12s ease,',
        'transform 0.22s cubic-bezier(0.34,1.56,0.64,1);',
    '}',
    '.tc-paw.stamp{',
      'opacity:1;',
      'transform:scale(1) rotate(var(--r));',
    '}',

    /* page-entry: cream sheet that instantly covers then fades away */
    '.tc-entry-fade{',
      'position:fixed;inset:0;',
      'background:rgba(254,243,232,0.96);',
      'z-index:99999;pointer-events:none;',
      'opacity:1;transition:opacity 0.32s ease;',
    '}',
    '.tc-entry-fade.out{opacity:0;}',
  ].join('');
  document.head.appendChild(style);

  /* ─── Page ENTRY reveal (new page fades in from cream) ──────────── */
  function pageReveal() {
    var el = document.createElement('div');
    el.className = 'tc-entry-fade';
    document.body.appendChild(el);
    el.getBoundingClientRect();            // force paint
    requestAnimationFrame(function () {
      el.classList.add('out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pageReveal);
  } else {
    pageReveal();
  }

  /* ─── PAW WALK transition on link click ─────────────────────────── */
  function pawTransition(dest) {
    /* 1. Cream background */
    var bg = document.createElement('div');
    bg.className = 'tc-paw-bg';
    document.body.appendChild(bg);
    bg.getBoundingClientRect();
    bg.classList.add('on');

    /* 2. Build paw elements */
    var pawEls = PAWS.map(function (p) {
      var el = document.createElement('div');
      el.className = 'tc-paw';
      el.style.left = p.x + 'vw';
      el.style.top  = p.y + 'vh';
      el.style.setProperty('--r', p.rot + 'deg');
      el.innerHTML = PAW;
      document.body.appendChild(el);
      return el;
    });

    /* 3. Stamp each paw with staggered delay */
    var GAP   = 105;   // ms between each paw stamp
    var START = 60;    // ms after overlay appears

    pawEls.forEach(function (el, i) {
      setTimeout(function () { el.classList.add('stamp'); }, START + i * GAP);
    });

    /* 4. Navigate after last paw lands */
    var navAt = START + (PAWS.length - 1) * GAP + 180;
    setTimeout(function () {
      window.location.href = dest;
    }, navAt);
  }

  /* ─── Intercept internal link clicks ───────────────────────────── */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (!a || !a.href) return;
    try {
      var url  = new URL(a.href, window.location.href);
      var href = a.getAttribute('href') || '';
      var isInternal = url.origin === window.location.origin;
      var isHash     = href.charAt(0) === '#'
                    || (url.pathname === window.location.pathname && url.hash);
      var isNewTab   = a.getAttribute('target') === '_blank';

      if (isInternal && !isHash && !isNewTab) {
        e.preventDefault();
        pawTransition(a.href);
      }
    } catch (err) { /* ignore bad URLs */ }
  });

  /* ─── Handle browser back/forward cache ─────────────────────────── */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) pageReveal();
  });

})();
