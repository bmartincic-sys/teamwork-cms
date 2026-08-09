/* Logo carousels: keep the continuous drift, but make them grabbable.
   The CSS keyframe animation can't be dragged, so we turn the wrapper into a
   real scroll container and drive scrollLeft ourselves. Touch and trackpad then
   work natively; mouse gets click-and-drag. */
(function () {
  var SPEED = 26; // px per second

  function setup(wrap) {
    var track = wrap.querySelector('.logos-track');
    if (!track || wrap.dataset.dragReady) return;
    wrap.dataset.dragReady = '1';
    wrap.classList.add('is-draggable');

    // One visual repeat = offset of the first duplicated slot. Using scrollWidth/2
    // would be off by a flex gap and jump on wrap.
    var loopW = 0;
    function measure() {
      var kids = track.children;
      loopW = kids.length > 1 ? kids[Math.floor(kids.length / 2)].offsetLeft : 0;
    }
    measure();
    window.addEventListener('resize', measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(track);

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var dragging = false, hovering = false, moved = 0;
    var startX = 0, startScroll = 0, last = 0;
    // scrollLeft rounds to whole pixels, so a sub-pixel increment per frame would
    // be discarded every time. Keep the true position here and assign it.
    var pos = wrap.scrollLeft;

    function applyWrap() {
      if (loopW <= 0) return;
      if (pos >= loopW) { pos -= loopW; startScroll -= loopW; }
      else if (pos < 0) { pos += loopW; startScroll += loopW; }
    }

    function frame(t) {
      var dt = last ? (t - last) / 1000 : 0;
      last = t;
      if (!dragging && !hovering && !reduce.matches && dt > 0 && dt < 0.25) {
        pos += SPEED * dt;
        applyWrap();
        wrap.scrollLeft = pos;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    wrap.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse') return;      // touch keeps native momentum
      dragging = true; moved = 0;
      startX = e.clientX; startScroll = pos = wrap.scrollLeft;
      wrap.classList.add('is-dragging');
      try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    });
    wrap.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      if (Math.abs(dx) > moved) moved = Math.abs(dx);
      pos = startScroll - dx;
      applyWrap();
      wrap.scrollLeft = pos;
    });
    function end(e) {
      if (!dragging) return;
      dragging = false;
      wrap.classList.remove('is-dragging');
      pos = wrap.scrollLeft;
      try { wrap.releasePointerCapture(e.pointerId); } catch (_) {}
    }
    wrap.addEventListener('pointerup', end);
    wrap.addEventListener('pointercancel', end);
    wrap.addEventListener('lostpointercapture', end);

    // a drag that ends over a logo shouldn't count as a click on it
    wrap.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    wrap.addEventListener('dragstart', function (e) { e.preventDefault(); });

    wrap.addEventListener('mouseenter', function () { hovering = true; });
    wrap.addEventListener('mouseleave', function () { hovering = false; pos = wrap.scrollLeft; });
  }

  function boot() {
    document.querySelectorAll('.logos-marquee').forEach(setup);
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
