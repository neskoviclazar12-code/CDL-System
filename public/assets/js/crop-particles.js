/* CDL System — the About page symbol, rebuilt from particles (v2).
   Same look and pointer physics as the home-page hero symbol (white dots sampled from the SVG, a faint ambient field,
   local repel from the pointer that springs back), but it is simply there: no assembling on load, no letting go on scroll.
   The canvas fills the .crop area with the whole symbol, no box around it. Reduced motion: drawn once, no physics. */
(function () {
  'use strict';
  var host = document.querySelector('.crop');
  if (!host) return;
  var img = host.querySelector('img');
  if (!img || !window.HTMLCanvasElement) return;
  var canvas = document.createElement('canvas'); canvas.className = 'crop__particles'; canvas.setAttribute('aria-hidden', 'true');
  var ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var SYM_ASPECT = 100.25 / 157.12;
  var RED = '#F62817', GRAPHITE = '#FFFFFF';   // dark theme: the right link red, the left link white
  var SPRITE_SCALE = 3, SIZES = [0.75, 0.9, 1.05, 1.2];
  var P = [], F = [], W = 0, H = 0, cfg, sprites = {};
  var mouse = { x: -1e4, y: -1e4, active: false, px: -1e4, py: -1e4, speed: 0 };
  var raf = null, running = false, lastT = 0;

  function profile() {
    var w = window.innerWidth, cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, weak = cores <= 2 || mem <= 2;
    if (w < 600) return { target: weak ? 2400 : 4200, field: 180, radius: 70, size: 1.25 };
    if (w < 1024) return { target: weak ? 2600 : 4800, field: 240, radius: 100, size: 1.2 };
    return { target: weak ? 3000 : 6000, field: 320, radius: 150, size: 1.3 };
  }
  function sprite(color, size) {
    var key = color + size; if (sprites[key]) return sprites[key];
    var d = Math.ceil(size * dpr * SPRITE_SCALE) + 2, c = document.createElement('canvas'); c.width = c.height = d;
    var x = c.getContext('2d'); x.fillStyle = color; x.beginPath(); x.arc(d / 2, d / 2, (size * dpr * SPRITE_SCALE) / 2, 0, 6.2832); x.fill();
    sprites[key] = c; return c;
  }

  /* the whole symbol, as wide as the area and centred in it (the same free-standing look as the hero) */
  function build() {
    cfg = profile(); sprites = {};
    var rect = host.getBoundingClientRect();
    W = Math.max(200, Math.round(rect.width)); H = Math.max(200, Math.round(rect.height));
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    var sw = Math.round(W), sh = Math.round(sw * SYM_ASPECT), sx = 0, sy = Math.round((H - sh) / 2);

    var off = document.createElement('canvas'); off.width = sw; off.height = sh;
    var octx = off.getContext('2d', { willReadFrequently: true });
    try { octx.drawImage(img, 0, 0, sw, sh); } catch (e) { return false; }
    var data; try { data = octx.getImageData(0, 0, sw, sh).data; } catch (e) { return false; }

    // only the part of the symbol that is inside the box counts toward the particle budget
    var ink = 0, x0 = Math.max(0, -sx), y0 = Math.max(0, -sy), x1 = Math.min(sw, W - sx), y1 = Math.min(sh, H - sy);
    for (var yy = y0; yy < y1; yy++) for (var xx = x0; xx < x1; xx++) if (data[(yy * sw + xx) * 4 + 3] > 90) ink++;
    if (!ink) return false;
    var spacing = Math.max(1.5, Math.sqrt(ink / cfg.target)), jitter = spacing * 0.3;

    P = [];
    for (var y = y0 + spacing / 2; y < y1; y += spacing) {
      for (var x = x0 + spacing / 2; x < x1; x += spacing) {
        var ix = ((Math.floor(y) * sw) + Math.floor(x)) * 4;
        if (data[ix + 3] < 90) continue;
        var red = data[ix] > 150 && data[ix + 1] < 110, r = Math.random(), front = r > 0.975;
        P.push({ ox: sx + x + (Math.random() - 0.5) * jitter, oy: sy + y + (Math.random() - 0.5) * jitter, x: 0, y: 0, vx: 0, vy: 0,
          c: red ? RED : GRAPHITE, s: front ? cfg.size * 1.6 : cfg.size * SIZES[(Math.random() * SIZES.length) | 0], a: front ? 1 : (r < 0.2 ? 0.55 : (r < 0.6 ? 0.78 : 0.95)) });
      }
    }
    P.forEach(function (p) { p.x = p.ox; p.y = p.oy; });

    // ambient field: a few faint dots near the edges of the symbol, inside the box
    F = [];
    var cell = 10, gw = Math.ceil(sw / cell), gh = Math.ceil(sh / cell), inkCells = new Uint8Array(gw * gh);
    for (var gy = 0; gy < gh; gy++) for (var gx = 0; gx < gw; gx++) {
      var px = Math.min(sw - 1, gx * cell + cell / 2), py = Math.min(sh - 1, gy * cell + cell / 2);
      if (data[((py | 0) * sw + (px | 0)) * 4 + 3] > 90) inkCells[gy * gw + gx] = 1;
    }
    function distToInk(x, y) {
      var cx0 = Math.floor(x / cell), cy0 = Math.floor(y / cell), best = 1e9, R = 16;
      for (var dy = -R; dy <= R; dy++) { var yy2 = cy0 + dy; if (yy2 < 0 || yy2 >= gh) continue;
        for (var dx = -R; dx <= R; dx++) { var xx2 = cx0 + dx; if (xx2 < 0 || xx2 >= gw) continue;
          if (inkCells[yy2 * gw + xx2]) { var d = dx * dx + dy * dy; if (d < best) best = d; } } }
      return Math.sqrt(best) * cell;
    }
    for (var k = 0, tries = cfg.field * 14; k < tries && F.length < cfg.field; k++) {
      var fx = Math.random() * W - sx, fy = Math.random() * H - sy;                  // anywhere in the box, in symbol coordinates
      var inside = fx >= 0 && fy >= 0 && fx < sw && fy < sh && data[((fy | 0) * sw + (fx | 0)) * 4 + 3] > 90;
      if (inside) continue;
      if (Math.random() > Math.exp(-distToInk(fx, fy) / 46)) continue;
      F.push({ ox: sx + fx, oy: sy + fy, x: sx + fx, y: sy + fy, vx: 0, vy: 0, c: Math.random() < 0.12 ? RED : GRAPHITE, s: cfg.size * SIZES[(Math.random() * SIZES.length) | 0], a: 0.12 + Math.random() * 0.22 });
    }
    return true;
  }

  /* ---------- physics: the hero's spring and repel, nothing else ---------- */
  var SPRING = 0.07, DAMP = 0.82, MAXD = 60;
  function integrate(list, dt, isField) {
    var R = cfg.radius, R2 = R * R, mx = mouse.x, my = mouse.y, act = mouse.active;
    var k = Math.min(dt / 16.67, 2), spring = SPRING * k, damp = Math.pow(DAMP, k);
    var gain = (1 + Math.min(mouse.speed / 30, 1.2)) * (isField ? 0.6 : 1), moving = false;
    for (var i = 0, n = list.length; i < n; i++) {
      var p = list[i], fx = (p.ox - p.x) * spring, fy = (p.oy - p.y) * spring;
      if (act) {
        var dx = p.x - mx, dy = p.y - my;
        if (dx > -R && dx < R && dy > -R && dy < R) {
          var d2 = dx * dx + dy * dy;
          if (d2 < R2) { var d = Math.sqrt(d2) || 0.001, f2 = (1 - d / R); f2 = f2 * f2 * 3.4 * k * gain; fx += (dx / d) * f2; fy += (dy / d) * f2; }
        }
      }
      p.vx = (p.vx + fx) * damp; p.vy = (p.vy + fy) * damp; p.x += p.vx; p.y += p.vy;
      var ex = p.x - p.ox, ey = p.y - p.oy, e2 = ex * ex + ey * ey;
      if (e2 > MAXD * MAXD) { var s = MAXD / Math.sqrt(e2); p.x = p.ox + ex * s; p.y = p.oy + ey * s; }
      if (!moving && (e2 > 0.02 || p.vx * p.vx + p.vy * p.vy > 0.0004)) moving = true;
    }
    return moving;
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    var i, n, p, s2;
    for (i = 0, n = F.length; i < n; i++) { p = F[i]; s2 = p.s; if (p.x < -s2 || p.x > W + s2 || p.y < -s2 || p.y > H + s2) continue; ctx.globalAlpha = p.a; ctx.drawImage(sprite(p.c, p.s), p.x - s2, p.y - s2, s2 * 2, s2 * 2); }
    for (var pass = 0; pass < 2; pass++) for (i = 0, n = P.length; i < n; i++) {
      p = P[i]; if (pass === 0 ? p.a === 1 : p.a !== 1) continue;
      s2 = p.s; if (p.x < -s2 || p.x > W + s2 || p.y < -s2 || p.y > H + s2) continue;
      ctx.globalAlpha = p.a; ctx.drawImage(sprite(p.c, p.s), p.x - s2, p.y - s2, s2 * 2, s2 * 2);
    }
    ctx.globalAlpha = 1;
  }
  function loop(t) {
    raf = null; var dt = lastT ? t - lastT : 16.67; lastT = t; mouse.speed *= 0.85;
    var m1 = integrate(P, dt, false), m2 = integrate(F, dt, true); draw();
    if (m1 || m2 || mouse.active) raf = requestAnimationFrame(loop); else { running = false; lastT = 0; }
  }
  function start() { if (reduce || running) return; running = true; lastT = 0; raf = requestAnimationFrame(loop); }

  function setPointer(e) {
    var r = canvas.getBoundingClientRect(), nx = e.clientX - r.left, ny = e.clientY - r.top;
    if (mouse.active) { var vx = nx - mouse.px, vy = ny - mouse.py; mouse.speed = Math.min(60, Math.sqrt(vx * vx + vy * vy)); }
    mouse.px = nx; mouse.py = ny; mouse.x = nx; mouse.y = ny; mouse.active = true; start();
  }
  function clearPointer() { mouse.active = false; mouse.x = mouse.y = -1e4; start(); }
  if (!reduce) {
    host.addEventListener('pointermove', setPointer, { passive: true });
    host.addEventListener('pointerdown', setPointer, { passive: true });
    host.addEventListener('pointerleave', clearPointer);
    host.addEventListener('pointerup', clearPointer);
    host.addEventListener('pointercancel', clearPointer);
  }

  function init() {
    if (!build()) return;                                  // keep the <img> if sampling is impossible
    host.appendChild(canvas); host.classList.add('is-particles');
    draw();
  }
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (host.classList.contains('is-particles') && build()) draw(); }, 160); });
  if (img.complete && img.naturalWidth) init(); else { img.addEventListener('load', init); img.addEventListener('error', function () {}); }
})();
