/* CDL System — particle logo.
   The footer lockup is rebuilt from thousands of tiny link-mark symbols sampled from the logo; each tiny symbol takes the colour of
   the lockup under it (dark left link and wordmark, red right link, on the light footer).
   Particles repel locally from the pointer and spring back; a small share drifts ambiently.
   Reduced motion: a static particle logo, no physics. No dependencies. */
(function () {
  'use strict';
  var host = document.querySelector('[data-particle-logo]');
  if (!host) return;
  var img = host.querySelector('img:not(.footer__sprite)');
  var spriteImg = host.querySelector('.footer__sprite');
  var canvas = host.querySelector('canvas');
  if (!img || !canvas || !canvas.getContext) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d', { alpha: true });
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var ASPECT = 100.25 / 500.25;                 // lockup viewBox ratio
  var SYM_ASPECT = 100.25 / 157.12;             // symbol viewBox ratio

  /* tuning: particle budget, pointer radius and symbol size scale with viewport class */
  function profile() {
    var w = window.innerWidth;
    var cores = navigator.hardwareConcurrency || 4;
    var mem = navigator.deviceMemory || 4;
    var weak = cores <= 2 || mem <= 2;
    if (w < 600) return { target: weak ? 450 : 900, radius: 46, size: 3.4 };
    if (w < 1024) return { target: weak ? 900 : 1700, radius: 70, size: 4.6 };
    return { target: weak ? 1400 : 2800, radius: 110, size: 6.2 };
  }

  var P = [];            // particles: ox, oy, x, y, vx, vy, s (width), a (alpha group), c (0 white, 1 red), amb (ambient phase or 0)
  var COLORS = ['#3A3B37', '#F62817'];
  var W = 0, H = 0, cfg = profile();
  var sprites = [];      // pre-rendered symbol bitmaps: one per alpha group, each in both colours
  var mouse = { x: -1e4, y: -1e4, active: false };
  var raf = null, running = false, visible = false, assembled = false, lastT = 0;
  var ALPHAS = [0.5, 0.74, 1];
  var SPRITE_SCALE = 2;  // sprites are rendered at 2x the draw size for crisp edges

  function makeSprites() {
    sprites = [];
    var w = Math.ceil(cfg.size * 1.3 * dpr * SPRITE_SCALE), h = Math.ceil(w * SYM_ASPECT);
    for (var g = 0; g < 3; g++) {
      var pair = [];
      for (var k = 0; k < 2; k++) {
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var x = c.getContext('2d');
        x.globalAlpha = ALPHAS[g];
        if (spriteImg && spriteImg.complete && spriteImg.naturalWidth) {
          x.drawImage(spriteImg, 0, 0, w, h);                 // the symbol's silhouette, then tinted in one colour
          x.globalCompositeOperation = 'source-in'; x.globalAlpha = 1; x.fillStyle = COLORS[k]; x.fillRect(0, 0, w, h);
        } else {                                       // fallback: a square
          x.fillStyle = COLORS[k]; x.fillRect(0, 0, w, h);
        }
        pair.push(c);
      }
      sprites.push(pair);
    }
  }

  /* ---------- build: rasterise the lockup, sample ink pixels into a particle grid ---------- */
  function build() {
    cfg = profile();
    var rect = host.getBoundingClientRect();
    W = Math.max(200, Math.round(rect.width));
    H = Math.round(W * ASPECT);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    makeSprites();

    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var octx = off.getContext('2d', { willReadFrequently: true });
    try { octx.drawImage(img, 0, 0, W, H); } catch (e) { return false; }
    var data;
    try { data = octx.getImageData(0, 0, W, H).data; } catch (e) { return false; }

    var ink = 0;
    for (var i = 3; i < data.length; i += 4) if (data[i] > 90) ink++;
    if (!ink) return false;
    var spacing = Math.max(cfg.size * 0.78, Math.sqrt(ink / cfg.target));

    P = [];
    var jitter = spacing * 0.18;
    for (var y = spacing / 2; y < H; y += spacing) {
      for (var x = spacing / 2; x < W; x += spacing) {
        var px = Math.floor(x), py = Math.floor(y), ix = (py * W + px) * 4;
        var a = data[ix + 3];
        if (a < 90) continue;
        var red = data[ix] > 150 && data[ix + 1] < 110;
        var ox = x + (Math.random() - 0.5) * jitter;
        var oy = y + (Math.random() - 0.5) * jitter;
        var r = Math.random();
        P.push({
          ox: ox, oy: oy,
          x: reduce ? ox : ox + (Math.random() - 0.5) * 70,   // scattered start for the reveal
          y: reduce ? oy : oy + (Math.random() - 0.5) * 70,
          vx: 0, vy: 0,
          s: cfg.size * (0.85 + Math.random() * 0.3),
          a: r < 0.18 ? 0 : (r < 0.55 ? 1 : 2), c: red ? 1 : 0,
          amb: Math.random() < 0.035 ? Math.random() * 6.283 : 0
        });
      }
    }
    return true;
  }

  /* ---------- physics ---------- */
  var SPRING = 0.085, DAMP = 0.80, MAXD = 42;
  function step(dt, t) {
    var R = cfg.radius, R2 = R * R, mx = mouse.x, my = mouse.y, act = mouse.active;
    var k = Math.min(dt / 16.67, 2);
    var spring = SPRING * k, damp = Math.pow(DAMP, k);
    var moving = false;
    for (var i = 0, n = P.length; i < n; i++) {
      var p = P[i];
      var fx = (p.ox - p.x) * spring, fy = (p.oy - p.y) * spring;
      if (act) {
        var dx = p.x - mx, dy = p.y - my;
        if (dx > -R && dx < R && dy > -R && dy < R) {
          var d2 = dx * dx + dy * dy;
          if (d2 < R2) {
            var d = Math.sqrt(d2) || 0.001;
            var f = (1 - d / R); f = f * f * 3.2 * k;
            fx += (dx / d) * f; fy += (dy / d) * f;
          }
        }
      }
      if (p.amb) {
        fx += Math.sin(t * 0.0009 + p.amb) * 0.012 * k;
        fy += Math.cos(t * 0.0011 + p.amb * 1.7) * 0.012 * k;
      }
      p.vx = (p.vx + fx) * damp; p.vy = (p.vy + fy) * damp;
      p.x += p.vx; p.y += p.vy;
      var ex = p.x - p.ox, ey = p.y - p.oy;
      var e2 = ex * ex + ey * ey;
      if (e2 > MAXD * MAXD) { var s = MAXD / Math.sqrt(e2); p.x = p.ox + ex * s; p.y = p.oy + ey * s; }
      if (!moving && (e2 > 0.02 || p.vx * p.vx + p.vy * p.vy > 0.0004)) moving = true;
    }
    return moving;
  }

  /* ---------- render: each particle is the link-mark, drawn from a pre-rendered sprite ---------- */
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (var g = 0; g < 3; g++) {
      var pair = sprites[g];
      for (var i = 0, n = P.length; i < n; i++) {
        var p = P[i];
        if (p.a !== g) continue;
        var w = p.s, h = w * SYM_ASPECT;
        ctx.drawImage(pair[p.c], p.x - w / 2, p.y - h / 2, w, h);
      }
    }
  }

  var startT = 0, hasAmbient = false;
  function loop(t) {
    raf = null;
    var dt = lastT ? t - lastT : 16.67; lastT = t;
    var moving = step(dt, t);
    draw();
    if (!assembled && t - startT > 1400) assembled = true;
    if (visible && (moving || mouse.active || !assembled || hasAmbient)) raf = requestAnimationFrame(loop);
    else { running = false; lastT = 0; }
  }
  function start() {
    if (reduce || running || !visible) return;
    running = true; lastT = 0; if (!startT) startT = performance.now();
    raf = requestAnimationFrame(loop);
  }

  /* ---------- pointer / touch: local disturbance only ---------- */
  function setPointer(e) {
    var r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (W / r.width);
    mouse.y = (e.clientY - r.top) * (H / r.height);
    mouse.active = true;
    start();
  }
  function clearPointer() { mouse.active = false; mouse.x = mouse.y = -1e4; start(); }
  if (!reduce) {
    canvas.addEventListener('pointermove', setPointer, { passive: true });
    canvas.addEventListener('pointerdown', setPointer, { passive: true });
    canvas.addEventListener('pointerleave', clearPointer);
    canvas.addEventListener('pointerup', clearPointer);
    canvas.addEventListener('pointercancel', clearPointer);
  }

  /* ---------- reveal on scroll, pause when off-screen ---------- */
  function init() {
    if (!build()) return;                  // keep the <img> if sampling is impossible
    hasAmbient = P.some(function (p) { return p.amb; });
    img.hidden = true;
    canvas.hidden = false;
    host.classList.add('is-ready');
    draw();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) { host.classList.add('is-visible'); start(); }
        else if (raf) { cancelAnimationFrame(raf); raf = null; running = false; lastT = 0; }
      }, { threshold: 0.15 }).observe(host);
    } else { visible = true; host.classList.add('is-visible'); start(); }
  }

  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      var w = Math.round(host.getBoundingClientRect().width);
      if (w && w !== W) { build(); draw(); start(); }
    }, 160);
  });

  function whenLoaded(el, cb) {
    if (!el) { cb(); return; }
    if (el.complete && el.naturalWidth) cb();
    else { el.addEventListener('load', cb); el.addEventListener('error', cb); }
  }
  whenLoaded(img, function () { whenLoaded(spriteImg, init); });
})();
