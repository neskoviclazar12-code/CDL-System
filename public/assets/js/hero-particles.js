/* CDL System — hero particle symbol with a scroll-driven exit and return.
   The brand symbol (no wordmark) is rebuilt from thousands of circular particles sampled from the SVG.
   On load it assembles in the hero (oversized, shrinking into place; the copy enters once it has formed).
   On scroll it lets go into a woven particle stream that drifts across the viewport, passes under the dark
   stage, and regroups beside the "Eight things" rules at exactly the same size. Pointer and touch repel it
   locally wherever it is formed. The canvas is one fixed full-viewport layer. Reduced motion: static logos. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-hero-particles]');
  if (!hero) return;
  var canvas = hero.querySelector('canvas.hero__particles');
  var img = hero.querySelector('img.hero__symbol-src');
  var slot = document.getElementById('rules-slot');
  if (!canvas || !img || !canvas.getContext) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ctx = canvas.getContext('2d', { alpha: true });
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var SYM_ASPECT = 100.25 / 157.12;
  var RED = '#F62817', GRAPHITE = '#FFFFFF';   // dark theme: the right link red, the left link white
  var SPRITE_SCALE = 3;
  var SIZES = [0.75, 0.9, 1.05, 1.2];

  function profile() {
    var w = window.innerWidth;
    var cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
    var weak = cores <= 2 || mem <= 2;
    if (w < 600) return { target: weak ? 3400 : 6200, field: 260, radius: 70, size: 1.3, heightFrac: 0.62, overhang: 0.52, mobile: true };
    if (w < 1024) return { target: weak ? 3000 : 6000, field: 360, radius: 110, size: 1.15, heightFrac: 0.62, overhang: 0.24, mobile: false };
    return { target: weak ? 4000 : 8000, field: 500, radius: 170, size: 1.3, heightFrac: 0.72, overhang: 0.2, mobile: false };
  }

  var P = [], F = [];
  var VW = 0, VH = 0, cfg = profile(), sprites = {};
  var SX = 0, SY = 0, SW = 0, SH = 0;          // the symbol box inside the hero (hero-local px)
  var cx = 0, cy = 0;
  var mouse = { x: -1e4, y: -1e4, active: false, px: -1e4, py: -1e4, speed: 0 };
  var raf = null, running = false, lastT = 0, t0 = 0, assembled = false;
  var heroRect = null, slotRect = null, stageEl = document.getElementById('stage');
  var A = 0, C = 0;                            // release (0 formed in hero .. 1 in the stream) and regroup (0 .. 1 formed at the rules)

  /* ---------- entrance timeline ---------- */
  var OVERSIZE = 1.7, T_SCALE = 3200, T_FORM_START = 1200, T_FORM = 2600, T_TOTAL = 3800, T_FADE = 800;
  var entS = 1 + OVERSIZE, entScatter = 1;
  function easeInOutCubic(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function easeOutCubic(x) { return 1 - Math.pow(1 - x, 3); }
  function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function smooth(x) { return x * x * (3 - 2 * x); }
  function entrance(el) {
    entS = 1 + OVERSIZE * (1 - easeInOutCubic(clamp01(el / T_SCALE)));
    entScatter = 1 - easeOutCubic(clamp01((el - T_FORM_START) / T_FORM));
    return el >= T_TOTAL;
  }
  var formedSent = false;
  function signalFormed() {
    if (formedSent) return; formedSent = true;
    window.__heroFormed = true;
    hero.classList.add('is-formed');
    hero.dispatchEvent(new CustomEvent('cdl:hero-formed'));
  }

  function sprite(color, alpha, size) {
    var key = color + alpha + size;
    if (sprites[key]) return sprites[key];
    var d = Math.ceil(size * dpr * SPRITE_SCALE) + 2;
    var c = document.createElement('canvas'); c.width = c.height = d;
    var x = c.getContext('2d');
    x.globalAlpha = alpha; x.fillStyle = color;
    x.beginPath(); x.arc(d / 2, d / 2, (size * dpr * SPRITE_SCALE) / 2, 0, 6.2832); x.fill();
    sprites[key] = c;
    return c;
  }

  /* ---------- the return slot beside the rules: the same size as the hero symbol ---------- */
  function placeSlot() {
    if (!slot) return;
    var host = slot.parentNode, cont = host.parentNode, list = cont.querySelector(".rules");
    var cr = cont.getBoundingClientRect(), lr = list ? list.getBoundingClientRect() : cr;
    var left = SX - cr.left;                                      // the same place across the viewport as in the hero
    if (VW >= 1024) left = Math.max(left, lr.right - cr.left + 40); // but never over the list
    host.style.setProperty("--slot-left", Math.round(left) + "px");
    host.style.setProperty("--slot-w", SW + "px");
    host.style.setProperty("--slot-h", SH + "px");
  }

  /* ---------- build ---------- */
  function build() {
    cfg = profile(); sprites = {};
    VW = window.innerWidth; VH = window.innerHeight;
    canvas.width = Math.round(VW * dpr); canvas.height = Math.round(VH * dpr);
    canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px';

    var rect = hero.getBoundingClientRect();
    var W = Math.max(320, Math.round(rect.width)), H = Math.max(320, Math.round(rect.height));
    var sh = Math.round(H * cfg.heightFrac), sw = Math.round(sh / SYM_ASPECT);
    var sx = Math.round(W - sw * (1 - cfg.overhang)), sy = Math.round((H - sh) / 2);
    if (cfg.mobile) {
      var copy = hero.querySelector('.hero__copy');
      var copyBottom = copy ? Math.round(copy.getBoundingClientRect().bottom - rect.top) : 0;
      var room = H - copyBottom;
      sh = Math.round(Math.min(Math.max(room * 1.06, W * 0.62), W * 1.05));
      sw = Math.round(sh / SYM_ASPECT);
      sx = Math.round(W - sw * 0.58);
      sy = Math.round(Math.min(copyBottom - sh * 0.04, H - sh * 0.94));
    }
    SX = sx; SY = sy; SW = sw; SH = sh;
    hero.style.setProperty('--symbol-left', sx + 'px');
    cx = sx + sw / 2; cy = sy + sh / 2;
    placeSlot();

    var off = document.createElement('canvas'); off.width = sw; off.height = sh;
    var octx = off.getContext('2d', { willReadFrequently: true });
    try { octx.drawImage(img, 0, 0, sw, sh); } catch (e) { return false; }
    var data; try { data = octx.getImageData(0, 0, sw, sh).data; } catch (e) { return false; }

    var ink = 0;
    for (var i = 3; i < data.length; i += 4) if (data[i] > 90) ink++;
    if (!ink) return false;
    var spacing = Math.max(1.5, Math.sqrt(ink / cfg.target));
    var jitter = spacing * 0.3;

    P = [];
    for (var y = spacing / 2; y < sh; y += spacing) {
      for (var x = spacing / 2; x < sw; x += spacing) {
        var ix = ((Math.floor(y) * sw) + Math.floor(x)) * 4;
        var a = data[ix + 3];
        if (a < 90) continue;
        var red = data[ix] > 150 && data[ix + 1] < 110;
        var ox = sx + x + (Math.random() - 0.5) * jitter, oy = sy + y + (Math.random() - 0.5) * jitter;
        var r = Math.random();
        var front = r > 0.975;
        P.push({
          ox: ox, oy: oy, x: ox, y: oy, vx: 0, vy: 0,
          dx0: reduce ? 0 : (Math.random() - 0.5) * 160, dy0: reduce ? 0 : (Math.random() - 0.5) * 160,
          c: red ? RED : GRAPHITE,
          s: front ? cfg.size * 1.6 : cfg.size * SIZES[(Math.random() * SIZES.length) | 0],
          a: front ? 1 : (r < 0.2 ? 0.55 : (r < 0.6 ? 0.78 : 0.95)),
          // stream randoms: release order (lower parts let go first), regroup order, sideways scatter, strand, drift phase
          d1: 0.55 * (1 - y / sh) + 0.45 * Math.random(), d2: 0.7 * (y / sh) + 0.3 * Math.random(), r3: Math.random() - 0.5,
          r4: Math.random(), r1: Math.random(), r2: Math.random(), ph: Math.random() * 6.283, st: (Math.random() * 5) | 0
        });
      }
    }

    // ambient field around the hero symbol: fades out as the symbol lets go
    F = [];
    var cell = 10, gw = Math.ceil(sw / cell), gh = Math.ceil(sh / cell), inkCells = new Uint8Array(gw * gh);
    for (var gy = 0; gy < gh; gy++) for (var gx = 0; gx < gw; gx++) {
      var px = Math.min(sw - 1, gx * cell + cell / 2), py = Math.min(sh - 1, gy * cell + cell / 2);
      if (data[((py | 0) * sw + (px | 0)) * 4 + 3] > 90) inkCells[gy * gw + gx] = 1;
    }
    function distToInk(x, y) {
      var cx0 = Math.floor(x / cell), cy0 = Math.floor(y / cell), best = 1e9, R = 16;
      for (var dy = -R; dy <= R; dy++) { var yy = cy0 + dy; if (yy < 0 || yy >= gh) continue;
        for (var dx = -R; dx <= R; dx++) { var xx = cx0 + dx; if (xx < 0 || xx >= gw) continue;
          if (inkCells[yy * gw + xx]) { var d = dx * dx + dy * dy; if (d < best) best = d; } } }
      return Math.sqrt(best) * cell;
    }
    var margin = 140, tries = cfg.field * 14;
    for (var k = 0; k < tries && F.length < cfg.field; k++) {
      var fx = -margin + Math.random() * (sw + 2 * margin), fy = -margin + Math.random() * (sh + 2 * margin);
      var inside = fx >= 0 && fy >= 0 && fx < sw && fy < sh && data[((fy | 0) * sw + (fx | 0)) * 4 + 3] > 90;
      if (inside) continue;
      var dd = distToInk(fx, fy);
      if (Math.random() > Math.exp(-dd / 46)) continue;
      F.push({ ox: sx + fx, oy: sy + fy, x: sx + fx, y: sy + fy, vx: 0, vy: 0, c: Math.random() < 0.12 ? RED : GRAPHITE,
        s: cfg.size * SIZES[(Math.random() * SIZES.length) | 0], a: 0.12 + Math.random() * 0.22 });
    }
    return true;
  }

  /* ---------- scroll state: where the symbol is on its journey ---------- */
  function readScroll() {
    heroRect = hero.getBoundingClientRect();
    slotRect = slot ? slot.getBoundingClientRect() : null;
    var sy = window.pageYOffset || 0;
    A = slot ? clamp01((sy - VH * 0.04) / (VH * 0.6)) : 0;                       // let go over the first 60 % of a screen of scrolling
    var sec = slot ? slot.closest('section') : null, secTop = sec ? sec.getBoundingClientRect().top : (slotRect ? slotRect.top : 0);
    C = slotRect ? clamp01((VH - secTop) / Math.max(VH * 0.3, (slotRect.top - secTop) + (VH + SH) / 2)) : 0;
  }

  /* ---------- physics (only where the symbol is formed) ---------- */
  var SPRING = 0.07, DAMP = 0.82, MAXD = 60;
  function integrate(list, dt, t, isField) {
    if (!assembled && !isField) {
      var done = entrance(t - t0), f = done ? 0 : entScatter;
      for (var j = 0, m = list.length; j < m; j++) { var q = list[j]; q.x = q.ox + q.dx0 * f; q.y = q.oy + q.dy0 * f; q.vx = q.vy = 0; }
      if (done) { assembled = true; entS = 1; signalFormed(); }
      return !done;
    }
    var R = cfg.radius, R2 = R * R, mx = mouse.x, my = mouse.y, act = mouse.active && (A === 0 || C === 1);
    var k = Math.min(dt / 16.67, 2), spring = SPRING * k, damp = Math.pow(DAMP, k);
    var gain = (1 + Math.min(mouse.speed / 30, 1.2)) * (isField ? 0.6 : 1);
    var moving = false;
    for (var i = 0, n = list.length; i < n; i++) {
      var p = list[i];
      var fx = (p.ox - p.x) * spring, fy = (p.oy - p.y) * spring;
      if (act) {
        var dx = p.x - mx, dy = p.y - my;
        if (dx > -R && dx < R && dy > -R && dy < R) {
          var d2 = dx * dx + dy * dy;
          if (d2 < R2) { var d = Math.sqrt(d2) || 0.001, f2 = (1 - d / R); f2 = f2 * f2 * 3.4 * k * gain; fx += (dx / d) * f2; fy += (dy / d) * f2; }
        }
      }
      p.vx = (p.vx + fx) * damp; p.vy = (p.vy + fy) * damp;
      p.x += p.vx; p.y += p.vy;
      var ex = p.x - p.ox, ey = p.y - p.oy, e2 = ex * ex + ey * ey;
      if (e2 > MAXD * MAXD) { var s = MAXD / Math.sqrt(e2); p.x = p.ox + ex * s; p.y = p.oy + ey * s; }
      if (!moving && (e2 > 0.02 || p.vx * p.vx + p.vy * p.vy > 0.0004)) moving = true;
    }
    return moving;
  }

  /* ---------- render ---------- */
  function draw(t) {
    var el = t0 ? t - t0 : T_TOTAL;
    var fade = reduce || assembled ? 1 : clamp01(el / T_FADE);
    var Z = reduce || assembled ? 1 : entS;
    var sf = reduce || assembled ? 0 : entScatter;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, VW, VH);
    if (!heroRect) readScroll();
    var hl = heroRect.left, ht = heroRect.top;
    var i, n, p, s2, px, py, ux, uy;

    // the hero's ambient field fades as the symbol lets go
    var fieldAlpha = fade * (1 - A);
    if (fieldAlpha > 0.02 && ht < VH && heroRect.bottom > 0) {
      for (i = 0, n = F.length; i < n; i++) {
        p = F[i]; s2 = p.s * Z; px = hl + cx + (p.x - cx) * Z; py = ht + cy + (p.y - cy) * Z;
        if (px < -s2 || px > VW + s2 || py < -s2 || py > VH + s2) continue;
        ctx.globalAlpha = p.a * fieldAlpha; ctx.drawImage(sprite(p.c, 1, p.s), px - s2, py - s2, s2 * 2, s2 * 2);
      }
    }

    var sl = slotRect ? slotRect.left : 0, stp = slotRect ? slotRect.top : 0;
    if (A >= 1 && C <= 0) { ctx.globalAlpha = 1; return; }                     // everything has fallen away
    var DROP = VH * 0.55;
    for (var pass = 0; pass < 2; pass++) {
      for (i = 0, n = P.length; i < n; i++) {
        p = P[i];
        if (pass === 0 ? p.a === 1 : p.a !== 1) continue;
        // where it would be in the hero (entrance scale and scatter included)
        ux = p.dx0 * sf; uy = p.dy0 * sf;
        var x = hl + cx + (p.x - ux - cx) * Z + ux, y = ht + cy + (p.y - uy - cy) * Z + uy, al = 1;
        if (C > 0 && slotRect) {
          // forming at the rules: each particle falls from above and lands in its place, the top rows first
          var p2 = clamp01(C * 1.6 - p.d2 * 0.6), w2 = easeOutCubic(p2);
          x = sl + (p.x - SX) + p.r3 * 90 * (1 - w2);
          y = stp + (p.y - SY) - (DROP + p.r1 * VH * 0.35) * (1 - w2);
          al = clamp01(p2 * 4);
        } else if (A > 0) {
          // leaving the hero: each particle lets go in turn and falls, the lower parts first
          var p1 = clamp01(A * 1.7 - p.d1 * 0.7);
          x += p.r3 * 120 * p1;
          y += (DROP + p.r1 * VH * 0.5) * p1 * p1;
          al = 1 - smooth(p1);
        }
        if (al <= 0.01) continue;
        s2 = p.s * Z;
        if (x < -s2 || x > VW + s2 || y < -s2 || y > VH + s2) continue;
        ctx.globalAlpha = (p.a === 1 ? 1 : p.a) * fade * al;
        ctx.drawImage(sprite(p.c, 1, p.s), x - s2, y - s2, s2 * 2, s2 * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  function streaming() { return false; }                 // the fall is scroll-driven; frames run on scroll
  function loop(t) {
    raf = null;
    var dt = lastT ? t - lastT : 16.67; lastT = t;
    mouse.speed *= 0.85;
    readScroll();
    var m1 = integrate(P, dt, t, false), m2 = integrate(F, dt, t, true);
    draw(t);
    if (m1 || m2 || mouse.active || !assembled || streaming()) raf = requestAnimationFrame(loop);
    else { running = false; lastT = 0; }
  }
  function start() { if (reduce || running) return; running = true; lastT = 0; if (!t0) t0 = performance.now(); raf = requestAnimationFrame(loop); }

  /* ---------- pointer / touch: repel wherever the symbol is formed ---------- */
  function setPointer(e) {
    if (!heroRect) readScroll();
    var nx, ny;
    if (A === 0) { nx = e.clientX - heroRect.left; ny = e.clientY - heroRect.top; }
    else if (C === 1 && slotRect) { nx = e.clientX - slotRect.left + SX; ny = e.clientY - slotRect.top + SY; }
    else { clearPointer(); return; }
    if (mouse.active) { var vx = nx - mouse.px, vy = ny - mouse.py; mouse.speed = Math.min(60, Math.sqrt(vx * vx + vy * vy)); }
    mouse.px = nx; mouse.py = ny; mouse.x = nx; mouse.y = ny; mouse.active = true; start();
  }
  function clearPointer() { mouse.active = false; mouse.x = mouse.y = -1e4; }
  if (!reduce) {
    document.addEventListener('pointermove', setPointer, { passive: true });
    document.addEventListener('pointerdown', setPointer, { passive: true });
    document.addEventListener('pointerup', clearPointer);
    document.addEventListener('pointercancel', clearPointer);
    document.addEventListener('pointerleave', clearPointer);
  }

  /* ---------- init, scroll, resize ---------- */
  function init() {
    if (!build()) { signalFormed(); return; }
    canvas.hidden = false;
    var mainEl = document.querySelector('main') || document.body;
    mainEl.insertBefore(canvas, mainEl.firstChild);       // one fixed layer inside main's stacking context, under all its content
    hero.classList.add('has-particles');
    document.documentElement.classList.add('part');       // hides the slot's fallback image
    if (reduce) {                                         // static: the hero logo, and the plain image stays in the slot
      document.documentElement.classList.remove('part');
      readScroll(); draw(performance.now());
      window.addEventListener('scroll', function () { readScroll(); A = 0; C = 0; draw(performance.now()); }, { passive: true });
      signalFormed();
      return;
    }
    window.addEventListener('scroll', function () { readScroll(); start(); }, { passive: true });
    start();
  }
  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { build(); readScroll(); draw(performance.now()); start(); }, 160);
  });
  hero.__state = function () { var s = 0; for (var i = 0; i < P.length; i++) { var dx = P[i].x - P[i].ox, dy = P[i].y - P[i].oy; s += dx * dx + dy * dy; } return { running: running, assembled: assembled, formed: formedSent, release: +A.toFixed(3), regroup: +C.toFixed(3), scale: +entS.toFixed(3), n: P.length, field: F.length, meanDisp: Math.sqrt(s / (P.length || 1)).toFixed(2), symbol: { x: SX, y: SY, w: SW, h: SH }, slot: slotRect ? { left: Math.round(slotRect.left), top: Math.round(slotRect.top), w: Math.round(slotRect.width), h: Math.round(slotRect.height) } : null }; };
  if (img.complete && img.naturalWidth) init(); else { img.addEventListener('load', init); }
})();
