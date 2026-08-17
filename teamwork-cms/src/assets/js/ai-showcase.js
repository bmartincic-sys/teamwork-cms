/* AI showcase sections: the chips arrive in sequence once the section scrolls into
   view, so the panel reads as the model answering rather than as three static labels.
   Markup ships without the is-on class, so no-JS simply never shows them, which the
   CSS also does under prefers-reduced-motion. */
(function () {
  function init() {
    var stages = [].slice.call(document.querySelectorAll('[data-aix]'));
    if (!stages.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function play(stage) {
      var chips = [].slice.call(stage.querySelectorAll('.aix-chip'));
      chips.forEach(function (chip, i) {
        setTimeout(function () { chip.classList.add('is-on'); }, 420 + i * 620);
      });
    }

    if (!('IntersectionObserver' in window)) { stages.forEach(play); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        play(e.target);
        io.unobserve(e.target);   // one performance per visit
      });
    }, { threshold: 0.35 });
    stages.forEach(function (s) { io.observe(s); });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
