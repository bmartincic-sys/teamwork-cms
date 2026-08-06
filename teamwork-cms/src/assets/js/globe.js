/* Rotating globe — one dot per ~6 stores in the largest deployment's fleet.
   Coordinates are scattered across the retailer's live markets in proportion to
   the store count each market carries. */
(function () {
  var P = [34.9,135.3,31.9,131.2,36.2,138.8,33.9,137.4,35.1,137.0,37.7,139.6,32.0,130.4,34.2,129.5,35.6,136.2,42.6,142.0,35.0,134.2,35.9,137.0,35.7,137.9,34.7,136.0,34.8,132.6,31.4,130.1,34.9,135.5,36.0,139.7,35.8,138.6,36.0,139.2,33.9,135.1,37.1,136.6,31.1,131.0,31.3,130.5,35.0,137.0,37.7,139.5,35.2,139.8,35.3,135.5,35.4,139.0,34.2,132.0,36.0,140.5,36.4,140.0,35.8,140.8,35.0,140.2,35.8,137.7,31.4,129.9,36.1,135.6,33.6,129.9,34.0,134.6,34.1,137.1,34.6,136.3,36.6,139.9,35.4,138.8,35.6,138.3,32.2,132.1,34.8,139.7,33.0,130.5,36.5,139.0,33.7,135.8,36.2,139.1,25.5,128.5,35.3,139.9,36.6,138.8,34.7,136.7,36.5,138.6,35.4,140.0,37.6,140.6,35.0,140.7,38.3,139.2,31.5,131.4,35.2,139.8,42.7,141.9,34.8,135.1,34.2,135.6,35.1,139.5,33.6,135.1,33.4,130.8,36.3,137.2,38.1,138.9,33.5,130.3,34.4,135.8,35.3,135.1,33.6,132.0,35.2,138.5,36.2,139.9,34.1,137.5,36.1,139.8,36.0,139.5,36.1,139.8,36.0,140.9,35.1,137.2,34.9,136.5,36.2,140.6,35.3,139.9,26.8,127.3,36.9,139.1,34.7,140.4,42.8,143.1,35.4,139.8,35.3,136.9,32.9,131.2,34.2,134.7,37.0,139.3,33.7,135.6,36.1,140.0,34.2,133.7,36.2,138.9,35.3,136.5,35.5,135.6,35.2,134.1,35.4,140.1,36.0,140.4,34.6,135.4,34.7,134.5,35.1,136.2,25.3,127.4,35.2,135.7,35.7,138.6,37.8,140.5,36.0,140.4,35.2,139.8,34.1,135.8,35.8,139.5,35.8,136.8,35.9,139.9,35.5,140.6,35.0,139.6,35.3,139.2,34.4,131.5,37.4,140.0,34.3,131.5,35.3,138.4,35.0,138.5,39.8,141.3,31.0,130.9,42.4,141.9,35.2,136.2,43.0,141.4,35.3,137.6,36.0,139.0,43.4,141.5,39.6,116.0,40.5,116.9,31.8,120.3,31.7,122.8,30.4,119.8,29.7,120.3,38.5,121.6,26.9,112.8,42.3,124.5,24.5,114.7,29.0,106.8,40.5,116.2,30.4,120.2,23.0,114.6,31.8,121.6,28.2,105.9,30.9,120.1,23.3,113.1,22.8,115.3,29.4,106.9,32.2,122.9,28.3,112.6,31.0,120.2,39.5,117.4,21.5,114.2,39.6,115.8,44.2,87.3,30.8,121.3,31.3,121.9,31.4,120.8,30.7,120.4,32.4,121.7,32.7,118.8,31.2,120.4,40.4,118.4,27.3,112.9,29.8,120.7,23.3,113.9,31.0,122.2,38.9,116.3,40.8,117.0,38.9,116.1,44.5,127.3,34.7,107.9,31.9,122.5,31.0,104.8,32.3,120.8,29.3,105.2,39.5,115.6,33.9,109.2,34.2,109.9,23.2,113.9,41.0,117.0,23.3,114.1,31.4,122.6,34.8,114.5,40.9,116.1,31.1,113.4,34.3,111.3,38.3,117.9,34.5,108.2,32.0,121.5,30.3,104.9,22.7,112.9,35.7,119.9,31.1,104.1,31.1,119.5,38.1,116.7,40.2,116.5,30.4,120.8,39.6,116.9,39.9,119.0,39.8,116.6,24.1,112.7,23.0,113.4,41.5,124.3,30.8,121.1,30.2,114.1,34.0,109.1,39.2,115.5,39.0,116.2,22.6,112.6,30.9,121.1,31.0,120.9,35.6,120.6,31.0,122.1,31.1,120.9,22.8,111.8,30.7,120.2,26.2,119.7,23.4,112.7,40.6,114.2,31.6,121.3,30.0,121.8,32.2,104.1,36.9,121.7,38.2,116.8,30.7,104.5,29.9,120.8,31.1,122.5,32.5,121.6,22.5,112.6,31.8,120.9,34.2,113.1,41.4,123.9,30.6,120.9,31.9,119.5,25.2,101.5,29.7,106.0,32.1,120.4,39.9,116.3,41.7,124.4,40.5,117.0,31.9,121.5,34.3,113.1,38.7,117.0,39.8,117.5,30.8,121.5,31.3,121.0,30.3,120.7,38.8,115.2,34.8,118.6,39.5,116.5,29.2,106.0,28.9,114.7,29.3,106.5,30.5,119.6,30.1,102.7,29.2,106.7,38.6,119.1,40.0,115.8,22.5,115.0,30.1,102.6,39.9,122.5,33.4,114.1,24.8,112.7,23.5,101.5,32.2,121.4,22.4,112.7,29.4,104.2,33.8,108.4,35.7,114.2,23.5,113.2,30.1,121.4,31.0,104.2,39.7,116.2,23.0,114.0,37.4,126.8,37.9,127.4,35.1,126.8,36.9,127.2,34.8,129.8,37.9,127.0,35.6,128.7,37.9,127.0,38.0,126.5,37.9,128.1,37.5,126.2,37.7,127.5,35.9,128.5,37.5,127.1,37.6,127.7,35.5,129.2,35.2,129.4,34.6,129.6,37.3,126.9,37.0,128.5,37.5,126.5,37.5,127.9,24.5,121.1,23.4,120.5,24.0,121.4,23.0,119.7,24.2,121.0,23.2,121.0,24.2,120.5,25.3,121.9,25.2,121.7,24.2,121.1,25.6,121.2,24.0,120.9,14.9,121.7,10.4,123.8,14.0,121.0,11.1,122.9,14.5,121.0,14.4,121.4,10.3,123.8,15.0,121.0,10.2,123.8,15.0,120.8,7.9,125.6,14.1,121.1,14.6,120.9,15.0,121.4,-7.0,110.3,-6.7,105.9,-6.7,112.4,-6.3,107.6,-7.2,110.3,-7.0,113.2,-6.8,106.9,-8.0,112.9,-7.3,110.7,-5.8,106.6,-5.7,107.0,-7.3,112.6,-6.3,106.8,13.8,100.6,13.9,100.9,14.0,100.4,13.3,101.0,13.5,100.1,16.8,102.8,13.8,100.0,14.0,100.9,13.7,100.1,13.8,100.2,16.9,103.0,14.1,100.6,3.0,101.2,3.5,101.7,3.4,101.8,3.5,101.9,5.9,100.0,2.5,101.2,3.1,101.9,3.4,101.9,5.7,100.9,3.0,101.3,22.3,114.2,22.3,114.2,22.1,114.1,22.3,114.4,22.3,114.2,22.4,114.4,1.4,103.8,1.3,103.9,1.4,103.8,1.4,103.7,1.4,103.9,10.4,106.3,10.8,106.5,10.6,106.5,10.6,106.7,20.6,105.9,20.0,73.1,28.6,77.4,28.4,77.4,-33.4,150.3,-28.1,153.7,-33.9,150.8,-37.6,144.4,-33.2,151.7,-38.1,145.3,-37.7,144.7,40.9,-74.2,34.0,-118.1,33.3,-95.3,26.5,-79.5,34.0,-118.0,48.0,-123.5,43.0,-71.3,39.0,-76.5,28.9,-96.0,42.2,-70.0,41.6,-87.5,25.4,-79.5,47.2,-122.8,46.1,-73.6,45.4,-72.8,43.1,-79.0,46.1,-75.2,43.2,-79.0,50.3,-114.4,48.3,2.4,48.5,2.3,48.4,2.1,45.8,4.3,48.7,2.1,51.8,-0.4,51.7,-0.2,52.6,-2.0,51.8,-0.1,48.2,11.2,48.8,11.6,41.4,1.8,52.3,5.0,45.3,8.9,50.9,4.4,59.3,18.2,55.7,12.4,51.8,21.0,49.6,6.1];

  function init(root) {
    var cv = root.querySelector('.globe-canvas');
    var fallback = root.querySelector('.globe-fallback');
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext('2d');
    if (fallback) fallback.style.display = 'none';
    cv.style.display = 'block';

    var TILT = 20 * Math.PI / 180, st = Math.sin(TILT), ct = Math.cos(TILT);
    var size = 0, R = 0, cx = 0, cy = 0, dpr = 1;

    function resize() {
      var box = cv.getBoundingClientRect();
      if (!box.width) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = box.width;
      cv.width = Math.round(size * dpr);
      cv.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = size * 0.425; cx = size / 2; cy = size / 2;
      return true;
    }

    function theme() {
      var light = document.documentElement.getAttribute('data-theme') === 'light';
      return light
        ? { grid: 'rgba(7,9,26,0.13)', mer: 'rgba(36,125,255,0.24)', dot: '#2f6fe0', fill: 'rgba(36,125,255,0.05)', fill2: 'rgba(36,125,255,0.02)' }
        : { grid: 'rgba(255,255,255,0.10)', mer: 'rgba(109,155,255,0.26)', dot: '#7db0ff', fill: 'rgba(27,42,99,0.55)', fill2: 'rgba(7,9,26,0.25)' };
    }

    // lat/lon -> screen, with the globe spun by `rot` radians of longitude
    function project(latDeg, lonDeg, rot) {
      var a = latDeg * Math.PI / 180, b = lonDeg * Math.PI / 180 + rot;
      var ca = Math.cos(a);
      var x = ca * Math.sin(b), y = Math.sin(a), z = ca * Math.cos(b);
      var yr = y * ct - z * st, zr = y * st + z * ct;   // tilt toward the viewer
      return { x: cx + R * x, y: cy - R * yr, z: zr };
    }

    function ring(pts, col, w) {
      ctx.strokeStyle = col; ctx.lineWidth = w;
      var drawing = false;
      ctx.beginPath();
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (p.z > 0) {
          if (drawing) ctx.lineTo(p.x, p.y);
          else { ctx.moveTo(p.x, p.y); drawing = true; }
        } else drawing = false;
      }
      ctx.stroke();
    }

    function draw(rot) {
      var c = theme();
      ctx.clearRect(0, 0, size, size);

      var g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      g.addColorStop(0, c.fill); g.addColorStop(1, c.fill2);
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();

      var lat, lon, pts, i;
      for (lat = -60; lat <= 60; lat += 30) {           // parallels
        pts = [];
        for (i = 0; i <= 180; i++) pts.push(project(lat, i * 2, rot));
        ring(pts, c.grid, 1);
      }
      for (lon = 0; lon < 180; lon += 30) {             // meridians
        pts = [];
        for (i = 0; i <= 180; i++) pts.push(project(-90 + i, lon, rot));
        ring(pts, c.mer, 1);
      }

      ctx.fillStyle = c.dot;                            // stores
      ctx.shadowColor = c.dot; ctx.shadowBlur = 6;
      for (i = 0; i < P.length; i += 2) {
        var p = project(P[i], P[i + 1], rot);
        if (p.z <= 0.02) continue;
        var fade = Math.min(1, p.z * 3.2);              // soften toward the limb
        ctx.globalAlpha = 0.34 + 0.66 * fade;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.7 + 1.1 * fade, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      var rim = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      rim.addColorStop(0, '#247dff'); rim.addColorStop(0.55, '#7c50f5'); rim.addColorStop(1, '#8a0add');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = rim; ctx.lineWidth = 1.6; ctx.stroke();
    }

    var rot = -2.1, last = 0, running = false, raf = 0;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function frame(t) {
      if (!running) return;
      if (last) rot += (t - last) / 1000 * 0.13;        // ~48s per revolution
      last = t;
      draw(rot);
      raf = requestAnimationFrame(frame);
    }
    function start() {
      if (running || reduce.matches) return;
      running = true; last = 0; raf = requestAnimationFrame(frame);
    }
    function stop() { running = false; last = 0; if (raf) cancelAnimationFrame(raf); }

    if (!resize()) { requestAnimationFrame(function () { if (resize()) draw(rot); }); }
    else draw(rot);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es[0].isIntersecting ? start() : stop();
      }, { threshold: 0.05 }).observe(cv);
    } else start();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (resize()) draw(rot); }, 150);
    });
    reduce.addEventListener && reduce.addEventListener('change', function () {
      reduce.matches ? stop() : start();
    });
    new MutationObserver(function () { draw(rot); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function boot() {
    var el = document.querySelector('.globe-wrap');
    if (el) init(el);
  }
  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', boot)
    : boot();
})();
