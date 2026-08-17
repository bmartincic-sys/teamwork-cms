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
