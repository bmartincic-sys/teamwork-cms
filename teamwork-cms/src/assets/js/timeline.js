/* Our Story timeline: the spine draws as the reader scrolls through it.
   Rows are revealed by the shared reveal observer in base.njk; this only tracks
   progress for the line, writing one custom property the CSS consumes. Fails open:
   with no JS the spine simply shows at full length. */
(function () {
  function init() {
    var lists = [].slice.call(document.querySelectorAll('.hist'));
    if (!lists.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    lists.forEach(function (el) {
      el.classList.add('hist-live');
      // start empty: the CSS fallback of 1 is for the no-JS case, but with the driver
      // running an unset value would leave the spine full until the first scroll
      el.style.setProperty('--hist-p', '0');
    });

    var queued = false;
    function update() {
      queued = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      lists.forEach(function (el) {
        var r = el.getBoundingClientRect();
        // past it: keep the spine full. Not yet reached: keep it empty.
        if (r.bottom < 0) { el.style.setProperty('--hist-p', '1'); return; }
        if (r.top > vh) { el.style.setProperty('--hist-p', '0'); return; }
        // 0 when the list's top reaches the lower third, 1 once its bottom passes it
        var line = vh * 0.68;
        var p = (line - r.top) / Math.max(1, r.height);
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        el.style.setProperty('--hist-p', p.toFixed(3));
      });
    }
    function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
