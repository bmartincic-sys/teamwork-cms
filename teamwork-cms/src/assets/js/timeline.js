/* Our Story timeline. The year in the left column is pinned, and this drives it:
   whichever entry is crossing the reading line becomes the active one, so the year
   ticks over as the reader descends. Also writes --hist-p for the spine fill.
   Fails open: with no JS the markup shows the first year and CSS fills the spine. */
(function () {
  function init() {
    var lists = [].slice.call(document.querySelectorAll('.hist'));
    if (!lists.length) return;

    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var tracks = lists.map(function (el) {
      var list = el.querySelector('.hist-list');
      if (!list) return null;
      return {
        el: el,
        list: list,
        items: [].slice.call(el.querySelectorAll('.hist-item')),
        now: el.querySelector('.hist-now'),
        count: el.querySelector('.hist-count b'),
        active: -1
      };
    }).filter(Boolean);
    if (!tracks.length) return;

    tracks.forEach(function (t) { t.list.style.setProperty('--hist-p', '0'); });

    var queued = false;
    function update() {
      queued = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      // the reading line sits just under the pinned year so they agree
      var line = vh * 0.44;

      tracks.forEach(function (t) {
        var r = t.list.getBoundingClientRect();

        var p = 0;
        if (r.bottom < line) { p = 1; }
        else if (r.top <= line) { p = (line - r.top) / Math.max(1, r.height); }
        t.list.style.setProperty('--hist-p', (p < 0 ? 0 : p > 1 ? 1 : p).toFixed(3));

        // the active entry is the last one whose top has passed the line
        var idx = 0;
        for (var i = 0; i < t.items.length; i++) {
          if (t.items[i].getBoundingClientRect().top <= line + 1) { idx = i; } else { break; }
        }
        if (idx === t.active) return;
        t.active = idx;

        t.items.forEach(function (it, i) { it.classList.toggle('is-here', i === idx); });

        var year = t.items[idx].getAttribute('data-year');
        if (t.now && year && t.now.textContent !== year) {
          t.now.textContent = year;
          if (!reduced) {
            t.now.classList.remove('is-turning');
            void t.now.offsetWidth;            // restart the flip
            t.now.classList.add('is-turning');
          }
        }
        if (t.count) { t.count.textContent = String(idx + 1); }
      });
    }
    /* Coalesce to a frame, but never depend on one arriving: a paused or throttled
       rAF would latch `queued` and freeze the timeline for the rest of the session. */
    function queue() {
      if (queued) return;
      queued = true;
      var ran = false;
      function run() { if (ran) return; ran = true; update(); }
      requestAnimationFrame(run);
      setTimeout(run, 100);
    }

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue);
    update();
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
