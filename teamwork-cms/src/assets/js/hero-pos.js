/* Homepage hero: the Teamwork POS checkout panel completing a sale.
   Runs once on load, then rests on the paid state.
   Markup ships in the finished state, so no-JS and reduced-motion see the payoff. */
(function () {
  var FINAL = { qty: 3, sub: '104.39', tax: '15.11', tot: '119.50' };

  function init() {
    var root = document.getElementById('hposDevice');
    if (!root) return;
    var qty = root.querySelector('[data-pos-qty]');
    var sub = root.querySelector('[data-pos-sub]');
    var tax = root.querySelector('[data-pos-tax]');
    var tot = root.querySelector('[data-pos-tot]');
    var pay = root.querySelector('.pos-pay');
    var itemsRow = document.getElementById('posItemsRow');
    var annot = document.getElementById('hposAnnot');
    if (!qty || !sub || !tax || !tot || !pay) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;                        // leave the finished sale in place

    // rewind to an empty basket
    root.classList.add('hpos-armed');
    qty.textContent = '0'; sub.textContent = '0.00';
    tax.textContent = '0.00'; tot.textContent = '0.00';

    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    var played = false;

    function play() {
      if (played) return;
      played = true;

      at(450,  function () { qty.textContent = '1'; sub.textContent = '34.99'; flash(); });
      at(1250, function () { if (annot) annot.classList.add('is-on'); });
      // the RFID beat: two more items land together rather than one at a time
      at(1600, function () { qty.textContent = '3'; sub.textContent = '104.39'; flash(); });
      at(2300, function () { tax.textContent = FINAL.tax; });
      at(2650, function () { tot.textContent = FINAL.tot; root.classList.add('hpos-ready'); });
      at(3500, function () { pay.classList.add('is-pressed'); });
      at(3750, function () { pay.classList.remove('is-pressed'); });
      at(3900, function () {
        pay.classList.add('is-paid');
        pay.textContent = '✓ PAID';
        root.classList.add('hpos-rest');
        if (annot) annot.classList.remove('is-on');
      });
    }

    function flash() {
      if (!itemsRow) return;
      itemsRow.classList.remove('is-hit');
      void itemsRow.offsetWidth;
      itemsRow.classList.add('is-hit');
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        if (es[0].isIntersecting) { play(); io.disconnect(); }
      }, { threshold: 0.25 });
      io.observe(root);
    } else play();

    reduce.addEventListener && reduce.addEventListener('change', function () {
      if (!reduce.matches) return;
      timers.forEach(clearTimeout);
      qty.textContent = FINAL.qty; sub.textContent = FINAL.sub;
      tax.textContent = FINAL.tax; tot.textContent = FINAL.tot;
      pay.classList.add('is-paid'); pay.textContent = '✓ PAID';
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
