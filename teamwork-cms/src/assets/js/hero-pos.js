/* Homepage hero: the Sales Receipt screen performing a sale, on a loop.
   Items ring in one by one, a visible touch point swipes a row open and taps the
   courtesy discount, then taps PAY. The paid state holds, the screen wipes, and the
   sale runs again while the hero is on screen. The device answers the pointer with a
   shallow tilt and a keylight sweeps the frame once per cycle.
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
  var HOLD_PAID_MS = 4200;   // how long the finished sale rests before the next cycle

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
    var stage = root.closest('.hpos-stage');
    if (!sub || !tax || !tot || !pay || items.length !== 4) return;

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce.matches) return;

    /* ---- the touch point ---- */
    var touch = document.createElement('span');
    touch.className = 'hpos-touch';
    touch.setAttribute('aria-hidden', 'true');
    root.appendChild(touch);

    // Position relative to the device, measured live so the tilt and any reflow
    // cannot strand the dot. ax/ay place the point within the target box.
    function moveTouch(target, ax, ay) {
      var r = target.getBoundingClientRect(), d = root.getBoundingClientRect();
      touch.style.left = (r.left - d.left + r.width * ax) + 'px';
      touch.style.top = (r.top - d.top + r.height * ay) + 'px';
    }
    function press() {
      touch.classList.remove('is-press');
      void touch.offsetWidth;
      touch.classList.add('is-press');
    }

    /* ---- state machine ---- */
    root.classList.add('hpos-armed');
    var timers = [];
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }

    function rewind() {
      items.forEach(function (el) { el.classList.remove('is-on', 'is-disc', 'is-swiped'); });
      if (note) note.classList.remove('is-on');
      root.classList.remove('hpos-ready');
      if (stage) stage.classList.remove('is-celebrate');
      pay.classList.remove('is-paid', 'is-pressed');
      pay.textContent = 'PAY';
      qtys.forEach(function (el) { el.textContent = '0'; });
      sub.textContent = '0.00'; tax.textContent = '0.00'; tot.textContent = '0.00';
      disc.textContent = '0.00';
      if (discRow) discRow.style.visibility = 'hidden';
    }

    function land(i) {
      items[i].classList.add('is-on');
      var st = STEPS[i];
      qtys.forEach(function (el) { el.textContent = st.qty; });
      sub.textContent = st.sub; tax.textContent = st.tax; tot.textContent = st.tot;
    }

    var visible = false, running = false;

    function cycle() {
      if (!visible) { running = false; return; }
      running = true;

      root.classList.add('is-sweep');
      at(1700, function () { root.classList.remove('is-sweep'); });

      at(400,  function () { land(0); });
      at(1050, function () { land(1); });
      at(1700, function () { land(2); });
      at(2350, function () { land(3); });

      // the touch point slides the scarf row open
      at(3050, function () {
        moveTouch(items[1], 0.9, 0.5);
        touch.classList.add('is-on');
      });
      at(3350, function () {
        moveTouch(items[1], 0.55, 0.5);
        items[1].classList.add('is-swiped');
        if (annot) annot.classList.add('is-on');
      });
      // tap Disc: discount applies, row swings back, figures settle
      at(4300, function () {
        var act = items[1].querySelector('.srx-act-d') || items[1];
        moveTouch(act, 0.5, 0.5);
      });
      at(4750, function () {
        press();
        items[1].classList.remove('is-swiped');
        items[1].classList.add('is-disc');
        if (annot) annot.classList.remove('is-on');
        if (note) note.classList.add('is-on');
        if (discRow) discRow.style.visibility = '';
        disc.textContent = F.disc;
        tax.textContent = F.tax; tot.textContent = F.tot;
        root.classList.add('hpos-ready');
      });

      // tap PAY
      at(5900, function () { moveTouch(pay, 0.5, 0.5); });
      at(6450, function () { press(); pay.classList.add('is-pressed'); });
      at(6700, function () { pay.classList.remove('is-pressed'); });
      at(6850, function () {
        pay.classList.add('is-paid');
        pay.textContent = '✓ PAID';
        if (stage) stage.classList.add('is-celebrate');
        touch.classList.remove('is-on');
      });
      at(8400, function () { if (stage) stage.classList.remove('is-celebrate'); });

      // wipe to a fresh sale and go again
      at(6850 + HOLD_PAID_MS, function () {
        root.classList.add('is-wiping');
      });
      at(6850 + HOLD_PAID_MS + 380, function () {
        rewind();
        root.classList.remove('is-wiping');
        clearTimers();
        cycle();
      });
    }

    function maybeStart() { if (visible && !running) { rewind(); cycle(); } }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        if (visible) maybeStart();
        // offscreen: let the current cycle finish its timers; the loop stops at the
        // next cycle() gate, and maybeStart restarts it cleanly on re-entry.
      }, { threshold: 0.25 });
      io.observe(root);
    } else { visible = true; maybeStart(); }

    /* ---- pointer tilt (desktop, fine pointers only) ---- */
    var fine = window.matchMedia('(pointer: fine)');
    if (fine.matches) {
      var hero = root.closest('.hpos-hero') || root;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function frame() {
        cx += (tx - cx) * 0.10; cy += (ty - cy) * 0.10;
        root.style.setProperty('--tilty', cx.toFixed(3) + 'deg');
        root.style.setProperty('--tiltx', cy.toFixed(3) + 'deg');
        if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(frame);
        else { raf = null; if (tx === 0 && ty === 0) root.classList.remove('is-tilting'); }
      }
      function aim(e) {
        var r = root.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        nx = Math.max(-1.4, Math.min(1.4, nx)); ny = Math.max(-1.4, Math.min(1.4, ny));
        tx = nx * 3.2; ty = ny * -2.6;
        root.classList.add('is-tilting');
        if (!raf) raf = requestAnimationFrame(frame);
      }
      hero.addEventListener('pointermove', aim);
      hero.addEventListener('pointerleave', function () {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(frame);
      });
    }

    /* ---- reduced motion flips mid-visit: stop everything, rest on the finished sale ---- */
    reduce.addEventListener && reduce.addEventListener('change', function () {
      if (!reduce.matches) return;
      clearTimers();
      visible = false; running = false;
      items.forEach(function (el, i) {
        el.classList.add('is-on');
        el.classList.toggle('is-disc', i === 1);
        el.classList.remove('is-swiped');
      });
      qtys.forEach(function (el) { el.textContent = F.qty; });
      sub.textContent = F.sub; disc.textContent = F.disc;
      tax.textContent = F.tax; tot.textContent = F.tot;
      if (note) note.classList.add('is-on');
      if (discRow) discRow.style.visibility = '';
      pay.classList.add('is-paid'); pay.textContent = '✓ PAID';
      root.classList.remove('is-sweep', 'is-wiping');
      if (stage) stage.classList.remove('is-celebrate');
      touch.classList.remove('is-on');
      root.style.removeProperty('--tiltx'); root.style.removeProperty('--tilty');
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
