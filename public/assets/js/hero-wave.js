/* CDL System: home hero wave. Red halftone ribbon -> CDL symbol -> ribbon, on the right of the light hero.
   Dots are sampled from the symbol SVG. Respects prefers-reduced-motion (static symbol). Debug: add #t=<seconds> to the URL to freeze a moment. */
(function () {
  'use strict';
  var cv = document.getElementById('wave'); if (!cv) return;
  var ctx = cv.getContext('2d'), hero = cv.parentNode;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOB = innerWidth < 900, dpr = Math.min(devicePixelRatio || 1, 2), W = 0, H = 0, P = [], ready = false;
  var img = new Image(); img.src = '/assets/brand/logo/cdl-symbol-duo.svg';
  function size() { MOB = innerWidth < 900; var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); build(); }
  function build() {
    if (!img.complete || !img.naturalWidth) return;
    var small = MOB, N = small ? 2000 : 5200, sw = Math.min(W * (small ? 0.9 : 0.86), 620), sh = sw * 100.25 / 157.12;
    var ox = small ? W * 0.05 : W - sw - W * 0.02, oy = H * 0.5 - sh / 2;
    var o = document.createElement('canvas'), s = 2; o.width = Math.round(157 * s); o.height = Math.round(100.25 * s);
    var oc = o.getContext('2d'); oc.drawImage(img, 0, 0, o.width, o.height);
    var d = oc.getImageData(0, 0, o.width, o.height).data, pts = [];
    for (var y = 0; y < o.height; y++) for (var x = 0; x < o.width; x++) if (d[(y * o.width + x) * 4 + 3] > 128) pts.push([x / o.width, y / o.height]);
    if (!pts.length) return;
    P = []; for (var i = 0; i < N; i++) { var q = pts[(Math.random() * pts.length) | 0];
      P.push({ u: Math.random(), v: Math.random() * 2 - 1, sx: ox + q[0] * sw, sy: oy + q[1] * sh, ph: Math.random() * 6.28, r: Math.random() }); }
    ready = true;
  }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function mix(t) { t = t % 13.2; if (t < 4) return 0; if (t < 5.4) return ease((t - 4) / 1.4); if (t < 8) return 1; if (t < 9.2) return 1 - ease((t - 8) / 1.2); return 0; }
  function ribbon(u, t, k) { return [u * W, H * 0.62 + Math.sin(u * 5.2 + t * 0.55 + k) * H * 0.13 + Math.sin(u * 2.1 - t * 0.35) * H * 0.12 - (u - 0.5) * H * 0.5]; }
  function frame(ts) {
    var fx = /t=([\d.]+)/.exec(location.hash), t = fx ? parseFloat(fx[1]) : (reduce ? 6.5 : ts / 1000), m = (reduce && !fx) ? 1 : mix(t);
    ctx.clearRect(0, 0, W, H); if (!ready) { requestAnimationFrame(frame); return; }
    for (var i = 0; i < P.length; i++) {
      var p = P[i], u = p.u * (MOB ? 1.2 : 1); u = u > 1 ? u - 1 : u;
      var uu = MOB ? u : 0.04 + u * 0.96, a = ribbon(uu, t, 0), b = ribbon(uu, t, 1.7), thick = H * 0.30 * (0.55 + 0.45 * Math.sin(uu * 6 + t * 0.4));
      var wx = a[0] + Math.sin(p.ph + t * 0.6) * 3, wy = a[1] + p.v * thick + (b[1] - a[1]) * 0.35 * p.r;
      var x = wx + (p.sx - wx) * m, y = wy + (p.sy - wy) * m, halft = 1 - Math.abs(p.v);
      var rad = (0.7 + 2.6 * halft * halft * (1 - m) + 2.4 * m * (0.55 + 0.45 * Math.sin(p.ph))) * (MOB ? 0.8 : 1);
      var left = MOB ? 1 : Math.max(0, Math.min(1, (x / W - 0.02) / 0.22)), al = (0.14 + 0.55 * halft * (1 - m) + 0.8 * m) * left;
      ctx.fillStyle = 'rgba(246,40,23,' + Math.min(0.95, al).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  function start() { size(); requestAnimationFrame(frame); }
  if (img.complete && img.naturalWidth) start(); else img.onload = start;
  addEventListener('resize', size);
})();
