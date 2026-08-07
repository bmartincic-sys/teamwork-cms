/* Homepage hero: the Sales Receipt screen completing a sale.
   Items ring in one by one, a row swipes open to its line actions, a courtesy
   discount lands, then PAY. Runs once, then rests on the paid state.
   Markup ships finished, so no-JS and reduced-motion see the completed sale. */
(function () {
  var F = { qty: '4', sub: '2,955.00', disc: '39.50', tax: '233.24', tot: '3,148.74' };
  // running figures after each item lands (gross, tax on gross @8%, total)
  var STEPS = [
    { qty: '1', sub: '1,290.00', tax: '103.20', tot: '1,393.20' },
    { qty: '2', sub: '1,685.00', tax: '134.80', tot: '1,819.80' },
    { qty: '3', sub: '2,535.00', tax: '202.80', tot: '2,737.80' },
    { qty: '4', sub: '2,955.00', tax: '236.40', tot: '3,191.40' }
  ];

  function init() {
    var root = document.getElementById('hposDevice');
    if (!root) return;
    var q  = function (sel) { return root.querySelector(sel); };
    var qa = function (sel) { return [].slice.call(root.querySelectorAll(sel)); };
    var qtys = qa('[data-srx-qty], [data-srx-qty2], [data-srx-qty3]');
    var sub = q('[data-srx-sub]'), disc = q('[data-srx-disc]');
    var tax = q('[data-srx-tax]'), tot = q('[data-srx-tot]');
    var discRow = disc ? disc.closest('.srx-row') : null;
    var items = qa('[data-srx-item]');
    var note = q('[data-srx-note]');
    var pay = q('.srx-pay');
    var annot = document.getElementById('hposAnnot');
    if (!sub || !tax || !tot || !pay || items.length !== 4) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    // rewind to an empty cart
    root.classList.add('hpos-armed');
    qtys.forEach(function (el) { el.textContent = '0'; });
    sub.textContent = '0.00'; tax.textContent = '0.00'; tot.textContent = '0.00';
    disc.textContent = '0.00';
    if (discRow) discRow.style.visibility = 'hidden';

    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    var played = false;

    function land(i) {
      items[i].classList.add('is-on');
      var st = STEPS[i];
      qtys.forEach(function (el) { el.textContent = st.qty; });
      sub.textContent = st.sub; tax.textContent = st.tax; tot.textContent = st.tot;
    }

    function play() {
      if (played) return;
      played = true;

      at(400,  function () { land(0); });
      at(1050, function () { land(1); });
      at(1700, function () { land(2); });
      at(2350, function () { land(3); });

      // swipe the scarf row open to its line actions
      at(3100, function () { items[1].classList.add('is-swiped'); if (annot) annot.classList.add('is-on'); });
      // discount applies: row swings back, price restates, figures settle
      at(4100, function () {
        items[1].classList.remove('is-swiped');
        items[1].classList.add('is-disc');
        if (annot) annot.classList.remove('is-on');
        if (note) note.classList.add('is-on');
        if (discRow) discRow.style.visibility = '';
        disc.textContent = F.disc;
        tax.textContent = F.tax; tot.textContent = F.tot;
        root.classList.add('hpos-ready');
      });

      at(5100, function () { pay.classList.add('is-pressed'); });
      at(5350, function () { pay.classList.remove('is-pressed'); });
      at(5500, function () {
        pay.classList.add('is-paid');
        pay.textContent = '✓ PAID';
        root.classList.add('hpos-rest');
      });
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
      items.forEach(function (el) { el.classList.add('is-on', 'is-disc'); el.classList.remove('is-swiped'); });
      items.forEach(function (el, i) { if (i !== 1) el.classList.remove('is-disc'); });
      qtys.forEach(function (el) { el.textContent = F.qty; });
      sub.textContent = F.sub; disc.textContent = F.disc;
      tax.textContent = F.tax; tot.textContent = F.tot;
      if (note) note.classList.add('is-on');
      if (discRow) discRow.style.visibility = '';
      pay.classList.add('is-paid'); pay.textContent = '✓ PAID';
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
