/* AI showcase sections: the chips arrive in sequence once the section scrolls into
   view, so the panel reads as the model answering rather than as three static labels.
   Markup ships without the is-on class, so no-JS simply never shows them, which the
   CSS also does under prefers-reduced-motion. */
(function () {
  function init() {
    var stages = [].slice.call(document.querySelectorAll('[data-aix]'));
    if (!stages.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* The scan bar runs for as long as the section is on screen, so the panel keeps
       reading as powered rather than going inert after one pass. The thinking dots and
       the chips are a one-time sequence: dots appear, then each answer lands, then the
       dots retire because the model has answered. */
    function play(stage) {
      stage.classList.add('is-live', 'is-thinking');
      var chips = [].slice.call(stage.querySelectorAll('.aix-chip'));
      chips.forEach(function (chip, i) {
        setTimeout(function () { chip.classList.add('is-on'); }, 640 + i * 620);
      });
      setTimeout(function () {
        stage.classList.remove('is-thinking');
      }, 640 + chips.length * 620);
    }

    if (!('IntersectionObserver' in window)) { stages.forEach(play); return; }
    var seen = new WeakSet();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var st = e.target;
        if (e.isIntersecting) {
          // the scan resumes on re-entry; the chip sequence plays once
          st.classList.add('is-live');
          if (!seen.has(st)) { seen.add(st); play(st); }
        } else {
          st.classList.remove('is-live');
        }
      });
    }, { threshold: 0.3 });
    stages.forEach(function (s) { io.observe(s); });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();


/* ============================================================================
   121 Commerce conversation panel (.aiq)
   A live recreation of the AI Agent screen rather than a screenshot, so the
   answer and the product results actually arrive on the glass, the way the
   homepage receipt performs its sale. Loops while the section is on screen.
   Markup ships in the finished state, so no-JS and reduced-motion readers see
   the completed conversation.
   ========================================================================== */
(function () {
  function init() {
    var panels = [].slice.call(document.querySelectorAll('[data-aiq]'));
    if (!panels.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    panels.forEach(function (panel) {
      var timers = [];
      var running = false, visible = false;
      function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
      function clear() { timers.forEach(clearTimeout); timers = []; }

      var lines = [].slice.call(panel.querySelectorAll('.aiq-line, .aixb-line'));
      var tiles = [].slice.call(panel.querySelectorAll('.aiq-tile, .aixb-tile'));

      function rewind() {
        panel.classList.remove('is-asked', 'is-thinking', 'is-answered', 'is-done');
        lines.forEach(function (l) { l.classList.remove('is-on'); });
        tiles.forEach(function (t) { t.classList.remove('is-on'); });
      }

      function cycle() {
        if (!visible) { running = false; return; }
        running = true;

        at(300,  function () { panel.classList.add('is-asked'); });      // the question lands
        at(1000, function () { panel.classList.add('is-thinking'); });   // model works
        at(2100, function () {
          panel.classList.remove('is-thinking');
          panel.classList.add('is-answered');
        });
        lines.forEach(function (l, i) {
          at(2200 + i * 620, function () { l.classList.add('is-on'); });
        });
        var afterLines = 2200 + lines.length * 620;
        tiles.forEach(function (t, i) {
          at(afterLines + 260 + i * 200, function () { t.classList.add('is-on'); });
        });
        var end = afterLines + 260 + tiles.length * 200;
        at(end + 200, function () { panel.classList.add('is-done'); });

        // hold on the finished answer, then run it again
        at(end + 5200, function () { rewind(); clear(); cycle(); });
      }

      function start() { if (visible && !running) { rewind(); cycle(); } }

      if (!('IntersectionObserver' in window)) { visible = true; start(); return; }
      var io = new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) start();
      }, { threshold: 0.25 });
      io.observe(panel);
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();


/* ============================================================================
   Catalog enrichment diff (.diffx)
   The sparkle works, then each generated field lands, so the AI section on the
   product data page performs its point the way the conversation panel does.
   Rows ship visible; arming them is the driver's first act, so no-JS and
   reduced-motion readers keep the finished record.
   ========================================================================== */
(function () {
  function init() {
    var diffs = [].slice.call(document.querySelectorAll('[data-diffx]'));
    if (!diffs.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    diffs.forEach(function (diff) {
      var rows = [].slice.call(diff.querySelectorAll('.diffx-row.is-add'));
      if (!rows.length) return;
      var timers = [], running = false, visible = false;
      function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
      function clear() { timers.forEach(clearTimeout); timers = []; }

      diff.classList.add('is-armed');

      function cycle() {
        if (!visible) { running = false; return; }
        running = true;
        at(200, function () { diff.classList.add('is-working'); });
        rows.forEach(function (r, i) {
          at(900 + i * 520, function () { r.classList.add('is-on'); });
        });
        var end = 900 + rows.length * 520;
        at(end, function () { diff.classList.remove('is-working'); });
        at(end + 4600, function () {
          rows.forEach(function (r) { r.classList.remove('is-on'); });
          clear();
          cycle();
        });
      }

      if (!('IntersectionObserver' in window)) { visible = true; cycle(); return; }
      var io = new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible && !running) { cycle(); }
      }, { threshold: 0.3 });
      io.observe(diff);
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();


/* ============================================================================
   Parallax for the AI split
   The device and the copy columns move at different rates as the section
   crosses the viewport, which is what stops the block reading as one flat
   plane. Writes a single custom property; the CSS decides how each layer
   uses it, so the copy can travel the opposite way without extra bookkeeping.
   ========================================================================== */
(function () {
  function init() {
    var splits = [].slice.call(document.querySelectorAll('.aix-split'));
    if (!splits.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var RANGE = 26;      // px of travel for the device layer
    var queued = false;

    function update() {
      queued = false;
      var vh = window.innerHeight || 1;
      splits.forEach(function (s) {
        // only pay for sections near the viewport
        var r = s.getBoundingClientRect();
        if (r.bottom < -vh || r.top > vh * 2) return;
        // -1 when the section sits below the fold, +1 once it has passed above
        var centre = r.top + r.height / 2;
        var p = (vh / 2 - centre) / (vh / 2 + r.height / 2);
        p = p < -1 ? -1 : p > 1 ? 1 : p;
        s.style.setProperty('--aixp', (p * RANGE).toFixed(2));
      });
    }
    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }

    // the stacked layout drops the parallax, so below that width do nothing
    var wide = window.matchMedia('(min-width: 1041px)');
    function bind() {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (wide.matches) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        update();
      } else {
        splits.forEach(function (s) { s.style.removeProperty('--aixp'); });
      }
    }
    wide.addEventListener ? wide.addEventListener('change', bind) : wide.addListener(bind);
    bind();
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
