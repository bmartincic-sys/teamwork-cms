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
  var HOLD_PAID_MS = 5200;   // how long the finished sale rests before the next cycle

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

    /* ---- rolling numbers ----
       Totals count to their new value instead of snapping. 520ms with a cubic
       ease-out fits inside the 650ms gap between item landings. */
    // setTimeout rather than requestAnimationFrame: rAF throttles to zero in hidden
    // tabs, which would leave a total resting on a mid-roll value until the visitor
    // came back. Timeout stepping always finishes the roll.
    function tick(el, target) {
      var from = parseFloat((el.textContent || '0').replace(/,/g, '')) || 0;
      var to = parseFloat(String(target).replace(/,/g, ''));
      if (el._tick) clearTimeout(el._tick);
      if (!isFinite(to) || from === to) { el.textContent = target; return; }
      var t0 = Date.now(), dur = 520;
      (function step() {
        var p = Math.min(1, (Date.now() - t0) / dur);
        var e = 1 - Math.pow(1 - p, 3);
        var v = from + (to - from) * e;
        el.textContent = v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        el._tick = p < 1 ? setTimeout(step, 24) : null;
      })();
    }
    function snap(el, v) {
      if (el._tick) { clearTimeout(el._tick); el._tick = null; }
      el.textContent = v;
    }

    /* ---- narration chips ----
       Two glass pills that say what the demo just did: the whole basket arriving in
       one read, then Tap to Pay at the payment beat. */
    function chip(cls, html) {
      var el = document.createElement('span');
      el.className = 'hpos-chip ' + cls;
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = html;
      (stage || root).appendChild(el);
      return el;
    }
    var chipRfid = chip('hpos-chip-rfid', '<i class="pulse-dot"></i> RFID: the whole basket in one read');
    var chipPay = chip('hpos-chip-pay', '<i class="pulse-dot"></i> Tap to Pay');

    /* ---- camera layer ----
       The receipt's content moves into a wrapper the camera beats can drive. Children
       of the device (veil, touch point) stay outside it, so only the UI zooms. */
    var screenEl = q('.hpos-screen');
    var cam = document.createElement('div');
    cam.className = 'srx-cam';
    while (screenEl.firstChild) cam.appendChild(screenEl.firstChild);
    screenEl.appendChild(cam);

    // Push in on a target: translate is computed from unzoomed geometry, clamped so
    // the zoomed content can never pull an edge inside the bezel.
    function camFocus(target, s) {
      var cr = cam.getBoundingClientRect(), tr = target.getBoundingClientRect();
      var dx = (cr.left + cr.width / 2) - (tr.left + tr.width / 2);
      var dy = (cr.top + cr.height / 2) - (tr.top + tr.height / 2);
      var mx = (cr.width / 2) * (1 - 1 / s), my = (cr.height / 2) * (1 - 1 / s);
      dx = Math.max(-mx, Math.min(mx, dx));
      dy = Math.max(-my, Math.min(my, dy));
      cam.style.setProperty('--cam', s);
      cam.style.setProperty('--camdx', dx.toFixed(1) + 'px');
      cam.style.setProperty('--camdy', dy.toFixed(1) + 'px');
    }
    function camWide() {
      cam.style.removeProperty('--cam');
      cam.style.removeProperty('--camdx');
      cam.style.removeProperty('--camdy');
    }
    function camPunch() {
      cam.classList.remove('cam-punch');
      void cam.offsetWidth;
      cam.classList.add('cam-punch');
    }

    /* ---- power-on veil (first cycle only) ---- */
    var veil = document.createElement('span');
    veil.className = 'hpos-bootveil';
    veil.setAttribute('aria-hidden', 'true');
    root.appendChild(veil);
    var booted = false;

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
      root.classList.remove('is-paidwash', 'is-payflash', 'is-scan');
      pay.textContent = 'PAY';
      qtys.forEach(function (el) { el.textContent = '0'; });
      snap(sub, '0.00'); snap(tax, '0.00'); snap(tot, '0.00'); snap(disc, '0.00');
      if (discRow) discRow.style.visibility = 'hidden';
      chipRfid.classList.remove('is-on');
      chipPay.classList.remove('is-on');
      camWide();
      cam.classList.remove('cam-punch');
    }

    function land(i) {
      items[i].classList.add('is-on');
      var st = STEPS[i];
      qtys.forEach(function (el) { el.textContent = st.qty; });
      tick(sub, st.sub); tick(tax, st.tax); tick(tot, st.tot);
    }

    var visible = false, running = false;

    function cycle() {
      if (!visible) { running = false; return; }
      running = true;

      root.classList.add('is-sweep');
      at(1700, function () { root.classList.remove('is-sweep'); });

      // the beam runs hot while the basket is being read
      at(350,  function () { root.classList.add('is-scan'); });
      at(2100, function () { root.classList.remove('is-scan'); });

      // the basket lands as one fast burst, which is the RFID story: four items,
      // one read. The chip makes the claim while it is happening.
      at(500,  function () { chipRfid.classList.add('is-on'); });
      at(2500, function () { chipRfid.classList.remove('is-on'); });

      at(400,  function () { land(0); });
      at(700,  function () { land(1); });
      at(1000, function () { land(2); });
      at(1300, function () { land(3); });

      // the camera pushes in on the scarf row for the discount scene
      at(2550, function () { camFocus(items[1], 1.18); });
      // and pulls wide before the payment
      at(4900, function () { camWide(); });

      // the touch point slides the scarf row open
      at(2400, function () {
        moveTouch(items[1], 0.9, 0.5);
        touch.classList.add('is-on');
      });
      at(2750, function () {
        moveTouch(items[1], 0.55, 0.5);
        items[1].classList.add('is-swiped');
        if (annot) annot.classList.add('is-on');
      });
      // tap Disc: discount applies, row swings back, figures settle
      at(3650, function () {
        var act = items[1].querySelector('.srx-act-d') || items[1];
        moveTouch(act, 0.5, 0.5);
      });
      at(4100, function () {
        press();
        items[1].classList.remove('is-swiped');
        items[1].classList.add('is-disc');
        if (annot) annot.classList.remove('is-on');
        if (note) note.classList.add('is-on');
        if (discRow) discRow.style.visibility = '';
        tick(disc, F.disc);
        tick(tax, F.tax); tick(tot, F.tot);
        root.classList.add('hpos-ready');
      });

      // tap PAY: the button pops and a green wash sweeps the whole screen
      at(4950, function () { chipPay.classList.add('is-on'); });
      at(5150, function () { moveTouch(pay, 0.5, 0.5); });
      at(5700, function () { press(); pay.classList.add('is-pressed'); });
      at(5950, function () { pay.classList.remove('is-pressed'); });
      at(6100, function () {
        pay.classList.add('is-paid');
        pay.textContent = '✓ PAID';
        root.classList.add('is-paidwash');
        root.classList.add('is-payflash');
        camPunch();
        if (stage) stage.classList.add('is-celebrate');
        touch.classList.remove('is-on');
      });
      at(7300, function () { root.classList.remove('is-paidwash'); });
      at(8300, function () { root.classList.remove('is-payflash'); });
      at(7650, function () {
        if (stage) stage.classList.remove('is-celebrate');
        chipPay.classList.remove('is-on');
      });

      // wipe to a fresh sale and go again
      at(6100 + HOLD_PAID_MS, function () {
        root.classList.add('is-wiping');
      });
      at(6100 + HOLD_PAID_MS + 380, function () {
        rewind();
        root.classList.remove('is-wiping');
        clearTimers();
        cycle();
      });
    }

    function boot() {
      running = true;
      root.classList.add('is-boot');
      timers.push(setTimeout(function () { root.classList.add('is-booton'); }, 300));
      timers.push(setTimeout(function () {
        root.classList.remove('is-boot', 'is-booton');
        booted = true;
        cycle();
      }, 1150));
    }
    function maybeStart() {
      if (visible && !running) { rewind(); booted ? cycle() : boot(); }
    }

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
      var shadow = stage ? stage.querySelector('.hpos-shadow') : null;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      function frame() {
        cx += (tx - cx) * 0.10; cy += (ty - cy) * 0.10;
        root.style.setProperty('--tilty', cx.toFixed(3) + 'deg');
        root.style.setProperty('--tiltx', cy.toFixed(3) + 'deg');
        // the shadow slides opposite the tilt, which is what anchors the device
        if (shadow) shadow.style.transform = 'translateX(' + (cx * -7).toFixed(2) + 'px)';
        if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01) raf = requestAnimationFrame(frame);
        else { raf = null; if (tx === 0 && ty === 0) root.classList.remove('is-tilting'); }
      }
      function aim(e) {
        var r = root.getBoundingClientRect();
        var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
        var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
        nx = Math.max(-1.4, Math.min(1.4, nx)); ny = Math.max(-1.4, Math.min(1.4, ny));
        tx = nx * 1.5; ty = ny * -1.2;
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
      chipRfid.classList.remove('is-on');
      chipPay.classList.remove('is-on');
      snap(sub, F.sub); snap(disc, F.disc); snap(tax, F.tax); snap(tot, F.tot);
      root.style.removeProperty('--tiltx'); root.style.removeProperty('--tilty');
    });
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
