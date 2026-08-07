/* Homepage hero: the POS completes one sale on load, then rests.
   Elements are visible by default so the finished state shows without JS.
   JS hides them, then reveals each at its data-at time in ms. */
(function () {
  function init() {
    var root = document.getElementById('hposDevice');
    if (!root) return;
    var steps = [].slice.call(root.querySelectorAll('[data-at]'));
    if (!steps.length) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;                 // leave the finished state in place

    root.classList.add('hpos-armed');           // css hides the steps once armed
    var status = root.querySelector('.hpos-status');
    if (status) { status.textContent = 'Ready'; status.classList.remove('is-paid'); }
    var timers = [];
    var played = false;

    function play() {
      if (played) return;
      played = true;
      steps.forEach(function (el) {
        var at = parseInt(el.getAttribute('data-at'), 10) || 0;
        timers.push(setTimeout(function () {
          el.classList.add('is-on');
          if (el.classList.contains('hpos-status')) el.textContent = 'Scanning';
          // the payment slot turns into the approval rather than adding a row
          if (el.classList.contains('hpos-done-face')) el.parentNode.classList.add('is-paid');
        }, at));
      });
      // settle the header state at the end of the sequence
      timers.push(setTimeout(function () {
        var s = root.querySelector('.hpos-status');
        if (s) { s.textContent = 'Paid'; s.classList.add('is-paid'); }
        root.classList.add('hpos-rest');
      }, 5000));
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { play(); io.disconnect(); }
      }, { threshold: 0.25 });
      io.observe(root);
    } else play();

    reduce.addEventListener && reduce.addEventListener('change', function () {
      if (reduce.matches) {
        timers.forEach(clearTimeout);
        steps.forEach(function (el) { el.classList.add('is-on'); });
      }
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
